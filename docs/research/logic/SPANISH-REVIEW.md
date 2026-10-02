# Logic Games: what a native Spanish speaker should read

Every word in the Logic Games room was written in Spanish, not translated
word by word, and `tools/logiccheck.mjs` makes sure no key is missing in
either language. None of it has been read by a native speaker yet. This is
the list, with the choices most worth a second opinion first.

## Choices to confirm

| Where | Choice | Why it was chosen | Question |
|---|---|---|---|
| `trainstext.js` | **desvío** for a train switch | Understood across countries; "cambio" (Spain) and "chucho" are local | Is "desvío" natural for children in Mexico, the US and Spain? |
| `truthtext.js` | **animal Sol / animal Luna / animal Nube** | No gender agreement ("mentiroso/mentirosa" avoided); names, not judgements | Does "Zorro es un animal Sol" read naturally? |
| `truthtext.js` | Animals as names with no article: **Zorro, Rana, Búho** | Avoids "el zorro dice…" in every bubble | Natural, or would children expect "el Zorro"? |
| `truthtext.js` | **"o … (o los dos)"**, and **"u"** before an o-sound | Children read a bare "o" as exclusive; RAE on "u" | Check a few generated sentences with "u Oso" |
| `ruletext.js` | Conditions describe **"una criatura"** (feminine): **"es pequeña"** | The subject of every rule sentence | Is "criatura" right for these animals? |
| `ruletext.js` | **"tiene dibujo" / "no tiene dibujo"** for pattern / plain | "estampado" felt adult | Better word for a striped or dotted body? |
| `codetext.js` | **"¡En casa!" / "Otra casa" / "No está"** for the three marks | Short enough to sit under an animal | Clear to a 6-year-old? |
| `codetext.js` | **"Picas y fijas"** as the h3 chapter name | The folk name in much of Latin America ("Toros y vacas" in others) | Which one do children know? |
| `bridgestext.js` | Technique names: **"Un solo amigo", "Justo lo necesario", "No encierres a dos", "Que nadie quede aislado"** | Kid names for the techniques | Do they read as memorable names? |
| `robottext.js` | **"Gira a la izquierda/derecha"**, **"Dar de comer"**, **"Ayudante A"** | Imperatives on tiles | Imperative or infinitive on a tile? |
| `robottext.js` | **"Frasco de bichos"** for the bug jar | Playful | Does "bicho" carry an unwanted meaning anywhere? |
| `logictext.js` | Badge names: **"Cachorro curioso" … "Genio del zoo"** | | Fun for 6–13? |

## Files to read in full

- `assets/js/modules/logictext.js` — the room (hub, buttons, badges)
- `assets/js/modules/codetext.js` — Crack the Code, including the 12 animal facts
- `assets/js/modules/truthtext.js` — Truth Island, including how sentences are built
- `assets/js/modules/ruletext.js` — Find the Rule, including how rules are built
- `assets/js/modules/bridgestext.js` — Zoo Bridges
- `assets/js/modules/trainstext.js` — Train Tracks
- `assets/js/modules/robottext.js` — Robot Path and Fix the Bug

Generated sentences are easiest to judge in the game itself: switch to
Español with the pill at the top of any Logic Games screen.
