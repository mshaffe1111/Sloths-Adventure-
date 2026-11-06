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
import { roll11Seed, setPick11 } from '../../src/game/testlink1_1.ts';
import { cameraReachBreaches } from '../../src/game/cameraReach.ts';
import { endAboveWindow, rawTextIds, seedPromise, teachOrder } from '../../src/game/storyChecks.ts';
import { dotLine } from '../../src/game/dotLines.ts';
import { stageVariety, varietyBreaches, VARIETY_BARS } from '../../src/game/stageVariety.ts';
import { buildGen2Stage } from '../../src/game/gen2/pipeline.ts';
import { w1World } from '../../src/game/gen2/worlds/w1.ts';
import { asQaBuildForTest } from '../../src/game/playRecorder.ts';
import { landingKind } from '../../src/game/mixer/catalog.ts';
import { dressOverDoor, dressThroughPlatform, propBreaches } from '../../src/game/mixer/propSupport.ts';
import { stillSpots } from '../../src/game/mixer/stillSpots.ts';
import { distinctTokens, overlapSummary } from '../../src/game/mixer/codeVariety.ts';
import { nodePieceBreaches, v19Breaches, type RealisedNode } from '../../src/game/mixer/nodePieces.ts';
import { botRun } from '../validate/play.ts';

