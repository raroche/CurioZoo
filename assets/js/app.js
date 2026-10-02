/**
 * app.js — CurioZoo shell.
 *
 * The theme, the hash router, one delegated event listener, and boot. That is
 * all. It knows no room by name: every room is an entry in ./rooms/registry.js
 * and a folder under ./rooms, loaded the first time a child opens it. Shared
 * state and DOM helpers live in ./modules/shell.js, and the rules a room needs
 * live in ./modules next to their tests.
 *
 * It used to be all of that in one 1,864-line file, and after that a router
 * that imported every room and a click handler that knew every button in the
 * zoo. Adding a game meant editing it. Now adding a game means adding a folder
 * and one registry entry, and this file does not change. The import graph is
 * one-directional -- app.js loads rooms, rooms import shell and modules,
 * modules import nothing of theirs -- so a new room cannot create a cycle.
 *
 * No framework: the whole app is a router plus template strings, which is
 * genuinely less code than any library would be, with nothing to install and
 * nothing to go stale.
 */

import * as data from './modules/data.js';
import * as storage from './modules/storage.js';
import * as speech from './modules/speech.js';
import { icon } from './modules/icons.js';
import { hydrateMascots, mascot, setMood } from './modules/mascot.js';
import { applyStyles } from './modules/style.js';
import { $, applySpeechButton, hydrateIcons, savingOffline, setBackResolver, setLoadingCreature, setSavingCheck, showError, state, whileLoading } from './modules/shell.js';
import { backTarget, roomById, roomFile, roomForRoute } from './rooms/registry.js';
import { startOffline, applyUpdateIfSafe, isSaving } from './offline.js';

/* ------------------------------------------------------------------ */
/* Theme                                                               */
/* ------------------------------------------------------------------ */

function applyTheme() {
  const t = state.settings.theme;
  document.documentElement.setAttribute('data-theme', t === 'auto' ? 'auto' : t);
  if (t === 'auto') document.documentElement.removeAttribute('data-theme');
  const dark = t === 'dark'
    || (t === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const btn = $('#gp-theme-toggle');
  if (btn) {
    btn.innerHTML = icon(dark ? 'sun' : 'moon');
    btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  }
}

function toggleTheme() {
  const dark = document.documentElement.getAttribute('data-theme') === 'dark'
    || (!document.documentElement.getAttribute('data-theme')
        && window.matchMedia('(prefers-color-scheme: dark)').matches);
  state.settings.theme = dark ? 'light' : 'dark';
  storage.setSetting('theme', state.settings.theme);
  applyTheme();
}

/* ------------------------------------------------------------------ */
/* Rooms, fetched the first time somebody opens one                    */
/* ------------------------------------------------------------------ */

/**
 * Every room is downloaded only when a child first opens it: its code, its
 * screens and its styles, all at once. A child who only ever wanted the flag
 * game never downloads the Chess Club. Each room is fetched once; the promise
 * is kept, so a second visit is instant and two quick taps fetch it once.
 */
const opened = new Map();     // room id -> Promise of its room.js module
let current = null;           // the room whose screen is showing

function openRoom(entry) {
  if (!opened.has(entry.id)) {
    const loading = Promise.all([
      entry.code(),
      entry.screens ? fetchText(roomFile(entry.screens)) : null,
      entry.css ? loadStyles(roomFile(entry.css)) : null
    ]).then(async ([room, html]) => {
      if (html) mountScreens(entry, html);
      if (room.init) await room.init();
      return room;
    });
    /* A failure is not remembered: on a flaky connection the next tap tries
       again instead of finding the same broken promise forever. */
    loading.catch(() => opened.delete(entry.id));
    opened.set(entry.id, loading);
  }
  return opened.get(entry.id);
}

async function fetchText(url) {
  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`Could not load ${url} (HTTP ${res.status})`);
  return res.text();
}

/* Resolves once the rules are in force, so a room's screens never show for a
   moment without their styles. */
function loadStyles(href) {
  if (document.querySelector(`link[rel="stylesheet"][href="${href}"]`)) return null;
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = () => resolve();
    link.onerror = () => { link.remove(); reject(new Error(`Could not load ${href}`)); };
    document.head.appendChild(link);
  });
}

