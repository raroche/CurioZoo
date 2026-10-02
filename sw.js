/**
 * sw.js — the offline copy of CurioZoo.
 *
 * A service worker: a small script the browser keeps beside the site. It saves
 * every file the site needs on the device, then answers from that copy, so a
 * child on a plane gets the whole zoo with no connection at all.
 *
 * The two lines below are placeholders. The deploy fills them in:
 *   node tools/offline.mjs --stamp
 * writes the site's version and the list of every file with a hash of its
 * contents. In the repository they stay as they are, and a worker with
 * VERSION 'dev' does nothing at all, so a local server always shows the code
 * on disk and never a stale saved copy.
 *
 * How an update works, and why it waits:
 *
 *   A new deploy changes this file, so the browser installs the new worker
 *   beside the old one. Install copies across every file whose hash has not
 *   changed and downloads only the ones that have, so a deploy that touched
 *   one trivia file costs one trivia file, not the whole site.
 *
 *   The new worker then WAITS. It does not take over the open page, because
 *   the page loads rooms lazily: a child halfway through a lesson would get
 *   the old app.js and the new chess code, which is the half-updated page
 *   netlify.toml describes. The page tells it to take over only when the
 *   child is back on the home page, and reloads there (see assets/js/offline.js).
 */

const VERSION = 'dev';
const FILES = [];

const PREFIX = 'curiozoo-';
const CACHE = PREFIX + VERSION;
/* The header a saved file carries its hash in, so the next install can tell
   whether it is still current without downloading it again. */
const HASH = 'x-curiozoo-hash';
/* Enough to keep a slow connection busy without opening seven hundred
   requests at once on an old iPad. */
const PARALLEL = 8;

const dev = VERSION === 'dev';
const urlOf = (path) => new URL(path, self.registration.scope).href;

self.addEventListener('install', (event) => {
  if (dev) { self.skipWaiting(); return; }
  event.waitUntil(saveEverything());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names
      .filter((n) => n.startsWith(PREFIX) && n !== CACHE)
      .map((n) => caches.delete(n)));
    /* The first install takes the open page at once. Nothing old is running
       yet, so nothing can be mixed. An update only gets here after the page
       asked for it, and the page reloads straight after. */
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'curiozoo-update') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  if (dev) return;
  const req = event.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(answer(req));
});

/**
 * Every file in FILES, into this version's cache.
 *
 * Unchanged files come from the old cache; the rest from the network. One
 * failure fails the whole install, on purpose: half a copy would open on the
 * plane and then break on the first room that was missing. A failed install
 * leaves the old copy in charge and the browser tries again on the next visit.
 */
async function saveEverything() {
  const cache = await caches.open(CACHE);
  const old = await oldCaches();
  const queue = FILES.slice();

  async function worker() {
    while (queue.length) {
      const [path, hash] = queue.shift();
      const key = urlOf(path);
      if (await copyIfSame(old, cache, key, hash)) continue;
      const res = await fetch(key, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`offline copy: ${path} answered ${res.status}`);
      await cache.put(key, stamp(res, hash));
    }
  }
  await Promise.all(Array.from({ length: PARALLEL }, worker));
}

async function oldCaches() {
  const names = (await caches.keys()).filter((n) => n.startsWith(PREFIX) && n !== CACHE);
  return Promise.all(names.map((n) => caches.open(n)));
}

async function copyIfSame(old, cache, key, hash) {
  for (const c of old) {
    const hit = await c.match(key);
    if (hit && hit.headers.get(HASH) === hash) {
      await cache.put(key, hit);
      return true;
    }
  }
  return false;
}

/** The same response, wearing its hash. Headers on a fetched response are
    read-only, so this builds a new one around the same body. */
function stamp(res, hash) {
  const headers = new Headers(res.headers);
  headers.set(HASH, hash);
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
}

/**
 * Saved copy first, network second.
 *
 * Saved first is what makes the page whole: every file comes from the same
 * version, whatever the network is doing. A page load (a navigation) is the
 * app itself, so anything that opens the site gets index.html. Anything not in
 * the list -- this worker, a stray link -- goes to the network as normal.
 */
async function answer(req) {
  const cache = await openCache();
  const navigating = req.mode === 'navigate';
  /* Looked up by address without the query string. The direct lookup is an
     index hit; cache.match(req, { ignoreSearch: true }) reads every one of
     seven hundred entries on each request, and a room that loads twenty
     modules took over a second to open offline because of it. */
  const url = new URL(req.url);
  const hit = await cache.match(url.origin + url.pathname)
    || (navigating ? await cache.match(urlOf('index.html')) : undefined);
  if (hit) return hit;
  try {
    return await fetch(req);
  } catch (err) {
    if (navigating) {
      const home = await cache.match(urlOf('index.html'));
      if (home) return home;
    }
    throw err;
  }
}

/* Opened once per worker, not once per request. */
let opening = null;
function openCache() {
  if (!opening) opening = caches.open(CACHE);
  return opening;
}
