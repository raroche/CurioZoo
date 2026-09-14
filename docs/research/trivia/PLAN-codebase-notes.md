# Adding a game to the Fun and Games room: codebase facts

Verified against the code on 2026-09-14 (HEAD a58dc95). Line numbers are exact
for that commit. Repo root: `/Users/rolandaroche/Documents/repos/GiftedPrep`.
Nothing named "trivia" exists anywhere in the repo yet (grep of assets, data,
docs, tools, index.html, README.md returns nothing).

## 0. Hard constraints (repeated from the chess notes, still true)

- No build step, no npm deps, plain ES modules under `assets/js/`. Node >= 20
  for the tools (local is v24.18.1); Netlify runs `npm run verify` as its
  build command (`netlify.toml` line 11) so a failing checker blocks deploy.
- CSP `default-src 'self'; img-src 'self' data:; style-src 'self'; script-src
  'self'; connect-src 'self'; font-src 'self'; base-uri 'self'; form-action
  'none'` is sent three ways and held identical by `tools/cspcheck.mjs`:
  `netlify.toml` (with `frame-ancestors 'self'` added), `tools/serve.py` line
  21, and a `<meta http-equiv>` in `index.html` line 16. Consequence: a
  `style="..."` attribute in generated markup is silently dropped. Use
  `data-style="..."` + `paint()` (section 6).
- No CDN, no inline `<script>`, no `eval`/`new Function`.
- Import layering (`tools/archcheck.mjs` lines 13-17): `modules/` may import
  `modules/`; `screens/` may import `modules/` and `screens/`; `app.js`
  imports both; nothing imports `app.js`. Cycles fail the build. Files over
  700 lines get a warning (line 98) -- `screens/fun.js` is already 879 lines
  and already warns, so a new game should get its own screen file or module
  rather than growing fun.js further.
- Escaping: `escapeHtml` from `assets/js/modules/charts.js` lines 66-70 in
  screens; modules each define a local `esc` (e.g. `capitals.js` lines 11-13).

## 1. The Fun hub and how a game route is dispatched

### The game list and card markup -- `assets/js/screens/fun.js`

`FUN_GAMES` (lines 81-97) is a plain array; one entry per game:

```js
const FUN_GAMES = [
  { id: 'flags', art: 'flag', hue: 'mango', name: 'Name the Flag',
    sub: 'Every flag in the world, and a locked vault of flags that no longer exist.',
    meta: '250 flags · a hidden vault' },
  { id: 'shapes', art: 'outline', hue: 'lagoon', name: 'Name the Country Shape', ... },
  { id: 'capitals', art: 'capital', hue: 'honey', name: 'Name the Capital', ... },
  { id: 'elements', art: 'flask', hue: 'jade', name: 'Name the Element', ... },
  { id: 'angles', art: 'angle', hue: 'sky', name: 'Guess the Angle', ... }
];
```

- `id` becomes the href `#/fun/${g.id}` and the second route segment.
- `art` is a key into `ART` (lines 29-75): a function `(t, p) => svgInnerHtml`
  drawn on a 64x64 grid, where `t` is the tone colour and `p` the soft colour.
  `gameArt(kind)` (lines 77-79) wraps it as
  `<svg class="cz-gameart" viewBox="0 0 64 64" aria-hidden="true" focusable="false">`
  and passes `'var(--room, var(--gp-accent))'` and
  `'var(--room-soft, var(--gp-accent-soft))'`, so the art re-themes with the
  tile's hue class. The comment at lines 25-28 says why these are drawn, not
  emoji: an emoji renders differently on every platform.
- `hue` must be one of the eight palette hues with a `.cz-tile--<hue>` class
  (section 6). Hues currently used by game tiles: mango, lagoon, honey, jade,
  sky. Unused by any game tile: leaf (Chess room), orchid (Gifted room),
  flamingo (the Fun room itself). There is no checker enforcing uniqueness
  among game tiles (roomcheck only checks `ROOMS`), but two games with one
  colour would look alike.

`renderFunHub()` (lines 99-113) writes the grid into `#gp-fun-grid`:

```js
$('#gp-fun-grid').innerHTML = `<div class="cz-tiles">${FUN_GAMES.map((g) => `
  <a class="cz-tile cz-tile--${g.hue}" href="#/fun/${g.id}">
    <span class="cz-tile__pic">${gameArt(g.art)}</span>
    <span class="cz-tile__text">
      <span class="cz-tile__name">${escapeHtml(g.name)}</span>
      <span class="cz-tile__blurb">${escapeHtml(g.sub)}</span>
      <span class="cz-tile__meta">${escapeHtml(g.meta)}</span>
    </span>
    <span class="cz-tile__go" aria-hidden="true">&rarr;</span>
  </a>`).join('')}</div>`;
showScreen('fun');
```

This is the same tile markup the home page uses for rooms
(`modules/sections.js` `roomCard()` lines 231-244), deliberately: "A game is a
room one level down".

### Dispatch -- `renderFun(game, step)` (fun.js lines 115-137)

```js
export async function renderFun(game, step) {
  if (!game) { renderFunHub(); return; }
  if (step === 'learn') {
    if (game === 'elements') { await renderElemLearn(); return; }
    if (game === 'angles') { renderAngleLearn(); return; }
    await renderLearn(game);          // shared browser: flags, shapes, capitals
    return;
  }
  if (game === 'shapes') { await renderShapes(step); return; }
  if (game === 'capitals') { await renderCapitals(step); return; }
  if (game === 'elements') { await renderElements(step); return; }
  if (game === 'angles') { renderAngles(step); return; }
  if (game !== 'flags') { renderFunHub(); return; }   // unknown game -> hub
  ... flags ...
}
```

Route shape: `#/fun` (hub), `#/fun/<game>` (setup), `#/fun/<game>/play`
(question screen, only if a round exists), `#/fun/<game>/learn` (browse).
`tools/linkcheck.mjs` line 137 only allows `play` and `learn` as the third
segment.

### The router -- `assets/js/app.js` `route()` (lines 91-149)

```js
function route() {
  const hash = location.hash || '#/home';
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  const head = parts[0] || 'home';
  switch (head) {
    ...
    case 'fun':
      renderFun(parts[1], parts[2]);      // line 127-129
      break;
    ...
    default:
      location.hash = '#/home';
  }
}
```

`route` is bound to `hashchange` at line 633 and called once at the end of
`boot()` after the manifest loads. A game under `#/fun/...` therefore needs no
router change at all; only `renderFun` changes. The import of fun.js handlers
into app.js is one long line (line 27).

### Screen registry -- `assets/js/modules/shell.js`

`SCREENS` (lines 107-112):

```js
const SCREENS = ['home', 'gifted', 'tests', 'categories', 'quiz', 'results', 'parents',
  'math', 'mathtopic', 'fun', 'flagsetup', 'flaggame', 'shapesetup', 'shapegame',
  'capsetup', 'capgame', 'elemsetup', 'elemgame', 'angsetup', 'anggame',
  'learn', 'elemlearn', 'anglearn',
  'chess', 'chesslevel', 'chesslesson', 'chessplay', 'chesspuzzle', 'chessopenings',
  'chesstournament', 'error'];
```

`showScreen(name)` (lines 143-165): throws if `name` is not in SCREENS
(lines 144-147, the comment at 114-122 explains the blank-page bug that
motivated it); toggles `.is-active` on every `#screen-<s>`; calls
`paintBack()`; hides the quiz score/streak chips unless `name === 'quiz'`;
scrolls to top; focuses the screen's `<h1>` with `tabindex=-1`. `archcheck`
cross-checks SCREENS against `id="screen-..."` in index.html and against every
`showScreen('...')` literal in the JS (lines 121-145), so all three must agree.

`showError(message)` (lines 167-170) fills `#gp-error-message` and shows the
`error` screen. Every game's loader uses it on fetch failure.

### Screen sections -- `index.html`

Pattern for a game (capitals, lines 536-580):

