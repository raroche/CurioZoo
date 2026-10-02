/**
 * rooms/logic/rule.js — Find the Rule, drawn.
 *
 * Two shelves by the gate (passed, stopped), a way to test (a waiting line on
 * Easy, a dress-up machine from Medium), and a way to prove the rule: sort
 * six new creatures (Easy) or build the rule from parts (Medium, Hard).
 *
 * Every test starts with a prediction. That turns each test into a question
 * the child is asking, and it is how the room notices a "brave tester": a
 * child who tests something they expect to be STOPPED, which is the habit
 * the research says children lack (they test only what they expect to pass).
 *
 * The rules are in modules/rulelogic.js; the words in ruletext.js.
 */

import * as R from '../../modules/rulelogic.js';
import * as P from '../../modules/logicprogress.js';
import { ITEM_EMOJI, aboutWord, describe, ruleSentence, rt, valueLabel, clause } from '../../modules/ruletext.js';
import { creature, MOUTH_LINE } from '../../modules/sections.js';
import { hash, rngFor } from '../../modules/logicrng.js';
import { paint, react } from '../../modules/shell.js';
import { esc, lang, say, t } from './frame.js';

/* ------------------------------------------------------------------ */
/* The bank and the chapters                                           */
/* ------------------------------------------------------------------ */

const banks = new Map();

async function bank(level) {
  if (!banks.has(level)) {
    banks.set(level, fetch(`data/logic/rule/${level}.json`, { cache: 'no-cache' }).then((res) => {
      if (!res.ok) throw new Error(`Could not load the ${level} gate puzzles`);
      return res.json();
    }));
    banks.get(level).catch(() => banks.delete(level));
  }
  return banks.get(level);
}

const chapters = (level, L) => R.CHAPTERS[level].map((ch) => ({
  id: ch.id, title: rt(`ch.${ch.id}`, L), idea: rt(`ch.${ch.id}.idea`, L)
}));
const levelOfChapter = (id) => (R.chapter(id) || {}).level || null;
const tileLabel = (p, L) => (p.teach ? { icon: '🎓', text: t('teach') } : { icon: '🚪', text: rt('tile.puzzle', L) });

/* ------------------------------------------------------------------ */
/* Drawing a creature                                                  */
/* ------------------------------------------------------------------ */

const TONE = {
  bear: 'orchid', rabbit: 'flamingo', owl: 'sky', fox: 'mango',
  cat: 'jade', mouse: 'lagoon', giraffe: 'honey', frog: 'leaf'
};

const HATS = {
  cap: '<path d="M23 12 Q32 -3 41 12 Z" fill="#2F6FB5" stroke="#2B2926" stroke-width="1.6"/>'
    + '<path d="M39.5 11.5 H51" stroke="#2F6FB5" stroke-width="3.5" stroke-linecap="round"/>',
  crown: '<path d="M22 13 L22 1 L27 6.5 L32 -2 L37 6.5 L42 1 L42 13 Z" fill="#E8B92F" stroke="#7A5A00" stroke-width="1.6" stroke-linejoin="round"/>',
  bow: '<path d="M32 6 L20.5 -1.5 L20.5 13.5 Z M32 6 L43.5 -1.5 L43.5 13.5 Z" fill="#E0567F" stroke="#7A1F3D" stroke-width="1.4" stroke-linejoin="round"/>'
    + '<circle cx="32" cy="6" r="3.4" fill="#B8325D"/>'
};
const BUTTON_AT = { 1: [[32, 52.5]], 2: [[26, 51.5], [38, 51.5]], 3: [[22, 50], [32, 53], [42, 50]] };

/* The patterns live once on the board, in a zero-size svg; display:none
   would switch them off in some browsers. */
const DEFS = `<svg class="cz-rule-defs" width="0" height="0" aria-hidden="true" focusable="false"><defs>
  <pattern id="cz-rule-stripes" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
    <rect width="3" height="6" fill="#FFFFFF" fill-opacity=".85"/></pattern>
  <pattern id="cz-rule-dots" width="7" height="7" patternUnits="userSpaceOnUse">
    <circle cx="3.5" cy="3.5" r="1.9" fill="#FFFFFF" fill-opacity=".9"/></pattern>
  <pattern id="cz-rule-checks" width="8" height="8" patternUnits="userSpaceOnUse">
    <rect width="4" height="4" fill="#FFFFFF" fill-opacity=".8"/><rect x="4" y="4" width="4" height="4" fill="#FFFFFF" fill-opacity=".8"/></pattern>
</defs></svg>`;

