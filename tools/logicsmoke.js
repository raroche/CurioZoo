/**
 * Play the seven Logic Games in a real browser, and check the things the node
 * tests cannot see: a screen that shows, a ride that stops when the child
 * leaves, a score that counts a wrong answer, a level that matches what was
 * tapped, a keyboard that keeps its place, a bridge a thumb can hit.
 *
 * Paste it into the page console (or run it from the browser pane) on
 * #/logic; do not fetch and eval it (the site's CSP refuses eval). It saves
 * the child's Logic record first and puts it back at the end, so it is safe
 * on a real device. It takes about a minute.
 *
 * Each check named "(review N)" is the exact case from the review of the
 * first build that found the bug, so the bug can never come back unseen.
 */
(async () => {
  const wait = (ms = 700) => new Promise((r) => setTimeout(r, ms));
  /* Wait until `ok()` holds, at most `ms`: a ride or a run takes as long as it takes. */
  const until = async (ok, ms = 15000) => { const t0 = Date.now(); while (!ok() && Date.now() - t0 < ms) await wait(150); return ok(); };
  const vis = (el) => !!el && el.getBoundingClientRect().width > 0 && el.getBoundingClientRect().height > 0;
  const errors = [];
  const onErr = (e) => errors.push(String(e.message));
  window.addEventListener('error', onErr);
  const results = [];
  const check = (name, ok, detail = '') => results.push({ name, ok: !!ok, detail });

  /* The app's own modules: same URLs, so the same instances the page uses. */
  const F = await import('/assets/js/rooms/logic/frame.js');
  const P = await import('/assets/js/modules/logicprogress.js');
  const TL = await import('/assets/js/modules/trainslogic.js');
  const original = F.rec();
  const realFetch = window.fetch;
  const realMatch = window.matchMedia;
  const record = (fn) => F.save(fn(P.normalise(JSON.parse(JSON.stringify(F.rec())))));
  const starsOf = (game, id) => P.starsOf(F.rec(), game, id);
  const go = async (hash, ms = 1200) => { location.hash = hash; await wait(ms); };
  const board = () => document.querySelector('#cz-logic-board');
  const after = () => (document.querySelector('#cz-logic-after') || {}).textContent || '';
  const oneScreen = () => [...document.querySelectorAll('.gp-screen')].filter(vis).map((s) => s.id);
  const fresh = (levels = {}) => record(() => ({ ...P.normalise({}), level: levels }));
  /* Open every chapter before `upto` in a game by giving it 20 solves. */
  const unlock = (game, chapters) => record((r) => {
    for (const ch of chapters) for (let i = 1; i <= 20; i++) r.stars[`${game}:${ch}-${String(i).padStart(2, '0')}`] = 1;
    return r;
  });

  const GAMES = ['code', 'truth', 'rule', 'bridges', 'trains', 'robot', 'bug'];

  try {
    /* -------------------------------------------------------------- */
    /* Every game: home, first puzzle, language, today's puzzle        */
    /* -------------------------------------------------------------- */
    fresh();
    for (const g of GAMES) {
      await go(`#/logic/${g}`);
      check(`${g}: home is the one screen showing`, oneScreen().join() === 'screen-logicgame', oneScreen().join());
      const first = document.querySelector('.cz-logic-ch[href]');
      check(`${g}: chapter 1 is open`, !!first);
      await go(`${first.getAttribute('href')}/1`);
      check(`${g}: puzzle 1 draws a board`, oneScreen().join() === 'screen-logicplay' && board().innerHTML.length > 200);
      const before = board().innerHTML.length;
      document.querySelector('[data-action="logic-lang"]').click();
      await wait(300);
      check(`${g}: Spanish keeps the board`, board().innerHTML.length > 200 && document.getElementById('screen-logicplay').lang === 'es', `${before}`);
      document.querySelector('[data-action="logic-lang"]').click();
      await wait(200);
      for (const level of ['easy', 'medium', 'hard']) {
        record((r) => P.setLevel(r, g, level));
        await go(`#/logic/${g}/daily`, 1500);
        check(`${g}: today's ${level} puzzle draws`, oneScreen().join() === 'screen-logicplay' && board().innerHTML.length > 200);
      }
    }

    /* (review 1) Seeds whose maker gives nothing still give a puzzle. */
    for (const [g, n] of [['truth', 8], ['bridges', 7], ['trains', 5]]) {
      fresh({ [g]: 'hard' });
      await go(`#/logic/${g}/endless/${n}`, 1500);
      check(`(review 1) ${g} hard endless ${n} draws a puzzle`, location.hash === `#/logic/${g}/endless/${n}` && board().innerHTML.length > 200, location.hash);
    }

    /* -------------------------------------------------------------- */
    /* (review 2) Leaving during a run or a ride                      */
    /* -------------------------------------------------------------- */
    fresh();
    await go('#/logic/robot/e1/1');
    for (let i = 0; i < 12; i++) { board().querySelector('[data-action="rb-hint"]')?.click(); await wait(40); }
    board().querySelector('[data-action="rb-run"]').click();
    await wait(120);
    const errs0 = errors.length;
    await go('#/logic', 5000);
    check('(review 2) Robot Path: leaving mid-run throws nothing', errors.length === errs0, errors.slice(errs0).join(' | '));
    check('(review 2) Robot Path: leaving mid-run awards nothing', starsOf('robot', 'e1-01') === 0);

    const trains = await realFetch('data/logic/trains/easy.json').then((r) => r.json());
    const answer = (n) => {
      const p = trains.chapters[0].puzzles[n - 1];
      return TL.runAll(p.lay, [p.trains[0].from], p.start)[0].to;
    };
    await go('#/logic/trains/e1/1');
    board().querySelector(`[data-tr-house="${answer(1)}"]`).click();
    await wait(150);
    await go('#/logic/trains/e1/2', 5000);
    check('(review 2) Train Tracks: a ride left behind finishes nothing', errors.length === errs0 && starsOf('trains', 'e1-01') === 0 && !after().trim());

    /* -------------------------------------------------------------- */
    /* (review 3, 4) Prediction: no answer shown, every answer counted */
    /* -------------------------------------------------------------- */
    fresh();
    await go('#/logic/trains/e1/1');
    const depot = [...board().querySelectorAll('.cz-tr-emoji')].map((e) => e.textContent);
    check('(review 3) a "where will it stop?" train carries no animal', depot.includes('🚂'), depot.join(' '));
    const lanes = trains.chapters[0].puzzles[0].lay.lanes;
    board().querySelector(`[data-tr-house="${(answer(1) + 1) % lanes}"]`).click();
    await wait(300);
    board().querySelector(`[data-tr-house="${answer(1)}"]`).click();
    await until(() => after().trim());
    check('(review 4) Train Tracks: wrong then right is 1 star', starsOf('trains', 'e1-01') === 1, String(starsOf('trains', 'e1-01')));
    await go('#/logic/trains/e1/2');
    board().querySelector(`[data-tr-house="${answer(2)}"]`).click();
    await until(() => after().trim());
    check('Train Tracks: right first time is 3 stars', starsOf('trains', 'e1-02') === 3, String(starsOf('trains', 'e1-02')));

    const bugs = await realFetch('data/logic/bug/easy.json').then((r) => r.json());
    unlock('bug', ['e1', 'e2', 'e3']);
    record((r) => P.setStars(r, 'bug', 'e4-01', 1));   // so e4-04 is open
    const bp = bugs.chapters[3].puzzles[3];
    const right = bp.choices.findIndex(([x, y]) => x === bp.answer[0] && y === bp.answer[1]);
    await go('#/logic/bug/e4/4');
    const marks = [...board().querySelectorAll('[data-rb-mark]')];
    check('(review 9) prediction squares say where they are', marks.length >= 3 && marks.every((m) => /column \d+, row \d+/.test(m.getAttribute('aria-label'))));
    board().querySelector(`[data-rb-mark="${(right + 1) % bp.choices.length}"]`).dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await until(() => board().querySelector('.cz-code-say.is-wrong'));
    board().querySelector(`[data-rb-mark="${right}"]`)?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await until(() => after().trim());
    check('(review 4) Fix the Bug e4-04: wrong then right is 1 star', starsOf('bug', 'e4-04') === 1, String(starsOf('bug', 'e4-04')));

    /* -------------------------------------------------------------- */
    /* (review 7) Two quick level taps                                 */
    /* -------------------------------------------------------------- */
    fresh();
    window.fetch = (u, o) => (String(u).includes('rule/medium') ? wait(2000).then(() => realFetch(u, o)) : realFetch(u, o));
    await go('#/logic/rule');
    document.querySelector('[data-logic-level="medium"]').click();
    await wait(50);
    document.querySelector('[data-logic-level="hard"]').click();
    await wait(600);
    check('a superseded load never covers the page with the loader', document.querySelector('.gp-screen.is-active').id === 'screen-logicgame');
    await wait(2900);
    window.fetch = realFetch;
    const shown = document.querySelector('[data-logic-level][aria-checked="true"]')?.dataset.logicLevel;
    const firstCh = document.querySelector('.cz-logic-ch')?.getAttribute('href') || '';
    check('(review 7) the level shown is the last one tapped', shown === 'hard' && P.levelOf(F.rec(), 'rule') === 'hard' && firstCh.endsWith('/h1'), `${shown} ${firstCh}`);

    /* A slow bank shows the room's creature thinking, then the page. */
    fresh();
    window.fetch = (u, o) => (String(u).includes('truth/hard') ? wait(1500).then(() => realFetch(u, o)) : realFetch(u, o));
    record((r) => P.setLevel(r, 'truth', 'hard'));
    location.hash = '#/logic/truth';
    await wait(600);
    check('a slow load shows the loading screen', document.querySelector('.gp-screen.is-active').id === 'screen-loading'
      && !!document.querySelector('#cz-loading-pic svg'));
    await wait(1500);
    window.fetch = realFetch;
    check('then the page itself', document.querySelector('.gp-screen.is-active').id === 'screen-logicgame');

    /* -------------------------------------------------------------- */
    /* (review 8) The robot editor and the keyboard                    */
    /* -------------------------------------------------------------- */
    fresh({ robot: 'hard' });
    unlock('robot', ['h1']);
    await go('#/logic/robot/h2/1');
    const pal = board().querySelector('[data-rb-pal="if"]');
    pal.focus();
    pal.click();
    await wait(200);
    check('(review 8) adding a tile keeps the focus on it', document.activeElement && document.activeElement.dataset.rbPal === 'if');
    const elseBtn = board().querySelector('[data-rb-into$=".else"]');
    check('(review 8) Else is a button the keyboard can reach', elseBtn && elseBtn.tagName === 'BUTTON');
    elseBtn.focus();
    elseBtn.click();
    await wait(100);
    board().querySelector('[data-rb-pal="TL"]').click();
    await wait(100);
    check('(review 8) a tile goes into Else', !!board().querySelector('[data-rb-tile="main.0.else.0"]'));
    const words = [...board().querySelectorAll('.cz-br-wrap li')].map((l) => l.textContent);
    check('(review 9) the board is described in words', words.some((w) => /robot is in column \d+, row \d+, facing/.test(w)), words[1]);

    /* -------------------------------------------------------------- */
    /* (review 10, 11) Zoo Bridges on a phone-sized board              */
    /* -------------------------------------------------------------- */
    fresh({ bridges: 'hard' });
    await go('#/logic/bridges/daily', 1500);
    const zoom = document.querySelector('[data-action="br-zoom"]');
    if (zoom) { zoom.click(); await wait(200); }
    const svg = document.querySelector('.cz-br-svg');
    const cellPx = svg.getBoundingClientRect().width / svg.viewBox.baseVal.width * 60;
    check('(review 10) "Bigger board" makes a cell at least 44 px', !zoom || cellPx >= 44, cellPx.toFixed(0));
    const r0 = svg.querySelector('[data-br-edge="0"]');
    r0.scrollIntoView({ block: 'center', inline: 'center' });
    await wait(100);
    const b = r0.getBoundingClientRect();
    const horiz = b.width > b.height;
    const x = b.left + b.width / 2 + (horiz ? 0 : 0.4 * cellPx);
    const y = b.top + b.height / 2 + (horiz ? 0.4 * cellPx : 0);
    document.elementFromPoint(x, y).dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: x, clientY: y }));
    await wait(200);
    check('(review 10) a tap 40% of a cell off a route still builds it', /: 1 bridge$/.test(svg.ownerDocument.querySelector('[data-br-edge="0"]').getAttribute('aria-label')));
    const labels = [...document.querySelectorAll('[data-br-edge]')].map((e) => e.getAttribute('aria-label'));
    const names = [...document.querySelectorAll('.cz-br-island')].map((e) => e.getAttribute('aria-label').split(':')[0]);
    check('(review 11) every island has a name of its own', new Set(names).size === names.length && labels.every((l) => /\([A-Z]\d+\)/.test(l)), `${names.length} islands`);
    if (zoom) document.querySelector('[data-action="br-zoom"]').click();

    /* A parent's board: every island ticked, but two separate groups.
       Check must say so, not only "2 bridges do not belong". */
    fresh({ bridges: 'hard' });
    await go('#/logic/bridges/h1/3', 1500);
    const routeId = (a, z) => [...document.querySelectorAll('[data-br-edge]')]
      .find((e) => e.getAttribute('aria-label').includes(`(${a})`) && e.getAttribute('aria-label').includes(`(${z})`))?.dataset.brEdge;
    for (const [a, z, n] of [['B1', 'G1', 2], ['B1', 'B9', 2], ['G1', 'G4', 2], ['J1', 'J4', 1], ['D2', 'D4', 2], ['D4', 'G4', 2],
      ['D4', 'D7', 2], ['G4', 'G9', 1], ['J4', 'J10', 2], ['A5', 'A10', 2], ['I5', 'I9', 2], ['D7', 'F7', 2], ['B9', 'G9', 1],
      ['G9', 'I9', 2], ['A10', 'D10', 1], ['D10', 'J10', 2]]) {
      for (let i = 0; i < n; i++) {
        document.querySelector(`[data-br-edge="${routeId(a, z)}"]`).dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await wait(20);
      }
    }
    document.querySelector('[data-action="br-check"]').click();
    await wait(100);
    check('Zoo Bridges: Check names separate groups when every island is ticked',
      /split into 2 parts/.test(document.querySelector('.cz-code-say')?.textContent || '')
      && document.querySelectorAll('.cz-br-island.is-apart').length === 6);
    /* D7-D10 would cross the bridge on row 9, so the tap is refused; the
       rings must still go with Check's message. */
    document.querySelector(`[data-br-edge="${routeId('D7', 'D10')}"]`).dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await wait(100);
    check('Zoo Bridges: a refused tap still clears the cut-off rings',
      !document.querySelector('.cz-br-island.is-apart') && /cross/i.test(document.querySelector('.cz-code-say')?.textContent || ''));

    /* -------------------------------------------------------------- */
    /* Reduced motion: no ride, the result at once                     */
    /* -------------------------------------------------------------- */
    fresh();
    window.matchMedia = (q) => (q.includes('prefers-reduced-motion') ? { matches: true, media: q, addEventListener() {}, removeEventListener() {} } : realMatch.call(window, q));
    await go('#/logic/trains/e1/3');
    board().querySelector(`[data-tr-house="${answer(3)}"]`).click();
    await wait(400);
    check('reduced motion: the result shows at once, with no ride', /3 of 3/.test(after()), after().slice(0, 40));
    window.matchMedia = realMatch;
  } catch (err) {
    check('the script itself ran to the end', false, String(err && err.stack || err));
  } finally {
    window.fetch = realFetch;
    window.matchMedia = realMatch;
    F.save(original);
    location.hash = '#/logic';
    window.removeEventListener('error', onErr);
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`${results.length - failed.length}/${results.length} checks passed`);
  failed.forEach((r) => console.log(`  FAIL  ${r.name}  ${r.detail}`));
  if (errors.length) console.log(`  page errors: ${errors.join(' | ')}`);
  return { passed: results.length - failed.length, total: results.length, failed: failed.map((r) => `${r.name} ${r.detail}`), errors };
})()
