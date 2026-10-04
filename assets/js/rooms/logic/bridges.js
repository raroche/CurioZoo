/**
 * rooms/logic/bridges.js — Zoo Bridges, drawn.
 *
 * One SVG. Tapping the water between two islands builds a bridge; tapping
 * again builds a second (where two are allowed), and again takes them away.
 * Every island wears a ring of dots, one per bridge it needs, that fill as
 * bridges arrive: a progress meter a six-year-old reads without counting.
 * When an island is full its animal comes to visit and a ✓ appears; too many
 * bridges shows "!" and a dashed ring. Shape and glyph, never colour alone.
 *
 * The puzzle is solved the moment the bridges are right; there is no Check
 * to press. "Check my bridges" exists for a child who wants to know whether
 * they have gone wrong somewhere, and says how many, not which, unless asked.
 */

import * as B from '../../modules/bridgeslogic.js';
import * as P from '../../modules/logicprogress.js';
import { HABITAT_EMOJI, bt, islandName } from '../../modules/bridgestext.js';
import { ANIMALS } from '../../modules/zooart.js';
import { hash, rngFor } from '../../modules/logicrng.js';
import { paint, react } from '../../modules/shell.js';
import { esc, lang, say, t } from './frame.js';


/* ------------------------------------------------------------------ */
/* The bank and the chapters                                           */
/* ------------------------------------------------------------------ */

const banks = new Map();

async function bank(level) {
  if (!banks.has(level)) {
    banks.set(level, fetch(`data/logic/bridges/${level}.json`, { cache: 'no-cache' }).then((res) => {
      if (!res.ok) throw new Error(`Could not load the ${level} bridge puzzles`);
      return res.json();
    }));
    banks.get(level).catch(() => banks.delete(level));
  }
  return banks.get(level);
}

const chapters = (level, L) => B.CHAPTERS[level].map((ch) => ({
  id: ch.id, title: bt(`ch.${ch.id}`, L), idea: bt(`ch.${ch.id}.idea`, L)
}));
const levelOfChapter = (id) => (B.chapter(id) || {}).level || null;
const tileLabel = (p, L) => (p.teach ? { icon: '🎓', text: t('teach') } : { icon: '🌉', text: bt('tile.puzzle', L) });

/* ------------------------------------------------------------------ */
/* State                                                               */
/* ------------------------------------------------------------------ */

const CELL = 60;
const EDGE = 26;      // room round the board for the column letters and row numbers
const REACH = 30;     // a tap this close to a route's line is a tap on that route
const ZOOM_FROM = 7;  // boards this many columns wide offer "Bigger board"
let play = null;
let big = false;      // the child's choice, kept from board to board

function draw(host, ctx) {
  const p = B.parse(ctx.puzzle.g);
  const maxb = ctx.puzzle.maxb;
  const G = B.graph(p, maxb);
  const sol = B.humanSolve(p, maxb, { G }).vals;
  /* Animals in a fixed order from the puzzle's own seed, so the same island
     always has the same visitor. */
  const start = hash(ctx.puzzle.g) % ANIMALS.length;
  play = {
    host, ctx, p, maxb, G, sol,
    x0: Math.min(...p.isl.map((i) => i.x)), y0: Math.min(...p.isl.map((i) => i.y)),
    animal: p.isl.map((_, i) => ANIMALS[(start + i) % ANIMALS.length]),
    vals: G.edges.map(() => 0), undo: [],
    hints: 0, reveals: 0, hint: null, msg: null, done: false, shake: -1, show: new Set(), apart: new Set()
  };
  paintBoard();
}

/* An island's square as the board prints it: "C4" is column C, row 4. */
const colLetter = (c) => String.fromCharCode(65 + c);
const square = (i) => `${colLetter(play.p.isl[i].x - play.x0)}${play.p.isl[i].y - play.y0 + 1}`;
const name = (i, L, cap = false) => islandName(play.animal[i], L, cap, square(i));
const countAt = (i) => B.countAt(play.G, play.vals, i);

/* ------------------------------------------------------------------ */
/* Drawing                                                             */
/* ------------------------------------------------------------------ */

