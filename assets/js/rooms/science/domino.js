/**
 * rooms/science/domino.js — Domino Zoo, drawn.
 *
 * A side view of zig-zag shelves. Dominoes show their height as pips (a 3
 * has three), ramps and fans show their way by shape and arrow, never by
 * colour. Go runs the machine one step at a time, a replay you can watch:
 * dominoes tip, the ball rolls and drops, the seesaw tips, the pulley lifts,
 * the fan blows the boat, and the bell rings. If it stops, a 🤯 marks the
 * place and a line says why (research 4.3: the replay is the analysis tool).
 *
 * Build puzzles keep going until the bell rings; Will it ring? and Where
 * will it stop? are one go.
 */

import * as D from '../../modules/dominologic.js';
import { dt, partName, pieceLabel } from '../../modules/dominotext.js';
import { hash, rngFor } from '../../modules/logicrng.js';
import { paint, react } from '../../modules/shell.js';
import { IDEAS } from '../../modules/sciencetext.js';
import { esc, lang, say, t } from './frame.js';

/* ------------------------------------------------------------------ */
/* The bank and the chapters                                           */
/* ------------------------------------------------------------------ */

const banks = new Map();

async function bank(level) {
  if (!banks.has(level)) {
    banks.set(level, fetch(`data/science/domino/${level}.json`, { cache: 'no-cache' }).then((res) => {
      if (!res.ok) throw new Error(`Could not load the ${level} machines`);
      return res.json();
    }));
    banks.get(level).catch(() => banks.delete(level));
  }
  return banks.get(level);
}

const chapters = (level, L) => D.CHAPTERS[level].map((ch) => ({
  id: ch.id, icon: ch.icon, title: dt(`ch.${ch.id}`, L), idea: dt(`ch.${ch.id}.idea`, L)
}));
const levelOfChapter = (id) => (D.chapter(id) || {}).level || null;
const tileLabel = (p, L) => (p.teach ? { icon: '🎓', text: t('teach') } : { icon: '🔔', text: dt(`tile.${p.kind}`, L) });

/* ------------------------------------------------------------------ */
/* State                                                               */
/* ------------------------------------------------------------------ */

let play = null;
let timer = null;

function draw(host, ctx) {
  clearTimeout(timer);
  const p = ctx.puzzle;
  play = {
    host, ctx, p,
    build: p.kind === 'build',
    right: D.answers(p),
    place: p.kind === 'build' ? p.gaps.map(() => null) : [],
    locked: p.kind === 'build' ? p.gaps.map(() => false) : [],
    sel: null,
    pick: null,
    run: null,         // { sim, frame } while or after the machine runs
    running: false,
    hint: 0, hints: 0, hintText: null, wrong: 0, done: false, msg: null
  };
  paintBoard();
}

const L0 = () => lang();
const fix = (s, L) => (L === 'es' ? s.replace(/\bde el\b/g, 'del').replace(/\ba el\b/g, 'al') : s);

/** The machine as it stands now: the puzzle's parts and the child's pieces. */
const machine = () => (play.build ? D.withPlacement(play.p, play.place) : play.p);

/* ------------------------------------------------------------------ */
/* Drawing                                                             */
/* ------------------------------------------------------------------ */

const CW = 56;
const BH = 110;
const PADX = 26;
const X = (c) => PADX + c * CW + CW / 2;
const SHELF = (r) => (r + 1) * BH - 14;
const LETTERS = ['A', 'B', 'C', 'D'];

/** What the replay has done by frame k. */
function stateAt(sim, k) {
  const st = { toppled: new Map(), ball: new Map(), tip: new Map(), lift: new Map(), blow: new Set(), boat: new Map(), rang: false };
  if (!sim) return st;
  for (const ev of sim.events.slice(0, k)) {
    if (ev.e === 'topple') st.toppled.set(ev.key, ev.dir);
    else if (ev.e === 'ball') st.ball.set(ev.key, ev);
    else if (ev.e === 'tip') st.tip.set(ev.key, ev);
    else if (ev.e === 'lift') st.lift.set(ev.key, ev);
    else if (ev.e === 'blow') st.blow.add(ev.key);
    else if (ev.e === 'sail') st.boat.set(ev.key, ev.c);
    else if (ev.e === 'ring') st.rang = true;
  }
  return st;
}

