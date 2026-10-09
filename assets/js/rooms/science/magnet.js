/**
 * rooms/science/magnet.js — Magnet Meerkats, drawn.
 *
 * Bar magnets have an N half with a pointed end and an S half with a round
 * end, each with its letter, so the poles never rest on colour alone
 * (research-circuits-magnets.md 6.4). A little meerkat rides each magnet.
 * Hugs are ♥ and pushes are ↔, in words too.
 *
 * Two ways to play:
 *   - built: the huddle and the ring tower. Tap to turn, then Test!; a
 *     surprise says which pair did not do what the card said, and the
 *     child turns more and tests again.
 *   - one go: hug or push, does it stick, through the wall, which is the
 *     magnet, and the compass. Choose, then Test!.
 */

import * as M from '../../modules/magnetlogic.js';
import { gapsN, layersN, listOf, mt, pairsN, stepsN, thingName } from '../../modules/magnettext.js';
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
    banks.set(level, fetch(`data/science/magnet/${level}.json`, { cache: 'no-cache' }).then((res) => {
      if (!res.ok) throw new Error(`Could not load the ${level} magnets`);
      return res.json();
    }));
    banks.get(level).catch(() => banks.delete(level));
  }
  return banks.get(level);
}

const chapters = (level, L) => M.CHAPTERS[level].map((ch) => ({
  id: ch.id, icon: ch.icon, title: mt(`ch.${ch.id}`, L), idea: mt(`ch.${ch.id}.idea`, L)
}));
const levelOfChapter = (id) => (M.chapter(id) || {}).level || null;
const tileLabel = (p, L) => (p.teach ? { icon: '🎓', text: t('teach') } : { icon: '🧲', text: mt(`tile.${p.kind}`, L) });

/* ------------------------------------------------------------------ */
/* State                                                               */
/* ------------------------------------------------------------------ */

let play = null;

function draw(host, ctx) {
  const p = ctx.puzzle;
  const built = p.kind === 'huddle' || p.kind === 'tower';
  play = {
    host, ctx, p, built,
    right: M.answers(p),
    picks: built ? [] : M.choices(p).map(() => null),
    dirs: p.kind === 'huddle' ? M.dirsOf(p) : null,
    rings: p.kind === 'tower' ? p.rings.slice() : null,
    locked: new Set(),
    tested: null,            // after a Test! that surprised: what happened
    hint: 0, hints: 0, hintText: null, wrong: 0, done: false, msg: null
  };
  paintBoard();
}

const L0 = () => lang();

/* ------------------------------------------------------------------ */
/* Drawing: magnets                                                    */
/* ------------------------------------------------------------------ */

/* Which way a magnet's N end points: 0 up, 1 right, 2 down, 3 left. */
const arrowOf = (axis, d) => (axis === 'h' ? (d ? 1 : 3) : (d ? 2 : 0));
const ANGLE = [270, 0, 90, 180];
const VEC = [[0, -1], [1, 0], [0, 1], [-1, 0]];

/** A bar magnet centred at (cx, cy), its N end pointing `arrow`. */
function barSvg(cx, cy, arrow, len, thick, { kat = true, cls = '' } = {}) {
  const T = thick / 2;
  const H = len / 2;
  const [vx, vy] = VEC[arrow];
  const fs = Math.max(9, thick * 0.62);
  const letter = (k, txt, c) => `<text class="cz-mg-letter ${c}" x="${(cx + vx * k).toFixed(1)}" y="${(cy + vy * k).toFixed(1)}" font-size="${fs.toFixed(1)}" text-anchor="middle" dominant-baseline="central">${txt}</text>`;
  const kx = cx;
  const ky = cy;
  const meerkat = kat ? `<g class="cz-mg-kat">
      <ellipse class="cz-mg-kathead" cx="${kx}" cy="${ky}" rx="${(T * 0.6).toFixed(1)}" ry="${(T * 0.72).toFixed(1)}"/>
      <ellipse class="cz-mg-kateye" cx="${(kx - T * 0.25).toFixed(1)}" cy="${(ky - T * 0.1).toFixed(1)}" rx="${(T * 0.16).toFixed(1)}" ry="${(T * 0.21).toFixed(1)}"/>
      <ellipse class="cz-mg-kateye" cx="${(kx + T * 0.25).toFixed(1)}" cy="${(ky - T * 0.1).toFixed(1)}" rx="${(T * 0.16).toFixed(1)}" ry="${(T * 0.21).toFixed(1)}"/>
      <circle class="cz-mg-katnose" cx="${kx}" cy="${(ky + T * 0.32).toFixed(1)}" r="${(T * 0.1).toFixed(1)}"/></g>` : '';
  return `<g class="cz-mg-bar ${cls}">
    <g transform="translate(${cx} ${cy}) rotate(${ANGLE[arrow]})">
      <path class="cz-mg-s" d="M0 ${-T} H${-H + T} A${T} ${T} 0 0 0 ${-H + T} ${T} H0 Z"/>
      <path class="cz-mg-n" d="M0 ${-T} H${H - T} L${H} 0 L${H - T} ${T} H0 Z"/>
    </g>
    ${letter(H * 0.6, 'N', 'is-n')}${letter(-H * 0.6, 'S', 'is-s')}${meerkat}</g>`;
}

const dirWord = (arrow, L) => mt(`dir.${arrow}`, L);
const badgeIcon = (want) => (want === 'hug' ? '♥' : '↔');

/* ------------------------------------------------------------------ */
/* Huddle                                                              */
/* ------------------------------------------------------------------ */

const S = 72;

