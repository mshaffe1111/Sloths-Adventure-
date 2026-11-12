/**
 * The piece library's proof (EN-L, the lead 11-11: "a new stage takes hours, not days"): 1-2's brief rolled in the real pipeline from
 * World 1's EXISTING sections, picked by need (GraphBrief.pick: no section names 1-2), plus the chain-hop twist bricks below and
 * nothing else. The hazard (pits 'hurt'), the pickups (petals 'low', offRoad 'fruit') and the pool come from the BRIEF. Tool-side:
 * nothing in the game imports it, and no stage's shipped rows change.
 *   npx tsx tools/engine/library.ts [--seeds 120] [--from 1] [--par 4] [--flown] [--no-pits] [--json]
 * Prints: the pool by need (what each refusal took out), supply by job and type, and per setting how many of the rolls are CLEAN (no
 * gen2.errors), with every refusing line counted. `--flown`: 1-2's rows filed under the flown stage's id, as the Designer's supply12
 * does, to see the pool as it rolls once 1-2 is judged on the flown arcs and its double counts (packet E12 item 5).
 */
import '../../src/game/headlessDom.ts';
import { fileURLToPath } from 'node:url';
import { buildGen2Stage, stagePool } from '../../src/game/gen2/pipeline.ts';
import { w1World } from '../../src/game/gen2/worlds/w1.ts';
import { generateAllLevels } from '../../src/game/worldsData.ts';
import type { GraphBrief, NodeJob, SectionPiece, SectionTemplate, WorldKit } from '../../src/game/gen2/types.ts';

type R2 = [number, number];
/** the Designer's graphs for 1-2 (CONTENT-1-2-relay.md "The kit rows and the graphs") */
export const HARVEST_12: Record<string, string> = {
  'harvest-12-A': 'A T P F R M X R F C R S E',
  'harvest-12-B': 'A T F P R U D_ F R X R W R S E',
  'harvest-12-C': 'A T M F R C X R D_ F P S E',
};
/** what 1-2 never holds: 1-1's lines and its story props (a socket naming one stays empty; the shape is still a brick) */
export const REFUSE_12 = ['hint.1-1', 'coach.', 'squirrel', 'bootprint', 'canopy'];
/** 1-2's brief, all of it data: the packet's row plus the three things the lay now applies */
export const BRIEF_12: GraphBrief = {
  ends: 'quiet', trend: 'level', branching: 'lots', teaches: ['thorns'], deal: { ground: 35, bounce: 35, climb: 30 },
  pits: 'hurt', petals: 'low', offRoad: 'fruit', pick: { refuse: REFUSE_12 },
} as GraphBrief;
/** 1-2's corridor under the floor line (a kit row, data): World 1's is 80 px, cut for a stage that climbs; a level stage must be able to step down */
export const ROOM_12 = 320;
export const THORN_ROW = { lesson: 'thorns', art: 'w1-thorn', depth: [150, 170] as R2, clearStart: 1300 };

// ───────────────────────────── the chain-hop twist bricks (1-2's own: the bounce chain over the hollow) ─────────────────────────────
/** a chain of cap pillars after a floor mushroom (the Designer's chainlay12.ts, chain.md's bands): `steps` each cap over the one
 *  before (px, + up), pillars `pw` wide. The gaps are soft section pits: the brief's `pits` puts the thorns under them */
