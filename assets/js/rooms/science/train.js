/**
 * rooms/science/train.js — Fruit Train, drawn.
 *
 * A side view: the zoo train runs along an elevated track with a monkey on
 * the roof holding fruit, and hungry animals wait below. The child picks a
 * spot (or a landing mark, or a speed) on cards under the picture, presses
 * Go, and watches the train run. The fruit leaves the monkey's hand and
 * leaves a dot at every tick of its fall, so the curve it makes, and the
 * growing gaps between the dots, stay on the picture to be counted.
 *
 * Every position is the whole-number rule in trainlogic.js; the animation
 * only draws what the rule says between ticks. With reduced motion there is
 * no ride: the dots and the landed fruit are simply there.
 *
 * Moving-train puzzles can be tried again: the dots of the miss stay, so
 * the next guess is made with the evidence on the screen. The "which lands
 * first" and "count the gaps" puzzles are one go each, like Hippo Pond.
 */

import * as T from '../../modules/trainlogic.js';
import { the, rows, speedWords, squares, ticks, tt } from '../../modules/traintext.js';
import { hash, rngFor } from '../../modules/logicrng.js';
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
    banks.set(level, fetch(`data/science/train/${level}.json`, { cache: 'no-cache' }).then((res) => {
      if (!res.ok) throw new Error(`Could not load the ${level} train experiments`);
      return res.json();
    }));
    banks.get(level).catch(() => banks.delete(level));
  }
  return banks.get(level);
}

const chapters = (level, L) => T.CHAPTERS[level].map((ch) => ({
  id: ch.id, icon: ch.icon, title: tt(`ch.${ch.id}`, L), idea: tt(`ch.${ch.id}.idea`, L)
}));
const levelOfChapter = (id) => (T.chapter(id) || {}).level || null;
const TILE_ICON = { drop: '🐒', land: '🎯', speed: '🎚️', gaps: '📏', pair: '🏁' };
const tileLabel = (p, L) => (p.teach ? { icon: '🎓', text: t('teach') } : { icon: TILE_ICON[p.kind], text: tt(`tile.${p.kind}`, L) });

/* ------------------------------------------------------------------ */
/* State                                                               */
/* ------------------------------------------------------------------ */

let play = null;
let frame = 0;
let timers = [];

function stopMotion() {
  if (frame) cancelAnimationFrame(frame);
  frame = 0;
  timers.forEach((id) => clearTimeout(id));
  timers = [];
}

function draw(host, ctx) {
  stopMotion();
  const p = ctx.puzzle;
  const right = T.answers(p);
  play = {
    host, ctx, p, right,
    picks: right.map(() => null),
    locked: right.map(() => false),   // questions already answered right (retry puzzles)
    trails: [],                        // the dots of every run so far
    landed: [],                        // where each fruit of the last run came down
    hints: 0, hint: 0, wrong: 0,
    msg: null, done: false, running: false
  };
  paintBoard();
}

const L0 = () => lang();

/* ------------------------------------------------------------------ */
/* Geometry                                                            */
/* ------------------------------------------------------------------ */

const W = 360;
const COLW = 24;
const X0 = 22;
const TRACK = 92;          // the rail
const DECK = TRACK - 22;   // where the monkey's hand is
const colX = (c) => X0 + c * COLW + COLW / 2;

/** The tallest drop in the puzzle, and the row height that fits it on the picture. */
function scale() {
  const p = play.p;
  const hs = p.kind === 'drop' ? p.targets.map((g) => g.H) : [p.H];
  const Hmax = Math.max(...hs);
  const rowPx = Hmax <= 1 ? 40 : Hmax <= 4 ? 22 : Hmax <= 9 ? 15 : 10;
  return { Hmax, rowPx, ground: DECK + Hmax * rowPx + 34 };
}

/* ------------------------------------------------------------------ */
/* The track picture                                                   */
/* ------------------------------------------------------------------ */

const fruitOf = (p, k) => {
  if (p.kind === 'drop') return T.eaterById(p.targets[k].eater).fruit;
  if (p.kind === 'speed') return T.eaterById(p.eater).fruit;
  return p.thing;
};

/* A flag above the track: the train passes under it, and the monkey lets go
   right below it. */
const pin = (c, label, on) => `<g class="cz-tr-pin${on ? ' is-on' : ''}">
  <path d="M${colX(c)} ${TRACK - 64} V${TRACK - 50}"/>
  <circle cx="${colX(c)}" cy="${TRACK - 74}" r="10"/>
  <text x="${colX(c)}" y="${TRACK - 70}" text-anchor="middle">${label}</text></g>`;

/**
 * How far it falls, beside the animal: "4 rows down: 2 ticks". Hard says
 * only the rows, so working out the ticks is part of the puzzle.
 */
