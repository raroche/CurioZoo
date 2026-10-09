# Science Lab: progress log

Keep this file current. It is the hand-off between sessions.

## Goal
A new room, **Science Lab** (`#/science`), with ten games that teach real
science through guess, watch, why. The plan is [`PLAN.md`](PLAN.md).

## Where the work is
Branch `science-room`, in the worktree `.claude/worktrees/science-room`
(Logic Games is being extended in the main checkout at the same time). Serve
it with the `science-room` entry in the main checkout's `.claude/launch.json`
(port 8771).

## Status
- [x] 2026-10-09 Research: the report, plus one research file per game group.
- [x] 2026-10-09 `PLAN.md`.
- [x] 2026-10-09 Phase 0 — room shell: registry entry, iris hue, axolotl,
      `settings.science`, hub, game home, chapters, experiment frame, daily,
      endless, Science Notebook, surprises, `sciencecheck`, `sciencebuild`.
- [x] 2026-10-09 Phase 1 — Hippo Pond (270 experiments, 9 chapters). Room is live.
- [x] 2026-10-09 Phase 2 — Fruit Train (270 experiments, 9 chapters)
- [x] 2026-10-09 Phase 3 — Firefly Circuits (270 circuits, 9 chapters)
- [x] 2026-10-09 Phase 4 — Lift the Elephant (270 planks, 9 chapters)
- [x] 2026-10-09 Phase 5 — Penguin Slide (238 slides, 9 chapters)
- [x] 2026-10-09 Phase 6 — Sun to Lion (270 chains and webs, 9 chapters)
- [x] 2026-10-09 Phase 7 — Elephant Fountain (250 fountains, 9 chapters)
- [x] 2026-10-09 Phase 8 — Shadow Show (226 shadows, 9 chapters)
- [x] 2026-10-09 Phase 9 — Magnet Meerkats (264 magnet puzzles, 9 chapters)
- [x] 2026-10-09 Phase 10 — Domino Zoo (270 machines, 9 chapters)
- [ ] Native Spanish review of every game's text (see each `*text.js`).
- [ ] README: add the room to the list of rooms.

## How to add a game (the checklist each phase followed)
1. `modules/<id>logic.js`: CHAPTERS by level, `chapter(id)`, `CHAPTER_SIZE`,
   `TEACH`, `makePuzzle(ch, rng, i)`, `makeAt`, `sig`, `problems(p)`,
   `answers(p)`, `starsFor`. Pure, no Math.random.
2. `modules/<id>text.js`: every word, both languages, `ch.<id>` and
   `ch.<id>.idea` for every chapter.
3. `IDEAS.<id>` in `sciencetext.js`: one notebook page per chapter.
4. `rooms/science/<id>.js`: the board. Exports `id, bank, chapters,
   levelOfChapter, tileLabel, draw, repaint, click, key, say, dailyPuzzle,
   leave`. Calls `ctx.surprise(n)` when a guess is wrong and
   `ctx.onSolved({ stars, why, pic })` at the end.
5. Register it: `GAME_CHECKS` in `tools/sciencecheck.mjs`, `MAKERS` in
   `tools/sciencebuild.mjs`, `LOADERS` in `rooms/science/hub.js`, `live:
   true` and a meta line in `GAMES`.
6. `node tools/sciencebuild.mjs <id>`, then `npm run verify`.
7. `tools/tests/<id>logic.test.mjs` pins the science itself.
8. Play every chapter in the browser, in English and Spanish, at 375 px.

## Decisions made while building