function chain(k: string, after: string | null, steps: number[], pw: number, floorW: R2 = [520, 560]): { pieces: SectionPiece[]; last: string } {
  const f = `${k}f`, w = (floorW[0] + floorW[1]) / 2;
  const ps: SectionPiece[] = [
    { key: f, shape: 'bank', w: floorW, place: after ? { kind: 'walk', after } : { kind: 'start' }, style: 'moss_stone', main: true, landing: true },
    { key: `${k}m`, shape: 'bouncy', w: [70, 70], place: { kind: 'on', on: f, at: [1 - 45 / (w - 70), 1 - 30 / (w - 70)], h: [30, 30] } },
  ];
  let prev = f;
  steps.forEach((st, j) => {
    const S: R2 = st > 6 ? [198, 206] : st < -6 ? [216, 224] : [208, 216];
    const gap: R2 = j === 0 ? [S[0] - pw / 2 - 70, S[1] - pw / 2 - 70] : [S[0] - pw, S[1] - pw];
    const dy: R2 = Math.abs(st) > 6 ? [-st - 3, -st + 3] : [0, 0];
    ps.push({ key: `${k}p${j}`, shape: 'bank', w: [pw, pw], place: { kind: 'jump', after: prev, dy, gapPx: gap, soft: true }, style: 'moss_stone', main: true });
    ps.push({ key: `${k}c${j}`, shape: 'bouncy', w: [70, 70], place: { kind: 'on', on: `${k}p${j}`, at: [0.5, 0.5], h: [30, 30] } });
    prev = `${k}p${j}`;
  });
  return { pieces: ps, last: prev };
}
const bank = (key: string, after: string, w: R2, dy: R2 = [0, 0], gapPx: R2 = [50, 80]): SectionPiece => ({ key, shape: 'bank', w, place: { kind: 'jump', after, dy, gapPx, soft: true }, style: 'moss_stone', main: true, landing: true });
const low = (id: string, on: string, t: R2 | number, count = 2) => ({ id, role: 'pickup' as const, on, t, dn: 34, count, span: 120 });
type V = { id: string; pieces: SectionPiece[]; sockets?: SectionTemplate['sockets']; easy?: SectionPiece[]; easySockets?: SectionTemplate['sockets'] };
/** a brick: its first piece `in`, its last `out`, each version with its Easy twin (wider pillars, a cap fewer) */
function brick(o: { id: string; name: string; jobs: NodeJob[]; content: 'bounce' | 'ground'; difficulty: number; exitDy?: number; teaches?: string; maxPerStage?: number; versions: V[] }): SectionTemplate {
  const ren = (ps: SectionPiece[]) => { const a = ps[0].key, z = ps[ps.length - 1].key; const f = (s: string) => (s === a ? 'in' : s === z ? 'out' : s); return ps.map((p) => ({ ...p, key: f(p.key), place: Object.fromEntries(Object.entries(p.place).map(([q, v]) => [q, (q === 'after' || q === 'on') && typeof v === 'string' ? f(v) : v])) as SectionPiece['place'] })); };
  const sk = (ps: SectionPiece[], ss: SectionTemplate['sockets'] = []) => { const a = ps[0].key, z = ps[ps.length - 1].key; return ss.map((s) => ({ ...s, on: s.on === a ? 'in' : s.on === z ? 'out' : s.on })); };
  const first = ren(o.versions[0].pieces)[0];
  const versions = o.versions.flatMap((v) => [
    { id: v.id, pieces: ren(v.pieces).slice(1), sockets: sk(v.pieces, v.sockets), ...(v.easy ? { easy: `${v.id}-easy` } : {}) },
    ...(v.easy ? [{ id: `${v.id}-easy`, pieces: ren(v.easy).slice(1), sockets: sk(v.easy, v.easySockets ?? v.sockets), easyOnly: true }] : []),
  ]);
  const { versions: _v, exitDy = 0, ...rest } = o;
  return { ...rest, archetypes: 'any', phases: ['ki', 'sho', 'ten', 'ketsu'], needs: ['jump'], uses: o.teaches ? ['bounce'] : ['bounce', 'thorns'], terrain: 'mounds', pieces: [first], subBlocks: [{ id: 'body', versions }], entry: { piece: 'in', kind: 'ground' }, exit: { piece: 'out', kind: 'ground' }, exitDy, sockets: [], mirrorable: false } as SectionTemplate;
}
/** a chain version: the chain, then the bank out, petals LOW on the ledge before and the bank after (never over a cap) */
const chainV = (id: string, steps: number[], easySteps: number[], outDy: R2 = [0, 0], outW: R2 = [320, 380]): V => {
  const mk = (st: number[], pw: number) => { const c = chain('k', null, st, pw); return [...c.pieces, bank('z', c.last, outW, outDy)]; };
  const socks = [low('pa', 'kf', [0.2, 0.5]), low('pz', 'z', [0.4, 0.7])];
  return { id, pieces: mk(steps, 120), easy: mk(easySteps, 160), sockets: socks };
};
export const TWISTS: SectionTemplate[] = [
  // (T: the thorns shown from a long ledge he cannot fall from, keyed `show`, then the mildest chain: two wide pillars on both settings)
  brick({ id: 'lib-thorn-teach', name: 'the thorns shown, then two caps', jobs: ['teach'], content: 'bounce', difficulty: 3, teaches: 'thorns', versions: [(() => {
    const show: SectionPiece = { key: 'a', shape: 'bank', w: [420, 480], place: { kind: 'start' }, style: 'moss_stone', main: true, landing: true };
    const mk = () => { const c = chain('k', 'show', [0, 0], 160); return [show, { key: 'show', shape: 'bank', w: [300, 340], place: { kind: 'walk', after: 'a', dy: [0, 0] }, style: 'moss_stone', main: true, landing: true } as SectionPiece, ...c.pieces, bank('z', c.last, [460, 520])]; };
    return { id: 'two-caps', pieces: mk(), sockets: [{ id: 'flag', role: 'flag' as const, on: 'a', t: 0.5 }, { id: 'tip', role: 'tip' as const, on: 'show', t: 0.2 }, low('pz', 'z', [0.3, 0.6])] };
  })()] }),
  brick({ id: 'lib-cap-hop', name: 'three caps at a hop', jobs: ['practise', 'flow'], content: 'bounce', difficulty: 4, versions: [chainV('level3', [0, 0, 0], [0, 0]), chainV('up-level-level', [27, 0, 0], [27, 0])] }),
  brick({ id: 'lib-cap-run', name: 'two chains at a run', jobs: ['flow', 'practise'], content: 'bounce', difficulty: 5, versions: [(() => {
    const mk = (n: number, pw: number) => { const c1 = chain('k', null, Array(n).fill(0), pw), mid = bank('y', c1.last, [300, 340]), c2 = chain('q', 'y', Array(n).fill(0), pw, [300, 340]); return [...c1.pieces, mid, ...c2.pieces, bank('z', c2.last, [320, 380])]; };
    return { id: 'run', pieces: mk(3, 120), easy: mk(2, 160), sockets: [low('pa', 'kf', [0.2, 0.5]), low('py', 'y', [0.3, 0.7]), low('pz', 'z', [0.4, 0.7])] };
  })()] }),
  brick({ id: 'lib-cap-steps-down', name: 'caps stepping down', jobs: ['descent'], content: 'bounce', difficulty: 5, exitDy: 81, versions: [chainV('down3', [-27, -27, -27], [-27, -27, -27])] }),
  brick({ id: 'lib-cap-steps-up', name: 'caps stepping up', jobs: ['climb', 'combine'], content: 'bounce', difficulty: 6, exitDy: -81, versions: [chainV('up3', [27, 27, 27], [27, 27, 27])] }),
  brick({ id: 'lib-cap-test', name: 'a long chain, no ledge between', jobs: ['test', 'twist'], content: 'bounce', difficulty: 6, versions: [chainV('level4', [0, 0, 0, 0], [0, 0, 0]), chainV('down-level-up', [-27, 0, 27, 0], [-27, 0, 27])] }),
  // (S: the signature, one a stage)
  brick({ id: 'lib-thorn-chain', name: 'the bounce chain over the thorn hollow', jobs: ['signature'], content: 'bounce', difficulty: 7, maxPerStage: 1, versions: [chainV('level5', [0, 0, 0, 0, 0], [0, 0, 0]), chainV('level4', [0, 0, 0, 0], [0, 0, 0])] }),
  brick({ id: 'lib-thorn-chain-rise', name: 'the chain rising', jobs: ['signature'], content: 'bounce', difficulty: 7, maxPerStage: 1, versions: [chainV('up-up-level-level', [27, 27, 0, 0], [27, 0, 0], [0, 0])] }),
];

