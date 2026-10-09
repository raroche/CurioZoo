#!/usr/bin/env node
/**
 * Build a Logic Games puzzle bank.
 *
 *   node tools/logicbuild.mjs code            all three levels
 *   node tools/logicbuild.mjs code --level hard
 *
 * Writes data/logic/<game>/<level>.json from fixed seeds, so running it twice
 * writes the same file. Every puzzle is made by the same module the page uses
 * and then checked the way tools/logiccheck.mjs checks it; if one fails,
 * nothing is written.
 *
 * Rebuilding changes puzzles that children may already have solved, and their
 * stars are stored by puzzle id. Only rebuild a level that has not shipped, or
 * on purpose.
 */

import fs from 'node:fs';
import path from 'node:path';
import * as C from '../assets/js/modules/codelogic.js';
import { ANIMALS } from '../assets/js/modules/zooart.js';
import { rngFor } from '../assets/js/modules/logicrng.js';
import * as T from '../assets/js/modules/truthlogic.js';
import * as R from '../assets/js/modules/rulelogic.js';
import * as B from '../assets/js/modules/bridgeslogic.js';
import * as TR from '../assets/js/modules/trainslogic.js';
import * as RG from '../assets/js/modules/robotgen.js';
import * as BG from '../assets/js/modules/robotbug.js';
import * as RV from '../assets/js/modules/robotvm.js';
import * as J from '../assets/js/modules/jamlogic.js';
import * as GT from '../assets/js/modules/gateslogic.js';
import * as MR from '../assets/js/modules/mirrorslogic.js';
import { checkBridgesBank, checkBugBank, checkCodeBank, checkGatesBank, checkJamBank, checkMirrorsBank, checkRobotBank, checkRuleBank, checkTrainsBank, checkTruthBank } from './logiccheck.mjs';

const args = process.argv.slice(2);
const game = args[0];
const onlyLevel = args.includes('--level') ? args[args.indexOf('--level') + 1] : null;

/* ------------------------------------------------------------------ */
/* Crack the Code                                                      */
/* ------------------------------------------------------------------ */

/* The famous lock: "682: one number is right and in its place..." It has
   circulated for years with no known author; the answer is 042. It is not
   minimal (three of its five clues are enough), which is part of the fun of
   it, so it is marked hand-made and the checker allows the spare clues. */
const LOCK_682 = {
  mode: 'clue', hand: true, teach: true,
  secret: [0, 4, 2],
  clues: [[6, 8, 2], [6, 1, 4], [2, 0, 6], [7, 3, 8], [3, 8, 0]]
};

const pad = (n) => String(n).padStart(2, '0');

/** Stable, readable key for spotting a repeated puzzle. */
const sig = (p) => JSON.stringify([p.mode, p.secret, p.clues || null, p.cand || null]);

