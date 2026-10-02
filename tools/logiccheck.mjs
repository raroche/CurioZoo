#!/usr/bin/env node
/**
 * Check every Logic Games puzzle bank, and the words that go with it.
 *
 * Part of npm run verify. Nothing in a bank is trusted because a tool wrote
 * it: every puzzle is solved again here, from its clues, by brute force AND by
 * the step-by-step solver the hints use. A puzzle with two answers, or one the
 * hints cannot reach, or a hint that would cross out the real answer, fails
 * the build instead of reaching a child.
 *
 * It also holds the two languages to each other: every key in English must
 * be in Spanish with the same {slots}, and the other way round.
 *
 * tools/logicbuild.mjs imports checkCodeBank() and runs it before it writes
 * anything, so a bank that would fail here is never written.
 */

import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import * as C from '../assets/js/modules/codelogic.js';
import { CODE_TEXT } from '../assets/js/modules/codetext.js';
import * as T from '../assets/js/modules/truthlogic.js';
import { TRUTH_TEXT, sentence } from '../assets/js/modules/truthtext.js';
import { ROOM, GAMES } from '../assets/js/modules/logictext.js';
import { ANIMALS } from '../assets/js/modules/zooart.js';

const pad = (n) => String(n).padStart(2, '0');
/* Which slots a sentence uses. Not how often: Spanish may say "su frase"
   where English repeats the name. */
const slots = (s) => [...new Set([...String(s).matchAll(/\{(\w+)\}/g)].map((m) => m[1]))].sort().join(',');

/* ------------------------------------------------------------------ */
/* Crack the Code                                                      */
/* ------------------------------------------------------------------ */

export function checkCodeBank(bank) {
  const errs = [];
  const err = (m) => errs.push(m);
  if (bank.game !== 'code') err(`game is "${bank.game}", not "code"`);
  const defs = C.CHAPTERS[bank.level];
  if (!defs) { err(`no level called "${bank.level}"`); return errs; }
  const ids = (bank.chapters || []).map((c) => c.id).join(',');
  if (ids !== defs.map((d) => d.id).join(',')) err(`${bank.level}: chapters are ${ids}, expected ${defs.map((d) => d.id).join(',')}`);

  const seen = new Set();
  for (const chapter of bank.chapters || []) {
    const ch = C.chapter(chapter.id);
    if (!ch) continue;
    if (chapter.puzzles.length !== C.CHAPTER_SIZE) err(`${ch.id}: ${chapter.puzzles.length} puzzles, need ${C.CHAPTER_SIZE}`);
    chapter.puzzles.forEach((p, i) => {
      const where = `${ch.id} #${i + 1}`;
      if (p.id !== `${ch.id}-${pad(i + 1)}`) err(`${where}: id "${p.id}" should be ${ch.id}-${pad(i + 1)}`);
      if (p.mode !== C.modeAt(i)) err(`${where}: mode "${p.mode}" should be "${C.modeAt(i)}"`);
      if (Boolean(p.teach) !== (i < C.TEACH)) err(`${where}: teach flag is wrong`);
      const key = JSON.stringify([p.mode, p.secret, p.clues || null, p.cand || null]);
      if (seen.has(key)) err(`${where}: the same puzzle appears twice`);
      seen.add(key);

      if (ch.digits) {
        if (p.sym) err(`${where}: a number chapter has no animals`);
      } else if (!Array.isArray(p.sym) || p.sym.length !== ch.k || new Set(p.sym).size !== ch.k
        || p.sym.some((x) => !Number.isInteger(x) || x < 0 || x >= ANIMALS.length)) {
        err(`${where}: sym must be ${ch.k} different animals`);
      }
      if (!Array.isArray(p.secret) || !C.legalGuess(ch, p.secret)) { err(`${where}: the secret is not a legal code`); return; }

      if (p.mode === 'free') return;
      if (!Array.isArray(p.clues) || !p.clues.length) { err(`${where}: no clues`); return; }
      for (const g of p.clues) {
        if (!C.legalGuess(ch, g)) err(`${where}: clue ${JSON.stringify(g)} is not a legal code`);
        if (C.sameCode(g, p.secret)) err(`${where}: a clue is the answer itself`);
      }
      const clues = C.cluesOf(ch, p);

      if (p.mode === 'could') {
        if (!C.legalGuess(ch, p.cand)) { err(`${where}: the candidate is not a legal code`); return; }
        const bad = clues.map((c, ci) => (C.fits(p.cand, [c], ch.fb) ? -1 : ci)).filter((x) => x >= 0);
        if (p.yes && bad.length) err(`${where}: says "could be" but clue ${bad[0] + 1} does not fit`);
        if (!p.yes && (bad.length !== 1 || bad[0] !== p.broken)) {
          err(`${where}: says clue ${p.broken + 1} breaks, but the broken clues are ${bad.map((x) => x + 1).join(',') || 'none'}`);
        }
        if (!C.fits(p.secret, clues, ch.fb)) err(`${where}: the secret does not fit its own clues`);
        return;
      }

      /* A Clue Safe: one answer, and it is the secret. */
      const sols = C.solutions(ch, clues, 2);
      if (sols.length !== 1) { err(`${where}: ${sols.length === 0 ? 'no' : 'more than one'} code fits the clues`); return; }
      if (!C.sameCode(sols[0], p.secret)) err(`${where}: the one code that fits is not the secret`);
      if (!p.hand && C.minimise(ch, clues, p.secret).length !== clues.length) err(`${where}: a clue is not needed`);
      const run = C.humanSolve(ch, clues);
      if (!run.solved) { err(`${where}: the step-by-step solver cannot finish it, so the hints would run out`); return; }
      if (!C.sameCode(run.code, p.secret)) err(`${where}: the solver reached the wrong code`);
      if (!p.hand && (run.tier < ch.tiers[0] || run.tier > ch.tiers[1])) err(`${where}: needs tier ${run.tier}, the chapter allows ${ch.tiers.join('-')}`);
      if (p.tier !== run.tier) err(`${where}: stored tier ${p.tier}, solver says ${run.tier}`);
      if (p.steps !== run.steps.length) err(`${where}: stored ${p.steps} steps, solver takes ${run.steps.length}`);
      for (const step of run.steps) {
        if (step.out.some(([s, x]) => p.secret[s] === x)) err(`${where}: a ${step.rule} step crosses out the answer`);
        if (!CODE_TEXT.en[step.rule]) err(`${where}: no sentence for rule ${step.rule}`);
      }
    });
  }
  return errs;
}

