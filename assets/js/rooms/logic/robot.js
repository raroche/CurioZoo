/**
 * rooms/logic/robot.js — Robot Path: program the zookeeper robot.
 *
 * The board, the editor and the runner are robotbench.js (Fix the Bug uses
 * them too). This file is the game around them: the levels, the hints, the
 * stars and the words after a solve.
 *
 * Stars measure the program's size, never the time: ★ solved, ★★ within two
 * tiles of par, ★★★ at par or better, where par is the size of a program we
 * know works. Hints never cost stars here: the research on teaching
 * debugging found that being shown how to look is the lesson.
 */

import * as G from '../../modules/robotgen.js';
import * as V from '../../modules/robotvm.js';
import * as P from '../../modules/logicprogress.js';
import { KIND_WORD, rb } from '../../modules/robottext.js';
import { hash, rngFor } from '../../modules/logicrng.js';
import { calm } from '../../modules/celebrate.js';
import { paint, react } from '../../modules/shell.js';
import { esc, lang, say, t } from './frame.js';
import * as RB from './robotbench.js';

/* ------------------------------------------------------------------ */
/* The bank and the worlds                                             */
/* ------------------------------------------------------------------ */

const banks = new Map();

export async function robotBank(level) {
  if (!banks.has(level)) {
    banks.set(level, fetch(`data/logic/robot/${level}.json`, { cache: 'no-cache' }).then((res) => {
      if (!res.ok) throw new Error(`Could not load the ${level} robot levels`);
      return res.json();
    }));
    banks.get(level).catch(() => banks.delete(level));
  }
  return banks.get(level);
}

const chapters = (level, L) => G.WORLDS[level].map((w) => ({ id: w.id, title: rb(`ch.${w.id}`, L), idea: rb(`ch.${w.id}.idea`, L) }));
const levelOfChapter = (id) => (G.world(id) || {}).level || null;
const tileLabel = (p, L) => (p.teach ? { icon: '🎓', text: t('teach') } : { icon: '🤖', text: rb('tile.level', L) });

/* ------------------------------------------------------------------ */
/* Playing                                                             */
/* ------------------------------------------------------------------ */

let play = null;

function draw(host, ctx) {
  if (play && play.b) RB.stopRun(play.b);
  play = { host, ctx, b: RB.makeBench(ctx.puzzle), hint: 0, done: false, msg: null };
  paintBoard();
}

function paintBoard() {
  const L = lang();
  const { b } = play;
  b.locked = play.done || Boolean(b.runner && b.runner.timer);
  play.host.innerHTML = `<div class="cz-rb" lang="${L}">
    <p class="cz-code-ask">${esc(rb(b.level.abs ? 'askAbs' : 'askRel', L))}</p>
    ${RB.boardSvg(b, L)}
    ${play.done ? '' : RB.runBar(b, L)}
    ${RB.editorHtml(b, L)}
    ${play.done ? '' : `<div class="cz-code-actions"><button type="button" class="gp-btn gp-btn--ghost" data-action="rb-hint">
      <span aria-hidden="true">🔎</span> ${esc(play.hint ? t('hintMore') : t('hint'))}</button></div>`}
    <div class="cz-code-msg" aria-live="polite">${play.msg ? play.msg(L) : ''}</div>
  </div>`;
  paint();
}

function ended() {
  const { b } = play;
  const res = RB.finish(b);
  if (res.ok) { win(); return; }
  play.msg = (L) => `<p class="cz-code-say is-wrong">🐞 ${esc(rb(V.programSize(b.prog) ? `why.${res.why}` : 'why.empty', L))}</p>`;
  react('oops', 1500);
  paintBoard();
}

function runAll() {
  const { b } = play;
  RB.startRun(b);
  play.msg = null;
  if (calm()) {
    /* No ride: jump straight to the end, where the robot stopped. */
    while (!RB.advance(b)) { /* step to the last event */ }
    ended();
    return;
  }
  const tick = () => {
    if (!play || play.b !== b || !b.runner) return;
    const end = RB.advance(b);
    if (end) { ended(); return; }
    paintBoard();
    b.runner.timer = setTimeout(tick, b.speed);
  };
  b.runner.timer = setTimeout(tick, 60);
  paintBoard();
}

function stepOnce() {
  const { b } = play;
  if (!b.runner || b.runner.at >= b.runner.events.length - 1) RB.startRun(b);
  play.msg = null;
  const end = RB.advance(b);
  if (end) { ended(); return; }
  paintBoard();
}

function win() {
  play.done = true;
  const { b } = play;
  const lv = b.level;
  const mine = V.programSize(b.prog);
  const stars = mine <= lv.par ? 3 : mine <= lv.par + 2 ? 2 : 1;
  const kind = KIND_WORD[lv.kind] || 'seq';
  play.msg = (L) => `<p class="cz-code-say is-right">✓ ${esc(rb('right', L))}</p>`;
  paintBoard();
  react('happy', 2000);
  play.ctx.onSolved({
    stars,
    why: (L) => {
      const lines = [];
      if (kind === 'seq') lines.push(rb('whyDone.seq', L, { par: mine }));
      else if (kind === 'loop' || kind === 'helper') lines.push(rb(`whyDone.${kind}`, L, { saved: Math.max(0, lv.flat - mine), mine, flat: lv.flat }));
      else lines.push(rb(`whyDone.${kind}`, L));
      if (kind !== 'seq') lines.push(rb('whyDone.par', L, { par: lv.par, mine }));
      return lines.map(esc);
    }
  });
}

