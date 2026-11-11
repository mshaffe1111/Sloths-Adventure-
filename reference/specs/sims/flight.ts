/**
 * flight.ts: Pokey's reach, flown in the real engine at 30 fps (R-165.60). Designer sim; nothing in the game imports it.
 *
 *   npx tsx reference/specs/sims/flight.ts <normal|easy> <apex|rise|rshare|tshare|dist|ddist|bdist|touch|harness|consts|all|chain>
 *   FLIGHT_STAGE=1-2 flies another stage's help (default 1-1). `chain` (R-165.111, 1-2): a mushroom bounce chain, cap to cap; not in `all`.
 *
 * The engine is src/game/engine.ts run by realPlay.ts on stage 1-1 (seed 1), its stage swapped for a bare world (RealPlay.bare).
 * The controls go through the game's own InputEngine (the press keep, the 220 ms / 80 ms minimum hold), wired as touchRig.ts wires it,
 * not through realPlay's FakeInput (mode `harness` flies both and prints where they differ).
 *
 * World: floor A, top at y = FLOOR, its right lip at x = LIP. Far piece B starts at x = LIP + gap, its top `rise` px higher.
 * `block` = a solid 50 px or taller (a bank: the engine's lip hoist works on it); `thin` = a 24 px piece (a log, a bough: no hoist).
 * A press is one of: `hold` (Jump kept down), `flick` (a touch flick: lifted at once, held 220 ms by the input), `tap` (the Pad's Jump
 * button tapped for 66 ms: held 80 ms by the input).
 */
import '../../../src/game/headlessDom.ts';
import { RealPlay, DT } from '../../../src/game/realPlay.ts';
import { InputEngine, pressKeep } from '../../../src/game/inputEngine.ts';
import { setDifficulty } from '../../../src/game/difficulty.ts';
import { ASSIST, DOUBLE_RISE, FORGIVE, JUMP_RISE, LAND_HALF, PHYS, TAKEOFF_SLACK, reachBounce, reachJump } from '../../../src/game/physics.ts';
import { BOUNCE_REACH, maxGap, riseLimit } from '../../../src/game/gen2/pipeline.ts';
import { MARGIN } from '../../../src/game/gen2/types.ts';
import type { Platform } from '../../../src/game/types.ts';

type Setting = 'normal' | 'easy';
type Press = 'hold' | 'flick' | 'tap';
const setting = (process.argv[2] ?? 'normal') as Setting;
const mode = process.argv[3] ?? 'all';
setDifficulty(setting);

/** the engine's step: 1/30 s, or FLIGHT_FPS=25 to fly a slow phone (one step per frame up to 50 ms: engine.ts loop) */
const STEP = process.env.FLIGHT_FPS ? 1 / Number(process.env.FLIGHT_FPS) : DT;
/** the stage flown (the early-stage help is a ramp by stage number, physics.ts easeAssist): FLIGHT_STAGE=1-2 flies 1-2's Normal */
const STAGE = process.env.FLIGHT_STAGE ?? '1-1';
const FLOOR = 5000;
const LIP = 3000;
const HOLD_MS: Record<Press, number> = { hold: 220, flick: 220, tap: 80 };
/** frames a tapped button stays down under the thumb (66 ms) */
const TAP_FRAMES = 2;

const solid = (id: number, x: number, y: number, width: number, height: number, type: Platform['type'] = 'solid'): Platform => ({ id, x, y, width, height, type }) as Platform;