const centre = (isl) => [isl.x * CELL + CELL / 2, isl.y * CELL + CELL / 2];

function edgeSvg(k, L) {
  const { G, p } = play;
  const e = G.edges[k];
  const [x1, y1] = centre(p.isl[e.a]);
  const [x2, y2] = centre(p.isl[e.b]);
  const v = play.vals[k];
  const horiz = e.dir === 'h';
  const R = 23;
  /* The water between the two islands, as a focus ring and hover. A tap
     anywhere near the line counts too (see edgeNear). */
  const hx = horiz ? x1 + R : x1 - 24;
  const hy = horiz ? y1 - 24 : y1 + R;
  const hw = horiz ? x2 - x1 - 2 * R : 48;
  const hh = horiz ? 48 : y2 - y1 - 2 * R;
  const off = v === 2 ? [-5, 5] : v === 1 ? [0] : [];
  const lines = off.map((o) => (horiz
    ? `<line x1="${x1 + R - 2}" y1="${y1 + o}" x2="${x2 - R + 2}" y2="${y2 + o}"/>`
    : `<line x1="${x1 + o}" y1="${y1 + R - 2}" x2="${x2 + o}" y2="${y2 - R + 2}"/>`)).join('');
  const wrong = play.show.has(k) ? ' is-wrong' : '';
  const hint = play.hint && play.hint.edge === k && play.hint.level >= 1 ? ' is-hint' : '';
  const shake = play.shake === k ? ' is-shake' : '';
  const label = bt(v === 1 ? 'route1' : 'route', L, { I: name(e.a, L), J: name(e.b, L), k: v });
  return `<g class="cz-br-edge${wrong}${hint}${shake}">
    <g class="cz-br-planks">${lines}</g>
    <rect class="cz-br-hit" x="${hx}" y="${hy}" width="${Math.max(hw, 8)}" height="${Math.max(hh, 8)}" rx="8"
      data-br-edge="${k}" tabindex="${play.done ? -1 : 0}" role="button" aria-label="${esc(label)}"/>
  </g>`;
}

function islandSvg(i, L) {
  const isl = play.p.isl[i];
  const [cx, cy] = centre(isl);
  const k = countAt(i);
  const full = k === isl.n;
  const over = k > isl.n;
  const hint = play.hint && play.hint.island === i && play.hint.level >= 1 ? ' is-hint' : '';
  const dots = Array.from({ length: isl.n }, (_, d) => {
    const ang = -Math.PI / 2 + (2 * Math.PI * d) / isl.n;
    return `<circle class="cz-br-dot${d < k ? ' is-on' : ''}" cx="${(cx + 27 * Math.cos(ang)).toFixed(1)}" cy="${(cy + 27 * Math.sin(ang)).toFixed(1)}" r="3.3"/>`;
  }).join('');
  const badge = over ? `<text class="cz-br-badge is-over" x="${cx + 17}" y="${cy - 13}">!</text>`
    : full ? `<text class="cz-br-visitor" x="${cx + 19}" y="${cy - 12}">${play.animal[i].emoji}</text>` : '';
  const apart = play.apart.has(i);
  return `<g class="cz-br-island${full ? ' is-full' : ''}${over ? ' is-over' : ''}${apart ? ' is-apart' : ''}${hint}" role="img"
      aria-label="${esc(bt('islandLabel', L, { I: name(i, L, true), n: isl.n, k }))}${apart ? `, ${esc(bt('apart', L))}` : ''}">
    ${dots}
    <circle class="cz-br-disc" cx="${cx}" cy="${cy}" r="20"/>
    <text class="cz-br-n" x="${cx}" y="${cy + 1}">${isl.n}</text>
    ${full && !over ? `<text class="cz-br-tick" x="${cx}" y="${cy + 15}">✓</text>` : ''}
    ${badge}
  </g>`;
}

