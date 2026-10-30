/**
 * columnArt — the narrow full-height blocks: the steps that climb to the exit and the free-standing pillars.
 *
 * Both are one column each: a painted top (tread or capital, baked once into a sprite) and a shaft below it that repeats
 * a tile down to the bottom of the screen. Three materials, picked by world and variant:
 *   stone   carved blocks with a slab on top (steps of ruins, columns)
 *   wood    a stump or trunk, bark running down, the cut face on top
 *   root    a root-log tread, moss on top, over earth that roots run through
 * The lit lip on the top line is always clearly away from the hero's fur (platformPalette).
 */
import type { Platform } from './types.ts';
import type { Look } from './scenery.ts';
import { rng, rgba, mixToHex, lighten, darken } from './artKit.ts';
import { paletteFor, type Palette } from './platformPalette.ts';
import { bakeSprite, shaftPattern, blit, RES } from './platformSprites.ts';
import { leafAt, pebble } from './platformKit.ts';

/** the column's sink-into-shadow gradient, by outline colour */
const sinkGrads = new Map<string, CanvasGradient>();
import type { GroundPlan } from './platformPlan.ts';

type C = CanvasRenderingContext2D;
type Kind = 'stone' | 'wood' | 'root';
const TAU = Math.PI * 2;
/** height of the baked top: tread plus the first course */
const TOPH = 62;
const PADX = 6;
const PAD_TOP = 26;
const PAD_BOT = 44;

/** which material the steps of a world are made of, by the run's variant (0..2) */
const STAIR_KIND: Record<number, [Kind, Kind, Kind]> = {
  1: ['wood', 'root', 'stone'], 2: ['wood', 'root', 'stone'], 3: ['stone', 'root', 'stone'], 4: ['stone', 'root', 'wood'],
  5: ['root', 'wood', 'root'], 6: ['root', 'wood', 'root'], 7: ['stone', 'stone', 'root'], 8: ['stone', 'root', 'stone'],
  9: ['stone', 'stone', 'root'], 10: ['stone', 'stone', 'stone'],
};
/** pillars: variant 0 is always carved stone, 1 a trunk, 2 a root-wrapped earth spire */
const PILLAR_KIND: Kind[] = ['stone', 'wood', 'root'];

const glyphPath = (c: C, kind: number, cx: number, cy: number, s: number) => {
  c.beginPath();
  if (kind === 0) {
    for (let t = 0; t < 4.2 * Math.PI; t += 0.3) {
      const rr = (t / (4.2 * Math.PI)) * s;
      const px = cx + Math.cos(t) * rr;
      const py = cy + Math.sin(t) * rr;
      if (t === 0) c.moveTo(px, py);
      else c.lineTo(px, py);
    }
  } else if (kind === 1) {
    c.moveTo(cx - s, cy + s * 0.6);
    c.lineTo(cx - s, cy - s * 0.2);
    c.lineTo(cx - s * 0.3, cy - s * 0.2);
    c.lineTo(cx - s * 0.3, cy - s * 0.8);
    c.lineTo(cx + s * 0.4, cy - s * 0.8);
    c.lineTo(cx + s * 0.4, cy);
    c.lineTo(cx + s, cy);
    c.lineTo(cx + s, cy + s * 0.6);
  } else {
    c.moveTo(cx - s, cy);
    c.quadraticCurveTo(cx, cy - s * 0.9, cx + s, cy);
    c.quadraticCurveTo(cx, cy + s * 0.9, cx - s, cy);
    c.moveTo(cx + s * 0.28, cy);
    c.arc(cx, cy, s * 0.28, 0, TAU);
  }
};

function mossClump(c: C, x: number, y: number, w: number, pal: Palette, drip = 7) {
  c.beginPath();
  c.moveTo(x - w / 2, y);
  c.quadraticCurveTo(x - w / 2, y + drip * 0.9, x - w * 0.1, y + drip);
  c.quadraticCurveTo(x + w / 2, y + drip * 0.8, x + w / 2, y);
  c.closePath();
  const g = c.createLinearGradient(0, y, 0, y + drip);
  g.addColorStop(0, pal.moss.light);
  g.addColorStop(1, pal.moss.dark);
  c.fillStyle = g;
  c.fill();
  c.strokeStyle = rgba(pal.moss.deep, 0.8);
  c.lineWidth = 1.2;
  c.lineJoin = 'round';
  c.stroke();
}

