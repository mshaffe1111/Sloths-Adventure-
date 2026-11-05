/**
 * The beat tracer (w1-rhythm, 2026-11-04; PLAN-TO-80 Phase A, STAGE-RULES §0b.9). The research's rule, 11-04 full, line 597:
 *   "For Flow and Tight nodes, generate a rhythmic beat pattern first (e.g., 90 BPM in World 2, 125 BPM in World 8), trace Pokey's real
 *    parabolic jump physics along those beats, and place platforms, vines, and branches directly underneath his simulated feet."
 * and line 524-527: every stage gets a BPM, every node is cut into bars of 4 beats, and placements lock onto "the beat, the off-beat, or
 * the half-note".
 *
 * How it works:
 *   - A node is a BPM and some bars. A bar is 8 eighth-note slots: 'x' a take-off on the beat (an even slot), 'o' a take-off on the
 *     off-beat (an odd slot), 'h' a take-off on a half-note (slot 0 or 4) whose move fills the half-note, '.' running.
 *   - Each take-off has a move (a hop: the thumb lets go at once, PHYS.cutV; a jump: held; a double: the second flick at the top), the
 *     height of the surface he lands on (dy, up is +) and what that surface is (a bank, a branch, a stump, a crumbling ledge).
 *   - Pokey runs and jumps with the engine's own numbers (physics.ts PHYS, secondJumpV; the engine's 1/60 slices, the pad read once a
 *     30 fps frame), holding the way on, from the node's entrance apron. Where his feet come down, the surface is placed under them.
 *   - Each surface is then widened to hold a clumsy thumb (research line 615, and §1's clumsy-thumb bot): a take-off 100 ms early or
 *     late, or as early as the game's take-off slack (physics.ts TAKEOFF_SLACK: the last 70 px before an edge), with 15% less air speed,
 *     at 30 and 60 Hz; the near edge sits 8 px short of the shortest of those landings (feet 6-8 px inside the edge, line 613), and the
 *     take-off ledge runs 8 px past the latest take-off.
 *   - Every node starts and ends on a flat, safe 200 px apron with a checkpoint at its entrance (line 600-601).
 *   - The landing of every jump is checked to be on screen at take-off, upright and sideways (line 614), with the engine's own framing
 *     of a landing across a gap (cameraFollow.ts AHEAD, landingBox, heroBox).
 * The tracer is pure numbers: the stage builders (protoStage.ts) turn its ledges into banks, branches and stumps with World 1's art.
 *
 * USAGE (for every builder: w1-rhythm, w1-rhythm-b, w8-rope2):
 *   const bpm = stageBpm(config);                     // the stage's music BPM (never type one)
 *   const spec: NodeSpec = { bpm, x, y: G, bars: ['x...x...', 'x.....x.'], steps: [
 *     { move: 'jump', dy: 0, surface: 'bank' }, { move: 'jump', dy: 40, surface: 'branch' }, ...] };   // one step per mark
 *   const tr = traceNode(easy ? easyNode(spec) : spec); // throws if the pattern can't be danced (in the air at the next hit, no gap, a
 *                                                       // face in the way, off screen, the same gap 4 times running)
 *   tr.ledges   -> place each: 'apron' and 'bank' at ground level are banks, 'branch' a branch, 'stump' a block up from the ground,
 *                  'crumble' a crumbling ledge (taught first); tr.gaps are the air between them (a soft or a real pit under each).
 *   tr.checkpoint -> the node's flag (on its entrance apron). tr.x1 / tr.yOut -> where the next node starts.
 *   hazardSpots(tr, ['skip', 'held', ...]) -> where a thorn, a snake or a pit's teeth catch the player who left the beat, and never one on
 *                  it (checked in the real engine). deadWalks(tr) -> runs with no input over 2.5 s: fill each with a slope, a hop or a critter.
 *   tr.density -> take-offs a second (intro 0.4, ramp ~0.8). checkTrace(tr, spec.steps) -> [] when every clumsy try holds.
 * Marks: 'x' on the beat (even eighth), 'o' off-beat (odd eighth), 'h' a half-note (slot 0 or 4), '.' running. At ~130 BPM an eighth
 * is 0.23 s: a jump (0.65 s in the air) needs 3 eighths before the next mark, a hop (0.44 s) 2, a double (1.05 s) 5.
 * Limits measured: a flat jump's gap ~104 px, a double's ~200; a face (stump, bank) up to 70 px Normal / 42 Easy; a branch up to 90.
 */
import { LAND_HALF, PHYS, TAKEOFF_SLACK, reachJump, reachJumpHeld, secondJumpV } from './physics.ts';
import { AHEAD, heroBox, landingBox } from './cameraFollow.ts';
import { BEAT_STAGES, stageBeatBpm, stageMusic } from '../audio/scenes.ts';
import { themeById } from '../audio/themes.ts';

/** where a take-off falls in the bar */
export type Hit = 'beat' | 'off' | 'half';
/** the move taken on it */
export type Move = 'hop' | 'jump' | 'double';
/** what he lands on */
export type Surface = 'bank' | 'branch' | 'stump' | 'crumble';

