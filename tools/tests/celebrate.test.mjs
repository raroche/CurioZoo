/**
 * The shared celebration: confetti markup and the reduced-motion switch.
 *
 * The confetti is the one piece of motion built as a string, and strings are
 * where the CSP rule bites: a style="" attribute here would be dropped in
 * production and every piece would fall from the same spot, unnoticed on a
 * laptop that sends no policy.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { confetti, calm, countUp, bump } from '../../assets/js/modules/celebrate.js';

test('nothing to celebrate draws nothing', () => {
  assert.equal(confetti(false), '');
});

test('confetti is hidden from screen readers and never uses style=""', () => {
  const html = confetti(true);
  assert.match(html, /^<div class="gp-confetti" aria-hidden="true">/);
  assert.doesNotMatch(html, /\sstyle=/);
  assert.equal((html.match(/<span /g) || []).length, 18);
});

test('every piece is placed across the width, with a delay, drift and spin', () => {
  let n = 0;
  const html = confetti(true, { pieces: 10, random: () => ((n += 1) % 10) / 10 });
  const pieces = [...html.matchAll(/data-style="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(pieces.length, 10);
  for (const p of pieces) assert.match(p, /^--x:[\d.]+%;--d:[\d.]+s;--dx:-?\d+px;--rot:-?\d+deg$/);
  const xs = pieces.map((p) => Number(p.match(/--x:([\d.]+)/)[1]));
  assert.ok(xs.every((x) => x >= 0 && x <= 100), 'every piece starts inside the card');
  assert.ok(Math.max(...xs) - Math.min(...xs) > 50, 'the pieces spread across the card');
});

test('under node there is no window: calm, and the DOM helpers do nothing', () => {
  assert.equal(calm(), false);
  assert.doesNotThrow(() => countUp(null));
  assert.doesNotThrow(() => bump(null));
});
