/**
 * jamlogic.js — Zoo Traffic Jam: the parking lot, sliding carts, and puzzles.
 *
 * The keeper's van is stuck in a full parking lot. Carts slide along their
 * own length only (a sideways cart left and right, an up-and-down cart up and
 * down) and cannot jump over anything. Slide them until the van can drive
 * out of the gate on the right of its row. This is the sliding-block traffic
 * puzzle invented by Nob Yoshigahara; the name and every level here are the
 * zoo's own.
 *
 * One move is one slide of one cart, however far it goes. The fewest moves is
 * a fact, not a guess: breadth-first search visits every position the lot
 * can reach. Puzzles are made the way the published 6×6 counts were made:
 * build a lot, search its whole family of positions backwards from the
 * solved ones, and start from a position exactly as far away as a chapter
 * wants. Pure: no DOM, no Math.random.
 *
 * A puzzle: { n, cars: [[row, col, len, 'h'|'v'], ...], rocks: [[row, col]], min }.
 * Car 0 is the keeper's van: always sideways, 2 long, on the gate row.
 */

import { randInt, shuffled } from './logicrng.js';

export const LEVELS = ['easy', 'medium', 'hard'];

/* ------------------------------------------------------------------ */
/* Chapters                                                            */
/* ------------------------------------------------------------------ */

/**
 * n: the lot is n×n. cars: how many carts besides the van. trucks: how many
 * of those are 3 long. rocks: squares that never move. moves: the fewest
 * moves a puzzle in this chapter needs. climb: make lots deeper step by
 * step (see climb()), for chapters random lots seldom reach.
 */
export const CHAPTERS = {
  easy: [
    { id: 'e1', n: 5, cars: [3, 5], trucks: [0, 1], rocks: [0, 0], moves: [1, 4] },
    { id: 'e2', n: 6, cars: [5, 8], trucks: [0, 2], rocks: [0, 0], moves: [3, 7] },
    { id: 'e3', n: 6, cars: [6, 9], trucks: [2, 3], rocks: [0, 0], moves: [5, 10] }
  ],
  medium: [
    { id: 'm1', n: 6, cars: [7, 10], trucks: [1, 3], rocks: [0, 0], moves: [8, 12] },
    { id: 'm2', n: 6, cars: [6, 9], trucks: [1, 3], rocks: [1, 2], moves: [10, 15] },
    { id: 'm3', n: 6, cars: [8, 11], trucks: [2, 4], rocks: [0, 0], moves: [13, 19] }
  ],
  hard: [
    { id: 'h1', n: 6, cars: [8, 12], trucks: [2, 4], rocks: [0, 0], moves: [16, 21], climb: true },
    { id: 'h2', n: 6, cars: [8, 11], trucks: [2, 4], rocks: [1, 2], moves: [18, 24], climb: true },
    { id: 'h3', n: 6, cars: [9, 12], trucks: [2, 4], rocks: [0, 1], moves: [22, 32], climb: true }
  ]
};

export const CHAPTER_SIZE = 100;
export const TEACH = 3;
/* Today's puzzle and endless practice come from a pool built with the bank
   (RESERVE a level), not made on the device: a deep lot can take seconds to
   search, and a child should not wait for it. */
export const RESERVE = 120;

export function chapter(id) {
  for (const level of LEVELS) {
    const ch = CHAPTERS[level].find((c) => c.id === id);
    if (ch) return { ...ch, level };
  }
  return null;
}

/** The gate row: the middle, or just above it. */
export const gateRow = (n) => Math.floor((n - 1) / 2);

/* ------------------------------------------------------------------ */
/* Positions                                                           */
/* ------------------------------------------------------------------ */

/*
 * A position is the cars' moving coordinate only (the column of a sideways
 * car, the row of an up-and-down one), since nothing else ever changes. The
 * searches store it as one number, three bits a car, so a family of a
 * hundred thousand positions is a Map of numbers, not of strings.
 */

