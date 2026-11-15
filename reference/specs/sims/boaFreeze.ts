/**
 * boaFreeze — fly 1-9's freeze window (PITCH-19-22, the lead 7:35 PM ET 11-14): how late after a boa starts to rear can Pokey lift his
 * thumb and still be a branch to it? Pokey is the REAL engine (realPlay.ts: engine.ts at 30 fps, the pad's controls, his own stop); the
 * boa is the REAL kit (castPlay.ts running predators/core.ts with BOA, world1.ts), fed every frame exactly as engine.ts:4663-4676 feeds it.
 * One flat bough, the boa posted at BOA_X, Pokey running in from the left with the right thumb held. When the boa's rear begins (the
 * cast's `told`), he holds on for k more frames, then lifts the thumb. Outcome per k: STILL (beaten by stillness: it flees 4 s), HIT
 * (its strike's box touched him) or STRUCK-MISS (it struck and missed). Both settings. Also: frames from full run to under the still
 * speed (STILLNESS.speed), and the "stare" case: he stops before it rears (at its notice) and holds.
 * Run (from a checkout of origin/t-int-9): npx tsx reference/specs/sims/boaFreeze.ts
 */
import { RealPlay, DT } from '../../../src/game/realPlay.ts';
import { CastPlay } from '../../../src/game/castPlay.ts';
import type { CastData } from '../../../src/game/castPlay.types.ts';
import { touches } from '../../../src/game/predators/core.ts';
import { STILLNESS } from '../../../src/game/stillness.ts';
import type { Enemy, Platform } from '../../../src/game/types.ts';
import { BOA } from '../../../src/game/predators/world1.ts';

// TELL=<s> flies a wider Normal rear (the lead: "widen the rear, not the rule"); unset = the game's own number
if (process.env.TELL) (BOA as { tell: number }).tell = Number(process.env.TELL);

const FLOOR = 400;
const BOA_X = 2400;
const bough = { id: 1, x: 0, y: FLOOR, width: 8000, height: 200, type: 'solid' } as Platform;
const boa = (): Enemy => ({
  id: 900, type: 'boa', x: BOA_X, y: FLOOR - 14, vx: 0, vy: 0, width: 38, height: 22, hp: 1, maxHp: 1, facing: -1, patrolMinX: BOA_X,
  patrolMaxX: BOA_X, attackCooldown: 0, telegraphTimer: 0, isAttacking: false, animTimer: 0, hitFlashTimer: 0, defeated: false, koTimer: 0,
  behaviorTimer: 0,
} as Enemy);

function rig() {
  const r = new RealPlay('1-3', 1);
  r.bare([bough]);
  r.stand(600, FLOOR);
  for (let i = 0; i < 10; i++) r.frame();
  const e = boa();
  const c = new CastPlay({ kinds: ['boa'], traps: [] } as unknown as CastData, [e], [bough], 1);
  return { r, c, e };
}

const heroOf = (r: RealPlay) => {
  const p = r.p;
  return { x: p.x, y: p.y, vx: p.vx, vy: p.vy, facing: p.facing, grounded: p.grounded, holding: !!(p.climbing || p.isVineSwinging || p.hanging) } as never;
};

/** creep in: thumb on `on` frames, off `off` frames, until the rear; then off for good */
function creep(on: number, off: number, easy: boolean) {
  const { r, c } = rig();
  r.stand(BOA_X - 400, FLOOR);
  for (let i = 0; i < 10; i++) r.frame();
  let t = 0, tellF = -1, hit = false, still = false;
  const m = c.members[0];
  for (let f = 0; f < 900; f++) {
    const held = tellF < 0 && f % (on + off) < on;
    r.frame(held ? { right: true } : {});
    const h = heroOf(r);
    const o = c.step(h, DT, t, easy);
    if (o.told.length && tellF < 0) tellF = f;
    for (const z of o.hurts) if (touches(z.box, h)) hit = true;
    if (m.s.beatenBy === 'still') still = true;
    t += DT;
    if (tellF >= 0 && f - tellF > 150) break;
  }
  return hit ? 'HIT' : still ? 'STILL' : 'none';
}

/** run in; lift the thumb `k` frames after the rear starts (or `atNotice`: at the frame it notices him); 6 s */
function fly(k: number, easy: boolean, atNotice = false) {
  const { r, c } = rig();
  let t = 0, tellF = -1, noticeF = -1, liftF = -1, hit = false, struck = false, stillAt = -1, gap = NaN, f = 0;
  const m = c.members[0];
  for (f = 0; f < 180 + 200; f++) {
    const held = liftF < 0;
    r.frame(held ? { right: true } : {});
    const h = heroOf(r);
    const o = c.step(h, DT, t, easy);
    if (o.noticed.length && noticeF < 0) noticeF = f;
    if (o.told.length && tellF < 0) { tellF = f; gap = BOA_X - (h as { x: number }).x; }
    if (liftF < 0 && ((atNotice && noticeF >= 0) || (!atNotice && tellF >= 0 && f - tellF >= k))) liftF = f;
    if (o.struck.length) struck = true;
    for (const z of o.hurts) if (touches(z.box, h)) hit = true;
    if (m.s.beatenBy === 'still' && stillAt < 0) stillAt = f;
    t += DT;
    if (tellF >= 0 && f - tellF > 150) break;
  }
  const out = hit ? 'HIT' : stillAt >= 0 ? 'STILL' : struck ? 'STRUCK-MISS' : 'none';
  return { k, out, tellF, noticeF, liftF, stillAt, gap: Math.round(gap), notice2tell: tellF - noticeF };
}

function stopFrames() {
  const { r } = rig();
  for (let i = 0; i < 60; i++) r.frame({ right: true });
  const top = r.p.vx;
  const x0 = r.p.x;
  let n = 0;
  while (Math.abs(r.p.vx) > STILLNESS.normal.speed && n < 60) { r.frame(); n++; }
  return { top: Math.round(top), framesToStill: n, slide: Math.round(r.p.x - x0) };
}

if (process.env.TELL) console.log(`BOA.tell flown at ${BOA.tell} s (the game: 0.8)`);
const s = stopFrames();
console.log(`run speed ${s.top} px/s; lift the thumb: ${s.framesToStill} frames to under ${STILLNESS.normal.speed} px/s (slides ${s.slide} px)`);
for (const easy of [false, true]) {
  console.log(`\n${easy ? 'EASY' : 'NORMAL'}: lift k frames after the rear starts`);
  for (let k = 0; k <= 30; k++) {
    const o = fly(k, easy);
    console.log(`  k=${String(k).padStart(2)} (${(k * DT).toFixed(2)} s): ${o.out.padEnd(11)} rear at f${o.tellF} gap ${o.gap} px, notice->rear ${o.notice2tell} f${o.stillAt >= 0 ? `, beaten f${o.stillAt}` : ''}`);
    if (o.out === 'HIT' && k > 12) break;
  }
  const n = fly(0, easy, true);
  console.log(`  stop at its notice: ${n.out} (noticed f${n.noticeF}, lifted f${n.liftF}, rear ${n.tellF >= 0 ? `f${n.tellF}` : 'never'}${n.stillAt >= 0 ? `, beaten f${n.stillAt} = ${((n.stillAt - n.liftF) * DT).toFixed(2)} s after the lift` : ''})`);
}

for (const easy of [false, true]) {
  const row = [[1, 3], [2, 4], [3, 6], [4, 4], [6, 6]].map(([a, b]) => `${a}on/${b}off ${creep(a, b, easy)}`);
  console.log(`creep in with taps (${easy ? 'Easy' : 'Normal'}): ${row.join(', ')}`);
}
