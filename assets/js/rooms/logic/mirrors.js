/**
 * rooms/logic/mirrors.js — Sunbeam Mirrors, drawn.
 *
 * One SVG board with the sun just outside it. In "turn" and "place" the beam
 * is drawn live: every tap moves it at once, so the child sees what each
 * mirror does. Stars count taps, so thinking before tapping pays. In "where"
 * the beam stays hidden until the child taps the animal it reaches (or a
 * hint draws it a mirror at a time).
 *
 * Turnable mirrors wear ↻, fixed ones a bolt; a sleeping animal wears 💤 and
 * an awake one ✓ and a ring of sun: shape and glyph, never colour alone.
 */

import * as M from '../../modules/mirrorslogic.js';
import * as P from '../../modules/logicprogress.js';
import { mt } from '../../modules/mirrorstext.js';
import { ANIMALS, theAnimal } from '../../modules/zooart.js';
import { hash, rngFor } from '../../modules/logicrng.js';
import { paint, react } from '../../modules/shell.js';
import { esc, lang, say, t } from './frame.js';

/* ------------------------------------------------------------------ */
/* The bank and the chapters                                           */
/* ------------------------------------------------------------------ */

const banks = new Map();

async function bank(level) {
  if (!banks.has(level)) {
    banks.set(level, fetch(`data/logic/mirrors/${level}.json`, { cache: 'no-cache' }).then((res) => {
      if (!res.ok) throw new Error(`Could not load the ${level} sunbeam boards`);
      return res.json();
    }));
    banks.get(level).catch(() => banks.delete(level));
  }
  return banks.get(level);
}

const chapters = (level, L) => M.CHAPTERS[level].map((ch) => ({
  id: ch.id, title: mt(`ch.${ch.id}`, L), idea: mt(`ch.${ch.id}.idea`, L)
}));
const levelOfChapter = (id) => (M.chapter(id) || {}).level || null;
const tileLabel = (p, L) => (p.teach ? { icon: '🎓', text: t('teach') } : { icon: '☀️', text: mt('tile.puzzle', L) });

/* ------------------------------------------------------------------ */
/* State                                                               */
/* ------------------------------------------------------------------ */

const CELL = 64;
const EDGE = 52;
let play = null;

const animalOf = (ch) => ANIMALS['abcdefghijkl'.indexOf(ch)];

function draw(host, ctx) {
  const p = ctx.puzzle;
  play = {
    host, ctx, p, mode: p.mode,
    cells: [...p.cells],                         // place: mirrors the child has put down
    turn: p.start ? [...p.start] : [],           // turn: each turnable mirror's slant now
    taps: 0, tries: 0, hints: 0, hint: 0, shownTo: 0, mark: -1, shown: false, done: false, msg: null, picked: -1,
    fewest: p.mode === 'where' ? 1 : M.fewestTaps(p)
  };
  paintBoard();
}

function leave() { play = null; }

/** The board as it stands: the child's mirrors in. */
const board = () => ({ ...play.p, cells: play.cells.join('') });
const beamNow = () => M.beam(board(), play.cells, play.turn);
const placedCount = () => play.cells.filter((x, i) => play.p.cells[i] === '.' && x !== '.').length;

/* ------------------------------------------------------------------ */
/* Drawing                                                             */
/* ------------------------------------------------------------------ */

const at = (i, L) => mt('at', L, { c: (i % play.p.n) + 1, r: Math.floor(i / play.p.n) + 1 });
const slantWord = (s, L) => mt(s === '/' ? 'slantSlash' : 'slantBack', L);
const DX = [0, 1, 0, -1];
const DY = [-1, 0, 1, 0];

