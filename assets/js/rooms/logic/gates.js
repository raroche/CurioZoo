/**
 * rooms/logic/gates.js — Gate Factory, drawn.
 *
 * One SVG machine, left to right: switches, doors, then the lamps at the
 * animals' houses. Each door wears its word (AND, OR, NOT, ONLY ONE) and a
 * picture. A wire with current is thick and solid with a ⚡; a wire without
 * is thin and dashed: shape and glyph, never colour alone.
 *
 *   predict   tap each lamp (? → 💡 → 🌑), then Check
 *   light     tap the switches, then Power on: the current flows, and the
 *             lamps say if the signs are met
 *   which     read the table of tries, tap the door that fits
 *
 * The current from a switch is always shown (it is just the switch). What
 * comes out of a door is shown only once it is worked out: by Power on, by a
 * hint, or at the end. That is the puzzle.
 */

import * as G from '../../modules/gateslogic.js';
import * as P from '../../modules/logicprogress.js';
import { gt, lampOwner } from '../../modules/gatestext.js';
import { ANIMALS } from '../../modules/zooart.js';
import { hash, rngFor } from '../../modules/logicrng.js';
import { paint, react } from '../../modules/shell.js';
import { esc, lang, say, t } from './frame.js';

/* ------------------------------------------------------------------ */
/* The bank and the chapters                                           */
/* ------------------------------------------------------------------ */

const banks = new Map();

async function bank(level) {
  if (!banks.has(level)) {
    banks.set(level, fetch(`data/logic/gates/${level}.json`, { cache: 'no-cache' }).then((res) => {
      if (!res.ok) throw new Error(`Could not load the ${level} door machines`);
      return res.json();
    }));
    banks.get(level).catch(() => banks.delete(level));
  }
  return banks.get(level);
}

const chapters = (level, L) => G.CHAPTERS[level].map((ch) => ({
  id: ch.id, title: gt(`ch.${ch.id}`, L), idea: gt(`ch.${ch.id}.idea`, L)
}));
const levelOfChapter = (id) => (G.chapter(id) || {}).level || null;
const MODE_ICON = { predict: '💡', light: '🔌', which: '❓' };
const tileLabel = (p, L) => (p.teach ? { icon: '🎓', text: t('teach') } : { icon: MODE_ICON[p.mode], text: gt('tile.puzzle', L) });

/* ------------------------------------------------------------------ */
/* State                                                               */
/* ------------------------------------------------------------------ */

let play = null;

function draw(host, ctx) {
  const p = ctx.puzzle;
  const first = hash(G.shapeOf(p)) % ANIMALS.length;
  play = {
    host, ctx, p, mode: p.mode,
    sw: p.mode === 'predict' ? G.bitsOf(p.k, p.set) : Array(p.k).fill(0),
    guess: p.lamps.map(() => null),       // predict: 1 lit, 0 dark, null not chosen
    powered: false,                       // light: Power on pressed since the last change
    shownDoors: 0,                        // predict: doors worked out by hints, in order
    tries: 0, hints: 0, hint: 0, shown: false, done: false, msg: null, ruledOut: new Set(), pick: null,
    animals: p.lamps.map((_, i) => ANIMALS[(first + i * 5) % ANIMALS.length]),
    lay: layout(p)
  };
  paintBoard();
}

/** The leave hook: nothing runs on a timer here. */
function leave() { play = null; }

/* ------------------------------------------------------------------ */
/* Layout                                                              */
/* ------------------------------------------------------------------ */

const COLW = 168;
const ROW = 96;
const PAD = 26;

/*
 * Switches in the first column, each door one column right of its deepest
 * input, lamps in the last column. Within a column, parts sit in the order
 * of their inputs' heights, so wires cross as little as they can.
 */
