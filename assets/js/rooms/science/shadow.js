/**
 * rooms/science/shadow.js — Shadow Show, drawn.
 *
 * A split stage, as the research asks (research-levers-shadows-water-
 * dominos.md 2.2): on top, the side view, with the lamp, the numbered steps,
 * the puppet on its stick, the wall, and the light rays drawn as straight
 * lines past the puppet's top and bottom, with the dark wedge of shadow in
 * the air behind it; underneath, the wall seen face-on, with the dotted
 * outline of the shadow we want and, after Light!, the shadow itself.
 *
 * Shadows are the puppet emoji turned black, so a shadow has exactly the
 * puppet's outline. Dark, pale and almost-invisible shadows are drawn solid,
 * dotted and outlined, and named in words.
 *
 * Every puzzle is one go.
 */

import * as H from '../../modules/shadowlogic.js';
import { aThe, ht, rows, shadows, the } from '../../modules/shadowtext.js';
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
    banks.set(level, fetch(`data/science/shadow/${level}.json`, { cache: 'no-cache' }).then((res) => {
      if (!res.ok) throw new Error(`Could not load the ${level} shadows`);
      return res.json();
    }));
    banks.get(level).catch(() => banks.delete(level));
  }
  return banks.get(level);
}

const chapters = (level, L) => H.CHAPTERS[level].map((ch) => ({
  id: ch.id, icon: ch.icon, title: ht(`ch.${ch.id}`, L), idea: ht(`ch.${ch.id}.idea`, L)
}));
const levelOfChapter = (id) => (H.chapter(id) || {}).level || null;
const tileLabel = (p, L) => (p.teach ? { icon: '🎓', text: t('teach') } : { icon: '🔦', text: ht(`tile.${p.kind}`, L) });

/* ------------------------------------------------------------------ */
/* State                                                               */
/* ------------------------------------------------------------------ */

let play = null;

function draw(host, ctx) {
  const p = ctx.puzzle;
  play = { host, ctx, p, right: H.answers(p), picks: H.answers(p).map(() => null), lit: false, hint: 0, hints: 0, wrong: 0, done: false, msg: null };
  paintBoard();
}

const L0 = () => lang();

/* ------------------------------------------------------------------ */
/* What the stage shows                                                */
/* ------------------------------------------------------------------ */

/**
 * The stage as the child has set it, or (lit) as the answer sets it:
 * { puppet, x, lampStep, lampRows: [..], top, material }.
 */
function stage(useAnswer) {
  const p = play.p;
  const pick = (k) => (useAnswer ? play.right[k] : play.picks[k]);
  const base = { puppet: p.puppet || p.target, x: p.x || 6, lampStep: 0, lampRows: [H.LAMP_ROW], top: null, material: 'card' };
  switch (p.kind) {
    case 'shape': return { ...base, puppet: pick(0) === null ? null : p.puppets[pick(0)], x: p.x };
    case 'size': return { ...base, x: pick(0) === null ? null : p.slots[pick(0)] };
    case 'both': return { ...base, puppet: pick(0) === null ? null : p.puppets[pick(0)], x: pick(1) === null ? null : p.slots[pick(1)] };
    case 'lamp': return { ...base, x: 6, lampStep: pick(0) === null ? null : p.opts[pick(0)] };
    case 'height': return { ...base, x: p.x, top: p.top, lampRows: [pick(0) === null ? null : p.opts[pick(0)]] };
    case 'material': return { ...base, x: 6, material: pick(0) === null ? null : p.opts[pick(0)] };
    case 'tall': return { ...base, x: p.x };
    case 'two': return { ...base, x: p.x, lampRows: p.lamps };
    default: return base;
  }
}

/** The target: the shadow the outline shows, as { puppet, k, span, material }. */
function target() {
  const p = play.p;
  const pp = H.puppet(p.puppet || p.target);
  switch (p.kind) {
    case 'shape': case 'both': return { puppet: p.target, span: spanOf({ puppet: p.target, x: p.x, lampStep: 0, lampRows: [H.LAMP_ROW] }) };
    case 'size': return { puppet: p.puppet, span: spanOf({ puppet: p.puppet, x: p.target, lampStep: 0, lampRows: [H.LAMP_ROW] }) };
    case 'lamp': return { puppet: p.puppet, span: spanOf({ puppet: p.puppet, x: 6, lampStep: p.lamp, lampRows: [H.LAMP_ROW] }) };
    case 'height': return { puppet: p.puppet, span: H.shadowSpan(p.top, p.top + pp.h, p.x, p.lampRow) };
    case 'material': return { puppet: p.puppet, span: spanOf({ puppet: p.puppet, x: 6, lampStep: 0, lampRows: [H.LAMP_ROW] }), material: p.material };
    default: return null;
  }
}

