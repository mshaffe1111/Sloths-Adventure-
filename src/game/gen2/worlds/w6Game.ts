/**
 * gen2/worlds/w6Game — World 6 as the game builds it (DESIGN.md B10 piece G): the world's ground (w6.ts, w6Ground.ts), the swing
 * sections and that stage's puzzle room (w6Swing.ts, w6Rooms.ts) folded into one kit per stage and difficulty, and the rooms each
 * stage must hold on every roll (WorldManifest.required): 6-3's root seesaw, 6-6's dark hollow, 6-7's water well.
 *
 * gen2/game.ts lists the stages with this kit, and tools/gen2/curate.ts curates them on it (the same kit, the same difficulty), so a
 * shipped roll builds in the game exactly as it was checked. After buildGen2Stage the game runs w6Finish (Dot's first line for each
 * new animal).
 */
import type { Difficulty, WorldKit, WorldManifest } from '../types.ts';
import { w6Kit } from './w6.ts';
import { W6_ROOM_SECTIONS, W6R_STAGE } from './w6Rooms.ts';
import { withW6Swing } from './w6Swing.ts';

/** the stages of World 6 the game builds with gen2 (6-8 Stilt Climb is hand-built later; 6-10 is the guardian's lair) */
export const W6_GAME_STAGES = ['6-1', '6-2', '6-3', '6-4', '6-5', '6-6', '6-7', '6-9'] as const;

/** each stage's puzzle room, on every roll (the room comes once, where the plan puts it: DESIGN.md "Required sections") */
export const W6_REQUIRED: NonNullable<WorldManifest['required']> = Object.fromEntries(
  W6_ROOM_SECTIONS.map((s) => [W6R_STAGE[s.id], [{ section: s.id }]]),
);

/** World 6's kit for one stage as the game plays it on `difficulty` (Easy's water room opens on its plate alone: w6Rooms.ts) */
export function w6GameKit(stage: number, difficulty: Difficulty = 'normal'): WorldKit {
  const k = withW6Swing(w6Kit(stage), stage, difficulty);
  return { ...k, manifest: { ...k.manifest, required: W6_REQUIRED } };
}
