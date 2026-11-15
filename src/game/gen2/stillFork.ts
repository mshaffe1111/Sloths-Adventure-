/**
 * gen2/stillFork — 1-8 NEW 7, THE STILL FORK (ENG-B6; R-165.198: any world lays it by data): one living fork of a laid chase made the
 * ONE place to stop. Nothing here is new to the engine but the lay: the collapse already HOLDS at a living fork and a new crack already
 * sets off behind him as he passes the next stretch's start (chase.ts, pieces/chasePiece.ts); the cover is the kit's cover (stillness.ts
 * inCover: still 0.5 s in it and a sweeper's eye passes over him); the watcher is the kit's sweeper perched on a post (Post.perched,
 * 1-7's eagle on its snag). The lay puts them together so the fork asks its question on EVERY roll:
 *   - the cover (World 1: the moss carpet) lies on the fork's own ground from `runIn` past where the collapse stops, so a stop from a
 *     full run ends inside it;
 *   - ONE watcher on a post past the cover, near enough that he and it share one upright screen (`postMax`), its stretch from the fork's near edge out over the next stretch's ground, far enough that a
 *     runner who does not stop meets its eye in the open (`reach`: its warn at its longest setting, at his top run, plus its sight and a
 *     margin). Its pass is called the moment he steps onto the fork (the kit calls a pass when it is cool and he is in its stretch: it
 *     starts cool), its warn shows at the far end, and its eye crosses TOWARD him (facing -1): running on is running into it;
 *   - it calls that one pass only (Post.passes 1): no second look follows him off the fork onto the next stretch, and none after a
 *     respawn (the kit keeps the spent cool).
 * A fork that cannot hold it is refused by name, never laid half: too short for the cover and the post, ground that breaks under them,
 * a rock standing in the cover, no stretch after it (nothing would crack when he leaves), a stretch already watched.
 */
import type { ChaseLay } from '../chase.ts';
import { PHYS } from '../physics.ts';
import { castDef } from '../predators/registry.ts';
import type { CastData } from '../castPlay.types.ts';
import type { Enemy, Platform } from '../types.ts';
import type { Bush, WatchZone } from '../watcher.ts';
import { ROLLED_FLAGS } from './pipeline.ts';

export const STILL_FORK = {
  /** the cover starts this far past where the collapse stops (px): he is on living ground before he must stop */
  runIn: 60,
  /** the post stands at least this far past the cover's far end (px), and this far from a flag on the fork */
  postPast: 60,
  flagClear: 90,
  /** and at most this far past the cover's start (px): with him still in the cover, the eagle on its post is on the same upright screen
   *  (412 px wide upright shows about 540 px of world, him 10-30% across in the chase lead, cameraFollow.ts CHASE_VIEW: level.md rule 8) */
  postMax: 420,
  /** past a runner's reach (the eye's warn at his top run and its sight ahead), this much more (px) */
  margin: 60,
} as const;

/** what a world lays a still fork with (World 1: w1Cast.ts W1_STILL_FORK) */
export interface StillForkLook {
  /** the cover laid on the fork (a Bush the kit hides a still sloth in) */
  cover: { kind: Bush['kind']; w: number };
  /** the kit kind that watches it (predators/registry.ts) */
  kind: string;
  /** its zone's calm (s), what a world's watcher is laid with (its one pass is called at once: the calm is only its laid cool) */
  calm: [number, number];
  /** the world's watcher, perched at `postX` over the zone (its body on a post on the fork, its gaze sweeping the zone) */
  watcher(z: WatchZone, groundY: number, id: number, postX: number): Enemy;
}

/** what the lay reads and writes of a stage */
export interface StillForkStage {
  platforms: Platform[];
  chase?: ChaseLay;
  enemies: Enemy[];
  checkpoints?: Array<{ x: number }>;
  /** where he starts (a flag the lay moves keeps inside the span from it, when it is the first) */
  spawnX?: number;
  proto?: { bushes?: Bush[]; cast?: CastData } | null;
}

