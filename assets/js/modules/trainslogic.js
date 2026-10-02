/**
 * trainslogic.js — Train Tracks: the railway, running trains, and puzzles.
 *
 * The zoo railway is a set of horizontal lanes; trains always run left to
 * right, one at a time, so nothing ever depends on speed or timing. A switch
 * is a crossover between two neighbouring lanes in one column: a train on
 * its source lane goes straight (0) or takes the branch (1); a train on the
 * other lane just rolls through. Two kinds:
 *
 *   lever   the child sets it, and it stays
 *   flip    it flips over after every train that meets it (Digi-Comp II,
 *           Turing Tumble, Bebras 2018 "Railroad"): a little machine that
 *           remembers, and counts in odds and evens
 *
 * The research is docs/research/logic/research-trains.md. Pure: no DOM,
 * no Math.random.
 *
 * A layout: { lanes, cols, x: [[col, src, dst, kind], ...] }. Switch k is x[k].
 */

import { randInt, rngFor, shuffled } from './logicrng.js';
import { ANIMALS } from './zooart.js';

export const LEVELS = ['easy', 'medium', 'hard'];

/* ------------------------------------------------------------------ */
/* Chapters                                                            */
/* ------------------------------------------------------------------ */

/**
 * mode: predict (where will it stop?), set (set the switches, then GO),
 * pulls (change levers between trains, fewest pulls), order (choose the
 * order the trains leave), siding (sort cars with a dead-end siding).
 * flips: how many switches are flip-points ('none', 'some', 'most').
 */
export const CHAPTERS = {
  easy: [
    { id: 'e1', mode: 'predict', lanes: [3, 3], cols: [3, 4], trains: [1, 1], flips: 'none' },
    { id: 'e2', mode: 'set', lanes: [3, 4], cols: [3, 5], trains: [1, 1], flips: 'none' },
    { id: 'e3', mode: 'set', lanes: [3, 4], cols: [4, 5], trains: [2, 2], flips: 'none' }
  ],
  medium: [
    { id: 'm1', mode: 'set', lanes: [4, 5], cols: [5, 6], trains: [3, 4], flips: 'none' },
    { id: 'm2', mode: 'pulls', lanes: [4, 4], cols: [4, 5], trains: [3, 3], flips: 'none' },
    { id: 'm3', mode: 'set', lanes: [3, 3], cols: [3, 5], trains: [2, 2], flips: 'some' }
  ],
  hard: [
    { id: 'h1', mode: 'set', lanes: [3, 4], cols: [5, 6], trains: [3, 4], flips: 'most' },
    { id: 'h2', mode: 'order', lanes: [4, 4], cols: [4, 6], trains: [4, 4], flips: 'most' },
    { id: 'h3', mode: 'siding', cars: [4, 7] },
    { id: 'h4', mode: 'set', lanes: [4, 4], cols: [5, 6], trains: [3, 4], flips: 'some' }
  ]
};

export const CHAPTER_SIZE = 100;
export const TEACH = 3;

