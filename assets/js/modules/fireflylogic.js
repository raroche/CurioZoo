/**
 * fireflylogic.js — Firefly Circuits: the board, the circuit solver and the
 * puzzle maker.
 *
 * The board is a small grid. Each cell is empty, a rock, a wire piece, a
 * wooden stick, a switch, the eel (the battery) or a firefly (the bulb).
 * Every piece joins some of its four edges: N 1, E 2, S 4, W 8. Two
 * neighbouring cells touch when both have a wire end on the edge between them.
 *
 * The solver is the standard ideal circuit, solved exactly
 * (research-circuits-magnets.md section 3):
 *   - wires have no resistance, every firefly is the same resistor (1), the
 *     eel is an ideal battery (1);
 *   - everything joined by wire alone is one node;
 *   - a short circuit is the eel's two ends in one node: every firefly is dark;
 *   - a firefly with both feet in one node is bypassed: dark, and not a short;
 *   - the rest is Kirchhoff's current law, solved with exact fractions.
 * A firefly's brightness is its power: 1 alone, 1/4 each for two in a row,
 * 1 each side by side. The game only ever claims the order of brightness,
 * which is true for real bulbs too.
 *
 * Pure: no DOM, no Math.random.
 */

import { pickOne, randInt, rngFor, shuffled } from './logicrng.js';

export const LEVELS = ['easy', 'medium', 'hard'];
export const N = 1, E = 2, S = 4, Wb = 8;
const DIRS = [N, E, S, Wb];
const STEP = { 1: [0, -1], 2: [1, 0], 4: [0, 1], 8: [-1, 0] };
const OPP = { 1: 4, 2: 8, 4: 1, 8: 2 };
export const bitsOf = (m) => DIRS.filter((d) => m & d);
const rot = (m) => ((m << 1) | (m >> 3)) & 15;     // a quarter turn clockwise

/* ------------------------------------------------------------------ */
/* Fractions                                                           */
/* ------------------------------------------------------------------ */

const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
const fr = (n, d = 1) => { if (d < 0) { n = -n; d = -d; } const g = gcd(n, d); return [n / g, d / g]; };
const add = (a, b) => fr(a[0] * b[1] + b[0] * a[1], a[1] * b[1]);
const sub = (a, b) => fr(a[0] * b[1] - b[0] * a[1], a[1] * b[1]);
const mul = (a, b) => fr(a[0] * b[0], a[1] * b[1]);
const div = (a, b) => fr(a[0] * b[1], a[1] * b[0]);
const isZero = (a) => a[0] === 0;
export const fracText = (a) => (a[1] === 1 ? `${a[0]}` : `${a[0]}/${a[1]}`);

/* ------------------------------------------------------------------ */
/* Pieces                                                              */
/* ------------------------------------------------------------------ */

/**
 * The tray's piece kinds and the masks a turn can give each. A straight has
 * two (across, down), a corner four, a T four, a cross one.
 */
export const KINDS = {
  straight: [5, 10],
  corner: [3, 6, 12, 9],
  tee: [7, 14, 13, 11],
  cross: [15],
  wood: [5, 10]
};
export const masksOf = (kind) => KINDS[kind];

/** The kind of wire piece a mask is. */
export function kindOf(m) {
  if (m === 15) return 'cross';
  const n = bitsOf(m).length;
  if (n === 3) return 'tee';
  if (m === 5 || m === 10) return 'straight';
  return 'corner';
}

/** The cell a tray piece makes. */
export const pieceCell = (kind, m) => (kind === 'wood' ? { t: 'i', m } : { t: 'w', m });

/* ------------------------------------------------------------------ */
/* Solving a board                                                     */
/* ------------------------------------------------------------------ */

