// VAR-19d probe: read-bare's boa on a listed layout: where its socket's piece 'b' lies, where the boa is on the bare play build and after
// the row's finish, and every flag in the section. usage: npx tsx bareboa.ts <layout> <normal|easy>
import '../../../../src/game/headlessDom.ts';
import { generateAllLevels } from '../../../../src/game/worldsData.ts';
import { listedStage, playFinish } from '../../../../src/game/gen2/listed.ts';
import { loadSeedList, provenSeeds, buildPlayStage } from '../../../../src/game/gen2/seedList.ts';
const [v, d] = [Number(process.argv[2] ?? 1), (process.argv[3] ?? 'normal') as 'normal' | 'easy'];
const cfg = generateAllLevels().find((c) => c.id === '1-9' && !c.secret)!;
const row = listedStage('1-9')!;
await loadSeedList('1-9');
const raw: any = buildPlayStage(cfg, row.kit(), provenSeeds('1-9')[v - 1], d);
const fin: any = playFinish(row, structuredClone(raw), d);
for (const [n, st] of [['raw', raw], ['finished', fin]] as const) {
  const q = st.gen2.sections.find((s: any) => s.template === 'w1-19-read-bare');
  const ps = st.platforms.filter((p: any) => p.tag?.startsWith(`${q.uid}:`)).map((p: any) => `${p.tag.split(':')[1]}@${Math.round(p.x)}-${Math.round(p.x + p.width)} y${Math.round(p.y)}`);
  const boas = st.enemies.filter((e: any) => e.type === 'boa' && e.x >= q.x0 && e.x < q.x1).map((e: any) => `${Math.round(e.x)}@y${Math.round(e.y)}`);
  const flags = (st.checkpoints ?? []).filter((c: any) => c.x >= q.x0 && c.x < q.x1).map((c: any) => Math.round(c.x));
  console.log(`${n}: ${ps.join(' ')} | boa ${boas.join(' ')} | flags ${flags.join(' ')}`);
}
