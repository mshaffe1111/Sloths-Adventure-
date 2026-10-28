/**
 * Extra stages that sit between a world's own ten (stagePlan.ts), the way the secret Thornbark's Hollow sits outside them
 * (secret.ts, miniIndex 11). The first is Dot's netting flight, right after 4-5 (Matt, 2026-10-25): cleared, it opens 4-6.
 * The second is Meeca's stage, "On the March North", the first stage of World 5 (Matt, 2026-10-27/28: she got away on the march
 * north, weeks before Pokey comes; a special map stage with her face, as 4-D has Dot's, so the built stages keep their numbers): the
 * World 4 guardian's clear opens it, and its clear opens 5-1.
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

// ── Meeca's stage, the first of World 5 (meecaStage.ts, run by meecaPlay.ts) ──
export const MEECA_STAGE_ID = '5-M';

/**
 * Meeca's own stage, the first of World 5 and required (Matt, 2026-10-26/27/28; HANDOFF "World 5 decisions"): it opens on the "On the
 * March North" card, and you play Meeca the night she got away from the General's column in the Orchid Sanctuary, weeks before Pokey
 * comes. Its slot in the list is kept here, the way Dot's flight sits after 4-5: 4-10's clear opens it, and its clear opens 5-1.
 */
export function meecaStageConfig(): LevelConfig {
  return {
    worldIndex: 5,
    miniIndex: 12,
    id: MEECA_STAGE_ID,
    name: 'On the March North',
    objectiveType: 'stealth',
    targetCount: 5,
    timeLimit: 0,
    levelWidth: 52000,
    levelHeight: 1200,
    description: 'The night Meeca got away. Learn each rule the hard way, and carve it on a tree for Pokey.',
    unlocked: false,
    completed: false,
    stars: 0,
    highScore: 0,
    bestTime: 0,
  };
}

/** the extra stages, each with the id of the stage it follows */
export const EXTRA_STAGES: Array<{ after: string; config: () => LevelConfig }> = [
  { after: '4-5', config: dotStageConfig },
  { after: '4-10', config: meecaStageConfig },
];

/** extra stages planned but not built yet: each one's place (the stage it follows) is kept, and it joins EXTRA_STAGES once built */
export const PLANNED_STAGES: Array<{ after: string; config: () => LevelConfig }> = [];

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
