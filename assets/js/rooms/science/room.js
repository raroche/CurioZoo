/**
 * rooms/science/room.js — the Science Lab, wired to the page.
 *
 * The room is in hub.js; each game's board is a file beside it, loaded the
 * first time a child opens that game. This file is only the room's half of
 * the contract in ../registry.js.
 */

import { leaveScience, renderScience, scienceClick, scienceKey } from './hub.js';

/* #/science, #/science/pond, #/science/pond/e1, #/science/pond/e1/7, #/science/pond/daily */
export function render(parts) {
  renderScience(parts);
}

export const onClick = scienceClick;
export const onKeydown = scienceKey;
export const leave = leaveScience;
