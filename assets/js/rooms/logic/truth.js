/**
 * rooms/logic/truth.js — Truth Island, drawn.
 *
 * The animals stand in a row, each with a speech bubble and a token slot.
 * Tapping the slot cycles ? → Sun → Moon (→ Cloud). From Medium on there is
 * a pencil: tokens placed with it only mean "maybe", and every bubble shows
 * whether its sentence would then be true or false, with a clash flagged in
 * words. The research found that holding a "suppose" in your head is the hard
 * part, so the pencil keeps it on the screen instead.
 *
 * The rules are in modules/truthlogic.js; every word is in truthtext.js.
 */

import * as T from '../../modules/truthlogic.js';
import * as P from '../../modules/logicprogress.js';
import { ITEM_WORDS, OBJECT_WORDS, kindA, kindName, nameOf, sentence, tt } from '../../modules/truthtext.js';
import { creature } from '../../modules/sections.js';
import { hash, rngFor } from '../../modules/logicrng.js';
import { paint, react } from '../../modules/shell.js';
import { esc, lang, say, t } from './frame.js';

/* ------------------------------------------------------------------ */
/* The bank and the chapters                                           */
/* ------------------------------------------------------------------ */

const banks = new Map();

async function bank(level) {
  if (!banks.has(level)) {
    banks.set(level, fetch(`data/logic/truth/${level}.json`, { cache: 'no-cache' }).then((res) => {
      if (!res.ok) throw new Error(`Could not load the ${level} island puzzles`);
      return res.json();
    }));
    banks.get(level).catch(() => banks.delete(level));
  }
  return banks.get(level);
}

const chapters = (level, L) => T.CHAPTERS[level].map((ch) => ({
  id: ch.id, title: tt(`ch.${ch.id}`, L), idea: tt(`ch.${ch.id}.idea`, L)
}));

const levelOfChapter = (id) => (T.chapter(id) || {}).level || null;

const tileLabel = (p, L) => (p.teach ? { icon: '🎓', text: t('teach') } : { icon: p.cloud ? '☁️' : p.scene ? '🖼️' : '🏝️', text: tt('tile.puzzle', L) });

/* ------------------------------------------------------------------ */
/* Pictures                                                            */
/* ------------------------------------------------------------------ */

/* Each islander keeps one colour wherever it appears, as well as its ears. */
const TONE = {
  bear: 'orchid', rabbit: 'flamingo', owl: 'sky', fox: 'mango',
  cat: 'jade', mouse: 'lagoon', giraffe: 'honey', frog: 'leaf'
};
const face = (kind) => creature(kind, { tone: `var(--cz-${TONE[kind]})`, inner: `var(--cz-${TONE[kind]}-soft)` });

/* The tokens: a disc with rays, a crescent, a cloud. Each its own shape. */
const TOKEN = {
  sun: '<circle cx="16" cy="16" r="6.5" fill="currentColor"/><g stroke="currentColor" stroke-width="2.4" stroke-linecap="round">'
    + '<path d="M16 3.5v3.5M16 25v3.5M3.5 16H7M25 16h3.5M7.2 7.2l2.4 2.4M22.4 22.4l2.4 2.4M7.2 24.8l2.4-2.4M22.4 9.6l2.4-2.4"/></g>',
  moon: '<path d="M21.5 26.5A11 11 0 1 1 17 5.2a8.6 8.6 0 1 0 4.5 21.3Z" fill="currentColor"/>',
  cloud: '<path d="M9.5 24.5h13.5a5.5 5.5 0 0 0 .4-11 7.5 7.5 0 0 0-14.3 2.2A4.5 4.5 0 0 0 9.5 24.5Z" fill="currentColor"/>'
};
const token = (k, size = 30) => `<svg class="cz-truth-tok cz-truth-tok--${k}" viewBox="0 0 32 32" width="${size}" height="${size}"
  aria-hidden="true" focusable="false">${TOKEN[k]}</svg>`;

