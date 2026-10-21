/**
 * The two moon pools on the floor of the Shadow Prowler's lair (the Glowcap Sinkhole): where the shaft of moonlight from the sinkhole
 * lands. The lair paints them (lairProwler.ts); the fight uses them (bossDefs.ts): the jaguar cannot appear inside the light, so if his
 * shadow step brings him out in one he is caught and stunned. Kept in a file of its own so neither side has to import the other.
 */
/** centres, in world units from the left fence of the arena */
export const PROWLER_POOLS = [330, 1170] as const;
/** half the width of the lit ground, and what counts as standing in it */
export const POOL_HALF = 150;

/** is a world x (the jaguar's middle) inside a pool of an arena that starts at `left`? */
export function inMoonPool(x: number, left: number): boolean {
  return PROWLER_POOLS.some((dx) => Math.abs(x - (left + dx)) <= POOL_HALF);
}