export function chapter(id) {
  for (const level of LEVELS) {
    const ch = CHAPTERS[level].find((c) => c.id === id);
    if (ch) return { ...ch, level };
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Running trains                                                      */
/* ------------------------------------------------------------------ */

/** Switches by column, for walking. */
function byCol(lay) {
  const cols = Array.from({ length: lay.cols }, () => []);
  lay.x.forEach(([col, src, dst, kind], k) => cols[col].push({ k, src, dst, kind }));
  return cols;
}

/**
 * Run one train from lane `from` with switch states `state` (changed in
 * place: flip-points flip). Returns { to, path: [[col, lane, k|-1, went]] }:
 * the lane at each column, the switch it met (or -1) and whether it turned.
 */
export function runOne(lay, from, state, cols = byCol(lay)) {
  let lane = from;
  const path = [];
  for (let c = 0; c < lay.cols; c++) {
    const sw = cols[c].find((s) => s.src === lane);
    if (!sw) { path.push([c, lane, -1, false]); continue; }
    const turn = state[sw.k] === 1;
    if (sw.kind === 'flip') state[sw.k] ^= 1;
    path.push([c, lane, sw.k, turn]);
    if (turn) lane = sw.dst;
  }
  return { to: lane, path };
}

/** Run a queue of trains in order from `init`. Returns each train's run. */
export function runAll(lay, starts, init) {
  const state = init.slice();
  const cols = byCol(lay);
  return starts.map((from) => runOne(lay, from, state, cols));
}

/** Do these switch settings send every train home? */
export const works = (lay, trains, init) => runAll(lay, trains.map((t) => t.from), init).every((r, i) => r.to === trains[i].to);

/** Every starting setting that works, up to `cap`. */
export function settings(lay, trains, cap = Infinity) {
  const n = lay.x.length;
  const out = [];
  for (let m = 0; m < (1 << n); m++) {
    const init = Array.from({ length: n }, (_, i) => (m >> i) & 1);
    if (works(lay, trains, init)) { out.push(init); if (out.length >= cap) break; }
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Fewest pulls (levers may change between trains)                     */
/* ------------------------------------------------------------------ */

const ham = (a, b) => a.reduce((s, v, i) => s + (v !== b[i] ? 1 : 0), 0);

/**
 * The fewest lever pulls that send a queue home, starting from `start`.
 * Before each train any levers may be pulled; only levers here, so a state
 * either works for one train or not. Exact, over every state per train.
 * Returns { pulls, plan: [state before each train] } or null.
 */
export function minPulls(lay, trains, start) {
  const n = lay.x.length;
  const all = Array.from({ length: 1 << n }, (_, m) => Array.from({ length: n }, (_, i) => (m >> i) & 1));
  let layer = new Map([[start.join(''), { cost: 0, plan: [] }]]);
  for (const t of trains) {
    const next = new Map();
    for (const [key, v] of layer) {
      const from = key.split('').map(Number);
      for (const s of all) {
        if (runOne(lay, t.from, s.slice()).to !== t.to) continue;
        const cost = v.cost + ham(from, s);
        const k2 = s.join('');
        if (!next.has(k2) || next.get(k2).cost > cost) next.set(k2, { cost, plan: [...v.plan, s] });
      }
    }
    layer = next;
    if (!layer.size) return null;
  }
  let best = null;
  for (const v of layer.values()) if (!best || v.cost < best.cost) best = v;
  return { pulls: best.cost, plan: best.plan };
}

/* ------------------------------------------------------------------ */
/* The siding (a stack)                                                */
/* ------------------------------------------------------------------ */

/**
 * Cars arrive in `order` (car numbers, 1 = the first one the zoo wants).
 * The only moves: the next car into the siding ('in'), the top car of the
 * siding out to the zoo ('out'). Knuth's rule: if the car the zoo needs is
 * on top of the siding, bring it out; otherwise push the next car in. It
 * finds the answer whenever there is one, and there is one exactly when the
 * order has no 2-3-1 pattern in it.
 */
export function sidingSolve(order) {
  const stack = [];
  const moves = [];
  let i = 0;
  let want = 1;
  while (want <= order.length) {
    if (stack.length && stack[stack.length - 1] === want) { stack.pop(); moves.push('out'); want += 1; }
    else if (i < order.length) { stack.push(order[i]); i += 1; moves.push('in'); }
    else return null;
  }
  return moves;
}

/** A sortable order from a random string of ins and outs (a Dyck word). */
function sortableOrder(n, rng) {
  /* Random ins and outs that never pop an empty siding, read backwards: the
     output is 1..n, so the input is whatever order fed it. */
  const word = [];
  let open = 0;
  let left = n;
  while (left > 0 || open > 0) {
    const canIn = left > 0;
    const canOut = open > 0;
    if (canIn && (!canOut || rng() < 0.5)) { word.push('in'); open += 1; left -= 1; }
    else { word.push('out'); open -= 1; }
  }
  /* Label cars by the order they come out. */
  const stack = [];
  const input = [];
  let outN = 1;
  const label = new Map();
  let id = 0;
  for (const m of word) {
    if (m === 'in') { stack.push(id); input.push(id); id += 1; }
    else label.set(stack.pop(), outN++);
  }
  return input.map((c) => label.get(c));
}

/* ------------------------------------------------------------------ */
/* Making puzzles                                                      */
/* ------------------------------------------------------------------ */

const between = (rng, [a, b]) => a + randInt(rng, b - a + 1);

function randomLayout(lanes, cols, flips, rng) {
  const x = [];
  for (let c = 0; c < cols; c++) {
    const used = new Set();
    for (let i = 0; i < lanes - 1; i++) {
      if (rng() < 0.55 && !used.has(i) && !used.has(i + 1)) {
        const up = rng() < 0.5;
        const p = flips === 'none' ? 0 : flips === 'some' ? 0.35 : 0.8;
        x.push([c, up ? i + 1 : i, up ? i : i + 1, rng() < p ? 'flip' : 'lever']);
        used.add(i);
        used.add(i + 1);
      }
    }
  }
  return { lanes, cols, x };
}

/** Keep only the switches some train actually meets with this setting. */
function prune(lay, starts, init) {
  const met = new Set();
  runAll(lay, starts, init).forEach((r) => r.path.forEach(([, , k]) => { if (k >= 0) met.add(k); }));
  const keep = lay.x.map((_, k) => k).filter((k) => met.has(k));
  return { lay: { ...lay, x: keep.map((k) => lay.x[k]) }, init: keep.map((k) => init[k]) };
}

/**
 * One puzzle for a chapter, or null. Built backwards: pick a layout and a
 * hidden setting, run the trains, and make wherever they arrive their homes.
 * Kept only if exactly one setting works, so the child is solving, not
 * guessing among several right answers.
 */
export function makePuzzle(chDef, rng, { tries = 300 } = {}) {
  const ch = chDef.level ? chDef : chapter(chDef.id);
  if (ch.mode === 'siding') {
    const n = between(rng, ch.cars);
    for (let t = 0; t < 20; t++) {
      const order = sortableOrder(n, rng);
      if (order.every((v, i) => v === i + 1)) continue;
      const moves = sidingSolve(order);
      return { mode: 'siding', cars: order, par: moves.length };
    }
    return null;
  }
  for (let attempt = 0; attempt < tries; attempt++) {
    const lanes = between(rng, ch.lanes);
    const cols = between(rng, ch.cols);
    const raw = randomLayout(lanes, cols, ch.flips, rng);
    if (raw.x.length < 2) continue;
    const k = between(rng, ch.trains);
    const starts = ch.mode === 'order'
      ? Array(k).fill(0)
      : shuffled(rng, Array.from({ length: lanes }, (_, i) => i)).slice(0, k).map((v, i, a) => (k > lanes ? a[i % lanes] : v));
    const hidden = raw.x.map(() => randInt(rng, 2));
    const { lay, init } = prune(raw, starts, hidden);
    if (lay.x.length < (ch.mode === 'predict' ? 1 : 2)) continue;
    if (ch.flips !== 'none' && !lay.x.some((s) => s[3] === 'flip')) continue;
    const runs = runAll(lay, starts, init);
    const trains = starts.map((from, i) => ({ from, to: runs[i].to }));
    if (ch.mode !== 'predict' && new Set(trains.map((t) => t.to)).size !== trains.length) continue;

    if (ch.mode === 'predict') {
      const turned = runs[0].path.filter(([, , s, went]) => s >= 0 && went).length;
      if (!turned) continue;
      return { mode: 'predict', lay, start: init, trains, par: 1 };
    }
    if (ch.mode === 'order') {
      /* The switches are fixed and shown; the child picks who goes when. */
      return { mode: 'order', lay, start: init, trains, par: 1 };
    }
    if (ch.mode === 'pulls') {
      if (lay.x.some((s) => s[3] !== 'lever') || lay.x.length > 7) continue;
      const start = lay.x.map(() => randInt(rng, 2));
      const best = minPulls(lay, trains, start);
      if (!best || best.pulls < 2) continue;
      return { mode: 'pulls', lay, start, trains, par: best.pulls };
    }
    /* set */
    if (lay.x.length > 9) continue;
    const ok = settings(lay, trains, 2);
    if (ok.length !== 1) continue;
    if (ok[0].every((v) => v === 0) && ch.flips === 'none') continue;
    return { mode: 'set', lay, start: lay.x.map(() => 0), trains, sol: ok[0], par: 1 };
  }
  return null;
}

export const makeAt = (chId, ...seed) => makePuzzle(chapter(chId), rngFor('trains', chId, ...seed));

/** The animals of a puzzle: whose house each lane ends at, or who rides in each car. */
export function dress(p, rng) {
  const ids = shuffled(rng, ANIMALS.map((a) => a.id));
  if (p.mode === 'siding') return { ...p, animals: ids.slice(0, p.cars.length) };
  return { ...p, stations: ids.slice(0, p.lay.lanes) };
}

/** A puzzle's shape, for spotting repeats. */
export const shapeOf = (p) => JSON.stringify(p.mode === 'siding' ? p.cars : [p.lay, p.start, p.trains]);

/* ------------------------------------------------------------------ */
/* Hints                                                               */
/* ------------------------------------------------------------------ */

/**
 * For set puzzles: the first train that goes wrong with the child's
 * setting, and the first switch on its way where the child's setting
 * differs from the answer. Returns { train, k } or null when all is well.
 */
export function setHint(p, mine) {
  const runs = runAll(p.lay, p.trains.map((t) => t.from), mine);
  const bad = runs.findIndex((r, i) => r.to !== p.trains[i].to);
  if (bad < 0) return null;
  const k = p.sol.findIndex((v, i) => v !== mine[i] && runs[bad].path.some(([, , s]) => s === i));
  const any = p.sol.findIndex((v, i) => v !== mine[i]);
  return { train: bad, k: k >= 0 ? k : any };
}

/** How many trains meet switch k before train t (so how often a flip has flipped). */
export function metBefore(p, init, t, k) {
  const runs = runAll(p.lay, p.trains.map((x) => x.from), init);
  let n = 0;
  for (let i = 0; i < t; i++) if (runs[i].path.some(([, , s]) => s === k)) n += 1;
  return n;
}

/* ------------------------------------------------------------------ */
/* Stars                                                               */
/* ------------------------------------------------------------------ */

/**
 *   set, order    ★★★ first GO · ★★ second · ★ later; a hint makes it ★
 *   predict       ★★★ first tap, else ★
 *   pulls         ★★★ at par · ★★ par + 1 · ★
 *   siding        ★★★ no wrong move · ★★ one · ★
 */
export function starsFor(mode, { hints = 0, runs = 1, pulls = 0, par = 0, wrong = 0 } = {}) {
  if (hints > 0) return 1;
  if (mode === 'predict') return runs <= 1 ? 3 : 1;
  if (mode === 'pulls') return pulls <= par ? 3 : pulls <= par + 1 ? 2 : 1;
  if (mode === 'siding') return wrong === 0 ? 3 : wrong === 1 ? 2 : 1;
  return runs <= 1 ? 3 : runs <= 2 ? 2 : 1;
}

export default {
  LEVELS, CHAPTERS, CHAPTER_SIZE, TEACH, chapter, runOne, runAll, works, settings, minPulls,
  sidingSolve, makePuzzle, makeAt, dress, shapeOf, setHint, metBefore, starsFor
};
