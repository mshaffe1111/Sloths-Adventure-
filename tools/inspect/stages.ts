/**
 * Builds the stages the inspector looks at, the way the game builds them in a browser (read-only use of src/game).
 *
 * Every stage built on gen2 (stageGenerator.ts builtOnGen2, the game's one definition: the curated gen2 stages, 1-1 and the listed
 * rolls such as 1-2 and 1-3) goes through generateStage as the engine builds it on entry (engine.ts:901): the inspector's seed as the
 * layout number, the setting in the build (the pipeline lays Easy itself), then withGoals and, on Easy, easyStage. Outside a browser
 * `generateStage` builds the old generated stage for an id that has a hand-built one (protoStage.ts protoStageEnabled is false there),
 * so the other hand-built stages of Worlds 1-5 are built here directly, the way their own tests do: buildProtoStage for HAND_STAGES,
 * buildW2Stage for World 2; the old generator's (5-6, 5-8, Worlds 6-10) go through generateStage as the game builds them too.
 * (Until S1, 11-13, this asked isGen2Stage alone: 1-2 and 1-3 were built for Normal and threw in easyStage on Easy, and 1-1 was built
 * by its deleted hand-built builder; the old generator's stages were built without the layout number, so --seed did not move them.)
 */
import { generateAllLevels } from '../../src/game/worldsData.ts';
import { buildProtoStage, HAND_STAGES, type ProtoExtras } from '../../src/game/protoStage.ts';
import { buildW2Stage, W2_STAGES } from '../../src/game/w2Stages.ts';
import { specFor } from '../../src/game/mixer/stages.ts';
import { builtOnGen2, generateStage, setLayoutVariant, type GeneratedStage } from '../../src/game/stageGenerator.ts';
import { capFlagSpans, easyStage } from '../../src/game/easyMode.ts';
import { w4Normal } from '../../src/game/w4Normal.ts';
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
  /** 'hand' (designed and rolled from a seed), 'gen2' (the new generator's curated rolls), 'generated' (the old generator) */
  source: 'hand' | 'gen2' | 'generated';
  build: (easy: boolean) => Stage;
}

export interface Skipped {
  id: string;
  name: string;
  why: string;
}

const capped = <T extends Stage>(st: T): T => {
  capFlagSpans(st as never);
  return st;
};

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
    const hand = !builtOnGen2(c) && (!!HAND_STAGES[c.id] || !!W2_STAGES[c.id]);
    const gen2 = builtOnGen2(c);
    const make = (cfg: LevelConfig, easy: boolean): Stage => {
      // (with the game's own cap on the room between flags, as generateStage builds them: easyMode.ts capFlagSpans, LV-9)
      // (and World 4's Normal numbers, Normal only: w4Normal.ts, LV-2)
      // (a hand-built stage whose builder lays Easy itself, the mixer's (mixer/stages.ts specFor), is given Easy as generateStage gives it,
      // stageGenerator.ts; Easy's pacing is not judged on Normal's ground)
      // (as the engine builds it on entry: the layout number, then generateStage on the difficulty played)
      const asGame = (): Stage => {
        setLayoutVariant(seed);
        try {
          return generateStage(cfg, easy ? 'easy' : 'normal');
        } finally {
          setLayoutVariant(null);
        }
      };
      if (gen2) return asGame();
      if (HAND_STAGES[c.id]) {
        const own = easy && !!specFor(HAND_STAGES[c.id]);
        return easy ? capped(buildProtoStage(cfg, seed, HAND_STAGES[c.id], own)) : w4Normal(capped(buildProtoStage(cfg, seed, HAND_STAGES[c.id])));
      }
      if (W2_STAGES[c.id]) return capped(buildW2Stage(cfg, seed, W2_STAGES[c.id]));
      // (the old generator's stages: the layout number picks the variant there too, stageGenerator.ts variantAttemptFor)
      return asGame();
    };
    stages.push({
      id: c.id,
      world: c.worldIndex,
      mini: c.miniIndex,
      name: spec?.name ?? c.name,
      type: c.objectiveType,
      goalText: spec?.desc ?? c.description,
      source: hand ? 'hand' : gen2 ? 'gen2' : 'generated',
      build: (easy) => {
        // (the goal as the engine sets it: Normal's share of what the stage holds, goals.ts; Easy keeps the stage's own)
        const st = withGoals(make({ ...c, unlocked: true }, easy));
        return easy ? easyStage(st) : st;
      },
    });
  }
  if (worlds.includes(4)) skipped.push({ id: '4-D', name: "Dot's Netting Flight", why: 'Dot flies it: there is no ground, no jumps and no shrine, and its own flight code runs it (dotFlightStage.ts).' });
  if (worlds.includes(5)) skipped.push({ id: '5-M', name: 'On the March North', why: "Meeca's stage: no shrine (it ends in a scene) and its carving and scenes live in meecaPlay.ts; its length is meecaStage.ts meecaSeconds (3:20 to 4:20 quick), its rooms are proven by meecaStage.test.ts and played by meecaReal.test.ts; its dead time and floor are measured by tools/inspect/meecaPace.ts." });
  return { stages, skipped };
}
