/**
 * rooms/fun/room.js — Fun and Games, wired to the page.
 *
 * The games themselves are in fun.js, their browsing modes in learn.js, and
 * Discovered or Invented in discover.js. This file is only the room's half of
 * the contract in ../registry.js.
 *
 * A new game inside this room adds its screens to screens.html beside this
 * file, a case to renderFun() in fun.js, and its clicks here.
 */

import * as flags from '../../modules/flags.js';
import { state } from '../../modules/shell.js';
import {
  answerAngle, drawAngSetup, nextAngle, startAngRound,
  answerElement, drawElemSetup, nextElement, startElemRound,
  answerCapChoice, answerCapTyped, drawCapSetup, nextCapital, startCapRound,
  answerFlag, answerVault, drawFlagQuestion, drawFlagSetup, startFlagRound,
  answerShapeChoice, answerShapeTyped, answerShapeVault, drawShapeQuestion, drawShapeSetup,
  startShapeRound, renderFun
} from './fun.js';
import {
  paintAngTurn, paintAngTrap, paintAngClock, learnStep, learnJump, learnOrder,
  showElementDetail
} from './learn.js';
import { answerDisc, discAction, discKey, setDiscSetup } from './discover.js';

/* #/fun, #/fun/flags, #/fun/flags/learn */
export function render([, game, step]) {
  renderFun(game, step);
}