function huddleSvg(L) {
  const p = play.p;
  const W = p.w * S;
  const Hh = p.h * S;
  const parts = [];
  const cx = (i) => (i % p.w) * S + S / 2;
  const cy = (i) => Math.floor(i / p.w) * S + S / 2;
  p.cells.forEach((c, i) => {
    const x = cx(i);
    const y = cy(i);
    parts.push(`<rect class="cz-mg-floor" x="${x - S / 2 + 2}" y="${y - S / 2 + 2}" width="${S - 4}" height="${S - 4}" rx="10"/>`);
    if (c === 'w') {
      parts.push(`<g class="cz-mg-crate"><rect x="${x - 22}" y="${y - 22}" width="44" height="44" rx="4"/><path d="M${x - 22} ${y - 22} L${x + 22} ${y + 22} M${x + 22} ${y - 22} L${x - 22} ${y + 22}"/></g>
        <text class="cz-mg-tag" x="${x}" y="${y + 33}" text-anchor="middle">${esc(mt('crate', L))}</text>`);
    } else if (c === 's') {
      parts.push(`<path class="cz-mg-bowl" d="M${x - 24} ${y - 6} H${x + 24} A24 20 0 0 1 ${x - 24} ${y - 6} Z"/>
        <text class="cz-mg-tag" x="${x}" y="${y - 14}" text-anchor="middle">${esc(mt('steel', L))}</text>`);
    }
  });
  /* Magnets: tap to turn, unless glued or pinned by a hint. */
  p.cells.forEach((c, i) => {
    if (!M.isMagnet(c)) return;
    const axis = M.axisOf(c);
    const arrow = arrowOf(axis, play.dirs[i]);
    const fixed = M.isGlued(c) || play.locked.has(i);
    const label = `${mt('magnetN', L, { n: i + 1 })}: N ${dirWord(arrow, L)}${fixed ? ` (${mt('pinned', L)})` : ''}`;
    const body = barSvg(cx(i), cy(i), arrow, S - 16, 26, { cls: fixed ? 'is-fixed' : '' })
      + (fixed ? `<text x="${cx(i) + S / 2 - 12}" y="${cy(i) - S / 2 + 12}" font-size="13" text-anchor="middle" dominant-baseline="central">📌</text>` : '');
    parts.push(fixed || play.done
      ? `<g role="img" aria-label="${esc(label)}">${body}</g>`
      : `<g class="cz-mg-tap" data-mg-cell="${i}" role="button" tabindex="0" aria-label="${esc(label)}">
          <rect class="cz-mg-hit" x="${cx(i) - S / 2}" y="${cy(i) - S / 2}" width="${S}" height="${S}"/>${body}</g>`);
  });
  /* The card: a badge at every touching pair. */
  for (const ct of M.contacts(p)) {
    const key = M.contactKey(ct);
    const want = p.goals[key];
    if (!want) continue;
    const x = (cx(ct.a) + cx(ct.b)) / 2;
    const y = (cy(ct.a) + cy(ct.b)) / 2;
    const got = play.tested ? play.tested[key] : null;
    const miss = got && got !== want;
    parts.push(`<g class="cz-mg-badge is-${want}${miss ? ' is-miss' : got ? ' is-met' : ''}">
      <circle cx="${x}" cy="${y}" r="10"/>
      <text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central">${badgeIcon(want)}</text>
      ${miss ? `<text x="${x + 13}" y="${y - 13}" font-size="14" text-anchor="middle" dominant-baseline="central">🤯</text>` : ''}</g>`);
  }
  /* Drawn at its own size (72px a square), shrunk only to fit. */
  return `<svg class="cz-mg-svg is-natural" width="${W + 8}" height="${Hh + 8}" viewBox="-4 -4 ${W + 8} ${Hh + 8}" role="group" aria-label="${esc(mt('ask.huddle', L))}">${parts.join('')}</svg>`;
}

/* ------------------------------------------------------------------ */
/* Hug or push?                                                        */
/* ------------------------------------------------------------------ */

function pairSvg(L) {
  const p = play.p;
  const n = p.dirs.length;
  const len = 74;
  const gap = 40;
  const step = len + gap;
  const across = p.axis === 'h';
  const total = n * len + (n - 1) * gap;
  const pos = (k) => k * step + len / 2;
  const parts = [];
  p.dirs.forEach((d, k) => {
    const [x, y] = across ? [pos(k), 40] : [50, pos(k)];
    parts.push(barSvg(x, y, arrowOf(p.axis, d), len, 28));
  });
  for (let k = 0; k < n - 1; k++) {
    const mid = pos(k) + step / 2;
    const [x, y] = across ? [mid, 40] : [50, mid];
    const [lx, ly] = across ? [mid, 8] : [96, mid];
    parts.push(`<text class="cz-mg-gapn" x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="central">${k + 1}</text>`);
    if (play.done) {
      const got = play.right[k];
      parts.push(`<g class="cz-mg-badge is-${got}"><circle cx="${x}" cy="${y}" r="12"/><text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central">${badgeIcon(got)}</text></g>`);
    }
  }
  const [vw, vh] = across ? [total, 76] : [110, total];
  return `<svg class="cz-mg-svg${across ? '' : ' is-tall'}" viewBox="-4 -4 ${vw + 8} ${vh + 8}" role="img" aria-label="${esc(mt('ask.pair', L))}">${parts.join('')}</svg>`;
}

/* ------------------------------------------------------------------ */
/* Does it stick?                                                      */
/* ------------------------------------------------------------------ */

