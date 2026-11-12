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
import { generateAllLevels } from '../../src/game/worldsData.ts';
import type { GraphBrief, NodeJob, SectionPiece, SectionTemplate, WorldKit } from '../../src/game/gen2/types.ts';

// (1-2's rows are World 1's shipped data now, P12S: src/game/gen2/worlds/w1Arc12.ts; this tool rolls and reports on them)
import { BRIEF_12, CANOPY, ENGINE_OPEN, HARVEST_12, MIN_OUT, NEW_STOOD_IN, REFUSE_12, ROOM_12, THORN_ROW, TWISTS, WAY_DOWN, kitLib12, stageIdOf, twistsOf, type LibOpts } from '../../src/game/gen2/worlds/w1Arc12.ts';
export { BRIEF_12, CANOPY, ENGINE_OPEN, HARVEST_12, MIN_OUT, NEW_STOOD_IN, REFUSE_12, ROOM_12, THORN_ROW, TWISTS, WAY_DOWN, kitLib12, stageIdOf, twistsOf, type LibOpts };
type Any = any; // eslint-disable-line @typescript-eslint/no-explicit-any
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
  const o: LibOpts = { flown: has('--flown'), pits: !has('--no-pits'), twists: !has('--no-twists'), min: has('--min'), down: !has('--no-down'), allPits: has('--all-pits'), room: arg('--room', 320) };
  if (has('--json')) {
    for (let s = from; s < from + N; s++) for (const d of ['normal', 'easy'] as const) console.log(JSON.stringify({ seed: s, d, ...roll(s, d, o) }));
  } else {
    const flags = [...['--flown', '--no-pits', '--no-twists', '--min', '--no-down', '--all-pits'].filter(has), ...(has('--room') ? ['--room', String(arg('--room', 320))] : [])];
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
