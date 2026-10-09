#!/usr/bin/env node
/**
 * Check every Science Lab bank, and the words that go with it.
 *
 * Part of npm run verify. Nothing in a bank is trusted because a tool wrote
 * it: every experiment is worked out again here, from its own parts, and one
 * with two answers, no answer, or a fact the game's catalogue does not hold
 * fails the build instead of reaching a child.
 *
 * It also holds the two languages to each other: every key in English must
 * be in Spanish with the same {slots}, and the other way round. And it holds
 * the room together: every live game has a board file, a loader, a bank for
 * each level, and a notebook page for each chapter.
 *
 * tools/sciencebuild.mjs imports the bank checkers and runs them before it
 * writes anything, so a bank that would fail here is never written.
 */

import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import { ROOM, GAMES, IDEAS } from '../assets/js/modules/sciencetext.js';
import * as D from '../assets/js/modules/pondlogic.js';
import { POND_TEXT } from '../assets/js/modules/pondtext.js';
import * as TR from '../assets/js/modules/trainlogic.js';
import { TRAIN_TEXT } from '../assets/js/modules/traintext.js';
import * as FF from '../assets/js/modules/fireflylogic.js';
import { FIREFLY_TEXT } from '../assets/js/modules/fireflytext.js';
import * as LV from '../assets/js/modules/leverlogic.js';
import { LEVER_TEXT } from '../assets/js/modules/levertext.js';
import * as SL from '../assets/js/modules/slidelogic.js';
import { SLIDE_TEXT } from '../assets/js/modules/slidetext.js';
import * as CH from '../assets/js/modules/chainlogic.js';
import { CHAIN_TEXT } from '../assets/js/modules/chaintext.js';
import * as FO from '../assets/js/modules/fountainlogic.js';
import { FOUNTAIN_TEXT } from '../assets/js/modules/fountaintext.js';
import * as SH from '../assets/js/modules/shadowlogic.js';
import { SHADOW_TEXT } from '../assets/js/modules/shadowtext.js';
import * as MG from '../assets/js/modules/magnetlogic.js';
import { MAGNET_TEXT } from '../assets/js/modules/magnettext.js';
import * as DM from '../assets/js/modules/dominologic.js';
import { DOMINO_TEXT } from '../assets/js/modules/dominotext.js';

const LEVELS = ['easy', 'medium', 'hard'];

/* Which slots a sentence uses. Not how often: Spanish may say "su frase"
   where English repeats the name. */
const slots = (s) => [...new Set([...String(s).matchAll(/\{(\w+)\}/g)].map((m) => m[1]))].sort().join(',');

/** Every key in one language is in the other, with the same slots. */
export function checkTable(name, table) {
  const errs = [];
  for (const [a, b] of [['en', 'es'], ['es', 'en']]) {
    for (const [k, v] of Object.entries(table[a] || {})) {
      if (!table[b] || table[b][k] === undefined) { errs.push(`${name}: "${k}" is in ${a} but not ${b}`); continue; }
      if (a === 'en' && slots(v) !== slots(table[b][k])) errs.push(`${name}: "${k}" slots differ: {${slots(v)}} vs {${slots(table[b][k])}}`);
      if (!String(v).trim()) errs.push(`${name}: "${k}" is empty in ${a}`);
    }
  }
  return errs;
}

/* ------------------------------------------------------------------ */
/* The games                                                           */
/* ------------------------------------------------------------------ */

/**
 * One entry per built game: its logic module (CHAPTERS by level, chapter(id))
 * its text table, and the function that checks a bank. Added as each game is
 * built.
 */
