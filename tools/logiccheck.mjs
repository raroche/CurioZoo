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
import { ROOM, GAMES } from '../assets/js/modules/logictext.js';
import { ANIMALS } from '../assets/js/modules/zooart.js';

const pad = (n) => String(n).padStart(2, '0');
const slots = (s) => [...String(s).matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',');

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

  const live = GAMES.filter((g) => g.live).map((g) => g.id);
  for (const game of live) {
    let total = 0;
    for (const level of ['easy', 'medium', 'hard']) {
      const file = `data/logic/${game}/${level}.json`;
      if (!fs.existsSync(file)) { errors.push(`${game} is live but ${file} is missing`); continue; }
      let bank;
      try { bank = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { errors.push(`${file}: ${e.message}`); continue; }
      if (bank.level !== level) errors.push(`${file}: says level "${bank.level}"`);
      const checker = { code: checkCodeBank }[game];
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
