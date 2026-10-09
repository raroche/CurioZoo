/**
 * rooms/science/firefly.js — Firefly Circuits, drawn.
 *
 * One SVG grid: wires, the eel battery (a + end and a − end, told apart by
 * shape and sign), fireflies with two feet, wooden sticks, switches, rocks
 * and empty squares to fill. Build puzzles have a tray of pieces under the
 * board; tap a piece, tap a square, tap a placed piece to turn it.
 *
 * The dots follow the research's honesty rules (research-circuits-
 * magnets.md 1.4): every wire is full of dots before Go; on Go they all start
 * at once; they move only where current flows, at a speed that follows the
 * current, and just as fast after a firefly as before it. Brightness is the
 * firefly's glow and rays, never dots that fade. A short circuit makes the
 * shortcut's dots race and every firefly sleep, with a warning shape and the
 * safety line. With reduced motion the dots stand still and small arrows
 * show the way they would move.
 */

import * as F from '../../modules/fireflylogic.js';
import { ft, tierWord } from '../../modules/fireflytext.js';
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
    banks.set(level, fetch(`data/science/firefly/${level}.json`, { cache: 'no-cache' }).then((res) => {
      if (!res.ok) throw new Error(`Could not load the ${level} circuits`);
      return res.json();
    }));
    banks.get(level).catch(() => banks.delete(level));
  }
  return banks.get(level);
}

const chapters = (level, L) => F.CHAPTERS[level].map((ch) => ({
  id: ch.id, icon: ch.icon, title: ft(`ch.${ch.id}`, L), idea: ft(`ch.${ch.id}.idea`, L)
}));
const levelOfChapter = (id) => (F.chapter(id) || {}).level || null;
const tileLabel = (p, L) => (p.teach ? { icon: '🎓', text: t('teach') } : { icon: p.kind === 'build' ? '🔌' : '❓', text: ft(`tile.${p.kind}`, L) });

/* ------------------------------------------------------------------ */
/* State                                                               */
/* ------------------------------------------------------------------ */

let play = null;

function draw(host, ctx) {
  const p = ctx.puzzle;
  const slots = p.board.cells.map((c, i) => (c && c.t === '?' ? i : -1)).filter((i) => i >= 0);
  play = {
    host, ctx, p, slots,
    placed: slots.map(() => null),   // { tray: index, m: mask } per slot
    locked: slots.map(() => false),  // placed by a hint
    sel: null,                       // the tray piece picked up
    picks: p.kind === 'predict' ? F.fireflyIds(p.board).map(() => null) : [],
    res: null,                       // the last Go's solved circuit
    hints: 0, hint: 0, wrong: 0, done: false, msg: null
  };
  paintBoard();
}

const L0 = () => lang();
const isBuild = () => play.p.kind === 'build';

/** The board as it stands: the puzzle's cells with the child's pieces in the slots. */
function board() {
  if (!isBuild()) return play.p.board;
  return F.fill(play.p.board, play.placed.map((x) => (x ? { kind: play.p.tray[x.tray], m: x.m } : null)));
}

/* ------------------------------------------------------------------ */
/* Drawing                                                             */
/* ------------------------------------------------------------------ */

const S = 56;
const half = S / 2;
const portPt = (x, y, d) => {
  const cx = x * S + half;
  const cy = y * S + half;
  return d === F.N ? [cx, y * S] : d === F.S ? [cx, y * S + S] : d === F.E ? [x * S + S, cy] : [x * S, cy];
};
const vertexXY = (id) => {
  if (id[0] === 'c') {
    const [x, y] = id.slice(1).replace(/[ab]$/, '').split(',').map(Number);
    return [x * S + half, y * S + half];
  }
  return F.portXY(id, S);
};
const line = (a, b, cls) => `<path class="${cls}" d="M${a[0]} ${a[1]} L${b[0]} ${b[1]}"/>`;

/** One wire cell: a thick line from the centre to each end it has. */
function wireSvg(x, y, m, cls = 'cz-ff-wire') {
  const c = [x * S + half, y * S + half];
  const ends = F.bitsOf(m).map((d) => line(c, portPt(x, y, d), cls)).join('');
  return ends + (F.bitsOf(m).length > 2 ? `<circle class="cz-ff-joint" cx="${c[0]}" cy="${c[1]}" r="5"/>` : '');
}

