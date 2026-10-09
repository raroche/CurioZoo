# Levers, shadows, water and dominoes: research for four science games

This file covers four CurioZoo science games. The room's rules apply to all of them: ages 5–13, English and Spanish, plain JS + SVG, tap-only with snapping slots, no timers, no physics engine, one answer per puzzle that whole-number rules can prove, and nothing shown by colour alone.

| id | Name (EN / ES) | Big idea | Main tool (PLAN.md §4) |
|---|---|---|---|
| `lever` | Lift the Elephant / Levanta al elefante | weight × distance (moments); the light side moves farther | Step count |
| `shadow` | Shadow Show / Teatro de sombras | light travels in straight lines; nearer the lamp means a bigger shadow | Light rays |
| `fountain` | Elephant Fountain / La fuente del elefante | water flows down, fills from the bottom, and finds its level | Water rules |
| `domino` | Domino Zoo / Dominó del zoo | a chain reaction passes energy from part to part | Step replay |

How to read this file:
- Every fact has a URL. Lines marked **[design]** are my own proposals. Lines marked **[calc]** are my own arithmetic, and every number in them was checked by hand.
- **Gaps.** I could not open some primary sources (paywalls or 403 errors):
  - Siegler 1976/1981 full text, so his original age-by-rule tables are missing.
  - Feher & Rice 1988 full text.
  - Chen 2009 full text.
  - The shadow chapter of the SPACE *Light* report.
  - HyperPhysics (certificate error).

  For these, the claims come from secondary sources, and each one says so. The web-search budget ran out before I could make one last try for Siegler's percentages (§1.2).
- "Rube Goldberg" is a registered trademark (RUBE GOLDBERG®, Rube Goldberg Machine®, and others): https://www.rubegoldberg.org/licensing ; https://trademark.justia.com/owners/rube-goldberg-inc-709135. In child-facing text, use "chain-reaction machine" / "máquina de reacción en cadena". PLAN.md §5 already bans the name.

---

## 1. Lift the Elephant (levers)

### 1.1 The physics, honestly

| Fact | Source |
|---|---|
| A lever balances when the turning effects match: F₁ × L₁ = F₂ × L₂, where L is the distance from the fulcrum. If they don't match, it turns toward the larger torque. | https://comfsm.fm/~dleeling/physics/torque.html |
| Ideal mechanical advantage = effort-arm length ÷ load-arm length. Example: a 2 m effort arm and a 0.5 m load arm give MA 4. | https://www.tutorchase.com/answers/gcse/physics/how-do-you-calculate-the-mechanical-advantage-of-a-lever |
| A lever multiplies force, not energy. The effort end travels farther: force is traded for distance. | https://comfsm.fm/~dleeling/physics/torque.html |
| Simple machines reduce the force needed. They do **not** change the total work. | https://www.education.vic.gov.au/school/teachers/teachingresources/discipline/science/continuum/Pages/simpmachines.aspx |
| A beam with its centre of mass **below** the pivot returns to level (stable). With the centre of mass **at** the pivot, it stays at whatever angle you leave it (neutral). With it **above**, the beam tips over (unstable). | https://www.physicsforums.com/threads/why-does-a-balance-scale-equal-out.106905/post-882619 ; https://howwhy.nfshost.com/new/book1/equilibrium/balancing.html |

**[design] The game's integer rule (the Step count tool).**
- Pegs sit at whole steps 1…6 on each side of the rock. Each animal has a whole weight.
- `L = Σ weight × steps` on the left, and `R` the same on the right.
- If `L > R` the left goes down. If `L < R` the right goes down. If `L = R` the plank is **level**.
- The plank must be weightless, **or** the rock must be under its middle, so the plank's own weight cancels. If the rock is off-centre, the plank's weight acts at its middle. Hard levels can show that honestly as a "plank-weight" token sitting at the plank's centre peg.

**[design] What "equal" looks like.** A real plank on a rounded rock, with equal torques, sits level if its centre of mass is below the contact point. If the centre of mass is exactly at the pivot, it stays tilted wherever it was (neutral, per the sources above). The game should always show **level** for `L = R`, and say so in the why line. A real balance scale is built to come back to level for the same reason.

**[calc] The trade (light side moves far).** For small tilts, each end moves in proportion to its distance from the rock (similar triangles). If the mouse sits at step 6 and the elephant at step 1, the mouse end moves 6 notches for every 1 notch the elephant rises. Force × distance is the same on both sides: 1 × 6 = 6 × 1.

### 1.2 Siegler's balance-scale rules and item types

**The six item types** (Siegler 1976, 1981):
- Three "simple" types: **balance**, **weight**, **distance**.
- Three "conflict" types, where weight and distance point opposite ways: **conflict-weight** (the heavier side goes down), **conflict-distance** (the farther side goes down), **conflict-balance** (it balances).

Sources: https://stanford.edu/~jlmcc/papers/SchapiroMcC09BalScale.pdf ; https://pmc.ncbi.nlm.nih.gov/articles/PMC8419348

| Rule | What the child does | Right on | Wrong on |
|---|---|---|---|
| (0) | Guesses, about 33% with three choices | — | — |
| I | Weight only | balance, weight, conflict-weight | distance (says "balance"), conflict-distance, conflict-balance |
| II | Weight; distance only when weights are equal | + distance | conflict-distance, conflict-balance |
| III | Sees both, but "muddles through" or guesses when they conflict | all simple types | conflict types at about chance |
| IV | Compares torques (weight × distance) | all | — |

Sources: https://stanford.edu/~jlmcc/papers/SchapiroMcC09BalScale.pdf ; https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2021.702524/full ; https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0136449

**How often each rule shows up, by age.** I could not reach Siegler's original tables. Verifiable figures:

| Sample | Ages | Rule 0 | I | II | III | IV | Source |
|---|---|---|---|---|---|---|---|
| Filion & Sirois 2021 (n = 20/group) | 4–5 | 60% | 30% | 5% | 5% | 0% | https://pmc.ncbi.nlm.nih.gov/articles/PMC8419348 (counts 12/6/1/1/0) |
| same | 9–10 | 10% | 20% | 45% | 10% | 15% | same (counts 2/4/9/2/3) |
| French replication of Siegler (Lautrey et al.) | 13–14 | — | — | — | 56.6% | — | https://www.researchgate.net/publication/247917186_L'epreuve_de_la_balance_de_Siegler_analyse_critique_du_modele_par_elaboration_de_regles (search snippet) |
| same | 16–17 | — | — | — | 63.3% | — | same |
| same | adults | — | — | — | 19/30, 13/20 | 5/30, 6/20 | same |

Other age findings:
- Children under 8 mainly use the weight rule: https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2017.00534/full
- Rule I can last until about 11, and "before age 14, children do not typically understand the torque rule" (Siegler & Chen 1998; Jansen & van der Maas 2002): https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2021.702524/full
- Rule IV appears "only in a minority of adolescents and adults" (Siegler & Chen 2002): https://stanford.edu/~jlmcc/papers/SchapiroMcC09BalScale.pdf
- In a latent-class study of Chinese children, ages 6–9 mostly used Rule I, ages 10–13 mostly a compensation rule, and almost all over 14 used Rule IV: https://jps.ecnu.edu.cn/EN/Y2013/V36/I1/86
- The four rules fit only about 88% of children: https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2021.702524/full
- Some children use an **addition rule**: they compare weight + distance per side instead of weight × distance. Some conflict items can be solved that way and some cannot: https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0136449 ; Jansen & van der Maas 2002: https://pubmed.ncbi.nlm.nih.gov/11890728/
- **[design]** So Hard levels need items where the addition rule and the product rule give different answers (see L10).

**Inhelder & Piaget (1958).** In *The Growth of Logical Thinking*, at about 5–8 children grasp the separate effects of weight and distance but cannot combine them. Coordinating the two comes around adolescence. https://pmc.ncbi.nlm.nih.gov/articles/PMC8419348 ; DOI https://doi.org/10.1037/10034-000

### 1.3 What teaching moves children toward the torque rule

