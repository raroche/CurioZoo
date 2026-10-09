/**
 * shadowlogic.js — Shadow Show: a lamp, puppets on sticks, and a wall.
 *
 * Light goes in straight lines, so a puppet between a lamp and a wall leaves
 * a shadow the shape of its outline, made bigger by how near the lamp it is
 * (research-levers-shadows-water-dominos.md section 2). Everything is whole
 * numbers on a 12-step stage:
 *   - the lamp is at step 0 and the wall at step 12 (or the lamp moves and
 *     the puppet stays at step 6);
 *   - a puppet at step x makes a shadow 12 ÷ x times as big: slots 2, 3, 4,
 *     6 and 12 give 6, 4, 3, 2 and 1;
 *   - a puppet's top and bottom rows a, b throw a shadow from
 *     lamp + (a − lamp) × k to lamp + (b − lamp) × k, so raising the lamp
 *     lowers the shadow;
 *   - the sun's rays are parallel: a slope rise:run makes a shadow
 *     height × run ÷ rise long, so a low sun makes a long shadow;
 *   - card stops the light (a dark shadow), tissue paper lets some through
 *     (a pale one), glass lets almost all through (hardly any);
 *   - two lamps make two shadows; a puppet against the wall makes them one.
 *
 * Pure: no DOM, no Math.random.
 */

import { pickOne, randInt, rngFor, shuffled } from './logicrng.js';

export const LEVELS = ['easy', 'medium', 'hard'];
export const WALL = 12;
export const ROWS = 13;           // rows 0 to 12, row 0 at the top
export const LAMP_ROW = 6;
export const SLOTS = [2, 3, 4, 6, 12];

/* Puppets: an emoji whose outline is the shadow, and how many rows tall. */
export const PUPPETS = [
  { id: 'rabbit', emoji: '🐇', h: 2 },
  { id: 'giraffe', emoji: '🦒', h: 3 },
  { id: 'turtle', emoji: '🐢', h: 1 },
  { id: 'elephant', emoji: '🐘', h: 2 },
  { id: 'cat', emoji: '🐈', h: 1 },
  { id: 'bird', emoji: '🐦', h: 1 },
  { id: 'snail', emoji: '🐌', h: 1 },
  { id: 'deer', emoji: '🦌', h: 2 },
  { id: 'owl', emoji: '🦉', h: 2 }
];
export const puppet = (id) => PUPPETS.find((p) => p.id === id) || null;

/** How many times bigger the shadow is, for a puppet at step x with the lamp at step L. */
export const scale = (x, L = 0) => (WALL - L) / (x - L);

/** The rows a shadow covers on the wall: [top, bottom], from the puppet's rows and the lamp's row. */
export function shadowSpan(top, bottom, x, lampRow = LAMP_ROW, L = 0) {
  const k = scale(x, L);
  return [lampRow + (top - lampRow) * k, lampRow + (bottom - lampRow) * k];
}

/** A puppet centred on the lamp's row: its top and bottom rows (bottom exclusive edge). */
export const centred = (h) => [LAMP_ROW - h / 2, LAMP_ROW + h / 2];

/** Sun slopes, high to low, and how long a shadow each makes. */
export const SUNS = [[2, 1], [1, 1], [1, 2], [1, 3]];
export const sunLength = (h, [rise, run]) => (h * run) / rise;

export const MATERIALS = ['card', 'tissue', 'glass'];
export const DARKNESS = { card: 'dark', tissue: 'pale', glass: 'none' };

/* ------------------------------------------------------------------ */
/* Chapters                                                            */
/* ------------------------------------------------------------------ */

export const CHAPTER_SIZE = 30;
export const TEACH = 2;
export const sizeOf = (ch) => ch.size || CHAPTER_SIZE;

/*   shape     which puppet makes this shadow?          (slot fixed)
     size      where should this puppet stand?
     both      which puppet, and where?
     lamp      the puppet stays; where should the lamp go?
     height    the lamp moves up or down: which row makes this shadow?
     sun       where should the sun be so the shade falls just right?
     material  card, tissue or glass: which makes this shadow?
     tall      how tall will the shadow be?
     two       two lamps: how many shadows? */
