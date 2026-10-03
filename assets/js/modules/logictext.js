/**
 * logictext.js — the words every Logic Game shares, in English and Spanish.
 *
 * Each game keeps its own sentences in its own *text.js file. This file holds
 * the room's: its name, the seven game cards, the levels and the buttons that
 * every puzzle has. `tools/logiccheck.mjs` fails the build if a key is in one
 * language and not the other, or if the {slots} in the two differ.
 *
 * Spanish here is written as Spanish, not translated word by word. It still
 * needs a native speaker's read before it is called finished (see PROGRESS.md).
 */

export const LANGS = ['en', 'es'];
export const otherLang = (lang) => (lang === 'es' ? 'en' : 'es');

/** Fill {slots} in a string. Unknown slots are left as they are, so a typo shows. */
export function fill(text, vars = {}) {
  return String(text).replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? String(vars[k]) : m));
}

/** Look a key up in a { en: {...}, es: {...} } table, falling back to English. */
export function lookup(table, key, lang, vars) {
  const text = (table[lang] && table[lang][key]) ?? (table.en && table.en[key]);
  return text === undefined ? key : fill(text, vars);
}

export const ROOM = {
  en: {
    roomTitle: 'Logic Games',
    roomLede: 'Puzzles that make you think in steps. Every one has an answer you can work out, never one you have to guess.',
    langPill: 'Español',
    say: 'Read aloud',
    home: 'Home',
    soon: 'Coming soon',
    play: 'Play',
    starsTotal: '{n} stars',
    daysWeek: 'Played {n} of the last 7 days',
    daysNone: 'A new week of puzzles',
    level: 'Level',
    easy: 'Easy', medium: 'Medium', hard: 'Hard',
    ages: 'ages {ages}',
    chapters: 'Chapters',
    solvedOf: '{n} of {t} solved',
    lockedChapter: 'Solve {n} more in the previous chapter to open this one.',
    open: 'Open',
    puzzleN: 'Puzzle {n}',
    puzzleOf: 'Puzzle {n} of {t}',
    backChapter: 'Back to the chapter',
    backGame: 'Back to the chapters',
    backRoom: 'Back to Logic Games',
    next: 'Next puzzle',
    again: 'Try it again',
    hint: 'Hint',
    hintMore: 'Another hint',
    check: 'Check',
    clear: 'Clear',
    undo: 'Undo',
    solved: 'Solved!',
    perfect: 'Perfect!',
    starsGot: 'You earned {n} of 3 stars',
    starsBest: 'Your best: {n} of 3 stars',
    why: 'How it works',
    daily: "Today's puzzle",
    dailyDone: 'Done for today. A new one comes tomorrow.',
    dailyFor: '{level} · {date}',
    teach: 'Learn',
    teachNote: 'A puzzle that teaches. Press Hint to see every step.',
    chapterDone: 'Chapter complete!',
    chapterOpen: 'A new chapter is open: {name}!',
    loadFail: 'The puzzles could not be loaded.',
    making: 'Making your puzzle…',
    loadingTitle: 'Getting the puzzles…',
    loadingText: 'Just a moment.',
    loadingSaving: 'This first visit also saves the games on this device, so they work without the internet.',
    collection: 'Your zoo',
    endless: 'Endless practice',
    endlessLede: 'Fresh puzzles that never run out.',
    endlessCount: '{n} solved',
    endlessNext: 'Another one',
    dailyMore: 'More puzzles like this',
    badgeNow: 'You are a {badge}',
    badgeNext: '{n} more stars to {badge}',
    badgeTop: 'The highest badge of all!',
    'badge.cub': 'Curious Cub', 'badge.finder': 'Clue Finder', 'badge.spotter': 'Pattern Spotter',
    'badge.explorer': 'Logic Explorer', 'badge.master': 'Puzzle Master', 'badge.thinker': 'Deep Thinker',
    'badge.genius': 'Zoo Genius'
  },
  es: {
    roomTitle: 'Juegos de lógica',
    roomLede: 'Acertijos que te hacen pensar paso a paso. Todos tienen una respuesta que puedes deducir, nunca una que tengas que adivinar.',
    langPill: 'English',
    say: 'Leer en voz alta',
    home: 'Inicio',
    soon: 'Muy pronto',
    play: 'Jugar',
    starsTotal: '{n} estrellas',
    daysWeek: 'Jugaste {n} de los últimos 7 días',
    daysNone: 'Una nueva semana de acertijos',
    level: 'Nivel',
    easy: 'Fácil', medium: 'Medio', hard: 'Difícil',
    ages: '{ages} años',
    chapters: 'Capítulos',
    solvedOf: '{n} de {t} resueltos',
    lockedChapter: 'Resuelve {n} más en el capítulo anterior para abrir este.',
    open: 'Abrir',
    puzzleN: 'Acertijo {n}',
    puzzleOf: 'Acertijo {n} de {t}',
    backChapter: 'Volver al capítulo',
    backGame: 'Volver a los capítulos',
    backRoom: 'Volver a Juegos de lógica',
    next: 'Siguiente acertijo',
    again: 'Inténtalo otra vez',
    hint: 'Pista',
    hintMore: 'Otra pista',
    check: 'Comprobar',
    clear: 'Borrar',
    undo: 'Deshacer',
    solved: '¡Resuelto!',
    perfect: '¡Perfecto!',
    starsGot: 'Ganaste {n} de 3 estrellas',
    starsBest: 'Tu mejor marca: {n} de 3 estrellas',
    why: 'Cómo se resuelve',
    daily: 'El acertijo de hoy',
    dailyDone: 'Listo por hoy. Mañana hay uno nuevo.',
    dailyFor: '{level} · {date}',
    teach: 'Aprende',
    teachNote: 'Un acertijo para aprender. Pulsa Pista para ver cada paso.',
    chapterDone: '¡Capítulo terminado!',
    chapterOpen: '¡Se abrió un capítulo nuevo: {name}!',
    loadFail: 'No se pudieron cargar los acertijos.',
    making: 'Preparando tu acertijo…',
    loadingTitle: 'Trayendo los acertijos…',
    loadingText: 'Un momento.',
    loadingSaving: 'En esta primera visita también guardamos los juegos en este dispositivo, para que funcionen sin internet.',
    collection: 'Tu zoológico',
    endless: 'Práctica sin fin',
    endlessLede: 'Acertijos nuevos que nunca se acaban.',
    endlessCount: '{n} resueltos',
    endlessNext: 'Otro más',
    dailyMore: 'Más acertijos como este',
    badgeNow: 'Eres {badge}',
    badgeNext: 'Te faltan {n} estrellas para {badge}',
    badgeTop: '¡La insignia más alta de todas!',
    'badge.cub': 'Cachorro curioso', 'badge.finder': 'Buscapistas', 'badge.spotter': 'Ojo de patrones',
    'badge.explorer': 'Explorador de la lógica', 'badge.master': 'Maestro de acertijos', 'badge.thinker': 'Gran pensador',
    'badge.genius': 'Genio del zoo'
  }
};

