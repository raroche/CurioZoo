/**
 * rooms/logic/trains.js — Train Tracks, drawn.
 *
 * One SVG railway. Lanes run left to right; a switch is a crossover drawn as
 * a curve, and the way it points is shown four ways: a lever handle tilted
 * toward the live branch, the live branch drawn solid, the dead one dashed
 * and thin, and the words in its label. A flip switch is round with ↻.
 * Trains are their animal, and they ride to the animal's house: matching is
 * by picture, never by colour.
 *
 * Watching the trains run is the reward, so GO animates them along the track
 * one at a time. With reduced motion there is no ride: each train's route is
 * drawn at once and the results appear together.
 *
 * The siding chapter is a different picture: cars, a dead-end siding and the
 * zoo gate, with two buttons.
 */

import * as T from '../../modules/trainslogic.js';
import * as P from '../../modules/logicprogress.js';
import { houseName, tr, trainName } from '../../modules/trainstext.js';
import { animalById } from '../../modules/zooart.js';
import { hash, rngFor } from '../../modules/logicrng.js';
import { calm } from '../../modules/celebrate.js';
import { paint, react } from '../../modules/shell.js';
import { esc, lang, say, t } from './frame.js';

/* ------------------------------------------------------------------ */
/* The bank and the chapters                                           */
/* ------------------------------------------------------------------ */

const banks = new Map();

async function bank(level) {
  if (!banks.has(level)) {
    banks.set(level, fetch(`data/logic/trains/${level}.json`, { cache: 'no-cache' }).then((res) => {
      if (!res.ok) throw new Error(`Could not load the ${level} railway puzzles`);
      return res.json();
    }));
    banks.get(level).catch(() => banks.delete(level));
  }
  return banks.get(level);
}

const chapters = (level, L) => T.CHAPTERS[level].map((ch) => ({
  id: ch.id, title: tr(`ch.${ch.id}`, L), idea: tr(`ch.${ch.id}.idea`, L)
}));
const levelOfChapter = (id) => (T.chapter(id) || {}).level || null;
const tileLabel = (p, L) => (p.teach ? { icon: '🎓', text: t('teach') } : { icon: p.mode === 'siding' ? '🚃' : '🚂', text: tr('tile.puzzle', L) });

/* ------------------------------------------------------------------ */
/* Geometry                                                            */
/* ------------------------------------------------------------------ */

const COL = 120;
const LANE = 86;
const X0 = 110;
const laneY = (i) => 46 + i * LANE;
const colX = (c) => X0 + c * COL;

let play = null;
let timer = null;
let frame = 0;

/* Stop a ride in progress: its frames and pauses belong to a puzzle that is
   no longer on screen. */
function stopRide() {
  clearTimeout(timer);
  cancelAnimationFrame(frame);
  timer = null;
  frame = 0;
}

/** The child left the puzzle. */
function leave() {
  stopRide();
  play = null;
}

const animalOfLane = (i) => animalById(play.p.stations[i]);
/* A train carries the animal of the house it must reach. A "where will it
   stop?" train carries no one: its animal would give the answer away. */
const NO_ONE = { id: 'train', emoji: '🚂' };
const trainAnimal = (ti) => (play.mode === 'predict' ? NO_ONE : animalOfLane(play.p.trains[ti].to));

/* "up" / "hacia arriba": where a switch points, for a hint's sentence. */
function dirWord(k, v, L) {
  const [, src, dst] = play.p.lay.x[k];
  return tr(!v ? 'dir.straight' : dst < src ? 'dir.up' : 'dir.down', L);
}

function stateWord(k, v, L) {
  const [, src, dst] = play.p.lay.x[k];
  if (!v) return tr('straight', L);
  return tr(dst < src ? 'turnUp' : 'turnDown', L);
}

/* ------------------------------------------------------------------ */
/* State                                                               */
/* ------------------------------------------------------------------ */

function draw(host, ctx) {
  stopRide();
  const p = ctx.puzzle;
  play = {
    host, ctx, p, mode: p.mode, hints: 0, hint: null, runs: 0, msg: null, done: false, busy: false,
    state: p.start ? p.start.slice() : null,
    result: null, routes: null, mover: null,
    sent: 0, pulls: 0,
    order: [],
    siding: p.mode === 'siding' ? { incoming: p.cars.slice(), stack: [], out: [], wrong: 0, undo: [] } : null
  };
  paintBoard();
}

