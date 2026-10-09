/**
 * scienceart.js — the Science Lab's ten game icons.
 *
 * Drawn on the same 64 grid and in the same two tones as the Logic Games
 * icons (zooart.js): a soft rounded square and one line drawing in the room's
 * colour, so they re-theme with the room and read in dark mode. Each is a
 * different SHAPE (a wave, a train, a loop, a seesaw...), never just a
 * different colour.
 */

const ART = {
  /* A ball floating on a wave, a stone on the bottom. */
  pond: (t, p) => `<rect x="4" y="4" width="56" height="56" rx="13" fill="${p}"/>
    <circle cx="23" cy="26" r="8" fill="none" stroke="${t}" stroke-width="4"/>
    <path d="M10 32 q5.5 -5 11 0 t11 0 t11 0 t11 0" fill="none" stroke="${t}" stroke-width="4" stroke-linecap="round"/>
    <rect x="35" y="43" width="12" height="8" rx="3" fill="${t}"/>
    <path d="M45 18 V28 M41 24 L45 28 L49 24" fill="none" stroke="${t}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`,
  /* A train car, and a fruit falling in a curve ahead of it. */
  train: (t, p) => `<rect x="4" y="4" width="56" height="56" rx="13" fill="${p}"/>
    <rect x="11" y="12" width="24" height="14" rx="4" fill="none" stroke="${t}" stroke-width="4"/>
    <circle cx="17" cy="29" r="3" fill="${t}"/><circle cx="29" cy="29" r="3" fill="${t}"/>
    <path d="M37 20 q9 2 12 18" fill="none" stroke="${t}" stroke-width="3" stroke-dasharray="1 5" stroke-linecap="round"/>
    <circle cx="49" cy="44" r="5" fill="${t}"/>
    <path d="M10 37 H34" stroke="${t}" stroke-width="3" stroke-linecap="round"/>`,
  /* A loop from a battery round a glowing bulb. */
  firefly: (t, p) => `<rect x="4" y="4" width="56" height="56" rx="13" fill="${p}"/>
    <rect x="13" y="36" width="18" height="10" rx="2.5" fill="none" stroke="${t}" stroke-width="3.5"/>
    <path d="M31 41 H46 V30 M13 41 H10 V22 H38" fill="none" stroke="${t}" stroke-width="3.5" stroke-linejoin="round"/>
    <circle cx="44" cy="23" r="6" fill="${t}"/>
    <path d="M44 12 V9 M53 16 L55 14 M55 24 H58" stroke="${t}" stroke-width="3" stroke-linecap="round"/>`,
  /* A plank on a rock: a small weight far out lifts a big one close in. */
  lever: (t, p) => `<rect x="4" y="4" width="56" height="56" rx="13" fill="${p}"/>
    <path d="M24 49 L30 39 L36 49 Z" fill="${t}"/>
    <path d="M8 31 L56 45" stroke="${t}" stroke-width="4" stroke-linecap="round"/>
    <circle cx="20" cy="25" r="8" fill="none" stroke="${t}" stroke-width="4"/>
    <circle cx="52" cy="38" r="4" fill="${t}"/>`,
  /* A ramp, a ball, and a dotted fall into a pool. */
  slide: (t, p) => `<rect x="4" y="4" width="56" height="56" rx="13" fill="${p}"/>
    <path d="M9 14 Q14 32 32 32 H38" fill="none" stroke="${t}" stroke-width="4" stroke-linecap="round"/>
    <circle cx="15" cy="14" r="4.5" fill="${t}"/>
    <path d="M41 32 q8 2 10 14" fill="none" stroke="${t}" stroke-width="3" stroke-dasharray="1 5" stroke-linecap="round"/>
    <path d="M38 50 q4 -3 8 0 t8 0" fill="none" stroke="${t}" stroke-width="3.5" stroke-linecap="round"/>`,
  /* The sun, an arrow, a leaf, an arrow. */
  chain: (t, p) => `<rect x="4" y="4" width="56" height="56" rx="13" fill="${p}"/>
    <circle cx="16" cy="20" r="6" fill="${t}"/>
    <path d="M16 8 V10 M16 30 V32 M4.5 20 H6 M26 20 H27.5 M8 12 L9.5 13.5 M22.5 26.5 L24 28 M8 28 L9.5 26.5 M22.5 13.5 L24 12" stroke="${t}" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M26 30 L34 38 M34 38 V32 M34 38 H28" fill="none" stroke="${t}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M40 54 C40 42 46 38 54 38 C54 48 50 54 40 54 Z M40 54 L49 44" fill="none" stroke="${t}" stroke-width="3.5" stroke-linejoin="round"/>`,
  /* Drops falling into a cup that is filling level. */
  fountain: (t, p) => `<rect x="4" y="4" width="56" height="56" rx="13" fill="${p}"/>
    <path d="M32 10 c-4 6 -6 9 -6 12 a6 6 0 0 0 12 0 c0 -3 -2 -6 -6 -12 Z" fill="${t}"/>
    <path d="M14 34 V48 a4 4 0 0 0 4 4 H46 a4 4 0 0 0 4 -4 V34" fill="none" stroke="${t}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M17 42 H47" stroke="${t}" stroke-width="3.5" stroke-linecap="round"/>`,
  /* A lamp, a small shape, and its bigger shadow on a wall. */
  shadow: (t, p) => `<rect x="4" y="4" width="56" height="56" rx="13" fill="${p}"/>
    <circle cx="12" cy="32" r="4.5" fill="${t}"/>
    <path d="M14 30 L52 15 M14 34 L52 49" stroke="${t}" stroke-width="1.8" stroke-dasharray="2 3"/>
    <rect x="26" y="26" width="6" height="12" rx="2" fill="none" stroke="${t}" stroke-width="3"/>
    <path d="M54 12 V52" stroke="${t}" stroke-width="3" stroke-linecap="round"/>
    <rect x="44" y="20" width="8" height="24" rx="2" fill="${t}"/>`,
  /* A horseshoe magnet and a paper clip. */
  magnet: (t, p) => `<rect x="4" y="4" width="56" height="56" rx="13" fill="${p}"/>
    <path d="M16 12 V30 a12 12 0 0 0 24 0 V12" fill="none" stroke="${t}" stroke-width="7"/>
    <path d="M12.5 12 H19.5 M36.5 12 H43.5" stroke="${p}" stroke-width="3"/>
    <path d="M46 46 h8 a3 3 0 0 0 0 -6 h-10 a3 3 0 0 0 0 6" fill="none" stroke="${t}" stroke-width="2.6"/>
    <path d="M42 22 l4 -3 M44 28 l5 -1" stroke="${t}" stroke-width="2.6" stroke-linecap="round"/>`,
  /* Three dominoes, falling one after another. */
  domino: (t, p) => `<rect x="4" y="4" width="56" height="56" rx="13" fill="${p}"/>
    <rect x="11" y="20" width="9" height="26" rx="2" fill="none" stroke="${t}" stroke-width="3.5"/>
    <rect x="26" y="20" width="9" height="26" rx="2" fill="none" stroke="${t}" stroke-width="3.5" transform="rotate(18 35 46)"/>
    <rect x="41" y="20" width="9" height="26" rx="2" fill="${t}" transform="rotate(42 50 46)"/>
    <path d="M8 49 H56" stroke="${t}" stroke-width="3" stroke-linecap="round"/>`
};

export const gameArt = (kind) => `<svg class="cz-gameart" viewBox="0 0 64 64" aria-hidden="true"
  focusable="false">${(ART[kind] || ART.pond)(
    'var(--room, var(--gp-accent))', 'var(--room-soft, var(--gp-accent-soft))')}</svg>`;

export const SCIENCE_ART_KINDS = Object.keys(ART);

export default { gameArt, SCIENCE_ART_KINDS };
