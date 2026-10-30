/**
 * stageManifest — every picture sheet a BUILT stage can draw, read off what the stage holds, so all of them are loaded, decoded and drawn
 * once before its first frame (stageReady.ts). Pure: no pictures here, so the tests can check it for every stage.
 *
 * stageSheets.ts lists a stage's sheets from its config alone, before it is built (behind the world map, a story, the stage-cleared
 * card). That list has to guess at what a roll will hold. Once the engine has built the stage, this reads the real contents instead, in
 * the same keys (stagePreload.ts start):
 *   foe:<name>    every creature it holds, the animals a ring drops in, the eagle over a watched stretch (sheetWarm.ts stageAnims)
 *   props2        bushes, trunk hollows, or a liana (it hangs from a painted bush): World 1's second sheet
 *   vine, rope    Pokey on a liana, on a shimmy rope (and the painted rope)
 *   boss:<w>      the world's guardian, or World 4's watcher (asked for by drawing a still of it off screen: stageReady.ts), and
 *                 for a guardian World 4's sheet (its rocks and stone debris)
 *   meeca-standard Meeca waiting to be rescued (the boss lairs and the rescue stages)
 *   meeca-night   her night poses, in a World 5 stage with puzzle rooms
 *   w2-props      a river (World 2's logs and pads, wherever a river runs)
 *   bad-water     Worlds 6-10's dirty water, when the stage has water
 *   bounce        the bounce mushrooms
 *   crumble-tile  the painted crumbling tiles, when it has any
 *   crumble       World 7's set (stageSheets.ts), every World 7 stage but the lair
 * plus what every stage shows (ALWAYS): the HUD sheet and Dot's perch, Pokey's moving clips and the keepsake pickups.
 *
 * QA's control-test runs (2026-10-30): a freeze right after 'hud-atlas' and 'crumble' finished loading on every run (127-761 ms), and
 * 279-730 ms freezes as 'props2', the eagle's, the turtle's and the golden snake's sheets arrived mid-run.
 */
import { stageAnims, stageExtras, type StageDraws } from './sheetWarm.ts';

/** the sheets every stage draws or may draw from its first frame, whatever it holds */
export const ALWAYS: readonly string[] = ['hud', 'perch', 'hero-clips', 'pickups'];

/** the backdrop strips a stage reveals at its top (paintedBackdrops.ts revealSet: 6-8's crown) */
export interface RevealStrips {
  far: string;
  mid: string;
  near: string;
}

/** the parts of a built stage (stageGenerator.ts GeneratedStage) that say what it draws */
export interface BuiltStage extends StageDraws {
  config: { worldIndex: number; id: string; secret?: string };
  platforms: ReadonlyArray<{ type?: string; crumbleAfter?: number }>;
  boss?: unknown;
  proto?: (NonNullable<StageDraws['proto']> & { reveal?: { strips: RevealStrips } }) | null;
  daisyX?: number;
  kit?: unknown;
  rivers?: readonly unknown[];
  waterY?: number;
}

/** the strips this stage reveals at its top, if any (got in by stageReady.ts with the stage's own backdrop) */
export const revealOf = (st: BuiltStage): RevealStrips | null => st.proto?.reveal?.strips ?? null;

export function builtStageKeys(st: BuiltStage): string[] {
  const out = new Set<string>(ALWAYS);
  for (const n of stageAnims(st)) out.add(`foe:${n}`);
  const x = stageExtras(st);
  // (a liana hangs from a painted bush off the same sheet: protoArt.ts, the control test's mix 99 at 50 s)
  if (x.props2 || x.vine) out.add('props2');
  if (x.vine) out.add('vine');
  if (x.rope) out.add('rope');
  const w = st.config.worldIndex;
  if (st.boss) {
    out.add(`boss:${w}`);
    // (a boss's thrown rocks and the stone bursting off a pillar are World 4's painted pieces: bossArt.ts, 7-10 at 6 s)
    out.add('w4-props');
  }
  // (World 7's crumbling tiles, bank faces, temple walls and puzzle pieces: every stage but the guardian's lair, 7-4's slide too, whose
  // hall's temple walls came in 6 s into it)
  if (!st.boss && w === 7 && !st.config.secret) out.add('crumble');
  // (World 4's watcher over a watched stretch is the Sky Sovereign herself, in her painted boss frames: engine.ts, 4-5 at 6 s)
  if (w === 4 && st.proto?.watch?.length) out.add('boss:4');
  if (st.daisyX !== undefined) out.add('meeca-standard');
  // (a World 5 stage with puzzle rooms shows Meeca in her night poses: meecaArt.ts, 5-9 at 15 s)
  if (w === 5 && st.kit) out.add('meeca-night');
  if (st.rivers?.length) out.add('w2-props');
  if (w >= 6 && (st.waterY !== undefined || !!st.rivers?.length)) out.add('bad-water');
  if (st.platforms.some((p) => p.type === 'bouncy')) out.add('bounce');
  if (st.platforms.some((p) => p.crumbleAfter !== undefined)) out.add('crumble-tile');
  return [...out];
}
