/**
 * rooms/science/slide.js — Penguin Slide, drawn.
 *
 * Tube puzzles are seen from above: an ice rink, the tube as a thick blue
 * arc, and three fish, one where the penguin really goes (straight out of
 * the tube), one where "it keeps curving" would take it and one where "it is
 * flung outward" would. Hill and jump puzzles are seen from the side, with
 * every height written in rows, so the rules can be checked by counting.
 *
 * Every puzzle is one go: choose, press Slide, watch, read why. The flight
 * off a ledge leaves a dot at every tick, as in Fruit Train. With reduced
 * motion, or in a hidden tab, the penguin is simply where it ends up.
 */

import * as S from '../../modules/slidelogic.js';
import { rows, squares, st, ticks } from '../../modules/slidetext.js';
import { hash, rngFor } from '../../modules/logicrng.js';
import { calm } from '../../modules/celebrate.js';
import { paint, react } from '../../modules/shell.js';
import { IDEAS } from '../../modules/sciencetext.js';
import { esc, lang, say, t } from './frame.js';

/* ------------------------------------------------------------------ */
/* The bank and the chapters                                           */
/* ------------------------------------------------------------------ */

const banks = new Map();

async function bank(level) {
  if (!banks.has(level)) {
    banks.set(level, fetch(`data/science/slide/${level}.json`, { cache: 'no-cache' }).then((res) => {
      if (!res.ok) throw new Error(`Could not load the ${level} slides`);
      return res.json();
    }));
    banks.get(level).catch(() => banks.delete(level));
  }
  return banks.get(level);
}

const chapters = (level, L) => S.CHAPTERS[level].map((ch) => ({
  id: ch.id, icon: ch.icon, title: st(`ch.${ch.id}`, L), idea: st(`ch.${ch.id}.idea`, L)
}));
const levelOfChapter = (id) => (S.chapter(id) || {}).level || null;
const TILE_ICON = { tube: '🌀', lanes: '⛰️', hills: '🏔️', jump: '💦', ledge: '📏', start: '🐧' };
const tileLabel = (p, L) => (p.teach ? { icon: '🎓', text: t('teach') } : { icon: TILE_ICON[p.kind], text: st(`tile.${p.kind}`, L) });

/* ------------------------------------------------------------------ */
/* State                                                               */
/* ------------------------------------------------------------------ */

let play = null;
let frame = 0;
let timers = [];

function stopMotion() {
  if (frame) cancelAnimationFrame(frame);
  frame = 0;
  timers.forEach(clearTimeout);
  timers = [];
}

function draw(host, ctx) {
  stopMotion();
  const p = ctx.puzzle;
  play = {
    host, ctx, p, right: S.answers(p),
    picks: S.answers(p).map(() => null),
    ran: false, hints: 0, hint: 0, wrong: 0, done: false, msg: null
  };
  paintBoard();
}

const L0 = () => lang();
const LETTER = (i) => String.fromCharCode(65 + i);

/**
 * Run `onFrame(ticks)` for `endTicks` ticks, then `onEnd()`. A hidden tab
 * gets no frames, so a timer finishes the run anyway.
 */
function animate(endTicks, msPerTick, onFrame, onEnd) {
  let over = false;
  const end = () => {
    if (over) return;
    over = true;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    onFrame(endTicks);
    onEnd();
  };
  if (calm() || document.hidden) { end(); return; }
  const t0 = performance.now();
  const step = (now) => {
    if (over) return;
    const tk = (now - t0) / msPerTick;
    onFrame(Math.min(tk, endTicks));
    if (tk < endTicks) frame = requestAnimationFrame(step); else end();
  };
  frame = requestAnimationFrame(step);
  timers.push(setTimeout(end, endTicks * msPerTick + 1500));
}

/** Points along a polyline, by distance: f(s) for s from 0 to 1. */
function along(points) {
  const segs = [];
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const len = Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
    segs.push({ a: points[i - 1], b: points[i], len, at: total });
    total += len;
  }
  return (s) => {
    const want = Math.max(0, Math.min(1, s)) * total;
    const g = segs.find((x) => want <= x.at + x.len) || segs[segs.length - 1];
    const k = g.len ? (want - g.at) / g.len : 0;
    return [g.a[0] + (g.b[0] - g.a[0]) * k, g.a[1] + (g.b[1] - g.a[1]) * k];
  };
}