| Finding | Source |
|---|---|
| Siegler 1976: 5-year-olds **encoded only weight**, while 8-year-olds also encoded distance. 8-year-olds learned from feedback and 5-year-olds did not. Once 5-year-olds were trained to *encode distance*, they could then learn higher rules from feedback. Encoding alone was not enough; encoding plus feedback worked. | https://www.academia.edu/55620037/Understanding_and_solving_probability_problems_A_developmental_study (secondary summary) ; Siegler 1976 https://doi.org/10.1016/0010-0285(76)90016-5 |
| 5-year-olds improved on Rule II only after intensive distance training (12 trials). | https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2017.00534/full |
| Li et al. 2017, distance problems, mean correct out of 5: control 0.72, hands-on operation only 1.45 (not significant), feedback 2.45, **operation + feedback 4.35**. Conflict-distance: Op-Fe 2.40 vs control 0.70. | https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2017.00534/full |
| Siegler & Chen 1998: 4–5-year-olds got 16 feedback trials, each "predict → release the lever → explanation", and distance-problem accuracy rose gradually. Feedback worked best in blocks of the same problem type. | same ; DOI https://doi.org/10.1006/cogp.1998.0686 |
| Feedback and rewards in the Math Garden game produced more Rule II use (Hofman et al. 2015). | same ; https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0136449 |
| One-sided levers (wheelbarrows) with 370 first graders (mean age 6.62): load, load distance and force distance can be told apart empirically and differ in difficulty. | https://www.rlp-forschung.de/public/facilities/144/publications/124860 ; DOI https://doi.org/10.1002/tea.21470 |

**[design] Implications:**
1. **Make distance visible before asking about it.** Number the pegs and show step dots. Each animal carries weight dots. This is "encoding" training.
2. **Every puzzle is "predict → release → explain".** This matches the room's guess, Go, why loop.
3. **Teach in blocks, then mix.** A chapter teaches one item type in a block; the mixed review comes after.
4. **The hint ladder is the Step count.** Hint 1 counts weight dots. Hint 2 counts steps. Hint 3 shows `weight × steps` for each side.

### 1.4 Misconceptions to target

| Misconception | Evidence | Puzzle that targets it |
|---|---|---|
| Heavier always wins (Rule I) | Siegler's rules, above | L3, L6 (distance and conflict-distance) |
| Machines make extra work or energy, or "make work easier" by doing less work | Victorian curriculum: students think "all machines produce much more work than their human operators put in" https://www.education.vic.gov.au/school/teachers/teachingresources/discipline/science/continuum/Pages/simpmachines.aspx ; Common Sense Education: many students think simple machines reduce the force needed to do work, so probe input vs output and the trade-off https://www.commonsense.org/education/reviews/simple-machines-by-tinybop | L11 trade-off: the mouse goes down far, the elephant rises a little |
| The longer side is always heavier, or a tilted plank means that side is heavier | Rule I / weight focus, above. For a plank off-centre on a rock, the plank's own weight *does* matter, so the game must remove it or show it (§1.1). | L12 plank-weight token (Hard only) |
| Body parts aren't levers; "machine" means a motor | https://www.education.vic.gov.au/school/teachers/teachingresources/discipline/science/continuum/Pages/simpmachines.aspx | Class-3 why card: "your arm is a lever" |
| Addition rule (weight + distance) | https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0136449 | L10 |

### 1.5 Three classes of lever (for why cards)

| Class | Order | Kid example | Trade | Source |
|---|---|---|---|---|
| 1 | effort, **pivot in the middle**, load | seesaw, scissors | either way, depending on the pivot | https://www.1728.org/machine1.htm ; https://www.aakash.ac.in/important-concepts/physics/types-of-lever |
| 2 | **load in the middle** | wheelbarrow (the wheel is the pivot) | less force, more distance; "the closer the load is to the fulcrum, the easier" | same |
| 3 | **effort in the middle** | tweezers, broom, your forearm (elbow is the pivot) | more force, but the far end moves fast and far ("speed multiplier") | https://www.1728.org/machine1.htm |

**Archimedes' quote.** The famous line ("give me a place to stand and I will move the Earth") is first recorded by **Pappus of Alexandria**, *Synagoge* (Collectio) Book VIII, c. AD 340. It appears later in Tzetzes' *Chiliades*. Plutarch (*Marcellus* 14) gives a different version: given another world to stand on, he could move this one. Scholars doubt Archimedes said it in these words.

Sources: https://en.wikiquote.org/wiki/Archimedes ; https://mathshistory.st-andrews.ac.uk/DSB/Archimedes.pdf ; https://todayinsci.com/A/Archimedes/Archimedes-Quotations.htm

**[design]** The card should say "People say Archimedes said…", not quote him as fact.

### 1.6 Puzzle types and uniqueness [design]

- **Predict.** Three choices: left down / level / right down. The rule makes the answer unique.
- **Balance.** Place the given animals so the plank is level. Brute force over all placements (one animal per peg, identical animals interchangeable) must find exactly one. Covered pegs (flower pots) prune it.
- **Lift (all animals used).** Place every animal so the elephant goes up. Uniqueness again comes from brute force plus covered pegs.
- **How far?** A trade-off question with a whole-number answer.
- Weights: mouse 1, rabbit 2, monkey 3, panda 4. Baby elephant 4–6, grown elephant 10–12. Pegs 1–6 per side.

### 1.7 Teaching puzzles, in learning order (all values checked [calc])

| # | Type (Siegler) | Set-up | Answer / why |
|---|---|---|---|
| L1 | Predict: weight | Left peg 2: 2 mice (4). Right peg 2: 1 mouse (2). | Left down. More weight, same steps. |
| L2 | Predict: balance | A rabbit on peg 3 each side (6 = 6) | Level |
| L3 | Predict: distance | Left peg 1: mouse (1). Right peg 4: mouse (4). | Right down. Same weight, farther out wins. |
| L4 | Build: lift (hero puzzle) | Elephant 5 on right peg 1 (R = 5). Tray: 1 mouse, left pegs 1–6. | Only **peg 6** works (6 > 5). "One mouse lifts an elephant!" Unique. |
| L5 | Predict: conflict-weight | Left peg 2: 3 mice (6). Right peg 4: 1 mouse (4). | Left down |
| L6 | Predict: conflict-distance | Left peg 1: 2 mice (2). Right peg 3: 1 mouse (3). | Right down |
| L7 | Predict: conflict-balance | Left peg 3: 2 mice (6). Right peg 2: 3 mice (6). | Level |
| L8 | Build: balance | Elephant 4 on right peg 3 (R = 12). Tray: 2 rabbits (2 each), one per peg. Pegs 1 and 5 covered. | 2a + 2b = 12 → a + b = 6, a ≠ b, a, b ∈ {2,3,4,6} → **pegs 2 and 4** only. Unique. |
| L9 | Build: balance, three animals, all used | Elephant 6 on right peg 2 (R = 12). Tray: mouse 1, rabbit 2, monkey 3. Left pegs 1–4, one each. | 1a + 2b + 3c = 12, distinct → only **mouse 4, rabbit 1, monkey 2** (4 + 2 + 6). Unique. |
| L10 | Predict: product vs addition (Hard) | Left peg 6: 1 mouse (6; sum 7). Right peg 2: 3 mice (6; sum 5). | **Level.** The addition rule says "left". |
| L11 | How far? (trade-off) | Mouse on peg 6, elephant on peg 2. The mouse end goes down 6 notches. | Elephant rises **2** notches (6 × 2 ÷ 6). |
| L12 | Plank weight (Hard) | Rock off-centre, so the plank's middle is 1 step right of the rock. The plank weighs 2, so its torque is 2 on the right. | Add 2 to R before comparing. The why line names it. |

### 1.8 Level plan