function layout(p) {
  const d = G.depths(p);
  const deepest = Math.max(1, ...d.slice(p.k));
  const cols = Array.from({ length: deepest + 2 }, () => []);
  for (let i = 0; i < p.k; i++) cols[0].push({ kind: 'switch', i });
  p.gates.forEach((_, j) => cols[d[p.k + j]].push({ kind: 'door', j }));
  p.lamps.forEach((_, l) => cols[deepest + 1].push({ kind: 'lamp', l }));
  const rows = Math.max(...cols.map((c) => c.length));
  const H = rows * ROW + PAD * 2;
  const pos = {};           // src -> {x, y} of its output, and 'lamp:l' -> {x, y}
  const at = {};            // 'switch:i' | 'door:j' | 'lamp:l' -> {x, y}
  const yOf = (src) => pos[src].y;
  cols.forEach((col, c) => {
    if (c > 0) {
      col.sort((a, b) => {
        const ins = (it) => (it.kind === 'door'
          ? (G.UNARY.has(p.gates[it.j][0]) ? [p.gates[it.j][1]] : [p.gates[it.j][1], p.gates[it.j][2]])
          : [p.lamps[it.l]]);
        const mean = (it) => ins(it).reduce((s, src) => s + yOf(src), 0) / ins(it).length;
        return mean(a) - mean(b);
      });
    }
    const top = PAD + ((rows - col.length) * ROW) / 2;
    col.forEach((it, r) => {
      const x = PAD + c * COLW + 50;
      const y = top + r * ROW + ROW / 2;
      if (it.kind === 'switch') { at[`switch:${it.i}`] = { x, y }; pos[it.i] = { x: x + 40, y }; }
      if (it.kind === 'door') { at[`door:${it.j}`] = { x, y }; pos[p.k + it.j] = { x: x + 48, y }; }
      if (it.kind === 'lamp') at[`lamp:${it.l}`] = { x, y };
    });
  });
  return { W: PAD * 2 + cols.length * COLW, H, at, pos, cols: cols.length };
}

/* ------------------------------------------------------------------ */
/* What is known                                                       */
/* ------------------------------------------------------------------ */

/** Every wire's value for the switches as they are now. */
const values = () => G.run(play.p, play.sw);

/**
 * Is the value of source `src` shown? Switches always; doors once powered
 * (light), once a hint worked them out (predict), or at the end.
 */
function known(src) {
  const { p } = play;
  if (src < p.k) return play.mode !== 'which';
  if (play.done && play.mode !== 'which') return true;
  if (play.mode === 'light') return play.powered;
  if (play.mode === 'predict') return src - p.k < play.shownDoors;
  return false;
}

/* ------------------------------------------------------------------ */
/* Drawing                                                             */
/* ------------------------------------------------------------------ */

const opWord = (op, L) => gt(`op.${op}`, L);
const DOOR_PIC = { and: '🔒🔒', or: '🚪🚪', not: '🔄', xor: '☝️' };

function wire(x1, y1, x2, y2, src, v) {
  const mx = (x1 + x2) / 2;
  const k = known(src);
  const cls = k ? (v[src] ? ' is-on' : ' is-off') : '';
  const bolt = k && v[src] ? `<text class="cz-gt-bolt" x="${mx}" y="${(y1 + y2) / 2 - 6}">⚡</text>` : '';
  return `<path class="cz-gt-wire${cls}" d="M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}"/>${bolt}`;
}

function fromWords(srcs, L) {
  const { p } = play;
  const name = (s) => (s < p.k ? gt('switchN', L, { n: s + 1 })
    : (play.mode === 'which' && s - p.k === p.hide ? '?' : gt(`door.${p.gates[s - p.k][0]}`, L)));
  return srcs.map(name).join(` ${gt('and', L)} `);
}

