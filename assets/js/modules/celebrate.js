/**
 * celebrate.js — the moments that move: confetti, a score counting up, a bump.
 *
 * Every room ends a round the same way, so the celebration is written once.
 * It used to be six copies of the same confetti markup, one per room, and the
 * paper fell forever: a child reading the vault story or the facts they had
 * missed did it under a snowstorm. Now it falls once and is gone.
 *
 * The rules every animation here follows:
 *
 *   - It marks something the child did. Nothing moves on its own while a
 *     child is reading a question.
 *   - It is short. A second and a half at most, and it ends where it started
 *     or where it was going, so stopping it early loses nothing.
 *   - Anyone who asked for less movement gets the end state at once. CSS
 *     handles that for keyframes (section 14 of design-system.css); the one
 *     animation here driven from JavaScript checks for itself.
 *   - No style="" attributes: the Content-Security-Policy drops them. Values
 *     ride in data-style and paint() applies them, as everywhere else.
 */

/** True when the child, or the device, asked for less movement. */
export const calm = () => typeof window !== 'undefined'
  && typeof window.matchMedia === 'function'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Three shapes and three colours, cycled, so the paper reads as paper and not
   as a pattern. Positions and timings are random, but every piece is in the
   air within the first second, so the whole fall is over by about three. */
const PIECES = 18;

/**
 * The confetti, as markup. Put it first inside the element that celebrates,
 * which needs position: relative (.gp-flagdone and .gp-done have it).
 *
 * Returns '' when there is nothing to celebrate, so a call site can write
 * ${confetti(perfect)} without a condition around it.
 */
export function confetti(on = true, { pieces = PIECES, random = Math.random } = {}) {
  if (!on) return '';
  const bits = Array.from({ length: pieces }, (_, i) => {
    const x = (i / pieces) * 100 + random() * (100 / pieces);
    const delay = random() * 0.9;
    const drift = Math.round((random() - 0.5) * 80);
    const spin = Math.round(260 + random() * 420) * (random() < 0.5 ? -1 : 1);
    const vars = `--x:${x.toFixed(1)}%;--d:${delay.toFixed(2)}s;--dx:${drift}px;--rot:${spin}deg`;
    return `<span data-style="${vars}"></span>`;
  }).join('');
  return `<div class="gp-confetti" aria-hidden="true">${bits}</div>`;
}

/**
 * Count each number in a round's ending up from zero.
 *
 * The final value is already in the page, so a screen reader, a reduced-
 * motion child and anyone who looks away all read the right number. The
 * count only rewrites the visible text for about half a second.
 *
 * Targets: the scores on an end card (.gp-flagdone__score strong) and
 * anything marked [data-count-up].
 */
export function countUp(root, { ms = 650 } = {}) {
  if (!root || calm() || typeof requestAnimationFrame !== 'function') return;
  const els = root.querySelectorAll('.gp-flagdone__score strong, [data-count-up]');
  els.forEach((el) => {
    const text = el.textContent.trim();
    if (!/^\d+$/.test(text) || el.dataset.counted === '1') return;
    const to = Number(text);
    el.dataset.counted = '1';
    if (to < 2) return;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / ms);
      /* Ease out: quick at first, settling on the number. */
      const eased = 1 - (1 - t) ** 3;
      el.textContent = String(Math.round(to * eased));
      if (t < 1 && el.isConnected) requestAnimationFrame(step);
      else el.textContent = text;
    };
    el.textContent = '0';
    requestAnimationFrame(step);
  });
}

/**
 * Everything a round's ending does, in one call, after its markup is on the
 * page and paint() has run.
 */
export function celebrate(root) {
  countUp(root);
}

/**
 * Give an element a short bump: the streak chip when the streak grows, a
 * counter when it moves. Restarts cleanly if it is called again mid-bump.
 */
export function bump(el) {
  if (!el || calm()) return;
  el.classList.remove('is-bump');
  void el.offsetWidth;   // restart the animation from its first frame
  el.classList.add('is-bump');
  el.addEventListener('animationend', () => el.classList.remove('is-bump'), { once: true });
}

export default { calm, confetti, countUp, celebrate, bump };
