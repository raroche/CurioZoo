/**
 * Tests for Firefly Circuits' solver (modules/fireflylogic.js): the circuit
 * facts every puzzle stands on, checked on small boards drawn by hand.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import * as F from '../../assets/js/modules/fireflylogic.js';
import { FIREFLY_TEXT } from '../../assets/js/modules/fireflytext.js';

const w = (m) => ({ t: 'w', m });
/* A 3 by 3 ring: corners and straights round an empty middle. */
const ring = () => [w(6), w(10), w(12), w(5), null, w(5), w(3), w(10), w(9)];
const run = (cells) => F.solve({ w: 3, h: 3, cells });
const power = (r, id) => F.fracText(r.fireflies[id].p);

describe('the circuit facts', () => {
  test('a whole loop lights one firefly fully', () => {
    const c = ring(); c[1] = { t: 'E', p: 2 }; c[7] = { t: 'F', m: 10, id: 'A' };
    const r = run(c);
    assert.equal(power(r, 'A'), '1');
  });

  test('two in a row share: a quarter each', () => {
    const c = ring(); c[1] = { t: 'E', p: 2 }; c[7] = { t: 'F', m: 10, id: 'A' }; c[5] = { t: 'F', m: 5, id: 'B' };
    const r = run(c);
    assert.equal(power(r, 'A'), '1/4');
    assert.equal(power(r, 'B'), '1/4');
  });

  test('side by side, each is bright', () => {
    const c = ring(); c[1] = { t: 'E', p: 2 }; c[7] = { t: 'F', m: 10, id: 'A' };
    c[3] = w(7); c[4] = { t: 'F', m: 10, id: 'B' }; c[5] = w(13);
    const r = run(c);
    assert.equal(power(r, 'A'), '1');
    assert.equal(power(r, 'B'), '1');
  });

  test('a gap, a wooden stick or an open switch stops everything', () => {
    for (const fill of [null, { t: 'i', m: 5 }, { t: 's', m: 5, on: false }]) {
      const c = ring(); c[1] = { t: 'E', p: 2 }; c[7] = { t: 'F', m: 10, id: 'A' }; c[5] = fill;
      const r = run(c);
      assert.equal(r.open, true);
      assert.equal(power(r, 'A'), '0');
    }
  });

  test('a closed switch is just wire', () => {
    const c = ring(); c[1] = { t: 'E', p: 2 }; c[7] = { t: 'F', m: 10, id: 'A' }; c[5] = { t: 's', m: 5, on: true };
    assert.equal(power(run(c), 'A'), '1');
  });

  test('wire alone across the eel is a short: every firefly sleeps', () => {
    const c = ring(); c[1] = { t: 'E', p: 2 }; c[7] = { t: 'F', m: 10, id: 'A' };
    c[3] = w(7); c[4] = w(10); c[5] = w(13);
    const r = run(c);
    assert.equal(r.short, true);
    assert.equal(power(r, 'A'), '0');
    assert.ok(r.flows.length > 0, 'the short still has dots racing round it');
  });

  test('wire around one firefly skips it but is not a short', () => {
    /* Eel on top, A in the top-left corner, a wire across the middle, and
       B on the bottom: the middle wire runs beside B, so B is skipped and A
       still has its loop. */
    const c = ring();
    c[0] = { t: 'F', m: 6, id: 'A' }; c[1] = { t: 'E', p: 2 };
    c[3] = w(7); c[4] = w(10); c[5] = w(13);
    c[7] = { t: 'F', m: 10, id: 'B' };
    const r = run(c);
    assert.equal(r.short, false);
    assert.equal(r.fireflies.B.why, 'bypass');
    assert.equal(power(r, 'B'), '0');
    assert.equal(power(r, 'A'), '1');
  });
});

describe('making circuits', () => {
  test('every chapter makes sound circuits, the same from the same seed', () => {
    for (const level of F.LEVELS) {
      for (const c of F.CHAPTERS[level]) {
        for (let i = 0; i < 12; i++) {
          const p = F.makeAt(c.id, i, 'test');
          assert.ok(p, `${c.id} ${i} made nothing`);
          assert.deepEqual(F.makeAt(c.id, i, 'test'), p);
          assert.deepEqual(F.problems(p), [], `${c.id} ${i}`);
        }
      }
    }
  });

  test('a build circuit has exactly one way to meet its card', () => {
    const p = F.makeAt('e3', 5, 'one');
    assert.equal(F.solutions(p, 3).length, 1);
  });
});

describe('words', () => {
  test('every tier and piece has a name in both languages', () => {
    for (const k of ['tier.on', 'tier.0', 'tier.4', 'tier.3', 'tier.2', 'tier.1', 'tierRows.0', ...Object.keys(F.KINDS).map((x) => `piece.${x}`)]) {
      assert.ok(FIREFLY_TEXT.en[k] && FIREFLY_TEXT.es[k], k);
    }
  });
});
