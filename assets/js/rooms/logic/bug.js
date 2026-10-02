/**
 * rooms/logic/bug.js — Fix the Bug: find, fix and predict robot programs.
 *
 * Four kinds of puzzle on the robot's workbench (robotbench.js):
 *   fix      the program has one bug; edit it until it works
 *   find     tap the wrong tile, then choose what goes there (Easy, Medium)
 *   order    the right tiles in the wrong order; tap two to swap (Easy)
 *   predict  read the program and tap where the robot will stop
 *
 * Reading and fixing come before writing (use, modify, create), and tracing
 * a program in your head is the skill underneath all of it, so the best
 * stars go to finding a bug before pressing Run. The hints teach the
 * debugging routine itself: what happened, what should have happened, step
 * until they part, then look at that tile.
 */

import * as BG from '../../modules/robotbug.js';
import * as V from '../../modules/robotvm.js';
import * as P from '../../modules/logicprogress.js';
import { OP_ICON, rb } from '../../modules/robottext.js';
import { rngFor } from '../../modules/logicrng.js';
import { calm } from '../../modules/celebrate.js';
import { paint, react } from '../../modules/shell.js';
import { esc, lang, say, t } from './frame.js';
import * as RB from './robotbench.js';

/* ------------------------------------------------------------------ */
/* The bank and the chapters                                           */
/* ------------------------------------------------------------------ */

const banks = new Map();

async function bank(level) {
  if (!banks.has(level)) {
    banks.set(level, fetch(`data/logic/bug/${level}.json`, { cache: 'no-cache' }).then((res) => {
      if (!res.ok) throw new Error(`Could not load the ${level} bug puzzles`);
      return res.json();
    }));
    banks.get(level).catch(() => banks.delete(level));
  }
  return banks.get(level);
}

const chapters = (level, L) => BG.CHAPTERS[level].map((c) => ({ id: c.id, title: rb(`bch.${c.id}`, L), idea: rb(`bch.${c.id}.idea`, L) }));
const levelOfChapter = (id) => (BG.chapter(id) || {}).level || null;
const ICON = { fix: '🔧', find: '🔍', order: '🔀', predict: '📍' };
const tileLabel = (p, L) => (p.teach ? { icon: '🎓', text: t('teach') } : { icon: ICON[p.mode] || '🐞', text: rb('tile.bug', L) });

/* ------------------------------------------------------------------ */
/* State                                                               */
/* ------------------------------------------------------------------ */

let play = null;

/** The child left the puzzle: stop a run, so it never ends on another screen. */
function leave() {
  if (play && play.b) RB.stopRun(play.b);
  play = null;
}

function draw(host, ctx) {
  if (play && play.b) RB.stopRun(play.b);
  const p = ctx.puzzle;
  /* The buggy program may be longer than the level's slots (an extra
     step), so give each row room for it and one more tile. */
  const slots = { ...p.slots };
  for (const r of V.ROWS) if (p.prog[r]) slots[r] = Math.max(slots[r] || 0, V.sizeOf(p.prog[r]) + 1);
  const b = RB.makeBench({ ...p, slots }, p.prog);
  play = {
    host, ctx, p, b, mode: p.mode, runs: 0, edits: 0, slips: 0, hint: 0, msg: null, done: false,
    found: false, swapFrom: null, picked: null
  };
  paintBoard();
}

/* ------------------------------------------------------------------ */
/* Drawing                                                             */
/* ------------------------------------------------------------------ */

const optionLabel = (o, L) => (o.op === 'rep' ? `${OP_ICON.rep} ×${o.n}` : `${OP_ICON[o.op] || ''} ${rb(`op.${o.op}`, L)}`);