```html
<section class="gp-screen" id="screen-capsetup" aria-labelledby="capsetup-title">
  <div class="gp-container">
    <a class="gp-btn gp-btn--ghost gp-backlink" href="#/fun">&larr; Back to games</a>
    <h1 class="gp-page-title" id="capsetup-title">Name the Capital</h1>
    <p class="gp-page-lede">...</p>
    <section class="cz-mode cz-mode--learn">
      <p class="cz-mode__tag">Learn</p>
      <div class="cz-mode__body">
        <span class="cz-mode__icon" data-icon="book" aria-hidden="true"></span>
        <div>
          <h2 class="cz-mode__title">See them first</h2>
          <p class="cz-mode__blurb">Look through all 192 countries, ...</p>
        </div>
      </div>
      <a class="gp-btn gp-btn--primary gp-btn--big cz-mode__go" href="#/fun/capitals/learn">
        Look through the capitals &rarr;
      </a>
    </section>
    <section class="cz-mode cz-mode--practice">
      <p class="cz-mode__tag">Practice</p>
      <div class="gp-card gp-card--setup" id="gp-cap-setup"></div>
    </section>
  </div>
</section>

<section class="gp-screen" id="screen-capgame" aria-labelledby="capgame-title">
  <div class="gp-container">
    <div class="gp-flagbar">
      <a class="gp-btn gp-btn--ghost gp-backlink" href="#/fun/capitals">&larr; Change the round</a>
      <p class="gp-flagbar__score">
        <span class="gp-tally gp-tally--right"><span aria-hidden="true">&#10003;</span>
          <strong data-cap-right>0</strong><span class="gp-sr-only">right</span></span>
        <span class="gp-tally gp-tally--wrong"><span aria-hidden="true">&#10007;</span>
          <strong data-cap-wrong>0</strong><span class="gp-sr-only">wrong</span></span>
      </p>
    </div>
    <h1 class="gp-sr-only" id="capgame-title">Name the capital city</h1>
    <div id="gp-cap-body" aria-live="polite"></div>
  </div>
</section>
```