const arg = (k: string, d: string) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const id = process.argv[2];
const N = Number(arg('--layouts', '16'));
const NB = Number(arg('--neighbours', '4'));
const OUT = arg('--out', 'reference/engine/stage-reports');
// (--roll A|B|C: 1-1 as the test link's picker builds it, gen2 from World 1's kit on that roll's seed (testlink1_1.ts); every layout is
// the same roll, so run it with --layouts 1. TEST-LINK ONLY, goes with the picker)
const ROLL = arg('--roll', '');
if (ROLL) {
  if (id !== '1-1' || !['A', 'B', 'C'].includes(ROLL)) { console.error('stage.ts: --roll A|B|C is for 1-1 only'); process.exit(2); }
  asQaBuildForTest(true); setPick11(ROLL as 'A' | 'B' | 'C');
}
const spec = id ? specFor(id) : undefined;
if (!spec) { console.error(`stage.ts: no spec for "${id}" (mixer/stages.ts SPECS)`); process.exit(2); }
const levels = generateAllLevels();
const cfg = levels.find((l) => l.id === id)!;
// (fail-closed, the red team's RT-ENGINE #1: every build this run measures is the picked roll, or the run stops here; every child process
// below gets the pick and reports the seed it built, and one that cannot is a FAIL, never a pass on the mixer's 1-1)
const gen2Of = <T,>(st: unknown): T | undefined => { const q = st as { gen2?: T; proto?: { gen2?: T } }; return q.gen2 ?? q.proto?.gen2; };
const ROLL_SEED = ROLL ? roll11Seed(ROLL as 'A' | 'B' | 'C') : null;
if (ROLL) {
  for (const easy of [false, true]) {
    const got = gen2Of<{ seed?: number }>(buildRoll(cfg, 1, easy))?.seed;
    if (got !== ROLL_SEED) { console.error(`stage.ts --roll ${ROLL}: the ${easy ? 'Easy' : 'Normal'} build measured seed ${got ?? 'none (not gen2)'}, not ${ROLL_SEED}: stopped`); process.exit(1); }
  }
}
const ROLL_ENV = ROLL ? { ...process.env, STAGE_ROLL: ROLL, STAGE_SEED: String(ROLL_SEED) } : process.env;
type Gate = { name: string; pass: boolean; detail: string[] };
const gates: Gate[] = [];
const linesShown: string[] = [];
const gate = (name: string, detail: string[], pass = detail.length === 0) => { gates.push({ name, pass, detail }); process.stderr.write(`${name}: ${pass ? 'PASS' : 'FAIL'}\n`); };
/** gen2's own record on a built stage: st.gen2 (gen2's Gen2Stage), proto.gen2 (the game's stage); undefined on a mixer stage */
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
  const TAG = ROLL ? `roll${ROLL}` : 'mix';
  const d = spawnSync('npx', ['tsx', 'tools/engine/runs/dump.ts', process.cwd(), TAG, id, String(N)], { encoding: 'utf8', maxBuffer: 1 << 30, env: ROLL_ENV });
  fs.writeFileSync(dumpFile, d.stdout);
  // (the dump's rows: one per layout and setting, each the stage asked for; under --roll each must have built the picked seed)
  const dumpBad: string[] = [];
  try {
    const rows = JSON.parse(d.stdout || '[]') as Array<{ layout: number; setting: string; roll?: string | null; gen2Seed?: number | null; error?: string }>;
    if (rows.length !== N * 2) dumpBad.push(`the dump has ${rows.length} rows, not ${N * 2}`);
    for (const r of rows) {
      if (r.error) dumpBad.push(`dump ${r.setting} ${r.layout}: ${r.error}`);
      else if (ROLL && (r.roll !== ROLL || r.gen2Seed !== ROLL_SEED)) dumpBad.push(`dump ${r.setting} ${r.layout}: built ${r.gen2Seed ?? 'the mixer (no gen2 seed)'}, not Roll ${ROLL} (seed ${ROLL_SEED})`);
    }
  } catch { dumpBad.push(`the dump printed no rows (exit ${d.status}): ${(d.stderr ?? '').slice(0, 160)}`); }
  if (dumpBad.length) gate(`stage lines: the dump measured the stage asked for (${TAG})`, dumpBad.slice(0, 6));
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
    const row = layout.split('\n').find((l) => l.includes(`${TAG} ${id} ${set}: upright pickups`)) ?? '';
    const V = ref.view;
    shown.push(line(`${set} upright pickups`, num(row, /upright pickups (\d+)/), (x) => x <= V.pickupsUpright, `<= ${V.pickupsUpright}`));
    shown.push(line(`${set} sideways pickups`, num(row, /sideways pickups (\d+)/), (x) => x <= V.pickupsSideways, `<= ${V.pickupsSideways}`));
    shown.push(line(`${set} upright hazard/animal kinds`, num(row, /upright hazard\/animal kinds (\d+)/), (x) => x <= V.hazardKinds, `<= ${V.hazardKinds}`));
    shown.push(line(`${set} sideways hazard/animal kinds`, num(row, /sideways hazard\/animal kinds (\d+)/), (x) => x <= V.hazardKinds, `<= ${V.hazardKinds}`));
    shown.push(line(`${set} upright standing kinds`, num(row, /upright standing kinds (\d+)/), (x) => x <= V.standingKinds, `<= ${V.standingKinds}`));
    shown.push(line(`${set} sideways standing kinds`, num(row, /sideways standing kinds (\d+)/), (x) => x <= V.standingKinds, `<= ${V.standingKinds}`));
    shown.push(line(`${set} upright views with play in the upper half`, num(row, /upper half ([\d.]+)/), (x) => x >= V.upperHalfMin, `>= ${V.upperHalfMin}`));
    const sup = support.split('\n').find((l) => l.startsWith(`${TAG} ${id} ${set}: float`)) ?? '';
    if (ref.floatMax !== undefined) shown.push(line(`${set} float share`, num(sup, /float ([\d.]+)/), (x) => x <= ref.floatMax!, `<= ${ref.floatMax}`));
    const ide = ideas.split('\n').find((l) => l.startsWith(`${TAG} ${id} ${set}: tagger ideas`)) ?? '';
    if (ref.ideasMin !== undefined) shown.push(line(`${set} ideas`, num(ide, /tagger ideas median (\d+)/), (x) => x >= ref.ideasMin!, `>= ${ref.ideasMin}`));
    const m2l = m2.split('\n'); const mi = m2l.findIndex((l) => l.startsWith(`== ${TAG} ${id} ${set}:`)); const mrow = mi >= 0 ? m2l[mi + 1] : '';
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
      // (per roll, the lead's 4:30 PM line: every build at or under the float floor, so the worst roll is judged, never the median)
      const worst = Math.round(share[share.length - 1] * 1000) / 1000;
      shown.push(line(`${set} boughs + creaky share of landings (worst build)`, worst, (x) => x <= ref.boughShareMax!, `<= ${ref.boughShareMax} every build`));
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
  notMeasured.push('cadence: section ratings ramp and cool (src/game/cadence.ts, on the gen2 build\'s slot ratings, once 1-1 builds on gen2)', 'every bough section starts in the stage\'s last third (its window [0.67, 1]: gen2 section ranges, once 1-1 builds on gen2)', 'section kinds a build (gen2 meta, once 1-1 builds on gen2)', 'share of chunks cut from the old stage (gen2 meta, once 1-1 builds on gen2)');
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

