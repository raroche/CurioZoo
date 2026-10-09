/**
 * mirrorslogic.js — Sunbeam Mirrors: the beam, the mirrors, and puzzles.
 *
 * The sun shines a beam into the zoo from one edge. A mirror turns it at a
 * right angle: "/" sends a beam going right up, and "\" sends it down. The
 * beam passes over the animals (and wakes them), stops at a rock, and leaves
 * at the edge. The idea is the laser-and-mirror puzzle of Laser Maze and
 * many classroom optics kits; the name and every board here are the zoo's own.
 *
 *   where   the mirrors are fixed: which animal does the beam wake?
 *   turn    tap mirrors to flip them: wake every animal (one way works)
 *   place   put the given number of mirrors on empty squares (one way works)
 *
 * Every answer is proved by trying every setting: 2ⁿ ways to turn n mirrors,
 * or every choice of squares and slants for placing. Pure: no DOM, no
 * Math.random.
 *
 * A board: { n, sun: [row, col, dir], cells: 'n×n string' } where a cell is
 * '.' empty, '#' rock, 'a'..'l' an animal (its index in zooart's ANIMALS),
 * '/' or '\\' a fixed mirror, 'T' a turnable mirror. dir: 0 up, 1 right,
 * 2 down, 3 left. The sun stands just outside the board at [row, col].
 */

import { randInt, shuffled } from './logicrng.js';

export const LEVELS = ['easy', 'medium', 'hard'];

/* ------------------------------------------------------------------ */
/* Chapters                                                            */
/* ------------------------------------------------------------------ */

/**
 * mode: the kind of puzzle. n: board size. turns: mirrors on the beam's
 * path (turnable in "turn", to place in "place"). animals: how many sleep on
 * the board. rocks: how many. fixed: fixed mirrors besides the path's.
 */