/* Every cell edge has one id, shared by the two cells it separates. */
function portId(x, y, d) {
  if (d === E) return `v${x + 1},${y}`;
  if (d === Wb) return `v${x},${y}`;
  if (d === N) return `h${x},${y}`;
  return `h${x},${y + 1}`;
}
export const portXY = (id, size) => {
  const [a, b] = id.slice(1).split(',').map(Number);
  return id[0] === 'v' ? [a * size, b * size + size / 2] : [a * size + size / 2, b * size];
};

/**
 * Everything the board does, worked out exactly:
 *   { short, open, fireflies: { A: { p: [num, den], i: [num, den], tier, why } },
 *     flows: [{ from, to, i }] } with `from` and `to` vertex ids for drawing.
 */
export function solve(board) {
  const { w, h, cells } = board;
  const parent = new Map();
  const find = (a) => {
    if (!parent.has(a)) parent.set(a, a);
    let r = a;
    while (parent.get(r) !== r) r = parent.get(r);
    let c = a;
    while (parent.get(c) !== r) { const nx = parent.get(c); parent.set(c, r); c = nx; }
    return r;
  };
  const union = (a, b) => { const ra = find(a); const rb = find(b); if (ra !== rb) parent.set(ra, rb); };
  const wires = [];           // [vertex, vertex] pairs, for the flows
  let eel = null;
  const flies = [];

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const c = cells[y * w + x];
      if (!c) continue;
      const centre = `c${x},${y}`;
      const join = (m, ctr) => bitsOf(m).forEach((d) => { const p = portId(x, y, d); union(p, ctr); wires.push([p, ctr]); });
      if (c.t === 'w') join(c.m, centre);
      else if (c.t === 's' && c.on) join(c.m, centre);
      else if (c.t === 'b') { join(5, `${centre}a`); join(10, `${centre}b`); }
      else if (c.t === 'E') eel = { plus: portId(x, y, c.p), minus: portId(x, y, OPP[c.p]), x, y };
      else if (c.t === 'F') {
        const [a, b] = bitsOf(c.m);
        flies.push({ id: c.id, a: portId(x, y, a), b: portId(x, y, b), x, y });
      }
      /* a wooden stick, an open switch, a rock: no join at all */
    }
  }
  /* Make sure every terminal is a vertex, even when nothing touches it. */
  if (eel) { find(eel.plus); find(eel.minus); }
  flies.forEach((f) => { find(f.a); find(f.b); });

  const out = { short: false, open: false, fireflies: {}, flows: [], eelCurrent: [0, 1] };
  const dark = (why) => flies.forEach((f) => { out.fireflies[f.id] = { p: [0, 1], i: [0, 1], tier: 0, why }; });
  if (!eel) { out.open = true; dark('open'); return out; }

  const P = find(eel.plus);
  const M = find(eel.minus);
  if (P === M) {
    out.short = true;
    dark('short');
    out.flows = treeFlows(wires, find, new Map([[eel.plus, 1], [eel.minus, -1]]));
    return out;
  }

  /* The nodes the eel can reach through fireflies, and whether it gets home. */
  const fnode = flies.map((f) => ({ ...f, na: find(f.a), nb: find(f.b) }));
  const adj = new Map();
  for (const f of fnode) {
    if (f.na === f.nb) continue;
    [[f.na, f.nb], [f.nb, f.na]].forEach(([u, v]) => { if (!adj.has(u)) adj.set(u, []); adj.get(u).push(v); });
  }
  const seen = new Set([P]);
  const queue = [P];
  while (queue.length) { const u = queue.shift(); for (const v of adj.get(u) || []) if (!seen.has(v)) { seen.add(v); queue.push(v); } }
  if (!seen.has(M)) {
    out.open = true;
    fnode.forEach((f) => { out.fireflies[f.id] = { p: [0, 1], i: [0, 1], tier: 0, why: f.na === f.nb ? 'bypass' : 'open' }; });
    return out;
  }

  /* Kirchhoff: for every free node, the currents through its fireflies add to nothing. */
  const free = [...seen].filter((n) => n !== P && n !== M);
  const idx = new Map(free.map((n, i) => [n, i]));
  const V = new Map([[P, [1, 1]], [M, [0, 1]]]);
  if (free.length) {
    const rows = free.map(() => Array.from({ length: free.length + 1 }, () => [0, 1]));
    for (const f of fnode) {
      if (f.na === f.nb || !seen.has(f.na)) continue;
      for (const [u, v] of [[f.na, f.nb], [f.nb, f.na]]) {
        if (!idx.has(u)) continue;
        const r = rows[idx.get(u)];
        r[idx.get(u)] = add(r[idx.get(u)], [1, 1]);
        if (idx.has(v)) r[idx.get(v)] = sub(r[idx.get(v)], [1, 1]);
        else r[free.length] = add(r[free.length], V.get(v));
      }
    }
    /* Gaussian elimination, exact. */
    const n = free.length;
    for (let col = 0; col < n; col++) {
      let piv = col;
      while (piv < n && isZero(rows[piv][col])) piv++;
      if (piv === n) continue;
      [rows[col], rows[piv]] = [rows[piv], rows[col]];
      for (let r = 0; r < n; r++) {
        if (r === col || isZero(rows[r][col])) continue;
        const k = div(rows[r][col], rows[col][col]);
        for (let c2 = col; c2 <= n; c2++) rows[r][c2] = sub(rows[r][c2], mul(k, rows[col][c2]));
      }
    }
    free.forEach((node, i) => V.set(node, isZero(rows[i][i]) ? [0, 1] : div(rows[i][n], rows[i][i])));
  }

  const inject = new Map();
  const addAt = (port, val) => inject.set(port, add(inject.get(port) || [0, 1], val));
  let eelI = [0, 1];
  for (const f of fnode) {
    let i = [0, 1];
    let why = 'open';
    if (f.na === f.nb) why = 'bypass';
    else if (seen.has(f.na) && seen.has(f.nb)) {
      i = sub(V.get(f.na), V.get(f.nb));       // from foot a to foot b
      why = isZero(i) ? 'balanced' : 'lit';
    }
    const p = mul(i, i);
    out.fireflies[f.id] = { p, i, tier: tierOf(p), why };
    if (!isZero(i)) { addAt(f.a, [-i[0], i[1]]); addAt(f.b, i); }
  }
  /* What leaves the eel's + end is everything that comes back to its - end. */
  for (const f of fnode) {
    if (f.na === P && !isZero(out.fireflies[f.id].i)) eelI = add(eelI, out.fireflies[f.id].i);
    if (f.nb === P && !isZero(out.fireflies[f.id].i)) eelI = sub(eelI, out.fireflies[f.id].i);
  }
  out.eelCurrent = eelI;
  addAt(eel.plus, eelI);
  addAt(eel.minus, [-eelI[0], eelI[1]]);
  out.flows = treeFlows(wires, find, new Map([...inject].map(([k, v]) => [k, v[0] / v[1]])));
  return out;
}

