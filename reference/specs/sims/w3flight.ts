/**
 * w3flight — 3-1's and 3-2's numbers, flown in the real engine at 30 fps through the game's own InputEngine (level.md rule 24;
 * DESIGN-31-32). Designer sim; nothing in the game imports it.
 *
 *   npx tsx reference/specs/sims/w3flight.ts <normal|easy> <hop|wake|drop|puff|rope|all>
 *
 * hop   the rig's check: a tapped hop on flat ground must read the packet's 0.43 s / 106-119 px (never FakeInput's 0.30/83)
 * wake  World 3's glowworms (engine.ts stepGlowworms): he runs at full speed to a shelf's rim and lets go of Right; how long until he
 *       counts as still (grounded, |vx| < 25), until the lights wake (GLOW_STILL), until they are fully lit (GLOW_REACH.fade); how far he
 *       slides; and WHICH lights wake (by x only today: a light 3000 px below wakes as one 60 px below does)
 * drop  walking off a rim (from a stand and from a full run) onto a floor D px below: air time, where he lands past the rim, the landing
 *       speed, whether it buzzes hard (engine HARD_LAND_VY 560), the noise it makes (heroNoise LOUD.landing), whether a life is lost
 * puff  a drop timed to a puff's light: from a stand at the rim, how long from pressing Right to landing D px below; the share of a
 *       spore cycle (zones.ts spore(): period 6.4, warn 1.0, active 2.2) in which a press lands him while the puff is lit
 * rope  a root (a shimmy rope over walkable floor) H px over the floor: can a tap / a held jump / a held jump with Up catch it from a
 *       stand under it; the creep speed hanging; his feet's height over the floor (what a prowler's `tall` must not reach); the drop
 *       off it (Down) and its noise
 */
import '../../../src/game/headlessDom.ts';
import { RealPlay, DT } from '../../../src/game/realPlay.ts';
import { InputEngine } from '../../../src/game/inputEngine.ts';
import { setDifficulty } from '../../../src/game/difficulty.ts';
import { GLOW_STILL, GLOW_REACH, type Zone } from '../../../src/game/zones.ts';
import { LOUD, landingNoise } from '../../../src/game/heroNoise.ts';
import { HANG_DROP, ROPE_SPEED } from '../../../src/game/rope.ts';
import type { Platform, Rope } from '../../../src/game/types.ts';
import { OCELOT } from '../../../src/game/predators/world3.ts';
import { newPredator, stepPredator } from '../../../src/game/predators/core.ts';
import type { Prey } from '../../../src/game/predators/types.ts';

type Setting = 'normal' | 'easy';
const setting = (process.argv[2] ?? 'normal') as Setting;
const mode = process.argv[3] ?? 'all';
setDifficulty(setting);

const FLOOR = 5000;
const LIP = 3000;
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
  world(pl: Platform[], ropes: Rope[] = [], zones: Zone[] = []) {
    this.r.bare(pl.map((q) => ({ ...q })), [], ropes);
    this.e.currentStage.zones = zones;
    this.e.glowWake.clear();
    this.e.glowStill = 0;
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
    else this.inp.clearAll();
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
    say(`hop ${setting} tap from ${vx ? 'a full run' : 'a stand'}: ${s2(air)} s in the air, ${Math.round(g.p.x - x0)} px along, apex ${Math.round(apex)} px`);
  }
}

function wake() {
  const g = new Rig('3-1');
  const D = 240;
  // the rim's shelf, and a shelf D px below the rim reaching under it; four sleeping glowworms
  const lights = [
    { x: LIP + 120, y: FLOOR + D - 70, r: 170, sleep: true, id: 1 }, // over the landing below
    { x: LIP + 120, y: FLOOR + 3000, r: 170, sleep: true, id: 2 }, // 3000 px below, same x
    { x: LIP - 400, y: FLOOR - 60, r: 170, sleep: true, id: 3 }, // behind him (past GLOW_REACH.back)
    { x: LIP + 900, y: FLOOR + D - 70, r: 170, sleep: true, id: 4 }, // 900 px ahead below
  ];
  const dark: Zone = { kind: 'dark', x0: 0, x1: LIP + 3000, top: FLOOR - 2000, bottom: FLOOR + 6000, baseY: FLOOR, dir: 1, period: 1, warn: 0, active: 0, offset: 0, force: 0, lights };
  for (const from of ['run', 'stand-start'] as const) {
    g.world([solid(1, 0, FLOOR, LIP), solid(2, LIP - 200, FLOOR + D, 2000)], [], [dark]);
    const vx = from === 'run' ? 285 : 0;
    g.start(LIP - 700, FLOOR, vx);
    g.right(true);
    // run (or walk up from a stand) until 160 px short of the rim, then let go of Right
    let f = 0;
    for (; f < 300 && g.p.x < LIP - 160; f++) g.frame();
    const xLet = g.p.x;
    const vLet = g.p.vx;
    g.right(false);
    let still = -1, woke = -1, lit = -1;
    for (let k = 0; k < 120; k++) {
      g.frame();
      if (still < 0 && g.p.grounded && Math.abs(g.p.vx) < 25) still = k;
      if (woke < 0 && g.e.glowWake.has(1)) woke = k;
      if (lit < 0 && g.e.glowLit(1) >= 1) lit = k;
    }
    const woken = [1, 2, 3, 4].map((id) => `${id}:${g.e.glowWake.has(id) ? 'awake' : 'asleep'}`).join(' ');
    say(
      `wake ${setting} from a ${from} (${Math.round(vLet)} px/s when Right let go, 160 px short of the rim): still after ${s2(still + 1)} s, slid ${Math.round(g.p.x - xLet)} px; ` +
        `lights wake ${s2(woke + 1)} s after letting go (GLOW_STILL ${GLOW_STILL}); fully lit ${s2(lit + 1)} s (fade ${GLOW_REACH.fade}); ${woken} (reach back ${GLOW_REACH.back} / ahead ${GLOW_REACH.ahead}, by x only)`,
    );
  }
  // a tap-and-go stop: he stands only 0.4 s, then walks on: nothing wakes
  g.world([solid(1, 0, FLOOR, LIP), solid(2, LIP - 200, FLOOR + D, 2000)], [], [dark]);
  g.start(LIP - 300, FLOOR, 0);
  for (let k = 0; k < 12; k++) g.frame();
  say(`wake ${setting}: standing 0.40 s wakes ${g.e.glowWake.size} light(s); ` + (() => {
    for (let k = 0; k < 12; k++) g.frame();
    return `0.80 s wakes ${g.e.glowWake.size}`;
  })());
}

