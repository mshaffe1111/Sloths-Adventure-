/**
 * w3flight35 — 3-3's, 3-4's and 3-5's numbers, flown in the real engine at 30 fps through the game's own InputEngine (level.md rule 24;
 * DESIGN-33-35). Pokey's moves are the engine's (RealPlay + the Pad); the prowler is the creature kit's own OCELOT stepped by
 * predators/core.ts (hear, stepPredator) and predators/lure.ts (a LurePost), the spore clock is zones.ts zoneState, the vine clock is
 * thornVine.ts. Designer sim; nothing in the game imports it.
 *
 *   npx tsx reference/specs/sims/w3flight35.ts <normal|easy> <hop|punch|come|lure|bait|climb|stair|beam|quiet|twist|all>
 *
 * hop    the rig's check: a tapped hop reads the known 0.43 s / 106-119 px
 * punch  from the punch press to the claw's first strike frame (fight.ts jab), standing at a chime stone
 * come   (3-3) a rung bell (heroNoise bellNoise, r 680) heard by a pacing kit ocelot D px away: how long until it stands under the bell,
 *        and how long it then looks (OCELOT.hears = NOISE.dur); and the share of its round in which a bell at the round's end reaches it
 * lure   (3-3) the spore catch: the bell hangs over a sleepy-mushroom patch at the end of the ocelot's round; the patch is a LurePost the
 *        kit already runs (lure.ts: works only while it is after him, i.e. called), working only while the patch's cloud is out
 *        (zoneState strength > DROWSY_MIN) for `dwell` s. A ring at every 0.1 s of the clock x every start place on the round: the share
 *        caught, ring->yawn time (mean, worst), per clock (period, active)
 * bait   (3-3 twist) his loud landing (flown) beside the patch calls the ocelot 'alert' to where he landed; he climbs a root out of its
 *        sight (flown climb); does the cloud catch it while it hunts there (giveUp 3 s), by the clock phase he lands in
 * climb  (3-3, 3-4, 3-5) a root column: Up from a stand at its foot: the climb speed, how long to lift his feet 90 / 200 px
 * stair  (3-4) a stair of moonflower steps (rise R, run 150, 100 px wide): from stone, holding Right, a held jump each time he lands
 *        (after a reaction of 0 / 0.3 s): the time to stand on step 3; whether a tap reaches
 * beam   (3-4) a moonbeam band sweeping a wall: each flower open while lit + `hold`; the time a storey of 3 steps is open together vs the
 *        flown stair time (the margin), and the wait on stone, for the proposed Normal / Easy beams
 * quiet  (3-5) landings: drops off a rim onto floor D px below and let-go from a root, flown; how far he fell by the engine's own fall
 *        measure (heroNoise stepFall on the real p, as castPlay.ts does); the noise radius; which vines (reach 105, bud 112 px over the
 *        floor) at what distance it wakes; the same on moss (proposed soft 600); a punch (r 240); the flat-ground jumps (never loud)
 */
import '../../../src/game/headlessDom.ts';
import { RealPlay, DT } from '../../../src/game/realPlay.ts';
import { InputEngine } from '../../../src/game/inputEngine.ts';
import { setDifficulty } from '../../../src/game/difficulty.ts';
import { zoneState, DROWSY_MIN, type Zone } from '../../../src/game/zones.ts';
import { LOUD, landingNoise, bellNoise, newFall, stepFall } from '../../../src/game/heroNoise.ts';
import { NOISE } from '../../../src/game/noise.ts';
import type { Platform, Rope, Vine } from '../../../src/game/types.ts';
import { OCELOT } from '../../../src/game/predators/world3.ts';
import { newPredator, stepPredator, hear } from '../../../src/game/predators/core.ts';
import { inReach as postReach, type LurePost } from '../../../src/game/predators/lure.ts';
import type { Prey } from '../../../src/game/predators/types.ts';
import { MOVES } from '../../../src/game/fight.ts';

type Setting = 'normal' | 'easy';
const setting = (process.argv[2] ?? 'normal') as Setting;
const mode = process.argv[3] ?? 'all';
setDifficulty(setting);
const easy = setting === 'easy';

const FLOOR = 5000;
const LIP = 3000;
const solid = (id: number, x: number, y: number, width: number, height = 400): Platform => ({ id, x, y, width, height, type: 'solid' }) as Platform;
const column = (id: number, x: number, top: number, bottom: number): Vine => ({ id, x, topY: top, bottomY: bottom, swaySpeed: 0, swayPhase: 0, vineType: 'tree_climb' }) as Vine;

