# Curio Trivia: build plan

This is the hand-off to the model that builds it. Read, in this order:
1. `PLAN-codebase-notes.md` (how a Fun game is wired in this app, line by line)
2. this file
3. `01-content.md` (what children know at each age, the categories, the
   sub-topics, the writing and Spanish rules, 18 calibrated sample questions)
4. `02-design.md` (the engagement and feedback research behind the choices)

The two research files are the source for any detail this plan compresses.
When this plan and a research file disagree, this plan wins: it is where the
decisions were made.

## What we are building, in one paragraph

A sixth game in the Fun and Games room. A child picks a level (Easy 4-6,
Medium 7-10, Hard 11-15), a category or "Mixed", and a round length, then
answers questions by tapping one of three or four choices. Every question is
written in English and Spanish side by side; a button on the card flips the
question, the choices, the feedback and the fun fact to the other language.
Every answer, right or wrong, ends with the correct answer and a one-line
"why" that teaches something. The game remembers what a child has seen so a
family playing once a week for a year never meets the same question twice,
and brings missed questions back a few weeks later, which is the schedule the
retrieval-practice research says works. Stars only go up. There is no timer,
no lives, no daily streak.

## Decisions already made (do not reopen)

| Question | Decision | Why |
|---|---|---|
| Name on the tile | **Curio Trivia** | Matches the brand. Game id `trivia`. |
| Route | `#/fun/trivia`, `#/fun/trivia/play`, `#/fun/trivia/learn` | Only `play` and `learn` steps exist under `#/fun/<game>`; `linkcheck` enforces it. |
| Tile hue | `orchid` | The only warm hue no game tile uses. `leaf` is the chess room; `flamingo` is the fun room itself. |
| Levels | `easy` (4-6), `medium` (7-10), `hard` (11-15) | Shown to the child as "Easy · ages 4 to 6" etc. |
| Choices | Easy 3, Medium 4, Hard 4 | Working memory. Easy choices each carry an emoji. |
| Formats at launch | multiple choice, true/false (Medium and Hard only, at most 15% of a file) | Everything else is phase 8. |
| Round length | pills 5 · 10 · 15; default 5 at Easy, 10 otherwise | ~3 minutes at Easy, ~6 at Hard. |
| Timer | none, at any level | Timed play raises anxiety and teaches nothing. Possible opt-in later. |
| Wrong answer | answer first, kindly, then the why; never the word "wrong", no red X | See `02-design.md` §4. The chosen wrong tile turns amber (`--gp-retry`), the right one green. |
| Second chance | a missed question comes back at the end of the round as "One more look", at most 2 per round | Repeated successful retrieval is what makes a fact stick. |
| Language | per-question **text** pill "Español" / "English", no flag emoji | Flags are countries, not languages. The child's last choice is remembered. |
| What flips with the language | stem, choices, feedback line, why, the Next button and the card's own labels | The page chrome stays English, like every child screen on the site. |
| Word games | Words & Language is two native pools (`lang: "en"` and `lang: "es"`), never translated | A rhyme cannot be translated. The toggle is hidden on those cards. |
| Read aloud | Easy: automatic on every question and on the feedback. All levels: a speaker button. Spanish voice when the card is in Spanish | Most 4-6 year olds cannot read the stem. |
| Memory | `settings.trivia` in `localStorage`: seen questions, stars per category, last round | No login, nothing uploaded, same as every room. |
| Rewards | 1 star per correct answer (including on a second look); category ranks Explorer 10 · Guide 25 · Expert 60 · Master 120 stars; a Fact Book that fills up | Competence-only rewards. Nothing is ever taken away. |
| Question bank | 16 categories × 3 levels × 60 = **2,880** questions. Ship gate: **30 per category per level (1,440)**. | 52 weeks × 10 questions = 520 per level per year with zero repeats. 960 per level is almost two years. |
| Learn mode | the Fact Book: every "why" line, browsable by category and level, collected ones marked | The site rule is "meet the material before it is tested"; for trivia the material *is* the fun facts. |
| Two players | phase 8, pass-and-play, each at their own level | Siblings at different ages on one iPad. |
| Physics | its own category, `physics`, separate from `science` | The user asked for enough physics: forces, the laws of motion, energy, light, sound, and the universe. One shared file would starve it. |
| Outside-the-box | three categories that are not school subjects: General Knowledge, Why Is That?, Brain Teasers & Logic | Breadth, curiosity and thinking, next to the academic ones. |

## Working rules (do not skip)

- Work one phase at a time. Each phase ends with `npm run verify` green and
  one git commit. Commit message: what changed and why, in plain words, the
  way the existing log reads.
- After every phase update `PROGRESS.md` in this folder: tick the phase, note
  what you left undone, note anything the next model needs. The session can
  end at any moment; the log is the memory.
- No inline `style=""` attributes anywhere (the CSP drops them in production
  and `tools/serve.py` drops them locally). Use classes, or `data-style` plus
  `paint()`.
- No new npm dependencies. No CDN. No fetch to another origin.
- Screens import modules; modules never import screens; nothing imports
  `app.js`. `tools/archcheck.mjs` enforces this.
- Every function that decides something (which questions, which order, what
  a tap means, what a star is) lives in `modules/trivia.js` and has a node
  test. The screen only draws.
- Text for a child: short sentences, no jargon, read-aloud friendly. One idea
  per screen. The child should tap something within 10 seconds of arriving.
- Nothing punishes a mistake. Stars only go up.
- Test in the browser pane with `tools/serve.py` (the `giftedprep` entry in
  `.claude/launch.json`), never `python3 -m http.server`. Check the CSP header
  is there before trusting a browser test.
- Never reproduce a copyrighted quiz item. Facts are free; wording is ours.

## Routes and screens

| Route | Screen id | What it shows |
|---|---|---|
| `#/fun` | `fun` (exists) | The hub; add the tile |
| `#/fun/trivia` | `triviasetup` | The setup card first (level, category, how many questions, language, Start), then the Learn box (Fact Book link) below it |
| `#/fun/trivia/play` | `triviagame` | One question at a time, then the results |
| `#/fun/trivia/learn` | `trivialearn` | The Fact Book |

Back targets: `routes.js` returns `null` under `#/fun/<x>`, so each section
carries its own single `.gp-backlink`: setup → `#/fun` "Back to games", game
→ `#/fun/trivia` "Change the round", learn → `#/fun/trivia` "Back to the
game". `smoke.js` counts exactly one visible backlink per page.

## Files to create