/** A thing: its emoji, or a small drawing for the metals emoji lacks. */
function thingSvg(id, x, y) {
  const th = M.thing(id);
  if (th.emoji) return `<text x="${x}" y="${y}" font-size="30" text-anchor="middle" dominant-baseline="central">${th.emoji}</text>`;
  switch (id) {
    case 'nail': return `<g class="cz-mg-iron"><rect x="${x - 3}" y="${y - 16}" width="6" height="26" rx="1"/><rect x="${x - 9}" y="${y - 19}" width="18" height="5" rx="2"/><path d="M${x - 3} ${y + 10} L${x} ${y + 18} L${x + 3} ${y + 10} Z"/></g>`;
    case 'foil': return `<path class="cz-mg-alu" d="M${x - 16} ${y - 12} L${x - 6} ${y - 15} L${x + 4} ${y - 10} L${x + 16} ${y - 14} L${x + 14} ${y + 2} L${x + 17} ${y + 13} L${x + 2} ${y + 15} L${x - 8} ${y + 11} L${x - 17} ${y + 14} L${x - 14} ${y} Z"/>`;
    case 'alcan': return `<g class="cz-mg-alu"><rect x="${x - 11}" y="${y - 17}" width="22" height="34" rx="4"/><path class="cz-mg-band" d="M${x - 11} ${y - 3} H${x + 11} M${x - 11} ${y + 4} H${x + 11}"/></g>`;
    case 'copperwire': return `<path class="cz-mg-copper is-wire" d="M${x - 18} ${y + 8} c4 -18 8 -18 9 0 s5 18 9 0 s5 -18 9 0 s5 18 9 0"/>`;
    case 'copperpipe': return `<g class="cz-mg-copper"><rect x="${x - 18}" y="${y - 6}" width="36" height="12" rx="3"/><ellipse class="cz-mg-hole" cx="${x + 18}" cy="${y}" rx="3" ry="6"/></g>`;
    case 'gold': return `<path class="cz-mg-gold" d="M${x - 18} ${y + 10} L${x - 11} ${y - 8} H${x + 11} L${x + 18} ${y + 10} Z"/>`;
    case 'silver': return `<path class="cz-mg-silver" d="M${x - 18} ${y + 10} L${x - 11} ${y - 8} H${x + 11} L${x + 18} ${y + 10} Z"/>`;
    default: return '';
  }
}

function stickSvg(L) {
  const p = play.p;
  const n = p.things.length;
  const C = 64;
  const W = n * C;
  const parts = [`<rect class="cz-mg-tray" x="2" y="112" width="${W - 4}" height="14" rx="6"/>`];
  parts.push(barSvg(W / 2, 16, 1, Math.min(W - 20, 220), 22, { kat: true }));
  p.things.forEach((id, k) => {
    const up = play.done && M.thing(id).sticks;
    parts.push(`<g class="cz-mg-thing${up ? ' is-up' : ''}">${thingSvg(id, k * C + C / 2, up ? 46 : 92)}</g>`);
  });
  return `<svg class="cz-mg-svg" viewBox="-4 -4 ${W + 8} 134" role="img" aria-label="${esc(mt('ask.stick', L))}">${parts.join('')}</svg>`;
}

/* ------------------------------------------------------------------ */
/* Through the wall                                                    */
/* ------------------------------------------------------------------ */

const uniqueLayers = (p, L) => [...new Set(p.layers)].map((l) => mt(`layer.${l}`, L));

function reachSvg(L) {
  const p = play.p;
  const C = 118;
  const LH = 19;
  const d = p.layers.length;
  const top = 56;
  const parts = [];
  p.mags.forEach((m, k) => {
    const x = k * C + C / 2;
    const win = play.done && k === play.right[0];
    const shift = play.done ? 18 : 0;
    const len = [0, 44, 68, 96][m.size];
    const thick = [0, 16, 22, 28][m.size];
    parts.push(`<text class="cz-mg-bolt" x="${x}" y="11" text-anchor="middle" dominant-baseline="central">${'⚡'.repeat(m.s)}</text>`);
    parts.push(barSvg(x + shift, top - thick / 2 - 1, 1, len, thick, { kat: m.size > 1 }));
    p.layers.forEach((l, j) => {
      const y = top + j * LH;
      parts.push(`<rect class="cz-mg-layer is-${l}" x="${x - 52}" y="${y}" width="104" height="${LH - 1}"/>
        <text class="cz-mg-layern" x="${x}" y="${y + LH / 2}" text-anchor="middle" dominant-baseline="central">${esc(mt(`layer.${l}`, L))}</text>`);
    });
    const cy = top + d * LH + 12;
    parts.push(`<text x="${x + (win ? shift : 0)}" y="${cy}" font-size="22" text-anchor="middle" dominant-baseline="central">📎</text>`);
    if (play.done) parts.push(`<text class="cz-mg-res" x="${x}" y="${cy + 24}" text-anchor="middle">${win ? '✓' : '·'}</text>`);
    parts.push(`<text class="cz-mg-magn" x="${x}" y="${cy + 40}" text-anchor="middle">${esc(mt('magnetN', L, { n: k + 1 }))}</text>`);
  });
  const H = top + d * LH + 56;
  return `<svg class="cz-mg-svg" viewBox="-4 -4 ${p.mags.length * C + 8} ${H + 8}" role="img" aria-label="${esc(askText(L))}">${parts.join('')}</svg>`;
}

/* ------------------------------------------------------------------ */
/* Floating rings                                                      */
/* ------------------------------------------------------------------ */

const RW = 108;
const RH = 30;

/** Ring tops, bottom up, for these rings and gaps: floating gaps shrink with the weight above. */
function ringYs(gaps, base) {
  const ys = [base - RH];
  gaps.forEach((g, k) => {
    const above = gaps.length - k;
    const gap = g === 'float' ? 6 + Math.round(22 / above) : 0;
    ys.push(ys[k] - gap - RH);
  });
  return ys;
}