class Rig {
  readonly r: RealPlay;
  readonly inp = new InputEngine();
  frames = 0;
  lives = 0;
  private lift = -1;
  readonly fall = newFall();
  constructor(stage: string) {
    this.r = new RealPlay(stage, 1);
    this.inp.source = 'pad';
    this.r.e.input = this.inp;
    this.r.e.loseLife = () => {
      this.lives++;
    };
  }
  get p() {
    return this.r.p;
  }
  get e(): any {
    return this.r.e;
  }
  world(pl: Platform[], vines: Vine[] = [], ropes: Rope[] = []) {
    this.r.bare(pl.map((q) => ({ ...q })), vines.map((v) => ({ ...v })), ropes);
  }
  start(x: number, y = FLOOR, vx = 0) {
    this.r.stand(x, y);
    this.inp.clearAll();
    Object.assign(this.p, { vx, facing: 1, hanging: false });
    this.frames = 0;
    this.lift = -1;
    this.lives = 0;
    this.fall.top = null;
  }
  right(on: boolean) {
    if (on) this.inp.triggerTouchMove('right');
    else this.inp.clearAll();
  }
  jump(kind: 'tap' | 'hold') {
    this.inp.triggerTouchUp(0, kind === 'tap' ? 80 : 220);
    this.lift = kind === 'tap' ? this.frames + 2 : this.frames + 7;
  }
  /** one frame; returns how far he fell if he landed on it (the engine's own fall measure, as castPlay.ts reads it) */
  frame(): number | null {
    if (this.lift === this.frames) this.inp.releaseTouchUp();
    this.r.e.update(DT);
    this.frames++;
    return stepFall(this.fall, { y: this.p.y, grounded: this.p.grounded, holding: !!(this.p.hanging || this.p.climbing || this.p.isVineSwinging) });
  }
}

const out: string[] = [];
const say = (s: string) => {
  out.push(s);
  console.log(s);
};
const s2 = (f: number) => (f * DT).toFixed(2);

function hop() {
  const g = new Rig('3-1');
  g.world([solid(1, 0, FLOOR, 20000)]);
  for (const vx of [285, 0]) {
    g.start(LIP, FLOOR, vx);
    g.right(vx > 0);
    g.frame();
    const x0 = g.p.x;
    g.jump('tap');
    let air = 0, apex = 0;
    for (let f = 0; f < 90; f++) {
      g.frame();
      apex = Math.max(apex, FLOOR - g.p.y);
      if (!g.p.grounded) air++;
      else if (air > 0) break;
    }
    say(`hop ${setting} tap from ${vx ? 'a full run' : 'a stand'}: ${s2(air + 1)} s from the press to the ground, ${Math.round(g.p.x - x0)} px along, apex ${Math.round(apex)} px`);
  }
}

function punch() {
  const g = new Rig('3-3');
  g.world([solid(1, 0, FLOOR, 20000)]);
  g.start(LIP, FLOOR, 0);
  g.inp.triggerTouchPunch();
  let first = -1, done = -1;
  for (let f = 0; f < 30; f++) {
    g.frame();
    if (first < 0 && g.p.punching && (g.p.swingReach ?? 0) > 0) first = f;
    if (first >= 0 && !g.p.punching) {
      done = f;
      break;
    }
  }
  const jab = MOVES.jab;
  say(`punch ${setting}: the claw first reaches out ${s2(first + 1)} s after the press; the move ends at ${s2(done + 1)} s (jab startup ${jab?.startup} active ${jab?.active} recovery ${jab?.recovery})`);
}

// ------------------------------------------------------------------------------------------------- the prowler and the bell (3-3)
const X0 = 10000;
/** the bait's drop (3-3 twist): 400 px carries 360 px (LOUD.landing), so a prowler 200-300 px short of the patch hears it */
const BAIT_D = 400;
const scene = (t: number, hero: Prey) => ({ t, dt: DT, hero, easy });
const away: Prey = { x: X0 - 20000, y: FLOOR - 400, facing: 1, still: true, covered: false, moving: false };

