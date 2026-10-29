/**
 * Pokey in a cutscene: the standard hero's frames (idle, walk, run, jump, hurt, ko...), the cutscene poses from the library's acting sheets (sneaking, shock,
 * pointing and shouting, sulking, exhaustion, resolve, thinking, sleeping, the view from behind) and the dialogue faces, every one of them repainted on his
 * character model at HD times its old size for the story (storyHd.ts, 2026-10-29: the story had shown the soft first art). The old frame tables still say
 * where each frame hangs (feet, head); his story pages hold the paintings. Every `milo` actor in a story picture is drawn from here (storyArt.ts).
 *
 * A mood is a timed loop over those frames (storyActors.ts moodAt); a walk, a run and a sneak are chosen by the ground (gaitAt), the planted foot of every walk and run frame
 * being measured by the cutter (STD_FOOT), so his feet do not skate when he crosses a picture.
 */
import { STD_FRAMES, STD_STAND_H } from './heroStandardData.ts';
import { stdAlias } from './heroStandard.ts';
import { heroCoatSheet, HERO_UNITS, HERO_SPRITE_SCALE } from './heroSprite.ts';
import { STORY_FRAMES, STD_HEAD, STD_FOOT } from './heroStoryData.ts';
import { hdPage, hdReady, warmHd, type HdSet } from './storyHd.ts';
import { HD_POKEY, HD_POKEY_FRAMES, HD_POKEY_PAGES } from './storyHdData_pokey.ts';
import { gaitAt, gaitNaturalSpeed, moodAt, type GaitSpec, type MoodSpec, type StoryCharacter } from './storyActors.ts';

export type PokeyMood =
  | 'idle' | 'talk' | 'walk' | 'run' | 'sneak' | 'urgent' | 'sad' | 'tired' | 'exhausted' | 'determined' | 'happy' | 'cheer' | 'surprised' | 'worried' | 'scared'
  | 'think' | 'sleep' | 'hurt' | 'ko' | 'look' | 'point' | 'crossed' | 'thumbs' | 'weep' | 'jump' | 'fall' | 'land' | 'punch' | 'duck' | 'away' | 'walkaway' | 'farewell';

/** world units per atlas pixel, the same for the standard atlas and the story atlas (both were scaled to the same standing height) */
export const POKEY_K = (HERO_UNITS * HERO_SPRITE_SCALE) / STD_STAND_H;
export const POKEY_UNITS = HERO_UNITS * HERO_SPRITE_SCALE;