/** The site's creature, wearing this puzzle's hat, pattern, buttons and item. */
function drawCreature(c, setup, L) {
  const [ears, hat, pattern, buttons, size, item] = c;
  const tone = TONE[ears];
  const raw = creature(ears, { tone: `var(--cz-${tone})`, inner: `var(--cz-${tone}-soft)` });
  const inner = raw.slice(raw.indexOf('>') + 1, raw.lastIndexOf('</svg>'));
  const pat = pattern !== 'plain'
    ? `<path d="${MOUTH_LINE}" fill="none" stroke="url(#cz-rule-${pattern})" stroke-width="22" stroke-linecap="round"/>` : '';
  const dots = (BUTTON_AT[buttons] || []).map(([x, y]) =>
    `<circle cx="${x}" cy="${y}" r="3.1" fill="#FFFFFF" stroke="#2B2926" stroke-width="1.5"/>`).join('');
  const sizeCls = setup.size ? ` cz-rule-c--${size}` : '';
  return `<span class="cz-rule-c${sizeCls}" role="img" aria-label="${esc(describe(c, setup, L))}">
    <svg viewBox="-6 -14 76 80" aria-hidden="true" focusable="false">${inner}${pat}${dots}${HATS[hat] || ''}</svg>
    ${ITEM_EMOJI[item] ? `<span class="cz-rule-item" aria-hidden="true">${ITEM_EMOJI[item]}</span>` : ''}
  </span>`;
}

function drawCase(c, L) {
  if (!play.pair) return drawCreature(c, play.setup, L);
  return `<span class="cz-rule-pairbox"><span class="cz-rule-pairn">1</span>${drawCreature(c[0], play.setup, L)}
    <span class="cz-rule-pairn">2</span>${drawCreature(c[1], play.setup, L)}</span>`;
}

const caseWords = (c, L) => (play.pair
  ? `1: ${describe(c[0], play.setup, L)}; 2: ${describe(c[1], play.setup, L)}`
  : describe(c, play.setup, L));

/* ------------------------------------------------------------------ */
/* State                                                               */
/* ------------------------------------------------------------------ */

let play = null;

function draw(host, ctx) {
  const p = ctx.puzzle;
  const ch = R.chapter(ctx.chapterId);
  const U = R.universe(p.setup, ch.pair);
  const fixed = R.ORDER.map((a) => R.ATTRS[a].fixed);
  const base = (vals) => R.ORDER.map((a, i) => (p.setup[a] ? vals[i] : fixed[i]));
  play = {
    host, ctx, p, ch, setup: p.setup, pair: Boolean(ch.pair), U,
    target: R.extKey(p.rule, U), H: null,
    shelf: p.evidence.map(([c, pass]) => ({ c, pass, mine: false })),
    line: p.line ? p.line.slice() : null,
    pick: null,
    machine: ch.pair ? [base(U[0][0]), base(U[0][1])] : base(U[0]),
    stage: 'test', tests: 0, brave: 0, hints: 0, hintLevel: 0, hintPick: null,
    tries: 0, msg: null, done: false,
    proof: p.proof ? p.proof.slice() : null, sort: p.proof ? p.proof.map(() => null) : null,
    build: { terms: [{ lit: null, not: false }], op: 'and', at: 0 }
  };
  paintBoard();
}

const seen = () => play.shelf.map((x) => x.c);
const isSeen = (c) => seen().some((x) => R.sameCreature(x, c));
const passes = (c) => R.evaluate(play.p.rule, c);

/* ------------------------------------------------------------------ */
/* Drawing the board                                                   */
/* ------------------------------------------------------------------ */

function shelves(L) {
  const shelf = (pass) => play.shelf.filter((x) => x.pass === pass).map((x) => `<li class="${x.mine ? 'is-mine' : ''}">${drawCase(x.c, L)}</li>`).join('');
  return `<div class="cz-rule-gate">
    <section class="cz-rule-shelf is-pass" aria-label="${esc(rt('passed', L))}">
      <h3><span aria-hidden="true">✓</span> ${esc(rt('passed', L))}</h3><ul>${shelf(true)}</ul></section>
    <section class="cz-rule-shelf is-stop" aria-label="${esc(rt('stopped', L))}">
      <h3><span aria-hidden="true">✗</span> ${esc(rt('stopped', L))}</h3><ul>${shelf(false)}</ul></section>
  </div>`;
}

