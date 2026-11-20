/**
 * w3flight39 — 3-6, 3-7, 3-8, 3-9 and the hidden stage's numbers, flown in the real engine at 30 fps through the game's own InputEngine
 * (level.md rule 24; DESIGN-36-39). Designer sim; nothing in the game imports it. Same rig as w3flight.ts (DESIGN-31-32).
 *
 *   npx tsx reference/specs/sims/w3flight39.ts <normal|easy> <hop|cap|quiet|sleeper|bait|raft|rock|all>
 *
 * hop      the rig's check: a tapped hop reads 0.43 s / 106-119 px (w3flight.ts, R-165.284)
 * cap      3-6: the glow cap (puzzleKit ITEM.mushroom, light 230) in a real KitPlay room on the real engine: pick it up (a tap), the carried
 *          light's middle and reach, the carry walk speed, what a Jump press does while carrying (THROW.up), what a kick does (THROW.fwd),
 *          from a stand and from a walk, onto the flat, a shelf 120 above and a floor 160 below: where it rests, how long it flies; the
 *          lamp's glowworm wake reach (r + 40)
 * quiet    3-7: the pad has no walk-slowly (eaglet.ts:5): the run's ramp from a stand (speed by time), the slide after letting go, the
 *          carry walk, a pulsed press (on/off), and how long each keeps him under a speed line while passing a fern
 * sleeper  3-8: a World 3 liana on the engine's own swing clock (physics.ts TIMED): the swing period read off the engine, and for a let-go
 *          (Jump) pressed at every frame of one swing, whether he lands on a far shelf G px on (the sweet window, its length), and the air
 *          time; from that the shortest stir (the eye-crack tell) that always holds a sweet spot
 * bait     3-9: the kit's own ocelot (predators/world3.ts, core.ts hear + stepPredator) pacing; a lure (the kit's thrown-noise branch,
 *          the one ENG-WAYS extends to a lying lit cap) lands d px off: is it drawn, how long to get there, how long it looks, whether a
 *          Pokey walking by behind it is noticed; and the 'light' way (beatenBy.light: flees 6 s) for comparison
 * raft     hidden: Pokey standing on a drifting raft (a World 2 drift log, river.ts, carried by engine.ts:1858-1884) under a dark roof of
 *          sleeping glowworms: does riding count as still (glowStill), when do lights wake, how many seconds ahead of him a light is lit
 *          (fully) at each raft speed, and what a bounded reach would give
 */
import '../../../src/game/headlessDom.ts';
import { RealPlay, DT } from '../../../src/game/realPlay.ts';
import { InputEngine } from '../../../src/game/inputEngine.ts';
import { setDifficulty } from '../../../src/game/difficulty.ts';
import { GLOW_STILL, GLOW_REACH, type Zone } from '../../../src/game/zones.ts';
import { KitPlay } from '../../../src/game/puzzlePlay.ts';
import { ITEM, KIT, THROW, type KitExtras } from '../../../src/game/puzzleKit.ts';
import { PHYS, TIMED } from '../../../src/game/physics.ts';
import type { Platform, Vine } from '../../../src/game/types.ts';
import { OCELOT } from '../../../src/game/predators/world3.ts';
import { hear, newPredator, stepPredator } from '../../../src/game/predators/core.ts';
import type { Prey } from '../../../src/game/predators/types.ts';
import { NOISE } from '../../../src/game/noise.ts';

type Setting = 'normal' | 'easy';
const setting = (process.argv[2] ?? 'normal') as Setting;
const mode = process.argv[3] ?? 'all';
setDifficulty(setting);
const easy = setting === 'easy';

const FLOOR = 5000;
const LIP = 3000;
const W = 20000;
const solid = (id: number, x: number, y: number, width: number, height = 400): Platform => ({ id, x, y, width, height, type: 'solid' }) as Platform;