/**
 * Put a room's screens on the page, just before the error screen.
 *
 * Everything index.html's own markup gets at boot, these get here: icons,
 * mascots, data-style, and the room's creature in its banner, alive, and
 * drawn from the same registry entry as its card so the two never drift.
 */
function mountScreens(entry, html) {
  if (document.querySelector(`#gp-main > [data-room="${entry.id}"]`)) return;
  const tpl = document.createElement('template');
  tpl.innerHTML = html;
  const screens = [...tpl.content.children].filter((el) => el.matches('section.gp-screen'));
  if (!screens.length) throw new Error(`${entry.screens} holds no <section class="gp-screen">`);
  $('#screen-error').before(...screens);
  for (const el of screens) {
    el.dataset.room = entry.id;
    hydrateIcons(el);
    hydrateMascots(el);
    applyStyles(el);
    /* The room's creature, alive: it breathes and blinks on its banner. */
    el.querySelectorAll('[data-room-pic]').forEach((pic) => {
      const room = roomById(pic.dataset.roomPic);
      if (room && !pic.childElementCount) pic.innerHTML = mascot({ kind: room.creature });
    });
  }
}

/* ------------------------------------------------------------------ */
/* Router                                                              */
/* ------------------------------------------------------------------ */

async function route() {
  const hash = location.hash || '#/home';
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  const head = parts[0] || 'home';
  const entry = roomForRoute(head);
  if (!entry) { location.hash = '#/home'; return; }

  /* The one safe moment to switch to a new version: no round is open. */
  if (entry.id === 'home') applyUpdateIfSafe();

  let room;
  try {
    /* A room's first visit downloads its code; on a slow line, or while the
       first visit is also saving the whole zoo for offline play, that can
       take a moment, so the room's creature says what is happening. */
    setLoadingCreature(entry.creature);
    room = await whileLoading(openRoom(entry), () => ({
      title: `Opening ${entry.name || 'CurioZoo'}…`,
      text: savingOffline()
        ? 'This first visit also saves every game on this device, so CurioZoo works without the internet. Next time it opens at once.'
        : 'Getting everything ready.'
    }));
  } catch (err) {
    console.error(err);
    showError(`${entry.name || 'This page'} could not be loaded. Check the connection and try again.`);
    return;
  }
  /* The child may have moved on while it loaded. */
  if ((location.hash || '#/home') !== hash) return;
  if (current && current !== room && current.leave) {
    try { current.leave(); } catch (err) { console.error(err); }
  }
  current = room;
  room.render(parts.length ? parts : ['home']);
}

/* ------------------------------------------------------------------ */
/* Events                                                              */
/* ------------------------------------------------------------------ */

/* One listener for the whole page. A click belongs to whichever room is
   showing, so two rooms can use the same attribute without one stealing the
   other's taps -- which used to be a real hazard: the chess lesson's answer
   cards had to be checked before the quiz's, or the quiz grabbed them. */
function onClick(ev) {
  /* iOS refuses to speak until synthesis is triggered inside a real gesture. */
  if (!state.audioUnlocked) { speech.unlock(); state.audioUnlocked = true; }
  if (current && current.onClick) current.onClick(ev);
}

function onKeydown(ev) {
  if (current && current.onKeydown) current.onKeydown(ev);
}

/**
 * The ARIA radio group pattern for the grade, question-count and flag-count
 * pickers.
 *
 * These are buttons wearing role="radio". The README promised full keyboard
 * control and they did not have it: every pill was its own tab stop and the
 * arrow keys did nothing at all. A radio group should be a single tab stop
 * that the arrows move through, selecting as they go.
 */
function radioGroupKeys(ev) {
  const el = ev.target;
  if (!el || !el.closest) return false;
  const group = el.closest('[role="radiogroup"]');
  if (!group || el.getAttribute('role') !== 'radio') return false;

  const radios = Array.from(group.querySelectorAll('[role="radio"]'));
  const at = radios.indexOf(el);
  if (at === -1) return false;

  if (ev.key === ' ' || ev.key === 'Enter') { ev.preventDefault(); el.click(); return true; }

  let to = -1;
  if (ev.key === 'ArrowRight' || ev.key === 'ArrowDown') to = (at + 1) % radios.length;
  else if (ev.key === 'ArrowLeft' || ev.key === 'ArrowUp') to = (at - 1 + radios.length) % radios.length;
  else if (ev.key === 'Home') to = 0;
  else if (ev.key === 'End') to = radios.length - 1;
  else return false;

  ev.preventDefault();
  const groupId = group.id;
  radios[to].click();
  /* Clicking re-renders the group, so the element to focus is looked up again
     rather than held across the redraw. */
  const after = groupId ? document.getElementById(groupId) : group;
  const fresh = after && after.querySelectorAll('[role="radio"]')[to];
  if (fresh) fresh.focus();
  return true;
}