/* ------------------------------------------------------------------ */
/* Drawing the railway                                                 */
/* ------------------------------------------------------------------ */

function railway(L) {
  const { p } = play;
  const lay = p.lay;
  const W = colX(lay.cols) + 150;
  const H = laneY(lay.lanes - 1) + 46;
  const parts = [];
  const at = new Map(lay.x.map(([c, src], k) => [`${c}:${src}`, k]));
  /* Plain track: lead-in, every column, lead-out. */
  for (let i = 0; i < lay.lanes; i++) {
    parts.push(`<path class="cz-tr-rail" d="M 40 ${laneY(i)} H ${colX(0)}"/>`);
    for (let c = 0; c < lay.cols; c++) {
      const k = at.get(`${c}:${i}`);
      const off = k !== undefined && play.state[k] === 1 ? ' is-off' : '';
      parts.push(`<path class="cz-tr-rail${off}" d="M ${colX(c)} ${laneY(i)} H ${colX(c + 1)}"/>`);
    }
    parts.push(`<path class="cz-tr-rail" d="M ${colX(lay.cols)} ${laneY(i)} H ${colX(lay.cols) + 24}"/>`);
  }
  /* Crossovers and their switches. */
  const switches = lay.x.map(([c, src, dst, kind], k) => {
    const x = colX(c);
    const y1 = laneY(src);
    const y2 = laneY(dst);
    const on = play.state[k] === 1;
    const mid = x + COL / 2;
    parts.push(`<path class="cz-tr-rail cz-tr-branch${on ? '' : ' is-off'}" d="M ${x} ${y1} C ${mid} ${y1} ${mid} ${y2} ${x + COL} ${y2}"/>`);
    const hx = on ? 22 : 26;
    const hy = on ? (dst > src ? 15 : -15) : 0;
    const hl = play.hint && play.hint.k === k && play.hint.level >= 1 ? ' is-hint' : '';
    const tap = ['set', 'pulls'].includes(play.mode) && !play.done && !play.busy;
    const label = tr(kind === 'flip' ? 'switchFlip' : 'switchLabel', L, { n: k + 1, state: stateWord(k, play.state[k], L) });
    return `<g class="cz-tr-switch is-${kind}${on ? ' is-on' : ''}${hl}" ${tap
      ? `data-tr-switch="${k}" role="button" tabindex="0"` : 'role="img"'} aria-label="${esc(label)}">
      <circle class="cz-tr-hub" cx="${x + 4}" cy="${y1}" r="${kind === 'flip' ? 17 : 15}"/>
      <line class="cz-tr-lever" x1="${x + 4}" y1="${y1}" x2="${x + 4 + hx}" y2="${y1 + hy}"/>
      ${kind === 'flip' ? `<text class="cz-tr-flip" x="${x + 4}" y="${y1 + 5}">↻</text>` : ''}
      <text class="cz-tr-num" x="${x - 14}" y="${y1 - 18}">${k + 1}</text>
    </g>`;
  }).join('');
  /* Houses on the right. */
  const houses = Array.from({ length: lay.lanes }, (_, i) => {
    const a = animalOfLane(i);
    const res = play.result && play.result.arrived[i];
    return `<g class="cz-tr-house${res ? ` is-${res}` : ''}" role="img" aria-label="${esc(houseName(a, L, true))}">
      <rect x="${colX(lay.cols) + 24}" y="${laneY(i) - 28}" width="110" height="56" rx="10"/>
      <text class="cz-tr-emoji" x="${colX(lay.cols) + 52}" y="${laneY(i) + 10}">${a.emoji}</text>
      <text class="cz-tr-roof" x="${colX(lay.cols) + 82}" y="${laneY(i) + 8}">🏠</text>
      ${res ? `<text class="cz-tr-mark" x="${colX(lay.cols) + 118}" y="${laneY(i) - 10}">${res === 'ok' ? '✓' : '?'}</text>` : ''}
    </g>`;
  }).join('');
  /* Trains waiting at their depots (not in "order", which has its own queue). */
  const depots = play.mode === 'order' ? [`<text class="cz-tr-emoji" x="22" y="${laneY(0) + 8}">🚂</text>`]
    : p.trains.map((tn, ti) => (ti < play.sent && play.mode === 'pulls') ? '' : `<g class="cz-tr-depot">
        <text class="cz-tr-emoji" x="22" y="${laneY(tn.from) + 8}">${trainAnimal(ti).emoji}</text>
        ${p.trains.length > 1 ? `<text class="cz-tr-qn" x="10" y="${laneY(tn.from) - 16}">${ti + 1}</text>` : ''}
      </g>`);
  const routes = (play.routes || []).map((d, i) => `<path class="cz-tr-route cz-tr-route--${i % 4}" d="${d}"/>`).join('');
  const mover = play.mover ? `<text class="cz-tr-emoji cz-tr-mover" x="${play.mover.x}" y="${play.mover.y + 8}">${play.mover.e}</text>` : '';
  return `<div class="cz-br-wrap"><svg class="cz-tr-svg" viewBox="0 0 ${W} ${H}" data-style="min-width:${Math.round(W * 0.62)}px">
    <rect class="cz-tr-ground" x="0" y="0" width="${W}" height="${H}" rx="14"/>
    ${parts.join('')}${routes}${switches}${houses}${depots.join('')}${mover}
  </svg></div>`;
}