/** what a laid still fork is, for the tests and the shooters (read back from the stage's data, never kept) */
export interface StillFork {
  fork: number;
  /** the fork's ground: where the collapse stops, and where the next crack sets off */
  x0: number;
  x1: number;
  groundY: number;
  cover: Bush;
  watcher: Enemy;
}

/** how far a runner who never stops gets past the fork's near edge before the eye can see him (px): its warn at its longest setting */
export function stillReach(kind: string, world: number): number {
  const def = castDef(kind, world);
  if (!def || def.habit !== 'sweep') return NaN;
  return (def.warn ?? 0) * Math.max(1, def.easy.tell) * PHYS.maxRun + def.sight.ahead + STILL_FORK.margin;
}

const R = Math.round;

/** the top of the ground at x (a solid piece within `near` px of `y`, or the highest solid piece there when `y` is not given) */
function groundAt(platforms: readonly Platform[], x: number, y?: number): Platform | null {
  let best: Platform | null = null;
  for (const p of platforms) {
    if (p.type !== 'solid' || p.width <= 0 || x < p.x || x > p.x + p.width) continue;
    if (y !== undefined ? Math.abs(p.y - y) > 2 : best && p.y >= best.y) continue;
    best = p;
  }
  return best;
}

/** the first x in [a, b] where the ground at height y breaks (no solid top there), or null when it runs unbroken */
function breakIn(platforms: readonly Platform[], a: number, b: number, y: number): number | null {
  const runs = platforms.filter((p) => p.type === 'solid' && Math.abs(p.y - y) <= 2 && p.x + p.width > a && p.x < b).sort((p, q) => p.x - q.x);
  let at = a;
  for (const p of runs) {
    if (p.x > at + 1) return R(at);
    at = Math.max(at, p.x + p.width);
    if (at >= b) return null;
  }
  return at >= b ? null : R(at);
}

/**
 * Lay the still fork on fork `fork` (the living ground after stretch `fork`): the cover, the watcher on its post, the stage's cast.
 * Returns what is wrong in words; nothing is laid unless the list is empty.
 */