/* ------------------------------------------------------------------ */
/* Tubes, from above                                                   */
/* ------------------------------------------------------------------ */

const CELL = 30;
const cx = (x) => x * CELL + CELL / 2;

/* The route as points: straight runs, and arcs sampled every few degrees. */
function tubePoints(p, toFish) {
  const pts = [];
  const { segs, exit, d } = S.route(p);
  for (const s of segs) {
    if (s.line) { pts.push(s.line[0], s.line[1]); continue; }
    const { from, to, centre } = s.arc;
    const a0 = Math.atan2(from[1] - centre[1], from[0] - centre[0]);
    let a1 = Math.atan2(to[1] - centre[1], to[0] - centre[0]);
    const cw = s.arc.turn === 'R';
    if (cw && a1 < a0) a1 += 2 * Math.PI;
    if (!cw && a1 > a0) a1 -= 2 * Math.PI;
    for (let k = 1; k <= 12; k++) {
      const a = a0 + ((a1 - a0) * k) / 12;
      pts.push([centre[0] + s.arc.r * Math.cos(a), centre[1] + s.arc.r * Math.sin(a)]);
    }
  }
  if (toFish) {
    const f = p.fish[S.fishReached(p)];
    pts.push(f || [exit[0] + S.DIRS[d][0] * 20, exit[1] + S.DIRS[d][1] * 20]);
  }
  return pts;
}

function tubeSvg() {
  const L = L0();
  const p = play.p;
  const W = p.w * CELL;
  const H = p.h * CELL;
  const parts = [`<rect class="cz-sl-ice" x="0" y="0" width="${W}" height="${H}" rx="12"/>`];
  for (let i = 1; i < p.w; i++) parts.push(`<path class="cz-sl-grid" d="M${i * CELL} 0 V${H}"/>`);
  for (let i = 1; i < p.h; i++) parts.push(`<path class="cz-sl-grid" d="M0 ${i * CELL} H${W}"/>`);
  /* The tubes: a thick arc per quarter, and the straight run into each. */
  for (const s of S.route(p).segs) {
    if (s.line) {
      const [a, b] = s.line;
      parts.push(`<path class="cz-sl-run" d="M${cx(a[0])} ${cx(a[1])} L${cx(b[0])} ${cx(b[1])}"/>`);
    } else {
      const { from, to, r, turn } = s.arc;
      parts.push(`<path class="cz-sl-tube" d="M${cx(from[0])} ${cx(from[1])} A${r * CELL} ${r * CELL} 0 0 ${turn === 'R' ? 1 : 0} ${cx(to[0])} ${cx(to[1])}"/>`);
    }
  }
  /* After the slide: its path out of the tube, as dots. */
  if (play.ran) {
    const pts = tubePoints(p, true);
    const last = pts[pts.length - 1];
    const exit = S.route(p).exit;
    const n = Math.max(Math.abs(last[0] - exit[0]), Math.abs(last[1] - exit[1]));
    for (let k = 1; k < n; k++) {
      parts.push(`<circle class="cz-sl-dot" cx="${cx(exit[0] + ((last[0] - exit[0]) * k) / n)}" cy="${cx(exit[1] + ((last[1] - exit[1]) * k) / n)}" r="3"/>`);
    }
  }
  p.fish.forEach((f, i) => {
    const got = play.ran && i === S.fishReached(p);
    parts.push(`<g class="cz-sl-fish${got ? ' is-got' : ''}"><text x="${cx(f[0])}" y="${cx(f[1])}" font-size="22" text-anchor="middle" dominant-baseline="central">🐟</text>
      <text class="cz-sl-fishn" x="${cx(f[0]) + 12}" y="${cx(f[1]) - 10}">${LETTER(i)}</text></g>`);
  });
  const start = play.ran ? tubePoints(p, true).pop() : p.start;
  parts.push(`<text class="cz-sl-peng" data-sl-peng x="${cx(start[0])}" y="${cx(start[1])}" font-size="24" text-anchor="middle" dominant-baseline="central">🐧</text>`);
  return `<svg class="cz-sl-svg" viewBox="-4 -4 ${W + 8} ${H + 8}" role="img" aria-label="${esc(st('ask.tube', L))}">${parts.join('')}</svg>`;
}

