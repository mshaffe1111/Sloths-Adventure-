/**
 * 1-3 "Branch Snakes" laid TEST-SIDE from the piece library (W1C-lay, 11-12), the way library.ts lays 1-2: 1-3's brief (a purge, its
 * cast the Golden Tree Snake, its twist DROP TRAPS) rolled in the real pipeline from World 1's EXISTING sections picked by need
 * (GraphBrief.pick), World 1's cast rows and trap pairs (gen2/worlds/w1Cast.ts), and the drop-trap twist bricks below. Tool-side:
 * nothing in the game imports it, and no shipped stage's rows change.
 *   npx tsx tools/engine/library13.ts [--seeds 120] [--from 1] [--par 4] [--flown] [--json] [--no-twists] [--raw-traps]
 * Prints: the pool by need, supply by job and type, and per setting how many rolls are CLEAN (no gen2.errors) with every refusing
 * line counted; then what a clean roll holds: snakes, traps, a trap with no handle or no snake under it (a defect, counted), whether
 * the first snake is the sleeping one, and the modelled seconds. `--flown`: 1-3's rows filed under the flown stage's id (library.ts,
 * engine-core.md 0f): a stage with no JUDGED row lays to the unflown reach and its "clean" is not the verdicts'.
 */
import '../../src/game/headlessDom.ts';
import { fileURLToPath } from 'node:url';
import { buildGen2Stage, stagePool } from '../../src/game/gen2/pipeline.ts';
import { w1World } from '../../src/game/gen2/worlds/w1.ts';
import { TRAP_UNDER, W1_CAST_CREATURES, W1_TRAP_EMIT, W1_TRAP_PAIRS, W1_TRAP_PROPS, armedTraps } from '../../src/game/gen2/worlds/w1Cast.ts';
import { generateAllLevels } from '../../src/game/worldsData.ts';
import type { CastData } from '../../src/game/castPlay.types.ts';
import type { CreatureDef, GraphBrief, NodeJob, PropEmitter, SectionPiece, SectionTemplate, Socket, StageSink, WorldKit } from '../../src/game/gen2/types.ts';
import { CANOPY, NEW_STOOD_IN, tidy } from './library.ts';
import { ARC_13 as TWISTS, BRIEF_13 as BRIEF_REAL, LINES_13, STAGE_13 } from '../../src/game/gen2/worlds/w1Arc13.ts';

export { tidy };
type R2 = [number, number];
type Any = any; // eslint-disable-line @typescript-eslint/no-explicit-any

export { ARC_13 as TWISTS, BRIEF_13, LINES_13, MISSION_13, PURGE_13 } from '../../src/game/gen2/worlds/w1Arc13.ts';
/** what the test-side filing under the flown stage's id must refuse of that stage's (its lines and story props, the canopy) */
export const REFUSE_13 = ['hint.1-1', 'coach.', 'squirrel', 'bootprint', 'canopy'];
/** the corridor under the floor line the first lay used (World 1's own 80 px holds the arc: measured, 40 of 40 with --room 0) */
export const ROOM_13 = 320;
export const TRAP_LINE = LINES_13.traps;
/** 1-3's cast rows: w1Cast.ts's four (the snake and the sleeper on a 200 px branch, and each on a trap's short patch) */
export const CAST_13: CreatureDef[] = W1_CAST_CREATURES;


/** arming is World 1's own now (w1Cast.ts `armedTraps`: a trap is one only where a snake stays under it, its load hung over the
 *  middle of that snake's patch) */
export const UNDER = TRAP_UNDER;
export { armedTraps };

