#!/usr/bin/env node
/**
 * Keep index.html's preload list equal to what the first screen really needs.
 *
 * Without hints the browser finds the start-up code one step at a time: the
 * page names app.js, app.js names a dozen modules, boot asks for the question
 * list, and only then does the router ask for the home room. Each step is a
 * round trip, and on a phone that is where the first second goes. The
 * <link rel="modulepreload"> lines in index.html let it ask for all of them at
 * once, beside the stylesheet.
 *
 * A stale list fails quietly in both directions: a module missing from it is
 * just slow again, and one that is no longer used is downloaded for nothing.
 * So the list is computed here from the real imports and compared.
 *
 *   node tools/preloadcheck.mjs          check
 *   node tools/preloadcheck.mjs --print  print the lines index.html should have
 */

import fs from 'node:fs';
import path from 'node:path';

/* What the first screen runs: the shell, and the home room it opens on. */
const ENTRIES = ['assets/js/app.js', 'assets/js/rooms/home/room.js'];

/** Every file reached by static imports from the entries (not import()). */
export function startupModules(entries = ENTRIES) {
  const seen = new Set();
  const visit = (file) => {
    if (seen.has(file)) return;
    seen.add(file);
    const src = fs.readFileSync(file, 'utf8');
    for (const m of src.matchAll(/^\s*(?:import|export)\s(?:[^'";]*?\sfrom\s)?['"](\.{1,2}\/[^'"]+)['"]/gm)) {
      visit(path.posix.join(path.posix.dirname(file), m[1]));
    }
  };
  entries.forEach(visit);
  return [...seen];
}

const want = startupModules();
if (process.argv.includes('--print')) {
  want.forEach((f) => console.log(`<link rel="modulepreload" href="${f}">`));
  process.exit(0);
}

const html = fs.readFileSync('index.html', 'utf8');
const have = [...html.matchAll(/<link rel="modulepreload" href="([^"]+)">/g)].map((m) => m[1]);
const errors = [];
for (const f of want) if (!have.includes(f)) errors.push(`index.html does not preload ${f}, which the first screen imports`);
for (const f of have) {
  if (!want.includes(f)) errors.push(`index.html preloads ${f}, which the first screen no longer imports`);
  else if (!fs.existsSync(f)) errors.push(`index.html preloads ${f}, which does not exist`);
}
if (!/<link rel="preload" href="data\/manifest\.json" as="fetch" crossorigin>/.test(html)) {
  errors.push('index.html no longer preloads data/manifest.json, which boot waits for');
}

console.log(`${want.length} start-up modules, ${have.length} preloaded`);
if (errors.length) {
  console.log(`\nERRORS (${errors.length}):`);
  errors.forEach((m) => console.log(`  x ${m}`));
  process.exit(1);
}
console.log('\nNo errors.');
