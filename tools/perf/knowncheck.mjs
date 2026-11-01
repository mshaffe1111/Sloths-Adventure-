/**
 * The known-list check (LAWS.md law 5, reference/methods/gates.md): every list of known defects a gate carries may only SHRINK.
 *
 *   node tools/perf/knowncheck.mjs                (seconds; exit 1 when a list gained an entry)
 *   KNOWN_BASE=<commit> node tools/perf/knowncheck.mjs
 *
 * It compares each list with the same file at the base: KNOWN_BASE if set, else main (origin/main, or main), and when the work is
 * already on main (the deploy run), the commit before it (HEAD^1, the first parent: main before the merge). Any entry the base
 * doesn't have fails: a known list never grows, not on a branch and not in a merge. (The other half of shrink-only, failing a fixed
 * entry that is still listed, is done by each gate itself: clipcheck and playerText.test.ts.)
 * A list that the base doesn't have yet is new: it passes, with a note.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
// each list: its file, and how to read an entry's identity from it
const LISTS = [
  { file: 'tools/perf/clipknown.json', ids: (j) => j.known.map((k) => (k.kind === 'small' || k.kind === 'inset' ? `${k.kind}|${k.sel}` : `${k.kind}|${k.sel}|${k.text.replace(/\d+/g, '#').slice(0, 40)}`)) },
  { file: 'src/game/playerText.known.json', ids: (j) => j.known.map((k) => k.key) },
  { file: 'tools/perf/limits.json', ids: (j) => [...(j.art?.knownOver4096 ?? []).map((f) => `art>4096|${f}`), ...(j.blends?.allowlist ?? []).map((a) => `blend|${a.site}|${a.mode}`)] },
  { file: 'src/game/artUse.allow.json', ids: (j) => (Array.isArray(j) ? j : Object.keys(j)).map((x) => (typeof x === 'string' ? x : x.id ?? JSON.stringify(x))) },
];

const git = (...a) => execFileSync('git', a, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
const tryGit = (...a) => { try { return git(...a); } catch { return null; } };

function base() {
  if (process.env.KNOWN_BASE) return process.env.KNOWN_BASE;
  const head = tryGit('rev-parse', 'HEAD');
  for (const ref of ['origin/main', 'main']) {
    const r = tryGit('rev-parse', '--verify', '--quiet', ref);
    if (!r) continue;
    // on main itself (the deploy run): judge this commit against main before it
    if (r === head) return tryGit('rev-parse', '--verify', '--quiet', 'HEAD^1') ?? r;
    return tryGit('merge-base', ref, 'HEAD') ?? r;
  }
  return tryGit('rev-parse', '--verify', '--quiet', 'HEAD^1');
}

const b = base();
if (!b) { console.log('known-list check: no base commit to compare with (a shallow clone? fetch main): FAIL'); process.exit(2); }
console.log(`known-list check against ${b.slice(0, 8)}`);
let added = 0;
for (const l of LISTS) {
  const now = l.ids(JSON.parse(fs.readFileSync(path.join(root, l.file), 'utf8')));
  const was = tryGit('show', `${b}:${l.file}`);
  if (was === null) { console.log(`  ${l.file}: new list (${now.length} entries), not on the base yet`); continue; }
  const before = new Set(l.ids(JSON.parse(was)));
  const extra = [...new Set(now)].filter((x) => !before.has(x));
  const gone = [...before].filter((x) => !now.includes(x)).length;
  if (extra.length) {
    added += extra.length;
    console.log(`✗ ${l.file}: ${extra.length} entr${extra.length === 1 ? 'y' : 'ies'} ADDED (a known list only shrinks; fix the defect instead):\n    ${extra.join('\n    ')}`);
  } else console.log(`✓ ${l.file}: ${now.length} entries${gone ? `, ${gone} fewer than the base` : ''}`);
}
console.log(added ? 'FAIL' : 'PASS');
process.exit(added ? 1 : 0);