/** a World 1 section that is only quiet: every job it serves is an arrival, a rest or an exit */
const QUIET = new Set<NodeJob>(['arrive', 'rest', 'exit']);
export const quiet = (t: SectionTemplate): boolean => !!t.jobs?.length && t.jobs.every((j) => QUIET.has(j));
/** `rawTraps`: w1Cast.ts's emitters alone, every load a trap whether or not a snake stands under it (to measure what arming saves) */
export interface LibOpts { flown?: boolean; twists?: boolean; only?: string; down?: boolean; room?: number; rawTraps?: boolean }
/** the stage id the kit's rows are filed under (`flown`: the flown stage's, as library.ts and the Designer's supply12 do) */
export const stageIdOf = (o: LibOpts = {}) => (o.flown ? '1-1' : '1-3');
/** World 1's kit with 1-3's brief, graphs, lessons, cast rows and trap pairs; its sections World 1's own untouched (but for the
 *  canopy's feel tag) plus the drop-trap bricks, library.ts's stood-in ground exit and its way-down brick */
export function kitLib13(o: LibOpts = {}): WorldKit {
  // NOT flown: World 1's SHIPPED kit, exactly as the game builds 1-3 from it (w1.ts, w1Arc13.ts, w1Cast.ts). Nothing is added here.
  if (!o.flown) return w1World();
  // FLOWN: until 1-3 has JUDGED rows of its own (reach.ts), the same level filed under the flown stage's id to be judged on its
  // arcs: 1-3's own sections and the quiet ones it is tagged for, its graph alone, its brief with the flown stage's lines refused
  const k = w1World(), M = k.manifest as Any, ID = stageIdOf(o);
  const pool = stagePool(M, STAGE_13).map((t) => t.id);
  const hooks = o.rawTraps ? { emit: W1_TRAP_EMIT, spawn: undefined } : {};
  return { ...k, ...hooks, manifest: { ...M,
    sections: M.sections.filter((t: SectionTemplate) => pool.includes(t.id)).map((t: SectionTemplate) => ({ ...t, feel: undefined })),
    lessons: { jump: '0-9', double: '0-9', bounce: '0-9' },
    required: {},
    graphs: { ...M.graphs, list: M.graphs.list.filter((g: Any) => g.archetype === 'purge' && (!o.only || g.id === o.only)), briefs: { [ID]: { ...BRIEF_REAL, pick: { refuse: REFUSE_13 } } } },
  } } as WorldKit;
}
/** 1-3's config; `flown`: filed under the flown stage's id, its own stage number kept (the budget's heat and seconds stay 1-3's) */
export function config13(o: LibOpts = {}) {
  const c13 = generateAllLevels().find((c) => c.id === '1-3')!;
  return o.flown ? { ...c13, id: '1-1' } : c13;
}
/** why each of World 1's sections is in or out of 1-3's pool by need */
export function poolReport(o: LibOpts = {}) {
  const M = kitLib13(o).manifest, ID = stageIdOf(o), pool = new Set(stagePool(M, ID).map((t) => t.id));
  const deal = M.graphs!.briefs[ID].deal ?? {};
  const out = M.sections.filter((t) => !pool.has(t.id)).map((t) => ({ id: t.id, why: t.parked ? 'parked' : t.content && t.content !== 'structural' && !(t.content in deal) ? `no ${t.content} in the deal` : `refused: ${(t.feel ?? []).filter((f) => REFUSE_13.includes(f)).join(' ')}` }));
  return { pool: [...pool], out };
}