class Rig {
  readonly r = new RealPlay(STAGE, 1);
  readonly inp: InputEngine | null;
  private lift = -1;
  frames = 0;
  constructor(real = true) {
    if (real) {
      const inp = new InputEngine();
      inp.source = 'pad';
      this.inp = inp;
      this.r.e.input = inp;
    } else this.inp = null;
  }
  get p() {
    return this.r.p;
  }
  world(pl: Platform[]) {
    this.r.bare(pl);
  }
  /** stand him at x on the floor, running right at full speed */
  start(x: number, vx: number = PHYS.maxRun, y = FLOOR) {
    this.r.stand(x, y);
    this.inp?.clearAll();
    Object.assign(this.p, { vx, facing: 1 });
    this.steer = vx > 0 || this.steerAlways;
    if (this.inp && this.steer) this.inp.triggerTouchMove('right');
    this.lift = -1;
    this.frames = 0;
    this.held = false;
  }
  steerAlways = true;
  private steer = true;
  private held = false;
  press(kind: Press) {
    if (this.inp) {
      this.inp.triggerTouchUp(0, HOLD_MS[kind]);
      if (kind === 'flick') this.inp.releaseTouchUp();
      this.lift = kind === 'tap' ? this.frames + TAP_FRAMES : -1;
    } else {
      // (FakeInput: no minimum hold; a flick or a tap is one frame of Jump)
      this.fakePress = true;
      this.held = kind === 'hold';
    }
  }
  private fakePress = false;
  frame() {
    if (this.inp) {
      if (this.lift === this.frames) this.inp.releaseTouchUp();
      this.p.invincibleTimer = 1e9;
      this.r.e.update(STEP);
    } else {
      this.r.frame({ right: this.steer, press: this.fakePress, jump: this.held });
      this.fakePress = false;
    }
    this.frames++;
  }
}

interface Plan {
  /** stand at this x */
  x0: number;
  /** first press on this frame (-1: none) */
  f1: number;
  /** second press this many frames after the first (-1: none) */
  f2: number;
  press: Press;
  vx?: number;
  /** keep Jump down from the start (a bounce with Jump held) */
  holdFromStart?: boolean;
}
interface Flight {
  ok: boolean;
  apex: number;
  /** centre x - LIP when the first press was read, and airborne frames before it (0 = on the ground) */
  pressX: number;
  k: number;
  landX: number;
}

function fly(rig: Rig, pl: Platform[], target: number, plan: Plan, maxFrames = 110): Flight {
  rig.world(pl.map((q) => ({ ...q })));
  rig.start(plan.x0, plan.vx);
  let apex = 0, pressX = NaN, k = 0, air = 0, ok = false;
  for (let f = 0; f < maxFrames; f++) {
    if (f === plan.f1) {
      pressX = rig.p.x - LIP;
      k = air;
      rig.press(plan.press);
    }
    if (plan.f2 >= 0 && f === Math.max(0, plan.f1) + plan.f2) rig.press(plan.press);
    // (Jump held through a bounce: down from the moment the cap throws him)
    if (plan.holdFromStart && rig.inp && rig.p.vy < -600) rig.inp.state.jumpHeld = true;
    rig.frame();
    air = rig.p.grounded ? 0 : air + 1;
    apex = Math.max(apex, FLOOR - rig.p.y);
    if (rig.p.grounded && rig.r.standingOn === target) {
      ok = true;
      break;
    }
    if (rig.p.y > FLOOR + 200) break;
    if (f > Math.max(plan.f1, 0) + Math.max(plan.f2, 0) + 4 && rig.p.grounded && target !== 1) break;
  }
  return { ok, apex, pressX, k, landX: rig.p.x - LIP };
}

/** the largest v in [lo, hi] (whole px) for which ok(v), or lo - 1 */
function most(lo: number, hi: number, ok: (v: number) => boolean): number {
  if (!ok(lo)) return lo - 1;
  let a = lo, b = hi + 1;
  while (b - a > 1) {
    const m = (a + b) >> 1;
    if (ok(m)) a = m;
    else b = m;
  }
  return a;
}

const floorA = () => solid(1, 100, FLOOR, LIP - 100, 600);
const far = (gap: number, rise: number, kind: 'block' | 'thin') => solid(2, LIP + gap, FLOOR - rise, 900, kind === 'block' ? 600 + rise : 24);
const row = (...c: Array<string | number>) => console.log(c.map((v, i) => (typeof v === 'number' ? v.toFixed(1) : v).padStart(i ? 9 : 26)).join(''));