const mini = (p, i) => `<span class="cz-truth-mini">${face(p.cast[i])}</span>`;

/** The icon strip on a bubble, so a child who cannot read yet can still play. */
function icons(p, s, speaker) {
  switch (s.op) {
    case 'fact': {
      const f = s.f;
      const e = (o) => OBJECT_WORDS[o].emoji;
      if (f.t === 'count') return `<span class="cz-truth-objs">${Array(f.n).fill(e(f.obj)).join('')}</span>`;
      if (f.t === 'none') return `<span class="cz-truth-none">${e(f.obj)}</span>`;
      if (f.t === 'more') return `${e(f.a)}<span class="cz-truth-op">&gt;</span>${e(f.b)}`;
      return `${mini(p, f.who)}<span class="cz-truth-op">✋</span>${ITEM_WORDS[f.item].emoji}`;
    }
    case 'is': return `${mini(p, s.who)}<span class="cz-truth-op">=</span>${token(s.kind, 24)}`;
    case 'same': return `${mini(p, s.a)}<span class="cz-truth-op">=</span>${mini(p, s.b)}`;
    case 'diff': return `${mini(p, s.a)}<span class="cz-truth-op">≠</span>${mini(p, s.b)}`;
    case 'count': return `<span class="cz-truth-op">👥 ${s.cmp === 'eq' ? '=' : '≥'} ${s.n}</span>${token(s.kind, 24)}`;
    default: {
      const join = { and: '&amp;', or: lang() === 'es' ? 'o' : 'or', if: '→' }[s.op];
      return `${icons(p, s.args[0], speaker)}<span class="cz-truth-op cz-truth-op--word">${join}</span>${icons(p, s.args[1], speaker)}`;
    }
  }
}

function sceneHtml(p, L) {
  if (p.hidden) {
    return `<div class="cz-truth-scene is-curtain"><span class="cz-truth-curtain" aria-hidden="true">🎭</span>
      <p>${esc(tt('curtain', L))}</p></div>`;
  }
  const groups = Object.entries(p.scene.c).map(([o, n]) => {
    const w = OBJECT_WORDS[o][L === 'es' ? 'es' : 'en'][n === 1 ? 0 : 1];
    return `<span class="cz-truth-group" role="img" aria-label="${n} ${esc(w)}">${Array(n).fill(OBJECT_WORDS[o].emoji).join('')}</span>`;
  }).join('');
  return `<div class="cz-truth-scene"><span class="cz-truth-scene__label">${esc(tt('picture', L))}</span>
    <div class="cz-truth-blanket">${groups}</div></div>`;
}

/* ------------------------------------------------------------------ */
/* State                                                               */
/* ------------------------------------------------------------------ */

let play = null;

function draw(host, ctx) {
  const p = { ...ctx.puzzle, scene: ctx.puzzle.scene || {} };
  const n = p.cast.length;
  const real = new Array(n).fill(null);
  if (p.badge !== undefined) real[p.badge] = 'sun';
  play = {
    host, ctx, p, ch: T.chapter(ctx.chapterId), real, maybe: new Array(n).fill(null),
    pencil: false, hints: 0, hint: null, tries: 0, msg: null, done: false, bad: -1,
    /* Kinds a hint has ruled in, per animal, when it could not yet place a token. */
    ruled: new Array(n).fill(null)
  };
  paintBoard();
}

const kinds = () => T.kindsOf(play.p);
const nm = (i, L) => nameOf(play.p.cast[i], L);

/** The kind each animal has on the board: a real token, or a pencilled one. */
const shown = () => play.real.map((k, i) => k || play.maybe[i]);

/** True, false, or undefined (not settled yet) for one sentence on the board. */
function wouldBe(s) {
  const a = shown();
  const vals = new Set(T.allWorlds({ ...play.p, badge: undefined })
    .filter((w) => w.every((k, i) => !a[i] || a[i] === k))
    .map((w) => T.evaluate(s, w, play.p.scene)));
  return vals.size === 1 ? [...vals][0] : undefined;
}

