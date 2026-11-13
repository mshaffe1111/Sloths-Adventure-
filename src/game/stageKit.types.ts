/**
 * The stage kit's shapes (ADR-003, reference/architecture/ADR-003-stage-kit.md; R-165.111). TYPES ONLY: nothing imports this at run
 * time yet, so no stage changes. A stage is described by one StageBrief:
 *   mission (what wins it) x profile (where the route goes, and which way he travels) x clocks (what keeps time) x mutators (rules that
 *   change how Pokey, animals or pickups behave) x mechanics (the kit pieces laid in it).
 * The core engine runs every stage; a StageMode answers the questions the core asks today in three places keyed off
 * `objectiveType === 'ascent'` and `proto.w4.descent` (engine.ts:2268 the exit clamp, :2532 checkpoints, :3219-3235 progress), and
 * MutatorRun is the one plug for rule modules (today's hand-wired DotRun, SlideRun and LanternRun, engine.ts:611-614, :672-673).
 */
import type { Difficulty } from './difficulty.ts';
import type { ObjectiveType } from './types.ts';

// ───────────────────────────── travel and the spatial profile ─────────────────────────────

/** which way the route leads; 'stay' is a room or arena he does not travel through */
export type Travel = 'right' | 'left' | 'up' | 'down' | 'stay';

/** who builds the layout: the gen2 pipeline (a manifest graph id when one is pinned) or a hand-built stage function */
export type LayoutSource = { kind: 'gen2'; graph?: string } | { kind: 'hand'; builder: string };

/**
 * Where the route goes. The shape fixes the travel, so a tower that runs left or an arena that runs down cannot be written:
 *   run         a side-on stage (today every gen2 stage and most hand-built ones: right)
 *   rooms       puzzle rooms in a row (kitStage.ts, w6Rooms..w8Rooms)
 *   tower       an ascent (buildAscent, stageGenerator.ts:2410)
 *   shaft       a straight descent; switchback: down, back and forth (4-7, w4LongDrop.ts)
 *   arena       a boss or a shrinking-safe-zone room (buildBoss, stageGenerator.ts:2592)
 */
export type SpatialProfile =
  | { shape: 'run' | 'rooms'; travel: 'right' | 'left'; source: LayoutSource }
  | { shape: 'tower'; travel: 'up'; source: LayoutSource }
  | { shape: 'shaft' | 'switchback'; travel: 'down'; source: LayoutSource }
  | { shape: 'arena'; travel: 'stay'; source: LayoutSource };

// ───────────────────────────── the tempo clock ─────────────────────────────

export type ClockId = string;

/** one stretch of a clock's cycle: 'warn' must come before an 'on' that hurts (rockfall.ts warn, zones.ts warn) */
export interface ClockPhase { name: 'off' | 'warn' | 'on' | 'rest'; seconds: number }

/**
 * A shared beat for everything timed in a stage (today each keeps its own: Zone period/offset zones.ts:22, RockDrop every/offset
 * rockfall.ts:10, thorn vines, river sluices, lift waits). Pieces bound to one clock stay in step; `offset` staggers a lane.
 * Runs on game time only: a clock that follows the hero's speed is a 'time-scale' mutator, never a clock setting.
 */
export interface ClockDef {
  id: ClockId;
  /** at least one phase; the cycle's length is their sum */
  phases: readonly [ClockPhase, ...ClockPhase[]];
  offset: number;
  /** Easy's cycle as a multiple of Normal's (>= 1: Easy is never faster) */
  easyStretch: number;
}

/** what a running clock tells a piece on a frame */
export interface ClockState { phase: ClockPhase['name']; /** 0..1 through the phase */ u: number; cycle: number }

// ───────────────────────────── mechanics (the kit pieces) ─────────────────────────────

/** pieces with no timing of their own (today's code, CAPABILITY.md §1; the planned ones are marked) */
export type FreeMechanic =
  | 'crumble' | 'moving-x' | 'lift' | 'drift' | 'push' | 'bounce' | 'vine' | 'rope' | 'swim' | 'puzzle-room'
  | 'breakable' /* planned */ | 'pool' /* planned: calm water anywhere */ | 'oscillate-y' /* planned */;
/** pieces that only make sense on a beat: each names its clock, so an unclocked one cannot be written */
export type ClockedMechanic = 'rocks' | 'zones' | 'crosser' /* planned: a lane hazard */ | 'beat-solid' /* planned */ | 'countdown-gate' /* planned */;
export type MechanicId = FreeMechanic | ClockedMechanic;
export type MechanicUse = { id: FreeMechanic } | { id: ClockedMechanic; clock: ClockId };

// ───────────────────────────── rule mutators ─────────────────────────────

/**
 * A rule that changes how the stage plays. `reach` is fixed per kind: 'changes' means the flown arcs no longer hold (his speed, his
 * jump, what he can climb), so the brief's ReachClaim must cover it or the roll is not judged on reach (ADR-001 `reach.unflown`).
 */
