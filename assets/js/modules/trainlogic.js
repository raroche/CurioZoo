/**
 * trainlogic.js — Fruit Train: falling, and falling from something moving.
 *
 * Two ideas, both measured in children (research-motion.md):
 *   - a thing dropped from a moving train keeps moving forward as it falls,
 *     so it lands AHEAD of where it was let go ("it drops straight down" is
 *     the wrong idea, and older children are no better at it);
 *   - heavy and light things fall together when air does not matter, and
 *     every falling thing speeds up ("heavier falls faster", "it falls at a
 *     steady speed" are the wrong ideas).
 *
 * Pure: no DOM, no Math.random. Everything is whole numbers. In one tick a
 * dropped thing falls 1 row, then 3, then 5, then 7 (Galileo's odd-number
 * rule, exact for steady gravity): after t ticks it has fallen t × t rows.
 * The train moves v columns a tick and the fruit keeps that speed, so after t
 * ticks it is v × t columns ahead of where it was let go. Every drop height
 * is a square (1, 4, 9 or 16 rows), so the fruit lands on a whole column,
 * v × √H ahead. With a row half a metre high, 9 rows is 4.5 m: low enough
 * that air makes no difference anyone could see for a fruit (the research
 * worked it out at a few centimetres), and never claimed for a feather.
 *
 * Kinds of experiment:
 *   drop   tap where the monkey lets go, to feed one or two animals
 *   land   the monkey lets go here: tap where it lands
 *   speed  the monkey lets go here: how fast must the train go?
 *   gaps   count the rows it falls in each tick
 *   pair   two things let go together: which lands first, or together?
 */

import { pickOne, randInt, rngFor, shuffled } from './logicrng.js';

export const LEVELS = ['easy', 'medium', 'hard'];
export const HEIGHTS = [1, 4, 9, 16];
export const root = (H) => Math.round(Math.sqrt(H));

/* ------------------------------------------------------------------ */
/* The cast                                                            */
/* ------------------------------------------------------------------ */

/* Hungry animals and the fruit each one gets. Every fruit here is small
   and heavy for its size, so air does not slow it from these heights. */
export const EATERS = [
  { id: 'hippo', emoji: '🦛', fruit: 'watermelon' },
  { id: 'elephant', emoji: '🐘', fruit: 'banana' },
  { id: 'gorilla', emoji: '🦍', fruit: 'banana' },
  { id: 'orangutan', emoji: '🦧', fruit: 'mango' },
  { id: 'bear', emoji: '🐻', fruit: 'apple' },
  { id: 'parrot', emoji: '🦜', fruit: 'grapes' },
  { id: 'turtle', emoji: '🐢', fruit: 'strawberry' },
  { id: 'panda', emoji: '🐼', fruit: 'apple' }
];

/**
 * Things to drop side by side. `air: true` things are light and wide for
 * their size, so the air pushes on them and they drift down slowly; nothing
 * else is ever said to land after another thing let go from the same height.
 * Sources: research-motion.md 1.8 (drag worked out for grape, apple and
 * watermelon; feathers, leaves, paper and balloons named as the exceptions).
 */
export const THINGS = [
  { id: 'watermelon', emoji: '🍉', heavy: 3 },
  { id: 'apple', emoji: '🍎', heavy: 2 },
  { id: 'grapes', emoji: '🍇', heavy: 1 },
  { id: 'orange', emoji: '🍊', heavy: 2 },
  { id: 'pear', emoji: '🍐', heavy: 2 },
  { id: 'pineapple', emoji: '🍍', heavy: 3 },
  { id: 'mango', emoji: '🥭', heavy: 2 },
  { id: 'banana', emoji: '🍌', heavy: 2 },
  { id: 'strawberry', emoji: '🍓', heavy: 1 },
  { id: 'rock', emoji: '🪨', heavy: 2 },
  { id: 'bowling', emoji: '🎳', heavy: 3 },
  { id: 'feather', emoji: '🪶', air: true },
  { id: 'leaf', emoji: '🍃', air: true },
  { id: 'paper', emoji: '📄', air: true },
  { id: 'balloon', emoji: '🎈', air: true }
];

export const thingById = (id) => THINGS.find((x) => x.id === id) || null;
export const eaterById = (id) => EATERS.find((x) => x.id === id) || null;

/* ------------------------------------------------------------------ */
/* Motion                                                              */
/* ------------------------------------------------------------------ */

