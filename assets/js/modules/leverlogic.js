/**
 * leverlogic.js — Lift the Elephant: a plank on a rock, and the rule that
 * decides which way it tips.
 *
 * Every peg is a whole number of steps from the rock and every animal has a
 * whole weight (the number on its tag). A side's turning push is the sum of
 * weight × steps for everything on it. The bigger side goes down; equal
 * sides leave the plank level (research-levers-shadows-water-dominos.md
 * section 1.1). The plank weighs nothing, or rests on the rock at its middle,
 * so its own weight never counts, except in the "heavy plank" chapter, where
 * the rock is off-centre and the plank's weight is shown as a token at its
 * middle.
 *
 * The chapters follow Siegler's balance-scale item types: weight, distance
 * and balance first, then the three conflict types, where weight and
 * distance pull opposite ways, then items where adding weight and steps
 * (a rule some children use) gives a different answer from multiplying.
 *
 * Pure: no DOM, no Math.random.
 */

import { pickOne, randInt, rngFor, shuffled } from './logicrng.js';

export const LEVELS = ['easy', 'medium', 'hard'];

/* The small animals and their weights. The load is any of the big ones,
   with its own weight on its tag. */
export const SMALL = [
  { id: 'mouse', emoji: '🐭', w: 1 },
  { id: 'rabbit', emoji: '🐰', w: 2 },
  { id: 'monkey', emoji: '🐒', w: 3 },
  { id: 'panda', emoji: '🐼', w: 4 }
];
export const BIG = [
  { id: 'elephant', emoji: '🐘' },
  { id: 'hippo', emoji: '🦛' },
  { id: 'rhino', emoji: '🦏' }
];
export const animal = (id) => SMALL.find((a) => a.id === id) || BIG.find((a) => a.id === id) || null;

/* ------------------------------------------------------------------ */
/* The rule                                                            */
/* ------------------------------------------------------------------ */

/** A side's turning push: the sum of weight × steps. */
export const push = (side) => side.reduce((s, x) => s + x.w * x.peg, 0);

/** The plank's own push, when the rock is off its middle: weight × steps, on its long side. */
export const plankPush = (p, side) => (p.plank && p.plank.side === side ? p.plank.w * p.plank.steps : 0);

export const pushL = (p) => push(p.left) + plankPush(p, 'L');
export const pushR = (p) => push(p.right) + plankPush(p, 'R');

/** 'L' (left goes down), 'R', or 'level'. */
export function tilt(p) {
  const l = pushL(p);
  const r = pushR(p);
  return l > r ? 'L' : r > l ? 'R' : 'level';
}

/* What a child using only weight, or adding weight and steps, would say:
   the wrong ideas the conflict chapters are built to catch. */
const sideWeight = (side) => side.reduce((s, x) => s + x.w, 0);
export function weightOnly(p) {
  const l = sideWeight(p.left);
  const r = sideWeight(p.right);
  return l > r ? 'L' : r > l ? 'R' : 'level';
}
export function addRule(p) {
  /* A stack's weight plus its steps, once per peg (Siegler's L10). */
  const f = (side) => {
    const byPeg = new Map();
    side.forEach((x) => byPeg.set(x.peg, (byPeg.get(x.peg) || 0) + x.w));
    return [...byPeg].reduce((s, [g, w]) => s + w + g, 0);
  };
  const l = f(p.left);
  const r = f(p.right);
  return l > r ? 'L' : r > l ? 'R' : 'level';
}

/** Siegler's item type for a two-sided plank with one stack each side. */
export function itemType(p) {
  const wl = sideWeight(p.left);
  const wr = sideWeight(p.right);
  const dl = p.left[0] ? p.left[0].peg : 0;
  const dr = p.right[0] ? p.right[0].peg : 0;
  if (wl === wr && dl === dr) return 'balance';
  if (dl === dr) return 'weight';
  if (wl === wr) return 'distance';
  const t = tilt(p);
  if (t === 'level') return 'conflict-balance';
  const heavier = wl > wr ? 'L' : 'R';
  return t === heavier ? 'conflict-weight' : 'conflict-distance';
}

/* ------------------------------------------------------------------ */
/* Chapters                                                            */
/* ------------------------------------------------------------------ */

export const CHAPTER_SIZE = 30;
export const TEACH = 2;

/*   tilt   which side goes down?            (three choices)
     build  put the animals on pegs so the plank does what the card says
     far    the light end goes down so far: how far does the load go up? */