function boardSvg(L) {
  const { p, lay } = play;
  const v = values();
  const parts = [];
  /* Wires first, under everything. */
  p.gates.forEach(([op, a, b], j) => {
    const { x, y } = lay.at[`door:${j}`];
    const ins = G.UNARY.has(op) ? [[a, y]] : [[a, y - 14], [b, y + 14]];
    for (const [src, yy] of ins) parts.push(wire(lay.pos[src].x, lay.pos[src].y, x - 48, yy, src, v));
  });
  p.lamps.forEach((src, l) => {
    const { x, y } = lay.at[`lamp:${l}`];
    parts.push(wire(lay.pos[src].x, lay.pos[src].y, x - 40, y, src, v));
  });
  /* Switches. */
  for (let i = 0; i < p.k; i++) {
    const { x, y } = lay.at[`switch:${i}`];
    const on = play.sw[i];
    const tap = play.mode === 'light' && !play.done;
    const word = play.mode === 'which' ? `${i + 1}` : gt(on ? 'on' : 'off', L);
    const label = play.mode === 'which' ? gt('switchN', L, { n: i + 1 }) : gt('switchLabel', L, { n: i + 1, state: gt(on ? 'on' : 'off', L) });
    parts.push(`<g class="cz-gt-switch${on && play.mode !== 'which' ? ' is-on' : ''}${tap ? ' is-tap' : ''}" ${tap
      ? `data-gt-switch="${i}" role="button" tabindex="0" aria-pressed="${Boolean(on)}"` : 'role="img"'} aria-label="${esc(label)}">
      <rect x="${x - 40}" y="${y - 24}" width="80" height="48" rx="24"/>
      ${play.mode === 'which' ? '' : `<circle class="cz-gt-knob" cx="${on ? x + 21 : x - 21}" cy="${y}" r="14"/>`}
      <text class="cz-gt-switchword" x="${play.mode === 'which' ? x : on ? x - 14 : x + 15}" y="${y + 5}">${esc(word)}</text>
      <text class="cz-gt-switchn" x="${x}" y="${y - 30}">${esc(gt('switchN', L, { n: i + 1 }))}</text>
    </g>`);
  }
  /* Doors. */
  p.gates.forEach(([op, a, b], j) => {
    const { x, y } = lay.at[`door:${j}`];
    const hidden = play.mode === 'which' && j === p.hide;
    const srcs = G.UNARY.has(op) ? [a] : [a, b];
    const label = hidden ? gt('hiddenLabel', L, { from: fromWords(srcs, L) }) : gt('doorLabel', L, { door: gt(`door.${op}`, L), from: fromWords(srcs, L) });
    parts.push(`<g class="cz-gt-door is-${hidden ? 'hidden' : op}" role="img" aria-label="${esc(label)}">
      <rect x="${x - 48}" y="${y - 32}" width="96" height="64" rx="12"/>
      <text class="cz-gt-doorpic" x="${x}" y="${y - 4}">${hidden ? '❓' : DOOR_PIC[op]}</text>
      <text class="cz-gt-doorword" x="${x}" y="${y + 22}">${esc(hidden ? '?' : opWord(op, L))}</text>
    </g>`);
  });
  /* Lamps at the animals' houses. */
  const lit = G.lampsOf(p, play.sw);
  p.lamps.forEach((src, l) => {
    const { x, y } = lay.at[`lamp:${l}`];
    const a = play.animals[l];
    let state;
    let face;
    if (play.mode === 'predict' && !play.done) {
      state = play.guess[l];
      face = state === null ? '❔' : state ? '💡' : '🌑';
    } else if (play.mode === 'which') {
      state = null;
      face = '💡';
    } else {
      state = known(src) ? lit[l] : null;
      face = state === null ? '❔' : state ? '💡' : '🌑';
    }
    const tap = play.mode === 'predict' && !play.done;
    const word = state === null ? gt('unknown', L) : gt(state ? 'lit' : 'dark', L);
    const want = play.mode === 'light' ? p.want[l] : null;
    parts.push(`<g class="cz-gt-lamp${state === 1 ? ' is-lit' : state === 0 ? ' is-dark' : ''}${tap ? ' is-tap' : ''}" ${tap
      ? `data-gt-lamp="${l}" role="button" tabindex="0"` : 'role="img"'}
      aria-label="${esc(gt('lampLabel', L, { animal: lampOwner(a, L), state: word }))}${want !== null ? `. ${esc(gt('wantLabel', L, { state: gt(want ? 'wantLit' : 'wantDark', L) }))}` : ''}">
      <path d="M ${x - 40} ${y - 6} L ${x} ${y - 38} L ${x + 40} ${y - 6} V ${y + 32} H ${x - 40} Z"/>
      <text class="cz-gt-lampface" x="${x}" y="${y + 18}">${face}</text>
      <text class="cz-gt-animal" x="${x + 34}" y="${y - 22}">${a.emoji}</text>
      ${want !== null ? `<text class="cz-gt-want" x="${x}" y="${y + 52}">${want ? '✓' : '✗'} ${esc(gt(want ? 'wantLit' : 'wantDark', L))}</text>` : ''}
    </g>`);
  });
  return `<div class="cz-br-wrap"><svg class="cz-gt-svg" viewBox="0 0 ${lay.W} ${lay.H + (play.mode === 'light' ? 30 : 0)}"
      data-style="min-width:${Math.round(lay.cols * COLW * 0.62)}px" role="group" aria-label="${esc(gt(`ask.${play.mode}`, L))}">${parts.join('')}</svg></div>`;
}

