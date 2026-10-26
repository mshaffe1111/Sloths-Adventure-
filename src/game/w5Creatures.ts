/**
 * w5Creatures — World 5's trained creature art on the stage (2026-10-26): the jumping spider's clips (spider-anim.webp: walk, idle,
 * crouch and hurt; its attack, dizzy and knocked-out stay the single painted frames of spiderSprite.ts) and the Butler's pose sheet
 * (butler-poses.webp: idle, move, tell, attack, hurt, defeated). The Dangler, Seamstress, Orchid Mantis and Dozer moth sheets are not in
 * 5-1 or 5-2, so nothing loads them yet.
 *
 * Both are World 5 sheets: they start loading when a World 5 stage that holds the creature starts (W5Play's constructor, and
 * stageSheets.ts STAGE_ANIMS for the spider's clips), and are let go when play moves to another world (atlasLoader.ts). Every draw
 * returns false until its sheet is in, and the caller draws what it drew before (the spider's painted stills or its vector rig, the
 * Butler's stand-in), so nothing ever disappears.
 */
import type { Enemy } from './types.ts';
import { bodyFor } from './creatureRig.ts';
import { makeCreatureAnim } from './creatureAnim.ts';
import { trackAtlas } from './atlasLoader.ts';
import { SPIDER_ANIM, SPIDER_ANIM_UP, SPIDER_ANIM_URL, SPIDER_SEQ } from './spiderAnimData.ts';
import { BUTLER_ATLAS_URL, BUTLER_FRAMES } from './butlerAtlasData.ts';

// ───────────────────────────── the jumping spider ─────────────────────────────

const spiderAnim = makeCreatureAnim(SPIDER_ANIM_URL, SPIDER_ANIM, SPIDER_SEQ, SPIDER_ANIM_UP);
/** the old stills' scale (spiderSprite.ts K): the clips carry the stills' anchor, drawn at K / ANIM_UP */
const SPIDER_K = 0.46;
/** the enemy's origin sits this far above its feet */
const SPIDER_GROUND = 12;
/** world units walked per walk cycle (17 frames) */
const SPIDER_STRIDE = 70;
/** it is on top of Pokey (fangs out: the painted attack still) this close */
const BITE = 46;

/** start the spider's clips loading (a World 5 stage with spiders, as it starts); true once they are in */
export const warmW5Spider = (): boolean => spiderAnim.ready();

/**
 * A World 5 jumping spider from its clips: crouched (the 0.7 s warning before it rushes: `crouch` 0..1 through it), hurt, walking by the
 * distance it covers, or idling. False for what the clips do not hold (knocked out, dizzy, fangs out on top of him) and while the sheet
 * loads: the caller then draws the painted stills (spiderSprite.ts), which hold those poses.
 */
export function drawW5Spider(ctx: CanvasRenderingContext2D, e: Enemy, t: number, playerX: number, crouch: number | null): boolean {
  if (e.defeated || (e.stagger ?? 0) > 0) return false;
  if (crouch === null && Math.abs(playerX - e.x) < BITE && !(e.recoil && e.recoil > 0.35)) return false;
  if (!spiderAnim.ready()) return false;
  const b = bodyFor('w5spider', e, t);
  if (!b.rig) b.rig = { dist: e.id * 11 };
  const r = b.rig as { dist: number };
  const moving = Math.abs(b.fv) > 10;
  if (b.dt > 0 && moving) r.dist += Math.abs(b.fv) * b.dt;
  let name: string;
  if ((e.recoil ?? 0) > 0.35) name = spiderAnim.at('hurt', 1 - Math.min(1, e.recoil ?? 0));
  else if (crouch !== null) name = spiderAnim.at('crouch', crouch);
  else if (moving) name = spiderAnim.at('walk', (r.dist / SPIDER_STRIDE) % 1);
  else name = spiderAnim.ping('idle', t + e.id * 0.37, 10);
  ctx.save();
  ctx.translate(e.x, e.y + SPIDER_GROUND);
  // (the clips face right; turned with the rig's eased facing, as the stills are)
  ctx.scale(b.fs < 0 ? -Math.max(0.6, -b.fs) : Math.max(0.6, b.fs), 1);
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath();
  ctx.ellipse(0, 1, 26, 3.4, 0, 0, Math.PI * 2);
  ctx.fill();
  if (e.hitFlashTimer > 0) ctx.filter = 'brightness(2.2)';
  const ok = spiderAnim.draw(ctx, name, SPIDER_K);
  ctx.restore();
  return ok;
}

// ───────────────────────────── the Butler ─────────────────────────────

let butlerImg: HTMLImageElement | null = null;
let butlerReady = false;
function loadButler() {
  if (butlerImg || typeof Image === 'undefined') return;
  const im = new Image();
  butlerImg = im;
  trackAtlas(im, BUTLER_ATLAS_URL, () => { butlerReady = true; }, () => { butlerImg = null; }, () => { butlerImg = null; butlerReady = false; });
}

/** start the Butler's poses loading (a World 5 stage with a Butler, as it starts); true once they are in */
export function warmW5Butler(): boolean {
  loadButler();
  return butlerReady && !!butlerImg;
}

export type ButlerPose = keyof typeof BUTLER_FRAMES;
/** how tall the Butler stands (world units): a head taller than Pokey, as the concept art has him */
export const BUTLER_H = 104;

/**
 * The Butler from his pose sheet, feet at (x, b), facing `dir`: `pose` as w5Play picks it (idle; the tell, lifting the tray as Pokey
 * comes; the attack, the tray held right out; hurt, then defeated, when the tray is punched away). His painted tray and cake come with
 * the poses, so the game draws no tray of its own over him. `bow` tips him a little (knocked). False while the sheet loads.
 */
export function drawButlerPose(ctx: CanvasRenderingContext2D, x: number, b: number, dir: 1 | -1, pose: ButlerPose, t: number, bow = 0): boolean {
  if (!warmW5Butler()) return false;
  const f = BUTLER_FRAMES[pose];
  if (!f) return false;
  const k = BUTLER_H / BUTLER_FRAMES.idle.h;
  ctx.save();
  ctx.translate(x, b);
  ctx.scale(dir, 1);
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath();
  ctx.ellipse(0, 1, 30, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  // (a polite breath while he stands)
  const breathe = pose === 'idle' ? 1 + Math.sin(t * 2.2) * 0.012 : 1;
  ctx.rotate(bow * 0.12);
  ctx.scale(1, breathe);
  ctx.drawImage(butlerImg!, f.x, f.y, f.w, f.h, -f.ax * k, -f.ay * k, f.w * k, f.h * k);
  ctx.restore();
  return true;
}
