# Circuits and magnets research: Firefly Circuits and Magnet Meerkats

Research for two CurioZoo science games (ages 5–13, EN/ES, plain JS + SVG,
tap-only, no timers, one answer per puzzle that code can prove, nothing shown
by colour alone).

- **Game A, Firefly Circuits / Circuito de luciérnagas.** An eel battery and
  sleeping fireflies (bulbs) sit on a grid. The child taps wire pieces into
  slots and presses **Go**. Dots move round the loop and the right fireflies
  glow. A goal card shows which fireflies should glow and which should stay
  dark.
- **Game B, Magnet Meerkats / Suricatas imantadas.** Meerkats hold magnets.
  Like poles push and unlike poles pull. Only some metals stick. The pull
  works through paper, water and wood, and gets weaker with distance.

Status notes:
- Every fact carries a URL. My own design advice is marked **[design]**, and
  my own sums are marked **[calc]**.
- IOP Spark pages return 403 to every automated fetch (Cloudflare). For those
  pages, the claim comes from the search-engine text of the page, and the
  URL is given. Check them in a browser before quoting them in the game.
- Some original papers are behind paywalls: Osborne 1983, Shipstone 1984 and
  1985, Barrow 1987, Hickey & Schibeci 1999 and Erickson 1994. For these I
  give the citation and the summary that later papers make of them. They are
  marked *(secondary)*.
- The web-search budget ran out before I could check three things. They are
  listed in section 12 ("Open items to verify").

---

## 0. Recommendations at a glance

1. **The animation must not lie.** In Firefly Circuits the wires are already
   full of dots before Go. All dots start moving **at the same instant**. A
   lit firefly lights **at once**, not when a "first dot arrives". Dots move
   at the same speed and spacing on both sides of a firefly and through the
   eel. Brightness is drawn as glow and rays on the firefly, never as dots
   that vanish, shrink or slow down after it. (Sections 1.4 and 3.6.)
2. **Use bulbs, not LEDs.** An LED adds a direction rule that ThinkFun's
   Circuit Maze has to teach separately. A filament bulb lights either way
   round, so a firefly has no polarity. (Section 4.1.)
3. **Solve each circuit exactly.** Wires have zero resistance and fireflies
   are equal resistors. The eel is an ideal battery. Use node analysis with
   exact fractions. A short circuit is found when the eel's two ends fall in
   the same wire-node, and then **every** firefly is dark. (Section 3.)
4. **Brightness tiers come from exact power.** One firefly alone = 1. Two in
   a row = 1/4 each. Two side by side = 1 each. Each brightness value the
   game uses gets its own glyph (number of rays plus glow size), and order
   is always kept. (Sections 3.4–3.5.)
5. **Every short circuit carries a safety line,** and so does every
   wall-socket mention. Wall electricity can hurt even with one touch,
   because a body and the floor can complete the loop. (Section 3.7.)
6. **Magnets: only use objects whose answer is the same everywhere.** Steel
   paper clip, iron nail, steel food can: stick. Aluminium foil, copper wire,
   wood, plastic, glass, paper: don't stick. **Avoid** spoons, scissors,
   keys, fridge doors, jewellery and any coin given without a country and
   date. These vary. (Section 6.)
7. **Poles are N and S letters plus end shapes, never red and blue alone.**
   Red for N is only paint, and some teaching sims use green. The letters N
   and S work in Spanish too (Norte, Sur). (Section 6.4.)
8. **Three strong magnet mechanics:** Huddle (flip magnets on a grid so each
   touching pair hugs or pushes as the card shows), Ring Tower (flip ring
   magnets on a pole to match a float/touch silhouette) and Which Is the
   Magnet? (a repulsion-test logic puzzle). Two smaller ones fill in: Reach
   (strength vs distance and barriers) and Sticks or Not (sorting). Each
   uses honest rules and a binary or small-integer solver. (Section 8.)

---

# Part A: Firefly Circuits

## 1. Children's ideas about circuits

### 1.1 The classic models

