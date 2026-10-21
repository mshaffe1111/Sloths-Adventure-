/**
 * What kind of stage a stage is, as a glyph and as a word. The game has ten objective types (game/types.ts ObjectiveType);
 * nine of them have their own glyph and the boss lair is drawn as its guardian's painted crest.
 */
import type { ObjectiveType } from '../../game/types.ts';
import type { IconName } from './index.tsx';

export interface StageTypeInfo {
  icon: IconName;
  /** one word for a kicker: "Stage 3-5 · Stealth" */
  label: string;
}

export const STAGE_TYPES = {
  sprint: { icon: 'sprint', label: 'Sprint' },
  harvest: { icon: 'harvest', label: 'Harvest' },
  purge: { icon: 'purge', label: 'Purge' },
  ascent: { icon: 'ascent', label: 'Ascent' },
  stealth: { icon: 'stealth', label: 'Stealth' },
  vine_runner: { icon: 'vine', label: 'Vine swing' },
  relic_hunt: { icon: 'relic', label: 'Relic hunt' },
  rescue: { icon: 'rescue', label: 'Rescue' },
  gauntlet: { icon: 'gauntlet', label: 'Gauntlet' },
  boss_lair: { icon: 'boss', label: 'Boss' },
} satisfies Record<ObjectiveType, StageTypeInfo>;

export function stageTypeInfo(t: ObjectiveType): StageTypeInfo {
  return STAGE_TYPES[t] ?? { icon: 'sprint', label: 'Stage' };
}
