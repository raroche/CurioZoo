/**
 * registry.js — every room in the zoo, in one list.
 *
 * To add a room:
 *
 *   1. Make a folder, assets/js/rooms/<id>/, holding
 *        room.js       the room's code (the contract is below)
 *        screens.html  its <section class="gp-screen"> screens
 *        room.css      its own styles, if it needs any
 *   2. Add one entry to REGISTRY below.
 *
 * Nothing else changes: not index.html, not app.js, not the stylesheet. The
 * home page draws its cards from this list, the router finds rooms in it, the
 * back links come from it, and npm run verify checks it (tools/roomcheck.mjs).
 *
 * An entry has two halves.
 *
 *   The card on the home page: id, name, hue, creature, href, status, blurb,
 *   meta. `hue` is a palette key; `status` is 'live' or 'soon', and a 'soon'
 *   room is shown greyed and is not a link. An entry with no name has no card
 *   (the home page itself).
 *
 *   The code: `routes` are the first parts of the addresses the room answers
 *   (#/chess/1 is 'chess'); `code` loads room.js; `screens` and `css` are its
 *   files, relative to this folder; `back(parts)` says where the back control
 *   goes from an address, as { href, label }, or null for no back control.
 *
 * None of a room's files are downloaded until a child opens it. The first
 * visit fetches its code, screens and styles together; every visit after that
 * is instant. A room's code may import shared modules (../../modules/) and its
 * own files, never another room's: tools/archcheck.mjs holds that line.
 *
 * room.js exports:
 *   render(parts)    required. Draw the screen for this address and show it.
 *                    parts is the address split up: #/chess/1 -> ['chess','1'].
 *   init()           optional. Runs once, after the screens are on the page.
 *   onClick(ev)      optional. A click anywhere while this room is showing.
 *                    Return true if it was the room's.
 *   onKeydown(ev)    optional. The same, for a key.
 */

const HOME = { href: '#/home', label: 'Home' };
const GIFTED = { href: '#/gifted', label: 'GiftedPrep' };

/**
 * Order is the order a child sees the cards, so the most inviting room comes
 * first and the test practice comes last.
 */
