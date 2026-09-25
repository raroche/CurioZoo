/**
 * screens/trivia.js — Curio Trivia, drawn.
 *
 * The setup card, one question at a time, the results and the Fact Book. Every
 * decision (which questions, what a tap means, what a star is, what is
 * remembered) is made in modules/trivia.js; this file only turns those answers
 * into markup and wires the buttons.
 *
 * A room of its own, at #/trivia. It used to be a game inside Fun and Games,
 * so screens/fun.js still forwards the old #/fun/trivia links here.
 */

import * as T from './../modules/trivia.js';
import * as storage from './../modules/storage.js';
import * as speech from './../modules/speech.js';
import { icon } from './../modules/icons.js';
import { escapeHtml as esc } from './../modules/charts.js';
import { shuffle } from './../modules/shuffle.js';
import { spreadAnswer, noteSlot } from './../modules/slots.js';
import { $, paint, react, showError, showScreen, state } from './../modules/shell.js';

const otherLang = (lang) => (lang === 'es' ? 'en' : 'es');
const memory = () => T.normaliseMemory(state.settings.trivia);

function saveMemory(m) {
  state.settings.trivia = m;
  storage.setSetting('trivia', m);
}

const catOf = (id) => state.trivia.manifest.categories.find((c) => c.id === id);
const catName = (c, lang) => (lang === 'es' ? c.es : c.name);
const categoryOfId = (id) => String(id).split('-')[0];

async function ensureManifest() {
  if (state.trivia.manifest) return true;
  try {
    state.trivia.manifest = await T.loadManifest();
    return true;
  } catch (err) {
    console.error(err);
    showError('The trivia questions could not be loaded.');
    return false;
  }
}

/** The questions for these categories, fetched once and kept for next time. */
async function ensureData(ids) {
  const missing = ids.filter((id) => !state.trivia.data.has(id));
  const lists = await Promise.all(missing.map((id) => T.loadCategory(id)));
  missing.forEach((id, i) => state.trivia.data.set(id, lists[i]));
  const pool = {};
  ids.forEach((id) => { pool[id] = state.trivia.data.get(id); });
  return pool;
}

/* The child's last choices come back next week. */
function seedSetup() {
  if (state.trivia.setup) return state.trivia.setup;
  const m = memory();
  const level = m.level || 'easy';
  state.trivia.setup = {
    level,
    category: 'mixed',
    count: m.count || T.defaultCount(level),
    lang: m.lang || 'en',
    countTouched: Boolean(m.count)
  };
  return state.trivia.setup;
}

function rememberChoices(setup) {
  const m = memory();
  m.level = setup.level;
  m.lang = setup.lang;
  if (setup.countTouched) m.count = setup.count;
  saveMemory(m);
}

/* ------------------------------------------------------------------ */
/* Setup                                                               */
/* ------------------------------------------------------------------ */

export async function renderTrivia(step) {
  if (!(await ensureManifest())) return;
  seedSetup();
  if (step === 'play' && state.trivia.round) { drawTriviaQuestion(); return; }
  /* "Last time you learned" needs the words of last week's facts, which live
     in at most a few files. Fetch just those; the rest wait for Start. */
  const last = memory().last;
  if (last && last.ids.length) {
    try { await ensureData([...new Set(last.ids.map(categoryOfId))].filter(catOf)); }
    catch (err) { console.error(err); }
  }
  drawTriviaSetup();
}

const LEVEL_BLURB = {
  easy: 'three choices, read out loud',
  medium: 'four choices',
  hard: 'four choices, tougher ones'
};

function poolSize(manifest, setup) {
  const cats = setup.category === 'mixed'
    ? manifest.categories : manifest.categories.filter((c) => c.id === setup.category);
  return cats.reduce((n, c) => n + ((c.counts && c.counts[setup.level]) || 0), 0);
}

function lastLearned(m) {
  if (!m.last) return [];
  return m.last.ids.map((id) => {
    const q = (state.trivia.data.get(categoryOfId(id)) || []).find((x) => x.id === id);
    return q ? { q, category: categoryOfId(id) } : null;
  }).filter(Boolean).slice(0, 3);
}

