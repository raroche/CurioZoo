/**
 * truthlogic.js — Truth Island: the statements, the solver and the puzzle maker.
 *
 * On the island live Sun animals, who always tell the truth, and Moon
 * animals, who always say the opposite. Each animal says something; the child
 * works out who is who. Hard adds the Cloud animal, who may say anything.
 * This is the knights-and-knaves genre (popularised by Raymond Smullyan),
 * with our own words; the research is docs/research/logic/research-truth-and-rule.md.
 *
 * Pure: no DOM, no Math.random. The build tool, the checker, the tests and
 * the page all run this file.
 *
 * A puzzle:
 *   { cast: ['owl', 'fox'], scene, hidden, badge, says: [[speaker, statement], ...],
 *     sol: ['moon', 'sun'] }
 *
 * A statement is a small tree (never prose; truthtext.js says it in words):
 *   { op: 'fact', f: { t: 'count', obj, n } | { t: 'none', obj } | { t: 'more', a, b }
 *                     | { t: 'has', who, item } }        checked against the picture
 *   { op: 'is', who, kind }                             who may be the speaker ("I")
 *   { op: 'same', a, b } | { op: 'diff', a, b }
 *   { op: 'count', cmp: 'eq' | 'ge', kind, n }          "exactly one of us is a Moon"
 *   { op: 'and' | 'or' | 'if', args: [S, S] }           Hard only; "or" is always "or both"
 */

import { randInt, rngFor, shuffled } from './logicrng.js';

export const CAST = ['bear', 'rabbit', 'owl', 'fox', 'cat', 'mouse', 'giraffe', 'frog'];
export const OBJECTS = ['apple', 'banana', 'fish', 'carrot', 'egg', 'star', 'shell', 'flower'];
export const ITEMS = ['balloon', 'kite', 'teddy', 'umbrella', 'gift', 'icecream'];
export const LEVELS = ['easy', 'medium', 'hard'];

/* ------------------------------------------------------------------ */
/* Chapters                                                            */
/* ------------------------------------------------------------------ */

const BASIC = ['is', 'same', 'diff', 'count'];

/**
 * n: how many animals. plan (Easy): what each one says, in order.
 * ops (Medium, Hard): the statements to draw from; need: at least one of these
 * must appear. depth: how many "suppose..." steps a person needs, low and high.
 */
export const CHAPTERS = {
  easy: [
    { id: 'e1', n: [1, 1], plan: ['fact'], depth: [0, 0] },
    { id: 'e2', n: [2, 3], plan: ['fact', 'fact', 'fact'], depth: [0, 0] },
    { id: 'e3', n: [2, 2], plan: ['fact', 'acc'], depth: [0, 0] },
    { id: 'e4', n: [3, 3], plan: ['fact', 'acc', 'acc'], depth: [0, 0] },
    { id: 'e5', n: [2, 3], plan: ['badge', 'claim', 'claim'], hidden: true, depth: [0, 0] }
  ],
  medium: [
    { id: 'm1', n: [2, 3], ops: ['is', 'count'], need: ['self'], depth: [0, 0] },
    { id: 'm2', n: [2, 3], ops: ['is', 'same', 'diff'], need: ['same', 'diff'], depth: [0, 0] },
    { id: 'm3', n: [3, 3], ops: ['is', 'count'], need: ['count'], depth: [0, 0] },
    { id: 'm4', n: [3, 3], ops: BASIC, depth: [1, 1] },
    { id: 'm5', n: [3, 3], ops: BASIC, depth: [0, 1] }
  ],
  hard: [
    { id: 'h1', n: [4, 4], ops: BASIC, depth: [1, 1] },
    { id: 'h2', n: [3, 3], ops: [...BASIC, 'and', 'or', 'if'], need: ['and', 'or', 'if'], depth: [0, 1] },
    { id: 'h3', n: [3, 3], ops: BASIC, cloud: true, depth: [0, 1] },
    { id: 'h4', n: [3, 3], ops: BASIC, two: true, depth: [0, 1] },
    /* Two "suppose" steps in one puzzle. A depth-2 suppose is too rare to
       fill a chapter (about 1 in 200 four-animal puzzles), so this asks for two
       separate ones instead, which is just as long a chain of thought. */
    { id: 'h5', n: [4, 4], ops: [...BASIC, 'and', 'or'], depth: [1, 2], supposes: 2 }
  ]
};