/** The ride of one train, as an SVG path. */
function routeD(run, from) {
  let d = `M 40 ${laneY(from)} H ${colX(0)}`;
  for (const [c, l, k, went] of run.path) {
    if (k >= 0 && went) {
      const dst = play.p.lay.x[k][2];
      const x = colX(c);
      d += ` C ${x + COL / 2} ${laneY(l)} ${x + COL / 2} ${laneY(dst)} ${x + COL} ${laneY(dst)}`;
    } else d += ` H ${colX(c + 1)}`;
  }
  return `${d} H ${colX(play.p.lay.cols) + 40}`;
}

/* ------------------------------------------------------------------ */
/* Drawing each mode                                                   */
/* ------------------------------------------------------------------ */

function controls(L) {
  if (play.done || play.busy) return '';
  const hintBtn = `<button type="button" class="gp-btn gp-btn--ghost" data-action="tr-hint"><span aria-hidden="true">🔎</span> ${esc(play.hint ? t('hintMore') : t('hint'))}</button>`;
  switch (play.mode) {
    case 'predict': {
      const houses = Array.from({ length: play.p.lay.lanes }, (_, i) => {
        const a = animalOfLane(i);
        return `<button type="button" class="gp-btn gp-btn--ghost cz-tr-pick" data-tr-house="${i}">${a.emoji} ${esc(houseName(a, L, true))}</button>`;
      }).join('');
      return `<div class="cz-tr-picks">${houses}</div><div class="cz-code-actions">${hintBtn}</div>`;
    }
    case 'set':
      return `<div class="cz-code-actions">
        <button type="button" class="gp-btn gp-btn--primary gp-btn--big" data-action="tr-go">🚂 ${esc(tr('go', L))}</button>
        <button type="button" class="gp-btn gp-btn--ghost" data-action="tr-reset">${esc(tr('reset', L))}</button>${hintBtn}</div>`;
    case 'pulls': {
      const next = play.p.trains[play.sent];
      return `<p class="cz-tr-pulls"><strong>${esc(tr('pullsCount', L, { n: play.pulls }))}</strong> · ${esc(tr('pullsPar', L, { n: play.p.par }))}</p>
        <div class="cz-code-actions">
          <button type="button" class="gp-btn gp-btn--primary gp-btn--big" data-action="tr-send">${next ? trainAnimal(play.sent).emoji : ''} ${esc(tr('sendNext', L))}</button>${hintBtn}</div>`;
    }
    case 'order': {
      const n = play.p.trains.length;
      const chips = play.p.trains.map((_, ti) => ti).filter((ti) => !play.order.includes(ti)).map((ti) =>
        `<button type="button" class="gp-pill cz-tr-chip" data-tr-order="${ti}">${trainAnimal(ti).emoji} ${esc(trainName(trainAnimal(ti), L))}</button>`).join('');
      const slots = Array.from({ length: n }, (_, i) => {
        const ti = play.order[i];
        return `<li>${ti === undefined ? '<span class="cz-tr-slot">?</span>'
          : `<button type="button" class="cz-tr-slot is-full" data-tr-unorder="${i}" aria-label="${i + 1}: ${esc(trainName(trainAnimal(ti), L))}">${trainAnimal(ti).emoji}</button>`}</li>`;
      }).join('');
      return `<p class="cz-rule-help">${esc(tr('orderPick', L))}</p>
        <ol class="cz-tr-order" aria-label="${esc(tr('order', L))}">${slots}</ol>
        <div class="cz-tr-chips">${chips}</div>
        <div class="cz-code-actions">
          <button type="button" class="gp-btn gp-btn--primary gp-btn--big" data-action="tr-go">🚂 ${esc(tr('go', L))}</button>
          <button type="button" class="gp-btn gp-btn--ghost" data-action="tr-clearorder">${esc(tr('clearOrder', L))}</button>${hintBtn}</div>`;
    }
    default: return '';
  }
}

