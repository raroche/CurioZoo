/**
 * rooms/science/fountain.js — Elephant Fountain, drawn.
 *
 * One SVG grid under the elephant: rock, dirt you can dig (tap), gates you
 * open and shut (tap), cups where animals drink, and the sleeping cat. Every
 * cell the child can change is a real button with a name. On Spray the water
 * fills cell by cell, in the order the simulator placed the drops, so the
 * child sees it fall, spread, spill and rise. With reduced motion (or in a
 * hidden tab) the water is simply there.
 *
 * Build puzzles can be tried again; "who drinks first" and "joined tubes"
 * are one go.
 */

import * as F from '../../modules/fountainlogic.js';
import { ANIMAL_EMOJI, animal, drops, rowsUp, wt } from '../../modules/fountaintext.js';
import { calm } from '../../modules/celebrate.js';
import { paint, react } from '../../modules/shell.js';
import { IDEAS } from '../../modules/sciencetext.js';
import { esc, lang, say, t } from './frame.js';

/* ------------------------------------------------------------------ */
/* The bank and the chapters                                           */
/* ------------------------------------------------------------------ */

const banks = new Map();

async function bank(level) {
  if (!banks.has(level)) {
    banks.set(level, fetch(`data/science/fountain/${level}.json`, { cache: 'no-cache' }).then((res) => {
      if (!res.ok) throw new Error(`Could not load the ${level} fountains`);
      return res.json();
    }));
    banks.get(level).catch(() => banks.delete(level));
  }
  return banks.get(level);
}

const chapters = (level, L) => F.CHAPTERS[level].map((ch) => ({
  id: ch.id, icon: ch.icon, title: wt(`ch.${ch.id}`, L), idea: wt(`ch.${ch.id}.idea`, L)
}));
const levelOfChapter = (id) => (F.chapter(id) || {}).level || null;
const TILE_ICON = { build: '⛏️', first: '🥇', level: '🫙' };
const tileLabel = (p, L) => (p.teach ? { icon: '🎓', text: t('teach') } : { icon: TILE_ICON[p.kind], text: wt(`tile.${p.kind}`, L) });

/* ------------------------------------------------------------------ */
/* State                                                               */
/* ------------------------------------------------------------------ */

let play = null;
let timers = [];

function stop() {
  timers.forEach(clearTimeout);
  timers = [];
}

function draw(host, ctx) {
  stop();
  const p = ctx.puzzle;
  play = {
    host, ctx, p,
    dug: new Set(), open: new Set(), locked: new Set(),
    pick: null, water: [], shown: 0, cat: false,
    hint: 0, hints: 0, wrong: 0, done: false, running: false, msg: null
  };
  paintBoard();
}

const L0 = () => lang();
const isBuild = () => play.p.kind === 'build';

/* ------------------------------------------------------------------ */
/* Drawing                                                             */
/* ------------------------------------------------------------------ */

const S = 32;