function renderSetup(manifest, chosen, m) {
  const radio = (on) => `role="radio" aria-checked="${on}" tabindex="${on ? 0 : -1}"`;
  const levels = manifest.levels.map((l) => {
    const on = chosen.level === l.id;
    return `
      <button type="button" class="gp-card gp-card--mode${on ? ' is-selected' : ''}"
              data-trivialevel="${l.id}" aria-pressed="${on}">
        <span class="gp-card__title">${esc(l.name)} &middot; ages ${esc(l.ages)}</span>
        <span class="gp-card__sub">${esc(LEVEL_BLURB[l.id])}</span>
      </button>`;
  }).join('');

  const unseenFor = (c) => Math.max(0, ((c.counts && c.counts[chosen.level]) || 0)
    - T.seenIn(m, c.id, chosen.level));
  const total = poolSize(manifest, { ...chosen, category: 'mixed' });
  const seenAll = manifest.categories.reduce((n, c) => n + T.seenIn(m, c.id, chosen.level), 0);
  const cat = (id, label, left) => {
    const on = chosen.category === id;
    return `<button type="button" class="gp-pill${on ? ' is-selected' : ''}" ${radio(on)}
              data-triviacat="${id}">${label} <small>${left}</small></button>`;
  };
  const cats = [
    cat('mixed', '<span aria-hidden="true">🎲</span> Mixed', Math.max(0, total - seenAll)),
    ...manifest.categories.map((c) => cat(c.id,
      `<span aria-hidden="true">${c.emoji}</span> ${esc(c.name)}`, unseenFor(c)))
  ].join('');

  const counts = T.COUNTS.map((n) => {
    const on = Number(chosen.count) === n;
    return `<button type="button" class="gp-pill${on ? ' is-selected' : ''}" ${radio(on)}
              data-triviacount="${n}">${n}</button>`;
  }).join('');

  const langs = [['en', 'English'], ['es', 'Español']].map(([id, label]) => {
    const on = chosen.lang === id;
    return `<button type="button" class="gp-pill${on ? ' is-selected' : ''}" ${radio(on)}
              data-trivialang="${id}" lang="${id}">${label}</button>`;
  }).join('');

  const available = poolSize(manifest, chosen);
  const willPlay = Math.min(Number(chosen.count), available);
  const noVoice = chosen.lang === 'es' && speech.isSupported() && !speech.voiceFor('es');
  const learned = lastLearned(m);

  return `
    <fieldset class="gp-fieldset">
      <legend class="gp-fieldset__legend">Who is playing?</legend>
      <div class="gp-grid gp-grid--modes">${levels}</div>
    </fieldset>

    <fieldset class="gp-fieldset">
      <legend class="gp-fieldset__legend">What about?</legend>
      <div class="gp-row gp-row--wrap cz-trivia-pills" id="gp-trivia-cats" role="radiogroup"
           aria-label="What about">${cats}</div>
    </fieldset>

    <fieldset class="gp-fieldset">
      <legend class="gp-fieldset__legend">How many questions?</legend>
      <div class="gp-row gp-row--wrap" id="gp-trivia-counts" role="radiogroup"
           aria-label="How many questions">${counts}</div>
    </fieldset>

    <fieldset class="gp-fieldset">
      <legend class="gp-fieldset__legend">Language to start in</legend>
      <div class="gp-row gp-row--wrap" id="gp-trivia-langs" role="radiogroup"
           aria-label="Language to start in">${langs}</div>
    </fieldset>

    <p class="gp-muted gp-grade-note" id="gp-trivia-note">
      That is <strong>${willPlay}</strong> question${willPlay === 1 ? '' : 's'}.
      You have seen ${Math.min(seenAll, total)} of ${total} at this level.
      ${noVoice ? '<br>No Spanish voice on this device, so it will read with an English one.' : ''}
    </p>

    ${learned.length ? `
      <div class="cz-trivia-last">
        <div class="cz-trivia-last__head">
          <p class="cz-trivia-last__title">Last time you learned:</p>
          ${speakButton('last', 'Read it to me')}
        </div>
        <ul class="cz-trivia-learned">
          ${learned.map(({ q, category }) => {
            const lang = T.cardLang(q, chosen.lang);
            return `<li lang="${lang}"><span aria-hidden="true">${(catOf(category) || {}).emoji || '💡'}</span>
              ${esc(T.text(q, 'why', lang))}</li>`;
          }).join('')}
        </ul>
      </div>` : ''}

    <button type="button" class="gp-btn gp-btn--primary gp-btn--big" data-action="trivia-start"
      ${willPlay ? '' : 'disabled'}>Start &rarr;</button>`;
}

