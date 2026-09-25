/**
 * screens/teasers.js — Math Brain Teasers, drawn.
 *
 * A room of its own, at #/teasers. The setup card, one teaser at a time with
 * a hint behind a button, and the results. The decisions live in
 * modules/teasers.js.
 */

import * as T from './../modules/teasers.js';
import * as storage from './../modules/storage.js';
import * as speech from './../modules/speech.js';
import { icon } from './../modules/icons.js';
import { escapeHtml as esc } from './../modules/charts.js';
import { spreadAnswer, noteSlot } from './../modules/slots.js';
import { $, $$, paint, react, showError, showScreen, state } from './../modules/shell.js';

const otherLang = (lang) => (lang === 'es' ? 'en' : 'es');
const memory = () => T.normaliseMemory(state.settings.teasers);

function saveMemory(m) {
  state.settings.teasers = m;
  storage.setSetting('teasers', m);
}

function seedSetup() {
  if (state.teasers.setup) return state.teasers.setup;
  const m = memory();
  state.teasers.setup = {
    level: m.level || 'easy', count: m.count || T.DEFAULT_COUNT, lang: m.lang || 'en'
  };
  return state.teasers.setup;
}

function rememberSetup() {
  const s = seedSetup();
  const m = memory();
  Object.assign(m, { level: s.level, count: s.count, lang: s.lang });
  saveMemory(m);
}

export async function renderTeasers(step) {
  /* Two addresses: the setup, and a round in play. Anything else goes to the
     setup's own address, so a wrong link shows up as one. */
  if ((step && step !== 'play') || (step === 'play' && !state.teasers.round)) {
    location.replace('#/teasers');
    return;
  }
  const here = () => (location.hash || '').startsWith('#/teasers');
  try {
    if (!state.teasers.manifest) state.teasers.manifest = await T.loadManifest();
  } catch (err) {
    console.error(err);
    if (here()) showError('The brain teasers could not be loaded.');
    return;
  }
  /* The child may have gone somewhere else while the list loaded. */
  if (!here()) return;
  seedSetup();
  if (step === 'play') { drawTeaserQuestion(); return; }
  drawTeaserSetup();
}

/* The words around the card, marked data-teaser-text in index.html, follow
   the language the child is playing in. */
function paintChrome(lang) {
  $$('[data-teaser-text]').forEach((el) => { el.textContent = T.ui(el.dataset.teaserText, lang); });
  ['screen-teasersetup', 'screen-teasergame'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.setAttribute('lang', lang);
  });
}

/* ------------------------------------------------------------------ */
/* Setup                                                               */
/* ------------------------------------------------------------------ */

function renderSetup(manifest, chosen) {
  const lang = chosen.lang;
  const t = (key, vars) => esc(T.ui(key, lang, vars));
  const radio = (on) => `role="radio" aria-checked="${on}" tabindex="${on ? 0 : -1}"`;

  /* One choice of three, like the count and language pickers below it: a
     radio group, so a screen reader says which level is chosen and the arrow
     keys move through it (radioGroupKeys in app.js). */
  const levels = manifest.levels.map((l) => {
    const on = chosen.level === l.id;
    return `
      <button type="button" class="gp-card gp-card--mode${on ? ' is-selected' : ''}" ${radio(on)}
              data-teaserlevel="${l.id}">
        <span class="gp-card__title">${esc(T.pick(l.name, lang))} &middot; ${t('ages', { ages: l.ages })}</span>
        <span class="gp-card__sub">${t('teasers', { n: l.count })}</span>
      </button>`;
  }).join('');

  const counts = T.COUNTS.map((n) => {
    const on = Number(chosen.count) === n;
    return `<button type="button" class="gp-pill${on ? ' is-selected' : ''}" ${radio(on)}
              data-teasercount="${n}">${n}</button>`;
  }).join('');

  const langs = [['en', 'English'], ['es', 'Español']].map(([id, label]) => {
    const on = lang === id;
    return `<button type="button" class="gp-pill${on ? ' is-selected' : ''}" ${radio(on)}
              data-teaserlang="${id}" lang="${id}">${label}</button>`;
  }).join('');

  return `
    <fieldset class="gp-fieldset">
      <legend class="gp-fieldset__legend">${t('who')}</legend>
      <div class="gp-grid gp-grid--modes" id="gp-teaser-levels" role="radiogroup"
           aria-label="${t('who')}">${levels}</div>
    </fieldset>

    <fieldset class="gp-fieldset">
      <legend class="gp-fieldset__legend">${t('howMany')}</legend>
      <div class="gp-row gp-row--wrap" id="gp-teaser-counts" role="radiogroup"
           aria-label="${t('howMany')}">${counts}</div>
    </fieldset>

    <fieldset class="gp-fieldset">
      <legend class="gp-fieldset__legend">${t('langStart')}</legend>
      <div class="gp-row gp-row--wrap" id="gp-teaser-langs" role="radiogroup"
           aria-label="${t('langStart')}">${langs}</div>
    </fieldset>

    <p class="gp-muted gp-grade-note">${t('note')}</p>

    <button type="button" class="gp-btn gp-btn--primary gp-btn--big" data-action="teaser-start">${t('start')}</button>`;
}

