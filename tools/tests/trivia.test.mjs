/**
 * Curio Trivia: the decisions a round makes.
 *
 * Which questions, in which order, what a tap means, what is remembered and
 * what a star is. The screen only draws what these return.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const T = await import('../../assets/js/modules/trivia.js');

/* A seeded random, so a failing case can be replayed. */
function rng(seed = 7) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 2 ** 32; };
}

const mk = (cat, level, n, extra = {}) => ({
  id: `${cat}-${level}-${String(n).padStart(3, '0')}`,
  level, type: 'mc', lang: 'both',
  q: { en: `Question ${cat} ${n}?`, es: `¿Pregunta ${cat} ${n}?` },
  choices: [
    { en: 'Aa', es: 'Aa es', emoji: '🍎' }, { en: 'Bb', es: 'Bb es', emoji: '🍌' },
    { en: 'Cc', es: 'Cc es', emoji: '🍇' }, { en: 'Dd', es: 'Dd es', emoji: '🍒' }
  ],
  answer: 1,
  why: { en: 'Because.', es: 'Porque.' },
  topic: 't', source: 'https://example.org',
  ...extra
});

function bank(cats = ['animals', 'space', 'body', 'earth'], per = 12, level = 'medium') {
  const pool = {};
  for (const c of cats) pool[c] = Array.from({ length: per }, (_, i) => mk(c, level, i + 1));
  return pool;
}

describe('weights', () => {
  const day = 1000;
  test('unseen is the most likely', () => assert.equal(T.weight(undefined, day), 1));
  test('a miss comes back after two weeks', () => {
    assert.equal(T.weight([0, 1, day - 14], day), 0.6);
    assert.equal(T.weight([0, 1, day - 13], day), 0.15);
  });
  test('right once rests, and returns faintly after sixty days', () => {
    assert.equal(T.weight([1, 0, day - 60], day), 0.1);
    assert.equal(T.weight([1, 0, day - 5], day), 0.02);
  });
  test('right twice is retired but never impossible', () => {
    assert.equal(T.weight([2, 0, day], day), 0.02);
    assert.ok(T.weight([5, 3, day - 400], day) > 0);
  });
});

describe('buildRound', () => {
  const setup = { level: 'medium', category: 'mixed', count: 15, lang: 'en' };

  test('never repeats a question in a round', () => {
    for (let seed = 1; seed < 40; seed += 1) {
      const round = T.buildRound(bank(), setup, {}, rng(seed));
      const ids = round.map((x) => x.question.id);
      assert.equal(ids.length, 15);
      assert.equal(new Set(ids).size, ids.length);
    }
  });

  test('mixed never puts one category back to back', () => {
    for (let seed = 1; seed < 60; seed += 1) {
      const round = T.buildRound(bank(), setup, {}, rng(seed));
      for (let i = 1; i < round.length; i += 1) {
        assert.notEqual(round[i].category, round[i - 1].category, `seed ${seed} at ${i}`);
      }
    }
  });

  test('mixed touches every category before any repeats', () => {
    const round = T.buildRound(bank(), { ...setup, count: 4 }, {}, rng(3));
    assert.equal(new Set(round.map((x) => x.category)).size, 4);
  });

  test('one category stays in that category', () => {
    const round = T.buildRound(bank(), { ...setup, category: 'space', count: 10 }, {}, rng(2));
    assert.equal(round.length, 10);
    assert.ok(round.every((x) => x.category === 'space'));
  });

  test('respects recent: nothing shown lately while fresh ones remain', () => {
    const pool = bank(['space'], 12);
    const recent = pool.space.slice(0, 7).map((q) => q.id);
    for (let seed = 1; seed < 20; seed += 1) {
      const round = T.buildRound(pool, { ...setup, category: 'space', count: 5 }, { recent }, rng(seed));
      assert.ok(round.every((x) => !recent.includes(x.question.id)));
    }
  });

  test('still fills a round when recent would empty the pool', () => {
    const pool = bank(['space'], 6);
    const recent = pool.space.map((q) => q.id);
    const round = T.buildRound(pool, { ...setup, category: 'space', count: 5 }, { recent }, rng(4));
    assert.equal(round.length, 5);
  });

  test('a small bank gives a shorter round, never a repeat', () => {
    const round = T.buildRound(bank(['space'], 3), { ...setup, category: 'space', count: 10 }, {}, rng(5));
    assert.equal(round.length, 3);
  });

  test('respects the language of word games', () => {
    const pool = {
      words: [
        mk('words', 'easy', 1, { lang: 'en' }), mk('words', 'easy', 2, { lang: 'en' }),
        mk('words', 'easy', 3, { lang: 'es' }), mk('words', 'easy', 4, { lang: 'es' }),
        mk('words', 'easy', 5)
      ]
    };
    const es = T.buildRound(pool, { level: 'easy', category: 'words', count: 15, lang: 'es' }, {}, rng(1));
    assert.deepEqual(es.map((x) => x.question.lang).sort(), ['both', 'es', 'es']);
    const en = T.buildRound(pool, { level: 'easy', category: 'words', count: 15, lang: 'en' }, {}, rng(1));
    assert.ok(en.every((x) => x.question.lang !== 'es'));
  });

  test('only the chosen level is drawn', () => {
    const pool = { space: [mk('space', 'easy', 1), mk('space', 'hard', 1), mk('space', 'hard', 2)] };
    const round = T.buildRound(pool, { level: 'hard', category: 'space', count: 5, lang: 'en' }, {}, rng(1));
    assert.ok(round.every((x) => x.question.level === 'hard'));
  });

  test('a missed question is far likelier to return than a mastered one', () => {
    const pool = bank(['space'], 2);
    const [missed, mastered] = pool.space;
    const day = 5000;
    const memory = { seen: { [missed.id]: [0, 1, day - 30], [mastered.id]: [3, 0, day - 30] } };
    let first = 0;
    for (let seed = 1; seed <= 400; seed += 1) {
      const round = T.buildRound(pool, { level: 'medium', category: 'space', count: 1, lang: 'en' }, memory, rng(seed), day);
      if (round[0].question.id === missed.id) first += 1;
    }
    assert.ok(first > 340, `missed came first ${first} of 400 times`);
  });
});