/* ------------------------------------------------------------------ */
/* Drawing                                                             */
/* ------------------------------------------------------------------ */

function bubble(j, L) {
  const { p } = play;
  const [speaker, s] = p.says[j];
  const text = sentence(s, speaker, p.cast, L);
  const marking = play.pencil || play.maybe.some(Boolean);
  let mark = '';
  if (marking) {
    const v = wouldBe(s);
    const who = shown()[speaker];
    if (v !== undefined) {
      const clash = who && !T.allows(who, v);
      mark = `<span class="cz-truth-would${v ? ' is-true' : ' is-false'}${clash ? ' is-clash' : ''}">
        ${v ? '✓' : '✗'} ${esc(tt(v ? 'wouldTrue' : 'wouldFalse', L))}${clash ? ` · ⚡ ${esc(tt('clash', L, { A: nm(speaker, L) }))}` : ''}</span>`;
    } else if (who === 'sun' || who === 'moon') {
      /* Not settled yet, but the token already says what it has to be. */
      mark = `<span class="cz-truth-would is-must">${token(who, 16)} ${esc(tt(who === 'sun' ? 'mustTrue' : 'mustFalse', L))}</span>`;
    }
  }
  const hl = play.hint && play.hint.level >= 1 && play.hint.stmt === j ? ' is-hint' : '';
  const bad = play.bad === j ? ' is-bad' : '';
  return `<button type="button" class="cz-truth-bubble${hl}${bad}" data-truth-say="${j}"
      aria-label="${esc(tt('says', L, { A: nm(speaker, L) }))}: ${esc(text)}">
    <span class="cz-truth-icons" aria-hidden="true">${icons(p, s, speaker)}</span>
    <span class="cz-truth-text" aria-hidden="true">${esc(text)}</span>
    ${mark}
  </button>`;
}

function islander(i, L) {
  const { p } = play;
  const real = play.real[i];
  const maybe = !real && play.maybe[i];
  const k = real || maybe;
  const locked = i === p.badge;
  const hl = play.hint && play.hint.level >= 1 && play.hint.who === i && play.hint.stmt === undefined ? ' is-hint' : '';
  const label = tt('tokenFor', L, { A: nm(i, L), k: k ? kindA(k, L) : tt('token.none', L) });
  const held = p.scene.h && p.scene.h[i] && !p.hidden ? ITEM_WORDS[p.scene.h[i]] : null;
  const bubbles = p.says.map(([who], j) => (who === i ? bubble(j, L) : '')).join('');
  return `<li class="cz-truth-animal">
    <div class="cz-truth-bubbles">${bubbles}</div>
    <div class="cz-truth-who">
      <span class="cz-truth-face">${face(p.cast[i])}${held ? `<span class="cz-truth-held" role="img"
        aria-label="${esc(tt('holds', L, { A: nm(i, L), item: L === 'es' ? held.es : held.en }))}">${held.emoji}</span>` : ''}</span>
      <span class="cz-truth-name">${esc(nm(i, L))}</span>
      ${locked ? `<span class="cz-truth-badge">${token('sun', 16)} ${esc(tt('badge', L))}</span>` : ''}
    </div>
    <button type="button" class="cz-truth-slot${maybe ? ' is-maybe' : ''}${k ? ` is-${k}` : ''}${hl}"
      data-truth-token="${i}" aria-label="${esc(label)}" ${locked || play.done ? 'disabled' : ''}>
      ${k ? `${token(k)}<span class="cz-truth-slot__word">${esc(kindName(k, L))}</span>` : '<span class="cz-truth-slot__q">?</span>'}
    </button>
    ${!k && play.ruled[i] ? `<p class="cz-truth-ruled">${kinds().filter((x) => !play.ruled[i].includes(x))
      .map((x) => `${token(x, 14)} ${esc(tt('notKind', L, { k: kindName(x, L) }))}`).join(' ')}</p>` : ''}
  </li>`;
}

