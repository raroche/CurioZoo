# Logic Games, part 2: build plan for three more games

The owner chose three games from the research report
(`reports/More logic games for CurioZoo.md`):

1. **Zoo Traffic Jam** (`jam`): sliding-block planning, the Rush Hour mechanic.
2. **Gate Factory** (`gates`): AND, OR and NOT as zoo doors and lamps.
3. **Sunbeam Mirrors** (`mirrors`): turn mirrors so a sunbeam wakes the animals.

They are built one at a time, in that order, each committed on its own. Every
rule of PLAN.md section 1 still holds: long games (at least 200 puzzles per
level, three levels), logic not luck, fun first, no timers, stars only go up.

## What every one of the three gets (the room's design, unchanged)

- **A bank** in `data/logic/<id>/<level>.json`, built by
  `node tools/logicbuild.mjs <id>` from fixed seeds and re-checked on every
  build by `tools/logiccheck.mjs`. Three chapters of 100 puzzles per level,
  the first three of each a teaching puzzle.
- **One solver, four jobs**: grade a puzzle, prove its answer (one answer,
  or for a move puzzle the proven fewest moves), give a hint, explain.
- **Today's puzzle and endless practice**, made by the same maker from a
  date or count seed (`rooms/logic/daily.js` retries other seeds, then
  falls back to the bank).
- **Hints that teach** (look here → the idea → do one step), **Show the
  answer** after two hints (the puzzle is then worth one star), **Play this
  one again** on the end card, **Undo** and **Start again**.
- **Goal and how-to lines** on the puzzle itself, in English and Spanish, so
  a child who arrives from today's puzzle knows what to do.
- **Tap first**: every move is taps, never a drag. Keyboard and screen
  reader can play it all. Meaning is shown by shape or word, never colour
  alone. Reduced motion skips the animation and shows the result.
- **A collection** on the game's page (each chapter fills a pen), a game card
  on the hub with its own picture, and a check in `tools/logicsmoke.js`.

## 1. Zoo Traffic Jam / Atasco en el zoo (`jam`)

**Play.** Zoo carts block the keeper's van in a parking lot. Tap a cart, then
tap one of the dots in its lane to slide it there, until the van can drive
out of the gate on the right. Carts only slide along their length.

**Pieces.** The keeper's van (2 long, always on the gate row), carts (2 long)
and trucks (3 long), each carrying an animal so it has a name ("the lion
cart"). Hard adds rocks that never move.

**Counting.** One move is one slide of one cart, however far, as in the
original. Sliding the same cart again straight away is still one move.

**Proof.** Breadth-first search over every position reachable from the
start. Puzzles are picked the way the published 6×6 counts were made: build a
random lot, search its whole family of positions backwards from the solved
ones, and start from a position the exact number of moves away that the
chapter wants. That gives the fewest moves as a fact, not a guess.

| Level | Chapters | Lot | Fewest moves |
|---|---|---|---|
| Easy | First Jam (5×5) · The Big Lot · Trucks | 5×5, 6×6 | 1–4, 3–7, 5–10 |
| Medium | Busy Morning · Rocks · Rush | 6×6 | 8–12, 10–15, 13–19 |
| Hard | Gridlock · Rock Garden · Master Keeper | 6×6 | 18–24, 20–28, 25–40 |

**Stars.** ★★★ in the fewest moves, ★★ within a few more, ★ otherwise, ★ if
the answer was shown. **Hint**: "look at what blocks the van" → "this cart
must move first" (the next move on a shortest path, highlighted) → make that
move. **Show the answer** plays the shortest path one move at a time.

## 2. Gate Factory / La fábrica de puertas (`gates`)

**Idea.** A machine of zoo doors. Switches on the left are on or off; the
current runs through doors to a lamp at an animal's house. Three doors, each
with a picture as well as a word:

- **AND (Y)**: a door with two locks. It opens only if both are on.
- **OR (O)**: two doors side by side. Either one lets you through.
- **NOT (NO)**: a flip door. On comes out off, off comes out on.
- Hard adds **XOR (O… O)**: "one or the other, not both".

On wires are thick and solid with a ⚡; off wires are thin and dashed.

**Modes.**
- **Will it light?** Read the machine and say whether the lamp lights (and,
  later, which lamps).
- **Light the lamp.** Set the switches so the lamp lights (and the others
  stay dark). Exactly one setting works.
- **Which door?** One door is hidden. The table of tries shows when the lamp
  lit; pick the door that fits. Exactly one door type fits.

**Proof.** Try every setting of the switches (at most 2⁵ = 32): a "light it"
puzzle has exactly one setting that works, a "which door" puzzle exactly one
door type that fits every row shown.

| Level | Chapters | Machine |
|---|---|---|
| Easy | Doors and Locks (one door) · Flip Doors (NOT) · Two Doors in a Row | 2–3 switches, 1–2 doors |
| Medium | Light It · Which Door? · Two Lamps | 3–4 switches, 2–4 doors |
| Hard | Big Machine · One or the Other (XOR) · Master Builder | 4–5 switches, 4–6 doors, 1–3 lamps |

**Hint**: follow the current from one switch → what this door needs → set
one switch (or name the door).

## 3. Sunbeam Mirrors / Espejos de sol (`mirrors`)

**Idea.** The sun shines a beam into the zoo. Mirrors bounce it at right
angles. Turn the mirrors so the beam reaches every sleeping animal and wakes
it up. The beam stops at a rock or the edge.

**Pieces.** Turnable mirrors (tap to flip between / and \), fixed mirrors
(marked with a bolt, cannot turn), rocks, sleeping animals. Hard adds empty
squares where the child places a limited number of mirrors (tap to cycle:
none, /, \).

**Modes.**
- **Where does it go?** (first chapter) Follow the beam and tap the animal it
  wakes.
- **Wake them all.** Turn the mirrors so the beam reaches every animal.
  Exactly one way works.
- **Place the mirrors** (Hard). Put the given number of mirrors on empty
  squares. Exactly one way works.

**Proof.** Try every setting (2ⁿ for n turnable mirrors, n ≤ 10; choices of
squares and slants for placing, kept small). Keep only puzzles with exactly
one working setting, so every mirror the child can turn matters.

| Level | Chapters | Board |
|---|---|---|
| Easy | Where Does It Go? · One Mirror Turns · Two Animals | 4×4–5×5, 2–4 turnable |
| Medium | Rocks in the Way · Fixed Mirrors · Three Animals | 5×5–6×6, 4–7 turnable |
| Hard | Long Beam · Place the Mirrors · Master of Light | 6×6–7×7, 6–10 turnable or 2–3 to place |

**Hint**: "follow the beam from the sun" → "this mirror sends it the wrong
way" → turn it. The beam is drawn live as the child taps, so every tap is
feedback.

## Order of work

1. This plan.
2. Zoo Traffic Jam: logic module + tests, bank builder + checker, board,
   words in both languages, hub card, smoke checks. Commit.
3. Gate Factory, the same steps. Commit.
4. Sunbeam Mirrors, the same steps. Commit.
5. Room totals, README, PROGRESS, CREDITS, SPANISH-REVIEW. Open a PR.
