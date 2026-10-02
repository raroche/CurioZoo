/**
 * rulelogic.js — Find the Rule: creatures, rules, and the puzzle maker.
 *
 * Creatures walk up to a gate. Some pass, some are stopped. The child tests
 * creatures of their own, then proves they know the secret rule. This is the
 * family of Zoombinis' Allergic Cliffs, Zendo and Bongard problems; the
 * research is docs/research/logic/research-truth-and-rule.md, Part 2.
 *
 * Pure: no DOM, no Math.random.
 *
 * A creature is an array, one value per attribute in ORDER:
 *   [ears, hat, pattern, buttons, size, item]
 * A puzzle only "turns on" a few attributes; the rest stay at a fixed value,
 * so a child is never asked to notice something that never changes.
 *
 * Two rules are the same rule if they let exactly the same creatures through
 * (compared as a bit string over every possible creature). That is how a
 * child's rule is judged: "cap or crown" is right when the rule is "no bow".
 */

import { randInt, rngFor, shuffled } from './logicrng.js';

export const ORDER = ['ears', 'hat', 'pattern', 'buttons', 'size', 'item'];
export const ATTRS = {
  ears: { all: ['bear', 'rabbit', 'owl', 'fox', 'cat', 'mouse', 'giraffe', 'frog'], fixed: 'cat', pick: 3 },
  hat: { all: ['none', 'cap', 'crown', 'bow'], fixed: 'none', pick: 3, keep: 'none' },
  pattern: { all: ['plain', 'stripes', 'dots', 'checks'], fixed: 'plain', pick: 3, keep: 'plain' },
  buttons: { all: [1, 2, 3], fixed: 0, pick: 3, ordinal: true },
  size: { all: ['small', 'big'], fixed: 'big', pick: 2 },
  item: { all: ['none', 'balloon', 'flower', 'fish'], fixed: 'none', pick: 3, keep: 'none' }
};
export const LEVELS = ['easy', 'medium', 'hard'];
const AT = Object.fromEntries(ORDER.map((a, i) => [a, i]));

/* ------------------------------------------------------------------ */
/* Chapters                                                            */
/* ------------------------------------------------------------------ */

/**
 * attrs: how many attributes are switched on. force: ones that must be.
 * shape: what the secret rule looks like. pair: creatures come in pairs.
 * prove: 'sort' (sort six new creatures) or 'build' (build the rule).
 */
export const CHAPTERS = {
  easy: [
    { id: 'e1', attrs: 3, shape: 'one', prove: 'sort' },
    { id: 'e2', attrs: 3, shape: 'either', prove: 'sort' },
    { id: 'e3', attrs: 3, shape: 'not', prove: 'sort' },
    { id: 'e4', attrs: 3, force: ['buttons'], shape: 'count', prove: 'sort' },
    { id: 'e5', attrs: 3, shape: 'easymix', prove: 'sort' }
  ],
  medium: [
    { id: 'm1', attrs: 4, shape: 'and', prove: 'build' },
    { id: 'm2', attrs: 4, shape: 'or', prove: 'build' },
    { id: 'm3', attrs: 4, shape: 'andnot', prove: 'build' },
    { id: 'm4', attrs: 4, shape: 'trap', prove: 'build' },
    { id: 'm5', attrs: 4, shape: 'midmix', prove: 'build' }
  ],
  hard: [
    { id: 'h1', attrs: 5, shape: 'three', prove: 'build' },
    { id: 'h2', attrs: 5, shape: 'xor', prove: 'build' },
    { id: 'h3', attrs: 3, shape: 'pair', pair: true, prove: 'build' },
    { id: 'h4', attrs: 4, force: ['buttons'], shape: 'countmix', prove: 'build' },
    { id: 'h5', attrs: 5, shape: 'hardmix', prove: 'build' }
  ]
};

export const CHAPTER_SIZE = 40;
export const TEACH = 2;
export const PROOF_SIZE = 6;
export const LINE_SIZE = 8;

