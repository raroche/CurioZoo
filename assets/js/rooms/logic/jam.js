/**
 * rooms/logic/jam.js — Zoo Traffic Jam, drawn.
 *
 * One SVG lot. Tap a cart (or the van) to pick it: dots appear on every
 * square it can slide to, and tapping a dot slides it there. Tapping the cart
 * again lets go. A keyboard picks a cart with Enter and slides it with the
 * arrow keys. Every cart carries an animal, so the hints can name it.
 *
 * One slide is one move however far it goes, and sliding the same cart again
 * straight away is still the same move, as in the toy. The counter shows the
 * moves so far and the fewest possible, so ★★★ is a goal a child can see.
 * When the van reaches the gate it drives out, and the puzzle is solved.
 */

import * as J from '../../modules/jamlogic.js';
import * as P from '../../modules/logicprogress.js';
import { carName, jt } from '../../modules/jamtext.js';
import { ANIMALS } from '../../modules/zooart.js';
import { hash } from '../../modules/logicrng.js';
import { calm } from '../../modules/celebrate.js';
import { paint, react } from '../../modules/shell.js';
import { esc, lang, say, t } from './frame.js';

/* ------------------------------------------------------------------ */
/* The bank and the chapters                                           */
/* ------------------------------------------------------------------ */

const banks = new Map();

async function bank(level) {
  if (!banks.has(level)) {
    banks.set(level, fetch(`data/logic/jam/${level}.json`, { cache: 'no-cache' }).then((res) => {
      if (!res.ok) throw new Error(`Could not load the ${level} parking lots`);
      return res.json();
    }));
    banks.get(level).catch(() => banks.delete(level));
  }
  return banks.get(level);
}

const chapters = (level, L) => J.CHAPTERS[level].map((ch) => ({
  id: ch.id, title: jt(`ch.${ch.id}`, L), idea: jt(`ch.${ch.id}.idea`, L)
}));
const levelOfChapter = (id) => (J.chapter(id) || {}).level || null;
const tileLabel = (p, L) => (p.teach ? { icon: '🎓', text: t('teach') } : { icon: '🚐', text: jt('tile.puzzle', L) });

/* ------------------------------------------------------------------ */
/* State                                                               */
/* ------------------------------------------------------------------ */

const CELL = 64;
const GATE = 44;      // the drive-out lane to the right of the lot
let play = null;
let timer = null;
let frame = 0;

/* No animation for reduced motion, or in a hidden tab (it gets no frames,
   and the answer would wait for one that never comes). */
const still = () => calm() || (typeof document !== 'undefined' && document.hidden);

function stopAnim() {
  clearTimeout(timer);
  cancelAnimationFrame(frame);
  timer = null;
  frame = 0;
}

/** The child left the puzzle: stop any slide or replay. */
function leave() {
  stopAnim();
  play = null;
}

function draw(host, ctx) {
  stopAnim();
  const p = ctx.puzzle;
  const L = J.prepare(p);
  /* Animals in a fixed order from the lot's own shape, so a lot always has
     the same carts. */
  const first = hash(J.shapeOf(p)) % ANIMALS.length;
  play = {
    host, ctx, p, L, pos: L.start.slice(), sel: -1, moves: 0, last: -1, undo: [],
    hints: 0, hintLevel: 0, hintCar: -1, blockers: [], shown: false, done: false, busy: false, msg: null,
    animals: p.cars.map((_, i) => ANIMALS[(first + i) % ANIMALS.length])
  };
  paintBoard();
}

const nameOf = (i, L, cap = false) => carName(i, play.p.cars[i][2], play.animals[i], L, cap);

/** The squares car i covers at position `pos`: [[row, col], ...]. */
function cellsOf(i, pos = play.pos) {
  const ln = play.L.lane[i];
  return Array.from({ length: ln.len }, (_, k) => (ln.h ? [ln.fixed, pos[i] + k] : [pos[i] + k, ln.fixed]));
}

