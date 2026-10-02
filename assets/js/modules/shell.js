/**
 * shell.js — the things every screen needs.
 *
 * Shared application state and the handful of DOM helpers that go with it.
 * Rooms import from here; nothing here imports a room, which is what keeps
 * the graph acyclic and lets each room load on its own.
 */

import * as data from './data.js';
import * as storage from './storage.js';
import { icon } from './icons.js';
import { setMood } from './mascot.js';
import { applyStyles } from './style.js';
import * as speech from './speech.js';

/* ------------------------------------------------------------------ */
/* State                                                               */
/* ------------------------------------------------------------------ */

export const state = {
  settings: storage.getSettings(),
  manifest: null,
  session: null,
  /** what the current session was built from, so "another set" can repeat it */
  lastRun: null,
  missingTypes: [],
  answered: false,
  audioUnlocked: false,
  /** Math Lab: the topic being worked through and where we are in it. */
  /* The flag game. `setup` is what the child picked, `round` is the run. */
  flags: {
    data: null,
    setup: { count: 10, mode: 'random', continents: [], scope: 'countries' },
    round: null
  },
  /* Browsing mode, shared by the flag, outline and capital games. */
  learn: { game: null, order: 'alpha', index: 0, list: null },
  /* Name the element. `set` is which elements, `ask` is which of the four
     kinds of question. */
  elements: {
    data: null,
    setup: { set: 'everyday', ask: 'use', count: 10 },
    round: null
  },
  /* The capital game. Same shape as the others; `pick` is four choices or typed. */
  /* Guess the angle. `ask` is which of the six kinds of question, `set` is how
     close the wrong answers sit. */
  angles: {
    setup: { ask: 'mix', set: 'steps', count: 10 },
    round: null,
    /* The workshop's three demonstrations remember where the child left them,
       so scrolling away and back does not reset the lesson. */
    demo: { deg: 45, swap: false, hour: 4 }
  },

  capitals: {
    data: null,
    setup: { count: 10, mode: 'random', continents: [], pick: 'choice' },
    round: null
  },
  /* The shape game. `pick` is the answering modality: four choices, or typed. */
  shapes: {
    data: null,
    setup: { count: 10, mode: 'random', continents: [], pick: 'choice' },
    round: null
  },
  /* Curio Trivia. `data` caches each category's questions, `setup` is seeded
     from settings.trivia on the first visit, `book` is the Fact Book's view. */
  trivia: { manifest: null, data: new Map(), setup: null, round: null, book: null },
  /* Discovered or Invented. `setup` is seeded from settings.discover. */
  discover: { data: null, setup: null, round: null },
  /* Math Brain Teasers. `manifest` names the levels; each level's teasers are
     cached by modules/teasers.js. */
  teasers: { manifest: null, setup: null, round: null, starting: false },
  /* Chess Club. `board` and `game` are the live board and the rules object
     for whatever screen is showing; both are torn down on the way out, since
     a board left behind keeps its pointer listeners. */
  chess: { board: null, game: null, level: null, lesson: null, run: null },
  math: { data: null, topic: null, index: 0, done: {}, collected: new Set(), built: new Set(), painted: {}, settled: false, hanoi: null, builtTotal: 0, crossed: new Set(), shift: 0, nim: null, doors: null }
};

/* Runtime styles cannot ride in a style attribute: the site's CSP drops those.
   See modules/style.js. Call this after inserting any generated markup. */
export const paint = () => applyStyles(document.body);

export const $ = (sel) => document.querySelector(sel);
export const $$ = (sel) => Array.from(document.querySelectorAll(sel));

/* ------------------------------------------------------------------ */
/* Icons: index.html marks slots with data-icon, filled in once here    */
/* ------------------------------------------------------------------ */

/**
 * Nudge the mascot in the top bar.
 *
 * It lives here rather than in each screen because the top bar is chrome: a
 * screen should be able to say "that was right" without knowing where the
 * mascot is or whether there is one. If the top bar ever loses it, this
 * quietly does nothing.
 */
