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
//   stage lines engine-runs' own measures called as they are: dump.ts -> layout.py (per view), support.py (float), ideas.py, measure2.py
//   stills      a dev build, served, and engine-runs' stills-at.mjs (layout 1, Normal, both ways) at the start, forks, double teach, seed, end
// Not in this step: the stage map (no tool exists); the report names it NOT RUN.
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
import { supportCheck } from '../../src/game/mixer/support.ts';
import { landingKind } from '../../src/game/mixer/catalog.ts';

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
const linesShown: string[] = [];
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

// 4c. the rest of the stage's lines, on engine-runs' own measures, called as they are (the lead, 11-05: never re-implemented):
// tools/engine/runs/dump.ts -> layout.py (per phone view), support.py (float share), ideas.py (ideas), CP1's measure2.py (floor numbers)
const notMeasured: string[] = [];
if (ref?.view) {
  const tmp = fs.mkdtempSync('/tmp/stage-runs-');
  const dumpFile = path.join(tmp, 'dump.json');
  const d = spawnSync('npx', ['tsx', 'tools/engine/runs/dump.ts', process.cwd(), 'mix', id, String(N)], { encoding: 'utf8', maxBuffer: 1 << 30 });
  fs.writeFileSync(dumpFile, d.stdout);
  const py = (script: string, extra: string[] = [], cwd = process.cwd()) => spawnSync('python3', ['-I', path.resolve(script), ...extra, dumpFile], { encoding: 'utf8', cwd }).stdout ?? '';
  const layout = py('tools/engine/runs/layout.py', [path.resolve('reference/engine/cp1')]);
  const support = py('tools/engine/runs/support.py');
  const ideas = py('tools/engine/runs/ideas.py');
  fs.mkdirSync(path.join(tmp, 'cp1'));
  const m2 = py('reference/engine/cp1/measure2.py', [], tmp);
  const num = (txt: string, re: RegExp) => { const m = txt.match(re); return m ? Number(m[1]) : NaN; };
  const bad: string[] = [];
  const line = (what: string, v: number, ok: (x: number) => boolean, want: string) => { if (Number.isNaN(v)) bad.push(`${what}: not measured (the tool printed no value)`); else if (!ok(v)) bad.push(`${what}: ${v}, line ${want}`); return `${what} ${v}`; };
  const shown: string[] = [];
  for (const set of ['normal', 'easy']) {
    const row = layout.split('\n').find((l) => l.includes(`mix ${id} ${set}: upright pickups`)) ?? '';
    const V = ref.view;
    shown.push(line(`${set} upright pickups`, num(row, /upright pickups (\d+)/), (x) => x <= V.pickupsUpright, `<= ${V.pickupsUpright}`));
    shown.push(line(`${set} sideways pickups`, num(row, /sideways pickups (\d+)/), (x) => x <= V.pickupsSideways, `<= ${V.pickupsSideways}`));
    shown.push(line(`${set} upright hazard/animal kinds`, num(row, /upright hazard\/animal kinds (\d+)/), (x) => x <= V.hazardKinds, `<= ${V.hazardKinds}`));
    shown.push(line(`${set} sideways hazard/animal kinds`, num(row, /sideways hazard\/animal kinds (\d+)/), (x) => x <= V.hazardKinds, `<= ${V.hazardKinds}`));
    shown.push(line(`${set} upright standing kinds`, num(row, /upright standing kinds (\d+)/), (x) => x <= V.standingKinds, `<= ${V.standingKinds}`));
    shown.push(line(`${set} sideways standing kinds`, num(row, /sideways standing kinds (\d+)/), (x) => x <= V.standingKinds, `<= ${V.standingKinds}`));
    shown.push(line(`${set} upright views with play in the upper half`, num(row, /upper half ([\d.]+)/), (x) => x >= V.upperHalfMin, `>= ${V.upperHalfMin}`));
    const sup = support.split('\n').find((l) => l.startsWith(`mix ${id} ${set}: float`)) ?? '';
    if (ref.floatMax !== undefined) shown.push(line(`${set} float share`, num(sup, /float ([\d.]+)/), (x) => x <= ref.floatMax!, `<= ${ref.floatMax}`));
    const ide = ideas.split('\n').find((l) => l.startsWith(`mix ${id} ${set}: tagger ideas`)) ?? '';
    if (ref.ideasMin !== undefined) shown.push(line(`${set} ideas`, num(ide, /tagger ideas median (\d+)/), (x) => x >= ref.ideasMin!, `>= ${ref.ideasMin}`));
    const m2l = m2.split('\n'); const mi = m2l.findIndex((l) => l.startsWith(`== mix ${id} ${set}:`)); const mrow = mi >= 0 ? m2l[mi + 1] : '';
    const up = num(mrow, /up=(\d+)/), flat = num(mrow, /flat=(\d+)/), down = num(mrow, /down=(\d+)/);
    if (ref.upDownMin !== undefined) shown.push(line(`${set} landings up or down`, Math.round(((up + down) / (up + flat + down)) * 1000) / 1000, (x) => x >= ref.upDownMin!, `>= ${ref.upDownMin}`));
    if (ref.newEveryPxMax !== undefined) shown.push(line(`${set} something new every (px, mean)`, num(mrow, /newMeanPx=(\d+)/), (x) => x <= ref.newEveryPxMax!, `<= ${ref.newEveryPxMax}`));
  }
  // (two lines no engine-runs tool prints, computed from the same dump: CP1's kinds (measure2.py kind) and the mixer's own idea order)
  type DP = { type: string; style?: string; soil: boolean };
  const rows: Array<{ setting: string; platforms: DP[]; mix?: Array<{ idea: string; job: string }> }> = JSON.parse(fs.readFileSync(dumpFile, 'utf8')).filter((r: { error?: string }) => !r.error);
  for (const set of ['normal', 'easy']) {
    const rs = rows.filter((r) => r.setting === set);
    if (ref.boughShareMax !== undefined) {
      const share = rs.map((r) => { const L = r.platforms.filter((q) => !q.soil); return L.filter((q) => q.type === 'fragile' || (q.style === 'branch' && q.type !== 'bouncy')).length / Math.max(1, L.length); }).sort((a, b) => a - b);
      const med = Math.round(share[Math.floor(share.length / 2)] * 1000) / 1000;
      shown.push(line(`${set} boughs + creaky share of landings`, med, (x) => x <= ref.boughShareMax!, `<= ${ref.boughShareMax}`));
    }
    // (the kinds count, R2 lesson 1: distinct surface kinds a build, CP1's kinds (measure2.py kind, line for line))
    if (ref.surfaceKindsMin !== undefined) {
      const kind = (q: DP & { type: string; style?: string; soil: boolean; creak?: unknown; catchL?: boolean; drift?: boolean; lily?: boolean; h: number }) => q.soil ? null : q.type === 'bouncy' ? 'mushroom' : q.drift || q.type === 'drift' ? 'drifting log' : q.type === 'fragile' ? (q.creak ? 'creaking limb' : 'snap twig') : q.style === 'canopy_bridge' ? 'bridge' : q.style === 'log' ? 'log' : q.style === 'branch' ? (q.catchL ? 'catch branch' : 'branch') : q.style === 'moss_stone' ? (q.h > 60 ? 'ground' : 'stone') : q.lily ? 'lily pad' : 'ground';
      const ks = rs.map((r) => new Set(r.platforms.map((q) => kind(q as never)).filter(Boolean)).size).sort((a, b) => a - b);
      const med = ks.length % 2 ? ks[(ks.length - 1) / 2] : (ks[ks.length / 2 - 1] + ks[ks.length / 2]) / 2;
      shown.push(line(`${set} surface kinds a build`, med, (x) => x >= ref.surfaceKindsMin!, `>= ${ref.surfaceKindsMin}`));
    }
    // (an idea laid twice in a row: two bursts back to back with the same idea; a fork's road pair counts as one entry)
    const twice = rs.map((r) => (r.mix ?? []).filter((e, i, m) => i > 0 && e.idea === m[i - 1].idea).length);
    const worst = Math.max(0, ...twice);
    shown.push(line(`${set} ideas twice in a row (worst build)`, worst, (x) => x === 0, '0'));
  }
  gate('stage lines (§E.2: per view, float, ideas, floor numbers, surface kinds)', bad);
  notMeasured.push('section kinds a build (gen2 meta, once 1-1 builds on gen2)', 'share of chunks cut from the old stage (gen2 meta, once 1-1 builds on gen2)');
  linesShown.push(...shown);
  fs.rmSync(tmp, { recursive: true, force: true });
}

