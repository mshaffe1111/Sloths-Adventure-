/**
 * gen2/pipeline — the new stage generator's six passes (DESIGN.md), deterministic from a seed:
 *
 *   1 planBudget      what the stage must be: seconds, D(world, stage) in the world's band, margins, threat, quotas (Easy vs Normal)
 *   2 missionGraph    the stage's beats from its archetype: a Kishotenketsu sawtooth of nodes, each a share of the clock
 *   3 layStage        sections picked per node (shuffle bag + cooldown + corridor clamp) and stitched exit anchor -> entry anchor,
 *                     every seam and every inner jump sized from the jump envelope (maxGap): beatable by construction
 *   4 fillSockets     sockets filled: linked source/receptor pairs first, props, creatures by threat budget and Poisson spacing,
 *                     pickups, flags, Dot's tips, quota items, petal arcs over the jumps
 *   5 checkAndRepair  levelCheck (+ puzzleCheck through it); local repair first (a stone in a seam, a stray pickup or animal taken
 *                     out, one section swapped), a whole re-roll only when that fails; then the time model (stageTime.ts)
 *   6 dress           the world's decor sets, rotated by the roll (artRoll.ts), the beats for the inspector
 *
 * The result is a GeneratedStage (what the engine already plays) with the hand-built stages' proto extras, and `gen2` (what was built).
 * Same seed, same stage; Easy and Normal share the seed AND the section sequence (Normal picks, Easy lays the same picks by its rules).
 */
import { rollLook } from '../artRoll.ts';
import { hollowLogSize } from '../w1NewArt.ts';
import { doubleAllowed, jumpOK, SAFE_APPROACH, swingLandings, validateStage } from '../levelCheck.ts';
import { JUMP_CLEAR, jumpEdges } from '../stageMetrics.ts';
import { BANDS, bounceLipOverCap, CAP_UP, gapEnvelope, judgedOnArcs, linkArcs, lesserArcs, riseEnvelope, BLOCK_H, SPARE } from './reach.ts';
import { classify, headroomOf, judgeRoll, NOT_JUDGED_ALL, TAUGHT, verdictLines, type Judged11 } from './verdicts.ts';
import { PROMISES_11, realFalls } from './promises11.ts';
import { repairLandings } from './landings.ts';
import { findW1Pits } from '../w1Pits.ts';
import type { Drop, JudgedStage } from './verdicts.types.ts';
import { DOUBLE_RISE, JUMP_RISE, PHYS, pressWindow, reachGlide, reachJump, setTimedSwing, TAKEOFF_SLACK, TIMED, WALL_H } from '../physics.ts';
import { skillGuaranteedAt } from '../skills.ts';
import { endAboveWindow, WINDOW_AT } from '../storyChecks.ts';
import { addKitPlatforms, type Anchor, type PieceSpec, type RoomSpec, type Wire } from '../puzzleKit.ts';
import type { ProtoExtras, StageHint } from '../protoStage.ts';
import { trapFaults } from '../dropTrap.ts';
import type { GeneratedStage } from '../stageGenerator.ts';
import { fastFloor, MODEL_FAST, MODEL_TYPICAL, modelStage, targetSeconds, TIME, walkSpeed, type ModelParams } from '../stageTime.ts';
import type { Collectible, Enemy, LevelConfig, Platform, Rope, Vine } from '../types.ts';
import { ROPE_MIN_GAP, ROPE_OVERLAP, ROPE_RISE } from '../rope.ts';
import { CRUMBLE_TILE_W, crumbleTime, tideCrossTime, type Zone } from '../zones.ts';
import { CooldownQueue, pickWeighted, poissonPlace, ShuffleBag, WorldOnce, type RoutePiece } from './variety.ts';
import { checkCode, formatToken, JOB_OF, LETTER_OF, MARK_OF, parseCode, type CodeToken } from './nodeCode.ts';
import {
  EASY_ENEMY_SHARE,
  EASY_LANDING,
  LIANA,
  MARGIN,
  QUIET,
  TIDE,
  versionKey,
  WATER_LINE,
  WATER_WARN,
  type PitKind,
  type SectionPiece,
  type Archetype,
  type BuildRequest,
  type CreatureDef,
  type Difficulty,
  type FilledSocket,
  type Gen2Meta,
  type Gen2Stage,
  type LianaSwing,
  type LocalAnchor,
  type LocalRoomSpec,
  type MissionGraph,
  type MissionNode,
  type NodeJob,
  type NodeShape,
  type NodeDials,
  type GraphBrief,
  type ContentType,
  type Move,
  type Phase,
  type PlacedSection,
  type PlanSlot,
  type PortKind,
  type Range,
  type Repair,
  type Rng,
  type SectionTemplate,
  type Socket,
  type StageBudget,
  type StageSink,
  type WorldKit,
  type WorldManifest,
} from './types.ts';

// ───────────────────────────── seeded numbers ─────────────────────────────

