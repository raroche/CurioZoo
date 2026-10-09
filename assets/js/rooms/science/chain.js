/**
 * rooms/science/chain.js — Sun to Lion, drawn.
 *
 * Chains are a row of tiles that wraps on a phone: the Sun, then every
 * living thing, joined by arrows that point at the one who eats. Little dots
 * of energy run along every arrow from the food to the eater, so "gives food
 * to" is something you can watch, and a backwards arrow looks backwards.
 *
 * Webs are drawn in layers: plants at the bottom, the animals that eat them
 * above, and so on up. Every question about a web is about the picture.
 *
 * Every puzzle is one go: choose, press Check, read why.
 */

import * as C from '../../modules/chainlogic.js';
import { aThe, ct, deThe, pair, the } from '../../modules/chaintext.js';
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
    banks.set(level, fetch(`data/science/chain/${level}.json`, { cache: 'no-cache' }).then((res) => {
      if (!res.ok) throw new Error(`Could not load the ${level} food chains`);
      return res.json();
    }));
    banks.get(level).catch(() => banks.delete(level));
  }
  return banks.get(level);
}

const chapters = (level, L) => C.CHAPTERS[level].map((ch) => ({
  id: ch.id, icon: ch.icon, title: ct(`ch.${ch.id}`, L), idea: ct(`ch.${ch.id}.idea`, L)
}));
const levelOfChapter = (id) => (C.chapter(id) || {}).level || null;
const TILE_ICON = { chain: '🔗', arrow: '↔️', web: '🕸️', hungry: '🍽️', roles: '♻️' };
const tileLabel = (p, L) => (p.teach ? { icon: '🎓', text: t('teach') } : { icon: TILE_ICON[p.kind], text: ct(`tile.${p.kind}`, L) });

/* ------------------------------------------------------------------ */
/* State                                                               */
/* ------------------------------------------------------------------ */

let play = null;

function draw(host, ctx) {
  const p = ctx.puzzle;
  play = { host, ctx, p, right: C.answers(p), picks: C.answers(p).map(() => null), hint: 0, hints: 0, wrong: 0, done: false, msg: null };
  paintBoard();
}

const L0 = () => lang();
const emoji = (id) => (id === C.SOIL ? '🟫' : C.species(id).emoji);

/* ------------------------------------------------------------------ */
/* Chains                                                              */
/* ------------------------------------------------------------------ */

const tile = (id, L, cls = '') => `<span class="cz-ch-tile${cls}"><span class="cz-ch-emoji" aria-hidden="true">${emoji(id)}</span>
  <span class="cz-ch-name">${esc(the(id, L, true))}</span></span>`;

/* An arrow with energy dots running along it, from food to eater. */
const arrow = (n, back = false) => `<span class="cz-ch-arrow${back ? ' is-back' : ''}" aria-hidden="true">
  <span class="cz-ch-shaft"><span class="cz-ch-dot"></span><span class="cz-ch-dot"></span></span>
  ${n ? `<span class="cz-ch-arrown">${n}</span>` : ''}</span>`;

function chainHtml() {
  const L = L0();
  const p = play.p;
  const parts = [`<span class="cz-ch-tile is-sun"><span class="cz-ch-emoji" aria-hidden="true">☀️</span><span class="cz-ch-name">${esc(ct('sun', L))}</span></span>`];
  p.nodes.forEach((id, k) => {
    /* The arrow into slot k; in an arrow puzzle every arrow between living things is numbered. */
    const num = p.kind === 'arrow' && k > 0 ? k : 0;
    const back = p.kind === 'arrow' && k === p.flip && !play.done;
    parts.push(arrow(num, back));
    const blank = p.kind === 'chain' && p.blanks.includes(k);
    if (!blank) { parts.push(tile(id, L)); return; }
    const q = p.blanks.indexOf(k);
    const picked = play.picks[q];
    if (play.done) parts.push(tile(id, L, picked === id ? ' is-right' : ' is-surprise'));
    else if (picked) parts.push(tile(picked, L, ' is-picked'));
    else parts.push(`<span class="cz-ch-tile is-blank"><span class="cz-ch-emoji" aria-hidden="true">?</span><span class="cz-ch-name">${esc(ct('box', L, { n: q + 1 }))}</span></span>`);
  });
  return `<div class="cz-ch-chain" role="img" aria-label="${esc(chainLabel(L))}">${parts.join('')}</div>`;
}