function sidingHtml(L) {
  const s = play.siding;
  const car = (n) => {
    const a = animalById(play.p.animals[n - 1]);
    return `<span class="cz-tr-car" role="img" aria-label="${esc(L === 'es' ? a.es.n : a.en)}">${a.emoji}<small>${n}</small></span>`;
  };
  const want = play.p.animals.map((_, i) => car(i + 1)).join('');
  const hl = (b) => (play.hint && play.hint.btn === b && play.hint.level >= 1 ? ' is-hint' : '');
  return `<p class="cz-rule-help">${esc(tr('wants', L))}</p><div class="cz-tr-want">${want}</div>
    <div class="cz-tr-yard">
      <section><h3>${esc(tr('incoming', L))}</h3><div class="cz-tr-row">${s.incoming.length ? s.incoming.map(car).join('') : `<em>${esc(tr('noneLeft', L))}</em>`}</div></section>
      <section class="cz-tr-sidingbox"><h3>${esc(tr('siding', L))}</h3><div class="cz-tr-stack">${s.stack.length ? s.stack.slice().reverse().map(car).join('') : `<em>${esc(tr('sidingEmpty', L))}</em>`}</div></section>
      <section><h3>${esc(tr('zoo', L))}</h3><div class="cz-tr-row">${s.out.map(car).join('')}</div></section>
    </div>
    ${play.done ? '' : `<div class="cz-code-actions">
      <button type="button" class="gp-btn gp-btn--primary gp-btn--big${hl('in')}" data-action="tr-in" ${s.incoming.length ? '' : 'disabled'}>⤵ ${esc(tr('pushIn', L))}</button>
      <button type="button" class="gp-btn gp-btn--primary gp-btn--big${hl('out')}" data-action="tr-out" ${s.stack.length ? '' : 'disabled'}>⤴ ${esc(tr('popOut', L))}</button>
      <button type="button" class="gp-btn gp-btn--ghost" data-action="tr-undo" ${s.undo.length ? '' : 'disabled'}>↶ ${esc(tr('undo', L))}</button>
      <button type="button" class="gp-btn gp-btn--ghost" data-action="tr-hint"><span aria-hidden="true">🔎</span> ${esc(play.hint ? t('hintMore') : t('hint'))}</button>
    </div>`}`;
}

function paintBoard() {
  const L = lang();
  const flips = play.p.lay && play.p.lay.x.some((x) => x[3] === 'flip');
  const help = play.mode === 'siding' ? '' : `<p class="cz-rule-help">${esc(tr('howLever', L))}${flips ? ` ${esc(tr('howFlip', L))}` : ''}</p>`;
  const board = play.mode === 'siding' ? sidingHtml(L) : `${railway(L)}${controls(L)}`;
  play.host.innerHTML = `<div class="cz-tr" lang="${L}">
    <p class="cz-code-ask">${esc(tr(`ask.${play.mode}`, L))}</p>${help}${board}
    <div class="cz-code-msg" aria-live="polite">${play.msg ? play.msg(L) : ''}</div>
  </div>`;
  paint();
}

/* ------------------------------------------------------------------ */
/* Running trains, with or without the ride                            */
/* ------------------------------------------------------------------ */

/**
 * Run `queue` (train indices) from the current switches. Animates each ride
 * in turn unless motion is off, then calls `done(runs)`.
 */
