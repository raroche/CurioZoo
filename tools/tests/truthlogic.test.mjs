/**
 * Tests for Truth Island (assets/js/modules/truthlogic.js and truthtext.js).
 * The whole bank is re-checked by tools/logiccheck.mjs; these pin down the
 * pieces it is built from.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from '../../assets/js/modules/truthlogic.js';
import { TRUTH_TEXT, sentence } from '../../assets/js/modules/truthtext.js';
import { checkTruthBank, checkParity } from '../logiccheck.mjs';
import { rngFor } from '../../assets/js/modules/logicrng.js';

const puzzle = (cast, says, extra = {}) => ({ cast, says, scene: {}, ...extra });

describe('who may say what', () => {
  test('a Sun says true things, a Moon false ones, a Cloud anything', () => {
    assert.equal(T.allows('sun', true), true);
    assert.equal(T.allows('sun', false), false);
    assert.equal(T.allows('moon', false), true);
    assert.equal(T.allows('cloud', false), true);
  });

  test('"We are both Moons": the classic has one answer', () => {
    /* A Sun cannot say it (it would be a lie), so A is a Moon; then it is
       false, so B is a Sun. */
    const p = puzzle(['owl', 'fox'], [[0, { op: 'count', cmp: 'eq', kind: 'moon', n: 2 }]]);
    assert.deepEqual(T.solutions(p), [['moon', 'sun']]);
  });

  test('accusations alone never have one answer: flipping everyone also works', () => {
    const p = puzzle(['owl', 'fox'], [[0, { op: 'is', who: 1, kind: 'moon' }], [1, { op: 'is', who: 0, kind: 'moon' }]]);
    assert.equal(T.solutions(p).length, 2);
  });

  test('a picture sentence is checked against the picture', () => {
    const p = puzzle(['owl'], [[0, { op: 'fact', f: { t: 'count', obj: 'apple', n: 3 } }]], { scene: { c: { apple: 2 } } });
    assert.deepEqual(T.solutions(p), [['moon']]);
  });

  test('with the Cloud animal there is exactly one of each kind', () => {
    const worlds = T.allWorlds({ cast: ['owl', 'fox', 'cat'], cloud: true });
    assert.equal(worlds.length, 6);
  });
});

describe('the solver', () => {
  test('"same kind" forces the other animal either way', () => {
    /* Owl: "Fox and I are the same kind." True if both Sun, false if Owl is
       a Moon and Fox a Sun: Fox is a Sun both ways. */
    const p = puzzle(['owl', 'fox'], [
      [0, { op: 'same', a: 0, b: 1 }],
      [1, { op: 'is', who: 0, kind: 'moon' }]
    ]);
    const run = T.humanSolve(p);
    assert.equal(run.solved, true);
    assert.equal(run.steps[0].kind, 'both');
    assert.deepEqual(run.steps[0].keep, ['sun']);
  });

  test('Medium "pencil" chapters really need a suppose, and Easy never does', () => {
    for (let i = 0; i < 10; i++) {
      const m = T.makeAt('m4', 'test', i);
      assert.equal(T.humanSolve(m, { maxDepth: 0 }).solved, false);
      assert.equal(T.humanSolve(m).solved, true);
      const e = T.makeAt('e4', 'test', i);
      assert.equal(T.humanSolve(e, { maxDepth: 0 }).solved, true);
    }
  });

  test('no step ever rules out the real answer', () => {
    for (const id of ['e2', 'm1', 'm5', 'h1', 'h2', 'h3', 'h4', 'h5']) {
      for (let i = 0; i < 6; i++) {
        const p = T.makeAt(id, 'safe', i);
        if (!p) continue;   // a seed may come up empty; the builder just tries the next
        for (const s of T.humanSolve(p).steps) assert.ok(s.keep.includes(p.sol[s.who]), `${id} ${i} ${s.kind}`);
      }
    }
  });
});

describe('hints', () => {
  test('a wrong token is pointed out first', () => {
    const p = T.makeAt('m2', 'hint', 1);
    const wrong = p.sol.map((k) => (k === 'sun' ? 'moon' : 'sun'));
    const h = T.nextHint(p, [wrong[0], null, null].slice(0, p.cast.length));
    assert.equal(h.wrong, true);
    assert.equal(h.who, 0);
  });

  test('following the hints always finishes the puzzle', () => {
    for (const id of ['e3', 'm4', 'h3', 'h5']) {
      let p = null;
      for (let seed = 2; !p; seed++) p = T.makeAt(id, 'walk', seed);
      const tokens = p.cast.map((_, i) => (i === p.badge ? 'sun' : null));
      const ruled = p.cast.map(() => null);
      for (let guard = 0; guard < 30 && tokens.some((k) => !k); guard++) {
        const h = T.nextHint(p, tokens, ruled);
        assert.ok(h && !h.wrong);
        if (h.step.keep.length === 1) tokens[h.step.who] = h.step.keep[0];
        else ruled[h.step.who] = h.step.keep;
      }
      assert.deepEqual(tokens, p.sol, id);
    }
  });
});

describe('making puzzles', () => {
  test('the same seed makes the same puzzle', () => {
    const ch = T.chapter('h2');
    assert.deepEqual(T.makePuzzle(ch, rngFor('t', 1)), T.makePuzzle(ch, rngFor('t', 1)));
  });

  test('no animal ever says something anyone could say', () => {
    for (let i = 0; i < 10; i++) {
      const p = T.makeAt('h4', 'empty', i);
      if (!p) continue;
      for (const [who, s] of p.says) {
        const any = T.allWorlds(p).every((w) => T.allows(w[who], T.evaluate(s, w, p.scene)));
        assert.equal(any, false);
      }
    }
  });
});

describe('words', () => {
  test('"or" is always "or both", and Spanish says "u" before an o-sound', () => {
    const s = { op: 'or', args: [{ op: 'is', who: 1, kind: 'sun' }, { op: 'is', who: 2, kind: 'moon' }] };
    assert.match(sentence(s, 0, ['cat', 'fox', 'bear'], 'en'), /\(or both\)\.$/);
    assert.equal(sentence(s, 0, ['cat', 'fox', 'bear'], 'es'), 'Zorro es un animal Sol, u Oso es un animal Luna (o los dos).');
  });

  test('"I" for the speaker, a name for anyone else', () => {
    assert.equal(sentence({ op: 'is', who: 0, kind: 'moon' }, 0, ['owl'], 'en'), 'I am a Moon animal.');
    assert.equal(sentence({ op: 'same', a: 1, b: 0 }, 0, ['owl', 'frog'], 'es'), 'Rana y yo somos del mismo tipo.');
  });

  test('every key is in both languages', () => {
    assert.deepEqual(checkParity('truthtext', TRUTH_TEXT), []);
  });
});

describe('the shipped bank', () => {
  for (const level of T.LEVELS) {
    test(`${level} passes the checker`, () => {
      const bank = JSON.parse(fs.readFileSync(`data/logic/truth/${level}.json`, 'utf8'));
      assert.deepEqual(checkTruthBank(bank), []);
    });
  }
});
