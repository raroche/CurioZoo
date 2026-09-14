# CurioZoo Trivia: Content Research Report

Scope: a free, no-login, no-ads kids' trivia game with three levels (Easy 4-6, Medium 7-10, Hard 11-15), English with a Spanish toggle, academic/"teaches something" questions, enough depth for a family playing weekly for a year without repetition. Sources are numbered in brackets and listed at the end.

---

## 1. What children know and can answer at each age

The three bands map cleanly onto US grade bands: Easy = PreK-1, Medium = grades 2-5, Hard = grades 6-9. The standards below describe what a *typical* child has been *taught*; trivia should sit slightly below the top of each band so most questions are answerable and the "why" line adds the stretch.

### Easy (ages 4-6, PreK-1)

**What they have been taught / can name**

- Colors, basic shapes (circle, square, triangle, rectangle, hexagon), counting to 10-20, comparing "more/fewer", simple addition within 5-10. Common Core K math centers on "representing, relating, and operating on whole numbers, initially with sets of objects" and "describing shapes and space" [1][2].
- CDC milestones: a 4-year-old "names a few colors of items"; a 5-year-old "counts to 10", names some numbers 1-5, uses "yesterday/tomorrow/morning/night", and can attend to one activity for 5-10 minutes [3][4]. That attention window sets the session length: **10 questions, about 5 minutes**.
- Science (NGSS K-1): pushes and pulls; what plants and animals need (food, water, air, light); weather patterns and seasons; sun/moon/star patterns; light and sound; animal body parts and what they are for (eyes to see, wings to fly) [5][6].
- Social studies (typical K-1 scope, e.g. NY framework "Self and Others" / "My Family and Other Families, Now and Long Ago"): family, community helpers (firefighter, doctor), rules, holidays, simple maps of a room or neighborhood, "long ago vs. now" [7].
- Language (CCSS K ELA): rhyming, letter names and sounds, opposites, sorting objects into categories, a handful of sight words [8].
- Everyday knowledge: farm and zoo animals and their sounds, baby-animal names, body parts, the five senses, day/night, hot/cold, the four seasons, fruits and vegetables, vehicles, jobs.

**Reading ability**: mostly none. Most children read short sentences at 6-7; a 4-5 year old recognizes letters, a few sight words and three-letter words at best [9][10]. **Every Easy question must work read-aloud** (parent reads, or Web Speech API text-to-speech) and every answer choice should carry an emoji or picture so a non-reader can choose alone.

**Working memory / options**: working memory capacity is roughly 3-4 chunks in adults and lower in children; a 4-year-old has about half an adult's capacity [11][12][13]. Use **3 answer choices**. Haladyna and Rodriguez's review concludes "three options are usually sufficient" even for adults, so nothing is lost [14][15].

**Phrasing**: one sentence, 5-9 words, one idea, concrete nouns, present tense, no negatives ("which is NOT"), no pronouns that need a referent. For grade-1 text, 40-50% of sentences should be 1-5 words and most of the rest 6-10 [16]. Examples: "Which animal says moo?" "How many legs does a spider have?"

### Medium (ages 7-10, grades 2-5)

**What they have been taught**

- Math: place value to 1,000+, multiplication tables, fractions as parts of a whole and on a number line (grade 3), area/perimeter, telling time, money, simple measurement in both inches/feet and cm/m, beginning decimals (grade 4-5), angles [17].
- Science (NGSS 2-5): properties of materials and states of matter; life cycles, inheritance and traits, fossils; habitats and food chains; erosion, landforms, rocks; magnets and forces; energy and waves (light, sound); the water cycle; weather vs. climate; planets, gravity, day/night and the seasons from Earth's tilt; the Sun as a star [5][6].
- Social studies (grades 2-5 scope): community and world communities; map skills (compass rose, legend, latitude/longitude by grade 4-5); the seven continents and five oceans; US states and regions; local/state history; the Western Hemisphere (ancient Maya/Aztec/Inca, colonization, US founding), basic government (three branches, flag, symbols) [7].
- Geography standards: "the world in spatial terms" and "places and regions" (map use, continents, major countries and capitals, landmarks, physical features such as the Amazon, Sahara, Himalayas) [18][19].
- Language (CCSS L.3-5): prefixes and suffixes, synonyms/antonyms, similes and metaphors, homophones, dictionary use [20].
- Typical trivia-ready facts: largest/smallest animals, animal groups (mammal, reptile, insect), human organs and their jobs, the skeleton, teeth, the eight planets, famous inventions (wheel, printing press, telephone, airplane), famous explorers and scientists, world landmarks, flags, currencies, basic nutrition, simple physics (why boats float, why ice melts).

**Reading ability**: reads independently. Lexile bands: grade 2 about 420-650L, grade 3 520-820L, grade 4 740-940L, grade 5 830-1010L [21]. A 7-year-old is at the bottom of this, so keep questions to **one short sentence, 8-15 words**, common vocabulary, define any technical word in the "why" line.

**Options**: **4 choices** is fine (working memory ~3 items at 7-8, near-adult by 10-11 [11]); three is acceptable if a fourth plausible distractor cannot be written [14].

### Hard (ages 11-15, grades 6-9)

**What they have been taught**

- Math: ratios and rates, percentages, negative numbers, exponents, order of operations, basic algebra (solve for x), geometry (angle sums, Pythagoras, area/volume, pi), probability and statistics (mean, median), scientific notation [22].
- Science (NGSS MS): atoms and molecules, periodic table basics, chemical reactions, conservation of mass; forces and Newton's laws, energy transfer, waves and the electromagnetic spectrum; cells and organelles, body systems, genetics (DNA, dominant/recessive), natural selection, ecosystems and biodiversity; plate tectonics, rock cycle, Earth's history and fossils, weather systems, climate, the solar system and galaxies, human impacts on Earth [5][6].
- Social studies: ancient civilizations (Mesopotamia, Egypt, Greece, Rome, China, India, Maya), world religions treated historically (avoid in trivia), Middle Ages, Renaissance, Age of Exploration, revolutions, industrialization, 20th-century world events, US history through the 20th century, world geography of every continent, civics and economics basics [7].
- Language: Greek and Latin roots and affixes ("bio", "geo", "audi"), connotation vs. denotation, parts of speech, literary terms [20].
- Culture: world languages and where they are spoken, major artists/composers/authors, musical instruments and families, Olympic sports and rules, world cuisines, currencies, famous scientists and inventors.

**Reading ability**: grades 6-8 read roughly 925-1185L; anything short is fine [21]. Questions can be **up to 25 words**, may include a clause of context ("In the 1960s, ..."), and the "why" line can carry a technical term.

**Options**: **4 choices**, with distractors that are truly plausible (same class, same era, same magnitude).

### Summary table

