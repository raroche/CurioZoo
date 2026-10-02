#!/usr/bin/env node
/**
 * Keep the rooms apart.
 *
 * app.js was once one 1,864-line file holding every screen, and later a router
 * that imported every room and a click handler that knew every button. Each
 * room now lives in its own folder and is loaded on demand from
 * rooms/registry.js. That is only worth anything if it stays that way, and the
 * ways it would quietly come undone are a cycle, a room reaching sideways into
 * another room, and a shared module reaching up into a room. All three are
 * easy to write and none fails at parse time: a cycle in ES modules gives you
 * `undefined` at call time, in one branch, on some route nobody clicked before
 * deploying; a sideways import drags one room's code into another's download.
 *
 *   modules/, vendor/, workers/, offline.js
 *                        may import only each other
 *   rooms/registry.js    may import modules, and load room.js files
 *   rooms/<id>/          may import modules, the registry, and its own folder
 *   app.js               may import modules and the registry
 *
 * Nothing may import app.js.
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'assets/js';
const ROOMS_DIR = `${ROOT}/rooms`;
const REGISTRY = `${ROOMS_DIR}/registry.js`;
const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

/* ---- collect the graph ---- */

const files = [];
const walk = (dir, ext, out) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, ext, out);
    else if (e.name.endsWith(ext)) out.push(full);
  }
  return out;
};
walk(ROOT, '.js', files);

/* Which room a file belongs to, or null. */
const roomOf = (f) => (f.startsWith(`${ROOMS_DIR}/`) && f !== REGISTRY
  ? f.slice(ROOMS_DIR.length + 1).split('/')[0] : null);
const layerOf = (f) => (f === `${ROOT}/app.js` ? 'app'
  : f === REGISTRY ? 'registry'
    : roomOf(f) ? 'rooms' : 'modules');

const staticGraph = new Map();
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  const resolve = (spec) => path.normalize(path.join(path.dirname(f), spec));
  const statics = [...src.matchAll(/^import\s[\s\S]*?from\s+'([^']+)';/gm)].map((m) => resolve(m[1]));
  /* Dynamic imports count for layering. A room loaded with import() to keep
     it off the critical path is still a dependency, and leaving it out would
     quietly exempt it from every rule here. */
  const dynamics = [...src.matchAll(/\bimport\(\s*'([^']+)'\s*\)/g)].map((m) => resolve(m[1]));
  staticGraph.set(f, statics);

  for (const [d, how] of [...statics.map((d) => [d, 'static']), ...dynamics.map((d) => [d, 'dynamic'])]) {
    if (!files.includes(d)) { err(`${f} imports ${d}, which does not exist`); continue; }
    const from = layerOf(f);
    const to = layerOf(d);
    if (to === 'app') err(`${f} imports app.js — nothing may depend on the shell`);
    if (from === 'modules' && (to === 'rooms' || to === 'registry')) {
      err(`${f} is a shared module but imports ${d}; modules must not know about rooms`);
    }
    if (from === 'rooms' && to === 'rooms' && roomOf(f) !== roomOf(d)) {
      err(`${f} reaches into another room (${d}). Rooms load separately; move what `
        + 'they share into modules/');
    }
    if (from === 'app' && to === 'rooms') {
      err(`app.js imports ${d} directly; rooms are loaded through rooms/registry.js`);
    }
    if (from === 'registry' && to === 'rooms' && (how !== 'dynamic' || !d.endsWith('/room.js'))) {
      err(`rooms/registry.js imports ${d}; it may only load a room's room.js, with import()`);
    }
  }
}

/* ---- cycles ----
   Static imports only. A cycle through import() cannot produce the undefined-
   at-call-time bug, because import() resolves after the whole module has run.
   The registry loads each room with import() and a room may read the registry
   back (the home page draws its cards from it), which is exactly that case. */

const state = new Map();
const stack = [];
const seenCycle = new Set();
function visit(f) {
  if (state.get(f) === 'done') return;
  if (state.get(f) === 'open') {
    const cycle = stack.slice(stack.indexOf(f)).concat(f)
      .map((x) => x.replace(`${ROOT}/`, '')).join(' -> ');
    if (!seenCycle.has(cycle)) { seenCycle.add(cycle); err(`import cycle: ${cycle}`); }
    return;
  }
  state.set(f, 'open');
  stack.push(f);
  for (const d of staticGraph.get(f) || []) if (files.includes(d)) visit(d);
  stack.pop();
  state.set(f, 'done');
}
files.forEach(visit);