### Room
- **Stars come from the guesses**, unlike the report's suggestion of stars
  for finishing only. Teaching experiments (the first two of each chapter)
  always give 3 stars, and every later experiment only asks what the
  chapter taught and has a tool that makes the answer reasoned rather than
  remembered (Hippo Pond's water twin, the numbers in Hard). A wrong guess is
  a "Surprise!", counted in the hub, never a red cross.
- **Notebook pages are worked out from the stars** (5 finished experiments
  in a chapter), never stored, so they can never disagree.
- **Progress rules are Logic Games'**: `scienceprogress.js` re-exports
  `logicprogress.js` and adds surprises. `hub.js` and `frame.js` are adapted
  copies of the Logic Games ones (rooms may not import each other).
- **One end card per experiment repeats every result** (✓ or 🤯 with its
  why), because it scrolls into view over the board.

### Hippo Pond
- **Only sourced verdicts.** Things with a sourced density range are judged
  by comparing ranges with a 0.05 margin; things with only a sourced verdict
  ("an apple floats") carry it per liquid, and are never shown in a liquid
  no source covers. Dropped for lack of sources or because the answer
  varies: coconut (only husk-on is sourced; the emoji is dehusked), bottle,
  brick, paper clip (surface tension), lime, tomato, crayon, plastic spoon,
  regular soda can, sponge, pumice. Scissors were dropped because Spanish
  says them as a plural.
- **Salty water is 1.18–1.20** (saturated brine); salt can never float a
  stone, which is a lesson in the "Make it float" chapter.
- **A boat shape is only ever offered as the right answer** (for clay). A
  "press the spoon into a boat" option would be arguable.
- **The honey jar and the iceberg question use mystery blocks** with the
  heaviness on the card, so every answer follows from the numbers shown.
- Spanish avoids adjectives that must agree with a noun's gender ("pesa
  mucho para su tamaño", not "es pesado").

### Fruit Train
- **Whole-number falling.** 1, 3, 5, 7 rows a tick (Galileo's odd-number
  rule, exact), drop heights 1, 4, 9, 16 rows, so the fruit lands exactly
  speed × ticks squares ahead. The fruit leaves a dot every tick; the dots
  of a miss stay on the picture for the next try.
- **"Together" only up to 9 rows (4.5 m).** From higher, air leaves a grape
  a hand's width behind a watermelon (research-motion.md 1.8). Different
  heights may go to 16 rows: a lower start wins by whole ticks. Feathers,
  leaves, paper and balloons drift; two drifters are never compared.
- **Every animal has its fall written under it** ("↓ 4 rows / 2 ticks");
  Hard shows only the rows, so the ticks are worked out.
- **Moving-train puzzles can be retried** (the miss is the evidence); "which
  lands first" and "count the gaps" are one go.
- **Animations finish even in a hidden tab** (a timer backs up
  requestAnimationFrame), so a child who switches away never comes back to a
  stuck train.

### Firefly Circuits
- **The solver is the ideal circuit, exact**: wires 0, every firefly 1, the
  eel 1; nodes by union-find over cell edges; short = the eel's two ends in
  one node (every firefly dark); bypass = a firefly's feet in one node; the
  rest by Kirchhoff with exact fractions. Brightness tiers 1, 4/9, 1/4, 1/9,
  0; Easy says only glows or sleeps, Medium bright/dim/asleep, the last Hard
  chapter bright/medium/faint/asleep (never 4/9 beside 1/4).
- **Boards are rings** round a box with optional straight chords across the
  middle (T pieces where they meet the ring), which makes loops, side-by-side
  branches, bypasses and shorts. Build puzzles empty some wire cells into
  slots and are kept only if exactly one filling of the slots from the tray
  meets the card (the checker searches them all again).
- **Dots follow the research's honesty rules**: present before Go, all start
  together, move only where current flows, speed by current (a spanning-tree
  flow inside each node), race in a short; electrons leave the − end. They
  are CSS stroke-dash animations, so reduced motion simply stops them and
  shows arrows.
- **Safety line** on every short (in the result and the end card).

### Lift the Elephant
- **Weights are the numbers on the tags.** A real elephant is not 5 mice;
  the tags make the rule (weight × steps) the thing being reasoned about.
- **Chapters follow Siegler's item types**: weight, distance and balance
  (Easy), the three conflict types (Medium), and planks where adding weight
  and steps per stack gives a different answer from multiplying (Hard).
- **Build puzzles are proven unique by trying every placement**; flower
  pots on some pegs make one-animal "lift" puzzles have exactly one peg.
- **"How far?" is pure turning**: the near end moves (near ÷ far) as much;
  tags and sums are hidden there, because weight plays no part.
- **The heavy plank** chapter puts the rock off-centre and shows the plank's
  weight as a token at its middle, counted like an animal.
- The Archimedes line says "people say" (first written down by Pappus).

### Penguin Slide
- **Predict puzzles, not track building.** The report warned that building
  runs drifts into Train Tracks; every chapter instead hinges on a physics
  moment: straight out of a tube (top view, McCloskey's task, with the
  "keeps curving" and "flung outward" fish as the wrong choices), no higher
  than the start (equal height stops it), and whole-number jumps.
- **Some chapters are shorter** (Splash! 16, Pick the shelf 20, Over and in
  22): there are only so many whole-number jumps. Chapters may set `size`;
  the builder and checker read `sizeOf(ch)`.
- **The right choice is spread across the three positions** (`around()`),
  so "pick the middle" never pays.

### Sun to Lion
- **78 living things in 10 habitats, every shown link OK in the research
  table with its source key**; LESS and AVOID links are kept in the data so
  they are never shown as true and never used as a wrong answer.
- **Wrong answers are only "pure" eaters of the wrong kind** (a lion in a
  plant-eater slot, a zebra in a meat-eater slot, an animal in a plant
  slot), with no link of any kind to their neighbours. "Lives far away" was
  tried and dropped: there are squirrels in Africa too.
- **The soil tile is in every plant slot**, with the research's answer to
  "plants eat soil", and van Helmont's willow on the end card.
- **Arrows read "gives food to"** in both languages; energy dots run from
  food to eater. Webs are laid out in layers (plants at the bottom), rows
  ordered by their food, and every web question says "in this picture".

### Elephant Fountain
- **One water rule**: each drop falls, then goes to whichever empty cell
  touching its pool would end lowest (ties: nearest, then left). It spreads,
  spills at the first edge, fills from the bottom, and rises in both arms of
  a U together. A bug worth remembering: comparing score arrays with `<`
  compares them as text in JavaScript ("-7" before "-8"); `better()` compares
  number by number.
- **Build puzzles are proven unique** by running every dig set within the
  budget and every gate state. Hand-drawn teaching boards turned out to have
  two answers, so teaching boards come from the maker with the simplest
  settings instead.
- **Joined-tube chapters hold 20**: there are only so many U shapes.
- **Daily and endless come from the bank** (`dailyPuzzle` returns null, and
  daily.js picks a checked board by date): proving uniqueness on a slow
  tablet could take too long.

### Shadow Show
- **A split stage**: the side view (lamp, steps, puppet on a stick, wall)
  and the wall face-on, where a shadow is the puppet emoji turned black
  (`filter: brightness(0)`), so it has exactly the puppet's outline.
- **Rays and the shadow wedge appear only after Light!**: drawn before, they
  gave the answer away.
- Whole-number similar triangles (12 ÷ step), the lamp moving instead
  (steps 0, 3, 4, 5 give 2, 3, 4, 7), lamp height moving the shadow the
  other way, sun slopes, card/tissue/glass, two lamps.
- Several chapters hold 20–24: there are only so many whole-number set-ups.

### Magnet Meerkats
- **Poles by letter and shape**: N half pointed, S half round, each with
  its letter; the pink and blue are only paint, and the e1 notebook line
  says so. Push is ↔ (the ⟷ glyph is missing from some fonts).
- **Two ways to play.** Built (huddle, ring tower): tap to turn, Test!,
  a surprise names the pair or gap that did not do what the card said, and
  the child keeps going; two hints, the second turns and pins one piece.
  One go (hug or push, does it stick, through the wall, which is the
  magnet, compass): choose, then Test!.
- **Huddle boards never wider than 5** and drawn at 72px a square, shrunk
  only to fit, so every magnet is big enough to tap on a phone. Long easy
  lines became two rows with an empty row between.
- **Only SAFE things** on the tray (research 6.1): no coins, keys, spoons,
  scissors or jewellery. Every tray has a metal that does not stick.
- **Which is the magnet?** keeps adding random cards until the bar types are
  fixed, then drops every card the answer does not need. Only the types are
  asked: which end is N can stay open, so N and S are never revealed.
- **Ring tower** after a test shows the real gaps, smaller lower down
  (more weight above), as an order only, never sizes.
- Compass: 24 puzzles (32 set-ups exist).

### Domino Zoo
- **Zig-zag shelves** instead of free placement: row 0 runs right, row 1
  left, and so on, with a hole at each shelf's far end. Tap-to-snap gaps
  only (research 5: no precision dragging), and the shelf's way is drawn
  as arrows, so the ramp's right slope can be worked out.
- **Rules** (dominologic.js): Whitehead's 1½ rule between dominoes; the
  finger and a rolling ball knock over any domino; a seesaw lifts a little
  (a low bell), a pulley lifts high (a low or high bell); a fan blows only
  the light paper boat, and the why line says the battery makes the wind.
- **One answer**: every way of putting tray pieces into gaps, with every
  turn of ramps and fans, and with gaps left empty, is run; a puzzle is kept
  only when exactly one placement rings the bell and it fills every gap.
  Pieces just alike count once. This caught honest second answers while
  writing the teach puzzles (a fan in a ramp's gap blowing straight to the
  boat; a ball carrying a push in a domino's gap), so they were redesigned.
- **Replay**: Go runs the machine one event at a time (300 ms each); a
  stop shows 🤯 where it stopped and says why.
- **Where will it stop?** letters are shuffled onto the parts, so the
  answer's letter tells nothing; choices name the part too.
- **Energy line kept honest**: a standing domino holds energy; a small push
  lets it go. The "bigger one" clause sits with the size rule only.

## Next
All ten games are built. Left: a native Spanish read of every science text
file, and real children playing the first chapters of each game.
