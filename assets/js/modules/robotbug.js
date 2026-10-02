/**
 * robotbug.js — Fix the Bug: putting one mistake in a working robot program.
 *
 * Every puzzle starts from a Robot Path level and the program that solves it,
 * then changes one thing, the way children's programs actually go wrong
 * (docs/research/logic/research-robot.md, section 6):
 *
 *   M1 a turn the wrong way (or the mirror arrow)   left/right perspective
 *   M2 a Repeat one too many or one too few          "repeat 3" read as 4
 *   M3 a step missing                                Code.org "missing block"
 *   M4 an extra step                                 "extra block"
 *   M5 two steps swapped                             "wrong order"
 *   M6 a step on the wrong side of a Repeat          what the loop covers
 *   M7 the wrong helper called, or a call missing    procedure flow
 *   M8 the wrong condition, or the wrong paint       conditions
 *   M9 a Feed missing                                the goal forgotten
 *
 * A puzzle is kept only if the changed program fails, fails after doing
 * something right first (a bug on the very first tile is no puzzle), and the
 * number of places one change can fix it is small (exactly one on Easy, at
 * most three later). Any fix that works is accepted when a child plays.
 *
 * Pure: no DOM, no Math.random.
 */

import * as V from './robotvm.js';
import { randInt, shuffled } from './logicrng.js';

export const MUTATIONS = ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9'];
export const LEVELS = ['easy', 'medium', 'hard'];

/**
 * Chapters of Fix the Bug. `from`: the Robot Path worlds its programs come
 * from. `exact`: only one place may fix it (Easy). `maxMoves`: how long a
 * program a child is asked to trace in their head.
 */
export const CHAPTERS = {
  easy: [
    { id: 'e1', mode: 'find', from: ['e1', 'e2'], exact: true },
    { id: 'e2', mode: 'order', from: ['e1'] },
    { id: 'e3', mode: 'fix', from: ['e2', 'e3', 'e4'], exact: true },
    { id: 'e4', mode: 'predict', from: ['e1', 'e2', 'e3', 'e4'], maxMoves: 10 }
  ],
  medium: [
    { id: 'm1', mode: 'fix', from: ['m1', 'm2'] },
    { id: 'm2', mode: 'fix', from: ['m3', 'm4'] },
    { id: 'm3', mode: 'predict', from: ['m1', 'm2', 'm3', 'm4'], maxMoves: 16 },
    { id: 'm4', mode: 'find', from: ['m1', 'm2', 'm4'] }
  ],
  hard: [
    { id: 'h1', mode: 'fix', from: ['h1'] },
    { id: 'h2', mode: 'fix', from: ['h2', 'h3'] },
    { id: 'h3', mode: 'predict', from: ['h1', 'h3', 'h4'], maxMoves: 24 },
    { id: 'h4', mode: 'fix', from: ['h4'] }
  ]
};
export const CHAPTER_SIZE = 50;
export const TEACH = 3;

export function chapter(id) {
  for (const level of LEVELS) {
    const ch = CHAPTERS[level].find((c) => c.id === id);
    if (ch) return { ...ch, level };
  }
  return null;
}

const SIMPLE = ['U', 'R', 'D', 'L', 'F', 'TL', 'TR', 'FEED'];
const MIRROR = { L: 'R', R: 'L', U: 'D', D: 'U', TL: 'TR', TR: 'TL' };
const enc = (p) => p.join('.');

/** Every place in a program: its tiles, with their list and index. */
function places(prog) {
  const out = [];
  const walk = (list, path) => list.forEach((c, i) => {
    out.push({ c, list, i, path: [...path, i], listPath: path });
    for (const k of ['body', 'then', 'else']) if (c[k]) walk(c[k], [...path, i, k]);
  });
  for (const r of V.ROWS) if (prog[r]) walk(prog[r], [r]);
  return out;
}

/* ------------------------------------------------------------------ */
/* Mutations                                                           */
/* ------------------------------------------------------------------ */