// ───────────────────────────── apex: how high his feet go ─────────────────────────────
function apexRun(rig: Rig) {
  console.log(`\n[apex] ${setting}: highest his feet rise over the take-off floor (px), standing start, no piece to land on`);
  const A = [solid(1, 100, FLOOR, 5000, 600)];
  const one = (press: Press) => fly(rig, A, 1, { x0: 1000, f1: 0, f2: -1, press, vx: 0 }, 60).apex;
  const two = (press: Press) => {
    let best = 0, at = 0, worst = 1e9;
    for (let f2 = 2; f2 <= 22; f2++) {
      const a = fly(rig, A, 1, { x0: 1000, f1: 0, f2, press, vx: 0 }, 80).apex;
      if (a > best) (best = a), (at = f2);
      if (f2 <= 12) worst = Math.min(worst, a);
    }
    return { best, at, worst };
  };
  for (const press of ['hold', 'flick', 'tap'] as Press[]) {
    const d = two(press);
    row(`single ${press}`, one(press));
    row(`double ${press} best`, d.best, `f2=${d.at}`, `min f2 2-12: ${d.worst.toFixed(1)}`);
  }
  // the mushroom: 70 x 30 on the floor, walked into
  const M = [solid(1, 100, FLOOR, 5000, 600), solid(3, 1100, FLOOR - 30, 70, 30, 'bouncy')];
  for (const held of [false, true]) {
    row(`bounce (Jump ${held ? 'held' : 'free'})`, fly(rig, M, 99, { x0: 1040, f1: -1, f2: -1, press: 'hold', holdFromStart: held }, 70).apex);
  }
  let best = 0, at = 0;
  const all: number[] = [];
  for (let f = 8; f <= 40; f++) {
    const a = fly(rig, M, 99, { x0: 1040, f1: f, f2: -1, press: 'hold' }, 90).apex;
    all.push(a);
    if (a > best) (best = a), (at = f);
  }
  row('bounce+double hold best', best, `f=${at}`);
  best = 0;
  for (let f = 8; f <= 40; f++) best = Math.max(best, fly(rig, M, 99, { x0: 1040, f1: f, f2: -1, press: 'flick' }, 90).apex);
  row('bounce+double flick best', best);
  console.log('  (bounce figures are over the FLOOR; the cap is 30 px up, so over the cap = figure - 30)');
}

// ───────────────────────────── rise: the highest piece he gets onto ─────────────────────────────
function riseRun(rig: Rig) {
  console.log(`\n[rise] ${setting}: the highest top he ends up standing on (px over the floor), running at it, best of the take-off spots`);
  const A = () => solid(1, 100, FLOOR, 6000, 600);
  const spots = [20, 40, 60, 90, 120, 160];
  const top = (kind: 'block' | 'thin', press: Press, dbl: boolean, vx = PHYS.maxRun) => {
    let best = 0, worstBest = 1e9;
    for (const d of spots) {
      const f2s = dbl ? [3, 5, 7, 9, 10, 11, 12, 13, 15] : [-1];
      let here = 0;
      for (const f2 of f2s) {
        const h = most(40, 330, (H) => fly(rig, [A(), far(0, H, kind)], 2, { x0: LIP - d, f1: 0, f2, press, vx }).ok);
        here = Math.max(here, h);
      }
      best = Math.max(best, here);
      worstBest = Math.min(worstBest, here);
    }
    return [best, worstBest];
  };
  console.log('                              block    (worst spot)    thin   (worst spot)');
  for (const press of ['hold', 'flick', 'tap'] as Press[]) {
    for (const dbl of [false, true]) {
      const b = top('block', press, dbl), t = top('thin', press, dbl);
      row(`${dbl ? 'double' : 'single'} ${press}`, b[0], b[1], t[0], t[1]);
    }
  }
  // the bounce: mushroom on the floor, its right edge `d` px from the face
  const bounce = (kind: 'block' | 'thin', dbl: boolean, press: Press) => {
    let best = 0, worst = 1e9;
    for (const d of [30, 60, 100, 140]) {
      const mush = solid(3, LIP - d - 70, FLOOR - 30, 70, 30, 'bouncy');
      let here = 0;
      for (const f of dbl ? [10, 13, 16, 18, 20, 22, 24, 27, 30] : [-1]) {
        here = Math.max(here, most(100, 420, (H) => fly(rig, [A(), mush, far(0, H, kind)], 2, { x0: LIP - d - 130, f1: f, f2: -1, press }).ok));
      }
      best = Math.max(best, here);
      worst = Math.min(worst, here);
    }
    return [best, worst];
  };
  for (const [name, dbl, press] of [['bounce alone', false, 'hold'], ['bounce+double hold', true, 'hold'], ['bounce+double flick', true, 'flick'], ['bounce+double tap', true, 'tap']] as Array<[string, boolean, Press]>) {
    const b = bounce('block', dbl, press), t = bounce('thin', dbl, press);
    row(name, b[0], b[1], t[0], t[1]);
  }
}