/** [frame, seconds, lift at the start, lift at the end] (lift in standing heights); `once` holds the last frame. See MoodSpec. */
export const POKEY_MOODS: Record<PokeyMood, MoodSpec> = {
  idle: { steps: [['idle', 2.4], ['blink', 0.13], ['idle', 1.6], ['look_a', 1.5], ['idle', 1.9], ['blink', 0.13], ['idle', 0.9], ['blink', 0.13], ['look_up', 1.2]], breath: 0.006 },
  talk: { steps: [['idle', 0.28], ['talk_a', 0.34], ['idle', 0.22], ['talk_b', 0.4], ['idle', 0.3], ['talk_a', 0.26], ['look_a', 0.32], ['talk_b', 0.3]], breath: 0.004 },
  walk: { steps: [['walk_0', 1]] },
  run: { steps: [['run_0', 1]] },
  sneak: { steps: [['sneak_a', 1.1], ['sneak_b', 1.1]], breath: 0.006 },
  urgent: { steps: [['point_a', 0.9], ['shout_up', 0.7], ['point_b', 0.8], ['shout_up', 0.5], ['point_a', 0.7], ['impatient', 0.6]], sway: 0.012, swayHz: 1.1 },
  sad: { steps: [['sad_a', 2.6], ['tired', 0.9], ['sad_a', 2.0], ['tired', 0.9]], breath: 0.007, breathHz: 0.25 },
  tired: { steps: [['tired', 1.7]], breath: 0.022, breathHz: 0.6 },
  exhausted: { steps: [['slump', 2.2], ['wipe', 1.6]], breath: 0.018, breathHz: 0.5 },
  determined: { steps: [['resolve', 2.0], ['crossed', 1.4], ['resolve', 1.6], ['stance', 1.0]], sway: 0.008, swayHz: 0.4 },
  happy: { steps: [['talk_b', 1.1], ['thumbs', 1.0], ['talk_a', 0.8], ['idle', 0.9], ['thumbs', 0.9]], breath: 0.006, bob: 0.01, bobHz: 1.4 },
  cheer: {
    steps: [
      ['cheer_a', 0.25, 0, 0.14], ['cheer_b', 0.25, 0.14, 0], ['cheer_c', 0.3, 0, 0.1], ['cheer_c', 0.3, 0.1, 0], ['cheer_a', 0.25, 0, 0.14], ['cheer_b', 0.25, 0.14, 0], ['thumbs', 0.7],
    ],
  },
  surprised: { steps: [['shock', 0.12, 0, 0.05], ['shock', 0.14, 0.05, 0], ['shock', 1.3], ['alarm', 0.9]], breath: 0.01 },
  worried: { steps: [['worried', 1.6], ['scared', 0.9], ['worried', 1.4], ['look_down', 0.7]], breath: 0.008 },
  scared: { steps: [['scared', 1.0], ['alarm', 0.5], ['scared', 0.8]], sway: 0.014, swayHz: 5.5 },
  think: { steps: [['look_up', 1.4], ['think', 1.8], ['look_down', 1.0], ['think', 1.4]], breath: 0.005 },
  sleep: { steps: [['sleep', 3]], breath: 0.02, breathHz: 0.25 },
  hurt: { steps: [['hurt_a', 0.18], ['hurt_b', 0.5], ['hurt_a', 0.25], ['hurt_b', 0.55]], sway: 0.01, swayHz: 1.2 },
  ko: { steps: [['hurt_c', 0.12, 0, 0.06], ['hurt_c', 0.14, 0.06, 0], ['ko', 1]], once: true },
  look: { steps: [['look_a', 1.8], ['look_up', 1.4], ['look_down', 1.2]], breath: 0.006 },
  point: { steps: [['point_a', 1.6], ['point_b', 1.2]], breath: 0.005 },
  crossed: { steps: [['crossed', 1.5], ['impatient', 1.0]], breath: 0.006 },
  thumbs: { steps: [['thumbs', 1]], breath: 0.006 },
  weep: { steps: [['wipe', 1.8], ['slump', 1.6]], breath: 0.012, breathHz: 0.4 },
  jump: { steps: [['land', 0.14], ['launch', 0.16, 0, 0.2], ['rise', 0.16, 0.2, 0.34], ['apex', 0.2, 0.34, 0.3], ['fall_a', 0.2, 0.3, 0.08], ['land', 0.14], ['recover', 0.2], ['idle', 1]], once: true },
  fall: { steps: [['fall_a', 0.5], ['fall_b', 0.5]] },
  land: { steps: [['land', 0.14], ['recover', 0.2], ['idle', 1]], once: true },
  punch: { steps: [['punch_0', 0.5], ['punch_2', 0.1], ['punch_3', 0.35]] },
  duck: { steps: [['duck', 1]], breath: 0.008 },
  away: { steps: [['away', 2]], breath: 0.006 },
  walkaway: { steps: [['away', 1]] },
  farewell: { steps: [['farewell', 0.55], ['away_c', 0.55]], breath: 0.006 },
};

const WALK = Array.from({ length: 8 }, (_, i) => `walk_${i}`);
const RUN = Array.from({ length: 8 }, (_, i) => `run_${i}`);
const foot = (names: string[]) => names.filter((n) => STD_FOOT[n] !== undefined).map((name) => ({ name, fx: STD_FOOT[name] }));
/** the gaits: the standard walk and run with the planted foot of each frame, a creeping sneak and the walk away from the viewer (frames that follow in order) */
export const POKEY_GAITS: Record<string, GaitSpec> = {
  walk: { frames: foot(WALK), minCadence: 0.5, maxCadence: 2.4, bob: 0.012 },
  run: { frames: foot(RUN), minCadence: 1.1, maxCadence: 4.2, bob: 0.02, dust: true },
  sneak: { frames: [{ name: 'sneak_a' }, { name: 'sneak_b' }], stride: 110, minCadence: 0.4, maxCadence: 1.3, bob: 0.008 },
  walkaway: { frames: [{ name: 'away' }, { name: 'away_a' }, { name: 'away' }, { name: 'away_b' }, { name: 'away_c' }], stride: 130, minCadence: 0.4, maxCadence: 1.4, bob: 0.01 },
};