/** The fixed parts of a lot, worked out once: lanes and walls. */
export function prepare(p) {
  const { n, cars } = p;
  const wall = new Uint8Array(n * n);
  for (const [r, c] of p.rocks || []) wall[r * n + c] = 1;
  const lane = cars.map(([r, c, len, d]) => (d === 'h' ? { fixed: r, len, h: true } : { fixed: c, len, h: false }));
  const start = cars.map(([r, c, , d]) => (d === 'h' ? c : r));
  const pw = lane.map((_, i) => 8 ** i);
  const walls = [];
  wall.forEach((w, i) => { if (w) walls.push(i); });
  return { n, wall, walls, lane, start, gate: gateRow(n), pw, buf: new Int8Array(lane.length), g: new Uint8Array(n * n) };
}

/** A position as one number, and back. */
export const encode = (L, pos) => pos.reduce((sum, x, i) => sum + x * L.pw[i], 0);
export function decode(L, code, out = new Array(L.lane.length)) {
  let c = code;
  for (let i = 0; i < L.lane.length; i++) { out[i] = c % 8; c = Math.floor(c / 8); }
  return out;
}

/**
 * Call `each(nextCode, car, newCoord)` for every slide from the position
 * `code`. The fast path for the searches: one shared grid, no arrays made.
 */
function eachSlide(L, code, each) {
  const { n, lane, g, buf, pw } = L;
  decode(L, code, buf);
  g.fill(0);
  for (const w of L.walls) g[w] = 255;
  for (let i = 0; i < lane.length; i++) {
    const ln = lane[i];
    for (let k = 0; k < ln.len; k++) g[ln.h ? ln.fixed * n + buf[i] + k : (buf[i] + k) * n + ln.fixed] = 1;
  }
  for (let i = 0; i < lane.length; i++) {
    const ln = lane[i];
    const p = buf[i];
    if (ln.h) {
      const row = ln.fixed * n;
      for (let x = p - 1; x >= 0 && !g[row + x]; x--) each(code + (x - p) * pw[i], i, x);
      for (let x = p + ln.len; x < n && !g[row + x]; x++) each(code + (x - ln.len + 1 - p) * pw[i], i, x - ln.len + 1);
    } else {
      const col = ln.fixed;
      for (let x = p - 1; x >= 0 && !g[x * n + col]; x--) each(code + (x - p) * pw[i], i, x);
      for (let x = p + ln.len; x < n && !g[x * n + col]; x++) each(code + (x - ln.len + 1 - p) * pw[i], i, x - ln.len + 1);
    }
  }
}

const solvedCode = (L, code) => (code % 8) + L.lane[0].len === L.n;

/** Which squares are taken in a position: car index + 1, 255 for a rock, 0 free. */
function grid(L, pos) {
  const g = new Uint8Array(L.n * L.n);
  for (let i = 0; i < g.length; i++) if (L.wall[i]) g[i] = 255;
  L.lane.forEach((ln, i) => {
    for (let k = 0; k < ln.len; k++) {
      const r = ln.h ? ln.fixed : pos[i] + k;
      const c = ln.h ? pos[i] + k : ln.fixed;
      g[r * L.n + c] = i + 1;
    }
  });
  return g;
}

/** Every slide from a position: [car, newCoord]. */
export function slides(L, pos, g = grid(L, pos)) {
  const out = [];
  const at = (ln, x) => (ln.h ? g[ln.fixed * L.n + x] : g[x * L.n + ln.fixed]);
  L.lane.forEach((ln, i) => {
    for (let x = pos[i] - 1; x >= 0 && !at(ln, x); x--) out.push([i, x]);
    for (let x = pos[i] + ln.len; x < L.n && !at(ln, x); x++) out.push([i, x - ln.len + 1]);
  });
  return out;
}

/** Is the van at the gate? (Its front is on the last column.) */
export const solvedPos = (L, pos) => pos[0] + L.lane[0].len === L.n;