// ───────────────────────────── rshare: how often a rise is climbed, over take-off spots and second-press timings ─────────────────────────────
function rshareRun(rig: Rig) {
  const A = () => solid(1, 100, FLOOR, 6000, 600);
  const pct = (ok: number, n: number) => `${((100 * ok) / n).toFixed(0)}%`.padStart(8);
  console.log(`\n[rshare] ${setting}: share of tries that end standing on a BLOCK top H px over the floor. Take-off 10-110 px from the face (11 spots); a double's second press 2-16 frames after the first`);
  console.log('     H  1 hold  1 flick   1 tap  2 hold 2 flick   2 tap');
  for (const H of [84, 100, 110, 114, 118, 123, 124, 128, 132, 136, 140, 150, 165, 180, 195, 205, 212, 215]) {
    let line = String(H).padStart(6);
    for (const dbl of [false, true]) {
      for (const press of ['hold', 'flick', 'tap'] as Press[]) {
        let n = 0, ok = 0;
        for (let d = 10; d <= 110; d += 10) {
          for (const f2 of dbl ? [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16] : [-1]) {
            n++;
            if (fly(rig, [A(), far(0, H, 'block')], 2, { x0: LIP - d, f1: 0, f2, press }).ok) ok++;
          }
        }
        line += pct(ok, n);
      }
    }
    console.log(line);
  }
  console.log(`\n[rshare] ${setting}: the floor mushroom (70 x 30). Its right edge 20-100 px from the face (5 spots); an air jump 6-36 frames after the cap throws him`);
  console.log('     H  bounce alone  +flick   +tap   frames of the 31 that clear (+flick, mushroom 40 px from the face)');
  for (const H of [190, 200, 210, 216, 220, 223, 226, 232, 240, 246, 250, 260, 280, 300, 310]) {
    let line = String(H).padStart(6);
    const ds = [20, 40, 60, 80, 100];
    const world = (d: number) => [A(), solid(3, LIP - d - 70, FLOOR - 30, 70, 30, 'bouncy'), far(0, H, 'block')];
    let ok = 0;
    for (const d of ds) if (fly(rig, world(d), 2, { x0: LIP - d - 130, f1: -1, f2: -1, press: 'hold' }).ok) ok++;
    line += pct(ok, ds.length).padStart(12);
    let win = '';
    for (const press of ['flick', 'tap'] as Press[]) {
      let n = 0;
      ok = 0;
      for (const d of ds) {
        for (let f = 0; f <= 30; f++) {
          n++;
          // (the cap throws him about 4 frames after the start: the press comes 6-36 frames after that)
          const r = fly(rig, world(d), 2, { x0: LIP - d - 130, f1: f + 10, f2: -1, press });
          if (r.ok) ok++;
          if (press === 'flick' && d === 40) win += r.ok ? '#' : '.';
        }
      }
      line += pct(ok, n);
    }
    console.log(line + '   ' + win);
  }
}

// ───────────────────────────── tshare: the same shares onto a THIN top (a log, a bough: no lip hoist) ─────────────────────────────
function tshareRun(rig: Rig) {
  const A = () => solid(1, 100, FLOOR, 6000, 600);
  const pct = (ok: number, n: number) => `${((100 * ok) / n).toFixed(0)}%`.padStart(8);
  console.log(`\n[tshare] ${setting}: share of tries that end standing on a THIN top H px over the floor. Take-off 10-110 px before its near end (11 spots); a double's second press 2-16 frames after the first`);
  console.log('     H  1 hold  1 flick   1 tap  2 hold 2 flick   2 tap');
  for (const H of [110, 114, 117, 118, 122, 125, 128, 131, 134, 136, 140, 150, 180, 200, 206, 209]) {
    let line = String(H).padStart(6);
    for (const dbl of [false, true]) {
      for (const press of ['hold', 'flick', 'tap'] as Press[]) {
        let n = 0, ok = 0;
        for (let d = 10; d <= 110; d += 10) {
          for (const f2 of dbl ? [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16] : [-1]) {
            n++;
            if (fly(rig, [A(), far(0, H, 'thin')], 2, { x0: LIP - d, f1: 0, f2, press }).ok) ok++;
          }
        }
        line += pct(ok, n);
      }
    }
    console.log(line);
  }
}

