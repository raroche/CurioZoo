# Motion games research: Fruit Train and Penguin Slide

Research for two CurioZoo motion games (ages 5–13, EN/ES, plain JS + SVG, tap-only, no timers, one provable whole-number answer per puzzle, no physics engine).

- **Game A, Fruit Train.** A monkey on a moving zoo train drops fruit. The child taps the release spot so the fruit lands in an animal's mouth. A tower mode asks "which lands first?" for heavy vs light fruit.
- **Game B, Penguin Slide.** A side-view ice cliff with ramps and tubes. The child predicts where things exit, whether they clear a hill, and where they land.

Status notes:
- Every fact carries a URL.
- Fall-time numbers marked **[calc]** are my own drag calculation, using the standard NASA drag formula (cited) with stated assumptions.
- A few sources could not be opened (IOP Spark and Physics Classroom returned 403). For those, the claim comes from the search-result text of the page, and the URL is given.
- The web-search budget ran out before "Nachtigall" could be traced. See section 1.6.

---

## 1. Misconception literature

### 1.1 Curvilinear impetus: McCloskey, Caramazza & Green (1980)
- **Citation.** *Science* 210:1139–1141. Students drew the path of balls after the force making them move in a curve was removed. The correct answer was always a straight line. https://cogneuro.psychology.fas.harvard.edu/publications/curvilinear-motion-absence-external-forces-na%C3%AFve-beliefs-about-motion-objects
- **Sample.** 47 US university students: 15 with no physics, 22 with high-school physics, 10 with college physics. Many predicted curved paths, including students who had taken physics. The authors likened this to medieval "impetus" theory, where a moving body carries an internal impetus that slowly fades. https://cogneuro.psychology.fas.harvard.edu/publications/curvilinear-motion-absence-external-forces-na%C3%AFve-beliefs-about-motion-objects ; press account: https://www.csmonitor.com/1980/1217/121733.html
- **Error rate.** On the paper-and-pencil C-shaped tube problem, "about a third" of college students said the ball keeps curving after it leaves the tube (as summarised in Kaiser et al. 1992). https://www.Gwern.net/doc/psychology/cognitive-bias/illusion-of-depth/1992-kaiser.pdf
- **Theory is contested.** Later work argues that judgments are built on the fly from contextual cues, rather than from a consistent impetus theory. https://link.springer.com/article/10.3758/BF03202508
  - Design implication: the game should vary the context (tubes, chutes, ledges, train) so that no single surface cue gives the answer away.

### 1.2 The straight-down belief: McCloskey, Washburn & Felch (1983)
- **Citation.** "Intuitive physics: The straight-down belief and its origin," *J. Exp. Psych.: Learning, Memory & Cognition* 9:636–649. https://www.academia.edu/28201242/Intuitive_Physics ; https://www.yorku.ca/lbianchi/nats1800/lecture16a.html
- **Claim.** People often believe that objects dropped from a moving carrier fall straight down. The authors propose that the belief comes from a **perceptual error**: such objects are often *seen* as falling straight down, because we judge their motion against the carrier (summary in search results for the citations above).
- **Kaiser et al. (1992) on frames of reference.** In static problems, people report the object's motion *relative to the carrier* as if it were its absolute motion. The authors predicted that animation would make the true motion of the object's centre of mass apparent, whichever frame the viewer used. https://www.Gwern.net/doc/psychology/cognitive-bias/illusion-of-depth/1992-kaiser.pdf
- **Design implication: two-view replay.** After a drop, replay it from two views:
  - **Ground view.** The fruit traces an arc and lands ahead of the release spot.
  - **Monkey's view.** The camera rides the train, and the fruit falls straight down below the monkey.

  Both views are true. The fruit stays directly under the train (ignoring air), which is the classic "plane and package" result. https://www.physicsclassroom.com/mmedia/vectors/pap ; https://direct.physicsclassroom.com/mop/Vectors-and-Projectiles/Displacement-and-Time-for-a-Projectile/QG5help
- **History hook.** In 1640 Gassendi dropped stones from the mast of a moving French galley (about 25 m masts). The stones landed at the foot of the mast, which tested Galileo's ideas about inertia. https://arxiv.org/pdf/1008.4239

### 1.3 Children and the moving carrier: Kaiser, Proffitt & McCloskey (1985)
- **Citation.** "The development of beliefs about falling objects," *Perception & Psychophysics* 38(6):533–539. https://uva.theopenscholar.com/dennis-proffitt/publications/development-beliefs-about-falling-objects
- **Tasks.** In one task a ball rolled off a table. In the other, a ball was dropped from a **moving model train** and fell the same distance. Children predicted where each would land.
- **Preschool and kindergarten.** Mostly predicted "straight down" in **both** cases.
- **Older children.** More often knew the *rolling* ball keeps going forward. They were **no better than the younger children** for the ball dropped from the train. https://uva.theopenscholar.com/dennis-proffitt/publications/development-beliefs-about-falling-objects
  - This is almost exactly Fruit Train's scenario, and it shows the moving-carrier case is the harder one, even for school-age children.
- **Path shapes.** Preschoolers expected launched objects to fall straight down or along an "inverted-L" path rather than a parabola. This held both when the object was launched passively from a moving carrier and when it came off an inclined plane, and across launch speeds. This detail comes from a garbled scan, so treat it as approximate. https://uva.theopenscholar.com/dennis-proffitt/publications/development-beliefs-about-falling-objects ; https://www.yorku.ca/lbianchi/nats1800/lecture16a.html

### 1.4 Children and the curved tube: Kaiser, McCloskey & Proffitt (1986)
- **Citation.** "Development of intuitive theories of motion: Curvilinear motion in the absence of external forces," *Developmental Psychology* 22(1):67. doi:10.1037/0012-1649.22.1.67. https://uva.theopenscholar.com/dennis-proffitt/publications/development-intuitive-theories-motion-curvilinear-motion-absence
- **Task.** Ages **4–12** plus college students drew the path of a ball leaving a curved tube. Many predicted curved paths.
- **U-shaped pattern.** Preschoolers and kindergartners did **as well as college students**. **School-age children made more errors.** A second study ruled out response bias and drawing skill as explanations.
- **Authors' reading.** School-age children are building intuitive theories that contain wrong principles, which the authors call "growth errors". https://uva.theopenscholar.com/dennis-proffitt/publications/development-intuitive-theories-motion-curvilinear-motion-absence
  - Implication: CurioZoo's 6–10 band is the **peak-error** band for Penguin Slide's tube question. It is worth teaching directly.

