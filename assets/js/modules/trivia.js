/**
 * trivia.js — Curio Trivia, the decisions.
 *
 * Which questions a round gets, in which order, what a tap means, what a star
 * is and what the game remembers. Everything here is pure so the checker and
 * the tests can run it under node; screens/trivia.js only draws.
 *
 * The memory is a small spaced-retrieval scheme (a Leitner box, more or less).
 * A question never seen is the most likely pick. A miss comes back after two
 * weeks, because answering it right then is what makes the fact stick. A
 * question answered right twice is retired, but never made impossible, so a
 * small bank still fills a round. See docs/research/trivia/PLAN.md.
 */

import { shuffle } from './shuffle.js';

export const LEVEL_IDS = ['easy', 'medium', 'hard'];
export const COUNTS = [5, 10, 15];
export const defaultCount = (level) => (level === 'easy' ? 5 : 10);

/* Filled from the manifest by loadManifest(). Live bindings, so a screen that
   imported them sees the loaded values. */
export let LEVELS = [];
export let CATEGORIES = [];

const DIR = 'data/fun/trivia';
let manifestCache = null;
const fileCache = new Map();

export async function loadManifest() {
  if (manifestCache) return manifestCache;
  const res = await fetch(`${DIR}/manifest.json`, { cache: 'no-cache' });
  if (!res.ok) throw new Error('Could not load the trivia list');
  manifestCache = await res.json();
  LEVELS = manifestCache.levels;
  CATEGORIES = manifestCache.categories;
  return manifestCache;
}

/** One category's questions, fetched once. */
export async function loadCategory(id) {
  if (fileCache.has(id)) return fileCache.get(id);
  const manifest = await loadManifest();
  const cat = manifest.categories.find((c) => c.id === id);
  if (!cat) throw new Error(`No trivia category called ${id}`);
  const res = await fetch(`${DIR}/${cat.file}`, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`Could not load ${cat.file}`);
  const file = await res.json();
  fileCache.set(id, file.questions || []);
  return fileCache.get(id);
}

/** The questions a setup needs: one file, or all of them for Mixed. */
export async function loadFor(setup) {
  const manifest = await loadManifest();
  const ids = setup.category === 'mixed'
    ? manifest.categories.map((c) => c.id) : [setup.category];
  const lists = await Promise.all(ids.map(loadCategory));
  const pool = {};
  ids.forEach((id, i) => { pool[id] = lists[i]; });
  return pool;
}

/* ------------------------------------------------------------------ */
/* Choosing questions                                                  */
/* ------------------------------------------------------------------ */

export function eligible(questions, { level, lang }) {
  return (questions || []).filter((q) => q.level === level
    && (!q.lang || q.lang === 'both' || q.lang === lang));
}

export const today = (now = Date.now()) => Math.floor(now / 86400000);

/**
 * How likely a question is to be picked, from what happened last time.
 * @param {[number, number, number]|undefined} entry [rightCount, wrongCount, day]
 */
export function weight(entry, day) {
  if (!Array.isArray(entry)) return 1;
  const [right, wrong, last] = entry;
  const ago = day - (Number(last) || 0);
  if (right >= 2) return 0.02;
  if (wrong > 0) return ago >= 14 ? 0.6 : 0.15;
  if (right === 1) return ago >= 60 ? 0.1 : 0.02;
  return 1;
}

function weightedTake(list, memory, day, random) {
  const seen = (memory && memory.seen) || {};
  const ws = list.map((q) => weight(seen[q.id], day));
  const sum = ws.reduce((a, b) => a + b, 0);
  let r = random() * sum;
  for (let i = 0; i < list.length; i += 1) {
    r -= ws[i];
    if (r < 0) return list.splice(i, 1)[0];
  }
  return list.pop();
}

/**
 * Build one round.
 *
 * @param {Object<string, object[]>} pool  category id -> its questions
 * @param {{level, category, count, lang}} setup
 * @param {{seen?: object, recent?: string[]}} memory
 * @returns {{question: object, category: string}[]}
 */
