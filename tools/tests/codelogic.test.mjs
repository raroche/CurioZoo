/**
 * Tests for Crack the Code's rules, solver and puzzle maker
 * (assets/js/modules/codelogic.js). The whole bank is re-checked by
 * tools/logiccheck.mjs; these pin down the pieces it is built from.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as C from '../../assets/js/modules/codelogic.js';
import { CODE_TEXT } from '../../assets/js/modules/codetext.js';
import { checkCodeBank, checkParity } from '../logiccheck.mjs';

describe('feedback', () => {
  test('Bulls and Cows: 1234 against 4271 is one bull and two cows', () => {
    assert.deepEqual(C.aggFeedback([1, 2, 3, 4], [4, 2, 7, 1]), { h: 1, w: 2 });
  });

  test('per spot: home, wrong home, not here', () => {
    assert.deepEqual(C.spotFeedback([0, 1, 2], [0, 2, 3]), ['h', 'n', 'w']);
  });

  test('repeats follow the Wordle rule: exact first, then left to right', () => {
    /* The code has one 1. The guess has two; the home one takes it. */
    assert.deepEqual(C.spotFeedback([1, 1, 2, 3], [5, 1, 4, 4]), ['n', 'h', 'n', 'n']);
    /* Two 1s guessed, one in the code elsewhere: only the first is "wrong home". */
    assert.deepEqual(C.spotFeedback([1, 1, 2, 3], [0, 0, 1, 5]), ['w', 'n', 'n', 'n']);
    assert.deepEqual(C.aggFeedback([1, 1, 2, 2], [1, 2, 1, 1]), { h: 1, w: 2 });
  });

  test('mid feedback marks home under its slot and counts the rest', () => {
    assert.deepEqual(C.midFeedback([0, 1, 2, 3], [0, 2, 1, 5]), { marks: [true, false, false, false], w: 2 });
  });
});

describe('codes', () => {
  test('how many codes each board has', () => {
    assert.equal(C.allCodes(3, 4).length, 24);
    assert.equal(C.allCodes(3, 5).length, 60);
    assert.equal(C.allCodes(4, 6).length, 360);
    assert.equal(C.allCodes(4, 6, true).length, 1296);
    assert.equal(C.allCodes(4, 10).length, 5040);
  });
});

describe('the 682 lock', () => {
  const ch = C.chapter('m4');
  const p = { secret: [0, 4, 2], clues: [[6, 8, 2], [6, 1, 4], [2, 0, 6], [7, 3, 8], [3, 8, 0]] };
  const clues = C.cluesOf(ch, p);

  test('has exactly one answer, 042', () => {
    assert.deepEqual(C.solutions(ch, clues), [[0, 4, 2]]);
  });

  test('the step-by-step solver reaches it with counting, no "what if"', () => {
    const run = C.humanSolve(ch, clues);
    assert.equal(run.solved, true);
    assert.deepEqual(run.code, [0, 4, 2]);
    assert.equal(run.tier, 3);
  });

  test('three of its five clues are enough', () => {
    assert.equal(C.minimise(ch, clues, p.secret).length, 3);
  });
});

describe('the solver', () => {
  test('an Easy puzzle is solved with tier 1 and 2 ideas only', () => {
    const ch = C.chapter('e2');
    for (let i = 0; i < 25; i++) {
      const p = C.makePuzzle(ch, 'clue', ['test', i]);
      const run = C.humanSolve(ch, C.cluesOf(ch, p), { maxTier: 2 });
      assert.equal(run.solved, true, `puzzle ${i}`);
      assert.ok(run.tier <= 2);
    }
  });

  test('no step ever crosses out the real answer', () => {
    for (const id of ['e3', 'm1', 'm3', 'h1', 'h4']) {
      const ch = C.chapter(id);
      for (let i = 0; i < 8; i++) {
        const p = C.makePuzzle(ch, 'clue', ['safe', id, i]);
        for (const step of C.humanSolve(ch, C.cluesOf(ch, p)).steps) {
          assert.ok(!step.out.some(([s, x]) => p.secret[s] === x), `${id} ${i} ${step.rule}`);
        }
      }
    }
  });

  test('a Hard "what if" chapter really needs a "what if"', () => {
    const ch = C.chapter('h1');
    const p = C.makePuzzle(ch, 'clue', ['whatif', 1]);
    const clues = C.cluesOf(ch, p);
    assert.equal(C.humanSolve(ch, clues, { maxTier: 3 }).solved, false);
    assert.equal(C.humanSolve(ch, clues).solved, true);
  });
});