function domSvg(x, base, s, dir = 0, cls = '') {
  const h = s * 11;
  const w = 15;
  const pips = Array.from({ length: s }, (_, k) => `<circle class="cz-dm-pip" cx="${x}" cy="${(base - h + 5 + k * ((h - 10) / Math.max(1, s - 1))).toFixed(1)}" r="1.9"/>`).join('');
  const body = `<rect class="cz-dm-dom ${cls}" x="${x - w / 2}" y="${base - h}" width="${w}" height="${h}" rx="2"/>${s === 1 ? '' : pips}`;
  if (!dir) return `<g>${body}</g>`;
  /* Tipped over, about its bottom corner on the side it falls. */
  const px = x + (dir > 0 ? w / 2 : -w / 2);
  return `<g transform="rotate(${dir * 72} ${px} ${base})">${body}</g>`;
}

const ballSvg = (x, y) => `<g class="cz-dm-ball"><circle cx="${x}" cy="${y}" r="10"/><path d="M${x - 10} ${y} Q${x} ${y - 7} ${x + 10} ${y}"/></g>`;

function rampSvg(x, base, d, cls = '') {
  const x0 = x - CW / 2 + 3;
  const x1 = x + CW / 2 - 3;
  const pts = d > 0 ? `${x0},${base - 28} ${x0},${base} ${x1},${base}` : `${x1},${base - 28} ${x1},${base} ${x0},${base}`;
  return `<polygon class="cz-dm-ramp ${cls}" points="${pts}"/><text class="cz-dm-arrow" x="${x + (d > 0 ? 6 : -6)}" y="${base - 7}" text-anchor="middle">${d > 0 ? '↘' : '↙'}</text>`;
}

function fanSvg(x, base, d, on, cls = '') {
  const cy = base - 18;
  const blades = [0, 120, 240].map((a) => `<ellipse class="cz-dm-blade" cx="${x}" cy="${cy - 7}" rx="3.5" ry="7" transform="rotate(${a + (on ? 40 : 0)} ${x} ${cy})"/>`).join('');
  const wind = on ? [0, 1, 2].map((k) => `<path class="cz-dm-wind" d="M${x + d * (18 + k * 8)} ${cy - 8 + k * 8} h${d * 16}"/>`).join('') : '';
  return `<g class="cz-dm-fan ${cls}"><rect x="${x - 4}" y="${cy}" width="8" height="${base - cy}"/>
    <circle class="cz-dm-fanring" cx="${x}" cy="${cy}" r="14"/>${blades}<circle class="cz-dm-hub" cx="${x}" cy="${cy}" r="3"/>
    <rect class="cz-dm-switch" x="${x - 6}" y="${cy - 20}" width="12" height="5" rx="2"/>
    <text class="cz-dm-arrow" x="${x + d * 20}" y="${cy + 18}" text-anchor="middle">${d > 0 ? '→' : '←'}</text>${wind}</g>`;
}

function seesawSvg(c, base, tip, cls = '') {
  const xm = X(c + 1);
  const L = CW * 1.4;
  const down = tip ? (tip.down < tip.up ? -1 : 1) : 0;
  const ang = down * 14;
  return `<g class="${cls}"><polygon class="cz-dm-pivot" points="${xm - 9},${base} ${xm + 9},${base} ${xm},${base - 14}"/>
    <g transform="rotate(${ang} ${xm} ${base - 16})"><rect class="cz-dm-plank" x="${xm - L}" y="${base - 19}" width="${2 * L}" height="6" rx="3"/></g></g>`;
}

function pulleySvg(c, r, base, lift, cls = '') {
  const xa = X(c);
  const xb = X(c + 2);
  const top = r * BH + 14;
  const off = (col) => {
    if (!lift) return 0;
    return col === lift.up ? -44 : 14;
  };
  const ya = base - 18 + off(c);
  const yb = base - 18 + off(c + 2);
  const bucket = (x, y) => `<path class="cz-dm-bucket" d="M${x - 13} ${y} H${x + 13} L${x + 9} ${y + 16} H${x - 9} Z"/>`;
  return `<g class="${cls}"><circle class="cz-dm-wheel" cx="${X(c + 1)}" cy="${top}" r="9"/>
    <path class="cz-dm-rope" d="M${xa} ${ya} V${top} H${xb} V${yb}"/>${bucket(xa, ya)}${bucket(xb, yb)}</g>`;
}