| Band | Reads alone? | Choices | Question length | Vocabulary | Picture/emoji |
|---|---|---|---|---|---|
| Easy 4-6 | No (read-aloud/TTS) | 3 | 5-9 words, 1 clause | 1st-500 words | Required on every choice |
| Medium 7-10 | Yes, short sentences | 4 (3 ok) | 8-15 words | grade 2-4 | Optional, nice on answers |
| Hard 11-15 | Yes | 4 | up to 25 words | grade 6-8, define terms in "why" | Optional |

---

## 2. Category design

### How good products organize categories

- **National Geographic Kids Quiz Whiz** (1,000 questions per volume) uses themed chapters such as "Animal Kingdom", "Blast from the Past", "Weird Science", "Around the World", "The Great Outdoors", "Earthly Extremes" [23][24]. Photo-driven; several chapters per volume; strongly nature/science/geography.
- **Brain Quest** decks are organized *by grade*, then by school subject: Reading, Math, Language Arts, Science, plus "Miscellany" (and Technology in newer editions) [25]. This is the by-grade model our three levels emulate.
- **Trivial Pursuit Family Edition** (ages 8+): Geography, Entertainment, History, Art & Culture, Science & Nature, Sport & Leisure, with a separate kids' deck and adult deck for the same six categories [26]. **Trivial Pursuit Junior**: Every Day Fun, Science, Stories & Songs, Nature, Games [27]. Note that the junior edition drops History/Geography as standalone categories in favor of Nature and Stories: the younger the child, the more concrete the category names should be.
- **Britannica Kids** tiers content by reading level: Fundamentals (PreK-2), Kids (K-5), Students (6-8), Scholars (9+) [28], which validates our three-tier split and is a fact source at each level.
- **BBC Bitesize** uses school subjects (Science, Maths, English, Geography, History, Art and Design, Music, Computing, PE, languages) split by Key Stage (KS1 ages 5-7, KS2 7-11, KS3 11-14) [29].
- **Kahoot! Kids** (ages 3-12) filters by topic carousel and difficulty rather than fixed categories, covering math, reading, and social-emotional learning [30].
- **Smithsonian** kids quizzes cluster into arts & culture, history, and science; **Little Passports** organizes by country/continent with "World Trivia" and map games [31][32].

Takeaways: (a) products aimed at 4-7 use concrete nouns (Animals, Nature, Stories) not disciplines; (b) products for 8+ use school-subject names; (c) the best kids' trivia leans heavily on Animals, Space, Body, Earth and Geography because those have the deepest well of stable, checkable, delightful facts.

### Recommended 12 categories

Each has an emoji so the Easy tier can show icons, and a name that reads well in both languages.

| # | Category (EN / ES) | Why it earns a slot |
|---|---|---|
| 1 | Animals & Nature / Animales y naturaleza 🐾 | Deepest fact well; every age loves it |
| 2 | Space & the Sky / El espacio y el cielo 🚀 | NGSS K, 1, 5, MS; NASA sources |
| 3 | Human Body & Health / El cuerpo humano y la salud 🫀 | NGSS 1, 4, MS; CDC/KidsHealth sources |
| 4 | Earth, Weather & Oceans / La Tierra, el clima y los océanos 🌍 | NGSS K, 2, 3, 5, MS; NOAA/USGS |
| 5 | Science & How Things Work / Ciencia y cómo funcionan las cosas 🔬 | Physics, chemistry, engineering, everyday tech |
| 6 | Geography & Maps / Geografía y mapas 🗺️ | National Geography Standards 1-6 |
| 7 | World Cultures & Languages / Culturas e idiomas del mundo 🌐 | Bilingual audience; C3 "culture" strand |
| 8 | History & Inventions / Historia e inventos 🏛️ | Stable facts; Easy tier uses "long ago vs now" |
| 9 | Math & Numbers / Matemáticas y números 🔢 | Translates perfectly; CCSS-aligned |
| 10 | Words & Language / Palabras y lenguaje ✏️ | Language-specific; see section 5 |
| 11 | Art, Music & Stories / Arte, música y cuentos 🎨 | Colors, instruments, fairy tales, famous works |
| 12 | Everyday Life: Food, Money, Time & Games / La vida diaria: comida, dinero, tiempo y juegos 🍎 | Practical knowledge, sports rules, chess, Olympics |

Evaluated and folded in: "Sports & Games" becomes part of #12 (Olympics, chess, rules of soccer) because a standalone sports category drifts toward current athletes, which are time-sensitive. "Food & Where It Comes From" also lives in #12 at Easy/Medium and in #1/#7 (farming, world cuisines) at Hard.

**Mixed mode** (the default): draw 10 questions per session round-robin across categories so each session touches at least 8 of 12, never two from the same category back to back. Category mode: the child picks one; all 10 come from it.

### Example sub-topics per category and band (8-10 each)

**1. Animals & Nature**
- Easy: animal sounds; baby-animal names; what animals eat; where animals live (farm, ocean, jungle); how many legs; which animal is biggest; fur/feathers/scales; nocturnal animals; plant parts (root, stem, leaf, flower); what a seed grows into.
- Medium: mammal/bird/reptile/amphibian/fish/insect groups; life cycles (butterfly, frog); habitats and biomes; food chains; migration and hibernation; animal records that never change (blue whale largest, cheetah fastest land animal); camouflage; how plants make food; pollination; endangered vs. extinct.
- Hard: vertebrates vs. invertebrates; classification (kingdom to species); adaptations and natural selection; symbiosis; echolocation; metamorphosis; photosynthesis equation; ecosystems and keystone species; animal intelligence (tool use); biomes of each continent.

**2. Space & the Sky**
- Easy: day and night; the Sun is a star; the Moon; we live on Earth; stars come out at night; a rocket goes to space; astronauts; shapes of the Moon; planets are round; the Sun gives heat and light.
- Medium: eight planets in order; Earth orbits the Sun in a year; Moon phases; why we have seasons; gravity; the first person on the Moon; the ISS; telescopes; asteroids vs. comets; the Milky Way is our galaxy.
- Hard: inner/outer planets and composition; light-years; eclipses; tides and the Moon; dwarf planets; rocket stages; Mars rovers; exoplanets; the life cycle of stars; the Big Bang in one sentence.

**3. Human Body & Health**
- Easy: five senses and their organs; counting fingers/toes; teeth for chewing; heart beats; bones inside us; sleep helps us grow; washing hands; fruits and vegetables are healthy; brain thinks; lungs breathe.
- Medium: major organs and jobs; skeleton (206 bones), biggest bone; muscles; blood and the heart; digestion path; baby teeth vs. adult teeth; germs and vaccines (kept simple); food groups; why we sweat; the brain controls the body.
- Hard: body systems; cells and organelles; DNA and genes; red vs. white blood cells; the nervous system and reflexes; how vaccines train the immune system; nutrients (protein, carbs, fats, vitamins); the cerebellum/cerebrum; how hearing and vision work; sleep cycles.