/** Where car i can slide to now: [newCoord, ...]. */
const targets = (i) => J.slides(play.L, play.pos).filter(([c]) => c === i).map(([, x]) => x);

/** The carts standing in the gate row between the van and the gate. */
function blockers() {
  const { L, pos } = play;
  const out = [];
  for (let i = 1; i < L.lane.length; i++) {
    if (cellsOf(i).some(([r, c]) => r === L.gate && c > pos[0])) out.push(i);
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Drawing                                                             */
/* ------------------------------------------------------------------ */

function carSvg(i, L) {
  const cells = cellsOf(i);
  const [r1, c1] = cells[0];
  const [r2, c2] = cells[cells.length - 1];
  const x = c1 * CELL + 5;
  const y = r1 * CELL + 5;
  const w = (c2 - c1 + 1) * CELL - 10;
  const h = (r2 - r1 + 1) * CELL - 10;
  const ln = play.L.lane[i];
  const sel = play.sel === i ? ' is-sel' : '';
  const hint = play.hintCar === i ? ' is-hint' : '';
  const block = play.blockers.includes(i) ? ' is-block' : '';
  const kind = i === 0 ? ' is-van' : ` is-k${i % 6}`;
  const emoji = i === 0 ? '🚐' : play.animals[i].emoji;
  const label = jt('carLabel', L, {
    name: nameOf(i, L, true), dir: jt(ln.h ? 'dirH' : 'dirV', L), c1: c1 + 1, r1: r1 + 1, c2: c2 + 1, r2: r2 + 1
  });
  /* A row of wheels along the long side: the shape says which way it rolls. */
  const wheels = cells.map(([r, c]) => (ln.h
    ? `<circle class="cz-jam-wheel" cx="${c * CELL + CELL / 2}" cy="${y + h - 1}" r="4"/>`
    : `<circle class="cz-jam-wheel" cx="${x + w - 1}" cy="${r * CELL + CELL / 2}" r="4"/>`)).join('');
  return `<g class="cz-jam-car${kind}${sel}${hint}${block}" data-jam-car="${i}" role="button" tabindex="${play.done ? -1 : 0}"
      aria-pressed="${play.sel === i}" aria-label="${esc(label)}">
    <rect class="cz-jam-body" x="${x}" y="${y}" width="${w}" height="${h}" rx="12"/>
    ${wheels}
    <text class="cz-jam-emoji" x="${x + w / 2}" y="${y + h / 2 + 10}">${emoji}</text>
    ${i === 0 ? `<text class="cz-jam-star" x="${x + w - 12}" y="${y + 17}">★</text>` : ''}
  </g>`;
}

function dotsSvg(L) {
  if (play.sel < 0 || play.done) return '';
  const i = play.sel;
  const ln = play.L.lane[i];
  return targets(i).map((x) => {
    /* The dot sits on the square the cart's leading end would reach. */
    const lead = x < play.pos[i] ? x : x + ln.len - 1;
    const r = ln.h ? ln.fixed : lead;
    const c = ln.h ? lead : ln.fixed;
    return `<g class="cz-jam-dot" data-jam-to="${x}" role="button" tabindex="0"
        aria-label="${esc(jt('slideTo', L, { name: nameOf(i, L), c: c + 1, r: r + 1 }))}">
      <rect class="cz-jam-dothit" x="${c * CELL}" y="${r * CELL}" width="${CELL}" height="${CELL}"/>
      <circle cx="${c * CELL + CELL / 2}" cy="${r * CELL + CELL / 2}" r="11"/>
    </g>`;
  }).join('');
}

function paintBoard() {
  const L = lang();
  const { p, pos } = play;
  const n = p.n;
  const W = n * CELL;
  const gy = play.L.gate * CELL;
  const grid = Array.from({ length: n * n }, (_, k) => {
    const r = Math.floor(k / n);
    const c = k % n;
    return `<rect class="cz-jam-cell${r === play.L.gate ? ' is-gaterow' : ''}" x="${c * CELL + 2}" y="${r * CELL + 2}" width="${CELL - 4}" height="${CELL - 4}" rx="8"/>`;
  }).join('');
  const rocks = p.rocks.map(([r, c]) => `<g class="cz-jam-rock" role="img" aria-label="${esc(jt('rock', L))}">
      <rect x="${c * CELL + 6}" y="${r * CELL + 6}" width="${CELL - 12}" height="${CELL - 12}" rx="14"/>
      <text x="${c * CELL + CELL / 2}" y="${r * CELL + CELL / 2 + 10}">🪨</text></g>`).join('');
  const gate = `<g class="cz-jam-gate" aria-hidden="true">
      <rect x="${W}" y="${gy + 4}" width="${GATE}" height="${CELL - 8}" rx="6"/>
      <path d="M ${W + 10} ${gy + CELL / 2} H ${W + GATE - 10} M ${W + GATE - 18} ${gy + CELL / 2 - 8} L ${W + GATE - 10} ${gy + CELL / 2} L ${W + GATE - 18} ${gy + CELL / 2 + 8}"/>
    </g>`;
  const cars = p.cars.map((_, i) => carSvg(i, L)).join('');
  const done = play.done;
  const actions = done ? '' : `<div class="cz-code-actions">
      <button type="button" class="gp-btn gp-btn--ghost" data-action="jam-undo" ${play.undo.length ? '' : 'disabled'}>↶ ${esc(t('undo'))}</button>
      <button type="button" class="gp-btn gp-btn--ghost" data-action="jam-restart">${esc(jt('restart', L))}</button>
      <button type="button" class="gp-btn gp-btn--ghost" data-action="jam-hint"><span aria-hidden="true">🔎</span> ${esc(play.hints ? t('hintMore') : t('hint'))}</button>
      ${play.hints >= 2 ? `<button type="button" class="gp-btn gp-btn--ghost" data-action="jam-answer"><span aria-hidden="true">💡</span> ${esc(jt('answer', L))}</button>` : ''}
    </div>`;
  play.host.innerHTML = `<div class="cz-jam" lang="${L}">
    <p class="cz-code-ask">${esc(jt('ask', L))}</p>
    ${done ? '' : `<p class="cz-rule-help">${esc(jt('how', L))}</p>`}
    <p class="cz-jam-count"><strong>${esc(jt('moves', L, { n: play.moves }))}</strong> · ${esc(jt('fewest', L, { n: p.min }))}</p>
    <div class="cz-br-wrap"><svg class="cz-jam-svg" viewBox="0 0 ${W + GATE} ${W}" role="group" aria-label="${esc(jt('ask', L))}">
      <rect class="cz-jam-lot" x="0" y="0" width="${W}" height="${W}" rx="14"/>
      ${grid}${gate}${rocks}${cars}${dotsSvg(L)}
      <text class="cz-jam-gateword" x="${W + GATE / 2}" y="${gy - 6}">${esc(jt('gate', L))}</text>
    </svg></div>
    ${actions}
    <div class="cz-code-msg" aria-live="polite">${play.msg ? play.msg(L) : ''}</div>
  </div>`;
  paint();
}

/* ------------------------------------------------------------------ */
/* Moving                                                              */
/* ------------------------------------------------------------------ */

/** Slide car i to coordinate x: a move, unless the same car just moved. */
function slide(i, x, { manual = true } = {}) {
  const from = play.pos[i];
  if (from === x) return;
  play.undo.push({ pos: play.pos.slice(), moves: play.moves, last: play.last });
  if (i !== play.last) play.moves += 1;
  play.last = i;
  play.pos[i] = x;
  if (manual) { play.hintCar = -1; play.hintLevel = Math.min(play.hintLevel, 1); }
  play.blockers = [];
  const solved = J.solvedPos(play.L, play.pos);
  play.sel = solved ? -1 : i;
  if (!manual || solved) play.sel = -1;
  paintBoard();
  glide(i, from, x, () => { if (solved) win(); });
}

/** Animate car i from its old coordinate; `then` runs when it arrives. */
function glide(i, from, to, then) {
  const el = play.host.querySelector(`[data-jam-car="${i}"]`);
  if (still() || !el) { then(); return; }
  stopAnim();
  const ln = play.L.lane[i];
  const d = (from - to) * CELL;
  const ms = Math.min(420, 90 + 70 * Math.abs(from - to));
  const t0 = performance.now();
  const mine = play;
  const step = (now) => {
    frame = 0;
    if (play !== mine) return;
    const f = Math.min(1, (now - t0) / ms);
    const left = d * (1 - (1 - (1 - f) ** 3));
    el.setAttribute('transform', ln.h ? `translate(${left} 0)` : `translate(0 ${left})`);
    if (f < 1) frame = requestAnimationFrame(step);
    else { el.removeAttribute('transform'); then(); }
  };
  el.setAttribute('transform', ln.h ? `translate(${d} 0)` : `translate(0 ${d})`);
  frame = requestAnimationFrame(step);
}

/** Car i one square on, in direction dir (−1 or +1), if it is free. */
function nudge(i, dir) {
  const x = play.pos[i] + dir;
  if (targets(i).includes(x)) slide(i, x);
}

function win() {
  if (play.done) return;
  play.done = true;
  play.sel = -1;
  const { p } = play;
  const stars = J.starsFor({ moves: play.moves, min: p.min, shown: play.shown });
  const moves = play.moves;
  const path = (J.solve(J.prepare(p)) || { path: [] }).path;
  const counts = new Map();
  path.forEach(([i]) => counts.set(i, (counts.get(i) || 0) + 1));
  const twice = [...counts].some(([i, k]) => i !== 0 && k > 1);
  let vanBack = false;
  let vanAt = J.prepare(p).start[0];
  for (const [i, x] of path) { if (i === 0) { if (x < vanAt) vanBack = true; vanAt = x; } }
  play.msg = (L) => `<p class="cz-code-say is-right">✓ ${esc(jt('right', L))}</p>`;
  paintBoard();
  /* The van drives out of the gate. */
  const van = play.host.querySelector('[data-jam-car="0"]');
  const finish = () => {
    react('happy', 2000);
    play.ctx.onSolved({
      stars,
      why: (L) => [
        esc(jt('why.fewest', L, { min: p.min, n: moves })),
        ...(moves > p.min && !play.shown ? [esc(jt('why.again', L, { min: p.min }))] : []),
        esc(jt(vanBack ? 'why.back' : twice ? 'why.twice' : 'why.plan', L))
      ]
    });
  };
  if (still() || !van) { finish(); return; }
  const t0 = performance.now();
  const mine = play;
  const dist = GATE + 2 * CELL;
  const step = (now) => {
    frame = 0;
    if (play !== mine) return;
    const f = Math.min(1, (now - t0) / 650);
    van.setAttribute('transform', `translate(${dist * f * f} 0)`);
    if (f < 1) frame = requestAnimationFrame(step);
    else finish();
  };
  frame = requestAnimationFrame(step);
}

/* ------------------------------------------------------------------ */
/* Hints and the answer                                                */
/* ------------------------------------------------------------------ */

/*
 * Three steps, like every game in the room: where to look (the carts in the
 * gate row), which cart moves first (picked, with its dots showing), then
 * the move itself. Each press after that makes one more move.
 */
function hint() {
  if (play.busy) return;
  play.hints += 1;
  play.hintLevel += 1;
  const next = J.nextMove(play.L, play.pos);
  if (!next) {
    play.msg = (L) => `<p class="cz-code-hint">🔎 ${esc(jt('hint.solved', L))}</p>`;
    paintBoard();
    return;
  }
  const [i, x] = next;
  if (play.hintLevel === 1) {
    play.blockers = blockers();
    play.hintCar = -1;
    play.msg = (L) => `<p class="cz-code-hint">🔎 ${esc(jt('hint.look', L))}</p>`;
    paintBoard();
  } else if (play.hintLevel === 2) {
    play.blockers = [];
    play.hintCar = i;
    play.sel = i;
    play.msg = (L) => `<p class="cz-code-hint">💡 ${esc(jt('hint.next', L, { name: nameOf(i, L) }))}</p>`;
    paintBoard();
  } else {
    play.hintCar = -1;
    play.msg = (L) => `<p class="cz-code-hint">✋ ${esc(jt('hint.did', L, { name: nameOf(i, L) }))}</p>`;
    slide(i, x, { manual: false });
  }
}

/** After two hints: the rest of a shortest path, one move at a time. */
function showAnswer() {
  if (play.busy) return;
  const s = J.solve(play.L, play.pos);
  if (!s) return;
  play.shown = true;
  play.busy = true;
  play.sel = -1;
  play.hintCar = -1;
  play.blockers = [];
  play.msg = (L) => `<p class="cz-code-hint">💡 ${esc(jt('answerShown', L, { n: s.min }))}</p>`;
  const mine = play;
  const steps = s.path.slice();
  const go = () => {
    timer = null;
    if (play !== mine || !steps.length) { if (play === mine) play.busy = false; return; }
    const [i, x] = steps.shift();
    slide(i, x, { manual: false });
    if (steps.length) timer = setTimeout(go, still() ? 0 : 650);
    else play.busy = false;
  };
  go();
}

function restart() {
  stopAnim();
  play.pos = play.L.start.slice();
  play.moves = 0;
  play.last = -1;
  play.undo = [];
  play.sel = -1;
  play.hintCar = -1;
  play.hintLevel = 0;
  play.blockers = [];
  play.busy = false;
  play.msg = null;
  paintBoard();
}

function undo() {
  const last = play.undo.pop();
  if (!last) return;
  stopAnim();
  play.pos = last.pos;
  play.moves = last.moves;
  play.last = last.last;
  play.sel = -1;
  play.msg = null;
  paintBoard();
}

/* ------------------------------------------------------------------ */
/* Clicks, keys, reading aloud                                         */
/* ------------------------------------------------------------------ */

function pick(i) {
  if (play.sel === i) { play.sel = -1; play.msg = null; paintBoard(); return; }
  play.sel = i;
  play.msg = targets(i).length
    ? (L) => `<p class="cz-code-hint">${esc(jt('pick', L, { name: nameOf(i, L) }))}</p>`
    : (L) => `<p class="cz-code-say is-wrong">${esc(jt('stuck', L, { name: nameOf(i, L, true) }))}</p>`;
  paintBoard();
  const el = play.host.querySelector(`[data-jam-car="${i}"]`);
  if (el) el.focus({ preventScroll: true });
}

function click(ev) {
  if (!play || play.done) return false;
  const q = (s) => ev.target.closest(s);
  let el;
  if ((el = q('[data-action]'))) {
    switch (el.dataset.action) {
      case 'jam-undo': if (!play.busy) undo(); return true;
      case 'jam-restart': restart(); return true;
      case 'jam-hint': hint(); return true;
      case 'jam-answer': showAnswer(); return true;
      default: return false;
    }
  }
  if (play.busy) return false;
  if ((el = q('[data-jam-to]'))) { slide(play.sel, Number(el.dataset.jamTo)); refocusCar(); return true; }
  if ((el = q('[data-jam-car]'))) { pick(Number(el.dataset.jamCar)); return true; }
  return false;
}

function refocusCar() {
  if (!play || play.sel < 0) return;
  const el = play.host.querySelector(`[data-jam-car="${play.sel}"]`);
  if (el) el.focus({ preventScroll: true });
}

function key(ev) {
  if (!play || play.done || play.busy) return false;
  const car = ev.target.closest && ev.target.closest('[data-jam-car]');
  const dot = ev.target.closest && ev.target.closest('[data-jam-to]');
  if ((ev.key === 'Enter' || ev.key === ' ') && (car || dot)) {
    ev.preventDefault();
    if (dot) { slide(play.sel, Number(dot.dataset.jamTo)); refocusCar(); } else pick(Number(car.dataset.jamCar));
    return true;
  }
  if (play.sel >= 0 && /^Arrow/.test(ev.key)) {
    const ln = play.L.lane[play.sel];
    const dir = { ArrowLeft: ln.h ? -1 : 0, ArrowRight: ln.h ? 1 : 0, ArrowUp: ln.h ? 0 : -1, ArrowDown: ln.h ? 0 : 1 }[ev.key];
    ev.preventDefault();
    if (dir) { nudge(play.sel, dir); refocusCar(); }
    return true;
  }
  if (ev.key === 'Escape' && play.sel >= 0) { play.sel = -1; play.msg = null; paintBoard(); return true; }
  if ((ev.key === 'z' || ev.key === 'Z') && !ev.metaKey && !ev.ctrlKey) { undo(); return true; }
  return false;
}

function readAloud() {
  if (!play) return;
  const L = lang();
  say([jt('ask', L), jt('how', L), jt('fewest', L, { n: play.p.min }),
    ...play.p.cars.map((_, i) => {
      const cells = cellsOf(i);
      const [r1, c1] = cells[0];
      const [r2, c2] = cells[cells.length - 1];
      return jt('carLabel', L, { name: nameOf(i, L, true), dir: jt(play.L.lane[i].h ? 'dirH' : 'dirV', L), c1: c1 + 1, r1: r1 + 1, c2: c2 + 1, r2: r2 + 1 });
    })]);
}

const repaint = () => { if (play && !play.busy) paintBoard(); };

/* ------------------------------------------------------------------ */
/* Your parking lots, and today's puzzle                               */
/* ------------------------------------------------------------------ */

const LOT_EMOJI = ['🅿️', '🚚', '🚐', '🌅', '🪨', '⏰', '🚦', '🌿', '🏆'];

function extras({ bank: b, level, rec, lang: L }) {
  const at = J.LEVELS.indexOf(level) * 3;
  const cards = b.chapters.map((ch, i) => {
    const ids = ch.puzzles.map((p) => p.id);
    const { solved } = P.tally(rec, 'jam', ids);
    const gold = ids.filter((id) => P.starsOf(rec, 'jam', id) === 3).length;
    return `<li class="cz-code-pen${solved ? ' is-home' : ''}">
      <span class="cz-code-pen__pic" aria-hidden="true">${LOT_EMOJI[at + i] || '🅿️'}</span>
      <span class="cz-code-pen__text"><strong>${esc(jt(`ch.${ch.id}`, L))}</strong>
        <span>${esc(jt('lot.count', L, { n: solved, t: ids.length }))}</span>
        ${gold ? `<span class="cz-code-pen__fact">🥇 ${esc(jt('lot.gold', L, { n: gold }))}</span>` : ''}</span>
    </li>`;
  }).join('');
  return `<section class="cz-code-zoo" aria-labelledby="cz-jam-lots-h">
    <h2 class="cz-logic-h2" id="cz-jam-lots-h">🅿️ ${esc(jt('lot.title', L))}</h2>
    <p class="gp-muted">${esc(jt('lot.lede', L))}</p>
    <ul class="cz-code-pens">${cards}</ul>
  </section>`;
}

/*
 * Today's puzzle and endless practice come from the level's pool, built and
 * checked with the bank (a deep lot can take seconds to search, too long to
 * make while a child waits). Endless walks the pool in a fixed shuffled
 * order, so a reload shows the same lot.
 */
async function dailyPuzzle(level, iso) {
  const b = await bank(level);
  const pool = b.reserve || [];
  if (!pool.length) return null;
  const m = /^endless-(\d+)/.exec(iso);
  const n = pool.length;
  const at = m ? (hash('jam-endless', level) + Number(m[1]) * 37) % n : hash('jam-daily', level, iso) % n;
  const { ch, ...q } = pool[at];
  return { puzzle: { ...q, id: `daily-${iso}` }, chapterId: ch };
}

export default {
  id: 'jam', bank, chapters, levelOfChapter, tileLabel, draw, repaint, click, key,
  say: readAloud, extras, dailyPuzzle, leave
};
