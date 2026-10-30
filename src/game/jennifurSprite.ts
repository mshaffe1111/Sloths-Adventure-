/**
 * Painted Meeca, Pokey's girlfriend (the Heartbloom keeper in the pink "07" running kit). Used wherever she appears: the captive in the final stage, the rescue, and every
 * story card and cutscene. Like the other painted creatures it is a switch: `?jennifur=sprite|classic`, `localStorage.sloth_jennifur = 'sprite'`; the vector Meeca draws
 * while the atlas loads or when off.
 *
 * Her art is meeca-standard.webp (scripts/cutMeeca.py): the six standard-set sheets Matt drew (idle and head tilts, walk and run, jump and climb, crawl and swing,
 * object handling, hit and defeat) plus the frames of the first atlas that no new sheet draws yet (scared, sad, sobbing, wiping her tears, the alarmed wave).
 *
 * She is a little animation player: each mood is a timed loop over those frames (storyActors.ts: moodAt), a walk or run is chosen by the ground (gaitAt), so she
 * is never a still picture. The moods and the frames each plays are the tables below.
 */
import { hdPage, hdReady, warmHd, type HdSet } from './storyHd.ts';
import { HD_MEECA, HD_MEECA_FRAMES, HD_MEECA_PAGES } from './storyHdData_meeca.ts';
import { trackAtlas } from './atlasLoader.ts';
import { MEECA_FRAMES, MEECA_STAND_H } from './meecaStandardData.ts';
import { gaitAt, gaitNaturalSpeed, moodAt, type GaitSpec, type MoodSpec, type StoryCharacter } from './storyActors.ts';

export type JennifurMood =
  | 'idle' | 'talk' | 'happy' | 'laugh' | 'sing' | 'think' | 'surprised' | 'sad' | 'sob' | 'scared' | 'scaredwave' | 'cheer'
  | 'walk' | 'run' | 'sadwalk' | 'jump' | 'fall' | 'land' | 'climb' | 'hurt' | 'ko' | 'crouch' | 'pickup' | 'wave' | 'sleepy';

export const DEFAULT_SPRITE_JENNIFUR = true;
/** how tall she stands, in world units (the first Meeca was 91 tall, Pokey is 89) */
export const MEECA_UNITS = 90;
/** world units per atlas pixel */
const K = MEECA_UNITS / MEECA_STAND_H;

/**
 * The moods. A step is [frame, seconds, lift at the start, lift at the end] (lift in standing heights: a jump is 0.2 or so). `once` holds the last frame.
 * The standing frames differ a little in how they are drawn, so a loop stays on one for a second or more and only blinks and speaks in quick swaps.
 */