export const GAME_CHECKS = {
  pond: { logic: D, text: POND_TEXT, bank: checkPondBank },
  train: { logic: TR, text: TRAIN_TEXT, bank: checkTrainBank },
  firefly: { logic: FF, text: FIREFLY_TEXT, bank: checkFireflyBank },
  lever: { logic: LV, text: LEVER_TEXT, bank: (b) => checkPlainBank(b, 'lever', LV) },
  slide: { logic: SL, text: SLIDE_TEXT, bank: (b) => checkPlainBank(b, 'slide', SL) },
  chain: { logic: CH, text: CHAIN_TEXT, bank: checkChainBank },
  fountain: { logic: FO, text: FOUNTAIN_TEXT, bank: (b) => checkPlainBank(b, 'fountain', FO) },
  shadow: { logic: SH, text: SHADOW_TEXT, bank: (b) => checkPlainBank(b, 'shadow', SH) },
  magnet: { logic: MG, text: MAGNET_TEXT, bank: (b) => checkPlainBank(b, 'magnet', MG) },
  domino: { logic: DM, text: DOMINO_TEXT, bank: (b) => checkPlainBank(b, 'domino', DM) }
};

const pad = (n) => String(n).padStart(2, '0');

/** The shape every bank shares: its game, its level, its chapters in order, ids that say their chapter. */
function checkShape(bank, game, logic, errs) {
  const err = (m) => errs.push(m);
  if (bank.game !== game) err(`game is "${bank.game}", not "${game}"`);
  const defs = logic.CHAPTERS[bank.level];
  if (!defs) { err(`no level called "${bank.level}"`); return null; }
  const ids = (bank.chapters || []).map((c) => c.id).join(',');
  if (ids !== defs.map((d) => d.id).join(',')) err(`${bank.level}: chapters are ${ids}, expected ${defs.map((d) => d.id).join(',')}`);
  for (const chapter of bank.chapters || []) {
    chapter.puzzles.forEach((p, i) => {
      if (p.id !== `${chapter.id}-${pad(i + 1)}`) err(`${chapter.id}: experiment ${i + 1} has id "${p.id}"`);
      if (!!p.teach !== (i < logic.TEACH)) err(`${p.id}: the first ${logic.TEACH} of a chapter teach, and only they`);
    });
  }
  return defs;
}

/* ------------------------------------------------------------------ */
/* Hippo Pond                                                          */
/* ------------------------------------------------------------------ */

export function checkPondBank(bank) {
  const errs = [];
  const err = (m) => errs.push(m);
  const defs = checkShape(bank, 'pond', D, errs);
  if (!defs) return errs;
  const seen = new Map();
  for (const chapter of bank.chapters || []) {
    const def = D.chapter(chapter.id);
    if (!def) continue;
    if (chapter.puzzles.length !== D.CHAPTER_SIZE) err(`${chapter.id}: ${chapter.puzzles.length} experiments, need ${D.CHAPTER_SIZE}`);
    for (const p of chapter.puzzles) {
      if (p.kind !== def.kind) err(`${p.id}: a ${p.kind} experiment in a ${def.kind} chapter`);
      if (def.num && !p.num) err(`${p.id}: chapter ${def.id} shows the numbers`);
      for (const m of D.problems(p)) err(`${p.id}: ${m}`);
      const key = D.sig(p);
      if (seen.has(key)) err(`${p.id}: the same experiment as ${seen.get(key)}`);
      seen.set(key, p.id);
      /* Every thing it shows has a name in both languages. */
      const things = p.kind === 'tray' ? p.items : p.kind === 'same' || p.kind === 'fix' ? [p.item] : [];
      for (const id of things) {
        if (!POND_TEXT.en[`item.${id}`] || !POND_TEXT.es[`item.${id}`]) err(`${p.id}: "${id}" has no name in pondtext.js`);
      }
    }
  }
  return errs;
}

/* ------------------------------------------------------------------ */
/* Fruit Train                                                         */
/* ------------------------------------------------------------------ */