function ride(queue, done) {
  const starts = queue.map((ti) => play.p.trains[ti].from);
  const before = play.state.slice();
  const runs = T.runAll(play.p.lay, starts, before);
  const ds = runs.map((r, i) => routeD(r, starts[i]));
  if (calm()) {
    play.routes = ds;
    done(runs);
    return;
  }
  play.busy = true;
  play.routes = [];
  const svgPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  let i = 0;
  /* Every frame and pause checks it still belongs to the puzzle on screen. */
  const mine = play;
  const next = () => {
    timer = null;
    if (play !== mine) return;
    if (i >= ds.length) { play.mover = null; play.busy = false; done(runs); return; }
    svgPath.setAttribute('d', ds[i]);
    const len = svgPath.getTotalLength();
    const ms = 260 * (play.p.lay.cols + 2);
    const start = performance.now();
    const emoji = trainAnimal(queue[i]).emoji;
    /* Draw the board once with the train on it, then only move the train. */
    const p0 = svgPath.getPointAtLength(0);
    play.mover = { x: p0.x - 12, y: p0.y, e: emoji };
    paintBoard();
    const el = play.host.querySelector('.cz-tr-mover');
    const step = (now) => {
      frame = 0;
      if (play !== mine) return;
      const f = Math.min(1, (now - start) / ms);
      const pt = svgPath.getPointAtLength(len * f);
      if (el) { el.setAttribute('x', pt.x - 12); el.setAttribute('y', pt.y + 8); }
      if (f < 1) frame = requestAnimationFrame(step);
      else { play.routes.push(ds[i]); i += 1; timer = setTimeout(next, 120); }
    };
    frame = requestAnimationFrame(step);
  };
  next();
}

function showResults(queue, runs) {
  const arrived = {};
  runs.forEach((r, i) => {
    const ok = r.to === play.p.trains[queue[i]].to;
    if (!arrived[r.to] || !ok) arrived[r.to] = ok ? 'ok' : 'bad';
  });
  play.result = { arrived };
}

function goSet() {
  if (play.busy) return;
  play.runs += 1;
  play.hint = null;
  const queue = play.p.trains.map((_, i) => i);
  const mine = play.state.slice();
  ride(queue, (runs) => {
    showResults(queue, runs);
    const bad = runs.findIndex((r, i) => r.to !== play.p.trains[i].to);
    if (bad < 0) { win(); return; }
    play.state = mine;
    const flips = play.p.lay.x.some((x) => x[3] === 'flip');
    play.msg = (L) => `<p class="cz-code-say is-wrong">${esc(tr('wrongHouse', L, {
      T: trainName(trainAnimal(bad), L, true), H: houseName(animalOfLane(runs[bad].to), L) }))} ${esc(tr('tryAgain', L))}${flips ? ` ${esc(tr('flipBack', L))}` : ''}</p>`;
    react('oops', 1500);
    paintBoard();
  });
}

function goOrder() {
  if (play.busy) return;
  if (play.order.length < play.p.trains.length) {
    play.msg = (L) => `<p class="cz-code-say is-wrong">${esc(tr('orderFill', L))}</p>`;
    paintBoard();
    return;
  }
  play.runs += 1;
  const queue = play.order.slice();
  const mine = play.state.slice();
  ride(queue, (runs) => {
    showResults(queue, runs);
    const bad = runs.findIndex((r, i) => r.to !== play.p.trains[queue[i]].to);
    if (bad < 0) { win(); return; }
    play.state = mine;
    play.msg = (L) => `<p class="cz-code-say is-wrong">${esc(tr('wrongHouse', L, {
      T: trainName(trainAnimal(queue[bad]), L, true), H: houseName(animalOfLane(runs[bad].to), L) }))} ${esc(tr('tryAgain', L))}</p>`;
    react('oops', 1500);
    paintBoard();
  });
}

function sendNext() {
  if (play.busy) return;
  const ti = play.sent;
  ride([ti], (runs) => {
    const r = runs[0];
    /* The ride changed nothing (levers only), so the switches stay. */
    if (r.to !== play.p.trains[ti].to) {
      play.runs += 1;
      play.sent = 0;
      play.pulls = 0;
      play.state = play.p.start.slice();
      play.routes = null;
      play.result = null;
      play.msg = (L) => `<p class="cz-code-say is-wrong">${esc(tr('wrongHouse', L, {
        T: trainName(trainAnimal(ti), L, true), H: houseName(animalOfLane(r.to), L) }))} ${esc(tr('pullsReset', L))}</p>`;
      react('oops', 1500);
      paintBoard();
      return;
    }
    play.sent += 1;
    play.result = { arrived: { ...(play.result ? play.result.arrived : {}), [r.to]: 'ok' } };
    if (play.sent >= play.p.trains.length) { win(); return; }
    play.msg = (L) => `<p class="cz-code-say is-right">✓ ${esc(tr('arrived', L, {
      T: trainName(trainAnimal(ti), L, true), H: houseName(animalOfLane(r.to), L) }))}</p>`;
    paintBoard();
  });
}