| Level | Ages | Pegs | Weights | Item types | Notes |
|---|---|---|---|---|---|
| Easy | 5–8 | 1–4 | 1–2, dots shown | balance, weight, distance; single-animal lift; "which side goes down?" | Counting only. Distance is drawn as stepping-stones. No multiplication shown. Step count hint uses repeated addition (dots). |
| Medium | 8–10 | 1–6 | 1–4 | all three conflict types; two-animal balance; covered pegs | The `weight × steps` card appears from the second hint. |
| Hard | 10–13 | 1–6, both sides loaded | 1–12 | three or four animals all used; addition-rule discriminators; how-far trade-off; plank weight; class-2 wheelbarrow mode (load between wheel and hands) | Wheelbarrow mode links to the first-grader one-sided-lever research (§1.3). |

### 1.9 Why lines (six-year-old level). ES drafts need native review.

| Idea | EN | ES (draft) |
|---|---|---|
| distance | Farther from the rock pushes down harder. | Más lejos de la roca empuja más fuerte. |
| weight × steps | Count the weight, count the steps, and multiply: the bigger number goes down. | Cuenta el peso, cuenta los pasos y multiplica: el número más grande baja. |
| level | Same number on both sides, so the plank stays flat. | El mismo número en los dos lados: la tabla queda plana. |
| trade | The mouse goes down a long way so the elephant can go up a little. | El ratón baja mucho para que el elefante suba un poquito. |
| no free work | A lever makes pushing easier, but you push for longer. | Una palanca hace el empujón más fácil, pero empujas más trecho. |
| class 3 | Your arm is a lever: your elbow is the rock. | Tu brazo es una palanca: el codo es la roca. |

---

## 2. Shadow Show (light and shadows)

### 2.1 Children's ideas about light and shadow

| Idea | Who / age | Source |
|---|---|---|
| Light "fills the room"; it doesn't travel | common | https://spark.iop.org/many-students-do-not-recognise-light-entity-between-source-and-effect-it-produces |
| Light is only in bright patches, not in the space between the lamp and the patch | most 10–11-year-olds | same |
| Light can bend round objects on its own | some students | https://spark.iop.org/some-students-may-believe-light-can-change-direction-or-travel-curved-path-without-anything |
| A shadow is a "dark reflection", so it always has the object's shape | some students | https://spark.iop.org/some-students-believe-shadows-are-reflection-object-and-therefore-always-expect-shape-shadow-be |
| Young children mix up shadow and reflection, and may draw a face on a shadow | young children | same, and IOP worksheet https://spark.iop.org/sites/default/files/media/documents/BEST_PSL_1_2_Diagnostic_A%20penguin%27s%20shadow.doc |
| A shadow is part of the object, made visible by light | some | same worksheet |
| Darkness is a thing: shadows hide in objects until light pushes them out | some | https://spark.iop.org/some-students-consider-darkness-important-concept-light-eg-shadows-can-exist-their-own |
| **Guesne 1985:** many 10–11-year-olds saw a shadow as a copy of the object's shape. By 14 most saw light as an entity that explains shadows in bright light, but many thought no shadow forms in dim light. | 10–14 | via IOP worksheet above; book: https://www.stem.org.uk/node/199859 |
| **Grigorovitch & Alexandropoulou 2025**, 402 pupils aged 6–10, interviewed. Could explain a shadow as light blocked by an object: 4.1% (6–7), 3.8% (7–8), 6.3% (8–9), 7.6% (9–10). Said the shadow also exists in the space behind the object: 5–13%. Matched two lamps to two shadows: 3.1%, 1.9%, 7.4%, 8.8%. **Age made no significant difference.** | 6–10 | https://oapub.org/edu/index.php/ejes/article/view/6211 (full PDF read) |
| The same paper lists other known difficulties: where shadows fall relative to light and object, and the number of lamps vs the number of shadows. It cites Chen 2009. | — | same |
| **Feher & Rice 1988**, "Shadows and anti-images: Children's conceptions of light and vision II", *Sci. Ed.* 72(5):637–649. Used a cross-shaped light source with a bead and a ball. I could not read the full text, so its findings are not reported here. | 8–13 (series) | https://philpapers.org/s/Elsa%20Feher (citation) |
| **Chen 2009**, "Shadows: young Taiwanese children's views and understanding", *IJSE* 31(1):59–79. Full text not read. | young children | https://doi.org/10.1080/09500690701633145 |
| **SPACE *Light* report** (Osborne, Black, Meadows, Smith 1990). Primary children's ideas, with the target concept "light travels in straight lines". Fieldwork 1987–88. The shadow chapter was not read. | primary | https://www-legacy.stem.org.uk/resources/elibrary/resource/29216/space-project-research-report-light ; https://vufind.lboro.ac.uk/Record/220803/Description |

**[design] Implications:**
1. Always draw the **rays** (the Light rays tool) as straight lines from the lamp, through the space, past the cut-out's edges. The finding that "light lives only in bright patches" means the space between must be shown.
2. Make the **shadow region in the air** visible, as a hatched wedge behind the cut-out, so the child sees it isn't only "on the wall". Only 5–13% of 6–10-year-olds say it is there.
3. Teach **one lamp, one shadow; two lamps, two shadows** explicitly. Only 2–9% of 6–10-year-olds get this right.
4. Shadow shape is **not** always the cut-out's face-on shape: an edge-on cut-out makes a thin line (Hard). This targets "shadow = dark reflection".

### 2.2 Physics rules (integer-friendly)

| Rule | Source |
|---|---|
| Opaque blocks light (dark shadow). Translucent lets some light through (paler shadow). Transparent lets nearly all through (faint or no shadow). | https://www.edplace.com/worksheet_info/science/keystage2/year3/topic/792/2541/letting-the-light-through ; https://www.thenational.academy/teachers/programmes/science-primary-ks2/units/introduction-to-light-and-shadows/lessons/opaque-transparent-and-translucent/downloads |
| The shadow changes as lamp, object and screen distances change. Light source, object and shadow are always in a straight line. | https://spark.iop.org/some-students-use-idea-light-not-travelling-straight-lines-say-sunlight-can-strike-earth-different (IOP Spark, via search text) |
| Similar triangles: image height ÷ object height = (distance to screen) ÷ (distance to object), measured from the point source or pinhole | https://nrich.maths.org/8041/solution |
| Low sun means long shadows (morning, evening, winter). Highest sun (solar noon) means the shortest shadow. | https://www.nsta.org/lesson-plan/me-and-my-shadow ; https://peep-dev.wgbh.org/en/educators/curriculum/center-based-educators/shadows/activity/stand-alone/522/long-and-short-shadows |
| An extended source gives an umbra (dark core) and a penumbra (partly lit rim). With two lamps, the darkest zone is where the two shadows **overlap**; it is not a third shadow. | https://arxiv.org/pdf/1604.00508 ; https://www.physicsforums.com/threads/thought-experiment-with-two-point-sources-of-light.591891/post-3842229 |
| Students find the penumbra ambiguous: is it "half lit" or "half shadow"? | https://iwant2study.org/lookangejss/journalpaper/08_1019_Bulbul.pdf |
| Moving the screen farther away grows the penumbra and shrinks the umbra | https://arxiv.org/pdf/1604.00508 |

**[calc] Grid shadow formula.**
- Put a point lamp at column 0, the wall at column W, and the cut-out at column x.
- Shadow size = cut-out size × `k`, where `k = W / x` (lamp-to-wall ÷ lamp-to-object). Width and height both scale by `k`.
- With **W = 12**, puppet slots go at x ∈ {2, 3, 4, 6, 12}, giving k = 6, 4, 3, 2, 1. Every product is a whole number.
- **Lamp height.** With the lamp at row `yL` and the cut-out spanning rows `[a, b]`, the wall shadow spans `[yL + (a − yL)·k, yL + (b − yL)·k]`. Raising the lamp **lowers** the shadow (worked in S7).
- **Moving the lamp instead.** With the puppet at column 6 and the wall at 12, lamp slots at columns 0, 3, 4, 5 give k = 12/6, 9/3, 8/2, 7/1 = **2, 3, 4, 7**. All are whole numbers because 6 − L divides 6.
- **Sun (parallel rays).** Give the sun as a rise:run slope: 2:1 high, 1:1, 1:2, 1:3 low. Shadow length = height × run ÷ rise. A tree of height 2 gives shadows 1, 2, 4, 6.
- **Two lamps.** For each wall cell, count how many lamps are blocked: 0 = lit, 1 = half shadow (penumbra, shown dotted), 2 = full shadow (umbra, shown solid). The counts are whole numbers, and the patterns are not colours.

