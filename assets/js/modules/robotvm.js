/**
 * robotvm.js — the zookeeper robot: its world and the program runner.
 *
 * A level is a small grid. Path cells can be walked on; everything else is
 * scenery (a tree, a rock, a pond). Some cells hold a hungry animal. The
 * child writes a program; the robot runs it; the level is done the moment
 * the last animal is fed. The research is docs/research/logic/research-robot.md.
 *
 * Commands
 *   U R D L        Easy: move one square up / right / down / left on the
 *                  screen (the robot turns to face that way first). No
 *                  left-right confusion for a six-year-old.
 *   F TL TR        Medium and up: forward, turn left, turn right, as the
 *                  robot sees it.
 *   FEED           feed the animal on this square
 *   rep n [...]    do the inside n times
 *   call h1 | h2   run a helper row
 *   if c [...] [...]   c: ahead (path ahead), left, right, animal (on one)
 *   until [...]    do the inside until every animal is fed
 * Any simple command can carry a colour `c` ('o' orange stripes, 'b' blue
 * dots): it only runs when the robot stands on that colour.
 *
 * Programs are plain objects, run by this interpreter: no eval, so the
 * site's Content-Security-Policy stays strict. Every run is bounded (400
 * moves, 3,000 steps, 16 helpers deep) and every failure says why.
 *
 * Pure: no DOM, no Math.random.
 */

export const DX = [0, 1, 0, -1];
export const DY = [-1, 0, 1, 0];
export const ABS = { U: 0, R: 1, D: 2, L: 3 };
export const LIMITS = { moves: 400, steps: 3000, depth: 16 };

/* ------------------------------------------------------------------ */
/* The board                                                           */
/* ------------------------------------------------------------------ */

/**
 * A level's board: { w, h, cells: rows of '.', '#', 'o', 'b' joined by '/',
 * animals: [[x, y, kind]], start: [x, y, dir] }.
 */
export function board(level) {
  const rows = level.cells.split('/');
  const at = (x, y) => (y >= 0 && y < rows.length && x >= 0 && x < rows[0].length ? rows[y][x] : '#');
  return {
    w: rows[0].length, h: rows.length, rows,
    open: (x, y) => at(x, y) !== '#',
    colour: (x, y) => (at(x, y) === 'o' || at(x, y) === 'b' ? at(x, y) : null),
    animals: level.animals.map(([x, y, kind]) => ({ x, y, kind }))
  };
}

/* ------------------------------------------------------------------ */
/* Size                                                                */
/* ------------------------------------------------------------------ */

/** Tiles in a list: one per command, one per bracket plus what is inside. */
export function sizeOf(list) {
  return (list || []).reduce((s, c) => s + 1
    + (c.body ? sizeOf(c.body) : 0) + (c.then ? sizeOf(c.then) : 0) + (c.else ? sizeOf(c.else) : 0), 0);
}

export const ROWS = ['main', 'h1', 'h2'];
export const programSize = (prog) => ROWS.reduce((s, r) => s + sizeOf(prog[r]), 0);

/* ------------------------------------------------------------------ */
/* Running                                                             */
/* ------------------------------------------------------------------ */

class Stop { constructor(kind, at) { this.kind = kind; this.at = at; } }

/**
 * Run a program on a level. Returns
 *   { ok, why, events, fed, steps }
 * `why` is null on success, else one of: bump, nothing, unfed, tired, deep.
 * `events` is the trace: { k, x, y, dir, at, loop? } where `at` is the path
 * to the tile that caused it (['main', 2, 'body', 0]), used to light up the
 * tile while it runs, to mark a bug, and to step back.
 */