function chainLabel(L) {
  const p = play.p;
  const names = p.nodes.map((id, k) => (p.kind === 'chain' && p.blanks.includes(k) && !play.done ? ct('box', L, { n: p.blanks.indexOf(k) + 1 }) : the(id, L)));
  return [ct('sun', L), ...names].join(' → ');
}

/* ------------------------------------------------------------------ */
/* Webs                                                                */
/* ------------------------------------------------------------------ */

function webSvg() {
  const L = L0();
  const p = play.p;
  const web = p.web;
  const lv = C.levels(web);
  const top = Math.max(...lv.values());
  const W = 360;
  const rowH = 78;
  const H = (top + 1) * rowH + 16;
  const byLevel = new Map();
  web.nodes.forEach((id) => { const l = lv.get(id); if (!byLevel.has(l)) byLevel.set(l, []); byLevel.get(l).push(id); });
  /* Plants first, then each row in the order of where its food sits, so
     arrows cross as little as they can. */
  const pos = new Map();
  for (let l = 0; l <= top; l++) {
    const ids = byLevel.get(l) || [];
    if (l > 0) {
      const at = (id) => {
        const xs = web.edges.filter(([, e]) => e === id).map(([f]) => (pos.get(f) || [W / 2])[0]);
        return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : W / 2;
      };
      ids.sort((a, b) => at(a) - at(b));
    }
    ids.forEach((id, i) => pos.set(id, [((i + 1) * W) / (ids.length + 1), H - 30 - l * rowH]));
  }
  const gone = p.kind === 'hungry' && play.done ? p.gone : p.kind === 'hungry' ? p.gone : null;
  const hungrySet = p.kind === 'hungry' && play.done ? C.hungry(web, p.gone) : new Set();
  const edges = web.edges.map(([f, e]) => {
    const [x1, y1] = pos.get(f);
    const [x2, y2] = pos.get(e);
    const len = Math.hypot(x2 - x1, y2 - y1);
    const ux = (x2 - x1) / len;
    const uy = (y2 - y1) / len;
    const cut = f === gone;
    return `<path class="cz-ch-edge${cut ? ' is-cut' : ''}" d="M${x1 + ux * 22} ${y1 + uy * 22} L${x2 - ux * 26} ${y2 - uy * 26}" marker-end="url(#cz-ch-head)"/>`;
  }).join('');
  const nodes = web.nodes.map((id) => {
    const [x, y] = pos.get(id);
    const out = id === gone;
    const hungry = hungrySet.has(id);
    return `<g class="cz-ch-node${out ? ' is-gone' : ''}${hungry ? ' is-hungry' : ''}">
      <circle cx="${x}" cy="${y}" r="21"/>
      <text x="${x}" y="${y + 1}" font-size="22" text-anchor="middle" dominant-baseline="central">${emoji(id)}</text>
      <text class="cz-ch-nodename" x="${x}" y="${y + 34}" text-anchor="middle">${esc(the(id, L, true).replace(/ \(.*\)$/, ''))}</text>
      ${out ? `<path class="cz-ch-x" d="M${x - 16} ${y - 16} L${x + 16} ${y + 16} M${x + 16} ${y - 16} L${x - 16} ${y + 16}"/>` : ''}
      ${hungry ? `<text x="${x + 18}" y="${y - 14}" font-size="16">😟</text>` : ''}
    </g>`;
  }).join('');
  return `<svg class="cz-ch-svg" viewBox="0 0 ${W} ${H + 12}" role="img" aria-label="${esc(webLabel(L))}">
    <defs><marker id="cz-ch-head" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0 0 L10 5 L0 10 Z" class="cz-ch-headfill"/></marker></defs>
    ${edges}${nodes}</svg>`;
}