function come() {
  for (const D of [150, 300, 450, 600, 680]) {
    // a round from X0 - 600 to X0; the ocelot at its round's far end walking away... and the bell D px from it, inside its round
    const s = newPredator(OCELOT, { x: X0 - 600, y: FLOOR, minX: X0 - 600, maxX: X0 + 200, facing: 1 });
    s.x = X0 - D;
    let t = 0;
    const r = hear(OCELOT, s, bellNoise(X0, FLOOR - 160, t));
    let arrive = -1, home = -1;
    for (let f = 0; f < 600; f++, t += DT) {
      stepPredator(OCELOT, s, scene(t, away));
      if (arrive < 0 && Math.abs(s.x - X0) <= 6) arrive = f;
      if (arrive >= 0 && !s.drawn) {
        home = f;
        break;
      }
    }
    say(`come ${setting} bell ${D} px off (${r}): under the bell in ${s2(arrive + 1)} s (hunt ${OCELOT.speed.hunt} px/s${easy ? ' x ' + OCELOT.easy.speed : ''}); looks ${s2(home - arrive)} s (hears ${OCELOT.hears}); back on its round ${s2(home + 1)} s after the ring`);
  }
  for (const W of [600, 900, 1200]) {
    // a pacing round of width W, the bell at its right end: the share of the time the ring reaches it (r 680, hearY 360)
    const s = newPredator(OCELOT, { x: X0 - W, y: FLOOR, minX: X0 - W, maxX: X0, facing: 1 });
    let n = 0, inR = 0;
    for (let t = 0; t < 60; t += DT, n++) {
      stepPredator(OCELOT, s, scene(t, away));
      if (Math.abs(s.x - X0) <= LOUD.bell.r) inR++;
    }
    say(`come ${setting}: a round ${W} px wide with the bell at one end: in hearing ${Math.round((100 * inR) / n)}% of the time; a full lap ${((2 * W) / OCELOT.speed.rest / (easy ? OCELOT.easy.speed : 1)).toFixed(1)} s`);
  }
}

/** the patch's catch: one ring (or one loud landing) with the cloud's clock at `phase`; returns seconds to the yawn, or -1 */
function catchRun(clock: { period: number; active: number }, phase: number, startX: number, dwell: number, noise: 'bell' | 'land', heroOut?: (t: number) => Prey, landAt = 40): number {
  const PATCH = X0;
  const post: LurePost = { x: PATCH, y: FLOOR, fear: 'spore', reach: 70 };
  const z: Zone = { kind: 'spore', x0: PATCH - 70, x1: PATCH + 70, top: FLOOR - 160, bottom: FLOOR, baseY: FLOOR, dir: 1, period: clock.period, warn: 1.0, active: clock.active, offset: 0, force: 0 } as Zone;
  const s = newPredator(OCELOT, { x: startX, y: FLOOR, minX: X0 - 900, maxX: X0 + (noise === 'land' ? 60 : -60), facing: 1 });
  let t = phase;
  const n = noise === 'bell' ? bellNoise(PATCH, FLOOR - 160, t) : landingNoise(PATCH + landAt, FLOOR, t, BAIT_D)!;
  hear(OCELOT, s, n);
  // (an 'alert' hunt from his landing: the round ends 60 px short of the patch, so it is the post's reach that catches it there)
  let inCloud = 0;
  for (let f = 0; f < 400; f++, t += DT) {
    const hero = heroOut ? heroOut(f * DT) : away;
    stepPredator(OCELOT, s, scene(t, hero));
    const after = s.phase === 'hunt' || s.phase === 'tell' || s.phase === 'act';
    const thick = zoneState(z, t).strength > DROWSY_MIN;
    if (after && thick && postReach(post, s.x, s.y)) inCloud += DT;
    else inCloud = 0;
    if (inCloud >= dwell) return (f + 1) * DT;
    if (s.phase === 'tell' || s.phase === 'act') return -2;
    if (!after && f > 3) return -1;
  }
  return -1;
}

function lure() {
  const dwell = 0.3;
  for (const clock of [
    { period: 6.4, active: 2.2 },
    { period: 6.4, active: 2.6 },
    { period: 7.0, active: 2.2 },
    { period: 7.2, active: 2.0 },
    { period: 8.4, active: 2.0 },
    { period: 9.6, active: 2.0 },
  ]) {
    for (const D of [200, 500]) {
      const ts: number[] = [];
      let n = 0, miss = 0;
      for (let ph = 0; ph < clock.period; ph += 0.1, n++) {
        const r = catchRun(clock, ph, X0 - D, dwell, 'bell');
        if (r < 0) miss++;
        else ts.push(r);
      }
      const mean = ts.reduce((a, b) => a + b, 0) / Math.max(1, ts.length);
      say(`lure ${setting} cloud ${clock.period}/${clock.active} (clear ${(clock.period - clock.active).toFixed(1)} s), ocelot ${D} px off, dwell ${dwell}: caught on ${Math.round((100 * (n - miss)) / n)}% of rings; ring->yawn mean ${mean.toFixed(1)} s, worst ${Math.max(...ts).toFixed(1)} s`);
    }
    // the 'ring on the warn' play: ring the moment the patch's warn glow begins (phase = idle end)
    const idle = clock.period - 1.0 - clock.active;
    const best: string[] = [];
    for (const D of [100, 300, 500]) {
      const r = catchRun(clock, idle, X0 - D, dwell, 'bell');
      best.push(`${D} px: ${r < 0 ? 'MISS' : r.toFixed(1) + ' s'}`);
    }
    say(`lure ${setting} cloud ${clock.period}/${clock.active}: rung as the warn glow starts -> ${best.join(', ')}`);
  }
}

