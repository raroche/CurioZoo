/**
 * Tests for Find the Rule (assets/js/modules/rulelogic.js and ruletext.js).
 * The whole bank is re-checked by tools/logiccheck.mjs.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as R from '../../assets/js/modules/rulelogic.js';
import { RULE_TEXT, ruleSentence } from '../../assets/js/modules/ruletext.js';
import { checkRuleBank, checkParity } from '../logiccheck.mjs';

const setup = { hat: ['none', 'cap', 'crown'], pattern: ['plain', 'stripes', 'dots'], buttons: [1, 2, 3] };
const has = (a, v) => ({ op: 'has', a, v });

describe('rules', () => {
  test('a creature is one value per attribute, the rest fixed', () => {
    const U = R.universe(setup);
    assert.equal(U.length, 27);
    assert.deepEqual(U[0], ['cat', 'none', 'plain', 1, 'big', 'none']);
  });

  test('"cap or crown" is the same rule as "wears a hat"', () => {
    const U = R.universe(setup);
    const a = { op: 'or', args: [has('hat', 'cap'), has('hat', 'crown')] };
    const b = { op: 'not', x: has('hat', 'none') };
    assert.equal(R.sameRule(U, a, b), true);
  });

  test('"2 or more buttons" is "not exactly 1 button"', () => {
    const U = R.universe(setup);
    assert.equal(R.sameRule(U, { op: 'ge', a: 'buttons', n: 2 }, { op: 'not', x: has('buttons', 1) }), true);
  });

  test('"one or the other, not both"', () => {
    const r = { op: 'xor', args: [has('hat', 'cap'), has('pattern', 'dots')] };
    assert.equal(R.evaluate(r, ['cat', 'cap', 'dots', 1, 'big', 'none']), false);
    assert.equal(R.evaluate(r, ['cat', 'cap', 'plain', 1, 'big', 'none']), true);
  });

  test('pairs compare the two creatures', () => {
    const a = ['cat', 'cap', 'plain', 3, 'big', 'none'];
    const b = ['owl', 'cap', 'dots', 1, 'small', 'none'];
    assert.equal(R.evaluate({ op: 'same', a: 'hat' }, [a, b]), true);
    assert.equal(R.evaluate({ op: 'more', a: 'buttons' }, [a, b]), true);
    assert.equal(R.evaluate({ op: 'bigger' }, [a, b]), true);
  });
});

describe('making puzzles', () => {
  test('the same seed makes the same puzzle', () => {
    assert.deepEqual(R.makeAt('m2', 'seed', 4), R.makeAt('m2', 'seed', 4));
  });

  test('the opening evidence agrees with the rule and leaves testing to do', () => {
    for (const id of ['e1', 'e3', 'm1', 'm4', 'h1', 'h3']) {
      const p = R.makeAt(id, 'ev', 1);
      const U = R.universe(p.setup, R.chapter(id).pair);
      for (const [c, pass] of p.evidence) assert.equal(R.evaluate(p.rule, c), pass);
      const ideas = R.alive(R.hypotheses(p.setup, R.chapter(id).pair), U, p.evidence, [R.extKey(p.rule, U)]);
      assert.ok(ideas.length >= 2, id);
    }
  });

  test('a trap: every passer shown shares a second thing that does not matter', () => {
    const p = R.makeAt('m4', 'trap', 2);
    const passers = p.evidence.filter(([, x]) => x).map(([c]) => c);
    const shared = R.ORDER.filter((a, i) => p.setup[a] && a !== p.rule.a && passers.every((c) => c[i] === passers[0][i]));
    assert.ok(shared.length >= 1);
  });

  test('sorting six: a nearly-right rule cannot pass by luck', () => {
    for (let i = 0; i < 6; i++) {
      const p = R.makeAt('e2', 'proof', i);
      const U = R.universe(p.setup);
      const at = R.indexer(U);
      const target = R.extKey(p.rule, U);
      const ideas = R.alive(R.hypotheses(p.setup), U, p.evidence, [target]);
      for (const k of ideas) {
        if (k === target) continue;
        assert.ok(p.proof.some((c) => k[at(c)] !== target[at(c)]));
      }
    }
  });
});

describe('playing', () => {
  test('a wrong rule gets a counterexample where the two disagree', () => {
    const U = R.universe(setup);
    const rule = has('hat', 'crown');
    const guess = has('pattern', 'dots');
    const c = R.counterexample(U, rule, guess);
    assert.notEqual(R.evaluate(rule, c), R.evaluate(guess, c));
  });

  test('the best test splits the ideas still standing', () => {
    const U = R.universe(setup);
    const ideas = [has('hat', 'cap'), has('hat', 'crown')].map((r) => R.extKey(r, U));
    const best = R.bestTest(U, ideas, U);
    assert.equal(best.score, 1);
  });

  test('stars: solved, within par, no hint and first try', () => {
    assert.equal(R.starsFor({ tests: 2, par: 3, hints: 0, tries: 1 }), 3);
    assert.equal(R.starsFor({ tests: 5, par: 3, hints: 0, tries: 1 }), 2);
    assert.equal(R.starsFor({ tests: 5, par: 3, hints: 1, tries: 2 }), 1);
  });
});

describe('words', () => {
  test('a rule reads as a sentence in both languages', () => {
    const r = { op: 'and', args: [has('size', 'small'), { op: 'not', x: has('hat', 'bow') }] };
    assert.equal(ruleSentence(r, 'en'), 'A creature passes if it is small and does not wear a bow.');
    assert.equal(ruleSentence(r, 'es'), 'Una criatura pasa si es pequeña y no lleva lazo.');
    assert.equal(ruleSentence({ op: 'diff', a: 'ears' }, 'en', true), 'A pair passes if they are different animals.');
  });

  test('every key is in both languages', () => {
    assert.deepEqual(checkParity('ruletext', RULE_TEXT), []);
  });
});

describe('the shipped bank', () => {
  for (const level of R.LEVELS) {
    test(`${level} passes the checker`, () => {
      const bank = JSON.parse(fs.readFileSync(`data/logic/rule/${level}.json`, 'utf8'));
      assert.deepEqual(checkRuleBank(bank), []);
    });
  }
});