export const CHAPTERS = {
  easy: [
    { id: 'e1', mode: 'where', n: [4, 5], fixed: [2, 4], animals: [2, 3], rocks: [0, 1] },
    { id: 'e2', mode: 'turn', n: [4, 5], turns: [1, 2], animals: [1, 2], rocks: [0, 1], fixed: [0, 1] },
    { id: 'e3', mode: 'turn', n: [5, 5], turns: [2, 3], animals: [2, 3], rocks: [0, 2], fixed: [0, 1] }
  ],
  medium: [
    { id: 'm1', mode: 'turn', n: [5, 6], turns: [3, 4], animals: [2, 3], rocks: [1, 3], fixed: [0, 2] },
    { id: 'm2', mode: 'where', n: [5, 6], fixed: [5, 8], animals: [3, 4], rocks: [1, 3] },
    { id: 'm3', mode: 'turn', n: [6, 6], turns: [4, 5], animals: [3, 4], rocks: [1, 3], fixed: [1, 3] }
  ],
  hard: [
    { id: 'h1', mode: 'turn', n: [6, 7], turns: [5, 7], animals: [3, 5], rocks: [2, 4], fixed: [1, 3] },
    { id: 'h2', mode: 'place', n: [5, 6], turns: [2, 3], animals: [2, 4], rocks: [1, 3], fixed: [0, 2] },
    { id: 'h3', mode: 'turn', n: [7, 7], turns: [6, 8], animals: [4, 5], rocks: [2, 5], fixed: [2, 4] }
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
/* The beam                                                            */
/* ------------------------------------------------------------------ */

const DR = [-1, 0, 1, 0];
const DC = [0, 1, 0, -1];
/* "/": right→up, up→right, left→down, down→left. "\": right→down, down→right. */
const SLASH = [1, 0, 3, 2];
const BACK = [3, 2, 1, 0];

export const isAnimal = (ch) => ch >= 'a' && ch <= 'l';

/**
 * Follow the beam over `cells` (a string, or an array of single characters).
 * `turnable` gives the slant of each 'T' in reading order ('/' or '\\').
 * Returns { path: [[row, col], ...] cells it crosses, lit: Set of animal
 * squares, end: 'edge' | 'rock' | 'loop', dir: the way it was going }.
 */
export function beam(b, cells = b.cells, turnable = []) {
  const n = b.n;
  const tIndex = new Map();
  let t = 0;
  for (let i = 0; i < n * n; i++) if (cells[i] === 'T') tIndex.set(i, t++);
  let [r, c, dir] = b.sun;
  const path = [];
  const lit = new Set();
  const seen = new Set();
  for (;;) {
    r += DR[dir];
    c += DC[dir];
    if (r < 0 || c < 0 || r >= n || c >= n) return { path, lit, end: 'edge', dir };
    const i = r * n + c;
    const key = i * 4 + dir;
    if (seen.has(key)) return { path, lit, end: 'loop', dir };
    seen.add(key);
    const cell = cells[i];
    if (cell === '#') return { path, lit, end: 'rock', at: [r, c], dir };
    path.push([r, c]);
    if (isAnimal(cell)) lit.add(i);
    const slant = cell === 'T' ? turnable[tIndex.get(i)] : cell;
    if (slant === '/') dir = SLASH[dir];
    else if (slant === '\\') dir = BACK[dir];
  }
}

/** The squares of every animal on the board. */
export function animalCells(b, cells = b.cells) {
  const out = [];
  for (let i = 0; i < cells.length; i++) if (isAnimal(cells[i])) out.push(i);
  return out;
}

/** Does this setting wake every animal? */
export function wakesAll(b, cells, turnable) {
  const { lit } = beam(b, cells, turnable);
  return animalCells(b, cells).every((i) => lit.has(i));
}

/* ------------------------------------------------------------------ */
/* Every way, for proofs                                               */
/* ------------------------------------------------------------------ */

/** Every way to turn the turnable mirrors that wakes all: ['/\\/', ...]. */
export function turnSolutions(b) {
  const m = [...b.cells].filter((x) => x === 'T').length;
  const out = [];
  for (let bits = 0; bits < 2 ** m; bits++) {
    const s = Array.from({ length: m }, (_, i) => ((bits >> i) & 1 ? '\\' : '/'));
    if (wakesAll(b, b.cells, s)) out.push(s.join(''));
    if (out.length > 1) break;
  }
  return out;
}

/** Every way to put `b.place` mirrors on empty squares that wakes all (stops at two). */
export function placeSolutions(b, limit = 2) {
  const empties = [];
  for (let i = 0; i < b.cells.length; i++) if (b.cells[i] === '.') empties.push(i);
  const k = b.place;
  const out = [];
  const cells = [...b.cells];
  const pick = (from, left) => {
    if (out.length >= limit) return;
    if (left === 0) {
      if (wakesAll(b, cells)) out.push(cells.join(''));
      return;
    }
    for (let e = from; e < empties.length; e++) {
      for (const slant of ['/', '\\']) {
        cells[empties[e]] = slant;
        pick(e + 1, left - 1);
        cells[empties[e]] = '.';
        if (out.length >= limit) return;
      }
    }
  };
  pick(0, k);
  return out;
}

/* ------------------------------------------------------------------ */
/* Making boards                                                       */
/* ------------------------------------------------------------------ */

const between = (rng, [lo, hi]) => lo + randInt(rng, hi - lo + 1);

/** A sun on a random edge square, shining in. */
function randomSun(rng, n) {
  const side = randInt(rng, 4);
  const k = randInt(rng, n);
  if (side === 0) return [-1, k, 2];
  if (side === 1) return [k, n, 3];
  if (side === 2) return [n, k, 0];
  return [k, -1, 1];
}

/**
 * A beam path with `turns` mirrors: walk from the sun, turning at random
 * squares, never crossing itself. Returns { mirrors: [[i, slant]], path }.
 */
function randomPath(rng, n, sun, turns) {
  for (let t = 0; t < 60; t++) {
    let [r, c, dir] = sun;
    const used = new Set();
    const mirrors = [];
    const path = [];
    let ok = true;
    for (let leg = 0; leg <= turns; leg++) {
      /* How far this leg goes before the next mirror (the last leg to the edge). */
      const room = [];
      let rr = r;
      let cc = c;
      for (;;) {
        rr += DR[dir];
        cc += DC[dir];
        if (rr < 0 || cc < 0 || rr >= n || cc >= n || used.has(rr * n + cc)) break;
        room.push([rr, cc]);
      }
      if (!room.length) { ok = false; break; }
      const stop = leg === turns ? room.length : 1 + randInt(rng, room.length);
      for (let s = 0; s < stop; s++) { used.add(room[s][0] * n + room[s][1]); path.push(room[s]); }
      [r, c] = room[stop - 1];
      if (leg < turns) {
        const slant = rng() < 0.5 ? '/' : '\\';
        mirrors.push([r * n + c, slant]);
        dir = slant === '/' ? SLASH[dir] : BACK[dir];
      }
    }
    if (ok && mirrors.length === turns) return { mirrors, path };
  }
  return null;
}

/**
 * One board for a chapter, or null after `tries`.
 *   where: { n, sun, cells } with fixed mirrors; exactly one animal on the
 *          beam, the answer
 *   turn:  { n, sun, cells, start } with 'T' mirrors and the slants they
 *          start at (none starts solved); exactly one way wakes all
 *   place: { n, sun, cells, place } exactly one way to place `place` mirrors
 */
export function makePuzzle(ch, rng, { tries = 300 } = {}) {
  for (let t = 0; t < tries; t++) {
    const n = between(rng, ch.n);
    const sun = randomSun(rng, n);
    const cells = Array(n * n).fill('.');
    const animalIds = shuffled(rng, 'abcdefghijkl'.split(''));
    if (ch.mode === 'where') {
      /* Fixed mirrors anywhere, then animals: one on the beam, the rest off it. */
      const nf = between(rng, ch.fixed);
      for (let f = 0; f < nf; f++) cells[randInt(rng, n * n)] = rng() < 0.5 ? '/' : '\\';
      const nr = between(rng, ch.rocks);
      for (let k = 0; k < nr; k++) { const i = randInt(rng, n * n); if (cells[i] === '.') cells[i] = '#'; }
      const b = { n, sun, cells: cells.join('') };
      const { path, end } = beam(b);
      if (end === 'loop') continue;
      const mirrorsHit = path.filter(([r, c]) => cells[r * n + c] === '/' || cells[r * n + c] === '\\').length;
      if (mirrorsHit < Math.min(2, nf)) continue;
      const on = path.filter(([r, c]) => cells[r * n + c] === '.');
      /* The beam's animal is near its end, so the whole path must be followed. */
      if (on.length < 2) continue;
      const pick = on[on.length - 1 - randInt(rng, Math.min(2, on.length))];
      cells[pick[0] * n + pick[1]] = animalIds[0];
      const offPath = [];
      const onSet = new Set(path.map(([r, c]) => r * n + c));
      for (let i = 0; i < n * n; i++) if (cells[i] === '.' && !onSet.has(i)) offPath.push(i);
      const na = between(rng, ch.animals) - 1;
      if (offPath.length < na) continue;
      shuffled(rng, offPath).slice(0, na).forEach((i, k) => { cells[i] = animalIds[k + 1]; });
      const board = { mode: 'where', n, sun, cells: cells.join('') };
      const lit = [...beam(board).lit];
      if (lit.length !== 1) continue;
      return { ...board, answer: lit[0] };
    }
    /* turn and place: a path with mirrors at its turns, animals along it. */
    const turns = between(rng, ch.turns);
    const route = randomPath(rng, n, sun, turns);
    if (!route) continue;
    const onPath = new Set(route.path.map(([r, c]) => r * n + c));
    route.mirrors.forEach(([i]) => { cells[i] = ch.mode === 'turn' ? 'T' : '.'; });
    const solution = route.mirrors.map(([, s]) => s);
    /* Animals on the path's plain squares, the last one near the end. */
    const plain = route.path.map(([r, c]) => r * n + c).filter((i) => !route.mirrors.some(([m]) => m === i));
    if (plain.length < 2) continue;
    const want = between(rng, ch.animals);
    const spots = [plain[plain.length - 1], ...shuffled(rng, plain.slice(0, -1))].slice(0, want);
    spots.forEach((i, k) => { cells[i] = animalIds[k]; });
    /* Rocks and fixed mirrors off the path. */
    const off = shuffled(rng, Array.from({ length: n * n }, (_, i) => i).filter((i) => !onPath.has(i) && cells[i] === '.'));
    const nr = between(rng, ch.rocks);
    const nf = between(rng, ch.fixed || [0, 0]);
    off.slice(0, nr).forEach((i) => { cells[i] = '#'; });
    off.slice(nr, nr + nf).forEach((i) => { cells[i] = rng() < 0.5 ? '/' : '\\'; });
    if (ch.mode === 'place') {
      const b = { mode: 'place', n, sun, cells: cells.join(''), place: turns };
      /* More animals on the path until only one placing works. */
      let sols = placeSolutions(b);
      let guard = 0;
      while (sols.length > 1 && guard++ < 6) {
        const truth = [...b.cells];
        route.mirrors.forEach(([i, s]) => { truth[i] = s; });
        const other = beam(b, sols.find((x) => x !== truth.join('')) || sols[1]);
        const pick = plain.find((i) => !other.lit.has(i) && !other.path.some(([r, c]) => r * n + c === i) && b.cells[i] === '.');
        if (pick === undefined) break;
        const arr = [...b.cells];
        arr[pick] = animalIds[[...arr].filter(isAnimal).length];
        b.cells = arr.join('');
        sols = placeSolutions(b);
      }
      if (sols.length !== 1) continue;
      if ([...b.cells].filter(isAnimal).length > ch.animals[1] + 1) continue;
      return b;
    }
    const b = { mode: 'turn', n, sun, cells: cells.join('') };
    let sols = turnSolutions(b);
    let guard = 0;
    while (sols.length > 1 && guard++ < 6) {
      const wrong = sols.find((s) => s !== solution.join(''));
      const other = beam(b, b.cells, [...wrong]);
      const otherPath = new Set(other.path.map(([r, c]) => r * n + c));
      const pick = plain.find((i) => !otherPath.has(i) && b.cells[i] === '.');
      if (pick === undefined) break;
      const arr = [...b.cells];
      arr[pick] = animalIds[[...arr].filter(isAnimal).length];
      b.cells = arr.join('');
      sols = turnSolutions(b);
    }
    if (sols.length !== 1 || sols[0] !== solution.join('')) continue;
    if ([...b.cells].filter(isAnimal).length > ch.animals[1] + 1) continue;
    /* Start with some mirrors the wrong way: at least one, about half. */
    const start = solution.map((s) => (rng() < 0.5 ? s : s === '/' ? '\\' : '/'));
    if (start.join('') === solution.join('')) { const f = randInt(rng, start.length); start[f] = start[f] === '/' ? '\\' : '/'; }
    return { ...b, start: start.join('') };
  }
  return null;
}

/** The answer: where → the animal's square; turn → slants; place → the board with mirrors. */
export function answerOf(p) {
  if (p.mode === 'where') return [...beam(p).lit][0];
  if (p.mode === 'turn') return turnSolutions(p)[0];
  return placeSolutions(p)[0];
}

/** Turnable mirrors that start the wrong way: the fewest taps. */
export function fewestTaps(p) {
  if (p.mode === 'turn') { const s = answerOf(p); return [...p.start].filter((x, i) => x !== s[i]).length; }
  if (p.mode === 'place') return [...answerOf(p)].reduce((n, x, i) => n + (p.cells[i] === '.' && x !== '.' ? (x === '/' ? 1 : 2) : 0), 0);
  return 1;
}

export const shapeOf = (p) => JSON.stringify([p.mode, p.n, p.sun, p.cells, p.start || null, p.place || null]);

/* ------------------------------------------------------------------ */
/* Stars                                                               */
/* ------------------------------------------------------------------ */

/**
 *   where        ★★★ first tap · ★
 *   turn, place  ★★★ in the fewest taps · ★★ two more · ★
 *   any          ★ if the answer was shown
 */
export function starsFor(mode, { taps = 0, fewest = 1, tries = 1, shown = false } = {}) {
  if (shown) return 1;
  if (mode === 'where') return tries <= 1 ? 3 : 1;
  return taps <= fewest ? 3 : taps <= fewest + 2 ? 2 : 1;
}

export default {
  LEVELS, CHAPTERS, CHAPTER_SIZE, TEACH, chapter, isAnimal, beam, animalCells, wakesAll, turnSolutions,
  placeSolutions, makePuzzle, answerOf, fewestTaps, shapeOf, starsFor
};