function climb() {
  const g = new Rig('3-4');
  const V = column(7, LIP + 40, FLOOR - 900, FLOOR - 4);
  g.world([solid(1, 0, FLOOR, 20000)], [V]);
  g.start(LIP + 40, FLOOR, 0);
  g.inp.triggerTouchClimb(-1);
  let f90 = -1, f200 = -1, f400 = -1;
  for (let f = 0; f < 120; f++) {
    g.frame();
    const up = FLOOR - g.p.y;
    if (f90 < 0 && up >= 90) f90 = f;
    if (f200 < 0 && up >= 200) f200 = f;
    if (f400 < 0 && up >= 400) f400 = f;
  }
  const v = f400 > f200 && f200 >= 0 ? 200 / ((f400 - f200) * DT) : NaN;
  say(`climb ${setting}: Up at a root's foot: feet 90 px up at ${s2(f90 + 1)} s, 200 px at ${s2(f200 + 1)} s, 400 px at ${s2(f400 + 1)} s; ${Math.round(v)} px/s on the column`);
  return { f90: (f90 + 1) * DT, v };
}

function bait() {
  // flown: a loud landing from a BAIT_D px drop past the patch, a root on; Right off the rim, then Up at the root
  const g = new Rig('3-3');
  const D = BAIT_D;
  const V = column(7, LIP + 220, FLOOR + D - 300, FLOOR + D - 4);
  g.world([solid(1, 0, FLOOR, LIP), solid(2, LIP - 300, FLOOR + D, 3000)], [V]);
  g.start(LIP - 20, FLOOR, 0);
  g.right(true);
  let land = -1, fell = 0, out = -1;
  for (let f = 0; f < 200; f++) {
    const fl = g.frame();
    if (fl !== null && land < 0) {
      land = f;
      fell = fl;
    }
    if (land >= 0 && Math.abs(g.p.x - V.x) < 20) {
      g.inp.clearAll();
      g.inp.triggerTouchClimb(-1);
    }
    if (land >= 0 && FLOOR + D - g.p.y > OCELOT.sight.tall + 10) {
      out = f;
      break;
    }
  }
  const n = landingNoise(0, 0, 0, fell);
  const outS = (out - land) * DT;
  say(`bait ${setting}: a ${D} px drop lands ${Math.round(fell)} px of fall (noise ${n ? Math.round(n.r) + ' px' : 'none'}); landing -> feet over its sight (tall ${OCELOT.sight.tall}) ${outS.toFixed(2)} s (walk ${Math.round(V.x - LIP)} px from the rim side + climb)`);
  // the kit: the ocelot hunts to his landing; he is seen until he is out (modelled from the flown time), then lost; does the cloud take it
  for (const clock of [{ period: 6.4, active: 2.2 }, { period: 6.4, active: 2.6 }, { period: 7.0, active: 2.2 }]) {
    for (const [Dk, at] of [[200, 120], [200, 140], [300, 120], [300, 140], [450, 120]]) {
      let n2 = 0, caught = 0, seen = 0;
      const ts: number[] = [];
      for (let ph = 0; ph < clock.period; ph += 0.1, n2++) {
        const heroAt = (t: number): Prey => ({ x: X0 + at, y: FLOOR - (t < outS ? 0 : 200), facing: -1, still: false, covered: false, moving: true });
        const r = catchRun(clock, ph, X0 - Dk, 0.3, 'land', heroAt, at);
        if (r === -2) seen++;
        else if (r > 0) {
          caught++;
          ts.push(r);
        }
      }
      say(`bait ${setting} cloud ${clock.period}/${clock.active}, ocelot ${Dk} px off, he lands ${at} px past the patch's middle: caught ${Math.round((100 * caught) / n2)}% of landing phases, tell on him ${Math.round((100 * seen) / n2)}%; landing->yawn worst ${ts.length ? Math.max(...ts).toFixed(1) : '-'} s`);
    }
  }
  // the good play: land as the warn glow starts
  for (const Dk of [200, 450]) {
    const clock = { period: 6.4, active: 2.2 };
    const heroAt = (t: number): Prey => ({ x: X0 + 120, y: FLOOR - (t < outS ? 0 : 200), facing: -1, still: false, covered: false, moving: true });
    const r = catchRun(clock, clock.period - 1 - clock.active, X0 - Dk, 0.3, 'land', heroAt, 120);
    say(`bait ${setting} landed (120 px past) as the warn starts, ocelot ${Dk} px off: ${r > 0 ? 'caught at ' + r.toFixed(1) + ' s' : r === -2 ? 'TELL on him' : 'MISS'}`);
  }
}

