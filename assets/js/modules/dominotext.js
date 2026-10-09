/**
 * dominotext.js — every word Domino Zoo says, in English and Spanish.
 *
 * The "why" lines follow research-levers-shadows-water-dominos.md section
 * 4.8, with the honest energy line of 4.1: a standing domino holds energy,
 * and a small push only lets it go. Parts carry their Spanish article. The
 * Spanish is a draft owed a native read.
 */

import { lookup } from './logictext.js';

export const DOMINO_TEXT = {
  en: {
    'ch.e1': 'Fill the gap',
    'ch.e1.idea': 'One part is missing. Put it back and ring the bell.',
    'ch.e2': 'Ramps',
    'ch.e2.idea': 'Which way should the ramp slope?',
    'ch.e3': 'Will it ring?',
    'ch.e3.idea': 'Follow the machine in your head before you press Go.',
    'ch.m1': 'Tall and small',
    'ch.m1.idea': 'How tall a domino can each one knock over?',
    'ch.m2': 'The last machine',
    'ch.m2.idea': 'Seesaw, pulley, fan or ramp: which one rings the bell?',
    'ch.m3': 'Two gaps',
    'ch.m3.idea': 'Two parts are missing.',
    'ch.h1': 'Where will it stop?',
    'ch.h1.idea': 'Find the last part that moves.',
    'ch.h2': 'Three gaps',
    'ch.h2.idea': 'Three parts are missing, and one tray part is a trick.',
    'ch.h3': 'Giant machines',
    'ch.h3.idea': 'More shelves, giant dominoes and two trick parts.',

    'tile.build': 'Fix the machine', 'tile.ring': 'Will it ring', 'tile.stop': 'Where will it stop',

    'ask.build': 'Put parts from the tray into the dotted gaps, so the machine rings the feeding bell.',
    'ask.buildHow': 'Tap a part in the tray, then tap a gap. Tap a ramp or a fan in a gap to turn it round.',
    'ask.ring': 'The meerkat pushes the first part. Will the machine ring the feeding bell?',
    'ask.stop': 'This machine has a problem. Which part will be the last one to move?',
    go: 'Go!',
    clear: 'Empty the gaps',
    yes: '🔔 Yes, it rings', no: '✋ No, it stops',
    partX: '{x}: {part}',
    tray: 'The tray',
    gapN: 'Gap {n}', empty: 'empty',
    sloping: '{part}, sloping {way}', facing: '{part}, blowing {way}',
    'way.1': 'right', 'way.-1': 'left',
    pickFirst: 'Tap a part in the tray first.',
    pickAll: 'Choose an answer first.',
    picked: 'Now tap a dotted gap to put the {part} there.',
    noFit: 'That gap is the wrong size for the {part}.',
    watching: 'Watch the machine…',

    'p.dom': 'domino', 'p.ball': 'ball', 'p.ramp': 'ramp', 'p.fan': 'fan', 'p.seesaw': 'seesaw',
    'p.pulley': 'pulley', 'p.boat': 'paper boat', 'p.bell': 'bell',
    'dom.2': 'small domino (2)', 'dom.3': 'medium domino (3)', 'dom.4': 'tall domino (4)', 'dom.6': 'giant domino (6)',

    right: '✓ {res}, just as you said.',
    surprise: 'Surprise! {res}.',
    'res.yes': 'The bell rings', 'res.no': 'The machine stops',
    'res.stop': 'Part {x}, the {part}, is the last to move',
    rang: 'Ding! The bell rings, and the animals get their dinner.',
    notYet: 'Not yet. {why}',
    tryMore: 'Change some parts and press Go again.',

    'why.nothing': 'The last part fell, but nothing was next to it to push.',
    'why.tooBig': 'A domino {from} tall can knock over one up to {max} tall, but not one {to} tall.',
    'why.blocked': '{Part} was in the way, and it does not pass a push along.',
    'why.landed': 'The ball landed on the flat shelf and stopped.',
    'why.bounced': 'The ball bounced off the {part}.',
    'why.wall': 'The ball rolled to the wall and stopped.',
    'why.splash': 'The ball rolled into the pond. Splash!',
    'why.middle': 'The ball landed on the middle of the {part}, so nothing tipped.',
    'why.tooHigh': '{Part} went up, but the bell hangs too high for it.',
    'why.nothingAbove': '{Part} went up, but there was no bell above it.',
    'why.windNothing': 'The fan blew, but there was nothing light to push that way.',
    'why.windWeak': 'The fan’s wind is too weak to move the {part}.',
    'why.boatStuck': 'The boat sailed, but did not reach the bell.',

    'rule.chain': 'Each part gives the next one a push.',
    'rule.size': 'A domino can knock over one a bit taller, up to 1½ times its height, but not one twice as tall. Its stored energy is why it can topple a bigger one at all.',
    'rule.energy': 'A standing domino holds energy from being stood up. A small push lets that energy go.',
    'rule.ramp': 'A ramp turns falling into rolling, downhill.',
    'rule.seesaw': 'Push one end of a seesaw down and the other end jumps up, a little.',
    'rule.pulley': 'One bucket goes down, so the other goes up, high.',
    'rule.fan': 'The ball only presses the switch. The fan’s battery makes the wind, and wind can move only light things.',

    hintGap: 'Follow the machine from the start. At each gap, what must happen next: a push, a roll, or a lift?',
    hintSize: 'A domino can knock over one up to 1½ times its height: 2 → 3, 3 → 4, 4 → 6.',
    hintRamp: 'A ramp sends the ball downhill. Which way does this shelf need the ball to go?',
    hintFinish: 'A seesaw lifts a little; a pulley lifts high; a fan only pushes light things, like the paper boat.',
    hintPlace: 'One part is now in its place.',
    hintFollow: 'Follow it step by step, like a replay in your head. Look at every domino’s height.'
  },
  es: {
    'ch.e1': 'Llena el hueco',
    'ch.e1.idea': 'Falta una pieza. Ponla y haz sonar la campana.',
    'ch.e2': 'Rampas',
    'ch.e2.idea': '¿Hacia qué lado debe bajar la rampa?',
    'ch.e3': '¿Sonará?',
    'ch.e3.idea': 'Sigue la máquina en tu cabeza antes de pulsar ¡Ya!',
    'ch.m1': 'Altos y bajos',
    'ch.m1.idea': '¿Qué tan alto es el dominó que cada uno puede tumbar?',
    'ch.m2': 'La última máquina',
    'ch.m2.idea': 'Subibaja, polea, ventilador o rampa: ¿cuál hace sonar la campana?',
    'ch.m3': 'Dos huecos',
    'ch.m3.idea': 'Faltan dos piezas.',
    'ch.h1': '¿Dónde se parará?',
    'ch.h1.idea': 'Encuentra la última pieza que se mueve.',
    'ch.h2': 'Tres huecos',
    'ch.h2.idea': 'Faltan tres piezas, y una pieza de la bandeja es una trampa.',
    'ch.h3': 'Máquinas gigantes',
    'ch.h3.idea': 'Más estantes, dominós gigantes y dos piezas trampa.',

    'tile.build': 'Arregla la máquina', 'tile.ring': '¿Sonará?', 'tile.stop': '¿Dónde se parará?',

    'ask.build': 'Pon piezas de la bandeja en los huecos punteados, para que la máquina haga sonar la campana de la comida.',
    'ask.buildHow': 'Toca una pieza de la bandeja y luego un hueco. Toca una rampa o un ventilador en un hueco para darle la vuelta.',
    'ask.ring': 'La suricata empuja la primera pieza. ¿Hará sonar la máquina la campana de la comida?',
    'ask.stop': 'Esta máquina tiene un problema. ¿Qué pieza será la última en moverse?',
    go: '¡Ya!',
    clear: 'Vaciar los huecos',
    yes: '🔔 Sí, suena', no: '✋ No, se para',
    partX: '{x}: {part}',
    tray: 'La bandeja',
    gapN: 'Hueco {n}', empty: 'vacío',
    sloping: '{part}, bajando hacia la {way}', facing: '{part}, soplando hacia la {way}',
    'way.1': 'derecha', 'way.-1': 'izquierda',
    pickFirst: 'Primero toca una pieza de la bandeja.',
    pickAll: 'Primero elige una respuesta.',
    picked: 'Ahora toca un hueco punteado para poner ahí {part}.',
    noFit: 'Ese hueco no es del tamaño de {part}.',
    watching: 'Mira la máquina…',

    'p.dom': 'el dominó', 'p.ball': 'la pelota', 'p.ramp': 'la rampa', 'p.fan': 'el ventilador', 'p.seesaw': 'el subibaja',
    'p.pulley': 'la polea', 'p.boat': 'el barquito de papel', 'p.bell': 'la campana',
    'dom.2': 'el dominó chico (2)', 'dom.3': 'el dominó mediano (3)', 'dom.4': 'el dominó alto (4)', 'dom.6': 'el dominó gigante (6)',

    right: '✓ {res}, como dijiste.',
    surprise: '¡Sorpresa! {res}.',
    'res.yes': 'La campana suena', 'res.no': 'La máquina se para',
    'res.stop': 'La pieza {x}, {part}, es la última en moverse',
    rang: '¡Din, don! Suena la campana y los animales reciben su comida.',
    notYet: 'Todavía no. {why}',
    tryMore: 'Cambia algunas piezas y pulsa ¡Ya! otra vez.',

    'why.nothing': 'La última pieza cayó, pero no había nada a su lado para empujar.',
    'why.tooBig': 'Un dominó de {from} puede tumbar uno de hasta {max}, pero no uno de {to}.',
    'why.blocked': '{Part} estaba en el camino y no pasa el empujón.',
    'why.landed': 'La pelota cayó en el estante plano y se paró.',
    'why.bounced': 'La pelota rebotó en {part}.',
    'why.wall': 'La pelota rodó hasta la pared y se paró.',
    'why.splash': 'La pelota rodó al estanque. ¡Plaf!',
    'why.middle': 'La pelota cayó en el centro de {part}, así que nada se inclinó.',
    'why.tooHigh': '{Part} subió, pero la campana cuelga demasiado alto.',
    'why.nothingAbove': '{Part} subió, pero no había campana encima.',
    'why.windNothing': 'El ventilador sopló, pero no había nada ligero que empujar hacia ese lado.',
    'why.windWeak': 'El viento del ventilador es demasiado débil para mover {part}.',
    'why.boatStuck': 'El barquito navegó, pero no llegó a la campana.',

    'rule.chain': 'Cada pieza le da un empujón a la siguiente.',
    'rule.size': 'Un dominó puede tumbar a otro un poco más alto, hasta 1½ veces su altura, pero no al doble. Por la energía que guarda puede tumbar a uno más grande.',
    'rule.energy': 'Un dominó de pie guarda energía de cuando lo pusieron de pie. Un empujoncito suelta esa energía.',
    'rule.ramp': 'La rampa convierte la caída en rodar, cuesta abajo.',
    'rule.seesaw': 'Si empujas un extremo del subibaja hacia abajo, el otro salta hacia arriba, un poco.',
    'rule.pulley': 'Si un cubo baja, el otro sube, muy alto.',
    'rule.fan': 'La pelota solo aprieta el botón. La pila del ventilador hace el viento, y el viento solo mueve cosas ligeras.',

    hintGap: 'Sigue la máquina desde el principio. En cada hueco, ¿qué tiene que pasar: un empujón, rodar o subir?',
    hintSize: 'Un dominó puede tumbar a otro de hasta 1½ veces su altura: 2 → 3, 3 → 4, 4 → 6.',
    hintRamp: 'La rampa manda la pelota cuesta abajo. ¿Hacia dónde tiene que ir la pelota en este estante?',
    hintFinish: 'El subibaja levanta un poco; la polea levanta mucho; el ventilador solo empuja cosas ligeras, como el barquito de papel.',
    hintPlace: 'Ahora una pieza está en su lugar.',
    hintFollow: 'Síguela paso a paso, como una repetición en tu cabeza. Mira la altura de cada dominó.'
  }
};

export const dt = (key, lang, vars) => lookup(DOMINO_TEXT, key, lang, vars);

const cap1 = (x) => x.charAt(0).toUpperCase() + x.slice(1);

/** A part's name: "the ramp" / "la rampa"; dominoes by height. */
export function partName(t, L, { s = null, cap = false } = {}) {
  const name = t === 'dom' && s ? dt(`dom.${s}`, L) : dt(`p.${t}`, L);
  const text = L === 'es' ? name : `the ${name}`;
  return cap ? cap1(text) : text;
}

/** A tray label: "Ramp", "Small domino (2)", "Rampa". */
export function pieceLabel(piece, L) {
  const name = piece.t === 'dom' ? dt(`dom.${piece.s}`, L) : dt(`p.${piece.t}`, L);
  return cap1(L === 'es' ? name.replace(/^(el|la) /, '') : name);
}

export default { DOMINO_TEXT, dt, partName, pieceLabel };