export function layStillFork(st: StillForkStage, fork: number, look: StillForkLook, world: number): string[] {
  const lay = st.chase;
  const name = `still fork ${fork}`;
  if (!lay?.stretches.length) return [`${name}: the stage lays no chase`];
  const here = lay.stretches[fork], next = lay.stretches[fork + 1];
  if (!here) return [`${name}: the chase has ${lay.stretches.length} stretches`];
  if (!next) return [`${name}: it follows the last stretch, so no crack would set off as he leaves it`];
  const out: string[] = [];
  const x0 = here.end, x1 = next.start;
  const g = groundAt(st.platforms, x0 + 1) ?? groundAt(st.platforms, x0 + STILL_FORK.runIn);
  if (!g) return [`${name}: no ground where the collapse stops (${R(x0)})`];
  const gy = g.y;
  const cover: Bush = { x: R(x0 + STILL_FORK.runIn), w: look.cover.w, y: gy, kind: look.cover.kind };
  const need = STILL_FORK.runIn + look.cover.w + STILL_FORK.postPast;
  if (x1 - x0 < need) out.push(`${name}: ${R(x1 - x0)} px of fork, the cover and the post need ${need} px`);
  const gap = breakIn(st.platforms, x0, cover.x + cover.w + STILL_FORK.postPast, gy);
  if (gap !== null) out.push(`${name}: its ground breaks at ${gap} (the cover and the post stand on unbroken ground)`);
  // (a rock or a step standing on the ground inside the cover: he cannot stop flat in it)
  for (const p of st.platforms) {
    if (p.type !== 'solid' || p.y >= gy - 2 || p.y + p.height < gy - 2 || p.x + p.width <= cover.x || p.x >= cover.x + cover.w) continue;
    out.push(`${name}: a rock at ${R(p.x)} stands in the cover`);
  }
  const reach = stillReach(look.kind, world);
  if (!Number.isFinite(reach)) out.push(`${name}: '${look.kind}' is no sweeper of world ${world}`);
  const z: WatchZone = { x0: R(x0), x1: R(x0 + reach), calm: look.calm };
  // (one watcher to a stretch: a sweeper already over this ground would call its own passes over the fork)
  for (const e of st.enemies) {
    if (e.kitPerch === undefined && e.kitCool === undefined) continue;
    if (e.patrolMaxX > z.x0 && e.patrolMinX < z.x1) out.push(`${name}: a watcher already looks over ${R(e.patrolMinX)}-${R(e.patrolMaxX)}`);
  }
  // (its post: on the fork's ground past the cover, within postMax of the cover's start. That window is narrow (World 1's moss: 14 px), so
  // a flag of the fork's standing where the post must is MOVED past it, nearer the next crack (where chaseLay's flags want to be), on the
  // fork's ground, inside the flag span: ENG-CL (8b), the lead 8:20 PM 11-14. Nothing moves unless the whole fork can be laid)
  let postX = NaN;
  for (let x = cover.x + cover.w + STILL_FORK.postPast; x <= Math.min(x1 - 40, cover.x + STILL_FORK.postMax); x += 2) {
    if (groundAt(st.platforms, x, gy)) {
      postX = x;
      break;
    }
  }
  if (!Number.isFinite(postX)) out.push(`${name}: no ground for its post within ${STILL_FORK.postMax} px of the cover's start (on one upright screen with him)`);
  const flags = st.checkpoints ?? [];
  const moves: Array<{ c: { x: number }; to: number }> = [];
  if (Number.isFinite(postX)) for (const c of flags) {
    if (Math.abs(c.x - postX) >= STILL_FORK.flagClear) continue;
    const to = R(postX + STILL_FORK.flagClear);
    const others = flags.filter((q) => q !== c).map((q) => q.x);
    const prev = Math.max(st.spawnX ?? -Infinity, ...others.filter((x) => x < c.x)), after = Math.min(...others.filter((x) => x > c.x));
    if (to > x1 - 40 || !groundAt(st.platforms, to, gy)) out.push(`${name}: its flag at ${R(c.x)} stands where its post must, and the fork has no ground for it past the post (${to}) before the next crack (${R(x1)})`);
    else if (Number.isFinite(prev) && to - prev > ROLLED_FLAGS.max) out.push(`${name}: its flag at ${R(c.x)} stands where its post must, and past the post (${to}) it is ${R(to - prev)} px from the flag before, over ${ROLLED_FLAGS.max}`);
    else if (after - to < ROLLED_FLAGS.min) out.push(`${name}: its flag at ${R(c.x)} stands where its post must, and past the post (${to}) it is ${R(after - to)} px from the next flag, under ${ROLLED_FLAGS.min}`);
    else moves.push({ c, to });
  }
  if (out.length) return out;
  for (const m of moves) m.c.x = m.to;
  const id = st.enemies.reduce((m, e) => Math.max(m, e.id), 0) + 1;
  const w = look.watcher(z, gy, id, postX);
  // (its pass comes at him from the far end: running on is running into it; and it makes that one pass only)
  w.facing = -1;
  w.kitPasses = 1;
  delete w.kitFree;
  st.enemies.push(w);
  const proto = (st.proto ??= {});
  (proto.bushes ??= []).push(cover);
  const cast = (proto.cast ??= { kinds: [], traps: [] });
  if (!cast.kinds.includes(look.kind)) cast.kinds.push(look.kind);
  return [];
}

/** the still forks a stage lays, read back from its data: a one-pass watcher whose stretch starts where a stretch's collapse stops */
export function stillForks(st: StillForkStage): StillFork[] {
  const lay = st.chase;
  if (!lay) return [];
  const out: StillFork[] = [];
  lay.stretches.forEach((s, i) => {
    const next = lay.stretches[i + 1];
    const w = st.enemies.find((e) => e.kitPasses === 1 && e.kitPerch && Math.abs(e.patrolMinX - s.end) < 1);
    if (!w || !next) return;
    const cover = (st.proto?.bushes ?? []).find((b) => b.x >= s.end && b.x + b.w <= next.start);
    const g = groundAt(st.platforms, s.end + 1) ?? groundAt(st.platforms, s.end + STILL_FORK.runIn);
    if (cover && g) out.push({ fork: i, x0: s.end, x1: next.start, groundY: g.y, cover, watcher: w });
  });
  return out;
}
