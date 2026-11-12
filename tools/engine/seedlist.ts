// A rolled stage's proven-seed list (gen2/seedList.ts; the lead, 11-06): build seeds 1, 2, 3, ... on both settings and keep each that lays
// cleanly on both (no gen2.errors), until --count are kept; write them to the stage's own list file, src/game/gen2/proven/seeds-<stage>.ts,
// and its line in src/game/gen2/provenIndex.ts (seedlistFile.ts; R-165.112: a list is its own lazy chunk, never in the main script). Each kept seed's quiet line is
// REPORTED (the lead, 10:35 AM: it binds once FR9's floor data is in, then the list is rebuilt under it): the longest quiet stretch on
// Normal (era route + deadTime), the goal run-out excluded by name ('goal run-out, outro': the supervisor's ruling), and the outro's
// length printed so a run-out that grows into a padded walk shows.
//   npx tsx tools/engine/seedlist.ts 1-1 [--count 300]     write the list
//   npx tsx tools/engine/seedlist.ts 1-1 --check            every listed seed still clean on both settings; at least SEED_LIST_MIN; exit 1 if not
//   npx tsx tools/engine/seedlist.ts 1-1 --merge c.json --in-order --part p.json   (one of N in parallel: each seed of c laid and filtered)
//   npx tsx tools/engine/seedlist.ts 1-1 --combine p0.json,p1.json,order.json       the list from those parts, in order's order
import fs from 'node:fs';
import '../../src/game/headlessDom.ts';
import { generateAllLevels } from '../../src/game/worldsData.ts';
import { buildGen2Stage, keptFoes } from '../../src/game/gen2/pipeline.ts';
import { w1Finish } from '../../src/game/gen2/worlds/w1.ts';
import { listedStage } from '../../src/game/gen2/listed.ts';
import { judgedOnArcs } from '../../src/game/gen2/reach.ts';
import { searchYield } from './yield.ts';
import { quietJudge, quietOf as quietAt } from './listRules.ts';
import { hasSeedList, listVersion, loadSeedList, packPlan, provenList, seedListError, provenSeeds, QUIET_MAX, seedListBreaches, SEED_LIST_MIN, stageParts } from '../../src/game/gen2/seedList.ts';
import { PROVEN_INDEX } from '../../src/game/gen2/provenIndex.ts';
import { listFile, writeSeedList } from './seedlistFile.ts';
import { firstRunVerdicts } from '../../src/game/gen2/verdicts.ts';
import type { FirstRunLayout } from '../../src/game/gen2/verdicts.types.ts';
import { createHash } from 'node:crypto';

const id = process.argv[2];
const arg = (k: string, d: string) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
// (the stage's row in the ONE listed-stage table, packet E12 item 1: its kit, and what is its alone as fields; no stage id lives here)
const row = listedStage(id);
if (!row) { console.error(`seedlist: no listed stage "${id}" (src/game/gen2/listed.ts)`); process.exit(2); }
const kit = row.kit;
const cfg = generateAllLevels().find((l) => l.id === id)!;

