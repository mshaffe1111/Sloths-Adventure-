/**
 * Extra stages that sit between a world's own ten (stagePlan.ts), the way the secret Thornbark's Hollow sits outside them
 * (secret.ts, miniIndex 11). The first is Dot's netting flight, right after 4-5 (Matt, 2026-10-25): cleared, it opens 4-6.
 * Meeca's bonus stage after 5-5 is planned the same way.
 *
 * They come with the hand-built stages (protoStage.ts protoStageEnabled: the game's stages since 2026-10-24, no switch since
 * 2026-10-26), and are never in the list outside a browser, so the generator's own tests see the hundred stages they always did.
 * This file stays light (no stage code), because worldsData.ts builds the stage list from it.
 */
import type { LevelConfig } from './types.ts';

export const DOT_STAGE_ID = '4-D';

/** in a browser, as protoStageEnabled (protoStage.ts): the generator's own tests see the hundred stages they always did */
export function newStagesOn(): boolean {
  return typeof location !== 'undefined';
}

/** Dot's netting flight, as a stage in World 4's list */
export function dotStageConfig(): LevelConfig {
  return {
    worldIndex: 4,
    miniIndex: 11,
    id: DOT_STAGE_ID,
    name: "Dot's Netting Flight",
    objectiveType: 'sprint',
    targetCount: 1,
    timeLimit: 0,
    levelWidth: 24000,
    levelHeight: 1000,
    description: "Fly Meeca's note through the General's iron netting, to the one gap as wide as a folded letter.",
    unlocked: false,
    completed: false,
    stars: 0,
    highScore: 0,
    bestTime: 0,
  };
}

/** the extra stages, each with the id of the stage it follows */
export const EXTRA_STAGES: Array<{ after: string; config: () => LevelConfig }> = [{ after: '4-5', config: dotStageConfig }];

// ── Meeca's stage, after 5-5 (planned: being designed, not built) ──
export const MEECA_STAGE_ID = '5-M';

/**
 * Meeca's own stage, right after 5-5 and required (Matt, 2026-10-26; HANDOFF "World 5 decisions"): it opens on a "Three days earlier"
 * card, after 5-5's pouch scene, and you play Meeca marched through the sanctuary at dusk. Its slot in World 5's list is kept here, the
 * way Dot's flight sits after 4-5. When its builder exists, move this entry into EXTRA_STAGES (and 5-5's clear then opens it, as 4-D's
 * opens 4-6); until then the list goes 5-5, 5-6 as before.
 */
export function meecaStageConfig(): LevelConfig {
  return {
    worldIndex: 5,
    miniIndex: 12,
    id: MEECA_STAGE_ID,
    name: "Meeca's Stage",
    objectiveType: 'sprint',
    targetCount: 1,
    timeLimit: 0,
    levelWidth: 24000,
    levelHeight: 1000,
    description: 'Three days earlier. Marched through the sanctuary at dusk, Meeca carves on the move.',
    unlocked: false,
    completed: false,
    stars: 0,
    highScore: 0,
    bestTime: 0,
  };
}

/** extra stages planned but not built yet: each one's place (the stage it follows) is kept, and it joins EXTRA_STAGES once built */
export const PLANNED_STAGES: Array<{ after: string; config: () => LevelConfig }> = [{ after: '5-5', config: meecaStageConfig }];

/** put the extra stages into the list after the stages they follow (with their saved results), when the switch is on */
export function withExtraStages(levels: LevelConfig[], on = newStagesOn()): LevelConfig[] {
  if (!on) return levels;
  const out = [...levels];
  for (const ex of EXTRA_STAGES) {
    const at = out.findIndex((l) => l.id === ex.after);
    if (at < 0) continue;
    const c = ex.config();
    try {
      const saved = localStorage.getItem(`sloth_lvl_${c.id}`);
      const parsed = saved ? JSON.parse(saved) : null;
      if (parsed) {
        c.completed = !!parsed.completed;
        c.stars = parsed.stars || 0;
        c.highScore = parsed.highScore || 0;
        c.bestTime = parsed.bestTime || 0;
        c.unlocked = true;
      }
    } catch {
      /* no storage: not cleared */
    }
    out.splice(at + 1, 0, c);
  }
  return out;
}

export const isExtraStage = (id: string) => EXTRA_STAGES.some((e) => e.config().id === id);