function lipLine(c: C, x0: number, x1: number, y: number, col: string, thick = 3) {
  c.save();
  c.lineCap = 'round';
  c.strokeStyle = col;
  c.lineWidth = thick;
  c.beginPath();
  c.moveTo(x0, y + thick / 2);
  c.lineTo(x1, y + thick / 2);
  c.stroke();
  c.strokeStyle = 'rgba(255,255,255,0.5)';
  c.lineWidth = 1;
  c.beginPath();
  c.moveTo(x0 + 1, y + 0.8);
  c.lineTo(x1 - 1, y + 0.8);
  c.stroke();
  c.restore();
}

function hang(c: C, x: number, y: number, len: number, pal: Palette) {
  c.lineCap = 'round';
  for (const [col, lw] of [[pal.outline, 3.8], [pal.vine.mid, 2.1]] as const) {
    c.strokeStyle = col;
    c.lineWidth = lw;
    c.beginPath();
    c.moveTo(x, y);
    c.quadraticCurveTo(x + 4, y + len * 0.5, x - 1, y + len);
    c.stroke();
  }
  leafAt(c, x + 1, y + len * 0.45, 9, 3.6, 0.8, pal.leaf, pal.outline, 1.3);
  leafAt(c, x, y + len * 0.75, 8, 3.2, Math.PI - 0.8, pal.leaf, pal.outline, 1.3);
}

// ───────────────────────────── stone ─────────────────────────────

/** one dressed block, w x h, with a bevel and an optional carving (0 plain, 1 recessed panel, 2 glyph) */
function block(c: C, x: number, y: number, w: number, h: number, pal: Palette, carve: number, glyph: number) {
  const ol = pal.outline;
  c.beginPath();
  c.roundRect(x + 1.5, y + 1.5, w - 3, h - 3, 4);
  const g = c.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, pal.stone.light);
  g.addColorStop(1, pal.stone.mid);
  c.fillStyle = g;
  c.fill();
  c.save();
  c.clip();
  c.fillStyle = 'rgba(255,255,255,0.2)';
  c.fillRect(x, y, w, 3.5);
  c.fillStyle = 'rgba(255,255,255,0.09)';
  c.fillRect(x, y, 3, h);
  c.fillStyle = rgba(ol, 0.28);
  c.fillRect(x, y + h - 5, w, 5);
  c.fillRect(x + w - 4, y, 4, h);
  if (carve === 1) {
    c.strokeStyle = rgba(ol, 0.34);
    c.lineWidth = 1.5;
    c.strokeRect(x + 9, y + 9, w - 18, h - 18);
    c.strokeStyle = 'rgba(255,255,255,0.15)';
    c.strokeRect(x + 10.5, y + 10.5, w - 18, h - 18);
  } else if (carve === 2) {
    c.strokeStyle = rgba(ol, 0.42);
    c.lineWidth = 2;
    c.lineCap = 'round';
    c.lineJoin = 'round';
    glyphPath(c, glyph, x + w / 2, y + h / 2 + 1, Math.min(w, h) * 0.22);
    c.stroke();
  }
  c.restore();
  c.strokeStyle = rgba(ol, 0.85);
  c.lineWidth = 2.4;
  c.beginPath();
  c.roundRect(x + 1.5, y + 1.5, w - 3, h - 3, 4);
  c.stroke();
}

const COURSE = 46;
/** heights of the shaft tiles of wood and root columns */
const WOOD_TILE = 72;
const ROOT_TILE = 150;

function stoneShaft(c: C, w: number, pal: Palette, v: number) {
  block(c, 0, 0, w, COURSE, pal, v === 1 ? 1 : v === 2 ? 2 : 0, v);
}