function lineHtml(L) {
  const items = play.line.map((c, i) => {
    const on = play.pick === i;
    const hl = play.hintPick === i ? ' is-hint' : '';
    return `<button type="button" class="cz-rule-pickc${on ? ' is-picked' : ''}${hl}" data-rule-line="${i}"
      aria-pressed="${on}" aria-label="${esc(caseWords(c, L))}">${drawCase(c, L)}</button>`;
  }).join('');
  return `<section class="cz-rule-test"><h3>${esc(rt('line', L))}</h3>
    <p class="cz-rule-help">${esc(rt('lineHelp', L))}</p><div class="cz-rule-line">${items}</div></section>`;
}

function machineRows(which, L) {
  const c = play.pair ? play.machine[which] : play.machine;
  return R.ORDER.filter((a) => play.setup[a]).map((a) => {
    const i = R.ORDER.indexOf(a);
    const chips = play.setup[a].map((v) => {
      const on = c[i] === v;
      return `<button type="button" class="gp-pill cz-rule-chip${on ? ' is-selected' : ''}" role="radio" aria-checked="${on}"
        data-rule-set="${which}:${a}:${v}">${esc(valueLabel(a, v, L))}</button>`;
    }).join('');
    return `<div class="cz-rule-row" role="radiogroup" aria-label="${esc(aboutWord(a, L))}">${chips}</div>`;
  }).join('');
}

function machineHtml(L) {
  const preview = drawCase(play.machine, L);
  const parts = play.pair
    ? `<div class="cz-rule-machine2"><div><h4>${esc(rt('first', L))}</h4>${machineRows(0, L)}</div>
        <div><h4>${esc(rt('second', L))}</h4>${machineRows(1, L)}</div></div>`
    : machineRows(0, L);
  return `<section class="cz-rule-test"><h3>⚙️ ${esc(rt('machine', L))}</h3>
    <p class="cz-rule-help">${esc(rt('machineHelp', L))}</p>
    <div class="cz-rule-machine"><div class="cz-rule-preview">${preview}</div><div class="cz-rule-rows">${parts}</div></div></section>`;
}

function testHtml(L) {
  const chooser = play.line ? lineHtml(L) : machineHtml(L);
  return `${chooser}
    <div class="cz-rule-predict">
      <p class="cz-rule-q">${esc(rt(play.pair ? 'predictPair' : 'predict', L))}</p>
      <button type="button" class="gp-btn gp-btn--big cz-rule-say is-pass" data-rule-send="pass">✓ ${esc(rt('sayPass', L))}</button>
      <button type="button" class="gp-btn gp-btn--big cz-rule-say is-stop" data-rule-send="stop">✗ ${esc(rt('sayStop', L))}</button>
    </div>
    <div class="cz-code-actions">
      <button type="button" class="gp-btn gp-btn--primary gp-btn--big" data-action="rule-know">💡 ${esc(rt('know', L))}</button>
      <button type="button" class="gp-btn gp-btn--ghost" data-action="rule-hint"><span aria-hidden="true">🔎</span> ${esc(play.hintLevel ? t('hintMore') : t('hint'))}</button>
    </div>`;
}

function sortHtml(L) {
  const cards = play.proof.map((c, i) => {
    const s = play.sort[i];
    const word = s === null ? '?' : s ? `✓ ${rt('sayPass', L)}` : `✗ ${rt('sayStop', L)}`;
    return `<li><button type="button" class="cz-rule-sortc${s === true ? ' is-pass' : s === false ? ' is-stop' : ''}" data-rule-sort="${i}"
      aria-label="${esc(caseWords(c, L))}: ${esc(word)}">${drawCase(c, L)}<span class="cz-rule-sortw">${esc(word)}</span></button></li>`;
  }).join('');
  return `<section class="cz-rule-prove"><h3>${esc(rt('sortAsk', L))}</h3><ul class="cz-rule-sort">${cards}</ul></section>
    <div class="cz-code-actions">
      <button type="button" class="gp-btn gp-btn--primary gp-btn--big" data-action="rule-sortcheck">${esc(rt('sortCheck', L))}</button>
      <button type="button" class="gp-btn gp-btn--ghost" data-action="rule-backtest">${esc(rt('backToTest', L))}</button>
    </div>`;
}

