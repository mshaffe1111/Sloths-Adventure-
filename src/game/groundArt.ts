/**
 * groundArt — the full-height ground blocks, drawn per stretch.
 *
 * A long block is split by platformPlan into stretches, each with its own treatment:
 *   layered   the world's own baked soil (soil.ts), unchanged
 *   roots     bark roots diving through packed earth
 *   strata    rock bands / megalith courses / basalt columns, under a flat stone lip
 *   overhang  a shadowed recess under a shelf of moss with curtains hanging down
 * Where two stretches meet, the next one fades in over FADE units, so the join reads as a change of rock, not a seam.
 * Every standable top also gets a lit lip that is always clearly away from Pokey's fur colour (platformPalette).
 *
 * Costs per frame: one pattern fill per visible stretch for the face, one for the cap, and a small masked blit per visible join.
 */
import type { Platform } from './types.ts';
import type { Look } from './scenery.ts';
import { getSoil, capTransform } from './soil.ts';
import { rgba } from './artKit.ts';
import { paletteFor } from './platformPalette.ts';
import { groundFace, stoneCap, faceTransform, deepOf, TILE_H, CAP_TOP, type Treat } from './groundTiles.ts';

/** gradients kept by their colours (made once, laid in place with a shift) */
const keptGrads = new Map<string, CanvasGradient>();
function keptGrad(key: string, make: () => CanvasGradient): CanvasGradient {
  let g = keptGrads.get(key);
  if (!g) {
    if (keptGrads.size > 256) keptGrads.clear();
    keptGrads.set(key, (g = make()));
  }
  return g;
}
import type { GroundPlan } from './platformPlan.ts';

type C = CanvasRenderingContext2D;
type Kind = Treat | 'layered';

/** width of the cross-fade where one stretch hands over to the next */
const FADE = 96;
const SLICE_RES = 2;
const CAP_H = 72;

let slice: HTMLCanvasElement | null = null;

/**
 * Fill a FADE-wide strip with `paint` (in world coordinates), fade its left edge to nothing, and lay it over the main canvas.
 * Used for the joins between treatments: the next stretch emerges from the previous one.
 */
function maskedFill(ctx: C, x0: number, y0: number, h: number, paint: (c: C) => void) {
  const ph = Math.ceil(h * SLICE_RES);
  if (!slice) slice = document.createElement('canvas');
  if (slice.width !== FADE * SLICE_RES) slice.width = FADE * SLICE_RES;
  if (slice.height < ph) slice.height = ph;
  const c = slice.getContext('2d')!;
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.globalCompositeOperation = 'source-over';
  c.clearRect(0, 0, slice.width, slice.height);
  c.setTransform(SLICE_RES, 0, 0, SLICE_RES, -x0 * SLICE_RES, -y0 * SLICE_RES);
  paint(c);
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.globalCompositeOperation = 'destination-in';
  const g = c.createLinearGradient(0, 0, slice.width, 0);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,1)');
  c.fillStyle = g;
  c.fillRect(0, 0, slice.width, ph);
  c.globalCompositeOperation = 'source-over';
  ctx.drawImage(slice, 0, 0, slice.width, ph, x0, y0, FADE, ph / SLICE_RES);
}

function bodyPath(ctx: C, p: Platform, depth: number) {
  ctx.beginPath();
  ctx.moveTo(p.x + 4, p.y + 8);
  ctx.lineTo(p.x + 2, p.y + depth);
  ctx.lineTo(p.x + p.width - 2, p.y + depth);
  ctx.lineTo(p.x + p.width - 4, p.y + 8);
  ctx.closePath();
}

function fillFace(c: C, look: Look, world: number, kind: Kind, x0: number, x1: number, y: number, depth: number) {
  const h = Math.min(depth, TILE_H);
  if (kind === 'layered') {
    c.fillStyle = getSoil(c, look, world).soil;
    c.fillRect(x0, y, x1 - x0, h);
    // the soil tile does not end on the deep colour by itself; the other faces do
    const deep = deepOf(look);
    // (the gradient is kept by colour and laid at y with a shift, not made each frame: PERFORMANCE-RULES §2.3)
    c.translate(0, y);
    c.fillStyle = keptGrad(`deep|${deep}`, () => {
      const gr = c.createLinearGradient(0, 230, 0, TILE_H);
      gr.addColorStop(0, rgba(deep, 0));
      gr.addColorStop(1, rgba(deep, 1));
      return gr;
    });
    c.fillRect(x0, 230, x1 - x0, Math.max(0, h - 230));
    c.translate(0, -y);
    return;
  }
  const pat = groundFace(c, look, world, kind);
  pat.setTransform(faceTransform(y));
  c.fillStyle = pat;
  c.fillRect(x0, y, x1 - x0, h);
}

function fillCap(c: C, look: Look, world: number, kind: Kind, x0: number, x1: number, y: number) {
  const pat = kind === 'strata' ? stoneCap(c, look, world) : getSoil(c, look, world).cap;
  pat.setTransform(capTransform(y - CAP_TOP));
  c.fillStyle = pat;
  c.fillRect(x0, y - CAP_TOP, x1 - x0, CAP_H);
}

