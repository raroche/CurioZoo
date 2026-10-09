/**
 * Tests for Shadow Show (modules/shadowlogic.js): straight-line light as
 * whole-number similar triangles.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import * as H from '../../assets/js/modules/shadowlogic.js';

describe('shadows', () => {
  test('nearer the lamp, bigger: slots 2, 3, 4, 6, 12 give 6, 4, 3, 2, 1', () => {
    assert.deepEqual(H.SLOTS.map((x) => H.scale(x)), [6, 4, 3, 2, 1]);
  });
  test('moving the lamp: puppet at 6, lamp at 0, 3, 4, 5 gives 2, 3, 4, 7', () => {
    assert.deepEqual([0, 3, 4, 5].map((L) => H.scale(6, L)), [2, 3, 4, 7]);
  });
  test('raising the lamp lowers the shadow', () => {
    assert.deepEqual(H.shadowSpan(5, 7, 4, 5), [5, 11]);
    assert.deepEqual(H.shadowSpan(5, 7, 4, 6), [3, 9]);
    assert.deepEqual(H.shadowSpan(5, 7, 4, 7), [1, 7]);
  });
  test('a low sun makes a long shadow', () => {
    assert.deepEqual(H.SUNS.map((s) => H.sunLength(2, s)), [1, 2, 4, 6]);
  });
  test('two lamps make two shadows, unless the puppet is against the wall', () => {
    assert.equal(H.shadowCount({ puppet: 'rabbit', x: 6, lamps: [4, 8] }), 2);
    assert.equal(H.shadowCount({ puppet: 'rabbit', x: 12, lamps: [4, 8] }), 1);
  });
});

describe('making shadow puzzles', () => {
  test('every chapter makes sound puzzles, the same from the same seed', () => {
    for (const level of H.LEVELS) {
      for (const c of H.CHAPTERS[level]) {
        for (let i = 0; i < 20; i++) {
          const p = H.makeAt(c.id, i, 'test');
          assert.ok(p, `${c.id} ${i}`);
          assert.deepEqual(H.makeAt(c.id, i, 'test'), p);
          assert.deepEqual(H.problems(p), [], `${c.id} ${i}: ${JSON.stringify(p)}`);
        }
      }
    }
  });
});