function boardSvg() {
  const L = L0();
  const b = play.p.board;
  const groups = F.troughs(b);
  const groupOf = new Map();
  groups.forEach((g, k) => g.forEach((c) => groupOf.set(c, k)));
  const wet = new Set(play.water.slice(0, play.shown));
  const parts = [];
  for (let y = 0; y < b.h; y++) {
    for (let x = 0; x < b.w; x++) {
      const k = y * b.w + x;
      const c = b.cells[k];
      const X = x * S;
      const Y = y * S + S;          // one row of room for the elephant
      if (c === '#') parts.push(`<rect class="cz-fo-rock" x="${X}" y="${Y}" width="${S}" height="${S}"/>`);
      else if (c === 'd') {
        const dug = play.dug.has(k);
        parts.push(dug ? `<rect class="cz-fo-dug" x="${X + 2}" y="${Y + 2}" width="${S - 4}" height="${S - 4}" rx="4"/>`
          : `<rect class="cz-fo-dirt" x="${X}" y="${Y}" width="${S}" height="${S}"/><circle class="cz-fo-crumb" cx="${X + 9}" cy="${Y + 10}" r="2"/><circle class="cz-fo-crumb" cx="${X + 21}" cy="${Y + 18}" r="2"/><circle class="cz-fo-crumb" cx="${X + 12}" cy="${Y + 25}" r="1.6"/>`);
      } else if (c === 'g') {
        const open = play.open.has(k);
        parts.push(open ? `<path class="cz-fo-gate is-open" d="M${X + 3} ${Y + 3} L${X + 3} ${Y + S - 3}"/>`
          : `<rect class="cz-fo-gatebar" x="${X + 2}" y="${Y + 11}" width="${S - 4}" height="10" rx="3"/><path class="cz-fo-gate" d="M${X + 8} ${Y + 11} V${Y + 21} M${X + 16} ${Y + 11} V${Y + 21} M${X + 24} ${Y + 11} V${Y + 21}"/>`);
      } else if (c === 'T') parts.push(`<rect class="cz-fo-trough" x="${X}" y="${Y}" width="${S}" height="${S}"/>`);
      if (wet.has(k)) parts.push(`<rect class="cz-fo-water" x="${X}" y="${Y}" width="${S}" height="${S}"/><path class="cz-fo-wave" d="M${X + 4} ${Y + 10} q4 -3 8 0 t8 0 t8 0"/>`);
      if (c === 'c') parts.push(`<text x="${X + S / 2}" y="${Y + S / 2 + 1}" font-size="22" text-anchor="middle" dominant-baseline="central">${play.cat && play.shown >= play.water.length ? '🙀' : '🐈'}</text>`
        + (play.cat ? '' : `<text class="cz-fo-zz" x="${X + S - 4}" y="${Y + 8}" text-anchor="end">z</text>`));
    }
  }
  /* Each cup's animal, over its top cell. */
  groups.forEach((g, k) => {
    const top = g[0];
    const x = top % b.w;
    const y = Math.floor(top / b.w);
    const full = g.every((c) => wet.has(c));
    parts.push(`<text x="${x * S + S / 2}" y="${y * S + S - 6}" font-size="22" text-anchor="middle">${ANIMAL_EMOJI[k % 4]}</text>`);
    if (full) parts.push(`<text class="cz-fo-ok" x="${x * S + S / 2 + 14}" y="${y * S + S - 18}" text-anchor="middle">✓</text>`);
    if (play.p.kind !== 'build') parts.push(`<text class="cz-fo-letter" x="${x * S + S / 2 - 15}" y="${y * S + S - 18}" text-anchor="middle">${String.fromCharCode(65 + k)}</text>`);
  });
  /* Joined tubes: rows numbered up from the bottom of the tubes, on the rock
     at the left, so a height is something to count. */
  if (play.p.kind === 'level') {
    for (let y = 1; y <= play.p.bottom; y++) {
      parts.push(`<text class="cz-fo-rown" x="${S / 2}" y="${y * S + S / 2 + 5}" text-anchor="middle">${play.p.bottom - y + 1}</text>`);
    }
  }
  /* The elephant, its trunk over the column it pours into. */
  parts.push(`<text x="${b.src * S + S / 2 - 4}" y="${S / 2 + 2}" font-size="28" text-anchor="middle" dominant-baseline="central">🐘</text>`);
  parts.push(`<text class="cz-fo-drops" x="${b.src * S + S / 2 + 18}" y="${S / 2 - 4}">💧${b.drops - Math.min(play.shown, b.drops)}</text>`);
  /* Tap targets for every dirt cell and gate, on top. */
  if (isBuild() && !play.done) {
    b.cells.split('').forEach((c, k) => {
      if (c !== 'd' && c !== 'g') return;
      const x = k % b.w;
      const y = Math.floor(k / b.w);
      const what = c === 'd' ? wt(play.dug.has(k) ? 'dug' : 'dirt', L) : wt(play.open.has(k) ? 'gateOpen' : 'gateShut', L);
      parts.push(`<rect class="cz-fo-hit${play.locked.has(k) ? ' is-locked' : ''}" x="${x * S}" y="${y * S + S}" width="${S}" height="${S}" data-fo-cell="${k}"
        role="button" tabindex="0" aria-pressed="${c === 'd' ? play.dug.has(k) : play.open.has(k)}" aria-label="${esc(wt('cell', L, { what, r: y + 1, c: x + 1 }))}"/>`);
    });
  }
  return `<svg class="cz-fo-svg" viewBox="0 0 ${b.w * S} ${(b.h + 1) * S}" role="group" aria-label="${esc(askText(L))}">${parts.join('')}</svg>`;
}

