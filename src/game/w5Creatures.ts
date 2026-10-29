/**
 * w5Creatures — World 5's trained creature art on the stage (2026-10-26): the jumping spider's clips (spider-anim.webp: walk, idle,
 * crouch and hurt; its attack, dizzy and knocked-out stay the single painted frames of spiderSprite.ts) and the Butler's pose sheet
 * (butler-poses.webp: idle, move, tell, attack, hurt, defeated), and the Seamstress's clips (seamstress-anim.webp, 5-4, 2026-10-29: she
 * knits, looks up with her needles raised and casts her lace; her pose sheet seamstress-poses.webp is what she draws while they load).
 * The Dangler, Orchid Mantis and Dozer have clip sheets too (danglerAnimData.ts, mantisAnimData.ts, dozerAnimData.ts) but are in no
 * stage yet, so nothing loads them.
 *
 * All are World 5 sheets: they start loading when a World 5 stage that holds the creature starts (W5Play's constructor, and
 * stageSheets.ts STAGE_DRAWS for the spider's clips), and are let go when play moves to another world (atlasLoader.ts). Every draw
 * returns false until its sheet is in, and the caller draws what it drew before (the spider's painted stills or its vector rig, the
 * Butler's stand-in), so nothing ever disappears.
 */
import type { Enemy } from './types.ts';
import { bodyFor } from './creatureRig.ts';
import { makeCreatureAnim } from './creatureAnim.ts';
import { trackAtlas } from './atlasLoader.ts';
import { SPIDER_ANIM, SPIDER_ANIM_UP, SPIDER_ANIM_URL, SPIDER_SEQ } from './spiderAnimData.ts';
import { BUTLER_ATLAS_URL, BUTLER_FRAMES } from './butlerAtlasData.ts';
import { SEAMSTRESS_ATLAS_URL, SEAMSTRESS_FRAMES } from './seamstressAtlasData.ts';
import { SEAMSTRESS_ANIM, SEAMSTRESS_ANIM_FPS, SEAMSTRESS_ANIM_UP, SEAMSTRESS_ANIM_URL, SEAMSTRESS_SEQ } from './seamstressAnimData.ts';
import { SEAMSTRESS } from './w5Kit.ts';

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

// ───────────────────────────── the Seamstress ─────────────────────────────

let seamImg: HTMLImageElement | null = null;
let seamReady = false;
function loadSeam() {
  if (seamImg || typeof Image === 'undefined') return;
  const im = new Image();
  seamImg = im;
  trackAtlas(im, SEAMSTRESS_ATLAS_URL, () => { seamReady = true; }, () => { seamImg = null; }, () => { seamImg = null; seamReady = false; });
}

/** start the Seamstress's poses loading (a World 5 stage where she knits, as it starts); true once they are in */
export function warmW5Seamstress(): boolean {
  loadSeam();
  seamAnim.ready();
  return seamReady && !!seamImg;
}

const seamAnim = makeCreatureAnim(SEAMSTRESS_ANIM_URL, SEAMSTRESS_ANIM, SEAMSTRESS_SEQ, SEAMSTRESS_ANIM_UP);
/** where in her attack clip a pose stands: the tell is its first 60% (needles up), the cast the rest (the lace flies); u 0..1 through each */
export const seamClipAt = (pose: SeamPose, u: number): number => {
  const v = Math.max(0, Math.min(1, u));
  return pose === 'tell' ? v * 0.6 : pose === 'attack' ? 0.6 + v * 0.4 : 0;
};

export type SeamPose = 'idle' | 'tell' | 'attack';

/**
 * which still of her sheet each pose draws. Knitting is the standing still with her needles and her knitting in her hands (the sheet's
 * "hurt" still, eyes on her work): the sheet's own idle still sits her on a disc of web with the lace spread round her, and upright at
 * 320 x 782 that read as "a webbed chair and a lace cloth", no character at all (QA v200)
 */
export const SEAM_STILL: Record<SeamPose, keyof typeof SEAMSTRESS_FRAMES> = { idle: 'hurt', tell: 'tell', attack: 'attack' };
/** the dark edge round her (source px of the sheet), so her pink reads against the pink and lilac of the dusk and her own silk */
const SEAM_EDGE = 5;
const seamEdged = new Map<string, HTMLCanvasElement>();
/** a still of hers with a dark plum edge all round, made once */
function edgedStill(name: keyof typeof SEAMSTRESS_FRAMES): HTMLCanvasElement | null {
  const got = seamEdged.get(name);
  if (got) return got;
  if (typeof document === 'undefined' || !seamImg) return null;
  const f = SEAMSTRESS_FRAMES[name];
  const e = SEAM_EDGE;
  const c = document.createElement('canvas');
  c.width = f.w + 2 * e;
  c.height = f.h + 2 * e;
  const g = c.getContext('2d');
  if (!g) return null;
  // (the silhouette, spread round by the edge's width, then darkened, then the still itself on top)
  for (let a = 0; a < 16; a++) {
    const r = (a * Math.PI) / 8;
    g.drawImage(seamImg, f.x, f.y, f.w, f.h, e + Math.cos(r) * e, e + Math.sin(r) * e, f.w, f.h);
  }
  g.globalCompositeOperation = 'source-in';
  g.fillStyle = '#2b1426';
  g.fillRect(0, 0, c.width, c.height);
  g.globalCompositeOperation = 'source-over';
  g.drawImage(seamImg, f.x, f.y, f.w, f.h, e, e, f.w, f.h);
  seamEdged.set(name, c);
  return c;
}

