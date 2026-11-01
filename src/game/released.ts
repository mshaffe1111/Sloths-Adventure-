/**
 * The worlds that are out (lead, 2026-11-01): the ONE place that says how far the journey goes today. Every count, total and "X of Y"
 * the player sees (the Satchel's finds, scenes, creatures and medals, the World Map's stars, What's New) counts these worlds only, and
 * nothing from a later world shows. When World 9 ships, this number goes up and every count follows; released.test.ts walks them all.
 */
export const RELEASED_WORLDS = 8;

/** world 0 is "before the journey" (the prologue): always out */
export const isReleasedWorld = (w: number): boolean => w >= 0 && w <= RELEASED_WORLDS;

/** "8-3", "4-D", "5-M": the world a stage id belongs to is out ("S-1", the secret stages, and anything unparsed: no) */
export const isReleasedStage = (id: string): boolean => {
  const m = /^(\d{1,2})-/.exec(id);
  return !!m && isReleasedWorld(Number(m[1])) && Number(m[1]) >= 1;
};

/** keep only what belongs to a released world */
export const releasedOnly = <T extends { world: number }>(list: readonly T[]): T[] => list.filter((x) => isReleasedWorld(x.world));