/* ---- size, as a warning only ---- */

/* A vendored library is one thing by definition: it is somebody else's file,
   copied whole and replaced whole. Splitting it would mean editing it, which
   is exactly what must not happen, so the size rule does not apply. */
const isVendor = (f) => f.startsWith(`${ROOT}/vendor/`);
const LIMIT = 700;
for (const f of files.filter((x) => !isVendor(x))) {
  const n = fs.readFileSync(f, 'utf8').split('\n').length;
  if (n > LIMIT) warn(`${f} is ${n} lines; past ${LIMIT} it is probably two things`);
}

/* ---- every screen shown must exist, and in the right room ----
   showScreen() with an unknown name hides everything and shows nothing. It
   throws now, but throwing at runtime is still a page a child sees break, so
   the mismatch is caught here instead. That shipped once, as a blank capital
   game. A room may show its own screens and the two that index.html always
   has (home, error); another room's screen may not be on the page yet. */

const { REGISTRY: ENTRIES } = await import('../assets/js/rooms/registry.js');
const html = fs.readFileSync('index.html', 'utf8');
const screenIds = (text) => [...text.matchAll(/<section[^>]*\bid="screen-([a-z]+)"/g)].map((m) => m[1]);
const owner = new Map();    // screen name -> room id, or null for index.html
const markup = { 'index.html': html };
for (const id of screenIds(html)) owner.set(id, null);
for (const r of ENTRIES) {
  if (!r.screens) continue;
  const file = `${ROOMS_DIR}/${r.screens}`;
  if (!fs.existsSync(file)) continue;   // roomcheck reports it
  const text = fs.readFileSync(file, 'utf8');
  markup[file] = text;
  for (const id of screenIds(text)) {
    if (owner.has(id)) {
      err(`#screen-${id} is in ${file} and also in `
        + `${owner.get(id) ? `the ${owner.get(id)} room` : 'index.html'}`);
    }
    owner.set(id, r.id);
  }
}
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  for (const m of src.matchAll(/showScreen\('([a-z]+)'\)/g)) {
    const name = m[1];
    if (!owner.has(name)) {
      err(`${f} calls showScreen('${name}'), but no screen has id="screen-${name}" — `
        + 'that hides every screen and shows none');
    } else if (owner.get(name) && owner.get(name) !== roomOf(f)) {
      err(`${f} shows #screen-${name}, which belongs to the ${owner.get(name)} room `
        + 'and is not on the page until that room is opened');
    }
  }
}

/* ---- every element the code reaches for must exist in the markup ----
   Removing the top-bar back button left a listener bound to it. $('#gp-back')
   returned null, addEventListener threw during boot, and the whole app died
   before it drew anything: a blank page with one console line. The element was
   gone from index.html and nothing checked that the code had let go of it. */
const known = new Set();
for (const text of Object.values(markup)) {
  for (const m of text.matchAll(/\sid="([^"]+)"/g)) known.add(m[1]);
}
/* Plenty of ids are created by the JS itself, so those count too. What must
   not happen is reaching for an id that exists in neither place. */
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  for (const m of src.matchAll(/\bid="([A-Za-z][\w-]*)"/g)) known.add(m[1]);
}
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  for (const m of src.matchAll(/\$\('#([A-Za-z][\w-]*)'\)/g)) {
    if (!known.has(m[1])) err(`${f} reaches for #${m[1]}, which nothing creates`);
  }
}

/* ---- report ---- */

const byLayer = { app: 0, registry: 0, rooms: 0, modules: 0 };
let total = 0;
for (const f of files) {
  const n = fs.readFileSync(f, 'utf8').split('\n').length;
  byLayer[layerOf(f)] += n;
  total += n;
}
console.log(`${files.length} files, ${total} lines — app ${byLayer.app}, `
  + `registry ${byLayer.registry}, rooms ${byLayer.rooms}, modules ${byLayer.modules}`);

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