**4. Earth, Weather & Oceans**
- Easy: rain comes from clouds; four seasons; hot/cold; snow is frozen water; rainbows after rain; the ocean is salty; a volcano; rocks are hard; wind moves things; thunder and lightning.
- Medium: water cycle; weather vs. climate; types of clouds; how mountains and rivers form; earthquakes; volcanoes; five oceans; deserts and rainforests; the layers of the Earth; recycling.
- Hard: plate tectonics; the rock cycle; ocean currents and tides; hurricanes/tornadoes formation; the greenhouse effect; the atmosphere layers; erosion and deposition; the deepest point (Mariana Trench) and highest peak (Everest); freshwater share (about 3%); biomes and latitude.

**5. Science & How Things Work**
- Easy: magnets stick to metal; ice melts; things fall down; a wheel rolls; light comes from the Sun and lamps; sound comes from vibrations; a shadow needs light; sink or float; a plant needs water; hot air rises (balloon).
- Medium: states of matter; simple machines (lever, pulley, wheel); electricity and circuits; how a rainbow forms; why boats float; magnets and compasses; what a thermometer measures; sound travels through air; friction; what a scientist does (experiment, hypothesis).
- Hard: atoms and elements; the periodic table basics; chemical vs. physical change; Newton's three laws; energy forms and conservation; the electromagnetic spectrum; how engines and batteries work; speed of light and sound; density; how the internet sends data (kept simple).

**6. Geography & Maps**
- Easy: what a map is; land vs. water; a globe is round; north/south/east/west; my country; a mountain vs. a river; islands; an ocean is bigger than a lake; a compass; a flag.
- Medium: seven continents and five oceans; the equator; major countries and capitals; the 50 states (a few); world landmarks (Eiffel Tower, Great Wall); longest river/largest desert/highest mountain; map legend and scale; latitude/longitude basics; North and South Poles; where Spanish is spoken.
- Hard: country capitals across all continents; time zones; hemispheres; major rivers and mountain ranges by continent; landlocked countries; island nations; climate zones; the Prime Meridian; borders and regions (Scandinavia, Central America); physical vs. political maps.

**7. World Cultures & Languages**
- Easy: hello in Spanish/English; different foods from around the world; musical instruments from other places; people wear different clothes; a piñata; flags have colors; families celebrate holidays; the word "gracias"; animals on flags; counting to three in another language.
- Medium: languages spoken in big countries; greetings in several languages; famous festivals (Day of the Dead, Chinese New Year, Diwali, treated culturally); traditional foods and their countries; world currencies; famous folk tales; traditional music and dance; how people write (alphabets, characters); origins of common words; flags and their symbols.
- Hard: language families; most-spoken languages; the origins of Spanish and English; the Olympic Games history; world heritage sites; ancient civilizations' contributions; migration and diaspora; writing systems; cuisine ingredients and where crops originated (potato, chocolate, coffee); loanwords.

**8. History & Inventions**
- Easy: long ago vs. now; castles and knights; dinosaurs lived long ago; the first cars had no computers; a wheel is an old invention; people used candles before light bulbs; what a museum is; old vs. new (phone, TV); pirates and ships; the first airplane had two wings.
- Medium: ancient Egypt and pyramids; Romans; Maya/Aztec/Inca; explorers and voyages; famous inventions (printing press, telephone, airplane, light bulb) and inventors; the first Moon landing; who was George Washington; dinosaurs and fossils; the Wright brothers; the first computers were room-sized.
- Hard: ancient Greece and democracy; Roman Empire; Middle Ages; Renaissance; Age of Exploration; American and French revolutions; Industrial Revolution; World Wars (dates and outcomes, no gore); civil rights milestones; the history of the internet.

**9. Math & Numbers**
- Easy: counting to 10/20; more/fewer; shapes and sides; simple addition and subtraction within 10; patterns; bigger/smaller numbers; halves; first/second/third; pairs (2 shoes); the number zero.
- Medium: times tables; place value; fractions; even/odd; perimeter and area; telling time; money and making change; Roman numerals I-X; measurement units; rounding; simple word problems.
- Hard: percentages; negative numbers; exponents and square roots; angle sums; pi; prime numbers; mean/median; order of operations; the Fibonacci sequence; probability; scientific notation; famous mathematicians.

**10. Words & Language** (language-specific pools; see section 5)
- Easy: rhymes; first letter sounds; opposites; plurals; animal names; colors as words; letters of the alphabet; "big words" like "enormous"; sight words; naming categories (fruit, vehicle).
- Medium: synonyms/antonyms; prefixes and suffixes; homophones; compound words; nouns/verbs/adjectives; syllables; alphabetical order; idioms; spelling; collective nouns (a herd of cows).
- Hard: Greek/Latin roots; etymology; palindromes and anagrams; figurative language; parts of speech in depth; origins of English/Spanish words; famous quotations; grammar rules; punctuation; vocabulary from science.

**11. Art, Music & Stories**
- Easy: primary colors and mixing; instruments (drum, guitar, piano) and sounds; fairy tales (Three Little Pigs, Goldilocks); what a painter uses; loud/soft, fast/slow; nursery rhymes; crayons and clay; shapes in pictures; a book has an author; dance.
- Medium: famous paintings (Mona Lisa, Starry Night); instrument families; famous composers; fables and their morals; primary/secondary colors; what a sculpture is; famous children's authors; the orchestra; drawing tools; theater words (stage, actor).
- Hard: art movements (Impressionism, Cubism); Renaissance artists; classical composers and periods; musical notation and scales; literary genres; Shakespeare basics; world architecture; photography basics; famous museums; mythology (Greek/Norse/Aztec) as stories.

**12. Everyday Life: Food, Money, Time & Games**
- Easy: where milk/eggs/apples come from; days of the week; morning/night; coins; a clock; which foods are fruits; a ball in soccer; counting in a game; a bicycle has two wheels; traffic light colors.
- Medium: food groups and where crops grow; how bread/cheese/chocolate is made; months and seasons; telling time and time words; coins and bills; simple budgeting; rules of common sports (soccer, basketball); chess piece moves; board game basics; recycling symbols.
- Hard: nutrition labels; where staple crops originated; time zones and leap years; how banks and interest work (simply); Olympic sports and history; chess strategy terms; the rules of tennis/baseball scoring; global foods and trade; how to read a bus timetable; first aid basics.

---

## 3. Question count math

**Assumptions**: one session = 10 questions at one level; a family plays about once a week (52 sessions/year), mostly mixed mode; siblings at different levels each need their own pool (levels are already separate pools, so a Medium child and an Easy child never share questions).

