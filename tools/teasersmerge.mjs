#!/usr/bin/env node
/**
 * Add teasers to the bank.
 *
 *   node tools/teasersmerge.mjs batch.json [more.json ...]
 *
 * Each batch is { "items": [...] } without ids. Every item is held to the
 * same rules the checker uses (tools/teaserschema.mjs) before anything is
 * written, and if any item fails, nothing is written at all: the new level
 * files go to temporary files first and are only moved into place once every
 * one of them has been written. Items get the next free id in
 * data/teasers/<level>.json. A teaser whose English question is already in
 * the bank is skipped and named. Afterwards run the checker with --write to
 * rebuild the manifest and the credits page.
 */

import fs from 'node:fs';

const DIR = 'data/teasers';
const { LEVEL_IDS } = await import('../assets/js/modules/teasers.js');
const { problems, fold } = await import('./teaserschema.mjs');
const FIELDS = ['id', 'level', 'kind', 'emoji', 'q', 'choices', 'answer', 'value', 'check',
  'why', 'hint', 'source', 'sourceName', 'rights', 'origin', 'alsoFound', 'qa'];

const files = process.argv.slice(2);
if (!files.length) {
  console.error('usage: node tools/teasersmerge.mjs batch.json [more.json ...]');
  process.exit(2);
}

const bank = {};
for (const level of LEVEL_IDS) {
  const file = `${DIR}/${level}.json`;
  bank[level] = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')).items || [] : [];
}
const known = new Set(Object.values(bank).flat().map((x) => fold(x.q?.en)));

const refused = [];
let added = 0;
for (const f of files) {
  const items = JSON.parse(fs.readFileSync(f, 'utf8')).items || [];
  for (const [i, raw] of items.entries()) {
    const where = `${f} item ${i + 1}`;
    if (!LEVEL_IDS.includes(raw?.level)) { refused.push(`${where}: level "${raw?.level}"`); continue; }
    const wrong = problems(raw, raw.level, { withId: false });
    if (wrong.length) { wrong.forEach((m) => refused.push(`${where}: ${m}`)); continue; }
    const key = fold(raw.q.en);
    if (known.has(key)) { console.log(`  skipped, already in the bank: ${raw.q.en.slice(0, 70)}`); continue; }
    known.add(key);
    const list = bank[raw.level];
    const next = list.reduce((n, x) => Math.max(n, Number(String(x.id).split('-')[1]) || 0), 0) + 1;
    const item = { ...raw, id: `${raw.level}-${String(next).padStart(3, '0')}` };
    const tidy = {};
    for (const k of FIELDS) if (item[k] !== undefined) tidy[k] = item[k];
    list.push(tidy);
    added += 1;
  }
}

if (refused.length) {
  console.error(`Nothing written. ${refused.length} problem(s):`);
  refused.forEach((p) => console.error(`  x ${p}`));
  process.exit(1);
}

/* Everything valid: write each level to a temporary file, and only when all
   three are safely on disk, move them into place. A crash halfway leaves the
   bank as it was, not with one level updated and the others not. */
fs.mkdirSync(DIR, { recursive: true });
const staged = [];
try {
  for (const level of LEVEL_IDS) {
    const file = `${DIR}/${level}.json`;
    const old = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
    const head = Object.entries(old).filter(([k]) => k !== 'level' && k !== 'items')
      .map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)},\n`).join('');
    /* One teaser per line: a diff then shows exactly which teaser changed. */
    const body = bank[level].map((x) => `    ${JSON.stringify(x)}`).join(',\n');
    const tmp = `${file}.tmp-${process.pid}`;
    fs.writeFileSync(tmp, `{\n  "level": "${level}",\n${head}  "items": [\n${body}\n  ]\n}\n`);
    staged.push([tmp, file]);
  }
  for (const [tmp, file] of staged) fs.renameSync(tmp, file);
} catch (e) {
  staged.forEach(([tmp]) => { try { fs.unlinkSync(tmp); } catch { /* already gone */ } });
  console.error(`Nothing written: ${e.message}`);
  process.exit(1);
}
console.log(`added ${added}: ${LEVEL_IDS.map((l) => `${bank[l].length} ${l}`).join(', ')}`);
