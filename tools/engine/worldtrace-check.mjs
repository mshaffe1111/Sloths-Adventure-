#!/usr/bin/env node
// worldtrace-check: proves reference/engine/WORLD-TRACE.md classifies every research row the World 1 rulebook does not cite.
// Reads the three TSVs in reference/engine/worldtrace/ (key, engine?, idea, ES status) and the trace's table.
// Fails (exit 1) if a to-classify key is missing or listed twice, if a class is outside the five, if a table row is
// neither a to-classify key nor a later.tsv key moved in, if a cited.tsv key is re-listed, or if the header counts
// or the ADOPT section disagree with the table. No dependencies.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const dir = join(root, 'reference', 'engine', 'worldtrace');
const keysOf = (f) =>
  readFileSync(join(dir, f), 'utf8').split('\n').filter((l) => l.trim()).map((l) => l.split('\t')[0].trim());
const toClassify = keysOf('to_classify.tsv');
const later = new Set(keysOf('later.tsv'));
const cited = new Set(keysOf('cited.tsv'));
const CLASSES = ['USED-VIA', 'LATER WORLD', 'NOT TAKEN', 'CONTRADICTED', 'ADOPT'];

const text = readFileSync(join(root, 'reference', 'engine', 'WORLD-TRACE.md'), 'utf8');
const errors = [];
const seen = new Map();
const counts = Object.fromEntries(CLASSES.map((c) => [c, 0]));
const adoptRows = new Set();
let inTable = false;
for (const line of text.split('\n')) {
  if (line.startsWith('| Row | Class | Reason |')) { inTable = true; continue; }
  if (!inTable) continue;
  if (line.startsWith('|---')) continue;
  if (!line.startsWith('| ')) { if (seen.size) inTable = false; continue; }
  const cells = line.split('|').map((c) => c.trim());
  const [key, cls, reason] = [cells[1], cells[2], cells[3]];
  if (!CLASSES.includes(cls)) errors.push(`bad class "${cls}" for ${key}`);
  else counts[cls]++;
  if (!reason) errors.push(`no reason for ${key}`);
  if (seen.has(key)) errors.push(`duplicated: ${key}`);
  seen.set(key, cls);
  if (cls === 'ADOPT') adoptRows.add(key);
}
const tc = new Set(toClassify);
if (tc.size !== toClassify.length) errors.push('to_classify.tsv itself has duplicate keys');
for (const k of toClassify) if (!seen.has(k)) errors.push(`missing: ${k}`);
const moved = [];
for (const k of seen.keys()) {
  if (tc.has(k)) continue;
  if (cited.has(k)) errors.push(`already cited by the rulebook, must not be re-listed: ${k}`);
  else if (later.has(k)) moved.push(k);
  else errors.push(`not a research row from the TSVs: ${k}`);
}

// Header counts must match the table.
const head = text.match(/\*\*Counts:\*\*([^\n]*)/);
if (!head) errors.push('no **Counts:** line in the header');
else for (const c of CLASSES) {
  const m = head[1].match(new RegExp(c + ' (\\d+)'));
  if (!m || Number(m[1]) !== counts[c]) errors.push(`header count for ${c} is ${m ? m[1] : 'absent'}, table has ${counts[c]}`);
}
// Every ADOPT row appears in the ADOPT section, and nothing else does.
const sec = text.split('## ADOPT candidates')[1] ?? '';
if (!sec) errors.push('no "## ADOPT candidates" section');
const listed = new Set([...sec.matchAll(/`([^`]+\.md:\d+)`/g)].map((m) => m[1]));
for (const k of adoptRows) if (!listed.has(k)) errors.push(`ADOPT row missing from the ADOPT section: ${k}`);
for (const k of listed) if (!adoptRows.has(k)) errors.push(`ADOPT section lists a row not classed ADOPT: ${k}`);

const total = Object.values(counts).reduce((a, b) => a + b, 0);
console.log(`worldtrace-check: ${toClassify.length} to classify, ${moved.length} moved from later.tsv, ${total} rows in the table`);
for (const c of CLASSES) console.log(`  ${c.padEnd(13)} ${counts[c]}`);
console.log(`  ADOPT rules   ${[...sec.matchAll(/^\d+\. \*\*/gm)].length}`);
if (moved.length) console.log(`  moved: ${moved.join(', ')}`);
if (errors.length) {
  console.error(`FAIL: ${errors.length} problem(s)`);
  for (const e of errors.slice(0, 50)) console.error('  ' + e);
  process.exit(1);
}
console.log('PASS');
