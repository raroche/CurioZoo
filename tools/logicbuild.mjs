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
import { checkCodeBank } from './logiccheck.mjs';

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

const BUILDERS = { code: buildCode };
if (!BUILDERS[game]) {
  console.error(`Usage: node tools/logicbuild.mjs <${Object.keys(BUILDERS).join('|')}> [--level easy|medium|hard]`);
  process.exit(1);
}
BUILDERS[game]();
