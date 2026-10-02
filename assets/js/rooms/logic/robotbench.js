/**
 * rooms/logic/robotbench.js — the robot's workbench, shared by Robot Path and
 * Fix the Bug: the board, the program editor, and running it.
 *
 * The editor is tap-first, with no dragging (small hands, and Blockly would
 * be 100 KB and a CSP audit). A program is rows of tiles: Main, and the
 * helper rows the level allows, each with a slot limit shown as "7 of 10
 * tiles"; the limit is the puzzle. A caret (the blinking bar) marks where the
 * next tile goes. Repeat, If and Until are brackets with their own inside;
 * tapping a bracket's head puts the caret inside, tapping its end puts the
 * caret after it. A tapped tile is selected, and a small toolbar offers what
 * makes sense for it: remove, more or fewer times, what an If checks, where a
 * painted tile works.
 *
 * Running shows the robot moving one event at a time, the running tile
 * outlined with ▶, and "2 of 3" on a running Repeat. A failure stops the
 * robot where it went wrong and marks the tile that did it with a bug.
 */

import * as V from '../../modules/robotvm.js';
import { animalById } from '../../modules/zooart.js';
import { OP_ICON, rb } from '../../modules/robottext.js';
import { hash } from '../../modules/logicrng.js';
import { esc } from './frame.js';

const CELL = 56;
const enc = (path) => path.join('.');
const dec = (s) => s.split('.').map((p) => (/^\d+$/.test(p) ? Number(p) : p));
const same = (a, b) => a && b && a.length === b.length && a.every((x, i) => x === b[i]);

/* ------------------------------------------------------------------ */
/* The robot levels                                                    */
/* ------------------------------------------------------------------ */

const banks = new Map();

/** A level's robot bank, fetched once and shared by Robot Path and Fix the Bug. */
export async function robotBank(level) {
  if (!banks.has(level)) {
    banks.set(level, fetch(`data/logic/robot/${level}.json`, { cache: 'no-cache' }).then((res) => {
      if (!res.ok) throw new Error(`Could not load the ${level} robot levels`);
      return res.json();
    }));
    banks.get(level).catch(() => banks.delete(level));
  }
  return banks.get(level);
}

/* ------------------------------------------------------------------ */
/* A bench                                                             */
/* ------------------------------------------------------------------ */

export function makeBench(level, prog = null) {
  const rows = V.ROWS.filter((r) => level.slots[r] !== undefined);
  const empty = Object.fromEntries(rows.map((r) => [r, []]));
  return {
    level, rows, prog: prog ? V.clone(prog) : empty,
    caret: { path: ['main'], index: prog ? (prog.main || []).length : 0 }, sel: null, undo: [],
    runner: null, bug: null, speed: 360, msg: null, locked: false
  };
}

export const rowSize = (b, r) => V.sizeOf(b.prog[r]);
export const benchSize = (b) => b.rows.reduce((s, r) => s + rowSize(b, r), 0);

/* ------------------------------------------------------------------ */
/* The board                                                           */
/* ------------------------------------------------------------------ */

const SCENERY = ['🌳', '🪨', '🌵', '🌲', '💧', '🌿'];

const DEFS = `<defs>
  <pattern id="cz-rb-o" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
    <rect width="4" height="8" fill="#E06A1F" fill-opacity=".55"/></pattern>
  <pattern id="cz-rb-b" width="9" height="9" patternUnits="userSpaceOnUse">
    <circle cx="4.5" cy="4.5" r="2.3" fill="#2F6FB5" fill-opacity=".6"/></pattern>
</defs>`;

/** Where the robot is and who is fed, at the runner's current event. */
function scene(b) {
  const r = b.runner;
  const [sx, sy, sd] = b.level.start;
  if (!r || r.at < 0) return { x: sx, y: sy, dir: sd, fed: new Set(), ev: null };
  const fed = new Set();
  for (let i = 0; i <= r.at; i++) if (r.events[i].k === 'feed') fed.add(r.events[i].animal);
  const e = r.events[r.at];
  return { x: e.x, y: e.y, dir: e.dir, fed, ev: e };
}