function webLabel(L) {
  return play.p.web.edges.map(([f, e]) => ct('why.link', L, pair(f, e, L))).join(' ');
}

/* ------------------------------------------------------------------ */
/* Questions                                                           */
/* ------------------------------------------------------------------ */

function askText(L) {
  const p = play.p;
  if (p.kind === 'hungry') return ct('ask.hungry', L, { It: the(p.gone, L, true) });
  return ct(`ask.${p.kind}`, L);
}

function question(k, L) {
  const p = play.p;
  switch (p.kind) {
    case 'chain': return ct('box', L, { n: k + 1 });
    case 'arrow': return '';
    case 'web': { const [x, y] = p.qs[k]; return ct('q', L, { y: the(y, L), ax: aThe(x, L) }); }
    case 'hungry': case 'roles': return the(p.ask[k], L, true);
    default: return '';
  }
}

function choiceText(k, v, L) {
  const p = play.p;
  switch (p.kind) {
    case 'chain': return `${emoji(v)} ${the(v, L, true)}`;
    case 'arrow': return ct('arrowN', L, { n: v });
    case 'web': return ct(v, L);
    case 'hungry': return v === 'hungry' ? `😟 ${ct('hungryOpt', L)}` : `🙂 ${ct('fineOpt', L)}`;
    case 'roles': return ct(`role.${v}`, L);
    default: return String(v);
  }
}

function resultText(k, L) {
  const p = play.p;
  const r = play.right[k];
  switch (p.kind) {
    case 'chain': return ct('res.box', L, { n: k + 1, it: the(r, L) });
    case 'arrow': return ct('res.arrow', L, { n: r });
    case 'web': { const [x, y] = p.qs[k]; return ct(r === 'yes' ? 'res.yes' : 'res.no', L, { y: the(y, L), ax: aThe(x, L) }); }
    case 'hungry': return ct(r === 'hungry' ? 'res.hungry' : 'res.fine', L, { It: the(p.ask[k], L, true) });
    case 'roles': return ct('res.role', L, { It: the(p.ask[k], L, true), role: ct(`role.${r}`, L) });
    default: return '';
  }
}

/* Why, from the same facts the checker used. */
function whyText(k, L) {
  const p = play.p;
  const picked = play.picks[k];
  switch (p.kind) {
    case 'chain': {
      const slot = p.blanks[k];
      const right = p.nodes[slot];
      const lines = [];
      if (slot === 0) lines.push(ct('why.sun', L));
      if (slot > 0) lines.push(ct('why.link', L, pair(p.nodes[slot - 1], right, L)));
      if (slot < p.nodes.length - 1) lines.push(ct('why.link', L, pair(right, p.nodes[slot + 1], L)));
      if (picked && picked !== right) {
        if (picked === C.SOIL) lines.push(ct('why.soil', L));
        else if (slot === 0) lines.push(ct('why.notPlant', L, { A: the(picked, L, true) }));
        else lines.push(ct(C.species(picked).role === 'meat' ? 'why.onlyMeat' : 'why.onlyPlants', L, { A: the(picked, L, true) }));
      }
      if (C.species(right).fact) lines.push(ct(`fact.${right}`, L));
      return lines.join(' ');
    }
    case 'arrow': {
      const a = p.nodes[p.flip - 1];
      const b = p.nodes[p.flip];
      return ct('why.arrow', L, pair(a, b, L));
    }
    case 'web': {
      const [x, y] = p.qs[k];
      const vars = { dy: deThe(y, L), ax: aThe(x, L) };
      return play.right[k] === 'yes' ? ct('why.webYes', L, vars) : ct('why.webNo', L, vars);
    }
    case 'hungry': {
      const id = p.ask[k];
      return play.right[k] === 'hungry' ? ct('why.hungry', L, { x: the(id, L) }) : ct('why.fine', L, { X: the(id, L, true) });
    }
    case 'roles': {
      const id = p.ask[k];
      const fact = C.species(id).fact ? ` ${ct(`fact.${id}`, L)}` : '';
      return ct(`why.role.${play.right[k]}`, L) + fact;
    }
    default: return '';
  }
}