/** The beam as a polyline from the sun, cell centre to cell centre. */
function beamPoints(res, upto = Infinity) {
  const { sun } = play.p;
  const mid = (r, c) => [c * CELL + CELL / 2, r * CELL + CELL / 2];
  const pts = [mid(sun[0], sun[1])];
  const path = res.path.slice(0, upto);
  path.forEach(([r, c]) => pts.push(mid(r, c)));
  if (path.length === res.path.length) {
    /* Out to the edge, or up to the rock's face. */
    const [x, y] = pts[pts.length - 1];
    const d = res.dir;
    const reach = res.end === 'rock' ? CELL / 2 - 6 : CELL / 2;
    pts.push([x + DX[d] * reach, y + DY[d] * reach]);
  }
  return pts.map(([x, y]) => `${x},${y}`).join(' ');
}

function mirrorLine(x, y, s) {
  return s === '/'
    ? `<line x1="${x + 10}" y1="${y + CELL - 10}" x2="${x + CELL - 10}" y2="${y + 10}"/>`
    : `<line x1="${x + 10}" y1="${y + 10}" x2="${x + CELL - 10}" y2="${y + CELL - 10}"/>`;
}

function boardSvg(L) {
  const { p } = play;
  const n = p.n;
  const W = n * CELL;
  const res = beamNow();
  const lit = play.mode === 'where' && !play.done ? new Set() : res.lit;
  const parts = [];
  let tIdx = 0;
  for (let i = 0; i < n * n; i++) {
    const r = Math.floor(i / n);
    const c = i % n;
    const x = c * CELL;
    const y = r * CELL;
    parts.push(`<rect class="cz-mr-cell" x="${x + 2}" y="${y + 2}" width="${CELL - 4}" height="${CELL - 4}" rx="7"/>`);
    const orig = p.cells[i];
    const cell = play.cells[i];
    if (orig === '#') {
      parts.push(`<g role="img" aria-label="${esc(mt('rockAt', L, { at: at(i, L) }))}"><text class="cz-mr-rock" x="${x + CELL / 2}" y="${y + CELL / 2 + 11}">🪨</text></g>`);
    } else if (M.isAnimal(orig)) {
      const a = animalOf(orig);
      const awake = lit.has(i);
      const tap = play.mode === 'where' && !play.done;
      parts.push(`<g class="cz-mr-animal${awake ? ' is-awake' : ''}${play.mark === i ? ' is-mark' : ''}${tap ? ' is-tap' : ''}" ${tap
        ? `data-mr-animal="${i}" role="button" tabindex="0"` : 'role="img"'}
        aria-label="${esc(mt('animalAt', L, { animal: theAnimal(a, L, true), at: at(i, L), state: mt(awake ? 'awake' : 'asleep', L) }))}">
        ${awake ? `<circle class="cz-mr-glow" cx="${x + CELL / 2}" cy="${y + CELL / 2}" r="${CELL / 2 - 6}"/>` : ''}
        ${play.mark === i ? `<circle class="cz-mr-markring" cx="${x + CELL / 2}" cy="${y + CELL / 2}" r="${CELL / 2 - 3}"/>` : ''}
        <text class="cz-mr-emoji" x="${x + CELL / 2}" y="${y + CELL / 2 + 11}">${a.emoji}</text>
        <text class="cz-mr-state" x="${x + CELL - 12}" y="${y + 18}">${awake ? '✓' : '💤'}</text>
      </g>`);
    } else if (orig === 'T') {
      const s = play.turn[tIdx];
      const k = tIdx;
      tIdx += 1;
      parts.push(`<g class="cz-mr-mirror is-turn${play.mark === i ? ' is-mark' : ''}" data-mr-turn="${k}" role="button" tabindex="${play.done ? -1 : 0}"
        aria-label="${esc(mt('mirrorTurn', L, { at: at(i, L), slant: slantWord(s, L) }))}">
        <rect class="cz-mr-hit" x="${x}" y="${y}" width="${CELL}" height="${CELL}"/>
        ${mirrorLine(x, y, s)}
        <text class="cz-mr-badge" x="${x + 13}" y="${y + CELL - 6}">↻</text>
      </g>`);
    } else if (orig === '/' || orig === '\\') {
      parts.push(`<g class="cz-mr-mirror is-fixed" role="img" aria-label="${esc(mt('mirrorFixed', L, { at: at(i, L), slant: slantWord(orig, L) }))}">
        ${mirrorLine(x, y, orig)}<text class="cz-mr-badge" x="${x + 13}" y="${y + CELL - 6}">🔩</text></g>`);
    } else if (play.mode === 'place' && !play.done) {
      const placed = cell !== '.';
      parts.push(`<g class="cz-mr-spot${placed ? ' is-placed' : ''}${play.mark === i ? ' is-mark' : ''}" data-mr-spot="${i}" role="button" tabindex="0"
        aria-label="${esc(placed ? mt('placed', L, { at: at(i, L), slant: slantWord(cell, L) }) : mt('emptySpot', L, { at: at(i, L) }))}">
        <rect class="cz-mr-hit" x="${x}" y="${y}" width="${CELL}" height="${CELL}"/>
        ${placed ? `<g class="cz-mr-mirror is-placed">${mirrorLine(x, y, cell)}</g>` : ''}
      </g>`);
    } else if (cell === '/' || cell === '\\') {
      parts.push(`<g class="cz-mr-mirror is-placed">${mirrorLine(x, y, cell)}</g>`);
    }
  }
  /* The beam: live in turn and place, a mirror at a time from hints in where. */
  let beamSvg = '';
  if (play.mode !== 'where' || play.done) beamSvg = `<polyline class="cz-mr-beam" points="${beamPoints(res)}"/>`;
  else if (play.shownTo > 0) beamSvg = `<polyline class="cz-mr-beam" points="${beamPoints(res, play.shownTo)}"/>`;
  const [sr, sc, sd] = p.sun;
  const sun = `<g role="img" aria-label="${esc(mt('sun', L, { dir: mt(`dir.${sd}`, L) }))}">
    <circle class="cz-mr-sun" cx="${sc * CELL + CELL / 2}" cy="${sr * CELL + CELL / 2}" r="22"/>
    <text class="cz-mr-sunface" x="${sc * CELL + CELL / 2}" y="${sr * CELL + CELL / 2 + 10}">☀️</text></g>`;
  return `<div class="cz-br-wrap"><svg class="cz-mr-svg" viewBox="${-EDGE} ${-EDGE} ${W + 2 * EDGE} ${W + 2 * EDGE}"
      role="group" aria-label="${esc(mt(`ask.${play.mode}`, L, { n: p.place || 0 }))}">
    <rect class="cz-mr-board" x="0" y="0" width="${W}" height="${W}" rx="12"/>
    ${parts.join('')}${beamSvg}${sun}
  </svg></div>`;
}

