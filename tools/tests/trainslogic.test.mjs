/**
 * Tests for Train Tracks (assets/js/modules/trainslogic.js).
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from '../../assets/js/modules/trainslogic.js';
import { TRAINS_TEXT, houseName, trainName } from '../../assets/js/modules/trainstext.js';
import { ANIMALS } from '../../assets/js/modules/zooart.js';
import { checkTrainsBank, checkParity } from '../logiccheck.mjs';

describe('running trains', () => {
  /* Two lanes; one switch in column 0 from lane 0 down to lane 1. */
  const lay = { lanes: 2, cols: 2, x: [[0, 0, 1, 'lever']] };

  test('a lever sends the train straight or across', () => {
    assert.equal(T.runOne(lay, 0, [0]).to, 0);
    assert.equal(T.runOne(lay, 0, [1]).to, 1);
  });

  test('a train on the other lane just rolls through', () => {
    assert.equal(T.runOne(lay, 1, [1]).to, 1);
  });

  test('a flip switch takes turns, so two trains go two ways', () => {
    const flip = { lanes: 2, cols: 1, x: [[0, 0, 1, 'flip']] };
    const runs = T.runAll(flip, [0, 0, 0], [0]);
    assert.deepEqual(runs.map((r) => r.to), [0, 1, 0]);
  });
});

describe('the Bebras 2018 "Railroad" idea', () => {
  /* A tree of flip switches spreads trains like counting in binary: with
     four tracks fed through two levels of flip switches, the arrivals of
     four trains visit every track once. */
  test('flip switches spread four trains over four tracks', () => {
    /* Track 1 -> (flip) -> 1 or 2; then track 1 -> (flip) -> 1 or 0, and
       track 2 -> (flip) -> 2 or 3. */
    const runs = T.runAll({ lanes: 4, cols: 2, x: [[0, 1, 2, 'flip'], [1, 1, 0, 'flip'], [1, 2, 3, 'flip']] }, [1, 1, 1, 1], [0, 0, 0]);
    assert.deepEqual(new Set(runs.map((r) => r.to)).size, 4);
  });
});

describe('solving', () => {
  test('a set puzzle has exactly one setting that works', () => {
    for (let i = 0; i < 10; i++) {
      const p = T.makeAt('m1', 'one', i);
      assert.equal(T.settings(p.lay, p.trains, 3).length, 1);
    }
  });

  test('fewest pulls is never more than trying every state one train at a time', () => {
    for (let i = 0; i < 6; i++) {
      const p = T.makeAt('m2', 'pulls', i);
      const best = T.minPulls(p.lay, p.trains, p.start);
      assert.equal(best.pulls, p.par);
      /* Following the plan sends every train home. */
      best.plan.forEach((s, k) => assert.equal(T.runOne(p.lay, p.trains[k].from, s.slice()).to, p.trains[k].to));
    }
  });

  test('the siding: Knuth\'s rule sorts any order without a 2-3-1, and no other', () => {
    assert.deepEqual(T.sidingSolve([2, 1, 3]), ['in', 'in', 'out', 'out', 'in', 'out']);
    assert.equal(T.sidingSolve([2, 3, 1]), null);
    /* How many orders of n cars can be sorted: the Catalan numbers. */
    const perms = (n) => (n === 1 ? [[1]] : perms(n - 1).flatMap((p) => Array.from({ length: n }, (_, i) => [...p.slice(0, i), n, ...p.slice(i)])));
    const sortable = (n) => perms(n).filter((p) => T.sidingSolve(p)).length;
    assert.deepEqual([3, 4, 5, 6].map(sortable), [5, 14, 42, 132]);
  });

  test('a set hint points at a switch the answer sets differently', () => {
    const p = T.makeAt('e3', 'hint', 3);
    const h = T.setHint(p, p.start);
    if (h) assert.notEqual(p.sol[h.k], p.start[h.k]);
    assert.equal(T.setHint(p, p.sol), null);
  });
});

describe('words', () => {
  test('trains and houses in both languages', () => {
    const giraffe = ANIMALS.find((a) => a.id === 'giraffe');
    assert.equal(trainName(giraffe, 'en'), 'the giraffe train');
    assert.equal(houseName(giraffe, 'es', true), 'La casa de la jirafa');
  });

  test('every key is in both languages', () => {
    assert.deepEqual(checkParity('trainstext', TRAINS_TEXT), []);
  });
});

describe('the shipped bank', () => {
  for (const level of T.LEVELS) {
    test(`${level} passes the checker`, () => {
      const bank = JSON.parse(fs.readFileSync(`data/logic/trains/${level}.json`, 'utf8'));
      assert.deepEqual(checkTrainsBank(bank), []);
    });
  }
});
