/**
 * rooms/logic/hub.js — the Logic Games room, apart from the games' boards.
 *
 *   #/logic                      the hub: seven games, today's puzzles
 *   #/logic/<game>               a game's levels, chapters and collection
 *   #/logic/<game>/<chapter>     one chapter's puzzles
 *   #/logic/<game>/<chapter>/<n> one puzzle
 *   #/logic/<game>/daily         today's puzzle at the chosen level
 *
 * Each game is a file beside this one (code.js, and the others as they are
 * built), loaded the first time a child opens that game. It hands this file
 * its bank, its chapters and a board; everything else -- unlocking, stars,
 * the end-of-puzzle card, the way back -- is the same for every game and
 * lives here.
 */

import * as P from '../../modules/logicprogress.js';
import { GAMES, LEVEL_AGES, gameById } from '../../modules/logictext.js';
import { gameArt, star } from '../../modules/zooart.js';
import { today } from '../../modules/logicrng.js';
import { celebrate } from '../../modules/celebrate.js';
import { $, $$, paint, react, showError, showScreen } from '../../modules/shell.js';
import { backLink, esc, flipLang, lang, rec, save, say, stars, t, tools, winCard } from './frame.js';
import { makeDaily } from './daily.js';

/* The games that have been built, each loaded on first use. */
const LOADERS = {
  code: () => import('./code.js'),
  truth: () => import('./truth.js'),
  rule: () => import('./rule.js'),
  bridges: () => import('./bridges.js'),
  trains: () => import('./trains.js'),
  robot: () => import('./robot.js'),
  bug: () => import('./bug.js')
};
const loaded = new Map();

async function loadGame(id) {
  if (!loaded.has(id)) loaded.set(id, LOADERS[id]().then((m) => m.default));
  return loaded.get(id);
}

let view = null;     // what is on screen: { kind, game, mod, ... }

/* Each draw takes a ticket. A draw that waited (for a game or a bank) paints
   only if no newer draw has started since: two quick level taps share one
   address, so the address alone cannot tell which answer is the latest. */
let drawing = 0;
const ticket = () => ++drawing;
const stale = (n) => n !== drawing;

/* The puzzle on screen is going away: its game stops any ride or run, so
   nothing ends later on a screen the child has left. */
function leaveView() {
  if (view && view.mod && view.mod.leave) {
    try { view.mod.leave(); } catch (err) { console.error(err); }
  }
}

/** The child went to another room. */
export function leaveLogic() {
  leaveView();
  view = null;
}

/* ------------------------------------------------------------------ */
/* Routing                                                             */
/* ------------------------------------------------------------------ */

export async function renderLogic(parts) {
  const [, game, a, b] = parts;
  leaveView();
  if (!game) { drawHub(); return; }
  const meta = gameById(game);
  if (!meta || !meta.live || !LOADERS[game]) { location.replace('#/logic'); return; }
  const here = location.hash;
  const n = ticket();
  let mod;
  try {
    mod = await loadGame(game);
  } catch (err) {
    console.error(err);
    loaded.delete(game);
    if (location.hash === here && !stale(n)) showError(t('loadFail'));
    return;
  }
  if (location.hash !== here || stale(n)) return;
  if (!a) { await drawGameHome(mod); return; }
  if (a === 'daily') { await drawDaily(mod); return; }
  if (a === 'endless') {
    const r = rec();
    await drawDaily(mod, Number(b) || P.endlessCount(r, mod.id, P.levelOf(r, mod.id)) + 1);
    return;
  }
  if (!b) { await drawChapter(mod, a); return; }
  await drawPuzzle(mod, a, Number(b));
}

/** Load a level's bank for draw `n`, or show the error screen; null if
    it failed or a newer draw has started meanwhile. */
async function bankOf(mod, level, n) {
  const here = location.hash;
  try {
    const bank = await mod.bank(level);
    return location.hash === here && !stale(n) ? bank : null;
  } catch (err) {
    console.error(err);
    if (location.hash === here && !stale(n)) showError(t('loadFail'));
    return null;
  }
}

const idsOf = (bank) => bank.chapters.map((c) => c.puzzles.map((p) => p.id));

/* Words outside the drawn markup (the hub banner) follow the language. */
function paintChrome() {
  $$('[data-logic-text]').forEach((el) => { el.textContent = t(el.dataset.logicText); });
  ['screen-logichub', 'screen-logicgame', 'screen-logicplay'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.setAttribute('lang', lang());
  });
}

