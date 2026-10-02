# Robot Path and Fix the Bug: design research

Research notes for two connected programming-logic games for curiozoo.com.
**Robot Path:** the child programs a zookeeper robot to carry food to animals
on a grid. **Fix the Bug:** the child repairs, or predicts the result of, a
program that almost works. Both games use the same grid, interpreter, level
bank and art. These notes cover what existing games do, what the research says
about children at each age, a recommended design, and how to make hundreds of
verified puzzles per difficulty level without hand-drawing each one.

Status: research only. Nothing here is built yet.

---

## 1. Recommendations at a glance

1. **One engine, two games.** Every generated Robot Path level comes with a
   reference solution. Fix the Bug and Predict puzzles are made from those
   same solutions, so each verified level gives us several puzzles.
2. **Use the age bands the research supports.** Easy uses absolute arrows
   (up, down, left, right on the screen), feeding and simple repeat loops.
   Medium adds robot-relative turns, procedures and single-colour
   conditionals. Hard adds sensor conditionals, repeat-until loops, recursion,
   counters and "one program, several zoos".
3. **Build a custom tile-strip editor, not Blockly.** It works by tapping.
   Each procedure gets its own row with a slot limit, in the style of
   Lightbot. A loop is a bracket tile inside the row. Dragging is never
   required.
4. **Pre-generate levels offline and commit them as JSON.** A Node tool
   generates and verifies the levels, and a `tools/*check.mjs` script
   re-verifies them on every build. This matches how the trivia and teasers
   banks already work.
5. **Prove that each concept is needed.** A level counts as a loop level only
   if the shortest loop-free solution needs more tiles than the slot limit
   allows. The same test, run with the matching grammar, applies to
   procedures and conditionals.
6. **Stars measure program size and only go up.** One star for solving. Two
   for using at most par + 2 tiles. Three for reaching par, where par is the
   smallest known solution. Hints never cost stars.
7. **Build Fix the Bug from a catalogue of misconception-based mutations.**
   Each mutation reflects a known misconception: a turn on the wrong side, a
   loop count off by one, a step outside the loop. Accept any fix of one edit
   that works.

---

## 2. What existing games do