/* The parts a rule can be built from, as chips. */
function palette() {
  const lits = R.literals(play.setup, play.pair).filter((l) => l.op !== 'not');
  return lits;
}

const litLabel = (l, L) => {
  if (l.op === 'has') return valueLabel(l.a, l.v, L);
  if (l.op === 'ge') return rt('atLeast2', L);
  if (l.op === 'le') return rt('atMost2', L);
  return clause(l, L);
};

function builtRule() {
  const terms = play.build.terms.map((x) => (x.not ? { op: 'not', x: x.lit } : x.lit));
  if (terms.some((x) => !x || (x.op === 'not' && !x.x))) return null;
  return terms.length === 1 ? terms[0] : { op: play.build.op, args: terms };
}

function buildHtml(L) {
  const b = play.build;
  const maxParts = ['h1', 'h5'].includes(play.ch.id) ? 3 : 2;
  const terms = b.terms.map((x, i) => {
    const on = b.at === i;
    const canNot = !play.pair && x.lit && x.lit.op === 'has';
    return `${i > 0 ? `<button type="button" class="gp-btn gp-btn--ghost cz-rule-join" data-action="rule-join"
        title="${esc(rt('joinHelp', L))}">${esc(rt(`join.${b.op}`, L))}</button>` : ''}
      <span class="cz-rule-term${on ? ' is-active' : ''}">
        <button type="button" class="cz-rule-termbtn" data-rule-term="${i}" aria-pressed="${on}">
          <span class="cz-rule-termn">${esc(rt('part', L, { n: i + 1 }))}</span>
          <span>${x.lit ? `${x.not ? `<strong>${esc(rt('not', L))}</strong> ` : ''}${esc(litLabel(x.lit, L))}` : `<em>${esc(rt('pickPart', L))}</em>`}</span>
        </button>
        ${canNot ? `<button type="button" class="gp-pill gp-pill--small${x.not ? ' is-selected' : ''}" data-rule-not="${i}" aria-pressed="${x.not}">${esc(rt('not', L))}</button>` : ''}
        ${b.terms.length > 1 ? `<button type="button" class="gp-btn gp-btn--quiet cz-rule-x" data-rule-drop="${i}" aria-label="${esc(rt('removePart', L))}">✕</button>` : ''}
      </span>`;
  }).join('');
  const chips = palette().map((l, i) => `<button type="button" class="gp-pill cz-rule-chip" data-rule-lit="${i}">${esc(litLabel(l, L))}</button>`).join('');
  const rule = builtRule();
  return `<section class="cz-rule-prove"><h3>${esc(rt('buildAsk', L))}</h3>
      <div class="cz-rule-built">${terms}
        ${b.terms.length < maxParts ? `<button type="button" class="gp-btn gp-btn--ghost" data-action="rule-addpart">+ ${esc(rt('addPart', L))}</button>` : ''}</div>
      <div class="cz-rule-palette">${chips}</div>
      ${rule ? `<p class="cz-rule-preview-text"><strong>${esc(rt('yourRule', L))}:</strong> ${esc(ruleSentence(rule, L, play.pair))}</p>` : ''}
    </section>
    <div class="cz-code-actions">
      <button type="button" class="gp-btn gp-btn--primary gp-btn--big" data-action="rule-buildcheck">${esc(rt('buildCheck', L))}</button>
      <button type="button" class="gp-btn gp-btn--ghost" data-action="rule-backtest">${esc(rt('backToTest', L))}</button>
    </div>`;
}

function paintBoard() {
  const L = lang();
  let stage = '';
  if (!play.done) {
    if (play.stage === 'test') stage = testHtml(L);
    else stage = play.ch.prove === 'sort' ? sortHtml(L) : buildHtml(L);
  }
  play.host.innerHTML = `<div class="cz-rule" lang="${L}">${DEFS}
    <p class="cz-code-ask">${esc(rt(play.pair ? 'askPair' : 'ask', L))}</p>
    ${shelves(L)}
    ${stage}
    <div class="cz-code-msg" aria-live="polite">${play.msg ? play.msg(L) : ''}</div>
  </div>`;
  paint();
}