describe('choices and judging', () => {
  test('Easy always gets three choices, and keeps the answer', () => {
    for (let a = 0; a < 4; a += 1) {
      const q = mk('space', 'easy', 1, { answer: a });
      const ch = T.makeChoices(q, 'easy');
      assert.equal(ch.length, 3);
      assert.ok(ch.some((c) => c.index === a));
    }
  });

  test('Medium and Hard keep all four', () => {
    assert.equal(T.makeChoices(mk('space', 'hard', 1), 'hard').length, 4);
  });

  test('judge compares against the shared answer index', () => {
    const q = mk('space', 'medium', 1, { answer: 2 });
    assert.deepEqual(T.judge(q, 2), { right: true, answerIndex: 2 });
    assert.deepEqual(T.judge(q, '0'), { right: false, answerIndex: 2 });
  });

  test('a one-language card keeps its language; a both card follows the child', () => {
    assert.equal(T.cardLang({ lang: 'en' }, 'es'), 'en');
    assert.equal(T.cardLang({ lang: 'es' }, 'en'), 'es');
    assert.equal(T.cardLang({ lang: 'both' }, 'es'), 'es');
  });

  test('text never comes back empty when a language is missing', () => {
    const q = { q: { en: 'Only English?' }, why: { es: 'Solo español.' }, choices: [{ en: 'Yes' }] };
    assert.equal(T.text(q, 'q', 'es'), 'Only English?');
    assert.equal(T.text(q, 'why', 'en'), 'Solo español.');
    assert.equal(T.text(q, 0, 'es'), 'Yes');
  });
});

describe('feedback', () => {
  const q = mk('space', 'medium', 1, { answer: 0 });
  test('right, in both languages', () => {
    assert.equal(T.feedbackLine(q, true, 'en', 'medium'), 'Yes! Aa.');
    assert.equal(T.feedbackLine(q, true, 'es', 'medium'), '¡Sí! Aa es.');
  });
  test('a miss is told kindly, by level, and never says "wrong"', () => {
    assert.equal(T.feedbackLine(q, false, 'en', 'easy'), 'Good try. It is Aa.');
    assert.equal(T.feedbackLine(q, false, 'en', 'medium'), 'Close. It is Aa.');
    assert.equal(T.feedbackLine(q, false, 'en', 'hard'), 'Not this time. It is Aa.');
    assert.equal(T.feedbackLine(q, false, 'es', 'easy'), 'Buen intento. Es Aa es.');
    assert.equal(T.feedbackLine(q, false, 'es', 'medium'), 'Casi. Es Aa es.');
    assert.equal(T.feedbackLine(q, false, 'es', 'hard'), 'Esta vez no. Es Aa es.');
    for (const level of ['easy', 'medium', 'hard']) {
      assert.doesNotMatch(T.feedbackLine(q, false, 'en', level), /wrong/i);
    }
  });
  test('a second look that lands', () => {
    assert.equal(T.feedbackLine(q, true, 'en', 'hard', true), 'Got it this time. Aa.');
    assert.equal(T.feedbackLine(q, true, 'es', 'hard', true), 'Esta vez sí. Aa es.');
  });
  test('card words fill their blanks', () => {
    assert.equal(T.ui('count', 'es', { n: 3, total: 10 }), 'Pregunta 3 de 10');
    assert.equal(T.ui('langPill', 'en'), 'Español');
  });
});

describe('second looks', () => {
  const item = (n, right, again = false) => ({ question: mk('space', 'easy', n), category: 'space', right, again });
  test('the first two misses, in order, marked again', () => {
    const round = { list: [item(1, true), item(2, false), item(3, false), item(4, false)] };
    const extra = T.secondLooks(round);
    assert.equal(extra.length, 2);
    assert.deepEqual(extra.map((x) => x.question.id), ['space-easy-002', 'space-easy-003']);
    assert.ok(extra.every((x) => x.again && x.right === undefined));
  });
  test('nothing missed, nothing added; a second look is never looked at twice', () => {
    assert.equal(T.secondLooks({ list: [item(1, true)] }).length, 0);
    assert.equal(T.secondLooks({ list: [item(1, false, true)] }).length, 0);
  });
});