/** A firefly: two feet joined to its body, a letter, and its glow. */
function fireflySvg(x, y, c, tier) {
  const [a, b] = F.bitsOf(c.m).map((d) => portPt(x, y, d));
  const cx = x * S + half;
  const cy = y * S + half;
  const awake = tier > 0;
  const rays = tier === 4 ? 3 : tier === 3 ? 2 : tier === 2 ? 1 : 0;
  const glow = awake ? `<circle class="cz-ff-glow t${tier}" cx="${cx}" cy="${cy}" r="${10 + rays * 4}"/>` : '';
  const rayLines = Array.from({ length: rays * 2 }, (_, k) => {
    const ang = (-Math.PI / 2) + (k - rays + 0.5) * 0.55;
    const r1 = 19;
    const r2 = 19 + 4 + rays * 2;
    return `<path class="cz-ff-ray" d="M${(cx + r1 * Math.cos(ang)).toFixed(1)} ${(cy + r1 * Math.sin(ang)).toFixed(1)} L${(cx + r2 * Math.cos(ang)).toFixed(1)} ${(cy + r2 * Math.sin(ang)).toFixed(1)}"/>`;
  }).join('');
  return `<g class="cz-ff-fly${awake ? ' is-awake' : ''}">
    ${line(a, [cx, cy], 'cz-ff-wire')}${line([cx, cy], b, 'cz-ff-wire')}
    ${glow}${rayLines}
    <circle class="cz-ff-body" cx="${cx}" cy="${cy}" r="13"/>
    <text class="cz-ff-letter" x="${cx}" y="${cy + 4}" text-anchor="middle">${c.id}</text>
    ${awake ? '' : `<text class="cz-ff-z" x="${cx + 12}" y="${cy - 12}">z</text>`}
  </g>`;
}

/** The eel battery: a body along its two ends, + and − told apart by shape and sign. */
function eelSvg(x, y, c, hot) {
  const plus = portPt(x, y, c.p);
  const minusDir = { 1: 4, 2: 8, 4: 1, 8: 2 }[c.p];
  const minus = portPt(x, y, minusDir);
  const cx = x * S + half;
  const cy = y * S + half;
  const across = c.p === F.E || c.p === F.Wb;
  const bw = across ? 34 : 20;
  const bh = across ? 20 : 34;
  const sign = (pt, txt) => `<text class="cz-ff-sign" x="${(pt[0] * 0.55 + cx * 0.45).toFixed(1)}" y="${(pt[1] * 0.55 + cy * 0.45 + 4).toFixed(1)}" text-anchor="middle">${txt}</text>`;
  /* The + end has a little nub, as on a real battery. */
  const nub = across ? `<rect class="cz-ff-eel" x="${c.p === F.E ? cx + bw / 2 : cx - bw / 2 - 4}" y="${cy - 4}" width="4" height="8" rx="1"/>`
    : `<rect class="cz-ff-eel" x="${cx - 4}" y="${c.p === F.S ? cy + bh / 2 : cy - bh / 2 - 4}" width="8" height="4" rx="1"/>`;
  return `<g class="cz-ff-eelg${hot ? ' is-hot' : ''}">
    ${line(minus, [cx, cy], 'cz-ff-wire')}${line([cx, cy], plus, 'cz-ff-wire')}
    <rect class="cz-ff-eel" x="${cx - bw / 2}" y="${cy - bh / 2}" width="${bw}" height="${bh}" rx="8"/>
    ${nub}
    <circle class="cz-ff-eye" cx="${cx}" cy="${cy}" r="2.4"/>
    ${sign(plus, '+')}${sign(minus, '−')}
    ${hot ? `<text class="cz-ff-hot" x="${cx}" y="${cy - 16}" text-anchor="middle">⚠️</text>` : ''}
  </g>`;
}

function switchSvg(x, y, c) {
  const [a, b] = F.bitsOf(c.m).map((d) => portPt(x, y, d));
  const cx = x * S + half;
  const cy = y * S + half;
  const mid1 = [(a[0] + cx) / 2, (a[1] + cy) / 2];
  const mid2 = [(b[0] + cx) / 2, (b[1] + cy) / 2];
  const lever = c.on ? line(mid1, mid2, 'cz-ff-lever')
    : `<path class="cz-ff-lever" d="M${mid1[0]} ${mid1[1]} L${mid2[0] + (a[1] === b[1] ? 0 : -14)} ${mid2[1] + (a[1] === b[1] ? -14 : 0)}"/>`;
  return `${line(a, mid1, 'cz-ff-wire')}${line(mid2, b, 'cz-ff-wire')}${lever}
    <circle class="cz-ff-pivot" cx="${mid1[0]}" cy="${mid1[1]}" r="3.5"/><circle class="cz-ff-pivot" cx="${mid2[0]}" cy="${mid2[1]}" r="3.5"/>`;
}

