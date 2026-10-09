/**
 * slidelogic.js — Penguin Slide: tubes, hills and jumps on the ice.
 *
 * The penguin slides on its tummy: no rolling, so the textbook rules for a
 * slider hold exactly (research-motion.md section 4):
 *
 *   - Out of a curved tube it goes straight, along the way the tube pointed
 *     at the end. Nothing keeps it curving and nothing flings it outward:
 *     those are the two wrong ideas (McCloskey; Kaiser et al.), and they are
 *     the two wrong choices in every tube puzzle.
 *   - It can never climb higher than where it started, and real snow steals
 *     a little, so it clears a hill only when the top is at least one row
 *     below the start (equal height: no).
 *   - Its speed depends only on how far it has dropped: Δh rows gives
 *     2√Δh squares a tick. Off a ledge H rows above the pool it falls 1, 3,
 *     5... rows a tick and keeps its speed forward, so it lands
 *     2√(Δh × H) squares out. Every puzzle uses Δh × H a perfect square.
 *
 * Pure: no DOM, no Math.random.
 */

import { pickOne, randInt, rngFor, shuffled } from './logicrng.js';

export const LEVELS = ['easy', 'medium', 'hard'];

/* ------------------------------------------------------------------ */
/* Tubes, seen from above                                              */
/* ------------------------------------------------------------------ */

/* Directions on the ice, x right and y down (screen). */
export const DIRS = { E: [1, 0], S: [0, 1], W: [-1, 0], N: [0, -1] };
const RIGHT = { E: 'S', S: 'W', W: 'N', N: 'E' };    // a quarter turn clockwise
const LEFT = { E: 'N', N: 'W', W: 'S', S: 'E' };
const add = (p, d, k = 1) => [p[0] + DIRS[d][0] * k, p[1] + DIRS[d][1] * k];

/**
 * One quarter of a tube: from point P heading d, turning `turn` (R or L)
 * round a circle of radius r. Returns where it comes out, which way it then
 * points, and the circle's centre.
 */
export function quarter(P, d, turn, r) {
  const nd = turn === 'R' ? RIGHT[d] : LEFT[d];
  const centre = add(P, nd, r);
  const Q = add(add(P, d, r), nd, r);
  return { Q, d: nd, centre, from: d };
}

/**
 * The penguin's whole route through a puzzle's tubes: it starts at `start`
 * heading `dir`, slides straight until it reaches a tube's mouth, follows the
 * tube, and so on. Returns the segments to draw and where it leaves the last
 * tube, with the way it points, the last quarter's centre and the way it was
 * heading as that quarter began (for the wrong ideas).
 */
export function route(p) {
  let P = p.start;
  let d = p.dir;
  const segs = [];
  let last = null;
  for (const tube of p.tubes) {
    /* Straight to the tube's mouth (it is always straight ahead). */
    segs.push({ line: [P, tube.at] });
    P = tube.at;
    for (const turn of tube.turns) {
      const q = quarter(P, d, turn, tube.r);
      segs.push({ arc: { from: P, to: q.Q, centre: q.centre, r: tube.r, turn } });
      last = { ...q, turn, r: tube.r };
      P = q.Q;
      d = q.d;
    }
  }
  return { segs, exit: P, d, last };
}

/** Where each wrong idea says the penguin goes after the last tube. */
export function wrongIdeas(p) {
  const { exit, d, last } = route(p);
  return {
    straight: { from: exit, dir: d },
    /* Keeps curving the tube's way, one more quarter. */
    curve: quarter(exit, d, last.turn, last.r).Q,
    /* Flung straight outward, away from the centre. */
    flung: { from: exit, dir: last.from }
  };
}

/** The first fish on the straight line out of the last tube, or -1. */
export function fishReached(p) {
  const { exit, d } = route(p);
  for (let k = 1; k <= 20; k++) {
    const at = add(exit, d, k);
    const i = p.fish.findIndex((f) => f[0] === at[0] && f[1] === at[1]);
    if (i >= 0) return i;
    if (at[0] < 0 || at[1] < 0 || at[0] >= p.w || at[1] >= p.h) return -1;
  }
  return -1;
}

