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

/** the stages of World 9 the game builds with gen2 */
export const W9_GAME_STAGES = ['9-1', '9-3', '9-4', '9-5', '9-6', '9-8', '9-9'] as const;

/** each stage's must-haves: 9-1 the geysers' lesson (in its first Ki slot) */
export const W9_REQUIRED: NonNullable<WorldManifest['required']> = {
  '9-1': [{ section: 'w9-first-geyser', phase: 'ki' }],
};

/** which stage holds which sections (STAGE-RULES §2 "Sameness"): w9Ground's W9_STAGE_ONLY, the rest by archetype; the first geyser is 9-1's */
const forStage = (stage: number, id: string): boolean => (id === 'w9-first-geyser' ? stage === 1 : !W9_STAGE_ONLY[id] || W9_STAGE_ONLY[id].includes(stage));

// (the plain lava chasm stays every theme's: a fallback that fits any node)
const LAVA = ['w9-lava-rise', 'w9-lava-drop', 'w9-crust-gaps'];
const GEYSERS = ['w9-geyser-pair', 'w9-geyser-row', 'w9-geyser-chasm', 'w9-geyser-ledge', 'w9-geyser-brink'];
const BASALT = ['w9-basalt-run', 'w9-basalt-twin'];
const HUNT = ['w9-hunter-run', 'w9-cat-chasm', 'w9-hunter-brink'];
const CATS = ['w9-cat-den', 'w9-jaguar-leap'];
const HARPIES = ['w9-harpy-field', 'w9-harpy-gap'];
const BOAS = ['w9-boa-vents', 'w9-boa-knobs'];
/**
 * Each themed stage's shared sections, given to one of its themes (STAGE-RULES §6: "a different mix of actions, not a different order"): a
 * roll's gate opens one theme, and then the shared geysers, chasms, cracked basalt and hunters come only with the theme that leans on
 * them, so a vents roll of 9-1 is geysers and a chasms roll is jumps, all the way through. 9-3 (the lianas) keeps them all.
 */
const STAGE_THEMES: Readonly<Record<number, ReadonlyArray<[W9Theme, readonly string[]]>>> = {
  1: [[W9_THEME.vents, GEYSERS], [W9_THEME.chasms, LAVA], [W9_THEME.basalt, BASALT]],
  4: [[W9_THEME.spires, [...LAVA, ...HUNT]], [W9_THEME.ferns, [...GEYSERS, ...BASALT]], [W9_THEME.coils, ['w9-boa-knobs', 'w9-boa-vents']]],
  5: [[W9_THEME.glides, [...LAVA, ...BASALT]], [W9_THEME.bursts, [...GEYSERS, ...HUNT]]],
  6: [[W9_THEME.cats, [...LAVA, ...HUNT, ...CATS]], [W9_THEME.harpies, [...BASALT, ...HARPIES]], [W9_THEME.boas, [...GEYSERS, ...BOAS]]],
  8: [[W9_THEME.ledges, [...LAVA, ...HUNT]], [W9_THEME.channels, [...BASALT, ...GEYSERS]]],
  9: [[W9_THEME.cats, [...LAVA, ...HUNT, ...CATS]], [W9_THEME.harpies, [...BASALT, ...HARPIES]], [W9_THEME.boas, [...GEYSERS, ...BOAS]]],
};
/** a shared section given to the stage's theme that leans on it (it then waits for that theme's gate); 9-1 has no hunters */
function themed(stage: number, s: SectionTemplate): SectionTemplate | null {
  if (stage === 1 && HUNT.includes(s.id)) return null;
  const t = STAGE_THEMES[stage]?.find(([, ids]) => ids.includes(s.id));
  return t ? { ...s, uses: [...(s.uses ?? []), t[0]], weight: 1 } : s;
}

/** World 9's kit for one stage as the game plays it on `difficulty` */
export function w9GameKit(stage: number, _difficulty: Difficulty = 'normal'): WorldKit {
  const k = w9Kit(stage);
  const sections = W9_GROUND_SECTIONS.filter((s) => forStage(stage, s.id))
    .map((s) => themed(stage, s))
    .filter((s): s is SectionTemplate => !!s)
    .map(w9Falls);
  return { ...k, manifest: { ...k.manifest, sections, required: W9_REQUIRED } };
}