/**
 * Current in every wire segment, for the dots. Inside one node the wires are
 * all the same voltage, so any way of carrying the current through them is
 * as true as any other; this one uses a spanning tree, so no current runs in
 * circles. Returns [{ from, to, i }] with the current flowing from -> to.
 */
function treeFlows(wires, find, inject) {
  const adj = new Map();
  wires.forEach(([a, b]) => {
    if (!adj.has(a)) adj.set(a, []);
    if (!adj.has(b)) adj.set(b, []);
    adj.get(a).push(b);
    adj.get(b).push(a);
  });
  const flows = [];
  const done = new Set();
  for (const start of adj.keys()) {
    if (done.has(start)) continue;
    /* A spanning tree of this piece of wire, by breadth-first search. */
    const order = [start];
    const up = new Map([[start, null]]);
    done.add(start);
    for (let k = 0; k < order.length; k++) {
      for (const v of adj.get(order[k])) if (!done.has(v)) { done.add(v); up.set(v, order[k]); order.push(v); }
    }
    const sum = new Map(order.map((v) => [v, inject.get(v) || 0]));
    for (let k = order.length - 1; k > 0; k--) {
      const v = order[k];
      const u = up.get(v);
      const s = sum.get(v);
      sum.set(u, sum.get(u) + s);
      if (Math.abs(s) > 1e-9) flows.push(s > 0 ? { from: v, to: u, i: s } : { from: u, to: v, i: -s });
    }
  }
  return flows;
}