**[design] Presentation.** A pure side view shows the wall edge-on, so the shadow's *shape* is invisible. Use a split stage:
- **Side view** (top): lamp, slots, wall, rays.
- **Audience view** (bottom): the wall face-on, with the target **outline** and the shadow drawn as fills. Opaque is solid, translucent is dotted, transparent is outline-only, and each also gets a text label.

### 2.3 Shadow-puppet "why" card (culture)

| Tradition | Fact | Source |
|---|---|---|
| Wayang (Indonesia) | Wayang kulit uses flat leather shadow puppets in front of a screen lit from behind. The dalang moves them with slender sticks while gamelan plays. UNESCO Representative List, 2008. | https://ich.unesco.org/en/RL/wayang-puppet-theatre-00063 |
| Karagöz (Türkiye) | A performer (the Hayali) moves hide puppets on sticks **between a lamp and a fabric screen**. Comic plays about Karagöz and Hacivat. UNESCO 2009. | https://ich.unesco.org/en/RL/karagoz-00180 |
| Chinese shadow puppetry | Colourful leather or paper silhouettes on rods, on a **translucent** screen lit from behind, with music and singing. Skills pass down through families and from master to pupil. UNESCO 2011. | https://ich.unesco.org/en/RL/chinese-shadow-puppetry-00421 ; https://ich.unesco.org/en/decisions/6.COM/13.3 |

**[design]** Card line: "People in Indonesia, Türkiye and China have told stories with shadows for hundreds of years: a lamp, a screen and puppets in between." The Chinese puppets are coloured *and* translucent, so they link to the translucent chapter.

### 2.4 Puzzle design [design]

- **Pieces:**
  - Lamp: one or two, with height slots.
  - Cut-outs: mouse, rabbit, giraffe, turtle, elephant, each in one or two sizes and one material (card / tissue / glass).
  - Snapping columns.
  - Wall outline.
  - Sun slots (outdoor chapter).
- **Goal:** the shadow matches the outline exactly (cell-for-cell), or a ground shadow covers / doesn't cover named animals.
- **Uniqueness:** brute force over cut-out × slot × lamp-slot (at most about 5 × 5 × 4 = 100 states). Exactly one must match. Shape picks the cut-out; `k` picks the slot.
- **Variety knobs:**
  - cut-out choice (shape)
  - slot (size)
  - lamp height (position)
  - moving the lamp instead of the puppet
  - material (darkness)
  - two lamps (count and overlap)
  - edge-on rotation (Hard: a cut-out turned 90° casts a 1-cell-wide bar)
  - two cut-outs whose shadows join into one outline (Hard; Shadowmatic's two-piece puzzles were the reviewers' favourite, §5)
  - sun slope

### 2.5 Teaching puzzles, in learning order (values checked [calc])

The stage uses W = 12, wall rows 0–12, and lamp row 6 unless stated.

| # | Teaches | Set-up | Answer |
|---|---|---|---|
| S1 | Light goes straight; something must block it | Lamp, wall, one card rabbit. Slots on both sides of the lamp. Outline on the wall. | Any slot **between** lamp and wall. A slot behind the lamp gives no shadow. (Accept any between-slot whose shadow fits a size-tolerant outline. This is the one teaching puzzle with a set of answers.) |
| S2 | Shadow shape = outline | Slot fixed at x = 6 (k = 2). Cut-outs: rabbit, giraffe, turtle. Outline: giraffe, ×2. | Giraffe |
| S3 | Nearer the lamp = bigger | Rabbit h = 2. Outline h = 6. Slots 2, 3, 4, 6 give 12, 8, 6, 4. | **x = 4** (k = 3) |
| S4 | Shape + size | Rabbit h2, giraffe h3, turtle h1. Outline: giraffe h9. | Giraffe at **x = 4** |
| S5 | Translucent | Card rabbit and tissue rabbit (same size). Outline: dotted "pale" rabbit. | Tissue rabbit. Glass gives only an outline (no shadow). |
| S6 | Move the lamp, not the puppet | Puppet h2 fixed at column 6. Lamp slots 0, 3, 4, 5 give 4, 6, 8, 14. Outline h8. | Lamp at **column 4** |
| S7 | Lamp height moves the shadow the *other* way | Puppet rows 5–7 at x = 4 (k = 3). Lamp rows 5 / 6 / 7 give shadows [5,11] / [3,9] / [1,7]. Outline [1,7]. | Lamp **up** at row 7, so the shadow goes **down** |
| S8 | Low sun = long shadow | Tree h2. Sun slopes 2:1, 1:1, 1:2, 1:3 give lengths 1, 2, 4, 6. A lion asleep at ground cells 3–4 wants shade; a zebra at cells 5–6 wants sun. | Slope **1:2** (length 4), the late-afternoon sun |
| S9 | Two lamps, two shadows | Lamps at rows 4 and 8. Puppet rows 5–7 (h2). At x = 6 (k = 2): shadows [6,10] and [2,6], two shapes touching. At x = 12 (k = 1): both [5,7], one dark shadow. Outline: one solid h2 shape. | x = 12 (against the wall) |
| S10 | Umbra / penumbra (Hard) | Same lamps. Outline: solid core + dotted rim. | The slot whose overlap count gives exactly the solid cells (verified by brute force) |

### 2.6 Level plan

| Level | Ages | Content |
|---|---|---|
| Easy | 5–8 | One lamp, card cut-outs, k ∈ {1, 2, 3}, shape-only and size-only puzzles. Then shape + size. "Which shadow will this make?" picture choice. Sun high / low with two slopes. |
| Medium | 8–10 | All slots (k up to 6). Moving the lamp. Lamp height (opposite direction). Materials (opaque / translucent / transparent windows: a glass-window cut-out makes a hole in the shadow). Sun slopes ×4. Two lamps → two shadows. |
| Hard | 10–13 | Two cut-outs join into one outline. Edge-on cut-outs. Umbra / penumbra counting. Lamp + puppet both movable (verify uniqueness). Predict-the-numbers: "the shadow will be __ squares tall" (`h × W ÷ x`). |

### 2.7 Why lines

| Idea | EN | ES (draft) |
|---|---|---|
| straight | Light goes in straight lines, so it can't bend around the rabbit. | La luz va en línea recta y no puede rodear al conejo. |
| shadow | A shadow is the place where the light can't get to. | La sombra es el lugar adonde la luz no llega. |
| closer | Closer to the lamp blocks more light, so the shadow grows. | Cerca de la lámpara tapas más luz y la sombra crece. |
| lamp up | Lift the lamp and the shadow slides down. | Si subes la lámpara, la sombra baja. |
| sun | When the sun is low, shadows are long; at lunchtime they are short. | Con el sol bajo, las sombras son largas; al mediodía, cortas. |
| translucent | Tissue lets some light through, so its shadow is pale. | El papel fino deja pasar algo de luz: su sombra es clarita. |
| two lamps | Two lamps make two shadows; where they overlap it's darkest. | Dos lámparas hacen dos sombras; donde se juntan, está más oscuro. |

---

## 3. Elephant Fountain (water flow)

### 3.1 Children's (and adults') ideas about water levels

