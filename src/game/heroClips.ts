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

let forced: boolean | null = null;
export function heroClipsEnabled(): boolean {
  // Pokey's moving clips are the game's since 2026-10-24 (Matt tested them): `?clips=0` turns them off for comparing
  if (forced === null) {
    forced = true;
    try {
      const q = new URLSearchParams(location.search).get('clips');
      if (q === '0' || q === 'off') forced = false;
    } catch {
      /* no window */
    }
  }
  return forced;
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

/**
 * The moves redrawn from video (the run, the walk, each punch of the combo with its own arm, the kicks, the mega). Each is a sheet in
 * heroClipsData; a move only uses its sheet once the sheet exists and has loaded, so a missing one leaves the standard frames in place.
 */
export const MOVE_SHEETS: Record<string, string> = {
  run: 'move-run', walk: 'move-walk', jab: 'move-jab', cross: 'move-cross', hook: 'move-hook', kick: 'move-kick', kick2: 'move-kick2', mega: 'move-mega',
  climb: 'move-climb', swing: 'move-swing', jump: 'move-jump',
};
/** the climb sheet is one full hand-over-hand cycle (left reach, right reach) over this much height */
export const CLIMB_CYCLE_PX = 110;
/** the swing sheet runs from the back of the swing to the front; this angle (radians) or more is the end of the sheet */
export const SWING_REACH = 1.0;
/** the jump sheet runs from take-off to the bottom of the fall, by vertical speed from this (rising, px/s) to this (falling) */
export const JUMP_VY: [number, number] = [-720, 620];
/** strides per turn of walkCycle (the same rate as the standard hero's cycle, so the feet keep pace with the ground) */
const STRIDE_RATE = 0.6;
const WALK_MAX = 90;

/** pure: which frame of an n-frame sheet a move at progress u (0..1) shows */
export function moveIndex(n: number, u: number): number {
  return Math.max(0, Math.min(n - 1, Math.floor(u * n)));
}

/** pure: how far through the swing sheet (0 back .. 1 front) an angle ahead of him (radians, + = in front) is */
export function swingU(ahead: number): number {
  return Math.max(0, Math.min(1, (ahead / SWING_REACH + 1) / 2));
}
/** pure: how far through the jump sheet (0 take-off .. 1 falling fast) a vertical speed is */
export function jumpU(vy: number): number {
  return Math.max(0, Math.min(1, (vy - JUMP_VY[0]) / (JUMP_VY[1] - JUMP_VY[0])));
}

/** the redrawn frame for a move or the run/walk, or null when he is doing something else or the sheet is not there */
export function movePick(p: PlayerState): ClipFrame | null {
  if (p.attackMove && p.attackU !== undefined && !p.isVineSwinging && !p.climbing && !p.hanging) {
    if (!p.grounded && p.attackMove !== 'mega') return null; // the air attacks keep their own frames
    const sheet = MOVE_SHEETS[p.attackMove];
    if (!sheet || !hasClip(sheet)) return null;
    return frameOf(sheet, moveIndex(HERO_CLIPS[sheet].n, p.attackU));
  }
  // the climb: the frame follows the height he has climbed, so his paws keep pace with the trunk
  if (p.climbing) {
    const sheet = MOVE_SHEETS.climb;
    if (!hasClip(sheet)) return null;
    const u = ((((-p.y / CLIMB_CYCLE_PX) % 1) + 1) % 1);
    return frameOf(sheet, moveIndex(HERO_CLIPS[sheet].n, u));
  }
  // the swing: the frame follows where he is in the swing, from the back (0) to the front (1)
  if (p.isVineSwinging) {
    const sheet = MOVE_SHEETS.swing;
    if (!hasClip(sheet)) return null;
    const ahead = (p.swingAngle ?? 0) * p.facing;
    return frameOf(sheet, moveIndex(HERO_CLIPS[sheet].n, swingU(ahead)));
  }
  // an ordinary jump (not the flip, a dive or a bounce, which keep their own frames): take-off, the top, the fall, by vertical speed
  if (!p.grounded && !p.hanging) {
    const sheet = MOVE_SHEETS.jump;
    if (p.isDoubleJumping || p.diving || p.bounce || !hasClip(sheet)) return null;
    return frameOf(sheet, moveIndex(HERO_CLIPS[sheet].n, jumpU(p.vy)));
  }
  if (!p.grounded || p.climbing || p.hanging || p.isVineSwinging || p.ducking || p.pushing) return null;
  const speed = Math.abs(p.vx);
  if (speed <= 10) return null;
  const sheet = MOVE_SHEETS[speed >= WALK_MAX ? 'run' : 'walk'];
  if (!hasClip(sheet)) return null;
  const u = ((((p.walkCycle * STRIDE_RATE) / (Math.PI * 2)) % 1) + 1) % 1;
  return frameOf(sheet, moveIndex(HERO_CLIPS[sheet].n, u));
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
  // the redrawn run, walk and fight moves (only while hurt is not showing: the flinch keeps its own frames)
  if (!ev.isHurt(time)) {
    const mv = movePick(p);
    if (mv) {
      playing = null;
      stillSince = time;
      return mv;
    }
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
