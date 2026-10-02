# Logic Games: progress log

Keep this file current. It is the hand-off between sessions.

## Goal
A new room, **Logic Games** (`#/logic`), with seven games: Crack the Code,
Truth Island, Find the Rule, Zoo Bridges, Train Tracks, Robot Path and Fix the
Bug. Each game is long (200+ puzzles per level) and every puzzle is proven to
have one answer. The plan is [`PLAN.md`](PLAN.md).

## Status
- [x] 2026-10-02 Research written, one file per game group (`research-*.md`).
- [x] 2026-10-02 `PLAN.md` written.
- [x] 2026-10-02 The room layout (`offline-and-rooms`) committed as a279d84.
      Work continues on branch `logic-games`.
- [x] 2026-10-02 Phase 0 — room shell and shared pieces
- [x] 2026-10-02 Phase 1 — Crack the Code (840 safes, room is live)
- [x] 2026-10-02 Phase 2 — Truth Island (600 puzzles)
- [x] 2026-10-02 Phase 3 — Find the Rule (600 puzzles)
- [x] 2026-10-02 Phase 4 — Zoo Bridges (900 puzzles)
- [x] 2026-10-02 Phase 5 — Train Tracks (1,000 puzzles)
- [x] 2026-10-02 Phase 6 — Robot Path (600 levels)
- [ ] Phase 7 — Fix the Bug
- [ ] Phase 8 — Endless, room badge ladder, Spanish review list
      (Daily is already done for Crack the Code; each new game adds its own.)

## How the room is built (read before adding a game)
- `rooms/logic/hub.js` routes every address and draws the hub, a game's
  chapters, a chapter's puzzles and the puzzle frame. A game is one file,
  `rooms/logic/<game>.js`, added to `LOADERS` in hub.js. Its default export
  is the adapter: `id, bank(level), chapters(level, lang), levelOfChapter(id),
  tileLabel(p, lang), draw(host, ctx), repaint(lang), click(ev), key(ev),
  say(), extras(...), news(...), dailyPuzzle(level, iso)`. `code.js` is the
  model. `ctx.onSolved({ stars, why: (lang) => [html, ...] })` ends a puzzle.
- Every sentence a board shows must be a function of the language
  (`play.msg = (L) => ...`) so a language switch mid-puzzle redraws it without
  losing the child's work.
- `modules/logictext.js` has the room's words and the GAMES list (flip
  `live: true` when a game ships, and give `logiccheck.mjs` a checker for it).
- Banks: `node tools/logicbuild.mjs <game>` writes `data/logic/<game>/*.json`,
  one puzzle per line. It runs the checker first and writes nothing on failure.
- Progress: `settings.logic`, owned by `modules/logicprogress.js`. Stars only go
  up; next chapter opens after 20 solves; 3 puzzles ahead are always open.

## Crack the Code: what shipped
- 12 chapters × 70 = 840 safes. In each chapter: puzzles 1–3 teach (hints
  are free there), every 5th is "Could it be?", 14/28/42/56/70 are free cracks.
- The solver's rules R1–R7 (codelogic.js) grade, prove, hint and explain.
  Tiers measured on the bank: Easy 1–2, Medium 2–3, Hard mostly 4 ("what if").
- Daily safe per level, generated on the device from the date.
- Zoo map: every 10 solves in a chapter opens one of 7 locks; 7 locks bring the
  chapter's animal and a fact (sources in `CREDITS.md`).
- Checked in the browser on 2026-10-02 at 1024×768 (dark) and 375 px (light):
  hints, wrong and right answers, "Could it be?", free crack with Helper Owl's
  notes and the detective note, chapter unlock, lock news, English↔Spanish
  mid-puzzle. No console errors, no sideways scroll.