export const CHAPTERS = {
  easy: [
    { id: 'e1', kind: 'shape', icon: '🐇' },
    { id: 'e2', kind: 'size', icon: '🔍', size: 20 },
    { id: 'e3', kind: 'sun', icon: '🌅', size: 24 }
  ],
  medium: [
    { id: 'm1', kind: 'both', icon: '🦒' },
    { id: 'm2', kind: 'lamp', icon: '💡', size: 24 },
    { id: 'm3', kind: 'material', icon: '🪟', size: 20 }
  ],
  hard: [
    { id: 'h1', kind: 'height', icon: '↕️', size: 24 },
    { id: 'h2', kind: 'tall', icon: '📏' },
    { id: 'h3', kind: 'two', icon: '💡💡', size: 24 }
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

/** Three choices in order with the right one anywhere among them. */
function around(rng, right, pool) {
  const below = shuffled(rng, pool.filter((v) => v < right));
  const above = shuffled(rng, pool.filter((v) => v > right));
  const at = randInt(rng, 3);
  const lo = below.slice(0, at);
  const hi = above.slice(0, 2 - at);
  if (lo.length !== at || hi.length !== 2 - at) return null;
  return [...lo, right, ...hi].sort((a, b) => a - b);
}

/* Slots whose shadow still fits on the wall for a puppet h rows tall. */
const fitSlots = (h) => SLOTS.filter((x) => h * scale(x) <= ROWS - 1);

/** Three puppets of different outlines, the right one among them. */
function threePuppets(rng, right) {
  const others = shuffled(rng, PUPPETS.filter((p) => p.id !== right.id && p.h === right.h)).slice(0, 2);
  const more = others.length < 2 ? shuffled(rng, PUPPETS.filter((p) => p.id !== right.id && !others.includes(p))).slice(0, 2 - others.length) : [];
  return shuffled(rng, [right, ...others, ...more]).map((p) => p.id);
}

export function makePuzzle(ch, rng, i = TEACH) {
  const teach = i < TEACH;
  for (let tries = 0; tries < 100; tries++) {
    let p = null;
    switch (ch.id) {
      case 'e1': {
        /* Which puppet makes this shadow? The slot is fixed. */
        const right = teach ? puppet(i === 0 ? 'rabbit' : 'giraffe') : pickOne(rng, PUPPETS);
        const x = pickOne(rng, fitSlots(right.h).filter((s) => s >= 4));
        p = { kind: 'shape', x, target: right.id, puppets: threePuppets(rng, right) };
        break;
      }
      case 'e2': case 'm1': {
        /* Where should it stand? (m1: and which puppet?) Easy keeps k to 1, 2, 3. */
        const right = teach ? puppet('rabbit') : pickOne(rng, PUPPETS);
        const allowed = fitSlots(right.h).filter((x) => ch.id === 'm1' || x >= 4);
        const x = teach ? (i === 0 ? 6 : 4) : pickOne(rng, allowed);
        const slots = around(rng, x, allowed.filter((s) => s !== x));
        if (!slots) break;
        p = ch.id === 'e2'
          ? { kind: 'size', puppet: right.id, target: x, slots }
          : { kind: 'both', target: right.id, x, slots, puppets: threePuppets(rng, right) };
        break;
      }
      case 'e3': {
        /* Sun shadows: shade over the sleeping lion, sun on the zebra. The
           lion and zebra sit so exactly one of the three suns does it. */
        const h = teach ? 2 : pickOne(rng, [1, 2, 3]);
        const all = SUNS.map((sun, k) => ({ k, len: sunLength(h, sun) })).filter((s) => Number.isInteger(s.len));
        const opts = all.length > 3 ? (rng() < 0.5 ? all.slice(0, 3) : all.slice(1)) : all;
        if (opts.length < 3) break;
        const t = teach ? opts[1] : pickOne(rng, opts);
        const shorter = opts.filter((s) => s.len < t.len).map((s) => s.len);
        const longer = opts.filter((s) => s.len > t.len).map((s) => s.len);
        const lo = shorter.length ? Math.max(...shorter) : 0;
        const hi = longer.length ? Math.min(...longer) : t.len + 3;
        const lion = lo + 1 + randInt(rng, t.len - lo);
        const zebra = t.len + 1 + randInt(rng, hi - t.len);
        p = { kind: 'sun', h, lion, zebra, opts: opts.map((s) => s.k) };
        break;
      }
      case 'm2': {
        /* The puppet stays at step 6; the lamp moves: steps 0, 3, 4, 5 give 2, 3, 4, 7. */
        const right = teach ? puppet('turtle') : pickOne(rng, PUPPETS.filter((q) => q.h === 1));
        const lamps = [0, 3, 4, 5].filter((L) => right.h * scale(6, L) <= ROWS - 1);
        const L = teach ? 4 : pickOne(rng, lamps);
        const opts = around(rng, L, lamps.filter((v) => v !== L));
        if (!opts) break;
        p = { kind: 'lamp', puppet: right.id, lamp: L, opts };
        break;
      }
      case 'm3': {
        /* Card, tissue or glass: which makes this shadow? */
        const right = teach ? (i === 0 ? 'tissue' : 'glass') : pickOne(rng, MATERIALS);
        const who = teach ? puppet(i === 0 ? 'rabbit' : 'giraffe') : pickOne(rng, PUPPETS);
        p = { kind: 'material', puppet: who.id, x: 6, material: right, opts: MATERIALS.slice() };
        break;
      }
      case 'h1': {
        /* Lamp up, shadow down: which lamp row puts the shadow here? */
        const right = pickOne(rng, PUPPETS.filter((q) => q.h <= 2));
        const x = 4;
        const top = 5;
        const bottom = top + right.h;
        const rows = [4, 5, 6, 7, 8].filter((r) => {
          const [a, b] = shadowSpan(top, bottom, x, r);
          return a >= 0 && b <= ROWS;
        });
        const r = teach ? (rows.includes(7) ? 7 : rows[0]) : pickOne(rng, rows);
        const opts = around(rng, r, rows.filter((v) => v !== r));
        if (!opts) break;
        p = { kind: 'height', puppet: right.id, x, top, lampRow: r, opts };
        break;
      }
      case 'h2': {
        /* How tall will the shadow be? height × 12 ÷ step. */
        const right = pickOne(rng, PUPPETS);
        const x = pickOne(rng, fitSlots(right.h));
        const tall = right.h * scale(x);
        const opts = around(rng, tall, [...new Set([right.h, right.h * 2, right.h * 3, right.h * 4, right.h * 6, tall + 1, tall - 1, tall + 2])].filter((v) => v > 0 && v !== tall));
        if (!opts) break;
        p = { kind: 'tall', puppet: right.id, x, opts };
        break;
      }
      case 'h3': {
        /* Two lamps, at rows 4 and 8: two shadows, unless the puppet is against the wall. */
        const right = pickOne(rng, PUPPETS.filter((q) => q.h <= 2));
        const x = teach ? (i === 0 ? 6 : 12) : pickOne(rng, [3, 4, 6, 12]);
        p = { kind: 'two', puppet: right.id, x, lamps: [4, 8], opts: [1, 2, 3] };
        break;
      }
      default: return null;
    }
    if (p && !problems(p).length) return p;
  }
  return null;
}

export const makeAt = (chId, i, ...seed) => makePuzzle(chapter(chId), rngFor('shadow', chId, i, ...seed), i);

export function sig(p) {
  const rest = { ...p };
  return JSON.stringify(Object.keys(rest).sort().map((k) => [k, rest[k]]));
}

/* ------------------------------------------------------------------ */
/* Answers and proof                                                   */
/* ------------------------------------------------------------------ */

/** How many separate shadows two lamps make: one when they land in the same place. */
export function shadowCount(p) {
  const pp = puppet(p.puppet);
  const [top, bottom] = centred(pp.h);
  const spans = p.lamps.map((r) => shadowSpan(top, bottom, p.x, r));
  const same = spans.every((s) => s[0] === spans[0][0] && s[1] === spans[0][1]);
  return same ? 1 : 2;
}

export function answers(p) {
  switch (p.kind) {
    case 'shape': return [p.puppets.indexOf(p.target)];
    case 'size': return [p.slots.indexOf(p.target)];
    case 'both': return [p.puppets.indexOf(p.target), p.slots.indexOf(p.x)];
    case 'lamp': return [p.opts.indexOf(p.lamp)];
    case 'height': return [p.opts.indexOf(p.lampRow)];
    case 'sun': return [p.opts.findIndex((k) => sunLength(p.h, SUNS[k]) >= p.lion && sunLength(p.h, SUNS[k]) < p.zebra)];
    case 'material': return [p.opts.indexOf(p.material)];
    case 'tall': return [p.opts.indexOf(puppet(p.puppet).h * scale(p.x))];
    case 'two': return [p.opts.indexOf(shadowCount(p))];
    default: return [];
  }
}

export function choices(p) {
  switch (p.kind) {
    case 'shape': return [p.puppets.map((_, i) => i)];
    case 'size': return [p.slots.map((_, i) => i)];
    case 'both': return [p.puppets.map((_, i) => i), p.slots.map((_, i) => i)];
    default: return [(p.opts || []).map((_, i) => i)];
  }
}

export function problems(p) {
  const errs = [];
  const err = (m) => errs.push(m);
  const ans = answers(p);
  ans.forEach((a, k) => { if (a === -1 || a === undefined) err(`question ${k + 1} has no answer`); });
  const opts = choices(p);
  switch (p.kind) {
    case 'shape': case 'both':
      if (new Set(p.puppets).size !== 3) err('three different puppets are needed');
      if (new Set(p.puppets.map((id) => puppet(id).emoji)).size !== 3) err('two puppets look the same');
      break;
    case 'size': {
      const k = scale(p.target);
      const same = p.slots.filter((x) => scale(x) === k);
      if (same.length !== 1) err('two slots make the same size');
      break;
    }
    case 'lamp': {
      const pp = puppet(p.puppet);
      if (pp.h * scale(6, p.lamp) > ROWS - 1) err('the shadow does not fit on the wall');
      if (new Set(p.opts.map((L) => scale(6, L))).size !== p.opts.length) err('two lamp places make the same size');
      break;
    }
    case 'height': {
      const pp = puppet(p.puppet);
      const spans = p.opts.map((r) => shadowSpan(p.top, p.top + pp.h, p.x, r).join(','));
      if (new Set(spans).size !== spans.length) err('two lamp heights make the same shadow');
      break;
    }
    case 'sun': {
      const ok = p.opts.filter((k) => sunLength(p.h, SUNS[k]) >= p.lion && sunLength(p.h, SUNS[k]) < p.zebra);
      if (ok.length !== 1) err(`${ok.length} suns give the right shade`);
      break;
    }
    case 'tall':
      if (p.opts.filter((v) => v === puppet(p.puppet).h * scale(p.x)).length !== 1) err('the height is not one of the choices, once');
      break;
    case 'material': case 'two': break;
    default: err(`unknown kind ${p.kind}`);
  }
  if (opts.some((o) => !o.length)) err('a question with no choices');
  return errs;
}

/** 3 clean, 2 after one slip or hint, 1 after that; teaching is always 3. */
export function starsFor({ wrong = 0, hints = 0, teach = false } = {}) {
  if (teach) return 3;
  const n = wrong + hints;
  return n === 0 ? 3 : n === 1 ? 2 : 1;
}

export default {
  LEVELS, WALL, ROWS, LAMP_ROW, SLOTS, PUPPETS, puppet, scale, shadowSpan, centred, SUNS, sunLength, MATERIALS, DARKNESS,
  CHAPTER_SIZE, TEACH, sizeOf, CHAPTERS, chapter, makePuzzle, makeAt, sig, shadowCount, answers, choices, problems, starsFor
};