Notes on this markup:
- Game screens under `#/fun/<x>` carry their OWN hard-coded `.gp-backlink`
  (no `<div class="gp-backslot">`), because `routes.js` `backTarget()` line
  25 returns `null` for `head === 'fun' && parts.length > 1` ("The games label
  their own way out"). The hub `#screen-fun` (lines 353-360) does use a
  `gp-backslot` and gets "Home" painted into it.
- `tools/smoke.js` lines 203-244 asserts every non-home page has EXACTLY ONE
  visible `.gp-backlink`, with text longer than 2 chars, positioned above the
  `<h1>`. `#/fun/flags/learn` must go back to `#/fun/flags`. The shared learn
  screen `#screen-learn` (lines 419-421) is an empty `<div class="gp-container"
  id="gp-learn-body">` filled by `renderBrowser()`, which includes its own
  backlink.
- `data-icon="book"` spans are filled once at boot by `hydrateIcons()`
  (shell.js lines 95-101). Static HTML only; generated markup should call
  `icon()` directly or call `hydrateIcons(root)` after insertion.
- The h1 on the game screen is `gp-sr-only` because the flagbar is the visible
  header; `showScreen` still focuses it.
- The angle screens add a hue class on the section: `<section class="gp-screen
  cz-room--sky" id="screen-angsetup">` (lines 479, 511, 527). The
  capital/element/flag/shape screens do NOT set a room class, so they render in
  the brand accent (orange). See section 6.
- Fun screens in index.html, by line: fun 353-360, flagsetup 365-392,
  flaggame 397-411, learn 419-421, elemlearn 423-425, elemsetup 430-458,
  elemgame 460-474, angsetup 479-509, anggame 511-525, anglearn 527-531,
  capsetup 536-564, capgame 566-580, shapesetup 582-609, shapegame 611-625.

### `state.fun` -- there is no such key

State lives in `shell.js` `state` (lines 20-72), one key per game, not under a
`fun` namespace:

```js
capitals: {
  data: null,
  setup: { count: 10, mode: 'random', continents: [], pick: 'choice' },
  round: null
},
elements: {
  data: null,
  setup: { set: 'everyday', ask: 'use', count: 10 },
  round: null
},
angles: { setup: { ask: 'mix', set: 'steps', count: 10 }, round: null,
          demo: { deg: 45, swap: false, hour: 4 } },
flags:  { data: null, setup: { count: 10, mode: 'random', continents: [], scope: 'countries' }, round: null },
shapes: { data: null, setup: { count: 10, mode: 'random', continents: [], pick: 'choice' }, round: null },
learn:  { game: null, order: 'alpha', index: 0, list: null },   // shared browser
```

`data` is the fetched JSON (also cached at module level inside each module's
`load*()`), `setup` is what the child picked (never persisted; lost on
reload), `round` is the live run or null. Note the misplaced comments: line 29
says "Math Lab:" above `flags`, line 45 says "The capital game" above `angles`.

## 2. Lifecycle of one game end-to-end: Name the Capital

Files: `assets/js/modules/capitals.js` (data, matching, round building,
render templates; DOM-free apart from returning HTML strings) and
`assets/js/screens/fun.js` lines 457-616 (state, DOM, handlers).

### Data -- `data/fun/capitals.json`

```json
{
 "note": "...",
 "attribution": { "capitals": "...Wikidata...CC0...", "countries": "" },
 "continents": [ { "id": "africa", "name": "Africa" }, { "id": "americas", "name": "The Americas" },
                 { "id": "asia", ... }, { "id": "europe", ... }, { "id": "oceania", ... }, { "id": "antarctic", ... } ],
 "countries": [
  { "code": "af", "country": "Afghanistan",
    "countryNames": ["Afghanistan", "Islamic Republic of Afghanistan", "Afganistán", "República Islámica de Afganistán", "AF"],
    "continent": "asia", "capital": "Kabul", "names": ["Kabul"] },
  ...
 ]
}
```

`names` is every accepted typed spelling (English and Spanish mixed in one
list; e.g. Vienna/Viena). `capital` is the displayed one and must be in
`names` (capitalcheck line 35). `tools/capitalcheck.mjs` line 94 requires
`attribution.capitals`. Elements (`data/fun/elements.json`) have the same
outer shape: `note`, `attribution` (`names`, `uses`), `families`, `elements:
[{ z, symbol, name, es, row, col, family, phase, use?, art? }]` -- one
Spanish name per item in `es`.

Loading: `loadCapitals()` (capitals.js lines 17-23):

```js
let cache = null;
export async function loadCapitals() {
  if (cache) return cache;
  const res = await fetch('data/fun/capitals.json', { cache: 'no-cache' });
  if (!res.ok) throw new Error('Could not load the capitals');
  cache = await res.json();
  return cache;
}
```

### Entry -- `renderCapitals(step)` (fun.js 461-471)

```js
export async function renderCapitals(step) {
  try {
    if (!state.capitals.data) state.capitals.data = await capitals.loadCapitals();
  } catch (err) { console.error(err); showError('The capitals could not be loaded.'); return; }
  if (step === 'play' && state.capitals.round) { drawCapQuestion(); return; }
  drawCapSetup();
}
```

So `#/fun/capitals/play` typed in cold (no round) falls back to setup.

### Setup screen -- `drawCapSetup()` (473-477) + `capitals.renderSetup()` (109-165)

```js
export function drawCapSetup() {
  $('#gp-cap-setup').innerHTML = capitals.renderSetup(state.capitals.data, state.capitals.setup);
  paint();
  showScreen('capsetup');
}
```

Option constants (capitals.js 66-75):

```js
export const COUNTS = [10, 25, 50, 'all'];
export const PICKS = [
  { id: 'choice', name: 'Four choices', blurb: 'Pick the right capital from four.' },
  { id: 'type', name: 'Type the name', blurb: 'Harder. A small spelling slip still counts.' }
];
export const MODES = [
  { id: 'random', name: 'Mixed up', blurb: '...' },
  { id: 'continent', name: 'By continent', blurb: '...' },
  { id: 'alpha', name: 'A to Z', blurb: '...' }
];
```

`renderSetup` markup, three widget kinds:

```js
// count: a radio group of pills (arrow keys come free via radioGroupKeys)
<div class="gp-row gp-row--wrap" id="gp-cap-counts" role="radiogroup" aria-label="How many countries">
  <button type="button" class="gp-pill is-selected" role="radio" aria-checked="true" tabindex="0" data-capcount="10">10</button> ...
</div>
// mode / pick: cards
<div class="gp-grid gp-grid--modes">
  <button type="button" class="gp-card gp-card--mode is-selected" data-cappick="choice" aria-pressed="true">
    <span class="gp-card__title">Four choices</span>
    <span class="gp-card__sub">Pick the right capital from four.</span>
  </button> ...
</div>
// continent toggles (only when mode === 'continent'): pills with aria-pressed, data-capcont="<id>"
// footer
<p class="gp-muted gp-grade-note" id="gp-cap-note">That is <strong>10</strong> capitals to name.</p>
<button type="button" class="gp-btn gp-btn--primary gp-btn--big" data-action="cap-start" [disabled]>Start &rarr;</button>
```

Each is wrapped in `<fieldset class="gp-fieldset"><legend class="gp-fieldset__legend">...`.
Every option click re-renders the whole setup card (app.js 252-274), e.g.:

```js
const cc = ev.target.closest('[data-capcount]');
if (cc) { state.capitals.setup.count = cc.dataset.capcount; drawCapSetup(); return; }
```

`count` is stored as a STRING ('10' or 'all'); `buildRound` does
`Number(count)`.

### Starting a round -- `startCapRound()` (479-487)

```js
export function startCapRound() {
  const list = capitals.buildRound(state.capitals.data, state.capitals.setup);
  if (!list.length) return;
  state.capitals.round = {
    list, index: 0, right: 0, wrong: 0, answered: false, choices: null, slots: []
  };
  location.hash = '#/fun/capitals/play';
  drawCapQuestion();
}
```

Round state shape: `list` (the items), `index`, `right`, `wrong`, `answered`
(guards double answers), `choices` (cached per question so a hash re-route
does not reshuffle), `slots` (recent answer positions for
`modules/slots.js`). Setting `location.hash` fires `hashchange` -> `route()`
-> `renderCapitals('play')` -> `drawCapQuestion()` again; the explicit call is
there so the draw is synchronous, and the `choices` cache means the second
draw is identical. `buildRound()` (capitals.js 77-87): filters by continent,
alpha-sorts or shuffles, slices to `want`. `shuffle` is Fisher-Yates with an
injectable `random` (lines 57-64) -- every module has its own copy.

### Question rendering -- `drawCapQuestion()` (495-519)

```js
export function drawCapQuestion() {
  const r = state.capitals.round;
  if (!r) { drawCapSetup(); return; }
  if (r.index >= r.list.length) { drawCapResults(); return; }
  const country = r.list[r.index];
  const pick = state.capitals.setup.pick;
  if (!r.choices) {
    r.choices = spreadAnswer(capitals.makeChoices(country, state.capitals.data),
      (x) => x.code === country.code, r.slots);
    noteSlot(r.slots, r.choices.findIndex((x) => x.code === country.code));
  }
  r.answered = false;
  $('#gp-cap-body').innerHTML = capitals.renderQuestion(country, r.choices, r.index, r.list.length, pick);
  capScore();
  paint();
  showScreen('capgame');
  if (pick === 'type') { const box = $('#gp-cap-body [data-captyped]'); if (box) box.focus(); }
}
```

`makeChoices()` (capitals.js 90-103): 3 same-continent distractors, topped up
from elsewhere, plus the answer, shuffled. `spreadAnswer(choices, isAnswer,
recent, maxRun=2)` and `noteSlot(recent, slot, keep=4)` (`modules/slots.js`
31-53) stop the right answer landing in the same slot three times running.

`capScore()` (489-493) writes `r.right`/`r.wrong` into `[data-cap-right]` /
`[data-cap-wrong]` in the static flagbar.

`renderQuestion(country, choices, index, total, pick)` (capitals.js 167-192):

```js
const answerArea = pick === 'type'
  ? `<div class="gp-numrow gp-typerow">
       <label class="gp-numrow__label" for="gp-cap-typed">Capital</label>
       <input class="gp-numrow__input" id="gp-cap-typed" type="text" autocomplete="off"
              autocapitalize="words" spellcheck="false" data-captyped placeholder="English or Spanish">
       <button type="button" class="gp-btn gp-btn--primary" data-capcheck>Check</button>
     </div>
     <p class="gp-muted gp-typehint">A small spelling slip still counts.</p>`
  : `<div class="gp-flagq__choices">
       ${choices.map((c) => `
         <button type="button" class="gp-choice gp-choice--flag" data-capanswer="${c.code}">
           <span class="gp-choice__body">${esc(c.capital)}</span>
           <span class="gp-choice__mark" aria-hidden="true"></span>
         </button>`).join('')}
     </div>`;
return `
  <div class="gp-flagq">
    <p class="gp-ex__count">Country ${index + 1} of ${total}</p>
    <p class="cz-capital-country">${esc(country.country)}</p>
    <p class="gp-flagq__ask">What is the capital city?</p>
    ${answerArea}
  </div>`;
```

There is no progress bar in the fun games; progress is the "Country N of M"
line plus the right/wrong tallies. (The `.gp-progress` bar exists only on the
gifted quiz screen -- section 6.)

### Answer input

Multiple choice: app.js 276-277
`const ca = ev.target.closest('[data-capanswer]'); if (ca) { answerCapChoice(ca.dataset.capanswer); return; }`
-> `answerCapChoice(code)` (fun.js 571-578):

```js
export function answerCapChoice(code) {
  const r = state.capitals.round;
  if (!r || r.answered) return;
  const country = r.list[r.index];
  if (code === country.code) { settleCap({ verdict: 'right' }); return; }
  const picked = state.capitals.data.countries.find((c) => c.code === code);
  settleCap({ verdict: 'other', other: picked, pickedCode: code });
}
```

Typed: the Check button (app.js 279) and Enter in the box (app.js 650-658,
inside `boot()`):

```js
document.addEventListener('keydown', (ev) => {
  if (ev.key !== 'Enter') return;
  if (ev.target.matches('[data-shapetyped]')) { ev.preventDefault(); answerShapeTyped(); return; }
  if (ev.target.matches('[data-captyped]')) { ev.preventDefault(); answerCapTyped(); return; }
  ...
});
```

-> `answerCapTyped()` (580-587) reads `[data-captyped]`, trims, refocuses if
empty, else `settleCap(capitals.judge(said, r.list[r.index], state.capitals.data))`.

`capitals.judge()` (41-51) delegates to `judgeTyped` in `modules/fuzzy.js`
(section 3) with `normalise: normaliseCapital`, `target: { id: country.code,
names: country.names || [country.capital] }`, `all: data.countries.map(...)`.
It returns `{ verdict: 'right' | 'close' | 'other' | 'wrong', shown?, other? }`.

### Feedback -- `settleCap(verdict)` (525-569)

```js
function settleCap(verdict) {
  const r = state.capitals.round;
  const country = r.list[r.index];
  if (r.answered) return;
  r.answered = true;
  const right = verdict.verdict === 'right' || verdict.verdict === 'close';
  if (right) r.right += 1; else r.wrong += 1;
  react(right ? 'happy' : 'oops', right ? 2300 : 1800);       // mascot
  capScore();

  $$('#gp-cap-body [data-capanswer]').forEach((b) => {
    b.disabled = true;
    if (b.dataset.capanswer === country.code) b.classList.add('is-correct');
    else if (b.dataset.capanswer === verdict.pickedCode) b.classList.add('is-incorrect');
  });
  $$('#gp-cap-body .gp-choice.is-correct .gp-choice__mark').forEach((m) => { m.innerHTML = icon('check', { size: 20 }); });
  $$('#gp-cap-body .gp-choice.is-incorrect .gp-choice__mark').forEach((m) => { m.innerHTML = icon('cross', { size: 20 }); });
  const typed = $('#gp-cap-body [data-captyped]'); if (typed) typed.disabled = true;
  const checkBtn = $('#gp-cap-body [data-capcheck]'); if (checkBtn) checkBtn.disabled = true;

  const say = document.createElement('p');
  say.className = `gp-flagq__say ${right ? 'is-right' : 'is-wrong'}` + (verdict.verdict === 'close' ? ' is-nearly' : '');
  say.textContent = verdict.verdict === 'close'
    ? `Right city, small slip. It is spelled ${verdict.shown}.`
    : verdict.verdict === 'right'
      ? `Yes. ${country.capital} is the capital of ${country.country}.`
      : verdict.verdict === 'other'
        ? `${verdict.other.capital} is the capital of ${verdict.other.country}. ${country.country}'s is ${country.capital}.`
        : `No. The capital of ${country.country} is ${country.capital}.`;
  $('#gp-cap-body .gp-flagq').appendChild(say);

  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'gp-btn gp-btn--primary gp-btn--big';
  next.dataset.action = 'cap-next';
  next.textContent = r.index + 1 >= r.list.length ? 'See how you did →' : 'Next country →';
  $('#gp-cap-body .gp-flagq').appendChild(next);
  next.focus();
}
```

Points:
- A near-miss (`close`) is scored RIGHT and shown the spelling. The comment in
  `settleShape` (fun.js 356-359) explains: being told "no" over one letter
  teaches neither the fact nor the spelling.
- No sound, no speech in any fun game. `speech` and `storage` are not imported
  by fun.js, learn.js, capitals.js, elements.js, shapes.js or flags.js at all.
  The only "reaction" is the mascot: `react(mood, ms)` from shell.js line 93,
  which is `setMood($('.gp-brand__mark'), mood, ms)`.
- Feedback text is appended INSIDE `.gp-flagq` as `.gp-flagq__say`
  (`is-right` green / `is-wrong` amber; CSS lines 2291-2293). There is no
  `.is-nearly` rule in the CSS (the class is set but unstyled).
- Elements add a second explanation line: `<p class="gp-muted cz-elem-extra">`
  with `el.use` (fun.js 705-710), and its `say` text always states symbol,
  name, number and Spanish name (lines 698-703).
- `tools/smoke.js` line 88 asserts `.gp-flagq__say` appears after an answer
  and line 90 asserts the `next` selector exists -- so a new game's feedback
  should use that class, or smoke.js must get a different check.

### Score, next, results

`nextCapital()` (589-594): `r.index += 1; r.choices = null; drawCapQuestion();`
wired at app.js 449-450 (`case 'cap-next'`). `cap-start` and `cap-again` both
call `startCapRound()` (446-453).

`drawCapResults()` (596-616):

```js
function drawCapResults() {
  const r = state.capitals.round;
  const total = r.right + r.wrong;
  const pct = total ? Math.round((r.right / total) * 100) : 0;
  $('#gp-cap-body').innerHTML = `
    <div class="gp-flagdone">
      <h2 class="gp-flagdone__title">${pct >= 70 ? 'Nice work!' : 'All done!'}</h2>
      <p class="gp-flagdone__score"><strong>${r.right}</strong> out of ${total}</p>
      <div class="gp-row gp-row--wrap">
        <button type="button" class="gp-btn gp-btn--primary" data-action="cap-again">Play again</button>
        <a class="gp-btn gp-btn--ghost" href="#/fun/capitals">Change the round</a>
        <a class="gp-btn gp-btn--quiet" href="#/fun">Back to games</a>
      </div>
    </div>`;
  paint();
  showScreen('capgame');
}
```

(`gp-flagdone__title` has no CSS rule; `gp-flagdone__head` at line 2296 is the
styled one used by flags/shapes.) The flag/shape results (fun.js 218-244,
404-433) add the perfect-round vault and confetti:

```js
${perfect ? '<div class="gp-confetti" aria-hidden="true">' +
  Array.from({ length: 14 }, (_, i) => `<span data-style="--i:${i}"></span>`).join('') + '</div>' : ''}
