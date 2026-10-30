/**
 * envPlants — the plants, props and hanging things that make each world look like the place it is.
 *
 * Every entry answers "what would grow or lie here because of this place, and who lives here?":
 *   W6 peat swamp: pitcher plants, peg and knee roots poking out of black water, mud bubbles.
 *   W2 estuary (the crocodile): reeds, nipa palms, water hyacinth, mangrove seedlings, driftwood, a nest mound.
 *   W3 dark understory and cave (the panther): bird's-nest ferns, bracket fungi, claw-scarred rock, bones, glowworm threads.
 *   W5 understory (the spider queen): heliconia, orchids, bromeliads, golden orb webs, silk cocoons.
 *   W7 overgrown temple: a half-buried idol face, fallen carved blocks, fig roots, aerial roots.
 *   W9 volcanic regrowth: ohia with red lehua flowers, steam vents, uluhe ferns in the cracks, lichen, obsidian.
 *   W10 the mountain above the trees (the story: "after that the rain had nothing to hit but rock"): wet slate rocks, wind-bent wire grass,
 *      fallen iron thorns from the General's netting, rain puddles, chains on the way up. (The old war-camp props stay for the lair.)
 *   W1 lowland rainforest (the snake): shed skin, hollow logs, heliconia.
 */
import { tone, mix, lighten, darken, rgba, type RNG, type Tone } from './artKit.ts';
import { fernFrond } from './flora.ts';
import { leaf, bromeliad } from './rainforest.ts';
import type { Look } from './scenery.ts';

const TAU = Math.PI * 2;

export type PlantFn = (ctx: CanvasRenderingContext2D, x: number, y: number, s: number, look: Look, r: RNG) => void;
export interface PlantDef {
  draw: PlantFn;
  /** scale applied to the near-layer size */
  near: number;
  /** [min, max] size when used as ground-edge decoration */
  decor: [number, number];
}
export type SwayFn = (c: CanvasRenderingContext2D, look: Look, variant: number, r: RNG) => void;

const lt = (look: Look, r: RNG, i?: number): Tone => tone(mix(look.leaves[i ?? ((r() * look.leaves.length) | 0)], look.haze, 0.1));
const bead = (ctx: CanvasRenderingContext2D, x: number, y: number, rr: number) => {
  ctx.fillStyle = 'rgba(225,248,255,0.85)';
  ctx.beginPath();
  ctx.ellipse(x, y, rr, rr * 1.4, 0, 0, TAU);
  ctx.fill();
};
const glowDot = (ctx: CanvasRenderingContext2D, x: number, y: number, rad: number, col: string, a: number) => {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
  g.addColorStop(0, rgba(col, a));
  g.addColorStop(1, rgba(col, 0));
  ctx.fillStyle = g;
  ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  ctx.restore();
};

// ───────────────────────────── generic ─────────────────────────────

const fernclump: PlantFn = (ctx, x, y, s, look, r) => {
  const t = lt(look, r);
  for (let f = 0; f < 6; f++) fernFrond(ctx, x, y, s * (0.8 + r() * 0.3), -Math.PI / 2 + (f - 2.5) * 0.5, t, r, 0.5);
};

const mudbubble: PlantFn = (ctx, x, y, s, _look, r) => {
  ctx.fillStyle = 'rgba(30,22,16,0.85)';
  ctx.beginPath();
  ctx.ellipse(x, y - 1, s * 1.3, s * 0.3, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(120,150,150,0.5)';
  ctx.lineWidth = 1;
  ctx.stroke();
  for (let k = 0; k < 3; k++) {
    const bx = x + (r() - 0.5) * s * 1.6;
    const br = 2.5 + r() * 3;
    ctx.fillStyle = 'rgba(170,200,190,0.45)';
    ctx.strokeStyle = 'rgba(220,240,230,0.8)';
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.arc(bx, y - 3 - br * 0.5, br, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.beginPath();
    ctx.arc(bx - br * 0.3, y - 3 - br * 0.9, br * 0.28, 0, TAU);
    ctx.fill();
  }
};

// ───────────────────────────── W6: peat swamp ─────────────────────────────

function pitcherShape(ctx: CanvasRenderingContext2D, x: number, topY: number, w: number, r: RNG) {
  ctx.beginPath();
  ctx.moveTo(x - w * 0.6, topY);
  ctx.bezierCurveTo(x - w * 0.4, topY + w * 0.8, x - w * 1.0, topY + w * 1.2, x - w * 0.8, topY + w * 2.0);
  ctx.quadraticCurveTo(x, topY + w * 2.8, x + w * 0.8, topY + w * 2.0);
  ctx.bezierCurveTo(x + w * 1.0, topY + w * 1.2, x + w * 0.4, topY + w * 0.8, x + w * 0.6, topY);
  ctx.closePath();
  const g = ctx.createLinearGradient(x - w, 0, x + w, 0);
  g.addColorStop(0, '#8ac060');
  g.addColorStop(0.5, '#5a9a40');
  g.addColorStop(1, '#2f6a2f');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = 'rgba(20,40,20,0.8)';
  ctx.lineWidth = 1.3;
  ctx.stroke();
  ctx.fillStyle = 'rgba(150,40,40,0.55)';
  for (let k = 0; k < 6; k++) {
    ctx.beginPath();
    ctx.ellipse(x + (r() - 0.5) * w * 1.1, topY + w * (0.6 + r() * 1.7), w * 0.12, w * 0.09, 0, 0, TAU);
    ctx.fill();
  }
  // the lid, the ribbed red rim and the dark mouth
  ctx.fillStyle = '#4a8a3a';
  ctx.strokeStyle = 'rgba(20,40,20,0.8)';
  ctx.beginPath();
  ctx.ellipse(x + w * 0.35, topY - w * 0.55, w * 0.7, w * 0.32, -0.45, 0, TAU);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#b8332a';
  ctx.beginPath();
  ctx.ellipse(x, topY, w * 0.72, w * 0.24, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#10180e';
  ctx.beginPath();
  ctx.ellipse(x, topY + 1, w * 0.5, w * 0.14, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,230,200,0.7)';
  ctx.lineWidth = 1;
  for (let k = 0; k < 7; k++) {
    const a = (k / 7) * TAU;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a) * w * 0.5, topY + Math.sin(a) * w * 0.15);
    ctx.lineTo(x + Math.cos(a) * w * 0.72, topY + Math.sin(a) * w * 0.24);
    ctx.stroke();
  }
}

const pitcher: PlantFn = (ctx, x, y, s, look, r) => {
  const t = lt(look, r, 1);
  for (let k = 0; k < 4; k++) leaf(ctx, x, y, s * 0.55, s * 0.13, -Math.PI / 2 + (k - 1.5) * 0.75, t, 0.1);
  const n = 2 + ((r() * 2) | 0);
  for (let i = 0; i < n; i++) {
    const px = x + (i - (n - 1) / 2) * s * 0.42;
    const h = s * (0.45 + r() * 0.35);
    ctx.strokeStyle = '#3a5a2a';
    ctx.lineWidth = 1.8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(px, y);
    ctx.quadraticCurveTo(px + (r() - 0.5) * 12, y - h * 0.6, px, y - h);
    ctx.stroke();
    pitcherShape(ctx, px, y - h, s * 0.16, r);
  }
};

const pegs: PlantFn = (ctx, x, y, s, look, r) => {
  const bark = tone(mix('#6a5846', look.trunk[0], 0.3), '#120c08');
  const n = 5 + ((r() * 4) | 0);
  for (let i = 0; i < n; i++) {
    const px = x + (i - (n - 1) / 2) * s * 0.17 + (r() - 0.5) * 5;
    const h = s * (0.3 + r() * 0.7);
    const w = s * (0.05 + r() * 0.03);
    const lean = (r() - 0.5) * 5;
    const g = ctx.createLinearGradient(px - w, 0, px + w, 0);
    g.addColorStop(0, bark.light);
    g.addColorStop(1, bark.dark);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(px - w * 1.2, y + 2);
    ctx.lineTo(px - w * 0.6 + lean, y - h * 0.8);
    ctx.quadraticCurveTo(px + lean, y - h - w * 0.8, px + w * 0.6 + lean, y - h * 0.8);
    ctx.lineTo(px + w * 1.2, y + 2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = rgba(bark.deep, 0.8);
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.fillStyle = rgba('#7aa060', 0.6);
    ctx.beginPath();
    ctx.ellipse(px + lean * 0.3, y - h * 0.35, w * 0.8, 2, 0, 0, TAU);
    ctx.fill();
  }
};

const kneeroot: PlantFn = (ctx, x, y, s, look, r) => {
  const bark = tone(mix('#6a5846', look.trunk[0], 0.3), '#120c08');
  for (let k = 0; k < 2 + ((r() * 2) | 0); k++) {
    const cx = x + (k - 0.5) * s * 0.5 + (r() - 0.5) * 8;
    const w = s * (0.3 + r() * 0.15);
    const h = s * (0.35 + r() * 0.3);
    ctx.lineCap = 'round';
    ctx.strokeStyle = bark.deep;
    ctx.lineWidth = s * 0.2 + 3;
    ctx.beginPath();
    ctx.moveTo(cx - w, y + 2);
    ctx.bezierCurveTo(cx - w, y - h * 1.5, cx + w, y - h * 1.5, cx + w, y + 2);
    ctx.stroke();
    ctx.strokeStyle = bark.mid;
    ctx.lineWidth = s * 0.2;
    ctx.stroke();
    ctx.strokeStyle = rgba(bark.hi, 0.4);
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(cx - w, y);
    ctx.bezierCurveTo(cx - w, y - h * 1.5 - s * 0.05, cx + w, y - h * 1.5 - s * 0.05, cx + w, y);
    ctx.stroke();
  }
};

const bogfern: PlantFn = (ctx, x, y, s, look, r) => {
  const t = lt(look, r, 1);
  for (let f = 0; f < 7; f++) fernFrond(ctx, x, y, s * (0.75 + r() * 0.3), -Math.PI / 2 + (f - 3) * 0.48, t, r, 0.8);
};

// ───────────────────────────── W2: estuary, where the crocodile lives ─────────────────────────────

const reedclump: PlantFn = (ctx, x, y, s, look, r) => {
  const t = lt(look, r, 1);
  const n = 7 + ((r() * 5) | 0);
  ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const bx = x + (i - n / 2) * 4 + (r() - 0.5) * 4;
    const bh = s * (0.7 + r() * 0.7);
    const lean = (r() - 0.5) * s * 0.5;
    ctx.strokeStyle = i % 2 ? t.mid : t.light;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(bx, y + 2);
    ctx.quadraticCurveTo(bx + lean * 0.3, y - bh * 0.6, bx + lean, y - bh);
    ctx.stroke();
    if (r() > 0.65) {
      ctx.fillStyle = '#6a4a2a';
      ctx.beginPath();
      ctx.roundRect(bx + lean - 3, y - bh - 16, 6, 18, 3);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,230,180,0.35)';
      ctx.fillRect(bx + lean - 2, y - bh - 14, 1.5, 13);
    }
  }
};

