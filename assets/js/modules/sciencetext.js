/**
 * sciencetext.js — the words every Science Lab game shares, in English and
 * Spanish.
 *
 * Each game keeps its own sentences in its own *text.js file. This file holds
 * the room's: its name, the ten game cards, the levels, the buttons every
 * experiment has, and the big idea of every chapter (the Science Notebook
 * shows them without loading any game). `tools/sciencecheck.mjs` fails the
 * build if a key is in one language and not the other, or if the {slots} in
 * the two differ.
 *
 * Spanish here is written as Spanish, not translated word by word. It still
 * needs a native speaker's read before it is called finished (see PROGRESS.md).
 */

import { fill, lookup, otherLang } from './logictext.js';

export { fill, lookup, otherLang };

export const ROOM = {
  en: {
    roomTitle: 'Science Lab',
    roomLede: 'Guess what will happen, then watch. Every experiment shows you why.',
    langPill: 'Español',
    say: 'Read aloud',
    soon: 'Coming soon',
    play: 'Play',
    starsTotal: '{n} stars',
    surprises: '{n} surprises found',
    surprisesNone: 'No surprises yet',
    surpriseLede: 'A surprise is when something does not do what you guessed. Scientists love those.',
    daysWeek: 'Played {n} of the last 7 days',
    daysNone: 'A new week of experiments',
    level: 'Level',
    easy: 'Easy', medium: 'Medium', hard: 'Hard',
    ages: 'ages {ages}',
    chapters: 'Chapters',
    solvedOf: '{n} of {t} done',
    lockedChapter: 'Finish {n} more in the chapter before to open this one.',
    puzzleN: 'Experiment {n}',
    puzzleOf: 'Experiment {n} of {t}',
    backChapter: 'Back to the chapter',
    backGame: 'Back to the chapters',
    backRoom: 'Back to the Science Lab',
    next: 'Next experiment',
    hint: 'Hint',
    hintMore: 'Another hint',
    go: 'Go!',
    tryAgain: 'Try again',
    undo: 'Undo',
    restart: 'Start over',
    solved: 'Well done!',
    perfect: 'Brilliant!',
    surprise: 'Surprise!',
    starsGot: 'You earned {n} of 3 stars',
    starsBest: 'Your best: {n} of 3 stars',
    why: 'Why it happens',
    daily: "Today's experiment",
    dailies: "Today's experiments",
    dailyDone: 'Done for today. A new one comes tomorrow.',
    dailyFor: '{level} · {date}',
    teach: 'Learn',
    teachNote: 'An experiment that teaches. Watch closely: the idea is the prize.',
    chapterDone: 'Chapter complete!',
    chapterOpen: 'A new chapter is open: {name}!',
    ideaNew: 'New page in your Science Notebook: {idea}',
    loadFail: 'The experiments could not be loaded.',
    making: 'Setting up your experiment…',
    loadingTitle: 'Getting the experiments…',
    loadingText: 'Just a moment.',
    loadingSaving: 'This first visit also saves the games on this device, so they work without the internet.',
    endless: 'Endless practice',
    endlessLede: 'Fresh experiments that never run out.',
    endlessCount: '{n} done',
    endlessNext: 'Another one',
    dailyMore: 'More like this',
    playAgain: 'Play this one again',
    notebook: 'Science Notebook',
    notebookLede: 'Every chapter has one big idea. Finish 5 experiments in a chapter to add its page.',
    notebookCount: '{n} of {t} big ideas',
    notebookOpen: 'Open the notebook',
    notebookLocked: 'Still to find',
    notebookFrom: 'From {game}',
    badgeNow: 'You are a {badge}',
    badgeNext: '{n} more stars to {badge}',
    badgeTop: 'The highest badge of all!',
    'badge.cub': 'Curious Cub', 'badge.finder': 'Question Asker', 'badge.spotter': 'Sharp Observer',
    'badge.explorer': 'Lab Explorer', 'badge.master': 'Experiment Expert', 'badge.thinker': 'Big Thinker',
    'badge.genius': 'Zoo Scientist'
  },
  es: {
    roomTitle: 'Laboratorio de ciencias',
    roomLede: 'Adivina qué va a pasar y luego mira. Cada experimento te muestra por qué.',
    langPill: 'English',
    say: 'Leer en voz alta',
    soon: 'Muy pronto',
    play: 'Jugar',
    starsTotal: '{n} estrellas',
    surprises: '{n} sorpresas encontradas',
    surprisesNone: 'Todavía no hay sorpresas',
    surpriseLede: 'Una sorpresa es cuando algo no hace lo que adivinaste. A los científicos les encantan.',
    daysWeek: 'Jugaste {n} de los últimos 7 días',
    daysNone: 'Una nueva semana de experimentos',
    level: 'Nivel',
    easy: 'Fácil', medium: 'Medio', hard: 'Difícil',
    ages: '{ages} años',
    chapters: 'Capítulos',
    solvedOf: '{n} de {t} hechos',
    lockedChapter: 'Termina {n} más en el capítulo anterior para abrir este.',
    puzzleN: 'Experimento {n}',
    puzzleOf: 'Experimento {n} de {t}',
    backChapter: 'Volver al capítulo',
    backGame: 'Volver a los capítulos',
    backRoom: 'Volver al Laboratorio de ciencias',
    next: 'Siguiente experimento',
    hint: 'Pista',
    hintMore: 'Otra pista',
    go: '¡Vamos!',
    tryAgain: 'Inténtalo otra vez',
    undo: 'Deshacer',
    restart: 'Empezar de nuevo',
    solved: '¡Muy bien!',
    perfect: '¡Genial!',
    surprise: '¡Sorpresa!',
    starsGot: 'Ganaste {n} de 3 estrellas',
    starsBest: 'Tu mejor marca: {n} de 3 estrellas',
    why: 'Por qué pasa',
    daily: 'El experimento de hoy',
    dailies: 'Los experimentos de hoy',
    dailyDone: 'Listo por hoy. Mañana hay uno nuevo.',
    dailyFor: '{level} · {date}',
    teach: 'Aprende',
    teachNote: 'Un experimento para aprender. Mira con atención: la idea es el premio.',
    chapterDone: '¡Capítulo terminado!',
    chapterOpen: '¡Se abrió un capítulo nuevo: {name}!',
    ideaNew: 'Nueva página en tu cuaderno de ciencias: {idea}',
    loadFail: 'No se pudieron cargar los experimentos.',
    making: 'Preparando tu experimento…',
    loadingTitle: 'Trayendo los experimentos…',
    loadingText: 'Un momento.',
    loadingSaving: 'En esta primera visita también guardamos los juegos en este dispositivo, para que funcionen sin internet.',
    endless: 'Práctica sin fin',
    endlessLede: 'Experimentos nuevos que nunca se acaban.',
    endlessCount: '{n} hechos',
    endlessNext: 'Otro más',
    dailyMore: 'Más como este',
    playAgain: 'Jugar este otra vez',
    notebook: 'Cuaderno de ciencias',
    notebookLede: 'Cada capítulo tiene una gran idea. Termina 5 experimentos de un capítulo para añadir su página.',
    notebookCount: '{n} de {t} grandes ideas',
    notebookOpen: 'Abrir el cuaderno',
    notebookLocked: 'Por descubrir',
    notebookFrom: 'De {game}',
    badgeNow: 'Eres {badge}',
    badgeNext: 'Te faltan {n} estrellas para {badge}',
    badgeTop: '¡La insignia más alta de todas!',
    'badge.cub': 'Cachorro curioso', 'badge.finder': 'Preguntón', 'badge.spotter': 'Buen observador',
    'badge.explorer': 'Explorador del laboratorio', 'badge.master': 'Experto en experimentos', 'badge.thinker': 'Gran pensador',
    'badge.genius': 'Científico del zoo'
  }
};

