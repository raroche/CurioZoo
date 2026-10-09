/**
 * scienceprogress.js — what the Science Lab remembers about a child.
 *
 * One object under settings.science. It has the same shape and the same rules
 * as the Logic Games record (stars only go up, days played and never a
 * streak), so every rule is logicprogress.js's own pure function, applied to
 * this room's record. This file adds the two things only the Science Lab has:
 *
 *   surprise   how many times, per game, something did not do what the child
 *              guessed. Only ever counted up, and only ever praised.
 *   ideas      a chapter's big idea is earned after IDEA_AT finished
 *              experiments in it. Worked out from the stars, never stored, so
 *              it can never disagree with them.
 *
 * Experiment ids are "<chapter>-<nn>" ("e1-07"), so a star key
 * "pond:e1-07" says its own chapter.
 */

import * as L from './logicprogress.js';

export const {
  UNLOCK_AT, AHEAD, starsOf, setStars, tally, totalStars, chapterOpen, needToOpen, puzzleOpen,
  markDay, daysThisWeek, dailyKey, dailyStars, setDaily, levelOf, setLevel, setLang,
  endlessCount, addEndless, BADGES, badgeOf
} = L;

export const IDEA_AT = 5;

const isObj = (x) => x && typeof x === 'object' && !Array.isArray(x);

/** A usable record from whatever was saved, keeping everything still valid. */
export function normalise(raw) {
  const out = { ...L.normalise(raw), surprise: {} };
  if (isObj(raw) && isObj(raw.surprise)) {
    for (const [g, n] of Object.entries(raw.surprise)) {
      if (/^[a-z]+$/.test(g) && Number.isInteger(n) && n > 0) out.surprise[g] = n;
    }
  }
  return out;
}

/** Surprises in one game, or in the whole room. */
export function surprises(rec, game = null) {
  const s = rec.surprise || {};
  if (game) return s[game] || 0;
  return Object.values(s).reduce((a, b) => a + b, 0);
}

/** n more surprises in a game. */
export function addSurprise(rec, game, n = 1) {
  if (!(n > 0)) return rec;
  return { ...rec, surprise: { ...(rec.surprise || {}), [game]: surprises(rec, game) + n } };
}

/** Finished experiments in one chapter of a game, from the star keys. */
export function solvedIn(rec, game, chapterId) {
  const pre = `${game}:${chapterId}-`;
  return Object.keys(rec.stars).filter((k) => k.startsWith(pre)).length;
}

/** Has the child earned this chapter's big idea? */
export const ideaEarned = (rec, game, chapterId) => solvedIn(rec, game, chapterId) >= IDEA_AT;

/** How many of a list of { game, ch } ideas are earned. */
export const ideasEarned = (rec, ideas) => ideas.filter((i) => ideaEarned(rec, i.game, i.ch)).length;

export default {
  ...L, normalise, IDEA_AT, surprises, addSurprise, solvedIn, ideaEarned, ideasEarned
};