/* ------------------------------------------------------------------ */
/* Hills and jumps, seen from the side                                 */
/* ------------------------------------------------------------------ */

/** Does a penguin starting `start` rows up get over a hill whose top is `top` rows up? */
export const clears = (start, top) => top <= start - 1;

/** Where along a row of hills it stops: the index of the first hill it cannot clear, or hills.length. */
export const stopsAt = (start, hills) => {
  const k = hills.findIndex((h) => !clears(start, h));
  return k < 0 ? hills.length : k;
};

const isSquare = (n) => Number.isInteger(Math.sqrt(n));

/** How far out it lands after dropping dh rows to the ledge and falling H rows off it. */
export const landing = (dh, H) => 2 * Math.round(Math.sqrt(dh * H));

/* ------------------------------------------------------------------ */
/* Chapters                                                            */
/* ------------------------------------------------------------------ */

export const CHAPTER_SIZE = 30;
/* A chapter may hold fewer: there are only so many whole-number jumps, and a
   repeat dressed up as new is worse than a shorter chapter. */
export const sizeOf = (ch) => ch.size || CHAPTER_SIZE;
export const TEACH = 2;

/*   tube   which fish does the penguin reach out of the tube(s)?
     lanes  one start height, a hill in each lane: over, or not?
     hills  hills in a row: where does it stop?
     jump   where does it splash?
     start  which start shelf lands it in the pool? */
