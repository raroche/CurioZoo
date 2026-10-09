/**
 * rooms/science/frame.js — what every Science Lab game's screens share.
 *
 * The progress record and how it is saved, the room's language, the little
 * pieces of markup every screen has (the language pill, the read-aloud
 * button, a way back, stars) and the card that ends an experiment. A game
 * draws its own board and nothing else, so the ten games feel like one room.
 *
 * An adapted copy of rooms/logic/frame.js: a room may not import another
 * room's files (tools/archcheck.mjs).
 */

import * as P from '../../modules/scienceprogress.js';
import * as storage from '../../modules/storage.js';
import * as speech from '../../modules/speech.js';
import { icon } from '../../modules/icons.js';
import { escapeHtml as esc } from '../../modules/charts.js';
import { stars as starIcons } from '../../modules/zooart.js';
import { otherLang, ui } from '../../modules/sciencetext.js';
import { confetti } from '../../modules/celebrate.js';
import { state } from '../../modules/shell.js';

export { esc };

/* ------------------------------------------------------------------ */
/* The record                                                          */
/* ------------------------------------------------------------------ */

let cached = null;

/** The progress record, checked once per visit. */
export function rec() {
  if (!cached) cached = P.normalise(state.settings.science);
  return cached;
}

/** Save a new record. Pure functions in scienceprogress.js make them. */
export function save(next) {
  if (next === cached) return;
  cached = next;
  state.settings.science = next;
  storage.setSetting('science', next);
}

export const lang = () => rec().lang;
export const t = (key, vars) => ui(key, lang(), vars);

/** Switch the room between English and Spanish. */
export function flipLang() {
  speech.cancel();
  save(P.setLang(rec(), otherLang(lang())));
}

/* ------------------------------------------------------------------ */
/* Small pieces of markup                                              */
/* ------------------------------------------------------------------ */

/** The pill that switches language. It is written in the language it switches to. */
export const langPill = () => `<button type="button" class="gp-btn gp-btn--ghost cz-trivia-lang"
  data-action="sci-lang" lang="${otherLang(lang())}">${esc(t('langPill'))}</button>`;

/** The read-aloud button, if the device can speak. */
export function sayButton(action = 'sci-say') {
  if (!speech.isSupported()) return '';
  return `<button type="button" class="gp-btn gp-btn--ghost cz-trivia-say" data-action="${action}"
    aria-label="${esc(t('say'))}">${icon('speaker', { size: 20 })}</button>`;
}

export const tools = (extra = '') => `<div class="cz-sci-tools">${extra}${sayButton()}${langPill()}</div>`;

export const backLink = (href, label) =>
  `<a class="gp-btn gp-btn--ghost gp-backlink" href="${href}">&larr; ${esc(label)}</a>`;

/** n of 3 stars, said in words for a screen reader. */
export const stars = (n, size = 18) => starIcons(n, 3, size, t('starsGot', { n }));

/** Read text aloud in the room's language. */
export function say(parts) {
  speech.speak(parts, { lang: lang(), force: true });
}

/** Count n surprises for a game. A game calls this the moment one happens. */
export function surprise(game, n = 1) {
  save(P.addSurprise(rec(), game, n));
}

/* ------------------------------------------------------------------ */
/* The end of an experiment                                            */
/* ------------------------------------------------------------------ */

/**
 * The card under a finished board: stars, the "why" and the way on.
 *
 *   got    stars this time; best is the best ever (they may differ, and the
 *          best is what is kept)
 *   why    sentences (HTML, already escaped) that explain what happened
 *   pic    an optional picture (SVG markup) that goes with the why
 *   news   things that just happened: a chapter opened, a notebook page
 *   next   { href, label } of the next experiment, or null
 *   back   { href, label } of the chapter
 */
export function winCard({ got, best, why = [], pic = '', news = [], next = null, back, head, again = true }) {
  const perfect = got === 3;
  return `
    <div class="gp-flagdone cz-sci-win${perfect ? ' is-perfect' : ''}" role="status">
      ${confetti(perfect)}
      <h2 class="gp-flagdone__head">${esc(head || t(perfect ? 'perfect' : 'solved'))}</h2>
      <p class="cz-sci-win__stars">${stars(got, 34)}</p>
      <p class="gp-flagdone__score">${esc(t('starsGot', { n: got }))}${best > got
        ? `<br><span class="gp-muted">${esc(t('starsBest', { n: best }))}</span>` : ''}</p>
      ${news.map((n) => `<p class="cz-sci-news">${n}</p>`).join('')}
      ${why.length ? `<section class="cz-sci-why">
        <h3 class="cz-sci-why__title">${esc(t('why'))}</h3>
        ${pic ? `<div class="cz-sci-why__pic">${pic}</div>` : ''}
        ${why.map((w) => `<p>${w}</p>`).join('')}
      </section>` : ''}
      <div class="gp-flagdone__again">
        ${next ? `<a class="gp-btn gp-btn--primary gp-btn--big" href="${next.href}" data-sci-next>${esc(next.label)} &rarr;</a>` : ''}
        ${again ? `<button type="button" class="gp-btn gp-btn--ghost" data-action="sci-again">↻ ${esc(t('playAgain'))}</button>` : ''}
        <a class="gp-btn gp-btn--ghost" href="${back.href}">${esc(back.label)}</a>
      </div>
    </div>`;
}

export default { rec, save, lang, t, flipLang, langPill, sayButton, tools, backLink, stars, say, surprise, winCard, esc };
