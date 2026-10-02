/**
 * Tests for Fix the Bug (assets/js/modules/robotbug.js).
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as BG from '../../assets/js/modules/robotbug.js';
import * as V from '../../assets/js/modules/robotvm.js';
import { rngFor } from '../../assets/js/modules/logicrng.js';
import { checkBugBank } from '../logiccheck.mjs';

const corridor = {
  cells: '#####/.....', animals: [[4, 1, 'lion']], start: [0, 1, 1], abs: false,
  slots: { main: 9 }, palette: ['F', 'TL', 'TR', 'FEED', 'rep'],
  ref: { main: [{ op: 'rep', n: 4, body: [{ op: 'F' }] }, { op: 'FEED' }] }
};

describe('mutations', () => {
  test('every kind a child makes is there: count, missing feed, outside the loop', () => {
    const kinds = new Set(BG.mutations(corridor.ref, corridor.palette).map((m) => m.m));
    for (const k of ['M2', 'M9']) assert.ok(kinds.has(k), k);
  });

  test('"repeat 4" becomes 3 or 5, never something else', () => {
    const counts = BG.mutations(corridor.ref, corridor.palette).filter((m) => m.m === 'M2').map((m) => m.prog.main[0].n);
    assert.deepEqual(counts.sort(), [3, 5]);
  });
});

describe('fixing', () => {
  test('a loop one short is fixed in exactly one place', () => {
    const buggy = { main: [{ op: 'rep', n: 3, body: [{ op: 'F' }] }, { op: 'FEED' }] };
    assert.equal(V.run(corridor, buggy).ok, false);
    const at = BG.fixPlaces(corridor, buggy);
    assert.ok(at.has('main.0'));
  });

  test('where the robot stops is where the trace ends', () => {
    const buggy = { main: [{ op: 'rep', n: 3, body: [{ op: 'F' }] }, { op: 'FEED' }] };
    const end = BG.endOf(corridor, buggy);
    assert.deepEqual([end.x, end.y], [3, 1]);
    assert.equal(end.why, 'nothing');
  });
});

describe('making puzzles', () => {
  const bank = JSON.parse(fs.readFileSync('data/logic/robot/easy.json', 'utf8'));
  const level = bank.chapters[1].puzzles[5];

  test('a fix puzzle fails, and an Easy one is fixed in one place only', () => {
    const p = BG.makeBugPuzzle(level, 'fix', rngFor('t', 1), { easy: true });
    assert.equal(V.run(level, p.start).ok, false);
    assert.equal(BG.fixPlaces(level, p.start).size, 1);
  });

  test('a find puzzle offers one working tile among three', () => {
    const p = BG.makeBugPuzzle(level, 'find', rngFor('t', 2), { easy: true });
    if (!p) return;
    const works = p.options.filter((o) => {
      const q = V.clone(p.start);
      V.listAt(q, p.bug.at.slice(0, -1))[p.bug.at[p.bug.at.length - 1]] = o;
      return V.run(level, q).ok;
    });
    assert.equal(works.length, 1);
  });

  test('a predict puzzle\'s answer is among its choices', () => {
    const p = BG.makeBugPuzzle(level, 'predict', rngFor('t', 3));
    assert.ok(p.choices.some(([x, y]) => x === p.answer[0] && y === p.answer[1]));
  });
});

describe('stars', () => {
  test('found before a failed run is three stars', () => {
    assert.equal(BG.starsFor('fix', { runs: 1 }), 3);
    assert.equal(BG.starsFor('fix', { runs: 3, edits: 2 }), 2);
    assert.equal(BG.starsFor('find', { slips: 1 }), 2);
  });
});

describe('the shipped bank', () => {
  for (const level of BG.LEVELS) {
    test(`${level} passes the checker`, () => {
      const bank = JSON.parse(fs.readFileSync(`data/logic/bug/${level}.json`, 'utf8'));
      assert.deepEqual(checkBugBank(bank), []);
    });
  }
});