const bellSvg = (x, y, rang) => `<text class="cz-dm-bell${rang ? ' is-rung' : ''}" x="${x}" y="${y}" font-size="24" text-anchor="middle" dominant-baseline="central">🔔</text>${rang ? `<text class="cz-dm-ding" x="${x + 18}" y="${y - 16}" text-anchor="middle">♪</text>` : ''}`;

function partSvg(q, st, cls = '') {
  const key = D.keyOf(q);
  const base = SHELF(q.r);
  switch (q.t) {
    case 'dom': return domSvg(X(q.c), base, q.s, st.toppled.get(key) || 0, cls);
    case 'ball': {
      const at = st.ball.get(key);
      if (at) {
        const y = at.air ? SHELF(at.r) - 40 : SHELF(at.r) - (D.partAt(machine(), at.r, at.c) && D.partAt(machine(), at.r, at.c).t === 'ramp' ? 26 : 10);
        return `<g class="${cls}">${ballSvg(X(at.c), at.splash ? SHELF(at.r) + 2 : y)}</g>`;
      }
      return `<g class="${cls}">${ballSvg(X(q.c), base - 10)}</g>`;
    }
    case 'ramp': return rampSvg(X(q.c), base, q.d, cls);
    case 'fan': return fanSvg(X(q.c), base, q.d, st.blow.has(key), cls);
    case 'boat': {
      const c = st.boat.has(key) ? st.boat.get(key) : q.c;
      return `<text class="${cls}" x="${X(c)}" y="${base - 12}" font-size="24" text-anchor="middle" dominant-baseline="central">⛵</text>`;
    }
    case 'pond': return `<path class="cz-dm-pond" d="M${X(q.c) - CW / 2} ${base - 4} h${CW} v10 h${-CW} Z"/>`;
    case 'seesaw': return seesawSvg(q.c, base, st.tip.get(key), cls);
    case 'pulley': return pulleySvg(q.c, q.r, base, st.lift.get(key), cls);
    case 'bell': {
      if (q.hang) {
        const y = base - 30 - q.hang * 26;
        return `<path class="cz-dm-rope" d="M${X(q.c)} ${q.r * BH + 4} V${y - 10}"/>${bellSvg(X(q.c), y, st.rang)}`;
      }
      return bellSvg(X(q.c), base - 14, st.rang);
    }
    default: return '';
  }
}