export interface Step {
  move: Move;
  /** the landing surface's height over the take-off's (px, up is +) */
  dy: number;
  surface: Surface;
}
export interface NodeSpec {
  bpm: number;
  /** one string per bar, 8 eighth-note slots each ('x' beat, 'o' off-beat, 'h' half-note, '.' running) */
  bars: string[];
  /** one per take-off in the bars, in order */
  steps: Step[];
  /** the entrance apron's surface (px, the game's y: down is +) */
  y: number;
  /** where the entrance apron starts (px) */
  x: number;
  /** Easy: the thumb holds a jump only 70% (physics.ts EASY_HOLD) and every landing pad is wider */
  easy?: boolean;
  /** refuse a branch up over the end of the ledge he jumps from (he'd stand under it, his head through it; the level check reads it as
   *  no way up). Off by default, so a builder's fixed steps keep tracing as they did (w1Rise.ts); w1Rhythm.ts fitSteps turns it on */
  noOverhang?: boolean;
  /** px more inside the reach for a gap whose landing is a faced piece (a bank or a stump: 50 px or more of wall under its lip): a short
   *  flick that lands a little short there hits the face and drops into the pit, where a branch's thin lip would still have taken him
   *  (0% for the clumsy thumb at 1-2's stump-to-bank drop, x 26112 on layout 1, 2026-11-04). Off by default; w1Rhythm.ts fitSteps sets it */
  faceMargin?: number;
}

/** a ledge the node needs, left to right (an apron, or the surface under one landing) */
export interface Ledge {
  x0: number;
  x1: number;
  y: number;
  surface: Surface | 'apron';
  /** which take-off lands on it (-1: the entrance apron) */
  step: number;
}
export interface Landing {
  step: number;
  hit: Hit;
  move: Move;
  /** the take-off's slot in the node (eighths from the grid's start) and its time (s, from the node's start) */
  slot: number;
  t: number;
  /** the planned take-off and landing (Pokey's middle, feet) */
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  /** air time (s) */
  air: number;
  /** the shortest and furthest landings of every clumsy try (px) */
  shortX: number;
  longX: number;
  /** the latest take-off of every try (px) */
  lateX: number;
}
export interface Trace {
  bpm: number;
  /** seconds a beat */
  beat: number;
  ledges: Ledge[];
  landings: Landing[];
  /** the gaps between ledges (px), each with the take-off it is jumped on */
  gaps: Array<{ x0: number; x1: number; step: number }>;
  checkpoint: { x: number; y: number };
  /** the node's span: entrance apron start to exit apron end */
  x0: number;
  x1: number;
  /** the exit apron's surface */
  yOut: number;
  /** a sure player's seconds through the node (on the beat) */
  seconds: number;
  /** take-offs a second over the bars (the research's density: intro 0.4, ramp about 0.8) */
  density: number;
  /** the lines the player avoided by moving on the beat (research 11-04 line 59): builders put a hazard on them (see hazardSpots) */
  avoided: Avoided[];
  /** every try's path that the trace keeps safe (the planned one and the clumsy ones): nothing may be put on these */
  safe: Array<Array<[number, number]>>;
  /** runs with no input over a second (deadWalks: those over DEAD_WALK s, research 11-04 line 100, which a builder fills with a slope, a hop or a critter) */
  walks: Array<{ x0: number; x1: number; y: number; s: number }>;
}

/**
 * A line the beat made him avoid (research 11-04 line 59: "Wherever Ghost Pokey's timeline says Duck or Short-Hop, the generator places a
 * hazard... along the alternate trajectory that Ghost Pokey avoided"):
 *   early:  the jump taken a beat too soon (it comes down short, or its top is somewhere the on-beat run never goes);
 *   skip:   the beat skipped: holding the way on with no jump, off the end of the ledge (or under the ledge above);
 *   held:   a hop held into a full jump (its arc rises over the hop's);
 *   tapped: a jump let go as a hop (it comes down short).
 */
export interface Avoided {
  kind: 'early' | 'skip' | 'held' | 'tapped';
  step: number;
  /** his feet along it (px, the game's y) */
  path: Array<[number, number]>;
}

/** the node's two flat, hazard-free aprons (research line 600) */
export const APRON = 200;
/** feet at least this far inside a landing's near edge (research line 613: "6 to 8 pixels inside the ledge boundary") */
export const INSIDE = 8;
/** the clumsy thumb (research §1, line 612-613; tools/validate/play.ts CLUMSY): a take-off this late or early (s), this share of air speed */
export const CLUMSY = { late: 0.1, air: 0.85 } as const;
/** a hop: the thumb is on the glass for two 30 fps frames, then lets go; the engine then caps the rise at PHYS.cutV */
export const HOP_HOLD = 0.05;
/** Easy's thumb holds a jump this share of a full one's height (physics.ts EASY_HOLD) */
const EASY_HOLD = 0.7;
/** the real engine (realPlay, 30 fps) comes down up to 9.3 px shorter than the tracer's 30 Hz flight (a double jump down 100 px; measured 2026-11-04, beatTrace.test.ts):
 *  every near edge is moved back this much more, so the engine's own landing is still INSIDE px in */
export const SLOP = 10;
/** how far inside the level check's reach every gap stays (px): the first-timer's shortest flick (tools/inspect/firsttimer.ts) */
export const FT_MARGIN = 15;
/** a face's corner may be met this far under its top (px): the engine hoists him onto a lip up to FORGIVE.mantle (26) over his feet;
 *  the tracer counts only half of that */
