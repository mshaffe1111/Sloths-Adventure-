/**
 * LV-11 (polish report 1, 2026-10-29): a way out of the floor under a climb's first stairs. In 5-8 (the old generator's ascent) a fall off
 * the first stairs lands on the ground floor under them, 196-338 px below, and the scripted player was stuck there 19 times: every stair
 * above is more than one jump up, and the only way back was the first step, far behind. STAGE-RULES §1 and §6: every dip has a one-jump
 * way out. Here, a short climbing trunk from the floor up to a stair (straight up always climbs, and at its top he vaults onto the stair),
 * wherever the floor is more than ~300 px from any way back up. Pure: changes the stage's trees and vines.
 */
import type { GeneratedStage } from './stageGenerator.ts';
import type { Platform } from './types.ts';

/** a plain jump climbs this much (physics.ts reachJump: 110 px is the most a single jump goes up and still lands) */
export const ONE_JUMP_UP = 100;
/** no spot of the floor farther than this from a way back up (px) */
export const WAY_OUT_EVERY = 300;
/** a trunk this tall at most (a short climb, not a new route up the stage) */
const MAX_CLIMB = 360;

/** adds the trunks; returns how many */
export function dipWayOut(st: GeneratedStage): number {
  const floor = st.platforms.find((p) => st.spawnX >= p.x && st.spawnX <= p.x + p.width && Math.abs(p.y - st.spawnY) < 4);
  if (!floor) return 0;
  const solid = (p: Platform) => p !== floor && !p.broken && p.type !== 'bouncy' && p.type !== 'moving' && p.type !== 'drift' && p.type !== 'fragile';
  // what stands over the floor: the first stairs, each with how far up it is
  const over = st.platforms.filter((p) => solid(p) && p.x < floor.x + floor.width && p.x + p.width > floor.x && p.y < floor.y && floor.y - p.y <= MAX_CLIMB);
  // the ways back up from the floor: a stair one jump up, a climb trunk standing on the floor
  const outs: number[] = [];
  for (const p of over) if (floor.y - p.y <= ONE_JUMP_UP) outs.push(p.x, p.x + p.width);
  for (const v of st.vines) if (v.vineType === 'tree_climb' && Math.abs(v.bottomY - floor.y) < 20) outs.push(v.x);
  // the floor under the stairs, left to right: wherever a stair stands over it farther than WAY_OUT_EVERY from any way out, a trunk
  // up to that stair (its lowest one there), at its near end
  const tid = Math.max(0, ...(st.trees ?? []).map((t) => t.id)) + 1;
  let vid = Math.max(0, ...st.vines.map((v) => v.id)) + 1;
  let n = 0;
  const stairs = over.filter((p) => floor.y - p.y > ONE_JUMP_UP).sort((a, b) => a.x - b.x);
  for (const p of stairs) {
    const tx = Math.round(p.x + Math.min(40, p.width / 3));
    if (outs.some((o) => Math.abs(o - tx) <= WAY_OUT_EVERY)) continue;
    // (nothing in the way between the floor and the stair: no other stair under it there)
    if (st.platforms.some((q) => q !== p && q !== floor && tx >= q.x - 30 && tx <= q.x + q.width + 30 && q.y > p.y && q.y < floor.y)) continue;
    const id = tid + n;
    (st.trees ??= []).push({ id, x: tx, groundY: floor.y, topY: p.y - 170, trunkWidth: 70, hasClimbVine: true, canopyRadius: 150 });
    st.vines.push({ id: vid++, x: tx, topY: p.y - 2, bottomY: floor.y - 6, swaySpeed: 0.9, swayPhase: (tx * 0.013) % 6.28, vineType: 'tree_climb', treeId: id });
    outs.push(tx);
    n++;
  }
  return n;
}
