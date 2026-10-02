/**
 * bridgeslogic.js — Zoo Bridges: the grid, the solver and the puzzle maker.
 *
 * Islands hold numbers. Join them with straight bridges, across or down, at
 * most two between a pair, never crossing, until every island has as many
 * bridges as its number and every island can reach every other. A puzzle
 * type first published by Nikoli (Japan, 1990); our name, our text. The
 * research, with the technique ladder and the measured numbers, is
 * docs/research/logic/research-bridges.md.
 *
 * Pure: no DOM, no Math.random.
 *
 * A puzzle is written the way Simon Tatham's Bridges writes one: "7x7:" and
 * then the cells row by row, a digit for an island and a letter for a run of
 * empty cells (a = 1, b = 2, ...). "5x5:2a3a2e..." is short and readable.
 *
 * The solver keeps, for every possible bridge route, the fewest and the most
 * bridges it can still hold (lo, hi), and a group for every set of islands
 * already joined. Every rule only ever narrows those bounds with a reason a
 * child can be told, so when deduction alone finishes the grid, the answer is
 * the only one there is: the solver is the uniqueness proof.
 */

import { randInt, rngFor, shuffled } from './logicrng.js';

export const LEVELS = ['easy', 'medium', 'hard'];

/* ------------------------------------------------------------------ */
/* Techniques and chapters                                             */
/* ------------------------------------------------------------------ */

/* Each tag the solver writes, and the rung of the ladder it belongs to. */
export const TECH_LEVEL = {
  noCross: 1, full: 1, cap: 1, onlyNeighbour: 1,
  justEnough: 2, atLeastOne: 3, pairIsolation: 4,
  closedGroup: 5, onlyExit: 5, whatIf: 6
};

/**
 * size: grid; maxb: most bridges between two islands; isl: islands, low and
 * high; tl: the hardest technique allowed (its rung, 1-6); need: techniques of
 * which at least one must appear (the chapter's lesson), or null; min: the
 * lowest rung the hardest step may be on (default: the lesson's, or tl).
 */
const C = (id, size, maxb, isl, tl, need, min) => ({
  id, w: size, h: size, maxb, isl, tl, need: need ? [].concat(need) : null, min: min || null
});
export const CHAPTERS = {
  easy: [
    C('e1', 6, 1, [4, 8], 2, 'onlyNeighbour', 1),
    C('e2', 6, 1, [6, 9], 2, ['noCross', 'full'], 1),
    C('e3', 6, 1, [7, 10], 2, null),
    C('e4', 5, 2, [4, 7], 1, null),
    C('e5', 6, 2, [6, 9], 2, 'justEnough'),
    C('e6', 7, 2, [8, 12], 2, 'justEnough'),
    C('e7', 7, 2, [8, 12], 2, null),
    C('e8', 7, 2, [8, 12], 3, 'atLeastOne'),
    C('e9', 7, 2, [9, 13], 3, null),
    C('e10', 7, 2, [10, 14], 3, null)
  ],
  medium: [
    C('m1', 7, 2, [9, 14], 4, 'pairIsolation'),
    C('m2', 8, 2, [11, 16], 3, 'atLeastOne'),
    C('m3', 8, 2, [11, 16], 4, null),
    C('m4', 8, 2, [11, 17], 5, ['onlyExit', 'closedGroup']),
    C('m5', 9, 2, [13, 19], 5, 'closedGroup'),
    C('m6', 9, 2, [13, 20], 5, null),
    C('m7', 9, 2, [14, 21], 5, null),
    C('m8', 10, 2, [15, 22], 5, null),
    C('m9', 10, 2, [16, 23], 5, null),
    C('m10', 10, 2, [17, 24], 5, null)
  ],
  hard: [
    C('h1', 10, 2, [17, 24], 5, 'closedGroup'),
    C('h2', 11, 2, [19, 27], 5, ['onlyExit', 'closedGroup']),
    C('h3', 12, 2, [21, 30], 5, null),
    C('h4', 12, 2, [24, 34], 5, null),
    C('h5', 12, 2, [24, 34], 5, null),
    C('h6', 10, 2, [17, 24], 6, 'whatIf'),
    C('h7', 11, 2, [19, 28], 6, 'whatIf'),
    C('h8', 12, 2, [21, 31], 6, null, 5),
    C('h9', 13, 2, [24, 34], 6, null, 5),
    C('h10', 13, 2, [26, 36], 6, null, 5)
  ]
};