export const react = (mood, ms = 1800) => setMood($('.gp-brand__mark'), mood, ms);

export function hydrateIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach((el) => {
    if (el.dataset.iconDone === '1') return;
    el.innerHTML = icon(el.dataset.icon);
    el.dataset.iconDone = '1';
  });
}

/* ------------------------------------------------------------------ */
/* Screens                                                             */
/* ------------------------------------------------------------------ */

/**
 * The one back control, drawn into whichever screen is showing.
 *
 * It says where it goes rather than being a bare arrow, and it sits in the page
 * above the title instead of in the top bar, where it was a mystery arrow
 * beside the logo.
 */
let backOf = () => null;

/** Who decides where back goes. The app hands in the room registry's rule;
    this module cannot import it, because modules know nothing of rooms. */
export function setBackResolver(fn) { backOf = fn; }

function paintBack() {
  $$('.gp-backslot').forEach((slot) => { slot.innerHTML = ''; });
  const target = backOf();
  if (!target) return;
  const slot = document.querySelector('.gp-screen.is-active .gp-backslot');
  if (!slot) return;
  slot.innerHTML = target.href
    ? `<a class="gp-btn gp-btn--ghost gp-backlink" href="${target.href}">`
      + `&larr; ${target.label}</a>`
    : '<button type="button" class="gp-btn gp-btn--ghost gp-backlink"'
      + ` data-action="${target.action}">&larr; ${target.label}</button>`;
}

/**
 * Show one screen and hide the rest.
 *
 * A name with no screen behind it used to hide everything and show nothing:
 * the loop turned each screen off and never found one to turn on. That shipped
 * the capital game as a blank page — the markup was in the DOM and the round
 * had been built, so nothing threw and nothing logged. It only looked broken
 * to a person. Now it says so.
 *
 * The screens are whatever is on the page: home and error from index.html,
 * and each room's own, added when the room is first opened.
 */
export function showScreen(name) {
  const target = document.getElementById(`screen-${name}`);
  if (!target || !target.classList.contains('gp-screen')) {
    throw new Error(`showScreen("${name}"): there is no <section class="gp-screen" `
      + `id="screen-${name}"> on the page, so every screen would be hidden. `
      + `Is it in the room's screens.html?`);
  }
  $$('#gp-main > .gp-screen').forEach((el) => el.classList.toggle('is-active', el === target));
  /* The back control lives in the page now, not the top bar, and is drawn
     here rather than in the router. The router calls route() before the screen
     it is building becomes active, so painting there filled the slot of the
     screen the child was leaving — which is to say, nothing appeared. */
  paintBack();
  const inQuiz = name === 'quiz';
  $('#gp-score-chip').hidden = !inQuiz;
  $('#gp-streak-chip').hidden = !inQuiz;
  window.scrollTo({ top: 0, behavior: 'auto' });
  /* Move focus to the new screen's heading so a keyboard or screen-reader
     user is not left behind at the top bar. */
  const heading = document.querySelector(`#screen-${name} h1`);
  if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus({ preventScroll: true }); }
}

/* ------------------------------------------------------------------ */
/* Read aloud: the speaker button in the top bar                        */
/* ------------------------------------------------------------------ */

export function applySpeechButton() {
  const btn = $('#gp-speak-toggle');
  if (!btn) return;
  if (!speech.isSupported()) { btn.hidden = true; return; }
  const on = state.settings.readAloud;
  btn.innerHTML = icon(on ? 'speaker' : 'speakerOff');
  btn.setAttribute('aria-pressed', String(on));
  btn.setAttribute('aria-label', on ? 'Turn read aloud off' : 'Turn read aloud on');
  btn.classList.toggle('is-active', on);
  speech.setEnabled(on);
}

export function showError(message) {
  $('#gp-error-message').textContent = message;
  showScreen('error');
}
