/**
 * rooms/math/room.js — the Math Lab, wired to the page.
 *
 * The lessons and exercises are in math.js. This file is only the room's half
 * of the contract in ../registry.js.
 */

import { $ } from '../../modules/shell.js';
import {
  answerMath, checkMath, crossOut, nimTake, paintRegion, pickDoor, renderMath,
  runMachine, settleDoor, stepExercise, tapPeg, toggleBuildCell, turnDial
} from './math.js';

export function init() {
  $('#gp-ex-prev').addEventListener('click', () => stepExercise(-1));
  $('#gp-ex-next').addEventListener('click', () => stepExercise(1));
}

/* #/math, #/math/1, #/math/1/four-colours */
export function render([, grade, topic]) {
  renderMath(grade, topic);
}

export function onClick(ev) {
  /* The lesson folds away once it has been read. */
  if (ev.target.closest('[data-lesson-done]')) {
    const wrap = document.querySelector('.gp-teachwrap');
    if (wrap) wrap.open = false;
    $('#gp-turn-head').scrollIntoView({ block: 'start', behavior: 'smooth' });
    return true;
  }

  if (ev.target.closest('[data-run]')) { runMachine(); return true; }

  const take = ev.target.closest('[data-take]');
  if (take) { nimTake(Number(take.dataset.take)); return true; }

  const door = ev.target.closest('[data-door]');
  if (door) { pickDoor(Number(door.dataset.door)); return true; }
  if (ev.target.closest('[data-stay]')) { settleDoor(false); return true; }
  if (ev.target.closest('[data-switch]')) { settleDoor(true); return true; }

  const dial = ev.target.closest('[data-shift]');
  if (dial) { turnDial(Number(dial.dataset.shift)); return true; }

  const scell = ev.target.closest('[data-num]');
  if (scell) { crossOut(scell); return true; }

  const peg = ev.target.closest('[data-peg]');
  if (peg) { tapPeg(peg); return true; }

  const region = ev.target.closest('[data-region]');
  if (region) { paintRegion(region.dataset.region); return true; }

  const cell = ev.target.closest('[data-cell]');
  if (cell) { toggleBuildCell(cell); return true; }

  const pick = ev.target.closest('[data-pick]');
  if (pick && !pick.disabled) { answerMath(pick.dataset.pick); return true; }

  if (ev.target.closest('#gp-exercise [data-check]')) { checkMath(); return true; }
  return false;
}

/* Enter submits the answer box, the way any small form behaves. */
export function onKeydown(ev) {
  if (ev.key !== 'Enter') return false;
  if (ev.target.matches('#gp-exercise [data-feed]')) { ev.preventDefault(); runMachine(); return true; }
  if (ev.target.matches('#gp-exercise [data-answer-input]')) { ev.preventDefault(); checkMath(); return true; }
  return false;
}
