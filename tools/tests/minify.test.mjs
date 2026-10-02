/**
 * Tests for the deploy's CSS minifier (tools/minify.mjs): smaller, never different.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { minifyCss } from '../minify.mjs';

test('comments and spare whitespace go', () => {
  assert.equal(minifyCss('/* hi */\n.a {\n  color: red;\n  margin: 0 auto;\n}\n'), '.a{color:red;margin:0 auto}');
});

test('a space before ":" stays, because it means a descendant', () => {
  assert.equal(minifyCss('.a :hover { x: 1 }'), '.a :hover{x:1}');
  assert.equal(minifyCss('.a:hover, .b > .c { x: 1 }'), '.a:hover,.b>.c{x:1}');
});

test('calc keeps the spaces round + and -', () => {
  assert.equal(minifyCss('a { width: calc(100% - (2 * 3px)); }'), 'a{width:calc(100% - (2 * 3px))}');
});

test('strings are copied exactly', () => {
  assert.equal(minifyCss('a::before { content: "  /* not a comment */ ; } "; }'), 'a::before{content:"  /* not a comment */ ; } "}');
  assert.equal(minifyCss("a { content: 'it\\'s'; }"), "a{content:'it\\'s'}");
});

test('media queries keep the space before "("', () => {
  assert.equal(minifyCss('@media (prefers-reduced-motion: reduce) and (min-width: 600px) { a { b: c } }'),
    '@media (prefers-reduced-motion:reduce) and (min-width:600px){a{b:c}}');
});

test('every stylesheet gets smaller, and minifying twice changes nothing more', () => {
  const sheets = ['assets/css/design-system.css',
    ...fs.readdirSync('assets/js/rooms').map((r) => `assets/js/rooms/${r}/room.css`).filter((f) => fs.existsSync(f))];
  for (const f of sheets) {
    const src = fs.readFileSync(f, 'utf8');
    const once = minifyCss(src);
    assert.ok(once.length < src.length, f);
    assert.equal(minifyCss(once), once, f);
    assert.equal((once.match(/\{/g) || []).length, (src.replace(/\/\*[\s\S]*?\*\//g, '').match(/\{/g) || []).length, `${f}: braces`);
  }
});
