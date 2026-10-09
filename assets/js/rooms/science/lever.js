/**
 * rooms/science/lever.js — Lift the Elephant, drawn.
 *
 * A side view: a plank on a rock, numbered pegs on each side, animals
 * standing on pegs with their weight on a tag. On Go the plank tips (or stays
 * level) with everything riding on it. Distance is made visible before it is
 * asked about (the research's "encoding" step): every peg is numbered and the
 * hint draws weight × steps under each stack, then each side's total.
 *
 * Which-side puzzles and how-far puzzles are one go. Build puzzles can be
 * tried again: a wrong placement tips the wrong way, the totals are shown,
 * and the child moves an animal.
 */

import * as V from '../../modules/leverlogic.js';
import { bare, notches, steps, the, vt } from '../../modules/levertext.js';
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
    banks.set(level, fetch(`data/science/lever/${level}.json`, { cache: 'no-cache' }).then((res) => {
      if (!res.ok) throw new Error(`Could not load the ${level} planks`);
      return res.json();
    }));
    banks.get(level).catch(() => banks.delete(level));
  }
  return banks.get(level);
}

const chapters = (level, L) => V.CHAPTERS[level].map((ch) => ({
  id: ch.id, icon: ch.icon, title: vt(`ch.${ch.id}`, L), idea: vt(`ch.${ch.id}.idea`, L)
}));
const levelOfChapter = (id) => (V.chapter(id) || {}).level || null;
const TILE_ICON = { tilt: '⚖️', build: '🐘', far: '📐' };
const tileLabel = (p, L) => (p.teach ? { icon: '🎓', text: t('teach') } : { icon: TILE_ICON[p.kind], text: vt(`tile.${p.kind}`, L) });

/* ------------------------------------------------------------------ */
/* State                                                               */
/* ------------------------------------------------------------------ */

let play = null;
let timers = [];

function draw(host, ctx) {
  timers.forEach(clearTimeout);
  timers = [];
  const p = ctx.puzzle;
  play = {
    host, ctx, p,
    placed: (p.tray || []).map(() => null),   // peg per tray animal
    locked: (p.tray || []).map(() => false),
    sel: null,
    pick: null,
    angle: 0,                                 // the plank's tilt now drawn
    shown: null,                              // what the last Go did: 'L', 'R', 'level'
    hints: 0, hint: 0, wrong: 0, done: false, msg: null
  };
  paintBoard();
}

const L0 = () => lang();
const isBuild = () => play.p.kind === 'build';

/** The plank as it stands, with the child's animals on it. */
function plank() {
  const p = play.p;
  if (!isBuild()) return p;
  const extra = p.tray.map((a, k) => (play.placed[k] ? { a, w: V.animal(a).w, peg: play.placed[k], k } : null)).filter(Boolean);
  return { ...p, left: [...p.left, ...extra] };
}

/* ------------------------------------------------------------------ */
/* Drawing                                                             */
/* ------------------------------------------------------------------ */

const W = 360;
const PX = W / 2;          // the rock's top
const PY = 140;
const STEP = 25;
const pegX = (side, g) => PX + (side === 'L' ? -1 : 1) * g * STEP;
const ANGLE = 9;

function stackSvg(side, g, items, L) {
  const x = pegX(side, g);
  return items.map((it, j) => {
    const big = !V.SMALL.find((s) => s.id === it.a);
    const size = big ? 36 : 22;
    const y = PY - 10 - (big ? 20 : 12) - j * 24;
    const mine = it.k !== undefined;
    return `<g class="cz-lv-animal${mine ? ' is-mine' : ''}"${mine ? ` data-lv-take="${it.k}"` : ''}>
      <text x="${x}" y="${y}" font-size="${size}" text-anchor="middle" dominant-baseline="central">${V.animal(it.a).emoji}</text>
      ${play.p.kind === 'far' ? '' : `<circle class="cz-lv-tag" cx="${x + (big ? 16 : 11)}" cy="${y - (big ? 14 : 9)}" r="8"/>
      <text class="cz-lv-tagn" x="${x + (big ? 16 : 11)}" y="${y - (big ? 14 : 9) + 4}" text-anchor="middle">${it.w}</text>`}
    </g>`;
  }).join('');
}

