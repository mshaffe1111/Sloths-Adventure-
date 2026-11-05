#!/usr/bin/env node
// trace-check: the research trace can't silently drop rows (engine critic, 2026-11-05).
//
// Every research row (rule in trace-rows.mjs: a table row that is not a header or separator, or a numbered item that is not a bare
// link) in each source file below must have exactly one row in reference/engine/CRITIC-TRACE.md, keyed `FILE:LINE` in the first cell,
// and no trace row may point at a line that is not a research row. Fails (exit 1) on any missing, extra or stale row, naming each.
//
//   node tools/engine/trace-check.mjs                 sources read from disk, else from git ref origin/engine-mixer
//   node tools/engine/trace-check.mjs --ref <ref>     read sources missing on disk from <ref> instead
//
// A ledger that gains a row fails here until the trace gains its row (the trace only grows with its sources).
import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { researchRows } from './trace-rows.mjs';

const SOURCES = [
  'reference/research/ledger/LEDGER-2026-11-02-full.md',
  'reference/research/ledger/LEDGER-2026-11-04-part1.md',
  'reference/research/ledger/LEDGER-2026-11-04-part2.md',
  'reference/research/ledger/LEDGER-CRITICAL-AGENTS.md',
  'reference/research/ledger/LEDGER-ENGINE-GEMINI.md',
  'reference/research/ledger/LEDGER-ENGINE-PAPERS.md',
  'reference/research/engine-2026-11-05/R1-shipped-pipelines.md',
  'reference/research/engine-2026-11-05/R2-academic-pcg.md',
  'reference/research/engine-2026-11-05/R3-fun-by-math.md',
  'reference/research/engine-2026-11-05/R4-mobile-and-architecture.md',
  'reference/GEMINI-PCG-RESEARCH.md',
  'reference/GEMINI-LEDGER.md',
  'reference/research/GEMINI-VARIETY-2026-11-02.md',
  'reference/research/MATT-RESEARCH-2026-11-04.md',
];
const TRACE = 'reference/engine/CRITIC-TRACE.md';
const a = process.argv;
const ref = a.includes('--ref') ? a[a.indexOf('--ref') + 1] : 'origin/engine-mixer';

const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : execFileSync('git', ['show', `${ref}:${p}`], { encoding: 'utf8', maxBuffer: 64 << 20 }));
const base = (p) => p.split('/').pop();

const want = new Map(); // key -> source line text
for (const p of SOURCES) for (const r of researchRows(read(p))) want.set(`${base(p)}:${r.line}`, r.text);

const have = new Map(); // key -> count
for (const l of readFileSync(TRACE, 'utf8').split('\n')) {
  const m = /^\|\s*`?([A-Za-z0-9._-]+\.md:\d+)`?\s*\|/.exec(l);
  if (m) have.set(m[1], (have.get(m[1]) ?? 0) + 1);
}
const missing = [...want.keys()].filter((k) => !have.has(k));
const extra = [...have.keys()].filter((k) => !want.has(k));
const dup = [...have.entries()].filter(([, n]) => n > 1).map(([k]) => k);
const perFile = SOURCES.map((p) => { const b = base(p); const w = [...want.keys()].filter((k) => k.startsWith(b + ':')).length; const h = [...have.keys()].filter((k) => k.startsWith(b + ':') && want.has(k)).length; return `${b} ${h}/${w}`; });
console.log(`trace-check: ${want.size} research rows, ${have.size} trace rows; ` + perFile.join('; '));
for (const k of missing) console.log(`  MISSING trace row for ${k}: ${want.get(k).slice(0, 100)}`);
for (const k of extra) console.log(`  EXTRA or STALE trace row ${k} (that line is not a research row now)`);
for (const k of dup) console.log(`  DUPLICATE trace row ${k}`);
process.exit(missing.length || extra.length || dup.length ? 1 : 0);
