# Logic Games: build plan

A new room on curiozoo.com with seven games that make a child think in
steps: deduce, test, plan, and program. This file is the hand-off to whoever
builds it. Build one game at a time, in the order of the phases below.

Read in this order:
1. This file.
2. `PROGRESS.md` in this folder (what is done, what is next).
3. The research file for the game you are building. It has the sources,
   the measured numbers and the pseudocode:

| Game | Research file |
|---|---|
| Crack the Code | [`research-code.md`](research-code.md) |
| Truth Island, Find the Rule | [`research-truth-and-rule.md`](research-truth-and-rule.md) |
| Zoo Bridges | [`research-bridges.md`](research-bridges.md) |
| Train Tracks | [`research-trains.md`](research-trains.md) |
| Robot Path, Fix the Bug | [`research-robot.md`](research-robot.md) |

---

## 1. The owner's rules

1. **Long games.** Every game ships with at least 200 puzzles per level
   (600+ per game) and can make more on the device after that. "Ten
   questions and done" is not acceptable. The bank sizes in section 4 are the
   minimum to ship.
2. **Logic, not luck.** Every puzzle has exactly one answer (or, for Robot
   Path, a proven solution within the slot limit), and that answer can be
   reached by reasoning. A script proves this for every puzzle on every build.
3. **Fun first.** Each game has a collection, a daily puzzle, stars and a
   visible payoff (a safe opens, trains run, a robot feeds an animal).
4. **Site rules stay.** No timer pressure. Stars only go up. No streak
   that can be lost. Nothing is collected or sent. English and Spanish. Works
   offline. iPad first, works at 375 px. Right and wrong are never shown by
   colour alone.

---

## 2. Where it goes in the site

### 2.1 Before Phase 0: the new room layout must be committed

The one-folder-per-room layout (`assets/js/rooms/<id>/`, `rooms/registry.js`,
`sw.js`, `celebrate.js`) exists only as **uncommitted work on the branch
`offline-and-rooms`** (checked 2026-10-02). This plan is written against it.
Commit and merge that work first. Then start Phase 0 on a new branch from
`main`.

### 2.2 The room

One room, one entry in `REGISTRY` (`assets/js/rooms/registry.js`):

```js
{
  id: 'logic',
  name: 'Logic Games',
  hue: 'jade',          // the only room hue no room uses yet (mango is the brand)
  creature: 'cat',      // free; the curious detective
  href: '#/logic',
  status: 'live',
  blurb: 'Crack codes, catch the Moon animals, run trains and program a robot.',
  meta: '7 games · 5,000+ puzzles · English or Spanish',
  routes: ['logic'],
  code: () => import('./logic/room.js'),
  screens: 'logic/screens.html',
  css: 'logic/room.css',
  back: logicBack
}
```

Keep it `status: 'soon'` until the first game is playable.

### 2.3 Addresses

| Address | Screen | What it shows |
|---|---|---|
| `#/logic` | `logichub` | Seven game cards, today's puzzles, total stars, days played this week |
| `#/logic/<game>` | `logicgame` | Level picker (Easy / Medium / Hard) and the chapter map for that level |
| `#/logic/<game>/<chapter>` | `logicgame` | The puzzle grid of one chapter: numbered tiles with stars |
| `#/logic/<game>/<chapter>/<n>` | `logicplay` | One puzzle |
| `#/logic/<game>/daily` | `logicplay` | Today's puzzle for the chosen level |
| `#/logic/<game>/learn/<id>` | `logicplay` | A micro-lesson (Bridges techniques, chapter intros) |

Game ids: `code`, `truth`, `rule`, `bridges`, `trains`, `robot`, `bug`.
Chapter ids carry the level: `e1`, `m3`, `h2`.

`back`: puzzle → its chapter; chapter → its game; game → `#/logic`;
`#/logic` → home.

### 2.4 Files

```
assets/js/rooms/logic/
  room.js            the registry contract; routes to a game's screen with import()
  screens.html       three shared screens: logichub, logicgame, logicplay
  room.css           shared layout + one section per game
  hub.js             the hub and today's puzzles
  frame.js           shared puzzle frame: top bar, hint ladder, undo, why card, stars
  code.js truth.js rule.js bridges.js trains.js robot.js bug.js
                     one screen file per game; loaded only when that game opens

assets/js/modules/           pure, DOM-free, tested in node
  logicrng.js        mulberry32, string hash, date seed
  logicprogress.js   the one progress record for the room (rules in 5.2)
  logictext.js       shared EN/ES words (Hint, Undo, Check, Next, stars...)
  zooart.js          shared SVG: 12 animal heads, shape badges, stars, ✓ ! ? glyphs
  codelogic.js       + codetext.js
  truthlogic.js      + truthtext.js
  rulelogic.js       + ruletext.js + creatureparts.js (hats, patterns, items)
  bridgeslogic.js    + bridgestext.js
  trainslogic.js     + trainstext.js
  robotgrid.js robotvm.js robotsolve.js robotgen.js robotbug.js robothint.js
                     + robottext.js

assets/js/workers/
  logicgen.worker.js  on-device generation for Daily and Endless

data/logic/<game>/<level>.json   the puzzle banks (built, committed, verified)

tools/logicbuild.mjs  node tools/logicbuild.mjs <game> [--level easy]
                      builds a bank from fixed seeds; writes nothing if a puzzle fails
tools/logiccheck.mjs  part of npm run verify; re-solves every puzzle in every bank
tools/tests/<game>logic.test.mjs   unit tests per game
```

Two things to add outside the room, both small:
- `storage.js` DEFAULTS: add `logic: {}` under `settings`, or `migrate()`
  drops the record on the next version bump.
- `package.json`: add `logiccheck` and put it in `verify`.

A room's code may import shared modules and its own files, never another
room's (`tools/archcheck.mjs`). `import()` of the room's own game files is
allowed. Archcheck counts it for layering, not for cycles.

---

## 3. Decisions that apply to every game

### 3.1 Puzzles are built ahead, checked on every build, and also made live