/** TAG edits on World 1's existing sections (no shape changes): these stand on boughs or a high log with nothing under them, which
 *  only a stage whose falls are all soft may hold (1-1's `softFalls`); laid in 1-2 the gate refuses them (`floor.unmarked`,
 *  `drop.untyped`: measured, library-where.ts). Their `feel` says so and 1-2's brief refuses it */
export const CANOPY = ['w1-quiet-arrival', 'w1-sunlit-log', 'w1-last-step-up', 'w1-bough-bench', 'w1-bough-bench-up', 'w1-high-walk', 'w1-high-walk-up'];
/** what the library CANNOT give 1-2, stood in here so a roll builds and counted as NEW in the report: an exit on the ground (all three
 *  of World 1's exits are canopy), a calm walk of a rest's length to the totem (the packet's N24) */
export const NEW_STOOD_IN: SectionTemplate[] = [
  { id: 'new-low-bark-arrival', name: 'a calm walk on a root bank to the totem', archetypes: 'any', phases: ['goal'], difficulty: 1, needs: ['walk'], jobs: ['exit'], content: 'structural', terrain: 'floor-stones',
    pieces: [{ key: 'in', shape: 'bank', w: [300, 340], place: { kind: 'start' }, style: 'moss_stone', main: true, landing: true }],
    subBlocks: [{ id: 'body', versions: [[520, 560], [620, 680]].map((w, j) => ({ id: j ? 'long' : 'short', pieces: [{ key: 'out', shape: 'bank' as const, w: w as R2, place: { kind: 'walk' as const, after: 'in', dy: [0, 0] as R2 }, style: 'moss_stone' as const, main: true, landing: true }], sockets: [{ id: 'exit-totem', role: 'objective' as const, on: 'out', t: 0.85, allow: ['exit_totem'] }] })) }],
    entry: { piece: 'in', kind: 'ground' }, exit: { piece: 'out', kind: 'ground' }, exitDy: 0, sockets: [], mirrorable: false } as SectionTemplate,
];
/** THE WAY DOWN, the one brick World 1's library lacks for any LEVEL stage (measured, `--heights`: of the pool's 140 versions 44 rise,
 *  88 are level and 8 fall: it was cut for a stage that climbs). The packet's own letters: `J` the drop, a ledge 130-140 px lower he
 *  walks off the lip onto; `N` the hop step, a bank one step down with a 50-56 px stump at its middle and a petal on the stump. Never
 *  two silent pieces side by side, never one last (the packet's quiet-line sims): `J N` and `J N J N`. No content type: it serves a
 *  node of any type, where the level lean (pipeline LEVEL_SWING) asks for the way back */