export const HOIST = 13;
/** a gap narrower than this is no jump at all (px): the tracer refuses it */
export const MIN_GAP = 40;
/** a run with no input longer than this (s) is a dead walk (research 11-04 line 100; W1-REBUILD-PLAN.md) */
export const DEAD_WALK = 2.5;
/** a node fails when the same gap (move, height, width within GAP_SAME px) comes this many times in a row (research 11-04 line 585) */
export const GAP_REPEAT = 4;
export const GAP_SAME = 12;
/** a hazard on an avoided line keeps this far (px) from Pokey's body on every safe try (his body: heroBox, 56 x 116) */
export const HAZARD_CLEAR = 24;
/** the level check's margin on a jump's reach (levelCheck.ts MARGIN) */
export const LC_MARGIN = 0.97;
/** the narrowest ledge it places (px): a landing is never a sliver */
export const MIN_LEDGE = 90;

/** the views a phone shows (px of world): upright on the narrowest phone we support at the stage's 900 px height, sideways on a squat
 *  one (engine.ts applyZoom: upright 412 x 915 is about 405 x 900 of world, 360 x 740 about 438 x 900; sideways 915 x 412 is 1199 x 540,
 *  844 x 390 1169 x 540). The narrowest of each is used. */
export const VIEWS = {
  upright: { vw: 400, vh: 880 },
  sideways: { vw: 1100, vh: 540 },
} as const;

/** the engine's slices (engine.ts STEP) and its frame (the pad is read once a frame) */
const STEP = 1 / 60;
const FRAME = 1 / 30;

// ------------------------------------------------------------------ the grid ------------------------------------------------------------------

export interface GridHit {
  slot: number;
  hit: Hit;
}
/** the take-offs in a node's bars, each with its slot (eighths) and where it falls; throws on a hit on the wrong slot */
export function gridHits(bars: readonly string[]): GridHit[] {
  const out: GridHit[] = [];
  bars.forEach((bar, b) => {
    if (bar.length !== 8) throw new Error(`bar ${b + 1} "${bar}" is not 8 eighths`);
    for (let s = 0; s < 8; s++) {
      const c = bar[s];
      if (c === '.') continue;
      const slot = b * 8 + s;
      if (c === 'x') {
        if (s % 2) throw new Error(`bar ${b + 1}: 'x' (on the beat) at an off-beat slot ${s}`);
        out.push({ slot, hit: 'beat' });
      } else if (c === 'o') {
        if (s % 2 === 0) throw new Error(`bar ${b + 1}: 'o' (off-beat) at an on-beat slot ${s}`);
        out.push({ slot, hit: 'off' });
      } else if (c === 'h') {
        if (s !== 0 && s !== 4) throw new Error(`bar ${b + 1}: 'h' (half-note) must start a half of the bar, not slot ${s}`);
        out.push({ slot, hit: 'half' });
      } else throw new Error(`bar ${b + 1}: unknown mark '${c}'`);
    }
  });
  return out;
}

// ------------------------------------------------------------------ the flight ------------------------------------------------------------------

export interface FlightIn {
  move: Move;
  /** the landing surface over the take-off (px, up +) */
  dy: number;
  /** speed at take-off (px/s) */
  vx: number;
  /** share of the air speed kept (the clumsy thumb: 0.85) */
  air?: number;
  /** the engine's slice (1/60) or a slow phone's whole frame (1/30) */
  dt?: number;
  /** share of a full jump's height the thumb holds (Easy 0.7) */
  hold?: number;
}
export interface Flight {
  /** where the feet come down through the surface (px past the take-off), and when (s) */
  dx: number;
  t: number;
  /** the feet's path, every slice (px past the take-off, px up from it) */
  path: Array<[number, number]>;
}

/**
 * One flight with the engine's rules (engine.ts ~2180-2250): the launch, the cut when the thumb lets go (PHYS.cutV), the hang at the top
 * while held, the second flick at the top (secondJumpV), gravity up and down, steering held the way on (physics.ts airStep). null if the
 * feet never come down onto a surface that high.
 */
export function flight(o: FlightIn): Flight | null {
  const dt = o.dt ?? STEP;
  const air = o.air ?? 1;
  const hold = o.hold ?? 1;
  const cap = PHYS.maxRun * air;
  let x = 0, y = 0, vx = Math.min(cap, o.vx * air);
  // (Easy's held share of a jump: modelled as physics.ts reachJumpHeld does, a launch that rises that share of a full jump's height)
  let vy = -PHYS.jumpV * Math.sqrt(hold);
  // the thumb: held for a jump or a double (all the way), let go at once for a hop
  const heldFor = o.move === 'hop' ? HOP_HOLD : Infinity;
  let doubled = o.move !== 'double';
  let t = 0;
  const target = -o.dy;
  const path: Array<[number, number]> = [[0, 0]];
  for (let i = 0; i < 2000; i++) {
    // (the pad is read at the start of each 30 fps frame)
    const held = Math.floor(t / FRAME + 1e-9) * FRAME < heldFor;
    // the second flick, on the first frame that starts past the top of the first jump (the pad is read once a frame)
    const frameStart = Math.abs(t / FRAME - Math.round(t / FRAME)) < 1e-6;
    if (!doubled && vy >= 0 && frameStart) {
      vy = secondJumpV(vy, PHYS.doubleV);
      doubled = true;
    }
    // variable height: the thumb off the glass cuts the rise (engine.ts, PHYS.cutV)
    if (!held && vy < -PHYS.cutV) vy = -PHYS.cutV;
    // steering held the way on (physics.ts airStep)
    if (vx < cap) vx = Math.min(cap, vx + PHYS.airAcc * dt);
    let g = vy < 0 ? PHYS.gravUp : PHYS.gravDown;
    if (held && Math.abs(vy) < 90) g *= 0.72;
    const prev = y;
    vy = Math.min(PHYS.maxFall, vy + g * dt);
    x += vx * dt;
    y += vy * dt;
    t += dt;
    path.push([x, -y]);
    if (vy > 0 && prev <= target && y >= target) {
      // (the crossing, between this slice and the last)
      const k = (target - prev) / (y - prev || 1);
      return { dx: x - vx * dt * (1 - k), t: t - dt * (1 - k), path };
    }
    if (y > target + 600) return null;
  }
  return null;
}