class Rig {
  readonly r: RealPlay;
  readonly inp = new InputEngine();
  frames = 0;
  lives = 0;
  private lift = -1;
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
  world(pl: Platform[], vines: Vine[] = [], zones: Zone[] = []) {
    this.r.bare(pl.map((q) => ({ ...q })), vines);
    this.e.currentStage.zones = zones;
    this.e.glowWake.clear();
    this.e.glowStill = 0;
    this.e.kit = null;
  }
  start(x: number, y = FLOOR, vx = 0) {
    this.r.stand(x, y);
    this.inp.clearAll();
    Object.assign(this.p, { vx, facing: 1, hanging: false });
    this.frames = 0;
    this.lift = -1;
    this.lives = 0;
  }
  right(on: boolean) {
    if (on) this.inp.triggerTouchMove('right');
    else this.inp.triggerTouchMove('none');
  }
  /** a tapped Jump (the Pad's button for 66 ms: the input keeps it 80 ms) or a held one */
  jump(kind: 'tap' | 'hold') {
    this.inp.triggerTouchUp(0, kind === 'tap' ? 80 : 220);
    this.lift = kind === 'tap' ? this.frames + 2 : -1;
  }
  frame() {
    if (this.lift === this.frames) this.inp.releaseTouchUp();
    this.r.e.update(DT);
    this.frames++;
  }
}

const say = (s: string) => console.log(s);
const s2 = (f: number) => (f * DT).toFixed(2);
const r0 = (n: number) => Math.round(n);

function hop() {
  const g = new Rig('3-1');
  g.world([solid(1, 0, FLOOR, W)]);
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
    say(`hop ${setting} tap from ${vx ? 'a full run' : 'a stand'}: ${s2(air)} s in the air, ${r0(g.p.x - x0)} px along, apex ${r0(apex)} px`);
  }
}

// ───────────────────────────── 3-6: the glow cap ─────────────────────────────

/** a real KitPlay room on the bare world: one glow-cap patch (its source) and the cap lying at `capX` on platform 1 */
function capRoom(g: Rig, capX: number, extra: Platform[] = []) {
  const pl = [solid(1, 0, FLOOR, W), ...extra];
  g.world(pl);
  const at = (x: number) => ({ on: 1, at: x / W });
  const kit: KitExtras = {
    rooms: [
      {
        id: 'cap',
        left: at(LIP - 1500), right: at(LIP + 3000), above: 1600, below: 1600,
        pieces: [
          { kind: 'source', id: 'patch', variant: 'mushroom', at: at(capX - 200), look: 'pile' },
          { kind: 'item', id: 'cap1', variant: 'mushroom', source: 'patch', at: at(capX) },
        ],
        exit: 'patch',
        beyond: at(LIP + 2900),
        ground: pl.map((q) => q.id),
      },
    ],
  };
  g.e.currentStage.kit = kit;
  g.e.kit = new KitPlay(kit, g.e.platforms, { zones: [], rivers: [], collectibles: [], world: 3, stage: 6, vines: [] });
}

/** stand at the cap and tap: the frames until he holds it */
function pickUp(g: Rig): number {
  g.inp.triggerTouchPunch(0);
  for (let f = 0; f < 30; f++) {
    g.frame();
    if (g.e.kit.holding) return f + 1;
  }
  return -1;
}

/** follow the cap's light until it rests (not flying): where, when, its top */
function follow(g: Rig, x0: number, y0: number, steer = false) {
  let f = 0, apex = 0, flying = false, restF = -1;
  const lit = () => g.e.kit.lights()[0] as { x: number; y: number; r: number } | undefined;
  for (; f < 120; f++) {
    g.frame();
    if (steer) g.right(true);
    const it = g.e.kit.rooms[0].items[0];
    if (it.mode === 'fly') flying = true;
    const L = lit();
    if (L) apex = Math.max(apex, y0 - L.y);
    if (flying && it.mode !== 'fly') {
      restF = f + 1;
      break;
    }
  }
  const it = g.e.kit.rooms[0].items[0];
  return { t: restF, x: it.x - x0, y: it.y, mode: it.mode, apex, held: g.e.kit.holding, grounded: g.p.grounded, feetUp: FLOOR - g.p.y };
}