function wayDown(n: number): { pieces: SectionPiece[]; sockets: SectionTemplate['sockets'] } {
  const ps: SectionPiece[] = [{ key: 'a', shape: 'bank', w: [240, 280], place: { kind: 'start' }, style: 'moss_stone', main: true, landing: true }];
  const socks: SectionTemplate['sockets'] = [];
  let prev = 'a';
  for (let j = 0; j < n; j++) {
    ps.push({ key: `j${j}`, shape: 'bank', w: [180, 220], place: { kind: 'walk', after: prev, dy: [130, 140] }, style: 'moss_stone', main: true, landing: true });
    ps.push({ key: `n${j}`, shape: 'bank', w: [300, 360], place: { kind: 'walk', after: `j${j}`, dy: [62, 78] }, style: 'moss_stone', main: true, landing: true });
    ps.push({ key: `s${j}`, shape: 'block', w: [130, 170], place: { kind: 'on', on: `n${j}`, at: [0.45, 0.55], h: [50, 56] }, style: 'moss_stone', landing: true });
    socks.push({ id: `pj${j}`, role: 'pickup', on: `j${j}`, t: 0.5, dn: 34 }, { id: `ps${j}`, role: 'pickup', on: `s${j}`, t: 0.5, dn: 34 });
    prev = `n${j}`;
  }
  return { pieces: ps, sockets: socks };
}
export const WAY_DOWN: SectionTemplate[] = ['a', 'b', 'c'].map((x) => {
  const v = (n: number) => { const g = wayDown(n), z = g.pieces.filter((p) => p.place.kind !== 'on').at(-1)!.key, f = (k: string) => (k === 'a' ? 'in' : k === z ? 'out' : k); return { id: n === 1 ? 'drop-step' : 'two-drops', pieces: g.pieces.slice(1).map((p) => ({ ...p, key: f(p.key), place: Object.fromEntries(Object.entries(p.place).map(([q, w]) => [q, (q === 'after' || q === 'on') && typeof w === 'string' ? f(w) : w])) as SectionPiece['place'] })), sockets: g.sockets.map((k) => ({ ...k, on: f(k.on) })) }; };
  return { id: `lib-way-down-${x}`, name: 'the way down: a drop and a hop step', archetypes: 'any', phases: ['ki', 'sho', 'ten', 'ketsu'], difficulty: 3, needs: ['jump'], jobs: ['practise', 'flow', 'descent', 'combine', 'twist', 'test'], terrain: 'mounds',
    pieces: [{ key: 'in', shape: 'bank', w: [240, 280], place: { kind: 'start' }, style: 'moss_stone', main: true, landing: true }], subBlocks: [{ id: 'body', versions: [v(1), v(2)] }],
    entry: { piece: 'in', kind: 'ground' }, exit: { piece: 'out', kind: 'ground' }, exitDy: 205, sockets: [], mirrorable: false } as SectionTemplate;
});
/** the refusals that are the ENGINE's open items, not a section's: the thorn bed is not painted yet (EN-Y report, B item 2 "drawn") */
export const ENGINE_OPEN = /the heart drop at x .* is drawn as pit-floor-art/;

