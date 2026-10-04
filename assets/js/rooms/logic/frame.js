/**
 * rooms/logic/frame.js — what every Logic Game's screens share.
 *
 * The progress record and how it is saved, the room's language, the little
 * pieces of markup every screen has (the language pill, the read-aloud
 * button, a way back, stars) and the card that ends a solved puzzle. A game
 * draws its own board and nothing else, so the seven games feel like one room.
 */

import * as P from '../../modules/logicprogress.js';
import * as storage from '../../modules/storage.js';
import * as speech from '../../modules/speech.js';
import { icon } from '../../modules/icons.js';
import { escapeHtml as esc } from '../../modules/charts.js';
import { stars as starIcons } from '../../modules/zooart.js';
import { otherLang, ui } from '../../modules/logictext.js';
import { confetti } from '../../modules/celebrate.js';
import { state } from '../../modules/shell.js';

export { esc };

/* ------------------------------------------------------------------ */
/* The record                                                          */
/* ------------------------------------------------------------------ */

let cached = null;

/** The progress record, checked once per visit. */
export function rec() {
  if (!cached) cached = P.normalise(state.settings.logic);
  return cached;
}

/** Save a new record. Pure functions in logicprogress.js make them. */
export function save(next) {
  if (next === cached) return;
  cached = next;
  state.settings.logic = next;
  storage.setSetting('logic', next);
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
  data-action="logic-lang" lang="${otherLang(lang())}">${esc(t('langPill'))}</button>`;

/** The read-aloud button, if the device can speak. */
export function sayButton(action = 'logic-say') {
  if (!speech.isSupported()) return '';
  return `<button type="button" class="gp-btn gp-btn--ghost cz-trivia-say" data-action="${action}"
    aria-label="${esc(t('say'))}">${icon('speaker', { size: 20 })}</button>`;
}

export const tools = (extra = '') => `<div class="cz-logic-tools">${extra}${sayButton()}${langPill()}</div>`;

export const backLink = (href, label) =>
  `<a class="gp-btn gp-btn--ghost gp-backlink" href="${href}">&larr; ${esc(label)}</a>`;

/** n of 3 stars, said in words for a screen reader. */
export const stars = (n, size = 18) => starIcons(n, 3, size, t('starsGot', { n }));

/** Read text aloud in the room's language. */
export function say(parts) {
  speech.speak(parts, { lang: lang(), force: true });
}

/* ------------------------------------------------------------------ */
/* The end of a puzzle                                                 */
/* ------------------------------------------------------------------ */

/**
 * The card under a solved board: stars, the "why" and the way on.
 *
 *   got    stars this time; best is the best ever (they may differ, and the
 *          best is what is kept)
 *   why    sentences that explain the solve
 *   news   things that just happened: a chapter opened, a lock opened
 *   next   { href, label } of the next puzzle, or null
 *   back   { href, label } of the chapter
 */
export function winCard({ got, best, why = [], news = [], next = null, back, head, again = true }) {
  const perfect = got === 3;
  return `
    <div class="gp-flagdone cz-logic-win${perfect ? ' is-perfect' : ''}" role="status">
      ${confetti(perfect)}
      <h2 class="gp-flagdone__head">${esc(head || t(perfect ? 'perfect' : 'solved'))}</h2>
      <p class="cz-logic-win__stars">${stars(got, 34)}</p>
      <p class="gp-flagdone__score">${esc(t('starsGot', { n: got }))}${best > got
        ? `<br><span class="gp-muted">${esc(t('starsBest', { n: best }))}</span>` : ''}</p>
      ${news.map((n) => `<p class="cz-logic-news">${n}</p>`).join('')}
      ${why.length ? `<section class="cz-logic-why">
        <h3 class="cz-logic-why__title">${esc(t('why'))}</h3>
        <ol>${why.map((w) => `<li>${w}</li>`).join('')}</ol>
      </section>` : ''}
      <div class="gp-flagdone__again">
        ${next ? `<a class="gp-btn gp-btn--primary gp-btn--big" href="${next.href}" data-logic-next>${esc(next.label)} &rarr;</a>` : ''}
        ${again ? `<button type="button" class="gp-btn gp-btn--ghost" data-action="logic-again">↻ ${esc(t('playAgain'))}</button>` : ''}
        <a class="gp-btn gp-btn--ghost" href="${back.href}">${esc(back.label)}</a>
      </div>
    </div>`;
}

export default { rec, save, lang, t, flipLang, langPill, sayButton, tools, backLink, stars, say, winCard, esc };
