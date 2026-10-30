/**
 * w4Nests — 4-8 Nests on the Cliff: eaglet chicks caught in old netting on the cliff nests. Each nest is a 'cage' collectible (critter
 * 'eaglet', two blows tear the netting: engine.ts frees it and counts it like World 2's reed cages); the stage builds a small puzzle
 * around each one (protoStage.ts): a vine Dot must untie, a fall to plug, a capuchin guard to wait out, a branch only the leaf reaches.
 *
 * Once a chick is free its parent, circling overhead until then, swoops down to it and hovers there beating its wings: for a few
 * seconds the wingbeats blow a tailwind along the stretch ahead of the nest (`nestWind`), a little help on the way to the next one.
 * Then it settles on the nest beside the chick.
 *
 * Nest, chick and parent are World 4's painted pieces; the netting is painted too (stageArt.ts, hf-art-stage 2026-10-29).
 */
import { WIND_GROUND_SHARE } from './zones.ts';
import { drawW4, w4ArtReady, w4Height } from './w4Art.ts';
import { drawNetArt } from './stageArt.ts';
import { drawFx } from './bossFx.ts';

/** (`trade`: up a terrace on Dot's knot pulley, its stone got back from a capuchin with a mango: the puzzle kit's room, 2026-10-28) */
export type NestKind = 'plain' | 'knot' | 'fall' | 'guard' | 'glide' | 'trade';

/** a nest on the cliff (W4Extras.cliffNests): its cage (a collectible id), the puzzle around it, and the ledge it sits on */
export interface CliffNest {
  cageId: number;
  kind: NestKind;
  /** a nest that needs two ideas at once (4-8's second twist): the other one */
  also?: NestKind;
  platformId: number;
  x: number;
  y: number;
}

export const NEST_WIND = {
  /** seconds from the rescue until the parent is over the nest and beating its wings, and how long it beats them */
  arrive: 1.1,
  beat: 6,
  /**
   * the tailwind's push in the air (px/s; on the ground WIND_GROUND_SHARE of it), and where it blows: from a little past the nest
   * (`back` below zero: so it never pushes him while he stands beside the nest) to far ahead of it
   */
  force: 110,
  back: -40,
  ahead: 820,
  /** how far above and below the nest */
  up: 520,
  down: 460,
  /** seconds it takes to build up and to die away */
  ramp: 0.6,
} as const;

type Cage = { x: number; y: number; collected: boolean; critter?: string; freedAt?: number; cageHp?: number };

/** how hard a freed chick's parent is blowing now (0..1), `since` seconds after the rescue */
export function wingStrength(since: number): number {
  const s = since - NEST_WIND.arrive;
  if (s < 0 || s > NEST_WIND.beat) return 0;
  return Math.min(1, s / NEST_WIND.ramp, (NEST_WIND.beat - s) / NEST_WIND.ramp);
}

/** is (px, py) in the stretch a nest's parent blows along? (its feet y; the nest's middle at c.x, its floor 26 below c.y) */
export function inWingLane(c: { x: number; y: number }, px: number, py: number): boolean {
  const floor = c.y + 26;
  return px >= c.x - NEST_WIND.back && px <= c.x + NEST_WIND.ahead && py >= floor - NEST_WIND.up && py <= floor + NEST_WIND.down;
}

/** the push (px/s, + to the right) the parents' wingbeats give him at (px, py) at time t */
export function nestWind(cages: readonly Cage[], px: number, py: number, grounded: boolean, t: number): number {
  let best = 0;
  for (const c of cages) {
    if (c.critter !== 'eaglet' || !c.collected || c.freedAt === undefined) continue;
    const s = wingStrength(t - c.freedAt);
    if (s > best && inWingLane(c, px, py)) best = s;
  }
  return best * NEST_WIND.force * (grounded ? WIND_GROUND_SHARE : 1);
}

// ───────────────────────────── drawing ─────────────────────────────
// (all painted: World 4's nestEaglet (the chick tangled in its nest), eagletFly as the parent (w4Art.ts), and the netting over the nest,
// whole or torn (stageArt.ts drawNetArt). Code moves them: the parent's circle, swoop, wingbeats and perch, the netting falling away.)

/** the painted nest is drawn this wide; it sits this share of its height down into the ledge */
const NEST_W = 150;
const NEST_SINK = 0.12;
/** the netting's width: snug over the bowl (a touch wider than the nest, so its pegs stand just outside the rim) */
const NET_W = 158;
/** the parent's width, circling high and close to (hovering, perched) */
const PARENT_W = { far: 118, near: 150, perched: 110 };

