/**
 * Tests for Zoo Traffic Jam (assets/js/modules/jamlogic.js).
 *
 * The whole bank is re-checked by tools/logiccheck.mjs; these pin down the
 * rules: how carts slide, what a move is, and that the fewest moves is the
 * fewest.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as J from '../../assets/js/modules/jamlogic.js';
import { JAM_TEXT, carName } from '../../assets/js/modules/jamtext.js';
import { ANIMALS } from '../../assets/js/modules/zooart.js';
import { rngFor } from '../../assets/js/modules/logicrng.js';
import { checkJamBank, checkParity } from '../logiccheck.mjs';

/* A 6×6 lot: the van on row 2, one up-and-down cart in its way. */
const oneBlock = { n: 6, cars: [[2, 0, 2, 'h'], [1, 3, 2, 'v']], rocks: [] };

describe('sliding', () => {
  test('a cart slides only along its length, and not through others', () => {
    const L = J.prepare(oneBlock);
    const moves = J.slides(L, L.start);
    /* The van can go one square right (the cart is at column 3). */
    assert.deepEqual(moves.filter(([i]) => i === 0).map(([, x]) => x), [1]);
    /* The cart can go up one, or down to rows 3-4 and 4-5. */
    assert.deepEqual(moves.filter(([i]) => i === 1).map(([, x]) => x).sort(), [0, 2, 3, 4]);
  });

  test('rocks block like carts and never move', () => {
    const L = J.prepare({ ...oneBlock, rocks: [[0, 3]] });
    const up = J.slides(L, L.start).filter(([i]) => i === 1).map(([, x]) => x);
    assert.ok(!up.includes(0));
  });

  test('overlapping carts are not a legal lot', () => {
    const L = J.prepare({ n: 6, cars: [[2, 0, 2, 'h'], [1, 1, 2, 'v']], rocks: [] });
    assert.equal(J.legal(L, L.start), false);
  });
});

describe('the fewest moves', () => {
  test('one blocking cart: move it, then drive out — 2 moves', () => {
    const s = J.solve(J.prepare(oneBlock));
    assert.equal(s.min, 2);
    assert.equal(s.path.length, 2);
    assert.equal(s.path[s.path.length - 1][0], 0);
  });

  test('the family search agrees with the plain search', () => {
    const ch = J.chapter('m1');
    const p = J.makePuzzle(ch, rngFor('jam', 'test', 1));
    const L = J.prepare(p);
    const fam = J.family(L, L.start);
    assert.equal(fam.get(J.encode(L, L.start)), J.solve(L).min);
    assert.equal(J.solve(L).min, p.min);
  });

  test('the next-move hint is the first step of a shortest path', () => {
    const L = J.prepare(oneBlock);
    const [i, x] = J.nextMove(L, L.start);
    const after = L.start.slice();
    after[i] = x;
    assert.equal(J.solve(L, after).min, 1);
  });

  test('positions survive being stored as numbers', () => {
    const L = J.prepare(oneBlock);
    assert.deepEqual(J.decode(L, J.encode(L, [3, 4])), [3, 4]);
  });
});

describe('making puzzles', () => {
  for (const id of ['e1', 'e3', 'm2']) {
    test(`${id}: lots are in the chapter's range, with the van on the gate row`, () => {
      const ch = J.chapter(id);
      for (let j = 0; j < 5; j++) {
        const p = J.makePuzzle(ch, rngFor('jam', 'test', id, j));
        assert.ok(p, `${id} ${j}`);
        assert.ok(p.min >= ch.moves[0] && p.min <= ch.moves[1], `${id}: ${p.min}`);
        assert.equal(p.cars[0][0], J.gateRow(p.n));
        assert.equal(J.solve(J.prepare(p)).min, p.min);
      }
    });
  }
});

describe('stars', () => {
  test('the fewest moves is ★★★, a few more ★★, then ★; the answer shown is ★', () => {
    assert.equal(J.starsFor({ moves: 8, min: 8 }), 3);
    assert.equal(J.starsFor({ moves: 10, min: 8 }), 2);
    assert.equal(J.starsFor({ moves: 20, min: 8 }), 1);
    assert.equal(J.starsFor({ moves: 8, min: 8, shown: true }), 1);
  });
});

describe('words', () => {
  test('English and Spanish match', () => {
    assert.deepEqual(checkParity('jamtext', JAM_TEXT), []);
  });

  test('every chapter has a name and an idea', () => {
    for (const level of J.LEVELS) for (const ch of J.CHAPTERS[level]) {
      assert.ok(JAM_TEXT.en[`ch.${ch.id}`] && JAM_TEXT.en[`ch.${ch.id}.idea`], ch.id);
    }
  });

  test('carts are named after their animal', () => {
    const lion = ANIMALS.find((a) => a.id === 'lion');
    const giraffe = ANIMALS.find((a) => a.id === 'giraffe');
    assert.equal(carName(1, 2, lion, 'en'), 'the lion cart');
    assert.equal(carName(2, 3, giraffe, 'es', true), 'El camión de la jirafa');
    assert.equal(carName(0, 2, lion, 'en'), "the keeper's van");
  });
});

describe('the shipped bank', () => {
  for (const level of J.LEVELS) {
    test(`${level} passes the checker`, () => {
      const bank = JSON.parse(fs.readFileSync(`data/logic/jam/${level}.json`, 'utf8'));
      assert.deepEqual(checkJamBank(bank), []);
    });
  }
});
