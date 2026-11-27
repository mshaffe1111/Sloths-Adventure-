/**
 * gen2/postLay: lay a stage's POST (post.ts; 2-7's doors, reference/design/2-7.md NEW 2) on its built ground, when its graph's brief
 * names one (GraphBrief.post): up to `doors` doors on the way OUT (the stage's first run leg: 2-7's out leg; a stage of one leg, the
 * whole route), each centred on a route ground piece wide enough to stand a door on, its slot at his middle over that ground (post.ts
 * PICK); and on the way HOME (the run leg after the last column, when there is one) every petal is a reply. Doors keep clear of the
 * spawn, the flags and each other. Too few pieces for the doors asked is refused by name. No stage id, world number, seed or x.
 */
import type { Collectible, Platform } from '../types.ts';
import { PICK, postFaults, type Post, type PostSpec } from '../post.ts';
import { PICKUP_APART } from '../levelCheck.ts';
import type { Gen2Stage } from './types.ts';
import { walkedStage } from '../petals.ts';
import { jumpTouchdown, TAKEOFF_FAR, walkedSpan } from './walkedSpan.ts';

/** a door's ground: at least this wide (px), so the door (about 130 px drawn) stands on it with room each side */
export const DOOR_GROUND = 240;
/** doors no nearer each other than this (px), nor the spawn or a flag nearer than CLEAR */
const APART = 360;
const CLEAR = 140;
/** the walked part of a door's piece at least this long (px): his reach each side of the slot, and a step more */
const WALKED_SLOT = 100;
/** a gap this narrow (px) is a seam walked across; a piece behind ends at most this far back to be jumped from (a pit's width) */
const SEAM_GAP = 8;
const HOP_FROM = 400;
/** a river whose logs' window ends this near a bank (px) hands a rider onto it, or he jumps off a log onto it */
const LOG_NEAR = 40;
/** no other pickup nearer a slot than this (px): twice levelCheck's apart rule */
const SLOT_CLEAR = PICKUP_APART * 2;

/** a trail petal: a plain flower, not hidden, no find, not the post's */
const trailPetal = (c: Collectible) => c.type === 'flower' && !c.mark && !c.hidden && !c.findId;