/** Is a position legal: inside the lot, nothing overlapping? */
export function legal(L, pos) {
  const seen = new Uint8Array(L.n * L.n);
  for (let i = 0; i < L.n * L.n; i++) if (L.wall[i]) seen[i] = 1;
  for (let i = 0; i < L.lane.length; i++) {
    const ln = L.lane[i];
    if (pos[i] < 0 || pos[i] + ln.len > L.n) return false;
    for (let k = 0; k < ln.len; k++) {
      const cell = ln.h ? ln.fixed * L.n + pos[i] + k : (pos[i] + k) * L.n + ln.fixed;
      if (seen[cell]) return false;
      seen[cell] = 1;
    }
  }
  return true;
}

/* ------------------------------------------------------------------ */
/* Solving                                                             */
/* ------------------------------------------------------------------ */

/**
 * The fewest moves from `pos` to the gate, and one shortest path:
 * [[car, newCoord], ...]. null if the van can never get out, or the search
 * passes `cap` positions.
 */
export function solve(L, pos = L.start, cap = 400000) {
  const c0 = encode(L, pos);
  if (solvedCode(L, c0)) return { min: 0, path: [] };
  const prev = new Map([[c0, null]]);
  let frontier = [c0];
  let found = null;
  while (frontier.length && found === null) {
    const next = [];
    for (const c of frontier) {
      eachSlide(L, c, (q, i, x) => {
        if (found !== null || prev.has(q)) return;
        prev.set(q, [c, i, x]);
        if (solvedCode(L, q)) found = q;
        next.push(q);
      });
      if (found !== null) break;
      if (prev.size > cap) return null;
    }
    frontier = next;
  }
  if (found === null) return null;
  const path = [];
  for (let k = found; prev.get(k); k = prev.get(k)[0]) path.unshift([prev.get(k)[1], prev.get(k)[2]]);
  return { min: path.length, path };
}

/** The next move on a shortest path from `pos` (a hint), or null. */
export function nextMove(L, pos) {
  const s = solve(L, pos);
  return s && s.path.length ? s.path[0] : null;
}

/**
 * Every position in the family of `pos` (as numbers), with how many moves
 * each is from the gate. Moves can always be undone, so the family is the
 * same whichever position it is searched from. null past `cap` positions.
 */
export function family(L, pos, cap = 150000) {
  const c0 = encode(L, pos);
  const seen = new Map([[c0, -1]]);
  const all = [c0];
  for (let h = 0; h < all.length; h++) {
    eachSlide(L, all[h], (q) => {
      if (seen.has(q)) return;
      seen.set(q, -1);
      all.push(q);
    });
    if (all.length > cap) return null;
  }
  /* Backwards from every solved position at once. */
  let frontier = all.filter((c) => solvedCode(L, c));
  frontier.forEach((c) => seen.set(c, 0));
  for (let d = 1; frontier.length; d++) {
    const next = [];
    for (const c of frontier) {
      eachSlide(L, c, (q) => {
        if (seen.get(q) !== -1) return;
        seen.set(q, d);
        next.push(q);
      });
    }
    frontier = next;
  }
  return seen;
}

/* ------------------------------------------------------------------ */
/* Making puzzles                                                      */
/* ------------------------------------------------------------------ */

