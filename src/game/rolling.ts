/**
 * rolling — the rolling nut and the bouncing fruit (1-8.md NEW 2; any world lays it by data, run by pieces/rollingPiece.ts).
 *
 * One hazard, two heights, read at a glance: LOW, a small nut that drops in ahead and rolls at him along the ground (tap: hop it);
 * HIGH, a big fruit that drops in and bounces at him in tall arcs, its shadow on the ground under it (do nothing: run under it).
 * Each is set off by HIS x, never a clock: when he comes within `rollAhead(spec)` of where it lands, it drops in from above (the
 * drop and the thunk as it lands are the tell, `ROLL.tell` s, at least TELL_MIN) and only then comes at him, always slower than his
 * run. The ahead distance is sized so the whole tell, drop to reaching him at a full run, is `ROLL.seen` s or more (1-8.md "on an
 * upright screen 1 s+ before it reaches him"; the chase camera's lead shows that far ahead, cameraFollow.ts chaseLead).
 *
 * The fruit's arc is PHASED to him: at each bounce it picks its pace across (within its row's band) so the moment it meets him,
 * if he keeps doing what he is doing, falls in the middle of an arc, where its bottom is `bounce` px up: over his drawn head by
 * ROLL.headClear or more (1-8.md: "through his hair reads as a hit"). Jumping into it, or stopping dead under a landing, meets it.
 *
 * What a touch costs: before a stage's first crack (a teach, 1-8.md beats 1-2, Pitfall's log) only a bump, no heart; after it, a
 * heart through the engine's one damagePlayer (its safe time, its knock away). `teach` on the spec says so outright; unset, it is
 * worked out from the stage's chase (`rollTeaches`). Either way a hazard that has touched him once is spent: it rolls on harmless.
 *
 * Pure (no canvas, no engine, no stage ids): the piece, the bots and the tests agree on every hazard.
 */
import { PHYS } from './physics.ts';
import type { ChaseLay } from './chase.ts';
import type { Platform } from './types.ts';

export type RollKind = 'low' | 'high';

/** one hazard as a stage lays it */
export interface RollSpec {
  kind: RollKind;
  /** where it lands (world x); it drops in from above there, set off by his x (`rollAhead`) */
  dropX: number;
  /** its pace across the ground at him (px/s), under his run (PHYS.maxRun) */
  speed: number;
  /** low: the little rattle as it lands (px, under ROLL.lowBounceMax); high: the top of each arc, its bottom above the ground (px) */
  bounce: number;
  /** a teach: a touch only bumps him, no heart. Unset: before the stage's first crack it teaches, after it a heart (`rollTeaches`) */
  teach?: boolean;
}

export const ROLL = {
  /** the drop-in, from above to the thunk (s): the tell. TELL_MIN 0.5 (1-8.md). 0.8: the drop is most of the second he needs, so it is
   *  set off nearer (350-360 px ahead at a full run, not 378 at 0.6), which an upright 390 px phone's chase view shows (chaseCamera.test) */
  tell: 0.8,
  /** drop to reaching him at his full run, at least this (s): what the camera's lead must show ahead (1-8.md, B4 packet b) */
  seen: 1.0,
  /** after the thunk it rolls at least this long (s) before it reaches him at a full run: the thunk is heard before the hop is due */
  after: 0.15,
  /** where the drop starts: this far over the ground at most (px of world: 480 in 0.8 s falls as a thing falls, 1,500 px/s/s); never
   *  over the HUD band (the piece clamps to the view, so sideways it starts lower and falls slower over the same tell) */
  dropH: 480,
  /** its radius (px of world): the nut 30 across (a third of his drawn 89.1: small), the fruit 42 (half of him: big) */
  lowR: 15,
  highR: 21,
  /** its fall off a ledge (px/s/s) and the fastest it falls */
  grav: 1500,
  maxFall: 950,
  /** his drawn head is 89.1 px over his feet (D41); the fruit's bottom passes this much over it at the top of its arc */
  head: 89.1,
  headClear: 15,
  /** the nut's rattle never higher than this (px): a hop always clears it */
  lowBounceMax: 24,
  /** a fruit's pace across, phased, stays within this share of its own `speed` (0: it may bounce on the spot a moment, never back up the slope) */
  phaseLo: 0,
  phaseHi: 2.4,
  /** and eases to the pace it wants by at most this (px/s/s) */
  phaseAcc: 1200,
  /** the bump of a teach (px/s): back from it and a little up; no heart, no safe time */
  bumpVx: 170,
  bumpVy: 300,
  /** gone once it is this far behind him (px), or under the stage's pit line */
  behindGone: 1400,
  /** the nut is touched inside this share of its drawn round: a tap (one frame's flick, 30 px up at its top: engine.ts cutV) timed as
   *  it closes clears it, a held hop clears it easily (rolling.test.ts measures the tap's window) */
  lowHit: 0.75,
  /** his box's half width (px: engine.ts, 44 across) */
  halfW: 22,
  /** a touch: his box shrunk this much each side (px), so a graze through his fur is no touch */
  forgive: 4,
} as const;

