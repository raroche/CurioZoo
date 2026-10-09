/**
 * pondlogic.js — Hippo Pond: what floats, what sinks, and the experiments.
 *
 * The idea every chapter builds on: a thing floats when it is lighter than
 * the same amount of water (its "water twin"), and sinks when it is heavier.
 * Heaviness for size -- density -- decides, never weight alone. The research,
 * with a source for every density, is docs/research/science/research-hippo.md.
 *
 * Pure: no DOM, no Math.random. Densities are whole hundredths of a gram per
 * cubic centimetre (water is 100), so every comparison is exact.
 *
 * Seven kinds of experiment:
 *
 *   tray     real things in one liquid: float or sink? (e1, e2, m1, h1)
 *   same     one thing was tested; the same stuff, bigger or smaller? (e3)
 *   cubes    a raft of cubes and its weight: float or sink? (m2)
 *   depth    a raft that floats: how many rows go under? (m2, m3)
 *   fix      it sinks (or floats): which change makes it do the other? (m1)
 *   layers   honey, water, oil: where does each block stop? (h2)
 *   frac     a block of known heaviness: what part of it is under? (h3)
 */

import { pickOne, randInt, rngFor, shuffled } from './logicrng.js';

export const LEVELS = ['easy', 'medium', 'hard'];

/* ------------------------------------------------------------------ */
/* Liquids                                                             */
/* ------------------------------------------------------------------ */

/* Heaviness for size, in hundredths: what the screen says (d), and the
   real range (lo to hi) a verdict must clear. "Salty" is water with as much
   salt stirred in as it will take, which tops out at about 1.20, so salt can
   never float a stone, glass or metal. Honey varies with how wet it is. */
export const LIQUIDS = {
  water: { d: 100, lo: 100, hi: 100 },
  salty: { d: 120, lo: 118, hi: 120 },
  oil: { d: 92, lo: 91, hi: 92 },
  honey: { d: 142, lo: 138, hi: 145 }
};

/**
 * A thing is only shown in a liquid when its whole real range of heaviness
 * is at least this far from the liquid's whole range. Closer than that, a
 * real one could go either way, and a game that says it always floats would
 * be wrong.
 */
export const MARGIN = 5;

/* ------------------------------------------------------------------ */
/* The things                                                          */
/* ------------------------------------------------------------------ */

/**
 * id, emoji, size: 1 tiny to 5 huge (how big it is drawn, and what "big"
 * and "small" mean in a lesson), and what the research found:
 *   d     its real range of heaviness for size, where a source gives one.
 *         Only these show a number (the Hard chapter) and only these are
 *         judged in a liquid by comparing numbers.
 *   v     tested verdicts where a source says what it does but gives no
 *         number ("an apple floats"): F or S per liquid. A liquid missing
 *         here is one no source covers, and the thing is never shown in it.
 *   grow  can be shown at any size (the "same stuff" chapter)
 *   shape can be pressed into a boat
 *   hard  everyday surprise: kept out of the first chapter
 *   fact  has a one-line fact (pondtext fact.<id>)
 * Every row and its source is in research-hippo.md, section 2.
 */
