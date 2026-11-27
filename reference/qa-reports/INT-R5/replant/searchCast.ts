// INT-R5-c: the boardWatch re-plant search, widened to the cast bots (castRun's who, every bot and setting it has), 2-6's 100 seeds:
// each way +1 wheel, boardWatch OFF scrambles vs ON scrambles/pond (wheelBoard.test #4's property). firstTimer as castRun runs it.
// npx tsx reference/qa-reports/INT-R5/replant/searchCast.ts <from> <to>
import '../../../../src/game/headlessDom.ts';
import { FirstTimerRun, SKILLS, firstTimer } from '../../../../tools/inspect/firsttimer.ts';
import { CAST_BOTS } from '../../../../tools/inspect/castBots.ts';
import { wheelTally } from '../../../../tools/inspect/wheelCrossings.ts';
import { loadSeedList } from '../../../../src/game/gen2/seedList.ts';
await loadSeedList('2-6');
const [a, b] = process.argv.slice(2).map(Number);
// (a HIT also needs boardWatch to have HELD him on that wheel's jetty with it on: wheelBoardWait still set after pad, the skill acting
//  on that wheel, not a timing shift from an earlier one: 2-6 adult Normal 5's edge #3 moved with no wait there, boardProbe.ts)
type W = { cy: number; lay?: { jetty: number } };
type R = { sim: { platforms: Array<{ wheel?: { w: W } }>; standingOn: number }; wheelBoardWait: number };
const P = FirstTimerRun.prototype as unknown as { pad: (this: R, ...a: unknown[]) => unknown };
const pad0 = P.pad;
let waits = new Map<number, number>();
P.pad = function (...a) {
  const out = pad0.apply(this, a);
  if (this.wheelBoardWait >= 0) {
    const w = this.sim.platforms.find((p) => p.wheel?.w.lay?.jetty === this.sim.standingOn)?.wheel?.w;
    if (w) waits.set(w.cy, (waits.get(w.cy) ?? 0) + 1);
  }
  return out;
};
const one = (bot: string, set: 'easy' | 'normal', seed: number, on: boolean) => {
  SKILLS.boardWatch = on;
  waits = new Map();
  const t = wheelTally();
  let order: number[] = [];
  const r = firstTimer('2-6', seed, CAST_BOTS[bot][set]!, { cap: 1200, dotSetting: true, onFrame: (sim) => { t.onFrame(sim); if (!order.length) order = [...new Set(sim.platforms.flatMap((p) => (p.wheel ? [(p.wheel.w as unknown as W).cy] : [])))].sort((x, y) => y - x); } });
  return { r, w: t.crossings().map((c, j) => ({ ...c, waits: waits.get(order[j]) ?? 0 })) };
};
const ws = (w: ReturnType<typeof one>['w']) => w.map((c) => `${c.row}${c.way > 0 ? 'R' : 'L'} sc${c.scrambles} pd${c.pond} wt${c.waits}`).join(', ');
for (let seed = a; seed <= b; seed++) for (const bot of Object.keys(CAST_BOTS)) for (const set of ['normal', 'easy'] as const) {
  if (!CAST_BOTS[bot][set]) continue;
  const off = one(bot, set, seed, false), on = one(bot, set, seed, true);
  const hits = off.w.map((w, j) => ({ w, j, n: on.w.length === off.w.length ? on.w[j] : undefined })).filter(({ w, n }) => w.way > 0 && w.scrambles >= 2 && n && n.scrambles === 0 && n.pond === 0 && n.waits > 0);
  console.log(`${hits.length ? 'HIT ' : '    '}seed ${seed} ${bot} ${set} ${hits.map((h) => `${h.w.row}#${h.j}`).join(',')} | OFF ${off.r.end} ${off.r.time} r${off.r.rescues} | ${ws(off.w)} || ON ${on.r.end} ${on.r.time} r${on.r.rescues} | ${ws(on.w)}`);
}
SKILLS.boardWatch = true;