const nipa: PlantFn = (ctx, x, y, s, look, r) => {
  const t = lt(look, r, 0);
  for (let f = 0; f < 7; f++) fernFrond(ctx, x, y, s * (1 + r() * 0.3), -Math.PI / 2 + (f - 3) * 0.42, t, r, 0.18);
};

const hyacinth: PlantFn = (ctx, x, y, s, _look, r) => {
  const g = '#6ab04a';
  for (let k = 0; k < 5; k++) {
    const a = -Math.PI / 2 + (k - 2) * 0.55;
    const lx = x + Math.cos(a) * s * 0.3;
    const ly = y + Math.sin(a) * s * 0.28;
    ctx.fillStyle = g;
    ctx.strokeStyle = '#2f6a2a';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(lx, ly, s * 0.16, s * 0.24, a + Math.PI / 2, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#9ad070';
    ctx.beginPath();
    ctx.ellipse(lx, ly + s * 0.08, s * 0.08, s * 0.1, a + Math.PI / 2, 0, TAU);
    ctx.fill();
  }
  ctx.strokeStyle = '#4a7a3a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y - s * 0.75);
  ctx.stroke();
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * TAU;
    ctx.fillStyle = k % 2 ? '#c8a0e8' : '#b088d8';
    ctx.beginPath();
    ctx.ellipse(x + Math.cos(a) * s * 0.1, y - s * 0.8 + Math.sin(a) * s * 0.08, s * 0.08, s * 0.1, a, 0, TAU);
    ctx.fill();
  }
  ctx.fillStyle = '#ffe66a';
  ctx.beginPath();
  ctx.arc(x, y - s * 0.8, s * 0.04, 0, TAU);
  ctx.fill();
};

const proproot: PlantFn = (ctx, x, y, s, look, r) => {
  const bark = tone('#6a4a30', '#120a06');
  const t = lt(look, r, 0);
  ctx.lineCap = 'round';
  for (let k = -2; k <= 2; k++) {
    ctx.strokeStyle = k % 2 ? bark.mid : bark.dark;
    ctx.lineWidth = s * 0.07;
    ctx.beginPath();
    ctx.moveTo(x + k * s * 0.32, y + 2);
    ctx.quadraticCurveTo(x + k * s * 0.12, y - s * 0.3, x, y - s * 0.55);
    ctx.stroke();
  }
  ctx.strokeStyle = bark.mid;
  ctx.lineWidth = s * 0.1;
  ctx.beginPath();
  ctx.moveTo(x, y - s * 0.5);
  ctx.lineTo(x, y - s * 0.8);
  ctx.stroke();
  for (let k = 0; k < 6; k++) leaf(ctx, x, y - s * 0.78, s * 0.34, s * 0.1, -Math.PI / 2 + (k - 2.5) * 0.55, t, 0.1);
  // propagules: green cigars hanging among the leaves
  ctx.strokeStyle = '#7ab050';
  ctx.lineWidth = 3;
  for (let k = 0; k < 3; k++) {
    ctx.beginPath();
    ctx.moveTo(x + (k - 1) * 9, y - s * 0.75);
    ctx.lineTo(x + (k - 1) * 9 + 1, y - s * 0.75 + 10 + r() * 6);
    ctx.stroke();
  }
};

const driftwood: PlantFn = (ctx, x, y, s, _look, r) => {
  const wd = tone('#a89a84', '#2a2218');
  ctx.fillStyle = wd.mid;
  ctx.strokeStyle = rgba(wd.deep, 0.9);
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.roundRect(x - s, y - s * 0.3, s * 2, s * 0.36, s * 0.18);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = rgba(wd.deep, 0.5);
  ctx.lineWidth = 1;
  for (let k = 0; k < 3; k++) {
    ctx.beginPath();
    ctx.moveTo(x - s * 0.8, y - s * (0.08 + k * 0.08));
    ctx.lineTo(x + s * 0.8, y - s * (0.06 + k * 0.08) + (r() - 0.5) * 2);
    ctx.stroke();
  }
  ctx.strokeStyle = wd.dark;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x + s * 0.3, y - s * 0.3);
  ctx.lineTo(x + s * 0.55, y - s * 0.72);
  ctx.stroke();
};

