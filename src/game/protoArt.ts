/**
 * protoArt — Matt's painted props: World 1's three Gemini sheets (2026-10-23, the hand-built 1-6 and every World 1 stage), and each
 * other world's own ground and climbing sheets as they arrive (kitAtlasData.ts).
 *
 * The log, the rock, the golden seed, the leaf curtain, the branches (whole, creaking, snapped), the perch, the earth banks, the moss
 * floor and the root wall. Every draw returns false until the atlas has loaded, and the caller then draws the old shapes.
 */
import type { Collectible, Platform } from './types.ts';
import { trackAtlas } from './atlasLoader.ts';
import { PROTO_FRAMES, type ProtoFrame } from './protoAtlasData.ts';
import { KIT_FRAMES } from './kitAtlasData.ts';
import { PROTO2_FRAMES } from './proto2AtlasData.ts';

const KIT_KEY = 'sloth_paint_w1';
/** the painted World 1 kit on every World 1 stage (saved on the device): off by default while testers play */
export function paintedKitEnabled(): boolean {
  try {
    return typeof localStorage !== 'undefined' && localStorage.getItem(KIT_KEY) === '1';
  } catch {
    return false;
  }
}
export function setPaintedKitPref(on: boolean) {
  try {
    if (on) localStorage.setItem(KIT_KEY, '1');
    else localStorage.removeItem(KIT_KEY);
  } catch {
    /* ignore */
  }
}

/*
 * One kit per world. World 1's atlas (props-atlas.webp, PROTO_FRAMES) has every piece, the log, the seed and the leaf curtain too; another
 * world's atlas (kits/w<N>.webp, KIT_FRAMES) has its own ground and climbing pieces, and anything it lacks comes from World 1's.
 */
let kitWorld = 1;
/** which world's kit the painted layer draws (the engine sets it when a stage starts) */
export function setKitWorld(w: number) {
  kitWorld = hasKit(w) ? w : 1;
}
/** whether a world has its own painted kit yet */
export function hasKit(w: number): boolean {
  return w === 1 || !!KIT_FRAMES[w];
}
/** whether the painted layer is drawing a world's own kit (true) or World 1's (false) */
function ownKit(): boolean {
  return kitWorld !== 1;
}
const imgs = new Map<number, HTMLImageElement>();
const ready = new Set<number>();
function load(w: number) {
  if (imgs.has(w) || typeof Image === 'undefined') return;
  const im = new Image();
  imgs.set(w, im);
  const url = w === 1 ? new URL('../assets/proto/props-atlas.webp', import.meta.url).href : new URL(`../assets/kits/w${w}.webp`, import.meta.url).href;
  trackAtlas(im, url, () => { ready.add(w); }, () => { imgs.delete(w); });
}
// Matt's second World 1 sheet set (2026-10-23): the kapok trunk with a hollow, a plain trunk, and the hiding bushes
let img2: HTMLImageElement | null = null;
let ready2 = false;
function load2() {
  if (img2 || typeof Image === 'undefined') return;
  const im = new Image();
  img2 = im;
  trackAtlas(im, new URL('../assets/proto/props2-atlas.webp', import.meta.url).href, () => { ready2 = true; }, () => { img2 = null; });
}
/** a piece of the second sheet so it fills the box (x, y, w, h); false until it has loaded */
function blit2(ctx: CanvasRenderingContext2D, n: keyof typeof PROTO2_FRAMES, x: number, y: number, w: number, h: number): boolean {
  load2();
  if (!ready2 || !img2) return false;
  const f = PROTO2_FRAMES[n];
  ctx.drawImage(img2, f.x, f.y, f.w, f.h, x, y, w, h);
  return true;
}

/**
 * A hollow in a climb trunk (1-4's secret): the painted trunk section with its round opening, centred on the trunk at height y (the
 * opening's middle). `glow` (he is close): the variant with warm light inside, so something is plainly in there.
 */
