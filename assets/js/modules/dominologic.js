/**
 * dominologic.js — Domino Zoo: a zig-zag machine on shelves that must ring
 * the feeding bell.
 *
 * research-levers-shadows-water-dominos.md part 4. Everything happens on a
 * grid, one thing at a time, with no chance in it:
 *   - shelves zig-zag down: row 0 runs right, row 1 left, and so on; each
 *     shelf but the last has a hole at its far end where a ball drops through;
 *   - a domino falls the way it is pushed and pushes the next cell; it can
 *     knock over a domino at most 1½ times its own height (Whitehead's
 *     rule): 2 → 3, 3 → 4, 4 → 6, but not 2 → 4 or 3 → 6;
 *   - the meerkat's finger and a rolling ball can knock over any domino;
 *   - a ball rolls until something stops it, and drops through a hole;
 *   - a ramp turns a falling ball into a rolling one, downhill;
 *   - a seesaw: land on one end and the other end jumps up a little
 *     (it reaches a low bell); a pulley: drop into one bucket and the other
 *     rises high (it reaches a low or a high bell);
 *   - a fan: hit its switch and it blows the way it faces; wind moves only
 *     a light paper boat, which sails across the pond;
 *   - the bell rings when anything reaches it.
 *
 * Puzzles take parts out of a working machine and put them in a tray, with
 * decoys; every way of putting tray parts back is tried, and a puzzle is
 * kept only if exactly one rings the bell.
 *
 * Pure: no DOM, no Math.random.
 */

import { pickOne, randInt, rngFor, shuffled } from './logicrng.js';

export const LEVELS = ['easy', 'medium', 'hard'];
export const W = 6;
export const SIZES = [2, 3, 4, 6];
export const topples = (from, to) => to <= Math.floor(from * 1.5);
export const maxTopple = (from) => Math.floor(from * 1.5);

/* ------------------------------------------------------------------ */
/* The machine                                                         */
/* ------------------------------------------------------------------ */

/*
 * A machine is { rows, parts }. A part is { t, r, c, ... }:
 *   dom    s: height 2, 3, 4 or 6
 *   ball
 *   ramp   d: the way it slopes down, 1 right or -1 left
 *   fan    d: the way it blows
 *   boat   (on a pond cell)
 *   pond   (water, one per cell)
 *   bell   on a shelf, or hang: 1 (low) or 2 (high) above a seesaw or pulley end
 *   seesaw, pulley   c is the left end; they cover c, c+1 and c+2
 */
export const dirOf = (r) => (r % 2 === 0 ? 1 : -1);
export const holeOf = (m, r) => (r < m.rows - 1 ? (dirOf(r) > 0 ? W - 1 : 0) : null);
export const wide = (t) => t === 'seesaw' || t === 'pulley';
export const orientable = (t) => t === 'ramp' || t === 'fan';
export const covers = (p, c) => (wide(p.t) ? c >= p.c && c <= p.c + 2 : p.c === c);
export const keyOf = (p) => `${p.t}@${p.r},${p.c}`;

/** The solid part at a cell: not a pond, not a hanging bell. */
export function partAt(m, r, c) {
  return m.parts.find((p) => p.r === r && p.t !== 'pond' && !p.hang && covers(p, c)) || null;
}
const pondAt = (m, r, c) => m.parts.some((p) => p.t === 'pond' && p.r === r && p.c === c);
const hangAt = (m, r, c) => m.parts.find((p) => p.t === 'bell' && p.hang && p.r === r && p.c === c) || null;

/**
 * Run the machine. Returns { rang, events, moved, last, stop }:
 *   events: what happened, in order, for the replay;
 *   moved:  the keys of the parts that moved, in order; last: the last to move;
 *   stop:   null when the bell rang, else { why, r, c, part, ... }.
 */
