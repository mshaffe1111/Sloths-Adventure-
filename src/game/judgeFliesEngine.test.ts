/**
 * ENG-285 (R-165.285, R-165.294): the judges fly Pokey exactly as the engine does. Every check and bot that passes a stage flies its let-gos
 * through physics.ts (pressLaunches: the press as the engine plays it; airStep: one air tick), so here the REAL engine (realPlay.ts, the
 * game's own InputEngine, as the phone's touch layer drives it) is pressed at the very frames the judge presses, and the two flights are
 * compared frame by frame, to the pixel:
 *   1. every press of one whole swing, at both of the judge's holds (pressLaunches' grips), the back-swing hops among them: where he leaves
 *      the vine, how fast, and every frame of the flight after. It was 20-30 px out on a back-swing hop (airStep had no turn push) and
 *      5 px a frame on the hold (a jump press is Up too: the press climbs his grip, and a press a beat early keeps climbing while it waits).
 *   2. a let-go over a river's drifting logs: the judge's own landing (gen2/riverLay.ts letGoFall + fallOnLog, what lianaDrops counts),
 *      read at the river's clock as he presses, against where the engine sets him down, over every phase pair sampled. This pins the
 *      engine's frame order the judge reads: the logs move before he does, on the game's clock, from the frame of the press.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay, DT } from './realPlay.ts';
import { airStep, groundStep, PHYS, pressLaunches, setTimedSwing, swingGrab, swingSetup, takeOffStep, vinePeriod, vineAngle, vineOmega, type AirBody, type PressLaunch } from './physics.ts';
import { driftX, LOG_DROP, LOG_HEIGHT, type DriftInfo } from './river.ts';
import { fallOnLog, letGoFall } from './gen2/riverLay.ts';
import type { Platform, Vine } from './types.ts';

const G = 2000;
const LIANA: Vine = { id: 7, x: 1000, topY: G - 620, bottomY: G - 170, swaySpeed: 1, swayPhase: 0, vineType: 'swing_liana', isSwingingVine: true };
const GRIPS = [0.7, 0.95] as const;
// (its own swing, as a stage sets it up: the engine's bare world does the same to its copy, swingSetup keeps a phase it already has)
swingSetup([LIANA]);

/** the hold the judge flies a grip at (pressLaunches' own grab) */
const holdOf = (v: Vine, grip: number) => {
  const len = v.bottomY - v.topY;
  return swingGrab({ x: v.x - 40, y: v.topY + Math.min(len * grip, len - 20), vx: 300, vy: 100 }, v).len;
};

interface Frame { x: number; y: number; vx: number; vy: number; t: number; logs: number[]; grounded: boolean; on: string }

/**
 * The engine pressing to let go of `v` (held at `hold`) on the frame whose step puts the vine's clock at `pt`, the game's clock then
 * `riverAt` (the river's clock as he presses), right held and the jump held from the press on, through the game's own InputEngine. He
 * hangs one whole swing first (the engine keeps the sweet spot's snap from it, as the judge's first swing gives "since the sweet spot").
 * Returns the frame he leaves on (his place and launch) and every frame of the flight after it.
 */
function engineLetGo(platforms: Platform[], v: Vine, hold: number, pt: number, riverAt: number, frames: number): { leave: Frame; air: Frame[] } {
  const r = new RealPlay('2-1', 1);
  r.e.skills.delete('glide');
  r.bare(platforms, [{ ...v }]);
  const vine = r.vines[0];
  const n = Math.round(vinePeriod(vine) / DT);
  const t0 = pt - (n + 1) * DT;
  // (the game's clock first: the vines' clock is placed against it, engine.ts vineClock)
  r.t = riverAt - (n + 1) * DT;
  r.swing(vine, { angle: vineAngle(vine, t0), omega: vineOmega(vine, t0), len: hold, t: t0 });
  Object.assign(r.e, { sweetSnap: null, swingLeapWait: 0 });
  r.useRealInput();
  const drifts = r.platforms.filter((q) => q.type === 'drift');
  const read = (): Frame => {
    const on = r.platforms.find((q) => q.id === r.e.standingOnId);
    return { x: r.p.x, y: r.p.y, vx: r.p.vx, vy: r.p.vy, t: r.t, logs: drifts.map((q) => q.x), grounded: !!r.p.grounded, on: on ? on.type : '' };
  };
  for (let i = 0; i < n; i++) r.frame({ right: true });
  assert.ok(r.p.isVineSwinging, 'set-up: he hangs on the liana');
  assert.ok(Math.abs(r.vineClock - (pt - DT)) < 1e-6, `set-up: the vine's clock ${r.vineClock} a frame before the press, ${pt - DT}`);
  r.frame({ press: true, jump: true, right: true });
  assert.ok(Math.abs(r.t - riverAt) < 1e-6, `set-up: the game's clock on the press's frame ${r.t}, the river's ${riverAt}`);
  let k = 0;
  while (r.p.isVineSwinging && k++ < 15) r.frame({ jump: true, right: true });
  assert.ok(!r.p.isVineSwinging, 'he let go');
  const leave = read();
  const air: Frame[] = [];
  for (let i = 0; i < frames && !r.p.grounded; i++) {
    r.frame({ jump: true, right: true });
    air.push(read());
  }
  return { leave, air };
}

