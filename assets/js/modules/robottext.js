/**
 * robottext.js — every word Robot Path and Fix the Bug say, in English and
 * Spanish. The two games share the robot, its tiles and its mistakes, so
 * they share one table.
 */

import { lookup } from './logictext.js';

export const ROBOT_TEXT = {
  en: {
    /* Tiles */
    'op.U': 'Up', 'op.R': 'Right', 'op.D': 'Down', 'op.L': 'Left',
    'op.F': 'Forward', 'op.TL': 'Turn left', 'op.TR': 'Turn right', 'op.FEED': 'Feed',
    'op.rep': 'Repeat', 'op.h1': 'Helper A', 'op.h2': 'Helper B', 'op.if': 'If', 'op.until': 'Until all are fed',
    'cond.ahead': 'path ahead', 'cond.left': 'path on the left', 'cond.right': 'path on the right', 'cond.animal': 'on an animal',
    'paint.o': 'only on orange stripes', 'paint.b': 'only on blue dots', 'paint.none': 'everywhere',
    else: 'else',
    times: '{n} times',
    'row.main': 'Main', 'row.h1': 'Helper A', 'row.h2': 'Helper B',
    slots: '{n} of {m} tiles',

    /* Editing */
    ask: 'Program the robot to feed every animal. Build a program, then press Run.',
    askAbs: 'Program the robot to feed every animal. The arrows move it one square that way.',
    askRel: 'Program the robot to feed every animal. Turns are the robot\'s own left and right: watch which way its nose points.',
    paletteLabel: 'Tiles',
    tapTile: 'Tap a tile to add it to the program.',
    rowFull: 'That row is full. Try a Repeat or a helper.',
    deleteBack: 'Delete',
    remove: 'Remove this tile',
    more: 'More', fewer: 'Fewer',
    nextCond: 'Change what it checks',
    nextPaint: 'Change where it works',
    flipTurn: 'Turn the other way',
    clearAll: 'Clear the program',
    undo: 'Undo',
    insideHere: 'inside',
    endOf: 'end of {what}',

    /* Running */
    run: 'Run', step: 'Step', reset: 'Back to start', fast: 'Faster', slow: 'Slower',
    'why.bump': 'Bump! The robot walked into a wall.',
    'why.nothing': 'There is nothing to feed on this square.',
    'why.unfed': 'The program ended, but some animals are still hungry.',
    'why.tired': 'The robot is tired. Is there a loop that never stops?',
    'why.deep': 'Too many helpers inside helpers.',
    'why.empty': 'The program is empty. Tap a tile to start.',
    right: 'Every animal is fed!',
    loopAt: 'Repeat: {i} of {n}',

    /* Hints */
    'hint.process': 'Press Step and watch where the robot goes wrong.',
    'hint.seq': 'Count the squares. Which way does the robot go first?',
    'hint.loop': 'Do you see something that happens again and again? Put it inside a Repeat.',
    'hint.helper': 'Is there a little route the robot does more than once? Teach it to a helper and call the helper.',
    'hint.colour': 'The robot should turn only on painted squares. Paint your turn tiles.',
    'hint.sense': 'Look before you move: if there is a path ahead, go forward; if not, turn.',
    'hint.recur': 'A helper can call itself at the end, to keep going until the job is done.',
    'hint.show': 'Here is how a program that works begins.',

    /* After a solve */
    'whyDone.seq': 'You programmed it step by step: {par} tiles.',
    'whyDone.loop': 'Repeats saved you {saved} tiles: {mine} tiles instead of {flat}.',
    'whyDone.helper': 'Helpers saved you {saved} tiles: {mine} tiles instead of {flat}.',
    'whyDone.colour': 'Painted tiles made one short loop work on a winding path.',
    'whyDone.sense': 'Looking before moving works on any path like this one.',
    'whyDone.recur': 'A helper that calls itself keeps going until the job is done.',
    'whyDone.par': 'The shortest program we know uses {par} tiles. Yours used {mine}.',

    /* Worlds */
    'ch.e1': 'Petting Farm', 'ch.e1.idea': 'Arrows move the robot one square. Feed each animal.',
    'ch.e2': 'Duck Pond', 'ch.e2.idea': 'A Repeat does the same move again and again.',
    'ch.e3': 'Monkey Grove', 'ch.e3.idea': 'Repeat two moves together to climb the stairs.',
    'ch.e4': 'Penguin Beach', 'ch.e4.idea': 'Feed inside a Repeat to feed a whole row.',
    'ch.m1': 'Turning Bridge', 'ch.m1.idea': 'Now the robot turns left and right the way it faces. Watch its nose!',
    'ch.m2': 'Savanna', 'ch.m2.idea': 'Repeat walking and turning together.',
    'ch.m3': 'Rainforest', 'ch.m3.idea': 'Teach a helper a little route, then call it.',
    'ch.m4': 'Reptile House', 'ch.m4.idea': 'Tiles that only work on painted squares.',
    'ch.h1': 'Arctic', 'ch.h1.idea': 'Two helpers working together.',
    'ch.h2': 'Night House', 'ch.h2.idea': 'If and Until: look before you move.',
    'ch.h3': 'Aquarium', 'ch.h3.idea': 'A helper that calls itself.',
    'ch.h4': 'Keeper HQ', 'ch.h4.idea': 'Everything together.',
    'tile.level': 'Robot level',
    'map.title': 'Keeper\'s round',
    'map.lede': 'Every zoo area you finish adds a stop to the robot\'s round.',
    'map.count': '{n} of {t} levels'
  },
  es: {
    'op.U': 'Arriba', 'op.R': 'Derecha', 'op.D': 'Abajo', 'op.L': 'Izquierda',
    'op.F': 'Adelante', 'op.TL': 'Gira a la izquierda', 'op.TR': 'Gira a la derecha', 'op.FEED': 'Dar de comer',
    'op.rep': 'Repetir', 'op.h1': 'Ayudante A', 'op.h2': 'Ayudante B', 'op.if': 'Si', 'op.until': 'Hasta que todos coman',
    'cond.ahead': 'hay camino delante', 'cond.left': 'hay camino a la izquierda', 'cond.right': 'hay camino a la derecha', 'cond.animal': 'está sobre un animal',
    'paint.o': 'solo en rayas naranjas', 'paint.b': 'solo en puntos azules', 'paint.none': 'en todas partes',
    else: 'si no',
    times: '{n} veces',
    'row.main': 'Principal', 'row.h1': 'Ayudante A', 'row.h2': 'Ayudante B',
    slots: '{n} de {m} fichas',

    ask: 'Programa al robot para que dé de comer a todos los animales. Arma un programa y pulsa Ejecutar.',
    askAbs: 'Programa al robot para que dé de comer a todos los animales. Las flechas lo mueven una casilla hacia ese lado.',
    askRel: 'Programa al robot para que dé de comer a todos los animales. Los giros son la izquierda y la derecha del robot: mira hacia dónde apunta su nariz.',
    paletteLabel: 'Fichas',
    tapTile: 'Toca una ficha para añadirla al programa.',
    rowFull: 'Esa fila está llena. Prueba con Repetir o con un ayudante.',
    deleteBack: 'Borrar',
    remove: 'Quitar esta ficha',
    more: 'Más', fewer: 'Menos',
    nextCond: 'Cambiar lo que mira',
    nextPaint: 'Cambiar dónde funciona',
    flipTurn: 'Girar hacia el otro lado',
    clearAll: 'Borrar el programa',
    undo: 'Deshacer',
    insideHere: 'dentro',
    endOf: 'fin de {what}',

    run: 'Ejecutar', step: 'Paso', reset: 'Volver al inicio', fast: 'Más rápido', slow: 'Más lento',
    'why.bump': '¡Pum! El robot chocó contra una pared.',
    'why.nothing': 'En esta casilla no hay nadie a quien dar de comer.',
    'why.unfed': 'El programa terminó, pero todavía hay animales con hambre.',
    'why.tired': 'El robot está cansado. ¿Hay un bucle que no termina nunca?',
    'why.deep': 'Demasiados ayudantes dentro de ayudantes.',
    'why.empty': 'El programa está vacío. Toca una ficha para empezar.',
    right: '¡Todos los animales comieron!',
    loopAt: 'Repetir: {i} de {n}',

    'hint.process': 'Pulsa Paso y mira dónde se equivoca el robot.',
    'hint.seq': 'Cuenta las casillas. ¿Hacia dónde va primero el robot?',
    'hint.loop': '¿Ves algo que pasa una y otra vez? Mételo dentro de Repetir.',
    'hint.helper': '¿Hay un pequeño camino que el robot hace más de una vez? Enséñaselo a un ayudante y llama al ayudante.',
    'hint.colour': 'El robot solo debe girar en las casillas pintadas. Pinta tus fichas de giro.',
    'hint.sense': 'Mira antes de moverte: si hay camino delante, avanza; si no, gira.',
    'hint.recur': 'Un ayudante puede llamarse a sí mismo al final, para seguir hasta terminar el trabajo.',
    'hint.show': 'Así empieza un programa que funciona.',

    'whyDone.seq': 'Lo programaste paso a paso: {par} fichas.',
    'whyDone.loop': 'Repetir te ahorró {saved} fichas: {mine} fichas en vez de {flat}.',
    'whyDone.helper': 'Los ayudantes te ahorraron {saved} fichas: {mine} fichas en vez de {flat}.',
    'whyDone.colour': 'Las fichas pintadas hicieron que un bucle corto sirviera en un camino con curvas.',
    'whyDone.sense': 'Mirar antes de moverse sirve en cualquier camino como este.',
    'whyDone.recur': 'Un ayudante que se llama a sí mismo sigue hasta terminar el trabajo.',
    'whyDone.par': 'El programa más corto que conocemos usa {par} fichas. El tuyo usó {mine}.',

    'ch.e1': 'Granja', 'ch.e1.idea': 'Las flechas mueven al robot una casilla. Da de comer a cada animal.',
    'ch.e2': 'Estanque de patos', 'ch.e2.idea': 'Repetir hace el mismo movimiento una y otra vez.',
    'ch.e3': 'Bosque de monos', 'ch.e3.idea': 'Repite dos movimientos juntos para subir la escalera.',
    'ch.e4': 'Playa de pingüinos', 'ch.e4.idea': 'Da de comer dentro de Repetir para alimentar toda una fila.',
    'ch.m1': 'Puente de giros', 'ch.m1.idea': 'Ahora el robot gira a su izquierda y a su derecha. ¡Mira su nariz!',
    'ch.m2': 'Sabana', 'ch.m2.idea': 'Repite caminar y girar juntos.',
    'ch.m3': 'Selva tropical', 'ch.m3.idea': 'Enséñale un camino corto a un ayudante y luego llámalo.',
    'ch.m4': 'Casa de reptiles', 'ch.m4.idea': 'Fichas que solo funcionan en casillas pintadas.',
    'ch.h1': 'Ártico', 'ch.h1.idea': 'Dos ayudantes trabajando juntos.',
    'ch.h2': 'Casa nocturna', 'ch.h2.idea': 'Si y Hasta que: mira antes de moverte.',
    'ch.h3': 'Acuario', 'ch.h3.idea': 'Un ayudante que se llama a sí mismo.',
    'ch.h4': 'Base de cuidadores', 'ch.h4.idea': 'Todo junto.',
    'tile.level': 'Nivel del robot',
    'map.title': 'La ronda del cuidador',
    'map.lede': 'Cada zona del zoo que terminas añade una parada a la ronda del robot.',
    'map.count': '{n} de {t} niveles'
  }
};

export const rb = (key, lang, vars) => lookup(ROBOT_TEXT, key, lang, vars);

/** Which "why" and concept hint a level's kind gets. */
export const KIND_WORD = {
  seq: 'seq', seqturn: 'seq', run1: 'loop', run2: 'loop', loopfeed: 'loop', loopturn: 'loop',
  helper: 'helper', helpers2: 'helper', colour: 'colour', sense: 'sense', recur: 'recur'
};

export const OP_ICON = {
  U: '⬆', R: '➡', D: '⬇', L: '⬅', F: '👣', TL: '↶', TR: '↷', FEED: '🥕',
  rep: '🔁', h1: 'Ⓐ', h2: 'Ⓑ', if: '❓', until: '🔄'
};

export default { ROBOT_TEXT, rb, KIND_WORD, OP_ICON };
