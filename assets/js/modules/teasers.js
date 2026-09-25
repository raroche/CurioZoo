/**
 * teasers.js — Math Brain Teasers, the decisions.
 *
 * Which teasers a round gets, what a tap means, what the words on the card
 * say and what the room remembers. Pure, so the checker and the tests run it
 * under node; screens/teasers.js only draws.
 *
 * Every teaser was found somewhere (a puzzle book, a teacher's page, a
 * contest) and retold in plain words; the source is kept with it. See
 * tools/teaserscheck.mjs, which also works out the arithmetic of every
 * numeric answer rather than trusting it.
 */

import { shuffle } from './shuffle.js';

export const LEVEL_IDS = ['easy', 'medium', 'hard'];
export const COUNTS = [5, 10, 15];
export const DEFAULT_COUNT = 10;
/* Every teaser a child has met, per level, oldest first. Above the most a
   level may hold (tools/teaserscheck.mjs allows 200), so nothing seen is
   ever forgotten while the bank is that size: every unseen teaser comes
   before any repeat, and then the longest-ago seen come back first, which
   starts the next pass through the level. About 3 kB per level. */
export const SEEN_CAP = 250;

const DIR = 'data/teasers';
let manifestCache = null;
const levelCache = new Map();

export async function loadManifest() {
  if (manifestCache) return manifestCache;
  const res = await fetch(`${DIR}/manifest.json`, { cache: 'no-cache' });
  if (!res.ok) throw new Error('Could not load the brain teaser list');
  manifestCache = await res.json();
  return manifestCache;
}

/** One level's teasers, fetched once. */
export async function loadLevel(level) {
  if (levelCache.has(level)) return levelCache.get(level);
  if (!LEVEL_IDS.includes(level)) throw new Error(`No teaser level called ${level}`);
  const res = await fetch(`${DIR}/${level}.json`, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`Could not load the ${level} teasers`);
  const file = await res.json();
  levelCache.set(level, file.items || []);
  return levelCache.get(level);
}

/* ------------------------------------------------------------------ */
/* A round                                                             */
/* ------------------------------------------------------------------ */

/**
 * `count` teasers. Every one never seen comes first, in a shuffled order;
 * only when none are left do repeats come, the longest-ago seen first.
 * `memory.seen` is this level's list of seen ids, oldest first.
 */
export function buildRound(items, count = DEFAULT_COUNT, memory = {}, random = Math.random) {
  const want = Math.max(0, Math.min(Number(count) || DEFAULT_COUNT, items.length));
  const seen = (memory && memory.seen) || [];
  const seenAt = new Map(seen.map((id, i) => [id, i]));
  const fresh = shuffle(items.filter((x) => !seenAt.has(x.id)), random);
  const stale = items.filter((x) => seenAt.has(x.id))
    .sort((a, b) => seenAt.get(a.id) - seenAt.get(b.id));
  /* Not shuffled together: in the round where a level runs out, the last
     unseen teasers must still come before the first repeat. */
  const first = fresh.slice(0, want);
  return [...first, ...shuffle(stale.slice(0, want - first.length), random)];
}

/** The choices to show, shuffled, each remembering its place in the data. */
export function makeChoices(item, random = Math.random) {
  return shuffle(item.choices.map((c, index) => ({ ...c, index })), random);
}

export const judge = (item, index) => Number(index) === item.answer;

/* ------------------------------------------------------------------ */
/* Words                                                               */
/* ------------------------------------------------------------------ */

const other = (lang) => (lang === 'es' ? 'en' : 'es');
export const pick = (obj, lang) => (obj ? (obj[lang] || obj[other(lang)] || '') : '');

