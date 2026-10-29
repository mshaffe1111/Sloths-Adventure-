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
import { PROTO3_FRAMES } from './proto3AtlasData.ts';
import { drawEnd, drawLip, drawSoil, endFace, warmGround } from './groundPaint.ts';

/** the painted World 1 kit on every World 1 stage (saved on the device): off by default while testers play */
export function paintedKitEnabled(): boolean {
  // the game's platforms since 2026-10-24 (Matt tested them): `?paint=0` shows the old drawn ones
  try {
    return !(typeof location !== 'undefined' && /[?&]paint=0\b/.test(location.search));
  } catch {
    return true;
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
let groundOn = false;
/** whether this stage paints its banks (engine.ts paintKit): the drawn ground then leaves them to the painted soil (bankPainted) */
export function setGroundPaint(on: boolean) {
  groundOn = on;
}
/** a bank the painted ground covers whole (drawProtoScene's banks, not a moss floor), once its sheets are in */
export function bankPainted(p: Platform): boolean {
  return groundOn && (p.height >= 90 || !!p.soil) && !p.push && !p.broken && !p.art && protoArtReady() && warmGround(kitWorld);
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
/** the address of a world's kit sheet (World 1's is the full props atlas) */
export function kitUrl(w: number): string {
  return w === 1 ? new URL('../assets/proto/props-atlas.webp', import.meta.url).href : new URL(`../assets/kits/w${w}.webp`, import.meta.url).href;
}
function load(w: number) {
  if (imgs.has(w) || typeof Image === 'undefined') return;
  const im = new Image();
  imgs.set(w, im);
  const url = kitUrl(w);
  trackAtlas(im, url, () => { ready.add(w); }, () => { imgs.delete(w); }, () => { imgs.delete(w); ready.delete(w); });
}
// Matt's second World 1 sheet set (2026-10-23): the kapok trunk with a hollow, a plain trunk, and the hiding bushes
let img2: HTMLImageElement | null = null;
let ready2 = false;
/** the second sheet's address (sheetWarm.ts: a stage with bushes or hollow trunks asks for it as it starts) */
export const PROTO2_URL = new URL('../assets/proto/props2-atlas.webp', import.meta.url).href;
function load2() {
  if (img2 || typeof Image === 'undefined') return;
  const im = new Image();
  img2 = im;
  trackAtlas(im, PROTO2_URL, () => { ready2 = true; }, () => { img2 = null; }, () => { img2 = null; ready2 = false; });
}
/** start loading the second sheet */
export function warmProto2() {
  load2();
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

/**
 * A hiding bush (1-7): Matt's painted bushes, drawn in front of Pokey. `inside`: he is in it, so it is drawn a little see-through
 * (the player can still find him) and rustles when he moves. Returns false until the sheet has loaded.
 */
export function drawBushArt(ctx: CanvasRenderingContext2D, b: { x: number; w: number; y: number; kind: 'tall' | 'wide' | 'fern'; hanging?: boolean }, inside: boolean, rustle: number, t: number): boolean {
  load2();
  if (!ready2 || !img2) return false;
  const n = b.kind === 'tall' ? 'bushTall' : b.kind === 'wide' ? 'bushWide' : 'fernClump';
  const f = PROTO2_FRAMES[n];
  const h = (b.w * f.h) / f.w;
  ctx.save();
  // (a hanging bush first gets the vine strands it hangs by, up to the rope just above it)
  if (b.hanging) {
    ctx.strokeStyle = '#3d5a22';
    ctx.lineWidth = 2.5;
    for (const u of [0.28, 0.5, 0.72]) {
      ctx.beginPath();
      ctx.moveTo(b.x + b.w * u, b.y - 4);
      ctx.quadraticCurveTo(b.x + b.w * u + 4, b.y + 6, b.x + b.w * u, b.y + 16);
      ctx.stroke();
    }
  }
  // see-through enough with him inside that the player can still find him
  if (inside) ctx.globalAlpha = 0.62;
  // anchored at the bottom middle (a hanging bush at its top middle), leaning a touch when he rustles it
  const ax = b.x + b.w / 2, ay = b.hanging ? b.y : b.y + 6;
  ctx.translate(ax, ay);
  ctx.transform(1, 0, Math.sin(t * 22) * 0.05 * rustle, 1, 0, 0);
  if (b.hanging) blit2(ctx, n, -b.w / 2, 0, b.w, h);
  else blit2(ctx, n, -b.w / 2, -h, b.w, h);
  ctx.restore();
  return true;
}

/** a bush's drawn height (for the fallback shape) */
export function bushHeight(b: { w: number; kind: 'tall' | 'wide' | 'fern' }): number {
  const f = PROTO2_FRAMES[b.kind === 'tall' ? 'bushTall' : b.kind === 'wide' ? 'bushWide' : 'fernClump'];
  return (b.w * f.h) / f.w;
}

// Matt's long-branch sheet (2026-10-24): 1-8's chase
let img3: HTMLImageElement | null = null;
let ready3 = false;
function load3() {
  if (img3 || typeof Image === 'undefined') return;
  const im = new Image();
  img3 = im;
  trackAtlas(im, new URL('../assets/proto/props3-atlas.webp', import.meta.url).href, () => { ready3 = true; }, () => { img3 = null; }, () => { img3 = null; ready3 = false; });
}

/**
 * One section of 1-8's long branch: the repeating log (every other one mirrored, so the joins never show), the cracked log ahead of
 * the collapse, or the branch's tip. The log's moss line sits on the walkable top. False until the sheet has loaded.
 */
export function drawChaseSection(ctx: CanvasRenderingContext2D, p: { x: number; y: number; width: number; chaseTip?: boolean }, cracked: boolean, mirror: boolean, dy = 0): boolean {
  load3();
  if (!ready3 || !img3) return false;
  const f = PROTO3_FRAMES[p.chaseTip ? 'chaseTip' : cracked ? 'chaseCrack' : 'chaseSeg'];
  // the log is drawn 60 px thick on a 222 px section (the painted proportions); the tip keeps its own shape at the same scale
  const k = p.width / 370;
  const w = f.w * k, h = f.h * k;
  const top = p.y + 2 - f.top * k + dy;
  ctx.save();
  if (mirror && !p.chaseTip) {
    ctx.translate(p.x + p.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(img3, f.x, f.y, f.w, f.h, 0, top, p.width, h);
  } else ctx.drawImage(img3, f.x, f.y, f.w, f.h, p.x, top, p.chaseTip ? w : p.width, h);
  ctx.restore();
  return true;
}

// Matt's crown of a giant tree (2026-10-24): the end of 1-8, where the shrine stands
let crownImg: HTMLImageElement | null = null;
let crownReady = false;
/** the crown painting's walkable moss line (px down from its top, at its own size) and the part of its width that is flat */
const CROWN = { w: 1200, h: 577, top: 128, flat: 0.9 };

/** a tree's crown to stand on: the painting's moss line on the walkable top, its trunk going on down out of view */
export function drawCrownArt(ctx: CanvasRenderingContext2D, p: { x: number; y: number; width: number }): boolean {
  if (!crownImg && typeof Image !== 'undefined') {
    const im = new Image();
    crownImg = im;
    trackAtlas(im, new URL('../assets/proto/crown.webp', import.meta.url).href, () => { crownReady = true; }, () => { crownImg = null; }, () => { crownImg = null; crownReady = false; });
  }
  if (!crownReady || !crownImg) return false;
  const w = p.width / CROWN.flat;
  const k = w / CROWN.w;
  ctx.drawImage(crownImg, p.x - (w - p.width) / 2, p.y - CROWN.top * k, w, CROWN.h * k);
  return true;
}

/** one half of a section breaking away (drawn in its own rotated frame by the caller) */
export function drawChaseBroken(ctx: CanvasRenderingContext2D, right: boolean, x: number, y: number, w: number, h: number): boolean {
  load3();
  if (!ready3 || !img3) return false;
  const f = PROTO3_FRAMES[right ? 'chaseBrokenR' : 'chaseBrokenL'];
  ctx.drawImage(img3, f.x, f.y, f.w, f.h, x, y, w, h);
  return true;
}

/** start loading the kit sheets a stage in world `w` draws (World 1's, and the world's own), before the stage starts */
export function warmKit(w: number) {
  load(1);
  if (w !== 1 && hasKit(w)) load(w);
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

/** one piece of the painted World 1 kit filling a box (the journal's demo scenes); false until the kit has loaded */
export function drawKitPiece(ctx: CanvasRenderingContext2D, n: Name, x: number, y: number, w: number, h: number): boolean {
  if (!protoArtReady()) return false;
  blit(ctx, n, x, y, w, h);
  return true;
}

/**
 * Where each world's painted liana runs, as shares of its picture (measured from the sheets): the strand's middle across the picture
 * (`ax`), how wide the strand is (`strand`), and the top and bottom pieces that keep their shape while the middle stretches to the
 * vine's length (`capT`, `capB`). `lift`: how much of the picture's top sits above the point the vine hangs from (World 1's branch stub).
 */
const LIANA_FIT: Record<number, { ax: number; strand: number; capT: number; capB: number; lift: number }> = {
  1: { ax: 0.61, strand: 0.2, capT: 0.18, capB: 0.2, lift: 0.08 },
  2: { ax: 0.54, strand: 0.25, capT: 0.33, capB: 0.24, lift: 0 },
  3: { ax: 0.5, strand: 0.25, capT: 0.28, capB: 0.12, lift: 0.04 },
  4: { ax: 0.55, strand: 0.15, capT: 0.12, capB: 0.28, lift: 0.04 },
};
const LIANA_DEFAULT = { ax: 0.5, strand: 0.22, capT: 0.16, capB: 0.16, lift: 0.04 };
let lianaTops = true;
/** whether a swinging liana draws its own leafy clump at the top (off where the stage hangs its vines from painted boughs, 2-4) */
export function setLianaTops(on: boolean) {
  lianaTops = on;
}
/** worlds whose own painted liana is not a single hanging vine to swing on (see drawSwingLianaArt) */
const SWING_LIANA_FROM_W1 = new Set([2, 9]);
/** how thick a swing liana's strand is drawn, in world units */
const LIANA_THICK = 15;

/**
 * A swinging liana in the world's own painted style (Matt, 2026-10-24: the drawn braid looked out of place next to the painted
 * kit): the painting turns with the vine about the point it hangs from, its top and bottom keep their shape and the twisted middle
 * stretches to the vine's length. A painted leafy clump hides where it hangs from. False until the kit has loaded.
 */
export function drawSwingLianaArt(ctx: CanvasRenderingContext2D, v: { x: number; topY: number; bottomY: number; id: number }, ang: number): boolean {
  if (!protoArtReady()) return false;
  // World 2's painted rope (a coil at the top and a loop at the bottom) read as a noose, and World 9's is a swing seat on two ropes:
  // those worlds swing on World 1's jungle liana instead
  const borrow = SWING_LIANA_FROM_W1.has(kitWorld);
  const { img, f } = borrow ? { img: imgs.get(1)!, f: PROTO_FRAMES.liana } : frameOf('liana');
  const own = !borrow && kitWorld !== 1 && !!KIT_FRAMES[kitWorld]?.liana && img === imgs.get(kitWorld);
  const fit = (own ? LIANA_FIT[kitWorld] : LIANA_FIT[1]) ?? LIANA_DEFAULT;
  const k = LIANA_THICK / (fit.strand * f.w);
  const w = f.w * k;
  const len = v.bottomY - v.topY;
  const topH = f.h * fit.capT * k, botH = f.h * fit.capB * k;
  const lift = f.h * fit.lift * k;
  const midH = Math.max(10, len + lift - topH - botH);
  const sy0 = f.y, sy1 = f.y + f.h * fit.capT, sy2 = f.y + f.h * (1 - fit.capB);
  ctx.save();
  ctx.translate(v.x, v.topY);
  ctx.rotate(-ang);
  const x0 = -fit.ax * w;
  // (each piece overlaps the next by a pixel so no seam shows)
  ctx.drawImage(img, f.x, sy0, f.w, sy1 - sy0, x0, -lift, w, topH + 1);
  ctx.drawImage(img, f.x, sy1, f.w, sy2 - sy1, x0, -lift + topH, w, midH + 1);
  ctx.drawImage(img, f.x, sy2, f.w, f.y + f.h - sy2, x0, -lift + topH + midH, w, botH);
  ctx.restore();
  // the leafy clump it hangs from (the painted bush, hung upside down from the canopy)
  load2();
  const bush = ready2 && lianaTops ? img2 : null;
  if (bush) {
    const b = PROTO2_FRAMES.bushWide;
    const bw = 150 + (Math.abs(v.id) % 3) * 16;
    const bh = (bw * b.h) / b.w;
    ctx.save();
    ctx.translate(v.x + ((Math.abs(v.id) % 2) * 2 - 1) * 10, v.topY + 6);
    ctx.scale(Math.abs(v.id) % 2 ? -1 : 1, -1);
    ctx.drawImage(bush, b.x, b.y, b.w, b.h, -bw / 2, -bh * 0.35, bw, bh);
    ctx.restore();
  }
  return true;
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
  // (World 4's little rocks to hop, art 'rock': sized by their height, a little over it, so the painted top is where he stands)
  const w = p.art === 'rock' ? ((p.height + 10) * frameOf('boulder').f.w) / frameOf('boulder').f.h : p.width * 1.15;
  stand(ctx, 'boulder', p.x + p.width / 2, p.y + p.height + 3, w);
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

/**
 * Where a painted piece's solid top starts (`top`, a share of its height), the share of its width that row covers (`l` to `r`), and the
 * widest the body below it runs (`L` to `R`: a plank seen a little from above is a deck, its top edge narrower than its front edge)
 */
export interface PaintSpan { top: number; l: number; r: number; L: number; R: number }
/**
 * The solid top of a picture from its alpha (w x h, RGBA): the first row it fills across most of its width, and where that row's
 * paint starts and ends; and the widest the body below runs (rows filled across a third of the width or more). Null when no row is full.
 */
export function paintSpan(a: ArrayLike<number>, w: number, h: number): PaintSpan | null {
  let out: PaintSpan | null = null;
  for (let y = 0; y < h; y++) {
    let n = 0, l = -1, r = -1;
    for (let x = 0; x < w; x++) {
      if (a[(y * w + x) * 4 + 3] <= 40) continue;
      n++;
      if (l < 0) l = x;
      r = x + 1;
    }
    if (!out) {
      if (n > w * 0.6) out = { top: y / h, l: l / w, r: r / w, L: l / w, R: r / w };
    } else if (n > w / 3) {
      out.L = Math.min(out.L, l / w);
      out.R = Math.max(out.R, r / w);
    }
  }
  return out;
}
const spanCache = new Map<string, PaintSpan | null>();
function measure(n: Name): PaintSpan | null {
  const { img, f } = frameOf(n);
  const key = `${img.src}#${n}`;
  if (spanCache.has(key)) return spanCache.get(key)!;
  let v: PaintSpan | null = null;
  try {
    const c = document.createElement('canvas');
    const w = Math.min(160, f.w), h = Math.round((f.h * w) / f.w);
    c.width = w;
    c.height = h;
    const g = c.getContext('2d', { willReadFrequently: true })!;
    g.drawImage(img, f.x, f.y, f.w, f.h, 0, 0, w, h);
    v = paintSpan(g.getImageData(0, 0, w, h).data, w, h);
  } catch {
    /* no canvas to measure on */
  }
  spanCache.set(key, v);
  return v;
}
/**
 * Where the solid top of a painted piece starts, as a share of its height: the first row the picture fills across most of its
 * width. A branch painting carries a bromeliad and moss tufts above the bark, so lining the picture's top edge up with the walkable
 * top left Pokey standing on the air above the log (Matt, 2026-10-23). Measured once per picture; each world's kit has its own.
 */
function solidTop(n: Name, fallback: number): number {
  return measure(n)?.top ?? fallback;
}

/** one slice of a picture drawn into a box: from share `sx` of its width, `sw` wide, to x `dx`, `dw` wide */
export interface Slice { sx: number; sw: number; dx: number; dw: number }
/**
 * How a branch picture (fw x fh, drawn h tall) is laid along a collider, so its painted ends sit on the collider's ends. (QA 2026-10-29,
 * 2-6 ?layout=7: Pokey stood a few px past a plank's end, in the air. World 2's plank is a deck seen a little from above: its top edge
 * runs over 15-87% of the picture, its front edge the whole width. Stretched edge to edge on the collider, the top edge, where his feet
 * are drawn, ended 20-90 px short of each end; fitted to the top edge instead, the front edges ran 40-60 px past and closed the 55-85 px
 * hop gaps on screen.) The two ends keep their painted shape (drawn at the picture's own scale, h / fh, whatever the plank's length:
 * stretched, a long plank's slanted end grew with it) and only the middle stretches; the collider's end sits halfway along the slant,
 * between the top edge and the front edge, so at the end he stands on the slant and a hop gap shows (about 13 px of slant each side
 * on World 2's plank). With no measure, the whole picture as before, 6 px past each end.
 */
export function branchSlices(p: Pick<Platform, 'x' | 'width'>, span: PaintSpan | null, fw: number, fh: number, h: number): Slice[] {
  if (!span) return [{ sx: 0, sw: 1, dx: p.x - 6, dw: p.width + 12 }];
  const k = (fw * h) / fh; // px drawn per share of the picture's width, at its own scale
  const mL = (span.l + span.L) / 2, mR = (span.r + span.R) / 2;
  const cL = Math.min(0.35, span.l + 0.03), cR = Math.min(0.35, 1 - span.r + 0.03);
  const x0 = p.x - mL * k, x1 = p.x + p.width + (1 - mR) * k;
  const mid = x1 - cR * k - (x0 + cL * k);
  if (mid < 0.1 * (1 - cL - cR) * k) {
    // (a plank too short for its two ends at their own size: the whole picture, the slant's middle on the collider's ends)
    const w = p.width / Math.max(0.3, mR - mL);
    return [{ sx: 0, sw: 1, dx: p.x - mL * w, dw: w }];
  }
  return [
    { sx: 0, sw: cL, dx: x0, dw: cL * k },
    { sx: cL, sw: 1 - cL - cR, dx: x0 + cL * k, dw: mid },
    { sx: 1 - cR, sw: cR, dx: x1 - cR * k, dw: cR * k },
  ];
}

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
  const { img, f: fr } = frameOf(name);
  // (each slice 0.5 px wider, so no hairline of background shows between them)
  for (const c of branchSlices(p, measure(name), fr.w, fr.h, h)) ctx.drawImage(img, fr.x + c.sx * fr.w, fr.y, c.sw * fr.w, fr.h, c.dx, y, c.dw + 0.5, h);
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

/**
 * The repeats of a strip `tw` wide (overlapping 2) laid from `from` to `to` that a view from `x0` to `x1` shows: the first repeat's x and
 * the end, so a long bank draws the few repeats on screen, not all of them (a 1-2 ground bank is 5,700 px: 34 repeats a frame, where a
 * 320-wide phone shows 3 or 4). The repeats stay where they would be counted from `from`, so nothing shifts as the view moves.
 */
export function stripSpan(from: number, to: number, tw: number, x0 = -Infinity, x1 = Infinity): { start: number; end: number } {
  const step = tw - 2;
  const skip = Math.max(0, Math.floor((x0 - tw - from) / step));
  return { start: from + skip * step, end: Math.min(to, x1) };
}

/**
 * A bank of earth (hf-art-ground, 2026-10-29; polish report VI-8): the world's painted soil (groundPaint.ts) from the bank's top all the way
 * down, darkening with depth, the painted top lip along it, and where it drops away the painted bank end, its face carrying on down with a
 * wobble (never a ruler-straight cut). A moss floor (`moss`) is the World 1 kit's moss strip. `view`: only what is on screen.
 */
export function drawBankArt(
  ctx: CanvasRenderingContext2D, p: Platform, open: { left: boolean; right: boolean; leftStep?: number; rightStep?: number; bare?: boolean }, moss: boolean, viewBottom = 0, view?: { x0: number; x1: number; y0?: number },
): boolean {
  if (!protoArtReady()) return false;
  if (moss) {
    const { f } = frameOf('mossStrip');
    const th = 46, tw = (th * f.w) / f.h;
    ctx.save();
    ctx.beginPath();
    ctx.rect(p.x - (open.left ? 26 : 1), p.y - 30, p.width + (open.left ? 26 : 1) + (open.right ? 26 : 1), th + 40);
    ctx.clip();
    const { start, end } = stripSpan(Math.floor((p.x - (open.left ? 18 : 0)) / (tw - 2)) * (tw - 2), p.x + p.width + 18, tw, view?.x0, view?.x1);
    for (let x = start; x < end; x += tw - 2) blit(ctx, 'mossStrip', x, p.y - 14, tw, th);
    ctx.restore();
    return true;
  }
  const w = kitWorld;
  if (!warmGround(w)) return false;
  const bottom = Math.max(p.y + p.height, viewBottom);
  const soilTop = p.y + 6;
  // the outline of the bank's soil: straight down where it meets the next bank (a unit under it, so no hairline), the end's face where
  // it drops away
  // (a side that steps down to a lower bank: the end's face only down to that bank's top, then straight down under it, where the two
  // banks' soils are the one world-anchored texture and meet with no join)
  const side = (right: boolean): Array<[number, number]> => {
    const x = right ? p.x + p.width : p.x, d = right ? 1 : -1;
    if (!(right ? open.right : open.left)) return [[x + d, soilTop], [x + d, bottom]];
    const step = right ? open.rightStep : open.leftStep;
    const face = endFace(w, x, p.y, bottom, right);
    if (step === undefined) return face;
    const cut = step + 24;
    const pts = face.filter((q) => q[1] < cut);
    return [...pts, [pts.length ? pts[pts.length - 1][0] : x, cut], [x + d, cut], [x + d, bottom]];
  };
  const R = side(true);
  const L = side(false);
  const clampY = (pt: [number, number]): [number, number] => [pt[0], Math.max(soilTop, pt[1])];
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(...clampY(L[0]));
  for (const pt of R) ctx.lineTo(...clampY(pt));
  ctx.lineTo(R[R.length - 1][0], bottom + 2);
  ctx.lineTo(L[L.length - 1][0], bottom + 2);
  for (let i = L.length - 1; i >= 0; i--) ctx.lineTo(...clampY(L[i]));
  ctx.closePath();
  ctx.clip();
  let x0 = Math.min(...L.map((q) => q[0])), x1 = Math.max(...R.map((q) => q[0]));
  if (view) {
    x0 = Math.max(x0, view.x0 - 20);
    x1 = Math.min(x1, view.x1 + 20);
  }
  drawSoil(ctx, w, x0, x1, soilTop, bottom + 2, viewBottom, view?.y0);
  ctx.restore();
  // the top lip, under the end pieces' own lip corners (`bare`: a pit's low step, too narrow for the end pieces, which are wider than it
  // and see-through below their rims: its soil keeps the end's wobbling face and the lip runs to its ends)
  const la = open.left && !open.bare ? p.x + 30 : p.x - 1;
  const lb = open.right && !open.bare ? p.x + p.width - 30 : p.x + p.width + 1;
  ctx.save();
  ctx.beginPath();
  ctx.rect(la, p.y - 120, lb - la, 260);
  ctx.clip();
  drawLip(ctx, w, la, lb, p.y, view);
  ctx.restore();
  const end = (right: boolean, step?: number) => {
    const x = right ? p.x + p.width : p.x;
    // (only an end on screen: a long bank's far end is thousands of units off)
    if (view && (x < view.x0 - 260 || x > view.x1 + 260)) return;
    drawEnd(ctx, w, x, p.y, right, step === undefined ? undefined : step + 26);
  };
  if (open.bare) return true;
  if (open.right) end(true, open.rightStep);
  if (open.left) end(false, open.leftStep);
  return true;
}

/**
 * The face of a river bank behind a climb (2-6, the village dug into the bank): the world's painted soil across the view, shaded back so
 * the porches and posts in front stand out, with the grassy lip along its top. False until the sheets have loaded.
 */
export function drawEarthWall(ctx: CanvasRenderingContext2D, wall: { x0: number; x1: number; top: number; bottom: number }, view: { x0: number; x1: number; y0: number; y1: number }): boolean {
  if (!protoArtReady() || !warmGround(kitWorld)) return false;
  const a = Math.max(wall.x0, view.x0 - 10), b = Math.min(wall.x1, view.x1 + 10);
  const top = Math.max(wall.top, view.y0 - 10), bottom = Math.min(wall.bottom, view.y1 + 10);
  if (b <= a || bottom <= top) return true;
  ctx.save();
  ctx.beginPath();
  ctx.rect(a, top, b - a, bottom - top);
  ctx.clip();
  drawSoil(ctx, kitWorld, a, b, top, bottom, view.y1, view.y0);
  // set back: darker, so the climb in front reads clearly
  ctx.fillStyle = 'rgba(28, 18, 8, 0.36)';
  ctx.fillRect(a, top, b - a, bottom - top);
  ctx.restore();
  // the grassy lip where the bank meets the sky
  if (wall.top >= view.y0 - 60 && wall.top <= view.y1 + 60) drawLip(ctx, kitWorld, a, b, wall.top, view);
  return true;
}

/** the face of the high canopy wall: the painted root wall, once, from its mossy lip down to the ground */
export function drawWallArt(ctx: CanvasRenderingContext2D, x: number, top: number, bottom: number, w: number): boolean {
  if (!protoArtReady()) return false;
  blit(ctx, 'wall', x - 14, top - 14, w + 14, bottom - top + 30);
  return true;
}

/** a world with its own kit paints every thin ledge with its own piece (a drifting river log and a spring keep their own look) */
function thinKit(p: Platform): boolean {
  return p.height < 50 && !p.push && !p.lily && !p.art && p.type !== 'drift' && p.type !== 'bouncy';
}
/** which of the stage's platforms the painted props draw (the rest keep the drawn look) */
export function paintedPlatforms(platforms: Platform[]): Set<number> {
  const out = new Set<number>();
  for (const p of platforms) {
    if (p.push) out.add(p.id);
    else if (p.height < 50 && (p.style === 'branch' || (ownKit() && thinKit(p)))) out.add(p.id);
    else if ((p.height === 50 && p.style === 'moss_stone') || p.art === 'rock') out.add(p.id);
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
  vines: Array<{ vineType?: string; x: number; topY: number; bottomY?: number; rope?: boolean }>,
  t: number,
  view: { x0: number; x1: number; y0?: number; y1?: number },
  st: ProtoSceneState,
): boolean {
  if (!protoArtReady()) return false;
  const vis = (p: Platform) => p.x + p.width > view.x0 - 80 && p.x < view.x1 + 80;
  const banks = platforms.filter((p) => (p.height >= 90 || p.soil) && !p.push && !p.broken && !p.art);
  // (the lowest first: a pit's floor and its step go under the banks either side, whose faces then cover their ends)
  for (const p of [...banks].sort((a, b) => b.y - a.y)) {
    if (!vis(p)) continue;
    // (a pit's wall under a bank's end is that bank's soil already)
    if (p.soil && banks.some((q) => q !== p && !q.soil && Math.abs(q.y + q.height - p.y) < 3 && q.x <= p.x + 2 && q.x + q.width >= p.x + p.width - 2)) continue;
    // (a side is closed where the next bank meets it, or where a piece stands right on top of its end: a pit's floor runs on under the
    // walls, and its end pieces' lip corners showed through the banks' undercut faces above it)
    const touches = (side: 'l' | 'r') => {
      const ex = side === 'l' ? p.x : p.x + p.width;
      return banks.some((q) => q !== p && ((q.y <= p.y + 2 && (side === 'l' ? Math.abs(q.x + q.width - p.x) < 2 : Math.abs(p.x + p.width - q.x) < 2)) ||
        (q.y < p.y && q.y + q.height >= p.y - 4 && q.x <= ex + 1 && q.x + q.width >= ex - 1)));
    };
    // the high canopy: a wall face on the side that faces the yard
    const isWall = banks.some((q) => q !== p && Math.abs(q.x + q.width - p.x) < 2 && q.y - p.y > 150);
    if (isWall) drawWallArt(ctx, p.x, p.y, banks.find((q) => Math.abs(q.x + q.width - p.x) < 2)!.y + 6, 230);
    // (a side whose neighbour is lower is a step down to it, not a drop)
    // (a low step standing on a pit's floor steps down to the floor it stands on, its end faded out into the floor's soil)
    const floor = p.soil ? banks.find((q) => q !== p && Math.abs(q.y - (p.y + p.height)) < 3 && q.x <= p.x + 2 && q.x + q.width >= p.x + p.width - 2)?.y : undefined;
    const lower = (side: 'l' | 'r') => banks.find((q) => q !== p && q.y > p.y + 2 && (side === 'l' ? Math.abs(q.x + q.width - p.x) < 2 : Math.abs(p.x + p.width - q.x) < 2))?.y ?? floor;
    // (every bank, moss floors too, is the painted ground: the moss strip is for the journal's small scenes)
    drawBankArt(ctx, p, { left: !touches('l') && !isWall, right: !touches('r'), leftStep: lower('l'), rightStep: lower('r'), bare: !!p.soil }, false, view.y1 ?? 0, view);
  }
  // the climb trunks: the painted kapok trunk with its vine, stacked from the ground up to the branch it reaches
  const tf = frameOf('trunk').f;
  for (const v of vines) {
    // (a vine hanging down a cliff is not a trunk: its stage draws it)
    if (v.vineType !== 'tree_climb' || v.rope || v.x < view.x0 - 120 || v.x > view.x1 + 120) continue;
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
  const tops = vines.filter((v) => v.vineType === 'tree_climb' && !v.rope);
  for (const p of platforms) {
    if (!vis(p) || p.push || p.art || p.height >= 50 || (p.style !== 'branch' && !(ownKit() && thinKit(p)))) continue;
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
    if ((p.height === 50 && p.style === 'moss_stone') || p.art === 'rock') drawRockArt(ctx, p);
  }
  for (const p of platforms) {
    if (!vis(p) || !p.push || p.art) continue; // (a pushed boulder is World 4's to paint: w4Play.ts)
    drawLogArt(ctx, p, t - (st.movedAt.get(p.id) ?? -9) < 0.2);
  }
  void trees;
  return true;
}
