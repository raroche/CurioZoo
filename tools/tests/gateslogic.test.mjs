/**
 * Tests for Gate Factory (assets/js/modules/gateslogic.js).
 *
 * The whole bank is re-checked by tools/logiccheck.mjs; these pin down what
 * each door does and that every puzzle has exactly one answer.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as G from '../../assets/js/modules/gateslogic.js';
import { GATES_TEXT } from '../../assets/js/modules/gatestext.js';
import { rngFor } from '../../assets/js/modules/logicrng.js';
import { checkGatesBank, checkParity } from '../logiccheck.mjs';

describe('the doors', () => {
  test('AND, OR, NOT and ONLY ONE', () => {
    const table = (op) => [[0, 0], [0, 1], [1, 0], [1, 1]].map(([a, b]) => G.apply(op, a, b)).join('');
    assert.equal(table('and'), '0001');
    assert.equal(table('or'), '0111');
    assert.equal(table('xor'), '0110');
    assert.equal(G.apply('not', 0), 1);
    assert.equal(G.apply('not', 1), 0);
  });

  test('a machine runs left to right: NOT (switch 1 AND switch 2)', () => {
    const m = { k: 2, gates: [['and', 0, 1], ['not', 2]], lamps: [3] };
    assert.deepEqual([0, 1, 2, 3].map((bits) => G.lampsOf(m, G.bitsOf(2, bits))[0]), [1, 1, 1, 0]);
  });
});

describe('one answer', () => {
  const m = { k: 2, gates: [['and', 0, 1]], lamps: [2] };

  test('"light it" asks for a lamp only one setting gives', () => {
    assert.deepEqual(G.settingsFor(m, [1]), [3]);
    assert.equal(G.settingsFor(m, [0]).length, 3);
  });

  test('"which door" keeps only the doors that fit every try', () => {
    /* Try: both on → lit. AND and OR both fit; add "one on → dark" and only AND does. */
    assert.deepEqual(G.doorsThatFit(m, 0, [[3, [1]]], ['and', 'or']), ['and', 'or']);
    assert.deepEqual(G.doorsThatFit(m, 0, [[3, [1]], [1, [0]]], ['and', 'or']), ['and']);
  });

  for (const id of ['e1', 'e2', 'm1', 'm2', 'h1', 'h2', 'h3']) {
    test(`${id}: made puzzles have exactly one answer`, () => {
      const ch = G.chapter(id);
      for (let j = 0; j < 12; j++) {
        const mode = G.modeAt(ch, j);
        const p = G.makePuzzle(ch, mode, rngFor('gates', 'test', id, j));
        assert.ok(p, `${id} ${j}`);
        assert.ok(G.joined(p) && G.lively(p));
        if (mode === 'light') assert.equal(G.settingsFor(p, p.want).length, 1);
        if (mode === 'which') assert.equal(G.doorsThatFit(p, p.hide, p.rows, ch.options).length, 1);
      }
    });
  }
});

describe('stars', () => {
  test('right first time is ★★★; a light-it second power-on ★★; the answer shown ★', () => {
    assert.equal(G.starsFor('predict', { tries: 1 }), 3);
    assert.equal(G.starsFor('predict', { tries: 2 }), 1);
    assert.equal(G.starsFor('light', { tries: 2 }), 2);
    assert.equal(G.starsFor('which', { tries: 1, shown: true }), 1);
  });
});

describe('words', () => {
  test('English and Spanish match', () => {
    assert.deepEqual(checkParity('gatestext', GATES_TEXT), []);
  });

  test('every door, chapter and need has words', () => {
    for (const op of G.OPS) {
      for (const k of [`op.${op}`, `door.${op}`, `rule.${op}`, `need.${op}.0`, `need.${op}.1`]) assert.ok(GATES_TEXT.en[k], k);
    }
    for (const level of G.LEVELS) for (const ch of G.CHAPTERS[level]) assert.ok(GATES_TEXT.en[`ch.${ch.id}`], ch.id);
  });
});

describe('the shipped bank', () => {
  for (const level of G.LEVELS) {
    test(`${level} passes the checker`, () => {
      const bank = JSON.parse(fs.readFileSync(`data/logic/gates/${level}.json`, 'utf8'));
      assert.deepEqual(checkGatesBank(bank), []);
    });
  }
});