export const CHAPTERS = {
  easy: [
    { id: 'e1', kind: 'tube', icon: '🌀' },
    { id: 'e2', kind: 'lanes', icon: '⛰️' },
    { id: 'e3', kind: 'jump', icon: '💦', size: 16 }
  ],
  medium: [
    { id: 'm1', kind: 'tube', icon: '➰' },
    { id: 'm2', kind: 'hills', icon: '🏔️' },
    { id: 'm3', kind: 'jump', kinds: ['ledge'], icon: '🎯' }
  ],
  hard: [
    { id: 'h1', kind: 'start', icon: '🐧', size: 20 },
    { id: 'h2', kind: 'start', icon: '🎿', size: 22 },
    { id: 'h3', kind: 'tube', icon: '🔀' }
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
/* Making experiments                                                  */
/* ------------------------------------------------------------------ */

const inside = (p, q) => q[0] >= 0 && q[1] >= 0 && q[0] < p.w && q[1] < p.h;
const same = (a, b) => a[0] === b[0] && a[1] === b[1];

/** Is point f on the drawn route: a straight run, or within half a square of an arc? */
function onRoute(p, f) {
  for (const sgm of route(p).segs) {
    if (sgm.line) {
      const [a, b] = sgm.line;
      const inX = f[0] >= Math.min(a[0], b[0]) && f[0] <= Math.max(a[0], b[0]);
      const inY = f[1] >= Math.min(a[1], b[1]) && f[1] <= Math.max(a[1], b[1]);
      if (inX && inY) return true;
    } else {
      const { from, to, centre, r } = sgm.arc;
      const dist = Math.hypot(f[0] - centre[0], f[1] - centre[1]);
      /* Inside the quarter's box and near the circle. */
      const inBox = f[0] >= Math.min(from[0], to[0]) && f[0] <= Math.max(from[0], to[0])
        && f[1] >= Math.min(from[1], to[1]) && f[1] <= Math.max(from[1], to[1]);
      if (inBox && Math.abs(dist - r) < 0.75) return true;
    }
  }
  return false;
}

/** A tube puzzle: tubes of `turns` quarters each, and three fish. */
function makeTube(rng, { tubes, maxTurns, w = 10, h = 10 }) {
  for (let tries = 0; tries < 300; tries++) {
    const p = { kind: 'tube', w, h, start: null, dir: null, tubes: [], fish: [] };
    /* Start on an edge, heading in. */
    const dir = pickOne(rng, ['E', 'S', 'W', 'N']);
    const along = 1 + randInt(rng, (dir === 'E' || dir === 'W' ? h : w) - 2);
    p.dir = dir;
    p.start = dir === 'E' ? [0, along] : dir === 'W' ? [w - 1, along] : dir === 'S' ? [along, 0] : [along, h - 1];
    let P = p.start;
    let d = dir;
    let ok = true;
    for (let k = 0; k < tubes; k++) {
      const run = 1 + randInt(rng, 2);
      const at = add(P, d, run);
      const r = 1 + randInt(rng, 2);
      const n = 1 + randInt(rng, maxTurns);
      const side = pickOne(rng, ['R', 'L']);
      const turns = Array.from({ length: n }, () => side);
      p.tubes.push({ at, r, turns });
      let Q = at;
      for (const turn of turns) {
        const q = quarter(Q, d, turn, r);
        if (!inside(p, q.Q) || !inside(p, q.centre)) { ok = false; break; }
        Q = q.Q;
        d = q.d;
      }
      if (!ok) break;
      P = Q;
    }
    if (!ok) continue;
    const ideas = wrongIdeas(p);
    const k = 2 + randInt(rng, 3);
    const right = add(ideas.straight.from, ideas.straight.dir, k);
    const flung = add(ideas.flung.from, ideas.flung.dir, 1 + randInt(rng, 3));
    const curve = ideas.curve;
    const fish = [right, curve, flung];
    if (!fish.every((f) => inside(p, f))) continue;
    if (new Set(fish.map((f) => f.join())).size < 3) continue;
    /* No fish on the tubes themselves. */
    if (fish.some((f) => onRoute(p, f))) continue;
    p.fish = shuffled(rng, fish);
    if (p.fish[fishReached(p)] !== p.fish.find((f) => same(f, right))) continue;
    return p;
  }
  return null;
}

const HILL_MAX = 8;

export function makePuzzle(ch, rng, i = TEACH) {
  const teach = i < TEACH;
  switch (ch.id) {
    case 'e1':
      /* One quarter tube on flat ice. */
      if (i === 0) return { kind: 'tube', w: 10, h: 10, start: [0, 2], dir: 'E', tubes: [{ at: [2, 2], r: 2, turns: ['R'] }], fish: [[4, 7], [2, 6], [7, 4]] };
      return makeTube(rng, { tubes: 1, maxTurns: 1 });
    case 'e2': {
      /* One start height, a hill in each lane. The equal-height hill is the lesson. */
      if (i === 0) return { kind: 'lanes', start: 5, hills: [3, 5, 6] };
      if (i === 1) return { kind: 'lanes', start: 4, hills: [4, 2] };
      const start = 3 + randInt(rng, 5);
      const n = i < 15 ? 2 : 3;
      const hills = Array.from({ length: n }, () => 1 + randInt(rng, Math.min(HILL_MAX, start + 2)));
      /* At least one yes and one no, and often the tempting equal one. */
      if (rng() < 0.5) hills[randInt(rng, n)] = start;
      const yes = hills.filter((h) => clears(start, h)).length;
      if (!yes || yes === n) return makePuzzle(ch, rng, i);
      return { kind: 'lanes', start, hills };
    }
    case 'e3':
      if (i === 0) return { kind: 'jump', dh: 1, H: 4, marks: [2, 4, 8] };
      if (i === 1) return { kind: 'jump', dh: 1, H: 1, marks: [0, 2, 4] };
      return makeJump(rng, { pairs: [[1, 1], [1, 4], [4, 1], [4, 4]] });
    case 'm1':
      if (i === 0) return { kind: 'tube', w: 10, h: 10, start: [0, 2], dir: 'E', tubes: [{ at: [2, 2], r: 2, turns: ['R', 'R'] }], fish: [[0, 4], [0, 6], [2, 8]] };
      return makeTube(rng, { tubes: 1, maxTurns: 3 });
    case 'm2': {
      if (teach) return i === 0 ? { kind: 'hills', start: 6, hills: [3, 5, 6] } : { kind: 'hills', start: 5, hills: [2, 4, 3] };
      const start = 3 + randInt(rng, 6);
      const n = 2 + randInt(rng, 2);
      const hills = Array.from({ length: n }, () => 1 + randInt(rng, Math.min(HILL_MAX, start + 1)));
      return { kind: 'hills', start, hills };
    }
    case 'm3': {
      /* Where does it splash, or (every other one) how high is the ledge? */
      if (teach) return i === 0 ? { kind: 'jump', dh: 4, H: 1, marks: [2, 4, 6] } : { kind: 'jump', dh: 1, H: 9, marks: [3, 6, 9] };
      const pairs = [[1, 1], [1, 4], [4, 1], [1, 9], [9, 1], [4, 4], [4, 9], [9, 4]];
      if (i % 2) {
        const [dh, H] = pickOne(rng, pairs);
        const x = landing(dh, H);
        const opts = around(rng, H, [1, 4, 9, 16].filter((h) => h !== H && landing(dh, h) !== x));
        return opts ? { kind: 'ledge', dh, x, opts } : null;
      }
      return makeJump(rng, { pairs });
    }
    case 'h1':
    case 'h2': {
      /* Which start shelf lands it in the pool? h2 puts a hill on the way:
         a shelf that is too low cannot get over it. */
      const hill = ch.id === 'h2';
      for (let tries = 0; tries < 100; tries++) {
        const H = pickOne(rng, [1, 4, 9]);
        const dhs = [1, 4, 9].filter((dh) => isSquare(dh * H));
        const dh = pickOne(rng, dhs);
        const x = landing(dh, H);
        if (x > 12) continue;
        const opts = around(rng, dh, [1, 4, 9, 16, 25].filter((o) => o !== dh));
        if (!opts) continue;
        const p = { kind: 'start', H, x, opts };
        if (hill) {
          /* A hill no taller than the right shelf allows, that some lower shelf could not clear. */
          const top = 1 + randInt(rng, dh - 1 || 1);
          if (!clears(dh, top) || opts.every((o) => clears(o, top))) continue;
          p.hill = top;
        }
        if (teach && hill && !p.hill) continue;
        if (!problems(p).length) return p;
      }
      return null;
    }
    case 'h3':
      return makeTube(rng, { tubes: 2, maxTurns: 2, w: 12, h: 12 });
    default: return null;
  }
}

/**
 * Three choices in order with the right one first, middle or last as often
 * as each other, so "pick the middle" never pays. `pool` holds the wrong
 * values allowed; null if they cannot fill the place picked.
 */
function around(rng, right, pool) {
  const below = shuffled(rng, pool.filter((v) => v < right));
  const above = shuffled(rng, pool.filter((v) => v > right));
  const at = randInt(rng, 3);
  const lo = below.slice(0, at);
  const hi = above.slice(0, 2 - at);
  if (lo.length !== at || hi.length !== 2 - at) return null;
  return [...lo, right, ...hi].sort((a, b) => a - b);
}

function makeJump(rng, { pairs }) {
  for (let tries = 0; tries < 30; tries++) {
    const [dh, H] = pickOne(rng, pairs);
    const x = landing(dh, H);
    /* Straight down (0), halfway, twice as far, a little either side. */
    const wrongs = [...new Set([0, x / 2, x * 2, x + 2, x - 2, x + 1, x - 1].filter((m) => m !== x && m >= 0 && Number.isInteger(m) && m <= 16))];
    const marks = around(rng, x, wrongs);
    if (marks) return { kind: 'jump', dh, H, marks };
  }
  return null;
}

export const makeAt = (chId, i, ...seed) => makePuzzle(chapter(chId), rngFor('slide', chId, i, ...seed), i);

export function sig(p) {
  switch (p.kind) {
    case 'tube': return `tube|${p.start}|${p.dir}|${p.tubes.map((t) => `${t.at}:${t.r}:${t.turns.join('')}`).join(';')}|${p.fish.map((f) => f.join(',')).sort().join(';')}`;
    case 'lanes': case 'hills': return `${p.kind}|${p.start}|${p.hills.join(',')}`;
    case 'jump': return `jump|${p.dh}|${p.H}|${p.marks.join(',')}`;
    case 'ledge': return `ledge|${p.dh}|${p.x}|${p.opts.join(',')}`;
    case 'start': return `start|${p.H}|${p.x}|${p.opts.join(',')}|${p.hill || 0}`;
    default: return JSON.stringify(p);
  }
}

/* ------------------------------------------------------------------ */
/* Answers and proof                                                   */
/* ------------------------------------------------------------------ */

export function answers(p) {
  switch (p.kind) {
    case 'tube': return [fishReached(p)];
    case 'lanes': return p.hills.map((h) => (clears(p.start, h) ? 'over' : 'stop'));
    case 'hills': return [stopsAt(p.start, p.hills)];
    case 'jump': return [p.marks.indexOf(landing(p.dh, p.H))];
    case 'ledge': return [p.opts.findIndex((H) => landing(p.dh, H) === p.x)];
    case 'start': return [p.opts.findIndex((dh) => landing(dh, p.H) === p.x && (!p.hill || clears(dh, p.hill)))];
    default: return [];
  }
}

export function choices(p) {
  switch (p.kind) {
    case 'tube': return [p.fish.map((_, i) => i)];
    case 'lanes': return p.hills.map(() => ['over', 'stop']);
    case 'hills': return [Array.from({ length: p.hills.length + 1 }, (_, i) => i)];
    case 'jump': return [p.marks.map((_, i) => i)];
    case 'ledge': case 'start': return [p.opts.map((_, i) => i)];
    default: return [];
  }
}

export function problems(p) {
  const errs = [];
  const err = (m) => errs.push(m);
  const ans = answers(p);
  if (!ans.length) err('no questions');
  ans.forEach((a, k) => { if (a === -1 || a === null || a === undefined) err(`question ${k + 1} has no answer`); });
  switch (p.kind) {
    case 'tube': {
      const ideas = wrongIdeas(p);
      const hits = p.fish.filter((f) => {
        for (let k = 1; k <= 20; k++) { const at = add(ideas.straight.from, ideas.straight.dir, k); if (same(at, f)) return true; }
        return false;
      });
      if (hits.length !== 1) err(`${hits.length} fish lie on the straight way out`);
      if (!p.fish.every((f) => inside(p, f))) err('a fish is off the ice');
      if (!p.fish.some((f) => same(f, ideas.curve))) err('no fish where "it keeps curving" would go');
      if (p.fish.some((f) => onRoute(p, f))) err('a fish sits on the tube');
      break;
    }
    case 'lanes':
      if (!p.hills.some((h) => clears(p.start, h)) || p.hills.every((h) => clears(p.start, h))) err('the lanes need a yes and a no');
      break;
    case 'jump':
      if (!isSquare(p.dh * p.H)) err('Δh × H is not a square, so it would not land on a whole square');
      if (p.marks.filter((m) => m === landing(p.dh, p.H)).length !== 1) err('the landing spot is not one of the marks, once');
      break;
    case 'start': {
      const ok = p.opts.filter((dh) => landing(dh, p.H) === p.x && (!p.hill || clears(dh, p.hill)));
      if (ok.length !== 1) err(`${ok.length} shelves work, not one`);
      if (p.opts.some((dh) => !isSquare(dh * p.H) && landing(dh, p.H) === p.x)) err('a shelf lands on a non-whole square');
      break;
    }
    case 'ledge': {
      const ok = p.opts.filter((H) => landing(p.dh, H) === p.x);
      if (ok.length !== 1) err(`${ok.length} ledges work, not one`);
      if (!ok.every((H) => isSquare(H * p.dh))) err('Δh × H is not a square');
      break;
    }
    case 'hills': break;
    default: err(`unknown kind ${p.kind}`);
  }
  return errs;
}

/** 3 clean, 2 after one slip or hint, 1 after that; teaching is always 3. */
export function starsFor({ wrong = 0, hints = 0, teach = false } = {}) {
  if (teach) return 3;
  const n = wrong + hints;
  return n === 0 ? 3 : n === 1 ? 2 : 1;
}

export default {
  LEVELS, DIRS, quarter, route, wrongIdeas, fishReached, clears, stopsAt, landing, CHAPTER_SIZE, sizeOf, TEACH, CHAPTERS, chapter,
  makePuzzle, makeAt, sig, answers, choices, problems, starsFor
};