export const CHAPTER_SIZE = 40;
export const TEACH = 2;

export function chapter(id) {
  for (const level of LEVELS) {
    const ch = CHAPTERS[level].find((c) => c.id === id);
    if (ch) return { ...ch, level };
  }
  return null;
}

export const kindsOf = (p) => (p.cloud ? ['sun', 'moon', 'cloud'] : ['sun', 'moon']);

/* ------------------------------------------------------------------ */
/* Truth                                                               */
/* ------------------------------------------------------------------ */

function evalFact(f, scene) {
  const c = (o) => (scene.c && scene.c[o]) || 0;
  switch (f.t) {
    case 'count': return c(f.obj) === f.n;
    case 'none': return c(f.obj) === 0;
    case 'more': return c(f.a) > c(f.b);
    case 'has': return (scene.h || [])[f.who] === f.item;
    default: throw new Error(`no fact ${f.t}`);
  }
}

/** Is statement `s` true in world `w` (one kind per animal)? */
export function evaluate(s, w, scene = {}) {
  switch (s.op) {
    case 'fact': return evalFact(s.f, scene);
    case 'is': return w[s.who] === s.kind;
    case 'same': return w[s.a] === w[s.b];
    case 'diff': return w[s.a] !== w[s.b];
    case 'count': {
      const k = w.filter((x) => x === s.kind).length;
      return s.cmp === 'eq' ? k === s.n : k >= s.n;
    }
    case 'and': return evaluate(s.args[0], w, scene) && evaluate(s.args[1], w, scene);
    case 'or': return evaluate(s.args[0], w, scene) || evaluate(s.args[1], w, scene);
    case 'if': return !evaluate(s.args[0], w, scene) || evaluate(s.args[1], w, scene);
    default: throw new Error(`no statement ${s.op}`);
  }
}

/** A Sun's sentence is true, a Moon's is false, a Cloud may say anything. */
export function allows(kind, truth) {
  if (kind === 'sun') return truth;
  if (kind === 'moon') return !truth;
  return true;
}

const fitsOne = (p, [speaker, s], w) => allows(w[speaker], evaluate(s, w, p.scene));

/** Every world the rules allow before anyone speaks. */
export function allWorlds(p) {
  const n = p.cast.length;
  const kinds = kindsOf(p);
  let out = [[]];
  for (let i = 0; i < n; i++) out = out.flatMap((w) => kinds.map((k) => [...w, k]));
  /* With the Cloud animal there is exactly one of each kind. */
  if (p.cloud) out = out.filter((w) => kinds.every((k) => w.filter((x) => x === k).length === 1));
  if (p.badge !== undefined && p.badge !== null) out = out.filter((w) => w[p.badge] === 'sun');
  return out;
}

/** The worlds that fit every sentence. A good puzzle has exactly one. */
export function solutions(p, says = p.says) {
  return allWorlds(p).filter((w) => says.every((x) => fitsOne(p, x, w)));
}

/** The first sentence a world breaks, or -1. */
export function firstBroken(p, w) {
  return p.says.findIndex((x) => !fitsOne(p, x, w));
}

/** Does a world keep the island's own rules (one of each kind, the badge)? */
export const legalWorld = (p, w) => allWorlds(p).some((x) => x.every((k, i) => k === w[i]));

/** Which animals a statement mentions. */
export function mentions(s) {
  switch (s.op) {
    case 'fact': return s.f.t === 'has' ? [s.f.who] : [];
    case 'is': return [s.who];
    case 'same': case 'diff': return [s.a, s.b];
    case 'count': return [];
    default: return s.args.flatMap(mentions);
  }
}

const hasOp = (s, op) => s.op === op || (s.args || []).some((a) => hasOp(a, op));

/* ------------------------------------------------------------------ */
/* The solver                                                          */
/* ------------------------------------------------------------------ */

/*
 * The state is a domain per animal: the kinds it could still be. A step
 * narrows one domain. The kinds of step, cheapest first:
 *
 *   fact     a picture sentence: the picture says it is true or false
 *   check    every animal it mentions is known, so the sentence is true or
 *            false, so the speaker's kind follows
 *   known    the speaker's kind is known, so the sentence is true (or false),
 *            and that says what another animal is
 *   self     the sentence alone decides the speaker ("we are both Moons")
 *   both     whatever the speaker is, the sentence forces another animal
 *   left     (Cloud) each kind is used once, so the last one is decided
 *   suppose  put a pencil token on, follow it, and a sentence breaks
 *            (depth 1; depth 2 when the following needs a suppose too)
 */