// 5. the neighbour check: every other stage of the world, NB rolls each, against this stage's N Normal rolls
const world = cfg.worldIndex;
// (--plant: this stage itself joins its neighbours, a planted look-alike the check must fail, E4)
const others = [...levels.filter((l) => l.worldIndex === world && l.id !== id && !l.secret), ...(process.argv.includes('--plant') ? [{ ...cfg, id: `${id} (planted copy)` }] : [])];
const prof = (r: RollResult) => new Map(r.prof);
const nbBad: string[] = [];
const nbClosest: string[] = [];
const nbKnown: string[] = [];
const KNOWN_FILE = 'tools/engine/neighbourknown.json';
const known: string[] = fs.existsSync(KNOWN_FILE) ? JSON.parse(fs.readFileSync(KNOWN_FILE, 'utf8')).pairs : [];
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
  const fails = [...(worstCos > RULES.cosine ? [`cosine ${worstCos.toFixed(2)} over ${RULES.cosine}`] : []), ...(alikeAt ? [`a 20 s stretch plays alike (${alikeAt})`] : [])];
  // (the designer's ruling, ENGINE-SPEC c62a778d: judged against every engine-built stage; a live, old stage is reported, not judged, on a
  // known list that only shrinks, R-165.47: a live pair failing that is not on it is a FAIL, a listed pair that now passes is to delete)
  const built = !!specFor(o.id) || o.id.includes('planted');
  const key = `${id}~${o.id}`;
  if (built) for (const f of fails) nbBad.push(`${o.id}: ${f}`);
  else if (fails.length && !known.includes(key)) nbBad.push(`${o.id} (live): ${fails.join('; ')}, and not on ${KNOWN_FILE}: the list only shrinks`);
  else if (fails.length) nbKnown.push(`${o.id} (live, known): ${fails.join('; ')}`);
  else if (known.includes(key)) nbKnown.push(`${o.id} (live): passes now; take ${key} off ${KNOWN_FILE}`);
}
gate(`neighbours (judged: World ${world}'s engine-built stages; live ones reported against ${KNOWN_FILE}; ${NB} rolls each)`, nbBad);