function paintBoard() {
  const L = lang();
  const { p } = play;
  const counter = play.mode === 'where' ? ''
    : `<p class="cz-jam-count"><strong>${esc(mt('taps', L, { n: play.taps }))}</strong> · ${esc(mt('fewest', L, { n: play.fewest }))}${play.mode === 'place'
      ? ` · ${esc(mt('left', L, { n: p.place - placedCount() }))}` : ''}</p>`;
  const actions = play.done ? '' : `<div class="cz-code-actions">
      ${play.mode === 'where' ? '' : `<button type="button" class="gp-btn gp-btn--ghost" data-action="mr-restart">${esc(t('clear'))}</button>`}
      <button type="button" class="gp-btn gp-btn--ghost" data-action="mr-hint"><span aria-hidden="true">🔎</span> ${esc(play.hints ? t('hintMore') : t('hint'))}</button>
      ${play.hints >= 2 && !play.shown ? `<button type="button" class="gp-btn gp-btn--ghost" data-action="mr-answer"><span aria-hidden="true">💡</span> ${esc(mt('answer', L))}</button>` : ''}
    </div>`;
  play.host.innerHTML = `<div class="cz-mr" lang="${L}">
    <p class="cz-code-ask">${esc(mt(`ask.${play.mode}`, L, { n: p.place || 0 }))}</p>
    <p class="cz-truth-rules"><span>${esc(mt('rules', L))}</span></p>
    ${play.done ? '' : `<p class="cz-rule-help">${esc(mt(`how.${play.mode}`, L))}</p>`}
    ${counter}
    ${boardSvg(L)}
    ${actions}
    <div class="cz-code-msg" aria-live="polite">${play.msg ? play.msg(L) : ''}</div>
  </div>`;
  paint();
}