// ------------------------------------------------------------------------------------------------- the moonflower stair (3-4)
function stair() {
  // a held jump on flat ground first: its top and air time (a moonflower step must be under its top with margin)
  {
    const g = new Rig('3-4');
    g.world([solid(1, 0, FLOOR, 20000)]);
    g.start(LIP, FLOOR, 0);
    g.jump('hold');
    let apex = 0, air = 0;
    for (let f = 0; f < 90; f++) {
      g.frame();
      apex = Math.max(apex, FLOOR - g.p.y);
      if (!g.p.grounded) air++;
      else if (air > 0) break;
    }
    say(`stair ${setting}: a held jump (the Pad held 220 ms) tops out ${Math.round(apex)} px, ${s2(air + 1)} s from the press to the ground`);
  }
  // the stair: steps 120 px wide, each 140 px on and R px up; he stands, presses Jump and holds Right in the air, lets go of Right as he
  // lands (as a thumb does on a narrow step), waits `react`, goes again
  const res: Record<string, number> = {};
  for (const [R, ON] of [[80, 140], [100, 140], [100, 120], [120, 120], [140, 120]]) {
    for (const react of [0.1, 0.3, 0.5]) {
      const g = new Rig('3-4');
      const steps = [1, 2, 3].map((k) => solid(10 + k, LIP + k * ON, FLOOR - k * R, 120, 30));
      g.world([solid(1, 0, FLOOR, LIP + 120), ...steps]);
      g.start(LIP + 40, FLOOR, 0);
      // on a step: walk Right to 25 px short of its edge, stop, wait `react`, then Jump (held) with Right held until he lands
      let onStep = 0, wait = -1, f = 0, air = false, miss = 0, edge = LIP + 120;
      for (; f < 400; f++) {
        if (!air && g.p.grounded) {
          if (wait < 0 && g.p.x < edge - 25 - 20) g.right(true);
          else if (wait < 0) {
            g.right(false);
            wait = Math.round(react / DT);
          } else if (wait-- === 0) {
            g.right(true);
            g.jump('hold');
            air = true;
          }
        }
        g.frame();
        if (air && g.p.grounded && Math.abs(g.p.vy) < 1 && !g.p.climbing) {
          const st = steps.findIndex((q) => Math.abs(g.p.y - q.y) < 3);
          if (process.env.TRACE) say(`  landed f${f} x ${Math.round(g.p.x - LIP)} y ${Math.round(FLOOR - g.p.y)} step ${st + 1}`);
          air = false;
          wait = -1;
          if (st + 1 > onStep) onStep = st + 1;
          else miss++;
          if (onStep === 3 || miss > 2) break;
          edge = st >= 0 ? steps[st].x + steps[st].width : LIP + 120;
        }
      }
      res[`${R}/${ON}/${react}`] = onStep === 3 ? (f + 1) * DT : -1;
      say(`stair ${setting} rise ${R} on ${ON} (steps 120 wide): walk to the edge, ${react} s, held jump: ${onStep === 3 ? 'on step 3 at ' + s2(f + 1) + ' s' : 'reached step ' + onStep + ' only'}${miss ? ', ' + miss + ' miss(es)' : ''}`);
    }
  }
  return res;
}

/**
 * beam (flown): one storey of the moon wall in the real engine: stone at the foot (FLOOR), three moonflower steps (rise 100, on 120, 120
 * wide: the stair flown above), stone at the top (rise 400). The band arrives at t = 0: the flowers open over OPEN s (solid from the
 * moment they are open), stay open while it rests (`rest`), then droop (`droop`, the warning) and close: a closed flower is taken out
 * of the world (he falls through). He sees the bloom, waits `see`, then climbs as the stair flight does (walk to the edge, `react`,
 * held jump). Reports: on the top stone or where he fell, and the time to spare (close - the moment he left the last flower).
 */