function cap() {
  const g = new Rig('3-1');
  // pick up, carried light, carry speed
  capRoom(g, LIP);
  g.start(LIP - 30);
  const pf = pickUp(g);
  for (let k = 0; k < 6; k++) g.frame();
  const L = g.e.kit.lights()[0];
  say(`cap ${setting}: a tap at the cap picks it up in ${s2(pf)} s; carried, its light's middle is ${r0(L.x - g.p.x)} px ahead of his middle and ${r0(FLOOR - L.y)} px over his feet, radius ${L.r} (ITEM.mushroom.light ${ITEM.mushroom.light}): it lights the floor from ${r0(L.x - g.p.x - Math.sqrt(L.r * L.r - (FLOOR - L.y) ** 2))} to ${r0(L.x - g.p.x + Math.sqrt(L.r * L.r - (FLOOR - L.y) ** 2))} px of his middle, a shelf top 120 px up out to ${r0(L.x - g.p.x + Math.sqrt(L.r * L.r - (FLOOR - 120 - L.y) ** 2))} px, a floor 160 px down out to ${r0(L.x - g.p.x + Math.sqrt(Math.max(0, L.r * L.r - (FLOOR + 160 - L.y) ** 2)))} px`);
  const x0 = g.p.x;
  g.right(true);
  for (let k = 0; k < 60; k++) g.frame();
  say(`cap ${setting}: carrying, a held Right walks ${r0((g.p.x - x0) / (60 * DT))} px/s (KIT.carrySpeed ${KIT.carrySpeed} x run ${PHYS.maxRun} = ${r0(KIT.carrySpeed * PHYS.maxRun)})`);
  // a Jump press while carrying, a kick while carrying: from a stand, and walking
  const cases: Array<{ name: string; press: 'jump' | 'kick'; walk: boolean; extra: Platform[] }> = [
    { name: 'Jump (tap) at a stand, flat', press: 'jump', walk: false, extra: [] },
    { name: 'Jump (tap) walking, flat', press: 'jump', walk: true, extra: [] },
    { name: 'kick at a stand, flat', press: 'kick', walk: false, extra: [] },
    { name: 'kick walking, flat', press: 'kick', walk: true, extra: [] },
    { name: 'kick at a stand, a shelf 120 up from +150', press: 'kick', walk: false, extra: [solid(2, LIP + 150, FLOOR - 120, 400, 120)] },
    { name: 'Jump at a stand, a shelf 200 up from +40', press: 'jump', walk: false, extra: [solid(2, LIP + 40, FLOOR - 200, 300, 40)] },
  ];
  for (const c of cases) {
    capRoom(g, LIP - 400, c.extra);
    g.start(LIP - 430);
    pickUp(g);
    for (let k = 0; k < 6; k++) g.frame();
    if (c.walk) {
      g.right(true);
      for (let k = 0; k < 20; k++) g.frame();
    } else {
      // walk to the throw spot
      g.right(true);
      for (let k = 0; k < 200 && g.p.x < LIP; k++) g.frame();
      g.right(false);
      for (let k = 0; k < 10; k++) g.frame();
    }
    const xs = g.p.x;
    const vxs = g.p.vx;
    if (c.press === 'jump') g.jump('tap');
    else g.inp.triggerTouchKick(1);
    const o = follow(g, xs, FLOOR, c.walk);
    say(`cap ${setting} ${c.name} (${r0(vxs)} px/s): ${o.t > 0 ? `rests after ${s2(o.t)} s, ${r0(o.x)} px ahead of where he threw it, its foot ${r0(FLOOR - o.y)} px over the floor (${o.mode})` : `still flying after 4 s (${o.mode})`}; apex ${r0(o.apex)} px; he jumped: ${o.feetUp > 2 || !o.grounded ? 'YES' : 'no'}; still holding: ${o.held}`);
  }
  // closed-form check: THROW.fwd / THROW.up from the hands (handX 14, handY 70)
  for (const k of ['fwd', 'up'] as const) {
    const v = THROW[k];
    const tFlat = (-v.vy + Math.sqrt(v.vy * v.vy + 2 * THROW.gravity * (THROW.handY - ITEM.mushroom.r))) / THROW.gravity;
    say(`cap closed-form THROW.${k} (vx ${v.vx}, vy ${v.vy}, g ${THROW.gravity}): lands on the flat ${r0(THROW.handX + v.vx * tFlat)} px ahead (thrown at a stand) in ${tFlat.toFixed(2)} s, apex ${r0(THROW.handY + (v.vy * v.vy) / (2 * THROW.gravity))} px over his feet`);
  }
  // the lamp wakes glowworms within r + 40 (engine.ts stepGlowworms): sleeping lights 250, 270, 300 px ahead of the carried light at its height
  capRoom(g, LIP);
  g.start(LIP - 30);
  pickUp(g);
  for (let k = 0; k < 3; k++) g.frame();
  const Lc = g.e.kit.lights()[0];
  const lights = [250, 270, 300, 420].map((d, i) => ({ x: Lc.x + d, y: Lc.y, r: 170, sleep: true, id: 10 + i }));
  g.e.currentStage.zones = [{ kind: 'dark', x0: 0, x1: W, top: FLOOR - 2000, bottom: FLOOR + 2000, baseY: FLOOR, dir: 1, period: 1, warn: 0, active: 0, offset: 0, force: 0, lights } as Zone];
  g.e.glowWake.clear();
  for (let k = 0; k < 4; k++) g.frame();
  say(`cap ${setting}: the carried lamp wakes sleeping glowworms ${[250, 270, 300, 420].map((d, i) => `${d} px off: ${g.e.glowWake.has(10 + i) ? 'woke' : 'asleep'}`).join(', ')} (rule: within light + 40 = ${ITEM.mushroom.light! + 40})`);
}