/* ------------------------------------------------------------------ */
/* Testing                                                             */
/* ------------------------------------------------------------------ */

function current() {
  if (play.line) return play.pick === null ? null : play.line[play.pick];
  return play.pair ? [play.machine[0].slice(), play.machine[1].slice()] : play.machine.slice();
}

function send(guess) {
  const c = current();
  if (!c) { play.msg = (L) => `<p class="cz-code-say is-wrong">${esc(rt('pickOne', L))}</p>`; paintBoard(); return; }
  if (isSeen(c)) { play.msg = (L) => `<p class="cz-code-say is-wrong">${esc(rt('already', L))}</p>`; paintBoard(); return; }
  const real = passes(c);
  const right = (guess === 'pass') === real;
  const brave = right && !real;
  play.tests += 1;
  if (brave) play.brave += 1;
  play.shelf.push({ c, pass: real, mine: true });
  if (play.line) { play.line.splice(play.pick, 1); play.pick = null; }
  play.hintPick = null;
  const res = (L) => rt(real ? 'resPass' : 'resStop', L);
  play.msg = (L) => `<p class="cz-code-say ${right ? 'is-right' : 'is-wrong'}">${esc(rt(right ? 'gotRight' : 'surprise', L, { result: res(L) }))}</p>${brave
    ? `<p class="cz-code-hint">🛡️ ${esc(rt('brave', L))}</p>` : ''}`;
  react(right ? 'happy' : 'wow', 1400);
  paintBoard();
}

function setMachine(spec) {
  const [which, a, raw] = spec.split(':');
  const i = R.ORDER.indexOf(a);
  const v = typeof R.ATTRS[a].all[0] === 'number' ? Number(raw) : raw;
  if (play.pair) play.machine[Number(which)][i] = v; else play.machine[i] = v;
  paintBoard();
  const el = play.host.querySelector(`[data-rule-set="${spec}"]`);
  if (el) el.focus();
}

/* ------------------------------------------------------------------ */
/* Proving                                                             */
/* ------------------------------------------------------------------ */

function solved() {
  play.done = true;
  const { p } = play;
  const stars = R.starsFor({ hints: p.teach ? 0 : play.hints, tries: play.tries + 1, tests: play.tests, par: p.par });
  const tests = play.tests;
  const brave = play.brave;
  play.msg = (L) => `<p class="cz-code-say is-right">✓ ${esc(rt('right', L))}</p>`;
  paintBoard();
  play.ctx.onSolved({
    stars,
    why: (L) => [
      `<strong>${esc(rt('whyRule', L, { rule: ruleSentence(p.rule, L, play.pair) }))}</strong>`,
      esc(rt('whyFit', L)),
      esc(tests ? rt(tests === 1 ? 'whyTests1' : 'whyTests', L, { n: tests, par: p.par }) : rt('whyNone', L)),
      ...(brave ? [`🛡️ ${esc(rt(brave === 1 ? 'whyBrave1' : 'whyBrave', L, { n: brave }))}`] : [])
    ]
  });
}

/* "Pasó" opens a Spanish sentence but sits mid-sentence here; English
   "passed" is already lower case. */
const low = (w, L) => (L === 'es' ? w.charAt(0).toLowerCase() + w.slice(1) : w);

/* A new piece of evidence after a wrong proof: no penalty, just one more clue. */
function addCounter(c) {
  play.shelf.push({ c, pass: passes(c), mine: true });
}

function checkSort() {
  if (play.sort.some((s) => s === null)) {
    play.msg = (L) => `<p class="cz-code-say is-wrong">${esc(rt('sortFill', L))}</p>`;
    paintBoard();
    return;
  }
  const wrong = play.proof.findIndex((c, i) => passes(c) !== play.sort[i]);
  if (wrong < 0) { solved(); return; }
  play.tries += 1;
  const c = play.proof[wrong];
  addCounter(c);
  /* Six new creatures, so the next sorting is a fresh question. */
  const at = R.indexer(play.U);
  const exclude = new Set([...seen(), ...(play.line || [])].map(at));
  const ideas = ideasLeft();
  const fresh = R.makeProof(play.U, play.target, ideas, exclude, rngFor('rule', 'resort', play.p.id || 'daily', play.tries));
  if (fresh) { play.proof = fresh; play.sort = fresh.map(() => null); } else play.stage = 'test';
  const res = (L) => rt(passes(c) ? 'resPass' : 'resStop', L);
  play.msg = (L) => `<p class="cz-code-say is-wrong">${esc(rt('sortWrong', L, { result: low(res(L), L) }))}</p>`;
  react('oops', 1600);
  paintBoard();
}

