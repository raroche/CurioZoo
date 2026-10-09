/**
 * rooms/science/hub.js — the Science Lab, apart from the games' boards.
 *
 *   #/science                       the hub: ten games, today's experiments
 *   #/science/notebook              the Science Notebook: every big idea
 *   #/science/<game>                a game's levels and chapters
 *   #/science/<game>/<chapter>      one chapter's experiments
 *   #/science/<game>/<chapter>/<n>  one experiment
 *   #/science/<game>/daily          today's experiment at the chosen level
 *   #/science/<game>/endless[/<n>]  endless practice
 *
 * Each game is a file beside this one, loaded the first time a child opens
 * that game. It hands this file its bank, its chapters and a board;
 * everything else -- unlocking, stars, surprises, notebook pages, the end
 * card, the way back -- is the same for every game and lives here.
 *
 * An adapted copy of rooms/logic/hub.js (a room may not import another
 * room's files). A fix to one is probably owed to the other.
 */

import * as P from '../../modules/scienceprogress.js';
import { GAMES, IDEAS, LEVEL_AGES, gameById, liveIdeas } from '../../modules/sciencetext.js';
import { gameArt } from '../../modules/scienceart.js';
import { star } from '../../modules/zooart.js';
import { today } from '../../modules/logicrng.js';
import { celebrate } from '../../modules/celebrate.js';
import { $, $$, paint, react, savingOffline, showError, showScreen, whileLoading } from '../../modules/shell.js';
import { backLink, esc, flipLang, lang, rec, save, say, stars, surprise, t, tools, winCard } from './frame.js';
import { makeDaily } from './daily.js';

/* The games that have been built, each loaded on first use. */
const LOADERS = {
  pond: () => import('./pond.js'),
  train: () => import('./train.js'),
  firefly: () => import('./firefly.js'),
  lever: () => import('./lever.js'),
  slide: () => import('./slide.js'),
  chain: () => import('./chain.js'),
  fountain: () => import('./fountain.js'),
  shadow: () => import('./shadow.js'),
  magnet: () => import('./magnet.js'),
  domino: () => import('./domino.js')
};
const loaded = new Map();

async function loadGame(id) {
  if (!loaded.has(id)) loaded.set(id, LOADERS[id]().then((m) => m.default));
  return loaded.get(id);
}

let view = null;     // what is on screen: { kind, game, mod, ... }

/* Each draw takes a ticket. A draw that waited (for a game or a bank) paints
   only if no newer draw has started since. */
let drawing = 0;
const ticket = () => ++drawing;
const stale = (n) => n !== drawing;

/* The experiment on screen is going away: its game stops any animation, so
   nothing ends later on a screen the child has left. */
function leaveView() {
  if (view && view.mod && view.mod.leave) {
    try { view.mod.leave(); } catch (err) { console.error(err); }
  }
}

/** The child went to another room. */
export function leaveScience() {
  leaveView();
  view = null;
}

const SCREENS = ['screen-sciencehub', 'screen-sciencegame', 'screen-scienceplay'];

/* ------------------------------------------------------------------ */
/* Routing                                                             */
/* ------------------------------------------------------------------ */