export const REGISTRY = [
  {
    /* The zoo map. Its screen is in index.html, because it is the first thing
       anybody sees and must not wait for a download. */
    id: 'home',
    routes: ['home'],
    code: () => import('./home/room.js'),
    back: () => null
  },
  {
    id: 'math',
    name: 'Math Lab',
    hue: 'sky',
    creature: 'owl',
    href: '#/math',
    status: 'live',
    blurb: 'Primes, infinity, secret codes and puzzles nobody has solved yet.',
    meta: '86 topics · grades 1 to 6',

    routes: ['math'],
    code: () => import('./math/room.js'),
    screens: 'math/screens.html',
    /* #/math/1/four-colours -> #/math/1 -> #/math -> home */
    back: ([, grade, topic]) => {
      if (topic) return { href: `#/math/${grade}`, label: `Grade ${grade}` };
      if (grade) return { href: '#/math', label: 'Math Lab' };
      return HOME;
    }
  },
  {
    id: 'teasers',
    name: 'Math Brain Teasers',
    hue: 'lagoon',
    /* The frog's eyes sit on top of its head: two bumps, neither round ears
       nor pointed ones, so it reads apart from every other room. */
    creature: 'frog',
    href: '#/teasers',
    status: 'live',
    blurb: 'Riddles that make you think twice. Three levels, and a hint when you are stuck.',
    meta: '327 teasers \u00b7 3 levels \u00b7 English or Spanish',

    routes: ['teasers'],
    code: () => import('./teasers/room.js'),
    screens: 'teasers/screens.html',
    /* A round has its own "Change the round". */
    back: (parts) => (parts.length > 1 ? null : HOME)
  },
  {
    id: 'trivia',
    name: 'Curio Trivia',
    hue: 'honey',
    /* The long neck of the family: the one who can see over everything. Its
       ossicones are the only ears that are neither round nor pointed, so it
       cannot be mistaken for any other room at tile size. */
    creature: 'giraffe',
    href: '#/trivia',
    status: 'live',
    blurb: 'Animals, space, your body, the world. Every answer teaches you something.',
    meta: '4,739 questions \u00b7 3 levels \u00b7 English or Spanish',

    routes: ['trivia'],
    code: () => import('./trivia/room.js'),
    screens: 'trivia/screens.html',
    /* The round and the Fact Book label their own way out: "Change the
       round", "Back to the game". */
    back: (parts) => (parts.length > 1 ? null : HOME)
  },
  {
    id: 'logic',
    name: 'Logic Games',
    hue: 'jade',
    /* The curious one. Cat ears are pointed like the fox's, but shorter and
       set wider; the fox is Chess Club's and the two read apart at tile size. */
    creature: 'cat',
    href: '#/logic',
    status: 'live',
    blurb: 'Crack codes, catch the Moon animals, find secret rules and more.',
    meta: '7 games · 5,140 puzzles · English or Spanish',

    routes: ['logic'],
    code: () => import('./logic/room.js'),
    screens: 'logic/screens.html',
    css: 'logic/room.css',
    /* Inside a game every screen draws its own way back, in the child's
       language: "Back to the chapter", "Volver a los capítulos". */
    back: (parts) => (parts.length > 1 ? null : HOME)
  },
  {
    id: 'fun',
    name: 'Fun and Games',
    hue: 'flamingo',
    /* Owl tufts and fox ears are both triangles and read alike at 46px. The
       three live rooms take the three most unlike silhouettes there are:
       sharp tufts, tall ears, round ears. */
    creature: 'rabbit',
    href: '#/fun',
    status: 'live',
    blurb: 'Name every flag in the world. Was the wheel discovered or invented?',
    meta: '6 games · English or Spanish',

    routes: ['fun'],
    code: () => import('./fun/room.js'),
    screens: 'fun/screens.html',
    /* The games label their own way out: "Back to games", "Change the round". */
    back: (parts) => (parts.length > 1 ? null : HOME)
  },
  {
    id: 'chess',
    name: 'Chess Club',
    hue: 'leaf',
    creature: 'fox',
    href: '#/chess',
    status: 'live',
    blurb: 'Meet the six pieces, win your first game, then learn the tricks.',
    meta: '52 lessons \u00b7 8 games \u00b7 11,157 puzzles',

    routes: ['chess'],
    code: () => import('./chess/room.js'),
    screens: 'chess/screens.html',
    css: 'chess/room.css',
    /* #/chess/1/l1-rook -> #/chess/1 -> #/chess -> home. A lesson goes back
       to its own level, not to the hub: a child working through Pawn Camp
       wants the next lesson, not the front door.

       Only when the middle segment is a level NUMBER. #/chess/games/kinghunt
       is three segments too, and sending that one "up" produced a link to
       #/chess/games, which is not a page. */
    back: ([, a, lesson]) => {
      if (lesson !== undefined && /^[123]$/.test(a)) {
        return { href: `#/chess/${a}`, label: 'Back to the lessons' };
      }
      if (a) return { href: '#/chess', label: 'Chess Club' };
      return HOME;
    }
  },
  {
    id: 'gifted',
    name: 'GiftedPrep',
    hue: 'orchid',
    creature: 'bear',
    href: '#/gifted',
    status: 'live',
    blurb: 'The kinds of puzzles used on gifted tests, so test day is not a surprise.',
    meta: '1,576 puzzles · grades 1 to 4',

    /* The test practice, and the Parent Guide that explains it. */
    routes: ['gifted', 'tests', 'categories', 'quiz', 'results', 'parents'],
    code: () => import('./gifted/room.js'),
    screens: 'gifted/screens.html',
    back: ([head, a]) => {
      switch (head) {
        case 'tests':
        case 'results':
        case 'parents':
          return GIFTED;
        case 'categories':
          return a === 'all' ? GIFTED : { href: '#/tests', label: 'Tests' };
        case 'quiz':
          return { href: null, label: 'Leave this set', action: 'leave-quiz' };
        default:
          return HOME;
      }
    }
  }
];

/** The cards on the home page, in order. */
export const ROOMS = REGISTRY.filter((r) => r.name);
export const LIVE_ROOMS = ROOMS.filter((r) => r.status === 'live');
export const roomById = (id) => REGISTRY.find((r) => r.id === id) || null;

/** The room that answers an address's first part, or null. */
export const roomForRoute = (head) => REGISTRY.find((r) => r.routes && r.routes.includes(head)) || null;

/** One of a room's files, as a URL the browser can fetch. */
export const roomFile = (path) => new URL(path, import.meta.url).href;

/**
 * Where "back" goes from here.
 *
 * The rule is one step up the path, and each room says what that means for
 * its own addresses. Returns null on the home page, which is the top, and on
 * screens that carry their own labelled link. An address no room answers goes
 * home, because the router sends it there too.
 */
export function backTarget(hash = location.hash || '#/home') {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  const room = roomForRoute(parts[0] || 'home');
  return room ? room.back(parts) : HOME;
}

export default { REGISTRY, ROOMS, LIVE_ROOMS, roomById, roomForRoute, roomFile, backTarget };
