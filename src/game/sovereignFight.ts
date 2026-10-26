/**
 * The Sky Sovereign's fight (4-10), the parts that are hers alone: the rock pillars of the Cloud Aerie, her screech and the gust of her
 * wingbeats. Pure numbers (no canvas, no engine), so the boss definition (bossDefs.ts), the engine and the tests all agree.
 *
 *   The pillars   Three rock pillars stand in the arena. Her dive falls on a red mark that follows Pokey and then locks; when the mark
 *                 touches a pillar she slams into the rock instead of the floor, and is left stunned beside it with her head open. The
 *                 rock cracks; the second slam breaks it, the top falls (a shower of stones, grit trickling first) and a stump is left,
 *                 a low ledge. While a pillar stands, a dive that misses on open floor only scrapes the ground and pulls up again;
 *                 once every pillar is down her dives crash on the floor as they always did, so there is always a way to open her up.
 *   The screech   She rears back (crest up, the air shimmering at her beak) and screams: a wave rolls out the way she faces and shoves
 *                 Pokey hard away. A pillar between them is cover, and crouched on the ground he is pushed much less.
 *   The gust      Her wingbeats blow a gust lane down the arena, the wind chimes ringing first. It pushes him away from her (rock is
 *                 cover from it too), and the leaf rides it: gliding, he is carried a long way.
 */

/** the pillars, from the left fence: middle x, and every pillar's size */
export const PILLAR = {
  /** where they stand (middle, px from the left fence) */
  at: [330, 840, 1220] as const,
  w: 80,
  /** height above the floor of a whole pillar, and of the stump a broken one leaves */
  h: 140,
  stump: 60,
  /** slams it takes to break one */
  slams: 2,
  /** a dive whose mark is this close to a pillar's middle slams into it (the 150-wide mark visibly touches the rock) */
  reach: 110,
  /** stunned after a slam, and after the slam that breaks the rock (longer: the stones fall first) */
  stun: 3.2,
  stunBreak: 3.4,
  /** stunned after a floor crash, once every rock is down */
  crash: 2.8,
  /** where she lies after a slam: her middle this far from the pillar's middle, her head toward it */
  rest: 250,
} as const;

export interface SkyPillar {
  /** middle x (world) */
  x: number;
  w: number;
  /** height above the floor now (a whole pillar, or the stump) */
  h: number;
  cracks: number;
  broken: boolean;
  /** a dive's locked mark is on it: drawn glowing, so the lure reads */
  aimed?: boolean;
}

/** the arena's pillars, whole */
export function makePillars(arenaLeft: number): SkyPillar[] {
  return PILLAR.at.map((dx) => ({ x: arenaLeft + dx, w: PILLAR.w, h: PILLAR.h, cracks: 0, broken: false }));
}

export const standing = (ps: readonly SkyPillar[] | undefined): SkyPillar[] => (ps ?? []).filter((p) => !p.broken);

/** the standing pillar a mark at x would slam her into, or null (the nearest, when two are close) */
export function pillarFor(ps: readonly SkyPillar[] | undefined, x: number): SkyPillar | null {
  let best: SkyPillar | null = null;
  for (const p of standing(ps)) if (Math.abs(p.x - x) <= PILLAR.reach && (!best || Math.abs(p.x - x) < Math.abs(best.x - x))) best = p;
  return best;
}

/** the side of the pillar she ends up on (-1 left, +1 right): the side the mark is on, or the side she came from when it is dead on */
export function slamSide(p: SkyPillar, markX: number, fromX: number): -1 | 1 {
  const d = Math.abs(markX - p.x) > 12 ? markX - p.x : fromX - p.x;
  return d < 0 ? -1 : 1;
}

/** a slam: the rock cracks, and the last one breaks it. Returns true when this slam broke it */
export function slamPillar(p: SkyPillar): boolean {
  if (p.broken) return false;
  p.cracks++;
  if (p.cracks < PILLAR.slams) return false;
  p.broken = true;
  p.h = PILLAR.stump;
  return true;
}

