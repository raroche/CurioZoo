/**
 * offline.js — switch on the offline copy, and take updates at a safe moment.
 *
 * The worker itself is /sw.js; this is the page's half. It registers the
 * worker, and when a new version has finished downloading it waits for the
 * child to be on the home page, in every open tab, before switching over,
 * because switching in the middle of a round would reload the page under them.
 *
 * It does nothing where there is no service worker: an old browser, a file
 * opened from disk, or a phone wrapper that serves the files itself (which is
 * offline already, so it has no need of one).
 */

let registration = null;
let lastCheck = 0;
let reloadAtHome = false;   // a new version took over while this tab was mid-round
const atHome = () => { const h = location.hash || '#/home'; return h === '#/home' || h === '#/'; };

/* Tabs tell each other where they are. An update is switched on from a tab
   at home, but it takes over every open tab, so it waits while any other tab
   is in the middle of something. */
const tabs = typeof BroadcastChannel === 'function' ? new BroadcastChannel('curiozoo-tabs') : null;
if (tabs) tabs.onmessage = (e) => { if (e.data === 'where') tabs.postMessage({ busy: !atHome() }); };

/** True if another open tab answers that it is away from home. */
function anotherTabBusy() {
  if (!tabs) return Promise.resolve(false);
  return new Promise((resolve) => {
    let busy = false;
    const hear = (e) => { if (e.data && e.data.busy) busy = true; };
    tabs.addEventListener('message', hear);
    tabs.postMessage('where');
    setTimeout(() => { tabs.removeEventListener('message', hear); resolve(busy); }, 300);
  });
}
/* A home-screen app on an iPad can stay open for days and never navigate, so
   it also looks for a new version when it comes back to the front, but not
   more than once an hour. */
const CHECK_EVERY = 60 * 60 * 1000;

export function startOffline() {
  if (!('serviceWorker' in navigator)) return;
  if (!/^https?:$/.test(location.protocol)) return;

  /* Only an UPDATE reloads. On the very first install the worker takes the
     page too (see clients.claim in sw.js), and reloading then would flash the
     page for nothing. */
  const hadWorker = !!navigator.serviceWorker.controller;
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadWorker || reloading) return;
    /* Another tab switched while this one is mid-round: finish the round,
       and reload on the next trip home (the router calls applyUpdateIfSafe). */
    if (!atHome()) { reloadAtHome = true; return; }
    reloading = true;
    location.reload();
  });

  /* After the page has loaded, so saving seven hundred files never competes
     with the child's first screen. */
  const go = () => {
    navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' })
      .then((reg) => {
        registration = reg;
        lastCheck = Date.now();
        reg.addEventListener('updatefound', () => {
          const next = reg.installing;
          if (next) next.addEventListener('statechange', () => applyUpdateIfSafe());
        });
        applyUpdateIfSafe();
      })
      .catch((err) => console.warn('[offline] no offline copy:', err));
  };
  if (document.readyState === 'complete') go();
  else window.addEventListener('load', go, { once: true });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible' || !registration) return;
    if (Date.now() - lastCheck < CHECK_EVERY) return;
    lastCheck = Date.now();
    registration.update().catch(() => { /* offline: try again later */ });
  });
}

/**
 * Switch to a downloaded update, but only on the home page.
 *
 * The router calls this on every visit to #/home, and the worker calls it
 * when a download finishes. Anywhere else it waits: the next trip home will
 * pick it up.
 */
export function applyUpdateIfSafe() {
  if (!atHome()) return;
  if (reloadAtHome) { reloadAtHome = false; location.reload(); return; }
  const waiting = registration && registration.waiting;
  if (!waiting || !navigator.serviceWorker.controller) return;
  anotherTabBusy().then((busy) => {
    if (busy || !atHome() || registration.waiting !== waiting) return;
    waiting.postMessage({ type: 'curiozoo-update' });
  });
}