export function checkTrainBank(bank) {
  const errs = [];
  const err = (m) => errs.push(m);
  const defs = checkShape(bank, 'train', TR, errs);
  if (!defs) return errs;
  const seen = new Map();
  for (const chapter of bank.chapters || []) {
    const def = TR.chapter(chapter.id);
    if (!def) continue;
    if (chapter.puzzles.length !== TR.CHAPTER_SIZE) err(`${chapter.id}: ${chapter.puzzles.length} experiments, need ${TR.CHAPTER_SIZE}`);
    for (const p of chapter.puzzles) {
      if (p.kind !== def.kind) err(`${p.id}: a ${p.kind} experiment in a ${def.kind} chapter`);
      for (const m of TR.problems(p)) err(`${p.id}: ${m}`);
      const key = TR.sig(p);
      if (seen.has(key)) err(`${p.id}: the same experiment as ${seen.get(key)}`);
      seen.set(key, p.id);
      const named = [
        ...(p.targets || []).map((g) => `eater.${g.eater}`),
        ...(p.eater ? [`eater.${p.eater}`] : []),
        ...(p.thing ? [`thing.${p.thing}`] : []),
        ...(p.pairs || []).flatMap((pr) => [`thing.${pr.a.thing}`, `thing.${pr.b.thing}`])
      ];
      for (const k of named) if (!TRAIN_TEXT.en[k] || !TRAIN_TEXT.es[k]) err(`${p.id}: "${k}" has no name in traintext.js`);
    }
  }
  return errs;
}

/* ------------------------------------------------------------------ */
/* Firefly Circuits                                                    */
/* ------------------------------------------------------------------ */

/* Every build puzzle is searched again here: every filling of its slots
   from its tray, and exactly one may meet the goal card. */
export function checkFireflyBank(bank) {
  const errs = [];
  const err = (m) => errs.push(m);
  const defs = checkShape(bank, 'firefly', FF, errs);
  if (!defs) return errs;
  const seen = new Map();
  for (const chapter of bank.chapters || []) {
    const def = FF.chapter(chapter.id);
    if (!def) continue;
    if (chapter.puzzles.length !== FF.CHAPTER_SIZE) err(`${chapter.id}: ${chapter.puzzles.length} circuits, need ${FF.CHAPTER_SIZE}`);
    for (const p of chapter.puzzles) {
      if (p.kind !== def.kind) err(`${p.id}: a ${p.kind} circuit in a ${def.kind} chapter`);
      if (p.tiers !== def.tiers) err(`${p.id}: uses ${p.tiers} words, chapter uses ${def.tiers}`);
      for (const m of FF.problems(p)) err(`${p.id}: ${m}`);
      const key = FF.sig(p);
      if (seen.has(key)) err(`${p.id}: the same circuit as ${seen.get(key)}`);
      seen.set(key, p.id);
    }
  }
  return errs;
}

/* ------------------------------------------------------------------ */
/* Games whose puzzles carry no catalogue of their own                 */
/* ------------------------------------------------------------------ */

/* Shape, size, kind, the game's own proof of every puzzle, and no repeats. */
export function checkPlainBank(bank, game, logic) {
  const errs = [];
  const err = (m) => errs.push(m);
  const defs = checkShape(bank, game, logic, errs);
  if (!defs) return errs;
  const seen = new Map();
  for (const chapter of bank.chapters || []) {
    const def = logic.chapter(chapter.id);
    if (!def) continue;
    const size = logic.sizeOf ? logic.sizeOf(def) : logic.CHAPTER_SIZE;
    if (chapter.puzzles.length !== size) err(`${chapter.id}: ${chapter.puzzles.length} experiments, need ${size}`);
    for (const p of chapter.puzzles) {
      if (p.kind !== def.kind && !(def.kinds || []).includes(p.kind)) err(`${p.id}: a ${p.kind} experiment in a ${def.kind} chapter`);
      for (const m of logic.problems(p)) err(`${p.id}: ${m}`);
      const key = logic.sig(p);
      if (seen.has(key)) err(`${p.id}: the same experiment as ${seen.get(key)}`);
      seen.set(key, p.id);
    }
  }
  return errs;
}

/* ------------------------------------------------------------------ */
/* Sun to Lion                                                         */
/* ------------------------------------------------------------------ */

/* The plain checks, plus every living thing named in both languages and
   every link with a source key. */