function paintBoard() {
  const L = lang();
  const { p } = play;
  /* Only the water the islands use: a small puzzle on a big grid is not
     shown floating in a sea of nothing. */
  const xs = p.isl.map((i) => i.x);
  const ys = p.isl.map((i) => i.y);
  const x0 = play.x0 * CELL;
  const y0 = play.y0 * CELL;
  const cols = Math.max(...xs) - play.x0 + 1;
  const rows = Math.max(...ys) - play.y0 + 1;
  const W = cols * CELL;
  const H = rows * CELL;
  /* Column letters across the top and row numbers down the side, so every
     island has a square ("C4") its name can use. */
  const coords = [
    ...Array.from({ length: cols }, (_, c) => `<text class="cz-br-coord" x="${x0 + c * CELL + CELL / 2}" y="${y0 - 8}">${colLetter(c)}</text>`),
    ...Array.from({ length: rows }, (_, r) => `<text class="cz-br-coord" x="${x0 - EDGE / 2}" y="${y0 + r * CELL + CELL / 2 + 5}">${r + 1}</text>`)
  ].join('');
  /* "Bigger board" makes a cell 64 px, so every route is a thumb wide; the
     board then scrolls sideways in its frame. */
  const zoom = cols >= ZOOM_FROM;
  const px = zoom && big ? 64 : 34;
  const svg = `<svg class="cz-br-svg" viewBox="${x0 - EDGE} ${y0 - EDGE} ${W + EDGE} ${H + EDGE}"
      data-style="min-width:${Math.round((cols + EDGE / CELL) * px)}px;max-width:${Math.round((cols + EDGE / CELL) * Math.max(px, 72))}px">
    <g aria-hidden="true">${coords}</g>
    <rect class="cz-br-water" x="${x0}" y="${y0}" width="${W}" height="${H}" rx="14"/>
    ${play.G.edges.map((_, k) => edgeSvg(k, L)).join('')}
    ${p.isl.map((_, i) => islandSvg(i, L)).join('')}
  </svg>`;
  const actions = play.done ? '' : `<div class="cz-code-actions">
      <button type="button" class="gp-btn gp-btn--ghost" data-action="br-undo" ${play.undo.length ? '' : 'disabled'}>↶ ${esc(bt('undo', L))}</button>
      <button type="button" class="gp-btn gp-btn--ghost" data-action="br-restart">${esc(bt('restart', L))}</button>
      <button type="button" class="gp-btn gp-btn--ghost" data-action="br-check">${esc(bt('check', L))}</button>
      <button type="button" class="gp-btn gp-btn--ghost" data-action="br-hint"><span aria-hidden="true">🔎</span> ${esc(play.hint ? t('hintMore') : t('hint'))}</button>
    </div>`;
  play.host.innerHTML = `<div class="cz-br" lang="${L}">
    <p class="cz-code-ask">${esc(bt('ask', L))}</p>
    <p class="cz-truth-rules"><span>${esc(bt('rules', L))}</span></p>
    <p class="cz-rule-help">${esc(bt('tapHelp', L))} ${esc(bt('coordHelp', L))}</p>
    ${zoom ? `<p class="cz-br-zoom"><button type="button" class="gp-btn gp-btn--ghost" data-action="br-zoom" aria-pressed="${big}">
      <span aria-hidden="true">${big ? '🔍−' : '🔍+'}</span> ${esc(bt(big ? 'smaller' : 'bigger', L))}</button></p>` : ''}
    <div class="cz-br-wrap">${svg}</div>
    ${actions}
    <div class="cz-code-msg" aria-live="polite">${play.msg ? play.msg(L) : helper(L)}</div>
  </div>`;
  paint();
  play.shake = -1;
}

/* What the helper says on its own: too many bridges, a cut-off group (Easy). */
function helper(L) {
  const { p } = play;
  const over = p.isl.findIndex((isl, i) => countAt(i) > isl.n);
  if (over >= 0) return `<p class="cz-code-say is-wrong">${esc(bt('over', L, { I: name(over, L, true) }))}</p>`;
  if (play.ctx.level !== 'easy') return '';
  const g = B.groups(p, play.G, play.vals);
  const roots = new Set(g);
  if (roots.size < 2) return '';
  for (const r of roots) {
    const members = p.isl.map((_, i) => i).filter((i) => g[i] === r);
    if (members.length > 1 && members.every((i) => countAt(i) === p.isl[i].n)) {
      return `<p class="cz-code-say is-wrong">${esc(bt('cut', L))}</p>`;
    }
  }
  return '';
}