| Idea | Source |
|---|---|
| **Piaget–Inhelder water-level task.** Children see a tilted bottle and draw the water line. Those without the horizontality concept draw it **oblique, following the bottle**. Piaget and Inhelder reported mastery by about 9–10. | https://scispace.com/topics/water-level-task-vile9v85 ; https://c2055.cloudnet.se/en/piaget-water-test.html |
| Many adults also fail the water-level task, contrary to Piaget's age claim | https://pure.psu.edu/en/publications/perceiving-and-representing-horizontals-from-laboratories-to-natu/ ; https://online.stat.psu.edu/stat504/lesson/case-study-water-level-study |
| Communicating vessels: connected containers holding one liquid settle at **the same level whatever their shape or width** (Stevin; Pascal) | https://en.wikipedia.org/wiki/Communicating_vessels |
| Misconception: in a U-tube with one wide arm, "the wide side must be lower because more water is heavier" (about a quarter of students). Also: the narrow spout of a jug holds water higher than the body. | https://mirjamglessmer.com/?p=945 |
| Loverude, Heron & Kautz (AJP 78(1)): fewer than 25% of *university* students answered paired hydrostatics problems consistently. Students confuse pressure with the weight of water above a point. | https://mirjamglessmer.com/2014/02/05/letter-tubes-and-hydrostatic-pressure/ ; tutorial https://www.physport.org/curricula/UWTutorials/t/tutorial.cfm?G=PRS1st |
| Classroom demos: a multi-tube liquid-level apparatus marketed for 11+; a "miscommunicating vessels" demo (two liquids) | https://findel-international.com/product/science/physics/motions-and-forces/philip-harris-liquid-level-apparatus/e8r06791 ; https://interactivetextbooks.tudelft.nl/showthephysics/demos/demo38/demo38.html |

**[design]** Build prediction cards for (a) "which tube fills higher?" with wide vs narrow arms (same level) and (b) a tilted-bottle picture choice (flat water). These target the two documented misconceptions directly.

### 3.2 How existing grid-water simulators work

| Approach | Source |
|---|---|
| Three rules: gravity first (fall if space below); if blocked, spread left and right; if blocked on both sides, flow diagonally ("pressure") | https://dev.to/timlittle/build-a-water-simulation-in-go-with-raylib-go-4hef |
| Flow sideways only into cells holding less water (numeric levels) | https://forum.terasology.org/goto/post?id=7177 |
| Per-cell level + flow vector. Simple rules give "cool behaviours" but don't come close to real water. | https://www.gamedeveloper.com/programming/how-water-works-in-dwarfcorp |
| Gravity alone stacks particles. A sideways rule is needed to fill wide containers. Update **bottom-up** to avoid "teleporting". | https://github.com/luciopaiva/water ; https://dev.to/timlittle/build-a-water-simulation-in-go-with-raylib-go-4hef |
| **Priority-Flood:** fill depressions in order of spill height using a priority queue. Optimal for integer data. | https://arxiv.org/abs/1511.04463 |

**Why the usual cellular rules are not honest enough here.** Local "fall, then spread" rules **break communicating vessels**. Pour into one arm of a U-tube and that arm rises while the other stays low, because nothing carries pressure through the bend. Random left/right choices break determinism. The model below fixes both.

### 3.3 Proposed honest rule set (the Water rules tool) [design]

The grid has empty, dirt (tap to dig, which empties it), rock, gate (tap to toggle open / shut), pipe (an empty tunnel drawn through rock), trough (a target that needs *n* cells of water), and cat (a forbidden cell). The elephant holds **N drops**: a finite volume shown as N drop icons. One drop fills one cell.

Each drop, one at a time:
1. **Fall.** It drops straight down from the trunk through empty cells.
2. **Land.**
   - If it lands on solid ground, it runs along that row toward the **one** side with a drop-off and falls again. A level is invalid if a landing row has drop-offs on both sides at different distances, or any tie. The generator rejects it.
   - If it lands on water, it joins that **pool**: the connected (4-neighbour) water cells.
3. **Pool rule.** The drop fills the **lowest empty cell touching the pool**. Ties go to the cell nearest the column where the drop arrived, then left.
   - If that cell has empty space below it (it is a lip or spout), the drop **spills**: it falls from there instead (back to step 1).
   - Because every cell touching the pool is a candidate, both arms of a U-tube rise **together, one row at a time**. That is communicating vessels, and no pressure maths is needed.
4. **Stop.** The run ends when all N drops are placed. A trough is "drunk" when all of its cells hold water. Any water in a cat cell ends the run with "Surprise! The cat woke up" (no punishment, per PLAN §3.2).

