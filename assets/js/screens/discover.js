/**
 * screens/discover.js — Discovered or Invented?, drawn.
 *
 * The setup card, one question at a time and the results. The decisions
 * (which items, in what order, what is remembered) live in
 * modules/discover.js; this file turns them into markup.
 *
 * Reached from screens/fun.js, which forwards #/fun/discover here.
 */

import * as D from './../modules/discover.js';
import * as storage from './../modules/storage.js';
import * as speech from './../modules/speech.js';
import { icon } from './../modules/icons.js';
import { escapeHtml as esc } from './../modules/charts.js';
import { $, $$, paint, react, showError, showScreen, state } from './../modules/shell.js';

const otherLang = (lang) => (lang === 'es' ? 'en' : 'es');
const memory = () => D.normaliseMemory(state.settings.discover);

function saveMemory(m) {
  state.settings.discover = m;
  storage.setSetting('discover', m);
}

/* The two answers always sit in the same place, in the same colours, with the
   same pictures: a magnifying glass for finding, a hammer and wrench for
   making. Only the question changes. */
const MARK = { discovered: '🔍', invented: '🛠️' };

function seedSetup() {
  if (state.discover.setup) return state.discover.setup;
  const m = memory();
  state.discover.setup = { count: m.count || D.DEFAULT_COUNT, lang: m.lang || 'en' };
  return state.discover.setup;
}

export async function renderDiscover(step) {
  /* Two addresses only: the setup, and a round in play. Anything else, and a
     "play" link with no round behind it, goes to the setup's own address, so
     a wrong link shows up as a wrong link instead of quietly looking fine. */
  if ((step && step !== 'play') || (step === 'play' && !state.discover.round)) {
    location.replace('#/fun/discover');
    return;
  }
  const here = () => (location.hash || '').startsWith('#/fun/discover');
  try {
    if (!state.discover.data) state.discover.data = await D.loadDiscover();
  } catch (err) {
    console.error(err);
    if (here()) showError('Discovered or Invented could not be loaded.');
    return;
  }
  /* The child may have gone somewhere else while the questions loaded; the
     setup must not be drawn over the page they went to. */
  if (!here()) return;
  seedSetup();
  if (step === 'play' && state.discover.round) { drawDiscQuestion(); return; }
  drawDiscSetup();
}

/* ------------------------------------------------------------------ */
/* Setup                                                               */
/* ------------------------------------------------------------------ */

function ruleBox(data, lang) {
  return `
    <div class="cz-disc-rules" lang="${lang}">
      ${D.ANSWERS.map((a) => `
        <p class="cz-disc-rule cz-disc-rule--${a}">
          <span class="cz-disc-rule__mark" aria-hidden="true">${MARK[a]}</span>
          <span>${esc(D.pick(data.rule[a], lang))}</span>
        </p>`).join('')}
    </div>`;
}

/**
 * The words around the card: titles, back links and the hidden score labels.
 * They are in index.html, marked data-disc-text, and follow the language the
 * child is playing in, so a Spanish round is Spanish from top to bottom.
 */
function paintChrome(lang) {
  $$('[data-disc-text]').forEach((el) => { el.textContent = D.ui(el.dataset.discText, lang); });
  ['screen-discsetup', 'screen-discgame'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.setAttribute('lang', lang);
  });
}

function renderSetup(data, chosen) {
  const radio = (on) => `role="radio" aria-checked="${on}" tabindex="${on ? 0 : -1}"`;
  const counts = D.COUNTS.map((n) => {
    const on = Number(chosen.count) === n;
    return `<button type="button" class="gp-pill${on ? ' is-selected' : ''}" ${radio(on)}
              data-disccount="${n}">${n}</button>`;
  }).join('');
  const langs = [['en', 'English'], ['es', 'Español']].map(([id, label]) => {
    const on = chosen.lang === id;
    return `<button type="button" class="gp-pill${on ? ' is-selected' : ''}" ${radio(on)}
              data-disclang="${id}" lang="${id}">${label}</button>`;
  }).join('');
  const lang = chosen.lang;
  const t = (key, vars) => esc(D.ui(key, lang, vars));
  const noVoice = lang === 'es' && speech.isSupported() && !speech.voiceFor('es');

  return `
    ${ruleBox(data, lang)}

    <fieldset class="gp-fieldset">
      <legend class="gp-fieldset__legend">${t('howMany')}</legend>
      <div class="gp-row gp-row--wrap" id="gp-disc-counts" role="radiogroup"
           aria-label="${t('howMany')}">${counts}</div>
    </fieldset>

    <fieldset class="gp-fieldset">
      <legend class="gp-fieldset__legend">${t('langStart')}</legend>
      <div class="gp-row gp-row--wrap" id="gp-disc-langs" role="radiogroup"
           aria-label="${t('langStart')}">${langs}</div>
    </fieldset>

    <p class="gp-muted gp-grade-note">
      ${t('note', { n: data.items.length })}
      ${noVoice ? `<br>${t('noVoice')}` : ''}
    </p>

    <button type="button" class="gp-btn gp-btn--primary gp-btn--big" data-action="disc-start">${t('start')}</button>`;
}

