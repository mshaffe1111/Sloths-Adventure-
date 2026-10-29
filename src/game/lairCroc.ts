/**
 * Crocus Rex's lair: the Moonlit Mire. A wide river at night from a mud bank: a pale moon low over the far trees with a glittering
 * road across the water, arching mangroves in blue-black, fog lying on the river, pairs of watching eyes out on the water, bats
 * crossing the moon and cold wisp-lights drifting. Everything is moonlit cyan and indigo, with the warm yellow of one lantern, so it
 * shares no colour with the green Hollow or the orange Drake lair.
 *
 * Same layers as the other lairs (lairArt.ts): back (screen space, opaque), world (painted props: a sunk rowboat, a sign, a pile of old
 * helmets, cattails) and front (screen space: moss, reeds and fog over everything). The stilt boardwalks, mud bank, wall trunks and
 * ropes are in lairCrocObjects.ts.
 */
import type { LairArena, LairView } from './lairArt.ts';
import { LairPlate, LairStrip } from './lairPlate.ts';
import { drawFx } from './bossFx.ts';

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
  // the moon, its road on the water and the lantern sit right of middle: upright, they are brought onto the screen
  focusX: 0.7,
  skyTop: true,
});
/** the painted moss above and reeds below, nearer than anything (fg-croc.webp: the top half, Spanish moss off a branch, hangs; the rest
 * stands). The strip is drawn 570/512 of its old height so the reeds keep their size */
const STRIP = new LairStrip(new URL('../assets/lairs/fg-croc.webp', import.meta.url).href, 288 / 570);

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

/**
 * 2. props on the bank, painted (boss-fx.webp, round 4 of hf-art-bosses): a rowboat sunk in the mud by the left fence, the croc's own
 * warning sign (the water sign's wave crossed out, a bite out of its corner), a heap of old helmets with a bucket and bones on the right,
 * and a clump of cattails at each fence that sways a little. Nothing is drawn while the sheet loads.
 */
export function drawCrocWorld(ctx: CanvasRenderingContext2D, a: LairArena, view: LairView, time: number) {
  const f = a.floor;
  const x0 = view.x - 200;
  const x1 = view.x + view.vw + 200;
  const at = (x: number) => x > x0 && x < x1;
  if (at(a.left + 150)) drawFx(ctx, 'rowboat', a.left + 150, f + 8, 190, { ax: 0.5, ay: 1 });
  if (at(a.left + 330)) drawFx(ctx, 'signNo', a.left + 330, f + 2, 96, { ax: 0.5, ay: 1, rot: 0.05 });
  if (at(a.right - 140)) drawFx(ctx, 'helmets', a.right - 140, f + 6, 210, { ax: 0.5, ay: 1 });
  // the cattails lean with the breeze from their roots
  for (const [cx, k, w] of [[a.left + 34, 0, 120], [a.right - 40, 1, 132]] as const) {
    if (!at(cx)) continue;
    drawFx(ctx, `cattail${k}`, cx, f + 4, w, { ax: 0.5, ay: 1, rot: Math.sin(time * 1.1 + k * 2) * 0.03, flipX: k === 1 });
  }
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
  STRIP.draw(ctx, v, (Math.min(230, Math.max(170, v.vh * 0.4)) * 570) / 512);

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
