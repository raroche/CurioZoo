# Writing Curio Trivia questions

Read this whole file before writing one question. Then read the category's
sub-topic list: `01-content.md` §2 for the twelve original categories,
`PLAN.md` "Sub-topics for the four new categories" for physics, general,
why and puzzles. Then open the category's file in `data/fun/trivia/` and
read every stem already there, so you never write one again.

## The bar

The game lives or dies on the questions. A child plays this once a week for
years. Every question must do two things: be worth asking, and teach
something in the line after the answer. The test for a question is simple:
would a curious child say "really?" at least once in every three questions,
and would a parent reading over their shoulder learn something too.

What that means in practice:

- **The `why` is the payoff, not a restatement.** It starts with the fact and
  then adds one detail the question did not contain. Bad: "A triangle has
  three sides." Good: "'Tri' means three, so a triangle has three sides and
  three corners, and it is the only shape that cannot be pushed out of
  shape, which is why bridges are full of them."
- **Mix the school with the strange.** In every 10 questions, about 6 are
  things a child is taught (the water cycle, the times tables, the
  continents) and about 4 are things nobody taught them (an octopus has
  three hearts; honey never goes bad; a day on Venus is longer than its
  year). Both kinds must be true and sourced.
- **Vary the shape of the stem.** Not every question is "What is...". Use
  "Which of these...", "How many...", "About how long...", "Which is
  bigger...", "What happens when...", "Where would you find...", a one-line
  scenario ("You drop a feather and a rock on the Moon. Which lands first?"),
  a true/false statement at Medium and Hard.
- **Concrete at Easy, a scene at Medium, a reason at Hard.** Easy asks about
  things a child can see or touch. Medium can set a small scene. Hard can
  ask why, or ask for the number, and its distractors must be plausible to
  an adult.
- **Distractors are the same kind of thing as the answer.** Three animals,
  not two animals and a car. Similar length. No word from the stem repeated
  in the answer alone. At Easy one distractor may be gently silly; the other
  must be plausible. At Hard all three must tempt.
- **Latin America is part of the world.** The families playing are largely
  Hispanic. Rivers, animals, foods, cities, inventors, ruins and stories from
  Mexico, Central America, the Caribbean and South America belong in every
  category, not only in cultures.
- **Both units when a number matters.** "About 93 million miles, 150 million
  km." "100 °C, 212 °F."
- **Stable facts only.** Nothing that can change: no tallest building, no
  most-populous, no current anything, no living politicians, no prices, no
  ages of living people. Constants, anatomy, physical geography, dated
  history, mathematics, definitions, word origins.

## The shape of one question

Write a JSON array of questions with **no `id` field**. The merge tool
assigns ids.

```json
{
  "level": "easy",
  "type": "mc",
  "lang": "both",
  "emoji": "🐄",
  "q":   { "en": "Which animal says moo?", "es": "¿Qué animal hace \"muuu\"?" },
  "choices": [
    { "en": "Cow",  "es": "La vaca",  "emoji": "🐄" },
    { "en": "Dog",  "es": "El perro", "emoji": "🐶" },
    { "en": "Duck", "es": "El pato",  "emoji": "🦆" }
  ],
  "answer": 0,
  "why": { "en": "Cows moo to talk to each other, and a mother cow knows her own calf's voice in a whole herd.",
           "es": "Las vacas mugen para hablar entre ellas, y una mamá vaca reconoce la voz de su ternero en todo el rebaño." },
  "topic": "animal sounds",
  "source": "https://kids.nationalgeographic.com/animals/mammals/facts/cow"
}
```

## The rules the checker enforces (a batch with one error does not land)

| Rule | Easy | Medium | Hard |
|---|---|---|---|
| choices | exactly 3, **every choice has an emoji**, the answer's emoji differs from every distractor's | 4 | 4 |
| stem length (English words) | 4 to 9 | 5 to 15 | 3 to 25 |
| digits in the stem | never: "ten", not "10" | fine | fine |
| true/false | never | at most 15% of the level | at most 15% |
| `why` length, each language | 12 to 25 words | 12 to 25 | 12 to 25 |

Everything, every level:

