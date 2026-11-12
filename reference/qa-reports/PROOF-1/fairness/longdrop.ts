// PROOF-1 item 3: 4-7 (travel 'down'): where the shrine stands against the spawn, so the travel mode's walls can be compared with main's
//   npx tsx reference/qa-reports/PROOF-1/fairness/longdrop.ts
import '../../../../src/game/headlessDom.ts';
import { generateAllLevels } from '../../../../src/game/worldsData.ts';
import { generateStage } from '../../../../src/game/stageGenerator.ts';
for (const d of ['normal', 'easy'] as const) {
  const lv = { ...generateAllLevels().find((l) => l.id === '4-7')!, unlocked: true };
  const st = generateStage(lv, d) as any;
  console.log(d, 'travel', st.config.travel, 'exitX', st.exitTotemX, 'exitY', st.exitTotemY, 'spawn', st.spawnX, st.spawnY, 'width', st.config.levelWidth, 'objective', st.config.objectiveType);
}