export interface TrapRow { id: number; kind: string; load: string; x: number; y: number; loadX: number; landY: number; snake: { x: number; asleep: boolean; patrol: [number, number] } | null; section?: string }
export interface Roll13 {
  errors: string[]; plan: string[]; graph?: string; thrown?: string; said: string[]; kinds: string[];
  /** every snake by x; the first one's sleep */
  snakes: Array<{ x: number; asleep: boolean; top: number }>; firstAsleep: boolean;
  traps: TrapRow[];
  /** a trap with no handle (its x not finite), and one with no snake within 150 px of its load on the ground it lands on */
  noHandle: number; noSnake: number;
  /** the loads the lay hung (a pair's receptor filled), armed or not */
  loads: number;
  /** px from each trap's handle to its load, and from each handle to the nearest end of any snake's patrol on about its level */
  reach: number[]; clear: number[];
  /** each trapped snake's patrol: its width, and how far its far end is from the load's line */
  patrolW: number[]; patrolFar: number[];
  seconds?: number; fast?: number; width?: number; purge?: { goal: number; laid: number };
}
/** a snake's ground: its feet are 14 px under its middle (w1Cast.ts footY) */
const FOOT = 14;
export function build(seed: number, difficulty: 'normal' | 'easy', o: LibOpts = {}): Any {
  return buildGen2Stage({ config: config13(o) as Any, kit: kitLib13(o), seed, difficulty });
}
/** the stage's modelled seconds (the time model's typical player: the sections' own seconds, summed) */
const secondsOf = (st: Any): number | undefined => { const xs = (st.gen2.sections ?? []).map((q: Any) => q.seconds).filter((x: Any) => typeof x === 'number'); return xs.length ? Math.round(xs.reduce((a: number, b: number) => a + b, 0)) : undefined; };
export function roll(seed: number, difficulty: 'normal' | 'easy', o: LibOpts = {}): Roll13 {
  const none = { errors: [], plan: [], said: [], kinds: [], snakes: [], firstAsleep: false, traps: [], noHandle: 0, noSnake: 0, loads: 0, reach: [], clear: [], patrolW: [], patrolFar: [] };
  try {
    const st: Any = build(seed, difficulty, o);
    const snakes = (st.enemies as Any[]).filter((e) => e.type === 'snake').map((e) => ({ x: e.x, asleep: !!e.asleep, top: e.y + FOOT, patrol: [e.patrolMinX, e.patrolMaxX] as [number, number] })).sort((a, b) => a.x - b.x);
    const secOf = (x: number) => (st.gen2.sections ?? []).find((q: Any) => x >= q.x0 - 2 && x <= q.x1 + 2)?.template;
    const traps: TrapRow[] = ((st.proto?.cast?.traps ?? []) as Any[]).map((t) => {
      const s = snakes.filter((q) => Math.abs(q.x - t.loadX) <= UNDER && Math.abs(q.top - t.landY) <= 6).sort((a, b) => Math.abs(a.x - t.loadX) - Math.abs(b.x - t.loadX))[0];
      return { id: t.id, kind: t.kind, load: t.load, x: t.x, y: t.y, loadX: t.loadX, landY: t.landY, snake: s ? { x: s.x, asleep: s.asleep, patrol: s.patrol } : null, section: secOf(t.loadX) };
    });
    const exitX = st.exitTotemX ?? st.gen2.exitX;
    return {
      errors: st.gen2.errors ?? [], plan: (st.gen2.plan ?? []).map((p: Any) => p.template), graph: st.gen2.graph?.id ?? st.gen2.graphId,
      said: (st.gen2.fills ?? []).filter((f: Any) => f.role === 'tip' || f.role === 'decor').map((f: Any) => String(f.what)),
      kinds: st.proto?.cast?.kinds ?? [], snakes: snakes.map(({ x, asleep, top }) => ({ x, asleep, top })), firstAsleep: !!snakes[0]?.asleep, traps,
      noHandle: traps.filter((t) => !Number.isFinite(t.x)).length, noSnake: traps.filter((t) => !t.snake).length,
      loads: (st.gen2.fills ?? []).filter((f: Any) => f.role === 'receptor' && f.what).length,
      reach: traps.filter((t) => Number.isFinite(t.x)).map((t) => Math.round(Math.abs(t.loadX - t.x))),
      clear: traps.filter((t) => Number.isFinite(t.x)).map((t) => Math.round(Math.min(9999, ...snakes.filter((q) => Math.abs(q.top - t.y) <= 130).map((q) => (t.x < q.patrol[0] ? q.patrol[0] - t.x : t.x > q.patrol[1] ? t.x - q.patrol[1] : 0))))),
      patrolW: traps.filter((t) => t.snake).map((t) => t.snake!.patrol[1] - t.snake!.patrol[0]),
      patrolFar: traps.filter((t) => t.snake).map((t) => Math.round(Math.max(Math.abs(t.snake!.patrol[0] - t.loadX), Math.abs(t.snake!.patrol[1] - t.loadX)))),
      seconds: st.gen2.modelled?.typical ?? secondsOf(st), fast: st.gen2.modelled?.fast, width: exitX,
      purge: { goal: st.gen2.budget?.quota?.goal ?? config13(o).targetCount, laid: st.enemies.length },
    };
  } catch (e) { return { ...none, thrown: String((e as Error).message) }; }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const arg = (n: string, d: number) => { const i = process.argv.indexOf(n); return i > 0 ? Number(process.argv[i + 1]) : d; };
  const has = (n: string) => process.argv.includes(n);
  const N = arg('--seeds', 120), from = arg('--from', 1), par = arg('--par', 1);
  const o: LibOpts = { flown: has('--flown'), twists: !has('--no-twists'), down: !has('--no-down'), room: arg('--room', ROOM_13), rawTraps: has('--raw-traps') };
  if (has('--json')) {
    for (let s = from; s < from + N; s++) for (const d of ['normal', 'easy'] as const) console.log(JSON.stringify({ seed: s, d, ...roll(s, d, o) }));
  } else {
    const flags = [...['--flown', '--no-twists', '--no-down', '--raw-traps'].filter(has), ...(has('--room') ? ['--room', String(arg('--room', ROOM_13))] : [])];
    const per = Math.ceil(N / par);
    const rows: Any[] = [];
    if (par > 1) {
      const { spawn } = await import('node:child_process');
      await Promise.all(Array.from({ length: par }, (_, i) => new Promise<void>((res) => {
        const n = Math.min(per, N - i * per); if (n <= 0) return res();
        const ch = spawn(process.execPath, ['--import', 'tsx', process.argv[1], '--json', '--seeds', String(n), '--from', String(from + i * per), ...flags], { stdio: ['ignore', 'pipe', 'inherit'] });
        let buf = ''; ch.stdout.on('data', (b) => (buf += b)); ch.on('close', () => { for (const l of buf.split('\n')) if (l.startsWith('{')) rows.push(JSON.parse(l)); res(); });
      })));
    } else for (let s = from; s < from + N; s++) for (const d of ['normal', 'easy'] as const) rows.push({ seed: s, d, ...roll(s, d, o) });
    const pr = poolReport(o), M = kitLib13(o).manifest, byId = new Map(M.sections.map((t) => [t.id, t]));
    console.log(`1-3, the designed arc${o.flown ? ' (FLOWN: filed under the flown stage)' : ''}: pool ${pr.pool.length} of ${M.sections.length} (World 1's quiet sections ${M.sections.filter((t) => t.id.startsWith('w1-')).length} + ${o.twists === false ? 0 : TWISTS.length} beat bricks + ${NEW_STOOD_IN.length} stood in); out: ${pr.out.map((q) => `${q.id.replace('w1-', '')} (${q.why})`).join(', ') || 'none'}`);
    const sup = new Map<string, string[]>();
    for (const id of pr.pool) { const t = byId.get(id)!; for (const j of t.jobs ?? ['(phases)']) { const k = `${j}/${t.content ?? '-'}`; sup.set(k, [...(sup.get(k) ?? []), id.replace('w1-', '')]); } }
    console.log('supply by job/type:'); for (const [k, v] of [...sup].sort()) console.log(`   ${k.padEnd(26)} ${String(v.length).padStart(2)}  ${v.join(', ')}`);
    const used = new Map<string, number>();
    const st3 = (xs: number[]) => (xs.length ? `${Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 10) / 10} (${Math.min(...xs)}-${Math.max(...xs)})` : 'none');
    for (const d of ['normal', 'easy'] as const) {
      const R: Roll13[] = rows.filter((r) => r.d === d), clean = R.filter((r) => !r.thrown && !r.errors.length);
      const kinds = new Map<string, number>();
      for (const r of R) for (const e of new Set<string>((r.thrown ? ['THROW ' + r.thrown] : r.errors).map(tidy))) kinds.set(e, (kinds.get(e) ?? 0) + 1);
      for (const r of R) for (const t of r.plan) used.set(t, (used.get(t) ?? 0) + 1);
      console.log(`== ${d}: ${R.length} rolls (seeds ${from}-${from + N - 1}): CLEAN ${clean.length} (${Math.round((100 * clean.length) / Math.max(1, R.length))}%), thrown ${R.filter((r) => r.thrown).length}, pool short ${R.filter((r) => r.errors.some((e: string) => /pool short|fits no node|no section/.test(e))).length}`);
      for (const [name, S] of [['a clean roll', clean], ['every roll that built', R.filter((r) => !r.thrown)]] as const) {
        console.log(`   ${name} (${S.length}): sections ${st3(S.map((r) => r.plan.length))}, drop-trap bricks ${st3(S.map((r) => r.plan.filter((t) => t.startsWith('w1-13-') || t.startsWith('lib-snake')).length))}, snakes ${st3(S.map((r) => r.snakes.length))} (asleep ${st3(S.map((r) => r.snakes.filter((q) => q.asleep).length))}), traps ${st3(S.map((r) => r.traps.length))}, modelled seconds typical ${st3(S.filter((r) => r.seconds !== undefined).map((r) => Math.round(r.seconds!)))} fast ${st3(S.filter((r) => r.fast !== undefined).map((r) => Math.round(r.fast!)))}`);
        console.log(`      traps ${S.reduce((s, r) => s + r.traps.length, 0)}${o.rawTraps ? ' (RAW: every load a trap)' : ` armed of ${S.reduce((s, r) => s + r.loads, 0)} loads hung (min a roll ${Math.min(...S.map((r) => r.traps.length))})`}: no handle ${S.reduce((s, r) => s + r.noHandle, 0)}, no snake within 150 px on its ground ${S.reduce((s, r) => s + r.noSnake, 0)} (in ${S.filter((r) => r.noSnake).length} rolls); awake snake under ${S.reduce((s, r) => s + r.traps.filter((t) => t.snake && !t.snake.asleep).length, 0)}, sleeping ${S.reduce((s, r) => s + r.traps.filter((t) => t.snake?.asleep).length, 0)}; first snake asleep in ${S.filter((r) => r.firstAsleep).length} of ${S.length}; cast kinds ['snake'] in ${S.filter((r) => r.kinds.join() === 'snake').length}; rolls with no trap ${S.filter((r) => !r.traps.length).length}`);
        const all = (f: (r: Roll13) => number[]) => { const xs = S.flatMap(f); return xs.length ? `${Math.min(...xs)}-${Math.max(...xs)}` : 'none'; };
        console.log(`      handle to load ${all((r) => r.reach)} px (140-190: w1Cast.ts TRAP_REACH); handle to the nearest end of any snake's patrol ${all((r) => r.clear)} px (105 or more: its strike); a trapped snake's patrol ${all((r) => r.patrolW)} px wide, its far end ${all((r) => r.patrolFar)} px from the load's line`);
      }
      for (const [k, v] of [...kinds].sort((a, b) => b[1] - a[1]).slice(0, 16)) console.log(`   ${String(v).padStart(4)}  ${k}`);
    }
    const lib = pr.pool.filter((id) => id.startsWith('w1-'));
    console.log(`World 1 sections laid at least once: ${lib.filter((id) => used.get(id)).length} of ${lib.length}; never laid: ${lib.filter((id) => !used.get(id)).map((s) => s.replace('w1-', '')).join(', ') || 'none'}`);
    console.log(`bricks laid: ${[...TWISTS, ...NEW_STOOD_IN].map((t) => `${t.id}:${used.get(t.id) ?? 0}`).join(' ')}`);
  }
}