/* ------------------------------------------------------------------ */
/* The hub                                                             */
/* ------------------------------------------------------------------ */

function drawHub() {
  ticket();
  view = { kind: 'hub' };
  const L = lang();
  const r = rec();
  const days = P.daysThisWeek(r, today());
  const badge = P.badgeOf(P.totalStars(r));
  const tiles = GAMES.map((g, i) => {
    const inner = `
      <span class="cz-tile__pic">${gameArt(g.id)}</span>
      <span class="cz-tile__text">
        <span class="cz-tile__name">${esc(g.name[L])}</span>
        <span class="cz-tile__blurb">${esc(g.blurb[L])}</span>
        <span class="cz-tile__meta">${esc(g.live ? g.meta[L] : t('soon'))}</span>
      </span>`;
    return g.live
      ? `<a class="cz-tile cz-tile--jade" href="#/logic/${g.id}" data-n="${i}">${inner}
           <span class="cz-tile__go" aria-hidden="true">&rarr;</span></a>`
      : `<div class="cz-tile cz-tile--jade is-soon" aria-disabled="true">${inner}</div>`;
  }).join('');

  const daily = GAMES.filter((g) => g.live).map((g) => {
    const level = P.levelOf(r, g.id);
    const got = P.dailyStars(r, g.id, level, today());
    return `<a class="cz-logic-daily" href="#/logic/${g.id}/daily">
      <span class="cz-logic-daily__pic">${gameArt(g.id)}</span>
      <span><strong>${esc(g.name[L])}</strong><br>
        <span class="gp-muted">${esc(t(level))}</span></span>
      <span class="cz-logic-daily__stars">${got ? stars(got) : esc(t('play'))}</span>
    </a>`;
  }).join('');

  $('#gp-logic-hub').innerHTML = `
    ${tools()}
    <p class="cz-logic-stat">
      <span class="cz-stars">${star(true, 20)}</span> <span><strong>${esc(t('starsTotal', { n: P.totalStars(r) }))}</strong></span>
      <span>${esc(days ? t('daysWeek', { n: days }) : t('daysNone'))}</span>
    </p>
    <p class="cz-logic-badge">
      <span class="cz-logic-badge__icon" aria-hidden="true">${badge.badge.icon}</span>
      <span><strong>${esc(t('badgeNow', { badge: t(`badge.${badge.badge.id}`) }))}</strong><br>
        <span class="gp-muted">${esc(badge.next ? t('badgeNext', { n: badge.toGo, badge: t(`badge.${badge.next.id}`) }) : t('badgeTop'))}</span></span>
    </p>
    <section class="cz-logic-today" aria-labelledby="cz-logic-today-h">
      <h2 class="cz-logic-h2" id="cz-logic-today-h">${esc(t('daily'))}</h2>
      <div class="cz-logic-dailies">${daily}</div>
    </section>
    <div class="cz-tiles cz-logic-games">${tiles}</div>`;
  paintChrome();
  paint();
  showScreen('logichub');
}

/* ------------------------------------------------------------------ */
/* A game's home: levels and chapters                                  */
/* ------------------------------------------------------------------ */