function sceneSvg(L) {
  const p = play.p;
  const m = machine();
  const sim = play.run ? play.run.sim : null;
  const st = stateAt(sim, play.run ? play.run.frame : 0);
  const Wpx = PADX * 2 + D.W * CW;
  const Hpx = p.rows * BH + 4;
  const parts = [];
  /* Shelves, with the hole at the far end of each but the last. */
  for (let r = 0; r < p.rows; r++) {
    const hole = D.holeOf(p, r);
    const y = SHELF(r);
    const x0 = PADX + (hole === 0 ? CW : 0);
    const x1 = PADX + D.W * CW - (hole === D.W - 1 ? CW : 0);
    parts.push(`<rect class="cz-dm-shelf" x="${x0}" y="${y}" width="${x1 - x0}" height="7" rx="3"/>`);
    parts.push(`<text class="cz-dm-way" x="${(x0 + x1) / 2}" y="${y + 18}" text-anchor="middle">${D.dirOf(r) > 0 ? '→ → →' : '← ← ←'}</text>`);
  }
  /* The meerkat's finger at the start. */
  parts.push(`<text x="${PADX - 12}" y="${SHELF(0) - 16}" font-size="18" text-anchor="middle" dominant-baseline="central">👉</text>`);
  /* Ponds first, then everything else. */
  const placedKeys = new Set();
  if (play.build) {
    play.place.forEach((x, g) => {
      if (!x) return;
      const gap = p.gaps[g];
      const q = m.parts.find((z) => z.r === gap.r && z.c === gap.c && !z.hang && z.t !== 'pond');
      if (q) placedKeys.add(D.keyOf(q));
    });
  }
  const order = (q) => (q.t === 'pond' ? 0 : q.t === 'boat' ? 2 : 1);
  for (const q of m.parts.slice().sort((a, b) => order(a) - order(b))) {
    parts.push(partSvg(q, st, placedKeys.has(D.keyOf(q)) ? 'is-placed' : ''));
  }
  /* Gaps: dotted, tappable while building. */
  if (play.build) {
    p.gaps.forEach((gap, g) => {
      const w = gap.w * CW - 6;
      const x = PADX + gap.c * CW + 3;
      const y = gap.r * BH + 8;
      const h = BH - 22;
      const filled = !!play.place[g];
      const label = gapLabel(g, L);
      const box = `<rect class="cz-dm-gap${filled ? ' is-filled' : ''}${play.locked[g] ? ' is-locked' : ''}" x="${x}" y="${y}" width="${w}" height="${h}" rx="10"/>
        ${filled ? '' : `<text class="cz-dm-q" x="${x + w / 2}" y="${y + h / 2}" text-anchor="middle" dominant-baseline="central">?</text>`}`;
      parts.push(play.done || play.running || play.locked[g]
        ? `<g role="img" aria-label="${esc(label)}">${box}</g>`
        : `<g class="cz-dm-tap" data-dm-gap="${g}" role="button" tabindex="0" aria-label="${esc(label)}">${box}</g>`);
    });
  }
  /* Letters for Where will it stop? */
  if (p.kind === 'stop') {
    p.opts.forEach((key, k) => {
      const q = p.parts.find((z) => D.keyOf(z) === key);
      if (!q) return;
      const x = wide(q) ? X(q.c + 1) : X(q.c);
      /* Just above the part, where it stood at the start. */
      const tall = { dom: (q.s || 2) * 11, ball: 20, fan: 42, boat: 26, seesaw: 22, pulley: 30, bell: 28 }[q.t] || 24;
      const y = Math.max(q.r * BH + 12, SHELF(q.r) - tall - 14);
      parts.push(`<g class="cz-dm-letter"><circle cx="${x}" cy="${y}" r="10"/><text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central">${LETTERS[k]}</text></g>`);
    });
  }
  /* Where it stopped. */
  if (sim && !sim.rang && play.run.frame >= sim.events.length && sim.stop) {
    const s = sim.stop;
    parts.push(`<text x="${X(Math.max(0, Math.min(D.W - 1, s.c)))}" y="${SHELF(s.r) - 58}" font-size="20" text-anchor="middle" dominant-baseline="central">🤯</text>`);
  }
  return `<svg class="cz-dm-svg" viewBox="0 0 ${Wpx} ${Hpx}" role="group" aria-label="${esc(dt(`ask.${p.kind}`, L))}">${parts.join('')}</svg>`;
}

const wide = (q) => D.wide(q.t);

function gapLabel(g, L) {
  const x = play.place[g];
  const n = dt('gapN', L, { n: g + 1 });
  if (!x) return `${n}: ${dt('empty', L)}`;
  return `${n}: ${pieceText(play.p.tray[x.k], x.d, L)}`;
}

function pieceText(piece, d, L) {
  const label = pieceLabel(piece, L);
  if (piece.t === 'ramp') return dt('sloping', L, { part: label, way: dt(`way.${d}`, L) });
  if (piece.t === 'fan') return dt('facing', L, { part: label, way: dt(`way.${d}`, L) });
  return label;
}

/* ------------------------------------------------------------------ */
/* The tray                                                            */
/* ------------------------------------------------------------------ */