function paintBoard() {
  const L = lang();
  const { b, mode, p } = play;
  const running = Boolean(b.runner && b.runner.timer);
  b.locked = play.done || running || mode !== 'fix';
  const marks = mode === 'predict' && !play.done
    ? p.choices.map(([x, y]) => [x, y, play.picked && play.picked[0] === x && play.picked[1] === y ? 'picked' : null])
    : null;
  let extra = '';
  if (mode === 'find' && play.found && !play.done) {
    extra = `<p class="cz-code-hint">💡 ${esc(rb('bug.find.pick', L))}</p><div class="cz-tr-chips">${p.options.map((o, i) =>
      `<button type="button" class="gp-pill cz-bug-opt" data-bug-opt="${i}">${esc(optionLabel(o, L))}</button>`).join('')}</div>`;
  }
  const runBar = mode === 'fix' || mode === 'order' || (mode === 'find' && !play.found)
    ? (play.done ? '' : RB.runBar(b, L)) : '';
  RB.renderInto(play.host, `<div class="cz-rb cz-bug cz-bug--${mode}" lang="${L}">
    <p class="cz-code-ask">🐞 ${esc(rb(`bug.ask.${mode}`, L))}</p>
    ${RB.boardSvg(b, L, marks)}
    ${runBar}
    ${RB.editorHtml(b, L, { palette: mode === 'fix' })}
    ${extra}
    ${play.done ? '' : `<div class="cz-code-actions"><button type="button" class="gp-btn gp-btn--ghost" data-action="bug-hint">
      <span aria-hidden="true">🔎</span> ${esc(play.hint ? t('hintMore') : t('hint'))}</button></div>`}
    <div class="cz-code-msg" aria-live="polite">${play.msg ? play.msg(L) : ''}</div>
  </div>`);
  /* The tile picked to swap (order) and the tiles being tapped (find) are
     buttons in the locked editor: let them be pressed. */
  if (mode === 'order' || mode === 'find') {
    play.host.querySelectorAll('[data-rb-tile]').forEach((el) => el.classList.add('is-tappable'));
    if (play.swapFrom) {
      const el = play.host.querySelector(`[data-rb-tile="${play.swapFrom.join('.')}"]`);
      if (el) el.classList.add('is-selected');
    }
  }
  paint();
}

/* ------------------------------------------------------------------ */
/* Running                                                             */
/* ------------------------------------------------------------------ */

function animate(done) {
  const { b } = play;
  RB.startRun(b);
  if (calm()) {
    while (!RB.advance(b)) { /* to the end */ }
    done(RB.finish(b));
    return;
  }
  const tick = () => {
    if (!play || play.b !== b || !b.runner) return;
    if (RB.advance(b)) { done(RB.finish(b)); return; }
    paintBoard();
    b.runner.timer = setTimeout(tick, b.speed);
  };
  b.runner.timer = setTimeout(tick, 60);
  paintBoard();
}

function runIt() {
  play.runs += 1;
  play.msg = null;
  animate((res) => {
    if (res.ok) { win(); return; }
    play.msg = (L) => `<p class="cz-code-say is-wrong">🐞 ${esc(rb(`why.${res.why}`, L))}</p>`;
    react('oops', 1400);
    paintBoard();
  });
}

function stepIt() {
  const { b } = play;
  if (!b.runner || b.runner.at >= b.runner.events.length - 1) RB.startRun(b);
  if (RB.advance(b)) {
    const res = RB.finish(b);
    if (res.ok && play.mode === 'fix') { play.runs += 1; win(); return; }
    play.msg = (L) => `<p class="cz-code-say ${res.ok ? 'is-right' : 'is-wrong'}">${esc(res.ok ? rb('right', L) : rb(`why.${res.why}`, L))}</p>`;
  }
  paintBoard();
}

function win() {
  play.done = true;
  const { p, mode } = play;
  const stars = BG.starsFor(mode, { runs: play.runs, edits: play.edits, slips: play.slips });
  play.msg = (L) => `<p class="cz-code-say is-right">✓ ${esc(mode === 'predict' ? rb('bug.predict.right', L) : rb('right', L))}</p>`;
  paintBoard();
  react('happy', 2000);
  play.ctx.onSolved({
    stars,
    why: (L) => {
      if (mode === 'order') return [esc(rb('bug.whyOrder', L))];
      const lines = [];
      const lessonKey = p.bug && p.bug.m === 'M1' && p.abs ? 'bug.M1.lessonAbs' : p.bug && `bug.${p.bug.m}.lesson`;
      if (p.bug) lines.push(esc(rb('bug.why', L, { name: rb(`bug.${p.bug.m}`, L), lesson: rb(lessonKey, L) })));
      if (mode === 'predict') lines.push(esc(rb('bug.whyPredict', L)));
      return lines;
    }
  });
}

