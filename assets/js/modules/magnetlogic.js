/**
 * magnetlogic.js — Magnet Meerkats: bar magnets, ring towers, things that
 * stick, and the repulsion test.
 *
 * The rules come from research-circuits-magnets.md part B:
 *   - every magnet has an N end and an S end; different ends pull together
 *     (hug), the same ends push apart;
 *   - end to end, two magnets hug when they point the same way; side by side,
 *     they hug when they point opposite ways (section 6.3);
 *   - a magnet pulls a steel bowl with either end, and steel never pushes;
 *     wood does nothing (section 8.1);
 *   - ring magnets on a pole float when the same faces meet (section 8.2);
 *   - magnets pull iron and steel, not every metal (section 6.1, the SAFE
 *     rows only: no coins, keys, spoons, scissors or jewellery);
 *   - the pull goes through paper, wood, water, glass and plastic, and gets
 *     weaker the farther it goes; size does not tell strength (section 8.4);
 *   - only a magnet can push another magnet; iron is pulled by both ends
 *     (section 8.3);
 *   - a compass needle's N end points along the field, which runs from the
 *     magnet's N end round to its S end (section 8.6).
 *
 * Pure: no DOM, no Math.random.
 */

import { pickOne, randInt, rngFor, shuffled } from './logicrng.js';

export const LEVELS = ['easy', 'medium', 'hard'];

/* ------------------------------------------------------------------ */
/* Bar magnets on a grid (Huddle)                                      */
/* ------------------------------------------------------------------ */

/*
 * A board is { w, h, cells }, cells row by row:
 *   '.'  an empty spot      'w'  a wooden crate     's'  a steel bowl
 *   'h1' a magnet lying across, its N end to the right (h0: N to the left)
 *   'v1' a magnet standing up and down, its N end at the bottom (v0: at the top)
 *   a trailing 'g' means glued: it cannot be turned.
 * For a magnet that is not glued, the number is how it starts.
 */
export const isMagnet = (c) => typeof c === 'string' && (c[0] === 'h' || c[0] === 'v');
export const axisOf = (c) => c[0];
export const dirOf = (c) => Number(c[1]);
export const isGlued = (c) => isMagnet(c) && c.endsWith('g');
export const magnetCell = (axis, d, glued = false) => `${axis}${d}${glued ? 'g' : ''}`;

/**
 * Every touching pair on the board: { a, b, type } with a < b, where type is
 * 'end' (end to end), 'side' (side by side), 'steel' (a magnet and a steel
 * bowl) or 'tee' (a magnet's end against another's middle: never made).
 */
export function contacts(board) {
  const { w, h, cells } = board;
  const out = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      for (const [dx, dy, along] of [[1, 0, 'h'], [0, 1, 'v']]) {
        if (x + dx >= w || y + dy >= h) continue;
        const j = (y + dy) * w + x + dx;
        const A = cells[i];
        const B = cells[j];
        if (isMagnet(A) && isMagnet(B)) {
          if (axisOf(A) !== axisOf(B)) out.push({ a: i, b: j, type: 'tee' });
          else out.push({ a: i, b: j, type: axisOf(A) === along ? 'end' : 'side' });
        } else if ((isMagnet(A) && B === 's') || (A === 's' && isMagnet(B))) {
          out.push({ a: i, b: j, type: 'steel' });
        }
      }
    }
  }
  return out;
}

export const contactKey = (c) => `${c.a}-${c.b}`;

/** Do these two touch as a hug? End to end: same way. Side by side: opposite ways. Steel: always. */
export function hugs(type, da, db) {
  if (type === 'steel') return true;
  if (type === 'end') return da === db;
  if (type === 'side') return da !== db;
  return null;
}

/** The directions the cells have now (or a list of directions to use instead). */
export const dirsOf = (board, dirs = null) => board.cells.map((c, i) => (isMagnet(c) ? (dirs ? dirs[i] : dirOf(c)) : null));

/** What each contact does with these directions: { key: 'hug' | 'push' }. */
export function outcome(board, dirs) {
  const out = {};
  for (const c of contacts(board)) {
    const hug = hugs(c.type, dirs[c.a], dirs[c.b]);
    if (hug !== null) out[contactKey(c)] = hug ? 'hug' : 'push';
  }
  return out;
}