/* ------------------------------------------------------------------ */
/* The mascot                                                          */
/* ------------------------------------------------------------------ */

/**
 * Everything that makes the mascot in the top bar feel watched-over.
 *
 * All of it is chrome, none of it is load-bearing, and every listener is
 * passive or trivial. Answering a question is wired where the answer is
 * marked, not here: see rooms/gifted/gifted.js and rooms/fun/fun.js.
 */
function wireMascot() {
  const brand = $('.gp-brand');
  const mark = brand && brand.querySelector('[data-mascot]');
  if (!mark) return;

  /* The one piece of the chrome a child is allowed to poke at for no reason. */
  brand.addEventListener('pointerenter', () => setMood(mark, 'curious', 2600));
  brand.addEventListener('click', () => setMood(mark, 'happy', 1800));

  /* Flipping the lights gets a wink. There is no reason for this beyond the
     fact that a child will flip it twenty times to see what happens, and the
     twentieth time should still answer. */
  $('#gp-theme-toggle').addEventListener('click', () => setMood(mark, 'wink', 1400));

  /* It looks over at whichever room you are pointing at. Delegated, because
     the room cards are rebuilt from ROOMS on every visit to the home page. */
  document.addEventListener('pointerover', (ev) => {
    if (ev.target.closest && ev.target.closest('.cz-tile:not(.is-soon)')) {
      setMood(mark, 'curious', 2200);
    }
  }, { passive: true });

  /* Left alone, it dozes off, and any sign of life wakes it. Forty seconds is
     long enough that it never nods off while a child is reading a question,
     and short enough that an abandoned iPad shows something friendly rather
     than a page that looks broken.

     pointermove fires hundreds of times a second, so the timer is only reset
     twice a second; without that this would be the most expensive listener on
     the page by a wide margin. */
  const IDLE = 40000;
  let timer = null;
  let last = 0;
  const doze = () => setMood(mark, 'sleep');
  const wake = () => {
    const now = Date.now();
    if (now - last < 500 && timer) return;
    last = now;
    clearTimeout(timer);
    const svg = mark.querySelector('.cz-mascot');
    if (svg && svg.dataset.mood === 'sleep') setMood(mark, 'idle');
    timer = setTimeout(doze, IDLE);
  };
  ['pointerdown', 'pointermove', 'keydown', 'wheel', 'touchstart']
    .forEach((e) => document.addEventListener(e, wake, { passive: true }));
  wake();
}

/* ------------------------------------------------------------------ */
/* Boot                                                                */
/* ------------------------------------------------------------------ */

async function boot() {
  hydrateIcons();
  hydrateMascots();
  applyTheme();
  applySpeechButton();
  setBackResolver(backTarget);

  document.addEventListener('click', onClick);
  document.addEventListener('keydown', (ev) => { radioGroupKeys(ev); });
  document.addEventListener('keydown', onKeydown);
  window.addEventListener('hashchange', route);

  $('#gp-theme-toggle').addEventListener('click', toggleTheme);
  wireMascot();
  $('#gp-speak-toggle').addEventListener('click', () => {
    state.settings.readAloud = !state.settings.readAloud;
    storage.setSetting('readAloud', state.settings.readAloud);
    applySpeechButton();
    if (!state.settings.readAloud) speech.cancel();
  });

  window.matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', () => { if (state.settings.theme === 'auto') applyTheme(); });

  try {
    state.manifest = await data.loadManifest();
  } catch (err) {
    console.error(err);
    showError('The question list could not be loaded. If you opened index.html directly from the file system, run a small web server in this folder instead — for example: python3 tools/serve.py 8000');
    return;
  }

  setSavingCheck(isSaving);
  route();
  startOffline();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