// ───────────────────────────── 3-7: quiet ─────────────────────────────

function quiet() {
  const g = new Rig('3-1');
  g.world([solid(1, 0, FLOOR, W)]);
  g.start(LIP);
  g.right(true);
  const marks: string[] = [];
  let x0 = g.p.x;
  for (let f = 1; f <= 30; f++) {
    g.frame();
    if ([1, 2, 3, 4, 6, 9, 15, 30].includes(f)) marks.push(`${s2(f)} s: ${r0(Math.abs(g.p.vx))} px/s, ${r0(g.p.x - x0)} px`);
  }
  say(`quiet ${setting}: the run's ramp from a stand (Right held): ${marks.join('; ')} (PHYS.maxRun ${PHYS.maxRun})`);
  x0 = g.p.x;
  g.right(false);
  let f = 0;
  for (; f < 60 && Math.abs(g.p.vx) > 1; f++) g.frame();
  say(`quiet ${setting}: let go at full run: stops in ${s2(f)} s, slides ${r0(g.p.x - x0)} px`);
  // pulsed presses: on n frames, off m frames, for 6 s
  for (const [on, off] of [[3, 3], [4, 4], [2, 4], [6, 6]] as const) {
    g.start(LIP);
    let under = 0, n = 0;
    const xs = g.p.x;
    for (let k = 0; k < 180; k++) {
      g.right(k % (on + off) < on);
      g.frame();
      n++;
      if (Math.abs(g.p.vx) <= 160) under++;
    }
    say(`quiet ${setting}: pulsed Right ${on} frames on / ${off} off: averages ${r0((g.p.x - xs) / (180 * DT))} px/s; under 160 px/s ${Math.round((100 * under) / n)}% of frames`);
  }
}

// ───────────────────────────── 3-8: the sleeper ─────────────────────────────