/** the feet's height over the take-off where the body's front reaches `dx` (the corner of a face he must clear), from a flight's path */
export function heightAt(f: Flight, dx: number): number {
  for (let i = 1; i < f.path.length; i++) if (f.path[i][0] + LAND_HALF >= dx) return f.path[i][1];
  return f.path[f.path.length - 1][1];
}

// ------------------------------------------------------------------ the camera ------------------------------------------------------------------

/**
 * Whether the landing at (lx, ly) is on screen as he takes off from (px, py) in a view vw x vh (px of world): the engine shows the far
 * side of a gap when he nears the end of his ledge (cameraFollow.ts showBoth), keeping Pokey inside AHEAD.heroPad and the landing inside
 * AHEAD.pad. Both must fit at once, and the landing must be within the distance the engine looks (AHEAD.reach, up, down).
 */
export function landingInView(px: number, py: number, lx: number, ly: number, vw: number, vh: number): boolean {
  const dx = lx - px, dy = py - ly;
  if (dx > AHEAD.reach || dy > AHEAD.up || -dy > AHEAD.down) return false;
  const land = landingBox(lx, ly, 1), hero = heroBox(px, py);
  const P = AHEAD.pad, Q = AHEAD.heroPad;
  // across: the view's left edge v must put the hero in [Q.l, Q.r] and the landing in [P.l, P.r]
  const lo = Math.max(hero.x1 - vw * Q.r, land.x1 - vw * P.r);
  const hi = Math.min(hero.x0 - vw * Q.l, land.x0 - vw * P.l);
  if (lo > hi + 1e-6) return false;
  const tlo = Math.max(hero.y1 - vh * Q.b, land.y1 - vh * P.b);
  const thi = Math.min(hero.y0 - vh * Q.t, land.y0 - vh * P.t);
  return tlo <= thi + 1e-6;
}

// ------------------------------------------------------------------ the trace ------------------------------------------------------------------

/**
 * The tries every landing must hold, each at 60 and 30 Hz: the clumsy thumb of the brief and the research (on time or 100 ms late, with
 * full or 15% less air speed), an eager thumb (100 ms early, full air), and the game's own take-off slack (the last 70 px before an edge,
 * physics.ts TAKEOFF_SLACK, full air: the level check's rule). `off` is seconds late (negative early), or 'slack'.
 */
export const TRIES: ReadonlyArray<{ off: number | 'slack'; air: number; short?: boolean }> = [
  { off: 0, air: 1 },
  { off: CLUMSY.late, air: 1 },
  { off: 0, air: CLUMSY.air },
  { off: CLUMSY.late, air: CLUMSY.air },
  { off: -CLUMSY.late, air: 1 },
  { off: 'slack', air: 1 },
  // (and the flick that lets go early: a first-timer's thumb is on the glass 0.06-0.25 s, tools/inspect/firsttimer.ts, so a jump is
  // often cut short. The validator's clumsy thumb missed 1-2's and 1-5's full-hold gaps 33-100% of the time, 2026-11-04. A short
  // jump rises SHORT_HOLD of a full one: Normal 80%, Easy 60%)
  { off: 0, air: 1, short: true },
];
/** a short flick's share of a full jump's height: Normal, Easy */
export const SHORT_HOLD = { normal: 0.8, easy: 0.6 } as const;
const DTS = [STEP, FRAME] as const;

/** a sure player running from rest: how far he gets in `t` seconds starting at speed v (groundAcc up to maxRun) */
function runFor(v: number, t: number): { dx: number; v: number } {
  const tUp = Math.max(0, (PHYS.maxRun - v) / PHYS.groundAcc);
  if (t <= tUp) return { dx: v * t + 0.5 * PHYS.groundAcc * t * t, v: v + PHYS.groundAcc * t };
  return { dx: v * tUp + 0.5 * PHYS.groundAcc * tUp * tUp + PHYS.maxRun * (t - tUp), v: PHYS.maxRun };
}

/**
 * Trace a node: Pokey enters the entrance apron at a full run, takes off on every hit of the bars with that step's move, and a surface is
 * placed under each landing, widened for the clumsy thumb. Throws when the pattern can't be danced: a move still in the air at the next
 * hit, a jump that can't reach the height asked, a gap too small to be a jump, or a landing off screen at take-off.
 */
