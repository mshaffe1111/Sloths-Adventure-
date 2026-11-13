/**
 * 1-2 The Petal Trail's proof, tool-side (D12, 11-12): the DESIGNED arc (reference/design/1-2.md; its rows are World 1's shipped data,
 * src/game/gen2/worlds/w1Arc12.ts) rolled in the real pipeline on both settings, every roll judged on its own setting's verdicts.
 *   npx tsx tools/engine/library.ts [--seeds 120] [--from 1] [--par 4] [--flown] [--no-pits] [--json]
 * Prints: the pool (1-2's own sections only), and per setting how many rolls are CLEAN (no gen2.errors), the beats in order, seconds
 * (the time model), the quiet line (Normal), flags, and every refusing line counted. Nothing in the game imports it.
 * (EN-L's piece-library roll, 1-2 dealt from World 1's library, is gone: new replaces old. CANOPY and NEW_STOOD_IN stay here, tool-side,
 * only because tools/engine/library13.ts still reads them; they are no longer 1-2's data.)
 */
import '../../src/game/headlessDom.ts';
import { fileURLToPath } from 'node:url';
import { buildGen2Stage, stagePool } from '../../src/game/gen2/pipeline.ts';
import { generateAllLevels } from '../../src/game/worldsData.ts';
import type { SectionTemplate } from '../../src/game/gen2/types.ts';
import { ARC_12, BEATS_12, BRIEF_12, EXIT_12, LINES_12, QUIET_12, ROOM_12, SECTIONS_12, STAGE_12, TEACH_12, THORN_ROW, kitLib12, stageIdOf, type LibOpts } from '../../src/game/gen2/worlds/w1Arc12.ts';
import { quietOf } from './listRules.ts';
export { ARC_12, BEATS_12, BRIEF_12, EXIT_12, LINES_12, QUIET_12, ROOM_12, SECTIONS_12, STAGE_12, TEACH_12, THORN_ROW, kitLib12, stageIdOf, type LibOpts };
type Any = any; // eslint-disable-line @typescript-eslint/no-explicit-any

/** tool-side, for library13.ts only: World 1's sections that stand on boughs or a high log with nothing under them (their `feel` there
 *  is 'canopy'), and the old stood-in ground exit */