/* ------------------------------------------------------------------ */
/* Hints: how to look, what idea fits, then the start of a program      */
/* ------------------------------------------------------------------ */

function hint() {
  const { b } = play;
  play.hint += 1;
  const kind = KIND_WORD[b.level.kind] || 'seq';
  if (play.hint === 1) {
    play.msg = (L) => `<p class="cz-code-hint">🔎 ${esc(rb('hint.process', L))}</p>`;
  } else if (play.hint === 2) {
    play.msg = (L) => `<p class="cz-code-hint">💡 ${esc(rb(`hint.${kind}`, L))}</p>`;
  } else {
    /* Show one more tile of a program that works: the first place the
       child's Main differs, or, once Main matches, the helper rows. */
    const ref = b.level.ref;
    RB.stopRun(b);
    const mine = b.prog.main;
    let k = 0;
    while (k < mine.length && k < ref.main.length && JSON.stringify(mine[k]) === JSON.stringify(ref.main[k])) k += 1;
    b.undo.push(JSON.stringify(b.prog));
    if (k < ref.main.length) b.prog.main = V.clone({ main: ref.main.slice(0, k + 1) }).main;
    else for (const r of b.rows) if (ref[r]) b.prog[r] = V.clone({ x: ref[r] }).x;
    b.caret = { path: ['main'], index: b.prog.main.length };
    b.sel = null;
    play.msg = (L) => `<p class="cz-code-hint">✋ ${esc(rb('hint.show', L))}</p>`;
  }
  paintBoard();
}

/* ------------------------------------------------------------------ */
/* Clicks, keys, reading aloud                                         */
/* ------------------------------------------------------------------ */

function click(ev) {
  if (!play || play.done) return false;
  const { b } = play;
  const action = ev.target.closest('[data-action]');
  const name = action ? action.dataset.action : '';
  if (name === 'rb-run') { runAll(); return true; }
  if (name === 'rb-step') { stepOnce(); return true; }
  if (name === 'rb-reset') { RB.stopRun(b); play.msg = null; paintBoard(); return true; }
  if (name === 'rb-speed') { b.speed = b.speed > 200 ? 140 : 360; paintBoard(); return true; }
  if (name === 'rb-hint') { hint(); return true; }
  if (b.runner && b.runner.timer) return false;
  /* Any edit sends the robot back to the start. */
  const before = JSON.stringify(b.prog);
  const out = RB.benchClick(b, ev);
  if (!out) return false;
  if (JSON.stringify(b.prog) !== before) RB.stopRun(b);
  play.msg = typeof out === 'string' ? (L) => `<p class="cz-code-say is-wrong">${esc(rb(out, L))}</p>` : null;
  paintBoard();
  return true;
}

function key(ev) {
  if (!play || play.done) return false;
  if (/^(INPUT|TEXTAREA)$/.test(ev.target.tagName)) return false;
  if (ev.key === 'Backspace') {
    ev.preventDefault();
    const { b } = play;
    if (b.caret.index > 0) { RB.removeAt(b, [...b.caret.path, b.caret.index - 1]); RB.stopRun(b); paintBoard(); }
    return true;
  }
  return false;
}

function readAloud() {
  if (!play) return;
  const L = lang();
  say([rb(play.b.level.abs ? 'askAbs' : 'askRel', L)]);
}

const repaint = () => { if (play) paintBoard(); };

/* ------------------------------------------------------------------ */
/* The keeper's round, and today's level                               */
/* ------------------------------------------------------------------ */

function extras({ bank: b, rec, lang: L }) {
  const cards = b.chapters.map((ch) => {
    const ids = ch.puzzles.map((p) => p.id);
    const { solved } = P.tally(rec, 'robot', ids);
    return `<li class="cz-code-pen${solved >= ids.length ? ' is-home' : ''}">
      <span class="cz-code-pen__pic" aria-hidden="true">${solved >= ids.length ? '🏁' : '🤖'}</span>
      <span class="cz-code-pen__text"><strong>${esc(rb(`ch.${ch.id}`, L))}</strong>
        <span>${esc(rb('map.count', L, { n: solved, t: ids.length }))}</span></span>
    </li>`;
  }).join('');
  return `<section class="cz-code-zoo" aria-labelledby="cz-rb-map-h">
    <h2 class="cz-logic-h2" id="cz-rb-map-h">🗺️ ${esc(rb('map.title', L))}</h2>
    <p class="gp-muted">${esc(rb('map.lede', L))}</p>
    <ul class="cz-code-pens">${cards}</ul>
  </section>`;
}

function dailyPuzzle(level, iso) {
  const list = G.WORLDS[level];
  const w = list[hash('robot-daily', level, iso) % list.length];
  const lv = G.makeLevel(G.world(w.id), rngFor('robot', 'daily', level, iso));
  return lv ? { puzzle: { id: `daily-${iso}`, ...lv }, chapterId: w.id } : null;
}

export default {
  id: 'robot', bank: robotBank, chapters, levelOfChapter, tileLabel, draw, repaint, click, key,
  say: readAloud, extras, dailyPuzzle
};
