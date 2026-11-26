// BUILD-29 READY (D125): the draft's YIELD, yield.ts's tally on the draft row (test seam). npx tsx reference/qa-reports/BUILD-29/probes/yield29.ts <from> <count>
import '../../../../src/game/headlessDom.ts';
import { withTestStage } from '../../../../src/game/gen2/listed.ts';
import { buildGen2Stage } from '../../../../src/game/gen2/pipeline.ts';
import { STAGE_29, draft29Cfg, draft29Row, kitLib29 } from '../../../../src/game/gen2/worlds/w2Arc29.ts';
import { tally, alone, printTable } from '../../../../tools/engine/yield.ts';
const from = Number(process.argv[2] ?? 1), count = Number(process.argv[3] ?? 40);
for (const d of ['normal', 'easy'] as const) {
  const rolls: string[][] = [];
  for (let seed = from; seed < from + count; seed++) {
    try { rolls.push(withTestStage({ [STAGE_29]: draft29Row() }, () => buildGen2Stage({ config: draft29Cfg(), kit: kitLib29(), seed, difficulty: d })).gen2.errors.map(String)); }
    catch (e) { rolls.push([`THREW ${String(e).slice(0, 120)}`]); }
  }
  console.log(printTable(`2-9 draft ${d}, seeds ${from}-${from + count - 1}`, tally(rolls), alone(rolls)));
}
