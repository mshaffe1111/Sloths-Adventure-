// BUILD-27d: 2-7's laid hints (x and first words) on a roll, to set way.2-7's 'post:letter' moment against the jetty's lines
import '../../../../src/game/headlessDom.ts';
import { buildGen2Stage } from '../../../../src/game/gen2/pipeline.ts';
import { listedStage, worldFinish } from '../../../../src/game/gen2/listed.ts';
import { generateAllLevels } from '../../../../src/game/worldsData.ts';
const cfg = generateAllLevels().find((c) => c.id === '2-7' && !c.secret)!;
for (const s of [1, 2]) {
  const row = listedStage('2-7')!;
  const st: any = worldFinish(row)(buildGen2Stage({ config: cfg, kit: row.kit(), seed: s, difficulty: 'normal' }) as never, false, 'normal');
  console.log('seed', s, 'spawn', Math.round(st.spawnX ?? st.spawn?.x), (st.proto?.hints ?? []).filter((q: any) => q.x < 9000).map((q: any) => `${Math.round(q.x)}:${String(q.text).slice(0, 28)}`).join(' | '));
}