// 5c. support (mixer/support.ts, mixer/catalog.ts labels): a platform piece (bough, limb, shelf, log, plank) may stand in open air; a
// secondary object (a stone, a mushroom, a pad, a prop) over air fails (Matt, 2026-11-05: "if they're part of the platforms, they can
// float... I just don't want secondary objects like rocks and other things, lily pads, to be floating.")
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
// 5c'. secondary objects (Matt's rule's other half): every prop and dressing piece stands on what its family's label says holds it
// (mixer/propSupport.ts propBreaches, the judging tools/engine/propsupport.ts measured all 102 stages with), every layout, both settings;
// the landings' own secondaries (stones, mushrooms, lily pads) are the support gate's above
{
  const bad: string[] = []; const unl = new Set<string>(); const onS: Record<string, number> = {};
  let n = 0;
  for (const setting of ['normal', 'easy'] as const) for (let v = 1; v <= N; v++) {
    const st = buildRoll(cfg, v, setting === 'easy') as never;
    const b = propBreaches(st, { unlabelled: unl, onStructure: onS });
    n += b.length;
    for (const q of b.slice(0, 2)) bad.push(`${setting} ${v}: ${q.n} (${q.family}, ${q.list}) at x ${q.x}, foot ${q.b}: ${q.why}`);
    if (b.length > 2) bad.push(`${setting} ${v}: and ${b.length - 2} more`);
  }
  if (unl.size) bad.push(`props no label covers (cannot be judged, so not passed): ${[...unl].join(', ')}`);
  gate(`secondary objects over air (props and dressing, ${N} layouts x 2${n ? `, ${n} found` : ''})`, bad);
}
// 5c'-door. nothing dressed over the way out (the lead, 11-05): no dressing piece over the exit door (mixer/propSupport.ts dressOverDoor)
{
  const bad: string[] = [];
  for (const setting of ['normal', 'easy'] as const) for (let v = 1; v <= N; v++) {
    const st = buildRoll(cfg, v, setting === 'easy');
    for (const d of dressOverDoor(st).slice(0, 2)) bad.push(`${setting} ${v}: ${d.n} (${d.list}) at x ${Math.round(d.x)} over the door`);
    // (and nothing dressed through a thin platform it does not stand on: mixer/propSupport.ts dressThroughPlatform)
    for (const d of dressThroughPlatform(st).slice(0, 2)) bad.push(`${setting} ${v}: ${d.n} (${d.list}) at x ${d.x}: ${d.why}`);
  }
  gate(`nothing dressed over the exit door or through a platform (${N} layouts x 2)`, bad);
}
// 5c'-variety. the stage variety measure (stageVariety.ts, the planner's: the realised pieces and the node code; it replaces era's h:J
// diversity as the judge, the lead 11-05 9:32 PM, Matt's choice A): over this stage's N layouts on Normal, and for 1-1 also over gen2 1-1's
// 16 rolls (World 1's kit, seeds 1-16: the rolls the game would pick from)
{
  const one = (rolls: Array<{ id: string; platforms: any[]; code?: string[] }>, what: string) => {
    const v = stageVariety(rolls);
    linesShown.push(`variety, ${what}: pieces distinct ${v.pieceDistinct.toFixed(3)} (line ${VARIETY_BARS.distinct}), inner min ${v.pieceInnerMin.toFixed(3)} (line ${VARIETY_BARS.inner})${v.codeDistinct !== undefined ? `, code distinct ${v.codeDistinct.toFixed(3)} (line ${VARIETY_BARS.codeDistinct})` : ''}`);
    gate(`variety, ${what} (stageVariety.ts: distinct, inner, repeat, code distinct, code run)`, varietyBreaches(rolls).slice(0, 8));
  };
  // (one roll, or a --roll run where every layout is the same roll, cannot be told from another: not run, never a pass)
  if (N < 2 || ROLL) notMeasured.push(`variety over this stage's layouts (${ROLL ? `--roll ${ROLL}: every layout is one roll` : 'one layout'})`);
  else one(Array.from({ length: N }, (_, i) => { const st = buildRoll(cfg, i + 1) as any; return { id: `layout ${i + 1}`, platforms: st.platforms, code: gen2Of<{ code?: string[] }>(st)?.code }; }), `${N} layouts`);
  if (id === '1-1') {
    const rolls: Array<{ id: string; platforms: any[]; code?: string[] }> = []; const threw: string[] = [];
    for (let seed = 1; seed <= 16; seed++) {
      try { const st: any = buildGen2Stage({ config: cfg, kit: w1World(), seed, difficulty: 'normal' }); rolls.push({ id: `seed ${seed}`, platforms: st.platforms, code: st.gen2?.code }); } catch (e) { threw.push(`seed ${seed}: ${String((e as Error).message).slice(0, 80)}`); }
    }
    one(rolls, `gen2 1-1, ${rolls.length} of 16 rolls built`);
    if (threw.length) linesShown.push(`variety, gen2 1-1: ${threw.length} rolls did not build: ${threw.join('; ')}`);
  }
}

