/**
 * ropeProbe: every rope of a stage roll, crossed in the real engine with a grid of first-timer thumbs (where the flick comes at the
 * edge, how long it is held, whether the steer is kept), to see which thumbs miss the grab and why.
 *   npx tsx tools/inspect/ropeProbe.ts 8-2 1 normal
 */
import { RealPlay, DT } from '../../src/game/realPlay.ts';
import { setDifficulty } from '../../src/game/difficulty.ts';
import { HAND_REACH } from '../../src/game/rope.ts';

const [id = '8-2', seedS = '1', diff = 'normal'] = process.argv.slice(2);
setDifficulty(diff as never);
const sim = new RealPlay(id, Number(seedS));
const ropes = sim.ropes;
console.log(`${id} seed ${seedS} ${diff}: ${ropes.length} ropes`);
const out: any[] = [];
for (const r of ropes) {
  // the ledge he takes off from: a platform whose right end is under the rope's left part
  const from = sim.platforms.filter((q) => q.x < r.x0 && q.x + q.width >= r.x0 && q.x + q.width <= r.x0 + 120 && q.y > r.y).sort((a, b) => a.y - b.y)[0];
  if (!from) { console.log('rope', r.id, 'no ledge'); continue; }
  const edge = from.x + from.width;
  const rise = from.y - r.y;
  let grabs = 0, n = 0;
  const misses: string[] = [];
  for (const lead of [-30, -10, 0, 10, 25, 40, 60, 90]) {      // flick this far before the edge (negative: past the edge, coyote)
    for (const hold of [0.06, 0.1, 0.15, 0.2, 0.25, 0.4]) {
      for (const steer of [true, false]) {
        sim.stand(edge - 260, from.y);
        sim.safe = true;
        let t = 0, pressed = -1, res = 'none', maxRise = 0;
        while (t < 4) {
          const p = sim.p;
          const pad: any = {};
          if (pressed < 0) {
            pad.right = true;
            if (p.x >= edge - lead) { pad.press = true; pressed = t; }
          } else {
            if (t - pressed < hold) pad.jump = true;
            if (steer || t - pressed > 0.3) pad.right = true;
          }
          sim.frame(pad);
          t += DT;
          if (pressed >= 0) maxRise = Math.max(maxRise, from.y - sim.p.y);
          if (sim.p.hanging) { res = 'grab'; break; }
          if (sim.died) { res = 'died'; break; }
          if (pressed >= 0 && sim.p.grounded && t - pressed > 0.1) { res = sim.p.x > edge ? 'landed-far' : 'landed-back'; break; }
          if (pressed < 0 && !sim.p.grounded && sim.p.y > from.y + 30) { res = 'walked-off'; break; }
        }
        n++;
        if (res === 'grab') grabs++;
        else misses.push(`lead ${lead} hold ${hold} ${steer ? 'steer' : 'up'}: ${res} (rise ${Math.round(maxRise)})`);
      }
    }
  }
  console.log(`rope ${r.id} x ${Math.round(r.x0)}-${Math.round(r.x1)} rise ${Math.round(rise)} (hands need feet up ${Math.round(rise - HAND_REACH - 30)}): ${grabs}/${n} grabs`);
  for (const m of misses.slice(0, 12)) console.log('   ', m);
  out.push({ id: r.id, rise, grabs, n });
}