/* ------------------------------------------------------------------ */
/* Hills, from the side                                                */
/* ------------------------------------------------------------------ */

const SW = 360;

/** The ground of one slide: the start shelf, the ramp, the hills, the pool. Returns the outline and where each hill top is. */
function hillGround(start, hills, x0, base, rowPx) {
  const pts = [[x0, base - start * rowPx], [x0 + 34, base - start * rowPx], [x0 + 70, base]];
  const tops = [];
  let x = x0 + 70;
  const width = Math.min(70, (SW - x0 - 110) / Math.max(1, hills.length));
  hills.forEach((h) => {
    pts.push([x + width / 2, base - h * rowPx]);
    tops.push([x + width / 2, base - h * rowPx]);
    x += width;
    pts.push([x, base]);
  });
  return { pts, tops, end: x };
}

/**
 * Where the penguin goes on one slide: down, over every hill it clears,
 * then (if a hill stops it) part way up that hill and back, settling in the
 * hollow before it.
 */
function hillPath(start, hills, g) {
  const k = S.stopsAt(start, hills);
  const path = g.pts.slice(0, 3 + 2 * k);
  if (k < hills.length) {
    const top = g.tops[k];
    const foot = path[path.length - 1];
    /* Up the slope to just under its start height, then back. */
    const reach = Math.min(1, (start - 0.4) / hills[k]);
    const up = [foot[0] + (top[0] - foot[0]) * reach, foot[1] + (top[1] - foot[1]) * reach];
    path.push(up, foot);
    if (k > 0) {
      const prev = g.tops[k - 1];
      path.push([foot[0] + (prev[0] - foot[0]) * 0.3, foot[1] + (prev[1] - foot[1]) * 0.3], foot);
    }
  } else {
    path.push([g.end + 30, path[path.length - 1][1]]);
  }
  return path;
}

function hillsSvg() {
  const L = L0();
  const p = play.p;
  const lanes = p.kind === 'lanes' ? p.hills.map((h) => [h]) : [p.hills];
  const maxH = Math.max(p.start, ...p.hills) + 1;
  const rowPx = Math.min(16, (p.kind === 'lanes' ? 80 : 150) / maxH);
  const laneH = maxH * rowPx + 26;
  const parts = [];
  play.paths = [];
  lanes.forEach((hs, li) => {
    const base = 14 + (li + 1) * laneH - 12;
    const g = hillGround(p.start, hs, 40, base, rowPx);
    /* A ruler of rows on the left. */
    for (let r = 0; r <= maxH - 1; r++) {
      const y = base - r * rowPx;
      parts.push(`<path class="cz-sl-tick${r % 5 === 0 ? ' is-major' : ''}" d="M16 ${y} H${r % 5 === 0 ? 28 : 23}"/>`);
      if (r % 5 === 0 || r === p.start) parts.push(`<text class="cz-sl-rulen" x="12" y="${y + 4}" text-anchor="end">${r}</text>`);
    }
    parts.push(`<path class="cz-sl-snow" d="M${g.pts.map((q) => q.join(' ')).join(' L')} L${g.end} ${base + 6} L40 ${base + 6} Z"/>`);
    parts.push(`<rect class="cz-sl-pool" x="${g.end + 6}" y="${base - 4}" width="${SW - g.end - 12}" height="12" rx="4"/>`);
    g.tops.forEach((tp, k) => parts.push(`<text class="cz-sl-hilln" x="${tp[0]}" y="${tp[1] - 6}" text-anchor="middle">${p.kind === 'lanes' ? '' : `${k + 1}: `}${hs[k]}</text>`));
    parts.push(`<text class="cz-sl-shelfn" x="57" y="${base - p.start * rowPx - 8}" text-anchor="middle">${p.start}</text>`);
    if (p.kind === 'lanes') parts.push(`<text class="cz-sl-lane" x="${SW - 8}" y="${base - maxH * rowPx + 10}" text-anchor="end">${esc(st('lane', L, { n: li + 1 }))}</text>`);
    const path = hillPath(p.start, hs, g);
    play.paths.push(path);
    const at = play.ran ? path[path.length - 1] : path[0];
    parts.push(`<text class="cz-sl-peng" data-sl-peng="${li}" x="${at[0]}" y="${at[1] - 10}" font-size="20" text-anchor="middle" dominant-baseline="central">🐧</text>`);
  });
  return `<svg class="cz-sl-svg" viewBox="0 0 ${SW} ${14 + lanes.length * laneH}" role="img" aria-label="${esc(askText(L))}">${parts.join('')}</svg>`;
}