### 1.5 Animation fixes many of these errors: Kaiser, Proffitt, Whelan & Hecht (1992)
- **Citation.** "Influence of animation on dynamical judgments," *JEP: Human Perception & Performance* 18(3):669. https://uva.theopenscholar.com/dennis-proffitt/publications/influence-animation-dynamical-judgments
- **Main result.** People who chose a curved exit path in a *static* forced-choice C-tube task **rejected it and chose the straight path when shown animations** (reporting Kaiser, Proffitt & Anderson 1985).
- **Why animation helps.** It (a) shows the ball's actual motion state, and (b) separates in time the "inside the tube" phase from the "free ball" phase. Errors happen when people treat the freed ball as still part of the tube system. https://www.Gwern.net/doc/psychology/cognitive-bias/illusion-of-depth/1992-kaiser.pdf
- **Related finding.** People who make idiosyncratic errors when *drawing* trajectories predict accurately when they *catch* or *intercept*. Physical intuitions differ between tasks. https://www.mit.edu/~k2smith/publication/diff_phys_intuitions ; https://www.mit.edu/~k2smith/pdf/SmithDechterTenenbaumVul-CogSci-2013.pdf
- **Design implications.**
  - A "tap the landing spot" prediction is closer to an interception task and may be easier than "pick the drawn path". Use both: picking the path catches the misconception, and tapping the spot gives success.
  - Always play the **animated outcome** after a prediction, then leave the strobe trail behind (section 2).

### 1.6 Hood's tube task: the "gravity bias" in toddlers
- **Citation.** Hood, B. M. (1995). "Gravity rules for 2- to 4-year olds?" *Cognitive Development* 10(4):577–598. doi:10.1016/0885-2014(95)90027-6. https://sites.brown.edu/cocodevlab/files/2023/03/Hoods-Gravity-Rules.pdf ; https://ibl.kb.nl/articles/0000000010833/10/4
- **Task.** A ball is dropped into an opaque bent tube that leads to a different cup. Children of about 2 to 4.5 years search **directly below the drop point**, not where the tube leads. They keep doing this across trials, even after seeing the real outcome.
- **Persistence.** Children under about 4 do not overcome the bias even with extensive training.
- **Specific to falling.** The error is gravity-specific: there are fewer errors when the object moves upward or the apparatus is horizontal. https://artsci.uc.edu/content/dam/refresh/artsandsciences-62/labs/ccrl/docs/publications/Haddad_et_al._2008_accessible.pdf ; https://caplab.yale.edu/sites/default/files/files/1999-Hoodetal.pdf ; https://www.bps.org.uk/research-digest/how-childrens-understanding-gravity-changes-they-grow-older
- **Relevance.** This is the developmental root of "straight down". By CurioZoo's age 5 the toddler form is mostly gone, but the straight-down default re-appears in the train case (1.3).

### 1.7 "Heavier falls faster"
- **IOP Spark, "Bigger and faster" activity (ages 5–11).**
  - Children predict whether a ~200 g or a ~800 g wooden block lands first from a few metres, giving reasons first.
  - IOP suggests a **melon and a peach** dropped from a second-floor window as memorable proof that mass makes no difference to the rate of fall.
  - Safety note: falling and bouncing masses can hurt.
  - Source: https://spark.iop.org/bigger-and-faster (403 to the fetcher; content taken from the search-result summary).
- **IOP misconception page.** "Many students think a heavier object will fall faster than a lighter one of the same general shape or size." https://spark.iop.org/many-students-think-heavier-object-will-fall-faster-lighter-one-same-general-shape-or-size
  - Teacher explanation: the heavier object is pulled harder but also needs more force to speed up, so the force-to-mass ratio is the same, provided air resistance can be ignored. https://spark.iop.org/do-heavier-things-fall-faster
- **IOP companion misconception.** Students think a compact object falls at a **constant speed that depends on how heavy it is**. https://spark.iop.org/many-students-think-compact-object-such-ball-or-stone-falls-constant-speed-which-depends-how-heavy
  - This supports Fruit Train's "falling things speed up" teaching.
- **Adults hold it too.** Vicovaro (2014) reports a strong mass–speed belief: most people without formal physics believe heavier objects fall faster. He also cites Sequeira & Leite (1991): 52% of fourth-year university physics students reasoned this way. https://www.uv.es/psicologica/articulos3.14/05VICOVARO.pdf
- **Large survey.** A 953-participant study (2023) of which object pair lands first, in air vs vacuum, found the ideas persist across schooling, and that teachers sometimes spread them. https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10249391/
- **Developmental pattern.** Children aged about 7–9 shift from "things fall because they're not held up" to "things fall because they're heavy". https://istardb.org/aerpublications/learning-about-gravity-i-free-fall-a-guide-for-teachers-and-curriculum-developers/
- **The "Springer 2012" study of 144 children aged 5–11.** This is **Hast & Howe**, published by Springer.
  - **JSET paper, speed change.** "The development of children's understanding of speed change: A contributing factor towards commonsense theories of motion," *J. Science Education and Technology* 22(3), online 2012, issue dated 2013. doi:10.1007/s10956-012-9397-5. https://link.springer.com/article/10.1007/s10956-012-9397-5
    - Children (n=144, 5–11) predicted whether a heavy or light ball speeds up, slows down or keeps a steady speed along a horizontal, in a fall, and down an incline. They did this with real objects (Study 1) and on a computer (Study 2).
    - Children mostly expected change only from rest to moving, **not between two later points**. Predictions of continued speed-up "barely exceeded chance" even in the oldest group. Mass effects were modest.
  - **Same sample, HAL paper.** Children linked **faster fall with the heavy ball**, but faster horizontal motion with the light ball, at all ages. https://hal.archives-ouvertes.fr/hal-00722840
  - **Related papers.** https://research.stmarys.ac.uk/id/eprint/2674 ; https://research.stmarys.ac.uk/id/eprint/223/8/Hast-Howe-Understanding-the-Beliefs-Informing-Childrens-Commonsense-Theories.pdf
  - Implication: "falling things speed up" is *not* known by age 11, so it deserves its own puzzles.
