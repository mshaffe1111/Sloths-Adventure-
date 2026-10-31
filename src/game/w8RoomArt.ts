/**
 * World 8's puzzle pieces from Matt's Gemini W8 sheet (reference/prop-sheets/gemini-batch-2026-10-28/w8a-puzzle.jpg, keyed and cut by
 * tools/art/w6to10/geminicut.py into src/assets/w6to10/gemini/w8a-puzzle.webp/json): the branch-lever stump (the kit's lever), the
 * glow-mushroom pad (the plate) and the bark door in its trunk (the gate), each pair on one canvas and anchor (the middle of the foot) so
 * the two states swap in place. World 8's rooms (gen2/worlds/w8Rooms.ts) draw these over the kit's own (puzzlePlay.ts); until the sheet
 * has loaded, the kit's art stands in.
 */
export interface W8Frame { x: number; y: number; w: number; h: number; ax: number; ay: number }
export const W8_PUZZLE_URL = new URL('../assets/w6to10/gemini/w8a-puzzle.webp', import.meta.url).href;
export const W8_PUZZLE_FRAMES = {
  'lever-up': { x: 0, y: 0, w: 225, h: 226, ax: 56.5, ay: 226 },
  'lever-down': { x: 229, y: 0, w: 225, h: 226, ax: 56.5, ay: 226 },
  'plate-up': { x: 458, y: 0, w: 243, h: 132, ax: 121.5, ay: 132 },
  'plate-down': { x: 705, y: 0, w: 243, h: 132, ax: 121.5, ay: 132 },
  'door-closed': { x: 952, y: 0, w: 244, h: 256, ax: 119.5, ay: 256 },
  'door-open': { x: 1200, y: 0, w: 244, h: 256, ax: 119.5, ay: 256 },
} as const satisfies Record<string, W8Frame>;
export type W8PieceName = keyof typeof W8_PUZZLE_FRAMES;

/** the leaf hammock of Matt's W8 props sheet (src/assets/w6to10/props-made/w8b.webp/json, 'leaf-hammock'): the hammock room's lift */
export const W8_PROPS_URL = new URL('../assets/w6to10/props-made/w8b.webp', import.meta.url).href;
export const W8_HAMMOCK: W8Frame = { x: 453, y: 0, w: 473, h: 274, ax: 235, ay: 274 };

let img: HTMLImageElement | null = null;
let ready = false;
let props: HTMLImageElement | null = null;
let propsReady = false;
/** start loading the sheets (a World 8 room's KitPlay calls it as the stage starts) */
export function loadW8RoomArt(): void {
  if (img || typeof Image === 'undefined') return;
  img = new Image();
  img.onload = () => { ready = true; };
  img.src = W8_PUZZLE_URL;
  props = new Image();
  props.onload = () => { propsReady = true; };
  props.src = W8_PROPS_URL;
}

/** the leaf hammock `w` px wide, the bottom of its sag at (x, bottom); false until the sheet has loaded */
export function drawW8Hammock(ctx: CanvasRenderingContext2D, x: number, bottom: number, w: number): boolean {
  if (!propsReady || !props) return false;
  const f = W8_HAMMOCK;
  const s = w / f.w;
  ctx.drawImage(props, f.x, f.y, f.w, f.h, x - f.ax * s, bottom - f.ay * s, f.w * s, f.h * s);
  return true;
}

/** a piece `h` px tall (its width from the painting) with the middle of its foot at (x, bottom); false until the sheet has loaded */
export function drawW8Piece(ctx: CanvasRenderingContext2D, n: W8PieceName, x: number, bottom: number, h: number, t?: number): boolean {
  if (!ready || !img) return false;
  const f = W8_PUZZLE_FRAMES[n];
  const s = h / f.h;
  ctx.drawImage(img, f.x, f.y, f.w, f.h, x - f.ax * s, bottom - f.ay * s, f.w * s, f.h * s);
  if (n === 'door-closed') drawDoorBar(ctx, x, bottom, h);
  if (n === 'lever-up' && t !== undefined) drawLeverGlint(ctx, x, bottom, h, t);
  return true;
}

/**
 * A shut bark door's lock (a small code touch, the lead's phone checks 2026-10-31: the painted door alone read as a panel on the stump, and a
 * flat strap read as UI): a dark wooden bar across it, shaded on its lower edge and outlined thin like the kit, two off-white silk wraps
 * with their threads showing, a small silk knot in the middle. Gone when the door opens (its painted open frame)
 */