// 5c'-sees. what the player sees (the red team, RT-ENGINE #1: Dot said "hint.1-1.double" on gen2 rolls): every line the stage puts on screen
// is words, never a raw text id (storyChecks.ts rawTextIds), every layout, both settings
{
  const bad: string[] = [];
  for (const setting of ['normal', 'easy'] as const) for (let v = 1; v <= N; v++) for (const b of rawTextIds(buildRoll(cfg, v, setting === 'easy') as never).slice(0, 3)) bad.push(`${setting} ${v}: ${b}`);
  gate(`what the player sees: Dot's lines are words, no raw text id (${N} layouts x 2)`, bad);
}

// 5c'-teach. TT4 (Round 7): every teach node says its line before the first piece that needs its move (storyChecks.ts teachOrder)
{
  const bad: string[] = [];
  for (const setting of ['normal', 'easy'] as const) for (let v = 1; v <= N; v++) { const st = buildRoll(cfg, v, setting === 'easy') as never; if (!gen2Of(st)) continue; for (const b of teachOrder(st, (i) => dotLine(i)?.old ?? undefined).slice(0, 3)) bad.push(`${setting} ${v}: ${b}`); }
  gate(`TT4: each teach line before the first piece that needs its move (${N} layouts x 2)`, bad);
}

// 5c'-story. two of 1-1's story promises (storyChecks.ts; Round 6, the supervisor's PASS, the lead 11-05 9:40 PM): V19b, the end log higher
// than the route where the bough window begins (net-zero versions may not flatten the climb), and the seed's promise (over 200 px up past
// a double, a mushroom within 260 below: stage11.test.ts), on every build
if (id === '1-1') {
  const badV: string[] = [], badS: string[] = [], shown: string[] = [];
  for (const setting of ['normal', 'easy'] as const) for (let v = 1; v <= N; v++) {
    const st = buildRoll(cfg, v, setting === 'easy') as any;
    const w = endAboveWindow(st);
    shown.push(`${setting} ${v}: window x ${w.windowX} y ${w.windowY}, end y ${w.endY}`);
    if (!w.pass) badV.push(`${setting} ${v}: the end log (y ${w.endY}) is not higher than the route where the bough window begins (x ${w.windowX}, y ${w.windowY})`);
    for (const b of seedPromise(st)) badS.push(`${setting} ${v}: ${b}`);
  }
  linesShown.push(`V19b: ${shown.join('; ')}`);
  gate(`V19b: the end log higher than where the bough window begins (${N} layouts x 2)`, badV);
  gate(`the seed's promise: over 200 px up, a mushroom within 260 below (${N} layouts x 2)`, badS);
}

// 5c'-reach. inside the camera's reach (the lead, 11-05, gen2 1-1 Roll B's end log and totem at y -237, off the top of the view): every
// platform, pickup, dressing piece and the totem where the clamped camera shows it, upright and sideways (cameraReach.ts)
{
  const bad: string[] = [];
  for (const setting of ['normal', 'easy'] as const) for (let v = 1; v <= N; v++) {
    const b = cameraReachBreaches(buildRoll(cfg, v, setting === 'easy'));
    for (const q of b.slice(0, 3)) bad.push(`${setting} ${v} ${q.view}: ${q.what} at x ${q.x}: ${q.why}`);
    if (b.length > 3) bad.push(`${setting} ${v}: and ${b.length - 3} more`);
  }
  gate(`inside the camera's reach (platforms, pickups, dressing, the totem; upright and sideways; ${N} layouts x 2)`, bad);
}

