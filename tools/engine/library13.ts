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
import { CANOPY, NEW_STOOD_IN, WAY_DOWN, tidy } from './library.ts';

export { tidy };
type R2 = [number, number];
type Any = any; // eslint-disable-line @typescript-eslint/no-explicit-any

/** 1-3's graphs (a purge's: the teach first, a rest after every test, twist and set piece). Only jobs World 1's library serves in
 *  all three of the deal's types (measured: a combine or a descent dealt the mushrooms or the stairs has no section, `pool short`) */
export const PURGE_13: Record<string, string> = {
  'purge-13-A': 'A T P F R M X R F W R S E',
  'purge-13-B': 'A T M P R X R F P R W R S E',
  'purge-13-C': 'A T P M R X R F W R P S E',
};
/** what 1-3 never holds: 1-1's lines and its story props, and the canopy sections (library.ts CANOPY: a soft-falls stage's only) */
export const REFUSE_13 = ['hint.1-1', 'coach.', 'squirrel', 'bootprint', 'canopy'];
/** 1-3's brief, all of it data: a purge on the ground and the low logs, its cast the snake */
export const BRIEF_13: GraphBrief = {
  ends: 'quiet', trend: 'level', branching: 'some', teaches: ['traps'], deal: { ground: 40, bounce: 30, climb: 30 },
  cast: ['snake'], pick: { refuse: REFUSE_13 },
};
/** the corridor under the floor line (library.ts ROOM_12: World 1's 80 px was cut for a stage that climbs) */
export const ROOM_13 = 320;
/** the story keeper's approved 1-3 line (the lead's brief, 11-12): the only player words this file holds */
export const TRAP_LINE = 'Knock the snakes off the branches. Punch, or shake the vine.';
/** 1-3's cast rows: w1Cast.ts's four (the snake and the sleeper on a 200 px branch, and each on a trap's short patch) */
export const CAST_13: CreatureDef[] = W1_CAST_CREATURES;

// ───────────────────────────── the drop-trap twist bricks (1-3's own) ─────────────────────────────
/**
 * THE PHONE'S NUMBERS (w1Cast.ts's header, measured on stills of a roll): from its handle a trap's hung load is 140-190 px on, over
 * the middle of its snake's 122 px patch, so the vine, the load and the whole patch are on an upright phone's screen; the handle's
 * socket is 85-130 px before the load's (the near end of the patch); no ledge beside a handle is long enough for another animal to
 * be laid or topped up on (every one under 248 px: a patrol's 200 plus the lay's 24 px margins).
 * The lay keeps an animal 120 px from any prop (pipeline ANY_APART), its own trap's load socket included: so the load's SOCKET sits
 * at the patch's near end and the snake's at its far end, and `armedTraps` hangs the load over the patch's middle.
 */
/** a ledge he walks or steps onto: no `landing` (Easy widens a landing by 48 px, EASY_LANDING: every px here is the phone's, and a
 *  ledge 48 px longer is one an animal can be topped up on, beside a handle; measured, Easy's first cut hung no pair at all) */
const led = (key: string, after: string | null, w: R2, dy: R2 = [0, 0]): SectionPiece => ({ key, shape: 'bank', w, place: after ? { kind: 'walk', after, dy } : { kind: 'start' }, style: 'moss_stone', main: true });
const UP: R2 = [-56, -50], DOWN: R2 = [50, 56];
/** a fallen branch across the road: a step up onto it (50-56 px) and a step down off it, its two ends the snake's world. Its own
 *  piece, off the `main` list (the lay stands no flag on it and tops no second animal up onto it) and no `landing` (Easy would widen
 *  it by its landing pad, and the sockets would slide along it) */
const log = (key: string, after: string, w: R2, dy: R2 = UP): SectionPiece => ({ key, shape: 'bank', w, place: { kind: 'walk', after, dy }, style: 'log', main: false });
/** a ledge no animal can be laid on (under 248 px), and a short one under a flag's pad (pipeline FLAG_SPAN.pad 160): a flag keeps
 *  every animal 224 px off (patchFor), and one at the end of a wide ledge beside a branch emptied the snake's socket, so the load
 *  hung over nothing (measured: 86 of 404 traps on Normal before the short ledges stood either side of every branch) */
