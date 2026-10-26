/**
 * w5Look — how World 5's pieces look: clean drawn stand-ins until the painted World 5 art lands, each behind one simple name so the art
 * swaps in without touching the rules (w5Kit.ts) or the run (w5Play.ts).
 *
 * The painted props (w5-props.webp, 72 pieces: w5PropsData.ts, drawn by w5Art.ts) are wired in by name: PAINTED below says which painted
 * piece stands for each look, with both takes where the sheet has two (picked by where the piece stands, so neighbours differ). Every
 * draw asks for the painted piece first and draws its stand-in only while the sheet is still loading (stagePreload.ts decodes it before a
 * World 5 stage starts, so that is a moment at most). `useW5Atlas(img, frames)` still hands in another sheet by these names (the
 * creatures' clips when they land: the Butler is a stand-in until then); a frame there wins over the props sheet. The words of Meeca's
 * carvings (the scratch alphabet, w5Art.ts drawScratch) and the table's card are always drawn by the game, so they stay crisp.
 *
 * Sizes follow the concept art (scratchpad w5art): a chair a little taller than Pokey, the table about as tall as him, a cake the size of a
 * petal, the Butler a head taller than him. Colours from the sheets: rose and lilac velvet, cream silk, china white with gold rims.
 */
import { shakyLetters, type Carving } from './w5Kit.ts';
import { drawScratch, drawW5, drawW5Box, drawW5Orchid, steamPuff, w5ArtReady, w5Height, w5Width, type W5Piece as ArtPiece } from './w5Art.ts';

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

/**
 * Which painted pieces (w5-props) stand for each look: one take, or two (or more) to vary by placement. The orchids go through
 * w5Art.ts drawW5Orchid (open, half and shut, two takes), the trunks behind the carvings are picked by their height (carvingTrunk).
 */
export const PAINTED: Partial<Record<W5Piece, readonly ArtPiece[]>> = {
  table: ['teaTable'],
  chair: ['armchairRose', 'armchairRose2'],
  chairLilac: ['armchairLilac', 'armchairLilac2'],
  wrappedChair: ['wrappedArmchair', 'wrappedChair', 'wrappedArmchair2', 'wrappedChair2'],
  wrappedStool: ['wrappedStool'],
  cake: ['cakeIcon', 'cakeIcon2'],
  cakePlate: ['cakePlate', 'cakePlate2'],
  teapot: ['teapot', 'teapot2'],
  cup: ['teacup', 'teacup2'],
  carvedTrunk: ['trunkTall', 'trunkShort'],
  orchidOpen: ['orchidOpen', 'orchidOpen2'],
  orchidHalf: ['orchidHalf', 'orchidHalf2'],
  orchidClosed: ['orchidClosed'],
  silkThread: ['silkThread'],
  silkBridge: ['silkBridge'],
  silkSheet: ['silkSheet'],
  cocoon: ['cocoonHanging'],
  cocoonOpen: ['cocoonHangingTorn'],
  doily: ['doily'],
  pinkBell: ['bell', 'bell2'],
  fern: ['fern'],
  shrine: ['totem', 'totem2'],
  flag: ['flag', 'flag2'],
};

/** which take a piece standing at x wears (the same spot always the same take; neighbours usually differ) */
export function takeAt(x: number, n: number): number {
  if (n <= 1) return 0;
  return ((Math.imul(Math.round(x / 8) + 7919, 2654435761) >>> 0) >>> 13) % n;
}

/** the painted piece for look `n` at placement x (null when the look has none) */
export function paintedFor(n: W5Piece, x: number): ArtPiece | null {
  const list = PAINTED[n];
  return list && list.length ? list[takeAt(x, list.length)] : null;
}

/**
 * Draw look `n` painted, bottom middle at (x, b): `w` wide, or `h` tall when given (the takes differ in shape, so a height keeps two
 * chairs side by side the same size). A frame handed in through useW5Atlas wins; else the props sheet. False until it has loaded.
 */
