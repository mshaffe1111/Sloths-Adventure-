/**
 * journalMet — when a journal card counts as met, shared by the journal (journal.ts, the Trophy Room) and the Naturalist medal
 * (badges.ts), so the medal is for exactly the cards the journal shows met. It sits apart because journal.ts imports badges.ts.
 *
 * A predator is met when it has come on screen (the stage's `seen`, kept in the medal store), or when a stage that holds it in
 * another way is cleared (the eagle's shadow in 1-7). The seven met on the road (the River King's guard, the capuchins, the
 * eaglets, the Butler, the Seamstress, Pell and the soldiers) are stage actors, not foes the engine counts as seen: each is met
 * when a stage that holds it is cleared, and from then on it is kept in `seen` too (badges.ts recordStage).
 */

/** the stages each road card is met in */
export const ROAD_STAGES = {
  royal_guard: ['2-9'],
  capuchin: ['4-3', '4-5', '4-8', '4-9'],
  eaglet: ['4-6'],
  butler: ['5-2', '5-M'],
  seamstress: ['5-4'],
  soldier: ['5-M'],
  pell: ['5-M'],
} as const satisfies Record<string, readonly string[]>;
export type RoadId = keyof typeof ROAD_STAGES;
export const ROAD_IDS = Object.keys(ROAD_STAGES) as RoadId[];

/** stages that count a predator met without it being counted on screen */
export const PREDATOR_ALSO_IN: Partial<Record<string, readonly string[]>> = { eagle: ['1-7'] };

interface Cleared {
  id: string;
  completed: boolean;
}
const clearedAny = (levels: readonly Cleared[], stages: readonly string[]) => levels.some((l) => l.completed && stages.includes(l.id));

/** has the player met this journal card (a predator's id or a road card's id)? */
export function cardMet(id: string, seen: readonly string[], levels: readonly Cleared[]): boolean {
  if (seen.includes(id)) return true;
  const stages = (ROAD_STAGES as Record<string, readonly string[]>)[id] ?? PREDATOR_ALSO_IN[id];
  return !!stages && clearedAny(levels, stages);
}

/** the road cards a cleared stage meets (recordStage keeps them in `seen`) */
export const roadCardsIn = (stageId: string): RoadId[] => ROAD_IDS.filter((r) => (ROAD_STAGES[r] as readonly string[]).includes(stageId));
