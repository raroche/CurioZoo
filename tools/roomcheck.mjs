#!/usr/bin/env node
/**
 * Check the room registry against the things it depends on.
 *
 * Phase 2 moved the home page from hand-written markup to a list, which is
 * only a win if a wrong entry fails loudly. Every bug this catches is one that
 * actually happened while building it: a creature whose ears were hidden and
 * so was indistinguishable from another room's, a hue with no CSS class, and a
 * room banner painted in the brand orange because the component declared its
 * own colour defaults after the hue classes and quietly won.
 */

import fs from 'node:fs';

const CSS = 'assets/css/design-system.css';
const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

const { CREATURES, creature, roomCard } = await import('../assets/js/modules/sections.js');
const { REGISTRY, ROOMS } = await import('../assets/js/rooms/registry.js');
const ROOMS_DIR = 'assets/js/rooms';
const registrySrc = fs.readFileSync(`${ROOMS_DIR}/registry.js`, 'utf8');
const css = fs.readFileSync(CSS, 'utf8');

/* ---- every room is complete and unique ---- */

const ids = new Set();
const hues = new Set();
for (const [i, r] of ROOMS.entries()) {
  const where = `room ${i + 1} (${r.id || '?'})`;
  for (const key of ['id', 'name', 'hue', 'creature', 'href', 'status', 'blurb', 'meta']) {
    if (!r[key]) err(`${where}: missing "${key}"`);
  }
  if (ids.has(r.id)) err(`${where}: duplicate id`);
  ids.add(r.id);
  hues.add(r.hue);

  if (!['live', 'soon'].includes(r.status)) err(`${where}: status must be live or soon`);
  if (!CREATURES.includes(r.creature)) {
    err(`${where}: no creature called "${r.creature}" (have: ${CREATURES.join(', ')})`);
  }
  if (!/^#\//.test(r.href)) err(`${where}: href "${r.href}" is not a hash route`);
  if (r.blurb.length > 90) warn(`${where}: blurb is ${r.blurb.length} chars; it wraps past two lines`);
}

/* ---- every room's code is where the registry says ----
   A room is loaded only when a child opens it, so a wrong path here is not a
   build error or a console line on the home page. It is a room that says
   "could not be loaded" the first time anybody taps it. */
const routeOwner = new Map();
for (const r of REGISTRY) {
  const where = `registry entry "${r.id || '?'}"`;
  if (!r.id || !/^[a-z]+$/.test(r.id)) err(`${where}: id must be lower-case letters`);
  if (!Array.isArray(r.routes) || !r.routes.length) err(`${where}: no routes`);
  for (const head of r.routes || []) {
    if (routeOwner.has(head)) err(`${where}: route '${head}' is also claimed by "${routeOwner.get(head)}"`);
    routeOwner.set(head, r.id);
  }
  if (typeof r.code !== 'function') err(`${where}: no code() to load it`);
  if (typeof r.back !== 'function') err(`${where}: no back() rule`);
  /* The folder is named after the room, so a room's files are where a
     person would look for them. */
  if (!registrySrc.includes(`import('./${r.id}/room.js')`)) {
    err(`${where}: code() must be () => import('./${r.id}/room.js')`);
  }
  const roomJs = `${ROOMS_DIR}/${r.id}/room.js`;
  if (!fs.existsSync(roomJs)) err(`${where}: ${roomJs} is missing`);
  else if (!/export (async )?function render\b|export const render\b/.test(fs.readFileSync(roomJs, 'utf8'))) {
    err(`${roomJs} does not export render(parts), so the room can never be drawn`);
  }
  for (const key of ['screens', 'css']) {
    if (!r[key]) continue;
    if (!r[key].startsWith(`${r.id}/`)) err(`${where}: ${key} "${r[key]}" is outside the room's own folder`);
    if (!fs.existsSync(`${ROOMS_DIR}/${r[key]}`)) err(`${where}: ${key} file ${ROOMS_DIR}/${r[key]} is missing`);
  }
  /* A card has to lead to its own room, not to somebody else's. */
  if (r.href && r.status === 'live') {
    const head = r.href.replace(/^#\//, '').split('/')[0];
    if (!(r.routes || []).includes(head)) err(`${where}: its card links to ${r.href}, which is not one of its routes`);
  }
}
if (!routeOwner.has('home')) err('no room answers #/home');

/* ---- two rooms must not look alike ---- */

const seenCreature = new Map();
const seenHue = new Map();
for (const r of ROOMS.filter((x) => x.status === 'live')) {
  if (seenCreature.has(r.creature)) {
    err(`"${r.id}" and "${seenCreature.get(r.creature)}" both use the ${r.creature}: `
      + 'two live rooms cannot share a creature');
  }
  seenCreature.set(r.creature, r.id);
  if (seenHue.has(r.hue)) {
    err(`"${r.id}" and "${seenHue.get(r.hue)}" are both ${r.hue}`);
  }
  seenHue.set(r.hue, r.id);
}

/* ---- the stylesheet has to know about every hue ---- */

for (const hue of hues) {
  for (const suffix of ['', '-soft', '-line', '-ink']) {
    if (!css.includes(`--cz-${hue}${suffix}:`)) err(`no --cz-${hue}${suffix} token in ${CSS}`);
  }
  if (!css.includes(`.cz-tile--${hue}`)) err(`no .cz-tile--${hue} class in ${CSS}`);
}

/* ---- a room's own colour must not be declared after the hue classes ----
   Equal specificity means the later rule wins, so a component that sets its
   own --room default below the hue block silently overrides every room. */
const hueAt = css.indexOf('.cz-tile--mango');
for (const comp of ['.cz-roomhead', '.cz-welcome']) {
  const at = css.indexOf(comp + ' {');
  if (at > hueAt && at !== -1 && /--room(-soft|-line|-ink)?:/.test(css.slice(at, css.indexOf('}', at)))) {
    err(`${comp} declares its own --room* after the hue classes, so it overrides every room`);
  }
}

/* ---- a creature has to be visible, not hidden behind the eyes ----
   The eye disc covers x 10.5..53.5 and y 16..38. A feature drawn only inside
   that box cannot be seen, which is how three rooms once showed one animal. */
const outsideEyes = (svg) => {
  const ys = [...svg.matchAll(/(?:cy|y)="(-?[\d.]+)"/g)].map((m) => Number(m[1]));
  const pathTops = [...svg.matchAll(/[ML]\s*-?[\d.]+\s+(-?[\d.]+)/g)].map((m) => Number(m[1]));
  return [...ys, ...pathTops].some((v) => v < 16);
};
for (const kind of CREATURES) {
  const svg = creature(kind);
  if (!outsideEyes(svg)) err(`creature "${kind}" draws nothing above y=16, so its ears are hidden`);
}

/* ---- the card markup a room produces ---- */
for (const r of ROOMS) {
  const html = roomCard(r);
  if (r.status === 'live' && !html.includes(`href="${r.href}"`)) err(`${r.id}: card is not a link`);
  if (r.status === 'soon' && html.includes('href=')) err(`${r.id}: a "soon" room must not be clickable`);
  if (!html.includes(`cz-tile--${r.hue}`)) err(`${r.id}: card is missing its hue class`);
}

/* ---- report ---- */

console.log(`${ROOMS.length} rooms (${ROOMS.filter((r) => r.status === 'live').length} live), `
  + `${CREATURES.length} creatures, ${hues.size} hues in use`);

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