function plankSvg() {
  const L = L0();
  const p = plank();
  const parts = [];
  /* The plank spans the pegs, and two more steps on the side its middle is. */
  const extraL = p.plank && p.plank.side === 'L' ? 2 * p.plank.steps : 0;
  const extraR = p.plank && p.plank.side === 'R' ? 2 * p.plank.steps : 0;
  const x0 = PX - (p.pegs + 0.6 + extraL) * STEP;
  const x1 = PX + (p.pegs + 0.6 + extraR) * STEP;
  parts.push(`<rect class="cz-lv-plank" x="${x0}" y="${PY - 8}" width="${x1 - x0}" height="10" rx="4"/>`);
  for (const side of ['L', 'R']) {
    for (let g = 1; g <= p.pegs; g++) {
      const x = pegX(side, g);
      const pot = side === 'L' && (p.covered || []).includes(g);
      parts.push(`<path class="cz-lv-peg" d="M${x} ${PY - 8} V${PY - 14}"/>`);
      parts.push(`<text class="cz-lv-pegn" x="${x}" y="${PY + 14}" text-anchor="middle">${g}</text>`);
      if (pot) parts.push(`<text x="${x}" y="${PY - 22}" font-size="20" text-anchor="middle" dominant-baseline="central">🪴</text>`);
    }
  }
  if (p.plank) {
    const mx = PX + (p.plank.side === 'L' ? -1 : 1) * p.plank.steps * STEP;
    parts.push(`<rect class="cz-lv-ptoken" x="${mx - 18}" y="${PY - 4}" width="36" height="16" rx="5"/>
      <text class="cz-lv-ptokenn" x="${mx}" y="${PY + 8}" text-anchor="middle">${esc(vt('plankTag', L, { w: p.plank.w }))}</text>`);
  }
  /* Stacks: everything on one peg, bottom up. */
  for (const [side, list] of [['L', p.left], ['R', p.right]]) {
    const byPeg = new Map();
    list.forEach((it) => { if (!byPeg.has(it.peg)) byPeg.set(it.peg, []); byPeg.get(it.peg).push(it); });
    for (const [g, items] of byPeg) parts.push(stackSvg(side, g, items, L));
  }
  return parts.join('');
}

function countsSvg(p) {
  const L = L0();
  const out = [];
  for (const [side, list] of [['L', p.left], ['R', p.right]]) {
    const byPeg = new Map();
    list.forEach((it) => byPeg.set(it.peg, (byPeg.get(it.peg) || 0) + it.w));
    for (const [g, w] of byPeg) out.push(`<text class="cz-lv-count" x="${pegX(side, g)}" y="${PY + 46}" text-anchor="middle">${w}×${g}</text>`);
  }
  if (play.hint >= 2 || play.shown) {
    out.push(`<text class="cz-lv-total" x="${PX - 3.5 * STEP}" y="${PY + 66}" text-anchor="middle">= ${V.pushL(p)}</text>`);
    out.push(`<text class="cz-lv-total" x="${PX + 3.5 * STEP}" y="${PY + 66}" text-anchor="middle">= ${V.pushR(p)}</text>`);
  }
  return `<g aria-hidden="true">${out.join('')}</g>`;
}

function sceneSvg() {
  const L = L0();
  const p = play.p;
  const pegHits = isBuild() && !play.done ? Array.from({ length: p.pegs }, (_, i) => {
    const g = i + 1;
    const x = pegX('L', g);
    const k = play.placed.indexOf(g);
    const pot = (p.covered || []).includes(g);
    const label = vt('pegLabel', L, { n: g });
    const aria = pot ? vt('pegPot', L, { peg: label }) : k >= 0 ? vt('pegFull', L, { peg: label, it: the(p.tray[k], L) }) : vt('pegEmpty', L, { peg: label });
    return `<rect class="cz-lv-hit" x="${x - STEP / 2}" y="${PY - 90}" width="${STEP}" height="100" data-lv-peg="${g}"
      role="button" tabindex="0" aria-label="${esc(aria)}"/>`;
  }).join('') : '';
  const far = p.kind === 'far' && play.shown ? farMarks() : '';
  /* "How far" is pushed by hand: weights play no part, so no tags or sums. */
  const counts = p.kind !== 'far' && (play.hint >= 1 || play.shown) ? countsSvg(plank()) : '';
  return `<svg class="cz-lv-svg" viewBox="0 20 ${W} ${PY + 56}" role="img" aria-label="${esc(sceneLabel(L))}">
    <path class="cz-lv-ground" d="M0 ${PY + 30} H${W}"/>
    <path class="cz-lv-rock" d="M${PX - 22} ${PY + 30} L${PX} ${PY + 2} L${PX + 22} ${PY + 30} Z"/>
    <g class="cz-lv-tilt" data-lv-tilt data-style="transform:rotate(${play.angle}deg);transform-origin:${PX}px ${PY}px">${plankSvg()}</g>
    ${far}
    ${counts}
    ${pegHits}
  </svg>`;
}

