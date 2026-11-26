// what lies under the toy rim (roll 1, the rim at 613, 2867): every platform across x 600-900 between y 2800 and 3100
import '../../../../src/game/headlessDom.ts';
import { readyDraft } from '../../../../tools/engine/draft.ts';
readyDraft('3-1');
const { RealPlay } = await import('../../../../src/game/realPlay.ts');
const sim = new RealPlay('3-1', 1);
for (const q of sim.platforms) if (q.x < 900 && q.x + q.width > 600 && q.y > 2800 && q.y < 3100) console.log(q.id, q.type, Math.round(q.x), Math.round(q.x + q.width), Math.round(q.y), q.height);
const { generateAllLevels } = await import('../../../../src/game/worldsData.ts');
const { generateStage, setLayoutVariant } = await import('../../../../src/game/stageGenerator.ts');
for (const d of ['normal', 'easy'] as const) {
  setLayoutVariant(1);
  const st = generateStage({ ...generateAllLevels().find((c) => c.id === '3-1' && !c.secret)!, unlocked: true }, d);
  setLayoutVariant(null);
  console.log(d, st.platforms.filter((q) => q.x < 900 && q.x + q.width > 600 && q.y > 2800 && q.y < 3100).map((q) => `${q.id} ${Math.round(q.x)}-${Math.round(q.x + q.width)}@${Math.round(q.y)}`).join(' | '));
}
console.log('realPlay difficulty', (sim.e as unknown as { difficulty?: string }).difficulty, sim.stage.platforms.length);
