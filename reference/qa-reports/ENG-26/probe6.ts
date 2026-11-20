// ENG-26 probe: what a tier bot does at the wheel (on the jetty, in a bucket, on the street, in the pond), frame by frame (relative imports, D83)
import { fixtureSeed, wheelRun, type WheelToy } from '../../../tools/inspect/wheelToys.ts';
import type { RealPlay } from '../../../src/game/realPlay.ts';
const row = (process.argv[2] ?? 'teach') as WheelToy, tier = (process.argv[3] ?? 'middle') as 'middle', s = (process.argv[4] ?? 'normal') as 'normal';
const seed = fixtureSeed(row)!;
let last = '', n = 0;
const log: string[] = [];
const r = wheelRun(row, tier, s, seed, Number(process.argv[5] ?? 1), {
  onFrame: (sim: RealPlay) => {
    const w = sim.platforms.find((p) => p.wheel)?.wheel?.w;
    if (!w?.lay) return;
    const on = sim.standingOn;
    const where = on === w.lay.jetty ? 'jetty' : on === w.lay.streetId ? 'street' : sim.platforms.find((p) => p.id === on)?.wheel ? 'bucket' : on >= 0 ? `p${on}` : 'air';
    const near = Math.abs(sim.p.x - w.cx) < 500 && Math.abs(sim.p.y - w.cy) < 450;
    if (!near) { if (last && last !== 'away') log.push(`t ${sim.t.toFixed(1)} away`); last = 'away'; return; }
    if (where !== last) { log.push(`t ${sim.t.toFixed(1)} ${where} (${Math.round(sim.p.x - w.cx)}, ${Math.round(sim.p.y - w.cy)})${sim.died ? ' DIED' : ''}`); last = where; n++; }
  },
});
console.log(log.slice(0, 60).join('\n'));
console.log(`end ${r.end} t ${r.finishSeconds?.toFixed(1)} lives ${r.lives} putbacks ${r.putbacks} stuck ${JSON.stringify(r.stuck.slice(0, 3))}`);