- **Nachtigall: not found.** No study by Nachtigall on children and falling objects turned up in two searches (English and German). The search budget ran out before a third attempt. **Do not cite Nachtigall until a full reference is located.**
- **Intervention evidence.** In a study of forty 5-year-olds, adding an explanation about gravity to guided play improved their explanations immediately, and the gains held after one week. https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10249391/ (via search summary; the original study was not opened).

### 1.8 Air resistance: which fruit can honestly "land together"
**Physics basis.**
- Drag is D = ½·Cd·ρ·v²·A.
- Terminal speed is v_t = √(2W / (Cd·ρ·A)). A bigger area or a smaller weight gives a lower terminal speed.
- Source: https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/termvel ; https://www.grc.nasa.gov/WWW/K-12/VirtualAero/BottleRocket/airplane/termv.html

**[calc] Simulation setup.** Spheres with Cd 0.47 and air density 1.2 kg/m³. Assumed masses and diameters:

| Object | Mass | Diameter |
|---|---|---|
| Grape | 6 g | 2 cm |
| Apple | 200 g | 8 cm |
| Watermelon | 5 kg | 22 cm |
| Ping-pong ball | 2.7 g | 4 cm |

The script is reproducible on request.

**Results: how far each object is behind the watermelon at the moment the watermelon lands.**

| Drop height | No-air fall time | Grape behind | Apple behind | Ping-pong ball behind |
|---|---|---|---|---|
| 2 m | 0.64 s | 1.7 cm | 0.6 cm | 15 cm |
| 3 m | 0.78 s | 3.7 cm | 1.5 cm | 32 cm |
| 4.5 m | 0.96 s | 8 cm | 3 cm | 67 cm |
| 9 m | 1.35 s | 32 cm | 13 cm | 2.2 m |
| 16 m | 1.81 s | 96 cm | 40 cm | 5.5 m |

- Terminal speeds: grape ≈ 26 m/s, apple ≈ 37 m/s, watermelon ≈ 68 m/s. All are far above the 6–10 m/s reached in a few metres, so drag is small.
- For comparison, UCSD's watermelon-drop lore puts a watermelon's terminal speed at about 112 mph (~50 m/s). https://extendedstudies.ucsd.edu/news-events/extended-studies-blog/50th-annual-watermelon-drop-a-splatter-not-far-enough

**Safe claim.** "Dropped from a tree or a two-storey window (up to about 4–5 m), a watermelon, apple, orange, plum and even a grape land **together**. The gap is a few centimetres at most, which is too small to see."
- This matches IOP's own melon/peach suggestion. https://spark.iop.org/bigger-and-faster
- **Keep the game's tower at or under about 5 m of real scale.** See the scale choice in section 2.2: 9 cells × 0.5 m = 4.5 m.

**Avoid as "same time" pairs:**
- **Feathers, leaves, flat paper, popcorn, ping-pong balls, dandelion seeds, balloons.** They are light for their size, so air pushes on them noticeably.
- **Cut, flat fruit slices.** Same reason.
- **Big drops.** Above about 10 m even a grape falls visibly behind.

**Honest caveat line, for the child.** "Light, wide things like feathers, leaves and paper float down slowly because air pushes on them. With no air, like on the Moon, a hammer and a feather land together!"
- **Apollo 15 (2 Aug 1971).** David Scott dropped a ~1.32 kg hammer and a falcon feather from ~1.6 m on the Moon. They landed together. https://nssdc.gsfc.nasa.gov/planetary/lunar/apollo_15_feather_drop.html
- **Vacuum chamber on Earth.** In NASA's Space Power Facility vacuum chamber, a bowling ball and feathers fell together (BBC/Brian Cox). https://www.discovermagazine.com/watch-a-feather-and-bowling-ball-fall-at-the-same-speed-1199 ; https://abc11.com/382792
- **Paper demo, possible bonus card.** A flat sheet falls slowly, but **crumpled into a ball** it falls almost with a book or ball, so shape is what matters, not weight. https://physicslabs.colorado.edu/demos/mechanics/motion-in-one-dimension/uniform-acceleration/book-and-paper/ ; https://physics.uci.edu/~demos/entries/1C20.16.html ; https://askaboutireland.ie/learning-zone/primary-students/5th-+-6th-class/science/gravity/some-ideas-about-gravity/same-weight-but-different

---

## 2. Discretising motion honestly on a grid

### 2.1 The odd-number rule (Galileo)
- In equal time steps, a body falling from rest covers distances in the ratio **1 : 3 : 5 : 7 …**. The totals are **1, 4, 9, 16 …** (squares of elapsed time). https://catalogue.museogalileo.it/indepth/GalileosLawFallingBodies.html ; https://sites.pitt.edu/%7Ejdnorton/papers/Galileo_fall_induction.pdf
- Galileo measured this with balls on grooved inclines, because free fall was too fast to time. https://catalogue.museogalileo.it/indepth/GalileosLawFallingBodies.html
- This is exact physics for constant acceleration (s = ½gt²), not an approximation. It is therefore a whole-number rule that is **literally true at tick boundaries**.

### 2.2 Recommended unit system (all integers)
- **Units.** 1 cell, 1 tick. Choose the tick so a dropped object falls exactly 1 cell in the first tick: ½·g·τ² = 1 cell, so **g = 2 cells/tick²**.
- **Real-world scale.** If 1 cell = 0.5 m, then τ = 0.32 s. If 1 cell = 1 m, then τ = 0.45 s. (τ = √(2·cell/9.81) [calc].)
  - With 0.5 m cells, a 9-row tower is 4.5 m, inside the "fruit land together" zone of 1.8.
  - A train at 1 cell/tick moves at about 1.6 m/s, which is walking pace and plausible for a zoo train.