function predict(i) {
  if (play.busy) return;
  const run = T.runAll(play.p.lay, [play.p.trains[0].from], play.state)[0];
  /* Every answer counts, the right one too: 1 is "right first time". */
  play.runs += 1;
  if (i !== run.to) {
    play.msg = (L) => `<p class="cz-code-say is-wrong">${esc(tr('predictWrong', L))}</p>`;
    react('oops', 1500);
    paintBoard();
    return;
  }
  play.msg = null;
  play.stop = run.to;
  ride([0], (runs) => {
    showResults([0], runs);
    win();
  });
}

function win() {
  play.done = true;
  play.busy = false;
  const { mode } = play;
  const flips = play.p.lay && play.p.lay.x.some((x) => x[3] === 'flip');
  const teach = play.ctx.puzzle.teach;
  const stars = T.starsFor(mode, {
    hints: teach ? 0 : play.hints, runs: play.runs, pulls: play.pulls, par: play.p.par,
    wrong: play.siding ? play.siding.wrong : 0
  });
  const pulls = play.pulls;
  const stop = play.stop;
  play.msg = (L) => `<p class="cz-code-say is-right">✓ ${esc(mode === 'predict'
    ? tr('predictRight', L, { H: houseName(animalOfLane(stop), L) })
    : tr('right', L))}</p>`;
  paintBoard();
  react('happy', 2000);
  play.ctx.onSolved({
    stars,
    why: (L) => {
      if (mode === 'siding') return [esc(tr('whySiding', L))];
      if (mode === 'predict') return [esc(tr('whyPredict', L))];
      if (mode === 'pulls') return [esc(tr('whyPulls', L, { n: pulls, par: play.p.par }))];
      if (mode === 'order') return [esc(tr('whyOrder', L))];
      return [esc(tr('whySet', L)), ...(flips ? [esc(tr('whyFlip', L))] : [])];
    }
  });
}

/* ------------------------------------------------------------------ */
/* The siding                                                          */
/* ------------------------------------------------------------------ */

function sidingMove(m) {
  const s = play.siding;
  const want = s.out.length + 1;
  if (m === 'in') {
    if (!s.incoming.length) return;
    s.undo.push(JSON.stringify([s.incoming, s.stack, s.out]));
    s.stack.push(s.incoming.shift());
  } else {
    if (!s.stack.length) return;
    const top = s.stack[s.stack.length - 1];
    if (top !== want) {
      s.wrong += 1;
      const A = animalById(play.p.animals[want - 1]);
      const B = animalById(play.p.animals[top - 1]);
      play.msg = (L) => `<p class="cz-code-say is-wrong">${esc(tr('sidingWrong', L, {
        A: L === 'es' ? `${A.es.art} ${A.es.n}` : `the ${A.en}`, B: L === 'es' ? `${B.es.art === 'la' ? 'La' : 'El'} ${B.es.n}` : `The ${B.en}` }))}</p>`;
      react('oops', 1400);
      paintBoard();
      return;
    }
    s.undo.push(JSON.stringify([s.incoming, s.stack, s.out]));
    s.out.push(s.stack.pop());
  }
  play.msg = null;
  play.hint = null;
  if (s.out.length === play.p.cars.length) { win(); return; }
  paintBoard();
}

/* ------------------------------------------------------------------ */
/* Hints                                                               */
/* ------------------------------------------------------------------ */

const NTH = ['first', 'second', 'third', 'fourth'];