/* ------------------------------------------------------------------ */
/* The four modes                                                      */
/* ------------------------------------------------------------------ */

const samePath = (a, b) => a && b && a.join('.') === b.join('.');

function tapFind(path) {
  if (play.found) return;
  if (samePath(path, play.p.bug.at)) {
    play.found = true;
    play.b.bug = path;
    play.msg = null;
  } else {
    play.slips += 1;
    play.msg = (L) => `<p class="cz-code-say is-wrong">${esc(rb('bug.find.notThis', L))}</p>`;
    react('oops', 1200);
  }
  paintBoard();
}

function pickOption(i) {
  const { p, b } = play;
  const at = p.bug.at;
  const trial = V.clone(b.prog);
  V.listAt(trial, at.slice(0, -1))[at[at.length - 1]] = p.options[i];
  if (!V.run(p, trial).ok) {
    play.slips += 1;
    play.msg = (L) => `<p class="cz-code-say is-wrong">${esc(rb('bug.find.badPick', L))}</p>`;
    react('oops', 1200);
    paintBoard();
    return;
  }
  b.prog = trial;
  b.bug = null;
  play.found = false;
  play.msg = null;
  animate(() => win());
}

function tapOrder(path) {
  if (path.length !== 2) return;
  if (!play.swapFrom) {
    play.swapFrom = path;
    play.msg = (L) => `<p class="cz-code-hint">${esc(rb('bug.order.picked', L))}</p>`;
  } else {
    const list = play.b.prog.main;
    const [, i] = play.swapFrom;
    const [, j] = path;
    [list[i], list[j]] = [list[j], list[i]];
    play.swapFrom = null;
    play.msg = null;
    RB.stopRun(play.b);
  }
  paintBoard();
}

function predict(i) {
  const { p } = play;
  const [x, y] = p.choices[i];
  play.picked = [x, y];
  const right = x === p.answer[0] && y === p.answer[1];
  /* Every answer counts, the right one too: 1 is "right first time". */
  play.runs += 1;
  play.msg = null;
  animate(() => {
    if (right) { win(); return; }
    play.picked = null;
    play.msg = (L) => `<p class="cz-code-say is-wrong">${esc(rb('bug.predict.wrong', L))}</p>`;
    react('oops', 1400);
    paintBoard();
  });
}

/* ------------------------------------------------------------------ */
/* Hints: the debugging routine                                        */
/* ------------------------------------------------------------------ */

function hint() {
  play.hint += 1;
  const { p, mode } = play;
  if (mode === 'predict') {
    play.msg = (L) => `<p class="cz-code-hint">🔎 ${esc(rb('bug.hint.predict', L))}</p>`;
  } else if (mode === 'order') {
    play.msg = (L) => `<p class="cz-code-hint">🔎 ${esc(rb(play.hint === 1 ? 'bug.hint.1' : 'bug.hint.2', L))}</p>`;
  } else if (play.hint === 1) {
    play.msg = (L) => `<p class="cz-code-hint">🔎 ${esc(rb('bug.hint.1', L))}</p>`;
  } else if (play.hint === 2) {
    play.msg = (L) => `<p class="cz-code-hint">💡 ${esc(rb('bug.hint.2', L))}</p>`;
  } else {
    /* Point at the tile the bug was put in (it may have moved if the child
       has edited around it, so only while the program still matches). */
    play.b.bug = p.bug ? p.bug.at : null;
    play.msg = (L) => `<p class="cz-code-hint">✋ ${esc(rb('bug.hint.3', L))}</p>`;
  }
  paintBoard();
}

/* ------------------------------------------------------------------ */
/* Clicks, keys, reading aloud                                         */
/* ------------------------------------------------------------------ */