const OPEN = 0.4;
function beamFly(rest: number, droop: number, see: number, react: number, rise = 0, H = 300, N = 3): string {
  const g = new Rig('3-4');
  const R = 100, ON = 120;
  const flowers = Array.from({ length: N }, (_, i) => solid(21 + i, LIP + (i + 1) * ON, FLOOR - (i + 1) * R, 120, 30));
  const top = solid(60, LIP + (N + 1) * ON, FLOOR - (N + 1) * R, 400, 30);
  g.world([solid(1, 0, FLOOR, LIP + 120), ...flowers, top]);
  const live = g.e.platforms as Platform[];
  const fl = live.filter((q) => q.id >= 21 && q.id < 21 + N);
  const homeY = fl.map((q) => q.y);
  const close = OPEN + rest + droop;
  // (rise > 0: the twist: the band climbs the wall at `rise` px/s from t = 0, H px tall; a flower opens as the band's top reaches it and
  // closes `droop` s after the band's foot passes it)
  const openAt = (i: number, t: number): boolean => {
    if (!rise) return t >= OPEN && t < close;
    const h = FLOOR - homeY[i];
    const top = H + rise * t, foot = rise * t;
    const lit = h <= top && h >= foot;
    const passed = h < foot && (foot - h) / rise < droop;
    return t >= OPEN && (lit || passed);
  };
  const setOpen = (t: number) => fl.forEach((q, i) => (q.y = openAt(i, t) ? homeY[i] : homeY[i] + 100000));
  setOpen(0);
  g.start(LIP + 40, FLOOR, 0);
  let wait = Math.round((OPEN + see) / DT) - 1, f = 0, air = false, edge = LIP + 120, left = -1, onTop = -1, spare = Infinity;
  const closeOf = (i: number) => (rise ? (FLOOR - homeY[i]) / rise + droop : close);
  for (; f < 400; f++) {
    const t = f * DT;
    setOpen(t);
    if (!air && g.p.grounded && onTop < 0) {
      if (wait < 0 && g.p.x < edge - 45) g.right(true);
      else if (wait < 0) {
        g.right(false);
        wait = Math.round(react / DT);
      } else if (wait <= 0) {
        // (a player sees the next flower: he jumps only once it is open)
        const cur = fl.findIndex((q) => Math.abs(g.p.y - q.y) < 3);
        const nextOpen = cur + 1 >= N || openAt(cur + 1, t);
        if (nextOpen) {
          g.right(true);
          g.jump('hold');
          air = true;
          if (cur >= 0) spare = Math.min(spare, closeOf(cur) - t);
          if (cur === N - 1) left = t;
        }
      } else wait--;
    }
    g.frame();
    if (air && g.p.grounded && Math.abs(g.p.vy) < 1) {
      air = false;
      wait = -1;
      const st = fl.findIndex((q) => Math.abs(g.p.y - q.y) < 3);
      if (Math.abs(g.p.y - top.y) < 3) {
        onTop = f;
        break;
      }
      if (st < 0) return `FELL to ${Math.round(FLOOR - g.p.y)} px at ${s2(f + 1)} s (flowers closed at ${close.toFixed(1)} s)`;
      edge = fl[st].x + fl[st].width;
    }
    if (!g.p.grounded && !air) return `FELL off a closing flower at ${s2(f + 1)} s (closed at ${close.toFixed(1)} s)`;
  }
  return onTop >= 0 ? `on the top stone at ${s2(onTop + 1)} s; left the last flower at ${left.toFixed(2)} s; the least time to spare on any flower ${spare.toFixed(2)} s (lives lost ${g.lives})` : 'never reached the top';
}

function beam() {
  for (const [name, B] of [
    ['Normal', { rest: 3.6, droop: 1.0 }],
    ['Easy', { rest: 4.8, droop: 1.6 }],
  ] as const) {
    for (const [see, react] of [[0.3, 0.1], [0.5, 0.3], [0.8, 0.5], [1.2, 0.5]]) {
      say(`beam ${setting} ${name} storey (open ${OPEN} + rest ${B.rest} + droop ${B.droop} = ${(OPEN + B.rest + B.droop).toFixed(1)} s): sees it ${see} s after the bloom, ${react} s on each step -> ${beamFly(B.rest, B.droop, see, react)}`);
    }
  }
  // the plant: a player who waits too long falls when the flowers close (the closing is real ground going away)
  say(`beam ${setting} plant: sees it 3.0 s after the bloom, 0.5 s a step, Normal -> ${beamFly(3.6, 1.0, 3.0, 0.5)}`);
  // the twist: the moon rises; the lit band climbs the wall (6 flowers, rise 100 each), he keeps up
  for (const [name, v, H, droop] of [['Normal', 70, 300, 1.0], ['Normal', 90, 300, 1.0], ['Easy', 55, 400, 1.6], ['Easy', 70, 400, 1.6]] as const) {
    for (const [see, react] of [[0.3, 0.1], [0.5, 0.3], [0.8, 0.5]]) {
      say(`beam ${setting} RISING ${name} band ${H} px climbing ${v} px/s, droop ${droop} (6 flowers): sees ${see} s, ${react} s a step -> ${beamFly(0, droop, see, react, v, H, 6)}`);
    }
  }
}