// (the quiet line is the search's own rule here, R-165.120: a roll over it is repaired or rolled again, never only thrown away; the
// list's check asks the same search, so a seed's replay is still its search)
const also = quietJudge(cfg);
const quietOf = (st: ReturnType<typeof buildGen2Stage>) => quietAt(cfg, st);
if (process.argv.includes('--check')) {
  // (the list is its own file, loaded as the game loads it, seedList.ts loadSeedList: a file the index names that does not load, or is not
  // the one the index names, fails here by name. A listed stage with no list yet, no line in the index, goes on to the breaches below and
  // fails there by name: 0 proven seeds. Writing a list, below, needs no old list)
  if (hasSeedList(id) && !(await loadSeedList(id))) { console.log(`seedlist ${id}: FAIL\n  the list did not load: ${seedListError(id)}`); process.exit(1); }
  const L = provenList(id);
  const b = seedListBreaches(cfg, kit, provenSeeds(id), SEED_LIST_MIN, L ? { dict: L.dict, plans: L.plans } : undefined, also);
  // (the quiet line BINDS, the lead 11-06: every listed seed's longest quiet stretch on Normal, the outro excluded, at most QUIET_MAX s)
  for (const seed of provenSeeds(id)) { const q = quietOf(buildGen2Stage({ config: cfg, kit: kit(), seed, difficulty: 'normal', also })).quiet; if (q > QUIET_MAX) b.push(`${id} seed ${seed}: ${q} s quiet, over the line ${QUIET_MAX} s (the outro excluded)`); }
  if (row.squirrels) for (const seed of provenSeeds(id)) if (!dresses(...(['normal', 'easy'] as const).map((difficulty) => buildGen2Stage({ config: cfg, kit: kit(), seed, difficulty, also })))) b.push(`${id} seed ${seed}: too few squirrels find a spot (w1Finish)`);
  if (L && L.plans.length !== L.seeds.length) b.push(`${id}: ${L.seeds.length} seeds but ${L.plans.length} plans`);
  // (the index, all the main script holds of the list, names this very list: its count and its version)
  const ix = PROVEN_INDEX[id];
  if (L && (!ix || ix.n !== L.seeds.length || ix.version !== listVersion(L))) b.push(`${id}: provenIndex.ts says ${ix?.n} seeds, version ${ix?.version}; the list file holds ${L.seeds.length}, version ${listVersion(L)}: rebuild the list`);
  // (R-165.61: how many listed seeds the verdicts refuse, by name, on either setting; and the fixed first run against its lock, ADR-002)
  if (judgedOnArcs(id)) {
    const by = new Map<string, number>();
    let refused = 0;
    for (const seed of provenSeeds(id)) {
      const n = new Set<string>();
      for (const difficulty of ['normal', 'easy'] as const) { const v = buildGen2Stage({ config: cfg, kit: kit(), seed, difficulty, also }).gen2.verdicts?.[difficulty]; if (v && !v.accepted) for (const f of v.failed) n.add(f.name); }
      if (n.size) refused++;
      for (const x of n) by.set(x, (by.get(x) ?? 0) + 1);
    }
    console.log(`seedlist ${id}: the verdicts refuse ${refused} of ${provenSeeds(id).length} listed seeds${by.size ? `; seeds refused by each name: ${[...by].sort((a, c) => c[1] - a[1]).map(([k, c]) => `${k} ${c}`).join(', ')}` : ''}`);
  }
  if (row.firstRun) b.push(...await firstRunBreaches());
  console.log(b.length ? `seedlist ${id}: FAIL\n  ${b.slice(0, 20).join('\n  ')}` : `seedlist ${id}: PASS (${provenSeeds(id).length} seeds, each clean on both settings)`);
  process.exit(b.length ? 1 : 0);
}

