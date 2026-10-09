/**
 * rooms/science/pond.js — Hippo Pond, drawn.
 *
 * Every experiment is the same beat: the child answers every question on the
 * cards (float or sink, how many rows, which layer), presses the big button,
 * and watches the pond do it. Then each card says what happened and why. A
 * wrong guess is a "Surprise!" with a 🤯, never a red cross, and it is
 * counted as one of the room's surprises.
 *
 * The scene is one SVG. The things are emoji in it, moved with CSS
 * transforms so they drop and bob; with reduced motion they are simply where
 * they end up. Every result is also written on its card in words, with ⬆ or
 * ⬇ and ✓ or 🤯, so nothing rides on colour or on seeing the animation.
 *
 * Only a "Make it float" experiment can be tried again on the spot: a wrong
 * change is shown not working, and the child picks another.
 */

import * as D from '../../modules/pondlogic.js';
import { pt, theItem, sizedName, fmtNum, fmtFrac } from '../../modules/pondtext.js';
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
    banks.set(level, fetch(`data/science/pond/${level}.json`, { cache: 'no-cache' }).then((res) => {
      if (!res.ok) throw new Error(`Could not load the ${level} pond experiments`);
      return res.json();
    }));
    banks.get(level).catch(() => banks.delete(level));
  }
  return banks.get(level);
}

const chapters = (level, L) => D.CHAPTERS[level].map((ch) => ({
  id: ch.id, icon: ch.icon, title: pt(`ch.${ch.id}`, L), idea: pt(`ch.${ch.id}.idea`, L)
}));
const levelOfChapter = (id) => (D.chapter(id) || {}).level || null;
const TILE_ICON = { tray: '🛁', same: '🪵', fix: '🛶', cubes: '🧊', depth: '📏', layers: '🍯', frac: '🏔️' };
const tileLabel = (p, L) => (p.teach ? { icon: '🎓', text: t('teach') } : { icon: TILE_ICON[p.kind], text: pt(`tile.${p.kind}`, L) });

/* ------------------------------------------------------------------ */
/* State                                                               */
/* ------------------------------------------------------------------ */

let play = null;
let timers = [];

function clearTimers() {
  timers.forEach((id) => clearTimeout(id));
  timers = [];
}

function draw(host, ctx) {
  clearTimers();
  const p = ctx.puzzle;
  const right = D.answers(p);
  play = {
    host, ctx, p, right,
    picks: right.map(() => null),
    tried: [],          // fix: the options already tried
    hinted: new Set(),  // which questions have had their hint
    hints: 0, wrong: 0,
    msg: null, done: false, splashed: false
  };
  paintBoard();
}

const L0 = () => lang();
const isFix = () => play.p.kind === 'fix';

/* ------------------------------------------------------------------ */
/* What each question is called and offers                             */
/* ------------------------------------------------------------------ */

/** The words for one choice of question k. */
function choiceText(k, v, L) {
  const p = play.p;
  switch (p.kind) {
    case 'tray': case 'same': case 'cubes': return v === 'float' ? `⬆ ${pt('floats', L)}` : `⬇ ${pt('sinks', L)}`;
    case 'depth': return v === 1 ? pt('row1', L) : pt('rows', L, { n: v });
    case 'fix': return pt(`fix.${p.opts[v]}`, L);
    case 'layers': return pt(`layer.${v}`, L);
    case 'frac': return `${String.fromCharCode(65 + v)} · ${fmtFrac(p.opts[v], L)}`;
    default: return String(v);
  }
}

/** What question k is about, for its card and for a screen reader. */
function subject(k, L, cap = true) {
  const p = play.p;
  switch (p.kind) {
    case 'tray': return theItem(p.items[k], L, cap);
    case 'same': return sizedName(p.item, p.ask[k], L, cap);
    case 'cubes': { const r = p.rafts[k]; return pt('raft', L, { n: k + 1, c: r.w * r.h, w: r.wt }); }
    case 'layers': return pt('block', L, { n: k + 1, d: fmtNum(p.blocks[k], L) });
    default: return '';
  }
}

/* ------------------------------------------------------------------ */
/* The scene                                                           */
/* ------------------------------------------------------------------ */

const W = 360;
const SKY = 96;          // the water's surface
const FLOOR = 214;       // the bottom of the pond
const EMOJI = [0, 24, 32, 42, 54, 68];   // font size by size class