function sleeper() {
  const g = new Rig('1-6');
  const LEN = 260;
  const VX = LIP + 200;
  const v: Vine = { id: 7, x: VX, topY: FLOOR - 560, bottomY: FLOOR - 560 + LEN + 40, swaySpeed: 0, swayPhase: 0, vineType: 'swing_liana' } as Vine;
  // the engine's own period: the vine's swing clock from angle 0 (moving right) to the next same crossing
  for (const G of [260, 340, 420]) {
    let first = -1, last = -1, good = 0, airMin = 99, airMax = 0;
    const per = Math.round(TIMED.period / DT);
    const row: string[] = [];
    for (let k = 0; k < per; k++) {
      const far = solid(3, VX + G, FLOOR - 200, 600);
      g.world([solid(1, 0, FLOOR, LIP), far, solid(9, LIP, FLOOR + 900, 4000)], [{ ...v }]);
      g.start(LIP - 100);
      g.r.swing(g.e.vines[0], { angle: 0, omega: 1, len: LEN, t: k * DT });
      g.inp.clearAll();
      g.jump('tap');
      let air = 0, land = '';
      for (let f = 0; f < 90; f++) {
        g.frame();
        if (!g.p.grounded && !g.p.isVineSwinging) air++;
        if (g.p.grounded) {
          land = g.p.y < FLOOR - 150 ? 'far' : 'pit';
          break;
        }
        if (g.p.isVineSwinging && f > 3) {
          land = 'kept';
          break;
        }
      }
      if (land === 'far') {
        good++;
        if (first < 0) first = k;
        last = k;
        airMin = Math.min(airMin, air);
        airMax = Math.max(airMax, air);
      }
      if (k % 8 === 0) row.push(`${(k * DT).toFixed(2)}:${land || '-'}`);
    }
    say(`sleeper ${setting} G=${G} (liana ${LEN} px, shelf 200 px under its top+560): a Jump at each frame of one swing (${TIMED.period} s): lands on the far shelf on ${good}/${per} frames = ${(good * DT).toFixed(2)} s a swing (clock ${(first * DT).toFixed(2)}-${(last * DT).toFixed(2)}), air ${s2(airMin)}-${s2(airMax)} s; worst wait for the window ${((per - good) * DT).toFixed(2)} s; sample ${row.join(' ')}`);
  }
  say(`sleeper ${setting}: TIMED period ${TIMED.period}, sweet ${TIMED.sweetFrom}..${TIMED.sweetTo}, grabX ${TIMED.grabX}`);
}

// ───────────────────────────── 3-9: the bait ─────────────────────────────

function bait() {
  const X = 10000;
  for (const d of [200, 400, 520, 600]) {
    const row: string[] = [];
    let drawnN = 0, noticed = 0, runs = 0, arriveMax = 0, lookT = 0, stopAt = 0;
    for (let ph = 0; ph < 12; ph += 0.5) {
      const s = newPredator(OCELOT, { x: X, y: FLOOR, minX: X - 300, maxX: X + 300, facing: 1 });
      let t = 0;
      const far: Prey = { x: X - 5000, y: FLOOR, facing: 1, still: false, covered: false, moving: true };
      for (; t < ph; t += DT) stepPredator(OCELOT, s, { t, dt: DT, hero: far, easy });
      // the lure lands d px on the far side from where Pokey is (he comes from the left; it lands right of the ocelot)
      const lx = s.x + d;
      const res = hear(OCELOT, s, { x: lx, y: FLOOR, t, r: NOISE.hear, from: 'thrown' });
      runs++;
      if (res !== 'drawn') continue;
      drawnN++;
      // he walks (285 px/s) from 700 px left of the ocelot along the floor past it while it goes to the lure and looks
      const hero: Prey = { x: s.x - 700, y: FLOOR, facing: 1, still: false, covered: false, moving: true };
      let arrive = -1, saw = false, back = -1, lastX = s.x, calm = 0;
      const t0 = t;
      for (let f = 0; f < 400; f++, t += DT) {
        hero.x += PHYS.maxRun * DT;
        const ev = stepPredator(OCELOT, s, { t, dt: DT, hero, easy });
        if (ev.notice || ev.tell) saw = true;
        // (arrived: it stops walking while still drawn; it may stop at its beat's end short of the lure)
        calm = s.drawn && Math.abs(s.x - lastX) < 0.05 ? calm + 1 : 0;
        lastX = s.x;
        if (arrive < 0 && calm >= 3) {
          arrive = t - t0 - 2 * DT;
          stopAt = s.x - (lx - d);
        }
        if (arrive >= 0 && back < 0 && !s.drawn) back = t - t0;
      }
      if (saw) noticed++;
      arriveMax = Math.max(arriveMax, arrive);
      lookT = Math.max(lookT, back - arrive);
      if (row.length < 3) row.push(`ph ${ph}: there in ${arrive.toFixed(2)} s, drawn till ${back.toFixed(2)} s`);
    }
    say(`bait ${setting} lure ${d} px past the ocelot: drawn ${drawnN}/${runs}; walked past behind it at a run, noticed ${noticed}/${drawnN}; it stops ${r0(stopAt)} px from where it heard it (its beat ends 300 px either side of its post), slowest arrival ${arriveMax.toFixed(2)} s, looks ${lookT.toFixed(2)} s (NOISE.hear ${NOISE.hear}, dur ${NOISE.dur}; ocelot speed ${JSON.stringify(OCELOT.speed)}); ${row.join('; ')}`);
  }
  say(`bait: OCELOT.beatenBy.light ${JSON.stringify(OCELOT.beatenBy.light)}: a 'light' way makes it FLEE, not look: the bait is the lure branch (core.ts hear), not the light way`);
}