/* "Sun or Moon", "Sol, Luna o Nube". */
const orList = (words, L) => (words.length < 2 ? words.join('')
  : `${words.slice(0, -1).join(', ')} ${L === 'es' ? 'o' : 'or'} ${words[words.length - 1]}`);

function paintBoard() {
  const L = lang();
  const { p, ch } = play;
  const canPencil = ch.level !== 'easy';
  const controls = play.done ? '' : `<div class="cz-code-actions">
      <button type="button" class="gp-btn gp-btn--primary gp-btn--big" data-action="truth-check">${esc(t('check'))}</button>
      ${canPencil ? `<button type="button" class="gp-btn gp-btn--ghost${play.pencil ? ' is-active' : ''}" data-action="truth-pencil"
        aria-pressed="${play.pencil}">✏️ ${esc(tt('pencil', L))}</button>` : ''}
      ${play.maybe.some(Boolean) ? `<button type="button" class="gp-btn gp-btn--quiet" data-action="truth-rubout">${esc(tt('pencilClear', L))}</button>` : ''}
      <button type="button" class="gp-btn gp-btn--ghost" data-action="truth-clear">${esc(t('clear'))}</button>
      <button type="button" class="gp-btn gp-btn--ghost" data-action="truth-hint"><span aria-hidden="true">🔎</span> ${esc(play.hint ? t('hintMore') : t('hint'))}</button>
    </div>`;
  play.host.innerHTML = `<div class="cz-truth" lang="${L}">
    <p class="cz-code-ask">${esc(tt(p.cloud ? 'askCloud' : 'ask', L))}</p>
    <p class="cz-truth-rules">${token('sun', 20)}${token('moon', 20)}${p.cloud ? token('cloud', 20) : ''}
      <span>${esc(tt('rules', L))}${p.cloud ? ` ${esc(tt('rulesCloud', L))}` : ''}</span></p>
    ${play.done ? '' : `<p class="cz-rule-help">${esc(tt('how', L, { kinds: orList(kinds().map((k) => kindName(k, L)), L), button: t('check') }))}</p>`}
    ${p.scene.c ? sceneHtml(p, L) : ''}
    <ul class="cz-truth-isle">${p.cast.map((_, i) => islander(i, L)).join('')}</ul>
    ${play.pencil ? `<p class="cz-truth-pencilhelp">✏️ ${esc(tt('pencilHelp', L))}</p>` : ''}
    ${controls}
    <div class="cz-code-msg" aria-live="polite">${play.msg ? play.msg(L) : ''}</div>
  </div>`;
  paint();
}

/* ------------------------------------------------------------------ */
/* Sentences from solver steps                                         */
/* ------------------------------------------------------------------ */