function card(k, L) {
  const p = play.p;
  const opts = C.choices(p)[k];
  const picked = play.picks[k];
  const ok = play.done ? picked === play.right[k] : null;
  const name = question(k, L);
  const head = p.kind === 'hungry' || p.kind === 'roles' ? `<span class="cz-sci-pic" aria-hidden="true">${emoji(p.ask[k])}</span>` : '';
  const buttons = play.done ? '' : `<div class="cz-sci-opts${p.kind === 'roles' ? ' cz-ch-roles' : ''}" role="group" aria-label="${esc(name || askText(L))}">
    ${opts.map((v) => `<button type="button" class="gp-btn cz-sci-opt${picked === v ? ' is-on' : ''}" aria-pressed="${picked === v}"
      data-ch-q="${k}" data-ch-v="${v}">${esc(choiceText(k, v, L))}</button>`).join('')}</div>`;
  const result = play.done ? `<p class="cz-sci-result ${ok ? 'is-right' : 'is-surprise'}">
    ${ok ? '' : '<span class="cz-sci-wow" aria-hidden="true">🤯</span>'}<strong>${esc(ok ? ct('right', L, { res: resultText(k, L) }) : ct('surprise', L, { res: resultText(k, L) }))}</strong>
    <span class="cz-sci-rwhy">${esc(whyText(k, L))}</span></p>` : '';
  return `<li class="cz-sci-card${ok === true ? ' is-right' : ok === false ? ' is-surprise' : ''}">
    ${name ? `<div class="cz-sci-cardhead">${head}<span class="cz-sci-cardname">${esc(name)}</span></div>` : ''}
    ${buttons}${result}</li>`;
}

/* ------------------------------------------------------------------ */
/* Painting                                                            */
/* ------------------------------------------------------------------ */

const HINT_KEY = { chain: 'hintChain', arrow: 'hintArrow', web: 'hintWeb', hungry: 'hintHungry', roles: 'hintRoles' };

function paintBoard() {
  const L = L0();
  const p = play.p;
  const n = play.right.length;
  const scene = p.kind === 'chain' || p.kind === 'arrow' ? chainHtml() : p.kind === 'roles' ? '' : `<div class="cz-ch-scene">${webSvg()}</div>`;
  const actions = play.done ? '' : `<div class="cz-sci-actions">
      <button type="button" class="gp-btn gp-btn--primary gp-btn--big cz-sci-go" data-action="ch-go">${esc(ct('check', L))}</button>
      ${!play.ctx.puzzle.teach && !play.hint ? `<button type="button" class="gp-btn gp-btn--ghost" data-action="ch-hint"><span aria-hidden="true">💡</span> ${esc(t('hint'))}</button>` : ''}
    </div>`;
  play.host.innerHTML = `<div class="cz-ch${play.done ? ' is-done' : ''}" lang="${L}">
    <p class="cz-sci-ask">${esc(askText(L))}</p>
    ${scene}
    <ol class="cz-sci-cards${n === 1 ? ' is-one' : ''}">${Array.from({ length: n }, (_, k) => card(k, L)).join('')}</ol>
    ${play.hint ? `<p class="cz-sci-hint"><span aria-hidden="true">💡</span> ${esc(ct(HINT_KEY[p.kind], L))}</p>` : ''}
    ${actions}
    <div class="cz-sci-msg" aria-live="polite">${play.msg ? play.msg(L) : ''}</div>
  </div>`;
  paint();
}

