/**
 * gateslogic.js — Gate Factory: switches, doors and lamps.
 *
 * A machine of zoo doors. Switches on the left are on or off. The current
 * runs from them through doors to a lamp at an animal's house:
 *
 *   and   a door with two locks: through only if both wires are on
 *   or    two doors side by side: through if either wire is on
 *   not   a flip door: on comes out off, and off comes out on
 *   xor   the "only one" door: through if exactly one wire is on (Hard)
 *
 * These are the logic gates every computer is built from (Bebras "circuits",
 * CS Unplugged), as doors a six-year-old can picture. Three kinds of puzzle:
 *
 *   predict   the switches are set: which lamps light?
 *   light     set the switches so the lamps light as asked (exactly one
 *             setting works)
 *   which     one door is hidden; the tries in the table show when the lamp
 *             lit; which door is it? (exactly one door fits every try)
 *
 * Every answer is checked by trying every setting of the switches: there
 * are at most 2⁵ = 32. Pure: no DOM, no Math.random.
 *
 * A machine: { k: switches, gates: [[op, a, b?], ...], lamps: [src, ...] }.
 * A source is a switch (0..k-1) or a door (k + its index). Doors only take
 * sources that come before them, so the machine runs left to right.
 */

import { randInt, shuffled } from './logicrng.js';

export const LEVELS = ['easy', 'medium', 'hard'];
export const OPS = ['and', 'or', 'not', 'xor'];
export const UNARY = new Set(['not']);

/* ------------------------------------------------------------------ */
/* Chapters                                                            */
/* ------------------------------------------------------------------ */

/**
 * ops: the doors a chapter uses (`need`: at least one of these in every
 * machine). k: switches. g: doors. lamps: how many lamps. modes: the kinds
 * of puzzle, taken in turn. options: the doors to choose from in "which".
 */