/**
 * The board in words, for a screen reader: its size, the robot's square and
 * heading, every row's path squares, and every animal. Columns and rows
 * count from 1, rows from the top.
 */
export function boardWords(b, L) {
  const lv = b.level;
  const rows = lv.cells.split('/');
  const s = scene(b);
  const cap = (x) => x.charAt(0).toUpperCase() + x.slice(1);
  const out = [rb('sr.board', L, { w: rows[0].length, h: rows.length }),
    rb('sr.robot', L, { x: s.x + 1, y: s.y + 1, dir: rb(`dir.${s.dir}`, L) })];
  rows.forEach((row, y) => {
    const cols = [...row].map((v, x) => (v === '#' ? null : v === 'o' || v === 'b' ? `${x + 1} (${rb(`sr.${v}`, L)})` : `${x + 1}`)).filter(Boolean);
    const k = cols.length > 1 ? 'sr.row' : cols.length ? 'sr.row1' : 'sr.rowNone';
    out.push(rb(k, L, { y: y + 1, cols: cols.join(', ') }));
  });
  lv.animals.forEach(([x, y, kind], i) => {
    const a = animalById(kind);
    out.push(rb(s.fed.has(i) ? 'sr.fed' : 'sr.animal', L, { animal: cap(L === 'es' ? a.es.n : a.en), x: x + 1, y: y + 1 }));
  });
  return out;
}

/** The board. `marks` (Fix the Bug's "where will it stop?") are tappable squares. */
export function boardSvg(b, L, marks = null) {
  const lv = b.level;
  const rows = lv.cells.split('/');
  const W = rows[0].length * CELL;
  const H = rows.length * CELL;
  const s = scene(b);
  const cells = rows.map((row, y) => [...row].map((v, x) => {
    const X = x * CELL;
    const Y = y * CELL;
    if (v === '#') {
      const e = SCENERY[hash(lv.cells, x, y) % SCENERY.length];
      return `<rect class="cz-rb-wall" x="${X}" y="${Y}" width="${CELL}" height="${CELL}"/>
        <text class="cz-rb-scenery" x="${X + CELL / 2}" y="${Y + CELL / 2 + 8}">${e}</text>`;
    }
    const pad = v === 'o' || v === 'b' ? `<rect x="${X + 2}" y="${Y + 2}" width="${CELL - 4}" height="${CELL - 4}" rx="6" fill="url(#cz-rb-${v})"/>` : '';
    return `<rect class="cz-rb-path${v === 'o' ? ' is-o' : v === 'b' ? ' is-b' : ''}" x="${X + 1}" y="${Y + 1}" width="${CELL - 2}" height="${CELL - 2}" rx="7"/>${pad}`;
  }).join('')).join('');
  const animals = lv.animals.map(([x, y, kind], i) => {
    const a = animalById(kind);
    const fed = s.fed.has(i);
    return `<g class="cz-rb-animal${fed ? ' is-fed' : ''}" role="img" aria-label="${esc(L === 'es' ? a.es.n : a.en)}${fed ? ' ✓' : ''}">
      <text x="${x * CELL + CELL / 2}" y="${y * CELL + CELL / 2 + 10}">${a.emoji}</text>
      ${fed ? `<text class="cz-rb-fed" x="${x * CELL + CELL - 10}" y="${y * CELL + 16}">✓</text>` : ''}
    </g>`;
  }).join('');
  const cx = s.x * CELL + CELL / 2;
  const cy = s.y * CELL + CELL / 2;
  const ahead = lv.abs ? '' : `<path class="cz-rb-ahead" d="M ${-8} ${-30} L 0 ${-40} L 8 ${-30}" transform="translate(${cx} ${cy}) rotate(${s.dir * 90})"/>`;
  const bump = s.ev && (s.ev.k === 'bump' || s.ev.k === 'nothing') ? `<text class="cz-rb-ouch" x="${cx + 14}" y="${cy - 14}">${s.ev.k === 'bump' ? '💥' : '❓'}</text>` : '';
  const robot = `<g class="cz-rb-robot" transform="translate(${cx} ${cy}) rotate(${s.dir * 90})">
      <path class="cz-rb-nose" d="M -8 -15 L 0 -27 L 8 -15 Z"/>
      <circle class="cz-rb-body" r="17"/>
      <circle cx="-6" cy="-4" r="4" fill="#FFFFFF"/><circle cx="6" cy="-4" r="4" fill="#FFFFFF"/>
      <circle cx="-6" cy="-5" r="1.8" fill="#2B2926"/><circle cx="6" cy="-5" r="1.8" fill="#2B2926"/>
    </g>`;
  const picks = (marks || []).map(([mx, my, state], i) => `<g class="cz-rb-mark${state ? ` is-${state}` : ''}" data-rb-mark="${i}"
      role="button" tabindex="0" aria-label="${esc(rb('sr.mark', L, { n: i + 1, x: mx + 1, y: my + 1 }))}">
      <circle cx="${mx * CELL + CELL / 2}" cy="${my * CELL + CELL / 2}" r="${CELL / 2 - 5}"/>
      <text x="${mx * CELL + CELL / 2}" y="${my * CELL + CELL / 2 + 6}">${i + 1}</text></g>`).join('');
  /* The picture is hidden from screen readers, which get the same board in
     words; the "where will it stop?" squares stay reachable as buttons. */
  const words = boardWords(b, L).map((w) => `<li>${esc(w)}</li>`).join('');
  return `<div class="cz-br-wrap"><ul class="gp-sr-only">${words}</ul>
    <svg class="cz-rb-svg" viewBox="0 0 ${W} ${H}" role="group" aria-label="${esc(rb(lv.abs ? 'askAbs' : 'askRel', L))}">
    <g aria-hidden="true">${DEFS}${cells}${animals}${ahead}${robot}${bump}</g>${picks}</svg></div>`;
}