| Game | Core mechanic | What we take from it |
|---|---|---|
| **Lightbot** (Danny Yaroslavski) | Icon commands (walk, turn, jump, light). A MAIN row plus procedure rows P1 and P2. Slot limits force abstraction. Loops are done by recursion (P1 calling itself). | Procedures are needed "when they don't have enough space in the MAIN block" ([Yaroslavski, *How does Lightbot teach programming?*](https://www.lightbot.com/Lightbot_HowDoesLightbotTeachProgramming.pdf)). Lightbot 2.0 has 16/8/8 slots and a colour-conditional command ([WPI analysis](https://web.cs.wpi.edu/~rich/courses/imgd4600-c13/analyses/Light-Bot/pantaryl-game-analysis.html)). The Hour of Code edition has only 18 levels: 7 basic, 6 procedures, 5 loops ([Wikipedia](https://en.wikipedia.com/wiki/Lightbot)). Lightbot Jr has 42 ([App Store](https://apps.apple.com/us/app/lightbot-jr-coding-puzzles/id858640629)). |
| **Code.org CS Fundamentals / Classic Maze** | Blockly blocks. A block limit pushes the child toward a loop. Dedicated debugging lessons. | Grade sequence: loops in K–2, then nested loops, while loops and conditionals in Course D (grade 3), functions in E (grade 4), variables in F (grade 5) ([code.org/csf](https://code.org/csf)). The debugging lesson names four bug types: incorrect loops, missing blocks, extra blocks, wrong order ([Course C, Lesson 5](https://curriculum.code.org/csf-20/coursec/5/)). |
| **Kodable** | A pre-reader drops absolute direction arrows onto a maze. Colour tiles act as conditionals ("if pink, turn down"). | Absolute arrows work for children who cannot read yet. Colour can be the first kind of condition ([Kodable](https://www.kodable.com/coding-for-kids), [GSU review](https://sites.gsu.edu/bestpractices/2015/07/01/kodable-computer-programming-for-little-ones)). |
| **ScratchJr** | Icon blocks that snap together horizontally. | The design principle is "low floor, high ceiling". Kindergartners struggled with "meta-level instructions which have no immediate visible outcome" and with "determining numeric parameter values" ([Flannery et al., IDC 2013](https://sites.bc.edu/devtech/wp-content/uploads/sites/181/2018/02/scratchjr_idc_2013.pdf)). |
| **Robot Turtles** (Dan Shapiro / ThinkFun) | Board game. Cards move a turtle. A "Bug!" tile undoes the last card. "Function frog" cards. | Undoing without stigma works. Kickstarter backers had trouble with the bug *card*, so it became a tile you slap ([GeekDad](https://geekdad.com/2014/02/robot-turtles-thinkfun), [KQED MindShift](https://kqed.org/mindshift/39095/no-tech-board-games-that-teach-coding-skills-to-young-children)). |
| **Bee-Bot / Blue-Bot** (TTS) | Floor robot. Stores up to 40 steps, moves 15 cm and turns 90°, and pauses after each step. | Pausing after each step makes the program easy to follow, which supports a visible, slowed-down Step mode ([RobotShop listing](https://www.robotshop.com/products/bee-bot-programmable-floor-robot)). |
| **Cargo-Bot** (Rui Viana, built in Codea) | Programs a crane to stack crates. Conditionals on crate colour. 1–3 stars for shorter programs. | Short-program stars bring players back. In a controlled study with 47 AP CS students, playing it improved understanding of recursion ([Tessler, Beth & Lin, ICER 2013](https://cs.utexas.edu/~lin/papers/icer13.pdf), [Game Developer](https://www.gamedeveloper.com/design/we-played-cargo-bot)). |
| **CodeMonkey** | Typed code (CoffeeScript-like). About 400 challenges. Rewards efficient solutions. | Proof that a coding curriculum can hold hundreds of challenges ([STEM Education Guide review](https://stemeducationguide.com/?p=35832)). |
| **Box Island** (Radiant Games) | 3D adventure with tile programming. 100 levels covering sequences, loops and conditionals. | Story framing helps. Reviewers criticised the lack of feedback when a child is stuck ([NorthStack](https://www.northstack.is/radiant-games-releases-box-island-participates-in-hour-of-code/), [Common Sense](https://www.commonsense.org/education/reviews/box-island-award-winning-coding-adventure)). |
| **Run Marco!** (Allcancode) | Blockly-based adventure for ages 6–12 that moves from sequence to iteration to conditionals ([Phaser news](https://www.phaser.io/news/2016/02/run-marco)). | Narrative chapters, each tied to a concept, keep children going. |
| **Human Resource Machine / 7 Billion Humans** (Tomorrow Corp.) | Assembly-like instructions. Optional **size** and **speed** challenges. 7BH runs many workers in parallel with if/else ([Toucharcade](https://toucharcade.com/2016/06/09/human-resource-machine-review-sine-of-greatness/), [Steam](https://store.steampowered.com/app/792100/7_Billion_Humans)). | Two separate goals, size and speed, give Hard players a reason to replay levels. |

**What they share:** few commands; a visible robot; run → watch → fix → run;
a hard limit on program length (the real teacher: it makes a loop or
procedure *necessary*); an optional efficiency goal.

**Where they fall short of the owner's rule:** none has hundreds of levels
per age band (Lightbot HoC 18, Lightbot Jr 42, Box Island 100, Classic Maze
about 20). Generation is the only practical way to reach 100+ per difficulty.

---

## 3. What the research says

### 3.1 Which concepts at which age

- **Kindergartners can learn loops and conditionals, but not reliably.**
  Bers et al.'s TangibleK robotics study worked with children aged 4.9–6.5.
  76% reached the target on action-only programs. Fewer did once control
  flow appeared: 53% for loops, 68% for "If" and 41% for "If Not"
  ([Bers, Flannery, Kazakoff & Sullivan, *Computers & Education* 2014](https://sites.bc.edu/devtech/wp-content/uploads/sites/181/2018/02/computersandeducation.pdf)).
  **Design consequence:** Easy (6–8) gets loops, but only with small, visible
  counts. Conditionals stay positive only ("if on orange") and wait until
  Medium. "If not" and else branches are for Hard only.
- **The framing matters.** Bers argues that coding for young children must
  happen inside play, story and problem-solving
  ([*Coding as a Playground*](https://www.routledge.com/Coding-as-a-Playground-Programming-and-Computational-Thinking-in-the-Early-Childhood-Classroom/Bers/p/book/9780367900502)).
  KIBO is the tangible version: it teaches sequencing, repeat loops and
  conditional branching to ages 4–7
  ([KinderLab](https://kinderlabrobotics.com/resources/introducing-kibo/)).
  The zookeeper story is our version of that play framing.
- **Learning trajectories.** Rich et al. pulled more than 600 learning goals
  from over 100 papers into K-8 trajectories for sequence, repetition and
  conditionals. Sequencing starts with *order* and *precision*. Repetition
  starts with "the same thing again" and only later becomes "a pattern with a
  count" ([ICER 2017 trip report](https://cacm.acm.org/blogcacm/measuring-student-self-efficacy-and-learning-trajectories-for-k-5-cs-icer-2017-trip-report)).
  The same team also published a debugging trajectory (SIGCSE 2019) and a
  decomposition trajectory (ICER 2018)
  ([dblp](https://dblp1.uni-trier.de/pid/195/8626.html)).

### 3.2 Left and right: perspective-taking

Robot-relative "turn left" is a known stumbling block at age 6. Children work
in an egocentric frame (relative to their own body) before an allocentric one
(objects relative to each other). Clarke-Midura et al. watched kindergartners
with coding toys constantly switching between the two. Many children walked or
turned their own bodies to work out what the toy would do. Moves from a
proto-allocentric to a proto-egocentric frame made up 47.4% of all switches
([*IJCCI* 2021](https://cehhs.usu.edu/itls/projects/pel/files/clarkemidura2021.pdf)).
Children who were better at mental rotation also coded better (same paper).

**Mitigations:**

1. **Easy uses absolute arrows** (↑ → ↓ ← are screen directions; the robot
   turns to face the arrow, then steps), as Kodable does for pre-readers. No
   left/right ambiguity at all.
2. **A bridge world opens Medium.** Relative turns come first with the robot
   facing up (its left = screen left), then right, then down (its left =
   screen right, the hardest case).
3. **Facing is always visible:** visor, nose chevron, and a footprint arrow
   on the tile ahead. Selecting a turn tile draws a curved ghost arrow on
   the robot itself.
4. **An optional "robot's-eye" toggle** rotates the board so the robot
   points up, like a map that turns with you.
5. **Turn tiles are curved arrows (↶ ↷) only**, never straight arrows, which
   read as absolute moves.

### 3.3 Misconceptions to design against (and to use in Fix the Bug)

- **Loops run one extra time.** Children in grades 2–4 (mean age 8.65)
  repeated Scratch loops an extra time, probably reading "repeat 3" as "do
  it, then 3 more"
  ([ICER 2025](https://icer2025.acm.org/details/icer-2025-papers/24/Unplugged-Scratch-and-Python-Tracing-Primary-Students-Preconceptions-of-Programmi)).
  **So:** label loops "×3" with three dots, show "2 of 3" while running, and
  make off-by-one a common Fix the Bug mutation.
- **Simple and nested loops are hard.** 207 elementary students showed loop
  misconceptions in Scratch, Logo and Python alike
  ([Mladenović, Boljat & Žanko 2018](https://www.bib.irb.hr/908782)),
  including "each command inside the loop is repeated separately". Middle
  schoolers still struggle with Boolean conditions in block code
  ([Yang et al., SRI](https://par.nsf.gov/servlets/purl/10502125)).
  **So:** nesting late in Medium; compound conditions only in Hard, if at
  all.
- **Big numbers become toys.** Early ScratchJr testers typed huge numbers,
  then could not debug the result
  ([Flannery et al.](https://sites.bc.edu/devtech/wp-content/uploads/sites/181/2018/02/scratchjr_idc_2013.pdf)).
  **So:** loop counts come from a 2–9 stepper, never typed.

### 3.4 Debugging, tracing and use–modify–create

- **Use, then modify, then create.** Learners start with an existing program,
  then change it, then make their own
  ([Lee et al. 2011, *ACM Inroads*, summarised by K12CS](https://k12cs.org/computational-thinking/);
  [Use–Modify–Create](https://www.academia.edu/57609425/Use_Modify_Create)).
  Fix the Bug and Predict are "use/modify". Robot Path is "create". Each
  world should mix all three.
- **Tracing comes before writing.** In Lister's neo-Piagetian model, novices
  cannot trace code at first. Then they can trace but cannot reason about the
  code abstractly. Only later can they reason about purpose
  ([PPIG 2014](https://ppig.org/papers/2014-ppig-25th-lister/)). Predict-the-
  output puzzles train exactly the tracing stage.
- **Teaching a debugging process explicitly works.** In a pre/post control
  study it raised both self-efficacy and debugging performance
  ([Michaeli & Romeike, WiPSCE 2019](https://computingeducation.de/pub/2019_Michaeli-Romeike_WIPSCE19.pdf)).
  Our hints should script Code.org's version: what happened → what should
  have happened → step until it goes wrong → fix.
- **Stepping helps, but children need guidance.** With NuzzleBug's stepping
  and reverse stepping in Scratch, children debugged effectively, but
  "systematic debugging requires dedicated training"
  ([Deiner & Fraser, ICSE 2024](https://arxiv.org/pdf/2309.14465)). **So:**
  Step and Step-back, with hints that say *how* to use them.
- **Parsons problems** (ordering given pieces) give the same learning gains
  as writing code, faster
  ([ITiCSE working group](https://strathprints.strath.ac.uk/86100/)): a good
  Easy Fix the Bug mode. **Bebras** "Kits" tasks (ages 6–8) are a style
  reference for Predict
  ([Bebras guide](https://www.csiro.au/-/media/Digital-Careers/Files/Bebras-Files/2017-Bebras-Solution-Guide-Aus.pdf)).
- **Hints can be generated.** Piech et al. built next-step hints for Hour of
  Code from student data
  ([2015](https://geometry.stanford.edu/lgl_2024/papers/pmhg-aghipss-15/pmhg-aghipss-15.pdf)).
  We have no data, but a reference solution plus a solver is enough.

---

## 4. Concept ladder and level parameters

| | **Easy (6–8)** | **Medium (8–10)** | **Hard (10–13)** |
|---|---|---|---|
| Commands | ↑ → ↓ ←, Feed 🍌 | Forward, Turn ↶, Turn ↷, Feed, Jump (low walls) | Medium set plus sensors and counters |
| Control | Repeat ×2–5. Body of 1 tile first, then 2–3 tiles. | Repeat with a 2–4 tile body. Nested repeat late. Helper row H1 (procedure). Colour-gated tiles ("only on orange"). | H1 + H2, recursion (a helper that calls itself), `if path ahead / else`, `repeat until 🏁`, counter (`feed ×🔢`, "repeat food-count times"), several boards at once |
| Grid | 5×5 → 6×6 | 6×6 → 7×7 | 7×7 → 8×8 |
| Program size | Main ≤ 12 slots | Main ≤ 10, H1 ≤ 6 | Main ≤ 8, H1/H2 ≤ 6 |
| Reading | None. Icons and voice-over captions only. | Short labels, both languages | Labels plus a short "why" note |

### Worlds

Each difficulty is a sequence of **zoo areas**. Each area is a "world" of
20–30 levels with one new concept.

- **Easy:** Petting Farm, Duck Pond, Monkey Grove, Penguin Beach.
- **Medium:** Savanna, Rainforest, Reptile House.
- **Hard:** Arctic, Night House, Aquarium, Keeper HQ.

Every world also includes review levels from the worlds before it
(interleaving).

---

## 5. Game 1: Robot Path

### 5.1 Screen layout

The default is iPad landscape, 1024×768:

- **Left:** the grid.
- **Right:** the program rows (Main, H1, H2) above a palette of command
  tiles.
- **Below the board:** the run controls.

At 375px wide, the layout stacks vertically: the board on top, the program
rows in the middle, and the palette as a sticky bottom tray.

### 5.2 Command editor (recommended design)

**Evaluating Blockly.** About 720 KB (160 KB zipped), or 300 KB (100 KB
zipped) with advanced compilation
([Google](https://developers.google.com/blockly/guides/contribute/core/advanced)).
It brings drag-centred editing (painful for small fingers), text blocks that
need reading, and runtime CSS injection we would have to audit against our
CSP. It solves problems we don't have, like arbitrary expressions.
**Decision: do not use it.**

**Custom tile-strip editor.** It follows ScratchJr's horizontal icon grammar
and Lightbot's procedure rows:

- **Rows of fixed slots.** Main, H1 and H2 show their limit as empty
  sockets ("7 of 10"). The slot limit is the puzzle.
- **Caret plus tap-to-add.** A blinking caret sits in one row. Tapping a
  palette tile inserts it there; tapping a socket or gap moves the caret.
- **Editing a placed tile.** Tap to select; a small toolbar offers Delete,
  ◀ ▶ move, swap kind (↶ ↔ ↷, another colour) and a count stepper. Undo and
  redo are buttons (Undo uses a bug icon, after Robot Turtles).
- **Loops are bracket tiles, not drop-in containers.** "Repeat" inserts
  `⟦ ×2 … ⟧` with the caret inside and a raised band behind the body. A loop
  costs **one** slot plus its body. Nested repeats (late Medium) are stacked
  bands. Counts show dots as well as a digit.
- **Procedures are rows, as in Lightbot.** Call tiles for H1 and H2 use zoo
  icons (🪣 bucket, 🧺 basket), not "P1". Every row stays a flat strip, easy
  on touch, with an obvious limit. Recursion (a helper calling itself)
  appears naturally in Hard.
- **Conditionals.** *Medium:* Lightbot/Kodable-style **colour gates**. A
  painted tile runs only when the robot stands on that colour, so no
  nesting is needed. Each colour always pairs with a pattern (stripes, dots,
  waves, checks) on floor and tile alike. *Hard:* bracket tiles
  `if ⟨path ahead⟩ ⟦…⟧ else ⟦…⟧` and `repeat until ⟨🏁⟩ ⟦…⟧`, with a sensor
  chip you tap to cycle.
- **Drag is optional.** Pointer-drag reorders, but everything works by
  tapping.
- **Keyboard:** arrows move the caret, Tab changes row; F/L/R/J/E insert
  commands, 1/2 insert helper calls, `[` inserts a repeat, digits set
  counts; Backspace deletes; Enter runs, Space steps, Esc resets.
- **Markup.** Tiles are `<button>`s with bilingual `aria-label`s; rows are
  `role="list"` and announce positions ("tile 3 of 8: forward").

### 5.3 Running and watching

- **Controls:** Run ▶, Step ⏭, Step-back ⏮, Reset ⟲, speed 🐢 / 🐇 / 🐆.
- **The current tile gets a thick outline and a ▶ pointer.** A running loop
  shows "2/3" on its bracket. A helper call lights the call tile, moves the
  pointer into the helper row, and shows a breadcrumb ("Main › 🪣").
- **Reduced motion:** discrete hops with no tweening, a dotted trail of
  visited cells, and `aria-live` announcements.
- **Failure:** the robot stops on the spot with a glyph (💥 bump, 💧 water,
  ❓ nothing to feed, ⏳ out of steps), a bilingual sentence, and a dashed
  "bug" outline on the responsible tile. Never red alone.
- **Success:** happy animal pose plus ✓; reuse the site's `celebrate.js`.

### 5.4 Stars, hints and "why" notes

**Stars (best ever, never lowered):** ★ solved; ★★ size ≤ par + 2; ★★★
size ≤ par. Size counts tiles across all rows, one per bracket. On Easy
levels where par is the flat path, ★★★ means solved without a crash on the
first Run, which rewards planning, not speed.

**Hint ladder,** generated from the reference solution and the child's
trace:

1. **Process nudge:** "Press Step and watch where the robot goes wrong."
2. **Concept nudge** by level tag: "Do you see a shape that repeats?"
3. **Where it goes wrong:** outline the first tile where the robot leaves
   every shortest path to the next goal. A BFS distance table makes each
   lookup constant-time.
4. **Shape hint:** "Your loop needs 2 tiles inside and runs 4 times."
5. **Show one tile:** the first reference tile that differs.

**"Why" note after solving:** one or two bilingual sentences filled from
level metadata, e.g. "A loop saved you 9 tiles: ×4 (forward, turn) instead
of 12 tiles."

---

## 6. Game 2: Fix the Bug (and Predict)

**Modes:**

| Mode | Levels | What the child does |
|---|---|---|
| **Fix it** | all | The board and a buggy program are shown. The child may run or step it, then edits it. |
| **Find it** | Easy | Tap the tile that is wrong, then pick the replacement from 3 options. |
| **Order it** (Parsons) | Easy | The correct tiles are given scrambled. The child swaps them into order. |
| **Predict** | all | "Where will the robot stop?" Tap a cell, plus a facing in Medium and above. On Easy, choose from 3 or 4 marked cells. Then watch the run to check. |

### Mutation catalogue

Each mutation is tagged with the misconception it trains:

| ID | Mutation | Misconception / bug type |
|---|---|---|
| M1 | Flip a turn (↶ ↔ ↷), or an absolute arrow on Easy | Left/right perspective |
| M2 | Loop count ±1 | Loop runs an extra time (ICER 2025) |
| M3 | Delete one tile | Missing step (Code.org) |
| M4 | Insert an extra tile | Extra step (Code.org) |
| M5 | Swap two adjacent tiles | Wrong order (Code.org) |
| M6 | Move a tile across a loop boundary (inside ↔ outside) | Not knowing what the loop covers |
| M7 | Swap or delete a helper call; edit inside the helper | Procedure flow |
| M8 | Change a colour gate, swap a sensor (ahead ↔ left), or swap if and else branches | Wrong condition |
| M9 | Remove a Feed | Goal step forgotten |

### Verification for each mutant P′

1. **P′ fails** on the level (on at least one board, if several).
2. **The failure is visible:** it comes after at least 2 correct actions,
   and bug positions are spread evenly across programs.
3. **Count the fixes.** Run every program one edit from P′ (replace,
   insert, delete, swap neighbours, count ±1): about 150–250 runs, instant.
   Easy requires exactly one fixing location; Medium and Hard allow up to 3.
4. **Predict distractors** are distinct cells taken from misconceptions: the
   M2 mutant's end (loop runs once more), the M1 mutant's end (screen-relative
   turns), and the end if the helper is skipped.

### Grading and stars

- Accept **any** program that succeeds and is within the slot limits. A
  child who finds a different fix is still right.
- Stars, best ever:
  - ★ fixed;
  - ★★ fixed with one edit;
  - ★★★ found the bug *before pressing Run*. This rewards mental tracing,
    per Lister.

---

## 7. Interpreter

- **Programs are plain JSON.** No `eval` and no `new Function`, which keeps
  the CSP strict.
  ```js
  { main:[{op:'F'},{op:'rep',n:4,body:[{op:'F'},{op:'R'}]},{op:'call',p:1}], h1:[...] }
  ```
- **An explicit frame stack drives execution.** Each frame holds `{list, pc,
  left}`, and `step(state)` performs exactly one action or control event:
  - It returns an event:
    `{kind:'move'|'turn'|'feed'|'jump'|'bump'|'enter'|'loop'|'call'|'return'|'done'|'fail', at:[row, ...indexPath], pos, dir}`.
  - Animation, highlighting, Step-back (replaying the trace), hints and
    Predict distractors all read from the same event trace.
- **Limits:**
  - 400 actions and 2,000 control steps, then fail with "The robot is
    tired: is there a loop that never stops?";
  - call depth 16, so recursion is bounded;
  - every failure says why.
- **Shared code.** World state (grid, position, direction, set of animals
  fed, counters) is immutable or copied, so the solver, generator and checker
  can all reuse the interpreter.

---

## 8. Generating puzzles at scale

### 8.1 Prior work

Ahmed et al. generate new Hour of Code and Karel tasks:

1. **Mutate** a reference solution, under constraints, using an SMT solver.
2. **Symbolically execute** the mutated code to *build* the board, with
   Monte Carlo tree search guiding the search.
3. **Keep a task only if it passes these tests:**
   - *coverage:* every block is used;
   - *no crash*;
   - *no shortcut:* no shorter sequence of actions solves it;
   - *minimality:* no solution is much smaller than the size limit;
   - *visual dissimilarity:* measured as Hamming distance on 10×10 grids.

([Ahmed et al., NeurIPS 2020](https://arxiv.org/abs/2006.16913v3).) They
also report that plain enumeration with post-checking was 10–100× slower
than using Z3. That is acceptable for an offline tool at our small program
sizes. **We take the shape of their method:** program first, board second,
then filter with necessity and minimality checks.

### 8.2 Pipeline (offline, in a Node tool)

```text
for each world W, concept template T (e.g. LOOP_STAIRS, LOOP_SPIRAL, PROC_REPEATED_SHAPE,
    COLOR_GATE_TURN, WHILE_CORRIDOR, IFELSE_FORK, COUNTER_FEED, MULTI_BOARD):
  repeat until W has its quota:
    seed  = next seed
    P     = sampleProgram(T.grammar, T.params, rng)      // e.g. ×k(F^a, R) with a∈1..3, k∈3..5
    trace = runOnBlankCanvas(P)                          // carve the path, mark Feed cells
    if !trace.ok or selfOverlap(trace) > T.maxOverlap: continue
    board = fitToGrid(trace, W.gridSize)                 // translate, crop; reject if it doesn't fit
    placeAnimals(board, trace.feedCells)                 // animal + food type per cell
    addScenery(board, rng)                               // water, rocks, trees on unused cells
    addDecoys(board, rng, T.decoys)                      // dead-end spurs, an extra non-goal animal
    // ---- verification ----
    assert run(P, board).success
    flat  = bfsShortestFlat(board)                       // over states (x, y, dir, fedMask)
    slots = T.slotsFor(P)                                // ≥ size(P), and < flat for loop/proc levels
    if T.needsAbstraction and flat <= slots: continue    // concept is NOT necessary → reject
    if T.needsCondition and existsSolution(board, grammarWithout('if','gate'), slots): continue
    par   = minSize(board, T.grammar, upTo: size(P)-1, budgetMs) ?? size(P)
    if par < T.minPar: continue                          // a trivial shortcut exists
    q     = quality(board, P)                            // coverage, # turns, decoy count, use of space
    if q < T.minQuality or nearDuplicate(board, bank[W]): continue   // canonicalise rotations and mirrors
    bank[W].push({ seed, board, ref: P, slots, par, flat, tags: T.tags, difficulty: features(...) })
  sort bank[W] by difficulty; merge with the hand-made spine levels
```

### 8.3 How necessity is checked

- **Loop or procedure needed:** the shortest loop-free solution, found by
  breadth-first search, is longer than the slot limit.
  - This is cheap: about 8×8×4×2^k states.
  - *Example:* a 4-step staircase needs 16 flat tiles. With a 10-slot main
    row, the child is forced to use `×4 ⟦F, L, F, R⟧`.
- **Procedure rather than loop:** check that no program in the "loops only"
  grammar fits in Main.
  - Typical templates: shapes repeated at different spacings, or a pattern
    with a varying gap.
  - Procedure levels give Main fewer slots than the loop-only optimum needs.
- **Conditional needed:** use several boards (as Karel does with multiple
  worlds) or colour gates. Then show that no unconditional program within
  the slot limits solves every board.
- **Enumeration cost.** I measured this with a throwaway prototype in Node 24
  on this Mac (not committed). The grammar was {F, L, R, Feed} plus `×n⟦…⟧` with n = 2–5, with
  simple pruning (no L next to R, no LLL, no Feed twice in a row). Every
  program was run on a 7×7 grid.

  | Size (tiles) | Programs | Time |
  |---|---|---|
  | 6 | 232k | 0.06 s |
  | 7 | 2.6M | 0.4 s |
  | 8 | 29M | 6 s |

  The count grows about 11× per tile. So exhaustive `minSize` is practical
  offline up to about 8–9 tiles, which covers Easy and most of Medium. It
  would take about 0.4 s in a browser up to 7 tiles.

  **For Hard** (two helpers, conditionals), par = the generator's program
  size, lowered only if a time-boxed search finds something smaller. Since
  stars never go down, a child who beats par just gets ★★★. Later speed-ups:
  prune prefixes that reach the same state, and search helper bodies first.

### 8.4 Why pre-generate rather than generate at runtime

Level IDs stay fixed, so progress survives. Exhaustive verification can run
longer than an iPad allows. A person can curate (delete ugly levels). And
`tools/robotcheck.mjs` can re-verify everything on each build, like the
existing `teaserscheck` and `chesscheck`. At about 250 bytes per level,
1,500 levels are roughly 375 KB raw (60–80 KB gzipped), split one file per
world for lazy loading and the offline cache. A seeded runtime "endless
practice" mode, using only the cheap checks, can come later.

### 8.5 Hand-made spine plus generated practice

Each world opens with 4–6 **hand-designed spine levels**, our own originals
rather than copies of Lightbot or Code.org layouts:

- introduce the tile;
- show it working;
- have the child use it once with lots of slack;
- then use it with a tight limit.

Generated levels follow, sorted by a difficulty score: par, flat length,
nesting depth, decoys, slot slack (slots − par), and how many turns face
down.

**Count per difficulty level:**

| Content | Count |
|---|---|
| Spine | ~25–30 |
| Generated Robot Path | ~175 |
| Fix the Bug (1 mutant from each of about 120 levels, picked by mutation variety) | ~120 |
| Predict | ~80 |
| **Total** | **~400 puzzles per difficulty, ~1,200 overall** |

At about 10 puzzles a day, 5 days a week, that is roughly 8 weeks per
difficulty level.

Unlock rules: levels unlock in order, but there is always a window of 3
open levels so a stuck child can skip ahead. No timers anywhere.

---

## 9. Data model

**Level** (in `data/robot/<world>.json`):

```json
{
  "id": "m-savanna-037", "level": "medium", "world": "savanna", "mode": "build",
  "grid": { "w": 7, "h": 7, "cells": "....~~.\n.RR..#.\n..." },
  "boards": [ { "start": { "x": 0, "y": 6, "d": "N" }, "animals": [{ "x": 3, "y": 2, "kind": "giraffe", "food": "leaves" }] } ],
  "palette": ["F", "L", "R", "feed", "rep", "call1"],
  "slots": { "main": 6, "h1": 4 },
  "ref": { "main": [...], "h1": [...] },
  "par": 8, "flat": 15,
  "tags": ["loop", "procedure"], "why": "proc-reuse", "seed": 918273, "difficulty": 0.42,
  "bug": null
}
```

**Fix the Bug level.** Same shape, with:

- `"mode": "fix"` or `"predict"`;
- `"start": {program}`, the buggy program;
- `"bug": {"mutation": "M2", "at": ["main", 1]}`;
- `"choices"` for Predict.

**Progress** (localStorage, one key per game, versioned):

```json
{ "v": 1, "stars": { "m-savanna-037": 3 }, "best": { "m-savanna-037": 8 },
  "seen": ["..."], "draft": { "m-savanna-038": {program} } }
```

**Strings.** All text lives in `{en, es}` pairs in a single strings module.
"Why" notes are templates with `{saved}`, `{n}` and `{body}` slots.

---

## 10. Modules, tests and checks

This follows the repo's existing split: pure modules under
`assets/js/modules/` and a room under `assets/js/rooms/robot/`, with
`room.js`, `screens.html` and `room.css`.

| Module | Pure? | Job |
|---|---|---|
| `robotgrid.js` | yes | Parse cells; check passable and colour; apply move, turn and jump; canonicalise (rotate and mirror) |
| `robotvm.js` | yes | Program validation; `start` / `step` / `runAll`; event trace; limits |
| `robotsolve.js` | yes | BFS for the shortest flat solution; distance-to-goal table; bounded `minSize` enumeration; multi-board checks |
| `robotgen.js` | yes | Template grammars; seeded RNG; carve, fit and decorate boards |
| `robotbug.js` | yes | Mutation catalogue; one-edit neighbourhood; fix counting; Predict distractors |
| `robothint.js` | yes | Hint ladder; "why" text |
| `robotart.js` | DOM | SVG robot, tiles, animals, food and icons, built with `createElementNS`, no `style=""` |
| `rooms/robot/*.js` | DOM | Screens, editor, run controls, progress |

**Tools:**

- `tools/robotgen.mjs` writes the banks.
- `tools/robotcheck.mjs` re-runs every reference solution, checks
  necessity, slots ≥ par, mutant failure and fix counts, the quota (≥ 100
  per difficulty, as `teaserscheck` already enforces with MIN), and that
  every string exists in both languages.

**Tests** (`tools/tests/logic.test.mjs` style):

- **Interpreter:** loop semantics (×3 runs exactly 3 times), call/return,
  recursion depth limit, step limit, colour gates.
- **BFS:** optimality on small hand boards.
- **Mutator:** each mutation produces a program that fails.
- **Generator:** the same seed always produces the same level.

---

## 11. Art (all SVG drawn in code)

- **Robot:** rounded body, visor "face", antenna, **nose chevron**;
  footprint arrow on the tile ahead; happy and dizzy poses.
- **Tiles:** grass, path; water, rock and tree as blocked tiles, each a
  distinct shape; low walls for Jump; patterned colour pads; 🏁 gate.
- **Animals:** 8–10 geometric heads (lion, giraffe, elephant, penguin,
  monkey, panda, flamingo, zebra, sea lion, owl), each with a non-meat food
  (hay, leaves, bananas, fish, bamboo, seeds).
- **Command icons:** ↑ → ↓ ←, ↶ ↷, forward foot, jump arc, Feed bucket,
  helper icons 🪣 🧺, loop bracket with dots, sensor chips (eye-ahead,
  eye-left, flag).
- **Colours** come from design-system tokens, re-tuned for dark mode. Every
  state also has a shape or glyph.

---

## 12. Open questions

- **Jump and heights?** I suggest flat 2D with low walls only: simpler to
  draw and verify, and readable at 375px.
- **Counters in Hard:** keep them small and visible ("🍌 ×3 left" on the
  robot); variables are hard even in middle school.
- **Spanish voice-over for Easy:** check that `speech.js` TTS works offline
  and in Spanish on iPad.
- **Originality:** Lightbot, Code.org and Kodable mechanics are inspiration
  only. All boards, art and names must be our own.

---

## Sources

1. Yaroslavski, *How does Lightbot teach programming?* — https://www.lightbot.com/Lightbot_HowDoesLightbotTeachProgramming.pdf
2. Light-Bot 2.0 game analysis (WPI) — https://web.cs.wpi.edu/~rich/courses/imgd4600-c13/analyses/Light-Bot/pantaryl-game-analysis.html
3. Lightbot (Wikipedia) — https://en.wikipedia.com/wiki/Lightbot
4. Lightbot Jr (App Store) — https://apps.apple.com/us/app/lightbot-jr-coding-puzzles/id858640629
5. Code.org CS Fundamentals — https://code.org/csf
6. Code.org Course C Lesson 5, Debugging in Maze — https://curriculum.code.org/csf-20/coursec/5/
7. Kodable — https://www.kodable.com/coding-for-kids ; GSU review — https://sites.gsu.edu/bestpractices/2015/07/01/kodable-computer-programming-for-little-ones
8. Flannery et al., *Designing ScratchJr*, IDC 2013 — https://sites.bc.edu/devtech/wp-content/uploads/sites/181/2018/02/scratchjr_idc_2013.pdf
9. Robot Turtles — https://geekdad.com/2014/02/robot-turtles-thinkfun ; https://kqed.org/mindshift/39095/no-tech-board-games-that-teach-coding-skills-to-young-children
10. Bee-Bot — https://www.robotshop.com/products/bee-bot-programmable-floor-robot
11. Tessler, Beth & Lin, *Using Cargo-Bot to Provide Contextualized Learning of Recursion*, ICER 2013 — https://cs.utexas.edu/~lin/papers/icer13.pdf ; https://www.gamedeveloper.com/design/we-played-cargo-bot
12. CodeMonkey review — https://stemeducationguide.com/?p=35832
13. Box Island — https://www.northstack.is/radiant-games-releases-box-island-participates-in-hour-of-code/ ; https://www.commonsense.org/education/reviews/box-island-award-winning-coding-adventure
14. Run Marco! — https://www.phaser.io/news/2016/02/run-marco
15. Human Resource Machine — https://toucharcade.com/2016/06/09/human-resource-machine-review-sine-of-greatness/ ; 7 Billion Humans — https://store.steampowered.com/app/792100/7_Billion_Humans
16. Bers et al., *Computational thinking and tinkering*, Computers & Education 2014 — https://sites.bc.edu/devtech/wp-content/uploads/sites/181/2018/02/computersandeducation.pdf
17. Bers, *Coding as a Playground* — https://www.routledge.com/Coding-as-a-Playground-Programming-and-Computational-Thinking-in-the-Early-Childhood-Classroom/Bers/p/book/9780367900502 ; KIBO — https://kinderlabrobotics.com/resources/introducing-kibo/
18. Rich et al., K-8 learning trajectories (ICER 2017 report) — https://cacm.acm.org/blogcacm/measuring-student-self-efficacy-and-learning-trajectories-for-k-5-cs-icer-2017-trip-report ; debugging/decomposition trajectories — https://dblp1.uni-trier.de/pid/195/8626.html
19. Clarke-Midura et al., reference frames with coding toys, IJCCI 2021 — https://cehhs.usu.edu/itls/projects/pel/files/clarkemidura2021.pdf
20. ICER 2025, *Unplugged, Scratch, and Python* — https://icer2025.acm.org/details/icer-2025-papers/24/Unplugged-Scratch-and-Python-Tracing-Primary-Students-Preconceptions-of-Programmi
21. Mladenović, Boljat & Žanko 2018, loop misconceptions — https://www.bib.irb.hr/908782
22. Yang et al. (SRI), middle-school variables and control structures — https://par.nsf.gov/servlets/purl/10502125
23. Use–Modify–Create (Lee et al. 2011) — https://k12cs.org/computational-thinking/ ; https://www.academia.edu/57609425/Use_Modify_Create
24. Lister, neo-Piagetian tracing, PPIG 2014 — https://ppig.org/papers/2014-ppig-25th-lister/
25. Michaeli & Romeike, WiPSCE 2019 — https://computingeducation.de/pub/2019_Michaeli-Romeike_WIPSCE19.pdf
26. Deiner & Fraser, *NuzzleBug*, ICSE 2024 — https://arxiv.org/pdf/2309.14465
27. Parsons problems multi-institutional study — https://strathprints.strath.ac.uk/86100/
28. Bebras 2017 solution guide — https://www.csiro.au/-/media/Digital-Careers/Files/Bebras-Files/2017-Bebras-Solution-Guide-Aus.pdf
29. Piech et al. 2015, hint generation — https://geometry.stanford.edu/lgl_2024/papers/pmhg-aghipss-15/pmhg-aghipss-15.pdf
30. Ahmed et al., *Synthesizing Tasks for Block-based Programming*, NeurIPS 2020 — https://arxiv.org/abs/2006.16913v3
31. Blockly build sizes — https://developers.google.com/blockly/guides/contribute/core/advanced