// ───────────────────────────── dist: the widest level gap ─────────────────────────────
const BUCKETS = ['>=70 before lip', '>=35 before lip', 'centre at/before lip', 'last ground frame', 'coyote 1-2', 'coyote 3+', 'ANY (physical)'] as const;
function bucketOf(pressX: number, k: number): number[] {
  const b: number[] = [6];
  if (k === 0) {
    b.push(3);
    if (pressX <= 0) b.push(2);
    if (pressX <= -35) b.push(1);
    if (pressX <= -70) b.push(0);
  } else if (k <= 2) b.push(4);
  else b.push(5);
  return b;
}
function distRun(rig: Rig, dbl: boolean, presses: Press[], rise = 0) {
  console.log(`\n[${dbl ? 'ddist' : 'dist'}] ${setting}: widest gap crossed (px, lip to lip), full run, far top ${rise} px ${rise >= 0 ? 'up' : 'down'}; by where the jump registered`);
  console.log('                              block     thin    (coyote: most airborne frames that still jumped)');
  for (const press of presses) {
    const best = { block: BUCKETS.map(() => 0), thin: BUCKETS.map(() => 0) };
    let kMax = 0;
    const phases = dbl ? [0, 2.4, 4.8, 7.2] : Array.from({ length: 19 }, (_, i) => i * 0.5);
    const f2s = dbl ? [4, 6, 8, 10, 11, 12, 13, 14, 16, 18, 20] : [-1];
    for (const ph of phases) {
      for (let f1 = 0; f1 <= 22; f1++) {
        for (const kind of ['block', 'thin'] as const) {
          let w = 0, info: Flight | null = null;
          for (const f2 of f2s) {
            const plan = { x0: LIP - 125 - ph, f1, f2, press };
            const probe = fly(rig, [floorA(), far(60, rise, kind)], 2, plan);
            if (!Number.isFinite(probe.pressX)) continue;
            info = probe;
            if (!probe.ok && probe.apex < 20) continue; // (the press came too late: no jump)
            w = Math.max(w, most(60, 520, (W) => fly(rig, [floorA(), far(W, rise, kind)], 2, plan).ok));
          }
          if (!info || w < 60) continue;
          kMax = Math.max(kMax, info.k);
          for (const b of bucketOf(info.pressX, info.k)) best[kind][b] = Math.max(best[kind][b], w);
        }
      }
    }
    console.log(`  ${dbl ? 'double' : 'single'} ${press}   (coyote frames ${kMax})`);
    BUCKETS.forEach((name, i) => row(name, best.block[i], best.thin[i]));
  }
}


function bounceDist(rig: Rig) {
  console.log(`\n[bdist] ${setting}: widest level gap crossed off a floor mushroom whose right edge is d px before the lip (block far side)`);
  console.log('                         d    bounce alone   +air jump (best moment)');
  for (const d of [0, 20, 40]) {
    const mush = solid(3, LIP - d - 70, FLOOR - 30, 70, 30, 'bouncy');
    const w = (f: number) => most(40, 620, (W) => fly(rig, [floorA(), mush, far(W, 0, 'block')], 2, { x0: LIP - d - 130, f1: f, f2: -1, press: 'flick' }, 140).ok);
    let best = 0;
    for (let f = 8; f <= 40; f += 2) best = Math.max(best, w(f));
    row(String(d), w(-1), best);
  }
}

// ───────────────────────────── touch: the Pad's two taps over the double-teach band ─────────────────────────────
function touchRun(rig: Rig) {
  console.log(`\n[touch] ${setting}: the Pad's Jump button TAPPED twice over a level gap. Share of take-offs that cross (first tap from 70 px before the lip to the last ground frame; second tap 3-14 frames later)`);
  console.log('                gap    tap,tap   flick,flick   hold,hold   (block far side)');
  for (const W of [150, 195, 205, 228, 245, 250, 256, 262, 270, 283, 300]) {
    const share = (press: Press) => {
      let n = 0, okN = 0;
      for (const ph of [0, 3.2, 6.4]) {
        for (let f1 = 0; f1 <= 12; f1++) {
          for (let f2 = 3; f2 <= 14; f2++) {
            const r = fly(rig, [floorA(), far(W, 0, 'block')], 2, { x0: LIP - 95 - ph, f1, f2, press });
            if (r.k !== 0 || r.pressX < -70) continue;
            n++;
            if (r.ok) okN++;
          }
        }
      }
      return `${((100 * okN) / n).toFixed(0)}%`.padStart(4) + ` (${n})`;
    };
    console.log(`            ${String(W).padStart(6)}   ${share('tap')}   ${share('flick')}   ${share('hold')}`);
  }
}