- **Dropped from rest (tower).** After t ticks the fruit has fallen y = t² cells. Each tick's step is 2t − 1 cells: 1, 3, 5, 7.
- **Dropped from a train at v cells/tick.** The fruit keeps the train's speed horizontally (inertia; ignoring air):
  - x = v·t
  - y = t²

  | tick t | 0 | 1 | 2 | 3 | 4 |
  |---|---|---|---|---|---|
  | fall this tick | – | 1 | 3 | 5 | 7 |
  | total fallen (rows) | 0 | 1 | 4 | 9 | 16 |
  | forward (v=1) | 0 | 1 | 2 | 3 | 4 |
  | forward (v=2) | 0 | 2 | 4 | 6 | 8 |

- **Keeping landings on whole cells.** Make every drop height H (from fruit to mouth) a **perfect square**: 1, 4, 9 or 16 rows. The fruit then arrives exactly at a tick boundary, after n = √H ticks.
  - **Landing offset = v·n cells ahead of the release column.** The release spot is the unique cell v·√H **before** the animal.
  - This rule is exact for any integer v.
  - The fruit stays directly beneath the monkey (the train has also moved v·n), which is the "plane and package" result. https://www.physicsclassroom.com/mmedia/vectors/pap
- **Verification hook for the level checker.** For each level, assert:
  - H ∈ {1, 4, 9, 16}
  - mouthCol − releaseCol = v·√H
  - no other train cell yields a landing in the mouth cell

  Uniqueness follows because the landing column is a strictly increasing function of the release column.
- **Optional rendering.** Draw the smooth parabola between ticks for beauty, but put **dots only at ticks**, because only tick positions are claimed as exact.

### 2.3 How physics sims show strobe or ghost trails
- **PhET "Projectile Motion" (HTML5).**
  - The trajectory carries **black dots every 0.1 s** and a **green dot at the apex**. A tracer tool reads time, range and height at any dot.
  - The teacher guide's sample prompt: "Explain why the black dots on the projectile's path are closer together near the top, but further apart when close to the ground."
  - Mass and diameter matter only when air resistance is on. The prompt "which factors affect the range when air resistance is turned on, but have no effect when it is off" is itself a heavy-vs-light lesson.
  - Screens: Intro, Vectors, Drag, Lab. A Spanish locale is available.
  - Source: https://phet.colorado.edu/files/teachers-guide/projectile-motion-html-guide_en.pdf
- **Physics Classroom dot (ticker-tape / "oil drop") diagrams.** A dot marks position at equal time intervals:
  - even spacing means constant speed
  - widening spacing means speeding up
  - narrowing spacing means slowing down

  Source: https://www.physicsclassroom.com/getattachment/Physics-Video-Tutorial/Kinematics/Motion-Diagrams/Lecture-Notes/MotionDiagrams2.pdf?lang=en-US ; https://www.albert.io/blog/?p=87694
- **IOP Spark multiflash photography.** Images at regular intervals on one frame, made with a camera multiflash mode, video frame-stepping, or a disc stroboscope.
  - Safety note for real strobes: avoid 15–20 Hz flashing and red flicker (photosensitive epilepsy). A static ghost trail in SVG avoids this entirely.
  - Source: https://spark.iop.org/multiflash-photography
- **Strobe from video.** Teachers make strobe pictures from video (Tracker, ImageJ). One paper reports that such photos help students grasp the qualitative character of motion. https://arxiv.org/pdf/1901.05058 ; https://dialnet.unirioja.es/descarga/articulo/5166041.pdf
- **Preschool level.** PBS PEEP's ramps unit has a preschool "Airborne!" activity: build a ramp that launches a ball to land in a cup. Children predict, test and compare. https://peep-dev.wgbh.org/en/educators/curriculum/family-child-care-educators/ramps/activity/guided-activity/284/airborne
- **Evidence gap (honest).** I found **no study testing whether multiflash or strobe diagrams help 5–10-year-olds specifically**. Classroom use is mostly ages 13+, e.g. a Dutch lesson for 13–14-year-olds. https://www.lessonup.com/en/lesson/s3PWikbqSyXCmD8eE
  - The strongest relevant evidence is the *animation* advantage (Kaiser et al. 1992, section 1.5).
  - **Recommendation:** play the animation first. Then **freeze ghost frames at each tick**, faint fruit or penguin copies, as a record the child can count. Gaps that grow 1, 3, 5 rows make "speeding up" countable for a 6-year-old.
- **Predict-Observe-Explain (White & Gunstone 1992).** Predict and say why, watch, then reconcile.
  - The best results come from demonstrations that are clear, immediate and have a single aspect to observe.
  - Evidence with young children is modest: in one study of ideas about air, 36% changed their wrong idea after contradictory outcomes.
  - Sources: https://interactivetextbooks.tudelft.nl/showthephysics/Pedagogy/PoE.html ; https://arbs.nzcer.org.nz/node/7187
  - This matches CurioZoo's tap → reveal → why loop.
- **Commercial precedent.** Angry Birds Journey shows the aim as a **dotted line** before release. https://www.commonsensemedia.org/app-reviews/angry-birds-journey
  - CurioZoo should **not** show a preview of the answer before the tap. Show ghost dots only after the reveal, or as a hint level.

---

## 3. Game-design references (names are trademarks; do not reuse)

