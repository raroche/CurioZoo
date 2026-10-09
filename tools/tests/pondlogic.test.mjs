/**
 * Tests for Hippo Pond's rules (modules/pondlogic.js). The banks are checked
 * whole by tools/sciencecheck.mjs; these pin the science itself, so a change
 * to a number or a rule that would teach something false fails here first.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import * as D from '../../assets/js/modules/pondlogic.js';
import { POND_TEXT, fmtNum, sizedName, theItem } from '../../assets/js/modules/pondtext.js';

const item = D.itemById;

describe('what floats and what sinks', () => {
  test('the lesson pairs: big and light floats, small and heavy sinks', () => {
    assert.equal(D.verdict(item('log')), 'float');
    assert.equal(D.verdict(item('ship')), 'float');
    assert.equal(D.verdict(item('coin')), 'sink');
    assert.equal(D.verdict(item('key')), 'sink');
    assert.equal(D.verdict(item('hippo')), 'sink');
  });

  test('salt never floats a stone or metal: very salty water stops at about 1.2', () => {
    for (const id of ['rock', 'coin', 'key', 'anchor', 'spoon', 'bone']) assert.equal(D.verdict(item(id), 'salty'), 'sink', id);
  });

  test('salt does float a potato and a fresh egg', () => {
    assert.equal(D.verdict(item('potato'), 'salty'), 'float');
    assert.equal(D.verdict(item('egg'), 'salty'), 'float');
  });

  test('anything too close to a liquid is never judged in it', () => {
    assert.equal(D.verdict(item('ice'), 'oil'), null);
    assert.equal(D.verdict(item('candle'), 'oil'), null);
    assert.equal(D.verdict(item('bowling16'), 'honey'), null);
  });

  test('a thing no source covers in a liquid is never shown in it', () => {
    assert.equal(D.verdict(item('apple'), 'oil'), null);
    assert.equal(D.verdict(item('carrot'), 'salty'), null);
  });

  test('every thing has a name in both languages', () => {
    for (const i of D.ITEMS) {
      assert.ok(POND_TEXT.en[`item.${i.id}`], i.id);
      assert.ok(POND_TEXT.es[`item.${i.id}`], i.id);
      if (i.fact) assert.ok(POND_TEXT.en[`fact.${i.id}`] && POND_TEXT.es[`fact.${i.id}`], `fact ${i.id}`);
    }
  });
});

describe('changes that make a thing float or sink', () => {
  test('cutting, painting, turning or resizing never changes anything', () => {
    for (const f of D.FIXES.never) assert.equal(D.fixWorks({ item: 'clay', goal: 'float' }, f), false, f);
  });

  test('a boat shape floats clay, and nothing hard', () => {
    assert.equal(D.fixWorks({ item: 'clay', goal: 'float' }, 'boat'), true);
    assert.equal(D.fixWorks({ item: 'rock', goal: 'float' }, 'boat'), false);
  });

  test('salt rescues an egg but not a rock; a float rescues anything', () => {
    assert.equal(D.fixWorks({ item: 'egg', goal: 'float' }, 'salt'), true);
    assert.equal(D.fixWorks({ item: 'rock', goal: 'float' }, 'salt'), false);
    assert.equal(D.fixWorks({ item: 'rock', goal: 'float' }, 'float'), true);
  });

  test('a change no source covers is unknown, and never offered', () => {
    assert.equal(D.fixWorks({ item: 'carrot', goal: 'float' }, 'salt'), null);
    for (let i = 2; i < 60; i++) {
      const p = D.makeAt('m1', i, 'test');
      if (p) assert.deepEqual(D.problems(p), [], JSON.stringify(p));
    }
  });
});

describe('cubes, layers and fractions', () => {
  test('a raft floats when lighter than the water cubes it fills', () => {
    assert.deepEqual(D.answers({ kind: 'cubes', rafts: [{ w: 2, h: 2, wt: 3 }, { w: 2, h: 1, wt: 3 }] }), ['float', 'sink']);
  });

  test('a floating raft sinks until it pushes away its own weight', () => {
    assert.deepEqual(D.answers({ kind: 'depth', w: 3, h: 4, wt: 6 }), [2]);
  });

  test('blocks stop on the first liquid denser than themselves', () => {
    assert.equal(D.layerOf(50), 0);
    assert.equal(D.layerOf(95), 1);
    assert.equal(D.layerOf(120), 2);
    assert.equal(D.layerOf(200), 3);
    assert.equal(D.layerOf(100), null);
  });

  test('the part under is the block over the liquid', () => {
    const p = { kind: 'frac', d: 90, liq: 'water', liqD: 100, opts: [[1, 2], [3, 4], [9, 10]] };
    assert.deepEqual(D.answers(p), [2]);
  });
});

describe('making experiments', () => {
  test('the same seed always makes the same experiment', () => {
    for (const ch of ['e1', 'e2', 'e3', 'm1', 'm2', 'm3', 'h1', 'h2', 'h3']) {
      assert.deepEqual(D.makeAt(ch, 7, 'x'), D.makeAt(ch, 7, 'x'), ch);
    }
  });

  test('every chapter makes sound experiments', () => {
    for (const ch of ['e1', 'e2', 'e3', 'm1', 'm2', 'm3', 'h1', 'h2', 'h3']) {
      for (let i = 0; i < 40; i++) {
        const p = D.makeAt(ch, i, 'sound');
        if (p) assert.deepEqual(D.problems(p), [], `${ch} ${i}: ${JSON.stringify(p)}`);
      }
    }
  });
});

describe('stars and words', () => {
  test('3 clean, 2 after one slip or hint, 1 after that; teaching is always 3', () => {
    assert.equal(D.starsFor({}), 3);
    assert.equal(D.starsFor({ wrong: 1 }), 2);
    assert.equal(D.starsFor({ hints: 1 }), 2);
    assert.equal(D.starsFor({ wrong: 1, hints: 1 }), 1);
    assert.equal(D.starsFor({ wrong: 4, teach: true }), 3);
  });

  test('numbers are written the way each language writes them', () => {
    assert.equal(fmtNum(92, 'en'), '0.92');
    assert.equal(fmtNum(92, 'es'), '0,92');
    assert.equal(fmtNum(100, 'en'), '1.0');
    assert.equal(fmtNum(60, 'es'), '0,6');
  });

  test('Spanish sizes agree with the noun', () => {
    assert.equal(sizedName('rock', 1, 'es'), 'una piedra diminuta');
    assert.equal(sizedName('log', 1, 'es'), 'un tronco diminuto');
    assert.equal(sizedName('ice', 4, 'en'), 'a big block of ice');
    assert.equal(theItem('egg', 'es', true), 'El huevo fresco');
  });
});
