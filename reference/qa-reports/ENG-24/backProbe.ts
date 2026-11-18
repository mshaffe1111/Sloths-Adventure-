// npx tsx reference/qa-reports/ENG-24/backProbe.ts: one press at vine clock t on the real engine (RealPlay, FakeInput) vs physics.ts's model
import { RealPlay, DT } from '../../../src/game/realPlay.ts';
import { setDifficulty } from '../../../src/game/difficulty.ts';
import { setTimedSwing, TIMED, timedLaunch, airStep, vineAngle, vineOmega, swingStep, type AirBody } from '../../../src/game/physics.ts';
import type { Platform, Vine } from '../../../src/game/types.ts';
setDifficulty('normal'); setTimedSwing(false);
const r = new RealPlay('2-4', 1);
const vine = { id: 50, x: 2165, topY: 390, bottomY: 800, vineType: 'swing_liana', swingAmp: 0.45, swingPeriod: TIMED.period, swingPhase: 0 } as unknown as Vine;
r.bare([{ id: 1, x: 0, y: 800, width: 2000, height: 200, type: 'solid' } as Platform], [vine]);
const len = 410 * 0.7;
for (const tk of [0.2, 0.9, 1.6, 2.2]) {
  r.t = 0;
  r.swing(vine, { angle: 0, omega: 0, len, t: tk });
  const p0 = { x: r.p.x, y: r.p.y };
  r.frame({ press: true, right: true });
  const eng: string[] = [`launch (${Math.round(r.p.x)},${Math.round(r.p.y)}) v (${Math.round(r.p.vx)},${Math.round(r.p.vy)})`];
  for (let f = 1; f < 40; f++) { r.frame({ jump: true, right: true }); if (f % 6 === 0) eng.push(`${Math.round(r.p.x)},${Math.round(r.p.y)}`); }
  // the model: swingStep from the same clock, then timedLaunch and airStep (pressWindow's)
  const s = { angle: vineAngle(vine, tk), omega: vineOmega(vine, tk), len, t: tk, amp: 0.45 };
  const rr = swingStep(s, vine, DT, 1, 0);
  const l = timedLaunch(s, 1);
  const c: AirBody = { x: rr.x, y: rr.y, vx: l.vx, vy: l.vy };
  const mod: string[] = [`launch (${Math.round(c.x)},${Math.round(c.y)}) v (${Math.round(c.vx)},${Math.round(c.vy)})`];
  for (let f = 1; f < 40; f++) { airStep(c, DT, 1, true); if (f % 6 === 0) mod.push(`${Math.round(c.x)},${Math.round(c.y)}`); }
  console.log(`t ${tk} on-vine (${Math.round(p0.x)},${Math.round(p0.y)})\n  engine ${eng.join(' ')}\n  model  ${mod.join(' ')}`);
}