**Zero-repeat floor for mixed mode**: 52 × 10 = **520 questions per level** consumed per year per child. With 12 categories that is 43-44 per category per level to serve a full year of mixed play with no repeats at all.

**Category mode**: if a child picks one category for a session, that category should support several sessions before recycling. 60 questions per category per level = 6 distinct category-mode sessions, which feels bottomless to a child who plays a favorite category once a month.

**Real-world slack**: families sometimes play twice a week, two same-level kids share a pool if they share a device, and some questions get retired after review. Plan 30-40% headroom above 520.

**Recommended target**: **3 levels × 12 categories × 60 questions = 2,160 questions**, i.e. 720 per level = 72 mixed sessions (1.4 years weekly) with zero repeats, and 6 full sessions per category in category mode.

**Stretch (year 2)**: 12 × 100 × 3 = 3,600, which also lets the Words & Language category carry separate EN and ES pools without thinning the mix.

**Minimum viable first release**: **3 × 10 categories × 20 = 600 questions** (200 per level = 20 sessions, about 5 months weekly). Ship with the seen-tracker so early families do not notice the smaller pool, and grow toward the target. If only 12 categories are feasible at MVP, 12 × 17 × 3 ≈ 600 is equivalent. Priority order for filling: Animals, Space, Body, Earth, Geography, Science first (they draw the most play), then the rest.

**"Seen" tracker (localStorage, no login)**

- Store per player profile (child picks a name/avatar on the device; no account): `{ questionId: { correct: n, wrong: n, lastSeen: ISO date } }`.
- Selection weight: unseen = 1.0; seen-and-wrong = 0.6 after 14 days (retrieval practice on misses is the most valuable repeat, and spacing of 10-20% of the desired retention interval is the research sweet spot [33][34]); seen-and-correct once = 0.1 after 60 days; correct twice = 0.02 (effectively retired). This is a Leitner box scheme [35].
- Guarantee: never repeat a question within the same session or within the last 4 sessions regardless of weight.
- Keep the file small: 2,160 ids × ~40 bytes ≈ 90 KB worst case; fine for localStorage.
- Because a wrong answer with feedback is itself a learning event, the tracker should *bring back* missed items after a couple of weeks rather than bury them; this turns the trivia game into spaced retrieval practice, which produces 50-200% better long-term retention than massed exposure [34][36].

---

## 4. Question quality rules

### Writing rules (drawn from Haladyna's item-writing guidelines and kids' trivia practice [14][15][37][38])

1. **One clearly correct answer**, defensible from a listed source. No "best answer" judgment calls.
2. **"Which of these..." multiple choice**; never true/false at Easy (50% guess rate teaches nothing), never "all of the above"/"none of the above", never negatives ("which is NOT").
3. **Distractors**: same class as the answer (three animals, not two animals and a car), similar length and grammar, no giveaway keywords repeated from the stem, no absolute words ("always", "never"). For Easy, one gently silly distractor is fine ("Does a cow say moo, woof, or quack?") because it gives a non-reader an anchor; the other must be plausible. For Hard, all three distractors must be plausible to an adult.
4. **Randomize answer position** at render time; store the correct answer by value or a fixed index and shuffle in code so no bias creeps in.
5. **No trick questions**: no wordplay traps, no "read carefully" gotchas, no questions whose answer depends on an unusual definition.
6. **No time-sensitive facts**: avoid "tallest building", "largest population", "fastest computer", "current president/champion", "most recent", "newest planet found", prices, ages of living people, and any count that changes (number of countries, species discovered). Prefer physical constants, anatomy, geography of physical features, dated historical events, math, definitions, etymology. Where a fact changed once and is now stable (eight planets since 2006), the "why" should say so.
7. **Global facts, US audience**: prefer facts that are true everywhere. Give both units when a number matters ("about 93 million miles, 150 million km"). Avoid US-only assumptions where a global fact exists (say "in the United States" explicitly when the fact is US-specific, e.g. Thanksgiving, the 50 states). Include Latin American geography, history and culture generously; this audience is heavily Hispanic.
8. **Out of scope**: religion (holidays may be mentioned culturally, not doctrinally), politics and living politicians, gore and violence (wars can be dated and named without casualty detail), death of animals as a punchline, body-shaming, brand names as answers.
9. **Read-aloud friendly**: avoid abbreviations, symbols and numerals in Easy stems ("ten" not "10" for TTS clarity; numerals fine in Medium/Hard).
10. **Every question carries a one-line "why"**: 12-25 words, starts with the fact, adds one surprising or memorable detail, uses the same vocabulary as the question, and works for a child who got it wrong ("Not quite: the heart, not the lungs, pumps blood").

### Why the "why" line matters (feedback research)

- Multiple-choice testing improves retention (the testing effect) but can also implant the wrong choice ("lure intrusion"); showing the correct answer as feedback roughly halves lure intrusions and immediate and delayed feedback work equally well [39][40].
- Right/wrong-only feedback does little; **correct-answer feedback** is needed for error correction [41].
- **Explanation feedback** equals correct-answer feedback on the same question but is *better for transfer* to new questions, exactly what a "teach something" game wants [42].
- "Answer-until-correct" feedback (let the child try again) was as effective as showing the answer [40]; for Easy, allowing a second tap before revealing is child-friendly and still educational.
- Retrieval practice spread over time produces durable learning [36][34]; weekly play with a seen-tracker that resurfaces missed questions after a couple of weeks is the ideal schedule.

**UI implication**: after each answer, highlight the correct choice in green (and the chosen wrong one in soft amber, not red), show the "why" line, then a Next button. Never show a score penalty animation for Easy.

---

## 5. Spanish

### Register and variety

- Use **neutral Latin American Spanish** ("español neutro"), the same choice Plaza Sésamo made to reach 34 countries, and the standard recommendation for the US Hispanic market, which mixes Mexican, Caribbean, Central and South American families [43][44][45].
- **Tú, not usted**, for anything addressed to the child ("¿Qué animal ves?"). Use **ustedes** for plural; never *vosotros*. Avoid *vos* forms.
- Prefer widely understood words; suggested house list: carro (not coche/auto), computadora (not ordenador), celular (not móvil), papa (not patata), jugo (not zumo), durazno (not melocotón), fresa (not frutilla), piña (not ananá), aguacate (not palta), frijoles (not judías/porotos), maíz (not elote/choclo as the generic), pasto or césped, lentes (not gafas), autobús (not camión/guagua/colectivo), boleto (not billete for tickets), cometa (kite, not papalote/barrilete), cerdo (not chancho/cochino), pavo (not guajolote), bonito or lindo, niño/niña. Where no neutral word exists (peanut: cacahuate/maní), pick one and add the other in parentheses once or avoid the item.
- Watch false friends and number words: **billion = mil millones**, trillion = billón; "un millón" for 1,000,000.