```

Note the `data-style` usage there (CSP-safe custom property), consumed by
`.gp-confetti span { left: calc(var(--i) * 7.1%); animation-delay: calc(var(--i) * 0.13s) }`
(CSS 2335-2353, with a reduced-motion override). Best scores are NOT stored
anywhere; the round vanishes on reload.

### Browse / learn mode (no score)

Two implementations:

1. Shared browser for flags, shapes, capitals: `assets/js/screens/learn.js`
   `GAMES` adapter table (lines 28-69) -- one entry per game with `title`,
   `back`, `load`, `list`, `nameOf`, `continentOf`, `media`, `sub`, optional
   `title2`, `note`. Capitals entry:

   ```js
   capitals: {
     title: 'Every country and its capital',
     back: '#/fun/capitals',
     load: () => capitals.loadCapitals(),
     list: (d) => d.countries,
     nameOf: (c) => c.country,
     continentOf: (c) => c.continent,
     media: (c) => `<p class="cz-learn__big">${escapeHtml(c.country)}</p>`,
     title2: (c) => c.capital,
     sub: (c, d) => continentName(d, c.continent),
     note: (c) => (c.names.length > 1 ? `Also written: ${c.names.slice(1).join(', ')}` : '')
   }
   ```

   `renderLearn(game)` (85-103) loads, resets `state.learn` if the game
   changed, orders via `modules/learn.js` `order()` (alpha or continent),
   calls `paintLearn()` and `showScreen('learn')`. `paintLearn()` (105-127)
   renders `modules/learn.js` `renderBrowser({ title, backHref, orders,
   current, index, total, item: { media, title, sub, note }, groups })` into
   `#gp-learn-body`. `renderBrowser` (learn.js 40-85) draws: the backlink
   (`<a class="gp-btn gp-btn--ghost gp-backlink" href="${backHref}">&larr;
   Back to the game</a>`), an order radiogroup (`data-learnorder`), optional
   jump pills (`data-learnjump="<index>"`), the card (`.cz-learn__card`,
   `.cz-learn__media`, `.cz-learn__name`, `.cz-learn__sub`,
   `.cz-learn__note`), prev/next (`data-learnstep="-1|1"`) and a count.
   Handlers: `learnStep`, `learnJump`, `learnOrder` (learn.js 129-154), wired
   at app.js 202-209; arrow keys at app.js 539-544 (only when
   `#screen-learn` is active and focus is not in an input). Adding a game to
   this browser = one more `GAMES` entry + `renderFun` already routes any
   non-elements/angles game to `renderLearn(game)`; a missing adapter shows
   `showError('There is nothing to learn here yet.')`.

2. Bespoke pages: `renderElemLearn()` (learn.js 173-250) draws the whole
   periodic table into `#gp-elemlearn-body` on `#screen-elemlearn` with a
   tap-to-explain detail panel (`showElementDetail`, 253-276; click wiring
   app.js 212-213 scoped to `#screen-elemlearn [data-elemcell]`).
   `renderAngleLearn()` (312-369) builds the angle workshop.

## 3. English / Spanish today

There is no UI language setting for the child-facing screens. `storage.js`
DEFAULTS comment (line 50): "Language of the Parent Guide only. The
child-facing screens are English." `<html lang="en">` (index.html line 2).

### Typed answers accept Spanish -- `assets/js/modules/fuzzy.js`

