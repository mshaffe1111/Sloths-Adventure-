/**
 * Painted hero. Draws Pokey from the pose atlas (made from the Gemini pose sheet) instead of the code-drawn rig.
 *
 * It is a switch, not a replacement: `?hero=sprite` or `?hero=classic` in the address picks one for that session,
 * and `localStorage.sloth_hero = 'sprite'` keeps it. With nothing set, DEFAULT_SPRITE_HERO decides.
 * It returns false whenever it has no frame for the pose (climbing, vine swinging) or the atlas is still loading,
 * and the caller then draws the classic hero, so the game never shows nothing.
 */
import { studiesEnabled, studyAtlas, studyFrame, studyPick } from './heroStudies.ts';
import { standardAtlas, stdFrame, stdPick, stdStill, warmStandardAtlas, type StdChoice } from './heroStandard.ts';
import { STD_STAND_H, type StdFrame } from './heroStandardData.ts';
import { polishEnabled } from './polish.ts';
import type { PlayerState } from './types.ts';
import { HERO_CLIMB, HERO_FRAMES, HERO_RUN, HERO_STAND_H, type HeroFrame } from './heroAtlasData.ts';
import { drawAuras } from './miloVariants.ts';
import { HeroEvents } from './heroEvents.ts';
import { makeTintedCanvas, type Coat } from './heroTint.ts';
import { trackAtlas } from './atlasLoader.ts';
import { rimFor, rimOn } from './heroRim.ts';
import { clipPick, heroClipsAreLive, heroClipsLive } from './heroClips.ts';

export const DEFAULT_SPRITE_HERO = true;
/** how tall the standing hero is drawn, in world units: the classic hero is about 66 */
export const HERO_UNITS = 66;
/** how much bigger than the classic hero the painted one is drawn (the painted hero has smaller proportions of head) */
export const HERO_SPRITE_SCALE = 1.35;

let enabled: boolean | null = null;
export function heroSpriteEnabled(): boolean {
  if (enabled !== null) return enabled;
  let v = DEFAULT_SPRITE_HERO;
  try {
    const q = new URLSearchParams(location.search).get('hero');
    if (q === 'sprite') v = true;
    else if (q === 'classic') v = false;
    else if (localStorage.getItem('sloth_hero') === 'sprite') v = true;
  } catch {
    /* no window or storage: keep the default */
  }
  enabled = v;
  return v;
}

let atlas: HTMLImageElement | null = null;
let ready = false;

// the reward coat Pokey wears (made once from the painted sheet, then reused)
let coat: Coat = 'none';
const tinted: Partial<Record<Coat, HTMLCanvasElement | null>> = {};
export function setHeroCoat(c: Coat) {
  coat = c;
}
function sheet(): CanvasImageSource | null {
  if (!atlas) return null;
  if (coat === 'none') return atlas;
  if (ready && tinted[coat] === undefined) tinted[coat] = makeTintedCanvas(atlas, coat);
  return tinted[coat] ?? atlas;
}

function load() {
  if (atlas || typeof Image === 'undefined') return;
  const img = new Image();
  atlas = img;
  trackAtlas(img, new URL('../assets/hero/hero-atlas.webp', import.meta.url).href, () => { ready = true; }, () => { atlas = null; });
}

/** start fetching the painted hero early (title screen), so the first stage never begins in vector art */
export function warmHeroAtlas() {
  if (heroSpriteEnabled()) {
    load();
    warmStandardAtlas();
  }
}

// the standard hero's atlas in the reward coat (made once per coat, like the main one)
const stdTinted: Partial<Record<Coat, HTMLCanvasElement | null>> = {};
export function stdSheet(img: HTMLImageElement): CanvasImageSource {
  if (coat === 'none') return img;
  if (stdTinted[coat] === undefined) stdTinted[coat] = makeTintedCanvas(img, coat);
  return stdTinted[coat] ?? img;
}
const otherTinted = new WeakMap<HTMLImageElement, Partial<Record<Coat, HTMLCanvasElement | null>>>();
/** any other sheet of the hero's art (the cutscene poses, heroStory.ts) in the reward coat he is wearing, made once per coat */
export function heroCoatSheet(img: HTMLImageElement): CanvasImageSource {
  if (coat === 'none') return img;
  let per = otherTinted.get(img);
  if (!per) otherTinted.set(img, (per = {}));
  if (per[coat] === undefined) per[coat] = makeTintedCanvas(img, coat);
  return per[coat] ?? img;
}
/** world units per pixel of the standard hero's frames: its standing frame is as tall as the main hero's */
const STD_K = (HERO_UNITS * HERO_SPRITE_SCALE) / STD_STAND_H;
/** the rim of light is about 2.4 world units wide, in sheet pixels */
const STD_RIM_R = Math.max(4, Math.round(2.4 / STD_K));