/** the crocodile's nest: a mound of rotting leaves and sticks scraped together, with leathery eggs just showing */
const crocnest: PlantFn = (ctx, x, y, s, _look, r) => {
  const dirt = tone('#6a5a3a', '#140e06');
  ctx.fillStyle = dirt.mid;
  ctx.strokeStyle = rgba(dirt.deep, 0.9);
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(x - s * 1.1, y + 2);
  ctx.quadraticCurveTo(x - s * 0.8, y - s * 0.7, x, y - s * 0.75);
  ctx.quadraticCurveTo(x + s * 0.8, y - s * 0.7, x + s * 1.1, y + 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.lineCap = 'round';
  for (let k = 0; k < 16; k++) {
    const sx = x + (r() - 0.5) * s * 1.7;
    const sy = y - r() * s * 0.6;
    const a = (r() - 0.5) * 2.6;
    ctx.strokeStyle = k % 2 ? dirt.light : dirt.dark;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + Math.cos(a) * s * 0.4, sy + Math.sin(a) * s * 0.2);
    ctx.stroke();
  }
  ctx.fillStyle = '#e8e2cc';
  for (const dx of [-0.18, 0.12]) {
    ctx.beginPath();
    ctx.ellipse(x + s * dx, y - s * 0.62, s * 0.11, s * 0.08, 0.3, 0, TAU);
    ctx.fill();
  }
};

// ───────────────────────────── W3: the panther's dark understory and cave mouth ─────────────────────────────

const birdnest: PlantFn = (ctx, x, y, s, look, r) => {
  const t = lt(look, r, 1);
  for (let k = 0; k < 9; k++) {
    const a = -Math.PI / 2 + (k - 4) * 0.36;
    leaf(ctx, x, y, s * (0.8 + r() * 0.2), s * 0.12, a, t, a * 0.15, true);
  }
};

/** bracket fungus: shelves stacked up a log, each edge lit with a cold glow */
const bracket: PlantFn = (ctx, x, y, s, look, r) => {
  const glow = look.glow ?? '#7ae6c8';
  const bark = tone('#4a3a2c', '#0a0604');
  ctx.fillStyle = bark.mid;
  ctx.strokeStyle = rgba(bark.deep, 0.9);
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.roundRect(x - s * 0.22, y - s * 0.9, s * 0.44, s * 0.95, s * 0.12);
  ctx.fill();
  ctx.stroke();
  for (let k = 0; k < 4; k++) {
    const side = k % 2 ? 1 : -1;
    const sy = y - s * (0.2 + k * 0.2);
    const w = s * (0.3 - k * 0.03);
    glowDot(ctx, x + side * s * 0.2, sy, w * 2.4, glow, 0.25);
    ctx.fillStyle = tone('#c0a888', '#201408').mid;
    ctx.strokeStyle = rgba(glow, 0.8);
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(x + side * s * 0.3, sy, w, w * 0.34, side * -0.08, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
};

/** a mossy rock scored by three parallel gouges: this is where the Shadow Prowler sharpens its claws */
const clawrock: PlantFn = (ctx, x, y, s, look, r) => {
  const st = tone(mix(look.ground.stone, '#3a4a4a', 0.4), '#06101a');
  ctx.fillStyle = st.mid;
  ctx.strokeStyle = look.ground.outline;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.8, y + 2);
  ctx.quadraticCurveTo(x - s * 0.9, y - s * 0.7, x - s * 0.2, y - s * 0.85);
  ctx.quadraticCurveTo(x + s * 0.7, y - s * 0.9, x + s * 0.85, y + 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = rgba(tone(look.leaves[1] ?? look.leaves[0]).mid, 0.8);
  ctx.beginPath();
  ctx.ellipse(x - s * 0.1, y - s * 0.8, s * 0.5, s * 0.1, 0, Math.PI, 0);
  ctx.fill();
  ctx.lineCap = 'round';
  for (let k = 0; k < 3; k++) {
    const ox = (k - 1) * s * 0.13;
    ctx.strokeStyle = rgba('#d8d0b8', 0.85);
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(x - s * 0.2 + ox, y - s * 0.7);
    ctx.quadraticCurveTo(x - s * 0.1 + ox, y - s * 0.4, x + ox * 0.6, y - s * 0.12);
    ctx.stroke();
    ctx.strokeStyle = rgba(st.deep, 0.9);
    ctx.lineWidth = 1;
    ctx.stroke();
  }
};

const bones: PlantFn = (ctx, x, y, s, _look, r) => {
  const bone = '#e8e0c8';
  ctx.strokeStyle = '#1a1208';
  ctx.lineWidth = 1.2;
  ctx.fillStyle = bone;
  // a skull
  ctx.beginPath();
  ctx.ellipse(x - s * 0.2, y - s * 0.22, s * 0.3, s * 0.24, 0, 0, TAU);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#1a1208';
  for (const dx of [-0.3, -0.1]) {
    ctx.beginPath();
    ctx.ellipse(x + s * dx, y - s * 0.26, s * 0.06, s * 0.07, 0, 0, TAU);
    ctx.fill();
  }
  // a long bone and ribs
  ctx.strokeStyle = bone;
  ctx.lineWidth = s * 0.1;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x + s * 0.1, y - s * 0.06);
  ctx.lineTo(x + s * 0.8, y - s * 0.14 - r() * 4);
  ctx.stroke();
  for (let k = 0; k < 3; k++) {
    ctx.lineWidth = s * 0.05;
    ctx.beginPath();
    ctx.moveTo(x + s * (0.3 + k * 0.14), y - s * 0.1);
    ctx.quadraticCurveTo(x + s * (0.34 + k * 0.14), y - s * 0.42, x + s * (0.5 + k * 0.14), y - s * 0.3);
    ctx.stroke();
  }
};

// ───────────────────────────── W5: the spider queen's understory ─────────────────────────────

const heliconia: PlantFn = (ctx, x, y, s, look, r) => {
  const t = lt(look, r, 0);
  for (let k = 0; k < 3; k++) leaf(ctx, x, y, s * 0.85, s * 0.2, -Math.PI / 2 + (k - 1) * 0.7, t, 0.12, true);
  const h = s * (0.8 + r() * 0.3);
  ctx.strokeStyle = '#3a5a2a';
  ctx.lineWidth = 2.6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + 8, y - h * 0.6, x + 4, y - h);
  ctx.stroke();
  // lobster-claw bracts: a zigzag of red boats edged in yellow
  for (let k = 0; k < 5; k++) {
    const by = y - h + k * s * 0.13;
    const side = k % 2 ? 1 : -1;
    const bx = x + 4 + side * s * 0.08;
    ctx.fillStyle = '#d83a2a';
    ctx.strokeStyle = '#f2c230';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(bx - side * s * 0.02, by);
    ctx.quadraticCurveTo(bx + side * s * 0.34, by - s * 0.05, bx + side * s * 0.3, by + s * 0.12);
    ctx.quadraticCurveTo(bx + side * s * 0.1, by + s * 0.1, bx - side * s * 0.02, by + s * 0.08);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
};

const orchidclump: PlantFn = (ctx, x, y, s, look, r) => {
  const t = lt(look, r, 1);
  for (let k = 0; k < 4; k++) leaf(ctx, x, y, s * 0.55, s * 0.1, -Math.PI / 2 + (k - 1.5) * 0.7, t, 0.1);
  for (let sp = 0; sp < 2; sp++) {
    const dir = sp ? 1 : -1;
    ctx.strokeStyle = '#4a6a3a';
    ctx.lineWidth = 1.8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y - 2);
    ctx.quadraticCurveTo(x + dir * s * 0.1, y - s * 0.9, x + dir * s * 0.55, y - s * 0.7);
    ctx.stroke();
    for (let f = 0; f < 4; f++) {
      const u = 0.4 + f * 0.18;
      const fx = x + dir * s * (0.55 * u * u + 0.1 * u);
      const fy = y - s * (0.9 * (1 - (1 - u) * (1 - u)) * 0.95) - (f > 2 ? 0 : 0);
      for (let p = 0; p < 5; p++) {
        const a = (p / 5) * TAU;
        ctx.fillStyle = p < 2 ? '#fbe8f2' : '#f6a8d0';
        ctx.beginPath();
        ctx.ellipse(fx + Math.cos(a) * s * 0.06, fy + Math.sin(a) * s * 0.06, s * 0.06, s * 0.045, a, 0, TAU);
        ctx.fill();
      }
      ctx.fillStyle = '#c0307a';
      ctx.beginPath();
      ctx.arc(fx, fy, s * 0.03, 0, TAU);
      ctx.fill();
    }
  }
};

