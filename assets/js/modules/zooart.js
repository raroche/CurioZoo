/**
 * zooart.js — the animals and small pictures every Logic Game shares.
 *
 * The animals are emoji, not drawings. They are twelve pictures a six-year-old
 * already knows, they differ by shape before colour (so a colour-blind child
 * tells them apart as easily as anyone), and every device the site supports
 * draws them in colour. They are text, so the CSP has nothing to say about
 * them. The plan asked for twelve hand-drawn heads; this does the same job
 * with no art to maintain, and the reasons are written down in
 * docs/research/logic/PROGRESS.md.
 *
 * Spanish names carry their article, so a sentence never has to guess
 * whether it is "el" or "la".
 */

export const ANIMALS = [
  { id: 'lion', emoji: '🦁', en: 'lion', es: { n: 'león', art: 'el' } },
  { id: 'monkey', emoji: '🐒', en: 'monkey', es: { n: 'mono', art: 'el' } },
  { id: 'frog', emoji: '🐸', en: 'frog', es: { n: 'rana', art: 'la' } },
  { id: 'penguin', emoji: '🐧', en: 'penguin', es: { n: 'pingüino', art: 'el' } },
  { id: 'zebra', emoji: '🦓', en: 'zebra', es: { n: 'cebra', art: 'la' } },
  { id: 'flamingo', emoji: '🦩', en: 'flamingo', es: { n: 'flamenco', art: 'el' } },
  { id: 'owl', emoji: '🦉', en: 'owl', es: { n: 'búho', art: 'el' } },
  { id: 'turtle', emoji: '🐢', en: 'turtle', es: { n: 'tortuga', art: 'la' } },
  { id: 'elephant', emoji: '🐘', en: 'elephant', es: { n: 'elefante', art: 'el' } },
  { id: 'giraffe', emoji: '🦒', en: 'giraffe', es: { n: 'jirafa', art: 'la' } },
  { id: 'panda', emoji: '🐼', en: 'panda', es: { n: 'panda', art: 'el' } },
  { id: 'hippo', emoji: '🦛', en: 'hippo', es: { n: 'hipopótamo', art: 'el' } }
];

export const animalById = (id) => ANIMALS.find((a) => a.id === id) || null;