function pieceIcon(piece) {
  const x = 22;
  const base = 38;
  let body = '';
  switch (piece.t) {
    case 'dom': body = `<g transform="translate(${x} ${base}) scale(${piece.s === 6 ? 0.55 : 0.8}) translate(${-x} ${-base})">${domSvg(x, base, piece.s)}</g>`; break;
    case 'ball': body = ballSvg(x, base - 10); break;
    case 'ramp': body = `<polygon class="cz-dm-ramp" points="6,${base - 22} 6,${base} 38,${base}"/>`; break;
    case 'fan': body = `<circle class="cz-dm-fanring" cx="${x}" cy="${base - 18}" r="13"/>${[0, 120, 240].map((a) => `<ellipse class="cz-dm-blade" cx="${x}" cy="${base - 25}" rx="3.5" ry="7" transform="rotate(${a} ${x} ${base - 18})"/>`).join('')}`; break;
    case 'seesaw': body = `<polygon class="cz-dm-pivot" points="${x - 7},${base} ${x + 7},${base} ${x},${base - 11}"/><rect class="cz-dm-plank" x="2" y="${base - 15}" width="40" height="5" rx="2"/>`; break;
    case 'pulley': body = `<circle class="cz-dm-wheel" cx="${x}" cy="8" r="6"/><path class="cz-dm-rope" d="M8 ${base - 10} V8 H36 V${base - 18}"/><path class="cz-dm-bucket" d="M0 ${base - 10} H16 L13 ${base} H3 Z"/><path class="cz-dm-bucket" d="M28 ${base - 18} H44 L41 ${base - 8} H31 Z"/>`; break;
    default: body = '';
  }
  return `<svg class="cz-dm-icon" viewBox="0 0 44 44" aria-hidden="true">${body}</svg>`;
}

function trayHtml(L) {
  const p = play.p;
  const usedBy = new Map();
  play.place.forEach((x, g) => { if (x) usedBy.set(x.k, g); });
  return `<div class="cz-dm-tray" role="group" aria-label="${esc(dt('tray', L))}">
    ${p.tray.map((piece, k) => {
      const used = usedBy.has(k);
      const on = play.sel === k;
      return `<button type="button" class="gp-btn cz-dm-piece${on ? ' is-on' : ''}${used ? ' is-used' : ''}" aria-pressed="${on}" data-dm-tray="${k}"${play.done || play.running ? ' disabled' : ''}>
        ${pieceIcon(piece)}<span>${esc(pieceLabel(piece, L))}</span></button>`;
    }).join('')}</div>`;
}

/* ------------------------------------------------------------------ */
/* Questions (Will it ring? Where will it stop?)                       */
/* ------------------------------------------------------------------ */

function choices() {
  return play.p.kind === 'ring' ? ['yes', 'no'] : play.p.opts.map((_, k) => k);
}

const choiceText = (v, L) => (play.p.kind === 'ring' ? dt(v, L) : dt('partX', L, { x: LETTERS[v], part: optName(v, L) }));
const resultText = (L) => (play.p.kind === 'ring' ? dt(`res.${play.right[0]}`, L) : dt('res.stop', L, { x: LETTERS[play.right[0]], part: optName(play.right[0], L) }));

/** The name of the part behind a letter: "ball", "tall domino (4)". */
function optName(k, L) {
  const q = play.p.parts.find((z) => D.keyOf(z) === play.p.opts[k]);
  if (!q) return '';
  return L === 'es' ? partName(q.t, L, { s: q.s }) : pieceLabel(q.t === 'dom' ? { t: 'dom', s: q.s } : { t: q.t }, L).toLowerCase();
}

function askCards(L) {
  const picked = play.pick;
  const ok = play.done ? picked === play.right[0] : null;
  const buttons = play.done ? '' : `<div class="cz-sci-opts cz-dm-opts" role="group" aria-label="${esc(dt(`ask.${play.p.kind}`, L))}">
    ${choices().map((v) => `<button type="button" class="gp-btn cz-sci-opt${picked === v ? ' is-on' : ''}" aria-pressed="${picked === v}" data-dm-v="${v}"${play.running ? ' disabled' : ''}>${esc(choiceText(v, L))}</button>`).join('')}</div>`;
  const result = play.done ? `<p class="cz-sci-result ${ok ? 'is-right' : 'is-surprise'}">
    ${ok ? '' : '<span class="cz-sci-wow" aria-hidden="true">🤯</span>'}<strong>${esc(ok ? dt('right', L, { res: resultText(L) }) : dt('surprise', L, { res: resultText(L) }))}</strong>
    <span class="cz-sci-rwhy">${esc(endWhy(L))}</span></p>` : '';
  return `<ol class="cz-sci-cards is-one"><li class="cz-sci-card${ok === true ? ' is-right' : ok === false ? ' is-surprise' : ''}">${buttons}${result}</li></ol>`;
}