const bromrosette: PlantFn = (ctx, x, y, s, look, r) => {
  bromeliad(ctx, x, y, s, tone(look.leaves[(r() * look.leaves.length) | 0]), look.flora[(r() * look.flora.length) | 0], r);
};

/** a golden orb web: anchor lines, radials, a spiral of capture thread beaded with dew, and the spider at the hub */
function orb(ctx: CanvasRenderingContext2D, x: number, y: number, R: number, r: RNG, spider: boolean) {
  const gold = 'rgba(244,214,120,0.9)';
  ctx.strokeStyle = 'rgba(244,224,160,0.6)';
  ctx.lineWidth = 1;
  for (const [ax, ay] of [[-1.4, -1.2], [1.5, -1.1], [-1.2, 1.4], [1.3, 1.3]]) {
    ctx.beginPath();
    ctx.moveTo(x + ax * R * 0.5, y + ay * R * 0.5);
    ctx.lineTo(x + ax * R * 1.15, y + ay * R * 1.15);
    ctx.stroke();
  }
  const spokes = 14;
  ctx.strokeStyle = gold;
  ctx.lineWidth = 0.9;
  for (let k = 0; k < spokes; k++) {
    const a = (k / spokes) * TAU + 0.2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * R, y + Math.sin(a) * R * 0.94);
    ctx.stroke();
  }
  for (let ring = 1; ring <= 7; ring++) {
    const rr = (ring / 7) * R;
    ctx.beginPath();
    for (let k = 0; k <= spokes; k++) {
      const a = (k / spokes) * TAU + 0.2;
      const sag = Math.sin(a) > 0 ? 1.05 : 1;
      const px = x + Math.cos(a) * rr;
      const py = y + Math.sin(a) * rr * 0.94 * sag;
      const mx = x + Math.cos(a - TAU / spokes / 2) * rr * 0.96;
      const my = y + Math.sin(a - TAU / spokes / 2) * rr * 0.9 * sag;
      k === 0 ? ctx.moveTo(px, py) : ctx.quadraticCurveTo(mx, my, px, py);
    }
    ctx.strokeStyle = ring % 2 ? gold : 'rgba(255,236,170,0.75)';
    ctx.stroke();
  }
  for (let k = 0; k < 9; k++) {
    const a = r() * TAU;
    const rr = (0.2 + r() * 0.75) * R;
    bead(ctx, x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.94, 1.1 + r() * 0.8);
  }
  if (spider) {
    ctx.fillStyle = '#2a1a10';
    ctx.strokeStyle = '#2a1a10';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(x, y + R * 0.08, R * 0.06, R * 0.1, 0, 0, TAU);
    ctx.fill();
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * TAU;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(a) * R * 0.22, y + Math.sin(a) * R * 0.2);
      ctx.stroke();
    }
  }
}
export { orb };

const orbweb: PlantFn = (ctx, x, y, s, _look, r) => {
  // two stalks hold it up
  ctx.strokeStyle = '#3a5a2a';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  for (const dx of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(x + dx * s * 0.85, y + 2);
    ctx.quadraticCurveTo(x + dx * s * 0.95, y - s * 0.7, x + dx * s * 0.75, y - s * 1.2);
    ctx.stroke();
  }
  // (no spider at its hub: a dark, spiky thing sitting in the grass by the path read as World 5's hazard, and QA v198 blamed hits on
  // it; only the real spiders, rimmed in ember, look like they bite)
  orb(ctx, x, y - s * 0.78, s * 0.72, r, false);
};

const cocoon: PlantFn = (ctx, x, y, s, _look, r) => {
  ctx.fillStyle = '#ebe4d0';
  ctx.strokeStyle = 'rgba(120,110,90,0.8)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.ellipse(x, y - s * 0.28, s * 0.22, s * 0.34, 0.4, 0, TAU);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = 'rgba(170,160,130,0.8)';
  ctx.lineWidth = 0.9;
  for (let k = 0; k < 6; k++) {
    ctx.beginPath();
    ctx.moveTo(x - s * 0.2, y - s * (0.55 - k * 0.1));
    ctx.lineTo(x + s * 0.24, y - s * (0.42 - k * 0.1));
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(244,224,160,0.6)';
  for (let k = 0; k < 3; k++) {
    ctx.beginPath();
    ctx.moveTo(x + (k - 1) * 4, y - s * 0.55);
    ctx.lineTo(x + (k - 1) * s * 0.5 + (r() - 0.5) * 6, y - s * 1.1);
    ctx.stroke();
  }
};

// ───────────────────────────── W7: the overgrown temple ─────────────────────────────

const idolhead: PlantFn = (ctx, x, y, s, look, r) => {
  const st = tone(mix(look.ground.stone, '#7a7a68', 0.3), '#14120a');
  const w = s * 0.8;
  const h = s * 0.95;
  ctx.fillStyle = st.mid;
  ctx.strokeStyle = look.ground.outline;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(x - w, y + 2);
  ctx.lineTo(x - w * 0.9, y - h * 0.8);
  ctx.quadraticCurveTo(x, y - h * 1.15, x + w * 0.9, y - h * 0.8);
  ctx.lineTo(x + w, y + 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // brow, hollow eyes, nose and a flat mouth
  ctx.fillStyle = st.dark;
  ctx.beginPath();
  ctx.rect(x - w * 0.8, y - h * 0.72, w * 1.6, h * 0.1);
  ctx.fill();
  ctx.fillStyle = '#0a0a08';
  for (const dx of [-0.42, 0.42]) {
    ctx.beginPath();
    ctx.roundRect(x + w * dx - w * 0.2, y - h * 0.62, w * 0.4, h * 0.18, 3);
    ctx.fill();
  }
  ctx.fillStyle = st.light;
  ctx.beginPath();
  ctx.moveTo(x - w * 0.12, y - h * 0.5);
  ctx.lineTo(x + w * 0.12, y - h * 0.5);
  ctx.lineTo(x + w * 0.18, y - h * 0.26);
  ctx.lineTo(x - w * 0.18, y - h * 0.26);
  ctx.fill();
  ctx.fillStyle = '#0a0a08';
  ctx.fillRect(x - w * 0.4, y - h * 0.16, w * 0.8, h * 0.06);
  // moss, and a root that has found its way across
  ctx.fillStyle = rgba(tone(look.leaves[1] ?? look.leaves[0]).mid, 0.8);
  for (let k = 0; k < 5; k++) {
    ctx.beginPath();
    ctx.ellipse(x + (r() - 0.5) * w * 1.6, y - h * (0.2 + r() * 0.7), 5 + r() * 5, 3 + r() * 2, 0, 0, TAU);
    ctx.fill();
  }
  ctx.strokeStyle = '#5a4630';
  ctx.lineWidth = 3.4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - w * 1.0, y - h * 0.9);
  ctx.quadraticCurveTo(x - w * 0.2, y - h * 0.6, x + w * 0.5, y - h * 0.05);
  ctx.stroke();
};

const blockpile: PlantFn = (ctx, x, y, s, look, r) => {
  const st = tone(mix(look.ground.stone, '#7a7a68', 0.3), '#14120a');
  const blocks: Array<[number, number, number, number, number]> = [
    [-0.55, 0, 0.7, 0.32, -0.05], [0.18, 0, 0.62, 0.3, 0.06], [-0.2, -0.3, 0.6, 0.3, -0.1],
  ];
  for (const [bx, by, bw, bh, rot] of blocks) {
    ctx.save();
    ctx.translate(x + bx * s, y + by * s);
    ctx.rotate(rot);
    ctx.fillStyle = st.mid;
    ctx.strokeStyle = look.ground.outline;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.roundRect(0, -bh * s, bw * s, bh * s, 3);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = st.light;
    ctx.fillRect(2, -bh * s + 1, bw * s - 4, 2.4);
    ctx.strokeStyle = rgba(st.deep, 0.7);
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let k = 0; k < 3; k++) {
      ctx.moveTo(bw * s * (0.15 + k * 0.25), -bh * s * 0.7);
      ctx.lineTo(bw * s * (0.15 + k * 0.25) + 5, -bh * s * 0.7);
      ctx.lineTo(bw * s * (0.15 + k * 0.25) + 5, -bh * s * 0.3);
    }
    ctx.stroke();
    ctx.fillStyle = rgba(tone(look.leaves[1] ?? look.leaves[0]).mid, 0.85);
    ctx.beginPath();
    ctx.ellipse(bw * s * (0.2 + r() * 0.5), -bh * s, 6 + r() * 6, 3, 0, Math.PI, 0);
    ctx.fill();
    ctx.restore();
  }
};