function stoneTop(c: C, w: number, pal: Palette, v: number, over: number, vines: boolean, r: () => number) {
  const ol = pal.outline;
  const slab = 14;
  // the first course under the slab
  block(c, 0, slab - 3, w, TOPH - slab + 3, pal, v % 3, v);
  // a shadow the slab throws on it
  c.fillStyle = rgba(ol, 0.32);
  c.fillRect(2, slab, w - 4, 6);
  // the slab itself, a little wider than the shaft
  c.beginPath();
  c.roundRect(-over, 0, w + over * 2, slab, [4, 4, 2, 2]);
  const g = c.createLinearGradient(0, 0, 0, slab);
  g.addColorStop(0, pal.stone.hi);
  g.addColorStop(0.4, pal.stone.light);
  g.addColorStop(1, pal.stone.mid);
  c.fillStyle = g;
  c.fill();
  c.strokeStyle = rgba(ol, 0.9);
  c.lineWidth = 2.6;
  c.lineJoin = 'round';
  c.stroke();
  // a joint and a hairline crack in the slab
  c.strokeStyle = rgba(ol, 0.45);
  c.lineWidth = 1.2;
  c.beginPath();
  const jx = w * (0.3 + r() * 0.4);
  c.moveTo(jx, 2.5);
  c.lineTo(jx + 1, slab - 1.5);
  c.stroke();
  lipLine(c, -over + 3, w + over - 3, 0, pal.lip.stone, 3);
  if (v === 2) {
    // a chipped corner
    c.fillStyle = rgba(ol, 0.55);
    c.beginPath();
    c.moveTo(w + over - 1, slab);
    c.lineTo(w + over - 8, slab);
    c.lineTo(w + over - 1, slab - 7);
    c.closePath();
    c.fill();
  }
  // moss at a corner of the slab, and a vine in the greener worlds
  if (v !== 0) mossClump(c, v === 1 ? w * 0.22 : w * 0.78, slab - 1, 16 + r() * 8, pal, 8);
  if (vines) {
    hang(c, v === 1 ? w * 0.82 : w * 0.2, slab - 1, 26 + r() * 14, pal);
  }
}

// ───────────────────────────── wood ─────────────────────────────

function barkFill(c: C, w: number, h: number, pal: Palette) {
  const g = c.createLinearGradient(0, 0, w, 0);
  g.addColorStop(0, pal.bark.light);
  g.addColorStop(0.3, pal.bark.mid);
  g.addColorStop(1, pal.bark.deep);
  c.fillStyle = g;
  c.fillRect(0, 0, w, h);
}

function woodShaft(c: C, w: number, h: number, pal: Palette, v: number) {
  const r = rng(w * 31 + v * 17 + 5);
  barkFill(c, w, h, pal);
  // grooves run top to bottom and meet themselves, so the tile repeats without a seam
  c.lineCap = 'round';
  const n = Math.max(3, Math.round(w / 13));
  for (let i = 1; i < n; i++) {
    const x = (i / n) * w + (r() - 0.5) * 4;
    const sw = (r() - 0.5) * 6;
    c.strokeStyle = rgba(pal.bark.deep, 0.5);
    c.lineWidth = 1.2 + r() * 1.2;
    c.beginPath();
    c.moveTo(x, 0);
    c.bezierCurveTo(x + sw, h * 0.33, x - sw, h * 0.66, x, h);
    c.stroke();
    c.strokeStyle = 'rgba(255,255,255,0.1)';
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(x + 1.6, 0);
    c.bezierCurveTo(x + 1.6 + sw, h * 0.33, x + 1.6 - sw, h * 0.66, x + 1.6, h);
    c.stroke();
  }
  // a knot, and on some a streak of moss
  const kx = w * (0.3 + r() * 0.4);
  const ky = h * (0.3 + r() * 0.4);
  for (let k = 1; k <= 2; k++) {
    c.strokeStyle = rgba(pal.bark.deep, 0.55);
    c.lineWidth = 1.1;
    c.beginPath();
    c.ellipse(kx, ky, 2.4 * k, 4.2 * k, 0, 0, TAU);
    c.stroke();
  }
  if (v === 1) {
    c.fillStyle = rgba(pal.moss.mid, 0.8);
    c.beginPath();
    c.ellipse(w * 0.25, h * 0.7, 5, 9, 0, 0, TAU);
    c.fill();
  }
  c.strokeStyle = rgba(pal.outline, 0.95);
  c.lineWidth = 2.8;
  c.beginPath();
  c.moveTo(1.4, 0);
  c.lineTo(1.4, h);
  c.moveTo(w - 1.4, 0);
  c.lineTo(w - 1.4, h);
  c.stroke();
}