function fallLabel(col, H, L, track = false) {
  const hard = play.ctx.level === 'hard';
  const { ground } = scale();
  const x = colX(col);
  /* "Where will it land?" marks the ground, so its label goes by the pin. */
  if (track) {
    const words = hard ? rows(H, L) : `${rows(H, L)} · ${ticks(T.root(H), L)}`;
    const right = col <= 6;
    return `<text class="cz-tr-fall" x="${x + (right ? 14 : -14)}" y="${TRACK + 16}" text-anchor="${right ? 'start' : 'end'}">↓ ${esc(words)}</text>`;
  }
  return `<text class="cz-tr-fall" x="${x}" y="${ground + 13}" text-anchor="middle">↓ ${esc(rows(H, L))}</text>
    ${hard ? '' : `<text class="cz-tr-fall" x="${x}" y="${ground + 26}" text-anchor="middle">${esc(ticks(T.root(H), L))}</text>`}`;
}

/** Where the train waits, and starts from: two squares before the first place it lets go. */
function startCol() {
  const p = play.p;
  const first = p.kind === 'drop' ? Math.min(...p.spots) : p.c;
  return Math.max(-1, first - 2);
}

function trackSvg() {
  const L = L0();
  const p = play.p;
  const { rowPx, ground } = scale();
  const H = ground + 32;
  const parts = [];
  /* The rail on its posts, and the ground. */
  parts.push(`<rect class="cz-tr-ground" x="0" y="${ground}" width="${W}" height="32"/>`);
  for (let c = 0; c < T.COLS; c += 3) parts.push(`<path class="cz-tr-post" d="M${colX(c)} ${TRACK + 4} V${ground}"/>`);
  parts.push(`<path class="cz-tr-rail" d="M0 ${TRACK} H${W}"/>`);
  /* A tie under every column, so squares can be counted along the track. */
  for (let c = 0; c < T.COLS; c++) parts.push(`<path class="cz-tr-tie" d="M${colX(c)} ${TRACK - 3} V${TRACK + 5}"/>`);

  /* The animals, each with its mouth exactly H rows under the monkey's hand. */
  const eaters = p.kind === 'drop' ? p.targets.map((g) => ({ ...g })) : p.kind === 'speed' ? [{ eater: p.eater, H: p.H, M: p.M }] : [];
  eaters.forEach((g, k) => {
    const mouth = DECK + g.H * rowPx;
    const e = T.eaterById(g.eater);
    const fed = play.done || play.locked[p.kind === 'drop' ? k : 0];
    if (ground - (mouth + 22) > 4) parts.push(`<rect class="cz-tr-rock" x="${colX(g.M) - 16}" y="${mouth + 22}" width="32" height="${ground - mouth - 22}" rx="6"/>`);
    parts.push(`<text class="cz-tr-eater" x="${colX(g.M)}" y="${mouth + 6}" font-size="34" text-anchor="middle" dominant-baseline="central">${e.emoji}</text>`);
    parts.push(`<circle class="cz-tr-mouth" cx="${colX(g.M)}" cy="${mouth}" r="5"/>`);
    parts.push(fallLabel(g.M, g.H, L));
    if (fed) parts.push(`<text class="cz-tr-badge" x="${colX(g.M) + 18}" y="${mouth - 14}">✓</text>`);
  });

  /* Spots to let go: numbered pins on the track. The landing marks of
     "where will it land?" are letters on the ground. */
  if (p.kind === 'drop') {
    p.spots.forEach((c, i) => {
      const on = play.picks.includes(i);
      parts.push(pin(c, String(i + 1), on));
    });
  }
  if (p.kind === 'land' || p.kind === 'speed') {
    parts.push(pin(p.c, '📍', true));
  }
  if (p.kind === 'land') {
    parts.push(fallLabel(p.c, p.H, L, true));
    p.marks.forEach((m, i) => {
      const on = play.picks[0] === i;
      parts.push(`<g class="cz-tr-mark${on ? ' is-on' : ''}"><path d="M${colX(m) - 9} ${ground + 2} H${colX(m) + 9}"/>
        <text x="${colX(m)}" y="${ground + 16}" text-anchor="middle">${String.fromCharCode(65 + i)}</text></g>`);
    });
  }

  /* Dots of every run so far: the latest bold, older ones faint. */
  play.trails.forEach((tr, k) => {
    const last = k === play.trails.length - 1;
    tr.forEach(([x, y], j) => parts.push(`<circle class="cz-tr-dot${last ? '' : ' is-old'}" cx="${x}" cy="${y}" r="${j === 0 ? 2.5 : 3.5}"/>`));
  });
  /* Fruit already on the ground or in a mouth from the last run. */
  play.landed.forEach((f) => parts.push(`<text x="${f.x}" y="${f.y}" font-size="18" text-anchor="middle" dominant-baseline="central">${f.emoji}</text>`));

  /* The train, parked off to the left until it runs. */
  const fruits = (p.kind === 'drop' ? p.targets.map((_, k) => fruitOf(p, k)) : [fruitOf(p, 0)]).map((id) => T.thingById(id).emoji);
  parts.push(`<g class="cz-tr-train" data-tr-train transform="translate(${colX(startCol())} 0)">
    <text x="0" y="${TRACK - 14}" font-size="30" text-anchor="middle" dominant-baseline="central">🚃</text>
    <text x="-2" y="${TRACK - 40}" font-size="22" text-anchor="middle" dominant-baseline="central">🐒</text>
    ${play.running || play.done ? '' : `<text data-tr-hand x="13" y="${DECK - 8}" font-size="15" text-anchor="middle" dominant-baseline="central">${fruits[0]}</text>`}
  </g>`);
  /* The falling fruit: one per drop, hidden until it is let go. */
  fruits.forEach((emoji, k) => parts.push(`<text class="cz-tr-fruit" data-tr-fruit="${k}" x="0" y="0" font-size="20" text-anchor="middle" dominant-baseline="central" visibility="hidden">${emoji}</text>`));

  return `<svg class="cz-tr-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(sceneLabel(L))}">${parts.join('')}</svg>`;
}