/* ------------------------------------------------------------------ */
/* Jumps, from the side                                                */
/* ------------------------------------------------------------------ */

/* The shelf the penguin starts from, for whichever kind of jump. */
function jumpParts() {
  const p = play.p;
  if (p.kind === 'jump') return { dh: p.dh, H: p.H, x: S.landing(p.dh, p.H), marks: p.marks };
  if (p.kind === 'ledge') {
    const H = play.ran ? p.opts[play.right[0]] : null;
    return { dh: p.dh, H, x: p.x, marks: [p.x] };
  }
  const pick = play.ran ? p.opts[play.picks[0]] : null;
  return { dh: pick, H: p.H, x: p.x, marks: [p.x], shelves: p.opts };
}

function jumpSvg() {
  const L = L0();
  const p = play.p;
  const j = jumpParts();
  const dhMax = p.kind === 'start' ? Math.max(...p.opts) : j.dh;
  const Hdraw = j.H || Math.max(...(p.opts || [4]));
  const xMax = Math.max(...(p.kind === 'jump' ? p.marks : [p.x]), S.landing(dhMax, Hdraw)) + 2;
  const rowPx = Math.min(24, 190 / (dhMax + Hdraw + (p.hill || 0)));
  const colPx = Math.min(22, (SW - 120) / xMax);
  const pool = 30 + (dhMax + Hdraw) * rowPx + 10;   // the water's surface
  const lipY = pool - Hdraw * rowPx;
  const lipX = 100;
  const X = (c) => lipX + c * colPx;
  const parts = [];
  /* The ledge, with its height written on it, or a "?" before a ledge
     question is answered. */
  parts.push(`<rect class="cz-sl-cliff" x="${lipX - 40}" y="${lipY}" width="40" height="${pool - lipY + 14}"/>`);
  parts.push(`<text class="cz-sl-cliffn" x="${lipX - 20}" y="${(lipY + pool) / 2 + 4}" text-anchor="middle">${p.kind === 'ledge' && !play.ran ? '?' : esc(rows(Hdraw, L))}</text>`);
  parts.push(`<rect class="cz-sl-water" x="${lipX}" y="${pool}" width="${SW - lipX}" height="18"/>`);
  /* Distance marks along the water, every square, numbered. */
  for (let c = 0; c <= xMax; c++) {
    parts.push(`<path class="cz-sl-tick" d="M${X(c)} ${pool} V${pool + 5}"/>`);
    if (c % 2 === 0) parts.push(`<text class="cz-sl-rulen" x="${X(c)}" y="${pool + 16}" text-anchor="middle">${c}</text>`);
  }
  /* The pool to land in, or the marks to choose from. */
  if (p.kind === 'jump') {
    p.marks.forEach((m, i) => parts.push(`<g class="cz-sl-mark${play.picks[0] === i ? ' is-on' : ''}"><path d="M${X(m)} ${pool - 10} V${pool}"/><text x="${X(m)}" y="${pool - 14}" text-anchor="middle">${LETTER(i)}</text></g>`));
  } else {
    parts.push(`<rect class="cz-sl-target" x="${X(p.x) - colPx / 2}" y="${pool - 3}" width="${colPx}" height="8" rx="3"/>`);
    parts.push(`<text x="${X(p.x)}" y="${pool - 10}" font-size="16" text-anchor="middle">🎯</text>`);
  }
  /* The shelves: one, or the choices for "pick the shelf". */
  const shelves = p.kind === 'start' ? p.opts : [j.dh];
  shelves.forEach((dh, i) => {
    const y = lipY - dh * rowPx;
    const x0 = 24 + i * 6;
    parts.push(`<path class="cz-sl-ramp" d="M${x0} ${y} H${x0 + 24} L${lipX - 40} ${lipY} H${lipX}"/>`);
    parts.push(`<text class="cz-sl-shelfn" x="${x0 + 2}" y="${y - 4}">${p.kind === 'start' ? `${LETTER(i)}: ` : '↓ '}${esc(rows(dh, L))}</text>`);
  });
  if (p.hill) {
    const hx = (lipX - 40 + 60) / 2 + 10;
    parts.push(`<path class="cz-sl-snow" d="M${hx - 16} ${lipY} L${hx} ${lipY - p.hill * rowPx} L${hx + 16} ${lipY} Z"/>
      <text class="cz-sl-hilln" x="${hx}" y="${lipY - p.hill * rowPx - 5}" text-anchor="middle">${p.hill}</text>`);
  }
  /* The flight, once it has happened: a dot at every tick. */
  if (play.ran && j.dh && j.H) {
    const v = 2 * Math.sqrt(j.dh);
    const n = Math.round(Math.sqrt(j.H));
    const clearsHill = !p.hill || S.clears(j.dh, p.hill);
    if (clearsHill) {
      for (let k = 0; k <= n; k++) parts.push(`<circle class="cz-sl-dot" cx="${X(v * k)}" cy="${lipY + k * k * rowPx}" r="3.2"/>`);
    }
  }
  play.jumpGeo = { X, lipY, rowPx, colPx, shelves: shelves.map((dh, i) => ({ dh, x0: 24 + i * 6, y: lipY - dh * rowPx })), lipX };
  const startShelf = play.jumpGeo.shelves.find((s) => s.dh === j.dh) || play.jumpGeo.shelves[0];
  const pengAt = play.ran ? finalJumpPos() : [startShelf.x0 + 12, startShelf.y];
  parts.push(`<text class="cz-sl-peng" data-sl-peng x="${pengAt[0]}" y="${pengAt[1] - 10}" font-size="20" text-anchor="middle" dominant-baseline="central">🐧</text>`);
  return `<svg class="cz-sl-svg" viewBox="0 0 ${SW} ${pool + 24}" role="img" aria-label="${esc(askText(L))}">${parts.join('')}</svg>`;
}