export const MEECA_MOODS: Record<JennifurMood, MoodSpec> = {
  idle: { steps: [['idle', 2.4], ['blink', 0.12], ['idle', 1.5], ['tilt', 1.5], ['idle', 1.8], ['blink', 0.12], ['idle', 0.8], ['blink', 0.12], ['look_a', 1.2]], breath: 0.006 },
  talk: { steps: [['idle', 0.24], ['glad', 0.3], ['idle', 0.18], ['glad', 0.38], ['idle_b', 0.2], ['glad', 0.26], ['tilt', 0.3], ['glad', 0.22]], breath: 0.005 },
  happy: { steps: [['glad', 1.1], ['blink', 0.12], ['glad', 0.9], ['sing', 0.8], ['idle_b', 0.9], ['glad', 1.0]], breath: 0.007, sway: 0.012, swayHz: 0.5 },
  laugh: { steps: [['glad', 0.16], ['sing', 0.16], ['glad', 0.12], ['sing', 0.18], ['glad', 0.14], ['blink', 0.1]], bob: 0.014, bobHz: 4.2 },
  sing: { steps: [['sing', 1.5], ['breathe', 0.5], ['sing', 1.2], ['blink', 0.14], ['sing', 1.0]], breath: 0.008, sway: 0.03, swayHz: 0.45 },
  think: { steps: [['tilt', 1.3], ['look_a', 1.1], ['look_up', 1.4], ['tilt', 1.0]], breath: 0.005 },
  surprised: { steps: [['idle_b', 0.1, 0, 0.05], ['idle_b', 0.12, 0.05, 0], ['alarm', 0.6], ['idle_b', 1.4], ['blink', 0.12], ['idle_b', 1.1]], breath: 0.01 },
  sad: { steps: [['sad', 2.4], ['wipe', 1.3], ['sad', 1.9], ['slump', 1.6]], breath: 0.006 },
  sob: { steps: [['sob', 0.55], ['lament', 0.5], ['sob', 0.5], ['wipe', 0.7]], bob: 0.006, bobHz: 3.4 },
  scared: { steps: [['scared', 1.0], ['shiver', 0.3], ['scared', 0.25], ['shiver', 0.3], ['look_l', 0.9], ['scared', 0.4], ['lament', 0.9], ['alarm', 0.35], ['scared', 0.6]], sway: 0.012, swayHz: 5 },
  scaredwave: { steps: [['alarm', 0.22], ['panic_up', 0.22, 0.02, 0.06], ['alarm', 0.22], ['panic_up', 0.22, 0.06, 0.02]], bob: 0.01, bobHz: 2.4 },
  cheer: {
    steps: [
      ['sing', 0.4], ['crouch', 0.16], ['jump_up', 0.2, 0, 0.26], ['leap', 0.22, 0.26, 0.3], ['jump_fall', 0.2, 0.3, 0.05], ['land_b', 0.14], ['glad', 0.4],
      ['crouch', 0.16], ['jump_up', 0.2, 0, 0.22], ['jump_tuck', 0.18, 0.22, 0.26], ['jump_fall', 0.2, 0.26, 0.04], ['land_b', 0.14], ['sing', 0.5], ['wave', 0.5],
    ],
  },
  walk: { steps: [['walk_0', 1]] },
  run: { steps: [['run_0', 1]] },
  sadwalk: { steps: [['dwalk_a', 1]] },
  jump: { steps: [['crouch', 0.16], ['jump_up', 0.2, 0, 0.28], ['jump_tuck', 0.18, 0.28, 0.34], ['jump_fall', 0.22, 0.34, 0.06], ['land_b', 0.14], ['land_c', 0.16], ['idle', 1]], once: true },
  fall: { steps: [['jump_fall', 1]] },
  land: { steps: [['land_b', 0.12], ['land_c', 0.2], ['idle', 1]], once: true },
  climb: { steps: [['climb_0', 0.14], ['climb_1', 0.14], ['climb_2', 0.14], ['climb_3', 0.14], ['climb_4', 0.14], ['climb_5', 0.14]] },
  hurt: { steps: [['hurt_a', 0.2], ['hurt_b', 0.5], ['hurt_a', 0.25], ['hurt_b', 0.55]], sway: 0.01, swayHz: 1.2 },
  ko: { steps: [['knock_a', 0.12, 0, 0.06], ['knock_b', 0.2, 0.06, 0], ['kneel_a', 0.4], ['lie', 0.5], ['prone_a', 1]], once: true },
  crouch: { steps: [['crouch', 1]], breath: 0.008 },
  pickup: { steps: [['pickup', 1]], breath: 0.006 },
  wave: { steps: [['wave', 0.55], ['glad', 0.4], ['wave', 0.55], ['idle', 0.4]], breath: 0.006 },
  sleepy: { steps: [['sleepy', 2.4], ['blink', 0.3], ['sleepy', 1.8]], breath: 0.012, breathHz: 0.22 },
};

const walkFrames = Array.from({ length: 8 }, (_, i) => `walk_${i}`).filter((n) => MEECA_FRAMES[n]);
const runFrames = Array.from({ length: 7 }, (_, i) => `run_${i}`).filter((n) => MEECA_FRAMES[n]);
/** the gaits: the frames with the planted foot of each (from the cutter), and the steps a second her legs can manage */
export const MEECA_GAITS: Record<string, GaitSpec> = {
  walk: { frames: walkFrames.map((name) => ({ name, fx: MEECA_FRAMES[name].fx })), minCadence: 0.5, maxCadence: 2.4, bob: 0.012 },
  run: { frames: runFrames.map((name) => ({ name, fx: MEECA_FRAMES[name].fx })), minCadence: 1.1, maxCadence: 4.2, bob: 0.02, dust: true },
  // a dejected shuffle: two frames, one cycle is two steps
  sadwalk: { frames: [{ name: 'dwalk_a' }, { name: 'dwalk_b' }], stride: 120, minCadence: 0.35, maxCadence: 1.1, bob: 0.008 },
};

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

/** her standard sheet (walk, run, jump, climb, the moods) */
export const MEECA_STANDARD_URL = new URL('../assets/characters/meeca-standard.webp', import.meta.url).href;

function active() {
  if (!isEnabled() || typeof Image === 'undefined') return false;
  if (!atlas) {
    const img = new Image();
    atlas = img;
    trackAtlas(img, MEECA_STANDARD_URL, () => { ready = true; }, () => { atlas = null; });
  }
  return ready;
}

/** true once the painted Meeca can draw (so a caller can lay a shadow under her only then) */
export function jennifurSpriteReady(): boolean {
  return active();
}

/** the frame a mood shows at a time (a walk or a run shows the frames of her own pace) */
export function jennifurFrame(mood: JennifurMood, time: number): string {
  const spec = MEECA_MOODS[mood] ?? MEECA_MOODS.idle;
  const g = MEECA_GAITS[mood];
  if (g) return gaitAt(g, time * gaitNaturalSpeed(g), 0).frame;
  return moodAt(spec, time).frame;
}