function speakButton(say, label) {
  if (!speech.isSupported()) return '';
  return `<button type="button" class="gp-btn gp-btn--ghost cz-trivia-say" data-action="trivia-say"
            data-say="${say}" aria-label="${esc(label)}">${icon('speaker', { size: 20 })}</button>`;
}

export function drawTriviaSetup() {
  const setup = seedSetup();
  $('#gp-trivia-setup').innerHTML = renderSetup(state.trivia.manifest, setup, memory());
  paint();
  showScreen('triviasetup');
}

/** One of the setup pills was tapped. Values arrive as dataset strings. */
export function setTriviaSetup(key, value) {
  const setup = seedSetup();
  if (key === 'level' && T.LEVEL_IDS.includes(value)) {
    setup.level = value;
    /* A new level brings its own round length, unless the child already chose one. */
    if (!setup.countTouched) setup.count = T.defaultCount(value);
  } else if (key === 'category') {
    setup.category = value;
  } else if (key === 'count' && T.COUNTS.includes(Number(value))) {
    setup.count = Number(value);
    setup.countTouched = true;
  } else if (key === 'lang' && (value === 'en' || value === 'es')) {
    setup.lang = value;
  }
  drawTriviaSetup();
}

/* ------------------------------------------------------------------ */
/* A round                                                             */
/* ------------------------------------------------------------------ */

export async function startTriviaRound() {
  if (state.trivia.starting) return;
  const setup = { ...seedSetup() };
  const ids = setup.category === 'mixed'
    ? state.trivia.manifest.categories.map((c) => c.id) : [setup.category];
  state.trivia.starting = true;
  /* Sixteen small files on a first Mixed round. The mascot thinks rather than
     a spinner spinning. */
  react('think', 4000);
  let pool;
  try {
    pool = await ensureData(ids);
  } catch (err) {
    console.error(err);
    showError('The trivia questions could not be loaded.');
    return;
  } finally {
    state.trivia.starting = false;
  }
  const list = T.buildRound(pool, setup, memory());
  if (!list.length) return;
  rememberChoices(setup);
  state.trivia.round = {
    setup, list, index: 0, right: 0, wrong: 0, streak: 0,
    freshTotal: list.length, lang: setup.lang,
    answered: false, picked: null, choices: null, choicesFor: -1, slots: [],
    learned: [], secondLooks: false, readFor: -1, saved: false
  };
  location.hash = '#/trivia/play';
  drawTriviaQuestion();
}

function tally() {
  const r = state.trivia.round;
  $('[data-trivia-right]').textContent = r.right;
  $('[data-trivia-wrong]').textContent = r.wrong;
}

export function drawTriviaQuestion() {
  const r = state.trivia.round;
  if (!r) { drawTriviaSetup(); return; }
  if (r.index >= r.list.length && !r.secondLooks) {
    /* The misses come back once, at the end, while they are still fresh
       enough to answer and far enough away to be worth retrieving. */
    r.secondLooks = true;
    r.list.push(...T.secondLooks(r));
  }
  if (r.index >= r.list.length) { drawTriviaResults(); return; }

  /* Choices are built once per question. Setting the hash re-renders, and a
     second shuffle would make the tiles jump under the child's finger. */
  if (r.choicesFor !== r.index) {
    const item = r.list[r.index];
    const q = item.question;
    r.choices = spreadAnswer(shuffle(T.makeChoices(q, r.setup.level)),
      (c) => c.index === q.answer, r.slots);
    noteSlot(r.slots, r.choices.findIndex((c) => c.index === q.answer));
    r.choicesFor = r.index;
    r.answered = false;
    r.picked = null;
  }
  paintCard();
  tally();
  showScreen('triviagame');
  if (r.answered) focusNext();

  /* A four-year-old cannot read the stem, so Easy reads itself. Once per
     question: a re-render must not start it again. */
  if (r.setup.level === 'easy' && state.settings.readAloud && r.readFor !== r.index) {
    r.readFor = r.index;
    readCard();
  }
}

