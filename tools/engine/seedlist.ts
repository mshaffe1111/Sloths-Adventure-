// A rolled stage's proven-seed list (gen2/seedList.ts; the lead, 11-06): build seeds 1, 2, 3, ... on both settings and keep each that lays
// cleanly on both (no gen2.errors), until --count are kept; write them to the stage's own list file, src/game/gen2/proven/seeds-<stage>.ts,
// and its line in src/game/gen2/provenIndex.ts (seedlistFile.ts; R-165.112: a list is its own lazy chunk, never in the main script). Each kept seed's quiet line is
// REPORTED (the lead, 10:35 AM: it binds once FR9's floor data is in, then the list is rebuilt under it): the longest quiet stretch on
// Normal (era route + deadTime), the goal run-out excluded by name ('goal run-out, outro': the supervisor's ruling), and the outro's
// length printed so a run-out that grows into a padded walk shows.
//   npx tsx tools/engine/seedlist.ts 1-1 [--count 300]     write the list
//   npx tsx tools/engine/seedlist.ts 1-1 --check            every listed seed still clean on both settings; at least SEED_LIST_MIN; exit 1 if not
import fs from 'node:fs';
import '../../src/game/headlessDom.ts';
import { generateAllLevels } from '../../src/game/worldsData.ts';
import { buildGen2Stage, keptFoes } from '../../src/game/gen2/pipeline.ts';
import { w1Finish, w1World } from '../../src/game/gen2/worlds/w1.ts';
import { listVersion, loadSeedList, packPlan, provenList, seedListError, provenSeeds, QUIET_MAX, seedListBreaches, SEED_LIST_MIN, stageParts } from '../../src/game/gen2/seedList.ts';
import { PROVEN_INDEX } from '../../src/game/gen2/provenIndex.ts';
import { listFile, writeSeedList } from './seedlistFile.ts';
import { firstRunVerdicts } from '../../src/game/gen2/verdicts.ts';
import type { FirstRunLayout } from '../../src/game/gen2/verdicts.types.ts';
import { createHash } from 'node:crypto';
import { withGoals } from '../../src/game/goals.ts';
import { pickRoute } from '../inspect/eraRoll.ts';
import { deadTime, NORMAL_GAP } from '../inspect/analyze.ts';
import type { WorldKit } from '../../src/game/gen2/types.ts';

const KITS: Record<string, () => WorldKit> = { '1-1': w1World };
const id = process.argv[2];
const arg = (k: string, d: string) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const kit = KITS[id];
if (!kit) { console.error(`seedlist: no rolled kit for "${id}" (KITS)`); process.exit(2); }
const cfg = generateAllLevels().find((l) => l.id === id)!;

if (process.argv.includes('--check')) {
  // (the list is its own file, loaded as the game loads it, seedList.ts loadSeedList: a file that does not load, or is not the one the
  // index names, fails here by name. Writing a list, below, needs no old list)
  if (!(await loadSeedList(id))) { console.log(`seedlist ${id}: FAIL\n  the list did not load: ${seedListError(id) ?? 'no list for this stage in provenIndex.ts'}`); process.exit(1); }
  const L = provenList(id);
  const b = seedListBreaches(cfg, kit, provenSeeds(id), SEED_LIST_MIN, L ? { dict: L.dict, plans: L.plans } : undefined);
  // (the quiet line BINDS, the lead 11-06: every listed seed's longest quiet stretch on Normal, the outro excluded, at most QUIET_MAX s)
  for (const seed of provenSeeds(id)) { const q = quietOf(buildGen2Stage({ config: cfg, kit: kit(), seed, difficulty: 'normal' })).quiet; if (q > QUIET_MAX) b.push(`${id} seed ${seed}: ${q} s quiet, over the line ${QUIET_MAX} s (the outro excluded)`); }
  if (id === '1-1') for (const seed of provenSeeds(id)) if (!dresses(...(['normal', 'easy'] as const).map((difficulty) => buildGen2Stage({ config: cfg, kit: kit(), seed, difficulty })))) b.push(`${id} seed ${seed}: too few squirrels find a spot (w1Finish)`);
  if (L && L.plans.length !== L.seeds.length) b.push(`${id}: ${L.seeds.length} seeds but ${L.plans.length} plans`);
  // (the index, all the main script holds of the list, names this very list: its count and its version)
  const ix = PROVEN_INDEX[id];
  if (L && (!ix || ix.n !== L.seeds.length || ix.version !== listVersion(L))) b.push(`${id}: provenIndex.ts says ${ix?.n} seeds, version ${ix?.version}; the list file holds ${L.seeds.length}, version ${listVersion(L)}: rebuild the list`);
  // (R-165.61: how many listed seeds the verdicts refuse, by name, on either setting; and the fixed first run against its lock, ADR-002)
  if (id === '1-1') {
    const by = new Map<string, number>();
    let refused = 0;
    for (const seed of provenSeeds(id)) {
      const n = new Set<string>();
      for (const difficulty of ['normal', 'easy'] as const) { const v = buildGen2Stage({ config: cfg, kit: kit(), seed, difficulty }).gen2.verdicts?.[difficulty]; if (v && !v.accepted) for (const f of v.failed) n.add(f.name); }
      if (n.size) refused++;
      for (const x of n) by.set(x, (by.get(x) ?? 0) + 1);
    }
    console.log(`seedlist ${id}: the verdicts refuse ${refused} of ${provenSeeds(id).length} listed seeds${by.size ? `; seeds refused by each name: ${[...by].sort((a, c) => c[1] - a[1]).map(([k, c]) => `${k} ${c}`).join(', ')}` : ''}`);
    b.push(...await firstRunBreaches());
  }
  console.log(b.length ? `seedlist ${id}: FAIL\n  ${b.slice(0, 20).join('\n  ')}` : `seedlist ${id}: PASS (${provenSeeds(id).length} seeds, each clean on both settings)`);
  process.exit(b.length ? 1 : 0);
}

