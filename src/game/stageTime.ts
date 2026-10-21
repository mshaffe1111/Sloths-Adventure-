/**
 * How long a stage takes: a MODEL of a first-time player, not a measurement of one.
 *
 * Stage length is set in seconds, not pixels. The numbers a stage has to reach are here (targetSeconds), the model that tells how long a built
 * stage takes is here (modelStage), and both the level list (worldsData.ts) and the generator (stageGenerator.ts) use them, so what the
 * list asks for and what a test checks are the same thing.
 *
 * For a horizontal stage the model is
 *     T = walk + specials + zones + fights + collecting
 *   walk       the distance from the start to the exit, at alpha * the top running speed (a first-time player on a touch screen does not hold
 *              full speed: they stop to look at hazards, turn back and wait for animals), with every two-lane fork replaced by the time of
 *              the lane the player takes
 *   specials   swings, climbs, mushrooms, moving platforms, rivers and required ropes cost more than walking the same distance
 *   zones      waiting out clouds, gusts, vents and the tide, slowing in webs and mud
 *   fights     a few seconds for every animal on the route (less for a flier, which hovers away from the path)
 *   collecting handling time for relics and cages
 * For a vertical stage (an ascent) it is the sum of the time of every step of the climb that the generator recorded.
 * Deaths and retries are not modelled: they only add time, so these are clean-run numbers.
 *
 * Three players are modelled: `typical` (takes the safe lane of every fork), `fast` (quick hands, takes the quickest lane), `slow`.
 */
import type { GeneratedStage } from './stageGenerator.ts';
import type { LaneFork, LaneRoute, ObjectiveType } from './types.ts';
import { PHYS } from './physics.ts';
import { ROPE_SPEED } from './rope.ts';

export interface ModelParams {
  name: 'fast' | 'typical' | 'slow';
  /** the share of the top running speed the player really keeps up */
  alpha: number;
  /** seconds per animal on the ground / per flier */
  fightGround: number;
  fightFlier: number;
  /** which lane of a fork the player takes: the safe (low) one, or whichever is quicker */
  lanes: 'safe' | 'quick';
}

export const MODEL_TYPICAL: ModelParams = { name: 'typical', alpha: 0.65, fightGround: 3.0, fightFlier: 2.0, lanes: 'safe' };
export const MODEL_FAST: ModelParams = { name: 'fast', alpha: 0.8, fightGround: 2.0, fightFlier: 1.0, lanes: 'quick' };
export const MODEL_SLOW: ModelParams = { name: 'slow', alpha: 0.55, fightGround: 4.0, fightFlier: 3.0, lanes: 'safe' };
export const MODELS = [MODEL_FAST, MODEL_TYPICAL, MODEL_SLOW] as const;

export const TIME = {
  /** the tree climb moves the hero this many px per second (engine.ts) */
  climbSpeed: 220,
  /** jumping at the trunk, grabbing, the vault onto the branch, and walking to the next edge */
  climbOverhead: 1.5,
  ropeOverhead: 1.5,
  /** grab a liana, swing, let go: seconds beyond walking the same distance */
  swingExtra: 2.5,
  /** stand on a mushroom and wait to be bounced, then line up the landing */
  bounceExtra: 1.5,
  /** waiting for a drifting log and hopping from log to log (the river's width is in the walk) */
  riverExtra: 3.0,
  /** a moving platform: the expected wait for it to swing to the near bank */
  movingExtra: 1.5,
  zoneExtra: { spore: 1.0, wind: 0.7, geyser: 1.2, bolt: 1.2, tide: 3.0, web: 0, dark: 0, crumble: 0 } as Record<string, number>,
  webSpeed: 0.4,
  tideSpeed: 0.78,
  /** handling a relic (search) and freeing a cage (two punches and the animation) */
  relicSec: 1.5,
  cageSec: 3.0,
  /** a deliberate, aimed jump between two thin platforms costs about a third of a second more than walking the same distance */
  hopSec: 0.35,
  /** a stair step (a hop up or a step down) */
  stepSec: 0.7,
  /** how fast each kind of lane can be travelled, relative to walking (a straight hollow is run flat out) */
  terrainPace: { canopy: 1, swing: 1, pillars: 1, trench: 1, hollow: 0.88 } as Record<LaneRoute['terrain'], number>,
  /** vertical stages: seconds per step, typical player */
  ascent: { hop: 1.2, hop2: 1.8, bounce: 2.0, swing: 4.0, climbOverhead: 1.5 },
} as const;