/** the judge's flight of launch `l` (flyLaunch's: the jump held, right held), frame by frame */
function judgeFlight(l: PressLaunch, frames: number): AirBody[] {
  const c: AirBody = { x: l.x, y: l.y, vx: l.vx, vy: l.vy };
  const out: AirBody[] = [];
  for (let i = 0; i < frames; i++) {
    airStep(c, DT, 1, true);
    out.push({ ...c });
  }
  return out;
}

test('every press of one swing: the judge leaves the liana and flies exactly as the engine does, to the pixel, back-swing hops included (R-165.285, R-165.294)', () => {
  setTimedSwing(false);
  const FRAMES = 24;
  let backHops = 0, early = 0, worst = 0, worstAt = '';
  for (const grip of GRIPS) {
    const hold = holdOf(LIANA, grip);
    const L = pressLaunches(LIANA, grip);
    L.forEach((l, k) => {
      const e = engineLetGo([], LIANA, hold, l.pt, 100, FRAMES);
      const what = `grip ${grip} press ${k} (vine clock ${l.pt.toFixed(3)}, leaves at ${l.t.toFixed(3)})`;
      // (where and how fast he leaves the vine, and on which frame)
      assert.ok(Math.abs(e.leave.t - (100 + (l.t - l.pt))) < 1e-6, `${what}: the engine left ${((e.leave.t - 100) / DT).toFixed(2)} frames after the press, the judge ${((l.t - l.pt) / DT).toFixed(2)}`);
      const d0 = Math.max(Math.abs(e.leave.x - l.x), Math.abs(e.leave.y - l.y), Math.abs(e.leave.vx - l.vx), Math.abs(e.leave.vy - l.vy));
      assert.ok(d0 < 1e-6, `${what}: leaves at ${e.leave.x.toFixed(2)},${e.leave.y.toFixed(2)} v ${e.leave.vx.toFixed(1)},${e.leave.vy.toFixed(1)}; the judge ${l.x.toFixed(2)},${l.y.toFixed(2)} v ${l.vx.toFixed(1)},${l.vy.toFixed(1)}`);
      const J = judgeFlight(l, FRAMES);
      e.air.forEach((f, i) => {
        const d = Math.max(Math.abs(f.x - J[i].x), Math.abs(f.y - J[i].y));
        if (d > worst) { worst = d; worstAt = `${what} frame ${i + 1}`; }
        assert.ok(d < 0.5, `${what}, air frame ${i + 1}: engine ${f.x.toFixed(2)},${f.y.toFixed(2)}, judge ${J[i].x.toFixed(2)},${J[i].y.toFixed(2)}`);
      });
      if (l.vx < -20) backHops++;
      if (l.t - l.pt > DT / 2) early++;
    });
  }
  // (the swing really holds the cases this is about: hops off the back of the swing, steered forward, and presses that waited)
  assert.ok(backHops >= 10, `back-swing hops pressed: ${backHops}`);
  assert.ok(early >= 4, `presses a beat early that waited: ${early}`);
  assert.ok(worst < 1e-3, `the worst frame is ${worst.toExponential(2)} px off (${worstAt})`);
});