function drop() {
  const g = new Rig('3-1');
  for (const D of [80, 120, 160, 200, 240, 300, 400, 600, 900, 1400]) {
    const row: string[] = [];
    for (const from of ['stand', 'run'] as const) {
      g.world([solid(1, 0, FLOOR, LIP), solid(2, LIP - 300, FLOOR + D, 3000)]);
      g.start(from === 'run' ? LIP - 400 : LIP - 20, FLOOR, from === 'run' ? 285 : 0);
      g.right(true);
      let off = -1, air = 0, vy = 0, landX = 0, fy = 0;
      for (let f = 0; f < 200; f++) {
        vy = g.p.vy;
        g.frame();
        if (!g.p.grounded) {
          if (off < 0) off = f;
          air++;
          fy = Math.max(fy, g.p.y);
        } else if (off >= 0) {
          landX = g.p.x - LIP;
          break;
        }
      }
      const fell = g.p.y - FLOOR;
      const n = landingNoise(0, 0, 0, fell);
      row.push(`${from}: ${s2(air)} s air, lands ${Math.round(landX)} px past the rim, ${Math.round(vy)} px/s${vy > 560 ? ' HARD' : ''}, noise ${n ? Math.round(n.r) + ' px' : 'none'}, lives lost ${g.lives}`);
    }
    say(`drop ${setting} D=${D}: ${row.join(' | ')}`);
  }
  say(`drop: LOUD.landing ${JSON.stringify(LOUD.landing)}`);
}

function puff() {
  const g = new Rig('3-1');
  const P = { period: 6.4, warn: 1.0, active: 2.2 };
  for (const D of [160, 240, 320, 400]) {
    g.world([solid(1, 0, FLOOR, LIP), solid(2, LIP - 300, FLOOR + D, 3000)]);
    g.start(LIP - 30, FLOOR, 0);
    g.right(true);
    let f = 0;
    for (; f < 200; f++) {
      g.frame();
      if (f > 2 && g.p.grounded && g.p.y > FLOOR + 1) break;
    }
    const t = (f + 1) * DT;
    // lit = the puff's warn (it glows as it swells) + active; a press is good when he lands while lit and saw it lit when he pressed
    const lit = P.warn + P.active;
    const good = Math.max(0, lit - t);
    say(`puff ${setting} D=${D}: Right pressed at a stand 30 px from the rim -> lands in ${t.toFixed(2)} s; lit ${lit.toFixed(1)} s of ${P.period}: a press sees and lands in light ${good.toFixed(2)} s a cycle (${Math.round((100 * good) / P.period)}%), worst wait ${(P.period - good).toFixed(2)} s`);
  }
}