export function traceNode(spec: NodeSpec): Trace {
  const hits = gridHits(spec.bars);
  if (hits.length !== spec.steps.length) throw new Error(`${hits.length} hits in the bars, ${spec.steps.length} steps`);
  const beat = 60 / spec.bpm;
  const eighth = beat / 2;
  const hold = spec.easy ? EASY_HOLD : 1;
  // the grid starts as he reaches the end of the entrance apron, at a full run
  const gridX = spec.x + APRON;
  const t0 = APRON / PHYS.maxRun;
  const ledges: Ledge[] = [];
  const landings: Landing[] = [];
  const gaps: Trace['gaps'] = [];
  // the ledge he is on: where it starts, its surface
  let cur: Ledge = { x0: spec.x, x1: gridX, y: spec.y, surface: 'apron', step: -1 };
  let x = gridX, y = spec.y, t = t0;
  let prevSlot = 0;
  const safe: Array<Array<[number, number]>> = [];
  const walks: Trace['walks'] = [];
  /** what the avoided lines need, worked out once every ledge is known */
  const later: Array<{ step: number; move: Move; from: number; y: number; edge: number; dy: number }> = [];
  // (when and where his feet last came down: a run from there to the next take-off with no input is a walk)
  let landT = 0, landX = spec.x;
  for (let i = 0; i < hits.length; i++) {
    const h = hits[i], st = spec.steps[i];
    // run on the ledge to the hit
    const tHit = t0 + h.slot * eighth;
    if (tHit < t - 1e-6) throw new Error(`step ${i + 1} (slot ${h.slot}): still in the air from the last take-off (slot ${prevSlot}), ${((t - tHit) * 1000).toFixed(0)} ms late`);
    x += runFor(PHYS.maxRun, tHit - t).dx;
    t = tHit;
    if (tHit - landT > 1) walks.push({ x0: Math.round(landX), x1: Math.round(x), y, s: +(tHit - landT).toFixed(2) });
    const nominal = flight({ move: st.move, dy: st.dy, vx: PHYS.maxRun, hold });
    if (!nominal) throw new Error(`step ${i + 1}: a ${st.move} can't reach ${st.dy} px up`);
    // every try: take-off offsets, the slack's own early take-off, air shares, both slice sizes
    let shortX = Infinity, longX = -Infinity, lateX = x, earlyX = x;
    const toTry: Array<{ from: number; f: Flight }> = [];
    for (const tr of TRIES) {
      for (const dt of DTS) {
        const from = tr.off === 'slack' ? NaN : x + PHYS.maxRun * tr.off;
        const f = flight({ move: st.move, dy: st.dy, vx: PHYS.maxRun, air: tr.air, dt, hold: tr.short && st.move === 'jump' ? (spec.easy ? SHORT_HOLD.easy : SHORT_HOLD.normal) : hold });
        if (!f) throw new Error(`step ${i + 1}: a clumsy ${st.move} (air ${tr.air}) can't reach ${st.dy} px up`);
        toTry.push({ from, f });
        if (tr.off !== 'slack') {
          lateX = Math.max(lateX, from);
          earlyX = Math.min(earlyX, from);
        }
      }
    }
    // the take-off ledge runs 8 px past the latest take-off (and past the furthest landing on it: a late thumb lands there)
    const edge = Math.max(Math.round(lateX + INSIDE), cur.x1);
    // the slack's take-off: TAKEOFF_SLACK before the edge (never later than the early thumb's)
    const slackX = Math.min(earlyX, edge - TAKEOFF_SLACK);
    for (const tr of toTry) {
      const from = Number.isNaN(tr.from) ? slackX : tr.from;
      shortX = Math.min(shortX, from + tr.f.dx);
      longX = Math.max(longX, from + tr.f.dx);
    }
    let near = Math.round(shortX - INSIDE - SLOP);
    // (and never wider than the level check's own reach: its jump has no hang at the top and reaches less than the engine's, so a gap the
    // engine makes it may still fail the shared gate; levelCheck.ts gap <= reach x 0.97 - TAKEOFF_SLACK. A nearer edge only makes it easier)
    const wallUp = st.dy > 0 && (st.surface === 'stump' || st.surface === 'bank');
    // (Easy: the level check's held jump, 70%: validator easyHoldCheck; a double: its double reach. A jump the level check's model can't
    // make at all is refused here, so a builder sees it up front: w1-rhythm-b, 2026-11-04, a double up 110 px the check read as "Q")
    const dbl = st.move === 'double';
    const lcReach = spec.easy ? reachJumpHeld(st.dy, dbl) : reachJump(st.dy, dbl);
    if (lcReach < 0) throw new Error(`step ${i + 1}: the level check's ${st.move} can't reach ${st.dy} px up (levelCheck.ts reachJump)`);
    // (and FT_MARGIN inside it: the widest gap the check allows is one the first-timer's shortest flick misses every time, 0% at three
    // 115 px drops on 1-2, the validator's clumsy thumb and the fixed first-timer bot, 2026-11-04)
    const faced = !wallUp && (st.surface === 'stump' || st.surface === 'bank') ? spec.faceMargin ?? 0 : 0;
    if (!wallUp) near = Math.min(near, Math.floor(edge + lcReach * LC_MARGIN - TAKEOFF_SLACK - 2 - FT_MARGIN - faced));
    else if (near - edge > lcReach * LC_MARGIN - TAKEOFF_SLACK) throw new Error(`step ${i + 1}: the ${st.surface}'s face is ${near - edge} px out, past the level check's reach (${Math.round(lcReach * LC_MARGIN - TAKEOFF_SLACK)})`);
    const ny = y - st.dy;
    for (const tr of toTry) {
      const from = Number.isNaN(tr.from) ? slackX : tr.from;
      safe.push(tr.f.path.map(([px, py]) => [Math.round(from + px), Math.round(y - py)] as [number, number]));
    }
    later.push({ step: i, move: st.move, from: x, y, edge, dy: st.dy });
    // a rise: the late thumb's front stays short of the face, and every try's front clears its corner (a face is never bonked)
    const wall = st.surface === 'stump' || st.surface === 'bank';
    if (st.dy > 0 && wall) {
      if (st.surface === 'stump' && near < lateX + LAND_HALF + 2) throw new Error(`step ${i + 1}: the ${st.surface}'s face at ${near} is in the way of the latest take-off (${Math.round(lateX)})`);
      for (const tr of toTry) {
        const from = Number.isNaN(tr.from) ? slackX : tr.from;
        if (heightAt(tr.f, near - from) < st.dy - HOIST) throw new Error(`step ${i + 1}: a try from ${Math.round(from)} meets the face of the ${st.surface} at ${near} below its top`);
      }
    } else if (spec.noOverhang && st.dy > 0 && near < edge + 20) {
      // (a branch up over the end of the ledge he jumps from: he would stand under it, his head through it, and the level check reads
      // it as no way up)
      throw new Error(`step ${i + 1}: the ${st.surface} at ${near} hangs over the take-off ledge's end (${edge})`);
    } else if (st.dy <= 0 && near - edge < (st.dy === 0 ? MIN_GAP : 0)) throw new Error(`step ${i + 1}: the gap is ${near - edge} px: no jump at all (make it a drop, a rise, or a bigger move)`);
    // the landing on screen at take-off, from every take-off point (the planned one and the latest), upright and sideways
    for (const [name, v] of Object.entries(VIEWS)) {
      for (const from of [slackX, x, lateX]) {
        if (!landingInView(from, y, near, ny, v.vw, v.vh)) throw new Error(`step ${i + 1}: the landing at ${near} isn't on screen ${name} at take-off from ${Math.round(from)}`);
      }
    }
    cur.x1 = edge;
    // (a stump stands on the ledge he jumps from: that ledge runs on to its face, no gap)
    if (st.surface === 'stump' && st.dy > 0) cur.x1 = Math.max(edge, near);
    // (never a sliver: a short pad grows back toward the last gap, which must stay a jump)
    if (cur.x1 - cur.x0 < MIN_LEDGE && cur.surface !== 'apron') {
      cur.x0 = cur.x1 - MIN_LEDGE;
      const g = gaps[gaps.length - 1];
      if (g && g.step === i - 1) {
        g.x1 = cur.x0;
        if (g.x1 - g.x0 < MIN_GAP && cur.y === ledges[ledges.length - 1]?.y) throw new Error(`step ${i}: its pad is too short to land on and the gap before it closes up`);
      }
    }
    ledges.push(cur);
    if (near > cur.x1) gaps.push({ x0: cur.x1, x1: near, step: i });
    // the same gap four times running is a pattern the thumb stops reading (research 11-04 line 585)
    if (gaps.length >= GAP_REPEAT) {
      const run = gaps.slice(-GAP_REPEAT);
      const same = run.every((g, k) => k === 0 || (g.step === run[k - 1].step + 1 && spec.steps[g.step].move === spec.steps[run[0].step].move && spec.steps[g.step].dy === spec.steps[run[0].step].dy && Math.abs(g.x1 - g.x0 - (run[0].x1 - run[0].x0)) <= GAP_SAME));
      if (same) throw new Error(`steps ${run[0].step + 1}-${i + 1}: the same gap (${run[0].x1 - run[0].x0} px, a ${st.move}, ${st.dy} px up) ${GAP_REPEAT} times in a row`);
    }
    landings.push({ step: i, hit: h.hit, move: st.move, slot: h.slot, t: tHit, fromX: Math.round(x), fromY: y, toX: Math.round(x + nominal.dx), toY: ny, air: +nominal.t.toFixed(3), shortX: Math.round(shortX), longX: Math.round(longX), lateX: Math.round(lateX) });
    // on to the landing
    x += nominal.dx;
    y = ny;
    t += nominal.t;
    prevSlot = h.slot;
    landT = t;
    landX = x;
    cur = { x0: near, x1: Math.round(Math.max(longX, x)) + INSIDE, y, surface: st.surface, step: i };
  }
  // the exit apron: the last surface carries on flat for APRON px past where he would take off next
  const barsEnd = t0 + spec.bars.length * 8 * eighth;
  if (barsEnd > t) {
    x += runFor(PHYS.maxRun, barsEnd - t).dx;
    t = barsEnd;
  }
  cur.x1 = Math.max(cur.x1, Math.round(x));
  ledges.push(cur);
  const out: Ledge = { x0: cur.x1, x1: cur.x1 + APRON, y, surface: 'apron', step: -2 };
  // (an exit apron at the last surface's height continues it: one ledge, flat and safe)
  if (cur.surface === 'bank' || cur.surface === 'branch') cur.x1 = out.x1;
  else ledges.push(out);
  t += APRON / PHYS.maxRun;
  if (t - landT > 1) walks.push({ x0: Math.round(landX), x1: out.x1, y, s: +(t - landT).toFixed(2) });
  const avoided: Avoided[] = [];
  for (const a of later) {
    // the beat taken a whole beat early; the beat skipped (off the end, holding the way on); a hop held; a jump let go
    avoided.push({ kind: 'early', step: a.step, path: freePath(ledges, a.from - PHYS.maxRun * beat, a.y, a.move, hold) });
    avoided.push({ kind: 'skip', step: a.step, path: freePath(ledges, a.edge, a.y, null, hold) });
    if (a.move === 'hop') avoided.push({ kind: 'held', step: a.step, path: freePath(ledges, a.from, a.y, 'jump', hold) });
    else avoided.push({ kind: 'tapped', step: a.step, path: freePath(ledges, a.from, a.y, 'hop', hold) });
  }
  return {
    bpm: spec.bpm,
    beat,
    ledges,
    landings,
    gaps,
    checkpoint: { x: spec.x + APRON / 2, y: spec.y },
    x0: spec.x,
    x1: out.x1,
    yOut: y,
    seconds: +t.toFixed(2),
    density: +(hits.length / (spec.bars.length * 8 * eighth)).toFixed(3),
    avoided,
    safe,
    walks,
  };
}