function stepText(step, L) {
  const { p } = play;
  const removed = kinds().filter((k) => !step.keep.includes(k));
  const end = step.keep.length === 1
    ? tt('end.is', L, { k: kindA(step.keep[0], L) })
    : tt('end.not', L, { k: kindA(removed[0], L) });
  const v = { end, B: nm(step.who, L), A: nm(step.who, L) };
  if (step.stmt !== undefined) {
    const [speaker, s] = p.says[step.stmt];
    v.A = nm(speaker, L);
    v.q = sentence(s, speaker, p.cast, L);
  }
  switch (step.kind) {
    case 'fact': {
      const truth = T.evaluate(p.says[step.stmt][1], [], p.scene);
      v.tf = tt(String(truth), L);
      if (p.hidden) return tt('step.badge', L, { ...v, S: nm(p.badge, L) });
      return tt('step.fact', L, { ...v, rule: tt(truth ? 'rule.sun' : 'rule.moon', L) });
    }
    case 'check': return tt('step.check', L, { ...v, tf: tt(String(step.truth), L) });
    case 'known': {
      const sk = p.sol[p.says[step.stmt][0]];
      return tt('step.known', L, { ...v, ka: kindA(sk, L), tf: tt(String(sk === 'sun'), L) });
    }
    case 'self': {
      if (!p.cloud) return tt('step.self', L, v);
      const gone = removed.find((k) => k !== 'cloud') || removed[0];
      return tt('step.selfx', L, { ...v, k: kindA(gone, L), tf: tt(String(gone === 'sun'), L) });
    }
    case 'place': return tt('do.set', L, { A: nm(step.who, L), kn: kindName(step.keep[0], L) });
    case 'both': return tt(p.cloud ? 'step.bothx' : 'step.both', L, v);
    case 'left': return tt('step.left', L, v);
    case 'suppose': {
      const w = { ...v, A: nm(step.who, L), kn: kindName(step.tried, L) };
      if (step.depth >= 2) return tt('step.suppose2', L, w);
      if (step.clash < 0) return tt('step.supposex', L, w);
      return tt('step.suppose', L, { ...w, C: nm(p.says[step.clash][0], L) });
    }
    default: return '';
  }
}

function lookText(step, L) {
  if (step.kind === 'left') return tt('look.kinds', L);
  if (step.kind === 'place') return tt('look.token', L, { A: nm(step.who, L) });
  if (step.kind === 'suppose') return tt('look.pencil', L, { A: nm(step.who, L) });
  return tt('look.say', L, { A: nm(play.p.says[step.stmt][0], L) });
}

/* ------------------------------------------------------------------ */
/* Doing things                                                        */
/* ------------------------------------------------------------------ */

function cycle(k) {
  const list = [null, ...kinds()];
  return list[(list.indexOf(k) + 1) % list.length];
}

function tapToken(i) {
  if (play.done || i === play.p.badge) return;
  if (play.pencil) {
    if (play.real[i]) play.real[i] = null;
    play.maybe[i] = cycle(play.maybe[i]);
  } else {
    play.real[i] = cycle(play.real[i]);
    play.maybe[i] = null;
  }
  play.bad = -1;
  if (play.msg && !play.hint) play.msg = null;
  paintBoard();
  const el = play.host.querySelector(`[data-truth-token="${i}"]`);
  if (el) el.focus();
}

function check() {
  const { p } = play;
  if (play.real.some((k) => !k)) {
    play.msg = (L) => `<p class="cz-code-say is-wrong">${esc(tt('fillAll', L))}</p>`;
    paintBoard();
    return;
  }
  if (play.real.every((k, i) => k === p.sol[i])) {
    play.done = true;
    play.maybe = play.maybe.map(() => null);
    play.pencil = false;
    const stars = T.starsFor({ hints: p.teach ? 0 : play.hints, tries: play.tries + 1 });
    const steps = T.humanSolve(p).steps;
    play.msg = (L) => `<p class="cz-code-say is-right">✓ ${esc(tt('right', L))}</p>`;
    paintBoard();
    play.ctx.onSolved({ stars, why: (L) => T.whySteps(steps).map((s) => esc(stepText(s, L))) });
    return;
  }
  play.tries += 1;
  react('oops', 1600);
  if (!T.legalWorld(p, play.real)) {
    play.bad = -1;
    play.msg = (L) => `<p class="cz-code-say is-wrong">${esc(tt('broke.kinds', L))}</p>`;
    paintBoard();
    return;
  }
  const j = T.firstBroken(p, play.real);
  play.bad = j;
  const [speaker, s] = p.says[Math.max(0, j)];
  const k = play.real[speaker];
  const key = `broke.${k}${s.op === 'fact' && !p.hidden ? 'Fact' : ''}`;
  play.msg = (L) => `<p class="cz-code-say is-wrong">${esc(tt(key, L, { A: nm(speaker, L) }))}</p>`;
  paintBoard();
}

