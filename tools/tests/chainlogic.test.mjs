/**
 * Tests for Sun to Lion (modules/chainlogic.js): every link sourced, every
 * wrong answer surely wrong, and webs judged on the picture.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../../assets/js/modules/chainlogic.js';
import { CHAIN_TEXT } from '../../assets/js/modules/chaintext.js';

describe('the links', () => {
  test('every shown link has a source key', () => {
    for (const l of C.LINKS) if (l.status === 'OK') assert.ok(l.src && l.src !== '-', `${l.food} -> ${l.eater}`);
  });
  test('a chain starts with a plant and follows sourced links', () => {
    for (const len of [2, 3, 4]) {
      for (const ch of C.chains(len)) {
        assert.equal(C.species(ch[0]).role, 'producer');
        ch.forEach((id, k) => { if (k) assert.ok(C.ok(ch[k - 1], id), `${ch[k - 1]} -> ${id}`); });
      }
    }
  });
  test('soil never fits a plant slot', () => {
    assert.equal(C.fits(['grass', 'zebra'], 0, C.SOIL), false);
    assert.equal(C.fits(['grass', 'zebra'], 0, 'grass'), true);
  });
  test('polar bears and penguins are never in the same chain', () => {
    for (const len of [2, 3, 4, 5]) for (const ch of C.chains(len)) assert.ok(!(ch.includes('polarbear') && ch.includes('adelie')));
  });
});

describe('who goes hungry, in the picture', () => {
  test('takes the domino steps, and spares animals with other food', () => {
    const web = { nodes: ['grass', 'acacia', 'zebra', 'giraffe', 'lion'], edges: [['grass', 'zebra'], ['acacia', 'giraffe'], ['zebra', 'lion'], ['giraffe', 'lion']] };
    assert.deepEqual([...C.hungry(web, 'grass')], ['zebra']);
    const chain = { nodes: ['grass', 'zebra', 'lion'], edges: [['grass', 'zebra'], ['zebra', 'lion']] };
    assert.deepEqual([...C.hungry(chain, 'grass')].sort(), ['lion', 'zebra']);
  });
});

describe('making puzzles', () => {
  test('every chapter makes sound puzzles, the same from the same seed', () => {
    for (const level of C.LEVELS) {
      for (const c of C.CHAPTERS[level]) {
        for (let i = 0; i < 25; i++) {
          const p = C.makeAt(c.id, i, 'test');
          assert.ok(p, `${c.id} ${i} made nothing`);
          assert.deepEqual(C.makeAt(c.id, i, 'test'), p);
          assert.deepEqual(C.problems(p), [], `${c.id} ${i}: ${JSON.stringify(p)}`);
        }
      }
    }
  });
  test('a plant slot always offers the soil', () => {
    for (let i = 2; i < 20; i++) {
      const p = C.makeAt('e2', i, 'soil');
      assert.ok(p.choices[0].includes(C.SOIL));
    }
  });
  test('every living thing has a name in both languages', () => {
    for (const s of C.SPECIES) assert.ok(CHAIN_TEXT.en[`sp.${s.id}`] && CHAIN_TEXT.es[`sp.${s.id}`], s.id);
  });
});
