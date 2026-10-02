/**
 * Tests for what the Logic Games room remembers (modules/logicprogress.js)
 * and the seeded random numbers every generator uses (modules/logicrng.js).
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import * as P from '../../assets/js/modules/logicprogress.js';
import { hash, mulberry32, today, dailySeed } from '../../assets/js/modules/logicrng.js';

const ids = (ch, n) => Array.from({ length: n }, (_, i) => `${ch}-${String(i + 1).padStart(2, '0')}`);

describe('stars', () => {
  test('only ever go up', () => {
    let rec = P.normalise({});
    rec = P.setStars(rec, 'code', 'e1-01', 2);
    rec = P.setStars(rec, 'code', 'e1-01', 1);
    assert.equal(P.starsOf(rec, 'code', 'e1-01'), 2);
    rec = P.setStars(rec, 'code', 'e1-01', 3);
    assert.equal(P.starsOf(rec, 'code', 'e1-01'), 3);
  });

  test('a solve is at least one star and at most three', () => {
    let rec = P.setStars(P.normalise({}), 'code', 'e1-02', 0);
    assert.equal(P.starsOf(rec, 'code', 'e1-02'), 1);
    rec = P.setStars(rec, 'code', 'e1-02', 9);
    assert.equal(P.starsOf(rec, 'code', 'e1-02'), 3);
  });

  test('nothing is changed in place', () => {
    const rec = P.normalise({});
    P.setStars(rec, 'code', 'e1-01', 3);
    assert.deepEqual(rec.stars, {});
  });

  test('totals count puzzles and daily puzzles, per game', () => {
    let rec = P.normalise({});
    rec = P.setStars(rec, 'code', 'e1-01', 3);
    rec = P.setStars(rec, 'truth', 'e1-01', 2);
    rec = P.setDaily(rec, 'code', 'easy', '2026-10-02', 1);
    assert.equal(P.totalStars(rec), 6);
    assert.equal(P.totalStars(rec, 'code'), 4);
  });
});

describe('what is open', () => {
  const chapters = [ids('e1', 70), ids('e2', 70)];

  test('the first chapter is open, the second after twenty solves', () => {
    let rec = P.normalise({});
    assert.equal(P.chapterOpen(rec, 'code', chapters, 0), true);
    assert.equal(P.chapterOpen(rec, 'code', chapters, 1), false);
    assert.equal(P.needToOpen(rec, 'code', chapters, 1), 20);
    for (let i = 0; i < 20; i++) rec = P.setStars(rec, 'code', chapters[0][i], 1);
    assert.equal(P.chapterOpen(rec, 'code', chapters, 1), true);
  });

  test('three puzzles ahead are always open', () => {
    let rec = P.normalise({});
    assert.equal(P.puzzleOpen(rec, 'code', chapters[0], 2), true);
    assert.equal(P.puzzleOpen(rec, 'code', chapters[0], 3), false);
    rec = P.setStars(rec, 'code', chapters[0][0], 1);
    assert.equal(P.puzzleOpen(rec, 'code', chapters[0], 3), true);
  });
});

describe('days played', () => {
  test('counts the last seven days and never a streak', () => {
    let rec = P.normalise({});
    for (const d of ['2026-09-20', '2026-09-28', '2026-09-30', '2026-10-02']) rec = P.markDay(rec, d);
    assert.equal(P.daysThisWeek(rec, '2026-10-02'), 3);
  });

  test('keeps two weeks at most', () => {
    let rec = P.normalise({});
    for (let d = 1; d <= 30; d++) rec = P.markDay(rec, `2026-09-${String(d).padStart(2, '0')}`);
    assert.equal(rec.days.length, 14);
  });
});

describe('a saved record', () => {
  test('rubbish is dropped and good values survive', () => {
    const rec = P.normalise({
      lang: 'es', level: { code: 'hard', truth: 'impossible' },
      stars: { 'code:e1-01': 3, 'code:e1-02': 7, bad: 1 },
      days: ['2026-10-01', 'yesterday'], daily: { nope: {} }
    });
    assert.equal(rec.lang, 'es');
    assert.deepEqual(rec.level, { code: 'hard' });
    assert.deepEqual(rec.stars, { 'code:e1-01': 3 });
    assert.deepEqual(rec.days, ['2026-10-01']);
    assert.deepEqual(rec.daily, {});
  });

  test('not even an object still gives a usable record', () => {
    assert.equal(P.normalise(null).lang, 'en');
    assert.equal(P.levelOf(P.normalise('x'), 'code'), 'easy');
  });
});

describe('random numbers', () => {
  test('the same seed gives the same numbers', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    for (let i = 0; i < 5; i++) assert.equal(a(), b());
  });

  test('hash is stable, so a puzzle is the same on every device', () => {
    assert.equal(hash('code', 'e1', 7), hash('code', 'e1', 7));
    assert.notEqual(hash('code', 'e1', 7), hash('code', 'e1', 8));
    assert.equal(dailySeed('code', 'easy', '2026-10-02'), dailySeed('code', 'easy', '2026-10-02'));
  });

  test('today is the local date as YYYY-MM-DD', () => {
    assert.equal(today(new Date(2026, 9, 2, 23, 30)), '2026-10-02');
  });
});
