/**
 * slidetext.js — every word Penguin Slide says, in English and Spanish.
 *
 * The "why" lines follow research-motion.md section 5. The penguin is "the
 * penguin" / "el pingüino" throughout, so no sentence has to guess a
 * gender. The Spanish is a draft owed a native read.
 */

import { lookup } from './logictext.js';

export const SLIDE_TEXT = {
  en: {
    'ch.e1': 'Out of the tube',
    'ch.e1.idea': 'The penguin slides through a curved tube. Which fish does it reach?',
    'ch.e2': 'Up and over?',
    'ch.e2.idea': 'Can the penguin slide over each hill?',
    'ch.e3': 'Splash!',
    'ch.e3.idea': 'Off the ledge it flies. Where does it splash?',
    'ch.m1': 'Twisty tubes',
    'ch.m1.idea': 'Longer tubes, more turns. Where does it go at the end?',
    'ch.m2': 'Hills in a row',
    'ch.m2.idea': 'Which hill stops the penguin?',
    'ch.m3': 'Splash zone',
    'ch.m3.idea': 'Faster slides and higher ledges.',
    'ch.h1': 'Pick the shelf',
    'ch.h1.idea': 'Where should the penguin start, to land in the pool?',
    'ch.h2': 'Over and in',
    'ch.h2.idea': 'Clear the hill, then land in the pool.',
    'ch.h3': 'Tube after tube',
    'ch.h3.idea': 'Two tubes in a row. Follow the penguin.',

    'tile.tube': 'Which fish', 'tile.lanes': 'Over the hill', 'tile.hills': 'Where it stops',
    'tile.jump': 'Where it splashes', 'tile.ledge': 'How high', 'tile.start': 'Pick the shelf',

    'ask.tube': 'The penguin slides on the ice through the tube. Which fish will it reach?',
    'ask.lanes': 'The penguin starts {hh} up. Can it get over the hill in each lane?',
    'ask.hills': 'The penguin starts {hh} up. Where will it stop?',
    'ask.jump': 'The penguin slides down {dd}, then flies off a ledge {HH} high. Where will it splash?',
    'ask.ledge': 'The penguin slides down {dd} and splashes {xx} out. How high is the ledge?',
    'ask.start': 'The ledge is {HH} high and the pool is {xx} out. Which shelf should the penguin start from?',
    'ask.startHill': 'The ledge is {HH} high and the pool is {xx} out, past a hill {tt} high. Which shelf should the penguin start from?',
    help: 'The penguin slides on its tummy, so nothing slows it on the ice.',
    lane: 'Lane {n}',
    fish: 'Fish {x}',
    over: 'Over', stop: 'Stops',
    stopBefore: 'Stops before hill {n}',
    overAll: 'Over every hill',
    out: '{xx} out',
    up: '{hh} up',
    high: '{hh} high',
    go: 'Slide!',
    pickAll: 'Choose for every one first.',
    rowsN: '{n} rows', rows1: '1 row', squaresN: '{n} squares', squares1: '1 square', ticksN: '{n} ticks', ticks1: '1 tick',

    right: '✓ {res}, just as you said.',
    surprise: 'Surprise! {res}.',
    'res.fish': 'It reached fish {x}',
    'res.over': 'Lane {n}: it got over',
    'res.stop': 'Lane {n}: it could not get over',
    'res.stopAt': 'It stopped before hill {n}',
    'res.overAll': 'It got over every hill',
    'res.splash': 'It splashed {xx} out',
    'res.ledge': 'The ledge is {hh} high',
    'res.start': 'Start {hh} up',

    'why.tube': 'Out of the tube, nothing turns the penguin any more, so it slides straight on, the way the tube pointed at the end.',
    'why.curve': '“It keeps curving” is a very common guess, but the tube was the only thing turning it.',
    'why.flung': 'It is not flung outward either. It just goes straight.',
    'why.over': 'The top is lower than where it started, so it has enough go to get over.',
    'why.stop': 'A sliding penguin can never climb higher than where it started, and the snow steals a little, so a hill this high stops it.',
    'why.equal': 'It cannot get over a hill exactly as high as its start: the snow steals a little go.',
    'why.speed': 'Sliding down {dd}, it reaches {vv} a tick.',
    'why.fly': 'Falling {HH} takes {nn}. It keeps going forward the whole time, so it lands {vv} × {n} = {xx} out.',
    'why.curveDown': 'It keeps going forward and falls at the same time, so its path bends down like a rainbow.',
    'why.hill': 'A start {hh} up gets over a hill {tt} high only if the hill is at least one row lower.',
    speedTable: 'Down 1 row: 2 squares a tick. Down 4: 4. Down 9: 6. Down 16: 8. Down 25: 10.',
    hintTube: 'Look at which way the tube points at its very end.',
    hintHill: 'Compare each hill’s top with where the penguin starts.',
    hintJump: 'First its speed, from how far it slid down. Then how many ticks the fall takes.',
    still: 'With reduced motion the penguin is shown where it ends up.'
  },
  es: {
    'ch.e1': 'Al salir del tubo',
    'ch.e1.idea': 'El pingüino se desliza por un tubo curvo. ¿A qué pez llega?',
    'ch.e2': '¿Pasa la colina?',
    'ch.e2.idea': '¿Puede el pingüino deslizarse por encima de cada colina?',
    'ch.e3': '¡Chapuzón!',
    'ch.e3.idea': 'Sale volando de la repisa. ¿Dónde cae al agua?',
    'ch.m1': 'Tubos con curvas',
    'ch.m1.idea': 'Tubos más largos, más vueltas. ¿Adónde va al final?',
    'ch.m2': 'Colinas en fila',
    'ch.m2.idea': '¿Qué colina detiene al pingüino?',
    'ch.m3': 'Zona de chapuzones',
    'ch.m3.idea': 'Deslizadas más rápidas y repisas más altas.',
    'ch.h1': 'Elige la repisa',
    'ch.h1.idea': '¿Desde dónde debe salir el pingüino para caer en la piscina?',
    'ch.h2': 'Por encima y adentro',
    'ch.h2.idea': 'Pasa la colina y luego cae en la piscina.',
    'ch.h3': 'Tubo tras tubo',
    'ch.h3.idea': 'Dos tubos seguidos. Sigue al pingüino.',

    'tile.tube': 'Qué pez', 'tile.lanes': 'Pasa la colina', 'tile.hills': 'Dónde para',
    'tile.jump': 'Dónde cae', 'tile.ledge': 'Qué altura', 'tile.start': 'Elige la repisa',

    'ask.tube': 'El pingüino se desliza sobre el hielo por el tubo. ¿A qué pez llegará?',
    'ask.lanes': 'El pingüino sale a {hh} de alto. ¿Puede pasar la colina de cada carril?',
    'ask.hills': 'El pingüino sale a {hh} de alto. ¿Dónde se detendrá?',
    'ask.jump': 'El pingüino baja deslizándose {dd} y sale volando de una repisa de {HH}. ¿Dónde caerá al agua?',
    'ask.ledge': 'El pingüino baja deslizándose {dd} y cae al agua a {xx}. ¿Qué altura tiene la repisa?',
    'ask.start': 'La repisa mide {HH} y la piscina está a {xx}. ¿Desde qué repisa debe salir el pingüino?',
    'ask.startHill': 'La repisa mide {HH} y la piscina está a {xx}, detrás de una colina de {tt}. ¿Desde qué repisa debe salir el pingüino?',
    help: 'El pingüino se desliza sobre la barriga, así que nada lo frena en el hielo.',
    lane: 'Carril {n}',
    fish: 'Pez {x}',
    over: 'Pasa', stop: 'Se para',
    stopBefore: 'Se para antes de la colina {n}',
    overAll: 'Pasa todas las colinas',
    out: 'a {xx}',
    up: 'a {hh} de alto',
    high: '{hh} de alto',
    go: '¡A deslizarse!',
    pickAll: 'Primero elige para cada uno.',
    rowsN: '{n} filas', rows1: '1 fila', squaresN: '{n} casillas', squares1: '1 casilla', ticksN: '{n} tics', ticks1: '1 tic',

    right: '✓ {res}, como dijiste.',
    surprise: '¡Sorpresa! {res}.',
    'res.fish': 'Llegó al pez {x}',
    'res.over': 'Carril {n}: pasó',
    'res.stop': 'Carril {n}: no pudo pasar',
    'res.stopAt': 'Se paró antes de la colina {n}',
    'res.overAll': 'Pasó todas las colinas',
    'res.splash': 'Cayó al agua a {xx}',
    'res.ledge': 'La repisa mide {hh}',
    'res.start': 'Salir a {hh} de alto',

    'why.tube': 'Al salir del tubo, ya nada hace girar al pingüino, así que sigue recto, hacia donde apuntaba el tubo al final.',
    'why.curve': '«Sigue girando» es una idea muy común, pero el tubo era lo único que lo hacía girar.',
    'why.flung': 'Tampoco sale lanzado hacia afuera. Simplemente sigue recto.',
    'why.over': 'La cima está más baja que donde salió, así que tiene impulso de sobra para pasar.',
    'why.stop': 'Un pingüino que se desliza nunca sube más alto que donde salió, y la nieve le quita un poco, así que una colina tan alta lo detiene.',
    'why.equal': 'No puede pasar una colina igual de alta que su salida: la nieve le quita un poco de impulso.',
    'why.speed': 'Al bajar {dd}, llega a {vv} por tic.',
    'why.fly': 'Caer {HH} tarda {nn}. Sigue avanzando todo el tiempo, así que cae a {vv} × {n} = {xx}.',
    'why.curveDown': 'Sigue hacia adelante y cae a la vez, así que su camino se dobla como un arcoíris.',
    'why.hill': 'Saliendo a {hh} de alto pasa una colina de {tt} solo si la colina está al menos una fila más baja.',
    speedTable: 'Baja 1 fila: 2 casillas por tic. Baja 4: 4. Baja 9: 6. Baja 16: 8. Baja 25: 10.',
    hintTube: 'Mira hacia dónde apunta el tubo justo al final.',
    hintHill: 'Compara la cima de cada colina con la altura de salida del pingüino.',
    hintJump: 'Primero su velocidad, por lo que bajó. Luego cuántos tics tarda la caída.',
    still: 'Con el movimiento reducido, el pingüino aparece donde termina.'
  }
};

export const st = (key, lang, vars) => lookup(SLIDE_TEXT, key, lang, vars);

export const rows = (n, L) => st(n === 1 ? 'rows1' : 'rowsN', L, { n });
export const squares = (n, L) => st(n === 1 ? 'squares1' : 'squaresN', L, { n });
export const ticks = (n, L) => st(n === 1 ? 'ticks1' : 'ticksN', L, { n });

export default { SLIDE_TEXT, st, rows, squares, ticks };