const I = (id, emoji, size, more) => ({ id, emoji, size, ...more });
const F = (...liqs) => Object.fromEntries(liqs.map((l) => [l, 'float']));
export const ITEMS = [
  /* Floaters. The big ones are the lesson: big and heavy, light for their size. */
  I('log', '🪵', 5, { d: [35, 50], grow: true }),
  I('ship', '🚢', 5, { v: F('water', 'salty'), fact: true }),
  I('pumpkin', '🎃', 5, { v: F('water', 'salty', 'honey'), fact: true }),
  I('watermelon', '🍉', 4, { v: F('water', 'salty', 'honey') }),
  I('bowling8', '🎳', 4, { d: [65, 69], hard: true, fact: true }),
  I('basketball', '🏀', 4, { d: [6, 10] }),
  I('tennis', '🎾', 2, { d: [33, 41], fact: true }),
  I('pingpong', '🏓', 1, { d: [7, 9] }),
  I('ice', '🧊', 3, { d: [91, 92], grow: true, fact: true }),
  I('candle', '🕯️', 2, { d: [89, 91], grow: true }),
  I('butter', '🧈', 2, { d: [86, 87] }),
  I('pencil', '✏️', 2, { d: [38, 57] }),
  I('apple', '🍎', 2, { v: F('water', 'salty', 'honey'), hard: true, fact: true }),
  I('orange', '🍊', 2, { v: F('water', 'salty', 'honey'), hard: true, fact: true }),
  I('banana', '🍌', 2, { v: F('water', 'salty', 'honey'), hard: true }),
  I('corn', '🌽', 2, { v: F('water', 'salty', 'honey'), hard: true, fact: true }),
  I('pepper', '🫑', 2, { v: F('water', 'salty', 'honey'), hard: true, fact: true }),
  /* Sinkers. The small ones are the lesson: small and light, heavy for their size. */
  I('coin', '🪙', 1, { d: [700, 890], grow: true }),
  I('key', '🔑', 1, { d: [840, 875] }),
  I('spoon', '🥄', 2, { d: [780, 790] }),
  I('rock', '🪨', 2, { d: [260, 280], grow: true }),
  I('bone', '🦴', 2, { d: [170, 200] }),
  I('anchor', '⚓', 4, { d: [700, 780] }),
  I('bowling16', '🎳', 4, { d: [131, 135], hard: true }),
  I('hippo', '🦛', 5, { v: { water: 'sink' }, fact: true }),
  I('clay', '🟤', 2, { v: { water: 'sink', oil: 'sink' }, shape: true }),
  I('potato', '🥔', 2, { d: [106, 110], hard: true }),
  I('grape', '🍇', 1, { v: { water: 'sink', salty: 'float', oil: 'sink', honey: 'float' }, hard: true }),
  I('egg', '🥚', 2, { v: { water: 'sink', salty: 'float', oil: 'sink', honey: 'float' }, hard: true, fact: true }),
  I('carrot', '🥕', 2, { v: { water: 'sink', oil: 'sink' }, hard: true }),
  I('kiwi', '🥝', 2, { v: { water: 'sink', oil: 'sink' }, hard: true })
];

export const itemById = (id) => ITEMS.find((i) => i.id === id) || null;

/** 'float', 'sink', or null when no source settles it (or a real one could go either way). */
export function verdict(item, liquid = 'water') {
  if (item.v) return item.v[liquid] || null;
  const L = LIQUIDS[liquid];
  if (item.d[1] <= L.lo - MARGIN) return 'float';
  if (item.d[0] >= L.hi + MARGIN) return 'sink';
  return null;
}

/** The single number a card shows in the Hard chapter: the middle of its range, to the nearest 0.05 (0.01 below 0.1). */
export function shownDensity(item) {
  const mid = (item.d[0] + item.d[1]) / 2;
  return mid < 10 ? Math.round(mid) : Math.round(mid / 5) * 5;
}

/** How much of a floater is under, for drawing it: its middle heaviness over the liquid's. */
export function underOf(item, liquid = 'water') {
  if (!item.d) return 0.6;
  return (item.d[0] + item.d[1]) / 2 / LIQUIDS[liquid].d;
}

/* ------------------------------------------------------------------ */
/* Chapters                                                            */
/* ------------------------------------------------------------------ */

export const CHAPTER_SIZE = 30;
export const TEACH = 2;