/* ------------------------------------------------------------------ */
/* Truth Island                                                        */
/* ------------------------------------------------------------------ */

const STEP_KEYS = { fact: ['step.fact', 'step.badge'], check: ['step.check'], known: ['step.known'], self: ['step.self', 'step.selfx'],
  both: ['step.both', 'step.bothx'], left: ['step.left'], suppose: ['step.suppose', 'step.supposex', 'step.suppose2'] };

export function checkTruthBank(bank) {
  const errs = [];
  const err = (m) => errs.push(m);
  if (bank.game !== 'truth') err(`game is "${bank.game}", not "truth"`);
  const defs = T.CHAPTERS[bank.level];
  if (!defs) { err(`no level called "${bank.level}"`); return errs; }
  const ids = (bank.chapters || []).map((c) => c.id).join(',');
  if (ids !== defs.map((d) => d.id).join(',')) err(`${bank.level}: chapters are ${ids}`);

  for (const chapter of bank.chapters || []) {
    const ch = T.chapter(chapter.id);
    if (!ch) continue;
    if (chapter.puzzles.length !== T.CHAPTER_SIZE) err(`${ch.id}: ${chapter.puzzles.length} puzzles, need ${T.CHAPTER_SIZE}`);
    const shapes = new Map();
    let allSun = 0;
    chapter.puzzles.forEach((raw, i) => {
      const where = `${ch.id} #${i + 1}`;
      const p = { ...raw, scene: raw.scene || {} };
      if (p.id !== `${ch.id}-${pad(i + 1)}`) err(`${where}: id "${p.id}"`);
      if (Boolean(p.teach) !== (i < T.TEACH)) err(`${where}: teach flag is wrong`);
      if (p.cast.length < ch.n[0] || p.cast.length > ch.n[1]) err(`${where}: ${p.cast.length} animals`);
      if (new Set(p.cast).size !== p.cast.length || p.cast.some((k) => !T.CAST.includes(k))) err(`${where}: bad cast`);
      if (Boolean(p.cloud) !== Boolean(ch.cloud)) err(`${where}: cloud flag does not match the chapter`);
      if (Boolean(p.hidden) !== Boolean(ch.hidden)) err(`${where}: hidden flag does not match the chapter`);
      if (ch.hidden && (p.badge !== 0 || p.sol[0] !== 'sun')) err(`${where}: the badge animal must be first and a Sun`);
      if (!T.legalWorld(p, p.sol)) err(`${where}: the answer breaks the island's rules`);
      const sols = T.solutions(p);
      if (sols.length !== 1) { err(`${where}: ${sols.length} answers fit`); return; }
      if (sols[0].some((k, j) => k !== p.sol[j])) err(`${where}: the one answer that fits is not the stored one`);
      if (!T.acceptable(ch, p)) err(`${where}: a sentence is spare, or the chapter's idea is missing`);
      const said = new Set();
      for (const [who, s] of p.says) {
        if (who < 0 || who >= p.cast.length) err(`${where}: a speaker who is not there`);
        if (said.has(`${who}:${T.canon(s)}`)) err(`${where}: an animal says the same thing twice`);
        said.add(`${who}:${T.canon(s)}`);
        for (const L of ['en', 'es']) {
          const text = sentence(s, who, p.cast, L);
          if (/undefined|NaN|\{/.test(text) || text.length < 6) err(`${where}: bad ${L} sentence "${text}"`);
        }
      }
      const run = T.humanSolve(p, { maxDepth: ch.depth[1] });
      if (!run.solved) { err(`${where}: the step-by-step solver cannot finish it`); return; }
      if (run.sol.some((k, j) => k !== p.sol[j])) err(`${where}: the solver reached a different answer`);
      if (run.depth < ch.depth[0] || run.depth > ch.depth[1]) err(`${where}: depth ${run.depth}, chapter allows ${ch.depth.join('-')}`);
      if (ch.supposes && run.steps.filter((s) => s.kind === 'suppose').length < ch.supposes) err(`${where}: needs ${ch.supposes} pencil ideas`);
      if (p.depth !== run.depth || p.steps !== run.steps.length) err(`${where}: stored depth/steps do not match the solver`);
      for (const step of run.steps) {
        if (!step.keep.includes(p.sol[step.who])) err(`${where}: a ${step.kind} step rules out the answer`);
        if (!STEP_KEYS[step.kind] || STEP_KEYS[step.kind].some((k) => !TRUTH_TEXT.en[k])) err(`${where}: no words for a ${step.kind} step`);
      }
      const shape = T.shapeOf(p);
      shapes.set(shape, (shapes.get(shape) || 0) + 1);
      if (shapes.get(shape) > 2) err(`${where}: the same puzzle shape a third time`);
      if (p.cast.length > 1 && p.sol.every((k) => k === 'sun')) allSun += 1;
    });
    if (allSun > T.CHAPTER_SIZE * 0.25) err(`${ch.id}: ${allSun} puzzles where everyone is a Sun animal`);
  }
  return errs;
}

/* ------------------------------------------------------------------ */
/* The two languages                                                   */
/* ------------------------------------------------------------------ */

export function checkParity(name, table) {
  const errs = [];
  const en = table.en || {};
  const es = table.es || {};
  for (const k of Object.keys(en)) {
    if (!(k in es)) errs.push(`${name}: "${k}" has no Spanish`);
    else if (slots(en[k]) !== slots(es[k])) errs.push(`${name}: "${k}" has slots {${slots(en[k])}} in English, {${slots(es[k])}} in Spanish`);
  }
  for (const k of Object.keys(es)) if (!(k in en)) errs.push(`${name}: "${k}" is in Spanish only`);
  return errs;
}

function checkCodeText() {
  const errs = [];
  for (const rule of [...Object.keys(C.TIER), 'R1agg', 'R3home', 'R7x']) {
    if (!CODE_TEXT.en[rule]) errs.push(`codetext: no sentence for rule ${rule}`);
  }
  for (const level of C.LEVELS) {
    for (const ch of C.CHAPTERS[level]) {
      for (const k of [`ch.${ch.id}`, `ch.${ch.id}.idea`, `fact.${ch.animal}`]) {
        if (!CODE_TEXT.en[k]) errs.push(`codetext: missing "${k}"`);
      }
      if (!ANIMALS.some((a) => a.id === ch.animal)) errs.push(`chapter ${ch.id}: no animal called ${ch.animal}`);
    }
  }
  return errs;
}

/* ------------------------------------------------------------------ */
/* Run                                                                 */
/* ------------------------------------------------------------------ */

function main() {
  const errors = [];
  const report = [];

  errors.push(...checkParity('logictext', ROOM));
  for (const g of GAMES) {
    for (const f of ['name', 'blurb', 'meta']) if (!g[f] || !g[f].en || !g[f].es) errors.push(`game ${g.id}: ${f} needs en and es`);
  }
  errors.push(...checkParity('codetext', CODE_TEXT), ...checkCodeText());
  errors.push(...checkParity('truthtext', TRUTH_TEXT));

  const live = GAMES.filter((g) => g.live).map((g) => g.id);
  for (const game of live) {
    let total = 0;
    for (const level of ['easy', 'medium', 'hard']) {
      const file = `data/logic/${game}/${level}.json`;
      if (!fs.existsSync(file)) { errors.push(`${game} is live but ${file} is missing`); continue; }
      let bank;
      try { bank = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { errors.push(`${file}: ${e.message}`); continue; }
      if (bank.level !== level) errors.push(`${file}: says level "${bank.level}"`);
      const checker = { code: checkCodeBank, truth: checkTruthBank }[game];
      if (!checker) { errors.push(`${game}: no checker in tools/logiccheck.mjs`); continue; }
      errors.push(...checker(bank).map((m) => `${file}: ${m}`));
      const n = bank.chapters.reduce((s, c) => s + c.puzzles.length, 0);
      if (n < 200) errors.push(`${file}: ${n} puzzles; a level needs at least 200`);
      total += n;
    }
    report.push(`${game}: ${total} puzzles`);
  }

  console.log(report.join(' · ') || 'no live games');
  if (errors.length) {
    console.log(`\nERRORS (${errors.length}):`);
    errors.slice(0, 60).forEach((m) => console.log(`  x ${m}`));
    if (errors.length > 60) console.log(`  ... and ${errors.length - 60} more`);
    process.exit(1);
  }
  console.log('\nNo errors.');
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) main();