// ───────────────────────────── harness: FakeInput against the game's InputEngine ─────────────────────────────
function harnessRun() {
  console.log(`\n[harness] ${setting}: realPlay's FakeInput against the game's InputEngine (pressKeep ${pressKeep().toFixed(3)} s; FakeInput keeps a press 0.160 s)`);
  const A = [solid(1, 100, FLOOR, 5000, 600)];
  console.log('                              real     fake');
  const rr = new Rig(true), rf = new Rig(false);
  for (const press of ['hold', 'flick', 'tap'] as Press[]) {
    row(`apex single ${press}`, fly(rr, A, 1, { x0: 1000, f1: 0, f2: -1, press, vx: 0 }, 60).apex, fly(rf, A, 1, { x0: 1000, f1: 0, f2: -1, press, vx: 0 }, 60).apex);
  }
  for (const kind of ['block', 'thin'] as const) {
    const w = (rig: Rig) => {
      let best = 0;
      for (let ph = 0; ph < 9.5; ph += 0.5) for (let f1 = 0; f1 <= 12; f1++) best = Math.max(best, most(60, 400, (W) => fly(rig, [floorA(), far(W, 0, kind)], 2, { x0: LIP - 60 - ph, f1, f2: -1, press: 'hold' }).ok));
      return best;
    };
    row(`widest single hold ${kind}`, w(rr), w(rf));
  }
  // the press keep: a press this many frames before he lands still jumps as he lands (the engine's own buffer)
  const early = (rig: Rig) => {
    let n = 0;
    for (let lead = 1; lead <= 12; lead++) {
      rig.world(A.map((q) => ({ ...q })));
      rig.r.fly(1000, FLOOR - 4 - 2.8 * lead * lead, 0, 0, 0);
      rig.inp?.clearAll();
      let jumped = false, pressed = false, f = 0;
      for (; f < 40; f++) {
        // (he lands about `lead` frames after the press)
        if (!pressed) {
          rig.press('hold');
          pressed = true;
        }
        rig.frame();
        if (rig.p.vy < -300) {
          jumped = true;
          break;
        }
        if (rig.p.grounded) break;
      }
      if (jumped) n = Math.max(n, f);
    }
    return n;
  };
  row('early press kept (frames)', early(rr), early(rf));
}

function consts() {
  const m = MARGIN[setting];
  console.log(`\n[consts] the builder's numbers (${setting}, margin ${m})`);
  row('JUMP_RISE', JUMP_RISE);
  row('DOUBLE_RISE', DOUBLE_RISE);
  row('BOUNCE_REACH', BOUNCE_REACH);
  row('reachJump(0) single', reachJump(0, false));
  row('reachJump(0) double', reachJump(0, true));
  row('reachBounce(0) single', reachBounce(0, false));
  row('maxGap(0) single', maxGap(0, false, m));
  row('maxGap(0) double', maxGap(0, true, m));
  row('riseLimit single', riseLimit(false, m), 'laid x0.9', riseLimit(false, m) * 0.9);
  row('riseLimit double', riseLimit(true, m), 'laid x0.95', riseLimit(true, m) * 0.95);
  row('TAKEOFF_SLACK / LAND_HALF', TAKEOFF_SLACK, LAND_HALF);
  const f = FORGIVE[setting];
  row('engine on 1-1: coyote s', f.coyote + ASSIST.coyote, 'landPx', f.landPx, 'stand', 44 * (0.26 + ASSIST.landSide));
  row('double launch on 1-1', PHYS.doubleV * (1 + ASSIST.doubleJump));
}