function paintCard() {
  const r = state.trivia.round;
  $('#gp-trivia-body').innerHTML = renderCard(r.list[r.index], r);
  paint();
}

function focusNext() {
  const next = $('#gp-trivia-body [data-action="trivia-next"]');
  if (next) next.focus();
}

function renderCard(item, r) {
  const q = item.question;
  const level = r.setup.level;
  const lang = T.cardLang(q, r.lang);
  const cat = catOf(item.category);
  const fresh = r.freshTotal;
  const count = item.again
    ? T.ui('againCount', lang, { n: r.index - fresh + 1, total: r.list.length - fresh })
    : T.ui('count', lang, { n: r.index + 1, total: fresh });
  const oneLang = q.lang === 'en' || q.lang === 'es';

  const langControl = oneLang
    ? `<p class="cz-trivia-wordnote">${esc(T.ui('wordGame', lang))}</p>`
    : `<button type="button" class="gp-btn gp-btn--ghost cz-trivia-lang" data-action="trivia-lang"
         lang="${otherLang(lang)}">${esc(T.ui('langPill', lang))}</button>`;

  const choices = r.choices.map((c, i) => {
    const isAnswer = c.index === q.answer;
    const state_ = !r.answered ? '' : isAnswer ? ' is-correct' : i === r.picked ? ' is-incorrect' : '';
    const mark = !r.answered ? '' : isAnswer ? icon('check', { size: 20 })
      : i === r.picked ? icon('cross', { size: 20 }) : '';
    const emoji = c.emoji && (level === 'easy' || c.emoji)
      ? `<span class="cz-trivia-choice__emoji" aria-hidden="true">${c.emoji}</span>` : '';
    return `
      <button type="button" class="gp-choice cz-trivia-choice${state_}" data-triviapick="${i}"
              ${r.answered ? 'disabled' : ''}>
        ${emoji}
        <span class="gp-choice__body">${esc(T.pick(c, lang))}</span>
        <span class="gp-choice__mark" aria-hidden="true">${mark}</span>
      </button>`;
  }).join('');

  const after = !r.answered ? '' : `
    <p class="gp-flagq__say ${item.right ? 'is-right' : 'is-wrong'}">
      ${esc(T.feedbackLine(q, item.right, lang, level, item.again))}</p>
    <p class="cz-trivia-why"><span aria-hidden="true">💡</span> ${esc(T.text(q, 'why', lang))}</p>
    <button type="button" class="gp-btn gp-btn--primary gp-btn--big" data-action="trivia-next">
      ${esc(T.ui(r.index + 1 >= r.list.length && r.secondLooks ? 'finish'
        : r.index + 1 >= r.list.length && !T.secondLooks(r).length ? 'finish' : 'next', lang))}</button>`;

  return `
    <div class="gp-flagq cz-trivia-card cz-trivia-card--${level}" lang="${lang}">
      <div class="cz-trivia-top">
        <p class="gp-ex__count">${esc(count)}</p>
        <p class="cz-trivia-cat"><span aria-hidden="true">${cat.emoji}</span> ${esc(catName(cat, lang))}</p>
        <div class="cz-trivia-tools">
          ${langControl}
          ${speakButton('card', T.ui('say', lang))}
        </div>
      </div>
      ${item.again ? `<p class="cz-trivia-again"><span aria-hidden="true">🔁</span> ${esc(T.ui('again', lang))}</p>` : ''}
      <p class="gp-flagq__ask cz-trivia-q">${q.emoji ? `<span class="cz-trivia-q__emoji" aria-hidden="true">${q.emoji}</span> ` : ''}${esc(T.text(q, 'q', lang))}</p>
      <div class="gp-flagq__choices cz-trivia-choices--${r.choices.length === 3 ? 3 : r.choices.length === 2 ? 2 : 4}">
        ${choices}
      </div>
      ${after}
    </div>`;
}