/* ------------------------------------------------------------------ */
/* The program                                                         */
/* ------------------------------------------------------------------ */

/* The caret is a bar to the eye and a sentence to a screen reader. */
const caret = (L) => `<span class="cz-rb-caret"><span class="gp-sr-only">${esc(rb('caretHere', L))}</span></span>`;

function tileLabel(c, L) {
  if (c.op === 'call') return rb(`op.${c.p}`, L);
  if (c.op === 'rep') return `${rb('op.rep', L)} ${rb('times', L, { n: c.n })}`;
  if (c.op === 'if') return `${rb('op.if', L)} ${rb(`cond.${c.cond}`, L)}`;
  const base = rb(`op.${c.op}`, L);
  return c.c ? `${base}, ${rb(`paint.${c.c}`, L)}` : base;
}

function tileHtml(b, c, path, L) {
  const p = enc(path);
  const sel = same(b.sel, path) ? ' is-selected' : '';
  const now = b.runner && b.runner.at >= 0 && same(b.runner.events[b.runner.at].at, path) ? ' is-running' : '';
  const bug = same(b.bug, path) ? ' is-bug' : '';
  const paint = c.c ? ` is-paint-${c.c}` : '';
  const label = esc(tileLabel(c, L));
  if (c.op === 'rep' || c.op === 'until' || c.op === 'if') {
    const count = c.op === 'rep' && b.runner && b.runner.loops && b.runner.loops[p] ? ` · ${b.runner.loops[p].join('/')}` : '';
    const head = c.op === 'rep' ? `${OP_ICON.rep} ×${c.n}${count}` : c.op === 'until' ? `${OP_ICON.until}` : `${OP_ICON.if} ${esc(rb(`cond.${c.cond}`, L))}`;
    const inner = (key) => `<span class="cz-rb-inner" data-rb-into="${enc([...path, key])}">${listHtml(b, c[key] || [], [...path, key], L)}</span>`;
    return `<span class="cz-rb-box cz-rb-box--${c.op}${sel}${now}${bug}">
      <button type="button" class="cz-rb-head" data-rb-tile="${p}" aria-label="${label}">${head}</button>
      ${inner(c.op === 'if' ? 'then' : 'body')}
      ${c.op === 'if' ? `<button type="button" class="cz-rb-else" data-rb-into="${enc([...path, 'else'])}"
        aria-label="${esc(rb('putElse', L))}">${esc(rb('else', L))}</button>${inner('else')}` : ''}
      <button type="button" class="cz-rb-end" data-rb-after="${p}" aria-label="${esc(rb('endOf', L, { what: tileLabel(c, L) }))}">⟧</button>
    </span>`;
  }
  const icon = c.op === 'call' ? OP_ICON[c.p] : OP_ICON[c.op];
  return `<button type="button" class="cz-rb-tile${sel}${now}${bug}${paint}" data-rb-tile="${p}" aria-label="${label}">${icon}</button>`;
}

