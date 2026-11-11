/**
 * finds11.ts: what the fork high roads of built 1-1 rolls really hold (the Designer, found while writing the 1-2 packet; read-only).
 *   npx tsx reference/specs/sims/finds11.ts
 */
import '../../../src/game/headlessDom.ts';
import { buildPlayStage } from '../../../src/game/gen2/seedList.ts';
import { w1World, W1_SECTIONS } from '../../../src/game/gen2/worlds/w1.ts';
import { generateAllLevels } from '../../../src/game/worldsData.ts';
const config = generateAllLevels().find((c) => c.id === '1-1')!;
for (const seed of [4106, 1025, 1136]) {
  const st = buildPlayStage(config, w1World(), seed, 'normal') as any;
  const secs = st.gen2.sections as Array<any>;
  const fills = (st.gen2.fills ?? []) as Array<any>;
  const withFind = secs.filter((q) => { const t = W1_SECTIONS.find((s) => s.id === (q.template ?? q.id)); return t && JSON.stringify(t.subBlocks).includes('"role":"find"'); });
  console.log(`seed ${seed}: sections with a find socket: ${withFind.map((q) => q.template ?? q.id).join(', ')}`);
  console.log(`   find fills: ${fills.filter((f) => f.role === 'find').map((f) => `${f.what}@${Math.round(f.x)} in ${f.section}`).join('; ') || 'none'}`);
  for (const q of withFind) {
    const near = (st.collectibles as Array<any>).filter((c) => c.x >= q.x0 && c.x <= q.x1);
    console.log(`   ${q.template ?? q.id} x ${Math.round(q.x0)}-${Math.round(q.x1)} uid ${q.uid}: collectibles ${near.length} (${[...new Set(near.map((c) => c.type))].join(',')})`);
  }
}
console.log('--- high-road pieces (thin, 150 px or more over the section floor) with nothing over them');
for (const setting of ['normal', 'easy'] as const) for (const seed of [4106, 1025, 1136]) {
  const st = buildPlayStage(config, w1World(), seed, setting) as any;
  for (const q of st.gen2.sections as Array<any>) {
    const id = q.template ?? q.id;
    if (!/fork|twoway|weave/.test(id)) continue;
    const ps = (st.platforms as Array<any>).filter((p) => p.x >= q.x0 && p.x + p.width <= q.x1 && p.height <= 30 && p.type === 'solid');
    for (const p of ps) {
      const over = (st.collectibles as Array<any>).filter((c) => c.x >= p.x - 10 && c.x <= p.x + p.width + 10 && c.y <= p.y && c.y >= p.y - 110);
      if (!over.length) console.log(`   ${setting} seed ${seed} ${id}: thin piece x ${Math.round(p.x)}-${Math.round(p.x + p.width)} y ${Math.round(p.y)} holds nothing`);
    }
  }
}