function woodTop(c: C, w: number, pal: Palette, v: number, over: number, vines: boolean, r: () => number) {
  const ol = pal.outline;
  // the bark below the cut face
  c.save();
  c.beginPath();
  c.roundRect(0, 6, w, TOPH - 6, [5, 5, 0, 0]);
  c.clip();
  c.translate(0, TOPH - WOOD_TILE);
  woodShaft(c, w, WOOD_TILE, pal, v);
  c.translate(0, WOOD_TILE - TOPH);
  const sh = c.createLinearGradient(0, 8, 0, 26);
  sh.addColorStop(0, rgba(ol, 0.38));
  sh.addColorStop(1, rgba(ol, 0));
  c.fillStyle = sh;
  c.fillRect(0, 8, w, 18);
  c.restore();
  c.beginPath();
  c.roundRect(0, 6, w, TOPH - 6, [5, 5, 0, 0]);
  c.strokeStyle = rgba(ol, 0.95);
  c.lineWidth = 2.8;
  c.stroke();
  // the cut face: pale heartwood with its rings, a flat band whose top is the walking line
  c.beginPath();
  c.roundRect(-over, 0, w + over * 2, 12, [w * 0.4, w * 0.4, 7, 7]);
  const g = c.createLinearGradient(0, 0, 0, 12);
  g.addColorStop(0, pal.heart.hi);
  g.addColorStop(1, pal.heart.mid);
  c.fillStyle = g;
  c.fill();
  c.strokeStyle = ol;
  c.lineWidth = 2.6;
  c.lineJoin = 'round';
  c.stroke();
  c.strokeStyle = rgba(pal.bark.dark, 0.5);
  c.lineWidth = 0.9;
  for (const k of [0.34, 0.2]) {
    c.beginPath();
    c.ellipse(w / 2, 6.2, w * k, 3.2 * (k / 0.34), 0, 0, TAU);
    c.stroke();
  }
  lipLine(c, -over + 5, w + over - 5, 0, pal.lip.wood, 3);
  if (v === 2) mossClump(c, w * 0.25, 10, 18, pal, 8);
  if (vines) hang(c, w * 0.8, 10, 24 + r() * 12, pal);
}

// ───────────────────────────── root ─────────────────────────────

function earthShaft(c: C, w: number, h: number, look: Look, pal: Palette, v: number) {
  const g = look.ground;
  const r = rng(w * 53 + v * 11 + 3);
  const gr = c.createLinearGradient(0, 0, w, 0);
  gr.addColorStop(0, mixToHex(g.dirt, '#ffffff', 0.05));
  gr.addColorStop(0.6, mixToHex(g.dirt, g.dirtDark, 0.45));
  gr.addColorStop(1, mixToHex(g.dirtDark, g.outline, 0.3));
  c.fillStyle = gr;
  c.fillRect(0, 0, w, h);
  for (let i = 0; i < 6; i++) {
    c.fillStyle = r() > 0.5 ? 'rgba(255,255,255,0.14)' : rgba(g.outline, 0.25);
    c.beginPath();
    c.arc(r() * w, r() * h, 1 + r() * 1.6, 0, TAU);
    c.fill();
  }
  pebble(c, w * (0.22 + r() * 0.2), h * (0.16 + r() * 0.12), 5 + r() * 4, 3.6 + r() * 2, pal.stone, g.outline);
  pebble(c, w * (0.6 + r() * 0.2), h * (0.58 + r() * 0.2), 6 + r() * 4, 4 + r() * 2.4, pal.stone, g.outline);
  // a root that runs down the column and meets itself at the tile edge
  const x = w * (0.3 + 0.4 * r());
  const sw = 7 + r() * 5;
  c.lineCap = 'round';
  for (const [col, lw] of [[g.outline, 9.4], [pal.bark.mid, 5.2], [rgba(pal.bark.light, 0.8), 1.8]] as const) {
    c.strokeStyle = col;
    c.lineWidth = lw;
    c.beginPath();
    c.moveTo(x, -2);
    c.bezierCurveTo(x + sw, h * 0.3, x - sw, h * 0.7, x, h + 2);
    c.stroke();
  }
  c.strokeStyle = rgba(g.outline, 0.95);
  c.lineWidth = 2.8;
  c.beginPath();
  c.moveTo(1.4, 0);
  c.lineTo(1.4, h);
  c.moveTo(w - 1.4, 0);
  c.lineTo(w - 1.4, h);
  c.stroke();
}