/* The rows a stage's shadow covers on the wall, for its first lamp. */
function spanOf(s, lampRow = s.lampRows[0]) {
  const pp = H.puppet(s.puppet);
  const [top, bottom] = s.top !== null && s.top !== undefined ? [s.top, s.top + pp.h] : H.centred(pp.h);
  return H.shadowSpan(top, bottom, s.x, lampRow, s.lampStep);
}

/* ------------------------------------------------------------------ */
/* Drawing: the side view                                              */
/* ------------------------------------------------------------------ */

const SX = (step) => 22 + step * 26;
const SY = (row) => 14 + row * 11;

function sideSvg() {
  const L = L0();
  const p = play.p;
  const s = play.lit ? stage(true) : stage(false);
  const parts = [];
  /* The floor with its steps, and the wall. */
  parts.push(`<path class="cz-sh-floor" d="M${SX(0) - 10} ${SY(H.ROWS)} H${SX(H.WALL) + 4}"/>`);
  for (let st = 0; st <= H.WALL; st++) {
    parts.push(`<path class="cz-sh-tick" d="M${SX(st)} ${SY(H.ROWS)} V${SY(H.ROWS) + 5}"/>`);
    if ([2, 3, 4, 5, 6, 12].includes(st) || st === 0) parts.push(`<text class="cz-sh-stepn" x="${SX(st)}" y="${SY(H.ROWS) + 16}" text-anchor="middle">${st}</text>`);
  }
  parts.push(`<rect class="cz-sh-wall" x="${SX(H.WALL)}" y="${SY(0) - 6}" width="8" height="${SY(H.ROWS) - SY(0) + 6}"/>`);
  /* Lamps, rays, the puppet, and the shadow in the air and on the wall. */
  const lampStep = s.lampStep === null ? null : s.lampStep;
  const lamps = s.lampRows.filter((r) => r !== null);
  if (lampStep !== null) {
    for (const r of lamps) parts.push(`<text x="${SX(lampStep)}" y="${SY(r)}" font-size="18" text-anchor="middle" dominant-baseline="central">💡</text>`);
  }
  if (s.puppet && s.x && lampStep !== null && lamps.length) {
    const pp = H.puppet(s.puppet);
    const [top, bottom] = s.top !== null && s.top !== undefined ? [s.top, s.top + pp.h] : H.centred(pp.h);
    const px = SX(s.x);
    for (const r of lamps) {
      const [a, b] = H.shadowSpan(top, bottom, s.x, r, lampStep);
      const lx = SX(lampStep);
      const ly = SY(r);
      const mat = s.material || 'card';
      /* Rays and shadow only after Light!: before, they would give the answer away. */
      if (play.lit) {
        parts.push(`<path class="cz-sh-ray" d="M${lx} ${ly} L${SX(H.WALL)} ${SY(a)} M${lx} ${ly} L${SX(H.WALL)} ${SY(b)}"/>`);
        parts.push(`<path class="cz-sh-wedge is-${H.DARKNESS[mat]}" d="M${px} ${SY(top)} L${SX(H.WALL)} ${SY(a)} L${SX(H.WALL)} ${SY(b)} L${px} ${SY(bottom)} Z"/>`);
        parts.push(`<rect class="cz-sh-onwall is-${H.DARKNESS[mat]}" x="${SX(H.WALL)}" y="${SY(a)}" width="8" height="${SY(b) - SY(a)}"/>`);
      }
    }
    parts.push(`<path class="cz-sh-stick" d="M${px} ${SY(bottom)} V${SY(H.ROWS)}"/>`);
    parts.push(`<rect class="cz-sh-card is-${s.material || 'card'}" x="${px - 3}" y="${SY(top)}" width="6" height="${SY(bottom) - SY(top)}" rx="2"/>`);
    parts.push(`<text x="${px - 14}" y="${(SY(top) + SY(bottom)) / 2}" font-size="14" text-anchor="middle" dominant-baseline="central">${pp.emoji}</text>`);
  }
  /* The height question frames its target on the wall. */
  if (p.kind === 'height') {
    const [a, b] = target().span;
    parts.push(`<rect class="cz-sh-frame" x="${SX(H.WALL) - 3}" y="${SY(a)}" width="14" height="${SY(b) - SY(a)}"/>`);
  }
  return `<svg class="cz-sh-svg" viewBox="0 0 360 ${SY(H.ROWS) + 22}" role="img" aria-label="${esc(sideLabel(L))}">${parts.join('')}</svg>`;
}

