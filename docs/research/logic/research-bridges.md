# Bridges (Hashiwokakero): design research

*Deep research for a bridge-building logic room on curiozoo.com (ages 6 to 13). Research date: 2026-10-02. Status: research only, nothing built. Numbers marked **computed** come from a throwaway prototype I wrote for this note: a ~250-line ES-module generator plus a graded solver, run on Node 24 on an Apple M4 Pro. It is not committed. Section 4 has its pseudocode, so the numbers can be reproduced.*

---

## 1. Rules, origin, naming

**Rules.** These are Nikoli's four, paraphrased ([Nikoli](https://www.nikoli.co.jp/en/puzzles/hashiwokakero/)):
1. Islands are circles holding a number from 1 to 8. Connect each island with exactly that many bridges.
2. Bridges run horizontally or vertically in a straight line between two islands. No more than two bridges can join the same pair.
3. Bridges cannot cross islands or other bridges.
4. When you finish, every island is linked into one connected group.

Loops are allowed. Simon Tatham's version has an optional "no loops" mode, and its "max bridges per direction" setting can be 1, 2, 3 or 4. Tatham notes that "fewer is easier" ([Tatham manual source, `puzzles.but`](https://raw.githubusercontent.com/ghewgill/puzzles/master/puzzles.but); [online game](https://www.chiark.greenend.org.uk/~sgtatham/puzzles/js/bridges.html)). A clean formal statement of the rules is in §1.1 of [Ykema 2025](https://theses.liacs.nl/pdf/2024-2025-IJkemaTTiemen.pdf).

**Origin.** Nikoli printed an early version in *Puzzle Communication Nikoli* #28 (Dec 1989) and the standard form in #31 (Sept 1990) ([Wikipedia](https://en.wikipedia.org/wiki/Hashiwokakero)). The inventor was a reader with the pen name "Lenin", who also created Slitherlink and Nurikabe ([puzzles.wiki](https://www.puzzles.wiki/wiki/Hashi)). *Hashi wo kakero* means "build bridges!". *The Times* calls it **Hashi**. Other names are **Bridges**, **Chopsticks** (a mistranslation: 箸 is also read *hashi*), and **Ai-Ki-Ai** in France, Denmark, the Netherlands and Belgium ([Wikipedia](https://en.wikipedia.org/wiki/Hashiwokakero)).

