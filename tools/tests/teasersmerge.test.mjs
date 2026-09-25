/**
 * The teaser merge tool: a batch is all in or all out.
 *
 * Run against a copy of the bank in a temporary folder, so the real files
 * are never touched by a test.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const TOOL = new URL('../teasersmerge.mjs', import.meta.url).pathname;
const BANK = new URL('../../data/teasers/', import.meta.url).pathname;

function sandbox() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'teasers-'));
  fs.mkdirSync(path.join(dir, 'data/teasers'), { recursive: true });
  for (const f of ['easy.json', 'medium.json', 'hard.json']) {
    fs.copyFileSync(path.join(BANK, f), path.join(dir, 'data/teasers', f));
  }
  return dir;
}
const snapshot = (dir) => ['easy', 'medium', 'hard']
  .map((l) => fs.readFileSync(path.join(dir, `data/teasers/${l}.json`), 'utf8'));
const run = (dir, batch) => {
  fs.writeFileSync(path.join(dir, 'batch.json'), JSON.stringify(batch));
  return spawnSync(process.execPath, [TOOL, 'batch.json'], { cwd: dir, encoding: 'utf8' });
};

const good = (n) => ({
  level: 'easy', kind: 'number', emoji: '🍎',
  q: { en: `A test teaser number ${n}: what is 2 + ${n}?`, es: `Un acertijo de prueba ${n}: ¿cuánto es 2 + ${n}?` },
  choices: [{ en: String(2 + n), es: String(2 + n) }, { en: '1', es: '1' }, { en: '0', es: '0' }],
  answer: 0, value: 2 + n, check: `2 + ${n}`,
  why: { en: 'Add them.', es: 'Súmalos.' }, hint: { en: 'Add.', es: 'Suma.' },
  source: 'https://example.org/test', sourceName: 'Test',
  rights: 'traditional', origin: 'basic exercise', alsoFound: [],
  qa: { solved: '2026-09-25', checked: '2026-09-25' }
});

describe('teasersmerge', () => {
  test('one bad item in a batch means nothing is written', () => {
    const dir = sandbox();
    const before = snapshot(dir);
    const bad = { ...good(2), q: { en: 'English only?' } };
    const r = run(dir, { items: [good(1), bad] });
    assert.notEqual(r.status, 0);
    assert.match(r.stderr, /Nothing written/);
    assert.deepEqual(snapshot(dir), before);
    assert.deepEqual(fs.readdirSync(path.join(dir, 'data/teasers')).filter((f) => f.includes('.tmp')), []);
  });

  test('a good batch is added with the next free ids', () => {
    const dir = sandbox();
    const was = JSON.parse(snapshot(dir)[0]).items.length;
    const r = run(dir, { items: [good(3), good(4)] });
    assert.equal(r.status, 0, r.stderr);
    const items = JSON.parse(snapshot(dir)[0]).items;
    assert.equal(items.length, was + 2);
    assert.match(items.at(-1).id, /^easy-\d{3}$/);
    assert.equal(items.at(-1).rights, 'traditional');
  });

  test('a modern-original teaser is refused', () => {
    const dir = sandbox();
    const before = snapshot(dir);
    const r = run(dir, { items: [{ ...good(5), rights: 'modern-original' }] });
    assert.notEqual(r.status, 0);
    assert.deepEqual(snapshot(dir), before);
  });
});
