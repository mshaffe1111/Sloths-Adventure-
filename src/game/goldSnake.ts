/**
 * Matt's golden horned tree snake (2026-10-23): one painted head cut from his sheet, and a body drawn in code that follows it,
 * so the snake slithers, rears and strikes smoothly at any frame rate and can never come out off-model.
 *
 * A switch, not a replacement, the same as snakeSprite.ts: the menu's "Golden snakes" setting (or `?snake=gold`) turns it on and it
 * is off by default while testers try it. It returns false while the head loads or when switched off, and the caller then draws
 * the snake it drew before. It reads the same brain states the painted snake does (predatorAI.ts), so the hit box and the timing of
 * every lunge are untouched: only the picture changes.
 */
import type { Enemy } from './types.ts';
import { bodyFor } from './creatureRig.ts';
import { trackAtlas } from './atlasLoader.ts';
import { makeCreatureAnim } from './creatureAnim.ts';
import { GOLDSNAKE_ANIM, GOLDSNAKE_ANIM_UP, GOLDSNAKE_ANIM_URL, GOLDSNAKE_SEQ } from './goldsnakeAnimData.ts';

/**
 * The painted snake (2026-10-25): Wan 2.2 clips (with our motion model) of whole-body paintings made from Matt's head, cut into
 * frames: slithering, rearing, the open-mouthed strike, flinching, dizzy, the defeat, curled up asleep and the waking yawn. Drawn
 * with its origin on the snake's feet; while the sheet loads (or with `?snake=drawn`) the code body below draws instead.
 */
const ANIM = makeCreatureAnim(GOLDSNAKE_ANIM_URL, GOLDSNAKE_ANIM, GOLDSNAKE_SEQ, GOLDSNAKE_ANIM_UP);
let paintedOn: boolean | null = null;
function painted(): boolean {
  if (paintedOn === null) {
    paintedOn = true;
    try {
      if (new URLSearchParams(location.search).get('snake') === 'drawn') paintedOn = false;
    } catch {
      /* no window */
    }
  }
  return paintedOn && ANIM.ready();
}
/** how wide the shadow under each pose is: the long slither, the upright S, the coil */
const SHADOW: Record<string, number> = { prowl: 46, hurt: 48, dazed: 46, defeat: 48, rear: 20, strike: 22, recover: 22, wake: 30, sleep: 30 };
const FADE = 0.12;

let enabled: boolean | null = null;

export function goldSnakeEnabled(): boolean {
  if (enabled !== null) return enabled;
  // the game's snake since 2026-10-24 (Matt tested it): `?snake=classic` brings back the old one for comparing
  let v = true;
  try {
    const q = new URLSearchParams(location.search).get('snake');
    if (q === 'classic' || q === 'sprite') v = false;
  } catch {
    /* no window: on */
  }
  enabled = v;
  return v;
}

let head: HTMLImageElement | null = null;
let ready = false;
/** the same head asleep (eyes shut) and waking (a drowsy yawn), painted to swap in place (Matt, 2026-10-23) */
let sleepHead: HTMLImageElement | null = null;
let wakeHead: HTMLImageElement | null = null;
let sleepReady = false;
let wakeReady = false;
function load() {
  if (head || typeof Image === 'undefined') return;
  const img = new Image();
  head = img;
  trackAtlas(img, new URL('../assets/enemies/goldsnake-head.webp', import.meta.url).href, () => { ready = true; }, () => { head = null; }, () => { head = null; ready = false; });
  const s = new Image();
  sleepHead = s;
  trackAtlas(s, new URL('../assets/enemies/goldsnake-sleep.webp', import.meta.url).href, () => { sleepReady = true; }, () => { sleepHead = null; }, () => { sleepHead = null; sleepReady = false; });
  const w = new Image();
  wakeHead = w;
  trackAtlas(w, new URL('../assets/enemies/goldsnake-wake.webp', import.meta.url).href, () => { wakeReady = true; }, () => { wakeHead = null; }, () => { wakeHead = null; wakeReady = false; });
}