export function simulate(m) {
  const events = [];
  const moved = [];
  let last = null;
  const move = (p) => { last = keyOf(p); if (!moved.includes(last)) moved.push(last); };
  const stop = (why, r, c, extra = {}) => ({ rang: false, events, moved, last, stop: { why, r, c, ...extra } });
  const ring = (bell) => { events.push({ e: 'ring', key: keyOf(bell) }); return { rang: true, events, moved, last, stop: null }; };

  /* A push from (r, c - dir) into cell c, with strength s (Infinity for a finger or a ball). */
  const push = (r, c, dir, s) => {
    for (let guard = 0; guard < 60; guard++) {
      const t = c >= 0 && c < W ? partAt(m, r, c) : null;
      if (!t) return stop('nothing', r, c - dir);
      if (t.t === 'dom') {
        if (s !== Infinity && !topples(s, t.s)) return stop('tooBig', r, c, { from: s, to: t.s });
        events.push({ e: 'topple', key: keyOf(t), dir });
        move(t);
        s = t.s;
        c += dir;
        continue;
      }
      if (t.t === 'ball') return roll(t, r, c, dir);
      if (t.t === 'fan') return blow(t);
      if (t.t === 'bell') return ring(t);
      return stop('blocked', r, c, { part: t.t });
    }
    return stop('nothing', r, c);
  };

  /* A ball at (r, c) rolling in dir. */
  const roll = (ball, r, c, dir) => {
    move(ball);
    last = keyOf(ball);
    for (let guard = 0; guard < 60; guard++) {
      const c2 = c + dir;
      if (c2 < 0 || c2 >= W) return stop('wall', r, c);
      if (c2 === holeOf(m, r)) {
        events.push({ e: 'ball', key: keyOf(ball), r, c: c2 });
        return fall(ball, r, c2);
      }
      if (pondAt(m, r, c2) && !partAt(m, r, c2)) { events.push({ e: 'ball', key: keyOf(ball), r, c: c2, splash: true }); return stop('splash', r, c2); }
      const t = partAt(m, r, c2);
      if (!t) { events.push({ e: 'ball', key: keyOf(ball), r, c: c2 }); c = c2; continue; }
      if (t.t === 'dom') {
        events.push({ e: 'topple', key: keyOf(t), dir });
        move(t);
        return push(r, c2 + dir, dir, t.s);
      }
      if (t.t === 'ball') { events.push({ e: 'bump', key: keyOf(t) }); return roll(t, r, c2, dir); }
      if (t.t === 'fan') return blow(t);
      if (t.t === 'bell') return ring(t);
      return stop('blocked', r, c2, { part: t.t });
    }
    return stop('wall', r, c);
  };

  /* A ball dropping through the hole at column c below row r. */
  const fall = (ball, r, c) => {
    for (let rr = r + 1; rr < m.rows; rr++) {
      const t = partAt(m, rr, c);
      events.push({ e: 'ball', key: keyOf(ball), r: rr, c, air: !t });
      if (!t) {
        if (holeOf(m, rr) === c) continue;
        return stop('landed', rr, c);
      }
      if (t.t === 'ramp') { events.push({ e: 'land', key: keyOf(t) }); return roll(ball, rr, c, t.d); }
      if (wide(t.t)) {
        if (c === t.c + 1) return stop('middle', rr, c, { part: t.t });
        const other = c === t.c ? t.c + 2 : t.c;
        events.push({ e: t.t === 'seesaw' ? 'tip' : 'lift', key: keyOf(t), down: c, up: other });
        move(t);
        const bell = hangAt(m, rr, other);
        const reach = t.t === 'seesaw' ? 1 : 2;
        if (bell && bell.hang <= reach) return ring(bell);
        if (bell) return stop('tooHigh', rr, other, { part: t.t });
        return stop('nothingAbove', rr, other, { part: t.t });
      }
      if (t.t === 'fan') return blow(t);
      if (t.t === 'bell') return ring(t);
      return stop('bounced', rr, c, { part: t.t });
    }
    return stop('landed', m.rows - 1, c);
  };

  /* A fan blowing along its row. */
  const blow = (fan) => {
    events.push({ e: 'blow', key: keyOf(fan) });
    move(fan);
    for (let c = fan.c + fan.d; c >= 0 && c < W; c += fan.d) {
      const t = partAt(m, fan.r, c);
      if (t && t.t === 'boat') return sail(t, fan.d);
      if (t) return stop('windWeak', fan.r, c, { part: t.t });
    }
    return stop('windNothing', fan.r, fan.c);
  };

  const sail = (boat, dir) => {
    move(boat);
    let c = boat.c;
    for (let guard = 0; guard < W; guard++) {
      const c2 = c + dir;
      const t = c2 >= 0 && c2 < W ? partAt(m, boat.r, c2) : null;
      if (t && t.t === 'bell') { events.push({ e: 'sail', key: keyOf(boat), c }); return ring(t); }
      if (!pondAt(m, boat.r, c2)) return stop('boatStuck', boat.r, c);
      c = c2;
      events.push({ e: 'sail', key: keyOf(boat), c });
    }
    return stop('boatStuck', boat.r, c);
  };

  return push(0, 0, 1, Infinity);
}

/* ------------------------------------------------------------------ */
/* Gaps and the tray                                                   */
/* ------------------------------------------------------------------ */

/*
 * A build puzzle is { kind: 'build', rows, parts, gaps, tray }:
 *   gaps: [{ r, c, w }]   where parts were taken out (w = 1 or 3)
 *   tray: [{ t, s? }]     parts to put back, decoys among them
 * A placement is, per gap, null or { k: tray index, d: 1 | -1 }.
 */
export const fits = (piece, gap) => (wide(piece.t) ? 3 : 1) === gap.w;
export const samePiece = (a, b) => a.t === b.t && (a.s || 0) === (b.s || 0);