export type Mutator =
  | { kind: 'soft-falls'; reach: 'same' } // A1: a fall on land sets him back (gen2 softFalls)
  | { kind: 'chase'; reach: 'same'; speed: number } // 1-8's collapse behind him (chase.ts)
  | { kind: 'rising'; reach: 'same'; clock: ClockId } // 6-8's tide (risingTide.ts); a shrinking safe zone
  | { kind: 'auto-scroll'; reach: 'same'; speed: number; edge: 'push' | 'setback' } // planned
  | { kind: 'meter'; reach: 'same'; drainS: number; refill: 'spots'; empty: 'slow' } // 8-4's jar (lantern.ts); warmth
  | { kind: 'watchers'; reach: 'same' } // stealth: cover in bushes hides him (engine.ts:1500)
  | { kind: 'camouflage'; reach: 'same'; stillS: number } // planned: still or slow hides him anywhere
  | { kind: 'tether'; reach: 'changes'; lengthPx: number; breaks: readonly ('thorn' | 'hazard' | 'fall')[] } // planned (R-165.110)
  | { kind: 'time-scale'; reach: 'changes'; follows: 'hero-speed' }; // parked: a puzzle-room type only (R-165.96)
export type MutatorKind = Mutator['kind'];
export type ReachMovingMutator = Extract<Mutator, { reach: 'changes' }>['kind'];

// ───────────────────────────── the mission ─────────────────────────────

/** what wins the stage; the exit stays locked (with Dot's line) until it is met */
export type Mission =
  | { kind: 'reach-exit' }
  | { kind: 'collect'; what: 'petals' | 'relics'; share: number }
  | { kind: 'defeat'; share: number }
  | { kind: 'rescue'; bring: 'free' | 'home'; count: number } // 'home': R-165.110's walk them to the end
  | { kind: 'survive' } // stealth: reach the exit unseen or unhurt
  | { kind: 'boss' };

/** today's ObjectiveType read as a mission (goals.ts, engine.ts:3030), so old stages need no new data */
export type MissionKindOf<O extends ObjectiveType> =
  O extends 'sprint' | 'ascent' | 'vine_runner' ? 'reach-exit'
  : O extends 'harvest' | 'relic_hunt' ? 'collect'
  : O extends 'purge' | 'gauntlet' ? 'defeat'
  : O extends 'rescue' ? 'rescue'
  : O extends 'stealth' ? 'survive'
  : 'boss';

// ───────────────────────────── the brief ─────────────────────────────

/** ADR-001's FallPolicy (verdicts.types.ts on E0a), repeated here until E0a merges; then this aliases it */
export type FallRule = 'no-lethal' | 'land-soft' | 'per-gap';

/** whether the verdicts may judge reach: flown for these settings, with these reach-moving mutators flown too */
export type ReachClaim =
  | { kind: 'unflown' }
  | { kind: 'flown'; settings: readonly Difficulty[]; mutators: readonly ReachMovingMutator[] };

export interface StageBrief {
  id: string;
  mission: Mission;
  profile: SpatialProfile;
  clocks: readonly ClockDef[];
  mutators: readonly Mutator[];
  mechanics: readonly MechanicUse[];
  fall: FallRule;
  reach: ReachClaim;
  /** the mechanics this stage teaches, in order (STAGE-RULES: a first appearance is taught) */
  teaches: readonly (MechanicId | MutatorKind)[];
}

// ───────────────────────────── the core's plugs ─────────────────────────────

/** a point in world px (feet), as the engine's player and checkpoints carry it */
export interface Mark { x: number; y: number }
/** a stretch of the route along the travel (a help-ladder piece, a section): x for right/left, y for up/down */
export interface TravelSpan { from: number; to: number }

/** the travel answers, one per Travel; the core asks these instead of reading objectiveType or proto flags */
export interface StageMode {
  readonly travel: Travel;
  /** the best place so far, from a grounded frame (engine.ts bestClimbY, bestDropY) */
  best(prev: Mark, now: Mark): Mark;
  /** 0..1 how far on, for the progress bar (engine.ts:3219-3235) */
  progress(start: Mark, exit: Mark, best: Mark): number;
  /** a checkpoint touched replaces the current one only when it is further on (engine.ts:2532) */
  further(cp: Mark, current: Mark): boolean;
  /** he is past this stretch (the help ladder's reset, helpLadder.ts `stood`; the bots' "furthest on") */
  past(at: Mark, span: TravelSpan): boolean;
  /** the side walls: an exit on the left must not pin him at the start (engine.ts:2268) */
  bounds(stage: { levelWidth: number; exit: Mark; spawn: Mark }): { minX: number; maxX: number };
  /** which way the camera looks ahead */
  lead(): { dx: -1 | 0 | 1; dy: -1 | 0 | 1 };
}

/** what the core lends a rule module (the common part of DotHost, dotFlightRun.ts:14, and SlideHost, w7SlideRun.ts:14) */
export interface ModeHost {
  stageId: string;
  easy: boolean;
  /** game time, s */
  time(): number;
  hero(): Readonly<{ x: number; y: number; vx: number; vy: number; grounded: boolean }>;
  clock(id: ClockId): ClockState;
  guide(text: string, seconds: number): void;
  loseHeart(): void;
  /** set him back, as a soft fall does (no life lost) */
  setBack(): void;
  score(n: number): void;
  shake(n: number): void;
  win(): void;
}

export type DrawLayer = 'back' | 'world' | 'front' | 'hud';

/** one rule module, run by the core for each mutator a brief lists (the core keeps hearts, lives, saves and the result) */
export interface MutatorRun<M extends Mutator = Mutator> {
  readonly kind: M['kind'];
  start(host: ModeHost, m: M): void;
  /** before the core's physics step (input it overrides, forces it adds) */
  before?(dt: number): void;
  /** after it (hits, meters, what it reports) */
  after?(dt: number): void;
  draw?(layer: DrawLayer, ctx: CanvasRenderingContext2D): void;
  /** the stage ended (cleared, left, restarted): drop everything it holds */
  end(): void;
}
