/**
 * Pokey's new moving clips (test): short pieces of real animation made from his trained model (Wan image-to-video, keyed by the clip cutter into
 * src/assets/hero/clips/<name>.webp, see heroClipsData.ts). They play over the standard hero at the moments they fit:
 *
 * - idle: standing still a few seconds, he yawns, scratches his head, scratches his belly, nods off ... one after another, with rests between
 * - ouch: standing still just after a hit, he rubs his sore head
 * - push: leaning into the hollow log of 1-6
 * - cheer: at the exit, before the stage clears
 *
 * Off by default while testers play (the switch in the menus, saved on the device, or ?clips=1 for one visit). Anything he does (a step, a jump,
 * a hit) stops a clip at once, so the clips never get in the way of control.
 */
import { HERO_CLIPS, type HeroClip } from './heroClipsData.ts';
import type { PlayerState } from './types.ts';
import type { StdFrame } from './heroStandardData.ts';

const KEY = 'sloth_clips';
let forced: boolean | null = null;
export function heroClipsEnabled(): boolean {
  if (forced === null) {
    forced = false;
    try {
      const q = new URLSearchParams(location.search).get('clips');
      if (q === '1' || q === 'on') forced = true;
    } catch {
      /* no window */
    }
  }
  if (forced) return true;
  try {
    return typeof localStorage !== 'undefined' && localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}
export function setHeroClipsPref(on: boolean) {
  try {
    if (on) localStorage.setItem(KEY, '1');
    else localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

/** the idle clips, in the order he goes through them (only the ones that exist and have loaded play) */
export const IDLE_CLIPS = ['idle-yawn', 'look-around', 'belly-scratch', 'wave', 'doze'];
/** seconds of standing still before the first idle clip, and between one and the next */
export const IDLE_WAIT = 4;
export const IDLE_REST = 5;
/** how long the cheer at the exit holds the stage open before it clears */
export const CHEER_SECONDS = 1.9;

const imgs = new Map<string, HTMLImageElement>();
const ready = new Set<string>();
function load(name: string) {
  if (imgs.has(name) || typeof Image === 'undefined' || !HERO_CLIPS[name]) return;
  const im = new Image();
  imgs.set(name, im);
  im.onload = () => ready.add(name);
  im.src = new URL(`../assets/hero/clips/${name}.webp`, import.meta.url).href;
}
/** start loading every clip (called when a stage starts with the clips switched on) */
export function warmHeroClips() {
  if (!heroClipsEnabled()) return;
  for (const n of Object.keys(HERO_CLIPS)) load(n);
}
export function hasClip(name: string): boolean {
  return !!HERO_CLIPS[name] && ready.has(name);
}

/** one frame of a clip, in the standard hero's terms (its sheet and a frame rect with the feet anchor) */
export interface ClipFrame {
  img: HTMLImageElement;
  f: StdFrame;
  name: string;
  /** how much of the clip shows over the ordinary hero (1 = all): a short fade at each end, so the change of pose melts */
  blend: number;
}
/** seconds of fade at each end of a clip */
export const CLIP_FADE = 0.2;
function fade(c: HeroClip, dt: number): number {
  const len = c.n / c.fps;
  return Math.max(0, Math.min(1, dt / CLIP_FADE, (len - dt) / CLIP_FADE));
}
function frameOf(name: string, i: number, blend = 1): ClipFrame | null {
  const c: HeroClip | undefined = HERO_CLIPS[name];
  const img = imgs.get(name);
  if (!c || !img || !ready.has(name)) return null;
  const k = Math.max(0, Math.min(c.n - 1, i));
  return { img, name: `${name}#${k}`, blend, f: { x: (k % c.cols) * c.w, y: Math.floor(k / c.cols) * c.h, w: c.w, h: c.h, ax: c.ax, ay: c.ay, hx: c.ax } };
}

/** what is playing now, and since when (game seconds) */
let playing: { name: string; at: number } | null = null;
let stillSince = -1;
let idleNext = 0;
let lastTime = -1;
/** only the stage's own hero plays clips (not the story scenes, which draw him too) */
let live = false;
export function heroClipsLive(on: boolean) {
  live = on;
}
/** forget everything (a new stage, a respawn) */
export function resetHeroClips() {
  playing = null;
  stillSince = -1;
  lastTime = -1;
  ouchFor = -1;
}

export interface ClipCalm {
  isHurt(t: number): boolean;
  isLanding(t: number): boolean;
  /** game time the last hit's flinch ends */
  hurtUntil: number;
}
/** after a hit, standing still within this many seconds, he rubs his head */
export const OUCH_WITHIN = 1.2;
let ouchFor = -1;

/** pure: is he standing quietly (the only time an idle clip may play)? */
export function isCalm(p: PlayerState, time: number, ev: ClipCalm): boolean {
  return (
    p.grounded && Math.abs(p.vx) < 5 && !p.climbing && !p.hanging && !p.isVineSwinging && !p.punching && !p.kicking && !p.ducking &&
    !ev.isHurt(time) && !ev.isLanding(time)
  );
}

/** the clip frame to draw for this moment, or null for the ordinary hero */
export function clipPick(p: PlayerState, time: number, ev: ClipCalm): ClipFrame | null {
  if (!live || !heroClipsEnabled()) return null;
  if (time < lastTime) resetHeroClips(); // the stage restarted
  lastTime = time;
  // the cheer at the exit plays whatever else is going on
  if (p.cheerAt !== undefined && hasClip('cheer')) {
    const c = HERO_CLIPS.cheer;
    return frameOf('cheer', Math.floor((time - p.cheerAt) * c.fps), Math.min(1, (time - p.cheerAt) / CLIP_FADE));
  }
  if (p.pushing && hasClip('push')) {
    const c = HERO_CLIPS.push;
    playing = null;
    stillSince = time;
    // the push loops (the clip's first and last frames are both mid-push)
    return frameOf('push', Math.floor(time * c.fps) % c.n);
  }
  if (!isCalm(p, time, ev)) {
    playing = null;
    stillSince = time;
    return null;
  }
  if (stillSince < 0) stillSince = time;
  // just hit and standing still: he rubs his sore head (once per hit)
  if (ev.hurtUntil > 0 && ev.hurtUntil !== ouchFor && time - ev.hurtUntil < OUCH_WITHIN && hasClip('hurt') && playing?.name !== 'hurt') {
    ouchFor = ev.hurtUntil;
    playing = { name: 'hurt', at: time };
  }
  if (playing) {
    const c = HERO_CLIPS[playing.name];
    const i = Math.floor((time - playing.at) * c.fps);
    if (i < c.n) return frameOf(playing.name, i, fade(c, time - playing.at));
    playing = null;
    stillSince = time - (IDLE_WAIT - IDLE_REST); // rest a while before the next one
    return null;
  }
  if (time - stillSince >= IDLE_WAIT) {
    const have = IDLE_CLIPS.filter(hasClip);
    if (have.length) {
      const name = have[idleNext % have.length];
      idleNext++;
      playing = { name, at: time };
      return frameOf(name, 0, 0);
    }
  }
  return null;
}
