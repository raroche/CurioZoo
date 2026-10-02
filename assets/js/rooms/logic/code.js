/**
 * rooms/logic/code.js — Crack the Code, drawn.
 *
 * Three kinds of puzzle on one board (modules/codelogic.js has the rules):
 *   clue   read the clues, set the one code that fits them all
 *   could  is this code possible? check it against every clue
 *   free   guess a hidden code; each guess comes back as a clue
 *
 * Every sentence the board says is a function of the language, so switching
 * to Spanish halfway through a puzzle redraws it in Spanish without losing a
 * single animal the child has placed.
 */

import * as C from '../../modules/codelogic.js';
import * as P from '../../modules/logicprogress.js';
import { ANIMALS, animalName, mark, theAnimal } from '../../modules/zooart.js';
import { ct } from '../../modules/codetext.js';
import { hash, rngFor } from '../../modules/logicrng.js';
import { paint, react } from '../../modules/shell.js';
import { esc, lang, say, t } from './frame.js';

/* ------------------------------------------------------------------ */
/* The bank and the chapters                                           */
/* ------------------------------------------------------------------ */

const banks = new Map();

async function bank(level) {
  if (!banks.has(level)) {
    banks.set(level, fetch(`data/logic/code/${level}.json`, { cache: 'no-cache' }).then((res) => {
      if (!res.ok) throw new Error(`Could not load the ${level} safes`);
      return res.json();
    }));
    banks.get(level).catch(() => banks.delete(level));
  }
  return banks.get(level);
}

const chapters = (level, L) => C.CHAPTERS[level].map((ch) => ({
  id: ch.id, title: ct(`ch.${ch.id}`, L), idea: ct(`ch.${ch.id}.idea`, L)
}));

const levelOfChapter = (id) => (C.chapter(id) || {}).level || null;

function tileLabel(p, L) {
  if (p.teach) return { icon: '🎓', text: t('teach') };
  return {
    clue: { icon: '🔐', text: ct('tile.clue', L) },
    could: { icon: '❓', text: ct('tile.could', L) },
    free: { icon: '🗝️', text: ct('tile.free', L) }
  }[p.mode];
}

/* ------------------------------------------------------------------ */
/* Symbols: animals, or the digits 0-9                                 */
/* ------------------------------------------------------------------ */

function symbolsFor(ch, p) {
  if (ch.digits) return Array.from({ length: ch.k }, (_, i) => ({ digit: true, label: String(i) }));
  return p.sym.map((i) => ANIMALS[i]);
}

const symName = (s, L) => (s.digit ? s.label : animalName(s, L));
const theSym = (s, L, cap = false) => {
  if (!s.digit) return theAnimal(s, L, cap);
  const text = `${L === 'es' ? 'el' : 'the'} ${s.label}`;
  return cap ? text.charAt(0).toUpperCase() + text.slice(1) : text;
};
const symHtml = (s) => (s.digit
  ? `<span class="cz-sym cz-sym--digit" aria-hidden="true">${s.label}</span>`
  : `<span class="cz-sym" aria-hidden="true">${s.emoji}</span>`);

/* ------------------------------------------------------------------ */
/* State                                                               */
/* ------------------------------------------------------------------ */

let play = null;

function draw(host, ctx) {
  const ch = C.chapter(ctx.chapterId);
  const p = ctx.puzzle;
  play = {
    host, ctx, ch, p, syms: symbolsFor(ch, p),
    clues: p.clues ? C.cluesOf(ch, p) : [],
    answer: new Array(ch.n).fill(null), cursor: 0,
    crossed: new Set(), flagged: new Set(),
    hints: 0, hint: null, tries: 0, msg: null, bad: -1, done: false,
    could: { picked: null },
    free: { secret: p.secret.slice(), guesses: [], warn: -1, attempt: 0, out: false }
  };
  paintBoard();
}

const freeClues = () => play.free.guesses.map((x) => ({ g: x.g, f: x.f }));
const L0 = () => lang();

/* ------------------------------------------------------------------ */
/* Drawing                                                             */
/* ------------------------------------------------------------------ */

function feedbackHtml(ch, f, L) {
  if (Array.isArray(f)) return '';
  const h = f.marks ? f.marks.filter(Boolean).length : f.h;
  const pegs = [...Array(f.marks ? 0 : h).fill('h'), ...Array(f.w).fill('w')];
  const words = f.marks ? ct('fb.mid', L, { w: f.w }) : ct('fb.agg', L, { h, w: f.w });
  return `<span class="cz-code-count">
    <span class="cz-code-pegs" aria-hidden="true">${pegs.length ? pegs.map((k) => mark(k, 18)).join('') : mark('n', 18)}</span>
    <span class="cz-code-count__words">${esc(words)}</span>
  </span>`;
}