| Reference | Mechanic | What engages young kids | Source |
|---|---|---|---|
| **Canyon Bomber** (Atari arcade, 1977; 2600 port) | The craft flies itself; the only input is *when* to press drop | One-button timing; harder targets score more; strong in two-player | https://strategywiki.org/wiki/Canyon_Bomber ; https://www.arcade-history.com/game/377/ |
| **Cut the Rope** (Common Sense: 7+; kid reviewers say 5+) | Cut ropes so candy swings and falls into a monster's mouth | **Feeding a cute character**; optional bonus stars (casual players just feed him); new gadgets introduced gradually; often more than one solution, which encourages experimenting. Common Sense Education calls the physics "superficial" and flags ads and purchases | https://www.commonsensemedia.org/app-reviews/cut-the-rope ; https://www.commonsense.org/education/reviews/cut-the-rope |
| **Where's My Water?** (6+) | Dig channels so water flows to an alligator's bath | Character story; gravity plus logic and planning; collectibles. The **sequel was rated 10+ mainly because of an energy timer**, which matches CurioZoo's no-timer rule | https://www.commonsensemedia.org/app-reviews/wheres-my-water ; https://www.commonsensemedia.org/app-reviews/wheres-my-water-2 |
| **Paper Toss** (2009) | Flick paper into a bin with a fan or wind | One gesture plus one visible variable (wind); short rounds. Reviewers found it "pointless but fun" and quickly boring, so it needs progression | https://toucharcade.com/games/paper-toss ; https://www.iculture.nl/apps/paper-toss-world-edition-wereldwijd-propjes-gooien/ |
| **ThinkFun Gravity Maze** (8+) | 60 challenge cards place some towers; the player adds the rest so the marble reaches the target | **Exactly one working design per challenge**; graded beginner to expert; awards include Parents' Choice Gold and TOTY Specialty. Critiques: hard top levels for young kids; replay ends when cards run out | https://legacy.thinkfun.com/products/gravity-maze/ ; https://legacy.thinkfun.com/press/toty-finalists-2015/ ; https://onlypassionatecuriosity.com/gravity-maze-logic-game-kids-review/ |
| **Ravensburger GraviTrax** (8+) | Open-ended marble-run building with jumps, cannon, trampoline add-ons | Open building; 2019 TOTY finalist (retailer claim); "experience the power of gravity". Learning curve; small marbles | https://ravensburger-en.mindtouch.us/Product_Information/Ravensburger/GraviTrax/GraviTrax_General ; https://www.shopsavvy.com/answers/what-age-is-the-ravensburger-gravitrax-starter-set-recommended-for |
| **Ramps & Pathways** (DeVries & Sales, NAEYC) | Constructivist ramp play for preschool to primary | Children reason deeply about force and motion when *they* set up ramps; 10 teaching principles | https://www.naeyc.org/resources/pubs/books/ramps-pathways-constructivist-approach-physics-young-children ; https://scholarworks.uni.edu/facbook/197 |
| **PBS PEEP ramps "Airborne!"** | Ramp launches a ball to land in a cup | Prediction vocabulary (predict, test, compare); works offline in the family app | https://peep-dev.wgbh.org/en/educators/curriculum/family-child-care-educators/ramps/activity/guided-activity/284/airborne ; https://peep-dev.wgbh.org/en/educators/peep-family-science/ramps |

**Takeaways for CurioZoo.**
1. Use a **hungry animal as the target**: the feed-the-character loop from Cut the Rope.
2. Keep **one input**, a tap on a release spot or a piece slot. Canyon Bomber turns this into a *timing* skill. CurioZoo should make it a *where* choice on a frozen board (tap a cell, then press Go), with no timers.
3. **Gravity Maze-style unique solutions** fit the "one provable answer" rule. Show a card-like level with pre-placed pieces and 1–2 slots.
4. Make failure funny and informative: the fruit bonks the animal's nose, and the ghost trail shows how far off it was.
5. Add one new piece or idea every 2–3 levels, the Cut the Rope pacing.
6. Avoid monetisation, energy timers and ads, which are the main criticisms in every Common Sense review above.

---

## 4. Penguin Slide: honest grid rules and piece set