/** The machine with these pieces put into the gaps. */
export function withPlacement(p, place) {
  const parts = p.parts.slice();
  place.forEach((x, g) => {
    if (!x) return;
    const piece = p.tray[x.k];
    const gap = p.gaps[g];
    const part = { t: piece.t, r: gap.r, c: gap.c };
    if (piece.t === 'dom') part.s = piece.s;
    if (orientable(piece.t)) part.d = x.d;
    parts.push(part);
  });
  return { rows: p.rows, parts };
}

/** Every placement that rings the bell (stopping after `limit`). */
export function solutions(p, limit = 2) {
  const out = [];
  const used = new Set();
  const place = p.gaps.map(() => null);
  const go = (g) => {
    if (out.length >= limit) return;
    if (g === p.gaps.length) {
      if (simulate(withPlacement(p, place)).rang) out.push(place.map((x) => (x ? { ...x } : null)));
      return;
    }
    place[g] = null;
    go(g + 1);
    p.tray.forEach((piece, k) => {
      if (used.has(k) || !fits(piece, p.gaps[g])) return;
      /* Two pieces just alike are one choice. */
      if (p.tray.slice(0, k).some((q, j) => !used.has(j) && samePiece(q, piece))) return;
      used.add(k);
      for (const d of orientable(piece.t) ? [1, -1] : [1]) {
        place[g] = { k, d };
        go(g + 1);
      }
      used.delete(k);
      place[g] = null;
    });
  };
  go(0);
  return out;
}

/* ------------------------------------------------------------------ */
/* Building working machines                                           */
/* ------------------------------------------------------------------ */

/** A run of n domino heights from `sizes`, each one knockable by the one before. */
function run(rng, n, sizes, prev = null) {
  const out = [];
  for (let k = 0; k < n; k++) {
    const ok = sizes.filter((s) => prev === null || topples(prev, s));
    if (!ok.length) return null;
    const s = pickOne(rng, ok);
    out.push(s);
    prev = s;
  }
  return out;
}

/**
 * A working machine, built row by row.
 *   rows: how many shelves; sizes: domino heights to use;
 *   finish: 'bell' | 'fan' | 'seesaw' | 'pulley' | 'land'.
 */
export function buildMachine(rng, { rows, sizes = [3], finish = 'bell', maxDom = 3 }) {
  const parts = [];
  const m = { rows, parts };
  let e = 0;
  for (let r = 0; r < rows; r++) {
    const dir = dirOf(r);
    const last = r === rows - 1;
    const at = (k) => e + dir * k;
    if (!last) {
      /* Entry (ramp, except on the top shelf), dominoes, then a ball to carry on. */
      let k = 0;
      if (r > 0) { parts.push({ t: 'ramp', r, c: at(0), d: dir }); k = 1; }
      const room = W - 1 - k - 1;
      const n = r === 0 ? 1 + randInt(rng, Math.min(maxDom, room)) : randInt(rng, Math.min(maxDom, room) + 1);
      const hs = run(rng, n, sizes);
      if (!hs) return null;
      hs.forEach((s, j) => parts.push({ t: 'dom', r, c: at(k + j), s }));
      k += n;
      if (r === 0 || n > 0) parts.push({ t: 'ball', r, c: at(k) });
      e = holeOf(m, r);
      continue;
    }
    if (finish === 'seesaw' || finish === 'pulley') {
      const left = dir > 0 ? e : e - 2;
      parts.push({ t: finish, r, c: left });
      parts.push({ t: 'bell', r, c: dir > 0 ? e + 2 : e - 2, hang: finish === 'seesaw' ? 1 : 2 });
      continue;
    }
    if (finish === 'land') { parts.push({ t: 'bell', r, c: e }); continue; }
    parts.push({ t: 'ramp', r, c: at(0), d: dir });
    if (finish === 'bell') {
      const n = randInt(rng, Math.min(maxDom, 4) + 1);
      const hs = run(rng, n, sizes);
      if (!hs) return null;
      hs.forEach((s, j) => parts.push({ t: 'dom', r, c: at(1 + j), s }));
      /* With no dominoes the ball may roll a while before the bell. */
      const gap = n === 0 ? randInt(rng, 3) : 0;
      parts.push({ t: 'bell', r, c: at(1 + n + gap) });
      continue;
    }
    /* fan: ramp, maybe a domino, the fan, the boat on the pond, more pond, the bell. */
    const n = randInt(rng, 2);
    const hs = run(rng, n, sizes);
    if (!hs) return null;
    hs.forEach((s, j) => parts.push({ t: 'dom', r, c: at(1 + j), s }));
    const f = 1 + n;
    parts.push({ t: 'fan', r, c: at(f), d: dir });
    const water = W - f - 2;
    for (let j = 1; j <= water; j++) parts.push({ t: 'pond', r, c: at(f + j) });
    parts.push({ t: 'boat', r, c: at(f + 1) });
    parts.push({ t: 'bell', r, c: at(f + water + 1) });
  }
  if (parts.some((p) => p.c < 0 || p.c >= W || (wide(p.t) && p.c + 2 >= W))) return null;
  return simulate(m).rang ? m : null;
}

