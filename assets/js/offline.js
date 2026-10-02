/**
 * offline.js — switch on the offline copy, and take updates at a safe moment.
 *
 * The worker itself is /sw.js; this is the page's half. It registers the
 * worker, and when a new version has finished downloading it waits for the
 * child to be on the home page before switching over, because switching in
 * the middle of a round would reload the page under them.
 *
 * It does nothing where there is no service worker: an old browser, a file
 * opened from disk, or a phone wrapper that serves the files itself (which is
 * offline already, so it has no need of one).
 */

let registration = null;
let lastCheck = 0;
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
  const waiting = registration && registration.waiting;
  if (!waiting || !navigator.serviceWorker.controller) return;
  const hash = location.hash || '#/home';
  if (hash !== '#/home' && hash !== '#/') return;
  waiting.postMessage({ type: 'curiozoo-update' });
}