export function drawHollowArt(ctx: CanvasRenderingContext2D, x: number, y: number, glow: boolean): boolean {
  const f = PROTO2_FRAMES.hollow;
  // a little wider than the stacked trunk (84), the way a kapok swells where it is hollow
  const w = 104;
  const h = (w * f.h) / f.w;
  // the opening's middle sits 47% of the way down the painting
  return blit2(ctx, glow ? 'hollowGlow' : 'hollow', x - w / 2, y - h * 0.47, w, h);
}

export function protoArtReady() {
  load(1);
  if (kitWorld !== 1) load(kitWorld);
  return ready.has(1) && (kitWorld === 1 || ready.has(kitWorld));
}

type Name = keyof typeof PROTO_FRAMES;
/** the picture and the rect of piece `n`: this world's own when it has one, else World 1's */
function frameOf(n: Name): { img: HTMLImageElement; f: ProtoFrame } {
  const own = kitWorld !== 1 ? KIT_FRAMES[kitWorld]?.[n] : undefined;
  if (own && ready.has(kitWorld)) return { img: imgs.get(kitWorld)!, f: own };
  return { img: imgs.get(1)!, f: PROTO_FRAMES[n] };
}
/** draw frame `n` so it fills the box (x, y, w, h) */
function blit(ctx: CanvasRenderingContext2D, n: Name, x: number, y: number, w: number, h: number) {
  const { img, f } = frameOf(n);
  ctx.drawImage(img, f.x, f.y, f.w, f.h, x, y, w, h);
}
/** frame `n` at width w, keeping its shape, with its bottom at y and centred on cx */
function stand(ctx: CanvasRenderingContext2D, n: Name, cx: number, bottom: number, w: number) {
  const { f } = frameOf(n);
  const h = (w * f.h) / f.w;
  blit(ctx, n, cx - w / 2, bottom - h, w, h);
}