```
assets/js/modules/trivia.js          pure: load, pick a round, shuffle choices, judge, seen weights, stars, ranks
assets/js/screens/trivia.js          the three screens and their handlers (DOM only)
data/fun/trivia/manifest.json        categories, levels, counts per file (built by the checker, see below)
data/fun/trivia/animals.json         one file per category, all three levels inside
data/fun/trivia/space.json
data/fun/trivia/body.json
data/fun/trivia/earth.json
data/fun/trivia/science.json
data/fun/trivia/geography.json
data/fun/trivia/cultures.json
data/fun/trivia/history.json
data/fun/trivia/math.json
data/fun/trivia/words.json
data/fun/trivia/art.json
data/fun/trivia/everyday.json
data/fun/trivia/general.json
data/fun/trivia/physics.json
data/fun/trivia/why.json
data/fun/trivia/puzzles.json
tools/triviacheck.mjs                validates every question; rebuilds manifest counts; added to verify
tools/tests/trivia.test.mjs          node tests for modules/trivia.js
docs/research/trivia/CREDITS.md      fact sources used, by category
```

Files to edit: `assets/js/screens/fun.js` (`FUN_GAMES`, `ART.quiz`,
`renderFun` dispatch), `assets/js/modules/shell.js` (`SCREENS`,
`state.trivia`), `assets/js/modules/storage.js` (`DEFAULTS.settings.trivia`),
`assets/js/modules/speech.js` (a `lang` option), `assets/js/app.js` (import,
click delegation), `index.html` (three sections), `assets/css/design-system.css`
(`cz-trivia-*`), `tools/linkcheck.mjs` (add `'trivia'`), `tools/smoke.js`
(`GAMES` entry), `package.json` (`triviacheck` in `verify`),
`assets/js/modules/sections.js` (fun room meta: "6 games"), `README.md`.

`fun.js` is already 879 lines and archcheck warns past 700. The trivia screen
is its own file; `renderFun` only forwards to it, the way it forwards to
`learn.js` today (screens may import screens).

---

## The data

### One question

```json
{
  "id": "animals-easy-012",
  "level": "easy",
  "type": "mc",
  "lang": "both",
  "emoji": "🐄",
  "q":   { "en": "Which animal says moo?",
           "es": "¿Qué animal hace \"muuu\"?" },
  "choices": [
    { "en": "Cow",  "es": "La vaca",  "emoji": "🐄" },
    { "en": "Dog",  "es": "El perro", "emoji": "🐶" },
    { "en": "Duck", "es": "El pato",  "emoji": "🦆" }
  ],
  "answer": 0,
  "why": { "en": "Cows moo to talk to each other, and a mother cow knows her own calf's voice.",
           "es": "Las vacas mugen para hablar entre ellas, y una mamá vaca reconoce la voz de su ternero." },
  "topic": "animal sounds",
  "source": "https://kids.nationalgeographic.com/animals/mammals/facts/cow"
}
```

- `id` is `<category>-<level>-<three digits>`, numbered from 001 within the
  file, never reused, never reordered (the seen tracker stores ids).
- `type` is `mc` or `tf`. A `tf` question has exactly two choices, in this
  order: `{ "en": "True", "es": "Cierto" }`, `{ "en": "False", "es": "Falso" }`,
  and is never `easy`.
- `lang` is `both` (default), `en` or `es`. An `en`/`es` question has only
  that language in `q`, `choices` and `why`; the checker rejects the other.
  Only `words.json` and `puzzles.json` may use `en`/`es` (a rhyme or a
  riddle lives in one language); every other file must be `both`.
- `choices` keep the **same order in both languages**. `answer` is one
  shared index. The screen shuffles at render time with `spreadAnswer`, the
  same helper the other games use, so the right answer does not sit in the
  same slot twice running.
- `emoji` on the question is optional and shown beside the category chip.
  `emoji` on every choice is **required at Easy** and optional elsewhere.
  One emoji, no skin-tone or gender modifiers, no flags (they render as
  letters on Windows).
- `why` is 12 to 25 words in each language. It starts with the fact, adds one
  memorable detail, and must read correctly to a child who answered wrong.
- `topic` is a short lowercase tag from the sub-topic lists in `01-content.md`
  §2; the checker uses it to warn when one topic hogs a file.
- `source` is a URL a reviewer can open. One per question. Wikipedia is
  allowed only when the fact is also in a textbook or a museum page; prefer
  NASA, NOAA, USGS, Britannica Kids, National Geographic Kids, Smithsonian,
  KidsHealth, the RAE for language.

### One file

```json
{
  "note": "Animals & Nature. Three levels in one file so a reviewer sees the ladder.",
  "category": "animals",
  "attribution": { "facts": "Written for this project from the sources listed per question." },
  "questions": [ ... ]
}
```

### The manifest

`data/fun/trivia/manifest.json` is read by the setup screen so it can say how
many questions are in the chosen pool without loading sixteen files:

```json
{
  "levels": [
    { "id": "easy",   "name": "Easy",   "ages": "4 to 6",   "choices": 3, "count": 5,  "es": "Fácil" },
    { "id": "medium", "name": "Medium", "ages": "7 to 10",  "choices": 4, "count": 10, "es": "Medio" },
    { "id": "hard",   "name": "Hard",   "ages": "11 to 15", "choices": 4, "count": 10, "es": "Difícil" }
  ],
  "categories": [
    { "id": "animals", "emoji": "🐾", "name": "Animals & Nature", "es": "Animales y naturaleza", "file": "animals.json",
      "counts": { "easy": 60, "medium": 60, "hard": 60 } },
    ...
  ]
}
```

`tools/triviacheck.mjs` recomputes `counts` from the files and fails if the
manifest disagrees (run it with `--write` to update the manifest; the plain
run only checks, so a stale manifest cannot ship).

### The sixteen categories

