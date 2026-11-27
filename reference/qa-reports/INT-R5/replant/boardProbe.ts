// INT-R5-c: for a cast-bot case on 2-6, boardWatch OFF vs ON: per wheel (lowest first, as wheelTally), scrambles, pond and the frames
// boardWatch held him on that wheel's jetty (wheelBoardWait still set after pad: he waited for a bucket that takes his hop)
// npx tsx reference/qa-reports/INT-R5/replant/boardProbe.ts <bot> <setting> <seed>
import '../../../../src/game/headlessDom.ts';
import { FirstTimerRun, SKILLS, firstTimer } from '../../../../tools/inspect/firsttimer.ts';
import { CAST_BOTS } from '../../../../tools/inspect/castBots.ts';
import { wheelTally } from '../../../../tools/inspect/wheelCrossings.ts';
import { loadSeedList } from '../../../../src/game/gen2/seedList.ts';
await loadSeedList('2-6');
const [bot, set, seed] = process.argv.slice(2);
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
  const r = firstTimer('2-6', Number(seed), CAST_BOTS[bot][set as 'normal']!, { cap: 1200, dotSetting: true, onFrame: (sim) => { t.onFrame(sim); if (!order.length) order = [...new Set(sim.platforms.flatMap((p) => (p.wheel ? [(p.wheel.w as unknown as W).cy] : [])))].sort((a, b) => b - a); } });
  const cys = [...waits.keys()];
  console.log(`boardWatch ${on ? 'ON ' : 'OFF'}: ${r.end} ${r.time} s rescues ${r.rescues} | ${t.crossings().map((c) => `${c.row}${c.way > 0 ? 'R' : 'L'} sc${c.scrambles} pd${c.pond}`).join(', ')} | waits by wheel: ${cys.map((cy) => `#${order.indexOf(cy)} (cy ${cy}): ${waits.get(cy)!.length} frames from t ${waits.get(cy)![0].toFixed(2)}`).join('; ') || 'none'}`);
}
P.pad = pad0;
SKILLS.boardWatch = true;
