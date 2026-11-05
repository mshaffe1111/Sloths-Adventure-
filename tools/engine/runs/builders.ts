// RUNS "Specials": which builder makes each stage, read off generateStage's own routing (stageGenerator.ts:2844-2881) and the tables it
// routes by (protoStage.ts HAND_STAGES + buildProtoStage's plan switch :500-518, w2Stages.ts W2_STAGES, gen2/game.ts GEN2_STAGES,
// extraStages.ts 4-D and 5-M). The plan switch is read from the source so a new branch in it shows up here.
import fs from 'node:fs';
import '../../../src/game/headlessDom.ts';
import { generateAllLevels } from '../../../src/game/worldsData.ts';
import { HAND_STAGES } from '../../../src/game/protoStage.ts';
import { W2_STAGES } from '../../../src/game/w2Stages.ts';
import { GEN2_STAGES } from '../../../src/game/gen2/game.ts';
import { DOT_STAGE_ID, MEECA_STAGE_ID } from '../../../src/game/extraStages.ts';
const src = fs.readFileSync(new URL('../../../src/game/protoStage.ts', import.meta.url), 'utf8').split('\n');
const planFn = new Map<string, string>();
src.forEach((l, i) => { const m = l.match(/^\s*if \(plan === '([^']+)'(?: \|\| plan === '([^']+)')*(?: \|\| plan === '([^']+)')*\) return (\w+)\(/); if (m && i < 600) for (const p of l.matchAll(/plan === '([^']+)'/g)) planFn.set(p[1], `${m[m.length - 1] ? '' : ''}${l.match(/return (\w+)\(/)![1]} (protoStage.ts:${i + 1})`); });
for (const c of generateAllLevels() as any[]) {
  let b: string;
  if (c.id === DOT_STAGE_ID) b = 'dotGeneratedStage (extraStages.ts, dotFlightStage.ts)';
  else if (c.id === MEECA_STAGE_ID) b = 'meecaGeneratedStage (extraStages.ts)';
  else if (HAND_STAGES[c.id] && !c.secret) { const p = HAND_STAGES[c.id]; b = `hand: plan ${p}, ` + (planFn.get(p) ?? `the planned proto builder's '${p}' branch (protoStage.ts)`); }
  else if ((W2_STAGES as any)[c.id] && !c.secret) b = `hand: W2 plan ${(W2_STAGES as any)[c.id]} (w2Stages.ts buildW2Stage, w2Sections.ts)`;
  else if ((GEN2_STAGES as any)[c.id] && !c.secret) b = `gen2: ${(GEN2_STAGES as any)[c.id].kitName ?? 'kit'} (gen2/game.ts)`;
  else b = c.objectiveType === 'boss_lair' ? 'old generator, boss lair (stageGenerator.ts, bossDefs.ts)' : 'old generator (stageGenerator.ts chunks)';
  console.log(`${c.id}\t${c.secret ? 'secret' : ''}\t${c.objectiveType}\t${c.name}\t${b}`);
}