export const walkSpeed = (p: ModelParams) => p.alpha * PHYS.maxRun;

/** the floors every ordinary stage has to clear, in modelled seconds */
export const FLOOR_TYPICAL = 125;
export const FLOOR_FAST = 95;

// ---------------------------------------------------------------------------
// How long each stage should take
// ---------------------------------------------------------------------------

/** a typical stage of World 1 is about 2:15 and of World 10 about 4:00 */
const TYPICAL_W1 = 135;
const TYPICAL_W10 = 235;
/** relative length of each kind of stage (the sprint is the short one, the gauntlet the long one) */
const TYPE_FACTOR: Record<string, number> = {
  sprint: 0.97, harvest: 1.0, purge: 1.0, ascent: 1.0, stealth: 1.0, vine_runner: 1.0, relic_hunt: 1.04, rescue: 1.04, gauntlet: 1.1,
};
/** a little more or less from stage to stage, so a world is not ten stages of the same length: 1.0 to 1.07, never below the floor */
const STAGE_DRIFT = [0.0, 0.03, 0.06, 0.02, 0.07, 0.01, 0.05, 0.04, 0.0];

/** the seconds a stage must at least take for the typical player; the generator lands between this and 8% above it */
export function targetSeconds(world: number, mini: number, type: ObjectiveType | string): number {
  if (type === 'boss_lair') return 0;
  const base = TYPICAL_W1 + ((TYPICAL_W10 - TYPICAL_W1) * (world - 1)) / 9;
  const drift = 1 + STAGE_DRIFT[(mini + world * 3) % STAGE_DRIFT.length];
  const ease = world === 1 ? 0.99 + 0.01 * ((mini - 1) / 8) : 1;
  return Math.round(base * (TYPE_FACTOR[type] ?? 1) * drift * ease);
}

/** the quickest player's floor for the same stage: the fast model must still need this long */
export function fastFloor(world: number, mini: number, type: ObjectiveType | string): number {
  return Math.round(Math.max(FLOOR_FAST + 6, targetSeconds(world, mini, type) * 0.76));
}

// ---------------------------------------------------------------------------
// The model
// ---------------------------------------------------------------------------

export interface TimeBreakdown {
  total: number;
  walk: number;
  special: number;
  zone: number;
  fight: number;
  collect: number;
  /** per fork: seconds on the safe lane and on the quick lane */
  forks: Array<{ id: number; safe: number; quick: number; delta: number }>;
}

/** seconds for one lane of a fork (the fork's span included) */
export function laneSeconds(stage: GeneratedStage, fork: LaneFork, r: LaneRoute, P: ModelParams): number {
  const v = walkSpeed(P);
  const k = MODEL_TYPICAL.alpha / P.alpha;
  const span = fork.x1 - fork.x0;
  let t = ((span + r.extraPx) / v) * TIME.terrainPace[r.terrain];
  t += r.hops * TIME.hopSec * k + r.steps * TIME.stepSec * k;
  const vines = new Set(r.vines);
  for (const vn of stage.vines) {
    if (!vines.has(vn.id)) continue;
    t += vn.vineType === 'swing_liana' ? TIME.swingExtra : (vn.bottomY - vn.topY) / TIME.climbSpeed + TIME.climbOverhead * k;
  }
  const plats = new Set(r.platforms);
  for (const p of stage.platforms) {
    if (!plats.has(p.id)) continue;
    if (p.type === 'bouncy') t += TIME.bounceExtra;
    else if (p.type === 'moving') t += TIME.movingExtra;
  }
  const ropes = new Set(r.ropes);
  for (const rp of stage.ropes ?? []) {
    if (!ropes.has(rp.id) || !rp.required) continue;
    const gw = rp.x1 - rp.x0 - 88;
    t += (gw + 88) / ROPE_SPEED + TIME.ropeOverhead - gw / v;
  }
  const foes = new Set(r.enemies);
  for (const e of stage.enemies) if (foes.has(e.id)) t += e.type === 'eagle' ? P.fightFlier : P.fightGround;
  return t;
}

