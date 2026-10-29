/**
 * terrain — the playfield art: outlined, textured platforms, trees, vines and water.
 *
 * Backdrops (scenery.ts) are soft and unoutlined; everything the player can touch gets a
 * dark outline, a bright top edge and real texture so it always reads against the scene.
 */
import type { Platform, Vine, TreeStructure } from './types.ts';
import {
  rng, tone, mix, lighten, darken, rgba, drawCrown, drawFrond, drawGrass, drawFlower, drawMushroom,
  type RNG, type Tone,
} from './artKit.ts';
import { lookFor, type Look } from './scenery.ts';
import { getSoil, capTransform } from './soil.ts';
import { isRich } from './rainforest.ts';
import { paintDecorAt } from './envKit.ts';
import { drawGroundFlora, groundFlora } from './paintedScenery.ts';
import { polishEnabled, polishTier, rigFor, type Rig } from './polish.ts';
import { getSceneSeed } from './sceneSeed.ts';
import { fillCapWindy, windShear, lightBody, dapples, surfaceRoots, restShadow, liveBlades, soilGlints } from './terrainPolish.ts';
import { planStage, baseLook, VARIANTS, type StagePlan, type ThinPlan } from './platformPlan.ts';
import { drawThin } from './platformArt.ts';
import { drawRaftLive, shakeOffset } from './spanArt.ts';
import { drawBounce } from './bounceArt.ts';
import './shelfArt.ts';
import './worldLedges.ts';
import { drawGroundBody, drawGroundCap } from './groundArt.ts';
import { bankPainted, drawSwingLianaArt, paintedKitEnabled } from './protoArt.ts';
import { drawSilkStrand } from './w5Look.ts';
import { drawStep, drawPillar } from './columnArt.ts';
import { drawBadWater } from './badWaterArt.ts';

/** worlds painted with the new baked ground (grown world by world) */
let curWorld = 1;
/** the polish rig for this frame's world (null when the prototype switch is off), and the x range being drawn */
let curRig: Rig | null = null;
let curL = 0;
let curR = 0;
const RICH_GROUND = (_look: Look) => isRich(curWorld);

interface Cam {
  x: number;
  y: number;
  viewportWidth: number;
  viewportHeight: number;
}

const LW = 3; // outline weight

function stroked(ctx: CanvasRenderingContext2D, fill: CanvasGradient | CanvasPattern | string, outline: string, lw = LW) {
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = outline;
  ctx.lineWidth = lw;
  ctx.lineJoin = 'round';
  ctx.stroke();
}

// ───────────────────────────── earth platforms ─────────────────────────────

/** Underside of a floating island: flat top, tapered, lobed belly. */
function islandPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, depth: number, lobes: number, seed: number) {
  const pts: Array<[number, number]> = [];
  const N = Math.max(10, Math.round(w / 18));
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const taper = 1 - Math.pow(Math.abs(2 * u - 1), 2.4);
    const lobe = Math.sin(u * Math.PI * lobes + seed) * 0.09;
    pts.push([x + 3 + u * (w - 6), y + 12 + (depth - 12) * Math.max(0.02, taper + lobe * taper)]);
  }
  ctx.beginPath();
  ctx.moveTo(x + 3, y + 8);
  ctx.lineTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) {
    const [px, py] = pts[i - 1];
    const [cx, cy] = pts[i];
    ctx.quadraticCurveTo(px, py, (px + cx) / 2, (py + cy) / 2);
  }
  ctx.lineTo(x + w - 3, y + 8);
  ctx.closePath();
}

function capPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, capH: number, r: RNG) {
  ctx.beginPath();
  ctx.moveTo(x - 6, y + capH * 0.55);
  ctx.quadraticCurveTo(x - 7, y - 2, x + 8, y - 3);
  ctx.lineTo(x + w - 8, y - 3);
  ctx.quadraticCurveTo(x + w + 7, y - 2, x + w + 6, y + capH * 0.55);
  const n = Math.max(3, Math.round((w + 12) / 22));
  const seg = (w + 12) / n;
  for (let i = 0; i < n; i++) {
    const x1 = x + w + 6 - i * seg;
    const x0 = x1 - seg;
    const d = capH * 0.55 + (r() > 0.55 ? 9 + r() * 12 : 3 + r() * 5);
    ctx.quadraticCurveTo(x1 - seg * 0.08, y + capH * 0.55 + d * 0.9, x1 - seg * 0.5, y + d);
    ctx.quadraticCurveTo(x0 + seg * 0.08, y + capH * 0.55 + d * 0.9, x0, y + capH * 0.55);
  }
  ctx.closePath();
}

