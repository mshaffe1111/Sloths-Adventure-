import '../wt-b27c-f1/src/game/headlessDom.ts';
import { generateAllLevels } from '../wt-b27c-f1/src/game/worldsData.ts';
import { generateStage } from '../wt-b27c-f1/src/game/stageGenerator.ts';
import { validateStage } from '../wt-b27c-f1/src/game/levelCheck.ts';
import { easyStage } from '../wt-b27c-f1/src/game/easyMode.ts';
const cfg = generateAllLevels().find((c) => c.id === '2-7' && !c.secret)!;
for (const d of ['normal', 'easy'] as const) {
  const st: any = d === 'easy' ? easyStage(generateStage(cfg, d)) : generateStage(cfg, d);
  console.log(d, 'seed', st.gen2?.seed, 'cps', JSON.stringify(st.checkpoints.map((c: any) => [Math.round(c.x), Math.round(c.y)])), 'errors', JSON.stringify(validateStage(st).errors));
}