function hint() {
  const { p } = play;
  const h = T.nextHint(p, play.real, play.ruled);
  if (!h) return;
  const key = h.wrong ? `w${h.who}` : JSON.stringify([h.step.kind, h.step.who, h.step.keep, h.step.stmt]);
  if (!play.hint || play.hint.key !== key) {
    play.hint = { key, level: 0, who: h.wrong ? h.who : h.step.who, stmt: h.wrong ? undefined : h.step.stmt };
  }
  const hl = play.hint;
  hl.level = Math.min(3, hl.level + 1);
  play.hints += 1;
  if (h.wrong) {
    if (hl.level === 1) play.msg = (L) => `<p class="cz-code-hint">🔎 ${esc(tt('look.wrong', L, { A: nm(h.who, L) }))}</p>`;
    else if (hl.level === 2) {
      play.msg = (L) => `<p class="cz-code-hint">💡 ${esc(tt('wrong.say', L, { A: nm(h.who, L), k: kindA(h.kind, L) }))}${h.step ? ` ${esc(stepText(h.step, L))}` : ''}</p>`;
    } else {
      play.real[h.who] = null;
      play.hint = null;
      play.msg = (L) => `<p class="cz-code-hint">✋ ${esc(tt('wrong.say', L, { A: nm(h.who, L), k: kindA(h.kind, L) }))}</p>`;
    }
  } else if (hl.level === 1) {
    play.msg = (L) => `<p class="cz-code-hint">🔎 ${esc(lookText(h.step, L))}</p>`;
  } else if (hl.level === 2) {
    play.msg = (L) => `<p class="cz-code-hint">💡 ${esc(stepText(h.step, L))}</p>`;
  } else {
    const s = h.step;
    if (s.keep.length === 1) {
      play.real[s.who] = s.keep[0];
      play.maybe[s.who] = null;
      play.msg = (L) => `<p class="cz-code-hint">✋ ${esc(stepText(s, L))} ${esc(tt('do.set', L, { A: nm(s.who, L), kn: kindName(s.keep[0], L) }))}</p>`;
    } else {
      play.ruled[s.who] = s.keep.slice();
      play.msg = (L) => `<p class="cz-code-hint">✋ ${esc(stepText(s, L))}</p>`;
    }
    play.hint = null;
  }
  paintBoard();
}

/* ------------------------------------------------------------------ */
/* Clicks, keys, reading aloud                                         */
/* ------------------------------------------------------------------ */

function sayOne(j) {
  const L = lang();
  const [speaker, s] = play.p.says[j];
  say([`${tt('says', L, { A: nm(speaker, L) })}: ${sentence(s, speaker, play.p.cast, L)}`]);
}

function click(ev) {
  if (!play) return false;
  const tok = ev.target.closest('[data-truth-token]');
  if (tok) { tapToken(Number(tok.dataset.truthToken)); return true; }
  const bub = ev.target.closest('[data-truth-say]');
  if (bub) { sayOne(Number(bub.dataset.truthSay)); return true; }
  const action = ev.target.closest('[data-action]');
  if (!action) return false;
  switch (action.dataset.action) {
    case 'truth-check': check(); return true;
    case 'truth-hint': hint(); return true;
    case 'truth-pencil': play.pencil = !play.pencil; paintBoard(); return true;
    case 'truth-rubout': play.maybe = play.maybe.map(() => null); paintBoard(); return true;
    case 'truth-clear':
      play.real = play.real.map((k, i) => (i === play.p.badge ? 'sun' : null));
      play.maybe = play.maybe.map(() => null);
      play.ruled = play.ruled.map(() => null);
      play.bad = -1;
      play.msg = null;
      paintBoard();
      return true;
    default: return false;
  }
}