/* Where a thing sits once it has settled: floaters with the part under the
   surface that their heaviness gives, sinkers on the bottom. */
function settleY(h, under, sinks) {
  if (sinks) return FLOOR - h / 2 - 2;
  return SKY + h * (Math.min(under, 0.92) - 0.5);
}

function pondSvg(inner, { liq = 'water', jar = false } = {}) {
  const L = L0();
  const label = pt(`liq.${liq}`, L);
  return `<svg class="cz-pond-svg${jar ? ' is-jar' : ''}" viewBox="0 0 ${W} 230" role="img" aria-label="${esc(label)}">
    <rect class="cz-pond-sky" x="0" y="0" width="${W}" height="${SKY}"/>
    <rect class="cz-pond-water is-${liq}" x="0" y="${SKY}" width="${W}" height="${230 - SKY}"/>
    <path class="cz-pond-wave" d="M0 ${SKY} q15 -5 30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0"/>
    <rect class="cz-pond-bed" x="0" y="${FLOOR}" width="${W}" height="${230 - FLOOR}"/>
    ${liq === 'water' ? '' : `<text class="cz-pond-liqname" x="8" y="${FLOOR - 8}">${esc(label)}</text>`}
    ${jar ? '' : `<text class="cz-pond-host" x="${W - 22}" y="${SKY + 4}" text-anchor="middle" aria-hidden="true">🦛</text>`}
    ${inner}
    <rect class="cz-pond-front is-${liq}" x="0" y="${SKY + 2}" width="${W}" height="${FLOOR - SKY - 2}"/>
  </svg>`;
}

/** One thing as a group the board can move: emoji, and its name for nobody (the card says it). */
const thing = (k, emoji, size, x, y) => `<g class="cz-pond-thing" data-pond-thing="${k}" data-x="${x}" data-y="${y}"
    data-style="transform:translate(${x}px,${y}px)"><text class="cz-pond-emoji" font-size="${size}" text-anchor="middle" dominant-baseline="central">${emoji}</text></g>`;

function sceneTray() {
  const p = play.p;
  const ids = p.kind === 'same' ? [p.item, ...p.ask.map(() => p.item)] : p.items;
  const n = ids.length;
  const step = W / (n + 1);
  return pondSvg(ids.map((id, k) => {
    const item = D.itemById(id);
    const size = p.kind === 'same' ? EMOJI[k === 0 ? p.shown : p.ask[k - 1]] : EMOJI[item.size];
    const x = step * (k + 1);
    /* Before the splash everything waits above the water; the tested one
       in "same stuff" is already where it settled. */
    const v = D.verdict(item, p.liq || 'water');
    const under = D.underOf(item, p.liq || 'water');
    const y = (p.kind === 'same' && k === 0) || play.splashed ? settleY(size, under, v === 'sink') : 44;
    return thing(k, item.emoji, size, x, y);
  }).join(''), { liq: p.liq || 'water' });
}

const CUBE = 20;

function raftSvg(w, h, wt, x, y, k, L) {
  const cells = [];
  for (let r = 0; r < h; r++) for (let c = 0; c < w; c++) {
    cells.push(`<rect class="cz-pond-cube" x="${c * CUBE - (w * CUBE) / 2}" y="${r * CUBE - (h * CUBE) / 2}" width="${CUBE - 2}" height="${CUBE - 2}" rx="3"/>`);
  }
  return `<g class="cz-pond-thing" data-pond-thing="${Math.max(k, 0)}" data-style="transform:translate(${x}px,${y}px)">
    ${cells.join('')}
    <text class="cz-pond-wt" x="0" y="${-(h * CUBE) / 2 - 8}" text-anchor="middle">${esc(k < 0 ? pt('weighs', L, { w: wt }) : pt('raftTag', L, { n: k + 1, w: wt }))}</text>
  </g>`;
}

function sceneRafts() {
  const L = L0();
  const p = play.p;
  const rafts = p.kind === 'cubes' ? p.rafts : [{ w: p.w, h: p.h, wt: p.wt }];
  const step = W / (rafts.length + 1);
  return pondSvg(rafts.map((r, k) => {
    const V = r.w * r.h;
    const hpx = r.h * CUBE;
    const y = play.splashed ? (r.wt < V ? SKY + hpx * (r.wt / V - 0.5) : FLOOR - hpx / 2 - 2) : 52 - hpx / 2 + 30;
    return raftSvg(r.w, r.h, r.wt, step * (k + 1), y, rafts.length > 1 ? k : -1, L);
  }).join(''));
}

