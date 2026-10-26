/**
 * Which cleared stage is followed by a world's halfway scene (storyWorlds.ts WORLD_MID), the picture sequence where Dot catches up with
 * a note. Normally the world's fifth stage. Two worlds differ:
 *   - World 4, with the new stages on: the scene waits for Dot's own flight after 4-5 (4-D), where she arrives with the note.
 *   - World 5: the pouch scene is played inside 5-5 itself, at the rest branch where the orchids hang in rows (w5Lines.ts W5_POUCH),
 *     so no picture sequence follows 5-5: it played twice (QA v198, "Somebody I'm scared of." heard twice). 5-5's clear goes straight
 *     on (to Meeca's stage and its own "Three days earlier" card, where that stage is in). The panels stay in WORLD_MID for the story
 *     reader.
 */
export const MID_IN_STAGE: ReadonlySet<number> = new Set([5]);

export function midSceneAfter(lvl: { id: string; worldIndex: number; miniIndex: number }, o: { dotStageId: string; newStages: boolean }): boolean {
  if (MID_IN_STAGE.has(lvl.worldIndex)) return false;
  if (lvl.id === o.dotStageId) return true;
  return lvl.miniIndex === 5 && !(lvl.worldIndex === 4 && o.newStages);
}