async function drawGameHome(mod) {
  const n = ticket();
  const r = rec();
  const level = P.levelOf(r, mod.id);
  const bank = await bankOf(mod, level, n);
  if (!bank) return;
  view = { kind: 'game', mod };
  const L = lang();
  const meta = gameById(mod.id);
  const ids = idsOf(bank);

  const radio = (on) => `role="radio" aria-checked="${on}" tabindex="${on ? 0 : -1}"`;
  const levels = ['easy', 'medium', 'hard'].map((l) => `
    <button type="button" class="gp-card gp-card--mode${l === level ? ' is-selected' : ''}" ${radio(l === level)}
            data-logic-level="${l}">
      <span class="gp-card__title">${esc(t(l))}</span>
      <span class="gp-card__sub">${esc(t('ages', { ages: LEVEL_AGES[l] }))}</span>
    </button>`).join('');

  const chapters = mod.chapters(level, L).map((ch, i) => {
    const { solved, stars: got } = P.tally(r, mod.id, ids[i]);
    const open = P.chapterOpen(r, mod.id, ids, i);
    const pct = Math.round((solved / ids[i].length) * 100);
    const body = `
      <span class="cz-logic-ch__num" aria-hidden="true">${i + 1}</span>
      <span class="cz-logic-ch__text">
        <span class="cz-logic-ch__name">${esc(ch.title)}</span>
        <span class="cz-logic-ch__idea">${esc(ch.idea)}</span>
        ${open ? `<span class="cz-logic-ch__bar" aria-hidden="true"><span data-style="width:${pct}%"></span></span>
        <span class="cz-logic-ch__count">${esc(t('solvedOf', { n: solved, t: ids[i].length }))} · ${got} ★</span>`
        : `<span class="cz-logic-ch__locked">${esc(t('lockedChapter', { n: P.needToOpen(r, mod.id, ids, i) }))}</span>`}
      </span>`;
    return open
      ? `<a class="cz-logic-ch" href="#/logic/${mod.id}/${ch.id}">${body}</a>`
      : `<div class="cz-logic-ch is-locked" aria-disabled="true">${body}</div>`;
  }).join('');

  const got = P.dailyStars(r, mod.id, level, today());
  $('#gp-logic-game').innerHTML = `
    <div class="cz-logic-top">${backLink('#/logic', t('backRoom'))}${tools()}</div>
    <div class="cz-roomhead cz-tile--jade cz-logic-head">
      <span class="cz-roomhead__pic">${gameArt(mod.id)}</span>
      <div>
        <h1 class="gp-page-title" id="logicgame-title">${esc(meta.name[L])}</h1>
        <p class="gp-page-lede">${esc(meta.blurb[L])}</p>
      </div>
    </div>
    <fieldset class="gp-fieldset">
      <legend class="gp-fieldset__legend">${esc(t('level'))}</legend>
      <div class="gp-grid gp-grid--modes" id="gp-logic-levels" role="radiogroup" aria-label="${esc(t('level'))}">${levels}</div>
    </fieldset>
    <a class="cz-logic-daily cz-logic-daily--wide" href="#/logic/${mod.id}/daily">
      <span class="cz-logic-daily__pic" aria-hidden="true">📅</span>
      <span><strong>${esc(t('daily'))}</strong><br><span class="gp-muted">${esc(got ? t('dailyDone') : t(level))}</span></span>
      <span class="cz-logic-daily__stars">${got ? stars(got) : esc(t('play'))}</span>
    </a>
    <a class="cz-logic-daily cz-logic-daily--wide" href="#/logic/${mod.id}/endless">
      <span class="cz-logic-daily__pic" aria-hidden="true">♾️</span>
      <span><strong>${esc(t('endless'))}</strong><br><span class="gp-muted">${esc(t('endlessLede'))}</span></span>
      <span class="cz-logic-daily__stars">${esc(t('endlessCount', { n: P.endlessCount(r, mod.id, level) }))}</span>
    </a>
    <h2 class="cz-logic-h2">${esc(t('chapters'))}</h2>
    <div class="cz-logic-chapters">${chapters}</div>
    ${mod.extras ? mod.extras({ level, bank, rec: r, lang: L }) : ''}`;
  paintChrome();
  paint();
  showScreen('logicgame');
}

/* ------------------------------------------------------------------ */
/* One chapter's puzzles                                               */
/* ------------------------------------------------------------------ */

