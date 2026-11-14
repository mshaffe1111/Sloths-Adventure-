// scratch: one W1 mix string on one seed: its sections (with joins) and the pieces around an x range
// Usage: npx tsx gapdump.ts "<code>" <seed> <x0> <x1>
import '../../../../src/game/headlessDom.ts';
import { buildGen2Stage } from '../../../../src/game/gen2/pipeline.ts';
import { w1World } from '../../../../src/game/gen2/worlds/w1.ts';
import { generateAllLevels } from '../../../../src/game/worldsData.ts';
const W1 = w1World();
const cfg = generateAllLevels().find((l) => l.id === '1-1')!;
const code = process.argv[2], seed = Number(process.argv[3]);
const x0 = Number(process.argv[4] ?? 0), x1 = Number(process.argv[5] ?? 1e9);
const kit = { ...W1, manifest: { ...W1.manifest, graphs: { ...W1.manifest.graphs!, list: [{ id: 'mix', archetype: 'sprint', code }] } } } as never;
const st: any = buildGen2Stage({ config: cfg, kit, seed, difficulty: 'normal' });
console.log('errors:', st.gen2.errors.map((e: string) => e.slice(0, 120)).join('\n  '));
console.log('nodes:', st.gen2.graph.nodes.map((n: any) => `${n.id}:${n.token ?? n.job}${n.asked ? '*' : ''}`).join(' '));
const plan = st.gen2.plan as any[];
st.gen2.sections.forEach((q: any, i: number) => {
  if (q.x1 < x0 - 3000 || q.x0 > x1 + 3000) return;
  console.log(`sec ${i} ${q.template} node ${q.node} x ${q.x0}..${q.x1} entry ${JSON.stringify(q.entry)} exit ${JSON.stringify(q.exit)} join ${plan[i]?.join ?? ''}`);
});
for (const p of st.platforms) if (p.x + p.width > x0 - 400 && p.x < x1 + 400) console.log(`  plat ${p.id} ${p.type} x ${p.x}..${p.x + p.width} y ${p.y} h ${p.height}${p.drop ? ' drop' : ''}${p.pit ? ' pit:' + p.pit : ''}${p.soil ? ' soil' : ''}`);
console.log('drops near:', JSON.stringify((st.gen2.drops ?? []).filter((d: any) => d.x1 > x0 - 400 && d.x0 < x1 + 400)).slice(0, 600));
console.log('heartFalls near:', JSON.stringify((st.heartFalls ?? []).filter((d: any) => d.x1 > x0 - 400 && d.x0 < x1 + 400)).slice(0, 400));