/* ------------------------------------------------------------------ */
/* Building                                                            */
/* ------------------------------------------------------------------ */

function setEdge(k, v) {
  play.undo.push([k, play.vals[k]]);
  play.vals[k] = v;
  play.show.delete(k);
  play.apart = new Set();
}

function tap(k) {
  if (play.done) return;
  const max = Math.min(play.maxb, 2);
  const next = (play.vals[k] + 1) % (max + 1);
  if (play.vals[k] === 0 && next > 0 && play.G.cross[k].some((j) => play.vals[j] > 0)) {
    play.shake = k;
    play.msg = (L) => `<p class="cz-code-say is-wrong">${esc(bt('crossNo', L))}</p>`;
    paintBoard();
    refocus(k);
    return;
  }
  setEdge(k, next);
  play.msg = null;
  play.hint = null;
  if (B.isSolution(play.p, play.G, play.vals)) { win(); return; }
  paintBoard();
  refocus(k);
}

function refocus(k) {
  const el = play.host.querySelector(`[data-br-edge="${k}"]`);
  if (el) el.focus();
}

function win() {
  play.done = true;
  const stars = B.starsFor({ hints: play.ctx.puzzle.teach ? 0 : play.hints, reveals: play.reveals });
  const run = B.humanSolve(play.p, play.maxb, { G: play.G });
  play.msg = (L) => `<p class="cz-code-say is-right">✓ ${esc(bt('right', L))}</p>`;
  paintBoard();
  react('happy', 2000);
  play.ctx.onSolved({ stars, why: (L) => whyLines(run.steps, L) });
}

function whyLines(steps, L) {
  const order = Object.keys(B.TECH_LEVEL);
  const used = [...new Set(steps.map((s) => bt(`tech.${s.tag}`, L)))];
  used.sort((a, b) => order.findIndex((x) => bt(`tech.${x}`, L) === a) - order.findIndex((x) => bt(`tech.${x}`, L) === b));
  const top = Math.max(...steps.map((s) => B.TECH_LEVEL[s.tag]));
  const hard = steps.find((s) => B.TECH_LEVEL[s.tag] === top);
  return [esc(bt('whyUsed', L, { list: used.join(', ') })), ...(hard ? [esc(bt('whyHard', L, { s: stepText(hard, L) }))] : [])];
}

function stepText(s, L) {
  const e = play.G.edges[s.edge];
  const i = s.island !== undefined ? s.island : e.a;
  const n = play.p.isl[i].n;
  const m = s.tag === 'whatIf' ? s.tried : s.lo !== undefined ? s.lo : s.hi;
  return bt(`why.${s.tag}`, L, { I: name(i, L, true), n, m });
}

/* ------------------------------------------------------------------ */
/* Hints and checking                                                  */
/* ------------------------------------------------------------------ */

function hint() {
  const { G, sol } = play;
  play.hints += 1;
  const wrong = G.edges.findIndex((_, k) => play.vals[k] > sol[k]);
  if (wrong >= 0) {
    const key = `w${wrong}`;
    if (!play.hint || play.hint.key !== key) play.hint = { key, level: 0, edge: wrong };
    play.hint.level += 1;
    if (play.hint.level === 1) play.msg = (L) => `<p class="cz-code-hint">🔎 ${esc(bt('lookBridge', L))}</p>`;
    else if (play.hint.level === 2) play.msg = (L) => `<p class="cz-code-hint">💡 ${esc(bt('wrongBridge', L))}</p>`;
    else {
      setEdge(wrong, sol[wrong]);
      play.hint = null;
      play.msg = (L) => `<p class="cz-code-hint">✋ ${esc(bt('wrongBridge', L))}</p>`;
    }
    paintBoard();
    return;
  }
  const run = B.humanSolve(play.p, play.maxb, { G, from: play.vals });
  const step = run.steps.find((s) => s.lo !== undefined && s.lo > play.vals[s.edge]);
  if (!step) return;
  const key = `s${step.edge}:${step.lo}`;
  if (!play.hint || play.hint.key !== key) play.hint = { key, level: 0, edge: step.edge, island: step.island };
  play.hint.level += 1;
  if (play.hint.level === 1) {
    play.msg = (L) => `<p class="cz-code-hint">🔎 ${esc(bt('tryTech', L, { t: bt(`tech.${step.tag}`, L) }))}</p>`;
  } else if (play.hint.level === 2) {
    play.msg = (L) => `<p class="cz-code-hint">💡 ${esc(stepText(step, L))}</p>`;
  } else {
    setEdge(step.edge, step.lo);
    play.hint = null;
    play.msg = (L) => `<p class="cz-code-hint">✋ ${esc(stepText(step, L))} ${esc(bt('doBridge', L))}</p>`;
    if (B.isSolution(play.p, G, play.vals)) { win(); return; }
  }
  paintBoard();
}