// 5c''. V18 (NODES.md §8.3, §8.0 PIECES): each realised node's pieces match its content row in the key (mixer/nodePieces.ts), from
// gen2's record (gen2.nodes: each node's token and x-range, the planner's), every layout, both settings
{
  const bad: string[] = [];
  let judged = 0;
  for (const setting of ['normal', 'easy'] as const) for (let v = 1; v <= N; v++) {
    const st = buildRoll(cfg, v, setting === 'easy');
    const nodes = gen2Of<{ nodes?: RealisedNode[] }>(st)?.nodes;
    if (!nodes) break; // (a build without gen2 meta: none of this stage's builds carry it)
    judged++;
    for (const b of nodePieceBreaches(st as never, cfg.worldIndex, nodes, { stage: id, climbOwner: id === '1-4' }).slice(0, 3)) bad.push(`${setting} ${v}: ${b}`);
    // (V19: an up-trend stage never loses height late; the trend from the world's brief for this stage)
    for (const b of v19Breaches(st as never, nodes, (gen2Of<{ brief?: { trend?: 'up' | 'down' | 'level' } }>(st)?.brief?.trend) ?? (id === '1-1' ? 'up' : 'level'))) bad.push(`${setting} ${v}: ${b}`);
  }
  if (judged) gate(`node pieces V18, and V19 (no late height lost on an up stage) (${judged} builds)`, bad);
  else notMeasured.push('node pieces, V18 (mixer/nodePieces.ts, on gen2.nodes: once 1-1 builds on gen2)');
}

// 5c'''. the node code (NODES.md §8; the planner's parser writes gen2.code, codeString, codeErrors, loosened): each roll's realised
// code in the report, V1-V17 as a gate (codeErrors), the loosened slots named, and the variety lines (mixer/codeVariety.ts: distinct
// tokens, 3-gram overlap between rolls and against the world's other gen2 stages). The variety lines have no pass line until the designer sets one
const codeRows: string[] = [];
{
  type G2 = { code?: string[]; codeString?: string; codeErrors?: string[]; loosened?: string[]; errors?: string[] };
  const codes: string[][] = [];
  const bad: string[] = [];
  const t0 = Date.now();
  for (const setting of ['normal', 'easy'] as const) for (let v = 1; v <= N; v++) {
    const g = gen2Of<G2>(buildRoll(cfg, v, setting === 'easy'));
    if (!g?.code) break;
    if (setting === 'normal') { codes.push(g.code); codeRows.push(`normal ${v}: \`${g.codeString ?? g.code.join(' ')}\``); }
    for (const e of g.codeErrors ?? []) bad.push(`${setting} ${v}: ${e}`);
    // (gen2.errors, the planner's: every loosened slot and every missing required section, each a breach)
    for (const e of g.errors ?? []) bad.push(`${setting} ${v}: ${e}`);
    // (a loosened slot is a FAIL, the lead 11-05, Law 22: the fix is more sections, never a looser rule; its line names the pieces missing)
    for (const l of g.loosened ?? []) { codeRows.push(`${setting} ${v} loosened: ${l}`); bad.push(`${setting} ${v}: loosened, add sections: ${l}`); }
  }
  if (codes.length) {
    const d = codes.map(distinctTokens).sort((x, y) => x - y);
    const self = overlapSummary(codes);
    linesShown.push(`node code: distinct tokens a roll ${d[0]}-${d[d.length - 1]}; 3-gram overlap between rolls mean ${self.mean.toFixed(2)}, worst ${self.max.toFixed(2)} (${self.pairs} pairs)`);
    const w = cfg.worldIndex;
    for (const o of levels.filter((l) => l.worldIndex === w && l.id !== id && !l.secret)) {
      const oc = Array.from({ length: NB }, (_, i) => gen2Of<G2>(buildRoll(o, i + 1))?.code).filter((c): c is string[] => !!c);
      if (oc.length) { const x = overlapSummary(codes, oc); linesShown.push(`node code vs ${o.id}: 3-gram overlap mean ${x.mean.toFixed(2)}, worst ${x.max.toFixed(2)}`); }
    }
    linesShown.push(`node code lines: ${((Date.now() - t0) / 1000).toFixed(0)} s`);
    gate(`node code (V1-V17, gen2.errors empty, no loosened slot, ${codes.length} x 2 rolls)`, bad);
  } else notMeasured.push('node code: per-roll code, V1-V17, distinct tokens and 3-gram overlap (gen2.code: once 1-1 builds on gen2)');
}