export function onClick(ev) {
  /* ---- browsing mode ---- */
  const ls = ev.target.closest('[data-learnstep]');
  if (ls) { learnStep(ls.dataset.learnstep); return true; }

  const lj = ev.target.closest('[data-learnjump]');
  if (lj) { learnJump(lj.dataset.learnjump); return true; }

  const lo = ev.target.closest('[data-learnorder]');
  if (lo) { learnOrder(lo.dataset.learnorder); return true; }

  /* On the learning page a cell explains itself instead of being an answer. */
  const learnCell = ev.target.closest('#screen-elemlearn [data-elemcell]');
  if (learnCell) { showElementDetail(learnCell.dataset.elemcell); return true; }

  /* ---- name the element ---- */
  const es = ev.target.closest('[data-elemset]');
  if (es) { state.elements.setup.set = es.dataset.elemset; drawElemSetup(); return true; }

  const ea = ev.target.closest('[data-elemask]');
  if (ea) { state.elements.setup.ask = ea.dataset.elemask; drawElemSetup(); return true; }

  const en = ev.target.closest('[data-elemcount]');
  if (en) { state.elements.setup.count = en.dataset.elemcount; drawElemSetup(); return true; }

  /* ---- the angle workshop ---- */
  const ad = ev.target.closest('[data-angdemo]');
  if (ad) { state.angles.demo.deg = Number(ad.dataset.angdemo); paintAngTurn(); return true; }

  const ac = ev.target.closest('[data-angclock]');
  if (ac) { state.angles.demo.hour = Number(ac.dataset.angclock); paintAngClock(); return true; }

  /* ---- guess the angle ---- */
  const aa = ev.target.closest('[data-angask]');
  if (aa) { state.angles.setup.ask = aa.dataset.angask; drawAngSetup(); return true; }

  const asv = ev.target.closest('[data-angset]');
  if (asv) { state.angles.setup.set = asv.dataset.angset; drawAngSetup(); return true; }

  const an = ev.target.closest('[data-angcount]');
  if (an) { state.angles.setup.count = an.dataset.angcount; drawAngSetup(); return true; }

  const ap = ev.target.closest('[data-anganswer]');
  if (ap) { answerAngle(ap.dataset.anganswer); return true; }

  const ans = ev.target.closest('[data-elemanswer]');
  if (ans) { answerElement(ans.dataset.elemanswer); return true; }

  const cellPick = ev.target.closest('[data-elemcell]');
  if (cellPick) { answerElement(cellPick.dataset.elemcell); return true; }

  /* ---- capital city game ---- */
  const cc = ev.target.closest('[data-capcount]');
  if (cc) { state.capitals.setup.count = cc.dataset.capcount; drawCapSetup(); return true; }

  const cp = ev.target.closest('[data-cappick]');
  if (cp) { state.capitals.setup.pick = cp.dataset.cappick; drawCapSetup(); return true; }

  const cm = ev.target.closest('[data-capmode]');
  if (cm) {
    state.capitals.setup.mode = cm.dataset.capmode;
    if (cm.dataset.capmode !== 'continent') state.capitals.setup.continents = [];
    drawCapSetup();
    return true;
  }

  const ck = ev.target.closest('[data-capcont]');
  if (ck) {
    const id = ck.dataset.capcont;
    const on = state.capitals.setup.continents;
    const at = on.indexOf(id);
    if (at === -1) on.push(id); else on.splice(at, 1);
    drawCapSetup();
    return true;
  }

  const ca = ev.target.closest('[data-capanswer]');
  if (ca) { answerCapChoice(ca.dataset.capanswer); return true; }

  if (ev.target.closest('[data-capcheck]')) { answerCapTyped(); return true; }

  /* ---- country shape game ---- */
  const sc = ev.target.closest('[data-shapecount]');
  if (sc) { state.shapes.setup.count = sc.dataset.shapecount; drawShapeSetup(); return true; }

  const sp = ev.target.closest('[data-shapepick]');
  if (sp) { state.shapes.setup.pick = sp.dataset.shapepick; drawShapeSetup(); return true; }

  const sm = ev.target.closest('[data-shapemode]');
  if (sm) {
    state.shapes.setup.mode = sm.dataset.shapemode;
    if (sm.dataset.shapemode !== 'continent') state.shapes.setup.continents = [];
    drawShapeSetup();
    return true;
  }

  const sk = ev.target.closest('[data-shapecont]');
  if (sk) {
    const id = sk.dataset.shapecont;
    const on = state.shapes.setup.continents;
    state.shapes.setup.continents = on.includes(id) ? on.filter((x) => x !== id) : on.concat(id);
    drawShapeSetup();
    return true;
  }

  const sa = ev.target.closest('[data-shapeanswer]');
  if (sa) { answerShapeChoice(sa.dataset.shapeanswer); return true; }

  if (ev.target.closest('[data-shapecheck]')) { answerShapeTyped(); return true; }

  const sv = ev.target.closest('[data-shapevault]');
  if (sv) { answerShapeVault(sv.dataset.shapevault); return true; }

  /* ---- flag game ---- */
  const fs2 = ev.target.closest('[data-flagscope]');
  if (fs2) {
    state.flags.setup.scope = fs2.dataset.flagscope;
    /* A continent chosen under one scope may hold nothing under the other. */
    state.flags.setup.continents = state.flags.setup.continents.filter((id) =>
      flags.inScope(state.flags.data, state.flags.setup.scope).some((c) => c.continent === id));
    drawFlagSetup();
    return true;
  }

  const fc = ev.target.closest('[data-flagcount]');
  if (fc) { state.flags.setup.count = fc.dataset.flagcount; drawFlagSetup(); return true; }

  const fm = ev.target.closest('[data-flagmode]');
  if (fm) {
    state.flags.setup.mode = fm.dataset.flagmode;
    if (fm.dataset.flagmode !== 'continent') state.flags.setup.continents = [];
    drawFlagSetup();
    return true;
  }

  const fk = ev.target.closest('[data-flagcont]');
  if (fk) {
    const id = fk.dataset.flagcont;
    const on = state.flags.setup.continents;
    state.flags.setup.continents = on.includes(id) ? on.filter((x) => x !== id) : on.concat(id);
    drawFlagSetup();
    return true;
  }

  const flagPick = ev.target.closest('[data-flagpick]');
  if (flagPick) { answerFlag(flagPick.dataset.flagpick); return true; }

  const vault = ev.target.closest('[data-vaultpick]');
  if (vault) { answerVault(vault.dataset.vaultpick); return true; }

  /* ---- Discovered or Invented ---- */
  const discPick = ev.target.closest('[data-discpick]');
  if (discPick) { answerDisc(discPick.dataset.discpick); return true; }
  for (const [attr, key] of [['disccount', 'count'], ['disclang', 'lang']]) {
    const pill = ev.target.closest(`[data-${attr}]`);
    if (pill) { setDiscSetup(key, pill.dataset[attr]); return true; }
  }

  const action = ev.target.closest('[data-action]');
  if (!action) return false;
  const name = action.dataset.action;
  if (name.startsWith('disc-')) { discAction(name); return true; }
  switch (name) {
    case 'ang-arms':
      state.angles.demo.swap = !state.angles.demo.swap;
      paintAngTrap();
      return true;
    case 'ang-start':
    case 'ang-again':
      startAngRound();
      return true;
    case 'ang-next':
      nextAngle();
      return true;
    case 'elem-start':
    case 'elem-again':
      startElemRound();
      return true;
    case 'elem-next':
      nextElement();
      return true;
    case 'cap-start':
    case 'cap-again':
      startCapRound();
      return true;
    case 'cap-next':
      nextCapital();
      return true;
    case 'shape-start':
    case 'shape-again':
      startShapeRound();
      return true;
    case 'shape-next':
      state.shapes.round.index += 1;
      drawShapeQuestion();
      return true;
    case 'flag-start':
    case 'flag-again':
      startFlagRound();
      return true;
    case 'flag-next':
      state.flags.round.index += 1;
      drawFlagQuestion();
      return true;
    default:
      return false;
  }
}

export function onKeydown(ev) {
  /* Enter submits a typed answer, the way any small form behaves. */
  if (ev.key === 'Enter') {
    if (ev.target.matches('[data-shapetyped]')) { ev.preventDefault(); answerShapeTyped(); return true; }
    if (ev.target.matches('[data-captyped]')) { ev.preventDefault(); answerCapTyped(); return true; }
  }
  /* Arrows page through the browsing mode, the way any gallery behaves. */
  if (document.getElementById('screen-learn')?.classList.contains('is-active')
      && !/^(INPUT|TEXTAREA)$/.test(ev.target.tagName)) {
    if (ev.key === 'ArrowRight') { ev.preventDefault(); learnStep(1); return true; }
    if (ev.key === 'ArrowLeft') { ev.preventDefault(); learnStep(-1); return true; }
  }
  return discKey(ev);
}