| id | emoji | English | Spanish | Ship-gate minimum | Target |
|---|---|---|---|---|---|
| `animals` | 🐾 | Animals & Nature | Animales y naturaleza | 30 per level | 60 |
| `space` | 🚀 | Space & the Sky | El espacio y el cielo | 30 | 60 |
| `body` | 🫀 | Human Body & Health | El cuerpo humano y la salud | 30 | 60 |
| `earth` | 🌍 | Earth, Weather & Oceans | La Tierra, el clima y los océanos | 30 | 60 |
| `science` | 🔬 | Science & How Things Work | Ciencia y cómo funcionan las cosas | 30 | 60 |
| `geography` | 🗺️ | Geography & Maps | Geografía y mapas | 30 | 60 |
| `cultures` | 🌐 | World Cultures & Languages | Culturas e idiomas del mundo | 30 | 60 |
| `history` | 🏛️ | History & Inventions | Historia e inventos | 30 | 60 |
| `math` | 🔢 | Math & Numbers | Matemáticas y números | 30 | 60 |
| `words` | ✏️ | Words & Language | Palabras y lenguaje | 30 EN + 30 ES per level | 60 + 60 |
| `art` | 🎨 | Art, Music & Stories | Arte, música y cuentos | 30 | 60 |
| `everyday` | 🍎 | Everyday Life: Food, Money, Time & Games | La vida diaria: comida, dinero, tiempo y juegos | 30 | 60 |
| `physics` | ⚛️ | Physics & the Universe | Física y el universo | 30 | 60 |
| `general` | 💡 | General Knowledge | Cultura general | 30 | 60 |
| `why` | 🤔 | Why Is That? | ¿Por qué pasa eso? | 30 | 60 |
| `puzzles` | 🧩 | Brain Teasers & Logic | Acertijos y lógica | 30 EN + 30 ES per level | 60 + 60 |

Plus **Mixed** (🎲 "Mixed · a bit of everything" / "Mezclado"), the default.

Sub-topics per category and age band, eight to ten each, are listed in
`01-content.md` §2. Spread a file's questions across those sub-topics; the
checker warns when more than a quarter of a level's questions share a `topic`.

### Science and Physics: where the line is

`01-content.md` §2 was written with one science category. Split it like this:

- **`physics`** takes forces, motion, gravity, energy, heat, light, sound,
  magnets, electricity, atoms as particles, waves, and the big picture of the
  universe (what stars are, light-years, the Big Bang, black holes).
- **`science`** keeps chemistry (elements, mixtures, reactions, states of
  matter), materials, engineering and how machines work, the scientific
  method, biology that is not the body or animals (cells, plants, microbes),
  and everyday technology.
- **`space`** keeps the objects: planets, moons, the Sun as a place, rockets,
  astronauts, missions, telescopes.

A question about *why* the Moon orbits is physics; a question about *what*
the Moon is made of is space.

### Sub-topics for the four new categories (eight to ten per band)

**Physics & the Universe** ⚛️
- Easy: push and pull; things fall down when you let go; heavy is harder to
  push; a rolling ball slows down and stops (something rubs it); magnets
  stick and push; light makes shadows; sound is a wiggle you can feel (a drum
  skin); hot and cold; float and sink; fast and slow; the Sun is a star that
  gives us light and heat.
- Medium: gravity pulls everything toward the ground; a force is a push or a
  pull; the first law of motion in plain words (a thing keeps doing what it
  is doing until a force changes it); friction slows things; speed is how far
  in how long; kinds of energy (motion, heat, light, sound, stored); a circuit
  needs a loop; a magnet has two poles and a compass is a magnet; light goes
  in straight lines and bounces off a mirror; sound needs something to travel
  through, so space is silent; the Moon has less gravity so you could jump
  higher; the Sun is mostly hydrogen; what a light-year measures (distance,
  not time).
- Hard: Newton's three laws by name and in words (inertia; force equals mass
  times acceleration; every action has an equal and opposite reaction, which
  is how a rocket works); mass versus weight; speed, velocity and
  acceleration; potential and kinetic energy and their trade (a roller
  coaster); energy is never lost, only changed; the speed of light (about
  300,000 km per second) and of sound (about 340 m per second in air, so
  lightning comes before thunder); the electromagnetic spectrum (radio to
  gamma, visible light is a sliver); why things float (Archimedes, density);
  atoms are protons, neutrons and electrons; temperature is how fast
  particles move, and absolute zero; gravity keeps planets in orbit and the
  Moon makes the tides; what a black hole is; the Big Bang and the age of the
  universe (about 13.8 billion years); why stars shine (fusion); waves have a
  wavelength and a frequency.

Physics has a floor the checker enforces with `topic` tags: at every level,
at least 12 questions tagged `forces and motion`, 10 tagged `energy`, 10
tagged `light and sound`, 8 tagged `electricity and magnets`, 10 tagged `the
universe`. That is 50 of the 60, so the laws of motion and the universe can
never be crowded out by the easy-to-write leftovers. Every level carries the
laws of motion at its own height: a rolling ball at Easy, "keeps going until
something stops it" at Medium, Newton by name at Hard.

**General Knowledge** 💡 (breadth; the checker warns if a stem here repeats
one in another file)
- Easy: what colour a banana or the sky is; how many wheels on a bicycle;
  what bees make; what we cut paper with; the days of the week; the four
  seasons; what a doctor, a firefighter, a farmer does; what an umbrella is
  for; which animal gives us milk; how many days in a week.
- Medium: how many days in a year and why leap years exist; how many
  continents and oceans; the colours of the rainbow in order; how many
  minutes in an hour and hours in a day; what a baby kangaroo or a baby frog
  is called; the hottest planet (Venus); the capital of the United States and
  of Mexico; what recycling means; the biggest animal that ever lived; what
  the three states of water are.
- Hard: how many bones an adult has (206) and teeth (32); how many keys on a
  piano (88) and strings on a guitar (6); the smallest country (Vatican City);
  players on a soccer team; the boiling and freezing points of water in both
  scales; the Roman numeral for 50 and 100; what a haiku is; how many squares
  on a chessboard (64) and how many in all sizes (204); the number of time
  zones on Earth (24, roughly); the seven wonders of the ancient world.

**Why Is That?** 🤔 (every stem starts with "Why" / "¿Por qué"; the answer
is the reason, the why line goes one step deeper)
- Easy: why we sleep; why ice melts in the sun; why leaves fall in autumn;
  why we have a shadow; why a dog pants; why we wear a coat in winter; why
  we wash our hands; why a balloon floats up (it is filled with a lighter
  gas); why we brush our teeth; why plants need water.