function drawDoorBar(ctx: CanvasRenderingContext2D, x: number, bottom: number, h: number) {
  const w = h * 0.62;
  const y = bottom - h * 0.46;
  const bh = Math.max(8, h * 0.07);
  const x0 = x - w / 2;
  ctx.save();
  ctx.lineJoin = 'round';
  // the bar: dark wood, lighter on its top, shaded under
  const g = ctx.createLinearGradient(0, y - bh / 2, 0, y + bh / 2);
  g.addColorStop(0, '#6a4a33');
  g.addColorStop(0.45, '#4a3222');
  g.addColorStop(1, '#2a1b12');
  ctx.fillStyle = g;
  ctx.strokeStyle = 'rgba(16, 10, 22, 0.9)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(x0 + bh * 0.3, y - bh / 2);
  ctx.lineTo(x0 + w - bh * 0.2, y - bh * 0.42);
  ctx.quadraticCurveTo(x0 + w + bh * 0.2, y, x0 + w - bh * 0.25, y + bh * 0.5);
  ctx.lineTo(x0 + bh * 0.2, y + bh * 0.46);
  ctx.quadraticCurveTo(x0 - bh * 0.25, y, x0 + bh * 0.3, y - bh / 2);
  ctx.fill();
  ctx.stroke();
  // (a grain line)
  ctx.strokeStyle = 'rgba(20, 12, 8, 0.45)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x0 + bh, y - bh * 0.05);
  ctx.lineTo(x0 + w * 0.42, y + bh * 0.04);
  ctx.moveTo(x0 + w * 0.6, y - bh * 0.1);
  ctx.lineTo(x0 + w - bh, y - bh * 0.02);
  ctx.stroke();
  // the silk wraps: off-white bands round the bar, their threads drawn across
  for (const u of [-0.33, 0.33]) {
    const cx = x + u * w;
    const ww = bh * 0.95;
    const hh = bh * 1.35;
    const sg = ctx.createLinearGradient(0, y - hh / 2, 0, y + hh / 2);
    sg.addColorStop(0, '#efe9dc');
    sg.addColorStop(1, '#b9b1a1');
    ctx.fillStyle = sg;
    ctx.strokeStyle = 'rgba(16, 10, 22, 0.8)';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.ellipse(cx, y, ww / 2, hh / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = 'rgba(120, 110, 96, 0.7)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    for (let k = -2; k <= 2; k++) {
      ctx.moveTo(cx - ww * 0.42, y + k * hh * 0.16 - hh * 0.06);
      ctx.lineTo(cx + ww * 0.42, y + k * hh * 0.16 + hh * 0.06);
    }
    ctx.stroke();
  }
  // the silk knot: two small loops and the knot between them
  ctx.fillStyle = '#e6dfd0';
  ctx.strokeStyle = 'rgba(16, 10, 22, 0.85)';
  ctx.lineWidth = 1.3;
  for (const d of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(x + d * bh * 0.55, y - bh * 0.15, bh * 0.5, bh * 0.32, d * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.fillStyle = '#d4ccbb';
  ctx.beginPath();
  ctx.arc(x, y, bh * 0.36, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // (two short tails hanging from the knot)
  ctx.strokeStyle = '#d9d1c2';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(x - bh * 0.1, y + bh * 0.3);
  ctx.quadraticCurveTo(x - bh * 0.3, y + bh * 0.9, x - bh * 0.15, y + bh * 1.25);
  ctx.moveTo(x + bh * 0.1, y + bh * 0.3);
  ctx.quadraticCurveTo(x + bh * 0.35, y + bh * 0.85, x + bh * 0.3, y + bh * 1.15);
  ctx.stroke();
  ctx.restore();
}

/**
 * An unpulled lever's cue (the lead's phone check 2026-10-31: the painted branch-lever read as a stump): a soft firefly-gold pulse on its
 * handle's tip until it is pulled (a small code touch, STAGE-RULES §4)
 */
function drawLeverGlint(ctx: CanvasRenderingContext2D, x: number, bottom: number, h: number, t: number) {
  const f = W8_PUZZLE_FRAMES['lever-up'];
  const s = h / f.h;
  // (the middle of the handle in the painted frame, 150, 58: its tip can sit under the HUD sideways)
  const gx = x + (150 - f.ax) * s;
  const gy = bottom - (f.ay - 58) * s;
  const a = 0.45 + 0.4 * (0.5 + 0.5 * Math.sin(t * 3.2));
  const r = 20;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, r);
  g.addColorStop(0, `rgba(255, 236, 160, ${a})`);
  g.addColorStop(1, 'rgba(255, 220, 120, 0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(gx, gy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