/* Where the penguin ends a jump: in the water, or stuck before the hill. */
function finalJumpPos() {
  const p = play.p;
  const j = jumpParts();
  const g = play.jumpGeo;
  if (p.hill && !S.clears(j.dh, p.hill)) return [(g.lipX - 40 + 60) / 2 - 8, g.lipY];
  return [g.X(S.landing(j.dh, j.H)), g.lipY + j.H * g.rowPx];
}

/* ------------------------------------------------------------------ */
/* Questions                                                           */
/* ------------------------------------------------------------------ */

function askText(L) {
  const p = play.p;
  switch (p.kind) {
    case 'tube': return st('ask.tube', L);
    case 'lanes': return st('ask.lanes', L, { hh: rows(p.start, L) });
    case 'hills': return st('ask.hills', L, { hh: rows(p.start, L) });
    case 'jump': return st('ask.jump', L, { dd: rows(p.dh, L), HH: rows(p.H, L) });
    case 'ledge': return st('ask.ledge', L, { dd: rows(p.dh, L), xx: squares(p.x, L) });
    case 'start': return p.hill
      ? st('ask.startHill', L, { HH: rows(p.H, L), xx: squares(p.x, L), tt: rows(p.hill, L) })
      : st('ask.start', L, { HH: rows(p.H, L), xx: squares(p.x, L) });
    default: return '';
  }
}