export function layPost(st: Gen2Stage, spec: PostSpec, piecesOf: (uid: string) => ReadonlyArray<{ platform: Platform; main: boolean }>): { post?: Post; problems: string[] } {
  const legs = st.gen2.tower?.legs ?? [];
  const out = legs.find((g) => !g.frame);
  const secs = st.gen2.sections.filter((s, i) => !out || (i >= out.i0 && i < out.i1));
  const ground = [...new Set(secs.flatMap((s) => piecesOf(s.uid)).filter((q) => q.main).map((q) => q.platform))]
    .filter((q) => q.type === 'solid' && !q.drift && !q.broken && q.width >= DOOR_GROUND)
    .sort((a, b) => a.x - b.x);
  const flags = (st.checkpoints ?? []).map((c) => c.x);
  // (the slot in the middle of the part of its piece every run WALKS (walkedSpan.ts, the petals' model): never where he arrives in
  // the air off a step up or leaves it by a jump. Planted: 1-out-of-3 slots at the piece's middle was hopped over by the bots)
  const ws = walkedStage(st);
  const taken: number[] = [];
  const slots: Array<{ x: number; y: number; floor: number }> = [];
  for (const q of ground) {
    if (slots.length >= spec.doors) break;
    // (and never a piece he drops onto from a higher one: a held jump glides clean over it, the expert bot over a 287 px piece)
    const left = !out || out.travel !== 'left';
    const dropIn = st.platforms.some((o) => o !== q && o.type === 'solid' && !o.broken && o.y < q.y - 6 && o.y > q.y - 200 && (left ? o.x + o.width >= q.x - 120 && o.x + o.width <= q.x + 4 : o.x <= q.x + q.width + 120 && o.x >= q.x + q.width - 4));
    if (dropIn) continue;
    // (and never where he lands off a drifting log: a river's far bank is set down on by a full run's jump off the log at the bank's
    // edge, which the walked span's plain jumps do not read (a log is no footing there). Planted: the expert bot jumped off a log 106 px
    // short of a bank and came down 172 px into it, over a slot 76 px in, every letter but that one posted); and the bank he leaves onto
    // a log ahead is left by a jump from as far back as the testers take off (walkedSpan.ts TAKEOFF_FAR))
    const w = { ...walkedSpan(q, ws) };
    for (const o of st.platforms) {
      const d = o.drift;
      if (!d) continue;
      const far = jumpTouchdown(0, d.baseY, q.y, false);
      const before = d.x0 < q.x && d.x1 >= q.x - LOG_NEAR, after = d.x1 > q.x + q.width && d.x0 <= q.x + q.width + LOG_NEAR;
      // (arrived on off a log: from its near end; left onto a log: toward its far end)
      const arrive = left ? before : after, leave = left ? after : before;
      if (arrive && left) w.lo = Math.max(w.lo, q.x + far);
      if (arrive && !left) w.hi = Math.min(w.hi, q.x + q.width - far);
      if (leave && left) w.hi = Math.min(w.hi, q.x + q.width - TAKEOFF_FAR);
      if (leave && !left) w.lo = Math.max(w.lo, q.x + TAKEOFF_FAR);
    }
    // (and never where a DOUBLE jump off the piece behind comes down: the expert chains one over a pit and flies a whole piece, its
    // slot with it (planted: expert Normal 3 jumped a notch and doubled clean over a 312 px piece); a seam walked across is no jump)
    for (const o of st.platforms) {
      if (o === q || o.drift || o.broken || (o.type !== 'solid' && o.type !== 'fragile') || o.y < q.y - 200) continue;
      const near = left ? q.x - (o.x + o.width) : o.x - (q.x + q.width);
      if (near < SEAM_GAP || near > HOP_FROM) continue;
      const far = jumpTouchdown(0, o.y, q.y, true);
      if (left) w.lo = Math.max(w.lo, o.x + o.width + far);
      else w.hi = Math.min(w.hi, o.x - far);
    }
    if (w.hi - w.lo < WALKED_SLOT) continue;
    // (clear of the spawn, the flags and the other doors, and of every other kind of pickup (twice levelCheck's apart rule); the
    // trail's petals there give way to it (below). From the walked part's middle out, in 20 px steps, his reach inside its ends)
    const clear = (x: number) =>
      Math.abs(x - st.spawnX) >= CLEAR && !flags.some((f) => Math.abs(f - x) < CLEAR) && !taken.some((t) => Math.abs(t - x) < APART) &&
      !st.collectibles.some((c) => c.type !== 'exit_totem' && !trailPetal(c) && Math.hypot(c.x - x, c.y - (q.y - PICK.up)) < SLOT_CLEAR);
    const mid = Math.round((w.lo + w.hi) / 2), half = (w.hi - w.lo) / 2 - PICK.reach;
    let x: number | undefined;
    for (let k = 0; k * 20 <= half && x === undefined; k++) for (const s of k ? [1, -1] : [1]) if (x === undefined && clear(mid + s * k * 20)) x = mid + s * k * 20;
    if (x === undefined) continue;
    slots.push({ x, y: q.y - PICK.up, floor: q.y });
    taken.push(x);
  }
  if (slots.length < spec.doors) return { problems: [`post: ${spec.doors} doors asked on the way out and only ${slots.length} route pieces ${DOOR_GROUND} px wide, walked, clear of the spawn, the flags and each other`] };
  // (each slot's letter: the nearest trail petal there takes the slot's place, else a new one; any other petal that near is lifted, so
  // none reads as one clump with it (planted: a petal 38 px off a new letter was kept, and the played stage's petal pass took the
  // letter; petals.ts now never takes a letter, and none is left beside it))
  let id = Math.max(0, ...st.collectibles.map((c) => c.id)) + 1;
  const doors: Post['doors'] = slots.map(({ x, y, floor }) => {
    const near = st.collectibles.filter((c) => trailPetal(c) && Math.hypot(c.x - x, c.y - y) < SLOT_CLEAR).sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y));
    let letter = near[0];
    for (const c of near.slice(1)) st.collectibles.splice(st.collectibles.indexOf(c), 1);
    if (!letter) st.collectibles.push((letter = { id: id++, type: 'flower', x, y, collected: false, bobPhase: 0 } as Collectible));
    Object.assign(letter, { x, y, mark: 'letter' as const });
    return { x, y: floor, letter: letter.id };
  });
  // (home: every petal on the race leg, the run leg after the last column, is a reply)
  const col = legs.map((g, i) => ({ g, i })).filter((q) => q.g.frame).at(-1);
  const home = col ? legs[col.i + 1] : undefined;
  if (home && !home.frame) for (const c of st.collectibles) if (c.type === 'flower' && !c.mark && c.x >= home.x0 && c.x <= home.x1 && c.y >= home.y0 - 200) c.mark = 'reply';
  const post: Post = { doors, art: spec.art };
  return { post, problems: postFaults(post, st.collectibles, st.platforms) };
}
