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
import { doubleAllowed, jumpOK, SAFE_APPROACH, swingLandings, validateStage } from '../levelCheck.ts';
import { JUMP_CLEAR, jumpEdges } from '../stageMetrics.ts';
import { DOUBLE_RISE, JUMP_RISE, pressWindow, reachGlide, reachJump, setTimedSwing, TAKEOFF_SLACK, TIMED } from '../physics.ts';
import { skillGuaranteedAt } from '../skills.ts';
import { addKitPlatforms, type Anchor, type PieceSpec, type RoomSpec, type Wire } from '../puzzleKit.ts';
import type { ProtoExtras, StageHint } from '../protoStage.ts';
import type { GeneratedStage } from '../stageGenerator.ts';
import { fastFloor, MODEL_FAST, MODEL_TYPICAL, modelStage, targetSeconds, TIME, walkSpeed, type ModelParams } from '../stageTime.ts';
import type { Collectible, Enemy, LevelConfig, Platform, Vine } from '../types.ts';
import { CRUMBLE_TILE_W, crumbleTime, tideCrossTime, type Zone } from '../zones.ts';
import { CooldownQueue, pickWeighted, poissonPlace, ShuffleBag, WorldOnce, type RoutePiece } from './variety.ts';
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
export function glideGap(dyUp: number, budget: Pick<StageBudget, 'margin' | 'world' | 'stage'>): number {
  const dbl = maxGap(dyUp, true, budget.margin);
  const link = jumpLinkGap(dyUp, budget.world, budget.stage) - 4;
  const g = reachGlide(dyUp, true);
  return g < 0 ? dbl : Math.max(dbl, Math.min(budget.margin * g, link));
}
/** the highest a required rise may be (px): `share` of a jump's height (one jump or two) */
export const riseLimit = (dbl: boolean, share: number): number => share * (dbl ? DOUBLE_RISE : JUMP_RISE);

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
export function jumpLinkGap(dyUp: number, world: number, stage: number): number {
  const mission = (world - 1) * 10 + stage;
  let r = doubleAllowed({ worldIndex: world, miniIndex: stage }) ? Math.max(reachJump(dyUp, false), reachJump(dyUp, true)) : reachJump(dyUp, false);
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
  return {
    id: config.id,
    world: config.worldIndex,
    stage: config.miniIndex,
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
export function missionGraph(budget: StageBudget): MissionGraph {
  const a = budget.archetype;
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

// ───────────────────────────── pass 3: sections, stitched ─────────────────────────────


interface LocalPiece {
  key: string;
  x: number;
  y: number;
  w: number;
  h: number;
  shape: SectionTemplate['pieces'][number]['shape'];
  style?: Platform['style'];
  main: boolean;
  landing: boolean;
  /** an obstacle to hop (an `on` block): a beat */
  hop: boolean;
  /** a crumbling ruin tile (SectionPiece.crumble) */
  crumble?: boolean;
  /** a hanging piece (x is where it hangs, y its top, h its length, w 0): a liana with its swing, or a climbing vine */
  hang?: { kind: 'liana' | 'vine'; swing?: LianaSwing; from?: string; window?: number; gap?: [number, number] };
}
interface LocalGap {
  x0: number;
  x1: number;
  y: number;
  pit: boolean;
  /** a section's water gap (the rule's `water`): nothing laid under it, whatever the world's falls */
  water?: boolean;
  /** a section's soft gap (the rule's `soft`): a soft pit under it, whatever the world's falls (World 8's gaps in the dark, where a
   *  deadly fall would be a blind jump) */
  soft?: boolean;
  /** a gap under a liana (a `land` perch past it), or a glide gap: its soft pit climbs back to the take-off ledge (`lips`: that ledge's top, the
   *  perch's), never forward to the perch */
  back?: { lips: [number, number] };
}
/** a section laid out in its own space: its entry anchor at (0, 0) */
export interface LocalLayout {
  pieces: LocalPiece[];
  gaps: LocalGap[];
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
export function chooseVersions(tpl: SectionTemplate, rng: Rng, once?: WorldOnce<string>, fixed?: Readonly<Record<string, string>>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const sb of tpl.subBlocks ?? []) {
    if (!sb.versions.length) throw new Error(`gen2 section ${tpl.id}: sub-block ${sb.id} has no versions`);
    const want = fixed?.[sb.id];
    let v = want === undefined ? undefined : sb.versions.find((x) => x.id === want);
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
  const dblOK = budget.moves.includes('double');
  const shareFor = (s: Range | undefined) => Math.min(1, s === undefined ? 0.5 + 0.3 * budget.heat + 0.1 * rng() : roll(rng, s));
  const versions = chooseVersions(tpl, lo.pickRng ?? rng, lo.once, lo.versions);
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
      return k === null || by.has(k);
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
    if (pl.kind === 'start') {
      x = 0;
      y = 0;
    } else if (pl.kind === 'walk') {
      const a = ref(pl.after);
      const dy = pl.dy === undefined ? 0 : roll(rng, pl.dy);
      x = a.x + a.w;
      y = a.y + Math.max(-riseLimit(false, budget.riseShare) * 0.9, dy);
    } else if (pl.kind === 'jump' || pl.kind === 'double' || pl.kind === 'pit') {
      const a = ref(pl.after);
      const glide = pl.kind === 'pit' && pl.jump === 'glide' && budget.moves.includes('glide') && dblOK;
      const dbl = (pl.kind === 'pit' ? pl.jump !== 'jump' : pl.kind === 'double') && dblOK;
      let dy = pl.kind === 'pit' || pl.dy === undefined ? 0 : roll(rng, pl.dy);
      dy = Math.max(-riseLimit(dbl, budget.riseShare) * 0.95, dy);
      const g = glide ? glideGap(-dy, budget) : maxGap(-dy, dbl, budget.margin);
      const share = shareFor(pl.share);
      const gap = Math.max(60, R(share * (g > 0 ? g : 60)));
      x = a.x + a.w + gap;
      y = a.y + dy;
      // (a glide's soft pit climbs back to its take-off, as a liana's does: with steps out on the far side the leaf would be optional)
      const back = glide && !pl.water ? { back: { lips: [a.y, y] as [number, number] } } : {};
      gaps.push({ x0: a.x + a.w, x1: x, y: Math.min(a.y, y), pit: pl.kind === 'pit' || !!pl.soft, ...(pl.water ? { water: true } : {}), ...(pl.soft && !pl.water ? { soft: true } : {}), ...back });
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
        let min = a.x + a.w + jumpLinkGap(-dy, budget.world, budget.stage) + 20;
        if ((budget.pit === 'soft' || pl.soft) && !pl.water) {
          const pit = backPit(a.x + a.w, a.x + a.w + 4000, a.y, perchY, lo.pitDepth ?? 0, riseLimit(false, budget.riseShare) * PIT.hop);
          for (const st of [{ x: a.x + a.w, top: pit.floor, w: 0 }, ...pit.steps]) {
            const g = jumpLinkGap(st.top - perchY, budget.world, budget.stage);
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
      gaps.push({ x0: a.x + a.w, x1: x, y: Math.min(a.y, y), pit: true, back: { lips: [a.y, y] }, ...(pl.water ? { water: true } : {}), ...(pl.soft && !pl.water ? { soft: true } : {}) });
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
      h = Math.min(roll(rng, pl.h), riseLimit(dblOK, budget.riseShare) * 0.95);
      w = Math.min(w, a.w);
      x = a.x + roll(rng, pl.at) * (a.w - w);
      y = a.y - h;
    } else if (pl.kind === 'over') {
      const a = ref(pl.on);
      x = a.x + roll(rng, pl.at) * a.w;
      y = a.y + roll(rng, pl.dy);
    }
    // (a crumbling tile is a tile's width whatever the roll or Easy's pad: levelCheck holds every tile to it; never main, never needed)
    const crumble = !!pc.crumble && !hang;
    const landing = (!!pc.landing || pl.kind === 'land') && pl.kind !== 'start' && !hang && !crumble;
    if (landing) w += budget.landingPad;
    if (crumble) (w = CRUMBLE_TILE_W), (h = CRUMBLE_H);
    const p: LocalPiece = {
      key: pc.key, x: R(x), y: R(y), w: R(w), h: R(h), shape: pc.shape, style: pc.style, main: crumble ? false : pc.main ?? pl.kind !== 'over', landing, hop: pl.kind === 'on',
      ...(hang ? { hang } : {}), ...(crumble ? { crumble } : {}),
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
  const xp = by.get(exitP.piece);
  if (!xp) throw new Error(`gen2 section ${tpl.id}: its exit piece ${exitP.piece} is not laid`);
  return { pieces: out, gaps, entry, exit: { ...exitP, x: xp.x + xp.w, y: xp.y }, width: right - left, mirrored, sockets, versions };
}

/** everything pass 3 hands on */
export interface Laid {
  sections: PlacedSection[];
  plan: PlanSlot[];
  platforms: Platform[];
  /** the gaps of the route (inner and seams), for the arcs and the repair */
  gaps: Array<{ x0: number; x1: number; y: number; from?: Platform; to?: Platform; section?: string; water?: boolean; soft?: boolean }>;
  /** the zones the sections lay (a tide, darkness) */
  zones: Zone[];
  spawn: { x: number; y: number; piece: Platform };
  exit: { x: number; y: number; piece: Platform };
  /** the lianas and climbing vines the sections hang */
  vines: Vine[];
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
          height: shape === 'bank' ? Math.max(M.ground.bankH, R(baseline - y)) : shape === 'branch' ? 24 : shape === 'stone' ? 22 : R(h),
          type: shape === 'bouncy' ? 'bouncy' : 'solid',
          style: style ?? (shape === 'bank' ? M.ground.style : shape === 'branch' ? 'branch' : 'moss_stone'),
        };
    platforms.push(p);
    return p;
  };
  const gaps: Laid['gaps'] = [];
  const vines: Vine[] = [];
  const zones: Zone[] = [];
  const pitUnder = (x0: number, x1: number, lipY: number, farY: number, back = false, soft = false) => {
    if ((budget.pit !== 'soft' && !soft) || x1 - x0 < 20) return;
    const hop = riseLimit(false, budget.riseShare) * PIT.hop;
    if (back) {
      const out = backPit(x0, x1, lipY, farY, M.pitDepth, hop);
      mk(x0, out.floor, x1 - x0, 'block', M.ground.bankH, 'moss_stone');
      for (const s of out.steps) mk(s.x, s.top, s.w, 'block', out.floor - s.top, 'moss_stone');
      return;
    }
    const out = pitSteps(x0, x1, lipY, farY, M.pitDepth, hop);
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

  const fits = (t: SectionTemplate, n: MissionNode, i: number) =>
    t.phases.includes(n.phase) &&
    (t.archetypes === 'any' || t.archetypes.includes(budget.archetype)) &&
    (t.needs ?? []).every((m) => budget.moves.includes(m)) &&
    hangsNeed(t).every((m) => budget.moves.includes(m)) &&
    (t.uses ?? []).every((m) => taught.has(m) || t.teaches === m) &&
    (used.get(t.id) ?? 0) < (t.maxPerStage ?? Infinity) &&
    !opt.bans?.get(i)?.has(t.id) &&
    !opt.bans?.get(-1)?.has(t.id);

  const choose = (n: MissionNode, i: number): SectionTemplate => {
    // (a section this stage must hold comes first, at the first slot of the first node it fits: placed by the plan, not by weight)
    for (const r of must) {
      const t = byId.get(r.section);
      if (!t) throw new Error(`gen2 ${budget.id}: the required section ${r.section} is not in the world`);
      // (inside the corridor, like any pick: a later slot takes it otherwise)
      const endY = cur.y + t.exitDy;
      if (!placedReq.has(r.section) && (!r.phase || r.phase === n.phase) && fits(t, n, i) && endY >= M.corridor.top && endY <= M.corridor.bottom) return t;
    }
    // (a required section is never drawn by weight: it comes once, where the plan puts it)
    const cands = M.sections.filter((t) => fits(t, n, i) && !must.some((r) => r.section === t.id));
    if (!cands.length) throw new Error(`gen2 ${budget.id}: no section fits node ${n.id} (${n.phase})`);
    const want = (budget.band[0] + (budget.band[1] - budget.band[0]) * n.tension - budget.band[0]) / (budget.band[1] - budget.band[0]);
    const room = M.corridor;
    const lean = cur.y < room.top + room.soft ? 1 : cur.y > room.bottom - room.soft ? -1 : 0;
    const weight = (t: SectionTemplate) => {
      let w = (t.weight ?? 1) * Math.exp(-Math.abs(t.difficulty / 10 - want) * 4);
      if (n.want?.some((tag) => t.sockets.some((s) => s.allow?.includes(tag)) || t.name.includes(tag))) w *= 3;
      // (the corridor clamp, Part 3 §1: near the top lean to sections that go down, near the bottom to ones that go up; one that
      // would leave the corridor is never picked)
      const endY = cur.y + t.exitDy;
      if (endY < room.top || endY > room.bottom) return 0;
      if (lean !== 0) w *= Math.sign(t.exitDy) === lean ? 3 : t.exitDy === 0 ? 1 : 0.3;
      return w;
    };
    // the node's bag holds its candidates by weight; the cooldown passes over the ones used just now
    const key = `${n.phase}|${cands.map((c) => c.id).join(',')}`;
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
    const t = cool.pick(pool.length ? pool : cands, (c) => c.id) ?? pickWeighted(pickRng, cands, weight)!;
    return t;
  };

  for (const n of graph.nodes) {
    let secs = 0;
    const want = n.share * budget.seconds.target * aim;
    let first = true;
    // (the start and the goal are a single plain section each: the runway and the shrine's bank are laid by the stitcher)
    // (following a plan, the node takes exactly the slots the plan gave it: Easy's sections are Normal's, whatever their seconds)
    while (opt.plan ? opt.plan[slot]?.node === n.id : first || secs < want) {
      first = false;
      const i = slot++;
      const fixed = opt.open?.has(i) ? undefined : opt.plan?.[i];
      const tpl = fixed ? byId.get(fixed.template)! : choose(n, i);
      // (the slot's stream: salted by the swaps made at it; a plan carries Normal's salt so Easy rolls the slot as Normal did)
      const salt = fixed ? fixed.salt ?? 0 : opt.bans?.get(i)?.size ?? 0;
      const srng = rngFor(seed, 11, i, salt);
      // (the flip is drawn whether or not a plan fixes it, so the geometry after it rolls from the same numbers on Easy and Normal)
      const flip = tpl.mirrorable ? srng() : 1;
      // (a section that swings is never flipped: its perch is sized for a swing toward it, the way the stage runs)
      const mirrored = fixed ? fixed.mirrored : flip < 0.5 && !hangsNeed(tpl).includes('swing');
      const L = layLocal(tpl, budget, srng, mirrored, { versions: fixed?.versions, pickRng: rngFor(seed, 19, i, salt), once, pitDepth: M.pitDepth });
      // the join: on the ground a walk, a step or a pit; from or onto a ledge a jump, each sized from the envelope
      const jrng = rngFor(seed, 13, i);
      let join: PlanSlot['join'];
      // (drawn the same way with or without a plan, so the join's sizes below come from the same numbers on Easy and Normal)
      if (cur.kind === 'ground' && L.entry.kind === 'ground') {
        const quiet = n.phase === 'start' || n.phase === 'rest' || n.phase === 'goal' || (tpl.room && true);
        const pitW = quiet ? 0 : n.tension * 1.2;
        const r0 = jrng() * (1 + 0.6 + pitW);
        join = fixed ? fixed.join : r0 < 1 ? 'walk' : r0 < 1.6 ? 'step' : 'pit';
      } else join = fixed ? fixed.join : 'jump';
      const j = jrng();
      let dx = 0;
      let dy = 0;
      const lim1 = riseLimit(false, budget.riseShare);
      if (join === 'step') {
        // (up or down by a hop, leaning back toward the corridor's middle)
        const middle = (M.corridor.top + M.corridor.bottom) / 2;
        const dir = cur.y + L.exit.y > middle ? -1 : 1;
        dy = dir * (20 + j * (lim1 * 0.8 - 20));
      } else if (join === 'pit' || join === 'jump') {
        if (join === 'jump') dy = -lim1 * 0.6 + j * (lim1 * 0.6 + 80);
        const g = maxGap(-dy, false, budget.margin);
        dx = Math.max(60, R((0.5 + 0.3 * budget.heat + 0.15 * jrng()) * g));
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
        const p = mk(ox + lp.x, oy + lp.y, lp.w, lp.shape, lp.h, lp.style, !!lp.crumble);
        placed.pieces.push({ key: lp.key, platform: p, main: lp.main, landing: lp.landing });
      }
      const pieceOf = (k: string) => {
        const q = placed.pieces.find((pp) => pp.key === k);
        if (!q) throw new Error(`gen2 section ${tpl.id}: nothing named ${k} is laid (versions ${JSON.stringify(L.versions)})`);
        return q.platform;
      };
      const entryP = pieceOf(L.entry.piece);
      if (dx > 0) gaps.push({ x0: cur.x, x1: ox, y: Math.min(cur.y, oy), from: cur.piece, to: entryP, section: placed.uid });
      for (const g of L.gaps) {
        const g0 = { x0: ox + g.x0, x1: ox + g.x1, y: oy + g.y, section: placed.uid, ...(g.water ? { water: true } : {}), ...(g.soft ? { soft: true } : {}) };
        gaps.push(g0);
        if (g.pit && !g.water) {
          const before = platforms.length;
          if (g.back) pitUnder(g0.x0, g0.x1, oy + g.back.lips[0], oy + g.back.lips[1], true, g.soft);
          else pitUnder(g0.x0, g0.x1, g0.y, g0.y, false, g.soft);
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
      plan.push({ template: tpl.id, mirrored, node: n.id, join, ...(Object.keys(L.versions).length ? { versions: L.versions } : {}), ...(salt ? { salt } : {}) });
      cool.use(tpl.id);
      used.set(tpl.id, (used.get(tpl.id) ?? 0) + 1);
      if (must.some((r) => r.section === tpl.id)) placedReq.add(tpl.id);
      if (tpl.teaches) taught.add(tpl.teaches);
      const exitP = pieceOf(L.exit.piece);
      cur = { x: ox + L.exit.x, y: oy + L.exit.y, kind: L.exit.kind, piece: exitP };
      if (n.phase === 'start' || n.phase === 'goal') break;
    }
  }
  for (const r of must) if (!placedReq.has(r.section)) throw new Error(`gen2 ${budget.id}: the required section ${r.section} fits no node of the stage${r.phase ? ` (${r.phase})` : ''}`);
  // the shrine's bank (a walk on from the last section)
  const shrine = mk(cur.x, cur.y, SHRINE_BANK, 'bank', 0);
  const exitX = R(shrine.x + 300);
  clearClimbs(vines, platforms);
  return {
    sections,
    plan,
    platforms,
    gaps,
    spawn: { x: SPAWN_X, y: runway.y, piece: runway },
    exit: { x: exitX, y: shrine.y, piece: shrine },
    vines,
    zones,
    width: R(shrine.x + shrine.width + 40),
    bottom: baseline,
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
export function fillSockets(laid: Laid, budget: StageBudget, kit: WorldKit, seed: number, sink: StageSink, normalFoes?: ReadonlyMap<string, string>): Filled {
  const M = kit.manifest;
  const rng = rngFor(seed, 17);
  const easy = budget.difficulty === 'easy';
  const fills: FilledSocket[] = [];
  const checkpoints: Filled['checkpoints'] = [];
  const hints: StageHint[] = [];
  const C = sink.collectibles;
  /** a flower's look from a spot (its own, or its row's first: a row or an arc of flowers is one species, stageQuality.test.ts) */
  const lookAt = (x: number, y: number) => M.flowers[Math.floor(rngFor(seed, 29, R(x), R(y))() * M.flowers.length)];
  const flower = (x: number, y: number, rowLook?: (typeof M.flowers)[number]) => {
    if (C.some((c) => Math.hypot(c.x - x, c.y - y) < 40)) return;
    // (its look from its own spot, not the shared stream: a flower skipped for overlapping must not move every roll after it)
    const look = rowLook ?? lookAt(x, y);
    C.push({ id: sink.nextCollectibleId(), type: 'flower', botanicalVariant: look, x: R(x), y: R(y), collected: false, bobPhase: (x * 0.031) % 6.28 });
  };
  const tipsSaid = new Set<string>();
  // (lessons from earlier stages need no tip here)
  for (const [m, st] of Object.entries(M.lessons ?? {})) if (stageOrder(st) < stageOrder(budget.id)) tipsSaid.add(m);

  // flags: at the rests, wherever 35 s passed without one, and wherever the next section's end would leave more than FLAG_SPAN.max px
  // with none (a slow stealth stage's 35 s can be 6000 px). A flag goes in first, so it is a pad: the creatures' patches and the
  // top-up keep clear of it (the safe spots below), and a flag can always land
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
      // (each socket's chance from its own stream: whatever Easy or Normal did with the sockets before it, it rolls the same)
      const r0 = rngFor(seed, 17, si, ki)();
      const want = (s.chance ?? 1) > r0 && (!s.phases || s.phases.includes(sec.phase));
      const dropOnEasy = easy && s.easy === 'drop';
      if (s.role === 'tip') {
        const m = s.allow?.[0];
        if (m && !tipsSaid.has(m)) {
          tipsSaid.add(m);
          const text = M.tips?.[m] ?? m;
          hints.push({ x: k.x, text, pad: text, keys: text });
          fills.push({ section: sec.uid, socket: s.id, role: 'tip', what: m, x: k.x, y: k.y });
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
        for (let i = 0; i < n; i++) {
          const x = n === 1 ? k.x : k.x - span / 2 + (span * i) / (n - 1);
          flower(Math.max(k.piece.x + 20, Math.min(k.piece.x + k.piece.width - 20, x)), k.piece.y - (s.dn ?? FLOWER_UP), rowLook);
        }
        fills.push({ section: sec.uid, socket: s.id, role: 'pickup', what: 'flower', x: k.x, y: k.y });
      } else if (s.role === 'objective') {
        const wantN = graphObjectives(laid, sec);
        if (objectives >= wantN) continue;
        objectives++;
        const type: Collectible['type'] = budget.archetype === 'rescue' ? 'cage' : 'relic';
        C.push({ id: sink.nextCollectibleId(), type, x: k.x, y: k.piece.y - (s.dn ?? 30), collected: false, bobPhase: 0, ...(type === 'cage' ? { cageHp: 2 } : {}) });
        fills.push({ section: sec.uid, socket: s.id, role: 'objective', what: type, x: k.x, y: k.y });
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
    if (g.x1 - g.x0 < 90 || !arc) continue;
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
        for (let x = p.platform.x + 60; x < p.platform.x + p.platform.width - 60 && flowers() < budget.quota.lay; x += 90) flower(x, p.platform.y - FLOWER_UP);
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
  const filled = fillSockets(laid, budget, req.kit, seed, sink, normalFoes);
  const looks = dress(laid, budget, req.kit, seed, sink);
  proto.hints = filled.hints;
  const rooms = laid.sections.flatMap((s) => (s.room ? [s.room] : []));
  const platforms = laid.platforms;
  if (rooms.length) addKitPlatforms(platforms, { rooms });
  sink.collectibles.push({ id: sink.nextCollectibleId(), type: 'exit_totem', x: laid.exit.x, y: laid.exit.y - 30, collected: false, bobPhase: 0 });
  const config: LevelConfig = { ...req.config, levelWidth: laid.width, levelHeight: Math.max(req.config.levelHeight, R(laid.bottom + 120)) };
  const meta: Gen2Meta = {
    seed,
    plan: laid.plan,
    rerolls: 0,
    repairs: [],
    budget,
    graph,
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
    ropes: [],
    enemies: filled.enemies,
    boss: null,
    collectibles: sink.collectibles,
    spawnX: laid.spawn.x,
    spawnY: laid.spawn.y,
    exitTotemX: laid.exit.x,
    exitTotemY: laid.exit.y,
    checkpoints: filled.checkpoints,
    // (a deadly chasm shows the dirty water far below, World 7; World 8's treetops have none: its deadly falls drop into the dark)
    ...(budget.pit === 'water' || (budget.pit === 'void' && budget.world !== 8) || laid.gaps.some((g) => g.water) ? { waterY: laid.bottom + 40 } : {}),
    ...(sink.zones.length ? { zones: sink.zones } : {}),
    ...(rooms.length ? { kit: { rooms } } : {}),
    proto: Object.assign(proto, Object.keys(filled.extras).length ? { gen2: filled.extras } : {}),
    meta: { attempt: seed, chunks: laid.sections.map((s) => s.template), width: laid.width, pieces: laid.sections.map((s) => ({ k: s.template, x0: R(s.x0), x1: R(s.x1), beat: s.phase })) },
    gen2: meta,
  };
  return { stage, laid };
}

/**
 * levelCheck on the stage as this difficulty will play it: an Easy purge or gauntlet is held to easyMode's goal (budget.quota.check,
 * round(0.6 x the goal)), which the engine's easyStage sets at play; the stage itself keeps the designed goal in its config
 */
export function checkStage(st: GeneratedStage, budget: StageBudget): ReturnType<typeof validateStage> {
  const cfg = st.config;
  const held = budget.quota.check === cfg.targetCount ? st : { ...st, config: { ...cfg, targetCount: budget.quota.check } };
  const res = validateStage(held);
  // (crumbling tiles are never needed, STAGE-RULES §1: the stage with every tile gone still reaches the shrine and its goal. Only a
  // petal or a heart over a tile may be out of reach without them: it is a tile's reward)
  if (!st.platforms.some((p) => p.type === 'fragile')) return res;
  const bare = validateStage({ ...held, platforms: held.platforms.filter((p) => p.type !== 'fragile') });
  const need = bare.errors.filter((e) => !/^(flower|leaf|heart) #/.test(e)).map((e) => `crumbling tiles needed: ${e}`);
  return need.length ? { ...res, ok: false, errors: [...res.errors, ...need] } : res;
}

/** what the validation pass decided */
/** (`thin`: it passes, but a purge or gauntlet holds fewer animals than it lays for, its goal + 2: worth a longer stage if there is time) */
type Verdict = { ok: true; thin?: boolean } | { ok: false; swap?: number; reroll?: boolean; short?: boolean };

/**
 * Pass 5: levelCheck (which runs puzzleCheck on the rooms), then local repair (D3, Part 1 Pass 5's "self-healing"):
 *   a pickup the check finds out of reach, inside a platform, overlapping or past the shrine is taken out (never a quota item);
 *   an animal too close to a safe spot is taken out;
 *   an unreachable piece of the route: a stepping stone in the seam before the first section that cannot be reached;
 *   still unreachable there, or a room that cannot be solved: that one section is swapped (the caller bans it at that slot);
 *   a purge's or gauntlet's animals short of its goal: a longer stage (the caller adds a section);
 *   anything else (another quota short): a whole re-roll.
 */
export function checkAndRepair(b: Built, budget: StageBudget, repairs: Repair[], tried: Set<string>): Verdict {
  const st = b.stage;
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
      m = /^(flower|leaf|heart) #(\d+)/.exec(err);
      if (m && /out of reach|inside platform|overlap|outside the walkable|past the shrine/.test(err)) {
        const id = Number(m[2]);
        if (budget.archetype !== 'harvest' || st.collectibles.filter((c) => c.type === 'flower').length > budget.quota.lay) {
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
        if (jumpOK(seam.from, stone, false).ok && jumpOK(stone, seam.to, false).ok) {
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
export function buildGen2Stage(req: BuildRequest): Gen2Stage {
  const M = req.kit.manifest;
  if (M.handBuilt.includes(req.config.id)) throw new Error(`gen2: ${req.config.id} is hand-built`);
  const budget = planBudget(req.config, M, req.difficulty);
  const graph = missionGraph(budget);
  let best: Gen2Stage | null = null;
  const maxRerolls = req.maxRerolls ?? 6;
  const failedAt = new Map<string, number>();
  if (req.difficulty === 'easy') {
    // Easy is Normal's stage under Easy's rules: Normal is built first (its repairs, swaps and length loop), and Easy lays exactly its
    // plan from its seed. Easy's own repairs are only the local ones (a stone, a stray pickup or animal); its clock is held to the
    // quick player's floor (fewer animals make the typical player's model shorter, not the stage)
    const n = buildGen2Stage({ ...req, difficulty: 'normal' });
    const repairs: Repair[] = [...n.gen2.repairs];
    // (and only the animals Normal kept: Easy's are a subset of Normal's)
    const b = assemble(req, budget, graph, n.gen2.seed, { plan: n.gen2.plan }, keptFoes(n));
    const v = checkAndRepair(b, budget, repairs, new Set());
    const st = b.stage;
    const fast = gen2Model(st, MODEL_FAST);
    st.gen2.modelled = { typical: Math.round(gen2Model(st, MODEL_TYPICAL) * 10) / 10, fast: Math.round(fast * 10) / 10 };
    st.gen2.rerolls = n.gen2.rerolls;
    st.gen2.repairs = repairs;
    if (v.ok && fast >= budget.seconds.fastFloor) return st;
    best = st;
    st.gen2.errors = checkStage(st, budget).errors;
    repairs.push({ kind: 'reroll', note: "Easy could not lay Normal's plan: Easy plans its own (the curation report names the stage)" });
  }
  // (the stage is the same on both difficulties, so Normal's build also holds Easy's quick player to the floor: Easy lays its plan)
  const easyReq: BuildRequest = { ...req, difficulty: 'easy' };
  const easyBudget = req.difficulty === 'easy' ? budget : planBudget(req.config, M, 'easy');
  const byId = new Map(M.sections.map((t) => [t.id, t]));
  const required = new Set((M.required?.[req.config.id] ?? []).map((r) => r.section));
  for (let rr = 0; rr <= maxRerolls; rr++) {
    const seed = rr === 0 ? req.seed : req.seed * 1009 + rr * 7919;
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
    for (let it = 0; it < 24; it++) {
      const b = assemble(req, budget, graph, seed, { bans, recent: req.recent, usedVersions: req.usedVersions, plan, open });
      const v = checkAndRepair(b, budget, repairs, tried);
      const st = b.stage;
      st.gen2.rerolls = rr;
      st.gen2.repairs = [...repairs];
      const grow = (note: string) => {
        if (lastMeeting) return false;
        const g = growPlan(b.laid.plan, graph);
        plan = g.plan;
        open = new Set([g.open]);
        grew = true;
        repairs.push({ kind: 'length', note });
        return true;
      };
      if (!v.ok) {
        st.gen2.errors = checkStage(st, budget).errors;
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
        if (v.swap !== undefined && b.laid.plan[v.swap]) {
          const tpl = b.laid.plan[v.swap].template;
          const set = bans.get(v.swap) ?? new Set<string>();
          set.add(tpl);
          bans.set(v.swap, set);
          // (a section that failed at two slots is kept out of the whole stage: it is the section, not the seam, and the curation
          // report names it for its author)
          failedAt.set(tpl, (failedAt.get(tpl) ?? 0) + 1);
          if (failedAt.get(tpl)! >= 2) bans.set(-1, new Set([...(bans.get(-1) ?? []), tpl]));
          repairs.push({ kind: 'swap', section: `s${v.swap + 1}`, note: `${tpl} swapped out` });
          plan = b.laid.plan;
          open = new Set([v.swap]);
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
      const over = typical > budget.seconds.max;
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
      if (over) st.gen2.repairs.push({ kind: 'length', note: `ships long: no shorter meets the floors and the goal (${clock}, ceiling ${budget.seconds.max.toFixed(0)} s)` });
      return st;
    }
    if (lastMeeting) return lastMeeting;
    repairs.push({ kind: 'reroll', note: `roll ${rr} failed` });
  }
  return best!;
}

/** the plan with one more slot, chosen fresh (its index is returned as `open`), at the end of the node before the shrine's */
export function growPlan(plan: readonly PlanSlot[], graph: MissionGraph): { plan: PlanSlot[]; open: number } {
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