/* ------------------------------------------------------------------ */
/* Chapters                                                            */
/* ------------------------------------------------------------------ */

export const CHAPTER_SIZE = 30;
export const TEACH = 2;
export const sizeOf = (ch) => ch.size || CHAPTER_SIZE;

/*   gap     one part is missing: a domino or the ball
     ramp    a ramp is missing: which way should it slope?
     ring    will the bell ring?
     size    a domino is missing: how tall?
     finish  the last machine is missing: seesaw, pulley, fan or ramp
     two     two parts are missing
     stop    where will the machine stop?
     three   three parts are missing, with decoys
     giant   giant dominoes, more shelves, two decoys */
export const CHAPTERS = {
  easy: [
    { id: 'e1', kind: 'build', mode: 'gap', icon: '🁢' },
    { id: 'e2', kind: 'build', mode: 'ramp', icon: '📐' },
    { id: 'e3', kind: 'ring', icon: '🔔' }
  ],
  medium: [
    { id: 'm1', kind: 'build', mode: 'size', icon: '📏' },
    { id: 'm2', kind: 'build', mode: 'finish', icon: '🪣' },
    { id: 'm3', kind: 'build', mode: 'two', icon: '✌️' }
  ],
  hard: [
    { id: 'h1', kind: 'stop', icon: '🛑' },
    { id: 'h2', kind: 'build', mode: 'three', icon: '🧩' },
    { id: 'h3', kind: 'build', mode: 'giant', icon: '🦕' }
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

const pieceOf = (p) => (p.t === 'dom' ? { t: 'dom', s: p.s } : { t: p.t });
const sameCell = (a, b) => a.r === b.r && a.c === b.c;

/** Take parts out of a machine: they become gaps, and go in the tray with the decoys. */
function carve(m, take, decoys, rng) {
  const parts = m.parts.filter((p) => !take.includes(p));
  const gaps = take.map((p) => ({ r: p.r, c: p.c, w: wide(p.t) ? 3 : 1 }));
  const tray = shuffled(rng, [...take.map(pieceOf), ...decoys]);
  return { kind: 'build', rows: m.rows, parts, gaps, tray };
}

/** Is it a fair build puzzle: exactly one way, and every gap needed? */
function unique(p) {
  const sols = solutions(p, 2);
  return sols.length === 1 && sols[0].every((x) => x);
}

const chainParts = (m, f) => m.parts.filter((p) => !p.hang && p.t !== 'pond' && f(p));

/* Decoys that are wrong for a cell: the wrong domino heights, or parts that do the wrong job. */
function decoysFor(rng, take, pool, n) {
  if (take.some((x) => !x)) return [];
  const have = new Set(take.map((p) => (p.t === 'dom' ? `dom${p.s}` : p.t)));
  const opts = shuffled(rng, pool.filter((x) => !have.has(x.t === 'dom' ? `dom${x.s}` : x.t)));
  return opts.slice(0, n);
}

const DECOY_SMALL = [{ t: 'ramp' }, { t: 'fan' }, { t: 'ball' }, { t: 'dom', s: 3 }];

function makeBuild(ch, rng, i, teach) {
  const mode = ch.mode;
  if (teach) return teachBuild(ch.id, i);
  let m;
  let take;
  let decoys;
  switch (mode) {
    case 'gap': {
      m = buildMachine(rng, { rows: 2, sizes: [3], finish: pickOne(rng, ['bell', 'land']), maxDom: 3 + (i > 12 ? 1 : 0) });
      if (!m) return null;
      const cands = chainParts(m, (p) => p.t === 'dom' || p.t === 'ball');
      take = [pickOne(rng, cands)];
      decoys = decoysFor(rng, take, [{ t: 'ramp' }, { t: 'fan' }, { t: 'ball' }, { t: 'dom', s: 3 }], 1);
      break;
    }
    case 'ramp': {
      m = buildMachine(rng, { rows: 2 + (i > 15 && rng() < 0.5 ? 1 : 0), sizes: [3], finish: pickOne(rng, ['bell', 'bell', 'land']) });
      if (!m) return null;
      take = [pickOne(rng, chainParts(m, (p) => p.t === 'ramp'))];
      decoys = i > 10 ? decoysFor(rng, take, [{ t: 'ball' }, { t: 'dom', s: 3 }, { t: 'fan' }], 1) : [];
      break;
    }
    case 'size': {
      m = buildMachine(rng, { rows: 2, sizes: [2, 3, 4], finish: pickOne(rng, ['bell', 'land']), maxDom: 4 });
      if (!m) return null;
      const doms = chainParts(m, (p) => p.t === 'dom');
      /* A domino with neighbours on both sides makes the size rule bite. */
      const inner = doms.filter((p) => doms.some((q) => q.r === p.r && Math.abs(q.c - p.c) === 1));
      if (!inner.length) return null;
      take = [pickOne(rng, inner)];
      decoys = decoysFor(rng, take, [2, 3, 4, 6].map((s) => ({ t: 'dom', s })), 1 + randInt(rng, 2));
      break;
    }
    case 'finish': {
      const finish = pickOne(rng, ['seesaw', 'pulley', 'fan', 'bell']);
      m = buildMachine(rng, { rows: 2 + (i > 14 && rng() < 0.4 ? 1 : 0), sizes: [2, 3, 4], finish, maxDom: 2 });
      if (!m) return null;
      const last = m.rows - 1;
      take = [finish === 'fan' ? chainParts(m, (p) => p.t === 'fan')[0]
        : finish === 'bell' ? chainParts(m, (p) => p.t === 'ramp' && p.r === last)[0]
          : chainParts(m, (p) => wide(p.t))[0]];
      const pool = wide(take[0].t) ? [{ t: 'seesaw' }, { t: 'pulley' }] : [{ t: 'ramp' }, { t: 'fan' }, { t: 'ball' }];
      decoys = decoysFor(rng, take, pool, 1 + (wide(take[0].t) ? 0 : randInt(rng, 2)));
      break;
    }
    case 'two': case 'three': case 'giant': {
      const rows = mode === 'two' ? 2 + randInt(rng, 2) : mode === 'three' ? 3 : 3 + randInt(rng, 2);
      const sizes = mode === 'giant' ? [2, 3, 4, 6] : [2, 3, 4];
      m = buildMachine(rng, { rows, sizes, finish: pickOne(rng, ['bell', 'fan', 'seesaw', 'pulley', 'land']), maxDom: 3 });
      if (!m) return null;
      /* Hard machines should be busy: plenty of dominoes, and a giant one in the giant chapter. */
      const doms = m.parts.filter((q) => q.t === 'dom');
      if (mode !== 'two' && doms.length < (mode === 'giant' ? 5 : 3)) return null;
      if (mode === 'giant' && !doms.some((q) => q.s === 6)) return null;
      const want = mode === 'two' ? 2 : 3;
      const cands = chainParts(m, (p) => p.t !== 'bell');
      if (cands.length < want + 1) return null;
      take = shuffled(rng, cands).slice(0, want);
      if (mode === 'giant' && !take.some((p) => p.t === 'dom')) return null;
      const nd = mode === 'two' ? 1 : mode === 'three' ? 1 + randInt(rng, 2) : 2;
      decoys = decoysFor(rng, take, [...DECOY_SMALL, { t: 'dom', s: 2 }, { t: 'dom', s: 4 }, { t: 'dom', s: 6 }, { t: 'seesaw' }, { t: 'pulley' }], nd);
      break;
    }
    default: return null;
  }
  if (!take.length || take.some((x) => !x)) return null;
  const p = carve(m, take, decoys, rng);
  return unique(p) ? p : null;
}

/** The teaching puzzles of research 4.6, fixed by hand and checked like any other. */
function teachBuild(id, i) {
  const M = (rows, parts) => ({ rows, parts });
  const T = {
    /* D1: a line of dominoes with one missing. Then: the ball is missing. */
    e1: [
      { m: M(2, [{ t: 'dom', r: 0, c: 0, s: 3 }, { t: 'dom', r: 0, c: 1, s: 3 }, { t: 'dom', r: 0, c: 2, s: 3 }, { t: 'ball', r: 0, c: 3 }, { t: 'bell', r: 1, c: 5 }]), take: [1], decoys: [{ t: 'ramp' }] },
      { m: M(2, [{ t: 'dom', r: 0, c: 0, s: 3 }, { t: 'dom', r: 0, c: 1, s: 3 }, { t: 'ball', r: 0, c: 2 }, { t: 'bell', r: 1, c: 5 }]), take: [2], decoys: [{ t: 'fan' }] }
    ],
    /* D3: the ramp that slopes towards the bell. */
    e2: [
      { m: M(2, [{ t: 'dom', r: 0, c: 0, s: 3 }, { t: 'ball', r: 0, c: 1 }, { t: 'ramp', r: 1, c: 5, d: -1 }, { t: 'bell', r: 1, c: 2 }]), take: [2], decoys: [] },
      { m: M(2, [{ t: 'ball', r: 0, c: 0 }, { t: 'ramp', r: 1, c: 5, d: -1 }, { t: 'dom', r: 1, c: 4, s: 3 }, { t: 'dom', r: 1, c: 3, s: 3 }, { t: 'bell', r: 1, c: 2 }]), take: [1], decoys: [] }
    ],
    /* D2: small … gap … large; tray: medium and giant. */
    m1: [
      { m: M(2, [{ t: 'dom', r: 0, c: 0, s: 2 }, { t: 'dom', r: 0, c: 1, s: 3 }, { t: 'dom', r: 0, c: 2, s: 4 }, { t: 'ball', r: 0, c: 3 }, { t: 'bell', r: 1, c: 5 }]), take: [1], decoys: [{ t: 'dom', s: 6 }] },
      { m: M(2, [{ t: 'dom', r: 0, c: 0, s: 4 }, { t: 'dom', r: 0, c: 1, s: 6 }, { t: 'dom', r: 0, c: 2, s: 6 }, { t: 'ball', r: 0, c: 3 }, { t: 'bell', r: 1, c: 5 }]), take: [1], decoys: [{ t: 'dom', s: 2 }] }
    ],
    /* D4 seesaw; D5 pulley (the bell hangs high). */
    m2: [
      { m: M(2, [{ t: 'dom', r: 0, c: 0, s: 3 }, { t: 'ball', r: 0, c: 1 }, { t: 'seesaw', r: 1, c: 3 }, { t: 'bell', r: 1, c: 3, hang: 1 }]), take: [2], decoys: [] },
      { m: M(2, [{ t: 'dom', r: 0, c: 0, s: 3 }, { t: 'ball', r: 0, c: 1 }, { t: 'pulley', r: 1, c: 3 }, { t: 'bell', r: 1, c: 3, hang: 2 }]), take: [2], decoys: [{ t: 'seesaw' }] }
    ],
    /* D7: a domino height gap and a ramp gap. Then a fan and its boat. */
    m3: [
      { m: M(2, [{ t: 'dom', r: 0, c: 0, s: 2 }, { t: 'dom', r: 0, c: 1, s: 3 }, { t: 'dom', r: 0, c: 2, s: 4 }, { t: 'ball', r: 0, c: 3 }, { t: 'ramp', r: 1, c: 5, d: -1 }, { t: 'bell', r: 1, c: 4 }]), take: [1, 4], decoys: [] },
      { m: M(2, [{ t: 'ball', r: 0, c: 0 }, { t: 'ramp', r: 1, c: 5, d: -1 }, { t: 'dom', r: 1, c: 4, s: 3 }, { t: 'fan', r: 1, c: 3, d: -1 }, { t: 'pond', r: 1, c: 2 }, { t: 'pond', r: 1, c: 1 }, { t: 'boat', r: 1, c: 2 }, { t: 'bell', r: 1, c: 0 }]), take: [1, 3], decoys: [] }
    ],
    /* D8: three gaps and a decoy. */
    h2: [
      { m: M(3, [{ t: 'dom', r: 0, c: 0, s: 2 }, { t: 'dom', r: 0, c: 1, s: 3 }, { t: 'ball', r: 0, c: 2 }, { t: 'ramp', r: 1, c: 5, d: -1 }, { t: 'dom', r: 1, c: 4, s: 4 }, { t: 'ball', r: 1, c: 3 }, { t: 'seesaw', r: 2, c: 0 }, { t: 'bell', r: 2, c: 2, hang: 1 }]), take: [1, 3, 6], decoys: [{ t: 'dom', s: 6 }] },
      { m: M(3, [{ t: 'ball', r: 0, c: 0 }, { t: 'ramp', r: 1, c: 5, d: -1 }, { t: 'ball', r: 1, c: 2 }, { t: 'ramp', r: 2, c: 0, d: 1 }, { t: 'dom', r: 2, c: 1, s: 3 }, { t: 'fan', r: 2, c: 2, d: 1 }, { t: 'pond', r: 2, c: 3 }, { t: 'pond', r: 2, c: 4 }, { t: 'boat', r: 2, c: 3 }, { t: 'bell', r: 2, c: 5 }]), take: [1, 3, 5], decoys: [{ t: 'dom', s: 3 }] }
    ],
    h3: [
      { m: M(3, [{ t: 'dom', r: 0, c: 0, s: 2 }, { t: 'dom', r: 0, c: 1, s: 3 }, { t: 'dom', r: 0, c: 2, s: 4 }, { t: 'dom', r: 0, c: 3, s: 6 }, { t: 'ball', r: 0, c: 4 }, { t: 'ramp', r: 1, c: 5, d: -1 }, { t: 'ball', r: 1, c: 4 }, { t: 'pulley', r: 2, c: 0 }, { t: 'bell', r: 2, c: 2, hang: 2 }]), take: [2, 3, 7], decoys: [{ t: 'seesaw' }, { t: 'fan' }] },
      { m: M(3, [{ t: 'dom', r: 0, c: 0, s: 4 }, { t: 'dom', r: 0, c: 1, s: 6 }, { t: 'dom', r: 0, c: 2, s: 6 }, { t: 'ball', r: 0, c: 3 }, { t: 'ramp', r: 1, c: 5, d: -1 }, { t: 'dom', r: 1, c: 4, s: 2 }, { t: 'dom', r: 1, c: 3, s: 3 }, { t: 'dom', r: 1, c: 2, s: 4 }, { t: 'ball', r: 1, c: 1 }, { t: 'land', r: 2, c: 0 }]), take: [1, 6], decoys: [{ t: 'dom', s: 2 }, { t: 'fan' }] }
    ]
  };
  const def = (T[id] || [])[i];
  if (!def) return null;
  const parts = def.m.parts.map((p) => (p.t === 'land' ? { t: 'bell', r: p.r, c: p.c } : p));
  const m = { rows: def.m.rows, parts };
  if (!simulate(m).rang) return null;
  const take = def.take.map((k) => parts[k]);
  return { kind: 'build', rows: m.rows, parts: parts.filter((p) => !take.includes(p)), gaps: take.map((p) => ({ r: p.r, c: p.c, w: wide(p.t) ? 3 : 1 })), tray: [...take.map(pieceOf), ...def.decoys] };
}

/* A flaw that stops a machine: a ramp turned round, a domino too tall, a part taken away, a fan turned round, a bell too high. */
function flaw(rng, m) {
  const ps = m.parts.map((p) => ({ ...p }));
  /* Pick the kind of flaw first, so taking a part away does not crowd out the rest. */
  const kinds = { turn: [], size: [], gone: [], high: [] };
  ps.forEach((p, k) => {
    if (p.t === 'ramp' || p.t === 'fan') kinds.turn.push(() => { ps[k] = { ...p, d: -p.d }; });
    if (p.t === 'dom') {
      const before = ps.find((q) => q.t === 'dom' && q.r === p.r && q.c === p.c - dirOf(p.r));
      const big = before ? SIZES.filter((s) => !topples(before.s, s)) : [];
      if (big.length) kinds.size.push(() => { ps[k] = { ...p, s: pickOne(rng, big) }; });
    }
    if (p.t === 'dom' || p.t === 'ball') kinds.gone.push(() => { ps.splice(k, 1); });
    if (p.t === 'bell' && p.hang === 1) kinds.high.push(() => { ps[k] = { ...p, hang: 2 }; });
  });
  const have = Object.values(kinds).filter((list) => list.length);
  if (!have.length) return null;
  pickOne(rng, pickOne(rng, have))();
  const out = { rows: m.rows, parts: ps };
  return simulate(out).rang ? null : out;
}

function makeRing(rng, i, teach) {
  if (teach) {
    const base = { rows: 2, parts: [{ t: 'dom', r: 0, c: 0, s: 3 }, { t: 'dom', r: 0, c: 1, s: 3 }, { t: 'ball', r: 0, c: 2 }, { t: 'ramp', r: 1, c: 5, d: -1 }, { t: 'bell', r: 1, c: 3 }] };
    if (i === 0) return { kind: 'ring', ...base };
    return { kind: 'ring', rows: 2, parts: base.parts.map((p) => (p.t === 'ramp' ? { ...p, d: 1 } : p)) };
  }
  const m = buildMachine(rng, { rows: 2 + (i > 15 && rng() < 0.4 ? 1 : 0), sizes: i > 10 ? [2, 3, 4] : [3], finish: pickOne(rng, ['bell', 'land', 'seesaw', 'fan']), maxDom: 3 });
  if (!m) return null;
  const bad = rng() < 0.55 ? flaw(rng, m) : null;
  return { kind: 'ring', ...(bad || m) };
}

function makeStop(rng, i, teach) {
  let m;
  if (teach) {
    /* The third domino is too tall for the second; the machine stops at the second. */
    m = { rows: 2, parts: [{ t: 'dom', r: 0, c: 0, s: 3 }, { t: 'dom', r: 0, c: 1, s: 2 }, { t: 'dom', r: 0, c: 2, s: 4 }, { t: 'ball', r: 0, c: 3 }, { t: 'ramp', r: 1, c: 5, d: -1 }, { t: 'bell', r: 1, c: 4 }] };
    if (i === 1) m = { rows: 2, parts: [{ t: 'dom', r: 0, c: 0, s: 3 }, { t: 'ball', r: 0, c: 1 }, { t: 'ramp', r: 1, c: 5, d: 1 }, { t: 'dom', r: 1, c: 4, s: 3 }, { t: 'bell', r: 1, c: 3 }] };
  } else {
    const good = buildMachine(rng, { rows: 2 + randInt(rng, 2), sizes: [2, 3, 4, 6], finish: pickOne(rng, ['bell', 'fan', 'seesaw', 'pulley', 'land']), maxDom: 3 });
    if (!good) return null;
    m = flaw(rng, good);
    if (!m) return null;
  }
  const sim = simulate(m);
  if (sim.rang || !sim.last) return null;
  const last = sim.last;
  /* Choices: the last part to move and three others, some before it and
     some after it (those never move at all). */
  const order = m.parts.filter((p) => !p.hang && p.t !== 'pond' && p.t !== 'ramp').map(keyOf);
  const at = order.indexOf(last);
  const n = Math.min(4, order.length);
  const before = shuffled(rng, order.slice(0, at));
  const after = shuffled(rng, order.slice(at + 1));
  const lo = Math.max(0, n - 1 - after.length);
  const hi = Math.min(n - 1, before.length);
  if (lo > hi) return null;
  const j = lo + randInt(rng, hi - lo + 1);
  const pick = new Set([...before.slice(0, j), last, ...after.slice(0, n - 1 - j)]);
  /* Letters go on in a shuffled order, so the answer's letter tells nothing. */
  const opts = shuffled(rng, order.filter((k) => pick.has(k)));
  if (opts.length < 3) return null;
  return { kind: 'stop', rows: m.rows, parts: m.parts, opts };
}

export function makePuzzle(ch, rng, i = TEACH) {
  const teach = i < TEACH;
  for (let tries = 0; tries < 300; tries++) {
    let p = null;
    if (ch.kind === 'build') p = makeBuild(ch, rng, i, teach);
    else if (ch.kind === 'ring') p = makeRing(rng, i, teach);
    else if (ch.kind === 'stop') p = makeStop(rng, i, teach);
    if (p && !problems(p).length) return p;
    if (teach) return null;
  }
  return null;
}

export const makeAt = (chId, i, ...seed) => makePuzzle(chapter(chId), rngFor('domino', chId, i, ...seed), i);

/** Same machine, same key: the tray's order does not make a new puzzle. */
export function sig(p) {
  const rest = { ...p };
  if (rest.tray) rest.tray = rest.tray.map((x) => JSON.stringify(x)).sort();
  if (rest.parts) rest.parts = rest.parts.map((x) => JSON.stringify(x)).sort();
  return JSON.stringify(Object.keys(rest).sort().map((k) => [k, rest[k]]));
}

/* ------------------------------------------------------------------ */
/* Answers and proof                                                   */
/* ------------------------------------------------------------------ */

export function answers(p) {
  if (p.kind === 'build') return solutions(p, 1)[0] || [];
  const sim = simulate(p);
  if (p.kind === 'ring') return [sim.rang ? 'yes' : 'no'];
  if (p.kind === 'stop') return [p.opts.indexOf(sim.last)];
  return [];
}

export function problems(p) {
  const errs = [];
  const err = (m) => errs.push(m);
  if (!p.rows || p.rows < 2 || p.rows > 4) err('2 to 4 shelves are needed');
  for (const q of p.parts || []) {
    if (q.c < 0 || q.c >= W || q.r < 0 || q.r >= p.rows) err(`a ${q.t} is off the board`);
    if (wide(q.t) && q.c + 2 >= W) err(`a ${q.t} hangs off the board`);
    if (q.t === 'dom' && !SIZES.includes(q.s)) err('a domino of an unknown height');
    if (q.c === holeOf(p, q.r) && !q.hang) err(`a ${q.t} stands over a hole`);
  }
  const seen = new Map();
  for (const q of (p.parts || []).filter((x) => !x.hang && x.t !== 'pond')) {
    for (const c of wide(q.t) ? [q.c, q.c + 1, q.c + 2] : [q.c]) {
      const k = `${q.r},${c}`;
      if (seen.has(k)) err(`a ${q.t} and a ${seen.get(k)} share a cell`);
      seen.set(k, q.t);
    }
  }
  for (const g of p.gaps || []) {
    for (const c of g.w === 3 ? [g.c, g.c + 1, g.c + 2] : [g.c]) if (seen.has(`${g.r},${c}`)) err('a gap is not empty');
  }
  if (!(p.parts || []).some((q) => q.t === 'bell')) err('no bell');
  switch (p.kind) {
    case 'build': {
      if (!p.gaps.length || p.gaps.length > 3) err('1 to 3 gaps are needed');
      if (simulate(p).rang) err('it rings with the gaps empty');
      const sols = solutions(p, 2);
      if (sols.length !== 1) err(`${sols.length} ways ring the bell`);
      else if (!sols[0].every((x) => x)) err('a gap is not needed');
      break;
    }
    case 'ring': break;
    case 'stop': {
      const sim = simulate(p);
      if (sim.rang) err('the bell rings');
      if (!p.opts || p.opts.length < 3) err('3 or 4 choices are needed');
      else if (!p.opts.includes(sim.last)) err('the last part to move is not a choice');
      break;
    }
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
  LEVELS, W, SIZES, topples, maxTopple, dirOf, holeOf, wide, orientable, covers, keyOf, partAt, simulate,
  fits, withPlacement, solutions, buildMachine, CHAPTER_SIZE, TEACH, sizeOf, CHAPTERS, chapter, makePuzzle, makeAt,
  sig, answers, problems, starsFor
};