/** his story paintings (storyHd.ts): every frame below repainted at HD times its old size; until they have loaded he is not drawn */
const HD_SET: HdSet = { hd: HD_POKEY, pages: HD_POKEY_PAGES, frames: HD_POKEY_FRAMES };
/** start fetching his story paintings */
export function warmStoryHero() {
  warmHd('pokey', HD_SET);
}

/** his story paintings have loaded: Pokey can be painted in a cutscene */
export function storyHeroReady(): boolean {
  return hdReady('pokey', HD_SET);
}

/** the frame a name stands for in the story hero: one of the cutscene poses, a standard frame, or an old name that stands in for one; undefined when there is none */
export function pokeyResolve(name: string): string | undefined {
  if (STORY_FRAMES[name]) return name;
  const same = FACE_SAME[name];
  if (same) return same;
  return stdAlias(name);
}

/** the faces of the standard atlas that the dialogue-face sheet draws too: a portrait uses the sheet's own, so a face and its talking mouths are one set of paintings */
const FACE_SAME: Record<string, string> = { face_calm: 'face_neutral', face_surprised: 'face_gasp', face_angry: 'face_scowl' };

/** x of the middle of the head in a frame of either atlas */
function headOf(name: string): number {
  const s = STORY_FRAMES[name];
  if (s) return s.hx;
  return STD_HEAD[name] ?? STD_FRAMES[name]?.hx ?? 0;
}

/**
 * One frame of Pokey, hung by his feet (anchor 1) or his head (anchor 0, or between) at the origin, facing right, POKEY_K world units to the pixel.
 * False while an atlas loads, when the standard hero is off, or for a name with no frame.
 */
export function drawPokeyFrame(ctx: CanvasRenderingContext2D, name: string, anchor = 1): boolean {
  const real = pokeyResolve(name);
  const f = real ? HD_POKEY_FRAMES[real] : undefined;
  const img = f ? hdPage('pokey', f) : null;
  if (!real || !f || !img) return false;
  const sf = STORY_FRAMES[real] ?? STD_FRAMES[real];
  if (!sf) return false;
  const k = POKEY_K / HD_POKEY;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  const x = (anchor * sf.ax + (1 - anchor) * headOf(real)) * HD_POKEY + f.m;
  ctx.drawImage(heroCoatSheet(img), f.x, f.y, f.w, f.h, -x * k, -(sf.ay * HD_POKEY + f.m) * k, f.w * k, f.h * k);
  return true;
}

/** a face portrait: `name` is one of the dialogue faces (face_calm, face_oh...), drawn into the square (x, y, size). False while the art loads. */
export function drawPokeyFace(ctx: CanvasRenderingContext2D, name: string, x: number, y: number, size: number): boolean {
  const real = pokeyResolve(name);
  const f = real ? HD_POKEY_FRAMES[real] : undefined;
  const img = f ? hdPage('pokey', f) : null;
  if (!real || !f || !img) return false;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  // (the painting is the old square grown by m all round: the old square is what fills the window)
  const g = (size / (f.w - 2 * f.m));
  ctx.drawImage(heroCoatSheet(img), f.x, f.y, f.w, f.h, x - f.m * g, y - f.m * g, f.w * g, f.h * g);
  return true;
}

/** the mouth shapes of a talking portrait, in the order a mouth moves: closed, oh, open, oh */
export const VISEMES = ['face_neutral', 'face_oh', 'face_ah', 'face_oh'];

/** Pokey as the story engine's character (storyActors.ts showActor) */
export const POKEY: StoryCharacter = {
  ready: () => storyHeroReady(),
  moods: POKEY_MOODS,
  gaits: POKEY_GAITS,
  resolve: pokeyResolve,
  draw: (ctx, frame, anchor) => drawPokeyFrame(ctx, frame, anchor),
  k: POKEY_K,
  units: POKEY_UNITS,
  rest: 'idle',
};

/** the frame a mood shows at a time, for a test or a preview (a gait shows the frames of its own pace) */
export function pokeyFrame(mood: PokeyMood, time: number): string {
  const g = POKEY_GAITS[mood];
  if (g) return gaitAt(g, time * gaitNaturalSpeed(g), 0).frame;
  return moodAt(POKEY_MOODS[mood] ?? POKEY_MOODS.idle, time).frame;
}