export const CANOPY = ['w1-quiet-arrival', 'w1-sunlit-log', 'w1-last-step-up', 'w1-bough-bench', 'w1-bough-bench-up', 'w1-high-walk', 'w1-high-walk-up'];
type R2 = [number, number];
export const NEW_STOOD_IN: SectionTemplate[] = [
  { id: 'new-low-bark-arrival', name: 'a calm walk on a root bank to the totem', archetypes: 'any', phases: ['goal'], difficulty: 1, needs: ['walk'], jobs: ['exit'], content: 'structural', terrain: 'floor-stones',
    pieces: [{ key: 'in', shape: 'bank', w: [300, 340], place: { kind: 'start' }, style: 'moss_stone', main: true, landing: true }],
    subBlocks: [{ id: 'body', versions: [[520, 560], [620, 680]].map((w, j) => ({ id: j ? 'long' : 'short', pieces: [{ key: 'out', shape: 'bank' as const, w: w as R2, place: { kind: 'walk' as const, after: 'in', dy: [0, 0] as R2 }, style: 'moss_stone' as const, main: true, landing: true }], sockets: [{ id: 'exit-totem', role: 'objective' as const, on: 'out', t: 0.85, allow: ['exit_totem'] }] })) }],
    entry: { piece: 'in', kind: 'ground' }, exit: { piece: 'out', kind: 'ground' }, exitDy: 0, sockets: [], mirrorable: false } as SectionTemplate,
];
export const tidy = (e: string) => e.replace(/-?\d+(\.\d+)?/g, '#').replace(/n#/g, 'n#').slice(0, 150);

export function config12(o: LibOpts = {}) {
  const c12 = generateAllLevels().find((c) => c.id === STAGE_12)!;
  return o.flown ? { ...c12, id: '1-1', miniIndex: 1 } : c12;
}
/** 1-2's pool: its own sections, and anything of the kit's that is not in it with why */
export function poolReport(o: LibOpts = {}) {
  const M = kitLib12(o).manifest, ID = stageIdOf(o), pool = new Set(stagePool(M, ID).map((t) => t.id));
  return { pool: [...pool], out: M.sections.filter((t) => !pool.has(t.id)).map((t) => ({ id: t.id, why: t.parked ? 'parked' : `feel ${JSON.stringify(t.feel ?? [])}` })) };
}
export interface Roll12 {
  errors: string[]; plan: string[]; graph?: string; thrown?: string; said: string[];
  seconds?: number; fast?: number; width?: number; quiet?: number; flags: number; flowers: number; fruit: number; hollows: number; caps: number;
}
export function build(seed: number, difficulty: 'normal' | 'easy', o: LibOpts = {}): Any {
  return buildGen2Stage({ config: config12(o) as Any, kit: kitLib12(o), seed, difficulty });
}
export function roll(seed: number, difficulty: 'normal' | 'easy', o: LibOpts = {}): Roll12 {
  try {
    const st: Any = build(seed, difficulty, o);
    return {
      errors: st.gen2.errors ?? [], plan: (st.gen2.sections ?? []).map((q: Any) => q.template), graph: st.gen2.graph?.id ?? st.gen2.graphId,
      said: (st.gen2.fills ?? []).filter((f: Any) => f.role === 'tip').map((f: Any) => String(f.what)),
      seconds: st.gen2.modelled?.typical, fast: st.gen2.modelled?.fast, width: st.exitTotemX,
      quiet: difficulty === 'normal' ? quietOf(config12(o) as Any, st).quiet : undefined,
      flags: (st.checkpoints ?? []).length, flowers: st.collectibles.filter((c: Any) => c.type === 'flower').length, fruit: st.collectibles.filter((c: Any) => c.type === 'fruit').length,
      hollows: (st.heartFalls ?? []).length, caps: st.platforms.filter((p: Any) => p.type === 'bouncy').length,
    };
  } catch (e) { return { errors: [], plan: [], said: [], thrown: String((e as Error).message), flags: 0, flowers: 0, fruit: 0, hollows: 0, caps: 0 }; }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const arg = (n: string, d: number) => { const i = process.argv.indexOf(n); return i > 0 ? Number(process.argv[i + 1]) : d; };
  const has = (n: string) => process.argv.includes(n);
  const N = arg('--seeds', 120), from = arg('--from', 1), par = arg('--par', 1);
  const o: LibOpts = { flown: has('--flown'), pits: !has('--no-pits'), room: arg('--room', ROOM_12) };
  if (has('--json')) {
    for (let s = from; s < from + N; s++) for (const d of ['normal', 'easy'] as const) console.log(JSON.stringify({ seed: s, d, ...roll(s, d, o) }));
  } else {
    const flags = [...['--flown', '--no-pits'].filter(has), ...(has('--room') ? ['--room', String(arg('--room', ROOM_12))] : [])];
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
    const pr = poolReport(o);
    console.log(`1-2, the designed arc${o.flown ? ' (FLOWN: filed under the flown stage)' : ''}: graph ${Object.values(ARC_12)[0]}; pool ${pr.pool.length} (${pr.pool.join(' ')})`);
    const beats = BEATS_12.map((t) => t.id);
    for (const d of ['normal', 'easy'] as const) {
      const R = rows.filter((r) => r.d === d), clean = R.filter((r) => !r.thrown && !r.errors.length);
      const inOrder = R.filter((r) => JSON.stringify(r.plan.filter((t: string) => beats.includes(t))) === JSON.stringify(beats)).length;
      const range = (f: (r: Any) => number | undefined) => { const xs = R.map(f).filter((x): x is number => typeof x === 'number'); return xs.length ? `${Math.round(Math.min(...xs) * 10) / 10}-${Math.round(Math.max(...xs) * 10) / 10}` : '-'; };
      console.log(`== ${d}: ${R.length} rolls (seeds ${from}-${from + N - 1}): CLEAN ${clean.length} (${Math.round((100 * clean.length) / Math.max(1, R.length))}%), thrown ${R.filter((r) => r.thrown).length}; the seven beats in order on ${inOrder}`);
      console.log(`   typical ${range((r) => r.seconds)} s, fast ${range((r) => r.fast)} s, quiet ${range((r) => r.quiet)} s, flags ${range((r) => r.flags)}, petals ${range((r) => r.flowers)}, thorn hollows ${range((r) => r.hollows)}, mushrooms ${range((r) => r.caps)}`);
      const kinds = new Map<string, number>();
      for (const r of R) for (const e of new Set<string>((r.thrown ? ['THROW ' + r.thrown] : r.errors).map(tidy))) kinds.set(e, (kinds.get(e) ?? 0) + 1);
      for (const [k, v] of [...kinds].sort((a, b) => b[1] - a[1]).slice(0, 14)) console.log(`   ${String(v).padStart(4)}  ${k}`);
    }
  }
}
