// scratch: one mix string on one seed: every node (job, dealt content, asks, token) and its laid sections' content and dy
// Usage: npx tsx nodedump.ts "<code>" <seed> [w1|toy]
import '../../../../src/game/headlessDom.ts';
import { buildGen2Stage } from '../../../../src/game/gen2/pipeline.ts';
import { w1World } from '../../../../src/game/gen2/worlds/w1.ts';
import { towerCfg } from '../../../../src/game/gen2/toyTower.ts';
import { mixKit } from '../../../../src/game/gen2/toyLegs.ts';
import { generateAllLevels } from '../../../../src/game/worldsData.ts';
const W1 = w1World();
const code = process.argv[2], seed = Number(process.argv[3]);
const which = process.argv[4] ?? 'w1';
const K = which === 'toy'
  ? { config: towerCfg('5-95', 'sprint'), kit: (c: string) => mixKit('5-95', c) }
  : { config: generateAllLevels().find((l) => l.id === '1-1')!, kit: (c: string) => ({ ...W1, manifest: { ...W1.manifest, graphs: { ...W1.manifest.graphs!, list: [{ id: 'mix', archetype: 'sprint', code: c }] } } }) as never as ReturnType<typeof mixKit> };
const kit = K.kit(code);
const st: any = buildGen2Stage({ config: K.config, kit, seed, difficulty: 'normal' });
const T = new Map(kit.manifest.sections.map((t: any) => [t.id, t]));
console.log('errors:\n  ' + st.gen2.errors.map((e: string) => e.slice(0, 150)).join('\n  '));
for (const n of st.gen2.graph.nodes as any[]) {
  const secs = (st.gen2.sections as any[]).filter((q) => q.node === n.id);
  console.log(`${n.id} ${n.job ?? n.phase} content=${n.content ?? '-'} token=${n.token ?? ''} asked=${n.asked ? JSON.stringify(n.asked) : '-'}`);
  for (const q of secs) { const t: any = T.get(q.template); console.log(`     ${q.template} [${t?.content}] x ${q.x0}..${q.x1} dy ${t?.exitDy ?? '?'}`); }
}