function hint() {
  play.hints += 1;
  const level = play.hint ? play.hint.level + 1 : 1;
  const L1 = (txt) => (L) => `<p class="cz-code-hint">🔎 ${esc(txt(L))}</p>`;
  const L2 = (txt) => (L) => `<p class="cz-code-hint">💡 ${esc(txt(L))}</p>`;
  const L3 = (txt) => (L) => `<p class="cz-code-hint">✋ ${esc(txt(L))}</p>`;
  if (play.mode === 'predict') {
    const run = T.runAll(play.p.lay, [play.p.trains[0].from], play.state)[0];
    if (level < 3) {
      play.hint = { level, k: (run.path.find(([, , k]) => k >= 0) || [])[2] };
      play.msg = level === 1 ? L1((L) => tr('hint.predict', L)) : L2((L) => tr('hint.predict', L));
    } else {
      play.hint = null;
      play.msg = L3((L) => houseName(animalOfLane(run.to), L, true));
    }
  } else if (play.mode === 'set') {
    const h = T.setHint(play.p, play.state);
    if (!h) { play.msg = L2((L) => tr('hint.done', L)); play.hint = null; paintBoard(); return; }
    const k = h.k;
    const kind = play.p.lay.x[k][3];
    const ti = h.train;
    const said = (L) => (kind === 'flip'
      ? tr('hint.flip', L, { n: T.metBefore(play.p, play.p.sol, ti, k), T: trainName(trainAnimal(ti), L), dir: dirWord(k, play.p.sol[k], L) })
      : tr('hint.lever', L, { T: trainName(trainAnimal(ti), L, true), dir: dirWord(k, needAt(ti, k), L) }));
    if (!play.hint || play.hint.k !== k) play.hint = { k, level: 0 };
    play.hint.level += 1;
    if (play.hint.level === 1) play.msg = L1((L) => tr('hint.look', L));
    else if (play.hint.level === 2) play.msg = L2(said);
    else { play.state[k] = play.p.sol[k]; play.hint = null; play.msg = L3(said); }
  } else if (play.mode === 'pulls') {
    const plan = T.minPulls(play.p.lay, play.p.trains.slice(play.sent), play.state);
    const want = plan ? plan.plan[0] : null;
    const k = want ? want.findIndex((v, i) => v !== play.state[i]) : -1;
    if (k < 0) { play.msg = L2((L) => tr('hint.done', L)); play.hint = null; paintBoard(); return; }
    const ti = play.sent;
    const said = (L) => tr('hint.pulls', L, { T: trainName(trainAnimal(ti), L), dir: dirWord(k, want[k], L) });
    if (!play.hint || play.hint.k !== k) play.hint = { k, level: 0 };
    play.hint.level += 1;
    if (play.hint.level === 1) play.msg = L1((L) => tr('hint.look', L));
    else if (play.hint.level === 2) play.msg = L2(said);
    else { play.state[k] = want[k]; play.pulls += 1; play.hint = null; play.msg = L3(said); }
  } else if (play.mode === 'order') {
    const slot = play.order.length;
    if (slot >= play.p.trains.length) { play.msg = L2((L) => tr('hint.done', L)); paintBoard(); return; }
    const runs = T.runAll(play.p.lay, Array(slot + 1).fill(0), play.p.start);
    const lane = runs[slot].to;
    const ti = play.p.trains.findIndex((x) => x.to === lane);
    const said = (L) => tr('hint.order', L, { H: houseName(animalOfLane(lane), L), a: trainName(trainAnimal(ti), L), nth: tr(NTH[slot], L) });
    if (level < 3) { play.hint = { level }; play.msg = level === 1 ? L1(said) : L2(said); }
    else { play.order.push(ti); play.hint = null; play.msg = L3(said); }
  } else if (play.mode === 'siding') {
    const s = play.siding;
    const want = s.out.length + 1;
    const top = s.stack[s.stack.length - 1];
    const A = animalById(play.p.animals[want - 1]);
    const out = top === want;
    const said = (L) => tr(out ? 'hint.sidingOut' : 'hint.sidingIn', L, { A: L === 'es' ? `${A.es.art} ${A.es.n}` : `the ${A.en}` });
    if (level < 3) { play.hint = { level, btn: out ? 'out' : 'in' }; play.msg = level === 1 ? L1(said) : L2(said); }
    else { play.hint = null; play.msg = L3(said); paintBoard(); sidingMove(out ? 'out' : 'in'); return; }
  }
  paintBoard();
}

/* What a train needs at switch k with the solution's settings. */
function needAt(ti, k) {
  const runs = T.runAll(play.p.lay, play.p.trains.map((x) => x.from), play.p.sol);
  const step = runs[ti].path.find(([, , s]) => s === k);
  return step && step[3] ? 1 : 0;
}

/* ------------------------------------------------------------------ */
/* Clicks, keys, reading aloud                                         */
/* ------------------------------------------------------------------ */

function toggle(k) {
  if (play.done || play.busy) return;
  play.state[k] ^= 1;
  if (play.mode === 'pulls') play.pulls += 1;
  play.result = null;
  play.routes = null;
  play.msg = null;
  paintBoard();
  const el = play.host.querySelector(`[data-tr-switch="${k}"]`);
  if (el) el.focus();
}

