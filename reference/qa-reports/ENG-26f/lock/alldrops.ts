import fs from 'node:fs';
import '../../src/game/headlessDom.ts';
import { generateAllLevels } from '../../src/game/worldsData.ts';
import { generateStage, setLayoutVariant } from '../../src/game/stageGenerator.ts';
import { easyStage } from '../../src/game/easyMode.ts';
import { withGoals } from '../../src/game/goals.ts';
const [ids, out] = process.argv.slice(2);
const res: Record<string, unknown> = {};
for (const id of ids.split(',')) {
  const c = generateAllLevels().find((l) => l.id === id && !l.secret)!;
  for (const setting of ['normal', 'easy'] as const) for (let v = 1; v <= 16; v++) {
    setLayoutVariant(v);
    const st: any = setting === 'easy' ? easyStage(withGoals(generateStage({ ...c, unlocked: true }, 'easy'))) : withGoals(generateStage({ ...c, unlocked: true }, 'normal'));
    setLayoutVariant(null);
    res[`${id} ${setting} ${v}`] = { drops: st.gen2?.drops ?? null, verdicts: st.gen2?.verdicts ?? null };
  }
}
fs.writeFileSync(out, JSON.stringify(res));