/* "Home!" is shouted on screen but read as a word in a sentence. */
const plain = (w) => w.replace(/[!¡]/g, '');

/** Words for one clue, for a screen reader and for reading aloud. */
function clueWords(ch, c, i, L) {
  const head = ct('clue', L, { n: i + 1 });
  if (Array.isArray(c.f)) {
    return `${head}: ${c.g.map((x, s) => `${symName(play.syms[x], L)}, ${plain(ct(`fb.${c.f[s]}`, L))}`).join('. ')}.`;
  }
  const names = c.g.map((x, s) => {
    const home = c.f.marks && c.f.marks[s] ? ` (${plain(ct('fb.h', L))})` : '';
    return symName(play.syms[x], L) + home;
  }).join(', ');
  const h = c.f.marks ? c.f.marks.filter(Boolean).length : c.f.h;
  return `${head}: ${names}. ${ct('fb.agg', L, { h, w: c.f.w })}.`;
}

function clueRow(ch, c, i, L, { label, cls = '' } = {}) {
  const hl = play.hint && play.hint.level >= 1 && play.hint.clue === i ? ' is-hint' : '';
  const bad = play.bad === i ? ' is-bad' : '';
  const anyHome = c.f.marks && c.f.marks.some(Boolean);
  const cells = c.g.map((x, s) => {
    const m = Array.isArray(c.f) ? mark(c.f[s], 20)
      : anyHome ? (c.f.marks[s] ? mark('h', 20) : '<span class="cz-code-blank"></span>') : '';
    return `<span class="cz-code-cell">${symHtml(play.syms[x])}${m ? `<span class="cz-code-cellmark">${m}</span>` : ''}</span>`;
  }).join('');
  return `<li class="cz-code-clue${hl}${bad}${cls}">
    <span class="cz-code-clue__label" aria-hidden="true">${esc(label || ct('clue', L, { n: i + 1 }))}${bad ? ' ✗' : ''}</span>
    <span class="cz-code-row" aria-hidden="true">${cells}</span>
    ${feedbackHtml(ch, c.f, L)}
    <span class="gp-sr-only">${esc(clueWords(ch, c, i, L))}</span>
  </li>`;
}

function legend(ch, L) {
  if (ch.fb === 'spot') {
    return `<p class="cz-code-legend">
      <span>${mark('h', 18)} ${esc(ct('fb.h', L))}</span>
      <span>${mark('w', 18)} ${esc(ct('fb.w', L))}</span>
      <span>${mark('n', 18)} ${esc(ct('fb.n', L))}</span>
      <span class="gp-sr-only">${esc(ct('fb.legend', L))}</span></p>`;
  }
  return `<p class="cz-code-legend">
    <span>${mark('h', 18)} ${esc(ct('fb.h', L))}</span>
    <span>${mark('w', 18)} ${esc(ct('fb.w', L))}</span></p>
    <p class="cz-code-legend__note">${esc(ct('fb.legendAgg', L))}</p>`;
}

function answerRow(L, label) {
  const { ch } = play;
  const slots = play.answer.map((x, s) => {
    const cur = s === play.cursor && !play.done;
    const hl = play.hint && play.hint.level >= 1 && play.hint.slot === s && play.hint.clue === undefined ? ' is-hint' : '';
    const name = x === null ? ct('empty', L) : symName(play.syms[x], L);
    return `<button type="button" class="cz-code-slot${cur ? ' is-cursor' : ''}${hl}" data-code-slot="${s}"
      aria-label="${esc(ct('spot', L, { n: s + 1 }))}: ${esc(name)}" ${cur ? 'aria-current="true"' : ''}
      ${play.done ? 'disabled' : ''}>${x === null ? `<span class="cz-code-slot__n">${s + 1}</span>` : symHtml(play.syms[x])}</button>`;
  }).join('');
  return `<div class="cz-code-answer">
    <span class="cz-code-clue__label">${esc(label)}</span>
    <div class="cz-code-row cz-code-row--answer" role="group" aria-label="${esc(label)}">${slots}</div>
  </div>`;
}

