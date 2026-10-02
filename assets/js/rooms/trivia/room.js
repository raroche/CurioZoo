/**
 * rooms/trivia/room.js — Curio Trivia, wired to the page.
 *
 * The game and the Fact Book are in trivia.js. This file is only the room's
 * half of the contract in ../registry.js.
 */

import {
  answerTrivia, renderTrivia, renderTriviaLearn, setTriviaSetup, triviaAction, triviaKey
} from './trivia.js';

/* #/trivia, #/trivia/play, #/trivia/learn */
export function render([, step]) {
  if (step === 'learn') renderTriviaLearn();
  else renderTrivia(step);
}

export function onClick(ev) {
  const pick = ev.target.closest('[data-triviapick]');
  if (pick) { answerTrivia(Number(pick.dataset.triviapick)); return true; }
  for (const [attr, key] of [['trivialevel', 'level'], ['triviacat', 'category'], ['triviacount', 'count'], ['trivialang', 'lang']]) {
    const pill = ev.target.closest(`[data-${attr}]`);
    if (pill) { setTriviaSetup(key, pill.dataset[attr]); return true; }
  }
  const action = ev.target.closest('[data-action]');
  if (action && action.dataset.action.startsWith('trivia-')) { triviaAction(action.dataset.action, action); return true; }
  return false;
}

export const onKeydown = triviaKey;
