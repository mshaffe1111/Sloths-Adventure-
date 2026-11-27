// INT-R5-c: boardProbe.ts for a TIER bot on 2-6's listed row (rowWheelRuns' own path: withPlantedRow + runTier + wheelTally), boardWatch
// OFF vs ON: per wheel (lowest first) scrambles, pond, and the frames boardWatch held him on that wheel's jetty
// npx tsx reference/qa-reports/INT-R5/replant/boardProbeTier.ts <tier> <setting> <variant> <seed>
import '../../../../src/game/headlessDom.ts';
import { FirstTimerRun, SKILLS } from '../../../../tools/inspect/firsttimer.ts';
import { withPlantedRow } from '../../../../tools/inspect/rowWheels.ts';
import { runTier } from '../../../../tools/inspect/tierBots.ts';
import { wheelTally } from '../../../../tools/inspect/wheelCrossings.ts';
import { w2Finish } from '../../../../src/game/gen2/worlds/w2.ts';
import { kitLib26, STAGE_26 } from '../../../../src/game/gen2/worlds/w2Arc26.ts';
import { loadSeedList } from '../../../../src/game/gen2/seedList.ts';
await loadSeedList('2-6');
const [tier, set, v, seed] = process.argv.slice(2);
type W = { cy: number; lay?: { jetty: number } };
type R = { sim: { platforms: Array<{ wheel?: { w: W } }>; standingOn: number; t: number }; wheelBoardWait: number };
const P = FirstTimerRun.prototype as unknown as { pad: (this: R, ...a: unknown[]) => unknown };
const pad0 = P.pad;
for (const on of [false, true]) {
  const waits = new Map<number, number[]>();
  P.pad = function (...a) {
    const out = pad0.apply(this, a);
    if (this.wheelBoardWait >= 0) {
      const w = this.sim.platforms.find((p) => p.wheel?.w.lay?.jetty === this.sim.standingOn)?.wheel?.w;
      if (w) waits.set(w.cy, [...(waits.get(w.cy) ?? []), this.sim.t]);
    }
    return out;
  };
  SKILLS.boardWatch = on;
  const t = wheelTally();
  let order: number[] = [];
  const r = withPlantedRow({ stage: STAGE_26, kit: kitLib26, world: w2Finish as never }, Number(seed), () => runTier(tier as never, set as never, Number(v), STAGE_26, { onFrame: (sim) => { t.onFrame(sim); if (!order.length) order = [...new Set(sim.platforms.flatMap((p) => (p.wheel ? [(p.wheel.w as unknown as W).cy] : [])))].sort((x, y) => y - x); } }));
  console.log(`boardWatch ${on ? 'ON ' : 'OFF'}: ${r.end} ${r.finishSeconds} s rescues ${r.rescues} | ${t.crossings().map((c, j) => `#${j} ${c.row}${c.way > 0 ? 'R' : 'L'} sc${c.scrambles} pd${c.pond} wt${waits.get(order[j])?.length ?? 0}${waits.get(order[j]) ? ` (from t ${waits.get(order[j])![0].toFixed(2)})` : ''}`).join(', ')}`);
}
P.pad = pad0;
SKILLS.boardWatch = true;
