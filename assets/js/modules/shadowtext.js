/**
 * shadowtext.js — every word Shadow Show says, in English and Spanish.
 *
 * Puppets carry their Spanish article. The "why" lines follow
 * research-levers-shadows-water-dominos.md section 2.7, and the puppet
 * traditions come from their UNESCO listings (section 2.3). The Spanish is a
 * draft owed a native read.
 */

import { lookup } from './logictext.js';

export const SHADOW_TEXT = {
  en: {
    'ch.e1': 'Whose shadow?',
    'ch.e1.idea': 'Which puppet makes this shadow?',
    'ch.e2': 'Bigger or smaller',
    'ch.e2.idea': 'Nearer the lamp makes a bigger shadow.',
    'ch.e3': 'Sun shadows',
    'ch.e3.idea': 'Shade for the lion, sunshine for the zebra.',
    'ch.m1': 'Shape and size',
    'ch.m1.idea': 'Pick the puppet, then pick its place.',
    'ch.m2': 'Move the lamp',
    'ch.m2.idea': 'The puppet stays still. Where does the lamp go?',
    'ch.m3': 'See-through',
    'ch.m3.idea': 'Card, tissue paper or glass?',
    'ch.h1': 'Lamp up, shadow down',
    'ch.h1.idea': 'Which lamp height puts the shadow in the frame?',
    'ch.h2': 'How tall?',
    'ch.h2.idea': 'Work out the shadow’s height before you look.',
    'ch.h3': 'Two lamps',
    'ch.h3.idea': 'How many shadows do two lamps make?',

    'tile.shape': 'Whose shadow', 'tile.size': 'Where to stand', 'tile.both': 'Shape and size', 'tile.lamp': 'Move the lamp',
    'tile.height': 'Lamp height', 'tile.sun': 'Sun shadow', 'tile.material': 'See-through', 'tile.tall': 'How tall', 'tile.two': 'Two lamps',

    'ask.shape': 'The dotted outline on the wall is the shadow we want. Which puppet makes it?',
    'ask.size': 'Where should {it} stand, so its shadow fills the dotted outline?',
    'ask.both': 'Which puppet, standing where, makes the dotted shadow?',
    'ask.lamp': '{It} stays at step 6. Where should the lamp go, so the shadow fills the dotted outline?',
    'ask.height': 'Which lamp height puts the shadow inside the dotted frame?',
    'ask.sun': 'The tree is {hh} tall. Where should the sun be, so the lion sleeps in the shade and the zebra lies in the sun?',
    'ask.material': 'This shadow is {dark}. Which puppet makes it?',
    'ask.tall': '{It} is {hh} tall and stands at step {x}. How tall will its shadow be?',
    'ask.two': 'Two lamps shine on {it}, standing at step {x}. How many shadows will you see on the wall?',
    'dark.dark': 'dark', 'dark.pale': 'pale', 'dark.none': 'almost invisible',
    'mat.card': 'Card', 'mat.tissue': 'Tissue paper', 'mat.glass': 'Glass',
    'sun.0': 'High sun', 'sun.1': 'Middle sun', 'sun.2': 'Low sun', 'sun.3': 'Very low sun',
    'theSun.0': 'the high sun', 'theSun.1': 'the middle sun', 'theSun.2': 'the low sun', 'theSun.3': 'the very low sun',
    'theMat.card': 'card', 'theMat.tissue': 'tissue paper', 'theMat.glass': 'glass',
    stepN: 'Step {n}', rowN: 'Row {n}', shadowsN: '{n} shadows', shadows1: '1 shadow',
    rowsN: '{n} rows', rows1: '1 row', squaresN: '{n} squares', squares1: '1 square',
    which: 'Which puppet?', where: 'Where?',
    lamp: 'the lamp', wall: 'the wall', outline: 'the shadow we want',
    go: 'Light!',
    pickAll: 'Choose for every one first.',

    right: '✓ {res}, just as you said.',
    surprise: 'Surprise! {res}.',
    'res.shape': '{It} makes that shadow',
    'res.size': 'At step {x}, the shadow fits',
    'res.lamp': 'With the lamp at step {x}, the shadow fits',
    'res.height': 'The lamp at row {x} puts it in the frame',
    'res.sun': '{Sun} makes just the right shade',
    'res.material': '{Mat} makes a {dark} shadow',
    'res.tall': 'The shadow is {tt} tall',
    'res.two': 'You see {nn}',

    'why.straight': 'Light goes in straight lines, so it cannot bend round the puppet.',
    'why.shadow': 'A shadow is the place where the light cannot get to, so it has the puppet’s outline.',
    'why.closer': 'At step {x} the puppet is 12 ÷ {x} = {k} times nearer the lamp than the wall is, so the shadow is {k} times as big.',
    'why.lamp': 'With the lamp at step {L}, the wall is {a} steps away and the puppet {b}, so the shadow is {a} ÷ {b} = {k} times as big.',
    'why.height': 'Lift the lamp and the shadow slides down; lower it and the shadow slides up. The light passes the puppet in straight lines.',
    'why.sun': 'When the sun is low, shadows are long; when it is high, they are short. This sun makes the tree’s shadow {ll} long.',
    'why.material': 'Card stops the light, so its shadow is dark. Tissue paper lets some light through, so its shadow is pale. Glass lets almost all of it through.',
    'why.tall': '{hh} × 12 ÷ {x} = {t}.',
    'why.two': 'Each lamp makes its own shadow, so two lamps make two shadows.',
    'why.twoOne': 'Against the wall, both shadows land in the same place, so you see only one.',
    puppets: 'People in Indonesia, Türkiye and China have told stories with shadow puppets for hundreds of years: a lamp, a screen, and puppets in between.',
    hintSize: 'The nearer the lamp, the bigger the shadow: 12 ÷ step = how many times bigger.',
    hintShape: 'Look at the outline’s shape: ears, necks, shells, tails.',
    hintSun: 'Low sun, long shadow. High sun, short shadow.',
    hintHeight: 'The shadow moves the opposite way to the lamp.',
    hintMaterial: 'Which lets light through: card, tissue or glass?',
    hintTwo: 'Draw a straight line from each lamp past the puppet.',

    'p.rabbit': 'rabbit', 'p.giraffe': 'giraffe', 'p.turtle': 'turtle', 'p.elephant': 'elephant', 'p.cat': 'cat',
    'p.bird': 'bird', 'p.snail': 'snail', 'p.deer': 'deer', 'p.owl': 'owl'
  },
  es: {
    'ch.e1': '¿De quién es la sombra?',
    'ch.e1.idea': '¿Qué títere hace esta sombra?',
    'ch.e2': 'Más grande o más pequeña',
    'ch.e2.idea': 'Más cerca de la lámpara, más grande la sombra.',
    'ch.e3': 'Sombras del sol',
    'ch.e3.idea': 'Sombra para el león, sol para la cebra.',
    'ch.m1': 'Forma y tamaño',
    'ch.m1.idea': 'Elige el títere y luego su lugar.',
    'ch.m2': 'Mueve la lámpara',
    'ch.m2.idea': 'El títere se queda quieto. ¿Dónde va la lámpara?',
    'ch.m3': 'Se ve a través',
    'ch.m3.idea': '¿Cartón, papel de seda o vidrio?',
    'ch.h1': 'Lámpara arriba, sombra abajo',
    'ch.h1.idea': '¿A qué altura va la lámpara para que la sombra quede en el marco?',
    'ch.h2': '¿Qué tan alta?',
    'ch.h2.idea': 'Calcula la altura de la sombra antes de mirar.',
    'ch.h3': 'Dos lámparas',
    'ch.h3.idea': '¿Cuántas sombras hacen dos lámparas?',

    'tile.shape': 'De quién es', 'tile.size': 'Dónde ponerlo', 'tile.both': 'Forma y tamaño', 'tile.lamp': 'Mueve la lámpara',
    'tile.height': 'Altura de la lámpara', 'tile.sun': 'Sombra del sol', 'tile.material': 'Se ve a través', 'tile.tall': 'Qué tan alta', 'tile.two': 'Dos lámparas',

    'ask.shape': 'El contorno punteado de la pared es la sombra que queremos. ¿Qué títere la hace?',
    'ask.size': '¿Dónde debe ponerse {it} para que su sombra llene el contorno punteado?',
    'ask.both': '¿Qué títere, y en qué lugar, hace la sombra punteada?',
    'ask.lamp': '{It} se queda en el paso 6. ¿Dónde debe ir la lámpara para que la sombra llene el contorno punteado?',
    'ask.height': '¿A qué altura va la lámpara para que la sombra quede dentro del marco punteado?',
    'ask.sun': 'El árbol mide {hh}. ¿Dónde debe estar el sol, para que el león duerma a la sombra y la cebra tome el sol?',
    'ask.material': 'Esta sombra es {dark}. ¿Qué títere la hace?',
    'ask.tall': '{It} mide {hh} y está en el paso {x}. ¿Qué tan alta será su sombra?',
    'ask.two': 'Dos lámparas iluminan {it}, en el paso {x}. ¿Cuántas sombras verás en la pared?',
    'dark.dark': 'oscura', 'dark.pale': 'clarita', 'dark.none': 'casi invisible',
    'mat.card': 'Cartón', 'mat.tissue': 'Papel de seda', 'mat.glass': 'Vidrio',
    'sun.0': 'Sol alto', 'sun.1': 'Sol a media altura', 'sun.2': 'Sol bajo', 'sun.3': 'Sol muy bajo',
    'theSun.0': 'el sol alto', 'theSun.1': 'el sol a media altura', 'theSun.2': 'el sol bajo', 'theSun.3': 'el sol muy bajo',
    'theMat.card': 'el cartón', 'theMat.tissue': 'el papel de seda', 'theMat.glass': 'el vidrio',
    stepN: 'Paso {n}', rowN: 'Fila {n}', shadowsN: '{n} sombras', shadows1: '1 sombra',
    rowsN: '{n} filas', rows1: '1 fila', squaresN: '{n} casillas', squares1: '1 casilla',
    which: '¿Qué títere?', where: '¿Dónde?',
    lamp: 'la lámpara', wall: 'la pared', outline: 'la sombra que queremos',
    go: '¡Luz!',
    pickAll: 'Primero elige para cada uno.',

    right: '✓ {res}, como dijiste.',
    surprise: '¡Sorpresa! {res}.',
    'res.shape': '{It} hace esa sombra',
    'res.size': 'En el paso {x}, la sombra encaja',
    'res.lamp': 'Con la lámpara en el paso {x}, la sombra encaja',
    'res.height': 'La lámpara en la fila {x} la pone en el marco',
    'res.sun': '{Sun} da justo la sombra que hace falta',
    'res.material': '{Mat} hace una sombra {dark}',
    'res.tall': 'La sombra mide {tt}',
    'res.two': 'Ves {nn}',

    'why.straight': 'La luz va en línea recta, así que no puede rodear al títere.',
    'why.shadow': 'La sombra es el lugar adonde la luz no llega, por eso tiene el contorno del títere.',
    'why.closer': 'En el paso {x}, el títere está 12 ÷ {x} = {k} veces más cerca de la lámpara que la pared, así que la sombra es {k} veces más grande.',
    'why.lamp': 'Con la lámpara en el paso {L}, la pared está a {a} pasos y el títere a {b}, así que la sombra es {a} ÷ {b} = {k} veces más grande.',
    'why.height': 'Si subes la lámpara, la sombra baja; si la bajas, la sombra sube. La luz pasa junto al títere en línea recta.',
    'why.sun': 'Con el sol bajo, las sombras son largas; con el sol alto, cortas. Este sol hace que la sombra del árbol mida {ll}.',
    'why.material': 'El cartón detiene la luz, así que su sombra es oscura. El papel de seda deja pasar algo de luz, así que su sombra es clarita. El vidrio deja pasar casi toda.',
    'why.tall': '{hh} × 12 ÷ {x} = {t}.',
    'why.two': 'Cada lámpara hace su propia sombra, así que dos lámparas hacen dos sombras.',
    'why.twoOne': 'Pegado a la pared, las dos sombras caen en el mismo lugar, así que ves solo una.',
    puppets: 'En Indonesia, Turquía y China se cuentan historias con títeres de sombra desde hace cientos de años: una lámpara, una pantalla y títeres en medio.',
    hintSize: 'Más cerca de la lámpara, sombra más grande: 12 ÷ paso = cuántas veces más grande.',
    hintShape: 'Mira la forma del contorno: orejas, cuellos, caparazones, colas.',
    hintSun: 'Sol bajo, sombra larga. Sol alto, sombra corta.',
    hintHeight: 'La sombra se mueve al revés que la lámpara.',
    hintMaterial: '¿Qué deja pasar la luz: el cartón, el papel de seda o el vidrio?',
    hintTwo: 'Traza una línea recta desde cada lámpara pasando junto al títere.',

    'p.rabbit': 'el conejo', 'p.giraffe': 'la jirafa', 'p.turtle': 'la tortuga', 'p.elephant': 'el elefante', 'p.cat': 'el gato',
    'p.bird': 'el pájaro', 'p.snail': 'el caracol', 'p.deer': 'el venado', 'p.owl': 'el búho'
  }
};

export const ht = (key, lang, vars) => lookup(SHADOW_TEXT, key, lang, vars);

const cap1 = (x) => x.charAt(0).toUpperCase() + x.slice(1);

export function the(id, L, cap = false) {
  const name = SHADOW_TEXT[L === 'es' ? 'es' : 'en'][`p.${id}`];
  const text = L === 'es' ? name : `the ${name}`;
  return cap ? cap1(text) : text;
}
/* Spanish "a" before a name: "iluminan al conejo", "a la jirafa". */
export const aThe = (id, L) => (L === 'es' ? `a ${the(id, L)}`.replace(/^a el /, 'al ') : the(id, L));

const plural = (one, many) => (n, L) => ht(n === 1 ? one : many, L, { n });
export const rows = plural('rows1', 'rowsN');
export const squares = plural('squares1', 'squaresN');
export const shadows = plural('shadows1', 'shadowsN');

export default { SHADOW_TEXT, ht, the, aThe, rows, squares, shadows };
