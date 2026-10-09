/**
 * Tests for Sunbeam Mirrors (assets/js/modules/mirrorslogic.js).
 *
 * The whole bank is re-checked by tools/logiccheck.mjs; these pin down how
 * the beam bounces and that every board has exactly one answer.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as M from '../../assets/js/modules/mirrorslogic.js';
import { MIRRORS_TEXT } from '../../assets/js/modules/mirrorstext.js';
import { rngFor } from '../../assets/js/modules/logicrng.js';
import { checkMirrorsBank, checkParity } from '../logiccheck.mjs';

describe('the beam', () => {
  /* A 3×3 board, the sun on the left of row 1, shining right. */
  const b = (cells) => ({ n: 3, sun: [1, -1, 1], cells });

  test('goes straight over empty squares and leaves at the edge', () => {
    const r = M.beam(b('.........'));
    assert.deepEqual(r.path, [[1, 0], [1, 1], [1, 2]]);
    assert.equal(r.end, 'edge');
  });

  test('"/" turns a beam going right up; "\\" turns it down', () => {
    assert.deepEqual(M.beam(b('....' + '/' + '....')).path, [[1, 0], [1, 1], [0, 1]]);
    assert.deepEqual(M.beam(b('....' + '\\' + '....')).path, [[1, 0], [1, 1], [2, 1]]);
  });

  test('a rock stops it, and an animal on the way is woken', () => {
    const r = M.beam(b('...a#....'));
    assert.equal(r.end, 'rock');
    assert.ok(r.lit.has(3));
  });

  test('a turnable mirror uses the slant it is turned to', () => {
    const cells = '....T....';
    assert.deepEqual(M.beam(b(cells), cells, ['/']).path.at(-1), [0, 1]);
    assert.deepEqual(M.beam(b(cells), cells, ['\\']).path.at(-1), [2, 1]);
  });
});

describe('one answer', () => {
  for (const id of ['e1', 'e2', 'e3', 'm1', 'm2', 'h1', 'h2', 'h3']) {
    test(`${id}: made boards have exactly one answer`, () => {
      const ch = M.chapter(id);
      for (let j = 0; j < 8; j++) {
        const p = M.makePuzzle(ch, rngFor('mirrors', 'test', id, j));
        assert.ok(p, `${id} ${j}`);
        if (p.mode === 'where') assert.equal(M.beam(p).lit.size, 1);
        if (p.mode === 'turn') { assert.equal(M.turnSolutions(p).length, 1); assert.notEqual(M.turnSolutions(p)[0], p.start); }
        if (p.mode === 'place') assert.equal(M.placeSolutions(p).length, 1);
      }
    });
  }
});

describe('stars', () => {
  test('the fewest taps is ★★★, two more ★★, then ★; the answer shown is ★', () => {
    assert.equal(M.starsFor('turn', { taps: 2, fewest: 2 }), 3);
    assert.equal(M.starsFor('turn', { taps: 4, fewest: 2 }), 2);
    assert.equal(M.starsFor('turn', { taps: 9, fewest: 2 }), 1);
    assert.equal(M.starsFor('where', { tries: 1 }), 3);
    assert.equal(M.starsFor('place', { taps: 2, fewest: 2, shown: true }), 1);
  });
});

describe('words', () => {
  test('English and Spanish match', () => {
    assert.deepEqual(checkParity('mirrorstext', MIRRORS_TEXT), []);
  });
});

describe('the shipped bank', () => {
  for (const level of M.LEVELS) {
    test(`${level} passes the checker`, () => {
      const bank = JSON.parse(fs.readFileSync(`data/logic/mirrors/${level}.json`, 'utf8'));
      assert.deepEqual(checkMirrorsBank(bank), []);
    });
  }
});