async function drawChapter(mod, chapterId) {
  const level = mod.levelOfChapter(chapterId);
  if (!level) { location.replace(`#/logic/${mod.id}`); return; }
  const bank = await bankOf(mod, level, ticket());
  if (!bank) return;
  const r = rec();
  const ids = idsOf(bank);
  const index = bank.chapters.findIndex((c) => c.id === chapterId);
  if (index < 0 || !P.chapterOpen(r, mod.id, ids, index)) { location.replace(`#/logic/${mod.id}`); return; }
  view = { kind: 'chapter', mod };
  const L = lang();
  const ch = mod.chapters(level, L)[index];
  const puzzles = bank.chapters[index].puzzles;

  const tiles = puzzles.map((p, i) => {
    const got = P.starsOf(r, mod.id, p.id);
    const open = P.puzzleOpen(r, mod.id, ids[index], i);
    const kind = mod.tileLabel(p, L);
    const inner = `<span class="cz-logic-tile__n">${i + 1}</span>
      <span class="cz-logic-tile__kind" aria-hidden="true">${kind.icon}</span>
      <span class="gp-sr-only">${esc(kind.text)}</span>
      ${got ? stars(got, 14) : open ? '' : '<span class="cz-logic-tile__lock" aria-hidden="true">🔒</span>'}`;
    return open
      ? `<a class="cz-logic-tile${got ? ' is-done' : ''}${p.teach ? ' is-teach' : ''}" href="#/logic/${mod.id}/${chapterId}/${i + 1}"
            aria-label="${esc(t('puzzleN', { n: i + 1 }))}, ${esc(kind.text)}${got ? `, ${esc(t('starsGot', { n: got }))}` : ''}">${inner}</a>`
      : `<span class="cz-logic-tile is-locked" aria-hidden="true">${inner}</span>`;
  }).join('');
  const { solved } = P.tally(r, mod.id, ids[index]);

  $('#gp-logic-game').innerHTML = `
    <div class="cz-logic-top">${backLink(`#/logic/${mod.id}`, t('backGame'))}${tools()}</div>
    <h1 class="gp-page-title" id="logicgame-title">${index + 1}. ${esc(ch.title)}</h1>
    <p class="gp-page-lede">${esc(ch.idea)}</p>
    <p class="cz-logic-ch__count">${esc(t('solvedOf', { n: solved, t: puzzles.length }))}</p>
    <div class="cz-logic-grid">${tiles}</div>
    ${mod.chapterExtras ? mod.chapterExtras({ chapterId, level, rec: r, lang: L, solved }) : ''}`;
  paintChrome();
  paint();
  showScreen('logicgame');
}

/* ------------------------------------------------------------------ */
/* One puzzle                                                          */
/* ------------------------------------------------------------------ */

function playShell({ back, title, sub, teach }) {
  $('#gp-logic-play').innerHTML = `
    <div class="cz-logic-top">${backLink(back.href, back.label)}${tools()}</div>
    <div class="cz-logic-playhead">
      <h1 class="cz-logic-playtitle" id="logicplay-title">${esc(title)}</h1>
      <p class="cz-logic-playsub">${esc(sub)}</p>
    </div>
    ${teach ? `<p class="cz-logic-teach"><span aria-hidden="true">🎓</span> ${esc(t('teachNote'))}</p>` : ''}
    <div id="cz-logic-board"></div>
    <div id="cz-logic-after" aria-live="polite"></div>`;
}

async function drawPuzzle(mod, chapterId, n) {
  const level = mod.levelOfChapter(chapterId);
  if (!level) { location.replace(`#/logic/${mod.id}`); return; }
  const bank = await bankOf(mod, level, ticket());
  if (!bank) return;
  const ids = idsOf(bank);
  const index = bank.chapters.findIndex((c) => c.id === chapterId);
  const puzzles = index >= 0 ? bank.chapters[index].puzzles : [];
  const p = puzzles[n - 1];
  const r = rec();
  if (!p || !P.chapterOpen(r, mod.id, ids, index) || !P.puzzleOpen(r, mod.id, ids[index], n - 1)) {
    location.replace(`#/logic/${mod.id}/${chapterId}`);
    return;
  }
  view = { kind: 'play', mod, chapterId, n, level, bank, index, puzzle: p };
  drawPlay();
}

function drawPlay() {
  const v = view;
  const L = lang();
  const ch = v.mod.chapters(v.level, L)[v.index];
  playShell({
    back: { href: `#/logic/${v.mod.id}/${v.chapterId}`, label: t('backChapter') },
    title: ch.title,
    sub: t('puzzleOf', { n: v.n, t: v.bank.chapters[v.index].puzzles.length }),
    teach: v.puzzle.teach
  });
  v.mod.draw($('#cz-logic-board'), {
    puzzle: v.puzzle, chapterId: v.chapterId, level: v.level, lang: L,
    /* Only for this puzzle, while it is still the one on screen. */
    onSolved: (result) => { if (view === v) solvedPuzzle(result); }
  });
  paintChrome();
  paint();
  showScreen('logicplay');
}