const fits = (w, dom) => w.every((k, i) => dom[i].includes(k));
const known = (dom, i) => dom[i].length === 1;

function stepsFrom(p, worlds, dom) {
  const n = dom.length;
  /* The island's own rule, before anyone's words: one of each kind. */
  if (p.cloud) {
    const ws = worlds.filter((w) => fits(w, dom));
    for (let x = 0; x < n; x++) {
      const vals = [...new Set(ws.map((w) => w[x]))];
      if (vals.length && vals.length < dom[x].length) return { kind: 'left', who: x, keep: vals };
    }
  }
  for (let j = 0; j < p.says.length; j++) {
    const [speaker, s] = p.says[j];
    const ws = worlds.filter((w) => fits(w, dom) && fitsOne(p, p.says[j], w));
    if (!ws.length) return { contra: j };
    for (let x = 0; x < n; x++) {
      const vals = [...new Set(ws.map((w) => w[x]))];
      if (vals.length >= dom[x].length) continue;
      const step = { stmt: j, who: x, keep: vals };
      const truths = new Set(worlds.filter((w) => fits(w, dom)).map((w) => evaluate(s, w, p.scene)));
      if (x === speaker) {
        if (s.op === 'fact') step.kind = 'fact';
        else if (truths.size === 1) step.kind = 'check';
        else step.kind = 'self';
        step.truth = truths.size === 1 ? [...truths][0] : undefined;
      } else if (known(dom, speaker)) {
        step.kind = 'known';
        step.truth = dom[speaker][0] === 'sun';
      } else {
        step.kind = 'both';
      }
      return step;
    }
  }
  return null;
}

const narrow = (dom, step) => dom.map((d, i) => (i === step.who ? d.filter((k) => step.keep.includes(k)) : d));

/** Follow the cheap steps (and supposes up to `depth`) until stuck or broken. */
function settle(p, worlds, dom, depth) {
  let cur = dom;
  for (let guard = 0; guard < 60; guard++) {
    if (cur.some((d) => !d.length)) return { broken: -1 };
    if (cur.every((d) => d.length === 1)) {
      const w = cur.map((d) => d[0]);
      const bad = p.says.findIndex((x) => !fitsOne(p, x, w));
      if (bad >= 0 || (p.cloud && !worlds.some((x) => x.every((k, i) => k === w[i])))) return { broken: bad };
      return { dom: cur };
    }
    let step = stepsFrom(p, worlds, cur);
    if (step && step.contra !== undefined) return { broken: step.contra };
    if (!step && depth > 0) step = suppose(p, worlds, cur, depth);
    if (!step) return { dom: cur };
    cur = narrow(cur, step);
  }
  return { dom: cur };
}

function suppose(p, worlds, dom, depth) {
  for (let d = 1; d <= depth; d++) {
    for (let x = 0; x < dom.length; x++) {
      if (dom[x].length < 2) continue;
      for (const v of dom[x]) {
        const trial = dom.map((k, i) => (i === x ? [v] : k));
        const r = settle(p, worlds, trial, d - 1);
        if (r.broken !== undefined) {
          return { kind: 'suppose', depth: d, who: x, tried: v, clash: r.broken, keep: dom[x].filter((k) => k !== v) };
        }
      }
    }
  }
  return null;
}

/**
 * Solve like a person. Returns { solved, depth, steps, sol }.
 * `from` is a starting domain (a hint starts from the child's tokens).
 */
export function humanSolve(p, { maxDepth = 2, from = null } = {}) {
  const worlds = allWorlds(p);
  const kinds = kindsOf(p);
  let dom = from ? from.map((d) => d.slice()) : p.cast.map((_, i) => (i === p.badge ? ['sun'] : kinds.slice()));
  const steps = [];
  let depth = 0;
  for (let guard = 0; guard < 60 && !dom.every((d) => d.length === 1); guard++) {
    let step = stepsFrom(p, worlds, dom);
    if (step && step.contra !== undefined) break;
    if (!step && maxDepth > 0) step = suppose(p, worlds, dom, maxDepth);
    if (!step) break;
    depth = Math.max(depth, step.depth || 0);
    steps.push(step);
    dom = narrow(dom, step);
  }
  const done = dom.every((d) => d.length === 1);
  return { solved: done, depth, steps, sol: done ? dom.map((d) => d[0]) : null };
}

