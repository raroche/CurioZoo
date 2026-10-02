/**
 * robotgen.js — making Robot Path levels.
 *
 * Program first, board second (the shape of Ahmed et al.'s method, NeurIPS
 * 2020): write a program from the world's template, run it on an empty
 * field to carve the path it walks and drop animals where it feeds, crop
 * that into the grid, add a few dead-end paths, and then check:
 *
 *   - the program really solves the level;
 *   - the world's idea is needed: for loop and helper worlds, the shortest
 *     program with no loops or helpers is longer than the slots allow;
 *   - par (the size for three stars) is the program's own size.
 *
 * Sensor worlds go the other way round: carve a corridor, then check the
 * one "look before you move" program walks it.
 *
 * Pure: no DOM, no Math.random.
 */

import { ANIMALS } from './zooart.js';
import { randInt, rngFor, shuffled } from './logicrng.js';
import { DX, DY, ABS, flatLength, run, sizeOf } from './robotvm.js';

export const LEVELS = ['easy', 'medium', 'hard'];

/**
 * Worlds: a zoo area each, one new idea each. `abs` worlds use screen arrows.
 * palette: the tiles a child may use. rows: which program rows exist.
 */
export const WORLDS = {
  easy: [
    { id: 'e1', kind: 'seq', abs: true, grid: 5, palette: ['U', 'R', 'D', 'L', 'FEED'] },
    { id: 'e2', kind: 'run1', abs: true, grid: 6, palette: ['U', 'R', 'D', 'L', 'FEED', 'rep'] },
    { id: 'e3', kind: 'run2', abs: true, grid: 6, palette: ['U', 'R', 'D', 'L', 'FEED', 'rep'] },
    { id: 'e4', kind: 'loopfeed', abs: true, grid: 6, palette: ['U', 'R', 'D', 'L', 'FEED', 'rep'] }
  ],
  medium: [
    { id: 'm1', kind: 'seqturn', grid: 6, palette: ['F', 'TL', 'TR', 'FEED'] },
    { id: 'm2', kind: 'loopturn', grid: 7, palette: ['F', 'TL', 'TR', 'FEED', 'rep'] },
    { id: 'm3', kind: 'helper', grid: 7, palette: ['F', 'TL', 'TR', 'FEED', 'rep', 'h1'] },
    { id: 'm4', kind: 'colour', grid: 7, palette: ['F', 'TL', 'TR', 'FEED', 'rep'], colours: true }
  ],
  hard: [
    { id: 'h1', kind: 'helpers2', grid: 8, palette: ['F', 'TL', 'TR', 'FEED', 'rep', 'h1', 'h2'] },
    { id: 'h2', kind: 'sense', grid: 8, palette: ['F', 'TL', 'TR', 'FEED', 'if', 'until'] },
    { id: 'h3', kind: 'recur', grid: 8, palette: ['F', 'TL', 'TR', 'FEED', 'if', 'h1'] },
    { id: 'h4', kind: 'mix', grid: 8, palette: ['F', 'TL', 'TR', 'FEED', 'rep', 'if', 'until', 'h1', 'h2'], colours: true }
  ]
};

export const WORLD_SIZE = 50;
export const TEACH = 3;

export function world(id) {
  for (const level of LEVELS) {
    const w = WORLDS[level].find((x) => x.id === id);
    if (w) return { ...w, level };
  }
  return null;
}

const pick = (rng, list) => list[randInt(rng, list.length)];
const between = (rng, a, b) => a + randInt(rng, b - a + 1);
const op = (o, extra = {}) => ({ op: o, ...extra });

/* ------------------------------------------------------------------ */
/* Carving: run a program on an open field                             */
/* ------------------------------------------------------------------ */

/**
 * Walk a program with nothing in the way. Returns the cells it visits, in
 * order, and the cells where it feeds (or null if it feeds one cell twice,
 * which a level could never ask for).
 * `animalAt` decides the "animal" sensor while carving (recursion worlds
 * use the cells where an iteration starts).
 */