function stone(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, st: Tone, outline: string, rot = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  const g = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
  g.addColorStop(0, st.light);
  g.addColorStop(0.55, st.mid);
  g.addColorStop(1, st.dark);
  ctx.beginPath();
  ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
  stroked(ctx, g, rgba(outline, 0.75), 2);
  ctx.fillStyle = rgba('#ffffff', 0.4);
  ctx.beginPath();
  ctx.ellipse(-w * 0.17, -h * 0.2, w * 0.17, h * 0.1, -0.4, 0, Math.PI * 2);
  ctx.fill();
  if (curRig) {
    // the sun-side edge catches the world's light; the far side sinks into shade
    const sgn = curRig.lx > 0 ? 1 : -1;
    ctx.lineCap = 'round';
    ctx.strokeStyle = rgba(curRig.rim, 0.75);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, w / 2 - 1.5, h / 2 - 1.5, 0, sgn > 0 ? -1.9 : Math.PI - 0.1, sgn > 0 ? -0.2 : Math.PI + 1.7);
    ctx.stroke();
    ctx.fillStyle = 'rgba(6,4,16,0.22)';
    ctx.beginPath();
    ctx.ellipse(-sgn * w * 0.12, h * 0.18, w * 0.36, h * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function brickFill(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, look: Look, r: RNG) {
  const g = look.ground;
  const bh = 20;
  for (let row = 0, yy = y; yy < y + h; row++, yy += bh) {
    const bw = 44 + (row % 3) * 8;
    for (let xx = x - (row % 2 ? bw / 2 : 0); xx < x + w; xx += bw) {
      const v = r();
      ctx.fillStyle = mix(g.dirt, v > 0.5 ? g.stone : g.dirtDark, 0.12 + v * 0.22);
      ctx.beginPath();
      ctx.roundRect(xx + 1, yy + 1, bw - 2, bh - 2, 4);
      ctx.fill();
      ctx.fillStyle = rgba('#ffffff', 0.13);
      ctx.fillRect(xx + 4, yy + 3, bw - 10, 3);
      ctx.strokeStyle = rgba(g.outline, 0.5);
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }
}

function lavaCracks(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: RNG, time: number) {
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (let i = 0; i < Math.max(2, Math.floor(w / 90)); i++) {
    let cx = x + 20 + r() * (w - 40);
    let cy = y + 10 + r() * 14;
    const pulse = 0.65 + 0.35 * Math.sin(time * 2 + i);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    for (let k = 0; k < 4; k++) {
      cx += (r() - 0.5) * 34;
      cy += 12 + r() * 16;
      if (cy > y + h) break;
      ctx.lineTo(cx, cy);
    }
    ctx.strokeStyle = `rgba(255,110,20,${0.35 * pulse})`;
    ctx.lineWidth = 9;
    ctx.stroke();
    ctx.strokeStyle = `rgba(255,${180 + (i % 3) * 20},60,${0.95 * pulse})`;
    ctx.lineWidth = 3;
    ctx.stroke();
  }
  ctx.restore();
}

function earthBody(ctx: CanvasRenderingContext2D, p: Platform, look: Look, time: number, bottom: number, r: RNG, kindOverride?: string) {
  const g = look.ground;
  const isGround = p.height >= 50;
  const x = p.x;
  const y = p.y;
  const w = p.width;
  const depth = isGround ? Math.max(120, bottom - y) : p.height + 24 + r() * 16;
  const lobes = Math.max(1, Math.min(4, Math.round(w / 140)));

  if (isGround) {
    ctx.beginPath();
    ctx.moveTo(x + 4, y + 8);
    ctx.lineTo(x + 2, y + depth);
    ctx.lineTo(x + w - 2, y + depth);
    ctx.lineTo(x + w - 4, y + 8);
    ctx.closePath();
  } else {
    islandPath(ctx, x, y, w, depth, lobes, p.id);
  }
  const rich = RICH_GROUND(look) && !kindOverride;
  const grad = ctx.createLinearGradient(0, y, 0, y + Math.min(depth, 420));
  grad.addColorStop(0, g.dirt);
  grad.addColorStop(0.55, mix(g.dirt, g.dirtDark, 0.55));
  grad.addColorStop(1, g.dirtDark);
  stroked(ctx, rich ? getSoil(ctx, look, curWorld).soil : grad, g.outline, LW);

  // texture, clipped to the body
  ctx.save();
  ctx.clip();
  const st = tone(g.stone);
  const kind = kindOverride ?? g.kind;
  if (rich) {
    // the baked soil is already the texture; add the light and shade that turn the shape
    const ao = ctx.createLinearGradient(0, y, 0, y + 70);
    ao.addColorStop(0, 'rgba(20,8,0,0.5)');
    ao.addColorStop(1, 'rgba(20,8,0,0)');
    ctx.fillStyle = ao;
    ctx.fillRect(x, y, w, 70);
  } else if (kind === 'stone') {
    brickFill(ctx, x, y + 14, w, Math.min(depth, 360), look, r);
  } else {
    // soil strata
    ctx.strokeStyle = rgba(g.outline, 0.2);
    ctx.lineWidth = 2;
    for (let k = 0; k < (isGround ? 6 : 2); k++) {
      const yy = y + 26 + k * 34 + r() * 10;
      ctx.beginPath();
      ctx.moveTo(x, yy);
      for (let xx = x; xx < x + w; xx += 36) ctx.quadraticCurveTo(xx + 18, yy + (r() - 0.5) * 12, xx + 36, yy);
      ctx.stroke();
    }
    // embedded stones
    const rows = isGround ? 4 : 1;
    for (let row = 0; row < rows; row++) {
      const count = Math.max(1, Math.floor(w / (isGround ? 100 : 120)));
      for (let i = 0; i < count; i++) {
        const sx = x + 24 + ((i + r() * 0.6) / count) * (w - 48);
        const sy = y + 30 + row * 58 + r() * 18;
        if (!isGround && sy > y + depth - 20) continue;
        stone(ctx, sx, sy, 20 + r() * 20, 14 + r() * 12, st, g.outline, (r() - 0.5) * 0.7);
      }
    }
    // pebbles + grit
    for (let i = 0; i < w / 9; i++) {
      const px = x + r() * w;
      const py = y + 16 + r() * Math.min(depth - 20, isGround ? 260 : 40);
      ctx.fillStyle = r() > 0.5 ? rgba('#ffffff', 0.22) : rgba(g.outline, 0.3);
      ctx.beginPath();
      ctx.arc(px, py, 1.2 + r() * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    // a root or two
    ctx.strokeStyle = rgba(g.outline, 0.55);
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    for (let i = 0; i < Math.max(1, Math.floor(w / 220)); i++) {
      const rx = x + 40 + r() * (w - 80);
      ctx.beginPath();
      ctx.moveTo(rx, y + 12);
      ctx.bezierCurveTo(rx + 14, y + 40, rx - 16, y + 70, rx + 8, y + 100 + r() * 40);
      ctx.stroke();
    }
  }
  if (kind === 'ash') lavaCracks(ctx, x, y, w, Math.min(depth, 260), r, time);
  // shade the right edge + the underside so the shape turns
  const sh = ctx.createLinearGradient(x, 0, x + w, 0);
  sh.addColorStop(0, 'rgba(255,255,255,0.08)');
  sh.addColorStop(0.7, 'rgba(0,0,0,0)');
  sh.addColorStop(1, 'rgba(0,0,0,0.22)');
  ctx.fillStyle = sh;
  ctx.fillRect(x, y, w, depth);
  if (isGround) {
    const dk = ctx.createLinearGradient(0, y + 160, 0, y + Math.min(depth, 560));
    dk.addColorStop(0, 'rgba(0,0,0,0)');
    dk.addColorStop(1, 'rgba(0,0,0,0.5)');
    ctx.fillStyle = dk;
    ctx.fillRect(x, y + 160, w, depth);
  }
  ctx.restore();

  // re-stroke the outline over the clipped texture
  if (isGround) {
    ctx.beginPath();
    ctx.moveTo(x + 4, y + 8);
    ctx.lineTo(x + 2, y + depth);
    ctx.moveTo(x + w - 4, y + 8);
    ctx.lineTo(x + w - 2, y + depth);
  } else {
    islandPath(ctx, x, y, w, depth, lobes, p.id);
  }
  ctx.strokeStyle = g.outline;
  ctx.lineWidth = LW;
  ctx.stroke();
  return depth;
}

function drawCap(ctx: CanvasRenderingContext2D, p: Platform, look: Look, time: number, r: RNG, capH = 17) {
  const g = look.ground;
  const x = p.x;
  const y = p.y;
  const w = p.width;
  if (RICH_GROUND(look)) {
    // baked strip of layered blades, drips and moss, anchored in world space so neighbours join up
    const cap = getSoil(ctx, look, curWorld).cap;
    cap.setTransform(capTransform(y - 30));
    if (curRig && polishTier() < 1) {
      fillCapWindy(ctx, cap, capTransform(y - 30), x, y, w, curL, curR, time, curRig);
      return;
    }
    ctx.fillStyle = cap;
    ctx.fillRect(x, y - 30, w, 72);
    return;
  }
  capPath(ctx, x, y, w, capH, r);
  const grad = ctx.createLinearGradient(0, y - 4, 0, y + capH + 12);
  grad.addColorStop(0, g.capHi);
  grad.addColorStop(0.35, g.cap);
  grad.addColorStop(1, g.capDark);
  stroked(ctx, grad, mix(g.capDark, g.outline, 0.6), LW);
  // bright lip along the top
  ctx.strokeStyle = rgba(lighten(g.capHi, 0.5), 0.8);
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x + 10, y - 0.5);
  ctx.lineTo(x + w - 10, y - 0.5);
  ctx.stroke();
  // leaf/grass flecks on the cap
  ctx.fillStyle = rgba(g.capDark, 0.5);
  for (let i = 0; i < w / 26; i++) {
    ctx.beginPath();
    ctx.ellipse(x + 8 + r() * (w - 16), y + 5 + r() * 6, 4, 1.6, -0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  // glowing moss for the dark worlds
  if (look.glow && g.kind === 'moss') {
    ctx.fillStyle = rgba(look.glow, 0.7);
    for (let i = 0; i < w / 40; i++) {
      const pulse = 0.5 + 0.5 * Math.sin(time * 2 + i * 1.7);
      ctx.globalAlpha = 0.35 + 0.5 * pulse;
      ctx.beginPath();
      ctx.arc(x + 12 + r() * (w - 24), y + 6 + r() * 5, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

/**
 * Where each growing thing on a platform sits and where in the platform's dice sequence it starts, worked out the first time the platform is
 * drawn. A long ground platform holds hundreds of them (lava ferns alone are dozens of fills each), and almost all are off screen, so after
 * that first pass only the ones near the camera are drawn: the dice are put back to where that item began, so each looks exactly as before.
 */
interface DecorPlan {
  x: number;
  w: number;
  entry: number;
  total: number;
  items: { x: number; d: number }[];
}
const decorPlans = new WeakMap<Platform, DecorPlan>();

function topDecor(ctx: CanvasRenderingContext2D, p: Platform, look: Look, r: RNG, time = 0) {
  const capT = tone(look.ground.cap);
  const isGround = p.height >= 50;
  const step = isGround ? 54 : 46;
  const entry = r.state?.();
  const plan = decorPlans.get(p);
  const draw = (x: number) => {
    const px = x + (r() - 0.5) * 18;
    // polish: everything growing here leans with the wind, about its base
    const sway = curRig && polishTier() < 1 && px > curL - 80 && px < curR + 80;
    if (sway) {
      ctx.save();
      ctx.translate(px, p.y);
      ctx.transform(1, 0, windShear(curRig!, time, px), 1, 0, 0);
      ctx.translate(-px, -p.y);
    }
    topItem(ctx, p, look, r, px, capT);
    if (sway) ctx.restore();
  };
  if (plan && entry !== undefined && plan.entry === entry && plan.x === p.x && plan.w === p.width && r.seek) {
    for (const it of plan.items) {
      if (it.x < curL - 150 || it.x > curR + 150) continue;
      r.seek((entry + it.d) | 0);
      draw(it.x);
    }
    r.seek((entry + plan.total) | 0);
    return;
  }
  const items: { x: number; d: number }[] = [];
  for (let x = p.x + 14; x < p.x + p.width - 12; x += step) {
    if (entry !== undefined) items.push({ x, d: ((r.state!() - entry) | 0) });
    draw(x);
  }
  if (entry !== undefined && r.seek) decorPlans.set(p, { x: p.x, w: p.width, entry, total: (r.state!() - entry) | 0, items });
}

function topItem(ctx: CanvasRenderingContext2D, p: Platform, look: Look, r: RNG, px: number, capT: Tone) {
  {
    if (paintDecorAt(ctx, curWorld, look, px, p.y, r)) return;
    const roll = r();
    if (roll < 0.5) drawGrass(ctx, px, p.y - 2, 13 + r() * 11, capT, r, 5);
    else if (roll < 0.72) {
      // one of Matt's painted flowers for this world, standing on the ground (the little drawn bloom while the art loads)
      const pool = groundFlora(curWorld, 'flower');
      const pick = r();
      if (drawGroundFlora(ctx, 'flower', pool[Math.floor(pick * pool.length) % pool.length], px, p.y + 2, 20 + pick * 6, pick > 0.5)) return;
      ctx.strokeStyle = capT.dark;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(px, p.y - 1);
      ctx.lineTo(px, p.y - 10);
      ctx.stroke();
      drawFlower(ctx, px, p.y - 13, 7 + r() * 3, look.flora[(r() * look.flora.length) | 0], '#fff3a0', r() * 3, 5);
    } else if (roll < 0.86) {
      drawMushroom(ctx, px, p.y - 1, 11 + r() * 6, look.flora[(r() * look.flora.length) | 0], '#ffffff', !!look.glow);
    } else {
      const sw = 14 + r() * 8;
      if (curRig) restShadow(ctx, curRig, px, p.y - 1, sw * 0.6);
      stone(ctx, px, p.y - 6, sw, 9 + r() * 4, tone(look.ground.stone), look.ground.outline);
    }
  }
}

function underHang(ctx: CanvasRenderingContext2D, p: Platform, look: Look, r: RNG, depth: number) {
  const vt = tone(look.vine.main);
  const lf = tone(look.vine.leaf);
  const n = Math.max(2, Math.floor(p.width / 70));
  for (let i = 0; i < n; i++) {
    const u = (i + 0.3 + r() * 0.4) / n;
    const px = p.x + 14 + u * (p.width - 28);
    const taper = 1 - Math.pow(Math.abs(2 * u - 1), 2.4);
    const sy = p.y + 12 + (depth - 12) * Math.max(0.05, taper) - 4;
    const len = 14 + r() * 34;
    ctx.strokeStyle = r() > 0.5 ? look.ground.outline : vt.dark;
    ctx.lineWidth = r() > 0.5 ? 3 : 2.4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(px, sy);
    ctx.quadraticCurveTo(px + (r() - 0.5) * 14, sy + len * 0.5, px + (r() - 0.5) * 8, sy + len);
    ctx.stroke();
    if (len > 26) {
      ctx.fillStyle = lf.mid;
      ctx.strokeStyle = rgba(look.ground.outline, 0.7);
      ctx.lineWidth = 1.6;
      for (const s of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(px + s * 5, sy + len - 2, 3.8, 7.5, s * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }
  }
}

// ───────────────────────────── other platform kinds ─────────────────────────────

function woodTone(look: Look) {
  return tone(mix(look.trunk[0], '#d9a864', 0.35));
}

/** wood grain, knots, nail heads and a little moss — shared by planks, bridges and logs so timber matches the new look */
function woodGrain(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, wd: Tone, r: RNG, vertical = false, mossCol?: string) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  const n = Math.max(2, Math.round((vertical ? w : h) / 4.5));
  ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const u = 0.12 + r() * 0.78;
    ctx.strokeStyle = rgba(wd.deep, 0.18 + r() * 0.22);
    ctx.lineWidth = 0.7 + r() * 0.9;
    ctx.beginPath();
    if (vertical) {
      const xx = x + w * u;
      ctx.moveTo(xx, y);
      ctx.bezierCurveTo(xx + (r() - 0.5) * 4, y + h * 0.33, xx + (r() - 0.5) * 4, y + h * 0.66, xx + (r() - 0.5) * 3, y + h);
    } else {
      const yy = y + h * u;
      ctx.moveTo(x, yy);
      ctx.bezierCurveTo(x + w * 0.33, yy + (r() - 0.5) * 3, x + w * 0.66, yy + (r() - 0.5) * 3, x + w, yy + (r() - 0.5) * 2);
    }
    ctx.stroke();
  }
  // a knot
  if (r() < 0.45) {
    const kx = x + w * (0.25 + r() * 0.5);
    const ky = y + h * (0.3 + r() * 0.4);
    ctx.strokeStyle = rgba(wd.deep, 0.5);
    ctx.lineWidth = 1;
    for (let k = 1; k <= 2; k++) {
      ctx.beginPath();
      ctx.ellipse(kx, ky, (vertical ? 1.6 : 3.2) * k, (vertical ? 3.2 : 1.6) * k, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  // lit top edge
  ctx.fillStyle = rgba(wd.hi, 0.55);
  ctx.fillRect(x, y, w, 1.6);
  ctx.restore();
  if (mossCol && r() < 0.5) {
    ctx.fillStyle = mossCol;
    for (let k = 0; k < 3; k++) {
      ctx.beginPath();
      ctx.ellipse(x + w * (0.2 + r() * 0.6), y + 0.5, 2.6 + r() * 3, 1.5 + r() * 1.2, 0, Math.PI, 0);
      ctx.fill();
    }
  }
}

function nailHeads(ctx: CanvasRenderingContext2D, pts: Array<[number, number]>, ol: string) {
  for (const [nx, ny] of pts) {
    ctx.fillStyle = rgba(ol, 0.8);
    ctx.beginPath();
    ctx.arc(nx, ny, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(nx - 0.8, ny - 0.8, 0.9, 0.9);
  }
}

function drawLog(ctx: CanvasRenderingContext2D, p: Platform, look: Look, r: RNG) {
  const wd = woodTone(look);
  const h = Math.max(22, p.height + 6);
  const y = p.y + 2;
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, wd.light);
  g.addColorStop(0.5, wd.mid);
  g.addColorStop(1, wd.dark);
  ctx.beginPath();
  ctx.roundRect(p.x, y, p.width, h, h / 2.4);
  stroked(ctx, g, look.ground.outline);
  ctx.strokeStyle = rgba(wd.deep, 0.5);
  ctx.lineWidth = 2;
  for (let k = 0; k < 2; k++) {
    const yy = y + h * (0.36 + k * 0.3);
    ctx.beginPath();
    ctx.moveTo(p.x + 14, yy);
    for (let xx = p.x + 14; xx < p.x + p.width - 14; xx += 26) ctx.quadraticCurveTo(xx + 13, yy + (xx % 2 ? 2.5 : -2.5), xx + 26, yy);
    ctx.stroke();
  }
  for (const ex of [p.x + 3, p.x + p.width - 3]) {
    ctx.beginPath();
    ctx.ellipse(ex, y + h / 2, 6.5, h / 2 - 1, 0, 0, Math.PI * 2);
    stroked(ctx, wd.hi, look.ground.outline, 2.4);
    ctx.strokeStyle = rgba(wd.dark, 0.7);
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.ellipse(ex, y + h / 2, 3.2, Math.max(2, h / 2 - 6), 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  // moss blanket on top
  drawCap(ctx, { ...p, y: p.y - 1 }, look, 0, r, 11);
  topDecor(ctx, p, look, r);
  underHang(ctx, { ...p, y: p.y + 2 }, look, r, h + 6);
}


function drawBridge(ctx: CanvasRenderingContext2D, p: Platform, look: Look, time: number, r: RNG) {
  const wd = woodTone(look);
  const ol = look.ground.outline;
  const x0 = p.x;
  const x1 = p.x + p.width;
  const y = p.y;
  const rope = tone(mix(look.trunk[0], '#e2c58a', 0.55));
  ctx.lineCap = 'round';
  const sag = (ax: number, ay: number, bx: number, by: number, drop: number, w: number, col: string) => {
    ctx.strokeStyle = col;
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.quadraticCurveTo((ax + bx) / 2, (ay + by) / 2 + drop, bx, by);
    ctx.stroke();
  };
  // ropes under the planks
  for (const dy of [9, 14]) {
    sag(x0, y + dy, x1, y + dy, 16, 6, ol);
    sag(x0, y + dy, x1, y + dy, 16, 3, rope.mid);
  }
  // planks
  const sway = Math.sin(time * 1.4 + p.id) * 0.6;
  let i = 0;
  for (let x = x0 + 4; x < x1 - 14; x += 23, i++) {
    const w = 20;
    const yy = y + 1 + Math.sin(i * 0.9 + time * 1.2) * 0.4 + sway * 0.2;
    const g = ctx.createLinearGradient(0, yy, 0, yy + 12);
    g.addColorStop(0, i % 2 ? wd.light : wd.hi);
    g.addColorStop(1, i % 2 ? wd.mid : wd.light);
    ctx.beginPath();
    ctx.roundRect(x, yy, w, 12, 3);
    stroked(ctx, g, ol, 2.2);
    woodGrain(ctx, x + 1, yy + 1, w - 2, 10, wd, rng(i * 31 + p.id), false, i % 4 === 1 ? look.ground.capDark : undefined);
    nailHeads(ctx, [[x + 3.5, yy + 6], [x + w - 3.5, yy + 6]], ol);
  }
  // end posts and the handrail
  for (const ex of [x0 + 2, x1 - 2]) {
    const pg = ctx.createLinearGradient(ex - 7, 0, ex + 7, 0);
    pg.addColorStop(0, wd.light);
    pg.addColorStop(1, wd.dark);
    ctx.beginPath();
    ctx.roundRect(ex - 7, y - 50, 14, 64, 5);
    stroked(ctx, pg, ol, 2.6);
    ctx.beginPath();
    ctx.arc(ex, y - 52, 8, 0, Math.PI * 2);
    stroked(ctx, wd.hi, ol, 2.4);
  }
  sag(x0 + 2, y - 44, x1 - 2, y - 44, 18, 6, ol);
  sag(x0 + 2, y - 44, x1 - 2, y - 44, 18, 3, rope.light);
  // hangers
  ctx.strokeStyle = rope.mid;
  ctx.lineWidth = 2.2;
  for (let x = x0 + 60; x < x1 - 40; x += 62) {
    const u = (x - x0) / (x1 - x0);
    const top = y - 44 + 18 * 2 * u * (1 - u) * 1.0;
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, y + 2);
    ctx.stroke();
  }
  void r;
}

function drawSlab(ctx: CanvasRenderingContext2D, p: Platform, look: Look, time: number, r: RNG) {
  const g = look.ground;
  const h = Math.max(26, p.height + 8);
  const st = tone(g.stone);
  ctx.beginPath();
  ctx.roundRect(p.x, p.y + 2, p.width, h, 8);
  const gr = ctx.createLinearGradient(0, p.y, 0, p.y + h);
  gr.addColorStop(0, st.light);
  gr.addColorStop(1, st.dark);
  const rich = RICH_GROUND(look);
  stroked(ctx, rich ? getSoil(ctx, look, curWorld).soil : gr, g.outline);
  ctx.save();
  ctx.clip();
  if (rich) {
    const ao = ctx.createLinearGradient(0, p.y, 0, p.y + h);
    ao.addColorStop(0, 'rgba(20,8,0,0.4)');
    ao.addColorStop(0.35, 'rgba(20,8,0,0)');
    ao.addColorStop(1, 'rgba(20,8,0,0.35)');
    ctx.fillStyle = ao;
    ctx.fillRect(p.x, p.y, p.width, h + 4);
  } else brickFill(ctx, p.x, p.y + 2, p.width, h, look, r);
  ctx.restore();
  ctx.beginPath();
  ctx.roundRect(p.x, p.y + 2, p.width, h, 8);
  ctx.strokeStyle = g.outline;
  ctx.lineWidth = LW;
  ctx.stroke();
  drawCap(ctx, { ...p, y: p.y }, look, time, r, 12);
  topDecor(ctx, p, look, r);
  underHang(ctx, { ...p, y: p.y + 2 }, look, r, h + 8);
}

function drawPlanks(ctx: CanvasRenderingContext2D, p: Platform, look: Look, r: RNG) {
  const wd = woodTone(look);
  const n = Math.max(3, Math.round(p.width / 30));
  const pw = p.width / n;
  const shake = p.fragileTimer && p.fragileTimer > 0 ? 1 : 0;
  for (let i = 0; i < n; i++) {
    const jx = shake * (r() - 0.5) * 4;
    const jy = shake * (r() - 0.5) * 4 + (i % 2) * 1.5;
    const x = p.x + i * pw + 1 + jx;
    const g = ctx.createLinearGradient(0, p.y, 0, p.y + p.height);
    g.addColorStop(0, i % 2 ? wd.light : wd.hi);
    g.addColorStop(1, wd.dark);
    ctx.beginPath();
    ctx.roundRect(x, p.y + jy, pw - 2, p.height + 2, 4);
    stroked(ctx, g, look.ground.outline, 2.6);
    // grain, knots, moss and nails
    woodGrain(ctx, x + 1, p.y + jy + 1, pw - 4, p.height, wd, rng(i * 53 + p.id), true, i % 3 === 0 ? look.ground.capDark : undefined);
    nailHeads(ctx, [[x + pw / 2 - 1, p.y + jy + 5], [x + pw / 2 - 1, p.y + jy + p.height - 3]], look.ground.outline);
    // splintered ends
    if (i % 2 === 0) {
      ctx.fillStyle = rgba(wd.dark, 0.9);
      ctx.beginPath();
      ctx.moveTo(x + 2, p.y + jy + p.height + 2);
      ctx.lineTo(x + pw * 0.3, p.y + jy + p.height + 8);
      ctx.lineTo(x + pw * 0.55, p.y + jy + p.height + 2);
      ctx.fill();
    }
  }
  // frayed ropes: this one will not hold
  ctx.strokeStyle = look.ground.outline;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  for (const rx of [p.x + 8, p.x + p.width - 8]) {
    ctx.beginPath();
    ctx.moveTo(rx, p.y + p.height);
    ctx.quadraticCurveTo(rx + 3, p.y + p.height + 12, rx - 2, p.y + p.height + 20);
    ctx.stroke();
  }
  // crack lines
  ctx.strokeStyle = rgba('#000', 0.45);
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(p.x + p.width * 0.3, p.y + 2);
  ctx.lineTo(p.x + p.width * 0.36, p.y + p.height * 0.5);
  ctx.lineTo(p.x + p.width * 0.3, p.y + p.height);
  ctx.moveTo(p.x + p.width * 0.7, p.y + 2);
  ctx.lineTo(p.x + p.width * 0.64, p.y + p.height * 0.6);
  ctx.stroke();
}

function drawRaft(ctx: CanvasRenderingContext2D, p: Platform, look: Look, time: number, r: RNG) {
  const wd = woodTone(look);
  const accent = look.glow ?? look.flora[0];
  const g = ctx.createLinearGradient(0, p.y, 0, p.y + p.height);
  g.addColorStop(0, wd.hi);
  g.addColorStop(1, wd.dark);
  ctx.beginPath();
  ctx.roundRect(p.x, p.y, p.width, p.height + 4, 9);
  stroked(ctx, g, look.ground.outline);
  // vine-wrapped trim in the accent colour
  ctx.strokeStyle = accent;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(p.x + 10, p.y + p.height * 0.62);
  ctx.lineTo(p.x + p.width - 10, p.y + p.height * 0.62);
  ctx.stroke();
  // direction chevrons
  const pulse = 0.5 + 0.5 * Math.sin(time * 3);
  ctx.strokeStyle = rgba(accent, 0.55 + pulse * 0.4);
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const cx = p.x + p.width / 2;
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(cx + s * 12, p.y + 6);
    ctx.lineTo(cx + s * 20, p.y + p.height * 0.4);
    ctx.lineTo(cx + s * 12, p.y + p.height * 0.75);
    ctx.stroke();
  }
  // lantern pods at each end
  for (const ex of [p.x + 8, p.x + p.width - 8]) {
    const gl = ctx.createRadialGradient(ex, p.y + p.height + 4, 0, ex, p.y + p.height + 4, 20);
    gl.addColorStop(0, rgba(accent, 0.9));
    gl.addColorStop(1, rgba(accent, 0));
    ctx.fillStyle = gl;
    ctx.fillRect(ex - 20, p.y + p.height - 16, 40, 40);
    ctx.beginPath();
    ctx.arc(ex, p.y + p.height + 5, 5.5, 0, Math.PI * 2);
    stroked(ctx, lighten(accent, 0.45), look.ground.outline, 2);
  }
  // little leaf wings
  const lf = tone(look.vine.leaf);
  for (const s of [-1, 1]) {
    ctx.save();
    ctx.translate(s < 0 ? p.x : p.x + p.width, p.y + p.height * 0.3);
    ctx.rotate(s * (-0.5 + Math.sin(time * 4) * 0.1));
    ctx.beginPath();
    ctx.ellipse(s * 12, 0, 13, 5.5, 0, 0, Math.PI * 2);
    stroked(ctx, lf.light, look.ground.outline, 2);
    ctx.restore();
  }
  void r;
}

function drawBouncer(ctx: CanvasRenderingContext2D, p: Platform, look: Look, time: number, cam: Cam) {
  const sx = p.x + p.width * 0.5;
  const topY = p.y + p.height * 0.5;
  const botY = cam.y + cam.viewportHeight + 60;
  const sw = p.width * 0.3;
  const ol = look.ground.outline;
  // stalk
  const sg = ctx.createLinearGradient(sx - sw, 0, sx + sw, 0);
  sg.addColorStop(0, '#fff3d6');
  sg.addColorStop(0.6, '#f0dcb0');
  sg.addColorStop(1, '#c9ab7a');
  ctx.beginPath();
  ctx.moveTo(sx - sw * 0.8, topY);
  ctx.quadraticCurveTo(sx - sw * 0.7, (topY + botY) * 0.5, sx - sw * 1.7, botY);
  ctx.lineTo(sx + sw * 1.7, botY);
  ctx.quadraticCurveTo(sx + sw * 0.7, (topY + botY) * 0.5, sx + sw * 0.8, topY);
  ctx.closePath();
  stroked(ctx, sg, ol);
  ctx.strokeStyle = rgba('#8a6a3a', 0.3);
  ctx.lineWidth = 1.8;
  for (let gy = topY + 20; gy < botY; gy += 36) {
    ctx.beginPath();
    ctx.moveTo(sx - sw * 0.6, gy);
    ctx.quadraticCurveTo(sx, gy + 6, sx + sw * 0.6, gy);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.ellipse(sx, topY + 8, sw * 1.3, 6, 0, 0, Math.PI * 2);
  stroked(ctx, '#f6e6bd', ol, 2.4);

  const squash = 1 + Math.sin(time * 3) * 0.06;
  ctx.save();
  ctx.translate(sx, p.y + p.height * 0.55);
  ctx.scale(1, squash);
  const capC = look.flora[0];
  const ct = tone(capC, '#3a0a30');
  const rad = p.width * 0.5;
  const cg = ctx.createRadialGradient(-rad * 0.3, -p.height * 0.7, 3, 0, 0, rad * 1.05);
  cg.addColorStop(0, ct.hi);
  cg.addColorStop(0.35, ct.light);
  cg.addColorStop(0.8, ct.mid);
  cg.addColorStop(1, ct.dark);
  ctx.beginPath();
  ctx.moveTo(-rad, 4);
  ctx.bezierCurveTo(-rad, -p.height * 1.25, rad, -p.height * 1.25, rad, 4);
  ctx.quadraticCurveTo(0, 12, -rad, 4);
  ctx.closePath();
  stroked(ctx, cg, ol, 3.2);
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  for (const [dx, dy, dr] of [[-0.55, -0.45, 0.1], [0.05, -0.8, 0.13], [0.5, -0.4, 0.09], [-0.12, -0.3, 0.07]]) {
    ctx.beginPath();
    ctx.ellipse(dx * rad, dy * p.height, dr * rad, dr * rad * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  // up-arrow hint
  ctx.fillStyle = rgba('#ffffff', 0.55 + 0.35 * Math.sin(time * 4));
  ctx.beginPath();
  ctx.moveTo(sx, p.y - 22);
  ctx.lineTo(sx - 7, p.y - 12);
  ctx.lineTo(sx + 7, p.y - 12);
  ctx.closePath();
  ctx.fill();
}

// ───────────────────────────── trees ─────────────────────────────

function barkTrunk(ctx: CanvasRenderingContext2D, t: TreeStructure, look: Look, r: RNG, narrow = 1) {
  const { x, groundY, topY } = t;
  const w = t.trunkWidth * narrow;
  const lean = (r() - 0.5) * w * 0.6;
  const ol = look.ground.outline;
  const tt = tone(look.trunk[0]);
  const g = ctx.createLinearGradient(x - w, 0, x + w, 0);
  g.addColorStop(0, tt.hi);
  g.addColorStop(0.3, look.trunk[0]);
  g.addColorStop(0.75, look.trunk[1]);
  g.addColorStop(1, tt.deep);
  ctx.beginPath();
  ctx.moveTo(x - w * 1.5, groundY + 4);
  ctx.bezierCurveTo(x - w * 0.55, groundY - 40, x - w * 0.48, groundY - 130, x - w * 0.46 + lean * 0.3, groundY - (groundY - topY) * 0.5);
  ctx.bezierCurveTo(x - w * 0.42 + lean, topY + 90, x - w * 0.5 + lean, topY + 30, x - w * 0.48 + lean, topY);
  ctx.lineTo(x + w * 0.48 + lean, topY);
  ctx.bezierCurveTo(x + w * 0.5 + lean, topY + 30, x + w * 0.42 + lean, topY + 90, x + w * 0.46 + lean * 0.3, groundY - (groundY - topY) * 0.5);
  ctx.bezierCurveTo(x + w * 0.48, groundY - 130, x + w * 0.55, groundY - 40, x + w * 1.5, groundY + 4);
  ctx.closePath();
  stroked(ctx, g, ol, 3.4);
  ctx.save();
  ctx.clip();
  // bark furrows
  ctx.strokeStyle = rgba(tt.deep, 0.5);
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  for (let i = -2; i <= 2; i++) {
    const o = i * w * 0.2;
    ctx.beginPath();
    ctx.moveTo(x + o * 1.3, groundY);
    ctx.bezierCurveTo(x + o + 6, groundY - 160, x + o - 6, topY + 220, x + o * 0.7 + lean, topY);
    ctx.stroke();
  }
  // moss patches + knots
  ctx.fillStyle = rgba(look.ground.cap, 0.65);
  for (let i = 0; i < 4; i++) {
    const yy = topY + 60 + r() * (groundY - topY - 140);
    ctx.beginPath();
    ctx.ellipse(x - w * 0.3 + r() * w * 0.5, yy, w * 0.26, 9, 0.1, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = rgba(tt.deep, 0.7);
  ctx.beginPath();
  ctx.ellipse(x + w * 0.1, groundY - (groundY - topY) * 0.38, 6, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  // sun side highlight
  ctx.fillStyle = rgba('#fff3d0', 0.18);
  ctx.fillRect(x - w * 0.5, topY, w * 0.16, groundY - topY);
  ctx.restore();
  ctx.beginPath();
  ctx.moveTo(x - w * 1.5, groundY + 4);
  ctx.bezierCurveTo(x - w * 0.55, groundY - 40, x - w * 0.48, groundY - 130, x - w * 0.46 + lean * 0.3, groundY - (groundY - topY) * 0.5);
  ctx.bezierCurveTo(x - w * 0.42 + lean, topY + 90, x - w * 0.5 + lean, topY + 30, x - w * 0.48 + lean, topY);
  ctx.moveTo(x + w * 0.48 + lean, topY);
  ctx.bezierCurveTo(x + w * 0.5 + lean, topY + 30, x + w * 0.42 + lean, topY + 90, x + w * 0.46 + lean * 0.3, groundY - (groundY - topY) * 0.5);
  ctx.bezierCurveTo(x + w * 0.48, groundY - 130, x + w * 0.55, groundY - 40, x + w * 1.5, groundY + 4);
  ctx.strokeStyle = ol;
  ctx.lineWidth = 3.4;
  ctx.stroke();
  return lean;
}

function drawGameTree(ctx: CanvasRenderingContext2D, t: TreeStructure, look: Look, time: number) {
  const r = rng(Math.abs(t.id) * 131 + 17);
  const kind = look.trees[Math.abs(t.id) % look.trees.length];
  const cr = Math.max(110, t.canopyRadius);
  const crowns = look.crowns.map((c) => tone(c));
  const sway = Math.sin(time * 0.9 + t.id) * 3;

  switch (kind) {
    case 'palm': {
      const w = t.trunkWidth * 0.5;
      const lean = (r() - 0.5) * 90;
      ctx.lineCap = 'round';
      ctx.strokeStyle = look.ground.outline;
      ctx.lineWidth = w + 7;
      ctx.beginPath();
      ctx.moveTo(t.x, t.groundY);
      ctx.quadraticCurveTo(t.x + lean * 0.1, (t.groundY + t.topY) / 2, t.x + lean, t.topY);
      ctx.stroke();
      const g = ctx.createLinearGradient(t.x - w, 0, t.x + w, 0);
      g.addColorStop(0, lighten(look.trunk[0], 0.25));
      g.addColorStop(1, look.trunk[1]);
      ctx.strokeStyle = g;
      ctx.lineWidth = w;
      ctx.stroke();
      ctx.strokeStyle = rgba(look.trunk[1], 0.6);
      ctx.lineWidth = 2.4;
      for (let y = t.topY + 24; y < t.groundY - 10; y += 30) {
        const u = (y - t.topY) / (t.groundY - t.topY);
        const px = t.x + lean * (1 - u) * (1 - u);
        ctx.beginPath();
        ctx.moveTo(px - w * 0.5, y);
        ctx.lineTo(px + w * 0.5, y + 4);
        ctx.stroke();
      }
      const ct = crowns[0];
      for (let f = 0; f < 9; f++) drawFrond(ctx, t.x + lean, t.topY, cr * (0.85 + r() * 0.2), -Math.PI / 2 + (f - 4) * 0.5 + sway * 0.01, 30 + Math.abs(f - 4) * 10, ct, 13, 0.4);
      ctx.fillStyle = look.trunk[1];
      for (let c = 0; c < 3; c++) {
        ctx.beginPath();
        ctx.arc(t.x + lean - 10 + c * 10, t.topY + 16, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = look.ground.outline;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      break;
    }
    case 'shroom': {
      const w = t.trunkWidth * 0.55;
      const sg = ctx.createLinearGradient(t.x - w, 0, t.x + w, 0);
      sg.addColorStop(0, '#fff6dc');
      sg.addColorStop(0.7, '#e8d3a6');
      sg.addColorStop(1, '#b9a074');
      ctx.beginPath();
      ctx.moveTo(t.x - w * 1.5, t.groundY + 4);
      ctx.quadraticCurveTo(t.x - w * 0.5, (t.groundY + t.topY) / 2, t.x - w * 0.55, t.topY);
      ctx.lineTo(t.x + w * 0.55, t.topY);
      ctx.quadraticCurveTo(t.x + w * 0.5, (t.groundY + t.topY) / 2, t.x + w * 1.5, t.groundY + 4);
      ctx.closePath();
      stroked(ctx, sg, look.ground.outline, 3.4);
      const ct = tone(look.flora[Math.abs(t.id) % look.flora.length], '#2a0a40');
      if (look.glow) {
        const gg = ctx.createRadialGradient(t.x, t.topY, 10, t.x, t.topY, cr * 1.5);
        gg.addColorStop(0, rgba(look.glow, 0.4));
        gg.addColorStop(1, rgba(look.glow, 0));
        ctx.fillStyle = gg;
        ctx.fillRect(t.x - cr * 1.6, t.topY - cr * 1.6, cr * 3.2, cr * 3.2);
      }
      const cg = ctx.createRadialGradient(t.x - cr * 0.3, t.topY - cr * 0.5, 10, t.x, t.topY, cr * 1.2);
      cg.addColorStop(0, ct.hi);
      cg.addColorStop(0.4, ct.light);
      cg.addColorStop(1, ct.dark);
      ctx.beginPath();
      ctx.ellipse(t.x, t.topY + 6, cr, cr * 0.58, 0, Math.PI, 0);
      ctx.quadraticCurveTo(t.x, t.topY + cr * 0.2, t.x - cr, t.topY + 6);
      stroked(ctx, cg, look.ground.outline, 3.4);
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      for (let s = 0; s < 6; s++) {
        ctx.beginPath();
        ctx.ellipse(t.x + (r() - 0.5) * cr * 1.5, t.topY - cr * (0.1 + r() * 0.34), 8 + r() * 8, 6 + r() * 5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'dead': {
      const lean = barkTrunk(ctx, t, look, r, 0.8);
      const branch = (bx: number, by: number, ang: number, len: number, wd: number, depth: number) => {
        const ex = bx + Math.cos(ang) * len;
        const ey = by + Math.sin(ang) * len;
        for (const [col, lw] of [[look.ground.outline, wd + 5], [look.trunk[1], wd]] as const) {
          ctx.strokeStyle = col;
          ctx.lineWidth = lw;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(bx, by);
          ctx.quadraticCurveTo((bx + ex) / 2 + 8, (by + ey) / 2, ex, ey);
          ctx.stroke();
        }
        if (depth > 0) {
          branch(ex, ey, ang - 0.5 - r() * 0.3, len * 0.72, wd * 0.7, depth - 1);
          branch(ex, ey, ang + 0.5 + r() * 0.3, len * 0.72, wd * 0.7, depth - 1);
        } else {
          drawCrown(ctx, ex, ey, 44, 30, crowns[(r() * crowns.length) | 0], r, 6, false);
        }
      };
      branch(t.x + lean, t.topY + 8, -Math.PI / 2 - 0.25, 120, 14, 3);
      branch(t.x + lean, t.topY + 80, -Math.PI / 2 + 0.95, 100, 11, 2);
      branch(t.x + lean, t.topY + 120, -Math.PI / 2 - 1.0, 100, 11, 2);
      break;
    }
    case 'umbrella': {
      const lean = barkTrunk(ctx, t, look, r, 0.8);
      for (let layer = 0; layer < 3; layer++) {
        const ct = crowns[(layer + Math.abs(t.id)) % crowns.length];
        drawCrown(ctx, t.x + lean + sway * (layer + 1) * 0.3, t.topY - layer * 34, cr * (1.25 - layer * 0.22), cr * 0.34, ct, r, 14);
      }
      break;
    }
    case 'willow': {
      const lean = barkTrunk(ctx, t, look, r, 0.95);
      const ct = crowns[Math.abs(t.id) % crowns.length];
      drawCrown(ctx, t.x + lean, t.topY - 10, cr, cr * 0.6, ct, r, 12);
      for (let i = 0; i < 14; i++) {
        const sx = t.x + lean - cr * 0.85 + (i / 13) * cr * 1.7;
        const sw = Math.sin(time * 1.2 + i) * 4;
        ctx.strokeStyle = ct.dark;
        ctx.lineWidth = 2.6;
        ctx.lineCap = 'round';
        const len = 90 + r() * 120;
        ctx.beginPath();
        ctx.moveTo(sx, t.topY + 20);
        ctx.quadraticCurveTo(sx + sw, t.topY + 20 + len * 0.5, sx + sw * 1.4, t.topY + 20 + len);
        ctx.stroke();
        ctx.fillStyle = ct.light;
        for (let k = 1; k < 5; k++) {
          ctx.beginPath();
          ctx.ellipse(sx + sw * (k / 4), t.topY + 20 + (len * k) / 5, 8, 3.4, 0.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    }
    default: {
      // 'jungle'
      const lean = barkTrunk(ctx, t, look, r, 1);
      // limbs
      for (const s of [-1, 1]) {
        const ly = t.topY + 70 + r() * 60;
        for (const [col, lw] of [[look.ground.outline, t.trunkWidth * 0.3 + 6], [look.trunk[0], t.trunkWidth * 0.3]] as const) {
          ctx.strokeStyle = col;
          ctx.lineWidth = lw;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(t.x + lean * 0.8, ly + 60);
          ctx.quadraticCurveTo(t.x + lean + s * cr * 0.4, ly + 10, t.x + lean + s * cr * 0.78, ly - 30);
          ctx.stroke();
        }
        drawCrown(ctx, t.x + lean + s * cr * 0.78 + sway, ly - 40, cr * 0.5, cr * 0.34, crowns[(r() * crowns.length) | 0], r, 9);
      }
      drawCrown(ctx, t.x + lean + sway * 0.6, t.topY - 20, cr, cr * 0.62, crowns[Math.abs(t.id) % crowns.length], r, 13);
      drawCrown(ctx, t.x + lean - cr * 0.3 + sway, t.topY - 50, cr * 0.6, cr * 0.4, crowns[(Math.abs(t.id) + 2) % crowns.length], r, 9);
      for (let i = 0; i < 4; i++) {
        const lx = t.x + lean + (r() - 0.5) * cr * 1.5;
        ctx.strokeStyle = tone(look.vine.main).dark;
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.moveTo(lx, t.topY + 10);
        ctx.quadraticCurveTo(lx + 8, t.topY + 70, lx - 3, t.topY + 90 + r() * 90);
        ctx.stroke();
      }
    }
  }
}

// ───────────────────────────── vines ─────────────────────────────

function leafShape(ctx: CanvasRenderingContext2D, x: number, y: number, len: number, wid: number, rot: number, fill: string, ol: string, lw = 2) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(len * 0.4, -wid, len, 0);
  ctx.quadraticCurveTo(len * 0.4, wid, 0, 0);
  stroked(ctx, fill, ol, lw);
  ctx.strokeStyle = rgba(ol, 0.4);
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(len * 0.08, 0);
  ctx.lineTo(len * 0.82, 0);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.beginPath();
  ctx.ellipse(len * 0.42, -wid * 0.35, len * 0.22, wid * 0.14, -0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Five-lobed leaf cluster (schefflera-style) from the climbing-vine reference. */
function palmate(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rot: number, t: Tone, ol: string) {
  for (let i = 0; i < 5; i++) {
    const a = rot + (i - 2) * 0.62;
    const l = size * (i === 2 ? 1 : i === 1 || i === 3 ? 0.88 : 0.7);
    leafShape(ctx, x, y, l, l * 0.34, a, i % 2 ? t.mid : t.light, ol, 2);
  }
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, Math.PI * 2);
  stroked(ctx, t.dark, ol, 1.6);
}

function tendril(ctx: CanvasRenderingContext2D, x: number, y: number, dir: number, size: number, col: string, ol: string) {
  for (const [c, lw] of [[ol, 4.2], [col, 2.2]] as const) {
    ctx.strokeStyle = c;
    ctx.lineWidth = lw;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x + dir * size, y - size * 0.2, x + dir * size * 1.1, y - size * 1.1, x + dir * size * 0.4, y - size * 0.9);
    ctx.bezierCurveTo(x + dir * size * 0.1, y - size * 0.8, x + dir * size * 0.3, y - size * 0.45, x + dir * size * 0.55, y - size * 0.55);
    ctx.stroke();
  }
}

function drawGameVine(ctx: CanvasRenderingContext2D, v: Vine, look: Look, time: number) {
  const len = v.bottomY - v.topY;
  const swinging = v.isSwingingVine && v.swingAngle !== undefined;
  const ang = swinging ? v.swingAngle || 0 : Math.sin(time * v.swaySpeed + v.swayPhase) * 0.1;
  const tipX = v.x + Math.sin(ang) * len;
  const tipY = v.topY + Math.cos(ang) * len;
  const midX = (v.x + tipX) * 0.5 + Math.sin(ang * 0.5) * 12;
  const midY = (v.topY + tipY) * 0.5;
  // World 5's silk lines swing like lianas and are drawn as silk (w5Look.ts)
  if (v.silk) {
    drawSilkStrand(ctx, v, ang, time);
    return;
  }
  // the world's painted liana when its kit has loaded (the swinging ones; a climb vine keeps its drawn look on its trunk)
  if (v.vineType === 'swing_liana' && paintedKitEnabled() && drawSwingLianaArt(ctx, v, ang)) return;
  const style = look.glow && Math.abs(v.id) % 5 === 4 ? 3 : Math.abs(v.id) % 3; // 0 twist, 1 liana, 2 leafy, 3 glow
  const ol = look.ground.outline;
  const gl = tone(look.vine.main);
  const lf = tone(look.vine.leaf);
  const r = rng(Math.abs(v.id) * 53 + 7);

  const N = Math.max(16, Math.floor(len / 9));
  const P: Array<{ x: number; y: number; nx: number; ny: number }> = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const x = (1 - u) * (1 - u) * v.x + 2 * (1 - u) * u * midX + u * u * tipX;
    const y = (1 - u) * (1 - u) * v.topY + 2 * (1 - u) * u * midY + u * u * tipY;
    const dx = 2 * (1 - u) * (midX - v.x) + 2 * u * (tipX - midX);
    const dy = 2 * (1 - u) * (midY - v.topY) + 2 * u * (tipY - midY);
    const l = Math.hypot(dx, dy) || 1;
    P.push({ x, y, nx: -dy / l, ny: dx / l });
  }
  const at = (u: number) => P[Math.min(N, Math.max(0, Math.round(u * N)))];

  if (v.vineType === 'swing_liana') {
    // the bough the liana hangs from
    const ar = rng(Math.abs(v.id) * 29 + 3);
    const crowns = look.crowns.map((c) => tone(c));
    ctx.save();
    drawCrown(ctx, v.x, v.topY - 22, 84, 38, crowns[Math.abs(v.id) % crowns.length], ar, 9);
    drawCrown(ctx, v.x - 46, v.topY - 6, 46, 24, crowns[(Math.abs(v.id) + 1) % crowns.length], ar, 6, false);
    ctx.restore();
  }

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // two intertwined strands: back pieces first, then front pieces, so the crossings read
  const strands = (cA: string, cB: string, hi: string, amp: number, width: number, period: number) => {
    const piece = (strand: 0 | 1, i: number, col: string, ow: number, w: number) => {
      const a = P[i];
      const b = P[i + 1];
      const phA = (i / N) * len / period * Math.PI * 2;
      const phB = ((i + 1) / N) * len / period * Math.PI * 2;
      const sg = strand ? -1 : 1;
      ctx.strokeStyle = col;
      ctx.lineWidth = ow;
      ctx.beginPath();
      ctx.moveTo(a.x + a.nx * Math.sin(phA) * amp * sg, a.y + a.ny * Math.sin(phA) * amp * sg);
      ctx.lineTo(b.x + b.nx * Math.sin(phB) * amp * sg, b.y + b.ny * Math.sin(phB) * amp * sg);
      ctx.stroke();
      void w;
    };
    const front = (i: number) => {
      const ph = ((i + 0.5) / N) * len / period * Math.PI * 2;
      return Math.cos(ph) > 0 ? 0 : 1;
    };
    for (const pass of [0, 1] as const) {
      for (let i = 0; i < N; i++) {
        const f = front(i);
        const st = (pass === 0 ? 1 - f : f) as 0 | 1;
        piece(st, i, ol, width + 4, width);
      }
      for (let i = 0; i < N; i++) {
        const f = front(i);
        const st = (pass === 0 ? 1 - f : f) as 0 | 1;
        piece(st, i, st ? cB : cA, width, width);
      }
      if (pass === 1) {
        for (let i = 0; i < N; i++) {
          const f = front(i);
          piece(f as 0 | 1, i, hi, Math.max(1.4, width * 0.28), width);
        }
      }
    }
  };

  // leafy crown where the vine meets its branch
  const crown = (t: Tone, n: number, size: number) => {
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (i - (n - 1) / 2) * 0.55;
      leafShape(ctx, v.x, v.topY + 4, size * (0.8 + r() * 0.35), size * 0.3, a, i % 2 ? t.mid : t.light, ol, 2.2);
    }
  };

  if (style === 1) {
    // thick brown liana with thin hanging strands (reference: twisted woody liana)
    strands('#8a5a34', '#6a4224', '#c08a58', 5.2, 8, 54);
    const hang: Array<[string, number]> = [['#d9a441', 2.4], ['#5f7a34', 2.4], ['#4a2e1e', 2.8]];
    hang.forEach(([c, w], k) => {
      const a = at(0.1 + k * 0.17);
      const b = at(0.34 + k * 0.17);
      const sag = 22 + r() * 22;
      for (const [col, lw] of [[ol, w + 2.4], [c, w]] as const) {
        ctx.strokeStyle = col;
        ctx.lineWidth = lw;
        ctx.beginPath();
        ctx.moveTo(a.x + a.nx * 8, a.y + a.ny * 8);
        ctx.quadraticCurveTo((a.x + b.x) / 2 + a.nx * (14 + sag), (a.y + b.y) / 2 + sag, b.x - b.nx * 6, b.y - b.ny * 6);
        ctx.stroke();
      }
      const m = at(0.22 + k * 0.17);
      leafShape(ctx, m.x + m.nx * 14, m.y + sag * 0.4, 16, 6, 1.1 + k, lf.mid, ol, 1.6);
    });
    for (let i = 1; i < 6; i++) {
      const p = at(i / 6.5);
      const side = i % 2 ? 1 : -1;
      leafShape(ctx, p.x + p.nx * 8 * side, p.y, 20, 7, Math.atan2(p.ny * side, p.nx * side) + ang, i % 2 ? lf.mid : lf.light, ol, 1.8);
    }
    crown(lf, 6, 24);
  } else if (style === 2) {
    // reddish trunk-vine wrapped by a slim green vine, palmate leaf clusters (reference: climbing vine)
    strands('#b0553a', '#4d8a3a', '#e08a68', 4.8, 7.5, 60);
    for (let i = 1; i < 6; i++) {
      const p = at(i / 6.2);
      const side = i % 2 ? 1 : -1;
      palmate(ctx, p.x + p.nx * 9 * side, p.y, 24 + r() * 8, Math.atan2(p.ny * side, p.nx * side) - 0.3 * side + ang * 0.5, i % 2 ? lf : gl, ol);
    }
    tendril(ctx, at(0.55).x + 6, at(0.55).y, 1, 20, gl.mid, ol);
    tendril(ctx, at(0.32).x - 6, at(0.32).y, -1, 18, gl.mid, ol);
    crown(lf, 7, 28);
  } else if (style === 3) {
    // glowing beads for the cave and night worlds
    strands(gl.mid, gl.dark, gl.hi, 4.4, 7, 46);
    const gc = look.glow ?? look.vine.leaf;
    for (let i = 1; i < 8; i++) {
      const p = at(i / 8.5);
      const pulse = 0.5 + 0.5 * Math.sin(time * 3 + i);
      const side = i % 2 ? 1 : -1;
      const g = ctx.createRadialGradient(p.x + p.nx * 9 * side, p.y, 0, p.x + p.nx * 9 * side, p.y, 20);
      g.addColorStop(0, rgba(gc, 0.85 * pulse));
      g.addColorStop(1, rgba(gc, 0));
      ctx.fillStyle = g;
      ctx.fillRect(p.x + p.nx * 9 * side - 20, p.y - 20, 40, 40);
      ctx.beginPath();
      ctx.arc(p.x + p.nx * 9 * side, p.y, 4.6, 0, Math.PI * 2);
      stroked(ctx, lighten(gc, 0.5), ol, 2);
      leafShape(ctx, p.x, p.y, 18, 6, Math.atan2(p.ny * -side, p.nx * -side), lf.mid, ol, 1.6);
    }
    crown(lf, 5, 22);
  } else {
    // outlined twisting green vine with pointed leaves and curls (reference: cartoon twisted vine)
    strands(gl.light, gl.mid, gl.hi, 4.6, 7.5, 44);
    for (let i = 1; i < 9; i++) {
      const p = at(i / 9.5);
      const side = i % 2 ? 1 : -1;
      leafShape(ctx, p.x + p.nx * 6 * side, p.y, 20 + r() * 6, 7.5, Math.atan2(p.ny * side, p.nx * side) - 0.35 * side + ang * 0.4, i % 3 ? lf.mid : lf.light, ol, 1.9);
    }
    tendril(ctx, at(0.45).x + 5, at(0.45).y, 1, 16, gl.mid, ol);
    tendril(ctx, at(0.7).x - 5, at(0.7).y, -1, 14, gl.mid, ol);
    if (i3(v.id)) for (let k = 0; k < 2; k++) drawFlower(ctx, at(0.3 + k * 0.3).x + 11, at(0.3 + k * 0.3).y, 8, look.vine.flower, '#fff3a0', k, 5);
    crown(lf, 5, 24);
  }

  // handle: a fat seed pod at the tip, so grabs read clearly
  ctx.beginPath();
  ctx.arc(tipX, tipY, swinging ? 10 : 7.5, 0, Math.PI * 2);
  stroked(ctx, look.vine.flower, ol, 2.8);
  ctx.fillStyle = 'rgba(255,255,255,0.65)';
  ctx.beginPath();
  ctx.arc(tipX - 2.5, tipY - 2.5, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** the outline of a full-height ground block */
function groundClip(ctx: CanvasRenderingContext2D, p: Platform, depth: number) {
  ctx.beginPath();
  ctx.moveTo(p.x + 4, p.y + 8);
  ctx.lineTo(p.x + 2, p.y + depth);
  ctx.lineTo(p.x + p.width - 2, p.y + depth);
  ctx.lineTo(p.x + p.width - 4, p.y + 8);
  ctx.closePath();
}

function i3(id: number) {
  return Math.abs(id) % 2 === 0;
}

// ───────────────────────────── public ─────────────────────────────

export function renderWorldObjects(
  ctx: CanvasRenderingContext2D,
  worldId: number,
  platforms: Platform[],
  vines: Vine[],
  trees: TreeStructure[],
  cam: Cam,
  time: number
) {
  const look = lookFor(worldId);
  curWorld = worldId;
  const left = cam.x - 160;
  const right = cam.x + cam.viewportWidth + 160;
  curRig = polishEnabled() && polishTier() < 2 ? rigFor(look, worldId, getSceneSeed()) : null;
  curL = left;
  curR = right;
  const bottom = cam.y + cam.viewportHeight + 60;

  for (const t of trees) {
    if (t.x + t.canopyRadius < left || t.x - t.canopyRadius > right) continue;
    ctx.save();
    drawGameTree(ctx, t, look, time);
    ctx.restore();
  }
  for (const v of vines) {
    if (v.x < left || v.x > right) continue;
    drawGameVine(ctx, v, look, time);
  }

  // what every platform is drawn as is planned once per stage (platformPlan): looks and variants, ground treatments, steps, pillars
  const plan = stagePlan(platforms, worldId);
  const bounceBottom = cam.y + cam.viewportHeight + 60;

  // mushrooms first so the ground can cover their stalks
  const ordered = [...platforms].sort((a, b) => (a.type === 'bouncy' ? 0 : 1) - (b.type === 'bouncy' ? 0 : 1));
  for (const p of ordered) {
    if (p.x + p.width < left || p.x > right || p.broken) continue;
    const r = rng(Math.abs(p.id) * 97 + 13);
    ctx.save();
    if (p.type === 'bouncy') {
      const tp = thinPlanFor(plan, p);
      drawBounce(ctx, p, tp.look === 'parasol' || tp.look === 'bloom' ? tp.look : 'toadstool', tp.variant, time, bounceBottom);
    } else if (p.type === 'fragile') {
      const tp = thinPlanFor(plan, p);
      const [dx, dy] = shakeOffset(p, time);
      if (!drawThin(ctx, p, look, worldId, tp, dy, dx)) drawPlanks(ctx, p, look, r);
    } else if (p.type === 'drift' && p.drift) {
      // a log rides between its banks, bobbing; clipped to the river so it slides out from under one bank and under the other
      ctx.beginPath();
      ctx.rect(p.drift.x0, p.y - 80, p.drift.x1 - p.drift.x0, 220);
      ctx.clip();
      const bob = Math.sin(time * 2.1 + p.id * 1.7) * 1.6;
      if (!drawThin(ctx, p, look, worldId, thinPlanFor(plan, p), bob)) drawLog(ctx, { ...p, y: p.y + bob }, look, r);
    } else if (p.type === 'moving') {
      if (drawThin(ctx, p, look, worldId, thinPlanFor(plan, p))) drawRaftLive(ctx, p, look, worldId, time);
      else drawRaft(ctx, p, look, time, r);
    } else if (p.style === 'canopy_bridge') {
      if (!drawThin(ctx, p, look, worldId, thinPlanFor(plan, p))) drawBridge(ctx, p, look, time, r);
    } else if ((p.height >= 50 || p.soil) && bankPainted(p)) {
      // the painted ground covers this bank (protoArt.ts drawBankArt, its face undercut where it drops away): only what grows on top
      // (and nothing on a pit's wall, which stands under a bank)
      if (p.height >= 50) topDecor(ctx, p, look, r, time);
    } else if (p.height >= 50) {
      const gp = curRig ? undefined : plan.ground.get(p);
      if (gp && gp.role === 'ground') {
        drawGroundBody(ctx, p, gp, look, worldId, bottom, left, right);
        drawGroundCap(ctx, p, gp, look, worldId, left, right);
        topDecor(ctx, p, look, r, time);
      } else if (gp && gp.role === 'step') {
        drawStep(ctx, p, gp, look, worldId, bottom);
      } else if (gp && gp.role === 'pillar') {
        drawPillar(ctx, p, gp, look, worldId, bottom);
      } else {
        const depth = earthBody(ctx, p, look, time, bottom, r);
        if (curRig) lightBody(ctx, curRig, look, p, depth, () => groundClip(ctx, p, depth), left, right, time);
        if (curRig) surfaceRoots(ctx, curRig, look, p, left, right);
        drawCap(ctx, p, look, time, r, 18);
        if (curRig) {
          liveBlades(ctx, curRig, look, p, left, right, time, polishTier() < 1);
          soilGlints(ctx, curRig, p, depth, left, right, time);
        }
        topDecor(ctx, p, look, r, time);
        if (curRig) dapples(ctx, curRig, p, left, right, time);
      }
    } else {
      const tp = thinPlanFor(plan, p);
      if (tp.look === 'island' || !drawThin(ctx, p, look, worldId, tp)) {
        // the floating island: the original live-drawn earth platform
        const v = Math.abs(p.id * 7 + Math.floor(p.width / 40)) % 6;
        if (v === 3) drawLog(ctx, p, look, r);
        else if (v === 4 || (v === 5 && look.ground.kind === 'stone')) drawSlab(ctx, p, look, time, r);
        else {
          const depth = earthBody(ctx, p, look, time, bottom, r);
          if (curRig) lightBody(ctx, curRig, look, p, depth, () => islandPath(ctx, p.x, p.y, p.width, depth, Math.max(1, Math.min(4, Math.round(p.width / 140))), p.id), left, right, time);
          if (curRig) surfaceRoots(ctx, curRig, look, p, left, right);
          drawCap(ctx, p, look, time, r, 16);
          if (curRig) {
            liveBlades(ctx, curRig, look, p, left, right, time, polishTier() < 1);
            soilGlints(ctx, curRig, p, depth, left, right, time);
          }
          topDecor(ctx, p, look, r, time);
          if (curRig) dapples(ctx, curRig, p, left, right, time);
          underHang(ctx, p, look, r, depth);
        }
      }
    }
    ctx.restore();
  }
}

const planCache = new WeakMap<object, { n: number; world: number; seed: number; plan: StagePlan }>();

/** the plan for this stage's platforms (rebuilt when the stage, the world or the scene seed changes) */
function stagePlan(platforms: Platform[], world: number): StagePlan {
  const seed = getSceneSeed();
  const hit = planCache.get(platforms);
  if (hit && hit.n === platforms.length && hit.world === world && hit.seed === seed) return hit.plan;
  const plan = planStage(platforms, world, seed);
  planCache.set(platforms, { n: platforms.length, world, seed, plan });
  return plan;
}

/** a thin platform's plan, with a deterministic fallback for any platform the plan did not see */
/** the bounce plants' caps and cues over the painted ground (the plants themselves are drawn with the platforms, behind it) */
export function drawBounceCaps(ctx: CanvasRenderingContext2D, worldId: number, platforms: Platform[], cam: Cam, time: number) {
  const plan = stagePlan(platforms, worldId);
  const left = cam.x - 160;
  const right = cam.x + cam.viewportWidth + 160;
  for (const p of platforms) {
    if (p.type !== 'bouncy' || p.broken || p.x + p.width < left || p.x > right) continue;
    const tp = thinPlanFor(plan, p);
    drawBounce(ctx, p, tp.look === 'parasol' || tp.look === 'bloom' ? tp.look : 'toadstool', tp.variant, time, 0, 'cap');
  }
}

function thinPlanFor(plan: StagePlan, p: Platform): ThinPlan {
  const hit = plan.thin.get(p);
  if (hit) return hit;
  const look = baseLook(p);
  return { look, variant: Math.abs(p.id) % VARIANTS[look] };
}

export function drawWater(ctx: CanvasRenderingContext2D, worldId: number, x0: number, x1: number, waterY: number, bottom: number, time: number) {
  // Worlds 6-10: Matt's painted dirty, fast water (badWaterArt.ts); the drawn version below until it loads
  if (worldId >= 6 && drawBadWater(ctx, x0, x1, waterY, bottom, time)) return;
  const look = lookFor(worldId);
  const w = look.water;
  const g = ctx.createLinearGradient(0, waterY, 0, bottom);
  g.addColorStop(0, rgba(w.top, 0.92));
  g.addColorStop(1, rgba(w.bottom, 1));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x0, bottom);
  ctx.lineTo(x0, waterY);
  for (let x = x0; x <= x1 + 24; x += 24) ctx.lineTo(x, waterY + Math.sin(x * 0.03 + time * 2.2) * 4 + Math.sin(x * 0.07 - time * 1.5) * 2);
  ctx.lineTo(x1, bottom);
  ctx.closePath();
  ctx.fill();
  // foam crests + sparkles
  ctx.strokeStyle = rgba(w.foam, 0.85);
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let x = x0; x <= x1 + 24; x += 24) {
    const y = waterY + Math.sin(x * 0.03 + time * 2.2) * 4 + Math.sin(x * 0.07 - time * 1.5) * 2;
    if (x === x0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.fillStyle = rgba(w.foam, 0.6);
  for (let x = Math.floor(x0 / 90) * 90; x < x1; x += 90) {
    const tw = 0.5 + 0.5 * Math.sin(time * 3 + x);
    ctx.globalAlpha = tw * 0.8;
    ctx.beginPath();
    ctx.ellipse(x + 20, waterY + 18 + (x % 3) * 8, 14, 2.4, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  waterLife(ctx, worldId, x0, x1, waterY, time);
  if (worldId >= 6) badWater(ctx, x0, x1, waterY, bottom, time);
  void darken;
}

/**
 * From World 6 Pokey can swim, so the water that still costs a life has to look unswimmable (Matt, 2026-10-29: "make the water dirty
 * or fast-flowing"): a murky brown cast through the water, drifting scum on the surface and fast current streaks just under it.
 * Clean, calm water he can swim in is drawn without this.
 */
function badWater(ctx: CanvasRenderingContext2D, x0: number, x1: number, waterY: number, bottom: number, time: number) {
  ctx.fillStyle = 'rgba(96,76,40,0.38)';
  ctx.fillRect(x0, waterY + 4, x1 - x0, bottom - waterY - 4);
  // scum: flat greasy patches drifting slowly on the surface
  for (let x = Math.floor(x0 / 130) * 130 - 130; x < x1 + 130; x += 130) {
    const k = ((x / 130) | 0) % 7;
    const sx = x + ((time * 9 + k * 37) % 130);
    if (sx < x0 - 40 || sx > x1 + 40) continue;
    const y = waveY(sx, waterY, time) + 3;
    ctx.fillStyle = 'rgba(122,116,62,0.85)';
    ctx.beginPath();
    ctx.ellipse(sx, y, 24 + k * 4, 4 + (k % 3), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(178,170,104,0.75)';
    ctx.beginPath();
    ctx.ellipse(sx - 6 + k, y - 0.5, 5 + (k % 4), 1.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // the current: quick pale streaks racing along under the surface
  ctx.strokeStyle = 'rgba(214,220,190,0.6)';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  for (let x = Math.floor(x0 / 50) * 50 - 50; x < x1 + 50; x += 50) {
    const k = ((x / 50) | 0) % 5;
    const sx = x + ((time * 140 + k * 29) % 50);
    if (sx < x0 || sx > x1) continue;
    const y = waterY + 12 + k * 7;
    if (y > bottom - 6) continue;
    ctx.beginPath();
    ctx.moveTo(sx, y);
    ctx.lineTo(sx + 22 + k * 4, y + 0.5);
    ctx.stroke();
  }
}

const waveY = (x: number, waterY: number, time: number) => waterY + Math.sin(x * 0.03 + time * 2.2) * 4 + Math.sin(x * 0.07 - time * 1.5) * 2;

/** what lives in this world's water: the crocodile's eyes in the estuary, rising marsh gas in the peat swamp */
function waterLife(ctx: CanvasRenderingContext2D, worldId: number, x0: number, x1: number, waterY: number, time: number) {
  if (worldId === 2) {
    for (let x = Math.floor(x0 / 640) * 640; x < x1 + 640; x += 640) {
      const ex = x + 240 + (((x / 640) | 0) * 97 % 180);
      if (ex < x0 + 30 || ex > x1 - 30) continue;
      // it goes under now and then
      if (Math.sin(time * 0.35 + x * 0.013) > 0.5) continue;
      const y = waveY(ex, waterY, time);
      ctx.strokeStyle = 'rgba(235,245,225,0.5)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(ex, y + 3, 24 + Math.sin(time * 1.4) * 3, 4.5, 0, 0, Math.PI * 2);
      ctx.stroke();
      for (const dx of [-8, 8]) {
        ctx.fillStyle = '#3a4a28';
        ctx.beginPath();
        ctx.ellipse(ex + dx, y, 6, 4.2, 0, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#e8b02a';
        ctx.beginPath();
        ctx.arc(ex + dx, y - 1.8, 2.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#10100a';
        ctx.fillRect(ex + dx - 0.5, y - 3.6, 1, 3.6);
      }
    }
  } else if (worldId === 6) {
    for (let x = Math.floor(x0 / 150) * 150; x < x1 + 150; x += 150) {
      const bx = x + ((x / 150) | 0) % 5 * 23;
      if (bx < x0 || bx > x1) continue;
      const u = (((time * 0.35 + x * 0.0071) % 1) + 1) % 1;
      const y = waterY + 46 - u * 46;
      ctx.fillStyle = `rgba(190,210,170,${0.5 * (1 - u * 0.4)})`;
      ctx.strokeStyle = 'rgba(230,245,215,0.7)';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.arc(bx + Math.sin(u * 9 + x) * 4, y, 3 + (1 - u) * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }
}