export const ui = (key, lang, vars) => lookup(ROOM, key, lang, vars);

/** The three levels, the same in every game. */
export const LEVEL_AGES = { easy: '5–8', medium: '8–10', hard: '10–13' };

/**
 * The ten games, in the order of the build plan. `live` games have a board
 * of their own; the rest show as coming soon.
 */
export const GAMES = [
  {
    id: 'pond', live: true,
    name: { en: 'Hippo Pond', es: 'La charca del hipopótamo' },
    blurb: {
      en: 'A huge log, a tiny coin. Will it float or sink? Guess, then splash!',
      es: 'Un tronco enorme, una moneda diminuta. ¿Flota o se hunde? Adivina y ¡al agua!'
    },
    meta: { en: '270 experiments · 3 levels', es: '270 experimentos · 3 niveles' }
  },
  {
    id: 'train', live: true,
    name: { en: 'Fruit Train', es: 'El tren de la fruta' },
    blurb: {
      en: 'The monkey drops fruit from a moving train. Where should it let go?',
      es: 'El mono suelta fruta desde un tren en marcha. ¿Dónde debe soltarla?'
    },
    meta: { en: '270 experiments · 3 levels', es: '270 experimentos · 3 niveles' }
  },
  {
    id: 'firefly', live: true,
    name: { en: 'Firefly Circuits', es: 'Circuito de luciérnagas' },
    blurb: {
      en: 'Wire up the eel battery so the right fireflies glow.',
      es: 'Conecta la pila de la anguila para que brillen las luciérnagas correctas.'
    },
    meta: { en: '270 circuits · 3 levels', es: '270 circuitos · 3 niveles' }
  },
  {
    id: 'lever', live: true,
    name: { en: 'Lift the Elephant', es: 'Levanta al elefante' },
    blurb: {
      en: 'Can a little mouse lift an elephant? Yes, if it sits in the right place.',
      es: '¿Puede un ratoncito levantar a un elefante? Sí, si se sienta en el lugar correcto.'
    },
    meta: { en: '270 planks · 3 levels', es: '270 tablas · 3 niveles' }
  },
  {
    id: 'slide', live: true,
    name: { en: 'Penguin Slide', es: 'El tobogán del pingüino' },
    blurb: {
      en: 'Curved tubes, snowy hills and big jumps. Where will the penguin end up?',
      es: 'Tubos curvos, colinas de nieve y grandes saltos. ¿Dónde acabará el pingüino?'
    },
    meta: { en: '238 slides · 3 levels', es: '238 deslizadas · 3 niveles' }
  },
  {
    id: 'chain', live: true,
    name: { en: 'Sun to Lion', es: 'Del sol al león' },
    blurb: {
      en: 'Every meal starts with the sun. Build the food chain, link by link.',
      es: 'Toda comida empieza con el sol. Arma la cadena alimentaria, eslabón a eslabón.'
    },
    meta: { en: '270 chains and webs · 3 levels', es: '270 cadenas y redes · 3 niveles' }
  },
  {
    id: 'fountain', live: true,
    name: { en: 'Elephant Fountain', es: 'La fuente del elefante' },
    blurb: {
      en: 'Open the gates so the water reaches the thirsty animals.',
      es: 'Abre las compuertas para que el agua llegue a los animales sedientos.'
    },
    meta: { en: '250 fountains · 3 levels', es: '250 fuentes · 3 niveles' }
  },
  {
    id: 'shadow', live: true,
    name: { en: 'Shadow Show', es: 'Teatro de sombras' },
    blurb: {
      en: 'Move the lamp and the puppets to make the right shadow.',
      es: 'Mueve la lámpara y los títeres para hacer la sombra correcta.'
    },
    meta: { en: '226 shadows · 3 levels', es: '226 sombras · 3 niveles' }
  },
  {
    id: 'magnet', live: true,
    name: { en: 'Magnet Meerkats', es: 'Suricatas imantadas' },
    blurb: {
      en: 'Turn the magnets so they all pull together. Which things stick?',
      es: 'Gira los imanes para que todos se atraigan. ¿Qué cosas se pegan?'
    },
    meta: { en: '264 magnet puzzles · 3 levels', es: '264 retos de imanes · 3 niveles' }
  },
  {
    id: 'domino', live: true,
    name: { en: 'Domino Zoo', es: 'Dominó del zoo' },
    blurb: {
      en: 'Fill the gaps in the machine and ring the feeding bell.',
      es: 'Completa la máquina y haz sonar la campana de la comida.'
    },
    meta: { en: '270 machines · 3 levels', es: '270 máquinas · 3 niveles' }
  }
];