const LEDGE: R2 = [230, 240], NARROW: R2 = [150, 155];
/** a trapped snake's branch: its patch 122 px (the branch less the lay's 24 px at each end), one width so every px below holds */
const SHORT: R2 = [170, 170];
/** a bare branch (no trap: the punch off its end, or the vault): the awake snake's own 200 px and more; Easy's is wider */
const LONG: R2 = [350, 370], WIDE: R2 = [400, 420];
/** on a trapped branch: the load's line 24 px in (the patch's near end), the snake's socket 122 px on, at the patch's far end
 *  (a socket outside its piece's patch is left empty, pipeline patchFor; an animal under 120 px from a prop is not laid) */
const LOAD_T = 0.142, SNAKE_T = 0.857;
/** the handle on the short ledge before the branch: 84-86 px before the branch, so 108-110 px before its load's socket (the pair's
 *  85-130), which is the nearest the snake can come (it strikes within 105), and 169-171 px before the middle of the snake's patch,
 *  where the load is hung (w1Cast.ts armedTraps) */
const HANDLE_T = 0.443;
const low = (id: string, on: string, t: R2 | number, count = 2): Socket => ({ id, role: 'pickup', on, t, dn: 34, count, span: 120 });
type Load = 'trap-hive' | 'trap-stone';
interface Unit { asleep?: boolean; load?: Load | null; perch?: boolean; wide?: boolean; easy?: Socket['easy'] }
/**
 * One snake's branch, after the piece `after`: a short ledge `<k>g`, the branch `<k>L` a step up, a short ledge `<k>d` a step down.
 * With a `load`: the handle on `<k>g`, the load and a short-patch snake on the branch. `perch`: `<k>g` is the step up (the vine is
 * up on a perch), the branch a step down from it and `<k>d` a step lower still, so the branch keeps its far end; the piece after
 * steps back up (`rise`). No load: a long branch and the awake snake's full patrol.
 */