/** a seeded stream (mulberry32) from a seed and any salts: the same numbers give the same stream */
export function rngFor(seed: number, ...salts: number[]): Rng {
  let a = (Math.imul(seed | 0, 0x9e3779b1) ^ 0x2545f491) >>> 0;
  for (const s of salts) a = (Math.imul(a ^ (s | 0), 0x85ebca77) + 0x6d2b79f5) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
/** a number from a Range */
export const roll = (rng: Rng, r: Range): number => (typeof r === 'number' ? r : r[0] + (r[1] - r[0]) * rng());
const mid = (r: Range): number => (typeof r === 'number' ? r : (r[0] + r[1]) / 2);
const R = Math.round;
/** a crumbling ruin tile's thickness: the painted slab's (crumbleArt.ts draws it 46 px deep, its hanging moss not solid), so nothing
 *  stands in the air under it or clips through it */
const CRUMBLE_H = 40;

// ───────────────────────────── the jump envelope ─────────────────────────────

/**
 * The widest gap a required jump may have (px between the edges), for a target `dyUp` px higher (negative: lower), with one jump or
 * two: `margin` of the physical reach (Gemini D2: 0.65 Easy, 0.82 Normal), and never more than what levelCheck accepts (its 0.97 and
 * the 70 px take-off slack), so a gap laid from it always validates. -1 when no jump of that kind gets that high.
 */
/** how high a mushroom's bounce carries him over its cap (px): the bounce's own rise (bounceV), then the one air jump it leaves him
 *  (engine.ts jumpsLeft = 1: the double's impulse) */
/** the highest a rolled graph's stage may stand (world y): the camera never scrolls above 0; the shipped stages keep their top
 *  platform at 290-400 px and their pickups at 255 or lower on screen (main's 1-1, 1-4, 1-5); a petal arc rises up to about 86 px over
 *  its platform, so 360 keeps every pickup at 274 or lower */
export const CAMERA_TOP = 360;
export const BOUNCE_REACH = (PHYS.bounceV * PHYS.bounceV) / (2 * PHYS.gravUp) + (PHYS.doubleV * PHYS.doubleV) / (2 * PHYS.gravUp);
export function maxGap(dyUp: number, dbl: boolean, margin: number): number {
  const phys = reachJump(dyUp, dbl);
  if (phys < 0) return -1;
  const accept = Math.max(reachJump(dyUp, false), reachJump(dyUp, true)) * 0.97 - TAKEOFF_SLACK - 4;
  return Math.max(-1, Math.min(margin * phys, accept));
}
/**
 * The widest gap a required leaf glide may have (World 8's moonlight glides): `margin` of the glide's physical reach off a double jump
 * (reachGlide), never more than what levelCheck links on that stage (jumpLinkGap, which counts the glide once every player has it), and
 * never less than a double jump's own envelope (a stage before the glide is guaranteed gets a double-jump gap).
 */
export function glideGap(dyUp: number, budget: Pick<StageBudget, 'margin' | 'world' | 'stage' | 'doubleTaught'>): number {
  const dbl = maxGap(dyUp, true, budget.margin);
  const link = jumpLinkGap(dyUp, budget.world, budget.stage, budget.doubleTaught) - 4;
  const g = reachGlide(dyUp, true);
  return g < 0 ? dbl : Math.max(dbl, Math.min(budget.margin * g, link));
}
/** the highest a required rise may be (px): `share` of a jump's height (one jump or two) */
export const riseLimit = (dbl: boolean, share: number): number => share * (dbl ? DOUBLE_RISE : JUMP_RISE);
/**
 * The envelope a stage lays to: on 1-1 (reach.ts judgedOnArcs, THE BOUNDARY) the flown bands, never physics.ts's closed form (ADR-001
 * §3); every other stage exactly as before. A 1-1 level gap (the landing no more than 20 px up) is laid to the band's top (reach.ts
 * gapEnvelope); a raised landing has no flown figure (reach.md flew level gaps only), so it keeps the closed-form shape, capped by it.
 */
export function gapFor(dyUp: number, dbl: boolean, budget: Pick<StageBudget, 'id' | 'margin' | 'difficulty'>): number {
  if (!judgedOnArcs(budget.id)) return maxGap(dyUp, dbl, budget.margin);
  const env = gapEnvelope(dbl, budget.difficulty, budget.id);
  return dyUp > 20 ? Math.min(maxGap(dyUp, dbl, budget.margin), env) : env;
}
/** is a laid piece's lip thin (under reach.md's 50 px block)? read off the shape as layStage builds it (`mk`): a bank stands to the
 *  ground (a block), a branch is 24 px and a stone 22 (thin), a hollow log its art's height, any other its own `h` */
export const thinLaid = (pc: Pick<SectionPiece, 'shape' | 'h'>, w: number): boolean =>
  pc.shape === 'bank' ? false : pc.shape === 'branch' || pc.shape === 'stone' ? true : pc.shape === 'hollow' ? hollowLogSize('moss', R(w)).height < BLOCK_H.px : (pc.h ?? 24) < BLOCK_H.px;
/** the highest rise a piece is laid to: on 1-1 the band's top (reach.ts riseEnvelope); elsewhere `k` of riseLimit, as before */
export const riseCap = (dbl: boolean, k: number, budget: Pick<StageBudget, 'id' | 'riseShare' | 'difficulty'>, thin = false): number =>
  judgedOnArcs(budget.id) ? riseEnvelope(dbl, budget.difficulty, thin) : riseLimit(dbl, budget.riseShare) * k;

/** a hop rock rolled under the engine's wall is laid in the wall's first HOP_SPREAD px, by its roll's share of its range (the Designer's
 *  FR9 / FR9b low stumps, 50-56: "every hop stump a wall, 50 px or more") */
export const HOP_SPREAD = 6;
/** how far before a hop's face a piece he reaches it from may end, and how far over or under its top, to be the way he comes to it level
 *  or from above (a step down a stair, the stumps of a descent): no climb to judge there */
const ARRIVE = { dx: 60, over: 100, under: 20 } as const;

/**
 * A hop rock on 1-1 (R-165.122; ENGINE-AUDIT-B B-04, B-05): an `on` block he lands on (a stump, a rock, a log across the floor), laid by
 * one rule instead of each section's numbers:
 *   - a wall (B-04): never under WALL_H, the engine's side wall (physics.ts), so a plain walk is stopped by it, never passes through it;
 *   - its climb judged (B-05): from where he really climbs it (the highest lower surface before its face that a single reaches at that
 *     rise, the floor it stands on included), an ask the verdicts judge like every laid jump. A rock he comes to level or from above (a
 *     descent's stumps) asks no climb;
 *   - its climb kept in the band: a hop's rise over that take-off is clamped to the setting's single-rise band. A rock whose range
 *     starts in Normal's double-teach rise band over its take-off is a double obstacle (the fallen trunk, 137-140: "too tall for one
 *     jump"): it keeps the double's clamp and is judged as a double.
 * Posts under a log (not landings), mushrooms and hollow logs are not hop rocks, nor a perch (a stump with a mushroom on it: the Designer's
 * FR9b perch exception keeps it under 50 px, w1.ts `perch`). Every other stage lays as before (THE BOUNDARY).
 */
function hopLay(pc: SectionPiece, range: Range, rolled: number, h0: number, x: number, a: LocalPiece, out: readonly LocalPiece[], budget: StageBudget): { h: number; ask?: LocalAsk } {
  if (!pc.landing) return { h: h0 };
  let h = h0;
  if (h < WALL_H) {
    const [lo, hi] = typeof range === 'number' ? [range, range] : range;
    h = WALL_H + (hi > lo ? (Math.min(hi, Math.max(lo, rolled)) - lo) / (hi - lo) : 0) * HOP_SPREAD;
  }
  const walk = (q: LocalPiece) => !q.hang && !q.crumble && q.shape !== 'bouncy' && q.w > 0 && (q.landing || q.main) && q.x < x;
  const top = a.y - h;
  if (out.some((q) => walk(q) && q !== a && q.x + q.w >= x - ARRIVE.dx && q.y <= top + ARRIVE.under && q.y >= top - ARRIVE.over)) return { h };
  const dblOK = budget.moves.includes('double');
  // (the take-off: the least climb among the lower surfaces a single reaches the face from)
  const takeOff = (t: number) => {
    let best: LocalPiece | undefined;
    for (const q of out) {
      if (!walk(q) || q.y <= t + 0.5) continue;
      const rise = q.y - t, gap = Math.max(0, x - (q.x + q.w));
      if (gap > 0 && gap > gapFor(rise, false, budget)) continue;
      if (!best || q.y < best.y || (q.y === best.y && q.x + q.w > best.x + best.w)) best = q;
    }
    return best;
  };
  const take = takeOff(top);
  if (!take) return { h };
  // (a double obstacle by its data: even the low end of its range over this take-off stands in Normal's double-teach rise band, as the
  // fallen trunk's 137-140 does. Between the single band and that, no move is built for it: a hop, clamped into the single band, as a
  // stile's 100 px step 137 px past the step before it, too far for a single at that rise, is)
  const lowRise = take.y - (a.y - Math.max(typeof range === 'number' ? range : range[0], WALL_H));
  const dblLo = (BANDS['double-teach-rise'].normal as { lo: number }).lo;
  const dbl = !!pc.block || (dblOK && lowRise >= dblLo);
  if (!dbl) {
    const cap = riseCap(false, 1, budget);
    if (take.y - top > cap) h = a.y - (take.y - cap);
  }
  const yLand = a.y - h;
  return { h, ask: { x0: Math.min(take.x + take.w, x), x1: x, yTake: take.y, yLand, move: dbl ? (pc.block === 'bounce' ? 'bounce' : 'double') : 'single', ...(pc.block ? { block: pc.block } : {}), thin: false, key: pc.key } };
}

// ───────────────────────────── the liana's reach ─────────────────────────────

/**
 * The engine's self-swinging vine (physics.ts TIMED, setTimedSwing): one there-and-back every `period` s (Normal 2.85, Easy 3.3), at
 * most `amp` radians either side, the sweet spot (a let-go there is the Tarzan leap) between these shares of the swing past straight
 * down. The swing a liana gets when its setting names none; the pipeline test fails if physics.ts's own numbers drift from these.
 */
export const VINE = {
  period: { normal: 2.85, easy: 3.3 },
  amp: 0.45,
  sweet: { normal: [-0.15, 0.9], easy: [-0.4, 1.2] },
} as const;

/**
 * The release window of a liana (s): of ONE swing, how long a press to let go toward the perch gets him onto it (its top `far.y`, from
 * `far.x` for `far.w` px), the worse of his two grips. The ONE place gen2 sizes a swing by: the engine's own physics.ts pressWindow (the
 * press as engine.ts plays it, RELEASE's forgiveness, timedLaunch's leap, LETGO_FLIGHTS) on this difficulty's swing (setTimedSwing, put
 * back as it was after).
 */
export function lianaRelease(v: Pick<Vine, 'x' | 'topY' | 'bottomY'>, swing: LianaSwing, far: { x: number; y: number; w: number }, difficulty: Difficulty): number {
  const was = { ...TIMED };
  setTimedSwing(difficulty === 'easy');
  try {
    const A = { x: v.x, topY: v.topY, bottomY: v.bottomY, swingAmp: swing.amp, swingPeriod: swing.period, swingPhase: 0 };
    return pressWindow(A, (c, _t, prevY) => c.vy >= 0 && prevY <= far.y + 14 && c.y >= far.y && c.x > far.x + 10 && c.x < far.x + far.w) / 1000;
  } finally {
    Object.assign(TIMED, was);
  }
}

/**
 * The widest gap levelCheck joins by a jump to a ledge `dyUp` px higher (negative: lower), on stage `world`-`stage`: a jump, a double
 * jump from mission 6, and the leaf glide once every player has it (World 5 on: 457 px on the flat), as levelCheck reckons them (its
 * 0.97 and the take-off slack). -1 when no jump gets that high. A swing's perch lies past it, or the swing is not needed.
 */
export function jumpLinkGap(dyUp: number, world: number, stage: number, doubleTaught?: boolean): number {
  const mission = (world - 1) * 10 + stage;
  let r = doubleAllowed({ worldIndex: world, miniIndex: stage, doubleTaught }) ? Math.max(reachJump(dyUp, false), reachJump(dyUp, true)) : reachJump(dyUp, false);
  if (skillGuaranteedAt('glide', mission)) r = Math.max(r, reachGlide(dyUp, false), reachGlide(dyUp, true));
  return r < 0 ? -1 : r * 0.97 - TAKEOFF_SLACK;
}

/** release windows already flown, by their rounded numbers (a section's rolls repeat across a build's passes and its Easy twin) */
const RELEASE_CACHE = new Map<string, number>();

/**
 * Where the perch after a liana may start (its near end), relative to the liana's ledge: the band of near ends whose release window
 * is at least `need` (lianaRelease), and which the level check of today links too (levelCheck swingLandings, 6 lines or more: until
 * branch vine-fix changes it, both must hold), as [lo, hi], never nearer than `min`; null when none does. `from` is the ledge the
 * swing starts from.
 */
export function lianaBand(from: { x: number; y: number; w: number }, v: Pick<Vine, 'x' | 'topY' | 'bottomY'>, swing: LianaSwing, dy: number, w: number, need: number, min = -Infinity, difficulty: Difficulty = 'normal'): [number, number] | null {
  const window = (x: number) => {
    const key = [R(v.x - from.x - from.w), R(v.topY - from.y), R(v.bottomY - from.y), R(x - from.x - from.w), R(dy), R(w), swing.amp.toFixed(3), swing.period.toFixed(3), difficulty].join(',');
    let r = RELEASE_CACHE.get(key);
    if (r === undefined) RELEASE_CACHE.set(key, (r = lianaRelease(v, swing, { x, y: from.y + dy, w }, difficulty)));
    return r;
  };
  const near: Platform = { id: -1, x: from.x, y: from.y, width: from.w, height: 90, type: 'solid' };
  const linked = (x: number) => (swingLandings(near, { id: -1, x: v.x, topY: v.topY, bottomY: v.bottomY, swaySpeed: 1.1, swayPhase: 0, vineType: 'swing_liana', isSwingingVine: true }, 1, [near, { id: -2, x, y: from.y + dy, width: w, height: 90, type: 'solid' }], 1e9).get(-2) ?? 0) >= 6;
  let lo = -1;
  let hi = -1;
  for (let x = R(Math.max(v.x + 40, min)); x <= v.x + 900; x += 20) {
    if (window(x) >= need) {
      if (lo < 0) lo = x;
      hi = x;
    } else if (lo >= 0) break;
  }
  if (lo < 0) return null;
  // (today's check: from the far end of the band in, the first it links)
  while (hi >= lo && !linked(hi)) hi -= 20;
  return hi >= lo ? [lo, hi] : null;
}

// ───────────────────────────── pass 1: the budget ─────────────────────────────

/**
 * The inspector's quick player (tools/inspect eraRoll pickRoute: a fast thumb on the quickest way through; what curation and the
 * length rule measure) needs at least `seconds` (STAGE-RULES §1, §2 "Length"). The pipeline can't run the inspector (it ships), so it
 * holds the time model's fast player to `seconds / ratio`: the quick player runs at least `ratio` of the model's fast player.
 * Measured 2026-10-28 over 100-400 rolls per stage and setting: lowest 0.851 (World 5's 5-7, Easy); 0.86-0.90 for the rest of 5-7,
 * 5-9 and the toy world's 5-4 and 5-7, about 1.0 for a harvest. Re-measure when a world's sections change the mix (the pipeline
 * test checks the quick route itself on the toy world).
 */
export const QUICK = { seconds: 120, ratio: 0.84 } as const;

/**
 * The seconds a self-swinging liana costs (Matt, 2026-10-28): on average he waits half of what is not its release window for the
 * swing to come round, then rides half a swing across: (period - window) / 2 + period / 2. stageTime's model gives every liana a flat
 * TIME.swingExtra (2.5 s) over walking its gap, the cost of a pumped swing, which ran a liana-heavy stage a minute over what the
 * inspector's quick route takes (6-1: 0.68 of the model with 17 lianas).
 */
export const lianaSeconds = (swing: LianaSwing, window: number): number => (swing.period - window) / 2 + swing.period / 2;

/**
 * The time model on a gen2 stage: stageTime's modelStage, with each of its lianas (proto.gen2.lianas: swing, release window, gap)
 * costing lianaSeconds in place of walking its gap plus TIME.swingExtra. What the length loop and Gen2Meta.modelled read.
 */
export function gen2Model(st: GeneratedStage & { proto?: ProtoExtras }, P: ModelParams): number {
  let t = modelStage(st, P).total;
  const lianas = ((st.proto as { gen2?: { lianas?: Array<LianaSwing & { window?: number; x0?: number; x1?: number }> } } | undefined)?.gen2?.lianas ?? []);
  for (const l of lianas) {
    if (l.window === undefined || l.x0 === undefined || l.x1 === undefined) continue;
    t += lianaSeconds(l, l.window) - (l.x1 - l.x0) / walkSpeed(P) - TIME.swingExtra;
  }
  return t;
}

/**
 * Each world's difficulty band (§1b), in D units: Gemini's D_base from 10 (World 1) to 65 (World 10), the band from 1.5 under it to
 * 7.5 over it. Neighbours overlap by about 3 (less than a world); the next world's middle (D_base + 9.1) stays above this world's top.
 */
export function bandFor(world: number): readonly [number, number] {
  const base = 10 + ((world - 1) * 55) / 9;
  return [base - 1.5, base + 7.5];
}
/** where each stage (1-9) sits in its world's band: up and down (a breather after a hard one), the last the hardest; stage 1 sits
 *  just under the last of the world before (F2) */
export const STAGE_HEAT = [0.05, 0.3, 0.45, 0.35, 0.6, 0.5, 0.75, 0.65, 1.0] as const;

export function difficultyScore(world: number, stage: number, band = bandFor(world)): number {
  return band[0] + (band[1] - band[0]) * STAGE_HEAT[Math.max(0, Math.min(8, stage - 1))];
}

export function planBudget(config: LevelConfig, manifest: WorldManifest, difficulty: Difficulty): StageBudget {
  const archetype = config.objectiveType as Archetype;
  if ((config.objectiveType as string) === 'boss_lair') throw new Error('gen2: the guardian lair is hand-built');
  const band = manifest.band ?? bandFor(config.worldIndex);
  const D = difficultyScore(config.worldIndex, config.miniIndex, band);
  const heat = (D - band[0]) / (band[1] - band[0]);
  const easy = difficulty === 'easy';
  const target = targetSeconds(config.worldIndex, config.miniIndex, archetype);
  const goal = config.targetCount;
  // (a purge or gauntlet on Easy is held to easyMode's goal, round(0.6 x the goal); its top-up lays 2 over what it is held to)
  const fights = archetype === 'purge' || archetype === 'gauntlet';
  const check = fights && easy ? Math.max(1, Math.round(goal * 0.6)) : goal;
  const lay = archetype === 'harvest' ? Math.ceil(goal * 1.5) : archetype === 'rescue' || archetype === 'relic_hunt' ? goal + 1 : fights ? check + 2 : goal;
  // (packet E12 item 5, the built stage's half: the double counts on a stage an EARLIER stage's lesson taught it for, the world's
  // `lessons` row, as the node code's V3 reads it; carried only where the old rule does not already count it, so no stage that
  // rule covers gains a field)
  const dblLesson = manifest.lessons?.double;
  const doubleTaught = dblLesson !== undefined && stageOrder(dblLesson) < stageOrder(config.id) && !doubleAllowed(config);
  return {
    id: config.id,
    world: config.worldIndex,
    stage: config.miniIndex,
    ...(doubleTaught ? { doubleTaught: true as const } : {}),
    archetype,
    difficulty,
    D,
    band,
    heat,
    // (the fast player's floor is also what keeps the inspector's quick player over 2:00: QUICK)
    seconds: { target, fastFloor: Math.max(fastFloor(config.worldIndex, config.miniIndex, archetype), QUICK.seconds / QUICK.ratio), max: Math.min(target * 1.1, 295) },
    margin: MARGIN[difficulty],
    riseShare: MARGIN[difficulty],
    landingPad: easy ? EASY_LANDING : 0,
    threat: 2 + 6 * heat,
    enemyShare: easy ? EASY_ENEMY_SHARE : 1,
    quota: { goal, check, lay },
    // (Easy: a fall on land is a soft pit, never a life (Part 1 §3 "bottomless pits replaced"); water still costs a life on Easy, with
    // a clear warning before it (Matt, 2026-10-28: fillSockets' water warnings)
    pit: easy && manifest.pit !== 'water' ? 'soft' : manifest.pit,
    quiet: QUIET[difficulty],
    walkSpeed: walkSpeed(MODEL_TYPICAL),
    moves: ['walk', 'jump', ...manifest.moves.filter((m) => m !== 'walk' && m !== 'jump')] as Move[],
  };
}

// ───────────────────────────── pass 2: the mission graph ─────────────────────────────

/** the sawtooth every horizontal stage starts from (Gemini Part 1 §4: Ki 0.2-0.4, Sho 0.5-0.7, rest 0.1, Ten 0.6-0.85, Ketsu 0.95) */
const SPINE: Array<Omit<MissionNode, 'id'>> = [
  { role: 'start', phase: 'start', tension: 0.1, share: 0.04 },
  { role: 'teach', phase: 'ki', tension: 0.3, share: 0.14 },
  { role: 'develop', phase: 'sho', tension: 0.6, share: 0.18 },
  { role: 'rest', phase: 'rest', tension: 0.1, share: 0.05, flag: true },
  { role: 'twist', phase: 'ten', tension: 0.72, share: 0.2 },
  { role: 'rest', phase: 'rest', tension: 0.1, share: 0.05, flag: true },
  { role: 'twist', phase: 'ten', tension: 0.85, share: 0.14 },
  { role: 'climax', phase: 'ketsu', tension: 0.95, share: 0.16, flag: true },
  { role: 'goal', phase: 'goal', tension: 0, share: 0.04 },
];
/** what each archetype's sections should carry (a preference: the bag weighs them up, it never filters on them) */
const WANT: Partial<Record<Archetype, string[]>> = {
  stealth: ['cover'],
  vine_runner: ['swing'],
  harvest: ['pickups'],
  purge: ['arena'],
  gauntlet: ['arena'],
  rescue: ['alcove'],
  relic_hunt: ['alcove'],
  sprint: ['run'],
};

/**
 * The archetype's graph (Part 1 Pass 2, our stagePlan.ts kinds): the sawtooth, rewritten per kind. A rescue or a search spreads its
 * quota items over the Sho/Ten/Ketsu nodes (in proportion to their share); a purge or gauntlet runs hotter; a gauntlet gets one more
 * twist. TODO(phase 2): an ascent's graph runs up (flow 'up'), and rescue/search alcoves become real side branches.
 */
export function missionGraph(budget: StageBudget, manifest?: WorldManifest, seed = 0): MissionGraph {
  const a = budget.archetype;
  const rolled = manifest ? rolledGraph(budget, manifest, seed) : null;
  if (rolled) return rolled;
  if (a === 'ascent') throw new Error('gen2: ascent stages run up (flow "up"): phase 2');
  const nodes: MissionNode[] = SPINE.map((n, i) => ({ ...n, id: `n${i + 1}` }));
  if (a === 'gauntlet') nodes.splice(7, 0, { id: 'n7b', role: 'twist', phase: 'ten', tension: 0.9, share: 0.08 });
  const hot = a === 'purge' || a === 'gauntlet' ? 0.08 : 0;
  const total = nodes.reduce((s, n) => s + n.share, 0);
  for (const n of nodes) {
    n.share /= total;
    if (n.role !== 'rest' && n.role !== 'start' && n.role !== 'goal') n.tension = Math.min(1, n.tension + hot);
    const want = WANT[a];
    if (want && n.phase !== 'start' && n.phase !== 'goal') n.want = want;
  }
  if (a === 'rescue' || a === 'relic_hunt') {
    const live = nodes.filter((n) => n.phase === 'sho' || n.phase === 'ten' || n.phase === 'ketsu');
    const share = live.reduce((s, n) => s + n.share, 0);
    let left = budget.quota.lay;
    live.forEach((n, i) => {
      const k = i === live.length - 1 ? left : Math.min(left, Math.round((budget.quota.lay * n.share) / share));
      n.objectives = k;
      left -= k;
    });
  }
  return { archetype: a, flow: 'right', nodes };
}

/** each job's place in the sawtooth (the SPINE's roles, phases, tensions and shares, by what the job asks: NODES.md §1) */
const JOB = {
  arrive: { role: 'start', phase: 'start', tension: 0.1, share: 0.04 },
  teach: { role: 'teach', phase: 'ki', tension: 0.3, share: 0.12 },
  practise: { role: 'develop', phase: 'sho', tension: 0.55, share: 0.12 },
  flow: { role: 'develop', phase: 'sho', tension: 0.6, share: 0.12 },
  fork: { role: 'develop', phase: 'sho', tension: 0.6, share: 0.12 },
  climb: { role: 'develop', phase: 'sho', tension: 0.6, share: 0.12 },
  descent: { role: 'develop', phase: 'sho', tension: 0.55, share: 0.1 },
  combine: { role: 'twist', phase: 'ten', tension: 0.75, share: 0.12 },
  twist: { role: 'twist', phase: 'ten', tension: 0.8, share: 0.12 },
  test: { role: 'climax', phase: 'ketsu', tension: 0.9, share: 0.12, flag: true },
  signature: { role: 'climax', phase: 'ketsu', tension: 0.95, share: 0.14, flag: true },
  finale: { role: 'climax', phase: 'ketsu', tension: 0.95, share: 0.12, flag: true },
  rest: { role: 'rest', phase: 'rest', tension: 0.1, share: 0.05, flag: true },
  exit: { role: 'goal', phase: 'goal', tension: 0, share: 0.04 },
} as Record<NodeJob, Omit<MissionNode, 'id'>>;
// (the jobs no graph rolls yet, NODES.md §6 LATER, and the section-only tags: never a node, so they sit where a practise would)
for (const j of ['reward', 'pressure', 'puzzle', 'arena', 'story', 'preview', 'change', 'cooldown-in-node', 'choice-reward'] as const) JOB[j] = JOB.practise;
/** the jobs after which a rest comes (WORLD-RULEBOOK §4: after every test, twist and set piece) */
const NEEDS_REST: ReadonlySet<NodeJob> = new Set(['test', 'twist', 'signature']);
/** the quiet jobs: never two side by side */
const QUIET_JOBS: ReadonlySet<NodeJob> = new Set(['rest']);

/**
 * The rolled stage graph (NODES.md §4, §6 "1-1 NOW"), for a world that lists its graphs and a stage with a brief; null otherwise (the
 * SPINE). The graph is rolled from the stage's own seed (`rngFor(seed, 67)`), so Easy and every re-roll keep Normal's graph. Then the
 * brief's rules are laid by construction, whatever the graph's list says:
 *   - `ends`: a quiet brief drops its finale and the rest before the exit; a finale brief gets one before the exit;
 *   - the stage's lessons force its teach nodes, one per move, in the lessons' order, right after the arrival and each other's; a teach
 *     is never forked;
 *   - `branching` sets the fork count (none 0, some 1-2, lots 3-4): a practise, flow or climb becomes a fork, or a fork a practise;
 *   - a rest after every test, twist and signature (unless a quiet node or the exit is next), never two quiet nodes side by side.
 * Each node then rolls its shape (fork two-road, climb rising, descent falling; a practise, flow, combine or test by the trend) and its
 * dials (tempo, density, height, terrain, rating).
 */
function rolledGraph(budget: StageBudget, M: WorldManifest, seed: number): MissionGraph | null {
  const G = M.graphs;
  const brief = G?.briefs[budget.id];
  if (!G || !brief) return null;
  const list = G.list.filter((g) => g.archetype === budget.archetype);
  if (!list.length) return null;
  const r = rngFor(seed, 67);
  const g = list[Math.floor(r() * list.length)];
  // (the graph's code, read and checked: a graph that breaks a rule is the world's data at fault, named with its rule and token)
  const parsed = parseCode(g.code);
  const bad = checkCode(parsed, {});
  if (bad.length) throw new Error(`gen2 ${budget.id}: graph ${g.id} "${g.code}": ${bad.join('; ')}`);
  let jobs: NodeJob[] = parsed.map((t) => JOB_OF[t.job]);
  // (ends: a quiet brief drops the finale, and the rest that led to it, so the stage walks on to its quiet arrival, NODES.md §8.4's
  // B under 1-1; a finale brief gets one before the exit)
  if (brief.ends === 'quiet') {
    jobs = jobs.filter((j) => j !== 'finale');
    while (jobs.length > 2 && jobs[jobs.length - 1] === 'exit' && jobs[jobs.length - 2] === 'rest') jobs.splice(jobs.length - 2, 1);
  } else if (!jobs.includes('finale')) jobs.splice(Math.max(1, jobs.lastIndexOf('exit')), 0, 'finale');
  // (the lessons force the teach nodes: the first after the arrival, each next after the one before)
  const teach = brief.teaches ?? Object.entries(M.lessons ?? {}).filter(([, st]) => st === budget.id).map(([m]) => m);
  const teachAt = () => jobs.reduce((k, j, i) => (j === 'teach' ? i : k), jobs[0] === 'arrive' ? 0 : -1);
  while (jobs.filter((j) => j === 'teach').length < teach.length) jobs.splice(teachAt() + 1, 0, 'teach');
  // (a stage with no moves named keeps its graph's teach nodes, each taking any move not yet taught)
  if (teach.length || brief.teaches) while (jobs.filter((j) => j === 'teach').length > teach.length) jobs[jobs.lastIndexOf('teach')] = 'practise';
  // (branching: the fork count)
  const forks = brief.branching === 'none' ? 0 : brief.branching === 'some' ? 1 + (r() < 0.5 ? 1 : 0) : 3 + (r() < 0.5 ? 1 : 0);
  while (jobs.filter((j) => j === 'fork').length > forks) jobs[jobs.lastIndexOf('fork')] = 'practise';
  for (let guard = 0; jobs.filter((j) => j === 'fork').length < forks && guard < 8; guard++) {
    const open = jobs.map((j, i) => i).filter((i) => (jobs[i] === 'practise' || jobs[i] === 'flow' || jobs[i] === 'climb') && jobs[i - 1] !== 'fork' && jobs[i + 1] !== 'fork');
    if (open.length) jobs[open[Math.floor(r() * open.length)]] = 'fork';
    else {
      // (no practise left to turn: a fork after the last teach or fork, before the tests; never next to a fork (stageQuality's line,
      // the lead's red test #9: seeds 4, 10 and 15 laid F F, two forks side by side): with no such place the stage keeps fewer forks,
      // and V17's one is always laid)
      const after = jobs.reduce((k, j, i) => (j === 'teach' || j === 'fork' || j === 'practise' ? i : k), 0);
      // (the nearest place at or before that, back to the first teach, with no fork either side; none: a flow between the two forks)
      const first = Math.max(1, jobs.indexOf('teach') + 1);
      let at = -1;
      for (let k = after + 1; k >= first; k--) if (jobs[k - 1] !== 'fork' && jobs[k] !== 'fork') { at = k; break; }
      if (at >= 0) jobs.splice(at, 0, 'fork');
      else jobs.splice(after + 1, 0, ...(jobs[after] === 'fork' ? (['flow', 'fork'] as NodeJob[]) : (['fork', 'flow'] as NodeJob[])));
    }
  }
  // (a required section is the stage's own find, the key's H (NODES.md §8.0: the seed perch, NOW in 1-1): a reward node each, after the
  // last rest before the signature, so it stands in the last third with the boughs)
  for (const _ of M.required?.[budget.id] ?? []) {
    const s = jobs.lastIndexOf('signature');
    // (right before the signature, inside its last third with the boughs: X R H S E; on graph C, R D_ H S E, where V19 passes over
    // the find and holds the signature to rise)
    jobs.splice(s > 0 ? s : Math.max(1, jobs.lastIndexOf('exit')), 0, 'reward');
  }
  // (the rests)
  for (let i = 0; i < jobs.length - 1; i++) if (NEEDS_REST.has(jobs[i]) && !QUIET_JOBS.has(jobs[i + 1]) && jobs[i + 1] !== 'exit') jobs.splice(i + 1, 0, 'rest');
  jobs = jobs.filter((j, i) => !(QUIET_JOBS.has(j) && QUIET_JOBS.has(jobs[i - 1])));
  // (each node: its shape and its dials)
  const lean: Record<GraphBrief['trend'], Array<[NodeShape, number]>> = {
    up: [['rising', 2], ['flat', 1.5], ['falling', 0.5]],
    level: [['flat', 2], ['rising', 1], ['falling', 1]],
    down: [['falling', 2], ['flat', 1.5], ['rising', 0.5]],
  };
  const terrains = G.terrains?.length ? new ShuffleBag(r, [...G.terrains]) : null;
  let ti = 0;
  const nodes: MissionNode[] = jobs.map((job, i) => {
    const base = JOB[job];
    const shape: NodeShape =
      job === 'fork' ? 'two-road' : job === 'climb' ? 'rising' : job === 'descent' ? 'falling'
      : job === 'practise' || job === 'flow' || job === 'combine' || job === 'test' || job === 'finale' || job === 'twist' ? pickWeighted(r, lean[brief.trend], (x) => x[1])![0]
      : 'flat';
    const t = jobs.length > 1 ? i / (jobs.length - 1) : 0;
    const quiet = base.role === 'start' || base.role === 'goal' || base.role === 'rest';
    // (density climbs through the stage, a step either way on a third of the nodes; the rating is the node's tension on 1-10, jittered)
    const d0 = t < 1 / 3 ? 0 : t < 2 / 3 ? 1 : 2;
    const dj = r() < 1 / 3 ? (r() < 0.5 ? -1 : 1) : 0;
    const density = (['low', 'medium', 'high'] as const)[quiet ? 0 : Math.max(0, Math.min(2, d0 + dj))];
    const rating = quiet ? Math.max(1, Math.round(1 + 9 * base.tension)) : Math.max(1, Math.min(10, Math.round(1 + 9 * base.tension + (r() * 2 - 1))));
    const dials: NodeDials = {
      tempo: r() < 0.5 ? 'hurry' : 'patience',
      density,
      height: shape === 'rising' ? 'up' : shape === 'falling' ? 'down' : 'level',
      ...(terrains && !quiet ? { terrain: terrains.draw() } : {}),
      rating,
    };
    const want = WANT[budget.archetype];
    return { ...base, id: `n${i + 1}`, job, shape, dials, ...(want && base.role !== 'start' && base.role !== 'goal' ? { want } : {}), ...(job === 'teach' ? { teaches: teach[ti++] } : {}) };
  });
  // (V19: in a trend-up stage, the node after a descent in the last third ends higher than the descent began: it rises)
  if (brief.trend === 'up') nodes.forEach((n, i) => {
    if (n.job !== 'descent' || (i + 0.5) / nodes.length < 2 / 3) return;
    const next = nodes.slice(i + 1).find((q) => q.job !== 'rest' && q.job !== 'exit' && q.job !== 'reward');
    if (next) { next.mustRise = true; next.shape = 'rising'; if (next.dials) next.dials.height = 'up'; }
  });
  const total = nodes.reduce((s, n) => s + n.share, 0);
  for (const n of nodes) n.share /= total;
  // (length from the chunk count: a quiet node or a fork one section, the working nodes the rest by share, each at least one, largest
  // remainder. Before the deal, which reads the counts: a node's type must be one the pool can fill for every section it holds)
  if (G.chunkSeconds) {
    // (a quiet node holds one section; so does a fork, whose two roads are one two-road section, one content node, NODES.md §8.2)
    const quiet = (n: MissionNode) => n.role === 'start' || n.role === 'goal' || n.role === 'rest' || n.job === 'fork' || n.job === 'reward';
    const work = nodes.filter((n) => !quiet(n));
    const chunks = Math.max(nodes.length, Math.round(budget.seconds.target / G.chunkSeconds));
    const left = Math.max(work.length, chunks - (nodes.length - work.length));
    const ws = work.reduce((s, n) => s + n.share, 0);
    const raw = work.map((n) => Math.max(1, (left * n.share) / ws));
    const got = raw.map(Math.floor);
    let spare = left - got.reduce((a, b) => a + b, 0);
    for (const k of raw.map((x, k) => [x - Math.floor(x), k] as const).sort((a, b) => b[0] - a[0]).map(([, k]) => k)) if (spare-- > 0) got[k]++;
    for (const n of nodes) n.count = quiet(n) ? 1 : got[work.indexOf(n)];
  }
  const deal = dealContent(nodes, M, brief, budget, r, seed);
  // (the count was written after the type until the deal came to read it; a node's record keeps that order of fields, so the
  // stage lock's fingerprint of a built stage's graph is the one it always was)
  for (const n of nodes) if (n.count !== undefined) { const c = n.count; delete n.count; n.count = c; }
  return { archetype: budget.archetype, flow: 'right', nodes, id: g.id, ...(deal ? { deal } : {}) };
}

/**
 * How many of `slots` (each its candidate section ids) are left with no section when a section serves at most `cap(id)` of them: 0 when
 * every slot can be filled at once (augmenting paths over the slots; a stage is a dozen slots and a pool under a hundred sections).
 * R-165.120: the deal and the lay ask this BEFORE they commit, so a scarce section is kept for the node that has nothing else.
 */
export function unfilled(slots: ReadonlyArray<readonly string[]>, cap: (id: string) => number): number {
  const held = new Map<string, number[]>();
  const fill = (s: number, seen: Set<string>): boolean => {
    for (const id of slots[s]) {
      if (seen.has(id)) continue;
      seen.add(id);
      const h = held.get(id) ?? [];
      if (h.length < cap(id)) { h.push(s); held.set(id, h); return true; }
      for (let k = 0; k < h.length; k++) if (fill(h[k], seen)) { h[k] = s; return true; }
    }
    return false;
  };
  let miss = 0;
  slots.forEach((_, s) => { if (!fill(s, new Set())) miss++; });
  return miss;
}

/** what the pool's look-ahead reads of a stage: its nodes in order, its length in slots, and each section's way up or down */
interface PoolView {
  M: WorldManifest;
  budget: Pick<StageBudget, 'id' | 'archetype' | 'moves'>;
  nodes: readonly MissionNode[];
  /** the stage's slot count, when the graph counts its chunks (a section's `window` is read against it); 0: no window is read */
  stageLen: number;
  exitDy: (t: SectionTemplate) => number;
}

/**
 * The part of the lay's `fits` that is known before anything is laid: may section `t` fill slot `i` of node `n` by its rule (the job and
 * the dealt type, a teach node's move, a required section in its reward node, what it needs and uses against the teach nodes before it,
 * its window, a mustRise node's way up)? Never looser than the rule and never stricter: what the lay alone knows (the corridor, V19's
 * heights, the bans of a repair) is not read, so a slot this refuses the lay refuses too. Returns a function over the view's sections.
 */
function poolFits(V: PoolView): (t: SectionTemplate, n: MissionNode, i: number) => boolean {
  const { M, budget } = V;
  const known = new Set(Object.entries(M.lessons ?? {}).filter(([, st]) => stageOrder(st) < stageOrder(budget.id)).map(([m]) => m));
  const index = new Map(V.nodes.map((n, k) => [n.id, k]));
  const teachAt = new Map<string, number>();
  V.nodes.forEach((n, k) => { if (n.job === 'teach' && n.teaches && !teachAt.has(n.teaches)) teachAt.set(n.teaches, k); });
  const required = new Set((M.required?.[budget.id] ?? []).map((r) => r.section));
  return (t, n, i) => {
    const at = index.get(n.id) ?? 0;
    // (a move the stage teaches is known from its teach node on; one no node here teaches is the lay's to know)
    const taught = (m: string) => known.has(m) || (teachAt.has(m) ? teachAt.get(m)! < at : true);
    if (required.has(t.id)) {
      if (n.job !== 'reward' || !t.phases.includes(n.phase)) return false;
    } else if (n.job === 'teach') {
      if (!(n.teaches ? t.teaches === n.teaches : !!t.teaches)) return false;
      if (n.content && t.content && t.content !== n.content) return false;
    } else {
      if (t.teaches && teachAt.has(t.teaches) && !taught(t.teaches)) return false;
      if (n.content && t.content && t.content !== n.content) return false;
      if (n.job === 'fork' || n.job === 'reward') { if (!t.jobs?.includes(n.job)) return false; }
      else if (!(n.job && t.jobs ? t.jobs.includes(n.job) : t.phases.includes(n.phase))) return false;
    }
    if (n.mustRise && !required.has(t.id) && V.exitDy(t) >= 0) return false;
    if (!(t.archetypes === 'any' || t.archetypes.includes(budget.archetype))) return false;
    if (!(t.needs ?? []).every((m) => budget.moves.includes(m)) || !hangsNeed(t).every((m) => budget.moves.includes(m))) return false;
    if (!(t.uses ?? []).every((m) => t.teaches === m || taught(m))) return false;
    if (t.window && V.stageLen && ((i + 0.5) / V.stageLen < t.window[0] || (i + 0.5) / V.stageLen > t.window[1])) return false;
    return true;
  };
}

/** the jobs a content node holds (NODES.md §7.1: structural nodes, and the signature, sit outside the mix) */
const CONTENT_JOBS: ReadonlySet<NodeJob> = new Set(['teach', 'practise', 'fork', 'flow', 'combine', 'climb', 'descent', 'twist', 'test']);

/**
 * The content deal (NODES.md §7.5, the lead's 5:08 PM order): the stage's content nodes get their TYPES first, so a type's chunk count
 * never becomes its weight. The counts are DEALT, never rolled node by node: the brief's deal (or the world's mix) by largest remainder
 * over the content nodes, then one moved on the seed's jitter (±1). Fixed first: a climb is `climb` (V8), a teach takes its teacher's
 * type. Then the open nodes are filled in order under the caps (§7.4, V11: no type over 40% of the content nodes; never one type on two
 * neighbouring content nodes, but a practise after its own teach and a teach after anything) and the windows (V12), the type with the
 * most left first; a few re-deals on the seed keep the one that breaks the fewest. A world with no mix deals nothing.
 */
function dealContent(nodes: MissionNode[], M: WorldManifest, brief: GraphBrief, budget: StageBudget, r: Rng, seed: number): Partial<Record<ContentType, number>> | undefined {
  const stageId = budget.id;
  const shares = brief.deal ?? M.graphs?.mix;
  if (!shares) return undefined;
  const slots = nodes.map((n, i) => ({ n, i })).filter((x) => CONTENT_JOBS.has(x.n.job!));
  const N = slots.length;
  if (!N) return undefined;
  // (the fixed ones: a climb is a climb; a teach is its teacher's type)
  const fixed = new Map<number, ContentType>();
  for (const { n, i } of slots) {
    if (n.job === 'climb') fixed.set(i, 'climb');
    if (n.job === 'teach' && n.teaches) {
      const c = M.sections.find((t) => t.teaches === n.teaches && t.content && t.content !== 'structural')?.content;
      if (c && c !== 'structural') fixed.set(i, c);
    }
  }
  const types = [...new Set([...(Object.keys(shares) as ContentType[]).filter((t) => (shares[t] ?? 0) > 0), ...fixed.values()])];
  const sum = types.reduce((a, t) => a + (shares[t] ?? 0), 0);
  // (largest remainder, then the jitter: one node moved from one type to another on half the seeds)
  const raw = types.map((t) => (N * (shares[t] ?? 0)) / sum);
  const deal = new Map(types.map((t, k) => [t, Math.floor(raw[k])]));
  let spare = N - [...deal.values()].reduce((a, b) => a + b, 0);
  for (const k of raw.map((x, k) => [x - Math.floor(x), k] as const).sort((a, b) => b[0] - a[0]).map(([, k]) => k)) if (spare-- > 0) deal.set(types[k], deal.get(types[k])! + 1);
  // (the fixed nodes are in the deal: a type has at least as many as are fixed to it, the rest taken from the type with the most)
  const fixedN = (t: ContentType) => [...fixed.values()].filter((c) => c === t).length;
  for (const t of types) while (deal.get(t)! < fixedN(t)) {
    const most = types.filter((u) => u !== t && deal.get(u)! > fixedN(u)).sort((a, b) => deal.get(b)! - deal.get(a)!)[0];
    if (!most) break;
    deal.set(most, deal.get(most)! - 1);
    deal.set(t, deal.get(t)! + 1);
  }
  if (types.length > 1 && r() < 0.5) {
    const from = types.filter((t) => deal.get(t)! > fixedN(t)), to = types.filter((t) => (shares[t] ?? 0) > 0);
    const a = from[Math.floor(r() * from.length)], b = to[Math.floor(r() * to.length)];
    if (a && b && a !== b) { deal.set(a, deal.get(a)! - 1); deal.set(b, deal.get(b)! + 1); }
  }
  const cap = Math.max(1, Math.round(0.4 * N));
  const win = M.graphs?.windows ?? {};
  const inWin = (t: ContentType, i: number) => { const w = win[t]; return !w || ((i + 0.5) / nodes.length >= w[0] && (i + 0.5) / nodes.length <= w[1]); };
  // (a windowed type gets no more than its window has room for: the open content nodes inside it, never two side by side, so half of
  // them rounded up; the rest go to the unwindowed types by share)
  for (const t of types) {
    if (!win[t]) continue;
    const room = Math.ceil(slots.filter(({ i }) => inWin(t, i) && (!fixed.has(i) || fixed.get(i) === t)).length / 2);
    while (deal.get(t)! > Math.max(room, fixedN(t))) {
      const to = types.filter((u) => !win[u] && (shares[u] ?? 0) > 0).sort((a, b) => (shares[b] ?? 0) / Math.max(1, deal.get(b)!) - (shares[a] ?? 0) / Math.max(1, deal.get(a)!))[0];
      if (!to) break;
      deal.set(t, deal.get(t)! - 1);
      deal.set(to, deal.get(to)! + 1);
    }
  }
  // (a type that needs a move comes only after that move's teach node, or when an earlier stage taught it)
  const needs = M.graphs?.typeNeeds ?? {};
  const known = new Set(Object.entries(M.lessons ?? {}).filter(([, st]) => stageOrder(st) < stageOrder(stageId)).map(([m]) => m));
  const taughtBy = (t: ContentType, i: number) => { const m = needs[t]; return !m || known.has(m) || nodes.some((q, k) => k < i && q.job === 'teach' && q.teaches === m); };
  const neighbourOK = (prev: { n: MissionNode; c: ContentType } | undefined, n: MissionNode, c: ContentType) =>
    !prev || prev.c !== c || n.job === 'teach' || (prev.n.job === 'teach' && n.job === 'practise');
  let best: Map<number, ContentType> | null = null, bestBad = Infinity;
  for (let tryN = 0; tryN < 12 && bestBad > 0; tryN++) {
    const left = new Map(deal), used = new Map<ContentType, number>(), got = new Map<number, ContentType>();
    for (const [i, c] of fixed) { left.set(c, (left.get(c) ?? 0) - 1); used.set(c, (used.get(c) ?? 0) + 1); }
    let bad = 0;
    let prev: { n: MissionNode; c: ContentType } | undefined;
    for (let k = 0; k < slots.length; k++) {
      const { n, i } = slots[k];
      let c = fixed.get(i);
      if (!c) {
        const nextFixed = slots[k + 1] && fixed.get(slots[k + 1].i);
        const ok = (t: ContentType) => (used.get(t) ?? 0) < cap && inWin(t, i) && taughtBy(t, i) && neighbourOK(prev, n, t) && !(nextFixed === t && slots[k + 1].n.job !== 'teach' && !(n.job === 'teach' && slots[k + 1].n.job === 'practise'));
        const pool = [...new Set([...types, ...fixed.values()])];
        const order = (xs: ContentType[]) => xs.map((t) => [t, (left.get(t) ?? 0) + r() * 0.5] as const).sort((a, b) => b[1] - a[1]).map(([t]) => t);
        c = order(pool.filter((t) => (left.get(t) ?? 0) > 0 && ok(t)))[0] ?? order(pool.filter(ok))[0];
        if (!c) { bad++; c = order(pool)[0]; }
        left.set(c, (left.get(c) ?? 0) - 1);
        used.set(c, (used.get(c) ?? 0) + 1);
      } else if (prev && !neighbourOK(prev, n, c)) bad++;
      got.set(i, c);
      prev = { n, c };
    }
    for (const [t, k] of left) if (Math.abs(k) > 1) bad++;
    if (bad < bestBad) { best = got; bestBad = bad; }
  }
  // (R-165.120, the pool: a type is dealt to a node only when the stage's pool can fill it. The deal above knows the counts and the
  // caps but not the sections: it gave a node a type no section of its job has, or two nodes the one section they share, and the lay
  // then filled the slot past its rule and the roll failed by name ("pool short"). When the pool cannot fill the dealt stage, the
  // fewest nodes are re-typed (the same caps, neighbours, windows, lessons and deal counts held as above) until it can; a deal the
  // pool fills is left exactly as dealt)
  const supplied = supplyDeal(nodes, slots, best!, M, budget, seed, (got) => {
    let bad = 0;
    const used = new Map<ContentType, number>();
    let prev: { n: MissionNode; c: ContentType } | undefined;
    for (const { n, i } of slots) {
      const c = got.get(i)!;
      used.set(c, (used.get(c) ?? 0) + 1);
      if (!fixed.has(i) && (!inWin(c, i) || !taughtBy(c, i))) bad++;
      if (prev && !neighbourOK(prev, n, c)) bad++;
      prev = { n, c };
    }
    for (const [, k] of used) if (k > cap) bad += k - cap;
    for (const t of new Set([...deal.keys(), ...used.keys()])) if (Math.abs((used.get(t) ?? 0) - (deal.get(t) ?? 0)) > 1) bad++;
    return bad;
  }, [...new Set([...types, ...fixed.values()])], new Set(fixed.keys()));
  for (const { n, i } of slots) n.content = supplied.get(i);
  return Object.fromEntries(deal);
}

/**
 * The dealt types as the pool can fill them (dealContent's last step). `breaches` counts the deal's own rules a typing breaks; a
 * re-typing is taken only when it breaks no more of them than the deal did and leaves fewer slots the pool cannot fill (or, with
 * none short, less climb over the corridor's height): first one node changed, then two (two nodes trading types keeps every count),
 * then three; among equals the seed chooses (its own stream).
 */
function supplyDeal(
  nodes: MissionNode[], slots: ReadonlyArray<{ n: MissionNode; i: number }>, dealt: ReadonlyMap<number, ContentType>, M: WorldManifest, budget: StageBudget, seed: number,
  breaches: (got: ReadonlyMap<number, ContentType>) => number, types: readonly ContentType[], fixed: ReadonlySet<number>,
): ReadonlyMap<number, ContentType> {
  if (!nodes.every((n) => n.count)) return dealt;
  const stageLen = nodes.reduce((a, n) => a + n.count!, 0);
  const fits = poolFits({ M, budget, nodes, stageLen, exitDy: (t) => t.exitDy });
  const byId = new Map(M.sections.map((t) => [t.id, t]));
  const maxPer = (id: string) => byId.get(id)?.maxPerStage ?? M.graphs?.maxPerStage ?? Infinity;
  // (and the climb, R-165.120: the least the dealt stage must rise, each slot taking the section of its rule that climbs least (a
  // node that must end higher, the least of its rising ones), against the corridor's height from the ground to its top. A deal over
  // it cannot be laid inside the corridor whatever is chosen: 1-1's fresh seeds, 1 listable in 30 over the line, 22 in 24 just under.
  // `spare`: two of the corridor's soft bands, the height the joins give back; set so that no proven stage's deal is over the line)
  const brief = M.graphs?.briefs?.[budget.id];
  const room = M.ground.y - M.corridor.top + 2 * M.corridor.soft;
  const short = (got: ReadonlyMap<number, ContentType>): number => {
    const need: string[][] = [];
    let i = 0, climb = 0;
    nodes.forEach((n, k) => {
      const typed = got.has(k) ? { ...n, content: got.get(k) } : n;
      for (let c = 0; c < n.count!; c++, i++) {
        const cands = M.sections.filter((t) => fits(t, typed, i));
        need.push(cands.map((t) => t.id));
        const mustClimb = c === 0 && (!!n.mustRise || (!!brief?.endHigh && brief.trend === 'up' && n.job === 'signature'));
        const dys = cands.map((t) => t.exitDy).filter((d) => !mustClimb || d < 0);
        if (dys.length) climb += Math.max(0, -Math.max(...dys));
      }
    });
    // (a slot with no section first, by far; then the px of climb over the corridor)
    return unfilled(need, maxPer) * 1e6 + Math.max(0, climb - room);
  };
  const base = short(dealt);
  if (!base) return dealt;
  const rules = breaches(dealt);
  const open = slots.map((q) => q.i).filter((i) => !fixed.has(i));
  const rng = rngFor(seed, 71);
  let at = 0;
  let bestShort = base, found: Array<Map<number, ContentType>> = [];
  for (let k = 1; k <= 3 && bestShort > 0; k++) {
    const walk = (from: number, left: number, got: Map<number, ContentType>) => {
      if (!left) {
        if (breaches(got) > rules) return;
        const sh = short(got);
        // (fewer slots short wins; among equals the fewest nodes changed, so a later round only replaces with strictly fewer)
        if (sh < bestShort) { bestShort = sh; found = [new Map(got)]; at = k; }
        else if (sh === bestShort && sh < base && at === k) found.push(new Map(got));
        return;
      }
      for (let a = from; a <= open.length - left; a++) {
        const was = got.get(open[a])!;
        for (const t of types) {
          if (t === was) continue;
          got.set(open[a], t);
          walk(a + 1, left - 1, got);
        }
        got.set(open[a], was);
      }
    };
    walk(0, k, new Map(dealt));
  }
  return found.length ? found[Math.floor(rng() * found.length)] : dealt;
}

/** a content type's letter in the node code (§8.0) */
const CONTENT_LETTER: Readonly<Record<string, string>> = { ground: 'g', floating: 'f', climb: 'c', bounce: 'b', rope: 'r', crumble: 'k', water: 'w', hazard: 'h' };

/**
 * A rolled graph's realised node code (NODES.md §8.1-8.2), one token per node from what was laid there: the job's letter; for a content
 * job the content letter (the node's first section's type), the move digit (2 when a section there needs or uses the double; none on a
 * bounce with no double, as `Tb`), the shape mark and the tempo mark; a fork as `F[high|low]`, its high road rising with the find, its
 * low road the section's own type. The string is checked against §8.3 (V18 reads the laid pieces, elsewhere).
 */
function realisedCode(graph: MissionGraph, laid: Laid, M: WorldManifest, budget: StageBudget): Pick<Gen2Meta, 'code' | 'codeString' | 'codeErrors' | 'nodes' | 'brief'> {
  const plan = laid.plan;
  const byId = new Map(M.sections.map((t) => [t.id, t]));
  const tokens: CodeToken[] = [];
  for (const n of graph.nodes) {
    const secs = plan.filter((p) => p.node === n.id).map((p) => byId.get(p.template)).filter((t): t is SectionTemplate => !!t);
    const letter = LETTER_OF[n.job!] ?? 'P';
    if (letter === 'A' || letter === 'R' || letter === 'E' || letter === 'L' || letter === 'Y') { tokens.push({ job: letter, shape: '' }); continue; }
    const first = secs[0];
    const content = first?.content && first.content !== 'structural' ? CONTENT_LETTER[first.content] : n.content ? CONTENT_LETTER[n.content] : undefined;
    const dbl = secs.some((t) => t.teaches === 'double' || (t.uses ?? []).includes('double') || (t.needs ?? []).includes('double'));
    const move = dbl ? '2' : content === 'b' ? undefined : '1';
    const tempo = n.dials ? (n.dials.tempo === 'hurry' ? '>' : '<') : undefined;
    const marks = { ...(content ? { content } : {}), ...(move ? { move: move as '1' | '2' } : {}) };
    if (letter === 'F') {
      tokens.push({ job: 'F', shape: '', roads: [[{ job: 'P', shape: '^', find: true, ...(move ? { move: move as '1' | '2' } : {}) }], [{ job: 'P', shape: '', ...marks }]], ...(tempo ? { tempo } : {}) });
      continue;
    }
    tokens.push({ job: letter, shape: n.job === 'climb' ? '^' : MARK_OF[n.shape ?? 'flat'], ...marks, ...(tempo ? { tempo } : {}) });
  }
  const brief = M.graphs?.briefs[budget.id];
  const code = tokens.map(formatToken);
  const codeErrors = checkCode(tokens, {
    teaches: graph.nodes.filter((n) => n.job === 'teach').length,
    needsFork: !!brief && brief.branching !== 'none',
    mini: budget.stage,
    // (V3, packet E12 item 5: a move the world's `lessons` say an earlier stage taught is taught)
    known: Object.entries(M.lessons ?? {}).filter(([, st]) => stageOrder(st) < stageOrder(budget.id)).map(([m]) => m),
    ...(brief ? { trend: brief.trend } : {}),
    ...(M.graphs?.windows ? { windows: Object.fromEntries(Object.entries(M.graphs.windows).map(([t, w]) => [CONTENT_LETTER[t], w!])) } : {}),
    ...(graph.deal ? { deal: Object.fromEntries(Object.entries(graph.deal).map(([t, k]) => [CONTENT_LETTER[t], k!])) } : {}),
  });
  // (each node as laid: its sections' x-range, and its first block's landing)
  const nodes = graph.nodes.map((n, k) => {
    const secs = laid.sections.filter((q) => q.node === n.id);
    const blk = laid.blocks?.find((b) => secs.some((q) => q.uid === b.uid));
    // (a twist's two answers, for the gate's B5 run with each move taken away: the double and the bounce its sections ask for)
    const asks = (m: string) => secs.some((q) => { const t = byId.get(q.template); return !!t && (t.teaches === m || (t.uses ?? []).includes(m) || (t.needs ?? []).includes(m as Move)); });
    const answered = [...new Set(secs.flatMap((q) => byId.get(q.template)?.answers ?? []))];
    const moves = answered.length ? answered : n.job === 'twist' ? (['double', 'bounce'] as const).filter(asks) : [];
    return { token: code[k], x0: secs.length ? Math.min(...secs.map((q) => q.x0)) : 0, x1: secs.length ? Math.max(...secs.map((q) => q.x1)) : 0, ...(blk ? { block: blk.landing.x } : {}), ...(moves.length ? { moves: [...moves] } : {}) };
  });
  return { code, codeString: code.join(' '), codeErrors, nodes, ...(brief ? { brief } : {}) };
}

// ───────────────────────────── pass 3: sections, stitched ─────────────────────────────


interface LocalPiece {
  key: string;
  x: number;
  y: number;
  w: number;
  h: number;
  shape: SectionTemplate['pieces'][number]['shape'];
  style?: Platform['style'];
  /** a brick's piece: its engine slot (SectionPiece.slot) */
  slot?: string;
  main: boolean;
  landing: boolean;
  /** an obstacle to hop (an `on` block): a beat */
  hop: boolean;
  /** a crumbling ruin tile (SectionPiece.crumble) */
  crumble?: boolean;
  /** a hanging piece (x is where it hangs, y its top, h its length, w 0): a liana with its swing, or a climbing vine */
  hang?: { kind: 'liana' | 'vine'; swing?: LianaSwing; from?: string; window?: number; gap?: [number, number] };
  /** a ledge a rope crosses to (place `rope`): the piece the rope hangs from */
  ropeFrom?: string;
}
interface LocalGap {
  x0: number;
  x1: number;
  y: number;
  /** the gap's lower lip (its far or near ledge, whichever lies lower): a catch bough hangs under it, never under the upper one */
  lo: number;
  pit: boolean;
  /** a section's water gap (the rule's `water`): nothing laid under it, whatever the world's falls */
  water?: boolean;
  /** a section's soft gap (the rule's `soft`): a soft pit under it, whatever the world's falls (World 8's gaps in the dark, where a
   *  deadly fall would be a blind jump) */
  soft?: boolean;
  /** a gap under a liana (a `land` perch past it), or a glide gap: its soft pit climbs back to the take-off ledge (`lips`: that ledge's top, the
   *  perch's), never forward to the perch */
  back?: { lips: [number, number] };
  /** a level block gap: no pit and no stair under it; a fall sets him back on the take-off ledge, soft (Laid.heartFalls, `soft`) */
  putBack?: boolean;
  /** a place marked `hurt`: the world's hurt floor under it (WorldManifest.hurtFloor), no pit and no steps */
  hurt?: boolean;
}
/** a section laid out in its own space: its entry anchor at (0, 0) */
/** the reach a laid jump asks (verdicts.ts RouteAsk before it is classified): local, then world, px; `yTake` the floor he leaves (a
 *  bounce: the floor its mushroom stands on), `yLand` the top he lands on */
export interface LocalAsk { x0: number; x1: number; yTake: number; yLand: number; move: 'single' | 'double' | 'bounce'; block?: 'double' | 'bounce'; thin: boolean; key: string }
export interface LocalLayout {
  pieces: LocalPiece[];
  gaps: LocalGap[];
  asks?: LocalAsk[];
  entry: { piece: string; kind: PortKind };
  exit: { piece: string; kind: PortKind; x: number; y: number };
  width: number;
  mirrored: boolean;
  /** the section's sockets and its rolled sub-block versions' sockets */
  sockets: Socket[];
  /** the sub-block versions rolled (sub-block id -> version id); empty for a section with none */
  versions: Record<string, string>;
}

export interface LayLocalOptions {
  /** the roll's tempo (manifest rollRanges): a section's jump shares times `gap` (never past `gapMax`), its rises times `rise` */
  tempo?: { gap: number; gapMax: number; rise: number };
  /** the versions to lay (Easy lays Normal's); a sub-block not named here is rolled */
  versions?: Readonly<Record<string, string>>;
  /** the stream the versions are rolled from (default: the layout's own stream) */
  pickRng?: Rng;
  /** the versions this world has used: one not yet used is preferred, and the one laid is marked */
  once?: WorldOnce<string>;
  /** the world's soft pit depth (manifest.pitDepth): a perch past a liana keeps clear of the steps out of the pit under it */
  pitDepth?: number;
}

/**
 * Pick one version of each of a section's sub-blocks: `fixed` first (Easy following Normal), otherwise a weighted order (each draw
 * weighted by `weight`, without putting back) and the first in it this world has not used yet (WorldOnce: the one used longest ago
 * when all have been). Draws nothing for a section with no sub-blocks, so such sections lay exactly as they did before.
 */
/** every combination of a section's drawable sub-block versions (an Easy-only twin is not one), in the sub-blocks' own order */
export function versionCombos(tpl: SectionTemplate): Array<Record<string, string>> {
  let out: Array<Record<string, string>> = [{}];
  for (const sb of tpl.subBlocks ?? []) out = out.flatMap((c) => sb.versions.filter((x) => !x.easyOnly).map((x) => ({ ...c, [sb.id]: x.id })));
  return out.slice(0, 16);
}
export function chooseVersions(tpl: SectionTemplate, rng: Rng, once?: WorldOnce<string>, fixed?: Readonly<Record<string, string>>, easy = false): Record<string, string> {
  const out: Record<string, string> = {};
  for (const sb0 of tpl.subBlocks ?? []) {
    // (an Easy-only twin is never drawn: it is laid only in its version's place, on Easy, below)
    const sb = { ...sb0, versions: sb0.versions.filter((x) => !x.easyOnly) };
    if (!sb.versions.length) throw new Error(`gen2 section ${tpl.id}: sub-block ${sb.id} has no versions`);
    const want = fixed?.[sb.id];
    let v = want === undefined ? undefined : sb0.versions.find((x) => x.id === want);
    if (want !== undefined && !v) throw new Error(`gen2 section ${tpl.id}: sub-block ${sb.id} has no version ${want}`);
    if (v) once?.use(versionKey(tpl.id, sb.id, v.id));
    else {
      const left = [...sb.versions];
      const order: typeof left = [];
      while (left.length) {
        const p = pickWeighted(rng, left, (x) => x.weight ?? 1)!;
        order.push(p);
        left.splice(left.indexOf(p), 1);
      }
      v = once ? once.pick(order, (x) => versionKey(tpl.id, sb.id, x.id))! : order[0];
    }
    // (Easy lays a version's named twin in its place: the plan keeps Normal's version, so Easy is still Normal's stage, its gap a rise)
    if (easy && v.easy) {
      if (!sb0.versions.some((x) => x.id === v!.easy)) throw new Error(`gen2 section ${tpl.id}: sub-block ${sb.id} version ${v.id}'s Easy twin ${v.easy} is not one of its versions`);
      out[sb.id] = v.easy;
      continue;
    }
    out[sb.id] = v.id;
  }
  return out;
}

/** a piece's reference to another piece of its section (the one it is placed after, on or over) */
const refOf = (pc: SectionPiece): string | null => {
  const pl = pc.place;
  return pl.kind === 'start' ? null : pl.kind === 'on' || pl.kind === 'over' || pl.kind === 'climb' ? pl.on : pl.after;
};

/**
 * Lay one section out in its own space with the budget's rules: every jump inside it sized from the envelope (its `share` of
 * maxGap for that rise), every rise clamped to the rise limit, Easy's landings widened. Its sub-blocks' versions are rolled first
 * (chooseVersions) and their pieces laid with the section's, each as soon as the piece it refers to is laid (in list order: the
 * section's pieces, then each sub-block's version). Mirrored, it is flipped left to right (its exit piece becomes its entry) and
 * the sockets read 1 - t.
 */
export function layLocal(tpl: SectionTemplate, budget: StageBudget, rng: Rng, mirrored = false, lo: LayLocalOptions = {}): LocalLayout {
  const by = new Map<string, LocalPiece>();
  const out: LocalPiece[] = [];
  const gaps: LocalGap[] = [];
  const asks: LocalAsk[] = [];
  const dblOK = budget.moves.includes('double');
  const T = lo.tempo;
  const shareFor = (s: Range | undefined) => {
    const v = Math.min(1, s === undefined ? 0.5 + 0.3 * budget.heat + 0.1 * rng() : roll(rng, s));
    return T ? Math.min(T.gapMax, v * T.gap) : v;
  };
  const versions = chooseVersions(tpl, lo.pickRng ?? rng, lo.once, lo.versions, budget.difficulty === 'easy');
  const chosen = (tpl.subBlocks ?? []).map((sb) => sb.versions.find((v) => v.id === versions[sb.id])!);
  const all: SectionPiece[] = [...tpl.pieces, ...chosen.flatMap((v) => v.pieces)];
  const sockets: Socket[] = [...tpl.sockets, ...chosen.flatMap((v) => v.sockets ?? [])];
  const seenKey = new Set<string>();
  for (const pc of all) {
    if (seenKey.has(pc.key)) throw new Error(`gen2 section ${tpl.id}: two pieces named ${pc.key} (with versions ${JSON.stringify(versions)})`);
    seenKey.add(pc.key);
  }
  const seenSock = new Set<string>();
  for (const s of sockets) {
    if (seenSock.has(s.id)) throw new Error(`gen2 section ${tpl.id}: two sockets named ${s.id} (with versions ${JSON.stringify(versions)})`);
    seenSock.add(s.id);
  }
  // (each piece as soon as what it refers to is laid; with no sub-blocks and only backward references this is the list's order)
  const pending = [...all];
  while (pending.length) {
    const at = pending.findIndex((q) => {
      const k = refOf(q);
      return (k === null || by.has(k)) && (!q.from || by.has(q.from));
    });
    if (at < 0) {
      const p0 = pending[0];
      throw new Error(`gen2 section ${tpl.id}: piece ${p0.key} refers to ${refOf(p0)}, which is never laid (versions ${JSON.stringify(versions)})`);
    }
    const pc = pending.splice(at, 1)[0];
    let w = roll(rng, pc.w);
    let x = 0;
    let y = 0;
    let h = pc.h ?? 24;
    let hang: LocalPiece['hang'];
    const pl = pc.place;
    const ref = (k: string) => by.get(k)!;
    // (the highest a bounce block's lip may stand, local y: its mushroom's cap less the bounce's reach from it)
    const bounceCap = (q: SectionPiece): number | undefined => {
      const m = q.block === 'bounce' && q.from ? by.get(q.from) : undefined;
      return m ? m.y - (judgedOnArcs(budget.id) ? bounceLipOverCap(budget.difficulty) : 0.95 * BOUNCE_REACH) : undefined;
    };
    if (pl.kind === 'start') {
      x = 0;
      y = 0;
    } else if (pl.kind === 'walk') {
      const a = ref(pl.after);
      const dy = pl.dy === undefined ? 0 : roll(rng, pl.dy);
      x = a.x + a.w;
      // (a bounce block's lip: clamped to the bounce's reach from its mushroom's cap, not a walk's; NODES.md §8.7 B3)
      const cap = bounceCap(pc);
      y = cap !== undefined ? Math.max(a.y + dy, cap) : a.y + Math.max(-riseCap(false, 0.9, budget), dy);
      // (a bounce lip: the reach it asks of the bounce, over the floor its mushroom stands on; verdicts.ts judges it on 1-1)
      if (cap !== undefined) asks.push({ x0: a.x + a.w, x1: a.x + a.w, yTake: ref(pc.from!).y + CAP_UP.px, yLand: y, move: 'bounce', block: pc.block, thin: thinLaid(pc, w), key: pc.key });
    } else if (pl.kind === 'jump' || pl.kind === 'double' || pl.kind === 'pit') {
      const a = ref(pl.after);
      const glide = pl.kind === 'pit' && pl.jump === 'glide' && budget.moves.includes('glide') && dblOK;
      const dbl = (pl.kind === 'pit' ? pl.jump !== 'jump' : pl.kind === 'double') && dblOK;
      let dy = pl.kind === 'pit' || pl.dy === undefined ? 0 : roll(rng, pl.dy);
      if (T && !pc.block) dy *= T.rise;
      const cap = bounceCap(pc);
      dy = cap !== undefined ? Math.max(dy, cap - a.y) : Math.max(-riseCap(dbl, 0.95, budget, thinLaid(pc, w)), dy);
      const g = glide ? glideGap(-dy, budget) : gapFor(-dy, dbl, budget);
      // (a pixel band, gapPx: laid in it exactly from the same one draw a share takes, so the stream after it is unchanged; never past the
      // jump's reach at this rise, which fails the section by name)
      if (pl.gapPx && pl.gapPx[1] > g) throw new Error(`gen2 section ${tpl.id}: ${pc.key}'s gapPx ${pl.gapPx[0]}-${pl.gapPx[1]} is past the ${glide ? 'glide' : dbl ? 'double' : 'jump'}'s reach ${R(g)} px at a ${R(-dy)} px rise`);
      const gap = pl.gapPx ? R(roll(rng, pl.gapPx)) : Math.max(60, R(shareFor(pl.share) * (g > 0 ? g : 60)));
      x = a.x + a.w + gap;
      y = a.y + dy;
      // (a glide's soft pit climbs back to its take-off, as a liana's does: with steps out on the far side the leaf would be optional)
      // (and so does a block's (NODES §8.7, Roll B 11-05): stepped toward its landing, a stair inside the gap took off a single's reach
      // under the lip and the double was two hops; the take-off side's stair keeps the block a block)
      // (a LEVEL block gap, its far lip no higher than the take-off (W1's 'd'), has no stair at all, the lead's ruling A 11-06: any stair
      // back up to a level take-off tops out within a hop of the far lip too, and on a ~200 px gap stood a single's reach from the landing;
      // a fall there puts him back on the take-off ledge instead, soft, no life lost (a soft heart-fall zone), on both settings)
      const putBack = !!pc.block && !pl.water && dy >= -20;
      const back = (glide || pc.block) && !pl.water && !putBack ? { back: { lips: [a.y, y] as [number, number] } } : {};
      gaps.push({ x0: a.x + a.w, x1: x, y: Math.min(a.y, y), lo: Math.max(a.y, y), pit: pl.kind === 'pit' || !!pl.soft, ...(pl.water ? { water: true } : {}), ...(pl.soft && !pl.water ? { soft: true } : {}), ...back, ...(putBack ? { putBack } : {}), ...(pl.hurt ? { hurt: true } : {}) });
      // (the reach this jump asks: verdicts.ts classifies and judges it on 1-1, ADR-001; a glide is no flown move)
      if (!glide) asks.push({ x0: a.x + a.w, x1: x, yTake: cap !== undefined ? ref(pc.from!).y + CAP_UP.px : a.y, yLand: y, move: cap !== undefined ? 'bounce' : dbl || pc.block === 'double' ? 'double' : 'single', block: pc.block, thin: thinLaid(pc, w), key: pc.key });
    } else if (pl.kind === 'rope') {
      // a ledge past a gap no jump or glide clears, a shimmy rope across (rope.ts; the rope itself is hung once both are placed: layStage)
      // (its gap is a liana's, `back` (World 8, 2026-10-31): a soft pit climbing back to `after`, or World 8 Normal's heart fall)
      const a = ref(pl.after);
      const gap = Math.max(ROPE_MIN_GAP + 90, roll(rng, pl.gap));
      x = a.x + a.w + gap;
      y = a.y;
      gaps.push({ x0: a.x + a.w, x1: x, y: a.y, lo: Math.max(a.y, y), pit: true, back: { lips: [a.y, y] }, ...(pl.soft ? { soft: true } : {}) });
    } else if (pl.kind === 'swing') {
      // a liana past `after`'s end, swinging by itself (its numbers rolled here, from the slot's stream: the same on Easy)
      const a = ref(pl.after);
      if (pc.shape !== 'liana') throw new Error(`gen2 section ${tpl.id}: ${pc.key} swings, so its shape is 'liana'`);
      const top = a.y - roll(rng, pl.top ?? LIANA.top);
      // (the engine's swing unless the author sets one: VINE.amp at most, the setting's own period)
      const swing: LianaSwing = { amp: Math.min(VINE.amp, roll(rng, pl.amp ?? VINE.amp)), period: roll(rng, pl.period ?? VINE.period[budget.difficulty]) };
      x = a.x + a.w + roll(rng, pl.reach ?? LIANA.reach);
      y = top;
      w = 0;
      h = Math.min(a.y + 30, top + LIANA.len) - top;
      hang = { kind: 'liana', swing, from: pl.after };
    } else if (pl.kind === 'land') {
      // a perch past a liana: its near end in the band a release of LIANA.window or more lands on (lianaBand), `share` along it
      const lv = ref(pl.after);
      if (lv.hang?.kind !== 'liana') throw new Error(`gen2 section ${tpl.id}: ${pc.key} lands from ${pl.after}, which is not a liana`);
      const a = ref(lv.hang.from!);
      const dy0 = pl.dy === undefined ? 0 : roll(rng, pl.dy);
      const share = shareFor(pl.share);
      const need = LIANA.window[budget.difficulty];
      // (past every jump: from the swing's ledge, and from every step of the soft pit under it, whose climb goes back to that ledge)
      const minFor = (dy: number) => {
        const perchY = a.y + dy;
        let min = a.x + a.w + jumpLinkGap(-dy, budget.world, budget.stage, budget.doubleTaught) + 20;
        if ((budget.pit === 'soft' || pl.soft) && !pl.water) {
          const pit = backPit(a.x + a.w, a.x + a.w + 4000, a.y, perchY, lo.pitDepth ?? 0, riseCap(false, 1, budget) * PIT.hop);
          for (const st of [{ x: a.x + a.w, top: pit.floor, w: 0 }, ...pit.steps]) {
            const g = jumpLinkGap(st.top - perchY, budget.world, budget.stage, budget.doubleTaught);
            if (g >= 0) min = Math.max(min, st.x + st.w + g + 20);
          }
        }
        return min;
      };
      // (a perch the window or today's check cannot reach is moved, nearest first: raised or lowered 40-160 px (a raised perch is
      // past the glide sooner, and the calm swing reaches it: never a wider swing), then levelled toward the swing's ledge (half its
      // rise, then 120, 80, 40 px over it, then level); at each
      // height widened up to 400 px. Only when none fits is the section named)
      let band: [number, number] | null = null;
      let dy = dy0;
      for (const d of [...new Set([0, -40, 40, -80, 80, -120, -160].map((o) => dy0 + o).concat([dy0 / 2, -120, -80, -40, 0]))]) {
        for (const extra of [0, 100, 200, 400]) {
          band = lianaBand({ x: a.x, y: a.y, w: a.w }, { x: lv.x, topY: lv.y, bottomY: lv.y + lv.h }, lv.hang.swing!, d, w + extra, need, minFor(d), budget.difficulty);
          if (band) {
            dy = d;
            w += extra;
            break;
          }
        }
        if (band) break;
      }
      if (!band) throw new Error(`gen2 section ${tpl.id}: no perch past the liana ${pl.after}, however wide or level, both lies past every jump (${R(minFor(0) - a.x - a.w)} px out) and leaves a release window of ${need} s`);
      x = band[0] + share * (band[1] - band[0]);
      y = a.y + dy;
      lv.hang.window = lianaRelease({ x: lv.x, topY: lv.y, bottomY: lv.y + lv.h }, lv.hang.swing!, { x, y, w }, budget.difficulty);
      lv.hang.gap = [a.x + a.w, x];
      gaps.push({ x0: a.x + a.w, x1: x, y: Math.min(a.y, y), lo: Math.max(a.y, y), pit: true, back: { lips: [a.y, y] }, ...(pl.water ? { water: true } : {}), ...(pl.soft && !pl.water ? { soft: true } : {}) });
    } else if (pl.kind === 'climb') {
      const a = ref(pl.on);
      if (pc.shape !== 'vine') throw new Error(`gen2 section ${tpl.id}: ${pc.key} climbs, so its shape is 'vine'`);
      h = roll(rng, pl.h);
      x = a.x + roll(rng, pl.at) * a.w;
      y = a.y - h;
      w = 0;
      hang = { kind: 'vine' };
    } else if (pl.kind === 'on') {
      const a = ref(pl.on);
      const rolled = roll(rng, pl.h);
      h = Math.min(rolled, riseCap(dblOK, 0.95, budget));
      w = Math.min(w, a.w);
      x = a.x + roll(rng, pl.at) * (a.w - w);
      // (R-165.122, 1-1 only (judgedOnArcs, the boundary): a hop rock is a wall and its climb is judged; hopLay below)
      if (judgedOnArcs(budget.id) && pc.shape === 'block' && !all.some((q) => q.shape === 'bouncy' && q.place.kind === 'on' && q.place.on === pc.key)) {
        const hop = hopLay(pc, pl.h, rolled, h, x, a, out, budget);
        h = hop.h;
        if (hop.ask) asks.push(hop.ask);
      }
      y = a.y - h;
    } else if (pl.kind === 'over') {
      const a = ref(pl.on);
      x = a.x + roll(rng, pl.at) * a.w;
      y = a.y + roll(rng, pl.dy);
      // (placed past the end of the piece it is over (at > 1), it leaves a gap at that end: recorded as a ledge gap, so the world's catch
      // bough or pit goes under it as under a jump's. Unrecorded, W1's mushroom chain b (b2 over b1 at 1.05) left a 20 px slot over
      // nothing off b1's end, a life lost on Roll A once the chain was no longer laid mirrored: stage11gen2.test 'nothing can cost a life')
      if (x > a.x + a.w + 1) gaps.push({ x0: a.x + a.w, x1: x, y: Math.min(a.y, y), lo: Math.max(a.y, y), pit: false });
    }
    // (a crumbling tile is a tile's width whatever the roll or Easy's pad: levelCheck holds every tile to it; never main, never needed)
    const crumble = !!pc.crumble && !hang;
    const landing = (!!pc.landing || pl.kind === 'land') && pl.kind !== 'start' && !hang && !crumble;
    if (landing) w += budget.landingPad;
    if (crumble) (w = CRUMBLE_TILE_W), (h = CRUMBLE_H);
    const p: LocalPiece = {
      key: pc.key, x: R(x), y: R(y), w: R(w), h: R(h), shape: pc.shape, style: pc.style, main: crumble ? false : pc.main ?? pl.kind !== 'over', landing, hop: pl.kind === 'on',
      ...(hang ? { hang } : {}), ...(crumble ? { crumble } : {}), ...(pl.kind === 'rope' ? { ropeFrom: pl.after } : {}), ...(pc.slot && !hang && !crumble ? { slot: pc.slot } : {}),
    };
    by.set(pc.key, p);
    out.push(p);
  }
  let entry = { ...tpl.entry };
  let exitP = { ...tpl.exit };
  const right = Math.max(...out.map((p) => p.x + p.w));
  const left = Math.min(...out.map((p) => p.x));
  if (mirrored) {
    for (const p of out) p.x = right + left - (p.x + p.w);
    for (const g of gaps) [g.x0, g.x1] = [right + left - g.x1, right + left - g.x0];
    // (mirrored, he takes off from the other lip: the take-off and the landing swap)
    for (const k of asks) [k.x0, k.x1, k.yTake, k.yLand] = [right + left - k.x1, right + left - k.x0, k.yLand, k.yTake];
    [entry, exitP] = [exitP, entry];
  }
  // (the entry anchor is the top-left of the entry piece: move everything so it sits at (0, 0))
  const e = by.get(entry.piece);
  if (!e) throw new Error(`gen2 section ${tpl.id}: its entry piece ${entry.piece} is not laid`);
  if (e.hang || by.get(exitP.piece)?.hang) throw new Error(`gen2 section ${tpl.id}: its entry and exit are ledges, not a liana or a vine`);
  const ox = e.x;
  const oy = e.y;
  for (const p of out) {
    p.x -= ox;
    p.y -= oy;
    if (p.hang?.gap) p.hang.gap = [p.hang.gap[0] - ox, p.hang.gap[1] - ox];
  }
  for (const g of gaps) {
    g.x0 -= ox;
    g.x1 -= ox;
    g.y -= oy;
    if (g.back) g.back.lips = [g.back.lips[0] - oy, g.back.lips[1] - oy];
  }
  for (const k of asks) { k.x0 -= ox; k.x1 -= ox; k.yTake -= oy; k.yLand -= oy; }
  const xp = by.get(exitP.piece);
  if (!xp) throw new Error(`gen2 section ${tpl.id}: its exit piece ${exitP.piece} is not laid`);
  return { pieces: out, gaps, asks, entry, exit: { ...exitP, x: xp.x + xp.w, y: xp.y }, width: right - left, mirrored, sockets, versions };
}

/** everything pass 3 hands on */
export interface Laid {
  sections: PlacedSection[];
  /** a rolled graph's required sections that found no node, and why: the roll fails */
  missing?: string[];
  /** a rolled graph's sections whose laid exit left the corridor (a version that ends far from its declared exitDy): swapped */
  strays?: Array<{ uid: string; y: number }>;
  /** V19's late rise as laid: each mustRise node, the height it had to end above (minus 20 px) and where it ended */
  rise?: Array<{ node: string; to: number; exitY: number }>;
  /** a rolled graph's blocks (NODES.md §8.7): each teach or test section's block pieces, as laid */
  blocks?: Array<{ uid: string; key: string; kind: 'double' | 'bounce'; landing: Platform }>;
  /** a rolled graph's nodes filled past their rule (no section of the dealt type left: by job only; none for the job: by phase) */
  loosened?: string[];
  plan: PlanSlot[];
  platforms: Platform[];
  /** the gaps of the route (inner and seams), for the arcs and the repair */
  gaps: Array<{ x0: number; x1: number; y: number; from?: Platform; to?: Platform; section?: string; water?: boolean; soft?: boolean }>;
  /** the reach each jump on the route asks, world px, by section (verdicts.ts judges them on 1-1) */
  asks?: Array<LocalAsk & { section: string }>;
  /** the zones the sections lay (a tide, darkness) */
  zones: Zone[];
  /** the gaps a fall into costs a heart, not a life (WorldManifest.heartFalls: World 8 Normal's swings and glides), no pit under them;
   *  `y`: a hollow's hurt line, its hurt floor's top (WorldManifest.hurtFloor) */
  heartFalls: Array<{ x0: number; x1: number; soft?: boolean; y?: number }>;
  spawn: { x: number; y: number; piece: Platform };
  exit: { x: number; y: number; piece: Platform };
  /** the lianas and climbing vines the sections hang */
  vines: Vine[];
  /** the shimmy ropes (place `rope`) */
  ropes: Rope[];
  width: number;
  bottom: number;
  nextId: number;
  /** the sections the roll's theme favoured (undefined: it favoured them all) */
  theme?: string[];
}

export interface LayOptions {
  /** follow this plan (Easy follows Normal's) instead of choosing */
  plan?: PlanSlot[];
  /** slots of the plan chosen fresh (a swap, a section the length loop adds): their plan entry gives only the node */
  open?: ReadonlySet<number>;
  /** stretch (> 1) or shorten each node's seconds (the length repair) */
  aim?: number;
  /** slot -> sections not to use there (the swap repair) */
  bans?: ReadonlyMap<number, ReadonlySet<string>>;
  recent?: readonly string[];
  /** sub-block versions (versionKey) the world's earlier stages used */
  usedVersions?: readonly string[];
  /** slot -> the most its section's exit may lie under its entry (px, up is negative): a repair that needs the route higher from
   *  that slot on (V19b: the end above the bough window) asks the slot for a section that climbs at least this much */
  lift?: ReadonlyMap<number, number>;
  /** pace the climb (a roll after one the after-rules refused, R-165.120): on an up stage the lay keeps back the rise its later
   *  nodes must make (a climb, the late rise over the bough window), and its ground joins are steps down or walks before the late
   *  rise and never a step down after it. It changes only what the plan keeps (the section, the join's kind), so a plan laid again
   *  is the same stage. Unset, the lay is as it always was */
  pace?: boolean;
}

/** the start runway (nothing can hurt in the first seconds) and the shrine's bank */
const RUNWAY = 640;
const SPAWN_X = 140;
const SHRINE_BANK = 560;
/**
 * Flags (Matt's QA, 2026-10-28, through the lead): never more than `max` px of route between two flags, the start or the shrine; a
 * flag is put in a section that ends within `slack` of that, and needs a plain stretch `pad` px wide on a main piece
 */
export const FLAG_SPAN = { max: 4500, slack: 300, pad: 160 } as const;
/** a rolled stage's flags (the lead's 2:37 PM ruling, 11-06, Matt's "a checkpoint before the hard part, not everywhere"): a flag before
 *  each hard node (within `before` px ahead of its first section, and laid `clear` px or more ahead of it, so the first flag's "A flag!"
 *  lesson is done before the teach's own line: 1-1's double teach, the planner 11-06), none closer than `min` to the one before (`first` to the
 *  start), no span over `max` where nothing costs a life, `lethal` where something can (a water or void fall, a heart fall that is not
 *  soft), and the last within `last` of the exit. 1-1 costs no life anywhere, so it is about 9-12 a stage, as old 1-1 had */
export const ROLLED_FLAGS = { first: 700, min: 900, max: 4000, lethal: 2300, last: 2000, before: 2400, clear: 1500 } as const;
/** the jobs a flag stands before (the lead: teach, test, twist, combine, signature; a finale with them) */
export const HARD_JOBS: ReadonlySet<string> = new Set(['teach', 'test', 'twist', 'combine', 'signature', 'finale']);
/**
 * does no fall in this built stage cost a life (its brief's `softFalls`, GraphBrief: 1-1 on both settings, R-165.86)? The engine turns
 * its whole-stage soft fall on from this (engine.ts softOn), and the tests ask the same question the same way
 */
export const softFallStage = (st: object): boolean => !!(st as { gen2?: { softFalls?: boolean } }).gen2?.softFalls;

type FlagStage = { spawnX: number; exitTotemX: number; checkpoints?: Array<{ x: number }>; heartFalls?: Array<{ x0: number; x1: number; soft?: boolean }> };
/** where a fall costs a life on a stage: its water and void falls (gen2.falls) and its heart falls that are not soft */
export function lethalSpans(st: FlagStage, falls: ReadonlyArray<{ x0: number; x1: number; kind: string }> = []): Array<[number, number]> {
  return [...falls.filter((f) => f.kind !== 'soft').map((f) => [f.x0, f.x1] as [number, number]), ...(st.heartFalls ?? []).filter((z) => !z.soft).map((z) => [z.x0, z.x1] as [number, number])];
}
/** a rolled stage's flags against ROLLED_FLAGS, each miss by name (empty: kept): the verdict, the same the tests read */
export function rolledFlagBreaches(st: FlagStage, hard: ReadonlyArray<{ id: string; x0: number }> = [], lethal: ReadonlyArray<[number, number]> = []): string[] {
  const xs = (st.checkpoints ?? []).map((c) => c.x).sort((a, b) => a - b);
  if (!xs.length) return ['flags: none'];
  const out: string[] = [];
  const cap = (a: number, b: number) => (lethal.some(([l0, l1]) => l1 > a && l0 < b) ? ROLLED_FLAGS.lethal : ROLLED_FLAGS.max);
  if (xs[0] - st.spawnX < ROLLED_FLAGS.first) out.push(`flags: the first ${R(xs[0] - st.spawnX)} px from the start (at least ${ROLLED_FLAGS.first})`);
  if (xs[0] - st.spawnX > cap(st.spawnX, xs[0])) out.push(`flags: the first at x ${R(xs[0])} (no span over ${cap(st.spawnX, xs[0])})`);
  for (let k = 1; k < xs.length; k++) {
    const g = xs[k] - xs[k - 1], c = cap(xs[k - 1], xs[k]);
    if (g < ROLLED_FLAGS.min || g > c) out.push(`flags: ${R(g)} px apart at x ${R(xs[k - 1])} (${ROLLED_FLAGS.min}-${c}${c === ROLLED_FLAGS.lethal ? ', a life can be lost in it' : ''})`);
  }
  for (const h of hard) if (h.x0 - st.spawnX >= ROLLED_FLAGS.first + ROLLED_FLAGS.clear && !xs.some((x) => x <= h.x0 + 150 && x >= h.x0 - ROLLED_FLAGS.before)) out.push(`flags: none before the hard node ${h.id} at x ${R(h.x0)} (within ${ROLLED_FLAGS.before} px)`);
  if (st.exitTotemX - xs[xs.length - 1] > ROLLED_FLAGS.last) out.push(`flags: the last ${R(st.exitTotemX - xs[xs.length - 1])} px from the exit (within ${ROLLED_FLAGS.last})`);
  return out;
}
/** the plain-walk seconds at the start before any animal may stand (§2 "Opening seconds": 3-5 s) */
const OPEN_SECONDS = 5;

/**
 * Each roll's theme (C1, as a world grows): with ~30 sections and ~25 slots a stage drew most of the pool every roll, so rolls looked
 * alike (World 5's 5-7: 0.38 diversity on 20 rolls). Once a world holds `from` sections, each roll favours a share of them (rolled
 * from `share`, a third to a half): a section is in the roll's theme when its own number for the roll (rngFor(seed, 47, its id)) is
 * under the share, so adding a section to the world leaves every other section's membership alone. A node's bag holds the theme's
 * candidates for it, topped up with the nearest others (lowest numbers first) to one more than the cooldown's length, so the cooldown
 * always has one it allows; a node whose themed candidates all leave the corridor falls back on every candidate. Every section is in
 * some rolls' themes, so every one is reachable across rolls.
 */
export const THEME = { from: 12, share: [1 / 3, 1 / 2] } as const;
/** a string's FNV-1a hash (a section id's salt for its theme stream) */
const hashOf = (s: string): number => {
  let a = 2166136261;
  for (let i = 0; i < s.length; i++) a = Math.imul(a ^ s.charCodeAt(i), 16777619) >>> 0;
  return a | 0;
};

/** the seconds a section costs the typical first-timer (the time model's walk, its animals, its own extra) */
function sectionSeconds(L: LocalLayout, tpl: SectionTemplate, budget: StageBudget): number {
  const foes = L.sockets.filter((s) => s.role === 'enemy').reduce((s, k) => s + (k.chance ?? 1), 0) * budget.enemyShare;
  return L.width / budget.walkSpeed + foes * MODEL_TYPICAL.fightGround + (tpl.extraSeconds ?? 0);
}

/**
 * Pass 3. Each node is filled with sections until its share of the seconds is met. A candidate must fit the node's phase, the
 * stage's archetype and moves, not use a mechanic before it is taught, keep its cap, and keep the route inside the corridor; the
 * bag (ShuffleBag) and the cooldown (CooldownQueue) decide among the rest, weighted toward the node's tension (scaled into the band)
 * and its wanted tags, and toward sections that drift back when the route nears the corridor's edge; in a world of THEME.from sections
 * or more each node's bag holds the roll's theme (THEME). Each slot rolls from its own
 * stream, so a swap at one slot leaves the others' geometry as it was.
 */
export function layStage(budget: StageBudget, graph: MissionGraph, kit: WorldKit, seed: number, opt: LayOptions = {}): Laid {
  const M = kit.manifest;
  const byId = new Map(M.sections.map((t) => [t.id, t]));
  const pickRng = rngFor(seed, 3);
  const platforms: Platform[] = [];
  let pid = 1;
  const baseline = M.corridor.bottom + M.ground.bankH;
  const mk = (x: number, y: number, w: number, shape: LocalPiece['shape'], h: number, style?: Platform['style'], crumble = false): Platform => {
    const p: Platform = crumble
      ? { id: pid++, x: R(x), y: R(y), width: CRUMBLE_TILE_W, height: CRUMBLE_H, type: 'fragile', crumbleAfter: crumbleTime(budget.stage), style: 'ruin' }
      : {
          id: pid++,
          x: R(x),
          y: R(y),
          width: R(w),
          height: shape === 'bank' ? Math.max(M.ground.bankH, R(baseline - y)) : shape === 'branch' ? 24 : shape === 'stone' ? 22 : shape === 'hollow' ? hollowLogSize('moss', R(w)).height : R(h),
          type: shape === 'bouncy' ? 'bouncy' : 'solid',
          style: style ?? (shape === 'bank' ? M.ground.style : shape === 'branch' ? 'branch' : shape === 'hollow' ? 'log' : 'moss_stone'),
          ...(shape === 'hollow' ? { hollow: 'moss' as const } : {}),
        };
    platforms.push(p);
    return p;
  };
  const gaps: Laid['gaps'] = [];
  const asks: NonNullable<Laid['asks']> = [];
  const vines: Vine[] = [];
  const ropes: Rope[] = [];
  const zones: Zone[] = [];
  const heartFalls: Laid['heartFalls'] = [];
  // (a stage that teaches the hurt floor's lesson lays no hollow by brief before the lesson's showing piece ends: `hazard.untaught` by
  // construction. The x past which the brief's hollows may lie: nowhere until the teach is laid)
  let hurtFrom = M.graphs?.briefs?.[budget.id]?.teaches?.includes(M.hurtFloor?.lesson ?? '') ? Infinity : -Infinity;
  // (World 1's floor families, M.floorRoll: the roll's hop family, drawn from its own stream (no other world draws it), sets how deep
  // this slot's soft pits lie; every other world's pits are M.pitDepth as before)
  const FR = M.floorRoll;
  let fam = 0;
  if (FR) {
    const fr = rngFor(seed, 53);
    let w = fr() * FR.hop.reduce((a, f) => a + f.weight, 0), pick = FR.hop[0];
    for (const f of FR.hop) { if (w < f.weight) { pick = f; break; } w -= f.weight; }
    fam = pick.range[0] + fr() * (pick.range[1] - pick.range[0]);
  }
  let depthNow = M.pitDepth;
  // (World 1's per-roll tempo, M.rollRanges: the roll's median gap share and rise band, from its own stream)
  const RR = M.rollRanges;
  let tempo: LayLocalOptions['tempo'];
  if (RR) {
    const tr = rngFor(seed, 61);
    const g = RR.gap, u = tr(), c = (g.mode - g.min) / (g.max - g.min);
    const med = u < c ? g.min + Math.sqrt(u * (g.max - g.min) * (g.mode - g.min)) : g.max - Math.sqrt((1 - u) * (g.max - g.min) * (g.max - g.mode));
    const band = tr() < RR.rise.hillyShare ? RR.rise.hilly : RR.rise.home;
    const rise = band[0] + tr() * (band[1] - band[0]);
    tempo = { gap: med / g.centre, gapMax: g.p90, rise: rise / RR.rise.centre };
  }
  // (a catch bough under a ledge gap, World 1's canopy: never in water, never where a pit already lies under it)
  // (its look cycles through floorRoll.catchStyles in the order laid (World 1: log, branch, the designer's Round 11: the branch share of
  // thin landings at most 30%); absent, every catch is a branch)
  let catches = 0;
  const catchUnder = (x0: number, x1: number, lowerLip: number) => {
    if (!FR?.catchDrop || x1 - x0 < 20) return;
    // (and only where no piece of the stage already catches: a piece under the gap, its top past the lower lip by no more than a catch's
    // drop and 60 px, keeps its part; the bough goes under the rest, each part wider than his body. A bough over such a piece covered it:
    // a chain's petal low log out past its start log, R-165.124, lay under a bough that took the walk off the start log first)
    const styles = FR.catchStyles?.length ? FR.catchStyles : (['branch'] as const);
    const reach = lowerLip + FR.catchDrop + 60;
    const own = platforms.filter((q) => q.type !== 'bouncy' && q.x < x1 && q.x + q.width > x0 && q.y > lowerLip && q.y <= reach).sort((a, b) => a.x - b.x);
    const parts: Array<[number, number]> = [];
    let at = x0 - 30;
    for (const q of own) { if (q.x > at) parts.push([at, q.x]); at = Math.max(at, q.x + q.width); }
    if (x1 + 50 > at) parts.push([at, x1 + 50]);
    for (const [a, b] of own.length ? parts.filter(([a, b]) => b - a >= 32) : parts) {
      const c = mk(a, lowerLip + FR.catchDrop, b - a, 'branch', 24, styles[catches++ % styles.length]);
      (c as Platform & { catch?: boolean }).catch = true;
    }
  };
  const pitUnder = (x0: number, x1: number, lipY: number, farY: number, back = false, soft = false) => {
    if ((budget.pit !== 'soft' && !soft) || x1 - x0 < 20) return;
    const hop = riseCap(false, 1, budget) * PIT.hop;
    // (the banks either side of the pit reach down past its floor: a glide's back pit climbs in steps and on low ground its floor lay under
    // the banks' foot, so a jump off the floor passed under a bank's edge and fell through, 9-5's first-timer bot; World 9's fix,
    // w9-pieces 621554b8, the lead 2026-10-31: every world, a bug in shared code is fixed for all; gen2Pits.test.ts scans every shipped stage)
    const deepen = (floor: number) => {
      // (World 9 fills every bank down past the floor (its lava is drawn under it); elsewhere only a bank whose foot leaves a hole he
      // fits through (48 px, his height) is filled, so the shipped stages build as curated (five 8-6 Normal rolls change: their dark
      // glide floors ran 51-85 px under a bank's foot); a thin perch or branch beside the pit is never stretched into a column)
      for (const q of platforms) if ((Math.abs(q.x + q.width - x0) < 3 || Math.abs(q.x - x1) < 3) && q.y < floor && q.height >= 40 && (budget.world === 9 || floor - (q.y + q.height) > 48)) q.height = Math.max(q.height, floor + M.ground.bankH - q.y);
    };
    if (back) {
      const out = backPit(x0, x1, lipY, farY, depthNow, hop);
      deepen(out.floor);
      mk(x0, out.floor, x1 - x0, 'block', M.ground.bankH, 'moss_stone');
      for (const s of out.steps) mk(s.x, s.top, s.w, 'block', out.floor - s.top, 'moss_stone');
      return;
    }
    const out = pitSteps(x0, x1, lipY, farY, depthNow, hop);
    deepen(out.floor);
    mk(x0, out.floor, x1 - x0, 'block', M.ground.bankH, 'moss_stone');
    for (const s of out.steps) mk(s.x, s.top, s.w, 'block', out.floor - s.top, 'moss_stone');
  };

  // the runway
  const runway = mk(0, M.ground.y, RUNWAY, 'bank', 0);
  let cur = { x: RUNWAY, y: M.ground.y, kind: 'ground' as PortKind, piece: runway };
  const sections: PlacedSection[] = [];
  const plan: PlanSlot[] = [];
  const coolN = Math.max(1, Math.min(4, Math.floor(M.sections.length / 2)));
  const cool = new CooldownQueue<string>(coolN);
  // (the roll's theme: THEME)
  const themeShare = Math.min(1, roll(rngFor(seed, 43), M.themeShare ?? (M.sections.length >= THEME.from ? THEME.share : 1)));
  const near = new Map(M.sections.map((t) => [t.id, rngFor(seed, 47, hashOf(t.id))()]));
  const themed = (cands: SectionTemplate[]): SectionTemplate[] => {
    if (themeShare >= 1) return cands;
    const keep = new Set([...cands].sort((a, b) => near.get(a.id)! - near.get(b.id)!).filter((t, i) => near.get(t.id)! < themeShare || i <= coolN));
    return cands.filter((t) => keep.has(t));
  };
  for (const id of opt.recent ?? []) cool.use(id);
  // (sub-block versions: none twice in a world while another is left, A5 / C4)
  const once = new WorldOnce<string>();
  for (const k of opt.usedVersions ?? []) once.use(k);
  const taught = new Set<string>(Object.entries(M.lessons ?? {}).filter(([, st]) => stageOrder(st) < stageOrder(budget.id)).map(([m]) => m));
  const used = new Map<string, number>();
  // (a purge or gauntlet: most of its animals come from pass 4's top-up, which the sections' own seconds can't see; about three
  // quarters of the goal's fights are kept back from the sections' share, so the first plan lands near the clock, not 30% over it)
  const fightsArch = budget.archetype === 'purge' || budget.archetype === 'gauntlet';
  const reserve = fightsArch ? budget.quota.lay * MODEL_TYPICAL.fightGround * 0.75 : 0;
  const aim = (opt.aim ?? 1) * Math.max(0.4, (budget.seconds.target - reserve) / budget.seconds.target);
  let slot = 0;
  const bags = new Map<string, ShuffleBag<SectionTemplate>>();
  const must = M.required?.[budget.id] ?? [];
  const placedReq = new Set<string>();

  // (a rolled graph's node, manifest `graphs`: a section that names its jobs fits only a node with one of them, and one that names none
  // fits by its phases; a section that teaches a move this stage teaches lies only in that move's teach node, and a teach node holds
  // only a section that teaches its move (one new thing). `loose` drops the job match, for a node no named section fits)
  const chunkTotal = graph.nodes.every((n) => n.count) ? graph.nodes.reduce((s, n) => s + n.count!, 0) : 0;
  // (the stage's length in sections, for the window: the count, or the plan this build follows once the length repair has changed it)
  const stageLen = Math.max(1, opt.plan?.length ?? chunkTotal);
  // (a rolled graph's slot chosen fresh inside a kept plan counts the kept slots after it too: the cap holds over the whole stage)
  const ahead = (id: string, i: number) => (graph.id && opt.plan ? opt.plan.filter((p, k) => k > i && !opt.open?.has(k) && p.template === id).length : 0);
  const teachHere = new Set(graph.nodes.flatMap((n) => (n.job === 'teach' && n.teaches ? [n.teaches] : [])));
  // (`loose`: 0 the node's job and its dealt type; 1 its job only, when no section of its type is left; 2 its phase only)
  const jobFits = (t: SectionTemplate, n: MissionNode, loose: 0 | 1 | 2) => {
    if (!n.job) return t.phases.includes(n.phase);
    // (a teach node with no move named, a brief that names none: any section that teaches a move not yet taught)
    if (n.job === 'teach' && loose < 2) return (n.teaches ? t.teaches === n.teaches : !!t.teaches && !taught.has(t.teaches)) && !(loose === 0 && n.content && t.content && t.content !== n.content);
    if (t.teaches && teachHere.has(t.teaches) && !taught.has(t.teaches)) return false;
    // (the deal's type: a section of another type never fills a typed node; one with no type may)
    if (loose === 0 && n.content && t.content && t.content !== n.content) return false;
    // (a fork is two roads: only a section that names the job; loosened all the way, the node is a plain practise by its phase)
    if (n.job === 'fork' && loose < 2) return !!t.jobs?.includes('fork');
    // (and the H node is the stage's find: only a section that names the job)
    if (n.job === 'reward' && loose < 2) return !!t.jobs?.includes('reward');
    return loose < 2 && t.jobs ? t.jobs.includes(n.job) : t.phases.includes(n.phase);
  };
  // (a rolled graph's corridor reads where a section really ends, never only what it declares: its exit laid on three streams, the
  // median, once per build; a declared exitDy that disagrees would walk the route out of the corridor, where the way on is lost)
  const exitMemo = new Map<string, number>();
  const exitDyOf = (t: SectionTemplate): number => {
    if (!graph.id) return t.exitDy;
    let e = exitMemo.get(t.id);
    if (e === undefined) {
      try {
        const ys = [0, 1, 2].map((k) => layLocal(t, budget, rngFor(7, k), false, { pitDepth: M.pitDepth }).exit.y).sort((a, b) => a - b);
        e = ys[1];
      } catch {
        e = t.exitDy;
      }
      exitMemo.set(t.id, e);
    }
    return e;
  };
  // (an up stage: its graph marks the node after a late descent mustRise, or its brief's trend is up; V19's heights, below)
  const upStage = graph.nodes.some((q) => q.mustRise) || M.graphs?.briefs?.[budget.id]?.trend === 'up';
  // (the window part, V19b, is a stage's own promise: its brief's endHigh; every up stage keeps V19, above where a late descent began)
  const endHigh = upStage && !!M.graphs?.briefs?.[budget.id]?.endHigh;
  let windowY: number | undefined, descentY: number | undefined, riseTo: number | undefined;
  const rise: Array<{ node: string; to: number; exitY: number }> = [];
  /** the node that must climb: the one after a late descent (mustRise), or with no late descent the signature (V19b: the end above the
   *  bough window's start) */
  const needsRise = (n: MissionNode) => upStage && (!!n.mustRise || (endHigh && n.job === 'signature' && descentY === undefined));
  /** where the next section enters: the join clamps it into the corridor */
  const entryY = () => Math.max(M.corridor.top, Math.min(M.corridor.bottom, cur.y));
  const fits = (t: SectionTemplate, n: MissionNode, i: number, loose: 0 | 1 | 2 = 0) =>
    jobFits(t, n, loose) &&
    (!n.mustRise || loose === 2 || exitDyOf(t) < 0) &&
    // (V19 and V19b on an up stage, 11-06: the node after a late descent (or, with none, the signature) ends higher than both where the
    // descent began and where the bough window begins, 20 px clear; rising at all was weaker than the line, and stage.ts's V19 / V19b failed on Roll A. Nothing that fits: the slot
    // loosens and the roll fails by name)
    (riseTo === undefined || loose === 2 || !needsRise(n) || entryY() + exitDyOf(t) <= riseTo - 20) &&
    (t.archetypes === 'any' || t.archetypes.includes(budget.archetype)) &&
    (t.needs ?? []).every((m) => budget.moves.includes(m)) &&
    hangsNeed(t).every((m) => budget.moves.includes(m)) &&
    (t.uses ?? []).every((m) => taught.has(m) || t.teaches === m) &&
    (used.get(t.id) ?? 0) + ahead(t.id, i) < (t.maxPerStage ?? M.graphs?.maxPerStage ?? Infinity) &&
    // (the placement window: the slot's place among the stage's chunks, when the graph counts them)
    (!t.window || !chunkTotal || ((i + 0.5) / stageLen >= t.window[0] && (i + 0.5) / stageLen <= t.window[1])) &&
    (opt.lift?.get(i) === undefined || exitDyOf(t) <= opt.lift.get(i)!) &&
    !opt.bans?.get(i)?.has(t.id) &&
    !opt.bans?.get(-1)?.has(t.id);

  // (R-165.120, the pool's look-ahead, on a rolled graph that counts its chunks: how many of the slots this build has still to choose
  // would be left with no section if `c` were taken at slot `i` (poolFits: the rule's fixed part; the bans of a repair held too))
  const lookAhead = !!graph.id && chunkTotal > 0;
  const staticFits = poolFits({ M, budget, nodes: graph.nodes, stageLen: chunkTotal ? stageLen : 0, exitDy: exitDyOf });
  const nodeOf = new Map(graph.nodes.map((q) => [q.id, q]));
  const maxPer = (t: SectionTemplate) => t.maxPerStage ?? M.graphs?.maxPerStage ?? Infinity;
  const leftShort = (n: MissionNode, i: number): ((c: SectionTemplate) => number) | undefined => {
    const todo: Array<{ n: MissionNode; i: number }> = [];
    if (opt.plan) {
      for (const k of opt.open ?? []) if (k > i && opt.plan[k] && nodeOf.has(opt.plan[k].node)) todo.push({ n: nodeOf.get(opt.plan[k].node)!, i: k });
    } else {
      let k = i + 1;
      for (let c = inNode.k + 1; c < inNode.of; c++) todo.push({ n, i: k++ });
      for (const q of graph.nodes.slice(graph.nodes.indexOf(n) + 1)) for (let c = 0; c < (q.count ?? 1); c++) todo.push({ n: q, i: k++ });
    }
    if (!todo.length) return undefined;
    const free = (t: SectionTemplate) => maxPer(t) - (used.get(t.id) ?? 0) - ahead(t.id, i);
    const need = todo.map((q) => M.sections.filter((t) => free(t) > 0 && staticFits(t, q.n, q.i) && !opt.bans?.get(q.i)?.has(t.id) && !opt.bans?.get(-1)?.has(t.id)).map((t) => t.id));
    return (c) => unfilled(need, (id) => free(byId.get(id)!) - (id === c.id ? 1 : 0));
  };
  // (R-165.120, pacing the climb, `opt.pace` on an up stage that counts its chunks: the rise each later slot must make whatever is
  // chosen there (the least climb among the sections its rule allows; a node that must rise, the least of its rising ones), summed
  // from the end. A section here overspends by what its exit leaves short of that, under the corridor's top)
  const paced = !!opt.pace && lookAhead && upStage;
  let riseAfter: number[] | undefined;
  const overspent = (c: SectionTemplate, i: number): number => {
    if (!riseAfter) {
      const slotNode: MissionNode[] = opt.plan ? opt.plan.map((p) => nodeOf.get(p.node)!) : graph.nodes.flatMap((q) => Array.from({ length: q.count ?? 1 }, () => q));
      const least = slotNode.map((q, k) => {
        if (!q) return 0;
        const first = k === 0 || slotNode[k - 1] !== q;
        const mustClimb = first && (!!q.mustRise || (endHigh && q.job === 'signature'));
        const dys = M.sections.filter((t) => staticFits(t, q, k) && !opt.bans?.get(-1)?.has(t.id)).map(exitDyOf).filter((d) => !mustClimb || d < 0);
        return dys.length ? Math.max(0, -Math.max(...dys)) : 0;
      });
      riseAfter = least.map((_, k) => least.slice(k + 1).reduce((a, b) => a + b, 0));
    }
    return Math.max(0, M.corridor.top - (entryY() + exitDyOf(c) - (riseAfter[i] ?? 0)));
  };
  // (and the late rise's debt: a late descent is followed by a node that must end higher than it began (V19). Whatever is taken
  // here, a section must be left for that node that climbs back what the descent falls, with room for the joins between: the fall of
  // the descent chosen here, or of the one laid, or the least any descent would fall. With none left, the px it would lack)
  const lateRises = graph.nodes.flatMap((q, k) => {
    const r = q.job === 'descent' ? graph.nodes.slice(k + 1).find((x) => x.job !== 'rest' && x.job !== 'exit' && x.job !== 'reward') : undefined;
    return r?.mustRise ? [{ d: q, r }] : [];
  });
  const riseDebt = (c: SectionTemplate, n: MissionNode, i: number): number => {
    let debt = 0;
    for (const { d, r } of lateRises) {
      const at = graph.nodes.indexOf(n);
      if (n === r || at > graph.nodes.indexOf(r)) continue;
      const free = (t: SectionTemplate) => t !== c && maxPer(t) - (used.get(t.id) ?? 0) - ahead(t.id, i) > 0 && !opt.bans?.get(-1)?.has(t.id);
      const falls = M.sections.filter((t) => free(t) && staticFits(t, d, i)).map(exitDyOf);
      const fall = n === d ? exitDyOf(c) : at > graph.nodes.indexOf(d) ? cur.y - (descentY ?? cur.y) : falls.length ? Math.min(...falls) : 0;
      const need = Math.max(0, fall) + 60;
      if (!M.sections.some((t) => free(t) && staticFits(t, r, i + 2) && -exitDyOf(t) >= need)) debt += need;
    }
    return debt;
  };
  let lastLoose = '';
  // (the slot's place in its node, for the cadence: a hard node ramps through its sections, then its last one cools)
  let inNode = { k: 0, of: 0 };
  const choose = (n: MissionNode, i: number): SectionTemplate => {
    lastLoose = '';
    // (a section this stage must hold comes first, at the first slot of the first node it fits: placed by the plan, not by weight)
    for (const r of must) {
      const t = byId.get(r.section);
      if (!t) throw new Error(`gen2 ${budget.id}: the required section ${r.section} is not in the world`);
      // (inside the corridor, like any pick: a later slot takes it otherwise; judged from the entry the join will give it, which is
      // clamped into the corridor, never from the last exit, 11-06: on 1-1 seed 102948 a descent ended past the corridor's floor and the
      // level seed perch was refused at the only slot it had)
      const endY = Math.max(M.corridor.top, Math.min(M.corridor.bottom, cur.y)) + exitDyOf(t);
      // (on a rolled graph a required section stands in its own reward node, the key's H, by its phase, window and uses)
      const reqFits = n.job ? n.job === 'reward' && fits(t, n, i, 2) : fits(t, n, i);
      if (!placedReq.has(r.section) && (!r.phase || r.phase === n.phase) && reqFits && endY >= M.corridor.top && endY <= M.corridor.bottom) return t;
    }
    // (a required section is never drawn by weight: it comes once, where the plan puts it)
    let cands = M.sections.filter((t) => fits(t, n, i) && !must.some((r) => r.section === t.id));
    // (no section named for the node's job is left, a swap having banned it: the node takes what fits its phase; a teach node so loosened
    // teaches nothing, and the required-move gate names it)
    if (!cands.length && n.job && n.content) {
      cands = M.sections.filter((t) => fits(t, n, i, 1) && !must.some((r) => r.section === t.id));
      if (cands.length) lastLoose = `${n.id} ${n.job}: no ${n.content} section left, filled by its job`;
    }
    if (!cands.length && n.job) {
      cands = M.sections.filter((t) => fits(t, n, i, 2) && !must.some((r) => r.section === t.id));
      if (cands.length) lastLoose = `${n.id} ${n.job}: no ${n.mustRise ? 'rising section (V19) ' : 'section for the job '}left, filled by its phase`;
    }
    if (!cands.length) {
      // (the hard no-repeat's own failure, named: every section that would fit here is already laid)
      const spent = M.sections.filter((t) => jobFits(t, n, 2) && (used.get(t.id) ?? 0) >= (t.maxPerStage ?? M.graphs?.maxPerStage ?? Infinity)).length;
      throw new Error(`gen2 ${budget.id}: no section fits node ${n.id} (${n.phase})${spent ? `: the pool is spent (${spent} that fit are laid already, slot ${i + 1})` : ''}`);
    }
    // (a rolled node's rating dial is its want, its density a tenth either way; the SPINE's want is its tension in the band)
    // (the cadence, R1 L4: a hard node (rating 5 or more) of two or more sections climbs a tenth either side of its rating, and its last
    // section cools a quarter under it: SMBF's and Shovel Knight's ramp and cool, inside the node as across the stage)
    const hard = n.dials && n.dials.rating >= 5 && inNode.of >= 2;
    const ramp = !hard ? 0 : inNode.k === inNode.of - 1 ? -0.25 : -0.1 + (0.2 * inNode.k) / Math.max(1, inNode.of - 2);
    const want = n.dials
      ? Math.max(0, Math.min(1, n.dials.rating / 10 + ramp + (n.dials.density === 'high' ? 0.1 : n.dials.density === 'low' ? -0.1 : 0)))
      : (budget.band[0] + (budget.band[1] - budget.band[0]) * n.tension - budget.band[0]) / (budget.band[1] - budget.band[0]);
    const room = M.corridor;
    const lean = cur.y < room.top + room.soft ? 1 : cur.y > room.bottom - room.soft ? -1 : 0;
    const home = M.graphs?.briefs?.[budget.id]?.trend !== 'level' || Math.abs(cur.y - M.ground.y) <= LEVEL_SWING ? 0 : Math.sign(M.ground.y - cur.y);
    const weight = (t: SectionTemplate) => {
      let w = (t.weight ?? 1) * Math.exp(-Math.abs(t.difficulty / 10 - want) * 4);
      if (n.want?.some((tag) => t.sockets.some((s) => s.allow?.includes(tag)) || t.name.includes(tag))) w *= 3;
      // (the corridor clamp, Part 3 §1: near the top lean to sections that go down, near the bottom to ones that go up; one that
      // would leave the corridor is never picked)
      const endY = cur.y + exitDyOf(t);
      if (endY < room.top || endY > room.bottom) return 0;
      const ed = exitDyOf(t);
      if (lean !== 0) w *= Math.sign(ed) === lean ? 3 : ed === 0 ? 1 : 0.3;
      // (a level stage, GraphBrief.trend: the route swings round the height it began at. Past LEVEL_SWING px from it the way back is
      // weighed up, and a section that would carry it further off is never the pick while one that would not fits the slot)
      if (home !== 0) { if (Math.sign(ed) === -home && cands.some((c) => Math.sign(exitDyOf(c)) !== -home)) return 0; if (Math.sign(ed) === home) w *= 4; }
      // (World 1's floor families: the roll's hop family weighs its hop and jump sections; a world without floorRoll never sees it)
      if (FR && t.floor) w *= t.floor === 'hop' ? 0.1 + 1.9 * fam : 0.1 + 1.9 * (1 - fam);
      // (a rolled node's height and terrain dials: its own way up or down, and its terrain family, weighed up)
      if (n.dials) {
        const h = n.dials.height, d = Math.sign(ed);
        if (h === 'up' ? d < 0 : h === 'down' ? d > 0 : d === 0) w *= 2;
        if (n.dials.terrain && t.terrain === n.dials.terrain) w *= 3;
      }
      return w;
    };
    // the node's bag holds its candidates by weight; the cooldown passes over the ones used just now
    // (a rolled node's bag is its own: its weights are its dials', never another node's with the same phase)
    const key = `${n.job ? n.id : n.phase}|${cands.map((c) => c.id).join(',')}`;
    let bag = bags.get(key);
    if (!bag) {
      bag = new ShuffleBag(pickRng, themed(cands), (t) => Math.max(1, Math.round(weight(t) * 3)));
      bags.set(key, bag);
    }
    const tries: SectionTemplate[] = [];
    for (let k = 0; k < bag.capacity; k++) {
      const t = bag.draw()!;
      if (weight(t) > 0) tries.push(t);
      if (tries.length >= 3) break;
    }
    const pool = tries.length ? tries : cands.filter((t) => weight(t) > 0);
    // (a rolled node's cadence is a rule, not a lean: of the bag's draws, the one nearest the slot's want comes first; the bag still
    // decides which few are drawn, so the variety is the bag's)
    if (n.dials) pool.sort((a, b) => Math.abs(a.difficulty / 10 - want) - Math.abs(b.difficulty / 10 - want));
    const t = cool.pick(pool.length ? pool : cands, (c) => c.id) ?? pickWeighted(pickRng, cands, weight)!;
    // (R-165.120, the pool's look-ahead: the pick stands unless taking it leaves a later slot with no section its rule allows, when
    // another candidate here would not: the scarce section is kept for the node that has nothing else. The pick's own order decides
    // among those that keep the pool whole; with none, the pick stands and the roll fails by name, as before)
    // (and, pacing the climb: nor unless it spends rise the later nodes must make (`overspent`); the pool first, then the pace)
    const left = lookAhead ? leftShort(n, i) : undefined;
    const cost = (c: SectionTemplate): [number, number] => [left ? left(c) : 0, paced ? overspent(c, i) + riseDebt(c, n, i) : 0];
    const less = (a: [number, number], b: [number, number]) => a[0] < b[0] || (a[0] === b[0] && a[1] < b[1]);
    let least = cost(t);
    if (!least[0] && !least[1]) return t;
    const rest = [...pool, ...cands.filter((c) => !pool.includes(c) && weight(c) > 0).sort((a, b) => weight(b) - weight(a))].filter((c) => c !== t);
    let pick = t;
    for (const c of rest) { const k = cost(c); if (less(k, least)) { pick = c; least = k; } if (!least[0] && !least[1]) break; }
    return pick;
  };

  for (const n of graph.nodes) {
    // (the heights V19 holds the late rise to: where the bough window begins (the route as the slots reach two thirds), and where a late
    // descent began)
    if (upStage && chunkTotal) {
      if (windowY === undefined && (slot + 0.5) / stageLen >= WINDOW_AT) windowY = cur.y;
      if (n.job === 'descent' && windowY !== undefined) descentY = Math.min(descentY ?? Infinity, cur.y);
      if (windowY !== undefined) riseTo = endHigh ? Math.min(windowY, descentY ?? Infinity) : descentY;
    }
    const riseFor = needsRise(n) && riseTo !== undefined ? riseTo : undefined;
    let secs = 0;
    const want = n.share * budget.seconds.target * aim;
    let first = true;
    // (the start and the goal are a single plain section each: the runway and the shrine's bank are laid by the stitcher)
    // (following a plan, the node takes exactly the slots the plan gave it: Easy's sections are Normal's, whatever their seconds)
    // (a node with a count holds that many sections, whatever their seconds: length from the chunk count, never clock-filling)
    let taken = 0;
    while (opt.plan ? opt.plan[slot]?.node === n.id : n.count !== undefined ? taken < n.count : first || secs < want) {
      first = false;
      inNode = { k: taken++, of: n.count ?? 0 };
      const i = slot++;
      const fixed = opt.open?.has(i) ? undefined : opt.plan?.[i];
      const tpl = fixed ? byId.get(fixed.template)! : choose(n, i);
      // (the slot's stream: salted by the swaps made at it; a plan carries Normal's salt so Easy rolls the slot as Normal did)
      const salt = fixed ? fixed.salt ?? 0 : opt.bans?.get(i)?.size ?? 0;
      const srng = rngFor(seed, 11, i, salt);
      // (the flip is drawn whether or not a plan fixes it, so the geometry after it rolls from the same numbers on Easy and Normal)
      const flip = tpl.mirrorable ? srng() : 1;
      // (a section that swings is never flipped: its perch is sized for a swing toward it, the way the stage runs)
      // (never a section with a block, 11-06: mirrored, a rise block is a drop and a gap block's landing is its take-off)
      // (and, the lead 12:57 PM: never one whose exit is not level (more than 25 px off its entry: mirrored, a rise is a drop, FR9's up
      // stair laid backwards was a drop run), nor any climb (its vine and bank face the other way); mirror.test.ts)
      const mirrored = fixed ? fixed.mirrored : flip < 0.5 && hangsNeed(tpl).length === 0 && tpl.content !== 'climb' && !hasBlock(tpl) && Math.abs(exitDyOf(tpl)) <= 25;
      // (the slot's floor depth: a hop roll shallow, a jump roll deep, a mixed roll by the slot's own draw against the family)
      if (FR) depthNow = fam >= FR.hopRoll ? FR.shallow : fam <= FR.jumpRoll ? FR.deep : rngFor(seed, 59, i)() < fam ? FR.shallow : FR.deep;
      const L = layLocal(tpl, budget, srng, mirrored, { versions: fixed?.versions, pickRng: rngFor(seed, 19, i, salt), once, pitDepth: depthNow, ...(tempo ? { tempo } : {}) });
      // the join: on the ground a walk, a step or a pit; from or onto a ledge a jump, each sized from the envelope
      const jrng = rngFor(seed, 13, i);
      let join: PlanSlot['join'];
      // (drawn the same way with or without a plan, so the join's sizes below come from the same numbers on Easy and Normal)
      if (cur.kind === 'ground' && L.entry.kind === 'ground') {
        const quiet = n.phase === 'start' || n.phase === 'rest' || n.phase === 'goal' || (tpl.room && true);
        const pitW = quiet ? 0 : n.tension * 1.2;
        // (World 1's floor families lean the join: a hop roll toward steps, a jump roll toward pits; the draw is the same one)
        const stepW = FR ? 0.6 + 1.4 * fam : 0.6, pitW2 = FR ? pitW + 1.2 * (1 - fam) : pitW;
        // (a rolled node's tempo dial: hurry leans its joins off the plain walk, patience toward it)
        const walkW = n.dials ? (n.dials.tempo === 'hurry' ? 0.6 : 1.5) : 1;
        const r0 = jrng() * (walkW + stepW + pitW2);
        join = fixed ? fixed.join : r0 < walkW ? 'walk' : r0 < walkW + stepW ? 'step' : 'pit';
        // (pacing the climb: a step leans to the corridor's middle, so under the middle it climbs and over it it comes down. Before
        // the late rise a step that would climb is laid flat (the climbs ahead need that height) and a walk over the middle is a step
        // down (it gives height back); after the late rise a step that would come down is laid flat, so the end stays above the bough
        // window. Only the KIND of join changes, which the plan keeps: a plan laid again is the same stage)
        if (!fixed && paced && join !== 'pit') {
          const down = cur.y + L.exit.y <= (M.corridor.top + M.corridor.bottom) / 2;
          // (a step so taken away is a pit where the node may hold one: the seam keeps its beat, and the quiet line its measure)
          const flat = join === 'step' && !quiet ? 'pit' : 'walk';
          join = rise.length ? (down ? flat : join) : down ? 'step' : flat;
        }
      } else join = fixed ? fixed.join : 'jump';
      const j = jrng();
      let dx = 0;
      let dy = 0;
      const lim1 = riseCap(false, 1, budget);
      if (join === 'step') {
        // (up or down by a hop, leaning back toward the corridor's middle; on a level stage, GraphBrief.trend, toward the height it began at)
        const middle = M.graphs?.briefs?.[budget.id]?.trend === 'level' ? M.ground.y : (M.corridor.top + M.corridor.bottom) / 2;
        const dir = cur.y + L.exit.y > middle ? -1 : 1;
        dy = dir * (20 + j * (lim1 * 0.8 - 20));
      } else if (join === 'pit' || join === 'jump') {
        if (join === 'jump') dy = -lim1 * 0.6 + j * (lim1 * 0.6 + 80);
        const g = gapFor(-dy, false, budget);
        dx = Math.max(60, R(Math.min(tempo ? tempo.gapMax : 1, (0.5 + 0.3 * budget.heat + 0.15 * jrng()) * (tempo ? tempo.gap : 1)) * g));
      }
      dy = Math.max(M.corridor.top - cur.y, Math.min(M.corridor.bottom - cur.y, dy));
      const ox = cur.x + dx;
      const oy = R(cur.y + dy);
      const placed: PlacedSection = {
        uid: `s${i + 1}`,
        template: tpl.id,
        node: n.id,
        phase: n.phase,
        tension: n.tension,
        mirrored,
        entry: { x: ox, y: oy },
        exit: { x: ox + L.exit.x, y: oy + L.exit.y },
        x0: ox,
        x1: ox + L.width,
        pieces: [],
        seam: [],
        vines: [],
        sockets: [],
        beats: [],
        seconds: 0,
      };
      if (dx > 0) {
        const before = platforms.length;
        pitUnder(cur.x, ox, cur.y, oy);
        placed.seam.push(...platforms.slice(before));
      }
      for (const lp of L.pieces) {
        if (lp.hang) {
          // (a liana or a climbing vine: the engine's Vine; a liana's own swing goes with it, for the engine's self-swinging vines)
          const liana = lp.hang.kind === 'liana';
          const v: Vine = {
            id: vines.length + 1, x: R(ox + lp.x), topY: R(oy + lp.y), bottomY: R(oy + lp.y + lp.h), swaySpeed: 1.1, swayPhase: ((ox + lp.x) * 0.013) % 6.28,
            vineType: liana ? 'swing_liana' : 'tree_climb', ...(liana ? { isSwingingVine: true } : {}),
          };
          // (its own swing on the Vine itself, for vine-fix's engine and checks: Vine.swingAmp / swingPeriod once that is on main; ignored
          // before. Its phase is the engine's (swingSetup))
          if (lp.hang.swing) Object.assign(v, { swingAmp: lp.hang.swing.amp, swingPeriod: lp.hang.swing.period });
          vines.push(v);
          const h = lp.hang;
          placed.vines.push({ key: lp.key, vine: v, ...(h.swing ? { swing: h.swing } : {}), ...(h.window !== undefined ? { window: h.window } : {}), ...(h.gap ? { gap: [R(ox + h.gap[0]), R(ox + h.gap[1])] as [number, number] } : {}) });
          continue;
        }
        // (A13, one brick library across worlds: a piece that names its engine slot takes this world's row for it, its style and one of
        // its inventory pieces by its own place (no shared stream moves); a world with no row fails the section by name, never a stand-in)
        const row = lp.slot ? M.slots?.[lp.slot] : undefined;
        if (lp.slot && !row?.art.length) throw new Error(`gen2 section ${tpl.id}: piece ${lp.key} asks slot "${lp.slot}" and world ${budget.world} has no row for it`);
        const p = mk(ox + lp.x, oy + lp.y, lp.w, lp.shape, lp.h, row?.style ?? lp.style, !!lp.crumble);
        placed.pieces.push({ key: lp.key, platform: p, main: lp.main, landing: lp.landing, ...(row ? { slot: lp.slot, art: row.art[Math.floor(rngFor(seed, 83, p.x, p.y)() * row.art.length)] } : {}) });
      }
      const pieceOf = (k: string) => {
        const q = placed.pieces.find((pp) => pp.key === k);
        if (!q) throw new Error(`gen2 section ${tpl.id}: nothing named ${k} is laid (versions ${JSON.stringify(L.versions)})`);
        return q.platform;
      };
      // (each rope (place `rope`) across between its two ledges, whichever way the section lies)
      for (const lp of L.pieces) {
        if (!lp.ropeFrom) continue;
        const p1 = pieceOf(lp.ropeFrom), p2 = pieceOf(lp.key);
        const [l, r] = p1.x < p2.x ? [p1, p2] : [p2, p1];
        ropes.push({ id: ropes.length + 1, x0: R(l.x + l.width - ROPE_OVERLAP), x1: R(r.x + ROPE_OVERLAP), y: R(Math.min(l.y, r.y) - ROPE_RISE), g0: l.y, g1: r.y, required: true });
        placed.beats.push({ x: l.x + l.width, letter: 'V' });
      }
      const entryP = pieceOf(L.entry.piece);
      if (dx > 0) gaps.push({ x0: cur.x, x1: ox, y: Math.min(cur.y, oy), from: cur.piece, to: entryP, section: placed.uid });
      if (dx > 0) asks.push({ x0: cur.x, x1: ox, yTake: cur.y, yLand: oy, move: 'single', thin: entryP.height < BLOCK_H.px, key: 'seam', section: placed.uid });
      for (const k of L.asks ?? []) asks.push({ ...k, x0: ox + k.x0, x1: ox + k.x1, yTake: oy + k.yTake, yLand: oy + k.yLand, section: placed.uid });
      if (dx > 0 && join === 'jump') { const before = platforms.length; catchUnder(cur.x, ox, Math.max(cur.y, oy)); placed.seam.push(...platforms.slice(before)); }
      if (hurtFrom === Infinity && tpl.teaches === M.hurtFloor?.lesson) { const sh = placed.pieces.find((p) => p.key === 'show')?.platform; hurtFrom = sh ? sh.x + sh.width : placed.x1; }
      for (const g of L.gaps) {
        const g0 = { x0: ox + g.x0, x1: ox + g.x1, y: oy + g.y, section: placed.uid, ...(g.water ? { water: true } : {}), ...(g.soft ? { soft: true } : {}) };
        gaps.push(g0);
        // (or by the stage's brief, GraphBrief.pits: every section pit past the row's clearStart, with no mark on the section)
        const bp = M.graphs?.briefs?.[budget.id]?.pits, byBrief = (bp === 'hurt' || (bp === 'lesson' && !!M.hurtFloor && (tpl.teaches === M.hurtFloor.lesson || !!tpl.uses?.includes(M.hurtFloor.lesson)))) && !!g.pit && !g.water && !g.putBack && !g.back && g0.x0 >= Math.max(SPAWN_X + (M.hurtFloor?.clearStart ?? 0), hurtFrom);
        if (g.hurt || byBrief) {
          // (a hollow, a place marked `hurt`: the world's hurt floor, ONE marked piece at its row's depth under the lower lip, wall to wall,
          // no steps out, the banks either side reaching down to it; the zone over it, lip to lip, carries the floor's top as its hurt line.
          // Normal: a heart. Easy: soft. The depth is picked off the gap's x, so the roll's stream is the same with or without the mark)
          const H = M.hurtFloor;
          if (!H) throw new Error(`gen2 ${budget.id}: section ${tpl.id} lays a hurt place and the world's manifest has no hurtFloor row`);
          const before = platforms.length, x0 = R(g0.x0), x1 = R(g0.x1), floor = R(oy + g.lo + H.depth[0] + (x0 % (H.depth[1] - H.depth[0] + 1)));
          for (const q of platforms) if ((Math.abs(q.x + q.width - x0) < 3 || Math.abs(q.x - x1) < 3) && q.y < floor && q.height >= 40) q.height = Math.max(q.height, floor + M.ground.bankH - q.y);
          mk(x0, floor, x1 - x0, 'block', M.ground.bankH, 'moss_stone').pit = 'hurt';
          heartFalls.push({ x0, x1, y: floor, ...(budget.difficulty === 'easy' ? { soft: true } : {}) });
          placed.seam.push(...platforms.slice(before));
        } else if (g.putBack) {
          // (a level block gap: nothing under it; a fall is set back on the take-off ledge, nothing lost: the engine's heart fall, soft)
          heartFalls.push({ x0: R(g0.x0), x1: R(g0.x1), soft: true });
        } else if (g.pit && !g.water) {
          const before = platforms.length;
          // (a world with `heartFalls` (World 8, Matt 2026-10-31): on Normal a missed swing or glide (a gap with `back`: under a liana or a
          // glide) costs a heart and sets him back on the ledge he left, no pit under it; Easy's stay soft pits, the dark's stay soft)
          if (g.back && M.heartFalls && budget.pit !== 'soft' && !g.soft) heartFalls.push({ x0: R(g0.x0), x1: R(g0.x1) });
          else if (g.back) pitUnder(g0.x0, g0.x1, oy + g.back.lips[0], oy + g.back.lips[1], true, g.soft);
          else pitUnder(g0.x0, g0.x1, g0.y, g0.y, false, g.soft);
          placed.seam.push(...platforms.slice(before));
        } else if (!g.water && FR?.catchDrop) {
          const before = platforms.length;
          // (under the gap's LOWER lip, as a join's is: hung under the upper one it was a step down onto the lower bough, Roll A 11-05)
          catchUnder(g0.x0, g0.x1, oy + g.lo);
          placed.seam.push(...platforms.slice(before));
        }
      }
      // the sockets, bound to their piece (t along its top, dn above it)
      for (const s of L.sockets) {
        const p = pieceOf(s.on);
        const t0 = Math.max(0, Math.min(1, roll(srng, s.t)));
        const t = mirrored ? 1 - t0 : t0;
        placed.sockets.push({ socket: s, x: R(p.x + t * p.width), y: R(p.y - (s.dn ?? 0)), piece: p });
      }
      if (tpl.room) placed.room = placeRoom(tpl.room, placed.uid, (k) => pieceOf(k).id, (k) => {
        // (a vine a room's piece names is the kit's: a ladder rolled up, a sapling, a silk line; levelCheck leaves it to the room's check)
        const v = placed.vines.find((q) => q.key === k)?.vine;
        if (v) Object.assign(v, { kit: true, swaySpeed: 0 });
        return v?.id;
      });
      // its zones, over its placed pieces (their numbers from the slot's stream, after everything else it rolls)
      for (const z of tpl.zones ?? []) {
        if (z.kind === 'tide') {
          const mud = pieceOf(z.on);
          const warn = Math.max(0.9, z.warn ?? TIDE.warn);
          const active = Math.min(3, z.active ?? TIDE.active);
          // (the low spell outlasts the walk across, with the rise to spare: levelCheck's rule, by construction)
          const low = Math.max(2, roll(srng, z.low ?? TIDE.low), tideCrossTime(mud.width) - warn + 0.2);
          const period = low + warn + active;
          zones.push({ kind: 'tide', x0: mud.x, x1: mud.x + mud.width, top: mud.y - 210, bottom: mud.y + 14, baseY: mud.y, dir: -1, period, warn, active, offset: R(srng() * period * 10) / 10, force: z.force ?? TIDE.force });
          placed.beats.push({ x: mud.x, letter: 'S' });
        } else if (z.kind === 'wind') {
          // (the gap before `on`: from the piece it is laid after to `on` itself, a pad over each lip as the old generator's gusts)
          const spec = tpl.pieces.find((pc) => pc.key === z.on);
          const after = spec && 'after' in spec.place ? pieceOf(spec.place.after) : null;
          const land = pieceOf(z.on);
          if (after) {
            const lipY = Math.min(after.y, land.y);
            const active = Math.min(2.4, z.active ?? 2.2);
            const idle = Math.max(2, roll(srng, z.idle ?? [2.6, 3.2]));
            const warn = 1.1;
            const period = idle + warn + active;
            const [x0, x1] = mirrored ? [land.x + land.width, after.x] : [after.x + after.width, land.x];
            // (the way he travels, mirrored or not: a mirrored section is still played left to right)
            const dir = z.dir ?? 1;
            zones.push({ kind: 'wind', x0: R(Math.min(x0, x1) - 140), x1: R(Math.max(x0, x1) + 140), top: lipY - 260, bottom: lipY + 80, baseY: lipY, dir, period, warn, active, offset: R(srng() * period * 10) / 10, force: Math.min(160, z.force ?? 110) });
          }
        }
      }
      // (its crumbling tiles, one crumble zone over them: levelCheck's tile rules hold inside it, and nothing stands in it; it ends at
      // the tiles' underside, so the hall walked under them is not in it)
      const tiles = placed.pieces.filter((pp) => pp.platform.type === 'fragile').map((pp) => pp.platform);
      if (tiles.length) {
        const x0 = Math.min(...tiles.map((t) => t.x));
        const x1 = Math.max(...tiles.map((t) => t.x + t.width));
        const top = Math.min(...tiles.map((t) => t.y));
        const low = Math.max(...tiles.map((t) => t.y));
        zones.push({ kind: 'crumble', x0, x1, top: top - 200, bottom: low + CRUMBLE_H, baseY: low, dir: 1, period: 1, warn: 0, active: 1, offset: 0, force: 0 });
      }
      for (const g of L.gaps) placed.beats.push({ x: ox + g.x0, letter: 'J' });
      for (const lp of L.pieces) if (lp.hop) placed.beats.push({ x: ox + lp.x, letter: 'h' });
      // (a swing or a climb is a world move)
      for (const lp of L.pieces) if (lp.hang) placed.beats.push({ x: ox + lp.x, letter: 'V' });
      placed.beats.sort((a, b) => a.x - b.x);
      if (dx > 0) placed.beats.unshift({ x: cur.x, letter: 'J' });
      else if (join === 'step') placed.beats.unshift({ x: cur.x, letter: 'h' });
      placed.seconds = sectionSeconds(L, tpl, budget) + dx / budget.walkSpeed;
      secs += placed.seconds;
      sections.push(placed);
      // (a slot filled past its rule keeps its note with the plan, so a kept slot still says so)
      const loose = fixed ? fixed.loose : lastLoose;
      plan.push({ template: tpl.id, mirrored, node: n.id, join, ...(Object.keys(L.versions).length ? { versions: L.versions } : {}), ...(salt ? { salt } : {}), ...(loose ? { loose } : {}) });
      cool.use(tpl.id);
      used.set(tpl.id, (used.get(tpl.id) ?? 0) + 1);
      if (must.some((r) => r.section === tpl.id)) placedReq.add(tpl.id);
      if (tpl.teaches) taught.add(tpl.teaches);
      const exitP = pieceOf(L.exit.piece);
      cur = { x: ox + L.exit.x, y: oy + L.exit.y, kind: L.exit.kind, piece: exitP };
      // (a safe start, M.safeStart: the runway and the start section's ground, unbroken from the spawn; a plain bank after the start
      // for what they leave short, so the next section's first gap or animal is past it)
      if (n.phase === 'start' && M.safeStart && cur.kind === 'ground') {
        let reach = SPAWN_X;
        for (const p of platforms.filter((q) => q.type !== 'fragile' && q.type !== 'bouncy' && q.y >= runway.y - 400 && q.y <= runway.y + 60).sort((a, b) => a.x - b.x)) {
          if (p.x > reach + 1) break;
          reach = Math.max(reach, p.x + p.width);
        }
        const short = SPAWN_X + M.safeStart + 40 - cur.x;
        if (reach >= cur.x - 1 && short > 0) {
          const fill = mk(cur.x, cur.y, short, 'bank', 0);
          placed.x1 = Math.max(placed.x1, fill.x + fill.width);
          cur = { x: fill.x + fill.width, y: fill.y, kind: 'ground', piece: fill };
          secs += short / budget.walkSpeed;
          placed.seconds += short / budget.walkSpeed;
        }
      }
      // (a fork is one two-road section and the H node its one find, in every mode, as the arrival and the exit are one each)
      if (n.phase === 'start' || n.phase === 'goal' || n.job === 'fork' || n.job === 'reward') break;
    }
    if (riseFor !== undefined) {
      rise.push({ node: n.id, to: R(riseFor), exitY: R(cur.y) });
      // (as laid, not as estimated: a section's exit is chosen on its median lay, so a lay that ends short of the rise fails by name)
      const last = plan[plan.length - 1];
      if (cur.y > riseFor - 20 && last && last.node === n.id && !last.loose) last.loose = `${n.id} ${n.job}: the late rise ended at y ${R(cur.y)}, not 20 px above y ${R(riseFor)} (V19)`;
    }
  }
  // (a rolled graph's required section that found no node FAILS the roll with why, never an exception: the missing piece named, Law 22)
  const missing: string[] = [];
  for (const r of must) {
    if (placedReq.has(r.section)) continue;
    if (!graph.id) throw new Error(`gen2 ${budget.id}: the required section ${r.section} fits no node of the stage${r.phase ? ` (${r.phase})` : ''}`);
    const t = byId.get(r.section);
    const untaught = (t?.uses ?? []).filter((m) => !taught.has(m) && t?.teaches !== m);
    missing.push(`the required section ${r.section} fits no node${untaught.length ? `: ${untaught.join(', ')} never taught (no teach section for it was laid)` : ''}`);
  }
  // the shrine's bank (a walk on from the last section)
  const shrine = mk(cur.x, cur.y, SHRINE_BANK, 'bank', 0);
  const exitX = R(shrine.x + 300);
  clearClimbs(vines, platforms);
  // (the blocks: a teach or a test section's block pieces, as laid, for the place rule in the check)
  const nodeJob = new Map(graph.nodes.map((n) => [n.id, n.job]));
  const blocks = graph.id
    ? sections.flatMap((sec) => {
        const job = nodeJob.get(sec.node);
        if (job !== 'teach' && job !== 'test') return [];
        const tpl = byId.get(sec.template);
        const all = [...(tpl?.pieces ?? []), ...(tpl?.subBlocks ?? []).flatMap((sb) => sb.versions.flatMap((v) => v.pieces))];
        return all.filter((pc) => pc.block).flatMap((pc) => {
          const laidPc = sec.pieces.find((q) => q.key === pc.key);
          return laidPc ? [{ uid: sec.uid, key: pc.key, kind: pc.block!, landing: laidPc.platform }] : [];
        });
      })
    : [];
  const strays = graph.id ? sections.filter((q) => q.exit.y < M.corridor.top - 20 || q.exit.y > M.corridor.bottom + 20).map((q) => ({ uid: q.uid, y: Math.round(q.exit.y) })) : [];
  let shiftedDown = 0;
  // (a rolled graph's stage that climbs above the camera's reach is moved down whole: the camera never scrolls above y 0, so its highest
  // platform, vine, rope or socket is brought to CAMERA_TOP, where the shipped stages keep theirs (290-335 px), with room for a pickup
  // above it. Everything laid moves together; what is placed later (pickups, creatures, dressing, the totem) reads the moved pieces)
  if (graph.id) {
    // (a puzzle room's own pieces, laid later from its anchors, reach `above` over its left anchor's platform: they count too)
    const byPid = new Map(platforms.map((p) => [p.id, p]));
    const roomTops = sections.flatMap((q) => (q.room && byPid.get(q.room.left.on) ? [byPid.get(q.room.left.on)!.y - q.room.above] : []));
    const tops = [...platforms.map((p) => p.y), ...vines.map((v) => v.topY), ...ropes.map((r) => r.y), ...sections.flatMap((q) => q.sockets.map((k) => k.y)), ...roomTops];
    const down = tops.length ? Math.max(0, R(CAMERA_TOP - Math.min(...tops))) : 0;
    if (down > 0) {
      // (a puzzle room is anchored to its platforms by id, puzzleKit Anchor: it moves with them)
      for (const p of platforms) p.y += down;
      for (const v of new Set([...vines, ...sections.flatMap((q) => q.vines.map((e) => e.vine))])) { v.topY += down; v.bottomY += down; }
      for (const r of ropes) r.y += down;
      for (const g of gaps) g.y += down;
      for (const k of asks) { k.yTake += down; k.yLand += down; }
      for (const z of zones) { z.top += down; z.bottom += down; z.baseY += down; for (const l of z.lights ?? []) l.y += down; }
      // (a hollow's hurt line is its floor's top: it moves with the floor (found on 1-1's sections, briefPits.test.ts: the line stood
      // `down` px over the floor on every rolled stage, which is every World 1 stage))
      for (const z of heartFalls) if (z.y !== undefined) z.y += down;
      for (const q of sections) {
        q.entry.y += down;
        q.exit.y += down;
        for (const k of q.sockets) k.y += down;
      }
      cur.y += down;
      shiftedDown = down;
    }
  }
  return {
    sections,
    ...(missing.length ? { missing } : {}),
    ...(blocks.length ? { blocks } : {}),
    ...(strays.length ? { strays } : {}),
    ...(plan.some((p) => p.loose) ? { loosened: plan.flatMap((p, k) => (p.loose ? [`slot ${k + 1} (${p.loose})`] : [])) } : {}),
    plan,
    platforms,
    gaps,
    asks,
    spawn: { x: SPAWN_X, y: runway.y, piece: runway },
    exit: { x: exitX, y: shrine.y, piece: shrine },
    vines,
    ropes,
    zones,
    heartFalls,
    ...(rise.length ? { rise } : {}),
    width: R(shrine.x + shrine.width + 40),
    bottom: baseline + shiftedDown,
    nextId: pid,
    ...(themeShare < 1 ? { theme: M.sections.filter((t) => near.get(t.id)! < themeShare).map((t) => t.id) } : {}),
  };
}

/**
 * A soft pit's way out (§2 "every dip has a one-jump way out"; Easy's jumps keep the kid bot at 85%+): each rise out at most `hop` of
 * the plain jump's rise limit, every step's tread at least `tread` px (a kid's thumb lands on it; the inspector calls a landing under
 * 90 px narrow) and at most `maxTread`, with `floor` px of floor left before the first step to stand on. Under a liana the perch's face
 * stands at least `face` px more than a double jump over the floor (the engine's hoist over a lip is 26 px), so a fall never walks
 * or jumps out forward to the perch: the swing stays the way over.
 */
export const PIT = { hop: 0.85, tread: 100, maxTread: 140, floor: 60, face: 40 } as const;

/**
 * Where a soft pit's floor and its steps go, for a gap [x0, x1] between a near lip at `lipY` and a far lip at `farY` (world y, down):
 * the floor `depth` px under the lower lip, and steps up the far wall's foot, each rise at most `hop` px (one plain jump). A gap too
 * narrow for the steps that depth needs (each PIT.tread wide, PIT.floor of floor before them) gets as many as fit, and its floor is
 * raised to what they climb: a single-jump pit (60-145 px) has no room for a step, so its floor lies one hop under the far lip and
 * the far bank is the way out. Steps are stacked blocks against the far wall, each running to x1 (`x`, `w`: the block; its tread is
 * the part not under the next one up).
 */
export function pitSteps(x0: number, x1: number, lipY: number, farY: number, depth: number, hop: number, maxTread: number = PIT.maxTread): { floor: number; steps: Array<{ x: number; top: number; w: number }> } {
  const W = x1 - x0;
  const lower = Math.max(lipY, farY);
  const deep = lower + depth;
  const want = Math.max(0, Math.ceil((deep - farY) / hop - 1e-9) - 1);
  const fit = Math.max(0, Math.floor((W - PIT.floor) / PIT.tread));
  const n = Math.min(want, fit);
  // (never above the lower lip: the floor still catches a fall)
  const floor = Math.max(lower + 1, Math.min(deep, farY + hop * (n + 1)));
  const rise = (floor - farY) / (n + 1);
  const tread = n ? Math.min(maxTread, (W - PIT.floor) / n) : 0;
  const steps = [];
  for (let k = 1; k <= n; k++) steps.push({ x: x1 - tread * (n - k + 1), top: floor - rise * k, w: tread * (n - k + 1) });
  return { floor, steps };
}

/** does a section hold a block piece (NODES §8.7), in its own pieces or any sub-block version's */
function hasBlock(t: SectionTemplate): boolean {
  return [...t.pieces, ...(t.subBlocks ?? []).flatMap((b) => b.versions.flatMap((v) => v.pieces))].some((p) => !!p.block);
}

/** the moves a section's hanging pieces ask for (its own pieces and every sub-block version's): a liana swings, a vine climbs */
function hangsNeed(t: SectionTemplate): Move[] {
  const shapes = new Set([...t.pieces, ...(t.subBlocks ?? []).flatMap((b) => b.versions.flatMap((v) => v.pieces))].map((p) => p.shape));
  return [...(shapes.has('liana') ? (['swing'] as const) : []), ...(shapes.has('vine') ? (['climb'] as const) : [])];
}

/**
 * The soft pit under a liana, from the swing's ledge (its top `lipY`, its end x0) to the perch (`farY`, at x1): deep enough that the
 * perch's face stands PIT.face px more than a double jump over the floor, and its steps (PIT.tread each, the narrowest the rule allows,
 * so the stair keeps back from the perch) climb back up the near wall to the swing's ledge: pitSteps laid toward the near lip, mirrored.
 */
export function backPit(x0: number, x1: number, lipY: number, farY: number, pitDepth: number, hop: number): { floor: number; steps: Array<{ x: number; top: number; w: number }> } {
  const depth = Math.max(pitDepth, farY + DOUBLE_RISE + PIT.face - Math.max(lipY, farY));
  const out = pitSteps(x0, x1, farY, lipY, depth, hop, PIT.tread);
  return { floor: out.floor, steps: out.steps.map((s) => ({ ...s, x: x0 + x1 - (s.x + s.w) })) };
}

/** how far a climbing vine stands out in front of the face of the bough it leads up to (px): Pokey's half-width (21) and a little */
export const CLIMB_CLEAR = 26;

/**
 * Every climbing vine that stands on the face of a bough it leads up to (an `over` piece on a vine starts at the vine's x) is moved
 * CLIMB_CLEAR px out in front of it. The engine snaps Pokey to the vine's x, so on the face he hung 21 px inside the bough: climbing back
 * down and hopping off, he went up through its one-way top and fell out of the bottom of its body, a life (the first-timer bot, World 8,
 * 2026-10-29). The vault off the vine's top still lands on the bough.
 */
export function clearClimbs(vines: Vine[], platforms: readonly Platform[]): void {
  for (const v of vines) {
    if (v.vineType !== 'tree_climb') continue;
    const face = platforms.find((p) => p.type === 'solid' && Math.abs(p.y - v.topY) <= 2 && (Math.abs(p.x - v.x) <= 2 || Math.abs(p.x + p.width - v.x) <= 2));
    if (face) v.x += Math.abs(face.x - v.x) <= 2 ? -CLIMB_CLEAR : CLIMB_CLEAR;
  }
}

/** a stage id's place in the game ('5-7' -> 507), for lessons taught by an earlier stage */
const stageOrder = (id: string) => {
  const [w, s] = id.split('-').map(Number);
  return (w || 0) * 100 + (s || 0);
};

/** a section's puzzle room in the world: its anchors on the placed platforms' ids, its piece ids (and their wires) made unique */
export function placeRoom(room: LocalRoomSpec, uid: string, idOf: (key: string) => number, vineOf?: (key: string) => number | undefined): RoomSpec {
  const a = (l: LocalAnchor): Anchor => ({ ...l, on: idOf(l.on) });
  const name = (id: string) => `${uid}-${id}`;
  const wire = (w: Wire): Wire => (typeof w === 'string' ? name(w) : 'all' in w ? { all: w.all.map(wire) } : 'any' in w ? { any: w.any.map(wire) } : { not: wire(w.not) });
  // (every field of PieceSpec that names another piece, and every one that is an anchor or a list of them: puzzleKit.ts)
  const REFS = ['source', 'for', 'with', 'by', 'into'] as const;
  const ANCHORS = ['at', 'to'] as const;
  const pieces = room.pieces.map((p) => {
    const q = { ...p, id: name(p.id) } as Record<string, unknown>;
    for (const k of ANCHORS) if (q[k] && typeof q[k] === 'object') q[k] = a(q[k] as LocalAnchor);
    if (Array.isArray(q.trough)) q.trough = (q.trough as LocalAnchor[]).map(a);
    for (const k of REFS) if (typeof q[k] === 'string') q[k] = name(q[k] as string);
    if ('open' in p && p.open !== undefined) q.open = wire(p.open);
    // (a ladder's, sapling's or silk line's vine: the section's vine piece, by key)
    if (typeof q.vine === 'string') q.vine = vineOf?.(q.vine as string) ?? q.vine;
    return q as unknown as PieceSpec;
  });
  return { ...room, id: name(room.id), left: a(room.left), right: a(room.right), beyond: a(room.beyond), ground: room.ground.map(idOf), pieces, exit: name(room.exit) };
}

// ───────────────────────────── pass 4: the sockets ─────────────────────────────

const FLOWER_UP = 34;
/** the least gap between two animals of a kind, and between any two interactive things (C2 R_min) */
const SAME_CREATURE = 420;
const ANY_APART = 120;

export interface Filled {
  enemies: Enemy[];
  collectibles: Collectible[];
  checkpoints: Array<{ x: number; y: number; reached: boolean }>;
  hints: StageHint[];
  fills: FilledSocket[];
  barren: Array<[number, number]>;
  extras: Record<string, unknown>;
}

/**
 * Pass 4. In order: flags (rests, and wherever 35 s passed without one), Dot's tips (the first time a mechanic is met), linked
 * source/receptor pairs (both or neither, A7), the other props (a bag per tag, a short cooldown so the same prop is not next to
 * itself; a prop with a threat, PropDef.threat, is paid from the section's threat budget like a creature, in socket order), creatures
 * (paid from each section's threat budget: the budget times its tension, 60% on Easy; patches kept clear of
 * the start's opening seconds and of every safe spot; then Poisson spacing over all of them), pickups, the quota items, and petal
 * arcs over the jumps. Every roll is made whether or not Easy then drops the piece, so Easy and Normal stay on the same streams.
 * `normalFoes` (Easy laying Normal's plan: keptFoes of Normal's stage): a creature socket holds only the creature Normal's spacing
 * kept there, so Easy's animals are a subset of Normal's (Easy's own rules, spacing and 60% cut then drop from that list).
 */
export function fillSockets(laid: Laid, budget: StageBudget, kit: WorldKit, seed: number, sink: StageSink, normalFoes?: ReadonlyMap<string, string>, hard?: ReadonlySet<string>): Filled {
  const M = kit.manifest;
  const rng = rngFor(seed, 17);
  const easy = budget.difficulty === 'easy';
  const fills: FilledSocket[] = [];
  const checkpoints: Filled['checkpoints'] = [];
  const hints: StageHint[] = [];
  const C = sink.collectibles;
  /** a flower's look from a spot (its own, or its row's first: a row or an arc of flowers is one species, stageQuality.test.ts) */
  const lookAt = (x: number, y: number) => M.flowers[Math.floor(rngFor(seed, 29, R(x), R(y))() * M.flowers.length)];
  /** the stage's brief (GraphBrief.petals, .offRoad: what its pickups are and where they may hang is the brief's, not a section's) */
  const brief = M.graphs?.briefs?.[budget.id];
  const flower = (x: number, y: number, rowLook?: (typeof M.flowers)[number], type: 'flower' | 'fruit' = 'flower') => {
    if (C.some((c) => Math.hypot(c.x - x, c.y - y) < 40)) return;
    // (its look from its own spot, not the shared stream: a flower skipped for overlapping must not move every roll after it)
    const look = rowLook ?? lookAt(x, y);
    C.push({ id: sink.nextCollectibleId(), type, botanicalVariant: look, x: R(x), y: R(y), collected: false, bobPhase: (x * 0.031) % 6.28 });
  };
  const tipsSaid = new Set<string>();
  const refuse = M.graphs?.briefs?.[budget.id]?.pick?.refuse;
  // (lessons from earlier stages need no tip here)
  for (const [m, st] of Object.entries(M.lessons ?? {})) if (stageOrder(st) < stageOrder(budget.id)) tipsSaid.add(m);

  // flags: at the rests, wherever 35 s passed without one, and wherever the next section's end would leave more than FLAG_SPAN.max px
  // with none (a slow stealth stage's 35 s can be 6000 px). A flag goes in first, so it is a pad: the creatures' patches and the
  // top-up keep clear of it (the safe spots below), and a flag can always land
  // (the section the golden seed belongs to: the first laid section the manifest requires that holds a find socket)
  const reqIds = new Set((kit.manifest.required?.[budget.id] ?? []).map((r) => r.section));
  const seedHome = laid.sections.find((q) => reqIds.has(q.template) && q.sockets.some((k) => k.socket.role === 'find'))?.uid;
  let lastFlagT = 0;
  let t = 0;
  const flagSpot = (s: PlacedSection): { x: number; piece: Platform } | null => {
    const lastX = checkpoints.at(-1)?.x ?? SPAWN_X;
    const ok = (x: number, piece: Platform | undefined): piece is Platform => !!piece && x - piece.x > 30 && piece.x + piece.width - x > 30 && x > lastX + 600 && !flagInZone(laid.zones, x, piece.y);
    const flagSock = s.sockets.find((k) => k.socket.role === 'flag');
    if (flagSock && ok(flagSock.x, flagSock.piece)) return { x: flagSock.x, piece: flagSock.piece };
    const exitPiece = s.pieces.find((p) => p.platform.y === s.exit.y && p.platform.x + p.platform.width >= s.exit.x - 1)?.platform;
    if (ok(s.exit.x - 80, exitPiece)) return { x: s.exit.x - 80, piece: exitPiece };
    // (else the rightmost wide main piece of the section, near its end, outside a room)
    if (s.room) return null;
    for (const p of [...s.pieces].filter((q) => q.main && q.platform.width >= FLAG_SPAN.pad).sort((a, b) => b.platform.x - a.platform.x)) {
      const x = p.platform.x + p.platform.width - FLAG_SPAN.pad / 2;
      if (ok(x, p.platform)) return { x, piece: p.platform };
    }
    return null;
  };
  laid.sections.forEach((s, i) => {
    t += s.seconds;
    if (s.phase === 'goal') return;
    const lastX = checkpoints.at(-1)?.x ?? SPAWN_X;
    const nextEnd = laid.sections[i + 1] && laid.sections[i + 1].phase !== 'goal' ? laid.sections[i + 1].exit.x : laid.exit.x;
    const due = t - lastFlagT > 35 || nextEnd - lastX > FLAG_SPAN.max - FLAG_SPAN.slack;
    if (s.phase !== 'rest' && !due) return;
    const at = flagSpot(s);
    if (!at) return;
    checkpoints.push({ x: R(at.x), y: at.piece.y, reached: false });
    lastFlagT = t;
  });
  // (no span past FLAG_SPAN.max: a section holds one flag, and its flag socket can stand near its start, so a span the rule above left
  // long, a slow start section and a long teach after it (1-1 seed 1: 5914 px), is split at the furthest wide main piece still in reach)
  const rolledFlags = !!kit.manifest.graphs?.briefs?.[budget.id];
  for (let guard = 0; guard < 40 && !rolledFlags; guard++) {
    const xs = [laid.spawn.x, ...checkpoints.map((c) => c.x).sort((a, b) => a - b), laid.exit.x];
    const k = xs.findIndex((x, i) => i > 0 && x - xs[i - 1] > FLAG_SPAN.max);
    if (k < 0) break;
    const from = xs[k - 1], to = from + FLAG_SPAN.max - FLAG_SPAN.slack;
    let best: { x: number; y: number } | null = null;
    for (const sec of laid.sections) {
      if (sec.room) continue;
      for (const q of sec.pieces) {
        const pl = q.platform;
        if (!q.main || pl.width < FLAG_SPAN.pad) continue;
        const x = Math.min(pl.x + pl.width - FLAG_SPAN.pad / 2, to);
        if (x < pl.x + 30 || x < from + 600 || flagInZone(laid.zones, x, pl.y)) continue;
        if (!best || x > best.x) best = { x, y: pl.y };
      }
    }
    if (!best) break;
    checkpoints.push({ x: R(best.x), y: best.y, reached: false });
  }
  if (rolledFlags) {
    // (a rolled stage, ROLLED_FLAGS: the rests' and the clock's flags give way to the hard nodes': a flag at the end of the section
    // before each hard node's first section (its flag socket, its exit, or its last wide piece), then a flag closer than `min` to the
    // one before (or `first` to the start) goes, then every span past its cap (`last` before the exit) gets one at the furthest spot in
    // reach that keeps `min` from both neighbours. A span no spot splits is left, and the verdict fails the roll by name)
    checkpoints.length = 0;
    const lethal = lethalSpans({ spawnX: laid.spawn.x, exitTotemX: laid.exit.x, heartFalls: laid.heartFalls }, laid.gaps.map((g) => ({ x0: g.x0, x1: g.x1, kind: g.water ? 'water' : g.soft ? 'soft' : budget.pit })));
    const cap = (a: number, b: number) => (lethal.some(([l0, l1]) => l1 > a && l0 < b) ? ROLLED_FLAGS.lethal : ROLLED_FLAGS.max);
    // (a flag spot: a wide main piece's top, outside a room and a zone)
    const spots: Array<{ x0: number; x1: number; y: number }> = [];
    for (const sec of laid.sections) {
      if (sec.room) continue;
      for (const q of sec.pieces) {
        const pl = q.platform;
        if (q.main && pl.width >= FLAG_SPAN.pad) spots.push({ x0: pl.x + FLAG_SPAN.pad / 2, x1: pl.x + pl.width - FLAG_SPAN.pad / 2, y: pl.y });
      }
    }
    // (before each hard node: the furthest spot within `before` px ahead of its first section, or 150 px into it)
    const seen = new Set<string>();
    for (const sec of laid.sections) {
      if (!hard?.has(sec.node) || seen.has(sec.node)) continue;
      seen.add(sec.node);
      // (a hard node within first + clear of the start has the spawn for its restart: no flag fits before it)
      if (sec.x0 - laid.spawn.x < ROLLED_FLAGS.first + ROLLED_FLAGS.clear) continue;
      let best: { x: number; y: number } | null = null;
      for (const sp of spots) {
        const x = Math.min(sp.x1, sec.x0 - ROLLED_FLAGS.clear);
        if (x < sp.x0 || x < sec.x0 - ROLLED_FLAGS.before || flagInZone(laid.zones, x, sp.y)) continue;
        if (!best || x > best.x) best = { x, y: sp.y };
      }
      if (best) { checkpoints.push({ x: R(best.x), y: best.y, reached: false }); checkpoints.sort((a, b) => a.x - b.x); }
    }
    for (let k = 0; k < checkpoints.length; k++) {
      const prev = k ? checkpoints[k - 1].x : laid.spawn.x;
      if (checkpoints[k].x - prev < (k ? ROLLED_FLAGS.min : ROLLED_FLAGS.first)) { checkpoints.splice(k, 1); k--; }
    }
    for (let guard = 0; guard < 60; guard++) {
      const xs = [laid.spawn.x, ...checkpoints.map((c) => c.x), laid.exit.x];
      let k = -1;
      for (let i = 1; i < xs.length; i++) if (xs[i] - xs[i - 1] > (i === xs.length - 1 ? Math.min(ROLLED_FLAGS.last, cap(xs[i - 1], xs[i])) : cap(xs[i - 1], xs[i]))) { k = i; break; }
      if (k < 0) break;
      const from = xs[k - 1], to = xs[k], last = k === xs.length - 1;
      const lo = k === 1 ? laid.spawn.x + ROLLED_FLAGS.first : from + ROLLED_FLAGS.min;
      // (laid 20 px inside its cap: a test counting a span of exactly the cap as over it)
      const hi = Math.min(from + (last ? Math.min(ROLLED_FLAGS.last, cap(from, to)) : cap(from, to)) - 20, last ? to : to - ROLLED_FLAGS.min);
      let best: { x: number; y: number } | null = null;
      for (const sp of spots) {
        const x = Math.min(sp.x1, hi);
        if (x < sp.x0 || x < lo || flagInZone(laid.zones, x, sp.y)) continue;
        if (!best || x > best.x) best = { x, y: sp.y };
      }
      if (!best) break;
      checkpoints.push({ x: R(best.x), y: best.y, reached: false });
      checkpoints.sort((a, b) => a.x - b.x);
    }
  }
  checkpoints.sort((a, b) => a.x - b.x);
  const safe = [{ x: laid.spawn.x, y: laid.spawn.y }, ...checkpoints, { x: laid.exit.x, y: laid.exit.y }];
  // (where an animal may walk on each piece: clear of the jumps on and off it)
  const clear = jumpClearance(laid.platforms);
  const openX = laid.spawn.x + OPEN_SECONDS * budget.walkSpeed;

  // props and pairs
  const propBag = new Map<string, ShuffleBag<string>>();
  const propCool = new CooldownQueue<string>(2);
  const props: Array<RoutePiece & { fill: FilledSocket }> = [];
  const propFor = (s: Socket): string | null => {
    const ok = M.props.filter((p) => !s.allow?.length || s.allow.some((a) => p.tags.includes(a)));
    if (!ok.length) return null;
    const key = ok.map((p) => p.id).join(',');
    let bag = propBag.get(key);
    if (!bag) propBag.set(key, (bag = new ShuffleBag(rng, ok.map((p) => p.id))));
    const draws = [bag.draw()!, bag.draw()!];
    return propCool.pick(draws) ?? draws[0];
  };
  const fillProp = (sec: PlacedSection, k: PlacedSection['sockets'][number], what: string | null) => {
    const f: FilledSocket = { section: sec.uid, socket: k.socket.id, role: k.socket.role, what, x: k.x, y: k.y };
    fills.push(f);
    if (!what) return;
    const def = M.props.find((p) => p.id === what)!;
    props.push({ x: k.x, kind: what, fill: f });
    kit.emit?.[what]?.(f, def, sink);
    if (def.beat) sec.beats.push({ x: k.x, letter: 'S' });
  };

  const propThreat = (id: string) => M.props.find((p) => p.id === id)?.threat ?? 0;

  // creatures
  const creatureBag = new ShuffleBag<CreatureDef>(rng, M.creatures);
  const foes: Array<RoutePiece & { e: Enemy; fill: FilledSocket; sec: PlacedSection }> = [];

  for (const [si, sec] of laid.sections.entries()) {
    // (Normal's threat on both difficulties, so the sockets roll alike; Easy's 60% is a count cut after the spacing, below. Props with
    // a threat (PropDef.threat) spend it too, in socket order with the creatures)
    let threat = budget.threat * sec.tension;
    let objectives = 0;
    for (const [ki, k] of sec.sockets.entries()) {
      const s = k.socket;
      // (what the stage's brief refuses stays empty, GraphBrief.pick: another stage's line or prop never comes with a shape)
      if (refuse && s.allow?.some((a) => refuse.some((r) => a.startsWith(r)))) continue;
      // (each socket's chance from its own stream: whatever Easy or Normal did with the sockets before it, it rolls the same)
      const r0 = rngFor(seed, 17, si, ki)();
      const want = (s.chance ?? 1) > r0 && (!s.phases || s.phases.includes(sec.phase));
      const dropOnEasy = easy && s.easy === 'drop';
      if (s.role === 'tip') {
        const m = s.allow?.[0];
        if (m && !tipsSaid.has(m)) {
          tipsSaid.add(m);
          // (a tip names a Dot line by its id, said in the kit's words for it (the line's own, so swapLine knows it and a move row arms
          // the move watch). An id the kit has no words for is never shown: the roll fails by name, the red team 11-05, RT-PLAYER F1,
          // where "hint.1-1.double" itself was on screen)
          const text = tipWords(M.tips, m);
          if (text) hints.push({ x: k.x, text, pad: text, keys: text });
          fills.push({ section: sec.uid, socket: s.id, role: 'tip', what: m, x: k.x, y: k.y, ...(text ? {} : { unsaid: true }) });
        }
      } else if (s.role === 'receptor') {
        const src = sec.sockets.find((q) => q.socket.id === s.link);
        const pair = src && M.pairs.find((p) => (!s.allow?.length || s.allow.includes(p.receptor)) && Math.abs(src.x - k.x) >= p.minApart && Math.abs(src.x - k.x) <= p.maxApart);
        // (a pair's threat is both halves'; it is spent whether or not Easy then drops it, so Easy's creatures roll as Normal's)
        const cost = pair ? propThreat(pair.receptor) + propThreat(pair.source) : 0;
        const paid = want && !!pair && cost <= threat;
        if (paid) threat -= cost;
        const ok = paid && !(dropOnEasy && M.props.find((p) => p.id === pair!.receptor)?.hazard);
        fillProp(sec, k, ok ? pair!.receptor : null);
        if (src) fillProp(sec, src, ok ? pair!.source : null);
      } else if (s.role === 'source') {
        // (filled with its receptor, never alone)
      } else if (s.role === 'prop') {
        const what = propFor(s);
        const def = what ? M.props.find((p) => p.id === what) : undefined;
        // (a prop that acts like an animal is paid from the section's threat like one: none left, the socket stays empty)
        const paid = want && !!def && (def.threat ?? 0) <= threat;
        if (paid) threat -= def!.threat ?? 0;
        fillProp(sec, k, paid && !(dropOnEasy && def!.hazard) ? what : null);
      } else if (s.role === 'enemy') {
        const pick = creatureBag.draw();
        let c = [pick, ...M.creatures].find(
          (cr) => cr && cr.threat <= Math.min(s.maxThreat ?? Infinity, threat) && (!s.allow?.length || s.allow.includes(cr.id) || cr.tags?.some((tg) => s.allow!.includes(tg))) && terrainOK(cr, k.piece),
        );
        // (Easy on Normal's plan: only what Normal kept at this socket, so Easy never keeps an animal Normal's spacing dropped)
        if (normalFoes) {
          const kept = normalFoes.get(`${sec.uid}/${s.id}`);
          c = kept === undefined ? undefined : M.creatures.find((cr) => cr.id === kept);
        }
        if (!want || !c || (dropOnEasy && !c.easyFirst) || k.x < openX) continue;
        const pf = patchFor(k.x, k.piece, safe, c.minGround, clear.get(k.piece));
        if (!pf) continue;
        threat -= c.threat;
        // (nothing stands in a zone: levelCheck)
        if (foeInZone(sink.zones, pf.at, k.piece.y - (c.footY ?? c.h / 2))) continue;
        const e = makeEnemy(c, pf.at, k.piece.y, pf.patch, sink.nextEnemyId(), easy && s.easy === 'soften');
        const fill: FilledSocket = { section: sec.uid, socket: s.id, role: 'enemy', what: c.id, x: pf.at, y: k.y };
        foes.push({ x: pf.at, kind: c.id, e, fill, sec });
      } else if (s.role === 'pickup') {
        if (!want) continue;
        const n = s.count ?? 1;
        const span = Math.min(s.span ?? 0, k.piece.width - 40);
        const rowLook = lookAt(k.x, k.y);
        // (off the road pays in blooms where the brief says so: a piece the lay placed with `main` false)
        const what = brief?.offRoad === 'fruit' && sec.pieces.some((p) => p.platform === k.piece && p.main === false) ? 'fruit' : 'flower';
        for (let i = 0; i < n; i++) {
          const x = n === 1 ? k.x : k.x - span / 2 + (span * i) / (n - 1);
          flower(Math.max(k.piece.x + 20, Math.min(k.piece.x + k.piece.width - 20, x)), k.piece.y - (s.dn ?? FLOWER_UP), rowLook, what);
        }
        fills.push({ section: sec.uid, socket: s.id, role: 'pickup', what, x: k.x, y: k.y });
      } else if (s.role === 'objective') {
        const wantN = graphObjectives(laid, sec);
        if (objectives >= wantN) continue;
        objectives++;
        const type: Collectible['type'] = budget.archetype === 'rescue' ? 'cage' : 'relic';
        C.push({ id: sink.nextCollectibleId(), type, x: k.x, y: k.piece.y - (s.dn ?? 30), collected: false, bobPhase: 0, ...(type === 'cage' ? { cageHp: 2 } : {}) });
        fills.push({ section: sec.uid, socket: s.id, role: 'objective', what: type, x: k.x, y: k.y });
      } else if (s.role === 'decor' && s.allow?.includes('bootprint')) {
        // (1-1's clue, R-165.31: the bootprint on the end log's walking line, every roll, once; reported as dressing at its log's top,
        // which w1NewArt drawW1Clue draws flush in the moss)
        if (sink.proto.mixDress?.some((d) => d.n === 'bootprint')) continue;
        (sink.proto.mixDress ??= []).push({ n: 'bootprint', x: R(k.x), b: k.piece.y });
        fills.push({ section: sec.uid, socket: s.id, role: 'decor', what: 'bootprint', x: k.x, y: k.y });
      } else if (s.role === 'find') {
        // (a hidden find, the golden seed: once a stage, by construction where its section's socket stands (the section is placed by
        // manifest.required, so every roll holds one))
        // (and only there when a required section holds a find, 11-06: a fork's high road has a find socket too, and the first find on
        // the stage took the one seed, 34 px over a fork log far from its perch, so the perch's own socket was never filled: the seed's
        // promise failed on Rolls A and C)
        if (seedHome && sec.uid !== seedHome) continue;
        if (C.some((c) => c.type === 'seed')) continue;
        C.push({ id: sink.nextCollectibleId(), type: 'seed', x: k.x, y: k.piece.y - (s.dn ?? 30), collected: false, bobPhase: 0 });
        fills.push({ section: sec.uid, socket: s.id, role: 'find', what: 'seed', x: k.x, y: k.y });
      }
    }
  }
  // Poisson spacing over the creatures, the props fixed first (C2): a minimum gap of a kind, any two apart, no long barren run
  const minGap: Record<string, number> = {};
  for (const c of M.creatures) minGap[c.id] = SAME_CREATURE;
  for (const p of M.props) minGap[p.id] = p.minApart;
  const beats: RoutePiece[] = laid.sections.flatMap((s) => s.beats.map((b) => ({ x: b.x, kind: `beat:${b.letter}` })));
  const spaced = poissonPlace<RoutePiece>(foes, {
    rng,
    minGap,
    minGapAny: ANY_APART,
    maxGap: budget.quiet * budget.walkSpeed,
    fixed: [...props, ...beats],
    start: laid.spawn.x + OPEN_SECONDS * budget.walkSpeed,
    end: laid.exit.x - 200,
  });
  const kept = new Set(spaced.placed);
  // Easy's enemy budget (Part 1 §3: 60%): of each kind the first stays (the stage still shows what it teaches), then 60% of the rest,
  // evenly. (Phase 2: the engine's easyStage leaves gen2's animals alone, so they are not cut twice.)
  if (easy) {
    const seen = new Map<string, number>();
    for (const f of foes) {
      if (!kept.has(f)) continue;
      const k = seen.get(f.kind) ?? 0;
      seen.set(f.kind, k + 1);
      if (k > 0 && Math.floor(k * budget.enemyShare) === Math.floor((k - 1) * budget.enemyShare)) kept.delete(f);
    }
  }
  const byCreature = new Map(M.creatures.map((c) => [c.id, c]));
  for (const f of foes) {
    // (an emitter may have laid a zone since the socket was filled)
    if (!kept.has(f) || foeInZone(sink.zones, f.e.x, f.e.y)) continue;
    sink.enemies.push(f.e);
    fills.push(f.fill);
    f.sec.beats.push({ x: f.x, letter: 'C' });
    kit.spawn?.(f.e, byCreature.get(f.kind)!, sink);
  }
  const topped = topUpFoes(laid, budget, kit, seed, sink, safe, openX, [...foes.filter((f) => kept.has(f)), ...props]);
  fills.push(...topped);
  // (rests are allowed to be quiet: only barren stretches outside them are reported, and a top-up animal fills the stretch it is in)
  const restSpans = laid.sections.filter((s) => s.phase === 'rest' || s.phase === 'start' || s.phase === 'goal').map((s) => [s.x0, s.x1] as const);
  const barren = spaced.unfilled
    .filter((g) => !restSpans.some(([a, b]) => g.from >= a - 60 && g.to <= b + 60))
    .filter((g) => !topped.some((f) => f.x > g.from && f.x < g.to))
    .map((g) => [R(g.from), R(g.to)] as [number, number]);

  // petal arcs over the jumps (half a beat each, E1), and a harvest's top-up to its laid count
  for (const [gi, g] of laid.gaps.entries()) {
    const arc = rngFor(seed, 31, gi)() <= 0.7;
    // (GraphBrief.petals 'low': no arc over any gap)
    if (g.x1 - g.x0 < 90 || !arc || brief?.petals === 'low') continue;
    const arcLook = lookAt(g.x0, g.y);
    for (let i = 0; i < 3; i++) {
      const tt = (i + 0.5) / 3;
      flower(g.x0 + (g.x1 - g.x0) * tt, g.y - 70 - 50 * Math.sin(Math.PI * tt), arcLook);
    }
  }
  if (budget.archetype === 'harvest') {
    const flowers = () => C.filter((c) => c.type === 'flower').length;
    for (const s of laid.sections) {
      for (const p of s.pieces) {
        if (flowers() >= budget.quota.lay) break;
        if (!p.main || p.platform.width < 200) continue;
        // (never inside a piece standing on this one, a stump or a block: levelCheck refuses the petal and a harvest at its laid count
        // cannot give it up, so the roll failed; with GraphBrief.petals and .offRoad the top-up lays most of a stage's petals)
        const y = p.platform.y - FLOWER_UP, clear = (x: number) => !laid.platforms.some((q) => x >= q.x && x <= q.x + q.width && y > q.y + 2 && y < q.y + q.height - 2);
        for (let x = p.platform.x + 60; x < p.platform.x + p.platform.width - 60 && flowers() < budget.quota.lay; x += 90) if (clear(x)) flower(x, y);
      }
    }
  }
  // water (Matt, 2026-10-28): a fall into it costs a life on Easy too, so it is warned: Dot's line WATER_WARN.lead px before the lip
  // (gone once he is past it) and a sign at the edge (proto.gen2.waterWarnings, for the world's art). Normal warns at the first water
  // only (the teaching rule); Easy at every water gap once WATER_WARN.every seconds of walking passed since the last warning.
  // (a deep chasm, a world's `void` falls on Normal, costs a life the same way: it shows the world's dirty water far below as its line,
  // painted, and is warned the same way; World 8's treetops have no water: its drop is warned by its own line, w8.ts)
  const wet = laid.gaps.filter((g) => budget.pit === 'water' || (budget.pit === 'void' && budget.world !== 8) || g.water);
  if (wet.length) {
    const every = WATER_WARN.every * budget.walkSpeed;
    const text = M.tips?.water ?? WATER_LINE;
    const signs = (sink.extras.waterWarnings ??= []) as Array<{ x: number; y: number }>;
    let last = -Infinity;
    for (const g of [...wet].sort((a, b) => a.x0 - b.x0)) {
      if (g.x1 - g.x0 < 20) continue;
      if (signs.length && (!easy || g.x0 - last < every)) continue;
      const x = R(Math.max(laid.spawn.x + 40, g.x0 - WATER_WARN.lead));
      hints.push({ x, text, pad: text, keys: text, passX: R(g.x1 + 80) });
      // (the sign stands on the near lip: g.y is the higher of the two lips, so where the far side stood higher the sign hung in the air)
      const sx = g.x0 - 40;
      const lip = laid.platforms.filter((q) => q.x <= sx && q.x + q.width >= sx && q.y >= g.y - 1).reduce((m, q) => Math.min(m, q.y), Infinity);
      signs.push({ x: R(sx), y: R(Number.isFinite(lip) ? lip : g.y) });
      fills.push({ section: g.section ?? '', socket: 'water', role: 'tip', what: 'water', x, y: R(g.y) });
      last = g.x0;
    }
  }
  // (a flag an emitter's zone has come to cover is taken down: nothing stands in a zone)
  const flags = checkpoints.filter((c) => !flagInZone(sink.zones, c.x, c.y));
  return { enemies: sink.enemies, collectibles: C, checkpoints: flags, hints, fills, barren, extras: sink.extras };
}

/** levelCheck's zone rules: an animal inside a zone's box (30 px either side, 60 below), a flag inside it */
const foeInZone = (zones: readonly Zone[], x: number, y: number) => zones.some((z) => x > z.x0 - 30 && x < z.x1 + 30 && y > z.top && y < z.bottom + 60);
const flagInZone = (zones: readonly Zone[], x: number, y: number) => zones.some((z) => x >= z.x0 - 1 && x <= z.x1 + 1 && y > z.top && y < z.bottom);

/** the quota items a section's node asks for, shared out among the node's sections in turn */
function graphObjectives(laid: Laid, sec: PlacedSection): number {
  const meta = laid as Laid & { objectives?: Map<string, number> };
  // (a section with no share of a quota lays none: a relic socket in a sprint stays empty)
  return meta.objectives?.get(sec.uid) ?? 0;
}

const terrainOK = (c: CreatureDef, p: Platform) => (c.terrain === 'air' ? true : c.terrain === 'flat' ? p.width >= c.minGround : p.width >= c.minGround);

/**
 * Where an animal may walk on each piece, clear of the jumps (stageMetrics JUMP_CLEAR, the same jumps its clearance check finds: jumpEdges):
 * its patrol ends JUMP_CLEAR px short of a jump's take-off from that piece and starts JUMP_CLEAR px past a jump's landing on it, so he
 * never takes off into it or lands on it. By piece (the laid platforms, each piece's own object).
 */
function jumpClearance(platforms: readonly Platform[]): Map<Platform, { lo: number; hi: number }> {
  const out = new Map<Platform, { lo: number; hi: number }>();
  const of = (p: Platform) => out.get(p) ?? (out.set(p, { lo: -Infinity, hi: Infinity }), out.get(p)!);
  for (const j of jumpEdges([...platforms])) {
    const a = of(j.from);
    a.hi = Math.min(a.hi, j.takeoffX - JUMP_CLEAR);
    const b = of(j.to);
    b.lo = Math.max(b.lo, j.landX + JUMP_CLEAR);
  }
  return out;
}

/**
 * the creature's patch on its piece: the stretch around x clear of every safe spot (levelCheck SAFE_APPROACH) and of the piece's jumps
 * (`clear`, jumpClearance), or null if too short. An x the jumps leave outside the stretch is moved into it (`at`): the animal stands
 * on the clear ground of its piece, or not at all.
 */
function patchFor(x: number, p: Platform, safe: ReadonlyArray<{ x: number; y: number }>, minGround: number, clear?: { lo: number; hi: number }): { patch: [number, number]; at: number } | null {
  let lo = p.x + 24;
  let hi = p.x + p.width - 24;
  for (const s of safe) {
    if (Math.abs(s.y - p.y) >= 400) continue;
    const a = s.x - SAFE_APPROACH - 24;
    const b = s.x + SAFE_APPROACH + 24;
    if (b < lo || a > hi) continue;
    if (x < a) hi = Math.min(hi, a);
    else if (x > b) lo = Math.max(lo, b);
    else return null;
  }
  if (!(x >= lo && x <= hi)) return null;
  if (clear) {
    lo = Math.max(lo, clear.lo);
    hi = Math.min(hi, clear.hi);
  }
  if (hi - lo < minGround) return null;
  const at = Math.max(lo, Math.min(hi, x));
  return { patch: [R(lo), R(hi)], at: R(at) };
}

/** a top-up animal keeps this far from a flag it stands before (px): never waiting right at the next checkpoint */
const FLAG_BEFORE = 400;

/**
 * A purge's or gauntlet's top-up (like a harvest's): its goal counts animals (5-9: 26), and the threat budgets alone lay fewer. Adds
 * the world's creatures (those tagged `topup`, else every ground creature, from a bag) on the widest main-route pieces, round by
 * round (each piece's middle, then its quarters, then its eighths), until `budget.quota.lay` stand before the shrine: Normal the goal
 * + 2, Easy easyMode's goal (round(0.6 x the goal)) + 2. Never in the opening seconds, a rest, the start, the shrine's stretch or a
 * room; never within FLAG_BEFORE px before a flag nor within reach of a safe spot (patchFor); never under a stump standing on the
 * piece; Poisson-spaced against every animal and prop already laid. The goal stays the designed number (config.targetCount).
 */
function topUpFoes(
  laid: Laid,
  budget: StageBudget,
  kit: WorldKit,
  seed: number,
  sink: StageSink,
  safe: ReadonlyArray<{ x: number; y: number }>,
  openX: number,
  fixed: readonly RoutePiece[],
): FilledSocket[] {
  if (budget.archetype !== 'purge' && budget.archetype !== 'gauntlet') return [];
  const M = kit.manifest;
  const lastX = laid.exit.x - 200;
  const need = budget.quota.lay - sink.enemies.filter((e) => e.x <= lastX).length;
  if (need <= 0) return [];
  const tagged = M.creatures.filter((c) => c.terrain !== 'air' && c.tags?.includes('topup'));
  const kinds = tagged.length ? tagged : M.creatures.filter((c) => c.terrain !== 'air');
  if (!kinds.length) return [];
  const bag = new ShuffleBag<CreatureDef>(rngFor(seed, 37), kinds);
  const flags = safe.slice(1, -1);
  const pieces = laid.sections
    .filter((s) => s.phase !== 'start' && s.phase !== 'rest' && s.phase !== 'goal' && !s.room)
    .flatMap((s) => s.pieces.filter((p) => p.main).map((p) => ({ s, p: p.platform })))
    .sort((a, b) => b.p.width - a.p.width || a.p.x - b.p.x);
  // (where an animal may walk on each piece: clear of the jumps on and off it)
  const clear = jumpClearance(laid.platforms);
  // (the stretch of a piece's top with nothing standing on it: a stump on a bank is a wall in a patrol)
  const freeRun = (x: number, p: Platform): [number, number] | null => {
    let lo = p.x;
    let hi = p.x + p.width;
    for (const q of laid.platforms) {
      if (q === p || q.x >= p.x + p.width || q.x + q.width <= p.x || q.y >= p.y || q.y + q.height < p.y - 4) continue;
      if (x >= q.x - 30 && x <= q.x + q.width + 30) return null;
      if (q.x + q.width <= x) lo = Math.max(lo, q.x + q.width);
      else hi = Math.min(hi, q.x);
    }
    return [lo, hi];
  };
  type Cand = RoutePiece & { c: CreatureDef; p: Platform; s: PlacedSection; patch: [number, number] };
  const cands: Cand[] = [];
  for (const ts of [[0.5], [0.25, 0.75], [0.125, 0.375, 0.625, 0.875]]) {
    for (const { s, p } of pieces) {
      for (const t of ts) {
        const x = R(p.x + t * p.width);
        const c = bag.draw()!;
        if (x < openX || x > lastX || !terrainOK(c, p) || foeInZone(sink.zones, x, p.y - (c.footY ?? c.h / 2))) continue;
        if (flags.some((f) => x <= f.x && f.x - x < FLAG_BEFORE)) continue;
        const run = freeRun(x, p);
        if (!run) continue;
        const pf = patchFor(x, { ...p, x: run[0], width: run[1] - run[0] }, safe, c.minGround, clear.get(p));
        if (pf && !foeInZone(sink.zones, pf.at, p.y - (c.footY ?? c.h / 2))) cands.push({ x: pf.at, kind: c.id, c, p, s, patch: pf.patch });
      }
    }
  }
  const minGap: Record<string, number> = {};
  for (const c of M.creatures) minGap[c.id] = SAME_CREATURE;
  const spaced = poissonPlace<RoutePiece>(cands, { rng: rngFor(seed, 41), minGap, minGapAny: ANY_APART, maxGap: Infinity, fixed });
  const ok = new Set(spaced.placed);
  const out: FilledSocket[] = [];
  for (const k of cands) {
    if (out.length >= need) break;
    if (!ok.has(k)) continue;
    const e = makeEnemy(k.c, k.x, k.p.y, k.patch, sink.nextEnemyId(), budget.difficulty === 'easy');
    sink.enemies.push(e);
    k.s.beats.push({ x: k.x, letter: 'C' });
    kit.spawn?.(e, k.c, sink);
    out.push({ section: k.s.uid, socket: 'topup', role: 'enemy', what: k.c.id, x: k.x, y: k.p.y });
  }
  return out;
}

/** the cast record a built stage carries: only when its brief names a cast (nothing is written on any other stage) */
function castOf(kinds: readonly string[] | undefined, proto: ProtoExtras): { cast?: NonNullable<ProtoExtras['cast']> } {
  return kinds?.length ? { cast: { ...proto.cast, kinds: [...kinds], traps: proto.cast?.traps ?? [] } } : {};
}

function makeEnemy(c: CreatureDef, x: number, top: number, patch: [number, number], id: number, soften: boolean): Enemy {
  return {
    id,
    type: c.enemy,
    x: R(x),
    y: R(top - (c.footY ?? c.h / 2)),
    vx: 0,
    vy: 0,
    width: c.w,
    height: c.h,
    hp: c.hp,
    maxHp: c.hp,
    facing: -1,
    patrolMinX: patch[0],
    patrolMaxX: patch[1],
    attackCooldown: soften ? 1.8 : 1.2,
    telegraphTimer: 0,
    isAttacking: false,
    animTimer: 0,
    hitFlashTimer: 0,
    defeated: false,
    koTimer: 0,
    behaviorTimer: 0,
    ...c.extra,
  } as Enemy;
}

// ───────────────────────────── pass 6: dressing ─────────────────────────────

/** Pass 6: each decor job's set chosen by the roll with the stage cooldown (artRoll rollLook), laid along the main banks */
export function dress(laid: Laid, budget: StageBudget, kit: WorldKit, seed: number, sink: StageSink): Record<string, string> {
  const M = kit.manifest;
  const rng = rngFor(seed, 23);
  const looks: Record<string, string> = {};
  const jobs = [...new Set(M.decor.map((d) => d.job))];
  jobs.forEach((job, ji) => {
    const set = rollLook(M.decor.filter((d) => d.job === job), budget.stage, seed, ji + 1);
    looks[job] = set.id;
    const items: Array<{ n: string; x: number; y: number; w: number; set: string }> = [];
    for (const s of laid.sections) {
      for (const p of s.pieces) {
        if (!p.main || p.platform.width < 160) continue;
        for (let x = p.platform.x + roll(rng, set.every) / 2; x < p.platform.x + p.platform.width - 60; x += roll(rng, set.every)) {
          const it = set.items[Math.floor(rng() * set.items.length)];
          items.push({ n: it.n, x: R(x), y: p.platform.y, w: R(roll(rng, it.w)), set: set.id });
        }
      }
    }
    if (kit.decorate) kit.decorate(items, sink);
    else ((sink.extras.decor ??= []) as unknown[]).push(...items);
  });
  sink.proto.beats = laid.sections.map((s) => [R(s.x0), R(s.x1), `${s.template}:${s.phase}`]);
  return looks;
}

// ───────────────────────────── assembly, pass 5, the whole build ─────────────────────────────

interface Built {
  stage: Gen2Stage;
  laid: Laid;
}

/** the creatures a stage kept at its sockets (section uid/socket id -> creature id), after its spacing and its repairs: Easy's list */
export function keptFoes(st: Gen2Stage): Map<string, string> {
  const at = new Set(st.enemies.map((e) => e.x));
  return new Map(st.gen2.fills.filter((f) => f.role === 'enemy' && f.socket !== 'topup' && f.what && at.has(R(f.x))).map((f) => [`${f.section}/${f.socket}`, f.what!]));
}

function assemble(req: BuildRequest, budget: StageBudget, graph: MissionGraph, seed: number, opt: LayOptions, normalFoes?: ReadonlyMap<string, string>): Built {
  const laid = layStage(budget, graph, req.kit, seed, opt);
  // the quota items of each node, shared among its sections that have an objective socket
  const objectives = new Map<string, number>();
  for (const n of graph.nodes) {
    if (!n.objectives) continue;
    const secs = laid.sections.filter((s) => s.node === n.id && s.sockets.some((k) => k.socket.role === 'objective'));
    secs.forEach((s, i) => objectives.set(s.uid, Math.floor(n.objectives! / secs.length) + (i < n.objectives! % secs.length ? 1 : 0)));
  }
  (laid as Laid & { objectives?: Map<string, number> }).objectives = objectives;
  let pid = laid.nextId;
  let cid = 1;
  let eid = 500;
  const proto: ProtoExtras = { hints: [], covers: [], beats: [] };
  const sink: StageSink = {
    platforms: laid.platforms,
    enemies: [],
    collectibles: [],
    proto,
    extras: {},
    zones: [...laid.zones],
    nextPlatformId: () => pid++,
    nextCollectibleId: () => cid++,
    nextEnemyId: () => eid++,
  };
  // (each liana's own swing, for the engine's self-swinging vines: proto.gen2.lianas, by vine id)
  const lianas = laid.sections.flatMap((s) => s.vines.flatMap((v) => (v.swing ? [{ vine: v.vine.id, amp: v.swing.amp, period: v.swing.period, ...(v.window !== undefined ? { window: Math.round(v.window * 1000) / 1000 } : {}), ...(v.gap ? { x0: v.gap[0], x1: v.gap[1] } : {}) }] : [])));
  if (lianas.length) sink.extras.lianas = lianas;
  const filled = fillSockets(laid, budget, req.kit, seed, sink, normalFoes, new Set(graph.nodes.filter((n) => n.job && HARD_JOBS.has(n.job)).map((n) => n.id)));
  const looks = dress(laid, budget, req.kit, seed, sink);
  proto.hints = filled.hints;
  const rooms = laid.sections.flatMap((s) => (s.room ? [s.room] : []));
  const platforms = laid.platforms;
  if (rooms.length) addKitPlatforms(platforms, { rooms });
  sink.collectibles.push({ id: sink.nextCollectibleId(), type: 'exit_totem', x: laid.exit.x, y: laid.exit.y - 30, collected: false, bobPhase: 0 });
  // (a floor at or under the death line (the water's 40 px under bobFoot, or the fall line 240 px under it) pulls the line down under it,
  // only for a floor it would kill on, so the shipped stages' water and views stay as curated: World 9's fix, gen2Pits.test.ts)
  const bobLow = laid.bottom;
  const floors = laid.platforms.filter((p) => !p.lift && p.type === 'solid').map((p) => p.y);
  const watery = budget.pit === 'water' || (budget.pit === 'void' && budget.world !== 8) || laid.gaps.some((g) => g.water);
  const kills = (y: number) => (watery ? y >= bobLow + 36 : y >= Math.max(req.config.levelHeight, R(bobLow + 120)) + 116);
  const bobFoot = Math.max(bobLow, ...floors.filter((y) => budget.world === 9 || kills(y)).map((y) => y + 30));
  const config: LevelConfig = { ...req.config, levelWidth: laid.width, levelHeight: Math.max(req.config.levelHeight, R(bobFoot + 120)), ...(budget.doubleTaught ? { doubleTaught: true as const } : {}) };
  const meta: Gen2Meta = {
    seed,
    plan: laid.plan,
    rerolls: 0,
    repairs: [],
    budget,
    graph,
    ...(graph.id ? realisedCode(graph, laid, req.kit.manifest, budget) : {}),
    ...(laid.loosened ? { loosened: laid.loosened } : {}),
    ...(laid.missing ? { missing: laid.missing } : {}),
    ...(laid.rise ? { rise: laid.rise } : {}),
    // (the stage's own brief, never the world's: 1-1 alone, R-165.86)
    ...(req.kit.manifest.graphs?.briefs?.[budget.id]?.softFalls ? { softFalls: true as const } : {}),
    ...hurtMeta(laid, req.kit.manifest),
    sections: laid.sections.map(({ uid, template, node, phase, tension, mirrored, x0, x1, seconds }) => ({ uid, template, node, phase, tension, mirrored, x0, x1, seconds })),
    fills: filled.fills,
    ...(laid.theme ? { theme: laid.theme } : {}),
    looks,
    modelled: { typical: 0, fast: 0 },
    errors: [],
    barren: filled.barren,
    falls: laid.gaps.map((g) => ({ x0: R(g.x0), x1: R(g.x1), y: R(g.y), kind: (g.water ? 'water' : g.soft ? 'soft' : budget.pit) as PitKind })),
  };
  const stage: Gen2Stage = {
    config,
    trees: [],
    platforms,
    vines: laid.vines,
    ropes: laid.ropes,
    enemies: filled.enemies,
    boss: null,
    collectibles: sink.collectibles,
    spawnX: laid.spawn.x,
    spawnY: laid.spawn.y,
    exitTotemX: laid.exit.x,
    exitTotemY: laid.exit.y,
    checkpoints: filled.checkpoints,
    // (a deadly chasm shows the dirty water far below, World 7; World 8's treetops have none: its deadly falls drop into the dark)
    ...(watery ? { waterY: Math.max(laid.bottom, bobFoot) + 40 } : {}),
    ...(sink.zones.length ? { zones: sink.zones } : {}),
    ...(laid.heartFalls.length ? { heartFalls: laid.heartFalls } : {}),
    ...(rooms.length ? { kit: { rooms } } : {}),
    // (a brief that names a cast: the kinds the kit runs, with whatever drop traps the stage's props laid, castPlay.types.ts)
    proto: Object.assign(proto, Object.keys(filled.extras).length ? { gen2: filled.extras } : {}, castOf(req.kit.manifest.graphs?.briefs?.[budget.id]?.cast, proto)),
    meta: { attempt: seed, chunks: laid.sections.map((s) => s.template), width: laid.width, pieces: laid.sections.map((s) => ({ k: s.template, x0: R(s.x0), x1: R(s.x1), beat: s.phase })) },
    gen2: meta,
  };
  ASKS.set(stage, laid.asks ?? []);
  return { stage, laid };
}
/** each built stage's route asks (laid in world px), read by applyVerdicts; kept off gen2 so the built stage carries the verdicts only */
const ASKS = new WeakMap<Gen2Stage, NonNullable<Laid['asks']>>();

/**
 * levelCheck on the stage as this difficulty will play it: an Easy purge or gauntlet is held to easyMode's goal (budget.quota.check,
 * round(0.6 x the goal)), which the engine's easyStage sets at play; the stage itself keeps the designed goal in its config
 */
export function checkStage(st: GeneratedStage, budget: StageBudget): ReturnType<typeof validateStage> {
  const cfg = st.config;
  const held = budget.quota.check === cfg.targetCount ? st : { ...st, config: { ...cfg, targetCount: budget.quota.check } };
  // (1-1 links level jumps by the flown arcs too, R-165.61; every other stage exactly as before)
  const res = judgedOnArcs(budget.id) ? validateStage(held, { arcs: linkArcs(budget.difficulty, budget.id) }) : validateStage(held);
  // (crumbling tiles are never needed, STAGE-RULES §1: the stage with every tile gone still reaches the shrine and its goal. Only a
  // petal or a heart over a tile may be out of reach without them: it is a tile's reward)
  if (!st.platforms.some((p) => p.type === 'fragile')) return res;
  const bareSt = { ...held, platforms: held.platforms.filter((p) => p.type !== 'fragile') };
  const bare = judgedOnArcs(budget.id) ? validateStage(bareSt, { arcs: linkArcs(budget.difficulty, budget.id) }) : validateStage(bareSt);
  const need = bare.errors.filter((e) => !/^(flower|leaf|heart) #/.test(e)).map((e) => `crumbling tiles needed: ${e}`);
  return need.length ? { ...res, ok: false, errors: [...res.errors, ...need] } : res;
}

/**
 * The block rule (NODES.md §8.7 B1-B4, as amended at 5:44 PM): a block can't be walked round. A 'double' block's landing is reached by
 * no single jump from any platform before it (the take-off, the floor road, a pit's floor or its steps, a catch bough, a stone, a
 * stump), with 20 px to spare in height and in reach: so its rise is past a single jump's 108 + 20, or its gap past a single's reach +
 * 20, and nothing under it stairs past (a pit floor or a bough at least 128 px under it). A 'bounce' block's landing is reached by no
 * double from anything (the stump under the mushroom included), with 15 px to spare: only the bounce lands it. The mushroom itself is
 * never a take-off (no one stands on one). Each breach names the section, so the check swaps it.
 */
export function blockBreaches(laid: Laid, platforms: readonly Platform[], arcsOf?: { setting: Difficulty; stageId: string }): Array<{ uid: string; why: string }> {
  const out: Array<{ uid: string; why: string }> = [];
  // (1-1, R-165.61: the lesser move at its best, flown, with bands.md's 5 px spare: one jump's climb and its any-timing gap for a 'double'
  // block; for a 'bounce' block the plain double, held. Every other stage: the closed form below, as before)
  const L = arcsOf ? lesserArcs(arcsOf.setting, arcsOf.stageId) : undefined;
  for (const b of laid.blocks ?? []) {
    const to = b.landing, dbl = b.kind === 'bounce', spare = dbl ? 15 : 20;
    for (const from of platforms) {
      if (from === to || from.type === 'bouncy' || from.x >= to.x) continue;
      const up = from.y - to.y;
      if (L) {
        const m = dbl ? L.double : L.single, thin = !(to.type === 'solid' && to.height >= BLOCK_H.px);
        const gap = Math.max(0, to.x - (from.x + from.width));
        if (up + SPARE.px > (thin ? m.climb.thin : m.climb.block) || gap > m.gap + SPARE.px) continue;
        out.push({ uid: b.uid, why: `${b.kind} block at ${b.key} (x ${to.x}) is reached by a ${dbl ? 'double' : 'single jump'} from the platform at x ${from.x}, y ${from.y} (${up} px under, ${gap} px across; flown, reach.ts)` });
        break;
      }
      if (up + spare > (dbl ? DOUBLE_RISE : JUMP_RISE)) continue;
      const gap = Math.max(0, to.x - (from.x + from.width));
      const reach = reachJump(Math.max(0, up), dbl);
      if (reach >= 0 && gap <= reach + 20) {
        out.push({ uid: b.uid, why: `${b.kind} block at ${b.key} (x ${to.x}) is reached by a ${dbl ? 'double' : 'single jump'} from the platform at x ${from.x}, y ${from.y} (${up} px under, ${gap} px across)` });
        break;
      }
    }
  }
  return out;
}

/** what the validation pass decided */
/** (`thin`: it passes, but a purge or gauntlet holds fewer animals than it lays for, its goal + 2: worth a longer stage if there is time) */
type Verdict = { ok: true; thin?: boolean } | { ok: false; swap?: number; reroll?: boolean; short?: boolean; why?: string };

/**
 * Pass 5: levelCheck (which runs puzzleCheck on the rooms), then local repair (D3, Part 1 Pass 5's "self-healing"):
 *   a pickup the check finds out of reach, inside a platform, overlapping or past the shrine is taken out (never a quota item);
 *   an animal too close to a safe spot is taken out;
 *   an unreachable piece of the route: a stepping stone in the seam before the first section that cannot be reached;
 *   still unreachable there, or a room that cannot be solved: that one section is swapped (the caller bans it at that slot);
 *   a purge's or gauntlet's animals short of its goal: a longer stage (the caller adds a section);
 *   anything else (another quota short): a whole re-roll.
 */
export function checkAndRepair(b: Built, budget: StageBudget, repairs: Repair[], tried: Set<string>, landings = true): Verdict {
  const st = b.stage;
  // (a rolled graph's teach or test whose block can be walked round is swapped: the place rule comes before the level check)
  // (and one whose laid exit left the corridor: the way on is lost past it, whichever section comes next)
  const stray = b.laid.strays?.[0];
  if (stray) return { ok: false, swap: Number(stray.uid.slice(1)) - 1, why: `its exit at y ${stray.y} is outside the corridor` };
  const walked = blockBreaches(b.laid, st.platforms, judgedOnArcs(budget.id) ? { setting: budget.difficulty, stageId: budget.id } : undefined);
  if (walked.length) return { ok: false, swap: Number(walked[0].uid.slice(1)) - 1, why: `the block is walked round: ${walked[0].why}` };
  // (Y2, R-165.120: a judged stage's idle mushrooms are taken up and its dead-zone petals moved to a piece a clean flight reaches, inside
  // their own section, BEFORE the level check reads them: the generator stops laying what landing.dead-zone and bounce.no-purpose refuse,
  // instead of the search swapping sections for them. A build with neither changes nothing; a replay runs this same step)
  if (landings && judgedOnArcs(budget.id)) {
    // (a petal row moves inside its own section, never in or out of a room)
    const within = (x: number): readonly [number, number] | undefined => {
      const q = b.laid.sections.find((s) => x >= s.x0 && x <= s.x1);
      return q && !q.room ? [q.x0, q.x1] : undefined;
    };
    const fix = repairLandings(st.platforms, st.collectibles, budget.difficulty, within);
    if (fix.caps.length) {
      st.platforms = st.platforms.filter((p) => !fix.caps.includes(p));
      repairs.push({ kind: 'stretch', note: `landings: ${fix.caps.length} mushroom(s) with no purpose taken up (x ${fix.caps.map((p) => R(p.x)).join(', ')})` });
    }
    if (fix.moved) repairs.push({ kind: 'stretch', note: `landings: ${fix.moved} petal(s) moved off a dead zone` });
  }
  for (let it = 0; it < 8; it++) {
    const res = checkStage(st, budget);
    if (res.ok) {
      const fights = budget.archetype === 'purge' || budget.archetype === 'gauntlet';
      const before = st.enemies.filter((e) => e.x <= st.exitTotemX - 200).length;
      return fights && before < budget.quota.lay ? { ok: true, thin: true } : { ok: true };
    }
    let fixed = false;
    let unreachable = false;
    for (const err of res.errors) {
      let m = /^enemy #(\d+) stands too close/.exec(err);
      if (m) {
        st.enemies = st.enemies.filter((e) => e.id !== Number(m![1]));
        repairs.push({ kind: 'stretch', note: `animal ${m[1]} taken out: too near a safe spot` });
        fixed = true;
        continue;
      }
      m = /^(flower|leaf|fruit|heart) #(\d+)/.exec(err);
      if (m && /out of reach|inside platform|overlap|outside the walkable|past the shrine/.test(err)) {
        const id = Number(m[2]);
        // (a bloom, GraphBrief.offRoad, is never in a harvest's count: one that cannot stand goes as a petal does outside a harvest)
        if (m[1] === 'fruit' || budget.archetype !== 'harvest' || st.collectibles.filter((c) => c.type === 'flower').length > budget.quota.lay) {
          st.collectibles = st.collectibles.filter((c) => c.id !== id);
          fixed = true;
          continue;
        }
      }
      m = /^room (s\d+)-/.exec(err);
      if (m) return { ok: false, swap: Number(m[1].slice(1)) - 1 };
      if (/not reachable|is not on a reachable platform/.test(err)) unreachable = true;
    }
    if (unreachable) {
      const reach = new Set(res.reachableIds);
      const bad = b.laid.sections.findIndex((s) => s.pieces.some((p) => p.main && !reach.has(p.platform.id)));
      if (bad < 0) return { ok: false, reroll: true };
      const sec = b.laid.sections[bad];
      const key = `stone:${sec.uid}`;
      const seam = b.laid.gaps.find((g) => g.section === sec.uid && g.from && g.to);
      // (a stone helps only when the way IN is what fails: the section's entry piece cannot be reached from the one before)
      if (!tried.has(key) && seam?.from && seam.to && reach.has(seam.from.id) && !reach.has(seam.to.id)) {
        tried.add(key);
        const stone: Platform = { id: Math.max(...st.platforms.map((p) => p.id).filter((i) => i < 900000)) + 1, x: R((seam.x0 + seam.x1) / 2 - 42), y: R((seam.from.y + seam.to.y) / 2), width: 84, height: 22, type: 'solid', style: 'moss_stone' };
        const la = judgedOnArcs(budget.id) ? linkArcs(budget.difficulty, budget.id) : undefined;
        if (jumpOK(seam.from, stone, false, la).ok && jumpOK(stone, seam.to, false, la).ok) {
          st.platforms.push(stone);
          repairs.push({ kind: 'stone', section: sec.uid, note: `a stone in the seam before ${sec.template}` });
          fixed = true;
        }
      }
      if (!fixed) return { ok: false, swap: bad };
    }
    // (a purge or gauntlet whose top-up found no room for the goal's animals: a longer stage, not a new roll)
    const fights = budget.archetype === 'purge' || budget.archetype === 'gauntlet';
    if (!fixed && fights && res.errors.some((e) => /^not enough enemies/.test(e))) return { ok: false, short: true };
    if (!fixed) return { ok: false, reroll: true };
  }
  return { ok: false, reroll: true };
}

/**
 * Build one stage: passes 1-6, the repair loop and the length loop. Easy first lays Normal's plan (the section sequence), so the
 * two difficulties are the same stage under different rules. Deterministic: the same request gives the same stage.
 */
/** a Dot line's id to the words a tip says: the kit's own (manifest.tips, World 1's W1_TIPS built from dotLinesData), one source;
 *  undefined when the kit has none, and the roll fails by name (the lead, 11-06: a kit that forgets a tip fails loudly) */
export function tipWords(tips: Readonly<Record<string, string>> | undefined, id: string): string | undefined {
  return tips?.[id];
}

/** a level stage's swing (GraphBrief.trend 'level'): how far the route may stand from its starting height before the pick leans back */
const LEVEL_SWING = 110;
/** a stage's pool: its world's sections whose `feel` names the stage (or is unset) and whose `not` names nothing the stage owns */
export function stagePool(M: WorldManifest, stageId: string): SectionTemplate[] {
  const owns = new Set(M.owns?.[stageId] ?? []);
  // (a brief that picks by need, GraphBrief.pick: the world's whole library less what is parked, what the deal holds no type for and
  // what the stage refuses; `feel` names no stage there)
  const brief = M.graphs?.briefs?.[stageId], pick = brief?.pick, deal = brief?.deal ?? M.graphs?.mix;
  const fits = (t: SectionTemplate) => (pick
    ? !t.parked && !t.feel?.some((f) => pick.refuse?.includes(f)) && (!t.content || t.content === 'structural' || !deal || t.content in deal)
    : !t.feel || t.feel.includes(stageId));
  return M.sections.filter((t) => fits(t) && !(t.not ?? []).some((x) => owns.has(x)));
}

/**
 * A built roll's errors, everything that fails it by name: its own (a check that failed), a tip with no words, a slot filled past its rule
 * (Law 22), a required section with no node, and every V-rule breach in its realised node code (the red team's RT-ENGINE #6)
 */
export function rollErrors(g: Pick<Gen2Stage['gen2'], 'errors' | 'fills' | 'loosened' | 'missing' | 'codeErrors' | 'windowMiss' | 'flagMiss' | 'verdicts'>): string[] {
  const st = { gen2: { ...g, errors: [...(g.errors ?? [])] } };
  // (a tip whose id has no Dot line fails the roll: it was never shown)
  const unsaid = [...new Set(st.gen2.fills.filter((f) => f.role === 'tip' && f.unsaid).map((f) => f.what))];
  if (unsaid.length) st.gen2.errors.push(...unsaid.map((m) => `tip "${m}" has no Dot line in the kit's tips`));
  // (Law 22, R1 §4.1, the lead's 7:00 PM ruling: a slot its rules could not fill FAILS the roll, the missing piece named; never a looser
  // rule and never a re-roll. The stage is still returned, for the report; its errors say why it fails)
  if (st.gen2.loosened?.length) st.gen2.errors.push(...st.gen2.loosened.map((l) => `pool short at ${l.replace(/, filled by its (job|phase)\)$/, ')')}`));
  if (st.gen2.missing?.length) st.gen2.errors.push(...st.gen2.missing);
  // (the red team, RT-ENGINE #6: a V-rule breach in the realised node code fails the roll too, by name; it was only written to
  // codeErrors, so a roll breaking V1-V20 with every slot filled would have reached the game as clean)
  if (st.gen2.codeErrors?.length) st.gen2.errors.push(...st.gen2.codeErrors.map((e) => `node code: ${e}`));
  if (st.gen2.windowMiss) st.gen2.errors.push(st.gen2.windowMiss);
  if (st.gen2.flagMiss?.length) st.gen2.errors.push(...st.gen2.flagMiss);
  // (R-165.61: a refused roll's verdicts, by name: `errors` derived from the RollVerdict, each line once, Normal's then Easy's)
  for (const d of ['normal', 'easy'] as const) for (const l of verdictLines(g.verdicts?.[d])) if (!st.gen2.errors.includes(l)) st.gen2.errors.push(l);
  return st.gen2.errors;
}

/** a stage that lays a hurt floor carries its row's lesson and clearStart, and where the lesson's showing piece ends (Gen2Meta.hurt) */
function hurtMeta(laid: Laid, M: WorldManifest): Pick<Gen2Stage['gen2'], 'hurt'> {
  const H = M.hurtFloor;
  if (!H || !laid.heartFalls.some((z) => z.y !== undefined)) return {};
  const show = laid.sections.find((s) => M.sections.find((t) => t.id === s.template)?.teaches === H.lesson)?.pieces.find((p) => p.key === 'show')?.platform;
  return { hurt: { lesson: H.lesson, clearStart: H.clearStart, ...(show ? { shown: R(show.x + show.width) } : {}) } };
}

/**
 * Every fall on the route as a Drop (ADR-001 decision 6), read off the built stage: what it ENDS in (the engine's rule: ground under it
 * above the death line, a floor; water, a life; a soft heart-fall zone, set back on the take-off; a void fall a life unless the brief makes
 * the stage no-lethal, A1's softFalls, where it sets him back on the last still ground) and how its bottom is DRAWN (ground; a painted pit
 * floor in a soft zone; water art (World 1 reads a floorless gap as water, w1Pits; World 7's chasm paints dirty water far below); World 8's
 * dark). A lethal drop carries Dot's line and the sign when the stage put them there (proto hints, proto.gen2.waterWarnings).
 */
export function dropsOf(st: Gen2Stage, pits: Pick<WorldManifest, 'pitPainter'> = {}): Drop[] {
  const zones = st.heartFalls ?? [];
  const extras = (st.proto as { gen2?: { waterWarnings?: Array<{ x: number; y: number }> } }).gen2;
  const signs = extras?.waterWarnings ?? [];
  const hints = ((st.proto as { hints?: Array<{ x: number; text: string; passX?: number }> }).hints ?? []);
  const death = st.waterY ?? st.config.levelHeight;
  const world = st.gen2.budget.world;
  // (the world's pit painter paints its pit floors, its marked drops and its hurt floors: the manifest's pit rule, never a world number)
  const painted = pits.pitPainter === 'w1Pits';
  return (st.gen2.falls ?? []).map((f): Drop => {
    const mid = (f.x0 + f.x1) / 2;
    const ground = st.platforms.find((p) => p.type !== 'bouncy' && p.x <= mid && p.x + p.width >= mid && p.y > f.y && p.y < death);
    const zone = zones.find((z) => z.soft && mid >= z.x0 && mid <= z.x1);
    const at = { x0: f.x0, x1: f.x1, lipY: f.y };
    // (a hollow's hurt floor: a heart fall, on both settings (Easy waives the heart, never the look). Its look is the hurt look only where
    // the world's painter draws it; until then it is what is drawn there today, and drop.look-lies refuses it by name)
    if (ground?.pit === 'hurt') {
      const drawn = painted && findW1Pits(st.platforms).some((q) => q.kind === 'hurt' && q.x0 < f.x1 && q.x1 > f.x0);
      return { ...at, ends: { kind: 'heart', to: 'take-off' }, look: drawn ? 'hurt-art' : painted ? 'pit-floor-art' : 'ground' } as unknown as Drop;
    }
    if (ground) return { ...at, ends: { kind: 'floor', y: R(ground.y) }, look: 'ground' };
    if (f.kind === 'water' || (f.kind === 'void' && !st.gen2.softFalls)) {
      const h = hints.find((q) => q.x <= f.x0 && q.x >= f.x0 - 2 * WATER_WARN.lead && (q.passX ?? Infinity) >= f.x1);
      const sign = signs.some((q) => Math.abs(q.x - (f.x0 - 40)) <= 2);
      const warn = h && sign ? { warn: { dotLine: h.text, leadPx: R(f.x0 - h.x), sign: true as const } } : {};
      return { ...at, ends: { kind: 'life', cause: f.kind === 'water' ? 'water' : 'void' }, look: f.kind === 'water' || world !== 8 ? 'water-art' : 'void-dark', ...warn } as Drop;
    }
    if (zone) return { ...at, ends: { kind: 'putback', to: 'take-off' }, look: 'pit-floor-art' };
    // (a soft fall with nothing drawn under it: World 1's painter, w1Pits, draws it as water unless the gap is marked as a drop)
    const marked = painted && findW1Pits(st.platforms).some((q) => q.kind === 'fall' && q.drop && q.x0 < f.x1 && q.x1 > f.x0);
    return { ...at, ends: { kind: 'putback', to: 'last-still-ground' }, look: painted && !marked ? 'water-art' : 'void-dark' } as unknown as Drop;
  });
}

/** the stage as the verdicts read it (verdicts.types.ts JudgedStage), on 1-1: the brief's policy, the drops, each laid jump classified
 *  (a bounce lip in a teach node is the bounce teach) with its clear height, and the gaps the built stage shows (World 1's pits) */
function judged11(st: Gen2Stage, setting: Difficulty): Judged11 & { built: Gen2Stage } {
  const nodes = st.gen2.nodes ?? [];
  const asks: JudgedStage['asks'][number][] = (ASKS.get(st) ?? []).map((a) => {
    const node = nodes.find((n) => a.x0 >= n.x0 - 1 && a.x0 <= n.x1 + 1);
    const { kind, figure } = classify(a, !!node && JOB_OF[node.token[0]] === 'teach', setting);
    return { section: a.section, kind, x0: a.x0, x1: a.x1, figure, move: TAUGHT[kind], headroom: headroomOf(a, st.platforms) };
  });
  return {
    stageId: st.config.id, setting, policy: st.gen2.softFalls ? 'no-lethal' : 'per-gap', drops: st.gen2.drops ?? [], asks,
    routeGaps: realFalls(st.platforms).map((q) => [q.x0, q.x1] as const), built: st,
  } as Judged11 & { built: Gen2Stage };
}

/** the verdicts judged on a built rolled stage by the gates' own definitions (V19b's window, a rolled stage's flags), set on its gen2 and
 *  folded by rollErrors; Easy's Normal build gets them too, so a seed is clean on both settings or on neither (proven.test) */
function applyVerdicts(st: Gen2Stage, req: BuildRequest): void {
  // (R-165.61: every fall as a Drop record, and the roll's verdicts on this setting: judged on 1-1, every name notJudged elsewhere)
  st.gen2.drops = dropsOf(st, req.kit.manifest);
  st.gen2.verdicts = { ...st.gen2.verdicts, [req.difficulty]: judgedOnArcs(req.config.id) ? judgeRoll(judged11(st, req.difficulty), PROMISES_11) : NOT_JUDGED_ALL(req.difficulty) };
  // (V19b judged on the built stage by the gate's own definition, storyChecks endAboveWindow: the slot estimate in layStage steers the lay,
  // this is the verdict, so the pipeline and stage.ts never disagree; the lead 12:57 PM, 11-06. A window start over a gap has no height:
  // a miss, as stage.ts reads it)
  if (req.kit.manifest.graphs?.briefs?.[req.config.id]?.endHigh) {
    const w = endAboveWindow(st as never);
    if (!w.pass) st.gen2.windowMiss = `V19b: the end log at y ${w.endY} is not above y ${w.windowY}, where the bough window begins (x ${w.windowX})`;
  }
  // (a rolled stage's flags judged as the tests judge them: ROLLED_FLAGS, each miss by name)
  if (req.kit.manifest.graphs?.briefs?.[req.config.id]) {
    const hardAt = (st.gen2.nodes ?? []).filter((q) => HARD_JOBS.has(JOB_OF[q.token[0] as keyof typeof JOB_OF] ?? '')).map((q, i) => ({ id: `${q.token} #${i + 1}`, x0: q.x0 }));
    const f = rolledFlagBreaches(st, hardAt, lethalSpans(st, st.gen2.falls ?? []));
    if (f.length) st.gen2.flagMiss = f;
  }
}

/**
 * V19b's repair, from the gate's own numbers on the built stage (storyChecks endAboveWindow: the end against the route's top where the
 * bough window begins, at WINDOW_AT of the way). The end must come up by what it lacks, 20 px clear. The LAST slot after the window
 * whose pool holds a section that climbs that much more than the one laid there takes it (`lift`: the most its exit may lie under its
 * entry): the exit's step up for a small lack, the signature's higher climb for a large one. But first, when the section the window
 * stands in sets the bar by its own high point (it climbs and comes back down), that section is swapped. With neither, nothing here
 * repairs it and the stage is rolled again.
 */
function windowFix(B: Built, plan: readonly PlanSlot[], graph: MissionGraph, M: WorldManifest, budget: StageBudget, required: ReadonlySet<string>): { slot: number; lift?: number } | undefined {
  const w = endAboveWindow(B.stage as never);
  const secs = B.laid.sections;
  let ws = secs.findIndex((q) => w.windowX >= q.x0 && w.windowX <= q.x1);
  if (ws < 0) ws = secs.findIndex((q) => q.x0 > w.windowX);
  if (w.pass || ws < 0 || !Number.isFinite(w.windowY)) return undefined;
  // (the section the window stands in climbs and comes back down: its high point is the bar, and it is swapped first)
  if (w.windowY < secs[ws].exit.y - 30 && !required.has(secs[ws].template)) return { slot: ws };
  const lack = w.endY - w.windowY + 20;
  const fits = poolFits({ M, budget, nodes: graph.nodes, stageLen: graph.nodes.every((n) => n.count) ? plan.length : 0, exitDy: (t) => t.exitDy });
  const nodeOf = new Map(graph.nodes.map((n) => [n.id, n]));
  const laidN = (id: string) => plan.filter((p) => p.template === id).length;
  for (let k = secs.length - 1; k > ws; k--) {
    const n = nodeOf.get(secs[k].node);
    if (!n || required.has(secs[k].template)) continue;
    const want = Math.round(secs[k].exit.y - secs[k].entry.y - lack);
    if (M.sections.some((t) => t.id !== secs[k].template && t.exitDy <= want && fits(t, n, k) && laidN(t.id) < (t.maxPerStage ?? M.graphs?.maxPerStage ?? Infinity))) return { slot: k, lift: want };
  }
  return undefined;
}

/** one rule a built roll breaks, and the slot to change for it when the rule names a place (a plan index) */
export interface Unmet { line: string; slot?: number }

/**
 * Everything that would refuse a built roll once the search has returned it (rollErrors: a slot filled past its rule, a required section
 * with no node, a V-rule in the node code, V19b's window, the flags, the verdicts), judged on one setting's build, each with the slot it
 * names when it names one: a verdict's by where it lies (the section over its middle, or the one a seam's gap joins), a late rise that
 * ended short by its own slot. The search reads this before it takes a plan (R-165.120: these were judged only after the search had
 * returned, so no roll was ever repaired or rolled again for them).
 */
export function rollUnmet(st: Gen2Stage, req: BuildRequest): Unmet[] {
  applyVerdicts(st, req);
  const secs = st.gen2.sections;
  const slotAt = (x0: number, x1: number): number | undefined => {
    if (x1 <= 0) return undefined;
    const mid = (x0 + x1) / 2;
    const i = secs.findIndex((q) => mid >= q.x0 && mid <= q.x1);
    if (i >= 0) return i;
    const next = secs.findIndex((q) => q.x0 > mid);
    return next >= 0 ? next : undefined;
  };
  const failed = st.gen2.verdicts?.[req.difficulty];
  const at = new Map<string, number | undefined>((failed && !failed.accepted ? failed.failed : []).map((f) => [`verdict ${f.name} (${f.setting}): ${f.line}`, slotAt(f.at.x0, f.at.x1)] as const));
  return rollErrors(st.gen2).map((line): Unmet => {
    const rise = /^pool short at slot (\d+) \(.*the late rise ended/.exec(line);
    const slot = rise ? Number(rise[1]) - 1 : at.get(line);
    return slot === undefined ? { line } : { line, slot };
  });
}

export function buildGen2Stage(req: BuildRequest): Gen2Stage {
  // (the stage's own pool, cut to its tags before anything is chosen: the red team 11-05, 1-2 would have been dealt 1-1's sections)
  const M0 = req.kit.manifest;
  const pool = stagePool(M0, req.config.id);
  if (pool.length !== M0.sections.length) req = { ...req, kit: { ...req.kit, manifest: { ...M0, sections: pool } } };
  const st = buildRolled(req);
  applyVerdicts(st, req);
  st.gen2.errors = rollErrors(st.gen2);
  // (a stage that names a cast: every drop trap is in plain view and worth using, or the roll is refused by name, dropTrap.ts)
  const traps = st.proto.cast?.traps;
  if (traps?.length) st.gen2.errors.push(...trapFaults(traps, st.collectibles.filter((c) => c.type === 'flower' || c.type === 'fruit'), st.enemies));
  // (the caller's own rules, BuildRequest.also: their lines with the rest, each once)
  for (const u of req.also?.(st, req.difficulty) ?? []) if (!st.gen2.errors.includes(u.line)) st.gen2.errors.push(u.line);
  return st;
}

/** how far the game's road walks from an asked seed, and its stride (a prime) */
export const PROVEN = { walk: 24, stride: 7919 } as const;
/**
 * The game's road (the red team 11-05, RT-ENGINE #3: a failed roll was built and played without a word): a roll with gen2.errors is
 * never returned. The asked seed first, then the next on a fixed walk (asked + k x PROVEN.stride), so the same asked seed always plays
 * the same stage; none in the walk: it throws, naming the first failure (never played quietly). One build a seed: Normal's loop takes a
 * plan only when Easy lays it cleanly, and Easy carries Normal's errors, so a seed is clean on both settings or on neither, and Easy is
 * Normal's stage. buildGen2Stage stays the report's road (it hands back a failed roll with its errors).
 */
export function provenGen2Stage(req: BuildRequest, walk: number = PROVEN.walk): Gen2Stage {
  let first: string[] | undefined;
  for (let k = 0; k < walk; k++) {
    const seed = req.seed + k * PROVEN.stride;
    // (a build can throw, not only fail by name, e.g. "the pool is spent": that seed has failed too, and the walk goes on; a play is
    // never handed the throw, 11-06)
    let st: Gen2Stage;
    try { st = buildGen2Stage({ ...req, seed }); } catch (e) { first ??= [`seed ${seed} threw: ${(e as Error).message}`]; continue; }
    if (st.gen2.errors?.length) { first ??= st.gen2.errors; continue; }
    // (recorded only when the walk moved off the asked seed: a seed played as asked carries nothing new)
    if (k > 0) st.gen2.proven = { asked: req.seed, used: seed, tried: k + 1 };
    return st;
  }
  throw new Error(`gen2 ${req.config.id} (${req.difficulty}): no seed of ${walk} from ${req.seed} builds cleanly (the first: ${first?.join('; ')})`);
}

function buildRolled(req: BuildRequest): Gen2Stage {
  const M = req.kit.manifest;
  if (M.handBuilt.includes(req.config.id)) throw new Error(`gen2: ${req.config.id} is hand-built`);
  const budget = planBudget(req.config, M, req.difficulty);
  const graph = missionGraph(budget, M, req.seed);
  let best: Gen2Stage | null = null;
  // (the first roll that passed its check and was refused by a rule judged on the built stage: what a seed with no clean roll returns)
  let refused: Gen2Stage | null = null;
  const maxRerolls = req.maxRerolls ?? 6;
  const failedAt = new Map<string, number>();
  const versionTries = new Map<string, Set<string>>();
  if (req.difficulty === 'easy') {
    // Easy is Normal's stage under Easy's rules: Normal is built first (its repairs, swaps and length loop), and Easy lays exactly its
    // plan from its seed. Easy's own repairs are only the local ones (a stone, a stray pickup or animal); its clock is held to the
    // quick player's floor (fewer animals make the typical player's model shorter, not the stage)
    // (a replayed proven plan that carries Normal's kept animals lays Easy straight from it, no Normal build: the plan and the animals are
    // what Easy takes from Normal; the seed list's --check holds it identical to the search's Easy)
    const R = req.replay?.foes ? req.replay : undefined;
    const n = R ? undefined : buildRolled({ ...req, difficulty: 'normal' });
    // (Normal's verdicts too, folded: Easy carries every error Normal has, the flags' and the window's with the rest)
    if (n) {
      applyVerdicts(n, { ...req, difficulty: 'normal' });
      n.gen2.errors = [...rollErrors(n.gen2), ...(req.also?.(n, 'normal') ?? []).map((u) => u.line)];
    }
    const repairs: Repair[] = [...(n?.gen2.repairs ?? [])];
    // (and only the animals Normal kept: Easy's are a subset of Normal's)
    const b = R
      ? assemble(req, budget, graph, R.seed, { plan: R.plan }, new Map(R.foes))
      : assemble(req, budget, graph, n!.gen2.seed, { plan: n!.gen2.plan }, keptFoes(n!));
    const v = checkAndRepair(b, budget, repairs, new Set());
    const st = b.stage;
    const fast = gen2Model(st, MODEL_FAST);
    st.gen2.modelled = { typical: Math.round(gen2Model(st, MODEL_TYPICAL) * 10) / 10, fast: Math.round(fast * 10) / 10 };
    st.gen2.rerolls = n ? n.gen2.rerolls : R!.rerolls;
    st.gen2.repairs = repairs;
    // (Easy never plans its own, the red team's #4: Normal's loop took this plan only if Easy laid it cleanly, so a failure here is
    // Normal's own failure or the clock; it fails by name, with Normal's errors)
    const errs = [...(n?.gen2.errors ?? [])];
    if (!v.ok) errs.push(`Easy could not lay Normal's plan${v.why ? `: ${v.why}` : ''}`, ...checkStage(st, budget).errors);
    if (fast < budget.seconds.fastFloor) errs.push(`Easy's quick player under the floor (${fast.toFixed(1)} s, floor ${budget.seconds.fastFloor.toFixed(1)} s)`);
    st.gen2.errors = [...new Set(errs)];
    if (n?.gen2.verdicts?.normal) st.gen2.verdicts = { normal: n.gen2.verdicts.normal };
    return st;
  }
  // (a proven plan replayed, gen2/seedList.ts: the search's own final lay, one lay and its check, as the search's last step ran them)
  if (req.replay) {
    const repairs: Repair[] = [];
    const b = assemble(req, budget, graph, req.replay.seed, { plan: req.replay.plan, recent: req.recent, usedVersions: req.usedVersions });
    const v = checkAndRepair(b, budget, repairs, new Set());
    const st = b.stage;
    st.gen2.rerolls = req.replay.rerolls;
    st.gen2.repairs = repairs;
    st.gen2.modelled = { typical: Math.round(gen2Model(st, MODEL_TYPICAL) * 10) / 10, fast: Math.round(gen2Model(st, MODEL_FAST) * 10) / 10 };
    if (!v.ok) st.gen2.errors = [`a replayed plan failed its check${v.why ? `: ${v.why}` : ''} (the seed list is stale: tools/engine/seedlist.ts)`, ...checkStage(st, budget).errors];
    return st;
  }
  // (the stage is the same on both difficulties, so Normal's build also holds Easy's quick player to the floor: Easy lays its plan)
  const easyReq: BuildRequest = { ...req, difficulty: 'easy' };
  const easyBudget = planBudget(req.config, M, 'easy');
  const byId = new Map(M.sections.map((t) => [t.id, t]));
  const required = new Set((M.required?.[req.config.id] ?? []).map((r) => r.section));
  // (Y2, R-165.120: the search runs as it always did first, the landing repair off (checkAndRepair `landings`), so every seed it laid
  // cleanly before lays the same stage now: the proven list's seeds do not move. Only a seed with no clean roll that way is searched
  // again, on fresh rolls, with the repair on: idle mushrooms taken up and dead-zone petals moved inside a roll, instead of the swaps
  // and re-rolls those two verdicts cost. Its plan replays with the repair on, as every replay runs it. A stage the verdicts do not
  // judge has one search: the repair does nothing there)
  const phases = judgedOnArcs(budget.id) ? [false, true] : [true];
  let firstRefused: Gen2Stage | null = null;
  for (const [pi, landings] of phases.entries()) {
    if (pi) {
      firstRefused = refused ?? best;
      refused = null;
      best = null;
      failedAt.clear();
      versionTries.clear();
    }
    for (let rr = 0; rr <= maxRerolls; rr++) {
      // (the second search's rolls are fresh ones, past the first's: its roll 0 is the stage's roll maxRerolls + 1)
      const roll = rr + pi * (maxRerolls + 1);
      const seed = roll === 0 ? req.seed : req.seed * 1009 + roll * 7919;
      const repairs: Repair[] = [];
      const bans = new Map<number, Set<string>>([[-1, new Set([...failedAt].filter(([, n]) => n >= 2).map(([t]) => t))]]);
      const tried = new Set<string>();
      // The first build chooses everything; after it the plan is kept, and each change is local: a swap re-chooses one slot, and the
      // length loop adds one freshly chosen section just before the shrine's node (growPlan) or takes the last one off (trimPlan). So
      // the stage converges instead of re-picking everything after a changed node (it used to swing between two plans either side of
      // the window). Once it has grown it never trims (the floors are the rule, the ceiling is not); once it has trimmed, a grow would
      // undo it, so it goes back to the last stage that met the floors instead.
      let plan: PlanSlot[] | undefined;
      let open = new Set<number>();
      let grew = false;
      let lastMeeting: Gen2Stage | null = null;
      let swapped = false;
      const lift = new Map<number, number>();
      for (let it = 0; it < 24; it++) {
        let b: Built;
        try {
          b = assemble(req, budget, graph, seed, { bans, recent: req.recent, usedVersions: req.usedVersions, plan, open, lift, pace: !!refused });
        } catch (e) {
          // (a slot the after-rules' swaps left with no section: this roll's repairs are spent, and the stage is rolled again; a build
          // that throws with no such swap behind it throws as it always did)
          if (!swapped) throw e;
          repairs.push({ kind: 'reroll', note: `no section left for a swapped slot: ${(e as Error).message}` });
          break;
        }
        let v = checkAndRepair(b, budget, repairs, tried, landings);
        const st = b.stage;
        // (Easy is Normal's stage, the red team 11-05, RT-ENGINE #4: a plan is taken only when Easy lays it cleanly too. An Easy-only breach
        // (its kinder pads widening a take-off into a block's reach, seed 124) bans that section at that slot for both settings)
        let eb: Built | undefined;
        if (v.ok) {
          eb = assemble(easyReq, easyBudget, graph, seed, { plan: b.laid.plan }, keptFoes(st));
          const ev = checkAndRepair(eb, easyBudget, [], new Set(), landings);
          if (!ev.ok) v = { ...ev, why: `on Easy: ${ev.why ?? 'its check fails'}` };
        }
        st.gen2.rerolls = roll;
        st.gen2.repairs = [...repairs];
        /** the section at slot `k` is banned there and the slot chosen fresh, the rest of the plan kept */
        const swapOut = (k: number, why: string | undefined, here = false) => {
          const tpl = b.laid.plan[k].template;
          const set = bans.get(k) ?? new Set<string>();
          set.add(tpl);
          bans.set(k, set);
          // (a section that failed at two slots is kept out of the whole stage: it is the section, not the seam, and the curation
          // report names it for its author; `here`, a rule judged on the built stage, bans it at its slot only: such a rule reads the
          // section among its neighbours, the join and the ground line, so the same section may stand cleanly elsewhere)
          if (!here) failedAt.set(tpl, (failedAt.get(tpl) ?? 0) + 1);
          if (failedAt.get(tpl)! >= 2) bans.set(-1, new Set([...(bans.get(-1) ?? []), tpl]));
          repairs.push({ kind: 'swap', section: `s${k + 1}`, note: `${tpl} swapped out${why ? `: ${why}` : ''}` });
          plan = b.laid.plan;
          open = new Set([k]);
          // (audit fix 3, a rolled graph's stage: a swapped-out section that taught a move takes its lesson with it, so every later slot
          // that uses the move is chosen fresh too, under the uses rule, and nothing is laid before it is taught)
          const lost = graph.id ? byId.get(tpl)?.teaches : undefined;
          if (lost) plan.forEach((p, i) => { if (i > k && byId.get(p.template)?.uses?.includes(lost)) open.add(i); });
        };
        const grow = (note: string) => {
          if (lastMeeting) return false;
          const g = growPlan(b.laid.plan, graph, byId);
          plan = g.plan;
          open = new Set([g.open]);
          grew = true;
          repairs.push({ kind: 'length', note });
          return true;
        };
        if (!v.ok) {
          st.gen2.errors = checkStage(st, budget).errors;
          if (!st.gen2.errors.length && v.why) st.gen2.errors = [v.why];
          if (!best) best = st;
          // (a trim that broke it: the stage before the trim passed)
          if (lastMeeting) return lastMeeting;
          // (the goal's animals need room: one more section; the goal itself stays as designed)
          if (v.short && grow("room for the goal's animals: one more section")) continue;
          // (a required section is never swapped out: the whole roll goes instead)
          if (v.swap !== undefined && b.laid.plan[v.swap] && required.has(b.laid.plan[v.swap].template)) {
            repairs.push({ kind: 'reroll', note: `${b.laid.plan[v.swap].template} is required here and failed: rolled again` });
            break;
          }
          // (a section whose laid exit left the corridor is first re-laid at its slot with its other versions, one by one: the version
          // took it out, not the section (1-1 seed 5 under Round 10: the level 'short' of quiet-arrival fit where its 'step' did not, and
          // banning the template threw "no section fits the goal"). Only with every version tried is it swapped out as before)
          if (v.swap !== undefined && b.laid.plan[v.swap] && /outside the corridor/.test(v.why ?? '')) {
            const slot = b.laid.plan[v.swap];
            const t = byId.get(slot.template);
            const key = `${v.swap}:${slot.template}`;
            const triedV = versionTries.get(key) ?? new Set([JSON.stringify(slot.versions ?? {})]);
            const next = t ? versionCombos(t).find((c) => !triedV.has(JSON.stringify(c))) : undefined;
            if (next) {
              triedV.add(JSON.stringify(next));
              versionTries.set(key, triedV);
              repairs.push({ kind: 'swap', section: `s${v.swap + 1}`, note: `${slot.template} re-laid with versions ${Object.values(next).join(', ')}: ${v.why}` });
              plan = b.laid.plan.map((p, k) => (k === v.swap ? { ...p, versions: next } : p));
              open = new Set();
              continue;
            }
          }
          if (v.swap !== undefined && b.laid.plan[v.swap]) {
            swapOut(v.swap, v.why);
            continue;
          }
          break;
        }
        if (v.thin) {
          if (grow('room for 2 animals over the goal: one more section')) continue;
          return lastMeeting!;
        }
        // the clock (§1: at least 2 minutes for a quick player, every roll): the time model, typical and fast, and Easy's quick player
        // on the same plan (Easy has fewer animals, so it runs shorter)
        const typical = gen2Model(st, MODEL_TYPICAL);
        const fast = gen2Model(st, MODEL_FAST);
        const easyFast = gen2Model(assemble(easyReq, easyBudget, graph, seed, { plan: b.laid.plan }, keptFoes(st)).stage, MODEL_FAST);
        st.gen2.modelled = { typical: Math.round(typical * 10) / 10, fast: Math.round(fast * 10) / 10 };
        const short = typical < budget.seconds.target || fast < budget.seconds.fastFloor || easyFast < easyBudget.seconds.fastFloor;
        // (a rolled graph's stage has no ceiling, the red team's RT-ENGINE #7; Matt: "at least 2:00, no cap": its length is its section
        // count, held to the floors only. The ceiling, target x 1.1 (153 s for 1-1, under its own floor's typical), trimmed every roll
        // toward the floor and shipped the rest "long". The curated stages keep their window)
        const over = !graph.id && typical > budget.seconds.max;
        const clock = `typical ${typical.toFixed(0)} s, fast ${fast.toFixed(0)} s, Easy fast ${easyFast.toFixed(0)} s`;
        if (short) {
          if (grow(`one more section (${clock})`)) continue;
          // (it had trimmed past the floors: back to the last stage that met them)
          return lastMeeting!;
        }
        if (over && !grew) {
          const t = trimPlan(b.laid.plan, graph, byId, required);
          if (t) {
            lastMeeting = st;
            plan = t;
            open = new Set();
            repairs.push({ kind: 'length', note: `one section fewer (${clock})` });
            continue;
          }
        }
        // (R-165.120: a rolled graph's plan is taken only when nothing would refuse the roll afterwards, on either setting: the rules judged
        // on the built stage (rollUnmet) are the search's own now. One that names a place swaps the section there, as a failed check does;
        // the rest roll the stage again. A roll with nothing to answer returns here exactly as it always did)
        if (graph.id && eb) {
          let unmet = [...rollUnmet(st, req).map((u) => ({ ...u, of: b })), ...rollUnmet(eb.stage, easyReq).map((u) => ({ ...u, of: eb! }))];
          // (the caller's own rules, asked last: of a roll nothing of the pipeline's refuses)
          const pipes = unmet.length > 0;
          if (!pipes && req.also) unmet = [...req.also(st, 'normal').map((u) => ({ ...u, of: b })), ...req.also(eb.stage, 'easy').map((u) => ({ ...u, of: eb! }))];
          if (unmet.length) {
            if (refused) refused.gen2.repairs.push({ kind: 'reroll', note: `roll ${roll}, try ${it + 1}: ${unmet[0].line}` });
            refused ??= st;
            // (each rule's own repair: V19b by its numbers (windowFix), a rule that names a place by a swap there; a required section
            // is never swapped. One rule with no repair and the stage is rolled again: a swap would not answer it)
            const fixes = unmet.map((u) => {
              if (/^V19b/.test(u.line)) return windowFix(u.of, b.laid.plan, graph, M, budget, required);
              // (a late rise that ended short, V19: its slot is asked for what it lacked, by the lay's own numbers)
              const short = u.slot !== undefined && /the late rise ended/.test(u.line) ? u.of.laid.rise?.find((q) => q.node === b.laid.plan[u.slot!]?.node) : undefined;
              if (short && !required.has(b.laid.plan[u.slot!].template)) {
                const q = u.of.laid.sections[u.slot!];
                return { slot: u.slot!, lift: Math.round(q.exit.y - q.entry.y - (short.exitY - (short.to - 20)) - 10) };
              }
              return u.slot !== undefined && b.laid.plan[u.slot] && !required.has(b.laid.plan[u.slot].template) ? { slot: u.slot } : undefined;
            });
            const k = fixes.every((f) => f) ? 0 : -1;
            if (k >= 0) {
              const f = fixes[k]!;
              if (f.lift !== undefined) lift.set(f.slot, f.lift);
              // (a caller's rule that names a section counts against the section, as a failed check does: twice, and it is out of the
              // stage's later rolls too; the pipeline's own after-rules read the seam and ban it at its slot only)
              swapOut(f.slot, unmet[k].line, pipes);
              swapped = true;
              continue;
            }
            repairs.push({ kind: 'reroll', note: `refused after its check: ${unmet[fixes.findIndex((f) => !f)].line}` });
            break;
          }
        }
        if (over) st.gen2.repairs.push({ kind: 'length', note: `ships long: no shorter meets the floors and the goal (${clock}, ceiling ${budget.seconds.max.toFixed(0)} s)` });
        return st;
      }
      if (lastMeeting) return lastMeeting;
      repairs.push({ kind: 'reroll', note: `roll ${roll} failed` });
    }
  }
  // (no clean roll either way: the first search's refused roll, as before)
  return firstRefused ?? refused ?? best!;
}

/** the plan with one more slot, chosen fresh (its index is returned as `open`), at the end of the node before the shrine's */
export function growPlan(plan: readonly PlanSlot[], graph: MissionGraph, byId?: ReadonlyMap<string, SectionTemplate>): { plan: PlanSlot[]; open: number } {
  // (a rolled graph grows a working node, never a rest, the arrival, the exit or a fork (one two-road section), so its quiet end stays
  // quiet: the last one whose new
  // section leaves every windowed section inside its window on the longer stage)
  if (graph.id) {
    const inWindow = (p: readonly PlanSlot[]) => p.every((q, i) => {
      const w = byId?.get(q.template)?.window;
      return !w || ((i + 0.5) / p.length >= w[0] && (i + 0.5) / p.length <= w[1]);
    });
    const works = [...graph.nodes].reverse().filter((n) => n.role !== 'rest' && n.role !== 'start' && n.role !== 'goal' && n.job !== 'fork' && n.job !== 'reward' && plan.some((p) => p.node === n.id));
    let first: { plan: PlanSlot[]; open: number } | null = null;
    for (const work of works) {
      const at = plan.reduce((k, p, i) => (p.node === work.id ? i + 1 : k), -1);
      const grown = { plan: [...plan.slice(0, at), { template: '', mirrored: false, node: work.id, join: 'walk' as const }, ...plan.slice(at)], open: at };
      first ??= grown;
      if (inWindow(grown.plan)) return grown;
    }
    if (first) return first;
  }
  const goal = graph.nodes[graph.nodes.length - 1].id;
  let at = plan.findIndex((p) => p.node === goal);
  if (at < 0) at = plan.length;
  const node = plan[at - 1]?.node ?? graph.nodes[graph.nodes.length - 2].id;
  return { plan: [...plan.slice(0, at), { template: '', mirrored: false, node, join: 'walk' }, ...plan.slice(at)], open: at };
}

/**
 * The plan less its last section before the shrine's node, from a node that keeps another (never the start, never a section that
 * teaches what one after it uses, never a room, never one in `keep`: the stage's required sections); null when nothing can go
 */
export function trimPlan(plan: readonly PlanSlot[], graph: MissionGraph, byId: ReadonlyMap<string, SectionTemplate>, keep: ReadonlySet<string> = new Set()): PlanSlot[] | null {
  const goal = graph.nodes[graph.nodes.length - 1].id;
  const start = graph.nodes[0].id;
  let end = plan.findIndex((p) => p.node === goal);
  if (end < 0) end = plan.length;
  for (let i = end - 1; i >= 0; i--) {
    const p = plan[i];
    if (p.node === start || plan.filter((q) => q.node === p.node).length < 2) continue;
    const t = byId.get(p.template);
    if (!t || t.room || keep.has(t.id)) continue;
    if (t.teaches && plan.slice(i + 1).some((q) => byId.get(q.template)?.uses?.includes(t.teaches!))) continue;
    return [...plan.slice(0, i), ...plan.slice(i + 1)];
  }
  return null;
}