/** the parent eagle, its middle at (x, y): wingbeats `beat` (0..1 how hard) as a bob and a tilt; `facing` 1 is to the right */
function drawParent(ctx: CanvasRenderingContext2D, x: number, y: number, t: number, beat: number, w: number, facing: 1 | -1) {
  const h = w4Height('eagletFly', w);
  const flap = Math.sin(t * (6 + beat * 10));
  // (the painting faces right; it bobs with each beat and leans into it)
  drawW4(ctx, 'eagletFly', x, y + h / 2 + flap * (2 + beat * 4), w, { flip: facing < 0, rot: flap * (0.03 + beat * 0.06) });
}

/** streaks of air blowing along the parent's lane, in front of the nest */
function drawWingWind(ctx: CanvasRenderingContext2D, c: { x: number; y: number }, s: number, t: number) {
  if (s <= 0.02) return;
  // (the painted wind, the gust strip in bossFx.ts, racing along with the tailwind: no stroked curves)
  const floor = c.y + 26;
  const len = NEST_WIND.ahead + NEST_WIND.back;
  for (let k = 0; k < 10; k++) {
    const u = (t * 0.9 + k * 0.137) % 1;
    const sx = c.x - NEST_WIND.back + u * len;
    const sy = floor - 120 + ((k * 61) % 520);
    drawFx(ctx, 'gust', sx + 50, sy, 110, { h: 20, alpha: 0.75 * s * Math.sin(u * Math.PI) });
  }
}

/**
 * A nest on the cliff (a 'cage' collectible with critter 'eaglet'), its middle at (c.x, c.y) and its floor 26 below. Before the rescue
 * the chick shivers under the netting and its parent circles high above; after it, the netting falls away, the parent swoops down and
 * beats its wings over the nest (the tailwind), then settles beside the chick. Nothing until World 4's sheet is in (it loads with 4-8).
 */
export function drawNest(ctx: CanvasRenderingContext2D, c: Cage, t: number): void {
  if (!w4ArtReady()) return;
  const floor = c.y + 26;
  const since = c.collected && c.freedAt !== undefined ? t - c.freedAt : -1;
  const nh = w4Height('nestEaglet', NEST_W);
  // the chick in its nest: it shivers while caught, hops for joy once free
  const hop = since >= 0 ? Math.abs(Math.sin(t * 7)) * Math.max(0, 1 - since / 3) * 5 : 0;
  const shiver = since < 0 ? Math.sin(t * 9) * 0.8 : 0;
  drawW4(ctx, 'nestEaglet', c.x + shiver, floor + nh * NEST_SINK - hop, NEST_W);
  if (since < 0) {
    drawNetArt(ctx, c.x, floor + nh * 0.1, (c.cageHp ?? 2) < 2, 0, t, NET_W);
    // the parent, circling high over its chick (it cannot get to it through the netting)
    const a = t * 0.9 + c.x * 0.01;
    drawParent(ctx, c.x + Math.cos(a) * 120, floor - 260 + Math.sin(a) * 26, t, 0.2, PARENT_W.far, Math.sin(a) < 0 ? 1 : -1);
    return;
  }
  drawNetArt(ctx, c.x, floor + nh * 0.1, true, Math.min(1, since / 0.9), t, NET_W);
  const hoverY = floor - 150;
  if (since < NEST_WIND.arrive) {
    // the swoop: from high up behind, down to just over the nest
    const u = since / NEST_WIND.arrive;
    const e = 1 - (1 - u) * (1 - u);
    drawParent(ctx, c.x - 200 + 170 * e, floor - 320 + (320 - 150) * e, t, 0.6, PARENT_W.far + (PARENT_W.near - PARENT_W.far) * e, 1);
    return;
  }
  const s = wingStrength(since);
  if (since < NEST_WIND.arrive + NEST_WIND.beat) {
    drawWingWind(ctx, c, s, t);
    drawParent(ctx, c.x - 30, hoverY + Math.sin(t * 5) * 6, t, 0.5 + 0.5 * s, PARENT_W.near, 1);
    return;
  }
  // settled: perched on the ledge beside the chick
  drawParent(ctx, c.x - NEST_W * 0.62, floor - w4Height('eagletFly', PARENT_W.perched) / 2, t, 0, PARENT_W.perched, 1);
}