function tableHtml(L) {
  const { p } = play;
  const head = `<tr><th scope="col">${esc(gt('tries', L))}</th>${Array.from({ length: p.k }, (_, i) => `<th scope="col">${esc(gt('switchN', L, { n: i + 1 }))}</th>`).join('')}
    ${p.lamps.map((_, l) => `<th scope="col">${play.animals[l].emoji} ${esc(gt('lamp', L))}</th>`).join('')}</tr>`;
  const body = p.rows.map(([bits, lamps], r) => `<tr><th scope="row">${esc(gt('tryN', L, { n: r + 1 }))}</th>
    ${G.bitsOf(p.k, bits).map((b) => `<td>${b ? '⚡' : '○'} ${esc(gt(b ? 'on' : 'off', L))}</td>`).join('')}
    ${lamps.map((x) => `<td>${x ? '💡' : '🌑'} ${esc(gt(x ? 'lit' : 'dark', L))}</td>`).join('')}</tr>`).join('');
  return `<table class="cz-gt-table"><thead>${head}</thead><tbody>${body}</tbody></table>`;
}

function controls(L) {
  if (play.done) return '';
  const { p } = play;
  const hintBtn = `<button type="button" class="gp-btn gp-btn--ghost" data-action="gt-hint"><span aria-hidden="true">🔎</span> ${esc(play.hints ? t('hintMore') : t('hint'))}</button>`;
  const answerBtn = play.hints >= 2 && !play.shown ? `<button type="button" class="gp-btn gp-btn--ghost" data-action="gt-answer"><span aria-hidden="true">💡</span> ${esc(gt('answer', L))}</button>` : '';
  if (play.mode === 'which') {
    const opts = p.options.map((op) => `<button type="button" class="gp-btn gp-btn--big cz-gt-opt${play.ruledOut.has(op) ? ' is-out' : ''}${play.pick === op ? ' is-answer' : ''}"
      data-gt-door="${op}" ${play.ruledOut.has(op) ? 'aria-disabled="true"' : ''}><span aria-hidden="true">${DOOR_PIC[op]}</span> ${esc(opWord(op, L))}</button>`).join('');
    return `<div class="cz-gt-opts">${opts}</div><div class="cz-code-actions">${hintBtn}${answerBtn}</div>`;
  }
  const main = play.mode === 'light'
    ? `<button type="button" class="gp-btn gp-btn--primary gp-btn--big" data-action="gt-power">⚡ ${esc(gt('power', L))}</button>`
    : `<button type="button" class="gp-btn gp-btn--primary gp-btn--big" data-action="gt-check">${esc(gt('check', L))}</button>`;
  return `<div class="cz-code-actions">${main}${hintBtn}${answerBtn}</div>`;
}