export function drawDiscSetup() {
  const setup = seedSetup();
  $('#gp-disc-setup').innerHTML = renderSetup(state.discover.data, setup);
  paintChrome(setup.lang);
  paint();
  showScreen('discsetup');
}

/** A setup pill was tapped. Values arrive as dataset strings. */
export function setDiscSetup(key, value) {
  const setup = seedSetup();
  if (key === 'count' && D.COUNTS.includes(Number(value))) setup.count = Number(value);
  else if (key === 'lang' && (value === 'en' || value === 'es')) setup.lang = value;
  const m = memory();
  m.count = setup.count;
  m.lang = setup.lang;
  saveMemory(m);
  drawDiscSetup();
}

/* ------------------------------------------------------------------ */
/* A round                                                             */
/* ------------------------------------------------------------------ */

export function startDiscRound() {
  const setup = seedSetup();
  const list = D.buildRound(state.discover.data.items, setup.count, memory());
  if (!list.length) return;
  state.discover.round = {
    list, index: 0, right: 0, wrong: 0, lang: setup.lang,
    answered: false, picked: null, results: []
  };
  location.hash = '#/fun/discover/play';
  drawDiscQuestion();
}

function tally() {
  const r = state.discover.round;
  $('[data-disc-right]').textContent = r.right;
  $('[data-disc-wrong]').textContent = r.wrong;
}

export function drawDiscQuestion() {
  const r = state.discover.round;
  if (!r) { drawDiscSetup(); return; }
  if (r.index >= r.list.length) { drawDiscResults(); return; }
  paintCard();
  tally();
  showScreen('discgame');
  if (r.answered) focusNext();
}

function speakButton(label) {
  if (!speech.isSupported()) return '';
  return `<button type="button" class="gp-btn gp-btn--ghost cz-trivia-say" data-action="disc-say"
            aria-label="${esc(label)}">${icon('speaker', { size: 20 })}</button>`;
}

function renderCard(item, r) {
  const lang = r.lang;
  const buttons = D.ANSWERS.map((a) => {
    const isAnswer = a === item.answer;
    const cls = !r.answered ? '' : isAnswer ? ' is-correct' : a === r.picked ? ' is-incorrect' : '';
    const mark = !r.answered ? '' : isAnswer ? icon('check', { size: 20 })
      : a === r.picked ? icon('cross', { size: 20 }) : '';
    return `
      <button type="button" class="gp-choice cz-disc-choice cz-disc-choice--${a}${cls}"
              data-discpick="${a}" ${r.answered ? 'disabled' : ''}>
        <span class="cz-disc-choice__emoji" aria-hidden="true">${MARK[a]}</span>
        <span class="gp-choice__body">${esc(D.ui(a, lang))}</span>
        <span class="gp-choice__mark" aria-hidden="true">${mark}</span>
      </button>`;
  }).join('');

  const last = r.index + 1 >= r.list.length;
  const after = !r.answered ? '' : `
    <p class="gp-flagq__say ${r.picked === item.answer ? 'is-right' : 'is-wrong'}">
      ${esc(D.feedbackLine(item, r.picked === item.answer, lang))}</p>
    <p class="cz-trivia-why"><span aria-hidden="true">💡</span> ${esc(D.pick(item.why, lang))}</p>
    <button type="button" class="gp-btn gp-btn--primary gp-btn--big" data-action="disc-next">
      ${esc(D.ui(last ? 'finish' : 'next', lang))}</button>`;

  return `
    <div class="gp-flagq cz-trivia-card cz-disc-card" lang="${lang}">
      <div class="cz-trivia-top">
        <p class="gp-ex__count">${esc(D.ui('count', lang, { n: r.index + 1, total: r.list.length }))}</p>
        <div class="cz-trivia-tools">
          <button type="button" class="gp-btn gp-btn--ghost cz-trivia-lang" data-action="disc-lang"
            lang="${otherLang(lang)}">${esc(D.ui('langPill', lang))}</button>
          ${speakButton(D.ui('say', lang))}
        </div>
      </div>
      <p class="cz-disc-emoji" aria-hidden="true">${item.emoji}</p>
      <p class="gp-flagq__ask cz-disc-q">${esc(D.pick(item.q, lang))}</p>
      <div class="gp-flagq__choices cz-disc-choices">${buttons}</div>
      ${after}
    </div>`;
}

function paintCard() {
  const r = state.discover.round;
  $('#gp-disc-body').innerHTML = renderCard(r.list[r.index], r);
  paintChrome(r.lang);
  paint();
}

function focusNext() {
  const next = $('#gp-disc-body [data-action="disc-next"]');
  if (next) next.focus();
}

function readCard() {
  const r = state.discover.round;
  if (!r || r.index >= r.list.length) return;
  const item = r.list[r.index];
  const lang = r.lang;
  const parts = r.answered
    ? [D.feedbackLine(item, r.picked === item.answer, lang), D.pick(item.why, lang)]
    : [D.pick(item.q, lang)];
  speech.speak(parts, { lang, force: true });
}

