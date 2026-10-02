/**
 * codelogic.js — Crack the Code: the rules, the solver and the puzzle maker.
 *
 * A row of animals is locked in a safe. Each clue is an earlier guess and
 * what it got right. The child works out the one code that fits every clue.
 * This is the Bulls and Cows family, which is folk and free to use; the
 * research and the reasons for every choice here are in
 * docs/research/logic/research-code.md.
 *
 * Pure: no DOM, no fetch, no Math.random. The build tool, the checker, the
 * tests and the page all run this same file, so a puzzle the page shows is
 * the puzzle the checker proved.
 *
 * Three kinds of feedback, chosen per chapter:
 *   spot  one mark under every animal: home / wrong home / not here (Easy)
 *   mid   "home" marked under its slot, plus a count of wrong homes (Medium)
 *   agg   two counts only: how many home, how many wrong home (Medium, Hard)
 *
 * The solver works like a careful child, cheapest idea first, and writes down
 * every step. That one list grades a puzzle, proves it has one answer, gives
 * the next hint and becomes the "why" after a solve.
 */

import { randInt, rngFor, shuffled } from './logicrng.js';

/* ------------------------------------------------------------------ */
/* Chapters                                                            */
/* ------------------------------------------------------------------ */

/**
 * n slots, k symbols to choose from, `fb` the feedback, `clues` the fewest and
 * most clues a puzzle may have, `tiers` the hardest rule it may need, low and
 * high. `digits` chapters use 0-9 instead of animals. `budget` is the number
 * of guesses in a free crack. `missing` asks for an animal no clue shows.
 */
export const CHAPTERS = {
  easy: [
    { id: 'e1', n: 3, k: 4, fb: 'spot', clues: [2, 2], tiers: [1, 2], budget: 6, animal: 'lion' },
    { id: 'e2', n: 3, k: 5, fb: 'spot', clues: [2, 3], tiers: [1, 2], budget: 7, animal: 'monkey' },
    { id: 'e3', n: 3, k: 6, fb: 'spot', clues: [2, 3], tiers: [2, 2], budget: 8, animal: 'frog', missing: true },
    { id: 'e4', n: 4, k: 6, fb: 'spot', clues: [3, 4], tiers: [1, 2], budget: 9, animal: 'penguin' }
  ],
  medium: [
    { id: 'm1', n: 4, k: 6, fb: 'mid', clues: [3, 4], tiers: [2, 3], budget: 9, animal: 'zebra' },
    { id: 'm2', n: 3, k: 6, fb: 'agg', clues: [3, 4], tiers: [3, 3], budget: 8, animal: 'flamingo' },
    { id: 'm3', n: 4, k: 6, fb: 'agg', clues: [3, 5], tiers: [3, 3], budget: 10, animal: 'owl' },
    { id: 'm4', n: 3, k: 10, fb: 'agg', clues: [4, 5], tiers: [3, 3], budget: 10, animal: 'turtle', digits: true }
  ],
  hard: [
    { id: 'h1', n: 4, k: 6, fb: 'agg', clues: [4, 6], tiers: [4, 4], budget: 10, animal: 'elephant' },
    { id: 'h2', n: 4, k: 8, fb: 'agg', clues: [4, 6], tiers: [3, 4], budget: 11, animal: 'giraffe' },
    { id: 'h3', n: 4, k: 10, fb: 'agg', clues: [5, 7], tiers: [3, 4], budget: 12, animal: 'panda', digits: true },
    { id: 'h4', n: 4, k: 6, fb: 'agg', clues: [4, 7], tiers: [3, 4], budget: 12, animal: 'hippo', repeats: true }
  ]
};

export const LEVELS = ['easy', 'medium', 'hard'];

/** A chapter's settings from its id ('m3'), or null. */
export function chapter(id) {
  for (const level of LEVELS) {
    const ch = CHAPTERS[level].find((c) => c.id === id);
    if (ch) return { ...ch, level, repeats: Boolean(ch.repeats) };
  }
  return null;
}

/* What a chapter holds, in order. Every fifth puzzle asks "could it be?";
   puzzles 14, 28, 42, 56 and 70 are a free crack, the chapter's boss. */
export const CHAPTER_SIZE = 70;
export const TEACH = 3;
export function modeAt(index) {
  const n = index + 1;
  if (n % 14 === 0) return 'free';
  if (n > TEACH && n % 5 === 0) return 'could';
  return 'clue';
}