function woodSvg(x, y, m) {
  const [a, b] = F.bitsOf(m).map((d) => portPt(x, y, d));
  const vert = a[0] === b[0];
  const cx = x * S + half;
  const cy = y * S + half;
  return `<rect class="cz-ff-wood" x="${vert ? cx - 6 : x * S + 3}" y="${vert ? y * S + 3 : cy - 6}" width="${vert ? 12 : S - 6}" height="${vert ? S - 6 : 12}" rx="4"/>
    <path class="cz-ff-grain" d="${vert ? `M${cx - 2} ${y * S + 10} V${y * S + S - 10} M${cx + 2} ${y * S + 16} V${y * S + S - 16}` : `M${x * S + 10} ${cy - 2} H${x * S + S - 10} M${x * S + 16} ${cy + 2} H${x * S + S - 16}`}"/>`;
}

function boardSvg() {
  const L = L0();
  const b = board();
  const res = play.res;
  const parts = [];
  for (let y = 0; y < b.h; y++) {
    for (let x = 0; x < b.w; x++) {
      parts.push(`<rect class="cz-ff-cell" x="${x * S + 1}" y="${y * S + 1}" width="${S - 2}" height="${S - 2}" rx="8"/>`);
    }
  }
  for (let y = 0; y < b.h; y++) {
    for (let x = 0; x < b.w; x++) {
      const i = y * b.w + x;
      const c = b.cells[i];
      const k = play.slots.indexOf(i);
      if (k >= 0) {
        /* A square the child fills: dashed when empty, outlined when filled. */
        const filled = play.placed[k];
        parts.push(`<rect class="cz-ff-slot${filled ? ' is-filled' : ''}${play.locked[k] ? ' is-locked' : ''}" x="${x * S + 4}" y="${y * S + 4}" width="${S - 8}" height="${S - 8}" rx="8"/>`);
        if (!filled) parts.push(`<text class="cz-ff-q" x="${x * S + half}" y="${y * S + half + 6}" text-anchor="middle">?</text>`);
      }
      if (!c || c.t === '?') continue;
      if (c.t === 'w') parts.push(wireSvg(x, y, c.m));
      else if (c.t === 'i') parts.push(woodSvg(x, y, c.m));
      else if (c.t === 's') parts.push(switchSvg(x, y, c));
      else if (c.t === 'r') parts.push(`<text x="${x * S + half}" y="${y * S + half + 8}" font-size="26" text-anchor="middle">🪨</text>`);
      else if (c.t === 'E') parts.push(eelSvg(x, y, c, res && res.short));
      else if (c.t === 'F') parts.push(fireflySvg(x, y, c, res ? res.fireflies[c.id].tier : -1));
    }
  }
  parts.push(dotsSvg(b));
  /* Tap targets over the slots, last so they are on top. */
  play.slots.forEach((i, k) => {
    const x = i % b.w;
    const y = Math.floor(i / b.w);
    const piece = play.placed[k] ? ft(`piece.${play.p.tray[play.placed[k].tray]}`, L) : '';
    parts.push(`<rect class="cz-ff-hit" x="${x * S}" y="${y * S}" width="${S}" height="${S}" data-ff-slot="${k}"
      role="button" tabindex="${play.done ? -1 : 0}" aria-label="${esc(piece ? ft('slotFull', L, { n: k + 1, piece }) : ft('slotEmpty', L, { n: k + 1 }))}"/>`);
  });
  return `<svg class="cz-ff-svg" viewBox="-6 -6 ${b.w * S + 12} ${b.h * S + 12}" role="group" aria-label="${esc(boardLabel(L))}">${parts.join('')}</svg>`;
}

/**
 * The dots. Before Go every wire holds still dots. After Go the dots move
 * where current flows, faster where more flows, racing round a short.
 * Electrons leave the eel's − end, so the dots go the other way to the
 * current the solver reports.
 */
