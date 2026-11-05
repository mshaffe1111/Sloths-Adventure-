// One command per stage (R-165.8): build a stage from its spec on N layouts x both settings and run every gate on it, then write its report.
//   npx tsx tools/engine/stage.ts <id> [--layouts 16] [--neighbours 4] [--out reference/engine/stage-reports]
// Every measure is an existing one, imported, never a new one (the lead, 11-05):
//   spec        mixer/spec.ts checkSpec (moves taught before used, decks, theme, length floor)
//   level       tools/inspect/eraRoll.ts buildRoll + checkRoll: the level check, every build
//   length      stageTime.ts modelAll (fast): Normal inside the profile's band, Easy at or over its floor
//   lines       passLines.ts: the stage's measured reference row (1-1: old 1-1's medians on main), never its profile words
//   quiet       eraRoll.ts measureRoll longestQuiet <= RULES.quietMax ("Dead time")
//   neighbours  the 200-roll tool's sameness test (eraRoll.ts RULES): against every other stage of the world, no roll pair with a
//               3-gram cosine over RULES.cosine (analyze.ts cosine) or a 20 s stretch closer than LOOK.alike (lookalike.ts looksAlike)
//   tests       the stage's own test file (src/game/stage<w><m>.test.ts), run as the suite runs it
// Not in this step: stills, the stage map and the per-view measures (pickups and standing kinds per view, upper-half share). Those live in
// engine-runs' Python (tools/engine/runs/layout.py on CP1's measure2.py); the report names them NOT RUN until they are ported.
// Exit 1 on any FAIL.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import '../../src/game/headlessDom.ts';
import { generateAllLevels } from '../../src/game/worldsData.ts';
import { specFor } from '../../src/game/mixer/stages.ts';
import { checkSpec } from '../../src/game/mixer/spec.ts';
import { IDEAS } from '../../src/game/mixer/library.ts';
import { modelAll } from '../../src/game/stageTime.ts';
import { buildRoll, checkRoll, measureRoll, RULES, type RollResult } from '../inspect/eraRoll.ts';
import { cosine } from '../inspect/analyze.ts';
import { looksAlike } from '../inspect/lookalike.ts';
import { judgeLines, REFERENCE, splitsOf } from '../../src/game/passLines.ts';

const arg = (k: string, d: string) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const id = process.argv[2];
const N = Number(arg('--layouts', '16'));
const NB = Number(arg('--neighbours', '4'));
const OUT = arg('--out', 'reference/engine/stage-reports');
const spec = id ? specFor(id) : undefined;
if (!spec) { console.error(`stage.ts: no spec for "${id}" (mixer/stages.ts SPECS)`); process.exit(2); }
const levels = generateAllLevels();
const cfg = levels.find((l) => l.id === id)!;
type Gate = { name: string; pass: boolean; detail: string[] };
const gates: Gate[] = [];
const gate = (name: string, detail: string[], pass = detail.length === 0) => { gates.push({ name, pass, detail }); process.stderr.write(`${name}: ${pass ? 'PASS' : 'FAIL'}\n`); };
const range = (v: number[]) => (v.length ? `${Math.min(...v).toFixed(0)}-${Math.max(...v).toFixed(0)}` : '-');

// 1. the spec
gate('spec', checkSpec(spec, IDEAS as never));

// 2-4. every build, Normal and Easy
const levelBad: string[] = [], lenBad: string[] = [], quietBad: string[] = [];
const secs = { normal: [] as number[], easy: [] as number[] };
const rolls: RollResult[] = [];
const [lo, hi] = spec.profile.length.normal;
for (let v = 1; v <= N; v++) {
  const r = measureRoll(cfg, v, { bots: false } as never);
  rolls.push(r);
  if (!r.ok) levelBad.push(`normal ${v}: ${r.errors[0]}`);
  if (r.longestQuiet > RULES.quietMax) quietBad.push(`normal ${v}: ${r.longestQuiet.toFixed(1)} s quiet (max ${RULES.quietMax})`);
  const n = modelAll(buildRoll(cfg, v) as never).fast.total;
  secs.normal.push(n);
  if (n < lo || n > hi) lenBad.push(`normal ${v}: ${n.toFixed(0)} s (band ${lo}-${hi})`);
  const e = buildRoll(cfg, v, true);
  const ce = checkRoll(e);
  if (!ce.ok) levelBad.push(`easy ${v}: ${ce.errors[0]}`);
  const es = modelAll(e as never).fast.total;
  secs.easy.push(es);
  if (es < spec.profile.length.easyMin) lenBad.push(`easy ${v}: ${es.toFixed(0)} s (floor ${spec.profile.length.easyMin})`);
}
gate(`level check (${N} x 2)`, levelBad);
gate(`length (Normal ${range(secs.normal)} s in ${lo}-${hi}; Easy ${range(secs.easy)} s >= ${spec.profile.length.easyMin})`, lenBad);
gate(`quiet stretches (<= ${RULES.quietMax} s)`, quietBad);

