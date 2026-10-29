/**
 * groundFloor — an old-generator ground block reaches the floor it is drawn down to (5-6, polish report follow-up 2026-10-29).
 *
 * terrain.ts draws every solid block 50 px or deeper (platformPlan.ts: ground, step or pillar) as earth all the way down to the bottom
 * of the screen. The old generator lays some of them as 90 px slabs hung over water, with nothing under them: on screen a wall, in play
 * an opening, so walking "into the wall" dropped him into hidden water (5-6, 4 s from the spawn). Here each such block's collider runs
 * down past the water line, as it is drawn (STAGE-RULES §6: walls reach the ground). A block with any ledge under it is left as it is:
 * the way may walk under it.
 */
import type { Platform } from './types.ts';

/** how far past the water line (or the stage's bottom) the block's body goes (px) */
const BELOW = 60;

/** the blocks it lengthened (their ids) */
export function groundToFloor(stage: { platforms: Platform[]; waterY?: number; config: { levelHeight: number } }): number[] {
  const floor = (stage.waterY ?? stage.config.levelHeight) + BELOW;
  const out: number[] = [];
  for (const p of stage.platforms) {
    if (p.type !== 'solid' || p.height < 50 || p.broken || p.push || p.chase) continue;
    const bottom = p.y + p.height;
    if (bottom >= floor - BELOW) continue;
    const under = stage.platforms.some((q) => q !== p && !q.broken && q.y >= bottom - 2 && q.y < floor && q.x < p.x + p.width && q.x + q.width > p.x);
    if (under) continue;
    p.height = floor - p.y;
    out.push(p.id);
  }
  return out;
}