/* The honey jar: three bands, each with its name and heaviness. */
const JAR = { top: 40, band: 52 };
function sceneJar() {
  const L = L0();
  const p = play.p;
  const bands = D.LAYERS.map((liq, i) => {
    const y = JAR.top + i * JAR.band;
    return `<rect class="cz-pond-layer is-${liq}" x="70" y="${y}" width="${W - 90}" height="${JAR.band}"/>
      <text class="cz-pond-layername" x="64" y="${y + JAR.band / 2 - 3}" text-anchor="end">${esc(pt(`short.${liq}`, L))}</text>
      <text class="cz-pond-layername" x="64" y="${y + JAR.band / 2 + 12}" text-anchor="end">${fmtNum(D.LIQUIDS[liq].d, L)}</text>`;
  }).join('');
  const n = p.blocks.length;
  const step = (W - 90) / (n + 1);
  const blocks = p.blocks.map((d, k) => {
    const at = play.splashed ? D.layerOf(d) : -1;
    /* A floater on the oil sits as deep in it as its heaviness says. */
    const y = at < 0 ? 18 : at === 3 ? JAR.top + 3 * JAR.band - 14
      : at === 0 ? JAR.top + 28 * (d / D.LIQUIDS.oil.d - 0.5) : JAR.top + at * JAR.band;
    return `<g class="cz-pond-thing" data-pond-thing="${k}" data-style="transform:translate(${70 + step * (k + 1)}px,${y}px)">
      <rect class="cz-pond-block" x="-16" y="-14" width="32" height="28" rx="5"/>
      <text class="cz-pond-blockn" x="0" y="5" text-anchor="middle">${fmtNum(d, L)}</text></g>`;
  }).join('');
  return `<svg class="cz-pond-svg is-jar" viewBox="0 0 ${W} ${JAR.top + 3 * JAR.band + 14}" role="img" aria-label="${esc(pt('ch.h2', L))}">
    ${bands}
    <rect class="cz-pond-jarwall" x="70" y="${JAR.top}" width="${W - 90}" height="${3 * JAR.band}" rx="6"/>
    ${blocks}
  </svg>`;
}

/* One tall block and the choices as marks down its side. */
function sceneFrac() {
  const L = L0();
  const p = play.p;
  const H = 84;
  const x = W / 2;
  const under = p.d / p.liqD;
  const y = play.splashed ? SKY + H * (under - 0.5) : SKY - H / 2 - 6;
  const ticks = p.opts.map((f, i) => {
    const ty = -H / 2 + H * (1 - f[0] / f[1]);
    return `<path class="cz-pond-tick" d="M24 ${ty} H40"/><text class="cz-pond-ticktext" x="44" y="${ty + 4}">${String.fromCharCode(65 + i)}</text>`;
  }).join('');
  return pondSvg(`<g class="cz-pond-thing" data-pond-thing="0" data-style="transform:translate(${x}px,${y}px)">
      <rect class="cz-pond-block${p.ice ? ' is-ice' : ''}" x="-24" y="${-H / 2}" width="48" height="${H}" rx="6"/>
      <text class="cz-pond-blockn" x="0" y="5" text-anchor="middle">${fmtNum(p.d, L)}</text>
      ${ticks}
    </g>`, { liq: p.liq });
}

/* "Make it float": the thing in the water where it is now, or where the
   chosen change has put it. */
function sceneFix() {
  const p = play.p;
  const item = D.itemById(p.item);
  const size = EMOJI[Math.min(item.size, 4)];
  const goalMet = play.done;
  const sinks = goalMet ? p.goal === 'sink' : p.goal === 'float';
  const under = goalMet && p.goal === 'float' ? 0.6 : 0.4;
  const emoji = goalMet && play.lastFix === 'boat' ? '🛶' : item.emoji;
  const extra = goalMet && play.lastFix === 'float' ? '<text x="26" y="-6" font-size="22">🛟</text>'
    : goalMet && play.lastFix === 'stone' ? '<text x="0" y="34" font-size="22" text-anchor="middle">🪨</text>' : '';
  const y = settleY(size, under, sinks);
  return pondSvg(`<g class="cz-pond-thing" data-pond-thing="0" data-style="transform:translate(${W / 2}px,${y}px)">
    <text class="cz-pond-emoji" font-size="${size}" text-anchor="middle" dominant-baseline="central">${emoji}</text>${extra}</g>`,
  { liq: goalMet && play.lastFix === 'salt' ? 'salty' : goalMet && play.lastFix === 'honey' ? 'honey' : 'water' });
}

