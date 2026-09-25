/**
 * Discovered or Invented?: the decisions a round makes.
 *
 * Which things, in which order, what a tap means and what is remembered. The
 * screen only draws what these return.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const D = await import('../../assets/js/modules/discover.js');

/* A seeded random, so a failing case can be replayed. */
function rng(seed = 7) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 2 ** 32; };
}

const mk = (i, answer) => ({ id: `t${i}`, answer, q: { en: `Q${i}?`, es: `¿Q${i}?` } });
const bank = (d = 20, n = 20) => [
  ...Array.from({ length: d }, (_, i) => mk(i, 'discovered')),
  ...Array.from({ length: n }, (_, i) => mk(d + i, 'invented'))
];

const longestRun = (list) => {
  let best = 0;
  let run = 0;
  list.forEach((x, i) => {
    run = i && list[i - 1].answer === x.answer ? run + 1 : 1;
    best = Math.max(best, run);
  });
  return best;
};

describe('buildRound', () => {
  test('gives the number asked for, with no repeats', () => {
    for (let seed = 1; seed < 30; seed += 1) {
      const list = D.buildRound(bank(), 20, {}, rng(seed));
      assert.equal(list.length, 20);
      assert.equal(new Set(list.map((x) => x.id)).size, 20);
    }
  });

  test('never asks more than MAX_RUN of one answer in a row when it can help it', () => {
    for (let seed = 1; seed < 200; seed += 1) {
      const list = D.buildRound(bank(), 30, {}, rng(seed));
      assert.ok(longestRun(list) <= D.MAX_RUN, `seed ${seed}: run of ${longestRun(list)}`);
    }
  });

  test('a short bank still fills what it can', () => {
    assert.equal(D.buildRound(bank(2, 1), 10, {}, rng()).length, 3);
  });

  test('things not seen lately come first', () => {
    const items = bank(10, 10);
    const recent = items.slice(0, 15).map((x) => x.id);
    const list = D.buildRound(items, 5, { recent }, rng(3));
    for (const x of list) assert.ok(!recent.includes(x.id), `${x.id} was seen lately`);
  });

  test('when everything has been seen, the longest ago comes back first', () => {
    const items = bank(5, 5);
    const recent = items.map((x) => x.id);
    const list = D.buildRound(items, 3, { recent }, rng(9));
    const ids = new Set(list.map((x) => x.id));
    assert.deepEqual(ids, new Set(recent.slice(0, 3)));
  });
});

describe('capRuns', () => {
  test('only reorders; nothing is lost or added', () => {
    const list = bank(8, 2);
    const out = D.capRuns(list);
    assert.deepEqual(out.map((x) => x.id).sort(), list.map((x) => x.id).sort());
  });
});

describe('judge and words', () => {
  const item = { answer: 'invented' };
  test('a tap is right only on the answer', () => {
    assert.equal(D.judge(item, 'invented'), true);
    assert.equal(D.judge(item, 'discovered'), false);
  });
  test('the feedback names the answer and never says "wrong"', () => {
    for (const lang of ['en', 'es']) {
      for (const right of [true, false]) {
        const line = D.feedbackLine(item, right, lang);
        assert.match(line.toLowerCase(), lang === 'es' ? /inventado/ : /invented/);
        assert.doesNotMatch(line.toLowerCase(), /wrong|mal\b|incorrect/);
      }
    }
  });
  test('every word on the card exists in both languages', () => {
    for (const [key, v] of Object.entries(D.UI)) {
      assert.ok(v.en && v.es, `${key} is missing a language`);
    }
  });
});

describe('memory', () => {
  test('a malformed saved object comes back usable', () => {
    for (const raw of [null, 5, 'x', [], { recent: 'no', count: 7, lang: 'fr' }]) {
      const m = D.normaliseMemory(raw);
      assert.deepEqual(m.recent, []);
      assert.equal(m.count, undefined);
      assert.equal(m.lang, undefined);
    }
  });
  test('record keeps the most recent last and caps the list', () => {
    const m = { recent: [] };
    for (let i = 0; i < D.RECENT_CAP + 10; i += 1) D.record(m, `x${i}`);
    D.record(m, `x${D.RECENT_CAP + 5}`);
    assert.equal(m.recent.length, D.RECENT_CAP);
    assert.equal(m.recent.at(-1), `x${D.RECENT_CAP + 5}`);
    assert.equal(new Set(m.recent).size, m.recent.length);
  });
});

describe('the real bank', () => {
  const data = JSON.parse(readFileSync(new URL('../../data/fun/discover.json', import.meta.url)));

  test('holds at least the 106 asked for, each one unique', () => {
    assert.ok(Array.isArray(data.items));
    assert.ok(data.items.length >= 106, `only ${data.items.length}`);
    assert.equal(new Set(data.items.map((x) => x.id)).size, data.items.length);
  });

  test('keeps the six examples it was built from, with their answers', () => {
    const want = {
      water: 'discovered', wheel: 'invented', gold: 'discovered',
      electricity: 'discovered', fire: 'discovered', computers: 'invented'
    };
    for (const [id, answer] of Object.entries(want)) {
      assert.equal(data.items.find((x) => x.id === id)?.answer, answer, id);
    }
  });

  test('every item is complete in English and Spanish, with a source', () => {
    for (const x of data.items) {
      assert.ok(D.ANSWERS.includes(x.answer), `${x.id}: answer`);
      assert.match(x.source || '', /^https:\/\//, `${x.id}: source`);
      for (const lang of ['en', 'es']) {
        assert.ok(x.q?.[lang], `${x.id}: no ${lang} question`);
        assert.ok(x.why?.[lang], `${x.id}: no ${lang} why`);
      }
    }
  });

  test('a real round never runs one answer more than MAX_RUN times', () => {
    for (let seed = 1; seed < 100; seed += 1) {
      const list = D.buildRound(data.items, 30, {}, rng(seed));
      assert.ok(longestRun(list) <= D.MAX_RUN);
    }
  });
});
