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
 */
import { LAND_HALF, PHYS, TAKEOFF_SLACK, secondJumpV } from './physics.ts';
import { AHEAD, heroBox, landingBox } from './cameraFollow.ts';

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
/** a face's corner may be met this far under its top (px): the engine hoists him onto a lip up to FORGIVE.mantle (26) over his feet;
 *  the tracer counts only half of that */
export const HOIST = 13;
/** a gap narrower than this is no jump at all (px): the tracer refuses it */
export const MIN_GAP = 40;
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
export const TRIES: ReadonlyArray<{ off: number | 'slack'; air: number }> = [
  { off: 0, air: 1 },
  { off: CLUMSY.late, air: 1 },
  { off: 0, air: CLUMSY.air },
  { off: CLUMSY.late, air: CLUMSY.air },
  { off: -CLUMSY.late, air: 1 },
  { off: 'slack', air: 1 },
];
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
  for (let i = 0; i < hits.length; i++) {
    const h = hits[i], st = spec.steps[i];
    // run on the ledge to the hit
    const tHit = t0 + h.slot * eighth;
    if (tHit < t - 1e-6) throw new Error(`step ${i + 1} (slot ${h.slot}): still in the air from the last take-off (slot ${prevSlot}), ${((t - tHit) * 1000).toFixed(0)} ms late`);
    x += runFor(PHYS.maxRun, tHit - t).dx;
    t = tHit;
    const nominal = flight({ move: st.move, dy: st.dy, vx: PHYS.maxRun, hold });
    if (!nominal) throw new Error(`step ${i + 1}: a ${st.move} can't reach ${st.dy} px up`);
    // every try: take-off offsets, the slack's own early take-off, air shares, both slice sizes
    let shortX = Infinity, longX = -Infinity, lateX = x, earlyX = x;
    const toTry: Array<{ from: number; f: Flight }> = [];
    for (const tr of TRIES) {
      for (const dt of DTS) {
        const from = tr.off === 'slack' ? NaN : x + PHYS.maxRun * tr.off;
        const f = flight({ move: st.move, dy: st.dy, vx: PHYS.maxRun, air: tr.air, dt, hold });
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
    const near = Math.round(shortX - INSIDE - SLOP);
    const ny = y - st.dy;
    // a rise: the late thumb's front stays short of the face, and every try's front clears its corner (a face is never bonked)
    const wall = st.surface === 'stump' || st.surface === 'bank';
    if (st.dy > 0 && wall) {
      if (st.surface === 'stump' && near < lateX + LAND_HALF + 2) throw new Error(`step ${i + 1}: the ${st.surface}'s face at ${near} is in the way of the latest take-off (${Math.round(lateX)})`);
      for (const tr of toTry) {
        const from = Number.isNaN(tr.from) ? slackX : tr.from;
        if (heightAt(tr.f, near - from) < st.dy - HOIST) throw new Error(`step ${i + 1}: a try from ${Math.round(from)} meets the face of the ${st.surface} at ${near} below its top`);
      }
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
    landings.push({ step: i, hit: h.hit, move: st.move, slot: h.slot, t: tHit, fromX: Math.round(x), fromY: y, toX: Math.round(x + nominal.dx), toY: ny, air: +nominal.t.toFixed(3), shortX: Math.round(shortX), longX: Math.round(longX), lateX: Math.round(lateX) });
    // on to the landing
    x += nominal.dx;
    y = ny;
    t += nominal.t;
    prevSlot = h.slot;
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
  };
}

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
        const f = flight({ move: st.move, dy: st.dy, vx: PHYS.maxRun, air: tr.air, dt, hold });
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

// ------------------------------------------------------------------ World 1's tempo ------------------------------------------------------------------

/**
 * World 1's tempo (w1-rhythm's proposal, 2026-11-04, for the lead): home 92 BPM. Why: a full jump on the flat is in the air 0.63 s
 * (physics.ts JUMP_AIRTIME), and at 92 BPM a beat is 0.652 s, so a jump taken on a beat comes down just before the next one: the
 * landing is on the pulse, which is what makes a run feel danced. A hop (about 0.3 s) fills an eighth, and a double jump (about 1.1 s)
 * fills a half-note. The research's range is 85 (World 2, relaxed) to 130 (World 10); 92 sits in its "low 90s" for a first world. Stages
 * vary around it so neighbours never share a tempo (STAGE-RULES §0b.6).
 */
export const W1_BPM = { home: 92, '1-2': 88, '1-5': 96 } as const;

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