type Any = any; // eslint-disable-line @typescript-eslint/no-explicit-any
/** `min`: only the six twist bricks a roll cannot do without (the teach, the two signatures, the run, the steps down and up) */
export interface LibOpts { flown?: boolean; pits?: boolean; twists?: boolean; only?: string; min?: boolean; down?: boolean; room?: number }
export const MIN_OUT = ['lib-cap-hop', 'lib-cap-test'];
export const twistsOf = (o: LibOpts = {}) => (o.twists === false ? [] : TWISTS.filter((t) => !o.min || !MIN_OUT.includes(t.id)));
/** the stage id the kit's rows are filed under (`flown`: the flown stage's, as supply12.ts does) */
export const stageIdOf = (o: LibOpts = {}) => (o.flown ? '1-1' : '1-2');
/** World 1's kit with 1-2's brief, graphs, lessons and thorn row, its sections World 1's own untouched plus the twist bricks */
export function kitLib12(o: LibOpts = {}): WorldKit {
  const k = w1World(), M = k.manifest as Any, ID = stageIdOf(o);
  const brief = { ...BRIEF_12, ...(o.pits === false ? { pits: undefined } : {}) };
  const list = [...(o.flown ? [] : M.graphs.list), ...Object.entries(HARVEST_12).filter(([id]) => !o.only || id === o.only).map(([id, code]) => ({ id, archetype: 'harvest', code }))];
  return { ...k, manifest: { ...M,
    sections: [...M.sections.map((t: SectionTemplate) => (CANOPY.includes(t.id) ? { ...t, feel: ['canopy'] } : t)), ...(o.twists === false ? [] : [...twistsOf(o), ...NEW_STOOD_IN, ...(o.down === false ? [] : WAY_DOWN)])],
    hurtFloor: THORN_ROW,
    // (`room`: px of corridor under the floor line. World 1's is 80: cut for a stage that climbs, so a level one can never step down)
    ...((o.room ?? ROOM_12) ? { corridor: { ...M.corridor, bottom: M.ground.y + (o.room ?? ROOM_12) } } : {}),
    lessons: o.flown ? { jump: '0-9', double: '0-9', bounce: '0-9' } : { jump: '1-1', double: '1-1', bounce: '1-1' },
    required: {},
    tips: { ...M.tips, thorns: M.tips?.thorns ?? 'THORNS (stand-in id: Dot\'s line is Content\'s)' },
    graphs: { ...M.graphs, list, briefs: { ...(o.flown ? {} : M.graphs.briefs), [ID]: brief } },
  } } as WorldKit;
}
export function config12(o: LibOpts = {}) {
  const c12 = generateAllLevels().find((c) => c.id === '1-2')!;
  return o.flown ? { ...c12, id: '1-1', miniIndex: 1 } : c12;
}
/** why each of World 1's sections is in or out of 1-2's pool by need */
export function poolReport(o: LibOpts = {}) {
  const M = kitLib12(o).manifest, ID = stageIdOf(o), pool = new Set(stagePool(M, ID).map((t) => t.id));
  const deal = M.graphs!.briefs[ID].deal ?? {};
  const out = M.sections.filter((t) => !pool.has(t.id)).map((t) => ({ id: t.id, why: t.parked ? 'parked' : t.content && t.content !== 'structural' && !(t.content in deal) ? `no ${t.content} in the deal` : `refused: ${(t.feel ?? []).filter((f) => REFUSE_12.includes(f)).join(' ')}` }));
  return { pool: [...pool], out };
}
export const tidy = (e: string) => e.replace(/-?\d+(\.\d+)?/g, '#').replace(/n#/g, 'n#').slice(0, 150);
export function roll(seed: number, difficulty: 'normal' | 'easy', o: LibOpts = {}): { errors: string[]; plan: string[]; graph?: string; thrown?: string; fruit: number; flowers: number; hollows: number; climb?: number; span?: number; said: string[] } {
  try {
    const st: Any = buildGen2Stage({ config: config12(o) as Any, kit: kitLib12(o), seed, difficulty });
    // (the route's height: the top of the widest solid piece under each section's ends; climb = how far the end stands over the start)
    const topAt = (x: number) => Math.min(...st.platforms.filter((p: Any) => p.type === 'solid' && p.pit !== 'hurt' && p.x <= x && p.x + p.width >= x).map((p: Any) => p.y));
    const ys = (st.gen2.sections ?? []).flatMap((q: Any) => [topAt(q.x0 + 12), topAt(q.x1 - 12)]).filter((y: number) => Number.isFinite(y));
    return { said: (st.gen2.fills ?? []).filter((f: Any) => f.role === 'tip' || f.role === 'decor').map((f: Any) => String(f.what)), climb: Math.round(ys[0] - ys[ys.length - 1]), span: Math.round(Math.max(...ys) - Math.min(...ys)), errors: st.gen2.errors ?? [], plan: (st.gen2.plan ?? []).map((p: Any) => p.template), graph: st.gen2.graph?.id ?? st.gen2.graphId, fruit: st.collectibles.filter((c: Any) => c.type === 'fruit').length, flowers: st.collectibles.filter((c: Any) => c.type === 'flower').length, hollows: st.platforms.filter((p: Any) => p.pit === 'hurt').length };
  } catch (e) { return { said: [], errors: [], plan: [], thrown: String((e as Error).message), fruit: 0, flowers: 0, hollows: 0 }; }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const arg = (n: string, d: number) => { const i = process.argv.indexOf(n); return i > 0 ? Number(process.argv[i + 1]) : d; };
  const has = (n: string) => process.argv.includes(n);
  const N = arg('--seeds', 120), from = arg('--from', 1), par = arg('--par', 1);
  const o: LibOpts = { flown: has('--flown'), pits: !has('--no-pits'), twists: !has('--no-twists'), min: has('--min'), down: !has('--no-down'), room: arg('--room', 320) };
  if (has('--json')) {
    for (let s = from; s < from + N; s++) for (const d of ['normal', 'easy'] as const) console.log(JSON.stringify({ seed: s, d, ...roll(s, d, o) }));
  } else {
    const flags = [...['--flown', '--no-pits', '--no-twists', '--min', '--no-down'].filter(has), ...(has('--room') ? ['--room', String(arg('--room', 320))] : [])];
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
    const pr = poolReport(o), M = kitLib12(o).manifest, byId = new Map(M.sections.map((t) => [t.id, t]));
    console.log(`1-2 by need${o.flown ? ' (FLOWN: filed under the flown stage)' : ''}: pool ${pr.pool.length} of ${M.sections.length} (World 1's ${M.sections.filter((t) => t.id.startsWith('w1-')).length} + ${twistsOf(o).length} twist bricks + ${NEW_STOOD_IN.length} new stood in + ${o.down === false ? 0 : WAY_DOWN.length} uses of the way-down brick); out: ${pr.out.map((q) => `${q.id.replace('w1-', '')} (${q.why})`).join(', ') || 'none'}`);
    const sup = new Map<string, string[]>();
    for (const id of pr.pool) { const t = byId.get(id)!; for (const j of t.jobs ?? ['(phases)']) { const k = `${j}/${t.content ?? '-'}`; sup.set(k, [...(sup.get(k) ?? []), id.replace('w1-', '')]); } }
    console.log('supply by job/type:'); for (const [k, v] of [...sup].sort()) console.log(`   ${k.padEnd(26)} ${String(v.length).padStart(2)}  ${v.join(', ')}`);
    const used = new Map<string, number>();
    for (const d of ['normal', 'easy'] as const) {
      const R = rows.filter((r) => r.d === d), clean = R.filter((r) => !r.thrown && !r.errors.length);
      const kinds = new Map<string, number>();
      const butDraw = R.filter((r) => !r.thrown && r.errors.every((e: string) => ENGINE_OPEN.test(e)));
      console.log(`== ${d}: clean but for the thorn bed's draw (the engine's open item): ${butDraw.length} of ${R.length} (${Math.round((100 * butDraw.length) / Math.max(1, R.length))}%)`);
      for (const r of R) for (const e of new Set<string>((r.thrown ? ['THROW ' + r.thrown] : r.errors.filter((q: string) => !ENGINE_OPEN.test(q))).map(tidy))) kinds.set(e, (kinds.get(e) ?? 0) + 1);
      for (const r of R) for (const t of r.plan) used.set(t, (used.get(t) ?? 0) + 1);
      const avg = (f: (r: Any) => number) => (butDraw.length ? Math.round((butDraw.reduce((s, r) => s + f(r), 0) / butDraw.length) * 10) / 10 : 0);
      console.log(`== ${d}: ${R.length} rolls (seeds ${from}-${from + N - 1}): CLEAN ${clean.length} (${Math.round((100 * clean.length) / Math.max(1, R.length))}%), thrown ${R.filter((r) => r.thrown).length}, pool short ${R.filter((r) => r.errors.some((e: string) => /pool short|fits no node|no section/.test(e))).length}; a roll clean but for the draw: ${avg((r) => r.plan.length)} sections, ${avg((r) => r.plan.filter((t: string) => t.startsWith('lib-')).length)} of them twist bricks, ${avg((r) => r.hollows)} hollows, ${avg((r) => r.flowers)} petals, ${avg((r) => r.fruit)} blooms`);
      const ok = butDraw.filter((r) => r.climb !== undefined), med = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)] ?? 0;
      console.log(`   the route's height on those rolls: the end stands ${med(ok.map((r) => r.climb))} px over the start (median; ${Math.min(...ok.map((r) => r.climb))} to ${Math.max(...ok.map((r) => r.climb))}), highest to lowest ${med(ok.map((r) => r.span))} px (median; most ${Math.max(...ok.map((r) => r.span))})`);
      for (const [k, v] of [...kinds].sort((a, b) => b[1] - a[1]).slice(0, 14)) console.log(`   ${String(v).padStart(4)}  ${k}`);
    }
    const lib = pr.pool.filter((id) => id.startsWith('w1-'));
    console.log(`World 1 sections laid at least once: ${lib.filter((id) => used.get(id)).length} of ${lib.length}; never laid: ${lib.filter((id) => !used.get(id)).map((s) => s.replace('w1-', '')).join(', ') || 'none'}`);
    console.log(`twist bricks laid: ${[...twistsOf(o), ...WAY_DOWN].map((t) => `${t.id}:${used.get(t.id) ?? 0}`).join(' ')}`);
  }
}