/* ------------------------------------------------------------------ */
/* Feedback                                                            */
/* ------------------------------------------------------------------ */

/**
 * One mark per slot: 'h' home, 'w' in the code but another spot, 'n' not
 * here. Repeats follow Wordle's rule: exact matches first, then the leftover
 * copies are handed out left to right, so a guess never claims more of an
 * animal than the code holds.
 */
export function spotFeedback(guess, code) {
  const out = guess.map((g, i) => (g === code[i] ? 'h' : null));
  const left = new Map();
  code.forEach((c, i) => { if (out[i] !== 'h') left.set(c, (left.get(c) || 0) + 1); });
  return out.map((m, i) => {
    if (m) return m;
    const n = left.get(guess[i]) || 0;
    if (n > 0) { left.set(guess[i], n - 1); return 'w'; }
    return 'n';
  });
}

/** Two counts: { h: right animal, right spot; w: right animal, wrong spot }. */
export function aggFeedback(guess, code) {
  let h = 0;
  const cg = new Map();
  const cc = new Map();
  guess.forEach((g, i) => {
    if (g === code[i]) { h += 1; return; }
    cg.set(g, (cg.get(g) || 0) + 1);
    cc.set(code[i], (cc.get(code[i]) || 0) + 1);
  });
  let w = 0;
  for (const [sym, n] of cg) w += Math.min(n, cc.get(sym) || 0);
  return { h, w };
}

/** Home is marked under its slot; wrong homes are only counted. */
export function midFeedback(guess, code) {
  const { w } = aggFeedback(guess, code);
  return { marks: guess.map((g, i) => g === code[i]), w };
}

export function feedback(guess, code, fb) {
  if (fb === 'spot') return spotFeedback(guess, code);
  if (fb === 'mid') return midFeedback(guess, code);
  return aggFeedback(guess, code);
}

/** Feedback as a short string, so two can be compared with ===. */
export function fbKey(f) {
  if (Array.isArray(f)) return f.join('');
  if (f.marks) return `${f.marks.map((m) => (m ? 'h' : '.')).join('')}/${f.w}`;
  return `${f.h}/${f.w}`;
}

/* ------------------------------------------------------------------ */
/* Codes                                                               */
/* ------------------------------------------------------------------ */

const codeCache = new Map();

/** Every possible code, as arrays of symbol numbers 0..k-1. Cached. */
export function allCodes(n, k, repeats = false) {
  const key = `${n}/${k}/${repeats ? 1 : 0}`;
  if (codeCache.has(key)) return codeCache.get(key);
  const out = [];
  const cur = [];
  const used = new Array(k).fill(false);
  const walk = () => {
    if (cur.length === n) { out.push(cur.slice()); return; }
    for (let s = 0; s < k; s++) {
      if (!repeats && used[s]) continue;
      used[s] = true; cur.push(s);
      walk();
      cur.pop(); used[s] = false;
    }
  };
  walk();
  codeCache.set(key, out);
  return out;
}

export const sameCode = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);

/** Does `code` give every clue exactly the feedback it shows? */
export function fits(code, clues, fb) {
  return clues.every((c) => fbKey(feedback(c.g, code, fb)) === fbKey(c.f));
}

/** The codes that fit every clue. Stops once it has `cap` of them. */
export function solutions(ch, clues, cap = Infinity) {
  const out = [];
  for (const code of allCodes(ch.n, ch.k, ch.repeats)) {
    if (fits(code, clues, ch.fb)) {
      out.push(code);
      if (out.length >= cap) break;
    }
  }
  return out;
}

/** Make clues from guesses and the secret. */
export const makeClues = (ch, guesses, secret) =>
  guesses.map((g) => ({ g: g.slice(), f: feedback(g, secret, ch.fb) }));

/** The clues of a stored puzzle, rebuilt from its guesses. */
export const cluesOf = (ch, p) => makeClues(ch, p.clues, p.secret);

/* ------------------------------------------------------------------ */
/* The solver                                                          */
/* ------------------------------------------------------------------ */

