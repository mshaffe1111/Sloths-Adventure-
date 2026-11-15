/** hopAir — Pokey's airtime and reach for a tap hop and a held jump on flat ground (the real engine, realPlay.ts), for 2-2's pad sink times.
 *  Run (from a checkout of origin/t-int-9): npx tsx reference/specs/sims/hopAir.ts */
import { RealPlay } from '../../../src/game/realPlay.ts';
import type { Platform } from '../../../src/game/types.ts';
const FLOOR = 400;
for (const [name, hold] of [['tap hop', 1], ['held jump', 30]] as const) {
  for (const run of [false, true]) {
    const r = new RealPlay('1-3', 1);
    r.bare([{ id: 1, x: 0, y: FLOOR, width: 8000, height: 200, type: 'solid' } as Platform]);
    r.stand(600, FLOOR);
    for (let i = 0; i < 10; i++) r.frame();
    if (run) for (let i = 0; i < 40; i++) r.frame({ right: true });
    const x0 = r.p.x; let f = 0, top = r.p.y;
    r.frame({ press: true, right: run }); f++;
    while (!r.p.grounded && f < 120) { r.frame({ jump: f < hold, right: run }); f++; top = Math.min(top, r.p.y); }
    console.log(`${name}${run ? ' at a run' : ' standing'}: ${f} frames in the air (${(f / 30).toFixed(2)} s), ${Math.round(r.p.x - x0)} px along, ${Math.round(FLOOR - top)} px up`);
  }
}
