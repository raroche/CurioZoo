#!/usr/bin/env node
/**
 * The offline copy: the list of files sw.js saves on the device.
 *
 *   node tools/offline.mjs              check only (part of npm run verify)
 *   node tools/offline.mjs --stamp      write the version and list into sw.js
 *   node tools/offline.mjs --out dist   copy the site into dist/, stamped,
 *                                       to try offline on a laptop:
 *                                       python3 tools/serve.py 8766 dist
 *   ... --minify                        with --stamp or --out: serve the
 *                                       stylesheets minified (tools/minify.mjs),
 *                                       and hash what is served
 *
 * The deploy runs --stamp on Netlify's own copy of the repository, so the
 * stamped sw.js is published and never committed. Committing it would mean
 * every edit to any question also had to regenerate a file, and the one time
 * somebody forgot, families would keep the old questions forever.
 *
 * What is saved is everything the site can load: index.html, the web app
 * manifest, and every file under assets/ and data/. Nothing is picked by hand,
 * so a new room's files are offline the moment they exist. The cost of that is
 * size, so this also holds the total under a budget a phone can carry.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';
import { minifyCss } from './minify.mjs';

const SW = 'sw.js';
const ROOT_FILES = ['index.html', 'manifest.webmanifest'];
const DIRS = ['assets', 'data'];
/* About 16MB today, 4MB over the wire. Past this, saving the whole site on a
   phone stops being a reasonable thing to do without asking first. */
const BUDGET_MB = 60;
const WARN_MB = 40;

const VERSION_LINE = "const VERSION = 'dev';";
const FILES_LINE = 'const FILES = [];';

const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

/** Every file the site can load, as paths relative to the site root. */
export function siteFiles(root = '.') {
  const out = ROOT_FILES.filter((f) => fs.existsSync(path.join(root, f)));
  const walk = (dir) => {
    for (const e of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
      /* .DS_Store and friends: never site content. */
      if (e.name.startsWith('.')) continue;
      const rel = `${dir}/${e.name}`;
      if (e.isDirectory()) walk(rel);
      else out.push(rel);
    }
  };
  DIRS.forEach(walk);
  return out.sort();
}

const hashOf = (buf) => crypto.createHash('sha256').update(buf).digest('hex').slice(0, 16);

/** A file as it will be served: stylesheets minified when `minify` is on. */
export function contentOf(f, root = '.', minify = false) {
  const buf = fs.readFileSync(path.join(root, f));
  return minify && f.endsWith('.css') ? Buffer.from(minifyCss(buf.toString('utf8'))) : buf;
}

/** [[path, hash], ...] and a version that changes when any file does. */
export function buildList(root = '.', minify = false) {
  const files = siteFiles(root).map((f) => {
    const buf = contentOf(f, root, minify);
    return { path: f, hash: hashOf(buf), size: buf.length };
  });
  /* The worker's own code counts too: a fix to sw.js alone has to reach
     families as a new version, not slip in under the old one's name. */
  const sw = path.join(root, SW);
  const own = fs.existsSync(sw) ? hashOf(fs.readFileSync(sw)) : '';
  const version = hashOf(files.map((f) => `${f.path}:${f.hash}`).concat(`${SW}:${own}`).join('\n')).slice(0, 12);
  return { files, version };
}

/** sw.js with the placeholders filled in. */
export function stampWorker(source, { files, version }) {
  const list = JSON.stringify(files.map((f) => [f.path, f.hash]));
  return source
    .replace(VERSION_LINE, `const VERSION = '${version}';`)
    .replace(FILES_LINE, `const FILES = ${list};`);
}

function main() {
  const args = process.argv.slice(2);
  const outAt = args.indexOf('--out');
  const out = outAt === -1 ? null : args[outAt + 1];
  const stampInPlace = args.includes('--stamp');
  const minify = args.includes('--minify');

  if (!fs.existsSync(SW)) err(`${SW} is missing, so the site cannot work offline`);
  const source = fs.existsSync(SW) ? fs.readFileSync(SW, 'utf8') : '';
  /* Each placeholder exactly once: a second copy would be stamped too, and a
     missing one means the worker never learns its version. */
  for (const line of [VERSION_LINE, FILES_LINE]) {
    const n = source.split(line).length - 1;
    if (n !== 1) err(`${SW}: expected "${line}" once, found it ${n} times`);
  }

  const list = buildList('.', minify);
  /* The worker is a plain script, not a module, and a syntax error in it
     fails silently: no offline copy, no message. Parse it, stamped too. */
  for (const [what, code] of [['as written', source], ['stamped', stampWorker(source, list)]]) {
    try { new vm.Script(code, { filename: SW }); } catch (e) { err(`${SW} (${what}): ${e.message}`); }
  }
  const total = list.files.reduce((s, f) => s + f.size, 0);
  const mb = total / 1024 / 1024;
  if (mb > BUDGET_MB) err(`the offline copy is ${mb.toFixed(1)}MB, over the ${BUDGET_MB}MB budget`);
  else if (mb > WARN_MB) warn(`the offline copy is ${mb.toFixed(1)}MB; the budget is ${BUDGET_MB}MB`);
  if (!list.files.some((f) => f.path === 'index.html')) err('index.html is not in the offline copy');

  /* Every file the page links to by a plain path has to be in the copy, or
     the page opens on the plane without its stylesheet. */
  const html = fs.readFileSync('index.html', 'utf8');
  const listed = new Set(list.files.map((f) => f.path));
  for (const m of html.matchAll(/(?:href|src)="([^"#:]+)"/g)) {
    const ref = m[1].replace(/^\.\//, '');
    if (!listed.has(ref)) err(`index.html loads ${ref}, which is not in the offline copy`);
  }

  if (!errors.length && stampInPlace) {
    /* Netlify's own copy only: the stylesheets as they are hashed. */
    if (minify) for (const f of list.files) if (f.path.endsWith('.css')) fs.writeFileSync(f.path, contentOf(f.path, '.', true));
    fs.writeFileSync(SW, stampWorker(source, list));
  }
  if (!errors.length && out) {
    fs.rmSync(out, { recursive: true, force: true });
    for (const f of list.files) {
      fs.mkdirSync(path.join(out, path.dirname(f.path)), { recursive: true });
      fs.writeFileSync(path.join(out, f.path), contentOf(f.path, '.', minify));
    }
    fs.writeFileSync(path.join(out, SW), stampWorker(source, list));
  }

  console.log(`${list.files.length} files, ${mb.toFixed(1)}MB, version ${list.version}`
    + (minify ? '; CSS minified' : '') + (stampInPlace ? `; ${SW} stamped` : '') + (out ? `; copied to ${out}/` : ''));
  if (warnings.length) {
    console.log(`\nwarnings (${warnings.length}):`);
    warnings.forEach((m) => console.log(`  ! ${m}`));
  }
  if (errors.length) {
    console.log(`\nERRORS (${errors.length}):`);
    errors.forEach((m) => console.log(`  x ${m}`));
    process.exit(1);
  }
  console.log('\nNo errors.');
}

if (import.meta.url === `file://${process.argv[1]}`) main();