/* "How far": arrows for how far each end moved. */
function farMarks() {
  const L = L0();
  const p = play.p;
  const e = p.left[0].peg;
  const l = p.right[0].peg;
  return `<g class="cz-lv-far" aria-hidden="true">
    <text x="${pegX('L', e)}" y="${PY + 52}" text-anchor="middle">↓ ${esc(notches(p.down, L))}</text>
    <text x="${pegX('R', l)}" y="${PY - 72}" text-anchor="middle">↑ ${esc(notches(V.riseOf(p), L))}</text>
  </g>`;
}

function sceneLabel(L) {
  const p = plank();
  const list = [...p.left.map((x) => ({ ...x, side: 'left' })), ...p.right.map((x) => ({ ...x, side: 'right' }))];
  return list.map((x) => `${vt(x.side, L)}: ${vt('weighs', L, { It: the(x.a, L, true), w: x.w, p: x.peg })}`).join('. ');
}

/* ------------------------------------------------------------------ */
/* Questions, the tray, results                                        */
/* ------------------------------------------------------------------ */

function askText(L) {
  const p = play.p;
  if (p.kind === 'tilt') return vt('ask.tilt', L);
  if (p.kind === 'far') return vt('ask.far', L, { small: bare(p.left[0].a, L), dd: notches(p.down, L), it: the(p.right[0].a, L) });
  return p.goal === 'lift' ? vt('ask.lift', L, { it: the(p.right[0].a, L) }) : vt('ask.level', L);
}

function optionsHtml(L) {
  const p = play.p;
  if (play.done) return '';
  const opts = p.kind === 'tilt' ? ['L', 'level', 'R'] : p.opts.map((_, i) => i);
  const word = (v) => (p.kind === 'tilt' ? `${{ L: '↙', level: '➖', R: '↘' }[v]} ${vt(`tilt.${v}`, L)}` : notches(p.opts[v], L));
  return `<div class="cz-sci-opts cz-lv-opts" role="group" aria-label="${esc(askText(L))}">
    ${opts.map((v) => `<button type="button" class="gp-btn cz-sci-opt${play.pick === v ? ' is-on' : ''}" aria-pressed="${play.pick === v}"
      data-lv-pick="${v}">${esc(word(v))}</button>`).join('')}
  </div>`;
}

function trayHtml(L) {
  const p = play.p;
  if (play.done) return '';
  return `<div class="cz-ff-tray" role="group" aria-label="${esc(vt('tray', L))}">
    <strong>${esc(vt('tray', L))}</strong>
    <div class="cz-ff-pieces">
      ${p.tray.map((a, k) => {
        const used = play.placed[k] !== null;
        const on = play.sel === k;
        return `<button type="button" class="gp-btn cz-ff-piece${on ? ' is-on' : ''}${used ? ' is-used' : ''}" data-lv-tray="${k}"
          aria-pressed="${on}" ${used ? 'disabled' : ''}><span class="cz-lv-emoji" aria-hidden="true">${V.animal(a).emoji}</span>
          <span>${esc(the(a, L, true))} · ${V.animal(a).w}</span></button>`;
      }).join('')}
    </div>
  </div>`;
}

/* The numbers behind the answer: "2 × 3 + 1 × 5 = 11". */
function sideSum(list, extra, L) {
  if (!list.length && !extra) return vt('why.empty', L);
  const terms = list.map((x) => `${x.w} × ${x.peg}`);
  if (extra) terms.push(`${extra.w} × ${extra.steps}`);
  const total = list.reduce((s, x) => s + x.w * x.peg, 0) + (extra ? extra.w * extra.steps : 0);
  return terms.length > 1 ? `${terms.join(' + ')} = ${total}` : `${terms[0]} = ${total}`;
}