- `type` is `mc` or `tf`. A `tf` question has exactly these two choices in
  this order: `{ "en": "True", "es": "Cierto" }`, `{ "en": "False", "es": "Falso" }`.
  Its stem is a statement, not a question. Make half of them false.
- `lang` is `both`, except in `words` and `puzzles`, where a question may be
  `en` or `es` and then carries only that language in `q`, `choices` and
  `why` (no empty other-language strings).
- No negatives in the stem: not, except, never / no es, excepto, nunca. No
  "all of the above" or "none of the above" as a choice.
- No dated words anywhere in stem or why: currently, today, this year,
  newest, latest, most recent, record(s), tallest building, largest
  population, president(s), champion(s) / actualmente, hoy en día, este año,
  más reciente, récord, presidente, campeón. No year from 2015 on unless the
  question is history and the year is the answer.
- No out-of-scope words: weapons, murder, suicide, casualties, gore, ugly,
  stupid, dumb, scripture names, brand names (Coca-Cola, Pepsi, McDonald's,
  Nike, Adidas, Disney, Nintendo, PlayStation, iPhone) and their Spanish
  equivalents.
- Emoji: exactly one per slot, no flags, no skin tones, no gender signs.
- Two choices never read the same after folding case and accents.
- No two stems in the file read the same after folding. The checker also
  warns when a stem repeats one in another file; General Knowledge must not
  repeat anything.
- `topic` is a short lowercase tag. `source` is one https URL.
- In `why.json` every English stem starts with "Why" and every Spanish stem
  with "¿Por qué".
- In `physics.json` the tags are exactly `forces and motion`, `energy`,
  `light and sound`, `electricity and magnets`, `the universe` for the
  questions that belong to those, and per level the floor is 12, 10, 10, 8,
  10 of them. At 100 per level aim for 22, 18, 18, 14, 18, and use other
  tags (`heat`, `matter`, `waves`, `measurement`) for the remaining 10.

Spanish, enforced:

- A question ends in `?` so it starts with `¿`; an exclamation with `¡`.
- Question words carry their accent: ¿Qué, ¿Cuál, ¿Cómo, ¿Dónde, ¿Cuánto,
  ¿Cuándo, ¿Quién, ¿Por qué.
- Months, days, seasons, languages and nationalities are lowercase unless
  they start the sentence: enero, lunes, verano, español, mexicano.
- Never usted, never vosotros. Tú and ustedes.

## Spanish, by hand

- Neutral Latin American Spanish. House words: carro, computadora, celular,
  papa (the food), jugo, durazno, fresa, piña, aguacate, frijoles, pasto,
  lentes, autobús, boleto, cometa (the kite), cerdo, pavo, bonito, niño,
  niña. Accents on capitals: África, Él. La Tierra, el Sol, la Luna when
  they are the bodies.
- Translate the fact, not the sentence. If an English joke or rhyme does not
  survive, write a different Spanish sentence with the same fact and the
  same length.
- Same digits in both languages; no thousands separator under 10,000; the
  same decimal point; "mil" and "millones" spelled out where it reads
  better; billion is "mil millones".
- Choices keep the same order in both languages; `answer` is one index.

## Words and puzzles

These two categories hold two pools per level: 50 `en` and 50 `es`, each
written from scratch in its language. An `es` word question tests Spanish
(rimas, sílabas, sinónimos, la palabra que empieza con m, el plural), never
a translation of an English one. A puzzle that is pure logic or numbers is
`both`; a riddle that depends on words is `en` or `es`. A riddle has one
defensible answer and no trick by wording; the why says why.

## How to work

1. Write your batch to a JSON file outside the repo (the task says where),
   as a plain array. Write it in chunks of about 35 questions per file so a
   mistake costs little; the merge tool appends, so chunks are fine.
2. Run, from the repo root:
   `node tools/triviamerge.mjs <category> <path/to/chunk.json>`
   It assigns ids, appends, and runs the checker on that file. If anything
   fails, the file is put back untouched and the errors are printed. Fix the
   chunk and run again. Never edit `data/fun/trivia/*.json` by hand.
3. Do not run the checker with `--write`, do not touch the manifest, do not
   commit. The person running the batches does that once at the end.
4. When every chunk has landed, run `node tools/triviacheck.mjs --file
   <category>.json` once more and report the count line.