function paintBoard() {
  const L = lang();
  const { p } = play;
  const hasXor = p.gates.some(([op]) => op === 'xor') || (p.options || []).includes('xor');
  play.host.innerHTML = `<div class="cz-gt" lang="${L}">
    <p class="cz-code-ask">${esc(gt(`ask.${play.mode}`, L))}</p>
    <p class="cz-truth-rules"><span>${esc(gt('rules', L))}${hasXor ? ` ${esc(gt('rulesXor', L))}` : ''}</span></p>
    ${play.done ? '' : `<p class="cz-rule-help">${esc(gt(`how.${play.mode}`, L))}</p>`}
    ${boardSvg(L)}
    ${play.mode === 'which' ? tableHtml(L) : ''}
    ${controls(L)}
    <div class="cz-code-msg" aria-live="polite">${play.msg ? play.msg(L) : ''}</div>
  </div>`;
  paint();
}

/* ------------------------------------------------------------------ */
/* Answering                                                           */
/* ------------------------------------------------------------------ */

const stateWord = (x, L) => gt(x ? 'lit' : 'dark', L);

function check() {
  const { p } = play;
  if (play.guess.some((g) => g === null)) {
    play.msg = (L) => `<p class="cz-code-say is-wrong">${esc(gt('fillAll', L))}</p>`;
    paintBoard();
    return;
  }
  play.tries += 1;
  const lit = G.lampsOf(p, play.sw);
  if (lit.every((x, l) => x === play.guess[l])) { win(); return; }
  play.msg = (L) => `<p class="cz-code-say is-wrong">${esc(gt('wrong.predict', L))}</p>`;
  react('oops', 1400);
  paintBoard();
}

function power() {
  const { p } = play;
  play.tries += 1;
  play.powered = true;
  const lit = G.lampsOf(p, play.sw);
  const bad = lit.findIndex((x, l) => x !== p.want[l]);
  if (bad < 0) { win(); return; }
  play.msg = (L) => `<p class="cz-code-say is-wrong">${esc(gt('wrong.light', L, {
    lamp: gt('lampLabel', L, { animal: lampOwner(play.animals[bad], L), state: '' }).replace(/:\s*$/, ''),
    want: stateWord(p.want[bad], L), got: stateWord(lit[bad], L)
  }))}</p>`;
  react('oops', 1400);
  paintBoard();
}

/** The try that rules door `op` out: [row index, would, was], or null. */
function contradiction(op) {
  const { p } = play;
  for (let r = 0; r < p.rows.length; r++) {
    const [bits, lamps] = p.rows[r];
    const ops = [];
    ops[p.hide] = op;
    const got = G.lampsOf(p, G.bitsOf(p.k, bits), ops);
    const l = got.findIndex((x, i) => x !== lamps[i]);
    if (l >= 0) return [r, got[l], lamps[l]];
  }
  return null;
}

function pickDoor(op) {
  const { p } = play;
  if (play.ruledOut.has(op)) return;
  play.tries += 1;
  if (op === p.gates[p.hide][0]) { win(); return; }
  play.ruledOut.add(op);
  const [r, would, was] = contradiction(op);
  play.msg = (L) => `<p class="cz-code-say is-wrong">${esc(gt('wrong.which', L, { door: opWord(op, L), n: r + 1, would: stateWord(would, L), was: stateWord(was, L) }))}</p>`;
  react('oops', 1400);
  paintBoard();
  /* The chosen door's button is gone with the repaint: stay among the doors. */
  refocus('[data-gt-door]:not(.is-out)');
}

function win() {
  play.done = true;
  const { p, mode } = play;
  const stars = G.starsFor(mode, { tries: play.tries, shown: play.shown });
  play.msg = (L) => `<p class="cz-code-say is-right">✓ ${esc(mode === 'which' ? gt('rightWhich', L, { door: opWord(p.gates[p.hide][0], L) }) : gt('right', L))}</p>`;
  paintBoard();
  react('happy', 2000);
  const ops = [...new Set(p.gates.map(([op]) => op))];
  play.ctx.onSolved({
    stars,
    why: (L) => [
      ...ops.map((op) => esc(gt(`rule.${op}`, L))),
      esc(gt(mode === 'light' ? 'why.backwards' : mode === 'which' ? 'why.which' : 'why.forwards', L))
    ]
  });
}

/* ------------------------------------------------------------------ */
/* Hints and the answer                                                */
/* ------------------------------------------------------------------ */

