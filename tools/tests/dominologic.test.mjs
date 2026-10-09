/**
 * Tests for Domino Zoo (modules/dominologic.js): Whitehead's 1½ rule, the
 * machine run, and one-answer puzzles.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import * as D from '../../assets/js/modules/dominologic.js';

const run = (rows, parts) => D.simulate({ rows, parts });

describe('the 1½ rule', () => {
  test('2 → 3, 3 → 4, 4 → 6 topple; 2 → 4 and 3 → 6 do not', () => {
    assert.ok(D.topples(2, 3) && D.topples(3, 4) && D.topples(4, 6));
    assert.ok(!D.topples(2, 4) && !D.topples(3, 6));
  });
  test('a big domino always knocks over a smaller one', () => {
    for (const a of D.SIZES) for (const b of D.SIZES) if (b <= a) assert.ok(D.topples(a, b));
  });
});

describe('running a machine', () => {
  const top = [{ t: 'dom', r: 0, c: 0, s: 3 }, { t: 'dom', r: 0, c: 1, s: 3 }, { t: 'ball', r: 0, c: 2 }];
  test('dominoes, a ball, a ramp and a bell', () => {
    const sim = run(2, [...top, { t: 'ramp', r: 1, c: 5, d: -1 }, { t: 'bell', r: 1, c: 3 }]);
    assert.equal(sim.rang, true);
  });
  test('a ramp the wrong way sends the ball to the wall', () => {
    const sim = run(2, [...top, { t: 'ramp', r: 1, c: 5, d: 1 }, { t: 'bell', r: 1, c: 3 }]);
    assert.equal(sim.rang, false);
    assert.equal(sim.stop.why, 'wall');
    assert.equal(sim.last, 'ball@0,2');
  });
  test('a domino too tall stops the chain', () => {
    const sim = run(2, [{ t: 'dom', r: 0, c: 0, s: 2 }, { t: 'dom', r: 0, c: 1, s: 4 }, { t: 'ball', r: 0, c: 2 }, { t: 'bell', r: 1, c: 5 }]);
    assert.equal(sim.stop.why, 'tooBig');
  });
  test('a seesaw reaches a low bell; a pulley reaches a high one', () => {
    const low = run(2, [...top, { t: 'seesaw', r: 1, c: 3 }, { t: 'bell', r: 1, c: 3, hang: 1 }]);
    const high = run(2, [...top, { t: 'seesaw', r: 1, c: 3 }, { t: 'bell', r: 1, c: 3, hang: 2 }]);
    const pulley = run(2, [...top, { t: 'pulley', r: 1, c: 3 }, { t: 'bell', r: 1, c: 3, hang: 2 }]);
    assert.equal(low.rang, true);
    assert.equal(high.stop.why, 'tooHigh');
    assert.equal(pulley.rang, true);
  });
  test('a fan blows the paper boat to the bell, but only facing the right way', () => {
    const parts = (d) => [{ t: 'ball', r: 0, c: 0 }, { t: 'ramp', r: 1, c: 5, d: -1 }, { t: 'dom', r: 1, c: 4, s: 3 }, { t: 'fan', r: 1, c: 3, d },
      { t: 'pond', r: 1, c: 2 }, { t: 'pond', r: 1, c: 1 }, { t: 'boat', r: 1, c: 2 }, { t: 'bell', r: 1, c: 0 }];
    assert.equal(run(2, parts(-1)).rang, true);
    assert.equal(run(2, parts(1)).stop.why, 'windWeak');
  });
});

describe('making machine puzzles', () => {
  test('every chapter makes sound puzzles, the same from the same seed', () => {
    for (const level of D.LEVELS) {
      for (const c of D.CHAPTERS[level]) {
        for (let i = 0; i < 12; i++) {
          const p = D.makeAt(c.id, i, 'test');
          assert.ok(p, `${c.id} ${i}`);
          assert.deepEqual(D.makeAt(c.id, i, 'test'), p);
          assert.deepEqual(D.problems(p), [], `${c.id} ${i}: ${JSON.stringify(p)}`);
        }
      }
    }
  });
  test('a build puzzle has exactly one way to ring the bell, using every gap', () => {
    for (const id of ['e1', 'm1', 'm3', 'h2', 'h3']) {
      for (let i = 0; i < 6; i++) {
        const p = D.makeAt(id, i, 'one');
        const sols = D.solutions(p, 3);
        assert.equal(sols.length, 1, `${id} ${i}`);
        assert.ok(sols[0].every((x) => x));
        assert.equal(D.simulate(p).rang, false);
      }
    }
  });
});
