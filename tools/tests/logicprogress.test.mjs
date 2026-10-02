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

describe('endless practice and badges', () => {
  test('endless counts go up one at a time, per game and level', () => {
    let rec = P.normalise({});
    rec = P.addEndless(rec, 'code', 'easy');
    rec = P.addEndless(rec, 'code', 'easy');
    assert.equal(P.endlessCount(rec, 'code', 'easy'), 2);
    assert.equal(P.endlessCount(rec, 'code', 'hard'), 0);
    assert.equal(P.normalise(JSON.parse(JSON.stringify(rec))).endless['code:easy'], 2);
  });

  test('badges follow total stars, with how far to the next', () => {
    assert.equal(P.badgeOf(0).badge.id, 'cub');
    assert.deepEqual([P.badgeOf(80).badge.id, P.badgeOf(80).toGo], ['spotter', 70]);
    assert.equal(P.badgeOf(5000).next, null);
  });
});

describe('stars never go down', () => {
  const dayN = (i) => new Date(Date.UTC(2026, 0, 1 + i)).toISOString().slice(0, 10);

  test('dropping old daily results keeps their stars and the badge', () => {
    let rec = P.normalise({});
    for (let i = 0; i < 25; i++) rec = P.setDaily(rec, 'code', 'easy', dayN(i), 3);
    rec = P.setStars(rec, 'code', 'e1-01', 1);
    assert.equal(P.totalStars(rec), 76);
    assert.equal(P.badgeOf(P.totalStars(rec)).badge.id, 'spotter');
    let last = P.totalStars(rec);
    for (let i = 25; i < 100; i++) {
      rec = P.setDaily(rec, 'truth', 'easy', dayN(i), 1);
      assert.ok(P.totalStars(rec) > last, `day ${i}`);
      last = P.totalStars(rec);
    }
    assert.equal(Object.keys(rec.daily).length, 60);
    assert.equal(P.totalStars(rec), 76 + 75);
    assert.equal(P.totalStars(rec, 'code'), 76);
  });

  test('a better daily result adds only the difference', () => {
    let rec = P.setDaily(P.normalise({}), 'code', 'easy', '2026-10-02', 1);
    rec = P.setDaily(rec, 'code', 'easy', '2026-10-02', 3);
    rec = P.setDaily(rec, 'code', 'easy', '2026-10-02', 2);
    assert.equal(P.totalStars(rec), 3);
  });

  test('the lifetime sum survives a save and load, and an old record gets one', () => {
    let rec = P.normalise({});
    for (let i = 0; i < 70; i++) rec = P.setDaily(rec, 'code', 'easy', dayN(i), 2);
    assert.equal(P.totalStars(P.normalise(JSON.parse(JSON.stringify(rec)))), 140);
    const old = P.normalise({ daily: { '2026-10-01': { 'code:easy': 3 } } });
    assert.deepEqual(old.dailySum, { code: 3 });
    assert.equal(P.normalise({ dailySum: { code: -4, 'x:y': 9 } }).dailySum.code, undefined);
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