function listHtml(b, list, path, L) {
  const here = (i) => !b.locked && b.caret && same(b.caret.path, path) && b.caret.index === i;
  let out = '';
  list.forEach((c, i) => { if (here(i)) out += caret(L); out += tileHtml(b, c, [...path, i], L); });
  if (here(list.length)) out += caret(L);
  return out;
}

export function editorHtml(b, L, { palette = true } = {}) {
  const rows = b.rows.map((r) => {
    const n = rowSize(b, r);
    const m = b.level.slots[r];
    return `<div class="cz-rb-row${n > m ? ' is-over' : ''}">
      <button type="button" class="cz-rb-rowname" data-rb-row="${r}">${r === 'main' ? '▶' : OP_ICON[r]} ${esc(rb(`row.${r}`, L))}
        <small>${esc(rb('slots', L, { n, m }))}</small></button>
      <div class="cz-rb-list" data-rb-into="${r}">${listHtml(b, b.prog[r], [r], L)}</div>
    </div>`;
  }).join('');
  const sel = b.sel ? V.tileAt(b.prog, b.sel) : null;
  const tools = sel && !b.locked ? `<div class="cz-rb-tools" role="toolbar">
      <span class="cz-rb-toolname">${esc(tileLabel(sel, L))}</span>
      ${sel.op === 'rep' ? `<button type="button" class="gp-btn gp-btn--ghost" data-action="rb-fewer">− ${esc(rb('fewer', L))}</button>
        <button type="button" class="gp-btn gp-btn--ghost" data-action="rb-more">+ ${esc(rb('more', L))}</button>` : ''}
      ${sel.op === 'if' ? `<button type="button" class="gp-btn gp-btn--ghost" data-action="rb-cond">${esc(rb('nextCond', L))}</button>` : ''}
      ${b.level.colours && ['F', 'TL', 'TR', 'FEED'].includes(sel.op) ? `<button type="button" class="gp-btn gp-btn--ghost" data-action="rb-paint">🎨 ${esc(rb('nextPaint', L))}</button>` : ''}
      ${sel.op === 'TL' || sel.op === 'TR' ? `<button type="button" class="gp-btn gp-btn--ghost" data-action="rb-flip">⇄ ${esc(rb('flipTurn', L))}</button>` : ''}
      <button type="button" class="gp-btn gp-btn--ghost" data-action="rb-remove">✕ ${esc(rb('remove', L))}</button>
    </div>` : '';
  const pal = palette && !b.locked ? `<div class="cz-rb-palette" role="group" aria-label="${esc(rb('paletteLabel', L))}">
      ${b.level.palette.filter((op) => op !== 'h2' || b.rows.includes('h2')).filter((op) => op !== 'h1' || b.rows.includes('h1')).map((op) => `<button type="button" class="cz-rb-pal" data-rb-pal="${op}">
        <span aria-hidden="true">${OP_ICON[op]}</span><small>${esc(rb(`op.${op}`, L))}</small></button>`).join('')}
      <button type="button" class="cz-rb-pal is-quiet" data-action="rb-del"><span aria-hidden="true">⌫</span><small>${esc(rb('deleteBack', L))}</small></button>
      <button type="button" class="cz-rb-pal is-quiet" data-action="rb-undo" ${b.undo.length ? '' : 'disabled'}><span aria-hidden="true">↶</span><small>${esc(rb('undo', L))}</small></button>
    </div>` : '';
  return `<div class="cz-rb-editor">${rows}${tools}${pal}</div>`;
}

