#!/usr/bin/env node
/**
 * Append a batch of trivia questions to one category file.
 *
 *   node tools/triviamerge.mjs <category> <batch.json>
 *
 * The batch is a JSON array, or an object with a `questions` array, of
 * questions WITHOUT ids. Ids are assigned here, continuing each level's
 * numbering, so two writers never collide and nothing is ever renumbered.
 *
 * The merged file is written to a temporary file beside the real one and the
 * checker runs on that candidate, with every other topic's stems loaded so a
 * question another file already asks is refused. Only a candidate that passes
 * replaces the real file, by an atomic rename, so an interrupted run or a
 * failed check leaves the category exactly as it was.
 *
 * One merge per category at a time: a lock file stops two writers from
 * numbering from the same snapshot, and the file is compared with what was
 * read before it is replaced, so a change made meanwhile is never overwritten.
 *
 * The file is written in the same compact shape the seed files use (one
 * choice per line, the two languages side by side) so a 300-question file
 * stays readable and a diff shows one question per hunk.
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const [category, batchPath] = process.argv.slice(2);
if (!category || !batchPath) {
  console.error('usage: node tools/triviamerge.mjs <category> <batch.json>');
  process.exit(2);
}

const DIR = 'data/fun/trivia';
const file = path.join(DIR, `${category}.json`);
if (!fs.existsSync(file)) { console.error(`${file} does not exist`); process.exit(2); }

/* The lock. `wx` fails if it already exists, which is the whole point. */
const LOCK = path.join(DIR, `.${category}.lock`);
const TMP = path.join(DIR, `.${category}.json.${process.pid}.tmp`);
let lockFd = null;
try {
  lockFd = fs.openSync(LOCK, 'wx');
} catch (e) {
  if (e.code !== 'EEXIST') throw e;
  console.error(`Another merge into ${category} is running (${LOCK}). If none is, delete that file.`);
  process.exit(2);
}
process.on('exit', () => {
  try { fs.closeSync(lockFd); } catch { /* already closed */ }
  try { fs.unlinkSync(LOCK); } catch { /* already gone */ }
  try { fs.unlinkSync(TMP); } catch { /* renamed into place, or never written */ }
});
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => process.exit(130));

const before = fs.readFileSync(file, 'utf8');
const data = JSON.parse(before);
const raw = JSON.parse(fs.readFileSync(batchPath, 'utf8'));
const batch = Array.isArray(raw) ? raw : raw.questions;
if (!Array.isArray(batch) || !batch.length) { console.error('the batch has no questions'); process.exit(2); }

/* Next free number per level, from the ids already in the file. */
const next = { easy: 0, medium: 0, hard: 0 };
for (const q of data.questions) {
  const m = /-(easy|medium|hard)-(\d+)$/.exec(q.id || '');
  if (m) next[m[1]] = Math.max(next[m[1]], Number(m[2]));
}

const added = [];
for (const q of batch) {
  if (!next.hasOwnProperty(q.level)) { console.error(`a question has level "${q.level}"`); process.exit(2); }
  next[q.level] += 1;
  const id = `${category}-${q.level}-${String(next[q.level]).padStart(3, '0')}`;
  added.push({ ...q, id });
}
data.questions.push(...added);

/* ---- the compact writer ---- */

const J = (v) => JSON.stringify(v);
const langs = (obj) => ['en', 'es'].filter((l) => obj && obj[l] !== undefined);
const pair = (obj) => `{ ${langs(obj).map((l) => `${J(l)}: ${J(obj[l])}`).join(', ')} }`;
const choice = (c) => {
  const parts = langs(c).map((l) => `${J(l)}: ${J(c[l])}`);
  if (c.emoji !== undefined) parts.push(`"emoji": ${J(c.emoji)}`);
  return `{ ${parts.join(', ')} }`;
};

function question(q) {
  const head = [`"id": ${J(q.id)}`, `"level": ${J(q.level)}`, `"type": ${J(q.type)}`, `"lang": ${J(q.lang || 'both')}`];
  if (q.emoji !== undefined) head.push(`"emoji": ${J(q.emoji)}`);
  return [
    '    {',
    `      ${head.join(', ')},`,
    `      "q": ${pair(q.q)},`,
    '      "choices": [',
    q.choices.map((c) => `        ${choice(c)}`).join(',\n'),
    '      ],',
    `      "answer": ${J(q.answer)},`,
    `      "why": ${pair(q.why)},`,
    `      "topic": ${J(q.topic)},`,
    `      "source": ${J(q.source)}`,
    '    }'
  ].join('\n');
}

const out = [
  '{',
  `  "note": ${J(data.note)},`,
  `  "category": ${J(data.category)},`,
  `  "attribution": ${J(data.attribution)},`,
  '  "questions": [',
  data.questions.map(question).join(',\n'),
  '  ]',
  '}',
  ''
].join('\n');

/* Prove the compact writer lost nothing before touching the file. */
const canon = (v) => (Array.isArray(v) ? v.map(canon)
  : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, canon(v[k])])) : v);
const roundTrip = JSON.parse(out);
if (JSON.stringify(canon(roundTrip)) !== JSON.stringify(canon(data))) {
  console.error('internal error: the compact writer changed the data; nothing written');
  process.exit(1);
}

/* Write the candidate, flushed to disk, and check it where it lies. */
const fd = fs.openSync(TMP, 'w');
fs.writeSync(fd, out);
fs.fsyncSync(fd);
fs.closeSync(fd);
const check = spawnSync('node', ['tools/triviacheck.mjs', '--file', `${category}.json`,
  '--candidate', TMP, '--strict-stems'], { encoding: 'utf8' });
process.stdout.write(check.stdout);
process.stderr.write(check.stderr);
if (check.status !== 0) {
  console.error(`\nThe batch did not pass. ${file} was not touched. Fix ${batchPath} and run again.`);
  process.exit(1);
}
if (fs.readFileSync(file, 'utf8') !== before) {
  console.error(`\n${file} changed while this merge ran. Nothing was written; run again.`);
  process.exit(1);
}
fs.renameSync(TMP, file);
console.log(`\nAdded ${added.length} questions to ${file}: ${added[0].id} to ${added[added.length - 1].id}.`);
console.log('Now run `node tools/triviacheck.mjs --write` to update the manifest.');
