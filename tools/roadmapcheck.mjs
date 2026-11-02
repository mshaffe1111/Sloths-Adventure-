/**
 * The roadmap check (reference/methods/roadmap.md, LAWS.md law 5): open work that lives in the repo must be on reference/ROADMAP.md.
 *
 *   node tools/roadmapcheck.mjs          (seconds; exit 1 on an orphan or a bad proof, 2 when it can't run)
 *
 * It fails when:
 *   1. ROADMAP.md is missing, or an R-id appears twice as an item (ids are never reused);
 *   2. a defect in reference/CONTINUOUS-IMPROVEMENT.md whose countermeasure, yokoten or "Held?" column says roadmap / next week / later
 *      has no R-item whose Source cites it (D16 -> "D16");
 *   3. a known-defect or allow list (every *.known.json, *.allow.json, tools/perf/clipknown.json, tools/perf/limits.json's known lists)
 *      that still has entries is not cited by an open R-item; every clipknown group (G1, G2, ...) and every playerText.known key must be
 *      cited by an open R-item too ("clipknown G4", the key's text);
 *   4. a reference/ NEXT.md file is not cited by any R-item (open or archived);
 *   5. a done item (A-n in the archive, or a state "done (...)") names no proof, or a proof that does not exist: a commit must be in
 *      HEAD's history or on a branch of this clone, a PR must have its "Merge pull request #n from" commit in HEAD's history.
 *   6. a number the roadmap or reference/BUILD-PLAN.md points at is not defined in ROADMAP.md;
 *   7. a defect in the log has no line in reference/LESSONS.md (and no open R-item to add it); a method file is missing from
 *      reference/methods/README.md.
 * Numbers: R-n and R-n.m are open items, A-n archived ones; the "Draft numbers retired" table is skipped (never reused).
 * It needs the full history (CI: gates.yml checks out with fetch-depth 0).
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const rel = (p) => path.relative(root, p).split(path.sep).join('/');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const git = (...a) => execFileSync('git', a, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
const tryGit = (...a) => { try { return git(...a); } catch { return null; } };

const fails = [];
const fail = (m) => fails.push(m);

// ---- 1. the list itself
const RM = 'reference/ROADMAP.md';
if (!fs.existsSync(path.join(root, RM))) {
  fail(`${RM} is missing: every piece of open work needs an R-id on it (reference/methods/roadmap.md)`);
}
const items = []; // { id, what, size, state, owner, source, done, proof, area }
if (fs.existsSync(path.join(root, RM))) {
  let area = '';
  for (const line of read(RM).split('\n')) {
    const h = line.match(/^## (.+)/);
    if (h) area = h[1].trim();
    if (!/^\| (R-\d+(\.\d+)?|A-\d+) \|/.test(line)) continue;
    const c = line.trim().replace(/^\||\|$/g, '').split(' | ').map((x) => x.trim());
    const id = c[0];
    if (/^Draft numbers retired/.test(area)) continue; // old draft numbers, kept so they are never reused
    if (/^Done/.test(area)) items.push({ id, what: c[1], done: true, proof: c[3] ?? '', source: c[3] ?? '', area });
    else if (c.length >= 10) {
      const [, what, tier, get, timeTxt, value, size, state, owner, source] = c;
      const hours = Number((timeTxt.match(/^(\d+(?:\.\d+)?) h \((.+)\)$/) ?? [])[1]);
      items.push({ id, what, tier, get, hours, value, size, state, owner, source, done: /^done\b/.test(state), proof: state, area });
      if (!['S', 'M', 'L'].includes(size)) fail(`${id}: size "${size}" is not S, M or L`);
      if (!/^(open|in progress|blocked \(.+\)|held \(.+\)|verify|done \(.+\))/.test(state)) fail(`${id}: state "${state}" is not one of open / in progress / blocked (by ...) / held (by ...) / verify / done (date, proof)`);
      // Matt's R-10 (his names, 2026-11-01): every open item says whether launch needs it, and why
      if (!/^(Day 1|Important): \S/.test(tier) && !/^Parking lot\b/.test(tier) && !/^Matt\b/.test(tier)) fail(`${id}: tier "${tier}" must be "Day 1: why", "Important: why", "Parking lot" or "Matt" (R-10)`);
      // Matt's R-11: what we get, helper-days, value A-F; a Day 1 item is A or B unless the tier says why not
      if (!get || get === what) fail(`${id}: "What we get" is empty or repeats the task (R-11)`);
      // Matt's R-12: time in hours from a measured past job, named beside it ("like whatsnew (2.5 h)"), or "no history" with a range
      if (!(hours > 0)) fail(`${id}: Time "${timeTxt}" must be "N h (the past job it is measured from, or no history: a range)" (R-12)`);
      else if (size !== (hours <= 2 ? 'S' : hours <= 6 ? 'M' : 'L')) fail(`${id}: size ${size} doesn't match ${hours} h (S up to 2 h, M up to 6 h, L over 6 h)`);
      if (!/^[A-F]$/.test(value)) fail(`${id}: Value "${value}" is not A-F (R-11)`);
      else if (/^Day 1/.test(tier) && !/^[AB]$/.test(value) && !/graded [C-F] because/.test(tier)) fail(`${id}: a Day 1 item graded ${value}: grade it A/B or say "graded ${value} because ..." in the tier (R-11)`);
    } else fail(`${id}: an item row needs 10 columns (ID | What | Tier | What we get | Days | Value | Size | State | Owner | Source), has ${c.length}`);
  }
  const seen = new Map();
  for (const it of items) seen.set(it.id, (seen.get(it.id) ?? 0) + 1);
  for (const [id, n] of seen) if (n > 1) fail(`${id} is listed ${n} times (an id is never reused)`);

  // 1b. every number the file points at is defined in it: an item row, a "## R-n" topic heading, or a closed Matt item named in an
  // archive row ("(R-8, ...)"). The left column of the retired-drafts table is the one place an old number may stand alone.
  const defined = new Set(items.map((i) => i.id));
  let area2 = '';
  for (const line of read(RM).split('\n')) {
    const h = line.match(/^## (R-\d+)\b/);
    if (h) defined.add(h[1]);
    if (/^## /.test(line)) area2 = line;
    if (/^## Done/.test(area2) && /^\| A-\d+ \|/.test(line)) for (const m of line.matchAll(/\((R-\d+(?:\.\d+)?)(?![\d.]*\d)/g)) defined.add(m[1]);
  }
  area2 = '';
  read(RM).split('\n').forEach((line, n) => {
    if (/^## /.test(line)) area2 = line;
    let text = line;
    if (/^## Draft numbers retired/.test(area2) && /^\| /.test(line)) text = line.split(' | ').slice(1).join(' | ');
    if (/^## Draft numbers retired/.test(area2) && !/^\| /.test(line)) return;
    for (const m of text.matchAll(/\b([RA]-\d+(?:\.\d+)?)(?![\d.]*\d)/g)) {
      if (!defined.has(m[1])) fail(`${RM}:${n + 1} points at ${m[1]}, which is not defined in the file`);
    }
  });
  // the build plan points at the same numbers
  const BP = 'reference/BUILD-PLAN.md';
  if (fs.existsSync(path.join(root, BP))) read(BP).split('\n').forEach((line, n) => {
    for (const m of line.matchAll(/\b([RA]-\d+(?:\.\d+)?)(?![\d.]*\d)/g)) if (!defined.has(m[1])) fail(`${BP}:${n + 1} points at ${m[1]}, which ${RM} does not define`);
  });
}
const open = items.filter((i) => !i.done);
const citedBy = (needle, pool) => pool.filter((i) => (i.source ?? '').includes(needle) || (i.what ?? '').includes(needle));
const wordCited = (re, pool) => pool.filter((i) => re.test(i.source ?? ''));

// ---- 2. the defect log
const CI = 'reference/CONTINUOUS-IMPROVEMENT.md';
for (const line of read(CI).split('\n')) {
  const m = line.match(/^\| (\d+) \|/);
  if (!m) continue;
  const c = line.trim().replace(/^\||\|$/g, '').split(' | ').map((x) => x.trim());
  const later = [c[5], c[6], c[7]].join(' ');
  if (!/roadmap|next week|\blater\b/i.test(later)) continue;
  const d = `D${m[1]}`;
  if (!wordCited(new RegExp(`\\b${d}\\b`), items).length) fail(`defect ${d} is left for "${later.match(/roadmap|next week|later/i)[0]}" but no R-item cites ${d} in its Source`);
}

// ---- 2b. every defect has its lesson in reference/LESSONS.md (printed at every session start), or an open R-item to add it
const lessons = fs.existsSync(path.join(root, 'reference/LESSONS.md')) ? read('reference/LESSONS.md') : null;
if (lessons === null) fail('reference/LESSONS.md is missing (the lessons sheet printed with the laws)');
else for (const line of read(CI).split('\n')) {
  const m = line.match(/^\| (\d+) \|/);
  if (!m || /WITHDRAWN/.test(line)) continue;
  const d = `D${m[1]}`;
  if (new RegExp(`\\b${d}\\b`).test(lessons)) continue;
  if (open.some((i) => /LESSONS\.md/.test(i.source ?? '') && new RegExp(`\\b${d}\\b`).test(i.source ?? ''))) continue;
  fail(`defect ${d} has no line in reference/LESSONS.md and no open R-item to add one (Source: "reference/LESSONS.md ${d}")`);
}

// ---- 2c. every method file is in the methods index, or an open R-item says it must be added
const methodsIndex = read('reference/methods/README.md');
for (const f of fs.readdirSync(path.join(root, 'reference/methods'))) {
  if (!f.endsWith('.md') || f === 'README.md') continue;
  if (methodsIndex.includes(`\`${f}\``) || methodsIndex.includes(`(${f})`)) continue;
  if (citedBy(`reference/methods/${f}`, open).some((i) => /README/.test(i.source ?? ''))) continue;
  fail(`reference/methods/${f} is not listed in reference/methods/README.md`);
}

// ---- 3. known and allow lists
const listFiles = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.git', 'dist'].includes(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(known|allow)\.json$/.test(e.name)) listFiles.push(rel(p));
  }
})(path.join(root, 'src'));
listFiles.push('tools/perf/clipknown.json');
const size = (j) => (Array.isArray(j) ? j.length : Array.isArray(j.known) ? j.known.length : Object.keys(j).length);
for (const f of listFiles) {
  const j = JSON.parse(read(f));
  if (!size(j)) continue;
  if (!citedBy(f, open).length) fail(`${f} still lists ${size(j)} known defects, but no open R-item cites it in its Source`);
}
const limits = JSON.parse(read('tools/perf/limits.json'));
if ((limits.art?.knownOver4096?.length || limits.blends?.allowlist?.length) && !citedBy('tools/perf/limits.json', open).length)
  fail('tools/perf/limits.json has known breaches (art.knownOver4096 / blends.allowlist), but no open R-item cites it');
for (const g of new Set(JSON.parse(read('tools/perf/clipknown.json')).known.map((k) => k.group.match(/^G\d+/)?.[0] ?? k.group))) {
  if (!wordCited(new RegExp(`clipknown ${g}\\b`), open).length) fail(`clipknown group ${g} has no open R-item (cite it as "clipknown ${g}")`);
}
for (const k of JSON.parse(read('src/game/playerText.known.json')).known) {
  if (!citedBy(k.key, open).length) fail(`playerText.known "${k.key}" has no open R-item citing that key`);
}

// ---- 4. NEXT.md files
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name === 'NEXT.md' && !citedBy(rel(p).replace(/^reference\/(prop-sheets\/qa-notes\/|qa-reports\/)?/, ''), items).length)
      fail(`${rel(p)} has no R-item that cites it`);
  }
})(path.join(root, 'reference'));

// ---- 5. done items name real proof
const head = tryGit('rev-parse', 'HEAD');
if (!head) { console.log('roadmap check: not a git checkout: FAIL'); process.exit(2); }
if (tryGit('rev-parse', '--is-shallow-repository') === 'true') { console.log('roadmap check: shallow clone, proofs cannot be checked (fetch-depth 0): FAIL'); process.exit(2); }
const merged = new Set((tryGit('log', '--format=%s', 'HEAD') ?? '').split('\n').map((s) => s.match(/^Merge pull request #(\d+) from/)?.[1]).filter(Boolean));
for (const it of items.filter((i) => i.done)) {
  const prs = [...it.proof.matchAll(/PR #(\d+)/g)].map((m) => m[1]);
  const shas = [...it.proof.matchAll(/\b([0-9a-f]{7,40})\b/g)].map((m) => m[1]);
  if (!prs.length && !shas.length) { fail(`${it.id} is done but names no PR or commit`); continue; }
  for (const n of prs) if (!merged.has(n)) fail(`${it.id}: PR #${n} has no merge commit in this history (never merged?)`);
  for (const s of shas) {
    // a commit counts when it is in this history, or on a branch this clone knows (work merged on the lead's branch first)
    if (tryGit('merge-base', '--is-ancestor', s, 'HEAD') !== null) continue;
    if (tryGit('cat-file', '-e', `${s}^{commit}`) !== null && (tryGit('for-each-ref', '--contains', s, '--count=1', 'refs/remotes', 'refs/heads') ?? '') !== '') continue;
    fail(`${it.id}: commit ${s} is not in this history or on any branch`);
  }
}

// ---- totals (the estimate's table comes from these)
const days = { S: 0.5, M: 1.5, L: 4 };
const by = new Map();
const helperWork = (i) => !/^Matt\b/.test(i.owner ?? '') && !/^R-149 /.test(i.area);
for (const i of open.filter(helperWork)) {
  const a = by.get(i.area) ?? { S: 0, M: 0, L: 0, days: 0 };
  a[i.size] = (a[i.size] ?? 0) + 1;
  a.days += i.hours || 0;
  by.set(i.area, a);
}
let tot = 0;
console.log(`roadmap: ${open.length} open, ${items.length - open.length} done`);
for (const [a, c] of by) {
  const d = c.days;
  tot += d;
  console.log(`  ${a}: S${c.S} M${c.M} L${c.L} = ${d} helper hours`);
}
const byTier = { 'Day 1': 0, Important: 0, 'Parking lot': 0, Matt: 0 };
for (const i of open.filter(helperWork)) byTier[(i.tier ?? '').match(/^(Day 1|Important|Parking lot|Matt)/)?.[1] ?? 'Matt'] += i.hours || 0;
console.log(`  by tier (helper hours, measured, R-12): Day 1 ${byTier['Day 1']}, Important ${byTier.Important}, Parking lot ${byTier['Parking lot']}, Matt's call ${byTier.Matt}`);
console.log(`  all: ${tot} helper hours (Matt's own items and the decisions left out: ${open.filter((i) => !helperWork(i)).length})`);

for (const f of fails) console.log(`✗ ${f}`);
console.log(fails.length ? `FAIL (${fails.length})` : 'PASS');
process.exit(fails.length ? 1 : 0);