### Orthography (RAE)

- Months, days of the week, seasons, **languages and nationalities are lowercase** (enero, lunes, verano, español, mexicano) [46][47].
- **Accents are mandatory on capitals** (África, Él); only all-caps acronyms drop them [48].
- Inverted marks: **¿ ... ? and ¡ ... !** on every question and exclamation.
- Astronomical bodies capitalized when used as such: la Tierra, el Sol, la Luna; lowercase for "tomar el sol".
- Numbers: RAE recommends a thin space for thousands (10 000) and accepts either comma or point as the decimal separator depending on the country [49][50]. For a US audience that also sees English, the safest rule is: **write numbers under 10,000 without separators, spell out "mil" and "millones" in both languages where possible, and use the same decimal mark (point) in both** so a child switching languages sees 1.5 in both. Add "aprox." where English says "about".
- Temperature: give both (100 °C / 212 °F) in both languages; units use a space before the symbol.

### Items that do not translate literally

Anything whose answer depends on the form of the word rather than the fact:

- Rhymes, first-letter sounds, syllable counts, alphabetical order, spelling, homophones, palindromes, anagrams, idioms, English grammar (parts of speech mostly transfer; articles/gender do not), letter counts ("how many letters in 'cat'"), "which word means..." in a specific language, Greek/Latin roots (these usually *do* transfer: bio/biología), abbreviations (USA vs. EE. UU.).
- Also culture-bound items: US coins ("dime" has no Spanish equivalent beyond "moneda de diez centavos"), Fahrenheit, imperial units, US school grades ("third grade" = "tercer grado", fine), and food names that differ.

**Plan**: give every question a `lang` field: `both` (default), `en` (English-only variant), `es` (Spanish-only variant). Words & Language is written as **two parallel pools** of equal size, each native, not translated, and the toggle swaps pools rather than translating. In mixed mode, when the interface is in Spanish, draw Words items from the ES pool. A `pairId` optionally links an EN and ES variant that test the same skill (e.g. "rhymes with cat" / "rima con gato") so the seen-tracker treats them as one.

### Data structure

Keep both languages side by side in one record so a reviewer sees them together and the correct index is shared:

```json
{
  "id": "animals-easy-0012",
  "category": "animals",
  "level": "easy",
  "lang": "both",
  "pairId": null,
  "emoji": "🐄",
  "q":   { "en": "Which animal says moo?",
           "es": "¿Qué animal hace \"muuu\"?" },
  "choices": [
    { "en": "Cow",  "es": "La vaca",  "emoji": "🐄" },
    { "en": "Dog",  "es": "El perro", "emoji": "🐶" },
    { "en": "Duck", "es": "El pato",  "emoji": "🦆" }
  ],
  "answer": 0,
  "why": { "en": "Cows moo to talk to each other, and a mother cow knows her calf's voice.",
           "es": "Las vacas mugen para hablar entre ellas, y una mamá vaca reconoce la voz de su ternero." },
  "source": "https://kids.nationalgeographic.com/animals/mammals/facts/cow",
  "tags": ["farm", "sounds"],
  "reviewed": { "en": true, "es": true }
}
```

Rules: choices keep the **same order in both languages** and are shuffled at render time; `answer` is one shared index; a CI script fails the build if any `both` item is missing an `es` string, if an `es` string lacks ¿/¡ where needed, or if a stem contains "NOT"/"no es" [51]. Have a native speaker review the ES column, not a translator working blind; the review flag per language records that.

---

## 6. Fact sources a writer can rely on

| Source | Best for | Notes |
|---|---|---|
| NASA Space Place (spaceplace.nasa.gov) and NASA Science kids pages | Space, Sun, planets, Earth from space, weather from satellites | Written for upper-elementary, **available in English and Spanish**, ideal for Medium and for ES "why" wording [52] |
| NOAA SciJinks (scijinks.gov) | Weather, hurricanes, clouds, seasons, satellites | Joint NOAA/NASA, kid-level explanations [53] |
| USGS Water Science School | Water cycle, how much water is fresh, rivers, groundwater, earthquakes and volcanoes (USGS main site) | Authoritative numbers that do not drift [54] |
| National Geographic Kids (kids.nationalgeographic.com) | Animals (fact pages per species), countries, "weird but true" facts | Editorial fact-checking; animal size/speed/lifespan numbers are consistent across their pages [55] |
| Britannica and Britannica Kids (kids.britannica.com) | Everything; three reading levels; history, geography, biography, science | Professionally edited and fact-checked; use the Kids/Students level to calibrate vocabulary [28][56] |
| Smithsonian (si.edu/kids, Smithsonian Learning Lab, National Zoo animal pages, Air and Space Museum) | Animals, air and space history, US history, art | Museum-grade accuracy [31] |
| CDC BAM! Body and Mind (archived) and KidsHealth (kidshealth.org, Nemours) | Human body, health, nutrition, how organs work | CDC BAM targets ages 9-13; KidsHealth has a "Kids" reading level and Spanish versions of most articles [57][58] |
| WHO fact sheets | Global health basics (handwashing, vaccines, nutrition) | Use for definitions only; avoid statistics that change |
| Wikipedia | First stop for dates, capitals, chemical symbols, definitions | Verify against one of the above before publishing; never use it for superlatives or counts that change |
| Ducksters (ducksters.com) | Kid-level history, geography, biographies, science summaries | Written by educators, but cites no sources; use as a *starting point* and confirm elsewhere [59] |
| DK findout! and DK Eyewitness books | Curated kid facts across all categories | Good for finding "interesting" angles; confirm numbers |
| Common Core, NGSS, NY SS Framework, National Geography Standards | Deciding *which* facts belong at *which* level | See sections 1-2 [1][5][7][18] |
| RAE (rae.es: Español al día, DPD, Ortografía) | Spanish spelling, capitalization, accents, numbers | The Spanish style authority [46][48][49] |

Practical rule: every published question stores one `source` URL; superlatives must come from NatGeo Kids, Britannica or a government science site; anything from Wikipedia or Ducksters needs a second source.

---

## 7. Worked examples (18)

Difficulty notes reference the band's standards. Choices are listed with the correct one first; shuffle at render.

### Easy (ages 4-6): 3 choices, emoji on every choice, read-aloud

**E1. Animals & Nature** 🐄
- EN: Which animal says "moo"?  ES: ¿Qué animal hace "muuu"?
- Choices: Cow 🐄 / La vaca; Dog 🐶 / El perro; Duck 🦆 / El pato
- Answer: Cow
- Why EN: Cows moo to talk to each other, and a mother cow knows her own calf's voice.
- Why ES: Las vacas mugen para hablar entre ellas, y una mamá vaca reconoce la voz de su ternero.
- Note: animal sounds are universal PreK knowledge; one silly distractor (duck) plus one plausible farm animal.

