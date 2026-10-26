/**
 * w5Look — how World 5's pieces look: clean drawn stand-ins until the painted World 5 art lands, each behind one simple name so the art
 * swaps in without touching the rules (w5Kit.ts) or the run (w5Play.ts).
 *
 * The swap: once the World 5 props atlas is cut (Hugging Face, the w5 art batch), call `useW5Atlas(img, frames)` with the sheet and
 * where each named piece sits in it. Every draw below first asks `drawW5Art` for the painted piece and only draws its stand-in when
 * the atlas has no frame of that name (or has not loaded). The words of Meeca's carvings and the table's card are always drawn by the
 * game, over the painted trunk or card, so they stay crisp.
 *
 * Sizes follow the concept art (scratchpad w5art): a chair a little taller than Pokey, the table about as tall as him, a cake the size of a
 * petal, the Butler a head taller than him. Colours from the sheets: rose and lilac velvet, cream silk, china white with gold rims.
 */
import { shakyLetters, type Carving } from './w5Kit.ts';

export type W5Piece =
  | 'table' | 'chair' | 'chairLilac' | 'wrappedChair' | 'wrappedStool' | 'cake' | 'cakePlate' | 'teapot' | 'cup' | 'card'
  | 'carvedTrunk' | 'orchidOpen' | 'orchidHalf' | 'orchidClosed' | 'silkThread' | 'silkBridge' | 'silkSheet' | 'cocoon' | 'cocoonOpen'
  | 'doily' | 'pinkBell' | 'fern' | 'shrine' | 'flag' | 'butler' | 'butlerOffer';

export interface W5Frame { x: number; y: number; w: number; h: number }
let atlas: { img: CanvasImageSource; frames: Partial<Record<W5Piece, W5Frame>> } | null = null;

/** hand World 5 its painted pieces (the atlas image, loaded, and where each named piece sits in it) */
export function useW5Atlas(img: CanvasImageSource, frames: Partial<Record<W5Piece, W5Frame>>): void {
  atlas = { img, frames };
}

/** the painted piece `n`, `w` wide, bottom middle at (x, b); false (nothing drawn) when there is none yet */
export function drawW5Art(ctx: CanvasRenderingContext2D, n: W5Piece, x: number, b: number, w: number, o: { flip?: boolean; rot?: number; alpha?: number } = {}): boolean {
  const f = atlas?.frames[n];
  if (!atlas || !f) return false;
  const h = (w * f.h) / f.w;
  ctx.save();
  ctx.translate(x, b);
  if (o.rot) ctx.rotate(o.rot);
  if (o.flip) ctx.scale(-1, 1);
  if (o.alpha !== undefined) ctx.globalAlpha *= o.alpha;
  ctx.drawImage(atlas.img, f.x, f.y, f.w, f.h, -w / 2, -h, w, h);
  ctx.restore();
  return true;
}

const INK = '#3b2a3a';
const rr = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
};
const fillStroke = (ctx: CanvasRenderingContext2D, fill: string, lw = 2.5) => {
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = lw;
  ctx.strokeStyle = INK;
  ctx.stroke();
};

// ───────────────────────────── chairs and the table ─────────────────────────────

const VELVET: Record<string, [string, string]> = { pink: ['#f2a7b5', '#e48a9c'], lilac: ['#c4a8e8', '#a98bd6'], cream: ['#f4ead8', '#e2d3b8'] };

