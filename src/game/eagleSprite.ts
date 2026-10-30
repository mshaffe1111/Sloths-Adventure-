/**
 * Painted Harpy Eagle. Draws the eagle from the pose atlas (Kling sheets) instead of the code-drawn rig.
 *
 * Same idea as heroSprite.ts: a switch, not a replacement. `?eagle=sprite` / `?eagle=classic` picks one for the
 * session, `localStorage.sloth_eagle = 'sprite'` keeps it, and DEFAULT_SPRITE_EAGLE decides when nothing is set.
 * It returns false while the atlas loads (or when switched off) and the caller then draws the vector eagle,
 * so the game never shows nothing.
 *
 * Poses: the wing loop (patrol, hover, climb), the screech before a dive, the dive and the talons-out strike, each a short clip
 * made from these same painted poses (eagleAnimData.ts); the single painted frames are drawn while that sheet loads.
 */
import type { Enemy } from './types.ts';
import { bodyFor, clamp, damp, Spring } from './creatureRig.ts';
import { EAGLE_FLAP, EAGLE_FRAMES } from './eagleAtlasData.ts';
import { trackAtlas } from './atlasLoader.ts';
import { makeCreatureAnim } from './creatureAnim.ts';
import { EAGLE_ANIM, EAGLE_ANIM_UP, EAGLE_ANIM_URL, EAGLE_SEQ } from './eagleAnimData.ts';
import { FONT_UI } from './fonts.ts';

/** the clips of the eagle's own poses (2026-10-25): a full wing beat, the screech before a dive, the dive and the talons-out strike */
const ANIM = makeCreatureAnim(EAGLE_ANIM_URL, EAGLE_ANIM, EAGLE_SEQ, EAGLE_ANIM_UP);

export const DEFAULT_SPRITE_EAGLE = true;
/** world units per atlas pixel: the eye is about 27 px across in the atlas, so this makes the eye about 12 units */
const K = 0.44;
/** where the eye sits relative to the enemy's centre (x is forward), so the body fills the hit box */
const EYE_DX = 12;
const EYE_DY = -4;
/** the dive: wings up as it tips over, then swept back and head-down, then talons out for the strike */
const DIVE_FRAMES = ['dive_c', 'dive_b', 'dive_a'];
const STRIKE_FRAME = 'swoop';
/** wings spread and crest up, held while it warns */
const FLARE_FRAME = 'flare';

let enabled: boolean | null = null;
export function eagleSpriteEnabled(): boolean {
  if (enabled !== null) return enabled;
  let v = DEFAULT_SPRITE_EAGLE;
  try {
    const q = new URLSearchParams(location.search).get('eagle');
    if (q === 'sprite') v = true;
    else if (q === 'classic') v = false;
    else if (localStorage.getItem('sloth_eagle') === 'sprite') v = true;
  } catch {
    /* no window or storage: keep the default */
  }
  enabled = v;
  return v;
}

let atlas: HTMLImageElement | null = null;
let ready = false;
function load() {
  if (atlas || typeof Image === 'undefined') return;
  const img = new Image();
  atlas = img;
  trackAtlas(img, new URL('../assets/enemies/eagle-atlas.webp', import.meta.url).href, () => { ready = true; }, () => { atlas = null; }, () => { atlas = null; ready = false; });
}

interface SpriteRig {
  clock: number;
  pitch: Spring;
  diveT: number;
  /** seconds since the warning began, and a running clock for the wing beat */
  flareT: number;
  t: number;
}

