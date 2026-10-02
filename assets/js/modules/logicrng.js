/**
 * logicrng.js — the random numbers behind every Logic Games puzzle.
 *
 * A puzzle has to come out the same every time it is made from the same seed:
 * on the build machine that writes the bank, in the checker that re-solves it,
 * and on a child's iPad making today's daily puzzle. Math.random cannot do
 * that, so nothing in a generator may call it. These use integer arithmetic
 * only (Math.imul and shifts), which every JavaScript engine computes the same
 * way, so a seed means the same puzzle on every device.
 */

/** mulberry32: a small, fast generator with a 32-bit state. Returns [0, 1). */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Any list of strings and numbers, folded into one 32-bit seed (FNV-1a). */
export function hash(...parts) {
  let h = 0x811C9DC5;
  const text = parts.join('|');
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** A generator seeded from a list of parts: rngFor('code', 'e1', 7). */
export const rngFor = (...parts) => mulberry32(hash(...parts));

/** A whole number from 0 to n - 1. */
export const randInt = (rng, n) => Math.floor(rng() * n);

/** One item of a list. */
export const pickOne = (rng, list) => list[randInt(rng, list.length)];

/** A shuffled copy (Fisher-Yates), driven by `rng`. */
export function shuffled(rng, list) {
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = randInt(rng, i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Today's date on this device as YYYY-MM-DD. The daily puzzle follows the
 * child's own calendar, not the server's: there is no server.
 */
export function today(now = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;
}

/** The seed of one game's daily puzzle at one level on one day. */
export const dailySeed = (game, level, isoDate) => hash('daily', game, level, isoDate);

export default { mulberry32, hash, rngFor, randInt, pickOne, shuffled, today, dailySeed };