`judgeTyped({ typed, normalise, target, all })` (lines 91-125) is
language-agnostic: it just compares the normalised typed string against every
string in `target.names`, then against every other item's `names` (`other`
verdict), then allows a Damerau edit distance of `allowedEdits(n)` (0 for
n<=4, 1 for 5-9, 2 for 10+; lines 64-68) and refuses (`wrong`) if the typing
is at least as close to any other item's name (the "safety rule", lines
116-123). Spanish works because the data puts Spanish spellings in the same
`names` list (capitals: `names`; shapes: `names`; elements: `namesOf = (e) =>
[e.name, e.es]` at elements.js 115). Normalisers strip accents via
`.normalize('NFKD').replace(/[̀-ͯ]/g, '')` (capitals.js 35-39 keeps leading
articles; shapes.js `normaliseName` 70-82 strips them). `tests/fuzzy.test.mjs`
and `tools/capitalcheck.mjs` / `elementcheck.mjs` prove no cross-acceptance.

Spanish also appears in output text: elements feedback "In Spanish, ${el.es}"
(fun.js 699), element detail card "In Spanish, ..." (learn.js 268), angle
families `f.es` (learn.js 339-340). Placeholders say "English or Spanish"
(capitals.js 173, shapes.js 224).

### Parent Guide language -- `assets/js/screens/parents.js`

- Setting: `guideLang: 'en'` in DEFAULTS.settings (storage.js line 51).
- Button: static in index.html lines 308-312:
  ```html
  <button type="button" class="gp-btn gp-btn--ghost" id="gp-lang-toggle" lang="es" aria-label="Ver esta guía en español">
    <span class="gp-flag" aria-hidden="true">🇪🇸</span>
    <span class="gp-btn__label">Español</span>
  </button>
  ```
  wired at app.js 646 `$('#gp-lang-toggle').addEventListener('click', toggleGuideLanguage)`.
- `LANG_SWITCH` (parents.js 18-21): the button shows the language you are NOT
  reading (`en: { flag: '🇪🇸', label: 'Español', aria: 'Ver esta guía en
  español', lang: 'es' }`, `es: { flag: '🇺🇸', label: 'English', ... lang: 'en' }`).
- `renderParents()` (23-41): picks `lang` from `state.settings.guideLang`,
  re-renders `#gp-parents-body` via `renderParentGuide(state.manifest, lang)`
  only if `body.dataset.lang` changed, sets `lang` attribute on the body and
  on `#screen-parents`, updates the title (`GUIDE_TITLE`), and repaints the
  button's flag emoji, label, aria-label and `lang` attribute.
- `toggleGuideLanguage()` (43-50): flips, `storage.setSetting('guideLang', next)`,
  re-renders, focuses the title, scrolls to top.
- Content: `modules/parents.js` `renderParentGuide(manifest, lang)` dispatches
  to `modules/parents.es.js` `renderParentGuideEs(manifest)` -- a full
  translation, not a summary (its header comment). `screens/gifted.js` line 64
  also passes `state.settings.guideLang || 'en'` into `renderTestsExplainer`.
- The flag emoji is the ONLY use of emoji for a flag; `.gp-flag` is just a span.

### Speech language -- `assets/js/modules/speech.js`

English only. `VOICE_WISHLIST` (29-33) lists Apple/Google/Microsoft English
voices; `pickVoice()` (40-58) prefers local voices then `/^en[-_]US/i` then
`/^en/i`; `speak()` sets `u.lang = (preferredVoice && preferredVoice.lang) ||
'en-US'` (line 133). There is no per-call language parameter. `speak(text |
string[], { force })` cancels anything playing, splits on array parts, rate
default 0.85 (`setRate` clamps 0.5-1.3), pitch 1.05. `isSupported()`,
`isEnabled()`, `setEnabled()`, `cancel()`, `unlock()` (called on first click,
app.js 175), `onStateChange(fn)`, `cleanForSpeech(raw)` (expands `+ - x /` and
`=`, `::` for maths). The read-aloud toggle is `#gp-speak-toggle`; state is
`state.settings.readAloud` (default true) and `applySpeechButton()`
(gifted.js 24-35) syncs it. Only the gifted quiz speaks: `speakQuestion()`
(gifted.js 38-44) and result speech at gifted.js 454-456
`speech.speak([result.correct ? 'That is right.' : 'Not that one.', result.explanation])`.
No fun game calls speech.

## 4. storage.js

`assets/js/modules/storage.js`. One localStorage key `giftedprep.v1` (line 14,
deliberately not renamed). Falls back to an in-memory Map if localStorage
throws (lines 17-25). `isPersistent()`.

DEFAULTS (39-64):

```js
const DEFAULTS = {
  version: 1,
  settings: {
    grade: 1,
    theme: 'auto',
    readAloud: true,
    speechRate: 0.85,
    lastTest: null,
    lastCategory: null,
    questionCount: 10,
    guideLang: 'en',
    mathDone: {},        // { "1:ten-frames": 4, ... }
    chess: {}            // owned/validated by modules/chessprogress.js
  },
  stats: {},             // stats[categoryId] = { seen, correct, streakBest, lastSeenIso }
  seenQuestionIds: [],
  totals: { answered: 0, correct: 0, sessions: 0 }
};
```

`migrate(old)` (75-93): on a version mismatch, copies ONLY keys present in
`DEFAULTS.settings` from `old.settings`, keeps `stats`, `seenQuestionIds`,
numeric `totals`. The comment at lines 54-57 is the rule for any new per-room
progress: "It has to be named here or migrate() drops it on the next version
bump." `load()` (97-118) also spreads `DEFAULTS.settings` under the saved
settings for same-version loads, so a new key appears with its default without
a version bump.

API (128-200): `getSettings()` (copy), `setSetting(key, value)` (persist,
returns value), `getStats(categoryId?)`, `getTotals()`, `recordAnswer(categoryId,
wasCorrect, questionId, currentStreak)` (bumps stats + totals + bounded
`seenQuestionIds` at 4000/3000), `markSessionStarted()`, `getSeenQuestionIds()`
-> Set, `resetAll()`, `resetProgress()` (clears stats/seen/totals, keeps
settings). `_migrate` exported for tests.

How rooms store progress: Math Lab uses `state.settings.mathDone` +
`storage.setSetting('mathDone', all)` (screens/math.js 20-35,
`markTopicProgress`); Chess uses `settings.chess` via chessprogress.js; the
gifted quiz uses `recordAnswer`. **No fun game stores anything**: no best
scores, no seen items, nothing. `state.<game>.setup` is in-memory only.
`tools/tests/storage.test.mjs` (lines 12-19) shows the shim needed to import
storage.js under node (`globalThis.localStorage` + `globalThis.window`).

What a trivia game would add, following the pattern: one key in
`DEFAULTS.settings` (e.g. `trivia: {}`), read via `state.settings.trivia`,
written with `storage.setSetting('trivia', obj)`, and a migration test case in
`tools/tests/storage.test.mjs` if its shape matters. If it wants seen-question
tracking, the gifted `seenQuestionIds` list is category-agnostic and bounded,
but mixing trivia ids into it would affect the gifted "unseen first" ordering
(`quiz.js` `dealAcrossCategories`), so a separate list under the settings key
is safer.

## 5. Click delegation and keyboard handling -- `assets/js/app.js`

One listener: `document.addEventListener('click', onClick)` (line 630).
`onClick` (173-503) is a flat sequence of
`const x = ev.target.closest('[data-...]'); if (x) { ...; return; }` checks,
grouped by game with comments, followed by a `switch (action.dataset.action)`
for `[data-action]` buttons. Order is load-bearing:

1. gifted pickers `[data-grade]`, `[data-count]` (177-191)
2. browse mode `[data-learnstep]`, `[data-learnjump]`, `[data-learnorder]` (202-209)
3. `#screen-elemlearn [data-elemcell]` (212-213)
4. elements setup `[data-elemset|elemask|elemcount]` (216-223)
5. angle workshop + angle setup + `[data-anganswer]` (226-243)
6. `[data-elemanswer]`, `[data-elemcell]` (245-249)
7. capitals: `[data-capcount]`, `[data-cappick]`, `[data-capmode]` (clears
   continents when leaving continent mode), `[data-capcont]` (toggles in
   place), `[data-capanswer]`, `[data-capcheck]` (252-279)