export function checkChainBank(bank) {
  const errs = checkPlainBank(bank, 'chain', CH);
  for (const s of CH.SPECIES) {
    if (!CHAIN_TEXT.en[`sp.${s.id}`] || !CHAIN_TEXT.es[`sp.${s.id}`]) errs.push(`${s.id} has no name in chaintext.js`);
    if (s.fact && (!CHAIN_TEXT.en[`fact.${s.id}`] || !CHAIN_TEXT.es[`fact.${s.id}`])) errs.push(`${s.id} has no fact in chaintext.js`);
  }
  for (const l of CH.LINKS) if (l.status === 'OK' && (!l.src || l.src === '-')) errs.push(`${l.food} -> ${l.eater} is OK but has no source`);
  return errs;
}

/* ------------------------------------------------------------------ */
/* Run                                                                 */
/* ------------------------------------------------------------------ */

export async function checkAll() {
  const errs = [];
  const err = (m) => errs.push(m);
  errs.push(...checkTable('ROOM', ROOM));

  const hub = fs.readFileSync('assets/js/rooms/science/hub.js', 'utf8');
  const ids = new Set();
  for (const g of GAMES) {
    if (ids.has(g.id)) err(`game "${g.id}" is listed twice`);
    ids.add(g.id);
    for (const part of ['name', 'blurb', 'meta']) {
      if (!g[part] || !g[part].en || !g[part].es) err(`${g.id}: ${part} needs English and Spanish`);
    }
    if (!Array.isArray(IDEAS[g.id])) err(`${g.id}: no IDEAS list`);
    for (const idea of IDEAS[g.id] || []) {
      if (!idea.ch || !idea.icon || !idea.en || !idea.es || !idea.why || !idea.why.en || !idea.why.es) {
        err(`${g.id}: idea "${idea.ch}" needs ch, icon, en, es and why.en/why.es`);
      }
    }
    if (!g.live) continue;

    const check = GAME_CHECKS[g.id];
    if (!check) { err(`${g.id} is live but has no checker in tools/sciencecheck.mjs`); continue; }
    if (!hub.includes(`${g.id}: () => import('./${g.id}.js')`)) err(`${g.id} is live but hub.js has no loader for it`);
    if (!fs.existsSync(`assets/js/rooms/science/${g.id}.js`)) err(`${g.id} is live but rooms/science/${g.id}.js is missing`);
    errs.push(...checkTable(`${g.id} text`, check.text));

    /* Every chapter has its notebook page, and every page its chapter. */
    const chapterIds = LEVELS.flatMap((l) => check.logic.CHAPTERS[l].map((c) => c.id));
    const ideaIds = (IDEAS[g.id] || []).map((i) => i.ch);
    for (const c of chapterIds) if (!ideaIds.includes(c)) err(`${g.id}: chapter ${c} has no big idea in IDEAS`);
    for (const c of ideaIds) if (!chapterIds.includes(c)) err(`${g.id}: IDEAS names chapter ${c}, which ${g.id} does not have`);
    for (const c of chapterIds) {
      for (const k of [`ch.${c}`, `ch.${c}.idea`]) if (!check.text.en[k]) err(`${g.id}: no "${k}" in its text`);
    }

    let count = 0;
    for (const level of LEVELS) {
      const file = `data/science/${g.id}/${level}.json`;
      if (!fs.existsSync(file)) { err(`${file} is missing`); continue; }
      let bank;
      try { bank = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { err(`${file}: ${e.message}`); continue; }
      const found = check.bank(bank);
      found.forEach((m) => err(`${file}: ${m}`));
      count += (bank.chapters || []).reduce((n, c) => n + c.puzzles.length, 0);
    }
    if (check.count) check.count(count);
    console.log(`  ${g.id}: ${count} experiments`);
  }
  return errs;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const errs = await checkAll();
  const live = GAMES.filter((g) => g.live).length;
  console.log(`Science Lab: ${GAMES.length} games, ${live} live`);
  if (errs.length) {
    console.log(`\nERRORS (${errs.length}):`);
    errs.slice(0, 80).forEach((m) => console.log(`  x ${m}`));
    if (errs.length > 80) console.log(`  ... and ${errs.length - 80} more`);
    process.exit(1);
  }
  console.log('No errors.');
}