## Truth Island: what shipped
- 15 chapters × 40 = 600 puzzles; the first 2 of each chapter teach (free hints).
- Easy: picture sentences (counts, "no …", "more … than …", who holds what),
  then accusations chained from them; e5 hides the picture and a Sun-badge
  animal tells what is in it. Medium: about-me, same/different, counting,
  pencil (needs one suppose), mix. Hard: four animals, and/or/if, the Cloud
  animal, two sentences each, and h5 with two separate suppose steps.
- The solver (truthlogic.js) narrows a domain per animal; step kinds fact,
  check, known, self, both, left, suppose. Hints start from the child's own
  tokens and what earlier hints ruled out, so they always move forward.
- Pencil mode: bubbles show "would be true/false", "must be true/false" and
  "Clash!" in words.
- Island album on the game page: how often each islander was met as Sun /
  Moon / Cloud, worked out from solved puzzles (nothing extra stored).
- Checked in the browser: Easy picture, pencil on Medium, Cloud with hints
  to the end in Spanish, hidden picture at 375 px dark. No console errors.

## Find the Rule: what shipped
- 15 chapters × 40 = 600 puzzles; first 2 of each teach (free hints).
- Creatures are the site's face plus a hat, a pattern on the wall, buttons,
  a size and a held thing; 3 attributes on Easy, 4 on Medium, 5 on Hard.
- Easy: waiting line + sort six (checked: every wrong idea that fits the
  opening sorts at least one wrong; the line can tell every two ideas
  apart). Medium/Hard: dress-up machine + build the rule from parts.
- Rules compared by fingerprint (which creatures pass). Hints: look → the
  test that splits the ideas left → "the rule is about …".
- Rule book on the game page, from solved puzzles.
- Checked in the browser: Easy line + brave tester + sort to 3 stars; Medium
  wrong build → counterexample, right build; Hard pairs; Spanish after a win.

## Zoo Bridges: what shipped
- 30 chapters × 30 = 900 puzzles; Easy 6×6–7×7 (single bridges first),
  Medium 7×7–10×10, Hard 10×10–13×13. First 2 of each chapter teach.
- Solver: lo/hi per route + groups; techniques full/cap, noCross,
  onlyNeighbour, justEnough, atLeastOne, pairIsolation, closedGroup,
  onlyExit, whatIf. Tests check it against brute force on small grids.
- Board trims to the islands; tap targets on the water; ring of dots per
  island; ✓ + visiting animal when full, "!" + dashed ring when over.
  Undo, start again, "Check my bridges" (count, then "show me").
- Zoo map on the game page: one habitat per chapter, night version at all ★★★.
- Checked in the browser: hints to a finished grid, Check/Show/Undo, big Hard
  grid at iPad size in light mode.

## Train Tracks: what shipped
- 10 chapters × 100 = 1,000: predict, set (1, 2, 3–4 trains), fewest pulls,
  flip warm-up, flip yard, choose the order, the siding, levers + flips.
- trainslogic.js: lanes + crossovers; levers and flips; set puzzles kept
  only if exactly one of the 2^n settings works; fewest pulls exact by DP;
  siding solved by Knuth's greedy rule (tests: sortable counts are Catalan).
- Board: SVG railway, animated rides (one element moved per frame), routes
  drawn at once with reduced motion; houses tick or "?" after a run.
- Checked in the browser: set with hints + GO, predict, pulls, order,
  siding to solved; phone dark (board scrolls in its own box).

## Robot Path: what shipped
- 12 worlds × 50 = 600 levels: Petting Farm, Duck Pond, Monkey Grove,
  Penguin Beach (screen arrows); Turning Bridge, Savanna, Rainforest,
  Reptile House; Arctic, Night House, Aquarium, Keeper HQ.
- robotvm.js: interpreter (no eval), bounded; trace of events with the path
  of the tile that caused each. robotgen.js: program-first generation,
  corridor-first for sensors, recursion from a helper that calls itself;
  loop/helper/colour worlds checked so the plain program does not fit.