function carve(prog, start, { maxMoves = 60, animalAt = () => false, colourAt = () => null } = {}) {
  let [x, y, dir] = start;
  const cells = [[x, y]];
  const feeds = [];
  let moves = 0;
  let steps = 0;
  const fed = new Set();
  const exec = (list, depth) => {
    for (const c of list) {
      if (++steps > 4000 || moves >= maxMoves) return;
      if (c.c && colourAt(x, y) !== c.c) continue;
      switch (c.op) {
        case 'U': case 'R': case 'D': case 'L': dir = ABS[c.op]; x += DX[dir]; y += DY[dir]; cells.push([x, y]); moves += 1; break;
        case 'F': x += DX[dir]; y += DY[dir]; cells.push([x, y]); moves += 1; break;
        case 'TL': dir = (dir + 3) % 4; break;
        case 'TR': dir = (dir + 1) % 4; break;
        case 'FEED': {
          const k = `${x},${y}`;
          if (fed.has(k)) throw new Error('feeds twice');
          fed.add(k);
          feeds.push([x, y]);
          break;
        }
        case 'rep': for (let n = 0; n < c.n; n++) exec(c.body, depth); break;
        case 'call': if (depth < 12) exec(prog[c.p] || [], depth + 1); break;
        case 'if': exec(c.cond === 'animal' && animalAt(x, y, moves) ? c.then : (c.cond === 'animal' ? c.else || [] : c.then), depth); break;
        default: break;
      }
    }
  };
  try { exec(prog.main, 0); } catch { return null; }
  return { cells, feeds, end: [x, y, dir] };
}

/* ------------------------------------------------------------------ */
/* Turning a carved path into a level                                  */
/* ------------------------------------------------------------------ */