export function runBar(b, L) {
  const r = b.runner;
  const running = r && r.timer;
  return `<div class="cz-code-actions cz-rb-runbar">
    <button type="button" class="gp-btn gp-btn--primary gp-btn--big" data-action="rb-run" ${running ? 'disabled' : ''}>▶ ${esc(rb('run', L))}</button>
    <button type="button" class="gp-btn gp-btn--ghost" data-action="rb-step" ${running ? 'disabled' : ''}>⏭ ${esc(rb('step', L))}</button>
    <button type="button" class="gp-btn gp-btn--ghost" data-action="rb-reset">⟲ ${esc(rb('reset', L))}</button>
    <button type="button" class="gp-btn gp-btn--ghost" data-action="rb-speed">${b.speed > 200 ? '🐇' : '🐢'} ${esc(rb(b.speed > 200 ? 'fast' : 'slow', L))}</button>
  </div>`;
}

/* ------------------------------------------------------------------ */
/* Drawing it, keeping the keyboard's place                            */
/* ------------------------------------------------------------------ */

/* What a focused control is, by its data attribute, so the same control can
   be found again after the bench is drawn anew. */
const FOCUS_KEYS = ['rbPal', 'rbTile', 'rbAfter', 'rbRow', 'rbInto', 'rbMark', 'trHouse', 'action'];
const attrOf = (k) => `data-${k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}`;

/**
 * Put `html` in `host`. Whatever had the keyboard focus gets it back: the
 * same palette tile after adding one, the same tile after selecting it. If
 * that control is gone (a removed tile) or off (Run while running), the
 * Main row takes the focus, so it never falls out to the page.
 */
export function renderInto(host, html) {
  const el = document.activeElement;
  let key = null;
  if (el && el !== document.body && host.contains(el)) key = FOCUS_KEYS.find((k) => el.dataset && el.dataset[k] !== undefined);
  const val = key ? el.dataset[key] : null;
  host.innerHTML = html;
  if (!key) return;
  const again = host.querySelector(`[${attrOf(key)}="${CSS.escape(val)}"]`);
  const to = again && !again.disabled ? again
    : host.querySelector('[data-action="rb-reset"]') || host.querySelector('[data-rb-row="main"]');
  if (to) to.focus({ preventScroll: true });
}

/* ------------------------------------------------------------------ */
/* Editing                                                             */
/* ------------------------------------------------------------------ */

const snapshot = (b) => { b.undo.push(JSON.stringify(b.prog)); if (b.undo.length > 60) b.undo.shift(); };

function newTile(op) {
  switch (op) {
    case 'rep': return { op: 'rep', n: 2, body: [] };
    case 'if': return { op: 'if', cond: 'ahead', then: [], else: [] };
    case 'until': return { op: 'until', body: [] };
    case 'h1': case 'h2': return { op: 'call', p: op };
    default: return { op };
  }
}

/** Insert a tile at the caret. Returns false (and why) if it does not fit. */
export function insert(b, op) {
  const row = b.caret.path[0];
  const tile = newTile(op);
  if (rowSize(b, row) + 1 > b.level.slots[row]) return 'rowFull';
  snapshot(b);
  const list = V.listAt(b.prog, b.caret.path);
  list.splice(b.caret.index, 0, tile);
  const at = [...b.caret.path, b.caret.index];
  b.sel = null;
  if (tile.body || tile.then) b.caret = { path: [...at, tile.then ? 'then' : 'body'], index: 0 };
  else b.caret = { path: b.caret.path, index: b.caret.index + 1 };
  b.bug = null;
  return null;
}

export function removeAt(b, path) {
  snapshot(b);
  const list = V.listAt(b.prog, path.slice(0, -1));
  list.splice(path[path.length - 1], 1);
  b.caret = { path: path.slice(0, -1), index: path[path.length - 1] };
  b.sel = null;
  b.bug = null;
}

