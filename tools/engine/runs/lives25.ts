// ENG-SNAP: where a cast bot loses a life on 2-5 (cause, x) and the nearest snapper then (phase, distance)
// npx tsx tools/engine/runs/lives25.ts <bot> <setting> <seed>
import '../../../src/game/headlessDom.ts';
import { firstTimer } from '../../inspect/firsttimer.ts';
import { CAST_BOTS } from '../../inspect/castBots.ts';
import { loadSeedList } from '../../../src/game/gen2/seedList.ts';
await loadSeedList('2-5');
const [bot, setting, seed] = process.argv.slice(2);
let near = '', lives = -1, f = 0;
const ring: string[] = [];
const r = firstTimer('2-5', Number(seed), CAST_BOTS[bot][setting as 'normal']!, { cap: 1200, dotSetting: true, onFrame: (sim: any) => {
  const p = sim.p, c = sim.e.cast;
  const m = c?.members.filter((q: any) => q.e.kitBeat).sort((a: any, b: any) => Math.abs(a.s.x - p.x) - Math.abs(b.s.x - p.x))[0];
  if (m && Math.abs(m.s.x - p.x) < 200) near = `${m.s.phase}${m.cleared ? '(cleared)' : ''} dx ${Math.round(m.s.x - p.x)}`;
  else near = '';
  f++;
  ring.push(`f${f} x${Math.round(p.x)} y${Math.round(p.y)} gr ${p.grounded ? 1 : 0} vx ${Math.round(p.vx)} vy ${Math.round(p.vy)} | ${near}`);
  if (ring.length > 60) ring.shift();
  if (lives >= 0 && sim.e.lives < lives) console.log(`LIFE at f${f}\n${ring.join('\n')}`);
  lives = sim.e.lives;
} });
for (const h of r.harms.filter((h) => h.kind === 'life')) console.log(`life ${h.cause} x${h.x} t${h.t}`);
console.log('END', r.end, r.time);
