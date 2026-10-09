/**
 * fireflytext.js — every word Firefly Circuits says, in English and Spanish.
 *
 * Fireflies are "she" in neither language: they are "Firefly A" /
 * "Luciérnaga A", and a firefly glows or sleeps ("brilla", "duerme"), so no
 * sentence needs a word for "bulb", which differs from country to country
 * (bombilla, foco, bombillo, ampolleta). The battery is the eel; its ends are
 * + and −. The "why" lines and the safety lines follow
 * research-circuits-magnets.md sections 1.4, 3 and 3.7. The Spanish is a
 * draft owed a native read.
 */

import { lookup } from './logictext.js';

export const FIREFLY_TEXT = {
  en: {
    'ch.e1': 'Close the loop',
    'ch.e1.idea': 'Fill the gap so the firefly wakes up.',
    'ch.e2': 'Will it glow?',
    'ch.e2.idea': 'Look at the wires. Will each firefly wake up?',
    'ch.e3': 'Wake them all',
    'ch.e3.idea': 'Two fireflies, one eel, every piece in its place.',
    'ch.m1': 'Metal or wood?',
    'ch.m1.idea': 'One stick looks like a wire, but it is wood.',
    'ch.m2': 'Short cuts',
    'ch.m2.idea': 'A plain wire across the middle. What does it do?',
    'ch.m3': 'In a row or side by side',
    'ch.m3.idea': 'Two fireflies: dim, or bright?',
    'ch.h1': 'Bright and dim',
    'ch.h1.idea': 'Build the circuit the card shows.',
    'ch.h2': 'Switches',
    'ch.h2.idea': 'Some switches are open and some are closed. Who glows?',
    'ch.h3': 'Tricky circuits',
    'ch.h3.idea': 'A firefly in a row with a pair. Who glows most?',

    'tile.build': 'Build it',
    'tile.predict': 'Will it glow?',

    'ask.build': 'Put the pieces in the empty squares so the fireflies match the card.',
    'ask.buildHow': 'Tap a piece, then tap an empty square. Tap a placed piece to turn it.',
    'ask.predict': 'How will each firefly glow? Choose for each one, then press Go.',
    card: 'The card',
    tray: 'Your pieces',
    go: 'Go!',
    fly: 'Firefly {id}',
    eel: 'The eel battery',
    eelEnds: '+ end and − end',

    'tier.on': 'Glows', 'tier.0': 'Sleeps',
    'tier.4': 'Bright', 'tier.3': 'Medium', 'tier.2': 'Dim', 'tier.1': 'Faint',
    'tierRows.0': 'Asleep',

    'piece.straight': 'Straight wire',
    'piece.corner': 'Corner wire',
    'piece.tee': 'T wire',
    'piece.cross': 'Cross wire',
    'piece.wood': 'Wooden stick',
    slotEmpty: 'Square {n}: empty',
    slotFull: 'Square {n}: {piece}. Tap to turn it.',
    pickPiece: 'Tap one of your pieces first.',
    fillAll: 'Fill every empty square first.',
    pickAll: 'Choose for every firefly first.',
    picked: '{piece} is ready. Now tap an empty square.',
    switchOn: 'closed switch',
    switchOff: 'open switch',
    wood: 'wooden stick',
    rock: 'rock',

    right: '✓ Firefly {id}: {tier}, just as you said.',
    surprise: 'Surprise! Firefly {id}: {tier}.',
    matched: '✓ Every firefly matches the card!',
    notYet: 'Not yet. Firefly {id} should be {want}, but it is {got}.',
    notYetShort: 'Not yet: that makes a short circuit, and every firefly sleeps.',
    tryMore: 'Change a piece and press Go again.',

    'why.alone': 'It has a whole loop: out of the eel, through the firefly, and back to the other end. So it glows.',
    'why.side': 'It has its own path to the eel, so it gets the eel’s whole push. Bright!',
    'why.row': 'It is in a row with another firefly. They share the eel’s push, so both are dim.',
    'why.open': 'There is no complete loop through it, so the dots cannot move. It sleeps.',
    'why.bypass': 'A plain wire goes around it. The dots take the easy path and skip it.',
    'why.short': 'The eel’s two ends are joined by wire alone: a short circuit. The dots race round the shortcut, and no firefly glows.',
    'why.balanced': 'Both of its feet get the same push, so no dots go through it.',
    'why.mix3': 'All the dots for the pair pass through it, so it glows more than either of them.',
    'why.mix1': 'The pair shares what comes through the firefly in a row, so each one glows only a little.',
    'why.same': 'Look at the dots: they move just as fast after the firefly as before it. The firefly uses the eel’s push, not the dots.',
    safety: 'Never join the two ends of a real battery with a wire. It gets hot and can burn you.',
    socket: 'Never put anything in a wall socket. Wall electricity can hurt you, even with one touch.',

    hintBuild: 'Follow the wire from the eel’s + end. Can you get all the way round, through every firefly, and back to the − end?',
    hintPlace: 'Here is one piece in its place.',
    hintPredict: 'Trace a loop from the eel’s + end back to its − end. Which fireflies does it pass through?',
    hintShort: 'Is there a path from + to − made of wire alone? Then it is a short circuit.',
    still: 'With reduced motion the dots stand still; the arrows show which way they move.'
  },
  es: {
    'ch.e1': 'Cierra el circuito',
    'ch.e1.idea': 'Rellena el hueco para que la luciérnaga despierte.',
    'ch.e2': '¿Brillará?',
    'ch.e2.idea': 'Mira los cables. ¿Despertará cada luciérnaga?',
    'ch.e3': 'Despiértalas a todas',
    'ch.e3.idea': 'Dos luciérnagas, una anguila, cada pieza en su sitio.',
    'ch.m1': '¿Metal o madera?',
    'ch.m1.idea': 'Un palito parece un cable, pero es de madera.',
    'ch.m2': 'Atajos',
    'ch.m2.idea': 'Un cable solo atraviesa el centro. ¿Qué hace?',
    'ch.m3': 'En fila o lado a lado',
    'ch.m3.idea': 'Dos luciérnagas: ¿brillan poco o mucho?',
    'ch.h1': 'Mucho y poco',
    'ch.h1.idea': 'Arma el circuito que muestra la tarjeta.',
    'ch.h2': 'Interruptores',
    'ch.h2.idea': 'Unos interruptores están abiertos y otros cerrados. ¿Quién brilla?',
    'ch.h3': 'Circuitos difíciles',
    'ch.h3.idea': 'Una luciérnaga en fila con una pareja. ¿Quién brilla más?',

    'tile.build': 'Ármalo',
    'tile.predict': '¿Brillará?',

    'ask.build': 'Pon las piezas en los cuadros vacíos para que las luciérnagas queden como en la tarjeta.',
    'ask.buildHow': 'Toca una pieza y luego un cuadro vacío. Toca una pieza puesta para girarla.',
    'ask.predict': '¿Cómo brillará cada luciérnaga? Elige para cada una y pulsa ¡Vamos!',
    card: 'La tarjeta',
    tray: 'Tus piezas',
    go: '¡Vamos!',
    fly: 'Luciérnaga {id}',
    eel: 'La anguila pila',
    eelEnds: 'extremo + y extremo −',

    'tier.on': 'Brilla', 'tier.0': 'Duerme',
    'tier.4': 'Brilla mucho', 'tier.3': 'Brilla', 'tier.2': 'Brilla poco', 'tier.1': 'Casi nada',
    'tierRows.0': 'Dormida',

    'piece.straight': 'Cable recto',
    'piece.corner': 'Cable en esquina',
    'piece.tee': 'Cable en T',
    'piece.cross': 'Cable en cruz',
    'piece.wood': 'Palito de madera',
    slotEmpty: 'Cuadro {n}: vacío',
    slotFull: 'Cuadro {n}: {piece}. Tócalo para girarlo.',
    pickPiece: 'Primero toca una de tus piezas.',
    fillAll: 'Primero rellena todos los cuadros vacíos.',
    pickAll: 'Primero elige para cada luciérnaga.',
    picked: '{piece} está lista. Ahora toca un cuadro vacío.',
    switchOn: 'interruptor cerrado',
    switchOff: 'interruptor abierto',
    wood: 'palito de madera',
    rock: 'piedra',

    right: '✓ Luciérnaga {id}: {tier}, como dijiste.',
    surprise: '¡Sorpresa! Luciérnaga {id}: {tier}.',
    matched: '✓ ¡Todas las luciérnagas quedan como en la tarjeta!',
    notYet: 'Todavía no. La luciérnaga {id} debería quedar así: {want}, pero queda así: {got}.',
    notYetShort: 'Todavía no: así hay un cortocircuito, y todas las luciérnagas duermen.',
    tryMore: 'Cambia una pieza y pulsa ¡Vamos! otra vez.',

    'why.alone': 'Tiene un circuito completo: sale de la anguila, pasa por la luciérnaga y vuelve al otro extremo. Por eso brilla.',
    'why.side': 'Tiene su propio camino hasta la anguila, así que recibe todo su empuje. ¡Brilla mucho!',
    'why.row': 'Está en fila con otra luciérnaga. Comparten el empuje de la anguila, así que las dos brillan poco.',
    'why.open': 'No hay un circuito completo que pase por ella, así que los puntitos no se mueven. Duerme.',
    'why.bypass': 'Un cable solo pasa por su lado. Los puntitos toman el camino fácil y se la saltan.',
    'why.short': 'Los dos extremos de la anguila están unidos solo con cable: un cortocircuito. Los puntitos corren por el atajo y ninguna luciérnaga brilla.',
    'why.balanced': 'Sus dos patitas reciben el mismo empuje, así que ningún puntito pasa por ella.',
    'why.mix3': 'Todos los puntitos de la pareja pasan por ella, así que brilla más que cada una de las otras.',
    'why.mix1': 'La pareja se reparte lo que pasa por la luciérnaga en fila, así que cada una brilla muy poco.',
    'why.same': 'Mira los puntitos: van igual de rápido después de la luciérnaga que antes. La luciérnaga usa el empuje de la anguila, no los puntitos.',
    safety: 'Nunca unas los dos extremos de una pila de verdad con un cable. Se calienta y puede quemarte.',
    socket: 'Nunca metas nada en un enchufe. La electricidad de la pared puede hacerte daño, aunque la toques una sola vez.',

    hintBuild: 'Sigue el cable desde el extremo + de la anguila. ¿Puedes dar toda la vuelta, pasando por cada luciérnaga, y volver al extremo −?',
    hintPlace: 'Aquí tienes una pieza en su sitio.',
    hintPredict: 'Sigue un circuito desde el extremo + de la anguila hasta el −. ¿Por qué luciérnagas pasa?',
    hintShort: '¿Hay un camino de + a − hecho solo de cable? Entonces es un cortocircuito.',
    still: 'Con el movimiento reducido los puntitos no se mueven; las flechas muestran hacia dónde van.'
  }
};

export const ft = (key, lang, vars) => lookup(FIREFLY_TEXT, key, lang, vars);

/** The word for a tier in a level's set: Easy says glows or sleeps. */
export function tierWord(v, set, L) {
  if (set === 'glow') return ft(v === 'on' ? 'tier.on' : 'tier.0', L);
  if (v === 0) return ft('tierRows.0', L);
  return ft(`tier.${v}`, L);
}

export default { FIREFLY_TEXT, ft, tierWord };