function rootTop(c: C, w: number, look: Look, pal: Palette, v: number, over: number, vines: boolean, r: () => number) {
  const ol = pal.outline;
  // the earth under the tread: the end of a shaft tile, so the pattern carries on from it without a seam
  c.save();
  c.beginPath();
  c.rect(0, 8, w, TOPH);
  c.clip();
  c.translate(0, TOPH - ROOT_TILE);
  earthShaft(c, w, ROOT_TILE, look, pal, v);
  c.restore();
  c.strokeStyle = rgba(ol, 0.95);
  c.lineWidth = 2.8;
  c.beginPath();
  c.moveTo(1.4, 8);
  c.lineTo(1.4, TOPH);
  c.moveTo(w - 1.4, 8);
  c.lineTo(w - 1.4, TOPH);
  c.stroke();
  // the tread: a root log with a mat of moss on top
  c.beginPath();
  c.roundRect(-over, 0, w + over * 2, 19, 9);
  const g = c.createLinearGradient(0, 0, 0, 19);
  g.addColorStop(0, pal.bark.light);
  g.addColorStop(0.5, pal.bark.mid);
  g.addColorStop(1, pal.bark.deep);
  c.fillStyle = g;
  c.fill();
  c.strokeStyle = ol;
  c.lineWidth = 2.6;
  c.lineJoin = 'round';
  c.stroke();
  c.strokeStyle = rgba(pal.bark.deep, 0.5);
  c.lineWidth = 1;
  for (let x = 8; x < w - 4; x += 9) {
    c.beginPath();
    c.moveTo(x, 8);
    c.lineTo(x + 3, 17);
    c.stroke();
  }
  // moss, flat on top and scalloped below
  c.beginPath();
  c.moveTo(-over + 3, 0);
  c.lineTo(w + over - 3, 0);
  const n = Math.max(3, Math.round((w + over * 2) / 13));
  const seg = (w + over * 2 - 6) / n;
  for (let i = 0; i < n; i++) {
    const xa = w + over - 3 - i * seg;
    c.quadraticCurveTo(xa - seg * 0.1, 7 + r() * 5, xa - seg * 0.5, 7 + r() * 5);
    c.quadraticCurveTo(xa - seg * 0.9, 7, xa - seg, 3.5);
  }
  c.closePath();
  const mg = c.createLinearGradient(0, 0, 0, 11);
  mg.addColorStop(0, pal.moss.light);
  mg.addColorStop(1, pal.moss.dark);
  c.fillStyle = mg;
  c.fill();
  c.strokeStyle = rgba(pal.moss.deep, 0.8);
  c.lineWidth = 1.2;
  c.stroke();
  lipLine(c, -over + 4, w + over - 4, 0, pal.lip.moss, 3);
  if (v === 1) {
    // a root hooking down over the front of the column
    const x = w * 0.7;
    c.lineCap = 'round';
    for (const [col, lw] of [[ol, 9], [pal.bark.mid, 5]] as const) {
      c.strokeStyle = col;
      c.lineWidth = lw;
      c.beginPath();
      c.moveTo(x, 12);
      c.bezierCurveTo(x + 10, 24, x - 8, 40, x + 2, TOPH + 16);
      c.stroke();
    }
  }
  if (vines) hang(c, w * 0.2, 12, 22 + r() * 12, pal);
}

