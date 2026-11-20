// ENG-24e: 2-4's beats 4 (up from the log) and 6 (no land) ridden bank to bank on a log alone, on the real engine (RealPlay), with the
// probe of src/game/riverTail.test.ts (its ride, word for word): CROSSED where the beat can be skipped. R-165.301's acceptance test: once
// the beats force their lianas, every line prints a failure ('water', 'back on a bank'), both settings.
//   npx tsx reference/qa-reports/ENG-24e/rideAcross24.ts [seed]
import '../../../src/game/headlessDom.ts';
import assert from 'node:assert/strict';
import { RealPlay } from '../../../src/game/realPlay.ts';
import { setDifficulty, type Difficulty } from '../../../src/game/difficulty.ts';
import { onRiver, type RiverZone } from '../../../src/game/river.ts';
/** the take-offs flown: px before the logs' end (negative: past it, in his coyote time) and the frame of the second jump */
const BEFORE = [-25, -10, 0, 20, 45];
const DOUBLE = [14, 17, 19, 22];

/** one ride across river `r`: how it ended ('CROSSED' when he stands on the far bank having touched no vine) */
function ride(rp: RealPlay, r: RiverZone, before: number, dbl: number): string {
  const solid = rp.platforms.filter((q) => q.type === 'solid' && !q.broken);
  const near = solid.find((q) => Math.abs(q.x + q.width - r.x0) <= 2 && q.y < r.surfaceY);
  const far = solid.find((q) => Math.abs(q.x - r.x1) <= 2 && q.y < r.surfaceY);
  assert.ok(near && far, `river ${Math.round(r.x0)}-${Math.round(r.x1)} has a bank at each end`);
  const logs = rp.platforms.filter((q) => q.type === 'drift' && q.drift && onRiver(q.drift, r));
  rp.stand(near.x + near.width - 26, near.y);
  let boarded = false, hopped = -1, vine = false;
  for (let f = 0; f < 30 * 40; f++) {
    const p = rp.p;
    if (p.isVineSwinging || p.climbing || p.hanging) vine = true;
    const on = rp.platforms.find((q) => q.id === rp.standingOn);
    // (on ground past the water: the far bank, or a bank beyond it a long jump reached)
    if (on && on.type === 'solid' && on.x >= far.x - 2) return vine ? 'far bank, a vine held' : 'CROSSED';
    if (rp.died || p.y > r.surfaceY + 8) return 'water';
    // (a safe river set him back on the near bank)
    if (boarded && on && on.type === 'solid') return 'back on a bank';
    let pad: { right?: boolean; press?: boolean; jump?: boolean } = {};
    if (!boarded) {
      if (on?.type === 'drift') boarded = true;
      else if (logs.some((q) => q.x < r.x0 + 10 && q.x + q.width > r.x0 + 60)) pad = { right: true };
    } else if (hopped < 0) {
      const end = on?.drift ? on.drift.x1 : logs[0].drift!.x1;
      // (once his log reaches the logs' end, so the run cannot take him off its front into the water between logs, he runs the last 90 px
      //  of the ride, then jumps; past the end he is in the air, in his coyote time)
      const there = !on?.drift || on.x + on.width >= end - 2;
      if (there && p.x > end - before - 90) pad = { right: true };
      if (there && p.x > end - before) { pad = { right: true, press: true }; hopped = 0; }
    } else {
      hopped++;
      pad = hopped === dbl ? { right: true, press: true } : { right: true, jump: true };
    }
    rp.frame(pad);
  }
  return boarded ? 'timeout riding' : 'timeout (never boarded)';
}

/** every take-off over river `r`: the first that crosses, else every ending */
function rideAll(rp: RealPlay, r: RiverZone): { crossed: boolean; ends: string[] } {
  const ends: string[] = [];
  for (const b of BEFORE) for (const k of DOUBLE) {
    const end = ride(rp, r, b, k);
    if (end === 'CROSSED') return { crossed: true, ends: [`${b}/${k}`] };
    ends.push(end);
  }
  return { crossed: false, ends };
}

const seed = +(process.argv[2] ?? 1);
for (const setting of ['normal', 'easy'] as Difficulty[]) {
  setDifficulty(setting);
  const rp = new RealPlay('2-4', seed);
  const secs = ((rp.stage as { gen2?: { sections?: Array<{ template: string; x0: number; x1: number }> } }).gen2?.sections ?? []);
  for (const beat of ['up-from-log', 'no-land']) {
    const sec = secs.find((q) => q.template.includes(beat))!;
    for (const r of (rp.stage.rivers ?? []).filter((q) => q.speed > 0 && q.x0 >= sec.x0 - 5 && q.x1 <= sec.x1 + 5)) {
      const res = rideAll(rp, r);
      console.log(`${setting} s${seed} ${beat} river ${Math.round(r.x0)}-${Math.round(r.x1)} tail ${r.tail ?? 0}: ${res.crossed ? 'CROSSED (take-off ' + res.ends[0] + ')' : 'never crossed: ' + [...new Set(res.ends)].join(', ')}`);
    }
  }
}
