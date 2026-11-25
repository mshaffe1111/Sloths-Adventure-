// BUILD-27c scratch: the frames before each life lost (every 3rd frame of the last 2 s): his x,y,v, grounded, what he stands on, nearby logs
import '../wt-b27c-f1/src/game/headlessDom.ts';
import { firstTimer } from '../wt-b27c-f1/tools/inspect/firsttimer.ts';
import { CAST_BOTS } from '../wt-b27c-f1/tools/inspect/castBots.ts';
const [bot, setting, seedS, nS = '1'] = process.argv.slice(2);
const ring: string[] = []; const outs: string[][] = []; let lastX = NaN, lastY = NaN, f = 0;
const R = Math.round; const AT = Number(process.env.AT ?? NaN); let atDone = false;
firstTimer('2-7', Number(seedS), (CAST_BOTS as any)[bot][setting], { cap: 1200, dotSetting: true, onFrame: (sim: any) => {
  const p = sim.p, pl = sim.stage.platforms as any[];
  const feet = p.y + p.height;
  const on = pl.find((q) => p.x + p.width > q.x && p.x < q.x + q.width && Math.abs(feet - q.y) < 6);
  const near = pl.filter((q) => (true) && Math.abs(q.x + q.width / 2 - p.x) < 300 && Math.abs(q.y - feet) < 120).map((q) => `${R(q.x)}+${R(q.width)}@${R(q.y)}`).join(' ');
  if (!Number.isNaN(lastX) && Math.hypot(p.x - lastX, p.y - lastY) > 150) { outs.push([...ring, `>>> JUMPED to ${R(p.x)},${R(p.y)} t${sim.t.toFixed(2)}`]); ring.length = 0; }
  if (!atDone && sim.t >= AT) { outs.push([...ring, `>>> AT t${sim.t.toFixed(2)}`]); atDone = true; }
  lastX = p.x; lastY = p.y;
  if (f++ % 3 === 0) { ring.push(`t${sim.t.toFixed(2)} x${R(p.x)} y${R(p.y)} vx${R(p.vx)} vy${R(p.vy)} g${p.grounded ? 1 : 0} j${p.jumpsLeft} on:${on ? `${on.type ?? on.kind ?? '?'} ${R(on.x)}+${R(on.width)}${on.vx ? ` vx${R(on.vx)}` : ''}` : '-'} logs:[${near}]`); if (ring.length > 20) ring.shift(); }
} });
for (const o of outs.slice(0, Number(nS))) console.log(o.join('\n') + '\n');
