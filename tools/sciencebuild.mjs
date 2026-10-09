#!/usr/bin/env node
/**
 * Build a Science Lab bank.
 *
 *   node tools/sciencebuild.mjs pond            all three levels
 *   node tools/sciencebuild.mjs pond --level hard
 *
 * Writes data/science/<game>/<level>.json from fixed seeds, so running it
 * twice writes the same file. Every experiment is made by the same module the
 * page uses and then checked the way tools/sciencecheck.mjs checks it; if one
 * fails, nothing is written.
 *
 * Rebuilding changes experiments children may already have done, and their
 * stars are stored by experiment id. Only rebuild a level that has not
 * shipped, or on purpose.
 */

import fs from 'node:fs';
import path from 'node:path';
import { rngFor } from '../assets/js/modules/logicrng.js';
import * as D from '../assets/js/modules/pondlogic.js';
import * as TR from '../assets/js/modules/trainlogic.js';
import * as FF from '../assets/js/modules/fireflylogic.js';
import * as LV from '../assets/js/modules/leverlogic.js';
import * as SL from '../assets/js/modules/slidelogic.js';
import * as CH from '../assets/js/modules/chainlogic.js';
import * as FO from '../assets/js/modules/fountainlogic.js';
import * as SH from '../assets/js/modules/shadowlogic.js';
import * as MG from '../assets/js/modules/magnetlogic.js';
import * as DM from '../assets/js/modules/dominologic.js';
import { GAME_CHECKS } from './sciencecheck.mjs';

const args = process.argv.slice(2);
const game = args[0];
const onlyLevel = args.includes('--level') ? args[args.indexOf('--level') + 1] : null;
const pad = (n) => String(n).padStart(2, '0');

/**
 * A chapter of `size` experiments from a maker that may fail or repeat
 * itself: each slot tries fresh seeds until it gets a sound one it has not
 * seen. The slot number goes to the maker, so the chapter still runs from
 * gentle to hard.
 */
function buildChapter(logic, gameId, chDef, size, seen) {
  const puzzles = [];
  for (let i = 0; i < size; i++) {
    let made = null;
    for (let attempt = 0; attempt < 400 && !made; attempt++) {
      const p = logic.makePuzzle(chDef, rngFor(gameId, chDef.id, i, attempt), i);
      if (!p || logic.problems(p).length) continue;
      const key = logic.sig(p);
      if (seen.has(key)) continue;
      seen.add(key);
      made = p;
    }
    if (!made) throw new Error(`${gameId} ${chDef.id}: could not make experiment ${i + 1}`);
    puzzles.push({ id: `${chDef.id}-${pad(i + 1)}`, ...(i < logic.TEACH ? { teach: true } : {}), ...made });
  }
  return { id: chDef.id, puzzles };
}

const bankOf = (logic, id) => (level) => {
  const seen = new Set();
  return logic.CHAPTERS[level].map((c) => buildChapter(logic, id, logic.chapter(c.id), logic.sizeOf ? logic.sizeOf(c) : logic.CHAPTER_SIZE, seen));
};

const MAKERS = {
  pond: bankOf(D, 'pond'),
  train: bankOf(TR, 'train'),
  firefly: bankOf(FF, 'firefly'),
  lever: bankOf(LV, 'lever'),
  slide: bankOf(SL, 'slide'),
  chain: bankOf(CH, 'chain'),
  fountain: bankOf(FO, 'fountain'),
  shadow: bankOf(SH, 'shadow'),
  magnet: bankOf(MG, 'magnet'),
  domino: bankOf(DM, 'domino')
};

if (!MAKERS[game]) {
  console.error(`Usage: node tools/sciencebuild.mjs <${Object.keys(MAKERS).join('|')}> [--level easy|medium|hard]`);
  process.exit(1);
}

for (const level of ['easy', 'medium', 'hard']) {
  if (onlyLevel && level !== onlyLevel) continue;
  const bank = { game, level, v: 1, chapters: MAKERS[game](level) };
  const errs = GAME_CHECKS[game].bank(bank);
  if (errs.length) {
    console.error(`${game} ${level}: ${errs.length} problems, nothing written`);
    errs.slice(0, 30).forEach((m) => console.error(`  x ${m}`));
    process.exit(1);
  }
  /* One experiment per line: small diffs, and a person can read it. */
  const body = bank.chapters.map((c) => `    { "id": "${c.id}", "puzzles": [\n${c.puzzles.map((p) => `      ${JSON.stringify(p)}`).join(',\n')}\n    ] }`).join(',\n');
  const text = `{\n  "game": "${game}",\n  "level": "${level}",\n  "v": 1,\n  "chapters": [\n${body}\n  ]\n}\n`;
  const file = path.join('data/science', game, `${level}.json`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
  console.log(`${file}: ${bank.chapters.reduce((n, c) => n + c.puzzles.length, 0)} experiments`);
}