function towerSvg(L) {
  const p = play.p;
  const n = p.rings.length;
  const base = 40 + n * (RH + 28);
  const parts = [];
  /* The picture: grey rings with the gaps we want. */
  const px = 262;
  const goalYs = ringYs(p.gaps, base);
  parts.push(`<path class="cz-mg-pole" d="M${px} ${goalYs[n - 1] - 12} V${base}"/>`);
  goalYs.forEach((y) => parts.push(`<rect class="cz-mg-ghost" x="${px - RW / 2}" y="${y}" width="${RW}" height="${RH}" rx="7"/>`));
  p.gaps.forEach((g, k) => {
    const y = (goalYs[k] + goalYs[k + 1] + RH) / 2;
    parts.push(`<text class="cz-mg-gapword" x="${px + RW / 2 + 6}" y="${y}" dominant-baseline="central">${g === 'float' ? '↕' : '='}</text>`);
  });
  /* Your tower: lettered faces, tap to turn; after a test, at its real gaps. */
  const tx = 74;
  const showGaps = play.tested || (play.done ? M.towerGaps(play.rings) : null);
  const ys = showGaps ? ringYs(showGaps, base) : play.rings.map((_, k) => base - (k + 1) * RH - k * 10);
  parts.push(`<path class="cz-mg-pole" d="M${tx} ${ys[n - 1] - 12} V${base}"/>`);
  parts.push(`<path class="cz-mg-ground" d="M6 ${base} H334"/>`);
  play.rings.forEach((b, k) => {
    const y = ys[k];
    const fixed = k === 0 || play.locked.has(k);
    const top = b ? 'N' : 'S';
    const bot = b ? 'S' : 'N';
    const ring = `<g class="cz-mg-ring${fixed ? ' is-fixed' : ''}">
      <rect class="cz-mg-${b ? 'n' : 's'}" x="${tx - RW / 2}" y="${y}" width="${RW}" height="${RH / 2}" rx="5"/>
      <rect class="cz-mg-${b ? 's' : 'n'}" x="${tx - RW / 2}" y="${y + RH / 2}" width="${RW}" height="${RH / 2}" rx="5"/>
      <rect class="cz-mg-hole" x="${tx - 5}" y="${y}" width="10" height="${RH}"/>
      <text class="cz-mg-letter" x="${tx - 30}" y="${y + RH / 4 + 0.5}" font-size="13" text-anchor="middle" dominant-baseline="central">${top}</text>
      <text class="cz-mg-letter" x="${tx - 30}" y="${y + (3 * RH) / 4 + 0.5}" font-size="13" text-anchor="middle" dominant-baseline="central">${bot}</text>
      <text class="cz-mg-letter" x="${tx + 30}" y="${y + RH / 4 + 0.5}" font-size="13" text-anchor="middle" dominant-baseline="central">${top}</text>
      <text class="cz-mg-letter" x="${tx + 30}" y="${y + (3 * RH) / 4 + 0.5}" font-size="13" text-anchor="middle" dominant-baseline="central">${bot}</text>
      ${fixed ? `<text x="${tx + RW / 2 + 10}" y="${y + RH / 2}" font-size="13" text-anchor="middle" dominant-baseline="central">📌</text>` : ''}</g>`;
    const label = `${mt('ringN', L, { n: k + 1 })}: N ${dirWord(b ? 0 : 2, L)}${fixed ? ` (${mt(k === 0 ? 'glued' : 'pinned', L)})` : ''}`;
    parts.push(fixed || play.done
      ? `<g role="img" aria-label="${esc(label)}">${ring}</g>`
      : `<g class="cz-mg-tap" data-mg-ring="${k}" role="button" tabindex="0" aria-label="${esc(label)}">
          <rect class="cz-mg-hit" x="${tx - RW / 2 - 4}" y="${y - 3}" width="${RW + 8}" height="${RH + 6}"/>${ring}</g>`);
  });
  if (play.tested) {
    play.tested.forEach((g, k) => {
      if (g === p.gaps[k]) return;
      const y = (ys[k] + ys[k + 1] + RH) / 2;
      parts.push(`<text x="${tx + RW / 2 + 12}" y="${y}" font-size="15" text-anchor="middle" dominant-baseline="central">🤯</text>`);
    });
  }
  const topY = Math.min(ys[n - 1], goalYs[n - 1]) - 22;
  return `<svg class="cz-mg-svg is-tower" viewBox="0 ${topY} 340 ${base - topY + 8}" role="group" aria-label="${esc(mt('ask.tower', L))}">${parts.join('')}</svg>`;
}

/* ------------------------------------------------------------------ */
/* Which is the magnet?                                                */
/* ------------------------------------------------------------------ */

const LETTERS = ['A', 'B', 'C', 'D'];

/** A look-alike bar, its dot end (●) and ring end (○) shown; `flip` puts the ring end on the left. */
function lookBar(x, y, k, flip, reveal = null) {
  const w = 74;
  const h = 18;
  const left = flip ? '○' : '●';
  const right = flip ? '●' : '○';
  return `<g class="cz-mg-look${reveal ? ` is-${reveal}` : ''}">
    <rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="5"/>
    <text class="cz-mg-endm" x="${x - w / 2 + 9}" y="${y}" text-anchor="middle" dominant-baseline="central">${left}</text>
    <text class="cz-mg-endm" x="${x + w / 2 - 9}" y="${y}" text-anchor="middle" dominant-baseline="central">${right}</text>
    <text class="cz-mg-lookn" x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central">${LETTERS[k]}</text></g>`;
}

function whichSvg(L) {
  const p = play.p;
  const C = 92;
  const parts = [];
  for (let k = 0; k < p.n; k++) {
    const reveal = play.done ? play.right[k] : null;
    parts.push(lookBar(k * C + C / 2, 22, k, false, reveal));
    if (reveal) parts.push(`<text class="cz-mg-reveal" x="${k * C + C / 2}" y="48" text-anchor="middle">${esc(mt(`type.${reveal}`, L))}</text>`);
  }
  return `<svg class="cz-mg-svg is-short" viewBox="-4 0 ${p.n * C + 8} 58" role="img" aria-label="${esc(mt('ask.which', L))}">${parts.join('')}</svg>`;
}

