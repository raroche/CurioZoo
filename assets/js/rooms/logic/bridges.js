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
let play = null;

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
    animal: p.isl.map((_, i) => ANIMALS[(start + i) % ANIMALS.length]),
    vals: G.edges.map(() => 0), undo: [],
    hints: 0, reveals: 0, hint: null, msg: null, done: false, shake: -1, show: new Set()
  };
  paintBoard();
}

const name = (i, L, cap = false) => islandName(play.animal[i], L, cap);
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
  /* The water between the two islands, as a tap target. */
  const hx = horiz ? x1 + R : x1 - 18;
  const hy = horiz ? y1 - 18 : y1 + R;
  const hw = horiz ? x2 - x1 - 2 * R : 36;
  const hh = horiz ? 36 : y2 - y1 - 2 * R;
  const off = v === 2 ? [-5, 5] : v === 1 ? [0] : [];
  const lines = off.map((o) => (horiz
    ? `<line x1="${x1 + R - 2}" y1="${y1 + o}" x2="${x2 - R + 2}" y2="${y2 + o}"/>`
    : `<line x1="${x1 + o}" y1="${y1 + R - 2}" x2="${x2 + o}" y2="${y2 - R + 2}"/>`)).join('');
  const wrong = play.show.has(k) ? ' is-wrong' : '';
  const hint = play.hint && play.hint.edge === k && play.hint.level >= 1 ? ' is-hint' : '';
  const shake = play.shake === k ? ' is-shake' : '';
  const label = bt('route', L, { I: name(e.a, L), J: name(e.b, L), k: v });
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
  return `<g class="cz-br-island${full ? ' is-full' : ''}${over ? ' is-over' : ''}${hint}" role="img"
      aria-label="${esc(bt('islandLabel', L, { I: name(i, L, true), n: isl.n, k }))}">
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
  const x0 = Math.min(...xs) * CELL;
  const y0 = Math.min(...ys) * CELL;
  const cols = Math.max(...xs) - Math.min(...xs) + 1;
  const rows = Math.max(...ys) - Math.min(...ys) + 1;
  const W = cols * CELL;
  const H = rows * CELL;
  const svg = `<svg class="cz-br-svg" viewBox="${x0} ${y0} ${W} ${H}" data-style="min-width:${cols * 34}px;max-width:${cols * 72}px">
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
    <p class="cz-rule-help">${esc(bt('tapHelp', L))}</p>
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
  play.msg = (L) => (wrong.length
    ? `<p class="cz-code-say is-wrong">${esc(wrong.length === 1 ? bt('checkBad1', L) : bt('checkBadN', L, { n: wrong.length }))}
       <button type="button" class="gp-btn gp-btn--ghost" data-action="br-show">${esc(bt('showMe', L))}</button></p>`
    : `<p class="cz-code-say is-right">${esc(bt('checkOk', L))}</p>`);
  paintBoard();
}

/* ------------------------------------------------------------------ */
/* Clicks, keys, reading aloud                                         */
/* ------------------------------------------------------------------ */

function click(ev) {
  if (!play || play.done) return false;
  const hit = ev.target.closest('[data-br-edge]');
  if (hit) { tap(Number(hit.dataset.brEdge)); return true; }
  const action = ev.target.closest('[data-action]');
  if (!action) return false;
  switch (action.dataset.action) {
    case 'br-undo': {
      const last = play.undo.pop();
      if (last) play.vals[last[0]] = last[1];
      play.msg = null;
      paintBoard();
      return true;
    }
    case 'br-restart':
      play.vals = play.vals.map(() => 0);
      play.undo = [];
      play.show = new Set();
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
    if (last) { play.vals[last[0]] = last[1]; paintBoard(); }
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
