# Science Lab: build plan

A new room on curiozoo.com with ten games that teach real science by letting a
child **guess, watch, and see why**. This file is the hand-off to whoever
builds it. Build one game at a time, in the order of the phases below.

Read in this order:
1. This file.
2. [`PROGRESS.md`](PROGRESS.md) in this folder (what is done, what is next).
3. The report that chose the games:
   [`reports/Science and physics games for CurioZoo.md`](../../../reports/Science%20and%20physics%20games%20for%20CurioZoo.md).
4. The research file for the game you are building:

| Game | Research file |
|---|---|
| Hippo Pond | [`research-hippo.md`](research-hippo.md) |
| Fruit Train, Penguin Slide | [`research-motion.md`](research-motion.md) |
| Firefly Circuits, Magnet Meerkats | [`research-circuits-magnets.md`](research-circuits-magnets.md) |
| Sun to Lion | [`research-foodchains.md`](research-foodchains.md) |
| Lift the Elephant, Shadow Show, Elephant Fountain, Domino Zoo | [`research-levers-shadows-water-dominos.md`](research-levers-shadows-water-dominos.md) |

---

## 1. The owner's rules

1. **Quality and fun first.** The most important thing is that each game is
   good and that children want to play it. A game may ship with fewer than
   200 puzzles per level when more would only repeat itself; say so in its
   meta line. (The Logic Games rule of 200+ per level is relaxed here on
   purpose, 2026-10-09.)
2. **True science only.** Every outcome a game shows must be what really
   happens. Every fact in a bank (a density, a diet, a magnetic metal) carries
   a source in its research file. A wrong fact teaches a new misconception.
3. **Logic, not luck.** Every puzzle has exactly one answer, and a child can
   reach it by reasoning with what the game has taught. A script proves this
   for every puzzle on every build. No physics engine: whole-number rules
   only, so the same puzzle plays the same on every device.
4. **Site rules stay.** No timer pressure. Stars only go up. No streak that
   can be lost. Nothing is collected or sent. English and Spanish. Works
   offline. iPad first, works at 375 px. Right and wrong are never shown by
   colour alone. Explanations a six-year-old can follow.

---

## 2. Where it goes in the site

### 2.1 The room

One room, one entry in `REGISTRY` (`assets/js/rooms/registry.js`):

| Field | Value | Why |
|---|---|---|
| id | `science` | |
| name | Science Lab | Sits beside Math Lab; says what it is |
| hue | `iris` | A new ninth hue (h 248), added to `tools/palette.mjs` and `design-system.css`. Every other hue is taken; mango is the brand. |
| creature | `axolotl` | New: three gills a side. No other creature has more than one shape per ear. |

It shows on the home page after Logic Games and before Fun and Games.

### 2.2 Addresses

The same shape as Logic Games, so a child who knows one room knows the other.

| Address | Screen | What it shows |
|---|---|---|
| `#/science` | `sciencehub` | Ten game cards, today's experiments, stars, surprises, the Science Notebook |
| `#/science/<game>` | `sciencegame` | Level picker and the chapters for that level |
| `#/science/<game>/<chapter>` | `sciencegame` | One chapter's puzzles |
| `#/science/<game>/<chapter>/<n>` | `scienceplay` | One puzzle |
| `#/science/<game>/daily` | `scienceplay` | Today's puzzle |
| `#/science/<game>/endless[/<n>]` | `scienceplay` | Endless practice |
| `#/science/notebook` | `sciencegame` | Every big idea, earned or still to find |

Game ids: `pond`, `train`, `firefly`, `lever`, `slide`, `chain`, `fountain`,
`shadow`, `magnet`, `domino`. Chapter ids carry the level: `e1`, `m2`, `h3`.

### 2.3 Files

```
assets/js/rooms/science/
  room.js          the registry contract
  screens.html     three screens: sciencehub, sciencegame, scienceplay
  room.css         shared layout + one section per game
  hub.js           routing, hub, game home, chapters, puzzle frame, daily, endless
  frame.js         record, language, small markup, the end-of-puzzle card
  daily.js         make today's puzzle, never come back empty-handed
  pond.js train.js firefly.js ...   one board per game, loaded on first use

assets/js/modules/            pure, DOM-free, tested in node
  scienceprogress.js   the room's record: logicprogress.js rules + surprises + ideas
  sciencetext.js       shared EN/ES words, the ten game cards, the ideas
  scienceart.js        the ten game icons
  pondlogic.js + pondtext.js     and so on, one pair per game

data/science/<game>/<level>.json   the banks (built, committed, checked)

tools/sciencebuild.mjs   node tools/sciencebuild.mjs <game> [--level easy]
tools/sciencecheck.mjs   part of npm run verify; re-checks every bank and both languages
tools/tests/<game>logic.test.mjs
```