export function drawTeaserSetup() {
  const setup = seedSetup();
  $('#gp-teaser-setup').innerHTML = renderSetup(state.teasers.manifest, setup);
  paintChrome(setup.lang);
  paint();
  showScreen('teasersetup');
}

/** A setup pill or level card was tapped. Values arrive as dataset strings. */
export function setTeaserSetup(key, value) {
  const setup = seedSetup();
  if (key === 'level' && T.LEVEL_IDS.includes(value)) setup.level = value;
  else if (key === 'count' && T.COUNTS.includes(Number(value))) setup.count = Number(value);
  else if (key === 'lang' && (value === 'en' || value === 'es')) setup.lang = value;
  rememberSetup();
  drawTeaserSetup();
}

/* ------------------------------------------------------------------ */
/* A round                                                             */
/* ------------------------------------------------------------------ */

export async function startTeaserRound() {
  if (state.teasers.starting) return;
  const setup = { ...seedSetup() };
  state.teasers.starting = true;
  react('think', 3000);
  let items;
  /* Only start if the child is still where they pressed the button (the
     setup, or the results for "Play again") when the level arrives: a slow
     load must not pull them back into a room they have left. */
  const from = location.hash || '';
  const stillHere = () => (location.hash || '') === from;
  try {
    items = await T.loadLevel(setup.level);
  } catch (err) {
    console.error(err);
    if (stillHere()) showError('The brain teasers could not be loaded.');
    return;
  } finally {
    state.teasers.starting = false;
  }
  if (!stillHere()) return;
  const list = T.buildRound(items, setup.count, { seen: memory().seen[setup.level] });
  if (!list.length) return;
  state.teasers.round = {
    setup, list, index: 0, right: 0, wrong: 0, lang: setup.lang,
    answered: false, picked: null, hint: false, choices: null, choicesFor: -1,
    slots: [], results: []
  };
  location.hash = '#/teasers/play';
  drawTeaserQuestion();
}

function tally() {
  const r = state.teasers.round;
  $('[data-teaser-right]').textContent = r.right;
  $('[data-teaser-wrong]').textContent = r.wrong;
}

export function drawTeaserQuestion() {
  const r = state.teasers.round;
  if (!r) { drawTeaserSetup(); return; }
  if (r.index >= r.list.length) { drawTeaserResults(); return; }
  /* Built once per teaser, so a redraw never moves the tiles. */
  if (r.choicesFor !== r.index) {
    const item = r.list[r.index];
    r.choices = spreadAnswer(T.makeChoices(item), (c) => c.index === item.answer, r.slots);
    noteSlot(r.slots, r.choices.findIndex((c) => c.index === item.answer));
    r.choicesFor = r.index;
    r.answered = false;
    r.picked = null;
    r.hint = false;
  }
  paintCard();
  tally();
  showScreen('teasergame');
  if (r.answered) focusNext();
}

function speakButton(label) {
  if (!speech.isSupported()) return '';
  return `<button type="button" class="gp-btn gp-btn--ghost cz-trivia-say" data-action="teaser-say"
            aria-label="${esc(label)}">${icon('speaker', { size: 20 })}</button>`;
}

