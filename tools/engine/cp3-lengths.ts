// CP3: the quick-route clock (stageTime.ts MODEL_FAST) of World 1's stages as built today, both settings: the base for a spread rule
import '../../src/game/headlessDom.ts';
import { generateAllLevels } from '../../src/game/worldsData.ts';
import { generateStage, setLayoutVariant } from '../../src/game/stageGenerator.ts';
import { easyStage } from '../../src/game/easyMode.ts';
import { withGoals } from '../../src/game/goals.ts';
import { modelAll } from '../../src/game/stageTime.ts';
const levels = generateAllLevels();
for (let s = 1; s <= 9; s++) {
  const c = levels.find((l) => l.id === `1-${s}`)!; const out: string[] = [];
  for (const setting of ['normal', 'easy'] as const) {
    const t: number[] = [];
    for (let v = 1; v <= 4; v++) { setLayoutVariant(v); try { const st = setting === 'easy' ? easyStage(withGoals(generateStage({ ...c, unlocked: true }, 'easy'))) : withGoals(generateStage({ ...c, unlocked: true }, 'normal')); t.push(Math.round(modelAll(st as any).fast.total)); } finally { setLayoutVariant(null); } }
    t.sort((a, b) => a - b); out.push(`${setting} ${t[0]}-${t[t.length - 1]} s`);
  }
  console.log(`1-${s}: ${out.join(', ')}`);
}