/** colours sampled from Matt's sheet */
const C = {
  body: '#dc9d4c', dark: '#b8752e', spot: '#8c3346', spot2: '#b8566a', belly: '#ffe49a', bellyLine: '#e0b867',
  ink: '#52210e', scale: 'rgba(150,85,25,.35)',
};
/** body points, length and girth in world units (the old painted snake is about 95 long with an 18-unit head) */
const N = 26;
const LEN = 104;
const MAX_R = 9.5;
const HEAD_W = 38;
/** where the head sits ahead of the enemy's centre, so the snake's middle stays where the old one was */
const HEAD_X = 44;

export type GoldMode = 'prowl' | 'rear' | 'strike' | 'recover' | 'hurt' | 'dazed' | 'defeat';

/** how the body is shaped in a mode: pure, so a test can check the strike goes forward and the defeat lies flat */
export function goldShape(mode: GoldMode, modeT: number, time: number) {
  switch (mode) {
    case 'rear': return { lift: 30 * Math.min(1, modeT / 0.25), lunge: -4, amp: 1.6, speed: 2 };
    case 'strike': return { lift: 8, lunge: 26 * Math.min(1, modeT / 0.12), amp: 0.8, speed: 1 };
    case 'recover': return { lift: 14 * Math.max(0, 1 - modeT / 0.5), lunge: 26 * Math.max(0, 1 - modeT / 0.35), amp: 2, speed: 3 };
    case 'hurt': return { lift: 8, lunge: -6, amp: 0.4, speed: 0 };
    case 'dazed': return { lift: 3 + Math.sin(time * 9) * 2, lunge: 0, amp: 1, speed: 1.2 };
    case 'defeat': return { lift: 0, lunge: 0, amp: 0, speed: 0 };
    default: return { lift: 0, lunge: 0, amp: 4.2, speed: 5 };
  }
}

interface Rig { mode: 'prowl' | 'rear' | 'strike' | 'recover'; modeT: number; wave: number; t: number; defT: number; seq: string; frame: string; prev: string; fade: number }

const radius = (s: number) => (s < 0.08 ? MAX_R * 0.85 + s * 2 : MAX_R * (1 - Math.pow(Math.max(0, s - 0.08) / 0.92, 1.25)) + 0.4);