// ------------------------------------------------------------------------------------------------- the quiet way (3-5)
const VINE_REACH = 105;
function quiet() {
  const g = new Rig('3-5');
  const MOSS_SOFT = 600;
  for (const D of [160, 200, 240, 300, 400, 500, 600]) {
    g.world([solid(1, 0, FLOOR, LIP), solid(2, LIP - 300, FLOOR + D, 3000)]);
    g.start(LIP - 20, FLOOR, 0);
    g.right(true);
    let fell: number | null = null, landX = 0;
    for (let f = 0; f < 200 && fell === null; f++) {
      fell = g.frame();
      landX = g.p.x;
    }
    const n = landingNoise(landX, FLOOR + D, 0, fell ?? 0);
    const r = n ? n.r : 0;
    // a vine reaches 105 px either side; it is woken when its x is within r of the landing (and within hearY 360 up or down): the
    // nearest vine he can stand clear of (out of its reach) and still not wake is r px off; the safe stand-off band is (105, r]
    const wakes = n ? `wakes a sleeper up to ${Math.round(r)} px off (vines out of reach at 105-${Math.round(r)} px wake but can't lash)` : 'silent';
    const moss = (fell ?? 0) <= MOSS_SOFT ? 'on moss: silent' : `on moss: ${Math.round(Math.min(LOUD.landing.max, LOUD.landing.min + ((fell ?? 0) - MOSS_SOFT) * LOUD.landing.perPx))} px`;
    say(`quiet ${setting} drop D=${D}: fell ${Math.round(fell ?? 0)} px by the engine's measure; ${wakes}; ${moss}`);
  }
  // let-go from a root: holding resets the fall at his grip, so the fall is from where he let go
  for (const H of [190, 230, 250, 290, 300]) {
    const rp: Rope = { id: 9, x0: LIP - 600, x1: LIP + 1400, y: FLOOR - H, g0: FLOOR, g1: FLOOR, required: false };
    g.world([solid(1, 0, FLOOR, 20000)], [], [rp]);
    g.e.skills?.add?.('shimmy');
    g.start(LIP, FLOOR, 0);
    g.r.hang(rp, LIP, FLOOR - H);
    g.fall.top = null;
    g.inp.clearAll();
    for (let k = 0; k < 6; k++) g.frame();
    g.inp.triggerTouchClimb(1);
    let fell: number | null = null;
    for (let f = 0; f < 60 && fell === null; f++) fell = g.frame();
    const n = landingNoise(0, 0, 0, fell ?? 0);
    say(`quiet ${setting} let go of a root ${H} px up: fell ${Math.round(fell ?? 0)} px (his hanging feet that high); ${n ? 'LOUD ' + Math.round(n.r) + ' px' : 'silent'}; hanging over a vine whose bud is 112 px up he is ${(fell ?? 0) > 112 ? 'ABOVE the bud: out of its reach' : 'below the bud: IN its reach (lashed if he creeps while it looks)'}`);
  }
  // the flat-ground jumps: a tap, a held, a double: never loud (heroNoise.test holds soft 200 over the double's rise)
  for (const how of ['tap', 'hold', 'double'] as const) {
    g.world([solid(1, 0, FLOOR, 20000)]);
    g.start(LIP, FLOOR, 0);
    g.jump(how === 'tap' ? 'tap' : 'hold');
    let fell: number | null = null;
    for (let f = 0; f < 90 && fell === null; f++) {
      if (how === 'double' && f === 10) {
        g.inp.releaseTouchUp();
        g.frame();
        g.jump('hold');
      }
      fell = g.frame();
    }
    say(`quiet ${setting} a ${how} jump on flat ground: fell ${Math.round(fell ?? 0)} px; ${landingNoise(0, 0, 0, fell ?? 0) ? 'LOUD' : 'silent'}`);
  }
  // the freeze: from a full run, Right let go: when he counts as still for a vine (grounded, |vx| < VINE.still 25)
  {
    g.world([solid(1, 0, FLOOR, 20000)]);
    g.start(LIP, FLOOR, 285);
    g.right(true);
    for (let k = 0; k < 20; k++) g.frame();
    const x0 = g.p.x;
    g.right(false);
    let k = 0;
    for (; k < 30 && !(g.p.grounded && Math.abs(g.p.vx) < 25); k++) g.frame();
    say(`quiet ${setting} the freeze: from a full run he is still for a vine ${s2(k + 1)} s after letting go (slides ${Math.round(g.p.x - x0)} px)`);
  }
  // walking past a vine: from a stand d px short of its middle, Right held, until he is out of its reach on the far side (reach 105 +
  // his half-width 25)
  for (const d of [150, 250, 350]) {
    g.world([solid(1, 0, FLOOR, 20000)]);
    g.start(LIP - d, FLOOR, 0);
    g.right(true);
    let k = 0, enter = -1;
    for (; k < 120 && g.p.x < LIP + VINE_REACH + 25; k++) {
      g.frame();
      if (enter < 0 && g.p.x > LIP - VINE_REACH - 25) enter = k;
    }
    say(`quiet ${setting} walk past a vine from a stand ${d} px short of it: in its reach at ${s2(enter + 1)} s, out the far side at ${s2(k + 1)} s (${s2(k - enter)} s inside)`);
  }
  // the twist's pair: two vines 220 px apart; from a stand 230 px short of the first until out of the second's reach; and a drop of D onto
  // that stand: when he is still after landing (the look is safe only once he is)
  {
    g.world([solid(1, 0, FLOOR, 20000)]);
    g.start(LIP - 230, FLOOR, 0);
    g.right(true);
    let k = 0;
    for (; k < 150 && g.p.x < LIP + 220 + VINE_REACH + 25; k++) g.frame();
    say(`quiet ${setting} walk past a PAIR (220 px apart) from a stand 230 px short of the first: out of the second's reach at ${s2(k + 1)} s`);
    for (const D of [400, 500]) {
      g.world([solid(1, 0, FLOOR, LIP - 400), solid(2, LIP - 500, FLOOR + D, 3000)]);
      g.start(LIP - 420, FLOOR, 0);
      g.right(true);
      let fell: number | null = null, j = 0;
      for (; j < 200 && fell === null; j++) fell = g.frame();
      g.right(false);
      let still = 0;
      for (; still < 30 && !(g.p.grounded && Math.abs(g.p.vx) < 25); still++) g.frame();
      say(`quiet ${setting} the twist's drop D=${D} (walked off, Right let go on landing): lands ${Math.round(g.p.x - (LIP - 400))} px past the rim, noise ${Math.round(landingNoise(0, 0, 0, fell ?? 0)?.r ?? 0)} px, still ${s2(still)} s after landing`);
    }
  }
  say(`quiet: LOUD ${JSON.stringify(LOUD)}; NOISE.hearY ${NOISE.hearY}; the vines' reach ${VINE_REACH} (protoStage 3-5 :2493), stir 1.1, look 1.7`);
}

