<div align="center">

<img src="assets/img/favicon.svg" width="72" alt="">

# CurioZoo

**Screen time that makes you think.** A place for curious kids: real
mathematics, games that are actually puzzles, and practice for the tests
US school districts use to screen for gifted programs.

no login · no tracking · no ads · nothing sent anywhere

</div>

---

## What this is

A free, single-page web app for a child who would rather work something out
than watch another video. It started as gifted-test practice and grew past it;
that practice is now one section among several, and more are planned.

Everything explains itself afterwards, in words a six-year-old can follow.

`app.js` is the shell: the theme, the router, one delegated listener and boot.
It knows no room by name. Every room is one entry in
[`rooms/registry.js`](assets/js/rooms/registry.js) and one folder under
`assets/js/rooms/`, holding its code (`room.js` and whatever it needs), its
screens (`screens.html`) and, if it has any, its own styles (`room.css`). A
room is downloaded only when a child first opens it, so the first page loads
13 small scripts instead of every room in the zoo.

Shared state lives in `modules/shell.js`, and the rules a room needs live in
`modules/` next to their tests. The import graph runs one way — app loads
rooms through the registry, rooms import modules, modules import no room —
and `tools/archcheck.mjs` fails the build on a cycle or on one room reaching
into another, because a cycle in ES modules does not fail at parse time; it
hands you `undefined` at call time, in one branch, on a route nobody clicked.

### Adding a room

1. Make a folder, `assets/js/rooms/<id>/`, with `room.js`, `screens.html` and,
   if it needs its own styles, `room.css`. Copy the shape of a small room such
   as [`rooms/teasers/`](assets/js/rooms/teasers/).
2. Add one entry to `REGISTRY` in [`rooms/registry.js`](assets/js/rooms/registry.js):
   its card on the home page, the addresses it answers, and where its back
   link goes. The comment at the top of that file is the full contract.
3. Run `npm run verify`. `tools/roomcheck.mjs` checks the entry and its files.

`index.html`, `app.js` and the shared stylesheet do not change. A new game
*inside* an existing room (another game under Fun and Games) goes in that
room's folder instead.

### Offline

The site works with no connection: on a plane, in a car, on a school iPad
with the Wi-Fi off. The first visit saves every file on the device — about
16 MB, 4 MB over the wire — and from then on the site opens from that copy.
[`sw.js`](sw.js) does the saving; [`assets/js/offline.js`](assets/js/offline.js)
switches it on and takes updates at a safe moment, which is the next time
the child is on the home page, never in the middle of a round.

- **Open it once online.** Then it works offline in that browser.
- **On an iPhone or iPad, add it to the Home Screen** (Share → Add to Home
  Screen). Safari can clear a website's saved files after about seven days
  without a visit; a Home Screen app is kept.
- **A deploy costs only what changed.** Each file is saved with a hash of its
  contents, so a new trivia file means one download, not sixteen megabytes.

In the repository `sw.js` does nothing (its version reads `'dev'`), so a local
server always shows the code on disk. The deploy fills in the version and the
file list: `node tools/offline.mjs --stamp`. To try the real thing on a laptop,
`npm run serve:offline` builds a stamped copy into `dist/` and serves it on
<http://localhost:8766>; stop the server and reload, and the site still works.