/** Why the machine stopped (or that it rang). */
function stopWhy(sim, L) {
  if (sim.rang) return dt('rang', L);
  const s = sim.stop;
  const part = s.part ? (L === 'es' ? partName(s.part, L) : dt(`p.${s.part}`, L)) : '';
  const Part = s.part ? partName(s.part, L, { cap: true }) : '';
  return fix(dt(`why.${s.why}`, L, { part, Part, from: s.from, to: s.to, max: s.from ? D.maxTopple(s.from) : '' }), L);
}

function endWhy(L) {
  const sim = play.run ? play.run.sim : D.simulate(play.p);
  return stopWhy(sim, L);
}

/* ------------------------------------------------------------------ */
/* Painting                                                            */
/* ------------------------------------------------------------------ */

const canHint = () => !play.done && !play.running && !play.ctx.puzzle.teach && play.hint < (play.build ? 2 : 1);

function paintBoard() {
  const L = L0();
  const p = play.p;
  const actions = play.done ? '' : `<div class="cz-sci-actions">
      <button type="button" class="gp-btn gp-btn--primary gp-btn--big cz-sci-go" data-action="dm-go"${play.running ? ' disabled' : ''}>${esc(dt('go', L))}</button>
      ${canHint() ? `<button type="button" class="gp-btn gp-btn--ghost" data-action="dm-hint"><span aria-hidden="true">💡</span> ${esc(play.hint ? t('hintMore') : t('hint'))}</button>` : ''}
      ${play.build && !play.running && play.place.some((x, g) => x && !play.locked[g]) ? `<button type="button" class="gp-btn gp-btn--ghost" data-action="dm-clear">${esc(dt('clear', L))}</button>` : ''}
    </div>`;
  play.host.innerHTML = `<div class="cz-dm" lang="${L}">
    <p class="cz-sci-ask">${esc(dt(`ask.${p.kind}`, L))}</p>
    ${play.build ? `<p class="cz-sci-help">${esc(dt('ask.buildHow', L))}</p>` : ''}
    <div class="cz-dm-scene">${sceneSvg(L)}</div>
    ${play.build ? trayHtml(L) : askCards(L)}
    ${play.hintText ? `<p class="cz-sci-hint"><span aria-hidden="true">💡</span> ${esc(play.hintText(L))}</p>` : ''}
    ${actions}
    <div class="cz-sci-msg" aria-live="polite">${play.msg ? play.msg(L) : ''}</div>
  </div>`;
  paint();
}

/* ------------------------------------------------------------------ */
/* Building                                                            */
/* ------------------------------------------------------------------ */

function edited() {
  play.run = null;
  play.msg = null;
}

function tapTray(k) {
  if (play.done || play.running) return;
  play.sel = play.sel === k ? null : k;
  edited();
  if (play.sel !== null) {
    const piece = play.p.tray[k];
    play.msg = (L) => `<p class="cz-sci-say">${esc(fix(dt('picked', L, { part: L === 'es' ? partName(piece.t, L, { s: piece.s }) : pieceLabel(piece, L).toLowerCase() }), L))}</p>`;
  }
  paintBoard();
  const el = play.host.querySelector(`[data-dm-tray="${k}"]`);
  if (el) el.focus();
}

function tapGap(g) {
  if (play.done || play.running || play.locked[g]) return;
  const p = play.p;
  edited();
  if (play.sel !== null) {
    const piece = p.tray[play.sel];
    if (!D.fits(piece, p.gaps[g])) {
      play.msg = (L) => `<p class="cz-sci-say">${esc(fix(dt('noFit', L, { part: L === 'es' ? partName(piece.t, L, { s: piece.s }) : pieceLabel(piece, L).toLowerCase() }), L))}</p>`;
    } else {
      /* A piece can be in one gap only: moving it empties the old one. */
      play.place = play.place.map((x, j) => (x && x.k === play.sel && !play.locked[j] ? null : x));
      play.place[g] = { k: play.sel, d: 1 };
      play.sel = null;
    }
  } else if (play.place[g]) {
    const x = play.place[g];
    if (D.orientable(p.tray[x.k].t)) play.place[g] = { ...x, d: -x.d };
    else play.place[g] = null;
  } else {
    play.msg = (L) => `<p class="cz-sci-say">${esc(dt('pickFirst', L))}</p>`;
  }
  paintBoard();
  const el = play.host.querySelector(`[data-dm-gap="${g}"]`);
  if (el) el.focus();
}