function core(k: string, after: string, o: Unit = {}): { pieces: SectionPiece[]; sockets: Socket[]; last: string; rise: boolean } {
  const g = `${k}g`, L = `${k}L`, d = `${k}d`;
  const perch = !!(o.perch && o.load);
  const pieces: SectionPiece[] = [led(g, after, NARROW, perch ? UP : [0, 0]), log(L, g, o.load ? SHORT : o.wide ? WIDE : LONG, perch ? DOWN : UP), led(d, L, NARROW, DOWN)];
  const sockets: Socket[] = [];
  if (o.load) {
    sockets.push({ id: `${k}h`, role: 'source', on: g, t: HANDLE_T, dn: 0 });
    sockets.push({ id: `${k}r`, role: 'receptor', on: L, t: LOAD_T, dn: 0, link: `${k}h`, allow: [o.load] });
    sockets.push({ id: `${k}e`, role: 'enemy', on: L, t: SNAKE_T, dn: 0, allow: [o.asleep ? 'snake-trapped-asleep' : 'snake-trapped'], easy: o.easy ?? (o.asleep ? 'keep' : 'soften') });
  } else sockets.push({ id: `${k}e`, role: 'enemy', on: L, t: 0.5, dn: 0, allow: [o.asleep ? 'snake-asleep' : 'snake'], easy: o.easy ?? (o.asleep ? 'keep' : 'soften') });
  return { pieces, sockets, last: d, rise: perch };
}
/** branches in a row, a ledge before each and the ledge out */
function row(us: Unit[]): { pieces: SectionPiece[]; sockets: Socket[] } {
  const pieces: SectionPiece[] = [], sockets: Socket[] = [];
  let prev: string | null = null, rise = false;
  us.forEach((u, j) => {
    const a = `u${j}a`;
    pieces.push(led(a, prev, LEDGE, rise ? UP : [0, 0]));
    sockets.push(low(`u${j}p`, a, [0.3, 0.6]));
    const c = core(`u${j}`, a, u);
    pieces.push(...c.pieces); sockets.push(...c.sockets); prev = c.last; rise = c.rise;
  });
  pieces.push(led('z', prev, LEDGE, rise ? UP : [0, 0]));
  sockets.push(low('pz', 'z', [0.4, 0.6], 1));
  return { pieces, sockets };
}
/** a root stair with the snake's branch at its top (a CLIMB brick: `n` steps up of 50-56 px, the branch one more, then down again) */
function stair(n: number, u: Unit): { pieces: SectionPiece[]; sockets: Socket[] } {
  const pieces: SectionPiece[] = [led('a', null, LEDGE)], sockets: Socket[] = [low('pa', 'a', [0.3, 0.6])];
  let prev = 'a';
  for (let j = 0; j < n; j++) { pieces.push(led(`s${j}`, prev, LEDGE, UP)); prev = `s${j}`; }
  const c = core('t', prev, { ...u, perch: false });
  pieces.push(...c.pieces); sockets.push(...c.sockets); prev = c.last;
  for (let j = 0; j < n; j++) { pieces.push(led(`d${j}`, prev, LEDGE, DOWN)); prev = `d${j}`; }
  pieces.push(led('z', prev, LEDGE));
  sockets.push(low('pz', 'z', [0.4, 0.6], 1));
  return { pieces, sockets };
}
type Lay = { pieces: SectionPiece[]; sockets: Socket[] };
type V = { id: string; lay: Lay; easy?: Lay };
/** a brick (library.ts `brick`, for the ground and the stairs): its first piece `in`, its last `out`, a version's Easy twin beside it */
function brick(o: { id: string; name: string; jobs: NodeJob[]; difficulty: number; content?: 'ground' | 'climb'; teaches?: string; maxPerStage?: number; weight?: number; versions: V[] }): SectionTemplate {
  const ren = (ps: SectionPiece[]) => { const a = ps[0].key, z = ps[ps.length - 1].key; const f = (s: string) => (s === a ? 'in' : s === z ? 'out' : s); return ps.map((p) => ({ ...p, key: f(p.key), place: Object.fromEntries(Object.entries(p.place).map(([q, v]) => [q, (q === 'after' || q === 'on') && typeof v === 'string' ? f(v) : v])) as SectionPiece['place'] })); };
  const sk = (ps: SectionPiece[], ss: Socket[]) => { const a = ps[0].key, z = ps[ps.length - 1].key; return ss.map((s) => ({ ...s, on: s.on === a ? 'in' : s.on === z ? 'out' : s.on })); };
  const first = ren(o.versions[0].lay.pieces)[0];
  const versions = o.versions.flatMap((v) => [
    { id: v.id, pieces: ren(v.lay.pieces).slice(1), sockets: sk(v.lay.pieces, v.lay.sockets), ...(v.easy ? { easy: `${v.id}-easy` } : {}) },
    ...(v.easy ? [{ id: `${v.id}-easy`, pieces: ren(v.easy.pieces).slice(1), sockets: sk(v.easy.pieces, v.easy.sockets), easyOnly: true }] : []),
  ]);
  const { versions: _v, ...rest } = o;
  return { ...rest, archetypes: 'any', phases: ['ki', 'sho', 'ten', 'ketsu'], needs: ['jump'], uses: o.teaches ? [] : ['traps'], content: o.content ?? 'ground', terrain: 'raised-logs', pieces: [first], subBlocks: [{ id: 'body', versions }], entry: { piece: 'in', kind: 'ground' }, exit: { piece: 'out', kind: 'ground' }, exitDy: 0, sockets: [], mirrorable: false } as SectionTemplate;
}
/** a version; where it holds a bare branch its Easy twin lays that branch wider (a trapped branch is the same on both settings: its
 *  short patch is the phone's, and Easy softens its snake at the socket) */
