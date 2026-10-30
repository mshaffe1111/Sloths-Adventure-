/**
 * gen2/worlds/w9Game — World 9 as the game builds it (DESIGN.md B10 piece G, B12 step 4): the world's kit (w9.ts) and its ground and hazard
 * sections (w9Ground.ts) folded into one kit per stage and difficulty, with each stage's must-haves on every roll (WorldManifest.required):
 * 9-1's first geyser (the lesson, in its first Ki slot). The swing builder's lianas (9-3 Ember Canopy) and puzzle rooms join here when
 * their branch merges (gen2-w9-swing: w9Swing.ts, w9Rooms.ts).
 *
 * gen2/game.ts lists the stages with this kit, and tools/gen2/curate.ts curates them on it, so a shipped roll builds in the game exactly as
 * it was checked. 9-2 and 9-7 are ascents (hand-built) and 9-10 is the Magma Drake's lair. After buildGen2Stage the game runs w9Finish.
 */
import type { Difficulty, SectionTemplate, WorldKit, WorldManifest } from '../types.ts';
import { w9Falls, w9Kit } from './w9.ts';
import { W9_GROUND_SECTIONS, W9_STAGE_ONLY, W9_THEME, type W9Theme } from './w9Ground.ts';
import { W9_ROOM_SECTIONS, W9R_STAGE, w9RoomsFor } from './w9Rooms.ts';
import { W9_SWING_SECTIONS } from './w9Swing.ts';

/** the stages of World 9 the game builds with gen2 */
export const W9_GAME_STAGES = ['9-1', '9-3', '9-4', '9-5', '9-6', '9-8', '9-9'] as const;

/** each stage's must-haves: 9-1 the geysers' lesson (in its first Ki slot) */
export const W9_REQUIRED: NonNullable<WorldManifest['required']> = {
  '9-1': [{ section: 'w9-first-geyser', phase: 'ki' }],
  // (each stage's puzzle room, on every roll: w9Rooms.ts W9R_STAGE, 9-3 the chain lift, 9-5 the hot plates, 9-8 the plate that holds the gate)
  // (9-8's lift room in its first Ten slot, well past the start: the stage's own line about the odd plant, said as it starts, never meets
  // the room's entry line, the lead 2026-10-29)
  ...Object.fromEntries(W9_ROOM_SECTIONS.map((s) => [W9R_STAGE[s.id], [W9R_STAGE[s.id] === '9-8' ? { section: s.id, phase: 'ten' as const } : { section: s.id }]])),
};

/** the vine stage (9-3 Ember Canopy) holds the chains (w9Swing.ts); no other stage does */
export const W9_SWING_STAGES: readonly number[] = [3];

/** which stage holds which sections (STAGE-RULES §2 "Sameness"): w9Ground's W9_STAGE_ONLY, the rest by archetype; the first geyser is 9-1's */
const forStage = (stage: number, id: string): boolean => (id === 'w9-first-geyser' ? stage === 1 : !W9_STAGE_ONLY[id] || W9_STAGE_ONLY[id].includes(stage));

/**
 * Each themed stage's own shared sections, given to one of its themes (STAGE-RULES §6: "a different mix of actions, not a different
 * order"): a roll's gate opens one theme, and then those sections come only with it, so a vents roll of 9-1 is geysers and a chasms roll
 * is jumps, all the way through. Which stage holds which section is w9Ground's W9_STAGE_ONLY (every section has its stages).
 */
const STAGE_THEMES: Readonly<Record<number, ReadonlyArray<[W9Theme, readonly string[]]>>> = {
  1: [[W9_THEME.vents, ['w9-geyser-pair', 'w9-geyser-row', 'w9-geyser-ledge']], [W9_THEME.chasms, ['w9-lava-rise', 'w9-geyser-chasm', 'w9-geyser-brink']]],
  4: [[W9_THEME.coils, ['w9-boa-knobs', 'w9-boa-vents']]],
  6: [[W9_THEME.cats, ['w9-cat-den', 'w9-jaguar-leap', 'w9-cat-ledges']], [W9_THEME.prowl, ['w9-hunter-run', 'w9-hunter-brink', 'w9-prowl-crust', 'w9-cat-chasm']]],
  8: [[W9_THEME.channels, ['w9-basalt-run', 'w9-basalt-twin']]],
  // (9-9: the guards on the landings past the chasms; or the hoard's own ground, pillars and bursts over the lava)
  9: [[W9_THEME.harpies, ['w9-harpy-gap', 'w9-harpy-pillars', 'w9-boa-chasm', 'w9-hot-run']], [W9_THEME.boas, ['w9-pillar-run', 'w9-hoard-pillars', 'w9-pillar-hop']]],
};
/** the ground of 9-3 that asks most, between its chains: weighed as a theme's (the vine stage is no breather: World 9's band) */
const HOT_GROUND = ['w9-crust-gaps', 'w9-lava-drop'];
/** a shared section given to the stage's theme that leans on it (it then waits for that theme's gate) */
function themed(stage: number, s: SectionTemplate): SectionTemplate {
  if (stage === 3 && HOT_GROUND.includes(s.id)) return { ...s, weight: 1 };
  const t = STAGE_THEMES[stage]?.find(([, ids]) => ids.includes(s.id));
  return t ? { ...s, uses: [...(s.uses ?? []), t[0]], weight: 1 } : s;
}

/** World 9's kit for one stage as the game plays it on `difficulty` */
export function w9GameKit(stage: number, _difficulty: Difficulty = 'normal'): WorldKit {
  const k = w9Kit(stage);
  const sections = W9_GROUND_SECTIONS.filter((s) => forStage(stage, s.id))
    .map((s) => themed(stage, s))
    .map(w9Falls);
  const swings = W9_SWING_STAGES.includes(stage) ? W9_SWING_SECTIONS.map(w9Falls) : [];
  return { ...k, manifest: { ...k.manifest, sections: [...sections, ...swings, ...w9RoomsFor(stage, _difficulty)], required: W9_REQUIRED } };
}