/* ------------------------------------------------------------------ */
/* Go: run the machine, one step at a time                             */
/* ------------------------------------------------------------------ */

const STEP_MS = 300;

function animate(sim, onEnd) {
  play.run = { sim, frame: 0 };
  play.running = true;
  play.msg = (L) => `<p class="cz-sci-say">${esc(dt('watching', L))}</p>`;
  const total = sim.events.length;
  const tick = () => {
    if (!play || play.run === null || play.run.sim !== sim) return;
    /* A hidden page does not draw: jump to the end. */
    if (typeof document !== 'undefined' && document.hidden) play.run.frame = total;
    else play.run.frame += 1;
    if (play.run.frame >= total) {
      play.run.frame = total;
      play.running = false;
      onEnd();
      return;
    }
    paintBoard();
    timer = setTimeout(tick, STEP_MS);
  };
  paintBoard();
  timer = setTimeout(tick, STEP_MS);
}

function go() {
  if (play.done || play.running) return;
  if (!play.build && play.pick === null) {
    play.msg = (L) => `<p class="cz-sci-say">${esc(dt('pickAll', L))}</p>`;
    paintBoard();
    return;
  }
  play.sel = null;
  play.hintText = null;
  const sim = D.simulate(machine());
  animate(sim, () => (play.build ? judgeBuild(sim) : judgeAsk()));
}

function judgeBuild(sim) {
  if (sim.rang) { finish(sim); return; }
  play.wrong += 1;
  play.ctx.surprise(1);
  react('wow', 1600);
  play.msg = (L) => `<p class="cz-sci-surprise"><span class="cz-sci-surprise__icon" aria-hidden="true">🤯</span><span>
    <strong>${esc(dt('notYet', L, { why: stopWhy(sim, L) }))}</strong> ${esc(dt('tryMore', L))}</span></p>`;
  paintBoard();
}

function judgeAsk() {
  const wrong = play.pick === play.right[0] ? 0 : 1;
  play.wrong = wrong;
  if (wrong) { play.ctx.surprise(1); react('wow', 1600); }
  finish(play.run.sim);
}

/** The rule lines a machine uses: chain and energy always, then its parts. */
function ruleLines(m, L) {
  const has = (tt) => m.parts.some((q) => q.t === tt);
  const doms = m.parts.filter((q) => q.t === 'dom');
  const lines = [dt('rule.chain', L)];
  if (new Set(doms.map((q) => q.s)).size > 1) lines.push(dt('rule.size', L));
  if (doms.length) lines.push(dt('rule.energy', L));
  if (has('ramp')) lines.push(dt('rule.ramp', L));
  if (has('seesaw')) lines.push(dt('rule.seesaw', L));
  if (has('pulley')) lines.push(dt('rule.pulley', L));
  if (has('fan')) lines.push(dt('rule.fan', L));
  return lines;
}

function finish(sim) {
  play.done = true;
  if (!play.wrong) react('happy', 1800);
  if (play.build) play.msg = (L) => `<p class="cz-sci-result is-right"><strong>${esc(dt('rang', L))}</strong></p>`;
  else play.msg = null;
  paintBoard();
  const chId = play.ctx.chapterId;
  const m = machine();
  play.ctx.onSolved({
    stars: D.starsFor({ wrong: play.wrong, hints: play.hints, teach: !!play.ctx.puzzle.teach }),
    why: (L) => {
      const lines = [];
      if (!play.build) {
        const ok = play.pick === play.right[0];
        lines.push(`${ok ? '' : '<span aria-hidden="true">🤯</span> '}<strong>${esc(ok ? dt('right', L, { res: resultText(L) }) : dt('surprise', L, { res: resultText(L) }))}</strong> ${esc(stopWhy(sim, L))}`);
      }
      lines.push(...ruleLines(m, L).map(esc));
      const idea = IDEAS.domino.find((i) => i.ch === chId);
      if (idea) lines.push(`<strong>${esc(idea[L])}</strong> ${esc(idea.why[L])}`);
      return lines;
    }
  });
}

/* ------------------------------------------------------------------ */
/* Hints                                                               */
/* ------------------------------------------------------------------ */

