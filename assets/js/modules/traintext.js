/**
 * traintext.js — every word Fruit Train says, in English and Spanish.
 *
 * Animals and things carry their Spanish article ("el hipopótamo", "la
 * piña"), and every name is singular ("bunch of grapes", "racimo de uvas")
 * so a sentence's verb never has to guess. The "why" lines follow
 * research-motion.md section 5; the Spanish is a draft owed a native read.
 */

import { lookup } from './logictext.js';

export const TRAIN_TEXT = {
  en: {
    'ch.e1': 'All aboard!',
    'ch.e1.idea': 'Let go in the right place to feed the hungry animal.',
    'ch.e2': 'Which lands first?',
    'ch.e2.idea': 'A big fruit and a small one, let go together from the tower.',
    'ch.e3': 'Faster and higher',
    'ch.e3.idea': 'A faster train, or a longer drop: let go sooner!',
    'ch.m1': 'Where will it land?',
    'ch.m1.idea': 'The monkey lets go here. Where does the fruit land?',
    'ch.m2': 'Count the gaps',
    'ch.m2.idea': 'How far does a falling fruit drop in each tick?',
    'ch.m3': 'Two hungry friends',
    'ch.m3.idea': 'One train, two animals, two drops.',
    'ch.h1': 'Express train',
    'ch.h1.idea': 'Fast trains and tall drops.',
    'ch.h2': 'Set the speed',
    'ch.h2.idea': 'The monkey lets go at the sign. How fast should the train go?',
    'ch.h3': 'Race to the ground',
    'ch.h3.idea': 'What really decides which one lands first?',

    'tile.drop': 'Feed the animal',
    'tile.land': 'Where it lands',
    'tile.speed': 'Set the speed',
    'tile.gaps': 'Count the gaps',
    'tile.pair': 'Which lands first',

    'ask.drop0': 'The train is standing still. Where should the monkey let go of the fruit?',
    'ask.drop': 'The train moves {vv} every tick. Where should the monkey let go of the fruit?',
    'ask.land': 'The train moves {vv} every tick. The monkey lets go at the pin. Where will {it} land?',
    'ask.speed': 'The monkey can only let go at the pin. How fast must the train go?',
    'ask.gaps': '{It} falls, and goes faster and faster. In the first tick it falls 1 row. In the second tick it falls 3 rows.',
    'ask.pair': 'Both are let go at the same moment. Which one lands first?',
    hungry: '{It} is hungry!',
    forWho: 'Feed {it}',
    spot: 'Spot {n}',
    mark: 'Mark {n}',
    stopped: 'Stopped',
    speedN: '{n} squares a tick',
    speed1: '1 square a tick',
    'q.step': 'How many rows does it fall in tick {n}?',
    'q.total': 'How many rows has it fallen after {n} ticks?',
    'q.ticks': 'How many ticks does it take to fall {n} rows?',
    rowsN: '{n} rows', rows1: '1 row', ticksN: '{n} ticks', ticks1: '1 tick', squaresN: '{n} squares', squares1: '1 square',
    first: '{x} first',
    together: 'Together',
    race: 'Race {n}',
    fromTower: 'from {h} rows up',
    onTrain: 'on a train going {v} a tick',
    letter: '{x}: {it}',
    go: 'Go, train!',
    drop: 'Let go!',
    pickAll: 'Choose for every one first.',

    yum: '✓ Yum! {It} got the fruit.',
    missAhead: 'Surprise! The fruit kept moving forward and landed {dd} ahead of where the monkey let go.',
    missDown: 'The train was standing still, so the fruit fell straight down.',
    landedAt: '✓ It landed at mark {n}, just as you said.',
    landedSurprise: 'Surprise! It landed at mark {n}.',
    speedRight: '✓ Right speed: {It} got the fruit.',
    speedMiss: 'Surprise! At that speed the fruit landed {dd} ahead of the pin.',
    gapRight: '✓ {n}, just as you said.',
    gapSurprise: 'Surprise! It is {n}.',
    pairRight: '✓ {r}, just as you said.',
    pairSurprise: 'Surprise! {r}.',
    rFirst: '{x} landed first',
    rTogether: 'They landed together',

    'why.drop': 'The fruit keeps moving forward with the train while it falls. It falls for {nn} and moves {vv} each tick, so it lands {dd} ahead of where the monkey let go.',
    'why.drop0': 'The train is standing still, so the fruit falls straight down.',
    'why.speed': 'A fall of {hh} takes {nn}. To land {dd} ahead in {nn}, the train must go {vv} a tick.',
    'why.step': 'Each tick a falling thing drops 2 rows more than the tick before: 1, 3, 5, 7… It keeps speeding up.',
    'why.total': 'Add up the ticks: 1 + 3 + 5 and so on. After {n} ticks that is {n} × {n} = {t} rows.',
    'why.ticks': '1 tick: 1 row. 2 ticks: 4 rows. 3 ticks: 9 rows. 4 ticks: 16 rows. So {h} rows takes {n} ticks.',
    'why.same': 'Heavy and light fall together. Gravity pulls the heavy one harder, but it is also harder to get moving, so they stay side by side.',
    'why.air': '{It} is light and wide, so the air pushes on it and it drifts down slowly. On the Moon there is no air, and a feather falls as fast as a hammer!',
    'why.lower': 'The one that starts lower has less far to fall, so it lands first. Being heavy, or moving sideways, does not change how fast things fall.',
    'why.sameMove': 'They start at the same height, so they land together, even though one of them is also moving sideways.',
    hintMove: 'It falls for {nn}. Each tick the train moves {vv}. How far ahead is that?',
    hintStill: 'When the train is standing still, the fruit falls straight down.',
    hintPath: 'Here is the fruit’s path, worked backwards from the mouth.',
    hintSpeed: 'It falls for {nn}. It must land {dd} ahead of the pin.',
    hintGaps: 'Each tick it falls 2 rows more than the tick before.',
    hintPair: 'Look at how high each one starts. Does being heavy change how fast things fall?',
    tick: 'tick {n}',

    'eater.hippo': 'hippo', 'eater.elephant': 'elephant', 'eater.gorilla': 'gorilla', 'eater.orangutan': 'orangutan',
    'eater.bear': 'bear', 'eater.parrot': 'parrot', 'eater.turtle': 'turtle', 'eater.panda': 'panda',
    'thing.watermelon': 'watermelon', 'thing.apple': 'apple', 'thing.grapes': 'bunch of grapes', 'thing.orange': 'orange',
    'thing.pear': 'pear', 'thing.pineapple': 'pineapple', 'thing.mango': 'mango', 'thing.banana': 'banana',
    'thing.strawberry': 'strawberry', 'thing.rock': 'rock', 'thing.bowling': 'bowling ball', 'thing.feather': 'feather',
    'thing.leaf': 'leaf', 'thing.paper': 'sheet of paper', 'thing.balloon': 'balloon'
  },
  es: {
    'ch.e1': '¡Todos a bordo!',
    'ch.e1.idea': 'Suelta la fruta en el lugar justo para dar de comer al animal.',
    'ch.e2': '¿Cuál llega primero?',
    'ch.e2.idea': 'Una fruta grande y una pequeña, soltadas a la vez desde la torre.',
    'ch.e3': 'Más rápido y más alto',
    'ch.e3.idea': 'Un tren más rápido o una caída más larga: ¡suelta antes!',
    'ch.m1': '¿Dónde caerá?',
    'ch.m1.idea': 'El mono la suelta aquí. ¿Dónde cae la fruta?',
    'ch.m2': 'Cuenta los espacios',
    'ch.m2.idea': '¿Cuánto baja una fruta que cae en cada tic?',
    'ch.m3': 'Dos amigos con hambre',
    'ch.m3.idea': 'Un tren, dos animales, dos frutas.',
    'ch.h1': 'Tren expreso',
    'ch.h1.idea': 'Trenes rápidos y caídas altas.',
    'ch.h2': 'Elige la velocidad',
    'ch.h2.idea': 'El mono suelta la fruta en la señal. ¿A qué velocidad debe ir el tren?',
    'ch.h3': 'Carrera hasta el suelo',
    'ch.h3.idea': '¿Qué decide de verdad cuál llega primero?',

    'tile.drop': 'Da de comer',
    'tile.land': 'Dónde cae',
    'tile.speed': 'La velocidad',
    'tile.gaps': 'Cuenta los espacios',
    'tile.pair': 'Cuál llega primero',

    'ask.drop0': 'El tren está parado. ¿Dónde debe soltar la fruta el mono?',
    'ask.drop': 'El tren avanza {vv} en cada tic. ¿Dónde debe soltar la fruta el mono?',
    'ask.land': 'El tren avanza {vv} en cada tic. El mono la suelta en el alfiler. ¿Dónde caerá {it}?',
    'ask.speed': 'El mono solo puede soltar la fruta en el alfiler. ¿A qué velocidad debe ir el tren?',
    'ask.gaps': '{It} cae, y va cada vez más rápido. En el primer tic baja 1 fila. En el segundo tic baja 3 filas.',
    'ask.pair': 'Se sueltan los dos en el mismo momento. ¿Cuál llega primero al suelo?',
    hungry: '¡{It} tiene hambre!',
    forWho: 'Para {it}',
    spot: 'Lugar {n}',
    mark: 'Marca {n}',
    stopped: 'Parado',
    speedN: '{n} casillas por tic',
    speed1: '1 casilla por tic',
    'q.step': '¿Cuántas filas baja en el tic {n}?',
    'q.total': '¿Cuántas filas ha bajado después de {n} tics?',
    'q.ticks': '¿Cuántos tics tarda en bajar {n} filas?',
    rowsN: '{n} filas', rows1: '1 fila', ticksN: '{n} tics', ticks1: '1 tic', squaresN: '{n} casillas', squares1: '1 casilla',
    first: 'Primero {x}',
    together: 'A la vez',
    race: 'Carrera {n}',
    fromTower: 'desde {h} filas de alto',
    onTrain: 'en un tren que va a {v} por tic',
    letter: '{x}: {it}',
    go: '¡Arranca, tren!',
    drop: '¡Suéltalas!',
    pickAll: 'Primero elige para todas.',

    yum: '✓ ¡Ñam! {It} atrapó la fruta.',
    missAhead: '¡Sorpresa! La fruta siguió avanzando y cayó {dd} más adelante de donde la soltó el mono.',
    missDown: 'El tren estaba parado, así que la fruta cayó recto hacia abajo.',
    landedAt: '✓ Cayó en la marca {n}, como dijiste.',
    landedSurprise: '¡Sorpresa! Cayó en la marca {n}.',
    speedRight: '✓ ¡Velocidad justa! {It} atrapó la fruta.',
    speedMiss: '¡Sorpresa! A esa velocidad la fruta cayó {dd} más adelante del alfiler.',
    gapRight: '✓ {n}, como dijiste.',
    gapSurprise: '¡Sorpresa! Son {n}.',
    pairRight: '✓ {r}, como dijiste.',
    pairSurprise: '¡Sorpresa! {r}.',
    rFirst: 'Llegó primero {x}',
    rTogether: 'Llegaron a la vez',

    'why.drop': 'La fruta sigue avanzando con el tren mientras cae. Cae durante {nn} y avanza {vv} en cada tic, así que cae {dd} más adelante de donde la soltó el mono.',
    'why.drop0': 'El tren está parado, así que la fruta cae recto hacia abajo.',
    'why.speed': 'Una caída de {hh} tarda {nn}. Para caer {dd} más adelante en {nn}, el tren debe ir a {vv} por tic.',
    'why.step': 'En cada tic, lo que cae baja 2 filas más que en el tic anterior: 1, 3, 5, 7… Va cada vez más rápido.',
    'why.total': 'Suma los tics: 1 + 3 + 5 y así. Después de {n} tics son {n} × {n} = {t} filas.',
    'why.ticks': '1 tic: 1 fila. 2 tics: 4 filas. 3 tics: 9 filas. 4 tics: 16 filas. Así que {h} filas tardan {n} tics.',
    'why.same': 'Lo pesado y lo ligero caen juntos. La gravedad jala más fuerte lo pesado, pero también cuesta más moverlo, así que bajan lado a lado.',
    'why.air': '{It} pesa poco para lo ancho que es, así que el aire frena su caída y baja despacio. ¡En la Luna no hay aire, y una pluma cae tan rápido como un martillo!',
    'why.lower': 'La que empieza más abajo tiene menos camino que caer, así que llega primero. Ser pesada, o moverse de lado, no cambia lo rápido que caen las cosas.',
    'why.sameMove': 'Empiezan a la misma altura, así que llegan a la vez, aunque una de ellas también se mueva de lado.',
    hintMove: 'Cae durante {nn}. En cada tic el tren avanza {vv}. ¿Cuánto más adelante es eso?',
    hintStill: 'Cuando el tren está parado, la fruta cae recto hacia abajo.',
    hintPath: 'Este es el camino de la fruta, hacia atrás desde la boca.',
    hintSpeed: 'Cae durante {nn}. Tiene que caer {dd} más adelante del alfiler.',
    hintGaps: 'En cada tic baja 2 filas más que en el tic anterior.',
    hintPair: 'Mira a qué altura empieza cada una. ¿Ser pesada cambia lo rápido que caen las cosas?',
    tick: 'tic {n}',

    'eater.hippo': 'el hipopótamo', 'eater.elephant': 'el elefante', 'eater.gorilla': 'el gorila', 'eater.orangutan': 'el orangután',
    'eater.bear': 'el oso', 'eater.parrot': 'el loro', 'eater.turtle': 'la tortuga', 'eater.panda': 'el panda',
    'thing.watermelon': 'la sandía', 'thing.apple': 'la manzana', 'thing.grapes': 'el racimo de uvas', 'thing.orange': 'la naranja',
    'thing.pear': 'la pera', 'thing.pineapple': 'la piña', 'thing.mango': 'el mango', 'thing.banana': 'el plátano',
    'thing.strawberry': 'la fresa', 'thing.rock': 'la piedra', 'thing.bowling': 'la bola de boliche', 'thing.feather': 'la pluma',
    'thing.leaf': 'la hoja', 'thing.paper': 'la hoja de papel', 'thing.balloon': 'el globo'
  }
};

export const tt = (key, lang, vars) => lookup(TRAIN_TEXT, key, lang, vars);

const cap1 = (x) => x.charAt(0).toUpperCase() + x.slice(1);

/** "the hippo" / "el hipopótamo", for an animal (`eater.`) or a thing (`thing.`). */
export function the(kind, id, L, cap = false) {
  const name = TRAIN_TEXT[L === 'es' ? 'es' : 'en'][`${kind}.${id}`] || id;
  const text = L === 'es' ? name : `the ${name}`;
  return cap ? cap1(text) : text;
}

/** "1 row" / "3 rows", and the same for ticks and squares a tick. */
export const rows = (n, L) => tt(n === 1 ? 'rows1' : 'rowsN', L, { n });
export const ticks = (n, L) => tt(n === 1 ? 'ticks1' : 'ticksN', L, { n });
export const squares = (n, L) => tt(n === 1 ? 'squares1' : 'squaresN', L, { n });
export const speedWords = (v, L) => (v === 0 ? tt('stopped', L) : tt(v === 1 ? 'speed1' : 'speedN', L, { n: v }));

export default { TRAIN_TEXT, tt, the, rows, ticks, squares, speedWords };
