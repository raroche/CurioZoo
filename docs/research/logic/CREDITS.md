# Logic Games: credits and sources

Everything in the Logic Games room is our own: the puzzles are made by code
from fixed seeds, and the rule text, the wording and the pictures were written
here. These are the ideas it borrows and the facts it states.

## Puzzle types

| Game | The idea comes from | Status |
|---|---|---|
| Crack the Code | Bulls and Cows, a pencil-and-paper game older than Mastermind. Known in Spanish as *Picas y Fijas* or *Toros y Vacas*. | Folk game, free to use. The name "Mastermind" is a registered trademark and is not used. |
| Crack the Code, chapter m4 | The "682" lock puzzle (answer 042), which has circulated online for years with no known author. Puzzle m4-01 uses its five clues. | Folk puzzle |
| Truth Island | The knights-and-knaves genre, popularised by Raymond Smullyan (*What Is the Name of This Book?*, 1978). Every puzzle is made by our generator; none of his puzzles or text is used. "Sun" and "Moon" animals are our own names. | Genre only |
| Find the Rule | The family of *Logical Journey of the Zoombinis* (TERC, 1996; "Allergic Cliffs"), Kory Heath's *Zendo*, and Bongard problems. The counterexample answer to a wrong rule is Zendo's idea. Every creature, rule and puzzle here is our own. | Ideas only |
| Zoo Bridges | A puzzle type first published by Nikoli (Japan, 1990) as *Hashiwokakero*. The grid notation and the "grow islands" generator follow Simon Tatham's *Bridges* (MIT licence), written fresh here; no code was copied. Our name, rules text and pictures. | Puzzle type |
| Train Tracks | Ideas from Bebras tasks ("Railroad" 2018, "Freight Train" 2014, "Train Tracks" 2021; CC BY-SA 4.0), the Digi-Comp II and Turing Tumble flip-flops, and Knuth's railway stack sort (*The Art of Computer Programming*, vol. 1). Mechanics only: no Bebras text or picture is used, and every layout is generated here. | Ideas only |
| Robot Path, Fix the Bug | Ideas from Lightbot (procedure rows with slot limits), Code.org CS Fundamentals (block limits, its four debugging bug types), Kodable (screen arrows for pre-readers, colour tiles), Robot Turtles, and Ahmed et al., "Synthesizing Tasks for Block-based Programming" (NeurIPS 2020) for program-first level making. Every board, tile and program here is our own. | Ideas only |
| Crack the Code, "Clue Safe" mode | Math Garden's *Deductive Mastermind* / Flowercode (Gierasimczuk, van der Maas and Raijmakers), where the child deduces the code from given clues. The format is borrowed, not their items. | Idea only |

## Animal facts (Crack the Code zoo map)

Each fact in `assets/js/modules/codetext.js` (`fact.*`) was checked against
these on 2026-10-02.

| Animal | Fact | Source |
|---|---|---|
| Lion | A roar can be heard about 8 km (5 miles) away | [Cleveland Zoo Society](https://www.clevelandzoosociety.org/z/2020/02/23/truth-or-tail-a-lions-roar-can-be-heard-5-miles-away), [IFAW](https://www.ifaw.org/journal/facts-about-lions) |
| Monkey | Some monkeys hang from a branch by their tail | [Saint Louis Zoo, black-handed spider monkey](https://stlzoo.org/animals/mammals/lemurs-monkeys-apes/black-handed-spider-monkey), [Britannica](https://www.britannica.com/animal/spider-monkey) |
| Frog | Most frogs soak up water through their skin instead of drinking | [Hepper (vet-reviewed)](https://www.hepper.com/do-frogs-drink-water/) |
| Penguin | Penguins "fly" under water with their flippers | [The Conversation, Curious Kids](https://theconversation.com/curious-kids-do-penguins-fly-underwater-162994), [WHOI](https://www.whoi.edu/ocean-learning-hub/multimedia/flying-in-water/) |
| Zebra | No two zebras have the same stripes | [San Diego Zoo Wildlife Alliance, "Learning Their Lines"](https://stories.sdzwa.org/?p=128378) |
| Flamingo | Pink from the pigments in the algae and shrimp they eat | [Live Science](https://livescience.com/32968-why-are-flamingos-pink.html) |
| Owl | Can turn its head about three quarters of the way round (270°) | [Smithsonian Magazine, on the Johns Hopkins study](https://www.smithsonianmag.com/science-nature/solving-the-mystery-of-owls-head-turning-abilities-9561557/) |
| Turtle | The shell is part of the skeleton, grown from ribs and backbone | [Smithsonian Magazine](https://www.smithsonianmag.com/smithsonian-institution/how-turtle-got-its-shell-apologies-aesop-180972929) |
| Elephant | The trunk has no bones and tens of thousands of muscles | [Cleveland Zoo Society](https://www.clevelandzoosociety.org/z/2023/06/26/truth-or-tail-an-elephants-trunk-has-over-40000-muscles), [Humboldt University Berlin](https://www.hu-berlin.de/nachrichten/detail/dexterous-elephants) |
| Giraffe | Seven neck bones, the same number as a person | [Snopes](https://www.snopes.com/fact-check/giraffes-neck-bones-humans/), [Save Giraffes Now](https://savegiraffesnow.org/how-many-vertebrae-do-giraffes-have/) |
| Panda | Spends about 10 to 16 hours a day eating | [Smithsonian's National Zoo](https://nationalzoo.si.edu/animals/news/keep-national-zoos-pandas-satisfied-staff-prepare-endless-supply-bamboo) |
| Hippo | Cannot really swim; walks and bounces along the river bottom | [Londolozi](https://blog.londolozi.com/2021/10/07/can-hippos-swim/), [Snopes](https://www.snopes.com/fact-check/hippos-dense-swim/) |

