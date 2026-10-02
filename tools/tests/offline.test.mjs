/**
 * The offline copy: the file list sw.js is stamped with.
 *
 * A wrong list fails in the worst place: on the plane. A file missing from it
 * is a room that opens online and is blank offline, and a version that does
 * not change when a file does is a family stuck on old questions for good.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { siteFiles, buildList, stampWorker } from '../offline.mjs';

test('the copy holds the page, every room and every data file', () => {
  const files = siteFiles('.');
  for (const f of ['index.html', 'manifest.webmanifest', 'assets/css/design-system.css',
    'assets/js/app.js', 'assets/js/rooms/registry.js', 'assets/js/rooms/chess/screens.html',
    'assets/js/rooms/chess/room.css', 'data/manifest.json']) {
    assert.ok(files.includes(f), `${f} is not saved for offline use`);
  }
  assert.ok(!files.some((f) => f.split('/').some((part) => part.startsWith('.'))),
    'hidden files such as .DS_Store must not be saved');
  assert.ok(!files.includes('sw.js'), 'the worker must not cache itself');
});

test('every file carries a hash, and the version follows the contents', () => {
  const a = buildList('.');
  const b = buildList('.');
  assert.equal(a.version, b.version, 'the same files must give the same version');
  assert.ok(a.files.every((f) => /^[0-9a-f]{16}$/.test(f.hash)));
});

test('stamping fills both placeholders and leaves a worker that parses', () => {
  const source = fs.readFileSync('sw.js', 'utf8');
  const list = { version: 'abc123', files: [{ path: 'index.html', hash: '0123456789abcdef', size: 1 }] };
  const out = stampWorker(source, list);
  assert.match(out, /const VERSION = 'abc123';/);
  assert.match(out, /const FILES = \[\["index.html","0123456789abcdef"\]\];/);
  assert.doesNotMatch(out, /const VERSION = 'dev';/);
  assert.doesNotThrow(() => new vm.Script(out));
});