function scene() {
  switch (play.p.kind) {
    case 'tray': case 'same': return sceneTray();
    case 'cubes': case 'depth': return sceneRafts();
    case 'layers': return sceneJar();
    case 'frac': return sceneFrac();
    case 'fix': return sceneFix();
    default: return '';
  }
}

/* ------------------------------------------------------------------ */
/* The water twin's balance                                            */
/* ------------------------------------------------------------------ */

/** A little balance: the thing on one pan, its water twin on the other. */
function twinSvg(item, L) {
  const v = D.verdict(item, 'water');
  const tilt = v === 'sink' ? -9 : 9;
  const label = pt(v === 'sink' ? 'twinHeavier' : 'twinLighter', L, { It: theItem(item.id, L, true) });
  return `<svg class="cz-pond-twin" viewBox="-12 0 164 78" role="img" aria-label="${esc(label)}">
    <path class="cz-pond-stand" d="M64 74 L70 40 L76 74 Z"/>
    <g data-style="transform:rotate(${tilt}deg);transform-origin:70px 40px">
      <path class="cz-pond-beam" d="M14 40 H126"/>
      <path class="cz-pond-pan" d="M6 40 q16 14 32 0"/>
      <path class="cz-pond-pan" d="M102 40 q16 14 32 0"/>
      <text x="22" y="30" font-size="24" text-anchor="middle">${item.emoji}</text>
      <path class="cz-pond-twinblob" d="M106 32 q12 -22 24 0 a12 9 0 0 1 -24 0 Z"/>
    </g>
    <text class="cz-pond-twinlabel" x="112" y="12" text-anchor="middle">${esc(pt('twinLabel', L))}</text>
  </svg>`;
}

/* ------------------------------------------------------------------ */
/* The cards                                                           */
/* ------------------------------------------------------------------ */

function cardPic(k, L) {
  const p = play.p;
  if (p.kind === 'tray') {
    const item = D.itemById(p.items[k]);
    const num = p.num ? `<span class="cz-pond-num">${fmtNum(D.shownDensity(item), L)}</span>` : '';
    return `<span class="cz-sci-pic" aria-hidden="true">${item.emoji}</span>${num}`;
  }
  if (p.kind === 'same') {
    const item = D.itemById(p.item);
    return `<span class="cz-sci-pic is-s${p.ask[k]}" aria-hidden="true">${item.emoji}</span>`;
  }
  return '';
}

function resultOf(k, L) {
  const p = play.p;
  const got = play.picks[k];
  const ok = got === play.right[k];
  const v = play.right[k];
  const subj = subject(k, L);
  const verb = (x) => pt(x === 'float' ? 'floatsV' : 'sinksV', L);
  let head;
  let why = '';
  switch (p.kind) {
    case 'tray': {
      const item = D.itemById(p.items[k]);
      head = ok ? pt('right', L, { It: subj, v: verb(v) }) : pt('surprise', L, { It: subj, v: verb(v) });
      if (p.num) {
        const d = D.shownDensity(item);
        why = pt('why.num', L, { d: fmtNum(d, L), l: fmtNum(D.LIQUIDS[p.liq].d, L), cmp: pt(v === 'float' ? 'less' : 'more', L), v: verb(v) });
      } else if (p.twin) why = pt(v === 'float' ? 'why.twinFloat' : 'why.twinSink', L);
      else if (v === 'float' && item.size >= 4) why = pt('why.floatBig', L);
      else if (v === 'sink' && item.size <= 2) why = pt('why.sinkSmall', L);
      else why = pt(v === 'float' ? 'why.float' : 'why.sink', L);
      if (item.fact) why += ` ${pt(`fact.${item.id}`, L)}`;
      break;
    }
    case 'same':
      head = ok ? pt('right', L, { It: subj, v: verb(v) }) : pt('surprise', L, { It: subj, v: verb(v) });
      why = pt('why.same', L, { v: pt(v === 'float' ? 'floatsV' : 'sinksV', L) });
      break;
    case 'cubes': {
      const r = p.rafts[k];
      const c = r.w * r.h;
      head = ok ? pt('right', L, { It: subj, v: verb(v) }) : pt('surprise', L, { It: subj, v: verb(v) });
      why = pt(v === 'float' ? 'why.cubeFloat' : 'why.cubeSink', L, { c, w: r.wt });
      break;
    }
    case 'depth': {
      const rows = choiceText(0, v, L);
      head = ok ? `✓ ${rows}` : `${t('surprise')} ${rows}.`;
      why = pt('why.depth', L, { w: p.wt, k: p.w, r: rows });
      break;
    }
    case 'layers': {
      const where = pt(`layer.${v}`, L);
      head = ok ? `✓ ${subj}: ${where}` : `${t('surprise')} ${subj}: ${where}`;
      why = pt('why.layer', L, { n: k + 1, d: fmtNum(p.blocks[k], L), where: where.toLowerCase() });
      break;
    }
    case 'frac': {
      const f = fmtFrac(p.opts[v], L);
      head = ok ? `✓ ${f}` : `${t('surprise')} ${f}`;
      why = p.ice ? pt('why.ice', L) : pt('why.frac', L, { d: fmtNum(p.d, L), l: fmtNum(p.liqD, L), f });
      break;
    }
    default: head = '';
  }
  return { ok, head, why };
}

