/**
 * Play every game, in a real browser, and check a person could use it.
 *
 * Paste it; do not fetch and eval it. The site ships script-src 'self' with no
 * unsafe-eval, so eval() of a fetched file is refused by the page's own policy.
 *
 * Run in the page console, or via the browser pane. It exists because the
 * checks that run in node cannot catch the two failures that have actually
 * reached production:
 *
 *   A blank screen. showScreen() with an unregistered name hid everything and
 *   showed nothing, while the markup rendered and the console stayed clean.
 *   Nothing threw. It only looked broken to a person.
 *
 *   A dead handler. answerFlag() referenced a variable belonging to another
 *   function, so it threw halfway through and the "next" button was never
 *   added. The game scored the answer and then stranded you.
 *
 * So this measures pixels and interaction, not DOM presence: is exactly one
 * screen visible, can the question be answered, does feedback appear, and is
 * there a way onward. A regex scope-checker was tried instead and abandoned --
 * it produced 115KB of false positives from prose inside template literals.
 */
(async () => {
  const wait = (ms = 700) => new Promise((r) => setTimeout(r, ms));
  const vis = (el) => {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  const errors = [];
  window.addEventListener('error', (e) => errors.push(String(e.message)));

  const results = [];
  const check = (name, ok, detail = '') => results.push({ name, ok, detail });

  const GAMES = [
    { id: 'flags', setupScreen: 'screen-flagsetup',    start: '[data-action="flag-start"]',  answer: '[data-flagpick]',
      screen: '#screen-flaggame', next: '[data-action="flag-next"]', setup: [] },
    { id: 'shapes', setupScreen: 'screen-shapesetup',   start: '[data-action="shape-start"]', answer: '[data-shapeanswer]',
      screen: '#screen-shapegame', next: '[data-action="shape-next"]', setup: [] },
    { id: 'capitals', setupScreen: 'screen-capsetup', start: '[data-action="cap-start"]',   answer: '[data-capanswer]',
      screen: '#screen-capgame',  next: '[data-action="cap-next"]',  setup: [] },
    /* A room of its own now, not a game in Fun; the old address is checked below. */
    { id: 'trivia', path: '#/trivia', setupScreen: 'screen-triviasetup', start: '[data-action="trivia-start"]', answer: '[data-triviapick]',
      screen: '#screen-triviagame', next: '[data-action="trivia-next"]', setup: [] },
    { id: 'elements', setupScreen: 'screen-elemsetup', start: '[data-action="elem-start"]',  answer: '[data-elemanswer]',
      screen: '#screen-elemgame', next: '[data-action="elem-next"]',
      setup: ['[data-elemask="use"]'] },
    /* Every kind of angle question gets its own pass. They share a game loop
       but not a picture, and "bigger" is the only one where the choices ARE the
       figures -- which is exactly the sort of difference that renders nothing
       and throws nothing. */
    ...['estimate', 'bigger', 'sort', 'clock', 'world', 'bounce'].map((ask) => ({
      id: 'angles', label: `angles/${ask}`, setupScreen: 'screen-angsetup',
      start: '[data-action="ang-start"]', answer: '[data-anganswer]',
      screen: '#screen-anggame', next: '[data-action="ang-next"]',
      setup: [`[data-angask="${ask}"]`]
    }))
  ];

  for (const g of GAMES) {
    const name = g.label || g.id;
    const home = g.path || `#/fun/${g.id}`;
    location.hash = home;
    await wait(1300);
    const shown = [...document.querySelectorAll('.gp-screen')].filter(vis).map((s) => s.id);
    check(`${name}: setup is visible`, shown.length === 1, shown.join(',') || 'nothing visible');

    for (const sel of g.setup) {
      const b = document.querySelector(sel);
      if (b) { b.click(); await wait(300); }
    }
    /* The two things a page offers must both be reachable, and the looking one
       must be visible rather than a link buried under the form. */
    const learnGo = document.querySelector(`#${g.setupScreen} .cz-mode--learn .cz-mode__go`);
    check(`${name}: learn button is visible`, !!learnGo && vis(learnGo));

    const startBtn = document.querySelector(g.start);
    check(`${name}: has a start button`, !!startBtn);
    if (!startBtn) continue;
    startBtn.click();
    await wait(1400);

    check(`${name}: the game screen is visible`, vis(document.querySelector(g.screen)));
    const pick = document.querySelector(g.answer);
    check(`${name}: the question can be answered`, !!pick);
    if (!pick) continue;

    pick.click();
    await wait(800);
    check(`${name}: feedback appears`, !!document.querySelector('.gp-flagq__say'),
      document.querySelector('.gp-flagq__say')?.textContent?.slice(0, 50) || 'none');
    check(`${name}: there is a way to the next question`, !!document.querySelector(g.next));

    const nextBtn = document.querySelector(g.next);
    if (nextBtn) {
      nextBtn.click();
      await wait(900);
      check(`${name}: next actually advances`, vis(document.querySelector(g.screen)));
    }

    /* The browsing mode is a page a child can land on directly, so it gets the
       same visibility check the games do. */
    location.hash = `${home}/learn`;
    await wait(1600);
    const seen = [...document.querySelectorAll('.gp-screen')].filter(vis).map((s) => s.id);
    check(`${name}: learn mode is visible`, seen.length === 1, seen.join(',') || 'nothing visible');
  }

  /* ---- Discovered or Invented? ----
     Played through to the end, in Spanish, because that is the path with the
     most moving parts: the setup redraws in the chosen language, the card
     flips language mid-question, and the results page is only reached by
     answering every card. */
  {
    const onScreen = (id) => vis(document.getElementById(id));
    location.hash = '#/fun/discover';
    await wait(1300);
    check('discover: setup is visible', onScreen('screen-discsetup'));
    document.querySelector('[data-disccount="10"]')?.click();
    await wait(200);
    document.querySelector('[data-disclang="es"]')?.click();
    await wait(300);
    const title = document.getElementById('discsetup-title')?.textContent || '';
    check('discover: setup follows Spanish', /Descubierto o inventado/.test(title), title);
    const legend = document.querySelector('#gp-disc-setup legend')?.textContent || '';
    check('discover: setup labels are Spanish', /Cuántas preguntas/.test(legend), legend);

    const start = document.querySelector('[data-action="disc-start"]');
    check('discover: has a start button', !!start);
    start?.click();
    await wait(900);
    check('discover: the game screen is visible', onScreen('screen-discgame'));
    const card = () => document.querySelector('#gp-disc-body .cz-disc-card');
    check('discover: the card starts in Spanish', card()?.getAttribute('lang') === 'es');

    document.querySelector('[data-discpick="discovered"]')?.click();
    await wait(500);
    check('discover: feedback appears', !!document.querySelector('#gp-disc-body .gp-flagq__say'));
    check('discover: the why appears', !!document.querySelector('#gp-disc-body .cz-trivia-why'));
    check('discover: there is a way on', !!document.querySelector('[data-action="disc-next"]'));

    document.querySelector('[data-action="disc-lang"]')?.click();
    await wait(300);
    check('discover: the card flips to English', card()?.getAttribute('lang') === 'en');
    check('discover: the answer survives the flip',
      !!document.querySelector('#gp-disc-body .cz-trivia-why'));

    /* Nine more, then the results. */
    for (let i = 0; i < 9; i += 1) {
      document.querySelector('[data-action="disc-next"]')?.click();
      await wait(250);
      document.querySelector('[data-discpick="invented"]')?.click();
      await wait(250);
    }
    document.querySelector('[data-action="disc-next"]')?.click();
    await wait(600);
    const done = document.querySelector('#gp-disc-body .gp-flagdone');
    check('discover: a round of ten reaches the results', vis(done));
    check('discover: the results offer another round',
      !!document.querySelector('[data-action="disc-again"]'));

    /* A step the game does not have lands on its setup, not on a page that
       only looks right. */
    location.hash = '#/fun/discover/learn';
    await wait(900);
    check('discover: an unknown step goes to the setup', location.hash === '#/fun/discover',
      location.hash);
    document.querySelector('[data-disclang="en"]')?.click();
    await wait(200);
  }

  /* ---- Math Brain Teasers ----
     A room with levels, a hint behind a button and a language flip: each is
     a redraw that could come back blank, so each is looked at. */
  for (const level of ['easy', 'medium', 'hard']) {
    location.hash = '#/teasers';
    await wait(1300);
    check(`teasers/${level}: setup is visible`, vis(document.getElementById('screen-teasersetup')));
    document.querySelector(`[data-teaserlevel="${level}"]`)?.click();
    await wait(200);
    document.querySelector('[data-teasercount="5"]')?.click();
    await wait(200);
    const start = document.querySelector('[data-action="teaser-start"]');
    check(`teasers/${level}: has a start button`, !!start);
    start?.click();
    await wait(1400);
    check(`teasers/${level}: the game screen is visible`, vis(document.getElementById('screen-teasergame')));
    const want = level === 'easy' ? 3 : 4;
    const tiles = document.querySelectorAll('[data-teaserpick]').length;
    check(`teasers/${level}: shows ${want} choices`, tiles === want, `${tiles}`);
    const hintBtn = document.querySelector('[data-action="teaser-hint"]');
    if (hintBtn) {
      hintBtn.click();
      await wait(250);
      check(`teasers/${level}: the hint opens`, !!document.querySelector('.cz-teaser-hint'));
    }
    document.querySelector('[data-teaserpick]')?.click();
    await wait(500);
    check(`teasers/${level}: feedback and why appear`,
      !!document.querySelector('#gp-teaser-body .gp-flagq__say')
      && !!document.querySelector('#gp-teaser-body .cz-trivia-why'));
    /* The flip has to change something: the card's language to the other
       one, and the words of the question and the tiles with it. Checking only
       that the card says en or es passed with a button that did nothing. */
    const card = () => document.querySelector('#gp-teaser-body .cz-teaser-card');
    const words = () => [card()?.querySelector('.cz-teaser-q')?.textContent,
      ...[...document.querySelectorAll('[data-teaserpick] .gp-choice__body')].map((b) => b.textContent)].join('|');
    const langBefore = card()?.getAttribute('lang');
    const wordsBefore = words();
    document.querySelector('[data-action="teaser-lang"]')?.click();
    await wait(300);
    const flipped = card()?.getAttribute('lang');
    check(`teasers/${level}: the card flips to the other language`,
      !!langBefore && flipped === (langBefore === 'en' ? 'es' : 'en'), `${langBefore} -> ${flipped}`);
    check(`teasers/${level}: the question is in the new language`, words() !== wordsBefore);
    document.querySelector('[data-action="teaser-lang"]')?.click();
    await wait(200);
    for (let i = 0; i < 4; i += 1) {
      document.querySelector('[data-action="teaser-next"]')?.click();
      await wait(250);
      document.querySelector('[data-teaserpick]')?.click();
      await wait(250);
    }
    document.querySelector('[data-action="teaser-next"]')?.click();
    await wait(500);
    check(`teasers/${level}: a round of five reaches the results`,
      vis(document.querySelector('#gp-teaser-body .gp-flagdone')));
  }

  /* ---- Curio Trivia moved out of Fun and Games: the old links still land ---- */
  for (const [from, to] of [['#/fun/trivia', '#/trivia'], ['#/fun/trivia/learn', '#/trivia/learn']]) {
    location.hash = from;
    await wait(1500);
    check(`${from} redirects to ${to}`, location.hash === to, location.hash);
  }

  /* ---- the Chess Club ----
     It is loaded on demand, so the first visit has to wait for a fetch that
     the other rooms do not need. Everything here is a failure node cannot
     see: a board that draws nothing, a lesson that cannot be answered, a
     locked theme that opens anyway. */
  {
    location.hash = '#/chess';
    await wait(2200);
    const hub = [...document.querySelectorAll('.gp-screen')].filter(vis).map((s) => s.id);
    check('chess: the hub is visible', hub.length === 1, hub.join(',') || 'nothing visible');

    /* A brand new child sees the welcome; one who has started sees the levels.
       Either is fine, but one of them has to be there. */
    const begin = document.querySelector('[data-action="chess-begin"]');
    if (begin) { begin.click(); await wait(1200); }

    location.hash = '#/chess/1';
    await wait(1200);
    check('chess: the level page lists lessons',
      document.querySelectorAll('.cz-chess-lesson').length >= 10,
      `${document.querySelectorAll('.cz-chess-lesson').length} cards`);

    /* A written lesson: the board has to draw and the step has to be answerable.

       It has to be the FIRST lesson. Lessons unlock one at a time, and this
       runs on whatever profile the browser happens to have -- usually an empty
       one. Pointing this at the second lesson passed for weeks on a profile
       with progress in it and then failed five checks the first time it ran
       clean, which read exactly like a broken board. */
    location.hash = '#/chess/1/l1-board';
    await wait(1500);
    const board = document.querySelector('.cz-cb');
    check('chess: the lesson board is drawn', !!board && vis(board));
    check('chess: the board has pieces on it',
      document.querySelectorAll('.cz-cb__piece').length > 0,
      `${document.querySelectorAll('.cz-cb__piece').length} pieces`);
    check('chess: every square is reachable without a mouse',
      document.querySelectorAll('.cz-cb__grid [data-sq]').length === 64);
    check('chess: the grid is one tab stop, not sixty-four',
      [...document.querySelectorAll('.cz-cb__grid button')].filter((b) => b.tabIndex === 0).length === 1);
    const next = document.querySelector('[data-action="chess-next"]');
    check('chess: the lesson can be stepped through', !!next && vis(next));
    if (next) {
      next.click();
      await wait(600);
      check('chess: stepping on redraws the board', document.querySelectorAll('.cz-cb__piece').length > 0);
    }

    /* Playing: the setup card, then a real game with a bot that answers. */
    location.hash = '#/chess/play';
    await wait(1400);
    check('chess: the play setup offers five opponents',
      document.querySelectorAll('.cz-play-bot').length === 5);
    const start = document.querySelector('[data-action="chess-start"]');
    check('chess: a game can be started', !!start);
    if (start) {
      start.click();
      await wait(1200);
      check('chess: the game board is drawn', vis(document.querySelector('.cz-cb')));
      const grid = document.querySelector('.cz-cb__grid');
      if (grid) {
        grid.querySelector('[data-sq="e2"]')?.click();
        await wait(200);
        grid.querySelector('[data-sq="e4"]')?.click();
        await wait(2500);
        check('chess: the bot answers a move',
          (document.querySelector('.cz-cb__live')?.textContent || '').length > 0,
          document.querySelector('.cz-cb__live')?.textContent || 'said nothing');
      }
    }

    /* A locked puzzle theme must stay locked when its address is typed. */
    const locked = [...document.querySelectorAll('.cz-puz-theme.is-locked')];
    location.hash = '#/chess/puzzles';
    await wait(1400);
    check('chess: the puzzle themes are listed',
      document.querySelectorAll('.cz-puz-theme').length >= 10);
    const shut = document.querySelector('.cz-puz-theme.is-locked');
    if (shut) {
      const id = [...document.querySelectorAll('.cz-puz-theme')].indexOf(shut);
      location.hash = '#/chess/puzzles/skewer';
      await wait(1500);
      const started = !!document.querySelector('.cz-puz__ask');
      const explained = !!document.querySelector('.gp-callout');
      check('chess: a locked theme stays locked when typed in',
        !started || explained,
        started ? 'it started the puzzles anyway' : 'ok');
    }
  }

  /* Every page below home offers a way back, it says where it goes, and it is
     the first thing in the body rather than an arrow beside the logo. Both
     bugs this guards against were invisible to node: the link painted into the
     screen the router was leaving, so nothing appeared; and a listener left
     bound to the removed top-bar button threw during boot and the whole site
     came up blank. */
  const BACK = [
    ['#/home', null],
    ['#/gifted', '#/home'],
    ['#/tests', '#/gifted'],
    ['#/parents', '#/gifted'],
    ['#/math', '#/home'],
    ['#/math/1', '#/math'],
    ['#/math/1/four-colours', '#/math/1'],
    ['#/fun', '#/home'],
    ['#/fun/flags', '#/fun'],
    ['#/fun/elements', '#/fun'],
    ['#/fun/flags/learn', '#/fun/flags'],
    ['#/fun/discover', '#/fun'],
    ['#/trivia', '#/home'],
    ['#/teasers', '#/home'],
    ['#/trivia/learn', '#/trivia'],
    ['#/chess', '#/home'],
    ['#/chess/1', '#/chess'],
    ['#/chess/1/l1-board', '#/chess/1'],
    ['#/chess/play', '#/chess'],
    ['#/chess/puzzles', '#/chess'],
    ['#/chess/games/pawnwars', '#/chess']
  ];
  for (const [hash, want] of BACK) {
    location.hash = hash;
    await wait(1200);
    const screen = document.querySelector('.gp-screen.is-active');
    const backs = [...(screen ? screen.querySelectorAll('.gp-backlink') : [])].filter(vis);
    if (want === null) {
      check(`${hash}: home offers no way back`, backs.length === 0,
        backs.map((b) => b.textContent.trim()).join(','));
      continue;
    }
    check(`${hash}: has exactly one back control`, backs.length === 1,
      `${backs.length} found`);
    if (backs.length !== 1) continue;
    check(`${hash}: back goes to ${want}`, backs[0].getAttribute('href') === want,
      backs[0].getAttribute('href') || 'no href');
    check(`${hash}: back says where it goes`, backs[0].textContent.trim().length > 2,
      backs[0].textContent.trim());
    /* Top of the body, not the top bar: above the title and left-aligned. */
    const title = screen.querySelector('h1');
    const box = backs[0].getBoundingClientRect();
    check(`${hash}: back sits above the title`,
      !title || box.bottom <= title.getBoundingClientRect().top);
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`${results.length - failed.length}/${results.length} checks passed`);
  failed.forEach((r) => console.log(`  FAIL  ${r.name}  ${r.detail}`));
  if (errors.length) console.log(`  page errors: ${errors.join(' | ')}`);
  return { passed: results.length - failed.length, total: results.length,
    failed: failed.map((r) => r.name), errors };
})()
