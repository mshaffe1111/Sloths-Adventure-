import '../../src/game/headlessDom.ts';
import { generateAllLevels } from '../../src/game/worldsData.ts';
import { generateStage, setLayoutVariant } from '../../src/game/stageGenerator.ts';
const levels = generateAllLevels(); const c = levels.find((l) => l.id === (process.env.SID ?? '1-5'))!; const out: Record<number, unknown> = {};
for (let v = 1; v <= 16; v++) { setLayoutVariant(v); const st = generateStage({ ...c, unlocked: true }, 'normal') as any; out[v] = st.meta.mix.explain; }
process.stdout.write(JSON.stringify(out));