- **The bank.** A node tool builds each game's puzzles from fixed seeds and
  writes them to `data/logic/<game>/<level>.json`. The bank is committed.
  This gives stable puzzle ids (progress survives code changes), lets a
  person look at them, and lets `logiccheck.mjs` re-solve every one from
  first principles. That is how the rest of this site works ("recomputes
  every answer").
- **Live generation.** The same pure generator runs on the device, in a
  worker, for **Daily** (seed = date + level + game, same for every child,
  no server) and **Endless** (after a level's bank is finished). Save the
  generated puzzle itself in progress, not only its seed, so a later
  generator change cannot rewrite a child's history.
- **Exception:** Robot Path's "is the loop really needed" proof takes up to
  6 s per level. Robot banks are built offline only. Robot Endless (later)
  uses the cheap checks.

### 3.2 One solver, four jobs

Each game has one human-style solver. It applies rules in order of how hard
they are for a child, and records each step. That one trace is used to:
1. **Grade** a puzzle (the hardest rule it needed, and how many steps).
2. **Prove** it has one answer (deduction alone finished it).
3. **Hint**: the next step, in three levels: *look here* → *ask the
   question* → *say the step*. A hint never reveals more than one step.
4. **Explain**: the "why" card after a solve replays the 2–4 key steps.

Hint and "why" text are stored as **codes** with slots
(`["R3", {"a":"fox","s":2}]`), never as prose. The words come from the
game's `*text.js` file in both languages. `logiccheck` fails if a code is
missing in either language or the slots differ.

### 3.3 Levels and chapters

| Level | Ages | Reading |
|---|---|---|
| Easy | 6–8 | Icons and short words. Every sentence can be read aloud (`speech.js`). |
| Medium | 8–10 | Short sentences, both languages. |
| Hard | 10–13 | Full sentences. |

Every chapter teaches **one new idea**. It opens with 2–3 hand-made teaching
puzzles, then the generated ones, sorted easy to hard. The next chapter opens
when two thirds of this one are solved. Three puzzles ahead are always open,
so a stuck child can skip.

### 3.4 Stars and rewards (shared rules)

- Each puzzle gives 1–3 stars. The best result is kept. Stars never go down.
- Hints are allowed and never punished. Three stars mean "no hint" or "first
  try" (the exact rule per game is in section 4).
- Each game has its own **collection** (an album, a zoo map) that fills as
  puzzles are solved. Nothing in it can be lost.
- The hub shows **total stars**, a **badge ladder** for the whole room, and
  **days played this week**. It never shows days missed.
- **Daily puzzle** for each game, one per level. Doing it stamps a calendar.
- `celebrate.js` for every win: count-up, confetti on a 3-star solve and on
  a finished chapter. Mascot moods: `think` while a hint is open, `happy` on
  a solve, `wow` on a surprise. Never use a "sad" mood as a punishment.

### 3.5 Shared art (`zooart.js`)

All SVG, drawn in code, no image files, no `style=""` (set attributes with
`setAttribute`; values go through `data-style` + `paint()` where needed).

- **12 animal heads that differ by outline first**: lion, elephant, giraffe,
  penguin, zebra, panda, monkey, owl, frog, turtle, flamingo, hippo.
  Each also has a **shape badge** (circle, square, triangle, diamond, star,
  hexagon, heart, cross...) and a palette colour. Shape, badge and colour
  together, so colour is never the only cue. Happy and neutral faces.
- Stars (empty, half-lit, full), ✓, !, ?, ✗ glyphs, a hint ring, a focus ring.
- Animal names in EN/ES **with article** (`{en:'fox', es:{n:'zorro', art:'el'}}`)
  so Spanish sentences never need gender guessed at run time.

Truth Island and Find the Rule use the site's **creature cast** instead
(`sections.js` `creature()`: one face, eight ear shapes), because the cast is
already the family a child knows from the home page.

### 3.6 Accessibility (every game)

- Every action works by tap, by keyboard, and with a screen reader. Drag is
  only ever an extra.
- Touch targets ≥ 44 px. At 375 px nothing scrolls sideways except inside its
  own box.
- State is shown by shape + glyph + text + `aria-label`; colour only adds.
- `prefers-reduced-motion`: every animation has a still version (listed per
  game).
- Results are announced in an `aria-live` region.

### 3.7 Naming

Use our own names and our own rule text. Do not use "Mastermind", "Wordle",
"Hashi", "Hashiwokakero", "Lightbot". Credit sources in
`docs/research/logic/CREDITS.md` (Nikoli for the Bridges puzzle type, Bebras
CC BY-SA for borrowed railway ideas, Smullyan for the knights-and-knaves genre,
Lewis Carroll public domain if any line is used).

---

## 4. The seven games

Each section says: what the child does, the chapters, how many puzzles, how
puzzles are made and checked, the stars, what has to be made by hand, the art,
the files, and the tests. Details and sources are in the research files.

---

### 4.1 Crack the Code (`code`) — *Descifra el código*

**The idea.** A zoo safe is locked with a row of animals. Clues show past
guesses and what each guess got right. The child works out the one code that
fits all the clues. This is the Bulls-and-Cows family, which is folk and
free to use.

**Why this design.** Free guessing on a small board is solved by luck. So the
main mode gives the clues and asks the child to deduce, like Math Garden's
"Flowercode", played by 28,000 children aged 6–12. Research there found that
**the kind of clue, not the board size, makes a puzzle hard**, so that is how
puzzles are graded.

**Three modes, one board:**

| Mode | Share | What the child does |
|---|---|---|
| **Clue Safe** | ~70% | Read the clues, set the code. A wrong answer names the clue it breaks. No cost. |
| **Could It Be?** | ~20% | Clues + one code. Tap *Could be* or *Can't be*. Near misses break exactly one clue. Great for young children. |
| **Free Crack** | boss of each chapter, Daily | Guess a hidden code. A gentle "detective note" when a guess ignores a clue already given. Never blocked. |

**Feedback by level:**
- Easy: one mark under **each** animal: *Home!* (solid circle with a paw), *Wrong home* (hollow ring with ↔),
  *Not here* (flat dash). No repeated animals.
- Medium: first a mark under each slot for "home" plus a **count** of
  "wrong home"; then counts only, on 3 slots; then the "682 lock" with digits.
- Hard: counts only (Bulls and Cows). Repeats only in the last chapter.

**Chapters**

| Ch | Board (slots × symbols) | Feedback | Clues | Idea taught |
|---|---|---|---|---|
| e1 | 2×3 → 3×4 | per slot | 1–2 | A "not here" animal is out everywhere |
| e2 | 3×5 | per slot | 2–3 | "Wrong home" means: in the code, other spot |
| e3 | 3×6 | per slot | 3 | The missing animal (never shown, so it must be the one) |
| e4 | 4×6 | per slot | 3–4 | Last place left |
| m1 | 4×6 | home marks + count | 3–4 | Counting what is still unknown |
| m2 | 3×6 | count only | 3–4 | "We already found them, so the rest are out" |
| m3 | 4×6 | count only | 4–5 | Same, longer |
| m4 | 3 digits 0–9 | count only | 4–5 | The famous lock puzzle |
| h1 | 4×6 | count only | 5 | One "what if" |
| h2 | 4×8 | count only | 5–6 | "What if" with more animals |
| h3 | 4 digits | count only | 5–6 | Bulls and Cows |
| h4 | 4×6 with repeats | count only | 5–7 | Repeats |

**How many.** Each chapter: 50 Clue Safes + 15 Could It Be + 5 Free Crack
bosses = 70. **Bank: 280 Easy, 280 Medium, 280 Hard = 840.** Then Endless
mode, weighted toward the child's weakest clue type. The pool behind each
chapter is between ~650 (e1) and 10¹⁵ puzzles, so it never runs dry.

**Made and checked.** Pick a secret. Add guesses that shrink the set of
possible codes until one is left. Drop any clue that is not needed. Grade with
the solver rules R1–R7 (`research-code.md` §5). Keep it only if the hardest
rule matches the chapter. Easy and Medium never need R7 ("what if").
`logiccheck`: one answer, every clue needed, grade matches, the solver chain
ends at the secret, no hint ever rules out the secret.

**Stars.** ★ cracked. ★★ no hint. ★★★ first answer right (Clue Safe), or
every guess fitted the clues so far (Free Crack). The skill rewarded is
using every clue, which is what makes play near-optimal.

**Notes grid.** A grid of slots × animals beside the clues. Easy: Helper Owl
crosses cells out by itself after each clue. Medium and Hard: the child
crosses them out, and *Check my notes* points out a wrong cross.

**Collection.** Each solved safe opens part of an enclosure. Ten safes open
it and add the animal, with a one-line fact, to the zoo map.

**Made by hand:** 3 teaching safes per chapter (36). The m4 opener uses the
classic public "682" lock (answer 042) as a teaching example.

**Art:** safe door, lock dials, the three feedback marks, notes grid,
enclosure map. Animals from `zooart.js`.

**Motion:** dials turn on submit; the door swings open on a solve. Reduced
motion: instant state change and a ✓ badge.

**Files:** `rooms/logic/code.js`, `modules/codelogic.js`, `modules/codetext.js`,
`data/logic/code/{easy,medium,hard}.json`, `tools/tests/codelogic.test.mjs`.

**Tests:** feedback fixtures (Bulls and Cows 1234 vs 4271 = 1 bull, 2 cows;
duplicates); code counts (24, 60, 360, 1,296, 5,040); Knuth check (classic
board: worst 5, average ≈ 4.48); 682 → 042; uniqueness and minimality on 500
seeds per chapter; same seed → same puzzle; near misses break exactly one
clue; EN/ES key parity.

---

### 4.2 Truth Island (`truth`) — *La isla de la verdad*

**The idea.** On the island live **Sun animals**, who always tell the truth,
and **Moon animals**, who always say the opposite. Each animal says
something. The child works out which is which. This is the
knights-and-knaves genre, with our own words.

**Why "Sun and Moon", not "liar".** Young children hear "liar" as "bad". The
residents should be lovable. *Sol* and *Luna* also need no gender in Spanish.
The two tokens differ in shape (a disc with rays, a crescent), not only
colour.

**The key fact for young children.** Puzzles made only of "she is a Moon"
never have one answer, because flipping everyone also works. So Easy puzzles
are anchored by a **picture**: the animal says "3 apples" and the child can
see 2. No reasoning by "suppose" is needed at Easy.

**Pencil mode (Medium and up).** The child puts a dashed *maybe Sun* on an
animal. Every speech bubble then shows ✓ or ✗ for "would this be true", and a
clash is flagged in words. This keeps the "suppose" on the screen instead of
in the head, which research shows is the hard part.

**Chapters**

| Ch | Content |
|---|---|
| e1 | One animal, one picture claim |
| e2 | 2–3 animals, each a picture claim |
| e3 | A picture claim + "Fox is a Sun" |
| e4 | Chains of three |
| e5 | The curtain: the picture is hidden; a known Sun describes it |
| m1 | Self-claims ("We are both Moons") |
| m2 | Same and different ("Owl and I are the same kind") |
| m3 | Counting ("Exactly one of us is a Moon") |
| m4 | One "suppose", with pencil mode |
| m5 | Mixed |
| h1 | Four animals |
| h2 | And, or (always "or both"), if-then |
| h3 | Spies (one Sun, one Moon, one who may say anything) |
| h4 | Switchers (two bubbles: one true, one false, in turn) |
| h5 | The Question Gate: pick the one yes/no question that finds the safe bridge |

The ceiling: no puzzles with unknown yes/no words or random answerers.

**How many.** 40 per chapter. **Bank: 200 per level = 600.** Endless after.
Hard has 342 three-speaker and 1,757+ four-speaker logic patterns, so it is
unbounded. **Easy has only about 20 logic patterns**, so its variety comes
from the pictures: budget **30 scene templates** (below).

**Made and checked.** Statements are small trees (`research-truth-and-rule.md`
§1.4). Try every Sun/Moon assignment (at most 16, or a few more with spies).
Keep a puzzle only if exactly one works, no statement can be removed, and no
statement is a paradox or always true. Grade by the number of "suppose" steps
a person needs. Keep "everyone is a Sun" under 25% of answers per chapter.
Before Hard: no "not" inside a Moon's claim, no "and" from a Moon.

**Stars.** ★ solved. ★★ no step-3 hint. ★★★ first Check right and no hint.
A wrong Check always names the broken statement ("If Fox is a Sun, Fox's
sentence must be true, but the sky shows rain"), so guessing still teaches.

**Collection.** Each solve welcomes a resident into the Island Album.

**Made by hand:**
- **30 scene templates** for Easy: counts (1–5 of apple, banana, fish,
  carrot, egg, star, shell, flower), weather (sun, rain, snow, cloud), day or
  night, who holds what, big and small, on and under, in and out.
- Statement sentence templates written **natively** in EN and ES, never
  composed word by word (Spanish negative concord; "o" vs "o... o...").
  Use *exactamente*, *al menos*, *como mucho*. "or" is always "or both" / "o los dos".
- "Why" templates: `FACT_FALSE`, `ACCUSE_FROM_SUN`, `ACCUSE_FROM_MOON`,
  `SELF_MOON_IMPOSSIBLE`, `SUPPOSE`, `COUNT`, `MOON_AND`.
- 2 teaching puzzles per chapter (30).

**Art:** Sun and Moon tokens and the dashed "maybe" version; speech bubble
with icon glyphs (=, ≠, &, or, →, "exactly", "at least"); scene props; island
map; curtain; album frames. Animals: the creature cast.

**Motion:** tokens flip; reduced motion swaps them at once.

**Files:** `rooms/logic/truth.js`, `modules/truthlogic.js`,
`modules/truthtext.js`, `data/logic/truth/*.json`,
`tools/tests/truthlogic.test.mjs`.

**Tests:** solver against hand puzzles (classic "we are both Moons");
paradox and empty statements rejected; one answer for every bank puzzle;
the trace reaches the answer and never contradicts it; each scene claim is
checked against its scene; EN/ES template parity.

---

### 4.3 Find the Rule (`rule`) — *Descubre la regla*

**The idea.** Creatures walk up to a gate. Some pass, some are stopped. The
child finds the secret rule, then proves it. This is the Zoombinis / Zendo /
Bongard family. The skill is the scientist's: test, and especially test what
you think will **fail**.

**Creatures.** The creature cast with layers, each told apart by shape or
count: ears (species), hat (none, cap, crown, bow), pattern (plain, stripes,
dots, checks), buttons (1, 2, 3), size (small, big), held item (none, balloon,
flower, fish). Colour only as an extra cue, from Medium.

**The loop.**
1. Watch: the opening creatures go through. Passed ones sit under a ✓ arch,
   stopped ones under a ✗ bar, with words.
2. Test: pick a creature from the line (Easy) or build one in the Dress-up
   Machine (Medium and up). **Predict first** (✓ or ✗), then send it.
3. "I know the rule!" any time.
4. Prove it: Easy sorts 6 new creatures (luck is 1 in 64, and the 6 are
   picked so a nearly-right rule fails). Medium builds the rule from icon
   tiles and then sorts 4. Hard builds it.
5. A wrong proof gets **one counterexample**: a creature where the child's
   rule and the real rule disagree. "Interesting! This one breaks your rule."
   No cost.

**Chapters**

| Ch | Rule type |
|---|---|
| e1 | One value ("crowns pass") |
| e2 | One attribute, two values |
| e3 | NOT ("everyone except bows") |
| e4 | Count ("2 or more buttons") |
| e5 | Mixed |
| m1 | AND |
| m2 | OR (or both) |
| m3 | AND NOT |
| m4 | Traps: every passer shares a second feature that does not matter |
| m5 | Free testing in the Dress-up Machine |
| h1 | Three-part rules |
| h2 | Match ("hat and item are the same shape") |
| h3 | Pair gate ("the one in front is bigger") |
| h4 | Parade gate (a rule about a line of creatures) |
| h5 | Two gates: each creature goes to exactly one |

**How many.** 40 per chapter. **Bank: 200 per level = 600.** Easy has only
18 distinct rules on 3 attributes; rotate the attribute families and the gate
scenes (bridge, door, bus, picnic blanket) so it does not feel the same, and
never repeat the same rule within 15 puzzles.

**Made and checked.** Two rules are the same if they sort every possible
creature the same way (a bitset over all 27, 81 or 324 creatures). A rule's
difficulty is the length of its **shortest** equal rule (Feldman). The
opening evidence leaves 3–6 rules still possible, including one too-narrow
trap. The waiting line always holds a test that splits every pair of them.
`logiccheck`: the target rule is the only one left after the line is used;
the 6 proof creatures catch every surviving wrong rule; pass rate between 30%
and 70%.

**Stars.** ★ solved. ★★ at or under par tests (par = the best teacher's
number + 2). ★★★ no hint and first proof right. Extra stamp: **Brave Tester**,
each time the child correctly predicts a *stopped* creature.

**Made by hand:** rule tile icons (attribute values, NOT, AND, OR (or both),
≥, "in front"); the "why" template ("Every creature that passed had X. Your
key test was this one: it showed the stripes did not matter."); 2 teaching
puzzles per chapter (30).

**Art:** creature layers (4 hats, 4 patterns as SVG `<pattern>`, 3 button
counts, 2 sizes, 4 held items); gate, ✓ arch, ✗ bar, Dress-up Machine; 4 gate
scenes; stamps.

**Motion:** creatures walk to the gate; reduced motion fades them.

**Files:** `rooms/logic/rule.js`, `modules/rulelogic.js`,
`modules/ruletext.js`, `modules/creatureparts.js`,
`data/logic/rule/*.json`, `tools/tests/rulelogic.test.mjs`.

**Tests:** rule equality by bitset; shortest-form grading on known rules;
proof creatures catch every near-miss; counterexample really separates the two
rules; EN/ES parity.

---

### 4.4 Zoo Bridges (`bridges`) — *Puentes del zoo*

**The idea.** Islands with animals. Each island shows how many bridges it
needs. Join them with straight bridges, at most two between a pair, no
crossing, and every island must end up joined to the rest. A puzzle type
first published by Nikoli (Japan, 1990); our name and our rule text.

**How it is played.** Tap the water between two islands: 0 → 1 → 2 → 0
bridges. Drag from an island also works. Keyboard: arrows move between
islands, Enter + arrow adds, Backspace + arrow removes. Unlimited undo.
An island fills a ring of notches as bridges arrive; when full, the ring
closes, a ✓ appears and the animal smiles. Too many: "!" and a dashed
outline. Young children see **dice-style dots** instead of numbers.

**Eight techniques, one per chapter** (`research-bridges.md` §2):
T1 *Full up* · T2 *Only one friend* · T3 *No crossing* · T4 *Just enough* ·
T5 *At least one each way* · T6 *Don't trap a pair* · T7 *Keep the zoo
together* · T8 *What if…?* (Hard only, one step deep).

Each technique has a **micro-lesson**: a 3–4 island board where only that
technique works. A paw shows it once, then the child does two.

**Chapters**

| Level | Grids | Islands | Chapters |
|---|---|---|---|
| Easy | 5×5 → 7×7 | 4–12 | 1 Only one friend · 2 Full up + No crossing · 3 Count the dots · 4 Double bridges · 5 Just enough (corner 4) · 6 Just enough (6 and 8) · 7 Mixed · 8 At least one · 9–10 Review |
| Medium | 7×7 → 10×10 | 10–20 | 1 Don't trap a pair · 2 At least one (5, 7) · 3 Mixed · 4 Keep together (only exit) · 5 Closed group · 6–10 Mixed, growing |
| Hard | 10×10 → 13×13 | 18–32 | 1–3 Keep together at scale · 4–5 Dense grids · 6 What if…? · 7–10 Mixed, longest |

Easy chapters 1–3 use at most one bridge per pair.

**How many.** 10 chapters × 30. **Bank: 300 per level = 900.** About 46 bytes
each, so the whole bank is ~15 KB zipped. Measured: 1,800 built in 3.7 s.
Then Daily and Endless in the worker (≤ 50 ms per puzzle on an iPad).

**Made and checked.** Grow islands the way Simon Tatham's generator does,
then solve with techniques up to the chapter's level only. If deduction alone
finishes the grid, it has one answer. Reject it if it is too easy or not
finished. Use Tatham's grid text format (`7x7:2a3a2e…`). `logiccheck`:
re-solve each, check the chapter's technique is in the trace, no duplicates
up to rotation and mirror, a brute-force solution count on a sample.

**Helper modes.** Easy: flags over-full islands, crossings and cut-off
groups, never a legal-but-wrong bridge. Medium and Hard: over-full only. A
*Check* button for all levels ("2 bridges don't belong. Show me?").

**Stars.** ★ solved. ★★ at most 1 hint. ★★★ no hints and no Check reveal.

**Collection.** Each chapter is a habitat (savanna, arctic, rainforest, reef,
desert, mountains...). Solves fill the Zoo Map sticker book. A chapter at all
★★★ unlocks a night version. Each new technique earns a badge card that
replays its lesson.

**On phones:** draw the grid turned on its side when that fits better
(the rules do not change). 13×9 becomes 9×13 at ~38 px cells.

**Made by hand:** 8 micro-lessons (board + script); technique names and hint
templates in EN/ES; habitat names.

**Art:** island disc with habitat rim and notch ring (1–8); dot layouts
1–8; single and double plank bridges; "no bridge" buoy marker (Medium up);
water pattern (still under reduced motion); habitat tiles; badge cards.

**Files:** `rooms/logic/bridges.js`, `modules/bridgeslogic.js`,
`modules/bridgestext.js`, `data/logic/bridges/*.json`,
`tools/tests/bridgeslogic.test.mjs`.

**Tests:** grid text round-trip; edges and crossings on hand grids; one small
fixture per technique (exactly that tag fires); solver agrees with brute force
on 1,000 random puzzles; solvable at L → solvable at L+1; turning the grid on
its side changes nothing; same seed → same puzzle; hints never contradict the
answer, and a wrong bridge is reported first.

---

### 4.5 Train Tracks (`trains`) — *Vías del tren*

**The idea.** The zoo railway. Each train carries one animal. Set the
switches so every animal reaches its own enclosure, then press **GO** and
watch. Trains run one at a time, so nothing depends on speed.

**The board.** Horizontal lanes. Trains run left to right. A switch is a
crossover between two neighbouring lanes. This draws cleanly and every
puzzle can be checked by trying every switch setting (at most 1,024).

**Three kinds of switch,** each with its own shape:
- **Lever**: the child sets it; it stays.
- **Flip-point**: a round turntable with ↻; it flips after every train
  (Digi-Comp II, Turing Tumble, Bebras 2018). Teaches odd and even, and
  binary counting.
- **Memory point** (H4 only, test first): a train coming the other way sets it.

A switch shows its state four ways: lever tilt, an arrow on the live branch,
a gap in the dead branch, and an `aria-label`.

**Chapters**

| Ch | Name | Mechanic |
|---|---|---|
| e1 | Follow the Track | Switches are set. Tap where the train will stop. |
| e2 | Set the Switches | One train. Set levers. GO. |
| e3 | Two Trains, One Plan | Two trains, one setting for both |
| m1 | Busy Railway | 3–4 trains, one setting, dead-end branches |
| m2 | Fewest Pulls | Fixed queue. Levers can change between trains. Fewest pulls wins. |
| m3 | Flip Warm-up | 1–3 flip-points: predict, then set |
| h1 | Flip-Flop Yard | Set the starting position of flip-points for 3–4 trains |
| h2 | Line Them Up | Choose the order trains leave through a flip-point tree |
| h3 | The Siding | Reorder cars with one dead-end siding (a stack) |
| h4 | Zoo Machine | Levers, flip-points and memory points together |

**How many.** 100 per chapter. **Bank: 300 Easy, 300 Medium, 400 Hard =
1,000.** Measured unique pools: ~500 (e2), ~4,600 (e3), 6,002 (m1), 4,373 (h1),
617 siding orders (h3) before counting different animals, so the bank never
needs a repeat.

**Made and checked.** Pick a hidden setting, run the trains, and use where
they end as their targets. Keep a puzzle only if exactly one setting works
and every switch is used. Remove switches no train touches. Fewest Pulls: the
minimum is exact and quick (per switch). Siding: generated from a valid
push/pop sequence and solved with Knuth's rule, so it always works. Memory
points: stop a train that loops (step cap + seen states) and reject.

**Hints** walk the routes: *only one way* → *every way turns here* →
*conflict with another train* → *try it and see it fail* → *show one switch*.
Flip-points: "Two trains crossed this switch before the panda, so it flipped
twice and is back where it started." Siding: "The zebra must leave next and
it is on top. Bring it out."

**Stars.** ★ solved. ★★ within 2 runs (Fewest Pulls: par + 1). ★★★ first
run (Fewest Pulls: exactly par). In Medium and Hard a hint caps the puzzle at
★★ until replayed. A wrong run stops the train at the wrong gate and puts a
"?" on the switch that sent it there. No buzzer.

**Collection.** Every 10 solves opens an enclosure on the Zoo Railway Map.
Each chapter adds an animal and a train paint (with a pattern, not only a
colour).

**Made by hand:** 3 teaching puzzles per chapter (30); chapter names and hint
codes in EN/ES. Spanish: use *desvío* for a switch (neutral across countries;
check with a native reader).

**Art:** track pieces (straight, crossover curve, sleepers); lever,
flip-point turntable, memory flag; station gates with animal and shape badge;
trains with patterns; siding; GO button; whistle puff.

**Motion:** trains move along SVG paths (`getPointAtLength`); flip-points snap
over as a train leaves. Reduced motion: each route is drawn as a dashed line
with numbered dots, one train per *Next* tap, and a ✓ or ✗ badge at the gate.

**Files:** `rooms/logic/trains.js`, `modules/trainslogic.js`,
`modules/trainstext.js`, `data/logic/trains/*.json`,
`tools/tests/trainslogic.test.mjs`.

**Tests:** simulation on hand layouts; the Bebras 2018 tree gives the order
`aecgbfdh`; flip parity; Fewest Pulls matches brute force; the siding rule
matches a search for n ≤ 6 and the count of sortable orders is the Catalan
number; hints never contradict the answer; looping trains are caught.

---

### 4.6 Robot Path (`robot`) — *El camino del robot*

**The idea.** A zookeeper robot carries food to the animals on a grid. The
child builds a program from command tiles, presses **Run**, and watches.
Concepts arrive one at a time: steps → repeat loops → helpers (procedures) →
conditions → repeat-until, counters and recursion.

**Why these steps by age.** In kindergarten studies 53% handled loops and only
41% "if not". Children also run a loop one time too many. So:

| | Easy (6–8) | Medium (8–10) | Hard (10–13) |
|---|---|---|---|
| Moves | Screen arrows ↑ → ↓ ← (no left/right confusion) + Feed | Forward, turn ↶ ↷ (robot's own left/right), Jump over low walls | Same + sensors and counters |
| Control | Repeat ×2–5 | Longer loops, nested loops late, one helper, colour pads ("only on orange", always with a pattern too) | Two helpers, a helper that calls itself, `if path ahead / else`, `repeat until 🏁`, counters, one program for several boards |
| Grid | 5×5 → 6×6 | 6×6 → 7×7 | 7×7 → 8×8 |
| Slots | Main ≤ 12 | Main ≤ 10, helper ≤ 6 | Main ≤ 8, helpers ≤ 6 |

Medium opens with a short **bridge world** for turns: robot facing up first
(its left is the screen's left), facing down last. The robot's facing is
always visible (visor, nose arrow, footprint on the next tile).

**The editor (our own, no Blockly).** Rows of slots: Main, then helper rows
(🪣 and 🧺, not "P1"). Empty slots show the limit ("7 of 10"); the limit is the
puzzle. A caret; tap a palette tile to insert at the caret. Tap a placed tile
for a small toolbar: delete, move, swap kind, count stepper (2–9, never
typed). A loop is a bracket tile with dots for its count, and costs one slot.
Undo and redo. Everything by tap and by keyboard; drag is extra.

**Watching.** Run, Step, Step back, Reset, speed 🐢 🐇 🐆. The current tile
has a thick outline and ▶. A loop shows "2 of 3". A helper call lights up its
row. Failures stop the robot with a glyph and a sentence (bump, water,
nothing to feed, out of steps) and a dashed "bug" outline on the tile that
caused it. Reduced motion: the robot hops cell to cell and leaves a dotted
trail.

**Worlds** (20–30 levels each, one new concept each): Easy: Petting Farm,
Duck Pond, Monkey Grove, Penguin Beach. Medium: Turning Bridge, Savanna,
Rainforest, Reptile House. Hard: Arctic, Night House, Aquarium, Keeper HQ.
Every world mixes in review levels from before.

**How many.** Per level: ~30 hand-made spine levels + ~170 generated =
**200 per level, 600 total.** (Fix the Bug, below, makes another 600 from the
same levels.)

**Made and checked (offline only).** Write a program from a template
(staircase, spiral, repeated shape, colour turn, corridor, fork, count,
several boards), run it on a blank grid to carve the path, place animals,
add scenery and dead ends. Keep the level only if the concept is **needed**:
the shortest program without it does not fit the slots (a breadth-first
search, cheap). Par = the smallest program found by full search up to 8 tiles
(6 s worst case, offline), or the generator's program for Hard. Drop
near-duplicates up to rotation and mirror. `logiccheck` re-runs every
reference program and every necessity check.

**Interpreter.** Programs are plain JSON. No `eval`. A frame stack runs one
step at a time and emits events (move, turn, feed, bump, loop, call,
return...). Animation, Step back, hints and Predict all read the same events.
Limits: 400 actions, 2,000 steps, call depth 16. Each failure says why.

**Stars.** ★ solved. ★★ size ≤ par + 2. ★★★ size ≤ par (on Easy levels where
par is the plain path: solved on the first Run). Hints never cost stars.

**Hints.** Press Step and watch → "Do you see a shape that repeats?" → the
first tile where the robot leaves every shortest path → "Your loop needs 2
tiles inside and runs 4 times" → show one tile.

**"Why" note.** "A loop saved you 9 tiles: ×4 (forward, turn) instead of 12."

**Collection.** Each world's animals join the keeper's round; a finished world
gives the robot a new hat or paint.

**Made by hand:** ~30 spine levels per difficulty (~90), all our own layouts,
not copied from Lightbot, Code.org or Kodable; concept intro cards; "why" and
hint templates in EN/ES.

**Art:** robot (body, visor, antenna, nose arrow; happy and dizzy); tiles
(grass, path, water, rock, tree, low wall, colour pads with patterns, 🏁);
10 animals with food (hay, leaves, bananas, fish, bamboo, seeds); command
icons (↑ → ↓ ←, ↶ ↷, forward foot, jump arc, feed bucket, helper icons, loop
bracket, sensor chips).

**Files:** `rooms/logic/robot.js`, `modules/robotgrid.js`, `robotvm.js`,
`robotsolve.js`, `robotgen.js`, `robothint.js`, `robottext.js`,
`data/logic/robot/<world>.json` (one file per world, loaded when opened),
`tools/tests/robotvm.test.mjs`, `robotsolve.test.mjs`.

**Tests:** ×3 runs exactly 3 times; call and return; recursion limit; step
limit; colour pads; shortest path on small hand boards; same seed → same
level; necessity check rejects a level that does not need its concept.

---

### 4.7 Fix the Bug (`bug`) — *Arregla el error*

**The idea.** A robot program that almost works. Find the mistake and fix it.
Or: look at a program and say where the robot will stop. Research: reading
and fixing code comes before writing it, and teaching a debugging routine
works.

Same grid, robot, editor and interpreter as Robot Path. Puzzles are made from
Robot Path's verified levels, so they need no new board generator.

**Modes**

| Mode | Levels | What the child does |
|---|---|---|
| **Fix it** | all | Run or step the buggy program, then edit it |
| **Find it** | Easy | Tap the wrong tile, then pick its replacement from 3 |
| **Order it** | Easy | The right tiles, scrambled. Swap them into order. |
| **Predict** | all | "Where will the robot stop?" Tap a cell (and a facing, Medium up). Easy picks from 3–4 marked cells. Then watch. |

**The bugs.** Nine kinds, each one a real mistake children make: a turn the
wrong way; loop count one off; a missing step; an extra step; two steps
swapped; a step inside the loop that belongs outside (or the reverse); a
wrong helper call; a wrong condition; a missing Feed.

**Made and checked.** Take a level's reference program. Apply one bug. Keep
it only if: the buggy program fails; it fails after at least 2 right moves;
and the number of one-edit fixes is exactly one place (Easy) or at most three
(Medium, Hard). Any fix that works is accepted, even one we did not plan.
Predict wrong answers come from real mistakes: where the robot ends if the
loop ran once more, if the turn was taken screen-wise, if the helper was
skipped.

**The routine the hints teach:** what happened → what should have happened →
Step until it goes wrong → fix that tile.

**How many.** Per level: 120 Fix/Find/Order + 80 Predict = **200 per level,
600 total.** Bug types spread evenly; no two puzzles from the same level and
same bug.

**Stars.** ★ fixed. ★★ fixed with one edit. ★★★ found the bug **before**
pressing Run (rewards tracing in your head). Predict: ★★★ first answer right.

**Collection.** A "bug jar" of the nine bug kinds. Catching each kind for the
first time adds a cartoon bug (a friendly beetle, not a scary one) with its
name and what it teaches.

**Made by hand:** 2 teaching puzzles per bug kind (18); the nine bug names
and descriptions in EN/ES.

**Art:** the bug jar and nine bug drawings; a "bug outline" for tiles;
Predict markers. Everything else from Robot Path.

**Files:** `rooms/logic/bug.js`, `modules/robotbug.js`,
`data/logic/bug/*.json`, `tools/tests/robotbug.test.mjs`.

**Tests:** every mutation produces a program that fails; fix counting is
right on hand cases; Predict wrong answers are distinct cells and none is the
right answer; any working fix is accepted.

---

## 5. Shared engineering

### 5.1 Random numbers

`logicrng.js`: `mulberry32(seed)`, `hash(...parts)` (string → 32-bit),
`dailySeed(game, level, isoDate)`. Integer maths only, so every browser makes
the same puzzle from the same seed. Never use `Math.random` inside a
generator.

### 5.2 Progress (`logicprogress.js`)

One object at `settings.logic`, owned and checked here, in the same style as
`chessprogress.js` (pure functions, nothing mutated, every rule tested):

```json
{
  "v": 1,
  "level": { "code": "easy", "truth": "medium" },
  "stars": { "code:e1:12": 3, "bridges:m4:7": 2 },
  "daily": { "2026-10-02": { "code:easy": 3 } },
  "days": ["2026-09-28", "2026-10-02"],
  "album": { "truth": ["owl-03"], "bridges": ["savanna"], "bug": ["M2"] },
  "endless": { "bridges:easy": { "n": 14, "last": "7x7:2a3a..." } },
  "draft": { "robot:m2:11": { "main": [] } },
  "settings": { "helper": { "bridges": "helper" }, "autoNotes": true }
}
```

Rules: stars only go up (`setStars` keeps the max). Days are kept for the last
14 only; the hub shows "days this week", never a streak. Cap `stars` at the
most recent 5,000 keys plus a running total, so localStorage stays small.
`album` only grows.

### 5.3 The shared puzzle frame (`frame.js`)

Every game draws its board inside the same frame, so they feel like one room:
- Top bar: back to the chapter, puzzle number, ★ so far, language flip
  (EN/ES), read aloud, Undo, Restart.
- Hint button: steps through the game's 3-level hint ladder, one tap = one
  more level.
- Check button (where the game has one).
- The win card: stars (count-up), the "why" (2–4 lines), Next, Back to the
  chapter. Confetti on ★★★ and on a finished chapter.
- The "not yet" line: says what is wrong in words, never only a colour.

### 5.4 Checks on every build (`tools/logiccheck.mjs`)

For each game present in `data/logic/`:
- Every puzzle parses and re-solves to the stored answer, with one answer.
- Each chapter has its minimum count (section 6).
- Every hint/why code exists in EN and ES with the same slots.
- No duplicate puzzles (games with grids: also not up to rotation and mirror).
- Ids are unique and stable: a puzzle id that existed must not change meaning.
  (Keep `data/logic/<game>/ids.txt`; a removed id stays reserved.)

### 5.5 Offline and size

`tools/offline.mjs` already saves everything under `assets/` and `data/`.
Estimated bank sizes: Code ~150 KB, Truth ~200 KB, Rule ~200 KB, Bridges
~90 KB, Trains ~350 KB, Robot ~375 KB, Bug ~300 KB. About 1.7 MB raw, well
inside the 60 MB budget.

### 5.6 How to check each game in the browser

Use `.claude/launch.json` with `tools/serve.py` (it sends the real CSP; a plain
server hides `style=""` bugs). For each game: play one puzzle per chapter at
iPad landscape (1024×768) and at 375 px, in both themes, with reduced motion
on and off, by keyboard only once, and with the language flipped to Spanish.
No console errors.

---

## 6. Phases (one at a time)

Each phase ends with `npm run verify` green, a browser check (5.6), one
commit, and `PROGRESS.md` updated. Each game phase can be its own pull
request.

| Phase | What | Ships | Bank (min) |
|---|---|---|---|
| 0 | Room shell: registry entry (`soon`), hub, the three screens, `frame.js`, `logicrng.js`, `logicprogress.js`, `zooart.js`, `logictext.js`, storage key, `logicbuild.mjs` and `logiccheck.mjs` skeletons, worker skeleton, CREDITS.md | Hub with 7 "coming soon" cards | — |
| 1 | **Crack the Code** | Room goes `live` | 840 |
| 2 | **Truth Island** | | 600 |
| 3 | **Find the Rule** (reuses the cast and Truth Island's bubble art) | | 600 |
| 4 | **Zoo Bridges** | | 900 |
| 5 | **Train Tracks** | | 1,000 |
| 6 | **Robot Path** (editor + interpreter + generator; the biggest phase, may split into 6a engine and 6b levels) | | 600 |
| 7 | **Fix the Bug** (reuses Phase 6) | | 600 |
| 8 | Daily puzzles and Endless for every game; room badge ladder; README section; native Spanish review list | | — |

**Total: 5,140 puzzles in the banks**, plus Daily and Endless.

Why this order: Crack the Code is the smallest engine and builds every shared
piece (frame, hints, why card, stars, banks, checker) on a game that is quick
to finish. Truth Island and Find the Rule share the creature cast and the
icon-bubble art. Bridges and Trains are self-contained grid games. Robot Path
is the largest, and Fix the Bug needs it.

### Done means, for each game

- [ ] Bank at or above its minimum, every puzzle passing `logiccheck`.
- [ ] Every chapter has its hand-made teaching puzzles.
- [ ] Hints (3 levels) and the "why" card work and never give away more than
      one step.
- [ ] Stars, collection and progress save and survive a reload.
- [ ] English and Spanish complete; Easy reads aloud.
- [ ] Keyboard, screen reader labels, reduced motion, 375 px, both themes.
- [ ] Unit tests for the game's logic module.
- [ ] Game card on the hub switched from "soon" to live.

---

## 7. Everything that has to be made by hand

The generators make the puzzles. People (or the builder, carefully) make
these:

| Item | Count | For |
|---|---|---|
| Teaching puzzles at the start of each chapter | ~36 Code, 30 Truth, 30 Rule, 8 Bridges lessons, 30 Trains, ~90 Robot spine, 18 Bug | All games |
| Easy scene templates (counts, weather, day/night, who holds what, on/under, in/out) | 30 | Truth Island |
| Statement, hint and "why" templates, written natively in EN and ES | ~25 Truth, ~15 Code, ~10 Rule, ~16 Bridges, ~15 Trains, ~20 Robot, ~12 Bug | All |
| Technique, chapter, world and habitat names in EN and ES | ~70 | All |
| Animal names with Spanish article | 12 zoo + 8 cast | `zooart.js`, `logictext.js` |
| One-line animal facts for the Code zoo map | 12+ | Crack the Code |
| Bug kind names and short lessons | 9 | Fix the Bug |
| SVG art listed in each game section | — | All |
| Native Spanish review | All of the above | Before Spanish is called finished |

---

## 8. Risks

1. **Easy Truth Island and Easy Find the Rule have few logic patterns.**
   Variety must come from scenes, casts and gate themes. Budget the art.
2. **Brute-force tapping** on small boards (Truth with 2 animals, Trains with
   2 levers). The Check answer always explains, and ★★★ needs a first-try
   solve, so thinking pays better than tapping.
3. **"Moon says the opposite" on "and" sentences.** The opposite of "A and B"
   is "not A, or not B, or both". Keep Moon "and" claims out until Hard and
   teach it with its own "why" template.
4. **Robot Path generation time.** The full search for par is slow above 8
   tiles. Hard uses the generator's program as par; a child who beats it just
   gets ★★★.
5. **Memory points (Train Tracks h4) and "What if…?" (Bridges T8)** may be too
   abstract for 10–11. Build them last in their game; drop them if a playtest
   says so.
6. **Spanish.** Every template needs a native read before it is called done.
   The teasers room has the same debt.
7. **The room layout is not committed** (2.1). Nothing in Phase 0 can start
   until it is.