function dotsSvg(b) {
  const res = play.res;
  const segs = [];
  const moving = new Map();
  if (res) {
    for (const f of res.flows) moving.set(`${f.from}>${f.to}`, f.i);
  }
  const still = calm();
  const seg = (a, z, key) => {
    const fwd = moving.get(`${key[0]}>${key[1]}`);
    const back = moving.get(`${key[1]}>${key[0]}`);
    const i = fwd || back || 0;
    /* The electron direction is against the current. */
    const [p1, p2] = fwd ? [z, a] : [a, z];
    const speed = res && res.short ? 4 : Math.min(i, 4);
    const cls = !i ? 'cz-ff-dots' : res.short ? 'cz-ff-dots is-moving is-race' : 'cz-ff-dots is-moving';
    const dur = i ? (1.4 / speed).toFixed(2) : 0;
    segs.push(`<path class="${cls}" d="M${p1[0]} ${p1[1]} L${p2[0]} ${p2[1]}"${i && !still ? ` data-style="animation-duration:${dur}s"` : ''}/>`);
    if (i && still) {
      const mx = (p1[0] + p2[0]) / 2;
      const my = (p1[1] + p2[1]) / 2;
      const ang = Math.atan2(p2[1] - p1[1], p2[0] - p1[0]) * 180 / Math.PI;
      segs.push(`<path class="cz-ff-arrow" d="M-4 -4 L2 0 L-4 4" transform="translate(${mx} ${my}) rotate(${ang.toFixed(0)})"/>`);
    }
  };
  for (let y = 0; y < b.h; y++) {
    for (let x = 0; x < b.w; x++) {
      const c = b.cells[y * b.w + x];
      if (!c) continue;
      const centre = `c${x},${y}`;
      const pid = (d) => portIdOf(x, y, d);
      if (c.t === 'w' || (c.t === 's' && c.on)) F.bitsOf(c.m).forEach((d) => seg(vertexXY(pid(d)), vertexXY(centre), [pid(d), centre]));
      else if (c.t === 'F' && res) {
        /* Through the firefly's body, at the firefly's own current. */
        const [da, db] = F.bitsOf(c.m);
        const fi = res.fireflies[c.id].i;
        const v = fi[0] / fi[1];
        const A = vertexXY(pid(da));
        const B = vertexXY(pid(db));
        /* Current from foot a to foot b when v > 0; seg() turns it round for the electrons. */
        if (v) moving.set('fa>fb', Math.abs(v));
        if (v >= 0) seg(A, B, ['fa', 'fb']); else seg(B, A, ['fa', 'fb']);
        moving.delete('fa>fb');
      } else if (c.t === 'E' && res && !res.open) {
        const minusDir = { 1: 4, 2: 8, 4: 1, 8: 2 }[c.p];
        const cur = res.short ? 4 : res.eelCurrent[0] / res.eelCurrent[1];
        /* Inside the eel the current runs from − to +, the electrons + to −. */
        if (cur) moving.set('em>ep', cur);
        seg(vertexXY(pid(minusDir)), vertexXY(pid(c.p)), ['em', 'ep']);
        moving.delete('em>ep');
      }
    }
  }
  return `<g class="cz-ff-dotlayer" aria-hidden="true">${segs.join('')}</g>`;
}

/* The same edge ids the solver uses. */
function portIdOf(x, y, d) {
  if (d === F.E) return `v${x + 1},${y}`;
  if (d === F.Wb) return `v${x},${y}`;
  if (d === F.N) return `h${x},${y}`;
  return `h${x},${y + 1}`;
}

function boardLabel(L) {
  const b = board();
  const flies = F.fireflyIds(b).map((id) => ft('fly', L, { id })).join(', ');
  return `${ft('eel', L)} (${ft('eelEnds', L)}). ${flies}.`;
}

/* ------------------------------------------------------------------ */
/* The goal card, the tray, the predict cards                          */
/* ------------------------------------------------------------------ */

const TIER_GLYPH = { on: '✨', 0: '💤', 1: '·', 2: '✦', 3: '✦✦', 4: '✦✦✦' };
const tierLabel = (v, L) => `${TIER_GLYPH[v] || ''} ${tierWord(v, play.p.tiers, L)}`;