/**
 * twist (3-5): a PAIR of light sleepers (thornVine.ts vinePhase: sleep 1.0, stir 1.1, look 1.7; the second 1.9 s behind), 220 px apart,
 * reach 105 (below 140); his walk is FLOWN (the engine's x per frame from a stand 230 px short of the first, Right held). Lashed = in a
 * looking vine's reach while moving (vineSees). (a) today's rhythm: a walk started at every 0.1 s of the cycle; (b) the twist: a loud
 * landing wakes both at t0 (stir 1.1, look 1.7, then a DEEP sleep `deep` s: the rule ENG-VINE's 3-5 data builds); he starts walking
 * `go` s after the look ends
 */
function twist() {
  const g = new Rig('3-5');
  g.world([solid(1, 0, FLOOR, 20000)]);
  g.start(LIP - 230, FLOOR, 0);
  g.right(true);
  const xs: number[] = [];
  for (let k = 0; k < 150 && g.p.x < LIP + 220 + VINE_REACH + 25; k++) {
    g.frame();
    xs.push(g.p.x);
  }
  const vines = [LIP, LIP + 220];
  const rhythm = { sleep: 1.0, stir: 1.1, look: 1.7 };
  const P = rhythm.sleep + rhythm.stir + rhythm.look;
  const lookingAt = (i: number, t: number) => {
    const c = (((t + i * 1.9) % P) + P) % P;
    return c >= rhythm.sleep + rhythm.stir;
  };
  const lashed = (start: number, looking: (i: number, t: number) => boolean) =>
    xs.some((x, k) => vines.some((vx, i) => Math.abs(x - vx) < VINE_REACH && looking(i, start + (k + 1) * DT)));
  let pass = 0, n = 0;
  for (let t0 = 0; t0 < P; t0 += 0.1, n++) if (!lashed(t0, lookingAt)) pass++;
  say(`twist ${setting}: the pair on its own rhythm (sleep ${rhythm.sleep}, stir ${rhythm.stir}, look ${rhythm.look}, 1.9 s apart): a walk past both (flown, ${s2(xs.length)} s) started at any of ${n} moments passes ${pass} (${Math.round((100 * pass) / n)}%)`);
  for (const deep of [0, 2.5, 4.0]) {
    for (const go of [0, 0.5, 1.5]) {
      // woken together at 0: stir to 1.1, look to 2.8, deep sleep to 2.8 + deep, then the rhythm again from its start
      const woke = (_i: number, t: number) => (t >= 1.1 && t < 2.8) || (t >= 2.8 + deep && lookingAt(0, t - 2.8 - deep));
      const start = 2.8 + go;
      const ok = !lashed(start, woke);
      say(`twist ${setting}: woken by his landing, deep sleep ${deep} s, he walks ${go} s after the look ends: ${ok ? 'PASSES' : 'LASHED'} (out of reach at ${(start + xs.length * DT).toFixed(2)} s; the deep sleep ends at ${(2.8 + deep).toFixed(1)} s)`);
    }
  }
}

const MODES: Record<string, () => unknown> = { hop, punch, come, lure, bait, climb, stair, beam, quiet, twist };
for (const [k, fn] of Object.entries(MODES)) if (mode === 'all' || mode === k) fn();
