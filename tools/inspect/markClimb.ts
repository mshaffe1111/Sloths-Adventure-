/**
 * The bots go up for her marks (1-5 Where She Walked; the lead 11-13: "teach [the bots] to climb to a bough's mark"). Her road goes over
 * the awake snakes and along the bough run, and her mark stands up there; a player who reads the marks goes up to it. A bot walking
 * the low road that touches a climb with one of her marks up on the high road just ahead of it (the climb's top at the mark's
 * footing, the mark not read yet) climbs it, as he climbs when the way goes up; at the top he steps on along the bough the way he was
 * going and reads it (firsttimer.ts: on a trunk, up to its top, then off it the way on). Only her marks (a relic with `mark`): every
 * other stage's runs, and the tier bots' calibration on 1-1 (tierBots.test.ts), are as they were.
 */

/** how far ahead of the climb her mark may stand (px, along the way), and how near its footing must be to the climb's top (px) */
export const MARK_CLIMB = { ahead: 560, behind: 20, band: 60, over: 70 } as const;
/** the pickup stands this far over its footing (gen2: a mark's socket `dn`, w1Arc15.ts mark()) */
const DN = 34;

type Climb = { x: number; topY: number; bottomY: number };
type Item = { type: string; mark?: string; collected: boolean; x: number; y: number };

/** is one of her marks, not read yet, up on the high road this climb leads to: its footing at the climb's top, `over` px and more over
 *  the climb's foot (a mark up there, not on the road it rises from) and over him (on the trunk part way up, the 11-13 seed 2 expert
 *  caught it in a jump), within `ahead` px on the way he is going (`dir`) */
export function markUp(v: Climb, p: { x: number; y: number }, items: readonly Item[], dir: -1 | 0 | 1): boolean {
  if (!dir) return false;
  return items.some((c) => c.type === 'relic' && !!c.mark && !c.collected
    && (c.x - v.x) * dir >= -MARK_CLIMB.behind && (c.x - v.x) * dir <= MARK_CLIMB.ahead
    && Math.abs(c.y + DN - v.topY) <= MARK_CLIMB.band && c.y + DN < v.bottomY - MARK_CLIMB.over && c.y + DN < p.y);
}