/* ------------------------------------------------------------------ */
/* Brightness                                                          */
/* ------------------------------------------------------------------ */

/**
 * Tiers by power. 4 bright (1), 3 medium (4/9), 2 dim (1/4), 1 faint (1/9),
 * 0 asleep. A level only shows the tiers it has taught, and never asks a
 * child to tell 4/9 from 1/4, which real bulbs might not show clearly.
 */
export function tierOf(p) {
  const v = p[0] / p[1];
  if (v === 0) return 0;
  if (v >= 0.99) return 4;
  if (Math.abs(v - 4 / 9) < 1e-9) return 3;
  if (Math.abs(v - 1 / 4) < 1e-9) return 2;
  if (Math.abs(v - 1 / 9) < 1e-9) return 1;
  return -1;                                       // a brightness no lesson covers
}

/* What a level calls each tier: Easy only glows or sleeps. */
export const TIER_SETS = {
  glow: [0, 'on'],
  rows: [0, 2, 4],
  mixed: [0, 1, 3, 4]
};

/** The answer a level expects for a firefly of tier t. */
export function said(t, set) {
  if (set === 'glow') return t > 0 ? 'on' : 0;
  return t;
}

/* ------------------------------------------------------------------ */
/* Making boards                                                       */
/* ------------------------------------------------------------------ */

const LETTERS = ['A', 'B', 'C', 'D'];

/**
 * A ring of wire round a w by h box, with the eel on one side and fireflies
 * on others. `chords` are straight wires across the middle, each joining two
 * opposite sides of the ring (T pieces where they meet it); a chord may carry
 * a firefly. Returns a board, or null when the pieces do not fit.
 */