export function run(level, prog, { limits = LIMITS } = {}) {
  const B = board(level);
  let [x, y, dir] = level.start;
  const hungry = new Set(B.animals.map((a, i) => i));
  const animalAt = (px, py) => B.animals.findIndex((a, i) => a.x === px && a.y === py && hungry.has(i));
  const events = [];
  let moves = 0;
  let steps = 0;
  const emit = (k, at, extra = {}) => events.push({ k, x, y, dir, at, ...extra });

  const test = (cond) => {
    switch (cond) {
      case 'ahead': return B.open(x + DX[dir], y + DY[dir]);
      case 'left': { const d = (dir + 3) % 4; return B.open(x + DX[d], y + DY[d]); }
      case 'right': { const d = (dir + 1) % 4; return B.open(x + DX[d], y + DY[d]); }
      case 'animal': return animalAt(x, y) >= 0;
      default: return false;
    }
  };

  const step = (at) => {
    steps += 1;
    if (steps > limits.steps) throw new Stop('tired', at);
  };

  const forward = (at) => {
    moves += 1;
    if (moves > limits.moves) throw new Stop('tired', at);
    const nx = x + DX[dir];
    const ny = y + DY[dir];
    if (!B.open(nx, ny)) { emit('bump', at); throw new Stop('bump', at); }
    x = nx;
    y = ny;
    emit('move', at);
  };

  const exec = (list, path, depth) => {
    for (let i = 0; i < list.length; i++) {
      const c = list[i];
      const at = [...path, i];
      step(at);
      if (c.c && B.colour(x, y) !== c.c) { emit('skip', at); continue; }
      switch (c.op) {
        case 'U': case 'R': case 'D': case 'L':
          dir = ABS[c.op];
          forward(at);
          break;
        case 'F': forward(at); break;
        case 'TL': dir = (dir + 3) % 4; emit('turn', at); break;
        case 'TR': dir = (dir + 1) % 4; emit('turn', at); break;
        case 'FEED': {
          const a = animalAt(x, y);
          if (a < 0) { emit('nothing', at); throw new Stop('nothing', at); }
          hungry.delete(a);
          emit('feed', at, { animal: a });
          if (!hungry.size) throw new Stop('done', at);
          break;
        }
        case 'rep':
          for (let n = 0; n < c.n; n++) {
            emit('loop', at, { loop: [n + 1, c.n] });
            exec(c.body, [...at, 'body'], depth);
          }
          break;
        case 'call':
          if (depth + 1 > limits.depth) throw new Stop('deep', at);
          emit('call', at);
          exec(prog[c.p] || [], [c.p], depth + 1);
          break;
        case 'if':
          if (test(c.cond)) exec(c.then, [...at, 'then'], depth);
          else exec(c.else || [], [...at, 'else'], depth);
          break;
        case 'until':
          while (hungry.size) {
            step(at);
            emit('loop', at);
            exec(c.body, [...at, 'body'], depth);
          }
          break;
        default: throw new Error(`no command ${c.op}`);
      }
    }
  };

  let why = null;
  let at = null;
  try {
    exec(prog.main || [], ['main'], 0);
    if (hungry.size) why = 'unfed';
  } catch (e) {
    if (!(e instanceof Stop)) throw e;
    if (e.kind !== 'done') { why = e.kind; at = e.at; }
  }
  return { ok: why === null, why, at, events, fed: B.animals.length - hungry.size, steps };
}

/* ------------------------------------------------------------------ */
/* The shortest plain program (no loops, no helpers)                   */
/* ------------------------------------------------------------------ */

/**
 * How many tiles the shortest program with no loops or helpers needs: a
 * breadth-first search over (square, facing, animals fed). If a level's
 * slot limit is smaller than this, a loop or a helper is not a nicety; it
 * is the only way to fit.
 */
export function flatLength(level, abs) {
  const B = board(level);
  const n = B.animals.length;
  const full = (1 << n) - 1;
  const key = (x, y, d, m) => `${x},${y},${d},${m}`;
  const [sx, sy, sd] = level.start;
  const start = [sx, sy, abs ? 0 : sd, 0];
  const seen = new Set([key(...start)]);
  let frontier = [start];
  for (let depth = 0; depth < 200 && frontier.length; depth++) {
    const next = [];
    for (const [x, y, d, m] of frontier) {
      const moves = [];
      const a = B.animals.findIndex((q, i) => q.x === x && q.y === y && !(m & (1 << i)));
      if (a >= 0) {
        const m2 = m | (1 << a);
        if (m2 === full) return depth + 1;
        moves.push([x, y, d, m2]);
      }
      if (abs) {
        for (let k = 0; k < 4; k++) if (B.open(x + DX[k], y + DY[k])) moves.push([x + DX[k], y + DY[k], 0, m]);
      } else {
        if (B.open(x + DX[d], y + DY[d])) moves.push([x + DX[d], y + DY[d], d, m]);
        moves.push([x, y, (d + 1) % 4, m], [x, y, (d + 3) % 4, m]);
      }
      for (const s of moves) {
        const k = key(...s);
        if (!seen.has(k)) { seen.add(k); next.push(s); }
      }
    }
    frontier = next;
  }
  return Infinity;
}

/* ------------------------------------------------------------------ */
/* Programs as data                                                    */
/* ------------------------------------------------------------------ */

/** The list a path points into, and the index in it: ['main', 2, 'body'] -> list. */
export function listAt(prog, path) {
  let list = prog[path[0]];
  for (let i = 1; i < path.length; i += 2) list = list[path[i]][path[i + 1]];
  return list;
}

/** The command a path points at. */
export function tileAt(prog, path) {
  const list = listAt(prog, path.slice(0, -1));
  return list ? list[path[path.length - 1]] : null;
}

export const clone = (prog) => JSON.parse(JSON.stringify(prog));

/** Every simple command in reading order, with its path. */
export function flatten(prog) {
  const out = [];
  const walk = (list, path) => list.forEach((c, i) => {
    const at = [...path, i];
    out.push({ c, at });
    if (c.body) walk(c.body, [...at, 'body']);
    if (c.then) walk(c.then, [...at, 'then']);
    if (c.else) walk(c.else, [...at, 'else']);
  });
  for (const r of ROWS) if (prog[r]) walk(prog[r], [r]);
  return out;
}

export default { DX, DY, ABS, LIMITS, board, sizeOf, ROWS, programSize, run, flatLength, listAt, tileAt, clone, flatten };