/** the fixed first run of 1-1 (ADR-002; src/game/gen2/firstRun11.ts, C1's file): its layout built on both settings against its lock
 *  (seedList.ts stageParts, hashed), each drift by name (verdicts.ts firstRunVerdicts); none until the file exists */
async function firstRunBreaches(): Promise<string[]> {
  const file = new URL('../../src/game/gen2/firstRun11.ts', import.meta.url);
  if (!fs.existsSync(file)) { console.log(`seedlist ${id}: no first-run layout yet (src/game/gen2/firstRun11.ts, C1): first-run.drift not judged`); return []; }
  const mod = (await import(file.href)) as { FIRST_RUN_11?: FirstRunLayout };
  const L = mod.FIRST_RUN_11;
  if (!L) return [`${id}: firstRun11.ts exports no FIRST_RUN_11`];
  const built: Partial<Record<'normal' | 'easy', string>> = {};
  for (const difficulty of ['normal', 'easy'] as const) {
    const st = buildGen2Stage({ config: cfg, kit: kit(), seed: L.seed, difficulty, replay: { seed: L.seed, plan: L.plan, rerolls: L.rerolls, foes: L.foes } });
    built[difficulty] = createHash('sha256').update(JSON.stringify(stageParts(st))).digest('hex').slice(0, 16);
    const v = st.gen2.verdicts?.[difficulty];
    if (v && !v.accepted) return [`${id} first run (seed ${L.seed}) ${difficulty}: verdict ${v.failed[0].name}: ${v.failed[0].line}`];
  }
  return firstRunVerdicts(L, built).map((v) => `${id} ${v.name}: ${v.line}`);
}

/** both settings' builds take their squirrels (w1Finish throws when fewer than SQUIRREL_MIN find a clear spot; it only dresses and marks the cut art, so the build is used as it is after) */
function dresses(...sts: Array<ReturnType<typeof buildGen2Stage>>): boolean {
  try { for (const st of sts) w1Finish(st as never); return true; } catch { return false; }
}

/** the quiet line, reported: the longest quiet stretch on Normal before the goal section's entry (the outro excluded), and the outro's px */
function quietOf(st: ReturnType<typeof buildGen2Stage>): { quiet: number; outro: number } {
  const goal = (st.gen2.sections as Array<{ phase: string; x0: number; x1: number }>).filter((q) => q.phase === 'goal').pop();
  const R = pickRoute(cfg.objectiveType, withGoals(st as never) as never);
  const dn = deadTime(R.used.br.beats, R.used.br.total, NORMAL_GAP, R.used.samples);
  const gx = goal ? goal.x0 : Infinity;
  let worst = 0;
  for (const d of dn.list) {
    const lo = Math.min(d.x0, d.x1), hi = Math.max(d.x0, d.x1);
    if (lo >= gx) continue;
    const share = hi > gx ? (gx - lo) / Math.max(1, hi - lo) : 1;
    worst = Math.max(worst, d.counted * share);
  }
  return { quiet: Math.round(worst * 10) / 10, outro: goal ? Math.round(goal.x1 - goal.x0) : 0 };
}