// ───────────────────────────── chain: mushroom to mushroom (1-2's bounce chain, specs/chain.md) ─────────────────────────────
/**
 * A chain: floor A to the lip; mushroom 0 on A, its right edge d0 px before the lip; then n pillars standing in the pit (PW wide, a cap
 * 70 x 30 at each one's middle: the engine's mushroom), cap k's centre S px past cap k-1's and `step` px higher (negative: lower); then
 * a far bank B, its lip E px past the last PILLAR's right edge, its top `out` px over the last pillar's top (the cap is 30 px over that).
 * Pilots: `held` keeps the thumb right from start to finish (a child's thumb); `hover` steers at the next cap's centre every frame
 * (right when short of it, left when past it, off within 8 px: a player who steers); `jumpAt` adds one Jump flick on that frame.
 * Result: clean (every cap bounced in turn, standing on B), pillar (he came to stand on a pillar top beside its cap: safe, he walks into
 * the cap and goes on), fell (into the pit), skip (standing on B having missed a cap), short (timed out).
 */
type ChainEnd = 'clean' | 'pillar' | 'fell' | 'skip' | 'short';
function chainFly(rig: Rig, S: number, step: number, n: number, opt: { pilot?: 'held' | 'hover'; E?: number; out?: number; PW?: number; d0?: number; jumpAt?: number; back?: number } = {}): ChainEnd {
  const capW = 70, d0 = opt.d0 ?? 20, E = opt.E ?? 40, out = opt.out ?? 0, PW = opt.PW ?? 120;
  const pl: Platform[] = [floorA()];
  const c0 = LIP - d0 - 35;
  pl.push(solid(3, c0 - 35, FLOOR - 30, 70, 30, 'bouncy'));
  const centres: number[] = [c0];
  for (let k = 1; k <= n; k++) {
    const c = c0 + k * S, top = FLOOR - k * step;
    centres.push(c);
    pl.push(solid(10 + k, c - PW / 2, top, PW, 900));
    pl.push(solid(40 + k, c - capW / 2, top - 30, capW, 30, 'bouncy'));
  }
  pl.push(solid(2, centres[n] + PW / 2 + E, FLOOR - n * step - out, 900, 900 + out));
  rig.world(pl.map((q) => ({ ...q })));
  rig.start(c0 - 35 - 60 - (opt.back ?? 0), PHYS.maxRun);
  let bounces = 0, lastVy = 0, next = 1;
  for (let f = 0; f < 80 + n * 45 + 90; f++) {
    const p = rig.p;
    if (opt.pilot === 'hover' && rig.inp && bounces > 0) {
      const tx = next <= n ? centres[next] : centres[n] + PW / 2 + E + 60;
      rig.inp.triggerTouchMove(p.x < tx - 8 ? 'right' : p.x > tx + 8 ? 'left' : 'none');
    }
    if (opt.jumpAt !== undefined && f === opt.jumpAt) rig.press('flick');
    rig.frame();
    if (p.vy <= -700 && lastVy > -700) {
      // (which cap threw him: the nearest centre)
      const k = centres.reduce((bi, c, i) => (Math.abs(c - p.x) < Math.abs(centres[bi] - p.x) ? i : bi), 0);
      bounces++;
      next = k + 1;
    }
    lastVy = p.vy;
    if (p.grounded && rig.r.standingOn === 2) return bounces === n + 1 ? 'clean' : 'skip';
    if (p.grounded && rig.r.standingOn >= 10 && rig.r.standingOn < 40) return 'pillar';
    if (p.y > FLOOR + 400) return 'fell';
  }
  return 'short';
}
function chainRun(rig: Rig) {
  const n = 3;
  const span = (a: number[]) => (a.length ? `${a[0]}-${a[a.length - 1]}${a.length !== (a[a.length - 1] - a[0]) / 5 + 1 ? ' (holes)' : ''}` : 'none');
  const SS = Array.from({ length: 53 }, (_, i) => 80 + i * 5);
  console.log(`\n[chain] ${setting}, stage ${STAGE}: a floor mushroom, then ${n} pillar mushrooms (caps 70 x 30 on pillars 120 wide), then a bank. S = cap centre to cap centre, px`);
  console.log('  (a) LEVEL caps: how each S ends. held = thumb right all the way; hover = steering at each cap');
  console.log('       S    held     hover');
  for (let S = 90; S <= 330; S += 10) console.log(`${String(S).padStart(8)}    ${chainFly(rig, S, 0, n).padEnd(8)} ${chainFly(rig, S, 0, n, { pilot: 'hover' })}`);
  console.log('  (b) STEPPED caps (each `step` px higher than the last; negative: lower): the S that end clean, 5 px apart');
  for (const step of [-90, -60, -30, 0, 30, 60, 90, 120, 140, 150]) {
    const held = SS.filter((S) => chainFly(rig, S, step, n) === 'clean'), hov = SS.filter((S) => chainFly(rig, S, step, n, { pilot: 'hover' }) === 'clean');
    const safe = SS.filter((S) => { const r = chainFly(rig, S, step, n); return r === 'clean' || r === 'pillar'; });
    console.log(`    step ${String(step).padStart(4)}   held clean ${span(held).padEnd(18)} held clean-or-pillar ${span(safe).padEnd(18)} hover clean ${span(hov)}`);
  }
  console.log('  (c) thumb held, by where he starts his run (0-110 px further back, 12 starts): starts that end clean / on a pillar / fell, level caps');
  for (const S of [195, 200, 205, 210, 215, 220, 225, 230, 235]) {
    const c: Record<string, number> = {};
    for (let back = 0; back < 120; back += 10) { const r = chainFly(rig, S, 0, n, { back }); c[r] = (c[r] ?? 0) + 1; }
    console.log(`    S ${S}   clean ${c.clean ?? 0}  pillar ${c.pillar ?? 0}  fell ${c.fell ?? 0}  other ${(c.skip ?? 0) + (c.short ?? 0)}`);
  }
  console.log('  (d) PILLAR width (level, thumb held): S clean / S clean-or-pillar');
  for (const PW of [70, 120, 160, 200]) {
    const held = SS.filter((S) => chainFly(rig, S, 0, n, { PW }) === 'clean'), safe = SS.filter((S) => { const r = chainFly(rig, S, 0, n, { PW }); return r === 'clean' || r === 'pillar'; });
    console.log(`    pillar ${String(PW).padStart(3)}   clean ${span(held).padEnd(14)} clean-or-pillar ${span(safe)}`);
  }
  console.log('  (e) the EXIT off the last cap (level chain, S 215, thumb held): the bank lip E px past the last pillar (120 wide), its top `out` px over the pillar top (the cap is +30): E that end clean');
  for (const out of [0, 30, 60, 90, 120, 150, 170, 185, 195]) {
    const es: number[] = [];
    for (let E = 0; E <= 260; E += 5) if (chainFly(rig, 215, 0, n, { E, out }) === 'clean') es.push(E);
    console.log(`    out ${String(out).padStart(4)}   E ${span(es)}`);
  }
  console.log('  (f) the ENTRY: the floor mushroom its edge d0 px before the lip (level, thumb held): S clean');
  for (const d0 of [0, 20, 40, 60]) console.log(`    d0 ${String(d0).padStart(3)}   S ${span(SS.filter((S) => chainFly(rig, S, 0, n, { d0 }) === 'clean'))}`);
  console.log('  (g) a NERVOUS thumb: one extra Jump flick in the air (frames 14-70, every 2nd), level chain: how the 29 tries end, thumb held / hover');
  for (const S of [170, 190, 215]) {
    for (const pilot of ['held', 'hover'] as const) {
      const c: Record<string, number> = {};
      for (let f = 14; f <= 70; f += 2) { const r = chainFly(rig, S, 0, n, { jumpAt: f, pilot }); c[r] = (c[r] ?? 0) + 1; }
      console.log(`    S ${S} ${pilot.padEnd(5)}  clean ${c.clean ?? 0}  skip ${c.skip ?? 0}  pillar ${c.pillar ?? 0}  fell ${c.fell ?? 0}  short ${c.short ?? 0}`);
    }
  }
}

const rig = new Rig(true);
const want = (m: string) => mode === m || mode === 'all';
if (want('consts')) consts();
if (want('apex')) apexRun(rig);
if (want('rise')) riseRun(rig);
if (want('rshare')) rshareRun(rig);
if (want('tshare')) tshareRun(rig);
if (want('dist')) distRun(rig, false, ['hold', 'flick', 'tap']);
if (want('ddist')) distRun(rig, true, ['hold', 'flick', 'tap']);
if (want('bdist')) bounceDist(rig);
if (want('touch')) touchRun(rig);
if (want('harness')) harnessRun();
if (mode === 'chain') chainRun(rig);
