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
import { W6_GROUND_SECTIONS } from './w6Ground.ts';
import { W6_ROOM_SECTIONS, W6R_STAGE } from './w6Rooms.ts';
import { W6_SWING_SECTIONS, withW6Swing } from './w6Swing.ts';

/** the stages of World 6 the game builds with gen2 (6-8 Stilt Climb is hand-built later; 6-10 is the guardian's lair) */
export const W6_GAME_STAGES = ['6-1', '6-2', '6-3', '6-4', '6-5', '6-6', '6-7', '6-9'] as const;

/** each stage's puzzle room, on every roll (the room comes once, where the plan puts it: DESIGN.md "Required sections") */
export const W6_REQUIRED: NonNullable<WorldManifest['required']> = Object.fromEntries(
  W6_ROOM_SECTIONS.map((s) => [W6R_STAGE[s.id], [{ section: s.id }]]),
);

/** the swing stages (6-1, 6-3, 6-6, 6-7): they build from the swing sections; the ground stages (6-2, 6-4, 6-5, 6-9) from w6Ground's */
export const W6_SWING_STAGES: readonly number[] = [1, 3, 6, 7];
/** the dark roots are 6-6's (Lights in the Roots) */
const DARK_STAGE = 6;

const SWING_IDS = new Set(W6_SWING_SECTIONS.map((s) => s.id));
const GROUND_IDS = new Set(W6_GROUND_SECTIONS.map((s) => s.id));

/**
 * Which stage holds which sections (STAGE-RULES §2 "Sameness": no two stages of a world alike, no 20 s stretch in common): the swing
 * stages hold the swing sections (the dark roots 6-6 alone) and none of w6Ground's; the ground stages hold w6Ground's and no swing
 * section (6-4 and 6-6 are both sprints: a sprint's archetype alone would mix them). The rooms are each their own stage's.
 */
function forStage(stage: number, id: string): boolean {
  const swing = W6_SWING_STAGES.includes(stage);
  if (SWING_IDS.has(id)) return swing && (!id.startsWith('w6s-dark-') || stage === DARK_STAGE);
  if (GROUND_IDS.has(id)) return !swing;
  return true;
}

/** World 6's kit for one stage as the game plays it on `difficulty` (Easy's water room opens on its plate alone: w6Rooms.ts) */
export function w6GameKit(stage: number, difficulty: Difficulty = 'normal'): WorldKit {
  const k = withW6Swing(w6Kit(stage), stage, difficulty);
  const sections = k.manifest.sections.filter((s) => forStage(stage, s.id));
  return { ...k, manifest: { ...k.manifest, sections, required: W6_REQUIRED } };
}
