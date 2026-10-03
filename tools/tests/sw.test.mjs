/**
 * Tests for the offline worker (sw.js), run in node with a pretend browser:
 * the messages a first install sends the page, in order, and never late.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { stampWorker } from '../offline.mjs';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/** Install a stamped sw.js whose downloads answer as `plan(path)` says. */
async function install(paths, plan) {
  const said = [];
  const handlers = {};
  const store = new Map();
  const cache = { put: async (k, v) => { store.set(k, v); }, match: async (k) => store.get(k) };
  const self = {
    registration: { scope: 'https://zoo.test/' },
    location: { origin: 'https://zoo.test' },
    addEventListener: (type, fn) => { handlers[type] = fn; },
    skipWaiting: () => {},
    clients: { matchAll: async () => [{ postMessage: (m) => said.push(m) }], claim: async () => {} }
  };
  const context = {
    self, URL, Headers, Response, console, setTimeout, Date,
    caches: { open: async () => cache, keys: async () => [] },
    fetch: async (url) => {
      const { ms = 0, status = 200 } = plan(new URL(url).pathname.slice(1));
      await wait(ms);
      return new Response('x', { status });
    }
  };
  const files = paths.map((p) => ({ path: p, hash: `h-${p}` }));
  vm.runInNewContext(stampWorker(fs.readFileSync('sw.js', 'utf8'), { files, version: 'test1' }), context);
  let done;
  handlers.install({ waitUntil: (p) => { done = p; } });
  let failed = null;
  try { await done; } catch (err) { failed = err; }
  /* Whatever is said after the install settled is said too late: the
     browser may already have stopped the worker. */
  const atEnd = said.length;
  await wait(400);
  return { said, atEnd, failed, saved: store.size };
}

test('a failed download ends with "failed", and nothing is said after it', async () => {
  const paths = Array.from({ length: 40 }, (_, i) => `f${i}.js`);
  const r = await install(paths, (p) => (p === 'f0.js' ? { ms: 20, status: 503 } : p === 'f1.js' ? { ms: 2 } : { ms: 120 }));
  assert.ok(r.failed, 'the install fails');
  const types = r.said.map((m) => m.type);
  assert.equal(types.at(-1), 'curiozoo-save-failed', types.join(' '));
  assert.ok(types.indexOf('curiozoo-saving') < types.indexOf('curiozoo-save-failed'));
  assert.equal(r.atEnd, r.said.length, 'every message was sent before the install settled');
  assert.ok(r.saved < paths.length, 'the other downloads stopped');
  assert.ok(r.said.every((m) => m.install === 'curiozoo-test1'), 'each message names its install');
});

test('a good install ends with "saved", sent before it settles, in order', async () => {
  const paths = Array.from({ length: 30 }, (_, i) => `g${i}.js`);
  const r = await install(paths, () => ({ ms: 5 }));
  assert.equal(r.failed, null);
  const types = r.said.map((m) => m.type);
  assert.equal(types.at(-1), 'curiozoo-saved');
  assert.equal(types.filter((t) => t === 'curiozoo-saved').length, 1);
  assert.equal(r.atEnd, r.said.length);
  const dones = r.said.filter((m) => m.type === 'curiozoo-saving').map((m) => m.done);
  assert.deepEqual(dones, [...dones].sort((a, b) => a - b), 'progress never goes backwards');
});