function tray(L) {
  const { ch } = play;
  const keys = play.syms.map((s, x) => `<button type="button" class="cz-code-pick" data-code-sym="${x}"
      aria-label="${esc(symName(s, L))}" ${play.done ? 'disabled' : ''}>${symHtml(s)}${s.digit ? '' : `<span class="cz-code-pick__key" aria-hidden="true">${x + 1}</span>`}</button>`).join('');
  const label = ct(ch.digits ? 'trayDigits' : 'tray', L);
  return `<div class="cz-code-tray" role="group" aria-label="${esc(label)}">${keys}</div>`;
}

function notesGrid(L, auto = new Set()) {
  const { ch } = play;
  const head = Array.from({ length: ch.n }, (_, s) => `<th scope="col">${s + 1}</th>`).join('');
  const rows = play.syms.map((sym, x) => {
    const cells = Array.from({ length: ch.n }, (_, s) => {
      const k = `${s}:${x}`;
      const on = play.crossed.has(k) || auto.has(k);
      const flag = play.flagged.has(k);
      const hl = play.hint && play.hint.level >= 1 && play.hint.cells && play.hint.cells.has(k) ? ' is-hint' : '';
      return `<td><button type="button" class="cz-code-note${on ? ' is-crossed' : ''}${auto.has(k) ? ' is-auto' : ''}${flag ? ' is-flagged' : ''}${hl}"
        data-code-note="${k}" aria-pressed="${on}" ${play.done || auto.has(k) ? 'disabled' : ''}
        aria-label="${esc(symName(sym, L))}, ${esc(ct('spot', L, { n: s + 1 }))}${on ? `, ${esc(ct('crossed', L))}` : ''}">${flag ? '!' : on ? '✕' : ''}</button></td>`;
    }).join('');
    return `<tr><th scope="row">${symHtml(sym)}<span class="gp-sr-only">${esc(symName(sym, L))}</span></th>${cells}</tr>`;
  }).join('');
  return `<details class="cz-code-notes" open>
    <summary>${esc(ct('notes', L))}</summary>
    <p class="cz-code-notes__help">${esc(ct('notesHelp', L))}</p>
    <table class="cz-code-grid"><thead><tr><th></th>${head}</tr></thead><tbody>${rows}</tbody></table>
    ${play.done ? '' : `<button type="button" class="gp-btn gp-btn--quiet cz-code-notes__check" data-action="code-checknotes">${esc(ct('notesCheck', L))}</button>`}
  </details>`;
}

function actions(L, main, mainLabel) {
  if (play.done) return '';
  return `<div class="cz-code-actions">
    <button type="button" class="gp-btn gp-btn--primary gp-btn--big" data-action="${main}">${esc(mainLabel)}</button>
    <button type="button" class="gp-btn gp-btn--ghost" data-action="code-clear">${esc(t('clear'))}</button>
    <button type="button" class="gp-btn gp-btn--ghost" data-action="code-hint"><span aria-hidden="true">🔎</span> ${esc(play.hint ? t('hintMore') : t('hint'))}</button>
  </div>`;
}

