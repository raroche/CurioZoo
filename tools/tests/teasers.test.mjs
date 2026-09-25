/**
 * Math Brain Teasers: the decisions a round makes, and the sum checker that
 * holds every numeric answer to account.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const T = await import('../../assets/js/modules/teasers.js');

function rng(seed = 7) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 2 ** 32; };
}
const mk = (i) => ({ id: `easy-${String(i).padStart(3, '0')}`, answer: 1,
  choices: [{ en: 'a', es: 'a' }, { en: 'b', es: 'b' }, { en: 'c', es: 'c' }] });
const bank = (n = 30) => Array.from({ length: n }, (_, i) => mk(i + 1));

describe('evaluate', () => {
  test('does ordinary sums in the right order', () => {
    assert.equal(T.evaluate('2 + 3 * 4'), 14);
    assert.equal(T.evaluate('(2 + 3) * 4'), 20);
    assert.equal(T.evaluate('30 / (1/2) + 10'), 70);
    assert.equal(T.evaluate('-3 + 5'), 2);
    assert.equal(T.evaluate('10 - 4 - 3'), 3);
    assert.equal(T.evaluate('2.5 * 4'), 10);
  });
  test('refuses anything that is not a sum', () => {
    for (const bad of ['', 'alert(1)', '2 ** 3', '(2 + 3', '2 + + ', 'Math.PI', '1; 2']) {
      assert.ok(Number.isNaN(T.evaluate(bad)), bad);
    }
  });
});

describe('buildRound', () => {
  test('gives the number asked for, with no repeats', () => {
    for (let seed = 1; seed < 20; seed += 1) {
      const list = T.buildRound(bank(), 10, {}, rng(seed));
      assert.equal(list.length, 10);
      assert.equal(new Set(list.map((x) => x.id)).size, 10);
    }
  });
  test('teasers never seen come first', () => {
    const items = bank(20);
    const seen = items.slice(0, 12).map((x) => x.id);
    const list = T.buildRound(items, 8, { seen }, rng(3));
    for (const x of list) assert.ok(!seen.includes(x.id));
  });

  test('a whole level is played through before anything repeats', () => {
    /* 130 teasers, rounds of 15, as a child would play: nothing comes back
       until all 130 have been met, however many rounds that takes. */
    for (let seed = 1; seed < 6; seed += 1) {
      const items = bank(130);
      let m = T.normaliseMemory({});
      const met = new Set();
      let asked = 0;
      while (asked < 130) {
        const round = T.buildRound(items, 15, { seen: m.seen.easy }, rng(seed + asked));
        for (const x of round) {
          if (asked < 130) assert.ok(!met.has(x.id), `${x.id} came back after only ${asked} teasers`);
          met.add(x.id);
          asked += 1;
          m = T.record(m, 'easy', x.id);
        }
      }
      assert.equal(met.size, 130);
    }
  });

  test('when a level is used up, the longest-ago seen come back first', () => {
    const items = bank(10);
    const seen = items.map((x) => x.id);
    const list = T.buildRound(items, 3, { seen }, rng(9));
    assert.deepEqual(new Set(list.map((x) => x.id)), new Set(seen.slice(0, 3)));
  });
  test('a short bank fills what it can', () => {
    assert.equal(T.buildRound(bank(4), 10, {}, rng()).length, 4);
  });
});

describe('choices, judging and words', () => {
  test('choices keep their place in the data after the shuffle', () => {
    const item = mk(1);
    const choices = T.makeChoices(item, rng(5));
    assert.equal(choices.length, 3);
    assert.deepEqual(choices.map((c) => c.index).sort(), [0, 1, 2]);
    const right = choices.find((c) => c.index === item.answer);
    assert.equal(T.judge(item, right.index), true);
  });
  test('the feedback names the answer and never says "wrong"', () => {
    const item = mk(1);
    for (const lang of ['en', 'es']) {
      for (const right of [true, false]) {
        const line = T.feedbackLine(item, right, lang);
        assert.match(line, /b/);
        assert.doesNotMatch(line.toLowerCase(), /wrong|incorrect/);
      }
    }
  });
  test('every word on the page exists in both languages', () => {
    for (const [key, v] of Object.entries(T.UI)) assert.ok(v.en && v.es, key);
  });
});

describe('memory', () => {
  test('a malformed saved object comes back usable', () => {
    for (const raw of [null, 3, [], { seen: [], level: 'x', count: 7, lang: 'fr' }]) {
      const m = T.normaliseMemory(raw);
      for (const l of T.LEVEL_IDS) assert.deepEqual(m.seen[l], []);
      assert.equal(m.level, undefined);
      assert.equal(m.count, undefined);
      assert.equal(m.lang, undefined);
    }
  });
  test('each level remembers on its own, most recent last, capped', () => {
    const m = T.normaliseMemory({});
    for (let i = 0; i < T.SEEN_CAP + 5; i += 1) T.record(m, 'hard', `h${i}`);
    T.record(m, 'easy', 'e1');
    assert.equal(m.seen.hard.length, T.SEEN_CAP);
    assert.equal(m.seen.hard.at(-1), `h${T.SEEN_CAP + 4}`);
    assert.deepEqual(m.seen.easy, ['e1']);
  });

  test('the first version\'s history is carried over, not lost', () => {
    const m = T.normaliseMemory({ recent: { easy: ['easy-001', 'easy-002'] } });
    assert.deepEqual(m.seen.easy, ['easy-001', 'easy-002']);
  });

  test('the cap is above the most a level may hold', () => {
    assert.ok(T.SEEN_CAP >= 200);
  });
});

describe('the real bank', () => {
  test('every teaser passes the rules the checker and the merge tool share', async () => {
    const { problems } = await import('../teaserschema.mjs');
    for (const level of T.LEVEL_IDS) {
      const data = JSON.parse(readFileSync(new URL(`../../data/teasers/${level}.json`, import.meta.url)));
      for (const x of data.items) assert.deepEqual(problems(x, level), [], x.id);
    }
  });

  test('no modern-original teaser is in the bank', () => {
    for (const level of T.LEVEL_IDS) {
      const data = JSON.parse(readFileSync(new URL(`../../data/teasers/${level}.json`, import.meta.url)));
      for (const x of data.items) assert.ok(['public-domain', 'traditional'].includes(x.rights), x.id);
    }
  });

  for (const level of T.LEVEL_IDS) {
    test(`${level}: every numeric answer works out`, () => {
      const data = JSON.parse(readFileSync(new URL(`../../data/teasers/${level}.json`, import.meta.url)));
      for (const x of data.items) {
        assert.ok(x.source && x.q?.en && x.q?.es && x.why?.en && x.why?.es, x.id);
        if (x.kind !== 'number') continue;
        assert.ok(Math.abs(T.evaluate(x.check) - x.value) < 1e-9, `${x.id}: ${x.check} is not ${x.value}`);
      }
    });
  }
});
