# Food chains research: Sun to Lion / Del sol al león

Research for the CurioZoo food-chain game (ages 5–13, EN/ES, tap-only, zoo theme). Every chain starts at the Sun. The child taps living things into arrow slots, and each arrow means **"gives food (energy) to"**. Example: Sun → grass → zebra → lion. Later levels add food webs, "remove one, who goes hungry?", decomposers, and sorting by role.

Status notes (researched 2026-10-09):
- Every fact carries a URL or a source key. The keys are listed in §1.0 and again in the Sources list at the end.
- **[F]** means I opened and read the page. **[S]** means the claim comes only from the search-result text of the page, either because the page was blocked (403, bot wall or JS-only) or because I did not open it. Re-check [S] items before shipping data that depends on them.
- Link status in the tables:
  - **OK**: a normal, well-documented diet item. Safe for every level.
  - **LESS**: true, but uncommon (for example, only some groups do it, or only young animals are taken). Use from level 4 up. Never use it as a decoy.
  - **AVOID**: contested, rare, unverified, or not gentle. Never show it as a correct answer, and never use it as a "wrong" decoy either (it might be true).
- **Gentleness.** The game only ever says "eats" or "gives food to". It never says hunt, kill, attack or blood. Links that are only true for babies or eggs are marked AVOID even when they are documented.
- **Spanish names** are my standard renderings, with regional variants noted. They need a native review, as with the Logic Games room (`docs/research/logic/SPANISH-REVIEW.md`).
- **Emoji** come from my knowledge of the Unicode emoji list (approximate year in brackets, so you can decide on support for older devices). Verify them against https://unicode.org/emoji/charts/emoji-versions.html. "≈" means a stand-in, not the real animal (for example 🐃 for wildebeest). Prefer custom SVG art where only a stand-in exists.
- The web-search budget ran out near the end, so I could not trace a Bebras food-chain task or BrainPOP game details (§4).

---

## 0. Ten traps to design around (quick list)

| # | Trap | Truth (source) |
|---|---|---|
| 1 | Polar bears and penguins together | They never meet in the wild. Polar bears live only in the Arctic, and most penguins only in the far south. Never put them in the same chain. Polar bear range: SDZ-polarbear [F]. Penguins: ADW-emperor, ADW-adelie [F]. A children's book on the topic says they "never, ever meet": https://www.fantasticfiction.com/p/gabrielle-prendergast/dear-polar-bears.htm [S] |
| 2 | "Lions don't eat giraffes" | They do, sometimes. "Some prides tend to target large prey" such as buffalo and giraffe (ADW-lion [F]). "Besides humans, only lions and crocodiles hunt them" (SDZ-giraffe [F]). Status: **LESS**. |
| 3 | "Lions eat elephants" | Only young elephants (SDZ-lion [F]). **AVOID**: rare, and not gentle. |
| 4 | Hyenas only scavenge | False. In a Kalahari study, 70% of the diet was the hyenas' own kills, and about 80% of Serengeti/Ngorongoro samples held wildebeest, zebra or gazelle (ADW-hyena [F]). |
| 5 | The crabeater seal eats crabs | "There is no evidence that it eats crabs." It eats krill (ADW-crabeater [F]). A great "surprise" card. |
| 6 | Leafcutter ants eat leaves | False. They farm a fungus on the leaves and eat the fungus (STRI via EurekAlert [S]; Smithsonian Magazine [S]). |
| 7 | Pandas are not bears / eat meat | Pandas are bears (DNA studies), and bamboo is about 99% of their diet (SDZ-panda [F]). |
| 8 | Orcas eat krill | No. Orca diets depend on the population: fish, seals, sea lions, whales, and Antarctic seals or toothfish (NOAA-orca [F]). Krill-eaters are baleen whales, seals, penguins and fish (ADW-krill [F]). |
| 9 | Monarch caterpillar or ladybug → bird | Both are chemically defended: monarchs are "poisonous to vertebrates" (ADW-monarch [F]), and ladybirds make chemicals "highly toxic to many common beetle predators like birds" (ADW-ladybird [F]). **AVOID** as links. |
| 10 | "Plants eat soil" | Plant matter comes "mostly from air and water, not from the soil" (NGSS 5-LS1-1 [F]). Soil gives water and minerals. A soil tile must never fill a "gives food to" slot. See §2 and §3.1. |

---

## 1. Ecosystems, species and true "eats" links

### 1.0 Source keys used in the tables

| Key | URL |
|---|---|
| SDZ-lion | https://animals.sandiegozoo.org/animals/lion [F] |
| SDZ-zebra | https://animals.sandiegozoo.org/animals/zebra [F] |
| SDZ-giraffe | https://animals.sandiegozoo.org/animals/giraffe [F] |
| SDZ-cheetah | https://animals.sandiegozoo.org/animals/cheetah [F] |
| SDZ-warthog | https://animals.sandiegozoo.org/animals/warthog [F] |
| SDZ-elephant | https://animals.sandiegozoo.org/animals/elephant [F] |
| SDZ-dungbeetle | https://animals.sandiegozoo.org/animals/dung-beetle [F] |
| SDZ-polarbear | https://animals.sandiegozoo.org/animals/polar-bear [F] |
| SDZ-jaguar | https://animals.sandiegozoo.org/animals/jaguar [F] |
| SDZ-capybara | https://animals.sandiegozoo.org/animals/capybara [F] |
| SDZ-toucan | https://animals.sandiegozoo.org/animals/toucan [F] |
| SDZ-harpy | https://animals.sandiegozoo.org/animals/harpy-eagle [F] |
| SDZ-panda | https://animals.sandiegozoo.org/animals/giant-panda [F] |
| SDZ-meerkat | https://animals.sandiegozoo.org/animals/meerkat [F] |
| SDZ-scorpion | https://animals.sandiegozoo.org/animals/scorpion [F] |
| ADW-lion | https://animaldiversity.org/accounts/Panthera_leo/ [F] |
| ADW-wildebeest | https://animaldiversity.org/accounts/Connochaetes_taurinus/ [F] |
| ADW-hyena | https://animaldiversity.org/accounts/Crocuta_crocuta/ [F] |
| ADW-gazelle | https://animaldiversity.org/accounts/Eudorcas_thomsonii/ [F] |
| ADW-buffalo | https://animaldiversity.org/accounts/Syncerus_caffer/ [F] |
| ADW-krill | https://animaldiversity.org/accounts/Euphausia_superba/ [F] |
| ADW-leopardseal | https://animaldiversity.org/accounts/Hydrurga_leptonyx/ [F] |
| ADW-crabeater | https://animaldiversity.org/accounts/Lobodon_carcinophaga/ [F] |
| ADW-weddell | https://animaldiversity.org/accounts/Leptonychotes_weddellii/ [F] |
| ADW-emperor | https://animaldiversity.org/accounts/Aptenodytes_forsteri/ [F] |
| ADW-adelie | https://animaldiversity.org/accounts/Pygoscelis_adeliae/ [F] |
| NOAA-orca | https://www.fisheries.noaa.gov/species/killer-whale [F] |
| NOAA-humpback | https://www.fisheries.noaa.gov/species/humpback-whale [F] |
| ADW-ringedseal | https://animaldiversity.org/accounts/Pusa_hispida/ [F] |
| ADW-arcticfox | https://animaldiversity.org/accounts/Vulpes_lagopus/ [F] |
| ADW-snowyowl | https://animaldiversity.org/accounts/Nyctea_scandiaca/ [F] |
| ADW-arctichare | https://animaldiversity.org/accounts/Lepus_arcticus/ [F] |
| LEM | Lemmings: https://www.oneearth.org/species-of-the-week-norway-lemming/ [S]; https://adfg.alaska.gov/static/education/wns/lemmings.pdf [S]; https://blog.nature.org/2014/01/21/the-amazing-lemming-the-rodent-behind-the-snowy-owl-invasion/ [S] |
| ACOD | Arctic cod web: https://journalhosting.ucalgary.ca/index.php/arctic/article/view/65355 [S]; https://mspace.lib.umanitoba.ca/items/42225d09-0f2c-4992-9035-10bfd1d5e9ed/full [S]; Pew 2014: https://www.pewtrusts.org/-/media/assets/2014/life_in_emerging_ocean_webfinal.pdf [S] |
| ADW-sloth | https://animaldiversity.org/accounts/Bradypus_variegatus/ [F] |
| ADW-howler | https://animaldiversity.org/accounts/Alouatta_palliata/ [F] |
| LEAF | Leafcutter ants: https://www.eurekalert.org/multimedia/866096 [S]; https://www.smithsonianmag.com/science-nature/small-matters-62475975/ [S]; https://www.kqed.org/science/41112/where-are-the-ants-carrying-all-those-leaves [S] |
| NOAA-reef | NOAA Sanctuaries coral-reef lesson plan (2023): https://sanctuaries.noaa.gov/media/docs/20231129-coral-reef-lesson-plan.pdf [F] (I read the text with pdftotext) |
| NOAA-greenturtle | https://www.fisheries.noaa.gov/species/green-turtle [F] |
| ADW-parrotfish | https://animaldiversity.org/accounts/Scaridae/ [F] |
| ADW-clownfish | https://animaldiversity.org/accounts/Amphiprion_ocellaris/ [F] |
| ADW-whitetip | https://animaldiversity.org/accounts/Triaenodon_obesus/ [F] |
| ADW-tigershark | https://animaldiversity.org/accounts/Galeocerdo_cuvier/ [F] |
| ADW-octopus | https://animaldiversity.org/accounts/Octopus_vulgaris/ [F] |
| KELP | https://news.ucsc.edu/2021/03/kelp-forests-monterey/ [S]; https://wildlife.org/monterey-bay-sea-otters-maintain-kelp-supply/ [S] |
| ADW-bullfrog | https://animaldiversity.org/accounts/Lithobates_catesbeianus/ [F] |
| ADW-heron | https://animaldiversity.org/accounts/Ardea_herodias/ [F] |
| ADW-mallard | https://animaldiversity.org/accounts/Anas_platyrhynchos/ [F] |
| ADW-bluegill | https://animaldiversity.org/accounts/Lepomis_macrochirus/ [F] |
| DRAGON | Dragonfly nymphs: https://www.beyondpesticides.org/assets/media/documents/TrackingBiodiversity-Dragonflies.PAY.fall18-web.pdf [S]; Fairfax County field guide p.74: https://www.fairfaxcounty.gov/publicworks/sites/publicworks/files/assets/fieldguide/files/basic-html/page74.html [S] (404 when fetched) |
| ADW-deer | https://animaldiversity.org/accounts/Odocoileus_virginianus/ [F] |
| ADW-squirrel | https://animaldiversity.org/accounts/Sciurus_carolinensis/ [F] |
| ADW-cottontail | https://animaldiversity.org/accounts/Sylvilagus_floridanus/ [F] |
| ADW-redfox | https://animaldiversity.org/accounts/Vulpes_vulpes/ [F] |
| ADW-ghowl | https://animaldiversity.org/accounts/Bubo_virginianus/ [F] |
| ADW-wolf | https://animaldiversity.org/accounts/Canis_lupus/ [F] |
| ADW-blackbear | https://animaldiversity.org/accounts/Ursus_americanus/ [F] |
| ADW-jackrabbit | https://animaldiversity.org/accounts/Lepus_californicus/ [F] |
| ADW-krat | https://animaldiversity.org/accounts/Dipodomys_merriami/ [F] |
| ADW-roadrunner | https://animaldiversity.org/accounts/Geococcyx_californianus/ [F] |
| ADW-rattler | https://animaldiversity.org/accounts/Crotalus_atrox/ [F] |
| ADW-tortoise | https://animaldiversity.org/accounts/Gopherus_agassizii/ [F] |
| ADW-prairiedog | https://animaldiversity.org/accounts/Cynomys_ludovicianus/ [F] |
| NZP-ferret | https://nationalzoo.si.edu/animals/black-footed-ferret [F] |
| ADW-bison | https://animaldiversity.org/accounts/Bison_bison/ [F] |
| MEADOW | Cornell All About Birds, Western Meadowlark food: https://www.allaboutbirds.org/guide/Western_Meadowlark/food [S] (403 when fetched); Audubon: https://audubon.org/field-guide/bird/western-meadowlark [S] |
| WIKI-grasshopper | https://en.wikipedia.org/wiki/Grasshopper [F] |
| ADW-robin | https://animaldiversity.org/accounts/Turdus_migratorius/ [F] |
| ADW-ladybird | https://animaldiversity.org/accounts/Coccinella_septempunctata/ [F] |
| APHID | UGA Extension C1246: https://fieldreport.caes.uga.edu/publications/C1246/ [S]; Univ. Kentucky EF702: https://entomology.ca.uky.edu/files/ef702.pdf [S] |
| ADW-hedgehog | https://animaldiversity.org/accounts/Erinaceus_europaeus/ [F] |
| RSPB-thrush | https://www.rspb.org.uk/birds-and-wildlife/song-thrush [F] |
| WIKI-snail | https://en.wikipedia.org/wiki/Cornu_aspersum [F] |
| ADW-monarch | https://animaldiversity.org/accounts/Danaus_plexippus/ [F] |
| NG-decomp | https://education.nationalgeographic.org/resource/decomposers [F] |
| NHPBS-decomp | https://natureworks.nhpbs.org/concepts/decomposers/ [F] |
| NG-chain | https://education.nationalgeographic.org/resource/food-chain [F] |

