#!/usr/bin/env node
/**
 * Add teasers to the bank.
 *
 *   node tools/teasersmerge.mjs batch.json [more.json ...]
 *
 * Each batch is { "items": [...] } without ids. Every item is held to the
 * same rules the checker uses (tools/teaserschema.mjs) before anything is
 * written, and if any item fails, nothing is written at all. The new bank is
 * then swapped in as a whole folder (see the end of this file), so the three
 * levels always change together or not at all. Items get the next free id in
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

/* A run killed halfway through the folder swap below leaves the old bank
   under its aside name and no bank folder. Put it back before anything else;
   a staging folder left behind is simply removed. */
const parent = DIR.split('/').slice(0, -1).join('/') || '.';
const base = DIR.split('/').pop();
if (fs.existsSync(parent)) {
  const leftovers = fs.readdirSync(parent);
  const aside = leftovers.find((f) => f.startsWith(`${base}.old-`));
  if (aside && !fs.existsSync(DIR)) {
    fs.renameSync(`${parent}/${aside}`, DIR);
    console.log(`  restored ${DIR} from an interrupted earlier run`);
  }
  for (const f of fs.readdirSync(parent)) {
    if (f.startsWith(`${base}.staging-`) || f.startsWith(`${base}.old-`)) {
      fs.rmSync(`${parent}/${f}`, { recursive: true, force: true });
    }
  }
}

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

/* Everything valid. The new bank is built as a whole folder beside the old
   one, and then the two folders are swapped: the old one is renamed aside,
   the new one renamed into place, and only then is the old one deleted. If
   the second rename fails, the old folder is put straight back. A process
   killed between the two renames leaves the old folder under its aside name
   and no bank folder at all, which the recovery at the top of this tool puts
   right on the next run. Either way the bank is never half one version and
   half the other. */
const stage = `${DIR}.staging-${process.pid}`;
const aside = `${DIR}.old-${process.pid}`;
try {
  fs.rmSync(stage, { recursive: true, force: true });
  fs.mkdirSync(stage, { recursive: true });
  /* Everything else in the folder (the manifest) comes along unchanged. */
  if (fs.existsSync(DIR)) {
    for (const f of fs.readdirSync(DIR)) fs.copyFileSync(`${DIR}/${f}`, `${stage}/${f}`);
  }
  for (const level of LEVEL_IDS) {
    const file = `${DIR}/${level}.json`;
    const old = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
    const head = Object.entries(old).filter(([k]) => k !== 'level' && k !== 'items')
      .map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)},\n`).join('');
    /* One teaser per line: a diff then shows exactly which teaser changed. */
    const body = bank[level].map((x) => `    ${JSON.stringify(x)}`).join(',\n');
    fs.writeFileSync(`${stage}/${level}.json`, `{\n  "level": "${level}",\n${head}  "items": [\n${body}\n  ]\n}\n`);
  }
} catch (e) {
  fs.rmSync(stage, { recursive: true, force: true });
  console.error(`Nothing written: ${e.message}`);
  process.exit(1);
}

const had = fs.existsSync(DIR);
if (had) fs.renameSync(DIR, aside);
try {
  fs.renameSync(stage, DIR);
} catch (e) {
  if (had) fs.renameSync(aside, DIR);
  fs.rmSync(stage, { recursive: true, force: true });
  console.error(`Nothing written: ${e.message}`);
  process.exit(1);
}
if (had) fs.rmSync(aside, { recursive: true, force: true });
console.log(`added ${added}: ${LEVEL_IDS.map((l) => `${bank[l].length} ${l}`).join(', ')}`);