function sceneLabel(L) {
  const p = play.p;
  if (p.kind === 'drop') return p.targets.map((g) => tt('hungry', L, { It: the('eater', g.eater, L, true) })).join(' ');
  if (p.kind === 'speed') return tt('hungry', L, { It: the('eater', p.eater, L, true) });
  return tt(`ch.${play.ctx.chapterId}`, L);
}

/* ------------------------------------------------------------------ */
/* The tower picture: counting gaps, and races to the ground           */
/* ------------------------------------------------------------------ */

const TROW = 10;                // px per row on the tower
const TOP = 40;
const TGROUND = TOP + 16 * TROW + 10;
const FX = 152;                 // where the counted fruit falls, just off the tower

function towerSvg() {
  const L = L0();
  const p = play.p;
  const parts = [`<rect class="cz-tr-ground" x="0" y="${TGROUND}" width="${W}" height="18"/>`];
  /* A ruler of rows down the side: every row a tick mark, every fourth a number. */
  for (let r = 0; r <= 16; r++) {
    const y = TOP + r * TROW;
    parts.push(`<path class="cz-tr-ruler${r % 4 === 0 ? ' is-major' : ''}" d="M20 ${y} H${r % 4 === 0 ? 34 : 28}"/>`);
    if (r % 4 === 0) parts.push(`<text class="cz-tr-rulern" x="38" y="${y + 4}">${r}</text>`);
  }
  if (p.kind === 'gaps') {
    parts.push(`<rect class="cz-tr-tower" x="96" y="${TOP - 6}" width="44" height="6" rx="2"/>`);
    parts.push(`<text x="118" y="${TOP - 20}" font-size="26" text-anchor="middle" dominant-baseline="central" aria-hidden="true">🦒</text>`);
    parts.push(`<path class="cz-tr-post" d="M100 ${TOP} V${TGROUND} M136 ${TOP} V${TGROUND}"/>`);
    parts.push(`<text class="cz-tr-fruit" data-tr-fruit="0" x="${FX}" y="${TOP}" font-size="20" text-anchor="middle" dominant-baseline="central">${T.thingById(p.thing).emoji}</text>`);
  }
  if (p.kind === 'pair') {
    /* Each pair gets two lanes, A and B; several pairs are raced one after another. */
    const pr = p.pairs[play.lane || 0];
    if (p.pairs.length > 1) parts.push(`<text class="cz-tr-lane" x="${W - 12}" y="18" text-anchor="end">${esc(tt('race', L, { n: (play.lane || 0) + 1 }))}</text>`);
    [pr.a, pr.b].forEach((x, k) => {
      const lx = k === 0 ? 120 : 260;
      const py = TGROUND - x.h * TROW;
      parts.push(`<rect class="cz-tr-tower" x="${lx - 26}" y="${py}" width="52" height="5" rx="2"/>`);
      parts.push(`<path class="cz-tr-post" d="M${lx - 20} ${py} V${TGROUND} M${lx + 20} ${py} V${TGROUND}"/>`);
      if (x.v) parts.push(`<text x="${lx - 14}" y="${py - 14}" font-size="22" text-anchor="middle" dominant-baseline="central">🚃</text>`);
      parts.push(`<text class="cz-tr-lane" x="${lx}" y="${TGROUND + 14}" text-anchor="middle">${k === 0 ? 'A' : 'B'}</text>`);
      parts.push(`<text class="cz-tr-fruit" data-tr-fruit="${k}" x="${lx + (x.v ? 8 : 0)}" y="${py - 12}" font-size="22" text-anchor="middle" dominant-baseline="central">${T.thingById(x.thing).emoji}</text>`);
    });
  }
  play.trails.forEach((tr) => tr.forEach(([x, y]) => parts.push(`<circle class="cz-tr-dot" cx="${x}" cy="${y}" r="3.5"/>`)));
  (play.gapLabels || []).forEach((g) => parts.push(`<text class="cz-tr-gapn" x="${g.x}" y="${g.y}">${esc(g.text)}</text>`));
  return `<svg class="cz-tr-svg" viewBox="0 0 ${W} ${TGROUND + 20}" role="img" aria-label="${esc(tt(`ch.${play.ctx.chapterId}`, L))}">${parts.join('')}</svg>`;
}