- rooms/logic/robotbench.js: board, tap editor with caret and brackets,
  runner; shared with Fix the Bug.
- Checked in the browser: hints build a working start, Run to 3 stars;
  nested Until/If/F by tapping; a forever-loop stops "tired" with a bug mark.

## Decisions made while building
- **Animals are emoji**, not drawn heads (PLAN 3.5 updated). Twelve shapes a
  child knows, no art to maintain, CSP-safe text.
- **Next chapter after 20 solves**, not two thirds (70 is a long wait).
- **Hand-made teaching puzzles**: instead of 36 hand-written safes, the first 3
  of each chapter are the generator's gentlest, marked `teach`, with free hints
  that walk every step. The 682 lock is the one hand-made safe (m4-01).
- **Truth Island h5** asks for two separate "suppose" steps, not one nested
  two deep: a depth-2 suppose is about 1 in 200 four-animal puzzles, too rare
  to fill a chapter.
- **Truth Island h4** (two sentences each) lets one of an animal's two
  sentences be a red herring, as the research allows at Hard; no animal may
  be spare, and no sentence may be one anyone could say ("I am a Sun animal").
- **Find the Rule's Hard chapters** are three-part rules, "not both",
  pairs, counting-plus and a mix. The research's "parade" (rules about a
  line of creatures) and "two gates" chapters were left out: two gates is
  the same as one gate, and parades need a sequence editor of their own.
  Three-part rules use one joining word for all parts ("and" or "or"), so
  the builder can always express them.
- **Hints in Find the Rule reason over rules of one or two parts.** Three-part
  rules are too many to list on a phone; the hint still finds good tests.
- **Bridges micro-lessons** are the two teaching puzzles per chapter plus the
  hint ladder, which names each technique ("Try this: Just enough") before
  explaining it; there is no separate lesson screen.
- **Bridges: some lessons are families.** "No crossing" and "only exit" are
  rarely the hardest step on their own, so e2 accepts "full up" or "no
  crossing" and m4/h2 accept either "keep together" rule. The biggest Hard
  chapters (h8–h10) need "keep together" or "what if", not always "what if",
  which would take minutes per puzzle to find.
- **Train Tracks memory points ("lazy" switches) were left out.** The
  research flagged them as possibly too abstract; "Zoo Machine" mixes levers
  and flip switches instead.
- **Train hints follow the child's own setting**: the first train that goes
  wrong, and the first switch on its way that differs from the answer, rather
  than the research's route-by-route deduction engine.
- **Robot Path's hand-made "spine" levels** are the generator's three
  gentlest per world, marked teach; no level is hand-drawn. Par is the size
  of the program the level was made from (or the shortest plain program for
  step-by-step worlds), not an exhaustive search; a child who beats it still
  gets ★★★. "Several boards, one program" became the Night House sensor
  world (one look-first program walks any corridor), not a multi-board view.
- **The Question Gate chapter was dropped** from Truth Island: there are only a
  handful of different yes/no-question puzzles, not forty.
- `.claude/launch.json` has a second server, `giftedprep-alt` on port 8767, for
  when another session already holds 8765.

## Facts checked (so nobody re-checks)
- Free room hue was `jade`; free creatures were `cat`, `mouse`. Logic uses jade
  + cat, so `mouse` is the last free creature and `mango` the last free hue
  (mango is the brand colour, so a new room needs a new hue).
- `storage.js` DEFAULTS has `logic: {}`.
- archcheck allows a room to `import()` its own files.
- Bank build time: Easy 1 s, Medium 2 s, Hard 9 s. Banks are 34–40 KB each.

## Open questions
- Memory points (Trains h4) and "What if…?" (Bridges T8): keep only if a
  playtest with a 10–11-year-old says they feel like logic, not guessing.
- Spanish: *desvío* vs *cambio* for a train switch; all templates need a
  native read (Crack the Code's are in `codetext.js`).