const ver = (id: string, us: Unit[]): V => ({ id, lay: row(us), ...(us.some((u) => !u.load) ? { easy: row(us.map((u) => (u.load ? u : { ...u, wide: true }))) } : {}) });
/** how often the bag holds a snake brick beside World 1's own sections of its job and type (SectionTemplate.weight): the stage is the snakes' */
const BAG = 3;
const HIVE: Unit = { load: 'trap-hive' }, STONE: Unit = { load: 'trap-stone' }, BARE: Unit = {};

export const TWISTS: SectionTemplate[] = [
  // (T: the lesson. Ledges no animal can be laid on, Dot's line on the first, the vine on the short one, then the branch with the
  // SLEEPING snake and the hive over it: the first snake of the stage sleeps on both settings)
  brick({ id: 'lib-trap-teach', name: 'the vine, the hive and a sleeping snake', jobs: ['teach'], difficulty: 2, teaches: 'traps', versions: [(() => {
    const c = core('t', 'b', { load: 'trap-hive', asleep: true });
    const pieces: SectionPiece[] = [led('a', null, LEDGE), led('b', 'a', LEDGE), ...c.pieces, led('z', c.last, LEDGE)];
    const sockets: Socket[] = [{ id: 'flag', role: 'flag', on: 'a', t: 0.5 }, { id: 'tip', role: 'tip', on: 'b', t: 0.3, allow: ['traps'] }, ...c.sockets, low('pa', 'a', [0.3, 0.6]), low('pz', 'z', [0.4, 0.6], 1)];
    return { id: 'asleep-under-the-hive', lay: { pieces, sockets } };
  })()] }),
  // (P / M: one branch, one snake awake, one trap)
  brick({ id: 'lib-trap-branch', weight: BAG, name: 'a snake on a branch, a hive over it', jobs: ['practise', 'flow'], difficulty: 4, versions: [ver('vine-hive', [HIVE])] }),
  brick({ id: 'lib-trap-stone', weight: BAG, name: 'a snake on a branch, a stone over it', jobs: ['practise', 'flow'], difficulty: 4, versions: [ver('tendril-stone', [STONE])] }),
  // (no trap: the punch off the branch end, or the stomp that vaults it)
  brick({ id: 'lib-snake-vault', weight: BAG, name: 'a snake on a long branch and no trap: the punch or the vault', jobs: ['practise', 'flow', 'twist'], difficulty: 4, versions: [ver('bare-branch', [BARE])] }),
  // (the handle up on a perch: a step up to it, the branch below)
  brick({ id: 'lib-trap-perch', weight: BAG, name: 'the vine up on a perch', jobs: ['twist', 'practise', 'flow'], difficulty: 5, versions: [
    ver('perch-hive', [{ ...HIVE, perch: true }]), ver('perch-stone', [{ ...STONE, perch: true }]),
  ] }),
  // (two branches in a row: the first snake awake, the second asleep, so the section's threat always pays for both)
  brick({ id: 'lib-trap-two', weight: BAG, name: 'two branches in a row, a trap over each', jobs: ['twist', 'test'], difficulty: 6, versions: [
    ver('hive-stone', [HIVE, { ...STONE, asleep: true }]), ver('stone-hive', [STONE, { ...HIVE, asleep: true }]),
  ] }),
  // (a trapped branch and a bare one, both snakes awake: a test node's alone, whose threat (0.9 of the stage's) pays for two awake
  // snakes; in a twist's 0.8 the second socket stayed empty, and where that was the trapped one its load hung over nothing: measured,
  // 8 of 882 loads on Normal. Easy drops the bare branch's snake)
  brick({ id: 'lib-trap-test', weight: BAG, name: 'a trapped branch, then a bare one', jobs: ['test'], difficulty: 6, versions: [
    ver('trap-then-bare', [HIVE, { ...BARE, easy: 'drop' }]), ver('bare-then-trap', [{ ...BARE, easy: 'drop' }, { ...STONE, perch: true }]),
  ] }),
  // (the CLIMB bricks: the branch at the top of a root stair, so a node dealt the stairs can hold a snake and its trap too)
  brick({ id: 'lib-trap-stair', weight: BAG, name: 'a root stair, the snake on the branch at its top', jobs: ['practise', 'flow', 'twist'], content: 'climb', difficulty: 4, versions: [
    { id: 'two-steps-hive', lay: stair(2, HIVE) }, { id: 'two-steps-stone', lay: stair(2, STONE) },
  ] }),
  brick({ id: 'lib-trap-stair-high', weight: BAG, name: 'a taller root stair, the snake at its top', jobs: ['twist', 'test', 'flow'], content: 'climb', difficulty: 6, versions: [
    { id: 'three-steps-stone', lay: stair(3, STONE), easy: stair(2, STONE) }, { id: 'three-steps-hive', lay: stair(3, HIVE), easy: stair(2, HIVE) },
  ] }),
  // (S: the signature, one a stage: three branches, the snakes awake, asleep, asleep, so the section's threat pays for all three)
  brick({ id: 'lib-trap-gallery', name: 'the snake gallery: three branches, three traps', jobs: ['signature'], difficulty: 7, maxPerStage: 1, versions: [
    ver('hive-stone-hive', [HIVE, { ...STONE, asleep: true, perch: true }, { ...HIVE, asleep: true }]),
  ] }),
  brick({ id: 'lib-trap-gallery-b', name: 'the snake gallery, the stone first', jobs: ['signature'], difficulty: 7, maxPerStage: 1, versions: [
    ver('stone-hive-bare', [STONE, { ...HIVE, asleep: true }, { ...BARE, asleep: true }]),
  ] }),
  brick({ id: 'lib-trap-gallery-c', name: 'the snake gallery, the perch vines', jobs: ['signature'], difficulty: 7, maxPerStage: 1, versions: [
    ver('perch-bare-perch', [{ ...HIVE, perch: true }, { ...BARE, asleep: true }, { ...STONE, asleep: true, perch: true }]),
  ] }),
];