function sideLabel(L) {
  return `${ht('why.straight', L)}`;
}

/* ------------------------------------------------------------------ */
/* Drawing: the wall, face-on                                          */
/* ------------------------------------------------------------------ */

const WH = 13 * 13;   // 13 rows of 13px
const WY = (row) => 6 + row * 13;

function silhouette(pupId, span, cls, cx = 100) {
  const [a, b] = span;
  const size = Math.max(10, (b - a) * 13);
  return `<text class="${cls}" x="${cx}" y="${(WY(a) + WY(b)) / 2}" font-size="${size.toFixed(1)}" text-anchor="middle" dominant-baseline="central">${H.puppet(pupId).emoji}</text>`;
}

function wallSvg() {
  const L = L0();
  const p = play.p;
  const parts = [`<rect class="cz-sh-wallface" x="0" y="0" width="200" height="${WH + 12}" rx="10"/>`];
  /* Row lines, numbered every other row, to measure by. */
  for (let r = 0; r <= 12; r++) {
    parts.push(`<path class="cz-sh-row" d="M18 ${WY(r)} H196"/>`);
    if (r % 2 === 0) parts.push(`<text class="cz-sh-rown" x="12" y="${WY(r) + 4}" text-anchor="middle">${r}</text>`);
  }
  const tg = target();
  if (tg) {
    parts.push(silhouette(tg.puppet, tg.span, `cz-sh-ghost${tg.material ? ` is-${H.DARKNESS[tg.material]}` : ''}`));
    const [a, b] = tg.span;
    parts.push(`<rect class="cz-sh-frame" x="22" y="${WY(a)}" width="172" height="${WY(b) - WY(a)}"/>`);
  }
  if (play.lit) {
    const s = stage(false);
    if (s.puppet && s.x && s.lampStep !== null) {
      s.lampRows.filter((r) => r !== null).forEach((r, i, all) => {
        const span = spanOf(s, r);
        parts.push(silhouette(s.puppet, span, `cz-sh-shadow is-${H.DARKNESS[s.material || 'card']}`));
      });
    }
  }
  return `<svg class="cz-sh-wallsvg" viewBox="0 0 200 ${WH + 12}" role="img" aria-label="${esc(ht('outline', L))}">${parts.join('')}</svg>`;
}

/* ------------------------------------------------------------------ */
/* The sun, outdoors                                                   */
/* ------------------------------------------------------------------ */