/** A random lot for a chapter: the van, carts and trucks, rocks. */
function randomLot(ch, rng) {
  const n = ch.n;
  const gate = gateRow(n);
  const taken = new Uint8Array(n * n);
  const cars = [];
  const put = (r, c, len, d) => {
    for (let k = 0; k < len; k++) {
      const cell = d === 'h' ? r * n + c + k : (r + k) * n + c;
      if (taken[cell]) return false;
    }
    for (let k = 0; k < len; k++) taken[d === 'h' ? r * n + c + k : (r + k) * n + c] = 1;
    cars.push([r, c, len, d]);
    return true;
  };
  /* The van starts away from the gate, so there is always something to do. */
  put(gate, randInt(rng, n - 3), 2, 'h');
  const rocks = [];
  const nRocks = ch.rocks[0] + randInt(rng, ch.rocks[1] - ch.rocks[0] + 1);
  for (let t = 0; rocks.length < nRocks && t < 50; t++) {
    const r = randInt(rng, n);
    const c = randInt(rng, n);
    if (r === gate || taken[r * n + c]) continue;
    taken[r * n + c] = 1;
    rocks.push([r, c]);
  }
  const want = ch.cars[0] + randInt(rng, ch.cars[1] - ch.cars[0] + 1);
  const trucks = ch.trucks[0] + randInt(rng, ch.trucks[1] - ch.trucks[0] + 1);
  for (let t = 0; cars.length - 1 < want && t < 400; t++) {
    const len = cars.length - 1 < trucks ? 3 : 2;
    const d = rng() < 0.5 ? 'h' : 'v';
    /* Nothing else lies sideways in the gate row: it could never get out of
       the van's way. */
    const r = d === 'h' ? randInt(rng, n) : randInt(rng, n - len + 1);
    const c = d === 'h' ? randInt(rng, n - len + 1) : randInt(rng, n);
    if (d === 'h' && r === gate) continue;
    put(r, c, len, d);
  }
  return { n, cars, rocks };
}

/** How far the family of a lot reaches: its deepest position's moves, or -1. */
function depthOf(lot, cap) {
  const L = prepare(lot);
  if (!legal(L, L.start)) return { depth: -1 };
  const fam = family(L, L.start, cap);
  if (!fam) return { depth: -1 };
  let depth = -1;
  for (const d of fam.values()) if (d > depth) depth = d;
  return { depth, fam };
}

/**
 * Random lots seldom need 25 moves or more. So for deep chapters a lot
 * climbs: change one cart at a time (take one away, add one, or move one
 * somewhere else) and keep the change whenever the family reaches as far or
 * further. A few hundred steps finds lots as deep as the hardest toys.
 */
function climb(ch, rng, lot, { steps = 300, cap = 150000 } = {}) {
  const n = ch.n;
  const gate = gateRow(n);
  let cur = lot;
  let score = depthOf(cur, cap).depth;
  const count = (l) => l.cars.length - 1;
  const trucks = (l) => l.cars.slice(1).filter((c) => c[2] === 3).length;
  for (let t = 0; t < steps && score < ch.moves[1]; t++) {
    const cars = cur.cars.map((c) => c.slice());
    const op = randInt(rng, 3);
    if (op === 0 && count(cur) > ch.cars[0]) cars.splice(1 + randInt(rng, count(cur)), 1);
    else {
      if (op === 1 && count(cur) >= ch.cars[1]) continue;
      if (op === 2) cars.splice(1 + randInt(rng, count(cur)), 1);
      const len = rng() < 0.35 ? 3 : 2;
      const d = rng() < 0.5 ? 'h' : 'v';
      const r = d === 'h' ? randInt(rng, n) : randInt(rng, n - len + 1);
      const c = d === 'h' ? randInt(rng, n - len + 1) : randInt(rng, n);
      if (d === 'h' && r === gate) continue;
      cars.push([r, c, len, d]);
    }
    const next = { n, cars, rocks: cur.rocks };
    const tk = trucks(next);
    if (tk < ch.trucks[0] || tk > ch.trucks[1] || count(next) < ch.cars[0] || count(next) > ch.cars[1]) continue;
    const got = depthOf(next, cap).depth;
    if (got >= score) { cur = next; score = got; }
  }
  return cur;
}

/** A deep lot with a few carts taken away and put back elsewhere. */
function shake(ch, rng, lot) {
  const n = ch.n;
  const gate = gateRow(n);
  const cars = lot.cars.map((c) => c.slice());
  for (let k = 0; k < 3; k++) {
    if (cars.length > 2) cars.splice(1 + randInt(rng, cars.length - 1), 1);
    const len = rng() < 0.35 ? 3 : 2;
    const d = rng() < 0.5 ? 'h' : 'v';
    const r = d === 'h' ? randInt(rng, n) : randInt(rng, n - len + 1);
    const c = d === 'h' ? randInt(rng, n - len + 1) : randInt(rng, n);
    if (!(d === 'h' && r === gate)) cars.push([r, c, len, d]);
  }
  return { n, cars, rocks: lot.rocks };
}