export async function renderScience(parts) {
  const [, game, a, b] = parts;
  leaveView();
  if (!game) { drawHub(); return; }
  if (game === 'notebook') { drawNotebook(); return; }
  const meta = gameById(game);
  if (!meta || !meta.live || !LOADERS[game]) { location.replace('#/science'); return; }
  const here = location.hash;
  const n = ticket();
  let mod;
  try {
    mod = await whileLoading(loadGame(game), loadingWords, () => !stale(n));
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

const loadingWords = () => ({ title: t('loadingTitle'), text: t(savingOffline() ? 'loadingSaving' : 'loadingText'), lang: lang() });

/** Load a level's bank for draw `n`, or show the error screen; null if
    it failed or a newer draw has started meanwhile. */
async function bankOf(mod, level, n) {
  const here = location.hash;
  try {
    const bank = await whileLoading(mod.bank(level), loadingWords, () => !stale(n));
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
  $$('[data-sci-text]').forEach((el) => { el.textContent = t(el.dataset.sciText); });
  SCREENS.forEach((id) => {
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
  const total = P.totalStars(r);
  const badge = P.badgeOf(total);
  const found = P.surprises(r);
  const ideas = liveIdeas();
  const earned = P.ideasEarned(r, ideas);

  const tiles = GAMES.map((g, i) => {
    const inner = `
      <span class="cz-tile__pic">${gameArt(g.id)}</span>
      <span class="cz-tile__text">
        <span class="cz-tile__name">${esc(g.name[L])}</span>
        <span class="cz-tile__blurb">${esc(g.blurb[L])}</span>
        <span class="cz-tile__meta">${esc(g.live ? g.meta[L] : t('soon'))}</span>
      </span>`;
    return g.live
      ? `<a class="cz-tile cz-tile--iris" href="#/science/${g.id}" data-n="${i}">${inner}
           <span class="cz-tile__go" aria-hidden="true">&rarr;</span></a>`
      : `<div class="cz-tile cz-tile--iris is-soon" aria-disabled="true">${inner}</div>`;
  }).join('');

  const live = GAMES.filter((g) => g.live);
  const daily = live.map((g) => {
    const level = P.levelOf(r, g.id);
    const got = P.dailyStars(r, g.id, level, today());
    return `<a class="cz-sci-daily" href="#/science/${g.id}/daily">
      <span class="cz-sci-daily__pic">${gameArt(g.id)}</span>
      <span><strong>${esc(g.name[L])}</strong><br>
        <span class="gp-muted">${esc(t(level))}</span></span>
      <span class="cz-sci-daily__stars">${got ? stars(got) : esc(t('play'))}</span>
    </a>`;
  }).join('');

  $('#gp-sci-hub').innerHTML = `
    ${tools()}
    <p class="cz-sci-stat">
      <span><span class="cz-stars">${star(true, 20)}</span> <strong>${esc(t('starsTotal', { n: total }))}</strong></span>
      <span><span aria-hidden="true">🤯</span> ${esc(found ? t('surprises', { n: found }) : t('surprisesNone'))}</span>
      <span>${esc(days ? t('daysWeek', { n: days }) : t('daysNone'))}</span>
    </p>
    <p class="cz-sci-badge">
      <span class="cz-sci-badge__icon" aria-hidden="true">${badge.badge.icon}</span>
      <span><strong>${esc(t('badgeNow', { badge: t(`badge.${badge.badge.id}`) }))}</strong><br>
        <span class="gp-muted">${esc(badge.next ? t('badgeNext', { n: badge.toGo, badge: t(`badge.${badge.next.id}`) }) : t('badgeTop'))}</span></span>
    </p>
    ${live.length ? `<section class="cz-sci-today" aria-labelledby="cz-sci-today-h">
      <h2 class="cz-sci-h2" id="cz-sci-today-h">${esc(t(live.length > 1 ? 'dailies' : 'daily'))}</h2>
      <div class="cz-sci-dailies">${daily}</div>
    </section>` : ''}
    <div class="cz-tiles cz-sci-games">${tiles}</div>
    ${ideas.length ? `<a class="cz-sci-notecard" href="#/science/notebook">
      <span class="cz-sci-notecard__pic" aria-hidden="true">📓</span>
      <span><strong>${esc(t('notebook'))}</strong><br>
        <span class="gp-muted">${esc(t('notebookCount', { n: earned, t: ideas.length }))}</span></span>
      <span class="cz-sci-daily__stars">${esc(t('notebookOpen'))} &rarr;</span>
    </a>` : ''}`;
  paintChrome();
  paint();
  showScreen('sciencehub');
}

/* ------------------------------------------------------------------ */
/* The Science Notebook                                                */
/* ------------------------------------------------------------------ */

function drawNotebook() {
  ticket();
  view = { kind: 'notebook' };
  const L = lang();
  const r = rec();
  const ideas = liveIdeas();
  const earned = P.ideasEarned(r, ideas);
  const sections = GAMES.filter((g) => g.live && IDEAS[g.id].length).map((g) => {
    const pages = IDEAS[g.id].map((idea) => {
      const got = P.ideaEarned(r, g.id, idea.ch);
      return got
        ? `<li class="cz-sci-page is-earned">
            <span class="cz-sci-page__icon" aria-hidden="true">${idea.icon}</span>
            <span class="cz-sci-page__text"><strong>${esc(idea[L])}</strong>
              <span>${esc(idea.why[L])}</span></span>
          </li>`
        : `<li class="cz-sci-page is-locked">
            <span class="cz-sci-page__icon" aria-hidden="true">❔</span>
            <span class="cz-sci-page__text"><strong>${esc(t('notebookLocked'))}</strong>
              <span class="gp-muted">${esc(t('solvedOf', { n: P.solvedIn(r, g.id, idea.ch), t: P.IDEA_AT }))}</span></span>
          </li>`;
    }).join('');
    return `<section class="cz-sci-chapterpages" aria-labelledby="cz-sci-nb-${g.id}">
      <h2 class="cz-sci-h2" id="cz-sci-nb-${g.id}"><span class="cz-sci-nb__art">${gameArt(g.id)}</span> ${esc(g.name[L])}</h2>
      <ul class="cz-sci-pages">${pages}</ul>
    </section>`;
  }).join('');
  $('#gp-sci-game').innerHTML = `
    <div class="cz-sci-top">${backLink('#/science', t('backRoom'))}${tools()}</div>
    <div class="cz-roomhead cz-tile--iris cz-sci-head">
      <span class="cz-roomhead__pic cz-sci-head__emoji" aria-hidden="true">📓</span>
      <div>
        <h1 class="gp-page-title" id="sciencegame-title">${esc(t('notebook'))}</h1>
        <p class="gp-page-lede">${esc(t('notebookLede'))}</p>
      </div>
    </div>
    <p class="cz-sci-ch__count">${esc(t('notebookCount', { n: earned, t: ideas.length }))}</p>
    ${sections}`;
  paintChrome();
  paint();
  showScreen('sciencegame');
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
            data-sci-level="${l}">
      <span class="gp-card__title">${esc(t(l))}</span>
      <span class="gp-card__sub">${esc(t('ages', { ages: LEVEL_AGES[l] }))}</span>
    </button>`).join('');

  const chapters = mod.chapters(level, L).map((ch, i) => {
    const { solved, stars: got } = P.tally(r, mod.id, ids[i]);
    const open = P.chapterOpen(r, mod.id, ids, i);
    const pct = Math.round((solved / ids[i].length) * 100);
    const idea = P.ideaEarned(r, mod.id, ch.id) ? ' <span aria-hidden="true">📓</span>' : '';
    const body = `
      <span class="cz-sci-ch__num" aria-hidden="true">${ch.icon || i + 1}</span>
      <span class="cz-sci-ch__text">
        <span class="cz-sci-ch__name">${esc(ch.title)}${idea}</span>
        <span class="cz-sci-ch__idea">${esc(ch.idea)}</span>
        ${open ? `<span class="cz-sci-ch__bar" aria-hidden="true"><span data-style="width:${pct}%"></span></span>
        <span class="cz-sci-ch__count">${esc(t('solvedOf', { n: solved, t: ids[i].length }))} · ${got} ★</span>`
        : `<span class="cz-sci-ch__locked">${esc(t('lockedChapter', { n: P.needToOpen(r, mod.id, ids, i) }))}</span>`}
      </span>`;
    return open
      ? `<a class="cz-sci-ch" href="#/science/${mod.id}/${ch.id}">${body}</a>`
      : `<div class="cz-sci-ch is-locked" aria-disabled="true">${body}</div>`;
  }).join('');

  const got = P.dailyStars(r, mod.id, level, today());
  $('#gp-sci-game').innerHTML = `
    <div class="cz-sci-top">${backLink('#/science', t('backRoom'))}${tools()}</div>
    <div class="cz-roomhead cz-tile--iris cz-sci-head">
      <span class="cz-roomhead__pic">${gameArt(mod.id)}</span>
      <div>
        <h1 class="gp-page-title" id="sciencegame-title">${esc(meta.name[L])}</h1>
        <p class="gp-page-lede">${esc(meta.blurb[L])}</p>
      </div>
    </div>
    <fieldset class="gp-fieldset">
      <legend class="gp-fieldset__legend">${esc(t('level'))}</legend>
      <div class="gp-grid gp-grid--modes" id="gp-sci-levels" role="radiogroup" aria-label="${esc(t('level'))}">${levels}</div>
    </fieldset>
    <a class="cz-sci-daily cz-sci-daily--wide" href="#/science/${mod.id}/daily">
      <span class="cz-sci-daily__pic" aria-hidden="true">📅</span>
      <span><strong>${esc(t('daily'))}</strong><br><span class="gp-muted">${esc(got ? t('dailyDone') : t(level))}</span></span>
      <span class="cz-sci-daily__stars">${got ? stars(got) : esc(t('play'))}</span>
    </a>
    <a class="cz-sci-daily cz-sci-daily--wide" href="#/science/${mod.id}/endless">
      <span class="cz-sci-daily__pic" aria-hidden="true">♾️</span>
      <span><strong>${esc(t('endless'))}</strong><br><span class="gp-muted">${esc(t('endlessLede'))}</span></span>
      <span class="cz-sci-daily__stars">${esc(t('endlessCount', { n: P.endlessCount(r, mod.id, level) }))}</span>
    </a>
    <h2 class="cz-sci-h2">${esc(t('chapters'))}</h2>
    <div class="cz-sci-chapters">${chapters}</div>
    ${mod.extras ? mod.extras({ level, bank, rec: r, lang: L }) : ''}`;
  paintChrome();
  paint();
  showScreen('sciencegame');
}

/* ------------------------------------------------------------------ */
/* One chapter's experiments                                           */
/* ------------------------------------------------------------------ */

async function drawChapter(mod, chapterId) {
  const level = mod.levelOfChapter(chapterId);
  if (!level) { location.replace(`#/science/${mod.id}`); return; }
  const bank = await bankOf(mod, level, ticket());
  if (!bank) return;
  const r = rec();
  const ids = idsOf(bank);
  const index = bank.chapters.findIndex((c) => c.id === chapterId);
  if (index < 0 || !P.chapterOpen(r, mod.id, ids, index)) { location.replace(`#/science/${mod.id}`); return; }
  view = { kind: 'chapter', mod };
  const L = lang();
  const ch = mod.chapters(level, L)[index];
  const puzzles = bank.chapters[index].puzzles;

  const tiles = puzzles.map((p, i) => {
    const got = P.starsOf(r, mod.id, p.id);
    const open = P.puzzleOpen(r, mod.id, ids[index], i);
    const kind = mod.tileLabel(p, L);
    const inner = `<span class="cz-sci-tile__n">${i + 1}</span>
      <span class="cz-sci-tile__kind" aria-hidden="true">${kind.icon}</span>
      <span class="gp-sr-only">${esc(kind.text)}</span>
      ${got ? stars(got, 14) : open ? '' : '<span class="cz-sci-tile__lock" aria-hidden="true">🔒</span>'}`;
    return open
      ? `<a class="cz-sci-tile${got ? ' is-done' : ''}${p.teach ? ' is-teach' : ''}" href="#/science/${mod.id}/${chapterId}/${i + 1}"
            aria-label="${esc(t('puzzleN', { n: i + 1 }))}, ${esc(kind.text)}${got ? `, ${esc(t('starsGot', { n: got }))}` : ''}">${inner}</a>`
      : `<span class="cz-sci-tile is-locked" aria-hidden="true">${inner}</span>`;
  }).join('');
  const { solved } = P.tally(r, mod.id, ids[index]);

  $('#gp-sci-game').innerHTML = `
    <div class="cz-sci-top">${backLink(`#/science/${mod.id}`, t('backGame'))}${tools()}</div>
    <h1 class="gp-page-title" id="sciencegame-title">${index + 1}. ${esc(ch.title)}</h1>
    <p class="gp-page-lede">${esc(ch.idea)}</p>
    <p class="cz-sci-ch__count">${esc(t('solvedOf', { n: solved, t: puzzles.length }))}</p>
    <div class="cz-sci-grid">${tiles}</div>`;
  paintChrome();
  paint();
  showScreen('sciencegame');
}

/* ------------------------------------------------------------------ */
/* One experiment                                                      */
/* ------------------------------------------------------------------ */

function playShell({ back, title, sub, teach }) {
  $('#gp-sci-play').innerHTML = `
    <div class="cz-sci-top">${backLink(back.href, back.label)}${tools()}</div>
    <div class="cz-sci-playhead">
      <h1 class="cz-sci-playtitle" id="scienceplay-title">${esc(title)}</h1>
      <p class="cz-sci-playsub">${esc(sub)}</p>
    </div>
    ${teach ? `<p class="cz-sci-teach"><span aria-hidden="true">🎓</span> ${esc(t('teachNote'))}</p>` : ''}
    <div id="cz-sci-board"></div>
    <div id="cz-sci-after" aria-live="polite"></div>`;
}

async function drawPuzzle(mod, chapterId, n) {
  const level = mod.levelOfChapter(chapterId);
  if (!level) { location.replace(`#/science/${mod.id}`); return; }
  const bank = await bankOf(mod, level, ticket());
  if (!bank) return;
  const ids = idsOf(bank);
  const index = bank.chapters.findIndex((c) => c.id === chapterId);
  const puzzles = index >= 0 ? bank.chapters[index].puzzles : [];
  const p = puzzles[n - 1];
  const r = rec();
  if (!p || !P.chapterOpen(r, mod.id, ids, index) || !P.puzzleOpen(r, mod.id, ids[index], n - 1)) {
    location.replace(`#/science/${mod.id}/${chapterId}`);
    return;
  }
  view = { kind: 'play', mod, chapterId, n, level, bank, index, puzzle: p };
  drawPlay();
}

/* What every board is handed, besides its puzzle. */
const boardCtx = (v, extra) => ({
  chapterId: v.chapterId, level: v.level, lang: lang(),
  /* Counted the moment it happens, so a surprise is never lost to a child
     who leaves before finishing. Only while this is the board on screen. */
  surprise: (n = 1) => { if (view === v) surprise(v.mod.id, n); },
  ...extra
});

function drawPlay() {
  const v = view;
  const L = lang();
  const ch = v.mod.chapters(v.level, L)[v.index];
  playShell({
    back: { href: `#/science/${v.mod.id}/${v.chapterId}`, label: t('backChapter') },
    title: ch.title,
    sub: t('puzzleOf', { n: v.n, t: v.bank.chapters[v.index].puzzles.length }),
    teach: v.puzzle.teach
  });
  v.mod.draw($('#cz-sci-board'), boardCtx(v, {
    puzzle: v.puzzle,
    onSolved: (result) => { if (view === v) solvedPuzzle(result); }
  }));
  paintChrome();
  paint();
  showScreen('scienceplay');
}

function solvedPuzzle({ stars: got, why, pic }) {
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
  if (!P.ideaEarned(before, v.mod.id, v.chapterId) && P.ideaEarned(after, v.mod.id, v.chapterId)) {
    const idea = (IDEAS[v.mod.id] || []).find((i) => i.ch === v.chapterId);
    if (idea) news.push(`📓 ${esc(t('ideaNew', { idea: idea[L] }))}`);
  }
  if (nextCh < ids.length && !P.chapterOpen(before, v.mod.id, ids, nextCh) && P.chapterOpen(after, v.mod.id, ids, nextCh)) {
    news.push(`🔓 ${esc(t('chapterOpen', { name: chs[nextCh].title }))}`);
  }
  const { solved } = P.tally(after, v.mod.id, ids[v.index]);
  if (solved === ids[v.index].length && P.tally(before, v.mod.id, ids[v.index]).solved < solved) {
    news.push(`🏆 ${esc(t('chapterDone'))}`);
  }

  /* The next experiment in the chapter; after the last, the next chapter if it is open. */
  let next = null;
  if (v.n < ids[v.index].length) {
    next = { href: `#/science/${v.mod.id}/${v.chapterId}/${v.n + 1}` };
  } else if (nextCh < ids.length && P.chapterOpen(after, v.mod.id, ids, nextCh)) {
    next = { href: `#/science/${v.mod.id}/${v.bank.chapters[nextCh].id}/1`, chapter: nextCh };
  }
  v.win = { got, best: P.starsOf(after, v.mod.id, v.puzzle.id), why, pic, next };
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
    ? { href: `#/science/${v.mod.id}/${v.chapterId}`, label: t('backChapter') }
    : { href: `#/science/${v.mod.id}`, label: t('backGame') };
  const host = $('#cz-sci-after');
  host.innerHTML = winCard({
    got: w.got, best: w.best, why: w.why ? w.why(L) : [], pic: w.pic ? w.pic(L) : '', news: news || [], next, back
  });
  paint();
  if (!news) return;
  celebrate(host);
  react(w.got === 3 ? 'wow' : 'happy', 2400);
  const go = host.querySelector('[data-sci-next]') || host.querySelector('a');
  if (go) go.focus({ preventScroll: false });
}

/* ------------------------------------------------------------------ */
/* Today's experiment, and endless practice                            */
/* ------------------------------------------------------------------ */

async function drawDaily(mod, endless = null) {
  const r = rec();
  const level = P.levelOf(r, mod.id);
  const iso = endless ? `endless-${endless}` : today();
  const here = location.hash;
  const n = ticket();
  view = { kind: 'making', mod };
  const v0 = { endless, level, mod, iso };
  playShell({ back: { href: `#/science/${mod.id}`, label: t('backGame') }, title: dailyTitle(v0), sub: dailySub(v0) });
  $('#cz-sci-board').innerHTML = `<p class="cz-sci-making" role="status">${esc(t('making'))}</p>`;
  paintChrome();
  paint();
  showScreen('scienceplay');
  await new Promise((res) => { requestAnimationFrame(() => setTimeout(res, 0)); setTimeout(res, 60); });
  if (location.hash !== here || stale(n)) return;
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
  playShell({ back: { href: `#/science/${v.mod.id}`, label: t('backGame') }, title: dailyTitle(v), sub: dailySub(v) });
  v.mod.draw($('#cz-sci-board'), boardCtx(v, {
    puzzle: v.puzzle, daily: true,
    onSolved: ({ stars: got, why, pic }) => {
      if (view !== v) return;
      if (v.endless) {
        /* A replay of the same endless experiment does not count it twice. */
        if (!v.counted) save(P.markDay(P.addEndless(rec(), v.mod.id, v.level), today()));
        v.counted = true;
        v.win = { got, best: got, why, pic, next: { href: `#/science/${v.mod.id}/endless/${v.endless + 1}`, labelKey: 'endlessNext' } };
        showWin([esc(t('endlessCount', { n: P.endlessCount(rec(), v.mod.id, v.level) }))]);
        return;
      }
      let after = P.setDaily(rec(), v.mod.id, v.level, v.iso, got);
      after = P.markDay(after, today());
      save(after);
      v.win = { got, best: P.dailyStars(after, v.mod.id, v.level, v.iso), why, pic, next: { href: `#/science/${v.mod.id}/endless`, labelKey: 'dailyMore' } };
      showWin([esc(t('dailyDone'))]);
    }
  }));
  paintChrome();
  paint();
  showScreen('scienceplay');
}

/* ------------------------------------------------------------------ */
/* Clicks and keys                                                     */
/* ------------------------------------------------------------------ */

function rerender() {
  if (view && (view.kind === 'play' || view.kind === 'daily') && view.mod.repaint) {
    /* An experiment in progress keeps its state: only the words change. */
    const after = $('#cz-sci-after').innerHTML;
    const L = lang();
    const ch = view.kind === 'play' ? view.mod.chapters(view.level, L)[view.index] : null;
    const title = $('#scienceplay-title');
    if (title) title.textContent = ch ? ch.title : dailyTitle(view);
    $$('#gp-sci-play .cz-sci-tools').forEach((el) => { el.outerHTML = tools(); });
    const sub = $('#gp-sci-play .cz-sci-playsub');
    if (sub) {
      sub.textContent = view.kind === 'play'
        ? t('puzzleOf', { n: view.n, t: view.bank.chapters[view.index].puzzles.length })
        : dailySub(view);
    }
    const teach = $('#gp-sci-play .cz-sci-teach');
    if (teach) teach.innerHTML = `<span aria-hidden="true">🎓</span> ${esc(t('teachNote'))}`;
    const back = $('#gp-sci-play .gp-backlink');
    if (back) back.innerHTML = `&larr; ${esc(t(view.kind === 'play' ? 'backChapter' : 'backGame'))}`;
    view.mod.repaint(L);
    if (after && view.win) showWin();
    paintChrome();
    paint();
    return;
  }
  renderScience(location.hash.replace(/^#\/?/, '').split('/').filter(Boolean));
}

const playing = () => view && view.mod && (view.kind === 'play' || view.kind === 'daily');

export function scienceClick(ev) {
  const level = ev.target.closest('[data-sci-level]');
  if (level && view && view.kind === 'game') {
    save(P.setLevel(rec(), view.mod.id, level.dataset.sciLevel));
    drawGameHome(view.mod);
    return true;
  }
  const action = ev.target.closest('[data-action]');
  if (action && action.dataset.action === 'sci-again' && playing()) {
    /* The same experiment from the start. Stars keep the best result, so a
       replay can only add, never take away. */
    leaveView();
    view.win = null;
    if (view.kind === 'play') drawPlay(); else drawDailyPlay();
    return true;
  }
  if (action && action.dataset.action === 'sci-lang') {
    flipLang();
    rerender();
    const pill = $('.gp-screen.is-active [data-action="sci-lang"]');
    if (pill) pill.focus();
    return true;
  }
  if (action && action.dataset.action === 'sci-say') {
    if (playing() && view.mod.say) view.mod.say();
    else say([t('roomTitle'), t('roomLede')]);
    return true;
  }
  if (playing() && view.mod.click) return view.mod.click(ev);
  return false;
}

export function scienceKey(ev) {
  if (!playing() || !view.mod.key) return false;
  const screen = document.getElementById('screen-scienceplay');
  if (!screen || !screen.classList.contains('is-active')) return false;
  if (ev.metaKey || ev.ctrlKey || ev.altKey) return false;
  return view.mod.key(ev);
}
