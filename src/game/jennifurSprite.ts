/**
 * Painted Meeca, Pokey's girlfriend (the Heartbloom keeper in the pink "07" running kit), from the Gemini pose sheets. Used wherever
 * she appears: the captive in the final stage, the rescue, and every story card and cutscene. Like the other painted creatures it is a
 * switch: `?jennifur=sprite|classic`, `localStorage.sloth_jennifur = 'sprite'`; the vector Meeca draws while the atlas loads or when off.
 *
 * She is a little animation player: each mood is a timed loop over the sheet's frames, so she is never a still picture.
 *   scared      captive: shivers, looks about, laments, waves her arms, hops in panic
 *   scaredwave  waving both arms in alarm (calling out as she is carried off)
 *   sad         sad idle, sobbing, wiping her tears
 *   happy       calm and glad: hands on hips, a wave, a laugh
 *   cheer       rescued: hops, fist pumps, victory dance
 */
import { trackAtlas } from './atlasLoader.ts';
import { JENNIFUR_FRAMES } from './jennifurAtlasData.ts';

export type JennifurMood = 'scared' | 'scaredwave' | 'sad' | 'happy' | 'cheer';

export const DEFAULT_SPRITE_JENNIFUR = true;
/** world units per atlas pixel: she stands about as tall as the vector Meeca did */
const K = 0.46;

/** [frame, seconds] loops */
const LOOPS: Record<JennifurMood, Array<[string, number]>> = {
  scared: [['scared', 1.0], ['shiver', 0.3], ['scared', 0.25], ['shiver', 0.3], ['lookL', 0.6], ['lookR', 0.6], ['lament', 0.9], ['wave1', 0.22], ['wave2', 0.22], ['wave1', 0.22], ['wave2', 0.22], ['hopstart', 0.2], ['hopup', 0.2], ['air1', 0.18], ['air2', 0.18], ['landing', 0.3]],
  scaredwave: [['wave1', 0.22], ['wave2', 0.22], ['flap', 0.22], ['wave2', 0.22]],
  sad: [['sad', 1.3], ['sob', 0.5], ['wipe', 0.8], ['sob', 0.5], ['sad', 1.0], ['slump', 1.2]],
  happy: [['winner', 1.2], ['wave', 0.9], ['winner', 1.2], ['laugh', 0.5]],
  cheer: [['cheer', 0.4], ['jhop', 0.26], ['vjump', 0.26], ['fists', 0.4], ['dance', 0.26], ['laugh', 0.3], ['wave', 0.5]],
};
const TOTALS = Object.fromEntries(Object.entries(LOOPS).map(([k, v]) => [k, v.reduce((a, [, d]) => a + d, 0)])) as Record<JennifurMood, number>;

let enabled: boolean | null = null;
let atlas: HTMLImageElement | null = null;
let ready = false;

function isEnabled() {
  if (enabled !== null) return enabled;
  let v = DEFAULT_SPRITE_JENNIFUR;
  try {
    const q = new URLSearchParams(location.search).get('jennifur');
    if (q === 'sprite') v = true;
    else if (q === 'classic') v = false;
    else if (localStorage.getItem('sloth_jennifur') === 'sprite') v = true;
  } catch {
    /* no window or storage: keep the default */
  }
  enabled = v;
  return v;
}

function active() {
  if (!isEnabled() || typeof Image === 'undefined') return false;
  if (!atlas) {
    const img = new Image();
    atlas = img;
    trackAtlas(img, new URL('../assets/characters/jennifur-atlas.webp', import.meta.url).href, () => { ready = true; }, () => { atlas = null; });
  }
  return ready;
}

/** true once the painted Meeca can draw (so a caller can lay a shadow under her only then) */
export function jennifurSpriteReady(): boolean {
  return active();
}

/** the frame a mood shows at a time */
export function jennifurFrame(mood: JennifurMood, time: number): string {
  const loop = LOOPS[mood];
  let t = ((time % TOTALS[mood]) + TOTALS[mood]) % TOTALS[mood];
  for (const [name, d] of loop) {
    if (t < d) return name;
    t -= d;
  }
  return loop[0][0];
}

/**
 * Draws Meeca with her feet at the origin, facing right (the caller mirrors her); `scale` multiplies her usual size.
 * Returns false (drawing nothing) while the atlas loads or when the painted version is switched off.
 */
export function drawJennifurSprite(ctx: CanvasRenderingContext2D, mood: JennifurMood, time: number, scale = 1): boolean {
  if (!active() || !atlas) return false;
  const f = JENNIFUR_FRAMES[jennifurFrame(mood, time)];
  if (!f) return false;
  const k = K * scale;
  ctx.drawImage(atlas, f.x, f.y, f.w, f.h, -f.ax * k, -f.ay * k, f.w * k, f.h * k);
  return true;
}