**E2. Art, Music & Stories** 🎨
- EN: What color do you get when you mix blue and yellow?  ES: ¿Qué color sale si mezclas azul y amarillo?
- Choices: Green 🟢 / Verde; Purple 🟣 / Morado; Orange 🟠 / Naranja
- Answer: Green
- Why EN: Blue and yellow paint mixed together make green, the color of leaves and grass.
- Why ES: La pintura azul y la amarilla juntas hacen verde, el color de las hojas y el pasto.
- Note: color mixing is taught in PreK/K art; distractors are the other two secondary colors.

**E3. Human Body & Health** ✋
- EN: How many fingers are on two hands?  ES: ¿Cuántos dedos hay en dos manos?
- Choices: Ten 🔟 / Diez; Five 5️⃣ / Cinco; Eight 8️⃣ / Ocho
- Answer: Ten
- Why EN: Each hand has five fingers, and five plus five is ten.
- Why ES: Cada mano tiene cinco dedos, y cinco más cinco son diez.
- Note: CCSS K.OA addition within 10 plus body knowledge; a child can check on their own hands.

**E4. Space & the Sky** 🌍
- EN: What is the name of the planet we live on?  ES: ¿Cómo se llama el planeta donde vivimos?
- Choices: Earth 🌍 / La Tierra; Mars 🔴 / Marte; The Moon 🌙 / La Luna
- Answer: Earth
- Why EN: Earth is the only planet we know that has animals, plants and people living on it.
- Why ES: La Tierra es el único planeta que conocemos con animales, plantas y personas.
- Note: "Tierra" capitalized as the planet (RAE); the Moon distractor teaches that it is not a planet.

**E5. Earth, Weather & Oceans** 🌧️
- EN: What falls from the clouds when it rains?  ES: ¿Qué cae de las nubes cuando llueve?
- Choices: Water 💧 / Agua; Sand 🏖️ / Arena; Leaves 🍃 / Hojas
- Answer: Water
- Why EN: Clouds are made of tiny drops of water; when the drops get heavy, they fall as rain.
- Why ES: Las nubes están hechas de gotitas de agua; cuando las gotas pesan mucho, caen como lluvia.
- Note: NGSS K-ESS2 weather; the "why" plants the seed of the water cycle for Medium.

**E6. Math & Numbers** 🔺
- EN: How many sides does a triangle have?  ES: ¿Cuántos lados tiene un triángulo?
- Choices: Three 🔺 / Tres; Four ⬜ / Cuatro; Five ⭐ / Cinco
- Answer: Three
- Why EN: "Tri" means three, so a triangle has three sides and three corners.
- Why ES: "Tri" significa tres, así que un triángulo tiene tres lados y tres esquinas.
- Note: CCSS K.G shape identification; the root "tri" works identically in both languages.

### Medium (ages 7-10): 4 choices, one short sentence

**M1. Geography & Maps** 🗺️
- EN: Which is the largest continent?  ES: ¿Cuál es el continente más grande?
- Choices: Asia; Africa / África; Europe / Europa; Australia
- Answer: Asia
- Why EN: Asia covers almost one third of all the land on Earth and stretches from Turkey to Japan.
- Why ES: Asia cubre casi un tercio de toda la tierra firme del planeta y va desde Turquía hasta Japón.
- Note: grade 2-3 continents; distractors are the next-largest (Africa) and two familiar ones.

**M2. Human Body & Health** ❤️
- EN: Which organ pumps blood around your body?  ES: ¿Qué órgano bombea la sangre por todo tu cuerpo?
- Choices: Heart / El corazón; Lungs / Los pulmones; Stomach / El estómago; Brain / El cerebro
- Answer: Heart
- Why EN: Your heart is a muscle about the size of your fist, and it beats about 100,000 times a day.
- Why ES: Tu corazón es un músculo del tamaño de tu puño y late unas 100 000 veces al día.
- Note: NGSS 4-LS1 structures and functions; all distractors are organs.

**M3. Space & the Sky** 🪐
- EN: How many planets orbit our Sun?  ES: ¿Cuántos planetas giran alrededor de nuestro Sol?
- Choices: 8; 9; 7; 12
- Answer: 8
- Why EN: Since 2006 Pluto has been called a dwarf planet, so the solar system has eight planets.
- Why ES: Desde 2006 Plutón se considera un planeta enano, así que el sistema solar tiene ocho planetas.
- Note: NGSS 5-ESS1; the "9" distractor is the classic misconception and the "why" corrects it.

**M4. History & Inventions** 🏛️
- EN: Which ancient people built the pyramids at Giza?  ES: ¿Qué pueblo antiguo construyó las pirámides de Guiza?
- Choices: The Egyptians / Los egipcios; The Romans / Los romanos; The Greeks / Los griegos; The Aztecs / Los aztecas
- Answer: The Egyptians
- Why EN: The Great Pyramid was built about 4,500 years ago and stayed the tallest building on Earth for almost 4,000 years.
- Why ES: La Gran Pirámide se construyó hace unos 4500 años y fue el edificio más alto del mundo durante casi 4000 años.
- Note: grade 5-6 ancient civilizations; the Aztec distractor is fair because they also built pyramids, which the "why" could extend.

**M5. Science & How Things Work** 🌱
- EN: What gas do plants take from the air to make their food?  ES: ¿Qué gas toman las plantas del aire para hacer su comida?
- Choices: Carbon dioxide / Dióxido de carbono; Oxygen / Oxígeno; Helium / Helio; Nitrogen / Nitrógeno
- Answer: Carbon dioxide
- Why EN: Plants use sunlight, water and carbon dioxide to make sugar, and they give off the oxygen we breathe.
- Why ES: Las plantas usan luz del sol, agua y dióxido de carbono para hacer azúcar, y sueltan el oxígeno que respiramos.
- Note: NGSS 5-LS1; oxygen is the strong lure, corrected in the "why".

**M6. Math & Numbers** ✖️
- EN: What is 7 × 8?  ES: ¿Cuánto es 7 × 8?
- Choices: 56; 54; 48; 64
- Answer: 56
- Why EN: Remember it by counting "5, 6, 7, 8": 56 = 7 × 8.
- Why ES: Recuérdalo contando "5, 6, 7, 8": 56 = 7 × 8.
- Note: CCSS 3.OA fluency; distractors are neighboring products (6×9, 6×8, 8×8); the mnemonic works in both languages.

### Hard (ages 11-15): 4 plausible choices