function cardSvg(o) {
  const gap = o.res === 'pull' ? 2 : o.res === 'push' ? 34 : 18;
  const w = 74;
  const ax = 4 + w / 2;
  const bx = 4 + w + gap + w / 2;
  /* Bar a's meeting end on its right; bar b's on its left. */
  const icon = o.res === 'pull' ? '♥' : o.res === 'push' ? '↔' : '·';
  const mid = 4 + w + gap / 2;
  return `<svg class="cz-mg-cardsvg" viewBox="0 -8 ${8 + 2 * w + gap} 40" aria-hidden="true">
    ${lookBar(ax, 18, o.a, o.ea === 0)}${lookBar(bx, 18, o.b, o.eb === 1)}
    <text class="cz-mg-cardicon is-${o.res}" x="${mid}" y="${o.res === 'pull' ? 4 : 18}" text-anchor="middle" dominant-baseline="central">${icon}</text></svg>`;
}

function whichCards(L) {
  const p = play.p;
  return `<ol class="cz-mg-obs">${p.cards.map((o) => `<li class="cz-mg-ob">${cardSvg(o)}
    <span>${esc(mt('cardLine', L, { a: LETTERS[o.a], ea: mt(`endmark.${o.ea}`, L), b: LETTERS[o.b], eb: mt(`endmark.${o.eb}`, L), res: mt(`card.${o.res}`, L) }))}</span></li>`).join('')}</ol>`;
}

/* ------------------------------------------------------------------ */
/* Compass                                                             */
/* ------------------------------------------------------------------ */

function compassSvg(L) {
  const p = play.p;
  const cx = 160;
  const cy = 120;
  const len = 120;
  const across = p.ax === 'h';
  const parts = [];
  const plus = across ? [1, 0] : [0, 1];
  const showMagnet = p.q === 'needle' || play.done;
  /* After the test: the field, from the N end round to the S end. */
  if (play.done) {
    const nEnd = p.n ? 1 : -1;
    const [nx, ny] = [cx + plus[0] * nEnd * len / 2, cy + plus[1] * nEnd * len / 2];
    const [sx, sy] = [cx - plus[0] * nEnd * len / 2, cy - plus[1] * nEnd * len / 2];
    for (const side of [-1, 1]) {
      const off = 54 * side;
      const [ox, oy] = across ? [0, off] : [off, 0];
      parts.push(`<path class="cz-mg-field" d="M${nx} ${ny} C${nx + ox} ${ny + oy} ${sx + ox} ${sy + oy} ${sx} ${sy}"/>`);
      const mx = (nx + sx) / 2 + ox * 0.75;
      const my = (ny + sy) / 2 + oy * 0.75;
      parts.push(`<text class="cz-mg-fieldarrow" x="${mx}" y="${my}" text-anchor="middle" dominant-baseline="central">${['↑', '→', '↓', '←'][(M.needle(p.ax, p.n, 'endP') + 2) % 4]}</text>`);
    }
  }
  if (showMagnet) parts.push(barSvg(cx, cy, arrowOf(p.ax, p.n), len, 30));
  else {
    const [w, h] = across ? [len + 16, 44] : [44, len + 16];
    parts.push(`<rect class="cz-mg-box" x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" rx="8"/><text class="cz-mg-boxq" x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="central">?</text>`);
  }
  if (p.q === 'find') {
    /* ★ marks the left (or top) end, ◆ the right (or bottom) end. */
    const tag = (sgn) => (across ? [cx + sgn * 50, cy - 34] : [cx + 36, cy + sgn * 50]);
    const [ax, ay] = tag(-1);
    const [bx, by] = tag(1);
    parts.push(`<text class="cz-mg-endtag" x="${ax}" y="${ay}" text-anchor="middle" dominant-baseline="central">★</text>`);
    parts.push(`<text class="cz-mg-endtag" x="${bx}" y="${by}" text-anchor="middle" dominant-baseline="central">◆</text>`);
  }
  /* The compass. */
  const at = { endP: [plus[0] * 112, plus[1] * 100], endM: [-plus[0] * 112, -plus[1] * 100], sideP: across ? [0, 86] : [96, 0], sideM: across ? [0, -86] : [-96, 0] }[p.spot];
  const [qx, qy] = [cx + at[0], cy + at[1]];
  parts.push(`<circle class="cz-mg-compass" cx="${qx}" cy="${qy}" r="23"/>`);
  if (p.q === 'find' || play.done) {
    const arrow = M.needle(p.ax, p.n, p.spot);
    parts.push(`<g transform="translate(${qx} ${qy}) rotate(${ANGLE[arrow]})">
      <path class="cz-mg-needle-n" d="M0 -5 L18 0 L0 5 Z"/><path class="cz-mg-needle-s" d="M0 -5 L-18 0 L0 5 Z"/></g>
      <text class="cz-mg-letter is-needle" x="${qx + VEC[arrow][0] * 30}" y="${qy + VEC[arrow][1] * 30}" font-size="11" text-anchor="middle" dominant-baseline="central">N</text>`);
  } else {
    parts.push(`<text class="cz-mg-boxq" x="${qx}" y="${qy}" text-anchor="middle" dominant-baseline="central">?</text>`);
  }
  return `<svg class="cz-mg-svg" viewBox="0 -24 320 288" role="img" aria-label="${esc(askText(L))}">${parts.join('')}</svg>`;
}