function goalCard(L) {
  const p = play.p;
  const ids = Object.keys(p.goal).sort();
  return `<div class="cz-ff-goal" role="group" aria-label="${esc(ft('card', L))}">
    <strong>${esc(ft('card', L))}</strong>
    ${ids.map((id) => {
      const got = play.res && F.said(play.res.fireflies[id].tier, p.tiers);
      const ok = play.res ? got === p.goal[id] : null;
      return `<span class="cz-ff-goalfly${ok === true ? ' is-ok' : ok === false ? ' is-off' : ''}">
        <span class="cz-ff-goalid">${id}</span> ${esc(tierLabel(p.goal[id], L))}${ok === true ? ' ✓' : ok === false ? ' ✗' : ''}</span>`;
    }).join('')}
  </div>`;
}

function trayHtml(L) {
  const p = play.p;
  const inUse = new Set(play.placed.filter(Boolean).map((x) => x.tray));
  return `<div class="cz-ff-tray" role="group" aria-label="${esc(ft('tray', L))}">
    <strong>${esc(ft('tray', L))}</strong>
    <div class="cz-ff-pieces">
      ${p.tray.map((kind, k) => {
        const used = inUse.has(k);
        const on = play.sel === k;
        const m = F.masksOf(kind)[0];
        const mini = `<svg class="cz-ff-mini" viewBox="0 0 ${S} ${S}" aria-hidden="true">${kind === 'wood' ? woodSvg(0, 0, m) : wireSvg(0, 0, m)}</svg>`;
        return `<button type="button" class="gp-btn cz-ff-piece${on ? ' is-on' : ''}${used ? ' is-used' : ''}" data-ff-tray="${k}"
          aria-pressed="${on}" ${used || play.done ? 'disabled' : ''}>${mini}<span>${esc(ft(`piece.${kind}`, L))}</span></button>`;
      }).join('')}
    </div>
  </div>`;
}

function predictCards(L) {
  const p = play.p;
  const ids = F.fireflyIds(p.board);
  const right = F.answers(p);
  const opts = F.TIER_SETS[p.tiers];
  return `<ol class="cz-sci-cards">${ids.map((id, k) => {
    const picked = play.picks[k];
    const ok = play.done ? picked === right[k] : null;
    const buttons = play.done ? '' : `<div class="cz-sci-opts" role="group" aria-label="${esc(ft('fly', L, { id }))}">
      ${opts.map((v) => `<button type="button" class="gp-btn cz-sci-opt${picked === v ? ' is-on' : ''}" aria-pressed="${picked === v}"
        data-ff-q="${k}" data-ff-v="${v}">${esc(tierLabel(v, L))}</button>`).join('')}</div>`;
    const result = play.done ? resultLine(id, ok, right[k], L) : '';
    return `<li class="cz-sci-card${ok === true ? ' is-right' : ok === false ? ' is-surprise' : ''}">
      <div class="cz-sci-cardhead"><span class="cz-ff-goalid">${id}</span><span class="cz-sci-cardname">${esc(ft('fly', L, { id }))}</span></div>
      ${buttons}${result}
    </li>`;
  }).join('')}</ol>`;
}

/** Why a firefly did what it did, from the solver's own reason. */
function reason(id, L) {
  const r = play.res.fireflies[id];
  if (play.res.short) return ft('why.short', L);
  if (r.why === 'bypass') return ft('why.bypass', L);
  if (r.why === 'open') return ft('why.open', L);
  if (r.why === 'balanced') return ft('why.balanced', L);
  if (r.tier === 2) return ft('why.row', L);
  if (r.tier === 3) return ft('why.mix3', L);
  if (r.tier === 1) return ft('why.mix1', L);
  const lit = Object.values(play.res.fireflies).filter((f) => f.tier > 0).length;
  return lit > 1 ? ft('why.side', L) : ft('why.alone', L);
}

function resultLine(id, ok, v, L) {
  const head = ok ? ft('right', L, { id, tier: tierWord(v, play.p.tiers, L) }) : ft('surprise', L, { id, tier: tierWord(v, play.p.tiers, L) });
  return `<p class="cz-sci-result ${ok ? 'is-right' : 'is-surprise'}">
    ${ok ? '' : '<span class="cz-sci-wow" aria-hidden="true">🤯</span>'}<strong>${esc(head)}</strong>
    <span class="cz-sci-rwhy">${esc(reason(id, L))}</span></p>`;
}