function whyTilt(p, L) {
  const lines = [];
  const pl = p.plank;
  lines.push(vt('why.count', L, { l: sideSum(p.left, pl && pl.side === 'L' ? pl : null, L), r: sideSum(p.right, pl && pl.side === 'R' ? pl : null, L) }));
  const tl = V.tilt(p);
  lines.push(tl === 'level' ? vt('why.equal', L) : vt('why.bigger', L, { side: vt(tl === 'L' ? 'left' : 'right', L) }));
  if (pl) lines.push(vt('why.plank', L, { w: pl.w, ss: steps(pl.steps, L), side: vt(pl.side === 'L' ? 'left' : 'right', L), t: pl.w * pl.steps }));
  if (p.kind === 'tilt' && V.addRule(p) !== tl && play.ctx.level === 'hard') {
    lines.push(vt('why.add', L, { wrong: vt(`tilt.${V.addRule(p)}`, L), rightt: vt(`tilt.${tl}`, L) }));
  } else if (p.kind === 'tilt' && V.weightOnly(p) !== tl) lines.push(vt('why.weightOnly', L));
  return lines;
}

function whyFar(L) {
  const p = play.p;
  const e = p.left[0].peg;
  const l = p.right[0].peg;
  return [
    vt('why.far', L, { Small: the(p.left[0].a, L, true), small: bare(p.left[0].a, L), it: the(p.right[0].a, L), e, l, d: p.down, r: V.riseOf(p) }),
    vt('why.trade', L)
  ];
}

const resultHtml = (ok, head, lines) => `<p class="cz-sci-result ${ok ? 'is-right' : 'is-surprise'}">
  ${ok ? '' : '<span class="cz-sci-wow" aria-hidden="true">🤯</span>'}<strong>${esc(head)}</strong>
  <span class="cz-sci-rwhy">${lines.map(esc).join(' ')}</span></p>`;

/* ------------------------------------------------------------------ */
/* Painting                                                            */
/* ------------------------------------------------------------------ */

function paintBoard() {
  const L = L0();
  const p = play.p;
  const actions = play.done ? '' : `<div class="cz-sci-actions">
      <button type="button" class="gp-btn gp-btn--primary gp-btn--big cz-sci-go" data-action="lv-go">${esc(vt('go', L))}</button>
      ${canHint() ? `<button type="button" class="gp-btn gp-btn--ghost" data-action="lv-hint"><span aria-hidden="true">💡</span> ${esc(play.hint ? t('hintMore') : t('hint'))}</button>` : ''}
    </div>`;
  const plankHelp = p.plank ? `<p class="cz-sci-help">🪵 ${esc(vt('plankHelp', L, { w: p.plank.w, ss: steps(p.plank.steps, L), side: vt(p.plank.side === 'L' ? 'left' : 'right', L) }))}</p>` : '';
  play.host.innerHTML = `<div class="cz-lv" lang="${L}">
    <p class="cz-sci-ask">${esc(askText(L))}</p>
    ${p.kind === 'far' ? '' : `<p class="cz-sci-help">${esc(vt(isBuild() ? 'helpBuild' : 'help', L))}</p>`}
    ${plankHelp}
    <div class="cz-lv-scene">${sceneSvg()}</div>
    ${isBuild() ? trayHtml(L) : optionsHtml(L)}
    ${play.hintText ? `<p class="cz-sci-hint"><span aria-hidden="true">💡</span> ${esc(play.hintText(L))}</p>` : ''}
    ${actions}
    <div class="cz-sci-msg" aria-live="polite">${play.msg ? play.msg(L) : ''}</div>
  </div>`;
  paint();
}

/* ------------------------------------------------------------------ */
/* Go                                                                  */
/* ------------------------------------------------------------------ */

const angleOf = (tl) => (tl === 'L' ? -ANGLE : tl === 'R' ? ANGLE : 0);

/* Tip the plank to `tl`, smoothly unless motion is reduced, then `then()`. */
function tip(tl, then) {
  play.shown = tl;
  const target = angleOf(tl);
  const from = play.angle;
  play.angle = target;
  paintBoard();
  const g = play.host.querySelector('[data-lv-tilt]');
  if (calm() || !g || document.hidden || from === target) { then(); return; }
  g.style.transform = `rotate(${from}deg)`;
  g.classList.add('is-still');
  requestAnimationFrame(() => requestAnimationFrame(() => {
    g.classList.remove('is-still');
    g.style.transform = `rotate(${target}deg)`;
  }));
  timers.push(setTimeout(then, 900));
}