export const CHAPTER_SIZE = 30;
export const TEACH = 2;

export function chapter(id) {
  for (const level of LEVELS) {
    const ch = CHAPTERS[level].find((c) => c.id === id);
    if (ch) return { ...ch, level };
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* The grid                                                            */
/* ------------------------------------------------------------------ */

/** "5x5:2a3..." -> { w, h, isl: [{ x, y, n }] }, islands in reading order. */
export function parse(g) {
  const m = /^(\d+)x(\d+):(.*)$/.exec(g);
  if (!m) throw new Error(`not a grid: ${g}`);
  const w = Number(m[1]);
  const h = Number(m[2]);
  const isl = [];
  let pos = 0;
  for (const ch of m[3]) {
    if (/[1-8]/.test(ch)) { isl.push({ x: pos % w, y: Math.floor(pos / w), n: Number(ch) }); pos += 1; }
    else if (/[a-z]/.test(ch)) pos += ch.charCodeAt(0) - 96;
    else throw new Error(`bad character "${ch}" in ${g}`);
  }
  if (pos !== w * h) throw new Error(`${g} covers ${pos} cells, not ${w * h}`);
  return { w, h, isl };
}

/** The other way round. */
export function encode(w, h, isl) {
  const at = new Map(isl.map((i) => [i.y * w + i.x, i.n]));
  let out = `${w}x${h}:`;
  let run = 0;
  const flush = () => {
    while (run > 0) { const k = Math.min(26, run); out += String.fromCharCode(96 + k); run -= k; }
  };
  for (let p = 0; p < w * h; p++) {
    if (at.has(p)) { flush(); out += String(at.get(p)); } else run += 1;
  }
  flush();
  return out;
}

/**
 * The routes: every pair of islands that see each other along a row or a
 * column with nothing in between. edges[e] = { a, b, dir, cells, max };
 * adj[i] lists island i's routes; cross[e] lists routes that cross e.
 */
export function graph(p, maxb) {
  const at = new Map(p.isl.map((i, k) => [`${i.x},${i.y}`, k]));
  const edges = [];
  p.isl.forEach((i, a) => {
    for (const [dx, dy, dir] of [[1, 0, 'h'], [0, 1, 'v']]) {
      const cells = [];
      let x = i.x + dx;
      let y = i.y + dy;
      while (x < p.w && y < p.h) {
        const b = at.get(`${x},${y}`);
        if (b !== undefined) {
          edges.push({ a, b, dir, cells, max: Math.min(maxb, i.n, p.isl[b].n) });
          break;
        }
        cells.push([x, y]);
        x += dx;
        y += dy;
      }
    }
  });
  const adj = p.isl.map(() => []);
  edges.forEach((e, k) => { adj[e.a].push(k); adj[e.b].push(k); });
  const cellOf = edges.map((e) => new Set(e.cells.map(([x, y]) => `${x},${y}`)));
  const cross = edges.map((e, k) => edges
    .map((f, j) => (f.dir !== e.dir && [...cellOf[k]].some((c) => cellOf[j].has(c)) ? j : -1))
    .filter((j) => j >= 0));
  return { edges, adj, cross };
}

export const other = (e, i) => (e.a === i ? e.b : e.a);

/* ------------------------------------------------------------------ */
/* Checking a set of bridges                                           */
/* ------------------------------------------------------------------ */

/** Groups of islands joined by the routes with a bridge (values > 0). */
export function groups(p, G, vals) {
  const parent = p.isl.map((_, i) => i);
  const find = (i) => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  G.edges.forEach((e, k) => { if (vals[k] > 0) parent[find(e.a)] = find(e.b); });
  return p.isl.map((_, i) => find(i));
}

export const countAt = (G, vals, i) => G.adj[i].reduce((s, k) => s + vals[k], 0);

/** Is this a finished, correct grid? */
export function isSolution(p, G, vals) {
  if (p.isl.some((isl, i) => countAt(G, vals, i) !== isl.n)) return false;
  if (G.edges.some((e, k) => vals[k] > 0 && G.cross[k].some((j) => vals[j] > 0))) return false;
  return new Set(groups(p, G, vals)).size === 1;
}

/* ------------------------------------------------------------------ */
/* The solver                                                          */
/* ------------------------------------------------------------------ */

function sums(p, G, lo, hi) {
  return p.isl.map((_, i) => G.adj[i].reduce((s, k) => [s[0] + lo[k], s[1] + hi[k]], [0, 0]));
}

/** Groups by bridges certainly there (lo > 0), with their size and open bridge-ends. */
function groupInfo(p, G, lo) {
  const g = groups(p, G, lo);
  const S = sums(p, G, lo, lo);
  const info = new Map();
  p.isl.forEach((isl, i) => {
    const r = info.get(g[i]) || { size: 0, free: 0 };
    r.size += 1;
    r.free += isl.n - S[i][0];
    info.set(g[i], r);
  });
  return { g, info };
}

function broken(p, G, lo, hi) {
  if (lo.some((v, k) => v > hi[k])) return true;
  const S = sums(p, G, lo, hi);
  if (p.isl.some((isl, i) => S[i][0] > isl.n || S[i][1] < isl.n)) return true;
  if (G.edges.some((e, k) => lo[k] > 0 && G.cross[k].some((j) => lo[j] > 0))) return true;
  const N = p.isl.length;
  const { info } = groupInfo(p, G, lo);
  for (const r of info.values()) if (r.free === 0 && r.size < N) return true;
  return false;
}

/* One step of one rule, or null. A step changes one bound on one route:
   { tag, edge, island?, lo? | hi?, via? }. */
function stepAt(p, G, lo, hi, maxLevel) {
  const N = p.isl.length;
  /* No crossing: a bridge that is certainly there closes every route across it. */
  for (let k = 0; k < lo.length; k++) {
    if (lo[k] === 0) continue;
    for (const j of G.cross[k]) if (hi[j] > 0) return { tag: 'noCross', edge: j, hi: 0, via: k };
  }
  const S = sums(p, G, lo, hi);
  /* Full up / cap: an island cannot take more than its number allows. */
  for (let i = 0; i < N; i++) {
    const n = p.isl[i].n;
    for (const k of G.adj[i]) {
      const most = n - (S[i][0] - lo[k]);
      if (most < hi[k]) return { tag: S[i][0] === n ? 'full' : 'cap', edge: k, island: i, hi: Math.max(most, lo[k]) };
    }
  }
  /* Only one friend / just enough / at least one each way. */
  for (let i = 0; i < N; i++) {
    const n = p.isl[i].n;
    const open = G.adj[i].filter((k) => hi[k] > 0);
    for (const k of G.adj[i]) {
      const need = n - (S[i][1] - hi[k]);
      if (need > lo[k]) {
        const tag = open.length === 1 ? 'onlyNeighbour' : S[i][1] === n ? 'justEnough' : 'atLeastOne';
        if (TECH_LEVEL[tag] > maxLevel) continue;
        return { tag, edge: k, island: i, lo: Math.min(need, hi[k]) };
      }
    }
  }
  if (maxLevel < 4 || N <= 2) return null;
  /* Don't trap a pair: two islands that would fill each other up. */
  for (let k = 0; k < lo.length; k++) {
    const e = G.edges[k];
    const m = p.isl[e.a].n;
    if (m === p.isl[e.b].n && hi[k] >= m && lo[k] < m) return { tag: 'pairIsolation', edge: k, island: e.a, hi: m - 1 };
  }
  if (maxLevel < 5) return null;
  /* Keep the zoo together. */
  const { g, info } = groupInfo(p, G, lo);
  for (let k = 0; k < lo.length; k++) {
    if (lo[k] >= hi[k]) continue;
    const e = G.edges[k];
    const A = info.get(g[e.a]);
    const B = info.get(g[e.b]);
    const same = g[e.a] === g[e.b];
    const size = same ? A.size : A.size + B.size;
    const free = same ? A.free : A.free + B.free;
    if (size < N && free - 2 === 0) return { tag: 'closedGroup', edge: k, island: e.a, hi: lo[k] };
  }
  for (const [root, r] of info) {
    if (r.size >= N) continue;
    const exits = [];
    G.edges.forEach((e, k) => {
      if (hi[k] > 0 && (g[e.a] === root) !== (g[e.b] === root)) exits.push(k);
    });
    if (exits.length === 1 && lo[exits[0]] === 0) {
      const e = G.edges[exits[0]];
      return { tag: 'onlyExit', edge: exits[0], island: g[e.a] === root ? e.a : e.b, lo: 1 };
    }
  }
  return null;
}

const applyStep = (lo, hi, s) => {
  if (s.lo !== undefined) lo[s.edge] = Math.max(lo[s.edge], s.lo);
  if (s.hi !== undefined) hi[s.edge] = Math.min(hi[s.edge], s.hi);
};

/** Run the rules up to a level until stuck. Returns 'broken' or 'stuck'. */
function settle(p, G, lo, hi, maxLevel) {
  for (let guard = 0; guard < 2000; guard++) {
    if (broken(p, G, lo, hi)) return 'broken';
    const s = stepAt(p, G, lo, hi, maxLevel);
    if (!s) return 'stuck';
    applyStep(lo, hi, s);
  }
  return 'stuck';
}

/* What if…? Try one route at its fewest or its most and follow it through. */
function whatIf(p, G, lo, hi) {
  for (let k = 0; k < lo.length; k++) {
    if (lo[k] >= hi[k]) continue;
    const l1 = lo.slice(); const h1 = hi.slice();
    h1[k] = lo[k];
    if (settle(p, G, l1, h1, 5) === 'broken') return { tag: 'whatIf', edge: k, island: G.edges[k].a, lo: lo[k] + 1, tried: lo[k] };
    const l2 = lo.slice(); const h2 = hi.slice();
    l2[k] = hi[k];
    if (settle(p, G, l2, h2, 5) === 'broken') return { tag: 'whatIf', edge: k, island: G.edges[k].a, hi: hi[k] - 1, tried: hi[k] };
  }
  return null;
}

/**
 * Solve like a person, using techniques up to `maxLevel`.
 * Returns { solved, level, steps, vals, tags }.
 * `from` (optional) gives starting fewest-bridges per route: the child's own.
 */
export function humanSolve(p, maxb, { maxLevel = 6, from = null, G = graph(p, maxb) } = {}) {
  const lo = from ? from.slice() : G.edges.map(() => 0);
  const hi = G.edges.map((e) => e.max);
  const steps = [];
  let level = 0;
  for (let guard = 0; guard < 4000; guard++) {
    if (broken(p, G, lo, hi)) break;
    if (lo.every((v, k) => v === hi[k])) break;
    let s = stepAt(p, G, lo, hi, maxLevel);
    if (!s && maxLevel >= 6) s = whatIf(p, G, lo, hi);
    if (!s) break;
    applyStep(lo, hi, s);
    level = Math.max(level, TECH_LEVEL[s.tag]);
    steps.push(s);
  }
  const done = lo.every((v, k) => v === hi[k]) && isSolution(p, G, lo);
  return { solved: done, level, steps, vals: done ? lo : null, tags: [...new Set(steps.map((s) => s.tag))] };
}

/**
 * Count solutions by trying every bridge count (to `cap`). Used by the tests
 * to prove the solver never accepts a grid with two answers; too slow for big
 * grids, which is why the solver itself is the proof.
 */
export function countSolutions(p, maxb, cap = 2) {
  const G = graph(p, maxb);
  const vals = G.edges.map(() => 0);
  let found = 0;
  const S = p.isl.map(() => 0);
  const left = p.isl.map((_, i) => G.adj[i].length);
  const order = G.edges.map((_, k) => k);
  const walk = (idx) => {
    if (found >= cap) return;
    if (idx === order.length) { if (isSolution(p, G, vals)) found += 1; return; }
    const k = order[idx];
    const e = G.edges[k];
    for (let v = 0; v <= e.max; v++) {
      if (v > 0 && G.cross[k].some((j) => vals[j] > 0)) break;
      if (S[e.a] + v > p.isl[e.a].n || S[e.b] + v > p.isl[e.b].n) break;
      vals[k] = v; S[e.a] += v; S[e.b] += v; left[e.a] -= 1; left[e.b] -= 1;
      const ok = [e.a, e.b].every((i) => left[i] > 0 || S[i] === p.isl[i].n);
      if (ok) walk(idx + 1);
      vals[k] = 0; S[e.a] -= v; S[e.b] -= v; left[e.a] += 1; left[e.b] += 1;
    }
  };
  walk(0);
  return found;
}

/* ------------------------------------------------------------------ */
/* Making puzzles                                                      */
/* ------------------------------------------------------------------ */

/**
 * Grow a grid of islands the way Simon Tatham's generator does: start with
 * one island, then over and over walk out from a random island in a random
 * direction and put a new island somewhere along the way, joined by one or
 * two bridges. The numbers are the bridges each island ended up with.
 */
function grow(w, h, maxb, target, rng) {
  const cell = new Map();          // "x,y" -> 'i' (island) or 'h' / 'v' (bridge)
  const isl = [{ x: randInt(rng, w), y: randInt(rng, h), n: 0 }];
  cell.set(`${isl[0].x},${isl[0].y}`, 'i');
  const links = new Map();         // "a-b" -> bridges
  const near = (x, y) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => cell.get(`${x + dx},${y + dy}`) === 'i');
  let fails = 0;
  while (isl.length < target && fails < 80) {
    const a = randInt(rng, isl.length);
    const [dx, dy] = [[1, 0], [-1, 0], [0, 1], [0, -1]][randInt(rng, 4)];
    const free = [];
    let x = isl[a].x + dx;
    let y = isl[a].y + dy;
    let hit = -1;
    while (x >= 0 && y >= 0 && x < w && y < h) {
      const c = cell.get(`${x},${y}`);
      if (c === 'i') { hit = isl.findIndex((i) => i.x === x && i.y === y); break; }
      if (c) break;
      free.push([x, y]);
      x += dx;
      y += dy;
    }
    const dir = dx ? 'h' : 'v';
    const join = (b, path) => {
      const key = a < b ? `${a}-${b}` : `${b}-${a}`;
      if (links.has(key)) return false;
      const n = 1 + randInt(rng, maxb);
      links.set(key, n);
      isl[a].n += n;
      isl[b].n += n;
      for (const [px, py] of path) cell.set(`${px},${py}`, dir);
      return true;
    };
    /* Sometimes close a loop to an island already in the way. */
    if (hit >= 0 && free.length >= 1 && rng() < 0.25) {
      if (!join(hit, free)) fails += 1;
      continue;
    }
    const spots = free.map((c, i) => i).filter((i) => i >= 1 && !near(free[i][0], free[i][1]));
    if (!spots.length) { fails += 1; continue; }
    const t = rng() < 0.25 ? spots[spots.length - 1] : spots[randInt(rng, spots.length)];
    const [nx, ny] = free[t];
    const b = isl.length;
    isl.push({ x: nx, y: ny, n: 0 });
    cell.set(`${nx},${ny}`, 'i');
    if (!join(b, free.slice(0, t))) fails += 1;
  }
  if (isl.some((i) => i.n > 8 || i.n < 1)) return null;
  return isl;
}

/**
 * One puzzle for a chapter, or null after `tries`. Accepted only if the
 * solver, allowed the chapter's techniques and no more, finishes it (so it
 * has one answer and a child with those techniques can do it), it needs the
 * chapter's top technique, and the lesson's technique shows up.
 */
export function makePuzzle(chDef, rng, { tries = 400 } = {}) {
  const ch = chDef.level ? chDef : chapter(chDef.id);
  const [lowI, highI] = ch.isl;
  for (let attempt = 0; attempt < tries; attempt++) {
    const target = lowI + randInt(rng, highI - lowI + 1);
    const grown = grow(ch.w, ch.h, ch.maxb, target, rng);
    if (!grown || grown.length < lowI) continue;
    const order = grown.slice().sort((a, b) => a.y - b.y || a.x - b.x);
    const g = encode(ch.w, ch.h, order);
    const p = parse(g);
    if (ch.maxb === 1 && p.isl.some((i) => i.n > 4)) continue;
    const run = humanSolve(p, ch.maxb, { maxLevel: ch.tl });
    if (!run.solved) continue;
    /* It must need the chapter's newest technique, or at least use the
       lesson's one: a chapter about "just enough" that never needs it is a
       chapter about something else. */
    if (run.level < minLevel(ch)) continue;
    if (ch.need && !ch.need.some((t) => run.tags.includes(t))) continue;
    return { g, maxb: ch.maxb, tech: run.level, steps: run.steps.length };
  }
  return null;
}

/** The lowest rung a chapter's hardest step may be on. */
export function minLevel(ch) {
  if (ch.min) return ch.min;
  if (ch.need) return Math.min(...ch.need.map((t) => TECH_LEVEL[t]));
  return ch.tl;
}

export const makeAt = (chId, ...seed) => makePuzzle(chapter(chId), rngFor('bridges', chId, ...seed));

/** The same grid turned or flipped: for spotting a repeat in disguise. */
export function canonical(g) {
  const p = parse(g);
  const forms = [];
  const tf = [
    (x, y) => [x, y], (x, y) => [p.w - 1 - x, y], (x, y) => [x, p.h - 1 - y], (x, y) => [p.w - 1 - x, p.h - 1 - y],
    (x, y) => [y, x], (x, y) => [p.h - 1 - y, x], (x, y) => [y, p.w - 1 - x], (x, y) => [p.h - 1 - y, p.w - 1 - x]
  ];
  tf.forEach((f, i) => {
    const swap = i >= 4;
    const W = swap ? p.h : p.w;
    const H = swap ? p.w : p.h;
    const isl = p.isl.map((s) => { const [x, y] = f(s.x, s.y); return { x, y, n: s.n }; })
      .sort((a, b) => a.y - b.y || a.x - b.x);
    forms.push(encode(W, H, isl));
  });
  return forms.sort()[0];
}

/**
 * Stars: ★ solved · ★★ at most one hint · ★★★ no hints and no
 * "show me the wrong bridges".
 */
export function starsFor({ hints = 0, reveals = 0 } = {}) {
  if (hints === 0 && reveals === 0) return 3;
  return hints <= 1 ? 2 : 1;
}

export default {
  LEVELS, TECH_LEVEL, CHAPTERS, CHAPTER_SIZE, TEACH, chapter, parse, encode, graph, other, groups,
  countAt, isSolution, humanSolve, countSolutions, makePuzzle, makeAt, canonical, starsFor
};