/*
 * The state is a possibility grid: dom[s] is a bit mask of the symbols that
 * could still be in slot s. `must` (codes without repeats) holds the symbols
 * known to be somewhere in the code.
 *
 * The rules, in the order a child would reach for them. A step is
 * { rule, tier, clue?, sym?, slot?, out: [[slot, sym], ...], place?: [slot, sym],
 *   must?: [sym, ...] }. `out` is every cell the step crosses off.
 *
 *   R1 not here      (tier 1)  a clue says an animal is not in the code
 *   R2 home          (tier 1)  a clue says an animal is home in a slot
 *   R3 wrong home    (tier 1)  a clue says an animal is in the code, but not here
 *   R4 last place    (tier 2)  an animal that must be in has one slot left
 *   R5 last animal   (tier 2)  a slot has one animal left
 *   R5m missing one  (tier 2)  only n animals are still possible, so all are in
 *   R6 count         (tier 3)  a clue's counts only fit if this cell is crossed off
 *   R7 what if       (tier 4)  putting an animal here would break a clue
 */
export const TIER = { R1: 1, R2: 1, R3: 1, R4: 2, R5: 2, R5m: 2, R6: 3, R7: 4 };

const bit = (s) => 1 << s;
const has = (mask, s) => (mask & bit(s)) !== 0;
const popcount = (m) => { let c = 0; while (m) { m &= m - 1; c += 1; } return c; };
const only = (m) => (popcount(m) === 1 ? 31 - Math.clz32(m) : -1);

function freshState(ch) {
  const full = (1 << ch.k) - 1;
  return { dom: new Array(ch.n).fill(full), must: 0 };
}

const copyState = (st) => ({ dom: st.dom.slice(), must: st.must });

/** Put `sym` in `slot`; without repeats, cross it off everywhere else. */
function placeOut(ch, st, slot, sym) {
  const out = [];
  for (let s = 0; s < ch.n; s++) {
    if (s === slot) {
      for (let x = 0; x < ch.k; x++) if (x !== sym && has(st.dom[s], x)) out.push([s, x]);
    } else if (!ch.repeats && has(st.dom[s], sym)) {
      out.push([s, sym]);
    }
  }
  return out;
}

function apply(ch, st, step) {
  for (const [s, x] of step.out) st.dom[s] &= ~bit(x);
  if (step.must) for (const x of step.must) st.must |= bit(x);
  if (!ch.repeats && step.place) st.must |= bit(step.place[1]);
}

/* Each rule returns a step or null. Clue feedback per slot is read in a
   form that covers all three feedback kinds. */
function marksOf(ch, clue) {
  if (ch.fb === 'spot') return clue.f;
  if (ch.fb === 'mid') return clue.f.marks.map((m) => (m ? 'h' : '?'));
  return null;
}

function ruleNotHere(ch, st, clues) {
  for (let ci = 0; ci < clues.length; ci++) {
    const c = clues[ci];
    let absent = [];
    if (ch.fb === 'spot' && !ch.repeats) {
      absent = c.g.filter((g, i) => c.f[i] === 'n');
    } else {
      const f = ch.fb === 'mid' ? { h: c.f.marks.filter(Boolean).length, w: c.f.w } : c.f;
      if (f.h + f.w === 0) absent = c.g.slice();
    }
    for (const sym of absent) {
      const out = [];
      for (let s = 0; s < ch.n; s++) if (has(st.dom[s], sym)) out.push([s, sym]);
      if (out.length) return { rule: 'R1', clue: ci, sym, out };
    }
  }
  return null;
}

function ruleHome(ch, st, clues) {
  for (let ci = 0; ci < clues.length; ci++) {
    const m = marksOf(ch, clues[ci]);
    if (!m) continue;
    for (let s = 0; s < ch.n; s++) {
      if (m[s] !== 'h') continue;
      const sym = clues[ci].g[s];
      const out = placeOut(ch, st, s, sym);
      if (out.length) return { rule: 'R2', clue: ci, sym, slot: s, place: [s, sym], out };
    }
  }
  return null;
}