/** One question's result on its card. */
function resultLine(k, L) {
  const { ok, head, why } = resultOf(k, L);
  return `<p class="cz-sci-result ${ok ? 'is-right' : 'is-surprise'}">
    ${ok ? '' : '<span class="cz-sci-wow" aria-hidden="true">🤯</span>'}<strong>${esc(head)}</strong>
    <span class="cz-sci-rwhy">${esc(why)}</span></p>`;
}

function questionCard(k, L) {
  const p = play.p;
  const opts = D.choices(p)[k];
  const name = subject(k, L);
  const picked = play.picks[k];
  const hinted = play.hinted.has(k) && !play.done ? hintFor(k, L) : '';
  const buttons = play.done ? '' : `<div class="cz-sci-opts" role="group" aria-label="${esc(name)}">
    ${opts.map((v) => `<button type="button" class="gp-btn cz-sci-opt${picked === v ? ' is-on' : ''}"
      aria-pressed="${picked === v}" data-pond-q="${k}" data-pond-v="${v}">${esc(choiceText(k, v, L))}</button>`).join('')}
  </div>`;
  const twin = p.kind === 'tray' && (p.twin || play.hinted.has(k)) && !p.num ? twinSvg(D.itemById(p.items[k]), L) : '';
  return `<li class="cz-sci-card${play.done ? (picked === play.right[k] ? ' is-right' : ' is-surprise') : ''}">
    ${name ? `<div class="cz-sci-cardhead">${cardPic(k, L)}<span class="cz-sci-cardname">${esc(name)}</span></div>` : ''}
    ${twin}
    ${hinted}
    ${buttons}
    ${play.done ? resultLine(k, L) : ''}
  </li>`;
}

/* The "same stuff" card that was already tested. */
function testedCard(L) {
  const p = play.p;
  const item = D.itemById(p.item);
  const v = D.verdict(item, 'water');
  return `<li class="cz-sci-card is-tested">
    <div class="cz-sci-cardhead"><span class="cz-sci-pic is-s${p.shown}" aria-hidden="true">${item.emoji}</span>
      <span class="cz-sci-cardname">${esc(sizedName(p.item, p.shown, L, true))}</span></div>
    <p class="cz-pond-tested">${v === 'float' ? '⬆' : '⬇'} ${esc(pt('tested', L, { v: pt(v === 'float' ? 'floatsV' : 'sinksV', L) }))}</p>
  </li>`;
}

/* ------------------------------------------------------------------ */
/* Hints                                                               */
/* ------------------------------------------------------------------ */

