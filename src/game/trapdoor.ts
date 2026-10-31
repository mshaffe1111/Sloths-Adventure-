/**
 * World 10's trapdoor grates (GRAB-BAG F): an iron grate over a chasm that swings open on a beat and clangs shut again. Pure (no canvas,
 * no engine), so the engine, the drawing and the tests agree on where a grate is at any moment. Shut for most of its cycle, it shudders
 * for `warn` s, then hangs open for `open` s (the engine treats it as gone: Platform.broken), then shuts.
 */
export interface TrapInfo {
  /** seconds for one whole cycle */
  period: number;
  /** seconds it hangs open */
  open: number;
  /** seconds it shudders before it opens */
  warn: number;
  /** seconds into the cycle at game time 0 */
  offset: number;
}

/** Normal and Easy beats: shut and calm for 1.9 s (Normal) and 2.8 s (Easy), time to walk a 230 px grate (about 1.4 s) */
export const TRAP = {
  normal: { period: 4.0, open: 1.3, warn: 0.8 },
  easy: { period: 4.8, open: 1.0, warn: 1.0 },
} as const;

/** where a grate is at game time t: open (gone), or shut with a shudder of 0..1 while it warns */
export function trapState(tr: TrapInfo, t: number): { open: boolean; shake: number; swing: number } {
  const u = (((t + tr.offset) % tr.period) + tr.period) % tr.period;
  const shutFor = tr.period - tr.open;
  if (u >= shutFor) {
    // (it swings down fast and back up just before it shuts: swing 0 shut .. 1 hanging straight down)
    const k = (u - shutFor) / tr.open;
    return { open: true, shake: 0, swing: Math.min(1, k * 5, (1 - k) * 6) };
  }
  const w = u - (shutFor - tr.warn);
  return { open: false, shake: w > 0 ? w / tr.warn : 0, swing: 0 };
}