/* ------------------------------------------------------------------ */
/* Questions, answers and why                                          */
/* ------------------------------------------------------------------ */

function askText(L) {
  const p = play.p;
  switch (p.kind) {
    case 'pair': return mt('ask.pair', L);
    case 'huddle': return mt('ask.huddle', L);
    case 'stick': return mt('ask.stick', L);
    case 'reach': {
      const kinds = uniqueLayers(p, L);
      const nn = layersN(p.layers.length, L);
      return mt('ask.reach', L, { layers: kinds.length === 1 ? mt('layersOf', L, { nn, what: kinds[0] }) : `${nn} (${listOf(kinds, L)})` });
    }
    case 'tower': return mt('ask.tower', L);
    case 'which': return mt('ask.which', L);
    case 'compass': return mt(p.q === 'needle' ? 'ask.needle' : 'ask.find', L);
    default: return '';
  }
}

function cardName(k, L) {
  const p = play.p;
  switch (p.kind) {
    case 'pair': return mt('gapN', L, { n: k + 1 });
    case 'stick': return thingName(p.things[k], L, { cap: true, bare: true });
    case 'which': return mt('barN', L, { x: LETTERS[k] });
    default: return '';
  }
}

function choiceText(k, v, L) {
  const p = play.p;
  switch (p.kind) {
    case 'pair': case 'stick': return mt(v, L);
    case 'reach': return mt('magnetN', L, { n: v + 1 });
    case 'which': return mt(`type.${v}`, L);
    case 'compass': return p.q === 'needle' ? mt(`arrow.${v}`, L) : mt(`end.${v}`, L);
    default: return String(v);
  }
}

function resultText(k, L) {
  const p = play.p;
  const r = play.right[k];
  switch (p.kind) {
    case 'pair': return mt(`res.gap.${r}`, L, { n: k + 1 });
    case 'stick': return mt(`res.${r}`, L, { It: thingName(p.things[k], L, { cap: true }) });
    case 'reach': return mt('res.reach', L, { n: r + 1 });
    case 'which': return mt(`res.which.${r}`, L, { x: LETTERS[k] });
    case 'compass': return p.q === 'needle' ? mt('res.needle', L, { dir: dirWord(r, L) }) : mt('res.find', L, { end: mt(`theEnd.${r}`, L) });
    default: return '';
  }
}

/** Why two facing ends hug or push: the poles that meet. */
function pairWhy(k, L) {
  const p = play.p;
  const a = p.dirs[k] ? 'N' : 'S';      // the + end of the first magnet faces the gap
  const b = p.dirs[k + 1] ? 'S' : 'N';  // the − end of the next one does
  return a !== b ? mt('why.unlike', L) : mt(a === 'N' ? 'why.likeN' : 'why.likeS', L);
}

function whyText(k, L) {
  const p = play.p;
  switch (p.kind) {
    case 'pair': return pairWhy(k, L);
    case 'stick': {
      const th = M.thing(p.things[k]);
      return mt(th.sticks ? 'why.sticks' : th.metal ? 'why.metalNo' : 'why.notMetal', L);
    }
    case 'reach': {
      const m = p.mags[play.right[0]];
      const line = mt('why.reach', L, { layers: listOf(uniqueLayers(p, L), L), ss: stepsN(m.s, L), dd: stepsN(p.layers.length, L) });
      return m.size === 3 ? line : `${line} ${mt('why.size', L)}`;
    }
    case 'which': return mt(`why.${play.right[k]}`, L);
    case 'compass': return mt(p.spot.startsWith('end') ? 'why.endSpot' : 'why.sideSpot', L);
    default: return '';
  }
}

function cards(L) {
  const p = play.p;
  const n = play.picks.length;
  return `<ol class="cz-sci-cards${n === 1 ? ' is-one' : ''}">${play.picks.map((picked, k) => {
    const opts = M.choices(p)[k];
    const ok = play.done ? picked === play.right[k] : null;
    const name = cardName(k, L);
    const icon = p.kind === 'stick' ? `<svg class="cz-mg-thingicon" viewBox="0 0 44 44" aria-hidden="true">${thingSvg(p.things[k], 22, 22)}</svg>` : '';
    const buttons = play.done ? '' : `<div class="cz-sci-opts cz-mg-opts" role="group" aria-label="${esc(name || askText(L))}">
      ${opts.map((v) => `<button type="button" class="gp-btn cz-sci-opt${picked === v ? ' is-on' : ''}" aria-pressed="${picked === v}" data-mg-q="${k}" data-mg-v="${v}">${esc(choiceText(k, v, L))}</button>`).join('')}</div>`;
    const result = play.done ? `<p class="cz-sci-result ${ok ? 'is-right' : 'is-surprise'}">
      ${ok ? '' : '<span class="cz-sci-wow" aria-hidden="true">🤯</span>'}<strong>${esc(ok ? mt('right', L, { res: resultText(k, L) }) : mt('surprise', L, { res: resultText(k, L) }))}</strong>
      <span class="cz-sci-rwhy">${esc(whyText(k, L))}</span></p>` : '';
    return `<li class="cz-sci-card${ok === true ? ' is-right' : ok === false ? ' is-surprise' : ''}">
      ${name ? `<div class="cz-sci-cardhead">${icon}<span class="cz-sci-cardname">${esc(name)}</span></div>` : ''}${buttons}${result}</li>`;
  }).join('')}</ol>`;
}

/* ------------------------------------------------------------------ */
/* Painting                                                            */
/* ------------------------------------------------------------------ */

function sceneSvg(L) {
  switch (play.p.kind) {
    case 'pair': return pairSvg(L);
    case 'huddle': return huddleSvg(L);
    case 'stick': return stickSvg(L);
    case 'reach': return reachSvg(L);
    case 'tower': return towerSvg(L);
    case 'which': return whichSvg(L);
    case 'compass': return compassSvg(L);
    default: return '';
  }
}