/** Easy (1-8.md: "nuts 2.5 s+ apart, the fruit's arc higher and slower"): its pace this share, the drop this much longer, the arc this
 *  much higher, seen this long before it reaches him at a full run. B5's numbers: the Designer may tune them (as CHASE_ROWS.easy). An
 *  upright 390 px phone's chase view shows about 1.1 s at a full run (chaseCamera.test.ts): Easy's extra is in the slower pace and the
 *  lay's spacing, not a longer sight line. The spacing is the lay's (the builder's) */
export const ROLL_EASY = { speed: 0.8, tell: 1.15, bounce: 1.15, seen: 1.1 } as const;

export const rollRadius = (kind: RollKind): number => (kind === 'low' ? ROLL.lowR : ROLL.highR);

/** this setting's tell (s) */
export const rollTell = (easy: boolean): number => ROLL.tell * (easy ? ROLL_EASY.tell : 1);

/** this setting's pace (px/s) and arc (px) for a spec */
export function rollRow(spec: RollSpec, easy: boolean): { speed: number; bounce: number } {
  if (!easy) return { speed: spec.speed, bounce: spec.bounce };
  return { speed: spec.speed * ROLL_EASY.speed, bounce: spec.kind === 'high' ? spec.bounce * ROLL_EASY.bounce : spec.bounce };
}

/**
 * how far ahead of his middle it is set off (px): at his full run the drop (`tell` s, it falls straight down) and then the closing at
 * his run plus its pace take `ROLL.seen` s or more before it reaches his box
 */
export function rollAhead(spec: RollSpec, easy = false): number {
  const tell = rollTell(easy);
  const { speed } = rollRow(spec, easy);
  // (and never so near that it lands at his feet: after the thunk it still rolls ROLL.after s before it reaches him)
  const seen = Math.max(easy ? ROLL_EASY.seen : ROLL.seen, tell + ROLL.after);
  return Math.ceil(PHYS.maxRun * tell + (PHYS.maxRun + speed) * (seen - tell) + rollRadius(spec.kind) + 22);
}

/** the farthest any of these is set off ahead of him (the chase camera's lead must show this much), Normal and Easy */
export function rollAheadMax(specs: readonly RollSpec[]): number {
  let m = 0;
  for (const s of specs) m = Math.max(m, rollAhead(s, false), rollAhead(s, true));
  return m;
}

/** a teach (a bump, no heart): said outright, or before the stage's first crack (its first stretch's start) */
export function rollTeaches(spec: RollSpec, chase: ChaseLay | undefined): boolean {
  if (spec.teach !== undefined) return spec.teach;
  const first = chase?.stretches[0];
  return !!first && spec.dropX < first.start;
}

/** the bottom of a fruit's arc over the ground at `t` s into an arc of top `bounce` (px; 0 at the ground) */
export function arcHeight(bounce: number, t: number): number {
  const T = arcTime(bounce);
  const tt = Math.max(0, Math.min(T, t));
  return Math.max(0, Math.sqrt(2 * ROLL.grav * bounce) * tt - 0.5 * ROLL.grav * tt * tt);
}

/** one arc's time in the air (s) */
export const arcTime = (bounce: number): number => 2 * Math.sqrt((2 * Math.max(0, bounce)) / ROLL.grav);

/**
 * the fruit's pace across (px/s, signed): it meets him (his middle at `px`, moving `pvx`) in the middle of an arc, the first that reaches
 * him, if he keeps his pace; `dir` is the way it goes (toward him), `speed` its own pace, `into` how far it is into its current arc (s).
 * Within its band. The piece asks again every step in the air and eases toward the answer (ROLL.phaseAcc), so a stop, a start or a
 * thumb on and off under it is followed, never a sudden swerve
 */
