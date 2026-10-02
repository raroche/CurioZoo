/**
 * rooms/logic/room.js — Logic Games, wired to the page.
 *
 * The room is in hub.js; each game's board is a file beside it, loaded the
 * first time a child opens that game. This file is only the room's half of
 * the contract in ../registry.js.
 */

import { logicClick, logicKey, renderLogic } from './hub.js';

/* #/logic, #/logic/code, #/logic/code/e1, #/logic/code/e1/7, #/logic/code/daily */
export function render(parts) {
  renderLogic(parts);
}

export const onClick = logicClick;
export const onKeydown = logicKey;