Notation: **A ← B** means "A eats B". In the game, the arrow goes **B → A** ("B gives food to A").

---

### 1.1 African savanna (zoo anchor: "Sun to Lion")

| id | English | Español | Emoji | Role |
|---|---|---|---|---|
| grass | grass | pasto / hierba | 🌾≈ / 🌱 | producer |
| acacia | acacia tree | acacia | 🌳 | producer |
| zebra | zebra | cebra | 🦓 (2017) | herbivore |
| wildebeest | wildebeest | ñu | none (🐃≈) | herbivore |
| gazelle | Thomson's gazelle | gacela de Thomson | none (🦌≈) | herbivore |
| giraffe | giraffe | jirafa | 🦒 (2017) | herbivore |
| elephant | African elephant | elefante africano | 🐘 | herbivore |
| buffalo | African buffalo | búfalo africano (búfalo cafre) | 🐃≈ | herbivore |
| warthog | warthog | facóquero (jabalí verrugoso) | 🐗≈ | mostly plants (also "even dead animals"). Keep it out of role-sorting. |
| lion | lion | león | 🦁 | carnivore |
| cheetah | cheetah | guepardo | 🐆≈ | carnivore |
| hyena | spotted hyena | hiena manchada | none | carnivore |
| dungbeetle | dung beetle | escarabajo pelotero | 🪲 (2020) | recycler |

| Link (A ← B) | Status | Source |
|---|---|---|
| zebra ← grass | OK | "feed mostly by grazing on grasses" (SDZ-zebra) |
| wildebeest ← grass | OK | "rapidly growing colonial grasses" (ADW-wildebeest) |
| gazelle ← grass | OK | "graze mainly on short grasses" (ADW-gazelle) |
| gazelle ← acacia | LESS | twigs, seeds and leaves, including *Acacia*, mainly in the dry season (ADW-gazelle) |
| giraffe ← acacia | OK | "Their favorite leaves are from acacia trees" (SDZ-giraffe) |
| elephant ← grass | OK | savanna elephants "eat grasses…leaves, shrubs, and small- to medium-size trees" (SDZ-elephant) |
| elephant ← acacia | LESS | the source says "trees", not acacia by name. Use a generic "tree" tile instead (SDZ-elephant) |
| buffalo ← grass | OK | "grazing ruminants"; grass leaves dominate (ADW-buffalo) |
| warthog ← grass | OK | "grass, roots, berries, tree bark" (SDZ-warthog) |
| lion ← zebra | OK | zebra is a main prey (ADW-lion) |
| lion ← wildebeest | OK | ADW-lion; lions are a major predator (ADW-wildebeest) |
| lion ← buffalo | OK | the main predator of buffalo over a year old (ADW-buffalo); SDZ-lion |
| lion ← gazelle | OK | ADW-lion; ADW-gazelle |
| lion ← warthog | OK | one of seven main Serengeti prey (ADW-lion); SDZ-warthog |
| lion ← giraffe | LESS | "some prides" (ADW-lion); SDZ-giraffe |
| lion ← elephant | AVOID | young elephants only (SDZ-lion) |
| lion ← hyena | AVOID | lions kill hyenas as competitors (13 of 24 carcasses in one study) but that is not feeding (ADW-hyena) |
| cheetah ← gazelle | OK | "antelope (usually Thompson's gazelles)" (SDZ-cheetah) |
| cheetah ← warthog | OK | SDZ-warthog |
| cheetah ← wildebeest | LESS | listed as a predator (ADW-wildebeest); mothers often defend calves |
| cheetah ← zebra | AVOID | no source |
| hyena ← wildebeest / zebra / gazelle | OK | ~80% of samples (ADW-hyena) |
| hyena ← warthog | OK | SDZ-warthog |
| hyena ← buffalo | AVOID | hyenas "generally avoid buffalo" (ADW-buffalo) |
| dungbeetle ← dung (of zebra, elephant…) | OK (recycler link) | the "nutritious soup" in herbivore manure; burying dung lets them "loosen and nourish the soil" (SDZ-dungbeetle) |

---

### 1.2 Polar Southern Ocean (Antarctica). Penguins live here; no polar bears.

| id | English | Español | Emoji | Role |
|---|---|---|---|---|
| phyto | phytoplankton (tiny drifting plants) | fitoplancton | none (custom art) | producer |
| icealgae | ice algae | algas del hielo | none | producer |
| krill | Antarctic krill | kril antártico | 🦐≈ | plant-eater ("the dominant herbivore of the Southern Ocean", ADW-krill) |
| silverfish | Antarctic silverfish | pez plateado antártico | 🐟 | carnivore |
| squid | squid | calamar | 🦑 | carnivore |
| adelie | Adélie penguin | pingüino de Adelia | 🐧 | carnivore |
| emperor | emperor penguin | pingüino emperador | 🐧 | carnivore |
| crabeater | crabeater seal | foca cangrejera | 🦭 (2020) | carnivore (krill) |
| weddell | Weddell seal | foca de Weddell | 🦭 | carnivore |
| leopardseal | leopard seal | foca leopardo | 🦭 | carnivore |
| humpback | humpback whale | ballena jorobada | 🐋 | carnivore (krill and small fish) |
| orca | orca (killer whale) | orca | none (🐋≈) | carnivore (top predator) |