export function drawGoldSnake(ctx: CanvasRenderingContext2D, enemy: Enemy, time: number): boolean {
  if (!goldSnakeEnabled()) return false;
  load();
  if (!ready || !head) return false;

  const b = bodyFor('goldsnake', enemy, time);
  if (!b.rig) b.rig = { mode: 'prowl', modeT: 0, wave: enemy.id * 1.3 } as Rig;
  const r = b.rig as Rig;
  if (b.dt > 0) {
    r.modeT += b.dt;
    if (enemy.state !== undefined) {
      const m = enemy.state === 'rear' ? 'rear' : enemy.state === 'strike' ? 'strike' : enemy.state === 'recover' ? 'recover' : 'prowl';
      if (m !== r.mode) { r.mode = m; r.modeT = 0; }
    } else if (enemy.isAttacking) {
      if (r.mode === 'prowl') { r.mode = 'rear'; r.modeT = 0; }
      else if (r.mode === 'rear' && r.modeT > 0.38) { r.mode = 'strike'; r.modeT = 0; }
      else if (r.mode === 'strike' && r.modeT > 0.18) { r.mode = 'recover'; r.modeT = 0; }
      else if (r.mode === 'recover' && r.modeT > 0.55) { r.mode = 'rear'; r.modeT = 0; }
    } else if (r.mode !== 'prowl' && !(r.mode === 'strike' && r.modeT < 0.18)) {
      r.mode = 'prowl'; r.modeT = 0;
    }
  }
  let mode: GoldMode = r.mode;
  if (enemy.defeated) mode = 'defeat';
  else if ((enemy.stagger ?? 0) > 0) mode = 'dazed';
  else if ((enemy.recoil ?? 0) > 0.35) mode = 'hurt';
  const sh = goldShape(mode, r.modeT, time);
  // asleep it lies still (no slither), just breathing a little
  const asleep = enemy.state === 'sleep' && !enemy.defeated;
  if (asleep) { sh.amp *= 0.35; sh.lift = 0; sh.lunge = 0; }
  if (b.dt > 0 && !asleep) r.wave += b.dt * sh.speed;

  if (enemy.telegraphTimer > 0) {
    // the same red warning ring the other snakes show before a strike
    ctx.save();
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(enemy.x + 2 * (b.fs < 0 ? -1 : 1), enemy.y, 26, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  if (painted()) {
    drawPainted(ctx, enemy, r, mode, asleep, b.fs, b.dt, time);
    return true;
  }

  // the spine, in the snake's own space: the head at +x, the ground at y = 0
  const seg = LEN / (N - 1);
  const xs: number[] = [], ys: number[] = [];
  for (let i = 0; i < N; i++) {
    const s = i / (N - 1);
    const along = i * seg;
    const amp = sh.amp * Math.sin(Math.PI * Math.min(1, s * 1.4));
    const wave = Math.sin((along / 34) * Math.PI * 2 - r.wave) * amp;
    const front = Math.max(0, 1 - s * 3.2) ** 1.6;
    xs.push(HEAD_X + sh.lunge * front - along * (1 - (sh.lift / 30) * 0.18 * Math.max(0, 1 - s * 3)));
    ys.push(-MAX_R - 1.5 + wave - sh.lift * front);
  }
  const Lx: number[] = [], Ly: number[] = [], Rx: number[] = [], Ry: number[] = [], Bx: number[] = [], By: number[] = [], rad: number[] = [];
  const nxA: number[] = [], nyA: number[] = [], txA: number[] = [], tyA: number[] = [];
  for (let i = 0; i < N; i++) {
    const a = Math.max(0, i - 1), c = Math.min(N - 1, i + 1);
    let tx = xs[c] - xs[a], ty = ys[c] - ys[a];
    const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l;
    let nx = -ty, ny = tx;
    if (ny < 0) { nx = -nx; ny = -ny; }
    const rr = radius(i / (N - 1));
    rad.push(rr); nxA.push(nx); nyA.push(ny); txA.push(tx); tyA.push(ty);
    Lx.push(xs[i] - nx * rr); Ly.push(ys[i] - ny * rr);
    Rx.push(xs[i] + nx * rr); Ry.push(ys[i] + ny * rr);
    Bx.push(xs[i] + nx * rr * 0.15); By.push(ys[i] + ny * rr * 0.15);
  }
  const band = (tx1: number[], ty1: number[], tx2: number[], ty2: number[]) => {
    ctx.beginPath();
    ctx.moveTo(tx1[0], ty1[0]);
    for (let i = 1; i < N; i++) ctx.lineTo(tx1[i], ty1[i]);
    for (let i = N - 1; i >= 0; i--) ctx.lineTo(tx2[i], ty2[i]);
    ctx.closePath();
  };

  ctx.save();
  ctx.translate(enemy.x, enemy.y + 12);
  ctx.scale(b.fs, 1);
  if (enemy.hitFlashTimer > 0) ctx.filter = 'brightness(2.4)';
  if (mode === 'defeat') ctx.globalAlpha = 0.9;

  // contact shadow
  ctx.fillStyle = 'rgba(20,35,20,.22)';
  ctx.beginPath();
  ctx.ellipse(xs[N >> 1], 1, LEN * 0.5, 2.2, 0, 0, Math.PI * 2);
  ctx.fill();

  band(Lx, Ly, Rx, Ry); ctx.fillStyle = C.body; ctx.fill();
  const Mx = xs.map((x, i) => x + nxA[i] * rad[i] * 0.05), My = ys.map((y, i) => y + nyA[i] * rad[i] * 0.05);
  band(Mx, My, Rx, Ry); ctx.globalAlpha *= 0.55; ctx.fillStyle = C.dark; ctx.fill(); ctx.globalAlpha = mode === 'defeat' ? 0.9 : 1;
  band(Bx, By, Rx, Ry); ctx.fillStyle = C.belly; ctx.fill();

  // belly scutes
  ctx.strokeStyle = C.bellyLine; ctx.lineWidth = 0.7;
  for (let i = 2; i < N - 3; i++) {
    ctx.beginPath(); ctx.moveTo(Bx[i], By[i]);
    ctx.lineTo(Rx[i] - nxA[i] * rad[i] * 0.08, Ry[i] - nyA[i] * rad[i] * 0.08); ctx.stroke();
  }
  // scale mesh on the back
  ctx.save(); band(Lx, Ly, Bx, By); ctx.clip();
  ctx.strokeStyle = C.scale; ctx.lineWidth = 0.55;
  for (let i = 1; i < N - 1; i++) {
    for (let k = -2; k <= 2; k++) {
      const o = k * 0.32 + (i % 2) * 0.16;
      ctx.beginPath(); ctx.arc(xs[i] - nxA[i] * rad[i] * o, ys[i] - nyA[i] * rad[i] * o, rad[i] * 0.16, 0, Math.PI); ctx.stroke();
    }
  }
  ctx.restore();
  // plum rosettes in two loose rows, like the sheet
  for (let i = 3; i < N - 4; i += 2) {
    if ((i * 5) % 7 === 3) continue;
    const row = ((i >> 1) % 2 ? -0.5 : 0.05) + (((i * 13) % 5) - 2) * 0.06;
    const cx = xs[i] - nxA[i] * rad[i] * (0.35 - row * 0.6), cy = ys[i] - nyA[i] * rad[i] * (0.35 - row * 0.6);
    const sr = rad[i] * (0.24 + ((i * 7) % 5) * 0.035);
    ctx.fillStyle = C.spot;
    ctx.beginPath(); ctx.ellipse(cx, cy, sr * 1.15, sr, Math.atan2(tyA[i], txA[i]), 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.spot2;
    for (let d = 0; d < 3; d++) {
      const a = d * 2.1 + i;
      ctx.beginPath(); ctx.arc(cx + Math.cos(a) * sr * 0.45, cy + Math.sin(a) * sr * 0.38, sr * 0.22, 0, Math.PI * 2); ctx.fill();
    }
  }
  band(Lx, Ly, Rx, Ry); ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.lineJoin = 'round'; ctx.stroke();

  // the painted head, turned along the neck
  const ang = Math.atan2(ys[0] - ys[3], xs[0] - xs[3]);
  const waking = (enemy.wakeT ?? 0) > 0 && !enemy.defeated;
  const face = asleep && sleepReady && sleepHead ? sleepHead : waking && wakeReady && wakeHead ? wakeHead : head;
  const hw = HEAD_W, hh = (hw * face.naturalHeight) / face.naturalWidth;
  ctx.save();
  ctx.translate(xs[0], ys[0]);
  ctx.rotate(ang * 0.85 + (mode === 'defeat' ? 0.35 : mode === 'hurt' ? -0.25 : 0));
  if (asleep) ctx.translate(0, 1 + Math.sin(time * 2.2 + enemy.id) * 0.6);
  ctx.drawImage(face, -hw * 0.2, -hh * 0.62, hw, hh);
  ctx.restore();
  if (mode === 'dazed') {
    // three little stars over the head
    ctx.fillStyle = '#fde68a';
    for (let k = 0; k < 3; k++) {
      const a = time * 4 + (k * Math.PI * 2) / 3;
      ctx.beginPath(); ctx.arc(xs[0] + Math.cos(a) * 11, ys[0] - 26 + Math.sin(a) * 4, 2.2, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
  return true;
}

/** the painted frames: picks the clip for the snake's mode, and dissolves for a moment when it changes pose */
function drawPainted(ctx: CanvasRenderingContext2D, enemy: Enemy, r: Rig, mode: GoldMode, asleep: boolean, fs: number, dt: number, time: number) {
  r.t = (r.t ?? 0) + dt;
  r.defT = enemy.defeated ? (r.defT ?? 0) + dt : 0;
  const waking = (enemy.wakeT ?? 0) > 0 && !enemy.defeated;
  let seq: string, frame: string;
  if (mode === 'defeat') { seq = 'defeat'; frame = ANIM.at(seq, r.defT / 0.9); }
  else if (asleep) { seq = 'sleep'; frame = ANIM.ping(seq, r.t + enemy.id, 5); }
  else if (waking) { seq = 'wake'; frame = ANIM.at(seq, 1 - (enemy.wakeT ?? 0) / 1.1); }
  else if (mode === 'dazed') { seq = 'dazed'; frame = ANIM.ping(seq, r.t, 8); }
  else if (mode === 'hurt') { seq = 'hurt'; frame = ANIM.at(seq, (1 - (enemy.recoil ?? 0)) / 0.65); }
  else if (mode === 'rear') { seq = 'rear'; frame = ANIM.ping(seq, r.t, 14); }
  else if (mode === 'strike') { seq = 'strike'; frame = ANIM.at(seq, r.modeT / 0.18); }
  else if (mode === 'recover') { seq = 'recover'; frame = ANIM.at(seq, r.modeT / 0.55); }
  else { seq = 'prowl'; frame = ANIM.loop(seq, r.t + enemy.id * 0.37, 16); }
  if (r.seq !== seq) {
    if (r.frame) { r.prev = r.frame; r.fade = FADE; }
    r.seq = seq;
  }
  r.frame = frame;
  r.fade = Math.max(0, (r.fade ?? 0) - dt);

  ctx.save();
  ctx.translate(enemy.x, enemy.y + 12);
  ctx.scale(fs, 1);
  // contact shadow
  ctx.fillStyle = 'rgba(20,35,20,.22)';
  ctx.beginPath();
  ctx.ellipse(0, 0.5, SHADOW[seq] ?? 40, 2.6, 0, 0, Math.PI * 2);
  ctx.fill();
  if (enemy.hitFlashTimer > 0) ctx.filter = 'brightness(2.4)';
  if (asleep) {
    // breathing
    ctx.scale(1, 1 + Math.sin(time * 2.2 + enemy.id) * 0.018);
  }
  ANIM.draw(ctx, frame, 1);
  if (r.fade > 0 && r.prev) {
    ctx.globalAlpha = r.fade / FADE;
    ANIM.draw(ctx, r.prev, 1);
    ctx.globalAlpha = 1;
  }
  ctx.filter = 'none';
  if (mode === 'dazed') {
    ctx.fillStyle = '#fde68a';
    for (let k = 0; k < 3; k++) {
      const a = time * 4 + (k * Math.PI * 2) / 3;
      ctx.beginPath(); ctx.arc(26 + Math.cos(a) * 11, -46 + Math.sin(a) * 4, 2.2, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
}

/** the sheets this sprite draws from (sheetWarm.ts spriteSheets: asked for before the stage starts, not when it first comes on screen) */
export const GOLDSNAKE_SHEETS: readonly string[] = [new URL('../assets/enemies/goldsnake-head.webp', import.meta.url).href, new URL('../assets/enemies/goldsnake-sleep.webp', import.meta.url).href, new URL('../assets/enemies/goldsnake-wake.webp', import.meta.url).href];
/** start loading them now (the stage preload and the stage start; QA's mid-stage 'blank wait' lines, 2026-10-29) */
export function warmGoldsnakeSprite(): void {
  if (goldSnakeEnabled()) load();
}