/* ------------------------------------------------------------------ */
/* Checking                                                            */
/* ------------------------------------------------------------------ */

function go() {
  if (play.done) return;
  if (play.picks.some((v) => v === null)) {
    play.msg = (L) => `<p class="cz-sci-say">${esc(ct('pickAll', L))}</p>`;
    paintBoard();
    return;
  }
  const wrong = play.picks.filter((v, k) => v !== play.right[k]).length;
  play.wrong = wrong;
  if (wrong) { play.ctx.surprise(wrong); react('wow', 1600); } else react('happy', 1800);
  play.done = true;
  play.msg = null;
  paintBoard();
  const chId = play.ctx.chapterId;
  play.ctx.onSolved({
    stars: C.starsFor({ wrong: play.wrong, hints: play.hints, teach: !!play.ctx.puzzle.teach }),
    why: (L) => {
      const lines = play.right.map((_, k) => {
        const ok = play.picks[k] === play.right[k];
        return `${ok ? '' : '<span aria-hidden="true">🤯</span> '}<strong>${esc(ok ? ct('right', L, { res: resultText(k, L) }) : ct('surprise', L, { res: resultText(k, L) }))}</strong> ${esc(whyText(k, L))}`;
      });
      if (play.p.kind === 'hungry') lines.push(esc(ct('why.domino', L)));
      const idea = IDEAS.chain.find((i) => i.ch === chId);
      if (idea) lines.push(`<strong>${esc(idea[L])}</strong> ${esc(idea.why[L])}`);
      if (chId === 'e2') lines.push(esc(ct('willow', L)));
      return lines;
    }
  });
}

/* ------------------------------------------------------------------ */
/* Clicks, keys, reading aloud                                         */
/* ------------------------------------------------------------------ */

function click(ev) {
  if (!play) return false;
  const q = ev.target.closest('[data-ch-q]');
  if (q && !play.done) {
    const k = Number(q.dataset.chQ);
    const raw = q.dataset.chV;
    const v = /^\d+$/.test(raw) ? Number(raw) : raw;
    play.picks[k] = play.picks[k] === v ? null : v;
    play.msg = null;
    paintBoard();
    const el = play.host.querySelector(`[data-ch-q="${k}"][data-ch-v="${v}"]`);
    if (el) el.focus();
    return true;
  }
  const action = ev.target.closest('[data-action]');
  if (!action) return false;
  if (action.dataset.action === 'ch-go') { go(); return true; }
  if (action.dataset.action === 'ch-hint' && !play.hint && !play.done) { play.hint = 1; play.hints = 1; paintBoard(); return true; }
  return false;
}

const key = () => false;

function readAloud() {
  if (!play) return;
  const L = lang();
  const p = play.p;
  const parts = [askText(L)];
  if (p.kind === 'chain' || p.kind === 'arrow') parts.push(chainLabel(L));
  else if (p.kind !== 'roles') parts.push(webLabel(L));
  play.right.forEach((_, k) => { if (question(k, L)) parts.push(question(k, L)); });
  say(parts);
}

const repaint = () => { if (play) paintBoard(); };

/* ------------------------------------------------------------------ */
/* Today's experiment                                                  */
/* ------------------------------------------------------------------ */

function dailyPuzzle(level, iso) {
  const list = C.CHAPTERS[level];
  const def = list[hash('chain-daily', level, iso) % list.length];
  const p = C.makePuzzle(C.chapter(def.id), rngFor('chain', 'daily', level, iso), C.TEACH + 8);
  return p && !C.problems(p).length ? { puzzle: { id: `daily-${iso}`, ...p }, chapterId: def.id } : null;
}

export default {
  id: 'chain', bank, chapters, levelOfChapter, tileLabel, draw, repaint, click, key,
  say: readAloud, dailyPuzzle
};