/** roots that have climbed a block of stone: the thing that destroyed the temple, and holds it up */
const figroot: PlantFn = (ctx, x, y, s, look, r) => {
  const st = tone(mix(look.ground.stone, '#7a7a68', 0.3), '#14120a');
  ctx.fillStyle = st.mid;
  ctx.strokeStyle = look.ground.outline;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.roundRect(x - s * 0.45, y - s * 0.5, s * 0.9, s * 0.52, 3);
  ctx.fill();
  ctx.stroke();
  const root = tone('#8a7a64', '#120c06');
  ctx.lineCap = 'round';
  for (let k = 0; k < 4; k++) {
    const sx = x - s * 0.3 + k * s * 0.2;
    ctx.strokeStyle = root.deep;
    ctx.lineWidth = s * 0.12 + 2;
    ctx.beginPath();
    ctx.moveTo(sx + (r() - 0.5) * 6, y - s * 0.95);
    ctx.bezierCurveTo(sx + 14, y - s * 0.6, sx - 14, y - s * 0.3, sx + (r() - 0.5) * 18, y + 3);
    ctx.stroke();
    ctx.strokeStyle = root.mid;
    ctx.lineWidth = s * 0.12;
    ctx.stroke();
  }
};

// ───────────────────────────── W9: volcanic regrowth ─────────────────────────────

/** ohia: a scorched, twisted little tree that is the first to come back, tipped with red lehua pompoms */
const ohia: PlantFn = (ctx, x, y, s, look, r) => {
  const bark = tone('#3a2a26', '#0a0505');
  ctx.strokeStyle = bark.dark;
  ctx.lineCap = 'round';
  const h = s * (0.7 + r() * 0.3);
  ctx.lineWidth = s * 0.12;
  ctx.beginPath();
  ctx.moveTo(x, y + 2);
  ctx.bezierCurveTo(x - 8, y - h * 0.4, x + 10, y - h * 0.6, x, y - h);
  ctx.stroke();
  const tips: Array<[number, number]> = [[x, y - h]];
  for (const dx of [-1, 1]) {
    ctx.lineWidth = s * 0.06;
    ctx.beginPath();
    ctx.moveTo(x + dx * 2, y - h * 0.55);
    ctx.quadraticCurveTo(x + dx * s * 0.3, y - h * 0.7, x + dx * s * 0.4, y - h * 0.95);
    ctx.stroke();
    tips.push([x + dx * s * 0.4, y - h * 0.95]);
  }
  for (const [tx, ty] of tips) {
    leafSprayTiny(ctx, tx, ty, s * 0.22, tone(look.leaves[1] ?? '#c8c02a'), r);
    const col = '#e8281a';
    glowDot(ctx, tx, ty, s * 0.4, col, 0.3);
    for (let k = 0; k < 16; k++) {
      const a = (k / 16) * TAU;
      ctx.strokeStyle = k % 3 ? col : '#ff6a4a';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(tx + Math.cos(a) * s * 0.17, ty + Math.sin(a) * s * 0.17);
      ctx.stroke();
    }
  }
};
function leafSprayTiny(ctx: CanvasRenderingContext2D, x: number, y: number, len: number, t: Tone, r: RNG) {
  for (let k = 0; k < 5; k++) leaf(ctx, x, y, len, len * 0.3, -Math.PI / 2 + (k - 2) * 0.7 + (r() - 0.5) * 0.2, t, 0.1);
}