/**
 * His feet's path from (x, y) holding the way on: a jump of `move`, or none (`null`: running off the end of the ledge he is on), until
 * the feet come down onto a ledge or are 300 px under the lowest one (the engine's rules, as `flight`)
 */
function freePath(ledges: readonly Ledge[], x0: number, y0: number, move: Move | null, hold: number): Array<[number, number]> {
  const lowest = Math.max(...ledges.map((q) => q.y));
  let x = x0, y = y0, vx = PHYS.maxRun, vy = move ? -PHYS.jumpV * Math.sqrt(hold) : 0;
  const held = move === 'hop' ? HOP_HOLD : move ? Infinity : 0;
  let doubled = move !== 'double';
  const path: Array<[number, number]> = [[Math.round(x), Math.round(y)]];
  // (a run-off starts on the ledge: it is on the ground until past the ledge's end)
  const start = move ? null : ledges.find((q) => x0 >= q.x0 - 1 && x0 <= q.x1 + 1 && Math.abs(q.y - y0) < 1);
  for (let t = 0; t < 4; t += STEP) {
    const on = Math.floor(t / FRAME + 1e-9) * FRAME < held;
    if (!doubled && vy >= 0) {
      vy = secondJumpV(vy, PHYS.doubleV);
      doubled = true;
    }
    if (!on && vy < -PHYS.cutV) vy = -PHYS.cutV;
    let g = vy < 0 ? PHYS.gravUp : PHYS.gravDown;
    if (on && Math.abs(vy) < 90) g *= 0.72;
    const prev = y;
    if (!(start && x <= start.x1)) vy = Math.min(PHYS.maxFall, vy + g * STEP);
    x += vx * STEP;
    y += vy * STEP;
    // (a face in the way stops him: he slides down it)
    const face = ledges.find((q) => x + LAND_HALF >= q.x0 && x < q.x0 && y > q.y + 2 && prev > q.y - 200 && (q.surface === 'stump' || q.surface === 'bank' || q.surface === 'apron'));
    if (face) x = face.x0 - LAND_HALF;
    path.push([Math.round(x), Math.round(y)]);
    if (vy > 0 && ledges.some((q) => x >= q.x0 && x <= q.x1 && prev <= q.y && y >= q.y && !(start && q === start && x <= start.x1))) break;
    if (y > lowest + 300) break;
  }
  return path;
}

