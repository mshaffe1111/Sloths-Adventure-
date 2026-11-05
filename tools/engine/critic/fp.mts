// Critic's run: the engine's own snapshot fingerprint (tools/engine/snapshot.ts) applied to stages OUTSIDE World 1, on whichever
// worktree ROOT points at, so main and engine-mixer can be compared stage by stage.
import { createHash } from 'node:crypto';
const ROOT = process.env.ROOT!;
await import(ROOT + '/src/game/headlessDom.ts');
const { generateAllLevels } = await import(ROOT + '/src/game/worldsData.ts');
const { generateStage, setLayoutVariant } = await import(ROOT + '/src/game/stageGenerator.ts');
const { easyStage } = await import(ROOT + '/src/game/easyMode.ts');
const { withGoals } = await import(ROOT + '/src/game/goals.ts');
const STAGES = (process.env.STAGES || '1-2,1-3,1-4,1-6,1-9,2-2,2-4,2-8,3-2,3-5,4-4,4-7,5-4,6-3,6-7,7-6,8-2,9-5,10-4').split(',');
const levels = generateAllLevels();
const out: Record<string, string> = {};
for (const id of STAGES) {
  const c = levels.find((l: any) => l.id === id)!;
  for (const setting of ['normal', 'easy'] as const) for (let v = 1; v <= 3; v++) {
    setLayoutVariant(v);
    const st: any = setting === 'easy' ? easyStage(withGoals(generateStage({ ...c, unlocked: true }, 'easy'))) : withGoals(generateStage({ ...c, unlocked: true }, 'normal'));
    setLayoutVariant(null);
    const body = JSON.stringify({ p: st.platforms, v: st.vines, c: st.collectibles, f: st.checkpoints, w: st.config.levelWidth, h: st.config.levelHeight, s: [st.spawnX, st.spawnY, st.exitTotemX], t: st.config.targetCount });
    out[`${id} ${setting} ${v}`] = createHash('sha256').update(body).digest('hex').slice(0, 16);
  }
}
console.log(JSON.stringify(out));
