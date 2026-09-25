/**
 * discover.js — Discovered or Invented?, the decisions.
 *
 * Which things a round asks about, in which order, what a tap means and what
 * the game remembers. Pure, so the tests run it under node;
 * screens/discover.js only draws.
 *
 * There are only two answers, so the order matters more than it looks. Pure
 * chance puts the same answer four or more times running in almost half of
 * all rounds of ten, and a child who sees that stops thinking and starts
 * guessing "it is always Discovered". A round never asks more than MAX_RUN of one answer in a row.
 * The same idea as modules/slots.js, applied to the question order instead of
 * the button order, because the buttons here never move.
 */

import { shuffle } from './shuffle.js';

export const ANSWERS = ['discovered', 'invented'];
export const COUNTS = [10, 20, 30];
export const DEFAULT_COUNT = 10;
export const MAX_RUN = 3;
/* Below the size of the bank, so a child who plays every day still meets
   things they have not seen for a while rather than the same ten. */
export const RECENT_CAP = 70;

const FILE = 'data/fun/discover.json';
let cache = null;

export async function loadDiscover() {
  if (cache) return cache;
  const res = await fetch(FILE, { cache: 'no-cache' });
  if (!res.ok) throw new Error('Could not load Discovered or Invented');
  cache = await res.json();
  return cache;
}

/* ------------------------------------------------------------------ */
/* Building a round                                                    */
/* ------------------------------------------------------------------ */

/**
 * Reorder so no answer comes more than `maxRun` times in a row, where the
 * list allows it. Nothing is lost or added, and each answer's items keep
 * their own order.
 *
 * Swapping a long run with a later item fails near the end, when the other
 * answer has all been used up. So the order is dealt instead, one at a time,
 * and a pick is only allowed if the rest can still be dealt without a long
 * run: with `x` of one answer and `y` of the other left, the other needs
 * y <= maxRun * (x + 1), and this one has only (maxRun - run) places left
 * before one of the others must break it up.
 */
export function capRuns(list, maxRun = MAX_RUN, random = Math.random) {
  const queues = new Map();
  list.forEach((x) => {
    if (!queues.has(x.answer)) queues.set(x.answer, []);
    queues.get(x.answer).push(x);
  });
  const kinds = [...queues.keys()];
  if (kinds.length < 2) return list.slice();

  const out = [];
  let last = null;
  let run = 0;
  const left = (k) => queues.get(k).length;
  const safe = (k) => {
    const o = kinds.find((x) => x !== k);
    const x = left(k) - 1;
    const y = left(o);
    const r = k === last ? run + 1 : 1;
    return r <= maxRun && y <= maxRun * (x + 1) && x <= (maxRun - r) + maxRun * y;
  };
  while (out.length < list.length) {
    const open = kinds.filter((k) => left(k) > 0);
    let options = open.filter(safe);
    if (!options.length) options = [open.reduce((a, b) => (left(a) >= left(b) ? a : b))];
    /* Among the safe ones, the larger pile is the likelier, so the deal still
       looks like a shuffle and not a strict alternation. */
    const total = options.reduce((n, k) => n + left(k), 0);
    let roll = random() * total;
    let k = options[options.length - 1];
    for (const o of options) { roll -= left(o); if (roll < 0) { k = o; break; } }
    out.push(queues.get(k).shift());
    run = k === last ? run + 1 : 1;
    last = k;
  }
  return out;
}

/**
 * One round: `count` items, the ones not seen lately first, in a shuffled
 * order with no long run of one answer.
 */
export function buildRound(items, count = DEFAULT_COUNT, memory = {}, random = Math.random) {
  const want = Math.max(1, Math.min(Number(count) || DEFAULT_COUNT, items.length));
  const recent = (memory && memory.recent) || [];
  const seenAt = new Map(recent.map((id, i) => [id, i]));
  const fresh = shuffle(items.filter((x) => !seenAt.has(x.id)), random);
  /* When the fresh ones run out, the longest-ago seen come back first. */
  const stale = items.filter((x) => seenAt.has(x.id))
    .sort((a, b) => seenAt.get(a.id) - seenAt.get(b.id));
  const order = [...fresh, ...stale];
  const picked = balance(order.slice(0, want), order.slice(want));
  return capRuns(shuffle(picked, random), MAX_RUN, random);
}

/**
 * Make sure the round holds enough of the rarer answer for capRuns to keep
 * every run to MAX_RUN. A plain pick can come out all one answer, by chance or
 * because the unseen ones left are all "discovered", and then no reordering
 * helps: ten of the same is a run of ten.
 *
 * With `a` of one answer and `b` of the other, runs of at most MAX_RUN need
 * a <= MAX_RUN * (b + 1). While that fails, the last-chosen item of the
 * common answer (the least wanted) makes way for the next item of the rare
 * one from `spare`, which is in the same order of preference.
 */