function solvedPuzzle({ stars: got, why }) {
  const v = view;
  const ids = idsOf(v.bank);
  const before = rec();
  let after = P.setStars(before, v.mod.id, v.puzzle.id, got);
  after = P.markDay(after, today());
  save(after);

  const L = lang();
  const news = [];
  const chs = v.mod.chapters(v.level, L);
  const nextCh = v.index + 1;
  if (nextCh < ids.length && !P.chapterOpen(before, v.mod.id, ids, nextCh) && P.chapterOpen(after, v.mod.id, ids, nextCh)) {
    news.push(`🔓 ${esc(t('chapterOpen', { name: chs[nextCh].title }))}`);
  }
  if (v.mod.news) news.push(...v.mod.news({ chapterId: v.chapterId, before, after, ids: ids[v.index], lang: L }));
  const { solved } = P.tally(after, v.mod.id, ids[v.index]);
  if (solved === ids[v.index].length && P.tally(before, v.mod.id, ids[v.index]).solved < solved) {
    news.push(`🏆 ${esc(t('chapterDone'))}`);
  }

  /* The next puzzle in the chapter; after the last, the next chapter if it is open. */
  let next = null;
  if (v.n < ids[v.index].length) {
    next = { href: `#/logic/${v.mod.id}/${v.chapterId}/${v.n + 1}` };
  } else if (nextCh < ids.length && P.chapterOpen(after, v.mod.id, ids, nextCh)) {
    next = { href: `#/logic/${v.mod.id}/${v.bank.chapters[nextCh].id}/1`, chapter: nextCh };
  }
  v.win = { got, best: P.starsOf(after, v.mod.id, v.puzzle.id), why, next };
  showWin(news);
}

/* The end card, in the room's language. `news` is shown once: it is about
   what just happened, so a language switch afterwards redraws without it. */
function showWin(news = null) {
  const v = view;
  const w = v.win;
  const L = lang();
  const chs = v.kind === 'play' ? v.mod.chapters(v.level, L) : [];
  const next = w.next && {
    href: w.next.href,
    label: w.next.labelKey ? t(w.next.labelKey) : w.next.chapter !== undefined ? chs[w.next.chapter].title : t('next')
  };
  const back = v.kind === 'play'
    ? { href: `#/logic/${v.mod.id}/${v.chapterId}`, label: t('backChapter') }
    : { href: `#/logic/${v.mod.id}`, label: t('backGame') };
  const host = $('#cz-logic-after');
  host.innerHTML = winCard({
    got: w.got, best: w.best, why: w.why ? w.why(L) : [], news: news || [], next, back
  });
  paint();
  if (!news) return;
  celebrate(host);
  react(w.got === 3 ? 'wow' : 'happy', 2400);
  const go = host.querySelector('[data-logic-next]') || host.querySelector('a');
  if (go) go.focus({ preventScroll: false });
}

/* ------------------------------------------------------------------ */
/* Today's puzzle                                                      */
/* ------------------------------------------------------------------ */

/* Today's puzzle, or with `endless` the n-th endless one: the same maker,
   seeded by the count instead of the date, so endless never runs out and a
   reload shows the same puzzle. */
async function drawDaily(mod, endless = null) {
  const r = rec();
  const level = P.levelOf(r, mod.id);
  const iso = endless ? `endless-${endless}` : today();
  const here = location.hash;
  const n = ticket();
  view = { kind: 'making', mod };
  /* Making a puzzle can take a moment on a slow tablet (a Hard code is the
     slowest, about a quarter of a second), so say so first and let that
     paint before the work starts. */
  const v0 = { endless, level, mod, iso };
  playShell({ back: { href: `#/logic/${mod.id}`, label: t('backGame') }, title: dailyTitle(v0), sub: dailySub(v0) });
  $('#cz-logic-board').innerHTML = `<p class="cz-logic-making" role="status">${esc(t('making'))}</p>`;
  paintChrome();
  paint();
  showScreen('logicplay');
  /* One frame for the message to paint; a hidden tab has no frames, so a
     short timer goes on without one. */
  await new Promise((r) => { requestAnimationFrame(() => setTimeout(r, 0)); setTimeout(r, 60); });
  if (location.hash !== here || stale(n)) return;
  /* Fix the Bug reads the robot levels first, so this may wait. A seed that
     makes nothing moves on to the next seed, and then to the bank, so this
     is null only offline with nothing saved: then say so, and count nothing. */
  const made = await makeDaily(mod, level, iso);
  if (location.hash !== here || stale(n)) return;
  if (!made) { showError(t('loadFail')); return; }
  view = { kind: 'daily', mod, level, iso, endless, puzzle: made.puzzle, chapterId: made.chapterId };
  drawDailyPlay();
}

const dailyTitle = (v) => t(v.endless ? 'endless' : 'daily');
const dailySub = (v) => (v.endless
  ? `${t(v.level)} · ${t('endlessCount', { n: P.endlessCount(rec(), v.mod.id, v.level) })}`
  : t('dailyFor', { level: t(v.level), date: v.iso }));

