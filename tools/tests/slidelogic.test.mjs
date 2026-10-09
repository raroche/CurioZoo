/**
 * Tests for Penguin Slide's rules (modules/slidelogic.js): straight out of
 * a tube, no higher than the start, and whole-number jumps.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import * as S from '../../assets/js/modules/slidelogic.js';

describe('out of a curved tube', () => {
  const p = { kind: 'tube', w: 10, h: 10, start: [0, 2], dir: 'E', tubes: [{ at: [2, 2], r: 2, turns: ['R'] }], fish: [[4, 7], [2, 6], [7, 4]] };
  test('a quarter turn right, heading east, comes out heading south', () => {
    const r = S.route(p);
    assert.deepEqual(r.exit, [4, 4]);
    assert.equal(r.d, 'S');
  });
  test('it reaches the fish straight ahead, not the curving or flung ones', () => {
    assert.equal(S.fishReached(p), 0);
    const ideas = S.wrongIdeas(p);
    assert.deepEqual(ideas.curve, [2, 6]);
    assert.equal(ideas.flung.dir, 'E');
  });
});

describe('hills', () => {
  test('only a hill at least one row below the start is cleared', () => {
    assert.equal(S.clears(5, 4), true);
    assert.equal(S.clears(5, 5), false);
    assert.equal(S.clears(5, 6), false);
  });
  test('the first hill as high as the start is where it stops', () => {
    assert.equal(S.stopsAt(6, [3, 5, 6, 2]), 2);
    assert.equal(S.stopsAt(6, [3, 5, 2]), 3);
  });
});

describe('jumps', () => {
  test('it lands 2 × √(drop × ledge) squares out', () => {
    assert.equal(S.landing(1, 4), 4);
    assert.equal(S.landing(4, 4), 8);
    assert.equal(S.landing(9, 1), 6);
  });
});

describe('making slides', () => {
  test('every chapter makes sound slides, the same from the same seed', () => {
    for (const level of S.LEVELS) {
      for (const c of S.CHAPTERS[level]) {
        for (let i = 0; i < 20; i++) {
          const p = S.makeAt(c.id, i, 'test');
          if (!p) continue;
          assert.deepEqual(S.makeAt(c.id, i, 'test'), p);
          assert.deepEqual(S.problems(p), [], `${c.id} ${i}: ${JSON.stringify(p)}`);
        }
      }
    }
  });
});
