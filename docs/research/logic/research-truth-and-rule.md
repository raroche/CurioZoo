# Truth Island and Find the Rule: design research

Prepared 2026-10-02. This covers two logic games for CurioZoo (ages 6–13, Easy 6–8, Medium 8–10, Hard 10–13). The site constraints apply throughout: vanilla ES modules, strict CSP, offline, EN+ES, iPad-first, WCAG AA, no timers, and stars that only go up.

A note on the numbers: the puzzle-pool counts and teaching-set sizes below come from brute-force enumeration scripts written for this report (an exhaustive solver over every truth assignment, and a rule-space enumerator over every creature). They are not from the literature. The scripts are about 100 lines each and can be ported into `tools/` as checkers.

---

## Part 1: Truth Island (knights and knaves)

### 1.1 The puzzle family and its difficulty ladder

Raymond Smullyan popularised knights (always truthful) and knaves (always lying) in *What Is the Name of This Book?* (1978). The book has about 200 puzzles that get harder as it goes. It moves from knights and knaves to "normals" (who may say anything), then Portia's caskets, then the Baal, zombie and Dracula islands, where the yes/no answer words themselves are unknown ([overview](https://hermiene.net/literature/library/what-is-the-name-of-this-book--smullyan)). Brilliant.org's logic course follows a similar ladder: plain knights/knaves, "indirection" (getting the truth out of a liar), mass puzzles, "jokers" who can act as either type, then four-type islands with humans and vampires ([course outline](https://classcentral.com/course/brilliant-logic-deduction-2020-59305)). Zachary Ernst wrote a program that generated 382 graded puzzles for the University of Hong Kong's *Critical Thinking Web* ([HKU](https://philosophy.hku.hk/think/logic/knights.php)). Wolfram has open generators too, including one where some identities stay undetermined ([Wolfram demo](https://demonstrations.wolfram.com/KnightsAndKnavesPuzzleGenerator/)). Harvard CS50 AI uses the family as its model-checking exercise ([CS50](https://cs50.harvard.edu/ai/2023/projects/1/knights)). The take-away is that generation and solving are well-trodden ground. The open problem is grading difficulty for children and presenting the puzzles to them.

The ladder, from easiest to the ceiling:

1. **Checkable claim, one speaker.** The claim is about the world, not about anyone's type. Only the definition of truthful versus lying is needed.
2. **Chains of accusations anchored by a checkable claim.** "Owl says it is sunny" (it is raining), then "Fox says Owl is a liar". This is forward reasoning only.
3. **Classic self-reference, no picture.** "We are both liars." The step is that a liar can never truthfully say "I am a liar", so the speaker must be a liar and the rest of the claim is false.
4. **Same/different and counting.** "Exactly one of us is a liar."
5. **One supposition needed** ("Suppose A is truthful... contradiction").
6. **Compound claims.** "And", "or (or both)", "if...then".
7. **Variants.** Spies or jokers (exactly one of each type), alternators (true and false in turn), normals. Normals are hardest, because a normal's statement gives no constraint at all.
8. **Question puzzles.** You ask one yes/no question to find the safe path. Embedded questions ("If I asked you X, would you say yes?") are the realistic ceiling for ages 12–13, as an end-of-Hard bonus.
9. **Out of scope:** Boolos's "Hardest Logic Puzzle Ever" (True/False/Random gods who answer *da*/*ja* in an unknown language; [Wikipedia](https://en.wikipedia.org/wiki/The_Hardest_Logic_Puzzle_Ever)). It stacks unknown-language answers, a random speaker and nested counterfactual questions. This is the ceiling to state explicitly: do not ship anything with unknown yes/no words or a random answerer.

### 1.2 What the research says about children and this kind of reasoning

- **Truth versus lie as true versus false statements is secure by 7.** Bussey found that 7- and 10-year-olds classified all false statements as lies and all true ones as truths. 4-year-olds managed 88% ([Bussey 1992, Macquarie](https://researchers.mq.edu.au/en/publications/childrens-conceptions-of-lying-and-truth-telling-implications-for/)). Young children also over-extend "lie" to any naughty act and "truth" to any good act ([PMC review](https://pmc.ncbi.nlm.nih.gov/articles/PMC3891696)). Lying is morally loaded for them, which is a reason to avoid "liar" as the type name (see 1.9).
- **Suppositions are the main source of difficulty, even for adults.** Rips's "The psychology of knights and knaves" (*Cognition* 31, 1989) modelled solvers as making suppositions and tracing their consequences ([citation](https://sites.northwestern.edu/ripslab/files/2023/09/Vita3.pdf)). Byrne & Handley (1997) showed that people take short-cuts through backward inference, that *generating suppositions* is a source of difficulty, and that people improve without feedback ([Cognition 62](https://researchers.mq.edu.au/en/publications/reasoning-strategies-for-suppositional-deductions/)). Schroyens, Schaeken & d'Ydewalle found that handing solvers an accurate hypothesis to test raised accuracy ([Psychologica Belgica 1996](https://psychologicabelgica.com/articles/897)). The design consequence is to **give children a supposition tool** (1.6) rather than make them hold one in their head.
- **Hypothetical and counterfactual "if".** Rafetseder, Schwitalla & Perner found that full counterfactual reasoning is not reliable in all children before about 12 ([JECP 2013](https://www.stir.ac.uk/research/hub/publication/676513)). Two other findings point the other way. Make-believe framing markedly improves 4–6-year-olds' deductions from premises that are contrary to fact ([Dias & Harris 1988](https://synapsesocial.com/papers/W2031803553)). First and second graders can pick a conclusive test over an inconclusive one ([Sodian, Zaitchik & Carey 1991](https://www.harvardlds.org/wp-content/uploads/2018/05/Sodian-Young-children’s-differentiation-of-hypothetical-beliefs-from-evidence.-.pdf)). So: no suppositions at Easy, one externalised supposition at Medium, unaided depth 1 and an occasional depth 2 at Hard.
- **Double negation.** Children know two negatives cancel by about 5–7 when the context is supportive. In bare sentences they fail through working-memory load, and they often read multiple negatives as negative concord ([review](https://iris.univr.it/handle/11562/1174860), [Mandarin study](https://researchers.mq.edu.au/en/publications/childrens-knowledge-of-double-negative-structures-in-mandarin-chi/)). A liar saying "Fox is not a liar" is a triple negation. Never put a "not" inside a liar's claim before Hard, and render negation as an icon swap ("Fox is a Moon") rather than a word.
- **"Or".** Children read *or* as inclusive more readily than adults, and some treat it as ambiguous between inclusive, exclusive and conjunction ([Frontiers 2018](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2018.01928/pdf), [Noveck 2001 summary](https://pmc.ncbi.nlm.nih.gov/articles/PMC5854163)). Avoid bare "or" until Hard, and then always write "X or Y (or both)".

### 1.3 Making Easy work for 6–8-year-olds

The key fact, from the enumeration: **puzzles made only of accusations ("B is a liar", "B is truthful") never have a unique answer.** Each accusation only says "speaker and target are the same/different type", so flipping everyone gives a second valid world. That is why classic beginner puzzles need self-reference ("we are both...") or counting. For young children the better anchor is **the picture**. A Sun animal's claim about the visible scene is true, so a claim that contradicts the scene marks a Moon animal. Every later accusation can then be resolved forward from that anchor, with no suppositions.

Easy chapters:

| Ch | Content | Example |
|---|---|---|
| E1 | 1 speaker, picture claim | Owl: "3 apples." Picture shows 2. Owl is a Moon. |
| E2 | 2–3 speakers, each a picture claim | Sort all speakers |
| E3 | 1 picture claim + 1 accusation | Fox: "Owl is a Sun" |
| E4 | Chains of 3 (picture, then accusation, then accusation) | Two hops forward |
| E5 | Hidden picture: a curtain hides the scene; one animal is a known Sun ("wears the Sun badge") and describes it | Trust transfer |

Picture claims cover counts (1–5 objects), weather (sun, rain, snow, cloud), day/night, which animal holds an object, and big/small, on/under, in/out. A scene generator varies these, and the claim is generated true or false to match the speaker's type. All claims are rendered as icons (1.7), so reading is never required.

### 1.4 Statement grammar (AST)

```js
// Statement nodes; all EN/ES text is rendered from these, never stored.
{ op:'fact',  fact:'count', obj:'apple', n:3 }        // checkable against scene (Easy)
{ op:'fact',  fact:'weather', v:'rain' }
{ op:'is',    who:1, kind:'sun'|'moon' }              // who may equal speaker ("I am a Moon")
{ op:'same',  a:0, b:2 } | { op:'diff', a:0, b:2 }
{ op:'count', cmp:'eq'|'ge'|'le', kind:'moon', n:1, scope:'us'|'others' }
{ op:'and'|'or', args:[S,S] }                          // 'or' is inclusive, always
{ op:'if', p:S, q:S }                                  // Hard only
// Variant types (Hard chapters): kind ∈ sun|moon|spy|switcher
```

A puzzle is consistent under an assignment `a` when, for every statement by speaker *i*, **Sun(i) ⇔ eval(S, a, scene)**. Spies impose no constraint (Smullyan's normals). Switchers make two statements, exactly one of which is true, in order.

Generator exclusions:

- Paradoxes: "I am a Moon" said alone has zero worlds, so it is rejected by the uniqueness check anyway.
- Empty statements: "I am a Sun" is true in every world, as are statements that are always true or always false (e.g. "exactly 4 of us" when there are 3).
- Redundant statements: drop any puzzle where removing a statement keeps the solution unique (minimality). Allow one redundant statement at Hard as a red herring.
- Negated claims by Moons before Hard.
- Puzzles where the answer is "everyone is a Sun" more than 25% of the time within a chapter, to keep the answers balanced.

### 1.5 Solver, uniqueness, grading

```text
solve(puzzle): worlds = [a for a in all assignments (2^n, or 3^n / n! for spy variants)
                         if every statement s by i: type(a,i)=='sun' ⇔ eval(s,a)]
accept iff |worlds| == 1

humanGrade(puzzle):                         // mirrors Byrne & Handley's "suppositions"
  depth = 0
  loop: part = propagate(part)              // single-statement forcing: for each
                                            // statement, a variable is fixed if every
                                            // world consistent with THAT statement and
                                            // part agrees on it
        if solved: return {depth, steps}
        depth++; try each unknown x=v: if propagate(part+{x=v}) contradicts → fix x=¬v
```

`steps` is the ordered trace of forcings. It feeds hints and the "why" text directly. Difficulty score = speakers + statement tier (fact 0, is 1, same/diff/count 2, and/or 3, if 4, variants 5) + 3×depth + 0.5×steps.

**Pool sizes (exhaustive enumeration, one statement per speaker, counted as logically distinct puzzles after merging statements with the same truth table and relabelings):**

| Speakers | Grammar | Unique-answer puzzles | Depth mix (sampled) |
|---|---|---|---|
| 2 | is/same/diff/count | 7 (11 labelled) | ~94% depth 0 |
| 2 | + and/or/at least/if | 17 (30 labelled) | ~93% depth 0 |
| 3 | is/same/diff/count | **115** (580 labelled) | 72% depth 0, 28% depth 1 |
| 3 | + and/or/at least/if | **342** (1,784 labelled) | 74% / 26% |
| 4 | is/same/diff/count | **1,757** (37,766 labelled) | 62% / 37% / 0.6% depth 2 |

About 35–48% of random statement combinations have a unique answer, so rejection sampling is cheap: 16 worlds at n=4. These are counts of logically distinct skeletons. The playable pool multiplies each skeleton by the choice of animals (8 cast creatures), which seat speaks which line, and scenes. Estimated distinct playable puzzles:

- **Easy:** 30 scene templates × ~10 claims × truth/lie × 1–3 speakers, so thousands. Logically there are about 20 skeletons, so variety comes from the scenes. This is honest and fine at 6–8.
- **Medium:** about 120 two- and three-speaker skeletons (depth 0–1) × casts, so 1,000+ distinct surface puzzles.
- **Hard:** 342 three-speaker and 1,757+ four-speaker skeletons, plus variants. Effectively unbounded.

### 1.6 Mechanics and screens

1. **Island map** (campaign): beaches = chapters, about 25 puzzles each. Each solved puzzle "welcomes" a resident into the Island Album (a collectible).
2. **Puzzle screen** (landscape): the animals stand in a row, each with an icon speech bubble (with a speaker/read-aloud button) and an empty token slot below. On phones, the bubbles stack into a list.
3. **Tokens:** tapping a slot cycles unknown → Sun → Moon. Keyboard: arrows move between slots; S, M and Space set the token. The tokens are a sun disc with rays and a crescent moon. They differ in shape and carry text labels, so they are never told apart by colour alone.
4. **Pencil mode (supposition tool, Medium+):** place a dashed "maybe" Sun on Owl. Every bubble then shows a small ✓ or ✗ glyph for whether it *would* be true, and any clash is flagged with a lightning-bolt icon plus text ("Owl is a Sun, but Owl's sentence is false"). This puts the supposition on screen, so the child does not have to hold it in memory, which is the scaffold the research above calls for.
5. **Check:** a wrong assignment is never just "wrong". The game names the broken statement under the child's assignment ("If Fox is a Sun, Fox's sentence must be true, but the sky shows rain"). Guessing therefore still teaches, and there is no penalty. With only 4–16 possible assignments, brute-forcing is possible, so clean solves earn the extra shell (see 1.10).
6. **Why panel** after solving (1.8).

### 1.7 Rendering statements as icon bubbles

| Statement | Bubble (SVG glyphs) | EN | ES |
|---|---|---|---|
| fact count | 🍎-icon ×3 | "There are 3 apples." | "Hay 3 manzanas." |
| is | [fox face] = [sun] | "Fox is a Sun." | "Zorro es Sol." |
| self | [me-arrow] = [moon] | "I am a Moon." | "Yo soy Luna." |
| same | [A] = [B] | "Owl and I are the same kind." | "Búho y yo somos del mismo tipo." |
| count eq | [group] **exactly 1** [moon] | "Exactly one of us is a Moon." | "Exactamente uno de nosotros es Luna." |
| count ge | [group] **1 or more** [moon] | "At least one of us is a Moon." | "Al menos uno de nosotros es Luna." |
| and | two mini-bubbles joined by **&** | "Owl is a Sun and Bear is a Moon." | "Búho es Sol y Oso es Luna." |
| or | two mini-bubbles joined by **or (or both)** | "...or... (or both)." | "...o... (o los dos)." |
| if | bubble A → bubble B | "If Owl is a Sun, then Bear is a Moon." | "Si Búho es Sol, entonces Oso es Luna." |

Bubbles always show the glyph and the number, and the TTS reads the sentence. The fact icons are drawn in code, not emoji, so they render the same everywhere and pass the CSP.

### 1.8 The "why" explanation and hints

Both are generated from the solver's `steps` trace. Each step has a template id:

- `FACT_FALSE`: "{A} said {claim}. The picture shows {truth}. A Sun never says something false, so {A} is a Moon."
- `ACCUSE_FROM_SUN`: "{A} is a Sun, so {A}'s sentence is true: {B} is a {kind}."
- `ACCUSE_FROM_MOON`: "{A} is a Moon, so the opposite of what {A} said is true: {B} is a {opp}."
- `SELF_MOON_IMPOSSIBLE`: "A Sun can't say 'I am a Moon' (it would be false), and a Moon can't say it either (it would be true!). So..." Use this for compound self-claims: "so {A} must be a Moon, and the rest of the sentence is false."
- `SUPPOSE`: "Suppose {A} is a Sun. Then {chain}. But {clash}. That can't happen, so {A} is a Moon."
- `COUNT`: "If {A} were a Sun, there would be exactly {n} Moons, but that would make {B}... ."

Hints are tiered. Each tap shows one more:

1. A focus pulse on the bubble used by the next step: "Look at Fox."
2. A question: "Can you check Fox's sentence in the picture?" At Medium+: "Try a pencil Sun on Fox."
3. The step itself (one line of the "why").

A hint never reveals more than the next forced token. Hints are free, but the clean-solve shell requires no level-3 hints.

### 1.9 Naming and translation pitfalls

- **Avoid "liar".** Bussey and the PMC review show lying is morally charged for young children, and the residents are meant to be lovable. Use **Sun animals (always tell the truth)** and **Moon animals (always say the opposite)**, in Spanish **animales Sol / animales Luna**. The type nouns *Sol*/*Luna* are invariant, which avoids gender agreement (*mentiroso/mentirosa*, *ninguno/ninguna* with *la jirafa* vs *el oso*). Spanish editions of Smullyan commonly render the types as *caballeros* and *escuderos*. Don't use those terms.
- **"O".** The RAE notes simple *o* allows both inclusive and exclusive readings, while *o... o...* forces exclusive ([RAE](https://www.rae.es/gtg/conjunción-disyuntiva)). Never write *o A o B*. Always write "A o B (o los dos)".
- **"Exactly"/"at least"/"at most".** Use *exactamente*, *al menos* and *como mucho*. Avoid *solo uno*, which can be read as "only one, possibly zero".
- **Negative concord.** Spanish *No es ninguno* is a single negation. Never compose negatives word by word. Write each template natively in both languages; do not translate generated English.
- **"Both"/"the same kind".** Use *los dos* / *del mismo tipo*. Test with a native reviewer, as with the teasers room.

### 1.10 Progression, rewards, data

| Level | Chapters (≈25 puzzles each, generated) | Speakers | Max depth |
|---|---|---|---|
| Easy | E1–E5 (above) | 1–3 | 0 |
| Medium | M1 self-claims ("we are both Moons") · M2 same/different · M3 counting · M4 pencil-mode suppositions · M5 mixed | 2–3 | 1 (with tool) |
| Hard | H1 4 speakers · H2 and/or/if · H3 Spy (one Sun, one Moon, one Spy) · H4 Switchers (two bubbles each) · H5 Question Gate (pick the yes/no question that finds the safe bridge; embedded questions) | 3–4 | 2 |

Chapters cycle forever with fresh seeds. A level is never "done". The first 25 seeds per chapter can be pre-verified by a `tools/truthcheck.mjs`, in keeping with the existing `*check.mjs` tools. Rewards: ★ for a solve, an extra shell for a clean solve. Stars only go up, and there is no streak loss.

```json
{ "id":"ti-M3-000137", "seed":137, "level":"medium", "chapter":"M3",
  "cast":["owl","fox","bear"], "scene":null,
  "statements":[{"speaker":0,"s":{"op":"count","cmp":"eq","kind":"moon","n":1,"scope":"us"}},
                {"speaker":1,"s":{"op":"is","who":0,"kind":"moon"}}],
  "solution":["moon","sun","moon"], "grade":{"depth":1,"steps":3,"score":7.5},
  "trace":[{"t":"SUPPOSE","who":0,"v":"sun","clash":1},{"t":"ACCUSE_FROM_SUN","who":1,"target":0}] }
```

Progress in localStorage: `{ "truth": { "medium": { "M3": { "solved": 14, "clean": 9, "nextSeed": 152 } }, "album": ["owl-03","fox-11"] } }`.

---

## Part 2: Find the Rule (inductive logic)

### 2.1 Lineage

- **Zoombinis (TERC/FableVision).** In *Allergic Cliffs*, Zoombinis choose between two bridges, and a wrong choice costs one of six pegs. Its four levels move from one trait, to two values of one attribute, to two traits on different attributes, to three traits ([Wikipedia summary](https://en.wikipedia.org/wiki/Logical_Journey_of_the_Zoombinis)). *Pizza Pass* gives graded feedback ("more toppings" vs "something I don't like").
- **TERC's research.** Rowe, Asbell-Clarke, Gasca & Cunningham coded gameplay into a learning progression: **Trial & Error, then Systematic Testing, then Systematic Testing with a Partial Solution, then Implementing a Full Solution, then Generalising.** These phases are mapped onto problem decomposition, pattern recognition, abstraction and algorithm design. In Allergic Cliffs, *systematic testing* was "sending several Zoombinis sharing an attribute over the same bridge", and abstraction was generalising from a value (blue nose) to an attribute (nose colour) ([FDG 2017](https://par.nsf.gov/servlets/purl/10061932)). The later study of grades 3–8 built data-mined detectors from these behaviours, and the in-game measures correlated with external CT assessments ([Computers in Human Behavior 2021](https://www.terc.edu/publications/assessing-implicit-computational-thinking-in-zoombinis-puzzle-gameplay/); [TERC research hub](https://www.terc.edu/?p=1333)). This game can log the same signals: tests that hold attributes constant, and tests that vary one attribute.
- **Zendo (Kory Heath).** Players build "koans" and the Master marks them. Its best idea for this game is that **a wrong guess is answered with a counterexample**, a koan where the guess and the true rule disagree. Its rule-writing advice is blunt: "Beginning Masters vastly underestimate the difficulty of most rules" ([Looney Labs rules](https://www.looneylabs.com/sites/default/files/rules/Zendo.pdf)). Rules may only refer to the koan itself, not to other koans or to time ([Wikipedia](https://en.wikipedia.org/wiki/Zendo_(game))).
- **Eleusis** (Abbott 1956, published by Martin Gardner in 1959). It is a card-sequence rule game used to teach scientific method ([Wikipedia](https://en.wikipedia.org/wiki/Eleusis_(card_game))). It is the model for the sequence ("parade") rules at Hard.
- **Bongard problems.** Six left vs six right images; find what separates them ([Foundalis index](https://foundalis.com/res/bps/bpidx.htm)). Talking through the solution aloud improved transfer ([HSE poster](https://social.hse.ru/mirror/pubs/share/227473547)), which supports asking for the rule *in words/tiles*, not just sorting.

### 2.2 Cognitive research that shapes the mechanics

- **Difficulty tracks the length of the shortest equivalent rule.** Feldman's *Nature* paper (2000) found that how hard a concept is to learn is roughly proportional to its Boolean complexity: the length of the shortest formula that describes it ([PDF](https://ruccs.rutgers.edu/images/personal-jacob-feldman/papers/feldman_nature.pdf)). The classic Shepard–Hovland–Jenkins ordering agrees: one-dimension rules (Type I) are easiest, and rules with no structure at all (Type VI) are hardest ([catlearn summary](https://rdrr.io/cran/catlearn/man/nosof94.html)). **So grade a rule by the length of its shortest equivalent rule in the grammar, not by the rule that was sampled.**
- **People mostly test positive examples.** In Wason's 2-4-6 task, about 20% of people find the rule on their first announcement, because they test triples that fit their own hypothesis ([Wason task review](https://u-pad.unimc.it/retrieve/34791607-d025-4e68-9c35-e49570341269/BBB2023_Wason%20jintelligence.pdf)). Klayman & Ha (1987) reframed this as a *positive test strategy*. It works when the hypothesis is broader than the truth, and fails when the hypothesis is *narrower* than the truth ([Psych Review](https://pages.ucsd.edu/~mckenzie/KlaymanHaPsychReview1987.pdf)). The older scientific-reasoning literature (Kuhn and others) held that pre-adolescents rarely seek disconfirming evidence. Sodian et al. (1991, above) tested that claim and found that 6–7-year-olds can choose a conclusive test once two hypotheses are made explicit. The design response is to make hypotheses explicit and to reward "stop-tests".
- **Good teachers choose examples carefully.** Shafto, Goodman & Griffiths model teaching as picking the examples that best raise the learner's belief in the true concept, and learners infer more from chosen examples than from random ones ([Cognitive Psychology 2014](https://web.stanford.edu/%7engoodman/papers/shaftogg14.pdf)). The *teaching dimension* is the minimum number of examples needed to pin down a concept ([Goldman & Kearns 1995](https://www.cis.upenn.edu/~mkearns/papers/teaching.pdf)). The generator uses both ideas (2.5).
- **Young children are drawn to surface appearance.** Children move from appearance-based to category-based induction around 6–7, a year later for relational categories ([Aston](https://research.aston.ac.uk/en/publications/evidence-of-a-transition-from-perceptual-to-category-induction-in)). So relational rules belong at Hard only.

### 2.3 Creatures and attributes

The cast is already one SVG face with eight ear sets (`sections.js`: bear, rabbit, owl, fox, cat, mouse, giraffe, frog). Each attribute below is a layer drawn in code, and each value is told apart by **shape or count, never by colour alone** ([WCAG 1.4.1](https://w3.org/WAI/WCAG21/Understanding/use-of-color)):

| Attribute | Values | Distinguished by |
|---|---|---|
| Ears (species) | 3–4 chosen from the 8 | silhouette |
| Hat | none · cap · crown · bow | shape |
| Pattern on wall/body | plain · stripes · dots · checks | SVG `<pattern>` fill |
| Count | 1 · 2 · 3 buttons/stars | count |
| Size | small · big | scale |
| Held item | none · balloon · flower · fish | shape |
| Colour (optional, Medium+) | 3 hues, always *paired* with a distinct pattern and a spoken name | redundant cue |

Puzzles activate a subset of attributes and hold the rest constant:

- **Easy:** 3 active attributes × 2–3 values (≤27 creatures).
- **Medium:** 4 × 3 (81 creatures).
- **Hard:** 5 attributes with 3–4 values (324+), plus pairs and parades.

### 2.4 Rule grammar and equivalence

```js
{ op:'has', attr:'hat', v:'crown' }                 // tier 1
{ op:'not', arg:R }                                  // tier 2
{ op:'in',  attr:'hat', vs:['cap','crown'] }         // tier 2 (= NOT third value)
{ op:'and'|'or', args:[R,R] }                        // tier 3, different attributes
{ op:'cmp', attr:'count', cmp:'ge', n:2 }            // tier 3, ordinal attributes
{ op:'match', a:'hat', b:'item' }                    // tier 4: "hat and item are the same kind/shape family"
// Hard, pair/parade gates (Eleusis-style): rule over a sequence
{ op:'pair', rel:'bigger', who:'front' }             // "the one in front is bigger"
{ op:'seq',  rel:'differ', attr:'ears' }             // "no two neighbours share ears"
```

**Equivalence:** compute each rule's extension as a bitset over the whole creature universe (27, 81 or 324 bits; for parades, a fixed random sample of 4,096 sequences plus all edge cases). Two rules are the same if their bitsets are equal. The child's submitted rule is accepted if its extension equals the target's, so "cap or crown" is accepted for "not bow" when hats have three values. Precompute the minimal-tier representative of every extension. That gives the difficulty grade (Feldman) and the canonical wording for the "why" text.

**Rule-space sizes** (distinct extensions, from enumeration; balanced and trivial rules excluded later):

| Level | Universe | Distinct rules | Examples a teacher needs (avg / max) | Random examples to identify (avg / max) |
|---|---|---|---|---|
| Easy 3×3, tiers 1–2 | 27 | 18 | 3.0 / 3 | 5.2 / 10 |
| Medium 4×3, tiers 1–3 | 81 | 240 | 4.3 / 6 | 16.9 / 51 |
| Hard 5 attrs, tiers 1–3 | 324 | 446 | 4.4 / 8 | 25.9 / 180 |
| Hard + relations | 81 | 258 | 4.4 / 6 | 16.6 / 52 |

Well-chosen examples are 4–7× more efficient than random ones. That gap is what the hints should teach.

**Pool estimate:** a puzzle is a choice of active attribute set, target rule and opening evidence. With 6 attribute families:

- **Easy:** C(6,3)=20 attribute sets × 18 rules ≈ 360 combinations, about 40 visually distinct concepts.
- **Medium:** C(6,4)=15 × 240 ≈ 3,600.
- **Hard:** 6 × 446 plus parade rules, so tens of thousands.

Easy's concept variety is the thinnest. Avoid repeats by never re-serving the same (attribute, value, operator) within the last 15 Easy puzzles.

### 2.5 Generator

```text
generate(level, chapter, seed):
  rng = mulberry32(seed)
  attrs = pick active attributes (chapter may force e.g. 'size')
  repeat:
    R = sample rule from chapter's tier
    ext = bitset(R)
    reject if passRate(ext) ∉ [0.3, 0.7]                // balanced gate
    reject if minimalTier(ext) != chapter.tier          // no accidental easy rules
  H = all rules in level grammar, deduped by extension  // hypothesis space
  // Opening evidence: teacher-chosen (Shafto) but deliberately NOT complete:
  E = 2 pass + 2 stop chosen greedily to maximise eliminated hypotheses,
      stopping while 3–6 hypotheses remain alive, at least one of which is a
      NARROWER trap (e.g. target "has crown", all shown passers also have stripes)
  line = 8–12 waiting creatures, guaranteed to contain a splitting test for every
         pair of alive hypotheses (so the puzzle is solvable from the line alone)
  return {rule:R, evidence:E, line, alive:H∩consistent(E)}
```

Wason-trap chapters (Medium M4) build the narrow trap on purpose, as in 2-4-6: the opening passers all share a second, irrelevant feature.

### 2.6 Play loop and how the child proves the rule

1. **Watch:** the opening evidence walks to the gate. Passers go through and are shelved under a ✓-arch icon labelled "Passed". Stopped creatures sit under a ✗-barrier icon labelled "Stopped".
2. **Test:** drag a creature from the line (Easy), or build one in the **Dress-up Machine** (Medium+, Zendo's koan building). **Predict first:** tap the ✓ or ✗ paw, *then* send. Prediction makes each test an explicit hypothesis test and gives a moment of surprise when it fails.
3. **"I know the rule!"** is available at any time.
4. **Prove it.** Options compared:
   - *Choose a rule card:* fast, but a guess among consistent cards is luck. Use it only for the Easy tutorial.
   - *Sort N new creatures (Easy):* language-free. With 6 binary predictions, chance success is 1/64 (1.6%). The test creatures are chosen adversarially: each surviving wrong hypothesis misclassifies at least one, so a nearly-right rule cannot pass.
   - *Build the rule from icon tiles (Medium/Hard):* attribute-value tiles plus NOT / AND / OR (or both) / ≥ / "in front" connectors. Building forces abstraction (TERC's value-to-attribute step), works in both languages, and is checked by extension equality. After building, confirm with a 4-creature sort (Medium) or none (Hard).
   - **Recommendation:** Easy = sort 6. Medium = build, then sort 4. Hard = build.
5. **Wrong proof → Zendo counterexample:** the gate shows *one* creature where the child's rule and the true rule disagree, adds it to the evidence, and says "Interesting! This one breaks your rule. Try again." No penalty.
6. **Why panel:** "The rule was **{rule}**. Every creature that passed {had X} ({p} of {p}). Every creature that was stopped {did not} ({s} of {s}). Your key test was {creature}: it showed that {trap feature} didn't matter." The key test is the child's test that eliminated the most hypotheses.

**Scoring by tests:** par = teaching-set size + 2. Rewards add on and never subtract:

- ★ for solving.
- A "Sharp Detective" stamp for solving at or under par.
- A **"Brave Tester" stamp** each time the child correctly predicts a *Stopped* result. This rewards negative tests, the habit the Wason literature says children lack.

**Hints:** from the alive hypotheses, the next suggested test is the creature that splits them most evenly. The hint tiers are a pulse on that creature in the line, then a question ("What if it had no crown?"), then naming two hypotheses and the test that separates them.

### 2.7 Progression

| Level | Chapters (≈25 generated puzzles each, then endless) |
|---|---|
| Easy | E1 one value ("crowns pass") · E2 one attribute, two values · E3 NOT ("everyone except bows") · E4 count ("2 or more buttons") · E5 mixed |
| Medium | M1 AND · M2 OR (or both) · M3 AND NOT · M4 Wason traps · M5 Dress-up Machine free testing |
| Hard | H1 three-term rules · H2 match/relational ("hat and item same family") · H3 Pair Gate ("front one is bigger") · H4 Parade Gate (Eleusis-style sequences) · H5 Two Gates (each creature goes to exactly one of two gates, like Allergic Cliffs) |

```json
{ "id":"fr-M3-000044","seed":44,"level":"medium","chapter":"M3",
  "attrs":{"ears":["fox","owl","frog"],"hat":["none","cap","crown"],"pattern":["plain","stripes","dots"],"count":[1,2,3]},
  "rule":{"op":"and","args":[{"op":"has","attr":"hat","v":"crown"},{"op":"not","arg":{"op":"has","attr":"pattern","v":"dots"}}]},
  "tier":3, "evidence":[{"c":[0,2,1,0],"pass":true}], "line":[[1,2,0,2]], "par":6 }
```

---

## Part 3: Shared notes

**Art (all SVG built in code, CSP-safe; SVG presentation attributes are not `style=""`):**

- Creature layers: hats, items, patterns, buttons, size.
- Sun and Moon tokens, plus a dashed "maybe" variant.
- Speech-bubble frame and operator glyphs: =, ≠, &, or (or both), →, exactly/at least badges.
- Fact props: fruit, weather skies, day/night, on/under scenes.
- Gate/bridge, ✓-arch, ✗-barrier, Dress-up Machine, island map, curtain, album frames, stamps.

Reuse `mascot.js` moods: `think` while pencil mode is on, `happy` on a solve, and `wow` on a counterexample. Never use `oops` as a punishment.

**Accessibility:**

- Everything is reachable by keyboard: arrow keys between creatures, Enter to send, P/S to predict, tile palette as a listbox. Every drag also works as tap-to-select then tap-to-place.
- Every token, verdict and bubble has an `aria-label` in the current language. Verdicts appear in an `aria-live` region.
- Right/wrong is shown by icon shape plus text.
- Gate animations become fades under `prefers-reduced-motion`.
- Touch targets are ≥44 px. At 375 px, the line of creatures scrolls horizontally inside its own container (never the page) and bubbles stack.

**Risks:**

1. Easy Truth Island skeletons are few. Variety must come from scenes; budget art for about 30 scene templates.
2. Brute-forcing tokens in 2–4-speaker puzzles. Mitigated by explanatory checks, and by the clean-solve shell rewarding real deduction.
3. "Moon = says the opposite" breaks for compound sentences: the opposite of "A and B" is "not A, or not B, or both". Children will over-apply "flip each part". Keep compound statements from Moons until Hard, and teach this explicitly with a `MOON_AND` "why" template.
4. Spanish templates must be written natively, with no runtime word composition (negative concord, *o... o...*).
5. Find the Rule at Easy can feel samey. Rotate attribute families and gate themes (bridge, door, bus, picnic blanket).
6. Children may stop at a rule that is right on the creatures shown but wrong in general. The adversarial proof set and counterexample feedback catch this.
7. Equivalence by extension over a finite universe can accept rules a teacher would call different (for example, "not bow" vs "cap or crown"). This is correct for the game, and the "why" text uses the minimal wording.

**Public domain:** Lewis Carroll's *The Game of Logic* (1886) and *Symbolic Logic* are public domain ([Gutenberg 4763](https://www.gutenberg.org/ebooks/4763), [28696](https://www.gutenberg.org/ebooks/28696)). His whimsical syllogism premises can inspire hand-written, credited flavour lines for Hard. Smullyan's puzzles are copyrighted: use the genre, never his texts.