// 5b. the new stage against the old one it replaces (CHUNK-POOL-BRIEF step 5): the neighbour rule against old 1-1's own 16 rolls, measured
// on main (tools/engine/old11-rolls.json); the share of each roll's chunks cut from old 1-1 is reported once the build carries its sections
const OLD_FILE = `tools/engine/old${id.replace('-', '')}-rolls.json`;
if (fs.existsSync(OLD_FILE)) {
  const old: { source: string; rolls: Array<{ variant: number; prof: Array<[string, number]>; wins: RollResult['wins'] }> } = JSON.parse(fs.readFileSync(OLD_FILE, 'utf8'));
  let worst = 0, alike = 0, pairs = 0, first = '';
  for (const r of rolls) for (const o of old.rolls) {
    pairs++;
    const c = cosine(prof(r), new Map(o.prof));
    if (c > worst) worst = c;
    if (looksAlike(r.wins, o.wins)) { alike++; first ||= `roll ${r.variant} vs old roll ${o.variant}`; }
  }
  const bad = [...(worst > RULES.cosine ? [`cosine ${worst.toFixed(2)} over ${RULES.cosine}`] : []), ...(alike ? [`${alike} of ${pairs} roll pairs with a 20 s stretch alike (first: ${first})`] : [])];
  nbClosest.push(`old ${id} (${old.source}): max cosine ${worst.toFixed(2)}, ${alike} of ${pairs} roll pairs alike`);
  gate(`against old ${id} (cosine < ${RULES.cosine}, no 20 s stretch alike; ${old.rolls.length} old rolls)`, bad);
}