const scene = () => (play.p.kind === 'gaps' || play.p.kind === 'pair' ? towerSvg() : trackSvg());

/* ------------------------------------------------------------------ */
/* Questions and their cards                                           */
/* ------------------------------------------------------------------ */

function askText(L) {
  const p = play.p;
  switch (p.kind) {
    case 'drop': return p.v === 0 ? tt('ask.drop0', L) : tt('ask.drop', L, { vv: squares(p.v, L) });
    case 'land': return tt('ask.land', L, { vv: squares(p.v, L), it: the('thing', p.thing, L) });
    case 'speed': return tt('ask.speed', L);
    case 'gaps': return tt('ask.gaps', L, { It: the('thing', p.thing, L, true) });
    case 'pair': return tt('ask.pair', L);
    default: return '';
  }
}

function questionHead(k, L) {
  const p = play.p;
  switch (p.kind) {
    case 'drop': {
      const g = p.targets[k];
      return `<span class="cz-sci-pic" aria-hidden="true">${T.eaterById(g.eater).emoji}</span>
        <span class="cz-sci-cardname">${esc(tt('forWho', L, { it: the('eater', g.eater, L) }))}</span>`;
    }
    case 'speed':
      return `<span class="cz-sci-pic" aria-hidden="true">${T.eaterById(p.eater).emoji}</span>
        <span class="cz-sci-cardname">${esc(tt('forWho', L, { it: the('eater', p.eater, L) }))}</span>`;
    case 'gaps': return `<span class="cz-sci-cardname">${esc(tt(`q.${p.qs[k].type}`, L, { n: p.qs[k].n }))}</span>`;
    case 'pair': {
      const pr = p.pairs[k];
      const side = (x, letter) => `<span class="cz-tr-side"><strong>${letter}</strong> <span aria-hidden="true">${T.thingById(x.thing).emoji}</span>
        ${esc(the('thing', x.thing, L, true))}, ${esc(tt('fromTower', L, { h: x.h }))}${x.v ? `, ${esc(tt('onTrain', L, { v: x.v }))}` : ''}</span>`;
      const title = p.pairs.length > 1 ? `<strong class="cz-tr-race">${esc(tt('race', L, { n: k + 1 }))}</strong>` : '';
      return `<span class="cz-tr-sides">${title}${side(pr.a, 'A')}${side(pr.b, 'B')}</span>`;
    }
    default: return '';
  }
}

function choiceText(k, v, L) {
  const p = play.p;
  switch (p.kind) {
    case 'drop': return tt('spot', L, { n: v + 1 });
    case 'land': return tt('mark', L, { n: String.fromCharCode(65 + v) });
    case 'speed': return speedWords(p.speeds[v], L);
    case 'gaps': {
      const q = p.qs[k];
      const n = q.opts[v];
      return q.type === 'ticks' ? ticks(n, L) : rows(n, L);
    }
    case 'pair': return v === 'same' ? tt('together', L) : tt('first', L, { x: v.toUpperCase() });
    default: return String(v);
  }
}

function card(k, L) {
  const p = play.p;
  const opts = T.choices(p)[k];
  const picked = play.picks[k];
  const lockedRight = play.locked[k];
  const head = questionHead(k, L);
  const result = play.results && play.results[k] ? play.results[k](L) : '';
  const buttons = play.done || lockedRight ? '' : `<div class="cz-sci-opts" role="group">
    ${opts.map((v) => {
      const tried = (play.tried || []).some((x) => x[0] === k && x[1] === v);
      return `<button type="button" class="gp-btn cz-sci-opt${picked === v ? ' is-on' : ''}${tried ? ' is-tried' : ''}" aria-pressed="${picked === v}"
        data-tr-q="${k}" data-tr-v="${v}" ${tried ? 'disabled' : ''}>${tried ? '<span aria-hidden="true">✗</span> ' : ''}${esc(choiceText(k, v, L))}</button>`;
    }).join('')}
  </div>`;
  const state = play.done || lockedRight ? (play.ok && play.ok[k] === false ? ' is-surprise' : ' is-right') : '';
  return `<li class="cz-sci-card${state}">
    ${head ? `<div class="cz-sci-cardhead">${head}</div>` : ''}
    ${buttons}
    ${result}
  </li>`;
}

/* ------------------------------------------------------------------ */
/* Painting                                                            */
/* ------------------------------------------------------------------ */