const canHint = () => !play.done && !play.ctx.puzzle.teach && play.hint < (play.built ? 2 : 1);

function paintBoard() {
  const L = L0();
  const p = play.p;
  const actions = play.done ? '' : `<div class="cz-sci-actions">
      <button type="button" class="gp-btn gp-btn--primary gp-btn--big cz-sci-go" data-action="mg-go">${esc(mt('go', L))}</button>
      ${canHint() ? `<button type="button" class="gp-btn gp-btn--ghost" data-action="mg-hint"><span aria-hidden="true">💡</span> ${esc(play.hint ? t('hintMore') : t('hint'))}</button>` : ''}
    </div>`;
  play.host.innerHTML = `<div class="cz-mg" lang="${L}">
    <p class="cz-sci-ask">${esc(askText(L))}</p>
    ${p.kind === 'huddle' ? `<p class="cz-sci-help">${esc(mt('ask.huddleKey', L))}</p>` : ''}
    <div class="cz-mg-scene">${sceneSvg(L)}</div>
    ${p.kind === 'which' ? whichCards(L) : ''}
    ${play.built ? '' : cards(L)}
    ${play.hintText ? `<p class="cz-sci-hint"><span aria-hidden="true">💡</span> ${esc(play.hintText(L))}</p>` : ''}
    ${actions}
    <div class="cz-sci-msg" aria-live="polite">${play.msg ? play.msg(L) : ''}</div>
  </div>`;
  paint();
}

/* ------------------------------------------------------------------ */
/* Turning                                                             */
/* ------------------------------------------------------------------ */

function turnMagnet(i) {
  if (play.done || M.isGlued(play.p.cells[i]) || play.locked.has(i)) return;
  play.dirs[i] = 1 - play.dirs[i];
  play.tested = null;
  play.msg = null;
  paintBoard();
  const el = play.host.querySelector(`[data-mg-cell="${i}"]`);
  if (el) el.focus();
}

function turnRing(k) {
  if (play.done || k === 0 || play.locked.has(k)) return;
  play.rings[k] = 1 - play.rings[k];
  play.tested = null;
  play.msg = null;
  paintBoard();
  const el = play.host.querySelector(`[data-mg-ring="${k}"]`);
  if (el) el.focus();
}

/* ------------------------------------------------------------------ */
/* Test!                                                               */
/* ------------------------------------------------------------------ */

function go() {
  if (play.done) return;
  if (play.built) { testBuilt(); return; }
  if (play.picks.some((v) => v === null)) {
    play.msg = (L) => `<p class="cz-sci-say">${esc(mt('pickAll', L))}</p>`;
    paintBoard();
    return;
  }
  const wrong = play.picks.filter((v, k) => v !== play.right[k]).length;
  play.wrong = wrong;
  if (wrong) { play.ctx.surprise(wrong); react('wow', 1600); }
  finish();
}

/** The rule line for a huddle contact type. */
const contactWhy = (type, L) => mt(type === 'steel' ? 'why.steel' : type === 'side' ? 'why.side' : 'why.end', L);

function testBuilt() {
  const p = play.p;
  let misses;
  let firstWhy;
  if (p.kind === 'huddle') {
    const got = M.outcome(p, play.dirs);
    misses = Object.keys(p.goals).filter((k) => got[k] !== p.goals[k]);
    if (misses.length) {
      play.tested = got;
      const ct = M.contacts(p).find((c) => M.contactKey(c) === misses[0]);
      firstWhy = (L) => contactWhy(ct.type, L);
    }
  } else {
    const got = M.towerGaps(play.rings);
    misses = got.map((g, k) => (g === p.gaps[k] ? -1 : k)).filter((k) => k >= 0);
    if (misses.length) {
      play.tested = got;
      firstWhy = (L) => `${mt('why.float', L)} ${mt('why.touch', L)}`;
    }
  }
  if (!misses.length) { finish(); return; }
  play.wrong += 1;
  play.ctx.surprise(1);
  react('wow', 1600);
  const count = misses.length;
  const many = p.kind === 'huddle' ? pairsN : gapsN;
  play.msg = (L) => `<p class="cz-sci-surprise"><span class="cz-sci-surprise__icon" aria-hidden="true">🤯</span><span>
    <strong>${esc(mt('notYet', L, { n: many(count, L) }))}</strong> ${esc(firstWhy(L))} ${esc(mt('tryMore', L))}</span></p>`;
  paintBoard();
}

function finish() {
  const p = play.p;
  play.done = true;
  play.tested = null;
  play.hintText = null;
  if (!play.wrong) react('happy', 1800);
  if (play.built) play.msg = (L) => `<p class="cz-sci-result is-right"><strong>${esc(mt(p.kind === 'huddle' ? 'matched' : 'towerMatched', L))}</strong></p>`;
  paintBoard();
  const chId = play.ctx.chapterId;
  play.ctx.onSolved({
    stars: M.starsFor({ wrong: play.wrong, hints: play.hints, teach: !!play.ctx.puzzle.teach }),
    why: (L) => {
      let lines;
      if (p.kind === 'huddle') {
        const types = new Set(M.contacts(p).map((c) => c.type));
        lines = ['end', 'side', 'steel'].filter((x) => types.has(x)).map((x) => esc(contactWhy(x, L)));
      } else if (p.kind === 'tower') {
        lines = [];
        if (p.gaps.includes('float')) lines.push(esc(mt('why.float', L)));
        if (p.gaps.includes('touch')) lines.push(esc(mt('why.touch', L)));
        if (p.gaps.filter((g) => g === 'float').length > 1) lines.push(esc(mt('why.towerWeight', L)));
      } else {
        lines = play.right.map((_, k) => {
          const ok = play.picks[k] === play.right[k];
          return `${ok ? '' : '<span aria-hidden="true">🤯</span> '}<strong>${esc(ok ? mt('right', L, { res: resultText(k, L) }) : mt('surprise', L, { res: resultText(k, L) }))}</strong> ${esc(whyText(k, L))}`;
        });
      }
      const idea = IDEAS.magnet.find((i) => i.ch === chId);
      if (idea) lines.push(`<strong>${esc(idea[L])}</strong> ${esc(idea.why[L])}`);
      if (chId === 'e1') lines.push(esc(mt('why.paint', L)));
      if (chId === 'e3' || chId === 'm3') lines.push(esc(mt('safety', L)));
      return lines;
    }
  });
}