function rope() {
  const g = new Rig('3-2');
  g.e.skills.add?.('shimmy');
  for (const H of [146, 170, 190, 210, 230, 250, 280]) {
    const row: string[] = [];
    for (const how of ['tap', 'hold', 'hold+up', 'double+up'] as const) {
      const rp: Rope = { id: 9, x0: LIP - 600, x1: LIP + 1400, y: FLOOR - H, g0: FLOOR, g1: FLOOR, required: false };
      g.world([solid(1, 0, FLOOR, 20000)], [rp]);
      g.start(LIP, FLOOR, 0);
      if (how.endsWith('+up')) g.inp.triggerTouchClimb(-1);
      g.jump(how === 'tap' ? 'tap' : 'hold');
      let caught = -1;
      for (let f = 0; f < 45; f++) {
        // (the double: a second held press at the first jump's top)
        if (how === 'double+up' && f === 9) {
          g.inp.releaseTouchUp();
          g.frame();
          g.jump('hold');
        }
        g.frame();
        if (g.p.hanging) {
          caught = f;
          break;
        }
      }
      row.push(`${how} ${caught >= 0 ? 'CATCHES at ' + s2(caught + 1) + ' s' : 'misses'}`);
    }
    // creep, feet height and the drop, from hanging
    const rp: Rope = { id: 9, x0: LIP - 600, x1: LIP + 1400, y: FLOOR - H, g0: FLOOR, g1: FLOOR, required: false };
    g.world([solid(1, 0, FLOOR, 20000)], [rp]);
    g.start(LIP, FLOOR, 0);
    g.r.hang(rp, LIP, FLOOR - H);
    g.inp.clearAll();
    for (let k = 0; k < 10; k++) g.frame();
    const feet = FLOOR - g.p.y;
    const x0 = g.p.x;
    g.right(true);
    for (let k = 0; k < 60; k++) g.frame();
    const creep = (g.p.x - x0) / (60 * DT);
    g.inp.clearAll();
    g.inp.triggerTouchClimb(1);
    let air = 0, vy = 0;
    for (let k = 0; k < 60; k++) {
      vy = g.p.vy;
      g.frame();
      if (!g.p.hanging && !g.p.grounded) air++;
      if (g.p.grounded) break;
    }
    const n = landingNoise(0, 0, 0, feet);
    say(`rope ${setting} H=${H}: ${row.join(', ')}; hanging feet ${Math.round(feet)} px over the floor; creep ${Math.round(creep)} px/s (ROPE_SPEED ${ROPE_SPEED}); Down drops in ${s2(air)} s at ${Math.round(vy)} px/s, noise ${n ? Math.round(n.r) + ' px' : 'none'} (HANG_DROP ${HANG_DROP})`);
  }
}

/**
 * prowl: the kit's own ocelot (predators/world3.ts OCELOT, core.ts stepPredator) pacing a 600 px stretch under a root, and Pokey creeping
 * over it hanging, at the flown creep (120 px/s) and the flown hanging feet height (H=190: 94 px; H=170: 74 px). Every start phase over
 * 12 s. 'today' = the kit as it is; 'lit r' = a glowworm patch of radius r on the root over the stretch's middle, modelled as the fix's
 * rule "inside a lit ring he is seen at any height" (hero.y passed at the ocelot's own height while he is in the ring). Counts the
 * crossings it notices him on, and those whose tell begins (the leap's 0.5 s warning), and the most time he spends in the light.
 */
function prowl() {
  const easy = setting === 'easy';
  const X = 10000;
  for (const feet of [94, 74]) {
    for (const lit of [0, 60, 90, 120]) {
      let noticed = 0, told = 0, runs = 0, lightMax = 0, badRun = 0, worst = 0;
      for (let ph = 0; ph < 12; ph += 0.25) {
        const s = newPredator(OCELOT, { x: X, y: FLOOR, minX: X - 300, maxX: X + 300, facing: 1 });
        const hero: Prey = { x: X - 900, y: FLOOR - feet, facing: 1, still: false, covered: false, moving: true };
        let t = 0, saw = false, tell = false, inLight = 0;
        // the ocelot paces alone for `ph` s first (the phase he arrives in)
        for (; t < ph; t += DT) stepPredator(OCELOT, s, { t, dt: DT, hero: { ...hero, x: X - 5000 }, easy });
        for (let f = 0; hero.x < X + 900 && f < 600; f++, t += DT) {
          hero.x += ROPE_SPEED * DT;
          const inRing = lit > 0 && Math.abs(hero.x - X) <= lit;
          if (inRing) inLight += DT;
          const ev = stepPredator(OCELOT, s, { t, dt: DT, hero: inRing ? { ...hero, y: s.y } : hero, easy });
          if (ev.notice) saw = true;
          if (ev.tell) tell = true;
        }
        lightMax = Math.max(lightMax, inLight);
        runs++;
        if (saw) noticed++;
        if (tell) told++;
        badRun = tell ? badRun + 1 : 0;
        worst = Math.max(worst, badRun);
      }
      say(`prowl ${setting} feet ${feet} px up, ${lit ? 'lit ring r=' + lit : 'dark (today\'s kit)'}: noticed on ${noticed}/${runs} crossings, tell began on ${told}/${runs} (a crossing started at a random moment passes ${Math.round((100 * (runs - told)) / runs)}%; the longest wait for a clean start ${(worst * 0.25).toFixed(2)} s); ${inLight(lightMax)}`);
    }
  }
}
const inLight = (s: number) => (s ? `${s.toFixed(2)} s in the light` : 'never lit');

const MODES: Record<string, () => void> = { hop, wake, drop, puff, rope, prowl };
for (const [k, fn] of Object.entries(MODES)) if (mode === 'all' || mode === k) fn();
