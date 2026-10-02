/**
 * rooms/chess/room.js — the Chess Club, wired to the page.
 *
 * The room is in chess.js and the files beside it: lessons, play, puzzles,
 * openings and the tournament. This file is only the room's half of the
 * contract in ../registry.js.
 *
 * It is by far the heaviest room -- the vendored rules library alone is a
 * hundred kilobytes, and with the board, the bot, the lessons, the puzzles
 * and its stylesheet it comes to over three hundred -- which is why every
 * room is now loaded only when it is opened, as this one always was.
 */

import { chessAction, lessonChoice, playPick, renderChess, tournamentPick } from './chess.js';

/* #/chess, #/chess/1, #/chess/1/l1-rook, #/chess/play, #/chess/games/<id>/<bot>,
   #/chess/puzzles/<theme>, #/chess/openings/<id>, #/chess/tournament/<set> */
export function render([, step, id, third]) {
  renderChess(step, id, third);
}

export function onClick(ev) {
  /* A lesson's question. */
  const choice = ev.target.closest('[data-chess-choice]');
  if (choice) { lessonChoice(choice.dataset.chessChoice); return true; }

  const bot = ev.target.closest('[data-chess-bot]');
  if (bot) { playPick('bot', bot.dataset.chessBot); return true; }

  const game = ev.target.closest('[data-chess-game]');
  if (game) { playPick('game', game.dataset.chessGame); return true; }

  /* Answering a tournament drill. */
  const drill = ev.target.closest('[data-tnpick]');
  if (drill) { tournamentPick(drill.dataset.tnpick); return true; }

  /* Jumping straight to a move in an opening line. */
  const openAt = ev.target.closest('[data-openat]');
  if (openAt) { chessAction('chess-openat', openAt); return true; }

  const theme = ev.target.closest('[data-chess-theme]');
  if (theme) { chessAction('chess-theme', theme); return true; }

  const action = ev.target.closest('[data-action]');
  if (action && action.dataset.action.startsWith('chess-')) { chessAction(action.dataset.action, action); return true; }
  return false;
}