const steamvent: PlantFn = (ctx, x, y, s, look, r) => {
  const rock = tone('#3a2e2e', '#0a0505');
  ctx.fillStyle = rock.mid;
  ctx.strokeStyle = look.ground.outline;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.8, y + 2);
  ctx.lineTo(x - s * 0.5, y - s * 0.4);
  ctx.lineTo(x - s * 0.15, y - s * 0.55);
  ctx.lineTo(x + s * 0.2, y - s * 0.55);
  ctx.lineTo(x + s * 0.6, y - s * 0.3);
  ctx.lineTo(x + s * 0.85, y + 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // sulphur crust round the vent mouth
  ctx.fillStyle = '#e8d44a';
  ctx.beginPath();
  ctx.ellipse(x, y - s * 0.55, s * 0.26, s * 0.08, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#3a2a10';
  ctx.beginPath();
  ctx.ellipse(x, y - s * 0.55, s * 0.12, s * 0.04, 0, 0, TAU);
  ctx.fill();
  glowDot(ctx, x, y - s * 0.55, s * 0.5, look.glow ?? '#ff7a1a', 0.45);
  // a plume of steam, widening and fading as it climbs
  for (let k = 0; k < 5; k++) {
    const u = k / 5;
    const cx = x + Math.sin(k * 1.3 + r()) * s * 0.12 * k;
    const cy = y - s * (0.7 + u * 1.3);
    const rr = s * (0.14 + u * 0.2);
    ctx.fillStyle = `rgba(235,230,225,${0.5 - u * 0.4})`;
    ctx.beginPath();
    ctx.arc(cx, cy, rr, 0, TAU);
    ctx.fill();
  }
};

const lavafern: PlantFn = (ctx, x, y, s, look, r) => {
  const rock = tone('#2c2222', '#050202');
  ctx.fillStyle = rock.mid;
  ctx.strokeStyle = look.ground.outline;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.5, y + 2);
  ctx.lineTo(x - s * 0.35, y - s * 0.2);
  ctx.lineTo(x + s * 0.05, y - s * 0.28);
  ctx.lineTo(x + s * 0.5, y + 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  const t = tone('#7ab04a', '#0a1a06');
  for (let f = 0; f < 6; f++) fernFrond(ctx, x, y - s * 0.2, s * (0.7 + r() * 0.3), -Math.PI / 2 + (f - 2.5) * 0.5, t, r, 0.7);
};

const lichenrock: PlantFn = (ctx, x, y, s, look, r) => {
  const rock = tone('#3a2e2e', '#0a0505');
  ctx.fillStyle = rock.mid;
  ctx.strokeStyle = look.ground.outline;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(x, y + 2, s * 0.8, s * 0.5, 0, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  for (let k = 0; k < 7; k++) {
    ctx.fillStyle = k % 2 ? 'rgba(232,170,50,0.85)' : 'rgba(190,210,110,0.85)';
    ctx.beginPath();
    ctx.ellipse(x + (r() - 0.5) * s * 1.1, y - r() * s * 0.4, 3 + r() * 5, 2 + r() * 3, r(), 0, TAU);
    ctx.fill();
  }
};

// ───────────────────────────── W10: the mountain above the treeline ─────────────────────────────

/** a wet slate rock, split along its layers, shining with rain */
const slaterock: PlantFn = (ctx, x, y, s, look, r) => {
  const st = tone(mix(look.ground.stone, '#4a5266', 0.5), '#0a0c16');
  const w = s * (0.7 + r() * 0.3);
  const h = s * (0.45 + r() * 0.25);
  ctx.fillStyle = st.mid;
  ctx.strokeStyle = look.ground.outline;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(x - w, y + 2);
  ctx.lineTo(x - w * 0.8, y - h * 0.7);
  ctx.lineTo(x - w * 0.2, y - h);
  ctx.lineTo(x + w * 0.5, y - h * 0.85);
  ctx.lineTo(x + w, y - h * 0.2);
  ctx.lineTo(x + w * 0.9, y + 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // the layers of the slate
  ctx.strokeStyle = rgba(st.deep, 0.6);
  ctx.lineWidth = 1;
  for (let k = 1; k < 3; k++) {
    const yy = y - h * (k / 3);
    ctx.beginPath();
    ctx.moveTo(x - w * 0.85, yy + 2);
    ctx.lineTo(x + w * 0.85, yy - 2);
    ctx.stroke();
  }
  // rain sheen along the top
  ctx.strokeStyle = 'rgba(210,225,245,0.45)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(x - w * 0.6, y - h * 0.82);
  ctx.lineTo(x + w * 0.3, y - h * 0.9);
  ctx.stroke();
};

/** a tuft of wiry mountain grass, combed flat by the wind */
const wiregrass: PlantFn = (ctx, x, y, s, _look, r) => {
  const blades = 9 + ((r() * 5) | 0);
  const lean = 0.55 + r() * 0.25;
  for (let k = 0; k < blades; k++) {
    const bx = x + (r() - 0.5) * s * 0.4;
    const len = s * (0.55 + r() * 0.5);
    ctx.strokeStyle = k % 3 ? '#7a7448' : '#9a9060';
    ctx.lineWidth = 1.3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(bx, y + 2);
    ctx.quadraticCurveTo(bx + len * lean * 0.4, y - len * 0.7, bx + len * lean, y - len * 0.55);
    ctx.stroke();
  }
};

/** rain pooled in a hollow of the rock */
const puddle: PlantFn = (ctx, x, y, s, _look, r) => {
  const w = s * (0.8 + r() * 0.5);
  ctx.fillStyle = 'rgba(40,48,66,0.9)';
  ctx.beginPath();
  ctx.ellipse(x, y + 1, w, s * 0.12, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(200,215,240,0.45)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.ellipse(x - w * 0.2, y, w * 0.45, s * 0.05, 0, 0, TAU);
  ctx.stroke();
};

// ───────────────────────────── the war camp (kept for the General's lair) ─────────────────────────────

const stump: PlantFn = (ctx, x, y, s, look, r) => {
  const bark = tone('#4a3a2c', '#0a0604');
  const w = s * 0.7;
  const h = s * 0.55;
  ctx.fillStyle = bark.mid;
  ctx.strokeStyle = rgba(look.ground.outline, 0.95);
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(x - w * 1.25, y + 2);
  ctx.quadraticCurveTo(x - w * 0.85, y - h * 0.2, x - w, y - h);
  ctx.lineTo(x + w, y - h);
  ctx.quadraticCurveTo(x + w * 0.85, y - h * 0.2, x + w * 1.25, y + 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // the cut top: pale rings, scorched at the edge
  ctx.fillStyle = '#d2b484';
  ctx.beginPath();
  ctx.ellipse(x, y - h, w, w * 0.3, 0, 0, TAU);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = 'rgba(120,80,40,0.6)';
  ctx.lineWidth = 1;
  for (let k = 1; k < 4; k++) {
    ctx.beginPath();
    ctx.ellipse(x, y - h, w * (k / 4), w * 0.3 * (k / 4), 0, 0, TAU);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(20,14,10,0.7)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(x, y - h, w * 0.98, w * 0.29, 0, 0.2, Math.PI - 0.2);
  ctx.stroke();
  // the axe notch
  ctx.fillStyle = '#6a4a2a';
  ctx.beginPath();
  ctx.moveTo(x - w * 0.9, y - h * 0.5);
  ctx.lineTo(x - w * 0.2, y - h * 0.62);
  ctx.lineTo(x - w * 0.85, y - h * 0.3);
  ctx.fill();
};

const stakes: PlantFn = (ctx, x, y, s, _look, r) => {
  const n = 5;
  for (let k = 0; k < n; k++) {
    const sx = x + (k - (n - 1) / 2) * s * 0.34;
    const lean = (k - (n - 1) / 2) * 0.1;
    ctx.save();
    ctx.translate(sx, y + 2);
    ctx.rotate(lean);
    const h = s * (0.9 + r() * 0.2);
    ctx.fillStyle = '#5a4630';
    ctx.strokeStyle = '#1a1008';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-s * 0.07, 0);
    ctx.lineTo(-s * 0.07, -h * 0.85);
    ctx.lineTo(0, -h);
    ctx.lineTo(s * 0.07, -h * 0.85);
    ctx.lineTo(s * 0.07, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#8a8698';
    ctx.beginPath();
    ctx.moveTo(-s * 0.05, -h * 0.9);
    ctx.lineTo(0, -h * 1.02);
    ctx.lineTo(s * 0.05, -h * 0.9);
    ctx.fill();
    ctx.restore();
  }
  ctx.strokeStyle = '#c9b58a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.7, y - s * 0.3);
  ctx.lineTo(x + s * 0.7, y - s * 0.34);
  ctx.moveTo(x - s * 0.7, y - s * 0.55);
  ctx.lineTo(x + s * 0.7, y - s * 0.58);
  ctx.stroke();
};

const logpile: PlantFn = (ctx, x, y, s, _look, r) => {
  const rows: Array<[number, number]> = [[-0.5, 0], [0.0, 0], [0.5, 0], [-0.25, -0.34], [0.25, -0.34]];
  for (const [dx, dy] of rows) {
    const cx = x + dx * s;
    const cy = y + dy * s - s * 0.2;
    ctx.fillStyle = '#5a4630';
    ctx.strokeStyle = '#1a1008';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(cx, cy, s * 0.24, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#d2b484';
    ctx.beginPath();
    ctx.arc(cx, cy, s * 0.17, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = 'rgba(120,80,40,0.6)';
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.arc(cx, cy, s * 0.09, 0, TAU);
    ctx.stroke();
    r();
  }
};

const banner: PlantFn = (ctx, x, y, s, _look, r) => {
  ctx.strokeStyle = '#3a3040';
  ctx.lineWidth = 3.4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y + 2);
  ctx.lineTo(x, y - s * 1.6);
  ctx.stroke();
  ctx.fillStyle = '#7a8098';
  ctx.beginPath();
  ctx.arc(x, y - s * 1.62, 3.4, 0, TAU);
  ctx.fill();
  // a torn crimson cloth bearing the three claw-slashes of the General
  ctx.fillStyle = '#b02a3a';
  ctx.strokeStyle = '#3a0a14';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x, y - s * 1.5);
  ctx.lineTo(x + s * 0.7, y - s * 1.45);
  ctx.lineTo(x + s * 0.58, y - s * 1.2);
  ctx.lineTo(x + s * 0.72, y - s * 1.0);
  ctx.lineTo(x + s * 0.4, y - s * 1.05);
  ctx.lineTo(x + s * 0.3, y - s * 0.8);
  ctx.lineTo(x, y - s * 0.9);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = '#1a0408';
  ctx.lineWidth = 2;
  for (let k = 0; k < 3; k++) {
    ctx.beginPath();
    ctx.moveTo(x + s * (0.15 + k * 0.12), y - s * 1.38);
    ctx.lineTo(x + s * (0.2 + k * 0.1), y - s * 1.0);
    ctx.stroke();
  }
  r();
};

const campfire: PlantFn = (ctx, x, y, s, _look, r) => {
  glowDot(ctx, x, y - s * 0.4, s * 1.7, '#ff7a2a', 0.4);
  ctx.strokeStyle = '#3a2a1a';
  ctx.lineWidth = s * 0.14;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - s * 0.5, y);
  ctx.lineTo(x + s * 0.3, y - s * 0.22);
  ctx.moveTo(x + s * 0.5, y);
  ctx.lineTo(x - s * 0.3, y - s * 0.22);
  ctx.stroke();
  for (const [col, k] of [['#e8401a', 1], ['#ff9a2a', 0.7], ['#ffe27a', 0.4]] as Array<[string, number]>) {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(x - s * 0.3 * k, y - s * 0.2);
    ctx.quadraticCurveTo(x - s * 0.34 * k, y - s * 0.7 * k, x + (r() - 0.5) * 4, y - s * 1.05 * k);
    ctx.quadraticCurveTo(x + s * 0.34 * k, y - s * 0.6 * k, x + s * 0.3 * k, y - s * 0.2);
    ctx.closePath();
    ctx.fill();
  }
};

// ───────────────────────────── W1: lowland rainforest, where the snake lives ─────────────────────────────

const snakeskin: PlantFn = (ctx, x, y, s, _look, r) => {
  ctx.strokeStyle = 'rgba(230,240,225,0.8)';
  ctx.lineWidth = s * 0.18;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - s, y - 2);
  ctx.bezierCurveTo(x - s * 0.5, y - s * 0.5, x - s * 0.1, y + 2, x + s * 0.3, y - s * 0.32);
  ctx.bezierCurveTo(x + s * 0.6, y - s * 0.5, x + s * 0.8, y - 2, x + s, y - 4);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(120,140,120,0.7)';
  ctx.lineWidth = 1;
  for (let k = 0; k < 16; k++) {
    const u = k / 15;
    const px = x - s + u * s * 2;
    ctx.beginPath();
    ctx.moveTo(px, y - s * 0.12 - Math.sin(u * 6) * s * 0.1);
    ctx.lineTo(px + 2, y + s * 0.02 - Math.sin(u * 6) * s * 0.1);
    ctx.stroke();
  }
  r();
};

const hollowlog: PlantFn = (ctx, x, y, s, look, r) => {
  const wd = tone(mix(look.trunk[0], '#6a4a30', 0.4), '#0a0604');
  const h = s * 0.5;
  ctx.fillStyle = wd.mid;
  ctx.strokeStyle = look.ground.outline;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.roundRect(x - s, y - h, s * 1.9, h + 3, h * 0.45);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = wd.light;
  ctx.beginPath();
  ctx.ellipse(x + s * 0.9, y - h * 0.5, h * 0.3, h * 0.5, 0, 0, TAU);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#080604';
  ctx.beginPath();
  ctx.ellipse(x + s * 0.9, y - h * 0.5, h * 0.2, h * 0.38, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = rgba(tone(look.leaves[1] ?? look.leaves[0]).mid, 0.85);
  for (let k = 0; k < 3; k++) {
    ctx.beginPath();
    ctx.ellipse(x - s * 0.5 + r() * s, y - h, 6 + r() * 6, 3, 0, Math.PI, 0);
    ctx.fill();
  }
};

// ───────────────────────────── hanging clusters (360px sprites hung from the top centre) ─────────────────────────────

const strand = (c: CanvasRenderingContext2D, x: number, len: number, w: number, col: string, r: RNG, wob = 14) => {
  c.strokeStyle = col;
  c.lineWidth = w;
  c.lineCap = 'round';
  c.beginPath();
  c.moveTo(x, 2);
  c.bezierCurveTo(x + (r() - 0.5) * wob, len * 0.3, x + (r() - 0.5) * wob, len * 0.65, x + (r() - 0.5) * wob * 0.6, len);
  c.stroke();
};

export const SWAYS: Record<string, SwayFn> = {
  /** W2: palm fronds and lianas hanging over the water */
  droop: (c, look, variant, r) => {
    const t = tone(darken(look.leaves[0], 0.25), '#04201a');
    const n = 4 + (variant % 2);
    for (let k = 0; k < n; k++) fernFrond(c, 180, 8, 190 + r() * 60, Math.PI / 2 + (k - (n - 1) / 2) * 0.5, t, r, 0.5);
    for (let k = 0; k < 3; k++) {
      const x = 90 + r() * 180;
      const len = 120 + r() * 170;
      strand(c, x, len, 2, tone(look.vine.main).dark, r);
      leaf(c, x, len, 22, 8, Math.PI / 2, tone(look.vine.leaf), 0.1);
    }
  },
  /** W6: wet grey moss and aerial roots hanging from the swamp canopy */
  bogmoss: (c, look, variant, r) => {
    const moss = tone(mix(look.leaves[2] ?? look.leaves[0], '#9aa88a', 0.5));
    for (let k = 0; k < 6; k++) {
      const x = 70 + k * 42 + r() * 20;
      const len = 120 + r() * 190;
      strand(c, x, len, 4 + r() * 3, k % 2 ? moss.mid : moss.light, r, 18);
      bead(c, x, len + 3, 1.8);
    }
    for (let k = 0; k < 2 + (variant % 2); k++) {
      const x = 110 + r() * 150;
      const len = 150 + r() * 130;
      strand(c, x, len, 2.4, '#3a2a1a', r, 6);
      leaf(c, x, len, 20, 7, Math.PI / 2, tone(look.vine.leaf), 0.1);
    }
  },
  /** W3: root curtains and the silk lines of glowworms, each strung with beads of cold light */
  glowworm: (c, look, variant, r) => {
    const glow = look.glow ?? '#7ae6c8';
    for (let k = 0; k < 2; k++) strand(c, 110 + k * 140 + r() * 30, 150 + r() * 120, 4.2, '#2a1c14', r, 12);
    for (let k = 0; k < 8; k++) {
      const x = 50 + k * 36 + r() * 16;
      const len = 90 + r() * 190;
      c.strokeStyle = 'rgba(190,240,230,0.45)';
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(x, 2);
      c.lineTo(x + (r() - 0.5) * 6, len);
      c.stroke();
      for (let y = 16 + r() * 8; y < len; y += 12 + r() * 10) {
        glowDot(c, x + (r() - 0.5) * 2, y, 7, glow, 0.55);
        c.fillStyle = 'rgba(210,255,245,0.9)';
        c.beginPath();
        c.arc(x, y, 1.5, 0, TAU);
        c.fill();
      }
      glowDot(c, x, len, 14, glow, 0.8);
    }
    void variant;
  },
  /** W5: strands of silk beaded with dew, a wrapped cocoon and a hanging orchid */
  silk: (c, look, variant, r) => {
    for (let k = 0; k < 6; k++) {
      const x = 60 + k * 48 + r() * 20;
      const len = 100 + r() * 190;
      strand(c, x, len, 1.2, 'rgba(250,232,170,0.7)', r, 10);
      for (let b = 0; b < 3; b++) bead(c, x + (r() - 0.5) * 6, len * (0.3 + b * 0.28), 1.6);
    }
    c.save();
    c.translate(150 + variant * 20, 140);
    cocoon(c, 0, 80, 70, look, r);
    c.restore();
    const ox = 250;
    strand(c, ox, 60, 2, '#4a6a3a', r, 6);
    for (let f = 0; f < 5; f++) {
      const fy = 60 + f * 22;
      c.fillStyle = f % 2 ? '#f6a8d0' : '#fbe8f2';
      c.beginPath();
      c.ellipse(ox + (f % 2 ? 6 : -6), fy, 9, 7, 0.4, 0, TAU);
      c.fill();
      c.fillStyle = '#c0307a';
      c.beginPath();
      c.arc(ox + (f % 2 ? 6 : -6), fy, 2.6, 0, TAU);
      c.fill();
    }
  },
  /** W7: a strangler fig's aerial roots dropping through the broken roof */
  aerial: (c, look, variant, r) => {
    const root = tone('#8a7a64', '#120c06');
    for (let k = 0; k < 6; k++) {
      const x = 60 + k * 44 + r() * 18;
      const len = 120 + r() * 200;
      c.strokeStyle = root.deep;
      c.lineWidth = 6 - k * 0.3;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(x, 2);
      c.bezierCurveTo(x + 10, len * 0.3, x - 10, len * 0.65, x + (r() - 0.5) * 12, len);
      c.stroke();
      c.strokeStyle = root.mid;
      c.lineWidth = 3.4;
      c.stroke();
      if (r() > 0.4) leaf(c, x, len, 28, 10, Math.PI / 2, tone(look.leaves[1] ?? look.leaves[0]), 0.1);
    }
    for (let k = 0; k < 3; k++) leaf(c, 100 + k * 80, 10, 50, 22, Math.PI / 2 + (k - 1) * 0.5, tone(look.leaves[0]), 0.1, true);
    void variant;
  },
  /** W9: burnt vines, black and curled, with embers still alive in them */
  charvine: (c, look, variant, r) => {
    const ember = look.glow ?? '#ff7a1a';
    for (let k = 0; k < 4; k++) {
      const x = 80 + k * 66 + r() * 20;
      const len = 120 + r() * 170;
      strand(c, x, len, 3.4, '#1a1010', r, 30);
      for (let m = 0; m < 5; m++) {
        const y = 20 + r() * len;
        glowDot(c, x + (r() - 0.5) * 8, y, 8, ember, 0.7);
        c.fillStyle = '#ffd06a';
        c.beginPath();
        c.arc(x, y, 1.4, 0, TAU);
        c.fill();
      }
    }
    void variant;
  },
  /** W10: chains and torn cloth hanging from the keep's gantry */
  chains: (c, look, variant, r) => {
    void look;
    const link = (x: number, y: number, flip: boolean) => {
      c.strokeStyle = '#6a6680';
      c.lineWidth = 2.6;
      c.beginPath();
      c.ellipse(x, y, flip ? 2.4 : 4.4, flip ? 4.4 : 2.4, 0, 0, TAU);
      c.stroke();
      c.strokeStyle = 'rgba(200,200,230,0.5)';
      c.lineWidth = 1;
      c.stroke();
    };
    for (let k = 0; k < 3; k++) {
      const x = 90 + k * 90 + r() * 20;
      const len = 90 + r() * 170;
      for (let y = 6, i = 0; y < len; y += 8, i++) link(x, y, i % 2 === 0);
      if (k === 1 && variant < 0) {
        c.fillStyle = '#9a2a38';
        c.beginPath();
        c.moveTo(x, len);
        c.lineTo(x + 34, len + 6);
        c.lineTo(x + 24, len + 28);
        c.lineTo(x + 30, len + 52);
        c.lineTo(x + 6, len + 36);
        c.lineTo(x - 4, len + 18);
        c.closePath();
        c.fill();
      } else {
        c.strokeStyle = '#8a8698';
        c.lineWidth = 3;
        c.beginPath();
        c.arc(x, len + 5, 6, -0.4, Math.PI * 1.4);
        c.stroke();
      }
    }
    void variant;
  },
};

export const EXTRA_PLANTS: Record<string, PlantDef> = {
  fernclump: { draw: fernclump, near: 1.4, decor: [22, 32] },
  mudbubble: { draw: mudbubble, near: 1, decor: [10, 14] },
  pitcher: { draw: pitcher, near: 1.5, decor: [30, 40] },
  pegs: { draw: pegs, near: 1.5, decor: [24, 34] },
  kneeroot: { draw: kneeroot, near: 1.4, decor: [24, 34] },
  bogfern: { draw: bogfern, near: 1.4, decor: [26, 36] },
  reedclump: { draw: reedclump, near: 1.5, decor: [26, 40] },
  nipa: { draw: nipa, near: 1.5, decor: [26, 36] },
  hyacinth: { draw: hyacinth, near: 1.3, decor: [20, 28] },
  proproot: { draw: proproot, near: 1.4, decor: [28, 38] },
  driftwood: { draw: driftwood, near: 1.2, decor: [14, 22] },
  crocnest: { draw: crocnest, near: 1.3, decor: [18, 26] },
  birdnest: { draw: birdnest, near: 1.5, decor: [24, 32] },
  bracket: { draw: bracket, near: 1.4, decor: [28, 38] },
  clawrock: { draw: clawrock, near: 1.4, decor: [22, 30] },
  bones: { draw: bones, near: 1.2, decor: [14, 20] },
  heliconia: { draw: heliconia, near: 1.5, decor: [30, 40] },
  orchidclump: { draw: orchidclump, near: 1.5, decor: [28, 38] },
  bromrosette: { draw: bromrosette, near: 1.2, decor: [20, 28] },
  orbweb: { draw: orbweb, near: 1.5, decor: [26, 34] },
  cocoon: { draw: cocoon, near: 1.4, decor: [22, 30] },
  idolhead: { draw: idolhead, near: 1.4, decor: [26, 34] },
  blockpile: { draw: blockpile, near: 1.4, decor: [28, 38] },
  figroot: { draw: figroot, near: 1.5, decor: [28, 38] },
  ohia: { draw: ohia, near: 1.5, decor: [34, 44] },
  steamvent: { draw: steamvent, near: 1.4, decor: [24, 32] },
  lavafern: { draw: lavafern, near: 1.4, decor: [26, 34] },
  lichenrock: { draw: lichenrock, near: 1.4, decor: [20, 28] },
  stump: { draw: stump, near: 1.5, decor: [26, 34] },
  stakes: { draw: stakes, near: 1.5, decor: [28, 38] },
  logpile: { draw: logpile, near: 1.4, decor: [26, 34] },
  banner: { draw: banner, near: 1.5, decor: [30, 38] },
  campfire: { draw: campfire, near: 1.3, decor: [22, 28] },
  snakeskin: { draw: snakeskin, near: 1.2, decor: [14, 20] },
  hollowlog: { draw: hollowlog, near: 1.4, decor: [26, 34] },
  slaterock: { draw: slaterock, near: 1.4, decor: [22, 32] },
  wiregrass: { draw: wiregrass, near: 1.4, decor: [22, 32] },
  puddle: { draw: puddle, near: 1, decor: [16, 24] },
};

export { lighten };