function readCard() {
  const r = state.trivia.round;
  const item = r.list[r.index];
  const q = item.question;
  const lang = T.cardLang(q, r.lang);
  const parts = r.answered
    ? [T.feedbackLine(q, item.right, lang, r.setup.level, item.again), T.text(q, 'why', lang)]
    : [T.text(q, 'q', lang), ...r.choices.map((c) => T.pick(c, lang))];
  speech.speak(parts, { lang, force: true });
}

/** A tap on a choice. `i` is the tile's position on screen. */
export function answerTrivia(i) {
  const r = state.trivia.round;
  if (!r || r.answered || r.index >= r.list.length) return;
  const choice = r.choices[Number(i)];
  if (!choice) return;
  const item = r.list[r.index];
  const q = item.question;
  const { right } = T.judge(q, choice.index);

  r.answered = true;
  r.picked = Number(i);
  item.right = right;
  if (!item.again) { if (right) r.right += 1; else r.wrong += 1; }
  r.streak = right ? r.streak + 1 : 0;
  if (!item.again) r.learned.push({ id: q.id, category: item.category, missed: !right });

  /* Saved now, not at the end: a closed tab must not lose what was learned. */
  const m = memory();
  T.record(m, q.id, right);
  if (right) m.stars[item.category] = (m.stars[item.category] || 0) + 1;
  saveMemory(m);

  if (!right) react('oops', 1800);
  else if (r.streak % 3 === 0) react('wink', 1400);
  else react('happy', 2300);

  paintCard();
  tally();
  focusNext();
  if (r.setup.level === 'easy' && state.settings.readAloud) readCard();
}

export function nextTrivia() {
  const r = state.trivia.round;
  if (!r || !r.answered) return;
  speech.cancel();
  r.index += 1;
  drawTriviaQuestion();
}

/** The language pill: the same card, the other column of the data. */
function flipLanguage() {
  const r = state.trivia.round;
  if (!r) return;
  r.lang = otherLang(r.lang);
  seedSetup().lang = r.lang;
  const m = memory();
  m.lang = r.lang;
  saveMemory(m);
  speech.cancel();
  paintCard();
  const pill = $('#gp-trivia-body [data-action="trivia-lang"]');
  if (pill) pill.focus();
}

/* ------------------------------------------------------------------ */
/* Results                                                             */
/* ------------------------------------------------------------------ */