/** a place for a hazard on an avoided line: where his body's middle would be (x, y), and his feet there */
export interface HazardSpot {
  kind: Avoided['kind'];
  step: number;
  x: number;
  y: number;
  feetY: number;
}
/**
 * Places on the avoided lines where a hazard (a thorn overhang, a snake, a pit's teeth) catches the player who took that line and never
 * the one who moved on the beat: his body there (heroBox) is clear, by HAZARD_CLEAR px, of his body on every safe try and on every run
 * along a ledge. Sampled every `every` px along each line.
 */
export function hazardSpots(tr: Trace, kinds: ReadonlyArray<Avoided['kind']> = ['early', 'skip', 'held', 'tapped'], every = 30): HazardSpot[] {
  const C = HAZARD_CLEAR;
  const boxes: Array<{ x0: number; x1: number; y0: number; y1: number }> = [];
  for (const path of tr.safe) for (const [px, py] of path) { const b = heroBox(px, py); boxes.push(b); }
  for (const q of tr.ledges) boxes.push({ x0: q.x0 - 28, x1: q.x1 + 28, y0: q.y - 116, y1: q.y + 12 });
  const clear = (b: { x0: number; x1: number; y0: number; y1: number }) =>
    boxes.every((o) => b.x1 + C <= o.x0 || b.x0 - C >= o.x1 || b.y1 + C <= o.y0 || b.y0 - C >= o.y1);
  const out: HazardSpot[] = [];
  for (const a of tr.avoided) {
    if (!kinds.includes(a.kind)) continue;
    let lastX = -Infinity;
    for (const [px, py] of a.path) {
      if (px - lastX < every) continue;
      lastX = px;
      // (inside a ledge is no place for anything)
      if (tr.ledges.some((q) => px >= q.x0 && px <= q.x1 && py > q.y + 4 && py < q.y + (q.surface === 'branch' || q.surface === 'crumble' ? 24 : q.surface === 'bank' ? 90 : 2000))) continue;
      if (clear(heroBox(px, py))) out.push({ kind: a.kind, step: a.step, x: px, y: py - 52, feetY: py });
    }
  }
  return out;
}