function drawDailyPlay() {
  const v = view;
  const L = lang();
  playShell({ back: { href: `#/logic/${v.mod.id}`, label: t('backGame') }, title: dailyTitle(v), sub: dailySub(v) });
  v.mod.draw($('#cz-logic-board'), {
    puzzle: v.puzzle, chapterId: v.chapterId, level: v.level, lang: L, daily: true,
    onSolved: ({ stars: got, why }) => {
      if (view !== v) return;
      if (v.endless) {
        save(P.markDay(P.addEndless(rec(), v.mod.id, v.level), today()));
        v.win = { got, best: got, why, next: { href: `#/logic/${v.mod.id}/endless/${v.endless + 1}`, labelKey: 'endlessNext' } };
        showWin([esc(t('endlessCount', { n: P.endlessCount(rec(), v.mod.id, v.level) }))]);
        return;
      }
      let after = P.setDaily(rec(), v.mod.id, v.level, v.iso, got);
      after = P.markDay(after, today());
      save(after);
      /* Today's puzzle is one a day; endless practice is the way on. */
      v.win = { got, best: P.dailyStars(after, v.mod.id, v.level, v.iso), why, next: { href: `#/logic/${v.mod.id}/endless`, labelKey: 'dailyMore' } };
      showWin([esc(t('dailyDone'))]);
    }
  });
  paintChrome();
  paint();
  showScreen('logicplay');
}

/* ------------------------------------------------------------------ */
/* Clicks and keys                                                     */
/* ------------------------------------------------------------------ */

function rerender() {
  if (view && (view.kind === 'play' || view.kind === 'daily') && view.mod.repaint) {
    /* A puzzle in progress keeps its state: only the words change. */
    const after = $('#cz-logic-after').innerHTML;
    const L = lang();
    const ch = view.kind === 'play' ? view.mod.chapters(view.level, L)[view.index] : null;
    const title = $('#logicplay-title');
    if (title) title.textContent = ch ? ch.title : dailyTitle(view);
    $$('#gp-logic-play .cz-logic-tools').forEach((el) => { el.outerHTML = tools(); });
    const sub = $('#gp-logic-play .cz-logic-playsub');
    if (sub) {
      sub.textContent = view.kind === 'play'
        ? t('puzzleOf', { n: view.n, t: view.bank.chapters[view.index].puzzles.length })
        : dailySub(view);
    }
    const teach = $('#gp-logic-play .cz-logic-teach');
    if (teach) teach.innerHTML = `<span aria-hidden="true">🎓</span> ${esc(t('teachNote'))}`;
    const back = $('#gp-logic-play .gp-backlink');
    if (back) back.innerHTML = `&larr; ${esc(t(view.kind === 'play' ? 'backChapter' : 'backGame'))}`;
    view.mod.repaint(L);
    if (after && view.win) showWin();
    paintChrome();
    paint();
    return;
  }
  renderLogic(location.hash.replace(/^#\/?/, '').split('/').filter(Boolean));
}

export function logicClick(ev) {
  const level = ev.target.closest('[data-logic-level]');
  if (level && view && view.kind === 'game') {
    save(P.setLevel(rec(), view.mod.id, level.dataset.logicLevel));
    drawGameHome(view.mod);
    return true;
  }
  const action = ev.target.closest('[data-action]');
  if (action && action.dataset.action === 'logic-lang') {
    flipLang();
    rerender();
    const pill = $('.gp-screen.is-active [data-action="logic-lang"]');
    if (pill) pill.focus();
    return true;
  }
  if (action && action.dataset.action === 'logic-say') {
    if (view && view.mod && view.mod.say && (view.kind === 'play' || view.kind === 'daily')) view.mod.say();
    else say([t('roomTitle'), t('roomLede')]);
    return true;
  }
  if (view && view.mod && (view.kind === 'play' || view.kind === 'daily') && view.mod.click) {
    return view.mod.click(ev);
  }
  return false;
}

export function logicKey(ev) {
  if (!view || !view.mod || (view.kind !== 'play' && view.kind !== 'daily') || !view.mod.key) return false;
  const screen = document.getElementById('screen-logicplay');
  if (!screen || !screen.classList.contains('is-active')) return false;
  if (ev.metaKey || ev.ctrlKey || ev.altKey) return false;
  return view.mod.key(ev);
}
