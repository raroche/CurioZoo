# Crack the Code: design research

*Deep research for a code-breaking logic room on curiozoo.com (ages 6 to 13). Status: research only, nothing built. All numbers marked "computed" come from scripts I ran for this note (brute force over every code). They are reproducible from the pseudocode in section 6.*

---

## 1. Family tree and naming

- **Bulls and Cows** is the ancestor. It is a pencil-and-paper game: guess a 4-digit number with no repeated digits, then get told how many "bulls" (right digit, right place) and "cows" (right digit, wrong place). It is folk and public domain, and it predates Mastermind by decades. Frank King's computer version **MOO** ran at Cambridge before summer 1970. With optimal play any secret falls in at most 7 guesses, and the average is 26274/5040 ≈ 5.21 ([Wikipedia: Bulls and cows](https://en.wikipedia.org/wiki/Bulls_and_cows)). Spanish-speaking kids know it as **Picas y Fijas** or **Toros y Vacas** ([CheckiO ES](https://py.checkio.org/es/mission/bulls-and-cows/), [laps4](https://www.laps4.com/preguntas-y-respuestas/como-se-juega-picas-y-fijas)). **Pico-Fermi-Bagels** is the 3-digit classroom version. Its clue words are listed in alphabetical order on purpose, so they do not reveal which digit they refer to ([Big Book of Small Python Projects](https://inventwithpython.com/bigbookpython/project1.html)).
- **Mastermind** was invented in 1970 by Mordecai Meirowitz, and Invicta Plastics released it in 1971–72 ([Wikipedia: Mastermind](https://en.wikipedia.org/wiki/Mastermind_(board_game))). Classic rules: 4 holes, 6 colours, repeats allowed (1,296 codes), with black/white key pegs that count matches but do not say which peg matched. Official variants include **Super Mastermind** (5×8), **Word Mastermind** (1972), **Mini Mastermind** (1976, 6 guesses) and **Mastermind for Kids** (1996). Mastermind for Kids is the closest precedent to this room: **3 holes, 6 colours of jungle animals, repeats allowed, ages 6+**, with red/white "creature" scoring pegs ([official rules](https://officialgamerules.org/game-rules/mastermind-for-kids/), [Goliath product page](https://www.goliathgames.us/product/mastermind-for-kids/)).
- **Number Mind** ([Project Euler 185](https://projecteuler.net/problem=185)) only reports *how many digits are in the right place*, never the misplaced ones. Its puzzle is a fixed list of guesses whose clues fit exactly one secret, which is the same "deduce from given clues" format recommended below.
- **Jotto (1955) → Lingo → Wordle (2021).** Wordle's leap was **per-position feedback**: each tile tells you about *that* letter ([Wikipedia: Wordle](https://en.wikipedia.org/wiki/Wordle)). **Hard mode** forces every revealed hint to be reused, so greens stay put and yellows must appear again ([Mental Floss](https://www.mentalfloss.com/posts/wordle-hard-mode-how-it-works)).
- **Black Box** (Eric Solomon, 1976) is a cousin: hidden atoms are found by firing rays into the board. It belongs to the same "probe and deduce" family, but its spatial rules are harder to explain to 6-year-olds ([Wikipedia: Black Box](https://en.wikipedia.org/wiki/Black_Box_(game))). It would make a good later room.

**Why per-position feedback is easier for children.** Aggregate pegs ("2 right, 1 misplaced") are a *disjunction*: *which* two? The player has to keep several possible worlds in mind at once and reason by cases. Per-position feedback turns every clue into plain facts ("fox is not in spot 1", "owl is in spot 3"), which needs no branching. The Deductive Mastermind research in section 2 measures exactly this effect.

**Trademark: confirmed, do not use the name "Mastermind".** Rights have been held by Invicta since 1971, with manufacture licensed to Hasbro and, from 2025, Goliath ([Wikipedia](https://en.wikipedia.org/wiki/Mastermind_(board_game)), [Popverse](https://www.thepopverse.com/gaming-hasbro-license-mastermind-goliath-games/)). Pressman (Goliath since 2014) holds US registration **1,002,896 MASTERMIND**, Class 28, for a "hidden number parlor game". It was registered in 1975 and has been renewed ([Justia trademark record](https://trademarks.justia.com/730/04/mastermind-73004936.html)). **Pressman actively enforces the mark against free web versions.** In 2011 its counsel sent a cease-and-desist to a hobbyist's online Mastermind page, demanding removal of the name *and the game play* ([degraeve.com, letter reproduced](https://www.degraeve.com/mastermind/)). GNOME's developers raised the same mark for a computer game in 2007 ([GNOME legal-list](https://mail.gnome.org/archives/legal-list/2007-July/msg00000.html)). The game mechanic itself is old folk play (Bulls and Cows) and is not protected by trademark. This is not legal advice. Also avoid "Wordle" (NYT), "Mente Maestra", and the black/white key-peg trade dress. **Use "Crack the Code" / "Descifra el código"**, which is a generic phrase. Calling it "a Bulls-and-Cows-style game" in parent copy is fine.

---

## 2. What research says about children and this game

- **Math Garden's "Flowercode" is the strongest precedent, and it is huge.** Gierasimczuk, van der Maas & Raijmakers built *Deductive Mastermind*: the child does **not** invent guesses. They are shown rows of guesses with feedback, built so that **exactly one code fits**, and they must deduce it. In about 14 months, 28,247 pupils aged 6–12 played 2.19 million items. There were 321 items, with codes of 1–5 flowers and 2–5 flower types. Feedback was one dot per flower: green for right place, orange for wrong place, red for not in the code. **The dots were unordered**, which makes it aggregate feedback. The authors found that simple surface features (length, number of colours, number of clues) mis-ranked difficulty and left "gaps in difficulty" ([Gierasimczuk et al., CEUR-WS 883](https://ceur-ws.org/Vol-883/paper1.pdf); journal version: [J. Logic, Language & Information 2013](https://dl.acm.org/doi/abs/10.1007/s10849-013-9177-5)).
- **Feedback type predicts difficulty better than anything else.** With 355 items rated by more than 200,000 Dutch pupils, the basics (number of flowers, number of clues, whether every flower type appears) explained only **27%** of variance in Elo difficulty. Models that weight *each feedback type's* informational content explained **63–67%** ([Zhao, van de Pol, Raijmakers & Szymanik, CogSci 2018](https://www.jakubszymanik.com/newwebsite/wp-content/uploads/2018/06/zhao_etal_cogsci18.pdf)). For 2-flower items the order from easy to hard was **both-wrong-place < both-absent < one-right+one-absent < one-wrong-place+one-absent**. Clues that force reasoning by cases (a disjunction) are the hard ones. A clue whose symbols are *never* shown, so the answer must be inferred by elimination, adds another step (Gierasimczuk Fig. 4). **This becomes our difficulty model** (section 5).
- **Strategy and science reasoning.** Middle-schoolers who discovered complex Mastermind strategies scored higher on scientific reasoning ([Quillien et al., APS 2017](https://www.psychologicalscience.org/conventions/archive/2017annual/paper/6498/)). A Piagetian study of 60 children aged 7–12 found 55% stuck at the lowest strategy level ([Macedo et al., 2003, Psicologia Escolar e Educacional](https://scielo.br/j/pee/a/cBdfCYvp9x7ZxfYRcjNQdpH/abstract/?lang=en)). The lesson: **kids do not discover deduction alone. Scaffold it.** Mastermind has also been proposed in education psychology as a way to learn that trial and error rarely pays ([Hogrefe EJPA, 2023](https://econtent.hogrefe.com/doi/10.1027/1015-5759/a000855); [ResearchGate](https://www.researchgate.net/publication/369139689_Is_it_Just_a_Game_Development_and_Validation_of_a_Deductive_Version_of_Mastermind_as_Measure_of_Reasoning_Ability)).
- **Combinatorial reasoning.** Systematically enumerating every combination is a hallmark of Inhelder & Piaget's formal-operational stage, which emerges around 11–12 ([*The Growth of Logical Thinking*, 1958](https://www.routledge.com/The-Growth-Of-Logical-Thinking-From-Childhood-To-Adolescence-AN-ESSAY-ON/iaget-Inhelder-Brbel/p/book/9780415864442); [IASE ch. 18](https://www.stat.auckland.ac.nz/~iase/publications/assessbk/chapter18.pdf)). That matches the split: no case-splitting before Hard (10–13).
- **Complexity.** Deciding whether *any* code fits a set of aggregate clues is NP-complete ([Stuckman & Zhang 2005](https://arxiv.org/abs/cs/0512049)). For kid-sized boards (6,720 codes or fewer) brute force is instant, so the generator can be exact.
- **Notes and offloading.** Berry, Allen, Mon-Williams & Waterman (N = 166) found that **structuring the environment helped children with low working memory, but those children did not choose the structured layout when allowed to** ([Cognitive Science 2019, accepted MS](https://eprints.whiterose.ac.uk/id/eprint/146506/1/Cognitive%20offloading%20in%20WM_CogSci_accepted_21May2019.pdf)). So **the app should supply the structure**: a ready-made possibility grid, not a blank notepad. One caution: 10–11-year-olds who expect an external aid encode less internally ([Sci. Reports 2026](https://www.nature.com/articles/s41598-026-44574-6)). So the grid fills itself in Easy and is filled by the child in Medium and Hard.

---

## 3. The math (computed)

Search space: n positions × k symbols gives **kⁿ codes with repeats**, or **k!/(k−n)! without**.

| Board | Codes | Minimax avg / worst: per-spot | Middle* | Aggregate | Random-but-consistent avg (agg/spot) | Blind guessing avg |
|---|---|---|---|---|---|---|
| 3×4 no-rep | 24 | 2.25 / 3 | – | 3.00 / 4 | 2.24 (spot) | 12.5 |
| 3×5 no-rep | 60 | 2.60 / 3 | 2.90 / 4 | 3.35 / 4 | 2.58 (spot) | 30.5 |
| 3×6 no-rep | 120 | 2.98 / 4 | – | 3.75 / 5 | 2.96 (spot) | 60.5 |
| 4×6 no-rep | 360 | 2.96 / 4 | 3.37 / 5 | 4.14 / 5 | 4.14 (agg) | 180.5 |
| 4×6 rep (classic) | 1,296 | 3.30 / 4 | 4.03 / 5 | **4.48 / 5** | 4.63 (agg) | 648.5 |
| 4×8 no-rep | 1,680 | 3.42 / 5 | 4.22 / 6 | 4.79 / 6 | 4.88 (agg) | 840.5 |

\*Middle = a "right spot" mark under each slot, plus only a *count* of misplaced symbols.

- The aggregate classic row reproduces **Knuth's 1977 result**: a 5-guess worst case, average about 4.476, opening with 1122 ([Knuth, J. Recreational Math 9(1)](https://archive.org/download/pdfy-4zbExU0jr9Y81AAs/knuth-mastermind_text.pdf)). The true optimum is 5625/1296 ≈ **4.340** ([Koyama & Lai 1993, via Wikipedia](https://en.wikipedia.org/wiki/Mastermind_(board_game))). This validates the scorer.
- **Key design finding:** a child who simply *always makes a guess consistent with every clue so far* scores **within about 0.1–0.2 guesses of minimax**. A child who ignores clues needs 12 to 840 guesses. **The skill worth teaching and rewarding is consistency, not optimal guess choice.** Stars should measure "smart guesses", not raw guess count against Knuth.
- Free play on small Easy boards finishes in 2–3 guesses, and a 1-in-24 lucky first guess is common. That is why **clue puzzles must be the main mode**, with free play as the "boss round".

**Pool size (computed by sampling).** A puzzle is a secret plus *m* guesses whose clues leave exactly one code and are **minimal** (drop any clue and the answer is no longer unique). "Propagation-solvable" means one clue at a time is enough to solve it, with no case splits.

| Chapter board | Clues | Est. distinct minimal puzzles | Propagation-solvable |
|---|---|---|---|
| 3×4 spot | 2 | ~650 | 100% |
| 3×5 spot | 2 | ~58,000 | 100% |
| 3×6 spot | 3 | ~2.5 million | 100% |
| 4×6 middle | 3–4 | 3×10⁸ – 5×10⁹ | 90–94% |
| 4×6 aggregate | 4–5 | 3×10¹⁰ – 2.5×10¹¹ | 40–50% |
| 3×10 digits agg ("682" lock) | 5 | ~5×10¹³ | 72% |
| 4×8 agg / 4×6 rep agg | 5 | ~10¹⁵ | 27% |

Multiply by the choice of animal cast: 4 animals from a roster of 12 gives 495 casts, or 6 of 12 gives 924. **Every chapter beyond the first has more puzzles than a child could finish in a lifetime.** Only the 2-clue 3×4 warm-up is small, and it is a 20-puzzle tutorial anyway. The famous meme puzzle ("682: one number is correct and well placed…" → **042**; [Interesting Engineering](https://interestingengineering.com/solve-the-open-the-lock-puzzle-that-has-internet-puzzled), [hakank solver](https://hakank.org/cpmpy/number_lock.py)) is simply a 3×10 aggregate puzzle with 5 clues. Our generator produces that genre in endless supply.

---

## 4. Modes, levels and progression

**Three modes**, all on the same board:

1. **Clue Safe (main, about 70% of play).** Given clues → deduce the unique code. This is pure logic: no luck and no wasted guesses. Wrong submissions are allowed and never cost stars. The mascot says which clue the answer breaks.
2. **Could it be? (warm-up / mini-game).** Clues plus one candidate code. The child taps **Could be / Can't be**. Impossible candidates are *near misses* that break exactly one clue, and the "why" names that clue. This drills the consistency skill directly, and it is the best Easy activity for pre-readers.
3. **Free crack (boss round per chapter, plus the Daily Code).** Classic play against a hidden code. A **consistency checker** (Wordle hard mode as *advice*, not a rule) lights a gentle "detective note" when a guess ignores known facts. Easy shows it *before* submitting ("The 🦊 was home in spot 1 — keep it?"), with a **Try anyway** option. Medium shows it after the guess. Hard makes it optional ("Detective mode"). Never forbid an inconsistent guess, because minimax sometimes *should* play one.

**Feedback by level (recommendation):**
- **Easy, per-spot.** Each slot is a zoo *enclosure*. Under each animal: **"home!"** (in its spot), **"wrong home"** (in the code, other spot), **"not here today"** (absent). Never use repeats: Wordle's duplicate-letter rule confuses adults, let alone 6-year-olds.
- **Medium, a bridge in two steps.** (a) the *middle* scheme above, where right-spot is still marked per slot and misplaced is just a count; then (b) aggregate on **3 slots**, which Math Garden shows 6–12-year-olds handle when codes are short.
- **Hard, aggregate (Bulls and Cows).** Markers are sorted (all "home" first), as in Bagels. Repeats only arrive in the last chapter.

**Chapters** (each chapter is 30–60 puzzles plus a boss, then repeatable forever at a higher tier):

| Level | Ch | Board | Feedback | Clues | Tier focus |
|---|---|---|---|---|---|
| Easy 6–8 | 1 | 2×3 → 3×4 | spot | 1–2 | T1 |
| | 2 | 3×5 | spot | 2–3 | T1–T2 |
| | 3 | 3×6 | spot | 3 | T2, "missing animal" |
| | 4 | 4×6 | spot | 3–4 | T2 |
| Medium 8–10 | 1 | 4×6 | middle | 3–4 | T2 |
| | 2 | 3×6 | aggregate | 3–4 | T2–T3 |
| | 3 | 4×6 | aggregate | 4–5 | T3 |
| | 4 | 3×10 digit lock | aggregate | 4–5 | T3 ("682" genre) |
| Hard 10–13 | 1 | 4×6 | aggregate | 5 | T3–T4 |
| | 2 | 4×8 | aggregate | 5–6 | T4 |
| | 3 | 4×10 digits (Bulls & Cows) | aggregate | 5–6 | T4 |
| | 4 | 4×6 **with repeats** | aggregate | 5–7 | T4 |

**Endless after chapter 4.** "Expedition" puzzles are drawn from all chapters, weighted toward the child's weakest tier (like Math Garden's adaptive selection, but local and private).

**Zoo collection.** Every enclosure has a **safe** with a 3–5 symbol lock. Cracking 10 safes in a chapter "opens" an enclosure and adds that animal (with a fact card) to the child's zoo map. Stars only add up and nothing is lost. **Daily Code**: seed = local date `YYYY-MM-DD` hashed with a fixed salt, which gives the same puzzle for every child with no server. There is one per level, and solving it stamps a calendar. Missing a day erases nothing; there are no streaks.

**Stars per puzzle**, kept at the best result ever:
- ★ cracked.
- ★★ cracked with no hint.
- ★★★ cracked with no hint and *every guess consistent* (free play), or first submission correct (clue mode).

Optionally, Hard shows "Owl needed 4" (the minimax bound) as trivia, never as a score.

---

## 5. Difficulty grading and hints (one engine)

A **human-style solver** applies rules in order of cognitive cost. The *highest rule needed* is the **tier**, and the *number of steps* breaks ties within a tier. The rule order follows the Gierasimczuk/Zhao finding that feedback type drives difficulty.

| Rule | Statement (state = position×symbol possibility grid + "must include" set) | Tier |
|---|---|---|
| R1 absent | A "not here" mark, or an aggregate clue scoring 0, removes that symbol everywhere | T1 |
| R2 home | A per-spot "home" fixes the symbol in that slot | T1 |
| R3 wrong-home | Removes the symbol from that slot and adds it to must-include | T1 |
| R4 last place | A must-include symbol has one slot left, so place it | T2 |
| R5 last animal | A slot has one symbol left (or a symbol never appearing in clues is forced, the "missing animal") | T2 |
| R6 count saturation | An aggregate clue's known hits already equal its score, so its other symbols are out (or: its unknowns must all be in) | T3 |
| R7 one case split | "If 🦁 were in slot 2, clue C would need 2 homes but can have at most 1, so it is not" | T4 |
| R8 deeper split | Two-level case analysis | T4+ (Hard only, rare) |

R1–R6 are per-clue generalized arc consistency on the grid. In my sampling, 100% of spot-feedback minimal puzzles and 90%+ of middle puzzles fall to these rules alone, so Easy and Medium never need R7.

**Hint = the next rule firing**, in three tiers:
1. "Look at clue 3 👀"
2. The sentence: "🦊 can't be in spot 1 — clue 3 says 'wrong home'."
3. Apply it to the grid with a short animation (or a static cross-out when reduced motion is on).

The **after-round "why"** replays the solver's chain as 2–4 sentences. For free play, the why lists the first inconsistent guess, if any, and the fact it ignored.

---

## 6. Algorithms (pseudocode, DOM-free module `assets/js/modules/codelogic.js`)

```js
// score: per-spot uses Wordle's duplicate rule (exact first, then left-to-right misplaced)
spotFeedback(g, c) -> ['home'|'wrong'|'none', ...]
aggFeedback(g, c)  -> { home: b, wrong: w }          // b = exact; w = Σ min(cnt_g, cnt_c) − b
midFeedback(g, c)  -> { marks: [...home|blank], wrong: w }

allCodes(n, k, repeats)                                // ≤ 6,720: enumerate once, cache
consistent(code, clues, mode) = clues.every(c => eq(score(c.guess, code, mode), c.fb))
countSolutions(clues, cfg, cap = 2)                    // early exit at 2 → uniqueness

function makeCluePuzzle(cfg, rng, wantTier):
  repeat up to 200:
    secret = randomCode(cfg, rng); S = allCodes(cfg); clues = []
    while |S| > 1 and clues.length < cfg.maxClues:
      // try ~40 random guesses ≠ secret; score each by:
      //   shrink = |S| / |S'| (want 1.5–4, not instant collapse),
      //   feedback-type weight matching wantTier (e.g. T1 likes 'none'/'home' clues),
      //   penalty if a symbol is never shown (unless tier wants 'missing animal')
      g = best; clues.push({guess: g, fb: score(g, secret)}); S = filter(S, consistent)
    if |S| != 1: continue
    clues = minimize(clues)                // drop any clue whose removal keeps |S| = 1
    grade = humanSolve(cfg, clues)         // {tier, steps, chain}
    if grade.solved and grade.tier == wantTier: return {cfg, secret, clues, grade}
  fall back to closest tier found
```

**Could-it-be generator:** take a puzzle, then with p = 0.5 return the secret or another consistent code ("could be"). Otherwise mutate the secret by one swap or one substitution until exactly one clue is violated ("can't be", why = that clue).

**Determinism:** `puzzle(level, chapter, index)` = `makeCluePuzzle(cfg, mulberry32(hash(level, chapter, index)))`. Nothing is stored except counters. The same index always gives the same puzzle, so tests and sharing ("Safe #412") work.

**Performance:** the worst board (4×10 digits, 5,040 codes; 4×8 no-rep, 1,680) times 40 candidates times 6 clues is about 1M feedback evaluations. That is milliseconds, and a Web Worker is not needed. The solver's R7 enumerates at most k×n hypotheses, each checked with R1–R6.

---

## 7. Board, UX and accessibility (iPad 1024×768 landscape first)

- **Layout (landscape).** The left two-thirds holds the **clue rows**, newest at the bottom on a "safe door" panel, with the **answer row** (lock dials) under them. The right third holds the **possibility grid** (slots × animals) and the **animal tray**. Portrait/phone (375px): the tray becomes a bottom sheet and the grid collapses behind a "Notes 📝" toggle. Slots are at least 64px on iPad and 48px on phone.
- **Input.** Tap an animal in the tray to fill the *next empty slot*, or tap a slot first and then an animal. Tap a filled slot to clear it. **Undo** (one level, plus a "clear row" button). Drag and drop is an optional extra only. Keyboard: digits 1–9 pick a tray animal, ←/→ move the slot focus, Backspace clears, Enter submits. Tray order is stable and labelled.
- **Possibility grid.** Tap a cell to cross it out (✕ glyph plus diagonal hatch), and tap again to restore. In Easy, **Helper Owl auto-crosses** after each clue, which supplies the structure Berry et al. say low-WM kids need but won't choose. In Medium and Hard the child crosses cells out, and a **"Check my notes"** button flags any cell crossed out *wrongly* with a ⚠ shape and text, never with colour alone.
- **Markers must not rely on colour (WCAG 1.4.1).** Wordle's green/yellow failure is the cautionary tale ([Fischer](https://billfischer.substack.com/p/these-2-wordle-colors-undermine-color), [MDN: Use of color](https://developer.mozilla.org/docs/Web/Accessibility/Understanding_WCAG/Perceivable/Use_of_color)).
  - **home** = solid circle with a paw print
  - **wrong home** = hollow ring with a ↔ arrow
  - **not here** = small flat dash

  Each marker also has its own colour token and an `aria-label` / visually hidden text ("Row 2: fox home, owl wrong home, frog not here").
- **Code symbols are animals.** Their silhouettes (fox, owl, frog, panda, lion, penguin, elephant, turtle, giraffe, zebra, octopus, parrot) differ *by shape first*. Colour is a second cue, with a pattern band (stripes/dots) as a third. They are drawn as inline SVG `<symbol>` sprites in a JS module (CSP: no `style=""`; fills via CSS classes and custom properties, themed for light/dark). The digit-lock chapters reuse the same tiles with numerals.
- **Motion.** A dial-spin on submit and a safe-door swing on success use `celebrate.js`. Under `prefers-reduced-motion`, swap to an instant state change and a static badge.
- **No timer, no lives.** A guess budget only applies to free play, and running out *shows the answer with the why* rather than "you lose".

---

## 8. EN/ES wording templates

Store each animal as `{en:'fox', es:{n:'zorro', art:'el'}}` and write "spot N" as "el lugar N" so Spanish ordinals never need gender agreement.

| Key | EN | ES |
|---|---|---|
| fb.home | Home! | ¡En su casa! |
| fb.wrong | In the zoo, wrong home | Está, pero en otra casa |
| fb.none | Not here today | Hoy no está |
| fb.agg | {h} home, {w} wrong home | {h} en su casa, {w} en otra casa |
| why.R1 | Clue {c}: the {a} is not here, so it can't go anywhere. | Pista {c}: {art} {a} no está, así que no va en ningún lugar. |
| why.R2 | Clue {c}: the {a} is home in spot {s}. | Pista {c}: {art} {a} está en su casa, el lugar {s}. |
| why.R3 | Clue {c}: the {a} is in the code, but not in spot {s}. | Pista {c}: {art} {a} está en el código, pero no en el lugar {s}. |
| why.R4 | The {a} must be somewhere, and spot {s} is the only place left. | {Art} {a} tiene que estar, y el lugar {s} es el único libre. |
| why.R5 | Spot {s} has only one animal left: the {a}. | En el lugar {s} solo queda {art} {a}. |
| why.R6 | Clue {c} has {h} right, and we already found {it/them}. So the others are out. | La pista {c} tiene {h} bien, y ya {lo/los} encontramos. Los demás no están. |
| why.R7 | If the {a} were in spot {s}, clue {c} would break. So it isn't. | Si {art} {a} estuviera en el lugar {s}, la pista {c} no se cumpliría. Así que no está ahí. |
| check.inconsistent | Detective note: clue {c} already told us {fact}. Try anyway? | Nota de detective: la pista {c} ya nos dijo {fact}. ¿Probar de todos modos? |
| could.yes / could.no | It could be! / It can't be — clue {c} says… | ¡Podría ser! / No puede ser: la pista {c} dice… |

Easy uses icons plus 1–3 word labels, read aloud by `speech.js` when tapped. The "why" in Easy is a picture strip: the clue row, an arrow, and the crossed-out grid cell.

---

## 9. Data model, modules, tests, assets

**Room layout** (matching the registry contract):
- `assets/js/rooms/code/` holds `room.js`, `screens.html`, `room.css` and `code.js` (the screen).
- `assets/js/modules/` holds `codelogic.js` (scoring, enumeration, generator, solver, hints: pure, no DOM), `codeart.js` (SVG animal sprites) and `codetext.js` (EN/ES strings).

**Chapter config** (static JS, not JSON fetched; it stays small):
```json
{ "id": "m3", "level": "medium", "n": 4, "k": 6, "repeats": false,
  "feedback": "agg", "clues": [4,5], "tiers": ["T3"], "modes": ["clue","could","free"],
  "toClear": 30, "freeBudget": 10 }
```

**Puzzle object** (generated, never stored):
```json
{ "key": "m3-412", "symbols": ["fox","owl","frog","panda","lion","zebra"],
  "secret": [2,0,5,1], "clues": [{"guess":[0,1,2,3],"fb":{"home":0,"wrong":3}}],
  "grade": {"tier":"T3","steps":6,"chain":[{"rule":"R6","clue":2,"sym":4,"slot":null}]} }
```

**Progress** (localStorage `cz.code.v1`, versioned, via the `storage.js` patterns): `{ lvl:{easy:{ch:{e1:{next:37, stars:{"e1-12":3}}}}}, daily:{"2026-10-02":{easy:3}}, zoo:["fox","owl"], settings:{autoNotes:true, detective:false} }`. Store only best stars per key, capped at the most recent 2,000 keys plus totals.

**Unit tests** (`tools/tests/codelogic.test.mjs`):
1. Feedback fixtures: classic examples, Bulls and Cows 1234 vs 4271 → 1 bull and 2 cows, and duplicates (Wordle rule).
2. Code counts per config (24, 60, 360, 1296, 5040).
3. Knuth sanity check: minimax on 4×6-rep gives worst 5 and average ≈ 4.48 (slow-tagged).
4. The 682 lock clues → unique answer 042.
5. Over 500 seeds per chapter: unique, minimal, deterministic, tier matches the target.
6. The solver chain reaches the secret, and **no hint ever eliminates the secret**.
7. "Could it be" near misses break exactly one clue.
8. The consistency checker flags exactly the inconsistent guesses.
9. Every EN text key exists in ES with the same `{placeholders}`.
10. Every marker type has a distinct glyph or shape class.

Add `codecheck.mjs` to `npm run verify`: generate 200 puzzles per chapter and assert timings stay under 20ms each.

**Art:** 12 animal heads, 3 feedback glyphs, the safe door, lock dials and the enclosure map, all as SVG drawn in code (`img-src 'self'`; no external fonts or images).

---

## Sources (beyond those inline)

Additional sources:
- [cut-the-knot: Mastermind](https://www.cut-the-knot.org/ctk/Mastermind.shtml)
- [Bagels in Python](https://dancarroll.pythonanywhere.com/bigbookpython/bagels)
- [Project Euler 185 write-up](https://euler.stephan-brumme.com/185/)
- [Harvard: colour for meaning](https://accessibility.huit.harvard.edu/color-meaning)
