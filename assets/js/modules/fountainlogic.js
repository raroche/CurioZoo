/**
 * fountainlogic.js — Elephant Fountain: water on a grid, honestly.
 *
 * The elephant sprays a set number of drops, one at a time. Each drop:
 *   1. falls straight down through empty cells;
 *   2. where it comes to rest (on ground, or on water) it may still move:
 *      it looks at every empty cell touching the pool it joined (or just its
 *      own cell, on dry ground), works out where each would end up if water
 *      went there and fell, and goes to the lowest. Ties go to the cell
 *      nearest where it arrived, then the left one.
 * That one rule makes water fall, spread along a floor, spill over an edge
 * the moment it finds one, fill a basin from the bottom, and rise in both
 * arms of a U-tube together, a row at a time: joined pools end up level,
 * wide or thin (research-levers-shadows-water-dominos.md section 3). Usual
 * grid-water rules ("fall, else spread") get that last one wrong. Nothing is
 * random, so every run is the same on every device.
 *
 * Cells: '.' empty, '#' rock, 'd' dirt (tap to dig), 'g' gate (open or shut),
 * 'T' a trough cell (an animal drinks when every one of its cells is full),
 * 'c' the sleeping cat (water must never reach it).
 *
 * Pure: no DOM, no Math.random.
 */

import { pickOne, randInt, rngFor, shuffled } from './logicrng.js';

export const LEVELS = ['easy', 'medium', 'hard'];

/* ------------------------------------------------------------------ */
/* The simulator                                                       */
/* ------------------------------------------------------------------ */

/* Is score a before score b, number by number? (Never `a < b` on arrays:
   JavaScript compares those as text, and "-7" sorts before "-8".) */
function better(a, b) {
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] < b[i];
  return false;
}

/**
 * Run the fountain. `board` = { w, h, cells: string of w*h, src: column,
 * drops }, `dug` = Set of cell indexes dug out, `open` = Set of gate indexes
 * open. Returns { water: [cell indexes in the order they filled], cat: bool }.
 */
export function run(board, dug = new Set(), open = new Set()) {
  const { w, h, cells } = board;
  const idx = (x, y) => y * w + x;
  const passable = (x, y) => {
    if (x < 0 || x >= w || y < 0 || y >= h) return false;
    const c = cells[idx(x, y)];
    const i = idx(x, y);
    if (c === '#') return false;
    if (c === 'd') return dug.has(i);
    if (c === 'g') return open.has(i);
    return true;                                       // '.', 'T', 'c'
  };
  const water = new Set();
  const order = [];
  const isEmpty = (x, y) => passable(x, y) && !water.has(idx(x, y));
  /* Where water at (x, y) ends up: straight down while the cell below is empty. */
  const settle = (x, y) => {
    while (isEmpty(x, y + 1)) y += 1;
    return [x, y];
  };
  let cat = false;
  for (let drop = 0; drop < board.drops; drop++) {
    if (!isEmpty(board.src, 0)) break;                 // full to the top
    let [x, y] = settle(board.src, 0);
    for (let hop = 0; hop < w * h; hop++) {
      /* The pool it rests on, if any: water joined to the cell below. */
      const pool = new Set();
      if (water.has(idx(x, y + 1))) {
        const stack = [[x, y + 1]];
        pool.add(idx(x, y + 1));
        while (stack.length) {
          const [px, py] = stack.pop();
          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const nx = px + dx;
            const ny = py + dy;
            const k = idx(nx, ny);
            if (nx >= 0 && nx < w && ny >= 0 && ny < h && water.has(k) && !pool.has(k)) { pool.add(k); stack.push([nx, ny]); }
          }
        }
      }
      /* Where it could go: its own cell, its dry neighbours along the floor,
         and every empty cell touching the pool. */
      const cand = new Map([[idx(x, y), [x, y]]]);
      const addCand = (cx, cy) => { if (isEmpty(cx, cy)) cand.set(idx(cx, cy), [cx, cy]); };
      addCand(x - 1, y);
      addCand(x + 1, y);
      for (const k of pool) {
        const px = k % w;
        const py = Math.floor(k / w);
        addCand(px - 1, py); addCand(px + 1, py); addCand(px, py - 1); addCand(px, py + 1);
      }
      let best = null;
      for (const [cx, cy] of cand.values()) {
        const [sx, sy] = settle(cx, cy);
        const score = [-sy, Math.abs(cx - x), cx, cy];   // lowest, nearest, left, then higher row last
        if (!best || better(score, best.score)) best = { at: [cx, cy], to: [sx, sy], score };
      }
      const [tx, ty] = best.to;
      if (tx === x && ty === y) break;                  // it stays here
      [x, y] = [tx, ty];
    }
    water.add(idx(x, y));
    order.push(idx(x, y));
    if (cells[idx(x, y)] === 'c') cat = true;
  }
  return { water: order, cat };
}