function click(ev) {
  if (!play || play.done) return false;
  const q = (sel) => ev.target.closest(sel);
  let el;
  if ((el = q('[data-tr-switch]'))) { toggle(Number(el.dataset.trSwitch)); return true; }
  if ((el = q('[data-tr-house]'))) { predict(Number(el.dataset.trHouse)); return true; }
  if ((el = q('[data-tr-order]'))) { play.order.push(Number(el.dataset.trOrder)); play.msg = null; play.result = null; play.routes = null; paintBoard(); return true; }
  if ((el = q('[data-tr-unorder]'))) { play.order.splice(Number(el.dataset.trUnorder), 1); paintBoard(); return true; }
  const action = q('[data-action]');
  if (!action) return false;
  switch (action.dataset.action) {
    case 'tr-go': if (play.mode === 'order') goOrder(); else goSet(); return true;
    case 'tr-send': sendNext(); return true;
    case 'tr-reset': play.state = play.p.start.slice(); play.result = null; play.routes = null; play.msg = null; paintBoard(); return true;
    case 'tr-clearorder': play.order = []; play.result = null; play.routes = null; paintBoard(); return true;
    case 'tr-in': sidingMove('in'); return true;
    case 'tr-out': sidingMove('out'); return true;
    case 'tr-undo': {
      const s = play.siding;
      const last = s.undo.pop();
      if (last) [s.incoming, s.stack, s.out] = JSON.parse(last);
      play.msg = null;
      paintBoard();
      return true;
    }
    case 'tr-hint': hint(); return true;
    default: return false;
  }
}

function key(ev) {
  if (!play || play.done) return false;
  const sw = ev.target.closest && ev.target.closest('[data-tr-switch]');
  if (sw && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); toggle(Number(sw.dataset.trSwitch)); return true; }
  if ((ev.key === 'g' || ev.key === 'G') && play.mode === 'set') { goSet(); return true; }
  return false;
}

function readAloud() {
  if (!play) return;
  const L = lang();
  const parts = [tr(`ask.${play.mode}`, L)];
  if (play.mode !== 'siding') {
    play.p.lay.x.forEach((x, k) => parts.push(tr(x[3] === 'flip' ? 'switchFlip' : 'switchLabel', L, { n: k + 1, state: stateWord(k, play.state[k], L) })));
  }
  say(parts);
}

const repaint = () => { if (play && !play.busy) paintBoard(); };

/* ------------------------------------------------------------------ */
/* The railway map, and today's puzzle                                 */
/* ------------------------------------------------------------------ */

function extras({ bank: b, rec, lang: L }) {
  const cards = b.chapters.map((ch, i) => {
    const ids = ch.puzzles.map((p) => p.id);
    const open = Math.min(10, Math.floor(P.tally(rec, 'trains', ids).solved / 10));
    return `<li class="cz-code-pen${open ? ' is-home' : ''}">
      <span class="cz-code-pen__pic" aria-hidden="true">${['🚉', '🚂', '🚃', '🚆'][i % 4]}</span>
      <span class="cz-code-pen__text"><strong>${esc(tr(`ch.${ch.id}`, L))}</strong>
        <span class="cz-code-pen__locks" aria-hidden="true">${Array.from({ length: 10 }, (_, k) => `<span class="${k < open ? 'is-open' : ''}"></span>`).join('')}</span>
        <span>${esc(tr('map.count', L, { n: open }))}</span></span>
    </li>`;
  }).join('');
  return `<section class="cz-code-zoo" aria-labelledby="cz-tr-map-h">
    <h2 class="cz-logic-h2" id="cz-tr-map-h">🗺️ ${esc(tr('map.title', L))}</h2>
    <p class="gp-muted">${esc(tr('map.lede', L))}</p>
    <ul class="cz-code-pens">${cards}</ul>
  </section>`;
}

function dailyPuzzle(level, iso) {
  const list = T.CHAPTERS[level];
  const def = list[hash('trains-daily', level, iso) % list.length];
  const rng = rngFor('trains', 'daily', level, iso);
  const p = T.makePuzzle(T.chapter(def.id), rng);
  return p ? { puzzle: { id: `daily-${iso}`, ...T.dress(p, rng) }, chapterId: def.id } : null;
}

export default {
  id: 'trains', bank, chapters, levelOfChapter, tileLabel, draw, repaint, click, key,
  say: readAloud, extras, dailyPuzzle, leave
};
