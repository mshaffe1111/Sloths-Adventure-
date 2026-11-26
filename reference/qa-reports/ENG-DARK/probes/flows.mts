// (ENG-DARK box 22, rule 28 for c15's bot read) every shipped stage's build, both settings, layouts 1-16, as lockall builds it: the tally of
// gen2.tower.flow. c15's wayRises changes a read only where flow is 'down'; with no shipped build going down, no shipped row can move.
//   npx tsx reference/qa-reports/ENG-DARK/probes/flows.mts
import '../../../../src/game/headlessDom.ts';
import { generateAllLevels } from '../../../../src/game/worldsData.ts';
import { generateStage, setLayoutVariant } from '../../../../src/game/stageGenerator.ts';
import { easyStage } from '../../../../src/game/easyMode.ts';
import { withGoals } from '../../../../src/game/goals.ts';
const levels = generateAllLevels().filter((c) => !c.secret);
const tally: Record<string, number> = {}, down: string[] = [];
let builds = 0, errors = 0;
for (const c of levels) for (const setting of ['normal', 'easy'] as const) for (let v = 1; v <= 16; v++) {
  setLayoutVariant(v);
  try {
    const st: any = setting === 'easy' ? easyStage(withGoals(generateStage({ ...c, unlocked: true }, 'easy'))) : withGoals(generateStage({ ...c, unlocked: true }, 'normal'));
    const f = String(st.gen2?.tower?.flow ?? 'no tower');
    tally[f] = (tally[f] ?? 0) + 1; builds++;
    if (f === 'down') down.push(`${c.id} ${setting} ${v}`);
  } catch { errors++; }
  setLayoutVariant(null);
}
console.log(`shipped stages ${levels.length}, builds ${builds}, build errors ${errors}; gen2.tower.flow: ${JSON.stringify(tally)}; going down: ${down.length ? down.join(', ') : 'none'}`);