/**
 * The next hint, given the child's tokens (a kind or null per animal) and
 * what earlier hints already ruled out (`ruled`: kinds per animal, or null).
 * A wrong token is pointed out first; then the next step from where the
 * child is now, so a hint always moves forward.
 */
export function nextHint(p, tokens, ruled = null) {
  const full = humanSolve(p);
  for (let i = 0; i < p.cast.length; i++) {
    if (tokens[i] && tokens[i] !== p.sol[i]) {
      const step = full.steps.find((s) => s.who === i && !s.keep.includes(tokens[i]));
      return { wrong: true, who: i, kind: tokens[i], step: step || null };
    }
  }
  const kinds = kindsOf(p);
  const from = p.cast.map((_, i) => {
    if (tokens[i]) return [tokens[i]];
    if (i === p.badge) return ['sun'];
    return ruled && ruled[i] ? ruled[i].slice() : kinds.slice();
  });
  const run = humanSolve(p, { from });
  if (run.steps.length) return { wrong: false, step: run.steps[0] };
  /* Everything is worked out but not every token is placed: point at one. */
  const i = tokens.findIndex((k, j) => !k && j !== p.badge);
  return i >= 0 ? { wrong: false, step: { kind: 'place', who: i, keep: [p.sol[i]] } } : null;
}

/** The steps worth telling after a solve: all of a short one, else the key ones. */
export function whySteps(steps, max = 5) {
  if (steps.length <= max) return steps.slice();
  const keep = new Set();
  steps.forEach((s, i) => { if (s.kind === 'suppose' && keep.size < 2) keep.add(i); });
  for (let i = 0; keep.size < max && i < steps.length; i++) keep.add(i);
  return [...keep].sort((a, b) => a - b).map((i) => steps[i]);
}

/* ------------------------------------------------------------------ */
/* Making puzzles                                                      */
/* ------------------------------------------------------------------ */

const pick = (rng, list) => list[randInt(rng, list.length)];

function makeScene(rng, n, hidden) {
  const objs = shuffled(rng, OBJECTS).slice(0, 2 + randInt(rng, 2));
  const c = {};
  for (const o of objs) c[o] = 1 + randInt(rng, 5);
  const items = shuffled(rng, ITEMS);
  const h = hidden ? [] : Array.from({ length: n }, (_, i) => (rng() < 0.6 ? items[i] : null));
  return { c, h };
}

/** A picture sentence with the truth value we want, or null. */
function makeFact(rng, scene, speaker, n, want, { onlyCount = false } = {}) {
  const present = Object.keys(scene.c);
  const absent = OBJECTS.filter((o) => !scene.c[o]);
  const holders = (scene.h || []).map((x, i) => (x ? i : -1)).filter((i) => i >= 0);
  const kinds = onlyCount ? ['count', 'count', 'none'] : ['count', 'count', 'none', 'more', 'has', 'has'];
  for (let t = 0; t < 30; t++) {
    const k = pick(rng, kinds);
    let f = null;
    if (k === 'count') {
      const obj = pick(rng, present);
      if (want) f = { t: 'count', obj, n: scene.c[obj] };
      else {
        const nn = scene.c[obj] + (rng() < 0.5 ? 1 : -1);
        if (nn >= 1 && nn <= 5) f = { t: 'count', obj, n: nn };
      }
    } else if (k === 'none') {
      f = want ? { t: 'none', obj: pick(rng, absent) } : { t: 'none', obj: pick(rng, present) };
    } else if (k === 'more' && present.length >= 2) {
      const [a, b] = shuffled(rng, present);
      if (scene.c[a] !== scene.c[b]) f = (scene.c[a] > scene.c[b]) === want ? { t: 'more', a, b } : { t: 'more', a: b, b: a };
    } else if (k === 'has' && holders.length) {
      const who = rng() < 0.5 ? speaker : pick(rng, holders);
      const held = scene.h[who];
      if (want && held) f = { t: 'has', who, item: held };
      if (!want) {
        const other = pick(rng, ITEMS.filter((x) => x !== held));
        f = { t: 'has', who, item: other };
      }
    }
    if (f && evalFact(f, scene) === want) return { op: 'fact', f };
  }
  return null;
}