function toLevel(w, carved, start, rng, { colours = null, decoys = true, animalCells = null } = {}) {
  const pts = [...carved.cells];
  const feeds = animalCells || carved.feeds;
  if (!feeds.length) return null;
  const xs = pts.map(([x]) => x);
  const ys = pts.map(([, y]) => y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const spanX = Math.max(...xs) - minX + 1;
  const spanY = Math.max(...ys) - minY + 1;
  if (spanX > w.grid || spanY > w.grid) return null;
  const ox = randInt(rng, w.grid - spanX + 1) - minX;
  const oy = randInt(rng, w.grid - spanY + 1) - minY;
  const grid = Array.from({ length: w.grid }, () => Array(w.grid).fill('#'));
  for (const [x, y] of pts) grid[y + oy][x + ox] = '.';
  if (colours) for (const [k, c] of colours) { const [x, y] = k.split(',').map(Number); grid[y + oy][x + ox] = c; }
  if (decoys) {
    /* A few dead ends, so the path is not simply "the only open squares". */
    const open = [];
    grid.forEach((row, y) => row.forEach((v, x) => { if (v !== '#') open.push([x, y]); }));
    for (let d = 0; d < 3; d++) {
      const [x, y] = pick(rng, open);
      const k = randInt(rng, 4);
      const nx = x + DX[k];
      const ny = y + DY[k];
      if (nx >= 0 && ny >= 0 && nx < w.grid && ny < w.grid && grid[ny][nx] === '#') grid[ny][nx] = '.';
    }
  }
  const kinds = shuffled(rng, ANIMALS.map((a) => a.id));
  return {
    cells: grid.map((r) => r.join('')).join('/'),
    animals: feeds.map(([x, y], i) => [x + ox, y + oy, kinds[i % kinds.length]]),
    start: [start[0] + ox, start[1] + oy, start[2]]
  };
}

/* ------------------------------------------------------------------ */
/* Programs from each world's template                                 */
/* ------------------------------------------------------------------ */

const ABS_DIRS = ['U', 'R', 'D', 'L'];
const opposite = { U: 'D', D: 'U', L: 'R', R: 'L' };
const turnOp = (rng) => (rng() < 0.5 ? 'TL' : 'TR');

/** A walk that never visits a square twice, as screen arrows. */
function absWalk(rng, len) {
  const out = [];
  let x = 0; let y = 0;
  const seen = new Set(['0,0']);
  for (let i = 0; i < len; i++) {
    const options = ABS_DIRS.filter((d) => {
      const k = `${x + DX[ABS[d]]},${y + DY[ABS[d]]}`;
      return !seen.has(k) && d !== opposite[out[out.length - 1]];
    });
    if (!options.length) return null;
    const d = pick(rng, options);
    x += DX[ABS[d]]; y += DY[ABS[d]];
    seen.add(`${x},${y}`);
    out.push(d);
  }
  return out;
}

function makeProgram(w, rng) {
  const P = (main, h1, h2) => ({ main, ...(h1 ? { h1 } : {}), ...(h2 ? { h2 } : {}) });
  switch (w.kind) {
    case 'seq': {
      const walk = absWalk(rng, between(rng, 3, 7));
      if (!walk) return null;
      const main = walk.map((d) => op(d));
      const mid = randInt(rng, main.length);
      if (rng() < 0.5 && mid < main.length - 1) main.splice(mid + 1, 0, op('FEED'));
      main.push(op('FEED'));
      return P(main);
    }
    case 'run1': {
      const main = [];
      let last = null;
      for (let b = 0; b < between(rng, 2, 3); b++) {
        const d = pick(rng, ABS_DIRS.filter((x) => x !== last && x !== opposite[last]));
        main.push(op('rep', { n: between(rng, 2, 4), body: [op(d)] }));
        if (rng() < 0.3) main.push(op('FEED'));
        last = d;
      }
      if (main[main.length - 1].op !== 'FEED') main.push(op('FEED'));
      return P(main);
    }
    case 'run2': {
      const d1 = pick(rng, ABS_DIRS);
      const d2 = pick(rng, ABS_DIRS.filter((x) => x !== d1 && x !== opposite[d1]));
      const body = rng() < 0.6 ? [op(d1), op(d2)] : [op(d1), op(d1), op(d2)];
      const main = [];
      if (rng() < 0.4) main.push(op(pick(rng, [d1, d2])));
      main.push(op('rep', { n: between(rng, 3, 5), body }), op('FEED'));
      return P(main);
    }
    case 'loopfeed': {
      const d1 = pick(rng, ABS_DIRS);
      const body = rng() < 0.5 ? [op(d1), op('FEED')] : [op(d1), op(d1), op('FEED')];
      const main = [op('rep', { n: between(rng, 2, 4), body })];
      if (rng() < 0.6) {
        const d2 = pick(rng, ABS_DIRS.filter((x) => x !== d1 && x !== opposite[d1]));
        main.push(op('rep', { n: between(rng, 2, 3), body: [op(d2)] }), op('FEED'));
      }
      return P(main);
    }
    case 'seqturn': {
      const main = [];
      for (let s = 0; s < between(rng, 2, 4); s++) {
        for (let k = 0; k < between(rng, 1, 3); k++) main.push(op('F'));
        if (rng() < 0.3) main.push(op('FEED'));
        main.push(op(turnOp(rng)));
      }
      main.push(op('F'), op('FEED'));
      return P(main);
    }
    case 'loopturn': {
      const t = turnOp(rng);
      const shapes = [
        [op('F'), op('F'), op(t)],
        [op('F'), op('TR'), op('F'), op('TL')],
        [op('F'), op('TL'), op('F'), op('TR')],
        [op('F'), op('F'), op('FEED'), op(t)],
        [op('F'), op('FEED'), op(t), op('F')]
      ];
      const body = pick(rng, shapes);
      const main = [op('rep', { n: between(rng, 2, 4), body })];
      if (!body.some((c) => c.op === 'FEED')) main.push(op('FEED'));
      return P(main);
    }
    case 'helper': {
      const shapes = [
        [op('F'), op('F'), op('FEED')], [op('F'), op('TR'), op('F'), op('FEED')], [op('F'), op('TL'), op('F'), op('FEED')],
        [op('F'), op('F'), op('TL'), op('F'), op('FEED')], [op('F'), op('FEED'), op('F')]
      ];
      const h1 = pick(rng, shapes);
      const main = [op('call', { p: 'h1' })];
      for (let k = 0; k < between(rng, 2, 3); k++) main.push(op(turnOp(rng)), op('call', { p: 'h1' }));
      return P(main, h1);
    }
    case 'helpers2': {
      const h1 = pick(rng, [[op('F'), op('F'), op('FEED')], [op('F'), op('TR'), op('F'), op('FEED')], [op('F'), op('FEED'), op('F')]]);
      const h2 = pick(rng, [[op('TL'), op('F')], [op('TR'), op('F'), op('F')], [op('F'), op('TR')], [op('TL'), op('F'), op('TL')]]);
      const main = shuffled(rng, [op('call', { p: 'h1' }), op('call', { p: 'h1' }), op('call', { p: 'h2' }), op('call', { p: 'h2' }),
        ...(rng() < 0.5 ? [op('call', { p: 'h1' })] : [])]);
      return P(main, h1, h2);
    }
    default: return null;
  }
}

/* The colour world: a winding path whose turns are painted, walked by one
   short loop that turns only on paint. */
function makeColourLevel(w, rng) {
  const segs = between(rng, 3, 5);
  const moves = [];
  let dir = randInt(rng, 4);
  const start = [0, 0, dir];
  const turns = [];
  for (let s = 0; s < segs; s++) {
    const len = between(rng, 1, 3);
    for (let k = 0; k < len; k++) moves.push(dir);
    if (s < segs - 1) {
      const t = rng() < 0.5 ? 'TR' : 'TL';
      turns.push([moves.length, t]);
      dir = t === 'TR' ? (dir + 1) % 4 : (dir + 3) % 4;
    }
  }
  let x = 0; let y = 0;
  const cells = [[0, 0]];
  const seen = new Set(['0,0']);
  const colours = new Map();
  for (let i = 0; i < moves.length; i++) {
    x += DX[moves[i]]; y += DY[moves[i]];
    const k = `${x},${y}`;
    if (seen.has(k)) return null;
    seen.add(k);
    cells.push([x, y]);
    const t = turns.find(([at]) => at === i + 1);
    if (t) colours.set(k, t[1] === 'TR' ? 'o' : 'b');
  }
  const prog = { main: [op('rep', { n: moves.length, body: [op('F'), op('TR', { c: 'o' }), op('TL', { c: 'b' })] }), op('FEED')] };
  const lvl = toLevel(w, { cells, feeds: [[x, y]] }, start, rng, { colours });
  return lvl && { lvl, prog };
}

/* The sensor world: a corridor that never touches itself, and the one
   program that looks before every step. */
function makeSenseLevel(w, rng) {
  const len = between(rng, 8, 16);
  let x = 0; let y = 0; let dir = randInt(rng, 4);
  const start = [0, 0, dir];
  const cells = [[0, 0]];
  const seen = new Set(['0,0']);
  const touches = (nx, ny, px, py) => [0, 1, 2, 3].some((k) => {
    const ax = nx + DX[k]; const ay = ny + DY[k];
    return !(ax === px && ay === py) && seen.has(`${ax},${ay}`);
  });
  let rights = 0; let lefts = 0;
  for (let i = 0; i < len; i++) {
    let d = dir;
    if (i > 0 && rng() < 0.35) { const t = rng() < 0.5 ? 1 : 3; d = (dir + t) % 4; if (t === 1) rights += 1; else lefts += 1; }
    const nx = x + DX[d]; const ny = y + DY[d];
    if (seen.has(`${nx},${ny}`) || touches(nx, ny, x, y)) return null;
    x = nx; y = ny; dir = d;
    seen.add(`${x},${y}`);
    cells.push([x, y]);
  }
  if (!rights && !lefts) return null;
  const feedsAt = shuffled(rng, cells.slice(2, -1)).slice(0, randInt(rng, 2)).concat([cells[cells.length - 1]]);
  const turn = !lefts ? [op('TR')] : !rights ? [op('TL')] : [op('if', { cond: 'right', then: [op('TR')], else: [op('TL')] })];
  const prog = { main: [op('until', { body: [op('if', { cond: 'animal', then: [op('FEED')], else: [] }), op('if', { cond: 'ahead', then: [op('F')], else: turn })] })] };
  const lvl = toLevel(w, { cells, feeds: feedsAt }, start, rng, { decoys: false });
  return lvl && { lvl, prog };
}

/* The recursion world: a helper that ends by calling itself. */
function makeRecurLevel(w, rng) {
  const patterns = [
    [op('F'), op('TR'), op('F'), op('TL')], [op('F'), op('TL'), op('F'), op('TR')],
    [op('F'), op('F'), op('TR')], [op('F'), op('F'), op('TL')], [op('F'), op('TR'), op('F'), op('F'), op('TL')]
  ];
  const body = pick(rng, patterns);
  const h1 = [op('if', { cond: 'animal', then: [op('FEED')], else: [] }), ...body, op('call', { p: 'h1' })];
  const prog = { main: [op('call', { p: 'h1' })], h1 };
  const iters = between(rng, 3, 6);
  const per = body.filter((c) => c.op === 'F').length;
  /* Where each turn of the helper starts: the squares the "animal?" check sees. */
  const starts = [];
  const dir0 = randInt(rng, 4);
  const carved = carve(prog, [0, 0, dir0], { maxMoves: iters * per, animalAt: (x, y, m) => { if (m % per === 0) starts.push([x, y]); return false; } });
  if (!carved) return null;
  const uniq = [...new Map(starts.slice(1, iters + 1).map((p) => [p.join(','), p])).values()];
  if (uniq.length < 2) return null;
  const feeds = shuffled(rng, uniq.slice(0, -1)).slice(0, randInt(rng, 2)).concat([uniq[uniq.length - 1]]);
  const lvl = toLevel(w, carved, [0, 0, dir0], rng, { animalCells: feeds, decoys: false });
  return lvl && { lvl, prog };
}

/* ------------------------------------------------------------------ */
/* One level                                                           */
/* ------------------------------------------------------------------ */

function slotsFor(prog, slack) {
  const s = { main: sizeOf(prog.main) + slack };
  if (prog.h1) s.h1 = sizeOf(prog.h1) + slack;
  if (prog.h2) s.h2 = sizeOf(prog.h2) + slack;
  return s;
}

const NEEDS_ABSTRACTION = new Set(['run1', 'run2', 'loopfeed', 'loopturn', 'helper', 'helpers2', 'colour']);

export function makeLevel(wDef, rng, { tries = 300 } = {}) {
  const w0 = wDef.level ? wDef : world(wDef.id);
  for (let attempt = 0; attempt < tries; attempt++) {
    let w = w0;
    let kind = w.kind;
    if (kind === 'mix') { kind = pick(rng, ['helper', 'helpers2', 'colour', 'loopturn', 'recur', 'sense']); w = { ...w0, kind }; }
    let made = null;
    if (kind === 'colour') made = makeColourLevel(w, rng);
    else if (kind === 'sense') made = makeSenseLevel(w, rng);
    else if (kind === 'recur') made = makeRecurLevel(w, rng);
    else {
      const prog = makeProgram(w, rng);
      if (!prog) continue;
      const start = [0, 0, w.abs ? 1 : randInt(rng, 4)];
      const carved = carve(prog, start);
      if (!carved || !carved.feeds.length) continue;
      const lvl = toLevel(w, carved, start, rng);
      made = lvl && { lvl, prog };
    }
    if (!made) continue;
    const { lvl, prog } = made;
    const level = { ...lvl, abs: Boolean(w0.abs) };
    /* No animal on the robot's own square: the first thing to do is move. */
    if (level.animals.some(([ax, ay]) => ax === level.start[0] && ay === level.start[1])) continue;
    const res = run(level, prog);
    if (!res.ok) continue;
    const flat = flatLength(level, Boolean(w0.abs));
    if (!Number.isFinite(flat)) continue;
    let slots;
    let par;
    if (kind === 'seq' || kind === 'seqturn') {
      /* Room for the shortest program and two spare tiles, and always for
         the program the level was made from. */
      slots = { main: Math.max(flat + 2, sizeOf(prog.main)) };
      par = flat;
      if (flat > 12 || flat < 4) continue;
    } else {
      slots = slotsFor(prog, kind === 'sense' || kind === 'recur' ? 1 : randInt(rng, 2));
      par = sizeOf(prog.main) + sizeOf(prog.h1) + sizeOf(prog.h2);
      const room = slots.main + (slots.h1 || 0) + (slots.h2 || 0);
      /* The world's idea must be needed: the plain program does not fit. */
      if (NEEDS_ABSTRACTION.has(kind) && flat <= room) continue;
    }
    return {
      ...level, kind, palette: w0.palette, colours: Boolean(w0.colours || kind === 'colour'),
      slots, ref: prog, par, flat
    };
  }
  return null;
}

export const makeAt = (id, ...seed) => makeLevel(world(id), rngFor('robot', id, ...seed));

/** A level's shape, for spotting repeats. */
export const shapeOf = (l) => JSON.stringify([l.cells, l.start, l.animals.map(([x, y]) => [x, y])]);

export default { LEVELS, WORLDS, WORLD_SIZE, TEACH, world, makeLevel, makeAt, shapeOf };
