// VARIETY-2: one W1 mix string on one seed: the repair loop's record (each swap and why), the slots its rules could not fill (pool
// short), and each node's dealt type against what was laid. Usage: npx tsx repairs.ts "<code>" <seed>
import '../../../../src/game/headlessDom.ts';
import { buildGen2Stage } from '../../../../src/game/gen2/pipeline.ts';
import { w1World } from '../../../../src/game/gen2/worlds/w1.ts';
import { generateAllLevels } from '../../../../src/game/worldsData.ts';
const W1 = w1World();
const cfg = generateAllLevels().find((l) => l.id === '1-1')!;
const [code, seed] = [process.argv[2], Number(process.argv[3])];
const kit = { ...W1, manifest: { ...W1.manifest, graphs: { ...W1.manifest.graphs!, list: [{ id: 'mix', archetype: 'sprint', code }] } } } as never;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const st: any = buildGen2Stage({ config: cfg, kit, seed, difficulty: 'normal' });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const T = new Map((W1.manifest.sections as any[]).map((t) => [t.id, t]));
console.log('errors:\n  ' + (st.gen2.errors as string[]).map((e) => e.slice(0, 140)).join('\n  '));
console.log('rerolls', st.gen2.rerolls, 'repairs:\n  ' + ((st.gen2.repairs ?? []) as Array<{ kind: string; section?: string; note: string }>).map((r) => `${r.kind} ${r.section ?? ''} ${r.note.slice(0, 150)}`).join('\n  '));
console.log('loosened:', JSON.stringify(st.gen2.loosened ?? []).slice(0, 300));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
st.gen2.plan.forEach((p: any, i: number) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const n = (st.gen2.graph.nodes as any[]).find((q) => q.id === st.gen2.sections[i]?.node);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  console.log(`slot ${i} ${p.template} [${(T.get(p.template) as any)?.content}] node ${n?.id} ${n?.job} dealt ${n?.content ?? '-'}${n?.asked ? ' asked ' + JSON.stringify(n.asked) : ''}`);
});
