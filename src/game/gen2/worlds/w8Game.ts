/**
 * gen2/worlds/w8Game — World 8 as the game builds it (DESIGN.md B10 piece G, B12 step 4): the world's kit (w8.ts), its ground, dark,
 * roost, bloom, glide and arena sections (w8Sections.ts), its lianas (w8Swing.ts) and the stage's puzzle room (w8Rooms.ts) folded into one
 * kit per stage and difficulty, with each stage's room required on every roll (WorldManifest.required): 8-1's dark hollow, 8-2's leaf
 * hammock, 8-5's branch seesaw.
 *
 * gen2/game.ts lists the stages with this kit, and tools/gen2/curate.ts curates them on it. After buildGen2Stage the game runs w8Finish.
 */
import type { Difficulty, SectionTemplate, WorldKit, WorldManifest } from '../types.ts';
import { w8Kit } from './w8.ts';
import { W8_ROOM_SECTIONS, W8R_STAGE, w8RoomsFor } from './w8Rooms.ts';
import { W8_SECTIONS, W8_STAGE_ONLY } from './w8Sections.ts';
import { W8_SWING_SECTIONS } from './w8Swing.ts';

/** the stages of World 8 the game builds with gen2 (8-7 The Tallest Tree is an ascent, hand-built; 8-10 is the guardian's lair) */
export const W8_GAME_STAGES = ['8-1', '8-2', '8-3', '8-4', '8-5', '8-6', '8-8', '8-9'] as const;

/** each stage's puzzle room, on every roll */
export const W8_REQUIRED: NonNullable<WorldManifest['required']> = Object.fromEntries(W8_ROOM_SECTIONS.map((s) => [W8R_STAGE[s.id], [{ section: s.id }]]));

/** the vine stages (8-3 Long Swings, 8-5 Next Branch) hold the lianas; no other stage does */
export const W8_SWING_STAGES: readonly number[] = [3, 5];

/** which stage holds which section: the lianas the vine stages', the listed ones their stages' (w8Sections W8_STAGE_ONLY) */
function forStage(stage: number, s: SectionTemplate): boolean {
  if (W8_SWING_SECTIONS.includes(s)) return W8_SWING_STAGES.includes(stage);
  const only = W8_STAGE_ONLY[s.id];
  return !only || only.includes(stage);
}

/** World 8's kit for one stage as the game plays it on `difficulty` */
export function w8GameKit(stage: number, difficulty: Difficulty = 'normal'): WorldKit {
  const k = w8Kit(stage);
  const sections = [...W8_SECTIONS, ...W8_SWING_SECTIONS].filter((s) => forStage(stage, s));
  return { ...k, manifest: { ...k.manifest, sections: [...sections, ...w8RoomsFor(stage, difficulty)], required: W8_REQUIRED } };
}
