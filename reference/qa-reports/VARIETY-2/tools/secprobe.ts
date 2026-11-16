// VARIETY-2 probe: one W1 mix string on one seed: the ground line findW1Pits reads (G), one section's pieces, and every pit/fall the
// painter's ruler finds inside it (with drop marks). Usage: npx tsx secprobe.ts "<code>" <seed> <template>
import '../../../../src/game/headlessDom.ts';
import { buildGen2Stage } from '../../../../src/game/gen2/pipeline.ts';
import { w1World } from '../../../../src/game/gen2/worlds/w1.ts';
import { generateAllLevels } from '../../../../src/game/worldsData.ts';
import { findW1Pits } from '../../../../src/game/w1Pits.ts';
const W1 = w1World();
const cfg = generateAllLevels().find((l) => l.id === '1-1')!;
const [code, seed, tpl] = [process.argv[2], Number(process.argv[3]), process.argv[4]];
const kit = { ...W1, manifest: { ...W1.manifest, graphs: { ...W1.manifest.graphs!, list: [{ id: 'mix', archetype: 'sprint', code }] } } } as never;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const st: any = buildGen2Stage({ config: cfg, kit, seed, difficulty: 'normal' });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const P = st.platforms as any[];
const banks = P.filter((q) => q.height >= 90 && q.type === 'solid');
const tops = new Map<number, number>();
for (const b of banks) tops.set(Math.round(b.y), (tops.get(Math.round(b.y)) ?? 0) + b.width);
const T = [...tops].sort((p, q) => q[1] - p[1]);
console.log(`G ${T[0][0]} (bank tops by width: ${T.slice(0, 5).map(([y, w]) => `${y}:${Math.round(w)}`).join(' ')}) ground.y ${st.gen2.ground?.y ?? '?'}`);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
for (const q of (st.gen2.sections as any[]).filter((s) => s.template === tpl)) {
  console.log(`${q.template} node ${q.node} x ${q.x0}..${q.x1}`);
  for (const p of P.filter((p) => p.x + p.width > q.x0 - 120 && p.x < q.x1 + 120)) console.log(`  plat ${p.id} ${p.type} x ${p.x}..${p.x + p.width} y ${p.y} h ${p.height}${p.pit ? ' pit:' + p.pit : ''}${p.drop ? ' drop' : ''}`);
  for (const g of findW1Pits(P).filter((g) => g.x1 > q.x0 - 120 && g.x0 < q.x1 + 120)) console.log(`  PIT ${g.kind} ${Math.round(g.x0)}..${Math.round(g.x1)} top ${g.top}${g.drop ? ' drop' : ''}${'floor' in g ? ' floor ' + g.floor : ''}`);
}
console.log('errors:', (st.gen2.errors as string[]).filter((e) => /floor|drop|dead/.test(e)).map((e) => e.slice(0, 110)).join(' | '));