function sunSvg() {
  const L = L0();
  const p = play.p;
  const C = 28;
  const ground = 150;
  const X = (c) => 50 + c * C;
  const pick = play.lit ? play.right[0] : play.picks[0];
  const sun = pick === null ? null : H.SUNS[p.opts[pick]];
  const parts = [`<path class="cz-sh-floor" d="M10 ${ground} H350"/>`];
  for (let c = 0; c <= 10; c++) parts.push(`<path class="cz-sh-tick" d="M${X(c)} ${ground} V${ground + 5}"/><text class="cz-sh-stepn" x="${X(c)}" y="${ground + 16}" text-anchor="middle">${c}</text>`);
  /* The tree is h squares tall, standing at 0. */
  const treeTop = ground - p.h * C;
  parts.push(`<path class="cz-sh-trunk" d="M${X(0)} ${ground} V${treeTop + 10}"/><text x="${X(0)}" y="${treeTop + 6}" font-size="${p.h * 18}" text-anchor="middle" dominant-baseline="central">🌳</text>`);
  if (sun) {
    const len = H.sunLength(p.h, sun);
    /* The sun up and to the left, along the line through the treetop. */
    const dx = -sun[1];
    const dy = -sun[0];
    const norm = Math.hypot(dx, dy);
    parts.push(`<text x="${X(0) + (dx / norm) * 40}" y="${treeTop + (dy / norm) * 40}" font-size="24" text-anchor="middle" dominant-baseline="central">☀️</text>`);
    if (play.lit) {
      parts.push(`<path class="cz-sh-ray" d="M${X(0) + (dx / norm) * 30} ${treeTop + (dy / norm) * 30} L${X(len)} ${ground}"/>`);
      parts.push(`<path class="cz-sh-groundshade" d="M${X(0)} ${ground} L${X(len)} ${ground} L${X(len)} ${ground - 5} L${X(0)} ${ground - 5} Z"/>`);
    }
  }
  parts.push(`<text x="${X(p.lion)}" y="${ground - 12}" font-size="20" text-anchor="middle" dominant-baseline="central">🦁</text>`);
  parts.push(`<text x="${X(p.zebra)}" y="${ground - 12}" font-size="20" text-anchor="middle" dominant-baseline="central">🦓</text>`);
  return `<svg class="cz-sh-svg" viewBox="0 0 360 ${ground + 24}" role="img" aria-label="${esc(askText(L))}">${parts.join('')}</svg>`;
}

/* ------------------------------------------------------------------ */
/* Questions                                                           */
/* ------------------------------------------------------------------ */

function askText(L) {
  const p = play.p;
  const pp = H.puppet(p.puppet || p.target);
  switch (p.kind) {
    case 'shape': return ht('ask.shape', L);
    case 'size': return ht('ask.size', L, { it: the(p.puppet, L) });
    case 'both': return ht('ask.both', L);
    case 'lamp': return ht('ask.lamp', L, { It: the(p.puppet, L, true) });
    case 'height': return ht('ask.height', L);
    case 'sun': return ht('ask.sun', L, { hh: rows(p.h, L) });
    case 'material': return ht('ask.material', L, { dark: ht(`dark.${H.DARKNESS[p.material]}`, L) });
    case 'tall': return ht('ask.tall', L, { It: the(p.puppet, L, true), hh: rows(pp.h, L), x: p.x });
    case 'two': return ht('ask.two', L, { it: aThe(p.puppet, L), x: p.x });
    default: return '';
  }
}

function choiceText(k, v, L) {
  const p = play.p;
  switch (p.kind) {
    case 'shape': return `${H.puppet(p.puppets[v]).emoji} ${the(p.puppets[v], L, true)}`;
    case 'both': return k === 0 ? `${H.puppet(p.puppets[v]).emoji} ${the(p.puppets[v], L, true)}` : ht('stepN', L, { n: p.slots[v] });
    case 'size': return ht('stepN', L, { n: p.slots[v] });
    case 'lamp': return `💡 ${ht('stepN', L, { n: p.opts[v] })}`;
    case 'height': return `💡 ${ht('rowN', L, { n: p.opts[v] })}`;
    case 'sun': return `☀️ ${ht(`sun.${p.opts[v]}`, L)}`;
    case 'material': return ht(`mat.${p.opts[v]}`, L);
    case 'tall': return rows(p.opts[v], L);
    case 'two': return shadows(p.opts[v], L);
    default: return String(v);
  }
}

function resultText(k, L) {
  const p = play.p;
  const r = play.right[k];
  switch (p.kind) {
    case 'shape': return ht('res.shape', L, { It: the(p.puppets[r], L, true) });
    case 'both': return k === 0 ? ht('res.shape', L, { It: the(p.puppets[r], L, true) }) : ht('res.size', L, { x: p.slots[r] });
    case 'size': return ht('res.size', L, { x: p.slots[r] });
    case 'lamp': return ht('res.lamp', L, { x: p.opts[r] });
    case 'height': return ht('res.height', L, { x: p.opts[r] });
    case 'sun': { const sun = ht(`theSun.${p.opts[r]}`, L); return ht('res.sun', L, { Sun: sun.charAt(0).toUpperCase() + sun.slice(1) }); }
    case 'material': { const m = ht(`theMat.${p.opts[r]}`, L); return ht('res.material', L, { Mat: m.charAt(0).toUpperCase() + m.slice(1), dark: ht(`dark.${H.DARKNESS[p.opts[r]]}`, L) }); }
    case 'tall': return ht('res.tall', L, { tt: rows(p.opts[r], L) });
    case 'two': return ht('res.two', L, { nn: shadows(p.opts[r], L) });
    default: return '';
  }
}

