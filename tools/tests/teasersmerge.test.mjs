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
  for (const f of ['easy.json', 'medium.json', 'hard.json', 'manifest.json']) {
    fs.copyFileSync(path.join(BANK, f), path.join(dir, 'data/teasers', f));
  }
  return dir;
}
const leftovers = (dir) => fs.readdirSync(path.join(dir, 'data'))
  .filter((f) => /^teasers\.(staging|old)-/.test(f));
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
    assert.deepEqual(leftovers(dir), []);
  });

  test('a good merge leaves no staging or old folders behind', () => {
    const dir = sandbox();
    const r = run(dir, { items: [good(6)] });
    assert.equal(r.status, 0, r.stderr);
    assert.deepEqual(leftovers(dir), []);
    assert.ok(fs.existsSync(path.join(dir, 'data/teasers/manifest.json')), 'the manifest came along');
  });

  test('a run killed in the middle of the swap is put right by the next one', () => {
    /* The state a kill between the two renames leaves: the old bank aside,
       a half-built staging folder, and no bank folder at all. */
    const dir = sandbox();
    const before = snapshot(dir);
    fs.renameSync(path.join(dir, 'data/teasers'), path.join(dir, 'data/teasers.old-99999'));
    fs.mkdirSync(path.join(dir, 'data/teasers.staging-99999'));
    fs.writeFileSync(path.join(dir, 'data/teasers.staging-99999/easy.json'), '{"half":');
    const r = run(dir, { items: [good(7)] });
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, /restored/);
    assert.deepEqual(leftovers(dir), []);
    const easy = JSON.parse(snapshot(dir)[0]).items;
    assert.equal(easy.length, JSON.parse(before[0]).items.length + 1);
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

describe('teaserscheck --write', () => {
  const CHECK = new URL('../teaserscheck.mjs', import.meta.url).pathname;
  test('writes nothing when the bank has errors', () => {
    const dir = sandbox();
    fs.mkdirSync(path.join(dir, 'docs/research/teasers'), { recursive: true });
    const manifest = path.join(dir, 'data/teasers/manifest.json');
    const was = fs.readFileSync(manifest, 'utf8');
    /* Break the bank: a Hard level of one teaser is far below the minimum. */
    const hard = JSON.parse(fs.readFileSync(path.join(dir, 'data/teasers/hard.json'), 'utf8'));
    hard.items = hard.items.slice(0, 1);
    fs.writeFileSync(path.join(dir, 'data/teasers/hard.json'), JSON.stringify(hard));
    const r = spawnSync(process.execPath, [CHECK, '--write'], { cwd: dir, encoding: 'utf8' });
    assert.notEqual(r.status, 0);
    assert.match(r.stdout, /nothing written/);
    assert.equal(fs.readFileSync(manifest, 'utf8'), was);
    assert.ok(!fs.existsSync(path.join(dir, 'docs/research/teasers/CREDITS.md')));
  });
});