/** where stretch i is drawn solid: from its start (or half a fade after it) to half a fade past its end, under the next one's fade-in */
function span(p: Platform, gp: GroundPlan, i: number): [number, number] {
  const regs = gp.regions;
  const xa = i === 0 ? p.x : regs[i].x0 + FADE / 2;
  const xb = i === regs.length - 1 ? p.x + p.width : regs[i + 1].x0 + FADE / 2;
  return [xa, xb];
}

/** the earth under a ground block: draws it and returns its depth */
export function drawGroundBody(ctx: C, p: Platform, gp: GroundPlan, look: Look, world: number, bottom: number, left: number, right: number): number {
  const depth = Math.max(120, bottom - p.y);
  const g = look.ground;
  const y = p.y;
  const regs = gp.regions;
  ctx.save();
  bodyPath(ctx, p, depth);
  ctx.clip();
  ctx.fillStyle = deepOf(look);
  ctx.fillRect(p.x, y, p.width, depth);
  for (let i = 0; i < regs.length; i++) {
    const [xa, xb] = span(p, gp, i);
    const a = Math.max(xa, left);
    const b = Math.min(xb, right);
    if (b > a) fillFace(ctx, look, world, regs[i].treat, a, b, y, depth);
  }
  for (let i = 1; i < regs.length; i++) {
    const sx = Math.round(regs[i].x0 - FADE / 2);
    if (sx + FADE < left || sx > right) continue;
    maskedFill(ctx, sx, y, Math.min(depth, TILE_H), (c) => fillFace(c, look, world, regs[i].treat, sx, sx + FADE, y, depth));
  }
  // volume: the lit left edge, the shaded right edge, and the cliff faces that turn away from the light
  const a = Math.max(p.x, left - 30);
  const b = Math.min(p.x + p.width, right + 30);
  // (both edge gradients kept by colour and laid with a shift, not made each frame)
  if (a < p.x + 34 && b > p.x) {
    ctx.translate(p.x, 0);
    ctx.fillStyle = keptGrad(`lit|${g.outline}`, () => {
      const gl = ctx.createLinearGradient(0, 0, 34, 0);
      gl.addColorStop(0, rgba(g.outline, 0.34));
      gl.addColorStop(1, rgba(g.outline, 0));
      return gl;
    });
    ctx.fillRect(0, y, 34, depth);
    ctx.translate(-p.x, 0);
  }
  if (b > p.x + p.width - 44 && a < p.x + p.width) {
    const sx = p.x + p.width - 44;
    ctx.translate(sx, 0);
    ctx.fillStyle = keptGrad(`shade|${g.outline}`, () => {
      const gr = ctx.createLinearGradient(0, 0, 44, 0);
      gr.addColorStop(0, rgba(g.outline, 0));
      gr.addColorStop(1, rgba(g.outline, 0.42));
      return gr;
    });
    ctx.fillRect(0, y, 44, depth);
    ctx.translate(-sx, 0);
  }
  ctx.restore();
  // re-stroke the outline over the clipped faces
  ctx.beginPath();
  ctx.moveTo(p.x + 4, p.y + 8);
  ctx.lineTo(p.x + 2, p.y + depth);
  ctx.moveTo(p.x + p.width - 4, p.y + 8);
  ctx.lineTo(p.x + p.width - 2, p.y + depth);
  ctx.strokeStyle = g.outline;
  ctx.lineWidth = 3;
  ctx.lineJoin = 'round';
  ctx.stroke();
  return depth;
}

/** the cap along the top of a ground block, per stretch, with the lit lip on top of it */
export function drawGroundCap(ctx: C, p: Platform, gp: GroundPlan, look: Look, world: number, left: number, right: number) {
  const y = p.y;
  const regs = gp.regions;
  for (let i = 0; i < regs.length; i++) {
    const [xa, xb] = span(p, gp, i);
    const a = Math.max(xa, left);
    const b = Math.min(xb, right);
    if (b > a) fillCap(ctx, look, world, regs[i].treat, a, b, y);
  }
  for (let i = 1; i < regs.length; i++) {
    const sx = Math.round(regs[i].x0 - FADE / 2);
    if (sx + FADE < left || sx > right) continue;
    maskedFill(ctx, sx, y - CAP_TOP, CAP_H, (c) => fillCap(c, look, world, regs[i].treat, sx, sx + FADE, y));
  }
  const pal = paletteFor(look, world);
  ctx.save();
  ctx.lineCap = 'round';
  for (let i = 0; i < regs.length; i++) {
    const [xa, xb] = span(p, gp, i);
    const a = Math.max(xa, left, p.x + 3);
    const b = Math.min(i === regs.length - 1 ? xb : regs[i + 1].x0, right, p.x + p.width - 3);
    if (b <= a) continue;
    litLipLine(ctx, a, b, y, regs[i].treat === 'strata' ? pal.lip.stone : pal.lip.moss);
  }
  ctx.restore();
}

/** the lit lip itself: a thin bright line on the collision line, so the surface the hero stands on is always the brightest edge */
export function litLipLine(ctx: C, x0: number, x1: number, y: number, col: string) {
  ctx.strokeStyle = col;
  ctx.globalAlpha = 0.85;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(x0, y + 1.5);
  ctx.lineTo(x1, y + 1.5);
  ctx.stroke();
  ctx.globalAlpha = 0.45;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x0, y + 0.6);
  ctx.lineTo(x1, y + 0.6);
  ctx.stroke();
  ctx.globalAlpha = 1;
}
