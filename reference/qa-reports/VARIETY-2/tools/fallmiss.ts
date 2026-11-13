// VARIETY-2: every '_' (falling) ask on World 1's 1-1 in the mix strings (mixlist.ts output): its node's job, its place among the
// nodes, whether it was laid or named a miss, and the rise rules (V19's riseTo / needsRise) that bind the node.
// Usage: npx tsx fallmiss.ts <mixlist.json>
import '../../../../src/game/headlessDom.ts';
import { readFileSync } from 'node:fs';
import { buildGen2Stage } from '../../../../src/game/gen2/pipeline.ts';
import { w1World } from '../../../../src/game/gen2/worlds/w1.ts';
import { generateAllLevels } from '../../../../src/game/worldsData.ts';
const W1 = w1World();
const cfg = generateAllLevels().find((l) => l.id === '1-1')!;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rows = JSON.parse(readFileSync(process.argv[2], 'utf8')) as any[];
const tally = new Map<string, number>();
for (const row of rows.filter((x) => /_/.test(x.code))) {
  const kit = { ...W1, manifest: { ...W1.manifest, graphs: { ...W1.manifest.graphs!, list: [{ id: 'mix', archetype: 'sprint', code: row.code }] } } } as never;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const st: any = buildGen2Stage({ config: cfg, kit, seed: row.seed, difficulty: 'normal' });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nodes = st.gen2.graph.nodes as any[];
  nodes.forEach((n, k) => {
    if (n.asked?.shape !== '_') return;
    const miss = (st.gen2.errors as string[]).find((e) => e.startsWith(`ask: node ${n.id} `) && /shape _/.test(e));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const secs = (st.gen2.sections as any[]).filter((q) => q.node === n.id);
    const share = secs.length ? ((secs[0].x0 + secs[secs.length - 1].x1) / 2) / st.config.levelWidth : -1;
    const next = nodes[k + 1];
    const key = `${n.job}${miss ? ' MISS' : ' laid'}`;
    tally.set(key, (tally.get(key) ?? 0) + 1);
    console.log(`#${row.i} ${n.id} ${n.job} (${k + 1}/${nodes.length}, next ${next?.job}) at ${share.toFixed(2)} of the stage: ${miss ? miss.slice(0, 90) : 'laid'}; rise ${JSON.stringify(st.gen2.rise ?? null).slice(0, 80)}`);
  });
}
console.log([...tally].map(([k, n]) => `${k} ${n}`).join(', '));