function hint() {
  const { p } = play;
  play.hints += 1;
  play.hint += 1;
  if (play.mode === 'predict') {
    /* First how to look, then each press works out one more door. */
    if (play.hint === 1) {
      play.msg = (L) => `<p class="cz-code-hint">🔎 ${esc(gt('hint.predict1', L))}</p>`;
    } else if (play.shownDoors < p.gates.length) {
      const j = play.shownDoors;
      play.shownDoors += 1;
      const [op, a, b] = p.gates[j];
      const v = values();
      play.msg = (L) => `<p class="cz-code-hint">💡 ${esc(gt(G.UNARY.has(op) ? 'hint.predictDoor' : 'hint.predictDoor2', L, {
        door: cap(gt(`door.${op}`, L)), a: gt(v[a] ? 'on' : 'off', L), b: G.UNARY.has(op) ? '' : gt(v[b] ? 'on' : 'off', L),
        through: gt(v[p.k + j] ? 'hint.through' : 'hint.stops', L)
      }))}</p>`;
    }
  } else if (play.mode === 'light') {
    play.powered = false;
    if (play.hint === 1) {
      play.msg = (L) => `<p class="cz-code-hint">🔎 ${esc(gt('hint.light1', L))}</p>`;
    } else if (play.hint === 2) {
      /* What the door before the first lamp must do. */
      const src = p.lamps[0];
      if (src >= p.k) {
        const [op] = p.gates[src - p.k];
        play.msg = (L) => `<p class="cz-code-hint">💡 ${esc(gt(`need.${op}.${p.want[0]}`, L, { door: cap(gt(`door.${op}`, L)) }))}</p>`;
      }
    } else {
      /* Set the first switch that is wrong. */
      const right = G.bitsOf(p.k, G.answerOf(p));
      const i = play.sw.findIndex((x, n) => x !== right[n]);
      if (i >= 0) {
        play.sw[i] = right[i];
        play.msg = (L) => `<p class="cz-code-hint">✋ ${esc(gt('hint.switch', L, { n: i + 1, state: gt(right[i] ? 'on' : 'off', L) }))}</p>`;
      }
    }
  } else if (play.hint === 1) {
    play.msg = (L) => `<p class="cz-code-hint">🔎 ${esc(gt('hint.which1', L))}</p>`;
  } else {
    /* Rule out one wrong door, with the try that does it. */
    const wrong = p.options.find((op) => op !== p.gates[p.hide][0] && !play.ruledOut.has(op));
    if (wrong) {
      play.ruledOut.add(wrong);
      const [r, would, was] = contradiction(wrong);
      play.msg = (L) => `<p class="cz-code-hint">💡 ${esc(gt('hint.notThis', L, { door: opWord(wrong, L), n: r + 1, would: stateWord(would, L), was: stateWord(was, L) }))}</p>`;
    }
  }
  paintBoard();
}

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/** After two hints: put the answer in. The child still presses the button. */
function showAnswer() {
  const { p } = play;
  play.shown = true;
  if (play.mode === 'predict') {
    play.guess = G.lampsOf(p, play.sw);
    play.shownDoors = p.gates.length;
  } else if (play.mode === 'light') {
    play.sw = G.bitsOf(p.k, G.answerOf(p));
    play.powered = false;
  } else {
    play.pick = p.gates[p.hide][0];
  }
  play.msg = (L) => `<p class="cz-code-hint">💡 ${esc(gt('answerShown', L))}</p>`;
  paintBoard();
}

/* ------------------------------------------------------------------ */
/* Clicks, keys, reading aloud                                         */
/* ------------------------------------------------------------------ */

function refocus(sel) {
  const el = play.host.querySelector(sel);
  if (el) el.focus({ preventScroll: true });
}

