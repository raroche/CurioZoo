/**
 * rooms/gifted/room.js — GiftedPrep, wired to the page.
 *
 * The practice itself is in gifted.js and the Parent Guide in parents.js.
 * This file is only the room's half of the contract in ../registry.js: which
 * screen each address shows, and which clicks and keys belong to it.
 */

import * as speech from '../../modules/speech.js';
import * as storage from '../../modules/storage.js';
import { describeFigure } from '../../modules/figures.js';
import { $, $$, showScreen, state } from '../../modules/shell.js';
import {
  goForward, goPrev, handleAnswer, nextQuestion, questionCount, renderCategories,
  renderCountPicker, renderGiftedExplainer, renderGradePicker, renderResults,
  renderTests, startSession
} from './gifted.js';
import { renderParents, toggleGuideLanguage } from './parents.js';

export function init() {
  $('#gp-next').addEventListener('click', nextQuestion);
  $('#gp-prev').addEventListener('click', goPrev);
  $('#gp-fwd').addEventListener('click', goForward);
  $('#gp-replay').addEventListener('click', () => speech.speak(
    [state.session?.current?.promptSpeech || state.session?.current?.prompt,
     state.session?.current?.figure ? describeFigure(state.session.current.figure) : ''],
    { force: true }
  ));
  $('#gp-lang-toggle').addEventListener('click', toggleGuideLanguage);
}

export function render([head, a]) {
  switch (head) {
    case 'gifted':
      renderGiftedExplainer();
      renderGradePicker();
      renderCountPicker();
      showScreen('gifted');
      break;
    case 'tests':
      renderTests();
      showScreen('tests');
      break;
    case 'categories':
      if (!a) { location.hash = '#/tests'; return; }
      renderCategories(a);
      showScreen('categories');
      break;
    case 'quiz':
      if (!state.session) { location.hash = '#/home'; return; }
      showScreen('quiz');
      break;
    case 'results':
      if (!state.session) { location.hash = '#/home'; return; }
      renderResults();
      showScreen('results');
      break;
    case 'parents':
      renderParents();
      showScreen('parents');
      break;
    default:
      location.hash = '#/gifted';
  }
}

export function onClick(ev) {
  const grade = ev.target.closest('[data-grade]');
  if (grade) {
    state.settings.grade = Number(grade.dataset.grade);
    storage.setSetting('grade', state.settings.grade);
    renderGradePicker();
    return true;
  }

  const count = ev.target.closest('[data-count]');
  if (count) {
    state.settings.questionCount = Number(count.dataset.count);
    storage.setSetting('questionCount', state.settings.questionCount);
    renderCountPicker();
    return true;
  }

  const choice = ev.target.closest('.gp-choice');
  if (choice && !state.answered) { handleAnswer(choice.dataset.choice); return true; }

  const cat = ev.target.closest('[data-category]');
  if (cat) {
    startSession({ categoryId: cat.dataset.category, limit: questionCount() });
    return true;
  }

  const action = ev.target.closest('[data-action]');
  if (!action) return false;
  switch (action.dataset.action) {
    case 'leave-quiz':
      leaveQuiz();
      return true;
    case 'quick-start':
      startSession({ limit: questionCount() });
      return true;
    case 'start-all': {
      const testId = $('#screen-categories').dataset.test || null;
      startSession({ testId, limit: questionCount() });
      return true;
    }
    case 'again':
      startSession({ ...(state.lastRun || {}), limit: questionCount() });
      return true;
    default:
      return false;
  }
}

export function onKeydown(ev) {
  if (!document.getElementById('screen-quiz').classList.contains('is-active')) return false;
  if (ev.metaKey || ev.ctrlKey || ev.altKey) return false;

  if (!state.answered && /^[1-6]$/.test(ev.key)) {
    const btn = $$('.gp-choice')[Number(ev.key) - 1];
    if (btn) { ev.preventDefault(); btn.click(); }
    return true;
  }
  if (ev.key === 'ArrowLeft') { ev.preventDefault(); goPrev(); return true; }
  if (ev.key === 'ArrowRight') { ev.preventDefault(); goForward(); return true; }
  if (state.answered && (ev.key === 'Enter' || ev.key === ' ')) {
    ev.preventDefault();
    nextQuestion();
    return true;
  }
  return false;
}

function leaveQuiz() {
  if (state.session && state.session.answers.length
      && !window.confirm('Leave this set? Your answers so far are already saved.')) return;
  speech.cancel();
  location.hash = state.lastRun && state.lastRun.testId
    ? `#/categories/${state.lastRun.testId}` : '#/gifted';
}