function renderCard(item, r) {
  const lang = r.lang;
  const level = state.teasers.manifest.levels.find((l) => l.id === r.setup.level);
  const choices = r.choices.map((c, i) => {
    const isAnswer = c.index === item.answer;
    const cls = !r.answered ? '' : isAnswer ? ' is-correct' : i === r.picked ? ' is-incorrect' : '';
    const mark = !r.answered ? '' : isAnswer ? icon('check', { size: 20 })
      : i === r.picked ? icon('cross', { size: 20 }) : '';
    return `
      <button type="button" class="gp-choice cz-trivia-choice${cls}" data-teaserpick="${i}"
              ${r.answered ? 'disabled' : ''}>
        <span class="gp-choice__body">${esc(T.pick(c, lang))}</span>
        <span class="gp-choice__mark" aria-hidden="true">${mark}</span>
      </button>`;
  }).join('');

  const hint = item.hint && !r.answered
    ? (r.hint
      ? `<p class="cz-teaser-hint"><span aria-hidden="true">🔎</span> ${esc(T.pick(item.hint, lang))}</p>`
      : `<button type="button" class="gp-btn gp-btn--ghost cz-teaser-hintbtn" data-action="teaser-hint">
           <span aria-hidden="true">🔎</span> ${esc(T.ui('hintBtn', lang))}</button>`)
    : '';

  const last = r.index + 1 >= r.list.length;
  const after = !r.answered ? '' : `
    <p class="gp-flagq__say ${T.judge(item, r.choices[r.picked].index) ? 'is-right' : 'is-wrong'}">
      ${esc(T.feedbackLine(item, T.judge(item, r.choices[r.picked].index), lang))}</p>
    <p class="cz-trivia-why"><span aria-hidden="true">💡</span> ${esc(T.pick(item.why, lang))}</p>
    <button type="button" class="gp-btn gp-btn--primary gp-btn--big" data-action="teaser-next">
      ${esc(T.ui(last ? 'finish' : 'next', lang))}</button>`;
  const cols = r.choices.length === 3 ? 3 : 4;

  return `
    <div class="gp-flagq cz-trivia-card cz-teaser-card" lang="${lang}">
      <div class="cz-trivia-top">
        <p class="gp-ex__count">${esc(T.ui('count', lang, { n: r.index + 1, total: r.list.length }))}</p>
        <p class="cz-trivia-cat">${esc(T.pick(level.name, lang))}</p>
        <div class="cz-trivia-tools">
          <button type="button" class="gp-btn gp-btn--ghost cz-trivia-lang" data-action="teaser-lang"
            lang="${otherLang(lang)}">${esc(T.ui('langPill', lang))}</button>
          ${speakButton(T.ui('say', lang))}
        </div>
      </div>
      <p class="gp-flagq__ask cz-teaser-q">${item.emoji ? `<span class="cz-trivia-q__emoji" aria-hidden="true">${item.emoji}</span> ` : ''}${esc(T.pick(item.q, lang))}</p>
      ${hint}
      <div class="gp-flagq__choices cz-trivia-choices--${cols}">${choices}</div>
      ${after}
    </div>`;
}

function paintCard() {
  const r = state.teasers.round;
  $('#gp-teaser-body').innerHTML = renderCard(r.list[r.index], r);
  paintChrome(r.lang);
  paint();
}

function focusNext() {
  const next = $('#gp-teaser-body [data-action="teaser-next"]');
  if (next) next.focus();
}

function readCard() {
  const r = state.teasers.round;
  if (!r || r.index >= r.list.length) return;
  const item = r.list[r.index];
  const lang = r.lang;
  const parts = r.answered
    ? [T.feedbackLine(item, T.judge(item, r.choices[r.picked].index), lang), T.pick(item.why, lang)]
    : [T.pick(item.q, lang), ...r.choices.map((c) => T.pick(c, lang))];
  speech.speak(parts, { lang, force: true });
}

/** A tap on a choice. `i` is the tile's position on screen. */
export function answerTeaser(i) {
  const r = state.teasers.round;
  if (!r || r.answered || r.index >= r.list.length) return;
  const choice = r.choices[Number(i)];
  if (!choice) return;
  const item = r.list[r.index];
  const right = T.judge(item, choice.index);
  r.answered = true;
  r.picked = Number(i);
  if (right) r.right += 1; else r.wrong += 1;
  r.results.push({ item, right });
  saveMemory(T.record(memory(), r.setup.level, item.id));
  react(right ? 'happy' : 'oops', right ? 2300 : 1800);
  paintCard();
  tally();
  focusNext();
}