function key(ev) {
  if (!play || play.done) return false;
  const slot = ev.target.closest && ev.target.closest('[data-truth-token]');
  if (!slot) return false;
  const i = Number(slot.dataset.truthToken);
  const k = { s: 'sun', m: 'moon', c: 'cloud' }[ev.key.toLowerCase()];
  if (k && kinds().includes(k)) {
    ev.preventDefault();
    if (play.pencil) play.maybe[i] = k; else { play.real[i] = k; play.maybe[i] = null; }
    paintBoard();
    const el = play.host.querySelector(`[data-truth-token="${i}"]`);
    if (el) el.focus();
    return true;
  }
  if (ev.key === 'ArrowLeft' || ev.key === 'ArrowRight') {
    ev.preventDefault();
    const n = play.p.cast.length;
    const to = (i + (ev.key === 'ArrowRight' ? 1 : n - 1)) % n;
    const el = play.host.querySelector(`[data-truth-token="${to}"]`);
    if (el) el.focus();
    return true;
  }
  return false;
}

function readAloud() {
  if (!play) return;
  const L = lang();
  const { p } = play;
  const parts = [tt(p.cloud ? 'askCloud' : 'ask', L), tt('rules', L)];
  if (p.cloud) parts.push(tt('rulesCloud', L));
  if (p.hidden) parts.push(tt('curtain', L));
  p.says.forEach(([speaker, s]) => parts.push(`${tt('says', L, { A: nm(speaker, L) })}: ${sentence(s, speaker, p.cast, L)}`));
  say(parts);
}

const repaint = () => { if (play) paintBoard(); };

/* ------------------------------------------------------------------ */
/* The album, and today's puzzle                                       */
/* ------------------------------------------------------------------ */

/* Who the child has met, and as what, worked out from the solved puzzles:
   nothing extra is stored. */
function extras({ bank: b, rec, lang: L }) {
  const met = Object.fromEntries(T.CAST.map((k) => [k, { sun: 0, moon: 0, cloud: 0 }]));
  for (const ch of b.chapters) {
    for (const p of ch.puzzles) {
      if (!P.starsOf(rec, 'truth', p.id)) continue;
      p.cast.forEach((k, i) => { met[k][p.sol[i]] += 1; });
    }
  }
  const cards = T.CAST.map((k) => {
    const m = met[k];
    const any = m.sun + m.moon + m.cloud;
    return `<li class="cz-code-pen${any ? ' is-home' : ''}">
      <span class="cz-truth-albumface">${face(k)}</span>
      <span class="cz-code-pen__text"><strong>${esc(nameOf(k, L))}</strong>
        <span>${any ? `${token('sun', 16)} ×${m.sun} &nbsp; ${token('moon', 16)} ×${m.moon}${m.cloud ? ` &nbsp; ${token('cloud', 16)} ×${m.cloud}` : ''}` : esc(tt('album.none', L))}</span>
        ${any ? `<span class="gp-sr-only">${esc(tt('album.count', L, { s: m.sun, m: m.moon }))}</span>` : ''}
      </span>
    </li>`;
  }).join('');
  return `<section class="cz-code-zoo" aria-labelledby="cz-truth-album-h">
    <h2 class="cz-logic-h2" id="cz-truth-album-h">${esc(tt('album.title', L))}</h2>
    <p class="gp-muted">${esc(tt('album.lede', L))}</p>
    <ul class="cz-code-pens">${cards}</ul>
  </section>`;
}

function dailyPuzzle(level, iso) {
  const list = T.CHAPTERS[level];
  const def = list[hash('truth-daily', level, iso) % list.length];
  const p = T.makePuzzle(T.chapter(def.id), rngFor('truth', 'daily', level, iso));
  return p ? { puzzle: { id: `daily-${iso}`, ...p }, chapterId: def.id } : null;
}

export default {
  id: 'truth', bank, chapters, levelOfChapter, tileLabel, draw, repaint, click, key,
  say: readAloud, extras, dailyPuzzle
};
