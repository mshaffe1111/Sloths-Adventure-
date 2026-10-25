/**
 * w4Nests — 4-8 Nests on the Cliff: eaglet chicks caught in old netting on the cliff nests. Each nest is a 'cage' collectible (critter
 * 'eaglet', two blows tear the netting: engine.ts frees it and counts it like World 2's reed cages); the stage builds a small puzzle
 * around each one (protoStage.ts): a vine Dot must untie, a fall to plug, a capuchin guard to wait out, a branch only the leaf reaches.
 *
 * Once a chick is free its parent, circling overhead until then, swoops down to it and hovers there beating its wings: for a few
 * seconds the wingbeats blow a tailwind along the stretch ahead of the nest (`nestWind`), a little help on the way to the next one.
 * Then it settles on the nest beside the chick.
 *
 * Netting, nest, chick and parent are drawn here as plain shapes (the netting pieces were not cut yet: stand-ins until they are).
 */
import { WIND_GROUND_SHARE } from './zones.ts';

export type NestKind = 'plain' | 'knot' | 'fall' | 'guard' | 'glide';

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

/** the bowl of sticks the chick sits in, its floor at (x, floor) */
function drawBowl(ctx: CanvasRenderingContext2D, x: number, floor: number, front: boolean) {
  ctx.save();
  ctx.lineCap = 'round';
  if (!front) {
    ctx.fillStyle = '#3b2a1a';
    ctx.beginPath();
    ctx.ellipse(x, floor - 12, 44, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }
  ctx.fillStyle = '#6b4a2b';
  ctx.strokeStyle = '#1c140c';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - 48, floor - 14);
  ctx.quadraticCurveTo(x, floor + 14, x + 48, floor - 14);
  ctx.lineTo(x + 40, floor - 2);
  ctx.quadraticCurveTo(x, floor + 8, x - 40, floor - 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // the sticks woven round it
  ctx.strokeStyle = '#a47148';
  ctx.lineWidth = 2;
  for (let k = 0; k < 7; k++) {
    const u = k / 6;
    const sx = x - 44 + u * 88;
    ctx.beginPath();
    ctx.moveTo(sx - 10, floor - 12 + Math.sin(u * 9) * 2);
    ctx.lineTo(sx + 12, floor - 4 + Math.cos(u * 7) * 2);
    ctx.stroke();
  }
  ctx.strokeStyle = '#4a3220';
  for (const [a, b] of [[-52, 34], [30, 58], [-20, -58]] as const) {
    ctx.beginPath();
    ctx.moveTo(x + a, floor - 10);
    ctx.lineTo(x + b, floor - 16);
    ctx.stroke();
  }
  ctx.restore();
}

/** a fluffy eaglet: a pale down ball, big dark eyes and a little hooked beak. `flap` 0..1 lifts its stubby wings */
function drawChick(ctx: CanvasRenderingContext2D, x: number, floor: number, t: number, happy: boolean, flap: number) {
  const bob = happy ? Math.abs(Math.sin(t * 7)) * 4 : Math.sin(t * 9) * 0.8;
  const cy = floor - 22 - bob;
  ctx.save();
  ctx.strokeStyle = '#1c140c';
  ctx.lineWidth = 2.5;
  // stubby wings
  ctx.fillStyle = '#d6d3d1';
  for (const s of [-1, 1]) {
    ctx.save();
    ctx.translate(x + s * 13, cy + 2);
    ctx.rotate(s * (0.5 + flap * (0.9 + 0.4 * Math.sin(t * 22))));
    ctx.beginPath();
    ctx.ellipse(s * 6, 0, 10, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
  // body and head
  ctx.fillStyle = '#f5f5f4';
  ctx.beginPath();
  ctx.ellipse(x, cy + 4, 16, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, cy - 12, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // a tuft of down
  ctx.beginPath();
  ctx.moveTo(x - 3, cy - 23);
  ctx.lineTo(x, cy - 30);
  ctx.lineTo(x + 3, cy - 23);
  ctx.stroke();
  // eyes and beak
  ctx.fillStyle = '#1c140c';
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(x + s * 5, cy - 14, happy ? 2.4 : 3.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.moveTo(x - 4, cy - 9);
  ctx.lineTo(x + 4, cy - 9);
  ctx.quadraticCurveTo(x + 2, cy - 2, x - 1, cy - 3);
  ctx.closePath();
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}

/** the old netting pegged over the nest: whole, torn after the first blow, or (u 0..1 after the rescue) falling away in pieces */
function drawNet(ctx: CanvasRenderingContext2D, x: number, floor: number, torn: boolean, gone: number, t: number) {
  if (gone >= 1) return;
  ctx.save();
  ctx.globalAlpha *= 1 - gone;
  ctx.translate(0, gone * gone * 120);
  ctx.strokeStyle = '#d6c7a1';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  const top = floor - 62;
  const shake = torn ? Math.sin(t * 30) * 1.2 : 0;
  // the dome: strands from one peg over to the other, and across
  for (let k = 0; k <= 6; k++) {
    if (torn && (k === 2 || k === 3)) continue;
    const u = k / 6;
    ctx.beginPath();
    ctx.moveTo(x - 46, floor - 8);
    ctx.quadraticCurveTo(x - 50 + u * 100 + shake, top - 6, x + 46, floor - 8);
    ctx.stroke();
  }
  for (let k = 1; k <= 3; k++) {
    const yy = floor - 8 - k * 14;
    const half = 46 * Math.sqrt(1 - (k / 4) ** 2);
    if (torn && k === 2) {
      ctx.beginPath();
      ctx.moveTo(x - half, yy);
      ctx.lineTo(x - 8, yy + 6);
      ctx.moveTo(x + 10, yy + 8);
      ctx.lineTo(x + half, yy);
      ctx.stroke();
      continue;
    }
    ctx.beginPath();
    ctx.moveTo(x - half + shake, yy);
    ctx.quadraticCurveTo(x, yy - 6, x + half + shake, yy);
    ctx.stroke();
  }
  // the pegs
  ctx.fillStyle = '#7c4a1e';
  ctx.strokeStyle = '#1c140c';
  ctx.lineWidth = 2;
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.rect(x + s * 48 - 3, floor - 14, 6, 14);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

/** the parent eagle: a dark body, a pale head, broad wings beating at `beat` (0..1 how hard) */
function drawParent(ctx: CanvasRenderingContext2D, x: number, y: number, t: number, beat: number, size: number, facing: 1 | -1, perched = false) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(facing * size, size);
  ctx.strokeStyle = '#1c140c';
  ctx.lineWidth = 3 / size;
  const flap = perched ? -0.2 : Math.sin(t * (6 + 10 * beat)) * (0.35 + 0.45 * beat);
  // wings
  ctx.fillStyle = '#57534e';
  for (const s of [-1, 1]) {
    ctx.save();
    ctx.scale(s, 1);
    ctx.rotate(-flap);
    ctx.beginPath();
    if (perched) {
      ctx.ellipse(10, 4, 16, 9, 0.5, 0, Math.PI * 2);
    } else {
      ctx.moveTo(6, -4);
      ctx.quadraticCurveTo(34, -20, 62, -8);
      ctx.lineTo(54, -2);
      ctx.lineTo(58, 4);
      ctx.lineTo(46, 4);
      ctx.lineTo(48, 10);
      ctx.quadraticCurveTo(26, 8, 6, 8);
      ctx.closePath();
    }
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
  // tail, body, head
  ctx.fillStyle = '#44403c';
  ctx.beginPath();
  ctx.moveTo(-8, 12);
  ctx.lineTo(8, 12);
  ctx.lineTo(10, 30);
  ctx.lineTo(-10, 30);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#78716c';
  ctx.beginPath();
  ctx.ellipse(0, 4, 12, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#e7e5e4';
  ctx.beginPath();
  ctx.arc(4, -14, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#1c140c';
  ctx.beginPath();
  ctx.arc(7, -16, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.moveTo(12, -16);
  ctx.quadraticCurveTo(22, -14, 18, -6);
  ctx.lineTo(12, -10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

/** streaks of air blowing along the parent's lane, in front of the nest */
function drawWingWind(ctx: CanvasRenderingContext2D, c: { x: number; y: number }, s: number, t: number) {
  if (s <= 0.02) return;
  const floor = c.y + 26;
  ctx.save();
  ctx.strokeStyle = `rgba(240, 253, 250, ${0.55 * s})`;
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  const len = NEST_WIND.ahead + NEST_WIND.back;
  for (let k = 0; k < 14; k++) {
    const u = (t * 0.9 + k * 0.137) % 1;
    const sx = c.x - NEST_WIND.back + u * len;
    const sy = floor - 120 + ((k * 61) % 520);
    ctx.globalAlpha = Math.sin(u * Math.PI);
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(sx + 40, sy - 8, sx + 80, sy);
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * A nest on the cliff (a 'cage' collectible with critter 'eaglet'), its middle at (c.x, c.y) and its floor 26 below. Before the rescue
 * the chick shivers under the netting and its parent circles high above; after it, the netting falls away, the parent swoops down and
 * beats its wings over the nest (the tailwind), then settles beside the chick.
 */
export function drawNest(ctx: CanvasRenderingContext2D, c: Cage, t: number): void {
  const floor = c.y + 26;
  const since = c.collected && c.freedAt !== undefined ? t - c.freedAt : -1;
  drawBowl(ctx, c.x, floor, false);
  drawChick(ctx, c.x, floor, t, since >= 0, since >= 0 ? Math.max(0, 1 - since / 3) : 0);
  drawBowl(ctx, c.x, floor, true);
  if (since < 0) {
    drawNet(ctx, c.x, floor, (c.cageHp ?? 2) < 2, 0, t);
    // the parent, circling high over its chick (it cannot get to it through the netting)
    const a = t * 0.9 + c.x * 0.01;
    drawParent(ctx, c.x + Math.cos(a) * 120, floor - 260 + Math.sin(a) * 26, t, 0.2, 0.7, Math.sin(a) < 0 ? 1 : -1);
    return;
  }
  drawNet(ctx, c.x, floor, true, Math.min(1, since / 0.9), t);
  const hoverY = floor - 120;
  if (since < NEST_WIND.arrive) {
    // the swoop: from high up behind, down to just over the nest
    const u = since / NEST_WIND.arrive;
    const e = 1 - (1 - u) * (1 - u);
    drawParent(ctx, c.x - 200 + 170 * e, floor - 320 + (320 - 120) * e, t, 0.6, 0.85, 1);
    return;
  }
  const s = wingStrength(since);
  if (since < NEST_WIND.arrive + NEST_WIND.beat) {
    drawWingWind(ctx, c, s, t);
    drawParent(ctx, c.x - 30, hoverY + Math.sin(t * 5) * 6, t, 0.5 + 0.5 * s, 0.9, 1);
    return;
  }
  // settled: perched on the rim of the nest beside the chick
  drawParent(ctx, c.x - 34, floor - 42, t, 0, 0.8, 1, true);
}