export function phasedPace(fx: number, px: number, pvx: number, dir: -1 | 1, speed: number, bounce: number, into = 0): number {
  const lo = speed * ROLL.phaseLo, hi = speed * ROLL.phaseHi;
  const T = arcTime(bounce);
  const rel = px - fx;
  const base = dir * speed;
  const close0 = base - pvx;
  // (moving apart, or level: its own pace)
  if (T <= 0 || rel * close0 <= 0) return base;
  const t0 = rel / close0;
  const close = fruitClose(bounce);
  // (the middles it could meet him at: this arc's, the next, the one after; the one its band reaches, nearest its own pace)
  let k = Math.floor((into + t0) / T);
  if ((k + 0.5) * T - into <= 0.05) k++;
  let best = base, miss = Infinity;
  for (let j = 0; j < 3; j++) {
    const want = (k + j + 0.5) * T - into;
    if (want <= 0.05) continue;
    const mag = (pvx + rel / want) * dir;
    // (out of its band, or closing on him too slowly: low at the end of an arc it would still be beside him)
    const m = (mag < lo ? lo - mag : mag > hi ? mag - hi : 0) + Math.max(0, close - Math.abs(rel) / want);
    const score = m * 1000 + Math.abs(mag - speed);
    if (score < miss) {
      miss = score;
      best = dir * Math.max(lo, Math.min(hi, mag));
    }
  }
  return best;
}

/**
 * the slowest a fruit may close on him (px/s): from the middle of its arc to where its bottom drops under his drawn head it must have
 * moved past his body (its radius and his half width, less the forgiveness), or it lands beside him still low
 */
export function fruitClose(bounce: number): number {
  const room = bounce - ROLL.head;
  if (room <= 0) return Infinity;
  return (ROLL.highR + ROLL.halfW - ROLL.forgive) / Math.sqrt((2 * room) / ROLL.grav);
}

/** a spec that cannot run fair, by name (the lay's check and the piece's start call this one function) */
export function rollProblems(specs: readonly RollSpec[]): string[] {
  const out: string[] = [];
  const clearMin = ROLL.head + ROLL.headClear;
  for (const s of specs) {
    const at = `${s.kind} at x ${Math.round(s.dropX)}`;
    if (s.kind !== 'low' && s.kind !== 'high') out.push(`${at}: no such kind`);
    if (!Number.isFinite(s.dropX)) out.push(`${at}: no drop x`);
    if (!(s.speed > 0) || s.speed >= PHYS.maxRun) out.push(`${at}: pace ${s.speed} px/s is not under his run (${PHYS.maxRun})`);
    if (s.kind === 'low' && (s.bounce < 0 || s.bounce > ROLL.lowBounceMax)) out.push(`${at}: a nut's rattle of ${s.bounce} px is not a hop (0-${ROLL.lowBounceMax})`);
    if (s.kind === 'high' && s.bounce < clearMin) out.push(`${at}: an arc of ${s.bounce} px passes through his head (it must clear ${clearMin.toFixed(1)})`);
  }
  return out;
}

/** what stands in a hazard's run-in, from its farthest set-off (Normal or Easy) to where it lands: every wall on it, the first gap */
export function runIn<P extends Pick<Platform, 'x' | 'y' | 'width' | 'height' | 'type'>>(s: RollSpec, plats: readonly P[]): { land: number | null; walls: P[]; gapAt: number | null } {
  const solid = plats.filter((p) => p.type === 'solid');
  const from = s.dropX - Math.max(rollAhead(s, false), rollAhead(s, true));
  const at = solid.filter((p) => s.dropX >= p.x && s.dropX <= p.x + p.width);
  if (!at.length) return { land: null, walls: [], gapAt: null };
  // (where it lands: the ground's top there, the lowest top under it when a rock stands on the ground)
  const land = at.reduce((m, p) => Math.max(m, p.y), -Infinity);
  const walls: P[] = [];
  for (let x = from; x <= s.dropX; x += 10) {
    const here = solid.filter((p) => x >= p.x && x <= p.x + p.width);
    if (!here.length) return { land, walls, gapAt: x };
    for (const p of here) if (p.y < land - 12 && p.y + p.height >= land - 4 && !walls.includes(p)) walls.push(p);
  }
  return { land, walls, gapAt: null };
}

/**
 * a hazard laid where its run-in is not plain ground, by name: from where it is set off (its farthest, Normal or Easy) to where it lands
 * there must be ground under every step, and no wall standing on it (a rock or a step he must hop: a nut would roll through it, and his
 * hop for the rock is a second threat on the same beat, 1-8.md "one threat at a time")
 */
export function rollGroundProblems(specs: readonly RollSpec[], plats: readonly Pick<Platform, 'x' | 'y' | 'width' | 'height' | 'type'>[]): string[] {
  const out: string[] = [];
  for (const s of specs) {
    const r = runIn(s, plats);
    const at = `${s.kind} at x ${Math.round(s.dropX)}`;
    if (r.land === null) out.push(`${at}: no ground where it lands`);
    else if (r.gapAt !== null) out.push(`${at}: a gap at x ${Math.round(r.gapAt)} in its run-in`);
    else if (r.walls.length) out.push(`${at}: a wall at x ${Math.round(r.walls[0].x)} in its run-in`);
  }
  return out;
}