function choiceText(k, v, L) {
  const p = play.p;
  switch (p.kind) {
    case 'tube': return st('fish', L, { x: LETTER(v) });
    case 'lanes': return v === 'over' ? `⛷️ ${st('over', L)}` : `✋ ${st('stop', L)}`;
    case 'hills': return v === p.hills.length ? st('overAll', L) : st('stopBefore', L, { n: v + 1 });
    case 'jump': return `${LETTER(v)} · ${st('out', L, { xx: squares(p.marks[v], L) })}`;
    case 'ledge': return st('high', L, { hh: rows(p.opts[v], L) });
    case 'start': return `${LETTER(v)} · ${st('up', L, { hh: rows(p.opts[v], L) })}`;
    default: return String(v);
  }
}

function questionName(k, L) {
  return play.p.kind === 'lanes' ? `${st('lane', L, { n: k + 1 })} · ${st('high', L, { hh: rows(play.p.hills[k], L) })}` : '';
}

function resultText(k, L) {
  const p = play.p;
  const r = play.right[k];
  switch (p.kind) {
    case 'tube': return st('res.fish', L, { x: LETTER(r) });
    case 'lanes': return st(r === 'over' ? 'res.over' : 'res.stop', L, { n: k + 1 });
    case 'hills': return r === p.hills.length ? st('res.overAll', L) : st('res.stopAt', L, { n: r + 1 });
    case 'jump': return st('res.splash', L, { xx: squares(p.marks[r], L) });
    case 'ledge': return st('res.ledge', L, { hh: rows(p.opts[r], L) });
    case 'start': return st('res.start', L, { hh: rows(p.opts[r], L) });
    default: return '';
  }
}

function whyText(k, L) {
  const p = play.p;
  const flight = (dh, H) => {
    const v = 2 * Math.round(Math.sqrt(dh));
    const n = Math.round(Math.sqrt(H));
    return `${st('why.speed', L, { dd: rows(dh, L), vv: squares(v, L) })} ${st('why.fly', L, { HH: rows(H, L), nn: ticks(n, L), vv: squares(v, L), n, xx: squares(v * n, L) })}`;
  };
  switch (p.kind) {
    case 'tube': {
      const picked = play.picks[k];
      const ideas = S.wrongIdeas(p);
      const extra = picked !== play.right[k] && p.fish[picked] && p.fish[picked][0] === ideas.curve[0] && p.fish[picked][1] === ideas.curve[1] ? st('why.curve', L) : picked !== play.right[k] ? st('why.flung', L) : '';
      return `${st('why.tube', L)} ${extra}`.trim();
    }
    case 'lanes': {
      const h = p.hills[k];
      return h === p.start ? st('why.equal', L) : S.clears(p.start, h) ? st('why.over', L) : st('why.stop', L);
    }
    case 'hills': {
      const r = play.right[k];
      return r === p.hills.length ? st('why.over', L) : p.hills[r] === p.start ? st('why.equal', L) : st('why.stop', L);
    }
    case 'jump': return flight(p.dh, p.H);
    case 'ledge': return flight(p.dh, p.opts[play.right[k]]);
    case 'start': {
      const dh = p.opts[play.right[k]];
      return `${flight(dh, p.H)}${p.hill ? ` ${st('why.hill', L, { hh: rows(dh, L), tt: rows(p.hill, L) })}` : ''}`;
    }
    default: return '';
  }
}

function card(k, L) {
  const opts = S.choices(play.p)[k];
  const picked = play.picks[k];
  const name = questionName(k, L);
  const ok = play.done ? picked === play.right[k] : null;
  const buttons = play.done ? '' : `<div class="cz-sci-opts" role="group" aria-label="${esc(name || askText(L))}">
    ${opts.map((v) => `<button type="button" class="gp-btn cz-sci-opt${picked === v ? ' is-on' : ''}" aria-pressed="${picked === v}"
      data-sl-q="${k}" data-sl-v="${v}">${esc(choiceText(k, v, L))}</button>`).join('')}</div>`;
  const result = play.done ? `<p class="cz-sci-result ${ok ? 'is-right' : 'is-surprise'}">
    ${ok ? '' : '<span class="cz-sci-wow" aria-hidden="true">🤯</span>'}<strong>${esc(ok ? st('right', L, { res: resultText(k, L) }) : st('surprise', L, { res: resultText(k, L) }))}</strong>
    <span class="cz-sci-rwhy">${esc(whyText(k, L))}</span></p>` : '';
  return `<li class="cz-sci-card${ok === true ? ' is-right' : ok === false ? ' is-surprise' : ''}">
    ${name ? `<div class="cz-sci-cardhead"><span class="cz-sci-cardname">${esc(name)}</span></div>` : ''}
    ${buttons}${result}</li>`;
}

