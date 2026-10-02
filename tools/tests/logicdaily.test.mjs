/**
 * Tests for today's and endless puzzles (rooms/logic/daily.js): a seed that
 * makes nothing must never leave a child on an empty screen.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { makeDaily, TRIES } from '../../assets/js/rooms/logic/daily.js';

const GAMES = ['code', 'truth', 'rule', 'bridges', 'trains', 'robot'];
const LEVELS = ['easy', 'medium', 'hard'];

describe('every seed gives a puzzle', () => {
  for (const g of GAMES) {
    test(`${g}: 120 endless seeds and 40 days at every level`, async () => {
      const mod = (await import(`../../assets/js/rooms/logic/${g}.js`)).default;
      for (const level of LEVELS) {
        const seeds = [
          ...Array.from({ length: 120 }, (_, i) => `endless-${i + 1}`),
          ...Array.from({ length: 40 }, (_, i) => new Date(Date.UTC(2026, 9, 1 + i)).toISOString().slice(0, 10))
        ];
        for (const iso of seeds) {
          const made = await makeDaily(mod, level, iso);
          assert.ok(made && made.puzzle, `${g} ${level} ${iso}`);
          assert.equal(made.puzzle.id, `daily-${iso}`);
        }
      }
    });
  }

  test('the seeds that failed before now give a puzzle, and the same one each time', async () => {
    const cases = { truth: [8, 13, 30], bridges: [7, 13, 14, 27, 29], trains: [5, 9, 27] };
    for (const [g, ns] of Object.entries(cases)) {
      const mod = (await import(`../../assets/js/rooms/logic/${g}.js`)).default;
      for (const n of ns) {
        const a = await makeDaily(mod, 'hard', `endless-${n}`);
        const b = await makeDaily(mod, 'hard', `endless-${n}`);
        assert.ok(a, `${g} ${n}`);
        assert.deepEqual(a, b);
      }
    }
    const truth = (await import('../../assets/js/rooms/logic/truth.js')).default;
    assert.ok(await makeDaily(truth, 'hard', '2026-10-02'));
  });
});

describe('when the maker never succeeds', () => {
  const bank = { chapters: [{ id: 'x1', puzzles: [{ id: 'x1-01', teach: true }, { id: 'x1-02' }] }] };

  test('a puzzle from the bank stands in, the same one for the same seed', async () => {
    let calls = 0;
    const mod = { id: 'fake', dailyPuzzle: () => { calls += 1; return null; }, bank: async () => bank };
    const a = await makeDaily(mod, 'easy', 'endless-3');
    assert.equal(calls, TRIES);
    assert.equal(a.chapterId, 'x1');
    assert.equal(a.puzzle.id, 'daily-endless-3');
    assert.equal(a.puzzle.teach, false);
    assert.deepEqual(await makeDaily(mod, 'easy', 'endless-3'), a);
  });

  test('a maker that throws is the same as one that makes nothing', async () => {
    const mod = { id: 'fake', dailyPuzzle: () => { throw new Error('boom'); }, bank: async () => bank };
    const quiet = console.error;
    console.error = () => {};
    try { assert.ok(await makeDaily(mod, 'easy', 'x')); } finally { console.error = quiet; }
  });

  test('with no bank either, the answer is null, not a crash', async () => {
    const mod = { id: 'fake', dailyPuzzle: () => null, bank: async () => { throw new Error('offline'); } };
    const quiet = console.error;
    console.error = () => {};
    try { assert.equal(await makeDaily(mod, 'easy', 'x'), null); } finally { console.error = quiet; }
  });
});
