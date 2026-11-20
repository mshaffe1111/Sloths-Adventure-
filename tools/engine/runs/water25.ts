// BUILD-25d: ONE run of the quickening's log river (x ~21000) for one bot: every frame over the water with the log under/near him,
// the jump's press and the platforms as the sim holds them at the jump (facts for the lead: rule numbers or a bot miss)
// npx tsx tools/engine/runs/water25.ts <bot> <setting> <seed> <x0> <x1>
import '../../../src/game/headlessDom.ts';
import { firstTimer } from '../../inspect/firsttimer.ts';
import { CAST_BOTS } from '../../inspect/castBots.ts';
import { loadSeedList } from '../../../src/game/gen2/seedList.ts';
await loadSeedList('2-5');
const [bot, setting, seed, x0, x1] = process.argv.slice(2);
const R = Math.round;
let f = 0, lives = -1, shown = false;
const r = firstTimer('2-5', Number(seed), CAST_BOTS[bot][setting as 'normal']!, { cap: 1200, dotSetting: true, onFrame: (sim: any) => {
  f++;
  const p = sim.p;
  if (p.x >= Number(x0) && p.x <= Number(x1)) {
    const near = sim.platforms.filter((q: any) => q.x < p.x + 200 && q.x + q.width > p.x - 200 && Math.abs(q.y - p.y) < 120);
    if (!shown) { shown = true; console.log('platforms near entry: ' + near.map((q: any) => `${q.type}${q.drift ? '(d)' : ''} ${R(q.x)}..${R(q.x + q.width)} y${R(q.y)}`).join('; ')); }
    const under = sim.platforms.find((q: any) => q.x <= p.x + 20 && q.x + q.width >= p.x - 20 && q.y >= p.y - 4 && q.y < p.y + 80);
    console.log(`f${f} t${sim.t.toFixed(2)} x${R(p.x)} y${R(p.y)} gr ${p.grounded ? 1 : 0} vx ${R(p.vx)} vy ${R(p.vy)} jump ${sim.input.state.jump ? 1 : 0} | under ${under ? `${under.type} ${R(under.x)}..${R(under.x + under.width)} y${R(under.y)}` : '-'}`);
  }
  if (lives >= 0 && sim.e.lives < lives) console.log(`LIFE LOST f${f} x${R(p.x)}`);
  lives = sim.e.lives;
} });
for (const h of r.harms.filter((h: any) => h.kind === 'life')) console.log(`life ${h.cause} x${h.x} t${h.t}`);
console.log('END', r.end, r.time);