/** A tap on Discovered or Invented. */
export function answerDisc(pick) {
  const r = state.discover.round;
  if (!r || r.answered || r.index >= r.list.length || !D.ANSWERS.includes(pick)) return;
  const item = r.list[r.index];
  const right = D.judge(item, pick);
  r.answered = true;
  r.picked = pick;
  if (right) r.right += 1; else r.wrong += 1;
  r.results.push({ item, right });

  /* Saved now, not at the end: a closed tab must not bring the same ten back. */
  saveMemory(D.record(memory(), item.id));

  react(right ? 'happy' : 'oops', right ? 2300 : 1800);
  paintCard();
  tally();
  focusNext();
}

export function nextDisc() {
  const r = state.discover.round;
  if (!r || !r.answered) return;
  speech.cancel();
  r.index += 1;
  r.answered = false;
  r.picked = null;
  drawDiscQuestion();
}

/** The language button on the card: the same card, the other column. */
function flipLanguage() {
  const r = state.discover.round;
  if (!r) return;
  r.lang = otherLang(r.lang);
  seedSetup().lang = r.lang;
  const m = memory();
  m.lang = r.lang;
  saveMemory(m);
  speech.cancel();
  if (r.index >= r.list.length) { drawDiscResults(); return; }
  paintCard();
  const pill = $('#gp-disc-body [data-action="disc-lang"]');
  if (pill) pill.focus();
}

/* ------------------------------------------------------------------ */
/* Results                                                             */
/* ------------------------------------------------------------------ */

function drawDiscResults() {
  const r = state.discover.round;
  const lang = r.lang;
  const total = r.list.length;
  const perfect = total > 0 && r.right === total;
  if (perfect && !r.cheered) { r.cheered = true; react('wow', 2600); }
  const missed = r.results.filter((x) => !x.right);

  $('#gp-disc-body').innerHTML = `
    <div class="gp-flagdone cz-trivia-done${perfect ? ' is-perfect' : ''}" lang="${lang}">
      ${perfect ? '<div class="gp-confetti" aria-hidden="true">' +
        Array.from({ length: 14 }, (_, i) => `<span data-style="--i:${i}"></span>`).join('') + '</div>' : ''}
      <div class="cz-trivia-tools cz-disc-donetools">
        <button type="button" class="gp-btn gp-btn--ghost cz-trivia-lang" data-action="disc-lang"
          lang="${otherLang(lang)}">${esc(D.ui('langPill', lang))}</button>
      </div>
      <h2 class="gp-flagdone__head">${esc(D.ui(perfect ? 'perfect' : 'done', lang))}</h2>
      <p class="gp-flagdone__score">${D.ui('score', lang, {
        r: `<strong>${r.right}</strong>`, w: `<strong>${r.wrong}</strong>`, t: total })}</p>

      <section class="cz-trivia-learnedbox">
        <h3 class="cz-trivia-last__title">${esc(D.ui('remember', lang))}</h3>
        ${missed.length ? `<ul class="cz-trivia-learned">
          ${missed.map(({ item }) => `<li>
            <span aria-hidden="true">${item.emoji}</span>
            <span><strong>${esc(D.ui(item.answer, lang))}.</strong> ${esc(D.pick(item.why, lang))}</span>
          </li>`).join('')}
        </ul>` : `<p class="gp-muted">${esc(D.ui('allRight', lang))}</p>`}
      </section>

      <div class="gp-flagdone__again">
        <button type="button" class="gp-btn gp-btn--primary" data-action="disc-again">${esc(D.ui('againBtn', lang))}</button>
        <a class="gp-btn gp-btn--ghost" href="#/fun/discover">${esc(D.ui('change', lang))}</a>
        <a class="gp-btn gp-btn--quiet" href="#/fun">${esc(D.ui('back', lang))}</a>
      </div>
    </div>`;
  paintChrome(lang);
  paint();
  tally();
  showScreen('discgame');
}

/* ------------------------------------------------------------------ */
/* Buttons and keys                                                    */
/* ------------------------------------------------------------------ */

export function discAction(name) {
  switch (name) {
    case 'disc-start':
    case 'disc-again':
      startDiscRound();
      break;
    case 'disc-next':
      nextDisc();
      break;
    case 'disc-lang':
      flipLanguage();
      break;
    case 'disc-say':
      readCard();
      break;
    default:
      break;
  }
}

/**
 * Keys: D or 1 for Discovered, I or 2 for Invented. The letters work in both
 * languages: Descubierto, Inventado. Returns true when it used the key.
 */
export function discKey(ev) {
  const screen = document.getElementById('screen-discgame');
  const r = state.discover.round;
  if (!screen || !screen.classList.contains('is-active') || !r || r.answered) return false;
  if (ev.metaKey || ev.ctrlKey || ev.altKey || /^(INPUT|TEXTAREA)$/.test(ev.target.tagName)) return false;
  const key = ev.key.toLowerCase();
  const pick = key === 'd' || key === '1' ? 'discovered'
    : key === 'i' || key === '2' ? 'invented' : null;
  if (!pick) return false;
  ev.preventDefault();
  answerDisc(pick);
  return true;
}