function hintFor(k, L) {
  const p = play.p;
  let text = '';
  switch (p.kind) {
    case 'tray': {
      const item = D.itemById(p.items[k]);
      if (p.num) {
        text = pt('hintNum', L, { d: fmtNum(D.shownDensity(item), L), l: fmtNum(D.LIQUIDS[p.liq].d, L) });
      } else return '';   // the balance itself is the hint
      break;
    }
    case 'same': text = pt('hintSame', L); break;
    case 'cubes': text = pt('hintCubes', L); break;
    case 'depth': text = pt('hintDepth', L, { w: p.wt, k: p.w }); break;
    case 'layers': text = pt('hintLayers', L, { d: fmtNum(p.blocks[k], L), oil: fmtNum(D.LIQUIDS.oil.d, L), water: fmtNum(D.LIQUIDS.water.d, L), honey: fmtNum(D.LIQUIDS.honey.d, L) }); break;
    case 'frac': text = pt('hintFrac', L, { d: fmtNum(p.d, L), l: fmtNum(p.liqD, L) }); break;
    case 'fix': text = pt('hintFix', L); break;
    default: return '';
  }
  return `<p class="cz-sci-hint"><span aria-hidden="true">💡</span> ${esc(text)}</p>`;
}

/* The next question that has not had a hint. A tray's hint puts that
   thing on the water twin's balance. */
function hint() {
  if (play.done) return;
  const n = play.right.length;
  if (play.p.kind === 'tray' && play.p.twin) return;
  for (let k = 0; k < n; k++) {
    if (!play.hinted.has(k)) {
      play.hinted.add(k);
      play.hints += 1;
      play.msg = null;
      paintBoard();
      return;
    }
  }
}

const canHint = () => !play.done && !(play.p.kind === 'tray' && play.p.twin)
  && play.hinted.size < play.right.length && !play.ctx.puzzle.teach;

/* ------------------------------------------------------------------ */
/* Painting                                                            */
/* ------------------------------------------------------------------ */

function askText(L) {
  const p = play.p;
  switch (p.kind) {
    case 'tray':
      if (p.num) return pt('ask.num', L, { Liq: pt(`liq.${p.liq}`, L), l: fmtNum(D.LIQUIDS[p.liq].d, L) });
      return pt(p.twin ? 'ask.twin' : 'ask.tray', L);
    case 'same': return pt('ask.same', L);
    case 'fix': return pt(p.goal === 'float' ? 'ask.fixFloat' : 'ask.fixSink', L, { It: theItem(p.item, L, true) });
    case 'cubes': return pt('ask.cubes', L);
    case 'depth': return pt('ask.depth', L);
    case 'layers': return pt('ask.layers', L);
    case 'frac': return pt('ask.frac', L, { d: fmtNum(p.d, L), Liq: pt(`liq.${p.liq}`, L), l: fmtNum(p.liqD, L) });
    default: return '';
  }
}

function fixCards(L) {
  const p = play.p;
  const opts = p.opts.map((o, i) => {
    const tried = play.tried.includes(i);
    const on = play.picks[0] === i;
    return `<button type="button" class="gp-btn cz-pond-fixopt${on ? ' is-on' : ''}${tried ? ' is-tried' : ''}"
      aria-pressed="${on}" data-pond-q="0" data-pond-v="${i}" ${tried || play.done ? 'disabled' : ''}>
      ${tried ? '<span aria-hidden="true">✗</span> ' : ''}${esc(pt(`fix.${o}`, L))}</button>`;
  }).join('');
  return `<div class="cz-pond-fixopts" role="group" aria-label="${esc(askText(L))}">${opts}</div>`;
}

function paintBoard() {
  const L = L0();
  const p = play.p;
  const n = play.right.length;
  const cards = p.kind === 'fix' ? fixCards(L)
    : p.kind === 'depth' || p.kind === 'frac'
      ? `<ol class="cz-sci-cards is-one">${questionCard(0, L)}</ol>`
      : `<ol class="cz-sci-cards">${p.kind === 'same' ? testedCard(L) : ''}${Array.from({ length: n }, (_, k) => questionCard(k, L)).join('')}</ol>`;
  const ready = play.picks.every((v) => v !== null);
  const goWord = p.kind === 'fix' ? t('go') : p.kind === 'layers' || p.kind === 'cubes' ? pt('drop', L) : pt('splash', L);
  const actions = play.done ? '' : `<div class="cz-sci-actions">
      <button type="button" class="gp-btn gp-btn--primary gp-btn--big cz-sci-go" data-action="pond-go" ${ready ? '' : 'aria-disabled="true"'}>${esc(goWord)}</button>
      ${canHint() ? `<button type="button" class="gp-btn gp-btn--ghost" data-action="pond-hint"><span aria-hidden="true">💡</span> ${esc(p.kind === 'tray' && !p.num ? pt('twinHint', L) : t('hint'))}</button>` : ''}
    </div>`;
  const fixHint = p.kind === 'fix' && play.hinted.has(0) && !play.done ? hintFor(0, L) : '';
  play.host.innerHTML = `<div class="cz-pond" lang="${L}">
    <p class="cz-sci-ask">${esc(askText(L))}</p>
    <div class="cz-pond-scene">${scene()}</div>
    ${cards}
    ${fixHint}
    ${actions}
    <div class="cz-sci-msg" aria-live="polite">${play.msg ? play.msg(L) : ''}</div>
  </div>`;
  paint();
}