export function buildRound(pool, setup, memory = {}, random = Math.random, day = today()) {
  const want = Number(setup.count) || 10;
  const recent = new Set((memory && memory.recent) || []);
  const cats = setup.category === 'mixed'
    ? Object.keys(pool) : [setup.category].filter((c) => pool[c]);

  /* Two buckets per category: fresh, and shown in the last few rounds. A
     recent question is only used once every fresh one is gone, so a small bank
     still fills a round instead of coming up short. */
  const buckets = {};
  let total = 0;
  for (const c of cats) {
    const all = eligible(pool[c], setup);
    buckets[c] = {
      fresh: all.filter((q) => !recent.has(q.id)),
      stale: all.filter((q) => recent.has(q.id))
    };
    total += all.length;
  }
  const count = Math.min(want, total);
  const left = (c) => buckets[c].fresh.length + buckets[c].stale.length;
  const take = (c) => {
    const b = buckets[c];
    const from = b.fresh.length ? b.fresh : b.stale;
    return { question: weightedTake(from, memory, day, random), category: c };
  };

  const out = [];
  if (setup.category !== 'mixed') {
    while (out.length < count) out.push(take(cats[0]));
    return out;
  }

  /* Mixed: every category once, in a shuffled order, before any comes round
     again, and never the same one twice in a row while there is a choice. */
  while (out.length < count) {
    const order = shuffle(cats.filter((c) => left(c) > 0), random);
    if (!order.length) break;
    const prev = out.length ? out[out.length - 1].category : null;
    if (order.length > 1 && order[0] === prev) {
      [order[0], order[1]] = [order[1], order[0]];
    }
    for (const c of order) {
      if (out.length >= count) break;
      out.push(take(c));
    }
  }
  return out;
}

/**
 * The choices to show, each remembering its index in the data. At Easy there
 * are exactly three: a writer's fourth option is dropped, never the answer.
 */
export function makeChoices(question, level) {
  let list = question.choices.map((c, index) => ({ ...c, index }));
  if (level === 'easy' && list.length > 3) {
    const answer = list[question.answer];
    const rest = list.filter((c) => c.index !== question.answer).slice(0, 2);
    list = [answer, ...rest].sort((a, b) => a.index - b.index);
  }
  return list;
}

export function judge(question, pickedIndex) {
  return { right: Number(pickedIndex) === question.answer, answerIndex: question.answer };
}

/** The language a card is read in: a one-language item keeps its own. */
export function cardLang(question, wanted) {
  if (question && (question.lang === 'en' || question.lang === 'es')) return question.lang;
  return wanted === 'es' ? 'es' : 'en';
}

const other = (lang) => (lang === 'es' ? 'en' : 'es');
export const pick = (obj, lang) => (obj ? (obj[lang] || obj[other(lang)] || '') : '');

/**
 * Text for a question in a language. `field` is 'q', 'why' or a choice index.
 * Falls back to the other language rather than ever drawing an empty stem.
 */
export function text(question, field, lang) {
  if (typeof field === 'number') return pick(question.choices[field], lang);
  return pick(question[field], lang);
}

/* ------------------------------------------------------------------ */
/* Words on the card                                                   */
/* ------------------------------------------------------------------ */

export const UI = {
  count: { en: 'Question {n} of {total}', es: 'Pregunta {n} de {total}' },
  again: { en: 'One more look', es: 'Otra mirada' },
  againCount: { en: 'One more look {n} of {total}', es: 'Otra mirada {n} de {total}' },
  langPill: { en: 'Español', es: 'English' },
  say: { en: 'Read it to me', es: 'Léemelo' },
  next: { en: 'Next question →', es: 'Siguiente →' },
  finish: { en: 'See how you did →', es: 'Ver cómo te fue →' },
  perfect: { en: 'Every single one.', es: '¡Todas!' },
  done: { en: 'Round finished.', es: 'Ronda terminada.' },
  score: { en: '{r} right, {w} wrong, out of {t}.', es: '{r} bien, {w} por aprender, de {t}.' },
  stars: { en: '{n} stars earned', es: '{n} estrellas ganadas' },
  star: { en: '1 star earned', es: '1 estrella ganada' },
  learned: { en: 'What I learned', es: 'Lo que aprendí' },
  againBtn: { en: 'Play again', es: 'Jugar otra vez' },
  change: { en: 'Change the round', es: 'Cambiar la ronda' },
  back: { en: 'Home', es: 'Inicio' },
  wordGame: { en: 'This one is an English word game.', es: 'Este es un juego de palabras en español.' },
  toNext: { en: '{n} to {rank}', es: '{n} para {rank}' },
  top: { en: 'the top rank', es: 'el rango más alto' }
};

export function ui(key, lang, vars = {}) {
  return pick(UI[key], lang).replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ''));
}

/** The line under a tapped answer. Never the word "wrong". */
export function feedbackLine(question, right, lang, level, again = false) {
  const answer = text(question, question.answer, lang);
  if (right && again) return lang === 'es' ? `Esta vez sí. ${answer}.` : `Got it this time. ${answer}.`;
  if (right) return lang === 'es' ? `¡Sí! ${answer}.` : `Yes! ${answer}.`;
  const lead = {
    easy: { en: 'Good try.', es: 'Buen intento.' },
    medium: { en: 'Close.', es: 'Casi.' },
    hard: { en: 'Not this time.', es: 'Esta vez no.' }
  }[level] || { en: 'Good try.', es: 'Buen intento.' };
  return lang === 'es' ? `${lead.es} Es ${answer}.` : `${lead.en} It is ${answer}.`;
}