The model names come from Osborne's New Zealand work (Learning in Science
Project). Shipstone tested and refined them. Shipstone's 1985 review lists
**five** models of how children picture a DC circuit: **unipolar, clashing
currents, attenuation, sharing and scientific** ([Fleer 1991, citing
Shipstone 1985](https://eclass.upatras.gr/modules/document/file.php/PN1533/2018-2019/%CE%9A%CE%B5%CE%AF%CE%BC%CE%B5%CE%BD%CE%B1%20%CE%B3%CE%B9%CE%B1%20%CF%84%CE%B7%CE%BD%20%CE%B5%CF%81%CE%B3%CE%B1%CF%83%CE%AF%CE%B1%20%22%20%CE%95%CE%BC%CF%80%CE%B5%CE%B9%CF%81%CE%B9%CF%83%CF%84%CE%B9%CE%BA%CE%AD%CF%82%20%CE%B4%CF%81%CE%B1%CF%83%CF%84%CE%B7%CF%81%CE%B9%CF%8C%CF%84%CE%B7%CF%84%CE%B5%CF%82%20%CE%B3%CE%B9%CE%B1%20%CF%84%CE%B1%20%CE%B1%CF%80%CE%BB%CE%AC%20%CE%B7%CE%BB%CE%B5%CE%BA%CF%84%CF%81%CE%B9%CE%BA%CE%AC%20%CF%86%CE%B1%CE%B9%CE%BD%CF%8C%CE%BC%CE%B5%CE%BD%CE%B1%22/1991%20Fleer%20electricity.pdf)).
The Victorian (Australia) science continuum uses four of them (unipolar,
clashing, consumed and scientific) as a teaching set
([Vic. Dept of Education](https://www.education.vic.gov.au/school/teachers/teachingresources/discipline/science/continuum/pages/electriccircuit.aspx)).

Key citations: Osborne, R. J. (1983), "Towards modifying children's ideas
about electric current", *Research in Science & Technological Education* 1,
73–82 ([citation](https://ensciencias.uab.cat/article/download/v6-n3-varela-manrique-favieres/2950/22067)).
Osborne (1981), "Children's ideas about electric current", *NZ Science
Teacher* 29 ([citation](https://informahealthcare.com/doi/ref/10.1080/713694979)).
Shipstone, D. (1984), "A study of children's understanding of electricity in
simple DC circuits", *Eur. J. Sci. Educ.* 6(2), 185–198
([PER Central](https://www.per-central.org/items/detail.cfm?ID=2889)).

| Model | What the child thinks | What the game should show to test it | Source |
|---|---|---|---|
| **Unipolar** (single wire, "source–sink") | One wire from the battery to the bulb is enough. The second wire is not needed, or is "just a ground". | A one-wire layout: no dots move and the firefly sleeps. Then two wires: it glows. | [Vic. continuum](https://www.education.vic.gov.au/school/teachers/teachingresources/discipline/science/continuum/pages/electriccircuit.aspx); [Métioui IATED 2012](https://library.iated.org/view/METIOUI2012CHI); [Grotzer & Sudbury, Harvard PZ](https://pz.harvard.edu/sites/default/files/SimpleCircuits.pdf) |
| **Clashing currents** | Current leaves **both** ends of the battery and the two streams meet in the bulb, which makes it light. | Dots go **one way round**. Equal numbers leave one end of the eel and enter the other. | [Vic. continuum](https://www.education.vic.gov.au/school/teachers/teachingresources/discipline/science/continuum/pages/electriccircuit.aspx); [Métioui et al. 2017](https://www.sustz.com/journal/8/1688.pdf) |
| **Attenuation / consumed** | The bulb uses up some current, so less comes back than went out. | The same dots at the same speed on both sides of the firefly. | [Vic. continuum](https://www.education.vic.gov.au/school/teachers/teachingresources/discipline/science/continuum/pages/electriccircuit.aspx); [IOP Spark, Küçüközer & Kocakülah 2007](https://spark.iop.org/kucukozer-and-kocakulah-2007) |
| **Sharing** | The battery's "electricity" is shared among the bulbs. Each bulb gets a part and uses it up. Adding a second bulb dims both because the source is now shared. | Series dims **both** bulbs **equally**, and the dots slow **everywhere** in the loop, including in the eel. | [Fleer 1991](https://eclass.upatras.gr/modules/document/file.php/PN1533/2018-2019/%CE%9A%CE%B5%CE%AF%CE%BC%CE%B5%CE%BD%CE%B1%20%CE%B3%CE%B9%CE%B1%20%CF%84%CE%B7%CE%BD%20%CE%B5%CF%81%CE%B3%CE%B1%CF%83%CE%AF%CE%B1%20%22%20%CE%95%CE%BC%CF%80%CE%B5%CE%B9%CF%81%CE%B9%CF%83%CF%84%CE%B9%CE%BA%CE%AD%CF%82%20%CE%B4%CF%81%CE%B1%CF%83%CF%84%CE%B7%CF%81%CE%B9%CF%8C%CF%84%CE%B7%CF%84%CE%B5%CF%82%20%CE%B3%CE%B9%CE%B1%20%CF%84%CE%B1%20%CE%B1%CF%80%CE%BB%CE%AC%20%CE%B7%CE%BB%CE%B5%CE%BA%CF%84%CF%81%CE%B9%CE%BA%CE%AC%20%CF%86%CE%B1%CE%B9%CE%BD%CF%8C%CE%BC%CE%B5%CE%BD%CE%B1%22/1991%20Fleer%20electricity.pdf) (lists it); [IOP Spark, adding a bulb](https://spark.iop.org/adding-bulb-reduces-current) (the "shared" intuition, from search text) |
| **Sequential reasoning** | A change "upstream" affects only what comes after it. The current reaches the parts one by one. | Any change (a new bulb, a switch) changes the dot speed **all round the loop at once**. | [Shipstone 1984 abstract](https://www.per-central.org/items/detail.cfm?ID=2889); [Grotzer & Sudbury](https://pz.harvard.edu/sites/default/files/SimpleCircuits.pdf) (citing Closset 1983) |
| **Cyclic sequential** (Grotzer) | The circuit starts **empty**. Current fills it like a substance, reaches the bulb, is used up, and returns. A longer wire means a longer delay before the bulb lights. | Wires full of dots before Go. Everything moves at once. The firefly lights the instant the loop closes. | [Grotzer & Sudbury](https://pz.harvard.edu/sites/default/files/SimpleCircuits.pdf) |
| **Scientific** | The current is the same in both wires and all round a series loop. The battery pushes. Energy, not current, goes to the bulb. | All of the above, plus the "why" line. | [Vic. continuum](https://www.education.vic.gov.au/school/teachers/teachingresources/discipline/science/continuum/pages/electriccircuit.aspx); [IOP Spark, what gets used](https://spark.iop.org/what-gets-used) |

Other ideas worth knowing:
- Students mix up current, voltage, energy and "electricity". They think
  current is **stored** in the battery and is **used up** or turned into
  light ([Vic. continuum](https://www.education.vic.gov.au/school/teachers/teachingresources/discipline/science/continuum/pages/electriccircuit.aspx)).
- Students think a wire joined to a battery or socket carries current even
  when the switch is open. Some think the insulation "holds" the current like
  a pipe holds water ([Vic. continuum](https://www.education.vic.gov.au/school/teachers/teachingresources/discipline/science/continuum/pages/electriccircuit.aspx)).
  **[design]** With the switch open, no dots move anywhere, including the
  wire still joined to the eel.
- Everyday language feeds the "consumed" model. Phrases such as "it uses
  electricity" may plant it, and teachers should watch their own words
  ([Fleer 1991](https://eclass.upatras.gr/modules/document/file.php/PN1533/2018-2019/%CE%9A%CE%B5%CE%AF%CE%BC%CE%B5%CE%BD%CE%B1%20%CE%B3%CE%B9%CE%B1%20%CF%84%CE%B7%CE%BD%20%CE%B5%CF%81%CE%B3%CE%B1%CF%83%CE%AF%CE%B1%20%22%20%CE%95%CE%BC%CF%80%CE%B5%CE%B9%CF%81%CE%B9%CF%83%CF%84%CE%B9%CE%BA%CE%AD%CF%82%20%CE%B4%CF%81%CE%B1%CF%83%CF%84%CE%B7%CF%81%CE%B9%CF%8C%CF%84%CE%B7%CF%84%CE%B5%CF%82%20%CE%B3%CE%B9%CE%B1%20%CF%84%CE%B1%20%CE%B1%CF%80%CE%BB%CE%AC%20%CE%B7%CE%BB%CE%B5%CE%BA%CF%84%CF%81%CE%B9%CE%BA%CE%AC%20%CF%86%CE%B1%CE%B9%CE%BD%CF%8C%CE%BC%CE%B5%CE%BD%CE%B1%22/1991%20Fleer%20electricity.pdf)).
  **[design]** The game's text never says a firefly "uses up electricity" or
  "eats the dots". It says the eel **pushes** and the firefly **glows**.
- An electric cord looks like one wire unless you notice the two wires inside
  it, which supports the single-wire idea
  ([Grotzer & Sudbury](https://pz.harvard.edu/sites/default/files/SimpleCircuits.pdf)).
- Some children's ideas do not fit any of Osborne's models. A Japanese study
  interviewed 10 children per grade in grades 1, 3, 5, 7 and 9
  ([Miyazaki Univ.](https://miyazaki-u.repo.nii.ac.jp/records/69)).

### 1.2 Which models appear at which ages

| Age | Finding | Source |
|---|---|---|
| 3–5 | In a child-care centre, a torch unit with direct teaching about how electricity flows round the circuit ended with **all** children able to connect a circuit and describe a continuous flow. Fleer argues that the flow must be **told**, because children cannot see it. | [Fleer 1991](https://eclass.upatras.gr/modules/document/file.php/PN1533/2018-2019/%CE%9A%CE%B5%CE%AF%CE%BC%CE%B5%CE%BD%CE%B1%20%CE%B3%CE%B9%CE%B1%20%CF%84%CE%B7%CE%BD%20%CE%B5%CF%81%CE%B3%CE%B1%CF%83%CE%AF%CE%B1%20%22%20%CE%95%CE%BC%CF%80%CE%B5%CE%B9%CF%81%CE%B9%CF%83%CF%84%CE%B9%CE%BA%CE%AD%CF%82%20%CE%B4%CF%81%CE%B1%CF%83%CF%84%CE%B7%CF%81%CE%B9%CF%8C%CF%84%CE%B7%CF%84%CE%B5%CF%82%20%CE%B3%CE%B9%CE%B1%20%CF%84%CE%B1%20%CE%B1%CF%80%CE%BB%CE%AC%20%CE%B7%CE%BB%CE%B5%CE%BA%CF%84%CF%81%CE%B9%CE%BA%CE%AC%20%CF%86%CE%B1%CE%B9%CE%BD%CF%8C%CE%BC%CE%B5%CE%BD%CE%B1%22/1991%20Fleer%20electricity.pdf) |
| 5–6 | 108 children were interviewed one at a time. Most built a working circuit, with or without help. Many saw the battery as a "distribution source" of something that makes the bulb light (a "pre-energy" idea). | [Kada & Ravanis, S. Afr. J. Educ.](https://sajournalofeducation.co.za/index.php/saje/article/viewArticle/1233) |
| 7–12 | Tiberghien & Delacôte (1976), "Manipulations et représentations de circuits électriques simples chez des enfants de 7 à 12 ans", *Revue française de pédagogie* 34. This is the classic French study of first circuit-building. *(secondary; cited in Grotzer)* | [Grotzer & Sudbury refs](https://pz.harvard.edu/sites/default/files/SimpleCircuits.pdf) |
| 10–12 | 108 Canadian pupils, written test. **14% unipolar, 32% clashing, 54% scientific** on the "why does it light" item, though the scientific choosers' reasons were weak. **38%** said the current is stronger in one wire than the other. Only **7%** knew a shock needs a path through both poles, and **21%** thought touching the + pole alone is "deadly". | [Métioui, Trudel & Baulu MacWillie 2017](https://www.sustz.com/journal/8/1688.pdf) |
| 7–13 | Given a battery, a bulb and one wire, children usually try a single-wire layout. | [Métioui 2012 (IATED)](https://library.iated.org/view/METIOUI2012CHI) |
| 11–18 and first-year college | Different models of current flow, sequential reasoning, and confusion of voltage with current. | [Shipstone 1984 abstract](https://www.per-central.org/items/detail.cfm?ID=2889) |
| 14 | 76 Turkish 14-year-olds: most believed current **decreases** as it passes through bulbs. | [IOP Spark summary](https://spark.iop.org/kucukozer-and-kocakulah-2007) |
| 11–14 (grades 6–8) | Almost half of 42 students used detailed, consistent mental models. Four general model types were found. | [WMU dissertation](https://scholarworks.wmich.edu/dissertations/1513) |
| Middle school to adult | Typical path: Simple Linear → Double Linear (including clashing) → Cyclic Sequential. The Cyclic Sequential model is "very common" and "particularly resistant to change", and is seen even in university physics students and teachers. | [Grotzer & Sudbury](https://pz.harvard.edu/sites/default/files/SimpleCircuits.pdf) |
| Curriculum: England Y4 (8–9) | A lamp lights only if it is part of a **complete loop** with a battery. Switches open and close a circuit. Common conductors and insulators; metals are good conductors. | [Herrick Primary Y4 plan](https://herrick.leicester.sch.uk/downloads/curriculum/downloads/Science/TheWholePicture/Year4/Electricity%20-%20Year%204.pdf) |
| Curriculum: England Y6 (10–11) | Link a lamp's brightness to the **number and voltage of cells**. Compare how components work, including bulb brightness and switch positions. Use circuit symbols. | [Herrick Primary Y6 plan](https://herrick.leicester.sch.uk/downloads/curriculum/downloads/Science/TheWholePicture/Year6/Electricity%20-%20Year%206.pdf) |

**Reading for the game [design]:**
- **Easy (5–8)** targets the unipolar model (one wire), "both feet of the
  firefly" and the closed loop. Five- and six-year-olds can build a loop when
  shown (Kada & Ravanis; Fleer).
- **Medium (8–10)** targets clashing and attenuation (equal dots on both
  sides, one direction), conductors versus insulators, and switches.
- **Hard (10–13)** targets sharing and sequential reasoning (series dims
  both equally, and changes act all at once), short circuits and bypasses,
  parallel versus series, and two eels.

### 1.3 Teaching pictures: what helps and what misleads

| Representation | Helps with | Pitfall | Source |
|---|---|---|---|
| **Rope loop** (a class passes a loop of rope round; the "battery" pulls; a child gripping it is the bulb and feels it warm) | Current is the same everywhere. A grip (resistance) slows the rope **everywhere** in the loop. Energy is shifted at the bulb by friction. The maths matches: P = F·v ↔ P = V·I. | Like all physical models, it can suggest that one particle travels all the way round. | [IOP rope loop 11–14](https://spark.iop.org/rope-loop-circuit); [IOP 5–11 guidance](https://spark.iop.org/thinking-fruitfully-about-circuits); [IOP 14–16 mapping](https://spark.iop.org/systematic-use-teaching-models); [Vic. continuum](https://www.education.vic.gov.au/school/teachers/teachingresources/discipline/science/continuum/pages/electriccircuit.aspx) |
| **Speckled rope** (dots on the rope are the charged particles) | Lets children watch the dots move at the same speed everywhere. Shows what an ammeter reads. | — | [IOP rope practical](https://spark.iop.org/rope-loop-electric-circuit-model); [IOP measuring currents](https://spark.iop.org/measuring-electric-currents-student-understanding) |
| **Bicycle chain** | The whole loop turns at once (simultaneous). The current is constant. Energy and current are different things. | The child must already see that the back wheel is where the energy goes. | [Vic. continuum](https://www.education.vic.gov.au/school/teachers/teachingresources/discipline/science/continuum/pages/electriccircuit.aspx); [Grotzer & Sudbury](https://pz.harvard.edu/sites/default/files/SimpleCircuits.pdf); [IOP Spark](https://spark.iop.org/what-gets-used) |
| **Marbles in a full tube / tennis-ball can** | Push one in at one end and one comes out at the other at once. The wire is already full of charges. | Looks "filled up". The charges are in the wire because the wire is made of them. | [Grotzer & Sudbury](https://pz.harvard.edu/sites/default/files/SimpleCircuits.pdf) |
| **Water circuit** (pump, pipes, turbine) | A closed loop; a pump pushes; a narrow pipe resists. | Can suggest that current **leaks** from a broken wire like water from a pipe. "Water and hose" analogies can **strengthen** the consumption model unless discussed carefully. Parallel hose versions convince less than series ones. | [Vic. continuum](https://www.education.vic.gov.au/school/teachers/teachingresources/discipline/science/continuum/pages/electriccircuit.aspx); [Grotzer & Sudbury](https://pz.harvard.edu/sites/default/files/SimpleCircuits.pdf); [askaboutireland](https://askaboutireland.ie/learning-zone/primary-students/3rd-+-4th-class/science/electricity/teachers-notes/use-of-analogies); [Taber, "current only slows down at the resistor"](https://science-education-research.com/?p=1474) |
| **Water wheel** | Something turns without being used up. This is a counter to "to make light, something must be used up". | Still needs the link from flow to heat and light. | [Grotzer & Sudbury](https://pz.harvard.edu/sites/default/files/SimpleCircuits.pdf) |
| **Jelly-bean role play** (children carry energy "beans" from the battery to the bulb) | Energy is transferred while the charges keep going round. | Treats energy as a substance. | [Vic. continuum](https://www.education.vic.gov.au/school/teachers/teachingresources/discipline/science/continuum/pages/electriccircuit.aspx) |
| **Ammeters on both sides of the bulb** | Equal readings show the current is not used up. | Needs numbers. **[design]** Use two little dot counters ("6 dots passed" on each side) instead. | [IOP Spark](https://spark.iop.org/what-gets-used) (search text) |
| **Explicit talk about the wrong idea** ("did the dots get tired in the bulb?") | Brings the misconception into the open so it can be tested. | — | [IOP Spark](https://spark.iop.org/charged-particles-are-always-there-what-runs-down) (search text) |

IOP's advice is to **pick one model and use it throughout**, because not all
teaching models help learners equally
([IOP teaching strategy](https://spark.iop.org/assembling-teaching-strategy)).
**[design]** Firefly Circuits uses one model: **dots in a bike-chain loop,
pushed by the eel**. The firefly is "a tight spot that the dots squeeze
through, and squeezing makes it glow". This fits the rope-grip idea (a grip
slows the whole loop), the bike chain (all at once) and the water wheel
(nothing used up).

### 1.4 What the animation must show to be honest

| # | Rule | Reason |
|---|---|---|
| A1 | Wires, eel and fireflies hold **evenly spaced dots before Go**. | Charges are already in every part of the wire ([Grotzer & Sudbury](https://pz.harvard.edu/sites/default/files/SimpleCircuits.pdf); [Vic. continuum](https://www.education.vic.gov.au/school/teachers/teachingresources/discipline/science/continuum/pages/electriccircuit.aspx)). |
| A2 | On Go, **all dots in a closed loop start at the same frame**. Fireflies reach full glow at that frame. | Counters the Cyclic Sequential model, including "a longer wire means a later light" ([Grotzer & Sudbury](https://pz.harvard.edu/sites/default/files/SimpleCircuits.pdf)). |
| A3 | In a series loop, **dot speed and spacing are the same everywhere**: before the firefly, after it, inside it and inside the eel. | The current is the same in each element ([IOP Spark](https://spark.iop.org/what-gets-used); [Vic. continuum](https://www.education.vic.gov.au/school/teachers/teachingresources/discipline/science/continuum/pages/electriccircuit.aspx)). |
| A4 | Keep the dot spacing fixed and make **dot speed proportional to the current** in that wire. Where branches split, the branch speeds add up to the main-line speed. | **[calc]** Flow = spacing × speed, so the dots are conserved at junctions. PhET instead keeps the dot count and lets density vary, and says its speeds and densities "should not be taken literally" ([PhET CCK-DC guide](https://phet.colorado.edu/files/teachers-guide/circuit-construction-kit-dc-html-guide_en.pdf)). |
| A5 | Adding a firefly in series slows the dots **everywhere** in that loop, including in the eel. | A grip slows the rope everywhere ([IOP 5–11](https://spark.iop.org/thinking-fruitfully-about-circuits)). Counters sequential reasoning ([Shipstone 1984](https://www.per-central.org/items/detail.cfm?ID=2889)). |
| A6 | Brightness is shown only as the firefly's glow and rays. Dots never fade, shrink, change colour or disappear at a firefly. | Energy, not charge, is transferred. The battery's energy store empties, while the current stays the same ([IOP Spark](https://spark.iop.org/what-gets-used); [IOP](https://spark.iop.org/charged-particles-are-always-there-what-runs-down)). |
| A7 | Dots go **one way round**. Never animate dots leaving both ends of the eel towards a firefly. | Counters clashing currents ([Vic. continuum](https://www.education.vic.gov.au/school/teachers/teachingresources/discipline/science/continuum/pages/electriccircuit.aspx)). |
| A8 | Open circuit: **no dot moves anywhere**, including in wires still joined to the eel. Mark the open ends with a small "gap" shape. Do not animate dots crawling to the gap and stopping. | A wire joined to only one end of the battery carries no current ([Vic. continuum](https://www.education.vic.gov.au/school/teachers/teachingresources/discipline/science/continuum/pages/electriccircuit.aspx); [Iowa State](https://rolemodels.wise.iastate.edu/uploads/1/9/3/193ec401e4c80d297683eeaab643ceb08b4bb1e6/NEW-Simple-Electric-Circuit.pdf)). |
| A9 | Dead-end stubs and bypassed fireflies: dots there **stay still**. | No current flows in a branch with no potential difference (section 3). |
| A10 | Short circuit: dots in the short loop **race** (capped speed with a "too fast" streak shape). Dots in the firefly branches stand still. The eel shows heat marks and a warning shape. | Shorted current is very large and bypasses the bulbs ([PhET guide](https://phet.colorado.edu/files/teachers-guide/circuit-construction-kit-dc-html-guide_en.pdf): a fire graphic above 15 A; [ThinkFun Circuit Maze rules](https://legacy.thinkfun.com/wp-content/uploads/2016/02/CircuMaze-1008-Instructions-1.pdf)). |
| A11 | Direction **[design]**: dots leave the eel's − end and enter its + end (electron direction). Never label it for young children. Keep one direction across the whole game. | Electrons are pushed away from the − terminal towards the + terminal. Conventional current is drawn the other way ([Vic. continuum](https://www.education.vic.gov.au/school/teachers/teachingresources/discipline/science/continuum/pages/electriccircuit.aspx)). PhET defaults to electrons ([PhET guide](https://phet.colorado.edu/files/teachers-guide/circuit-construction-kit-dc-html-guide_en.pdf)). |
| A12 | Under reduced motion: no moving dots. Show still arrows of equal length on both sides of each lit firefly, and give the result in words. | Site rule (PLAN §3.1). |

The real drift speed of electrons is slow, and the dot speed is a
cartoon. PhET says the same about its own dots
([PhET guide](https://phet.colorado.edu/files/teachers-guide/circuit-construction-kit-dc-html-guide_en.pdf);
[UWA misconceptions sheet](https://www.uwa.edu.au/study/-/media/faculties/science/docs/models-and-misconceptions.pdf)).
**[design]** Never write "the dots are electrons racing at the speed of
light".

---

## 2. Teaching references (to borrow ideas from, not names)

| Reference | What it is / what children do | Takeaway for Firefly Circuits | Source |
|---|---|---|---|
| **ThinkFun Circuit Maze™** (trademark; do not reuse the name) | 5×5 grid, 60 challenge cards in four levels (beginner to expert), ages 8 to adult. Tokens: a two-part power supply, 3 LED "beacons", 2 straights, 5 corners, 2 Ts, 1 bridge, 1 double corner, 1 three-way switch, 1 blocker. **The card shows which beacons are lit and which stay dark, and every challenge lights at least one.** All given tokens must be used. Switch challenges show a goal for each switch position. A short circuit is "a direct path of metal strips from Start (+) to Finish (–) with no LED in between", and it can overheat the batteries. A bulb bypassed by a plain strip in a parallel branch does not light. Metal strips in parallel are added "to be tricky". | Copy the goal-card idea (glow / stay dark) and the per-switch-position goals. Keep the bypass rule. **Drop LED polarity** for ages 5–8 (fireflies have no direction). Circuit Maze's cards are about lit or dark only; our model also shows brightness tiers. | [Circuit Maze instructions PDF](https://legacy.thinkfun.com/wp-content/uploads/2016/02/CircuMaze-1008-Instructions-1.pdf); [ThinkFun product page](https://legacy.thinkfun.com/products/circuit-maze/) |
| **Snap Circuits** (Elenco) | Plastic-mounted parts that snap together. No solder. Ages 8+. A manual of projects, then free building. The manual teaches how to avoid short circuits. | "Rebuild until it works" loops. Kids like that projects work. | [Purdue INSPIRE gift guide](https://engineering.purdue.edu/INSPIRE/EngineeringGiftGuide/2021/snap-circuits-light); [A Mighty Girl, Snap Circuits Jr](https://www.amightygirl.com/snap-circuits-jr-sc-100) |
| **Tinkercad Circuits** (Autodesk) | Free browser simulator. Breadboard, LEDs, Arduino blocks. Typically used in grades 4–12; outreach sessions run for 11+. **Needs internet; no offline version.** | Too open-ended and wordy for 5–8. Shows the appeal of a "simulate" button. | [SD62 Tinkercad](https://vllc.sd62.bc.ca/node/102); [Aberystwyth outreach](https://outreach-hub.aber.ac.uk/InSchool/Engineering/TinkercadCircuits/index.html) |
| **PhET Circuit Construction Kit: DC** | Build with batteries, bulbs, switches and everyday objects (conductor or insulator). View electrons or conventional current. A fire graphic for short circuits or >15 A. Bulb brightness ∝ power (P = V²/R), but not drawn linearly. Bulbs are Ohmic by default; "real bulbs" are optional. Wires and batteries have small resistances. Sample prompts include "two bulbs so that if one is removed both go out / the other stays lit". | Confirms the idealised model (Ohmic bulbs) is a standard teaching choice. Gives the prompt types. The name is a trademark and the code is GPL; reuse neither (PLAN §5). | [PhET CCK-DC tips for teachers](https://phet.colorado.edu/files/teachers-guide/circuit-construction-kit-dc-html-guide_en.pdf) |
| **PhET design research** | Each sim is tested in think-aloud interviews with 4–6 students new to the topic. Interviews find where students learn the wrong thing or fight the controls. "Implicit scaffolding" guides through affordances, constraints and feedback, not instructions ("guides without students feeling guided"). Tabs add complexity step by step. | Our chapter order and tap-only tray follow this. Playtest with 4–6 children per age band. | [Dubson AAPT slides](https://aapt.org/Conferences/newfaculty/upload/Dubson-PhET_NewFaculty_June2017.pdf); [Podolefsky, Moore & Perkins, arXiv 1306.6544](https://arxiv.org/pdf/1306.6544) |
| **PhET vs real kit** | Students who used only virtual circuits did as well at building real circuits. | Supports a screen-only game teaching real circuit skills. | [Finkelstein et al., SERC refs](https://serc.carleton.edu/sp/library/phet/references.html) |
| **Pipes / Net / FreeNet / NetWalk / KPlumber** | Rotate tiles until all join into one tree from the power unit, with no loops and no loose ends. Squares joined to the centre light up. Tiles can be locked. A "wrapping" variant exists. The puzzle is NP-complete. | Live "lit when connected" feedback is satisfying, but **for us the physics only runs on Go** (predict first). Borrow "lock a tile". The "no loose ends" rule is a fair Medium/Hard constraint. | [Wikipedia, Pipes](https://en.wikipedia.org/wiki/Pipes_(puzzle)); [Tatham's Net](https://www.chiark.greenend.org.uk/~sgtatham/puzzles/java/net.html); [de Biasi, NP-completeness](https://www.nearly42.org/vdisk/cstheory/netnpc.pdf) |
| **Electric Box** (2009, browser then iPhone) | Route energy from a source to a target with many kinds of objects. Reviewers liked the puzzles but wanted a hint system, and said it takes a minute or two to work out how it works. | Build in hints. Introduce one new piece per chapter. | [TouchArcade](https://toucharcade.com/2009/08/11/electric-box-an-energy-transmission-puzzler/); [AppSpy](https://www.appspy.com/review/3388/electric-box); [BuzzFeed](https://www.buzzfeednews.com/article/expresident/electric-box) |
| **Circuit Scramble** | I could only confirm an itch.io listing, pitched as logic circuit puzzles. Publisher and platform are **unverified**. Its theme is logic gates, which belongs to Gate Factory in Logic Games, not here. | Keep Firefly Circuits about the physical loop, not logic. | [itch.io listing](https://heraclies.itch.io/circuit-scramble) |

### 2.1 What makes tile circuit puzzles fun for 6–10, and what frustrates them

Fun:
- **Instant light as the reward.** A firefly waking up is the payoff. The
  science report also notes that Snap Circuits is praised because projects
  "work the first time" (see [report](../../../reports/Science%20and%20physics%20games%20for%20CurioZoo.md)).
- **A picture goal.** A card of glowing and dark fireflies needs no reading
  ([Circuit Maze](https://legacy.thinkfun.com/wp-content/uploads/2016/02/CircuMaze-1008-Instructions-1.pdf)).
- **"Stay dark" goals** turn a building task into a logic task: light A and C
  but not B ([Circuit Maze](https://legacy.thinkfun.com/wp-content/uploads/2016/02/CircuMaze-1008-Instructions-1.pdf)).
- **Steady novelty:** a new piece or idea per chapter (switch, bridge,
  insulator, T) ([PhET tab sequencing](https://arxiv.org/pdf/1306.6544)).

Frustrations, and the fix **[design]**:

| Frustration | Fix |
|---|---|
| Fiddly rotation of many tiles ([Net](https://www.chiark.greenend.org.uk/~sgtatham/puzzles/java/net.html) needs a lock feature for this reason) | Easy: a placed piece **auto-turns** to join its neighbours where only one way fits. Medium+: tap the placed piece to turn it 90°. Large tap targets. |
| Not knowing **why** it failed | After Go, show the honest result (no dots, gap marks, short-circuit marks) plus one "why" line. Never just "Wrong". |
| Too much trial and error | Few spare pieces in Easy. Fixed (locked) pieces as clues. Hints that name an action. The site's existing Show-the-answer button. |
| Hidden rules (LED direction in Circuit Maze) | No polarity. Every rule is shown in a teaching puzzle first. |
| Hint timing that does not match the player's state; hints too vague or too direct | Hints step from vague to specific, and are offered after a wrong Go, not on a timer ([Hao et al. 2022](https://faculty.washington.edu/weicaics/paper/papers/HaoHZC2022.pdf)). |
| Reading load | Children aged 11–14 use instructions, hints and in-game feedback to solve puzzles ([Shokeen et al. 2024](https://terpconnect.umd.edu/~weintrop/papers/ShokeenEtAl_IJCCI_2024.pdf)). Younger children need pictures and read-aloud. |

---

## 3. Exact circuit rules for the solver

### 3.1 The model

| Part | Model | Note |
|---|---|---|
| Eel (battery) | Ideal voltage source, V = 1 per eel. Two terminals: + end and − end, told apart by **shape** (e.g. head and tail fin plus "+" and "−" glyphs). | Ideal (no internal resistance) in the solver. Real batteries have a small internal resistance; PhET models one ([PhET guide](https://phet.colorado.edu/files/teachers-guide/circuit-construction-kit-dc-html-guide_en.pdf)). |
| Firefly (bulb) | Resistor R = 1, two terminals ("two feet"). No polarity. | PhET's default bulbs are Ohmic ([PhET guide](https://phet.colorado.edu/files/teachers-guide/circuit-construction-kit-dc-html-guide_en.pdf)). |
| Wire pieces (straight, corner, T, cross, double corner, bridge) | Zero resistance. Each piece joins certain edge ports inside its tile. A **bridge** holds two separate wires that do not touch. A **double corner** holds two separate corners. | Circuit Maze has the same piece families ([instructions](https://legacy.thinkfun.com/wp-content/uploads/2016/02/CircuMaze-1008-Instructions-1.pdf)). |
| Switch | Closed = wire. Open = no join. | Switches open and close a circuit ([England Y4](https://herrick.leicester.sch.uk/downloads/curriculum/downloads/Science/TheWholePicture/Year4/Electricity%20-%20Year%204.pdf)). |
| Insulator pieces (wood straight, rubber straight) | No join. Looks like a straight. | Insulators make the movement of charged particles difficult; conductors let them move easily ([Vic. continuum](https://www.education.vic.gov.au/school/teachers/teachingresources/discipline/science/continuum/pages/electriccircuit.aspx)). |
| Blocker (rock) | No tile can go here. | As Circuit Maze's blocker. |

### 3.2 Algorithm (about 150 lines, exact fractions)

1. **Ports.** Every tile edge is a port. Two adjacent tiles share an edge
   port only if both pieces have a wire end on that edge. A wire end that
   meets nothing is a **loose end**.
2. **Wire nodes.** Union-find over ports. Join the ports that a wire piece
   or a closed switch connects. Each class is a node.
3. **Short circuit.** If `find(eel+) === find(eel−)`, the circuit is
   **shorted**. Result: every firefly has power 0, and the flag
   `short = true`.
4. **Bulb graph.** Each firefly is an edge between the nodes of its two
   terminals. A firefly with both terminals in the same node is
   **bypassed** (power 0).
5. **Live part.** Search from node(eel+) along firefly edges. If node(eel−)
   is not reached, the circuit is **open**: every firefly has power 0.
6. **Solve.** Set V(eel+) = number of eels in series (normally 1) and
   V(eel−) = 0. For every other node in the live part, Σ over its fireflies
   of (V_node − V_other) = 0 (Kirchhoff's current law with R = 1). Solve with
   Gaussian elimination over **exact rationals** (BigInt numerator and
   denominator). Each live node is connected to a fixed node, so the system
   has a unique solution.
7. **Outputs.** For each firefly: current I = |ΔV|, power P = ΔV². Since R
   = 1 and V = 1, P is measured in units of "one firefly alone on one eel".
   For each wire node and edge: the current, which sets dot speed (section
   1.4, A4).
8. **Goal check.** Compare each firefly's brightness tier (section 3.5) with
   the goal card. Any placement that matches counts as solved, so the checker
   tests physics, not a stored answer.

Why "short → everything dark" is honest: with a real battery's small internal
resistance r, a wire straight across it pulls the terminal voltage almost to
zero. Every firefly hangs between nodes whose voltages sit between the two
battery ends, so each gets almost nothing. Shorted current "rises instantly
to dozens or even hundreds of times the rated current"
([TutorChase](https://www.tutorchase.com/answers/ib/physics/how-does-short-circuiting-a-battery-affect-its-health);
[LiTime](https://www.litime.com/blogs/troubleshooting/battery-short-circuits)).
Circuit Maze says that in a short "there is no beacon to light"
([instructions](https://legacy.thinkfun.com/wp-content/uploads/2016/02/CircuMaze-1008-Instructions-1.pdf)).
A lab note says "the wire gets hot but the bulb does not light"
([COM-FSM lab](https://comfsm.fm/~dleeling/physci/ps73/lab12photos.html)). The
current takes the low-resistance path and bypasses the bulb
([K-State light-bulb paper](https://www.phys.ksu.edu/personal/srebello/research/career/papers/LightBulbPaper.pdf)).

**Bypass is not a short.** A plain wire across one firefly, in a loop that
still has another firefly in series, darkens only the bypassed firefly. The
battery is not shorted ("Beacon A will light, Beacon B will not light … not
a short circuit")
([Circuit Maze](https://legacy.thinkfun.com/wp-content/uploads/2016/02/CircuMaze-1008-Instructions-1.pdf)).
The solver handles this through step 4.

**Two eels [design].** Allow only eels joined end to end in one chain (+ to
−), so V = 2. Never eels side by side, and never facing each other. Two ideal
batteries in parallel, or facing each other, give rules a child cannot
check. A wire across **any one** eel is a short.

### 3.3 Uniqueness and generation [design]

- Enumerate every placement of the given pieces in the empty slots, with 4
  turns each. Remove placements with the same set of connected edges (a
  straight turned 180° is the same piece). Keep the level only if **exactly
  one** connection set meets the goal card while using all given pieces (the
  Circuit Maze rule:
  [instructions](https://legacy.thinkfun.com/wp-content/uploads/2016/02/CircuMaze-1008-Instructions-1.pdf)).
  If not, lock a piece or add a rock and test again.
- Size: 6 empty slots with 4 pieces gives 360 × 256 ≈ 92,000 cases, each a
  graph of under 30 nodes. That is fine offline in `tools/sciencebuild.mjs`.
  Ship the levels as JSON, and let the checker re-run them on every build.
- Optional rule for Medium/Hard: **no loose ends** (every wire end must touch
  another wire end, a firefly foot or an eel end). Net uses this rule
  ([de Biasi](https://www.nearly42.org/vdisk/cstheory/netnpc.pdf)). It cuts
  the number of solutions a lot. It is a **game** rule, not physics: a loose
  end does nothing in a real circuit. Say so in the rule card ("tidy wires").

### 3.4 Exact brightness table [calc]

Units: P = 1 is one firefly alone on one eel. Formulas: series of n gives
I = 1/n and P = 1/n² each. Parallel branches each get the full V. These
match the standard result that two identical bulbs in series each get one
quarter of the power of a single bulb, and in parallel each get the same
([UBC Faculty of Education](https://scienceres-edcp-educ.sites.olt.ubc.ca/files/2015/01/sec_phys_circuits_series.pdf);
[UCSD tutorial](https://cass.ucsd.edu/archive/physics/ph1b/tutorials/tut7.html)).

| Layout (one eel unless stated) | Current per firefly | Power per firefly | Eel current | Level |
|---|---|---|---|---|
| 1 firefly | 1 | **1** | 1 | Easy |
| 2 in a row (series) | 1/2 | **1/4** each | 1/2 | Medium |
| 3 in a row | 1/3 | **1/9** each | 1/3 | Hard |
| 2 side by side (parallel) | 1 | **1** each | 2 | Medium |
| 3 side by side | 1 | **1** each | 3 | Medium |
| 1 in a row with a side-by-side pair | 2/3 (single), 1/3 (pair) | **4/9** single, **1/9** each of the pair | 2/3 | Hard |
| A pair in a row ∥ one firefly alone | 1/2, 1/2 ∥ 1 | **1/4**, **1/4** ∥ **1** | 3/2 | Hard |
| Two side-by-side pairs in a row | 1/2 each | **1/4** each | 1 | Hard |
| Balanced "bridge" (4 fireflies in a square + one across the middle) | 1/2 each side, 0 across | **1/4** each, **0** for the middle one | 1 | Hard surprise |
| 2 in a row, one bypassed by a wire | 0 and 1 | **0** and **1** | 1 | Medium |
| Plain wire across the eel (short) | 0 | **0** for all | "huge" | Medium |
| 2 eels end to end, 2 fireflies in a row | 1 | **1** each | 1 | Hard |
| 2 eels end to end, 1 firefly | 2 | **4** | 2 | **Avoid** (see below) |

Honest caveats:
- Real filament bulbs are **not** Ohmic. A cooler filament has lower
  resistance, so two in series get a bit **more** than 1/4 of the power.
  PhET offers "real bulbs" as an option for this reason
  ([PhET guide](https://phet.colorado.edu/files/teachers-guide/circuit-construction-kit-dc-html-guide_en.pdf)).
  The game's claims are about **order** (dimmer, same, brighter), and the
  order is true for real bulbs.
- Seen brightness is not proportional to power. PhET says brightness comes
  from power, "though not linearly"
  ([PhET guide](https://phet.colorado.edu/files/teachers-guide/circuit-construction-kit-dc-html-guide_en.pdf)).
  So never draw "a quarter as bright" as a quarter-size glow. Use distinct
  ordered tiers.
- The balanced bridge's middle firefly is dark by symmetry. This stays true
  for real identical bulbs, because the two middle nodes sit at the same
  voltage on both sides **[calc]**.
- "Two eels, one firefly" gives 4× power. A real bulb rated for one cell
  could burn out, so avoid it in puzzles. England's Year 6 objective (more
  cells make a brighter lamp) can be taught with "two eels, two fireflies in
  a row = each as bright as one alone", plus a "why" card
  ([England Y6](https://herrick.leicester.sch.uk/downloads/curriculum/downloads/Science/TheWholePicture/Year6/Electricity%20-%20Year%206.pdf)).

### 3.5 Brightness glyphs (shape first, colour second) [design]

| Power P | Name (EN / ES) | Glyph | Allowed in |
|---|---|---|---|
| 1 | bright / brilla mucho | Eyes open, big glow disc, **3 long rays** | All levels |
| 4/9 | medium / brilla | Eyes open, medium glow, **2 rays** | Hard only |
| 1/4 | dim / brilla poco | Eyes open, small glow, **1 short ray** | Medium, Hard |
| 1/9 | faint / casi nada | Eyes half open, tiny glow ring, **no rays** | Hard only |
| 0 | asleep / dormida | Eyes closed, "z z" mark, no glow | All levels |

- The order of tiers always matches the order of P. A goal card never asks a
  child to tell apart two tiers it has not been taught.
- A comparison puzzle ("which glows more?") only uses tiers that differ by at
  least a factor of 2 in power (1 vs 1/4, 1/4 vs 1/9 is 2.25, 4/9 vs 1/9).
  It never compares 4/9 with 1/4 (a factor of 1.78), which real bulbs might
  not show clearly.
- The screen reader and live region say the tier word: "Firefly B: dim,
  1 ray".

### 3.6 Dot speeds [calc]

Speed ∝ current in that wire (section 1.4, A4). With "one firefly alone" as
speed 1: two in series gives speed 1/2 everywhere, including in the eel.
Two in parallel gives speed 1 in each branch and 2 in the shared wires and
the eel. In a short, cap the short-loop speed at about 4× and add streak
marks. Firefly branches across a short stand still.

### 3.7 Safety lines

- Short circuits are dangerous with real batteries. Circuit Maze's
  instructions say a short "can cause the batteries to overheat and damage
  the game's components", and tell the player to "immediately remove one of
  the tokens"
  ([instructions](https://legacy.thinkfun.com/wp-content/uploads/2016/02/CircuMaze-1008-Instructions-1.pdf)).
  CLEAPSS shows shorted AA cells getting hot enough to melt the holder
  ([CLEAPSS](https://science.cleapss.org.uk/Resource-Info/Four-AA-Batteries-Short-circuit-Danger.aspx)).
  Lithium batteries can catch fire when shorted
  ([Fujitsu battery safety note](https://www.fujitsu.com/downloads/SUPER/manual/Battery_Safety_Note.pdf)).
  Snap Circuits manuals teach how to avoid shorts
  ([Purdue INSPIRE](https://engineering.purdue.edu/INSPIRE/EngineeringGiftGuide/2021/snap-circuits-light)).
- **Do not let the loop rule suggest that one touch is safe on mains.** A
  residual-current device exists because current can flow "through a person
  from a phase (line / hot) to earth"
  ([Wikipedia: RCD](https://en.wikipedia.org/wiki/Residual-current_device)).
  Only 7% of 10–12-year-olds knew that a battery shock needs a path between
  both poles ([Métioui et al. 2017](https://www.sustz.com/journal/8/1688.pdf)).
  The wall-socket line must stand alone, with no loop logic attached.
- Lines (EN), shown on the first short circuit and in the parent notes:
  - "Never join the two ends of a real battery with a wire. It gets hot and
    can burn you."
  - "Never put anything in a wall socket. Wall electricity can hurt you, even
    with just one touch."
  - Parent note: "Firefly Circuits uses pretend eels. With real kits, use
    small batteries and an adult."

---

## 4. Game design notes

### 4.1 Piece set by level [design]

| Level | Pieces | New idea |
|---|---|---|
| Easy (5–8) | Straight, corner, firefly (fixed), eel (fixed) | Full loop; both feet of the firefly; one wire is not enough |
| Medium (8–10) | + T, wood/rubber straight, switch, bridge | Conductors and insulators; switch; the two eel ends never meet by wire alone (short); bypass; series (dim) and parallel (bright) |
| Hard (10–13) | + cross, double corner, second eel, rock | Mixed series–parallel (4/9, 1/9); balanced bridge; two eels; multi-switch goal cards |

Fireflies are drawn with **two clear feet** (contact points), and dots pass
through the body. Children often do not know a bulb has two contacts; the
Victorian continuum's "bulb with no holder" task targets this
([Vic. continuum](https://www.education.vic.gov.au/school/teachers/teachingresources/discipline/science/continuum/pages/electriccircuit.aspx)).

### 4.2 Puzzle families for 100–200 per level [design]

1. **Build to goal**: place k pieces to match the goal card (most puzzles).
2. **Will it glow?**: predict-first cards. Show a finished board and tap the
   predicted tier for each firefly, then Go. These are cheap to generate from
   any solved board, and they directly test the unipolar, clashing and
   sharing models.
3. **Fix the board**: one piece is wrong (a wood straight, a wire making a
   short, a bypass). Tap it and swap it.
4. **Switch cards** (Medium+): one goal per switch position, as in Circuit
   Maze.
5. **Spot the short** (Medium+): which single piece, if turned, would short
   the eel? Teaches the safety idea without a real battery.

Generation: random loops on 4×4 to 6×6 grids, then decoy slots, then the
exhaustive uniqueness test (section 3.3). Variety comes from goal patterns
over 1–4 fireflies, the topologies in the table in section 3.4, and the
board shapes.

---

## 5. Firefly Circuits: hand-made teaching puzzles (in learning order)

Notation: `E` eel (+ and − ends), `F` firefly, `─ │` straights, `┌ ┐ └ ┘`
corners, `?` empty slot, `W` wood straight, `S` switch.

| # | Level | Board and pieces | Goal | Teaches (and the "why" line) |
|---|---|---|---|---|
| T1 | Easy | A loop round a 3×3 ring: E on the left, F on the right, one `?` on the top edge. Tray: one straight. | F glows. | A loop needs no gaps. "The dots need a whole loop, out of the eel and back in." |
| T2 | Easy | Predict card, two pictures. (a) One wire from E+ to one foot of F. (b) Two wires, each foot to a different eel end. Tap the picture that glows, then Go. | Pick (b). After Go, (a) shows no moving dots. | Unipolar target. "One wire is a road with no way home, so no dots can move." |
| T3 | Easy | Both wires reach F, but both go to the **same** foot. The other foot has a `?`. Tray: corner, straight. | F glows. | The firefly has two feet, and the loop goes in one and out the other. "The dots must go **through** the firefly." |
| T4 | Easy (watch) | A finished loop. Two little counters, one on each side of F. Question: "More dots before or after the firefly?" Choices: before / same / after. Go. | Same. Both counters tick together. | Attenuation target. "The same dots come out as go in. The firefly uses the eel's push, not the dots." |
| T5 | Medium | Loop with one `?`. Tray: wood straight, metal straight. | F glows. Using wood shows no dots moving. | Conductors and insulators. "Metal lets the dots through. Wood and rubber don't." |
| T6 | Medium | Loop with `?` for a switch. Goal card with two panels: switch open → F asleep, switch closed → F glows. | Both panels match. | A switch opens and closes the loop. "A switch is a little bridge: closed lets the dots cross, open stops them." |
| T7 | Medium | E and F. The tray has a T and a straight. One placement makes a wire-only path from E+ to E− **and** a path through F. | F glows. A wrong Go shows the short: racing dots, a hot eel, F asleep, and the safety line. | Short circuit. "The dots take the easy wire shortcut, so none go through the firefly. A real battery would get hot, so never try it." |
| T8 | Medium | Two fireflies A and B in a row. A spare straight can go beside B (a bypass). | A glows, B stays asleep. | Bypass is not a short. "The dots skip B on the plain wire, but they still go through A." |
| T9 | Medium | Two goal cards, same pieces. (a) Two fireflies, both dim. (b) Two fireflies, both bright. The child builds a row for (a) and side by side for (b). | (a) series 1/4 each, (b) parallel 1 each. Dots slow everywhere in (a). | Sharing target and series vs parallel. "In a row, two fireflies share one eel's push, so both are dim. Side by side, each gets its own path, so each is bright." |
| T10 | Hard | Fireflies A and B side by side; a `?` for a switch on B's branch only. Cards: switch open → A bright, B asleep. Switch closed → A bright, B bright. | Both match. | Branches are independent. "Each side path has its own loop, so A keeps glowing whatever B's switch does." |

Hard follow-ups: the balanced bridge (the middle firefly asleep) and "two
eels, two fireflies in a row, each as bright as one alone".

---

# Part B: Magnet Meerkats

## 6. Magnet facts

### 6.1 Which materials a magnet attracts

Core rule: iron, nickel and cobalt (and alloys such as steel) are the
ferromagnetic metals. Most metals are **not** attracted
([Vic. continuum, magnetism](https://www.education.vic.gov.au/school/teachers/teachingresources/discipline/science/continuum/Pages/magnetism.aspx);
[Cyberphysics](https://cyberphysics.co.uk/PGCE/Misconceptions/magnets.htm)).
Steel is magnetic because it contains iron, and because steel is everywhere,
"most metals appear to be magnetic" in daily life
([STEM ITT KS3 notes](https://12175.stem.org.uk/resources/ITT/ks3/pdfversion/Topic3_7.pdf)).
In everyday and school language, "magnetic" means ferromagnetic. The far
weaker effects (para- and diamagnetism) are not what the word means
([STEM ITT](https://12175.stem.org.uk/resources/ITT/ks3/pdfversion/Topic3_7.pdf)).
Aluminium is weakly paramagnetic and water is diamagnetic. The diamagnetic
push is about 100,000 times weaker than ferromagnetic attraction and needs a
very strong magnet to see
([Exploratorium, Magnetic Fruit](https://annex.exploratorium.edu/wsw/progress_snacks/diamagnetism_www/)).
**[design]** In the game, "sticks" means attracted by an ordinary
classroom magnet.

| Object | Sticks? | Use in game | Why / source |
|---|---|---|---|
| Steel paper clip (plain metal) | Yes | **SAFE** | Steel clips become induced magnets ([elevise](https://www.elevise.co.uk/gap7b.html)); classroom clip tests ([Vic. continuum](https://www.education.vic.gov.au/school/teachers/teachingresources/discipline/science/continuum/Pages/magnetism.aspx)). Draw it plain. Plastic clips exist. |
| Iron nail | Yes | **SAFE** | Iron is ferromagnetic ([Vic.](https://www.education.vic.gov.au/school/teachers/teachingresources/discipline/science/continuum/Pages/magnetism.aspx)). "Clavo" is in a Mexican primary test list ([ILCE](https://redescolar.ilce.edu.mx/sitios/proyectos/aventura_ciencias_pri21/doc/exp_magnetismo.pdf)). |
| Steel food can ("tin can") | Yes | **SAFE** (label "steel can") | Steel cans are picked out by magnets in recycling ([SUEZ](https://www.suez.co.uk/en-gb/our-offering/communities-and-individuals/education-tools-and-resources/what-happens-to-waste/recycling/cans); [Lancashire CC](https://www.lancashire.gov.uk/waste-and-recycling/reduce-reuse-recycle/how-we-deal-with-your-waste/what-happens-to-your-recycling/what-happens-to-your-recycling)). |
| Aluminium foil / aluminium can | No | **SAFE** (label "aluminium") | Aluminium is not magnetic; plants use eddy-current separators to sort it ([SUEZ](https://www.suez.co.uk/en-gb/our-offering/communities-and-individuals/education-tools-and-resources/what-happens-to-waste/recycling/cans); [Lancashire CC](https://www.lancashire.gov.uk/waste-and-recycling/reduce-reuse-recycle/how-we-deal-with-your-waste/what-happens-to-your-recycling/what-happens-to-your-recycling)). SUEZ says "most" drink cans are aluminium, so do not call any drink can aluminium; label the metal. |
| Copper wire / copper pipe | No | **SAFE** | Copper is diamagnetic and does not stick ([SD Bullion](https://sdbullion.com/blog/is-silver-magnetic); [Robinsons](https://robinsonsjewelers.com/blogs/news/is-gold-magnetic)). |
| Gold bar / nugget | No | **SAFE** | Pure gold is diamagnetic ([SD Bullion](https://sdbullion.com/blog/is-gold-magnetic); [Robinsons](https://robinsonsjewelers.com/blogs/news/is-gold-magnetic)). |
| Gold or silver **ring / jewellery** | Varies | **AVOID** | Alloys with nickel, iron or cobalt, steel clasps, and nickel-whitened white gold may be attracted ([Vintage Cash Cow](https://www.vintagecashcow.co.uk/blog/is-gold-magnetic); [SD Bullion](https://sdbullion.com/blog/is-silver-magnetic)). |
| Silver bar | No | SAFE (Hard) | Diamagnetic ([SD Bullion](https://sdbullion.com/blog/is-silver-magnetic)). |
| Solid brass object (labelled "brass") | No | SAFE with care | Brass is copper and zinc, neither ferromagnetic ([Hunker](https://www.hunker.com/12000990/how-to-tell-if-a-key-is-made-of-brass)). Draw only a simple solid shape with no steel parts. |
| **Keys** | Varies | **AVOID** | Solid brass keys don't stick, but brass-plated steel keys do ([Hunker](https://www.hunker.com/12000990/how-to-tell-if-a-key-is-made-of-brass); [Jerry](https://getjerry.com/questions/are-car-keys-magnetic)). |
| **Spoon, fork, knife (stainless)** | Varies | **AVOID** | Grade 304 (austenitic) is generally not magnetic, and cold working can make it slightly magnetic. Grade 430 (ferritic) is magnetic ([Klöckner Metals](https://www.kloecknermetals.com/blog/what-is-the-difference-between-430-vs-304-stainless-steel/); [Essentra](https://essentracomponents.com/en-gb/news/solutions/access-hardware/304-vs-430-stainless-steel)). |
| **Scissors** | Varies (unverified) | **AVOID** | Usually stainless blades of unknown grade (same source as the spoon row). Not checked further. |
| **Fridge door** | Varies | **AVOID** | Painted steel doors hold magnets, but stainless 304 fronts may not. Same stainless sources. |
| Pure nickel strip | Yes | Hard fact card only | Nickel strips are attracted while a "nickel" coin is not ([STEM ITT](https://12175.stem.org.uk/resources/ITT/ks3/pdfversion/Topic3_7.pdf)). |
| Cobalt | Yes | Fact card only | One of three ferromagnetic elements ([Vic.](https://www.education.vic.gov.au/school/teachers/teachingresources/discipline/science/continuum/Pages/magnetism.aspx)). |
| Plastic toy, plastic spoon | No | **SAFE** | Plastic is not attracted ([NSTA](https://www.nsta.org/early-years-exploring-magnetism)). |
| Wood block, pencil, paper, cloth, glass, rubber eraser | No | **SAFE** | Classroom sorting sets ([Vic.](https://www.education.vic.gov.au/school/teachers/teachingresources/discipline/science/continuum/Pages/magnetism.aspx); [ILCE](https://redescolar.ilce.edu.mx/sitios/proyectos/aventura_ciencias_pri21/doc/exp_magnetismo.pdf)). |
| Grape / water | No (a tiny push only with a very strong magnet) | SAFE as "doesn't stick" | Water is diamagnetic ([Exploratorium](https://annex.exploratorium.edu/wsw/progress_snacks/diamagnetism_www/)). |
| Magnetite (lodestone) | Is itself a natural magnet | Fact card | ([UAEH slides](https://www.uaeh.edu.mx/docencia/P_Presentaciones/prepa4/fisica/magnetismo.pdf)). |

### 6.2 Coins: never use "a coin" without a country and date

| Coin | Made of | Sticks? | Source |
|---|---|---|---|
| US 1¢ (since 1982) | 97.5% zinc, 2.5% copper (copper-plated zinc) | No | [US Mint specs](https://usmint.gov/learn/coin-specifications); [Wikipedia, penny](https://en.wikipedia.org/wiki/Penny_(United_States_coin)) |
| US 5¢ "nickel" | 75% copper, 25% nickel (not clad) | **No**, despite the name | [US Mint specs](https://usmint.gov/learn/coin-specifications); [UMD magnets page](https://terpconnect.umd.edu/~wbreslyn/magnets/is-nickel-magnetic.html) |
| US 10¢, 25¢, 50¢ | Clad 91.67% Cu / 8.33% Ni | No (inferred from the alloy; not tested in a source) | [US Mint specs](https://usmint.gov/learn/coin-specifications) |
| UK 1p, 2p from Sept 1992 | Copper-plated steel | Yes | [Royal Mint](https://www.royalmint.com/stories/collect/why-are-some-uk-coins-magnetic/) |
| UK 1p, 2p before 1992 (bronze), and some 1998 2p | Bronze | No | [Royal Mint FAQ](https://lifestyle.royalmint.com/faqs/collectors/what-are-bronze-coins-made-from-why-are-some-magnetic-and-some-not/) |
| UK 5p, 10p from 2011/2012 | Nickel-plated steel | Yes (older cupronickel ones: no) | [Royal Mint](https://www.royalmint.com/stories/collect/why-are-some-uk-coins-magnetic/) |
| Euro 1, 2, 5 cent | Copper-covered steel | Yes | [European Commission](https://economy-finance.ec.europa.eu/euro/euro-coins-and-notes/euro-coins/common-sides-euro-coins_pt); [Banco de España](https://www.bde.es/f/webbe/EFE/BilletesYMonedas/monedas_en_euros/Monedas_en_euros_2026_ingles.pdf) |
| Euro 10, 20, 50 cent | Copper alloy ("Nordic gold") | No | [Banco de España](https://www.bde.es/f/webbe/EFE/BilletesYMonedas/monedas_en_euros/Monedas_en_euros_2026_ingles.pdf); [SAM test](https://www.samaterials.com/content/magnetic-response-video-test-of-euro-coins.html) |
| Mexico, Canada, others | Not researched | **AVOID** | — |

**[design]** A Spanish-speaking child in Spain holds magnetic euro cents,
while a US child's "nickel" is not magnetic. No generic coin can be true for
both, so keep coins out of the sorting bank. The US nickel can be a Hard
"surprise" fact card if it names the country.

### 6.3 Physics facts the rules rest on

| Fact | Source |
|---|---|
| Every magnet has a north and a south pole. Like poles repel and unlike poles attract. | [Vic. continuum](https://www.education.vic.gov.au/school/teachers/teachingresources/discipline/science/continuum/Pages/magnetism.aspx); [England Y3](https://herrick.leicester.sch.uk/downloads/curriculum/downloads/Science/TheWholePicture/Year3/Forces%20and%20Magnetism%20-%20Year%203.pdf) |
| Cut a magnet in two and each piece has its own N and S. A single pole cannot be isolated. | [Clase digital, U. Guanajuato](https://blogs.ugto.mx/rea/clase-digital-1-magnetismo/) |
| A magnet attracts unmagnetised iron or steel by making it a temporary (induced) magnet. So **attraction does not prove** an object is a magnet; **only repulsion does**. | [Geniebook](https://geniebook.com/tuition/secondary-4/physics/magnetism); [miniphysics](https://www.miniphysics.com/properties-of-magnets.html) |
| Paper-clip chains hold because each clip becomes an induced magnet. The chain falls apart when separated from the magnet. | [UCSB demo](https://web.physics.ucsb.edu/~lecturedemonstrations/Composer/Pages/68.12.html); [elevise](https://www.elevise.co.uk/gap7b.html) |
| Magnetic force acts at a distance, without contact. | [England Y3](https://herrick.leicester.sch.uk/downloads/curriculum/downloads/Science/TheWholePicture/Year3/Forces%20and%20Magnetism%20-%20Year%203.pdf); [NGSS 3-PS2-3 (AMNH card deck)](https://www.amnh.org/content/download/207881/3087761/file/NGSS-AMNH-CARD-DECK-3-PS2.pdf) |
| Magnetic force passes through paper, cardboard, glass, plastic, wood and water. | [UBC class blog](https://blogs.ubc.ca/mslangille/?p=188); [4-H activity](https://fyi.extension.wisc.edu/wi4hpublications/files/2015/10/ACTpa122.pdf); [Vic. activity list](https://www.education.vic.gov.au/school/teachers/teachingresources/discipline/science/continuum/Pages/magnetism.aspx) |
| The force weakens with distance. Between two small magnets far apart it falls about as 1/d⁴. On an iron object that the magnet magnetises, it can fall as steeply as 1/d⁷. Shape matters, and a small change in distance makes a big change in force. | [Wikipedia, dipole–dipole](https://en.wikipedia.org/wiki/Magnetic_dipole%E2%80%93dipole_interaction); [Illinois Ask the Van](https://van.physics.illinois.edu/ask/listing/419) |
| Strength depends on material and shape, not size. Compare a weak large magnet with a strong small one. | [Cyberphysics](https://cyberphysics.co.uk/PGCE/Misconceptions/magnets.htm); [IOP Spark](https://spark.iop.org/many-students-expect-all-metals-be-attracted-magnets-and-think-size-magnet-dictates-its-strength) |
| Two side-by-side bar magnets attract when they point **opposite ways** and repel when they point the **same way**. End to end, N to S attracts. | **[calc]** from the like-poles rule: side by side, same direction puts N beside N and S beside S. |
| Ring magnets on a pencil float when like faces meet. The repulsion holds up the weight, and gaps near the bottom of a stack (more weight above) differ from those near the top. | [Carleton SERC](https://serc.carleton.edu/sp/mnstep/activities/27124.html); [Rowan demos](https://users.rowan.edu/~klassen/dpa/facultyStaff/Docs/physics_demos/EandM_html/magnets.html); [UW MRSEC](https://education.mrsec.wisc.edu/fun-with-magnets/) |
| A compass needle's N end points along the field. Outside a magnet, the field runs from its N end to its S end. | [UC Davis lab](https://physlab.physics.ucdavis.edu/physlab/ph14e/mfbar.htm); [Walter Fendt](https://www.walter-fendt.de/html5/phen/magneticfieldbar_en.htm) |
| Magnetism can be lost through rough handling or heat. | [Vic.](https://www.education.vic.gov.au/school/teachers/teachingresources/discipline/science/continuum/Pages/magnetism.aspx) |
| **Safety:** high-powered magnets swallowed together can pull together through the gut and cause perforation or blockage. They are banned from toys for under-14s. | [CPSC 2011](https://www.cpsc.gov/Newsroom/News-Releases/2012/cpsc-warns-high-powered-magnets-and-children-make-a-deadly-mix); [CPSC recall notice](https://www.cpsc.gov/node/56557) |

### 6.4 Colours and labels

- Red for N and blue for S is a **painted convention**, not a property of the
  magnet ([I'm a Scientist](https://extremej15.imascientist.org.uk/question/why-is-the-north-side-of-a-magnet-red-an-dthe-south-blue/);
  [School Specialty, painted bar magnets](https://www.schoolspecialty.com/science-painted-steel-bar-magnets-red-and-blue-568406)).
  Teaching sims also use red/green
  ([UC Davis](https://physlab.physics.ucdavis.edu/physlab/ph14e/mfbar.htm);
  [Walter Fendt](https://www.walter-fendt.de/html5/phen/magneticfieldbar_en.htm)).
- **[design]** Mark poles with the letters **N** and **S** (the same in
  Spanish: Norte, Sur) and an end shape: N = pointed or flat end, S = round
  end, as PLAN §3.6 says. Colour is optional decoration. Push and pull are
  shown with shapes: pull = the meerkats hug and the gap closes, with a ♥ or
  hug-arms icon; push = a gap with outward arrows ⟷.
- Do not call N "positive" and S "negative". Magnetic poles always come in
  pairs ([I'm a Scientist answer, corrected](https://extremej15.imascientist.org.uk/question/why-is-the-north-side-of-a-magnet-red-an-dthe-south-blue/)).

---

## 7. Children's ideas about magnets

| Idea | Who and when | Source |
|---|---|---|
| **All metals are attracted** (the most common) | Primary pupils. 39% of 56 trainee science teachers also held it. Linked to primary teaching that "metals conduct", which spreads to "metals are magnetic". | [IOP Spark](https://spark.iop.org/many-students-expect-all-metals-be-attracted-magnets-and-think-size-magnet-dictates-its-strength); [Burgoon et al. 2011 via IOP](https://spark.iop.org/burgoon-et-al-2011); [Herrick Y3](https://herrick.leicester.sch.uk/downloads/curriculum/downloads/Science/TheWholePicture/Year3/Forces%20and%20Magnetism%20-%20Year%203.pdf) |
| **All silver-coloured things stick** | Primary/secondary | [Cyberphysics](https://cyberphysics.co.uk/PGCE/Misconceptions/magnets.htm) |
| **Bigger magnet = stronger** | First graders: Benbow & Lockard (1987) compared five ways to correct this. 36% in an Indonesian three-tier test (grade not stated). | [UMD theses list](https://drum.lib.umd.edu/collections/ec2ea634-b1e8-4ce7-a2fc-f75a9cd1b12c/browse/title); [Indonesian study](https://ppjp.ulm.ac.id/journal/index.php/bipf/article/download/23872/pdf); [IOP Spark](https://spark.iop.org/many-students-expect-all-metals-be-attracted-magnets-and-think-size-magnet-dictates-its-strength) |
| **Magnets only attract** (repulsion is less familiar; a one-sided view) | Primary, before teaching (Bradamante & Viennot 2007). Younger students in general. | [IOP Spark key paper](https://spark.iop.org/key-research-paper-bradamante-and-viennot-2007); [Vic. continuum](https://www.education.vic.gov.au/school/teachers/teachingresources/discipline/science/continuum/Pages/magnetism.aspx) |
| Force is the same at any distance; spread evenly over the whole magnet | Five 5th graders (small qualitative study) | [El-Midad diagnostic study](https://ftkjournal-uinmataram.id/index.php/elmidad/article/view/14905) |
| Magnetism, static electricity and gravity are one "pulling" force | Young students | [Vic. continuum](https://www.education.vic.gov.au/school/teachers/teachingresources/discipline/science/continuum/Pages/magnetism.aspx); [IOP Spark, gravity link](https://spark.iop.org/some-students-may-associate-magnetism-gravity-seeing-one-cause-other-andor-think-both-require) |
| Primary pupils use a **"pulling/sucking"** model; secondary pupils an **"emanating"** model (something streams out) | Erickson (1994), in Fensham, Gunstone & White (eds.), *The Content of Science*, 80–97 *(secondary)* | [Thai grade-6 study comparing with Erickson](https://so02.tci-thaijo.org/index.php/human_ubu/article/view/85406); [Vic. refs](https://www.education.vic.gov.au/school/teachers/teachingresources/discipline/science/continuum/Pages/magnetism.aspx) |
| Magnets work through paper but **not** through wood, a table or other thick things | Year 3 (7–8) | [Oak National Academy](https://thenational.academy/teachers/programmes/science-primary-ks2/units/simple-forces-including-magnets/lessons/blocking-magnetic-force) |
| Magnets "stick to specific objects" rather than exerting a force | Students (IOP review) | [IOP Spark](https://spark.iop.org/many-students-think-magnets-stick-specific-objects-instead-understanding-attractive-force-acts) |
| Slow to adopt the idea of poles | Students (IOP review) | [IOP Spark](https://spark.iop.org/many-students-are-slow-adopt-idea-magnetic-poles-and-only-gradually-come-see-magnetic-effects-terms) |
| A broken magnet loses its magnetism | Lower secondary (Rwanda, Senior 2) | [EU-JER](https://www.eu-jer.com/physics-students-conceptual-understanding-of-electricity-and-magnetism-in-nine-years-basic-education-in-rwanda) |
| All magnets are made of iron; Earth's magnetic and geographic poles coincide | Secondary | [Cyberphysics](https://cyberphysics.co.uk/PGCE/Misconceptions/magnets.htm) |
| Magnetism seems "magical"; K–2 accept "it's the nature of the material" | K–2 | [NSTA, Early Years](https://www.nsta.org/early-years-exploring-magnetism) |

Older classics (citation only; full text not read): Haupt (1952), *Science
Education* 36(3), 162–168. Barrow (1987), "Magnet concepts and elementary
students' misconceptions", Proc. 2nd Int. Seminar on Misconceptions, Cornell,
Vol. III, 17–22. Barrow (2000), *J. Sci. Educ. Tech.* 9(3), 199–205. Bailey,
Francis & Hill, "Exploring ideas about magnets", *Research in Science
Education* 17 ([citations collected here](https://arxiv.org/pdf/physics/0503132);
[tused.org survey](https://www.tused.org/index.php/tused/article/view/1241)).
Hickey & Schibeci (1999), "The attraction of magnetism", *Physics
Education* 34(6), 383–388: the abstract says magnetism research has lagged
behind other topics and reports the conceptions of several groups
([Murdoch record](https://researchportal.murdoch.edu.au/esploro/outputs/journalArticle/The-attraction-of-magnetism/991005541561607891)).

Curriculum anchors:
- **England Y3 (7–8):** magnets attract or repel each other and attract some
  materials; sort materials; two poles; predict attract or repel from which
  poles face; magnetic forces act at a distance
  ([Herrick Y3](https://herrick.leicester.sch.uk/downloads/curriculum/downloads/Science/TheWholePicture/Year3/Forces%20and%20Magnetism%20-%20Year%203.pdf);
  [Churchill CE Primary](https://www.churchill.kent.sch.uk/science)).
- **NGSS 3-PS2-3 / 3-PS2-4 (grade 3):** questions about how distance and
  orientation change magnetic forces; design problems with magnets (a door
  latch, keeping two objects apart)
  ([NYSSLS 3-PS2-4](https://nyssls.info/index.php/3-PS2-4);
  [AMNH card deck](https://www.amnh.org/content/download/207881/3087761/file/NGSS-AMNH-CARD-DECK-3-PS2.pdf)).

---

## 8. Magnet puzzle mechanics: provable, fun and honest

Each mechanic below: rules, solver, uniqueness, variety, honesty, ages.

### 8.1 Huddle (the main mode) — flip magnets so the touching pairs match the card

- **Board.** A grid of cells. Each meerkat cell holds one bar magnet whose
  **axis** (horizontal or vertical) is fixed by the cell's drawn "bed". Tap
  to **flip** it end for end. Some magnets are **glued** (fixed clues). Other
  cells: rock (empty), wood crate (never interacts), steel bowl (always
  pulled by either pole).
- **Contact rules** (d = which way the N end points):
  - End to end (same axis, neighbours along it): **pull iff d₁ = d₂**
    (N meets S).
  - Side by side (same axis, neighbours across it): **pull iff d₁ ≠ d₂**.
  - Magnet next to a steel bowl: **always pull**, whichever end faces it.
    This is induced magnetism, and steel can never push
    ([Geniebook](https://geniebook.com/tuition/secondary-4/physics/magnetism)).
  - Wood: no force. Horizontal next to vertical (a "T" touch) is **not
    generated**, because a pole next to the middle of another magnet has no
    simple push or pull for a child to check **[design]**.
- **Goal card.** Each touching pair is marked **hug** or **push**. Easy:
  everyone hugs. Medium/Hard: a mix.
- **Solver.** One bit per free magnet. Each contact is an equality or
  inequality mod 2: a parity graph. Propagate from glued magnets. The answer
  exists iff no cycle is inconsistent. It is unique iff every connected group
  of magnets (joined by magnet–magnet contacts) holds at least one glued
  magnet. Steel-bowl contacts carry no information, so they do not join
  groups. This takes linear time; a generator can check thousands per
  second.
- **Variety [calc].** 2×2 to 5×5 boards, mixed axes in separate groups, glue
  placement, hug/push masks and wood/steel cells give thousands of boards.
  200 per level is easy. Depth comes from long forced chains and from side
  contacts (which flip the parity).
- **Honest physics.** It uses only the like/unlike rule and the side-by-side
  consequence. It does not claim any force size. Ages 5–13: Easy is a line
  of 2–4 (end to end only); Medium adds side by side; Hard mixes push goals
  and steel bowls.

### 8.2 Ring Tower — flip ring magnets on a pole to match a float/touch silhouette

- **Board.** A vertical pole with n rings (3–8). Each ring has N on top or
  on the bottom; the face letter shows when tapped or peeked. The bottom ring
  is glued. The goal silhouette shows, between each pair, **floating gap** or
  **touching**.
- **Rule.** With b = 1 meaning N on top: ring i and ring i+1 **float** iff
  bᵢ ≠ bᵢ₊₁ (like faces meet), and **touch** iff bᵢ = bᵢ₊₁ **[calc]**.
  Floating from like-pole repulsion is the standard demo
  ([Carleton SERC](https://serc.carleton.edu/sp/mnstep/activities/27124.html);
  [UW MRSEC](https://education.mrsec.wisc.edu/fun-with-magnets/)).
- **Solver.** With the bottom ring fixed, each silhouette has exactly one
  answer: walk up the pole.
- **Hard extension (honest, ordinal only).** "Which gap is smallest?" The
  repulsion falls with distance, so a gap holding more weight above it
  (more rings, counting touching rings as one heavier block) is smaller.
  Answer with the order only, never sizes
  ([Carleton](https://serc.carleton.edu/sp/mnstep/activities/27124.html)
  suggests comparing gaps near the top and bottom;
  [Illinois](https://van.physics.illinois.edu/ask/listing/419) on force vs
  distance). Add **steel washers** (always cling to either face, never
  float) for mixed stacks.
- **Variety [calc].** n = 3..8 gives 2+4+…+128 = 254 silhouettes, before
  washers and "smallest gap" questions. Enough for one chapter per level.
- **Ages:** 5–8 (3–4 rings), 8–13 (6–8 rings with washers).

### 8.3 Which Is the Magnet? — a repulsion-test logic puzzle

- **Board.** 3–5 look-alike bars (meerkat "mystery sticks"). Hidden truth:
  each bar is a **magnet**, **plain iron** or **not magnetic** (aluminium or
  wood, drawn identical). Observation cards show pairs brought together end
  to end: pull, push or nothing.
- **Rules (honest).** Magnet + magnet: pull or push, depending on the ends.
  Magnet + iron: always pull. Iron + iron: nothing. Anything + non-magnetic:
  nothing. **Only magnets can push**
  ([Geniebook](https://geniebook.com/tuition/secondary-4/physics/magnetism);
  [miniphysics](https://www.miniphysics.com/properties-of-magnets.html);
  [cracku NCERT 6 exercise](https://cracku.in/ncert-solutions-for-class-6-science-chapter-4)).
- **Task.** Tap each bar's type. Hard: also mark which end is N, given one
  labelled reference magnet.
- **Solver.** Enumerate 3ⁿ type assignments (plus end bits for magnets) and
  keep the observation sets with exactly one consistent assignment. n ≤ 5
  means 243 × 32 cases at most.
- **Variety.** Observation subsets × n × the end-labelling twist gives far
  more than 200 per level.
- **Why it's strong.** It teaches the deepest idea in the topic (attraction
  is not proof; repulsion is) through pure deduction. It suits ages 8–13.

### 8.4 Reach (smaller mode) — strength vs distance, through materials

- **Board.** A magnet with a **strength** of 1–4 (shown as lightning marks,
  **drawn at any size**) above a row of identical steel paper clips. Between
  them are layers of paper, wood, water, glass or plastic, each one step
  thick.
- **Rule.** A clip jumps iff distance in steps ≤ strength. Non-magnetic
  layers count as distance and **never block**. That is honest for these
  materials ([UBC](https://blogs.ubc.ca/mslangille/?p=188);
  [Oak National Academy](https://thenational.academy/teachers/programmes/science-primary-ks2/units/simple-forces-including-magnets/lessons/blocking-magnetic-force)).
  The force falls with distance
  ([Illinois](https://van.physics.illinois.edu/ask/listing/419)), so an
  integer reach is a fair threshold model when all targets are the same
  clip.
- **Puzzles.** Which clips jump? Which magnet should you use? Big-but-weak
  vs small-but-strong
  ([Cyberphysics](https://cyberphysics.co.uk/PGCE/Misconceptions/magnets.htm)).
  Never use a steel sheet as a barrier: steel redirects the field, which
  needs a richer rule (not sourced here).
- **Variety.** Limited, maybe 60–100 per level. Use it as a chapter, not a
  whole game.

### 8.5 Sticks or Not (smaller mode) — sorting with a fishing magnet

Drag-free: tap each object, tap "sticks" or "doesn't stick", then Go (the
meerkat's fishing magnet sweeps). Use **only SAFE rows** from section 6.1.
Mix metals that stick with metals that don't on every tray, so "metal" never
predicts "sticks". Variety is bounded by the object bank (about 15 SAFE
items); trays of 4–6 give enough for a chapter.

### 8.6 Compass Hunt (Hard extra)

A hidden bar magnet; compasses at three honest spots. On the axis beyond the
N end, the needle's N points away from the magnet. Beyond the S end, the
needle's N points toward the magnet. Beside the middle, the needle's N points
toward the magnet's S end. The field runs N → S outside the magnet
([UC Davis](https://physlab.physics.ucdavis.edu/physlab/ph14e/mfbar.htm)).
The child taps which end is N. Assume the magnet is close enough that Earth's
field does not matter; say so in the hint. Small bank; use it as a bonus.

---

## 9. Magnet Meerkats: hand-made teaching puzzles (in learning order)

| # | Mode | Setup | Answer | Teaches (and the "why" line) |
|---|---|---|---|---|
| M1 | Predict | Two meerkats, end to end: N facing S. "Hug or push?" Go. | Hug. | "Different ends pull together." |
| M2 | Predict | The same, but N facing N. | Push. | "Same ends push apart." |
| M3 | Huddle (Easy) | Two magnets in a line. The left is glued (N → right). Flip the right one so they hug. | The right also points N → right (its S end faces the left N). | Using the rule to act. |
| M4 | Huddle (Easy) | A line of four, the first glued. All hug. | All point the same way. | A chain of hugs: "N meets S all the way along." |
| M5 | Huddle (Medium) | Two magnets **side by side**, one glued. Card: hug. | Point opposite ways. | "Lying side by side, magnets hug when they point opposite ways." |
| M6 | Sticks or Not | Steel paper clip, aluminium foil, copper wire, iron nail, wooden block, plastic spoon. | Clip and nail stick. | "Magnets pull iron and steel, not every metal." |
| M7 | Reach | A magnet of strength 3. Clips at 1, 2, 3 and 4 steps, the layers being paper, wood, water. | Clips at 1–3 jump; the clip at 4 doesn't. | "The pull goes right through paper, wood and water, but it gets weaker the farther it goes." |
| M8 | Reach | A big magnet of strength 1 and a small magnet of strength 3. Which lifts the clip 2 steps away? | The small one. | "Bigger doesn't mean stronger." |
| M9 | Ring Tower | Three rings, bottom glued N-up. Silhouette: float, touch. | Middle ring S-up (floats over N-up); top ring S-up (touches). | "Same faces push, so the ring floats." |
| M10 | Which Is the Magnet? | Look-alike bars A, B, C. Cards: (1) A's left end meets B: **push**. (2) A's left end meets C's top: **pull**. (3) A's **right** end meets the same top of C: **pull**. Tap each bar: magnet / plain iron / not magnetic. | A and B are magnets (only magnets push). C is plain iron: it was pulled by **both** ends of A. A magnet would have pushed one of them. It cannot be "not magnetic", because it was pulled. | "Only a magnet can push another magnet away. Iron gets pulled by both ends." Iron is attracted to both poles ([Exploratorium](https://annex.exploratorium.edu/wsw/progress_snacks/diamagnetism_www/)); repulsion is the sure test ([Geniebook](https://geniebook.com/tuition/secondary-4/physics/magnetism)). |

A warning from drafting M10 **[design]**: the first version used only "A–B
push, A–C pull, B–C pull". That set has **two** answers, because C could also
be a magnet whose ends happened to face opposite poles. Card (3), the same
end of C against both ends of A, removes that. Hand-made logic puzzles go
wrong easily, so every teaching puzzle must also pass the solver.

---

## 10. "Why" lines for six-year-olds (English)

Firefly Circuits:

| Idea | Line |
|---|---|
| Complete loop | "The dots must go all the way round: out of the eel, through the firefly and back in." |
| One wire | "One wire is a road with no way home, so the dots can't move." |
| Two feet | "The dots go in one foot of the firefly and out the other." |
| Not used up | "The same dots come out as go in. The firefly uses the eel's push, not the dots." |
| All at once | "All the dots move together, like a bike chain, so the firefly glows right away." |
| One direction | "The dots all go round the same way, like children on a merry-go-round." |
| Conductor/insulator | "Metal lets the dots through. Wood and rubber don't." |
| Switch | "A switch is a little bridge: closed lets the dots cross, open stops them." |
| Short circuit | "The dots take the easy wire shortcut, so none go through the fireflies. A real battery would get hot, so never try it!" |
| Bypass | "The dots skip that firefly on the plain wire, so it sleeps." |
| Series | "In a row, two fireflies share one eel's push, so both glow dim." |
| Parallel | "Side by side, each firefly gets its own path, so each glows bright." |
| Two eels | "Two eels push twice as hard, enough for two fireflies in a row." |
| Wall socket | "Never put anything in a wall socket. It can hurt you, even with one touch." |

Magnet Meerkats:

| Idea | Line |
|---|---|
| Unlike poles | "Different ends pull together." |
| Like poles | "Same ends push apart." |
| Side by side | "Side by side, magnets hug when they point opposite ways." |
| Which metals | "Magnets pull iron and steel, but not every metal: not aluminium, copper or gold." |
| Not metal | "Wood, plastic and paper don't stick." |
| Through things | "A magnet's pull goes right through paper, wood and water." |
| Distance | "The farther away, the weaker the pull." |
| Size | "Bigger doesn't mean stronger. A small magnet can be the strongest." |
| Repulsion test | "Only a magnet can push another magnet away." |
| Induced | "Iron near a magnet turns into a little magnet for a while, so it gets pulled." |
| Paint | "The colours on a magnet are just paint. N and S tell you the ends." |
| Floating rings | "Same faces push, so the ring floats." |
| Safety (parent note) | "Tiny strong magnets are not toys for little ones. Swallowing them is very dangerous." ([CPSC](https://www.cpsc.gov/Newsroom/News-Releases/2012/cpsc-warns-high-powered-magnets-and-children-make-a-deadly-mix)) |

---

## 11. Spanish terms and regional notes

| English | Recommended Spanish | Regional notes | Source |
|---|---|---|---|
| battery (AA-type cell) | **pila** | *Pila* = not rechargeable and *batería* = rechargeable is one technical split. Usage varies: many speakers say *batería* for big ones (car) and *pila* for AA. Use *pila*, and the eel is the *anguila*. | [Fundación MAPFRE](https://documentacion.fundacionmapfre.org/documentacion/media/group/1017691.do); [Tomísimo forum](https://forums.tomisimo.org/archive/index.php/t-11393.html) (low authority) |
| bulb | **avoid the noun**; say *luciérnaga* and *brilla / se enciende / se apaga / duerme* | *bombilla* (Spain), *foco* (Mexico and much of Latin America), *bombillo* (Colombia, Venezuela, Central America, Caribbean), *ampolleta* (Chile), *bombita / lamparita* (Argentina, Uruguay). *Bombilla* also means the mate straw in the River Plate. | [WordReference](https://jann.wordreference.com/enes/bulb); [Inklingo](https://www.inklingo.app/spanish/dictionary/bombilla); [RAE DHLE, bombillo](https://www.rae.es/dhle/bombillo) |
| circuit (closed / open) | *circuito (cerrado / abierto)* | — | [LEDBOX](https://blog.ledbox.es/como-explicar-la-electricidad-para-ninos) |
| switch | *interruptor* | — | [LEDBOX](https://blog.ledbox.es/como-explicar-la-electricidad-para-ninos); [Junta de Andalucía](https://blogsaverroes.juntadeandalucia.es/laescueladua/files/2026/04/Circuitos-electricos.pdf) |
| conductor / insulator | *conductor / aislante* | — | [LEDBOX](https://blog.ledbox.es/como-explicar-la-electricidad-para-ninos) |
| short circuit | *cortocircuito* | — | (standard; not separately sourced) |
| wire | *cable* | *Alambre* for bare wire in some countries (not sourced; native check) | — |
| magnet | **imán** (pl. *imanes*) | — | [ILCE](https://redescolar.ilce.edu.mx/sitios/proyectos/aventura_ciencias_pri21/doc/exp_magnetismo.pdf) |
| north / south pole | **polo norte / polo sur** (N / S) | The letters N and S match English. | [ILCE](https://redescolar.ilce.edu.mx/sitios/proyectos/aventura_ciencias_pri21/doc/exp_magnetismo.pdf) |
| attract / repel | *se atraen / se repelen* | Kid words: *se juntan* / *se empujan*. "Pull" is *jalar* in much of Latin America and *tirar* in Spain (not sourced; native check). | [ILCE](https://redescolar.ilce.edu.mx/sitios/proyectos/aventura_ciencias_pri21/doc/exp_magnetismo.pdf) |
| paper clip, nail, key | *clip, clavo, llave* | — | [ILCE](https://redescolar.ilce.edu.mx/sitios/proyectos/aventura_ciencias_pri21/doc/exp_magnetismo.pdf) |
| iron, steel, stainless steel, aluminium, copper, brass, gold, silver, nickel, cobalt | *hierro, acero, acero inoxidable, aluminio, cobre, latón, oro, plata, níquel, cobalto* | — | [UAEH](https://www.uaeh.edu.mx/docencia/P_Presentaciones/prepa4/fisica/magnetismo.pdf) (Fe, Ni, Co) |
| compass | *brújula* | — | (standard) |
| meerkat / electric eel / firefly | *suricata / anguila eléctrica / luciérnaga* | — | (PLAN game names) |

Suggested ES "why" lines (for native review, add to SPANISH-REVIEW.md):
"Los extremos distintos se atraen." · "Los extremos iguales se empujan." ·
"Los imanes atraen el hierro y el acero, pero no todos los metales." · "Los
puntitos tienen que dar toda la vuelta: salen de la anguila, pasan por la
luciérnaga y vuelven." · "Nunca unas los dos extremos de una pila de verdad
con un cable: se calienta y quema."

---

## 12. Open items to verify (search budget ran out)

1. **IOP Spark pages** (403 to tools): check in a browser the exact wording
   of "what gets used", "adding a bulb", "rope loop", "many students expect
   all metals…", "Bradamante & Viennot", and "Burgoon et al. 2011".
2. **Osborne 1983 / Shipstone 1985 definitions** of the *sharing* model
   (here taken from Fleer's list and IOP's "shared source" text). Check
   before quoting a definition.
3. **Circuit Scramble's** publisher and platform. Mexican and Canadian coin
   compositions. Whether *alambre* and *jalar/tirar* need regional variants
   in the Spanish text.

---

## Sources

Circuits: research and teaching
- Fleer 1991, *Research in Science Education* 21, 96–103 (lists Shipstone's five models; 3–5-year-olds): https://eclass.upatras.gr/modules/document/file.php/PN1533/2018-2019/%CE%9A%CE%B5%CE%AF%CE%BC%CE%B5%CE%BD%CE%B1%20%CE%B3%CE%B9%CE%B1%20%CF%84%CE%B7%CE%BD%20%CE%B5%CF%81%CE%B3%CE%B1%CF%83%CE%AF%CE%B1%20%22%20%CE%95%CE%BC%CF%80%CE%B5%CE%B9%CF%81%CE%B9%CF%83%CF%84%CE%B9%CE%BA%CE%AD%CF%82%20%CE%B4%CF%81%CE%B1%CF%83%CF%84%CE%B7%CF%81%CE%B9%CF%8C%CF%84%CE%B7%CF%84%CE%B5%CF%82%20%CE%B3%CE%B9%CE%B1%20%CF%84%CE%B1%20%CE%B1%CF%80%CE%BB%CE%AC%20%CE%B7%CE%BB%CE%B5%CE%BA%CF%84%CF%81%CE%B9%CE%BA%CE%AC%20%CF%86%CE%B1%CE%B9%CE%BD%CF%8C%CE%BC%CE%B5%CE%BD%CE%B1%22/1991%20Fleer%20electricity.pdf
- Grotzer & Sudbury, *Causal Patterns in Simple Circuits*, Harvard Project Zero (2004): https://pz.harvard.edu/sites/default/files/SimpleCircuits.pdf
- Victorian science continuum, electric circuits: https://www.education.vic.gov.au/school/teachers/teachingresources/discipline/science/continuum/pages/electriccircuit.aspx
- Métioui, Trudel & Baulu MacWillie 2017: https://www.sustz.com/journal/8/1688.pdf
- Métioui 2012, IATED: https://library.iated.org/view/METIOUI2012CHI
- Shipstone 1984 (record and abstract): https://www.per-central.org/items/detail.cfm?ID=2889
- Osborne 1983 citation: https://ensciencias.uab.cat/article/download/v6-n3-varela-manrique-favieres/2950/22067 ; Osborne 1981 citation: https://informahealthcare.com/doi/ref/10.1080/713694979
- Kada & Ravanis (5–6-year-olds): https://sajournalofeducation.co.za/index.php/saje/article/viewArticle/1233
- Miyazaki University study: https://miyazaki-u.repo.nii.ac.jp/records/69
- WMU dissertation (grades 6–8): https://scholarworks.wmich.edu/dissertations/1513
- IOP Spark (search text): https://spark.iop.org/what-gets-used ; https://spark.iop.org/charged-particles-are-always-there-what-runs-down ; https://spark.iop.org/kucukozer-and-kocakulah-2007 ; https://spark.iop.org/some-students-hold-consumer-source-model-simple-circuit ; https://spark.iop.org/adding-bulb-reduces-current ; https://spark.iop.org/rope-loop-circuit ; https://spark.iop.org/rope-loop-electric-circuit-model ; https://spark.iop.org/thinking-fruitfully-about-circuits ; https://spark.iop.org/systematic-use-teaching-models ; https://spark.iop.org/measuring-electric-currents-student-understanding ; https://spark.iop.org/assembling-teaching-strategy
- Analogies: https://askaboutireland.ie/learning-zone/primary-students/3rd-+-4th-class/science/electricity/teachers-notes/use-of-analogies ; https://science-education-research.com/?p=1474 ; https://www.uwa.edu.au/study/-/media/faculties/science/docs/models-and-misconceptions.pdf
- England curriculum plans: https://herrick.leicester.sch.uk/downloads/curriculum/downloads/Science/TheWholePicture/Year4/Electricity%20-%20Year%204.pdf ; https://herrick.leicester.sch.uk/downloads/curriculum/downloads/Science/TheWholePicture/Year6/Electricity%20-%20Year%206.pdf

Circuits: physics and safety
- PhET CCK-DC tips for teachers: https://phet.colorado.edu/files/teachers-guide/circuit-construction-kit-dc-html-guide_en.pdf
- Series/parallel power: https://scienceres-edcp-educ.sites.olt.ubc.ca/files/2015/01/sec_phys_circuits_series.pdf ; https://cass.ucsd.edu/archive/physics/ph1b/tutorials/tut7.html
- Short circuits: https://comfsm.fm/~dleeling/physci/ps73/lab12photos.html ; https://www.phys.ksu.edu/personal/srebello/research/career/papers/LightBulbPaper.pdf ; https://rolemodels.wise.iastate.edu/uploads/1/9/3/193ec401e4c80d297683eeaab643ceb08b4bb1e6/NEW-Simple-Electric-Circuit.pdf ; https://www.tutorchase.com/answers/ib/physics/how-does-short-circuiting-a-battery-affect-its-health ; https://www.litime.com/blogs/troubleshooting/battery-short-circuits ; https://science.cleapss.org.uk/Resource-Info/Four-AA-Batteries-Short-circuit-Danger.aspx ; https://www.fujitsu.com/downloads/SUPER/manual/Battery_Safety_Note.pdf
- Mains to earth: https://en.wikipedia.org/wiki/Residual-current_device

Circuits: games and design
- ThinkFun Circuit Maze instructions: https://legacy.thinkfun.com/wp-content/uploads/2016/02/CircuMaze-1008-Instructions-1.pdf ; product: https://legacy.thinkfun.com/products/circuit-maze/
- Snap Circuits: https://engineering.purdue.edu/INSPIRE/EngineeringGiftGuide/2021/snap-circuits-light ; https://www.amightygirl.com/snap-circuits-jr-sc-100
- Tinkercad: https://vllc.sd62.bc.ca/node/102 ; https://outreach-hub.aber.ac.uk/InSchool/Engineering/TinkercadCircuits/index.html
- PhET design: https://aapt.org/Conferences/newfaculty/upload/Dubson-PhET_NewFaculty_June2017.pdf ; https://arxiv.org/pdf/1306.6544 ; https://serc.carleton.edu/sp/library/phet/references.html
- Pipes/Net: https://en.wikipedia.org/wiki/Pipes_(puzzle) ; https://www.chiark.greenend.org.uk/~sgtatham/puzzles/java/net.html ; https://www.nearly42.org/vdisk/cstheory/netnpc.pdf
- Electric Box: https://toucharcade.com/2009/08/11/electric-box-an-energy-transmission-puzzler/ ; https://www.appspy.com/review/3388/electric-box ; https://www.buzzfeednews.com/article/expresident/electric-box
- Circuit Scramble listing: https://heraclies.itch.io/circuit-scramble
- Hints and children's puzzle solving: https://faculty.washington.edu/weicaics/paper/papers/HaoHZC2022.pdf ; https://terpconnect.umd.edu/~weintrop/papers/ShokeenEtAl_IJCCI_2024.pdf

Magnets: facts
- Victorian continuum, magnetism: https://www.education.vic.gov.au/school/teachers/teachingresources/discipline/science/continuum/Pages/magnetism.aspx
- Cyberphysics misconceptions: https://cyberphysics.co.uk/PGCE/Misconceptions/magnets.htm
- STEM ITT KS3 magnetism: https://12175.stem.org.uk/resources/ITT/ks3/pdfversion/Topic3_7.pdf
- Exploratorium, Magnetic Fruit: https://annex.exploratorium.edu/wsw/progress_snacks/diamagnetism_www/
- Cans: https://www.suez.co.uk/en-gb/our-offering/communities-and-individuals/education-tools-and-resources/what-happens-to-waste/recycling/cans ; https://www.lancashire.gov.uk/waste-and-recycling/reduce-reuse-recycle/how-we-deal-with-your-waste/what-happens-to-your-recycling/what-happens-to-your-recycling
- Gold, silver, copper: https://sdbullion.com/blog/is-gold-magnetic ; https://sdbullion.com/blog/is-silver-magnetic ; https://robinsonsjewelers.com/blogs/news/is-gold-magnetic ; https://www.vintagecashcow.co.uk/blog/is-gold-magnetic
- Brass and keys: https://www.hunker.com/12000990/how-to-tell-if-a-key-is-made-of-brass ; https://getjerry.com/questions/are-car-keys-magnetic
- Stainless steel: https://www.kloecknermetals.com/blog/what-is-the-difference-between-430-vs-304-stainless-steel/ ; https://essentracomponents.com/en-gb/news/solutions/access-hardware/304-vs-430-stainless-steel
- Coins: https://usmint.gov/learn/coin-specifications ; https://en.wikipedia.org/wiki/Penny_(United_States_coin) ; https://terpconnect.umd.edu/~wbreslyn/magnets/is-nickel-magnetic.html ; https://www.royalmint.com/stories/collect/why-are-some-uk-coins-magnetic/ ; https://lifestyle.royalmint.com/faqs/collectors/what-are-bronze-coins-made-from-why-are-some-magnetic-and-some-not/ ; https://economy-finance.ec.europa.eu/euro/euro-coins-and-notes/euro-coins/common-sides-euro-coins_pt ; https://www.bde.es/f/webbe/EFE/BilletesYMonedas/monedas_en_euros/Monedas_en_euros_2026_ingles.pdf ; https://www.samaterials.com/content/magnetic-response-video-test-of-euro-coins.html
- Repulsion test and induced magnetism: https://geniebook.com/tuition/secondary-4/physics/magnetism ; https://www.miniphysics.com/properties-of-magnets.html ; https://cracku.in/ncert-solutions-for-class-6-science-chapter-4 ; https://web.physics.ucsb.edu/~lecturedemonstrations/Composer/Pages/68.12.html ; https://www.elevise.co.uk/gap7b.html
- Through materials: https://blogs.ubc.ca/mslangille/?p=188 ; https://fyi.extension.wisc.edu/wi4hpublications/files/2015/10/ACTpa122.pdf ; https://thenational.academy/teachers/programmes/science-primary-ks2/units/simple-forces-including-magnets/lessons/blocking-magnetic-force
- Distance: https://en.wikipedia.org/wiki/Magnetic_dipole%E2%80%93dipole_interaction ; https://van.physics.illinois.edu/ask/listing/419
- Ring magnets: https://serc.carleton.edu/sp/mnstep/activities/27124.html ; https://users.rowan.edu/~klassen/dpa/facultyStaff/Docs/physics_demos/EandM_html/magnets.html ; https://education.mrsec.wisc.edu/fun-with-magnets/
- Pole colours and fields: https://extremej15.imascientist.org.uk/question/why-is-the-north-side-of-a-magnet-red-an-dthe-south-blue/ ; https://www.schoolspecialty.com/science-painted-steel-bar-magnets-red-and-blue-568406 ; https://physlab.physics.ucdavis.edu/physlab/ph14e/mfbar.htm ; https://www.walter-fendt.de/html5/phen/magneticfieldbar_en.htm ; https://blogs.ugto.mx/rea/clase-digital-1-magnetismo/
- Magnet safety: https://www.cpsc.gov/Newsroom/News-Releases/2012/cpsc-warns-high-powered-magnets-and-children-make-a-deadly-mix ; https://www.cpsc.gov/node/56557

Magnets: children's ideas and curricula
- IOP Spark (search text): https://spark.iop.org/many-students-expect-all-metals-be-attracted-magnets-and-think-size-magnet-dictates-its-strength ; https://spark.iop.org/burgoon-et-al-2011 ; https://spark.iop.org/key-research-paper-bradamante-and-viennot-2007 ; https://spark.iop.org/some-students-may-associate-magnetism-gravity-seeing-one-cause-other-andor-think-both-require ; https://spark.iop.org/many-students-think-magnets-stick-specific-objects-instead-understanding-attractive-force-acts ; https://spark.iop.org/many-students-are-slow-adopt-idea-magnetic-poles-and-only-gradually-come-see-magnetic-effects-terms
- NSTA, Early Years: https://www.nsta.org/early-years-exploring-magnetism
- Studies: https://ftkjournal-uinmataram.id/index.php/elmidad/article/view/14905 ; https://ppjp.ulm.ac.id/journal/index.php/bipf/article/download/23872/pdf ; https://drum.lib.umd.edu/collections/ec2ea634-b1e8-4ce7-a2fc-f75a9cd1b12c/browse/title ; https://so02.tci-thaijo.org/index.php/human_ubu/article/view/85406 ; https://www.eu-jer.com/physics-students-conceptual-understanding-of-electricity-and-magnetism-in-nine-years-basic-education-in-rwanda ; https://researchportal.murdoch.edu.au/esploro/outputs/journalArticle/The-attraction-of-magnetism/991005541561607891 ; https://arxiv.org/pdf/physics/0503132 ; https://www.tused.org/index.php/tused/article/view/1241
- Curricula: https://herrick.leicester.sch.uk/downloads/curriculum/downloads/Science/TheWholePicture/Year3/Forces%20and%20Magnetism%20-%20Year%203.pdf ; https://www.churchill.kent.sch.uk/science ; https://nyssls.info/index.php/3-PS2-4 ; https://www.amnh.org/content/download/207881/3087761/file/NGSS-AMNH-CARD-DECK-3-PS2.pdf

Spanish
- https://jann.wordreference.com/enes/bulb ; https://www.inklingo.app/spanish/dictionary/bombilla ; https://www.rae.es/dhle/bombillo ; https://documentacion.fundacionmapfre.org/documentacion/media/group/1017691.do ; https://forums.tomisimo.org/archive/index.php/t-11393.html ; https://blog.ledbox.es/como-explicar-la-electricidad-para-ninos ; https://blogsaverroes.juntadeandalucia.es/laescueladua/files/2026/04/Circuitos-electricos.pdf ; https://redescolar.ilce.edu.mx/sitios/proyectos/aventura_ciencias_pri21/doc/exp_magnetismo.pdf ; https://www.uaeh.edu.mx/docencia/P_Presentaciones/prepa4/fisica/magnetismo.pdf