**Trademark and copyright.** I found no registration for "Hashiwokakero" or "Hashi". Conceptis sells "Hashi" apps with no ™ mark ([Conceptis rules page](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/hashi/rules)). Nikoli *does* hold and enforce "Sudoku" in Japan ([Automaton, 2023](https://automaton-media.com/en/news/20230830-21220/)), so leaning on Nikoli brand names is a real risk. Game rules and methods of play are not copyrightable, but rule *text* and artwork are ([US Copyright Office FL-108](https://webharvest.gov/peth04/20041015023438/http://www.copyright.gov/fls/fl108.html)). **Recommendation:** name the room **"Zoo Bridges" / "Puentes del zoo"**. "Bridges" is generic and is already used by Tatham and puzzle-bridges.com. Write our own rule text, and credit "a puzzle type first published by Nikoli (Japan, 1990)" in CREDITS. If we port any of Tatham's code, his MIT licence needs only the copyright notice kept ([LICENCE](https://raw.githubusercontent.com/ghewgill/puzzles/master/LICENCE)). The prototype shows a clean-room implementation is small, so we should simply write our own. This is not legal advice.

**Complexity.** Deciding whether a Hashi grid has *any* solution is NP-complete. The proof is a reduction from Hamiltonian cycle in unit-distance grid graphs (D. Andersson, "Hashiwokakero is NP-complete", *Information Processing Letters* 109(19):1145–1146, 2009, cited in [Wikipedia](https://en.wikipedia.org/wiki/Hashiwokakero)). Coelho, Laporte, Lindbeck & Vidal give an integer-programming branch-and-cut solver, a benchmark of 1,440 instances, and their own generator; they solve puzzles with up to 400 islands ([arXiv 1905.00973](https://arxiv.org/abs/1905.00973)). NP-completeness only matters in the worst case. On kid-sized grids, a deduction-only solver runs in well under a millisecond (§4).

---

## 2. Human techniques and a teaching ladder

Sources: the Conceptis techniques page (starting → basic → isolation → "advanced", where advanced means assumption-testing) ([Conceptis](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/hashi/techniques)); Wikipedia's solution-methods section; the "Just Enough Neighbor / One Unsolved Neighbor / Few Neighbor / Leftovers / Isolation" taxonomy of [Malik, Efendi & Pratiwi (EEI journal)](https://journal.beei.org/index.php/EEI/article/view/227); [Puzzle Genius](https://puzzlegenius.org/hashiwokakero/); and Ykema's formal treatment.

Ykema makes a useful point: almost every counting trick is one rule, the **degree-of-freedom** rule. Let *C* be the most bridges island *i* can still take in total, and *M_ij* the most it can share with neighbour *j*. Then *i* must share at least *M_ij − (C − n_i)* bridges with *j*. "4 in a corner", "3 in a corner", "6 with a 1 next to it" and the rest are all special cases of it (thesis §4.1, Theorem 1). The engine should implement this one general rule. **Kids should be taught the named special cases**, one per chapter, and the solver labels each deduction with the most specific name that fits.

| # | Kid name (EN / ES) | Logic | Classic examples | Engine tag | Level |
|---|---|---|---|---|---|
| T1 | **Full up!** / *¡Lleno!* | An island with all its bridges takes no more. Its other routes close. | Any satisfied island | `full`, `cap` | Easy ch.1 |
| T2 | **Only one friend** / *Un solo amigo* | If only one neighbour is reachable, every bridge goes there. | A 1 or 2 with one neighbour | `onlyNeighbour` | Easy ch.1–2 |
| T3 | **No crossing** / *Sin cruzar* | A placed bridge blocks every route that would cross it. Often that leaves an island with "only one friend". | — | `noCross` | Easy ch.2 |
| T4 | **Just enough** / *Justo lo necesario* | If the number equals the most the reachable neighbours can take, fill every route to the maximum. | 4 in a corner, 6 on an edge, 8 in the middle; a 3 next to a 1 and one other island | `justEnough` | Easy ch.3–4 |
| T5 | **At least one each way** / *Al menos uno a cada lado* | Number = capacity − 1, so every reachable direction needs at least one bridge. In general this is the degree-of-freedom bound. | 3 in a corner, 5 on an edge, 7 in the middle | `atLeastOne` | Easy ch.5+ / Medium |
| T6 | **Don't trap a pair** / *No encierres a dos* | Two 1s cannot join each other, and two 2s cannot take a double bridge, because the pair would be cut off from the rest. (Ykema Thm 2: two islands showing *m* share at most *m−1*.) | 1–1, 2=2 | `pairIsolation` | Medium ch.1 |
| T7 | **Keep the zoo together** / *Que nadie quede aislado* | (a) If a bridge would close a group that has no free bridge-ends left, it is not allowed. (b) A group with exactly one way out must use it. (c) If filling every *other* route would close a group, this route needs a bridge. | Conceptis "isolation" 1–4; Tatham stage 3 | `closedGroup`, `onlyExit`, `mustReachOut` | Medium ch.4+ / Hard |
| T8 | **What if…?** / *¿Y si…?* | Suppose one bridge choice and follow T1–T7 until something breaks. One level deep only, never nested. | Conceptis "advanced / recursive" | `whatIf` | Hard last chapters |

The owner's rule is "no guessing". T8 is a short proof by contradiction, not trial and error. Keep it in Hard only and present it as "what if?" reasoning, with the broken island shown. Puzzles that need deeper search are **rejected** by the generator.

---

## 3. How Simon Tatham's `bridges.c` generates and grades

I read the source ([mirror of `bridges.c`](https://raw.githubusercontent.com/ghewgill/puzzles/master/bridges.c); upstream is [chiark](https://www.chiark.greenend.org.uk/~sgtatham/puzzles/)). Bridges was contributed by James Harvey.

**Generation (`new_game_desc`) is grow, then grade, then retry:**
1. Put one island at a random cell.
2. Until reaching `islands%` of the cells, or 50 failures in a row: pick a random island and a random direction. Walk outward until you hit the edge, an island, or an existing bridge line. A new island can go anywhere from 2 cells away up to just before the obstacle. With probability `expansion%` it goes at the far end, otherwise at a uniform position. A spot right beside another island (perpendicular to the walk) is rejected. If loops are allowed and the walk reached an island, it may join that island instead. Join the pair with a random 1..`maxb` bridges.
3. Reject the grid unless islands touch all four borders.
4. Clues are the bridge totals. **The solver is the uniqueness check.** Every deduction it makes is sound, so if deduction alone completes the grid, the solution is unique. Reject the grid if it is solvable at `difficulty−1` (too easy) or not solvable at `difficulty` (too hard). Then retry from scratch.
5. Presets are 7×7, 10×10 and 15×15, each at Easy, Medium and Hard, with 30% islands, 10% expansion and max 2 bridges.

**Grading = which solver stage is needed:**
- *Stage 1 (Easy):* per-island counting. Mark a full island; fill when number = bridges + free space; place at least one bridge each way when `count > (nadj−1)·maxb`.
- *Stage 2 (Medium):* per-connection reasoning. If an island cannot be completed without a bridge in direction *d*, place one. (In no-loop mode, also drop routes that would close a loop.)
- *Stage 3 (Hard):* group reasoning. Try adding 1..k bridges on a route and cap it if that makes a closed sub-group or makes some island impossible. Also: "if maxing out every other neighbour would form an isolated subgraph, at least one bridge must go this way."
- Tatham's header comment suggests a cleaner rewrite. Use edges with **min/max bridge counts**, a crossing list per edge, and a union-find (dsf) of components that tracks the *liberties* (remaining bridge-ends) of each component. A merge that leaves zero liberties while not containing every island is forbidden. **Our solver should use exactly this data model.** The prototype does, and it fits in ~150 lines.

**Puzzle encoding.** Rows are scanned left to right. A digit is an island; the letters `a`–`z` mean runs of 1–26 empty cells. For example, `7x7:2a3a2e…`. This is compact and human-readable, so we should adopt it.

---

## 4. Our generator: algorithm, measured speed, pack vs device

### Pseudocode

```
generate({w,h,maxb,pct,expansion,targetLevel,islandRange}, rng):
  loop:
    islands = growTatham(w,h,pct,expansion,maxb,rng)          // §3 steps 1–3
    if count(islands) ∉ islandRange: continue
    if maxb==1 and any(n>4): continue
    G = buildGraph(islands)            // nearest neighbour right/down = edge; H×V crossing pairs
    r = solve(G, targetLevel)          // deduction only, records technique trace
    if !r.solved: continue             // ambiguous or needs deeper search
    if r.maxTech < targetLevel: continue   // too easy for this chapter
    return {G, trace:r.trace}

solve(G, L):   lo[e]=0, hi[e]=min(maxb, n_a, n_b)
  repeat until no change:
    contradiction checks (lo>hi, sumLo>n, sumHi<n)
    T1/T3: lo[e]>0 ⇒ hi[crossing]=0 ; hi[e]=min(hi[e], n−(sumLo−lo[e]))
    T2/T4/T5: lo[e]=max(lo[e], n−(sumHi−hi[e]))   // tag by open-neighbour count / sumHi==n
    L≥3  T6: equal clues m≤maxb on an edge ⇒ hi≤m−1 (if >2 islands)
    L≥4  T7: dsf over lo>0 edges with liberties; closedGroup / onlyExit / mustReachOut
    L≥5  T8: for each open edge try lo=hi or hi=lo, run L4 to a contradiction ⇒ the opposite
    always apply the lowest technique that makes progress (this gives a human-like trace)
```

### Measured (computed, mean of 30 accepted puzzles each)

| Config | ms per accepted puzzle | grids tried per accept | islands | encoded bytes |
|---|---|---|---|---|
| 5×5, max 1 bridge, T1–T4 | 0.1 | 2.7 | 6.7 | 17 |
| 6×6, T1–T4 | 0.1 | 3.9 | 8.5 | 20 |
| 7×7, needs T5 | 0.4 | 25 | 11 | 25 |
| 7×7, needs T6 | 1.5 | 112 | 12 | 27 |
| 10×10, needs T7 | 0.6 | 38 | 19.5 | 44 |
| 10×10, needs T8 | 10.2 | 237 | 20 | 45 |
| 13×13, needs T7 | 1.3 | 46 | 30 | 65 |
| 13×13, needs T8 | 12.8 | 141 | 30 | 65 |

- **iPad estimate:** Safari's JIT is perhaps 2–4× slower than an M4 Pro, so 7×7 takes ≤ 5 ms, 10×10 ≤ 40 ms and 13×13 ≤ 50 ms per puzzle. Running in a Web Worker is still the right call for batches and to keep the UI smooth, but even main-thread generation would not be noticeable.
- **What random grids need** (computed, 3,000 grids each). At 7×7: 46% solve with T1–T4, 8% need T5, 2.5% T6, 4% T7, 0.4% T8, and **38% cannot be finished by T1–T8**. At 13×13 the last figure rises to **61%**. These rejected grids are either ambiguous or need deep search, and are thrown away. T6 is rarely the *hardest* step on its own, so chapters that teach it should also accept puzzles where T6 *appears* in the trace, not only puzzles where it is the maximum.
- **Uniqueness check:** a brute-force solution counter agreed with the solver on all 200 solver-accepted 8×8 grids. On the 4-solution example in Ykema Fig. 5 it found 4 solutions, and the solver correctly failed.
- **Is there enough content?** (computed, counting distinct puzzles up to rotation and reflection.) The 5×5 max-1 space is small: **only ~300 distinct puzzles**, which is fine for a tutorial chapter. 6×6 max-1 gives ~5,300. 5×5 with doubles gives ~6,800, and 6×6 with doubles gives 34,000+. "Hundreds per level" is easy to reach.

### Recommendation: bundled pack plus seeded generation in a worker

- **Main path: a pre-generated pack.** A Node script (`tools/bridgesgen.mjs`, like the existing `*merge.mjs` tools) builds `data/bridges/pack.json`. It removes duplicates up to symmetry, brute-force checks uniqueness, records the technique trace, and sorts puzzles into chapters by technique, island count and trace length. CI then re-verifies the pack. **Measured:** 1,800 puzzles (600 per level, 5×5 to 13×13) were generated in **3.7 s**. As compact JSON (`["7x7:…", maxb, tech]`) that is **84 KB raw / 30 KB gzip (≈46 B per puzzle)**. A 900-puzzle launch pack is about 15 KB gzip. Benefits: the same puzzle for every child, reviewable, testable, and stable when the generator changes.
- **Extras: on-device generation from a seed** in `assets/js/workers/bridges.worker.js`, for "Endless" mode after a level is finished and for the **daily puzzle**. The seed is a hash of `YYYY-MM-DD` plus the level, run through mulberry32, which uses only integer arithmetic and is deterministic across engines. **Save the generated puzzle string in progress, not just the seed,** so a later generator change cannot rewrite history.

---

## 5. Adapting it for kids

**What existing apps do.** Conceptis *Hashi: Bridges* has 200 free hand-picked puzzles, draws bridges by swipe, offers unlimited undo, optional error warnings, "highlight allowed bridge directions", and a progress-preview gallery ([App Store](https://apps.apple.com/us/app/-/id567583852)). Its reviews mention confusion about how to place bridges ([AppFollow](https://apps.appfollow.io/ios/hashi-bridges/567583852?country=us)). puzzle-bridges.com supports **both drag and tapping between islands**, can grey out completed islands automatically, and has daily, weekly and monthly puzzles ([puzzle-bridges.com](https://www.puzzle-bridges.com/), [help](https://puzzles-mobile.com/partials/help.hashi.html)). In Tatham's version you drag only "far enough for the direction to be unambiguous". Dragging again adds a second bridge, dragging at the maximum removes them, right-drag marks "no bridge", clicking an island locks it, and the keyboard uses cursor keys plus Enter or Space ([manual](https://raw.githubusercontent.com/ghewgill/puzzles/master/puzzles.but)). The Android port adds pinch-zoom and on-screen arrows ([F-Droid](https://f-droid.org/packages/name.boyle.chris.sgtpuzzles/)). *Good Sudoku* is the model for technique-aware hints: its solver reads your board, points to the next technique, and lists which techniques each difficulty needs ([Pocket Gamer](https://www.pocketgamer.com/articles/083617/good-sudoku-aims-to-achieve-the-impossible-by-teaching-me-how-to-play-and-enjoy-sudoku/)). I found no Bridges app made for young children, so this is open ground.

**Interaction (recommended):**
- **Tap the water between two islands** to cycle bridges 0 → 1 → 2 → 0. In max-1 chapters it simply toggles. The tap target is the whole gap, padded to a full cell width, which is much easier for 6-year-olds than precise dragging.
- **Drag from an island** toward a neighbour as a second way to add a bridge, using Tatham's "far enough" threshold. Use one pointer-events handler with `setPointerCapture` (same pattern as the chess board).
- **Keyboard:** arrow keys move focus to the nearest island in that direction. Enter + arrow adds a bridge, Backspace + arrow removes one, and Z / Shift+Z undo and redo. Each island is a focusable SVG `<g role="button">` with an `aria-label` such as "Lion island, needs 3, has 2". An `aria-live="polite"` region announces each change.
- **"No bridge" marker** (long-press or right-click puts a small buoy ✕ on the water). Turn it on from Medium; it is useful for T6/T7 thinking.
- **Unlimited undo and redo, plus restart.** There is no fail state and no timer.

**Showing clues for the youngest players.** Easy chapters 1–3 use **dot pips like dice** inside the island, with numbers 1–4 only (max-1 bridges). Children perceive 1–4 dots at a glance without counting, and arrangements of 5–8 are recognised as smaller groups ("four and two") from about age 5–6. Rectangular layouts are the easiest to read ([summary of Clements 1999](https://www.monstermath.app/blog/what-is-subitizing-guide)). Later Easy chapters show the pips plus a small numeral, and Medium and Hard show numerals with pips as an option. Each island is an enclosure with an animal face, used for identity and the aria name. The animal is never *the* clue.

**Satisfied state, never colour alone.** Each island has a ring of N notches, and each bridge-end fills one, a bit like a progress meter. When the island is full the ring closes, a ✓ badge appears, and the animal smiles (static under `prefers-reduced-motion`). Too many bridges shows a "!" badge and a dashed outline. A crossing attempt is refused with a gentle shake (in reduced motion, a brief outline instead) and a one-line reason. These cues use shape and glyph, so they meet [WCAG 1.4.1 Use of Color](https://www.w3.org/WAI/WCAG21/Understanding/use-of-color.html).

**Error-checking modes** (a parent or kid toggle; defaults by level):
- *Helper* (Easy default): flags rule breaks immediately. That means over-full islands, crossings, and **closed groups**, which Tatham also flags: a cut-off group lights up as "this group can't reach the others". It never flags a bridge that is legal but wrong, because that would give away the answer.
- *Quiet* (Medium and Hard default): flags over-full islands only.
- *Check* button: reports "2 bridges don't belong" and asks "show me?". Revealing them counts as a hint.

**Hints show the next deducible step, with its reason.** (1) If any player bridge contradicts the unique solution, the hint first says "this bridge doesn't fit". (2) Otherwise, set `lo` from the player's bridges and run the solver one step, applying the lowest technique that adds something the player hasn't placed. The hint then escalates: first it highlights the island and names the technique, then it gives the reason as a filled-in template (for example: "The giraffe needs 4 and has only 2 neighbours, so both get 2 bridges"), and only then places the bridge. **After solving**, show "Why it worked": the techniques used, with counts and any *new* one starred, and a replay of the single hardest step from the trace.

---

## 6. Engagement and progression

**Structure.** Each level has 10 chapters × 30 puzzles = **300 bundled puzzles per level (900 in total)**, plus Endless and Daily. Each chapter opens with a **micro-lesson**: a 3–4 island board on which only the new technique works. A paw-pointer demonstrates it once, then the child does two guided versions, and the trace confirms they used it. The ladder in §2 maps to chapters:

| Level | Grids | Islands | Bridges | Chapters (new technique) |
|---|---|---|---|---|
| Easy 6–8 | 5×5 → 7×7 | 4–12 | max 1 for ch.1–3, then doubles | 1 Only one friend · 2 Full up + No crossing · 3 Count the pips (mixed) · 4 Double bridges · 5 Just enough (4 in corner) · 6 Just enough (6 on edge, 8) · 7 Mixed · 8 At least one (3 in corner) · 9–10 Mixed review |
| Medium 8–10 | 7×7 → 10×10 | 10–20 | max 2 | 1 Don't trap a pair · 2 At least one (5, 7) · 3 Mixed · 4 Keep the zoo together (only exit) · 5 Closed group · 6–10 mixed, growing size |
| Hard 10–13 | 10×10 → 13×13 | 18–32 | max 2 | 1–3 Keep together (reach out) at scale · 4–5 Dense grids · 6 What if…? · 7–10 mixed, longest traces |

Within a chapter, sort puzzles by (number of steps in the trace, island count). Unlock the next chapter at 20 of 30 solved, so a child can skip a few that frustrate them.

**Phones.** The rules are unchanged if the grid is **transposed** (rows and columns swapped). So render the puzzle transposed whenever that fits the screen better: 13×9 on an iPad in landscape becomes 9×13 in phone portrait, giving ~38 px cells at 375 px width. Islands are always at least 2 cells apart, so each gap's tap target easily meets [WCAG 2.2's 24 px minimum target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).

**Stars (they only go up).** ★ for a solve, ★★ for a solve with at most 1 hint, ★★★ for no hints and no Check-reveal. Replays can raise a puzzle's stars but never lower them.

**Daily puzzle.** Generated from a seed (§4). Its size matches the child's current level, and finishing it adds to a "visits" streak shown as footprints. Missing a day never resets anything visible.

**Collection.** Each chapter is a **habitat archipelago** (savanna, arctic, rainforest, reef, desert, mountains…). Every solved puzzle "lets an animal visit", and that animal goes into the **Zoo Map** sticker book. A chapter finished with all ★★★ unlocks a golden or night-time variant of its habitat. Each new technique earns a **badge card** (EN/ES), which the child can reopen at any time to replay its micro-lesson. Hook it into the shared `celebrate.js` module for consistency with the other rooms.

---

## 7. Data model

```jsonc
// data/bridges/pack.json  (v = schema version)
{ "v": 1,
  "levels": { "easy": { "chapters": [
     { "id": "e01", "tech": "onlyNeighbour", "habitat": "savanna", "maxb": 1,
       "lesson": "l-onlyNeighbour",
       "puzzles": [ ["5x5:2a3a2e2i2a3a2", 1, 9], ... ] }   // [grid, maxTech, traceSteps]
  ] }, "medium": {...}, "hard": {...} },
  "lessons": { "l-onlyNeighbour": { "g": "3x3:1a2e1", "script": ["tapGap:0", "..."] } } }
```
The solution is not stored, because the solver rebuilds it in under 1 ms. A test proves that every pack entry solves uniquely.

```jsonc
// localStorage "cz.bridges.v1"
{ "v": 1, "level": "easy",
  "solved": { "e01-07": { "s": 3, "h": 0 } },          // stars, best (fewest) hints
  "chapter": { "easy": "e03" },
  "learned": ["onlyNeighbour", "full", "noCross"],
  "current": { "id": "e03-04", "b": "0102001…", "marks": "…" }, // bridges per edge in edge order (base-3 digits)
  "daily": { "2026-10-02": { "g": "7x7:…", "s": 2 } },
  "zoo": ["lion", "zebra"], "settings": { "check": "helper", "pips": true } }
```

---

## 8. Modules, tests, art

**Modules.** These follow the existing `assets/js/rooms/<room>/` layout (`room.js`, `screens.html`, `room.css`).
- `rooms/bridges/logic/graph.js` is pure and DOM-free: parse and encode, edges, the crossing table, and transpose.
- `rules.js` validates a state: over-full islands, crossings, closed groups, and whether the puzzle is solved.
- `solver.js` holds the lo/hi plus dsf engine. Each technique returns `{tech, island, edge, change, params}` for its trace step.
- `generator.js` holds the grow-and-grade loop. `rng.js` is mulberry32 plus a date hash.
- `hints.js` turns a player state into the next step and an i18n template key.
- `bridges.js` is the SVG screen.
- `lesson.js` is the scripted micro-lessons.
- `workers/bridges.worker.js` generates the daily puzzle and Endless mode.
- `tools/bridgesgen.mjs` builds the pack, and `tools/bridgescheck.mjs` is the CI verifier, the same pattern as `teaserscheck.mjs` / `chesscheck.mjs`.

**Unit tests** (add to `tools/tests/`):
- Encoding round-trips.
- Edge and crossing construction on hand-made grids.
- **One minimal fixture per technique**, asserting that exactly that tag fires (4 in a corner, 3 in a corner, 1–1, 2=2, only exit, closed group, reach out, what-if).
- Solver soundness: on 1,000 random puzzles, every deduction agrees with the brute-force unique solution.
- Monotone grading: solvable at L implies solvable at L+1.
- Transposition invariance of both the solution and the technique level.
- Generator determinism: golden strings for fixed seeds.
- Pack checks: every entry unique, chapter technique present in the trace, no duplicates up to symmetry, grid size within level bounds.
- Hints from random partial states are always consistent with the solution, and a wrong bridge is always the first thing reported.
- Rules flag closed groups.
- Progress: stars never decrease, and a v0 → v1 migration test.
- An EN/ES key-parity check for all technique and hint templates.

**Art (SVG drawn in code, a `<symbol>` sprite, no images):**
- An island disc with a habitat rim and a notch ring for 1–8.
- Pip layouts for 1–8.
- 12–16 geometric animal faces (lion, zebra, giraffe, elephant, hippo, penguin, seal, polar bear, monkey, toucan, frog, turtle, flamingo, camel…), each with happy and neutral states.
- Single and double plank bridges, horizontal and vertical.
- The "no bridge" buoy.
- A water pattern, static under reduced motion.
- ✓ and ! badges.
- The hint highlight (dashed ring plus arrow) and the focus ring.
- Habitat tiles for the Zoo Map, stars, and technique badge cards.
- All colours as CSS tokens for light and dark themes. Attributes are set only with `setAttribute`, never with `style=""`.

---

## 9. Open questions

- Check whether ages 6–7 handle double bridges; the micro-lesson could include a "two planks" step. Run a playtest before fixing chapter 4's position.
- Confirm that "What if…?" feels like logic, not guessing, to 11-year-olds. If it doesn't, drop T8 and replace it with larger T7 puzzles.
- Have a native speaker review the Spanish technique names (owed for the other rooms too).

---

### Sources
25 distinct source URLs are linked inline above: Nikoli, Wikipedia, puzzles.wiki, Conceptis (techniques, rules, app), Tatham (source, manual, licence, game), Ykema 2025, Coelho et al. 2019, Andersson 2009, Malik et al., Puzzle Genius, puzzle-bridges.com, F-Droid, Good Sudoku, US Copyright Office, Automaton, W3C WCAG, and a summary of Clements 1999.