/** the hollow log, with a puff of dust while it is moving */
export function drawLogArt(ctx: CanvasRenderingContext2D, p: Platform, moving: boolean): boolean {
  if (!protoArtReady()) return false;
  // the painted log sits a little proud of its box: the moss and the twig stick up above the top
  const f = frameOf('log').f;
  const w = p.width * 1.08;
  const h = (w * f.h) / f.w;
  ctx.save();
  ctx.fillStyle = 'rgba(20, 30, 10, 0.28)';
  ctx.beginPath();
  ctx.ellipse(p.x + p.width / 2, p.y + p.height + 2, p.width * 0.55, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  blit(ctx, moving ? 'logPush' : 'log', p.x + p.width / 2 - w / 2, p.y + p.height - h + 4, w, h);
  ctx.restore();
  return true;
}

/** the low mossy rock the log stops against */
export function drawRockArt(ctx: CanvasRenderingContext2D, p: Platform): boolean {
  if (!protoArtReady()) return false;
  stand(ctx, 'boulder', p.x + p.width / 2, p.y + p.height + 3, p.width * 1.15);
  return true;
}

export function drawSeedArt(ctx: CanvasRenderingContext2D, c: Collectible, t: number): boolean {
  if (!protoArtReady()) return false;
  const bob = Math.sin(t * 2.2 + c.bobPhase) * 4;
  ctx.save();
  const glow = ctx.createRadialGradient(c.x, c.y + bob, 2, c.x, c.y + bob, 40);
  glow.addColorStop(0, 'rgba(255, 226, 120, 0.75)');
  glow.addColorStop(1, 'rgba(255, 200, 60, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(c.x, c.y + bob, 40, 0, Math.PI * 2);
  ctx.fill();
  stand(ctx, 'seed', c.x, c.y + bob + 20, 30);
  const s = (Math.sin(t * 4 + c.bobPhase) + 1) / 2;
  ctx.fillStyle = `rgba(255,255,255,${0.4 + 0.5 * s})`;
  ctx.beginPath();
  ctx.arc(c.x - 5, c.y + bob - 2, 2.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  return true;
}

/** the leaf curtain over the nook: thick, then parted as Pokey comes close (a crossfade) */
export function drawCurtainArt(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, near: number): boolean {
  if (!protoArtReady()) return false;
  ctx.save();
  ctx.globalAlpha = 1 - near;
  blit(ctx, 'curtain', x, y, w, h);
  ctx.globalAlpha = near * 0.9;
  blit(ctx, 'curtainOpen', x, y, w, h);
  ctx.restore();
  return true;
}

const topCache = new Map<string, number>();
/**
 * Where the solid top of a painted piece starts, as a share of its height: the first row the picture fills across most of its
 * width. A branch painting carries a bromeliad and moss tufts above the bark, so lining the picture's top edge up with the walkable
 * top left Pokey standing on the air above the log (Matt, 2026-10-23). Measured once per picture; each world's kit has its own.
 */
function solidTop(n: Name, fallback: number): number {
  const { img, f } = frameOf(n);
  const key = `${img.src}#${n}`;
  const hit = topCache.get(key);
  if (hit !== undefined) return hit;
  let v = fallback;
  try {
    const c = document.createElement('canvas');
    const w = Math.min(160, f.w), h = Math.round((f.h * w) / f.w);
    c.width = w;
    c.height = h;
    const g = c.getContext('2d', { willReadFrequently: true })!;
    g.drawImage(img, f.x, f.y, f.w, f.h, 0, 0, w, h);
    const a = g.getImageData(0, 0, w, h).data;
    for (let y = 0; y < h; y++) {
      let n2 = 0;
      for (let x = 0; x < w; x++) if (a[(y * w + x) * 4 + 3] > 40) n2++;
      if (n2 > w * 0.6) { v = y / h; break; }
    }
  } catch {
    /* no canvas to measure on: the measured share for World 1's branch */
  }
  topCache.set(key, v);
  return v;
}

/** a branch you land on: whole, creaking (a timer is running), or snapped (the halves fall away for a second) */
export function drawBranchArt(ctx: CanvasRenderingContext2D, p: Platform, state: 'whole' | 'creak' | 'snapped', since: number): boolean {
  if (!protoArtReady()) return false;
  const f = frameOf('branch').f;
  // the painted branch is thicker than the walkable strip: its top lines up with the platform top
  const h = Math.max(30, Math.min(54, (p.width * f.h) / f.w));
  // the bark's top on the walkable top (2 px down, so his feet sink into the moss a touch rather than hover)
  const name: Name = state === 'creak' ? 'branchCreak' : 'branch';
  const y = p.y + 2 - solidTop(name, 0.29) * h;
  if (state === 'snapped') {
    if (since > 1.4) return true;
    const drop = 0.5 * 2200 * since * since;
    const half = p.width / 2;
    ctx.save();
    ctx.globalAlpha = Math.max(0, 1 - since / 1.4);
    ctx.translate(p.x + half * 0.5, y + drop);
    ctx.rotate(0.35 * since);
    blit(ctx, 'snapL', -half * 0.5, 0, half, h * 1.3);
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = Math.max(0, 1 - since / 1.4);
    ctx.translate(p.x + half * 1.5, y + drop * 1.1);
    ctx.rotate(-0.4 * since);
    blit(ctx, 'snapR', -half * 0.5, 0, half, h * 1.3);
    ctx.restore();
    return true;
  }
  blit(ctx, name, p.x - 6, y, p.width + 12, h);
  return true;
}

/** the perch branch at the top of a climb trunk, growing out to the right */
export function drawPerchArt(ctx: CanvasRenderingContext2D, trunkX: number, perchY: number, perchRight: number): boolean {
  if (!protoArtReady()) return false;
  const f = frameOf('perch').f;
  const w = Math.max(120, perchRight - trunkX + 70);
  const h = (w * f.h) / f.w;
  // the art's trunk stub is its left third: centre that on the trunk
  blit(ctx, 'perch', trunkX - w * 0.2, perchY - h * 0.42, w, h);
  return true;
}

/** a bank of earth: the painted top edge repeated along it, the end caps where it drops away */
export function drawBankArt(ctx: CanvasRenderingContext2D, p: Platform, open: { left: boolean; right: boolean }, moss: boolean, viewBottom = 0): boolean {
  if (!protoArtReady()) return false;
  if (!moss) drawGroundFill(ctx, p, viewBottom);
  const n: Name = moss ? 'mossStrip' : 'bank';
  const f = frameOf(n).f;
  const th = moss ? 46 : 110;
  const tw = (th * f.w) / f.h;
  ctx.save();
  ctx.beginPath();
  ctx.rect(p.x - (open.left ? 26 : 0), p.y - 30, p.width + (open.left ? 26 : 0) + (open.right ? 26 : 0), th + 40);
  ctx.clip();
  for (let x = p.x - (open.left ? 18 : 0); x < p.x + p.width + 18; x += tw - 2) blit(ctx, n, x, p.y - (moss ? 14 : 18), tw, th);
  ctx.restore();
  if (!moss) {
    const cap = frameOf('bankEnd').f;
    const cw = (th * cap.w) / cap.h;
    if (open.right) blit(ctx, 'bankEnd', p.x + p.width - cw * 0.55, p.y - 18, cw, th);
    if (open.left) {
      ctx.save();
      ctx.translate(p.x + cw * 0.55, 0);
      ctx.scale(-1, 1);
      blit(ctx, 'bankEnd', 0, p.y - 18, cw, th);
      ctx.restore();
    }
  }
  return true;
}

/** a world with its own kit: the deep ground below the top band, in that world's earth or rock, all the way down */
function drawGroundFill(ctx: CanvasRenderingContext2D, p: Platform, viewBottom: number) {
  const f = ownKit() ? KIT_FRAMES[kitWorld]?.fill : undefined;
  const img = imgs.get(kitWorld);
  if (!f || !img || !ready.has(kitWorld)) return;
  const tw = 230;
  const th = (tw * f.h) / f.w;
  const top = p.y + 70;
  // the drawn ground underneath runs to the bottom of the screen, so the painted one does too
  const bottom = Math.max(p.y + p.height, viewBottom);
  if (bottom <= top) return;
  ctx.save();
  ctx.beginPath();
  ctx.rect(p.x, top, p.width, bottom - top + 2);
  ctx.clip();
  // anchored to the world, not the platform, so neighbouring banks line up
  const x0 = Math.floor(p.x / (tw - 2)) * (tw - 2);
  for (let y = top; y < bottom; y += th - 2) for (let x = x0; x < p.x + p.width; x += tw - 2) ctx.drawImage(img, f.x, f.y, f.w, f.h, x, y, tw, th);
  ctx.restore();
}

/** the face of the high canopy wall: the painted root wall, once, from its mossy lip down to the ground */
export function drawWallArt(ctx: CanvasRenderingContext2D, x: number, top: number, bottom: number, w: number): boolean {
  if (!protoArtReady()) return false;
  blit(ctx, 'wall', x - 14, top - 14, w + 14, bottom - top + 30);
  return true;
}

/** a world with its own kit paints every thin ledge with its own piece (a drifting river log and a spring keep their own look) */
function thinKit(p: Platform): boolean {
  return p.height < 50 && !p.push && p.type !== 'drift' && p.type !== 'bouncy';
}
/** which of the stage's platforms the painted props draw (the rest keep the drawn look) */
export function paintedPlatforms(platforms: Platform[]): Set<number> {
  const out = new Set<number>();
  for (const p of platforms) {
    if (p.push) out.add(p.id);
    else if (p.height < 50 && (p.style === 'branch' || (ownKit() && thinKit(p)))) out.add(p.id);
    else if (p.height === 50 && p.style === 'moss_stone') out.add(p.id);
  }
  return out;
}

export interface ProtoSceneState {
  /** when each crumbling branch broke (game time) */
  brokeAt: Map<number, number>;
  /** game time each log last moved */
  movedAt: Map<number, number>;
}

/**
 * The painted layer of the hand-built stage, drawn after the ground: the bank tops, the moss floors and the root wall over the drawn
 * ground, then the branches, perches, the rock and the log. Returns false (draw nothing) until the atlas is loaded.
 */
export function drawProtoScene(
  ctx: CanvasRenderingContext2D,
  platforms: Platform[],
  trees: Array<{ x: number; topY: number }>,
  vines: Array<{ vineType?: string; x: number; topY: number; bottomY?: number }>,
  t: number,
  view: { x0: number; x1: number; y1?: number },
  st: ProtoSceneState,
): boolean {
  if (!protoArtReady()) return false;
  const vis = (p: Platform) => p.x + p.width > view.x0 - 80 && p.x < view.x1 + 80;
  const banks = platforms.filter((p) => p.height >= 90 && !p.push);
  for (const p of banks) {
    if (!vis(p)) continue;
    const touches = (side: 'l' | 'r') => banks.some((q) => q !== p && q.y <= p.y + 2 && (side === 'l' ? Math.abs(q.x + q.width - p.x) < 2 : Math.abs(p.x + p.width - q.x) < 2));
    // the high canopy: a wall face on the side that faces the yard
    const isWall = banks.some((q) => q !== p && Math.abs(q.x + q.width - p.x) < 2 && q.y - p.y > 150);
    if (isWall) drawWallArt(ctx, p.x, p.y, banks.find((q) => Math.abs(q.x + q.width - p.x) < 2)!.y + 6, 230);
    drawBankArt(ctx, p, { left: !touches('l') && !isWall, right: !touches('r') }, p.style === 'moss_stone', view.y1 ?? 0);
  }
  // the climb trunks: the painted kapok trunk with its vine, stacked from the ground up to the branch it reaches
  const tf = frameOf('trunk').f;
  for (const v of vines) {
    if (v.vineType !== 'tree_climb' || v.x < view.x0 - 120 || v.x > view.x1 + 120) continue;
    const bottom = (v as { bottomY?: number }).bottomY ?? v.topY + 300;
    const tw = 84;
    const th = (tw * tf.h) / tf.w;
    ctx.save();
    ctx.beginPath();
    ctx.rect(v.x - tw, v.topY - 30, tw * 2, bottom + 14 - (v.topY - 30));
    ctx.clip();
    for (let y = bottom + 10 - th; y > v.topY - 30 - th; y -= th - 6) blit(ctx, 'trunk', v.x - tw / 2, y, tw, th);
    ctx.restore();
  }
  // branches (a perch where a climb trunk ends under one)
  const tops = vines.filter((v) => v.vineType === 'tree_climb');
  for (const p of platforms) {
    if (!vis(p) || p.push || p.height >= 50 || (p.style !== 'branch' && !(ownKit() && thinKit(p)))) continue;
    const trunk = tops.find((v) => v.x >= p.x && v.x <= p.x + p.width && Math.abs(v.topY + 2 - p.y) < 4);
    if (trunk && p.width <= 220) {
      drawPerchArt(ctx, trunk.x, p.y, p.x + p.width);
      continue;
    }
    if (p.type === 'fragile') {
      if (p.broken) {
        if (!st.brokeAt.has(p.id)) st.brokeAt.set(p.id, t);
        drawBranchArt(ctx, p, 'snapped', t - st.brokeAt.get(p.id)!);
      } else {
        st.brokeAt.delete(p.id);
        drawBranchArt(ctx, p, p.fragileTimer !== undefined ? 'creak' : 'whole', 0);
      }
      continue;
    }
    drawBranchArt(ctx, p, 'whole', 0);
  }
  for (const p of platforms) {
    if (!vis(p)) continue;
    if (p.height === 50 && p.style === 'moss_stone') drawRockArt(ctx, p);
  }
  for (const p of platforms) {
    if (!vis(p) || !p.push) continue;
    drawLogArt(ctx, p, t - (st.movedAt.get(p.id) ?? -9) < 0.2);
  }
  void trees;
  return true;
}