describe('memory', () => {
  test('record counts right and wrong and stamps the day', () => {
    const m = {};
    T.record(m, 'a', false, 10);
    T.record(m, 'a', true, 12);
    assert.deepEqual(m.seen.a, [1, 1, 12]);
    assert.deepEqual(m.recent, ['a']);
  });
  test('recent is capped at sixty, newest kept', () => {
    const m = {};
    for (let i = 0; i < 75; i += 1) T.record(m, `q${i}`, true, 1);
    assert.equal(m.recent.length, T.RECENT_CAP);
    assert.equal(m.recent[m.recent.length - 1], 'q74');
    assert.equal(m.recent[0], 'q15');
  });
  test('seen is capped, and the least recently answered go first', () => {
    const m = {};
    for (let i = 0; i < T.SEEN_CAP + 10; i += 1) T.record(m, `q${i}`, true, 1);
    T.record(m, 'q0', true, 2);   // answered again, so it is now the newest
    const keys = Object.keys(m.seen);
    assert.equal(keys.length, T.SEEN_CAP);
    assert.ok(m.seen.q0);
    assert.ok(!m.seen.q1);
  });
  test('a malformed saved object comes back usable', () => {
    const m = T.normaliseMemory({ seen: { ok: [1, 0, 3], bad: 'x', short: [1] }, recent: 'no', stars: [], level: 'huge', count: 7, lang: 'fr' });
    assert.deepEqual(Object.keys(m.seen), ['ok']);
    assert.deepEqual(m.recent, []);
    assert.deepEqual(m.stars, {});
    assert.equal(m.level, undefined);
    assert.equal(m.count, undefined);
    assert.equal(m.lang, undefined);
    assert.deepEqual(T.normaliseMemory(null).seen, {});
  });
  test('good settings survive', () => {
    const m = T.normaliseMemory({ level: 'hard', count: 15, lang: 'es', last: { day: 4, ids: ['a'] } });
    assert.equal(m.level, 'hard');
    assert.equal(m.count, 15);
    assert.equal(m.lang, 'es');
    assert.deepEqual(m.last, { day: 4, ids: ['a'] });
  });
});

describe('stars and ranks', () => {
  test('one star per right answer, second looks included', () => {
    const list = [{ right: true }, { right: false }, { right: true, again: true }, {}];
    assert.equal(T.starsFor({ list }), 2);
  });
  test('rank thresholds', () => {
    assert.equal(T.rank(0).name, 'Sprout');
    assert.equal(T.rank(9).name, 'Sprout');
    assert.equal(T.rank(10).name, 'Explorer');
    assert.equal(T.rank(24).name, 'Explorer');
    assert.equal(T.rank(25).name, 'Guide');
    assert.equal(T.rank(60).es, 'Experto');
    assert.equal(T.rank(119).name, 'Expert');
    assert.equal(T.rank(120).name, 'Master');
    assert.equal(T.rank(500).next, null);
  });
  test('how far to the next rank', () => {
    assert.deepEqual(T.rank(11).next, { name: 'Guide', es: 'Guía', need: 14 });
  });
});

describe('facts collected', () => {
  test('counts answered ids against the bank, by level', () => {
    const manifest = { categories: [
      { id: 'space', counts: { easy: 3, medium: 3, hard: 3 } },
      { id: 'body', counts: { easy: 3, medium: 0, hard: 3 } }
    ] };
    const memory = { seen: { 'space-easy-001': [1, 0, 1], 'space-easy-002': [0, 1, 1], 'body-hard-001': [1, 0, 1] } };
    assert.deepEqual(T.factsCollected(memory, manifest, 'easy'), { got: 2, total: 6 });
    assert.deepEqual(T.factsCollected(memory, manifest), { got: 3, total: 15 });
    assert.equal(T.seenIn(memory, 'space', 'easy'), 2);
  });
});

describe('the shipped bank', () => {
  const manifest = JSON.parse(readFileSync(new URL('../../data/fun/trivia/manifest.json', import.meta.url)));
  test('every category can fill a round at every level, in both languages', () => {
    const pool = {};
    for (const c of manifest.categories) {
      pool[c.id] = JSON.parse(readFileSync(new URL(`../../data/fun/trivia/${c.file}`, import.meta.url))).questions;
    }
    for (const level of T.LEVEL_IDS) {
      for (const lang of ['en', 'es']) {
        for (const category of [...Object.keys(pool), 'mixed']) {
          const round = T.buildRound(pool, { level, lang, category, count: T.defaultCount(level) }, {}, rng(9));
          assert.ok(round.length >= 3, `${category}/${level}/${lang} drew ${round.length}`);
          for (const x of round) {
            const ch = T.makeChoices(x.question, level);
            assert.ok(T.text(x.question, 'q', T.cardLang(x.question, lang)));
            assert.ok(ch.some((c) => c.index === x.question.answer));
          }
        }
      }
    }
  });
});
