/**
 * Tests for what the Science Lab remembers (modules/scienceprogress.js):
 * the Logic Games rules applied to its own record, plus surprises and the
 * notebook's big ideas.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import * as P from '../../assets/js/modules/scienceprogress.js';
import { GAMES, IDEAS, ROOM } from '../../assets/js/modules/sciencetext.js';
import { SCIENCE_ART_KINDS } from '../../assets/js/modules/scienceart.js';

describe('the record', () => {
  test('a blank or broken record becomes a usable one', () => {
    for (const raw of [undefined, null, 7, 'x', [], {}]) {
      const r = P.normalise(raw);
      assert.equal(r.lang, 'en');
      assert.deepEqual(r.surprise, {});
      assert.deepEqual(r.stars, {});
    }
  });

  test('keeps valid surprises and drops the rest', () => {
    const r = P.normalise({ surprise: { pond: 4, train: 0, firefly: -2, Bad: 3, lever: 1.5, slide: '2' } });
    assert.deepEqual(r.surprise, { pond: 4 });
  });

  test('keeps stars, days and language like Logic Games', () => {
    const r = P.normalise({ lang: 'es', stars: { 'pond:e1-01': 3, 'pond:e1-02': 7 }, days: ['2026-10-09'] });
    assert.equal(r.lang, 'es');
    assert.deepEqual(r.stars, { 'pond:e1-01': 3 });
    assert.deepEqual(r.days, ['2026-10-09']);
  });
});

describe('surprises', () => {
  test('only ever count up, per game and in total', () => {
    let r = P.normalise({});
    r = P.addSurprise(r, 'pond');
    r = P.addSurprise(r, 'pond', 2);
    r = P.addSurprise(r, 'train');
    r = P.addSurprise(r, 'train', 0);
    r = P.addSurprise(r, 'train', -5);
    assert.equal(P.surprises(r, 'pond'), 3);
    assert.equal(P.surprises(r, 'train'), 1);
    assert.equal(P.surprises(r), 4);
  });

  test('survive every other change to the record', () => {
    let r = P.addSurprise(P.normalise({}), 'pond', 2);
    r = P.setStars(r, 'pond', 'e1-01', 3);
    r = P.markDay(r, '2026-10-09');
    r = P.setLang(r, 'es');
    r = P.setLevel(r, 'pond', 'hard');
    assert.equal(P.surprises(r, 'pond'), 2);
    assert.equal(P.surprises(P.normalise(JSON.parse(JSON.stringify(r))), 'pond'), 2);
  });
});

describe('big ideas', () => {
  test('a chapter idea is earned after IDEA_AT experiments in it', () => {
    let r = P.normalise({});
    for (let i = 1; i < P.IDEA_AT; i++) r = P.setStars(r, 'pond', `e1-0${i}`, 1);
    r = P.setStars(r, 'pond', 'e2-01', 3);
    r = P.setStars(r, 'train', 'e1-01', 3);
    assert.equal(P.solvedIn(r, 'pond', 'e1'), P.IDEA_AT - 1);
    assert.equal(P.ideaEarned(r, 'pond', 'e1'), false);
    r = P.setStars(r, 'pond', 'e1-09', 2);
    assert.equal(P.ideaEarned(r, 'pond', 'e1'), true);
    assert.equal(P.ideasEarned(r, [{ game: 'pond', ch: 'e1' }, { game: 'pond', ch: 'e2' }]), 1);
  });

  test('a chapter id is not mistaken for a longer one', () => {
    let r = P.normalise({});
    for (let i = 1; i <= P.IDEA_AT; i++) r = P.setStars(r, 'pond', `e10-0${i}`, 1);
    assert.equal(P.solvedIn(r, 'pond', 'e1'), 0);
  });
});

describe('the room text', () => {
  test('has ten games, each with an icon and an ideas list', () => {
    assert.equal(GAMES.length, 10);
    for (const g of GAMES) {
      assert.ok(SCIENCE_ART_KINDS.includes(g.id), `${g.id} has no icon`);
      assert.ok(Array.isArray(IDEAS[g.id]), `${g.id} has no ideas list`);
    }
  });

  test('names every badge in both languages', () => {
    for (const b of P.BADGES) {
      assert.ok(ROOM.en[`badge.${b.id}`], b.id);
      assert.ok(ROOM.es[`badge.${b.id}`], b.id);
    }
  });
});