function whyText(k, L) {
  const p = play.p;
  const pp = H.puppet(p.puppet || p.target);
  switch (p.kind) {
    case 'shape': return `${ht('why.shadow', L)} ${ht('why.straight', L)}`;
    case 'size': case 'both': {
      const x = p.kind === 'size' ? p.target : p.x;
      return k === 0 && p.kind === 'both' ? ht('why.shadow', L) : ht('why.closer', L, { x, k: H.scale(x) });
    }
    case 'lamp': return ht('why.lamp', L, { L: p.lamp, a: H.WALL - p.lamp, b: 6 - p.lamp, k: H.scale(6, p.lamp) });
    case 'height': return ht('why.height', L);
    case 'sun': return ht('why.sun', L, { ll: rows(H.sunLength(p.h, H.SUNS[p.opts[play.right[0]]]), L) });
    case 'material': return ht('why.material', L);
    case 'tall': return `${ht('why.tall', L, { hh: pp.h, x: p.x, t: pp.h * H.scale(p.x) })} ${ht('why.closer', L, { x: p.x, k: H.scale(p.x) })}`;
    case 'two': return H.shadowCount(p) === 1 ? ht('why.twoOne', L) : ht('why.two', L);
    default: return '';
  }
}

function cards(L) {
  const p = play.p;
  const n = play.right.length;
  return `<ol class="cz-sci-cards${n === 1 ? ' is-one' : ''}">${Array.from({ length: n }, (_, k) => {
    const opts = H.choices(p)[k];
    const picked = play.picks[k];
    const ok = play.done ? picked === play.right[k] : null;
    const name = p.kind === 'both' ? ht(k === 0 ? 'which' : 'where', L) : '';
    const buttons = play.done ? '' : `<div class="cz-sci-opts cz-sh-opts" role="group" aria-label="${esc(name || askText(L))}">
      ${opts.map((v) => `<button type="button" class="gp-btn cz-sci-opt${picked === v ? ' is-on' : ''}" aria-pressed="${picked === v}" data-sh-q="${k}" data-sh-v="${v}">${esc(choiceText(k, v, L))}</button>`).join('')}</div>`;
    const result = play.done ? `<p class="cz-sci-result ${ok ? 'is-right' : 'is-surprise'}">
      ${ok ? '' : '<span class="cz-sci-wow" aria-hidden="true">🤯</span>'}<strong>${esc(ok ? ht('right', L, { res: resultText(k, L) }) : ht('surprise', L, { res: resultText(k, L) }))}</strong>
      <span class="cz-sci-rwhy">${esc(whyText(k, L))}</span></p>` : '';
    return `<li class="cz-sci-card${ok === true ? ' is-right' : ok === false ? ' is-surprise' : ''}">
      ${name ? `<div class="cz-sci-cardhead"><span class="cz-sci-cardname">${esc(name)}</span></div>` : ''}${buttons}${result}</li>`;
  }).join('')}</ol>`;
}

/* ------------------------------------------------------------------ */
/* Painting                                                            */
/* ------------------------------------------------------------------ */

const HINT = { shape: 'hintShape', size: 'hintSize', both: 'hintSize', lamp: 'hintSize', height: 'hintHeight', sun: 'hintSun', material: 'hintMaterial', tall: 'hintSize', two: 'hintTwo' };

