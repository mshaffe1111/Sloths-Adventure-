// D16 (1-6 design), 2026-11-13: does WHERE Pokey holds a liana decide how far he flies? Flown in the real engine (RealPlay, 30 fps).
// One command: npx tsx reference/specs/sims/grip-reach.ts
// A bare world with one self-swinging liana (top 1000, length L). He hangs at a grip (top = 80 px, SWING.minLen; middle = L/2; foot =
// L-10, the lowest swingGrab allows), right held (facing the far side). Every frame of one whole swing is tried as the press to let go
// (the engine's own early/late/sweet call); after he is off, jump stays held and right stays held. With the double jump, the second
// press is tried at every second frame 2..20 after the let-go. Reported: the farthest x past the vine's anchor at which his feet come DOWN
// through a ledge line (the anchor 400 px above that ledge = a level perch; 320 px = a perch raised 80, w6Swing.ts RAISE), and the
// launch speed (vx, vy) the farthest press gave.
import { RealPlay } from '../../../src/game/realPlay.ts';
import { setDifficulty } from '../../../src/game/difficulty.ts';
import { TIMED, vinePeriod } from '../../../src/game/physics.ts';
import type { Vine } from '../../../src/game/types.ts';

const TOP = 1000;
const LINES = [400, 320];

const worlds = new Map<string, { r: RealPlay; v: Vine }>();
function world(easy: boolean, L: number) {
  const key = `${easy}:${L}`;
  let w = worlds.get(key);
  if (!w) {
    // (one engine per setting and length, made after setDifficulty: the stage start sets the swing's clock, physics.ts setTimedSwing)
    const r = new RealPlay('1-5', 1);
    const v: Vine = { id: 7, x: 2000, topY: TOP, bottomY: TOP + L, swaySpeed: 1.1, swayPhase: 0, vineType: 'swing_liana', isSwingingVine: true };
    r.bare([], [v]);
    w = { r, v };
    worlds.set(key, w);
  }
  return w;
}

function flight(easy: boolean, L: number, grip: number, pressAt: number, dblAt: number) {
  const { r, v } = world(easy, L);
  r.swing(v, { angle: 0, omega: 1, len: grip, t: 0 });
  r.p.jumpsLeft = 1;
  const p = r.p;
  let k = 0;
  for (; k < pressAt; k++) r.frame({ right: true });
  r.frame({ right: true, press: true });
  // the press may wait (early) up to 0.32 s: keep right held, no jump (a held jump climbs on the vine)
  let wait = 0;
  while (p.isVineSwinging && wait < 30) { r.frame({ right: true }); wait++; }
  if (p.isVineSwinging) return null;
  const vx0 = p.vx, vy0 = p.vy, x0 = p.x;
  const best: number[] = LINES.map(() => -Infinity);
  let prevY = p.y;
  for (let i = 1; i < 120; i++) {
    const dbl = i === dblAt;
    r.frame({ right: true, jump: true, press: dbl });
    LINES.forEach((d, j) => {
      const line = TOP + d;
      if (prevY < line && p.y >= line && p.vy > 0) best[j] = Math.max(best[j], p.x - v.x);
    });
    prevY = p.y;
    if (p.y > TOP + 900) break;
  }
  return { vx0, vy0, x0: x0 - v.x, reach: best, period: TIMED.period };
}

for (const easy of [false, true]) {
  setDifficulty(easy ? 'easy' : 'normal');
  for (const L of [340, 420]) {
    const grips: Array<[string, number]> = [['top', 80], ['middle', Math.round(L / 2)], ['foot', L - 10]];
    for (const [name, g] of grips) {
      for (const dblMode of ['no double', 'double']) {
        const n = Math.round((easy ? 3.3 : 2.85) * 30);
        let bestR = LINES.map(() => -Infinity);
        let bestLaunch = '';
        let period = 0;
        const TARGETS = [380, 420, 460, 500, 540, 580];
        const win = TARGETS.map(() => 0);
        for (let k = 0; k < n; k++) {
          let frameBest = -Infinity;
          const dbls = dblMode === 'double' ? Array.from({ length: 10 }, (_, i) => 2 * i + 2) : [999];
          for (const d of dbls) {
            const f = flight(easy, L, g, k, d);
            if (!f) continue;
            period = f.period;
            frameBest = Math.max(frameBest, f.reach[0]);
            f.reach.forEach((x, j) => {
              if (x > bestR[j]) {
                bestR[j] = x;
                if (j === 0) bestLaunch = `vx ${f.vx0.toFixed(0)} vy ${f.vy0.toFixed(0)} off at ${f.x0.toFixed(0)}`;
              }
            });
          }
          TARGETS.forEach((d, j) => { if (frameBest >= d) win[j]++; });
        }
        console.log(`${easy ? 'Easy  ' : 'Normal'} (period ${period}) L=${L} grip ${name.padEnd(6)} (${String(g).padStart(3)} px) ${dblMode.padEnd(9)}: ` +
          LINES.map((d, j) => `ledge ${d} below anchor: ${bestR[j] === -Infinity ? 'none' : bestR[j].toFixed(0) + ' px'}`).join(' | ') + ` | farthest launch: ${bestLaunch}`);
        console.log('    press window (ms of one swing) to come down at or past, on the 400 line: ' + TARGETS.map((d, j) => `${d} px ${Math.round((win[j] * 1000) / 30)}`).join(', '));
      }
    }
  }
}