Properties and checks:
- **No siphons.** A pool only rises one row above its current top, so water never climbs a tube higher than its own surface. Real siphons, once primed, would drain lower. Levels avoid tube shapes where that would matter (the generator rejects pipes whose crest is below the source pool's final level), and a why card can mention it.
- **Partial-row ties.** If a run ends with a partly filled row shared by two vessels, left-first tie-breaking would show an uneven level. The generator rejects any level whose goal depends on such a partial row. Better still, choose N so rows finish.
- **No lava, poison or bombs.** Where's My Water's toxic ooze and bombs drew Common Sense Media's "mild violence" notes (skulls, Swampy yelping): https://www.commonsensemedia.org/app-reviews/wheres-my-water. Keep to dirt, rock, gates, pipes and troughs. Optional Hard piece: a **sponge** that soaks up exactly 2 drops (integer) before water passes it.

**Uniqueness.** Give the child a **shovel count** (e.g. 2 digs) and some gates. Brute force every subset of diggable cells up to the budget, times every gate state. With about 12 dirt cells, a budget of 3 and 3 gates, that is (1 + 12 + 66 + 220) × 8 = 2,392 runs, which is trivial. Exactly one must succeed.

### 3.4 Teaching puzzles, in learning order

| # | Teaches | Set-up | Answer |
|---|---|---|---|
| W1 | Water falls down | Trunk above a giraffe's trough. One dirt cell between. 1 dig. | Dig that cell |
| W2 | It runs along to the edge | Water lands on a shelf that is closed both ends. Left end over the hippo, right end over the sleeping cat. 1 dig. | Dig the **left** end. The other end stays dirt. |
| W3 | Fills from the bottom (predict) | A pit with a duck trough at the bottom row and a zebra trough two rows up. | "Who drinks first?" Duck |
| W4 | Gates | Two channels, each with a gate. One leads to the cat. | Shut the cat gate, open the other |
| W5 | Overflow: fill, then spill | A basin of 6 cells with a lip toward the rhino. N = 8; the rhino needs 2. | Nothing to dig. Predict "yes, it spills" and count 6 + 2. |
| W6 | Communicating vessels | A U-pipe under a rock wall. Pour on the left. A meerkat's cup sits on the right at row 3. | It fills: the right side rises with the left, to the **same level** |
| W7 | Wide vs narrow (Hard predict) | Same U, wide left arm, narrow right arm | "Where will the water stop on the right?" **Same row** |
| W8 | Counting drops | N = 6. Two troughs of 3. A basin over trough A spills to B. | Order the gates so A fills, then spills to B |
| W9 | Trap | The obvious dig drains onto the cat. A gate further up must be shut first. | Shut the gate + dig (budget 1 dig) |
| W10 | Tilted bottle (prediction card) | Picture choices of water in a tilted bottle | The flat-top picture |

### 3.5 Level plan

| Level | Ages | Content |
|---|---|---|
| Easy | 5–8 | Grid about 8×10. 1–2 digs. One trough. No gates, then one gate. Predict "who drinks first". N is generous. |
| Medium | 8–10 | 2–3 digs, 2 gates, overflow basins, two troughs, a cat. U-pipes with equal arms. N exact (counting matters). |
| Hard | 10–13 | Wide / narrow vessels, three-vessel networks, sponges, exact N with spill chains, prediction of final row numbers. Puzzles where the shortest path wastes water. |

### 3.6 Why lines

| Idea | EN | ES (draft) |
|---|---|---|
| down | Water always goes down if it can. | El agua siempre baja si puede. |
| sideways | When it can't go down, it runs sideways to find a way down. | Si no puede bajar, corre de lado buscando cómo bajar. |
| bottom-up | Water fills the lowest place first, then rises. | El agua llena primero lo más bajo y luego sube. |
| same level | Joined pools end up the same height, wide or thin. | Los charcos unidos quedan a la misma altura, anchos o finos. |
| flat top | Tip the bottle, and the top of the water stays flat. | Si inclinas la botella, el agua sigue plana arriba. |

### 3.7 What made Where's My Water? and sugar, sugar fun

| Game | Fun | Frustrations | Sources |
|---|---|---|---|
| Where's My Water? (Disney; developer Creature Feep, 2011) | Built on water because "everyone knows how water flows" and few games had done water physics. Touch-guided flow. A character with personality (Swampy). Three rubber ducks per level as optional goals. Cute look and story. Teaches gravity and states of matter. Small learning curve. | Imprecise finger digging. An awkward scroll bar on big levels. Trial and error. Collecting every duck "isn't child's play". In-app purchases; the sequel paywalls after 30 levels. | https://www.engadget.com/2011/11/07/wheres-my-water-creator-goes-from-qa-to-hit-game-designer-at-di/ ; https://en.wikipedia.org/wiki/Where%27s_My_Water%3F ; https://www.pocketgamer.com/wheres-my-water/review/ ; https://www.commonsensemedia.org/app-reviews/wheres-my-water ; https://www.commonsensemedia.org/app-reviews/wheres-my-water-2 ; https://www.gameskinny.com/s9p5j/why-wheres-my-water-was-better-than-angry-birds |
| sugar, sugar (Bart Bonte) | Draw lines to steer falling sugar into cups. New mechanics keep arriving (colour filters, gravity flips, teleports). Sandbox mode. Few ads. | Sugar starts automatically after a few seconds (timing). "A bit of luck or chance". Rule changes need several retries. | https://www.pocketgamer.com/sugar-sugar/bart-bonte-brings-a-taste-of-flash-to-ios-and-android-with-sugar-sugar/ ; https://apps.apple.com/app/id568141784 ; https://toucharcade.com/games/sugar-sugar |

**[design] Lessons:**
- Taps on snapping cells, never freehand digging.
- The whole level fits on one screen, with no scroll.
- The child presses Go; nothing starts by itself.
- Deterministic water: no luck.
- New piece types arrive one per chapter, each with a 🎓 teaching puzzle.
- Optional "bonus" fish to splash would break uniqueness. Skip them, or make them part of the one answer.

---

## 4. Domino Zoo (chain reactions)

### 4.1 Domino physics

| Fact | Source |
|---|---|
| Lorne Whitehead (UBC), "Domino 'chain reaction'", *American Journal of Physics* 51:182 (1983): a domino can knock over one about **1.5×** its size | https://www.smithsonianmag.com/smart-news/just-twenty-nine-dominoes-could-knock-down-the-empire-state-building-2232941/ ; https://www.youngstarswiki.org/en/print/pdf/node/1849 ; https://www.futilitycloset.com/2022/03/02/the-bigger-they-are/ |
| Stephen Morris (U. Toronto) toppled 13 dominoes, each 1.5× the last, from about 5 mm tall. Energy was amplified about **two billion** times, and the last domino was a 45 kg block. 29 dominoes would reach Empire State Building height. | https://physicsworld.com/a/how-many-dominoes-will-topple-a-cathedral-tower/ ; https://www.businessinsider.in/science/A-Domino-The-Size-Of-A-Tic-Tac-Could-Topple-A-Building/articleshow/46060571.cms |
| van Leeuwen's idealised model allows a growth factor up to about 2. Real dominoes lose energy to bouncing, slipping and friction. | https://physicsworld.com/a/how-many-dominoes-will-topple-a-cathedral-tower/ |
| Deeper physics papers: arXiv physics/0401018 and 1301.0615 | via https://www.youngstarswiki.org/en/print/pdf/node/1849 (not read) |

**Honest energy wording.** A standing domino *stores* energy (it is lifted). The push only **triggers** the fall, and each domino releases more energy than it received. That is why the last one can be two billion times stronger.

**[design]** The kid line "energy passes from part to part" is fine, with a Hard why card: "Each domino was holding energy by standing tall; a small push lets it go."

### 4.2 The Incredible Machine and Contraption Maker: design notes

| Note | Source |
|---|---|
| Each puzzle has three things: a **goal**, an **incomplete machine of fixed parts**, and a **bin of extra parts**. 87 machines, from tutorial to very hard. About 45 parts. Parts can flip and stretch. | https://www.filfre.net/2018/06/the-incredible-machine/ |
| The puzzles were dynamic simulations, so many had **unintended solutions**. In some, parts in the bin went unused. | same |
| What made it fun: puzzles build on each other ("being smart"), experimentation is rewarded, scoring is optional ("the joy… is making machines that work"), a free-form toy box, low commitment, intuitive mouse controls | same ; https://en.wikipedia.org/wiki/The_Incredible_Machine_(1993_video_game) |
| Kevin Ryan wrote the collision code from scratch with **polygon borders and integer math** for speed (1992) | https://www.indiedb.com/members/kevryan/blogs |
| 80 puzzles; "deceptively addicting" (*CGW* 1993); sold over 800,000 | https://en.wikipedia.org/wiki/The_Incredible_Machine_(1993_video_game) |
| Contraption Maker (Spotkin, 2014) is by the same original developers (Tunnell, Ryan) | https://spotkin.itch.io/contraption-maker ; https://en.wikipedia.org/wiki/Jeff_Tunnell |

**[design] Lessons:**
- Keep the goal / fixed-machine / parts-tray structure.
- Kill unintended solutions with **snapping slots + brute-force verification** (§4.5). Unintended solutions came from free placement on a continuous engine.
- Keep stars optional-feeling: the bell ringing is the reward.

### 4.3 Kids' engineering and design process

| Fact | Source |
|---|---|
| Engineering is Elementary: Ask → Imagine → Plan → Create → Improve. Chosen for its simple terms and scaffolding. | https://www.itejournal.org/wp-content/pdfs-issues/spring-2014/09difrancescaetal.pdf |
| NGSS K-2-ETS1-1: define a simple problem that a new or improved tool can solve. ETS1-2: sketch or model how an object's shape helps it work. NGSS uses three phases (Define, Develop solutions, Optimize). | https://nextgenscience.org/node/1116 ; https://www.itejournal.org/wp-content/pdfs-issues/spring-2014/09difrancescaetal.pdf |
| Preschool adaptation: find a problem → imagine & plan → create → improve | https://digitalcommons.usf.edu/tal_facpub/106 |
| Tinybop Simple Machines: NGSS engineering practices in games, and kids build at their own pace. But it is "short on tools to help kids analyze their observations", so it is best "sandwiched between class discussions". | https://www.commonsense.org/education/reviews/simple-machines-by-tinybop |
| A teacher's lever-launch anecdote: kids reasoned with the app to move the fulcrum closer to the load | https://www.commonsense.org/education/reviews/simple-machines-by-tinybop/teacher-reviews/4083756 |

**[design]** Map the loop onto the game:
- **Ask:** the bell must ring.
- **Imagine / Plan:** tap parts into gaps.
- **Create:** Go.
- **Improve:** Step replay shows where the chain stopped, frame by frame.

The Step replay is the analysis tool that Tinybop lacked.

### 4.4 Parts with integer behaviours [design]

The board is a grid. Time runs in **ticks**, using a FIFO event queue, so there is no randomness. Every part shows its direction with an arrow or shape, never colour.

| Part | Snaps into | Triggered by | Does (integer) |
|---|---|---|---|
| **Domino** S / M / L / XL (heights 2 / 3 / 4 / 6) | 1 cell | a push from either side | Falls the way it was pushed and pushes the next cell next tick. **Size rule:** it topples the next domino only if `next ≤ ⌊1.5 × own⌋`: 2→3 ✓, 3→4 ✓, 4→6 ✓, 2→4 ✗, 3→6 ✗. This is Whitehead's 1.5 rule. |
| **Ball** | 1 cell | a push | Rolls 1 cell per tick in the push direction until blocked (and pushes the blocker). At an edge, falls 1 cell per tick until it lands. |
| **Ramp** ◢ / ◣ | 2×1 or 2×2 | a ball arriving at the top, or landing on it | Ball exits at the bottom, rolling downhill. Turns a drop into a roll. |
| **Seesaw** | 3 cells | a weight landing on one end | The other end flips up and **pushes the cell above it** (or tosses what sits on it up 2 cells) |
| **Pulley** (two buckets on a rope) | 2 columns | a ball dropping into bucket A | A goes down 2 cells and B goes up 2 cells. B pushes what is above it. |
| **Fan** (with a switch) | 1 cell + a facing | a ball or domino hitting its switch | Blows along its row: a light object (paper boat, balloon, feather) moves up to 4 cells or until blocked, then pushes. Why card: "The ball only flips the switch; the battery gives the push." (honesty) |
| **Plank lever** (links to Game 1) | 3–5 cells | a weight drops on one end | The other end lifts what's on it. Uses Game 1's weight × steps rule. |
| **Feeding bell** (goal) | 1 cell | any push or hit | Rings, and the keeper feeds the animals |

### 4.5 Guaranteeing one solution [design]

1. **Generate** a working machine forward from a template library (start, then 4–9 parts, then the bell). Simulate to confirm the bell rings.
2. **Remove** 1–3 parts. Their cells become **snapping gaps**; the removed parts go in the tray. Hard levels add 1–2 decoy parts.
3. **Brute force** every assignment of tray parts (and orientations) to gaps, including leaving gaps empty and leaving decoys unused. Accept the level only if **exactly one** assignment rings the bell, and the empty assignment fails. This is the same idea as Sudoku generation: remove clues while a solver confirms one solution, and stop counting at 2.
   - With 4 gaps, 4 parts and 2 orientations, there are at most 4! × 2⁴ + partial assignments, a few thousand runs.
4. **Reject near-misses** where a wrong part *almost* rings (e.g. the bell is reached on the last tick by a different route). This removes "I was right but it said no".

Sudoku generator sources: https://codemia.io/knowledge-hub/path/sudoku_generator_algorithm_closed ; https://docs.rs/sudoku-variants

### 4.6 Teaching puzzles, in learning order

| # | Teaches | Set-up | Answer |
|---|---|---|---|
| D1 | Push passes along | A line of M dominoes with one gap. Tray: 1 M domino. | Fill the gap |
| D2 | Size rule | S … [gap] … L. Tray: M, XL. | **M** (S→M→L works; S→XL fails) |
| D3 | Ball + ramp | The last domino pushes a ball on a ledge. The bell is on the floor to the right. Gap below the ledge edge. Tray: ramp ◢, ramp ◣. | The ramp sloping toward the bell |
| D4 | Seesaw | The ball drops onto the left end. The bell hangs above the right end. Gap = the seesaw cell. | Seesaw |
| D5 | Pulley | The ball falls into a bucket. The bell is above the other bucket. | Pulley (B rises 2 cells to the bell) |
| D6 | Fan (energy from a battery) | The ball hits the fan switch. A paper boat crosses the pond to the bell. Tray: fan facing left, fan facing right. | The fan facing toward the bell |
| D7 | Two gaps | Domino size gap + ramp gap | Both |
| D8 | Three gaps + decoy | Domino, seesaw, fan + decoy ball | The unique assignment |

### 4.7 Level plan

| Level | Ages | Content |
|---|---|---|
| Easy | 5–8 | 1 gap, parts: domino (one size), ball, ramp. Tray of 2. "What happens next?" picture prediction before Go. |
| Medium | 8–10 | 1–2 gaps. Adds domino sizes, seesaw, pulley. Tray of 3 with one decoy. Orientation matters. |
| Hard | 10–13 | 2–3 gaps. Fan, plank lever (weight × steps), XL dominoes, two decoys. Predict the tick when the bell rings (Step replay counts). |

### 4.8 Why lines

| Idea | EN | ES (draft) |
|---|---|---|
| chain | Each part gives the next one a push. | Cada pieza le da un empujón a la siguiente. |
| size | A domino can knock over one a bit bigger, but not one twice as big. | Un dominó tumba a otro un poco más grande, pero no al doble. |
| stored energy | A standing domino holds energy; a tiny push lets it go. | Un dominó de pie guarda energía; un empujoncito la suelta. |
| ramp | A ramp turns falling into rolling. | La rampa convierte la caída en rodar. |
| pulley | One bucket goes down, so the other goes up. | Si un cubo baja, el otro sube. |
| fan | The ball only flips the switch; the battery makes the wind. | La pelota solo aprieta el botón; la pila hace el viento. |

---

## 5. Fun and frustration across similar apps

| App | What reviewers liked | What went wrong | Our rule [design] | Sources |
|---|---|---|---|---|
| Tinybop Simple Machines (6+ per CSM; Tinybop says 4+) | Sandbox; kids "create and figure out simple machines on their own terms"; moving the fulcrum to see changes | Few analysis tools; App Store user average about 3.8 (US) | Step count / Step replay as the analysis tool, plus a why line every time | https://www.commonsensemedia.org/app-reviews/simple-machines-by-tinybop ; https://www.commonsense.org/education/reviews/simple-machines-by-tinybop ; https://madisonpubliclibrary.org/node/1088188 ; https://apps.appfollow.io/ios/simple-machines-by-tinybop/936966570?country=us |
| Shadowmatic (Triada) | Built for touch; two-piece puzzles "much more interesting"; non-linear progression; Apple Design Award (developer claim); hot-cold hint dots | 360° rotation makes you think it's solved when it wants a slight extra turn | Snapping slots and cell-exact outlines: no "almost" states. Hints are a ladder, not hot/cold. | https://www.pocketgamer.com/shadowmatic/review/ ; https://www.appunwrapper.com/2015/01/19/shadowmatic-review-a-gorgeous-but-flawed-puzzler/ ; https://www.macworld.com/article/224913/you-should-play-twist-objects-into-shadow-puppets-with-puzzler-shadowmatic.html ; https://forums.imore.com/threads/review-shadowmatic-by-triada-studio-universal-binary.346550/ ; https://www.trustedreviews.com/shadowmatic-review |
| Where's My Water? | Character, water as a fresh toy, optional ducks, small learning curve | Imprecise digging, scrolling, trial and error, in-app purchases, scary hazards | Tap cells, one screen, deterministic, no hazards, free | §3.7 |
| sugar, sugar | Steady new mechanics, sandbox | Auto-start timing, luck | The child presses Go; no randomness | §3.7 |
| The Incredible Machine | Goal + fixed parts + bin, building on each other, optional score, free-form mode | Unintended solutions | Brute-force uniqueness | §4.2 |

**Common frustrations to design out (all four games):**
1. **Precision dragging.** Use tap-to-snap only.
2. **Near-misses that read as wrong.** Use cell-exact rules, and reject levels that have near-misses.
3. **Luck or timing.** Make everything deterministic, with no timers.
4. **Hidden rules that change.** Each chapter introduces one new piece with a 🎓 puzzle, and the why line names the rule.
5. **Scary failure.** A wrong answer is a "Surprise!", the cat just yawns, and nothing explodes.
6. **Trial and error with no feedback about why.** Step replay / rays / water rules / step count show where and why it failed.

---

## 6. Sources

**Levers and balance scale**
- Filion & Sirois 2021, *Children's (mis)understanding of the balance beam*: https://pmc.ncbi.nlm.nih.gov/articles/PMC8419348 ; https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2021.702524/full
- Li, Xie, Yang & Cao 2017, feedback and operation: https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2017.00534/full
- Schapiro & McClelland 2009: https://stanford.edu/~jlmcc/papers/SchapiroMcC09BalScale.pdf
- Hofman et al. 2015, PLOS ONE: https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0136449
- Latent-class study of Chinese children (2013): https://jps.ecnu.edu.cn/EN/Y2013/V36/I1/86
- French critique of Siegler's model: https://www.researchgate.net/publication/247917186_L'epreuve_de_la_balance_de_Siegler_analyse_critique_du_modele_par_elaboration_de_regles
- Jansen & van der Maas 2002: https://pubmed.ncbi.nlm.nih.gov/11890728/
- Siegler 1976: https://doi.org/10.1016/0010-0285(76)90016-5
- Siegler & Chen 1998: https://doi.org/10.1006/cogp.1998.0686
- Inhelder & Piaget 1958: https://doi.org/10.1037/10034-000
- Summary of Siegler 1976 encoding: https://www.academia.edu/55620037/Understanding_and_solving_probability_problems_A_developmental_study
- Leuchter & Naber 2019: https://www.rlp-forschung.de/public/facilities/144/publications/124860 ; https://doi.org/10.1002/tea.21470
- Victorian curriculum, simple machines: https://www.education.vic.gov.au/school/teachers/teachingresources/discipline/science/continuum/Pages/simpmachines.aspx
- Torque and levers: https://comfsm.fm/~dleeling/physics/torque.html ; https://www.tutorchase.com/answers/gcse/physics/how-do-you-calculate-the-mechanical-advantage-of-a-lever
- Lever classes: https://www.1728.org/machine1.htm ; https://www.aakash.ac.in/important-concepts/physics/types-of-lever
- Balance stability: https://www.physicsforums.com/threads/why-does-a-balance-scale-equal-out.106905/post-882619 ; https://howwhy.nfshost.com/new/book1/equilibrium/balancing.html
- Archimedes: https://en.wikiquote.org/wiki/Archimedes ; https://mathshistory.st-andrews.ac.uk/DSB/Archimedes.pdf ; https://todayinsci.com/A/Archimedes/Archimedes-Quotations.htm
- Tinybop Simple Machines: https://www.commonsensemedia.org/app-reviews/simple-machines-by-tinybop ; https://www.commonsense.org/education/reviews/simple-machines-by-tinybop ; https://www.commonsense.org/education/reviews/simple-machines-by-tinybop/teacher-reviews/4083756 ; https://madisonpubliclibrary.org/node/1088188 ; https://apps.appfollow.io/ios/simple-machines-by-tinybop/936966570?country=us

**Shadows**
- IOP Spark:
  - https://spark.iop.org/many-students-do-not-recognise-light-entity-between-source-and-effect-it-produces
  - https://spark.iop.org/some-students-may-believe-light-can-change-direction-or-travel-curved-path-without-anything
  - https://spark.iop.org/some-students-believe-shadows-are-reflection-object-and-therefore-always-expect-shape-shadow-be
  - https://spark.iop.org/some-students-consider-darkness-important-concept-light-eg-shadows-can-exist-their-own
  - https://spark.iop.org/some-students-use-idea-light-not-travelling-straight-lines-say-sunlight-can-strike-earth-different
  - https://spark.iop.org/sites/default/files/media/documents/BEST_PSL_1_2_Diagnostic_A%20penguin%27s%20shadow.doc
- Guesne 1985, in *Children's Ideas in Science*: https://www.stem.org.uk/node/199859
- Feher & Rice 1988 (citation): https://philpapers.org/s/Elsa%20Feher
- Chen 2009: https://doi.org/10.1080/09500690701633145
- SPACE *Light* report: https://www-legacy.stem.org.uk/resources/elibrary/resource/29216/space-project-research-report-light ; https://vufind.lboro.ac.uk/Record/220803/Description
- Grigorovitch & Alexandropoulou 2025: https://oapub.org/edu/index.php/ejes/article/view/6211
- UNESCO: https://ich.unesco.org/en/RL/wayang-puppet-theatre-00063 ; https://ich.unesco.org/en/RL/karagoz-00180 ; https://ich.unesco.org/en/RL/chinese-shadow-puppetry-00421 ; https://ich.unesco.org/en/decisions/6.COM/13.3
- Penumbra: https://arxiv.org/pdf/1604.00508 ; https://iwant2study.org/lookangejss/journalpaper/08_1019_Bulbul.pdf ; https://www.physicsforums.com/threads/thought-experiment-with-two-point-sources-of-light.591891/post-3842229
- Similar triangles (pinhole): https://nrich.maths.org/8041/solution
- Sun and shadow length: https://www.nsta.org/lesson-plan/me-and-my-shadow ; https://peep-dev.wgbh.org/en/educators/curriculum/center-based-educators/shadows/activity/stand-alone/522/long-and-short-shadows
- Opaque / translucent / transparent: https://www.edplace.com/worksheet_info/science/keystage2/year3/topic/792/2541/letting-the-light-through ; https://www.thenational.academy/teachers/programmes/science-primary-ks2/units/introduction-to-light-and-shadows/lessons/opaque-transparent-and-translucent/downloads
- Shadowmatic reviews: https://www.pocketgamer.com/shadowmatic/review/ ; https://www.appunwrapper.com/2015/01/19/shadowmatic-review-a-gorgeous-but-flawed-puzzler/ ; https://www.macworld.com/article/224913/you-should-play-twist-objects-into-shadow-puppets-with-puzzler-shadowmatic.html ; https://forums.imore.com/threads/review-shadowmatic-by-triada-studio-universal-binary.346550/ ; https://www.trustedreviews.com/shadowmatic-review

**Water**
- Water-level task: https://scispace.com/topics/water-level-task-vile9v85 ; https://c2055.cloudnet.se/en/piaget-water-test.html ; https://pure.psu.edu/en/publications/perceiving-and-representing-horizontals-from-laboratories-to-natu/ ; https://online.stat.psu.edu/stat504/lesson/case-study-water-level-study
- Communicating vessels: https://en.wikipedia.org/wiki/Communicating_vessels ; https://mirjamglessmer.com/?p=945 ; https://mirjamglessmer.com/2014/02/05/letter-tubes-and-hydrostatic-pressure/ ; https://www.physport.org/curricula/UWTutorials/t/tutorial.cfm?G=PRS1st ; https://interactivetextbooks.tudelft.nl/showthephysics/demos/demo38/demo38.html ; https://findel-international.com/product/science/physics/motions-and-forces/philip-harris-liquid-level-apparatus/e8r06791
- Grid water simulators: https://dev.to/timlittle/build-a-water-simulation-in-go-with-raylib-go-4hef ; https://forum.terasology.org/goto/post?id=7177 ; https://www.gamedeveloper.com/programming/how-water-works-in-dwarfcorp ; https://github.com/luciopaiva/water
- Priority-Flood: https://arxiv.org/abs/1511.04463
- Where's My Water?: https://en.wikipedia.org/wiki/Where%27s_My_Water%3F ; https://www.engadget.com/2011/11/07/wheres-my-water-creator-goes-from-qa-to-hit-game-designer-at-di/ ; https://www.pocketgamer.com/wheres-my-water/review/ ; https://www.commonsensemedia.org/app-reviews/wheres-my-water ; https://www.commonsensemedia.org/app-reviews/wheres-my-water-2 ; https://www.gameskinny.com/s9p5j/why-wheres-my-water-was-better-than-angry-birds
- sugar, sugar: https://www.pocketgamer.com/sugar-sugar/bart-bonte-brings-a-taste-of-flash-to-ios-and-android-with-sugar-sugar/ ; https://apps.apple.com/app/id568141784 ; https://toucharcade.com/games/sugar-sugar

**Dominoes and chain-reaction machines**
- Whitehead and Morris: https://www.smithsonianmag.com/smart-news/just-twenty-nine-dominoes-could-knock-down-the-empire-state-building-2232941/ ; https://physicsworld.com/a/how-many-dominoes-will-topple-a-cathedral-tower/ ; https://www.futilitycloset.com/2022/03/02/the-bigger-they-are/ ; https://www.businessinsider.in/science/A-Domino-The-Size-Of-A-Tic-Tac-Could-Topple-A-Building/articleshow/46060571.cms ; https://www.youngstarswiki.org/en/print/pdf/node/1849
- The Incredible Machine: https://www.filfre.net/2018/06/the-incredible-machine/ ; https://en.wikipedia.org/wiki/The_Incredible_Machine_(1993_video_game) ; https://www.indiedb.com/members/kevryan/blogs
- Contraption Maker and Jeff Tunnell: https://spotkin.itch.io/contraption-maker ; https://en.wikipedia.org/wiki/Jeff_Tunnell
- Rube Goldberg trademark: https://www.rubegoldberg.org/licensing ; https://trademark.justia.com/owners/rube-goldberg-inc-709135
- Engineering design process: https://www.itejournal.org/wp-content/pdfs-issues/spring-2014/09difrancescaetal.pdf ; https://nextgenscience.org/node/1116 ; https://digitalcommons.usf.edu/tal_facpub/106
- Unique-solution generation: https://codemia.io/knowledge-hub/path/sudoku_generator_algorithm_closed ; https://docs.rs/sudoku-variants