/* ------------------------------------------------------------------ */
/* Questions                                                           */
/* ------------------------------------------------------------------ */

function askText(L) {
  const p = play.p;
  if (p.kind === 'build') return wt('ask.build', L);
  if (p.kind === 'first') return wt('ask.first', L, { nn: drops(p.board.drops, L) });
  return wt('ask.level', L, { nn: drops(p.board.drops, L), side: wt(p.pourLeft ? 'sideLeft' : 'sideRight', L) });
}

function optionsHtml(L) {
  const p = play.p;
  if (isBuild() || play.done) return '';
  const opts = F.choices(p)[0];
  const word = (v) => (p.kind === 'first' ? `${String.fromCharCode(65 + v)} · ${ANIMAL_EMOJI[v % 4]} ${animal(v, L, true)}` : rowsUp(p.opts[v], L));
  return `<div class="cz-sci-opts cz-fo-opts" role="group" aria-label="${esc(askText(L))}">
    ${opts.map((v) => `<button type="button" class="gp-btn cz-sci-opt${play.pick === v ? ' is-on' : ''}" aria-pressed="${play.pick === v}" data-fo-pick="${v}">${esc(word(v))}</button>`).join('')}
  </div>`;
}

/* ------------------------------------------------------------------ */
/* Painting                                                            */
/* ------------------------------------------------------------------ */

function paintBoard() {
  const L = L0();
  const p = play.p;
  const digsLeft = p.kind === 'build' ? p.digs - play.dug.size : 0;
  const info = isBuild() && !play.done ? `<p class="cz-fo-info">${esc(p.digs ? wt('digsLeft', L, { n: digsLeft }) : wt('noDigs', L))} · 💧 ${esc(drops(p.board.drops, L))}</p>` : '';
  const actions = play.done || play.running ? '' : `<div class="cz-sci-actions">
      <button type="button" class="gp-btn gp-btn--primary gp-btn--big cz-sci-go" data-action="fo-go">${esc(wt('go', L))}</button>
      ${canHint() ? `<button type="button" class="gp-btn gp-btn--ghost" data-action="fo-hint"><span aria-hidden="true">💡</span> ${esc(play.hint ? t('hintMore') : t('hint'))}</button>` : ''}
      ${isBuild() && (play.dug.size || play.open.size) ? `<button type="button" class="gp-btn gp-btn--ghost" data-action="fo-reset">${esc(wt('restart', L))}</button>` : ''}
    </div>`;
  const hintKey = { build: 'hintBuild', first: 'hintFirst', level: 'hintLevel' }[p.kind];
  play.host.innerHTML = `<div class="cz-fo" lang="${L}">
    <p class="cz-sci-ask">${esc(askText(L))}</p>
    ${info}
    <div class="cz-fo-scene">${boardSvg()}</div>
    ${optionsHtml(L)}
    ${play.hint ? `<p class="cz-sci-hint"><span aria-hidden="true">💡</span> ${esc(wt(play.hint > 1 && isBuild() ? 'hintPlace' : hintKey, L))}</p>` : ''}
    ${actions}
    <div class="cz-sci-msg" aria-live="polite">${play.msg ? play.msg(L) : ''}</div>
  </div>`;
  paint();
}

/* ------------------------------------------------------------------ */
/* Spraying                                                            */
/* ------------------------------------------------------------------ */