export function balance(picked, spare, maxRun = MAX_RUN) {
  const out = picked.slice();
  const rest = spare.slice();
  for (;;) {
    const counts = {};
    out.forEach((x) => { counts[x.answer] = (counts[x.answer] || 0) + 1; });
    const [common] = Object.keys(counts).sort((p, q) => counts[q] - counts[p]);
    const rare = ANSWERS.find((k) => k !== common);
    if ((counts[common] || 0) <= maxRun * ((counts[rare] || 0) + 1)) return out;
    const j = rest.findIndex((x) => x.answer === rare);
    if (j === -1) return out;
    const drop = out.map((x) => x.answer).lastIndexOf(common);
    out.splice(drop, 1);
    out.push(rest.splice(j, 1)[0]);
  }
}

export const judge = (item, pick) => pick === item.answer;

/* ------------------------------------------------------------------ */
/* Words                                                               */
/* ------------------------------------------------------------------ */

const other = (lang) => (lang === 'es' ? 'en' : 'es');
export const pick = (obj, lang) => (obj ? (obj[lang] || obj[other(lang)] || '') : '');

export const UI = {
  /* The page around the card. */
  title: { en: 'Discovered or Invented?', es: '¿Descubierto o inventado?' },
  lede: { en: 'Was it already here, waiting to be found? Or did people make it? Stop and think before you tap.',
    es: '¿Ya estaba aquí, esperando a que alguien lo encontrara? ¿O lo hizo la gente? Piensa antes de tocar.' },
  backLink: { en: '← Back to games', es: '← Volver a los juegos' },
  changeLink: { en: '← Change the round', es: '← Cambiar la ronda' },
  rightSr: { en: 'right', es: 'bien' },
  learnSr: { en: 'to learn', es: 'por aprender' },
  /* The setup card. */
  howMany: { en: 'How many questions?', es: '¿Cuántas preguntas?' },
  langStart: { en: 'Language to start in', es: 'Idioma para empezar' },
  note: { en: '{n} things to think about. Every card has a button to switch language.',
    es: '{n} cosas para pensar. Cada tarjeta tiene un botón para cambiar de idioma.' },
  noVoice: { en: 'No Spanish voice on this device, so it will read with an English one.',
    es: 'Este dispositivo no tiene voz en español, así que leerá con una voz en inglés.' },
  start: { en: 'Start →', es: 'Empezar →' },
  /* The card. */
  discovered: { en: 'Discovered', es: 'Descubierto' },
  invented: { en: 'Invented', es: 'Inventado' },
  count: { en: 'Question {n} of {total}', es: 'Pregunta {n} de {total}' },
  langPill: { en: 'Español', es: 'English' },
  say: { en: 'Read it to me', es: 'Léemelo' },
  next: { en: 'Next question →', es: 'Siguiente →' },
  finish: { en: 'See how you did →', es: 'Ver cómo te fue →' },
  right: { en: 'Yes! {answer}.', es: '¡Sí! {answer}.' },
  wrong: { en: 'Good try. The answer is {answer}.', es: 'Buen intento. La respuesta es {answer}.' },
  perfect: { en: 'Every single one.', es: '¡Todas!' },
  done: { en: 'Round finished.', es: 'Ronda terminada.' },
  score: { en: '{r} right, {w} to learn, out of {t}.', es: '{r} bien, {w} por aprender, de {t}.' },
  remember: { en: 'Ones to remember', es: 'Para recordar' },
  allRight: { en: 'You got them all. Try a longer round!', es: 'Las acertaste todas. ¡Prueba una ronda más larga!' },
  againBtn: { en: 'Play again', es: 'Jugar otra vez' },
  change: { en: 'Change the round', es: 'Cambiar la ronda' },
  back: { en: 'Back to games', es: 'Volver a los juegos' }
};

export function ui(key, lang, vars = {}) {
  return pick(UI[key], lang).replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ''));
}

/** The line under a tapped answer. Never the word "wrong". */
export function feedbackLine(item, right, lang) {
  const answer = ui(item.answer, lang);
  return right ? ui('right', lang, { answer })
    : ui('wrong', lang, { answer: answer.toLowerCase() });
}

/* ------------------------------------------------------------------ */
/* Memory                                                              */
/* ------------------------------------------------------------------ */

/** A saved object with anything malformed replaced by a safe value. */
export function normaliseMemory(raw) {
  const m = raw && typeof raw === 'object' ? raw : {};
  const out = {
    recent: Array.isArray(m.recent)
      ? m.recent.filter((x) => typeof x === 'string').slice(-RECENT_CAP) : []
  };
  if (COUNTS.includes(Number(m.count))) out.count = Number(m.count);
  if (m.lang === 'en' || m.lang === 'es') out.lang = m.lang;
  return out;
}

/** Remember that an item was asked. Most recent last, oldest dropped. */
export function record(memory, id) {
  const m = memory;
  m.recent = (m.recent || []).filter((x) => x !== id);
  m.recent.push(id);
  if (m.recent.length > RECENT_CAP) m.recent = m.recent.slice(-RECENT_CAP);
  return m;
}

export default {
  ANSWERS, COUNTS, DEFAULT_COUNT, MAX_RUN, RECENT_CAP, loadDiscover, capRuns, balance, buildRound,
  judge, pick, UI, ui, feedbackLine, normaliseMemory, record
};