export const CHAPTERS = {
  easy: [
    { id: 'e1', ops: ['and', 'or'], k: [2, 3], g: [1, 2], lamps: 1, modes: ['predict', 'light'] },
    { id: 'e2', ops: ['and', 'or', 'not'], need: ['not'], k: [2, 3], g: [2, 3], lamps: 1, modes: ['predict', 'light'] },
    { id: 'e3', ops: ['and', 'or', 'not'], k: [2, 3], g: [2, 3], lamps: 2, modes: ['predict', 'light'] }
  ],
  medium: [
    { id: 'm1', ops: ['and', 'or', 'not'], k: [3, 4], g: [3, 4], lamps: 1, modes: ['light'] },
    { id: 'm2', ops: ['and', 'or', 'not'], k: [3, 3], g: [2, 4], lamps: 1, modes: ['which'], options: ['and', 'or'] },
    { id: 'm3', ops: ['and', 'or', 'not'], k: [3, 4], g: [3, 5], lamps: 2, modes: ['predict', 'light'] }
  ],
  hard: [
    { id: 'h1', ops: ['and', 'or', 'not', 'xor'], need: ['xor'], k: [3, 4], g: [3, 5], lamps: [1, 2], modes: ['predict', 'light'] },
    { id: 'h2', ops: ['and', 'or', 'not', 'xor'], k: [3, 4], g: [4, 6], lamps: 1, modes: ['which'], options: ['and', 'or', 'xor'] },
    { id: 'h3', ops: ['and', 'or', 'not', 'xor'], k: [4, 5], g: [4, 6], lamps: [2, 3], modes: ['light'] }
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
/* Running the machine                                                 */
/* ------------------------------------------------------------------ */

const OP_FN = {
  and: (a, b) => a & b,
  or: (a, b) => a | b,
  not: (a) => a ^ 1,
  xor: (a, b) => a ^ b
};

export const apply = (op, a, b) => OP_FN[op](a, b);

/** The switch setting `bits` as 0/1 per switch (switch 0 is bit 0). */
export const bitsOf = (k, bits) => Array.from({ length: k }, (_, i) => (bits >> i) & 1);

/**
 * Every wire's value for a setting: values[src] is 0 or 1, switches first,
 * then doors. `ops` replaces doors' kinds (for trying a hidden door).
 */
export function run(m, sw, ops = null) {
  const v = sw.slice();
  m.gates.forEach(([op, a, b], j) => { v.push(apply(ops && ops[j] ? ops[j] : op, v[a], v[b])); });
  return v;
}

/** The lamps for a setting: 1 lit, 0 dark. */
export const lampsOf = (m, sw, ops = null) => { const v = run(m, sw, ops); return m.lamps.map((s) => v[s]); };

/** Every setting that lights the lamps as `want` asks. */
export function settingsFor(m, want) {
  const out = [];
  for (let bits = 0; bits < 2 ** m.k; bits++) {
    const got = lampsOf(m, bitsOf(m.k, bits));
    if (got.every((x, i) => x === want[i])) out.push(bits);
  }
  return out;
}

/** The doors from `options` that fit every try in `rows` when door `hide` is that door. */
export function doorsThatFit(m, hide, rows, options) {
  return options.filter((op) => rows.every(([bits, lit]) => {
    const ops = [];
    ops[hide] = op;
    const got = lampsOf(m, bitsOf(m.k, bits), ops);
    return got.every((x, i) => x === lit[i]);
  }));
}

/* ------------------------------------------------------------------ */
/* Layout: which column each part stands in                            */
/* ------------------------------------------------------------------ */

/** Depth of every source: switches 0, a door one more than its deepest input. */
export function depths(m) {
  const d = Array(m.k).fill(0);
  m.gates.forEach(([op, a, b]) => d.push(1 + Math.max(d[a], UNARY.has(op) ? 0 : d[b])));
  return d;
}

/* ------------------------------------------------------------------ */
/* Making machines                                                     */
/* ------------------------------------------------------------------ */

const between = (rng, [lo, hi]) => lo + randInt(rng, hi - lo + 1);
const range = (x) => (Array.isArray(x) ? x : [x, x]);

/**
 * A random machine for a chapter: every switch and every door feeds a lamp,
 * no door takes the same wire twice, no NOT straight after a NOT, and no
 * lamp that is always lit or always dark.
 */
export function makeMachine(ch, rng) {
  const k = between(rng, ch.k);
  const g = between(rng, ch.g);
  const nl = between(rng, range(ch.lamps));
  for (let t = 0; t < 200; t++) {
    const gates = [];
    const used = new Set();
    let ok = true;
    for (let j = 0; j < g; j++) {
      const op = ch.ops[randInt(rng, ch.ops.length)];
      const n = k + j;
      /* Prefer wires nothing uses yet, so the machine stays joined up. */
      const fresh = shuffled(rng, Array.from({ length: n }, (_, i) => i).filter((i) => !used.has(i)));
      const any = shuffled(rng, Array.from({ length: n }, (_, i) => i));
      const a = fresh.length ? fresh[0] : any[0];
      if (UNARY.has(op)) {
        if (a >= k && gates[a - k][0] === 'not') { ok = false; break; }
        gates.push([op, a]);
        used.add(a);
      } else {
        const rest = [...fresh.slice(1), ...any].filter((x) => x !== a);
        if (!rest.length) { ok = false; break; }
        const b = rest[0];
        gates.push([op, Math.min(a, b), Math.max(a, b)]);
        used.add(a);
        used.add(b);
      }
    }
    if (!ok) continue;
    /* Lamps: the doors nothing else uses, last ones first. */
    const free = Array.from({ length: g }, (_, j) => k + j).filter((s) => !used.has(s)).reverse();
    if (free.length !== nl) continue;
    const m = { k, gates, lamps: free.slice().reverse() };
    if (ch.need && !gates.some(([op]) => ch.need.includes(op))) continue;
    if (!joined(m)) continue;
    if (!lively(m)) continue;
    return m;
  }
  return null;
}

/** Does every switch and door lead to some lamp? */
export function joined(m) {
  const reach = new Set(m.lamps);
  for (let j = m.gates.length - 1; j >= 0; j--) {
    if (!reach.has(m.k + j)) return false;
    const [op, a, b] = m.gates[j];
    reach.add(a);
    if (!UNARY.has(op)) reach.add(b);
  }
  for (let i = 0; i < m.k; i++) if (!reach.has(i)) return false;
  return true;
}

/** Is every lamp sometimes lit and sometimes dark, and does every switch change something? */
export function lively(m) {
  const n = 2 ** m.k;
  const outs = Array.from({ length: n }, (_, bits) => lampsOf(m, bitsOf(m.k, bits)).join(''));
  for (let l = 0; l < m.lamps.length; l++) {
    const seen = new Set(outs.map((o) => o[l]));
    if (seen.size < 2) return false;
  }
  for (let i = 0; i < m.k; i++) {
    if (outs.every((o, bits) => o === outs[bits ^ (1 << i)])) return false;
  }
  return true;
}

/** The mode of puzzle i in a chapter: its modes taken in turn. */
export const modeAt = (ch, i) => ch.modes[i % ch.modes.length];

/**
 * One puzzle for a chapter and mode, or null after `tries` machines.
 *   predict: { set } the switch setting (a number, one bit per switch)
 *   light:   { want } the lamps asked for, with exactly one setting that works
 *   which:   { hide, rows: [[bits, lamps], ...], options } with exactly one door
 */
export function makePuzzle(ch, mode, rng, { tries = 200 } = {}) {
  for (let t = 0; t < tries; t++) {
    const m = makeMachine(ch, rng);
    if (!m) continue;
    const base = { mode, k: m.k, gates: m.gates, lamps: m.lamps };
    if (mode === 'predict') {
      /* Not a setting where every lamp just copies its own switch. */
      const set = randInt(rng, 2 ** m.k);
      return { ...base, set };
    }
    if (mode === 'light') {
      /* A wish for the lamps that only one setting grants. */
      const counts = new Map();
      for (let bits = 0; bits < 2 ** m.k; bits++) {
        const key = lampsOf(m, bitsOf(m.k, bits)).join('');
        counts.set(key, (counts.get(key) || 0) + 1);
      }
      const unique = shuffled(rng, [...counts].filter(([, c]) => c === 1).map(([key]) => key));
      if (!unique.length) continue;
      return { ...base, want: [...unique[0]].map(Number) };
    }
    /* which: hide a two-wire door, show a few tries, keep it if one door fits. */
    const binary = m.gates.map((gt, j) => j).filter((j) => !UNARY.has(m.gates[j][0]) && ch.options.includes(m.gates[j][0]));
    if (!binary.length) continue;
    const hide = binary[randInt(rng, binary.length)];
    const all = shuffled(rng, Array.from({ length: 2 ** m.k }, (_, bits) => bits));
    for (let n = 2; n <= Math.min(5, all.length); n++) {
      const rows = all.slice(0, n).sort((x, y) => x - y).map((bits) => [bits, lampsOf(m, bitsOf(m.k, bits))]);
      if (doorsThatFit(m, hide, rows, ch.options).length === 1) {
        return { ...base, hide, rows, options: ch.options };
      }
    }
  }
  return null;
}

/** The answer: predict → lamps; light → the one setting; which → the door. */
export function answerOf(p) {
  if (p.mode === 'predict') return lampsOf(p, bitsOf(p.k, p.set));
  if (p.mode === 'light') return settingsFor(p, p.want)[0];
  return p.gates[p.hide][0];
}

/** A stable string for spotting a repeated puzzle. */
export const shapeOf = (p) => JSON.stringify([p.mode, p.k, p.gates, p.lamps, p.set ?? null, p.want ?? null, p.hide ?? null, p.rows ?? null]);

/* ------------------------------------------------------------------ */
/* Stars                                                               */
/* ------------------------------------------------------------------ */

/**
 *   predict, which   ★★★ right first time · ★
 *   light            ★★★ the first power-on · ★★ the second · ★
 *   any mode         ★ if the answer was shown
 */
export function starsFor(mode, { tries = 1, shown = false } = {}) {
  if (shown) return 1;
  if (mode === 'light') return tries <= 1 ? 3 : tries <= 2 ? 2 : 1;
  return tries <= 1 ? 3 : 1;
}

export default {
  LEVELS, OPS, UNARY, CHAPTERS, CHAPTER_SIZE, TEACH, chapter, apply, bitsOf, run, lampsOf, settingsFor,
  doorsThatFit, depths, makeMachine, joined, lively, modeAt, makePuzzle, answerOf, shapeOf, starsFor
};