/* ------------------------------------------------------------------ */
/* Painting                                                            */
/* ------------------------------------------------------------------ */

const scene = () => {
  const k = play.p.kind;
  if (k === 'tube') return tubeSvg();
  if (k === 'lanes' || k === 'hills') return hillsSvg();
  return jumpSvg();
};

function paintBoard() {
  const L = L0();
  const n = play.right.length;
  const actions = play.done ? '' : `<div class="cz-sci-actions">
      <button type="button" class="gp-btn gp-btn--primary gp-btn--big cz-sci-go" data-action="sl-go">${esc(st('go', L))}</button>
      ${!play.ctx.puzzle.teach && !play.hint ? `<button type="button" class="gp-btn gp-btn--ghost" data-action="sl-hint"><span aria-hidden="true">💡</span> ${esc(t('hint'))}</button>` : ''}
    </div>`;
  const hintKey = { tube: 'hintTube', lanes: 'hintHill', hills: 'hintHill', jump: 'hintJump', ledge: 'hintJump', start: 'hintJump' }[play.p.kind];
  play.host.innerHTML = `<div class="cz-sl" lang="${L}">
    <p class="cz-sci-ask">${esc(askText(L))}</p>
    <p class="cz-sci-help">${esc(st('help', L))}${['jump', 'ledge', 'start'].includes(play.p.kind) ? ` ${esc(st('speedTable', L))}` : ''}</p>
    <div class="cz-sl-scene${play.p.kind === 'tube' ? ' is-top' : ''}">${scene()}</div>
    <ol class="cz-sci-cards${n === 1 ? ' is-one' : ''}">${Array.from({ length: n }, (_, k) => card(k, L)).join('')}</ol>
    ${play.hint ? `<p class="cz-sci-hint"><span aria-hidden="true">💡</span> ${esc(st(hintKey, L))}</p>` : ''}
    ${actions}
    <div class="cz-sci-msg" aria-live="polite">${play.msg ? play.msg(L) : ''}</div>
  </div>`;
  paint();
}

/* ------------------------------------------------------------------ */
/* Sliding                                                             */
/* ------------------------------------------------------------------ */

function go() {
  if (play.done) return;
  if (play.picks.some((v) => v === null)) {
    play.msg = (L) => `<p class="cz-sci-say">${esc(st('pickAll', L))}</p>`;
    paintBoard();
    return;
  }
  play.msg = null;
  const p = play.p;
  const svgPeng = () => [...play.host.querySelectorAll('[data-sl-peng]')];
  const move = (el, [x, y], lift = 0) => { el.setAttribute('x', x); el.setAttribute('y', y - lift); };

  if (p.kind === 'tube') {
    const pts = tubePoints(p, true).map(([x, y]) => [cx(x), cx(y)]);
    const f = along(pts);
    const el = svgPeng()[0];
    animate(pts.length * 0.5, 120, (tk) => move(el, f(tk / (pts.length * 0.5))), done);
    return;
  }
  if (p.kind === 'lanes' || p.kind === 'hills') {
    const els = svgPeng();
    const fs = play.paths.map((path) => along(path));
    animate(30, 70, (tk) => els.forEach((el, i) => move(el, fs[i](tk / 30), 10)), done);
    return;
  }
  /* A jump: slide down the shelf to the lip, then fly in whole ticks. */
  const pick = p.kind === 'start' ? p.opts[play.picks[0]] : p.dh;
  const H = p.kind === 'ledge' ? p.opts[play.right[0]] : p.H;
  const g = play.jumpGeo;
  const shelf = g.shelves.find((s) => s.dh === pick) || g.shelves[0];
  const el = svgPeng()[0];
  const slideTo = p.hill && !S.clears(pick, p.hill) ? [[shelf.x0 + 12, shelf.y], [shelf.x0 + 24, shelf.y], [(g.lipX - 40 + 60) / 2 - 8, g.lipY]]
    : [[shelf.x0 + 12, shelf.y], [shelf.x0 + 24, shelf.y], [g.lipX - 40, g.lipY], [g.lipX, g.lipY]];
  const slide = along(slideTo);
  const v = 2 * Math.sqrt(pick);
  const n = Math.sqrt(H);
  const flies = !(p.hill && !S.clears(pick, p.hill));
  animate(10 + (flies ? n * 6 : 0), 60, (tk) => {
    if (tk <= 10) { move(el, slide(tk / 10), 10); return; }
    const s = (tk - 10) / 6;
    move(el, [g.X(v * s), g.lipY + s * s * g.rowPx], 10);
  }, done);
}