/** where the falling stones land when a pillar breaks: on the side away from her (she lies on `side`), grit first, one after another */
export function rockShower(p: SkyPillar, side: -1 | 1, arena: { left: number; right: number }, phase: number): Array<{ x: number; warn: number }> {
  const far = -side;
  const offs = phase >= 3 ? [95, 200, 305, 410] : [95, 215, 335];
  const out: Array<{ x: number; warn: number }> = [];
  offs.forEach((o, i) => {
    const x = p.x + far * o;
    if (x < arena.left + 30 || x > arena.right - 30) return;
    out.push({ x, warn: 1.1 + i * 0.22 });
  });
  return out;
}

// ───────────────────────────── the screech and the gust ─────────────────────────────

export const SCREECH = {
  /** the wave rolls out this fast (px/s), as far as this past her beak */
  speed: 520,
  range: 1500,
  /** how hard it shoves him (px/s, fading to nothing over `fade` s), and the share that reaches him crouched on the ground */
  push: 640,
  fade: 0.55,
  duck: 0.35,
  /** it reaches this high above the floor (a hero on any ledge is in it) */
  top: 430,
} as const;

export const GUST = {
  /** px/s it blows a hero in the air; on the ground he gets `ground` of it, and with the leaf open it carries him `leaf` times as far */
  force: [150, 165, 200] as const,
  ground: 0.4,
  leaf: 1.6,
  /** how long it blows, by phase */
  last: [1.8, 2.0, 2.4] as const,
  top: 330,
} as const;

/** a pillar shelters a hero this far behind it (the wave closes again after that) */
export const COVER_LEN = 280;

/**
 * Is he sheltered from something coming from `srcX` by a standing rock between them? He has to be right behind it (within COVER_LEN)
 * and below its top: on top of a pillar he is in the open. `bodyTop` is the top of his body (world y), `floor` the floor line.
 */
export function inCover(ps: readonly SkyPillar[] | undefined, srcX: number, px: number, bodyTop: number, floor: number): boolean {
  const dir = px >= srcX ? 1 : -1;
  for (const p of ps ?? []) {
    if (p.h <= 0) continue;
    const nearFace = p.x - dir * (p.w / 2);
    const farFace = p.x + dir * (p.w / 2);
    // the whole rock is between them (not the one she is perched on), and he is close behind it
    if ((nearFace - srcX) * dir <= 0 || (px - farFace) * dir < -4) continue;
    if ((px - farFace) * dir > COVER_LEN) continue;
    // (a stump is low: it shelters only what is lower than its top)
    if (bodyTop >= floor - p.h - 4) return true;
  }
  return false;
}

/** the shove a screech gives him as its front passes him (px/s, signed), 0 when he is in cover */
export function screechShove(o: { ps?: readonly SkyPillar[]; srcX: number; dir: 1 | -1; px: number; bodyTop: number; floor: number; ducking: boolean; grounded: boolean }): number {
  if (inCover(o.ps, o.srcX, o.px, o.bodyTop, o.floor)) return 0;
  if (o.bodyTop < o.floor - SCREECH.top) return 0;
  return o.dir * SCREECH.push * (o.ducking && o.grounded ? SCREECH.duck : 1);
}

/** what the gust does to him this frame (px/s, signed) */
export function gustPush(o: { ps?: readonly SkyPillar[]; srcX: number; dir: 1 | -1; phase: number; px: number; bodyTop: number; floor: number; grounded: boolean; gliding: boolean }): number {
  if (inCover(o.ps, o.srcX, o.px, o.bodyTop, o.floor)) return 0;
  if (o.bodyTop < o.floor - GUST.top - 80) return 0;
  const f = GUST.force[Math.max(0, Math.min(2, o.phase - 1))];
  return o.dir * f * (o.grounded ? GUST.ground : o.gliding ? GUST.leaf : 1);
}

/** a shove fades out: what is left of it after dt */
export function fadeShove(v: number, dt: number): number {
  const step = (SCREECH.push / SCREECH.fade) * dt;
  return Math.abs(v) <= step ? 0 : v - Math.sign(v) * step;
}