describe('making puzzles', () => {
  test('the same seed makes the same puzzle', () => {
    const ch = C.chapter('m2');
    assert.deepEqual(C.makePuzzle(ch, 'clue', ['seed', 7]), C.makePuzzle(ch, 'clue', ['seed', 7]));
  });

  test('every Clue Safe has one answer and no spare clue', () => {
    for (const id of ['e1', 'e4', 'm2', 'h2']) {
      const ch = C.chapter(id);
      for (let i = 0; i < 10; i++) {
        const p = C.makePuzzle(ch, 'clue', ['uniq', id, i]);
        const clues = C.cluesOf(ch, p);
        assert.equal(C.solutions(ch, clues).length, 1);
        assert.equal(C.minimise(ch, clues, p.secret).length, clues.length);
      }
    }
  });

  test('"the missing animal" chapter hides one animal from every clue', () => {
    const ch = C.chapter('e3');
    for (let i = 0; i < 10; i++) {
      const p = C.makePuzzle(ch, 'clue', ['missing', i]);
      const shown = new Set(p.clues.flat());
      assert.ok(p.secret.some((x) => !shown.has(x)));
    }
  });

  test('a "can\'t be" near miss breaks exactly one clue', () => {
    const ch = C.chapter('m3');
    let checked = 0;
    for (let i = 0; checked < 6 && i < 40; i++) {
      const p = C.makePuzzle(ch, 'could', ['near', i]);
      if (!p || p.yes) continue;
      const bad = C.cluesOf(ch, p).filter((c) => !C.fits(p.cand, [c], ch.fb));
      assert.equal(bad.length, 1);
      checked += 1;
    }
    assert.ok(checked > 0);
  });
});

describe('free crack', () => {
  const ch = C.chapter('e2');
  test('a guess that ignores a clue is noticed, and which clue', () => {
    const secret = [0, 1, 2];
    const clues = C.makeClues(ch, [[3, 4, 0]], secret);   // 3 and 4 not here, 0 wrong home
    assert.equal(C.ignoredClue(ch, clues, [3, 1, 2]), 0);
    assert.equal(C.ignoredClue(ch, clues, [1, 0, 2]), -1);
  });

  test('twins are not a legal guess unless the chapter allows them', () => {
    assert.equal(C.legalGuess(ch, [1, 1, 2]), false);
    assert.equal(C.legalGuess(C.chapter('h4'), [1, 1, 2, 2]), true);
  });
});

describe('hints', () => {
  const ch = C.chapter('e2');
  const p = C.makePuzzle(ch, 'clue', ['hint', 3]);

  test('the first hint is the first step', () => {
    const h = C.nextHint(ch, p);
    assert.equal(h.wrong, false);
    assert.equal(h.step.rule, C.humanSolve(ch, C.cluesOf(ch, p)).steps[0].rule);
  });

  test('a wrong animal in the answer row is pointed out first', () => {
    const wrong = (p.secret[0] + 1) % ch.k;
    const h = C.nextHint(ch, p, { answer: [wrong, null, null] });
    assert.equal(h.wrong, true);
    assert.equal(h.slot, 0);
  });
});

describe('stars', () => {
  test('a solve is never worth less than one star, and hints cap it there', () => {
    assert.equal(C.starsFor('clue', { hints: 0, tries: 1 }), 3);
    assert.equal(C.starsFor('clue', { hints: 0, tries: 2 }), 2);
    assert.equal(C.starsFor('clue', { hints: 2, tries: 1 }), 1);
    assert.equal(C.starsFor('free', { hints: 0, consistent: false }), 2);
    assert.equal(C.starsFor('could', { tries: 2 }), 1);
  });
});

describe('the shipped bank', () => {
  for (const level of C.LEVELS) {
    test(`${level} passes the checker`, () => {
      const bank = JSON.parse(fs.readFileSync(`data/logic/code/${level}.json`, 'utf8'));
      assert.deepEqual(checkCodeBank(bank), []);
    });
  }

  test('every sentence is in both languages with the same slots', () => {
    assert.deepEqual(checkParity('codetext', CODE_TEXT), []);
  });
});