- Medium: why the sky is blue (blue light scatters most); why we yawn (the
  honest answer: to cool the brain is the best-supported idea; say "scientists
  think"); why cats purr; why the Moon seems to change shape; why onions make
  us cry; why leaves change colour; why we get goosebumps; why ice floats;
  why a heavy ship floats; why the sea is salty; why we see lightning before
  we hear thunder; why bread rises.
- Hard: why the Moon causes tides; why Venus is hotter than Mercury; why soap
  cleans; why popcorn pops; why stars twinkle; why blood is red; why we
  hiccup; why the sky is red at sunset; why airplanes fly; why deserts are
  cold at night; why we cannot breathe on Mars; why helium makes your voice
  high; why the Earth has seasons (tilt, not distance).

Avoid any "why" whose honest answer is "nobody knows" (dreams, why we have
fingerprints exactly). If the science is unsettled, either say "scientists
think" in the why line or pick another question.

**Brain Teasers & Logic** 🧩 (a riddle has one defensible answer; no
trick-by-wording; `lang: "en"` or `"es"` when the riddle depends on words,
`both` when it is pure logic or numbers)
- Easy: what comes next (red, blue, red, blue, ?); which one does not belong
  (apple, banana, car); how many legs do two dogs have; simple "I am" riddles
  (I am yellow, long, and a monkey eats me); which is more (five apples or
  three apples); a pattern of shapes; how many corners on two squares; if
  today is Monday, what is tomorrow; which is heavier, an elephant or a
  mouse; who is older, a grandmother or her grandchild.
- Medium: if all cats have whiskers and Tom is a cat, does Tom have
  whiskers; number patterns (2, 4, 6, ?; 1, 1, 2, 3, 5, ?); classic riddles
  with one answer (what has hands but cannot clap: a clock); odd one out by
  a hidden rule; a simple age or sharing puzzle; how many months have 28 days
  (all of them; say why in the why line so it is not a trick); which weighs
  more, a kilo of rocks or a kilo of feathers (same; the why explains, and
  this one is allowed because the why teaches what a kilo is); mirror and
  rotation in words; a short "who sits where" puzzle with three people.
- Hard: knights-and-knaves lite (one always tells the truth, one always lies);
  the classic three-box or two-door puzzle with a full reason; probability
  with coins and dice; Fibonacci and square-number patterns; syllogisms with
  a wrong-sounding but valid conclusion; counting puzzles (handshakes in a
  room of six); the "lily pad doubles every day" puzzle; a light-switch
  puzzle; simple Venn logic (everyone who plays chess also plays checkers);
  estimation puzzles with a defensible answer (how many seconds in a day).

---

## The question bank

### How much, and in what order

The zero-repeat floor is 520 per level (52 weeks × 10). The target is 60 per
category per level, 960 per level, 2,880 in all, which is almost two years of
weekly mixed play with no repeats and six full category-mode rounds per
category.

Write in batches of **one category, one level, 30 questions** (a JSON array
appended to the file), validate, commit. That is 48 batches to the ship gate
and 96 to the target. Order of writing, by how much children play them:

1. animals, space, physics, body, earth, geography, science (Easy first,
   then Medium, then Hard for each)
2. general, why, math, history, cultures, everyday, art
3. words and puzzles (both pools each)

The game is playable after phase 1 with the 18 samples from `01-content.md`
§7 plus a second 18 you write to the same standard, so the screens can be
built and tested before the bank exists.

### Writing rules (the checker enforces the ones marked ✓)

1. One clearly correct answer, defensible from the `source`. No "best
   answer" judgement calls.
2. ✓ No negatives in the stem: no "not", "NOT", "except", "never"; in Spanish
   no "no es", "excepto", "nunca". No "all of the above" or "none of the
   above" (✓ as a choice string).
3. Distractors are the same class as the answer (three animals, not two
   animals and a car), similar length, no keyword copied from the stem. At
   Easy one gently silly distractor is fine; the other must be plausible. At
   Hard all three must be plausible to an adult.
4. No trick questions and no wordplay traps.
5. ✓ No time-sensitive facts. Banned words in stem and why, both languages:
   "currently", "today", "this year", "newest", "latest", "most recent",
   "record", "tallest building", "largest population", "president",
   "champion", "actualmente", "hoy en día", "este año", "más reciente",
   "récord", "presidente", "campeón", and any four-digit year from 2015 on
   unless the question is `history` and the year is the answer. Stable facts
   only: constants, anatomy, physical geography, dated history, maths,
   definitions, word origins.
6. Global facts for a US audience, Latin America generously. Both units
   when a number matters: "about 93 million miles, 150 million km". Say "in
   the United States" when a fact is US-only.
7. ✓ Out of scope words (both languages, stem, choices, why): religion as
   doctrine (a holiday may be named culturally), living politicians, war
   casualties, gore, weapons as answers, brand names as answers, body
   shaming, death as a punchline. The checker holds a small word list;
   extend it when you find a case.
8. ✓ Stem length: Easy 5 to 9 words, one clause; Medium 8 to 15; Hard up to
   25. Counted in English.
9. ✓ Easy stems spell out numbers ("ten", not "10") so the voice reads them
   well. Medium and Hard may use digits.
10. ✓ Every question has a `why` of 12 to 25 words per language.
11. ✓ Choices in a question are unique after folding case and accents.
12. ✓ Within a file, no two stems are identical after folding; across files,
    the checker warns on identical stems at different levels (a fact may
    climb the ladder, but it must be asked differently).
13. ✓ At Easy, every choice has an emoji and the answer's emoji differs
    from every distractor's emoji.
14. `tf` questions: Medium and Hard only ✓, at most 15% of a level in a file ✓,
    stems are statements, not questions, and half of them are false.
15. Mix academic and delight within every batch: for each level in a file,
    at least a third of the questions should make a child say "really?".
    The sub-topic lists carry both kinds; use both.

### Spanish rules (the checker enforces the ones marked ✓)

- Neutral Latin American Spanish. **Tú**, never usted or vos; ustedes,
  never vosotros. House vocabulary list is in `01-content.md` §5 (carro,
  computadora, celular, papa, jugo, durazno, fresa, piña, aguacate, frijoles,
  pasto, lentes, autobús, boleto, cometa, cerdo, pavo). Pick one word and
  stick to it across the bank.
- ✓ Every Spanish `q` that ends in `?` starts with `¿`; every one that ends
  in `!` starts with `¡`.
- ✓ Months, days, seasons, languages and nationalities are lowercase in
  Spanish (checker looks for "Enero", "Lunes", "Español", "Mexicano" and
  friends mid-sentence).
- ✓ Accents on capitals (África, Él). The checker flags a short list of
  words that are always accented when written as question words at the start
  of a stem: "¿Que ", "¿Cual ", "¿Como ", "¿Donde ", "¿Cuanto", "¿Cuando",
  "¿Quien", "¿Por que".
- Astronomical bodies capitalised when meant as such: la Tierra, el Sol,
  la Luna.
- Numbers: write the same digits in both languages, no thousands separator
  under 10,000, the same decimal point in both, "mil" and "millones" spelled
  out where possible. billion = mil millones.
- Translate the *fact*, not the sentence. If the English joke or rhyme does
  not survive, write a different Spanish sentence with the same fact.
- Words & Language: two native pools, `lang: "en"` and `lang: "es"`, equal
  size, each written from scratch. An `es` item tests Spanish (rimas,
  sílabas, sinónimos, "la palabra que empieza con m"), not Spanish
  translations of English word games.
- Before the ship gate, a native Spanish speaker reads the `es` column of
  every file. Log it in `PROGRESS.md` per file. This is a human step.

### The checker, `tools/triviacheck.mjs`

Structure copies `tools/capitalcheck.mjs` (errors and warnings arrays, exit 1
on errors, attribution required). It:

1. Loads the manifest and every file it names; a file on disk not in the
   manifest is an error.
2. Validates every question against the shape and the ✓ rules above. Reports
   `file: id: reason`.
3. Checks ids are unique across all files and match `<category>-<level>-\d{3}`.
4. Checks `answer` is in range and, for `tf`, that choices are exactly
   True/False, Cierto/Falso.
5. Imports `modules/trivia.js` and proves `buildRound()` can fill a round of
   15 at every level for every category and for Mixed from the shipped bank,
   and that `makeChoices()` never returns two identical strings.
6. Prints a table: per category and level, how many questions, how many
   `tf`, how many `en`/`es`, the top three topics. Warns below the ship gate
   (30) and errors below the phase-1 seed (3 per level per category, so the
   game cannot draw an empty round).
7. With `--write`, rewrites `manifest.json` counts. Without it, a mismatch is
   an error.

Add `"triviacheck": "node tools/triviacheck.mjs"` to `package.json` and
insert it in `verify` after `anglecheck`. Break a file on purpose and watch
it fail before trusting it (the chess log has a story about that).

---

## The game logic, `modules/trivia.js`

Pure. No `document`, no `window` at import time, so the checker and the tests
can import it under node.

```js
export const LEVELS, CATEGORIES            // read from the manifest once loaded
export async function loadManifest()        // fetch data/fun/trivia/manifest.json, cache
export async function loadCategory(id)     // fetch one file, cache in a Map
export async function loadFor(setup)       // one file, or all sixteen for mixed (Promise.all)

export function eligible(questions, { level, lang })
  // level match; lang === 'both' || lang === chosen language

export function weight(seenEntry, today)
  // unseen 1.0
  // wrong, last seen 14+ days ago       0.6   (bring misses back: retrieval practice)
  // wrong, last seen under 14 days      0.15
  // right once, last seen 60+ days ago  0.1
  // right twice or more                 0.02  (retired, but never impossible)

export function buildRound(pool, setup, memory, random = Math.random)
  // pool: eligible questions, grouped by category
  // setup: { level, category | 'mixed', count, lang }
  // memory: { seen, recent }  from storage
  // 1. drop anything in memory.recent (the last 60 ids shown), unless the pool would run dry
  // 2. mixed: round-robin over categories in a shuffled order, weighted pick within
  //    each, no category twice in a row, every category touched before any repeats
  //    single category: weighted pick without replacement
  // 3. words items: only those whose lang is 'both' or === setup.lang
  // returns [{ question, category }]

export function makeChoices(question, level, random)
  // the question's own choices; at Easy exactly 3 (drop distractors from the end
  // if a writer gave 4); order handled by the screen with spreadAnswer/noteSlot

export function judge(question, pickedIndex) -> { right, answerIndex }

export function text(question, field, lang)
  // q / why / choice text in the card's language, falling back to the other
  // language when a one-language item is shown (it never should be, but never
  // render an empty stem)

export function cardLang(question, wanted)
  // 'both' -> wanted; 'en' -> 'en'; 'es' -> 'es'

export function feedbackLine(question, right, lang, level)
  // Right:  "Yes! {answer}."                        / "¡Sí! {answer}."
  // Wrong, easy:   "Good try. It is {answer}."      / "Buen intento. Es {answer}."
  // Wrong, medium: "Close. It is {answer}."         / "Casi. Es {answer}."
  // Wrong, hard:   "Not this time. It is {answer}." / "Esta vez no. Es {answer}."
  // Second look, right: "Got it this time. {answer}." / "Esta vez sí. {answer}."

export function secondLooks(round)
  // the missed questions of this round, first two, appended as { question, category, again: true }

export function record(memory, id, right, today)
  // seen[id] = [rightCount, wrongCount, dayNumber]; recent.push(id) capped at 60;
  // seen capped at 6000 entries (above the whole bank), oldest dropped

export function starsFor(round) -> number     // one per right answer, second looks included
export function rank(stars) -> { name, es, next }
  // Sprout/Brote 0, Explorer/Explorador 10, Guide/Guía 25, Expert/Experto 60, Master/Maestro 120

export function factsCollected(memory, manifest) -> { got, total }
```

Tests (`tools/tests/trivia.test.mjs`): weights; `buildRound` never repeats an
id in a round, never returns two of the same category back to back in Mixed,
respects `recent`, still fills a round when `recent` would empty the pool,
respects `lang` for words; Easy always gets 3 choices; `judge`; `record` caps;
`rank` thresholds; `feedbackLine` in both languages; `secondLooks` caps at 2
and keeps order.

Reuse, do not rewrite: `spreadAnswer` and `noteSlot` from `modules/slots.js`
for choice placement; `shuffle` from `modules/capitals.js`; `escapeHtml`
from `modules/charts.js`; `icon()` from `modules/icons.js`.

---

## The screens, `screens/trivia.js`

### State

```js
state.trivia = {
  manifest: null,
  data: new Map(),                                  // category id -> questions
  setup: { level: 'easy', category: 'mixed', count: 5, lang: 'en' },   // seeded from settings.trivia
  round: null
};
// round = { list, index, right, wrong, answered, slots, choices, lang, streak,
//           stars, learned: [], secondLooks: false }
```

Setup defaults come from `state.settings.trivia` (`level`, `count`, `lang`)
on first render so the child's last choices are back next week.

### Setup screen (`#screen-triviasetup`)

Same skeleton as `#screen-capsetup`: backlink, `gp-page-title` "Curio
Trivia", lede "Questions about animals, space, your body, the world and
more. Every answer teaches you something, even the ones you miss.", then the
`cz-mode cz-mode--practice cz-trivia-play` card `#gp-trivia-setup` (no
"Practice" tag: trivia is played, not practised) drawn by
`renderSetup(manifest, chosen, memory)`, then below it the
`cz-mode cz-mode--learn` box ("The Fact Book" · "Every fun fact in the game,
by topic. The ones you have earned light up. No score, nothing to get
wrong." · button "Open the Fact Book →" to `#/fun/trivia/learn`). The card:

1. **Who is playing?** three `gp-card gp-card--mode` cards (`data-trivialevel`):
   "Easy · ages 4 to 6 · three choices, read out loud", "Medium · ages 7 to 10
   · four choices", "Hard · ages 11 to 15 · four choices, tougher ones".
2. **What about?** `gp-pill` buttons in a `role="radiogroup"` with an `id`
   (`radioGroupKeys` needs one): "🎲 Mixed" first and selected, then the
   sixteen categories as "🐾 Animals & Nature" (`data-triviacat`). Each pill
   shows a small count of questions left unseen at this level, e.g. `58`.
3. **How many questions?** pills 5 · 10 · 15 (`data-triviacount`). Selecting a level
   resets the count to that level's default unless the child changed it.
4. **Language to start in** two pills "English" · "Español"
   (`data-trivialang`). Can still be flipped on every card.
5. Note line: "That is **10** questions. You have seen 120 of 960 at this
   level." and, if a previous round exists in memory, a small
   "Last time you learned:" list of up to three `why` lines with their
   category emoji and a "Read it to me" speaker button.
6. `gp-btn gp-btn--primary gp-btn--big` `data-action="trivia-start"`.

The manifest alone is enough to draw this screen; files load on Start.

### Question screen (`#screen-triviagame`)

Section skeleton copies `#screen-capgame`: `gp-flagbar` with the backlink
"← Change the round" and the `gp-tally` right/wrong pair (`data-trivia-right`,
`data-trivia-wrong`), a `gp-sr-only` h1, and `#gp-trivia-body`
`aria-live="polite"`.

The card (`renderQuestion`), in this order:

```
.cz-trivia-card                      lang="en" or "es" on this element
  .cz-trivia-top
    .gp-ex__count                    "Question 3 of 10"            / "Pregunta 3 de 10"
    .cz-trivia-cat                   "🐾 Animals & Nature"         / "🐾 Animales y naturaleza"
    button.gp-btn.gp-btn--ghost.cz-trivia-lang  data-action="trivia-lang"   "Español" / "English"
                                     (the label is the language you are NOT reading; lang attr set to it;
                                      hidden with a note "This one is an English word game" /
                                      "Este es un juego de palabras en español" on en/es-only items)
    button.gp-btn.gp-btn--ghost.cz-trivia-say   data-action="trivia-say"    speaker icon, aria-label "Read it to me" / "Léemelo"
  .cz-trivia-again (only on a second look)   "🔁 One more look" / "🔁 Otra mirada"
  p.gp-flagq__ask.cz-trivia-q        the stem, with the question emoji before it when present
  .gp-flagq__choices.cz-trivia-choices--3 or --4
    button.gp-choice.cz-trivia-choice  data-triviapick="<index into round.choices>"
      span.cz-trivia-choice__emoji   (Easy always; else when present)
      span.gp-choice__body           the text
      span.gp-choice__mark
```

Easy tiles are at least 88 px tall, Medium and Hard at least 64 px. Text
size steps with the level (`.cz-trivia-card--easy` etc.).

After a tap (`answerTrivia(index)`), exactly as the other games do it:
disable every choice, `is-correct` on the answer, `is-incorrect` on the
picked wrong one, `icon('check')` / `icon('cross')` in the marks (the cross
is the site's mark; the amber colour is what makes it kind), `react('happy',
2300)` or `react('oops', 1800)`, `react('wink', 1400)` on a streak of three,
update the tally. Then append:

```
p.gp-flagq__say.is-right | .is-wrong     feedbackLine(...)
p.cz-trivia-why                          the why, with a small "💡" before it
button.gp-btn.gp-btn--primary.gp-btn--big  data-action="trivia-next"
      "Next question →" / "Siguiente →"  or "See how you did →" / "Ver cómo te fue →"
```

and focus the Next button. Record the answer in memory at once (not at the
end of the round: a closed tab must not lose it). Push the `why` onto
`round.learned`.

Read aloud: at Easy, on every draw, if `state.settings.readAloud`, call
`speech.speak([stem, ...choiceTexts], { lang })` and after an answer
`speech.speak([feedbackLine, why], { lang })`. At every level the speaker
button reads the stem and choices again. Never read before the child has
tapped something on the site (speech is unlocked on the first click by
`app.js`, and Start is a click, so this is already true).

The language pill re-renders the same question in the other language with
the same choice order and the same answered state, sets
`state.trivia.round.lang`, and saves it to `settings.trivia.lang`. If the
question is already answered, the feedback and why re-render in the new
language too. That is the whole "convert to Spanish" feature: the data is
already there, the card just reads the other column.

`trivia-next` advances `index`; when the fresh list is exhausted and
`secondLooks` has not run, append `secondLooks(round)` to the list, set the
flag, and continue (the count line says "One more look 1 of 2"); when that
is exhausted too, draw the results.

### Results (drawn into `#gp-trivia-body`)

Copies `gp-flagdone`. Perfect round: the confetti block with `data-style`
exactly as `drawFlagResults` writes it, heading "Every single one." /
"¡Todas!" and `react('wow', 2600)`. Otherwise "Round finished." / "Ronda
terminada." Then:

- "**8** right, **2** wrong, out of 10." with `gp-flagdone__score`.
- "⭐ 9 stars earned. Animals & Nature: Explorer, 14 to Guide." (per
  category touched, one line each; Mixed lists up to three).
- **What I learned** / **Lo que aprendí**: every `why` from the round as a
  list with the category emoji, a "Read it to me" speaker button, and the
  missed ones first.
- Buttons: "Play again" (`trivia-again`: same setup, new round), "Change the
  round" → `#/fun/trivia`, "Back to games" → `#/fun`.

Save `settings.trivia.last = { day, ids }` here so the setup screen can show
"Last time you learned" next week.

### The Fact Book (`#screen-trivialearn`, `renderTriviaLearn`)

Backlink "← Back to the game". Title "The Fact Book", lede "Every fun fact
in Curio Trivia. The ones you have answered are lit." A level pill row and a
category pill row (Mixed means all). Then a list: one `gp-card` per
question showing the category emoji, the `why` in the chosen language (a
language pill at the top of the page, same behaviour), and a ⭐ when the id
is in `seen`. Every why is readable, seen or not: the site rule is "meet the
material before it is tested". Seen ones simply carry the star, and the
header counts "You have collected 37 of 960 facts at this level." Load
files lazily per category; Mixed loads all sixteen.

### Wiring

- `fun.js`: add to `FUN_GAMES` (after `angles`) `{ id: 'trivia', art: 'quiz',
  hue: 'orchid', name: 'Curio Trivia', sub: 'Animals, space, your body, the
  world. Three levels, every answer teaches you something.', meta: '2,880
  questions · English or Spanish' }` (the meta number is whatever the
  checker table says at ship time; keep it honest). Add `ART.quiz`: a
  speech bubble with a question mark, drawn in the same style as the five
  above, tone and paper from the room tokens. In `renderFun`, before the
  flags fallback: `if (game === 'trivia') { await trivia.renderTrivia(step); return; }`
  and route `step === 'learn'` for trivia to `renderTriviaLearn`.
- `shell.js`: add `'triviasetup', 'triviagame', 'trivialearn'` to `SCREENS`
  and `state.trivia`.
- `index.html`: three sections after `#screen-shapegame`, copied from the
  capital pair plus a learn section with `#gp-trivia-learn`.
- `app.js`: import `{ triviaAction, answerTrivia, renderTrivia }`. In
  `onClick`, **above** the generic `.gp-choice` handler:
  `const tp = ev.target.closest('[data-triviapick]'); if (tp) { answerTrivia(Number(tp.dataset.triviapick)); return; }`
  and the setup pills (`data-trivialevel`, `data-triviacat`,
  `data-triviacount`, `data-trivialang`) each set `state.trivia.setup.*` and
  redraw. Then, next to the chess line:
  `if (action.dataset.action.startsWith('trivia-')) { triviaAction(action.dataset.action, action); return; }`
  and `triviaAction` switches on `trivia-start`, `trivia-next`,
  `trivia-again`, `trivia-lang`, `trivia-say`, `trivia-learn-lang`,
  `trivia-learn-level`. Keyboard: choices are buttons, so Enter and Space
  already work; number keys 1-4 answering is a nice extra at Medium and
  Hard (`onKeydown` in app.js).
- `storage.js`: `trivia: {}` in `DEFAULTS.settings`, with the comment the
  chess key has. Shape:

```json
{
  "level": "medium", "count": 10, "lang": "en",
  "seen":   { "animals-easy-012": [1, 0, 20698] },
  "recent": ["animals-easy-012", "..."],
  "stars":  { "animals": 14, "space": 3 },
  "last":   { "day": 20698, "ids": ["animals-easy-012"] }
}
```

  `day` is `Math.floor(Date.now() / 86400000)`. Write through
  `storage.setSetting('trivia', obj)`. Add a migrate case to
  `tools/tests/storage.test.mjs`.
- `speech.js`: `speak(text, { force, lang })`. When `lang` is `'es'`, pick
  (and cache) a voice: local first, then `es-MX` or `es-US`, then `es-419`,
  then any `es-*`, skipping names containing "Eloquence" when another
  exists, and set `u.lang = 'es-MX'`. If there is no Spanish voice, still
  speak with `u.lang = 'es-MX'` and let the browser substitute; do not go
  silent. Keep every English path exactly as it is. Add a `voiceFor(lang)`
  export so the setup screen can show "No Spanish voice on this device" in
  the note line when true.
- `linkcheck.mjs` line 135: add `'trivia'` to the set.
- `smoke.js` `GAMES`: `{ id: 'trivia', setupScreen: 'screen-triviasetup',
  start: '[data-action="trivia-start"]', answer: '[data-triviapick]',
  screen: 'screen-triviagame', next: '[data-action="trivia-next"]', setup: [] }`.
- `sections.js` fun room: meta `'6 games · English or Spanish'`, blurb can
  stay. `README.md`: the two tables and the Fun paragraph.

### CSS, `design-system.css`

New block `/* Curio Trivia */` after the angle game's block. Classes:
`.cz-trivia-card`, `--easy/--medium/--hard` size steps, `.cz-trivia-top`
(flex, wrap, gap), `.cz-trivia-cat` (a chip: `--room-soft` background,
`--room-ink` text, radius from the tokens), `.cz-trivia-lang`,
`.cz-trivia-say`, `.cz-trivia-again`, `.cz-trivia-q`, `.cz-trivia-choices--3`
(one column at phone width, three across on iPad) and `--4` (two by two),
`.cz-trivia-choice` (min-height 64px; 88px under `--easy`; emoji 1.6em at
Easy), `.cz-trivia-choice__emoji`, `.cz-trivia-why` (a soft panel with the
💡), `.cz-trivia-stars`, `.cz-trivia-learned` (list), `.cz-trivia-book`
(Fact Book cards, `.is-got` for a starred one), `.cz-trivia-pills` (scrolls
sideways on a phone without the page scrolling sideways). Correct and wrong
states come free from `.gp-choice.is-correct` / `.is-incorrect`. Dark mode
comes free from the tokens; check the chip contrast in both. Honour
`prefers-reduced-motion` the way the confetti already does. Colour is never
the only signal: the check and cross icons are already there.

---

## Phases

### Phase 0: this plan (done)
Research, decisions, this file, `PROGRESS.md`. Nothing in the app changes.

### Phase 1: skeleton that plays (one day)
Goal: `#/fun/trivia` exists, a round of the 48 seed questions can be played
at every level, results show, `npm run verify` is green.

1. `data/fun/trivia/manifest.json` and the sixteen files, each with 3
   questions per level (write the 48: the 18 samples in `01-content.md` §7,
   rewritten into the JSON shape, plus 30 more so every category has one
   question per level). `words.json` and `puzzles.json` get `en` and `es`
   items. For `physics`, seed one law of motion at each level.
2. `tools/triviacheck.mjs` with every ✓ rule; wire into `package.json`.
   Break a file on purpose; watch it fail.
3. `modules/trivia.js` with `loadManifest`, `loadCategory`, `loadFor`,
   `eligible`, `buildRound` (no memory yet: pass an empty one), `makeChoices`,
   `judge`, `text`, `cardLang`, `feedbackLine`. Tests.
4. `screens/trivia.js`: setup, question, results. No language pill yet
   (the card renders in `setup.lang`), no read-aloud, no memory.
5. Wiring: `fun.js`, `shell.js`, `index.html`, `app.js`, `linkcheck`,
   `smoke.js`, CSS.
6. Browser check at 1024×768 and 375 wide, light and dark. Paste `smoke.js`
   in the console.

Commit: "Add Curio Trivia: three levels, sixteen topics, a round you can play".

### Phase 2: the language button and the voice (half a day)
1. The `trivia-lang` pill: re-render in place, remember the choice, `lang`
   attributes on the card, hidden on one-language items with the note.
2. `speech.js` `lang` option and `voiceFor`. Easy reads automatically;
   speaker button everywhere; feedback read at Easy.
3. UI strings table below, both languages, on the card and the results.
4. Test on an iPad or Safari: Spanish voice present, fallback message when
   not. Note what voices you found in `PROGRESS.md`.

Commit: "Flip any trivia question to Spanish, and let the game read it".

### Phase 3: memory (one day)
1. `settings.trivia` in `storage.js`; `record`, `weight`, `recent`, and
   `buildRound` honouring memory; `secondLooks`; `starsFor`, `rank`,
   `factsCollected`. Tests for all of it.
2. Setup screen: seeded defaults, per-pill unseen counts, "You have seen X
   of Y", "Last time you learned".
3. Results: stars and ranks, "What I learned", `last` saved.
4. The Fact Book screen.

Commit: "Trivia remembers: no repeats for a year, a second look at a miss, stars and a Fact Book".

### Phase 4: the bank, part one (several sessions)
Batches of 30 (one category, one level) in the order above, for animals,
space, physics, body, earth, geography, science. Each batch: write, run
`triviacheck`, read every `es` line out loud in your head, commit. That is
21 batches, 630 questions. One commit per category is fine if the session
allows; per batch is safer.

Commit per batch: "Trivia: 30 Easy questions about animals" and so on.

### Phase 5: the bank, part two
general, why, math, history, cultures, everyday, art, words, puzzles: 27
batches, 810 questions. The ship gate (1,440) is met at the end of this
phase. Flip the tile's
`meta` to the checker's real total.

### Phase 6: polish and ship
1. Mobile pass: 375 wide, the pills row scrolls, tiles do not overflow, the
   language pill does not wrap under the count.
2. Accessibility pass: focus order, `aria-live` does not double-announce
   (the card re-render on a language flip should not re-read the count),
   reduced motion, screen reader hears the emoji as decorative
   (`aria-hidden` on the emoji spans; the text carries the meaning).
3. Native Spanish read-through of all sixteen files. Log per file.
4. `README.md`, `sections.js` meta, `docs/research/trivia/CREDITS.md`.

Commit: "Curio Trivia is ready: 1,440 questions in two languages".

### Phase 7: the bank, part three (to the target)
The second 30 per category per level, 1,440 more, 48 batches. Reaching
2,880.

### Phase 8: more ways to answer (optional, after the target)
In priority order, each its own phase and commit:
1. **Which is bigger** (`type: "bigger"`): two choices with a number hidden
   until answered; the why states both numbers. Medium and Hard.
2. **Put these in order** (`type: "order"`): tap 3 or 4 tiles in order;
   no dragging. Medium and Hard.
3. **Type it** (`type: "typed"`): one-word answers judged by
   `fuzzy.judgeTyped` with the `names` list in both languages, like the
   capital game. Hard only.
4. **Take turns**: two players on one iPad, each with a name, a level and a
   language, alternating questions, two tallies side by side, no winner
   banner. Setup gains a "Who is playing? · Just me / Two of us" row.

---

## UI strings (card and results only; the chrome stays English)

| Key | English | Spanish |
|---|---|---|
| count | Question {n} of {total} | Pregunta {n} de {total} |
| again | One more look | Otra mirada |
| again count | One more look {n} of {total} | Otra mirada {n} de {total} |
| lang pill | Español | English |
| say | Read it to me | Léemelo |
| next | Next question → | Siguiente → |
| finish | See how you did → | Ver cómo te fue → |
| right | Yes! {answer}. | ¡Sí! {answer}. |
| wrong easy | Good try. It is {answer}. | Buen intento. Es {answer}. |
| wrong medium | Close. It is {answer}. | Casi. Es {answer}. |
| wrong hard | Not this time. It is {answer}. | Esta vez no. Es {answer}. |
| second look right | Got it this time. {answer}. | Esta vez sí. {answer}. |
| perfect | Every single one. | ¡Todas! |
| done | Round finished. | Ronda terminada. |
| score | {r} right, {w} wrong, out of {t}. | {r} bien, {w} por aprender, de {t}. |
| stars | {n} stars earned | {n} estrellas ganadas |
| learned | What I learned | Lo que aprendí |
| again btn | Play again | Jugar otra vez |
| change | Change the round | Cambiar la ronda |
| back | Back to games | Volver a los juegos |
| word game note | This one is an English word game. | Este es un juego de palabras en español. |
| no voice | No Spanish voice on this device, so it will read with an English one. | (English only; it is a chrome line) |

Ranks: Sprout/Brote, Explorer/Explorador, Guide/Guía, Expert/Experto,
Master/Maestro.

---

## Traps to expect (from the chess and fun logs, still true)

- `showScreen` throws on a name not in `SCREENS`; archcheck also
  cross-checks `index.html` ids and every `$('#id')` literal. Add all three
  screen ids in the same commit.
- The generic `.gp-choice` click handler in `app.js` calls the gifted quiz
  and assumes `state.session`. The `[data-triviapick]` check must sit above
  it or a trivia tap will throw inside the gifted code.
- `location.hash = '#/fun/trivia/play'` in `startTriviaRound` fires
  `hashchange` and a second render. Cache `round.choices` per question and
  only rebuild when `index` changes, the way `drawCapQuestion` does, or the
  choices visibly reshuffle.
- `dataset` values are strings. `Number()` the count and the pick index.
- A `radiogroup` without an `id` loses keyboard focus after an arrow key.
- `style="..."` is silently dropped. The confetti uses `data-style`; copy
  it verbatim.
- `react()` ignores unknown moods. Use `happy`, `oops`, `wink`, `wow`.
- Emoji flags render as two letters on Windows. None in the bank.
- A `tf` question with the choices shuffled would show "False, True"
  sometimes. That is fine and even good; do not special-case it.
- Sixteen fetches on Start for Mixed: use `Promise.all`, show the mascot in
  `think` mood while loading (it exists and nothing uses it), and keep the
  cache in `state.trivia.data` so the second round is instant.
- `speech.speak` cancels whatever is playing. Do not auto-read at Medium or
  Hard: a nine-year-old reading faster than the voice will find it
  maddening. The button is there.
- The seen map grows one entry per question ever answered. Capped at 6,000
  entries (above the whole bank), that is under 250 KB. Fine.

## Out of scope, on purpose

Timers, leaderboards, daily streaks, notifications, accounts, downloading
images, any question whose answer can change, and any question copied from
a published quiz.