/** The lot `lot` with its cars moved to position `pos`. */
function placed(lot, pos) {
  return lot.cars.map(([r, c, len, d], i) => (d === 'h' ? [r, pos[i], len, d] : [pos[i], c, len, d]));
}

/**
 * One puzzle for a chapter, or null after `tries` lots. From each lot's
 * family it starts at the position furthest from the gate, if that is in the
 * chapter's range; otherwise at a random position that is.
 */
export function makePuzzle(ch, rng, { tries = 60, cap = 150000, steps = 300, from = null } = {}) {
  const [lo, hi] = ch.moves;
  for (let t = 0; t < tries; t++) {
    /* A deep chapter may start from the last deep lot (`from`), shaken a
       little, instead of from nothing: the climb is then short. */
    let lot = from && t === 0 ? shake(ch, rng, from) : randomLot(ch, rng);
    if (lot.cars.length - 1 < ch.cars[0]) continue;
    if (ch.climb) lot = climb(ch, rng, lot, { steps, cap });
    const L = prepare(lot);
    if (!legal(L, L.start)) continue;
    const fam = family(L, L.start, cap);
    if (!fam) continue;
    let best = -1;
    const inRange = [];
    for (const [k, d] of fam) {
      if (d > best) best = d;
      if (d >= lo && d <= hi) inRange.push(k);
    }
    if (!inRange.length) continue;
    /* The hardest start in range: the furthest position, or a random one of
       those as far as possible. */
    const top = Math.min(best, hi);
    const pick = inRange.filter((k) => fam.get(k) === top);
    const k = pick[randInt(rng, pick.length)];
    const pos = decode(L, k);
    const cars = placed(lot, pos);
    /* Carts that never have to move stay in the lot, as in the toy: they are
       part of the jam a child has to read. `lot` is for the next climb only. */
    return { n: lot.n, cars, rocks: lot.rocks, min: fam.get(k), lot: { n: lot.n, cars, rocks: lot.rocks } };
  }
  return null;
}

/** A stable string for spotting a repeated puzzle (mirror images too). */
export function shapeOf(p) {
  const flip = (cars) => cars.map(([r, c, len, d]) => (d === 'h' ? [p.n - 1 - r, c, len, d] : [p.n - len - r, c, len, d]));
  const norm = (cars, rocks) => JSON.stringify([cars.slice(1).map((x) => x.join()).sort(), cars[0].join(), rocks.map((x) => x.join()).sort()]);
  /* Turning the lot upside down keeps the gate row only when it is the middle. */
  const a = norm(p.cars, p.rocks);
  if (p.n % 2 === 0) return a;
  const b = norm(flip(p.cars), p.rocks.map(([r, c]) => [p.n - 1 - r, c]));
  return a < b ? a : b;
}

/* ------------------------------------------------------------------ */
/* Stars                                                               */
/* ------------------------------------------------------------------ */

/** How many moves above the fewest still earn ★★. */
export const slack = (min) => Math.max(2, Math.ceil(min / 4));

/**
 *   ★★★ the fewest moves · ★★ a few more · ★ any way out
 *   ★ if the whole answer was shown
 */
export function starsFor({ moves, min, shown = false }) {
  if (shown) return 1;
  if (moves <= min) return 3;
  return moves <= min + slack(min) ? 2 : 1;
}

export default {
  LEVELS, CHAPTERS, CHAPTER_SIZE, TEACH, RESERVE, chapter, gateRow, prepare, encode, decode, slides, solvedPos, legal,
  solve, nextMove, family, makePuzzle, shapeOf, slack, starsFor
};