export function modelStage(stage: GeneratedStage, P: ModelParams = MODEL_TYPICAL): TimeBreakdown {
  if (stage.config.objectiveType === 'ascent') return modelAscent(stage, P);
  const v = walkSpeed(P);
  const forks = stage.lanes ?? [];
  const inLane = { vines: new Set<number>(), plats: new Set<number>(), ropes: new Set<number>(), foes: new Set<number>() };
  const forkOut: TimeBreakdown['forks'] = [];
  let laneTotal = 0;
  let laneSpan = 0;
  for (const f of forks) {
    for (const r of [f.high, f.low]) {
      r.vines.forEach((i) => inLane.vines.add(i));
      r.platforms.forEach((i) => inLane.plats.add(i));
      r.ropes.forEach((i) => inLane.ropes.add(i));
      r.enemies.forEach((i) => inLane.foes.add(i));
    }
    const hi = laneSeconds(stage, f, f.high, P);
    const lo = laneSeconds(stage, f, f.low, P);
    const safe = lo;
    const quick = Math.min(hi, lo);
    forkOut.push({ id: f.id, safe, quick, delta: Math.abs(hi - lo) });
    laneTotal += P.lanes === 'safe' ? safe : quick;
    laneSpan += f.x1 - f.x0;
  }
  const route = stage.exitTotemX - stage.spawnX;
  const walk = Math.max(0, route - laneSpan) / v + laneTotal;

  let special = 0;
  for (const vn of stage.vines) {
    if (inLane.vines.has(vn.id)) continue;
    special += vn.vineType === 'swing_liana' ? TIME.swingExtra : (vn.bottomY - vn.topY) / TIME.climbSpeed + TIME.climbOverhead * (MODEL_TYPICAL.alpha / P.alpha);
  }
  for (const p of stage.platforms) {
    if (inLane.plats.has(p.id)) continue;
    if (p.type === 'bouncy') special += TIME.bounceExtra;
    else if (p.type === 'moving') special += TIME.movingExtra;
  }
  for (const r of stage.ropes ?? []) {
    if (!r.required || inLane.ropes.has(r.id)) continue;
    const gw = r.x1 - r.x0 - 88;
    special += (gw + 88) / ROPE_SPEED + TIME.ropeOverhead - gw / v;
  }
  special += (stage.rivers ?? []).length * TIME.riverExtra;

  let zone = 0;
  for (const z of stage.zones ?? []) {
    zone += TIME.zoneExtra[z.kind] ?? 0;
    const len = z.x1 - z.x0;
    if (z.kind === 'web') zone += len * (1 / (v * TIME.webSpeed) - 1 / v);
    if (z.kind === 'tide') zone += len * (1 / (v * TIME.tideSpeed) - 1 / v);
  }

  let fight = 0;
  for (const e of stage.enemies) {
    if (inLane.foes.has(e.id)) continue;
    fight += e.type === 'eagle' ? P.fightFlier : P.fightGround;
  }

  let collect = 0;
  for (const c of stage.collectibles) {
    if (c.type === 'relic') collect += TIME.relicSec;
    else if (c.type === 'cage') collect += TIME.cageSec;
  }
  return { total: walk + special + zone + fight + collect, walk, special, zone, fight, collect, forks: forkOut };
}

function modelAscent(stage: GeneratedStage, P: ModelParams): TimeBreakdown {
  const v = walkSpeed(P);
  const k = MODEL_TYPICAL.alpha / P.alpha;
  const a = TIME.ascent;
  let t = a.hop * k; // the first hop up from the floor
  for (const s of stage.meta?.ascentChain ?? []) {
    t += (0.5 * s.w) / v;
    if (s.kind === 'hop') t += a.hop * k;
    else if (s.kind === 'hop2') t += a.hop2 * k;
    else if (s.kind === 'bounce') t += a.bounce * k;
    else if (s.kind === 'swing') t += a.swing * k;
    else if (s.kind === 'climb') t += s.rise / TIME.climbSpeed + a.climbOverhead * k;
    else if (s.kind === 'cross') t += s.w / v;
  }
  const fight = stage.enemies.reduce((acc, e) => acc + (e.type === 'eagle' ? 0 : P.fightGround), 0);
  return { total: t + fight, walk: t, special: 0, zone: 0, fight, collect: 0, forks: [] };
}

/** all three players at once */
export function modelAll(stage: GeneratedStage) {
  return { fast: modelStage(stage, MODEL_FAST), typical: modelStage(stage, MODEL_TYPICAL), slow: modelStage(stage, MODEL_SLOW) };
}