// ───────────────────────────── drawing ─────────────────────────────

function drawColumn(
  ctx: C, p: Platform, kind: Kind, variant: number, look: Look, world: number, bottom: number, over: number, vines: boolean, tag: string,
) {
  const pal = paletteFor(look, world);
  const w = Math.round(p.width);
  const key = `col:${tag}:${kind}:${variant}:${w}:${world}`;
  const r = rng(Math.abs(p.id) * 131 + variant * 7 + 11);
  const spr = bakeSprite(key, w, TOPH, { x: PADX + over, top: PAD_TOP, bot: PAD_BOT }, (c) => {
    if (kind === 'stone') stoneTop(c, w, pal, variant, over, vines, r);
    else if (kind === 'wood') woodTop(c, w, pal, variant, over, vines, r);
    else rootTop(c, w, look, pal, variant, over, vines, r);
  });
  const sh = kind === 'stone' ? COURSE : kind === 'wood' ? WOOD_TILE : ROOT_TILE;
  const pat = shaftPattern(ctx, `shaft:${kind}:${variant}:${w}:${world}`, w, sh, (c) => {
    if (kind === 'stone') stoneShaft(c, w, pal, variant);
    else if (kind === 'wood') woodShaft(c, w, sh, pal, variant);
    else earthShaft(c, w, sh, look, pal, variant);
  });
  const x = Math.round(p.x);
  const y0 = Math.round(p.y) + TOPH;
  const depth = bottom - y0;
  if (depth > 0) {
    pat.setTransform(new DOMMatrix().translate(x, y0).scale(1 / RES));
    ctx.fillStyle = pat;
    ctx.fillRect(x, y0, w, depth);
    // the column sinks into shadow with depth
    // (kept by colour, laid at y0 with a shift: PERFORMANCE-RULES §2.3)
    const outline = look.ground.outline;
    let gr = sinkGrads.get(outline);
    if (!gr) {
      gr = ctx.createLinearGradient(0, 40, 0, 260);
      gr.addColorStop(0, rgba(outline, 0));
      gr.addColorStop(1, rgba(outline, 0.62));
      sinkGrads.set(outline, gr);
    }
    ctx.translate(0, y0);
    ctx.fillStyle = gr;
    ctx.fillRect(x, 40, w, Math.max(0, depth - 40));
    ctx.translate(0, -y0);
  }
  blit(ctx, spr, p.x, p.y);
}

/** one step of a stair run */
export function drawStep(ctx: C, p: Platform, gp: GroundPlan, look: Look, world: number, bottom: number) {
  const kinds = STAIR_KIND[world] ?? STAIR_KIND[1];
  const kind = kinds[gp.variant % 3];
  // neighbouring steps carve differently: the index shifts the variant
  const v = (gp.variant + (gp.stepIndex ?? 0)) % 3;
  const vines = world >= 7 && (gp.stepIndex ?? 0) % 2 === 0;
  drawColumn(ctx, p, kind, v, look, world, bottom, 0, vines, `step${(gp.stepIndex ?? 0) % 2}`);
}

/** a free-standing pillar: the variant mod 3 is its material, the rest is how it is dressed */
export function drawPillar(ctx: C, p: Platform, gp: GroundPlan, look: Look, world: number, bottom: number) {
  const kind = PILLAR_KIND[gp.variant % 3];
  const carve = (Math.floor(gp.variant / 3) + Math.abs(p.id)) % 3;
  const vines = world >= 7 || (Math.abs(p.id) + gp.variant) % 3 === 0;
  drawColumn(ctx, p, kind, carve, look, world, bottom, kind === 'root' ? 2 : 4, vines, `pillar${p.id}`);
}

void lighten;
void darken;
