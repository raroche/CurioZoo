# Curio Trivia: progress log

Keep this file current. It is the hand-off between sessions and models.

## Goal
A sixth Fun game at `#/fun/trivia`: three levels (Easy 4-6, Medium 7-10,
Hard 11-15), sixteen categories plus Mixed, every question in English and
Spanish with a button to flip it, a one-line "why" after every answer, a
memory so a weekly family never sees a repeat for over a year. See PLAN.md.

## Status
- [x] 2026-09-14 Research done: 01-content.md, 02-design.md, PLAN-codebase-notes.md.
- [x] 2026-09-14 PLAN.md written (phases 0 to 8). Decisions table is final.
- [x] 2026-09-14 Phase 1: skeleton that plays. 162 seed questions (3 per level per
      category; words and puzzles 3 EN + 3 ES per level), `tools/triviacheck.mjs`,
      `modules/trivia.js`, `screens/trivia.js`, all wiring, CSS.
- [x] 2026-09-14 Phase 2: language pill on every card, `speech.speak(..., { lang })`,
      `voiceFor('es')`, Easy reads aloud, speaker button on every card.
- [x] 2026-09-14 Phase 3: `settings.trivia` memory, weights, recent, second looks,
      stars and ranks, "Last time you learned", the Fact Book.
      Phases 1 to 3 went in as one commit because they were built together.
- [ ] Phase 4: bank part one (animals, space, physics, body, earth, geography, science: 21 batches)
- [ ] Phase 5: bank part two (general, why, math, history, cultures, everyday, art, words, puzzles: 27 batches) -> ship gate 1,440
- [ ] Phase 6: polish, native Spanish read-through, README, ship
- [ ] Phase 7: bank part three -> 2,880
- [ ] Phase 8 (optional): bigger / order / typed formats, two players

## Bank counts (update from `node tools/triviacheck.mjs` after every batch)
| category | easy | medium | hard | es reviewed |
|---|---|---|---|---|
| animals | 3 | 3 | 3 | no |
| space | 3 | 3 | 3 | no |
| body | 3 | 3 | 3 | no |
| earth | 3 | 3 | 3 | no |
| science | 3 | 3 | 3 | no |
| geography | 3 | 3 | 3 | no |
| cultures | 3 | 3 | 3 | no |
| history | 3 | 3 | 3 | no |
| math | 3 | 3 | 3 | no |
| words (en + es) | 3+3 | 3+3 | 3+3 | no |
| art | 3 | 3 | 3 | no |
| everyday | 3 | 3 | 3 | no |
| physics | 3 | 3 | 3 | no |
| general | 3 | 3 | 3 | no |
| why | 3 | 3 | 3 | no |
| puzzles (en + es) | 3+3 | 3+3 | 3+3 | no |

## Facts checked (so nobody re-checks)
- `fun.js` is 879 lines; archcheck warns past 700. The trivia screen goes in
  its own `screens/trivia.js`; `renderFun` forwards to it.
- `linkcheck.mjs` line 135 hard-codes the game ids and only `play`/`learn`
  steps. `'trivia'` must be added there.
- The generic `.gp-choice` handler in `app.js` (around line 405) calls the
  gifted quiz. The trivia pick check must be placed above it.
- `speech.js` is English-only today (`u.lang` falls back to `en-US`, line
  133). It needs a `lang` option; nothing else on the site uses one.
- No fun game stores anything today. `settings.trivia` is new and must be
  named in `DEFAULTS.settings` or `migrate()` drops it.
- Free hue for the tile: `orchid`. Free icons: `trophy`, `clock`, `chart`.
  Free mascot mood: `think`.

## Human steps (the model cannot do these)
- A native Spanish speaker reads the `es` column of every file before the
  ship gate. Tick the table above per file.
- Try the Spanish voice on the family iPad and note which voice it found.

## Next session starts here
- Phase 4: write batches of 27 more per category per level (to 30), in the
  PLAN order. Write, run `node tools/triviacheck.mjs --file <cat>.json`, then
  `node tools/triviacheck.mjs --write` to update the manifest, then flip the
  tile meta in `screens/fun.js` (`FUN_GAMES`, now "162 questions") to the new total.
- Several seed `source` URLs were written from memory and not opened
  (Britannica blocks command-line fetches). Click them before the ship gate.
- Rebuild `CREDITS.md` after each batch (the node snippet used is in the git
  log for the commit that added it: group every `source` by host per category).
- Not yet tried on a real iPad or Safari: which Spanish voice is found.
- `smoke.js` has a trivia entry and two BACK rows; it was not pasted whole.
  A scripted trivia play-through ran in the browser pane instead (below).

## Decisions made while building (read before changing)
- The checker's stem-length rule: the plan's upper bounds are errors (Easy 9,
  Medium 15, Hard 25). Its lower bounds (Easy 5, Medium 8) would reject "Which
  is the largest continent?", so the hard floor is Easy 4, Medium 5, and
  shorter-than-nominal stems are only counted in the summary.
- A Spanish question needs a `¿` somewhere, not necessarily first: "Si es
  lunes, ¿qué día sigue?" is correct Spanish.
- True/false: at most max(1, 15% of the level) per file, so a seed of 3 may
  hold one.
- `buildRound` returns fewer than `count` when the pool is smaller, never a
  repeat. The checker proves a round of min(15, pool) at every level, topic
  and language.
- The tally and the "N right, N wrong" line count the fresh questions only;
  a second look earns a star but does not change the score line.
- After an answer the card is redrawn with its answered state (not patched),
  so the language flip redraws the same answered card in the other language.
- The setup's unseen counts come from the manifest and the saved ids, so the
  setup screen loads no question files (only last round's, for "Last time you
  learned"). Words and puzzles counts include both language pools.
- Physics floors (12/10/10/8/10 per topic tag) are enforced only once a level
  reaches 60 questions.

## Browser check, 2026-09-14 (tools/serve.py, CSP header present)
- Easy round of 5, two misses: feedback "Good try. It is Lava.", why shown,
  language flip redrew in Spanish with the answer kept, "One more look 1 of
  2" and "2 of 2" appeared, results with stars, ranks and "What I learned",
  memory saved (seen 5, recent 5, last 5), Fact Book "collected 5 of 48".
- No page errors. 375 wide: setup, game and Fact Book do not scroll sideways;
  the topic pills scroll inside their row. Dark and light both checked.

## Traps found while building (add as you go)
- A `<fieldset>` has a min-content minimum width, so an `overflow-x: auto`
  row inside one stretches the page instead of scrolling. `min-width: 0`.
- JavaScript `\b` is ASCII-only: `/Inglés\b/` never matches, and
  `/^¿Por qué\b/` failed every real stem. The checker uses Unicode lookarounds.
- "Argentina" is both a country and a feminine nationality; the lowercase
  rule leaves it out.