// 5d. REQUIRED-MOVE (NODES.md §1 `test`, R2 §2 L5: Nelson & Smith; Green et al. 2018): on each teach and test node, a bot without the
// node's move fails the node (it never gets past the node's end) and the full bot passes it. The bot is the first-timer
// (tools/validate/play.ts botRun), its limit `without` (no second jump, or every mushroom in the stretch plain solid), the way R2 §5
// tried noHide. A node whose move the bot cannot be limited in (run, jump) is listed, never passed
{
  const NBOT = Number(arg('--bot-layouts', '4'));
  const bad: string[] = [], shownRM: string[] = [], unjudged = new Set<string>();
  const t0 = Date.now();
  for (const setting of ['normal', 'easy'] as const) for (let v = 1; v <= NBOT; v++) {
    const st = buildRoll(cfg, v, setting === 'easy') as { meta?: { mix?: { explain: Array<{ node: number; job: string; x0: number; x1: number }> } } };
    const ex = st.meta?.mix?.explain;
    const nodes = new Map<number, { job: string; x0: number; x1: number; moves?: Array<'double' | 'bounce'> }>();
    const g2 = gen2Of<{ nodes?: Array<RealisedNode & { moves?: Array<'double' | 'bounce'> }> }>(st)?.nodes;
    if (g2) {
      // (gen2: each node's job from its token's job letter, its move from the move digit (2: the double) or the content letter (b: the
      // bounce); only those characters are read, NODES §8.0/§8.1; a twist (W) takes the node's own moves, else both of 1-1's)
      g2.forEach((q, i) => {
        const J = q.token[0], c = q.token[1], dbl = /^[A-Z][a-z]?2/.test(q.token);
        const move = dbl ? 'double' : c === 'b' ? 'bounce' : 'jump';
        if (J === 'T' || J === 'X') nodes.set(i + 1, { job: `${J === 'T' ? 'teach' : 'test'} ${move}`, x0: q.x0, x1: q.x1 });
        else if (J === 'W') nodes.set(i + 1, { job: `twist ${q.token}`, x0: q.x0, x1: q.x1, moves: q.moves ?? ['double', 'bounce'] });
      });
    } else if (ex) {
      for (const e of ex) { if (e.node < 0) continue; const q = nodes.get(e.node); nodes.set(e.node, q ? { job: q.job, x0: Math.min(q.x0, e.x0), x1: Math.max(q.x1, e.x1) } : { job: e.job, x0: e.x0, x1: e.x1 }); }
    } else { bad.push(`${setting} ${v}: no node ranges in the build (mixer meta.mix.explain or gen2.nodes)`); continue; }
    const full = botRun(id, v, setting);
    for (const [n, q] of nodes) {
      // (a twist with two answers, NODES §8.7 B5: without both moves the bot fails it, without either one alone it passes)
      if (/^twist\b/.test(q.job) && q.moves?.length === 2) {
        const both = botRun(id, v, setting, { without: { move: q.moves, x0: q.x0, x1: q.x1 } });
        if (both.run.end === 'shrine' || both.reachX >= q.x1) bad.push(`${setting} ${v} node ${n} (${q.job}): a bot without ${q.moves.join(' and ')} still gets past it (reached x ${both.reachX})`);
        for (const one of q.moves) { const r = botRun(id, v, setting, { without: { move: one, x0: q.x0, x1: q.x1 } }); if (r.run.end !== 'shrine' && r.reachX < q.x1) bad.push(`${setting} ${v} node ${n} (${q.job}): without ${one} alone the bot is stuck at x ${r.reachX}: the other answer does not work`); }
        shownRM.push(`${setting} ${v} n${n} twist ${q.moves.join('+')}`);
        continue;
      }
      const m = q.job.match(/^(teach|test) (\w+)/);
      if (!m) continue;
      const move = (g2 ? undefined : (spec.nodes[n - 1]?.teaches as string | undefined)) ?? m[2];
      if (move !== 'double' && move !== 'bounce') { unjudged.add(`${q.job} (no bot without ${move})`); continue; }
      const fullOK = full.run.end === 'shrine' || full.reachX >= q.x1;
      const lim = botRun(id, v, setting, { without: { move, x0: q.x0, x1: q.x1 } });
      const limFails = lim.run.end !== 'shrine' && lim.reachX < q.x1;
      if (move === 'double' && lim.doubled.inside > 0) bad.push(`${setting} ${v} node ${n} (${q.job}): the limit did not hold (${lim.doubled.inside} second jumps inside)`);
      if (!fullOK) bad.push(`${setting} ${v} node ${n} (${q.job}): the full bot stopped at x ${full.reachX}, before the node's end ${q.x1}`);
      if (!limFails) bad.push(`${setting} ${v} node ${n} (${q.job}, x ${q.x0}-${q.x1}): a bot without ${move} gets past it (${lim.run.end}, reached x ${lim.reachX}): the ${move} is not required`);
      shownRM.push(`${setting} ${v} n${n} ${move}: full ${fullOK ? 'passes' : 'stops'}, without ${limFails ? 'fails' : 'passes'}`);
    }
  }
  if (unjudged.size) notMeasured.push(...[...unjudged].map((u) => `required-move: ${u}`));
  linesShown.push(`required-move (${NBOT} layouts x 2, ${((Date.now() - t0) / 1000).toFixed(0)} s): ${shownRM.join('; ')}`);
  gate(`required move (teach and test nodes, ${NBOT} layouts x 2)`, bad);
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
// (1-1 builds on gen2 since 11-06 (Play): its own tests are gen2/stage11gen2.test.ts, which build Rolls A, B and C through the picker, the
// roll asked for among them)
const gen2Tests = id === '1-1';
const testFile = gen2Tests ? 'src/game/gen2/stage11gen2.test.ts' : `src/game/stage${w}${m}.test.ts`;
// (under --roll the stage's own tests cannot measure the roll: stage11.test.ts builds the mixer's 1-1 with buildProtoStage, whatever the
// pick; run, they would pass or fail the mixer for the roll. Fail-closed: a FAIL that says so, never the mixer's result)
if (ROLL && !gen2Tests) gate(`tests (${testFile})`, [`${testFile} builds the mixer's ${id} (buildProtoStage), not Roll ${ROLL} (seed ${ROLL_SEED}): not measured on the roll`], false);
else if (fs.existsSync(testFile)) {
  const t = spawnSync('npx', ['tsx', '--test', testFile], { encoding: 'utf8' });
  const fails = (t.stdout ?? '').split('\n').filter((l) => l.startsWith('not ok')).map((l) => l.replace(/^not ok \d+ - /, ''));
  gate(`tests (${testFile})`, fails, t.status === 0);
} else gate(`tests (${testFile})`, ['no test file for this stage'], false);

// 7. stills: a dev build served here, engine-runs' stills-at.mjs called as it is, layout 1, Normal, upright and sideways, at the start, each
// fork, the double teach, the golden seed and the end (the lead, 11-05: no stage reaches anyone without stills)
const stillsDir = path.join(OUT, `${id}-stills`);
const stillsDone: string[] = [];
if (!process.argv.includes('--no-stills')) {
  // (the spots: gen2's node meta when 1-1 builds on gen2, else the mixer's beats: mixer/stillSpots.ts)
  const spots = stillSpots(buildRoll(cfg, 1) as never);
  const dist = fs.mkdtempSync('/tmp/stage-dist-');
  spawnSync('npx', ['vite', 'build', '--outDir', dist], { encoding: 'utf8', env: { ...process.env, NODE_ENV: 'development' } });
  if (!fs.existsSync(path.join(dist, 'index.html'))) gate('stills', ['the dev build made no index.html'], false);
  else {
    const port = 4700 + Math.floor(Math.random() * 200);
    const server = (await import('node:child_process')).spawn('python3', ['-m', 'http.server', String(port), '-d', dist], { stdio: 'ignore' });
    await new Promise((r) => setTimeout(r, 1200));
    fs.rmSync(stillsDir, { recursive: true, force: true });
    const pw = process.env.PW ?? '/opt/node-tools/node_modules/playwright/index.mjs';
    const shot = spawnSync('node', ['tools/engine/runs/stills-at.mjs', String(port), stillsDir, id, id, '1', ...spots.map(([, x, pick]) => `${Math.round(x)}:${pick}`)], { encoding: 'utf8', env: { ...ROLL_ENV, PW: pw } });
    server.kill();
    const wrote = (shot.stdout ?? '').split('\n').filter((l) => l.startsWith('wrote')).length;
    const errs = (shot.stdout ?? '').split('\n').filter((l) => l.startsWith('ERR'));
    for (const [name, x] of spots) stillsDone.push(`${name}: x ${Math.round(x)}`);
    // (under --roll: both views must say they built the picked seed, ROLL-SEED <seed> <view>; a missing or other seed is a FAIL)
    const seeds = (shot.stdout ?? '').split('\n').filter((l) => l.startsWith('ROLL-SEED'));
    const rollBad = ROLL ? (['upright', 'sideways'].every((v) => seeds.includes(`ROLL-SEED ${ROLL_SEED} ${v}`)) ? [] : [`the stills did not build Roll ${ROLL} (seed ${ROLL_SEED}) in both views: ${seeds.join('; ') || 'no ROLL-SEED line'}`]) : [];
    gate(`stills (${wrote} of ${spots.length * 2}, layout 1 Normal, upright and sideways, in ${stillsDir})`, [...rollBad, ...(wrote === spots.length * 2 ? [] : [`${wrote} of ${spots.length * 2} written`]), ...errs]);
  }
  fs.rmSync(dist, { recursive: true, force: true });
}

// the report
const notRun = [...(process.argv.includes('--no-stills') ? ['stills (--no-stills)'] : []), 'stage map (no tool exists)', ...notMeasured];
// (fail-closed under --roll: whatever was not measured on the roll is a FAIL by name, never a gap in a pass)
if (ROLL) for (const n of notRun) gate(`not measured on Roll ${ROLL}: ${n}`, [`NOT RUN on the roll (seed ${ROLL_SEED})`], false);
const md = [`# ${id} ${spec.name}: stage report`, '', `\`npx tsx tools/engine/stage.ts ${id} --layouts ${N} --neighbours ${NB}\`, ${new Date().toISOString()}`, '',
  '| Gate | Result | Detail |', '|---|---|---|',
  ...gates.map((g) => `| ${g.name} | ${g.pass ? 'PASS' : '**FAIL**'} | ${g.detail.slice(0, 6).join('; ').replace(/\|/g, '/') || '-'}${g.detail.length > 6 ? `; and ${g.detail.length - 6} more` : ''} |`),
  ...notRun.map((n) => `| ${n} | NOT RUN | not in stage.ts yet |`), '',
  '## Node code, each roll (NODES.md §8)', '', ...(codeRows.length ? codeRows.map((l) => `- ${l}`) : ['- not built on gen2 yet']), '', '## Stills', '', 'Judge them by eye, upright and sideways, before the stage is done: a PASS here means only that they were shot.', '', ...stillsDone.map((l) => `- ${l}`), '', '## Stage lines, measured (engine-runs tools)', '', ...linesShown.map((l) => `- ${l}`), '', '## Neighbours, closest', '', ...nbClosest.map((l) => `- ${l}`), '', '## Live neighbours, reported not judged (shrink-only known list, R-165.47)', '', ...(nbKnown.length ? nbKnown.map((l) => `- ${l}`) : ['- none failing']), ''].join('\n');
fs.mkdirSync(OUT, { recursive: true });
const file = path.join(OUT, `${id}.md`);
fs.writeFileSync(file, md + '\n');
const bad = gates.filter((g) => !g.pass);
console.log(`stage.ts ${id}: ${gates.length - bad.length}/${gates.length} gates pass${bad.length ? `; FAIL: ${bad.map((g) => g.name.split(' (')[0]).join(', ')}` : ''}; report ${file}`);
process.exit(bad.length ? 1 : 0);