/* ------------------------------------------------------------------ */
/* Playing                                                             */
/* ------------------------------------------------------------------ */

/* Solved: every animal awake, and in "place" with all the mirrors asked for. */
const solvedNow = () => M.wakesAll(board(), play.cells, play.turn)
  && (play.mode !== 'place' || placedCount() === play.p.place);

function afterChange() {
  play.mark = -1;
  if (solvedNow()) { win(); return; }
  play.msg = null;
  paintBoard();
}

function turnMirror(k) {
  play.taps += 1;
  play.turn[k] = play.turn[k] === '/' ? '\\' : '/';
  afterChange();
}

function placeAt(i) {
  const cur = play.cells[i];
  const next = cur === '.' ? '/' : cur === '/' ? '\\' : '.';
  if (cur === '.' && placedCount() >= play.p.place) {
    play.msg = (L) => `<p class="cz-code-say is-wrong">${esc(mt('tooMany', L, { n: play.p.place }))}</p>`;
    paintBoard();
    return;
  }
  play.taps += 1;
  play.cells[i] = next;
  afterChange();
}

function pickAnimal(i) {
  play.tries += 1;
  if (i === play.p.answer) { win(); return; }
  play.msg = (L) => `<p class="cz-code-say is-wrong">${esc(mt('wrongWhere', L))}</p>`;
  react('oops', 1400);
  paintBoard();
  /* The tapped animal was redrawn: give it the focus back. */
  refocus(`[data-mr-animal="${i}"]`);
}

function win() {
  play.done = true;
  const { p, mode } = play;
  const stars = M.starsFor(mode, { taps: play.taps, fewest: play.fewest, tries: play.tries, shown: play.shown });
  const taps = play.taps;
  play.msg = (L) => `<p class="cz-code-say is-right">✓ ${esc(mode === 'where'
    ? mt('rightWhere', L, { animal: theAnimal(animalOf(p.cells[p.answer]), L) }) : mt('right', L))}</p>`;
  paintBoard();
  react('happy', 2000);
  play.ctx.onSolved({
    stars,
    why: (L) => [
      ...(mode === 'where' ? [] : [esc(mt('why.taps', L, { n: play.fewest, t: taps }))]),
      esc(mt('why.mirror', L)),
      esc(mt(mode === 'where' ? 'why.follow' : 'why.backwards', L))
    ]
  });
}

/* ------------------------------------------------------------------ */
/* Hints and the answer                                                */
/* ------------------------------------------------------------------ */

/** The turnable mirrors' squares, in reading order. */
const turnCells = () => play.p.cells.split('').map((x, i) => (x === 'T' ? i : -1)).filter((i) => i >= 0);