function paintBoard() {
  const L = L0();
  const { ch, p } = play;
  let body = '';
  const ask = `<p class="cz-code-ask">${esc(ct(`ask.${p.mode}`, L))}</p>`;
  if (p.mode === 'clue') {
    body = `${legend(ch, L)}
      <ol class="cz-code-clues">${play.clues.map((c, i) => clueRow(ch, c, i, L)).join('')}</ol>
      <div class="cz-code-work">
        <div class="cz-code-main">${answerRow(L, ct('yourCode', L))}${tray(L)}${actions(L, 'code-check', t('check'))}</div>
        ${notesGrid(L)}
      </div>`;
  } else if (p.mode === 'could') {
    const done = play.done;
    body = `${legend(ch, L)}
      <ol class="cz-code-clues">${play.clues.map((c, i) => clueRow(ch, c, i, L)).join('')}</ol>
      <div class="cz-code-cand">
        <span class="cz-code-clue__label">${esc(ct('thisCode', L))}</span>
        <span class="cz-code-row">${p.cand.map((x) => `<span class="cz-code-cell">${symHtml(play.syms[x])}</span>`).join('')}</span>
        <span class="gp-sr-only">${esc(p.cand.map((x) => symName(play.syms[x], L)).join(', '))}</span>
      </div>
      <div class="cz-code-could">
        <button type="button" class="gp-btn gp-btn--big cz-code-could__btn" data-code-could="yes" ${done ? 'disabled' : ''}>✓ ${esc(ct('couldYes', L))}</button>
        <button type="button" class="gp-btn gp-btn--big cz-code-could__btn" data-code-could="no" ${done ? 'disabled' : ''}>✗ ${esc(ct('couldNo', L))}</button>
      </div>`;
  } else {
    const f = play.free;
    const auto = play.ctx.level === 'easy' ? C.directCrosses(ch, freeClues()) : new Set();
    const left = ch.budget - f.guesses.length;
    body = `${legend(ch, L)}
      ${f.guesses.length ? `<h2 class="cz-code-h">${esc(ct('yourGuesses', L))}</h2>
        <ol class="cz-code-clues">${f.guesses.map((c, i) => clueRow(ch, c, i, L, {
          label: `${i + 1}`, cls: c.consistent ? '' : ' is-loose' })).join('')}</ol>` : ''}
      ${f.out ? `<div class="cz-code-cand"><span class="cz-code-clue__label">${esc(ct('outOf', L))}</span>
        <span class="cz-code-row">${f.secret.map((x) => `<span class="cz-code-cell">${symHtml(play.syms[x])}</span>`).join('')}</span></div>
        <button type="button" class="gp-btn gp-btn--primary gp-btn--big" data-action="code-again">${esc(t('again'))}</button>` : `
      <p class="cz-code-left">${esc(left === 1 ? ct('guessLeft', L) : ct('guessesLeft', L, { n: left }))}</p>
      <div class="cz-code-work">
        <div class="cz-code-main">${answerRow(L, ct('yourCode', L))}${tray(L)}${actions(L, 'code-guess', ct('guess', L))}</div>
        ${notesGrid(L, auto)}
      </div>`}`;
  }
  play.host.innerHTML = `<div class="cz-code cz-code--${ch.fb}" lang="${L}">${ask}${body}
    <div class="cz-code-msg" aria-live="polite">${play.msg ? play.msg(L) : ''}</div></div>`;
  paint();
}

/* ------------------------------------------------------------------ */
/* Sentences from solver steps                                         */
/* ------------------------------------------------------------------ */

function stepVars(step, L, clues) {
  const { ch } = play;
  const s = step.sym !== undefined ? play.syms[step.sym] : null;
  const c = step.clue !== undefined ? clues[step.clue] : null;
  const counts = c && !Array.isArray(c.f)
    ? { h: c.f.marks ? c.f.marks.filter(Boolean).length : c.f.h, w: c.f.w } : { h: 0, w: 0 };
  return {
    n: step.clue !== undefined ? step.clue + 1 : '', s: step.slot !== undefined ? step.slot + 1 : '',
    a: s ? theSym(s, L) : '', A: s ? theSym(s, L, true) : '',
    things: ct(ch.digits ? 'things.digits' : 'things.animals', L), k: ch.n, ...counts
  };
}

function stepKeyOf(step) {
  if (step.rule === 'R1') return play.ch.fb === 'spot' ? 'R1' : 'R1agg';
  if (step.rule === 'R3') return step.notHome ? 'R3home' : 'R3';
  if (step.rule === 'R7') return step.clue === undefined ? 'R7x' : 'R7';
  return step.rule;
}

const stepSentence = (step, L, clues = play.clues) => ct(stepKeyOf(step), L, stepVars(step, L, clues));

function lookSentence(step, L, clues = play.clues) {
  const v = stepVars(step, L, clues);
  if (step.clue !== undefined) return ct('look.clue', L, v);
  if (step.rule === 'R5m') return ct('look.count', L, v);
  if (step.rule === 'R4') return ct('look.animal', L, v);
  return ct('look.spot', L, v);
}

function whyLines(L, steps, clues = play.clues) {
  return C.whySteps(steps).map((s) => esc(stepSentence(s, L, clues)));
}

/* ------------------------------------------------------------------ */
/* Hints                                                               */
/* ------------------------------------------------------------------ */