export const CHAPTERS = {
  easy: [
    { id: 'e1', kind: 'tray', icon: '🦛' },
    { id: 'e2', kind: 'tray', icon: '⚖️' },
    { id: 'e3', kind: 'same', icon: '🪵' }
  ],
  medium: [
    { id: 'm1', kind: 'fix', icon: '🛶' },
    { id: 'm2', kind: 'cubes', icon: '🧊' },
    { id: 'm3', kind: 'depth', icon: '📏' }
  ],
  hard: [
    { id: 'h1', kind: 'tray', num: true, icon: '🌊' },
    { id: 'h2', kind: 'layers', icon: '🍯' },
    { id: 'h3', kind: 'frac', icon: '🏔️' }
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

/* The layers of the honey jar, top to bottom, and where a block can stop:
   0 on top of the oil, 1 between oil and water, 2 between water and honey,
   3 on the bottom. */
export const LAYERS = ['oil', 'water', 'honey'];

/** Where a block of heaviness d stops in the honey jar, or null if too close to a liquid to say. */
export function layerOf(d) {
  let at = 0;
  for (const liq of LAYERS) {
    const L = LIQUIDS[liq].d;
    /* A mystery block is exactly as heavy for its size as its card says,
       so only a tie with a liquid is unclear. */
    if (d === L) return null;
    if (d > L) at += 1;
  }
  return at;
}

/** The fractions a floating block can show, as [top, bottom]. */
export const FRACTIONS = [[1, 5], [1, 4], [1, 3], [2, 5], [1, 2], [3, 5], [2, 3], [3, 4], [4, 5], [9, 10]];

/**
 * The right answer to each question of an experiment, in order. Every
 * question is a choice between a few values; this is what the board marks
 * and what the checker proves.
 */
export function answers(p) {
  switch (p.kind) {
    case 'tray': return p.items.map((id) => verdict(itemById(id), p.liq));
    case 'same': return p.ask.map(() => verdict(itemById(p.item), 'water'));
    case 'cubes': return p.rafts.map((r) => (r.wt < r.w * r.h ? 'float' : 'sink'));
    case 'depth': return [p.wt / p.w];
    case 'fix': return [p.opts.findIndex((o) => fixWorks(p, o) === true)];
    case 'layers': return p.blocks.map((d) => layerOf(d));
    case 'frac': return [p.opts.findIndex((f) => f[0] * p.liqD === f[1] * p.d)];
    default: return [];
  }
}

/** The choices each question offers, in order. */
export function choices(p) {
  switch (p.kind) {
    case 'tray': case 'same': case 'cubes': return answers(p).map(() => ['float', 'sink']);
    case 'depth': return [Array.from({ length: p.h - 1 }, (_, i) => i + 1)];
    case 'fix': return [p.opts.map((_, i) => i)];
    case 'layers': return p.blocks.map(() => [0, 1, 2, 3]);
    case 'frac': return [p.opts.map((_, i) => i)];
    default: return [];
  }
}

/* ------------------------------------------------------------------ */
/* Fixes                                                               */
/* ------------------------------------------------------------------ */

/**
 * The changes a child can choose between. Each says when it works, so the
 * game only ever claims what is true:
 *   boat   press it into a hollow boat shape: works for anything soft enough
 *          to shape (clay, foil); the boat pushes away far more water.
 *   salt   stir in salt until no more dissolves: works when the thing is
 *          lighter than very salty water.
 *   honey  use honey instead of water: works when lighter than honey.
 *   float  tie it to a big float: always works (only offered as the answer).
 *   sand   fill it with sand: works for a hollow thing that floats.
 *   stone  tie a heavy stone to it: always works (only offered as the answer).
 *   half, bigger, smaller, paint, upside: never change floating or sinking,
 *          because heaviness for size stays the same.
 */
export const FIXES = {
  float: ['boat', 'salt', 'honey', 'float'],
  sink: ['salt', 'honey', 'stone'],
  never: ['half', 'bigger', 'smaller', 'paint', 'upside']
};

/**
 * Does this change do what the goal asks? true, false, or null when no
 * source says (a carrot in very salty water): a change the game cannot
 * stand behind is never offered, right or wrong.
 */
export function fixWorks(p, fix) {
  const item = itemById(p.item);
  const as = (liq) => {
    const v = verdict(item, liq);
    return v === null ? null : v === p.goal;
  };
  switch (fix) {
    case 'boat': return p.goal === 'float' ? !!item.shape : false;
    case 'salt': return as('salty');
    case 'honey': return as('honey');
    case 'float': return p.goal === 'float';
    case 'stone': return p.goal === 'sink';
    default: return FIXES.never.includes(fix) ? false : null;
  }
}

/* ------------------------------------------------------------------ */
/* Making experiments                                                  */
/* ------------------------------------------------------------------ */

const inWater = (v) => ITEMS.filter((i) => verdict(i, 'water') === v);
const conflict = (i) => (verdict(i, 'water') === 'float' && i.size >= 4) || (verdict(i, 'water') === 'sink' && i.size <= 2);

/** A tray of n things in one liquid, with at least one of each answer. */
function makeTray(rng, { n, liq = 'water', need = null, pool = ITEMS }) {
  for (let tries = 0; tries < 200; tries++) {
    const ok = pool.filter((i) => verdict(i, liq));
    const pick = shuffled(rng, ok).slice(0, n);
    if (pick.length < n) return null;
    const v = pick.map((i) => verdict(i, liq));
    if (!v.includes('float') || !v.includes('sink')) continue;
    if (need && !pick.some(need)) continue;
    return pick.map((i) => i.id);
  }
  return null;
}

const SIZES = [1, 2, 3, 4, 5];

/** Make experiment number i (0-based) of a chapter, from its seed. */
export function makePuzzle(ch, rng, i = TEACH) {
  const teach = i < TEACH;
  switch (ch.id) {
    case 'e1': {
      /* Two to four things; the first teach shows the big floater and the
         small sinker side by side. */
      const n = teach ? 2 : i < 12 ? 3 : 4;
      const items = teach
        ? [i === 0 ? 'log' : 'ship', i === 0 ? 'coin' : 'key']
        : makeTray(rng, { n, need: conflict, pool: ITEMS.filter((x) => !x.hard) });
      return items && { kind: 'tray', liq: 'water', items };
    }
    case 'e2': {
      const n = teach ? 2 : i < 15 ? 3 : 4;
      const items = teach
        ? [i === 0 ? 'candle' : 'basketball', i === 0 ? 'spoon' : 'rock']
        : makeTray(rng, { n, pool: i < 12 ? ITEMS.filter((x) => !x.hard) : ITEMS, need: i < 12 ? null : (x) => x.hard });
      /* The balance is on every card for the first ten; after that it is
         the hint, and the trays bring in the everyday surprises. */
      return items && { kind: 'tray', liq: 'water', ...(i < 10 ? { twin: true } : {}), items };
    }
    case 'e3': {
      /* One thing was tested at one size; ask about two other sizes of the
         same thing. The lesson is the conflict: a tiny one of a floater, a
         giant one of a sinker. */
      const pool = ITEMS.filter((x) => x.grow && verdict(x, 'water'));
      const item = teach ? itemById(i === 0 ? 'log' : 'rock') : pickOne(rng, pool);
      if (!item) return null;
      const v = verdict(item, 'water');
      /* Shown big when it floats and small when it sinks, so the question
         asks the other way round from what weight alone would say. */
      const shown = teach ? (v === 'float' ? 5 : 1) : pickOne(rng, SIZES);
      const rest = shuffled(rng, SIZES.filter((s) => s !== shown));
      const ask = teach ? [v === 'float' ? 1 : 5] : rest.slice(0, i < 15 ? 1 : 2).sort((a, b) => a - b);
      return { kind: 'same', item: item.id, shown, ask };
    }
    case 'm1': {
      /* Something sinks (or floats): which one change makes it do the other? */
      const goal = teach || rng() < 0.75 ? 'float' : 'sink';
      const pool = ITEMS.filter((x) => verdict(x, 'water') === (goal === 'float' ? 'sink' : 'float') && x.id !== 'hippo' && x.id !== 'ship');
      const item = teach ? itemById(i === 0 ? 'clay' : 'egg') : pickOne(rng, pool);
      if (!item) return null;
      const q = { item: item.id, goal };
      const good = FIXES[goal].filter((f) => fixWorks(q, f) === true);
      /* The always-works fixes are kept for things nothing else helps. */
      const real = good.filter((f) => f !== 'float' && f !== 'stone');
      const answer = real.length ? pickOne(rng, real) : good[0];
      if (!answer) return null;
      /* Two that surely do not work: "never" ones, or real fixes that fail here. */
      const wrongReal = ['salt', 'honey'].filter((f) => fixWorks(q, f) === false);
      const wrong = shuffled(rng, [...FIXES.never, ...wrongReal, ...wrongReal]).filter((f, k, a) => a.indexOf(f) === k).slice(0, 2);
      return { kind: 'fix', item: item.id, liq: 'water', goal, opts: shuffled(rng, [answer, ...wrong]) };
    }
    case 'm2': {
      /* Two or three rafts of cubes; each water cube weighs 1. */
      const n = teach ? 2 : i < 14 ? 2 : 3;
      const rafts = [];
      for (let k = 0; k < n; k++) {
        const w = 1 + randInt(rng, 3);
        const h = 1 + randInt(rng, 3);
        const V = w * h;
        if (V < 2) { k--; continue; }
        /* Close calls later in the chapter: one cube either side. */
        const spread = i < 10 ? 4 : 2;
        let wt = V + (rng() < 0.5 ? -1 : 1) * (1 + randInt(rng, spread));
        if (wt < 1) wt = V + 1;
        rafts.push({ w, h, wt });
      }
      if (teach) return { kind: 'cubes', rafts: i === 0 ? [{ w: 2, h: 2, wt: 2 }, { w: 2, h: 1, wt: 5 }] : [{ w: 3, h: 2, wt: 4 }, { w: 1, h: 2, wt: 3 }] };
      const v = rafts.map((r) => (r.wt < r.w * r.h ? 'float' : 'sink'));
      if (!v.includes('float') || !v.includes('sink')) return makePuzzle(ch, rng, i);
      return { kind: 'cubes', rafts };
    }
    case 'm3': {
      /* One raft that floats; how many rows of cubes are under water?
         It sinks until the water pushed away weighs as much as the raft. */
      if (teach) return i === 0 ? { kind: 'depth', w: 2, h: 3, wt: 2 } : { kind: 'depth', w: 3, h: 3, wt: 6 };
      const w = 1 + randInt(rng, 4);
      const h = 3 + randInt(rng, i < 15 ? 2 : 4);
      const rows = 1 + randInt(rng, h - 1);
      return { kind: 'depth', w, h, wt: rows * w };
    }
    case 'h1': {
      /* Real things with their heaviness on the card, in one of three liquids. */
      const liq = teach ? (i === 0 ? 'water' : 'salty') : pickOne(rng, ['water', 'water', 'salty', 'oil']);
      const items = teach
        ? (i === 0 ? ['pencil', 'potato', 'coin'] : ['potato', 'bowling16', 'candle'])
        : makeTray(rng, { n: i < 15 ? 3 : 4, liq, pool: ITEMS.filter((x) => x.d) });
      return items && { kind: 'tray', liq, num: true, items };
    }
    case 'h2': {
      /* Three mystery blocks, each with its heaviness, and the honey jar. */
      if (teach) return { kind: 'layers', blocks: i === 0 ? [50, 120, 200] : [80, 96, 150] };
      const pick = new Set();
      const blocks = [];
      for (let tries = 0; blocks.length < 3 && tries < 100; tries++) {
        const d = 10 * (2 + randInt(rng, 19));            // 0.2 to 2.0 in steps of 0.1
        const extra = rng() < 0.3 ? 5 : 0;                 // sometimes 0.95, 1.25...
        const v = d + extra;
        if (layerOf(v) === null || pick.has(v)) continue;
        pick.add(v);
        blocks.push(v);
      }
      if (new Set(blocks.map(layerOf)).size < (i < 12 ? 2 : 3)) return makePuzzle(ch, rng, i);
      return { kind: 'layers', blocks };
    }
    case 'h3': {
      /* A block of known heaviness in a liquid of known heaviness: the part
         under is one over the other, and it is one of the choices. */
      if (teach) return i === 0
        ? { kind: 'frac', d: 50, liq: 'water', liqD: 100, opts: [[1, 4], [1, 2], [3, 4]] }
        : { kind: 'frac', d: 90, liq: 'water', liqD: 100, opts: [[1, 2], [3, 4], [9, 10]], ice: true };
      const liq = pickOne(rng, i < 12 ? ['water'] : ['water', 'salty']);
      const liqD = LIQUIDS[liq].d;
      const ok = FRACTIONS.filter(([a, b]) => (a * liqD) % b === 0);
      const f = pickOne(rng, ok);
      const d = (f[0] * liqD) / f[1];
      const others = shuffled(rng, FRACTIONS.filter((g) => g[0] * f[1] !== g[1] * f[0])).slice(0, 2);
      const opts = [f, ...others].sort((a, b) => a[0] / a[1] - b[0] / b[1]);
      return { kind: 'frac', d, liq, liqD, opts };
    }
    default: return null;
  }
}

/** The same experiment, from its chapter and number: the bank's seed. */
export const makeAt = (chId, i, ...seed) => makePuzzle(chapter(chId), rngFor('pond', chId, i, ...seed), i);

/** A key for spotting a repeated experiment. */
export function sig(p) {
  switch (p.kind) {
    case 'tray': return `${p.kind}|${p.liq}|${p.twin ? 1 : 0}|${p.num ? 1 : 0}|${[...p.items].sort().join(',')}`;
    case 'same': return `same|${p.item}|${p.shown}|${p.ask.join(',')}`;
    case 'cubes': return `cubes|${p.rafts.map((r) => `${r.w}x${r.h}:${r.wt}`).sort().join(',')}`;
    case 'depth': return `depth|${p.w}x${p.h}:${p.wt}`;
    case 'fix': return `fix|${p.item}|${p.goal}|${[...p.opts].sort().join(',')}`;
    case 'layers': return `layers|${[...p.blocks].sort((a, b) => a - b).join(',')}`;
    case 'frac': return `frac|${p.d}|${p.liq}|${p.opts.map((f) => f.join('/')).join(',')}`;
    default: return JSON.stringify(p);
  }
}

/* ------------------------------------------------------------------ */
/* Proof                                                               */
/* ------------------------------------------------------------------ */

/**
 * Everything wrong with one experiment, as sentences; [] if it is sound.
 * Every question must have exactly one right choice, and that choice must
 * be one the game can stand behind: no thing shown in a liquid it is too
 * close to, no fix that half-works.
 */
export function problems(p) {
  const errs = [];
  const err = (m) => errs.push(m);
  const ans = answers(p);
  const ch = choices(p);
  if (!ans.length) err('no questions');
  ans.forEach((a, k) => {
    if (a === null || a === undefined || a < 0) err(`question ${k + 1} has no answer the game can stand behind`);
    else if (!ch[k].includes(a)) err(`question ${k + 1}: answer ${a} is not one of the choices`);
  });
  switch (p.kind) {
    case 'tray': {
      if (!LIQUIDS[p.liq]) err(`no liquid "${p.liq}"`);
      const missing = p.items.filter((id) => !itemById(id));
      if (missing.length) { err(`unknown things: ${missing.join(', ')}`); break; }
      if (new Set(p.items).size !== p.items.length) err('a thing is on the tray twice');
      if (!ans.includes('float') || !ans.includes('sink')) err('the tray needs something that floats and something that sinks');
      if (p.num && p.items.some((id) => !itemById(id).d)) err('a card with a number needs a sourced number');
      break;
    }
    case 'same': {
      const item = itemById(p.item);
      if (!item) { err(`unknown thing ${p.item}`); break; }
      if (!item.grow) err(`${p.item} cannot be shown at other sizes`);
      if (p.ask.includes(p.shown)) err('asks about the size it shows');
      break;
    }
    case 'cubes':
      for (const r of p.rafts) if (r.wt === r.w * r.h) err('a raft exactly as heavy as its water twin neither floats nor sinks');
      break;
    case 'depth':
      if (p.wt >= p.w * p.h) err('the raft does not float');
      if (p.wt % p.w) err('the waterline is not on a row');
      break;
    case 'fix': {
      const item = itemById(p.item);
      if (!item) { err(`unknown thing ${p.item}`); break; }
      const now = verdict(item, p.liq);
      if (now !== (p.goal === 'float' ? 'sink' : 'float')) err(`${p.item} already does what the goal asks`);
      const works = p.opts.filter((o) => fixWorks(p, o) === true);
      if (works.length !== 1) err(`${works.length} of the changes work, not one`);
      const unsure = p.opts.filter((o) => fixWorks(p, o) === null);
      if (unsure.length) err(`no source says what ${unsure.join(', ')} would do`);
      break;
    }
    case 'layers':
      if (new Set(p.blocks).size !== p.blocks.length) err('two blocks are the same');
      break;
    case 'frac': {
      if (p.d >= p.liqD) err('the block does not float');
      const n = p.opts.filter((f) => f[0] * p.liqD === f[1] * p.d).length;
      if (n !== 1) err(`${n} of the choices are right`);
      break;
    }
    default: err(`unknown kind ${p.kind}`);
  }
  return errs;
}

/* ------------------------------------------------------------------ */
/* Stars                                                               */
/* ------------------------------------------------------------------ */

/**
 * 3 with nothing wrong and no help, 2 with one slip or one hint, 1 after
 * that. A teaching experiment is always 3: it is there to show the idea.
 */
export function starsFor({ wrong = 0, hints = 0, teach = false } = {}) {
  if (teach) return 3;
  const n = wrong + hints;
  return n === 0 ? 3 : n === 1 ? 2 : 1;
}

export default {
  LEVELS, LIQUIDS, MARGIN, ITEMS, itemById, verdict, shownDensity, CHAPTER_SIZE, TEACH, CHAPTERS, chapter,
  LAYERS, layerOf, FRACTIONS, answers, choices, FIXES, fixWorks, makePuzzle, makeAt, sig, problems, starsFor
};