function hint() {
  const { p } = play;
  play.hints += 1;
  play.hint += 1;
  if (play.mode === 'where') {
    if (play.hint === 1) {
      play.msg = (L) => `<p class="cz-code-hint">🔎 ${esc(mt('hint.where1', L))}</p>`;
    } else {
      /* Draw the beam on to the next mirror it meets. */
      const res = beamNow();
      let k = play.shownTo;
      while (k < res.path.length) {
        const [r, c] = res.path[k];
        k += 1;
        const cell = p.cells[r * p.n + c];
        if (cell === '/' || cell === '\\') break;
      }
      play.shownTo = k;
      play.msg = (L) => `<p class="cz-code-hint">💡 ${esc(mt('hint.where2', L))}</p>`;
    }
    paintBoard();
    return;
  }
  const solution = M.answerOf(p);
  if (play.mode === 'turn') {
    const cells = turnCells();
    /* The first wrong mirror the beam meets now, else the first wrong one. */
    const onBeam = beamNow().path.map(([r, c]) => r * p.n + c);
    const wrong = (k) => play.turn[k] !== solution[k];
    let k = onBeam.map((i) => cells.indexOf(i)).find((x) => x >= 0 && wrong(x));
    if (k === undefined) k = cells.findIndex((_, x) => wrong(x));
    if (play.hint === 1 || k < 0) {
      play.msg = (L) => `<p class="cz-code-hint">🔎 ${esc(mt('hint.turn1', L))}</p>`;
    } else if (play.hint === 2) {
      play.mark = cells[k];
      play.msg = (L) => `<p class="cz-code-hint">💡 ${esc(mt('hint.turn2', L))}</p>`;
    } else {
      play.turn[k] = solution[k];
      play.msg = (L) => `<p class="cz-code-hint">✋ ${esc(mt('hint.turn3', L))}</p>`;
      if (solvedNow()) { win(); return; }
      play.mark = -1;
    }
    paintBoard();
    return;
  }
  /* place: a square where a mirror goes, then put it there. */
  const need = [...solution].map((x, i) => (p.cells[i] === '.' && x !== '.' && play.cells[i] !== x ? i : -1)).filter((i) => i >= 0);
  if (play.hint === 1 || !need.length) {
    play.msg = (L) => `<p class="cz-code-hint">🔎 ${esc(mt('hint.place1', L))}</p>`;
  } else if (play.hint === 2) {
    play.mark = need[0];
    play.msg = (L) => `<p class="cz-code-hint">💡 ${esc(mt('hint.place2', L))}</p>`;
  } else {
    /* Take away a wrong mirror if the count is full, then place the right one. */
    if (placedCount() >= p.place) {
      const bad = play.cells.findIndex((x, i) => p.cells[i] === '.' && x !== '.' && x !== solution[i]);
      if (bad >= 0) play.cells[bad] = '.';
    }
    play.cells[need[0]] = solution[need[0]];
    play.mark = -1;
    play.msg = (L) => `<p class="cz-code-hint">✋ ${esc(mt('hint.place3', L))}</p>`;
    if (solvedNow()) { win(); return; }
  }
  paintBoard();
}

function showAnswer() {
  const { p } = play;
  play.shown = true;
  if (play.mode === 'where') {
    play.shownTo = beamNow().path.length;
    play.mark = p.answer;
    play.msg = (L) => `<p class="cz-code-hint">💡 ${esc(mt('answerShown', L))}</p>`;
    paintBoard();
    return;
  }
  const solution = M.answerOf(p);
  if (play.mode === 'turn') play.turn = [...solution];
  else play.cells = [...solution];
  win();
}

function restart() {
  play.cells = [...play.p.cells];
  play.turn = play.p.start ? [...play.p.start] : [];
  play.mark = -1;
  play.msg = null;
  paintBoard();
}

/* ------------------------------------------------------------------ */
/* Clicks, keys, reading aloud                                         */
/* ------------------------------------------------------------------ */

function refocus(sel) {
  const el = play && play.host.querySelector(sel);
  if (el) el.focus({ preventScroll: true });
}