8. shapes (281-310), flags (313-347), Math Lab (349-379), chess (385-403)
9. **generic `.gp-choice`** (405-406):
   ```js
   const choice = ev.target.closest('.gp-choice');
   if (choice && !state.answered) { handleAnswer(choice.dataset.choice); return; }
   ```
   This is the gifted-quiz answer handler and it catches ANY `.gp-choice`
   not intercepted above. The comment at 380-384 spells the trap out for
   chess. A new game's choice buttons carry `.gp-choice` for styling, so its
   `closest('[data-<game>answer]')` check MUST be placed before line 405.
10. `[data-category]` (408-412)
11. `[data-action]` switch (414-502). Actions starting with `chess-` are
    forwarded to `chess.chessAction`. Fun cases:
    ```js
    case 'cap-start': startCapRound(); break;
    case 'cap-next':  nextCapital();   break;
    case 'cap-again': startCapRound(); break;
    ```
    (elements: `elem-start/next/again`; angles: `ang-start/next/again`,
    `ang-arms`; shapes: `shape-start/next/again` -- shape-next inlines
    `state.shapes.round.index += 1; drawShapeQuestion();`; flags likewise.)

A screen "registers" handlers only by (a) exporting functions from
`screens/<x>.js`, (b) importing them in app.js line 27-31, and (c) adding
`closest()` lines and `case` labels here. Nothing is dynamic.

Setup-option data attributes are prefixed per game (`cap`, `elem`, `ang`,
`shape`, `flag`) and are read via `dataset.<camelCase>` (`data-capcount` ->
`dataset.capcount`).

Keyboard:
- `radioGroupKeys(ev)` (508-536), bound at 631: inside any
  `[role="radiogroup"]`, on a `[role="radio"]` button, Space/Enter clicks,
  arrows/Home/End click the neighbour and refocus it by looking the group up
  again by `id` (because the click re-renders the group). So count pickers
  need `id` on the radiogroup div (`gp-cap-counts`) for focus to survive.
- `onKeydown` (538-561), bound at 632: learn-screen arrows (539-544); then
  quiz-only: digits 1-6 pick `.gp-choice`, arrows go prev/forward, Enter/Space
  after answering = next. Nothing for the fun games.
- Enter-to-submit for typed boxes: the anonymous listener at 650-658 (section
  2). A new typed input needs a line there.
- Focus management inside games is manual: `box.focus()` after drawing a typed
  question, `next.focus()` after settling.

Also in `boot()` (624-681): `hydrateIcons()`, `hydrateMascots()`,
`applyTheme()`, `applySpeechButton()`, direct listeners on
`#gp-next/#gp-prev/#gp-fwd/#gp-replay/#gp-theme-toggle/#gp-lang-toggle/
#gp-ex-prev/#gp-ex-next/#gp-speak-toggle` (archcheck 152-166 fails the build if
a `$('#id')` literal in JS names an id that exists neither in index.html nor
in any JS `id="..."` string), manifest load, then `route()`.

## 6. CSS -- `assets/css/design-system.css` (4574 lines)

### Tokens (light at `:root` line 110; dark twice: `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {...} }` line 304-305 and `:root[data-theme="dark"]` line 402)

- Surfaces/ink: `--gp-bg`, `--gp-surface`, `--gp-surface-2`, `--gp-surface-3`,
  `--gp-ink`, `--gp-ink-soft`, `--gp-ink-muted`, `--gp-on-accent`, `--gp-line`,
  `--gp-line-strong`, `--gp-focus`.
