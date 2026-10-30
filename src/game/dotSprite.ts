/**
 * Dot, the hummingbird, painted. One atlas (src/assets/characters/dot-atlas.webp, cut from the redone Dot sheets) holds
 *   - full-body frames for the cutscenes: a four-frame hover, a perch, and the reactions (yelp, flinch, dizzy, cheer, puzzled, sad, gasp, sleep), and
 *   - face portraits for the pop-ups: five mouth shapes to talk with, and the expressions (surprise, wink, grit, starry, yell, angry, sleepy, side-eye).
 * Every frame is stored the way the sheet drew it; `f` says which way the beak points, so a frame is flipped only when it has to be.
 * The story art and the portrait component both read it; while it loads (or fails) callers fall back to the old backdrop hummingbird.
 */
import { DOT_ATLAS_SIZE, DOT_FRAMES, type DotFrame } from './dotAtlasData.ts';
import { trackAtlas } from './atlasLoader.ts';
import { hdPage, warmHd, type HdSet } from './storyHd.ts';
import { HD_DOT, HD_DOT_FRAMES, HD_DOT_PAGES } from './storyHdData_dot.ts';

export const DOT_ATLAS_URL = new URL('../assets/characters/dot-atlas.webp', import.meta.url).href;
export { DOT_ATLAS_SIZE, DOT_FRAMES };

/** what Dot is doing in a cutscene (`D:yelp` in a cast string); 'hover' is the default, flapping in place */
export type DotPose = 'hover' | 'perch' | 'yelp' | 'flinch' | 'dizzy' | 'cheer' | 'puzzled' | 'sad' | 'gasp' | 'sleep';
const POSE_FRAME: Record<Exclude<DotPose, 'hover'>, string> = {
  perch: 'perch', yelp: 'yelp', flinch: 'flinch', dizzy: 'dizzy', cheer: 'cheer', puzzled: 'puzzled', sad: 'sad', gasp: 'gasp', sleep: 'sleep',
};
export const DOT_POSES: readonly DotPose[] = ['hover', ...(Object.keys(POSE_FRAME) as Exclude<DotPose, 'hover'>[])];
export function isDotPose(v: string | undefined): v is DotPose {
  return v !== undefined && (DOT_POSES as readonly string[]).includes(v);
}

/** the portrait faces: the first five are mouth shapes */
export type DotFaceName = 'closed' | 'small' | 'ee' | 'ah' | 'oh' | 'surprise' | 'wink' | 'grit' | 'starry' | 'yell' | 'angry' | 'sleepy' | 'side';
export const DOT_FACES: readonly DotFaceName[] = ['closed', 'small', 'ee', 'ah', 'oh', 'surprise', 'wink', 'grit', 'starry', 'yell', 'angry', 'sleepy', 'side'];
export function isDotFace(v: string | undefined): v is DotFaceName {
  return v !== undefined && (DOT_FACES as readonly string[]).includes(v);
}

/** the flap, as the frames it passes through (a ping-pong over the four hover paintings) */
const FLY = ['fly0', 'fly1', 'fly2', 'fly3', 'fly2', 'fly1'];
const FLY_FPS = 11;
export function flyFrame(t: number): string {
  return FLY[Math.floor(Math.max(0, t) * FLY_FPS) % FLY.length];
}

/** the mouth shapes of a few syllables of Dot talking: never the same shape twice in a row, and back to rest between words */
const TALK = ['small', 'ah', 'closed', 'ee', 'small', 'oh', 'closed', 'ah', 'ee', 'small', 'closed', 'oh'] as const;
const TALK_FPS = 8;
export function talkFace(t: number): DotFaceName {
  return TALK[Math.floor(Math.max(0, t) * TALK_FPS) % TALK.length];
}

/** the expression Dot holds when he is not speaking, from what he has just said (a fall gets a start, a question a raised look) */
export function restFace(text: string, afterHurt = false): DotFaceName {
  if (afterHurt) return 'surprise';
  const t = text.trim();
  if (/\?\s*["”']?$/.test(t)) return 'side';
  if (/\b(honestly|obviously|of course|just saying)\b/i.test(t)) return 'wink';
  if (/!\s*["”']?$/.test(t)) return 'grit';
  return 'closed';
}

/** the box every portrait sits in (the biggest of them), so a talking face does not jump about as its beak opens */
const FACE_FRAMES = DOT_FACES.map((n) => DOT_FRAMES[n]).filter((f): f is DotFrame => !!f);
export const FACE_BOX = { w: Math.max(...FACE_FRAMES.map((f) => f.w)), h: Math.max(...FACE_FRAMES.map((f) => f.h)) };

let atlas: HTMLImageElement | null = null;
let ready = false;
function load() {
  if (atlas || typeof Image === 'undefined') return;
  const img = new Image();
  atlas = img;
  trackAtlas(img, DOT_ATLAS_URL, () => { ready = true; }, () => { atlas = null; ready = false; });
}
/** start fetching the picture (cheap to call again) */
export function warmDot() {
  load();
}
export function dotReady(): boolean {
  load();
  return ready && !!atlas;
}

/**
 * Draw one painted frame with its middle at (x, y). `k` is canvas pixels per atlas pixel, `face` the way Dot should look (-1 left, 1 right).
 * Returns false when the atlas is not loaded or the frame does not exist (the caller then draws its fallback).
 */
export function drawDotFrame(ctx: CanvasRenderingContext2D, name: string, x: number, y: number, k: number, face: -1 | 1, tilt = 0): boolean {
  const f = DOT_FRAMES[name];
  if (!f || !dotReady() || !atlas) return false;
  ctx.save();
  ctx.translate(x, y);
  if (tilt) ctx.rotate(tilt * face);
  if (f.f !== face) ctx.scale(-1, 1);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(atlas, f.x, f.y, f.w, f.h, (-f.w * k) / 2, (-f.h * k) / 2, f.w * k, f.h * k);
  ctx.restore();
  return true;
}

/** her story paintings (storyHd.ts): every frame repainted at HD times its old size, for the story pictures */
const HD_SET: HdSet = { hd: HD_DOT, pages: HD_DOT_PAGES, frames: HD_DOT_FRAMES };
export function warmStoryDot() {
  warmHd('dot', HD_SET);
}
/** drawDotFrame from her story paintings (`k` still canvas pixels per pixel of the old frame); false while they load */
export function drawDotStoryFrame(ctx: CanvasRenderingContext2D, name: string, x: number, y: number, k: number, face: -1 | 1, tilt = 0): boolean {
  const f = DOT_FRAMES[name];
  const hf = HD_DOT_FRAMES[name];
  const img = hf ? hdPage('dot', hf) : null;
  if (!f || !hf || !img) return false;
  const kh = k / HD_DOT;
  ctx.save();
  ctx.translate(x, y);
  if (tilt) ctx.rotate(tilt * face);
  if (f.f !== face) ctx.scale(-1, 1);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, hf.x, hf.y, hf.w, hf.h, (-hf.w * kh) / 2, (-hf.h * kh) / 2, hf.w * kh, hf.h * kh);
  ctx.restore();
  return true;
}

/** the painted frame for a pose at time t (the hover flaps; the others hold) */
export function poseFrame(pose: DotPose, t: number): string {
  return pose === 'hover' ? flyFrame(t) : POSE_FRAME[pose];
}