export function chapter(id) {
  for (const level of LEVELS) {
    const ch = CHAPTERS[level].find((c) => c.id === id);
    if (ch) return { ...ch, level };
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Creatures and their universe                                        */
/* ------------------------------------------------------------------ */

/** The value lists in play: active attributes get theirs, others one value. */
export function valuesOf(setup) {
  return ORDER.map((a) => (setup[a] ? setup[a] : [ATTRS[a].fixed]));
}

const uniCache = new Map();

/** Every creature this puzzle can have (or every pair, for a pair puzzle). */
export function universe(setup, pair = false) {
  const key = JSON.stringify([setup, pair]);
  if (uniCache.has(key)) return uniCache.get(key);
  let out = [[]];
  for (const vals of valuesOf(setup)) out = out.flatMap((c) => vals.map((v) => [...c, v]));
  if (pair) out = out.flatMap((a) => out.map((b) => [a, b]));
  uniCache.set(key, out);
  return out;
}

export const sameCreature = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/* ------------------------------------------------------------------ */
/* Rules                                                               */
/* ------------------------------------------------------------------ */

/*
 *   { op: 'has', a, v }                 the creature's `a` is v
 *   { op: 'ge' | 'le', a: 'buttons', n } at least / at most n buttons
 *   { op: 'not', x }
 *   { op: 'and' | 'or' | 'xor', args: [...] }   xor: one or the other, not both
 * Pairs (h3):
 *   { op: 'same' | 'diff', a }          the two have the same / different `a`
 *   { op: 'more' | 'fewer', a: 'buttons' }   the first has more / fewer
 *   { op: 'bigger' | 'smaller' }        the first is bigger / smaller
 */
export function evaluate(r, c) {
  switch (r.op) {
    case 'has': return c[AT[r.a]] === r.v;
    case 'ge': return c[AT[r.a]] >= r.n;
    case 'le': return c[AT[r.a]] <= r.n;
    case 'not': return !evaluate(r.x, c);
    case 'and': return r.args.every((x) => evaluate(x, c));
    case 'or': return r.args.some((x) => evaluate(x, c));
    case 'xor': return r.args.filter((x) => evaluate(x, c)).length === 1;
    case 'same': return c[0][AT[r.a]] === c[1][AT[r.a]];
    case 'diff': return c[0][AT[r.a]] !== c[1][AT[r.a]];
    case 'more': return c[0][AT[r.a]] > c[1][AT[r.a]];
    case 'fewer': return c[0][AT[r.a]] < c[1][AT[r.a]];
    case 'bigger': return c[0][AT.size] === 'big' && c[1][AT.size] === 'small';
    case 'smaller': return c[0][AT.size] === 'small' && c[1][AT.size] === 'big';
    default: throw new Error(`no rule ${r.op}`);
  }
}

/** A rule's fingerprint: which creatures of the universe pass, as 0/1. */
export const extKey = (r, U) => U.map((c) => (evaluate(r, c) ? '1' : '0')).join('');

/** How many conditions a rule is made of. */
export const sizeOf = (r) => (r.args ? r.args.reduce((s, x) => s + sizeOf(x), 0) : r.op === 'not' ? sizeOf(r.x) : 1);

const negate = (r) => (r.op === 'not' ? r.x : { op: 'not', x: r });

/** The single conditions a rule can be built from in this puzzle. */
export function literals(setup, pair = false) {
  const out = [];
  const active = ORDER.filter((a) => setup[a]);
  if (pair) {
    for (const a of active) out.push({ op: 'same', a }, { op: 'diff', a });
    if (setup.buttons) out.push({ op: 'more', a: 'buttons' }, { op: 'fewer', a: 'buttons' });
    if (setup.size) out.push({ op: 'bigger' }, { op: 'smaller' });
    return out;
  }
  for (const a of active) {
    for (const v of setup[a]) {
      out.push({ op: 'has', a, v });
      if (setup[a].length > 2) out.push({ op: 'not', x: { op: 'has', a, v } });
    }
  }
  if (setup.buttons) out.push({ op: 'ge', a: 'buttons', n: 2 }, { op: 'le', a: 'buttons', n: 2 });
  return out;
}

const attrOf = (r) => (r.op === 'not' ? attrOf(r.x) : r.a || 'size');

/**
 * Every different rule of one or two conditions, keyed by fingerprint, each
 * with the first (shortest) way of writing it. Rules that let everything
 * through, or nothing, are left out. This is the "ideas that still fit" a
 * hint reasons about.
 */
export function hypotheses(setup, pair = false) {
  const U = universe(setup, pair);
  const map = new Map();
  const add = (r) => {
    const k = extKey(r, U);
    if (!k.includes('1') || !k.includes('0')) return;
    if (!map.has(k)) map.set(k, { rule: r, size: sizeOf(r) });
  };
  const lits = literals(setup, pair);
  lits.forEach(add);
  for (let i = 0; i < lits.length; i++) {
    for (let j = i + 1; j < lits.length; j++) {
      const same = !pair && attrOf(lits[i]) === attrOf(lits[j]);
      for (const op of same ? ['or'] : ['and', 'or', 'xor']) add({ op, args: [lits[i], lits[j]] });
    }
  }
  return map;
}

const fitsEvidence = (k, U, evidence, keyOf) => evidence.every(([c, pass]) => (k[keyOf(c)] === '1') === pass);

/** Index of each creature in the universe, for reading fingerprints. */
export function indexer(U) {
  const map = new Map(U.map((c, i) => [JSON.stringify(c), i]));
  return (c) => map.get(JSON.stringify(c));
}

/** The ideas (fingerprints) that still fit everything seen so far. */
export function alive(H, U, evidence, extra = []) {
  const at = indexer(U);
  return [...H.keys(), ...extra].filter((k, i, all) => all.indexOf(k) === i && fitsEvidence(k, U, evidence, at));
}

/* ------------------------------------------------------------------ */
/* Making puzzles                                                      */
/* ------------------------------------------------------------------ */

const pick = (rng, list) => list[randInt(rng, list.length)];

function makeSetup(ch, rng) {
  const families = shuffled(rng, ORDER);
  const chosen = new Set(ch.force || []);
  for (const a of families) if (chosen.size < ch.attrs) chosen.add(a);
  const setup = {};
  for (const a of ORDER) {
    if (!chosen.has(a)) continue;
    const def = ATTRS[a];
    let vals = def.keep !== undefined ? [def.keep, ...shuffled(rng, def.all.filter((v) => v !== def.keep))] : shuffled(rng, def.all);
    vals = vals.slice(0, def.pick);
    /* Keep each list in its natural order, so pickers read the same way. */
    setup[a] = def.all.filter((v) => vals.includes(v));
  }
  return setup;
}

function posLiteral(setup, rng, not = []) {
  const attrs = ORDER.filter((a) => setup[a] && !not.includes(a));
  const a = pick(rng, attrs);
  return { op: 'has', a, v: pick(rng, setup[a]) };
}

/** A secret rule of the chapter's shape, or null. */
function makeRule(ch, setup, rng) {
  const lit = (not = []) => posLiteral(setup, rng, not);
  const many = ORDER.filter((a) => setup[a] && setup[a].length > 2);
  switch (ch.shape) {
    case 'one': return lit();
    case 'either': {
      if (!many.length) return null;
      const a = pick(rng, many);
      const [v1, v2] = shuffled(rng, setup[a]);
      return { op: 'or', args: [{ op: 'has', a, v: v1 }, { op: 'has', a, v: v2 }] };
    }
    case 'not': {
      if (!many.length) return null;
      const a = pick(rng, many);
      return { op: 'not', x: { op: 'has', a, v: pick(rng, setup[a]) } };
    }
    case 'count': return rng() < 0.6 ? { op: pick(rng, ['ge', 'le']), a: 'buttons', n: 2 } : { op: 'has', a: 'buttons', v: pick(rng, [1, 2, 3]) };
    case 'easymix': return makeRule({ shape: pick(rng, ['one', 'either', 'not', ...(setup.buttons ? ['count'] : [])]) }, setup, rng);
    case 'and': case 'or': case 'xor': {
      const x = lit();
      return { op: ch.shape, args: [x, lit([x.a])] };
    }
    case 'andnot': {
      const x = lit();
      return { op: 'and', args: [x, negate(lit([x.a]))] };
    }
    case 'trap': return lit();
    case 'midmix': return makeRule({ shape: pick(rng, ['and', 'or', 'andnot', 'not', 'either']) }, setup, rng);
    case 'three': {
      const x = lit();
      const y = lit([x.a]);
      const z = lit([x.a, y.a]);
      const parts = [x, y, z].map((p) => (rng() < 0.3 ? negate(p) : p));
      return { op: rng() < 0.5 ? 'and' : 'or', args: parts };
    }
    case 'countmix': {
      const c = { op: pick(rng, ['ge', 'le']), a: 'buttons', n: 2 };
      const y = lit(['buttons']);
      return { op: pick(rng, ['and', 'or']), args: [c, rng() < 0.3 ? negate(y) : y] };
    }
    case 'hardmix': return makeRule({ shape: pick(rng, ['three', 'xor', 'and', 'or', 'andnot']) }, setup, rng);
    case 'pair': {
      const lits = literals(setup, true);
      const x = pick(rng, lits);
      if (rng() < 0.4) return x;
      const y = pick(rng, lits.filter((l) => l.a !== x.a || l.op !== x.op));
      return { op: pick(rng, ['and', 'or']), args: [x, y] };
    }
    default: return null;
  }
}

/** How many tests, choosing well, to leave only the right idea standing. */
function teachingTests(U, at, ideas, target, candidates) {
  let live = ideas.slice();
  let n = 0;
  const pool = candidates.slice();
  while (live.length > 1 && n < 12) {
    let best = null;
    for (const c of pool) {
      const i = at(c);
      const yes = live.filter((k) => k[i] === '1').length;
      const score = Math.min(yes, live.length - yes);
      if (!best || score > best.score) best = { c, i, score };
    }
    if (!best || best.score === 0) break;
    const truth = target[best.i];
    live = live.filter((k) => k[best.i] === truth);
    pool.splice(pool.indexOf(best.c), 1);
    n += 1;
  }
  return n;
}

/**
 * One puzzle, or null after `tries`.
 * Returns { setup, rule, evidence: [[creature, passes], ...], line, proof, par, size }.
 */
export function makePuzzle(chDef, rng, { tries = 200 } = {}) {
  const ch = chDef.level ? chDef : chapter(chDef.id);
  for (let attempt = 0; attempt < tries; attempt++) {
    const setup = makeSetup(ch, rng);
    const rule = makeRule(ch, setup, rng);
    if (!rule) continue;
    const U = universe(setup, ch.pair);
    const at = indexer(U);
    const target = extKey(rule, U);
    const passRate = [...target].filter((x) => x === '1').length / U.length;
    /* Not a gate that stops almost everyone, or lets almost everyone by.
       "Crown and stripes" passes one in nine on its own, which is fine. */
    if (passRate < 0.1 || passRate > 0.9) continue;
    const H = hypotheses(setup, ch.pair);
    const known = H.get(target);
    const size = sizeOf(rule);
    /* Not simpler than it looks: a two-part rule that one condition says just
       as well is a one-part rule in disguise. Three-part rules must not be
       sayable with two. */
    if (size >= 3 && known) continue;
    if (size === 2 && known && known.size < 2 && !['either', 'easymix', 'midmix'].includes(ch.shape)) continue;
    const ideas = [...new Set([...H.keys(), target])];

    /* The opening evidence: chosen the way a good teacher would, but stopped
       while several ideas still fit, so the child has testing to do. */
    let trap = null;
    if (ch.shape === 'trap') {
      trap = posLiteral(setup, rng, [rule.a]);
    }
    const evidence = [];
    let live = ideas.slice();
    const used = new Set();
    for (let step = 0; step < 8; step++) {
      const wantPass = step % 2 === 0;
      const passes = evidence.filter(([, p]) => p).length;
      const stops = evidence.length - passes;
      if (passes >= 2 && stops >= 2 && live.length <= 6) break;
      let best = null;
      for (const c of shuffled(rng, U).slice(0, 220)) {
        const i = at(c);
        if (used.has(i) || (target[i] === '1') !== wantPass) continue;
        /* The trap: every passer shown shares a second thing that does not
           matter, and no stopped one has it, so "it's the trap" still fits. */
        if (trap && evaluate(trap, c) !== wantPass) continue;
        const left = live.filter((k) => k[i] === target[i]).length;
        if (left < 3) continue;
        const score = live.length - left;
        if (!best || score > best.score) best = { c, i, score, left };
      }
      if (!best) break;
      evidence.push([best.c, wantPass]);
      used.add(best.i);
      live = live.filter((k) => k[best.i] === target[best.i]);
    }
    const passes = evidence.filter(([, p]) => p).length;
    if (passes < 2 || evidence.length - passes < 2 || live.length < 2 || live.length > 8) continue;
    if (trap) {
      const trapKey = extKey(trap, U);
      if (!live.includes(trapKey)) continue;
    }

    /* Easy: a waiting line to test from, with a test for every two ideas. */
    let line = null;
    if (ch.prove === 'sort') {
      line = [];
      const free = shuffled(rng, U.filter((c) => !used.has(at(c))));
      const pairs = [];
      for (let i = 0; i < live.length; i++) for (let j = i + 1; j < live.length; j++) pairs.push([live[i], live[j]]);
      let open = pairs.slice();
      while (line.length < LINE_SIZE && free.length) {
        let best = null;
        for (const c of free) {
          const i = at(c);
          const n = open.filter(([x, y]) => x[i] !== y[i]).length;
          if (!best || n > best.n) best = { c, i, n };
        }
        if (!best) break;
        line.push(best.c);
        free.splice(free.indexOf(best.c), 1);
        open = open.filter(([x, y]) => x[best.i] === y[best.i]);
      }
      if (open.length) continue;
      line = shuffled(rng, line);
    }

    const exclude = new Set([...used, ...(line || []).map(at)]);
    const proof = ch.prove === 'sort' ? makeProof(U, target, live, exclude, rng) : null;
    if (ch.prove === 'sort' && !proof) continue;
    const par = teachingTests(U, at, live, target, line || U.filter((c) => !used.has(at(c)))) + 1;
    return { setup, rule, evidence, line, proof, par, size };
  }
  return null;
}

/**
 * Six creatures to sort, so that every idea except the right one sorts at
 * least one of them wrong: a nearly-right rule cannot pass by luck.
 */
export function makeProof(U, target, ideas, exclude, rng) {
  const at = indexer(U);
  const wrong = ideas.filter((k) => k !== target);
  const free = shuffled(rng, U.filter((c) => !exclude.has(at(c))));
  const proof = [];
  let open = wrong.slice();
  while (proof.length < PROOF_SIZE && free.length) {
    let best = null;
    for (const c of free) {
      const i = at(c);
      const n = open.filter((k) => k[i] !== target[i]).length;
      if (!best || n > best.n) best = { c, i, n };
    }
    if (!best || (best.n === 0 && open.length)) break;
    proof.push(best.c);
    free.splice(free.indexOf(best.c), 1);
    open = open.filter((k) => k[best.i] === target[best.i]);
    if (!open.length) break;
  }
  if (open.length) return null;
  /* Fill to six, with at least two of each answer. */
  const count = (want) => proof.filter((c) => (target[at(c)] === '1') === want).length;
  for (const c of free) {
    if (proof.length >= PROOF_SIZE) break;
    const want = count(true) < 2 ? true : count(false) < 2 ? false : null;
    if (want !== null && (target[at(c)] === '1') !== want) continue;
    proof.push(c);
  }
  if (proof.length < PROOF_SIZE || count(true) < 2 || count(false) < 2) return null;
  return shuffled(rng, proof);
}

/** The puzzle at a place in a chapter, from its seed. */
export function makeAt(chId, ...seed) {
  return makePuzzle(chapter(chId), rngFor('rule', chId, ...seed));
}

/* ------------------------------------------------------------------ */
/* Playing                                                             */
/* ------------------------------------------------------------------ */

/**
 * The best next test among `candidates`: the one that splits the ideas still
 * standing most evenly. Returns { c, yes, no } or null when nothing splits.
 */
export function bestTest(U, ideas, candidates) {
  const at = indexer(U);
  let best = null;
  for (const c of candidates) {
    const i = at(c);
    const yes = ideas.filter((k) => k[i] === '1').length;
    const score = Math.min(yes, ideas.length - yes);
    if (score > 0 && (!best || score > best.score)) best = { c, score, yes, no: ideas.length - yes };
  }
  return best;
}

/**
 * A creature where the child's rule and the real one disagree, preferring
 * one not already seen. This is Zendo's answer to a wrong guess: no penalty,
 * just one new piece of evidence.
 */
export function counterexample(U, rule, guess, seen = []) {
  const at = indexer(U);
  const seenSet = new Set(seen.map(at));
  const t = extKey(rule, U);
  const g = extKey(guess, U);
  const diffs = U.filter((c, i) => t[i] !== g[i]);
  return diffs.find((c) => !seenSet.has(at(c))) || diffs[0] || null;
}

/** Is the child's rule the same rule (lets exactly the same creatures through)? */
export const sameRule = (U, a, b) => extKey(a, U) === extKey(b, U);

/**
 * Stars:  ★ solved · ★★ also within par tests · ★★★ also no hint and the
 * first proof right.
 */
export function starsFor({ hints = 0, tries = 1, tests = 0, par = 1 } = {}) {
  let n = 1;
  if (tests <= par) n += 1;
  if (hints === 0 && tries <= 1) n += 1;
  return n;
}

export default {
  ORDER, ATTRS, LEVELS, CHAPTERS, CHAPTER_SIZE, TEACH, PROOF_SIZE, LINE_SIZE, chapter, valuesOf,
  universe, sameCreature, evaluate, extKey, sizeOf, literals, hypotheses, indexer, alive, makePuzzle,
  makeProof, makeAt, bestTest, counterexample, sameRule, starsFor
};