function paintBoard() {
  const L = L0();
  const p = play.p;
  const scene = p.kind === 'sun' ? `<div class="cz-sh-scene">${sunSvg()}</div>`
    : `<div class="cz-sh-scene">${sideSvg()}</div>${p.kind === 'tall' || (p.kind === 'two' && !play.lit) ? '' : `<div class="cz-sh-wall">${wallSvg()}</div>`}`;
  const actions = play.done ? '' : `<div class="cz-sci-actions">
      <button type="button" class="gp-btn gp-btn--primary gp-btn--big cz-sci-go" data-action="sh-go">${esc(ht('go', L))}</button>
      ${!play.ctx.puzzle.teach && !play.hint ? `<button type="button" class="gp-btn gp-btn--ghost" data-action="sh-hint"><span aria-hidden="true">💡</span> ${esc(t('hint'))}</button>` : ''}
    </div>`;
  play.host.innerHTML = `<div class="cz-sh" lang="${L}">
    <p class="cz-sci-ask">${esc(askText(L))}</p>
    ${scene}
    ${cards(L)}
    ${play.hint ? `<p class="cz-sci-hint"><span aria-hidden="true">💡</span> ${esc(ht(HINT[p.kind], L))}</p>` : ''}
    ${actions}
    <div class="cz-sci-msg" aria-live="polite">${play.msg ? play.msg(L) : ''}</div>
  </div>`;
  paint();
}

/* ------------------------------------------------------------------ */
/* Light!                                                              */
/* ------------------------------------------------------------------ */

function go() {
  if (play.done) return;
  if (play.picks.some((v) => v === null)) {
    play.msg = (L) => `<p class="cz-sci-say">${esc(ht('pickAll', L))}</p>`;
    paintBoard();
    return;
  }
  const wrong = play.picks.filter((v, k) => v !== play.right[k]).length;
  play.wrong = wrong;
  if (wrong) { play.ctx.surprise(wrong); react('wow', 1600); } else react('happy', 1800);
  play.lit = true;
  play.done = true;
  play.msg = null;
  paintBoard();
  const chId = play.ctx.chapterId;
  play.ctx.onSolved({
    stars: H.starsFor({ wrong: play.wrong, hints: play.hints, teach: !!play.ctx.puzzle.teach }),
    why: (L) => {
      const lines = play.right.map((_, k) => {
        const ok = play.picks[k] === play.right[k];
        return `${ok ? '' : '<span aria-hidden="true">🤯</span> '}<strong>${esc(ok ? ht('right', L, { res: resultText(k, L) }) : ht('surprise', L, { res: resultText(k, L) }))}</strong> ${esc(whyText(k, L))}`;
      });
      const idea = IDEAS.shadow.find((i) => i.ch === chId);
      if (idea) lines.push(`<strong>${esc(idea[L])}</strong> ${esc(idea.why[L])}`);
      if (chId === 'e1') lines.push(esc(ht('puppets', L)));
      return lines;
    }
  });
}

/* ------------------------------------------------------------------ */
/* Clicks, keys, reading aloud                                         */
/* ------------------------------------------------------------------ */

function click(ev) {
  if (!play) return false;
  const q = ev.target.closest('[data-sh-q]');
  if (q && !play.done) {
    const k = Number(q.dataset.shQ);
    const v = Number(q.dataset.shV);
    play.picks[k] = play.picks[k] === v ? null : v;
    play.msg = null;
    paintBoard();
    const el = play.host.querySelector(`[data-sh-q="${k}"][data-sh-v="${v}"]`);
    if (el) el.focus();
    return true;
  }
  const action = ev.target.closest('[data-action]');
  if (!action) return false;
  if (action.dataset.action === 'sh-go') { go(); return true; }
  if (action.dataset.action === 'sh-hint' && !play.hint && !play.done) { play.hint = 1; play.hints = 1; paintBoard(); return true; }
  return false;
}

const key = () => false;
const readAloud = () => { if (play) say([askText(lang())]); };
const repaint = () => { if (play) paintBoard(); };

/* ------------------------------------------------------------------ */
/* Today's experiment                                                  */
/* ------------------------------------------------------------------ */

function dailyPuzzle(level, iso) {
  const list = H.CHAPTERS[level];
  const def = list[hash('shadow-daily', level, iso) % list.length];
  const p = H.makePuzzle(H.chapter(def.id), rngFor('shadow', 'daily', level, iso), H.TEACH + 8);
  return p && !H.problems(p).length ? { puzzle: { id: `daily-${iso}`, ...p }, chapterId: def.id } : null;
}

export default {
  id: 'shadow', bank, chapters, levelOfChapter, tileLabel, draw, repaint, click, key,
  say: readAloud, dailyPuzzle
};
