// VAR-19e probe: one section's tagged pieces and the animals over it, as Play builds and finishes a listed layout.
// usage: npx tsx one.ts <stage> <layout> <normal|easy> <template>
import '../../../../src/game/headlessDom.ts';
import { generateAllLevels } from '../../../../src/game/worldsData.ts';
import { listedStage, playFinish } from '../../../../src/game/gen2/listed.ts';
import { loadSeedList, provenSeeds, buildPlayStage } from '../../../../src/game/gen2/seedList.ts';
const [id, v, d, tpl] = [process.argv[2], Number(process.argv[3]), process.argv[4] as 'normal' | 'easy', process.argv[5]];
const cfg = generateAllLevels().find((c) => c.id === id && !c.secret)!;
const row = listedStage(id)!;
await loadSeedList(id);
const st: any = playFinish(row, structuredClone(buildPlayStage(cfg, row.kit(), provenSeeds(id)[v - 1], d)), d);
for (const q of st.gen2.sections.filter((s: any) => s.template === tpl).slice(0, 1)) {
  console.log(q.uid, q.x0, q.x1);
  for (const p of st.platforms.filter((p: any) => p.x < q.x1 && p.x + p.width > q.x0)) console.log(`  ${p.tag ?? '-'} ${p.type} x${Math.round(p.x)}-${Math.round(p.x + p.width)} y${Math.round(p.y)} h${Math.round(p.height)}`);
  for (const e of st.enemies.filter((e: any) => e.x < q.x1 && e.x + e.width > q.x0)) console.log(`  enemy ${e.type} x${Math.round(e.x)} w${e.width} y${Math.round(e.y)} h${e.height} patrol ${e.patrolMinX}-${e.patrolMaxX}`);
  console.log(JSON.stringify(st.gen2.fills.filter((f: any) => f.section === q.uid && f.role === 'enemy')));
}
for (const q of st.gen2.sections.filter((s: any) => s.template === tpl).slice(0, 1)) {
  for (const b of (st.proto.bushes ?? []).filter((b: any) => b.x < q.x1 && b.x + b.w > q.x0)) console.log(`  bush x${b.x}-${b.x + b.w} y${b.y}`);
  console.log(`  next section: ${JSON.stringify(st.gen2.sections[st.gen2.sections.indexOf(q) + 1]?.template)}`);
}
