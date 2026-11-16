/**
 * ridePickups — a pickup ON a carrier (Collectible.rides: a petal on a drifting log, on a lily pad; ENG-W2b item 3, the lead's sign-off
 * 11:38 AM ET 11-15). It goes where its platform goes: each step the engine sets it at its platform's x plus `dx` and its top plus `dy`
 * (stepRiders, after every carrier has moved). While its log is under a bank (the log's window, DriftInfo x0..x1, does not hold it) it
 * is HIDDEN with the log: never drawn over the bank's art and never picked up through it (rideHidden). Any carrier, any world: nothing
 * here names a stage. Pure (no canvas).
 */
import type { Collectible, Platform } from './types.ts';

/** is this riding pickup out of sight with its carrier (a log under a bank), or its carrier gone? */
export function rideHidden(c: Pick<Collectible, 'x' | 'rides'>, plat: Platform | undefined): boolean {
  if (!c.rides) return false;
  if (!plat || plat.broken) return true;
  const d = plat.drift;
  return !!d && (c.x < d.x0 || c.x > d.x1);
}

/** the stage's riding pickups and their carriers, found once per list (the engine keeps it while its lists stay the same) */
export interface Riders { of: readonly Collectible[]; on: readonly Platform[]; list: Array<{ c: Collectible; plat: Platform | undefined }> }
export function ridersOf(collectibles: readonly Collectible[], platforms: readonly Platform[], was?: Riders): Riders {
  if (was && was.of === collectibles && was.on === platforms) return was;
  const byId = new Map(platforms.map((p) => [p.id, p]));
  return { of: collectibles, on: platforms, list: collectibles.filter((c) => c.rides).map((c) => ({ c, plat: byId.get(c.rides!.id) })) };
}

/** set each riding pickup where its carrier is now */
export function stepRiders(r: Riders): void {
  for (const { c, plat } of r.list) {
    if (!plat || c.collected) continue;
    c.x = plat.x + c.rides!.dx;
    c.y = plat.y + c.rides!.dy;
  }
}
