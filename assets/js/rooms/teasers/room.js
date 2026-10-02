/**
 * rooms/teasers/room.js — Math Brain Teasers, wired to the page.
 *
 * The game is in teasers.js. This file is only the room's half of the
 * contract in ../registry.js.
 */

import { answerTeaser, renderTeasers, setTeaserSetup, teaserAction, teaserKey } from './teasers.js';

/* #/teasers, #/teasers/play */
export function render([, step]) {
  renderTeasers(step);
}

export function onClick(ev) {
  const pick = ev.target.closest('[data-teaserpick]');
  if (pick) { answerTeaser(Number(pick.dataset.teaserpick)); return true; }
  for (const [attr, key] of [['teaserlevel', 'level'], ['teasercount', 'count'], ['teaserlang', 'lang']]) {
    const pill = ev.target.closest(`[data-${attr}]`);
    if (pill) { setTeaserSetup(key, pill.dataset[attr]); return true; }
  }
  const action = ev.target.closest('[data-action]');
  if (action && action.dataset.action.startsWith('teaser-')) { teaserAction(action.dataset.action); return true; }
  return false;
}

export const onKeydown = teaserKey;