function drawTriviaResults() {
  const r = state.trivia.round;
  const lang = r.lang;
  const fresh = r.list.slice(0, r.freshTotal);
  const total = r.freshTotal;
  const perfect = total > 0 && r.right === total;
  const m = memory();
  if (!r.saved) {
    r.saved = true;
    m.last = { day: T.today(), ids: fresh.map((x) => x.question.id) };
    saveMemory(m);
    if (perfect) react('wow', 2600);
  }

  const stars = T.starsFor(r);
  const touched = [...new Set(fresh.map((x) => x.category))].slice(0, 3);
  const ranks = touched.map((id) => {
    const c = catOf(id);
    const rk = T.rank(m.stars[id] || 0);
    const where = rk.next
      ? T.ui('toNext', lang, { n: rk.next.need, rank: lang === 'es' ? rk.next.es : rk.next.name })
      : T.ui('top', lang);
    return `<li><span aria-hidden="true">${c.emoji}</span> ${esc(catName(c, lang))}:
      <strong>${esc(lang === 'es' ? rk.es : rk.name)}</strong>, ${esc(where)}.</li>`;
  }).join('');

  /* The ones missed come first: they are the facts most worth a second read. */
  const learned = [...fresh.filter((x) => x.right === false), ...fresh.filter((x) => x.right !== false)];

  $('#gp-trivia-body').innerHTML = `
    <div class="gp-flagdone cz-trivia-done${perfect ? ' is-perfect' : ''}" lang="${lang}">
      ${perfect ? '<div class="gp-confetti" aria-hidden="true">' +
        Array.from({ length: 14 }, (_, i) => `<span data-style="--i:${i}"></span>`).join('') + '</div>' : ''}
      <h2 class="gp-flagdone__head">${esc(T.ui(perfect ? 'perfect' : 'done', lang))}</h2>
      <p class="gp-flagdone__score">${T.ui('score', lang, {
        r: `<strong>${r.right}</strong>`, w: `<strong>${r.wrong}</strong>`, t: total })}</p>
      <p class="cz-trivia-stars"><span aria-hidden="true">⭐</span>
        ${esc(stars === 1 ? T.ui('star', lang) : T.ui('stars', lang, { n: stars }))}</p>
      <ul class="cz-trivia-ranks">${ranks}</ul>

      <section class="cz-trivia-learnedbox">
        <div class="cz-trivia-last__head">
          <h3 class="cz-trivia-last__title">${esc(T.ui('learned', lang))}</h3>
          ${speakButton('learned', T.ui('say', lang))}
        </div>
        <ul class="cz-trivia-learned">
          ${learned.map((x) => {
            const l = T.cardLang(x.question, lang);
            return `<li lang="${l}" class="${x.right === false ? 'is-missed' : ''}">
              <span aria-hidden="true">${catOf(x.category).emoji}</span>
              ${esc(T.text(x.question, 'why', l))}</li>`;
          }).join('')}
        </ul>
      </section>

      <div class="gp-flagdone__again">
        <button type="button" class="gp-btn gp-btn--primary" data-action="trivia-again">${esc(T.ui('againBtn', lang))}</button>
        <a class="gp-btn gp-btn--ghost" href="#/trivia">${esc(T.ui('change', lang))}</a>
        <a class="gp-btn gp-btn--quiet" href="#/home">${esc(T.ui('back', lang))}</a>
      </div>
    </div>`;
  paint();
  tally();
  showScreen('triviagame');
}

/* ------------------------------------------------------------------ */
/* The Fact Book                                                       */
/* ------------------------------------------------------------------ */

export async function renderTriviaLearn() {
  if (!(await ensureManifest())) return;
  const setup = seedSetup();
  if (!state.trivia.book) state.trivia.book = { level: setup.level, category: 'mixed', lang: setup.lang };
  await drawBook();
}

async function drawBook() {
  const book = state.trivia.book;
  const manifest = state.trivia.manifest;
  const ids = book.category === 'mixed' ? manifest.categories.map((c) => c.id) : [book.category];
  let pool;
  try { pool = await ensureData(ids); }
  catch (err) { console.error(err); showError('The Fact Book could not be loaded.'); return; }
  /* The child may have tapped another pill, or left, while that loaded. */
  if (state.trivia.book !== book || !(location.hash || '').startsWith('#/trivia/learn')) return;

  const m = memory();
  const radio = (on) => `role="radio" aria-checked="${on}" tabindex="${on ? 0 : -1}"`;
  const levelPills = manifest.levels.map((l) => {
    const on = book.level === l.id;
    return `<button type="button" class="gp-pill${on ? ' is-selected' : ''}" ${radio(on)}
      data-action="trivia-learn-level" data-level="${l.id}">${esc(l.name)} <small>${esc(l.ages)}</small></button>`;
  }).join('');
  const catPill = (id, label) => {
    const on = book.category === id;
    return `<button type="button" class="gp-pill${on ? ' is-selected' : ''}" ${radio(on)}
      data-action="trivia-learn-cat" data-cat="${id}">${label}</button>`;
  };
  const catPills = [
    catPill('mixed', '<span aria-hidden="true">🎲</span> All'),
    ...manifest.categories.map((c) => catPill(c.id, `<span aria-hidden="true">${c.emoji}</span> ${esc(c.name)}`))
  ].join('');

  const items = ids.flatMap((id) => T.eligible(pool[id], { level: book.level, lang: book.lang })
    .map((q) => ({ q, category: id })));
  const got = items.filter((x) => m.seen[x.q.id]).length;

  $('#gp-trivia-learn').innerHTML = `
    <a class="gp-btn gp-btn--ghost gp-backlink" href="#/trivia">&larr; Back to the game</a>
    <h1 class="gp-page-title" id="trivialearn-title">The Fact Book</h1>
    <p class="gp-page-lede">Every fun fact in Curio Trivia. The ones you have answered are lit.</p>

    <div class="cz-trivia-booktools">
      <button type="button" class="gp-btn gp-btn--ghost cz-trivia-lang" data-action="trivia-learn-lang"
        lang="${otherLang(book.lang)}">${esc(T.ui('langPill', book.lang))}</button>
      <div class="gp-row gp-row--wrap" id="gp-trivia-book-levels" role="radiogroup" aria-label="Level">${levelPills}</div>
      <div class="gp-row gp-row--wrap cz-trivia-pills" id="gp-trivia-book-cats" role="radiogroup" aria-label="Topic">${catPills}</div>
    </div>

    <p class="gp-muted" id="gp-trivia-book-count">You have collected <strong>${got}</strong> of
      ${items.length} facts ${book.category === 'mixed' ? 'at this level' : 'here'}.</p>

    <ul class="cz-trivia-book">
      ${items.map(({ q, category }) => {
        const lang = T.cardLang(q, book.lang);
        const on = Boolean(m.seen[q.id]);
        return `<li class="gp-card cz-trivia-book__item${on ? ' is-got' : ''}" lang="${lang}">
          <span class="cz-trivia-book__emoji" aria-hidden="true">${catOf(category).emoji}</span>
          <span class="cz-trivia-book__why">${esc(T.text(q, 'why', lang))}</span>
          ${on ? '<span class="cz-trivia-book__star" role="img" aria-label="Collected">⭐</span>' : ''}
        </li>`;
      }).join('')}
    </ul>`;
  paint();
  if (!document.getElementById('screen-trivialearn').classList.contains('is-active')) showScreen('trivialearn');
}