/* Three taps on one idea: where to look, the sentence, then do it. */
function hintClue() {
  const { ch, p } = play;
  const h = C.nextHint(ch, p, { answer: play.answer, crossed: play.crossed });
  if (!h) return;
  const key = h.wrong ? `w${h.slot}:${h.sym}` : JSON.stringify([h.step.rule, h.step.out, h.step.place || null, h.step.must || null]);
  if (!play.hint || play.hint.key !== key) {
    play.hint = {
      key, level: 0, h,
      clue: h.wrong ? undefined : h.step.clue,
      slot: h.wrong ? h.slot : h.step.slot,
      cells: new Set(h.wrong ? [`${h.slot}:${h.sym}`] : h.step.out.map(([s, x]) => `${s}:${x}`))
    };
  }
  const hint = play.hint;
  hint.level = Math.min(3, hint.level + 1);
  play.hints += 1;
  const sym = (x) => play.syms[x];
  if (hint.level === 1) {
    play.msg = (L) => `<p class="cz-code-hint"><span aria-hidden="true">🔎</span> ${esc(h.wrong
      ? ct('look.spot', L, { s: h.slot + 1 }) : lookSentence(h.step, L))}</p>`;
  } else if (hint.level === 2) {
    play.msg = (L) => `<p class="cz-code-hint"><span aria-hidden="true">💡</span> ${esc(h.wrong
      ? ct('look.wrong', L, { A: theSym(sym(h.sym), L, true), s: h.slot + 1 }) + (h.step ? ` ${stepSentence(h.step, L)}` : '')
      : stepSentence(h.step, L))}</p>`;
  } else {
    if (h.wrong) {
      play.answer[h.slot] = null;
      play.cursor = h.slot;
      play.msg = (L) => `<p class="cz-code-hint"><span aria-hidden="true">✋</span> ${esc(ct('look.wrong', L, { A: theSym(sym(h.sym), L, true), s: h.slot + 1 }))}</p>`;
    } else if (h.step.place) {
      const [s, x] = h.step.place;
      place(s, x);
      play.msg = (L) => `<p class="cz-code-hint"><span aria-hidden="true">✋</span> ${esc(ct('do.place', L, { a: theSym(sym(x), L), s: s + 1 }))}</p>`;
    } else {
      const out = h.step.out;
      out.forEach(([s, x]) => play.crossed.add(`${s}:${x}`));
      const doIt = (L) => {
        if (!out.length) return '';
        if (out.length === 1) return ct('do.cross', L, { a: theSym(sym(out[0][1]), L), s: out[0][0] + 1 });
        if (out.every(([, x]) => x === out[0][1])) return ct('do.crossAll', L, { a: theSym(sym(out[0][1]), L) });
        return ct('do.crossMany', L, { n: out.length });
      };
      play.msg = (L) => `<p class="cz-code-hint"><span aria-hidden="true">✋</span> ${esc(stepSentence(h.step, L))} ${esc(doIt(L))}</p>`;
    }
    play.hint = null;
  }
  paintBoard();
}

function hintFree() {
  const { ch } = play;
  const clues = freeClues();
  play.hints += 1;
  const level = play.hint ? play.hint.level + 1 : 1;
  const run = clues.length ? C.humanSolve(ch, clues) : { steps: [] };
  const step = run.steps.find((s) => !s.out.length || s.out.some(([a, b]) => !play.crossed.has(`${a}:${b}`)));
  if (level < 3 && step) {
    play.hint = { level, clue: step.clue, slot: step.slot, cells: new Set(step.out.map(([s, x]) => `${s}:${x}`)) };
    play.msg = (L) => `<p class="cz-code-hint"><span aria-hidden="true">${level === 1 ? '🔎' : '💡'}</span> ${esc(level === 1
      ? lookSentence(step, L, clues) : stepSentence(step, L, clues))}</p>`;
  } else {
    /* A code that fits every clue so far, put in the answer row to try. */
    const fit = C.solutions(ch, clues, 1)[0];
    play.answer = fit.slice();
    play.hint = null;
    play.msg = (L) => `<p class="cz-code-hint"><span aria-hidden="true">✋</span> ${esc(ct('freeHint', L))}</p>`;
  }
  paintBoard();
}

/* ------------------------------------------------------------------ */
/* Doing things                                                        */
/* ------------------------------------------------------------------ */

function place(slot, x) {
  if (!play.ch.repeats) {
    play.answer = play.answer.map((y, s) => (y === x && s !== slot ? null : y));
  }
  play.answer[slot] = x;
  const next = play.answer.findIndex((y, s) => y === null && s > slot);
  const first = play.answer.indexOf(null);
  play.cursor = next >= 0 ? next : first >= 0 ? first : slot;
}

function pickSymbol(x) {
  if (play.done || play.p.mode === 'could') return;
  place(play.cursor, x);
  play.bad = -1;
  play.free.warn = -1;
  if (play.msg && !play.hint) play.msg = null;
  paintBoard();
  const slot = play.host.querySelector(`[data-code-sym="${x}"]`);
  if (slot) slot.focus();
}