/** Every single mutation of a program, as { m, prog, at }. */
export function mutations(prog, palette) {
  const out = [];
  const add = (m, at, change) => {
    const p = V.clone(prog);
    if (change(p) === false) return;
    out.push({ m, prog: p, at });
  };
  const simple = palette.filter((o) => SIMPLE.includes(o));
  places(prog).forEach(({ c, path, listPath, i }) => {
    const get = (p) => V.listAt(p, listPath);
    if (MIRROR[c.op] && simple.includes(MIRROR[c.op])) add('M1', path, (p) => { get(p)[i].op = MIRROR[c.op]; });
    if (c.op === 'rep') {
      if (c.n < 9) add('M2', path, (p) => { get(p)[i].n += 1; });
      if (c.n > 2) add('M2', path, (p) => { get(p)[i].n -= 1; });
    }
    if (SIMPLE.includes(c.op) && c.op !== 'FEED') add('M3', path, (p) => { get(p).splice(i, 1); });
    if (c.op === 'FEED') add('M9', path, (p) => { get(p).splice(i, 1); });
    if (['F', 'U', 'R', 'D', 'L'].includes(c.op)) add('M4', path, (p) => { get(p).splice(i, 0, { op: c.op }); });
    const list = V.listAt(prog, listPath);
    if (i + 1 < list.length && JSON.stringify(list[i + 1]) !== JSON.stringify(c)) {
      add('M5', path, (p) => { const l = get(p); [l[i], l[i + 1]] = [l[i + 1], l[i]]; });
    }
    if (c.op === 'rep' && c.body.length > 1) {
      add('M6', path, (p) => { const l = get(p); const last = l[i].body.pop(); l.splice(i + 1, 0, last); });
      if (i > 0 && SIMPLE.includes(list[i - 1].op)) add('M6', path, (p) => { const l = get(p); const prev = l.splice(i - 1, 1)[0]; l[i - 1].body.unshift(prev); });
    }
    if (c.op === 'call') {
      if (prog.h2 && prog.h1) add('M7', path, (p) => { get(p)[i].p = c.p === 'h1' ? 'h2' : 'h1'; });
      add('M7', path, (p) => { get(p).splice(i, 1); });
    }
    if (c.op === 'if') {
      for (const cond of ['ahead', 'left', 'right', 'animal']) if (cond !== c.cond) add('M8', path, (p) => { get(p)[i].cond = cond; });
      if ((c.else || []).length) add('M8', path, (p) => { const t = get(p)[i]; [t.then, t.else] = [t.else, t.then]; });
    }
    if (c.c) add('M8', path, (p) => { get(p)[i].c = c.c === 'o' ? 'b' : 'o'; });
  });
  return out;
}

/* ------------------------------------------------------------------ */
/* One change away                                                     */
/* ------------------------------------------------------------------ */

/**
 * Every program one edit away, tagged with where the edit is. The edits a
 * child can make: change a tile to another, remove it, add a tile, swap two
 * neighbours, change a Repeat's count, an If's condition, a tile's paint.
 */
export function oneEdits(prog, palette) {
  const out = [];
  const simple = palette.filter((o) => SIMPLE.includes(o));
  const add = (where, change) => { const p = V.clone(prog); change(p); out.push({ where, prog: p }); };
  const lists = [];
  const walkLists = (list, path) => {
    lists.push(path);
    list.forEach((c, i) => { for (const k of ['body', 'then', 'else']) if (c[k]) walkLists(c[k], [...path, i, k]); });
  };
  for (const r of V.ROWS) if (prog[r]) walkLists(prog[r], [r]);
  for (const lp of lists) {
    const n = V.listAt(prog, lp).length;
    for (let i = 0; i <= n; i++) for (const o of simple) add(`ins:${enc(lp)}:${i}`, (p) => V.listAt(p, lp).splice(i, 0, { op: o }));
  }
  places(prog).forEach(({ c, path, listPath, i }) => {
    const where = enc(path);
    const get = (p) => V.listAt(p, listPath);
    add(where, (p) => get(p).splice(i, 1));
    if (SIMPLE.includes(c.op)) for (const o of simple) if (o !== c.op) add(where, (p) => { get(p)[i] = { ...get(p)[i], op: o }; });
    if (c.op === 'rep') for (let n = 2; n <= 9; n++) if (n !== c.n) add(where, (p) => { get(p)[i].n = n; });
    if (c.op === 'if') for (const cond of ['ahead', 'left', 'right', 'animal']) if (cond !== c.cond) add(where, (p) => { get(p)[i].cond = cond; });
    if (c.op === 'call') add(where, (p) => { get(p)[i].p = c.p === 'h1' ? 'h2' : 'h1'; });
    if (SIMPLE.includes(c.op)) for (const col of [undefined, 'o', 'b']) if (col !== c.c) add(where, (p) => { const t = get(p)[i]; if (col) t.c = col; else delete t.c; });
    const list = V.listAt(prog, listPath);
    if (i + 1 < list.length) add(`${where}~`, (p) => { const l = get(p); [l[i], l[i + 1]] = [l[i + 1], l[i]]; });
  });
  return out;
}

/** The places where one edit makes the program work. */
export function fixPlaces(level, prog) {
  const at = new Set();
  for (const { where, prog: p } of oneEdits(prog, level.palette)) {
    if (V.run(level, p).ok) at.add(where.startsWith('ins:') ? where.split(':').slice(0, 2).join(':') : where.replace(/~$/, ''));
  }
  return at;
}

/** Where the robot ends up, and which way it faces. */
export function endOf(level, prog) {
  const r = V.run(level, prog);
  const last = r.events[r.events.length - 1];
  const [x, y, dir] = last ? [last.x, last.y, last.dir] : level.start;
  return { x, y, dir, ok: r.ok, why: r.why, moves: r.events.filter((e) => e.k === 'move').length };
}

