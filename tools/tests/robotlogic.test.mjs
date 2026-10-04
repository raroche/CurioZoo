/**
 * Tests for the robot (assets/js/modules/robotvm.js, robotgen.js).
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as V from '../../assets/js/modules/robotvm.js';
import * as G from '../../assets/js/modules/robotgen.js';
import { ROBOT_TEXT } from '../../assets/js/modules/robottext.js';
import { checkRobotBank, checkParity } from '../logiccheck.mjs';
import { countKey, rowFullKey } from '../../assets/js/rooms/logic/robotbench.js';

/* A corridor: start at the left facing right, one animal at the far end. */
const corridor = {
  cells: '#####/.....', animals: [[4, 1, 'lion']], start: [0, 1, 1], slots: { main: 9 }, abs: false
};

describe('running programs', () => {
  test('forward four times, then feed', () => {
    const prog = { main: [{ op: 'rep', n: 4, body: [{ op: 'F' }] }, { op: 'FEED' }] };
    const r = V.run(corridor, prog);
    assert.equal(r.ok, true);
    assert.equal(r.fed, 1);
  });

  test('"repeat 3" runs exactly three times, not four', () => {
    const prog = { main: [{ op: 'rep', n: 3, body: [{ op: 'F' }] }] };
    const moves = V.run(corridor, prog).events.filter((e) => e.k === 'move').length;
    assert.equal(moves, 3);
  });

  test('walking into a wall is a bump, at the tile that did it', () => {
    const r = V.run(corridor, { main: [{ op: 'TL' }, { op: 'F' }] });
    assert.equal(r.why, 'bump');
    assert.deepEqual(r.at, ['main', 1]);
  });

  test('feeding an empty square says so', () => {
    assert.equal(V.run(corridor, { main: [{ op: 'FEED' }] }).why, 'nothing');
  });

  test('a loop that never ends stops: the robot is tired', () => {
    const prog = { main: [{ op: 'until', body: [{ op: 'TL' }] }] };
    assert.equal(V.run(corridor, prog).why, 'tired');
  });

  test('a helper that calls itself stops when the last animal is fed', () => {
    const prog = { main: [{ op: 'call', p: 'h1' }], h1: [{ op: 'if', cond: 'animal', then: [{ op: 'FEED' }], else: [] }, { op: 'F' }, { op: 'call', p: 'h1' }] };
    assert.equal(V.run(corridor, prog).ok, true);
  });

  test('a painted tile only works on its colour', () => {
    const painted = { ...corridor, cells: '#####/..o..' };
    const prog = { main: [{ op: 'F' }, { op: 'F' }, { op: 'TR', c: 'b' }, { op: 'F' }, { op: 'F' }, { op: 'FEED' }] };
    assert.equal(V.run(painted, prog).ok, true);
  });

  test('screen arrows face the robot that way first', () => {
    const lvl = { ...corridor, abs: true, start: [0, 1, 0] };
    assert.equal(V.run(lvl, { main: [{ op: 'rep', n: 4, body: [{ op: 'R' }] }, { op: 'FEED' }] }).ok, true);
  });
});

describe('sizes', () => {
  test('a bracket costs one tile plus what is inside', () => {
    assert.equal(V.sizeOf([{ op: 'rep', n: 4, body: [{ op: 'F' }, { op: 'TR' }] }, { op: 'FEED' }]), 4);
  });

  test('the shortest plain program counts moves, turns and feeds', () => {
    assert.equal(V.flatLength(corridor, false), 5);
  });
});

describe('making levels', () => {
  test('the same seed makes the same level', () => {
    assert.deepEqual(G.makeAt('m3', 'seed', 2), G.makeAt('m3', 'seed', 2));
  });

  test('in a loop world, the plain program does not fit the slots', () => {
    for (let i = 0; i < 10; i++) {
      const l = G.makeAt('e2', 'need', i);
      assert.ok(l.flat > l.slots.main, `${l.flat} vs ${l.slots.main}`);
      assert.equal(V.run(l, l.ref).ok, true);
    }
  });

  test('a sensor level is solved by the one look-first program', () => {
    for (let i = 0; i < 6; i++) {
      const l = G.makeAt('h2', 'sense', i);
      assert.equal(V.run(l, l.ref).ok, true);
      assert.equal(l.ref.main[0].op, 'until');
    }
  });
});

describe('words', () => {
  test('every key is in both languages', () => {
    assert.deepEqual(checkParity('robottext', ROBOT_TEXT), []);
  });
});

describe('the shipped bank', () => {
  for (const level of G.LEVELS) {
    test(`${level} passes the checker`, () => {
      const bank = JSON.parse(fs.readFileSync(`data/logic/robot/${level}.json`, 'utf8'));
      assert.deepEqual(checkRobotBank(bank), []);
    });
  }
});

describe('what a full row says', () => {
  test('every level is told only about tiles it has', () => {
    for (const level of ['easy', 'medium', 'hard']) {
      const bank = JSON.parse(fs.readFileSync(`data/logic/robot/${level}.json`, 'utf8'));
      for (const c of bank.chapters) {
        const pal = c.puzzles[0].palette;
        for (const key of [rowFullKey(pal), countKey(pal)].filter(Boolean)) {
          const text = ROBOT_TEXT.en[key];
          assert.ok(text, key);
          if (/Repeat/.test(text)) assert.ok(pal.includes('rep'), `${c.id}: ${key} names Repeat`);
          if (/Until/.test(text)) assert.ok(pal.includes('until'), `${c.id}: ${key} names Until`);
          if (/helper|Ⓐ/.test(text)) assert.ok(pal.includes('h1'), `${c.id}: ${key} names a helper`);
        }
      }
    }
  });
});