/** the runs in a trace with no input longer than `max` s (dead walks: fill them with a slope, a hop or a critter) */
export const deadWalks = (tr: Trace, max = DEAD_WALK) => tr.walks.filter((w) => w.s > max);

// ------------------------------------------------------------------ checks ------------------------------------------------------------------

/**
 * Re-check a trace from its ledges alone, the way a player meets them: from each take-off, every try (TRIES, both slice sizes) lands at
 * least INSIDE px onto the next ledge and no further than INSIDE px short of its end, and the late take-off is still on its ledge.
 * Returns the problems (empty: fine).
 */
export function checkTrace(tr: Trace, steps: readonly Step[], easy = false): string[] {
  const bad: string[] = [];
  const hold = easy ? EASY_HOLD : 1;
  for (const l of tr.landings) {
    const st = steps[l.step];
    const to = tr.ledges.find((q) => q.step === l.step);
    const from = tr.ledges.find((q) => q.x1 >= l.fromX - 1 && q.x0 <= l.fromX + 1 && Math.abs(q.y - l.fromY) < 1);
    if (!to || !from) {
      bad.push(`step ${l.step + 1}: no ledge under the take-off or the landing`);
      continue;
    }
    const late = l.fromX + PHYS.maxRun * CLUMSY.late;
    if (late > from.x1 - INSIDE + 1) bad.push(`step ${l.step + 1}: a late take-off at ${Math.round(late)} is off the ledge (ends ${from.x1})`);
    for (const tr of TRIES) {
      const sx = tr.off === 'slack' ? Math.min(l.fromX - PHYS.maxRun * CLUMSY.late, from.x1 - TAKEOFF_SLACK) : l.fromX + PHYS.maxRun * tr.off;
      for (const dt of DTS) {
        const f = flight({ move: st.move, dy: st.dy, vx: PHYS.maxRun, air: tr.air, dt, hold: tr.short && st.move === 'jump' ? (easy ? SHORT_HOLD.easy : SHORT_HOLD.normal) : hold });
        if (!f) {
          bad.push(`step ${l.step + 1}: no landing (air ${tr.air}, dt ${dt.toFixed(3)})`);
          continue;
        }
        const lx = sx + f.dx;
        if (lx < to.x0 + INSIDE - 1) bad.push(`step ${l.step + 1}: lands at ${Math.round(lx)}, less than ${INSIDE} px inside ${to.x0} (from ${Math.round(sx)}, air ${tr.air})`);
        if (lx > to.x1 - INSIDE + 1) bad.push(`step ${l.step + 1}: lands at ${Math.round(lx)}, past the ledge's end ${to.x1}`);
      }
    }
  }
  return bad;
}

// ------------------------------------------------------------------ the stage's tempo ------------------------------------------------------------------

const bpmMemo = new Map<string, number>();
/**
 * The stage's beat: the BPM of the music it plays (W1-REBUILD-PLAN.md, the lead, 2026-11-04: "the beat is the music's beat"), read from
 * the music code (audio/scenes.ts stageBeatBpm: the piece and tempo salt 0 picks, themeById(id).bpm x tempo), never typed. Every
 * session's music then plays at this beat on a beat stage, whatever piece its salt picks (scenes.ts stageMusic, BEAT_STAGES).
 */
export function stageBpm(cfg: { worldIndex: number; id: string; miniIndex: number; objectiveType?: string }): number {
  const key = `${cfg.worldIndex}|${cfg.id}|${cfg.miniIndex}|${cfg.objectiveType}`;
  const hit = bpmMemo.get(key);
  if (hit !== undefined) return hit;
  const raw = BEAT_STAGES.has(cfg.id) ? stageBeatBpm(cfg.worldIndex, cfg.id, cfg.miniIndex, cfg.objectiveType) : NaN;
  let bpm = raw;
  if (!(raw > 0)) {
    // (a stage not built on the beat: the speed its music plays at with salt 0)
    const m = stageMusic(cfg.worldIndex, cfg.id, cfg.miniIndex, 0, cfg.objectiveType);
    const th = themeById(m.id);
    if (!th) throw new Error(`no theme ${m.id} for ${cfg.id}`);
    bpm = th.bpm * (m.tempo ?? 1);
  }
  bpm = Math.round(bpm * 10) / 10;
  bpmMemo.set(key, bpm);
  return bpm;
}

/**
 * Easy's version of a node (STAGE-RULES §0.5: "Easy should be just a casual play"; §2 "Easy jumps": no Easy jump needs a full hold):
 * the same beats and moves, every rise cut to what a 70% hold climbs, traced with the 70% thumb (so its pads also start sooner). The
 * tracer's limits (measured): a face (stump or bank) up to 70 px on Normal and 42 on Easy; a branch up to 90 on both.
 */
export function easyNode(spec: NodeSpec): NodeSpec {
  // (a face to clear, a stump or a bank, comes down to 60%: at 70% the late thumb meets its corner; a thin branch, which he passes up
  // through, to 70%)
  return { ...spec, easy: true, steps: spec.steps.map((s) => (s.dy > 0 ? { ...s, dy: Math.round(s.dy * (s.surface === 'stump' || s.surface === 'bank' ? 0.6 : EASY_HOLD)) } : s)) };
}