/** Trough cells grouped by the animal that drinks there: [{ cells: [...], animal }]. */
export function troughs(board) {
  const seen = new Set();
  const out = [];
  board.cells.split('').forEach((c, i) => {
    if (c !== 'T' || seen.has(i)) return;
    const group = [];
    const stack = [i];
    seen.add(i);
    while (stack.length) {
      const k = stack.pop();
      group.push(k);
      const x = k % board.w;
      for (const n of [k - 1, k + 1, k - board.w, k + board.w]) {
        if (n < 0 || n >= board.cells.length || seen.has(n) || board.cells[n] !== 'T') continue;
        if ((n === k - 1 && x === 0) || (n === k + 1 && x === board.w - 1)) continue;
        seen.add(n);
        stack.push(n);
      }
    }
    out.push(group.sort((a, b) => a - b));
  });
  return out.sort((a, b) => a[0] - b[0]);
}

/** Does a run water every trough and keep the cat dry? */
export function success(board, res) {
  const wet = new Set(res.water);
  return !res.cat && troughs(board).every((g) => g.every((k) => wet.has(k)));
}

/** The order troughs filled in: index of each trough as it became full, first first. */
export function fillOrder(board, res) {
  const groups = troughs(board);
  const done = groups.map(() => -1);
  const wet = new Set();
  res.water.forEach((k, step) => {
    wet.add(k);
    groups.forEach((g, i) => { if (done[i] < 0 && g.every((c) => wet.has(c))) done[i] = step; });
  });
  return groups.map((_, i) => i).filter((i) => done[i] >= 0).sort((a, b) => done[a] - done[b]);
}

/* ------------------------------------------------------------------ */
/* Build puzzles: every dig and gate, tried                            */
/* ------------------------------------------------------------------ */

const cellsOf = (board, ch) => board.cells.split('').map((c, i) => (c === ch ? i : -1)).filter((i) => i >= 0);

/** Every subset of `list` with at most `k` items. */
function subsets(list, k) {
  const out = [[]];
  const walk = (start, cur) => {
    for (let i = start; i < list.length; i++) {
      const next = [...cur, list[i]];
      out.push(next);
      if (next.length < k) walk(i + 1, next);
    }
  };
  if (k > 0) walk(0, []);
  return out;
}

/** Every way (digs within the budget, any gates open) that waters every trough and keeps the cat dry. */
export function solutions(p, cap = 3) {
  const dirt = cellsOf(p.board, 'd');
  const gates = cellsOf(p.board, 'g');
  const found = [];
  for (const digs of subsets(dirt, p.digs)) {
    for (let mask = 0; mask < 1 << gates.length; mask++) {
      const open = new Set(gates.filter((_, j) => mask & (1 << j)));
      if (success(p.board, run(p.board, new Set(digs), open))) {
        found.push({ digs: digs.slice().sort((a, b) => a - b), open: [...open].sort((a, b) => a - b) });
        if (found.length >= cap) return found;
      }
    }
  }
  return found;
}

/* ------------------------------------------------------------------ */
/* Chapters                                                            */
/* ------------------------------------------------------------------ */

export const CHAPTER_SIZE = 30;
export const TEACH = 2;
export const sizeOf = (ch) => ch.size || CHAPTER_SIZE;

/*   build  dig and set gates so every animal drinks and the cat stays dry
     first  which animal drinks first?
     level  where does the water stop in the other tube? */