/**
 * The answer: one direction per magnet, from the glued ones through the
 * goal card. { dirs, unique, ok }: ok false when the card cannot be met,
 * unique false when some magnets are not tied to a glued one.
 */
export function solveHuddle(board, goals) {
  const { cells } = board;
  const dirs = cells.map((c) => (isGlued(c) ? dirOf(c) : null));
  const links = cells.map(() => []);
  for (const c of contacts(board)) {
    if (c.type !== 'end' && c.type !== 'side') continue;
    const want = goals[contactKey(c)];
    if (!want) continue;
    /* same: the two point the same way. */
    const same = (c.type === 'end') === (want === 'hug');
    links[c.a].push([c.b, same]);
    links[c.b].push([c.a, same]);
  }
  let ok = true;
  const queue = dirs.map((d, i) => (d === null ? -1 : i)).filter((i) => i >= 0);
  while (queue.length) {
    const i = queue.shift();
    for (const [j, same] of links[i]) {
      const want = same ? dirs[i] : 1 - dirs[i];
      if (dirs[j] === null) { dirs[j] = want; queue.push(j); } else if (dirs[j] !== want) ok = false;
    }
  }
  /* Steel always hugs: a goal of push there can never be met. */
  for (const c of contacts(board)) if (c.type === 'steel' && goals[contactKey(c)] === 'push') ok = false;
  const unique = cells.every((c, i) => !isMagnet(c) || dirs[i] !== null);
  return { dirs, ok, unique };
}

/** Groups of magnets joined by magnet-to-magnet contacts. */
export function groups(board) {
  const parent = board.cells.map((_, i) => i);
  const find = (i) => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  for (const c of contacts(board)) if (c.type === 'end' || c.type === 'side') parent[find(c.a)] = find(c.b);
  const out = new Map();
  board.cells.forEach((c, i) => {
    if (!isMagnet(c)) return;
    const r = find(i);
    if (!out.has(r)) out.set(r, []);
    out.get(r).push(i);
  });
  return [...out.values()];
}

/* ------------------------------------------------------------------ */
/* Ring towers                                                         */
/* ------------------------------------------------------------------ */

/* A ring is 1 with its N face up, 0 with it down. Ring 0 is at the bottom,
   glued. Two rings float when the same faces meet. */
export const floats = (below, above) => below !== above;
export function solveTower(p) {
  const rings = [p.rings[0]];
  p.gaps.forEach((g, k) => rings.push(g === 'float' ? 1 - rings[k] : rings[k]));
  return rings;
}
export const towerGaps = (rings) => rings.slice(1).map((b, k) => (floats(rings[k], b) ? 'float' : 'touch'));

/* ------------------------------------------------------------------ */
/* Things that stick (SAFE rows only)                                  */
/* ------------------------------------------------------------------ */

/* metal: is it a metal; sticks: does a classroom magnet pull it. */
export const THINGS = [
  { id: 'clip', metal: true, sticks: true, emoji: '📎' },
  { id: 'nail', metal: true, sticks: true },
  { id: 'steelcan', metal: true, sticks: true, emoji: '🥫' },
  { id: 'foil', metal: true, sticks: false },
  { id: 'alcan', metal: true, sticks: false },
  { id: 'copperwire', metal: true, sticks: false },
  { id: 'copperpipe', metal: true, sticks: false },
  { id: 'gold', metal: true, sticks: false },
  { id: 'silver', metal: true, sticks: false },
  { id: 'wood', metal: false, sticks: false, emoji: '🪵' },
  { id: 'pencil', metal: false, sticks: false, emoji: '✏️' },
  { id: 'paper', metal: false, sticks: false, emoji: '📄' },
  { id: 'sock', metal: false, sticks: false, emoji: '🧦' },
  { id: 'balloon', metal: false, sticks: false, emoji: '🎈' },
  { id: 'grapes', metal: false, sticks: false, emoji: '🍇' },
  { id: 'cup', metal: false, sticks: false, emoji: '🥤' },
  { id: 'crayon', metal: false, sticks: false, emoji: '🖍️' }
];
export const thing = (id) => THINGS.find((x) => x.id === id) || null;