/* ------------------------------------------------------------------ */
/* Splash                                                              */
/* ------------------------------------------------------------------ */

function go() {
  if (play.done) return;
  if (!play.picks.every((v) => v !== null)) {
    play.msg = (L) => `<p class="cz-sci-say">${esc(pt(isFix() ? 'pickOne' : 'pickAll', L))}</p>`;
    paintBoard();
    return;
  }
  if (isFix()) { tryFix(); return; }
  const wrong = play.picks.filter((v, k) => v !== play.right[k]).length;
  play.wrong = wrong;
  if (wrong) play.ctx.surprise(wrong);
  play.splashed = true;
  play.done = true;
  animate(() => finish());
}

function tryFix() {
  const i = play.picks[0];
  const p = play.p;
  const fix = p.opts[i];
  if (D.fixWorks(p, fix)) {
    play.lastFix = fix;
    play.done = true;
    animate(() => finish());
    return;
  }
  /* It does not work: say so, and why, and let the child pick again. */
  play.tried.push(i);
  play.wrong += 1;
  play.picks[0] = null;
  play.ctx.surprise(1);
  const whyKey = D.FIXES.never.includes(fix) ? 'why.fix.never' : null;
  play.msg = (L) => `<p class="cz-sci-surprise"><span class="cz-sci-surprise__icon" aria-hidden="true">🤯</span>
    <span><strong>${esc(t('surprise'))} ${esc(pt('still', L, { It: theItem(p.item, L, true), v: pt(p.goal === 'float' ? 'sinksV' : 'floatsV', L) }))}</strong>
    ${esc(whyKey ? pt(whyKey, L) : fixMiss(fix, L))}</span></p>`;
  paintBoard();
  bob();
}

/* Why a real change still was not enough here. */
function fixMiss(fix, L) {
  const p = play.p;
  const it = theItem(p.item, L);
  const It = theItem(p.item, L, true);
  if (p.goal === 'sink') return pt(fix === 'salt' ? 'miss.sinkSalt' : 'miss.sinkHoney', L, { it });
  return pt(fix === 'salt' ? 'miss.salt' : 'miss.honey', L, { It });
}

/* Redraw with everything in its final place, then (unless reduced motion)
   start each thing from above the water and let it fall into place. */
function animate(then) {
  paintBoard();
  const things = [...play.host.querySelectorAll('[data-pond-thing]')];
  if (calm() || !things.length) { then(); return; }
  const ends = things.map((el) => el.style.transform);
  things.forEach((el) => {
    el.classList.add('is-still');
    el.style.transform = el.style.transform.replace(/,\s*[-\d.]+px\)/, ',30px)');
  });
  /* One frame at the start position, then let the transition run. */
  requestAnimationFrame(() => requestAnimationFrame(() => {
    things.forEach((el, k) => {
      el.classList.remove('is-still');
      el.classList.add('is-falling');
      el.style.transitionDelay = `${k * 160}ms`;
      el.style.transform = ends[k];
    });
    const wave = play.host.querySelector('.cz-pond-scene');
    if (wave) wave.classList.add('is-splash');
  }));
  timers.push(setTimeout(then, 1100 + things.length * 160));
}

/* A small shake: the change was tried and nothing moved. */
function bob() {
  const el = play.host.querySelector('[data-pond-thing]');
  if (!el || calm()) return;
  el.classList.add('is-bob');
  timers.push(setTimeout(() => el.classList.remove('is-bob'), 700));
}