/* ------------------------------------------------------------------ */
/* Painting                                                            */
/* ------------------------------------------------------------------ */

function paintBoard() {
  const L = L0();
  const p = play.p;
  const actions = play.done ? '' : `<div class="cz-sci-actions">
      <button type="button" class="gp-btn gp-btn--primary gp-btn--big cz-sci-go" data-action="ff-go">${esc(ft('go', L))}</button>
      ${canHint() ? `<button type="button" class="gp-btn gp-btn--ghost" data-action="ff-hint"><span aria-hidden="true">💡</span> ${esc(play.hint ? t('hintMore') : t('hint'))}</button>` : ''}
      ${isBuild() && play.placed.some((x, k) => x && !play.locked[k]) ? `<button type="button" class="gp-btn gp-btn--ghost" data-action="ff-clear">${esc(t('restart'))}</button>` : ''}
    </div>`;
  play.host.innerHTML = `<div class="cz-ff" lang="${L}">
    <p class="cz-sci-ask">${esc(ft(isBuild() ? 'ask.build' : 'ask.predict', L))}</p>
    ${isBuild() ? `<p class="cz-sci-help">${esc(ft('ask.buildHow', L))}</p>${goalCard(L)}` : ''}
    <div class="cz-ff-scene">${boardSvg()}</div>
    ${isBuild() ? trayHtml(L) : predictCards(L)}
    ${play.hintText ? `<p class="cz-sci-hint"><span aria-hidden="true">💡</span> ${esc(play.hintText(L))}</p>` : ''}
    ${actions}
    <div class="cz-sci-msg" aria-live="polite">${play.msg ? play.msg(L) : ''}</div>
  </div>`;
  paint();
}

/* ------------------------------------------------------------------ */
/* Building                                                            */
/* ------------------------------------------------------------------ */

/** The turn of a piece that joins the most neighbouring wire ends. */
function bestTurn(kind, slotIndex) {
  const b = board();
  const i = play.slots[slotIndex];
  const x = i % b.w;
  const y = Math.floor(i / b.w);
  const OPP = { 1: 4, 2: 8, 4: 1, 8: 2 };
  const STEP = { 1: [0, -1], 2: [1, 0], 4: [0, 1], 8: [-1, 0] };
  const reaches = (d) => {
    const [dx, dy] = STEP[d];
    const nx = x + dx;
    const ny = y + dy;
    if (nx < 0 || ny < 0 || nx >= b.w || ny >= b.h) return false;
    const c = b.cells[ny * b.w + nx];
    if (!c || c.t === '?' || c.t === 'r') return false;
    const m = c.t === 'E' ? (c.p | OPP[c.p]) : c.t === 'b' ? 15 : c.m;
    return !!(m & OPP[d]);
  };
  let best = F.masksOf(kind)[0];
  let score = -1;
  for (const m of F.masksOf(kind)) {
    const s = F.bitsOf(m).filter(reaches).length;
    if (s > score) { score = s; best = m; }
  }
  return best;
}

function tapSlot(k) {
  if (play.done || play.locked[k]) return;
  const kinds = play.p.tray;
  play.res = null;
  if (play.sel !== null) {
    /* Put the picked-up piece here (anything already here goes back). */
    play.placed[k] = { tray: play.sel, m: bestTurn(kinds[play.sel], k) };
    play.sel = null;
    play.msg = null;
  } else if (play.placed[k]) {
    /* Turn it a quarter. */
    const masks = F.masksOf(kinds[play.placed[k].tray]);
    if (masks.length > 1) play.placed[k] = { ...play.placed[k], m: masks[(masks.indexOf(play.placed[k].m) + 1) % masks.length] };
  } else {
    play.msg = (L) => `<p class="cz-sci-say">${esc(ft('pickPiece', L))}</p>`;
  }
  paintBoard();
  const el = play.host.querySelector(`[data-ff-slot="${k}"]`);
  if (el) el.focus();
}

function pickTray(k) {
  if (play.done) return;
  play.sel = play.sel === k ? null : k;
  play.msg = play.sel === null ? null : (L) => `<p class="cz-sci-say">${esc(ft('picked', L, { piece: ft(`piece.${play.p.tray[k]}`, L) }))}</p>`;
  paintBoard();
  const el = play.host.querySelector(`[data-ff-tray="${k}"]`);
  if (el) el.focus();
}