/** how far her head is from her feet's middle across (world px, the way she faces): her stills are anchored at the feet, off centre */
export const seamHeadDx = (pose: SeamPose): number => {
  const f = SEAMSTRESS_FRAMES[SEAM_STILL[pose]];
  return ((f.w * 0.45 - f.ax) * SEAMSTRESS.h) / SEAMSTRESS_FRAMES[SEAM_STILL.idle].h;
};
/** how tall her still for this pose stands, at the scale she is drawn (world px): the tell's raised needles stand over her head */
export const seamTop = (pose: SeamPose): number => (SEAMSTRESS.h * SEAMSTRESS_FRAMES[SEAM_STILL[pose]].h) / SEAMSTRESS_FRAMES[SEAM_STILL.idle].h;

/**
 * The Seamstress from her pose sheet, feet at (x, b), facing `dir`: knitting (idle: her lace spread on the ground before her), looking up
 * with her needles raised (the tell, `u` 0..1 through it), casting the lace (attack, `u` 0..1 through the cast). Her clips; until they are
 * in, her pose sheet's stills (she rises a little through the tell); until that is in too, a plain
 * stand-in of the same size: a pink fuzzy body in a lace apron, round glasses, dark legs and her needles.
 */
export function drawSeamstress(ctx: CanvasRenderingContext2D, x: number, b: number, dir: 1 | -1, pose: SeamPose, t: number, u = 0): void {
  const h = SEAMSTRESS.h;
  ctx.save();
  ctx.translate(x, b);
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath();
  ctx.ellipse(0, 1, 34, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.scale(dir, 1);
  // her clips (the dark plum edge is baked into the sheet): knitting is the clip of her standing still with her needles (eyes on her
  // work), the tell and the cast are the attack clip (needles raised, then the lace thrown), every frame at her stills' scale
  const kStill = h / SEAMSTRESS_FRAMES[SEAM_STILL.idle].h;
  if (seamAnim.ready()) {
    const name = pose === 'idle' ? seamAnim.ping('hurt', t, SEAMSTRESS_ANIM_FPS) : seamAnim.at('attack', seamClipAt(pose, u));
    if (seamAnim.draw(ctx, name, kStill)) {
      ctx.restore();
      return;
    }
  }
  if (warmW5Seamstress()) {
    const name = SEAM_STILL[pose];
    const f = SEAMSTRESS_FRAMES[name];
    // (every pose at the knitting pose's scale, so she keeps her size; a little lift through the tell, a breath as she knits)
    const k = kStill;
    ctx.translate(0, -u * 4);
    if (pose === 'idle') ctx.scale(1, 1 + Math.sin(t * 2.4) * 0.012);
    const edged = edgedStill(name);
    const e = SEAM_EDGE;
    if (edged) ctx.drawImage(edged, (-f.ax - e) * k, (-f.ay - e) * k, edged.width * k, edged.height * k);
    else ctx.drawImage(seamImg!, f.x, f.y, f.w, f.h, -f.ax * k, -f.ay * k, f.w * k, f.h * k);
    ctx.restore();
    return;
  }
  ctx.strokeStyle = '#3b2430';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  for (let i = 0; i < 4; i++) {
    const a = -0.9 + i * 0.6;
    ctx.beginPath();
    ctx.moveTo(Math.sin(a) * 18, -h * 0.35);
    ctx.quadraticCurveTo(Math.sin(a) * 40, -h * 0.5, Math.sin(a) * 46, 0);
    ctx.stroke();
  }
  ctx.fillStyle = '#f9a8d4';
  ctx.beginPath();
  ctx.ellipse(0, -h * 0.42, h * 0.3, h * 0.34, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff7ed';
  ctx.beginPath();
  ctx.ellipse(h * 0.04, -h * 0.32, h * 0.18, h * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fbcfe8';
  ctx.beginPath();
  ctx.arc(h * 0.06, -h * 0.8 - u * 4, h * 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#3b2430';
  ctx.lineWidth = 2;
  for (const ex of [0, 0.14]) {
    ctx.beginPath();
    ctx.arc(h * (ex + 0.02), -h * 0.82 - u * 4, h * 0.06, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.strokeStyle = '#c0c0c8';
  ctx.beginPath();
  ctx.moveTo(h * 0.2, -h * 0.45);
  ctx.lineTo(h * 0.42, -h * (pose === 'tell' ? 1.02 : 0.62));
  ctx.stroke();
  ctx.restore();
}