function go() {
  if (play.done) return;
  const p = play.p;
  if (isBuild()) {
    if (play.placed.some((g) => g === null)) { play.msg = (L) => `<p class="cz-sci-say">${esc(vt('pickPlace', L))}</p>`; paintBoard(); return; }
    const q = plank();
    const tl = V.tilt(q);
    play.hintText = null;
    tip(tl, () => judgeBuild(q, tl));
    return;
  }
  if (play.pick === null) { play.msg = (L) => `<p class="cz-sci-say">${esc(vt('pickOne', L))}</p>`; paintBoard(); return; }
  play.hintText = null;
  const tl = p.kind === 'far' ? 'L' : V.tilt(p);
  tip(tl, () => {
    const right = V.answers(p)[0];
    const ok = play.pick === right;
    play.wrong = ok ? 0 : 1;
    if (!ok) { play.ctx.surprise(1); react('wow', 1600); }
    finish(ok);
  });
}

function judgeBuild(q, tl) {
  const p = play.p;
  if (tl === V.goalTilt(p)) { finish(true); return; }
  play.wrong += 1;
  play.ctx.surprise(1);
  react('wow', 1600);
  play.msg = (L) => `<p class="cz-sci-surprise"><span class="cz-sci-surprise__icon" aria-hidden="true">🤯</span><span>
    <strong>${esc(t('surprise'))} ${esc(vt('notYet', L, { res: vt(`res.${tl}`, L) }))}</strong>
    ${esc(whyTilt(q, L).join(' '))} ${esc(vt('tryMore', L))}</span></p>`;
  paintBoard();
}

function finish(ok) {
  play.done = true;
  if (!play.wrong) react('happy', 1800);
  const p = play.p;
  const q = plank();
  const head = (L) => {
    if (p.kind === 'far') return ok ? vt('farRight', L, { n: notches(V.riseOf(p), L) }) : vt('farSurprise', L, { n: notches(V.riseOf(p), L) });
    if (isBuild()) return p.goal === 'lift' ? vt('upGoes', L, { it: the(p.right[0].a, L) }) : vt('levelDone', L);
    const res = vt(`res.${V.tilt(p)}`, L);
    return ok ? vt('right', L, { res }) : vt('surprise', L, { res });
  };
  const lines = (L) => (p.kind === 'far' ? whyFar(L) : whyTilt(q, L));
  play.msg = (L) => resultHtml(isBuild() ? true : ok, head(L), lines(L));
  paintBoard();
  const chId = play.ctx.chapterId;
  play.ctx.onSolved({
    stars: V.starsFor({ wrong: play.wrong, hints: play.hints, teach: !!play.ctx.puzzle.teach }),
    why: (L) => {
      const out = [`${isBuild() || ok ? '' : '<span aria-hidden="true">🤯</span> '}<strong>${esc(head(L))}</strong> ${lines(L).map(esc).join(' ')}`];
      const idea = IDEAS.lever.find((i) => i.ch === chId);
      if (idea) out.push(`<strong>${esc(idea[L])}</strong> ${esc(idea.why[L])}`);
      if (chId === 'e2' || chId === 'm3') out.push(esc(vt('archimedes', L)));
      return out;
    }
  });
}

/* ------------------------------------------------------------------ */
/* Hints                                                               */
/* ------------------------------------------------------------------ */

const canHint = () => !play.done && !play.ctx.puzzle.teach && play.hint < 2;

