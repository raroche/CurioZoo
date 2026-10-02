/**
 * rooms/home/room.js — the zoo map.
 *
 * Its screen is the one room screen that stays in index.html: it is the first
 * thing anybody sees, so it must not wait for a download. The cards come from
 * the registry, so a new room appears here without anyone editing this file.
 */

import * as storage from '../../modules/storage.js';
import { bars } from '../../modules/charts.js';
import { roomGrid } from '../../modules/sections.js';
import { hydrateMascots, setMood } from '../../modules/mascot.js';
import { ROOMS } from '../registry.js';
import { $, paint, showScreen, state } from '../../modules/shell.js';

/* The cards arrive in a ripple the first time, and are simply there after. */
let arrived = false;

/* Pointing at a card, or tabbing to it, makes its creature look up at you.
   Delegated, because the cards are redrawn on every visit. */
export function init() {
  const host = document.getElementById('cz-tiles');
  if (!host) return;
  const lookUp = (ev) => {
    const tile = ev.target.closest && ev.target.closest('.cz-tile:not(.is-soon)');
    if (tile) setMood(tile.querySelector('.cz-tile__pic'), 'curious', 2400);
  };
  host.addEventListener('pointerover', lookUp, { passive: true });
  host.addEventListener('focusin', lookUp);
}

export function render() {
  renderRooms();
  renderHomeStats();
  showScreen('home');
}

export function onClick(ev) {
  if (!ev.target.closest('[data-action="reset-progress"]')) return false;
  /* Only the practice shown in this card. Each room keeps its own stars,
     so a slip here never wipes a chess or logic collection. */
  if (window.confirm('Clear the practice history shown here? Your grade, colour settings and the stars in each room are kept.')) {
    storage.resetProgress();
    renderHomeStats();
  }
  return true;
}

function renderRooms() {
  const host = document.getElementById('cz-tiles');
  if (!host) return;
  host.innerHTML = roomGrid(ROOMS);
  hydrateMascots(host);
  paint();
  if (!arrived) {
    arrived = true;
    host.firstElementChild.classList.add('is-arriving');
  }
}

function renderHomeStats() {
  const totals = storage.getTotals();
  const card = $('#gp-home-stats');
  if (!totals.answered) { card.hidden = true; return; }
  card.hidden = false;
  const stats = storage.getStats();
  const rows = state.manifest.categories
    .filter((c) => stats[c.id])
    .map((c) => ({ name: c.name, correct: stats[c.id].correct, seen: stats[c.id].seen }))
    .sort((a, b) => b.seen - a.seen)
    .slice(0, 6);
  $('#gp-home-stats-body').innerHTML =
    `<p class="gp-muted">${totals.answered} puzzles answered, ${totals.correct} right, across ${totals.sessions} session${totals.sessions === 1 ? '' : 's'}.</p>`
    + `<div class="gp-bars" data-style="margin-top:var(--gp-space-4)">${bars(rows)}</div>`;
  paint();
}