function tapSlot(s) {
  if (play.done) return;
  if (play.cursor === s && play.answer[s] !== null) play.answer[s] = null;
  play.cursor = s;
  paintBoard();
  const el = play.host.querySelector(`[data-code-slot="${s}"]`);
  if (el) el.focus();
}

function toggleNote(k) {
  if (play.done) return;
  if (play.crossed.has(k)) play.crossed.delete(k); else play.crossed.add(k);
  play.flagged.delete(k);
  paintBoard();
  const el = play.host.querySelector(`[data-code-note="${k}"]`);
  if (el) el.focus();
}

function checkNotes() {
  const { p } = play;
  const secret = p.mode === 'free' ? play.free.secret : p.secret;
  play.flagged = new Set([...play.crossed].filter((k) => {
    const [s, x] = k.split(':').map(Number);
    return secret[s] === x;
  }));
  const n = play.flagged.size;
  play.msg = (L) => `<p class="cz-code-note-msg">${esc(n === 0 ? ct('notesOk', L) : ct(n === 1 ? 'notesBad' : 'notesBadMany', L, { n }))}</p>`;
  paintBoard();
}

function filled() {
  if (play.answer.some((x) => x === null)) {
    play.msg = (L) => `<p class="cz-code-say is-wrong">${esc(ct('fillAll', L))}</p>`;
    paintBoard();
    return false;
  }
  return true;
}

function checkClue() {
  const { ch, p } = play;
  if (!filled()) return;
  if (C.sameCode(play.answer, p.secret)) {
    play.done = true;
    const stars = C.starsFor('clue', { hints: p.teach ? 0 : play.hints, tries: play.tries + 1 });
    const steps = C.humanSolve(ch, play.clues).steps;
    play.msg = (L) => `<p class="cz-code-say is-right">✓ ${esc(ct('right', L))}</p>`;
    paintBoard();
    play.ctx.onSolved({ stars, why: (L) => whyLines(L, steps) });
    return;
  }
  play.tries += 1;
  const ci = C.ignoredClue(ch, play.clues, play.answer);
  play.bad = ci;
  play.msg = (L) => `<p class="cz-code-say is-wrong">${esc(ct('notYet', L, { n: ci + 1 }))}</p>`;
  react('oops', 1600);
  paintBoard();
}

function answerCould(choice) {
  const { ch, p } = play;
  if (play.done) return;
  const right = (choice === 'yes') === p.yes;
  const broken = p.yes ? -1 : p.broken;
  const would = (L) => {
    if (broken < 0) return '';
    const c = { g: play.clues[broken].g, f: C.feedback(play.clues[broken].g, p.cand, ch.fb) };
    return `<p class="cz-code-would">${esc(ct('wouldShow', L, { n: broken + 1 }))}</p>
      <ol class="cz-code-clues cz-code-clues--would">${clueRow(ch, c, broken, L)}</ol>`;
  };
  if (right) {
    play.done = true;
    play.bad = broken;
    const stars = C.starsFor('could', { tries: play.tries + 1 });
    const line = (L) => esc(p.yes ? ct('couldRightYes', L) : ct('couldRightNo', L, { n: broken + 1 }));
    play.msg = (L) => `<p class="cz-code-say is-right">✓ ${line(L)}</p>${would(L)}`;
    paintBoard();
    play.ctx.onSolved({ stars, why: (L) => [line(L)] });
    return;
  }
  play.tries += 1;
  play.msg = (L) => `<p class="cz-code-say is-wrong">${esc(p.yes ? ct('couldWrongYes', L) : ct('couldWrongNo', L, { n: broken + 1 }))}</p>${would(L)}`;
  react('oops', 1600);
  paintBoard();
}