export const gameById = (id) => GAMES.find((g) => g.id === id) || null;

/**
 * The big idea of every chapter, by game, in chapter order. The notebook
 * shows these; each game's CHAPTERS must list the same chapter ids, which
 * tools/sciencecheck.mjs holds it to. `icon` is one emoji for the page.
 */
export const IDEAS = {
  pond: [
    {
      ch: 'e1', icon: '🦛', en: 'Big things can float. Small things can sink.', es: 'Lo grande puede flotar. Lo pequeño puede hundirse.',
      why: {
        en: 'What matters is how heavy a thing is for its size, not how heavy it is.',
        es: 'Lo que importa es cuánto pesa una cosa para su tamaño, no cuánto pesa.'
      }
    },
    {
      ch: 'e2', icon: '⚖️', en: 'Lighter than its water twin? It floats.', es: '¿Pesa menos que su gemelo de agua? Flota.',
      why: {
        en: 'Imagine the same amount of water. A thing lighter than that water floats; a thing heavier sinks.',
        es: 'Imagina la misma cantidad de agua. Si la cosa pesa menos que esa agua, flota; si pesa más, se hunde.'
      }
    },
    {
      ch: 'e3', icon: '🪵', en: 'Size does not change floating.', es: 'El tamaño no cambia si algo flota.',
      why: {
        en: 'A tiny piece and a giant piece of the same stuff are just as heavy for their size, so they do the same thing.',
        es: 'Un trozo diminuto y uno gigante del mismo material pesan igual para su tamaño, así que hacen lo mismo.'
      }
    },
    {
      ch: 'm1', icon: '🛶', en: 'Shape and liquid can change floating.', es: 'La forma y el líquido pueden cambiar si algo flota.',
      why: {
        en: 'A hollow boat shape, or very salty water, can make a sinker float. Cutting it or painting it never can.',
        es: 'Una forma hueca de barco, o el agua muy salada, pueden hacer flotar algo que se hunde. Cortarlo o pintarlo, nunca.'
      }
    },
    {
      ch: 'm2', icon: '🧊', en: 'Count the water cubes.', es: 'Cuenta los cubos de agua.',
      why: {
        en: 'A raft floats when it weighs less than the water cubes it fills, and sinks when it weighs more.',
        es: 'Una balsa flota cuando pesa menos que los cubos de agua que ocupa, y se hunde cuando pesa más.'
      }
    },
    {
      ch: 'm3', icon: '📏', en: 'A floater pushes away its own weight of water.', es: 'Lo que flota aparta su propio peso en agua.',
      why: {
        en: 'It sinks lower and lower until the water it pushes aside weighs just as much as it does.',
        es: 'Se hunde más y más hasta que el agua que aparta pesa lo mismo que él.'
      }
    },
    {
      ch: 'h1', icon: '🌊', en: 'Density is heaviness for size.', es: 'La densidad es el peso para el tamaño.',
      why: {
        en: 'Less dense than the liquid: it floats. More dense: it sinks. Salt makes water denser.',
        es: 'Menos denso que el líquido: flota. Más denso: se hunde. La sal hace el agua más densa.'
      }
    },
    {
      ch: 'h2', icon: '🍯', en: 'Liquids stack by density.', es: 'Los líquidos se apilan por densidad.',
      why: {
        en: 'The densest liquid sinks to the bottom. A thing sinks until it reaches a liquid denser than itself.',
        es: 'El líquido más denso se va al fondo. Una cosa se hunde hasta llegar a un líquido más denso que ella.'
      }
    },
    {
      ch: 'h3', icon: '🏔️', en: 'Most of an iceberg is hidden.', es: 'Casi todo el iceberg está escondido.',
      why: {
        en: 'The part under is the thing’s density divided by the liquid’s. Ice is about 0.9 of water, so about 9 parts in 10 are under.',
        es: 'La parte de abajo es la densidad de la cosa dividida entre la del líquido. El hielo es como 0,9 del agua, así que unas 9 partes de cada 10 quedan abajo.'
      }
    }
  ],
  train: [
    {
      ch: 'e1', icon: '🐒', en: 'Dropped from a moving train, it keeps moving forward.', es: 'Si la sueltas desde un tren en marcha, sigue avanzando.',
      why: {
        en: 'While it falls, the fruit keeps the speed the train gave it, so it lands ahead of where it was let go.',
        es: 'Mientras cae, la fruta conserva la velocidad que le dio el tren, así que cae más adelante de donde la soltaron.'
      }
    },
    {
      ch: 'e2', icon: '🍉', en: 'Heavy and light fall together.', es: 'Lo pesado y lo ligero caen juntos.',
      why: {
        en: 'A watermelon and a grape land at the same moment. Air only slows down things that are light and wide, like feathers.',
        es: 'Una sandía y una uva llegan en el mismo momento. El aire solo frena las cosas ligeras y anchas, como las plumas.'
      }
    },
    {
      ch: 'e3', icon: '🚂', en: 'Faster train or longer fall: it lands further ahead.', es: 'Tren más rápido o caída más larga: cae más adelante.',
      why: {
        en: 'More speed, or more time falling, both carry the fruit further forward.',
        es: 'Más velocidad, o más tiempo cayendo: las dos cosas llevan la fruta más adelante.'
      }
    },
    {
      ch: 'm1', icon: '🎯', en: 'From a moving train, it never lands straight below.', es: 'Desde un tren en marcha, nunca cae justo debajo.',
      why: {
        en: 'Count it: the ticks it falls, times the squares the train moves each tick.',
        es: 'Cuéntalo: los tics que cae, por las casillas que avanza el tren en cada tic.'
      }
    },
    {
      ch: 'm2', icon: '📏', en: 'Falling things speed up.', es: 'Lo que cae va cada vez más rápido.',
      why: {
        en: 'Each tick it falls further: 1, 3, 5, 7 rows. After 4 ticks it has fallen 16 rows.',
        es: 'En cada tic baja más: 1, 3, 5, 7 filas. Después de 4 tics ha bajado 16 filas.'
      }
    },
    {
      ch: 'm3', icon: '🦍', en: 'A longer drop takes more time.', es: 'Una caída más larga tarda más.',
      why: {
        en: '1 row takes 1 tick, 4 rows take 2, 9 rows take 3. A fruit for a lower mouth must be let go sooner.',
        es: '1 fila tarda 1 tic, 4 filas tardan 2, 9 filas tardan 3. La fruta para una boca más baja hay que soltarla antes.'
      }
    },
    {
      ch: 'h1', icon: '💨', en: 'Speed × time = how far.', es: 'Velocidad × tiempo = distancia.',
      why: {
        en: 'How far ahead it lands is the train’s speed times the ticks it spends falling.',
        es: 'Lo lejos que cae es la velocidad del tren por los tics que pasa cayendo.'
      }
    },
    {
      ch: 'h2', icon: '🎚️', en: 'Speed = how far ÷ how long.', es: 'Velocidad = distancia ÷ tiempo.',
      why: {
        en: 'To find the speed, divide how far the fruit must go by how many ticks it falls.',
        es: 'Para hallar la velocidad, divide lo que debe avanzar la fruta entre los tics que cae.'
      }
    },
    {
      ch: 'h3', icon: '🏁', en: 'Only the height decides.', es: 'Solo decide la altura.',
      why: {
        en: 'Things let go from the same height land together: heavy or light, moving sideways or not. The lower one always lands first.',
        es: 'Las cosas soltadas desde la misma altura llegan a la vez: pesadas o ligeras, moviéndose de lado o no. La que está más abajo siempre llega primero.'
      }
    }
  ],
  firefly: [
    {
      ch: 'e1', icon: '🔌', en: 'A firefly needs a whole loop.', es: 'Una luciérnaga necesita un circuito completo.',
      why: {
        en: 'The dots must go out of one end of the eel, through the firefly, and back into the other end. Any gap stops them all.',
        es: 'Los puntitos tienen que salir por un extremo de la anguila, pasar por la luciérnaga y volver por el otro. Cualquier hueco los para a todos.'
      }
    },
    {
      ch: 'e2', icon: '❓', en: 'One wire is not enough.', es: 'Un solo cable no basta.',
      why: {
        en: 'A wire to just one foot is a road with no way home. The firefly needs a wire to each foot, back to both ends of the eel.',
        es: 'Un cable a una sola patita es un camino sin regreso. La luciérnaga necesita un cable en cada patita, hasta los dos extremos de la anguila.'
      }
    },
    {
      ch: 'e3', icon: '✨', en: 'The same dots go all the way round.', es: 'Los mismos puntitos dan toda la vuelta.',
      why: {
        en: 'A firefly does not use up the dots. They come out of it as fast as they go in. It uses the eel’s push.',
        es: 'Una luciérnaga no gasta los puntitos. Salen de ella igual de rápido que entran. Usa el empuje de la anguila.'
      }
    },
    {
      ch: 'm1', icon: '🪵', en: 'Metal lets the dots through; wood does not.', es: 'El metal deja pasar los puntitos; la madera no.',
      why: {
        en: 'Metals are conductors. Wood, plastic and rubber are insulators: a loop with one in it is broken.',
        es: 'Los metales son conductores. La madera, el plástico y la goma son aislantes: un circuito con uno de ellos está cortado.'
      }
    },
    {
      ch: 'm2', icon: '⚠️', en: 'A short circuit lights nothing.', es: 'Un cortocircuito no enciende nada.',
      why: {
        en: 'If wire alone joins the eel’s two ends, the dots race round the shortcut and skip every firefly. A real battery gets hot, so never try it.',
        es: 'Si solo un cable une los dos extremos de la anguila, los puntitos corren por el atajo y se saltan todas las luciérnagas. Una pila de verdad se calienta, así que nunca lo intentes.'
      }
    },
    {
      ch: 'm3', icon: '💡', en: 'In a row: dim. Side by side: bright.', es: 'En fila: poco. Lado a lado: mucho.',
      why: {
        en: 'Fireflies in a row share the eel’s push. Side by side, each one has its own path and gets the whole push.',
        es: 'Las luciérnagas en fila se reparten el empuje de la anguila. Lado a lado, cada una tiene su propio camino y recibe todo el empuje.'
      }
    },
    {
      ch: 'h1', icon: '🧩', en: 'Design the loop for the brightness you want.', es: 'Diseña el circuito para el brillo que quieres.',
      why: {
        en: 'Put fireflies in a row to share, side by side to keep them bright, and a plain wire around one to put it to sleep.',
        es: 'Pon luciérnagas en fila para que compartan, lado a lado para que brillen mucho, y un cable solo a su lado para dormir a una.'
      }
    },
    {
      ch: 'h2', icon: '🎚️', en: 'A switch opens and closes a loop.', es: 'Un interruptor abre y cierra un circuito.',
      why: {
        en: 'An open switch is a gap: no dots cross it. A closed switch is just a piece of wire.',
        es: 'Un interruptor abierto es un hueco: ningún puntito lo cruza. Uno cerrado es solo un trozo de cable.'
      }
    },
    {
      ch: 'h3', icon: '🌟', en: 'The firefly that carries more glows more.', es: 'La luciérnaga que lleva más brilla más.',
      why: {
        en: 'A firefly in a row with a pair carries all the pair’s dots, so it glows more than either of them.',
        es: 'Una luciérnaga en fila con una pareja lleva todos los puntitos de la pareja, así que brilla más que cada una de ellas.'
      }
    }
  ],
  lever: [
    {
      ch: 'e1', icon: '⚖️', en: 'Weight and distance both count.', es: 'El peso y la distancia cuentan los dos.',
      why: {
        en: 'A heavier animal pushes down harder, and so does an animal further from the rock.',
        es: 'Un animal más pesado empuja más hacia abajo, y también uno que está más lejos de la roca.'
      }
    },
    {
      ch: 'e2', icon: '🐘', en: 'A small push far out can lift a big load.', es: 'Un empujón pequeño, lejos, puede levantar una carga grande.',
      why: {
        en: 'Sit far from the rock and even a mouse can lift an elephant on a long enough plank.',
        es: 'Siéntate lejos de la roca y hasta un ratón puede levantar a un elefante con una tabla bastante larga.'
      }
    },
    {
      ch: 'e3', icon: '➖', en: 'Equal pushes balance.', es: 'Empujes iguales se equilibran.',
      why: {
        en: 'When weight × steps is the same on both sides, the plank stays level.',
        es: 'Cuando peso × pasos es igual en los dos lados, la tabla queda plana.'
      }
    },
    {
      ch: 'm1', icon: '🤔', en: 'Heavier does not always win.', es: 'Lo más pesado no siempre gana.',
      why: {
        en: 'Multiply each side’s weight by its steps. A light animal far out can beat a heavy one close in.',
        es: 'Multiplica el peso de cada lado por sus pasos. Un animal ligero lejos puede ganarle a uno pesado cerca.'
      }
    },
    {
      ch: 'm2', icon: '🐰', en: 'Add up every animal’s push.', es: 'Suma el empuje de cada animal.',
      why: {
        en: 'Each animal pushes weight × steps. Add them up for each side, then compare.',
        es: 'Cada animal empuja peso × pasos. Súmalos en cada lado y compara.'
      }
    },
    {
      ch: 'm3', icon: '📐', en: 'A lever trades force for distance.', es: 'Una palanca cambia fuerza por distancia.',
      why: {
        en: 'The far end moves a long way while the near end moves a little. Easier lifting, longer pushing: no free work.',
        es: 'El extremo lejano se mueve mucho y el cercano poco. Levantas más fácil, pero empujas más trecho: nada sale gratis.'
      }
    },
    {
      ch: 'h1', icon: '✖️', en: 'Multiply, never add.', es: 'Multiplica, nunca sumes.',
      why: {
        en: 'Weight + steps can give the wrong answer. Weight × steps always gives the right one.',
        es: 'Peso + pasos puede dar la respuesta equivocada. Peso × pasos siempre da la correcta.'
      }
    },
    {
      ch: 'h2', icon: '🧮', en: 'Many ways to push, one way to balance.', es: 'Muchas formas de empujar, una de equilibrar.',
      why: {
        en: 'Try the big numbers first: the heaviest animal decides the most.',
        es: 'Prueba primero los números grandes: el animal más pesado decide más.'
      }
    },
    {
      ch: 'h3', icon: '🪵', en: 'The plank weighs something too.', es: 'La tabla también pesa.',
      why: {
        en: 'If the rock is not under the middle, the plank’s own weight pushes on its longer side, from its middle.',
        es: 'Si la roca no está bajo el medio, el propio peso de la tabla empuja en su lado más largo, desde su medio.'
      }
    }
  ],
  slide: [
    {
      ch: 'e1', icon: '🌀', en: 'Out of a curve, it goes straight.', es: 'Al salir de una curva, sigue recto.',
      why: {
        en: 'A tube turns the penguin only while it is inside. Out of the tube, it slides straight on, the way the tube pointed.',
        es: 'El tubo hace girar al pingüino solo mientras está dentro. Al salir, sigue recto, hacia donde apuntaba el tubo.'
      }
    },
    {
      ch: 'e2', icon: '⛰️', en: 'You cannot slide higher than you started.', es: 'No puedes deslizarte más alto que donde empezaste.',
      why: {
        en: 'A slider gets over a hill only if the top is lower than its start. The snow steals a little, so an equal hill stops it.',
        es: 'Un deslizador pasa una colina solo si la cima está más baja que su salida. La nieve le quita un poco, así que una colina igual lo detiene.'
      }
    },
    {
      ch: 'e3', icon: '💦', en: 'Off a ledge, it flies in a curve.', es: 'Al salir de una repisa, vuela en curva.',
      why: {
        en: 'It keeps going forward while it falls, so its path bends down like a rainbow and lands ahead of the ledge.',
        es: 'Sigue avanzando mientras cae, así que su camino se dobla como un arcoíris y cae delante de la repisa.'
      }
    },
    {
      ch: 'm1', icon: '➰', en: 'However twisty, the end decides.', es: 'Por muchas curvas que tenga, decide el final.',
      why: {
        en: 'Only the very end of the tube matters: the penguin leaves along the way the tube points there.',
        es: 'Solo importa el final del tubo: el pingüino sale en la dirección en que apunta el tubo allí.'
      }
    },
    {
      ch: 'm2', icon: '🏔️', en: 'The first hill as high as the start stops it.', es: 'La primera colina tan alta como la salida lo detiene.',
      why: {
        en: 'Every lower hill is fine. The first one that reaches the start height is where the penguin turns back.',
        es: 'Todas las colinas más bajas se pasan. La primera que llega a la altura de salida es donde el pingüino se da la vuelta.'
      }
    },
    {
      ch: 'm3', icon: '🎯', en: 'Faster or higher: it lands further out.', es: 'Más rápido o más alto: cae más lejos.',
      why: {
        en: 'A longer slide makes it faster; a higher ledge gives it longer in the air. Both carry it further.',
        es: 'Una deslizada más larga lo hace más rápido; una repisa más alta le da más tiempo en el aire. Las dos cosas lo llevan más lejos.'
      }
    },
    {
      ch: 'h1', icon: '🐧', en: 'Distance = speed × time in the air.', es: 'Distancia = velocidad × tiempo en el aire.',
      why: {
        en: 'The drop down the shelf sets the speed; the ledge sets the ticks in the air. Multiply them.',
        es: 'La bajada de la repisa da la velocidad; la altura de la repisa da los tics en el aire. Multiplícalos.'
      }
    },
    {
      ch: 'h2', icon: '🎿', en: 'Every rule at once.', es: 'Todas las reglas a la vez.',
      why: {
        en: 'The start must be high enough to clear the hill, and just right to land in the pool.',
        es: 'La salida debe ser lo bastante alta para pasar la colina, y la justa para caer en la piscina.'
      }
    },
    {
      ch: 'h3', icon: '🔀', en: 'Follow it piece by piece.', es: 'Síguelo pieza a pieza.',
      why: {
        en: 'Out of each tube it goes straight, until the next tube turns it.',
        es: 'Al salir de cada tubo va recto, hasta que el siguiente tubo lo hace girar.'
      }
    }
  ],
  chain: [
    {
      ch: 'e1', icon: '🦓', en: 'Plants feed plant-eaters.', es: 'Las plantas alimentan a los que comen plantas.',
      why: {
        en: 'Each arrow means “gives food to”, and it points at the one who eats.',
        es: 'Cada flecha quiere decir «le da comida a», y apunta al que come.'
      }
    },
    {
      ch: 'e2', icon: '☀️', en: 'Plants make their own food.', es: 'Las plantas hacen su propia comida.',
      why: {
        en: 'From sunlight, air and water. Soil gives them water and minerals, but not their food.',
        es: 'Con luz del sol, aire y agua. La tierra les da agua y minerales, pero no su comida.'
      }
    },
    {
      ch: 'e3', icon: '🦁', en: 'Meat-eaters come further along.', es: 'Los que comen carne van más adelante.',
      why: {
        en: 'A lion’s food came from a zebra, whose food came from grass, whose energy came from the Sun.',
        es: 'La comida del león vino de una cebra, cuya comida vino del pasto, cuya energía vino del Sol.'
      }
    },
    {
      ch: 'm1', icon: '🧩', en: 'Every link must be true.', es: 'Cada eslabón tiene que ser verdad.',
      why: {
        en: 'Check both arrows: what it eats, and who eats it.',
        es: 'Revisa las dos flechas: lo que come, y quién se lo come.'
      }
    },
    {
      ch: 'm2', icon: '↔️', en: 'The arrow points to the eater.', es: 'La flecha apunta al que come.',
      why: {
        en: 'Food, and the Sun’s energy in it, goes from the one eaten to the one who eats.',
        es: 'La comida, y la energía del Sol que lleva, va del que es comido al que come.'
      }
    },
    {
      ch: 'm3', icon: '🐧', en: 'The sea has food chains too.', es: 'El mar también tiene cadenas de comida.',
      why: {
        en: 'Tiny drifting plants feed krill, and krill feed penguins, seals and whales.',
        es: 'Plantitas diminutas que flotan alimentan al kril, y el kril alimenta a pingüinos, focas y ballenas.'
      }
    },
    {
      ch: 'h1', icon: '🕸️', en: 'Chains join into webs.', es: 'Las cadenas se unen en redes.',
      why: {
        en: 'Most animals eat more than one food. A hunter at the top does not eat everything below it.',
        es: 'Casi todos los animales comen más de una cosa. Un cazador de arriba no se come todo lo que tiene debajo.'
      }
    },
    {
      ch: 'h2', icon: '🍽️', en: 'Everything is connected.', es: 'Todo está conectado.',
      why: {
        en: 'Take one away, and the animals that ate only that go hungry, then the ones that ate them.',
        es: 'Quita uno, y los animales que solo comían eso se quedan con hambre, y luego los que se los comían.'
      }
    },
    {
      ch: 'h3', icon: '♻️', en: 'Makers, eaters and recyclers.', es: 'Productores, consumidores y recicladores.',
      why: {
        en: 'Plants make food; animals eat plants, animals, or both; recyclers turn leftovers back into soil.',
        es: 'Las plantas hacen comida; los animales comen plantas, animales o de todo; los recicladores vuelven tierra los restos.'
      }
    }
  ],
  fountain: [
    {
      ch: 'e1', icon: '⛏️', en: 'Water goes down if it can.', es: 'El agua baja si puede.',
      why: {
        en: 'It falls straight down until something stops it, so a hole in the right place lets it through.',
        es: 'Cae recto hasta que algo la detiene, así que un hueco en el lugar justo la deja pasar.'
      }
    },
    {
      ch: 'e2', icon: '🥇', en: 'Water takes the first way down.', es: 'El agua toma el primer camino hacia abajo.',
      why: {
        en: 'When it lands, it runs sideways to the nearest way down, and fills whatever it reaches first.',
        es: 'Cuando cae, corre de lado hasta el camino más cercano para bajar, y llena lo primero que alcanza.'
      }
    },
    {
      ch: 'e3', icon: '🚪', en: 'A gate decides where water goes.', es: 'Una compuerta decide adónde va el agua.',
      why: {
        en: 'An open gate lets water through; a shut one makes it go another way.',
        es: 'Una compuerta abierta deja pasar el agua; una cerrada la hace ir por otro lado.'
      }
    },
    {
      ch: 'm1', icon: '🌊', en: 'Fill, then spill.', es: 'Se llena y luego se derrama.',
      why: {
        en: 'Water fills a hollow from the bottom up, and spills over the lowest edge.',
        es: 'El agua llena un hueco de abajo hacia arriba, y se derrama por el borde más bajo.'
      }
    },
    {
      ch: 'm2', icon: '🫙', en: 'Joined tubes end up level.', es: 'Los tubos unidos quedan al mismo nivel.',
      why: {
        en: 'Pour into one, and the water rises in both together until they are the same height.',
        es: 'Echa agua en uno, y sube en los dos a la vez hasta quedar a la misma altura.'
      }
    },
    {
      ch: 'm3', icon: '🐈', en: 'Plan the path before you pour.', es: 'Planea el camino antes de echar el agua.',
      why: {
        en: 'Water goes everywhere it can reach, so shut off the ways you do not want it to go.',
        es: 'El agua va a todas partes adonde puede llegar, así que cierra los caminos que no quieres.'
      }
    },
    {
      ch: 'h1', icon: '💧', en: 'Every drop counts.', es: 'Cada gota cuenta.',
      why: {
        en: 'With only a few drops, water that fills a hollow on the way never reaches the animals.',
        es: 'Con pocas gotas, el agua que llena un hueco por el camino nunca llega a los animales.'
      }
    },
    {
      ch: 'h2', icon: '⚖️', en: 'Wide or thin, the same height.', es: 'Ancho o delgado, la misma altura.',
      why: {
        en: 'A wide tube does not keep its water lower: joined water always settles level.',
        es: 'Un tubo ancho no deja su agua más baja: el agua unida siempre queda al mismo nivel.'
      }
    },
    {
      ch: 'h3', icon: '🧩', en: 'Trace the water, step by step.', es: 'Sigue el agua, paso a paso.',
      why: {
        en: 'Down first, then sideways to the nearest way down, filling as it goes.',
        es: 'Primero hacia abajo, luego de lado hasta el camino más cercano para bajar, llenando por el camino.'
      }
    }
  ],
  shadow: [
    {
      ch: 'e1', icon: '🐇', en: 'A shadow has its maker’s outline.', es: 'Una sombra tiene el contorno de quien la hace.',
      why: {
        en: 'Light goes in straight lines, so the place the puppet blocks is exactly its shape.',
        es: 'La luz va en línea recta, así que el lugar que tapa el títere tiene justo su forma.'
      }
    },
    {
      ch: 'e2', icon: '🔍', en: 'Nearer the lamp, bigger the shadow.', es: 'Más cerca de la lámpara, sombra más grande.',
      why: {
        en: 'A puppet close to the lamp blocks a wide cone of light, so its shadow on the wall is big.',
        es: 'Un títere cerca de la lámpara tapa un cono ancho de luz, así que su sombra en la pared es grande.'
      }
    },
    {
      ch: 'e3', icon: '🌅', en: 'Low sun, long shadow.', es: 'Sol bajo, sombra larga.',
      why: {
        en: 'Morning and evening shadows are long; at lunchtime, with the sun high, they are short.',
        es: 'Por la mañana y por la tarde las sombras son largas; al mediodía, con el sol alto, son cortas.'
      }
    },
    {
      ch: 'm1', icon: '🦒', en: 'Shape and size are separate clues.', es: 'La forma y el tamaño son pistas distintas.',
      why: {
        en: 'The outline tells you which puppet; the size tells you how far from the lamp.',
        es: 'El contorno te dice qué títere; el tamaño te dice qué tan lejos de la lámpara.'
      }
    },
    {
      ch: 'm2', icon: '💡', en: 'Moving the lamp works too.', es: 'Mover la lámpara también funciona.',
      why: {
        en: 'What matters is how much nearer the puppet is to the lamp than the wall is.',
        es: 'Lo que importa es cuánto más cerca de la lámpara está el títere que la pared.'
      }
    },
    {
      ch: 'm3', icon: '🪟', en: 'Some things let light through.', es: 'Algunas cosas dejan pasar la luz.',
      why: {
        en: 'Opaque card makes a dark shadow, see-through tissue a pale one, clear glass almost none.',
        es: 'El cartón opaco hace una sombra oscura, el papel de seda una clarita, el vidrio transparente casi ninguna.'
      }
    },
    {
      ch: 'h1', icon: '↕️', en: 'The shadow moves against the lamp.', es: 'La sombra se mueve al revés que la lámpara.',
      why: {
        en: 'Lamp, puppet and shadow are always in one straight line, so raising the lamp lowers the shadow.',
        es: 'La lámpara, el títere y la sombra siempre están en línea recta, así que subir la lámpara baja la sombra.'
      }
    },
    {
      ch: 'h2', icon: '📏', en: 'Shadow size = puppet × 12 ÷ step.', es: 'Tamaño de la sombra = títere × 12 ÷ paso.',
      why: {
        en: 'Straight light makes similar triangles: the shadow grows by the wall’s distance over the puppet’s.',
        es: 'La luz recta forma triángulos semejantes: la sombra crece según la distancia de la pared entre la del títere.'
      }
    },
    {
      ch: 'h3', icon: '💡', en: 'Two lamps, two shadows.', es: 'Dos lámparas, dos sombras.',
      why: {
        en: 'Each lamp makes its own shadow; against the wall they land together and look like one.',
        es: 'Cada lámpara hace su propia sombra; pegado a la pared caen juntas y parecen una sola.'
      }
    }
  ],
  magnet: [
    {
      ch: 'e1', icon: '🧲', en: 'Different ends pull. Same ends push.', es: 'Extremos distintos se atraen. Iguales se empujan.',
      why: {
        en: 'Every magnet has an N end and an S end. N and S pull together; N and N, or S and S, push apart.',
        es: 'Todo imán tiene un extremo N y un extremo S. La N y la S se atraen; N con N, o S con S, se empujan.'
      }
    },
    {
      ch: 'e2', icon: '🤗', en: 'A line hugs when all point the same way.', es: 'Una fila se abraza si todos apuntan igual.',
      why: {
        en: 'Then every N meets an S, all the way along.',
        es: 'Así cada N toca una S, de punta a punta.'
      }
    },
    {
      ch: 'e3', icon: '📎', en: 'Magnets pull iron and steel, not every metal.', es: 'Los imanes atraen el hierro y el acero, no todos los metales.',
      why: {
        en: 'Aluminium, copper, gold and silver are metals, but a magnet does not pull them. Wood, paper and plastic don’t stick either.',
        es: 'El aluminio, el cobre, el oro y la plata son metales, pero el imán no los atrae. La madera, el papel y el plástico tampoco se pegan.'
      }
    },
    {
      ch: 'm1', icon: '↔️', en: 'Side by side, magnets hug pointing opposite ways.', es: 'Lado a lado, los imanes se abrazan apuntando al revés.',
      why: {
        en: 'Lying side by side, N lies next to S only when they point opposite ways.',
        es: 'Acostados lado a lado, la N queda junto a la S solo si apuntan hacia lados opuestos.'
      }
    },
    {
      ch: 'm2', icon: '⚡', en: 'The pull goes through things, and gets weaker with distance.', es: 'La fuerza atraviesa cosas y se debilita con la distancia.',
      why: {
        en: 'Paper, wood, water, glass and plastic do not block a magnet. Bigger is not stronger: a small magnet can be the strongest.',
        es: 'El papel, la madera, el agua, el vidrio y el plástico no frenan a un imán. Más grande no es más fuerte: un imán pequeño puede ser el más fuerte.'
      }
    },
    {
      ch: 'm3', icon: '🗼', en: 'Same faces push, so rings float.', es: 'Las caras iguales se empujan, así que los anillos flotan.',
      why: {
        en: 'Ring magnets on a pole float when like faces meet. The lower gaps are smaller, because they hold up more rings.',
        es: 'Los anillos imantados en un palo flotan cuando se tocan caras iguales. Los huecos de abajo son más pequeños, porque sostienen más anillos.'
      }
    },
    {
      ch: 'h1', icon: '🧩', en: 'Turning one magnet changes every pair it touches.', es: 'Girar un imán cambia cada par que toca.',
      why: {
        en: 'Turn a magnet round and its N and S swap places, so each hug next to it becomes a push, and each push a hug. Steel is the exception: it always hugs.',
        es: 'Si giras un imán, su N y su S cambian de lugar, así que cada abrazo a su lado se vuelve empujón, y cada empujón, abrazo. El acero es la excepción: siempre abraza.'
      }
    },
    {
      ch: 'h2', icon: '🕵️', en: 'A pull proves nothing. A push proves a magnet.', es: 'Atraer no prueba nada. Empujar prueba que es un imán.',
      why: {
        en: 'A magnet pulls plain iron too, so a pull could be either. Only a magnet can push a magnet away.',
        es: 'Un imán también atrae el hierro común, así que atraer puede ser cualquiera de los dos. Solo un imán puede empujar a otro imán.'
      }
    },
    {
      ch: 'h3', icon: '🧭', en: 'A compass needle points along the magnet’s pull.', es: 'La aguja de la brújula apunta a lo largo de la fuerza del imán.',
      why: {
        en: 'Outside a magnet, the pull runs from its N end round to its S end, and the needle’s N end follows it. That is how a compass finds the Earth’s north too.',
        es: 'Fuera de un imán, la fuerza va de su N hasta su S, y la N de la aguja la sigue. Así la brújula encuentra también el norte de la Tierra.'
      }
    }
  ],
  domino: [
    {
      ch: 'e1', icon: '🁢', en: 'Each part passes a push along.', es: 'Cada pieza pasa el empujón.',
      why: {
        en: 'A machine is a chain: if one link is missing, everything after it stays still.',
        es: 'Una máquina es una cadena: si falta un eslabón, todo lo que sigue se queda quieto.'
      }
    },
    {
      ch: 'e2', icon: '📐', en: 'A ramp turns falling into rolling.', es: 'La rampa convierte la caída en rodar.',
      why: {
        en: 'The ball always rolls downhill, so the ramp must slope the way the shelf runs.',
        es: 'La pelota siempre rueda cuesta abajo, así que la rampa debe bajar hacia donde va el estante.'
      }
    },
    {
      ch: 'e3', icon: '🔔', en: 'Guess first, then watch.', es: 'Primero adivina, luego mira.',
      why: {
        en: 'Scientists say what they think will happen, test it, and learn the most from surprises.',
        es: 'Los científicos dicen qué creen que pasará, lo prueban y aprenden más de las sorpresas.'
      }
    },
    {
      ch: 'm1', icon: '📏', en: 'A domino can knock over one about 1½ times its height.', es: 'Un dominó puede tumbar a otro de 1½ veces su altura.',
      why: {
        en: 'The scientist Lorne Whitehead found this in 1983. So a row that grows a little each time can end with a very big domino.',
        es: 'El científico Lorne Whitehead lo descubrió en 1983. Así, una fila que crece un poco cada vez puede terminar en un dominó enorme.'
      }
    },
    {
      ch: 'm2', icon: '🪣', en: 'Machines change one kind of movement into another.', es: 'Las máquinas cambian un movimiento por otro.',
      why: {
        en: 'A seesaw and a pulley turn a drop into a lift. A fan turns a press of its switch into wind.',
        es: 'Un subibaja y una polea convierten una caída en una subida. Un ventilador convierte apretar su botón en viento.'
      }
    },
    {
      ch: 'm3', icon: '✌️', en: 'Fix one gap at a time, from the start.', es: 'Arregla un hueco a la vez, desde el principio.',
      why: {
        en: 'Engineers follow a machine step by step, and fix each problem where it happens.',
        es: 'Los ingenieros siguen la máquina paso a paso y arreglan cada problema donde ocurre.'
      }
    },
    {
      ch: 'h1', icon: '🛑', en: 'Find where the chain breaks.', es: 'Encuentra dónde se rompe la cadena.',
      why: {
        en: 'Everything before the break moves, and nothing after it does.',
        es: 'Todo lo que está antes del corte se mueve, y nada de lo que está después.'
      }
    },
    {
      ch: 'h2', icon: '🧩', en: 'Not every part fits every job.', es: 'No toda pieza sirve para todo.',
      why: {
        en: 'A ball carries a push along a shelf, but only a ramp turns a fall into a roll. Check each part against the rules.',
        es: 'Una pelota lleva el empujón por el estante, pero solo una rampa convierte una caída en rodar. Comprueba cada pieza con las reglas.'
      }
    },
    {
      ch: 'h3', icon: '🦕', en: 'A tiny push can set off a giant.', es: 'Un empujoncito puede tumbar a un gigante.',
      why: {
        en: 'Each standing domino holds energy. In one test, 13 dominoes, each 1½ times the last, grew from 5 millimetres to a block of 45 kilograms.',
        es: 'Cada dominó de pie guarda energía. En una prueba, 13 dominós, cada uno 1½ veces el anterior, crecieron de 5 milímetros a un bloque de 45 kilos.'
      }
    }
  ]
};

/** Every idea of the live games, flattened: [{ game, ch, icon, en, es }]. */
export const liveIdeas = () => GAMES.filter((g) => g.live)
  .flatMap((g) => IDEAS[g.id].map((i) => ({ game: g.id, ...i })));

export default { LANGS: ['en', 'es'], otherLang, fill, lookup, ROOM, ui, LEVEL_AGES, GAMES, gameById, IDEAS, liveIdeas };