/** arming is World 1's own now (w1Cast.ts `armedTraps`: a trap is one only where a snake stays under it, its load hung over the
 *  middle of that snake's patch) */
export const UNDER = TRAP_UNDER;
export { armedTraps };

/** `rawTraps`: w1Cast.ts's emitters alone, every load a trap whether or not a snake stands under it (to measure what arming saves) */
export interface LibOpts { flown?: boolean; twists?: boolean; only?: string; down?: boolean; room?: number; rawTraps?: boolean }
/** the stage id the kit's rows are filed under (`flown`: the flown stage's, as library.ts and the Designer's supply12 do) */
export const stageIdOf = (o: LibOpts = {}) => (o.flown ? '1-1' : '1-3');
/** World 1's kit with 1-3's brief, graphs, lessons, cast rows and trap pairs; its sections World 1's own untouched (but for the
 *  canopy's feel tag) plus the drop-trap bricks, library.ts's stood-in ground exit and its way-down brick */
export function kitLib13(o: LibOpts = {}): WorldKit {
  const k = w1World(), M = k.manifest as Any, ID = stageIdOf(o);
  const list = [...(o.flown ? [] : M.graphs.list), ...Object.entries(PURGE_13).filter(([id]) => !o.only || id === o.only).map(([id, code]) => ({ id, archetype: 'purge', code }))];
  const hooks = o.rawTraps ? { emit: W1_TRAP_EMIT } : armedTraps();
  return { ...k, ...hooks, emit: { ...k.emit, ...hooks.emit }, manifest: { ...M,
    sections: [...M.sections.map((t: SectionTemplate) => (CANOPY.includes(t.id) ? { ...t, feel: ['canopy'] } : t)), ...(o.twists === false ? [] : [...TWISTS, ...NEW_STOOD_IN, ...(o.down === false ? [] : WAY_DOWN)])],
    creatures: CAST_13, props: [...M.props, ...W1_TRAP_PROPS], pairs: [...M.pairs, ...W1_TRAP_PAIRS],
    ...((o.room ?? ROOM_13) ? { corridor: { ...M.corridor, bottom: M.ground.y + (o.room ?? ROOM_13) } } : {}),
    lessons: o.flown ? { jump: '0-9', double: '0-9', bounce: '0-9' } : { jump: '1-1', double: '1-1', bounce: '1-1' },
    required: {},
    tips: { ...M.tips, traps: TRAP_LINE },
    graphs: { ...M.graphs, list, briefs: { ...(o.flown ? {} : M.graphs.briefs), [ID]: BRIEF_13 } },
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
    console.log(`1-3 by need${o.flown ? ' (FLOWN: filed under the flown stage)' : ''}: pool ${pr.pool.length} of ${M.sections.length} (World 1's ${M.sections.filter((t) => t.id.startsWith('w1-')).length} + ${o.twists === false ? 0 : TWISTS.length} drop-trap bricks + ${NEW_STOOD_IN.length} stood in + ${o.down === false ? 0 : WAY_DOWN.length} uses of the way-down brick); out: ${pr.out.map((q) => `${q.id.replace('w1-', '')} (${q.why})`).join(', ') || 'none'}`);
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
        console.log(`   ${name} (${S.length}): sections ${st3(S.map((r) => r.plan.length))}, drop-trap bricks ${st3(S.map((r) => r.plan.filter((t) => t.startsWith('lib-trap') || t.startsWith('lib-snake')).length))}, snakes ${st3(S.map((r) => r.snakes.length))} (asleep ${st3(S.map((r) => r.snakes.filter((q) => q.asleep).length))}), traps ${st3(S.map((r) => r.traps.length))}, modelled seconds typical ${st3(S.filter((r) => r.seconds !== undefined).map((r) => Math.round(r.seconds!)))} fast ${st3(S.filter((r) => r.fast !== undefined).map((r) => Math.round(r.fast!)))}`);
        console.log(`      traps ${S.reduce((s, r) => s + r.traps.length, 0)}${o.rawTraps ? ' (RAW: every load a trap)' : ` armed of ${S.reduce((s, r) => s + r.loads, 0)} loads hung (min a roll ${Math.min(...S.map((r) => r.traps.length))})`}: no handle ${S.reduce((s, r) => s + r.noHandle, 0)}, no snake within 150 px on its ground ${S.reduce((s, r) => s + r.noSnake, 0)} (in ${S.filter((r) => r.noSnake).length} rolls); awake snake under ${S.reduce((s, r) => s + r.traps.filter((t) => t.snake && !t.snake.asleep).length, 0)}, sleeping ${S.reduce((s, r) => s + r.traps.filter((t) => t.snake?.asleep).length, 0)}; first snake asleep in ${S.filter((r) => r.firstAsleep).length} of ${S.length}; cast kinds ['snake'] in ${S.filter((r) => r.kinds.join() === 'snake').length}; rolls with no trap ${S.filter((r) => !r.traps.length).length}`);
        const all = (f: (r: Roll13) => number[]) => { const xs = S.flatMap(f); return xs.length ? `${Math.min(...xs)}-${Math.max(...xs)}` : 'none'; };
        console.log(`      handle to load ${all((r) => r.reach)} px (140-190: w1Cast.ts TRAP_REACH); handle to the nearest end of any snake's patrol ${all((r) => r.clear)} px (105 or more: its strike); a trapped snake's patrol ${all((r) => r.patrolW)} px wide, its far end ${all((r) => r.patrolFar)} px from the load's line`);
      }
      for (const [k, v] of [...kinds].sort((a, b) => b[1] - a[1]).slice(0, 16)) console.log(`   ${String(v).padStart(4)}  ${k}`);
    }
    const lib = pr.pool.filter((id) => id.startsWith('w1-'));
    console.log(`World 1 sections laid at least once: ${lib.filter((id) => used.get(id)).length} of ${lib.length}; never laid: ${lib.filter((id) => !used.get(id)).map((s) => s.replace('w1-', '')).join(', ') || 'none'}`);
    console.log(`bricks laid: ${[...TWISTS, ...WAY_DOWN, ...NEW_STOOD_IN].map((t) => `${t.id}:${used.get(t.id) ?? 0}`).join(' ')}`);
  }
}