function buildCodeChapter(chDef, level) {
  const ch = C.chapter(chDef.id);
  const want = { clue: 0, could: 0, free: 0 };
  for (let i = 0; i < C.CHAPTER_SIZE; i++) want[C.modeAt(i)] += 1;

  /* Clue Safes: make extra, then order from gentle to hard. */
  const clues = [];
  const seen = new Set();
  for (let j = 0; clues.length < want.clue + 12 && j < 4000; j++) {
    const p = C.makePuzzle(ch, 'clue', [ch.id, 'clue', j]);
    if (!p || seen.has(sig(p))) continue;
    seen.add(sig(p));
    clues.push(p);
  }
  const ease = (p) => p.tier * 1000 + p.steps * 10 + p.clues.length;
  clues.sort((a, b) => ease(a) - ease(b));
  if (ch.id === 'm4') clues.unshift({ ...LOCK_682, tier: 3, steps: C.humanSolve(ch, C.cluesOf(ch, LOCK_682)).steps.length });
  const pickedClues = clues.slice(0, want.clue);
  /* Keep a gentle start, then spread the rest so a chapter climbs but does
     not end on twenty of the hardest in a row. */
  const order = [...pickedClues.slice(0, C.TEACH), ...interleave(pickedClues.slice(C.TEACH))];

  const could = [];
  for (let j = 0; could.length < want.could && j < 2000; j++) {
    const p = C.makePuzzle(ch, 'could', [ch.id, 'could', j]);
    if (!p || seen.has(sig(p))) continue;
    /* Keep yes and no about even. */
    const yes = could.filter((q) => q.yes).length;
    if (p.yes && yes > could.length - yes + 1) continue;
    if (!p.yes && could.length - yes > yes + 1) continue;
    seen.add(sig(p));
    could.push(p);
  }

  const free = [];
  for (let j = 0; free.length < want.free && j < 500; j++) {
    const p = C.makePuzzle(ch, 'free', [ch.id, 'free', j]);
    if (!p || seen.has(sig(p))) continue;
    seen.add(sig(p));
    free.push(p);
  }
  if (order.length < want.clue || could.length < want.could || free.length < want.free) {
    throw new Error(`${ch.id}: made ${order.length}/${want.clue} clue, ${could.length}/${want.could} could, ${free.length}/${want.free} free`);
  }

  const puzzles = [];
  const queues = { clue: order, could, free };
  for (let i = 0; i < C.CHAPTER_SIZE; i++) {
    const mode = C.modeAt(i);
    const p = queues[mode].shift();
    const out = { id: `${ch.id}-${pad(i + 1)}`, ...p, mode };
    if (i < C.TEACH) out.teach = true;
    if (!ch.digits) {
      out.sym = C.pickSymbols(rngFor('code', ch.id, 'sym', i), ch.k, ANIMALS.length);
    }
    puzzles.push(tidy(out));
  }
  return { id: ch.id, puzzles };
}

/* Gentle-to-hard order, but in waves: easy, medium, hard, easy, ... */
function interleave(sorted) {
  const third = Math.ceil(sorted.length / 3);
  const parts = [sorted.slice(0, third), sorted.slice(third, 2 * third), sorted.slice(2 * third)];
  const out = [];
  for (let i = 0; i < third; i++) for (const part of parts) if (part[i]) out.push(part[i]);
  return out;
}

/* Fixed key order, no undefined fields. */
function tidy(p) {
  const keys = ['id', 'mode', 'teach', 'hand', 'sym', 'secret', 'clues', 'cand', 'yes', 'broken', 'tier', 'steps'];
  const out = {};
  for (const k of keys) if (p[k] !== undefined && p[k] !== null && p[k] !== false) out[k] = p[k];
  if (p.mode === 'could') { out.yes = p.yes; if (!p.yes) out.broken = p.broken; }
  return out;
}

/* One puzzle per line: a bank is reviewed in diffs, and a 3,000-line file of
   one-field-per-line JSON is unreadable. */
function writeBank(file, bank) {
  const lines = [
    '{',
    `  "game": ${JSON.stringify(bank.game)},`,
    `  "level": ${JSON.stringify(bank.level)},`,
    `  "v": ${bank.v},`,
    '  "chapters": ['
  ];
  bank.chapters.forEach((ch, ci) => {
    lines.push(`    { "id": ${JSON.stringify(ch.id)}, "puzzles": [`);
    ch.puzzles.forEach((p, pi) => lines.push(`      ${JSON.stringify(p)}${pi < ch.puzzles.length - 1 ? ',' : ''}`));
    lines.push(`    ] }${ci < bank.chapters.length - 1 ? ',' : ''}`);
  });
  if (bank.reserve) {
    lines.push('  ],', '  "reserve": [');
    bank.reserve.forEach((p, pi) => lines.push(`    ${JSON.stringify(p)}${pi < bank.reserve.length - 1 ? ',' : ''}`));
  }
  lines.push('  ]', '}', '');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, lines.join('\n'));
}