function paintBoard() {
  const L = L0();
  const p = play.p;
  const n = play.right.length;
  const ready = play.picks.every((v, k) => v !== null || play.locked[k]);
  const goWord = p.kind === 'pair' || p.kind === 'gaps' ? tt('drop', L) : tt('go', L);
  const actions = play.done ? '' : `<div class="cz-sci-actions">
      <button type="button" class="gp-btn gp-btn--primary gp-btn--big cz-sci-go" data-action="tr-go" ${ready && !play.running ? '' : 'aria-disabled="true"'}>${esc(goWord)}</button>
      ${canHint() ? `<button type="button" class="gp-btn gp-btn--ghost" data-action="tr-hint"><span aria-hidden="true">💡</span> ${esc(play.hint ? t('hintMore') : t('hint'))}</button>` : ''}
    </div>`;
  play.host.innerHTML = `<div class="cz-tr" lang="${L}">
    <p class="cz-sci-ask">${esc(askText(L))}</p>
    <div class="cz-tr-scene">${scene()}</div>
    <ol class="cz-sci-cards${n === 1 ? ' is-one' : ''}">${Array.from({ length: n }, (_, k) => card(k, L)).join('')}</ol>
    ${play.hintText ? `<p class="cz-sci-hint"><span aria-hidden="true">💡</span> ${esc(play.hintText(L))}</p>` : ''}
    ${actions}
    <div class="cz-sci-msg" aria-live="polite">${play.msg ? play.msg(L) : ''}</div>
  </div>`;
  paint();
}

/* ------------------------------------------------------------------ */
/* Hints                                                               */
/* ------------------------------------------------------------------ */

const canHint = () => !play.done && !play.ctx.puzzle.teach && play.hint < 2;

function hint() {
  const p = play.p;
  play.hint += 1;
  play.hints += 1;
  if (p.kind === 'drop' || p.kind === 'land' || p.kind === 'speed') {
    if (play.hint === 1) {
      play.hintText = (L) => {
        if (p.kind === 'speed') return tt('hintSpeed', L, { nn: ticks(T.root(p.H), L), dd: squares(p.M - p.c, L) });
        const H = p.kind === 'drop' ? p.targets.find((_, k) => !play.locked[k]).H : p.H;
        if (p.v === 0) return tt('hintStill', L);
        return tt('hintMove', L, { nn: ticks(T.root(H), L), vv: squares(p.v, L) });
      };
    } else {
      /* The second hint draws the path itself, worked back from the target. */
      const { rowPx } = scale();
      if (p.kind === 'drop') {
        const k = p.targets.findIndex((_, j) => !play.locked[j]);
        const g = p.targets[k];
        const c = g.M - p.v * T.root(g.H);
        play.trails.push(dotsFor(c, p.v, g.H, rowPx));
      } else if (p.kind === 'land') {
        play.trails.push(dotsFor(p.c, p.v, p.H, rowPx));
      } else {
        const v = (p.M - p.c) / T.root(p.H);
        play.trails.push(dotsFor(p.c, v, p.H, rowPx));
      }
      play.hintText = (L) => tt('hintPath', L);
    }
  } else if (p.kind === 'gaps') {
    play.hint = 2;
    play.hintText = (L) => tt('hintGaps', L);
  } else {
    play.hint = 2;
    play.hintText = (L) => tt('hintPair', L);
  }
  paintBoard();
}

/** The dots a fruit leaves: one where it is let go and one at the end of every tick. */
function dotsFor(c, v, H, rowPx) {
  const n = T.root(H);
  return Array.from({ length: n + 1 }, (_, tk) => {
    const [x, r] = T.at(c, v, tk);
    return [colX(x), DECK + r * rowPx];
  });
}

/* ------------------------------------------------------------------ */
/* Running the train                                                   */
/* ------------------------------------------------------------------ */

const TICK = 380;     // ms per tick: a little slower than real life at half a metre a row

/**
 * Run `onFrame(ticks)` every frame for `endTicks` ticks, then `onEnd()` once.
 * A hidden tab gets no frames, so a timer finishes the run anyway: a child
 * who switches away mid-ride comes back to a finished one, never a stuck one.
 */
function animate(endTicks, onFrame, onEnd, msPerTick = TICK) {
  let over = false;
  const end = () => {
    if (over) return;
    over = true;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    onFrame(endTicks);
    onEnd();
  };
  if (calm() || document.hidden) { end(); return; }
  const t0 = performance.now();
  const step = (now) => {
    if (over) return;
    const tk = (now - t0) / msPerTick;
    onFrame(Math.min(tk, endTicks));
    if (tk < endTicks) frame = requestAnimationFrame(step); else end();
  };
  frame = requestAnimationFrame(step);
  timers.push(setTimeout(end, endTicks * msPerTick + 1500));
}

function go() {
  if (play.done || play.running) return;
  const p = play.p;
  if (!play.picks.every((v, k) => v !== null || play.locked[k])) {
    play.msg = (L) => `<p class="cz-sci-say">${esc(tt('pickAll', L))}</p>`;
    paintBoard();
    return;
  }
  play.msg = null;
  play.hintText = null;
  if (p.kind === 'gaps') { runGaps(); return; }
  if (p.kind === 'pair') { runPairs(); return; }
  runTrain();
}

