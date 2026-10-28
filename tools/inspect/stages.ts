/**
 * Builds the stages the inspector looks at, the way the game builds them in a browser (read-only use of src/game).
 *
 * Outside a browser `generateStage` builds the old generated stage for an id that has a hand-built one (protoStage.ts
 * protoStageEnabled is false there), so the hand-built stages of Worlds 1-5 are built here directly, the way their own tests do:
 * buildProtoStage for HAND_STAGES, buildW2Stage for World 2, and generateStage for the rest (5-6 to 5-9 are still generated).
 */
import { generateAllLevels } from '../../src/game/worldsData.ts';
import { buildProtoStage, HAND_STAGES, type ProtoExtras } from '../../src/game/protoStage.ts';
import { buildW2Stage, W2_STAGES } from '../../src/game/w2Stages.ts';
import { generateStage, type GeneratedStage } from '../../src/game/stageGenerator.ts';
import { easyStage } from '../../src/game/easyMode.ts';
import { withGoals } from '../../src/game/goals.ts';
import { stageSpec } from '../../src/game/stagePlan.ts';
import type { LevelConfig } from '../../src/game/types.ts';

export type Stage = GeneratedStage & { proto?: ProtoExtras };

export interface StageEntry {
  id: string;
  world: number;
  mini: number;
  name: string;
  type: string;
  /** what the goal line says (stagePlan's words, {n} filled in) */
  goalText: string;
  /** 'hand' (designed and rolled from a seed), 'generated' (the old generator) */
  source: 'hand' | 'generated';
  build: (easy: boolean) => Stage;
}

export interface Skipped {
  id: string;
  name: string;
  why: string;
}

/** every stage of the worlds asked for, plus the ones skipped and why */
export function stageList(worlds: number[], seed: number): { stages: StageEntry[]; skipped: Skipped[] } {
  const levels = generateAllLevels();
  const stages: StageEntry[] = [];
  const skipped: Skipped[] = [];
  for (const c of levels) {
    if (!worlds.includes(c.worldIndex)) continue;
    if (c.objectiveType === 'boss_lair') {
      skipped.push({ id: c.id, name: c.name, why: 'Boss lair: a fight in a closed arena, not a walk from start to exit, so beats along a path do not apply.' });
      continue;
    }
    const spec = stageSpec(c.worldIndex, c.miniIndex);
    const hand = !!HAND_STAGES[c.id] || !!W2_STAGES[c.id];
    const make = (cfg: LevelConfig): Stage =>
      HAND_STAGES[c.id]
        ? buildProtoStage(cfg, seed, HAND_STAGES[c.id])
        : W2_STAGES[c.id]
          ? buildW2Stage(cfg, seed, W2_STAGES[c.id])
          : generateStage(cfg);
    stages.push({
      id: c.id,
      world: c.worldIndex,
      mini: c.miniIndex,
      name: spec?.name ?? c.name,
      type: c.objectiveType,
      goalText: spec?.desc ?? c.description,
      source: hand ? 'hand' : 'generated',
      build: (easy) => {
        // (the goal as the engine sets it: Normal's share of what the stage holds, goals.ts; Easy keeps the stage's own)
        const st = withGoals(make({ ...c, unlocked: true }));
        return easy ? easyStage(st) : st;
      },
    });
  }
  if (worlds.includes(4)) skipped.push({ id: '4-D', name: "Dot's Netting Flight", why: 'Dot flies it: there is no ground, no jumps and no shrine, and its own flight code runs it (dotFlightStage.ts).' });
  if (worlds.includes(5)) skipped.push({ id: '5-M', name: 'On the March North', why: "Meeca's stage: no shrine (it ends in a scene) and its carving and scenes live in meecaPlay.ts; its length is meecaStage.ts meecaSeconds (3:20 to 4:20 quick), its rooms are proven by meecaStage.test.ts and played by meecaReal.test.ts; its dead time and floor are measured by tools/inspect/meecaPace.ts." });
  return { stages, skipped };
}
