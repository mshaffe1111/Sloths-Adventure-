/**
 * stageSheets — which picture sheets a stage draws from its first moments, so they can be loaded, decoded and drawn once before it
 * starts (stagePreload.ts), behind the world map, the stage-cleared card, a story or a boss intro. Pure: no pictures here, so the tests
 * can check the list for every stage.
 *
 * Only what that one stage needs (atlasLoader.ts: a decoded sheet is 10 to 46 MB, and a world's sheets are let go when play moves on):
 *   kit:<w>        the painted platforms: World 1's atlas (every piece) and the world's own kit (engine.ts paintKit)
 *   w2/w3/w4/w5-props a hand-built World 2, 3, 4 or 5 stage's dressing (riverArt.ts, w3Art.ts, w4Art.ts, w5Art.ts)
 *   dot            Dot's flight (4-D): her pieces, her frames and the four paintings behind the netting (dotFlightArt.ts)
 *   Meeca's stage (5-M): World 5's kit and dressing, and Pell's and the soldiers' clip sheets (meecaArt.ts)
 *   kit-pieces     the puzzle kit's pieces and Pokey's carry poses (puzzleArt.ts), for a stage with puzzle rooms (the test room, 'kit',
 *                  World 1's rooms, World 2's W2_PUZZLES, World 3's W3_PUZZLES) and every World 3 and 4 stage (its dressing, artDress.ts)
 *   anim:<name>    a creature's clip sheet (creatureAnim.ts), for the hand-built stages that hold one (STAGE_ANIMS)
 *
 * A generated stage's creatures are rolled with the stage, so they are not known ahead: their clip sheets still start loading as the
 * stage starts (engine.ts warmCreatureAnims), as before.
 */
import { HAND_STAGES, W3_PUZZLES } from './protoStage.ts';
import { W2_PUZZLES, W2_STAGES } from './w2Stages.ts';
import { DOT_STAGE_ID, MEECA_STAGE_ID } from './extraStages.ts';
import { CTEST_STAGE_ID } from './stageGenerator.ts';
import { KIT_FRAMES } from './kitAtlasData.ts';
import { KIT_STAGE_ID } from './kitStage.ts';
import type { LevelConfig } from './types.ts';

/**
 * The clip sheets of the creatures in each hand-built stage (the same in every roll of it). stageSheets.test.ts builds each of these
 * stages and fails when this no longer matches what is in them.
 */
export const STAGE_ANIMS: Record<string, readonly string[]> = {
  '1-9': ['boa'],
  '2-5': ['turtle'],
  '2-9': ['guard', 'turtle'],
  '3-3': ['jaguar', 'ocelot'],
  '3-9': ['jaguar', 'ocelot'],
  '5-1': ['spider'],
  '5-2': ['spider'],
  '5-3': ['spider'],
  '5-4': ['spider'],
  '5-5': ['spider'],
};

/** World 1's stages with puzzle rooms (protoStage.ts: the squirrels' lift, the seesaw, the acorn meadow) */
const W1_ROOMS: ReadonlySet<string> = new Set(['1-4', '1-6', '1-7']);

export interface SheetSwitches {
  /** the hand-built stages are on (protoStage.ts protoStageEnabled: everyone) */
  hand: boolean;
  /** the painted platforms are on (protoArt.ts paintedKitEnabled: everyone, unless ?paint=0) */
  paint: boolean;
  /** the control test is on (its 1-2 is the hand-built test stage) */
  ctest: boolean;
}

export function stageSheets(cfg: Pick<LevelConfig, 'id' | 'worldIndex' | 'objectiveType' | 'secret'>, sw: SheetSwitches): string[] {
  // the puzzle kit's test room: World 1's painted ground, the kit's pieces, and World 4's sheet for the trade room's capuchin
  if (cfg.id === KIT_STAGE_ID) return ['kit:1', 'kit-pieces', 'w4-props'];
  if (cfg.id === DOT_STAGE_ID) return ['dot'];
  if (cfg.id === MEECA_STAGE_ID) return ['kit:1', 'kit:5', 'w5-props', 'anim:pell', 'anim:soldier'];
  const w = cfg.worldIndex;
  const built = !cfg.secret && ((sw.ctest && cfg.id === CTEST_STAGE_ID) || (sw.hand && (!!HAND_STAGES[cfg.id] || !!W2_STAGES[cfg.id])));
  const hasKit = w === 1 || !!KIT_FRAMES[w];
  const out: string[] = [];
  // (as engine.ts decides paintKit: a hand-built stage always, any other with a kit of its own when painting is on, never a boss lair)
  if (built || (hasKit && sw.paint && cfg.objectiveType !== 'boss_lair')) {
    out.push('kit:1');
    if (w !== 1 && hasKit) out.push(`kit:${w}`);
  }
  if (built && w >= 2 && w <= 5) out.push(`w${w}-props`);
  // (the control test's water stretches, River logs and Lily pads, are drawn with World 2's river; every mix has one of them)
  if (built && sw.ctest && cfg.id === CTEST_STAGE_ID) out.push('w2-props');
  if (built) for (const a of STAGE_ANIMS[cfg.id] ?? []) out.push(`anim:${a}`);
  // (World 2's puzzle rooms: the reed cages on their pulleys, the ferry's sluice, the court's bell)
  // (World 1's rooms: 1-4's lift, 1-6's seesaw, 1-7's acorns; every World 3 and 4 stage: their puzzle rooms, and Matt's puzzle sheets set
  // in as their dressing, artDress.ts)
  if (built && (W2_PUZZLES.has(cfg.id) || W3_PUZZLES.has(cfg.id) || W1_ROOMS.has(cfg.id) || ((w === 3 || w === 4) && cfg.objectiveType !== 'boss_lair'))) out.push('kit-pieces');
  return out;
}