/**
 * The drops this run makes: [{ c, v, H, target column, k }]. A drop puzzle
 * lets go at each chosen spot; "where will it land" and "set the speed" let
 * go at the pin.
 */
function drops() {
  const p = play.p;
  if (p.kind === 'drop') {
    return p.targets.map((g, k) => ({ k, c: p.spots[play.locked[k] ? play.right[k] : play.picks[k]], v: p.v, H: g.H, M: g.M }));
  }
  if (p.kind === 'land') return [{ k: 0, c: p.c, v: p.v, H: p.H, M: null }];
  return [{ k: 0, c: p.c, v: p.speeds[play.picks[0]], H: p.H, M: p.M }];
}

function runTrain() {
  const { rowPx } = scale();
  const list = drops();
  const v = list[0].v;
  const start = startCol();
  /* A standing train drives up at one square a tick and stops at the spot. */
  const speed = v || 1;
  const releaseAt = (d) => (d.c - start) / speed + (v ? 0 : 0.6);
  const endAt = Math.max(...list.map((d) => releaseAt(d) + T.root(d.H))) + 0.8;
  play.running = true;
  play.landed = [];
  const trail = [];
  play.trails.push(trail);
  paintBoard();

  const svg = play.host.querySelector('.cz-tr-svg');
  const train = svg.querySelector('[data-tr-train]');
  const fruits = [...svg.querySelectorAll('[data-tr-fruit]')];
  const hand = svg.querySelector('[data-tr-hand]');
  const placed = new Set();

  const trainX = (tk) => (v ? colX(start + v * tk) : colX(Math.min(start + tk, list[0].c)));
  const fruitAt = (d, tk) => {
    const s = Math.max(0, Math.min(tk - releaseAt(d), T.root(d.H)));
    return [colX(d.c + d.v * s), DECK + s * s * rowPx];
  };

  const show = (tk) => {
    train.setAttribute('transform', `translate(${trainX(tk)} 0)`);
    list.forEach((d) => {
      const el = fruits[d.k];
      if (tk < releaseAt(d)) { el.setAttribute('visibility', 'hidden'); return; }
      if (hand) hand.setAttribute('visibility', 'hidden');
      const [x, y] = fruitAt(d, tk);
      el.setAttribute('visibility', 'visible');
      el.setAttribute('x', x);
      el.setAttribute('y', y);
      /* A dot at the moment of letting go and at every whole tick after. */
      const whole = Math.floor(tk - releaseAt(d) + 1e-9);
      for (let j = 0; j <= Math.min(whole, T.root(d.H)); j++) {
        const key = `${d.k}:${j}`;
        if (placed.has(key)) continue;
        placed.add(key);
        const [dx, dy] = fruitAt(d, releaseAt(d) + j);
        trail.push([dx, dy]);
        svg.insertAdjacentHTML('beforeend', `<circle class="cz-tr-dot" cx="${dx}" cy="${dy}" r="${j === 0 ? 2.5 : 3.5}"/>`);
      }
    });
  };

  const finishRun = () => {
    /* Fill in every dot, as reduced motion shows it. */
    list.forEach((d) => {
      for (let j = 0; j <= T.root(d.H); j++) {
        if (!placed.has(`${d.k}:${j}`)) { placed.add(`${d.k}:${j}`); trail.push(fruitAt(d, releaseAt(d) + j)); }
      }
    });
    play.running = false;
    judgeRun(list, rowPx);
  };

  animate(endAt, show, finishRun);
}

/* What the run did, against what the child picked. */
function judgeRun(list, rowPx) {
  const p = play.p;
  const L = L0();
  let wrongNow = 0;
  play.results = play.results || [];
  play.ok = play.ok || [];
  list.forEach((d) => {
    const land = T.landing(d.c, d.v, d.H);
    const fruit = T.thingById(fruitOf(p, d.k)).emoji;
    if (p.kind === 'land') {
      const k = 0;
      const picked = p.marks[play.picks[0]];
      const right = picked === land;
      play.landed.push({ x: colX(land), y: DECK + d.H * rowPx, emoji: fruit });
      if (right) { play.locked[k] = true; play.ok[k] = play.ok[k] !== false; }
      else { wrongNow += 1; play.ok[k] = false; (play.tried = play.tried || []).push([k, play.picks[0]]); play.picks[0] = null; }
      const n = String.fromCharCode(65 + p.marks.indexOf(land));
      const why = (LL) => whyMove(d, LL);
      play.results[k] = right
        ? (LL) => resultHtml(true, tt('landedAt', LL, { n }), why(LL))
        : (LL) => resultHtml(false, tt('landedSurprise', LL, { n: String.fromCharCode(65 + p.marks.indexOf(land)) }), why(LL));
      return;
    }
    const hit = land === d.M;
    const k = d.k;
    if (hit) {
      play.locked[k] = true;
      if (play.ok[k] !== false) play.ok[k] = true;
    } else {
      wrongNow += 1;
      play.ok[k] = false;
      (play.tried = play.tried || []).push([k, play.picks[k]]);
      play.picks[k] = null;
      play.landed.push({ x: colX(Math.min(land, T.COLS - 1)), y: scale().ground - 8, emoji: fruit });
    }
    const who = p.kind === 'drop' ? p.targets[k].eater : p.eater;
    const ahead = land - d.c;
    play.results[k] = hit
      ? (LL) => resultHtml(true, p.kind === 'speed' ? tt('speedRight', LL, { It: the('eater', who, LL, true) }) : tt('yum', LL, { It: the('eater', who, LL, true) }), whyMove(d, LL))
      : (LL) => resultHtml(false, d.v === 0 ? `${t('surprise')} ${tt('missDown', LL)}` : p.kind === 'speed' ? tt('speedMiss', LL, { dd: squares(ahead, LL) }) : tt('missAhead', LL, { dd: squares(ahead, LL) }), whyMove(d, LL));
  });
  if (wrongNow) {
    play.wrong += wrongNow;
    play.ctx.surprise(wrongNow);
    react('wow', 1600);
  }
  const allRight = play.right.every((_, k) => play.locked[k]);
  if (allRight) { finish(); return; }
  paintBoard();
}

