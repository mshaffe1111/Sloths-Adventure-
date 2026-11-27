// BUILD-26: hearts and their fields on a listed stage (argv: stage ids)
import '../../../src/game/headlessDom.ts';
import { generateAllLevels } from '../../../src/game/worldsData.ts';
import { listedStage, playFinish } from '../../../src/game/gen2/listed.ts';
import { buildGen2Stage } from '../../../src/game/gen2/pipeline.ts';
for (const id of process.argv.slice(2)) {
  const cfg = generateAllLevels().find((c) => c.id === id && !c.secret)!;
  const row = listedStage(id)!;
  for (const d of ['normal', 'easy'] as const) {
    const st: any = playFinish(row, buildGen2Stage({ config: cfg, kit: row.kit(), seed: 1, difficulty: d }) as never, d);
    const keys = Object.keys(st).filter((k) => /heart/i.test(k));
    console.log(id, d, 'collectible kinds', JSON.stringify([...new Set(st.collectibles.map((c: any) => c.type))]), 'heart keys', keys.join(','), 'gen2 heart keys', Object.keys(st.gen2).filter((k) => /heart/i.test(k)).join(','), 'hearts', st.collectibles.filter((c: any) => /heart/.test(c.type)).length);
  }
}