/** a soft wing armchair, its seat at the ground `b`, `w` wide, facing `face` (+1 right); `tug` 0..1 leans it toward him a little */
export function drawChair(ctx: CanvasRenderingContext2D, x: number, b: number, w: number, color: 'pink' | 'lilac' | 'cream' = 'pink', face: 1 | -1 = 1, tug = 0, t = 0) {
  if (drawW5Art(ctx, color === 'lilac' ? 'chairLilac' : 'chair', x, b, w, { flip: face < 0, rot: tug * 0.04 * Math.sin(t * 5) })) return;
  const [main, dark] = VELVET[color];
  const k = w / 80;
  ctx.save();
  ctx.translate(x, b);
  ctx.scale(face * k, k);
  ctx.rotate(tug * 0.04 * Math.sin(t * 5));
  // legs
  ctx.fillStyle = '#8a5a3c';
  for (const lx of [-26, 24]) {
    rr(ctx, lx - 4, -12, 8, 12, 3);
    fillStroke(ctx, '#9a6a48', 2);
  }
  // the back, a tall rounded wing
  rr(ctx, -34, -96, 56, 76, 22);
  fillStroke(ctx, main);
  ctx.fillStyle = dark;
  for (const [bx, by] of [[-16, -76], [2, -76], [-7, -60]]) {
    ctx.beginPath();
    ctx.arc(bx, by, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  // the seat cushion and the arm toward the front
  rr(ctx, -36, -42, 70, 30, 12);
  fillStroke(ctx, main);
  rr(ctx, 16, -56, 22, 42, 11);
  fillStroke(ctx, dark);
  rr(ctx, -40, -58, 18, 44, 9);
  fillStroke(ctx, dark);
  ctx.restore();
}

/** one of the guests who sat: a chair wrapped all over in silk, with the round shape of whoever sat in it */
export function drawWrappedChair(ctx: CanvasRenderingContext2D, x: number, b: number, w: number, flip = false, stool = false) {
  if (drawW5Art(ctx, stool ? 'wrappedStool' : 'wrappedChair', x, b, w, { flip })) return;
  const k = w / 80;
  ctx.save();
  ctx.translate(x, b);
  ctx.scale((flip ? -1 : 1) * k, k);
  ctx.fillStyle = '#efe7dc';
  if (stool) {
    rr(ctx, -24, -54, 48, 12, 6);
    fillStroke(ctx, '#f3ece2');
    for (const lx of [-18, 14]) {
      rr(ctx, lx, -44, 6, 44, 3);
      fillStroke(ctx, '#e9e0d3', 2);
    }
  } else {
    rr(ctx, -34, -96, 56, 80, 22);
    fillStroke(ctx, '#f3ece2');
    rr(ctx, -38, -44, 74, 34, 12);
    fillStroke(ctx, '#ece3d6');
    ctx.beginPath();
    ctx.arc(-6, -58, 22, 0, Math.PI * 2);
    fillStroke(ctx, '#f6efe6');
    for (const lx of [-26, 22]) {
      rr(ctx, lx - 4, -12, 8, 12, 3);
      fillStroke(ctx, '#e9e0d3', 2);
    }
  }
  // the wrapping, criss-crossed
  ctx.strokeStyle = 'rgba(160, 150, 170, 0.75)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(-40, -90 + i * 15);
    ctx.lineTo(38, -78 + i * 13 - (i % 2) * 24);
    ctx.stroke();
  }
  ctx.restore();
}

/** the little table set for two: a round cloth with a lace hem, china cups, a plate of tiny cakes, the pot, and the card */
export function drawTeaTable(ctx: CanvasRenderingContext2D, x: number, b: number, t: number) {
  if (!drawW5Art(ctx, 'table', x, b, 132)) {
    ctx.save();
    ctx.translate(x, b);
    // foot and pedestal
    ctx.beginPath();
    ctx.ellipse(0, -5, 34, 7, 0, 0, Math.PI * 2);
    fillStroke(ctx, '#9a6a48');
    rr(ctx, -6, -52, 12, 48, 4);
    fillStroke(ctx, '#8a5a3c');
    // the cloth and its lace hem
    ctx.beginPath();
    ctx.moveTo(-62, -74);
    ctx.lineTo(62, -74);
    ctx.lineTo(58, -40);
    ctx.lineTo(-58, -40);
    ctx.closePath();
    fillStroke(ctx, '#fbf7f2');
    ctx.fillStyle = '#fbf7f2';
    for (let i = 0; i < 9; i++) {
      ctx.beginPath();
      ctx.arc(-52 + i * 13, -40, 6.5, 0, Math.PI);
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(-52 + i * 13, -40, 2, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(59, 42, 58, 0.5)';
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.ellipse(0, -74, 62, 9, 0, 0, Math.PI * 2);
    fillStroke(ctx, '#ffffff');
    ctx.restore();
  }
  // on the table: two cups, the cake plate, the pot (warm: a wisp)
  drawCup(ctx, x - 40, b - 76);
  drawCup(ctx, x + 40, b - 76, true);
  drawCakePlate(ctx, x - 6, b - 76, 34);
  drawTeapot(ctx, x + 14, b - 80, 34, -1, 0);
  drawSteam(ctx, x - 6, b - 108, 50, 0.35 + 0.15 * Math.sin(t * 2), t, 0.5);
  // the card on its silk napkin
  ctx.save();
  ctx.translate(x - 22, b - 82);
  ctx.rotate(-0.12);
  rr(ctx, -10, -7, 20, 13, 2);
  fillStroke(ctx, '#fff8e8', 1.5);
  ctx.restore();
}

export function drawCup(ctx: CanvasRenderingContext2D, x: number, b: number, flip = false) {
  if (drawW5Art(ctx, 'cup', x, b, 22, { flip })) return;
  ctx.save();
  ctx.translate(x, b);
  if (flip) ctx.scale(-1, 1);
  ctx.beginPath();
  ctx.ellipse(0, -1, 11, 3, 0, 0, Math.PI * 2);
  fillStroke(ctx, '#e8eefc', 1.5);
  ctx.beginPath();
  ctx.moveTo(-7, -11);
  ctx.lineTo(7, -11);
  ctx.quadraticCurveTo(7, -2, 0, -2);
  ctx.quadraticCurveTo(-7, -2, -7, -11);
  fillStroke(ctx, '#ffffff', 1.5);
  ctx.beginPath();
  ctx.arc(9, -7, 3, -Math.PI / 2, Math.PI / 2);
  ctx.strokeStyle = INK;
  ctx.stroke();
  ctx.strokeStyle = '#d4a24c';
  ctx.beginPath();
  ctx.moveTo(-7, -10);
  ctx.lineTo(7, -10);
  ctx.stroke();
  ctx.restore();
}

/** the card, big enough to read, with the words in careful handwriting (drawn over its painted paper when there is one) */
export function drawCard(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, alpha: number) {
  if (alpha <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.font = 'italic 600 15px Georgia, serif';
  const words = text.split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(next).width > 150 && cur) {
      lines.push(cur);
      cur = w;
    } else cur = next;
  }
  if (cur) lines.push(cur);
  const h = 18 * lines.length + 22;
  if (!drawW5Art(ctx, 'card', x, y + h / 2, 184)) {
    rr(ctx, x - 92, y - h / 2, 184, h, 6);
    ctx.fillStyle = '#fff8e8';
    ctx.fill();
    ctx.strokeStyle = '#c9a86a';
    ctx.lineWidth = 2;
    ctx.stroke();
    rr(ctx, x - 86, y - h / 2 + 6, 172, h - 12, 4);
    ctx.strokeStyle = 'rgba(201, 168, 106, 0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  ctx.fillStyle = '#5b3a4e';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  lines.forEach((l, i) => ctx.fillText(l, x, y - h / 2 + 20 + i * 18));
  ctx.restore();
}

// ───────────────────────────── cakes and the pot ─────────────────────────────

/** a tiny cake floating like a pickup (its middle at x, y): pink icing, a cherry, a little sparkle so it reads as a treat */
export function drawCake(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, t: number, glint = true, halo = false) {
  if (halo) {
    // the same warm halo the petals have, so it reads as something to pick up
    const r = size * 1.25 * (0.95 + 0.05 * Math.sin(t * 3 + x));
    const g = ctx.createRadialGradient(x, y, size * 0.2, x, y, r);
    g.addColorStop(0, 'rgba(255, 244, 170, 0.75)');
    g.addColorStop(0.7, 'rgba(255, 230, 120, 0.35)');
    g.addColorStop(1, 'rgba(255, 230, 120, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  if (drawW5Art(ctx, 'cake', x, y + size / 2, size)) return;
  const k = size / 26;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(k, k);
  rr(ctx, -11, -4, 22, 14, 3);
  fillStroke(ctx, '#f0c590', 1.8);
  ctx.fillStyle = '#f7a8c4';
  ctx.fillRect(-11, 2, 22, 3);
  ctx.beginPath();
  ctx.moveTo(-12, -4);
  ctx.quadraticCurveTo(0, -12, 12, -4);
  ctx.quadraticCurveTo(8, 0, 4, -2);
  ctx.quadraticCurveTo(0, 1, -4, -2);
  ctx.quadraticCurveTo(-8, 0, -12, -4);
  fillStroke(ctx, '#fff1f6', 1.6);
  ctx.beginPath();
  ctx.arc(0, -11, 3.4, 0, Math.PI * 2);
  fillStroke(ctx, '#e11d48', 1.4);
  ctx.restore();
  if (glint) {
    const g = 0.5 + 0.5 * Math.sin(t * 4 + x * 0.05);
    ctx.save();
    ctx.globalAlpha = 0.6 * g;
    ctx.fillStyle = '#fff7d6';
    ctx.beginPath();
    const sx = x + size * 0.45, sy = y - size * 0.5, r = 4 + 2 * g;
    ctx.moveTo(sx, sy - r);
    ctx.quadraticCurveTo(sx, sy, sx + r, sy);
    ctx.quadraticCurveTo(sx, sy, sx, sy + r);
    ctx.quadraticCurveTo(sx, sy, sx - r, sy);
    ctx.quadraticCurveTo(sx, sy, sx, sy - r);
    ctx.fill();
    ctx.restore();
  }
}

export function drawCakePlate(ctx: CanvasRenderingContext2D, x: number, b: number, w: number) {
  if (drawW5Art(ctx, 'cakePlate', x, b, w)) return;
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(x, b - 2, w / 2, w * 0.1, 0, 0, Math.PI * 2);
  fillStroke(ctx, '#e8eefc', 1.5);
  ctx.restore();
  drawCake(ctx, x - w * 0.2, b - 9, w * 0.42, 0, false);
  drawCake(ctx, x + w * 0.2, b - 9, w * 0.42, 0, false);
  drawCake(ctx, x, b - 17, w * 0.42, 0, false);
}

/** a warm teapot, bottom middle at (x, b), spout toward `dir`; `rattle` 0..1 lifts and shakes the lid (the warning before a puff) */
export function drawTeapot(ctx: CanvasRenderingContext2D, x: number, b: number, w: number, dir: 1 | -1, rattle: number, t = 0) {
  const shake = rattle > 0 ? Math.sin(t * 40) * 1.6 * rattle : 0;
  if (drawW5Art(ctx, 'teapot', x + shake, b, w, { flip: dir < 0 })) return;
  const k = w / 56;
  ctx.save();
  ctx.translate(x + shake, b);
  ctx.scale(dir * k, k);
  // spout and handle
  ctx.beginPath();
  ctx.moveTo(14, -18);
  ctx.quadraticCurveTo(30, -20, 34, -38);
  ctx.lineTo(28, -38);
  ctx.quadraticCurveTo(24, -26, 12, -26);
  fillStroke(ctx, '#ffffff', 2);
  ctx.beginPath();
  ctx.arc(-22, -24, 10, Math.PI * 0.5, Math.PI * 1.5);
  ctx.lineWidth = 5;
  ctx.strokeStyle = INK;
  ctx.stroke();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();
  // body
  ctx.beginPath();
  ctx.ellipse(0, -20, 22, 19, 0, 0, Math.PI * 2);
  fillStroke(ctx, '#fbfbff', 2.2);
  ctx.strokeStyle = '#d4a24c';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, -6, 18, 3, 0, 0, Math.PI);
  ctx.stroke();
  // lid (it hops while it rattles)
  const lift = rattle > 0 ? 2 + Math.abs(Math.sin(t * 22)) * 4 * rattle : 0;
  ctx.beginPath();
  ctx.ellipse(0, -38 - lift, 11, 4, 0, 0, Math.PI * 2);
  fillStroke(ctx, '#fbfbff', 2);
  ctx.beginPath();
  ctx.arc(0, -43 - lift, 3.5, 0, Math.PI * 2);
  fillStroke(ctx, '#e7b45a', 1.5);
  ctx.restore();
}

/** sleepy steam rising from (x, y): soft lilac curls `h` high; `a` its strength 0..1, `spread` how wide it billows (1 a full puff) */
export function drawSteam(ctx: CanvasRenderingContext2D, x: number, y: number, h: number, a: number, t: number, spread = 1) {
  if (a <= 0.02) return;
  ctx.save();
  for (let i = 0; i < 7; i++) {
    const u = ((t * 0.6 + i / 7) % 1);
    const cx = x + Math.sin(u * 6 + i) * 14 * spread;
    const cy = y - u * h;
    const r = (8 + u * 26) * spread;
    ctx.globalAlpha = a * (1 - u) * 0.85;
    // (a sleepy lilac, with a soft edge, so a puff reads against the pale garden)
    ctx.fillStyle = i % 2 ? '#d8b4fe' : '#f5d0fe';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(126, 87, 194, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  ctx.restore();
}

// ───────────────────────────── Meeca's carvings ─────────────────────────────

/** a trunk with words carved in it (Meeca's hairpin): the trunk, then the shaky letters, cut light into the bark */
export function drawCarving(ctx: CanvasRenderingContext2D, c: Carving, seed: number) {
  const size = c.size ?? 34;
  if (c.trunk) {
    const { ground, w, h } = c.trunk;
    if (!drawW5Art(ctx, 'carvedTrunk', c.x, ground, w * 1.3)) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(c.x - w / 2 - 14, ground);
      ctx.quadraticCurveTo(c.x - w / 2, ground - 20, c.x - w / 2 + 4, ground - h);
      ctx.lineTo(c.x + w / 2 - 4, ground - h);
      ctx.quadraticCurveTo(c.x + w / 2, ground - 20, c.x + w / 2 + 14, ground);
      ctx.closePath();
      fillStroke(ctx, '#9b7552', 3);
      ctx.strokeStyle = 'rgba(80, 52, 34, 0.45)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 5; i++) {
        const lx = c.x - w / 2 + 12 + i * ((w - 24) / 4);
        ctx.beginPath();
        ctx.moveTo(lx, ground - h + 10);
        ctx.quadraticCurveTo(lx + 6, ground - h / 2, lx - 2, ground - 16);
        ctx.stroke();
      }
      // moss at the foot
      ctx.fillStyle = '#7fa651';
      for (const dx of [-w / 2, -w / 4, w / 3]) {
        ctx.beginPath();
        ctx.ellipse(c.x + dx, ground - 8, 18, 9, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  c.lines.forEach((line, li) => {
    const letters = shakyLetters(line, seed + li * 7);
    ctx.font = `700 ${size}px Fredoka, sans-serif`;
    const widths = letters.map((l) => ctx.measureText(l.ch).width * 0.95);
    const total = widths.reduce((a, b) => a + b, 0);
    let lx = c.x - total / 2;
    const ly = c.y + li * size * 1.15;
    letters.forEach((l, i) => {
      const cx = lx + widths[i] / 2 + l.dx;
      ctx.save();
      ctx.translate(cx, ly + l.dy);
      ctx.rotate(l.rot);
      ctx.font = `700 ${Math.round(size * l.k)}px Fredoka, sans-serif`;
      // cut into the bark: a dark groove, then the pale wood inside it
      ctx.fillStyle = 'rgba(52, 30, 18, 0.85)';
      ctx.fillText(l.ch, 1.2, 1.6);
      ctx.fillStyle = '#e8cfa2';
      ctx.fillText(l.ch, 0, 0);
      ctx.restore();
      lx += widths[i];
    });
  });
  ctx.restore();
}

// ───────────────────────────── orchids ─────────────────────────────

/** a big orchid, its bloom's top at (x, y), `w` wide; `open` 1 open (a ledge), 0 shut (a bud); `shiver` while it is about to close */
export function drawOrchid(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, open: number, shiver: number, t: number, stemTo?: number) {
  const n: W5Piece = open > 0.7 ? 'orchidOpen' : open > 0.25 ? 'orchidHalf' : 'orchidClosed';
  const jig = shiver > 0 ? Math.sin(t * 34) * 2 * shiver : 0;
  if (stemTo !== undefined) {
    ctx.save();
    ctx.strokeStyle = '#5f8a3a';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(x, y + 14);
    ctx.quadraticCurveTo(x + 18, (y + stemTo) / 2, x - 6, stemTo);
    ctx.stroke();
    ctx.restore();
  }
  if (drawW5Art(ctx, n, x + jig, y + w * 0.45, w)) return;
  ctx.save();
  ctx.translate(x + jig, y + 6);
  const spread = 0.25 + 0.75 * open;
  // five petals fanning out as it opens
  const petals = [-1.25, -0.62, 0, 0.62, 1.25];
  petals.forEach((a, i) => {
    ctx.save();
    ctx.rotate(a * spread);
    ctx.beginPath();
    ctx.ellipse(0, -w * 0.18 * spread, w * 0.16, w * 0.3 * (0.6 + 0.4 * spread), 0, 0, Math.PI * 2);
    ctx.fillStyle = i % 2 ? '#f4d9f0' : '#fbeefa';
    ctx.fill();
    ctx.strokeStyle = '#9c6b9a';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  });
  if (open > 0.3) {
    // the wide lip he stands on
    ctx.beginPath();
    ctx.ellipse(0, 2, w * 0.5 * open, 9, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#f3c6e6';
    ctx.fill();
    ctx.strokeStyle = '#9c6b9a';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, -6, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#facc15';
    ctx.fill();
  }
  ctx.restore();
}

// ───────────────────────────── silk ─────────────────────────────

/** a humming thread strung low across the way between two little posts; `quiver` 0..1 after a touch. Its dew drops tremble and a glint
 *  runs along it now and then: the sign that this one hums (it must read at a glance, at running speed) */
export function drawThread(ctx: CanvasRenderingContext2D, x0: number, x1: number, y: number, quiver: number, t: number) {
  ctx.save();
  ctx.lineCap = 'round';
  // the posts: two little twigs it is tied to, each with a knot of silk
  for (const px of [x0, x1]) {
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(px, y + 14);
    ctx.lineTo(px + (px === x0 ? -3 : 3), y - 26);
    ctx.stroke();
    ctx.strokeStyle = '#9a6a48';
    ctx.lineWidth = 3.5;
    ctx.stroke();
    ctx.fillStyle = '#fbf6ff';
    ctx.beginPath();
    ctx.ellipse(px, y, 5, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(120, 100, 140, 0.8)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }
  const amp = quiver * 7;
  const pathAt = (u: number) => ({ x: x0 + (x1 - x0) * u, y: y + Math.sin(u * Math.PI) * (3 + amp * Math.sin(t * 50 + u * 9)) });
  const line = () => {
    ctx.beginPath();
    for (let i = 0; i <= 24; i++) {
      const q = pathAt(i / 24);
      if (i === 0) ctx.moveTo(q.x, q.y);
      else ctx.lineTo(q.x, q.y);
    }
    ctx.stroke();
  };
  ctx.strokeStyle = 'rgba(255, 226, 160, 0.55)';
  ctx.lineWidth = 7;
  line();
  ctx.strokeStyle = 'rgba(80, 60, 90, 0.55)';
  ctx.lineWidth = 3.6;
  line();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.2;
  line();
  // a glint running along it every couple of seconds
  const g = (t * 0.6 + x0 * 0.001) % 1.6;
  if (g < 1) {
    const q = pathAt(g);
    const grad = ctx.createRadialGradient(q.x, q.y, 0, q.x, q.y, 12);
    grad.addColorStop(0, 'rgba(255, 250, 220, 0.95)');
    grad.addColorStop(1, 'rgba(255, 250, 220, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(q.x, q.y, 12, 0, Math.PI * 2);
    ctx.fill();
  }
  // dew drops that tremble
  for (let i = 1; i < 4; i++) {
    const q = pathAt(i / 4);
    ctx.fillStyle = `rgba(255, 236, 170, ${0.8 + 0.2 * Math.sin(t * 3 + i * 2)})`;
    ctx.strokeStyle = 'rgba(120, 90, 40, 0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(q.x, q.y + 4 + Math.sin(t * 6 + i) * 0.8, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  if (quiver > 0.05) {
    // the hum itself, rings going out
    ctx.strokeStyle = `rgba(255, 236, 179, ${0.8 * quiver})`;
    ctx.lineWidth = 2.5;
    for (let k = 0; k < 3; k++) {
      ctx.beginPath();
      ctx.ellipse((x0 + x1) / 2, y, 20 + (1 - quiver) * 110 + k * 26, 8 + (1 - quiver) * 30 + k * 9, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  ctx.restore();
}

/** a liana made of silk (World 5's silk lines): a pale, shining strand with a few dew beads, swung about its top */
export function drawSilkStrand(ctx: CanvasRenderingContext2D, v: { x: number; topY: number; bottomY: number; id: number }, ang: number, t: number) {
  const len = v.bottomY - v.topY;
  const tipX = v.x + Math.sin(ang) * len;
  const tipY = v.topY + Math.cos(ang) * len;
  const midX = (v.x + tipX) / 2 + Math.sin(ang * 0.5) * 10;
  const midY = (v.topY + tipY) / 2;
  ctx.save();
  ctx.lineCap = 'round';
  for (const [c, lw] of [['rgba(255, 236, 190, 0.45)', 11], ['rgba(70, 50, 90, 0.75)', 7], ['#fbf6ff', 4.4], ['rgba(255, 255, 255, 0.95)', 1.6]] as const) {
    ctx.strokeStyle = c;
    ctx.lineWidth = lw;
    ctx.beginPath();
    ctx.moveTo(v.x, v.topY);
    ctx.quadraticCurveTo(midX, midY, tipX, tipY);
    ctx.stroke();
  }
  for (let i = 1; i <= 4; i++) {
    const u = i / 5;
    const x = (1 - u) * (1 - u) * v.x + 2 * (1 - u) * u * midX + u * u * tipX;
    const y = (1 - u) * (1 - u) * v.topY + 2 * (1 - u) * u * midY + u * u * tipY;
    ctx.fillStyle = `rgba(255, 248, 225, ${0.6 + 0.4 * Math.sin(t * 3 + i + v.id)})`;
    ctx.beginPath();
    ctx.arc(x + 2.5, y, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  // a little knot of silk at the bottom to hold
  ctx.fillStyle = '#fbf6ff';
  ctx.strokeStyle = 'rgba(120, 100, 140, 0.7)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(tipX, tipY, 6, 9, ang, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

/** a shimmering sheet of silk hanging over [x0, x1] from `top` to `bottom`: lovely, slow light moving across it */
export function drawSilkSheet(ctx: CanvasRenderingContext2D, x0: number, x1: number, top: number, bottom: number, t: number, near: number) {
  if (drawW5Art(ctx, 'silkSheet', (x0 + x1) / 2, bottom, x1 - x0, { alpha: 0.9 })) return;
  ctx.save();
  const w = x1 - x0;
  ctx.beginPath();
  ctx.moveTo(x0, top);
  for (let i = 0; i <= 10; i++) ctx.lineTo(x0 + (w * i) / 10, top + Math.sin(i * 1.7) * 6);
  for (let i = 10; i >= 0; i--) ctx.lineTo(x0 + (w * i) / 10 + Math.sin(t * 0.8 + i) * 6, bottom - 6 - Math.abs(Math.sin(i * 2.1)) * 22);
  ctx.closePath();
  const g = ctx.createLinearGradient(x0, top, x1, bottom);
  const s = (t * 0.25) % 1;
  g.addColorStop(0, 'rgba(255, 250, 255, 0.55)');
  g.addColorStop(Math.max(0, s - 0.12), 'rgba(240, 225, 255, 0.5)');
  g.addColorStop(s, `rgba(255, 244, 214, ${0.75 + 0.2 * near})`);
  g.addColorStop(Math.min(1, s + 0.12), 'rgba(236, 222, 255, 0.5)');
  g.addColorStop(1, 'rgba(255, 250, 255, 0.5)');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = 'rgba(150, 120, 180, 0.55)';
  ctx.lineWidth = 2;
  ctx.stroke();
  // the weave: long hanging threads, and a few crossing them, catching the light
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.lineWidth = 1.2;
  for (let i = 1; i < 8; i++) {
    const lx = x0 + (w * i) / 8;
    ctx.beginPath();
    ctx.moveTo(lx, top + 4);
    ctx.quadraticCurveTo(lx + Math.sin(t + i) * 8, (top + bottom) / 2, lx, bottom - 20);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(255, 240, 210, 0.7)';
  for (let k = 1; k < 5; k++) {
    const ly = top + ((bottom - top - 30) * k) / 5;
    ctx.beginPath();
    ctx.moveTo(x0 + 6, ly);
    ctx.quadraticCurveTo((x0 + x1) / 2, ly + 14 + Math.sin(t * 0.7 + k) * 5, x1 - 6, ly);
    ctx.stroke();
  }
  // a lace hem
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  for (let lx = x0 + 10; lx < x1 - 6; lx += 16) {
    ctx.beginPath();
    ctx.arc(lx, bottom - 26 + Math.sin(t * 0.8 + lx * 0.05) * 3, 6, 0, Math.PI);
    ctx.fill();
  }
  ctx.restore();
}

/** silk creeping up Pokey (feet at x, y): wraps of thread from the ground up, `silk` 0..1 of the way */
export function drawSilkOnPokey(ctx: CanvasRenderingContext2D, x: number, y: number, silk: number, t: number) {
  if (silk <= 0.02) return;
  ctx.save();
  const n = Math.ceil(silk * 7);
  for (let i = 0; i < n; i++) {
    const u = i / 7;
    const yy = y - 4 - u * 50;
    const a = Math.min(1, silk * 7 - i);
    ctx.globalAlpha = 0.85 * a;
    ctx.strokeStyle = '#fdfaff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(x, yy, 18 - Math.abs(u - 0.5) * 6, 5, Math.sin(i * 1.9 + t * 0.4) * 0.35, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(150, 130, 170, 0.6)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  ctx.restore();
}

/** a cocoon hanging with its bottom at (x, b): someone wrapped inside; `shake` after a hit, `cracks` hits so far, `open` freed */
export function drawCocoon(ctx: CanvasRenderingContext2D, x: number, b: number, shake: number, cracks: number, open: boolean, t: number) {
  const jig = shake > 0 ? Math.sin(t * 40) * 3 * shake : Math.sin(t * 1.3 + x) * 0.8;
  if (drawW5Art(ctx, open ? 'cocoonOpen' : 'cocoon', x + jig, b, 46)) return;
  ctx.save();
  ctx.translate(x + jig, b);
  // the thread it hangs from
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, -70);
  ctx.lineTo(0, -150);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(0, -36, 20, 34, 0, 0, Math.PI * 2);
  fillStroke(ctx, open ? 'rgba(243, 236, 226, 0.6)' : '#f3ece2');
  ctx.strokeStyle = 'rgba(160, 150, 170, 0.7)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(-19, -60 + i * 9);
    ctx.lineTo(19, -52 + i * 9 - (i % 2) * 12);
    ctx.stroke();
  }
  if (!open) {
    // a pair of eyes peeking through
    ctx.fillStyle = INK;
    for (const ex of [-6, 6]) {
      ctx.beginPath();
      ctx.arc(ex, -42, 2.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    for (let k = 0; k < cracks; k++) {
      ctx.beginPath();
      ctx.moveTo(-10 + k * 8, -20 - k * 10);
      ctx.lineTo(-4 + k * 8, -28 - k * 10);
      ctx.lineTo(-8 + k * 8, -34 - k * 10);
      ctx.stroke();
    }
  }
  ctx.restore();
}

// ───────────────────────────── the Butler (a stand-in until his clips land) ─────────────────────────────

/** the Butler, feet at (x, b), facing `dir`: lavender fuzz, big eyes, a striped waistcoat and a bow tie, holding his tray */
export function drawButler(ctx: CanvasRenderingContext2D, x: number, b: number, dir: 1 | -1, tray: { x: number; y: number; out: number }, cake: boolean, t: number, bow = 0) {
  if (!drawW5Art(ctx, tray.out > 0.5 ? 'butlerOffer' : 'butler', x, b, 84, { flip: dir < 0 })) {
    ctx.save();
    ctx.translate(x, b);
    ctx.scale(dir, 1);
    const bob = Math.sin(t * 3) * 1.5;
    // legs
    ctx.strokeStyle = '#4a3a55';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    for (const [hx, fx] of [[-10, -26], [-4, -14], [4, 12], [10, 28]]) {
      ctx.beginPath();
      ctx.moveTo(hx, -30);
      ctx.quadraticCurveTo(hx * 2.2, -22, fx, 0);
      ctx.stroke();
    }
    ctx.translate(0, bob);
    ctx.rotate(bow * 0.35);
    // body in its waistcoat
    ctx.beginPath();
    ctx.ellipse(0, -42, 20, 22, 0, 0, Math.PI * 2);
    fillStroke(ctx, '#b9a2dc');
    ctx.save();
    ctx.clip();
    ctx.fillStyle = '#8f78b8';
    for (let i = -20; i < 20; i += 6) ctx.fillRect(i, -64, 3, 44);
    ctx.restore();
    ctx.beginPath();
    ctx.moveTo(-8, -60);
    ctx.lineTo(0, -46);
    ctx.lineTo(8, -60);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    // the bow tie
    ctx.fillStyle = '#1f1724';
    ctx.beginPath();
    ctx.moveTo(0, -60);
    ctx.lineTo(-9, -65);
    ctx.lineTo(-9, -55);
    ctx.closePath();
    ctx.moveTo(0, -60);
    ctx.lineTo(9, -65);
    ctx.lineTo(9, -55);
    ctx.closePath();
    ctx.fill();
    // the fuzzy head with its big polite eyes
    ctx.beginPath();
    ctx.arc(2, -80, 17, 0, Math.PI * 2);
    fillStroke(ctx, '#c7b2e6');
    for (const ex of [-4, 9]) {
      ctx.beginPath();
      ctx.arc(ex, -82, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(ex + 1, -82, 4.2, 0, Math.PI * 2);
      ctx.fillStyle = '#140f18';
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ex + 2.4, -83.5, 1.3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(3, -74, 4, 0.2, Math.PI - 0.2);
    ctx.stroke();
    ctx.restore();
  }
  // the arm and the tray (drawn by the game, so it moves with the rule's tray)
  ctx.save();
  ctx.strokeStyle = '#4a3a55';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x + dir * 12, b - 44);
  ctx.lineTo(tray.x, tray.y + 4);
  ctx.stroke();
  if (tray.out >= 0) {
    ctx.beginPath();
    ctx.ellipse(tray.x, tray.y + 2, 20, 5, 0, 0, Math.PI * 2);
    fillStroke(ctx, '#d9dde6', 2);
    if (cake) drawCake(ctx, tray.x, tray.y - 9, 20, t, tray.out > 0.9);
  }
  ctx.restore();
}

/** a flying tray, knocked away (spinning off on its arc) */
export function drawFlyingTray(ctx: CanvasRenderingContext2D, x: number, y: number, spin: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(spin);
  ctx.beginPath();
  ctx.ellipse(0, 0, 20, 5, 0, 0, Math.PI * 2);
  fillStroke(ctx, '#d9dde6', 2);
  ctx.restore();
}

// ───────────────────────────── dressing ─────────────────────────────

/** a lace doily (on the table, under a cake, on a web) */
export function drawDoily(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  if (drawW5Art(ctx, 'doily', x, y + r, r * 2)) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * r * 0.86, Math.sin(a) * r * 0.86, r * 0.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.82, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(190, 170, 200, 0.8)';
  ctx.lineWidth = 1;
  for (let k = 1; k < 4; k++) {
    ctx.beginPath();
    ctx.arc(0, 0, (r * 0.8 * k) / 4, 0, Math.PI * 2);
    ctx.stroke();
  }
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * r * 0.8, Math.sin(a) * r * 0.8);
    ctx.stroke();
  }
  ctx.restore();
}

/** a fern clump, bottom middle at (x, b) */
export function drawFern(ctx: CanvasRenderingContext2D, x: number, b: number, w: number, t: number) {
  if (drawW5Art(ctx, 'fern', x, b, w)) return;
  ctx.save();
  ctx.translate(x, b);
  const sway = Math.sin(t * 1.1 + x * 0.01) * 0.05;
  for (let i = 0; i < 7; i++) {
    const a = -1.1 + (i / 6) * 2.2 + sway;
    ctx.save();
    ctx.rotate(a);
    ctx.strokeStyle = '#4f7a32';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(w * 0.08, -w * 0.35, 0, -w * 0.6);
    ctx.stroke();
    ctx.fillStyle = i % 2 ? '#7fa651' : '#6b9a44';
    for (let k = 1; k < 7; k++) {
      const yy = -w * 0.6 * (k / 7);
      ctx.beginPath();
      ctx.ellipse(-6, yy, 7, 3, -0.5, 0, Math.PI * 2);
      ctx.ellipse(6, yy, 7, 3, 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
  ctx.restore();
}

/** a flowering bush of small pink blossoms (the lovely garden), bottom middle at (x, b) */
export function drawBlossom(ctx: CanvasRenderingContext2D, x: number, b: number, w: number, t: number, hue = 0) {
  ctx.save();
  ctx.translate(x, b);
  ctx.fillStyle = '#5f8a3a';
  ctx.beginPath();
  ctx.ellipse(0, -w * 0.22, w * 0.5, w * 0.26, 0, 0, Math.PI * 2);
  ctx.fill();
  const cols = hue % 2 ? ['#f9a8d4', '#fbcfe8', '#f472b6'] : ['#e9d5ff', '#f5d0fe', '#c4b5fd'];
  for (let i = 0; i < 9; i++) {
    const a = i * 2.4;
    const r = w * (0.18 + 0.22 * ((i * 37) % 10) / 10);
    ctx.fillStyle = cols[i % 3];
    ctx.beginPath();
    ctx.arc(Math.cos(a) * r, -w * 0.26 + Math.sin(a) * r * 0.5 + Math.sin(t * 1.5 + i) * 0.6, w * 0.07, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** the golden afternoon (5-1 to 5-3), the dusk and the misty violet twilight: a wash over the whole view, never night */
export function drawW5Light(ctx: CanvasRenderingContext2D, vw: number, vh: number, mood: 'gold' | 'dusk' | 'twilight', t: number) {
  ctx.save();
  const g = ctx.createLinearGradient(0, 0, vw * 0.4, vh);
  if (mood === 'gold') {
    // the low sun from the upper left: a warm glow screened over the view (it lightens and warms, never muddies the lilac)
    const sun = ctx.createRadialGradient(vw * 0.1, -vh * 0.1, 0, vw * 0.1, -vh * 0.1, Math.max(vw, vh) * 1.1);
    sun.addColorStop(0, 'rgba(255, 206, 110, 0.5)');
    sun.addColorStop(0.5, 'rgba(255, 190, 110, 0.2)');
    sun.addColorStop(1, 'rgba(255, 180, 120, 0.06)');
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = sun;
    ctx.fillRect(0, 0, vw, vh);
    ctx.globalCompositeOperation = 'source-over';
    g.addColorStop(0, 'rgba(255, 214, 128, 0.1)');
    g.addColorStop(0.55, 'rgba(255, 190, 120, 0.04)');
    g.addColorStop(1, 'rgba(255, 170, 150, 0.02)');
  } else if (mood === 'dusk') {
    g.addColorStop(0, 'rgba(255, 170, 120, 0.2)');
    g.addColorStop(1, 'rgba(160, 110, 170, 0.14)');
  } else {
    g.addColorStop(0, 'rgba(170, 140, 220, 0.2)');
    g.addColorStop(1, 'rgba(120, 100, 180, 0.18)');
  }
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, vw, vh);
  if (mood === 'gold') {
    // long, soft sunbeams slanting down through the canopy
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 3; i++) {
      const bx = ((i * 0.37 + 0.12 + Math.sin(t * 0.05 + i) * 0.02) % 1) * vw;
      const beam = ctx.createLinearGradient(bx, 0, bx + vh * 0.35, vh);
      beam.addColorStop(0, 'rgba(255, 226, 150, 0.12)');
      beam.addColorStop(1, 'rgba(255, 226, 150, 0)');
      ctx.fillStyle = beam;
      ctx.beginPath();
      ctx.moveTo(bx - 30, 0);
      ctx.lineTo(bx + 40, 0);
      ctx.lineTo(bx + vh * 0.35 + 90, vh);
      ctx.lineTo(bx + vh * 0.35 - 20, vh);
      ctx.closePath();
      ctx.fill();
    }
  }
  ctx.restore();
}