function ruleWrongHome(ch, st, clues) {
  for (let ci = 0; ci < clues.length; ci++) {
    const c = clues[ci];
    const m = marksOf(ch, c);
    if (!m) continue;
    for (let s = 0; s < ch.n; s++) {
      /* spot: 'w' says "in, but not here". mid: an unmarked slot says "not
         home here", which is the same crossing-off without the "in". */
      if (m[s] !== 'w' && m[s] !== '?') continue;
      const sym = c.g[s];
      const inCode = m[s] === 'w' && !ch.repeats;
      const newMust = inCode && !has(st.must, sym);
      if (has(st.dom[s], sym) || newMust) {
        return {
          rule: 'R3', clue: ci, sym, slot: s, out: has(st.dom[s], sym) ? [[s, sym]] : [],
          must: inCode ? [sym] : undefined, notHome: m[s] === '?'
        };
      }
    }
  }
  return null;
}

function ruleLastPlace(ch, st) {
  if (ch.repeats) return null;
  for (let sym = 0; sym < ch.k; sym++) {
    if (!has(st.must, sym)) continue;
    const slots = [];
    for (let s = 0; s < ch.n; s++) if (has(st.dom[s], sym)) slots.push(s);
    if (slots.length !== 1) continue;
    const out = placeOut(ch, st, slots[0], sym);
    if (out.length) return { rule: 'R4', sym, slot: slots[0], place: [slots[0], sym], out };
  }
  return null;
}

function ruleLastAnimal(ch, st) {
  if (ch.repeats) return null;
  for (let s = 0; s < ch.n; s++) {
    const sym = only(st.dom[s]);
    if (sym < 0) continue;
    const out = placeOut(ch, st, s, sym);
    if (out.length) return { rule: 'R5', sym, slot: s, place: [s, sym], out };
  }
  return null;
}

function ruleMissing(ch, st) {
  if (ch.repeats) return null;
  let possible = 0;
  for (const m of st.dom) possible |= m;
  if (popcount(possible) !== ch.n) return null;
  const add = [];
  for (let x = 0; x < ch.k; x++) if (has(possible, x) && !has(st.must, x)) add.push(x);
  return add.length ? { rule: 'R5m', must: add, out: [] } : null;
}

/* The codes that fit one clue, worked out once per puzzle. */
function clueCodes(ch, clues) {
  const codes = allCodes(ch.n, ch.k, ch.repeats);
  return clues.map((c) => {
    const key = fbKey(c.f);
    return codes.filter((code) => fbKey(feedback(c.g, code, ch.fb)) === key);
  });
}

const inDom = (st, code) => code.every((x, s) => has(st.dom[s], x));
const hasMust = (ch, st, code) => {
  if (ch.repeats || !st.must) return true;
  let m = 0;
  for (const x of code) m |= bit(x);
  return (st.must & m) === st.must;
};

/** R6: for one clue at a time, keep only cells some fitting code uses. */
function ruleCount(ch, st, clues, perClue) {
  for (let ci = 0; ci < clues.length; ci++) {
    const support = new Array(ch.n).fill(0);
    let any = false;
    for (const code of perClue[ci]) {
      if (!inDom(st, code) || !hasMust(ch, st, code)) continue;
      any = true;
      code.forEach((x, s) => { support[s] |= bit(x); });
    }
    if (!any) return { contradiction: ci };
    const out = [];
    for (let s = 0; s < ch.n; s++) {
      for (let x = 0; x < ch.k; x++) if (has(st.dom[s], x) && !has(support[s], x)) out.push([s, x]);
    }
    if (out.length) {
      /* Name the step after one crossing-off, the first, so a hint can say
         one thing; the step itself crosses off all of them. */
      return { rule: 'R6', clue: ci, slot: out[0][0], sym: out[0][1], out };
    }
  }
  return null;
}

function broken(ch, st) {
  if (st.dom.some((m) => m === 0)) return true;
  if (!ch.repeats) {
    let possible = 0;
    for (const m of st.dom) possible |= m;
    if ((st.must & possible) !== st.must) return true;
    if (popcount(st.must) > ch.n) return true;
  }
  return false;
}

const RULES = [
  ['R1', ruleNotHere], ['R2', ruleHome], ['R3', ruleWrongHome],
  ['R4', ruleLastPlace], ['R5', ruleLastAnimal], ['R5m', ruleMissing]
];

/** One step with the cheapest rule that makes progress, up to `maxTier`. */
function nextStep(ch, st, clues, perClue, maxTier) {
  for (const [, fn] of RULES) {
    const step = fn(ch, st, clues);
    if (step) return step;
  }
  if (maxTier >= 3) {
    const step = ruleCount(ch, st, clues, perClue);
    if (step) return step;
  }
  return null;
}