/** One statement for Medium and Hard, from the chapter's list. */
function makeStatement(rng, ops, n, speaker, kinds) {
  const op = pick(rng, ops);
  const someone = () => (rng() < 0.45 ? speaker : randInt(rng, n));
  const pair = () => {
    const a = rng() < 0.6 ? speaker : randInt(rng, n);
    let b = randInt(rng, n);
    while (b === a) b = randInt(rng, n);
    return [a, b];
  };
  const plainKinds = kinds.filter((k) => k !== 'cloud');
  switch (op) {
    case 'is': return { op, who: someone(), kind: pick(rng, kinds) };
    case 'same': case 'diff': { const [a, b] = pair(); return { op, a, b }; }
    case 'count': {
      const cmp = rng() < 0.65 ? 'eq' : 'ge';
      const lo = cmp === 'eq' ? 0 : 1;
      return { op, cmp, kind: pick(rng, plainKinds), n: lo + randInt(rng, n + 1 - lo) };
    }
    default: {
      const simple = ['is', 'same', 'diff'];
      return { op, args: [makeStatement(rng, simple, n, speaker, kinds), makeStatement(rng, simple, n, speaker, kinds)] };
    }
  }
}

/** A sentence true in every world, or false in every one, says nothing. */
function empty(p, s) {
  const vals = new Set(allWorlds({ ...p, badge: undefined }).map((w) => evaluate(s, w, p.scene)));
  return vals.size === 1;
}

/** A statement written one way: "A and B are the same" is "B and A are the same". */
export function canon(s) {
  if (s.op === 'same' || s.op === 'diff') return JSON.stringify([s.op, Math.min(s.a, s.b), Math.max(s.a, s.b)]);
  if (s.args) return JSON.stringify([s.op, ...s.args.map(canon)]);
  return JSON.stringify(s);
}

/* "I am a Sun animal" fits every world: a Sun says it truly, a Moon says it
   falsely. Anyone can say it, so it tells the child nothing. */
function vacuous(p, who, s) {
  return allWorlds({ ...p, badge: undefined }).every((w) => allows(w[who], evaluate(s, w, p.scene)));
}

/** Same sentence about the same animals: the puzzle's shape, for spotting repeats. */
export const shapeOf = (p) => JSON.stringify([p.cast.length, p.cloud || false, p.says, p.sol]);

/**
 * One puzzle for a chapter, or null after `tries`. Built backwards: pick the
 * answer first, then sentences that answer allows, then keep the puzzle only
 * if nothing else fits, no sentence is spare, and a person can solve it in
 * the chapter's number of "suppose" steps.
 */
export function makePuzzle(chDef, rng, { tries = 400 } = {}) {
  const ch = chDef.level ? chDef : chapter(chDef.id);
  for (let attempt = 0; attempt < tries; attempt++) {
    const n = ch.n[0] + randInt(rng, ch.n[1] - ch.n[0] + 1);
    const cast = shuffled(rng, CAST).slice(0, n);
    const base = { cast, cloud: Boolean(ch.cloud) };
    const kinds = kindsOf(base);
    let sol;
    if (ch.cloud) sol = shuffled(rng, kinds);
    else sol = Array.from({ length: n }, () => (rng() < 0.5 ? 'sun' : 'moon'));
    const p = { ...base, sol, says: [] };
    let ok = true;

    if (ch.plan) {
      p.scene = makeScene(rng, n, ch.hidden);
      if (ch.hidden) {
        p.hidden = true;
        p.badge = 0;
        p.sol[0] = 'sun';
      }
      const order = shuffled(rng, Array.from({ length: n }, (_, i) => i));
      if (ch.hidden) order.splice(order.indexOf(0), 1), order.unshift(0);
      order.forEach((who, k) => {
        if (!ok) return;
        const role = ch.plan[k];
        const want = sol[who] === 'sun';
        let s = null;
        if (role === 'fact') s = makeFact(rng, p.scene, who, n, want);
        else if (role === 'badge') s = makeFact(rng, p.scene, who, n, true, { onlyCount: true });
        else if (role === 'acc' || (role === 'claim' && rng() < 0.35 && k > 1)) {
          const target = order[k - 1];
          const kind = want ? sol[target] : (sol[target] === 'sun' ? 'moon' : 'sun');
          s = { op: 'is', who: target, kind };
        } else if (role === 'claim') {
          s = claimAboutBadge(rng, p, who, want);
        }
        if (!s) ok = false;
        else p.says.push([who, s]);
      });
      if (!ok) continue;
      p.says.sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]));
    } else {
      for (let who = 0; who < n && ok; who++) {
        const count = ch.two ? 2 : 1;
        for (let c = 0; c < count && ok; c++) {
          let s = null;
          for (let t = 0; t < 60 && !s; t++) {
            const cand = makeStatement(rng, ch.ops, n, who, kinds);
            if (allows(sol[who], evaluate(cand, sol, {})) && !empty(p, cand) && !vacuous(p, who, cand)
              && !p.says.some(([w, x]) => w === who && canon(x) === canon(cand))) s = cand;
          }
          if (!s) ok = false;
          else p.says.push([who, s]);
        }
      }
      if (!ok) continue;
    }

    if (!acceptable(ch, p)) continue;
    const run = humanSolve(p, { maxDepth: ch.depth[1] });
    if (!run.solved || run.depth < ch.depth[0]) continue;
    if (ch.supposes && run.steps.filter((x) => x.kind === 'suppose').length < ch.supposes) continue;
    return { ...p, depth: run.depth, steps: run.steps.length };
  }
  return null;
}