function check() {
  const wrong = play.G.edges.map((_, k) => k).filter((k) => play.vals[k] > play.sol[k]);
  play.pendingShow = wrong;
  /* Every island ticked but not one zoo: "2 bridges do not belong" alone
     left a parent sure the board was right. Name the rule that is broken,
     and mark the islands cut off from the biggest group. */
  const { p, G } = play;
  const ticked = p.isl.every((isl, i) => countAt(i) === isl.n);
  const g = B.groups(p, G, play.vals);
  const sizes = new Map();
  g.forEach((r) => sizes.set(r, (sizes.get(r) || 0) + 1));
  const main = [...sizes].sort((a, b) => b[1] - a[1])[0][0];
  play.apart = ticked && sizes.size > 1 ? new Set(p.isl.map((_, i) => i).filter((i) => g[i] !== main)) : new Set();
  const nGroups = sizes.size;
  play.msg = (L) => (wrong.length
    ? `<p class="cz-code-say is-wrong">${esc(play.apart.size ? bt('checkGroups', L, { n: nGroups })
      : wrong.length === 1 ? bt('checkBad1', L) : bt('checkBadN', L, { n: wrong.length }))}
       <button type="button" class="gp-btn gp-btn--ghost" data-action="br-show">${esc(bt('showMe', L))}</button></p>`
    : `<p class="cz-code-say is-right">${esc(bt('checkOk', L))}</p>`);
  paintBoard();
}

/* ------------------------------------------------------------------ */
/* Clicks, keys, reading aloud                                         */
/* ------------------------------------------------------------------ */

/**
 * The route a tap on the board means: the one whose line (centre to centre)
 * passes closest, within REACH. So every route's target is as big as the
 * board allows, not just the strip of water drawn for it. A tap on an
 * island's number is no route; a tap from the keyboard has no place and
 * goes by its focused route instead.
 */
function edgeNear(ev) {
  const svg = ev.target.closest && ev.target.closest('.cz-br-svg');
  if (!svg || (!ev.clientX && !ev.clientY) || !svg.getScreenCTM) return -1;
  const m = svg.getScreenCTM();
  if (!m) return -1;
  const pt = new DOMPoint(ev.clientX, ev.clientY).matrixTransform(m.inverse());
  if (play.p.isl.some((isl) => { const [cx, cy] = centre(isl); return Math.hypot(pt.x - cx, pt.y - cy) < 16; })) return -1;
  let best = -1;
  let bestD = REACH;
  play.G.edges.forEach((e, k) => {
    const [x1, y1] = centre(play.p.isl[e.a]);
    const [x2, y2] = centre(play.p.isl[e.b]);
    const along = e.dir === 'h' ? pt.x : pt.y;
    const lo = e.dir === 'h' ? Math.min(x1, x2) : Math.min(y1, y2);
    const hi = e.dir === 'h' ? Math.max(x1, x2) : Math.max(y1, y2);
    if (along < lo || along > hi) return;
    const d = e.dir === 'h' ? Math.abs(pt.y - y1) : Math.abs(pt.x - x1);
    if (d < bestD) { bestD = d; best = k; }
  });
  return best;
}