function checkBuild() {
  const rule = builtRule();
  if (!rule) {
    play.msg = (L) => `<p class="cz-code-say is-wrong">${esc(rt('buildFill', L))}</p>`;
    paintBoard();
    return;
  }
  if (R.sameRule(play.U, rule, play.p.rule)) { solved(); return; }
  play.tries += 1;
  const c = R.counterexample(play.U, play.p.rule, rule, seen());
  if (c) addCounter(c);
  const real = c ? passes(c) : true;
  play.msg = (L) => `<p class="cz-code-say is-wrong">${esc(rt('ruleWrong', L, {
    result: low(rt(real ? 'resPass' : 'resStop', L), L),
    would: rt(real ? 'wouldStop' : 'wouldPass', L)
  }))}</p>`;
  react('wow', 1600);
  paintBoard();
}

/* ------------------------------------------------------------------ */
/* Hints                                                               */
/* ------------------------------------------------------------------ */

function ideasLeft() {
  if (!play.H) play.H = R.hypotheses(play.setup, play.pair);
  return R.alive(play.H, play.U, play.shelf.map((x) => [x.c, x.pass]), [play.target]);
}

/* Which attributes the secret rule is about. */
const aboutOf = (r) => (r.args ? r.args.flatMap(aboutOf) : r.op === 'not' ? aboutOf(r.x) : [r.a || 'size']);

function hint() {
  play.hints += 1;
  play.hintLevel = play.hintLevel >= 3 ? 2 : play.hintLevel + 1;
  const level = play.hintLevel;
  if (play.stage !== 'test') { play.stage = 'test'; }
  if (level === 1) {
    play.msg = (L) => `<p class="cz-code-hint">🔎 ${esc(rt('hint.look', L))}</p>`;
  } else if (level === 2) {
    const ideas = ideasLeft();
    if (ideas.length <= 1) {
      play.msg = (L) => `<p class="cz-code-hint">💡 ${esc(rt('hint.enough', L))}</p>`;
    } else {
      const cands = play.line ? play.line : play.U.filter((c) => !isSeen(c));
      const best = R.bestTest(play.U, ideas, cands);
      if (best) {
        if (play.line) {
          play.pick = play.line.findIndex((c) => R.sameCreature(c, best.c));
          play.hintPick = play.pick;
        } else {
          play.machine = play.pair ? [best.c[0].slice(), best.c[1].slice()] : best.c.slice();
        }
      }
      play.msg = (L) => `<p class="cz-code-hint">💡 ${esc(rt('hint.test', L))}</p>`;
    }
  } else {
    const about = [...new Set(aboutOf(play.p.rule))];
    play.msg = (L) => `<p class="cz-code-hint">✋ ${esc(rt('hint.about', L, { about: about.map((a) => aboutWord(a, L)).join(rt('about.join', L)) }))}</p>`;
  }
  paintBoard();
}

/* ------------------------------------------------------------------ */
/* Clicks, keys, reading aloud                                         */
/* ------------------------------------------------------------------ */