/** Where a thing let go at column c from a train at speed v is after t ticks: [column, rows fallen]. */
export const at = (c, v, t) => [c + v * t, t * t];

/** The column a thing let go at c, at speed v, lands on after falling H rows. */
export const landing = (c, v, H) => c + v * root(H);

/** The rows fallen in tick n (1, 3, 5, 7...) and in total after n ticks. */
export const stepIn = (n) => 2 * n - 1;
export const totalAfter = (n) => n * n;

/** Which of two drops lands first: 'a', 'b' or 'same'. Only the height decides, unless air does. */
export function firstDown(a, b) {
  const ta = thingById(a.thing);
  const tb = thingById(b.thing);
  if (ta.air && tb.air) return null;              // two drifters: nobody can say
  if (ta.air || tb.air) {
    /* A drifter only loses when it starts no lower than the other. */
    if (ta.air && a.h >= b.h) return 'b';
    if (tb.air && b.h >= a.h) return 'a';
    return null;
  }
  if (a.h === b.h) return 'same';
  return a.h < b.h ? 'a' : 'b';
}

/* ------------------------------------------------------------------ */
/* Chapters                                                            */
/* ------------------------------------------------------------------ */

export const CHAPTER_SIZE = 30;
export const TEACH = 2;
export const COLS = 14;

