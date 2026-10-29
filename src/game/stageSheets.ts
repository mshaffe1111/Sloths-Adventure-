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
 *   foe:<name>     a creature's sheets: its clip sheet if it has one (creatureAnim.ts) and its painted poses (spriteSheets.ts), by the
 *                  name sheetWarm.ts animOf gives it (a snake is 'goldsnake', a royal turtle 'guard'). A hand-built stage's are listed in
 *                  STAGE_DRAWS (the same in every roll: its animals, a ring's drop-ins and the eagle over a watched stretch); a generated
 *                  stage's are rolled with it, so it gets every creature its world's generator can place (GEN_FOES), and a boss lair
 *                  the minions its boss calls in (BOSS_MINIONS)
 *   water-signs    the painted warning signs at the water's edge (waterSign.ts), for a gen2 stage with water
 *   bad-water      Worlds 6-10's dirty, fast water (badWaterArt.ts), for a gen2 stage with water
 *   anim:<name>    a clip sheet on its own (Meeca's stage: Pell and the soldiers)
 *   props2         World 1's second sheet (bushes, trunk hollows: protoArt.ts PROTO2_URL), for the stages that have them (STAGE_DRAWS)
 *   perch          Dot's perched poses (components/hud/painted.tsx), in every stage she flies in
 *
 * (QA 2026-10-29, Android Chrome: 'blank wait' at 80 s and 179 s for the golden snake's heads and the snake sheet, at 201 s for the
 * eagle, at 650 s for Dot's perch: those sheets were asked for only when each first came on screen. stageSheets.test.ts builds every
 * stage on rolls 1-3 and fails when a sheet it draws is not in its list.) The engine still asks for the built stage's own creatures
 * as it starts (sheetWarm.ts warmStageSheets), for a roll that holds something these lists did not foresee.
 */
import { HAND_STAGES, W3_PUZZLES } from './protoStage.ts';
import { W2_PUZZLES, W2_STAGES } from './w2Stages.ts';
import { DOT_STAGE_ID, MEECA_STAGE_ID } from './extraStages.ts';
import { SLIDE_STAGE_ID } from './w7Slide.ts';
import { CTEST_STAGE_ID } from './stageGenerator.ts';
import { KIT_FRAMES } from './kitAtlasData.ts';
import { KIT_STAGE_ID } from './kitStage.ts';
import { gen2Water, isGen2Stage } from './gen2/game.ts';
import { W5_ROOM_STAGES } from './gen2/worlds/w5.ts';
import { W6_ROOM_STAGES } from './gen2/worlds/w6.ts';
import type { LevelConfig } from './types.ts';

/**
 * What each hand-built stage draws beyond its kit and dressing, the same in every roll of it: its creatures (foe:, sheetWarm.ts
 * stageAnims names: its animals, a ring's drop-ins, the eagle over a watched stretch) and the second World 1 sheet where it has bushes
 * or hollows (props2, sheetWarm.ts stageExtras). stageSheets.test.ts builds each stage on rolls 1-3 and fails when this does not cover it.
 */
export const STAGE_DRAWS: Record<string, readonly string[]> = {
  '1-3': ['foe:goldsnake'],
  '1-4': ['foe:goldsnake', 'props2'],
  '1-5': ['foe:goldsnake'],
  '1-6': ['foe:goldsnake'],
  '1-7': ['foe:eagle', 'props2'],
  '1-8': ['foe:goldsnake'],
  '1-9': ['foe:boa', 'foe:goldsnake'],
  '2-2': ['foe:goldsnake'],
  '2-5': ['foe:turtle'],
  '2-6': ['foe:goldsnake'],
  '2-7': ['foe:goldsnake'],
  '2-8': ['foe:goldsnake'],
  '2-9': ['foe:guard', 'foe:turtle'],
  '3-2': ['foe:eagle', 'props2'],
  '3-3': ['foe:jaguar', 'foe:ocelot'],
  '3-4': ['props2'],
  '3-7': ['foe:eagle', 'props2'],
  '3-9': ['foe:jaguar', 'foe:ocelot'],
  '4-1': ['foe:goldsnake', 'props2'],
  '4-5': ['foe:eagle', 'props2'],
  '4-6': ['foe:goldsnake', 'props2'],
  '5-1': ['foe:spider'],
  '5-2': ['foe:spider'],
  '5-3': ['foe:spider'],
  '5-4': ['foe:spider'],
  '5-5': ['foe:spider'],
  '5-7': ['foe:spider'],
  '5-9': ['foe:spider'],
};

/** the control test's mixes (1-2 with the control test on): every creature any of them holds */
const CTEST_FOES: readonly string[] = ['boa', 'eagle', 'goldsnake', 'turtle'];

/**
 * Every creature the old generator can place in a world (stageGenerator.ts: a snake or, from World 4, a tayra in a plain slot; the
 * world's hard kinds, hardKind, an ocelot where a jaguar or caiman has no room; a harpy from World 6; the eagle). A generated stage's are
 * rolled with it, so all of them are asked for: the world's sheets are held while play stays in it anyway, and let go as it leaves.
 */
const HARD_KINDS: Record<number, readonly string[]> = {
  2: ['ocelot', 'caiman', 'frog'],
  3: ['ocelot', 'boa', 'frog'],
  4: ['ocelot', 'tayra'],
  5: ['tayra', 'boa', 'ocelot'],
  6: ['caiman', 'boa', 'ocelot', 'jaguar', 'frog'],
  7: ['jaguar', 'ocelot', 'boa', 'caiman'],
  8: ['jaguar', 'tayra', 'ocelot', 'boa'],
  9: ['jaguar', 'boa', 'tayra', 'caiman', 'ocelot'],
  10: ['jaguar', 'boa', 'tayra', 'caiman', 'ocelot'],
};
export function genFoes(world: number): string[] {
  const out = new Set<string>(['goldsnake', 'eagle']);
  if (world >= 2) for (const k of HARD_KINDS[Math.min(10, world)] ?? []) out.add(k);
  if (world >= 4) out.add('tayra');
  if (world >= 6) out.add('harpy');
  return [...out];
}

/** the minions a world's boss calls into its lair mid-fight (bossDefs.ts spawnMinion / dropMinion) */
const BOSS_MINIONS: Record<number, readonly string[]> = { 1: ['goldsnake'], 5: ['spider'], 6: ['tayra'], 10: ['ocelot'] };

/** the gen2 stages that hold puzzle rooms (5-9's arena gates: the cake room, the tea room; 6-3, 6-6 and 6-7's rooms) */
const GEN2_ROOMS: ReadonlySet<string> = new Set<string>([...W5_ROOM_STAGES, ...W6_ROOM_STAGES]);

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
  if (cfg.id === KIT_STAGE_ID) return ['kit:1', 'kit-pieces', 'w4-props', 'perch'];
  if (cfg.id === DOT_STAGE_ID) return ['dot'];
  // 7-4's slide (w7Slide.ts): World 7's kit for the hall and the chamber (the slide's own pictures load as it starts: w7SlideArt.ts
  // warmSlide), and Dot's perch as on every stage (her guide is still the engine's, though World 7 gives her no lines)
  if (cfg.id === SLIDE_STAGE_ID && sw.hand && !cfg.secret) return ['kit:1', 'kit:7', 'perch'];
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
  // the creatures it can draw, and their sheets (see foe: above)
  if (cfg.objectiveType === 'boss_lair') for (const f of BOSS_MINIONS[w] ?? []) out.push(`foe:${f}`);
  else if (!built) for (const f of genFoes(w)) out.push(`foe:${f}`);
  // (World 6 on gen2 on: a stage's animals, the eagle and the bushes change from roll to roll, so it asks for the world's whole set)
  else if (isGen2Stage(cfg) && w >= 6) out.push(...genFoes(w).map((f) => `foe:${f}`), 'props2');
  else if (sw.ctest && cfg.id === CTEST_STAGE_ID) out.push(...CTEST_FOES.map((f) => `foe:${f}`), 'props2');
  else out.push(...(STAGE_DRAWS[cfg.id] ?? []));
  // (World 2's puzzle rooms: the reed cages on their pulleys, the ferry's sluice, the court's bell)
  // (World 1's rooms: 1-4's lift, 1-6's seesaw, 1-7's acorns; every World 3 and 4 stage: their puzzle rooms, and Matt's puzzle sheets set
  // in as their dressing, artDress.ts)
  if (built && (W2_PUZZLES.has(cfg.id) || W3_PUZZLES.has(cfg.id) || W1_ROOMS.has(cfg.id) || GEN2_ROOMS.has(cfg.id) || ((w === 3 || w === 4) && cfg.objectiveType !== 'boss_lair'))) out.push('kit-pieces');
  if (isGen2Stage(cfg) && gen2Water(cfg.id)) out.push('water-signs');
  // (World 6 on: its creeks and its tide are the dirty, fast water)
  if (isGen2Stage(cfg) && w >= 6) out.push('bad-water');
  // Dot's perched poses: she perches in every stage (not her own flight, nor Meeca's stage, which has no Dot)
  out.push('perch');
  return out;
}