| Link | Status | Source |
|---|---|---|
| krill ← phyto | OK | "primarily planktivores"; phytoplankton is listed as food (ADW-krill). Diatoms dominate krill gut DNA: https://www.int-res.com/articles/meps2018/595/m595p039.pdf [S] |
| krill ← icealgae | OK | in winter they "rely heavily on ice algae" (ADW-krill) |
| adelie ← krill | OK | krill is the "primary food source" (ADW-adelie) |
| emperor ← silverfish | OK | Antarctic silverfish is among the most frequent prey (ADW-emperor) |
| emperor ← krill / squid | OK | ADW-emperor |
| silverfish ← krill | OK | listed as a krill predator (ADW-krill) |
| squid ← krill | OK | listed as a krill predator (ADW-krill) |
| crabeater ← krill | OK | main food is krill; "no evidence that it eats crabs" (ADW-crabeater) |
| humpback ← krill | OK | "small crustaceans (mostly krill) and small fish" (NOAA-humpback). Humpbacks also live in other oceans, so tag the species to more than one ocean. |
| weddell ← fish / squid | OK | "notothenid fishes, squids, and crustaceans" (ADW-weddell) |
| leopardseal ← krill | OK | krill is the primary food (ADW-leopardseal) |
| leopardseal ← penguins | OK | ADW-leopardseal; the most common Adélie predator (ADW-adelie) |
| leopardseal ← young crabeater seals | AVOID | not gentle (ADW-leopardseal) |
| orca ← seals (weddell, crabeater) | OK | Antarctic orcas eat "minke whales, seals, or Antarctic toothfish" (NOAA-orca); listed as a predator (ADW-weddell, ADW-crabeater) |
| orca ← emperor penguin | LESS | ADW-emperor |
| orca ← leopard seal | AVOID | "rarely eaten" (ADW-leopardseal) |
| orca ← krill | FALSE (a safe decoy) | not an orca food (NOAA-orca; ADW-krill's predator list) |
| polar bear ← anything here | FALSE (a geography decoy) | §0 trap 1 |

---

### 1.3 Arctic (sea ice and tundra). Polar bears live here; no penguins.

| id | English | Español | Emoji | Role |
|---|---|---|---|---|
| icealgae | ice algae / phytoplankton | algas del hielo / fitoplancton | none | producer |
| copepod | copepods (zooplankton) | copépodos (zooplancton) | none | plant-eater |
| arcticcod | Arctic cod | bacalao ártico | 🐟 | carnivore |
| ringedseal | ringed seal | foca anillada | 🦭 | carnivore |
| beluga | beluga whale | beluga | none (🐋≈) | carnivore |
| polarbear | polar bear | oso polar | 🐻‍❄️ (2020) | carnivore |
| sedge | grasses, sedges and moss | pastos, juncias y musgo | 🌱 | producer |
| willow | Arctic (dwarf) willow | sauce ártico (enano) | 🌿≈ | producer |
| lemming | lemming | lemming (lémming) | none (🐹≈) | herbivore |
| arctichare | Arctic hare | liebre ártica | 🐇 | herbivore |
| arcticfox | Arctic fox | zorro ártico | 🦊 | omnivore ("practically any animal, alive or dead"; berries) |
| snowyowl | snowy owl | búho nival | 🦉 | carnivore |

| Link | Status | Source |
|---|---|---|
| copepod ← icealgae / phyto | OK | spring algae blooms are "a critical pulse of energy" for the web, from zooplankton up (ACOD, Pew) |
| arcticcod ← copepod | OK | cod eat ice amphipods, copepods and zooplankton; cod are "the major link" between zooplankton and the top carnivores (ACOD) |
| ringedseal ← arcticcod | OK | Arctic cod is a key summer prey (ADW-ringedseal) |
| beluga ← arcticcod | OK | a major consumer of cod (ACOD, Manitoba review) |
| polarbear ← ringedseal | OK | "Ringed seals are a polar bear's main prey" (SDZ-polarbear); ADW-ringedseal |
| polarbear ← walrus / beached whale / seaweed | AVOID | the bear "eat[s] just about anything", but these foods are not reliable nutrition (SDZ-polarbear) |
| arcticfox ← polar bear leftovers | LESS | foxes "mainly scavenge carcasses left by polar bears" (ADW-ringedseal). Good for "leftovers" and decomposer talk. |
| arcticfox ← seal pups | AVOID | not gentle |
| lemming ← sedge / grass / moss | OK | summer: grass shoots, herbs and sedges; winter: moss, bark, willow twigs (LEM) |
| arcticfox ← lemming | OK | inland and summer diets "rely mostly on lemmings" (ADW-arcticfox) |
| snowyowl ← lemming | OK | main foods are lemmings and mice (ADW-snowyowl) |
| arctichare ← willow | OK | "Willow constitutes 95% of their diet in every season" (ADW-arctichare) |
| arcticfox / snowyowl / wolf ← arctichare | LESS | listed as predators (ADW-arctichare) |
| penguin ← anything here | FALSE (a geography decoy) | §0 trap 1 |

Fact for the removal level: snowy owl nesting and fox pup survival track lemming numbers. Outside "lemming years", owls and foxes raise very few young (LEM, TNC blog [S]). This is a real "if the lemmings go, who goes hungry?" story.

---

### 1.4 Tropical rainforest (Central and South America), plus a bamboo forest card (China)

| id | English | Español | Emoji | Role |
|---|---|---|---|---|
| cecropia | cecropia tree | cecropia (yarumo, guarumo) | 🌳 | producer |
| fruittree | fruit trees | árboles frutales | 🌳 / 🍈≈ | producer |
| riverplants | grass and water plants | pasto y plantas acuáticas | 🌿 | producer |
| sloth | three-toed sloth | perezoso de tres dedos | 🦥 (2019) | herbivore |
| howler | howler monkey | mono aullador | 🐒 | herbivore |
| capybara | capybara | capibara (carpincho, chigüiro) | none | herbivore |
| toucan | toucan | tucán | none (🐦≈) | omnivore (mostly fruit) |
| leafcutter | leafcutter ant | hormiga cortadora de hojas (zompopo, arriera) | 🐜 | fungus farmer |
| fungus | fungus (mushroom) | hongo | 🍄 | decomposer |
| harpy | harpy eagle | águila arpía | 🦅 | carnivore |
| jaguar | jaguar | jaguar | 🐆≈ | carnivore |
| caiman | spectacled caiman | caimán de anteojos (babilla) | 🐊≈ | carnivore |
| bamboo | bamboo | bambú | 🎋≈ | producer (bamboo forest card) |
| panda | giant panda | panda gigante | 🐼 | plant-eater (a bear!) |

| Link | Status | Source |
|---|---|---|
| sloth ← cecropia | OK | feeds mainly on *Cecropia* leaves, flowers and fruit (ADW-sloth) |
| howler ← leaves / fruit (fruittree, cecropia) | OK | "leaves, fruit, and flowers" (ADW-howler) |
| capybara ← riverplants | OK | "grazing on grass and water plants" (SDZ-capybara) |
| toucan ← fruittree | OK | "primarily frugivores" (SDZ-toucan) |
| toucan ← insects / frogs / lizards | OK | this is why the toucan is an omnivore (SDZ-toucan) |
| harpy ← sloth | OK | "monkeys and sloths" (SDZ-harpy); ADW-sloth |
| harpy ← howler | OK | SDZ-harpy (monkeys). Note: ADW-howler does not name predators. |
| jaguar ← capybara | OK | "Adult capybaras have one main natural predator—the jaguar" (SDZ-capybara); SDZ-jaguar |
| jaguar ← caiman | OK | jaw strength lets them "eat spectacled caimans" (SDZ-jaguar) |
| jaguar ← sloth | AVOID | ADW-sloth says only "felid species"; SDZ-jaguar does not list sloths |
| jaguar ← toucan | AVOID | jaguars raid nests (eggs), not adults (SDZ-toucan) |
| caiman ← young capybara | AVOID | young animals only (SDZ-capybara) |
| fungus ← leaves (inside the ant nest) | OK | the ants feed leaf pieces to their fungus garden (LEAF) |
| leafcutter ← fungus | OK | "the ants eat the fungus, not the leaves" (LEAF) |
| leafcutter ← leaves | FALSE (a misconception decoy, older levels) | LEAF. They only drink some sap (KQED [S]). |
| panda ← bamboo | OK | about 99% of the diet (SDZ-panda) |
| anything ← adult panda | AVOID | only cubs are taken, by golden cats, martens and dholes (SDZ-panda) |

---

### 1.5 Coral reef (plus a kelp-forest mini card)

| id | English | Español | Emoji | Role |
|---|---|---|---|---|
| phyto | phytoplankton | fitoplancton | none | producer |
| algae | algae | algas | 🌿≈ | producer |
| seagrass | seagrass | pasto marino | 🌱≈ | producer |
| zoopl | zooplankton | zooplancton | none | plant-eater |
| clam | clam | almeja | none | filter feeder |
| parrotfish | parrotfish | pez loro | 🐠≈ | herbivore |
| greenturtle | green sea turtle | tortuga verde | 🐢 | herbivore (adults) |
| clownfish | clownfish | pez payaso | 🐠≈ | omnivore |
| octopus | octopus | pulpo | 🐙 | carnivore |
| crab | crab | cangrejo | 🦀 | clean-up crew (detritivore) |
| whitetip | whitetip reef shark | tiburón de puntas blancas de arrecife | 🦈 | carnivore |
| tigershark | tiger shark | tiburón tigre | 🦈 | top predator |
| coral | coral | coral | 🪸 (2021) | an animal with algae partners. Keep it out of simple chains. |
| kelp | giant kelp | kelp gigante (sargazo gigante) | none | producer (kelp card) |
| urchin | purple sea urchin | erizo de mar morado | none | herbivore (kelp card) |
| otter | sea otter | nutria marina | 🦦 (2019) | carnivore (kelp card) |

| Link | Status | Source |
|---|---|---|
| zoopl ← phyto | OK | zooplankton "drift through the water grazing on phytoplankton" (NOAA-reef) |
| parrotfish ← algae | OK | they graze "dead, algae-coated coral" (ADW-parrotfish); NOAA-reef |
| greenturtle ← seagrass / algae | OK | adults mainly eat "algae and seagrasses" (NOAA-greenturtle) |
| clownfish ← zoopl / algae | OK | "generalized omnivores" (ADW-clownfish) |
| clam ← phyto (plankton) | OK | filter feeders such as clams "strain their food (plankton and detritus)" (NOAA-reef) |
| octopus ← clam | OK | "feed primarily on gastropods and bivalves" (ADW-octopus) |
| whitetip ← parrotfish | OK | named as key prey (ADW-whitetip) |
| whitetip ← octopus / crab | OK | it picks up "crabs, lobsters, and octopi" (ADW-whitetip) |
| tigershark ← greenturtle | OK | its teeth "penetrate the shells of sea turtles" (ADW-tigershark) |
| crab ← dead stuff | OK | detritivores "like crabs and lobsters" recycle nutrients (NOAA-reef) |
| shark ← clownfish | AVOID | no source; anemone stings deter most predators (ADW-clownfish) |
| "sea turtle" (generic) ← anything | AVOID | species differ. Always use the green turtle by name. |
| urchin ← kelp | OK | urchins are "voracious kelp grazers" (KELP) |
| otter ← urchin | OK | sea otters keep urchin numbers down (KELP) |

The kelp card gives a sourced **trophic cascade** for "remove one" puzzles: fewer otters (or sunflower sea stars) → more urchins → kelp disappears ("urchin barrens") (KELP).

---

### 1.6 Pond / wetland (North America)

| id | English | Español | Emoji | Role |
|---|---|---|---|---|
| algae | algae | algas | 🌿≈ | producer |
| waterplants | water plants | plantas acuáticas | 🪷≈ | producer |
| zoopl | tiny water animals (zooplankton) | zooplancton | none | plant-eater |
| mosquitolarva | mosquito larva | larva de mosquito | 🦟≈ | (food for nymphs) |
| tadpole | bullfrog tadpole | renacuajo de rana toro | none | plant-eater |
| dragonnymph | dragonfly nymph | ninfa de libélula | none (no dragonfly emoji exists) | carnivore |
| bullfrog | bullfrog (adult) | rana toro | 🐸 | carnivore |
| bluegill | bluegill | pez sol (mojarra de agallas azules) | 🐟 | carnivore (mostly) |
| heron | great blue heron | garza azulada (garzón cenizo) | none | carnivore |
| mallard | mallard duck | ánade real / pato de collar | 🦆 | omnivore |

| Link | Status | Source |
|---|---|---|
| tadpole ← algae / waterplants | OK | "Bullfrog tadpoles mostly graze on aquatic plants"; algae is listed (ADW-bullfrog) |
| zoopl ← algae | LESS (generic) | NOAA-reef states it for marine phytoplankton. I found no freshwater-specific source. |
| bluegill ← zoopl / aquatic insects / snails | OK | "snails, worms, shrimp, aquatic insects, small crayfish, and zooplankton" (ADW-bluegill) |
| heron ← bluegill | OK | listed as a bluegill predator (ADW-bluegill); "fish make up most of their diet" (ADW-heron) |
| heron ← bullfrog / frogs | OK | ADW-heron; ADW-bullfrog |
| heron ← dragonflies | OK | ADW-heron |
| dragonnymph ← mosquitolarva | OK | the most consistent claim across sources (DRAGON) |
| dragonnymph ← tadpole | LESS | larger nymphs, small tadpoles (DRAGON [S]) |
| bullfrog ← insects | OK | ADW-bullfrog |
| bullfrog ← other frogs / tadpoles | AVOID | cannibalism, and confusing because frog and tadpole are the same animal |
| fish ← bullfrog tadpole | AVOID | "Most fish are averse to eating bullfrog tadpoles" (ADW-bullfrog) |
| mallard ← water plants / insects / snails | OK | "vegetation, insects, worms, gastropods" (ADW-mallard) |
| mosquitolarva ← algae | needs a source | not verified in this pass |

Do not link **tadpole → bullfrog**. A tadpole grows into a frog, and that is not feeding.

---

### 1.7 Temperate forest (eastern North America)

| id | English | Español | Emoji | Role |
|---|---|---|---|---|
| oak | oak tree (acorns) | roble (bellotas) | 🌳 / 🌰≈ | producer |
| twigs | tree buds and twigs | brotes y ramitas | 🌿 | producer |
| clover | grass and clover | pasto y trébol | ☘️ | producer |
| berries | berry bushes | arbustos de bayas | 🫐 (2020) | producer |
| deer | white-tailed deer | venado de cola blanca | 🦌 | herbivore |
| squirrel | eastern gray squirrel | ardilla gris | 🐿️ | mostly plants (insects in summer). Keep it out of role-sorting. |
| cottontail | eastern cottontail rabbit | conejo de cola de algodón | 🐇 | herbivore |
| mouse | white-footed mouse | ratón de patas blancas | 🐁 | (food only) |
| redfox | red fox | zorro rojo | 🦊 | omnivore |
| owl | great horned owl | búho cornudo (búho real americano) | 🦉 | carnivore |
| hawk | red-tailed hawk | aguililla colirroja | 🦅 | carnivore |
| wolf | gray wolf | lobo gris | 🐺 | carnivore |
| blackbear | American black bear | oso negro americano | 🐻 | omnivore (mostly plants) |
| mushroom | mushrooms (fungi) | hongos (setas) | 🍄 | decomposer |
| worm | earthworm | lombriz de tierra | 🪱 (2020) | decomposer |

| Link | Status | Source |
|---|---|---|
| deer ← twigs | OK | "buds and twigs of maple, sassafras, poplar, aspen and birch" (ADW-deer) |
| squirrel ← oak (acorns/nuts) | OK | mostly nuts, flowers and buds from more than 24 oak species (ADW-squirrel) |
| cottontail ← clover / grass | OK | about 50% grasses; clover is a favorite (ADW-cottontail) |
| redfox ← cottontail / mouse / berries (fruit) | OK | "rodents, eastern cottontail rabbits, insects, and fruit" (ADW-redfox) |
| owl ← cottontail / mouse | OK | rabbits and rodents (ADW-ghowl) |
| owl ← squirrel | AVOID | not listed (ADW-ghowl) |
| hawk ← squirrel | OK | red-tailed hawks are listed (ADW-squirrel) |
| redfox ← squirrel | LESS | ADW-squirrel |
| wolf ← deer | OK | gray wolves are listed as deer predators (ADW-deer) |
| wolf ← cottontail | LESS | rabbits, usually taken by lone wolves (ADW-wolf) |
| blackbear ← berries / acorns | OK | "shrub and tree-borne fruits", nuts and acorns; "only a small portion…animal matter" (ADW-blackbear) |
| blackbear ← deer | AVOID | "not active predators" (ADW-blackbear); not gentle |
| worm ← dead leaves | OK | earthworms eat "dead plants and animals"; their casts are rich in nitrogen, phosphorus and potassium (NHPBS-decomp) |
| mushroom ← dead wood/leaves | OK | fungi "get all their nutrients from dead materials" (NG-decomp) |

---

### 1.8 Desert (Sonoran/Mojave, North America), plus a Kalahari meerkat card

| id | English | Español | Emoji | Role |
|---|---|---|---|---|
| pricklypear | prickly pear cactus | nopal | 🌵 | producer |
| mesquite | mesquite (seeds) | mezquite | 🌳 | producer |
| desertgrass | desert grasses and wildflowers | pastos y flores del desierto | 🌼 | producer |
| jackrabbit | black-tailed jackrabbit | liebre de cola negra | 🐇 | herbivore |
| krat | kangaroo rat | rata canguro | 🐁≈ | mostly seeds |
| tortoise | desert tortoise | tortuga del desierto | 🐢 | herbivore |
| roadrunner | greater roadrunner | correcaminos | none (🐦≈) | omnivore |
| rattler | western diamondback rattlesnake | serpiente de cascabel (víbora de cascabel) | 🐍 | carnivore |
| coyote | coyote | coyote | none | carnivore here |
| kitfox | kit fox | zorra norteña | 🦊 | carnivore here |
| hawk | hawk | gavilán / aguililla | 🦅 | carnivore |
| lizard | lizard | lagartija | 🦎 | (food) |
| insects | insects (e.g. grasshopper) | insectos (saltamontes) | 🦗≈ | herbivore |
| scorpion | scorpion | escorpión (alacrán) | 🦂 | carnivore |
| meerkat | meerkat (Kalahari) | suricata | none | mostly insects |
| jackal | jackal (Kalahari) | chacal | none | carnivore |
| eagle | eagle | águila | 🦅 | carnivore |

| Link | Status | Source |
|---|---|---|
| jackrabbit ← desertgrass | OK | "Grasses and herbaceous matter are the preferred foods" (ADW-jackrabbit) |
| jackrabbit ← pricklypear | LESS | "sagebrush and cacti are also eaten" (ADW-jackrabbit) |
| coyote / kitfox ← jackrabbit | OK | ADW-jackrabbit |
| krat ← mesquite (seeds) | OK | diet "almost entirely seeds", from mesquite, creosote and grama grass (ADW-krat) |
| rattler / owl / coyote ← krat | OK | "Predators…include rattlesnakes, coyotes, weasels, owls" (ADW-krat) |
| hawk ← rattler | OK | ADW-rattler |
| roadrunner ← lizard / scorpion / insects | OK | ADW-roadrunner |
| roadrunner ← pricklypear | OK | "feed on prickly pear cactus where it's available" (ADW-roadrunner) |
| roadrunner ← rattler | AVOID | "rarely eat rattlesnakes" (ADW-roadrunner) vs. "common predator" (ADW-rattler). The sources conflict, and it is a cartoon myth magnet. |
| hawk / coyote ← roadrunner | OK | ADW-roadrunner |
| tortoise ← desertgrass / flowers | OK | "low-growing plants and freshly fallen leaves"; grasses, flowers and succulents (ADW-tortoise) |
| anything ← tortoise | AVOID | only eggs and young are taken (ADW-tortoise) |
| insects (grasshopper) ← grass | OK | grasses are "a particular favorite" (WIKI-grasshopper) |
| scorpion ← insects | OK | "insects, spiders" (SDZ-scorpion) |
| meerkat ← scorpion / insects | OK | insects are "the biggest part of their diet", plus scorpions (SDZ-meerkat); meerkats are venom-resistant (SDZ-scorpion) |
| jackal / eagle ← meerkat | OK | SDZ-meerkat |

Chain with 5 arrows (Kalahari): Sun → grass → grasshopper → scorpion → meerkat → jackal. Every link is OK (WIKI-grasshopper, SDZ-scorpion, SDZ-meerkat).

---

### 1.9 Grassland / prairie (North American Great Plains)

| id | English | Español | Emoji | Role |
|---|---|---|---|---|
| prairiegrass | prairie grasses (buffalo grass, grama) | pastos de la pradera | 🌾≈ | producer |
| bison | American bison | bisonte americano | 🦬 (2020) | herbivore |
| prairiedog | black-tailed prairie dog | perrito de la pradera | none | herbivore (>98% plants) |
| grasshopper | grasshopper | saltamontes (chapulín) | 🦗≈ | herbivore (mostly) |
| meadowlark | western meadowlark | pradero occidental | none (🐦≈) | omnivore (seeds and insects) |
| ferret | black-footed ferret | hurón de patas negras | none | carnivore |
| badger | American badger | tejón americano | 🦡 | carnivore |
| goldeneagle | golden eagle | águila real | 🦅 | carnivore |
| coyote | coyote | coyote | none | carnivore here |
| wolf | gray wolf | lobo gris | 🐺 | carnivore |

| Link | Status | Source |
|---|---|---|
| bison ← prairiegrass | OK | "eat mainly grasses" (ADW-bison) |
| prairiedog ← prairiegrass | OK | "vegetable matter comprises over 98% of the diet"; wheatgrass, buffalo grass, grama (ADW-prairiedog) |
| grasshopper ← prairiegrass | OK | WIKI-grasshopper |
| meadowlark ← grasshopper / seeds | OK [S] | grain, weed seeds, beetles, grasshoppers, crickets (MEADOW) |
| ferret ← prairiedog | OK | "In the wild, 90 percent of black-footed ferrets' diet is prairie dogs" (NZP-ferret) |
| coyote / badger / goldeneagle ← prairiedog | OK | ADW-prairiedog |
| wolf ← bison | LESS | only calves and old or ill animals (ADW-bison). Not gentle, so use it rarely. |

A real removal story: the ferret nearly went extinct partly because prairie dogs declined. Habitat loss, the decline of prairie dogs and plague are the main threats (NZP-ferret).

---

### 1.10 Garden / backyard (tag the region: robin = Americas; song thrush and hedgehog = Europe)

| id | English | Español | Emoji | Role |
|---|---|---|---|---|
| gardenplants | garden plants / leaves | plantas del jardín / hojas | 🌿 | producer |
| milkweed | milkweed | algodoncillo | none | producer |
| berries | berries | bayas | 🍓/🫐 | producer |
| aphid | aphid | pulgón (áfido) | none | herbivore (drinks sap) |
| ladybug | ladybug / ladybird | mariquita (catarina in Mexico; vaquita de San Antonio in Argentina) | 🐞 | carnivore |
| caterpillar | caterpillar | oruga | 🐛 | herbivore |
| monarchcat | monarch caterpillar | oruga de la monarca | 🐛 | herbivore |
| snail | garden snail | caracol de jardín | 🐌 | herbivore (mostly) |
| worm | earthworm | lombriz de tierra | 🪱 | decomposer |
| robin | American robin | petirrojo americano (mirlo primavera, zorzal robín) | none (🐦≈) | omnivore |
| thrush | song thrush | zorzal común | none (🐦≈) | (snails) |
| hedgehog | European hedgehog | erizo europeo | 🦔 (2017) | omnivore (mostly insects) |
| fungi | fungi and bacteria | hongos y bacterias | 🍄 / 🦠 | decomposers |

| Link | Status | Source |
|---|---|---|
| aphid ← gardenplants (sap) | OK [S] | mouthparts go into the phloem "where sugars are transported" (APHID) |
| ladybug ← aphid | OK | "mainly preys on aphids" (ADW-ladybird); up to 5,000 in a lifetime (APHID, Kentucky) |
| monarchcat ← milkweed | OK | "a wide range of milkweeds" (ADW-monarch) |
| robin ← worm / caterpillar / berries | OK | about 40% invertebrates and 60% fruit (ADW-robin) |
| hawk ← robin | OK | "preyed upon by hawks, cats, and larger snakes" (ADW-robin). Avoid cats, since they are pets. |
| snail ← gardenplants | OK | "primarily a herbivore": vegetables, roses, flowers (WIKI-snail) |
| thrush ← snail | OK | smashes snails on an "anvil" stone (RSPB-thrush) |
| hedgehog ← beetles / worms / snails | OK | ADW-hedgehog |
| fox / badger ← hedgehog | AVOID | documented (ADW-hedgehog) but not gentle, and children love hedgehogs |
| bird ← monarchcat | AVOID | toxic (ADW-monarch) |
| bird ← ladybug | AVOID | chemically defended (ADW-ladybird) |
| worm ← dead leaves | OK | NHPBS-decomp |

---

### 1.11 Cross-ecosystem decoy rules

- **Geography decoys** (always false): polar bear in Antarctic or savanna chains; penguins (except the Galápagos penguin, which should not be used) in Arctic chains; lion, zebra or giraffe in Americas chains; jaguar or harpy eagle in Africa.
- **Role decoys** (always false): a plant in a carnivore slot, or a carnivore in a producer slot. A **soil/dirt tile** in a producer slot is the key misconception decoy (§2, §3.1).
- **Danger: cross-listed generalists.** Foxes, owls, hawks, eagles, wolves, coyotes and humpback whales live in several ecosystems. Give each a specific species id (redfox ≠ arcticfox ≠ kitfox) and check decoys against all links of that id, not just the current ecosystem.

---

## 2. Producers and photosynthesis (facts for kids)

### 2.1 Producers per ecosystem (all real)
| Ecosystem | Producers used | Source |
|---|---|---|
| Savanna | grass, acacia | SDZ-zebra; SDZ-giraffe |
| Southern Ocean | phytoplankton, ice algae | ADW-krill |
| Arctic | ice algae/phytoplankton; sedges, grasses, moss; dwarf willow | ACOD; LEM; ADW-arctichare |
| Rainforest | cecropia, fruit trees, grass and water plants; bamboo (China card) | ADW-sloth; SDZ-toucan; SDZ-capybara; SDZ-panda |
| Coral reef | phytoplankton, algae, seagrass, zooxanthellae inside corals; kelp (kelp card) | NOAA-reef; KELP |
| Pond | algae, water plants | ADW-bullfrog |
| Temperate forest | oak/acorns, twigs and buds, grass and clover, berries | ADW-squirrel; ADW-deer; ADW-cottontail; ADW-blackbear |
| Desert | prickly pear, mesquite, desert grasses and flowers | ADW-roadrunner; ADW-krat; ADW-tortoise |
| Prairie | buffalo grass, grama, wheatgrass | ADW-prairiedog |
| Garden | garden plants, milkweed, berries | WIKI-snail; ADW-monarch; ADW-robin |

### 2.2 Photosynthesis facts
- Photosynthesis is "the process by which plants use sunlight, water, and carbon dioxide to create oxygen" and sugar for energy. https://education.nationalgeographic.org/resource/photosynthesis [F]
- "Producers, also known as autotrophs, make their own food" from sunlight, carbon dioxide and water. https://education.nationalgeographic.org/resource/food-chain [F]
- Ocean producers photosynthesize too. "Phytoplankton, algae, seagrasses and zooxanthellae… photosynthesize, using the Sun's energy and carbon dioxide to build carbohydrates." NOAA-reef [F]
- US standards say this directly:
  - **NGSS 5-LS1-1:** "Support an argument that plants get the materials they need for growth chiefly from air and water." Clarification: "plant matter comes mostly from air and water, not from the soil." https://www.nextgenscience.org/pe/5-ls1-1-molecules-organisms-structures-and-processes [F]
  - **NGSS 5-PS3-1:** the energy in animals' food "was once energy from the sun". https://www.nextgenscience.org/pe/5-ps3-1-energy [F]
  - **NGSS 5-LS2-1** calls air, water and "decomposed materials in soil" **"matter that is not food"**. Plants change this matter into food. https://www.nextgenscience.org/pe/5-ls2-1-ecosystems-interactions-energy-and-dynamics [F] This is the key wording for the decomposer level. Decomposers return materials to the soil, but those materials are not "food" for the plant.

### 2.3 Van Helmont's willow (story for an older-level "Did you know?")
- 17th century; published after his death (date from memory: about 1648, so verify). He put 200 lb of oven-dried soil in a pot and planted a 5 lb willow shoot, adding only water. After 5 years the tree weighed "169 pounds and about three ounces". The soil was "the same 200 pounds, less about 2 ounces." https://faculty.csbsju.edu/SSAUPE/biol115/van_helmont.htm [F]
- He concluded the wood came from water alone. That was only partly right: the rest came from **air** (carbon dioxide), which he overlooked. https://www.iflscience.com/jan-baptista-van-helmonts-16th-century-willow-tree-experiment-was-one-of-the-first-in-modern-biology-82153 [S]; https://encyclopedia.com/science/news-wires-white-papers-and-books/van-helmont-jan [S]
- **Teaching use.** Messig & Groß (2018, *Education Sciences* 8(3):132) used the van Helmont experiment to create cognitive conflict about plant nutrition in high-school students. https://www.mdpi.com/2227-7102/8/3/132 [S] (403 when fetched; from the search abstract)
- **Game idea.** A scale animation: the pot of soil weighs about the same, while the tree grows huge. Ask "Where did the tree come from?" with three choices: soil / water and air / the Sun's light. The answer: water and air, built using the Sun's energy.

---

## 3. Children's misconceptions (research) and how teachers handle arrows

### 3.1 "Plants get their food from the soil"
| Study | Who | Finding | URL |
|---|---|---|---|
| Greek study in *Paidagogiki* (University of Macedonia journal; your brief says 2019, but I could not confirm the year because of a bot wall) | 310 pupils aged 10–14 (primary grade 5; junior high grades 1 and 3) | "Very few students understand the whole procedure of photosynthesis"; "the main misconception… is that plants obtain their food from the soil." The authors discuss the possible influence of textbooks. | https://ojs.lib.uom.gr/index.php/paidagogiki/article/view/6792 [S] |
| Same journal: pupils aged 5–7 on plant nutrition and growth | early years | the abstract was blocked; related | https://ojs.lib.uom.gr/index.php/paidagogiki/article/view/6798 [S] |
| NZCER Assessment Resource Banks, "Plants and energy" | NZ students | students say roots get energy or "food" from the soil. Everyday terms like "plant food" (fertiliser) reinforce this. | https://arbs.nzcer.org.nz/resources/plants-and-energy [S] (403) |
| Waikato thesis, "The description and modification of children's views of plant nutrition" (the Barker & Carr line of work) | 28 interviews (ages 8–17) and about 6,000 surveys (age 10 to first-year university) | children hold separate ideas about plant "drinking, breathing, growth, energy, feeding". Plant-as-animal analogies dominate. Nothing like photosynthesis appears before teaching. | https://researchcommons.waikato.ac.nz/handle/10289/14697 [S] |
| Barker & Carr (1989), *IJSE*, two parts (prior knowledge; generative learning strategy) | 13-year-olds | only 19% correctly said photosynthesis produces carbohydrates (as cited by later papers) | cited via https://www.uni-bamberg.de/fileadmin/nawididaktik/Downloads/Messig_Gross_ERIDOB_Paper_21.9.16.pdf [S] |
| Anderson et al. (1990) | students | 98% believed plants get their nutrition exclusively from the environment (as cited) | same Bamberg paper [S] |
| Driver, Squires, Rushworth & Wood-Robinson, *Making Sense of Secondary Science* (Routledge 1994; Classic Edition 2014) | review | a standard summary of children's ideas, including plant nutrition and food chains. I could not access the chapter text. | https://page158books.com/book/9781138814462 [S] |
| Ohio State "Beyond Penguins" | elementary | the role of light and nutrients is "especially difficult for elementary students" | https://beyondpenguins.ehe.osu.edu/?p=2290 [S] |
| NSTA "Is it food for plants?" | upper elementary | plants make their own food, and matter comes from air and water, not soil | https://www.nsta.org/lesson-plan/it-food-plants [S] |

**Design implications**
1. Include a **soil tile** as a decoy in the producer slot from level 1. Its feedback: "Soil gives water and minerals, like vitamins. The plant makes its food in its leaves, using sunlight, air and water."
2. Never label fertiliser or compost as "plant food" in the game.
3. Draw the decomposer → soil → plant loop with a **different arrow style** (for example a dotted green "recycle" arrow ♻️, meaning "gives back minerals"), not the yellow "gives food to" arrow. This follows NGSS's "matter that is not food" wording.

### 3.2 Arrow direction ("eats" vs "is food for")
- **Oak National Academy (England), Year 4 (age 8–9), "Simple food chains".** Misconceptions: "Pupils often think the arrow in a food chain means 'eats'," and that arrows go from predator to prey. Their fix: read chains aloud, saying "is food for" in place of the arrow. https://www.thenational.academy/teachers/lessons/simple-food-chains [F]. Oak also has a Year 2 (age 6–7) unit, "Introduction to food chains": https://thenational.academy/pupils/programmes/science-primary-year-2/units/introduction-to-food-chains/lessons/comparing-food-chains/video [S]
- **NZCER ARB "Kingfishers" (Level 4, Year 8 trial).** Common errors are "Not starting the food chain with a producer" and "Arrows pointing in the wrong direction". The resource suggests the prompt "goes into" to show the flow of energy. https://arbs.nzcer.org.nz/resources/kingfishers [F]
- **Grissett (2022), USF PhD, "Investigating Students' Interpretations of Ecological Food Webs".** Some students read arrows "as pointing from a predator to its prey". They traced chains step by step, carrying over arrow habits from other biology and chemistry diagrams. He recommends explaining what the arrows mean explicitly. https://digitalcommons.usf.edu/etd/9778 [F]
- **NOAA's convention.** "Arrows in food web diagrams point from the prey to the predator, which is also the direction of energy flow." Their lesson also colour-codes arrows: solid orange for solar energy to producers, other styles for energy to herbivores and predators, and a distinct style for decomposers. NOAA-reef [F]
- **How teachers do it with young children** (synthesis of the above):
  - say "is food for" or "gives energy to", never "eats", when reading left to right;
  - pass a ball or yarn from the Sun along the chain (NOAA-reef yarn web; Smithsonian "Weaving the Web", grades 2–5: https://forces.si.edu/main/pdf/2-5-WeavingTheWeb.pdf [S], a scanned PDF I could not read);
  - always start at the Sun or a producer (NZCER).
- **Game rule.** The arrow animates a glowing "food/energy dot" travelling **from food to eater**. The narration says "The grass gives food to the zebra" (EN) / "El pasto le da comida a la cebra" (ES). If the child asks "who eats who?", reading right to left gives "the zebra eats the grass". Both readings are true, so the arrow head always sits at the eater.

### 3.3 Food webs: "top predator eats everything" and "a change only affects direct neighbours"
- **Griffiths & Grant (1985),** "High school students' understanding of food webs: identification of a learning hierarchy and related misconceptions," *JRST* 22(5):421–436. The misconceptions catalogued include:
  - "A population located higher on a given food chain within a food web is a predator of all populations located below it in the chain";
  - "A change in the size of a prey population has no effect on its predator population";
  - a change in one population is not passed along several pathways.

  https://wordpressua.uark.edu/scimap/?p=336 [S]; the thesis behind it (Grant 1983, 200 Grade 10 students, St. John's): https://research.library.mun.ca/7847 [S]
- **Barman, Griffiths & Okebukola (1995),** *IJSE* 17:775–782. 96 interviews (32 each in the USA, Australia and Canada). Most students had "some difficulty in providing a complete explanation" of web relationships. https://informahealthcare.com/doi/abs/10.1080/0950069950170608 [S]
- **"Domino" reasoning.** Students "typically miss the domino-type connections within ecosystems (Griffiths and Grant, 1985; Webb and Boltt, 1990)." Harvard *Understandings of Consequence* project: https://clic.gse.harvard.edu/file_url/188 [S]
- **Design implications**
  1. Webs must show that the top predator does **not** eat everything below it. For example, the lion ← grass link is shown greyed with "Lions don't eat grass!"
  2. Removal puzzles must ask about **two steps** ("the grass goes → zebras go hungry → lions go hungry"), and later about **side effects** (otters go → urchins grow → kelp disappears; KELP).
  3. **Scope every removal question to the picture.** In the wild, lions have many foods. "If the zebras disappeared, lions would starve" is **false**. Phrase it as "In this picture, who has nothing left to eat?", and in web levels reward "The lion is OK: it can still eat wildebeest." This keeps the game truthful.

---

## 4. Game-design references

| Product | What it is | What to borrow | Source |
|---|---|---|---|
| NOAA coral-reef yarn web (lesson) | Students hold species cards and pass yarn from the "Sun" student to producers, then to consumers. When a species is removed, its predators drop the yarn. The class sees that losing one species matters more when there are fewer species. | the "tug" animation; the removal cascade; colour-coded arrows | NOAA-reef [F] |
| Smithsonian "Weaving the Web" (grades 2–5) | yarn web activity | the same idea | https://forces.si.edu/main/pdf/2-5-WeavingTheWeb.pdf [S] |
| Genius Games *Ecosystem* (card game, ages 10+, 2–6 players, 15–20 min) | Drafting cards ("bees to bears") into a habitat grid. You score by putting animals where they thrive; diversity is rewarded and monocultures penalised. | quick drafting; a "balance" bonus | https://www.geniusgames.org/products/ecosystem [F] |
| Blue Orange *Photosynthesis* (board game, ages 8+, 2–4 players) | The sun rotates around the board, and trees in shadow earn no light points | makes "plants need light" physical. Idea: a light-ray mini-puzzle before chains. | https://www.blueorangegames.com/games/photosynthesis [F] |
| Sheppard Software "Food Chain Game" (free web) | The landing page links help pages on food chains, a "big chain" web, decomposers, and producers/consumers. Sibling games: "Animal Diet" (meat-eater, plant-eater or both?) and a producers/consumers/decomposers game. | role-sorting as a separate mini-game | https://www.sheppardsoftware.com/content/animals/kidscorner/games/foodchaingame.htm [F] (gameplay not visible) |
| BrainPOP Jr. "Food Chain" (K–3) / BrainPOP "Food Chains" (3–8) | animated topic pages plus quizzes | the pages render with JS only, so I could not verify their content | https://jr.brainpop.com/science/animals/foodchain/ ; https://www.brainpop.com/science/ecologyandbehavior/foodchains/ |
| *Food Chain Island* (Button Shy wallet game, solitaire) | Bigger animals "eat" smaller ones to clear islands. Not ecologically accurate. | a counter-example: CurioZoo should not use a "bigger eats smaller" rule (whales eat krill; tiny ladybugs eat aphids) | https://boardgamegeek.com/boardgame/262211/food-chain-island (403; from memory, verify) |
| Legends of Learning food-web games, Bebras food-chain tasks | — | **not verified** (404; search budget used up) | — |

**What kids enjoy (synthesis):**
- surprise facts: crabeater seals don't eat crabs, leafcutter ants farm fungus, the panda is a bear that eats bamboo;
- seeing energy move (the yarn tug);
- dramatic "domino" consequences without gore;
- collecting cards;
- quick drafting.

---

## 5. Kid-friendly "why" sentences (about age 6; EN / ES, native review needed)

| Topic | English | Español |
|---|---|---|
| Sun first | Every food chain starts with the Sun. The Sun gives light, and plants use it to make food. | Toda cadena de comida empieza con el Sol. El Sol da luz, y las plantas la usan para hacer comida. |
| Plants make food | Plants make their own food from sunlight, air and water. | Las plantas hacen su propia comida con luz del sol, aire y agua. |
| Soil | Soil gives a plant water and minerals, a bit like vitamins. But the plant makes its food in its leaves. | La tierra le da a la planta agua y minerales, como vitaminas. Pero la planta hace su comida en sus hojas. |
| Arrow | The arrow means "gives food to." The grass gives food to the zebra. | La flecha quiere decir "le da comida a". El pasto le da comida a la cebra. |
| Arrow tip | The arrow points to the one who eats. | La flecha apunta al que come. |
| Energy | When the zebra eats grass, the Sun's energy moves into the zebra. | Cuando la cebra come pasto, la energía del Sol pasa a la cebra. |
| Herbivore | A herbivore eats plants. | Un herbívoro come plantas. |
| Carnivore | A carnivore eats animals. | Un carnívoro come animales. |
| Omnivore | An omnivore eats plants and animals. | Un omnívoro come plantas y animales. |
| Decomposers | Worms, mushrooms and tiny bacteria eat old leaves and leftovers. They turn them back into soil that helps new plants grow. | Las lombrices, los hongos y unas bacterias diminutas comen hojas viejas y restos. Los vuelven tierra que ayuda a crecer a las plantas nuevas. |
| Removal | If the grass goes away, the zebra has nothing to eat. Then the lion has no zebra. Everyone needs the grass! | Si se acaba el pasto, la cebra no tiene qué comer. Después el león no tiene cebras. ¡Todos necesitan el pasto! |
| Web | Most animals eat more than one food. Many chains joined together make a food web. | Casi todos los animales comen más de una cosa. Muchas cadenas juntas forman una red de comida. |
| Web OK | The lion is OK. It can still eat wildebeest. | El león está bien. Todavía puede comer ñus. |
| Poles | Polar bears live in the far north. Penguins live in the far south. They never meet! | Los osos polares viven en el norte helado. Los pingüinos viven en el sur helado. ¡Nunca se encuentran! |
| Krill | Tiny krill eat even tinier plants in the sea, called phytoplankton. | El kril diminuto come plantas aún más diminutas del mar: el fitoplancton. |
| Leafcutter | Leafcutter ants don't eat leaves! They feed the leaves to a fungus garden and eat the fungus. | ¡Las hormigas cortadoras no comen hojas! Alimentan un jardín de hongos con las hojas y se comen el hongo. |
| Panda | A panda is a bear that eats bamboo almost all day. | El panda es un oso que come bambú casi todo el día. |
| Van Helmont | Long ago, a man planted a little willow tree in a pot of soil. Five years later the tree was huge, but the soil weighed almost the same! The tree was built from water and air. | Hace mucho, un hombre plantó un sauce pequeño en una maceta con tierra. Cinco años después el árbol era enorme, ¡pero la tierra pesaba casi lo mismo! El árbol se formó con agua y aire. |

Sources for the content of these sentences: NG-chain, the NatGeo photosynthesis page, the NGSS PEs (§2.2), NG-decomp, NHPBS-decomp, ADW-krill, LEAF, SDZ-panda and the van Helmont pages (§2.3).

---

## 6. Hand-made teaching puzzles (learning order) and generation

### 6.1 Ten seed puzzles

Each one is chosen to be **unique**: exactly one tile fits each slot, given the decoys.

| # | Skill | Puzzle | Choices (decoys) | Answer and feedback |
|---|---|---|---|---|
| 1 | Arrow = gives food to | ☀️ → 🌾 → [ ? ] | 🦓 zebra, 🦁 lion, 🐻‍❄️ polar bear | Zebra. "The grass gives food to the zebra." The lion doesn't eat grass, and the polar bear lives far away. |
| 2 | Top of the chain | ☀️ → 🌾 → 🦓 → [ ? ] | 🦁, 🦒, 🐧 | Lion (ADW-lion). The giraffe eats leaves, not zebras. The penguin lives in the far south. |
| 3 | Producer, not soil | ☀️ → [ ? ] → 🦒 | acacia 🌳, soil tile, 🦓 | Acacia (SDZ-giraffe). Soil feedback as in §3.1. |
| 4 | Ocean chain | ☀️ → phytoplankton → [ ? ] → 🐧 Adélie | krill 🦐, orca, 🐻‍❄️ | Krill (ADW-krill, ADW-adelie). |
| 5 | Fix the arrow | ☀️ → 🌱 sedges → lemming ← 🦊 (one arrow reversed) | tap the wrong arrow | Arrow 3 is wrong. "Food goes to the fox": lemming → arctic fox (ADW-arcticfox). |
| 6 | Long chain (5 arrows) | ☀️ → algae → copepod → [ ? ] → ringed seal → [ ? ] | Arctic cod, 🐻‍❄️, 🐧, 🦁 | Arctic cod, then polar bear (ACOD, ADW-ringedseal, SDZ-polarbear). |
| 7 | Surprise | Who eats krill? | crabeater seal, orca, humpback whale (pick the two that are right) | Crabeater seal and humpback (ADW-crabeater, NOAA-humpback). "Crabeater seals eat krill, not crabs!" |
| 8 | Web: not "eats everything" | Savanna web: grass → zebra, wildebeest, gazelle; the three → lion, hyena; gazelle → cheetah | "Does the cheetah eat the zebra in this web?" | No. In this web the cheetah eats only gazelle (SDZ-cheetah; the zebra–cheetah link is AVOID). |
| 9 | Removal (two steps) | ☀️ → grass → zebra → lion. The grass disappears. | tap who goes hungry | Zebra, then lion ("domino"). Follow-up web: add a second branch, ☀️ → acacia → giraffe → lion. Now remove the grass: the zebra goes hungry, but "The lion is OK. It can still eat giraffes" (ADW-lion, LESS; use from level 4). Teaches that webs soften losses (§3.3). |
| 10 | Decomposers and roles | dead leaves → 🪱 → ♻️ minerals → 🌳 oak. Then sort 🌳 🐇 🦊 🦉 🍄 🪱 into producer / herbivore / omnivore / carnivore / decomposer bins. | — | Oak = producer; cottontail = herbivore; red fox = omnivore; great horned owl = carnivore; mushroom and worm = decomposers (ADW-cottontail, ADW-redfox, ADW-ghowl, NG-decomp, NHPBS-decomp). The ♻️ arrow is "gives back minerals", **not** "food" (NGSS 5-LS2-1). |

Bonus cascade puzzle (level 5 and up): ☀️ → kelp → urchin → sea otter. "The otters go away. What happens to the kelp?" Answer: urchins grow in number, and the kelp shrinks (KELP).

### 6.2 Data model for generating puzzles
```
species: { id, en, es, emoji|null, art, role: producer|herbivore|omnivore|carnivore|decomposer|null,
           sortable: bool,            // false for warthog, squirrel, meerkat, hedgehog, krill, panda
           regions: [savanna, ...] }
links:   { food, eater, eco, status: OK|LESS|AVOID|FALSE, src: key }
```
- **Sun links.** Sun → every producer is implicit. Draw it with the "light" arrow style.
- **The truth set** for checking is OK ∪ LESS ∪ AVOID. A decoy is allowed in a slot only if it makes **no** OK, LESS or AVOID link with the slot's neighbours **and** it has no link at all with the neighbours in any ecosystem (this blocks cross-listed generalists).
- **The answer set** for a level is OK only (levels 1–3) or OK ∪ LESS (level 4 and up).
- **Roles** for sorting come from the curated `role` field (backed by a source), never inferred from the link list. The link list is incomplete by design.

### 6.3 Levels and how to reach 100–200 puzzles each
| Level | Puzzle type | Generator | Rough pool size |
|---|---|---|---|
| 1 | 3 nodes: ☀️ → producer → [herbivore], or ☀️ → [producer] → herbivore. 3 choices, including 1 geography decoy and sometimes the soil tile. | every OK producer→herbivore link: about 30 across 10 ecosystems × which slot is blank (2) × decoy pairs (≥10 per item) | 600+ raw, dedupe → 150–200 |
| 2 | 4 nodes (one 3-link chain). Fill the carnivore, or any one slot. | about 60 OK herbivore→carnivore links joined to producers: about 120 chains × blank slot (3) × decoys | 1,000+ raw |
| 3 | 4–5 nodes with 2 blanks, plus "fix the reversed arrow" | the same chains plus Arctic, reef, pond and Kalahari 4–5-arrow chains (about 20) | several hundred |
| 4 | 5–6 nodes (chain lengths 3–5 arrows), 2–3 blanks; LESS links allowed | depth-first search over the link graph from each producer, length ≤ 5 | several hundred |
| 5 | Mini-webs (5–8 species, 6–10 arrows): "who eats more than one food?" and "does X eat Y in this web?" | random connected subgraphs of one ecosystem with ≥2 branch points | thousands |
| 6 | Removal: "In this picture, who has nothing left to eat?" (one-step and two-step), plus the kelp/lemming/prairie-dog cascade cards | for a web W and a removed node r, compute the set of nodes whose every food is gone, iterated until nothing changes. Multi-select answer. Reject if the answer set is empty unless the question is "Is anyone hungry?" | hundreds |
| 7 | Decomposers and roles: drag into 5 bins; finish a recycle loop | choose 5–7 species with sortable = true, at least 1 per bin | hundreds |

**Uniqueness and safety checks** (run in a build script, as with `tools/logicbuild.mjs`):
1. Every shown arrow is OK, or LESS at level 4 and up.
2. Each blank has exactly one valid tile among the choices.
3. No decoy has any link with its neighbours in any ecosystem.
4. No two species from incompatible regions share a chain (polar bear + penguin, lion + jaguar).
5. Removal answers are computed only on the displayed web, and the wording says "in this picture".
6. No AVOID link is ever shown.
7. Every link carries a `src` key that resolves to a URL in this file.

---

## Sources

Zoo and aquarium species pages (San Diego Zoo Wildlife Alliance)
- https://animals.sandiegozoo.org/animals/lion
- https://animals.sandiegozoo.org/animals/zebra
- https://animals.sandiegozoo.org/animals/giraffe
- https://animals.sandiegozoo.org/animals/cheetah
- https://animals.sandiegozoo.org/animals/warthog
- https://animals.sandiegozoo.org/animals/elephant
- https://animals.sandiegozoo.org/animals/dung-beetle
- https://animals.sandiegozoo.org/animals/polar-bear
- https://animals.sandiegozoo.org/animals/jaguar
- https://animals.sandiegozoo.org/animals/capybara
- https://animals.sandiegozoo.org/animals/toucan
- https://animals.sandiegozoo.org/animals/harpy-eagle
- https://animals.sandiegozoo.org/animals/giant-panda
- https://animals.sandiegozoo.org/animals/meerkat
- https://animals.sandiegozoo.org/animals/scorpion
- Smithsonian's National Zoo, black-footed ferret: https://nationalzoo.si.edu/animals/black-footed-ferret

Animal Diversity Web (University of Michigan)
- https://animaldiversity.org/accounts/Panthera_leo/
- https://animaldiversity.org/accounts/Connochaetes_taurinus/
- https://animaldiversity.org/accounts/Crocuta_crocuta/
- https://animaldiversity.org/accounts/Eudorcas_thomsonii/
- https://animaldiversity.org/accounts/Syncerus_caffer/
- https://animaldiversity.org/accounts/Euphausia_superba/
- https://animaldiversity.org/accounts/Hydrurga_leptonyx/
- https://animaldiversity.org/accounts/Lobodon_carcinophaga/
- https://animaldiversity.org/accounts/Leptonychotes_weddellii/
- https://animaldiversity.org/accounts/Aptenodytes_forsteri/
- https://animaldiversity.org/accounts/Pygoscelis_adeliae/
- https://animaldiversity.org/accounts/Pusa_hispida/
- https://animaldiversity.org/accounts/Vulpes_lagopus/
- https://animaldiversity.org/accounts/Nyctea_scandiaca/
- https://animaldiversity.org/accounts/Lepus_arcticus/
- https://animaldiversity.org/accounts/Bradypus_variegatus/
- https://animaldiversity.org/accounts/Alouatta_palliata/
- https://animaldiversity.org/accounts/Scaridae/
- https://animaldiversity.org/accounts/Amphiprion_ocellaris/
- https://animaldiversity.org/accounts/Triaenodon_obesus/
- https://animaldiversity.org/accounts/Galeocerdo_cuvier/
- https://animaldiversity.org/accounts/Octopus_vulgaris/
- https://animaldiversity.org/accounts/Lithobates_catesbeianus/
- https://animaldiversity.org/accounts/Ardea_herodias/
- https://animaldiversity.org/accounts/Anas_platyrhynchos/
- https://animaldiversity.org/accounts/Lepomis_macrochirus/
- https://animaldiversity.org/accounts/Odocoileus_virginianus/
- https://animaldiversity.org/accounts/Sciurus_carolinensis/
- https://animaldiversity.org/accounts/Sylvilagus_floridanus/
- https://animaldiversity.org/accounts/Vulpes_vulpes/
- https://animaldiversity.org/accounts/Bubo_virginianus/
- https://animaldiversity.org/accounts/Canis_lupus/
- https://animaldiversity.org/accounts/Ursus_americanus/
- https://animaldiversity.org/accounts/Lepus_californicus/
- https://animaldiversity.org/accounts/Dipodomys_merriami/
- https://animaldiversity.org/accounts/Geococcyx_californianus/
- https://animaldiversity.org/accounts/Crotalus_atrox/
- https://animaldiversity.org/accounts/Gopherus_agassizii/
- https://animaldiversity.org/accounts/Cynomys_ludovicianus/
- https://animaldiversity.org/accounts/Bison_bison/
- https://animaldiversity.org/accounts/Turdus_migratorius/
- https://animaldiversity.org/accounts/Coccinella_septempunctata/
- https://animaldiversity.org/accounts/Erinaceus_europaeus/
- https://animaldiversity.org/accounts/Danaus_plexippus/

NOAA and government education
- NOAA Fisheries, killer whale: https://www.fisheries.noaa.gov/species/killer-whale
- NOAA Fisheries, humpback whale: https://www.fisheries.noaa.gov/species/humpback-whale
- NOAA Fisheries, green turtle: https://www.fisheries.noaa.gov/species/green-turtle
- NOAA Sanctuaries, coral reef lesson plan (2023): https://sanctuaries.noaa.gov/media/docs/20231129-coral-reef-lesson-plan.pdf
- NGSS 5-LS1-1: https://www.nextgenscience.org/pe/5-ls1-1-molecules-organisms-structures-and-processes
- NGSS 5-PS3-1: https://www.nextgenscience.org/pe/5-ps3-1-energy
- NGSS 5-LS2-1: https://www.nextgenscience.org/pe/5-ls2-1-ecosystems-interactions-energy-and-dynamics
- Alaska Dept. of Fish & Game, lemmings: https://adfg.alaska.gov/static/education/wns/lemmings.pdf
- Fairfax County field guide p.74: https://www.fairfaxcounty.gov/publicworks/sites/publicworks/files/assets/fieldguide/files/basic-html/page74.html
- Smithsonian Forces of Change, "Weaving the Web": https://forces.si.edu/main/pdf/2-5-WeavingTheWeb.pdf

Encyclopedic and education pages
- National Geographic Education, food chain: https://education.nationalgeographic.org/resource/food-chain
- National Geographic Education, decomposers: https://education.nationalgeographic.org/resource/decomposers
- National Geographic Education, photosynthesis: https://education.nationalgeographic.org/resource/photosynthesis
- NHPBS NatureWorks, decomposers: https://natureworks.nhpbs.org/concepts/decomposers/
- RSPB, song thrush: https://www.rspb.org.uk/birds-and-wildlife/song-thrush
- Cornell All About Birds, Western Meadowlark food: https://www.allaboutbirds.org/guide/Western_Meadowlark/food
- Audubon, Western Meadowlark: https://audubon.org/field-guide/bird/western-meadowlark
- Wikipedia, Grasshopper: https://en.wikipedia.org/wiki/Grasshopper
- Wikipedia, *Cornu aspersum*: https://en.wikipedia.org/wiki/Cornu_aspersum
- UGA Extension, aphids: https://fieldreport.caes.uga.edu/publications/C1246/
- Univ. Kentucky Entomology EF702: https://entomology.ca.uky.edu/files/ef702.pdf
- Beyond Pesticides, dragonflies: https://www.beyondpesticides.org/assets/media/documents/TrackingBiodiversity-Dragonflies.PAY.fall18-web.pdf
- One Earth, Norway lemming: https://www.oneearth.org/species-of-the-week-norway-lemming/
- The Nature Conservancy blog, lemmings and snowy owls: https://blog.nature.org/2014/01/21/the-amazing-lemming-the-rodent-behind-the-snowy-owl-invasion/
- STRI/EurekAlert, leafcutter ants: https://www.eurekalert.org/multimedia/866096
- Smithsonian Magazine, "Small Matters": https://www.smithsonianmag.com/science-nature/small-matters-62475975/
- KQED, leafcutter ants: https://www.kqed.org/science/41112/where-are-the-ants-carrying-all-those-leaves
- UC Santa Cruz, otters and kelp: https://news.ucsc.edu/2021/03/kelp-forests-monterey/
- The Wildlife Society, otters and kelp: https://wildlife.org/monterey-bay-sea-otters-maintain-kelp-supply/
- Arctic journal, High Arctic ice edges: https://journalhosting.ucalgary.ca/index.php/arctic/article/view/65355
- Univ. Manitoba thesis, Arctic cod: https://mspace.lib.umanitoba.ca/items/42225d09-0f2c-4992-9035-10bfd1d5e9ed/full
- Pew 2014, Arctic ocean life: https://www.pewtrusts.org/-/media/assets/2014/life_in_emerging_ocean_webfinal.pdf
- MEPS 2018, krill diet: https://www.int-res.com/articles/meps2018/595/m595p039.pdf
- *Dear Polar Bears* (book listing): https://www.fantasticfiction.com/p/gabrielle-prendergast/dear-polar-bears.htm

Van Helmont
- CSB/SJU, van Helmont's own account: https://faculty.csbsju.edu/SSAUPE/biol115/van_helmont.htm
- IFLScience, willow experiment: https://www.iflscience.com/jan-baptista-van-helmonts-16th-century-willow-tree-experiment-was-one-of-the-first-in-modern-biology-82153
- Encyclopedia.com, van Helmont: https://encyclopedia.com/science/news-wires-white-papers-and-books/van-helmont-jan
- Messig & Groß 2018: https://www.mdpi.com/2227-7102/8/3/132

Misconceptions and pedagogy
- *Paidagogiki*, pupils aged 10–14: https://ojs.lib.uom.gr/index.php/paidagogiki/article/view/6792
- *Paidagogiki*, pupils aged 5–7: https://ojs.lib.uom.gr/index.php/paidagogiki/article/view/6798
- NZCER ARBs, "Plants and energy": https://arbs.nzcer.org.nz/resources/plants-and-energy
- NZCER ARBs, "Kingfishers": https://arbs.nzcer.org.nz/resources/kingfishers
- Waikato thesis, plant nutrition: https://researchcommons.waikato.ac.nz/handle/10289/14697
- Messig & Gross, ERIDOB paper: https://www.uni-bamberg.de/fileadmin/nawididaktik/Downloads/Messig_Gross_ERIDOB_Paper_21.9.16.pdf
- *Making Sense of Secondary Science* (book listing): https://page158books.com/book/9781138814462
- Ohio State "Beyond Penguins", plant misconceptions: https://beyondpenguins.ehe.osu.edu/?p=2290
- NSTA, "Is it food for plants?": https://www.nsta.org/lesson-plan/it-food-plants
- Oak National Academy, Year 4 "Simple food chains": https://www.thenational.academy/teachers/lessons/simple-food-chains
- Oak National Academy, Year 2 "Introduction to food chains": https://thenational.academy/pupils/programmes/science-primary-year-2/units/introduction-to-food-chains/lessons/comparing-food-chains/video
- Grissett 2022, USF PhD: https://digitalcommons.usf.edu/etd/9778
- Griffiths & Grant 1985 (summary): https://wordpressua.uark.edu/scimap/?p=336
- Grant 1983, MUN thesis: https://research.library.mun.ca/7847
- Barman, Griffiths & Okebukola 1995: https://informahealthcare.com/doi/abs/10.1080/0950069950170608
- Harvard *Understandings of Consequence*: https://clic.gse.harvard.edu/file_url/188

Games
- Genius Games, *Ecosystem*: https://www.geniusgames.org/products/ecosystem
- Blue Orange, *Photosynthesis*: https://www.blueorangegames.com/games/photosynthesis
- Sheppard Software, Food Chain Game: https://www.sheppardsoftware.com/content/animals/kidscorner/games/foodchaingame.htm
- BrainPOP Jr., Food Chain: https://jr.brainpop.com/science/animals/foodchain/
- BrainPOP, Food Chains: https://www.brainpop.com/science/ecologyandbehavior/foodchains/
- BoardGameGeek, *Food Chain Island*: https://boardgamegeek.com/boardgame/262211/food-chain-island

Emoji
- Unicode emoji versions: https://unicode.org/emoji/charts/emoji-versions.html