function ringBoard(rng, { w, h, flies = 1, chords = 0, chordFly = 0, gaps = 0, switches = 0 }) {
  const cells = Array(w * h).fill(null);
  const at = (x, y) => y * w + x;
  /* The ring, in order round the box. */
  const ring = [];
  for (let x = 0; x < w; x++) ring.push([x, 0]);
  for (let y = 1; y < h; y++) ring.push([w - 1, y]);
  for (let x = w - 2; x >= 0; x--) ring.push([x, h - 1]);
  for (let y = h - 2; y > 0; y--) ring.push([0, y]);
  const n = ring.length;
  ring.forEach(([x, y], k) => {
    const [px, py] = ring[(k + n - 1) % n];
    const [nx, ny] = ring[(k + 1) % n];
    const dir = (ax, ay) => (ax > x ? E : ax < x ? Wb : ay > y ? S : N);
    cells[at(x, y)] = { t: 'w', m: dir(px, py) | dir(nx, ny) };
  });
  const straightRing = ring.filter(([x, y]) => [5, 10].includes(cells[at(x, y)].m));

  /* Chords: across a middle row (left side to right side) or down a middle column. */
  const used = new Set();
  const chordCells = [];
  const chordOptions = shuffled(rng, [
    ...Array.from({ length: h - 2 }, (_, i) => ({ row: i + 1 })),
    ...Array.from({ length: w - 2 }, (_, i) => ({ col: i + 1 }))
  ]);
  for (const ch of chordOptions) {
    if (chordCells.length >= chords) break;
    const line = ch.row !== undefined
      ? Array.from({ length: w }, (_, x) => [x, ch.row])
      : Array.from({ length: h }, (_, y) => [ch.col, y]);
    const inner = line.slice(1, -1);
    if (inner.some(([x, y]) => cells[at(x, y)])) continue;      // crosses another chord
    const [a, b] = [line[0], line[line.length - 1]];
    const ends = [[a, ch.row !== undefined ? E : S], [b, ch.row !== undefined ? Wb : N]];
    if (ends.some(([[x, y]]) => used.has(`${x},${y}`))) continue;
    ends.forEach(([[x, y], d]) => { cells[at(x, y)] = { t: 'w', m: cells[at(x, y)].m | d }; used.add(`${x},${y}`); });
    inner.forEach(([x, y]) => { cells[at(x, y)] = { t: 'w', m: ch.row !== undefined ? 10 : 5 }; });
    chordCells.push(inner);
  }
  if (chordCells.length < chords) return null;

  /* The eel and the fireflies go on straight ring cells nobody else uses. */
  const free = shuffled(rng, straightRing.filter(([x, y]) => !used.has(`${x},${y}`)));
  if (free.length < 1 + flies + gaps + switches) return null;
  const take = () => free.pop();
  const [ex, ey] = take();
  const em = cells[at(ex, ey)].m;
  cells[at(ex, ey)] = { t: 'E', p: pickOne(rng, bitsOf(em)) };
  let letter = 0;
  for (let k = 0; k < flies; k++) {
    const [x, y] = take();
    cells[at(x, y)] = { t: 'F', m: cells[at(x, y)].m, id: LETTERS[letter++] };
  }
  for (let k = 0; k < chordFly && k < chordCells.length; k++) {
    const inner = chordCells[k];
    const [x, y] = pickOne(rng, inner);
    cells[at(x, y)] = { t: 'F', m: cells[at(x, y)].m, id: LETTERS[letter++] };
  }
  for (let k = 0; k < gaps; k++) {
    const [x, y] = take();
    cells[at(x, y)] = rng() < 0.5 ? null : { t: 'i', m: cells[at(x, y)].m };
  }
  for (let k = 0; k < switches; k++) {
    const [x, y] = take();
    cells[at(x, y)] = { t: 's', m: cells[at(x, y)].m, on: rng() < 0.5 };
  }
  return { w, h, cells };
}

/** The ids of the fireflies on a board, in letter order. */
export const fireflyIds = (board) => board.cells.filter((c) => c && c.t === 'F').map((c) => c.id).sort();

/* ------------------------------------------------------------------ */
/* Chapters                                                            */
/* ------------------------------------------------------------------ */

export const CHAPTER_SIZE = 30;
export const TEACH = 2;

/*   kind   build: place the tray's pieces to match the goal card
            predict: say how each firefly will glow, then Go
     tiers  the words a level uses (glow, rows or mixed) */