/* ------------------------------------------------------------------ */
/* Puzzles                                                             */
/* ------------------------------------------------------------------ */

/**
 * mode: 'fix' (edit the program), 'find' (tap the wrong tile, then choose its
 * replacement), 'order' (put mixed-up tiles in order), 'predict' (where will
 * the robot stop?). `easy` asks for exactly one place to fix.
 */
export function makeBugPuzzle(level, mode, rng, { easy = false, maxMoves = 24 } = {}) {
  const ref = level.ref;
  if (mode === 'order') {
    if (ref.h1 || ref.main.some((c) => !SIMPLE.includes(c.op)) || ref.main.length < 3) return null;
    for (let t = 0; t < 20; t++) {
      const mixed = shuffled(rng, ref.main);
      if (JSON.stringify(mixed) === JSON.stringify(ref.main) || V.run(level, { main: mixed }).ok) continue;
      return { mode, start: { main: mixed } };
    }
    return null;
  }
  const muts = shuffled(rng, mutations(ref, level.palette));
  for (const mu of muts) {
    const r = V.run(level, mu.prog);
    if (r.ok || r.why === 'tired' || r.why === 'deep') continue;
    const good = r.events.filter((e) => e.k === 'move' || e.k === 'feed').length;
    if (good < 2) continue;
    if (mode === 'predict') {
      const end = endOf(level, mu.prog);
      if (end.moves > maxMoves) continue;
      /* Wrong answers a child really gives: where the loop-once-more, the
         mirror turn, and the right program would have stopped. */
      const others = mutations(mu.prog, level.palette).filter((x) => ['M1', 'M2'].includes(x.m))
        .map((x) => endOf(level, x.prog)).filter((e) => e.why !== 'tired');
      others.push(endOf(level, ref));
      const key = (e) => `${e.x},${e.y}`;
      const seen = new Set([key(end)]);
      const wrong = [];
      for (const e of others) if (!seen.has(key(e))) { seen.add(key(e)); wrong.push([e.x, e.y]); }
      if (wrong.length < 2) continue;
      const choices = shuffled(rng, [[end.x, end.y], ...wrong.slice(0, 3)]);
      return { mode, start: mu.prog, bug: { m: mu.m, at: mu.at }, answer: [end.x, end.y], choices };
    }
    const fixes = fixPlaces(level, mu.prog);
    if (!fixes.size || fixes.size > (easy ? 1 : 3)) continue;
    if (mode === 'find') {
      const tile = V.tileAt(mu.prog, mu.at);
      const right = V.tileAt(ref, mu.at);
      if (!tile || !right || !fixes.has(enc(mu.at)) || ['M3', 'M4', 'M5', 'M6', 'M9'].includes(mu.m)) continue;
      /* Three replacements to choose from: the right one and two that do not work. */
      const opts = [];
      const tryOpt = (t) => {
        if (opts.some((o) => JSON.stringify(o) === JSON.stringify(t))) return;
        const p = V.clone(mu.prog);
        V.listAt(p, mu.at.slice(0, -1))[mu.at[mu.at.length - 1]] = t;
        if (!V.run(level, p).ok) opts.push(t);
      };
      if (right.op === 'rep') {
        for (const n of shuffled(rng, [2, 3, 4, 5, 6])) if (n !== right.n) tryOpt({ ...right, n });
      } else {
        for (const o of shuffled(rng, level.palette.filter((x) => SIMPLE.includes(x)))) if (o !== right.op) tryOpt({ ...right, op: o });
      }
      if (opts.length < 2) continue;
      const options = shuffled(rng, [right, ...opts.slice(0, 2)]);
      return { mode, start: mu.prog, bug: { m: mu.m, at: mu.at }, options };
    }
    return { mode: 'fix', start: mu.prog, bug: { m: mu.m, at: mu.at }, fixes: fixes.size };
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Stars                                                               */
/* ------------------------------------------------------------------ */

/**
 *   fix       ★★★ found before a single failed run · ★★ fixed in few edits · ★
 *   find      ★★★ right tile and right fix first time · ★★ one slip · ★
 *   order     ★★★ first run · ★★ second · ★
 *   predict   ★★★ first answer · ★
 */
export function starsFor(mode, { runs = 1, edits = 1, slips = 0 } = {}) {
  if (mode === 'predict') return runs <= 1 ? 3 : 1;
  if (mode === 'find') return slips === 0 ? 3 : slips === 1 ? 2 : 1;
  if (mode === 'order') return runs <= 1 ? 3 : runs <= 2 ? 2 : 1;
  if (runs <= 1) return 3;
  return edits <= 2 ? 2 : 1;
}

export const randomPick = (rng, list) => list[randInt(rng, list.length)];

export default { MUTATIONS, LEVELS, CHAPTERS, CHAPTER_SIZE, TEACH, chapter, mutations, oneEdits, fixPlaces, endOf, makeBugPuzzle, starsFor, randomPick };