/* ------------------------------------------------------------------ */
/* Go                                                                  */
/* ------------------------------------------------------------------ */

function go() {
  if (play.done) return;
  if (isBuild() && play.placed.some((x) => !x)) {
    play.msg = (L) => `<p class="cz-sci-say">${esc(ft('fillAll', L))}</p>`;
    paintBoard();
    return;
  }
  if (!isBuild() && play.picks.some((v) => v === null)) {
    play.msg = (L) => `<p class="cz-sci-say">${esc(ft('pickAll', L))}</p>`;
    paintBoard();
    return;
  }
  play.res = F.solve(board());
  play.hintText = null;
  if (isBuild()) judgeBuild(); else judgePredict();
}

function judgeBuild() {
  const p = play.p;
  const res = play.res;
  const ok = !res.short && F.meetsGoal(res, p.goal, p.tiers);
  if (ok) { finish(); return; }
  play.wrong += 1;
  play.ctx.surprise(1);
  react('wow', 1600);
  const off = Object.keys(p.goal).sort().find((id) => F.said(res.fireflies[id].tier, p.tiers) !== p.goal[id]);
  play.msg = (L) => `<p class="cz-sci-surprise"><span class="cz-sci-surprise__icon" aria-hidden="true">🤯</span><span>
    <strong>${esc(res.short ? ft('notYetShort', L) : ft('notYet', L, { id: off, want: tierWord(p.goal[off], p.tiers, L), got: tierWord(F.said(res.fireflies[off].tier, p.tiers), p.tiers, L) }))}</strong>
    ${esc(res.short ? `${ft('why.short', L)} ${ft('safety', L)}` : reason(off, L))} ${esc(ft('tryMore', L))}</span></p>`;
  paintBoard();
}

function judgePredict() {
  const right = F.answers(play.p);
  const wrong = play.picks.filter((v, k) => v !== right[k]).length;
  play.wrong = wrong;
  if (wrong) { play.ctx.surprise(wrong); react('wow', 1600); }
  finish();
}

function finish() {
  play.done = true;
  if (!play.wrong) react('happy', 1800);
  const res = play.res;
  if (isBuild()) play.msg = (L) => `<p class="cz-sci-result is-right"><strong>${esc(ft('matched', L))}</strong></p>`;
  paintBoard();
  const chId = play.ctx.chapterId;
  const ids = F.fireflyIds(board());
  const right = F.answers({ ...play.p, board: board() });
  play.ctx.onSolved({
    stars: F.starsFor({ wrong: play.wrong, hints: play.hints, teach: !!play.ctx.puzzle.teach }),
    why: (L) => {
      const lines = isBuild()
        ? [`<strong>${esc(ft('matched', L))}</strong>`, ...ids.map((id) => `${esc(ft('fly', L, { id }))}: ${esc(reason(id, L))}`)]
        : ids.map((id, k) => {
          const ok = play.picks[k] === right[k];
          const head = ok ? ft('right', L, { id, tier: tierWord(right[k], play.p.tiers, L) }) : ft('surprise', L, { id, tier: tierWord(right[k], play.p.tiers, L) });
          return `${ok ? '' : '<span aria-hidden="true">🤯</span> '}<strong>${esc(head)}</strong> ${esc(reason(id, L))}`;
        });
      if (res.short) lines.push(`<strong>⚠️ ${esc(ft('safety', L))}</strong>`);
      if (Object.values(res.fireflies).some((f) => f.tier > 0)) lines.push(esc(ft('why.same', L)));
      const idea = IDEAS.firefly.find((i) => i.ch === chId);
      if (idea) lines.push(`<strong>${esc(idea[L])}</strong> ${esc(idea.why[L])}`);
      return lines;
    }
  });
}

/* ------------------------------------------------------------------ */
/* Hints                                                               */
/* ------------------------------------------------------------------ */

const canHint = () => !play.done && !play.ctx.puzzle.teach && play.hint < 2;

