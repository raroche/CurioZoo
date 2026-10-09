/**
 * Tests for Elephant Fountain's water (modules/fountainlogic.js): it falls,
 * spreads, spills, fills from the bottom, and joined tubes end up level.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import * as F from '../../assets/js/modules/fountainlogic.js';

const board = (rows, src, drops) => ({ w: rows[0].length, h: rows.length, cells: rows.join(''), src, drops });
const wetRows = (b, res) => {
  const wet = new Set(res.water);
  return Array.from({ length: b.h }, (_, y) => Array.from({ length: b.w }, (_, x) => (wet.has(y * b.w + x) ? '~' : b.cells[y * b.w + x])).join(''));
};

describe('water', () => {
  test('falls straight down and fills a cup from the bottom', () => {
    const b = board(['.....', '.....', '.#T#.', '.###.', '#####'], 2, 1);
    assert.deepEqual(wetRows(b, F.run(b)), ['.....', '.....', '.#~#.', '.###.', '#####']);
  });

  test('a shelf with dirt holds it; dug, it falls through', () => {
    const b = board(['.....', '##d##', '.....', '.#T#.', '#####'], 2, 1);
    assert.equal(F.success(b, F.run(b)), false);
    assert.equal(F.success(b, F.run(b, new Set([7]))), true);
  });

  test('joined tubes rise together and end level, wide or thin', () => {
    const b = board(['.........', '.##.#####', '.##.#####', '.##.#####', '.##.#####', '.##.#####', '.##.#####', '.##.#####', '.....####', '#########'], 0, 11);
    const rows = wetRows(b, F.run(b));
    assert.equal(rows[8], '~~~~~####');
    assert.equal(rows[7][0], '~');
    assert.equal(rows[7][3], '~');
    assert.equal(rows[5][0], '~');
    assert.equal(rows[5][3], '~');
    assert.equal(rows[4][0], '.');
    assert.equal(rows[4][3], '.');
  });

  test('the same board always runs the same way', () => {
    const b = board(['.....', '.#...', '.#...', '.....', '#####'], 3, 6);
    assert.deepEqual(F.run(b), F.run(b));
  });
});

describe('making fountains', () => {
  test('every chapter makes sound fountains, the same from the same seed', () => {
    for (const level of F.LEVELS) {
      for (const c of F.CHAPTERS[level]) {
        for (let i = 0; i < 8; i++) {
          const p = F.makeAt(c.id, i, 'test');
          if (!p) continue;
          assert.deepEqual(F.makeAt(c.id, i, 'test'), p);
          assert.deepEqual(F.problems(p), [], `${c.id} ${i}`);
        }
      }
    }
  });
});