// 4b. the stage's pass lines, from its measured reference row (passLines.ts), never from its profile words
const ref = REFERENCE[id];
if (ref) {
  const m = Array.from({ length: N }, (_, i) => splitsOf(buildRoll(cfg, i + 1) as never));
  const ss = m.map((q) => q.splits).sort((a, b) => a - b), tt = m.map((q) => q.twoRoad).sort((a, b) => a - b);
  gate(`pass lines (splits median ${ss[Math.floor(N / 2)]} >= ${ref.splitsMin}; two-road median ${tt[Math.floor(N / 2)]} >= ${ref.twoRoadMin})`, judgeLines(id, m));
} else gate('pass lines', ['no measured reference row for this stage (passLines.ts REFERENCE)'], false);

// 5. the neighbour check: every other stage of the world, NB rolls each, against this stage's N Normal rolls
const world = cfg.worldIndex;
// (--plant: this stage itself joins its neighbours, a planted look-alike the check must fail, E4)
const others = [...levels.filter((l) => l.worldIndex === world && l.id !== id && !l.secret), ...(process.argv.includes('--plant') ? [{ ...cfg, id: `${id} (planted copy)` }] : [])];
const prof = (r: RollResult) => new Map(r.prof);
const nbBad: string[] = [];
const nbClosest: string[] = [];
for (const o of others) {
  let worstCos = 0, alikeAt = '', alike = 0, pairs = 0;
  for (let v = 1; v <= NB; v++) {
    let ro: RollResult;
    try { ro = measureRoll(levels.find((l) => l.id === o.id) ?? cfg, v, { bots: false } as never); } catch (e) { nbBad.push(`${o.id} roll ${v} did not build: ${String((e as Error).message).slice(0, 80)}`); continue; }
    for (const r of rolls) {
      const c = cosine(prof(r), prof(ro));
      if (c > worstCos) worstCos = c;
      pairs++;
      if (looksAlike(r.wins, ro.wins)) { alike++; alikeAt ||= `${id} roll ${r.variant} vs ${o.id} roll ${v}`; }
    }
  }
  nbClosest.push(`${o.id}: max cosine ${worstCos.toFixed(2)}, ${alike} of ${pairs} roll pairs with a 20 s stretch alike${alikeAt ? ` (first: ${alikeAt})` : ''}`);
  if (worstCos > RULES.cosine) nbBad.push(`${o.id}: cosine ${worstCos.toFixed(2)} over ${RULES.cosine}`);
  if (alikeAt) nbBad.push(`${o.id}: a 20 s stretch plays alike (${alikeAt})`);
}
gate(`neighbours (World ${world}, ${others.length} stages x ${NB} rolls)`, nbBad);

// 6. the stage's own tests
const [w, m] = id.split('-');
const testFile = `src/game/stage${w}${m}.test.ts`;
if (fs.existsSync(testFile)) {
  const t = spawnSync('npx', ['tsx', '--test', testFile], { encoding: 'utf8' });
  const fails = (t.stdout ?? '').split('\n').filter((l) => l.startsWith('not ok')).map((l) => l.replace(/^not ok \d+ - /, ''));
  gate(`tests (${testFile})`, fails, t.status === 0);
} else gate(`tests (${testFile})`, ['no test file for this stage'], false);

// the report
const notRun = ['stills (upright and sideways)', 'stage map', 'per-view measures: pickups and standing kinds per view, upper-half share (engine-runs layout.py, not ported)'];
const md = [`# ${id} ${spec.name}: stage report`, '', `\`npx tsx tools/engine/stage.ts ${id} --layouts ${N} --neighbours ${NB}\`, ${new Date().toISOString()}`, '',
  '| Gate | Result | Detail |', '|---|---|---|',
  ...gates.map((g) => `| ${g.name} | ${g.pass ? 'PASS' : '**FAIL**'} | ${g.detail.slice(0, 6).join('; ').replace(/\|/g, '/') || '-'}${g.detail.length > 6 ? `; and ${g.detail.length - 6} more` : ''} |`),
  ...notRun.map((n) => `| ${n} | NOT RUN | not in stage.ts yet |`), '',
  '## Neighbours, closest', '', ...nbClosest.map((l) => `- ${l}`), ''].join('\n');
fs.mkdirSync(OUT, { recursive: true });
const file = path.join(OUT, `${id}.md`);
fs.writeFileSync(file, md + '\n');
const bad = gates.filter((g) => !g.pass);
console.log(`stage.ts ${id}: ${gates.length - bad.length}/${gates.length} gates pass${bad.length ? `; FAIL: ${bad.map((g) => g.name.split(' (')[0]).join(', ')}` : ''}; report ${file}`);
process.exit(bad.length ? 1 : 0);
