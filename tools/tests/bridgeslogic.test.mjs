/**
 * Tests for Zoo Bridges (assets/js/modules/bridgeslogic.js).
 * The solver is the uniqueness proof, so these test it against brute force.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as B from '../../assets/js/modules/bridgeslogic.js';
import { BRIDGES_TEXT, islandName } from '../../assets/js/modules/bridgestext.js';
import { ANIMALS } from '../../assets/js/modules/zooart.js';
import { rngFor } from '../../assets/js/modules/logicrng.js';
import { checkBridgesBank, checkParity } from '../logiccheck.mjs';

describe('the grid', () => {
  test('a grid string round-trips', () => {
    const g = '5x5:2a3a2e1i2a3a2';
    const p = B.parse(g);
    assert.equal(p.isl.length, 7);
    assert.equal(B.encode(p.w, p.h, p.isl), g);
  });

  test('routes join islands that see each other, and crossings are found', () => {
    /* A plus shape: left-right and top-bottom routes cross in the middle. */
    const p = B.parse('3x3:a1a1a1a1a');
    const G = B.graph(p, 2);
    assert.equal(G.edges.length, 2);
    assert.deepEqual(G.cross[0], [1]);
  });

  test('turning or flipping a grid gives the same canonical form', () => {
    const g = '4x3:2c2a1e';
    const p = B.parse(g);
    const flipped = B.encode(p.w, p.h, p.isl.map((i) => ({ ...i, x: p.w - 1 - i.x })).sort((a, b) => a.y - b.y || a.x - b.x));
    assert.equal(B.canonical(g), B.canonical(flipped));
  });
});

describe('techniques', () => {
  test('a 4 in a corner with two neighbours: two bridges to each (just enough)', () => {
    const p = B.parse('3x3:4a2c2b');
    const run = B.humanSolve(p, 2);
    assert.equal(run.solved, true);
    assert.ok(run.tags.includes('justEnough'));
  });

  test('two 1s cannot join each other: they would be trapped', () => {
    /* 1 . 1 on top, 2 . 2 below. Joining the two 1s closes them off, so each
       1 must go down, and the 2s join each other. */
    const p = B.parse('3x3:1a1c2a2');
    const run = B.humanSolve(p, 2);
    assert.equal(run.solved, true);
    assert.ok(run.tags.includes('pairIsolation'));
    assert.equal(B.countSolutions(p, 2, 3), 1);
  });

  test('every solved puzzle is a real solution', () => {
    for (const id of ['e3', 'e8', 'm1', 'm5']) {
      const q = B.makeAt(id, 'real', 1);
      const p = B.parse(q.g);
      const run = B.humanSolve(p, q.maxb);
      assert.equal(B.isSolution(p, B.graph(p, q.maxb), run.vals), true, id);
    }
  });
});

describe('the solver is the uniqueness proof', () => {
  test('whenever it finishes a small grid, brute force finds exactly one answer', () => {
    let checked = 0;
    for (const id of ['e1', 'e2', 'e4', 'e5', 'e8', 'm1']) {
      const ch = B.chapter(id);
      for (let j = 0; j < 12; j++) {
        const q = B.makePuzzle(ch, rngFor('brute', id, j), { tries: 40 });
        if (!q) continue;
        assert.equal(B.countSolutions(B.parse(q.g), q.maxb, 2), 1, `${id} ${q.g}`);
        checked += 1;
      }
    }
    assert.ok(checked > 40);
  });

  test('a grid with two answers is not finished by the solver', () => {
    /* Four 3s in a square: one side of each corner takes two bridges, and
       it can be the rows or the columns. */
    const p = B.parse('3x3:3a3c3a3');
    assert.ok(B.countSolutions(p, 2, 3) >= 2);
    assert.equal(B.humanSolve(p, 2).solved, false);
  });
});

describe('making puzzles', () => {
  test('the same seed makes the same puzzle', () => {
    assert.deepEqual(B.makeAt('m3', 's', 2), B.makeAt('m3', 's', 2));
  });

  test('a chapter that teaches a technique needs it', () => {
    for (let i = 0; i < 5; i++) {
      const q = B.makeAt('m1', 'need', i);
      if (!q) continue;
      assert.ok(B.humanSolve(B.parse(q.g), q.maxb).tags.includes('pairIsolation'));
    }
  });
});

describe('words', () => {
  test('island names in both languages', () => {
    const lion = ANIMALS.find((a) => a.id === 'lion');
    const giraffe = ANIMALS.find((a) => a.id === 'giraffe');
    assert.equal(islandName(lion, 'en'), 'the lion island');
    assert.equal(islandName(lion, 'es'), 'la isla del león');
    assert.equal(islandName(giraffe, 'es'), 'la isla de la jirafa');
  });

  test('every key is in both languages', () => {
    assert.deepEqual(checkParity('bridgestext', BRIDGES_TEXT), []);
  });
});

describe('the shipped bank', () => {
  for (const level of B.LEVELS) {
    test(`${level} passes the checker`, () => {
      const bank = JSON.parse(fs.readFileSync(`data/logic/bridges/${level}.json`, 'utf8'));
      assert.deepEqual(checkBridgesBank(bank), []);
    });
  }
});