/* ------------------------------------------------------------------ */
/* Reach                                                               */
/* ------------------------------------------------------------------ */

/* Each layer is one step thick; a magnet drags the clip under the stack
   when its strength (⚡) is at least the number of layers. */
export const LAYERS = ['paper', 'wood', 'water', 'glass', 'plastic'];
export const reaches = (strength, layers) => strength >= layers;

/* ------------------------------------------------------------------ */
/* Which is the magnet?                                                */
/* ------------------------------------------------------------------ */

/* A bar is 'magnet', 'iron' or 'plain' (aluminium, drawn the same). Each bar
   has a dot end (0) and a ring end (1); a magnet's bit says which is N. */
export const BAR_TYPES = ['magnet', 'iron', 'plain'];

/** What happens when end ea of bar a meets end eb of bar b. */
export function meet(ta, na, ea, tb, nb, eb) {
  if (ta === 'plain' || tb === 'plain') return 'nothing';
  if (ta === 'iron' && tb === 'iron') return 'nothing';
  if (ta === 'iron' || tb === 'iron') return 'pull';
  const poleA = ea === na ? 'N' : 'S';
  const poleB = eb === nb ? 'N' : 'S';
  return poleA === poleB ? 'push' : 'pull';
}

/** Every type list (with N ends for the magnets) that fits all the cards. */
export function whichSolutions(n, cards, limit = Infinity) {
  const out = [];
  const total = 3 ** n;
  for (let code = 0; code < total && out.length < limit; code++) {
    const types = [];
    let c = code;
    for (let k = 0; k < n; k++) { types.push(BAR_TYPES[c % 3]); c = Math.floor(c / 3); }
    const mags = types.map((t, k) => (t === 'magnet' ? k : -1)).filter((k) => k >= 0);
    for (let bits = 0; bits < 2 ** mags.length && out.length < limit; bits++) {
      const ns = types.map(() => 0);
      mags.forEach((k, j) => { ns[k] = (bits >> j) & 1; });
      if (cards.every((o) => meet(types[o.a], ns[o.a], o.ea, types[o.b], ns[o.b], o.eb) === o.res)) out.push({ types, ns });
    }
  }
  return out;
}

/** The bar types if the cards fix them, or null. */
export function whichAnswer(n, cards) {
  const sols = whichSolutions(n, cards);
  if (!sols.length) return null;
  const key = sols[0].types.join(',');
  return sols.every((s) => s.types.join(',') === key) ? sols[0].types : null;
}

/* ------------------------------------------------------------------ */
/* Compass                                                             */
/* ------------------------------------------------------------------ */

/*
 * A magnet lying across (h) or up and down (v); n = 1 puts its N end at the
 * right (h) or the bottom (v). A compass sits beyond one end on the magnet's
 * line ('endP' right or bottom, 'endM' left or top) or beside its middle
 * ('sideP' below or right, 'sideM' above or left).
 * On the line, the needle's N points the way the magnet points, S end to N
 * end: away from an N end, towards an S end. Beside the middle, it points
 * the other way, towards the magnet's S end.
 * Arrows: 0 up, 1 right, 2 down, 3 left.
 */
export const SPOTS = ['endP', 'endM', 'sideP', 'sideM'];
export function needle(ax, n, spot) {
  const plus = ax === 'h' ? 1 : 2;
  const along = n === 1 ? plus : (plus + 2) % 4;
  return spot.startsWith('end') ? along : (along + 2) % 4;
}

/* ------------------------------------------------------------------ */
/* Chapters                                                            */
/* ------------------------------------------------------------------ */

export const CHAPTER_SIZE = 30;
export const TEACH = 2;
export const sizeOf = (ch) => ch.size || CHAPTER_SIZE;

/*   pair     hug or push? predict each gap
     huddle   turn the magnets to match the card (line, side by side, mixed)
     stick    which things stick?
     reach    which magnet drags the clip through the layers?
     tower    turn the rings to match the floating tower
     which    which bar is the magnet?
     compass  where does the needle point? which end is N? */