function go() {
  if (play.done || play.running) return;
  if (!isBuild() && play.pick === null) {
    play.msg = (L) => `<p class="cz-sci-say">${esc(wt('pickOne', L))}</p>`;
    paintBoard();
    return;
  }
  const res = F.run(play.p.board, play.dug, play.open);
  play.water = res.water;
  play.cat = res.cat;
  play.shown = 0;
  play.msg = null;
  play.running = true;
  const end = () => { play.shown = play.water.length; play.running = false; judge(res); };
  if (calm() || document.hidden) { end(); return; }
  const step = () => {
    if (!play || !play.running) return;
    play.shown += 1;
    paintBoard();
    if (play.shown >= play.water.length) { end(); return; }
    timers.push(setTimeout(step, 110));
  };
  timers.push(setTimeout(step, 80));
  /* A hidden tab runs no timers on time; finish anyway. */
  timers.push(setTimeout(() => { if (play && play.running) end(); }, play.water.length * 110 + 2500));
}

function judge(res) {
  const p = play.p;
  if (isBuild()) {
    if (F.success(p.board, res)) { finish(true); return; }
    play.wrong += 1;
    play.ctx.surprise(1);
    react('wow', 1600);
    const wet = new Set(res.water);
    const dry = F.troughs(p.board).findIndex((g) => !g.every((c) => wet.has(c)));
    play.msg = (L) => `<p class="cz-sci-surprise"><span class="cz-sci-surprise__icon" aria-hidden="true">🤯</span><span>
      <strong>${esc(res.cat ? wt('catWoke', L) : wt('notEnough', L, { It: animal(dry, L, true) }))}</strong>
      ${esc(`${wt('why.down', L)} ${wt('why.sideways', L)} ${wt('tryMore', L)}`)}</span></p>`;
    paintBoard();
    return;
  }
  const right = F.answers(p)[0];
  const ok = play.pick === right;
  play.wrong = ok ? 0 : 1;
  if (!ok) { play.ctx.surprise(1); react('wow', 1600); }
  finish(ok);
}

function finish(ok) {
  play.done = true;
  if (!play.wrong) react('happy', 1800);
  const p = play.p;
  const head = (L) => {
    if (isBuild()) return wt('allDrank', L);
    const r = F.answers(p)[0];
    const res = p.kind === 'first' ? wt('res.first', L, { It: animal(r, L, true) }) : wt('res.level', L, { rr: rowsUp(p.opts[r], L) });
    return ok ? wt('right', L, { res }) : wt('surprise', L, { res });
  };
  const why = (L) => (p.kind === 'level' ? `${wt('why.level', L)} ${wt('why.same', L)}`
    : p.kind === 'first' ? `${wt('why.first', L)} ${wt('why.bottom', L)}` : `${wt('why.down', L)} ${wt('why.sideways', L)} ${wt('why.bottom', L)}`);
  play.msg = (L) => `<p class="cz-sci-result ${isBuild() || ok ? 'is-right' : 'is-surprise'}">
    ${isBuild() || ok ? '' : '<span class="cz-sci-wow" aria-hidden="true">🤯</span>'}<strong>${esc(head(L))}</strong>
    <span class="cz-sci-rwhy">${esc(why(L))}</span></p>`;
  paintBoard();
  const chId = play.ctx.chapterId;
  play.ctx.onSolved({
    stars: F.starsFor({ wrong: play.wrong, hints: play.hints, teach: !!play.ctx.puzzle.teach }),
    why: (L) => {
      const out = [`${isBuild() || ok ? '' : '<span aria-hidden="true">🤯</span> '}<strong>${esc(head(L))}</strong> ${esc(why(L))}`];
      const idea = IDEAS.fountain.find((i) => i.ch === chId);
      if (idea) out.push(`<strong>${esc(idea[L])}</strong> ${esc(idea.why[L])}`);
      return out;
    }
  });
}

/* ------------------------------------------------------------------ */
/* Hints                                                               */
/* ------------------------------------------------------------------ */

const canHint = () => !play.done && !play.ctx.puzzle.teach && play.hint < (isBuild() ? 2 : 1);