function click(ev) {
  if (!play || play.done) return false;
  const near = edgeNear(ev);
  if (near >= 0) { tap(near); return true; }
  const hit = ev.target.closest('[data-br-edge]');
  if (hit) { tap(Number(hit.dataset.brEdge)); return true; }
  const action = ev.target.closest('[data-action]');
  if (!action) return false;
  switch (action.dataset.action) {
    case 'br-zoom': {
      big = !big;
      paintBoard();
      const btn = play.host.querySelector('[data-action="br-zoom"]');
      if (btn) btn.focus();
      return true;
    }
    case 'br-undo': {
      const last = play.undo.pop();
      if (last) play.vals[last[0]] = last[1];
      play.apart = new Set();
      play.msg = null;
      paintBoard();
      return true;
    }
    case 'br-restart':
      play.vals = play.vals.map(() => 0);
      play.undo = [];
      play.show = new Set();
      play.apart = new Set();
      play.msg = null;
      play.hint = null;
      paintBoard();
      return true;
    case 'br-check': check(); return true;
    case 'br-show':
      play.reveals += 1;
      play.show = new Set(play.pendingShow || []);
      play.msg = null;
      paintBoard();
      return true;
    case 'br-hint': hint(); return true;
    default: return false;
  }
}

function key(ev) {
  if (!play || play.done) return false;
  const hit = ev.target.closest && ev.target.closest('[data-br-edge]');
  if (hit && (ev.key === 'Enter' || ev.key === ' ')) {
    ev.preventDefault();
    tap(Number(hit.dataset.brEdge));
    return true;
  }
  if ((ev.key === 'z' || ev.key === 'Z') && !ev.metaKey && !ev.ctrlKey) {
    const last = play.undo.pop();
    if (last) { play.vals[last[0]] = last[1]; play.apart = new Set(); paintBoard(); }
    return true;
  }
  return false;
}

function readAloud() {
  if (!play) return;
  const L = lang();
  say([bt('ask', L), bt('rules', L), ...play.p.isl.map((isl, i) => bt('islandLabel', L, { I: name(i, L, true), n: isl.n, k: countAt(i) }))]);
}

const repaint = () => { if (play) paintBoard(); };

/* ------------------------------------------------------------------ */
/* The zoo map, and today's puzzle                                     */
/* ------------------------------------------------------------------ */

function extras({ bank: b, rec, lang: L }) {
  const cards = b.chapters.map((ch, i) => {
    const ids = ch.puzzles.map((p) => p.id);
    const { solved } = P.tally(rec, 'bridges', ids);
    const night = ids.every((id) => P.starsOf(rec, 'bridges', id) === 3);
    return `<li class="cz-code-pen${solved ? ' is-home' : ''}">
      <span class="cz-code-pen__pic" aria-hidden="true">${night ? '🌙' : HABITAT_EMOJI[i]}</span>
      <span class="cz-code-pen__text"><strong>${esc(bt(`hab.${i}`, L))}</strong>
        <span>${esc(bt('map.count', L, { n: solved, t: ids.length }))}</span>
        ${night ? `<span class="cz-code-pen__fact">${esc(bt('map.night', L))}</span>` : ''}</span>
    </li>`;
  }).join('');
  return `<section class="cz-code-zoo" aria-labelledby="cz-br-map-h">
    <h2 class="cz-logic-h2" id="cz-br-map-h">🗺️ ${esc(bt('map.title', L))}</h2>
    <p class="gp-muted">${esc(bt('map.lede', L))}</p>
    <ul class="cz-code-pens">${cards}</ul>
  </section>`;
}

/* Today's puzzle comes from a chapter without "what if", so it is made in
   a blink on any device. */
function dailyPuzzle(level, iso) {
  const list = B.CHAPTERS[level].filter((c) => c.tl <= 5);
  const def = list[hash('bridges-daily', level, iso) % list.length];
  const p = B.makePuzzle(B.chapter(def.id), rngFor('bridges', 'daily', level, iso));
  return p ? { puzzle: { id: `daily-${iso}`, ...p }, chapterId: def.id } : null;
}

export default {
  id: 'bridges', bank, chapters, levelOfChapter, tileLabel, draw, repaint, click, key,
  say: readAloud, extras, dailyPuzzle
};
