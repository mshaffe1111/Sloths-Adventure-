// Session start (startup, resume, compact): every law's headline, read live from reference/LAWS.md so it can never drift, plus where
// the full text and the lessons live. Matt, 2026-11-11: shorten the printout to save tokens in every session (the full laws and
// lessons were ~15 KB per start, resume and compaction). The full LAWS.md and LESSONS.md are read once per task, not reprinted.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const laws = readFileSync(join(root, 'reference/LAWS.md'), 'utf8').split('\n');
const out = ['THE LAWS (Matt, 2026-11-01; never broken, never skipped to go faster; when time is short, cut scope, never a check).',
  'Law zero: you are Matt\'s partner; his trust is the project. Tell the truth about what was and was not done; own every miss.'];
for (const line of laws) {
  if (/^## /.test(line) && !/Law zero/.test(line)) out.push(line.replace(/^## /, '-- '));
  const m = line.match(/^(\d+)\. \*\*(.+?)\*\*/);
  if (m) out.push(`${m[1]}. ${m[2]}`);
}
out.push('',
  'FULL TEXT: reference/LAWS.md. LESSONS (mistakes we paid for, one line each): reference/LESSONS.md. Read BOTH in full once at the start of',
  'every task and before you report (your report names the lessons applied). This short form is printed again after every compaction.',
  'START: the lead reads reference/handoffs/lead.md and reference/roles/PM.md now. A team member reads reference/roles/README.md, then its',
  'card in reference/roles/, then the turnover note(s) the card names.');
console.log(out.join('\n'));