export const CHAPTERS = {
  easy: [
    { id: 'e1', kind: 'build', tiers: 'glow', icon: '🔌' },
    { id: 'e2', kind: 'predict', tiers: 'glow', icon: '❓' },
    { id: 'e3', kind: 'build', tiers: 'glow', icon: '✨' }
  ],
  medium: [
    { id: 'm1', kind: 'build', tiers: 'rows', icon: '🪵' },
    { id: 'm2', kind: 'predict', tiers: 'rows', icon: '⚠️' },
    { id: 'm3', kind: 'predict', tiers: 'rows', icon: '💡' }
  ],
  hard: [
    { id: 'h1', kind: 'build', tiers: 'rows', icon: '🧩' },
    { id: 'h2', kind: 'predict', tiers: 'rows', icon: '🎚️' },
    { id: 'h3', kind: 'predict', tiers: 'mixed', icon: '🌟' }
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
/* Build puzzles: the search that proves one answer                    */
/* ------------------------------------------------------------------ */

const slotsOf = (board) => board.cells.map((c, i) => (c && c.t === '?' ? i : -1)).filter((i) => i >= 0);

/** The board with these pieces (kind, mask) in its slots, in slot order. */
export function fill(board, placed) {
  const cells = board.cells.slice();
  slotsOf(board).forEach((i, k) => { cells[i] = placed[k] ? pieceCell(placed[k].kind, placed[k].m) : null; });
  return { ...board, cells };
}

/** Does a solved board show exactly the goal card, in the level's words? */
export function meetsGoal(res, goal, tiers) {
  return Object.entries(goal).every(([id, want]) => res.fireflies[id] && said(res.fireflies[id].tier, tiers) === want);
}

/**
 * Every way to fill the slots from the tray that meets the goal, as a set of
 * slot masks ("5,10,3" with the wood marked). A puzzle is good when there is
 * exactly one. Tray pieces may be left over (decoys); every slot is filled.
 */
export function solutions(p, cap = 3) {
  const slots = slotsOf(p.board);
  const found = new Set();
  const used = Array(p.tray.length).fill(false);
  const placed = [];
  const walk = (k) => {
    if (found.size >= cap) return;
    if (k === slots.length) {
      const res = solve(fill(p.board, placed));
      if (!res.short && meetsGoal(res, p.goal, p.tiers)) found.add(placed.map((x) => `${x.kind === 'wood' ? 'i' : 'w'}${x.m}`).join(','));
      return;
    }
    const tried = new Set();
    for (let t = 0; t < p.tray.length; t++) {
      if (used[t] || tried.has(p.tray[t])) continue;
      tried.add(p.tray[t]);
      used[t] = true;
      for (const m of masksOf(p.tray[t])) { placed[k] = { kind: p.tray[t], m }; walk(k + 1); }
      used[t] = false;
    }
    placed.length = k;
  };
  walk(0);
  return [...found];
}

/**
 * Turn a working board into a build puzzle: empty `k` of its plain wire
 * cells into slots, put their pieces in the tray with `decoys` more, and
 * keep it only if exactly one filling meets the goal.
 */
function toBuild(rng, board, { k, decoys = [], tiers }) {
  const res = solve(board);
  if (res.short) return null;
  const goal = Object.fromEntries(fireflyIds(board).map((id) => [id, said(res.fireflies[id].tier, tiers)]));
  const wireCells = board.cells.map((c, i) => (c && c.t === 'w' ? i : -1)).filter((i) => i >= 0);
  for (let attempt = 0; attempt < 12; attempt++) {
    const pick = shuffled(rng, wireCells).slice(0, k);
    if (pick.length < k) return null;
    const cells = board.cells.slice();
    const tray = [];
    pick.forEach((i) => { tray.push(kindOf(cells[i].m)); cells[i] = { t: '?' }; });
    tray.push(...decoys);
    const p = { kind: 'build', board: { ...board, cells }, tray: shuffled(rng, tray), goal, tiers };
    if (solutions(p, 2).length === 1) return p;
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Making experiments                                                  */
/* ------------------------------------------------------------------ */

const tiersOf = (board) => { const r = solve(board); return fireflyIds(board).map((id) => r.fireflies[id].tier); };

/** Is every firefly's brightness one this level can name? */
const nameable = (board, set) => {
  const ts = tiersOf(board);
  if (ts.some((t) => t < 0)) return false;
  if (set === 'rows') return ts.every((t) => [0, 2, 4].includes(t));
  if (set === 'mixed') return ts.every((t) => [0, 1, 3, 4].includes(t));
  return true;
};

export function makePuzzle(ch, rng, i = TEACH) {
  const teach = i < TEACH;
  const size = () => ({ w: 3 + randInt(rng, 2), h: 3 + randInt(rng, teach ? 1 : 2) });
  for (let tries = 0; tries < 120; tries++) {
    let p = null;
    switch (ch.id) {
      case 'e1': {
        /* One firefly, one or two gaps in its loop to fill. */
        const b = ringBoard(rng, { ...size(), flies: 1 });
        if (b) p = toBuild(rng, b, { k: teach ? 1 : i < 15 ? 1 : 2, tiers: 'glow' });
        break;
      }
      case 'e2': {
        /* Will it glow? A loop, or a loop with a gap or a wooden stick. */
        const gaps = teach ? i : rng() < 0.5 ? 1 : 0;
        const b = ringBoard(rng, { ...size(), flies: teach ? 1 : 1 + randInt(rng, 2), gaps });
        if (b) p = { kind: 'predict', board: b, tiers: 'glow' };
        break;
      }
      case 'e3': {
        const b = ringBoard(rng, { ...size(), flies: 2 });
        if (b) p = toBuild(rng, b, { k: 2, decoys: i >= 15 ? [pickOne(rng, ['straight', 'corner'])] : [], tiers: 'glow' });
        break;
      }
      case 'm1': {
        /* Metal or wood: a wooden stick in the tray that looks just like a straight. */
        const b = ringBoard(rng, { ...size(), flies: 1 + (i >= 12 ? 1 : 0) });
        if (b) p = toBuild(rng, b, { k: teach ? 1 : 2, decoys: ['wood'], tiers: 'rows' });
        break;
      }
      case 'm2': {
        /* Short cuts: a plain wire across the middle. In turn it joins the
           eel's two ends (a short), skips a firefly (a bypass), or does
           neither. */
        const want = ['short', 'bypass', 'fine'][i % 3];
        const b = ringBoard(rng, { w: 3 + randInt(rng, 2), h: 3 + randInt(rng, 2), flies: 1 + randInt(rng, 2), chords: 1 });
        if (b && nameable(b, 'rows') && shape(b) === want) p = { kind: 'predict', board: b, tiers: 'rows' };
        break;
      }
      case 'm3': {
        /* In a row (both dim) or side by side (both bright). */
        const side = i % 2 === 1;
        const b = side
          ? ringBoard(rng, { w: 3 + randInt(rng, 2), h: 3 + randInt(rng, 2), flies: 1 + randInt(rng, 2), chords: 1, chordFly: 1 })
          : ringBoard(rng, { w: 3 + randInt(rng, 2), h: 3 + randInt(rng, 2), flies: 2 + (i > 15 ? randInt(rng, 2) : 0) });
        const ts = b && nameable(b, 'rows') ? tiersOf(b) : [];
        const ok = side ? ts.length >= 2 && ts.filter((t) => t === 4).length >= 2 : ts.length >= 2 && ts.every((t) => t === 2);
        if (ok) p = { kind: 'predict', board: b, tiers: 'rows' };
        break;
      }
      case 'h1': {
        const chordFly = randInt(rng, 2);
        const b = ringBoard(rng, { w: 4, h: 3 + randInt(rng, 2), flies: 1 + randInt(rng, 2), chords: chordFly, chordFly });
        if (b && nameable(b, 'rows')) p = toBuild(rng, b, { k: teach ? 2 : 3, decoys: i >= 15 ? ['wood'] : [], tiers: 'rows' });
        break;
      }
      case 'h2': {
        /* Switches: each one is drawn open or closed. */
        const b = ringBoard(rng, { w: 4, h: 3 + randInt(rng, 2), flies: 1 + randInt(rng, 2), chords: randInt(rng, 2), chordFly: randInt(rng, 2), switches: 1 + (teach ? 0 : randInt(rng, 2)) });
        if (b && nameable(b, 'rows')) p = { kind: 'predict', board: b, tiers: 'rows' };
        break;
      }
      case 'h3': {
        /* Tricky circuits: a firefly in a row with a side-by-side pair. */
        const b = ringBoard(rng, { w: 4 + randInt(rng, 2), h: 4, flies: 1 + randInt(rng, 2), chords: 1 + randInt(rng, 2), chordFly: 1 + randInt(rng, 2) });
        if (b && nameable(b, 'mixed') && tiersOf(b).some((t) => t === 1 || t === 3)) p = { kind: 'predict', board: b, tiers: 'mixed' };
        break;
      }
      default: return null;
    }
    if (p && interesting(p, ch, i)) return p;
  }
  return null;
}

/** What a board shows: a short, a bypassed firefly, or every firefly lit. */
function shape(board) {
  const r = solve(board);
  if (r.short) return 'short';
  if (Object.values(r.fireflies).some((f) => f.why === 'bypass')) return 'bypass';
  return Object.values(r.fireflies).every((f) => f.tier > 0) ? 'fine' : 'other';
}

/* A predict board that is all asleep (or all bright) on Easy is fine; on
   Medium and Hard each board should make the child think about two kinds. */
function interesting(p, ch, i) {
  if (p.kind !== 'predict') return true;
  const ts = tiersOf(p.board);
  if (!ts.length) return false;
  if (ch.level === 'easy') return true;
  if (ch.id === 'm2' || ch.id === 'm3') return true;
  return new Set(ts).size > 1 || i < TEACH;
}

export const makeAt = (chId, i, ...seed) => makePuzzle(chapter(chId), rngFor('firefly', chId, i, ...seed), i);

/** A board as one short string, for spotting repeats. */
const cellSig = (c) => (!c ? '.' : c.t === 'w' || c.t === 'i' ? `${c.t}${c.m}` : c.t === 'F' ? `F${c.m}` : c.t === 'E' ? `E${c.p}` : c.t === 's' ? `s${c.m}${c.on ? 1 : 0}` : c.t);
export const sig = (p) => `${p.kind}|${p.board.w}x${p.board.h}|${p.board.cells.map(cellSig).join('')}|${(p.tray || []).slice().sort().join(',')}`;

/* ------------------------------------------------------------------ */
/* Answers and proof                                                   */
/* ------------------------------------------------------------------ */

/** For a predict puzzle: the right word for each firefly, in letter order. */
export function answers(p) {
  if (p.kind !== 'predict') return [];
  const r = solve(p.board);
  return fireflyIds(p.board).map((id) => said(r.fireflies[id].tier, p.tiers));
}

export const choices = (p) => fireflyIds(p.board).map(() => TIER_SETS[p.tiers]);

export function problems(p) {
  const errs = [];
  const err = (m) => errs.push(m);
  const ids = fireflyIds(p.board);
  if (!ids.length) err('no fireflies');
  if (new Set(ids).size !== ids.length) err('two fireflies share a letter');
  if (p.board.cells.filter((c) => c && c.t === 'E').length !== 1) err('a board needs exactly one eel');
  if (p.kind === 'predict') {
    const r = solve(p.board);
    for (const id of ids) {
      const t = r.fireflies[id].tier;
      if (t < 0) err(`firefly ${id} has a brightness no lesson names`);
      else if (!TIER_SETS[p.tiers].includes(said(t, p.tiers))) err(`firefly ${id}: tier ${t} is not one of this level's words`);
    }
    if (p.board.cells.some((c) => c && c.t === '?')) err('a predict board has an empty slot');
  } else if (p.kind === 'build') {
    const sols = solutions(p, 3);
    if (sols.length !== 1) err(`${sols.length} ways to meet the goal, not one`);
    if (Object.keys(p.goal).sort().join() !== ids.join()) err('the goal card does not name every firefly');
    if (slotsOf(p.board).length > p.tray.length) err('more slots than pieces');
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
  LEVELS, KINDS, masksOf, kindOf, pieceCell, solve, tierOf, TIER_SETS, said, fireflyIds, CHAPTER_SIZE, TEACH,
  CHAPTERS, chapter, fill, meetsGoal, solutions, makePuzzle, makeAt, sig, answers, choices, problems, starsFor, portXY, fracText, rot
};