`rooms/science/hub.js` and `frame.js` are adapted copies of the Logic Games
ones, because a room may not import another room's files
(`tools/archcheck.mjs`). The progress rules are not copied: the room imports
`modules/logicprogress.js`, whose functions are pure and keyed by game id, and
keeps its own record under `settings.science`.

Shared files touched outside the room: `registry.js` (one entry),
`storage.js` (`science: {}`), `sections.js` (the axolotl), `design-system.css`
and `tools/palette.mjs` (the iris hue), `package.json` (`sciencecheck` in
`verify`). Logic Games is being extended on another branch at the same time;
none of these lines overlap with it.

---

## 3. Decisions that apply to every game

### 3.1 The loop: guess, watch, why

The research is clear that play alone leaves wrong ideas where they were, and
that a prediction followed by a short explanation moves them. So every game
has the same beat:

1. **Guess** (or build). The child commits before anything moves: picks
   Floats or Sinks, taps the drop spot, places the wire.
2. **Go.** One big button. The thing happens, slowly enough to see.
3. **Why.** One sentence and a picture, every time, right or wrong. It says
   the rule, not just the result.

Under reduced motion, Go jumps to the end state and the sentence says what
moved.

### 3.2 Being wrong is a surprise, not a failure

A wrong guess shows **"Surprise!"** with a 🤯, never a red cross. The room
counts surprises ("You found 23 surprises. Scientists love those.") in the
hub. A surprise is never a lost star on a teaching puzzle.

### 3.3 Stars

- Teaching puzzles (🎓, the first of each chapter) always give 3 stars when
  finished. They exist to show the idea.
- Every other puzzle: 3 stars if solved with no hint and at most one wrong
  Go (or wrong guess), 2 stars with one hint or two wrong, 1 star otherwise.
  Each game states its exact rule in its file. Retrying keeps the best.
- A graded puzzle only asks what the chapter has taught, and every game has a
  tool that makes the answer reasonable rather than remembered (Hippo Pond's
  "water twin" balance, Fruit Train's dotted trail, Lift the Elephant's
  weight × steps count). The hint ladder shows that tool.

### 3.4 The Science Notebook

Every chapter teaches one **big idea** ("Big things can float"). The idea's
card goes into the child's Science Notebook after 5 solves in that chapter,
with its picture and its one-line why. The notebook only grows. It is the
room's collection, the way the zoo map is Crack the Code's.

### 3.5 Same as Logic Games

Levels (Easy 5–8, Medium 8–10, Hard 10–13), chapters that open after 20
solves in the one before, three puzzles open ahead, a daily puzzle per game
and level, endless practice made on the device from seeds, badges by total
stars, days played this week (never days missed), English and Spanish in one
tap, read aloud.

### 3.6 Accessibility

Boards are SVG. Every thing a child taps is a real button with a name
("Apple: will it float or sink?"). Results go to a polite live region. Every
state has a shape or a word as well as a colour: ⬆ floats / ⬇ sinks, ✓ fed,
rays round a glowing firefly, N and S on magnets with a flat and a round end.

---

## 4. The games

The order is the report's ranking. Each game's design is settled in its own
section of PROGRESS.md as it is built, from its research file.

| # | id | Name (EN / ES) | Teaches | Main tool | Phase |
|---|---|---|---|---|---|
| 1 | pond | Hippo Pond / La charca del hipopótamo | Float or sink: heaviness for size, not weight | Water-twin balance | 1 |
| 2 | train | Fruit Train / El tren de la fruta | Dropped things keep moving forward; heavy and light fall together | Dotted trail | 2 |
| 3 | firefly | Firefly Circuits / Circuito de luciérnagas | A full loop; short circuits; series and parallel | Flowing dots | 3 |
| 4 | lever | Lift the Elephant / Levanta al elefante | Weight × distance | Step count | 4 |
| 5 | slide | Penguin Slide / El tobogán del pingüino | Ramps; straight out of a curve; no higher than the start | Ghost path | 5 |
| 6 | chain | Sun to Lion / Del sol al león | Food chains start at the sun | Diet cards | 6 |
| 7 | fountain | Elephant Fountain / La fuente del elefante | Water flows down and finds its level | Water rules | 7 |
| 8 | shadow | Shadow Show / Teatro de sombras | Light in straight lines; nearer the lamp, bigger shadow | Light rays | 8 |
| 9 | magnet | Magnet Meerkats / Suricatas imantadas | Like poles push, unlike pull; which metals stick | Pole marks | 9 |
| 10 | domino | Domino Zoo / Dominó del zoo | Chain reactions pass energy along | Step replay | 10 |

Phase 0 is the room shell, the shared frame, the notebook and the tools.

## 5. Names and code to avoid

No "Maze" names (Laser Maze, Circuit Maze, Gravity Maze are ThinkFun marks),
no GraviTrax, Rube Goldberg, Angry, Cut the Rope, Om Nom, PhET. No GPL code
(PhET sims, Falstad CircuitJS, The Powder Toy). Original art and generated
levels only. Not legal advice.
