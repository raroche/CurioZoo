#!/usr/bin/env node
/**
 * Rebuild docs/research/trivia/CREDITS.md: which sites each trivia topic
 * leans on, counted. With thousands of questions a link-by-link list is not
 * readable, so this prints hosts and counts per category instead.
 *
 *   node tools/triviacredits.mjs > docs/research/trivia/CREDITS.md
 */

import fs from 'node:fs';

const manifest = JSON.parse(fs.readFileSync('data/fun/trivia/manifest.json', 'utf8'));
let out = `# Curio Trivia: fact sources

Every question in \`data/fun/trivia/\` carries one \`source\` URL. With
thousands of questions the list is too long to read link by link, so this
file counts the sites each topic leans on. The wording of every question is
written for this project; only the facts come from these pages.

The URLs were written as plausible pages on real sites by the models that
wrote the questions, and were not opened. Before anyone cites one, click it.
Rebuild this file with the command at the bottom.

`;
let total = 0;
for (const c of manifest.categories) {
  const data = JSON.parse(fs.readFileSync(`data/fun/trivia/${c.file}`, 'utf8'));
  const hosts = {};
  for (const q of data.questions) {
    try {
      const h = new URL(q.source).hostname.replace(/^www\./, '');
      hosts[h] = (hosts[h] || 0) + 1;
      total += 1;
    } catch { /* the checker already rejects a bad URL */ }
  }
  const rows = Object.entries(hosts).sort((a, b) => b[1] - a[1]);
  out += `## ${c.emoji} ${c.name} (${data.questions.length} questions, ${rows.length} sites)\n\n`;
  out += rows.slice(0, 12).map(([h, n]) => `- ${h} · ${n}`).join('\n');
  if (rows.length > 12) out += `\n- and ${rows.length - 12} more sites`;
  out += '\n\n';
}
out += `_${total} source links in all._\n\n## Rebuild\n\n\`\`\`bash\nnode tools/triviacredits.mjs > docs/research/trivia/CREDITS.md\n\`\`\`\n`;
process.stdout.write(out);