function whyMove(d, L) {
  const n = T.root(d.H);
  if (d.v === 0) return tt('why.drop0', L);
  if (play.p.kind === 'speed') return tt('why.speed', L, { hh: rows(d.H, L), nn: ticks(n, L), dd: squares(d.v * n, L), vv: squares(d.v, L) });
  return tt('why.drop', L, { nn: ticks(n, L), vv: squares(d.v, L), dd: squares(d.v * n, L) });
}

const resultHtml = (ok, head, why) => `<p class="cz-sci-result ${ok ? 'is-right' : 'is-surprise'}">
  ${ok ? '' : '<span class="cz-sci-wow" aria-hidden="true">🤯</span>'}<strong>${esc(head)}</strong>
  <span class="cz-sci-rwhy">${esc(why)}</span></p>`;

/* ---- counting the gaps: one fall from the top of the tower ---- */

function runGaps() {
  const p = play.p;
  play.running = true;
  play.done = true;
  const trail = [];
  play.trails.push(trail);
  play.gapLabels = [];
  const end = 4;
  const fall = (tk) => TOP + tk * tk * TROW;
  const settle = () => {
    for (let j = 0; j <= end; j++) if (!trail[j]) trail[j] = [FX, fall(j)];
    play.gapLabels = [1, 2, 3, 4].map((n) => ({ x: FX + 16, y: (fall(n - 1) + fall(n)) / 2 + 4, text: `${T.stepIn(n)}` }));
    play.running = false;
    judgeOneGo();
  };
  paintBoard();
  const svg = play.host.querySelector('.cz-tr-svg');
  const el = svg.querySelector('[data-tr-fruit="0"]');
  animate(end, (tk) => {
    el.setAttribute('y', fall(tk));
    const whole = Math.floor(tk + 1e-9);
    for (let j = 0; j <= whole; j++) {
      if (trail[j]) continue;
      trail[j] = [FX, fall(j)];
      svg.insertAdjacentHTML('beforeend', `<circle class="cz-tr-dot" cx="${FX}" cy="${fall(j)}" r="3.5"/>`);
    }
  }, settle, TICK * 1.3);
}

/* ---- races to the ground: every pair at once, lane by lane ---- */

function runPairs() {
  const p = play.p;
  play.running = true;
  play.done = true;
  play.lane = 0;
  const runLane = (lane) => {
    play.lane = lane;
    play.trails = [];
    paintBoard();
    const pr = p.pairs[lane];
    const svg = play.host.querySelector('.cz-tr-svg');
    const els = [svg.querySelector('[data-tr-fruit="0"]'), svg.querySelector('[data-tr-fruit="1"]')];
    const sides = [pr.a, pr.b];
    const lx = [120, 260];
    /* A drifter takes three times as long and sways; that is the honest
       picture, not a measurement. */
    const pos = (x, k, tk) => {
      const air = T.thingById(x.thing).air;
      const top = TGROUND - x.h * TROW - 12;
      const span = x.h * TROW + 2;
      const fallen = air ? Math.min(span, (tk * tk * TROW) / 9) : Math.min(span, tk * tk * TROW);
      const sway = air ? Math.sin(tk * 2.2) * 10 : 0;
      return [lx[k] + (x.v ? 8 + Math.min(tk, T.root(x.h)) * x.v * 5 : 0) + sway, top + fallen];
    };
    const doneAt = Math.max(...sides.map((x) => (T.thingById(x.thing).air ? 3 : 1) * T.root(x.h))) + 0.6;
    animate(doneAt, (tk) => {
      sides.forEach((x, k) => { const [a, b] = pos(x, k, tk); els[k].setAttribute('x', a); els[k].setAttribute('y', b); });
    }, () => next(lane));
  };
  const next = (lane) => {
    if (lane + 1 < p.pairs.length) {
      if (calm() || document.hidden) runLane(lane + 1); else timers.push(setTimeout(() => runLane(lane + 1), 700));
      return;
    }
    play.running = false;
    judgeOneGo();
  };
  runLane(0);
}