// 5c. support: every landing on something that holds it (mixer/support.ts, the designer's labels: rocks never float, boughs on trunks)
{
  const bad: string[] = [];
  for (let v = 1; v <= N; v++) {
    const st = buildRoll(cfg, v) as never;
    const { breaches } = supportCheck(st, world);
    for (const b of breaches.slice(0, 2)) bad.push(`layout ${v}: ${b.kind} at x ${Math.round(b.x)} (${b.why})`);
    if (breaches.length > 2) bad.push(`layout ${v}: and ${breaches.length - 2} more`);
  }
  gate(`support (${N} layouts, Normal)`, bad);
}

// 5d. the element gate: every landing a kind the library knows, and of this world (mixer/catalog.ts LANDINGS, the designer's LABELS.md)
{
  const bad: string[] = [];
  for (let v = 1; v <= N; v++) {
    const st = buildRoll(cfg, v) as unknown as { platforms: Array<Parameters<typeof landingKind>[0]> };
    for (const p of st.platforms) {
      if ((p as { soil?: boolean }).soil) continue;
      const ks = landingKind(p);
      if (!ks.length) bad.push(`layout ${v}: piece ${p.id} at x ${Math.round(p.x)} (style ${p.style ?? '-'}, h ${p.height}) is no kind the library knows`);
      else if (!ks.some((k) => (k.worlds as readonly number[]).includes(world))) bad.push(`layout ${v}: piece ${p.id} at x ${Math.round(p.x)} is a ${ks[0].name}, not World ${world}'s`);
      if (bad.length > 8) break;
    }
  }
  gate(`elements (every landing a World ${world} kind, ${N} layouts)`, bad);
}

// 6. the stage's own tests
const [w, m] = id.split('-');
const testFile = `src/game/stage${w}${m}.test.ts`;
if (fs.existsSync(testFile)) {
  const t = spawnSync('npx', ['tsx', '--test', testFile], { encoding: 'utf8' });
  const fails = (t.stdout ?? '').split('\n').filter((l) => l.startsWith('not ok')).map((l) => l.replace(/^not ok \d+ - /, ''));
  gate(`tests (${testFile})`, fails, t.status === 0);
} else gate(`tests (${testFile})`, ['no test file for this stage'], false);

