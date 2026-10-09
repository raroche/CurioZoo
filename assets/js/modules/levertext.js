/**
 * levertext.js — every word Lift the Elephant says, in English and Spanish.
 *
 * Animals carry their Spanish article. The "why" lines follow
 * research-levers-shadows-water-dominos.md section 1.9, and the Archimedes
 * line says "people say", because the famous words were first written down
 * by Pappus, six hundred years later. The Spanish is a draft owed a native
 * read.
 */

import { lookup } from './logictext.js';

export const LEVER_TEXT = {
  en: {
    'ch.e1': 'Which side goes down?',
    'ch.e1.idea': 'Look at the weights and the steps. Then let go!',
    'ch.e2': 'Lift the elephant!',
    'ch.e2.idea': 'One small animal, one big elephant. Where should it sit?',
    'ch.e3': 'Make it level',
    'ch.e3.idea': 'Find the peg that makes the plank flat.',
    'ch.m1': 'Tricky planks',
    'ch.m1.idea': 'Heavy on one side, far out on the other. Which wins?',
    'ch.m2': 'Two helpers',
    'ch.m2.idea': 'Place two animals to balance the plank, or to lift.',
    'ch.m3': 'How far?',
    'ch.m3.idea': 'The small end goes down a lot. How far does the big end go up?',
    'ch.h1': 'Multiply!',
    'ch.h1.idea': 'Animals all along both sides. Count weight × steps.',
    'ch.h2': 'Use them all',
    'ch.h2.idea': 'Three animals and one way to balance.',
    'ch.h3': 'The heavy plank',
    'ch.h3.idea': 'The rock is not in the middle. Now the plank counts too!',

    'tile.tilt': 'Which side goes down',
    'tile.build': 'Place the animals',
    'tile.far': 'How far',

    'ask.tilt': 'Which side will go down when we let go?',
    'ask.lift': 'Put the animals on the left so {it} goes up.',
    'ask.level': 'Put the animals on the left so the plank stays level.',
    'ask.far': 'Push the {small} end down {dd}. How far does {it} go up?',
    help: 'Each animal’s weight is the number on its tag. The pegs count steps from the rock.',
    helpBuild: 'Tap an animal, then tap a peg on the left. Tap a placed animal to take it off.',
    plankTag: 'plank {w}',
    plankHelp: 'The rock is not under the middle of the plank. The plank weighs {w}, and its middle is {ss} out on the {side}.',
    tray: 'Your animals',
    go: 'Let go!',
    pickPlace: 'Put every animal on a peg first.',
    pickAnimal: 'Tap one of your animals first.',
    pickOne: 'Choose one first.',
    picked: '{It} is ready. Now tap a peg on the left.',
    potHere: 'There is a flower pot on that peg.',

    'tilt.L': 'Left goes down', 'tilt.level': 'Stays level', 'tilt.R': 'Right goes down',
    'res.L': 'The left side went down', 'res.level': 'The plank stayed level', 'res.R': 'The right side went down',
    notchesN: '{n} notches', notches1: '1 notch',
    stepsN: '{n} steps', steps1: '1 step',
    left: 'left', right: 'right',
    pegLabel: 'Left peg {n}',
    pegEmpty: '{peg}: empty',
    pegFull: '{peg}: {it}',
    pegPot: '{peg}: a flower pot',
    weighs: '{It}, weighs {w}, on peg {p}',

    right: '✓ {res}, just as you said.',
    surprise: 'Surprise! {res}.',
    upGoes: '✓ Up goes {it}!',
    levelDone: '✓ Level!',
    notYet: 'Not yet: {res}.',
    tryMore: 'Move an animal and let go again.',
    farRight: '✓ {n}, just as you said.',
    farSurprise: 'Surprise! It went up {n}.',

    'why.count': 'Left: {l}. Right: {r}.',
    'why.bigger': 'The {side} number is bigger, so the {side} goes down.',
    'why.equal': 'Both numbers are the same, so the plank stays level.',
    'why.empty': 'nothing',
    'why.far': 'The plank turns round the rock. {Small} is {e} steps out and {it} {l}, so {it} moves {l} notches for every {e} the {small} moves: {d} × {l} ÷ {e} = {r}.',
    'why.trade': 'The light end goes down a long way so the heavy end can go up a little. A lever makes lifting easier, but you push for longer.',
    'why.plank': 'The plank weighs {w} and its middle is {ss} out on the {side}, so it adds {t} to the {side}.',
    'why.add': 'Adding weight and steps would say: {wrong}. Multiplying says: {rightt}. Always multiply!',
    'why.weightOnly': 'The heavier side does not always win: being far from the rock counts too.',
    archimedes: 'People say Archimedes said: “Give me a place to stand, and I will move the Earth.”',
    hintCount: 'Count weight × steps for each animal.',
    hintTotals: 'Add them up for each side and compare.',
    hintPlace: 'Here is one animal on its peg.',
    hintFar: '{Small} is {e} steps out; {it} is {l}. The plank turns, so the nearer end moves less.',
    still: 'With reduced motion the plank jumps straight to where it ends up.',

    'a.mouse': 'mouse', 'a.rabbit': 'rabbit', 'a.monkey': 'monkey', 'a.panda': 'panda',
    'a.elephant': 'elephant', 'a.hippo': 'hippo', 'a.rhino': 'rhino'
  },
  es: {
    'ch.e1': '¿Qué lado baja?',
    'ch.e1.idea': 'Mira los pesos y los pasos. ¡Y suelta!',
    'ch.e2': '¡Levanta al elefante!',
    'ch.e2.idea': 'Un animal pequeño, un elefante grande. ¿Dónde debe sentarse?',
    'ch.e3': 'Déjala plana',
    'ch.e3.idea': 'Encuentra la clavija que deja la tabla plana.',
    'ch.m1': 'Tablas tramposas',
    'ch.m1.idea': 'Pesado de un lado, lejos del otro. ¿Quién gana?',
    'ch.m2': 'Dos ayudantes',
    'ch.m2.idea': 'Coloca dos animales para equilibrar la tabla o para levantar.',
    'ch.m3': '¿Cuánto sube?',
    'ch.m3.idea': 'El extremo pequeño baja mucho. ¿Cuánto sube el grande?',
    'ch.h1': '¡Multiplica!',
    'ch.h1.idea': 'Animales a lo largo de los dos lados. Cuenta peso × pasos.',
    'ch.h2': 'Úsalos todos',
    'ch.h2.idea': 'Tres animales y una sola manera de equilibrar.',
    'ch.h3': 'La tabla pesada',
    'ch.h3.idea': 'La roca no está en el medio. ¡Ahora la tabla también cuenta!',

    'tile.tilt': 'Qué lado baja',
    'tile.build': 'Coloca los animales',
    'tile.far': 'Cuánto sube',

    'ask.tilt': '¿Qué lado bajará cuando soltemos?',
    'ask.lift': 'Pon los animales a la izquierda para que {it} suba.',
    'ask.level': 'Pon los animales a la izquierda para que la tabla quede plana.',
    'ask.far': 'Empuja hacia abajo el extremo del {small} {dd}. ¿Cuánto sube {it}?',
    help: 'El peso de cada animal es el número de su etiqueta. Las clavijas cuentan los pasos desde la roca.',
    helpBuild: 'Toca un animal y luego una clavija de la izquierda. Toca un animal puesto para quitarlo.',
    plankTag: 'tabla {w}',
    plankHelp: 'La roca no está bajo el medio de la tabla. La tabla pesa {w}, y su medio está a {ss} hacia la {side}.',
    tray: 'Tus animales',
    go: '¡Suelta!',
    pickPlace: 'Primero pon cada animal en una clavija.',
    pickAnimal: 'Primero toca uno de tus animales.',
    pickOne: 'Primero elige una.',
    picked: '{It} está listo. Ahora toca una clavija de la izquierda.',
    potHere: 'En esa clavija hay una maceta.',

    'tilt.L': 'Baja la izquierda', 'tilt.level': 'Queda plana', 'tilt.R': 'Baja la derecha',
    'res.L': 'Bajó el lado izquierdo', 'res.level': 'La tabla quedó plana', 'res.R': 'Bajó el lado derecho',
    notchesN: '{n} muescas', notches1: '1 muesca',
    stepsN: '{n} pasos', steps1: '1 paso',
    left: 'izquierda', right: 'derecha',
    pegLabel: 'Clavija {n} de la izquierda',
    pegEmpty: '{peg}: vacía',
    pegFull: '{peg}: {it}',
    pegPot: '{peg}: una maceta',
    weighs: '{It}, pesa {w}, en la clavija {p}',

    right: '✓ {res}, como dijiste.',
    surprise: '¡Sorpresa! {res}.',
    upGoes: '✓ ¡Arriba {it}!',
    levelDone: '✓ ¡Plana!',
    notYet: 'Todavía no: {res}.',
    tryMore: 'Mueve un animal y suelta otra vez.',
    farRight: '✓ {n}, como dijiste.',
    farSurprise: '¡Sorpresa! Subió {n}.',

    'why.count': 'Izquierda: {l}. Derecha: {r}.',
    'why.bigger': 'El número de la {side} es mayor, así que baja la {side}.',
    'why.equal': 'Los dos números son iguales, así que la tabla queda plana.',
    'why.empty': 'nada',
    'why.far': 'La tabla gira sobre la roca. {Small} está a {e} pasos y {it} a {l}, así que {it} se mueve {l} muescas por cada {e} que se mueve el {small}: {d} × {l} ÷ {e} = {r}.',
    'why.trade': 'El extremo ligero baja mucho para que el pesado suba un poquito. Una palanca hace más fácil levantar, pero empujas más trecho.',
    'why.plank': 'La tabla pesa {w} y su medio está a {ss} hacia la {side}, así que suma {t} a la {side}.',
    'why.add': 'Sumando peso y pasos saldría: {wrong}. Multiplicando sale: {rightt}. ¡Siempre multiplica!',
    'why.weightOnly': 'El lado más pesado no siempre gana: estar lejos de la roca también cuenta.',
    archimedes: 'Se cuenta que Arquímedes dijo: «Dadme un punto de apoyo y moveré el mundo».',
    hintCount: 'Cuenta peso × pasos para cada animal.',
    hintTotals: 'Súmalos en cada lado y compara.',
    hintPlace: 'Aquí tienes un animal en su clavija.',
    hintFar: '{Small} está a {e} pasos; {it}, a {l}. La tabla gira, así que el extremo más cercano se mueve menos.',
    still: 'Con el movimiento reducido, la tabla salta directa a su posición final.',

    'a.mouse': 'el ratón', 'a.rabbit': 'el conejo', 'a.monkey': 'el mono', 'a.panda': 'el panda',
    'a.elephant': 'el elefante', 'a.hippo': 'el hipopótamo', 'a.rhino': 'el rinoceronte'
  }
};

export const vt = (key, lang, vars) => lookup(LEVER_TEXT, key, lang, vars);

const cap1 = (x) => x.charAt(0).toUpperCase() + x.slice(1);

/** "the mouse" / "el ratón". */
export function the(id, L, cap = false) {
  const name = LEVER_TEXT[L === 'es' ? 'es' : 'en'][`a.${id}`] || id;
  const text = L === 'es' ? name : `the ${name}`;
  return cap ? cap1(text) : text;
}

/** The bare name: "mouse" / "ratón", for "the mouse end" / "el extremo del ratón". */
export const bare = (id, L) => (L === 'es' ? LEVER_TEXT.es[`a.${id}`].replace(/^(el|la) /, '') : LEVER_TEXT.en[`a.${id}`]);

export const notches = (n, L) => vt(n === 1 ? 'notches1' : 'notchesN', L, { n });
export const steps = (n, L) => vt(n === 1 ? 'steps1' : 'stepsN', L, { n });

export default { LEVER_TEXT, vt, the, bare, notches, steps };
