// BUILD-24c 2c (the lead's ruling 2:30 PM ET): can a beat's river be crossed bank to bank on a LOG ALONE, never touching a liana?
// The real engine (RealPlay, the game's own update): Pokey stands at the near bank's lip, steps onto the first log that slides out
// under him, stands on it, and hops onto the far bank when the log brings him there. Prints, per seed and setting, CROSSED (the skill
// can be skipped), or how it ended. A beat that forces its liana skill must print no CROSSED on any seed.
//   npx tsx rideAcross.ts <section regex> <seed0-seed1>
import '../../../src/game/headlessDom.ts';
import { RealPlay } from '../../../src/game/realPlay.ts';
import { setDifficulty } from '../../../src/game/difficulty.ts';
const [re, range] = process.argv.slice(2);
const [a, b] = range.split('-').map(Number);
let crossed = 0, runs = 0;
for (const setting of ['normal', 'easy'] as const) {
  setDifficulty(setting);
  for (let seed = a; seed <= b; seed++) {
    const sim: any = new RealPlay('2-4', seed);
    const st: any = sim.stage;
    const sec = (st.gen2?.sections ?? []).find((s: any) => new RegExp(re).test(s.template));
    if (!sec) { console.log(`${setting} s${seed}: no section ${re}`); continue; }
    for (const r of (st.rivers ?? []).filter((q: any) => q.speed > 0 && q.x0 >= sec.x0 - 5 && q.x1 <= sec.x1 + 5)) {
      runs++;
      const solid = sim.platforms.filter((q: any) => q.type === 'solid');
      const near = solid.find((q: any) => Math.abs(q.x + q.width - r.x0) < 4 && q.y < r.surfaceY);
      const far = solid.find((q: any) => Math.abs(q.x - r.x1) < 4 && q.y < r.surfaceY);
      if (!near || !far) { console.log(`${setting} s${seed} river ${r.x0}-${r.x1}: no near/far bank`); continue; }
      let end = '', tries: string[] = [];
      for (const hopAt of [40, 90, 140, 200, 260, 330]) {
      const sim2: any = new RealPlay('2-4', seed);
      const res = ride(sim2, r, near, far, hopAt);
      tries.push(`${hopAt}:${res}`);
      if (res === 'CROSSED') { end = 'CROSSED'; break; }
      }
      if (!end) end = tries.join(' ');
      if (end === 'CROSSED') crossed++;
      console.log(`${setting} s${seed} ${sec.template} river ${Math.round(r.x0)}-${Math.round(r.x1)} (${r.speed} px/s): ${end}`);
    }
  }
}
console.log(`${crossed} of ${runs} rivers crossed on a log alone`);

function ride(sim: any, r: any, near: any, far: any, hopAt: number): string {
      sim.stand(near.x + near.width - 26, near.y);
      let end = 'timeout', boarded = false, vine = false, hopped = false;
      for (let f = 0; f < 30 * 60; f++) {
        const p = sim.p;
        if (p.isVineSwinging || p.climbing || p.hanging) vine = true;
        const on = sim.platforms.find((q: any) => q.id === sim.standingOn);
        if (on?.id === far.id) { end = vine ? 'far bank (but a vine was held)' : 'CROSSED'; break; }
        if (sim.died || p.y > r.surfaceY + 60) { end = `fell at x${Math.round(p.x)}`; break; }
        let pad: any = {};
        if (!boarded) {
          // (step on when a log is under the lip and reaches back to him)
          const log = sim.platforms.find((q: any) => q.type === 'drift' && q.drift?.x0 === r.x0 && q.x < r.x0 + 10 && q.x + q.width > r.x0 + 60);
          if (on?.type === 'drift') boarded = true;
          else if (log) pad = { right: true };
        } else if (on?.type === 'drift') {
          // (riding: `hopAt` px before the far bank's lip, a held jump toward it, the second jump at its top)
          if (!hopped && p.x + 22 > r.x1 - hopAt) { pad = { right: true, press: true }; hopped = true; }
        } else if (hopped) pad = p.vy > -20 && p.vy < 60 && !sim.__dbl ? ((sim.__dbl = true), { right: true, press: true }) : { right: true, jump: true };
        sim.frame(pad);
      }
      return end;
}