// 7. stills: a dev build served here, engine-runs' stills-at.mjs called as it is, layout 1, Normal, upright and sideways, at the start, each
// fork, the double teach, the golden seed and the end (the lead, 11-05: no stage reaches anyone without stills)
const stillsDir = path.join(OUT, `${id}-stills`);
const stillsDone: string[] = [];
if (!process.argv.includes('--no-stills')) {
  const st1 = buildRoll(cfg, 1) as unknown as { spawnX: number; exitTotemX: number; proto?: { beats: Array<[number, number, string]> }; collectibles: Array<{ type: string; x: number }> };
  const beats = st1.proto?.beats ?? [];
  const spots: Array<[string, number, string]> = [['start', st1.spawnX + 80, 'low']];
  for (const b of beats) if (/fork/.test(b[2].split(':')[0]) && !/crossings/.test(b[2])) spots.push([`fork-${b[2].includes('high road') ? 'high' : 'low'}`, b[0] + 120, b[2].includes('high road') ? 'high' : 'low']);
  const dbl = beats.find((b) => b[2].startsWith('teach double:'));
  if (dbl) spots.push(['double-teach', dbl[0] + 60, 'low']);
  const seed = st1.collectibles.find((c) => c.type === 'seed');
  if (seed) spots.push(['golden-seed', seed.x - 100, 'low']);
  spots.push(['end', st1.exitTotemX - 200, 'low']);
  const dist = fs.mkdtempSync('/tmp/stage-dist-');
  spawnSync('npx', ['vite', 'build', '--outDir', dist], { encoding: 'utf8', env: { ...process.env, NODE_ENV: 'development' } });
  if (!fs.existsSync(path.join(dist, 'index.html'))) gate('stills', ['the dev build made no index.html'], false);
  else {
    const port = 4700 + Math.floor(Math.random() * 200);
    const server = (await import('node:child_process')).spawn('python3', ['-m', 'http.server', String(port), '-d', dist], { stdio: 'ignore' });
    await new Promise((r) => setTimeout(r, 1200));
    fs.rmSync(stillsDir, { recursive: true, force: true });
    const pw = process.env.PW ?? '/opt/node-tools/node_modules/playwright/index.mjs';
    const shot = spawnSync('node', ['tools/engine/runs/stills-at.mjs', String(port), stillsDir, id, id, '1', ...spots.map(([, x, pick]) => `${Math.round(x)}:${pick}`)], { encoding: 'utf8', env: { ...process.env, PW: pw } });
    server.kill();
    const wrote = (shot.stdout ?? '').split('\n').filter((l) => l.startsWith('wrote')).length;
    const errs = (shot.stdout ?? '').split('\n').filter((l) => l.startsWith('ERR'));
    for (const [name, x] of spots) stillsDone.push(`${name}: x ${Math.round(x)}`);
    gate(`stills (${wrote} of ${spots.length * 2}, layout 1 Normal, upright and sideways, in ${stillsDir})`, [...(wrote === spots.length * 2 ? [] : [`${wrote} of ${spots.length * 2} written`]), ...errs]);
  }
  fs.rmSync(dist, { recursive: true, force: true });
}

// the report
const notRun = [...(process.argv.includes('--no-stills') ? ['stills (--no-stills)'] : []), 'stage map (no tool exists)', ...notMeasured];
const md = [`# ${id} ${spec.name}: stage report`, '', `\`npx tsx tools/engine/stage.ts ${id} --layouts ${N} --neighbours ${NB}\`, ${new Date().toISOString()}`, '',
  '| Gate | Result | Detail |', '|---|---|---|',
  ...gates.map((g) => `| ${g.name} | ${g.pass ? 'PASS' : '**FAIL**'} | ${g.detail.slice(0, 6).join('; ').replace(/\|/g, '/') || '-'}${g.detail.length > 6 ? `; and ${g.detail.length - 6} more` : ''} |`),
  ...notRun.map((n) => `| ${n} | NOT RUN | not in stage.ts yet |`), '',
  '## Stills', '', 'Judge them by eye, upright and sideways, before the stage is done: a PASS here means only that they were shot.', '', ...stillsDone.map((l) => `- ${l}`), '', '## Stage lines, measured (engine-runs tools)', '', ...linesShown.map((l) => `- ${l}`), '', '## Neighbours, closest', '', ...nbClosest.map((l) => `- ${l}`), '', '## Live neighbours, reported not judged (shrink-only known list, R-165.47)', '', ...(nbKnown.length ? nbKnown.map((l) => `- ${l}`) : ['- none failing']), ''].join('\n');
fs.mkdirSync(OUT, { recursive: true });
const file = path.join(OUT, `${id}.md`);
fs.writeFileSync(file, md + '\n');
const bad = gates.filter((g) => !g.pass);
console.log(`stage.ts ${id}: ${gates.length - bad.length}/${gates.length} gates pass${bad.length ? `; FAIL: ${bad.map((g) => g.name.split(' (')[0]).join(', ')}` : ''}; report ${file}`);
process.exit(bad.length ? 1 : 0);