export const CHAPTERS = {
  easy: [
    { id: 'e1', kind: 'drop', icon: '🐒' },
    { id: 'e2', kind: 'pair', icon: '🍉' },
    { id: 'e3', kind: 'drop', icon: '🚂' }
  ],
  medium: [
    { id: 'm1', kind: 'land', icon: '🎯' },
    { id: 'm2', kind: 'gaps', icon: '📏' },
    { id: 'm3', kind: 'drop', icon: '🦍' }
  ],
  hard: [
    { id: 'h1', kind: 'drop', icon: '💨' },
    { id: 'h2', kind: 'speed', icon: '🎚️' },
    { id: 'h3', kind: 'pair', icon: '🏁' }
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
/* Answers                                                             */
/* ------------------------------------------------------------------ */

/** The right choice for each question, in order. */
export function answers(p) {
  switch (p.kind) {
    case 'drop': return p.targets.map((g) => p.spots.findIndex((c) => landing(c, p.v, g.H) === g.M));
    case 'land': return [p.marks.indexOf(landing(p.c, p.v, p.H))];
    case 'speed': return [p.speeds.findIndex((v) => landing(p.c, v, p.H) === p.M)];
    case 'gaps': return p.qs.map((q) => q.opts.indexOf(gapAnswer(q)));
    case 'pair': return p.pairs.map((pr) => firstDown(pr.a, pr.b));
    default: return [];
  }
}

export function gapAnswer(q) {
  if (q.type === 'step') return stepIn(q.n);
  if (q.type === 'total') return totalAfter(q.n);
  return root(q.n);                                  // 'ticks': how many ticks to fall n rows
}

/** The choices of each question. */
export function choices(p) {
  switch (p.kind) {
    case 'drop': return p.targets.map(() => p.spots.map((_, i) => i));
    case 'land': return [p.marks.map((_, i) => i)];
    case 'speed': return [p.speeds.map((_, i) => i)];
    case 'gaps': return p.qs.map((q) => q.opts.map((_, i) => i));
    case 'pair': return p.pairs.map(() => ['a', 'b', 'same']);
    default: return [];
  }
}

/** Can a wrong answer be tried again on the spot (the moving-train puzzles), or is it one go? */
export const retries = (p) => p.kind === 'drop' || p.kind === 'land' || p.kind === 'speed';

/* ------------------------------------------------------------------ */
/* Making experiments                                                  */
/* ------------------------------------------------------------------ */

/** k distinct columns from 0..COLS-1 that include every one of `must`. */
function columns(rng, k, must, lo = 0, hi = COLS - 1) {
  const set = new Set(must.filter((c) => c >= lo && c <= hi));
  const free = shuffled(rng, Array.from({ length: hi - lo + 1 }, (_, i) => lo + i).filter((c) => !set.has(c)));
  for (const c of free) { if (set.size >= k) break; set.add(c); }
  return [...set].sort((a, b) => a - b);
}

/** One or two animals to feed from a train at speed v. */
function makeDrop(rng, { vs, hs, k, two = false }) {
  const v = pickOne(rng, vs);
  const eaters = shuffled(rng, EATERS).slice(0, two ? 2 : 1);
  const targets = [];
  const must = [];
  for (const e of eaters) {
    const H = pickOne(rng, hs);
    const d = v * root(H);
    /* The mouth must be far enough along for the right spot to be on the track. */
    let M = null;
    for (let tries = 0; tries < 30 && M === null; tries++) {
      const m = d + randInt(rng, COLS - d);
      if (m > COLS - 1 || targets.some((g) => Math.abs(g.M - m) < 2)) continue;
      M = m;
    }
    if (M === null) return null;
    targets.push({ eater: e.id, H, M });
    must.push(M - d);
    /* The spot straight above the animal is the wrong idea worth tempting. */
    if (v > 0) must.push(M);
  }
  const spots = columns(rng, Math.max(k, new Set(must).size), must);
  return { kind: 'drop', v, spots, targets };
}

const SPEEDS = [0, 1, 2, 3, 4];

export function makePuzzle(ch, rng, i = TEACH) {
  const teach = i < TEACH;
  switch (ch.id) {
    case 'e1':
      /* A stopped train first: straight down. Then a slow one. */
      if (i === 0) return { kind: 'drop', v: 0, spots: [2, 5, 8], targets: [{ eater: 'hippo', H: 4, M: 5 }] };
      if (i === 1) return { kind: 'drop', v: 1, spots: [3, 4, 6], targets: [{ eater: 'elephant', H: 1, M: 4 }] };
      return makeDrop(rng, { vs: i < 8 ? [0, 1] : [1], hs: [1, 4], k: 3 });
    case 'e2': {
      /* From the same tower: heavy and light fruit land together; a
         feather, leaf, paper or balloon drifts down after. */
      if (teach) {
        return i === 0
          ? { kind: 'pair', pairs: [{ a: { thing: 'watermelon', h: 9 }, b: { thing: 'grapes', h: 9 } }] }
          : { kind: 'pair', pairs: [{ a: { thing: 'feather', h: 9 }, b: { thing: 'apple', h: 9 } }] };
      }
      const n = i < 12 ? 1 : 2;
      const pairs = [];
      for (let tries = 0; pairs.length < n && tries < 40; tries++) {
        const air = rng() < 0.3;
        const dense = THINGS.filter((x) => !x.air);
        const [a, b] = shuffled(rng, dense).slice(0, 2);
        const second = air ? pickOne(rng, THINGS.filter((x) => x.air)) : b;
        if (a.heavy === second.heavy && !air) continue;    // the point is heavy beside light
        const pr = rng() < 0.5 ? { a: { thing: a.id, h: 9 }, b: { thing: second.id, h: 9 } } : { a: { thing: second.id, h: 9 }, b: { thing: a.id, h: 9 } };
        if (pairs.some((q) => sameThings(q, pr))) continue;
        pairs.push(pr);
      }
      return pairs.length === n ? { kind: 'pair', pairs } : null;
    }
    case 'e3':
      if (i === 0) return { kind: 'drop', v: 2, spots: [3, 4, 5, 7], targets: [{ eater: 'gorilla', H: 1, M: 7 }] };
      if (i === 1) return { kind: 'drop', v: 1, spots: [4, 5, 6, 7], targets: [{ eater: 'bear', H: 4, M: 7 }] };
      return makeDrop(rng, { vs: [1, 2], hs: [1, 4], k: i < 15 ? 3 : 4 });
    case 'm1': {
      /* The monkey lets go here: where does it land? */
      if (teach) return i === 0 ? { kind: 'land', v: 1, H: 9, c: 3, marks: [3, 4, 6], thing: 'apple' } : { kind: 'land', v: 2, H: 4, c: 2, marks: [2, 4, 6, 8], thing: 'orange' };
      const v = pickOne(rng, [1, 2, 3]);
      const H = pickOne(rng, i < 15 ? [1, 4] : [4, 9]);
      const d = v * root(H);
      if (d > COLS - 2) return null;
      const c = randInt(rng, COLS - d);
      const L = c + d;
      /* Straight down, the right spot, and one a step either side. */
      const marks = columns(rng, 4, [c, L, L + v, Math.max(c + 1, L - v)].filter((x) => x <= COLS - 1), c, COLS - 1);
      return { kind: 'land', v, H, c, marks, thing: pickOne(rng, THINGS.filter((x) => !x.air)).id };
    }
    case 'm2': {
      /* Falling things speed up: 1, 3, 5, 7 rows in each tick. */
      if (teach) return i === 0
        ? { kind: 'gaps', thing: 'apple', qs: [{ type: 'step', n: 3, opts: [1, 3, 5] }] }
        : { kind: 'gaps', thing: 'pear', qs: [{ type: 'total', n: 3, opts: [5, 6, 9] }] };
      const types = ['step', 'total', 'ticks'];
      const qs = [];
      for (let tries = 0; qs.length < 2 && tries < 40; tries++) {
        const type = pickOne(rng, types);
        if (qs.some((q) => q.type === type)) continue;
        const n = type === 'ticks' ? pickOne(rng, HEIGHTS.slice(1)) : 2 + randInt(rng, 4);
        const right = gapAnswer({ type, n });
        const wrongs = type === 'step' ? [n, n * n, 2 * n + 1, right - 2]
          : type === 'total' ? [2 * n - 1, 2 * n, n * (n + 1), right + n]
            : [n / 2, n, root(n) + 1, root(n) * 2];
        const opts = [...new Set([right, ...shuffled(rng, wrongs).filter((w) => Number.isInteger(w) && w > 0 && w !== right)])].slice(0, 3).sort((a, b) => a - b);
        if (opts.length < 3) continue;
        qs.push({ type, n, opts });
      }
      return qs.length === 2 ? { kind: 'gaps', thing: pickOne(rng, THINGS.filter((x) => !x.air)).id, qs } : null;
    }
    case 'm3':
      /* Two animals at two heights, one train. */
      return makeDrop(rng, { vs: [1, 2], hs: [1, 4, 9], k: 4, two: !teach || i === 1 });
    case 'h1':
      return makeDrop(rng, { vs: [2, 3, 4], hs: [1, 4, 9], k: i < 15 ? 4 : 5, two: i >= 15 });
    case 'h2': {
      /* The monkey can only let go at the sign: choose the train's speed. */
      if (teach) return i === 0 ? { kind: 'speed', H: 4, c: 2, M: 6, speeds: [0, 1, 2, 4], eater: 'hippo' } : { kind: 'speed', H: 9, c: 1, M: 7, speeds: [1, 2, 3], eater: 'elephant' };
      const H = pickOne(rng, [1, 4, 9]);
      const n = root(H);
      const v = 1 + randInt(rng, 4);
      const d = v * n;
      if (d > COLS - 1) return null;
      const c = randInt(rng, COLS - d);
      const speeds = [...new Set([v, ...shuffled(rng, SPEEDS.filter((s) => s !== v)).slice(0, 2)])].sort((a, b) => a - b);
      return { kind: 'speed', H, c, M: c + d, speeds, eater: pickOne(rng, EATERS).id };
    }
    case 'h3': {
      /* Race to the ground: only the height decides, not the weight, and
         not whether it was moving sideways. */
      if (teach) return i === 0
        ? { kind: 'pair', pairs: [{ a: { thing: 'apple', h: 9, v: 3 }, b: { thing: 'apple', h: 9 } }] }
        : { kind: 'pair', pairs: [{ a: { thing: 'watermelon', h: 9 }, b: { thing: 'grapes', h: 4, v: 2 } }] };
      const pairs = [];
      for (let tries = 0; pairs.length < 2 && tries < 60; tries++) {
        const dense = THINGS.filter((x) => !x.air);
        const [x, y] = shuffled(rng, dense).slice(0, 2);
        const same = rng() < 0.45;
        /* "Together" is only claimed up to 9 rows (4.5 m): from higher, air
           leaves a grape a hand's width behind a watermelon. A lower start
           wins by whole ticks, so different heights may go up to 16. */
        const ha = pickOne(rng, same ? [4, 9] : [4, 9, 16]);
        const hb = same ? ha : pickOne(rng, [1, 4, 9, 16].filter((h) => h !== ha));
        const pr = { a: { thing: x.id, h: ha, ...(rng() < 0.5 ? { v: 1 + randInt(rng, 4) } : {}) }, b: { thing: y.id, h: hb, ...(rng() < 0.5 ? { v: 1 + randInt(rng, 4) } : {}) } };
        if (pairs.some((q) => sameThings(q, pr))) continue;
        pairs.push(pr);
      }
      return pairs.length === 2 ? { kind: 'pair', pairs } : null;
    }
    default: return null;
  }
}

function sameThings(p, q) {
  const k = (pr) => [pr.a.thing, pr.b.thing].sort().join(',');
  return k(p) === k(q);
}

export const makeAt = (chId, i, ...seed) => makePuzzle(chapter(chId), rngFor('train', chId, i, ...seed), i);

export function sig(p) {
  switch (p.kind) {
    case 'drop': return `drop|${p.v}|${p.spots.join(',')}|${p.targets.map((g) => `${g.eater}:${g.H}:${g.M}`).join(';')}`;
    case 'land': return `land|${p.v}|${p.H}|${p.c}|${p.marks.join(',')}`;
    case 'speed': return `speed|${p.H}|${p.c}|${p.M}|${p.speeds.join(',')}`;
    case 'gaps': return `gaps|${p.qs.map((q) => `${q.type}${q.n}:${q.opts.join(',')}`).join(';')}`;
    case 'pair': return `pair|${p.pairs.map((pr) => [pr.a, pr.b].map((x) => `${x.thing}@${x.h}${x.v ? `>${x.v}` : ''}`).join('/')).join(';')}`;
    default: return JSON.stringify(p);
  }
}

/* ------------------------------------------------------------------ */
/* Proof                                                               */
/* ------------------------------------------------------------------ */

export function problems(p) {
  const errs = [];
  const err = (m) => errs.push(m);
  const ans = answers(p);
  const ch = choices(p);
  if (!ans.length) err('no questions');
  ans.forEach((a, k) => {
    if (a === null || a === undefined || a === -1) err(`question ${k + 1} has no right answer`);
    else if (!ch[k].includes(a)) err(`question ${k + 1}: ${a} is not a choice`);
  });
  const inTrack = (c) => Number.isInteger(c) && c >= 0 && c < COLS;
  switch (p.kind) {
    case 'drop': {
      if (!p.spots.every(inTrack) || new Set(p.spots).size !== p.spots.length) err('spots must be distinct columns on the track');
      for (const g of p.targets) {
        if (!HEIGHTS.includes(g.H)) err(`height ${g.H} is not a square`);
        if (!eaterById(g.eater)) err(`unknown animal ${g.eater}`);
        if (!inTrack(g.M)) err('the animal is off the track');
        const hits = p.spots.filter((c) => landing(c, p.v, g.H) === g.M);
        if (hits.length !== 1) err(`${hits.length} spots feed the ${g.eater}`);
      }
      if (new Set(p.targets.map((g) => g.M)).size !== p.targets.length) err('two animals in one place');
      break;
    }
    case 'land': {
      if (!HEIGHTS.includes(p.H)) err(`height ${p.H} is not a square`);
      const L = landing(p.c, p.v, p.H);
      if (!inTrack(L)) err('it lands off the track');
      if (p.marks.filter((m) => m === L).length !== 1) err('the landing spot must be one of the marks, once');
      break;
    }
    case 'speed': {
      const ok = p.speeds.filter((v) => landing(p.c, v, p.H) === p.M);
      if (ok.length !== 1) err(`${ok.length} speeds feed the animal`);
      break;
    }
    case 'gaps':
      for (const q of p.qs) {
        if (q.opts.filter((o) => o === gapAnswer(q)).length !== 1) err(`gap question ${q.type}${q.n} has no single answer`);
        if (q.type === 'ticks' && !HEIGHTS.includes(q.n)) err('a fall height must be a square');
      }
      break;
    case 'pair':
      for (const pr of p.pairs) {
        for (const x of [pr.a, pr.b]) {
          if (!thingById(x.thing)) err(`unknown thing ${x.thing}`);
          if (!HEIGHTS.includes(x.h)) err(`height ${x.h} is not a square`);
          if (x.h > 9 && thingById(x.thing) && thingById(x.thing).air) err('a drifter from high up');
        }
        if (firstDown(pr.a, pr.b) === 'same' && pr.a.h > 9) err('"together" from higher than 9 rows, where air starts to show');
      }
      break;
    default: err(`unknown kind ${p.kind}`);
  }
  return errs;
}

/** 3 with nothing wrong and no hint, 2 after one, 1 after that; teaching is always 3. */
export function starsFor({ wrong = 0, hints = 0, teach = false } = {}) {
  if (teach) return 3;
  const n = wrong + hints;
  return n === 0 ? 3 : n === 1 ? 2 : 1;
}

export default {
  LEVELS, HEIGHTS, root, EATERS, THINGS, thingById, eaterById, at, landing, stepIn, totalAfter, firstDown,
  CHAPTER_SIZE, TEACH, COLS, CHAPTERS, chapter, answers, gapAnswer, choices, retries, makePuzzle, makeAt, sig, problems, starsFor
};