A phone app later (with [Capacitor](https://capacitorjs.com/)) needs none of
this: it carries the same folder inside the app. The Content-Security-Policy
already travels in `index.html` for exactly that case.

Each room has its own colour from the palette and its own creature. The
creatures are all the logo wearing different ears: eight unrelated animal
drawings would look like clip art, whereas one shape in eight hats reads as a
family, and a child recognises the eyes from the top bar.

The one in the top bar is not a picture. It breathes, it blinks, it looks up
when you reach for the logo, and it hops when a child gets a question right. It
is built from the same geometry as the room creatures by
[`mascot.js`](assets/js/modules/mascot.js), driven by a `data-mood` attribute,
and it goes still for anyone who has asked for less movement. There are
standalone files for the places CSS cannot reach — a splash screen, a store
listing — in [`assets/img/logo/anim/`](assets/img/logo/anim/README.md).

The room creatures are alive too: on the home page and on each room's banner
they breathe and blink, each on its own clock, and look up when you point at
them. Everything else that moves marks something the child did. A right answer
pops and a wrong one gives a small head-shake wobble, in every game at once,
because they all share the same answer classes. A finished round counts its
score up, and a perfect one throws confetti that falls once and is gone.
That is [`celebrate.js`](assets/js/modules/celebrate.js), written once for
every room. All of it stops for anyone whose device asks for less motion, and
`tools/animcheck.mjs` fails the build on an animation name with no keyframes,
which is otherwise a rule the browser accepts and quietly ignores.

| Room | What it is |
|---|---|
| **Math Lab** | 86 topics and 609 exercises across grades 1–6. Real mathematics — primes, symmetry, graph colouring, the pigeonhole principle — not worksheets |
| **Math Brain Teasers** | 327 math riddles and puzzles at three levels (ages 6–8, 8–10, 10–13), in English and Spanish, with a hint and a "why" |
| **Curio Trivia** | 4,739 questions on sixteen topics at three levels, in English and Spanish, with a "why" after every answer |
| **Logic Games** | Ten games that make a child think in steps, with 7,840 puzzles: Crack the Code (840 safes), Truth Island (600), Find the Rule (600), Zoo Bridges (900), Train Tracks (1,000), Robot Path (600 levels), Fix the Bug (600), Zoo Traffic Jam (900 lots), Gate Factory (900 machines) and Sunbeam Mirrors (900 boards), at three levels, in English and Spanish, and every puzzle is checked by machine on every build |
| **Fun and games** | Name the Flag, Name the Country Shape, Name the Capital, Name the Element, Guess the Angle and Discovered or Invented? — typed answers in English or Spanish, and a typo still counts |
| **Chess Club** | Fifty-two lessons that start with "tap a piece, tap where it goes" and end with rook endings and tournament manners. Eight mini-games, five opponents, and 3,250 real puzzles |
| **GiftedPrep** | 1,576 questions in the shapes used by the CogAT, NNAT and OLSAT, grades 1–4 |

The gifted practice is built for **familiarization, not coaching** — a
distinction the research takes seriously, and so does this project. See
[the honest bit](#the-honest-bit-about-test-prep) below.

There is also a [**Parent Guide**](assets/js/modules/parents.js) inside the app:
what the tests are, what schools actually require, how the scores work, and an
evidence-based plan for the week before test day.

## Quick start

The repository root **is** the site. There is no build step and no dependencies.

```bash
git clone https://github.com/raroche/GiftedPrep.git
cd GiftedPrep
npm run serve
```

Then open <http://localhost:8765>.

> `npm run serve` runs `tools/serve.py`, which sends the **same
> Content-Security-Policy Netlify does**. Use it rather than
> `python3 -m http.server`. A plain server sends no CSP, and that gap once hid
> a real bug all the way to production: `style="..."` attributes are silently
> discarded under `style-src 'self'`, so the map-colouring grid collapsed and
> the results bars drew at zero width, while everything looked perfect locally.

Before pushing:

```bash
npm run verify
```

That parses every JS and JSON file, validates all 1,576 questions, runs the
duplicate and rule scanners, checks the Math Lab, **recomputes every
mathematical answer from first principles**, checks the flag data against the
image files, and runs the unit tests. Netlify runs the same command, so a
syntax error or a wrong answer fails the deploy instead of reaching a child.

### Deploying

Drag the folder onto [Netlify](https://app.netlify.com/drop), or connect the
repo — [`netlify.toml`](netlify.toml) is already configured with no build
command, a strict Content Security Policy, and a catch-all redirect for the hash
router. GitHub Pages, Cloudflare Pages and S3 all work the same way.

## Features

| | |
|---|---|
| **1,576 questions** | 31 categories across three tests, at least 17 per category per grade |
| **Grades 1–4** | Content and answer-choice counts match the real test level for each grade |
| **Read aloud** | Uses the device's built-in voice. Grades 1–2 are read aloud on the real tests too |
| **Review answered puzzles** | Arrows step back and forward over questions already answered, restoring the tiles and the explanation. Revisiting never changes the score |
| **Explanations** | Every question explains why the answer is right *and* why the tempting wrong one is wrong |
| **Strategy tips** | Each question carries the habit that prevents that specific mistake |
| **Pick a category** | Practice one puzzle type, one whole test, or a mix of all three |
| **iPad first** | Designed for a 1024×768 landscape iPad, works from 375 px up |
| **Light and dark** | Follows the system theme, with a manual override |
| **Nothing is collected** | No account, no analytics, no third-party requests, no telemetry. The only network traffic is the site fetching its own question files from its own domain. Progress lives in `localStorage` and is never uploaded |
| **Read-aloud stays on the device** | Voices are chosen device-first. Some browsers ship cloud-backed "Online" voices that send text to a server; those are used only if the device offers no voice of its own |
| **Parent Guide in Spanish** | A full translation, not a summary, behind a flag button on the guide. The child's screens stay English, matching the real tests |
| **Fun and games** | Name the Flag (250 flags, vault of flags that no longer exist), Name the Country Shape (242 outlines), Name the Capital (192 capitals) and Name the Element (all 118, four kinds of question). Every game also has a browsing mode with no score, so the material can be met before it is tested, and the element one is a full periodic table with the story of how it was built. Typed answers take English or Spanish and forgive a spelling slip. Guess the Angle asks six different ways — estimate it, sort it, read it off a clock face, find it on a roof or a ladder, or work out where a bounced ball lands — and every angle is drawn with mismatched arms at a random rotation, because judging an angle by the length of its arms is the mistake children actually make. Discovered or Invented? asks about 106 things, from water and the wheel to Velcro and Pluto: was it already here, or did people make it? Every card flips between English and Spanish and ends with a one-line "why", and a round never asks the same answer more than three times running |
| **Curio Trivia** | A room of its own. It asks about animals, space, the body, physics, the world and more at three levels (ages 4 to 6, 7 to 10, 11 to 15), every question in English and Spanish with a button to flip it, and a one-line "why" after every answer |
| **Math Lab** | A separate section for advanced maths, grades 1 to 6. 86 topics in two tracks: real mathematics (maps, bridges, primes, infinity, fractals, pi, three unsolved problems) and number skills |
| **Chess Club** | Fifty-two lessons across three levels, one idea at a time: the six pieces first (rook before knight, pawn last, following the Steps Method), then the rules, then tactics, endings, openings, planning and tournament manners. Eight mini-games from Pawn Wars up to a whole game, five opponents that lose on purpose, and 3,250 puzzles filtered out of the six million in the CC0 Lichess database. Stars only ever go up, there is no streak to break, and taking a move back is always free. The room is loaded only when a child opens it |
| **Accessible** | WCAG AA contrast in both themes, full keyboard control, correct/incorrect never signalled by color alone |

Keyboard: <kbd>1</kbd>–<kbd>6</kbd> to answer, <kbd>Enter</kbd> for the next
question, <kbd>←</kbd> and <kbd>→</kbd> to look back over answered ones.

## What is covered

<details>
<summary><strong>CogAT</strong> — 9 subtests, 604 questions</summary>

| Battery | Categories |
|---|---|
| Verbal | Picture &amp; Word Analogies · Sentence Completion · Picture &amp; Word Sorting |
| Quantitative | Number Analogies · Number Puzzles · Number Series |
| Nonverbal | Figure Matrices · Paper Folding · Figure Sorting |

Grades 1–2 use Levels 7 and 8: pictures only, four answer choices, untimed.
Grades 3–4 use Levels 9 and 10: text and numerals, five choices, timed.
</details>

<details>
<summary><strong>NNAT</strong> — 4 item types, 247 questions</summary>

Pattern Completion · Reasoning by Analogy · Serial Reasoning ·
Spatial Visualization (grade 2 and up, matching the real level structure).

Five answer choices at every level, and only Pearson's five validated
color-blind-safe colors: black, white, yellow, blue and green.
</details>

<details>
<summary><strong>OLSAT</strong> — 18 item types, 725 questions</summary>

| Cluster | Categories |
|---|---|
| Verbal Comprehension | Following Directions · Opposites · Sentence Arrangement |
| Verbal Reasoning | Listening Riddles · Story Problems · Word Analogies · Word Odd One Out · Must Have · Word Matrix |
| Pictorial Reasoning | Odd One Out · Picture Analogies |
| Figural Reasoning | Shape Odd One Out · Shape Analogies · Pattern Matrix · Shape Series |
| Quantitative Reasoning | Number Series · Numeric Inference · Number Matrix |

The grade coverage follows Pearson's published scope and sequence, so the
listening types stop after grade 2 and the quantitative types do not start
until grade 3 — the same near-total break the real test has between Level C
and Level D.
</details>

## Fun and games

A section apart from both the test practice and the Math Lab, for games and
memorising.

**Name the Flag.** Every flag in the world, 250 of them. Choose 10, 25, 50 or
all, then how they come: mixed up, by continent, or alphabetically. Wrong
answers are drawn from the same continent, so "which of these four is Chad" is
a real question rather than a giveaway.

Name every flag in a round without one mistake and a vault opens: sixteen flags
of countries that no longer exist, from the Soviet Union to the plain green
flag Libya flew for 34 years. One is shown, and the wrong answers are chosen to
be genuinely tempting. The Ottoman flag is offered against Turkey, Tunisia and
Azerbaijan, which all use a crescent and star.

**Name the Country Shape.** The same kind of game with country outlines instead
of flags, and one real difference: answer from four choices, or **type the name**,
which is much harder. A typed answer is accepted in English and Spanish and
under the names people actually use, so USA, US, United States, The United
States and Estados Unidos are all the same answer, and Holland, Burma, UK and
Côte d'Ivoire spelled without its accents all count. Those name lists are taken
from a dataset rather than written by hand, and a checker proves no two
countries can be named by the same typed string. Getting it wrong by naming a
different real country says which one you named.

A perfect round opens a vault of countries famous for looking like something
else: Italy the boot, Chile the ribbon, Croatia the boomerang, Australia the
scruffy dog. The question there is what the shape resembles, not which country
it is, so the vault is a different puzzle rather than more of the same.

Flags and outlines are bundled in the repository rather than loaded from a CDN,
because the site's own Content-Security-Policy is `img-src 'self'` and a remote
image would be blocked. Outlines are injected inline rather than used as an
`<img>`, since an `<img>` cannot inherit the page colour and these files are a
single silhouette that would otherwise be black on a black page. Country flags come from [flag-icons](https://github.com/lipis/flag-icons)
(MIT), names and regions from the world-countries dataset, and the historical
flags from Wikimedia Commons, where every one used here is public domain.
Country outlines come from [mapsicon](https://github.com/djaiss/mapsicon) by
Regis Freyd — with one correction. Its `rw` folder contains the outline of Saudi
Arabia, so Rwanda shipped here showing the wrong country until a child noticed.
Rwanda is now redrawn from Natural Earth, and every outline is checked against
independent geometry by `tools/shapeverify.py` rather than trusted because of
its filename. It carries no standard licence: its terms are "do what you want
with them as long as you mention me" and no reselling, so it is credited here
and in the data file. The setup offers two scopes. **Countries** is 199 places, and is the default.
**Countries and territories** adds 40 islands and territories that have flags of
their own — Greenland, Puerto Rico, Hong Kong, the Faroes, Aruba, Guam. They are
off by default because Saint Barthélemy arriving unannounced among 239 is
discouraging rather than interesting; meeting them should be a choice. Answer
choices stay inside the chosen scope, since offering Guam to a child who asked
for countries is a trick.

Sovereignty comes from the mledoze/countries dataset with one documented
exception: Taiwan, Kosovo, Palestine, the Cook Islands and Niue are counted as
countries. They govern themselves, a child would call them countries, and a site
for children should not imply otherwise through a data field.

Eleven entries have no flag of their own and fly a parent country's: nine share
the French tricolour, and Heard Island, the US Minor Outlying Islands and the
Saint Helena territory fly the Australian, American and British flags. They are
marked `usesFlagOf` and never asked about or offered as an answer, because
showing the tricolour with nine correct answers is not a question. They still
appear in the browsing mode, where having no flag of your own is the fact worth
meeting.

`tools/flagcheck.mjs` and `tools/shapecheck.mjs` check
the join: every country has a real image file, every bundled image is used, no
two countries share a name or a typed answer, and every vault answer matches
the picture it is shown against.

**Curio Trivia** has its own room at `#/trivia`. Pick a level (Easy 4 to 6, Medium 7 to 10, Hard 11 to 15),
a topic or Mixed, and 5, 10 or 15 questions. Sixteen topics, from Animals &
Nature and Physics & the Universe to Why Is That? and Brain Teasers. Every
question is written in English and Spanish side by side, and a button on the
card flips it; word games and riddles are two native pools instead, because a
rhyme cannot be translated. Every answer, right or missed, ends with the right
answer and a "why" that teaches something. Easy reads itself aloud. There is no
timer and nothing is taken away: a star for every right answer, and the game
remembers what a child has seen so a miss comes back two weeks later and a
fact already known is retired. The Fact Book lists every "why" in the game.
The bank holds 4,739 questions: 100 per topic per level, except Brain Teasers
& Logic, which has 80 Easy, 86 Medium and 73 Hard so far. A family playing
every week does not see a repeat for years; `tools/triviacheck.mjs`
holds every question to the writing rules in `docs/research/trivia/PLAN.md`.

**Math Brain Teasers** has its own room at `#/teasers`: 113 Easy, 106 Medium
and 108 Hard. None was written from scratch. Each one was found in a real
place and retold in plain words, and each keeps its source. Only two kinds
are kept: public domain (Dudeney, Carroll, Loyd, Alcuin, the Greek
Anthology) and traditional folk riddles, each shown to circulate in at least
two other unrelated places. Puzzles made up by a modern author or contest
were taken out; the checker refuses them. Every teaser also records the date
its answer was worked out by hand and its wording read for a second meaning.
`docs/research/teasers/CREDITS.md` lists them all. A child meets every
teaser in a level before any comes back. New teasers go in with
`node tools/teasersmerge.mjs batch.json`, which checks the whole batch and
writes nothing if one item fails, then `node tools/teaserscheck.mjs --write`.

**Discovered or Invented?** is one of the games. Water, gold and Pluto were
already here; the wheel, chocolate and the periodic table were made by people.
Many come in pairs on purpose (graphite and the pencil, magnetism and the
compass, cacao beans and chocolate), so a child has to think about the line
between them. The 106 items are half and half, in `data/fun/discover.json`, and
`tools/discovercheck.mjs` keeps them that way. Every item links to a source;
`node tools/discovercheck.mjs --write` rebuilds the list in
`docs/research/discover/CREDITS.md`.

## Logic Games

A room of its own at `#/logic`, for reasoning in steps: deduce, test, plan
and program. Ten games, 7,840 puzzles, every one solved again by
`tools/logiccheck.mjs` on every build (`docs/research/logic/PLAN.md` and
`PLAN-2.md` have the plans and `PROGRESS.md` the record of what was built
and why).

Every game has a daily puzzle (the same for everyone, made on the device
from the date) and endless practice that never runs out, on top of its
chapters. Chapters open after twenty solves in the one before, three puzzles
ahead are always open, stars only go up, and the room's badge ladder climbs
from Curious Cub to Zoo Genius by total stars. The Spanish still needs a
native read: `docs/research/logic/SPANISH-REVIEW.md`.

**Crack the Code** is the first. A safe is locked with a row of animals, and
each clue is an earlier guess with what it got right. Most safes give all
the clues at once and ask for the one code that fits, because free guessing
on a small board is won by luck; "Could it be?" safes ask whether one code is
still possible; and every chapter's boss is a free crack, where a gentle
detective's note points out a guess that ignores a clue already given.
Easy marks every animal (home, wrong home, not here), Medium moves to counts,
and Hard is Bulls and Cows, with the famous "682" lock on the way. The name
Mastermind is a trademark and is not used.

840 safes: twelve chapters of seventy, three levels. None is written by hand
except the 682 lock. `node tools/logicbuild.mjs code` makes them from fixed
seeds, and `tools/logiccheck.mjs`, part of `npm run verify`, solves every one
again twice: by brute force, to prove exactly one code fits, and with the
step-by-step solver the hints use, so a hint can never run out or cross out
the real answer. Hints come in three taps (where to look, the reason, then
doing it), and the card after a solve explains the key steps. Stars only go
up, and every ten safes in a chapter open a lock on a zoo enclosure. A daily
safe for each level is made on the device from the date, the same for
everyone, with no server.

**Truth Island** is the second. Sun animals always tell the truth and Moon
animals always say the opposite; each animal says something, and the child
works out who is who. They are not called liars: young children hear "liar"
as "bad", and the animals are meant to be liked. Easy anchors every puzzle to
a picture ("there are 3 apples", and the child can count 2), because puzzles
made only of "she is a Moon" never have a single answer. Medium brings
sentences about themselves, same-or-different and counting, and a pencil: a
pencilled token means "maybe", and every speech bubble then says whether its
sentence would be true, must be true, or clashes. Holding a "suppose" in your
head is the hard part, so the pencil keeps it on the screen. Hard adds four
animals, "and / or (or both) / if", two sentences each, and the Cloud animal,
who may say anything. 600 puzzles, fifteen chapters of forty, every one
proven by `tools/logiccheck.mjs` to have one answer, no spare sentence, and a
chain of steps a person can follow, which is what the hints and the "why"
are made from.

**Find the Rule** is the third. Creatures walk up to a gate; some pass and
some are stopped, and the child finds the secret rule ("wears a crown and
has no stripes"). Every test starts with a prediction, which turns it into a
question, and a correct prediction that a creature will be *stopped* earns a
"brave tester" note: children test what they expect to pass, and finding a
rule needs the other kind of test too. Easy tests from a waiting line and
proves the rule by sorting six new creatures, chosen so that a nearly-right
rule always sorts one wrong; Medium and Hard dress creatures up in a machine
and build the rule from parts, which reads back as a sentence as they build.
A wrong rule is answered with one creature it gets wrong, added to the
shelf, and nothing is taken away. Rules are judged by what they do, not how
they are worded: "cap or crown" is right when the rule is "wears a hat".
Medium has a chapter of traps (every passer shares a second thing that does
not matter); Hard has three-part rules, "one or the other but not both", and
pairs, where the rule compares two creatures. 600 puzzles.

**Zoo Bridges** is the fourth: islands with numbers, joined by straight
bridges (at most two between a pair, never crossing) until every island has
its number and all of them are joined. A puzzle type first published by
Nikoli in 1990, here with our own name and words. Tap the water between two
islands to build; every island wears a ring of dots that fill as bridges
arrive, and a full island gets its visiting animal and a tick. The thirty
chapters climb an eight-technique ladder, from "only one friend" and "just
enough" to "don't trap a pair", "keep the zoo together" and "what if…?", and
every puzzle is graded by the hardest technique it needs. The solver only
ever deduces, so when it finishes a grid, that grid has one answer; the
tests check this against brute force. 900 puzzles from 5×5 to 13×13.

**Train Tracks** is the fifth: the zoo railway. Trains run left to right,
one at a time, so nothing depends on speed; each carries an animal to its
house, matched by picture. A switch shows which way it points four ways
(lever, solid live rail, dashed dead rail, words), and GO sends the trains
riding along the track (with reduced motion, their routes are drawn at once).
Easy predicts where a train will stop, then sets switches for one train and
for two; Medium shares switches among four trains and asks for the fewest
lever pulls when switches may change between trains; Hard brings flip
switches that turn over after every train (the idea of the Digi-Comp II and
Bebras's 2018 "Railroad"), choosing the order trains leave, a dead-end siding
that is a stack (Knuth's railway sort: an order can be sorted exactly when it
has no 2-3-1 in it), and a machine of levers and flips together. Every set
puzzle has exactly one setting that works, checked by trying them all.
1,000 puzzles.

**Robot Path** is the sixth: program a zookeeper robot to feed the
animals. Easy uses screen arrows (up, right, down, left), because a robot's
own left and right is a real stumbling block at six; Medium switches to
forward and turns, with the robot's nose always showing where it faces.
Ideas arrive one world at a time: steps, Repeat, a helper row (a
procedure), tiles that only work on painted squares, two helpers, If and
Until ("look before you move"), and a helper that calls itself. The editor
is tap-first, with no dragging: rows of tiles with a slot limit ("7 of 10
tiles"), brackets with their own inside, and a caret. Run animates the
robot, Step goes one move at a time, and a failure stops the robot and puts
a bug on the tile that caused it. Levels are made program-first: a program
is run on an open field to carve the path, and a loop or helper level is
kept only if the plain program with no loops does not fit the slots, so the
idea is needed, not optional. The program runner is our own, so no code is
ever evaluated. 600 levels.

**Fix the Bug** is the seventh, on the same workbench as Robot Path. Each
puzzle takes a Robot Path level and the program that solves it, and puts in
one bug of a kind children really make: a turn the wrong way, a Repeat one
too many (children read "repeat 3" as "three more"), a missing or extra
step, the wrong order, a step outside its loop, the wrong helper, the wrong
check, a forgotten Feed. Easy taps the wrong tile and chooses its
replacement, puts mixed-up tiles back in order, and fixes programs with
exactly one place to fix; every level predicts where the robot will stop,
with wrong answers taken from the same mistakes. Any fix that works counts,
and the best stars go to finding the bug before pressing Run. The hints
teach the routine itself: what happened, what should have happened, step
until they part. A bug jar collects each kind caught, with what it teaches.
600 puzzles.

**Zoo Traffic Jam** is the sliding-block planning puzzle (Nob Yoshigahara's,
sold as Rush Hour; the name and every lot here are the zoo's own). Carts
carrying animals block the keeper's van; tap a cart, tap a dot, and it
slides along its length. One slide is one move however far, and the counter
shows the fewest possible, so ★★★ is a goal a child can see. The fewest
moves is proved, not guessed: breadth-first search over every position the
lot can reach. Lots are made by searching a lot's whole family of positions
backwards from the solved ones and starting as far away as the chapter wants;
for the deepest chapters a lot "climbs", one cart changed at a time, until it
needs 16 to 32 moves. Those searches take seconds, so today's puzzle and
endless practice come from a checked pool built with each bank, not made on
the device. 900 lots and a pool of 360.

**Gate Factory** turns logic gates into zoo doors: AND is a door with two
locks, OR two doors side by side, NOT a flip door, and Hard adds ONLY ONE
(exclusive or). Switches send current through the doors to the lamps at the
animals' houses; a wire with current is thick and solid with a ⚡, one
without thin and dashed. Three kinds of puzzle: say which lamps light, set
the switches so the lamps light as the signs ask (exactly one setting
works), and find the hidden door from a table of tries (exactly one door
fits every try). Every answer is proved by trying every setting of the
switches. 900 machines.

**Sunbeam Mirrors** shines the sun into the zoo; mirrors turn the beam a
quarter turn, rocks stop it, and every animal it passes over wakes up.
Follow the beam to the animal it wakes, turn the mirrors so it wakes them
all, and on Hard place the mirrors yourself. The beam is drawn live as the
child taps, and stars count taps, so thinking first pays. Every board has
exactly one answer, proved by trying every way to turn or place the
mirrors. 900 boards.

## Math Lab

Separate from the test practice. The screening tests measure reasoning, and
this measures nothing at all: it is a place for a child who finds grade-level
maths easy to go deeper.

Grades 1 to 6 are written: 86 topics and 609 exercises.

Grade 2's big ideas are a proof the child can see rather than take on
trust (odd numbers stacking into squares), a genuinely unsolved problem
they can play with today (the Collatz 3n+1 chain), binary reached through
doubling, the fact that perimeter and area are independent, Fibonacci
counted off a real flower, rotational symmetry, the multiplication
principle, and which flat shapes fold into a cube. Sources and the cut
list are in [`docs/research/math-wonders.md`](docs/research/math-wonders.md).

Grade 3 opens up what multiplication and fractions make possible: primes found
with the sieve of Eratosthenes, infinity compared by pairing rather than
counting, Pascal's triangle, the Lo Shu magic square, fair division by cut and
choose, perfect numbers and the odd-perfect question still open after 2,000
years, probability written as a fraction, and why any four-sided shape tiles a
floor.

Grade 6 has Gauss's pairing trick, the mutilated chessboard where a colouring
argument proves an impossibility outright, why a negative times a negative has
to be positive, Goldbach's conjecture from 1742, the birthday problem solved by
counting pairs rather than people, Thales measuring a pyramid by its shadow,
why an hour has 60 minutes, and function machines the child can experiment on.

Grade 5 goes past the tests, since the screening only covers grades 1 to 4.
It has pi found with a piece of string rather than handed over, the
subtraction game where a child who spots the rule can beat any adult who has
not, the square-cube law and why there are no giant ants, powers of ten,
clock arithmetic, Cantor's argument that there are no more fractions than
whole numbers, the Monty Hall doors played twenty times because nothing else
convinces anyone, and Pythagoras shown as three squares that fit.

Grade 4 closes several loops on purpose. The Sierpinski triangle turns out to
be grade 3's Pascal triangle with the odd numbers shaded, which nobody expects.
Euler's V - E + F = 2 explains the cube numbers counted back in grade 2. The
golden ratio comes out of grade 2's Fibonacci. The rest: repeating decimals and
why 0.999... is exactly 1, the triangle angle sum proved with scissors, endless
halves adding to 1, the Caesar shift, and why adding digits tells you about
dividing by 3.

Sixteen topics in two tracks. Each is a short illustrated lesson followed by
puzzles taken one at a time.

**Big ideas** — real mathematics, chosen to be the kind that makes a child want
to keep going:

| # | Topic | The idea | Wow |
|---|---|---|---|
| 1 | Four Colours | Colour any map so bordering countries differ | Four is always enough. It took 124 years to prove |
| 2 | One Line, No Lifting | Which shapes draw in one stroke | Count the odd corners and you can predict it |
| 3 | The Bees' Secret | Which shapes tile with no gaps | Hexagons hold the most honey for the least wax |
| 4 | Snowflakes and Mirrors | Mirror lines and symmetry | A snowflake always has exactly six arms |
| 5 | The Twisted Loop | A Möbius band | Cut it down the middle and it does not fall apart |
| 6 | Socks in the Dark | The pigeonhole principle | Three socks is enough whether the drawer holds 10 or 10,000 |
| 7 | The Tower | Tower of Hanoi | 1, 3, 7, 15, 31 — double it and add one |
| 8 | Handshakes | Counting pairs | Three problems that look different are the same problem |

**Number skills** — the grade 1 curriculum done deeper:

| # | Topic | The idea |
|---|---|---|
| 9 | Ten Frames | Read a quantity in one look instead of counting |
| 10 | Number Bonds | One part-whole picture gives four facts |
| 11 | Doubles, Odd and Even | An even number IS a double; an odd one is a double plus 1 |
| 12 | The Balance | `=` means "same as", so `4 + 5 = 6 + 3` is fine |
| 13 | Missing Numbers | The unknown can hide in any position |
| 14 | Tens and Ones | Adding 10 moves only the tens digit |
| 15 | Equal Groups | Skip counting and arrays, the honest start of multiplication |
| 16 | Patterns and Shapes | Find the rule, including one that grows |

The big ideas are not invented. Zvonkin's *Math from Three to Seven* is a
session-by-session journal of a research mathematician running a circle for
four to seven year olds; his actual sessions include the Möbius band, the Tower
of Hanoi, topology, snowflakes and four colours. The logician Joel David
Hamkins taught graph colouring, chromatic numbers, Eulerian paths and the
Seven Bridges of Königsberg to **seven-year-olds**, and a girl in that class
told him afterwards she wanted to be a mathematician. Both are cited in
[`docs/research/math-wonders.md`](docs/research/math-wonders.md).

Seven exercise types, so it never reads as a worksheet: tap a picture, type a
number, decide true or false, build a ten frame or an array by tapping, colour
a map in and have it checked, work one out **on paper** and come back with the
answer, or hunt for as many answers as you can find.

Several of the big-idea exercises want scissors, coins or a pencil rather than
a screen, and say so. Cutting a Möbius band in half is the point of that
topic, and no animation replaces holding the thing.

Topic four is the one that matters most. Most children read `=` as "write the
answer here" and will call `4 + 5 = 6 + 3` wrong. That misconception is well
documented and is the main obstacle to algebra later. Fixing it at six is free.

Choices behind the number topics are in [`docs/research/math-grade1.md`](docs/research/math-grade1.md),
including the grade-level benchmark each one sits on and where it reaches past it.

## The honest bit about test prep

This project takes a position, and it is worth stating plainly.

- **Familiarization gains are real but small and front-loaded.** A meta-analysis
  of 122 studies puts the first-exposure effect at about **0.27 SD** — roughly
  four IQ points — dropping to 0.15 and then 0.10 on later retests.
- **Brief format orientation is the *smallest* coaching effect.** Extended
  drill-and-practice produces the largest. The comfortable end is also the
  low-yield end.
- **Coaching gains are largely test-specific.** They inflate the score without
  inflating the reasoning the programme will actually demand.
- **The CogAT publisher's own concern is inequality, not preparation.** Riverside
  Insights notes that practice correlates with family income and reduces
  diversity in gifted programmes, and recommends schools give the free official
  materials to *every* child.
- **The clearest documented harm is an anxious parent drilling a child.** In 438
  first and second graders, children of math-anxious parents learned
  significantly less across the year — but **only when those parents helped
  frequently with homework**. Anxious and hands-off showed no effect at all.

So the app is built for one short session, not a course. It holds enough
variety that a random set never repeats itself, and the Parent Guide says plainly
that the useful dose is one sitting, then stop.

**No real test items appear anywhere in this project.** Every question was
written from scratch to match formats described in published manuals and
district documents. All the sources are in [`docs/research/`](docs/research/).

## Research

The question bank is built on primary sources, not on prep-site folklore. The
notes record every claim's origin, and every place the sources contradict each
other.

The site is written for families anywhere in the United States. Two of these
documents survey a single state in depth. That is deliberate and it is labelled:
identification is set state by state and mostly delegated to districts, so the
only way to say anything concrete about how it really works is to read one state
all the way through and then say which parts generalise. The finding that
carries everywhere is the variation itself — a full standard deviation between
neighbouring districts' cut scores.

| Document | Covers |
|---|---|
| [`florida-gifted.md`](docs/research/florida-gifted.md) | One state read end to end, as a worked example of how identification actually runs: Rule 6A-6.03019, Plan A vs Plan B, and what a district survey shows |
| [`florida-districts.md`](docs/research/florida-districts.md) | Screener, screening grade, cut score and alternative-pathway criteria for the **20 largest districts in that state** |
| [`cogat.md`](docs/research/cogat.md) | Nine subtests, level-to-grade mapping, item counts, timing, SAS scoring, ability profiles |
| [`nnat-olsat.md`](docs/research/nnat-olsat.md) | NNAT3 item types and palette rules, OLSAT-8 scope and sequence, NAI and SAI scoring |
| [`difficulty-model.md`](docs/research/difficulty-model.md) | How grade and difficulty are assigned, and the distractor recipe |
| [`parent-science.md`](docs/research/parent-science.md) | Evidence on prepping, test anxiety, sleep, food and praise |

A few corrections to claims that circulate widely and are wrong:

- CogAT Paper Folding at Level 8 is **16** items, not 14, so Level 8 totals
  **156**, not 154.
- The NNAT's NAI has a standard deviation of **16**, not 15.
- SAS 124 is the **93rd** percentile, not the 95th.
- The CogAT E-profile threshold is **24** SAS points, not 12.
- NNAT and OLSAT level-to-grade tables **diverge from Level D**. A shared lookup
  table will be wrong for one of them.
- gifted screening cut scores range from **107 (Duval) to 122 (Manatee)** — a
  full standard deviation. There is no single state threshold.
- some states have **no decimal benchmark at all in grade 3**, and multiplication
  facts are memorised in **grade 4**, not grade 3.
- An **anticlockwise quarter turn is harder than a half turn** for a child.
  Direction beats magnitude.
- A six-year-old reliably holds about **two** items in working memory, not three.
  That caps grade 1-2 items at two simultaneous rules.

## Project layout

```
GiftedPrep/
├── index.html                  the app shell: top bar, home page, error screen
├── sw.js                       the offline copy; the deploy stamps its file list
├── netlify.toml                deploy config: verify, then stamp sw.js
├── manifest.webmanifest
├── assets/
│   ├── css/design-system.css   tokens, components, light + dark, print
│   ├── img/                    favicon, touch icon, social card
│   │   ├── logo/               the mark, the wordmark, the fiesta lockup
│   │   │   └── anim/           the mascot moving; see its own README
│   │   ├── flags/              250 country flags plus 16 historical ones
│   │   └── shapes/             242 country outlines
│   └── js/
│       ├── app.js              theme, router, event wiring; knows no room by name
│       ├── offline.js          switches on the offline copy, takes updates safely
│       ├── rooms/
│       │   ├── registry.js     every room: its card, its addresses, its back links
│       │   ├── home/           the zoo map (its screen stays in index.html)
│       │   ├── gifted/         test practice, results and the Parent Guide screen
│       │   ├── math/           the Math Lab lessons and every exercise type
│       │   ├── fun/            the games hub, its six games and their browsing modes
│       │   ├── trivia/         Curio Trivia and the Fact Book
│       │   ├── teasers/        Math Brain Teasers
│       │   └── chess/          the Chess Club: lessons, play, puzzles, openings,
│       │                       tournament, and its own room.css
│       │                       (each room: room.js, screens.html, its code)
│       └── modules/            shared by every room; no room's code lives here
│           ├── data.js         loads and caches the question bank
│           ├── quiz.js         session engine (pure logic, no DOM)
│           ├── figures.js      declarative spec → inline SVG
│           ├── speech.js       read aloud via the Web Speech API
│           ├── storage.js      localStorage with a memory fallback
│           ├── charts.js       results ring and bars
│           ├── celebrate.js    confetti, scores that count up, the streak bump
│           ├── icons.js        inline SVG icon set
│           ├── mascot.js       the logo, alive: six moods, CSS driven
│           ├── parents.js      the Parent Guide
│           ├── mathlab.js      Math Lab lessons and exercise engine
│           ├── flags.js        the flag game
│           ├── shapes.js       the country outline game
│           ├── capitals.js     the capital city game
│           ├── elements.js     the periodic table game
│           ├── elemart.js      a drawn picture per everyday element use
│           ├── learn.js        the browsing component the games share
│           ├── fuzzy.js        typo tolerance shared by both typed games
│           ├── slots.js        caps how often the answer sits in one place
│           ├── shuffle.js      the one fair shuffle the games share
│           ├── trivia.js       Curio Trivia: rounds, memory, stars
│           ├── discover.js     Discovered or Invented?: rounds and memory
│           ├── teasers.js      Math Brain Teasers: rounds, memory, sum checker
│           ├── sections.js     the creatures, and the card each room wears
│           └── shell.js        shared state and DOM helpers
├── data/
│   ├── manifest.json           tests, grades, category index
│   ├── cogat/  nnat/  olsat/   one JSON file per category
│   ├── math/                   Math Lab topics, one file per grade
│   ├── teasers/                Math Brain Teasers: one file per level
│   └── fun/                    flag game data: countries, continents, past flags
│       ├── discover.json       Discovered or Invented?, both languages
│       └── trivia/             Curio Trivia: a manifest and one file per topic
├── docs/research/              the sources behind every question
└── tools/
    ├── validate.mjs            checks the whole bank
    ├── mathcheck.mjs           checks the Math Lab data
    ├── mathverify.mjs          recomputes every Math Lab answer from scratch
    ├── flagcheck.mjs           checks the flag data against the image files
    ├── shapecheck.mjs          checks the outline data, names, and that no two
    │                           countries share an outline file
    ├── shapeverify.mjs         proves each outline IS that country, by comparing
    │                           it against independent public-domain geometry
    ├── roomcheck.mjs           checks the room registry: files, routes, CSS, creatures
    ├── archcheck.mjs           checks the rooms stay apart and finds cycles
    ├── offline.mjs             checks and stamps the offline file list
    ├── minify.mjs              shrinks the CSS at deploy time (offline.mjs --minify)
    ├── preloadcheck.mjs        keeps index.html's preload list equal to the start-up imports
    ├── linkcheck.mjs           follows every internal link to a real route
    ├── smoke.js                plays every game in a real browser: paste it in
    │                           the console before shipping a change to a game
    ├── logicsmoke.js           the same for the ten Logic Games: leaving mid-ride,
    │                           scores, level taps, keyboard, phone-sized bridges
    ├── capitalcheck.mjs        checks the capital data and proves the typo
    │                           tolerance never accepts another country's answer
    ├── elementcheck.mjs        proves the periodic table is complete: 1 to 118,
    │                           no gaps, unique symbols, one cell each
    ├── animcheck.mjs           checks the mascot animations and their timing
    ├── palette.mjs             builds the palette and proves every contrast ratio
    ├── mkicon.py               rasterises the app icon (no dependencies)
    ├── serve.py                dev server with the production CSP
    └── _authoring.py           helpers used to write the JSON by hand
```

## Adding or editing questions

Questions are plain JSON. A text question:

```json
{
  "id": "cogat-pa-g3-1",
  "grade": 3,
  "difficulty": 2,
  "prompt": "Peach is to fruit as lily is to —",
  "choices": [
    { "id": "a", "text": "flower" },
    { "id": "b", "text": "iris" }
  ],
  "answer": "a",
  "explanation": "A peach is a kind of fruit. A lily is a kind of flower...",
  "strategy": "Say it as a sentence. A peach is a type of fruit..."
}
```

Pictures are described, not drawn. [`figures.js`](assets/js/modules/figures.js)
turns a compact spec into themed inline SVG, so the JSON stays diffable and one
fix corrects every question at once:

```json
"figure": {
  "kind": "matrix", "rows": 2, "cols": 2,
  "alt": "Top row: a white circle, then a blue circle...",
  "cells": [
    { "shapes": [{ "s": "circle", "c": "blue", "f": "outline" }] },
    { "shapes": [{ "s": "circle", "c": "blue" }] },
    { "shapes": [{ "s": "square", "c": "blue", "f": "outline" }] },
    { "missing": true }
  ]
}
```

Figure kinds: `single` `series` `matrix` `sets` `analogy` `paperfold`
`barchart` `pictograph` `balance` `numberline` `table`.
Shape attributes: `s` shape, `c` color, `f` fill, `n` count 1–9, `r` rotation,
`z` scale, `x`/`y` position.

After any edit:

```bash
node tools/validate.mjs      # everything, or pass a filename fragment
node tools/dupcheck.mjs      # two choices that draw the same picture
node tools/rulecheck.mjs     # the key disobeying its own example
```

`validate.mjs` covers all three. It checks that every answer id matches a
choice, that the choice count matches the real test for that grade, that NNAT
items stay inside Pearson's palette, that every figure renders, that grade-1 and
grade-2 prompts stay short enough to be read aloud once, and two things that are
easy to get wrong and impossible to see in a diff:

- **No two choices may draw the same picture.** Comparing the raw specs is not
  enough — a plus turned 90° is a different spec but an identical image, because
  a plus is four-fold symmetric. `tools/_symmetry.*` records the rotational
  symmetry of every shape so the check compares what the child actually sees.
- **The key must obey the rule its own example demonstrates.** If A becomes B by
  one rule, C must become the answer by that same rule.

After editing a generator, rebuild and re-verify with:

```bash
tools/build.sh
```

## Accessibility

- WCAG AA contrast for every text pair, in both themes, with the measured ratios
  written next to the palette in the stylesheet.
- Correct and incorrect are signalled by **icon, text label, border weight and
  border style** as well as color.
- Every interactive element has a visible focus ring and a touch target of at
  least 64 px.
- `prefers-reduced-motion` neutralises all animation.
- Figures carry plain-language `alt` text, which is also what the read-aloud
  voice speaks.

## Not affiliated

GiftedPrep is an independent project made by a parent. It is not affiliated
with, endorsed by, or derived from Riverside Insights (CogAT), Pearson (NNAT,
OLSAT), the any state education department, or any school district. CogAT is a
trademark of Riverside Assessments, LLC. NNAT and OLSAT are trademarks of NCS
Pearson, Inc.

Nothing here reproduces secure test content. If you believe something does,
please open an issue and it will be removed.

## Contributing

Issues and pull requests are welcome, particularly:

- corrections to the research notes, with a source
- new questions that follow the documented formats
- district-specific information about gifted screening practice
- translations

Please run `node tools/validate.mjs` before opening a pull request.

## License

[MIT](LICENSE).
