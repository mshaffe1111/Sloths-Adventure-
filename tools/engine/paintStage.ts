// The paint state a stage is drawn with, set as engine.ts sets it when a stage starts (the kit world, the ground look, the bough's joins,
// and paint on unless the kit is off), and the footing input terrain is given (terrain.ts footingsFor). Shared by paintcheck.ts and its
// test so both judge exactly what the engine draws.
import { hasKit, paintedKitEnabled, paintedPlatforms, setBoughJoins, setGroundLook, setGroundPaint, setKitWorld, protoArtReady } from '../../src/game/protoArt.ts';
import { planStage } from '../../src/game/platformPlan.ts';
import { lookFor } from '../../src/game/scenery.ts';
import { getSceneSeed } from '../../src/game/sceneSeed.ts';
import type { FootingInput } from '../../src/game/terrain.ts';
import type { Platform } from '../../src/game/types.ts';

interface StageLike { platforms: Platform[]; proto?: unknown; groundLook?: 'bough' }
interface ConfigLike { worldIndex: number; objectiveType?: string }

/** the footing input for a built stage, or null when its painted kit is off (no painter runs there: engine.ts paintKit) */
export function stagePaintInput(st: StageLike, c: ConfigLike): { f: FootingInput; key: string } | null {
  const w = c.worldIndex;
  // (engine.ts, a stage's start: setKitWorld, setGroundLook, setBoughJoins, then paintKit and setGroundPaint)
  setKitWorld(w);
  setGroundLook(st.groundLook);
  setBoughJoins(st.groundLook ? st.platforms.filter((pl) => pl.type === 'solid') : []);
  const paintKit = !!st.proto || (hasKit(w) && paintedKitEnabled() && c.objectiveType !== 'boss_lair');
  setGroundPaint(paintKit);
  if (!paintKit) return null;
  protoArtReady();
  const f: FootingInput = {
    painted: paintedPlatforms(st.platforms),
    plan: planStage(st.platforms, w, getSceneSeed()),
    look: lookFor(w),
    rivers: w === 2 || st.platforms.some((q) => q.lily),
  };
  return { f, key: `${st.groundLook ?? '-'}` };
}