/* Hidden picture: a sentence the badge animal's words settle. */
function claimAboutBadge(rng, p, who, want) {
  const badgeFact = p.says[0][1].f;
  const obj = badgeFact.obj;
  const real = p.scene.c[obj] || 0;
  const options = [];
  if (badgeFact.t === 'count') {
    for (let n = 1; n <= 5; n++) if ((n === real) === want) options.push({ t: 'count', obj, n });
    if (!want) options.push({ t: 'none', obj });
  } else {
    if (want) options.push({ t: 'none', obj });
    else for (let n = 1; n <= 4; n++) options.push({ t: 'count', obj, n });
  }
  const f = options.length ? pick(rng, options) : null;
  return f && evalFact(f, p.scene) === want ? { op: 'fact', f } : null;
}

/** One answer, every sentence needed, and the chapter's own idea present. */
export function acceptable(ch, p) {
  const sols = solutions(p);
  if (sols.length !== 1 || sols[0].some((k, i) => k !== p.sol[i])) return false;
  /* No spare sentence. With two sentences each (h4) one of a pair may be a
     red herring, as the research allows at Hard, but no animal may be spare. */
  if (ch.two) {
    for (let who = 0; who < p.cast.length; who++) {
      if (solutions(p, p.says.filter(([w]) => w !== who)).length === 1) return false;
    }
  } else {
    for (let j = 0; j < p.says.length; j++) {
      if (p.badge === 0 && j === 0) continue;
      if (solutions(p, p.says.filter((_, k) => k !== j)).length === 1) return false;
    }
  }
  if (ch.need) {
    const said = p.says.map(([, s]) => s);
    const met = ch.need.some((op) => (op === 'self'
      ? p.says.some(([who, s]) => mentions(s).includes(who) || s.op === 'count')
      : said.some((s) => hasOp(s, op))));
    if (!met) return false;
  }
  return true;
}

/** The puzzle at a place in a chapter, from its seed. */
export function makeAt(chId, ...seed) {
  const ch = chapter(chId);
  return makePuzzle(ch, rngFor('truth', chId, ...seed));
}

/* ------------------------------------------------------------------ */
/* Stars                                                               */
/* ------------------------------------------------------------------ */

/** ★ solved · ★★ no hint · ★★★ no hint and the first Check was right. */
export function starsFor({ hints = 0, tries = 1 } = {}) {
  if (hints > 0) return 1;
  return tries <= 1 ? 3 : 2;
}

export default {
  CAST, OBJECTS, ITEMS, LEVELS, CHAPTERS, CHAPTER_SIZE, TEACH, chapter, kindsOf,
  evaluate, allows, allWorlds, solutions, firstBroken, legalWorld, mentions, humanSolve,
  nextHint, whySteps, makePuzzle, makeAt, acceptable, shapeOf, starsFor
};
