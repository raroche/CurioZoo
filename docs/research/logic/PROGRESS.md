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
- [ ] Commit and merge the `offline-and-rooms` room layout (PLAN 2.1). Blocks Phase 0.
- [ ] Phase 0 — room shell and shared pieces
- [ ] Phase 1 — Crack the Code
- [ ] Phase 2 — Truth Island
- [ ] Phase 3 — Find the Rule
- [ ] Phase 4 — Zoo Bridges
- [ ] Phase 5 — Train Tracks
- [ ] Phase 6 — Robot Path
- [ ] Phase 7 — Fix the Bug
- [ ] Phase 8 — Daily, Endless, badge ladder, README, Spanish review list

## Facts checked (so nobody re-checks)
- Free room hue: `jade` (no room uses it; `mango` is the brand). Free
  creatures: `cat`, `mouse`. The plan uses jade + cat.
- `storage.js` DEFAULTS needs a `logic: {}` key or `migrate()` drops it.
- archcheck allows a room to `import()` its own files.
- The research files' numbers come from throwaway scripts the research agents
  ran (not committed). The pseudocode in each file reproduces them.

## Open questions
- Memory points (Trains h4) and "What if…?" (Bridges T8): keep only if a
  playtest with a 10–11-year-old says they feel like logic, not guessing.
- Spanish: *desvío* vs *cambio* for a train switch; all templates need a
  native read.