**H1. Science & How Things Work** 🧪
- EN: What is the chemical symbol for gold?  ES: ¿Cuál es el símbolo químico del oro?
- Choices: Au; Ag; Go; Gd
- Answer: Au
- Why EN: It comes from the Latin word "aurum"; Ag is silver (from "argentum") and Gd is gadolinium.
- Why ES: Viene del latín "aurum"; Ag es la plata (de "argentum") y Gd es el gadolinio.
- Note: NGSS MS-PS1 periodic table; every distractor is a real or plausible symbol.

**H2. Geography & Maps** 🌊
- EN: Which river is the longest in South America?  ES: ¿Cuál es el río más largo de Sudamérica?
- Choices: Amazon / Amazonas; Paraná; Orinoco; Magdalena
- Answer: Amazon
- Why EN: The Amazon also carries more water than any other river on Earth, about one fifth of all the river water that reaches the oceans.
- Why ES: El Amazonas también lleva más agua que cualquier otro río del planeta: cerca de un quinto de toda el agua de los ríos que llega al mar.
- Note: all four are real South American rivers; the fact is physical and stable.

**H3. History & Inventions** 🚀
- EN: In which year did humans first walk on the Moon?  ES: ¿En qué año caminaron los humanos por primera vez en la Luna?
- Choices: 1969; 1957; 1975; 1981
- Answer: 1969
- Why EN: On July 20, 1969, Apollo 11's Neil Armstrong and Buzz Aldrin stepped onto the Moon while Michael Collins orbited above.
- Why ES: El 20 de julio de 1969, Neil Armstrong y Buzz Aldrin, del Apolo 11, pisaron la Luna mientras Michael Collins orbitaba arriba.
- Note: distractors are real space-age dates (Sputnik 1957, Apollo-Soyuz 1975, first Shuttle 1981).

**H4. Human Body & Health** 🧠
- EN: Which part of the brain mainly controls balance and coordination?  ES: ¿Qué parte del cerebro controla principalmente el equilibrio y la coordinación?
- Choices: Cerebellum / El cerebelo; Cerebrum / El cerebro (corteza); Brain stem / El tronco encefálico; Hippocampus / El hipocampo
- Answer: Cerebellum
- Why EN: "Cerebellum" means "little brain" in Latin; it sits at the back and fine-tunes every movement you make.
- Why ES: "Cerebelo" significa "cerebro pequeño" en latín; está en la parte de atrás y ajusta cada movimiento que haces.
- Note: MS-LS1 body systems; note the ES naming issue (cerebro = brain and cerebrum), handled by the parenthetical.

**H5. Math & Numbers** 📐
- EN: What is the sum of the three inside angles of any triangle?  ES: ¿Cuánto suman los tres ángulos internos de cualquier triángulo?
- Choices: 180°; 90°; 360°; 270°
- Answer: 180°
- Why EN: Tear the three corners off a paper triangle and line them up: they always make a straight line, which is 180°.
- Why ES: Arranca las tres esquinas de un triángulo de papel y júntalas: siempre forman una línea recta, que mide 180°.
- Note: CCSS 8.G; distractors are the other "famous" angle numbers.

**H6. Words & Language** ✏️ (lang: both, because Greek roots transfer)
- EN: The Greek root "bio" means...  ES: La raíz griega "bio" significa...
- Choices: Life / Vida; Earth / Tierra; Water / Agua; Star / Estrella
- Answer: Life
- Why EN: Biology is the study of life and a biography is the story of someone's life; "geo" is Earth, "hydro" is water, "astro" is star.
- Why ES: La biología estudia la vida y una biografía cuenta la vida de alguien; "geo" es tierra, "hidro" es agua, "astro" es estrella.
- Note: CCSS L.6.4b Greek/Latin roots; distractors are the roots named in the "why", so a wrong answer still teaches.

---

## Sources

