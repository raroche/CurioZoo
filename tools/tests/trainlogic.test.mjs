/**
 * Tests for Fruit Train's rules (modules/trainlogic.js): the whole-number
 * physics every puzzle stands on, and the honesty limits on what may be
 * called "together".
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../../assets/js/modules/trainlogic.js';
import { TRAIN_TEXT, squares, ticks } from '../../assets/js/modules/traintext.js';

describe('falling', () => {
  test('a dropped thing falls 1, 3, 5, 7 rows in its ticks, so 1, 4, 9, 16 in all', () => {
    assert.deepEqual([1, 2, 3, 4].map(T.stepIn), [1, 3, 5, 7]);
    assert.deepEqual([1, 2, 3, 4].map(T.totalAfter), [1, 4, 9, 16]);
    assert.deepEqual([1, 2, 3, 4].map((n) => T.at(0, 0, n)[1]), [1, 4, 9, 16]);
  });

  test('dropped from a moving train it lands speed x ticks ahead', () => {
    assert.equal(T.landing(3, 0, 9), 3);
    assert.equal(T.landing(3, 1, 1), 4);
    assert.equal(T.landing(3, 2, 4), 7);
    assert.equal(T.landing(0, 3, 16), 12);
  });

  test('it stays under the monkey the whole way down', () => {
    for (let t = 0; t <= 3; t++) assert.equal(T.at(2, 2, t)[0], 2 + 2 * t);
  });
});

describe('which lands first', () => {
  const pr = (a, b) => T.firstDown(a, b);
  test('heavy and light from the same height: together', () => {
    assert.equal(pr({ thing: 'watermelon', h: 9 }, { thing: 'grapes', h: 9 }), 'same');
  });
  test('moving sideways does not change the fall', () => {
    assert.equal(pr({ thing: 'apple', h: 9, v: 3 }, { thing: 'apple', h: 9 }), 'same');
  });
  test('the lower one lands first', () => {
    assert.equal(pr({ thing: 'apple', h: 4 }, { thing: 'bowling', h: 9 }), 'a');
  });
  test('a feather drifts down after a fruit from the same height', () => {
    assert.equal(pr({ thing: 'feather', h: 9 }, { thing: 'apple', h: 9 }), 'b');
  });
  test('nobody can say between two drifters', () => {
    assert.equal(pr({ thing: 'feather', h: 9 }, { thing: 'leaf', h: 9 }), null);
  });
  test('"together" is never claimed from higher than 9 rows', () => {
    const p = { kind: 'pair', pairs: [{ a: { thing: 'apple', h: 16 }, b: { thing: 'grapes', h: 16 } }] };
    assert.ok(T.problems(p).some((m) => m.includes('together')));
  });
});

describe('making experiments', () => {
  test('every chapter makes sound, repeatable experiments', () => {
    for (const level of T.LEVELS) {
      for (const c of T.CHAPTERS[level]) {
        for (let i = 0; i < 40; i++) {
          const p = T.makeAt(c.id, i, 'test');
          assert.deepEqual(T.makeAt(c.id, i, 'test'), p);
          if (p) assert.deepEqual(T.problems(p), [], `${c.id} ${i}: ${JSON.stringify(p)}`);
        }
      }
    }
  });

  test('a moving-train drop always offers the spot straight above the animal', () => {
    for (let i = 2; i < 40; i++) {
      const p = T.makeAt('e3', i, 'above');
      if (!p) continue;
      for (const g of p.targets) assert.ok(p.spots.includes(g.M), JSON.stringify(p));
    }
  });
});

describe('words', () => {
  test('every animal and thing has a name in both languages', () => {
    for (const e of T.EATERS) assert.ok(TRAIN_TEXT.en[`eater.${e.id}`] && TRAIN_TEXT.es[`eater.${e.id}`], e.id);
    for (const x of T.THINGS) assert.ok(TRAIN_TEXT.en[`thing.${x.id}`] && TRAIN_TEXT.es[`thing.${x.id}`], x.id);
  });
  test('one is singular, more are plural', () => {
    assert.equal(squares(1, 'en'), '1 square');
    assert.equal(squares(3, 'es'), '3 casillas');
    assert.equal(ticks(1, 'es'), '1 tic');
  });
});