function click(ev) {
  if (!play || play.done) return false;
  const q = (sel) => ev.target.closest(sel);
  let el;
  if ((el = q('[data-rule-line]'))) { play.pick = Number(el.dataset.ruleLine); play.hintPick = null; paintBoard(); refocus(`[data-rule-line="${play.pick}"]`); return true; }
  if ((el = q('[data-rule-set]'))) { setMachine(el.dataset.ruleSet); return true; }
  if ((el = q('[data-rule-send]'))) { send(el.dataset.ruleSend); return true; }
  if ((el = q('[data-rule-sort]'))) {
    const i = Number(el.dataset.ruleSort);
    const s = play.sort[i];
    play.sort[i] = s === null ? true : s ? false : null;
    paintBoard();
    refocus(`[data-rule-sort="${i}"]`);
    return true;
  }
  if ((el = q('[data-rule-term]'))) { play.build.at = Number(el.dataset.ruleTerm); paintBoard(); return true; }
  if ((el = q('[data-rule-lit]'))) {
    const lit = palette()[Number(el.dataset.ruleLit)];
    const term = play.build.terms[play.build.at];
    term.lit = lit;
    if (lit.op !== 'has') term.not = false;
    /* Move on to the next empty part, if there is one. */
    const next = play.build.terms.findIndex((x) => !x.lit);
    if (next >= 0) play.build.at = next;
    paintBoard();
    return true;
  }
  if ((el = q('[data-rule-not]'))) { const x = play.build.terms[Number(el.dataset.ruleNot)]; x.not = !x.not; paintBoard(); return true; }
  if ((el = q('[data-rule-drop]'))) {
    play.build.terms.splice(Number(el.dataset.ruleDrop), 1);
    play.build.at = Math.min(play.build.at, play.build.terms.length - 1);
    paintBoard();
    return true;
  }
  const action = q('[data-action]');
  if (!action) return false;
  switch (action.dataset.action) {
    case 'rule-know': play.stage = 'prove'; play.msg = null; paintBoard(); return true;
    case 'rule-backtest': play.stage = 'test'; play.msg = null; paintBoard(); return true;
    case 'rule-sortcheck': checkSort(); return true;
    case 'rule-buildcheck': checkBuild(); return true;
    case 'rule-hint': hint(); return true;
    case 'rule-addpart':
      play.build.terms.push({ lit: null, not: false });
      play.build.at = play.build.terms.length - 1;
      paintBoard();
      return true;
    case 'rule-join': {
      const ops = play.ch.level === 'hard' && !play.pair && play.build.terms.length === 2 ? ['and', 'or', 'xor'] : ['and', 'or'];
      play.build.op = ops[(ops.indexOf(play.build.op) + 1) % ops.length];
      paintBoard();
      return true;
    }
    default: return false;
  }
}

function refocus(sel) {
  const el = play.host.querySelector(sel);
  if (el) el.focus();
}

const key = () => false;

function readAloud() {
  if (!play) return;
  const L = lang();
  const parts = [rt(play.pair ? 'askPair' : 'ask', L)];
  const list = (pass) => play.shelf.filter((x) => x.pass === pass).map((x) => caseWords(x.c, L)).join('. ');
  parts.push(`${rt('passed', L)}: ${list(true)}.`, `${rt('stopped', L)}: ${list(false)}.`);
  say(parts);
}

const repaint = () => { if (play) paintBoard(); };

/* ------------------------------------------------------------------ */
/* The rule book, and today's puzzle                                   */
/* ------------------------------------------------------------------ */

function extras({ bank: b, rec, lang: L }) {
  const found = [];
  for (const ch of b.chapters) {
    for (const p of ch.puzzles) if (P.starsOf(rec, 'rule', p.id)) found.push({ p, pair: Boolean(R.chapter(ch.id).pair) });
  }
  const shown = found.slice(-10).reverse();
  return `<section class="cz-code-zoo" aria-labelledby="cz-rule-book-h">
    <h2 class="cz-logic-h2" id="cz-rule-book-h">📒 ${esc(rt('book.title', L))}</h2>
    <p class="gp-muted">${esc(found.length ? rt('book.count', L, { n: found.length }) : rt('book.none', L))}</p>
    ${shown.length ? `<ol class="cz-rule-book">${shown.map(({ p, pair }) => `<li>${esc(ruleSentence(p.rule, L, pair))}</li>`).join('')}</ol>` : ''}
  </section>`;
}

function dailyPuzzle(level, iso) {
  const list = R.CHAPTERS[level];
  const def = list[hash('rule-daily', level, iso) % list.length];
  const p = R.makePuzzle(R.chapter(def.id), rngFor('rule', 'daily', level, iso));
  return p ? { puzzle: { id: `daily-${iso}`, ...p }, chapterId: def.id } : null;
}

export default {
  id: 'rule', bank, chapters, levelOfChapter, tileLabel, draw, repaint, click, key,
  say: readAloud, extras, dailyPuzzle
};