/** "the lion" / "el león". `cap` capitalises the first letter. */
export function theAnimal(a, lang, cap = false) {
  const text = lang === 'es' ? `${a.es.art} ${a.es.n}` : `the ${a.en}`;
  return cap ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

/** The plain name: "lion" / "león". */
export const animalName = (a, lang) => (lang === 'es' ? a.es.n : a.en);

/* ------------------------------------------------------------------ */
/* Small pictures                                                       */
/* ------------------------------------------------------------------ */

const svg = (cls, body, size = 22) => `<svg class="${cls}" viewBox="0 0 24 24" width="${size}" height="${size}"
  aria-hidden="true" focusable="false">${body}</svg>`;

/**
 * The three Crack the Code marks. Each is its own SHAPE, so the meaning never
 * rides on colour alone (WCAG 1.4.1): a filled disc with a check for home, a
 * hollow ring with a two-way arrow for wrong home, a short flat bar for not
 * here.
 */
export const MARKS = {
  h: (size) => svg('cz-mark cz-mark--h',
    '<circle cx="12" cy="12" r="10" fill="currentColor"/>'
    + '<path d="M7 12.5 L10.5 16 L17 8.5" fill="none" stroke="var(--gp-surface, #fff)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>', size),
  w: (size) => svg('cz-mark cz-mark--w',
    '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2.6"/>'
    + '<path d="M7.5 12 H16.5 M7.5 12 L10 9.5 M7.5 12 L10 14.5 M16.5 12 L14 9.5 M16.5 12 L14 14.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>', size),
  n: (size) => svg('cz-mark cz-mark--n',
    '<rect x="5" y="10.5" width="14" height="3" rx="1.5" fill="currentColor"/>', size)
};

export const mark = (kind, size = 22) => MARKS[kind](size);

/** A star, full or empty. Stars are shapes, and the count is also in text. */
export const star = (full, size = 18) => svg(`cz-star${full ? ' is-full' : ''}`,
  '<path d="M12 2.6 L14.8 8.6 L21.3 9.3 L16.4 13.7 L17.8 20.2 L12 16.9 L6.2 20.2 L7.6 13.7 L2.7 9.3 L9.2 8.6 Z" '
  + `fill="${full ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>`, size);

/** `n` of `of` stars, with the number for a screen reader. */
export function stars(n, of = 3, size = 18, label = '') {
  const icons = Array.from({ length: of }, (_, i) => star(i < n, size)).join('');
  return `<span class="cz-stars" role="img" aria-label="${label || `${n} / ${of}`}">${icons}</span>`;
}

/** A padlock, for a locked chapter or puzzle. */
export const padlock = (size = 18) => svg('cz-padlock',
  '<rect x="5" y="10.5" width="14" height="10" rx="2.5" fill="currentColor"/>'
  + '<path d="M8 10.5 V8 a4 4 0 0 1 8 0 V10.5" fill="none" stroke="currentColor" stroke-width="2.4"/>', size);

/* ------------------------------------------------------------------ */
/* The game pictures on the hub                                         */
/* ------------------------------------------------------------------ */

/* Drawn on a 64 grid like the Fun and Games tiles; `t` is the room colour,
   `p` its soft tint. */
const GAME_ART = {
  code: (t, p) => `<rect x="4" y="4" width="56" height="56" rx="13" fill="${p}"/>
    <rect x="13" y="15" width="38" height="36" rx="6" fill="none" stroke="${t}" stroke-width="4.5"/>
    <circle cx="32" cy="33" r="9" fill="none" stroke="${t}" stroke-width="4"/>
    <path d="M32 26 V30" stroke="${t}" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M51 25 H55 M51 41 H55" stroke="${t}" stroke-width="4" stroke-linecap="round"/>`,
  truth: (t, p) => `<rect x="4" y="4" width="56" height="56" rx="13" fill="${p}"/>
    <circle cx="23" cy="28" r="8" fill="${t}"/>
    <path d="M23 13 V16 M23 40 V43 M8 28 H11 M35 28 H38 M12.4 17.4 L14.5 19.5 M31.5 36.5 L33.6 38.6 M12.4 38.6 L14.5 36.5 M31.5 19.5 L33.6 17.4"
      stroke="${t}" stroke-width="3" stroke-linecap="round"/>
    <path d="M47 30 a11 11 0 1 1 -6 -16 a8.5 8.5 0 1 0 6 16 Z" fill="${t}" transform="translate(0 10)"/>`,
  rule: (t, p) => `<rect x="4" y="4" width="56" height="56" rx="13" fill="${p}"/>
    <path d="M14 52 V26 a18 18 0 0 1 36 0 V52" fill="none" stroke="${t}" stroke-width="5"/>
    <path d="M23 34 L30 41 L42 27" fill="none" stroke="${t}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>`,
  bridges: (t, p) => `<rect x="4" y="4" width="56" height="56" rx="13" fill="${p}"/>
    <circle cx="16" cy="32" r="8" fill="none" stroke="${t}" stroke-width="4"/>
    <circle cx="48" cy="32" r="8" fill="none" stroke="${t}" stroke-width="4"/>
    <path d="M24 29 H40 M24 35 H40" stroke="${t}" stroke-width="3.5" stroke-linecap="round"/>`,
  trains: (t, p) => `<rect x="4" y="4" width="56" height="56" rx="13" fill="${p}"/>
    <rect x="17" y="13" width="30" height="30" rx="7" fill="none" stroke="${t}" stroke-width="4.5"/>
    <rect x="23" y="19" width="18" height="9" rx="2" fill="${t}"/>
    <circle cx="25" cy="36" r="2.6" fill="${t}"/><circle cx="39" cy="36" r="2.6" fill="${t}"/>
    <path d="M20 52 L25 43 M44 52 L39 43" stroke="${t}" stroke-width="4" stroke-linecap="round"/>`,
  robot: (t, p) => `<rect x="4" y="4" width="56" height="56" rx="13" fill="${p}"/>
    <rect x="15" y="20" width="34" height="27" rx="7" fill="none" stroke="${t}" stroke-width="4.5"/>
    <circle cx="25" cy="33" r="3.5" fill="${t}"/><circle cx="39" cy="33" r="3.5" fill="${t}"/>
    <path d="M32 20 V13" stroke="${t}" stroke-width="4" stroke-linecap="round"/><circle cx="32" cy="11" r="3.5" fill="${t}"/>
    <path d="M26 41 H38" stroke="${t}" stroke-width="3.5" stroke-linecap="round"/>`,
  jam: (t, p) => `<rect x="4" y="4" width="56" height="56" rx="13" fill="${p}"/>
    <rect x="11" y="11" width="36" height="42" rx="5" fill="none" stroke="${t}" stroke-width="3.5"/>
    <rect x="16" y="26" width="20" height="11" rx="4" fill="${t}"/>
    <rect x="38" y="15" width="6" height="18" rx="2.5" fill="none" stroke="${t}" stroke-width="3"/>
    <rect x="16" y="41" width="14" height="7" rx="2.5" fill="none" stroke="${t}" stroke-width="3"/>
    <path d="M47 31.5 H56 M52 27 L56.5 31.5 L52 36" fill="none" stroke="${t}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`,
  gates: (t, p) => `<rect x="4" y="4" width="56" height="56" rx="13" fill="${p}"/>
    <path d="M10 22 H22 M10 42 H22 M42 32 H52" stroke="${t}" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M22 16 H31 a16 16 0 0 1 0 32 H22 Z" fill="none" stroke="${t}" stroke-width="4.5" stroke-linejoin="round"/>
    <circle cx="54" cy="32" r="4.5" fill="${t}"/>`,
  mirrors: (t, p) => `<rect x="4" y="4" width="56" height="56" rx="13" fill="${p}"/>
    <circle cx="15" cy="17" r="6" fill="${t}"/>
    <path d="M15 7 V9 M15 25 V27 M5 17 H7 M23 17 H25" stroke="${t}" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M22 17 H40 V44 H55" fill="none" stroke="${t}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 0"/>
    <path d="M34 11 L46 23 M34 50 L46 38" stroke="${t}" stroke-width="5" stroke-linecap="round"/>`,
  bug: (t, p) => `<rect x="4" y="4" width="56" height="56" rx="13" fill="${p}"/>
    <ellipse cx="32" cy="36" rx="11" ry="14" fill="none" stroke="${t}" stroke-width="4.5"/>
    <path d="M32 22 V50" stroke="${t}" stroke-width="3"/>
    <circle cx="32" cy="18" r="5" fill="${t}"/>
    <path d="M21 30 L13 26 M21 38 H12 M21 45 L14 50 M43 30 L51 26 M43 38 H52 M43 45 L50 50"
      stroke="${t}" stroke-width="3" stroke-linecap="round"/>`
};

export const gameArt = (kind) => `<svg class="cz-gameart" viewBox="0 0 64 64" aria-hidden="true"
  focusable="false">${GAME_ART[kind](
    'var(--room, var(--gp-accent))', 'var(--room-soft, var(--gp-accent-soft))')}</svg>`;

export const GAME_ART_KINDS = Object.keys(GAME_ART);

export default { ANIMALS, animalById, theAnimal, animalName, mark, star, stars, padlock, gameArt };