export const ui = (key, lang, vars) => lookup(ROOM, key, lang, vars);

/** The three levels, the same in every game. */
export const LEVEL_AGES = { easy: '6–8', medium: '8–10', hard: '10–13' };

/**
 * The seven games, in the order of the build plan. `live` games have a room
 * of their own; the rest show as coming soon.
 */
export const GAMES = [
  {
    id: 'code', live: true,
    name: { en: 'Crack the Code', es: 'Descifra el código' },
    blurb: {
      en: 'A safe full of animals. Read the clues and find the one code that fits them all.',
      es: 'Una caja fuerte llena de animales. Lee las pistas y encuentra el único código que encaja con todas.'
    },
    meta: { en: '840 safes · 3 levels', es: '840 cajas fuertes · 3 niveles' }
  },
  {
    id: 'truth', live: true,
    name: { en: 'Truth Island', es: 'La isla de la verdad' },
    blurb: {
      en: 'Sun animals always tell the truth. Moon animals always say the opposite. Who is who?',
      es: 'Los animales Sol siempre dicen la verdad. Los animales Luna siempre dicen lo contrario. ¿Quién es quién?'
    },
    meta: { en: '600 puzzles · 3 levels', es: '600 acertijos · 3 niveles' }
  },
  {
    id: 'rule', live: true,
    name: { en: 'Find the Rule', es: 'Descubre la regla' },
    blurb: {
      en: 'Some creatures pass the gate and some are stopped. Test, think, and find the secret rule.',
      es: 'Algunas criaturas pasan la puerta y otras no. Prueba, piensa y descubre la regla secreta.'
    },
    meta: { en: '600 puzzles · 3 levels', es: '600 acertijos · 3 niveles' }
  },
  {
    id: 'bridges', live: true,
    name: { en: 'Zoo Bridges', es: 'Puentes del zoo' },
    blurb: {
      en: 'Join the islands with bridges. Each island says how many it needs.',
      es: 'Une las islas con puentes. Cada isla dice cuántos necesita.'
    },
    meta: { en: '900 puzzles · 3 levels', es: '900 acertijos · 3 niveles' }
  },
  {
    id: 'trains', live: true,
    name: { en: 'Train Tracks', es: 'Vías del tren' },
    blurb: {
      en: 'Set the switches so every animal rides home. Then press GO and watch.',
      es: 'Mueve los desvíos para que cada animal llegue a su casa. Luego pulsa ¡VAMOS! y mira.'
    },
    meta: { en: '1,000 puzzles · 3 levels', es: '1.000 acertijos · 3 niveles' }
  },
  {
    id: 'robot', live: true,
    name: { en: 'Robot Path', es: 'El camino del robot' },
    blurb: {
      en: 'Program the zookeeper robot to feed the animals. Loops, helpers and more.',
      es: 'Programa al robot cuidador para que dé de comer a los animales. Bucles, ayudantes y más.'
    },
    meta: { en: '600 levels · 3 levels', es: '600 niveles · 3 niveles' }
  },
  {
    id: 'bug', live: true,
    name: { en: 'Fix the Bug', es: 'Arregla el error' },
    blurb: {
      en: 'This robot program almost works. Find the mistake and fix it.',
      es: 'Este programa del robot casi funciona. Encuentra el error y arréglalo.'
    },
    meta: { en: '600 puzzles · 3 levels', es: '600 acertijos · 3 niveles' }
  }
];

export const gameById = (id) => GAMES.find((g) => g.id === id) || null;

export default { LANGS, otherLang, fill, lookup, ROOM, ui, LEVEL_AGES, GAMES, gameById };