function nextTeaser() {
  const r = state.teasers.round;
  if (!r || !r.answered) return;
  speech.cancel();
  r.index += 1;
  drawTeaserQuestion();
}

function flipLanguage() {
  const r = state.teasers.round;
  if (!r) return;
  r.lang = otherLang(r.lang);
  seedSetup().lang = r.lang;
  rememberSetup();
  speech.cancel();
  if (r.index >= r.list.length) { drawTeaserResults(); return; }
  paintCard();
  const pill = $('#gp-teaser-body [data-action="teaser-lang"]');
  if (pill) pill.focus();
}

/* ------------------------------------------------------------------ */
/* Results                                                             */
/* ------------------------------------------------------------------ */

function drawTeaserResults() {
  const r = state.teasers.round;
  const lang = r.lang;
  const total = r.list.length;
  const perfect = total > 0 && r.right === total;
  if (perfect && !r.cheered) { r.cheered = true; react('wow', 2600); }
  const missed = r.results.filter((x) => !x.right);

  $('#gp-teaser-body').innerHTML = `
    <div class="gp-flagdone cz-trivia-done${perfect ? ' is-perfect' : ''}" lang="${lang}">
      ${perfect ? '<div class="gp-confetti" aria-hidden="true">' +
        Array.from({ length: 14 }, (_, i) => `<span data-style="--i:${i}"></span>`).join('') + '</div>' : ''}
      <div class="cz-trivia-tools cz-disc-donetools">
        <button type="button" class="gp-btn gp-btn--ghost cz-trivia-lang" data-action="teaser-lang"
          lang="${otherLang(lang)}">${esc(T.ui('langPill', lang))}</button>
      </div>
      <h2 class="gp-flagdone__head">${esc(T.ui(perfect ? 'perfect' : 'done', lang))}</h2>
      <p class="gp-flagdone__score">${T.ui('score', lang, {
        r: `<strong>${r.right}</strong>`, w: `<strong>${r.wrong}</strong>`, t: total })}</p>

      <section class="cz-trivia-learnedbox">
        <h3 class="cz-trivia-last__title">${esc(T.ui('remember', lang))}</h3>
        ${missed.length ? `<ul class="cz-trivia-learned">
          ${missed.map(({ item }) => `<li>
            <span aria-hidden="true">${item.emoji || '🧠'}</span>
            <span><strong>${esc(T.pick(item.q, lang))}</strong><br>${esc(T.pick(item.why, lang))}</span>
          </li>`).join('')}
        </ul>` : `<p class="gp-muted">${esc(T.ui('allRight', lang))}</p>`}
      </section>

      <div class="gp-flagdone__again">
        <button type="button" class="gp-btn gp-btn--primary" data-action="teaser-again">${esc(T.ui('againBtn', lang))}</button>
        <a class="gp-btn gp-btn--ghost" href="#/teasers">${esc(T.ui('change', lang))}</a>
        <a class="gp-btn gp-btn--quiet" href="#/home">${esc(T.ui('home', lang))}</a>
      </div>
    </div>`;
  paintChrome(lang);
  paint();
  tally();
  showScreen('teasergame');
}

/* ------------------------------------------------------------------ */
/* Buttons and keys                                                    */
/* ------------------------------------------------------------------ */

export function teaserAction(name) {
  switch (name) {
    case 'teaser-start':
    case 'teaser-again':
      startTeaserRound();
      break;
    case 'teaser-next':
      nextTeaser();
      break;
    case 'teaser-lang':
      flipLanguage();
      break;
    case 'teaser-say':
      readCard();
      break;
    case 'teaser-hint': {
      const r = state.teasers.round;
      if (r && !r.answered) { r.hint = true; paintCard(); }
      break;
    }
    default:
      break;
  }
}

/** Number keys answer. Returns true when it used the key. */
export function teaserKey(ev) {
  const screen = document.getElementById('screen-teasergame');
  const r = state.teasers.round;
  if (!screen || !screen.classList.contains('is-active') || !r || r.answered) return false;
  if (ev.metaKey || ev.ctrlKey || ev.altKey || /^(INPUT|TEXTAREA)$/.test(ev.target.tagName)) return false;
  if (!/^[1-4]$/.test(ev.key) || Number(ev.key) > (r.choices || []).length) return false;
  ev.preventDefault();
  answerTeaser(Number(ev.key) - 1);
  return true;
}