function paint(ctx: CanvasRenderingContext2D, n: W5Piece, x: number, b: number, size: { w?: number; h?: number }, o: { flip?: boolean; rot?: number; alpha?: number; at?: number } = {}): boolean {
  const own = atlas?.frames[n];
  if (own) return drawW5Art(ctx, n, x, b, size.w ?? ((size.h ?? 0) * own.w) / own.h, o);
  const p = paintedFor(n, o.at ?? x);
  if (!p || !w5ArtReady()) return false;
  const w = size.w ?? w5Width(p, size.h ?? 0);
  return drawW5(ctx, p, x, b, w, o);
}

/** the painted piece's height when drawn `w` wide (for laying the game's own pieces over it) */
const paintedH = (p: ArtPiece, w: number) => w5Height(p, w);

/**
 * A painted teapot `w` wide, bottom middle at (x, b), its spout toward `dir`: the first take pours to its left, the second to its right,
 * so each is turned to pour the way asked (its spout tip is then about 0.47 w out and 0.72 of its height up, as spoutOf has it).
 */
function paintPot(ctx: CanvasRenderingContext2D, x: number, b: number, w: number, dir: 1 | -1, rot = 0): boolean {
  if (atlas?.frames.teapot || !w5ArtReady()) return false;
  const p = paintedFor('teapot', x) ?? 'teapot';
  const leftSpout = p === 'teapot';
  return drawW5(ctx, p, x, b, w, { flip: leftSpout ? dir > 0 : dir < 0, rot });
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
  // (the painted chairs face front-left: turned toward the path they lean in)
  if (paint(ctx, color === 'lilac' ? 'chairLilac' : 'chair', x, b, { h: w * 1.12 }, { flip: face > 0, rot: tug * 0.04 * Math.sin(t * 5) })) return;
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
  if (paint(ctx, stool ? 'wrappedStool' : 'wrappedChair', x, b, { h: w * (stool ? 0.92 : 1.18) }, { flip })) return;
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
  const TW = 136;
  if (paint(ctx, 'table', x, b, { w: TW })) {
    // the painted table already has its two cups and the card; the pot stands at the back of the cloth between the cups, warm
    const top = b - paintedH('teaTable', TW) * 0.84;
    if (paintPot(ctx, x + 6, top, 46, -1)) steamPuff(ctx, x + 6 - 46 * 0.47, top - 46 * 0.5, 0.3 + 0.12 * Math.sin(t * 2), t, 0.4);
    return;
  }
  {
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
  if (paint(ctx, 'cup', x, b, { w: 26 }, { flip })) return;
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
  // (the painted cake is a little taller than wide: its middle on the pickup's middle)
  const ch = size * 1.2;
  if (paint(ctx, 'cake', x, y + ch / 2, { h: ch })) {
    if (glint) sparkle(ctx, x, y, size, t);
    return;
  }
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
  if (glint) sparkle(ctx, x, y, size, t);
}

/** the little star that winks on a cake now and then, as on a treat worth taking */
function sparkle(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, t: number) {
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

export function drawCakePlate(ctx: CanvasRenderingContext2D, x: number, b: number, w: number) {
  if (paint(ctx, 'cakePlate', x, b, { w })) return;
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
  // the painted pot (its spout tip where the steam comes from: spoutOf), hopping and tipping while it rattles, the rattle drawn round its lid
  const pw = w * 1.14;
  const hop = rattle > 0 ? Math.abs(Math.sin(t * 22)) * 3 * rattle : 0;
  if (paintPot(ctx, x + shake, b - hop, pw, dir, rattle > 0 ? Math.sin(t * 31) * 0.05 * rattle : 0)) {
    if (rattle > 0) {
      const lidY = b - hop - w5Height('teapot', pw) * 0.98;
      ctx.save();
      ctx.strokeStyle = `rgba(90, 60, 70, ${0.5 + 0.4 * rattle})`;
      ctx.lineWidth = 2.4;
      ctx.lineCap = 'round';
      for (const s of [-1, 1]) {
        for (let k = 0; k < 2; k++) {
          const r = 10 + k * 7 + Math.abs(Math.sin(t * 22)) * 3;
          ctx.beginPath();
          ctx.arc(x + shake, lidY, r, s > 0 ? -0.9 : Math.PI + 0.3, s > 0 ? -0.3 : Math.PI + 0.9);
          ctx.stroke();
        }
      }
      ctx.restore();
    }
    return;
  }
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
  if (w5ArtReady()) {
    // beside the painted pot, the painted world's steam (w5Art.ts steamPuff): puffs rising `h` high, squeezed to the column's width
    // (TEAPOT.half each side on a full puff), stronger so a puff reads on the gold light
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(Math.min(1, 0.36 + 0.18 * spread), 1);
    steamPuff(ctx, 0, 0, Math.min(1, a * (spread > 1 ? 1.9 : 1.2)), t, h / 70, spread > 1 ? 1 : 0.35);
    ctx.restore();
    return;
  }
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

/** the painted trunk behind a carving: the tall one for a tree, the shorter one for a low trunk; how wide and tall it is drawn */
export function carvingTrunk(c: Carving): { piece: ArtPiece; w: number; h: number; flip: boolean } | null {
  if (!c.trunk) return null;
  const tall = c.trunk.h >= 440;
  const piece: ArtPiece = tall ? 'trunkTall' : 'trunkShort';
  // (the bark must be wide enough for the longest line: a scratched letter is about 0.82 of its height across)
  const size = c.size ?? 34;
  const need = Math.max(...c.lines.map((l) => carvedWidth(l, size)), 1) / 0.6;
  const h = Math.max(tall ? c.trunk.h * 1.1 : c.trunk.h, w5Height(piece, need));
  return { piece, w: w5Width(piece, h), h, flip: takeAt(c.x, 2) === 1 };
}

/** how far each scratched character reaches along the line, as a share of the letter height */
const carvedAdv = (ch: string) => (ch === ' ' ? 0.5 : ch === '.' || ch === ',' ? 0.42 : ch === "'" ? 0.34 : ch === '!' ? 0.46 : 0.82);
/** a line of scratched letters' width at letter height `size` */
export function carvedWidth(line: string, size: number): number {
  return [...line].reduce((a, ch) => a + carvedAdv(ch) * size, 0);
}

/** the box (world units) the words of a carving cover, a little grown: Dot's bubble keeps off it (w5Play keepOuts) */
export function carvingBox(c: Carving, m = 14): { x0: number; y0: number; x1: number; y1: number } {
  const size = c.size ?? 34;
  const w = Math.max(...c.lines.map((l) => carvedWidth(l, size)), 1);
  const lead = size * 1.22;
  return { x0: c.x - w / 2 - m, y0: c.y - size * 0.6 - m, x1: c.x + w / 2 + m, y1: c.y + (c.lines.length - 1) * lead + size * 0.75 + m };
}

/**
 * A trunk with words carved in it (Meeca's hairpin, cut on the move as they marched her past): the painted trunk, then the words in the
 * scratch alphabet (w5Art.ts drawScratch), each letter cut on its own: a dark groove, the pale wood inside it, every letter a little
 * off its line, tilted, bigger or smaller, the lines running downhill, and here and there a stroke gone over twice where the pin
 * slipped. The same words always shake the same way (shakyLetters is seeded), so nothing shimmers. Crisp at any size, no font.
 */
export function drawCarving(ctx: CanvasRenderingContext2D, c: Carving, seed: number) {
  const size = c.size ?? 34;
  const tr = carvingTrunk(c);
  if (c.trunk && !(tr && w5ArtReady() && drawW5(ctx, tr.piece, c.x, c.trunk.ground, tr.w, { flip: tr.flip }))) {
    const { ground, w, h } = c.trunk;
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
  const lead = size * 1.22;
  c.lines.forEach((line, li) => {
    const letters = shakyLetters(line, seed + li * 7);
    const total = carvedWidth(line, size);
    ctx.save();
    // each line off true, and running a little downhill (cut while walking), a little left or right of the last
    ctx.translate(c.x + Math.sin(li * 2.3 + seed) * size * 0.14, c.y + li * lead);
    ctx.rotate(0.035 + Math.sin(li * 1.7 + seed * 0.3) * 0.04);
    let lx = -total / 2;
    letters.forEach((l, i) => {
      const adv = carvedAdv(l.ch) * size;
      if (l.ch !== ' ') {
        const k = size * l.k;
        // (the scratch alphabet centres a narrow mark off its box: a dot sits 1.4 grid units right of where it is asked for)
        const off = carvedAdv(l.ch) < 0.5 ? -(1.4 * k) / 6 : 0;
        const cx = lx + adv / 2 + l.dx + off;
        const cy = l.dy * 0.8 + (i % 2 ? 1 : -1) * size * 0.03;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(l.rot * 1.3);
        // the groove, then the pale wood inside it, then (now and then) the pin's slip: the same strokes gone over again, off a little
        drawScratch(ctx, l.ch, k * 0.05, k * 0.07, k, 0.1, 'rgba(38, 20, 10, 0.85)', 1.5);
        drawScratch(ctx, l.ch, 0, 0, k, 0.09, '#f7e6c2', 1.25);
        if ((i * 7 + li * 3 + seed) % 5 === 1) drawScratch(ctx, l.ch, k * 0.07, -k * 0.04, k * 1.02, 0.16, 'rgba(247, 230, 194, 0.55)', 0.7);
        ctx.restore();
      }
      lx += adv;
    });
    ctx.restore();
  });
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
  // the painted bloom (open, half, shut; two takes by where it grows): its top petals are the ledge he stands on
  if (!atlas?.frames[n] && w5ArtReady() && drawW5Orchid(ctx, x + jig, y + w5Height(takeAt(x, 2) ? 'orchidOpen2' : 'orchidOpen', w) * 0.9, w, open, takeAt(x, 2) ? 2 : 1)) return;
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
  // the painted dewy thread (its strand runs a quarter of the way down its picture, the dew hanging under it), shaking as it hums
  const bh = 18;
  const painted = !atlas?.frames.silkThread && w5ArtReady() && drawW5Box(ctx, 'silkThread', x0 - 4, y - bh * 0.22 + 2 + amp * 0.6 * Math.sin(t * 50), x1 - x0 + 8, bh, takeAt(x0, 2) === 1);
  if (!painted) {
    ctx.strokeStyle = 'rgba(80, 60, 90, 0.55)';
    ctx.lineWidth = 3.6;
    line();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.2;
    line();
  }
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
  // dew drops that tremble (the painted thread has its own)
  for (let i = 1; i < 4 && !painted; i++) {
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
  const w = x1 - x0;
  if (w5ArtReady()) {
    // the painted sheets hung side by side across it (each kept near its own shape), and slow light moving over them; brighter as he lingers
    const hh = bottom - top;
    const n = Math.max(1, Math.round(w / w5Width('silkSheet', hh)));
    const sw = w / n;
    for (let i = 0; i < n; i++) drawW5Box(ctx, 'silkSheet', x0 + i * sw - 4, top, sw + 8, hh, (i + takeAt(x0, 2)) % 2 === 1);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const s = (t * 0.25) % 1;
    const lx = x0 - 60 + (w + 120) * s;
    const g = ctx.createLinearGradient(lx - 50, 0, lx + 50, 0);
    g.addColorStop(0, 'rgba(255, 236, 200, 0)');
    g.addColorStop(0.5, `rgba(255, 236, 200, ${0.16 + 0.14 * near})`);
    g.addColorStop(1, 'rgba(255, 236, 200, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(Math.max(x0, lx - 50), top + hh * 0.08, Math.min(x1, lx + 50) - Math.max(x0, lx - 50), hh * 0.8);
    ctx.restore();
    return;
  }
  ctx.save();
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
  // the painted cocoon on its thread (torn open once he is free), the cracks of each punch scored over it
  if (paint(ctx, open ? 'cocoonOpen' : 'cocoon', x + jig, b, { h: 153 })) {
    if (!open && cracks > 0) {
      ctx.save();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      for (let k = 0; k < cracks; k++) {
        const cx = x + jig - 8 + k * 7, cy = b - 22 - k * 13;
        ctx.beginPath();
        ctx.moveTo(cx - 4, cy + 5);
        ctx.lineTo(cx + 2, cy - 2);
        ctx.lineTo(cx - 2, cy - 8);
        ctx.lineTo(cx + 4, cy - 13);
        ctx.stroke();
      }
      ctx.restore();
    }
    return;
  }
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
  if (paint(ctx, 'doily', x, y + r, { w: r * 2 })) return;
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
  if (paint(ctx, 'fern', x, b, { w }, { flip: takeAt(x, 2) === 1, rot: Math.sin(t * 1.1 + x * 0.01) * 0.025 })) return;
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
  // painted: the little orchids growing by the path (the sprout in its soil, the small one), swaying a touch
  if (w5ArtReady() && drawW5(ctx, hue % 2 ? 'orchidSprout2' : 'orchidSprout', x, b + 2, w * (hue % 2 ? 0.62 : 0.7), { flip: takeAt(x, 2) === 1, rot: Math.sin(t * 1.3 + x * 0.02) * 0.03 })) return;
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

/** any painted World 5 piece by its sheet name (w5PropsData.ts), bottom middle at (x, b), `w` wide: a stage's own dressing. False until loaded. */
export function drawPiece(ctx: CanvasRenderingContext2D, n: ArtPiece, x: number, b: number, w: number, flip = false): boolean {
  return w5ArtReady() && drawW5(ctx, n, x, b, w, { flip });
}

/** a silk bridge strung from x0 to x1, its walk at y (the painted rope-and-silk bridge; two thin cords as a stand-in) */
export function drawSilkBridge(ctx: CanvasRenderingContext2D, x0: number, x1: number, y: number) {
  // (the bridge's planks run about two thirds of the way down its picture)
  const h = Math.max(30, (x1 - x0) * (122 / 412));
  if (!atlas?.frames.silkBridge && w5ArtReady() && drawW5Box(ctx, 'silkBridge', x0 - 10, y - h * 0.62, x1 - x0 + 20, h)) return;
  ctx.save();
  ctx.strokeStyle = '#fbf6ff';
  ctx.lineWidth = 3;
  for (const dy of [0, -22]) {
    ctx.beginPath();
    ctx.moveTo(x0, y + dy);
    ctx.quadraticCurveTo((x0 + x1) / 2, y + dy + 10, x1, y + dy);
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * The pink bell (Pell's note, "in plain sight, look for a pink bell"): a stem rising from the ground at (x, ground) and bowing over, the
 * painted bell hanging from its tip and swaying, a soft pink glow round it so it reads as something to touch. False until loaded.
 */
export function drawPinkBell(ctx: CanvasRenderingContext2D, x: number, ground: number, t: number, id = 0): boolean {
  if (atlas?.frames.pinkBell || !w5ArtReady()) return false;
  const piece = paintedFor('pinkBell', x) ?? 'bell';
  const tipX = x + 8, tipY = ground - 60;
  ctx.save();
  // the glow
  const g = ctx.createRadialGradient(tipX, tipY + 26, 4, tipX, tipY + 26, 46);
  const br = 0.5 + 0.5 * Math.sin(t * 2.4 + id);
  g.addColorStop(0, `rgba(255, 214, 232, ${0.42 + 0.18 * br})`);
  g.addColorStop(1, 'rgba(255, 214, 232, 0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(tipX, tipY + 26, 46, 0, Math.PI * 2);
  ctx.fill();
  // the stem and a leaf
  ctx.lineCap = 'round';
  const stem = () => {
    ctx.beginPath();
    ctx.moveTo(x - 12, ground);
    ctx.bezierCurveTo(x - 18, ground - 50, x - 6, tipY - 22, tipX, tipY);
    ctx.stroke();
  };
  ctx.strokeStyle = '#2f5a24';
  ctx.lineWidth = 6;
  stem();
  ctx.strokeStyle = '#5e9a42';
  ctx.lineWidth = 3.5;
  stem();
  ctx.fillStyle = '#5e9a42';
  ctx.strokeStyle = '#2f5a24';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(x - 14, ground - 20);
  ctx.bezierCurveTo(x - 34, ground - 30, x - 44, ground - 22, x - 48, ground - 30);
  ctx.bezierCurveTo(x - 36, ground - 40, x - 24, ground - 36, x - 14, ground - 26);
  ctx.fill();
  ctx.stroke();
  // the bell, hanging from the tip and swaying about it
  ctx.translate(tipX, tipY);
  ctx.rotate(Math.sin(t * 2 + id) * 0.12);
  const w = 46;
  drawW5(ctx, piece, 0, w5Height(piece, w) - 2, w);
  ctx.restore();
  return true;
}

/**
 * The exit shrine, painted: the orchid-crowned carved totem with its little door (two takes), lit inside, a lantern either side, and the
 * prompt over his head. Bottom middle at (x, ground). A sealed exit keeps the plain shrine (its lock and the count of what is missing are
 * what Dot explains): false then, and until the sheet has loaded.
 */
export function drawShrineArt(ctx: CanvasRenderingContext2D, x: number, ground: number, t: number, locked: boolean): boolean {
  if (locked || atlas?.frames.shrine || !w5ArtReady()) return false;
  const piece = paintedFor('shrine', x) ?? 'totem';
  const h = 262;
  const w = w5Width(piece, h);
  // the lanterns first (behind it), their flames breathing
  for (const s of [-1, 1] as const) {
    const lp: ArtPiece = s < 0 ? 'lantern' : 'lantern2';
    const lx = x + s * (w * 0.5 + 34);
    const lh = 78;
    drawW5(ctx, lp, lx, ground + 2, w5Width(lp, lh));
    const fl = 0.75 + 0.25 * Math.sin(t * 7 + s * 2) * Math.sin(t * 3.1 + s);
    const lg = ctx.createRadialGradient(lx, ground - lh * 0.52, 2, lx, ground - lh * 0.52, 34);
    lg.addColorStop(0, `rgba(255, 220, 140, ${0.5 * fl})`);
    lg.addColorStop(1, 'rgba(255, 220, 140, 0)');
    ctx.fillStyle = lg;
    ctx.beginPath();
    ctx.arc(lx, ground - lh * 0.52, 34, 0, Math.PI * 2);
    ctx.fill();
  }
  drawW5(ctx, piece, x, ground + 4, w);
  // warm light in the little door (it is open: this is the way on)
  const dx = x + (piece === 'totem' ? 0.04 : -0.05) * w;
  const dy = ground - h * 0.16;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const dg = ctx.createRadialGradient(dx, dy, 2, dx, dy, h * 0.2);
  const br = 0.8 + 0.2 * Math.sin(t * 2.2);
  dg.addColorStop(0, `rgba(255, 226, 150, ${0.55 * br})`);
  dg.addColorStop(0.6, `rgba(255, 200, 120, ${0.18 * br})`);
  dg.addColorStop(1, 'rgba(255, 200, 120, 0)');
  ctx.fillStyle = dg;
  ctx.beginPath();
  ctx.arc(dx, dy, h * 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // the prompt, a little over his head (as the plain shrine has it)
  const y = ground - 118 + Math.sin(t * 5) * 4;
  ctx.save();
  ctx.font = 'bold 15px Fredoka, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 4;
  ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(6, 30, 22, 0.85)';
  ctx.strokeText('Touch the door!', dx, y);
  ctx.fillStyle = '#fde047';
  ctx.fillText('Touch the door!', dx, y);
  ctx.beginPath();
  ctx.moveTo(dx - 6, y + 12);
  ctx.lineTo(dx + 6, y + 12);
  ctx.lineTo(dx, y + 19);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  return true;
}

/**
 * A checkpoint, painted: the lace pennant on its pole (two takes, by where it stands), its pole's foot at (x, ground), stirring in the air;
 * reached, it glows gold. False until loaded.
 */
export function drawPennant(ctx: CanvasRenderingContext2D, x: number, ground: number, reached: boolean, t: number): boolean {
  if (atlas?.frames.flag || !w5ArtReady()) return false;
  const piece = paintedFor('flag', x) ?? 'flag';
  // (where the pole stands across each picture)
  const pole = piece === 'flag' ? 0.12 : 0.36;
  const h = 108;
  const w = w5Width(piece, h);
  if (reached) {
    const g = ctx.createRadialGradient(x + 14, ground - 66, 4, x + 14, ground - 66, 66);
    g.addColorStop(0, 'rgba(253, 224, 71, 0.5)');
    g.addColorStop(1, 'rgba(253, 224, 71, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x + 14, ground - 66, 66, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.save();
  ctx.translate(x, ground + 3);
  // (a stir in the air: the pennant leans a hair about its foot)
  ctx.rotate(Math.sin(t * 2.4 + x * 0.01) * 0.018);
  drawW5(ctx, piece, (0.5 - pole) * w, 0, w);
  ctx.restore();
  return true;
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