1. Common Core, Kindergarten Math Introduction: https://www.thecorestandards.org/Math/Content/K/introduction/
2. Common Core, Kindergarten Geometry: https://www.thecorestandards.org/Math/Content/K/G/
3. CDC, Milestones at 4 years: https://www.cdc.gov/ncbddd/actearly/milestones/milestones-4yr.html
4. CDC, Milestones at 5 years: https://www.cdc.gov/ncbddd/actearly/milestones/milestones-5yr.html
5. NGSS Topic Arrangements by grade: https://www.nextgenscience.org/overview-topics
6. NGSS DCI arrangements: https://www.nextgenscience.org/overview-dci
7. New York State K-8 Social Studies Framework (grade themes K: Self and Others through 6: Eastern Hemisphere): https://www.nysed.gov/sites/default/files/programs/curriculum-instruction/ss-framework-k-8a2.pdf ; pacing summary: https://catholicschoolsny.org/wp-content/uploads/2014/10/NYS-Social-Studies-Pacing-Guide.pdf ; C3 Framework: https://www.socialstudies.org/sites/default/files/c3/C3-Framework-for-Social-Studies.pdf
8. Common Core Kindergarten ELA summary (Education.com): https://www.education.com/common-core/kindergarten/ela/
9. Reading Eggs, Reading milestones by age: https://readingeggs.com/articles/reading-milestones-by-age/
10. Reading Rockets, Literacy milestones age 5 and 6: https://www.readingrockets.org/topics/developmental-milestones/articles/literacy-milestones-age-5 ; https://www.readingrockets.org/topics/developmental-milestones/articles/literacy-milestones-age-6
11. Gathercole, Pickering, Ambridge & Waring (2004), The Structure of Working Memory From 4 to 15 Years of Age: https://personalpages.manchester.ac.uk/staff/ben.ambridge/papers/Gathercole,%20Pickering,%20Ambridge%20&%20Waring%20(2004).pdf
12. Cowan (2010), The Magical Mystery Four: https://journals.sagepub.com/doi/abs/10.1177/0963721409359277
13. Evidence Based Education, How limited is working memory capacity?: https://evidencebased.education/resource/how-limited-is-working-memory-capacity/
14. Haladyna & Downing (1993), How Many Options is Enough for a Multiple-Choice Test Item?: https://journals.sagepub.com/doi/10.1177/0013164493053004013
15. Haladyna, Downing & Rodriguez, A Review of Multiple-Choice Item-Writing Guidelines: https://site.ufvjm.edu.br/fammuc/files/2016/05/item-writing-guidelines.pdf
16. ReadabilityFormulas, Writing for 1st Grade Readers: https://readabilityformulas.com/syntactic-writing-for-1st-grade-readers/
17. Common Core Grade 3 Math Introduction and Fractions: https://www.thecorestandards.org/Math/Content/3/introduction/ ; https://www.thecorestandards.org/Math/Content/3/NF/
18. National Geography Standards (18 standards, six essential elements): https://ncge.org/teacher-resources/national-geography-standards/ ; https://education.nationalgeographic.org/resource/national-geography-standards-index/
19. ERIC Digest, The National Geography Content Standards: https://eric.ed.gov/?id=ED381480
20. Common Core ELA Language standards grades 3, 4, 6: https://www.thecorestandards.org/ELA-Literacy/L/3/ ; https://www.thecorestandards.org/ELA-Literacy/L/4/ ; https://www.thecorestandards.org/ELA-Literacy/L/6/
21. Lexile grade bands (MetaMetrics via Outschool / Test My Kid): https://outschool.com/articles/lexile-levels-understand-reading-level ; https://www.testmykid.org/blog/lexile-levels-by-grade
22. Common Core Grade 6 Math Introduction and Ratios: https://www.thecorestandards.org/Math/Content/6/introduction/ ; https://www.thecorestandards.org/Math/Content/6/RP/
23. National Geographic Kids Quiz Whiz (Penguin Random House): https://www.penguinrandomhouse.com/books/236642/national-geographic-kids-quiz-whiz-4-by-national-geographic-kids/9781426317095/
24. National Geographic Kids Quiz Whiz (Amazon listing with chapter names): https://www.amazon.com/National-Geographic-Kids-Quiz-Whiz/dp/1426310188
25. Brain Quest 1st Grade Smart Cards (categories): https://www.amazon.com/Brain-Quest-Grade-Smart-Revised/dp/1523517263
26. Trivial Pursuit Family Edition rules and categories: https://instructions.hasbro.com/en-au/instruction/trivial-pursuit-family-edition
27. Trivial Pursuit Junior categories (BoardGameGeek): https://boardgamegeek.com/boardgame/93965/trivial-pursuit-junior-fifth-edition
28. Britannica Kids levels: https://kids.britannica.com/ ; https://britannicaeducation.com/solutions/prek-12/britannica-school/
29. BBC Bitesize subjects (Nottinghamshire home-ed resource list): https://www.nottinghamshire.gov.uk/education/home-education/elective-home-education-new/i-am-a-parent-or-carer/resource-list-for-home-educating-parents/bbc-bitesize
30. Kahoot! Kids: https://kahoot.com/home/kahoot-kids/ ; https://support.kahoot.com/hc/en-us/articles/15265714280595-How-to-play-Kahoot-Kids-quiz-games
31. Smithsonian, Fun Stuff for Kids and Teens: https://www.si.edu/kids
32. Little Passports review (World Trivia, map games): https://kidworldcitizen.org/little-passports-explore-world-home/
33. Cepeda et al. (2006) spacing meta-analysis, summarized: https://learnpathhub.org/posts/spaced-repetition-flashcards/
34. Wikipedia, Spaced repetition: https://en.wikipedia.org/wiki/Spaced_repetition
35. The Leitner System: https://e-student.org/leitner-system/
36. Roediger & Butler (2011), The critical role of retrieval practice in long-term retention: http://psychnet.wustl.edu/memory/wp-content/uploads/2018/04/Roediger-Butler-2011_TCS.pdf
37. eLearning Coach, The Importance of Writing Effective Distractors: https://theelearningcoach.com/elearning_design/tests/the-importance-of-writing-effective-distractors/
38. Quizado, Trivia questions for kids (age-tiering practice): https://quizado.com/blog/trivia-questions-for-kids
39. Butler & Roediger (2008), Feedback enhances the positive effects and reduces the negative effects of multiple-choice testing: https://gwern.net/doc/psychology/spaced-repetition/2008-butler.pdf
40. Butler, Karpicke & Roediger (2007), The effect of type and timing of feedback on learning from multiple-choice tests: https://bpb-us-e2.wpmucdn.com/sites.wustl.edu/dist/8/805/files/2026/06/Butler-et-al.-2007-The-effect-of-type-and-timing-of-feedback-on-learning-from-multiple-choice-tests.pdf
41. Fazio, Huelser, Johnson & Marsh, right/wrong vs. correct-answer feedback (Duke): https://scholars.duke.edu/publication/746629
42. Butler, Godbole & Marsh (2013), Explanation Feedback Is Better Than Correct Answer Feedback for Promoting Transfer of Learning: https://www.semanticscholar.org/paper/5d127eac20332dfa5bfa62d67447e681b7c38469
43. RWS, When (and When Not) to Localize into Neutral Spanish: https://www.rws.com/blog/when-and-when-not-to-localize-into-neutral-spanish/
44. Teck Language Solutions, U.S. Spanish vs. Latin American Spanish: https://www.teck-translations.com/u-s-spanish-vs-latin-american-spanish-what-companies-need-to-know/
45. Plaza Sésamo (neutral Spanish for 34 countries): https://sesameworkshop.org/our-work/shows/mexico-latam-plaza-sesamo/ ; https://en.wikipedia.org/wiki/Plaza_S%C3%A9samo
46. RAE, Mayúscula o minúscula en los meses, los días de la semana y las estaciones: https://www.rae.es/espanol-al-dia/mayuscula-o-minuscula-en-los-meses-los-dias-de-la-semana-y-las-estaciones-del-ano
47. RAE, Uso distintivo de minúsculas y mayúsculas (gentilicios, idiomas): https://www.rae.es/ortograf%C3%ADa/uso-distintivo-de-min%C3%BAsculas-y-may%C3%BAsculas
48. RAE, Tilde en las mayúsculas: https://www.rae.es/espanol-al-dia/tilde-en-las-mayusculas
49. Smartick, Decimal separators by country (RAE 2010 recommendation): https://www.smartick.com/blog/other-contents/curiosities/decimal-separators/
50. Collins, Space, point or comma in Spanish numbers: https://grammar.collinsdictionary.com/spanish-easy-learning/do-you-use-a-space-point-or-comma-in-spanish-numbers
51. Better-i18n, JSON translation files best practices (CI validation, descriptor fields): https://better-i18n.com/en/blog/json-translation-files/
52. NASA Space Place (English and Spanish): https://spaceplace.nasa.gov/ ; parents and educators: https://spaceplace.nasa.gov/menu/parents-and-educators/
53. NOAA SciJinks: https://scijinks.gov/
54. USGS Water Science School: https://www.usgs.gov/water-science-school
55. National Geographic Kids quizzes and animal facts: https://kids.nationalgeographic.com/games/quizzes
56. Britannica fact-checking: https://elearn.eb.com/resource/infographic-fight-the-fake/
57. CDC BAM! Body and Mind (archived): https://archive.cdc.gov/www_cdc_gov/healthyschools/bam/teachers/index.html
58. KidsHealth (Nemours): https://kidshealth.org/
59. Edu.com, Is Ducksters a reliable source?: https://www.edu.com/blog/is-ducksters-a-reliable-source-a-complete-guide-for-k-6-educators-and-parents
