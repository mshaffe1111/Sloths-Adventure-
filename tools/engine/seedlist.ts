// A rolled stage's proven-seed list (gen2/seedList.ts; the lead, 11-06): build seeds 1, 2, 3, ... on both settings and keep each that lays
// cleanly on both (no gen2.errors), until --count are kept; write them to src/game/gen2/provenSeeds.ts. Each kept seed's quiet line is
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
import { packPlan, provenSeeds, QUIET_MAX, seedListBreaches, SEED_LIST_MIN } from '../../src/game/gen2/seedList.ts';
import { PROVEN_SEEDS } from '../../src/game/gen2/provenSeeds.ts';
import { floorlessGaps, promiseBreaches11 } from '../../src/game/gen2/promises11.ts';
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
  const L = PROVEN_SEEDS[id];
  const b = seedListBreaches(cfg, kit, provenSeeds(id), SEED_LIST_MIN, L ? { dict: L.dict, plans: L.plans } : undefined);
  // (the quiet line BINDS, the lead 11-06: every listed seed's longest quiet stretch on Normal, the outro excluded, at most QUIET_MAX s)
  for (const seed of provenSeeds(id)) { const q = quietOf(buildGen2Stage({ config: cfg, kit: kit(), seed, difficulty: 'normal' })).quiet; if (q > QUIET_MAX) b.push(`${id} seed ${seed}: ${q} s quiet, over the line ${QUIET_MAX} s (the outro excluded)`); }
  if (id === '1-1') for (const seed of provenSeeds(id)) if (!dresses(...(['normal', 'easy'] as const).map((difficulty) => buildGen2Stage({ config: cfg, kit: kit(), seed, difficulty })))) b.push(`${id} seed ${seed}: too few squirrels find a spot (w1Finish)`);
  if (L && L.plans.length !== L.seeds.length) b.push(`${id}: ${L.seeds.length} seeds but ${L.plans.length} plans`);
  console.log(b.length ? `seedlist ${id}: FAIL\n  ${b.slice(0, 20).join('\n  ')}` : `seedlist ${id}: PASS (${provenSeeds(id).length} seeds, each clean on both settings)`);
  process.exit(b.length ? 1 : 0);
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
// --part FILE (no list file); --merge a.json,b.json,... re-lays every seed of the union (the same filters) and writes the list from them)
const worker = arg('--worker', ''), part = arg('--part', ''), merge = arg('--merge', '');
const [wi, wn] = worker ? worker.split('/').map(Number) : [0, 1];
const keep = worker ? Math.ceil(want / wn) : want;
const only = merge ? merge.split(',').flatMap((f) => JSON.parse(fs.readFileSync(f, 'utf8')) as number[]).sort((a, b) => a - b) : null;
const tries = only ?? function* () { for (let seed = 1; seed < want * 200; seed++) if (seed % wn === wi) yield seed; }();
for (const seed of tries) { // (1-1's promises and the quiet line keep few rolls, the lead's 0.9.5 rulings)
  if (seeds.length >= keep) break;
  tried++;
  const n = buildGen2Stage({ config: cfg, kit: kit(), seed, difficulty: 'normal' });
  if (n.gen2.errors?.length) continue;
  const e = buildGen2Stage({ config: cfg, kit: kit(), seed, difficulty: 'easy' });
  if (e.gen2.errors?.length) continue;
  // (1-1's player promises, the lead 11-06: no unmarked floorless gap on either setting, the double needed right after its teach on Normal)
  if (id === '1-1' && (promiseBreaches11(n as never).length || floorlessGaps(e as never).length)) continue;
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
const out = { ...PROVEN_SEEDS, [id]: { dict, seeds, plans, quiet, outro } };
const text = `// Generated by tools/engine/seedlist.ts: do not edit by hand. Each stage's proven seeds (gen2/seedList.ts), each clean on both settings,
// with its proven plan packed (seedList.ts packPlan: Play replays it); quiet: each seed's longest quiet stretch on Normal (s, the goal
// run-out excluded: REPORTED, not yet binding); outro: the goal section's px.
export const PROVEN_SEEDS: Record<string, { dict: string[]; seeds: number[]; plans: string[]; quiet?: number[]; outro?: number[] }> = ${JSON.stringify(out)};
`;
fs.writeFileSync('src/game/gen2/provenSeeds.ts', text);
console.log(`  the list file: ${Buffer.byteLength(text)} bytes (${id}: ${JSON.stringify(out[id]).length} bytes)`);
const sorted = [...quiet].sort((a, b) => a - b), med = sorted[Math.floor(sorted.length / 2)] ?? 0;
console.log(`seedlist ${id}: ${seeds.length} proven of ${tried} tried (${((seeds.length / tried) * 100).toFixed(0)}%), ${((Date.now() - t0) / 1000).toFixed(0)} s${Number.isFinite(quietMax) ? `; the quiet line bound at ${quietMax} s: ${quietOut} clean seeds over it left out` : ""}`);
console.log(`  quiet line (REPORTED, outro excluded; binds at FR9): longest ${sorted[sorted.length - 1]} s, median ${med} s, under 4 s on ${quiet.filter((q) => q <= 4).length} of ${seeds.length}`);
console.log(`  outro (goal section): ${Math.min(...outro)}-${Math.max(...outro)} px`);
