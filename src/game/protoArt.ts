/**
 * protoArt — Matt's painted props for the hand-built 1-6 (three Gemini sheets, 2026-10-23, cut into one atlas).
 *
 * The log, the rock, the golden seed, the leaf curtain, the branches (whole, creaking, snapped), the perch, the earth banks, the moss
 * floor and the root wall. Every draw returns false until the atlas has loaded, and the caller then draws the old shapes.
 */
import type { Collectible, Platform } from './types.ts';
import { trackAtlas } from './atlasLoader.ts';
import { PROTO_FRAMES, type ProtoFrame } from './protoAtlasData.ts';

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

let img: HTMLImageElement | null = null;
let ready = false;
function load() {
  if (img || typeof Image === 'undefined') return;
  const im = new Image();
  img = im;
  trackAtlas(im, new URL('../assets/proto/props-atlas.webp', import.meta.url).href, () => { ready = true; }, () => { img = null; });
}
export function protoArtReady() {
  load();
  return ready && !!img;
}

type Name = keyof typeof PROTO_FRAMES;
/** draw frame `n` so it fills the box (x, y, w, h) */
function blit(ctx: CanvasRenderingContext2D, n: Name, x: number, y: number, w: number, h: number) {
  const f: ProtoFrame = PROTO_FRAMES[n];
  ctx.drawImage(img!, f.x, f.y, f.w, f.h, x, y, w, h);
}
/** frame `n` at width w, keeping its shape, with its bottom at y and centred on cx */
function stand(ctx: CanvasRenderingContext2D, n: Name, cx: number, bottom: number, w: number) {
  const f = PROTO_FRAMES[n];
  const h = (w * f.h) / f.w;
  blit(ctx, n, cx - w / 2, bottom - h, w, h);
}

/** the hollow log, with a puff of dust while it is moving */
export function drawLogArt(ctx: CanvasRenderingContext2D, p: Platform, moving: boolean): boolean {
  if (!protoArtReady()) return false;
  // the painted log sits a little proud of its box: the moss and the twig stick up above the top
  const f = PROTO_FRAMES.log;
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

/** a branch you land on: whole, creaking (a timer is running), or snapped (the halves fall away for a second) */
export function drawBranchArt(ctx: CanvasRenderingContext2D, p: Platform, state: 'whole' | 'creak' | 'snapped', since: number): boolean {
  if (!protoArtReady()) return false;
  const f = PROTO_FRAMES.branch;
  // the painted branch is thicker than the walkable strip: its top lines up with the platform top
  const h = Math.max(30, Math.min(54, (p.width * f.h) / f.w));
  const y = p.y - 6;
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
  blit(ctx, state === 'creak' ? 'branchCreak' : 'branch', p.x - 6, y, p.width + 12, h);
  return true;
}

/** the perch branch at the top of a climb trunk, growing out to the right */
export function drawPerchArt(ctx: CanvasRenderingContext2D, trunkX: number, perchY: number, perchRight: number): boolean {
  if (!protoArtReady()) return false;
  const f = PROTO_FRAMES.perch;
  const w = Math.max(120, perchRight - trunkX + 70);
  const h = (w * f.h) / f.w;
  // the art's trunk stub is its left third: centre that on the trunk
  blit(ctx, 'perch', trunkX - w * 0.2, perchY - h * 0.42, w, h);
  return true;
}

/** a bank of earth: the painted top edge repeated along it, the end caps where it drops away */
export function drawBankArt(ctx: CanvasRenderingContext2D, p: Platform, open: { left: boolean; right: boolean }, moss: boolean): boolean {
  if (!protoArtReady()) return false;
  const n: Name = moss ? 'mossStrip' : 'bank';
  const f = PROTO_FRAMES[n];
  const th = moss ? 46 : 110;
  const tw = (th * f.w) / f.h;
  ctx.save();
  ctx.beginPath();
  ctx.rect(p.x - (open.left ? 26 : 0), p.y - 30, p.width + (open.left ? 26 : 0) + (open.right ? 26 : 0), th + 40);
  ctx.clip();
  for (let x = p.x - (open.left ? 18 : 0); x < p.x + p.width + 18; x += tw - 2) blit(ctx, n, x, p.y - (moss ? 14 : 18), tw, th);
  ctx.restore();
  if (!moss) {
    const cap = PROTO_FRAMES.bankEnd;
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

/** the face of the high canopy wall: the painted root wall, once, from its mossy lip down to the ground */
export function drawWallArt(ctx: CanvasRenderingContext2D, x: number, top: number, bottom: number, w: number): boolean {
  if (!protoArtReady()) return false;
  blit(ctx, 'wall', x - 14, top - 14, w + 14, bottom - top + 30);
  return true;
}

/** which of the stage's platforms the painted props draw (the rest keep the drawn look) */
export function paintedPlatforms(platforms: Platform[]): Set<number> {
  const out = new Set<number>();
  for (const p of platforms) {
    if (p.push) out.add(p.id);
    else if (p.height < 50 && p.style === 'branch') out.add(p.id);
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
  view: { x0: number; x1: number },
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
    drawBankArt(ctx, p, { left: !touches('l') && !isWall, right: !touches('r') }, p.style === 'moss_stone');
  }
  // the climb trunks: the painted kapok trunk with its vine, stacked from the ground up to the branch it reaches
  const tf = PROTO_FRAMES.trunk;
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
    if (!vis(p) || p.push || p.height >= 50 || p.style !== 'branch') continue;
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