/* ------------------------------------------------------------------ */
/* Hints                                                               */
/* ------------------------------------------------------------------ */

const HINT = { pair: 'hintPair', stick: 'hintStick', reach: 'hintReach', which: 'hintWhich', compass: 'hintCompass' };

function hint() {
  const p = play.p;
  play.hint += 1;
  play.hints += 1;
  if (!play.built) {
    play.hintText = (L) => `${mt(HINT[p.kind], L)}${p.kind === 'compass' ? ` ${mt('why.earth', L)}` : ''}`;
    paintBoard();
    return;
  }
  if (play.hint === 1) {
    play.hintText = (L) => (p.kind === 'tower' ? mt('hintTower', L)
      : `${mt('hintHuddle', L)}${Object.values(p.goals).includes('push') || p.cells.includes('s') ? ` ${mt('hintHuddleMixed', L)}` : ''}`);
    paintBoard();
    return;
  }
  /* The second hint turns one wrong piece the right way, and pins it. */
  if (p.kind === 'huddle') {
    const i = play.dirs.findIndex((d, j) => d !== null && !M.isGlued(p.cells[j]) && d !== play.right[j]);
    const j = i >= 0 ? i : play.dirs.findIndex((d, k) => d !== null && !M.isGlued(p.cells[k]) && !play.locked.has(k));
    if (j < 0) return;
    play.dirs[j] = play.right[j];
    play.locked.add(j);
    play.hintText = (L) => mt('hintPlace', L);
  } else {
    const i = play.rings.findIndex((b, k) => k > 0 && b !== play.right[k]);
    const j = i >= 0 ? i : play.rings.findIndex((_, k) => k > 0 && !play.locked.has(k));
    if (j < 0) return;
    play.rings[j] = play.right[j];
    play.locked.add(j);
    play.hintText = (L) => mt('hintTowerPlace', L);
  }
  play.tested = null;
  paintBoard();
}

/* ------------------------------------------------------------------ */
/* Clicks, keys, reading aloud                                         */
/* ------------------------------------------------------------------ */

function click(ev) {
  if (!play) return false;
  const cell = ev.target.closest('[data-mg-cell]');
  if (cell) { turnMagnet(Number(cell.dataset.mgCell)); return true; }
  const ring = ev.target.closest('[data-mg-ring]');
  if (ring) { turnRing(Number(ring.dataset.mgRing)); return true; }
  const q = ev.target.closest('[data-mg-q]');
  if (q && !play.done) {
    const k = Number(q.dataset.mgQ);
    const raw = q.dataset.mgV;
    const v = /^\d+$/.test(raw) ? Number(raw) : raw;
    play.picks[k] = play.picks[k] === v ? null : v;
    play.msg = null;
    paintBoard();
    const el = play.host.querySelector(`[data-mg-q="${k}"][data-mg-v="${v}"]`);
    if (el) el.focus();
    return true;
  }
  const action = ev.target.closest('[data-action]');
  if (!action) return false;
  if (action.dataset.action === 'mg-go') { go(); return true; }
  if (action.dataset.action === 'mg-hint' && canHint()) { hint(); return true; }
  return false;
}

function key(ev) {
  if (!play || play.done) return false;
  if (ev.key !== 'Enter' && ev.key !== ' ') return false;
  const cell = ev.target.closest && ev.target.closest('[data-mg-cell]');
  if (cell) { ev.preventDefault(); turnMagnet(Number(cell.dataset.mgCell)); return true; }
  const ring = ev.target.closest && ev.target.closest('[data-mg-ring]');
  if (ring) { ev.preventDefault(); turnRing(Number(ring.dataset.mgRing)); return true; }
  return false;
}

function readAloud() {
  if (!play) return;
  const L = lang();
  const parts = [askText(L)];
  if (play.p.kind === 'huddle') parts.push(mt('ask.huddleKey', L));
  if (play.p.kind === 'which') {
    for (const o of play.p.cards) parts.push(mt('cardLine', L, { a: LETTERS[o.a], ea: mt(`endmark.${o.ea}`, L), b: LETTERS[o.b], eb: mt(`endmark.${o.eb}`, L), res: mt(`card.${o.res}`, L) }));
  }
  say(parts);
}

const repaint = () => { if (play) paintBoard(); };

/* ------------------------------------------------------------------ */
/* Today's experiment                                                  */
/* ------------------------------------------------------------------ */

function dailyPuzzle(level, iso) {
  const list = M.CHAPTERS[level];
  const def = list[hash('magnet-daily', level, iso) % list.length];
  const p = M.makePuzzle(M.chapter(def.id), rngFor('magnet', 'daily', level, iso), M.TEACH + 8);
  return p && !M.problems(p).length ? { puzzle: { id: `daily-${iso}`, ...p }, chapterId: def.id } : null;
}

export default {
  id: 'magnet', bank, chapters, levelOfChapter, tileLabel, draw, repaint, click, key,
  say: readAloud, dailyPuzzle
};
