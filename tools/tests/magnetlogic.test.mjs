/**
 * Tests for Magnet Meerkats (modules/magnetlogic.js): the like/unlike rule,
 * side by side, steel, ring towers, the repulsion test and the compass.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import * as M from '../../assets/js/modules/magnetlogic.js';

describe('the pole rule', () => {
  test('end to end: N meets S hugs, N meets N pushes', () => {
    assert.equal(M.hugs('end', 1, 1), true);
    assert.equal(M.hugs('end', 1, 0), false);
  });
  test('side by side: opposite ways hug, the same way pushes', () => {
    assert.equal(M.hugs('side', 1, 0), true);
    assert.equal(M.hugs('side', 1, 1), false);
  });
  test('steel always hugs', () => {
    assert.equal(M.hugs('steel', 0, null), true);
    assert.equal(M.hugs('steel', 1, null), true);
  });
  test('a square of four: side by side and end to end at once', () => {
    const board = { w: 2, h: 2, cells: ['h1', 'h1', 'h0', 'h0'] };
    const kinds = M.contacts(board).map((c) => `${M.contactKey(c)}:${c.type}`).sort();
    assert.deepEqual(kinds, ['0-1:end', '0-2:side', '1-3:side', '2-3:end']);
    assert.ok(Object.values(M.outcome(board, M.dirsOf(board))).every((v) => v === 'hug'));
  });
});

describe('the huddle solver', () => {
  test('one answer from the glued magnet', () => {
    const board = { w: 3, h: 1, cells: ['h1g', 'h0', 'h0'] };
    const s = M.solveHuddle(board, { '0-1': 'hug', '1-2': 'push' });
    assert.ok(s.ok && s.unique);
    assert.deepEqual(s.dirs, [1, 1, 0]);
  });
  test('nothing glued: more than one answer', () => {
    const board = { w: 2, h: 1, cells: ['h0', 'h0'] };
    assert.equal(M.solveHuddle(board, { '0-1': 'hug' }).unique, false);
  });
  test('steel cannot push', () => {
    const board = { w: 2, h: 1, cells: ['h1g', 's'] };
    assert.equal(M.solveHuddle(board, { '0-1': 'push' }).ok, false);
  });
  test('a card that goes round a square in a contradiction cannot be met', () => {
    const board = { w: 2, h: 2, cells: ['h1g', 'h0', 'h0', 'h0'] };
    const s = M.solveHuddle(board, { '0-1': 'hug', '0-2': 'hug', '1-3': 'hug', '2-3': 'push' });
    assert.equal(s.ok, false);
  });
});

describe('rings, things, reach, bars and the compass', () => {
  test('rings float when the same faces meet', () => {
    assert.deepEqual(M.solveTower({ rings: [1, 0, 0], gaps: ['float', 'touch'] }), [1, 0, 0]);
    assert.deepEqual(M.towerGaps([1, 1, 0]), ['touch', 'float']);
  });
  test('every tray item is a safe one, and some metals do not stick', () => {
    assert.ok(M.THINGS.some((x) => x.metal && !x.sticks));
    for (const banned of ['coin', 'key', 'spoon', 'scissors', 'ring']) assert.equal(M.thing(banned), null);
  });
  test('reach: strength at least the layers', () => {
    assert.equal(M.reaches(3, 3), true);
    assert.equal(M.reaches(2, 3), false);
  });
  test('only magnets push; iron is pulled by both ends', () => {
    assert.equal(M.meet('magnet', 0, 0, 'magnet', 0, 0), 'push');
    assert.equal(M.meet('magnet', 0, 0, 'magnet', 0, 1), 'pull');
    assert.equal(M.meet('magnet', 0, 0, 'iron', 0, 0), 'pull');
    assert.equal(M.meet('magnet', 0, 1, 'iron', 0, 0), 'pull');
    assert.equal(M.meet('iron', 0, 0, 'iron', 0, 0), 'nothing');
    assert.equal(M.meet('magnet', 0, 0, 'plain', 0, 0), 'nothing');
  });
  test('the M10 cards: A and B are magnets, C is iron', () => {
    const cards = [{ a: 0, ea: 0, b: 1, eb: 0, res: 'push' }, { a: 0, ea: 0, b: 2, eb: 0, res: 'pull' }, { a: 0, ea: 1, b: 2, eb: 0, res: 'pull' }];
    assert.deepEqual(M.whichAnswer(3, cards), ['magnet', 'magnet', 'iron']);
    /* Without the third card, C could be a magnet too. */
    assert.equal(M.whichAnswer(3, cards.slice(0, 2)), null);
  });
  test('compass: along the magnet beyond its ends, the other way beside it', () => {
    /* N end at the right: beyond either end the needle points right; above or below, left. */
    assert.equal(M.needle('h', 1, 'endP'), 1);
    assert.equal(M.needle('h', 1, 'endM'), 1);
    assert.equal(M.needle('h', 1, 'sideP'), 3);
    /* N end at the top: beyond the ends the needle points up; beside it, down. */
    assert.equal(M.needle('v', 0, 'endM'), 0);
    assert.equal(M.needle('v', 0, 'sideM'), 2);
  });
});

describe('making magnet puzzles', () => {
  test('every chapter makes sound puzzles, the same from the same seed', () => {
    for (const level of M.LEVELS) {
      for (const c of M.CHAPTERS[level]) {
        for (let i = 0; i < 16; i++) {
          const p = M.makeAt(c.id, i, 'test');
          assert.ok(p, `${c.id} ${i}`);
          assert.deepEqual(M.makeAt(c.id, i, 'test'), p);
          assert.deepEqual(M.problems(p), [], `${c.id} ${i}: ${JSON.stringify(p)}`);
        }
      }
    }
  });
  test('huddle boards are never wider than 5', () => {
    for (const id of ['e2', 'm1', 'h1']) for (let i = 0; i < 30; i++) assert.ok(M.makeAt(id, i, 'w').w <= 5, id);
  });
});