function click(ev) {
  if (!play || play.done) return false;
  const q = (s) => ev.target.closest(s);
  let el;
  if ((el = q('[data-gt-switch]'))) {
    const i = Number(el.dataset.gtSwitch);
    play.sw[i] ^= 1;
    play.powered = false;
    play.msg = null;
    paintBoard();
    refocus(`[data-gt-switch="${i}"]`);
    return true;
  }
  if ((el = q('[data-gt-lamp]'))) {
    const l = Number(el.dataset.gtLamp);
    const g = play.guess[l];
    play.guess[l] = g === null ? 1 : g === 1 ? 0 : null;
    play.msg = null;
    paintBoard();
    refocus(`[data-gt-lamp="${l}"]`);
    return true;
  }
  if ((el = q('[data-gt-door]'))) { pickDoor(el.dataset.gtDoor); return true; }
  if ((el = q('[data-action]'))) {
    switch (el.dataset.action) {
      case 'gt-check': check(); return true;
      case 'gt-power': power(); return true;
      case 'gt-hint': hint(); return true;
      case 'gt-answer': showAnswer(); return true;
      default: return false;
    }
  }
  return false;
}

function key(ev) {
  if (!play || play.done) return false;
  const el = ev.target.closest && ev.target.closest('[data-gt-switch], [data-gt-lamp]');
  if (el && (ev.key === 'Enter' || ev.key === ' ')) {
    ev.preventDefault();
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }
  return false;
}

function readAloud() {
  if (!play) return;
  const L = lang();
  const { p } = play;
  const parts = [gt(`ask.${play.mode}`, L), gt('rules', L)];
  for (let i = 0; i < p.k && play.mode !== 'which'; i++) parts.push(gt('switchLabel', L, { n: i + 1, state: gt(play.sw[i] ? 'on' : 'off', L) }));
  p.gates.forEach(([op, a, b], j) => {
    const hidden = play.mode === 'which' && j === p.hide;
    const from = fromWords(G.UNARY.has(op) ? [a] : [a, b], L);
    parts.push(hidden ? gt('hiddenLabel', L, { from }) : gt('doorLabel', L, { door: gt(`door.${op}`, L), from }));
  });
  say(parts);
}

const repaint = () => { if (play) paintBoard(); };

/* ------------------------------------------------------------------ */
/* Your lit houses, and today's puzzle                                 */
/* ------------------------------------------------------------------ */

const HOUSE_EMOJI = ['🏠', '🏡', '🏘️', '🏚️', '🏛️', '🏗️', '🏰', '🗼', '🏯'];

function extras({ bank: b, level, rec, lang: L }) {
  const at = G.LEVELS.indexOf(level) * 3;
  const cards = b.chapters.map((ch, i) => {
    const ids = ch.puzzles.map((p) => p.id);
    const { solved } = P.tally(rec, 'gates', ids);
    return `<li class="cz-code-pen${solved ? ' is-home' : ''}">
      <span class="cz-code-pen__pic" aria-hidden="true">${solved ? '💡' : HOUSE_EMOJI[at + i]}</span>
      <span class="cz-code-pen__text"><strong>${esc(gt(`ch.${ch.id}`, L))}</strong>
        <span>${esc(gt('lamps.count', L, { n: solved, t: ids.length }))}</span></span>
    </li>`;
  }).join('');
  return `<section class="cz-code-zoo" aria-labelledby="cz-gt-houses-h">
    <h2 class="cz-logic-h2" id="cz-gt-houses-h">💡 ${esc(gt('lamps.title', L))}</h2>
    <p class="gp-muted">${esc(gt('lamps.lede', L))}</p>
    <ul class="cz-code-pens">${cards}</ul>
  </section>`;
}

/* Today's machine is made fresh: any chapter of the level, any of its modes. */
function dailyPuzzle(level, iso) {
  const list = G.CHAPTERS[level];
  const def = list[hash('gates-daily', level, iso) % list.length];
  const ch = G.chapter(def.id);
  const mode = ch.modes[hash('gates-mode', level, iso) % ch.modes.length];
  const p = G.makePuzzle(ch, mode, rngFor('gates', 'daily', level, iso));
  return p ? { puzzle: { id: `daily-${iso}`, ...p }, chapterId: def.id } : null;
}

export default {
  id: 'gates', bank, chapters, levelOfChapter, tileLabel, draw, repaint, click, key,
  say: readAloud, extras, dailyPuzzle, leave
};