/** a listed stage's fixed first run (its row says `firstRun`; today 1-1's: ADR-002; src/game/gen2/firstRun11.ts, C1's file): its layout built on both settings against its lock
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


// (--combine a.json,b.json,... ORDER.json: the list from --merge parts, in ORDER's order (a JSON seed array), no seed laid again: each part
// holds what its --merge proved per seed (the same filters as a write); a seed of ORDER no part kept is left out, by name)
if (process.argv.includes('--combine')) {
  const files = arg('--combine', '').split(',');
  const order = JSON.parse(fs.readFileSync(files.pop()!, 'utf8')) as number[];
  const got = new Map<number, { quiet: number; outro: number; replay: Parameters<typeof packPlan>[0] }>();
  for (const f of files) { const P = JSON.parse(fs.readFileSync(f, 'utf8')) as { seeds: number[]; quiet: number[]; outro: number[]; replays: Array<Parameters<typeof packPlan>[0]> }; P.seeds.forEach((sd, i) => got.set(sd, { quiet: P.quiet[i], outro: P.outro[i], replay: P.replays[i] })); }
  const L = { dict: [] as string[], seeds: [] as number[], plans: [] as string[], quiet: [] as number[], outro: [] as number[] };
  const left: number[] = [];
  for (const sd of order) { const g = got.get(sd); if (!g) { left.push(sd); continue; } L.seeds.push(sd); L.quiet.push(g.quiet); L.outro.push(g.outro); L.plans.push(packPlan(g.replay, L.dict)); }
  const bytes = writeSeedList(id, L);
  console.log(`seedlist ${id}: combined ${L.seeds.length} of ${order.length} ordered seeds (${bytes} bytes); left out (no part kept them): ${left.length}${left.length ? ` (${left.slice(0, 40).join(', ')}${left.length > 40 ? ', ...' : ''})` : ''}`);
  process.exit(0);
}
const want = Number(arg('--count', String(SEED_LIST_MIN)));
// (--quiet-max S: the quiet line BINDS, the lead 11-06: a seed is kept only when its longest quiet stretch, the outro excluded, is S s or
// less; the count of tries it took is printed)
const quietMax = Number(arg('--quiet-max', String(QUIET_MAX)));
let quietOut = 0;
const seeds: number[] = [], quiet: number[] = [], outro: number[] = [], plans: string[] = [], dict: string[] = [];
// (each kept seed's proven plan unpacked, for a --part file: --combine writes the list from the parts without laying a seed again)
const replays: unknown[] = [];
let tried = 0;
// (the yield is seen, the lead's ruling on audit B-02: each fresh seed's graph and the lines that refused it, counted by yield.ts)
const rolls: Array<{ graph: string; refused: string[] }> = [];
const refuse = (st: ReturnType<typeof buildGen2Stage>, lines: string[]) => { rolls.push({ graph: st.gen2.graph.id ?? 'spine', refused: lines }); };
// (a roll that THROWS, e.g. a listed stage whose world has no sections for it yet, is a refused seed by name, never the tool's crash)
const lay = (seed: number, difficulty: 'normal' | 'easy') => {
  try { return buildGen2Stage({ config: cfg, kit: kit(), seed, difficulty, also }); } catch (err) { rolls.push({ graph: '(none: the build threw)', refused: [`THREW: ${(err as Error).message}`] }); return null; }
};
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
  const n = lay(seed, 'normal');
  if (!n) continue;
  if (n.gen2.errors?.length) { refuse(n, n.gen2.errors); continue; }
  const e = lay(seed, 'easy');
  if (!e) continue;
  if (e.gen2.errors?.length) { refuse(n, e.gen2.errors); continue; }
  // (1-1's player promises, the lead 11-06, and every verdict, R-165.61: judged by the pipeline on each setting, PROMISES_11 among them,
  // so a refused roll already carries them in gen2.errors above; read here by name, never by a substring)
  const vf = [n, e].flatMap((s, i) => { const d = i ? 'easy' : 'normal', v = s.gen2.verdicts?.[d]; return v && !v.accepted ? [`verdict ${v.failed[0].name} (${d})`] : []; });
  if (vf.length) { refuse(n, vf); continue; }
  // (a stage whose row says `squirrels`, the lead 11-06: Play finishes the roll with w1Finish, which throws when too few find a spot; such a roll is never listed)
  if (row.squirrels && !dresses(n, e)) { refuse(n, ['too few squirrels find a spot']); continue; }
  const q = quietOf(n);
  if (q.quiet > quietMax) { quietOut++; refuse(n, ['the quiet line']); continue; }
  refuse(n, []);
  seeds.push(seed); quiet.push(q.quiet); outro.push(q.outro);
  const replay = { seed: n.gen2.seed, rerolls: n.gen2.rerolls, plan: n.gen2.plan, foes: [...keptFoes(n)] };
  plans.push(packPlan(replay, dict));
  replays.push(replay);
}
if (part) {
  // (with --merge, the part carries what each kept seed proved, for --combine; a sweep's part stays the seed list step 3 orders)
  fs.writeFileSync(part, JSON.stringify(only ? { seeds, quiet, outro, replays } : seeds));
  console.log(`seedlist ${id} worker ${worker}: ${seeds.length} kept of ${tried} tried, ${((Date.now() - t0) / 1000).toFixed(0)} s -> ${part}`);
  if (!only && rolls.length) console.log(searchYield(rolls).join('\n'));
  process.exit(0);
}
// (a search that kept nothing writes no list: the stage's world has no rolls that pass yet; the yield lines say which rules refused)
if (!seeds.length) { console.log(`seedlist ${id}: FAIL\n  ${id}: 0 kept of ${tried} tried: no list written\n${searchYield(rolls).join('\n')}`); process.exit(1); }
const bytes = writeSeedList(id, { dict, seeds, plans, quiet, outro });
console.log(`  the list file ${listFile(id)}: ${bytes} bytes, its own chunk (the main script holds only its line in provenIndex.ts)`);
const sorted = [...quiet].sort((a, b) => a - b), med = sorted[Math.floor(sorted.length / 2)] ?? 0;
console.log(`seedlist ${id}: ${seeds.length} proven of ${tried} tried (${((seeds.length / tried) * 100).toFixed(0)}%), ${((Date.now() - t0) / 1000).toFixed(0)} s${Number.isFinite(quietMax) ? `; the quiet line bound at ${quietMax} s: ${quietOut} clean seeds over it left out` : ""}`);
console.log(`  quiet line (REPORTED, outro excluded; binds at FR9): longest ${sorted[sorted.length - 1]} s, median ${med} s, under 4 s on ${quiet.filter((q) => q <= 4).length} of ${seeds.length}`);
console.log(`  outro (goal section): ${Math.min(...outro)}-${Math.max(...outro)} px`);
if (!only && rolls.length) console.log(searchYield(rolls).join('\n'));