/* ------------------------------------------------------------------ */
/* Buttons and keys                                                    */
/* ------------------------------------------------------------------ */

function readList(which) {
  let lines = [];
  let lang = 'en';
  if (which === 'learned' && state.trivia.round) {
    const r = state.trivia.round;
    lang = r.lang;
    const fresh = r.list.slice(0, r.freshTotal);
    lines = [...fresh.filter((x) => x.right === false), ...fresh.filter((x) => x.right !== false)]
      .map((x) => T.text(x.question, 'why', lang));
  } else if (which === 'last') {
    lang = seedSetup().lang;
    lines = lastLearned(memory()).map(({ q }) => T.text(q, 'why', lang));
  }
  speech.speak(lines, { lang, force: true });
}

export function triviaAction(name, el) {
  switch (name) {
    case 'trivia-start':
    case 'trivia-again':
      startTriviaRound();
      break;
    case 'trivia-next':
      nextTrivia();
      break;
    case 'trivia-lang':
      flipLanguage();
      break;
    case 'trivia-say':
      if (el.dataset.say === 'card' && state.trivia.round) readCard();
      else readList(el.dataset.say);
      break;
    case 'trivia-learn-lang':
      state.trivia.book = { ...state.trivia.book, lang: otherLang(state.trivia.book.lang) };
      drawBook();
      break;
    case 'trivia-learn-level':
      state.trivia.book = { ...state.trivia.book, level: el.dataset.level };
      drawBook();
      break;
    case 'trivia-learn-cat':
      state.trivia.book = { ...state.trivia.book, category: el.dataset.cat };
      drawBook();
      break;
    default:
      break;
  }
}

/** Number keys answer at Medium and Hard. Returns true when it used the key. */
export function triviaKey(ev) {
  const screen = document.getElementById('screen-triviagame');
  const r = state.trivia.round;
  if (!screen || !screen.classList.contains('is-active') || !r || r.answered) return false;
  if (r.setup.level === 'easy' || ev.metaKey || ev.ctrlKey || ev.altKey) return false;
  if (!/^[1-4]$/.test(ev.key) || /^(INPUT|TEXTAREA)$/.test(ev.target.tagName)) return false;
  if (Number(ev.key) > r.choices.length) return false;
  ev.preventDefault();
  answerTrivia(Number(ev.key) - 1);
  return true;
}