### 4.1 Physics facts the rules rest on
- **Down a slope, speed grows.** Up a slope, it falls. On flat, frictionless ground, speed is kept (Galileo's inclined planes, leading to inertia). https://www.tau.ac.il/education/muse/museum/galileo/the_law_of_inertia.html
- **Height rule.**
  - Galileo's ball on a curved track, and his "interrupted pendulum", **rise back to the starting height and no higher**. The pendulum still does this when a peg changes its path.
  - Friction makes a real ball come back slightly lower.
  - Sources: https://spark.iop.org/galileos-pendulum ; https://demonstrations.wolfram.com/InterruptedPendulum/ ; https://lecdem.physics.umd.edu/g/g1/g1-20.html
  - PhET Energy Skate Park: without friction the skater returns to the start height. With friction, some energy becomes thermal energy and she cannot get back up. https://clixplatform.tiss.edu/phet/en/simulation/energy-skate-park-basics.html ; https://clixplatform.tiss.edu/phet/files/activities/3990/phet-contribution-3990-7215.pdf
- **Speed after a drop depends only on the height dropped, not the slope shape or the mass.** For a rolling solid sphere, v = √(10gh/7). For a frictionless slider, v = √(2gh). Mass and radius cancel. https://www.miniphysics.com/uy1-sphere-on-an-incline.html
  - **Design consequence:** make the moving object a **sliding** penguin, ice block or sled, not a rolling marble. Then v = √(2gh) holds exactly, and the integer rules below are honest.
  - A rolling ball would land about 15% shorter, since √(5/7) ≈ 0.85 [calc].
- **Leaving a curved tube.**
  - The velocity is along the **tangent** at the exit point. With no net force the object moves in a straight line (Newton's 1st law). Nothing flings it outward. https://www.albert.io/blog/newtons-first-law-ap-physics-1-review/
  - **Side-view nuance:** gravity still acts, so the exit path is **a parabola that starts along the tangent**. It is "straight" only on flat ice (top view or horizontal floor).
  - The misconception to target is "keeps curving the way the tube curved". https://uva.theopenscholar.com/dennis-proffitt/publications/development-intuitive-theories-motion-curvilinear-motion-absence
- **Leaving a ledge.** Horizontal speed stays the same and vertical fall follows 1, 3, 5, 7, so the path is a parabola. https://direct.physicsclassroom.com/mop/Vectors-and-Projectiles/Displacement-and-Time-for-a-Projectile/QG5help
- **Loops are not just a height question.** A frictionless slider needs a start height of at least **2.5 × the loop radius**. Below that it falls off partway up, even if it started above the loop top. https://www.isu.edu/physics/outreach/physics-class-demos/mechanics/loop-the-loop/ ; https://www.physics.usyd.edu.au/~helenj/Mechanics/Problems/L11-loop-the-loop.pdf
  - **Exclude loops**, or the height rule becomes dishonest.

### 4.2 Integer rule set
Units are the same as section 2.2: g = 2 cells/tick², and position at tick t is (x₀ + vₓt, y₀ − v_y·t − t²) with "up" positive. Fall from rest is 1, 4, 9.

| Rule | Statement | Whole-number form | Honest because |
|---|---|---|---|
| R1 Energy | Speed depends only on how far below the start the slider is | Drop Δh rows means speed **v = 2√Δh cells/tick**. Use Δh ∈ {1, 4, 9}, giving v = 2, 4, 6 | v² = 2gΔh with g = 2 |
| R2 Height | A slider can never get higher than where it started; on real ice it gets slightly less high | Clears a hill or rim only if its top is **at least 1 row lower** than the start. Equal height means "No" | Galileo / Energy Skate Park; friction margin |
| R3 Flat ice | On level ice it keeps its speed and direction | v unchanged | Inertia, low friction |
| R4 Tube exit | Leaves a tube heading along the tube's last direction | Exit directions: → or ← (horizontal), ↓, or ↗ (45°) only | Tangent rule |
| R5 Ledge / horizontal launch | Off a ledge or a horizontal tube end at speed v | x = v·t, y = t². It lands after n = √H ticks, at **x = v·√H = 2√(Δh·H)** cells. Make Δh·H a perfect square. Examples (Δh, H): (1,1)→2, (1,4)→4, (4,1)→4, (1,9)→6, (2,2)→4, (4,4)→8, (2,8)→8 | Exact projectile kinematics at tick boundaries |
| R6 45° launch (advanced, ages 9+) | A ↗ exit gives equal horizontal and vertical speeds a = v/√2 | Δh = a²/2: a = 2 needs Δh = 2; a = 4 needs Δh = 8. Path: x = a·t, height = a·t − t². It returns to launch height at t = a, peaks at a²/4 (below the start, so R2 holds) | Exact kinematics; energy-consistent |
| R7 Half pipe | Slides down, up the other side to *almost* the start height, back again, and settles at the bottom | Ask only "Will it get out over the rim?" (yes only if the rim is ≥1 row lower than the start, and it then flies off per R4/R5) | R2 |
| R8 Bumper / wall | A springy wall sends it back the way it came | Reverses direction. Puzzles ask about **direction only**, never exact post-bounce speed | Real bumpers lose some energy, so do not claim the speed is kept |
| R9 Snowbank | A soft bank stops it | v = 0 | Inelastic stop |
| R10 Pool | The goal | The slider must land in the pool's columns | — |

**Rendering honesty.**
- On ramps and tubes, animate with smooth easing. Puzzles only ask about *outcomes*: exit direction, clear or not, landing column. The engine never needs ramp timing.
- Put tick dots only on free-flight segments, where they are exact.
- Avoid sharp convex crests at high speed. A fast slider would leave the surface when v² > g·R (R = crest radius). Either cap crest radius at R ≥ v²/g = 2Δh cells, or **make hills covered snow tunnels** so the slider stays on the track. https://www.isu.edu/physics/outreach/physics-class-demos/mechanics/loop-the-loop/

### 4.3 Suggested piece set (6 + goal)
1. **Straight ramp**, 1:1 or 2:1. Speeds up going down. Its exit direction is the ramp direction.
2. **Quarter tube.** Turns a vertical drop into a horizontal exit, or the reverse. This is the "where does it go next?" piece.
3. **Half pipe.** The height-rule piece (R7).
4. **Ledge**, a flat end over a gap. The parabola piece (R5).
5. **Hill or snow tunnel.** The "can it make it over?" piece (R2).
6. **Bumper wall / snowbank.** Direction control (R8, R9).
7. **Pool goal.** Optional **ski jump** (45° tube end, R6) for the older band.

**Do not include:** loops, springs or boosters that add energy (they break R2), fans, or moving platforms.

---

## 5. Kid-friendly "why" sentences (six-year-old level)

Spanish drafts are included and **need native review** before shipping, per CurioZoo's Spanish policy.

| Idea | English | Spanish draft |
|---|---|---|
| Inertia (dropped from something moving) | "The fruit was already zooming along with the train, so it keeps zooming forward while it falls." | "La fruta ya iba rápido con el tren, así que sigue hacia adelante mientras cae." |
| Heavy and light fall together | "Gravity pulls big things harder, but big things are harder to get moving, so big and small fruit fall side by side." | "La gravedad jala más fuerte las cosas grandes, pero también cuesta más moverlas, así que la fruta grande y la pequeña caen juntas." |
| Air caveat | "Feathers and leaves are different: air pushes on them and they float down slowly. On the Moon, with no air, a feather falls as fast as a hammer!" | "Las plumas y las hojas son distintas: el aire las empuja y bajan despacio. ¡En la Luna, sin aire, una pluma cae tan rápido como un martillo!" |
| Falling things speed up | "Gravity keeps pulling the whole way down, so a falling thing goes faster and faster: look, the gaps get bigger!" | "La gravedad sigue jalando todo el camino, así que lo que cae va cada vez más rápido: ¡mira, los espacios crecen!" |
| Leaving a curved tube | "The tube was what made it turn. Once it's out, nothing turns it any more, so it goes straight the way it was pointing." | "El tubo era lo que la hacía girar. Al salir, ya nada la gira, así que sigue derecho hacia donde apuntaba." |
| Off a ledge (curved path) | "It keeps going forward, and gravity pulls it down at the same time, so its path bends down like a rainbow." | "Sigue hacia adelante y la gravedad la jala hacia abajo al mismo tiempo, así que su camino se dobla como un arcoíris." |
| Can't roll higher than the start | "A slider only has as much 'go' as the height it started from, and the ice steals a little, so it can never climb higher than where it began." | "Un deslizador solo tiene tanto impulso como la altura de donde empezó, y el hielo le quita un poquito, así que nunca sube más alto que donde comenzó." |

---

## 6. Hand-made teaching puzzles (ordered to build the idea)

### 6A. Fruit Train (v = train speed in cells per tick; H = drop height in rows, a perfect square)
1. **Stopped train** (v=0, H=4). Tap the release spot over a giraffe. Answer: directly above. This sets the baseline that "stopped means straight down".
2. **First surprise** (v=1, H=1). Three candidate spots. Answer: **1 cell before** the animal. On the reveal, the fruit lands ahead of the tapped spot, with a ghost trail.
3. **Monkey's-eye replay** (same level, no new answer). Ask: "When the fruit lands, where is the monkey?" Answer: right above it. This shows the fruit stays under the train (1.2).
4. **Faster train** (v=2, H=1). Answer: 2 before. Faster train, release earlier.
5. **Taller drop** (v=1, H=4). Answer: 2 before. A longer fall gives more time to move forward.
6. **Reverse question** (v=1, H=9; the release spot is given). "Tap where it lands." Answer: 3 ahead. This tests the idea without the target as a cue.
7. **Tower: which lands first?** Watermelon vs grape from a 9-row (4.5 m) tower. Choices: watermelon / grape / **together**. Reveal the twin ghost trails side by side, matching 1, 4, 9.
8. **Count the gaps** (tower, H=16). "In which tick did the apple fall the farthest?" Answer: the last one (7 rows). This targets "falls at constant speed" (1.7).
9. **Two animals** (v=2, H=4 for the near animal and H=9 for a monkey in a tree). Two releases, answers 4 before and 6 before. This combines both variables.
10. **Bonus caveat card** (no scoring). A leaf vs an apple from the tree. The leaf drifts, and the "air pushes wide, light things" line plays. This keeps the fruit claims honest.

### 6B. Penguin Slide (sliding penguin; rules R1–R10)
1. **Speed-up ramp.** Three strobe strips for a penguin sliding down a ramp: even gaps, growing gaps, shrinking gaps. "Which is right?" Answer: growing.
2. **Half pipe height.** The penguin starts at row 4 of a half pipe. "How high does it get on the other side?" Choices: higher / **a little lower** / much lower. This introduces R2.
3. **Over the hill?** Start at row 5. Three snow tunnels with tops at rows 3, 5 and 6. "Tap every hill it can get over." Answer: only the row-3 hill. The equal-height hill is a "No", and the friction margin is explained.
4. **Leaving the quarter tube.** A tube curves from straight down to horizontal on flat ice. Three drawn paths: keeps curving up / **straight along the ice** / curves back. This targets the McCloskey/Kaiser misconception.
5. **Tube to ledge.** Same tube, but it ends at a cliff edge. Paths: keeps curving the tube's way / straight out forever / **starts flat, then bends down like a rainbow**. Reveal with tick dots 1, 3, 5.
6. **Where does it splash?** Δh=1 (v=2) and ledge H=4. Tap the landing column. Answer: **4 cells out**. The pool is placed there and decoys at 2 and 8.
7. **Pick the start.** The pool is 8 cells out, below a ledge with H=4. "Which start shelf, 1 or 4 rows above the ledge?" Answer: **4** (2√(4·4) = 8).
8. **Place one piece.** A slot needs a bumper or a ramp to turn the penguin back toward a lower ledge whose pool is 4 out. A single valid placement, Gravity-Maze style.
9. **Ski jump (ages 9+).** A 45° tube end with Δh=2 gives a=2. "How high does it fly?" Answer: **1 row above the launch** (peak at t=1: height 2·1 − 1² = 1 = a²/4, at x=2), still 1 row below the start, so R2 holds. It returns to launch height at t=2, **4 cells out** (x = a·t). Keep a even so the peak falls on a tick.
10. **Capstone chain.** Start at row 9: down a ramp, over a row-5 tunnel (clears, by R2), into a quarter tube, off a horizontal ledge (Δh measured from the start to the ledge), into the pool. The child places 1–2 pieces, and there is one solution.

---

## Sources
- McCloskey, Caramazza & Green 1980: https://cogneuro.psychology.fas.harvard.edu/publications/curvilinear-motion-absence-external-forces-na%C3%AFve-beliefs-about-motion-objects ; https://www.csmonitor.com/1980/1217/121733.html
- Impetus critique: https://link.springer.com/article/10.3758/BF03202508
- McCloskey, Washburn & Felch 1983 (citation and summaries): https://www.academia.edu/28201242/Intuitive_Physics ; https://www.yorku.ca/lbianchi/nats1800/lecture16a.html
- Kaiser, Proffitt & McCloskey 1985: https://uva.theopenscholar.com/dennis-proffitt/publications/development-beliefs-about-falling-objects
- Kaiser, McCloskey & Proffitt 1986: https://uva.theopenscholar.com/dennis-proffitt/publications/development-intuitive-theories-motion-curvilinear-motion-absence
- Kaiser, Proffitt, Whelan & Hecht 1992: https://uva.theopenscholar.com/dennis-proffitt/publications/influence-animation-dynamical-judgments ; https://www.Gwern.net/doc/psychology/cognitive-bias/illusion-of-depth/1992-kaiser.pdf
- Smith, Battaglia & Vul: https://www.mit.edu/~k2smith/publication/diff_phys_intuitions ; https://www.mit.edu/~k2smith/pdf/SmithDechterTenenbaumVul-CogSci-2013.pdf
- Hood 1995 and the gravity bias: https://sites.brown.edu/cocodevlab/files/2023/03/Hoods-Gravity-Rules.pdf ; https://ibl.kb.nl/articles/0000000010833/10/4 ; https://caplab.yale.edu/sites/default/files/files/1999-Hoodetal.pdf ; https://artsci.uc.edu/content/dam/refresh/artsandsciences-62/labs/ccrl/docs/publications/Haddad_et_al._2008_accessible.pdf ; https://www.bps.org.uk/research-digest/how-childrens-understanding-gravity-changes-they-grow-older
- IOP Spark: https://spark.iop.org/bigger-and-faster ; https://spark.iop.org/many-students-think-heavier-object-will-fall-faster-lighter-one-same-general-shape-or-size ; https://spark.iop.org/do-heavier-things-fall-faster ; https://spark.iop.org/many-students-think-compact-object-such-ball-or-stone-falls-constant-speed-which-depends-how-heavy ; https://spark.iop.org/many-students-think-object-moving-along-curved-path-will-continue-follow-curved-path-when-its ; https://spark.iop.org/multiflash-photography ; https://spark.iop.org/galileos-pendulum
- Hast & Howe (the "Springer 2012" study): https://link.springer.com/article/10.1007/s10956-012-9397-5 ; https://hal.archives-ouvertes.fr/hal-00722840 ; https://research.stmarys.ac.uk/id/eprint/2674 ; https://research.stmarys.ac.uk/id/eprint/223/8/Hast-Howe-Understanding-the-Beliefs-Informing-Childrens-Commonsense-Theories.pdf
- Vicovaro 2014: https://www.uv.es/psicologica/articulos3.14/05VICOVARO.pdf
- Falling-bodies survey (2023): https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10249391/
- Gravity teaching guide: https://istardb.org/aerpublications/learning-about-gravity-i-free-fall-a-guide-for-teachers-and-curriculum-developers/
- NASA drag and terminal velocity: https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/termvel ; https://www.grc.nasa.gov/WWW/K-12/VirtualAero/BottleRocket/airplane/termv.html
- UCSD watermelon drop: https://extendedstudies.ucsd.edu/news-events/extended-studies-blog/50th-annual-watermelon-drop-a-splatter-not-far-enough
- Apollo 15 hammer–feather drop: https://nssdc.gsfc.nasa.gov/planetary/lunar/apollo_15_feather_drop.html
- Vacuum-chamber drop: https://www.discovermagazine.com/watch-a-feather-and-bowling-ball-fall-at-the-same-speed-1199 ; https://abc11.com/382792
- Paper demos: https://physicslabs.colorado.edu/demos/mechanics/motion-in-one-dimension/uniform-acceleration/book-and-paper/ ; https://physics.uci.edu/~demos/entries/1C20.16.html ; https://askaboutireland.ie/learning-zone/primary-students/5th-+-6th-class/science/gravity/some-ideas-about-gravity/same-weight-but-different
- Galileo, odd numbers and inertia: https://catalogue.museogalileo.it/indepth/GalileosLawFallingBodies.html ; https://sites.pitt.edu/%7Ejdnorton/papers/Galileo_fall_induction.pdf ; https://www.tau.ac.il/education/muse/museum/galileo/the_law_of_inertia.html ; https://arxiv.org/pdf/1008.4239
- Projectiles (plane and package): https://www.physicsclassroom.com/mmedia/vectors/pap ; https://direct.physicsclassroom.com/mop/Vectors-and-Projectiles/Displacement-and-Time-for-a-Projectile/QG5help
- Dot diagrams: https://www.physicsclassroom.com/getattachment/Physics-Video-Tutorial/Kinematics/Motion-Diagrams/Lecture-Notes/MotionDiagrams2.pdf?lang=en-US ; https://www.albert.io/blog/?p=87694
- PhET: https://phet.colorado.edu/files/teachers-guide/projectile-motion-html-guide_en.pdf ; https://clixplatform.tiss.edu/phet/en/simulation/energy-skate-park-basics.html ; https://clixplatform.tiss.edu/phet/files/activities/3990/phet-contribution-3990-7215.pdf
- Strobe photography: https://arxiv.org/pdf/1901.05058 ; https://dialnet.unirioja.es/descarga/articulo/5166041.pdf ; https://www.lessonup.com/en/lesson/s3PWikbqSyXCmD8eE
- Predict-Observe-Explain: https://interactivetextbooks.tudelft.nl/showthephysics/Pedagogy/PoE.html ; https://arbs.nzcer.org.nz/node/7187
- Pendulum and height rule: https://demonstrations.wolfram.com/InterruptedPendulum/ ; https://lecdem.physics.umd.edu/g/g1/g1-20.html
- Rolling speed: https://www.miniphysics.com/uy1-sphere-on-an-incline.html
- Tangent exit: https://www.albert.io/blog/newtons-first-law-ap-physics-1-review/
- Loop the loop: https://www.isu.edu/physics/outreach/physics-class-demos/mechanics/loop-the-loop/ ; https://www.physics.usyd.edu.au/~helenj/Mechanics/Problems/L11-loop-the-loop.pdf
- Games: https://strategywiki.org/wiki/Canyon_Bomber ; https://www.arcade-history.com/game/377/ ; https://www.commonsensemedia.org/app-reviews/cut-the-rope ; https://www.commonsense.org/education/reviews/cut-the-rope ; https://www.commonsensemedia.org/app-reviews/wheres-my-water ; https://www.commonsensemedia.org/app-reviews/wheres-my-water-2 ; https://www.commonsensemedia.org/app-reviews/angry-birds-journey ; https://toucharcade.com/games/paper-toss ; https://www.iculture.nl/apps/paper-toss-world-edition-wereldwijd-propjes-gooien/
- Toys: https://legacy.thinkfun.com/products/gravity-maze/ ; https://legacy.thinkfun.com/press/toty-finalists-2015/ ; https://onlypassionatecuriosity.com/gravity-maze-logic-game-kids-review/ ; https://ravensburger-en.mindtouch.us/Product_Information/Ravensburger/GraviTrax/GraviTrax_General ; https://www.shopsavvy.com/answers/what-age-is-the-ravensburger-gravitrax-starter-set-recommended-for
- Ramps curricula: https://www.naeyc.org/resources/pubs/books/ramps-pathways-constructivist-approach-physics-young-children ; https://scholarworks.uni.edu/facbook/197 ; https://peep-dev.wgbh.org/en/educators/curriculum/family-child-care-educators/ramps/activity/guided-activity/284/airborne ; https://peep-dev.wgbh.org/en/educators/peep-family-science/ramps