/** Handle a click inside the bench. Returns a message key, true, or false. */
export function benchClick(b, ev) {
  if (b.locked) return false;
  const q = (s) => ev.target.closest(s);
  let el;
  if ((el = q('[data-rb-pal]'))) { const why = insert(b, el.dataset.rbPal); return why || true; }
  if ((el = q('[data-rb-tile]'))) {
    const path = dec(el.dataset.rbTile);
    const c = V.tileAt(b.prog, path);
    b.sel = path;
    if (c && (c.body || c.then)) b.caret = { path: [...path, c.then ? 'then' : 'body'], index: (c.then || c.body).length };
    else b.caret = { path: path.slice(0, -1), index: path[path.length - 1] + 1 };
    return true;
  }
  if ((el = q('[data-rb-after]'))) {
    const path = dec(el.dataset.rbAfter);
    b.sel = null;
    b.caret = { path: path.slice(0, -1), index: path[path.length - 1] + 1 };
    return true;
  }
  if ((el = q('[data-rb-row]'))) { const r = el.dataset.rbRow; b.sel = null; b.caret = { path: [r], index: b.prog[r].length }; return true; }
  if ((el = q('[data-rb-into]')) && ev.target === el) {
    const path = dec(el.dataset.rbInto);
    b.sel = null;
    b.caret = { path, index: V.listAt(b.prog, path).length };
    return true;
  }
  const action = q('[data-action]');
  if (!action) return false;
  const sel = b.sel ? V.tileAt(b.prog, b.sel) : null;
  switch (action.dataset.action) {
    case 'rb-del': {
      if (b.caret.index > 0) removeAt(b, [...b.caret.path, b.caret.index - 1]);
      return true;
    }
    case 'rb-remove': if (b.sel) removeAt(b, b.sel); return true;
    case 'rb-undo': { const last = b.undo.pop(); if (last) { b.prog = JSON.parse(last); b.sel = null; b.caret = { path: ['main'], index: b.prog.main.length }; } return true; }
    case 'rb-more': if (sel && sel.n < 9) { snapshot(b); sel.n += 1; } return true;
    case 'rb-fewer': if (sel && sel.n > 2) { snapshot(b); sel.n -= 1; } return true;
    case 'rb-cond': if (sel) { snapshot(b); const cs = ['ahead', 'left', 'right', 'animal']; sel.cond = cs[(cs.indexOf(sel.cond) + 1) % cs.length]; } return true;
    case 'rb-paint': if (sel) { snapshot(b); sel.c = sel.c === 'o' ? 'b' : sel.c === 'b' ? undefined : 'o'; if (!sel.c) delete sel.c; } return true;
    case 'rb-flip': if (sel) { snapshot(b); sel.op = sel.op === 'TL' ? 'TR' : 'TL'; } return true;
    default: return false;
  }
}

/* ------------------------------------------------------------------ */
/* Running                                                             */
/* ------------------------------------------------------------------ */

/* Events a child sees as a step; the rest (entering a call, a loop's next
   turn) still light their tile but go by without a pause of their own. */
const VISIBLE = new Set(['move', 'turn', 'feed', 'bump', 'nothing', 'skip']);

export function startRun(b) {
  const res = V.run(b.level, b.prog);
  b.runner = { res, events: res.events, at: -1, loops: {}, timer: null };
  b.bug = null;
  b.sel = null;
}

/** Move to the next visible event. Returns true at the end. */
export function advance(b) {
  const r = b.runner;
  while (r.at < r.events.length - 1) {
    r.at += 1;
    const e = r.events[r.at];
    if (e.k === 'loop' && e.loop) r.loops[enc(e.at)] = e.loop;
    if (VISIBLE.has(e.k)) return r.at >= r.events.length - 1 && !hasVisibleAfter(r);
  }
  return true;
}

const hasVisibleAfter = (r) => r.events.slice(r.at + 1).some((e) => VISIBLE.has(e.k));

export function finish(b) {
  const r = b.runner;
  if (!r) return null;
  clearTimeout(r.timer);
  r.timer = null;
  if (!r.res.ok) b.bug = r.res.at || null;
  return r.res;
}

export function stopRun(b) {
  if (b.runner) clearTimeout(b.runner.timer);
  b.runner = null;
  b.bug = null;
}

export default { robotBank, renderInto, makeBench, rowSize, benchSize, boardWords, boardSvg, editorHtml, runBar, insert, removeAt, benchClick, startRun, advance, finish, stopRun };