function guessFree(anyway = false) {
  const { ch } = play;
  const f = play.free;
  if (!filled()) return;
  if (!C.legalGuess(ch, play.answer)) {
    play.msg = (L) => `<p class="cz-code-say is-wrong">${esc(ct('noTwins', L))}</p>`;
    paintBoard();
    return;
  }
  const ci = C.ignoredClue(ch, freeClues(), play.answer);
  if (ci >= 0 && !anyway) {
    f.warn = ci;
    play.msg = (L) => `<div class="cz-code-detective"><p><span aria-hidden="true">🕵️</span> ${esc(ct('detective', L, { n: ci + 1 }))}</p>
      <button type="button" class="gp-btn gp-btn--ghost" data-action="code-anyway">${esc(ct('guessAnyway', L))}</button>
      <button type="button" class="gp-btn gp-btn--primary" data-action="code-change">${esc(ct('changeIt', L))}</button></div>`;
    paintBoard();
    return;
  }
  const g = play.answer.slice();
  f.guesses.push({ g, f: C.feedback(g, f.secret, ch.fb), consistent: ci < 0 });
  f.warn = -1;
  play.hint = null;
  if (C.sameCode(g, f.secret)) {
    play.done = true;
    const smart = f.guesses.filter((x) => x.consistent).length;
    const total = f.guesses.length;
    const stars = C.starsFor('free', { hints: play.hints, consistent: smart === total });
    play.msg = (L) => `<p class="cz-code-say is-right">✓ ${esc(ct('right', L))}</p>`;
    paintBoard();
    play.ctx.onSolved({ stars, why: (L) => [esc(ct('freeWhy', L, { n: smart, t: total }))] });
    return;
  }
  play.answer = new Array(ch.n).fill(null);
  play.cursor = 0;
  play.msg = null;
  if (f.guesses.length >= ch.budget) {
    f.out = true;
    play.msg = (L) => `<p class="cz-code-say">${esc(ct('freeWhy', L, {
      n: f.guesses.filter((x) => x.consistent).length, t: f.guesses.length }))}</p>`;
  }
  paintBoard();
}

/* Out of guesses: a fresh secret, so trying again is a real try. */
function freeAgain() {
  const { ch, p } = play;
  const f = play.free;
  f.attempt += 1;
  f.secret = C.makeFreePuzzle(ch, rngFor('code', 'again', p.id || 'daily', f.attempt)).secret;
  f.guesses = [];
  f.out = false;
  play.answer = new Array(ch.n).fill(null);
  play.cursor = 0;
  play.crossed = new Set();
  play.flagged = new Set();
  play.msg = null;
  play.hint = null;
  paintBoard();
}

function clearAnswer() {
  play.answer = new Array(play.ch.n).fill(null);
  play.cursor = 0;
  play.bad = -1;
  play.msg = null;
  paintBoard();
}

/* ------------------------------------------------------------------ */
/* Clicks, keys, reading aloud                                         */
/* ------------------------------------------------------------------ */

function click(ev) {
  if (!play) return false;
  const sym = ev.target.closest('[data-code-sym]');
  if (sym) { pickSymbol(Number(sym.dataset.codeSym)); return true; }
  const slot = ev.target.closest('[data-code-slot]');
  if (slot) { tapSlot(Number(slot.dataset.codeSlot)); return true; }
  const note = ev.target.closest('[data-code-note]');
  if (note) { toggleNote(note.dataset.codeNote); return true; }
  const could = ev.target.closest('[data-code-could]');
  if (could) { answerCould(could.dataset.codeCould); return true; }
  const action = ev.target.closest('[data-action]');
  if (!action) return false;
  switch (action.dataset.action) {
    case 'code-check': checkClue(); return true;
    case 'code-guess': guessFree(); return true;
    case 'code-anyway': guessFree(true); return true;
    case 'code-change': play.free.warn = -1; play.msg = null; paintBoard(); return true;
    case 'code-again': freeAgain(); return true;
    case 'code-clear': clearAnswer(); return true;
    case 'code-checknotes': checkNotes(); return true;
    case 'code-hint':
      if (play.p.mode === 'free') hintFree(); else hintClue();
      return true;
    default: return false;
  }
}

function key(ev) {
  if (!play || play.done || play.p.mode === 'could') return false;
  if (/^(INPUT|TEXTAREA|SELECT)$/.test(ev.target.tagName)) return false;
  const { ch } = play;
  if (/^[0-9]$/.test(ev.key)) {
    const x = ch.digits ? Number(ev.key) : Number(ev.key) - 1;
    if (x < 0 || x >= ch.k) return false;
    ev.preventDefault();
    pickSymbol(x);
    return true;
  }
  if (ev.key === 'ArrowLeft' || ev.key === 'ArrowRight') {
    if (!ev.target.closest || !ev.target.closest('.cz-code-answer')) return false;
    ev.preventDefault();
    play.cursor = (play.cursor + (ev.key === 'ArrowRight' ? 1 : ch.n - 1)) % ch.n;
    paintBoard();
    const el = play.host.querySelector(`[data-code-slot="${play.cursor}"]`);
    if (el) el.focus();
    return true;
  }
  if (ev.key === 'Backspace' || ev.key === 'Delete') {
    ev.preventDefault();
    play.answer[play.cursor] = null;
    paintBoard();
    return true;
  }
  if (ev.key === 'Enter' && !ev.target.closest('button, a, summary')) {
    ev.preventDefault();
    if (play.p.mode === 'free') guessFree(); else checkClue();
    return true;
  }
  return false;
}