function done() {
  play.ran = true;
  const wrong = play.picks.filter((v, k) => v !== play.right[k]).length;
  play.wrong = wrong;
  if (wrong) { play.ctx.surprise(wrong); react('wow', 1600); } else react('happy', 1800);
  play.done = true;
  paintBoard();
  const chId = play.ctx.chapterId;
  play.ctx.onSolved({
    stars: S.starsFor({ wrong: play.wrong, hints: play.hints, teach: !!play.ctx.puzzle.teach }),
    why: (L) => {
      const lines = play.right.map((_, k) => {
        const ok = play.picks[k] === play.right[k];
        return `${ok ? '' : '<span aria-hidden="true">🤯</span> '}<strong>${esc(ok ? st('right', L, { res: resultText(k, L) }) : st('surprise', L, { res: resultText(k, L) }))}</strong> ${esc(whyText(k, L))}`;
      });
      const idea = IDEAS.slide.find((i) => i.ch === chId);
      if (idea) lines.push(`<strong>${esc(idea[L])}</strong> ${esc(idea.why[L])}`);
      return lines;
    }
  });
}

/* ------------------------------------------------------------------ */
/* Clicks, keys, reading aloud                                         */
/* ------------------------------------------------------------------ */

function click(ev) {
  if (!play) return false;
  const q = ev.target.closest('[data-sl-q]');
  if (q && !play.done) {
    const k = Number(q.dataset.slQ);
    const raw = q.dataset.slV;
    const v = /^\d+$/.test(raw) ? Number(raw) : raw;
    play.picks[k] = play.picks[k] === v ? null : v;
    play.msg = null;
    paintBoard();
    const el = play.host.querySelector(`[data-sl-q="${k}"][data-sl-v="${v}"]`);
    if (el) el.focus();
    return true;
  }
  const action = ev.target.closest('[data-action]');
  if (!action) return false;
  if (action.dataset.action === 'sl-go') { go(); return true; }
  if (action.dataset.action === 'sl-hint' && !play.hint && !play.done) {
    play.hint = 1;
    play.hints = 1;
    paintBoard();
    return true;
  }
  return false;
}

const key = () => false;

function readAloud() {
  if (!play) return;
  const L = lang();
  const parts = [askText(L), st('help', L)];
  play.right.forEach((_, k) => { if (questionName(k, L)) parts.push(questionName(k, L)); });
  say(parts);
}

const repaint = () => { if (play) paintBoard(); };
const leave = () => stopMotion();

/* ------------------------------------------------------------------ */
/* Today's experiment                                                  */
/* ------------------------------------------------------------------ */

function dailyPuzzle(level, iso) {
  const list = S.CHAPTERS[level];
  const def = list[hash('slide-daily', level, iso) % list.length];
  const p = S.makePuzzle(S.chapter(def.id), rngFor('slide', 'daily', level, iso), S.TEACH + 8);
  return p && !S.problems(p).length ? { puzzle: { id: `daily-${iso}`, ...p }, chapterId: def.id } : null;
}

export default {
  id: 'slide', bank, chapters, levelOfChapter, tileLabel, draw, repaint, click, key,
  say: readAloud, dailyPuzzle, leave
};