/** Run tiers 1-3 to a standstill. Returns the clue that broke, or -1, or null. */
function settle(ch, st, clues, perClue) {
  for (let guard = 0; guard < 200; guard++) {
    if (broken(ch, st)) return -1;
    const step = nextStep(ch, st, clues, perClue, 3);
    if (!step) return null;
    if (step.contradiction !== undefined) return step.contradiction;
    apply(ch, st, step);
  }
  return null;
}

/** R7: try one animal in one slot, follow it through, and see a clue break. */
function ruleWhatIf(ch, st, clues, perClue) {
  for (let s = 0; s < ch.n; s++) {
    if (popcount(st.dom[s]) < 2) continue;
    for (let x = 0; x < ch.k; x++) {
      if (!has(st.dom[s], x)) continue;
      const trial = copyState(st);
      apply(ch, trial, { out: placeOut(ch, trial, s, x), place: [s, x] });
      const why = settle(ch, trial, clues, perClue);
      if (why !== null) return { rule: 'R7', slot: s, sym: x, clue: why >= 0 ? why : undefined, out: [[s, x]] };
    }
  }
  return null;
}

const solved = (st) => st.dom.every((m) => popcount(m) === 1);

/**
 * Solve like a person. Returns { solved, tier, steps, code }.
 * `tier` is the hardest rule used. `from` lets a hint start from a state.
 */
export function humanSolve(ch, clues, { maxTier = 4, from = null } = {}) {
  const st = from ? copyState(from) : freshState(ch);
  const perClue = clueCodes(ch, clues);
  const steps = [];
  let tier = 0;
  for (let guard = 0; guard < 400 && !solved(st); guard++) {
    if (broken(ch, st)) break;
    let step = nextStep(ch, st, clues, perClue, maxTier);
    if (step && step.contradiction !== undefined) break;
    if (!step && maxTier >= 4) step = ruleWhatIf(ch, st, clues, perClue);
    if (!step) break;
    step.tier = TIER[step.rule];
    tier = Math.max(tier, step.tier);
    apply(ch, st, step);
    steps.push(step);
  }
  const done = solved(st) && !broken(ch, st);
  return { solved: done, tier, steps, code: done ? st.dom.map(only) : null, state: st };
}

/* ------------------------------------------------------------------ */
/* Hints                                                               */
/* ------------------------------------------------------------------ */

/**
 * The next thing to show a child, given what they have done so far.
 *
 * `answer` is their answer row (symbol or null per slot) and `crossed` the
 * cells they have crossed off in their notes, as "slot:sym" strings. Two
 * cases, in order:
 *   - something they placed is wrong: name the step that rules it out;
 *   - otherwise the first step of the solution they have not done yet.
 */
export function nextHint(ch, p, { answer = [], crossed = new Set() } = {}) {
  const clues = cluesOf(ch, p);
  const run = humanSolve(ch, clues);
  for (let s = 0; s < ch.n; s++) {
    const x = answer[s];
    if (x === null || x === undefined || x === p.secret[s]) continue;
    const step = run.steps.find((st) => st.out.some(([a, b]) => a === s && b === x));
    return { wrong: true, slot: s, sym: x, step: step || null };
  }
  const placed = (s, x) => answer[s] === x;
  const done = (step) => {
    if (step.place) return placed(step.place[0], step.place[1]);
    if (!step.out.length) return false;
    return step.out.every(([s, x]) => crossed.has(`${s}:${x}`) || (answer[s] !== null && answer[s] !== undefined && answer[s] !== x));
  };
  const step = run.steps.find((st) => !done(st));
  return step ? { wrong: false, step } : null;
}

/**
 * The steps worth telling after a solve, in the order they happened: all of
 * them for a short puzzle; for a long one the hardest ideas first, then every
 * placement, then the earliest steps, up to `max`.
 */
export function whySteps(steps, max = 5) {
  if (steps.length <= max) return steps.slice();
  const top = Math.max(...steps.map((s) => s.tier));
  const pick = new Set();
  steps.forEach((s, i) => { if (s.tier === top && pick.size < 2) pick.add(i); });
  steps.forEach((s, i) => { if (pick.size < max && (s.place || s.rule === 'R5m')) pick.add(i); });
  for (let i = 0; pick.size < max && i < steps.length; i++) pick.add(i);
  return [...pick].sort((a, b) => a - b).map((i) => steps[i]);
}