test('a let-go over drifting logs: the judge\'s own landing (letGoFall + fallOnLog, what lianaDrops counts) is the engine\'s, at the river\'s clock as he presses (R-165.294)', () => {
  setTimedSwing(false);
  // (a river wide enough that no bank takes him: only the logs decide)
  const baseY = G - 60, count = 10;
  const w = { x0: 200, x1: 2400, dir: 1 as const, speed: 80, width: 120, baseY };
  const period = (w.x1 - w.x0 + w.width) / w.speed;
  const drifts: DriftInfo[] = Array.from({ length: count }, (_, i) => ({ ...w, offset: (i * period) / count }));
  const plats = (): Platform[] => drifts.map((d, i) => ({ id: 100 + i, x: driftX(d, 0), y: d.baseY, width: d.width, height: LOG_HEIGHT, type: 'drift', drift: { ...d } } as Platform));
  void LOG_DROP;
  const spacing = period / count;
  let ons = 0, offs = 0;
  for (const grip of GRIPS) {
    const hold = holdOf(LIANA, grip);
    const L = pressLaunches(LIANA, grip);
    for (let k = 0; k < L.length; k += 5) {
      const l = L[k];
      const f = letGoFall(l, drifts[0]);
      if (f.far) continue;
      for (const share of [0, 0.2, 0.4, 0.6, 0.8]) {
        const off = 60 + share * spacing;
        const judged = fallOnLog(f, drifts, off, false);
        const e = engineLetGo(plats(), LIANA, hold, l.pt, off, 60);
        const last = e.air[e.air.length - 1];
        const landed = !!last && last.grounded && last.on === 'drift';
        // (and the logs where the judge reads them, every frame of the flight: driftX at the river's clock as he pressed, plus the time since)
        e.air.forEach((fr, i) => {
          const dtSince = fr.t - off;
          fr.logs.forEach((x, q) => assert.ok(Math.abs(x - driftX(drifts[q], off + dtSince)) < 1e-6, `log ${q} at air frame ${i + 1}`));
        });
        assert.equal(landed, judged, `grip ${grip} press ${k}, river ${share}: the engine ${landed ? 'set him down on a log' : 'did not'} (${last ? `${last.x.toFixed(1)},${last.y.toFixed(1)} ${last.on || 'air'}` : '?'}), the judge says ${judged ? 'on a log' : 'in the water'}`);
        if (judged) ons++;
        else offs++;
      }
    }
  }
  assert.ok(ons >= 10 && offs >= 10, `the sample holds both: ${ons} on a log, ${offs} in the water`);
});

/**
 * R-165.297 (ENG-285b): a frame in the air with nothing steering. The engine (the game's refined controls) keeps his speed when the thumb
 * leaves the glass and brakes at PHYS.airStop only while Down is held (engine.ts, the air `dec` of the no-steer branch); airStep braked
 * PHYS.airDec (520) either way, so every check and bot that let go of the steer in mid-air flew a Pokey that slowed when the real one
 * coasts (the noisy-thumb bots' drifting thumb, tools/inspect/jumps.ts). Here he is put in the air and flown by the game's own touch
 * input, the steer and Down given frame by frame, against airStep given the same, to the pixel: coasting, braking with Down, a steer
 * then a let-go, a push back then a let-go, and faster than a run (a vine's throw) let go.
 */
test('a no-steer air frame: airStep coasts as the engine does and brakes at airStop only with Down held (R-165.297)', () => {
  type In = { dir: -1 | 0 | 1; down: boolean };
  const FRAMES = 24;
  const plans: { name: string; vx: number; vy: number; at: (i: number) => In }[] = [];
  for (const [vx, vy] of [[PHYS.maxRun, -200], [PHYS.maxRun, 0], [-PHYS.maxRun, 150], [140, -100], [420, -150], [-420, 60]] as const) {
    plans.push({ name: `coast ${vx},${vy}`, vx, vy, at: () => ({ dir: 0, down: false }) });
    plans.push({ name: `Down ${vx},${vy}`, vx, vy, at: () => ({ dir: 0, down: true }) });
    plans.push({ name: `steer then let go ${vx},${vy}`, vx, vy, at: (i) => ({ dir: i < 6 ? (vx > 0 ? 1 : -1) : 0, down: false }) });
    plans.push({ name: `push back then let go ${vx},${vy}`, vx, vy, at: (i) => ({ dir: i < 5 ? (vx > 0 ? -1 : 1) : 0, down: false }) });
    plans.push({ name: `let go then Down ${vx},${vy}`, vx, vy, at: (i) => ({ dir: 0, down: i >= 8 }) });
  }
  let coasted = 0, braked = 0, worst = 0, worstAt = '';
  for (const pl of plans) {
    const r = new RealPlay('2-1', 1);
    r.e.skills.delete('glide');
    r.bare([]);
    r.useRealInput();
    r.fly(1000, G, pl.vx, pl.vy);
    const b: AirBody = { x: 1000, y: G, vx: pl.vx, vy: pl.vy };
    for (let i = 0; i < FRAMES; i++) {
      const { dir, down } = pl.at(i);
      r.frame({ right: dir > 0, left: dir < 0, down });
      airStep(b, DT, dir, false, down);
      const d = Math.max(Math.abs(r.p.x - b.x), Math.abs(r.p.y - b.y), Math.abs(r.p.vx - b.vx) * DT);
      if (d > worst) { worst = d; worstAt = `${pl.name} frame ${i + 1}`; }
      assert.ok(!r.p.grounded, `${pl.name}: still in the air at frame ${i + 1}`);
      assert.ok(d < 1e-3, `${pl.name}, frame ${i + 1} (steer ${dir}, Down ${down}): engine ${r.p.x.toFixed(2)},${r.p.y.toFixed(2)} vx ${r.p.vx.toFixed(1)}; airStep ${b.x.toFixed(2)},${b.y.toFixed(2)} vx ${b.vx.toFixed(1)}`);
      if (dir === 0 && i > 0 && Math.abs(r.p.vx) > 1) (down ? braked++ : coasted++);
    }
  }
  // (the sample holds the cases this is about: frames that coast and frames that brake)
  assert.ok(coasted >= 100 && braked >= 20, `no-steer frames flown: ${coasted} coasting, ${braked} braking with Down`);
  assert.ok(worst < 1e-3, `the worst frame is ${worst.toExponential(2)} px off (${worstAt})`);
});

