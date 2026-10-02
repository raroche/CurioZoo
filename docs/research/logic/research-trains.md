# Train Tracks: design research

A logic game for curiozoo.com. The zoo railway has a few trains, each carrying one animal, and the child sets the track switches so every animal reaches its own enclosure. This note covers prior art, the mechanics ladder, how puzzles are generated and checked, the hint engine, rendering, data, modules and tests.

Status: research and design only. Nothing here is built yet.

---

## 1. Prior art

### 1.1 Bebras tasks (CC BY-SA 4.0)

Bebras tasks are published under "Creative Commons Attribution-ShareAlike 4.0 International", as the task template states ([bebras.it template](https://bebras.it/btw_bs2017/2017-XY-01-eng.html)). Four railway tasks map straight onto this game:

- **"Railroad" (Bebras 2018, ages 14–16).** Eight trains enter a binary tree of seven switches, X1 to X7. Every switch starts pointing left and **flips after each train passes**. The question is which order to send trains *a* to *h* in so each reaches its own station. The answer is `aecgbfdh`. The official explanation reads each train's path as a 3-bit binary number. X1 gives the *high* bit of the station number but changes fastest, so the arrival order is bit-reversed counting ([Bebras Australia 2018 guide, p. 45](https://www.amt.edu.au/wp-content/uploads/2024/02/Bebras-2018-Solution-Guide.pdf)). This is the Hard chapter's main idea.
- **"Freight Train" (Bebras 2014).** Wagons D-E-B-C-A must be put back into the order A-B-C-D-E using two side tracks, counting each couple or uncouple as one operation. The answer is 8, and the task's explanation names the side tracks as **stacks**: push and pop, last in first out ([Bebras Australia 2014 guide, p. 27](https://www.amt.edu.au/wp-content/uploads/2024/02/2014-Bebras-Solution-Guide.pdf)).
- **"Train Tracks" (Portugal, Bebras 2021, Years 3–6).** The child drops two missing track pieces so a train reaches its station. The explanation compares track pieces to program instructions and asks the child to anticipate what the train will do ([Bebras Australia 2021 R1 guide, p. 16](https://www.amt.edu.au/wp-content/uploads/2024/02/Bebras-Solutions-Guide-2021-R1-Primary-1.pdf)).
- **"Switch On" (Bebras 2019, Years 5–6).** This one has no trains, but its explanation argues that pressing a toggle twice does nothing and that order doesn't matter, so only the 2^7 = 128 subsets need checking ([Bebras Australia 2019 guide](https://www.amt.edu.au/wp-content/uploads/2024/02/Bebras-Australia-2019-Solutions-Guide.pdf)). The verifier below uses the same argument, and so can the "why" screen.

**Licensing rule:** borrow mechanics only. Ideas such as "switches that flip" or "sidings are stacks" are not copyrightable. If we ever reproduce a task's wording or diagram, that content has to be CC BY-SA, attributed, and listed in `CREDITS.md`. All of our puzzles are generated, so none of them derive from Bebras text.

### 1.2 Classic shunting puzzles (public domain or rules only)

- [Wikipedia: train shunting puzzle](https://en.wikipedia.org/wiki/Train_shunting_puzzle) sorts these puzzles into families: building or splitting a train, letting trains pass on a single line, and turning a locomotive. Sam Loyd's *Primitive Railroading* (Cyclopedia, 1914, now public domain: [archive.org](https://archive.org/details/CyclopediaOfPuzzlesLoyd)) has two trains pass each other using a spur that holds one car. [Futility Closet](https://www.futilitycloset.com/2025/08/14/after-you-5/) says Loyd's solution takes 33 moves, which is far too long for children.
- **Inglenook Sidings** (Alan Wright, 1979) uses three sidings holding 3, 3 and 5 wagons and a 3-wagon headshunt; the goal is to build a 5-wagon train in a random order. Blackburn proves when such puzzles are solvable and shows that some starting positions need about w²/2 moves. He also traces the family to Loyd and to Dudeney's *Mudville Railway Muddle*, and connects it to Knuth's stack sorting ([arXiv 1810.07970](https://arxiv.org/abs/1810.07970)).
- **Timesaver** (John Allen, *Model Railroader*, 1972) has five switches, a runaround loop, and is scored on time ([Wikipedia](https://en.wikipedia.org/wiki/Timesaver)). Time pressure breaks our rules.

**Takeaway:** full shunting, where the engine reverses and couples wagons, is too fiddly to control on a touch screen for ages 6–10. One siding used as a stack gives the same idea with three buttons.

### 1.3 Theory: stacks, toggles and computation

- **Knuth's railway stack.** In TAOCP Vol. 1, Knuth described sorting as moving railway cars through a dead-end siding. A sequence can be sorted with one siding **exactly when it avoids the pattern 231**, and there are a Catalan number of such orders: 14, 42, 132 and 429 for 4 to 7 cars. A greedy rule always finds the sort ([Wikipedia: stack-sortable permutation](https://en.wikipedia.org/wiki/Stack-sortable_permutation)). This gives free generation, free verification and a ready-made hint rule.
- **ARRIVAL.** Dohrau, Gärtner, Kohler, Matoušek and Welzl studied a train on a network where *every switch flips after each traversal*. Whether the train ever arrives is in NP ∩ coNP, and no fast algorithm is known ([arXiv 1605.03546](https://arxiv.org/abs/1605.03546); later shown to be in CLS: [arXiv 1802.07702](https://arxiv.org/pdf/1802.07702)). The mechanic is simple to state but deep. With loops it can be very hard, so small Hard boards should be kept loop-free or have only short loops.
- **Digi-Comp II** (1965) is a marble computer. Its cams act as flip-flops, toggling as each ball passes and routing the next ball the other way ([Wikipedia](https://en.wikipedia.org/wiki/Digi-Comp_II)). Aaronson separates **toggles**, which flip, from **switches**, which are set and stay put. He shows that the machine can count, add and multiply, but is not universal ([Shtetl-Optimized](https://scottaaronson.blog/?p=1902)). We use the same split: *levers* (child-set, fixed) and *flip-points* (toggle per train).
- **Turing Tumble** (ages 8+) has 60 puzzles that grow from simple to college level. Its parts are ramps, crossovers, bits (2-state flip-flops), gear bits and interceptors ([Upper Story](https://store.upperstory.com/products/turing-tumble)). It shows that bits plus crossovers can carry a long, gradual campaign.
- **Pascal's Marble Run** ([Karl Sims](http://www.karlsims.com/marbles/)) uses a triangle of alternating switches, and they spread marbles in exactly binomial proportions. This is a good "why" story for flip-points: they take turns.
- **Train-track computers.** Chalcraft and Greene (1994) built a Turing machine from track with two point types. **Lazy points** remember which branch a train last *trailed* in from and send the next facing train that way. **Sprung points** always send facing trains one way ([esolangs](https://esolangs.org/wiki/Chalcraft-Green_train_track_automaton); [I Programmer](https://www.i-programmer.info/news/112-theory/12067-computing-with-trains-turings-trains.html); Guy Walker's layouts for counters, adders and gates: [cr31 mirror](https://www.boristhebrave.com/permanent/24/06/cr31/stagecast/trains/tt0_intro.html)). Lazy points are memory: one train writes a value and the next train reads it. That is a strong optional Hard mechanic.

### 1.4 Commercial games (inspiration only; no levels or art taken)

- **Trainyard** (Matt Rix, 2010) has the player draw track so colored trains reach matching stations. It adds color mixing, splitting and repainting ([Pocket Gamer](https://www.pocketgamer.com/trainyard/review/)). Rix made about 300 levels himself, and players shared more than 100,000 ([Game Developer](https://gamedeveloper.com/business/we-ask-indies-matt-rix-creator-of-trainyard-and-disco-zoo)). The lessons are that the run is the payoff, and that a level editor greatly extends a game's life. Color mixing is color-only, which fails our accessibility rule, so we don't use it.
- **Railbound** (Afterburn, 2022, Apple Design Award) has 150+ levels. Players lay track so numbered cars join an engine *in order*, and each world adds a mechanic such as tunnels, gates or switches ([Wikipedia](https://en.wikipedia.org/wiki/Railbound)). Lessons: add one new mechanic per chapter, and use an arrival-order goal.
- **Train Valley** uses colored trains, colored stations and levers, but timing matters and crashes are possible ([BlitWorks](https://blitworks.com/game/train-valley/)). We don't use the real-time part.
- **Simon Tatham's "Tracks"** is a different puzzle: draw one A-to-B track that matches row and column counts ([chiark](https://www.chiark.greenend.org.uk/~sgtatham/puzzles/js/tracks.html)). It is a good *future* zoo puzzle, but it isn't about switches.

---

## 2. Core model

The rest of this note uses a small set of terms:

- The board is a set of horizontal **lanes** (rows). Trains always move left to right, so the graph is a DAG and the drawing is a clean grid.
- A **crossover** in column *c* joins lane *i* to lane *i±1*. On its source lane it is a **facing switch** with two states: `0` = straight, `1` = take the branch. On its target lane it is a **trailing merge**: trains coming the other way always pass, like sprung points.
- Each lane ends at one **station**, the animal's enclosure. Each train starts at a **depot** on the left.
- **Switch kinds:**
  - `lever`: the child sets it and it stays put.
  - `flip`: it toggles after each facing train passes (Digi-Comp, ARRIVAL, Bebras 2018).
  - `lazy` (optional): a trailing train sets it.
- Trains run **one at a time, in queue order**, so nothing collides and nothing depends on timing or reflexes.

---

## 3. Mechanics ladder: candidates and choices

| Candidate | Logic depth | Fun | Verdict |
|---|---|---|---|
| Predict where a train ends up (switches already set) | Tracing, conditionals | Medium; immediate payoff | **Yes**: Easy warm-up |
| One train, set levers | Path finding backwards from the goal | High for ages 6–7 | **Yes** |
| Several trains, *one* setting for all | Constraint satisfaction, shared resources | High: switches serve more than one train | **Yes**: the core puzzle |
| Fixed queue, levers may change between trains; score is fewest lever pulls | Planning, optimization | Medium-high | **Yes** (Medium) |
| Child picks the departure order as well | Search over orders, like TSP-lite | Medium; gets heavy fast | Fold in as a Medium bonus |
| Flip-points: set the starting positions | State machine, parity | High: an "aha" moment | **Yes** (Hard) |
| Flip-points: choose the queue order (Bebras 2018) | Simulation, binary counting | High | **Yes** (Hard) |
| One siding used as a stack to reorder the animals | LIFO, 231 pattern | High: a different gesture | **Yes** (Hard) |
| Mixed machine: levers, flip-points and lazy points, with short loops | Counters, memory | High for ages 11–13 | **Yes**: Hard finale |
| Real-time dispatch (Train Valley) | Reflexes | High | **No**: timer pressure |
| Color mixing (Trainyard) | Medium | High | **No**: color-only signal |
| Full Inglenook/Timesaver shunting | Deep | Low on touch for kids | Only as the siding-stack version |

### The 10 chapters

| # | Level | Chapter (EN / ES) | Mechanic | Size |
|---|---|---|---|---|
| E1 | Easy | Follow the Track / Sigue la vía | Tap the station the train will reach | 3 lanes, 1–3 levers |
| E2 | Easy | Set the Switches / Mueve los cambios | One train, set levers, GO | 3–4 lanes, 2–4 levers |
| E3 | Easy | Two Trains, One Plan / Dos trenes, un plan | 2 trains, one setting | 3–4 lanes, 2–5 levers |
| M1 | Medium | Busy Railway / Vía ocupada | 3–4 trains, one setting; decoy branches | 4–5 lanes, 4–8 levers |
| M2 | Medium | Fewest Pulls / Menos palancas | Fixed queue; levers may change between trains; par = minimum pulls | 4–5 lanes |
| M3 | Medium | Flip Warm-up / Cambios que giran | Predict and set with 1–3 flip-points | 3 lanes |
| H1 | Hard | Flip-Flop Yard / Patio de vaivén | Set the starting positions of flip-points for a 3–4 train queue | 3–4 lanes, 4–7 flips |
| H2 | Hard | Line Them Up / En fila | Choose the queue order through a flip-point tree (Bebras 2018 style) | 4–8 stations |
| H3 | Hard | The Siding / La vía muerta | Reorder cars with a stack siding; target arrival order | 4–7 cars |
| H4 | Hard | Zoo Machine / La máquina del zoo | Levers, flip-points and lazy points, counters, one short loop | 4–5 lanes |

Each chapter opens with 3 hand-made teaching puzzles that introduce its one new idea. Generated puzzles follow, ordered by difficulty score.

---

## 4. Generation and verification

### 4.1 Generator: lane grid

```js
function randomLayout(R, C, density, rand) {
  const cols = [];
  for (let c = 0; c < C; c++) {
    const used = new Set(), xs = [];
    for (let i = 0; i < R - 1; i++)
      if (rand() < density && !used.has(i) && !used.has(i + 1)) {
        const up = rand() < 0.5;
        xs.push({ col: c, src: up ? i + 1 : i, dst: up ? i : i + 1, kind: 'lever' });
        used.add(i); used.add(i + 1);           // one crossover per lane pair per column
      }
    cols.push(xs);
  }
  return { R, C, cols, sw: cols.flat().map((x, id) => Object.assign(x, { id })) };
}

// Simulate one train. flip=true toggles each facing flip-point it uses.
function run(lay, lane, state, faced) {
  for (const xs of lay.cols) for (const x of xs) if (x.src === lane) {
    faced?.add(x.id);
    const go = state[x.id];
    if (x.kind === 'flip') state[x.id] ^= 1;
    if (go) lane = x.dst;
    break;
  }
  return lane;                                   // index of the station reached
}
```

**Make the puzzle solvable by construction.** Pick a hidden setting, simulate the queue, and use the stations the trains reach as their targets.

**Check uniqueness by brute force.** At most 10 switches gives 1,024 states, and each costs one simulation of ≤ 4 trains, which takes microseconds.

```js
function solve(lay, trains) {                    // lever and flip puzzles: initial states
  const sols = new Map();
  for (let m = 0; m < 1 << lay.sw.length; m++) {
    const init = lay.sw.map((_, i) => (m >> i) & 1), st = init.slice(), faced = new Set();
    if (trains.every(t => run(lay, t.from, st, faced) === t.to))
      sols.set(key(init, faced), { init, faced });   // states only of switches that were actually used
  }
  return [...sols.values()];
}
// keep the puzzle iff solve() returns exactly 1 class AND every switch was used by some train;
// otherwise turn unused crossovers into plain track and solve again.
```

Two settings that differ only on switches no train touches count as the same solution. Unused switches are removed, so the child never sees a switch that doesn't matter. Distractors come from *used-but-misleading* branches instead.

**Mode-specific solvers:**

- **M2 (fewest pulls).** Each train needs a value for each switch it faces. For each switch, look at the required values in queue order, skipping trains that don't care. The minimum number of pulls is the starting mismatch plus the number of changes in that list. Switches are independent of each other, so this is exact in O(s·k). If the child also chooses the order, try all k! orders (k ≤ 5, so at most 120).
- **H2 (choose the order).** In a flip-point tree, *which* station the n-th train reaches doesn't depend on which animal it carries. Simulate the empty queue once to get the station sequence; the animal in slot n is the one whose home is station n. The answer is always unique, and the hint is "simulate".
- **H3 (siding stack).** Generate a random balanced push/pop sequence, which is a Dyck word; the resulting order is always sortable. Solve with Knuth's greedy rule: if the needed car is on top of the siding, pop it; otherwise push the next incoming car. That move sequence is unique. A two-siding variant needs a breadth-first search over states of the form (queue index, siding A, siding B, output length), which stays below 10⁴ states for 7 cars.
- **H4 (loops and lazy points).** Simulate with a step cap and keep a set of visited (position, switch states) pairs; a repeat means the train loops forever, so the puzzle is rejected. Levers are searched by brute force (≤ 2⁶) and flip and lazy states come from the simulation.

### 4.2 Difficulty score

```
score = 1.0*switchesUsed + 1.5*trains + 2.0*sharedSwitches   // switches faced by ≥ 2 trains
      + 3.0*deductionRounds + 6.0*needsCaseSplit                // from the hint engine (§5)
      + 1.5*maxFacesPerFlip   + 1.0*decoyBranches                // flip/H-modes
      + (H3) 1.0*cars + 2.0*maxSidingDepth
```

Each chapter is sorted by score and split into bands; the first band is unlocked first. A chapter's par and star rules depend on its mechanic, not on the score.

### 4.3 Pool sizes: measured

A prototype of the generator above, sampling 200,000–300,000 random layouts per row, counted **structurally distinct** puzzles with a unique solution in which every switch matters. These are lower bounds: sampling hadn't saturated, mirror twins are included, and no animal reskins are counted.

| Configuration | Unique valid puzzles |
|---|---|
| E2: 1 train, 3–4 lanes, 3–5 columns | 76 + 297 + 126 = **≈500** |
| E3: 2 trains, one setting, 3–4 lanes | 1,924 + 2,729 = **≈4,600** |
| M1: 3 trains, 4 lanes × 5 columns | **6,002** |
| M1+: 4 trains, 5 lanes × 6 columns | **758** (unsaturated) |
| M3: flip-points, 2 trains, 3 lanes | **791** |
| H1: flip-points, 3 trains, 3 lanes × 5 columns | **4,373** |
| H1+: flip-points, 4 trains, 4 lanes × 6 columns | **931** (unsaturated) |
| H3: one siding, 4–7 cars | 14 + 42 + 132 + 429 = **617** orders (more with siding capacity and two-siding variants) |

The pools also grow along independent axes: starting lever positions, which change the M2 par (×2^s), the animal and station assignment (×P(12, R)), and the E1 predict-mode reuse of every layout. **Every level clears the "hundreds" rule several times over.** The recommendation is to ship a curated bank of about 300–400 puzzles per chapter (about 3,000 total). Combined with the daily puzzle, that is weeks of play.

---

## 5. Hint engine and the "why" screen

The engine works over **routes**. For each train it lists every depot-to-station path, which is small in a DAG. Each route is a partial assignment of switch values. It then runs constraint propagation in the same order a child would reason:

1. **Only one way.** If a train has a single route left, every switch on it is forced.
   - EN: *"This switch must point down: it's the only way the 🐘 train can reach the Elephant House."*
   - ES: *"Este cambio debe apuntar abajo: es el único camino del tren del 🐘 a la casa de los elefantes."*
2. **Every way agrees.** If all of a train's remaining routes set switch *x* the same way, *x* is forced.
   - EN: *"Every road to the Lion Den turns here."*
3. **Conflict.** Remove a route if it sets *x* = v while some other train's routes all need *x* = ¬v.
   - EN: *"If the 🦒 went over the top, this switch would send the 🦁 the wrong way."*
4. **Case split.** If propagation stalls, try *x* = 0, propagate, and show the contradiction.
   - EN: *"Try pointing this switch up... then the 🐧 gets stuck. So it must point down."*
   - Needing this step marks a puzzle as Medium+.
5. **Fallback.** Reveal one switch of the solution, highlighting it and its lever.

Each hint shows **one** step. The switch is highlighted with a pulsing ring outline and the route is shown with a dashed line, so the hint never relies on color. Then the child acts.

**Hints for the other modes:**

- **Flip-points.** The engine simulates with the child's current settings and finds the first train that goes wrong, then names the flip-point and how many trains have already crossed it: *"Two trains used this switch before the 🐼, so it has flipped twice and is back where it started."* That is a parity lesson.
- **Siding.** Knuth's greedy rule gives the hint directly: *"The 🦓 must leave next and it's on top of the siding: bring it out."* After a wrong push, the hint names the 231 trap: *"The 🦛 is now stuck under the 🐒. Undo."*

**"Why" after solving.** The propagation log is replayed as 2–4 short sentences. Flip puzzles also get a Bebras-2018-style table of train number against switch positions, which shows binary counting in action.

---

## 6. Rendering and interaction

- **SVG drawn in code.** Each cell is 100 user units, and lane *y* = 60 + 100·i.
  - Plain track is a straight path.
  - A crossover is a cubic Bézier: `M x,yi C x+50,yi x+50,yj x+100,yj`.
  - Sleepers are short perpendicular ticks with a `stroke-dasharray` on a parallel path.
  - The `viewBox` scales the board. On a narrow portrait screen (375px), **transpose** it so trains run top to bottom and switches stay ≥ 44 px targets.
  - Everything is set through `setAttribute` and classes, with no `style=""`, as the CSP requires.
- **Switch states never rely on color alone.** Each switch shows its state four ways:
  - a lever handle tilted toward the chosen branch;
  - a chevron arrow on the live branch;
  - the dead branch drawn thinner, dashed, and with a visible gap at the blade;
  - an `aria-label`, e.g. "Switch 3, sending trains down / Cambio 3, envía los trenes abajo".

  Each switch kind also has its own shape:
  - flip-points: a round turntable with a ↻ glyph;
  - lazy points: a small memory flag;
  - merges: no handle.
- **Animals and stations.** Each animal has three matching marks: an SVG silhouette (elephant, lion, giraffe, penguin, panda, zebra, hippo, monkey, …), a **shape badge** (circle, square, triangle, diamond, star, hexagon) and a palette color. The station gate repeats the silhouette and badge, so a train and its station match on all three.
- **Animation.**
  - One `<path>` per train route, made by joining its segments.
  - A `requestAnimationFrame` loop moves the train with `getPointAtLength` / `getTotalLength`, which have been Baseline since 2020 ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/SVGGeometryElement/getPointAtLength)).
  - The heading comes from two nearby points and is applied with `transform="translate() rotate()"`.
  - Trains run one after another, with a ×2 fast-forward.
  - Flip-points visibly snap over as a train leaves them.
- **Reduced motion.** Under `prefers-reduced-motion`, nothing moves:
  - each train's route is drawn as a thick dashed overlay with numbered dots, one train per **Next** tap;
  - the engine appears at the station with a ✓ or ✗ *shape* badge;
  - flip-points change state with no tween.
- **Input.**
  - Tap a switch to toggle it.
  - **GO / ¡VAMOS!** runs the trains.
  - **Reset** returns levers to the start.
  - Keyboard: switches are focusable `<g role="button" tabindex="0">` elements, ordered by column and then lane. Arrow keys move between them, Space/Enter toggles, and `G` runs.
  - An `aria-live` line reports each arrival: "Train 2: 🦁 reached the Lion Den (2 of 3)".
- **Wrong runs are gentle.** The train stops at the wrong gate and the switch that sent it there gets a "?" marker. No buzzer, no red flash, no lives.

---

## 7. Stars, progression, engagement

- **Stars only go up; the best result is kept.**
  - ★ for solving.
  - ★★ for solving within 2 runs (M2: within par + 1 pulls).
  - ★★★ for solving on the **first run** (M2: exactly par).

  Rewarding the first run pays for planning and makes guessing through all 2^s settings a poor strategy. In Medium and Hard, using a hint caps the puzzle at ★★, but it can be replayed later for ★★★.
- **No timer.** The run is the reward: whistle and puff animations (static under reduced motion), and the animal walks into its enclosure.
- **Collection: the Zoo Railway Map.** Every 10 solved puzzles opens a new enclosure on a map of the zoo, and each chapter adds a new animal and a new train paint (with a shape pattern, not only a color).
- **Daily timetable.** One puzzle per level each day, picked from the bank with a date-seeded PRNG so it is the same offline for everyone. It keeps a gentle streak that can't be lost, only paused.
- **Build-your-own (later).** A sandbox on the same lane grid. Before a puzzle can be saved, the solver checks that it has a unique solution. Puzzles are shared as a compact code in the URL hash, which needs no server and holds no personal data. Trainyard's 100,000 player levels show how much play this can add.

---

## 8. Data model (JSON bank)

```json
{
  "id": "trains-h1-0142",
  "ch": "h1", "level": "hard", "score": 17.5,
  "lanes": 4, "cols": 6,
  "x": [[0,0,1,"lever"], [1,2,1,"flip"], [2,1,2,"flip"], [4,3,2,"lazy"]],
  "start": [0, 1, 0, 0],
  "stations": ["elephant", "lion", "giraffe", "penguin"],
  "queue": [{"animal": "lion", "from": 0}, {"animal": "penguin", "from": 0}],
  "solution": {"init": [1, 0, 1, 0]},
  "par": {"runs": 1, "pulls": 2},
  "why": [["forced_only_route", "lion", 1], ["flip_parity", 2, 2]]
}
```

- Each entry in `x` is `[col, srcLane, dstLane, kind]`.
- `why` stores **codes, not prose**. The text comes from `trains.strings.js` in both EN and ES, so every sentence exists in both languages and a check can enforce that.
- H3 puzzles store `{"cars": ["zebra","hippo",...], "target": [...], "sidings": [3]}` instead of `x`.

---

## 9. Modules and tests

Files follow the repo's room contract (`assets/js/rooms/registry.js`):

- `assets/js/modules/trains.js` is **pure and DOM-free**. It exports `layoutFromJSON`, `routes`, `simulate(lay, queue, state, {flip, lazy})`, `solve`, `minPulls`, `stackSolve`, `hintStep(puzzle, current)`, `whyTrace` and `difficulty`. Generator code that runs in the build tool lives here too, so the browser and the tool share one simulator.
- `assets/js/modules/trainsart.js` builds SVG nodes: track geometry, levers, animals and badges. It holds no game logic.
- `assets/js/rooms/trains/room.js`, `screens.html` and `room.css` handle the chapter map, the board screen, input, animation and reduced motion. The bank is loaded lazily.
- `tools/trainsbuild.mjs` is a seeded generator that writes `assets/data/trains.json` (about 3,000 puzzles at roughly 120 bytes each, about 350 KB, cached offline).
- `tools/trainscheck.mjs` runs in `npm run verify`. It re-solves every puzzle and confirms that the solution is unique, that every switch is used, that par matches `minPulls`, that EN/ES strings exist for every `why` code, that there are no duplicates (including mirror twins), and that each chapter has a minimum number of puzzles.
- `tools/tests/trains.test.mjs` (`node --test`) covers:
  - simulation on hand-built layouts;
  - the Bebras-2018 tree giving the order `aecgbfdh`;
  - parity of flip-points;
  - `minPulls` against brute force on random cases;
  - stack greedy against BFS for n ≤ 6, and the solvable count equaling Catalan(n);
  - every hint step being consistent with the unique solution, i.e. never misleading;
  - loop detection terminating.

---

## 10. Open questions

1. Lazy points (memory) might be too abstract for ages 10–11. Pilot them in H4 before committing to a full chapter.
2. Spanish chapter names need a native speaker's review. Check whether *cambio* (Spain) or *chucho/desvío* (Latin America) reads better; *desvío* is the more neutral choice.
