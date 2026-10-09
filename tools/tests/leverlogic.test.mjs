/**
 * Tests for Lift the Elephant's rules (modules/leverlogic.js): weight ×
 * steps, Siegler's item types, and the honest plank weight.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import * as V from '../../assets/js/modules/leverlogic.js';
import { LEVER_TEXT } from '../../assets/js/modules/levertext.js';

const one = (a, n, peg) => Array.from({ length: n }, () => ({ a, w: V.animal(a).w, peg }));
const plank = (left, right, extra = {}) => ({ kind: 'tilt', pegs: 6, left, right, ...extra });

describe('which side goes down', () => {
  test('more weight on the same peg goes down', () => assert.equal(V.tilt(plank(one('mouse', 2, 2), one('mouse', 1, 2))), 'L'));
  test('the same weight further out goes down', () => assert.equal(V.tilt(plank(one('mouse', 1, 1), one('mouse', 1, 4))), 'R'));
  test('equal weight × steps stays level', () => assert.equal(V.tilt(plank(one('mouse', 2, 3), one('mouse', 3, 2))), 'level'));
  test('one mouse far out lifts an elephant close in', () => {
    assert.equal(V.tilt(plank(one('mouse', 1, 6), [{ a: 'elephant', w: 5, peg: 1 }])), 'L');
  });
  test('adding weight and steps can be wrong; multiplying is not', () => {
    const p = plank(one('mouse', 1, 6), one('mouse', 3, 2));
    assert.equal(V.tilt(p), 'level');
    assert.equal(V.addRule(p), 'L');
  });
  test('an off-centre plank adds its own weight × steps on its long side', () => {
    const p = plank(one('mouse', 1, 3), [], { plank: { w: 2, side: 'R', steps: 1 } });
    assert.equal(V.pushR(p), 2);
    assert.equal(V.tilt(p), 'L');
  });
});

describe("Siegler's item types", () => {
  test('are named the way the research names them', () => {
    assert.equal(V.itemType(plank(one('mouse', 2, 2), one('mouse', 1, 2))), 'weight');
    assert.equal(V.itemType(plank(one('mouse', 1, 1), one('mouse', 1, 4))), 'distance');
    assert.equal(V.itemType(plank(one('mouse', 3, 2), one('mouse', 1, 4))), 'conflict-weight');
    assert.equal(V.itemType(plank(one('mouse', 2, 1), one('mouse', 1, 3))), 'conflict-distance');
    assert.equal(V.itemType(plank(one('mouse', 2, 3), one('mouse', 3, 2))), 'conflict-balance');
  });
});

describe('placing animals', () => {
  test('the hero puzzle has one answer: peg 6', () => {
    const p = { kind: 'build', goal: 'lift', pegs: 6, side: 'L', left: [], right: [{ a: 'elephant', w: 5, peg: 1 }], tray: ['mouse'] };
    assert.deepEqual(V.solutions(p), ['mouse@6']);
  });
  test('two rabbits balance an elephant only on pegs 2 and 4 when 1 and 5 are covered', () => {
    const p = { kind: 'build', goal: 'level', pegs: 6, side: 'L', left: [], right: [{ a: 'elephant', w: 4, peg: 3 }], tray: ['rabbit', 'rabbit'], covered: [1, 5] };
    assert.deepEqual(V.solutions(p), ['rabbit@2,rabbit@4']);
  });
});

describe('making planks', () => {
  test('every chapter makes sound planks, the same from the same seed', () => {
    for (const level of V.LEVELS) {
      for (const c of V.CHAPTERS[level]) {
        for (let i = 0; i < 20; i++) {
          const p = V.makeAt(c.id, i, 'test');
          if (!p) continue;
          assert.deepEqual(V.makeAt(c.id, i, 'test'), p);
          assert.deepEqual(V.problems(p), [], `${c.id} ${i}: ${JSON.stringify(p)}`);
        }
      }
    }
  });
  test('the far end moves further: rise = push × near ÷ far', () => {
    assert.equal(V.riseOf({ down: 6, left: [{ peg: 6 }], right: [{ peg: 2 }] }), 2);
  });
  test('every animal has a name in both languages', () => {
    for (const a of [...V.SMALL, ...V.BIG]) assert.ok(LEVER_TEXT.en[`a.${a.id}`] && LEVER_TEXT.es[`a.${a.id}`], a.id);
  });
});