const want = Number(arg('--count', String(SEED_LIST_MIN)));
// (--quiet-max S: the quiet line BINDS, the lead 11-06: a seed is kept only when its longest quiet stretch, the outro excluded, is S s or
// less; the count of tries it took is printed)
const quietMax = Number(arg('--quiet-max', String(QUIET_MAX)));
let quietOut = 0;
const seeds: number[] = [], quiet: number[] = [], outro: number[] = [], plans: string[] = [], dict: string[] = [];
let tried = 0;
const t0 = Date.now();
// (parallel builds, the lead 11-06: --worker i/n tries only seeds where seed % n === i, keeps --count / n of them and writes them to
// --part FILE (no list file), over --from..--to (default 1..count x 200); --merge a.json,b.json,... re-lays every seed of the union (the same filters) and writes the list from them,
// lowest seed first; with --in-order, in the files' own order (to add seeds to a list without moving its entries: a play's layout variant
// N is the list's N-th seed, so the first run, the QA rolls and the bots' calibration stay where they are))
const worker = arg('--worker', ''), part = arg('--part', ''), merge = arg('--merge', '');
const [wi, wn] = worker ? worker.split('/').map(Number) : [0, 1];
const keep = worker ? Math.ceil(want / wn) : want;
const given = merge ? merge.split(',').flatMap((f) => JSON.parse(fs.readFileSync(f, 'utf8')) as number[]) : null;
if (given && new Set(given).size !== given.length) { console.error('seedlist: --merge was given a seed twice'); process.exit(2); }
const only = given && (process.argv.includes('--in-order') ? given : given.sort((a, b) => a - b));
const tries = only ?? function* () { for (let seed = Number(arg('--from', '1')); seed < Number(arg('--to', String(want * 200))); seed++) if (seed % wn === wi) yield seed; }();
for (const seed of tries) { // (1-1's promises and the quiet line keep few rolls, the lead's 0.9.5 rulings)
  if (seeds.length >= keep) break;
  tried++;
  const n = buildGen2Stage({ config: cfg, kit: kit(), seed, difficulty: 'normal' });
  if (n.gen2.errors?.length) continue;
  const e = buildGen2Stage({ config: cfg, kit: kit(), seed, difficulty: 'easy' });
  if (e.gen2.errors?.length) continue;
  // (1-1's player promises, the lead 11-06, and every verdict, R-165.61: judged by the pipeline on each setting, PROMISES_11 among them,
  // so a refused roll already carries them in gen2.errors above; read here by name, never by a substring)
  if ([n, e].some((s, i) => s.gen2.verdicts?.[i ? 'easy' : 'normal']?.accepted === false)) continue;
  // (1-1's squirrels, the lead 11-06: Play finishes the roll with w1Finish, which throws when too few find a spot; such a roll is never listed)
  if (id === '1-1' && !dresses(n, e)) continue;
  const q = quietOf(n);
  if (q.quiet > quietMax) { quietOut++; continue; }
  seeds.push(seed); quiet.push(q.quiet); outro.push(q.outro);
  plans.push(packPlan({ seed: n.gen2.seed, rerolls: n.gen2.rerolls, plan: n.gen2.plan, foes: [...keptFoes(n)] }, dict));
}
if (part) {
  fs.writeFileSync(part, JSON.stringify(seeds));
  console.log(`seedlist ${id} worker ${worker}: ${seeds.length} kept of ${tried} tried, ${((Date.now() - t0) / 1000).toFixed(0)} s -> ${part}`);
  process.exit(0);
}
const bytes = writeSeedList(id, { dict, seeds, plans, quiet, outro });
console.log(`  the list file ${listFile(id)}: ${bytes} bytes, its own chunk (the main script holds only its line in provenIndex.ts)`);
const sorted = [...quiet].sort((a, b) => a - b), med = sorted[Math.floor(sorted.length / 2)] ?? 0;
console.log(`seedlist ${id}: ${seeds.length} proven of ${tried} tried (${((seeds.length / tried) * 100).toFixed(0)}%), ${((Date.now() - t0) / 1000).toFixed(0)} s${Number.isFinite(quietMax) ? `; the quiet line bound at ${quietMax} s: ${quietOut} clean seeds over it left out` : ""}`);
console.log(`  quiet line (REPORTED, outro excluded; binds at FR9): longest ${sorted[sorted.length - 1]} s, median ${med} s, under 4 s on ${quiet.filter((q) => q <= 4).length} of ${seeds.length}`);
console.log(`  outro (goal section): ${Math.min(...outro)}-${Math.max(...outro)} px`);