/* ------------------------------------------------------------------ */
/* Making puzzles                                                      */
/* ------------------------------------------------------------------ */

function randomCode(ch, rng) {
  const codes = allCodes(ch.n, ch.k, ch.repeats);
  return codes[randInt(rng, codes.length)];
}

/** Drop any clue the answer does not need, last ones first. */
export function minimise(ch, clues, secret) {
  let kept = clues.slice();
  for (let i = kept.length - 1; i >= 0; i--) {
    const without = kept.filter((_, j) => j !== i);
    const sol = solutions(ch, without, 2);
    if (sol.length === 1 && sameCode(sol[0], secret)) kept = without;
  }
  return kept;
}

/** A clue that says "all home" gives the answer away. */
const givesAway = (ch, f) => (Array.isArray(f) ? f.every((m) => m === 'h')
  : f.marks ? f.marks.every(Boolean) : f.h === ch.n);

/**
 * One Clue Safe puzzle, or null after `tries` attempts.
 * Returns { secret, clues: [guess, ...], tier, steps } (guesses only; the
 * feedback is always worked out from the secret).
 */
export function makeCluePuzzle(ch, rng, { tries = 300 } = {}) {
  const [minC, maxC] = ch.clues;
  const [lowT, highT] = ch.tiers;
  const codes = allCodes(ch.n, ch.k, ch.repeats);
  for (let attempt = 0; attempt < tries; attempt++) {
    const secret = randomCode(ch, rng);
    let pool = codes;
    const clues = [];
    while (pool.length > 1 && clues.length < maxC) {
      const left = maxC - clues.length;
      /* Aim to shrink the pool evenly over the clues still to come, so no one
         clue does all the work and none does nothing. */
      const target = Math.max(1, pool.length ** (1 - 1 / left));
      let best = null;
      for (let t = 0; t < 40; t++) {
        const g = codes[randInt(rng, codes.length)];
        if (sameCode(g, secret) || clues.some((c) => sameCode(c.g, g))) continue;
        const f = feedback(g, secret, ch.fb);
        if (givesAway(ch, f)) continue;
        const key = fbKey(f);
        const next = pool.filter((code) => fbKey(feedback(g, code, ch.fb)) === key);
        if (next.length === pool.length) continue;
        const score = Math.abs(Math.log(next.length) - Math.log(target));
        if (!best || score < best.score) best = { g, f, next, score };
      }
      if (!best) break;
      clues.push({ g: best.g, f: best.f });
      pool = best.next;
    }
    if (pool.length !== 1) continue;
    const kept = minimise(ch, clues, secret);
    if (kept.length < minC) continue;
    if (ch.missing && !hasMissing(ch, kept, secret)) continue;
    const run = humanSolve(ch, kept, { maxTier: highT });
    if (!run.solved || run.tier < lowT || run.tier > highT) continue;
    return { secret, clues: kept.map((c) => c.g), tier: run.tier, steps: run.steps.length };
  }
  return null;
}

/** Some animal in the code is never shown in any clue: the "missing" one. */
function hasMissing(ch, clues, secret) {
  const shown = new Set(clues.flatMap((c) => c.g));
  return secret.some((x) => !shown.has(x));
}

/**
 * Could it be? Clues, and one candidate code. Built from a Clue Safe puzzle
 * with its last clue taken away, so more than one code fits. Half the time
 * the candidate fits; otherwise it breaks exactly one clue.
 */
export function makeCouldPuzzle(ch, rng, { tries = 60 } = {}) {
  for (let attempt = 0; attempt < tries; attempt++) {
    const base = makeCluePuzzle(ch, rng);
    if (!base) continue;
    const guesses = base.clues.length > 2 ? base.clues.slice(0, -1) : base.clues;
    const clues = makeClues(ch, guesses, base.secret);
    const fitting = solutions(ch, clues);
    if (rng() < 0.5) {
      const cand = fitting[randInt(rng, fitting.length)];
      return { clues: guesses, secret: base.secret, cand, yes: true, broken: null };
    }
    const codes = allCodes(ch.n, ch.k, ch.repeats);
    const near = shuffled(rng, codes).find((code) => {
      const bad = clues.filter((c) => fbKey(feedback(c.g, code, ch.fb)) !== fbKey(c.f));
      return bad.length === 1 && closeTo(code, fitting);
    });
    if (!near) continue;
    const brokenAt = clues.findIndex((c) => fbKey(feedback(c.g, near, ch.fb)) !== fbKey(c.f));
    return { clues: guesses, secret: base.secret, cand: near, yes: false, broken: brokenAt };
  }
  return null;
}

