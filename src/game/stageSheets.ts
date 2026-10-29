/**
 * stageSheets — which picture sheets a stage draws from its first moments, so they can be loaded, decoded and drawn once before it
 * starts (stagePreload.ts), behind the world map, the stage-cleared card, a story or a boss intro. Pure: no pictures here, so the tests
 * can check the list for every stage.
 *
 * Only what that one stage needs (atlasLoader.ts: a decoded sheet is 10 to 46 MB, and a world's sheets are let go when play moves on):
 *   kit:<w>        the painted platforms: World 1's atlas (every piece) and the world's own kit (engine.ts paintKit)
 *   w2/w3/w4/w5-props a hand-built World 2, 3, 4 or 5 stage's dressing (riverArt.ts, w3Art.ts, w4Art.ts, w5Art.ts)
 *   dot            Dot's flight (4-D): her pieces, her frames and the four paintings behind the netting (dotFlightArt.ts)
 *   Meeca's stage (5-M): World 5's kit and dressing, the puzzle kit's pieces, her own sheets (meeca-standard, her carving and the
 *                  blanket, and the night sheet of her new poses and the stage's props, meecaNightArt.ts), and Pell's and the soldiers'
 *                  clip sheets, and Flicker's (meecaArt.ts)
 *   kit-pieces     the puzzle kit's pieces and Pokey's carry poses (puzzleArt.ts), for a stage with puzzle rooms (the test room, 'kit',
 *                  World 1's rooms, World 2's W2_PUZZLES, World 3's W3_PUZZLES, gen2's 5-9), every World 3 and 4 stage (its dressing,
 *                  artDress.ts)
 *   water-signs    the painted warning signs at the water's edge (waterSign.ts), for a gen2 stage with water
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
import { gen2Water, isGen2Stage } from './gen2/game.ts';
import { W5_ROOM_STAGES } from './gen2/worlds/w5.ts';
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
  // (the new generator's World 5 stages, gen2/game.ts: their jumping spiders in every shipped roll)
  '5-7': ['spider'],
  '5-9': ['spider'],
};

/** the gen2 stages that hold puzzle rooms (5-9's arena gates: the cake room, the tea room) */
const GEN2_ROOMS: ReadonlySet<string> = new Set<string>(W5_ROOM_STAGES);

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
  if (cfg.id === MEECA_STAGE_ID) return ['kit:1', 'kit:5', 'w5-props', 'kit-pieces', 'meeca', 'meeca-night', 'anim:pell', 'anim:soldier', 'anim:flicker'];
  const w = cfg.worldIndex;
  // (a gen2 stage is built like a hand-built one, with World 5's dressing, whatever the switch: gen2/game.ts)
  const built = !cfg.secret && ((sw.ctest && cfg.id === CTEST_STAGE_ID) || (sw.hand && (!!HAND_STAGES[cfg.id] || !!W2_STAGES[cfg.id])) || isGen2Stage(cfg));
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
  if (built && (W2_PUZZLES.has(cfg.id) || W3_PUZZLES.has(cfg.id) || W1_ROOMS.has(cfg.id) || GEN2_ROOMS.has(cfg.id) || ((w === 3 || w === 4) && cfg.objectiveType !== 'boss_lair'))) out.push('kit-pieces');
  if (isGen2Stage(cfg) && gen2Water(cfg.id)) out.push('water-signs');
  return out;
}