function finish() {
  const p = play.p;
  const teach = !!play.ctx.puzzle.teach;
  const stars = D.starsFor({ wrong: play.wrong, hints: play.hints, teach });
  if (play.wrong === 0) react('happy', 1800); else react('wow', 1800);
  if (isFix()) {
    const fix = play.lastFix;
    play.msg = (L) => `<p class="cz-sci-result is-right"><strong>✓ ${esc(pt('worked', L, { It: theItem(p.item, L, true), v: pt(p.goal === 'float' ? 'floatsV' : 'sinksV', L) }))}</strong>
      <span class="cz-sci-rwhy">${esc(pt(`why.fix.${fix}`, L, { it: theItem(p.item, L) }))}</span></p>`;
    paintBoard();
  }
  const chId = play.ctx.chapterId;
  play.ctx.onSolved({
    stars,
    why: (L) => [...(isFix() ? [] : play.right.map((_, k) => {
      const r = resultOf(k, L);
      return `${r.ok ? '' : '<span aria-hidden="true">🤯</span> '}<strong>${esc(r.head)}</strong> ${esc(r.why)}`;
    })), ...bigIdea(chId, L)],
    pic: p.kind === 'tray' && !p.num ? (L) => twinSvg(D.itemById(p.items.find((id) => D.verdict(D.itemById(id), p.liq) === 'sink') || p.items[0]), L) : null
  });
}

/** The chapter's big idea, said once more on the end card. */
function bigIdea(chId, L) {
  const idea = IDEAS.pond.find((i) => i.ch === chId);
  const lines = idea ? [`<strong>${esc(idea[L])}</strong> ${esc(idea.why[L])}`] : [];
  if (chId === 'e1') lines.push(esc(pt('why.idea.hippo', L)));
  return lines;
}

/* ------------------------------------------------------------------ */
/* Clicks, keys, reading aloud                                         */
/* ------------------------------------------------------------------ */

function choose(k, v) {
  if (play.done) return;
  if (isFix() && play.tried.includes(v)) return;
  play.picks[k] = play.picks[k] === v && !isFix() ? null : v;
  play.msg = null;
  paintBoard();
  const btn = play.host.querySelector(`[data-pond-q="${k}"][data-pond-v="${v}"]`);
  if (btn) btn.focus();
}

function click(ev) {
  if (!play) return false;
  const opt = ev.target.closest('[data-pond-q]');
  if (opt) {
    const k = Number(opt.dataset.pondQ);
    const raw = opt.dataset.pondV;
    const v = /^\d+$/.test(raw) ? Number(raw) : raw;
    choose(k, v);
    return true;
  }
  const action = ev.target.closest('[data-action]');
  if (!action) return false;
  switch (action.dataset.action) {
    case 'pond-go': go(); return true;
    case 'pond-hint':
      if (isFix()) {
        if (!play.hinted.has(0)) { play.hinted.add(0); play.hints += 1; paintBoard(); }
        return true;
      }
      hint();
      return true;
    default: return false;
  }
}

function key(ev) {
  if (!play || play.done) return false;
  if (ev.key === 'Enter' && ev.target.closest && ev.target.closest('.cz-pond') && !ev.target.closest('button')) {
    go();
    return true;
  }
  return false;
}

function readAloud() {
  if (!play) return;
  const L = lang();
  const parts = [askText(L)];
  const n = play.right.length;
  if (play.p.kind === 'fix') play.p.opts.forEach((o) => parts.push(pt(`fix.${o}`, L)));
  else for (let k = 0; k < n; k++) if (subject(k, L)) parts.push(subject(k, L));
  say(parts);
}

const repaint = () => { if (play) paintBoard(); };

function leave() {
  clearTimers();
}

/* ------------------------------------------------------------------ */
/* Today's experiment                                                  */
/* ------------------------------------------------------------------ */

/* Any chapter of the level, picked by the day, and made fresh. */
function dailyPuzzle(level, iso) {
  const list = D.CHAPTERS[level];
  const def = list[hash('pond-daily', level, iso) % list.length];
  const p = D.makePuzzle(D.chapter(def.id), rngFor('pond', 'daily', level, iso), D.TEACH + 5);
  return p && !D.problems(p).length ? { puzzle: { id: `daily-${iso}`, ...p }, chapterId: def.id } : null;
}

export default {
  id: 'pond', bank, chapters, levelOfChapter, tileLabel, draw, repaint, click, key,
  say: readAloud, dailyPuzzle, leave
};