- Brand: `--gp-accent` (#BA5828), `--gp-accent-strong`, `--gp-accent-soft`,
  `--gp-accent-line`; `--gp-secondary(-soft/-line)`.
- States: `--gp-good(-soft/-line)` green for right; `--gp-retry(-soft/-line)`
  amber for wrong -- the comment at 140 says "amber, never red".
- Hues, each with `--cz-<hue>`, `--cz-<hue>-soft`, `--cz-<hue>-line`,
  `--cz-<hue>-ink` (lines 167-202, dark 342-367): mango, honey, leaf, jade,
  lagoon, sky, orchid, flamingo. Plus `--cz-deep` for the welcome band.
- Type: `--gp-font-ui`, `--gp-font-read`, `--gp-font-mono`, `--gp-text-xs/sm/
  base/md/lg/xl` (and `--gp-text-2xl` used by `.gp-flagdone__head`); spacing
  `--gp-space-1/2/3/4/5/6/8/10/12/16` (4px base, rem); radius
  `--gp-radius-sm/md/lg/xl/pill`; `--gp-shadow-1/2/3`; motion
  `--gp-dur-fast/mid/slow`, `--gp-ease`; `--gp-tap: 64px`.
- Figure colours `--gp-fig-*` (blue, red, green, yellow, purple, orange, teal,
  pink, grey, ink, stroke, canvas, frame, muted) -- confetti uses
  `--gp-fig-blue`.

### Room hue mechanism

- `.cz-tile` (2404-2422) declares `--room`, `--room-soft`, `--room-line`,
  `--room-ink` defaulting to the brand accent, and uses them for border,
  background, name colour and arrow. `.cz-tile--<hue>` (2483-2490) overrides
  the four `--room*` variables. So the Fun room's home tile is flamingo via
  `ROOMS[1].hue === 'flamingo'` -> `roomCard()` -> `cz-tile--flamingo`.
- Inside the Fun room nothing is flamingo: `#screen-fun` and the capital/
  element/flag/shape screens carry no hue class, so `--room` is undefined
  there and `var(--room, var(--gp-accent))` falls back to the orange accent.
  Only `.cz-room--sky` (3280-3285, angle screens) and `.cz-room--leaf`
  (3288-3293, chess screens) exist as screen-level hue classes; chess also
  sets `className = \`gp-screen cz-room--${level.hue}\`` at runtime
  (screens/chess.js 347, 385, 406). Comment at 3277-3279: a room class must
  only SET the four variables, never provide a default, or it overrides every
  room (roomcheck 70-79 enforces this for `.cz-roomhead`/`.cz-welcome`).
  There is no `.cz-room--flamingo`, `--mango`, `--honey`, `--jade`,
  `--lagoon`, `--orchid`; add one (four lines) if a screen should wear a hue.
- `.cz-mode--learn` (3239-3249) is always jade ("The colour means the ACTION,
  not the game"); `.cz-mode--practice` (3250-3257) uses the accent tag and no
  border.

### Reusable classes

- Buttons (632-706): `.gp-btn` base (pill, 48px min-height); modifiers
  `--primary`, `--ghost`, `--quiet`, `--lg`, `--icon`, `--big` (2239: 60px,
  text-lg), `.is-active`, `[disabled]`.
- Pills (737-760): `.gp-pill`, `.is-selected`, `.gp-pill--small` (3067),
  `.gp-pill small` (2238).
- Cards (824-925): `.gp-card`, `__title`, `__sub`, `__icon`, `__badge`,
  `--setup` (871), `--stats`, `--review`, `--action/--test/--category`
  (clickable), `.is-selected`; `.gp-card--mode` (2229-2237) for setup option
  cards; `.gp-grid--modes` (2228).
- Layout: `.gp-container` (537), `.gp-stack`, `.gp-row`, `.gp-row--wrap`,
  `.gp-grid`, `.gp-grid--start` (943), `.gp-fieldset`/`__legend` (809-810),
  `.gp-page-title` (990), `.gp-page-lede` (1000), `.gp-page-head` (1012),
  `.gp-muted` (505), `.gp-sr-only` (490), `.gp-grade-note` (1006),
  `.gp-backlink` (2227), `.gp-backslot` (3269-3271).
- Choices (1145-1262): `.gp-choices` (+`--2col/--3col/--text`), `.gp-choice`
  (88px min, 2px border), `__badge` (letter circle), `__body`, `__mark`
  (hidden until a state class; 34px circle). States:
  - `.is-selected` accent
  - `.is-correct` green border 3px + `--gp-good-soft` background, mark green
  - `.is-incorrect` amber DASHED border 3px + `--gp-retry-soft`, mark amber
    ("Not-red on purpose")
  - `.is-revealed` green outline + ring, used by the gifted quiz for the
    right answer after a wrong pick (gifted.js 425-427); the fun games use
    `is-correct` for the right one instead.
  - `.is-disabled` dims non-marked tiles (gifted sets it; fun games set
    `disabled` attribute instead, which has no dimming rule).
  - `.gp-choice--flag` (2290): centred, 62px min. `.gp-choice--fig` (3332).
  - Math Lab uses `.gp-choice.is-right` / `.is-wrong` (4558-4559, border
    colour only), `.gp-mchoice`, `.gp-fb.is-wrong`, and `.gp-collect__item.is-right/is-wrong`.
- Question frame: `.gp-flagq` (2264, centred), `__img`, `__ask` (2282),
  `__choices` (2283-2289: auto-fit grid 230px, max 720px), `__choices--tight`
  (3047), `__say` + `.is-right/.is-wrong` (2291-2293); count line
  `.gp-ex__count` (1777); `.cz-capital-country` is set in the markup but has
  NO CSS rule (check: only `.cz-elem-*` rules exist at 2941-2977).
- Typed answer: `.gp-numrow` (1821), `__label`, `__input` (1828, focus ring
  1841), `.gp-typerow` (2383), `.gp-typehint` (2384).
- Score bar: `.gp-flagbar` (2242), `__score`, `.gp-tally`, `--right/--wrong`
  (2251-2262).
- Results: `.gp-flagdone` (2295), `__head` (2296), `__score`, `__again`
  (2298); `.gp-confetti` (2335-2353); `.gp-vault*` (2305-2331); `.gp-done`
  (1934-1937, math celebration).
- Feedback panel (gifted): `.gp-feedback` `.is-positive/.is-retry`
  (1266-1310) with `__head/__icon/__title/__body/__strategy/__actions`.
- Progress bar (1059-1087): `.gp-progress > .gp-progress__bar[role=progressbar]
  > .gp-progress__fill` (width set from JS via `el.style.width`, which is
  CSSOM and allowed), `__label`, `__nav`. Markup in index.html 221-235. Only
  the gifted quiz has one.
- Learn browser: `.cz-learn*` (3060-3106), `.cz-learn__big` (3089).
- Tiles: `.cz-tiles` (2398, auto-fit 280px), `.cz-tile*` (2404-2481),
  `.cz-gameart` has NO rule (the SVG inherits `.cz-tile__pic` sizing 76px box;
  `.cz-creature` is 56px at 2431 but `.cz-gameart` is unsized -- it fills the
  box).
- Callouts `.gp-callout--tip/info/caution` (1486-1520), `.gp-warnbox` (2358).

### The no-inline-style rule

`assets/js/modules/style.js`: `applyStyles(root)` (24-35) copies every
`[data-style]` into `el.style.cssText` and removes the attribute; `setHtml(el,
html)` (38-42) does innerHTML + applyStyles. `shell.js` line 76 exports
`paint = () => applyStyles(document.body)`; every draw function calls
`paint()` after setting innerHTML. Elements' periodic table places cells with
`data-style="grid-row:${e.row};grid-column:${e.col}"` (elements.js 181).
Directly assigning `el.style.width = ...` from JS is also fine (gifted.js 320).
Inline SVG must use presentation attributes or `var()` in `fill=`/`stroke=`;
a `<style>` block inside inlined SVG is discarded (icons.js 51-52).

## 7. Checkers

`package.json` `verify` (line 20) runs, in order: parse, validate, dupcheck,
rulecheck, mathcheck, mathverify, flagcheck, shapecheck, shapeverify,
capitalcheck, elementcheck, anglecheck, chesscheck, roomcheck, animcheck,
archcheck, linkcheck, cspcheck, then `npm test` (`node --test`, which
auto-discovers `tools/tests/*.test.mjs`, 16 files). A new checker = a new
`"<name>check": "node tools/<name>check.mjs"` script + insert into the
`verify` chain.

- `tools/parsecheck.mjs`: parses every `assets/js/**/*.js` as an ES module
  via `vm.SourceTextModule` and JSON.parses every file under `data/`
  (`walkJson('data')`, line 45). A new `data/fun/trivia.json` is covered
  automatically.
- `tools/validate.mjs`: the gifted question bank only (reads
  `data/manifest.json` categories). Ignores `data/fun`.
- `tools/linkcheck.mjs` (169 lines): reads `case '([a-z]+)'` labels from
  `route()` (26-29); harvests every `href="#/..."`, `href: '#/...'`,
  `location.hash = '#/...'` and template-literal prefixes from index.html and
  all JS (77-85) plus `ROOMS[].href`; errors on an unknown head. For `fun`
  (134-140):
  ```js
  if (head === 'fun' && parts[1] && !open) {
    const games = new Set(['flags', 'shapes', 'capitals', 'elements', 'angles']);
    if (!games.has(parts[1])) err(`${link} -> no game called "${parts[1]}"   [${where}]`);
    if (parts[2] && !['play', 'learn'].includes(parts[2])) err(`${link} -> unknown step "${parts[2]}"   [${where}]`);
  }
  ```
  So `#/fun/trivia` links fail until `'trivia'` is added to that Set, and any
  step other than `play`/`learn` fails. Note `href="#/fun/${g.id}"` in
  `renderFunHub` is harvested as the open-ended `#/fun/*` and not checked.
- `tools/roomcheck.mjs`: checks `ROOMS` in `modules/sections.js` -- every
  entry has `id, name, hue, creature, href, status, blurb, meta`; ids unique;
  live rooms have unique creature and hue; every hue has `--cz-<hue>`,
  `-soft`, `-line`, `-ink` tokens and a `.cz-tile--<hue>` class in the CSS;
  blurb <= 90 chars (warning); `.cz-roomhead`/`.cz-welcome` must not declare
  `--room*` after the hue classes; creature ears visible; `roomCard()` output.
  The "meta string" is `ROOMS[].meta`; for fun it is currently `'2 games ·
  492 things to learn'` (sections.js 195) and blurb `'Name every flag in the
  world. Name a country from its shape alone.'` -- both stale (there are 5
  games) and not validated for accuracy. `FUN_GAMES` is not checked by any
  tool.
- `tools/archcheck.mjs`: layering, cycles, 700-line warning, every live room
  has a `case`, SCREENS vs index.html vs `showScreen()` literals, and every
  `$('#id')` literal in JS resolves to a known id.
- `tools/cspcheck.mjs`: the three CSP copies agree directive by directive.
- `tools/smoke.js` (252 lines): browser-console script (paste, do not fetch).
  `GAMES` (37-57) entries: `{ id, label?, setupScreen, start, answer, screen,
  next, setup: [selectors to click first] }`. For each: navigate to
  `#/fun/<id>`, assert exactly one visible `.gp-screen`, assert
  `#<setupScreen> .cz-mode--learn .cz-mode__go` is visible, click `start`,
  assert `screen` visible, click the first `answer`, assert `.gp-flagq__say`
  exists, assert `next` exists, click it, assert screen still visible, then
  navigate to `#/fun/<id>/learn` and assert one visible screen. Then the
  chess checks and the `BACK` table (203-221) of hash -> expected backlink
  href. A new game adds a `GAMES` entry (and optionally BACK rows).
- Data checker structure (`tools/capitalcheck.mjs`, 105 lines):
  ```js
  #!/usr/bin/env node
  import fs from 'node:fs';
  const errors = []; const warnings = [];
  const err = (m) => errors.push(m); const warn = (m) => warnings.push(m);
  const data = JSON.parse(fs.readFileSync('data/fun/capitals.json', 'utf8'));
  const { judge, normaliseCapital } = await import('../assets/js/modules/capitals.js');
  ... per-item field checks, uniqueness, an all-pairs "no cross-acceptance" walk ...
  console.log(summary);
  if (!data.attribution || !data.attribution.capitals) err('no attribution recorded');
  if (warnings.length) { console.log(`\nwarnings (${warnings.length}):`); warnings.forEach((m) => console.log(`  ! ${m}`)); }
  if (errors.length) { console.log(`\nERRORS (${errors.length}):`); errors.slice(0, 20).forEach((m) => console.log(`  x ${m}`)); process.exit(1); }
  console.log('\nNo errors.');
  ```
  Checkers run from the repo root with relative paths, and `await import` the
  game module directly, so the module must be importable under node: no
  `document`/`window` at top level (elements.js imports elemart.js, which is
  pure). `elementcheck.mjs` additionally calls `pool()`/`makeChoices()` to
  prove every set/ask can fill four choices (64-79).
- Unit tests (`tools/tests/*.test.mjs`): `import { test } from 'node:test';
  import assert from 'node:assert/strict';` and read data with
  `JSON.parse(readFileSync(new URL('../../data/fun/x.json', import.meta.url)))`.
  `fuzzy.test.mjs` tests the refusal pairs found in real data;
  `elements.test.mjs` tests completeness properties; `storage.test.mjs` shims
  localStorage before importing.

## 8. Traps

1. **Generic `.gp-choice` handler** (app.js 405-406) swallows any choice
   button not matched earlier and calls the gifted `handleAnswer`, which
   assumes `state.session`. Put the new game's `closest()` before it.
2. **`showScreen` throws** on an unregistered name (shell.js 144-147), and
   archcheck fails the build if SCREENS, index.html ids and `showScreen('...')`
   literals disagree. The shell.js comment (114-121) and archcheck comment
   (115-120) both record that this shipped a blank capital-game page once.
3. **`$('#some-id')` literal** in any JS must name an id that exists in
   index.html or in some JS `id="..."` string, or archcheck errors (152-166).
4. **`style="..."` is silently discarded** in production (style.js 3-17). Use
   `data-style` + `paint()`. Local `python3 tools/serve.py` sends the CSP so
   it also fails locally; `python3 -m http.server` does not.
5. **linkcheck's fun allow-list** (line 135) is hard-coded; a new game id
   must be added there, and only `play`/`learn` steps exist.
6. **`location.hash = ...` in `start*Round` triggers a second render** via
   `hashchange`; the per-question `choices` cache in round state is what
   keeps it idempotent. A game that reshuffles in `drawQuestion` without
   caching will visibly reshuffle.
7. **Setup values are strings** (`dataset.*`); compare with `String(...)` or
   `Number(...)` as `renderSetup`/`buildRound` do.
8. **`radioGroupKeys` refocuses by group `id`** (app.js 527-531); a
   radiogroup without an `id` loses focus after arrow-key selection.
9. **smoke.js checks `.gp-flagq__say` and a visible `.cz-mode--learn
   .cz-mode__go`** on every game's setup screen, and exactly one visible
   `.gp-backlink` per non-home page. A game with no Learn section or a
   different feedback class needs a smoke.js change.
10. **`backTarget()` returns null under `#/fun/<x>`**, so the section
    markup must include its own backlink (and only one).
11. **Round-perfect confetti** uses `data-style="--i:${i}"`; copy it
    verbatim, not as `style=`.
12. **fun.js is 879 lines** (archcheck warns above 700). Putting a sixth game
    in it deepens the warning; a `screens/trivia.js` importing shell.js is the
    cleaner shape, and screens may import other screens (archcheck 14) so it
    can still be reached from `renderFun`.
13. **`sections.js` ROOMS fun entry** blurb/meta say "2 games · 492 things to
    learn" -- stale, and README.md lines 54/120/452/459 list the games by
    hand.
14. **Modules imported by node checkers/tests must not touch the DOM at
    import time.** `capitals.js`, `elements.js`, `fuzzy.js`, `slots.js`,
    `learn.js` are all pure.
15. **Cache headers are no-cache/must-revalidate** for `/assets/*` and
    `/data/*` (netlify.toml 22-31), and `fetch(..., { cache: 'no-cache' })`
    is used everywhere; keep that for a new JSON file.
16. **`react()` only accepts MOODS** (`mascot.js` 41: idle, curious, happy,
    oops, think, sleep, wink, wow); an unknown mood is a silent no-op. The
    conventions in use: `react('happy', 2300)` right, `react('oops', 1800)`
    wrong, `react('wink', 1400)` on a 3-streak (gifted.js 467-469), `wow` for
    a big win. Elements/capitals do not do the streak wink; angles track
    `streak`/`best` in round state (fun.js 776, 810-817) but only report
    "Best run" on results.
17. **`.gp-flagdone__title` and `.cz-capital-country` and `.is-nearly` have no
    CSS rules** -- harmless, but do not expect styling from them.
18. **Continent mode with no continents** disables Start (`renderSetup`
    `noContinent`); the `buildRound` guard `if (!list.length) return;` in
    `start*Round` is the last line of defence.

## 9. Free / unused inventory

CSS hues (all eight have tokens + `.cz-tile--<hue>`): mango, honey, leaf,
jade, lagoon, sky, orchid, flamingo.
- Room tiles (`ROOMS`): sky (math), flamingo (fun), leaf (chess), orchid
  (gifted). roomcheck forbids live rooms sharing a hue.
- Game tiles (`FUN_GAMES`): mango (flags), lagoon (shapes), honey (capitals),
  jade (elements), sky (angles). Not used by any game tile: leaf, orchid,
  flamingo. (jade is also the fixed colour of every `.cz-mode--learn` box.)
- Screen-level `.cz-room--<hue>` classes exist only for sky and leaf.

Creatures (`sections.js` CREATURES): bear (gifted), rabbit (fun), owl (math),
fox (chess), logo (top bar); free: cat, mouse, giraffe, frog. (Games do not
use creatures; they use `ART` drawings.)

`ART` keys in fun.js: flag, outline, flask, angle, capital -- all used.

Icons (`icons.js` ICONS, exported as `ICON_NAMES`): back, close, home,
settings, speaker, speakerOff, sun, moon, check, cross, arrowRight, refresh,
parent, sparkle, trophy, shuffle, clock, grid, series, analogy, sort, words,
book, numbers, calc, fold, shapes, puzzle, ear, chart, listOrder, target,
curiozoo, rotate.
- Used in index.html `data-icon`: book, speaker, target, shuffle, refresh,
  home, arrowRight, sparkle, sort, parent, moon, check, back.
- Used via `icon()` in JS: check, cross, shuffle, sun, moon, speaker,
  speakerOff, sparkle; test/category icons come from `data/manifest.json`
  `"icon"` fields through `icon(t.icon)` / `icon(c.icon)` (gifted.js 156,
  180): analogy, book, calc, ear, fold, grid, listOrder, numbers, puzzle,
  rotate, series, shapes, sort, target, words.
- Not referenced anywhere by name: close, settings, trophy, clock, curiozoo
  (the logo is drawn by mascot.js instead), chart. `trophy` and `clock` are
  the obvious free ones for a scoreboard or timer. (`angles.js` ASKS lines
  179-191 carry `icon:` fields such as `'clock'`, `'protractor'`, `'scales'`,
  but `renderSetup` never draws them, and several name icons that do not
  exist -- `icon()` returns `''` for an unknown name.)

Mascot moods: idle, curious, happy, oops, think, sleep, wink, wow. `think` is
used nowhere in the fun games (intended "instead of a spinner", mascot.js 26).

Data files present: `data/fun/capitals.json`, `elements.json`, `flags.json`,
`shapes.json` (all with top-level `attribution`). No `data/fun/trivia.json`.

Route steps under `#/fun/<game>`: only `play` and `learn` are recognised
anywhere (renderFun, linkcheck).