function hintKey() {
  const ch = D.chapter(play.ctx.chapterId) || {};
  if (!play.build) return 'hintFollow';
  if (ch.mode === 'size') return 'hintSize';
  if (ch.mode === 'ramp') return 'hintRamp';
  if (ch.mode === 'finish') return 'hintFinish';
  return 'hintGap';
}

function hint() {
  play.hint += 1;
  play.hints += 1;
  edited();
  if (!play.build || play.hint === 1) {
    if (!play.build) play.hint = 1;
    const k = hintKey();
    play.hintText = (L) => dt(k, L);
    paintBoard();
    return;
  }
  /* The second hint puts one right piece in its gap, the right way round, and locks it. */
  const sol = play.right;
  const g = sol.findIndex((x, j) => x && !play.locked[j] && !(play.place[j] && D.samePiece(play.p.tray[play.place[j].k], play.p.tray[x.k]) && (!D.orientable(play.p.tray[x.k].t) || play.place[j].d === x.d)));
  if (g < 0) return;
  const want = sol[g];
  /* Any tray piece just like the right one will do. */
  const k = play.p.tray.findIndex((q, j) => D.samePiece(q, play.p.tray[want.k]) && !play.place.some((x, i) => x && x.k === j && play.locked[i]));
  play.place = play.place.map((x) => (x && x.k === k ? null : x));
  play.place[g] = { k, d: want.d };
  play.locked[g] = true;
  play.hintText = (L) => dt('hintPlace', L);
  paintBoard();
}

/* ------------------------------------------------------------------ */
/* Clicks, keys, reading aloud                                         */
/* ------------------------------------------------------------------ */

function click(ev) {
  if (!play) return false;
  const gap = ev.target.closest('[data-dm-gap]');
  if (gap) { tapGap(Number(gap.dataset.dmGap)); return true; }
  const tray = ev.target.closest('[data-dm-tray]');
  if (tray) { tapTray(Number(tray.dataset.dmTray)); return true; }
  const v = ev.target.closest('[data-dm-v]');
  if (v && !play.done && !play.running) {
    const raw = v.dataset.dmV;
    const val = /^\d+$/.test(raw) ? Number(raw) : raw;
    play.pick = play.pick === val ? null : val;
    play.msg = null;
    paintBoard();
    const el = play.host.querySelector(`[data-dm-v="${raw}"]`);
    if (el) el.focus();
    return true;
  }
  const action = ev.target.closest('[data-action]');
  if (!action) return false;
  switch (action.dataset.action) {
    case 'dm-go': go(); return true;
    case 'dm-hint': if (canHint()) hint(); return true;
    case 'dm-clear':
      if (play.running) return true;
      play.place = play.place.map((x, g) => (play.locked[g] ? x : null));
      play.sel = null;
      edited();
      paintBoard();
      return true;
    default: return false;
  }
}

function key(ev) {
  if (!play || play.done || play.running) return false;
  const gap = ev.target.closest && ev.target.closest('[data-dm-gap]');
  if (gap && (ev.key === 'Enter' || ev.key === ' ')) {
    ev.preventDefault();
    tapGap(Number(gap.dataset.dmGap));
    return true;
  }
  return false;
}

function readAloud() {
  if (!play) return;
  const L = lang();
  const parts = [dt(`ask.${play.p.kind}`, L)];
  if (play.build) parts.push(dt('ask.buildHow', L), `${dt('tray', L)}: ${play.p.tray.map((q) => pieceLabel(q, L)).join(', ')}`);
  say(parts);
}

const repaint = () => { if (play) paintBoard(); };

/* ------------------------------------------------------------------ */
/* Today's experiment                                                  */
/* ------------------------------------------------------------------ */

function dailyPuzzle(level, iso) {
  const list = D.CHAPTERS[level];
  const def = list[hash('domino-daily', level, iso) % list.length];
  const p = D.makePuzzle(D.chapter(def.id), rngFor('domino', 'daily', level, iso), D.TEACH + 8);
  return p && !D.problems(p).length ? { puzzle: { id: `daily-${iso}`, ...p }, chapterId: def.id } : null;
}

export default {
  id: 'domino', bank, chapters, levelOfChapter, tileLabel, draw, repaint, click, key,
  say: readAloud, dailyPuzzle
};