function click(ev) {
  if (!play || play.done) return false;
  const q = (s) => ev.target.closest(s);
  let el;
  if ((el = q('[data-mr-turn]'))) { const k = el.dataset.mrTurn; turnMirror(Number(k)); refocus(`[data-mr-turn="${k}"]`); return true; }
  if ((el = q('[data-mr-spot]'))) { const i = el.dataset.mrSpot; placeAt(Number(i)); refocus(`[data-mr-spot="${i}"]`); return true; }
  if ((el = q('[data-mr-animal]'))) { pickAnimal(Number(el.dataset.mrAnimal)); return true; }
  if ((el = q('[data-action]'))) {
    switch (el.dataset.action) {
      case 'mr-hint': hint(); return true;
      case 'mr-answer': showAnswer(); return true;
      case 'mr-restart': restart(); return true;
      default: return false;
    }
  }
  return false;
}

function key(ev) {
  if (!play || play.done) return false;
  const el = ev.target.closest && ev.target.closest('[data-mr-turn], [data-mr-spot], [data-mr-animal]');
  if (el && (ev.key === 'Enter' || ev.key === ' ')) {
    ev.preventDefault();
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }
  return false;
}

function readAloud() {
  if (!play) return;
  const L = lang();
  const { p } = play;
  const parts = [mt(`ask.${play.mode}`, L, { n: p.place || 0 }), mt('rules', L), mt('sun', L, { dir: mt(`dir.${p.sun[2]}`, L) })];
  let tIdx = 0;
  [...p.cells].forEach((cell, i) => {
    if (cell === '#') parts.push(mt('rockAt', L, { at: at(i, L) }));
    else if (M.isAnimal(cell)) parts.push(mt('animalAt', L, { animal: theAnimal(animalOf(cell), L, true), at: at(i, L), state: mt('asleep', L) }));
    else if (cell === 'T') parts.push(mt('mirrorTurn', L, { at: at(i, L), slant: slantWord(play.turn[tIdx++], L) }));
    else if (cell === '/' || cell === '\\') parts.push(mt('mirrorFixed', L, { at: at(i, L), slant: slantWord(cell, L) }));
  });
  say(parts);
}

const repaint = () => { if (play) paintBoard(); };

/* ------------------------------------------------------------------ */
/* Your sunny pens, and today's puzzle                                 */
/* ------------------------------------------------------------------ */

const PEN_EMOJI = ['🌄', '🪞', '🦒', '🪨', '✨', '🔩', '🌞', '📍', '👑'];

function extras({ bank: b, level, rec, lang: L }) {
  const at0 = M.LEVELS.indexOf(level) * 3;
  const cards = b.chapters.map((ch, i) => {
    const ids = ch.puzzles.map((p) => p.id);
    const { solved } = P.tally(rec, 'mirrors', ids);
    return `<li class="cz-code-pen${solved ? ' is-home' : ''}">
      <span class="cz-code-pen__pic" aria-hidden="true">${PEN_EMOJI[at0 + i]}</span>
      <span class="cz-code-pen__text"><strong>${esc(mt(`ch.${ch.id}`, L))}</strong>
        <span>${esc(mt('pens.count', L, { n: solved, t: ids.length }))}</span></span>
    </li>`;
  }).join('');
  return `<section class="cz-code-zoo" aria-labelledby="cz-mr-pens-h">
    <h2 class="cz-logic-h2" id="cz-mr-pens-h">☀️ ${esc(mt('pens.title', L))}</h2>
    <p class="gp-muted">${esc(mt('pens.lede', L))}</p>
    <ul class="cz-code-pens">${cards}</ul>
  </section>`;
}

/* Today's board is made fresh, from any chapter of the level. */
function dailyPuzzle(level, iso) {
  const list = M.CHAPTERS[level];
  const def = list[hash('mirrors-daily', level, iso) % list.length];
  const p = M.makePuzzle(M.chapter(def.id), rngFor('mirrors', 'daily', level, iso));
  return p ? { puzzle: { id: `daily-${iso}`, ...p }, chapterId: def.id } : null;
}

export default {
  id: 'mirrors', bank, chapters, levelOfChapter, tileLabel, draw, repaint, click, key,
  say: readAloud, extras, dailyPuzzle, leave
};