function hint() {
  play.hint += 1;
  play.hints += 1;
  if (!isBuild()) {
    play.hint = 2;
    play.hintText = (L) => ft(play.p.tiers === 'rows' ? 'hintShort' : 'hintPredict', L);
    paintBoard();
    return;
  }
  if (play.hint === 1) {
    play.hintText = (L) => ft('hintBuild', L);
    paintBoard();
    return;
  }
  /* The second hint puts one right piece in its place, and locks it. */
  const [sol] = F.solutions(play.p, 1);
  if (!sol) return;
  const want = sol.split(',').map((s) => ({ kind: s[0] === 'i' ? 'wood' : null, m: Number(s.slice(1)) }));
  const k = want.findIndex((wnt, j) => {
    const x = play.placed[j];
    if (!x) return true;
    const kind = play.p.tray[x.tray];
    return x.m !== wnt.m || (kind === 'wood') !== (wnt.kind === 'wood');
  });
  if (k < 0) return;
  const target = want[k];
  /* A tray piece that can make this mask, and is not locked elsewhere. */
  const lockedTrays = new Set(play.placed.filter((x, j) => x && play.locked[j]).map((x) => x.tray));
  const t2 = play.p.tray.findIndex((kind, ti) => !lockedTrays.has(ti) && (kind === 'wood') === (target.kind === 'wood') && F.masksOf(kind).includes(target.m));
  if (t2 < 0) return;
  play.placed = play.placed.map((x, j) => (x && x.tray === t2 ? null : x));
  play.placed[k] = { tray: t2, m: target.m };
  play.locked[k] = true;
  play.res = null;
  play.hintText = (L) => ft('hintPlace', L);
  paintBoard();
}

/* ------------------------------------------------------------------ */
/* Clicks, keys, reading aloud                                         */
/* ------------------------------------------------------------------ */

function click(ev) {
  if (!play) return false;
  const slot = ev.target.closest('[data-ff-slot]');
  if (slot) { tapSlot(Number(slot.dataset.ffSlot)); return true; }
  const tray = ev.target.closest('[data-ff-tray]');
  if (tray) { pickTray(Number(tray.dataset.ffTray)); return true; }
  const q = ev.target.closest('[data-ff-q]');
  if (q && !play.done) {
    const k = Number(q.dataset.ffQ);
    const raw = q.dataset.ffV;
    const v = /^\d+$/.test(raw) ? Number(raw) : raw;
    play.picks[k] = play.picks[k] === v ? null : v;
    play.msg = null;
    paintBoard();
    const el = play.host.querySelector(`[data-ff-q="${k}"][data-ff-v="${v}"]`);
    if (el) el.focus();
    return true;
  }
  const action = ev.target.closest('[data-action]');
  if (!action) return false;
  switch (action.dataset.action) {
    case 'ff-go': go(); return true;
    case 'ff-hint': if (canHint()) hint(); return true;
    case 'ff-clear':
      play.placed = play.placed.map((x, k) => (play.locked[k] ? x : null));
      play.res = null;
      play.sel = null;
      play.msg = null;
      paintBoard();
      return true;
    default: return false;
  }
}

function key(ev) {
  if (!play || play.done) return false;
  const slot = ev.target.closest && ev.target.closest('[data-ff-slot]');
  if (slot && (ev.key === 'Enter' || ev.key === ' ')) {
    ev.preventDefault();
    tapSlot(Number(slot.dataset.ffSlot));
    return true;
  }
  return false;
}

function readAloud() {
  if (!play) return;
  const L = lang();
  const parts = [ft(isBuild() ? 'ask.build' : 'ask.predict', L), boardLabel(L)];
  if (isBuild()) {
    parts.push(ft('card', L), ...Object.keys(play.p.goal).sort().map((id) => `${ft('fly', L, { id })}: ${tierWord(play.p.goal[id], play.p.tiers, L)}`));
  }
  say(parts);
}

const repaint = () => { if (play) paintBoard(); };

/* ------------------------------------------------------------------ */
/* Today's experiment                                                  */
/* ------------------------------------------------------------------ */

function dailyPuzzle(level, iso) {
  const list = F.CHAPTERS[level];
  const def = list[hash('firefly-daily', level, iso) % list.length];
  const p = F.makePuzzle(F.chapter(def.id), rngFor('firefly', 'daily', level, iso), F.TEACH + 8);
  return p && !F.problems(p).length ? { puzzle: { id: `daily-${iso}`, ...p }, chapterId: def.id } : null;
}

export default {
  id: 'firefly', bank, chapters, levelOfChapter, tileLabel, draw, repaint, click, key,
  say: readAloud, dailyPuzzle
};