function hint() {
  const p = play.p;
  play.hint += 1;
  play.hints += 1;
  if (p.kind === 'far') {
    play.hint = 2;
    play.hintText = (L) => vt('hintFar', L, { Small: the(p.left[0].a, L, true), e: p.left[0].peg, it: the(p.right[0].a, L), l: p.right[0].peg });
  } else if (isBuild() && play.hint === 2) {
    /* Put one right animal on its peg, and keep it there. */
    const [sol] = V.solutions(p, 1);
    const want = sol.split(',').map((s) => { const [a, g] = s.split('@'); return { a, g: Number(g) }; });
    const miss = want.find((w) => !p.tray.some((a, k) => a === w.a && play.placed[k] === w.g));
    if (miss) {
      const k = p.tray.findIndex((a, j) => a === miss.a && !play.locked[j]);
      play.placed = play.placed.map((g) => (g === miss.g ? null : g));
      play.placed[k] = miss.g;
      play.locked[k] = true;
    }
    play.hintText = (L) => vt('hintPlace', L);
  } else {
    play.hintText = (L) => vt(play.hint === 1 ? 'hintCount' : 'hintTotals', L);
  }
  play.angle = 0;
  play.shown = null;
  paintBoard();
}

/* ------------------------------------------------------------------ */
/* Clicks, keys, reading aloud                                         */
/* ------------------------------------------------------------------ */

function tapPeg(g) {
  const p = play.p;
  if (play.done) return;
  if ((p.covered || []).includes(g)) { play.msg = (L) => `<p class="cz-sci-say">${esc(vt('potHere', L))}</p>`; paintBoard(); return; }
  const here = play.placed.indexOf(g);
  play.angle = 0;
  play.shown = null;
  if (play.sel !== null) {
    if (here >= 0 && play.locked[here]) return;
    if (here >= 0) play.placed[here] = null;
    play.placed[play.sel] = g;
    play.sel = null;
    play.msg = null;
  } else if (here >= 0 && !play.locked[here]) {
    play.placed[here] = null;
  } else if (here < 0) {
    play.msg = (L) => `<p class="cz-sci-say">${esc(vt('pickAnimal', L))}</p>`;
  }
  paintBoard();
  const el = play.host.querySelector(`[data-lv-peg="${g}"]`);
  if (el) el.focus();
}

function click(ev) {
  if (!play) return false;
  const peg = ev.target.closest('[data-lv-peg]');
  if (peg) { tapPeg(Number(peg.dataset.lvPeg)); return true; }
  const tray = ev.target.closest('[data-lv-tray]');
  if (tray && !play.done) {
    const k = Number(tray.dataset.lvTray);
    play.sel = play.sel === k ? null : k;
    play.msg = play.sel === null ? null : (L) => `<p class="cz-sci-say">${esc(vt('picked', L, { It: the(play.p.tray[k], L, true) }))}</p>`;
    paintBoard();
    const el = play.host.querySelector(`[data-lv-tray="${k}"]`);
    if (el) el.focus();
    return true;
  }
  const pick = ev.target.closest('[data-lv-pick]');
  if (pick && !play.done) {
    const raw = pick.dataset.lvPick;
    const v = /^\d+$/.test(raw) ? Number(raw) : raw;
    play.pick = play.pick === v ? null : v;
    play.msg = null;
    paintBoard();
    const el = play.host.querySelector(`[data-lv-pick="${v}"]`);
    if (el) el.focus();
    return true;
  }
  const action = ev.target.closest('[data-action]');
  if (!action) return false;
  if (action.dataset.action === 'lv-go') { go(); return true; }
  if (action.dataset.action === 'lv-hint') { if (canHint()) hint(); return true; }
  return false;
}

function key(ev) {
  if (!play || play.done) return false;
  const peg = ev.target.closest && ev.target.closest('[data-lv-peg]');
  if (peg && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); tapPeg(Number(peg.dataset.lvPeg)); return true; }
  return false;
}

function readAloud() {
  if (!play) return;
  const L = lang();
  say([askText(L), vt('help', L), sceneLabel(L)]);
}

const repaint = () => { if (play) paintBoard(); };
const leave = () => { timers.forEach(clearTimeout); timers = []; };

/* ------------------------------------------------------------------ */
/* Today's experiment                                                  */
/* ------------------------------------------------------------------ */

function dailyPuzzle(level, iso) {
  const list = V.CHAPTERS[level];
  const def = list[hash('lever-daily', level, iso) % list.length];
  const p = V.makePuzzle(V.chapter(def.id), rngFor('lever', 'daily', level, iso), V.TEACH + 8);
  return p && !V.problems(p).length ? { puzzle: { id: `daily-${iso}`, ...p }, chapterId: def.id } : null;
}

export default {
  id: 'lever', bank, chapters, levelOfChapter, tileLabel, draw, repaint, click, key,
  say: readAloud, dailyPuzzle, leave
};