function buildCode() {
  const banks = [];
  for (const level of C.LEVELS) {
    if (onlyLevel && level !== onlyLevel) continue;
    const t0 = Date.now();
    const chapters = C.CHAPTERS[level].map((def) => buildCodeChapter(def, level));
    const bank = { game: 'code', level, v: 1, chapters };
    const problems = checkCodeBank(bank);
    if (problems.length) {
      problems.slice(0, 20).forEach((m) => console.error(`  x ${m}`));
      throw new Error(`${level}: ${problems.length} problem(s); nothing written`);
    }
    banks.push(bank);
    const n = chapters.reduce((s, c) => s + c.puzzles.length, 0);
    console.log(`code/${level}: ${n} puzzles in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  }
  for (const bank of banks) writeBank(`data/logic/code/${bank.level}.json`, bank);
}

/* ------------------------------------------------------------------ */
/* Truth Island                                                        */
/* ------------------------------------------------------------------ */

/* The same shape of puzzle (same sentences about the same seats) may come
   back with a different cast, but not more than twice in a chapter. */
const SHAPE_REPEATS = 2;
/* "Everyone is a Sun animal" is the answer a guesser tries first, so it may
   be at most a quarter of a chapter's puzzles with more than one animal. */
const ALL_SUN_SHARE = 0.25;

function buildTruthChapter(def) {
  const ch = T.chapter(def.id);
  const want = T.CHAPTER_SIZE;
  const pool = [];
  const shapes = new Map();
  let allSun = 0;
  for (let j = 0; pool.length < want + 10 && j < 20000; j++) {
    const p = T.makePuzzle(ch, rngFor('truth', ch.id, 'bank', j), { tries: 60 });
    if (!p) continue;
    const shape = T.shapeOf(p);
    if ((shapes.get(shape) || 0) >= SHAPE_REPEATS) continue;
    const sunny = p.cast.length > 1 && p.sol.every((k) => k === 'sun');
    if (sunny && allSun + 1 > Math.floor((want) * ALL_SUN_SHARE)) continue;
    shapes.set(shape, (shapes.get(shape) || 0) + 1);
    if (sunny) allSun += 1;
    pool.push(p);
  }
  if (pool.length < want) throw new Error(`${ch.id}: made only ${pool.length} of ${want}`);
  const ease = (p) => p.depth * 1000 + p.cast.length * 100 + p.steps;
  pool.sort((a, b) => ease(a) - ease(b));
  /* Drop the hardest extras, keeping the all-Sun share inside the cap. */
  const picked = pool.slice(0, want);
  const order = [...picked.slice(0, T.TEACH), ...interleave(picked.slice(T.TEACH))];
  const puzzles = order.map((p, i) => tidyTruth({ id: `${ch.id}-${pad(i + 1)}`, teach: i < T.TEACH, ...p }));
  return { id: ch.id, puzzles };
}

function tidyTruth(p) {
  const out = { id: p.id };
  if (p.teach) out.teach = true;
  out.cast = p.cast;
  if (p.cloud) out.cloud = true;
  if (p.hidden) out.hidden = true;
  if (p.badge !== undefined) out.badge = p.badge;
  if (p.scene && p.scene.c) {
    out.scene = { c: p.scene.c };
    if (p.scene.h && p.scene.h.some(Boolean)) out.scene.h = p.scene.h;
  }
  out.says = p.says;
  out.sol = p.sol;
  out.depth = p.depth;
  out.steps = p.steps;
  return out;
}

function buildTruth() {
  const banks = [];
  for (const level of T.LEVELS) {
    if (onlyLevel && level !== onlyLevel) continue;
    const t0 = Date.now();
    const chapters = T.CHAPTERS[level].map((def) => buildTruthChapter(def));
    const bank = { game: 'truth', level, v: 1, chapters };
    const problems = checkTruthBank(bank);
    if (problems.length) {
      problems.slice(0, 20).forEach((m) => console.error(`  x ${m}`));
      throw new Error(`${level}: ${problems.length} problem(s); nothing written`);
    }
    banks.push(bank);
    const n = chapters.reduce((sum, c) => sum + c.puzzles.length, 0);
    console.log(`truth/${level}: ${n} puzzles in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  }
  for (const bank of banks) writeBank(`data/logic/truth/${bank.level}.json`, bank);
}

/* ------------------------------------------------------------------ */
/* Find the Rule                                                       */
/* ------------------------------------------------------------------ */

/* The same secret rule, with the same kinds of creature around it, at most
   twice in a chapter. (Count the Buttons has only five rules, so the
   creatures around them are what make its forty puzzles different.) */
const RULE_REPEATS = 2;

function buildRuleChapter(def) {
  const ch = R.chapter(def.id);
  const want = R.CHAPTER_SIZE;
  const pool = [];
  const rules = new Map();
  for (let j = 0; pool.length < want && j < 6000; j++) {
    const p = R.makePuzzle(ch, rngFor('rule', ch.id, 'bank', j), { tries: 40 });
    if (!p) continue;
    const key = JSON.stringify([p.rule, Object.keys(p.setup).sort()]);
    if ((rules.get(key) || 0) >= RULE_REPEATS) continue;
    rules.set(key, (rules.get(key) || 0) + 1);
    pool.push(p);
  }
  if (pool.length < want) throw new Error(`${ch.id}: made only ${pool.length} of ${want}`);
  const ease = (p) => p.size * 100 + p.par * 10 + p.evidence.length;
  pool.sort((a, b) => ease(a) - ease(b));
  const order = [...pool.slice(0, R.TEACH), ...interleave(pool.slice(R.TEACH))];
  const puzzles = order.map((p, i) => {
    const out = { id: `${ch.id}-${pad(i + 1)}` };
    if (i < R.TEACH) out.teach = true;
    Object.assign(out, { setup: p.setup, rule: p.rule, evidence: p.evidence });
    if (p.line) out.line = p.line;
    if (p.proof) out.proof = p.proof;
    out.par = p.par;
    out.size = p.size;
    return out;
  });
  return { id: ch.id, puzzles };
}

function buildRule() {
  const banks = [];
  for (const level of R.LEVELS) {
    if (onlyLevel && level !== onlyLevel) continue;
    const t0 = Date.now();
    const chapters = R.CHAPTERS[level].map((d) => buildRuleChapter(d));
    const bank = { game: 'rule', level, v: 1, chapters };
    const problems = checkRuleBank(bank);
    if (problems.length) {
      problems.slice(0, 20).forEach((m) => console.error(`  x ${m}`));
      throw new Error(`${level}: ${problems.length} problem(s); nothing written`);
    }
    banks.push(bank);
    const n = chapters.reduce((sum, c) => sum + c.puzzles.length, 0);
    console.log(`rule/${level}: ${n} puzzles in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  }
  for (const bank of banks) writeBank(`data/logic/rule/${bank.level}.json`, bank);
}

/* ------------------------------------------------------------------ */
/* Zoo Bridges                                                         */
/* ------------------------------------------------------------------ */

function buildBridgesChapter(def, seen) {
  const ch = B.chapter(def.id);
  const pool = [];
  for (let j = 0; pool.length < B.CHAPTER_SIZE && j < 3000; j++) {
    const p = B.makePuzzle(ch, rngFor('bridges', ch.id, 'bank', j), { tries: 60 });
    if (!p) continue;
    const form = B.canonical(p.g);
    if (seen.has(form)) continue;
    seen.add(form);
    pool.push(p);
  }
  if (pool.length < B.CHAPTER_SIZE) throw new Error(`${ch.id}: made only ${pool.length} of ${B.CHAPTER_SIZE}`);
  pool.sort((a, b) => a.steps - b.steps);
  const order = [...pool.slice(0, B.TEACH), ...interleave(pool.slice(B.TEACH))];
  return {
    id: ch.id,
    puzzles: order.map((p, i) => ({
      id: `${ch.id}-${pad(i + 1)}`, ...(i < B.TEACH ? { teach: true } : {}),
      g: p.g, maxb: p.maxb, tech: p.tech, steps: p.steps
    }))
  };
}

function buildBridges() {
  const banks = [];
  for (const level of B.LEVELS) {
    if (onlyLevel && level !== onlyLevel) continue;
    const t0 = Date.now();
    const seen = new Set();
    const chapters = B.CHAPTERS[level].map((d) => {
      const c = buildBridgesChapter(d, seen);
      process.stdout.write(`  ${d.id} ${((Date.now() - t0) / 1000).toFixed(0)}s\n`);
      return c;
    });
    const bank = { game: 'bridges', level, v: 1, chapters };
    const problems = checkBridgesBank(bank);
    if (problems.length) {
      problems.slice(0, 20).forEach((m) => console.error(`  x ${m}`));
      throw new Error(`${level}: ${problems.length} problem(s); nothing written`);
    }
    banks.push(bank);
    const n = chapters.reduce((sum, c) => sum + c.puzzles.length, 0);
    console.log(`bridges/${level}: ${n} puzzles in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  }
  for (const bank of banks) writeBank(`data/logic/bridges/${bank.level}.json`, bank);
}

/* ------------------------------------------------------------------ */
/* Train Tracks                                                        */
/* ------------------------------------------------------------------ */

function buildTrainsChapter(def) {
  const ch = TR.chapter(def.id);
  const pool = [];
  const shapes = new Set();
  for (let j = 0; pool.length < TR.CHAPTER_SIZE && j < 40000; j++) {
    const p = TR.makePuzzle(ch, rngFor('trains', ch.id, 'bank', j), { tries: 40 });
    if (!p) continue;
    const shape = TR.shapeOf(p);
    if (shapes.has(shape)) continue;
    shapes.add(shape);
    pool.push(p);
  }
  if (pool.length < TR.CHAPTER_SIZE) throw new Error(`${ch.id}: made only ${pool.length} of ${TR.CHAPTER_SIZE}`);
  const size = (p) => (p.mode === 'siding' ? p.cars.length * 10 + p.par : p.lay.x.length * 10 + p.trains.length + p.par);
  pool.sort((a, b) => size(a) - size(b));
  const order = [...pool.slice(0, TR.TEACH), ...interleave(pool.slice(TR.TEACH))];
  return {
    id: ch.id,
    puzzles: order.map((p, i) => ({
      id: `${ch.id}-${pad(i + 1)}`, ...(i < TR.TEACH ? { teach: true } : {}),
      ...TR.dress(p, rngFor('trains', ch.id, 'dress', i))
    }))
  };
}

function buildTrains() {
  const banks = [];
  for (const level of TR.LEVELS) {
    if (onlyLevel && level !== onlyLevel) continue;
    const t0 = Date.now();
    const chapters = TR.CHAPTERS[level].map((d) => buildTrainsChapter(d));
    const bank = { game: 'trains', level, v: 1, chapters };
    const problems = checkTrainsBank(bank);
    if (problems.length) {
      problems.slice(0, 20).forEach((m) => console.error(`  x ${m}`));
      throw new Error(`${level}: ${problems.length} problem(s); nothing written`);
    }
    banks.push(bank);
    const n = chapters.reduce((sum, c) => sum + c.puzzles.length, 0);
    console.log(`trains/${level}: ${n} puzzles in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  }
  for (const bank of banks) writeBank(`data/logic/trains/${bank.level}.json`, bank);
}

/* ------------------------------------------------------------------ */
/* Robot Path                                                          */
/* ------------------------------------------------------------------ */

function buildRobotWorld(def) {
  const w = RG.world(def.id);
  const pool = [];
  const shapes = new Set();
  for (let j = 0; pool.length < RG.WORLD_SIZE && j < 20000; j++) {
    const l = RG.makeLevel(w, rngFor('robot', w.id, 'bank', j), { tries: 40 });
    if (!l) continue;
    const shape = RG.shapeOf(l);
    if (shapes.has(shape)) continue;
    shapes.add(shape);
    pool.push(l);
  }
  if (pool.length < RG.WORLD_SIZE) throw new Error(`${w.id}: made only ${pool.length}`);
  pool.sort((a, b) => a.par * 10 + a.animals.length - (b.par * 10 + b.animals.length));
  const order = [...pool.slice(0, RG.TEACH), ...interleave(pool.slice(RG.TEACH))];
  return { id: w.id, puzzles: order.map((l, i) => ({ id: `${w.id}-${pad(i + 1)}`, ...(i < RG.TEACH ? { teach: true } : {}), ...l })) };
}

function buildRobot() {
  const banks = [];
  for (const level of RG.LEVELS) {
    if (onlyLevel && level !== onlyLevel) continue;
    const t0 = Date.now();
    const chapters = RG.WORLDS[level].map((d) => buildRobotWorld(d));
    const bank = { game: 'robot', level, v: 1, chapters };
    const problems = checkRobotBank(bank);
    if (problems.length) {
      problems.slice(0, 20).forEach((m) => console.error(`  x ${m}`));
      throw new Error(`${level}: ${problems.length} problem(s); nothing written`);
    }
    banks.push(bank);
    const n = chapters.reduce((sum, c) => sum + c.puzzles.length, 0);
    console.log(`robot/${level}: ${n} levels in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  }
  for (const bank of banks) writeBank(`data/logic/robot/${bank.level}.json`, bank);
}

/* ------------------------------------------------------------------ */
/* Fix the Bug                                                         */
/* ------------------------------------------------------------------ */

/* Built from the Robot Path bank, so build that first. Each puzzle carries
   its whole level, so the two banks can change apart. */
function buildBugChapter(def, robotBank) {
  const ch = BG.chapter(def.id);
  const byWorld = ch.from.map((w) => robotBank.chapters.find((c) => c.id === w).puzzles);
  /* Take levels in turn from each source world, so a chapter mixes them. */
  const levels = [];
  for (let i = 0; levels.length < byWorld.reduce((n, l) => n + l.length, 0); i++) {
    for (const list of byWorld) if (list[i]) levels.push(list[i]);
  }
  const pool = [];
  for (const l of levels) {
    if (pool.length >= BG.CHAPTER_SIZE) break;
    const p = BG.makeBugPuzzle(l, ch.mode, rngFor('bug', ch.id, l.id), { easy: Boolean(ch.exact), maxMoves: ch.maxMoves || 24 });
    if (!p) continue;
    const level = { ...l };
    delete level.id;
    delete level.teach;
    /* The buggy program is `prog`; `start` stays the robot's starting square. */
    pool.push({ src: l.id, ...level, ...p, mode: ch.mode, prog: p.start, start: level.start });
  }
  if (pool.length < BG.CHAPTER_SIZE) throw new Error(`${ch.id}: made only ${pool.length}`);
  pool.sort((a, b) => RV.programSize(a.prog) - RV.programSize(b.prog));
  const order = [...pool.slice(0, BG.TEACH), ...interleave(pool.slice(BG.TEACH))];
  return { id: ch.id, puzzles: order.map((p, i) => ({ id: `${ch.id}-${pad(i + 1)}`, ...(i < BG.TEACH ? { teach: true } : {}), ...p })) };
}

function buildBug() {
  const banks = [];
  for (const level of BG.LEVELS) {
    if (onlyLevel && level !== onlyLevel) continue;
    const t0 = Date.now();
    const robotBank = JSON.parse(fs.readFileSync(`data/logic/robot/${level}.json`, 'utf8'));
    const chapters = BG.CHAPTERS[level].map((d) => buildBugChapter(d, robotBank));
    const bank = { game: 'bug', level, v: 1, chapters };
    const problems = checkBugBank(bank);
    if (problems.length) {
      problems.slice(0, 20).forEach((m) => console.error(`  x ${m}`));
      throw new Error(`${level}: ${problems.length} problem(s); nothing written`);
    }
    banks.push(bank);
    const n = chapters.reduce((sum, c) => sum + c.puzzles.length, 0);
    console.log(`bug/${level}: ${n} puzzles in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  }
  for (const bank of banks) writeBank(`data/logic/bug/${bank.level}.json`, bank);
}

/* ------------------------------------------------------------------ */
/* Zoo Traffic Jam                                                     */
/* ------------------------------------------------------------------ */

/* Each chapter makes its 100 lots and a share of the level's pool for
   today's puzzle and endless practice. A deep chapter climbs on from its
   last deep lot, so each new one is a short climb (see jamlogic.js). */
function buildJamChapter(def, shapes, extra) {
  const ch = J.chapter(def.id);
  const want = J.CHAPTER_SIZE + extra;
  const pool = [];
  let from = null;
  const t0 = Date.now();
  for (let j = 0; pool.length < want && j < 20000; j++) {
    const p = J.makePuzzle(ch, rngFor('jam', ch.id, 'bank', j), { tries: ch.climb ? 3 : 40, from });
    if (!p) { from = null; continue; }
    from = ch.climb ? p.lot : null;
    const { lot, ...q } = p;
    const shape = J.shapeOf(q);
    if (shapes.has(shape)) continue;
    shapes.add(shape);
    pool.push(q);
    if (ch.climb && pool.length % 10 === 0) console.log(`  ${ch.id}: ${pool.length} of ${want} (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
  }
  if (pool.length < want) throw new Error(`${ch.id}: made only ${pool.length} of ${want}`);
  /* The pool takes every few lots, so it spans the chapter's range too. */
  const reserve = [];
  const keep = [];
  pool.forEach((q, i) => ((i % Math.round(want / extra) === 0 && reserve.length < extra) ? reserve : keep).push(q));
  while (keep.length > J.CHAPTER_SIZE) reserve.length < extra ? reserve.push(keep.pop()) : keep.pop();
  keep.sort((a, b) => a.min - b.min || a.cars.length - b.cars.length);
  const order = [...keep.slice(0, J.TEACH), ...interleave(keep.slice(J.TEACH))];
  return {
    chapter: { id: ch.id, puzzles: order.map((q, i) => ({ id: `${ch.id}-${pad(i + 1)}`, ...(i < J.TEACH ? { teach: true } : {}), ...q })) },
    reserve: reserve.map((q) => ({ ch: ch.id, ...q }))
  };
}

function buildJam() {
  const banks = [];
  for (const level of J.LEVELS) {
    if (onlyLevel && level !== onlyLevel) continue;
    const t0 = Date.now();
    const shapes = new Set();
    const defs = J.CHAPTERS[level];
    const extra = Math.ceil(J.RESERVE / defs.length);
    const built = defs.map((d) => buildJamChapter(d, shapes, extra));
    const reserve = built.flatMap((b) => b.reserve).slice(0, J.RESERVE);
    const bank = { game: 'jam', level, v: 1, chapters: built.map((b) => b.chapter), reserve };
    const problems = checkJamBank(bank);
    if (problems.length) {
      problems.slice(0, 20).forEach((m) => console.error(`  x ${m}`));
      throw new Error(`${level}: ${problems.length} problem(s); nothing written`);
    }
    writeBank(`data/logic/jam/${level}.json`, bank);
    banks.push(bank);
    console.log(`jam/${level}: ${bank.chapters.length * J.CHAPTER_SIZE} lots and a pool of ${reserve.length} in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  }
}

/* ------------------------------------------------------------------ */
/* Gate Factory                                                        */
/* ------------------------------------------------------------------ */

/* Each kind of puzzle is gathered on its own, an even share each. Small
   machines have only a few different "light it" wishes, so a kind that runs
   out leaves its places to the others. */
function buildGatesChapter(def) {
  const ch = GT.chapter(def.id);
  const shapes = new Set();
  const share = Math.ceil(GT.CHAPTER_SIZE / ch.modes.length);
  const byMode = Object.fromEntries(ch.modes.map((m) => [m, []]));
  for (let j = 0; j < 6000 && Object.values(byMode).some((l) => l.length < GT.CHAPTER_SIZE); j++) {
    const mode = GT.modeAt(ch, j);
    if (byMode[mode].length >= GT.CHAPTER_SIZE) continue;
    const p = GT.makePuzzle(ch, mode, rngFor('gates', ch.id, 'bank', j), { tries: 60 });
    if (!p) continue;
    const shape = GT.shapeOf(p);
    if (shapes.has(shape)) continue;
    shapes.add(shape);
    byMode[mode].push(p);
  }
  const pool = [];
  for (const m of ch.modes) pool.push(...byMode[m].slice(0, share));
  for (const m of ch.modes) for (const p of byMode[m].slice(share)) if (pool.length < GT.CHAPTER_SIZE) pool.push(p);
  pool.length = Math.min(pool.length, GT.CHAPTER_SIZE);
  if (pool.length < GT.CHAPTER_SIZE) throw new Error(`${ch.id}: made only ${pool.length}`);
  /* Each kind from small machines to big, then the kinds spread evenly
   through the chapter, so the teaching puzzles at the start show every
   kind, and no kind turns up first at puzzle 19. */
  const size = (p) => p.gates.length * 10 + p.k * 3 + p.lamps.length;
  const lists = ch.modes.map((m) => {
    const l = pool.filter((p) => p.mode === m).sort((a, b) => size(a) - size(b));
    return l.length ? [l[0], ...interleave(l.slice(1))] : [];
  }).filter((l) => l.length);
  const taken = lists.map(() => 0);
  const order = [];
  while (order.length < pool.length) {
    let best = -1;
    lists.forEach((l, m) => {
      if (taken[m] >= l.length) return;
      if (best < 0 || taken[m] / l.length < taken[best] / lists[best].length) best = m;
    });
    order.push(lists[best][taken[best]]);
    taken[best] += 1;
  }
  return { id: ch.id, puzzles: order.map((p, i) => ({ id: `${ch.id}-${pad(i + 1)}`, ...(i < GT.TEACH ? { teach: true } : {}), ...p })) };
}

function buildGates() {
  for (const level of GT.LEVELS) {
    if (onlyLevel && level !== onlyLevel) continue;
    const t0 = Date.now();
    const bank = { game: 'gates', level, v: 1, chapters: GT.CHAPTERS[level].map((d) => buildGatesChapter(d)) };
    const problems = checkGatesBank(bank);
    if (problems.length) {
      problems.slice(0, 20).forEach((m) => console.error(`  x ${m}`));
      throw new Error(`${level}: ${problems.length} problem(s); nothing written`);
    }
    writeBank(`data/logic/gates/${level}.json`, bank);
    console.log(`gates/${level}: ${bank.chapters.length * GT.CHAPTER_SIZE} machines in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  }
}

/* ------------------------------------------------------------------ */
/* Sunbeam Mirrors                                                     */
/* ------------------------------------------------------------------ */

function buildMirrorsChapter(def) {
  const ch = MR.chapter(def.id);
  const pool = [];
  const shapes = new Set();
  for (let j = 0; pool.length < MR.CHAPTER_SIZE && j < 20000; j++) {
    const p = MR.makePuzzle(ch, rngFor('mirrors', ch.id, 'bank', j), { tries: 100 });
    if (!p) continue;
    const shape = MR.shapeOf(p);
    if (shapes.has(shape)) continue;
    shapes.add(shape);
    pool.push(p);
  }
  if (pool.length < MR.CHAPTER_SIZE) throw new Error(`${ch.id}: made only ${pool.length}`);
  /* Small boards with few mirrors first; the first three teach. */
  const size = (p) => p.n * 100 + [...p.cells].filter((x) => x !== '.').length * 3 + (p.mode === 'where' ? 0 : MR.fewestTaps(p) * 10);
  pool.sort((a, b) => size(a) - size(b));
  const order = [...pool.slice(0, MR.TEACH), ...interleave(pool.slice(MR.TEACH))];
  return { id: ch.id, puzzles: order.map((p, i) => ({ id: `${ch.id}-${pad(i + 1)}`, ...(i < MR.TEACH ? { teach: true } : {}), ...p })) };
}

function buildMirrors() {
  for (const level of MR.LEVELS) {
    if (onlyLevel && level !== onlyLevel) continue;
    const t0 = Date.now();
    const bank = { game: 'mirrors', level, v: 1, chapters: MR.CHAPTERS[level].map((d) => buildMirrorsChapter(d)) };
    const problems = checkMirrorsBank(bank);
    if (problems.length) {
      problems.slice(0, 20).forEach((m) => console.error(`  x ${m}`));
      throw new Error(`${level}: ${problems.length} problem(s); nothing written`);
    }
    writeBank(`data/logic/mirrors/${level}.json`, bank);
    console.log(`mirrors/${level}: ${bank.chapters.length * MR.CHAPTER_SIZE} boards in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  }
}

const BUILDERS = { code: buildCode, truth: buildTruth, rule: buildRule, bridges: buildBridges, trains: buildTrains, robot: buildRobot, bug: buildBug, jam: buildJam, gates: buildGates, mirrors: buildMirrors };
if (!BUILDERS[game]) {
  console.error(`Usage: node tools/logicbuild.mjs <${Object.keys(BUILDERS).join('|')}> [--level easy|medium|hard]`);
  process.exit(1);
}
BUILDERS[game]();