/* One-go puzzles: mark every question, count the surprises, finish. */
function judgeOneGo() {
  const p = play.p;
  play.ok = play.picks.map((v, k) => v === play.right[k]);
  play.results = play.right.map((r, k) => (LL) => {
    const ok = play.ok[k];
    if (p.kind === 'gaps') {
      const q = p.qs[k];
      const val = q.opts[r];
      const words = q.type === 'ticks' ? ticks(val, LL) : rows(val, LL);
      const why = q.type === 'step' ? tt('why.step', LL) : q.type === 'total' ? tt('why.total', LL, { n: q.n, t: q.n * q.n }) : tt('why.ticks', LL, { h: q.n, n: T.root(q.n) });
      return resultHtml(ok, ok ? tt('gapRight', LL, { n: words }) : tt('gapSurprise', LL, { n: words }), why);
    }
    const pr = p.pairs[k];
    const said = r === 'same' ? tt('rTogether', LL) : tt('rFirst', LL, { x: r.toUpperCase() });
    return resultHtml(ok, ok ? tt('pairRight', LL, { r: said }) : tt('pairSurprise', LL, { r: said }), pairWhy(pr, r, LL));
  });
  const wrong = play.ok.filter((x) => !x).length;
  play.wrong = wrong;
  if (wrong) { play.ctx.surprise(wrong); react('wow', 1600); }
  finish();
}

function pairWhy(pr, r, L) {
  const air = [pr.a, pr.b].find((x) => T.thingById(x.thing).air);
  if (air) return tt('why.air', L, { It: the('thing', air.thing, L, true) });
  if (r === 'same') return pr.a.v || pr.b.v ? tt('why.sameMove', L) : tt('why.same', L);
  return tt('why.lower', L);
}

function finish() {
  play.done = true;
  if (!play.wrong) react('happy', 1800);
  paintBoard();
  const chId = play.ctx.chapterId;
  const stars = T.starsFor({ wrong: play.wrong, hints: play.hints, teach: !!play.ctx.puzzle.teach });
  play.ctx.onSolved({
    stars,
    why: (L) => [...play.right.map((_, k) => (play.results[k] ? play.results[k](L).replace(/^<p[^>]*>|<\/p>$/g, '') : '')), ...bigIdea(chId, L)].filter(Boolean)
  });
}

function bigIdea(chId, L) {
  const idea = IDEAS.train.find((i) => i.ch === chId);
  return idea ? [`<strong>${esc(idea[L])}</strong> ${esc(idea.why[L])}`] : [];
}

/* ------------------------------------------------------------------ */
/* Clicks, keys, reading aloud                                         */
/* ------------------------------------------------------------------ */

function choose(k, v) {
  if (play.done || play.running || play.locked[k]) return;
  /* Answering a race shows that race on the picture. */
  if (play.p.kind === 'pair') play.lane = k;
  play.picks[k] = play.picks[k] === v ? null : v;
  play.msg = null;
  paintBoard();
  const btn = play.host.querySelector(`[data-tr-q="${k}"][data-tr-v="${v}"]`);
  if (btn) btn.focus();
}

function click(ev) {
  if (!play) return false;
  const opt = ev.target.closest('[data-tr-q]');
  if (opt) {
    const raw = opt.dataset.trV;
    choose(Number(opt.dataset.trQ), /^\d+$/.test(raw) ? Number(raw) : raw);
    return true;
  }
  const action = ev.target.closest('[data-action]');
  if (!action) return false;
  if (action.dataset.action === 'tr-go') { go(); return true; }
  if (action.dataset.action === 'tr-hint') { if (canHint()) hint(); return true; }
  return false;
}

const key = () => false;

function readAloud() {
  if (!play) return;
  const L = lang();
  const p = play.p;
  const parts = [askText(L), sceneLabel(L)];
  if (p.kind === 'gaps') p.qs.forEach((q) => parts.push(tt(`q.${q.type}`, L, { n: q.n })));
  say(parts);
}

const repaint = () => { if (play && !play.running) paintBoard(); };
const leave = () => stopMotion();

/* ------------------------------------------------------------------ */
/* Today's experiment                                                  */
/* ------------------------------------------------------------------ */

function dailyPuzzle(level, iso) {
  const list = T.CHAPTERS[level];
  const def = list[hash('train-daily', level, iso) % list.length];
  const p = T.makePuzzle(T.chapter(def.id), rngFor('train', 'daily', level, iso), T.TEACH + 8);
  return p && !T.problems(p).length ? { puzzle: { id: `daily-${iso}`, ...p }, chapterId: def.id } : null;
}

export default {
  id: 'train', bank, chapters, levelOfChapter, tileLabel, draw, repaint, click, key,
  say: readAloud, dailyPuzzle, leave
};
