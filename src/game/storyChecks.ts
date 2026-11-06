/**
 * Two of 1-1's story promises, as checks any build can be judged by (Round 6, the supervisor's PASS, the lead 11-05 9:40 PM):
 *   - V19b, the floor rises into the canopy: the end log stands higher than the route where the bough window begins (the stage's last
 *     third, BOUGH_WINDOW 0.67), so net-zero versions may not stack up and flatten the climb;
 *   - the seed: the golden seed more than 200 px over the ground under it (past a double) with a mushroom within 260 px below it
 *     (stage11.test.ts's promise, the seed perch's low version included).
 */
import type { Platform } from './types.ts';

interface StageLike { platforms: readonly Platform[]; collectibles: ReadonlyArray<{ type: string; x: number; y: number }>; exitTotemX: number; exitTotemY: number; spawnX?: number }

/** where the bough window begins: this share of the way from the spawn to the exit */
export const WINDOW_AT = 0.67;

/** V19b: the route's height where the bough window begins (the highest standable piece there: the strictest reading) and the end log's */
export function endAboveWindow(st: StageLike): { windowX: number; windowY: number; endY: number; pass: boolean } {
  const x0 = st.spawnX ?? 0, windowX = Math.round(x0 + WINDOW_AT * (st.exitTotemX - x0));
  const at = st.platforms.filter((p) => !p.broken && p.type !== 'bouncy' && !(p as { catch?: boolean }).catch && windowX >= p.x && windowX <= p.x + p.width);
  const windowY = at.length ? Math.min(...at.map((p) => p.y)) : NaN;
  return { windowX, windowY, endY: Math.round(st.exitTotemY), pass: Number.isFinite(windowY) && st.exitTotemY < windowY };
}

/** the seed's promise: every breach by name (empty: kept; no seed is a breach) */
export function seedPromise(st: StageLike): string[] {
  const seeds = st.collectibles.filter((c) => c.type === 'seed');
  if (seeds.length !== 1) return [`${seeds.length} golden seeds (one)`];
  const s = seeds[0];
  const out: string[] = [];
  const ground = st.platforms.filter((p) => p.type === 'solid' && p.height >= 90 && s.x >= p.x - 200 && s.x <= p.x + p.width + 200 && p.y > s.y).sort((a, b) => a.y - b.y)[0];
  if (!ground || ground.y - s.y <= 200) out.push(`the seed at x ${Math.round(s.x)} is ${ground ? Math.round(ground.y - s.y) : 'over no'} px over the ground (more than 200)`);
  if (!st.platforms.some((p) => p.type === 'bouncy' && Math.abs(p.x - s.x) < 260 && p.y > s.y)) out.push(`no mushroom within 260 px below the seed at x ${Math.round(s.x)}`);
  return out;
}
