/**
 * Crocus Rex's lair: the Moonlit Mire. A wide river at night from a mud bank: a pale moon low over the far trees with a glittering
 * road across the water, arching mangroves in blue-black, fog lying on the river, pairs of watching eyes out on the water, bats
 * crossing the moon and cold wisp-lights drifting. Everything is moonlit cyan and indigo, with the warm yellow of one lantern, so it
 * shares no colour with the green Hollow or the orange Drake lair.
 *
 * Same layers as the other lairs (lairArt.ts): back (screen space, opaque), world (props: a sunk rowboat, a sign, a pile of old
 * helmets, reeds) and front (screen space: moss, reeds and fog over everything). The stilt boardwalks, mud bank, wall trunks and
 * ropes are in lairCrocObjects.ts.
 */
import type { LairArena, LairView } from './lairArt.ts';
import { LairPlate, LairStrip } from './lairPlate.ts';

function rand(i: number): number {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

/**
 * The painted Moonlit Mire (Hugging Face img2img from World 2's own river backdrop over the code lair's layout, hf-art-bosses): the calm
 * night river with its moon road, mangroves and one lantern, and its flood twin (the river churning white, a crocodile's eyes in the
 * water) that bleeds in at a third of his strength, when the river floods the arena.
 */
const PLATE = new LairPlate({
  calm: new URL('../assets/lairs/lair-croc-calm.webp', import.meta.url).href,
  rage: new URL('../assets/lairs/lair-croc-rage.webp', import.meta.url).href,
  floorAt: 0.86,
  widthK: 1.25,
  drift: 0.25,
  fill: '#06101c',
});
/** the painted moss above and reeds below, nearer than anything (fg-croc.webp: the top 45% hangs, the rest stands) */
const STRIP = new LairStrip(new URL('../assets/lairs/fg-croc.webp', import.meta.url).href, 0.45);

/** 0 = the quiet river, 1 = the flood. Eased toward the target; snaps on a new fight or a retry. */
let flood = 0;
let lastT = -1;
function easeFlood(time: number, phase: number) {
  const target = phase >= 3 ? 1 : 0;
  const dt = time - lastT;
  if (lastT < 0 || dt < 0 || dt > 1) flood = target;
  else flood += (target - flood) * Math.min(1, dt * 1.2);
  lastT = time;
}

/** 1. the whole backdrop: the painted mire, and cold wisp-lights drifting over it */
export function drawCrocBack(ctx: CanvasRenderingContext2D, v: LairView, a: LairArena, time: number, _bossX: number, phase = 1) {
  easeFlood(time, phase);
  ctx.save();
  PLATE.draw(ctx, v, a, flood);
  // a few cold wisp-lights drifting over the water (a code glow)
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 7; i++) {
    const wx = ((rand(i + 40) * v.vw * 1.4 + time * (8 + rand(i) * 10)) % (v.vw + 80)) - 40;
    const wy = a.floor - v.y - 90 - rand(i + 41) * 160 + Math.sin(time * 0.9 + i) * 10;
    const g = ctx.createRadialGradient(wx, wy, 0, wx, wy, 14);
    g.addColorStop(0, 'rgba(165, 243, 252, 0.55)');
    g.addColorStop(1, 'rgba(165, 243, 252, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(wx - 14, wy - 14, 28, 28);
  }
  ctx.restore();
}

/** 2. props on the bank: a rowboat sunk in the mud, a sign, a heap of helmets and bones, cattails along the fences */
export function drawCrocWorld(ctx: CanvasRenderingContext2D, a: LairArena, view: LairView, time: number) {
  const f = a.floor;
  const x0 = view.x - 60;
  const x1 = view.x + view.vw + 60;
  const cattail = (x: number, h: number, seed: number) => {
    const sw = Math.sin(time * 1.1 + seed) * 3;
    ctx.strokeStyle = '#0d2a1f';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(x, f - 1);
    ctx.quadraticCurveTo(x + sw, f - h * 0.6, x + sw * 1.6, f - h);
    ctx.stroke();
    ctx.fillStyle = '#5b3a1e';
    ctx.beginPath();
    ctx.roundRect(x + sw * 1.6 - 3, f - h - 20, 6, 22, 3);
    ctx.fill();
    ctx.strokeStyle = '#143a2a';
    ctx.lineWidth = 2;
    for (const d of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(x, f - 1);
      ctx.quadraticCurveTo(x + d * 14 + sw, f - h * 0.5, x + d * 22 + sw, f - h * 0.78);
      ctx.stroke();
    }
  };

  ctx.save();
  // the sunk rowboat by the left fence: a tilted hull with a split plank, half in the mud
  const bx = a.left + 150;
  if (bx > x0 - 200 && bx < x1 + 100) {
    ctx.save();
    ctx.translate(bx, f + 2);
    ctx.rotate(-0.1);
    ctx.fillStyle = '#2a1d12';
    ctx.beginPath();
    ctx.moveTo(-70, -34);
    ctx.quadraticCurveTo(-50, 6, 0, 8);
    ctx.quadraticCurveTo(54, 6, 76, -40);
    ctx.lineTo(64, -42);
    ctx.quadraticCurveTo(44, -8, 0, -8);
    ctx.quadraticCurveTo(-44, -8, -58, -36);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#0d0a06';
    ctx.lineWidth = 2.4;
    ctx.stroke();
    ctx.strokeStyle = 'rgba(148, 190, 220, 0.4)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-60, -34);
    ctx.quadraticCurveTo(-40, -4, 0, -6);
    ctx.stroke();
    ctx.strokeStyle = '#0d0a06';
    ctx.lineWidth = 3;
    for (const px of [-30, 0, 30]) {
      ctx.beginPath();
      ctx.moveTo(px, -12);
      ctx.lineTo(px + 2, 4);
      ctx.stroke();
    }
    // a broken oar sticking out
    ctx.strokeStyle = '#3b2a1c';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(30, -10);
    ctx.lineTo(62, -64);
    ctx.stroke();
    ctx.restore();
  }

  // a sign on a leaning post: the croc's own warning
  const sx = a.left + 330;
  if (sx > x0 - 100 && sx < x1 + 100) {
    ctx.save();
    ctx.translate(sx, f);
    ctx.rotate(0.07);
    ctx.fillStyle = '#2a1d12';
    ctx.fillRect(-4, -92, 8, 92);
    ctx.fillStyle = '#5a4128';
    ctx.strokeStyle = '#120c06';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.roundRect(-46, -100, 92, 44, 4);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fde68a';
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('NO', 0, -83);
    ctx.fillText('SWIMMING', 0, -66);
    // a bite out of the corner
    ctx.fillStyle = '#04121c';
    ctx.beginPath();
    ctx.arc(46, -100, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // a heap of old helmets and a rusty bucket on the right: the croc's trophies
  const hx = a.right - 140;
  if (hx > x0 - 200 && hx < x1 + 200) {
    for (let i = 0; i < 5; i++) {
      const px = hx - 70 + i * 34 + (rand(i) - 0.5) * 10;
      const py = f - 2 - (i % 2) * 14;
      ctx.fillStyle = i % 2 ? '#6b7280' : '#7c6a4f';
      ctx.strokeStyle = '#111827';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(px, py - 12, 20, 15, 0, Math.PI, 0);
      ctx.lineTo(px + 22, py);
      ctx.lineTo(px - 22, py);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'rgba(0,0,0,.45)';
      ctx.fillRect(px - 9, py - 14, 18, 3);
    }
    ctx.fillStyle = '#e5e7eb';
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    for (const [bx2, by2] of [[-96, 4], [96, 2]] as const) {
      ctx.beginPath();
      ctx.moveTo(hx + bx2 - 14, f - by2);
      ctx.lineTo(hx + bx2 + 14, f - by2 - 7);
      ctx.stroke();
    }
  }

  // cattails clustered at both fences
  for (let i = 0; i < 6; i++) {
    const cxl = a.left + 20 + i * 18 + (rand(i + 5) - 0.5) * 10;
    const cxr = a.right - 20 - i * 18 + (rand(i + 15) - 0.5) * 10;
    if (cxl > x0 && cxl < x1) cattail(cxl, 70 + rand(i) * 60, i);
    if (cxr > x0 && cxr < x1) cattail(cxr, 70 + rand(i + 20) * 60, i + 9);
  }
  ctx.restore();
}

/** 3. over everything: a cold vignette, moss hanging from the top, a row of reeds along the bottom and fog wisps passing in front */
export function drawCrocFront(ctx: CanvasRenderingContext2D, v: LairView, time: number) {
  ctx.save();
  const vg = ctx.createRadialGradient(v.vw / 2, v.vh * 0.55, Math.min(v.vw, v.vh) * 0.38, v.vw / 2, v.vh * 0.55, Math.max(v.vw, v.vh) * 0.78);
  vg.addColorStop(0, 'rgba(2, 8, 20, 0)');
  vg.addColorStop(1, 'rgba(2, 8, 20, 0.6)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, v.vw, v.vh);

  // the painted moss hanging from the top edge and the reeds along the bottom, nearer than anything
  STRIP.draw(ctx, v, Math.min(230, Math.max(170, v.vh * 0.4)));

  // fog wisps crossing in front, very faint
  ctx.fillStyle = 'rgba(190, 228, 245, 0.05)';
  for (let k = 0; k < 4; k++) {
    const fx = ((time * (12 + k * 4) + k * 340) % (v.vw + 600)) - 300;
    ctx.beginPath();
    ctx.ellipse(fx, v.vh * (0.55 + k * 0.1), 240, 22, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