function readAloud() {
  if (!play) return;
  const L = L0();
  const { ch, p } = play;
  const parts = [ct(`ask.${p.mode}`, L)];
  const list = p.mode === 'free' ? play.free.guesses : play.clues;
  list.forEach((c, i) => parts.push(clueWords(ch, c, i, L)));
  if (p.mode === 'could') parts.push(`${ct('thisCode', L)}: ${p.cand.map((x) => symName(play.syms[x], L)).join(', ')}.`);
  say(parts);
}

const repaint = () => { if (play) paintBoard(); };

/* ------------------------------------------------------------------ */
/* The zoo map, today's safe, and news after a solve                   */
/* ------------------------------------------------------------------ */

const LOCK_EVERY = 10;
const LOCKS = 7;
const locksOpen = (solved) => Math.min(LOCKS, Math.floor(solved / LOCK_EVERY));

function extras({ level, bank: b, rec, lang: L }) {
  const cards = C.CHAPTERS[level].map((ch, i) => {
    const ids = b.chapters[i].puzzles.map((p) => p.id);
    const open = locksOpen(P.tally(rec, 'code', ids).solved);
    const a = ANIMALS.find((x) => x.id === ch.animal);
    const home = open >= LOCKS;
    return `<li class="cz-code-pen${home ? ' is-home' : ''}">
      <span class="cz-code-pen__pic" aria-hidden="true">${home ? a.emoji : '🔒'}</span>
      <span class="cz-code-pen__text"><strong>${esc(animalName(a, L))}</strong>
        <span class="cz-code-pen__locks" aria-hidden="true">${Array.from({ length: LOCKS }, (_, k) => `<span class="${k < open ? 'is-open' : ''}"></span>`).join('')}</span>
        <span>${esc(ct('zoo.locks', L, { n: open }))}</span>
        ${home ? `<span class="cz-code-pen__fact">${esc(ct(`fact.${a.id}`, L))}</span>` : ''}</span>
    </li>`;
  }).join('');
  return `<section class="cz-code-zoo" aria-labelledby="cz-code-zoo-h">
    <h2 class="cz-logic-h2" id="cz-code-zoo-h">${esc(ct('zoo.title', L))}</h2>
    <p class="gp-muted">${esc(ct('zoo.lede', L))}</p>
    <ul class="cz-code-pens">${cards}</ul>
  </section>`;
}

function news({ chapterId, before, after, ids, lang: L }) {
  const was = locksOpen(P.tally(before, 'code', ids).solved);
  const now = locksOpen(P.tally(after, 'code', ids).solved);
  if (now <= was) return [];
  const a = ANIMALS.find((x) => x.id === C.chapter(chapterId).animal);
  if (now >= LOCKS) {
    return [`${a.emoji} <strong>${esc(ct('zoo.home', L, { A: theAnimal(a, L, true) }))}</strong> ${esc(ct(`fact.${a.id}`, L))}`];
  }
  return [`🔓 ${esc(ct('zoo.lock', L, { n: now }))}`];
}

/** Today's safe: one Clue Safe from a chapter of the level, the same for everybody. */
function dailyPuzzle(level, iso) {
  const list = C.CHAPTERS[level].filter((ch) => ch.id !== 'e1');
  const def = list[hash('code-daily', level, iso) % list.length];
  const ch = C.chapter(def.id);
  const p = C.makePuzzle(ch, 'clue', ['daily', level, iso]);
  if (!p) return null;
  const puzzle = { id: `daily-${iso}`, ...p };
  if (!ch.digits) puzzle.sym = C.pickSymbols(rngFor('code', 'daily-sym', level, iso), ch.k, ANIMALS.length);
  return { puzzle, chapterId: ch.id };
}

export default {
  id: 'code', bank, chapters, levelOfChapter, tileLabel, draw, repaint, click, key,
  say: readAloud, extras, news, dailyPuzzle
};