/**
 * One frame of Meeca with her feet (anchor 1) or her head (anchor 0, or in between) at the origin, facing right, drawn `K` world units to the pixel times `scale`.
 * `flipped` says the caller has mirrored the canvas (she faces left): the number on her bib is then turned back, so it reads 07 and not 70.
 * False while the atlas loads, when the painted version is switched off, or for a name she has no frame for.
 */
export function drawMeecaFrame(ctx: CanvasRenderingContext2D, name: string, anchor = 1, scale = 1, flipped = false): boolean {
  if (!active() || !atlas) return false;
  const f = MEECA_FRAMES[name];
  if (!f) return false;
  const k = K * f.s * scale;
  const x = anchor * f.ax + (1 - anchor) * f.hx;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(atlas, f.x, f.y, f.w, f.h, -x * k, -f.ay * k, f.w * k, f.h * k);
  if (flipped && f.bib) {
    // the bib, drawn again turned about its own middle: the mirrored canvas turns it back, and the number reads the right way round
    const [bx, by, bw, bh] = f.bib;
    ctx.save();
    ctx.translate((bx + bw / 2 - x) * k, (by + bh / 2 - f.ay) * k);
    ctx.scale(-1, 1);
    ctx.drawImage(atlas, f.x + bx, f.y + by, bw, bh, (-bw / 2) * k, (-bh / 2) * k, bw * k, bh * k);
    ctx.restore();
  }
  return true;
}

/**
 * Draws Meeca in a mood with her feet at the origin, facing right (the caller mirrors her); `scale` multiplies her usual size. A jump lifts her (her shadow, drawn by the
 * caller, stays on the ground). Returns false (drawing nothing) while the atlas loads or when the painted version is switched off.
 */
export function drawJennifurSprite(ctx: CanvasRenderingContext2D, mood: JennifurMood, time: number, scale = 1, flipped = false): boolean {
  if (!active() || !atlas) return false;
  const spec = MEECA_MOODS[mood] ?? MEECA_MOODS.idle;
  const g = MEECA_GAITS[mood];
  const m = g ? { frame: gaitAt(g, time * gaitNaturalSpeed(g), 0).frame, lift: 0, sy: 1, rot: 0 } : moodAt(spec, time);
  ctx.save();
  ctx.translate(0, -m.lift * MEECA_UNITS * scale);
  if (m.rot) ctx.rotate(m.rot);
  if (m.sy !== 1) ctx.scale(1, m.sy);
  const ok = drawMeecaFrame(ctx, m.frame, 1, scale, flipped);
  ctx.restore();
  return ok;
}

/** her story paintings (storyHd.ts): every frame a story shows, repainted at HD times its old size */
const HD_SET: HdSet = { hd: HD_MEECA, pages: HD_MEECA_PAGES, frames: HD_MEECA_FRAMES };
/** start fetching her story paintings */
export function warmStoryMeeca() {
  warmHd('meeca', HD_SET);
}

/** one frame of her story paintings, hung as drawMeecaFrame hangs the standard one (the bib turned back on a mirrored canvas too) */
export function drawMeecaStoryFrame(ctx: CanvasRenderingContext2D, name: string, anchor = 1, scale = 1, flipped = false): boolean {
  const f = MEECA_FRAMES[name];
  const hf = HD_MEECA_FRAMES[name];
  const img = hf ? hdPage('meeca', hf) : null;
  if (!f || !hf || !img) return false;
  const H = HD_MEECA;
  const k = (K * f.s * scale) / H;
  const x = (anchor * f.ax + (1 - anchor) * f.hx) * H + hf.m;
  const ay = f.ay * H + hf.m;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, hf.x, hf.y, hf.w, hf.h, -x * k, -ay * k, hf.w * k, hf.h * k);
  if (flipped && f.bib) {
    const [bx, by, bw, bh] = f.bib.map((v) => v * H);
    ctx.save();
    ctx.translate((bx + hf.m + bw / 2 - x) * k, (by + hf.m + bh / 2 - ay) * k);
    ctx.scale(-1, 1);
    ctx.drawImage(img, hf.x + hf.m + bx, hf.y + hf.m + by, bw, bh, (-bw / 2) * k, (-bh / 2) * k, bw * k, bh * k);
    ctx.restore();
  }
  return true;
}

/** Meeca as the story engine's character (storyActors.ts showActor): her story paintings */
export const MEECA: StoryCharacter = {
  ready: () => hdReady('meeca', HD_SET),
  moods: MEECA_MOODS,
  gaits: MEECA_GAITS,
  resolve: (name) => (MEECA_FRAMES[name] ? name : undefined),
  draw: (ctx, frame, anchor, flipped) => drawMeecaStoryFrame(ctx, frame, anchor, 1, flipped),
  k: K,
  units: MEECA_UNITS,
  rest: 'idle',
};