function hint() {
  play.hint += 1;
  play.hints += 1;
  if (isBuild() && play.hint === 2) {
    /* Make one change the answer needs, and keep it. */
    const [sol] = F.solutions(play.p, 1);
    if (sol) {
      const needDig = sol.digs.find((k) => !play.dug.has(k));
      const needOpen = sol.open.find((k) => !play.open.has(k));
      const wrongOpen = [...play.open].find((k) => !sol.open.includes(k));
      if (needDig !== undefined) {
        /* Free a dig if the budget is used up by a wrong one. */
        if (play.dug.size >= play.p.digs) {
          const extra = [...play.dug].find((k) => !sol.digs.includes(k));
          if (extra !== undefined) play.dug.delete(extra);
        }
        play.dug.add(needDig);
        play.locked.add(needDig);
      } else if (needOpen !== undefined) { play.open.add(needOpen); play.locked.add(needOpen); }
      else if (wrongOpen !== undefined) { play.open.delete(wrongOpen); play.locked.add(wrongOpen); }
    }
  }
  play.water = [];
  play.shown = 0;
  paintBoard();
}

/* ------------------------------------------------------------------ */
/* Clicks, keys, reading aloud                                         */
/* ------------------------------------------------------------------ */

function tapCell(k) {
  if (play.done || play.running || play.locked.has(k)) return;
  const c = play.p.board.cells[k];
  play.water = [];
  play.shown = 0;
  play.cat = false;
  play.msg = null;
  if (c === 'd') {
    if (play.dug.has(k)) play.dug.delete(k);
    else if (play.dug.size < play.p.digs) play.dug.add(k);
    else play.msg = (L) => `<p class="cz-sci-say">${esc(wt('outOfDigs', L))}</p>`;
  } else if (c === 'g') {
    if (play.open.has(k)) play.open.delete(k); else play.open.add(k);
  }
  paintBoard();
  const el = play.host.querySelector(`[data-fo-cell="${k}"]`);
  if (el) el.focus();
}

function click(ev) {
  if (!play) return false;
  const cell = ev.target.closest('[data-fo-cell]');
  if (cell) { tapCell(Number(cell.dataset.foCell)); return true; }
  const pick = ev.target.closest('[data-fo-pick]');
  if (pick && !play.done) {
    const v = Number(pick.dataset.foPick);
    play.pick = play.pick === v ? null : v;
    play.msg = null;
    paintBoard();
    const el = play.host.querySelector(`[data-fo-pick="${v}"]`);
    if (el) el.focus();
    return true;
  }
  const action = ev.target.closest('[data-action]');
  if (!action) return false;
  switch (action.dataset.action) {
    case 'fo-go': go(); return true;
    case 'fo-hint': if (canHint()) hint(); return true;
    case 'fo-reset':
      play.dug = new Set([...play.dug].filter((k) => play.locked.has(k)));
      play.open = new Set([...play.open].filter((k) => play.locked.has(k)));
      play.water = [];
      play.shown = 0;
      play.cat = false;
      play.msg = null;
      paintBoard();
      return true;
    default: return false;
  }
}

function key(ev) {
  if (!play || play.done) return false;
  const cell = ev.target.closest && ev.target.closest('[data-fo-cell]');
  if (cell && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); tapCell(Number(cell.dataset.foCell)); return true; }
  return false;
}

function readAloud() {
  if (!play) return;
  say([askText(play.ctx.lang || lang())]);
}

const repaint = () => { if (play && !play.running) paintBoard(); };
const leave = () => stop();

/* ------------------------------------------------------------------ */
/* Today's experiment                                                  */
/* ------------------------------------------------------------------ */

/* Proving a water puzzle has one answer means running every dig and gate,
   which can take a moment on a slow tablet; today's experiment and endless
   practice come from the checked bank instead (daily.js picks one by date). */
function dailyPuzzle() { return null; }

export default {
  id: 'fountain', bank, chapters, levelOfChapter, tileLabel, draw, repaint, click, key,
  say: readAloud, dailyPuzzle, leave
};