export const CHAPTERS = {
  easy: [
    { id: 'e1', kind: 'build', icon: '⛏️' },
    { id: 'e2', kind: 'first', icon: '🥇' },
    { id: 'e3', kind: 'build', icon: '🚪' }
  ],
  medium: [
    { id: 'm1', kind: 'build', icon: '🌊' },
    { id: 'm2', kind: 'level', icon: '🫙', size: 20 },
    { id: 'm3', kind: 'build', icon: '🐈' }
  ],
  hard: [
    { id: 'h1', kind: 'build', icon: '💧' },
    { id: 'h2', kind: 'level', icon: '⚖️', size: 20 },
    { id: 'h3', kind: 'first', icon: '🧩' }
  ]
};

export function chapter(id) {
  for (const level of LEVELS) {
    const c = CHAPTERS[level].find((x) => x.id === id);
    if (c) return { ...c, level };
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Making boards                                                       */
/* ------------------------------------------------------------------ */

const W = 9;
const H = 10;

/** A blank board: rock along the bottom. */
function blank(w = W, h = H) {
  const g = Array.from({ length: h }, (_, y) => Array.from({ length: w }, () => (y === h - 1 ? '#' : '.')));
  return g;
}
const toBoard = (g, src, drops) => ({ w: g[0].length, h: g.length, cells: g.map((r) => r.join('')).join(''), src, drops });

/** A trough: a cup of rock round `wd` × `dp` trough cells, its top-left inside cell at (x, y). */
function cup(g, x, y, wd, dp) {
  for (let j = 0; j < dp; j++) for (let i = 0; i < wd; i++) g[y + j][x + i] = 'T';
  for (let j = 0; j <= dp; j++) { g[y + j][x - 1] = '#'; g[y + j][x + wd] = '#'; }
  for (let i = -1; i <= wd; i++) g[y + dp][x + i] = '#';
}

/**
 * A build board: shelves of rock, some with dirt plugs or gates, one or two
 * troughs, maybe the cat in a cup of its own, and the elephant above.
 */
function makeBuildBoard(rng, { troughsN, cat, digs, gates, shelves }) {
  const g = blank();
  /* Cups first, on the floor. */
  const spots = shuffled(rng, [1, 4, 7].map((x) => x));
  const cups = [];
  for (let k = 0; k < troughsN + (cat ? 1 : 0); k++) {
    const x = spots[k];
    const wd = 1;
    const dp = 1 + randInt(rng, 2);
    const y = H - 2 - dp;
    if (k < troughsN) cup(g, x, y, wd, dp);
    else {
      cup(g, x, y, wd, dp);
      for (let j = 0; j < dp; j++) g[y + j][x] = j === dp - 1 ? 'c' : '.';
    }
    cups.push({ x, y, dp });
  }
  /* Shelves of rock across the middle, each with a plug of dirt or a gate. */
  const plugs = [];
  const rows = shuffled(rng, [2, 3, 4, 5]).slice(0, shelves).sort((a, b) => a - b);
  for (const y of rows) {
    const x0 = randInt(rng, 3);
    const len = 4 + randInt(rng, W - 4 - x0);
    for (let x = x0; x < Math.min(W, x0 + len); x++) g[y][x] = '#';
    plugs.push({ y, x0, x1: Math.min(W, x0 + len) - 1 });
  }
  /* Holes in the shelves: dirt to dig, or gates. */
  let dirt = 0;
  let gate = 0;
  for (const s of plugs) {
    const holes = shuffled(rng, Array.from({ length: s.x1 - s.x0 + 1 }, (_, i) => s.x0 + i)).slice(0, 1 + randInt(rng, 2));
    for (const x of holes) {
      if (gate < gates && rng() < 0.5) { g[s.y][x] = 'g'; gate += 1; } else { g[s.y][x] = 'd'; dirt += 1; }
    }
  }
  if (gate < gates || dirt < digs) return null;
  const src = randInt(rng, W);
  const need = cups.reduce((n, c) => n + c.dp, 0);
  return toBoard(g, src, need + 4 + randInt(rng, 6));
}

/** A basin with troughs at different heights: who drinks first? */
function makeFirstBoard(rng, { n }) {
  for (let tries = 0; tries < 60; tries++) {
    const g = blank();
    /* Ledges at different heights round a central fall, each holding a one-cell trough. */
    const xs = shuffled(rng, [1, 3, 5, 7]).slice(0, n);
    const ys = shuffled(rng, [3, 4, 5, 6, 7]).slice(0, n);
    xs.forEach((x, i) => { cup(g, x, ys[i], 1, 1); });
    const board = toBoard(g, randInt(rng, W), 18 + randInt(rng, 10));
    const res = run(board);
    const order = fillOrder(board, res);
    if (order.length >= 2 && troughs(board).length === n) return board;
  }
  return null;
}

/**
 * Two tubes joined at the bottom (a U), one wide and one thin, poured into
 * one of them: where does the water stop in the other? Drops are chosen so
 * every row it reaches is full, so the level is a whole row on both sides.
 */
function makeUBoard(rng, { wide }) {
  const g = Array.from({ length: H }, () => Array.from({ length: W }, () => '#'));
  const lw = wide ? 2 + randInt(rng, 2) : 1;
  const rw = wide ? 1 : 1 + randInt(rng, 2);
  const gap = 1 + randInt(rng, 2);
  const left = 1;
  const right = left + lw + gap;
  if (right + rw >= W) return null;
  const bottom = H - 2;
  const top = 1;
  for (let y = top; y <= bottom; y++) {
    for (let x = left; x < left + lw; x++) g[y][x] = '.';
    for (let x = right; x < right + rw; x++) g[y][x] = '.';
  }
  for (let x = left; x < right + rw; x++) g[bottom][x] = '.';
  /* Fill whole rows: the bottom row, then k rows of both arms. */
  const k = 2 + randInt(rng, 4);
  const drops = (right + rw - left) + k * (lw + rw);
  for (let y = 0; y < top; y++) for (let x = 0; x < W; x++) g[y][x] = '.';
  for (let x = left; x < left + lw; x++) g[0][x] = '.';
  const pourLeft = rng() < 0.5;
  return { board: toBoard(g, pourLeft ? left : right, drops), pourLeft, left, right, lw, rw, bottom, k };
}

/* ------------------------------------------------------------------ */
/* Making experiments                                                  */
/* ------------------------------------------------------------------ */

export function makePuzzle(ch, rng, i = TEACH) {
  const teach = i < TEACH;
  for (let tries = 0; tries < 300; tries++) {
    let p = null;
    switch (ch.id) {
      case 'e1': { const b = makeBuildBoard(rng, { troughsN: 1, cat: false, digs: 1, gates: 0, shelves: teach ? 1 : 1 + randInt(rng, 2) }); if (b) p = { kind: 'build', board: b, digs: 1 }; break; }
      case 'e3': { const b = makeBuildBoard(rng, { troughsN: 1, cat: true, digs: 1, gates: 1, shelves: 2 }); if (b) p = { kind: 'build', board: b, digs: 1 }; break; }
      case 'm1': { const b = makeBuildBoard(rng, { troughsN: 2, cat: false, digs: 2, gates: 0, shelves: 2 }); if (b) p = { kind: 'build', board: b, digs: 2 }; break; }
      case 'm3': { const b = makeBuildBoard(rng, { troughsN: 1 + randInt(rng, 2), cat: true, digs: 2, gates: 1, shelves: 3 }); if (b) p = { kind: 'build', board: b, digs: 2 }; break; }
      case 'h1': { const b = makeBuildBoard(rng, { troughsN: 2, cat: true, digs: 2, gates: 2, shelves: 3 }); if (b) p = { kind: 'build', board: { ...b, drops: Math.max(4, b.drops - 4) }, digs: 2 }; break; }
      case 'e2': case 'h3': {
        const b = makeFirstBoard(rng, { n: ch.id === 'e2' ? 2 : 3 });
        if (b) p = { kind: 'first', board: b };
        break;
      }
      case 'm2': case 'h2': {
        const u = makeUBoard(rng, { wide: ch.id === 'h2' || rng() < 0.4 });
        if (u) p = { kind: 'level', board: u.board, pourLeft: u.pourLeft, arm: u.pourLeft ? [u.right, u.rw] : [u.left, u.lw], bottom: u.bottom, opts: null };
        break;
      }
      default: return null;
    }
    if (!p) continue;
    if (p.kind === 'level') p = withLevelOpts(p, rng);
    if (p && !problems(p).length && interesting(p)) return p;
  }
  return null;
}

/* The row the water stops at in the arm it was not poured into, and two wrong rows. */
function levelRow(p) {
  const res = run(p.board);
  const wet = new Set(res.water);
  const [x0] = p.arm;
  let top = null;
  for (let y = 0; y < p.board.h; y++) if (wet.has(y * p.board.w + x0)) { top = y; break; }
  return top;
}
function withLevelOpts(p, rng) {
  const row = levelRow(p);
  if (row === null) return null;
  /* Rows counted up from the bottom of the tube: 1 is the bottom row. */
  const height = p.bottom - row + 1;
  const wrongs = shuffled(rng, [height - 2, height - 1, height + 1, height + 2].filter((v) => v >= 1 && v <= p.bottom));
  const at = randInt(rng, 3);
  const lo = wrongs.filter((v) => v < height).slice(0, at);
  const hi = wrongs.filter((v) => v > height).slice(0, 2 - lo.length);
  const opts = [...lo, height, ...hi].sort((a, b) => a - b);
  return opts.length === 3 ? { ...p, opts } : null;
}

/* A build puzzle must need the child: doing nothing fails, and the obvious-looking alternatives fail too. */
function interesting(p) {
  if (p.kind !== 'build') return true;
  return !success(p.board, run(p.board));
}

export const makeAt = (chId, i, ...seed) => makePuzzle(chapter(chId), rngFor('fountain', chId, i, ...seed), i);

export const sig = (p) => `${p.kind}|${p.board.w}x${p.board.h}|${p.board.cells}|${p.board.src}|${p.board.drops}|${p.digs || 0}`;

/* ------------------------------------------------------------------ */
/* Answers and proof                                                   */
/* ------------------------------------------------------------------ */

export function answers(p) {
  if (p.kind === 'first') return [fillOrder(p.board, run(p.board))[0]];
  if (p.kind === 'level') return [p.opts.indexOf(p.bottom - levelRow(p) + 1)];
  return [];
}

export function choices(p) {
  if (p.kind === 'first') return [troughs(p.board).map((_, i) => i)];
  if (p.kind === 'level') return [p.opts.map((_, i) => i)];
  return [];
}

export function problems(p) {
  const errs = [];
  const err = (m) => errs.push(m);
  const b = p.board;
  if (b.cells.length !== b.w * b.h) err('the board is the wrong size');
  if (b.src < 0 || b.src >= b.w || b.cells[b.src] !== '.') err('the elephant pours onto something solid');
  if (p.kind === 'build') {
    const sols = solutions(p, 2);
    if (sols.length !== 1) err(`${sols.length} ways work, not one`);
    if (!troughs(b).length) err('no animal to drink');
  } else if (p.kind === 'first') {
    const res = run(b);
    const order = fillOrder(b, res);
    if (order.length < 2) err('fewer than two animals get a drink, so "first" means little');
    if (res.cat) err('the cat gets wet');
  } else if (p.kind === 'level') {
    const res = run(b);
    const wet = new Set(res.water);
    /* Both arms must stop on the same whole row: check every cell of the tubes. */
    const row = levelRow(p);
    if (row === null) err('the water never reaches the other tube');
    for (let y = 0; y < b.h; y++) {
      for (let x = 0; x < b.w; x++) {
        const k = y * b.w + x;
        if (b.cells[k] !== '.' || y === 0) continue;
        if (y >= row && !wet.has(k)) err(`a hole in the water at ${x},${y}`);
        if (y < row && wet.has(k)) err(`water above the level at ${x},${y}`);
      }
    }
    if (!p.opts || p.opts.filter((o) => o === b.h - 2 - row + 1).length !== 1) err('the level is not one of the choices, once');
  } else err(`unknown kind ${p.kind}`);
  return errs;
}

/** 3 clean, 2 after one slip or hint, 1 after that; teaching is always 3. */
export function starsFor({ wrong = 0, hints = 0, teach = false } = {}) {
  if (teach) return 3;
  const n = wrong + hints;
  return n === 0 ? 3 : n === 1 ? 2 : 1;
}

export default {
  LEVELS, run, troughs, success, fillOrder, solutions, CHAPTER_SIZE, TEACH, sizeOf, CHAPTERS, chapter,
  makePuzzle, makeAt, sig, answers, choices, problems, starsFor
};