export function drawEagleSprite(ctx: CanvasRenderingContext2D, enemy: Enemy, time: number): boolean {
  if (!eagleSpriteEnabled()) return false;
  load();
  if (!ready || !atlas) return false;

  const b = bodyFor('eaglespr', enemy, time);
  if (!b.rig) b.rig = { clock: enemy.id * 3.1, pitch: new Spring(0), diveT: 0, flareT: 0, t: enemy.id * 0.37 } as SpriteRig;
  const r = b.rig as SpriteRig;

  const phase = enemy.swoopPhase;
  const flare = phase === 'telegraph' || (enemy.telegraphTimer > 0 && phase !== 'swoop');
  const dive = !flare && (phase === 'swoop' || enemy.isAttacking);
  const hover = phase === 'hover';
  const fps = hover ? 20 : phase === 'ascend' ? 18 : 14;

  if (b.dt > 0) {
    r.clock += fps * b.dt;
    r.diveT = dive ? r.diveT + b.dt : 0;
    r.flareT = flare ? r.flareT + b.dt : 0;
    r.t += b.dt * (hover ? 1.25 : phase === 'ascend' ? 1.15 : 1);
    const bias = hover ? -0.28 : flare ? -0.15 : 0;
    // the dive frames are already drawn nose-down, so they take only a little of the velocity tilt
    const target = clamp(Math.atan2(b.vy, Math.abs(b.fv) + 25) * 0.85, -0.7, 0.9) * (dive ? 0.25 : 1) + bias;
    r.pitch.step(target, 70, 11, b.dt);
  }

  let name: string;
  if (dive) name = enemy.isAttacking && r.diveT > 0.3 ? STRIKE_FRAME : DIVE_FRAMES[Math.min(DIVE_FRAMES.length - 1, Math.floor(r.diveT / 0.12))];
  else if (flare) name = FLARE_FRAME;
  else name = EAGLE_FLAP[Math.floor(r.clock) % EAGLE_FLAP.length];
  const f = EAGLE_FRAMES[name];
  if (!f) return false;
  // the animated clip for the same moment, once its sheet has loaded
  let clip: string | null = null;
  if (ANIM.ready()) {
    if (dive) clip = enemy.isAttacking && r.diveT > 0.3 ? ANIM.at('swoop', (r.diveT - 0.3) / 0.6) : ANIM.at('dive', r.diveT / 0.45);
    else if (flare) clip = ANIM.at('flare', r.flareT / 0.9);
    else clip = ANIM.loop('fly', r.t, 16);
  }

  ctx.save();
  ctx.translate(enemy.x, enemy.y);
  ctx.scale(b.fs, 1);

  if (hover) {
    // the same "it is open to a hit" ring the code-drawn eagle shows
    ctx.save();
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.85)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, -6, 40, 0, Math.PI * 2);
    ctx.stroke();
    const sp = textStamp(SPARKLE, ctx);
    if (!sp) ctx.font = SPARKLE.font;
    for (let k = 0; k < 3; k++) {
      const a = time * 5 + (k * Math.PI * 2) / 3;
      const x = 16 + Math.cos(a) * 22;
      const y = -16 + Math.sin(a) * 12;
      if (sp) ctx.drawImage(sp.cv, x + sp.dx, y + sp.dy, sp.w, sp.h);
      else ctx.fillText(SPARKLE.text, x, y);
    }
    ctx.restore();
  }

  ctx.save();
  ctx.translate(EYE_DX, EYE_DY + (flare ? Math.sin(time * 70) * 1.2 : 0));
  ctx.rotate(r.pitch.x);
  if (!(clip && ANIM.draw(ctx, clip, K))) ctx.drawImage(atlas, f.x, f.y, f.w, f.h, -f.ax * K, -f.ay * K, f.w * K, f.h * K);
  ctx.restore();

  if (flare) {
    // the warning the code-drawn eagle gives before a swoop: an orange ring and a red "!", drawn over the wings
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.95)';
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.arc(0, 0, 42, 0, Math.PI * 2);
    ctx.stroke();
    ctx.save();
    ctx.scale(b.fs < 0 ? -1 : 1, 1); // keep the "!" the right way round when the eagle faces left
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(16, -56, 9, 0, Math.PI * 2);
    ctx.fill();
    const bang = textStamp(BANG, ctx);
    if (bang) ctx.drawImage(bang.cv, 16 + bang.dx, -56 + bang.dy, bang.w, bang.h);
    else {
      ctx.fillStyle = BANG.fill;
      ctx.font = BANG.font;
      ctx.textAlign = BANG.align;
      ctx.textBaseline = BANG.baseline;
      ctx.fillText(BANG.text, 16, -56);
    }
    ctx.restore();
  }
  ctx.restore();
  return true;
}

// ───────── the sparkles and the "!" (text drawn once into a small picture, PERFORMANCE-RULES §3.4) ─────────
interface StampSpec {
  text: string;
  font: string;
  fill: string;
  align: CanvasTextAlign;
  baseline: CanvasTextBaseline;
  /** the baked picture, and where its corner sits from the point fillText would be given (world units), at scale k */
  baked?: { cv: HTMLCanvasElement; dx: number; dy: number; w: number; h: number; k: number } | null;
}
/** the "open to a hit" sparkles, as fillText drew them: the canvas's default black, from the left, on the baseline */
const SPARKLE: StampSpec = { text: '✨', font: `bold 12px ${FONT_UI}`, fill: '#000000', align: 'start', baseline: 'alphabetic' };
const BANG: StampSpec = { text: '!', font: `bold 12px ${FONT_UI}`, fill: '#ffffff', align: 'center', baseline: 'middle' };
/**
 * The text baked at the canvas's own scale (device px a world unit, in quarters, rounded up), so it is stamped at about its size and needs
 * no high-quality shrink; made again only when that scale changes (a quality step, the camera's zoom). Null until the font is in.
 */
function textStamp(s: StampSpec, ctx: CanvasRenderingContext2D): StampSpec['baked'] {
  const m = typeof ctx.getTransform === 'function' ? ctx.getTransform() : null;
  const k = m ? Math.max(1, Math.ceil(Math.hypot(m.a, m.b) * 4) / 4) : 4;
  if (s.baked !== undefined && (s.baked === null || s.baked.k === k)) return s.baked;
  if (typeof document === 'undefined') return null;
  // the game's font may still be loading: draw the text as before until it is in, so the picture never keeps a stand-in font
  if (document.fonts && !document.fonts.check(s.font)) return null;
  const cv = s.baked?.cv ?? document.createElement('canvas');
  const g = cv.getContext('2d');
  if (!g) return (s.baked = null);
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.font = s.font;
  g.textAlign = s.align;
  g.textBaseline = s.baseline;
  const tm = g.measureText(s.text);
  const pad = 2;
  const left = Math.ceil(tm.actualBoundingBoxLeft) + pad;
  const up = Math.ceil(tm.actualBoundingBoxAscent) + pad;
  const w = left + Math.ceil(tm.actualBoundingBoxRight) + pad;
  const h = up + Math.ceil(tm.actualBoundingBoxDescent) + pad;
  cv.width = Math.ceil(w * k);
  cv.height = Math.ceil(h * k);
  g.scale(cv.width / w, cv.height / h);
  g.font = s.font;
  g.textAlign = s.align;
  g.textBaseline = s.baseline;
  g.fillStyle = s.fill;
  g.fillText(s.text, left, up);
  return (s.baked = { cv, dx: -left, dy: -up, w, h, k });
}

/** the sheets this sprite draws from (sheetWarm.ts spriteSheets: asked for before the stage starts, not when it first comes on screen) */
export const EAGLE_SHEETS: readonly string[] = [new URL('../assets/enemies/eagle-atlas.webp', import.meta.url).href];
/** start loading them now (the stage preload and the stage start; QA's mid-stage 'blank wait' lines, 2026-10-29) */
export function warmEagleSprite(): void {
  if (eagleSpriteEnabled()) load();
}