export const UI = {
  title: { en: 'Math Brain Teasers', es: 'Acertijos matemáticos' },
  lede: { en: 'Riddles and puzzles that make you think twice. Read slowly: the first answer that jumps out is not always right.',
    es: 'Acertijos y rompecabezas que te hacen pensar dos veces. Lee despacio: la primera respuesta que se te ocurre no siempre es la correcta.' },
  backHome: { en: '← Home', es: '← Inicio' },
  changeLink: { en: '← Change the round', es: '← Cambiar la ronda' },
  rightSr: { en: 'right', es: 'bien' },
  learnSr: { en: 'to learn', es: 'por aprender' },
  who: { en: 'How hard?', es: '¿Qué tan difícil?' },
  howMany: { en: 'How many teasers?', es: '¿Cuántos acertijos?' },
  langStart: { en: 'Language to start in', es: 'Idioma para empezar' },
  teasers: { en: '{n} teasers', es: '{n} acertijos' },
  ages: { en: 'ages {ages}', es: '{ages} años' },
  note: { en: 'Every card has a button to switch language, and a hint if you get stuck.',
    es: 'Cada tarjeta tiene un botón para cambiar de idioma y una pista por si te atoras.' },
  start: { en: 'Start →', es: 'Empezar →' },
  count: { en: 'Teaser {n} of {total}', es: 'Acertijo {n} de {total}' },
  langPill: { en: 'Español', es: 'English' },
  say: { en: 'Read it to me', es: 'Léemelo' },
  hintBtn: { en: 'Hint', es: 'Pista' },
  next: { en: 'Next teaser →', es: 'Siguiente →' },
  finish: { en: 'See how you did →', es: 'Ver cómo te fue →' },
  right: { en: 'Yes! {answer}.', es: '¡Sí! {answer}.' },
  wrong: { en: 'Good try. The answer is {answer}.', es: 'Buen intento. La respuesta es {answer}.' },
  perfect: { en: 'Every single one.', es: '¡Todos!' },
  done: { en: 'Round finished.', es: 'Ronda terminada.' },
  score: { en: '{r} right, {w} to learn, out of {t}.', es: '{r} bien, {w} por aprender, de {t}.' },
  remember: { en: 'Ones to think about again', es: 'Para pensar otra vez' },
  allRight: { en: 'You got them all. Try a harder level!', es: 'Los resolviste todos. ¡Prueba un nivel más difícil!' },
  againBtn: { en: 'Play again', es: 'Jugar otra vez' },
  change: { en: 'Change the round', es: 'Cambiar la ronda' },
  home: { en: 'Home', es: 'Inicio' }
};

export function ui(key, lang, vars = {}) {
  return pick(UI[key], lang).replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ''));
}

/** The line under a tapped answer. Never the word "wrong". */
export function feedbackLine(item, right, lang) {
  const answer = pick(item.choices[item.answer], lang);
  return ui(right ? 'right' : 'wrong', lang, { answer });
}

/* ------------------------------------------------------------------ */
/* Memory                                                              */
/* ------------------------------------------------------------------ */

const isMap = (v) => v && typeof v === 'object' && !Array.isArray(v);

/**
 * A saved object with anything malformed replaced by a safe value. The first
 * version kept only the last 80 as `recent`; that list is carried over, so a
 * child's history is not thrown away.
 */
export function normaliseMemory(raw) {
  const m = isMap(raw) ? raw : {};
  const seen = isMap(m.seen) ? m.seen : isMap(m.recent) ? m.recent : {};
  const out = { seen: {} };
  for (const level of LEVEL_IDS) {
    out.seen[level] = Array.isArray(seen[level])
      ? [...new Set(seen[level].filter((x) => typeof x === 'string'))].slice(-SEEN_CAP) : [];
  }
  if (LEVEL_IDS.includes(m.level)) out.level = m.level;
  if (COUNTS.includes(Number(m.count))) out.count = Number(m.count);
  if (m.lang === 'en' || m.lang === 'es') out.lang = m.lang;
  return out;
}

/** Remember that a teaser was asked: moved to the end, the newest place. */
export function record(memory, level, id) {
  const m = memory;
  m.seen = m.seen || {};
  const list = (m.seen[level] || []).filter((x) => x !== id);
  list.push(id);
  m.seen[level] = list.slice(-SEEN_CAP);
  return m;
}

/* ------------------------------------------------------------------ */
/* Checking an answer's arithmetic                                     */
/* ------------------------------------------------------------------ */

/**
 * Work out a `check` expression: digits, + - * / ( ) . and spaces only.
 * Returns NaN for anything else. Used by the checker and the tests, never by
 * the page, so no teaser's answer is taken on trust.
 */
export function evaluate(expr) {
  const src = String(expr || '');
  if (!/^[\d+\-*/().\s]+$/.test(src)) return NaN;
  let i = 0;
  const peek = () => src[i];
  const skip = () => { while (src[i] === ' ') i += 1; };
  const number = () => {
    skip();
    const start = i;
    while (/[\d.]/.test(src[i] || '')) i += 1;
    return start === i ? NaN : Number(src.slice(start, i));
  };
  let expression;
  const factor = () => {
    skip();
    if (peek() === '-') { i += 1; return -factor(); }
    if (peek() === '(') {
      i += 1;
      const v = expression();
      skip();
      if (peek() !== ')') return NaN;
      i += 1;
      return v;
    }
    return number();
  };
  const term = () => {
    let v = factor();
    for (;;) {
      skip();
      if (peek() === '*') { i += 1; v *= factor(); } else if (peek() === '/') { i += 1; v /= factor(); } else return v;
    }
  };
  expression = () => {
    let v = term();
    for (;;) {
      skip();
      if (peek() === '+') { i += 1; v += term(); } else if (peek() === '-') { i += 1; v -= term(); } else return v;
    }
  };
  const v = expression();
  skip();
  return i === src.length ? v : NaN;
}

export default {
  LEVEL_IDS, COUNTS, DEFAULT_COUNT, SEEN_CAP, loadManifest, loadLevel, buildRound, makeChoices,
  judge, pick, UI, ui, feedbackLine, normaliseMemory, record, evaluate
};
