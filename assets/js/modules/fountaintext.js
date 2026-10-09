/**
 * fountaintext.js — every word Elephant Fountain says, in English and
 * Spanish.
 *
 * The "why" lines follow research-levers-shadows-water-dominos.md section
 * 3.6. Animals carry their Spanish article. The Spanish is a draft owed a
 * native read.
 */

import { lookup } from './logictext.js';

export const FOUNTAIN_TEXT = {
  en: {
    'ch.e1': 'Dig a path',
    'ch.e1.idea': 'Dig through the dirt so the water reaches the thirsty animal.',
    'ch.e2': 'Who drinks first?',
    'ch.e2.idea': 'Follow the water down. Which cup fills first?',
    'ch.e3': 'Open the gate',
    'ch.e3.idea': 'Open the right gates, and keep the cat dry!',
    'ch.m1': 'Two thirsty friends',
    'ch.m1.idea': 'Water both animals.',
    'ch.m2': 'Joined tubes',
    'ch.m2.idea': 'Pour into one tube. Where does the water stop in the other?',
    'ch.m3': 'Shh, the cat!',
    'ch.m3.idea': 'Dig and open gates, but the cat must stay dry.',
    'ch.h1': 'Just enough water',
    'ch.h1.idea': 'Only a few drops: none to waste.',
    'ch.h2': 'Wide and thin',
    'ch.h2.idea': 'A wide tube and a thin tube, joined at the bottom.',
    'ch.h3': 'Race to drink',
    'ch.h3.idea': 'Three cups. Which fills first?',

    'tile.build': 'Dig and open', 'tile.first': 'Who drinks first', 'tile.level': 'Joined tubes',

    'ask.build': 'Tap dirt to dig it out, and tap gates to open or shut them. Every animal must drink, and the cat must stay dry.',
    'ask.first': 'The elephant sprays {nn}. Which animal drinks first?',
    'ask.level': 'The elephant pours {nn} into the {side} tube. How high will the water be in the other tube?',
    sideLeft: 'left', sideRight: 'right',
    digsLeft: 'Digs left: {n}',
    noDigs: 'No digging here: just the gates.',
    dropsN: '{n} drops', drops1: '1 drop',
    rowsUp: '{n} rows up', rowUp1: '1 row up',
    go: 'Spray!',
    restart: 'Start over',
    pickOne: 'Choose one first.',
    outOfDigs: 'No digs left. Tap a dug square to fill it back in.',
    dirt: 'Dirt', dug: 'Dug out', gateOpen: 'Gate, open', gateShut: 'Gate, shut', cat: 'The sleeping cat',
    cell: '{what}, row {r}, column {c}',

    allDrank: '✓ Every animal had a drink!',
    catWoke: 'Surprise! The cat woke up: the water reached it.',
    notEnough: 'Surprise! {It} did not get enough water.',
    tryMore: 'Change a dig or a gate and spray again.',
    right: '✓ {res}, just as you said.',
    surprise: 'Surprise! {res}.',
    'res.first': '{It} drank first',
    'res.level': 'The water stopped {rr}',

    'why.down': 'Water always goes down if it can.',
    'why.sideways': 'When it cannot go down, it runs sideways to find a way down.',
    'why.bottom': 'It fills the lowest place first, then rises.',
    'why.same': 'Joined tubes end up at the same height, wide or thin.',
    'why.level': 'The water rose in both tubes together, a row at a time, so it stops at the same height in each.',
    'why.first': 'The water falls and runs down to the first cup it can reach. That one fills before any water goes on.',
    hintBuild: 'Follow the water from the elephant: down first, then sideways to the nearest way down.',
    hintFirst: 'Trace one drop: straight down, then along to the first way down.',
    hintLevel: 'Joined tubes always end up level. Count the rows on the side it was poured into.',
    hintPlace: 'Here is one change that is needed.',

    'an.0': 'giraffe', 'an.1': 'hippo', 'an.2': 'zebra', 'an.3': 'elephant'
  },
  es: {
    'ch.e1': 'Cava un camino',
    'ch.e1.idea': 'Cava la tierra para que el agua llegue al animal con sed.',
    'ch.e2': '¿Quién bebe primero?',
    'ch.e2.idea': 'Sigue el agua hacia abajo. ¿Qué vasito se llena primero?',
    'ch.e3': 'Abre la compuerta',
    'ch.e3.idea': 'Abre las compuertas correctas, ¡y que el gato siga seco!',
    'ch.m1': 'Dos amigos con sed',
    'ch.m1.idea': 'Dale agua a los dos animales.',
    'ch.m2': 'Tubos unidos',
    'ch.m2.idea': 'Echa agua en un tubo. ¿Dónde se queda el agua en el otro?',
    'ch.m3': '¡Shh, el gato!',
    'ch.m3.idea': 'Cava y abre compuertas, pero el gato tiene que seguir seco.',
    'ch.h1': 'El agua justa',
    'ch.h1.idea': 'Solo unas gotas: no se puede desperdiciar ninguna.',
    'ch.h2': 'Ancho y delgado',
    'ch.h2.idea': 'Un tubo ancho y uno delgado, unidos por abajo.',
    'ch.h3': 'Carrera por beber',
    'ch.h3.idea': 'Tres vasitos. ¿Cuál se llena primero?',

    'tile.build': 'Cava y abre', 'tile.first': 'Quién bebe primero', 'tile.level': 'Tubos unidos',

    'ask.build': 'Toca la tierra para cavarla, y las compuertas para abrirlas o cerrarlas. Todos los animales tienen que beber, y el gato tiene que seguir seco.',
    'ask.first': 'El elefante echa {nn}. ¿Qué animal bebe primero?',
    'ask.level': 'El elefante echa {nn} en el tubo de la {side}. ¿Hasta dónde llegará el agua en el otro tubo?',
    sideLeft: 'izquierda', sideRight: 'derecha',
    digsLeft: 'Te quedan {n} para cavar',
    noDigs: 'Aquí no se cava: solo las compuertas.',
    dropsN: '{n} gotas', drops1: '1 gota',
    rowsUp: 'a {n} filas', rowUp1: 'a 1 fila',
    go: '¡A rociar!',
    restart: 'Empezar de nuevo',
    pickOne: 'Primero elige una.',
    outOfDigs: 'Ya no puedes cavar más. Toca un cuadro cavado para rellenarlo.',
    dirt: 'Tierra', dug: 'Cavado', gateOpen: 'Compuerta abierta', gateShut: 'Compuerta cerrada', cat: 'El gato dormido',
    cell: '{what}, fila {r}, columna {c}',

    allDrank: '✓ ¡Todos los animales bebieron!',
    catWoke: '¡Sorpresa! El gato se despertó: el agua lo alcanzó.',
    notEnough: '¡Sorpresa! {It} no recibió suficiente agua.',
    tryMore: 'Cambia algo que cavaste o una compuerta y vuelve a rociar.',
    right: '✓ {res}, como dijiste.',
    surprise: '¡Sorpresa! {res}.',
    'res.first': '{It} bebió primero',
    'res.level': 'El agua se quedó {rr}',

    'why.down': 'El agua siempre baja si puede.',
    'why.sideways': 'Si no puede bajar, corre de lado buscando cómo bajar.',
    'why.bottom': 'Llena primero lo más bajo y luego sube.',
    'why.same': 'Los tubos unidos quedan a la misma altura, anchos o delgados.',
    'why.level': 'El agua subió en los dos tubos a la vez, fila por fila, así que se queda a la misma altura en cada uno.',
    'why.first': 'El agua cae y corre hacia el primer vasito que alcanza. Ese se llena antes de que el agua siga.',
    hintBuild: 'Sigue el agua desde el elefante: primero hacia abajo, luego de lado hasta el camino más cercano para bajar.',
    hintFirst: 'Sigue una gota: recto hacia abajo, luego de lado hasta el primer camino para bajar.',
    hintLevel: 'Los tubos unidos siempre quedan a la misma altura. Cuenta las filas del lado donde se echó.',
    hintPlace: 'Aquí tienes un cambio que hace falta.',

    'an.0': 'la jirafa', 'an.1': 'el hipopótamo', 'an.2': 'la cebra', 'an.3': 'el elefante'
  }
};

export const wt = (key, lang, vars) => lookup(FOUNTAIN_TEXT, key, lang, vars);

export const ANIMAL_EMOJI = ['🦒', '🦛', '🦓', '🐘'];

const cap1 = (x) => x.charAt(0).toUpperCase() + x.slice(1);

/** The animal at trough k: "the giraffe" / "la jirafa". */
export function animal(k, L, cap = false) {
  const name = FOUNTAIN_TEXT[L === 'es' ? 'es' : 'en'][`an.${k % 4}`];
  const text = L === 'es' ? name : `the ${name}`;
  return cap ? cap1(text) : text;
}

export const drops = (n, L) => wt(n === 1 ? 'drops1' : 'dropsN', L, { n });
export const rowsUp = (n, L) => wt(n === 1 ? 'rowUp1' : 'rowsUp', L, { n });

export default { FOUNTAIN_TEXT, wt, ANIMAL_EMOJI, animal, drops, rowsUp };