// ───────────────────────────── hidden: the raft ─────────────────────────────

function raft() {
  const g = new Rig('2-1');
  for (const speed of [90, 143, 200]) {
    const logW = 300;
    const x0 = LIP - 400, x1 = LIP + 20000;
    const log = { id: 5, x: LIP - 100, y: FLOOR, width: logW, height: 30, type: 'drift', drift: { x0, x1, dir: 1, speed, width: logW, offset: (LIP - (x0 - logW)) / speed, baseY: FLOOR } } as unknown as Platform;
    // the log's clock: put it where he stands at time 0 of the cycle
    const lights = Array.from({ length: 40 }, (_, i) => ({ x: LIP + 300 + i * 400, y: FLOOR - 260, r: 140, sleep: true, id: 100 + i }));
    g.world([log], [], [{ kind: 'dark', x0: 0, x1: W * 2, top: FLOOR - 2000, bottom: FLOOR + 2000, baseY: FLOOR, dir: 1, period: 1, warn: 0, active: 0, offset: 0, force: 0, lights } as Zone]);
    g.e.gameTime = 0;
    g.frame();
    const lp = g.e.platforms.find((q: Platform) => q.id === 5);
    g.start(lp.x + logW / 2, FLOOR);
    g.frame();
    say(`raft rig: log at ${r0(lp.x)}..${r0(lp.x + logW)}, him at ${r0(g.p.x)}, grounded ${g.p.grounded}, on ${g.e.standingOnId}`);
    let stillF = -1, wokeF = -1;
    const aheadLit: number[] = [];
    const x0p = g.p.x;
    for (let f = 0; f < 300; f++) {
      g.frame();
      if (stillF < 0 && g.e.glowStill > 0) stillF = f;
      if (wokeF < 0 && g.e.glowWake.size) wokeF = f;
      // when each light becomes fully lit (wake time + fade), how far ahead of him it is, in seconds of raft
      for (const l of lights) {
        const w = g.e.glowWake.get(l.id);
        if (w !== undefined && g.e.gameTime >= w + GLOW_REACH.fade && !(l as any).seen) {
          (l as any).seen = true;
          aheadLit.push((l.x - g.p.x) / speed);
        }
      }
    }
    const moved = g.p.x - x0p;
    say(`raft ${setting} at ${speed} px/s (rode ${r0(moved)} px in 10 s; grounded ${g.p.grounded}, his own vx ${r0(g.p.vx)}): riding counts as still after ${stillF >= 0 ? s2(stillF + 1) + ' s' : 'NEVER'}; first lights wake ${wokeF >= 0 ? s2(wokeF + 1) + ' s' : 'NEVER'} (GLOW_STILL ${GLOW_STILL}); a light is FULLY lit ${aheadLit.length ? `${Math.min(...aheadLit).toFixed(1)}-${Math.max(...aheadLit).toFixed(1)} s` : '-'} before the raft reaches it (reach ahead ${GLOW_REACH.ahead}, wave ${GLOW_REACH.speed} px/s, fade ${GLOW_REACH.fade}); a bounded reach of R px gives R / v - R / wave - fade s of full light: ${[240, 360, 480, 600].map((R) => `R ${R} -> ${(R / speed - R / GLOW_REACH.speed - GLOW_REACH.fade).toFixed(2)} s`).join(', ')}`);
  }
}


/**
 * rock (hidden): a rock across the raft's path (a solid out of the water, the raft passes under it: logs never stop). From a raft at `speed`,
 * a held Jump pressed d px before the rock's near edge: does he land on its top; then, standing on it, when the raft comes out the far side,
 * a held Right at each frame: does he land back on the raft. Prints the take-off window (d), the wait on the rock, and the step-back window (s).
 */