export const CHAPTERS = {
  easy: [
    { id: 'e1', kind: 'tilt', icon: '⚖️' },
    { id: 'e2', kind: 'build', icon: '🐘' },
    { id: 'e3', kind: 'build', icon: '➖' }
  ],
  medium: [
    { id: 'm1', kind: 'tilt', icon: '🤔' },
    { id: 'm2', kind: 'build', icon: '🐰' },
    { id: 'm3', kind: 'far', icon: '📐' }
  ],
  hard: [
    { id: 'h1', kind: 'tilt', icon: '✖️' },
    { id: 'h2', kind: 'build', icon: '🧮' },
    { id: 'h3', kind: 'tilt', icon: '🪵' }
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
/* Build puzzles: every placement, tried                               */
/* ------------------------------------------------------------------ */

/**
 * Every way to put the tray's animals on the free pegs of their side (one
 * animal a peg) that makes the plank do what the goal says. Animals of the
 * same kind are interchangeable, so a placement is the set of
 * "animal@peg". A good puzzle has exactly one.
 */
export function solutions(p, cap = 3) {
  const taken = new Set([...(p.side === 'L' ? p.left : p.right).map((x) => x.peg), ...(p.covered || [])]);
  const free = Array.from({ length: p.pegs }, (_, i) => i + 1).filter((g) => !taken.has(g));
  const found = new Set();
  const placed = [];
  const walk = (k, usedPegs) => {
    if (found.size >= cap) return;
    if (k === p.tray.length) {
      const extra = placed.map((x) => ({ ...x }));
      const q = p.side === 'L' ? { ...p, left: [...p.left, ...extra] } : { ...p, right: [...p.right, ...extra] };
      if (tilt(q) === goalTilt(p)) found.add(placed.map((x) => `${x.a}@${x.peg}`).sort().join(','));
      return;
    }
    for (const g of free) {
      if (usedPegs.has(g)) continue;
      usedPegs.add(g);
      placed[k] = { a: p.tray[k], w: animal(p.tray[k]).w, peg: g };
      walk(k + 1, usedPegs);
      usedPegs.delete(g);
    }
  };
  walk(0, new Set());
  return [...found];
}

/* "lift": the side the child loads goes down, so the load goes up. */
export const goalTilt = (p) => (p.goal === 'level' ? 'level' : p.side);

/* ------------------------------------------------------------------ */
/* Making experiments                                                  */
/* ------------------------------------------------------------------ */

const stack = (a, n, peg) => Array.from({ length: n }, () => ({ a, w: animal(a).w, peg }));
const smallUpTo = (max) => SMALL.filter((a) => a.w <= max);

/** A one-stack-a-side plank of a wanted Siegler type. */
function makeTiltSimple(rng, { type, pegs, maxW }) {
  for (let tries = 0; tries < 200; tries++) {
    const a = pickOne(rng, smallUpTo(maxW));
    const b = pickOne(rng, smallUpTo(maxW));
    const na = 1 + randInt(rng, 3);
    const nb = 1 + randInt(rng, 3);
    const pa = 1 + randInt(rng, pegs);
    const pb = 1 + randInt(rng, pegs);
    const p = { kind: 'tilt', pegs, left: stack(a.id, na, pa), right: stack(b.id, nb, pb) };
    if (a.id !== b.id && (type === 'weight' || type === 'distance' || type === 'balance')) continue; // simple items: one kind of animal
    if (itemType(p) === type) return p;
  }
  return null;
}

/** A plank with two or three stacks a side, where adding would mislead. */
function makeTiltMany(rng, { pegs }) {
  for (let tries = 0; tries < 300; tries++) {
    const side = () => {
      const n = 1 + randInt(rng, 2);
      const pegsUsed = shuffled(rng, Array.from({ length: pegs }, (_, i) => i + 1)).slice(0, n);
      return pegsUsed.flatMap((g) => stack(pickOne(rng, SMALL).id, 1 + randInt(rng, 2), g));
    };
    const p = { kind: 'tilt', pegs, left: side(), right: side() };
    if (addRule(p) !== tilt(p) || (weightOnly(p) !== tilt(p) && rng() < 0.5)) return p;
  }
  return null;
}

/** A build puzzle: a load on one side, animals to place on the other. */
function makeBuild(rng, { goal, pegs, trayN, loadMax, covered = 0, teach }) {
  for (let tries = 0; tries < 400; tries++) {
    const big = pickOne(rng, BIG);
    const loadW = 2 + randInt(rng, loadMax - 1);
    const loadPeg = 1 + randInt(rng, Math.min(3, pegs));
    const tray = Array.from({ length: trayN }, () => pickOne(rng, smallUpTo(trayN === 1 ? 2 : 4)).id).sort();
    const cov = shuffled(rng, Array.from({ length: pegs }, (_, i) => i + 1)).slice(0, covered).sort((a, b) => a - b);
    const p = {
      kind: 'build', goal, pegs, side: 'L', left: [], right: [{ a: big.id, w: loadW, peg: loadPeg }],
      tray, ...(cov.length ? { covered: cov } : {})
    };
    if (solutions(p, 2).length === 1) return p;
  }
  return null;
}

/** "How far": the light end moves d notches; the load moves d × its steps ÷ the light end's steps. */
function makeFar(rng, { teach, i }) {
  for (let tries = 0; tries < 200; tries++) {
    const e = 2 + randInt(rng, 5);                  // the light end's peg
    const l = 1 + randInt(rng, e - 1);              // the load's peg, nearer the rock
    const unit = 1 + randInt(rng, 3);
    const d = e * unit;                             // notches the light end goes down
    const rise = l * unit;
    const opts = [...new Set([rise, d, Math.max(1, rise + unit), Math.max(1, rise - unit), d + l])].filter((x) => x > 0).slice(0, 4);
    if (opts.length < 3 || !opts.includes(rise)) continue;
    return {
      kind: 'far', pegs: 6, left: [{ a: pickOne(rng, SMALL).id, w: 1, peg: e }], right: [{ a: pickOne(rng, BIG).id, w: 6, peg: l }],
      down: d, opts: shuffled(rng, opts.slice(0, 3)).sort((a, b) => a - b)
    };
  }
  return null;
}

const SIMPLE = ['weight', 'distance', 'balance'];
const CONFLICT = ['conflict-weight', 'conflict-distance', 'conflict-balance'];

export function makePuzzle(ch, rng, i = TEACH) {
  const teach = i < TEACH;
  switch (ch.id) {
    case 'e1':
      if (i === 0) return { kind: 'tilt', pegs: 4, left: stack('mouse', 2, 2), right: stack('mouse', 1, 2) };
      if (i === 1) return { kind: 'tilt', pegs: 4, left: stack('mouse', 1, 1), right: stack('mouse', 1, 4) };
      return makeTiltSimple(rng, { type: SIMPLE[i % 3], pegs: 4, maxW: 2 });
    case 'e2':
      /* Lift the elephant: the hero puzzle is one mouse at the far end. */
      if (i === 0) return { kind: 'build', goal: 'lift', pegs: 6, side: 'L', left: [], right: [{ a: 'elephant', w: 5, peg: 1 }], tray: ['mouse'] };
      if (i === 1) return { kind: 'build', goal: 'lift', pegs: 6, side: 'L', left: [], right: [{ a: 'hippo', w: 5, peg: 2 }], tray: ['rabbit'] };
      /* Flower pots on some pegs leave exactly one peg that lifts. */
      return makeBuild(rng, { goal: 'lift', pegs: 6, trayN: 1, loadMax: 10, covered: randInt(rng, 3) });
    case 'e3':
      if (i === 0) return { kind: 'build', goal: 'level', pegs: 4, side: 'L', left: [], right: [{ a: 'elephant', w: 4, peg: 1 }], tray: ['mouse'] };
      if (i === 1) return { kind: 'build', goal: 'level', pegs: 4, side: 'L', left: [], right: [{ a: 'hippo', w: 3, peg: 2 }], tray: ['rabbit'] };
      return makeBuild(rng, { goal: 'level', pegs: 6, trayN: 1, loadMax: 10, covered: randInt(rng, 2) });
    case 'm1':
      if (i === 0) return { kind: 'tilt', pegs: 6, left: stack('mouse', 3, 2), right: stack('mouse', 1, 4) };
      if (i === 1) return { kind: 'tilt', pegs: 6, left: stack('mouse', 2, 1), right: stack('mouse', 1, 3) };
      return makeTiltSimple(rng, { type: CONFLICT[i % 3], pegs: 6, maxW: 4 });
    case 'm2':
      if (i === 0) return { kind: 'build', goal: 'level', pegs: 6, side: 'L', left: [], right: [{ a: 'elephant', w: 4, peg: 3 }], tray: ['rabbit', 'rabbit'], covered: [1, 5] };
      if (i === 1) return { kind: 'build', goal: 'level', pegs: 6, side: 'L', left: [], right: [{ a: 'rhino', w: 5, peg: 2 }], tray: ['mouse', 'panda'] };
      return makeBuild(rng, { goal: rng() < 0.6 ? 'level' : 'lift', pegs: 6, trayN: 2, loadMax: 8, covered: randInt(rng, 3) });
    case 'm3':
      if (i === 0) return { kind: 'far', pegs: 6, left: [{ a: 'mouse', w: 1, peg: 6 }], right: [{ a: 'elephant', w: 3, peg: 2 }], down: 6, opts: [2, 3, 6] };
      return makeFar(rng, { teach, i });
    case 'h1':
      if (i === 0) return { kind: 'tilt', pegs: 6, left: stack('mouse', 1, 6), right: stack('mouse', 3, 2) };
      if (i === 1) return { kind: 'tilt', pegs: 6, left: [...stack('rabbit', 1, 1), ...stack('mouse', 1, 5)], right: stack('monkey', 1, 2) };
      return makeTiltMany(rng, { pegs: 6 });
    case 'h2':
      if (i === 0) return { kind: 'build', goal: 'level', pegs: 4, side: 'L', left: [], right: [{ a: 'elephant', w: 6, peg: 2 }], tray: ['monkey', 'mouse', 'rabbit'] };
      if (i === 1) return { kind: 'build', goal: 'level', pegs: 6, side: 'L', left: [], right: [{ a: 'hippo', w: 7, peg: 3 }], tray: ['panda', 'panda', 'mouse'], covered: [2, 6] };
      return makeBuild(rng, { goal: 'level', pegs: 6, trayN: 3, loadMax: 12, covered: randInt(rng, 3) });
    case 'h3': {
      /* The rock is off the plank's middle: the plank's own weight pushes
         on its long side, at its middle. */
      if (i === 0) return { kind: 'tilt', pegs: 6, left: stack('mouse', 1, 3), right: [], plank: { w: 2, side: 'R', steps: 1 } };
      if (i === 1) return { kind: 'tilt', pegs: 6, left: stack('rabbit', 1, 2), right: stack('mouse', 1, 1), plank: { w: 3, side: 'R', steps: 1 } };
      for (let tries = 0; tries < 200; tries++) {
        const p = makeTiltSimple(rng, { type: pickOne(rng, [...SIMPLE, ...CONFLICT]), pegs: 6, maxW: 4 });
        if (!p) continue;
        const plank = { w: 1 + randInt(rng, 4), side: pickOne(rng, ['L', 'R']), steps: 1 + randInt(rng, 2) };
        const q = { ...p, plank };
        /* Only keep it when the plank's weight changes the answer, or makes it level. */
        if (tilt(q) !== tilt(p)) return q;
      }
      return null;
    }
    default: return null;
  }
}

export const makeAt = (chId, i, ...seed) => makePuzzle(chapter(chId), rngFor('lever', chId, i, ...seed), i);

const sideSig = (s) => s.map((x) => `${x.a}${x.w}@${x.peg}`).sort().join('+');
export const sig = (p) => `${p.kind}|${p.goal || ''}|${p.pegs}|${sideSig(p.left)}|${sideSig(p.right)}|${(p.tray || []).join(',')}|${(p.covered || []).join(',')}|${p.plank ? `${p.plank.w}${p.plank.side}${p.plank.steps}` : ''}|${p.down || ''}`;

/* ------------------------------------------------------------------ */
/* Answers and proof                                                   */
/* ------------------------------------------------------------------ */

export const riseOf = (p) => (p.down * p.right[0].peg) / p.left[0].peg;

export function answers(p) {
  if (p.kind === 'tilt') return [tilt(p)];
  if (p.kind === 'far') return [p.opts.indexOf(riseOf(p))];
  return [];
}

export const choices = (p) => (p.kind === 'tilt' ? [['L', 'level', 'R']] : p.kind === 'far' ? [p.opts.map((_, i) => i)] : []);

export function problems(p) {
  const errs = [];
  const err = (m) => errs.push(m);
  const all = [...p.left, ...p.right];
  if (all.some((x) => !animal(x.a))) err('an unknown animal');
  if (all.some((x) => x.peg < 1 || x.peg > p.pegs || !Number.isInteger(x.peg))) err('a peg off the plank');
  if (p.kind === 'tilt') {
    if (!p.left.length && !p.right.length) err('an empty plank');
  } else if (p.kind === 'build') {
    if (!p.tray.length) err('nothing to place');
    if (p.tray.some((a) => !SMALL.find((s) => s.id === a))) err('only small animals go in the tray');
    const n = solutions(p, 3).length;
    if (n !== 1) err(`${n} placements do what the card says, not one`);
  } else if (p.kind === 'far') {
    const r = riseOf(p);
    if (!Number.isInteger(r)) err('the rise is not a whole number');
    if (p.opts.filter((o) => o === r).length !== 1) err('the rise is not one of the choices, once');
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
  LEVELS, SMALL, BIG, animal, push, plankPush, pushL, pushR, tilt, weightOnly, addRule, itemType, CHAPTER_SIZE, TEACH,
  CHAPTERS, chapter, solutions, goalTilt, makePuzzle, makeAt, sig, riseOf, answers, choices, problems, starsFor
};
