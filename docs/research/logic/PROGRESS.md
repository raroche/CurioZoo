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
- [ ] Phase 2 — Truth Island
- [ ] Phase 3 — Find the Rule
- [ ] Phase 4 — Zoo Bridges
- [ ] Phase 5 — Train Tracks
- [ ] Phase 6 — Robot Path
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

## Decisions made while building
- **Animals are emoji**, not drawn heads (PLAN 3.5 updated). Twelve shapes a
  child knows, no art to maintain, CSP-safe text.
- **Next chapter after 20 solves**, not two thirds (70 is a long wait).
- **Hand-made teaching puzzles**: instead of 36 hand-written safes, the first 3
  of each chapter are the generator's gentlest, marked `teach`, with free hints
  that walk every step. The 682 lock is the one hand-made safe (m4-01).
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