function rock() {
  const g = new Rig('2-1');
  const speed = 143;
  const logW = 300;
  const x0 = LIP - 400, x1 = LIP + 20000;
  for (const [H, RW] of [[60, 260], [80, 260], [120, 260]] as const) {
    const RX = LIP + 900;
    const mk = () => {
      const log = { id: 5, x: LIP - 100, y: FLOOR, width: logW, height: 30, type: 'drift', drift: { x0, x1, dir: 1, speed, width: logW, offset: (LIP - (x0 - logW)) / speed, baseY: FLOOR } } as unknown as Platform;
      g.world([log, solid(2, RX, FLOOR - H, RW, H + 400)]);
      g.e.gameTime = 0;
      g.frame();
      const lp = g.e.platforms.find((q: Platform) => q.id === 5);
      g.start(lp.x + logW / 2, FLOOR);
      g.frame();
      return lp;
    };
    const land: number[] = [];
    let waitMin = 99, waitMax = 0;
    const back: number[] = [];
    for (let d = 10; d <= 320; d += 10) {
      const lp = mk();
      let f = 0;
      for (; f < 600 && RX - g.p.x > d; f++) g.frame();
      if (!g.p.grounded) continue;
      g.jump('hold');
      let on = false;
      for (let k = 0; k < 60; k++) {
        g.frame();
        if (g.p.grounded && Math.abs(g.p.y - (FLOOR - H)) < 3) {
          on = true;
          break;
        }
        if (g.p.grounded && k > 3) break;
      }
      if (!on) continue;
      land.push(d);
      // standing on the rock: wait for the raft to come out past the rock's far end, then try a step back at each frame
      const t0 = g.frames;
      let emerge = -1;
      for (let k = 0; k < 300; k++) {
        g.frame();
        if (emerge < 0 && lp.x + logW > RX + RW + 60) emerge = g.frames;
        if (emerge >= 0) break;
      }
      const wait = (emerge - t0) * DT;
      waitMin = Math.min(waitMin, wait);
      waitMax = Math.max(waitMax, wait);
      if (d === land[0]) {
        // the step-back window: from the raft emerging, a held Right begun k frames later: does he land on the raft?
        for (let k = 0; k < 120; k += 3) {
          const lp2 = mk();
          let ff = 0;
          for (; ff < 600 && RX - g.p.x > d; ff++) g.frame();
          g.jump('hold');
          for (let q = 0; q < 60; q++) {
            g.frame();
            if (g.p.grounded && Math.abs(g.p.y - (FLOOR - H)) < 3) break;
          }
          for (let q = 0; q < 300 && !(lp2.x + logW > RX + RW + 60); q++) g.frame();
          for (let q = 0; q < k; q++) g.frame();
          g.right(true);
          let res = 'none';
          for (let q = 0; q < 60; q++) {
            g.frame();
            if (g.p.grounded && g.p.y > FLOOR - 3 && q > 2) {
              res = g.e.standingOnId === 5 ? 'raft' : 'other';
              break;
            }
            if (g.p.y > FLOOR + 60) {
              res = 'water';
              break;
            }
          }
          g.right(false);
          if (res === 'raft') back.push(k);
        }
      }
    }
    const span = (a: number[]) => (a.length ? `${a[0]}-${a[a.length - 1]}` : 'none');
    say(`rock ${setting} raft ${speed} px/s, rock ${H} px up, ${RW} px wide: a held Jump lands on its top from ${span(land)} px before its edge (${land.length} of 32 tries, every 10 px: ${land.join(',')}); then he waits ${waitMin.toFixed(2)}-${waitMax.toFixed(2)} s on it for the raft to come out; a held Right lands him back on the raft when begun ${back.length ? `${(back[0] * DT).toFixed(2)}-${(back[back.length - 1] * DT).toFixed(2)} s` : 'never'} after it shows 60 px past the rock (${back.length} of 40 tries)`);
  }
}

const MODES: Record<string, () => void> = { hop, cap, quiet, sleeper, bait, raft, rock };
for (const [k, fn] of Object.entries(MODES)) if (mode === 'all' || mode === k) fn();