function click(ev) {
  if (!play || play.done) return false;
  const { b, mode } = play;
  const q = (s) => ev.target.closest(s);
  const action = q('[data-action]');
  const name = action ? action.dataset.action : '';
  if (name === 'bug-hint') { hint(); return true; }
  if (name === 'rb-run') { runIt(); return true; }
  if (name === 'rb-step') { stepIt(); return true; }
  if (name === 'rb-reset') { RB.stopRun(b); play.msg = null; paintBoard(); return true; }
  if (name === 'rb-speed') { b.speed = b.speed > 200 ? 140 : 360; paintBoard(); return true; }
  if (b.runner && b.runner.timer) return false;
  let el;
  if (mode === 'predict' && (el = q('[data-rb-mark]'))) { predict(Number(el.dataset.rbMark)); return true; }
  if (mode === 'find' && (el = q('[data-bug-opt]'))) { pickOption(Number(el.dataset.bugOpt)); return true; }
  if ((mode === 'find' || mode === 'order') && (el = q('[data-rb-tile]'))) {
    const path = el.dataset.rbTile.split('.').map((x) => (/^\d+$/.test(x) ? Number(x) : x));
    if (mode === 'find') tapFind(path); else tapOrder(path);
    return true;
  }
  if (mode !== 'fix') return false;
  const before = JSON.stringify(b.prog);
  const out = RB.benchClick(b, ev);
  if (!out) return false;
  if (JSON.stringify(b.prog) !== before) { play.edits += 1; RB.stopRun(b); }
  play.msg = typeof out === 'string' ? (L) => `<p class="cz-code-say is-wrong">${esc(rb(out, L))}</p>` : null;
  paintBoard();
  return true;
}

function key(ev) {
  if (!play || play.done) return false;
  const mark = ev.target.closest && ev.target.closest('[data-rb-mark]');
  if (mark && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); predict(Number(mark.dataset.rbMark)); return true; }
  return false;
}

function readAloud() {
  if (!play) return;
  say([rb(`bug.ask.${play.mode}`, lang())]);
}

const repaint = () => { if (play) paintBoard(); };

/* ------------------------------------------------------------------ */
/* The bug jar, and today's puzzle                                     */
/* ------------------------------------------------------------------ */

function extras({ bank: b, rec, lang: L }) {
  const caught = new Set();
  for (const ch of b.chapters) for (const p of ch.puzzles) if (p.bug && P.starsOf(rec, 'bug', p.id)) caught.add(p.bug.m);
  const cards = BG.MUTATIONS.map((m) => {
    const has = caught.has(m);
    return `<li class="cz-code-pen${has ? ' is-home' : ''}">
      <span class="cz-code-pen__pic" aria-hidden="true">${has ? '🐞' : '🫙'}</span>
      <span class="cz-code-pen__text"><strong>${esc(rb(`bug.${m}`, L))}</strong>
        <span class="cz-code-pen__fact">${esc(has ? rb(`bug.${m}.lesson`, L) : rb('jar.none', L))}</span></span>
    </li>`;
  }).join('');
  return `<section class="cz-code-zoo" aria-labelledby="cz-bug-jar-h">
    <h2 class="cz-logic-h2" id="cz-bug-jar-h">🫙 ${esc(rb('jar.title', L))}</h2>
    <p class="gp-muted">${esc(rb('jar.lede', L))}</p>
    <ul class="cz-code-pens">${cards}</ul>
  </section>`;
}

/* Today's bug comes from the day's place in the level's own bank, made
   fresh with the date: a bank level, a new bug. */
async function dailyFrom(level, iso) {
  const robot = await RB.robotBank(level);
  const all = robot.chapters.flatMap((c) => c.puzzles);
  const rng = rngFor('bug', 'daily', level, iso);
  for (let t = 0; t < 30; t++) {
    const l = all[Math.floor(rng() * all.length)];
    const p = BG.makeBugPuzzle(l, 'fix', rng, { easy: level === 'easy' });
    if (p) return { puzzle: { id: `daily-${iso}`, ...l, ...p, mode: 'fix', prog: p.start, start: l.start }, chapterId: BG.CHAPTERS[level][0].id };
  }
  return null;
}

const dailyPuzzle = (level, iso) => dailyFrom(level, iso);

export default {
  id: 'bug', bank, chapters, levelOfChapter, tileLabel, draw, repaint, click, key,
  say: readAloud, extras, dailyPuzzle, leave
};
