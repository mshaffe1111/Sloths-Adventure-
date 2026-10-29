/**
 * gen2/worlds/w7Game — World 7 as the game builds it (DESIGN.md B10 piece G): the world's sections (w7.ts, w7Ground.ts) and that stage's
 * puzzle room (w7Rooms.ts), and for the halls the swing and climb sections (w7Swing.ts), in one kit per stage and difficulty, with the sections each stage must hold on every roll
 * (WorldManifest.required): 7-1's first cracked tiles (the lesson, STAGE-RULES §1), 7-3's sealed door, 7-7's lever door.
 *
 * gen2/game.ts lists the stages with this kit, and tools/gen2/curate.ts curates them on it, so a shipped roll builds in the game exactly
 * as it was checked. 7-2, 7-4 and 7-8 are ascents (hand-built) and 7-10 is the guardian's lair.
 */
import type { Difficulty, WorldKit, WorldManifest } from '../types.ts';
import { w7Kit } from './w7.ts';
import { W7_STAGE_ONLY } from './w7Ground.ts';
import { W7_ROOM_SECTIONS, W7R_STAGE, withW7Rooms } from './w7Rooms.ts';
import { withW7Swing } from './w7Swing.ts';

/** the stages of World 7 the game builds with gen2 */
export const W7_GAME_STAGES = ['7-1', '7-3', '7-5', '7-6', '7-7', '7-9'] as const;

/** each stage's must-haves: 7-1 the tiles' lesson (in its first Ki slot), 7-3 and 7-7 their rooms */
export const W7_REQUIRED: NonNullable<WorldManifest['required']> = {
  '7-1': [{ section: 'w7-first-tiles', phase: 'ki' }],
  ...Object.fromEntries(W7_ROOM_SECTIONS.map((s) => [W7R_STAGE[s.id], [{ section: s.id }]])),
};

/** which stage holds which sections (STAGE-RULES §2 "Sameness"): w7Ground's W7_STAGE_ONLY, the rest by archetype */
const forStage = (stage: number, id: string): boolean => !W7_STAGE_ONLY[id] || W7_STAGE_ONLY[id].includes(stage);

/** World 7's kit for one stage as the game plays it on `difficulty` (Easy's rooms are one step: w7Rooms.ts) */
export function w7GameKit(stage: number, difficulty: Difficulty = 'normal'): WorldKit {
  // (the second builder's lianas and brown-vine climbs go to the halls, 7-5 and 7-9: w7Swing.ts W7S_STAGES)
  const k = withW7Swing(withW7Rooms(w7Kit(stage), stage, difficulty), stage, difficulty);
  const sections = k.manifest.sections.filter((s) => forStage(stage, s.id));
  return { ...k, manifest: { ...k.manifest, sections, required: W7_REQUIRED } };
}