/* A near miss is one swap or one change away from a code that fits, so the
   "no" is a real question and not an obvious stranger. */
function closeTo(code, fitting) {
  return fitting.some((f) => code.filter((x, i) => x !== f[i]).length <= 2);
}

/** A free crack: just a secret. The child guesses. */
export const makeFreePuzzle = (ch, rng) => ({ secret: randomCode(ch, rng).slice() });

/**
 * The puzzle at one place in a chapter, from its seed. Used by the bank
 * builder; Daily and Endless call it with their own seeds.
 */
export function makePuzzle(ch, mode, seedParts) {
  const rng = rngFor('code', ...seedParts);
  if (mode === 'free') return { mode, ...makeFreePuzzle(ch, rng) };
  if (mode === 'could') {
    const p = makeCouldPuzzle(ch, rng);
    return p && { mode, ...p };
  }
  const p = makeCluePuzzle(ch, rng);
  return p && { mode, ...p };
}

/** k animals for one puzzle, out of a roster of `roster`, from its seed. */
export function pickSymbols(rng, k, roster) {
  return shuffled(rng, Array.from({ length: roster }, (_, i) => i)).slice(0, k);
}

/* ------------------------------------------------------------------ */
/* Free crack helpers                                                  */
/* ------------------------------------------------------------------ */

/**
 * The first earlier clue a new guess ignores, or -1. A guess "ignores" a clue
 * when it could not be the code: the clue it would have produced differs.
 * Not a rule; a detective's note. A guess is never refused.
 */
export function ignoredClue(ch, clues, guess) {
  return clues.findIndex((c) => fbKey(feedback(c.g, guess, ch.fb)) !== fbKey(c.f));
}

/** Is the guess a legal code for this chapter (no repeats unless allowed)? */
export function legalGuess(ch, guess) {
  if (guess.length !== ch.n || guess.some((x) => x === null || x === undefined || x < 0 || x >= ch.k)) return false;
  return ch.repeats || new Set(guess).size === guess.length;
}

/** Every cell the clues alone say directly (rules 1-3), for Helper Owl's notes. */
export function directCrosses(ch, clues) {
  const st = freshState(ch);
  const seen = new Set();
  for (let guard = 0; guard < 200; guard++) {
    const step = ruleNotHere(ch, st, clues) || ruleWrongHome(ch, st, clues);
    if (!step) break;
    apply(ch, st, step);
    step.out.forEach(([s, x]) => seen.add(`${s}:${x}`));
  }
  return seen;
}

/* ------------------------------------------------------------------ */
/* Stars                                                               */
/* ------------------------------------------------------------------ */

/**
 * Stars for one solve. Never fewer than one for a solve; the best ever is
 * kept by logicprogress.js, so a later worse solve takes nothing away.
 *   clue   ★ solved · ★★ no hint · ★★★ no hint and right first time
 *   could  ★★★ right first time, ★ after a second look
 *   free   ★ cracked · ★★ no hint · ★★★ no hint and every guess fitted the clues
 */
export function starsFor(mode, { hints = 0, tries = 1, consistent = true } = {}) {
  if (mode === 'could') return tries <= 1 ? 3 : 1;
  if (hints > 0) return 1;
  if (mode === 'free') return consistent ? 3 : 2;
  return tries <= 1 ? 3 : 2;
}

export default {
  CHAPTERS, LEVELS, CHAPTER_SIZE, TEACH, chapter, modeAt,
  spotFeedback, aggFeedback, midFeedback, feedback, fbKey, allCodes, sameCode, fits, solutions,
  makeClues, cluesOf, humanSolve, nextHint, whySteps, minimise,
  makeCluePuzzle, makeCouldPuzzle, makeFreePuzzle, makePuzzle, pickSymbols,
  ignoredClue, legalGuess, directCrosses, starsFor, TIER
};