/**
 * ENG-285b (R-165.297): the frames on the ground before and at a jump. The engine steers the frame a jump leaves on ON the ground
 * (PHYS.groundAcc, the turn bonus reversing; nothing steering brakes nothing that frame) and only then lifts him; a hop flown from its
 * first frame as an air tick (airStep) under-steered a take-off from below a run (a stand: 4.1 px short over the flight). takeOffStep is
 * that frame; groundStep a frame of running on flat ground (the bots' run-up while a press is on its way, firsttimer.ts hopAim). Here he
 * stands at every speed either way, runs or brakes a few frames through the game's own touch input, then jumps, and every frame is the
 * model's to the pixel.
 */
test('the take-off frame and the run-up: takeOffStep and groundStep fly as the engine does, every speed and steer (R-165.297)', () => {
  const FLAT = { id: 1, x: 0, y: G, width: 4000, height: 40, type: 'solid' } as Platform;
  let n = 0, worst = 0, worstAt = '', offGround = 0;
  for (const vx0 of [0, 60, 150, 250, PHYS.maxRun, -150, -PHYS.maxRun]) {
    for (const run of [1, 0, -1] as const) {
      for (const jumpDir of [1, 0, -1] as const) {
        for (const runFrames of [0, 3]) {
          const r = new RealPlay('2-1', 1);
          r.e.skills.delete('glide');
          r.bare([FLAT]);
          r.useRealInput();
          r.stand(2000, G);
          r.p.vx = vx0;
          const b: AirBody = { x: 2000, y: G, vx: vx0, vy: 0 };
          const what = `from ${vx0} px/s, run ${run} for ${runFrames}, jump steering ${jumpDir}`;
          const check = (frame: string) => {
            const d = Math.max(Math.abs(r.p.x - b.x), Math.abs(r.p.y - b.y), Math.abs(r.p.vx - b.vx) * DT);
            if (d > worst) { worst = d; worstAt = `${what}, ${frame}`; }
            assert.ok(d < 1e-6, `${what}, ${frame}: engine ${r.p.x.toFixed(2)},${r.p.y.toFixed(2)} vx ${r.p.vx.toFixed(1)}; model ${b.x.toFixed(2)},${b.y.toFixed(2)} vx ${b.vx.toFixed(1)}`);
          };
          for (let i = 0; i < runFrames; i++) {
            r.frame({ right: run > 0, left: run < 0 });
            groundStep(b, DT, run);
            check(`run frame ${i + 1}`);
            n++;
          }
          r.frame({ right: jumpDir > 0, left: jumpDir < 0, press: true, jump: true });
          b.vy = -PHYS.jumpV;
          takeOffStep(b, DT, jumpDir, true);
          assert.ok(!r.p.grounded, `${what}: he left the ground`);
          check('the take-off frame');
          n++;
          if (Math.abs(vx0) < PHYS.maxRun && jumpDir !== 0) offGround++;
          for (let i = 0; i < 8; i++) {
            r.frame({ right: jumpDir > 0, left: jumpDir < 0, jump: true });
            airStep(b, DT, jumpDir, true);
            check(`air frame ${i + 1}`);
            n++;
          }
        }
      }
    }
  }
  assert.ok(offGround >= 40, `take-offs steered from below a run: ${offGround}`);
  assert.ok(worst < 1e-6, `${n} frames; the worst is ${worst.toExponential(2)} px off (${worstAt})`);
});
