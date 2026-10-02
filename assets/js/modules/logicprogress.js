/**
 * logicprogress.js — what the Logic Games room remembers about a child.
 *
 * One object under settings.logic, in the same localStorage record as the rest
 * of the site. Nothing leaves the device. Everything here is pure: a record
 * goes in, a new one comes out, nothing is changed in place. The rules are
 * the site's (see chessprogress.js for the reasons):
 *
 *   - Stars only go up. A puzzle keeps the best result ever.
 *   - Days played, never a streak. The hub says "3 of the last 7 days" and
 *     never mentions a day missed.
 *
 * Puzzle ids are a game and the puzzle's own id: "code:e1-07".
 */

export const UNLOCK_AT = 20;      // solves in a chapter that open the next one
export const AHEAD = 3;           // puzzles open past the ones solved
const DAYS_KEPT = 14;

const blank = () => ({ v: 1, lang: 'en', level: {}, stars: {}, daily: {}, days: [] });

const isObj = (x) => x && typeof x === 'object' && !Array.isArray(x);
const LEVELS = ['easy', 'medium', 'hard'];
const ISO = /^\d{4}-\d{2}-\d{2}$/;

/** A usable record from whatever was saved, keeping everything still valid. */
export function normalise(raw) {
  const out = blank();
  if (!isObj(raw)) return out;
  if (raw.lang === 'es' || raw.lang === 'en') out.lang = raw.lang;
  if (isObj(raw.level)) {
    for (const [g, l] of Object.entries(raw.level)) if (LEVELS.includes(l)) out.level[g] = l;
  }
  if (isObj(raw.stars)) {
    for (const [k, n] of Object.entries(raw.stars)) {
      if (/^[a-z]+:[\w-]+$/.test(k) && Number.isInteger(n) && n >= 1 && n <= 3) out.stars[k] = n;
    }
  }
  if (isObj(raw.daily)) {
    for (const [day, games] of Object.entries(raw.daily)) {
      if (!ISO.test(day) || !isObj(games)) continue;
      const keep = {};
      for (const [k, n] of Object.entries(games)) if (Number.isInteger(n) && n >= 1 && n <= 3) keep[k] = n;
      if (Object.keys(keep).length) out.daily[day] = keep;
    }
  }
  if (Array.isArray(raw.days)) out.days = [...new Set(raw.days.filter((d) => ISO.test(d)))].sort().slice(-DAYS_KEPT);
  return out;
}

const key = (game, id) => `${game}:${id}`;

export const starsOf = (rec, game, id) => rec.stars[key(game, id)] || 0;

/** Keep the better of the old and new star counts. */
export function setStars(rec, game, id, n) {
  const k = key(game, id);
  const best = Math.max(rec.stars[k] || 0, Math.min(3, Math.max(1, n | 0)));
  if (best === rec.stars[k]) return rec;
  return { ...rec, stars: { ...rec.stars, [k]: best } };
}

/** How many of `ids` are solved, and how many stars they hold. */
export function tally(rec, game, ids) {
  let solved = 0;
  let stars = 0;
  for (const id of ids) {
    const n = starsOf(rec, game, id);
    if (n) { solved += 1; stars += n; }
  }
  return { solved, stars };
}

/** Every star in one game, or in the whole room. */
export function totalStars(rec, game = null) {
  let n = Object.entries(rec.stars)
    .filter(([k]) => !game || k.startsWith(`${game}:`))
    .reduce((sum, [, v]) => sum + v, 0);
  for (const games of Object.values(rec.daily)) {
    for (const [k, v] of Object.entries(games)) if (!game || k.startsWith(`${game}:`)) n += v;
  }
  return n;
}

/**
 * Is chapter `index` open? The first always is. Any other opens once the one
 * before has UNLOCK_AT solves, or as soon as anything in it is solved (so a
 * chapter never closes again).
 */
export function chapterOpen(rec, game, chapterIds, index) {
  if (index <= 0) return true;
  if (tally(rec, game, chapterIds[index]).solved > 0) return true;
  return tally(rec, game, chapterIds[index - 1]).solved >= Math.min(UNLOCK_AT, chapterIds[index - 1].length);
}

/** Solves still needed in the chapter before to open chapter `index`. */
export function needToOpen(rec, game, chapterIds, index) {
  if (chapterOpen(rec, game, chapterIds, index)) return 0;
  const prev = chapterIds[index - 1];
  return Math.min(UNLOCK_AT, prev.length) - tally(rec, game, prev).solved;
}

/** Is puzzle `index` of a chapter open? Solved ones, and AHEAD more. */
export function puzzleOpen(rec, game, ids, index) {
  if (starsOf(rec, game, ids[index])) return true;
  return index < tally(rec, game, ids).solved + AHEAD;
}

/** Note that the child played today. Keeps the last two weeks. */
export function markDay(rec, iso) {
  if (!ISO.test(iso) || rec.days.includes(iso)) return rec;
  return { ...rec, days: [...rec.days, iso].sort().slice(-DAYS_KEPT) };
}

/** Days played in the 7 days ending on `iso`. */
export function daysThisWeek(rec, iso) {
  const end = new Date(`${iso}T12:00:00`);
  return rec.days.filter((d) => {
    const diff = Math.round((end - new Date(`${d}T12:00:00`)) / 86400000);
    return diff >= 0 && diff < 7;
  }).length;
}

export const dailyKey = (game, level) => `${game}:${level}`;

export const dailyStars = (rec, game, level, iso) => (rec.daily[iso] || {})[dailyKey(game, level)] || 0;

export function setDaily(rec, game, level, iso, n) {
  const k = dailyKey(game, level);
  const day = rec.daily[iso] || {};
  const best = Math.max(day[k] || 0, Math.min(3, Math.max(1, n | 0)));
  if (best === day[k]) return rec;
  /* Only the last few weeks of daily results are worth keeping. */
  const daily = { ...rec.daily, [iso]: { ...day, [k]: best } };
  const keepFrom = Object.keys(daily).sort().slice(-60);
  return { ...rec, daily: Object.fromEntries(keepFrom.map((d) => [d, daily[d]])) };
}

export const levelOf = (rec, game) => rec.level[game] || 'easy';

export function setLevel(rec, game, level) {
  if (!LEVELS.includes(level) || rec.level[game] === level) return rec;
  return { ...rec, level: { ...rec.level, [game]: level } };
}

export function setLang(rec, lang) {
  if ((lang !== 'en' && lang !== 'es') || rec.lang === lang) return rec;
  return { ...rec, lang };
}

export default {
  UNLOCK_AT, AHEAD, normalise, starsOf, setStars, tally, totalStars, chapterOpen, needToOpen,
  puzzleOpen, markDay, daysThisWeek, dailyKey, dailyStars, setDaily, levelOf, setLevel, setLang
};