/* ------------------------------------------------------------------ */
/* The round and the memory                                            */
/* ------------------------------------------------------------------ */

/** The first two misses of a round, to be asked once more at the end. */
export function secondLooks(round) {
  return (round.list || [])
    .filter((x) => !x.again && x.right === false)
    .slice(0, 2)
    .map((x) => ({ question: x.question, category: x.category, again: true }));
}

/* Above the whole bank (4,800 at 100 per topic per level), so a child who has
   answered everything still has every fact lit in the Fact Book. About 40
   bytes an entry: 6,000 is well under a quarter of a megabyte. */
export const SEEN_CAP = 6000;
export const RECENT_CAP = 60;

/** A saved trivia object with anything malformed replaced by a safe value. */
export function normaliseMemory(raw) {
  const m = raw && typeof raw === 'object' ? raw : {};
  const out = {
    seen: m.seen && typeof m.seen === 'object' && !Array.isArray(m.seen) ? { ...m.seen } : {},
    recent: Array.isArray(m.recent) ? m.recent.filter((x) => typeof x === 'string').slice(-RECENT_CAP) : [],
    stars: m.stars && typeof m.stars === 'object' && !Array.isArray(m.stars) ? { ...m.stars } : {},
    last: m.last && Array.isArray(m.last.ids) ? { day: Number(m.last.day) || 0, ids: m.last.ids.slice(0, 15) } : null
  };
  if (LEVEL_IDS.includes(m.level)) out.level = m.level;
  if (COUNTS.includes(Number(m.count))) out.count = Number(m.count);
  if (m.lang === 'en' || m.lang === 'es') out.lang = m.lang;
  for (const [id, e] of Object.entries(out.seen)) {
    if (!Array.isArray(e) || e.length !== 3 || !e.every((n) => Number.isFinite(n))) delete out.seen[id];
  }
  return out;
}

/** Remember one answer. Returns the same memory object, updated. */
export function record(memory, id, right, day = today()) {
  const m = memory;
  m.seen = m.seen || {};
  m.recent = m.recent || [];
  const [r, w] = m.seen[id] || [0, 0, 0];
  /* Delete and re-add, so key order is least recently answered first and the
     cap drops the oldest. */
  delete m.seen[id];
  m.seen[id] = [r + (right ? 1 : 0), w + (right ? 0 : 1), day];
  const keys = Object.keys(m.seen);
  for (let i = 0; i < keys.length - SEEN_CAP; i += 1) delete m.seen[keys[i]];
  m.recent = m.recent.filter((x) => x !== id);
  m.recent.push(id);
  if (m.recent.length > RECENT_CAP) m.recent = m.recent.slice(-RECENT_CAP);
  return m;
}

/** One star for every right answer, a second look included. Nothing is taken away. */
export function starsFor(round) {
  return (round.list || []).filter((x) => x.right === true).length;
}

export const RANKS = [
  { at: 0, name: 'Sprout', es: 'Brote' },
  { at: 10, name: 'Explorer', es: 'Explorador' },
  { at: 25, name: 'Guide', es: 'Guía' },
  { at: 60, name: 'Expert', es: 'Experto' },
  { at: 120, name: 'Master', es: 'Maestro' }
];

export function rank(stars) {
  const n = Math.max(0, Number(stars) || 0);
  let i = 0;
  while (i + 1 < RANKS.length && n >= RANKS[i + 1].at) i += 1;
  const up = RANKS[i + 1];
  return {
    name: RANKS[i].name,
    es: RANKS[i].es,
    next: up ? { name: up.name, es: up.es, need: up.at - n } : null
  };
}

/** How many of a category's questions at a level this child has answered. */
export function seenIn(memory, category, level) {
  const prefix = `${category}-${level}-`;
  return Object.keys((memory && memory.seen) || {}).filter((id) => id.startsWith(prefix)).length;
}

/** Facts collected: answered questions, against the bank. Level optional. */
export function factsCollected(memory, manifest, level = null) {
  const levels = level ? [level] : LEVEL_IDS;
  let got = 0;
  let total = 0;
  for (const c of manifest.categories) {
    for (const l of levels) {
      total += (c.counts && c.counts[l]) || 0;
      got += seenIn(memory, c.id, l);
    }
  }
  return { got: Math.min(got, total), total };
}

/** Fold for comparisons: no case, no accents, no punctuation. */
export function fold(s) {
  return String(s == null ? '' : s).normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

export default {
  LEVEL_IDS, COUNTS, defaultCount, loadManifest, loadCategory, loadFor, eligible, weight,
  buildRound, makeChoices, judge, cardLang, text, pick, UI, ui, feedbackLine, secondLooks,
  normaliseMemory, record, starsFor, RANKS, rank, seenIn, factsCollected, fold, today
};