export const CHAPTERS = {
  easy: [
    { id: 'e1', kind: 'pair', icon: '🧲' },
    { id: 'e2', kind: 'huddle', icon: '🤗', mode: 'line' },
    { id: 'e3', kind: 'stick', icon: '📎' }
  ],
  medium: [
    { id: 'm1', kind: 'huddle', icon: '↔️', mode: 'side' },
    { id: 'm2', kind: 'reach', icon: '⚡' },
    { id: 'm3', kind: 'tower', icon: '🗼' }
  ],
  hard: [
    { id: 'h1', kind: 'huddle', icon: '🧩', mode: 'mixed' },
    { id: 'h2', kind: 'which', icon: '🕵️' },
    { id: 'h3', kind: 'compass', icon: '🧭', size: 24 }
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

/** A start for the free magnets that needs at least `min` of them turned. */
function scramble(rng, board, dirs, min) {
  const free = board.cells.map((c, i) => (isMagnet(c) && !isGlued(c) ? i : -1)).filter((i) => i >= 0);
  if (free.length < min) return null;
  const flip = new Set(shuffled(rng, free).slice(0, min + randInt(rng, free.length - min + 1)));
  return board.cells.map((c, i) => {
    if (!isMagnet(c)) return c;
    if (isGlued(c)) return c;
    return magnetCell(axisOf(c), flip.has(i) ? 1 - dirs[i] : dirs[i]);
  });
}

/** A huddle from a laid-out board: glue, an answer, the card and a start. */
function finishHuddle(rng, board, { glue = 1, allHug = true, minFlips = 1, glueAt = null }) {
  const gs = groups(board);
  const cells = board.cells.slice();
  const dirs = cells.map((c) => (isMagnet(c) ? dirOf(c) : null));
  for (const g of gs) {
    const glued = glueAt ? g.filter((i) => glueAt.includes(i)) : shuffled(rng, g).slice(0, Math.min(glue, g.length - 1 || 1));
    const base = glueAt ? 1 : randInt(rng, 2);
    for (const i of g) {
      if (allHug) {
        /* Everyone hugs: across magnets alternate by row, up-and-down ones by column. */
        const x = i % board.w;
        const y = Math.floor(i / board.w);
        dirs[i] = base ^ ((axisOf(cells[i]) === 'h' ? y : x) % 2);
      } else {
        dirs[i] = randInt(rng, 2);
      }
    }
    for (const i of glued) cells[i] = magnetCell(axisOf(cells[i]), dirs[i], true);
  }
  const solved = { ...board, cells: cells.map((c, i) => (isMagnet(c) && !isGlued(c) ? magnetCell(axisOf(c), dirs[i]) : c)) };
  const goals = outcome(solved, dirs);
  const start = scramble(rng, solved, dirs, minFlips);
  if (!start) return null;
  return { kind: 'huddle', w: board.w, h: board.h, cells: start, goals };
}

/** A random board of w × h: magnets on one or two axes, never touching end to middle. */
function layBoard(rng, w, h, { fill = 0.75, axes = ['h'], wood = 0, steel = 0 }) {
  const cells = [];
  for (let i = 0; i < w * h; i++) {
    const r = rng();
    if (r < fill) cells.push(magnetCell(pickOne(rng, axes), 0));
    else if (r < fill + wood) cells.push('w');
    else if (r < fill + wood + steel) cells.push('s');
    else cells.push('.');
  }
  const board = { w, h, cells };
  /* No end-to-middle touches: the later magnet of such a pair goes. */
  for (const c of contacts(board)) if (c.type === 'tee') cells[c.b] = '.';
  /* A magnet with no other magnet to touch is not part of the puzzle. */
  const joined = new Set(contacts(board).filter((c) => c.type === 'end' || c.type === 'side').flatMap((c) => [c.a, c.b]));
  cells.forEach((c, i) => { if (isMagnet(c) && !joined.has(i)) cells[i] = '.'; });
  /* A steel bowl with no magnet beside it is just furniture: keep a few only. */
  return board;
}

const countOf = (cells, f) => cells.filter(f).length;

function makeHuddle(ch, rng, i, teach) {
  if (ch.mode === 'line') {
    if (teach) {
      /* M3: two magnets, the left glued with N to the right. M4: four in a row. */
      const n = i === 0 ? 2 : 4;
      const board = { w: n, h: 1, cells: Array.from({ length: n }, () => 'h1') };
      return finishHuddle(rng, board, { glueAt: [0], minFlips: i === 0 ? 1 : 2 });
    }
    /* A row of 3 to 5 (or a column of 3 or 4), sometimes cut in two by a
       crate or a gap; later, two rows with an empty row between. Never
       wider than 5, so every magnet stays big enough to tap on a phone. */
    const line = (n) => {
      const cells = Array.from({ length: n }, () => 'h0');
      if (n === 5 && rng() < 0.5) cells[2] = pickOne(rng, ['.', 'w']);
      return cells;
    };
    let board;
    if (i >= 12 && rng() < 0.5) {
      const a = line(3 + randInt(rng, 3));
      const b2 = line(3 + randInt(rng, 3));
      const w = Math.max(a.length, b2.length);
      const pad = (r) => [...r, ...Array(w - r.length).fill('.')];
      board = { w, h: 3, cells: [...pad(a), ...Array(w).fill('.'), ...pad(b2)] };
    } else if (rng() < 0.3) {
      const n = 3 + randInt(rng, 2);
      board = { w: 1, h: n, cells: Array.from({ length: n }, () => 'v0') };
    } else {
      const cells = line(3 + randInt(rng, i < 8 ? 2 : 3));
      board = { w: cells.length, h: 1, cells };
    }
    if (contacts(board).some((c) => c.type === 'tee')) return null;
    if (groups(board).some((g) => g.length < 2)) return null;
    const mags = countOf(board.cells, isMagnet);
    return finishHuddle(rng, board, { minFlips: Math.max(1, Math.floor(mags / 3)) });
  }
  if (ch.mode === 'side') {
    if (teach) {
      /* M5: two side by side, one glued. Then a square of four. */
      const board = i === 0 ? { w: 1, h: 2, cells: ['h0', 'h0'] } : { w: 2, h: 2, cells: ['h0', 'h0', 'h0', 'h0'] };
      return finishHuddle(rng, board, { glueAt: [0], minFlips: i === 0 ? 1 : 2 });
    }
    const w = 2 + randInt(rng, 2) + (i > 14 ? 1 : 0);
    const h = 2 + randInt(rng, 2);
    const board = layBoard(rng, w, h, { fill: 0.8, axes: rng() < 0.3 ? ['v'] : ['h'], wood: 0.08 });
    const mags = countOf(board.cells, isMagnet);
    if (mags < 3 || mags > 8) return null;
    if (!contacts(board).some((c) => c.type === 'side')) return null;
    return finishHuddle(rng, board, { minFlips: Math.max(1, Math.floor(mags / 3)) });
  }
  /* mixed: hugs and pushes, steel bowls and crates, two kinds of magnet. */
  if (teach) {
    const board = i === 0 ? { w: 3, h: 1, cells: ['h0', 'h0', 'h0'] } : { w: 3, h: 2, cells: ['h0', 'h0', 's', 'h0', 'h0', '.'] };
    const p = finishHuddle(rng, board, { glueAt: [0], allHug: false, minFlips: 1 });
    if (!p) return null;
    const vals = Object.values(p.goals);
    return vals.includes('hug') && vals.includes('push') ? p : null;
  }
  const w = 3 + randInt(rng, 2) + (i > 15 ? 1 : 0);
  const h = 2 + randInt(rng, 2);
  const board = layBoard(rng, w, h, { fill: 0.72, axes: rng() < 0.5 ? ['h', 'v'] : ['h'], wood: 0.08, steel: 0.12 });
  const mags = countOf(board.cells, isMagnet);
  if (mags < 4 || mags > 11) return null;
  const p = finishHuddle(rng, board, { allHug: false, minFlips: Math.max(2, Math.floor(mags / 3)) });
  if (!p) return null;
  const vals = Object.values(p.goals);
  if (vals.filter((v) => v === 'push').length < 1 || vals.filter((v) => v === 'hug').length < 2) return null;
  return p;
}

function makePair(rng, i, teach) {
  /* A row of 2 to 4 magnets with a gap between each: hug or push at each gap? */
  if (teach) return { kind: 'pair', axis: 'h', dirs: i === 0 ? [1, 1] : [1, 0] };
  const n = i < 12 ? 2 + randInt(rng, 2) : 3 + randInt(rng, 2);
  return { kind: 'pair', axis: rng() < 0.3 ? 'v' : 'h', dirs: Array.from({ length: n }, () => randInt(rng, 2)) };
}

function makeStick(rng, i, teach) {
  if (teach) {
    return i === 0
      ? { kind: 'stick', things: ['clip', 'foil', 'copperwire', 'nail', 'wood', 'cup'] }
      : { kind: 'stick', things: ['foil', 'clip', 'silver', 'steelcan'] };
  }
  const n = 4 + randInt(rng, 2) + (i > 15 ? 1 : 0);
  const stick = shuffled(rng, THINGS.filter((x) => x.sticks));
  const metal = shuffled(rng, THINGS.filter((x) => x.metal && !x.sticks));
  const other = shuffled(rng, THINGS.filter((x) => !x.metal));
  const a = 1 + randInt(rng, 2);
  const b = 1 + randInt(rng, 2);
  const picked = [...stick.slice(0, a), ...metal.slice(0, b), ...other.slice(0, Math.max(1, n - a - b))];
  return { kind: 'stick', things: shuffled(rng, picked).map((x) => x.id) };
}

function makeReach(rng, i, teach) {
  if (teach) {
    return i === 0
      ? { kind: 'reach', layers: ['paper', 'water'], mags: [{ s: 1, size: 3 }, { s: 3, size: 1 }, { s: 1, size: 2 }] }
      : { kind: 'reach', layers: ['paper', 'wood', 'water'], mags: [{ s: 2, size: 2 }, { s: 4, size: 1 }, { s: 1, size: 3 }] };
  }
  const d = 2 + randInt(rng, i < 10 ? 2 : 3);
  const strong = d + randInt(rng, 5 - d);
  const weak = () => 1 + randInt(rng, d - 1);
  const sizes = shuffled(rng, [1, 2, 3]);
  const mags = shuffled(rng, [strong, weak(), weak()]).map((s, k) => ({ s, size: sizes[k] }));
  const layers = Array.from({ length: d }, () => pickOne(rng, LAYERS));
  return { kind: 'reach', layers, mags };
}

function makeTower(rng, i, teach) {
  if (teach) {
    return i === 0
      ? { kind: 'tower', rings: [1, 1, 0], gaps: ['float', 'touch'] }
      : { kind: 'tower', rings: [0, 0, 0, 0], gaps: ['float', 'float', 'float'] };
  }
  const n = 3 + Math.min(3, Math.floor(i / 7)) + randInt(rng, 2);
  const solution = [randInt(rng, 2)];
  for (let k = 1; k < n; k++) solution.push(randInt(rng, 2));
  const gaps = towerGaps(solution);
  const free = n - 1;
  const flips = new Set(shuffled(rng, Array.from({ length: free }, (_, k) => k + 1)).slice(0, 1 + randInt(rng, free)));
  const rings = solution.map((b, k) => (flips.has(k) ? 1 - b : b));
  return { kind: 'tower', rings, gaps };
}

function makeWhich(rng, i, teach) {
  if (teach) {
    /* M10, and a gentler one: A and B push, so both are magnets; C does nothing to A. */
    return i === 0
      ? { kind: 'which', n: 3, cards: [{ a: 0, ea: 0, b: 1, eb: 0, res: 'push' }, { a: 0, ea: 0, b: 2, eb: 0, res: 'pull' }, { a: 0, ea: 1, b: 2, eb: 0, res: 'pull' }] }
      : { kind: 'which', n: 3, cards: [{ a: 0, ea: 1, b: 1, eb: 1, res: 'push' }, { a: 2, ea: 0, b: 0, eb: 1, res: 'nothing' }] };
  }
  const n = i < 14 ? 3 : 3 + randInt(rng, 2);
  const types = Array.from({ length: n }, () => pickOne(rng, BAR_TYPES));
  if (!types.includes('magnet')) types[randInt(rng, n)] = 'magnet';
  if (new Set(types).size < 2) return null;
  const ns = types.map(() => randInt(rng, 2));
  const all = [];
  for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) for (let ea = 0; ea < 2; ea++) for (let eb = 0; eb < 2; eb++) all.push({ a, ea, b, eb });
  const cards = [];
  for (const o of shuffled(rng, all)) {
    if (whichAnswer(n, cards)) break;
    const res = meet(types[o.a], ns[o.a], o.ea, types[o.b], ns[o.b], o.eb);
    cards.push(rng() < 0.5 ? { ...o, res } : { a: o.b, ea: o.eb, b: o.a, eb: o.ea, res });
  }
  if (!whichAnswer(n, cards)) return null;
  /* Drop any card the answer does not need. */
  for (let k = cards.length - 1; k >= 0; k--) {
    const fewer = cards.filter((_, j) => j !== k);
    if (whichAnswer(n, fewer)) cards.splice(k, 1);
  }
  if (cards.length < 2 || cards.length > 5) return null;
  return { kind: 'which', n, cards };
}

function makeCompass(rng, i, teach) {
  if (teach) {
    return i === 0
      ? { kind: 'compass', q: 'needle', ax: 'h', n: 1, spot: 'endP' }
      : { kind: 'compass', q: 'find', ax: 'h', n: 0, spot: 'sideM' };
  }
  return { kind: 'compass', q: rng() < 0.5 ? 'needle' : 'find', ax: rng() < 0.5 ? 'h' : 'v', n: randInt(rng, 2), spot: pickOne(rng, SPOTS) };
}

export function makePuzzle(ch, rng, i = TEACH) {
  const teach = i < TEACH;
  for (let tries = 0; tries < 200; tries++) {
    let p = null;
    switch (ch.kind) {
      case 'pair': p = makePair(rng, i, teach); break;
      case 'huddle': p = makeHuddle(ch, rng, i, teach); break;
      case 'stick': p = makeStick(rng, i, teach); break;
      case 'reach': p = makeReach(rng, i, teach); break;
      case 'tower': p = makeTower(rng, i, teach); break;
      case 'which': p = makeWhich(rng, i, teach); break;
      case 'compass': p = makeCompass(rng, i, teach); break;
      default: return null;
    }
    if (p && !problems(p).length) return p;
  }
  return null;
}

export const makeAt = (chId, i, ...seed) => makePuzzle(chapter(chId), rngFor('magnet', chId, i, ...seed), i);

/** Same experiment, same key. A huddle's start does not make it a new one. */
export function sig(p) {
  const rest = { ...p };
  if (p.kind === 'huddle') rest.cells = p.cells.map((c) => (isMagnet(c) && !isGlued(c) ? `${axisOf(c)}?` : c));
  if (p.kind === 'tower') rest.rings = [p.rings[0]];
  return JSON.stringify(Object.keys(rest).sort().map((k) => [k, rest[k]]));
}

/* ------------------------------------------------------------------ */
/* Answers and proof                                                   */
/* ------------------------------------------------------------------ */

/** The answer: per question, the right choice (or, for huddle and tower, the directions). */
export function answers(p) {
  switch (p.kind) {
    case 'pair': return p.dirs.slice(1).map((d, k) => (hugs('end', p.dirs[k], d) ? 'hug' : 'push'));
    case 'huddle': return solveHuddle(p, p.goals).dirs;
    case 'stick': return p.things.map((id) => (thing(id).sticks ? 'yes' : 'no'));
    case 'reach': return [p.mags.findIndex((m) => reaches(m.s, p.layers.length))];
    case 'tower': return solveTower(p);
    case 'which': return whichAnswer(p.n, p.cards) || [];
    case 'compass': {
      const arrow = needle(p.ax, p.n, p.spot);
      return [p.q === 'needle' ? arrow : p.n];
    }
    default: return [];
  }
}

/** The choices for each question (none for huddle and tower, which are built). */
export function choices(p) {
  switch (p.kind) {
    case 'pair': return p.dirs.slice(1).map(() => ['hug', 'push']);
    case 'stick': return p.things.map(() => ['yes', 'no']);
    case 'reach': return [p.mags.map((_, k) => k)];
    case 'which': return Array.from({ length: p.n }, () => BAR_TYPES.slice());
    case 'compass': return [p.q === 'needle' ? [0, 1, 2, 3] : [0, 1]];
    default: return [];
  }
}

export function problems(p) {
  const errs = [];
  const err = (m) => errs.push(m);
  switch (p.kind) {
    case 'pair':
      if (p.dirs.length < 2 || p.dirs.length > 4) err('2 to 4 magnets are needed');
      break;
    case 'huddle': {
      if (p.cells.length !== p.w * p.h) err('the board is the wrong size');
      const cs = contacts(p);
      if (cs.some((c) => c.type === 'tee')) err('a magnet touches the middle of another');
      const keys = cs.filter((c) => c.type !== 'tee').map(contactKey).sort();
      if (keys.join() !== Object.keys(p.goals).sort().join()) err('the card does not match the touching pairs');
      if (!cs.some((c) => c.type === 'end' || c.type === 'side')) err('no two magnets touch');
      const s = solveHuddle(p, p.goals);
      if (!s.ok) err('the card cannot be met');
      if (!s.unique) err('some magnets are not tied to a glued one, so there is more than one answer');
      if (s.ok && s.unique) {
        const now = dirsOf(p);
        if (p.cells.every((c, i) => !isMagnet(c) || now[i] === s.dirs[i])) err('it starts already solved');
      }
      for (const g of groups(p)) if (!g.some((i) => isGlued(p.cells[i]))) err('a group of magnets has nothing glued');
      if (p.cells.some((c, i) => isMagnet(c) && !cs.some((x) => (x.a === i || x.b === i) && x.type !== 'steel'))) err('a magnet touches no other magnet');
      break;
    }
    case 'stick': {
      const ts = p.things.map(thing);
      if (ts.some((x) => !x)) err('an unknown thing');
      else {
        if (new Set(p.things).size !== p.things.length) err('a thing is there twice');
        if (!ts.some((x) => x.sticks)) err('nothing sticks');
        if (!ts.some((x) => x.metal && !x.sticks)) err('every metal sticks, so "metal" would be the rule');
        if (p.things.length < 4 || p.things.length > 6) err('4 to 6 things are needed');
      }
      break;
    }
    case 'reach': {
      const ok = p.mags.filter((m) => reaches(m.s, p.layers.length));
      if (ok.length !== 1) err(`${ok.length} magnets reach the clip`);
      if (p.layers.some((l) => !LAYERS.includes(l))) err('an unknown layer');
      if (new Set(p.mags.map((m) => m.size)).size !== p.mags.length) err('two magnets are the same size');
      break;
    }
    case 'tower': {
      if (p.gaps.length !== p.rings.length - 1) err('one gap between each pair of rings');
      if (p.rings.length < 3 || p.rings.length > 8) err('3 to 8 rings are needed');
      const sol = solveTower(p);
      if (sol.every((b, k) => b === p.rings[k])) err('it starts already solved');
      break;
    }
    case 'which': {
      const ans = whichAnswer(p.n, p.cards);
      if (!ans) err(whichSolutions(p.n, p.cards, 1).length ? 'the cards allow more than one answer' : 'no answer fits the cards');
      const seen = new Set();
      for (const o of p.cards) {
        if (o.a === o.b) err('a bar meets itself');
        const k = [Math.min(o.a, o.b), Math.max(o.a, o.b), o.a < o.b ? o.ea : o.eb, o.a < o.b ? o.eb : o.ea].join();
        if (seen.has(k)) err('the same card twice');
        seen.add(k);
      }
      break;
    }
    case 'compass':
      if (!SPOTS.includes(p.spot)) err('an unknown compass spot');
      break;
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
  LEVELS, isMagnet, axisOf, dirOf, isGlued, magnetCell, contacts, contactKey, hugs, dirsOf, outcome, solveHuddle, groups,
  floats, solveTower, towerGaps, THINGS, thing, LAYERS, reaches, BAR_TYPES, meet, whichSolutions, whichAnswer, SPOTS, needle,
  CHAPTER_SIZE, TEACH, sizeOf, CHAPTERS, chapter, makePuzzle, makeAt, sig, answers, choices, problems, starsFor
};