/** the face portraits, for the HUD and dialogue (null until the atlas has loaded) */
export function heroFace(ctx: CanvasRenderingContext2D, name: string, x: number, y: number, size: number): boolean {
  if (!heroSpriteEnabled()) return false;
  load();
  const st = stdStill(name);
  if (st) {
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(stdSheet(st.img), st.f.x, st.f.y, st.f.w, st.f.h, x, y, size, size);
    return true;
  }
  const f = HERO_FRAMES[name];
  if (!ready || !atlas || !f) return false;
  ctx.drawImage(atlas, f.x, f.y, f.w, f.h, x, y, size, size);
  return true;
}

/**
 * one named painted pose with its feet at the origin, facing right, for the story scenes (the player's own state machine picks
 * poses in the game; a cutscene names the pose it wants). `shadow` draws the soft ground shadow. False until the atlas has loaded.
 */
export function heroStill(ctx: CanvasRenderingContext2D, name: string, shadow = true): boolean {
  if (!heroSpriteEnabled()) return false;
  load();
  const st = stdStill(name);
  const f: HeroFrame | StdFrame | undefined = st ? st.f : HERO_FRAMES[name];
  if (!f || (!st && (!ready || !atlas))) return false;
  const k = st ? STD_K : (HERO_UNITS * HERO_SPRITE_SCALE) / HERO_STAND_H;
  if (shadow) {
    ctx.fillStyle = 'rgba(15,23,42,0.36)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 22 * HERO_SPRITE_SCALE * 1.05, 5.5 * HERO_SPRITE_SCALE * 1.05, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(st ? stdSheet(st.img) : sheet() ?? atlas!, f.x, f.y, f.w, f.h, -f.ax * k, -f.ay * k, f.w * k, f.h * k);
  return true;
}

/** the shape of a painted pose, for a cutscene that wants to place something against it: [width, height] in world units */
export function heroStillSize(name: string): [number, number] | null {
  const st = stdStill(name);
  if (st) return [st.f.w * STD_K, st.f.h * STD_K];
  const f: HeroFrame | undefined = HERO_FRAMES[name];
  if (!f) return null;
  const k = (HERO_UNITS * HERO_SPRITE_SCALE) / HERO_STAND_H;
  return [f.w * k, f.h * k];
}

/** the run frames, ordered by the packing script so neighbouring poses are as alike as possible */
const RUN_CYCLE = HERO_RUN;
/** painted strides per walkCycle turn: 9 frames at the full walkCycle rate would outrun the 30 fps loop */
const STRIDE_RATE = 0.6;

// short-lived poses that are triggered by a change of state rather than a flag on the player (see heroEvents.ts)
let events = new HeroEvents();

/** the painted climb is one step per few pixels of height gained, so it follows the climbing speed */
const CLIMB_STEP_PX = 22;

/** what pick() chooses: the painted frame, and how to turn it */
interface Choice {
  name: string;
  bob: number;
  byHand?: boolean;
  hang?: boolean;
  /** lean or flip angle in radians, about the middle of the body (positive tips him forward) */
  rot?: number;
  /** draw the frame centred on the middle of the body, so frames of different shapes turn about the same point (the flip) */
  centred?: boolean;
}

const TAU = Math.PI * 2;
/** the fall lean: a little back while rising with his arms up, tipping forward into the fall */
export function airLean(vy: number): number {
  return Math.max(-0.1, Math.min(0.22, vy / 1500));
}
/**
 * the double jump as ONE clean flip: launch, tuck, unfurl. The engine spins `somersaultAngle` on for as long as he is airborne
 * (a second turn, then a snap to upright on landing); the painted hero turns once, eased, and is upright for the rest of the fall.
 * Returns how far through the flip he is (0..1) and the angle to draw.
 */
export function flipPose(somersaultAngle: number): { u: number; angle: number } {
  const u = Math.min(1, Math.abs(somersaultAngle) / TAU);
  const eased = u * u * (3 - 2 * u);
  return { u, angle: Math.sign(somersaultAngle || 1) * TAU * eased };
}
/** the frame for each part of the flip: stretched at launch, curled in the middle, arms out as he opens up */
export function flipFrame(u: number): string {
  return u < 0.2 ? 'jump_up' : u < 0.78 ? 'duck' : 'fall';
}

function pick(p: PlayerState, time: number): Choice | null {
  if (p.isVineSwinging) return null;
  // hanging from a rope: the arms-up pose (until there is a painted hanging pose), gripping with both hands
  if (p.hanging && HERO_FRAMES.jump_up) return { name: 'jump_up', bob: 0, hang: true };
  if (p.climbing) {
    if (!HERO_CLIMB.every((n) => HERO_FRAMES[n])) return null;
    const n = HERO_CLIMB.length;
    const i = (((Math.floor(-p.y / CLIMB_STEP_PX) % n) + n) % n);
    return { name: HERO_CLIMB[i], bob: 0, byHand: true };
  }
  if (events.isHurt(time) && HERO_FRAMES.hurt) return { name: 'hurt', bob: 0 };
  if (p.ducking) return { name: 'duck', bob: 0 };
  const reachNow = (v: number | undefined) => v === undefined || v > 0.25;
  if (p.kicking && reachNow(p.swingReach)) return { name: 'kick', bob: 0 };
  if (p.punching && p.attackType === 'mega' && HERO_FRAMES.mega && reachNow(p.swingReach)) return { name: 'mega', bob: 0 };
  if (p.punching) {
    // the swing's reach runs 0 (wind-up) -> up to 1 (arm out) -> back down (recoil); one painted frame per band
    const r = p.swingReach ?? 1;
    const name = r <= 0 ? 'guard' : r < 0.3 ? 'punch_rec' : r < 0.55 ? 'punch_2' : r < 0.8 ? 'punch_3' : r < 0.95 ? 'punch_4' : 'punch_5';
    return { name, bob: 0 };
  }
  if (!p.grounded) {
    if (p.isDoubleJumping && HERO_FRAMES.duck && HERO_FRAMES.fall) {
      const f = flipPose(p.somersaultAngle);
      return { name: flipFrame(f.u), bob: 0, rot: f.angle, centred: true };
    }
    const rot = airLean(p.vy);
    if (p.isDoubleJumping || p.vy < 0) return { name: 'jump_up', bob: 0, rot };
    return { name: 'fall', bob: 0, rot };
  }
  if (events.isLanding(time) && HERO_FRAMES.land) return { name: 'land', bob: 0 };
  if (Math.abs(p.vx) > 10) {
    // one stride = one turn of walkCycle; the frames come from the run sheet, in the order the stride unfolds
    const u = ((((p.walkCycle * STRIDE_RATE) / (Math.PI * 2)) % 1) + 1) % 1;
    const name = RUN_CYCLE[Math.min(RUN_CYCLE.length - 1, Math.floor(u * RUN_CYCLE.length))];
    return { name, bob: -Math.abs(Math.sin(u * Math.PI * 2)) * 2.4 };
  }
  // standing: a slow breath, and a blink every few seconds
  const blink = time % 3.6 > 3.45;
  return { name: blink ? 'idle_blink' : 'idle_a', bob: Math.sin(time * 3.2) * 0.5 };
}

// a flip cut short by touching down is not snapped upright: what is left of the turn eases out over a moment
const FLIP_EASE_OUT = 0.12;
let flipLeft = 0;
let flipLeftAt = 0;
/** the shortest way back to upright from an angle */
function toUpright(a: number): number {
  const m = ((a % TAU) + TAU) % TAU;
  return m > Math.PI ? m - TAU : m;
}

/**
 * Which sheet draws the hero this frame. The standard hero (heroStandard.ts) is Pokey: when its atlas has loaded and has a frame for the pose it
 * draws, and it never waits on the older main atlas (hero-atlas.webp), so a failed or slow load of the old one cannot hide the new hero. The main
 * atlas only matters for a pose the standard set lacks, or while the standard sheet loads, or when the standard hero is switched off.
 */
export type HeroSource = 'standard' | 'main' | 'none';
export function heroSource(standardCanDraw: boolean, mainLoaded: boolean): HeroSource {
  if (standardCanDraw) return 'standard';
  return mainLoaded ? 'main' : 'none';
}

/** returns true if it drew the hero */
export function drawHeroSprite(ctx: CanvasRenderingContext2D, p: PlayerState, time: number): boolean {
  if (!heroSpriteEnabled()) return false;
  load();
  events.track(p, time);
  // the standard hero (heroStandard.ts), when switched on and loaded, draws every pose it has a frame for
  const stdImg = standardAtlas();
  // a moving clip (heroClips.ts, test): when one fits this moment it draws in the standard hero's place
  const clip = stdImg ? clipPick(p, time, events) : null;
  const ch = stdImg ? stdPick(p, time, events) : null;
  if (clip) {
    // at each end of a clip the ordinary pose shows through, so the change of pose melts instead of popping
    if (clip.blend < 1 && ch && stdFrame(ch.name)) {
      ctx.save();
      ctx.globalAlpha *= 1 - clip.blend;
      drawStandard(ctx, p, time, ch, stdImg!);
      ctx.restore();
    }
    ctx.save();
    ctx.globalAlpha *= clip.blend;
    const drew = drawStandard(ctx, p, time, { name: clip.name, bob: 0 }, clip.img, clip.f);
    ctx.restore();
    if (drew) return true;
  }
  const mainLoaded = ready && !!atlas;
  const source = heroSource(!!(stdImg && ch && stdFrame(ch.name)), mainLoaded);
  if (source === 'none') return false;
  if (source === 'standard' && drawStandard(ctx, p, time, ch!, stdImg!)) return true;
  if (!mainLoaded || !atlas) return false;
  // the opt-in action studies (heroStudies.ts), when switched on and loaded, take the poses they cover; everything else is the main atlas
  const study = studiesEnabled() ? studyPick(p, time, events) : null;
  const sAtlas = study ? studyAtlas() : null;
  const sf = study && sAtlas ? studyFrame(study.name) : undefined;
  const choice: Choice | null =
    study && sf
      ? { name: study.name, bob: 0, hang: study.mode === 'hang', centred: study.mode === 'centre' }
      : pick(p, time);
  if (!choice) return false;
  const f: HeroFrame | undefined = study && sf ? { x: sf.x, y: sf.y, w: sf.w, h: sf.h, ax: sf.ax, ay: sf.ay } : HERO_FRAMES[choice.name];
  if (!f) return false;
  const k = (HERO_UNITS * HERO_SPRITE_SCALE) / HERO_STAND_H;
  /** hero-atlas scale of the picture being drawn: a study pixel is worth `sc` of them */
  const fk = study && sf ? k * sf.sc : k;
  const src: CanvasImageSource = study && sf && sAtlas ? sAtlas : sheet() ?? atlas;

  ctx.save();
  ctx.translate(p.x, p.y);
  if (!polishEnabled() && p.grounded && !p.climbing && !p.isVineSwinging && !p.hanging) {
    const sc = (1 / p.squashY) * (p.ducking ? 1.3 : 1.05) * HERO_SPRITE_SCALE;
    ctx.fillStyle = 'rgba(15,23,42,0.36)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 22 * sc, 5.5 * sc, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  if (study && sf && study.mode === 'swing') ctx.rotate(study.tilt ?? 0);
  ctx.scale(p.facing * p.squashX, p.squashY);
  if (choice.hang && study && sf) {
    // a rope hang from the study: tilt about the hands at the top of the picture
    const top = -f.h * fk;
    ctx.translate(0, top);
    ctx.rotate(study.tilt ?? 0);
    ctx.translate(0, -top);
  } else if (choice.hang) {
    // swing gently from the hands; a quicker rocking while he creeps hand over hand
    const moving = Math.abs(p.vx) > 10;
    const top = -f.h * k;
    ctx.translate(0, top);
    ctx.rotate(Math.sin(time * (moving ? 7 : 2.2)) * (moving ? 0.1 : 0.045));
    ctx.translate(0, -top);
  }
  // turn about the middle of the body (the height of the standing hero's raised-arms pose, halved)
  const jf = HERO_FRAMES.jump_up;
  const pivot = jf ? (jf.h * k) / 2 : HERO_UNITS * HERO_SPRITE_SCALE * 0.5;
  let rot = choice.rot ?? 0;
  if (study && sf) {
    flipLeft = 0; // the study's own picture is already turned
  } else if (choice.centred) {
    const r = toUpright(rot);
    flipLeft = Math.abs(r) < 1e-3 ? 0 : r;
    flipLeftAt = time;
  } else if (flipLeft !== 0) {
    if (time < flipLeftAt) flipLeft = 0;
    else {
      const left = 1 - (time - flipLeftAt) / FLIP_EASE_OUT;
      if (left <= 0) flipLeft = 0;
      else rot += flipLeft * left;
    }
  }
  if (rot !== 0) {
    ctx.translate(0, -pivot);
    ctx.rotate(rot);
    ctx.translate(0, pivot);
  }
  if (p.invincibleTimer > 0 && Math.floor(time * 24) % 2 === 0) ctx.globalAlpha = 0.55;
  drawAuras(ctx, p, time);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  const dx = choice.centred ? -(f.w * fk) / 2 : -(choice.byHand && f.hx !== undefined ? f.hx : f.ax) * fk;
  const dy = choice.centred ? -pivot - (f.h * fk) / 2 : -f.ay * fk + choice.bob;
  ctx.drawImage(src, f.x, f.y, f.w, f.h, dx, dy, f.w * fk, f.h * fk);
  ctx.restore();
  return true;
}

/** draws one frame of the standard hero. It turns and squashes the way the main hero does, so every effect (the flip, the hang, the vine) behaves the same */
function drawStandard(ctx: CanvasRenderingContext2D, p: PlayerState, time: number, ch: StdChoice, img: HTMLImageElement, clipF?: StdFrame): boolean {
  const f = clipF ?? stdFrame(ch.name);
  if (!f) return false;
  const k = STD_K;
  ctx.save();
  ctx.translate(p.x, p.y);
  if (!polishEnabled() && p.grounded && !p.climbing && !p.isVineSwinging && !p.hanging) {
    const sc = (1 / p.squashY) * (p.ducking ? 1.3 : 1.05) * HERO_SPRITE_SCALE;
    ctx.fillStyle = 'rgba(15,23,42,0.36)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 22 * sc, 5.5 * sc, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // the rope ends at his feet, so a vine swing turns the whole body about them
  if (ch.swing !== undefined) ctx.rotate(ch.swing);
  const q = ch.squash ?? 1;
  ctx.scale(p.facing * (1 + (p.squashX - 1) * q), 1 + (p.squashY - 1) * q);
  if (ch.hang) {
    // swing gently from the hands; a quicker rocking while he creeps hand over hand
    const moving = Math.abs(p.vx) > 10;
    const top = -f.h * k;
    ctx.translate(0, top);
    ctx.rotate(Math.sin(time * (moving ? 7 : 2.2)) * (moving ? 0.1 : 0.045));
    ctx.translate(0, -top);
  }
  // turn about the middle of the body
  const pivot = HERO_UNITS * HERO_SPRITE_SCALE * 0.5;
  let rot = ch.rot ?? 0;
  if (ch.centred) {
    const r = toUpright(rot);
    flipLeft = Math.abs(r) < 1e-3 ? 0 : r;
    flipLeftAt = time;
  } else if (flipLeft !== 0) {
    if (time < flipLeftAt) flipLeft = 0;
    else {
      const left = 1 - (time - flipLeftAt) / FLIP_EASE_OUT;
      if (left <= 0) flipLeft = 0;
      else rot += flipLeft * left;
    }
  }
  if (rot !== 0) {
    ctx.translate(0, -pivot);
    ctx.rotate(rot);
    ctx.translate(0, pivot);
  }
  if (p.invincibleTimer > 0 && Math.floor(time * 24) % 2 === 0) ctx.globalAlpha *= 0.55;
  drawAuras(ctx, p, time);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  const dx = ch.centred ? -(f.w * k) / 2 : -(ch.byHand || ch.byBody ? f.hx : f.ax) * k;
  const dy = ch.centred ? -pivot - (f.h * k) / 2 : -f.ay * k + ch.bob;
  const sheetImg = clipF ? heroCoatSheet(img) : stdSheet(img);
  if (rimOn()) {
    const rim = rimFor(`${ch.name}|${coat}`, sheetImg, f, STD_RIM_R);
    if (rim) ctx.drawImage(rim.img, dx - rim.pad * k, dy - rim.pad * k, rim.img.width * k, rim.img.height * k);
  }
  ctx.drawImage(sheetImg, f.x, f.y, f.w, f.h, dx, dy, f.w * k, f.h * k);
  ctx.restore();
  return true;
}

/**
 * A second Pokey (the journal's looping demos, JournalDemo.tsx): drawn with his own memory of landings, hits and flips, and with no
 * idle clips, so he never disturbs the stage's own Pokey, which the paused game keeps drawing behind the menu.
 */
const demoMemory = { events: new HeroEvents(), flipLeft: 0, flipLeftAt: 0 };
export function drawHeroDemo(ctx: CanvasRenderingContext2D, p: PlayerState, time: number): boolean {
  const keep = { events, flipLeft, flipLeftAt, live: heroClipsAreLive() };
  events = demoMemory.events;
  flipLeft = demoMemory.flipLeft;
  flipLeftAt = demoMemory.flipLeftAt;
  heroClipsLive(false);
  try {
    return drawHeroSprite(ctx, p, time);
  } finally {
    demoMemory.flipLeft = flipLeft;
    demoMemory.flipLeftAt = flipLeftAt;
    events = keep.events;
    flipLeft = keep.flipLeft;
    flipLeftAt = keep.flipLeftAt;
    heroClipsLive(keep.live);
  }
}
