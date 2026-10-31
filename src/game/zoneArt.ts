/**
 * Drawing for the timed zones (see zones.ts). Everything is a function of the zone's state and the clock, so a cloud or a gust looks the
 * same to every player at the same moment, and the three beats read clearly:
 *   idle   - nearly nothing: a wisp now and then
 *   warn   - the mushrooms swell and glow / leaves start to stream and chevrons pulse: "it is about to start"
 *   active - the cloud fills the box / the gust streams hard
 */
import { zoneState, idleTime, type Zone, type ZoneState } from './zones.ts';
import type { Platform } from './types.ts';
import { drawBadWater } from './badWaterArt.ts';
import { drawW9Crumble, drawW9Eruption, drawW9Vent } from './w9Art.ts';
import { drawW9AshStreak, drawW9Flare, drawW9FlareBurst, drawW9Lavafall, drawW9LavafallPool, drawW9Surge } from './w9HeatArt.ts';
import { crumbleArtReady, drawCrumbleTile } from './crumbleArt.ts';
import { drawW10Bolt, drawW10Rod, drawW10Spikes } from './w10HazardArt.ts';
import { drawW3Piece, w3ArtReady } from './w3Art.ts';
import { drawW5Box, w5ArtReady } from './w5Art.ts';
import { dotPropsReady, drawPiece } from './dotFlightArt.ts';
import { drawFx, fxFrame } from './bossFx.ts';
import { BOSS_FX } from './bossFxData.ts';
import { drawLeafBit } from './leafSprites.ts';
import { glowPic } from './glow.ts';
import { drawSoftShadow } from './w4Grit.ts';
import { drawW10Barrel, drawW10BarrelStack, drawW10DropBars, drawW10Gatehouse, drawW10Gush, drawW10Spout } from './w10DropArt.ts';

const hash = (n: number) => {
  const v = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
};

interface View { x: number; y: number; w: number; h: number }

/**
 * Soft round blobs painted once and drawn scaled, with `globalAlpha` for their brightness. A cloud puff used to build its own radial gradient
 * every frame (twenty or more at a time) - heavy on a phone, where it showed as stalls whenever a spore cloud was on screen.
 */
const discs = new Map<string, HTMLCanvasElement>();
function disc(key: string, stops: Array<[number, string]>): HTMLCanvasElement {
  let cv = discs.get(key);
  if (cv) return cv;
  cv = document.createElement('canvas');
  cv.width = cv.height = 96;
  const g = cv.getContext('2d');
  if (g) {
    const gr = g.createRadialGradient(48, 48, 0, 48, 48, 48);
    for (const [at, col] of stops) gr.addColorStop(at, col);
    g.fillStyle = gr;
    g.fillRect(0, 0, 96, 96);
  }
  discs.set(key, cv);
  return cv;
}
const sporeGlowPic = () => disc('spore-glow', [[0, 'rgba(216, 180, 254, 1)'], [1, 'rgba(216, 180, 254, 0)']]);
const sporeHazePic = () => disc('spore-haze', [[0, 'rgba(192, 132, 252, 0.42)'], [0.7, 'rgba(167, 139, 250, 0.2)'], [1, 'rgba(167, 139, 250, 0)']]);
const sporePuffPic = () => disc('spore-puff', [[0, 'rgba(221, 205, 255, 1)'], [0.6, 'rgba(167, 139, 250, 0.6)'], [1, 'rgba(167, 139, 250, 0)']]);

const visible = (z: Zone, cam: View) => z.x1 > cam.x - 80 && z.x0 < cam.x + cam.w + 80 && z.bottom > cam.y - 80 && z.top < cam.y + cam.h + 80;

/** the things the zones come out of (mushrooms, vents, rods): drawn before the player, on top of the ground */
export function drawZoneBases(ctx: CanvasRenderingContext2D, zones: readonly Zone[] | undefined, cam: View, t: number) {
  if (!zones) return;
  for (const z of zones) {
    if (!visible(z, cam)) continue;
    if (z.kind === 'geyser') { drawVent(ctx, z, zoneState(z, t), t); continue; }
    // (World 10's drop gate, w10DropArt.ts: a bolt column drawn as the gatehouse over the walk)
    if (z.kind === 'bolt' && z.look === 'portcullis') { drawW10Gatehouse(ctx, z); continue; }
    if (z.kind === 'bolt' && z.look === 'gush') { drawW10Spout(ctx, z); continue; }
    if (z.kind === 'bolt' && z.look === 'barrel') { drawW10BarrelStack(ctx, z, zoneState(z, t), t); continue; }
    if (z.kind === 'bolt') { drawRod(ctx, z, zoneState(z, t), t); continue; }
    // (an iron spike bed: painted only, w10HazardArt.ts; nothing is drawn for the moment its sheet loads)
    if (z.kind === 'spikes') { drawW10Spikes(ctx, z); continue; }
    if (z.kind === 'web') { drawWebBack(ctx, z); continue; }
    if (z.kind !== 'spore' || !z.emit) continue;
    const st = zoneState(z, t);
    const swell = st.phase === 'warn' ? 1 + 0.32 * Math.sin(st.u * Math.PI * (0.5 + st.u * 2.5)) ** 2 + 0.1 * st.u : st.phase === 'active' ? 1.12 - 0.12 * st.u + 0.06 * Math.sin(t * 18) * st.strength : 1;
    const glow = st.phase === 'warn' ? 0.3 + 0.7 * st.u : st.phase === 'active' ? 0.6 * st.strength : 0;
    if (w3ArtReady()) {
      drawPaintedMushrooms(ctx, z, swell, glow, t);
      continue;
    }
    // (the shapes below are the stand-in while Matt's grotto sheet loads)
    z.emit.forEach((ex, i) => {
      const by = z.baseY;
      ctx.save();
      ctx.translate(ex, by);
      // ground glow
      if (glow > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(0, -4, 70, 22, 0, 0, Math.PI * 2);
        ctx.clip();
        ctx.globalAlpha = 0.55 * glow;
        ctx.drawImage(sporeGlowPic(), -70, -74, 140, 140);
        ctx.restore();
      }
      const sway = Math.sin(t * 1.4 + i * 1.7) * 1.5;
      // stalk
      ctx.fillStyle = '#f5ecd7';
      ctx.beginPath();
      ctx.moveTo(-7, 0);
      ctx.quadraticCurveTo(-5 + sway, -16, -5 + sway, -26);
      ctx.lineTo(5 + sway, -26);
      ctx.quadraticCurveTo(5 + sway, -16, 7, 0);
      ctx.closePath();
      ctx.fill();
      // cap
      ctx.save();
      ctx.translate(sway, -26);
      ctx.scale(swell, 2 - swell);
      ctx.fillStyle = glow > 0.5 ? '#c084fc' : '#8b5cf6';
      ctx.beginPath();
      ctx.ellipse(0, 0, 26, 17, 0, Math.PI, Math.PI * 2);
      ctx.quadraticCurveTo(0, 5, -26, 0);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = `rgba(255, 255, 255, ${0.8})`;
      for (const [sx, sy, sr] of [[-12, -8, 3.4], [4, -12, 3], [14, -5, 2.6], [-3, -4, 2.2]]) {
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      ctx.restore();
    });
  }
}

/** how wide a painted spore cluster is drawn (World 3 sheet 'mushrooms', the same piece as the grotto's dressing) */
const MUSH_W = 112;

/**
 * The spore mushrooms from Matt's grotto sheet: the cluster on its moss mound, swelling (wider and squatter) on the warning and glowing
 * as it puffs. The swell, the glow and the cloud stay code: small touches on the painted piece.
 */
function drawPaintedMushrooms(ctx: CanvasRenderingContext2D, z: Zone, swell: number, glow: number, t: number) {
  z.emit!.forEach((ex, i) => {
    const by = z.baseY + 6;
    ctx.save();
    ctx.translate(ex, by);
    if (glow > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(0, -10, 70, 22, 0, 0, Math.PI * 2);
      ctx.clip();
      ctx.globalAlpha = 0.55 * glow;
      ctx.drawImage(sporeGlowPic(), -70, -80, 140, 140);
      ctx.restore();
    }
    // a slow sway about the mound, and the swell about the same point
    ctx.rotate(Math.sin(t * 1.4 + i * 1.7) * 0.025);
    ctx.scale(i % 2 ? -swell : swell, 2 - swell);
    drawW3Piece(ctx, 'mushrooms', 0, 0, MUSH_W);
    if (glow > 0) {
      ctx.globalCompositeOperation = 'lighter';
      drawW3Piece(ctx, 'mushrooms', 0, 0, MUSH_W, 0.4 * glow);
    }
    ctx.restore();
  });
}

/** the clouds and gusts themselves: drawn over the player, so the hero is inside them */
export function drawZoneEffects(ctx: CanvasRenderingContext2D, zones: readonly Zone[] | undefined, cam: View, t: number) {
  if (!zones) return;
  for (const z of zones) {
    if (!visible(z, cam)) continue;
    const st = zoneState(z, t);
    if (z.kind === 'spore') drawCloud(ctx, z, st, t);
    else if (z.kind === 'wind') drawGust(ctx, z, st, t);
    else if (z.kind === 'geyser') drawEruption(ctx, z, st, t);
    else if (z.kind === 'bolt' && z.look === 'portcullis') drawW10DropBars(ctx, z, st, t);
    else if (z.kind === 'bolt' && z.look === 'gush') drawW10Gush(ctx, z, st, t);
    else if (z.kind === 'bolt' && z.look === 'barrel') drawW10Barrel(ctx, z, st);
    else if (z.kind === 'bolt') drawBolt(ctx, z, st, t);
    else if (z.kind === 'web') drawWeb(ctx, z, t);
    else if (z.kind === 'tide') drawTide(ctx, z, st, t);
  }
}

function drawCloud(ctx: CanvasRenderingContext2D, z: Zone, st: ReturnType<typeof zoneState>, t: number) {
  const w = z.x1 - z.x0;
  const h = z.baseY - z.top;
  // when it has cleared it is gone: no wisps left behind (only the mushrooms say where the next puff will come)
  const level = st.phase === 'active' ? st.strength : st.phase === 'warn' ? 0.18 + 0.3 * st.u : 0;
  if (level <= 0) return;
  const n = Math.max(10, Math.round(w / 18));
  ctx.save();
  // a haze that fills the box so the cloud reads as a place, soft at its edges
  // (the upper half of the soft disc, stretched to the box)
  ctx.globalAlpha = level;
  ctx.drawImage(sporeHazePic(), 0, 0, 96, 48, z.x0, z.baseY + 6 - h, w, h);
  ctx.globalAlpha = 1;
  for (let i = 0; i < n; i++) {
    const seed = hash(i + z.x0 * 0.013);
    const seed2 = hash(i * 3.3 + z.x0 * 0.007);
    // each puff rises from the ground and drifts, then starts over
    const life = 3.2 + seed * 1.6;
    const ph = ((t + seed * 9) % life) / life;
    const x = z.x0 + ((seed2 + Math.sin(t * 0.5 + i) * 0.06 + 1) % 1) * w;
    const y = z.baseY - 10 - ph * h * (0.55 + 0.4 * seed2);
    const r = (34 + 34 * seed) * (0.6 + ph * 0.7);
    const a = level * 0.8 * Math.sin(ph * Math.PI);
    if (a <= 0.01) continue;
    ctx.globalAlpha = Math.min(1, a);
    ctx.drawImage(sporePuffPic(), x - r, y - r, r * 2, r * 2);
  }
  ctx.globalAlpha = 1;
  // glittering spores: each a tiny soft glow, twinkling (the pre-rendered glow, no square)
  if (st.phase === 'active') {
    const pic = glowPic('#fdf6b2', 'fly');
    const m = Math.round(w / 14);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < m; i++) {
      const s = hash(i * 1.7 + z.x1 * 0.011);
      const x = z.x0 + s * w + Math.sin(t * 1.3 + i) * 10;
      const y = z.baseY - 12 - (((t * (14 + s * 22) + s * 400) % h) );
      const r = 4 + 2 * Math.sin(t * 5 + i * 2.1);
      ctx.globalAlpha = 0.9 * st.strength;
      ctx.drawImage(pic, x - r, y - r, r * 2, r * 2);
    }
    ctx.restore();
  }
  ctx.restore();
}

/**
 * the band of a gust lane that its streaks and leaves are drawn in: the air he swings and leaps through, from just above the ground up
 * to about the height of a leap off a vine, never the whole lane up to the sky (drawn over the backdrop up there, the streaks flattened
 * the scene's depth: the 4-4 play test, 2026-10-25)
 */
export const GUST_BAND = 360;
export function gustBand(z: Pick<Zone, 'top' | 'bottom' | 'baseY'>): { top: number; bottom: number } {
  return { top: Math.max(z.top, z.baseY - GUST_BAND), bottom: Math.min(z.bottom, z.baseY + 10) };
}

function drawGust(ctx: CanvasRenderingContext2D, z: Zone, st: ReturnType<typeof zoneState>, t: number) {
  const w = z.x1 - z.x0;
  const band = gustBand(z);
  const h = band.bottom - band.top;
  // (between gusts the lane is clear: the chimes say when the next one is coming)
  const level = st.phase === 'active' ? st.strength : st.phase === 'warn' ? 0.1 + 0.4 * st.u : 0;
  ctx.save();
  ctx.beginPath();
  ctx.rect(z.x0, band.top, w, h);
  ctx.clip();
  // the painted wind (the gust strip, bossFx.ts) racing along the band, more and faster the harder it blows, fading out toward the
  // band's top and bottom and in and out at its ends (no stroked lines: Matt 2026-10-29, repeating effects are painted)
  const n = level > 0 ? Math.max(4, Math.round((w * h) / 16000)) : 0;
  const speed = z.force * (st.phase === 'active' ? 2.6 : 1.1);
  for (let i = 0; i < n; i++) {
    const sx = hash(i * 2.1 + z.x0 * 0.01);
    const sy = hash(i * 5.3 + z.x1 * 0.01);
    const len = 110 + sx * 110 * (0.4 + level);
    const travel = (t * speed * (0.7 + sy * 0.6) + sx * (w + 260)) % (w + 260);
    const x = z.dir === 1 ? z.x0 - 130 + travel : z.x1 + 130 - travel;
    const y = band.top + 14 + sy * (h - 28) + Math.sin(t * 2 + i) * 4;
    const fade = Math.sin(Math.PI * Math.min(1, Math.max(0, (y - band.top) / h))) * Math.min(1, travel / 90, (w + 260 - travel) / 90);
    const a = level * fade * (0.45 + sy * 0.4);
    // (World 9's hot wind: its painted ash streaks, flakes and embers carried in them)
    if (z.look === 'ash' && drawW9AshStreak(ctx, i, x, y, len * 1.3, Math.min(1, a * 1.4), z.dir === -1)) continue;
    drawFx(ctx, 'gust', x, y, len, { h: len * 0.16, alpha: a, flipX: z.dir === -1 });
  }
  // painted leaves tumbling with it
  const leaves = level > 0 && z.look !== 'ash' ? Math.round(w / 90) + 2 : 0;
  for (let i = 0; i < leaves; i++) {
    const sx = hash(i * 9.9 + z.x0 * 0.02);
    const sy = hash(i * 3.7 + z.x1 * 0.02);
    const travel = (t * speed * (0.55 + sy * 0.4) + sx * (w + 160)) % (w + 160);
    const x = z.dir === 1 ? z.x0 - 80 + travel : z.x1 + 80 - travel;
    const y = band.top + 30 + sy * (h - 60) + Math.sin(t * 3.4 + i * 2) * 14;
    drawLeafBit(ctx, i % 4 === 3 ? 'warm' : 'green', sx, x, y, 18 + sy * 6, t * (2 + sx * 3) * z.dir + i, Math.cos(t * 4 + i * 1.7), Math.min(0.95, 0.1 + level * 0.85));
  }
  ctx.restore();
  // which way it blows: the painted arrow, pale, pulsing in the warning and steady while it blows
  if (st.phase !== 'idle') {
    const a = st.phase === 'warn' ? 0.35 + 0.5 * Math.abs(Math.sin(st.u * Math.PI * 6)) : 0.85 * st.strength;
    const cx = (z.x0 + z.x1) / 2;
    const cy = gustBand(z).top + 34;
    drawFx(ctx, 'warnArrow', cx, cy, 78, { alpha: a, flipX: z.dir === -1, recolor: '#e6fffa' });
  }
}

/** the screen-wide sleepy tint while drowsy: a soft violet vignette that breathes, 0..1 */
export function drawDrowsyVeil(ctx: CanvasRenderingContext2D, vw: number, vh: number, level: number, t: number) {
  if (level <= 0.01) return;
  const breath = 0.85 + 0.15 * Math.sin(t * 2.2);
  const g = ctx.createRadialGradient(vw / 2, vh / 2, Math.min(vw, vh) * 0.3, vw / 2, vh / 2, Math.max(vw, vh) * 0.75);
  g.addColorStop(0, 'rgba(124, 58, 237, 0)');
  g.addColorStop(1, `rgba(88, 28, 135, ${0.5 * level * breath})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, vw, vh);
}

// ---------------------------------------------------------------------------
// Lava geysers (World 9)
// ---------------------------------------------------------------------------

/** a crack in the ground that glows hotter as the eruption nears */
/** a soft additive glow, as wide as `d` across, centred on (x, y) (the pre-rendered glow: a small code touch over the painted pieces) */
function glowAt(ctx: CanvasRenderingContext2D, col: string, x: number, y: number, d: number, a: number) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = Math.min(1, a);
  ctx.drawImage(glowPic(col), x - d / 2, y - d / 2, d, d);
  ctx.restore();
}

/**
 * World 9's lava vent (painted, boss-fx 'ventCool' / 'ventHot'): resting it smoulders; as it warns, the hot vent bleeds in over the
 * cool one and the whole vent shivers; erupting, it is all hot. Nothing is drawn while the sheet loads.
 */
function drawVent(ctx: CanvasRenderingContext2D, z: Zone, st: ZoneState, t: number) {
  // (World 9's painted vent rock: w9Art.ts; the shapes below while its sheet loads)
  if (z.look === 'flare') return void drawW9Flare(ctx, z, st, t);
  if (z.look === 'lavafall') return void drawW9LavafallPool(ctx, z, st);
  if (z.look === 'surge') return;
  if (drawW9Vent(ctx, z, st, t)) return;
  const cx = (z.x0 + z.x1) / 2;
  const w = (z.x1 - z.x0) * 2.1;
  const heat = st.phase === 'warn' ? 0.35 + 0.65 * st.u : st.phase === 'active' ? 1 : 0.12 + 0.08 * Math.sin(t * 2 + cx);
  const dx = st.phase === 'warn' ? Math.sin(t * 60) * 2.2 * st.u : 0;
  glowAt(ctx, '#ffa040', cx, z.baseY - 6, w * 1.1, 0.75 * heat);
  if (!drawFx(ctx, 'ventCool', cx + dx, z.baseY + 6, w, { ay: 1 })) return;
  drawFx(ctx, 'ventHot', cx + dx, z.baseY + 6, w, { ay: 1, alpha: Math.min(1, heat * 1.15) });
}

/**
 * World 9's eruption: as it warns, steam and spitting sparks build over the vent (the painted dust puff, pale, and painted sparks);
 * erupting, a painted lava fountain (boss-fx 'lava0'..'lava2', flickering between its three frames) rises to its height from the vent
 * mouth, a heat glow round it and painted sparks thrown up and out.
 */
function drawEruption(ctx: CanvasRenderingContext2D, z: Zone, st: ZoneState, t: number) {
  if (z.look === 'flare') return void drawW9FlareBurst(ctx, z, st);
  if (z.look === 'lavafall') return void drawW9Lavafall(ctx, z, st, t);
  if (z.look === 'surge') return void drawW9Surge(ctx, z, st, t);
  if (drawW9Eruption(ctx, z, st, t)) return;
  const cx = (z.x0 + z.x1) / 2;
  const w = z.x1 - z.x0;
  const full = z.baseY - z.top;
  if (st.phase === 'warn') {
    const n = 3 + Math.round(st.u * 5);
    for (let i = 0; i < n; i++) {
      const sd = hash(i * 3.1 + cx * 0.01);
      const ph = ((t * (0.9 + sd) + sd * 5) % 1);
      const x = cx + (sd - 0.5) * w * 0.9;
      const y = z.baseY - 8 - ph * (30 + st.u * 70);
      drawFx(ctx, fxFrame('dust', ph), x, y, 26 + ph * 30, { alpha: 0.55 * (1 - ph) * (0.4 + st.u) });
      if (i % 2 === 0) drawFx(ctx, fxFrame('spark', ph), x, y - 6, 14, { alpha: 0.7 * (1 - ph) * st.u });
    }
    return;
  }
  if (st.phase !== 'active') return;
  const rise = Math.min(1, st.strength * 1.25);
  const h = full * rise;
  if (h < 4) return;
  glowAt(ctx, '#ff9a40', cx, z.baseY - h * 0.45, Math.max(w * 4, h * 1.2), 0.55 * st.strength);
  const frame = `lava${Math.floor(t * 12) % 3}`;
  // (the fountain stands in the vent mouth and is drawn as tall as it has risen, so its bursting crown always shows at the top)
  drawFx(ctx, frame, cx + Math.sin(t * 22) * 2, z.baseY + 4, w * 1.35, { ay: 1, h: h + 30 });
  for (let i = 0; i < 10; i++) {
    const sd = hash(i * 7.7 + Math.floor(t / z.period) * 3.3 + cx * 0.01);
    const ph = (st.u * 1.3 + sd) % 1;
    const x = cx + (sd - 0.5) * w * 2.2 * ph;
    const y = z.baseY - h * (0.2 + 0.85 * ph) + 60 * ph * ph;
    drawFx(ctx, fxFrame('spark', ph), x, y, 18, { alpha: 1 - ph });
  }
}

// ---------------------------------------------------------------------------
// Lightning (World 10)
// ---------------------------------------------------------------------------

/** the lightning rod's drawn height (the old code rod and its orb stood about this tall) */
const ROD_H = 66;

/** World 10's lightning rod (painted, boss-fx 'rodDark' / 'rodLit' on a 'scorch' mark): its orb charges up as it warns, lit when it strikes */
function drawRod(ctx: CanvasRenderingContext2D, z: Zone, st: ZoneState, t: number) {
  // (World 10's painted rods, w10HazardArt.ts; the shapes below are the stand-in while the sheet loads)
  if (drawW10Rod(ctx, z, st, t)) return;
  const cx = (z.x0 + z.x1) / 2;
  const charge = st.phase === 'warn' ? 0.25 + 0.75 * st.u : st.phase === 'active' ? 1 : 0.1;
  drawFx(ctx, 'scorch', cx, z.baseY + 4, (z.x1 - z.x0) * 1.6, { ay: 0.6, alpha: 0.8 });
  // (both rods are cut at one scale, so they are drawn at one scale too: the dark one ROD_H tall, the lit one over it, feet together)
  const dark = BOSS_FX.rodDark;
  const lit = BOSS_FX.rodLit;
  if (!dark || !lit) return;
  const k = ROD_H / dark.h;
  if (!drawFx(ctx, 'rodDark', cx, z.baseY + 2, dark.w * k, { ay: 1 })) return;
  const flick = st.phase === 'warn' ? 0.7 + 0.3 * Math.sin(t * 40) : 1;
  drawFx(ctx, 'rodLit', cx, z.baseY + 2, lit.w * k, { ay: 1, alpha: Math.min(1, charge * 1.2) * flick });
  glowAt(ctx, '#7dd3fc', cx, z.baseY - 64, 40 + 40 * charge, charge * flick);
}

/**
 * World 10's strike: as it warns, the painted bolt flickers faintly down the lane where it will land and painted sparks jump off the
 * orb; striking, the painted bolt (boss-fx 'bolt', flipped by the strike so no two match) from the sky to the rod, a burst of light
 * where it lands.
 */
function drawBolt(ctx: CanvasRenderingContext2D, z: Zone, st: ZoneState, t: number) {
  if (drawW10Bolt(ctx, z, st, t)) return;
  const cx = (z.x0 + z.x1) / 2;
  const top = z.top;
  const len = z.baseY - 60 - top;
  const strike = Math.floor((t + z.offset) / z.period);
  const flip = hash(strike * 1.7 + cx * 0.01) > 0.5;
  if (st.phase === 'warn') {
    const a = (0.08 + 0.3 * st.u) * (0.5 + 0.5 * Math.sin(t * 38));
    drawFx(ctx, 'bolt', cx, z.baseY - 60, 40, { ay: 1, h: len, alpha: a, flipX: flip });
    for (let i = 0; i < 2 + Math.round(st.u * 4); i++) {
      const sd = hash(i * 5.9 + Math.floor(t * 18) * 1.3 + cx * 0.01);
      const ang = sd * Math.PI * 2;
      drawFx(ctx, fxFrame('spark', sd), cx + Math.cos(ang) * (14 + sd * 22), z.baseY - 64 + Math.sin(ang) * (14 + sd * 22), 12, { alpha: 0.4 + 0.6 * st.u });
    }
    return;
  }
  if (st.phase !== 'active') return;
  glowAt(ctx, '#bae6fd', cx, z.baseY - 60 - len / 2, 140, 0.45 * st.strength);
  drawFx(ctx, 'bolt', cx, z.baseY - 60, 70, { ay: 1, h: len, alpha: st.strength, flipX: flip });
  glowAt(ctx, '#ffffff', cx, z.baseY - 8, 180, 0.9 * st.strength);
}

// ---------------------------------------------------------------------------
// Webs (World 5)
// ---------------------------------------------------------------------------

/** the silk bridge's picture (w5PropsData.ts 'silkBridge'): its planks run this far down it, and its height is kept to this at the most */
const BRIDGE_DECK = 0.62;
const BRIDGE_MAX_H = 150;
/** a patch's webs: Dot's see-through silk strung low across the path ('silkWide'), about this wide and this far apart */
const PATCH_WEB = { w: 96, step: 70 } as const;

/** Matt's painted silk behind Pokey: the silk bridge strung over the gap, or the back row of a patch's webs */
function drawWebBack(ctx: CanvasRenderingContext2D, z: Zone) {
  if (z.bridge) {
    if (!w5ArtReady()) return;
    const x0 = z.x0 - 14, w = z.x1 - z.x0 + 28;
    const h = Math.min(BRIDGE_MAX_H, (w * 122) / 412);
    drawW5Box(ctx, 'silkBridge', x0, z.baseY - h * BRIDGE_DECK, w, h);
    return;
  }
  drawPatchWebs(ctx, z, 0, 0.85);
}

/**
 * one row of a patch's webs, standing on the ground along it (`row` 0 the back one, 1 the front one, set half a step along and a
 * little smaller), mirrored in turn so the row doesn't repeat; the path shows through the strands. False until the sheet has loaded.
 */
function drawPatchWebs(ctx: CanvasRenderingContext2D, z: Zone, row: 0 | 1, alpha: number): boolean {
  if (!dotPropsReady()) return false;
  const w = z.x1 - z.x0;
  const n = Math.max(1, Math.round((w - PATCH_WEB.w * 0.5) / PATCH_WEB.step));
  const step = (w - PATCH_WEB.w * 0.6) / n;
  const ww = PATCH_WEB.w * (row ? 0.85 : 1);
  for (let i = 0; i <= n - row; i++) {
    const x = z.x0 + PATCH_WEB.w * 0.3 + (i + row * 0.5) * step;
    const sd = hash(i * 4.3 + row * 9.1 + z.x0 * 0.01);
    drawPiece(ctx, 'silkWide', x, z.baseY + 4, ww * (0.9 + 0.2 * sd), { ay: 1, flip: (i + row) % 2 === 1, alpha });
  }
  return true;
}

function drawWeb(ctx: CanvasRenderingContext2D, z: Zone, t: number) {
  // over him: a patch's front row of webs, so he is in them (the bridge he walks on top of), and the dew catching the light
  if (z.bridge ? w5ArtReady() : drawPatchWebs(ctx, z, 1, 0.55)) {
    drawDew(ctx, z, Math.max(4, Math.round((z.x1 - z.x0) / 34)), z.bridge ? 40 : 60);
    return;
  }
  // (the shapes below are the stand-in while World 5's sheet loads)
  const w = z.x1 - z.x0;
  const n = Math.max(4, Math.round(w / 34));
  ctx.save();
  // the sticky film on the ground
  const film = ctx.createLinearGradient(0, z.baseY - 18, 0, z.baseY + 4);
  film.addColorStop(0, 'rgba(255, 255, 255, 0)');
  film.addColorStop(1, 'rgba(240, 240, 255, 0.55)');
  ctx.fillStyle = film;
  ctx.fillRect(z.x0, z.baseY - 18, w, 22);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.78)';
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  const tops: Array<[number, number]> = [];
  for (let i = 0; i <= n; i++) {
    const x = z.x0 + (w * i) / n;
    const h = 38 + hash(i * 3.7 + z.x0 * 0.01) * 44;
    const sway = Math.sin(t * 1.3 + i * 0.9) * 2.5;
    const tx = x + (hash(i * 1.9 + z.x1 * 0.01) - 0.5) * 22 + sway;
    tops.push([tx, z.baseY - h]);
    ctx.beginPath();
    ctx.moveTo(x, z.baseY);
    ctx.quadraticCurveTo(x + sway * 0.4, z.baseY - h * 0.55, tx, z.baseY - h);
    ctx.stroke();
  }
  // threads between the strands, sagging like a real web
  for (let ring = 0; ring < 3; ring++) {
    ctx.beginPath();
    tops.forEach(([x, y], i) => {
      const ry = z.baseY - (z.baseY - y) * (0.35 + ring * 0.3);
      if (i === 0) ctx.moveTo(x, ry);
      else {
        const [px, py] = tops[i - 1];
        const pry = z.baseY - (z.baseY - py) * (0.35 + ring * 0.3);
        ctx.quadraticCurveTo((px + x) / 2, Math.max(pry, ry) + 6, x, ry);
      }
    });
    ctx.stroke();
  }
  drawDew(ctx, z, n, 60);
  ctx.restore();
}

/** beads of dew on the silk, up to `rise` over the ground */
function drawDew(ctx: CanvasRenderingContext2D, z: Zone, n: number, rise: number) {
  // (each bead a tiny soft glint, the pre-rendered glow: no hard dot)
  const w = z.x1 - z.x0;
  const pic = glowPic('#c8f0ff', 'fly');
  ctx.save();
  ctx.globalAlpha = 0.9;
  for (let i = 0; i < Math.round(n * 0.8); i++) {
    const sd = hash(i * 6.1 + z.x0 * 0.02);
    const x = z.x0 + sd * w, y = z.baseY - 6 - hash(i * 2.3 + z.x1 * 0.02) * rise;
    ctx.drawImage(pic, x - 4.5, y - 4.5, 9, 9);
  }
  ctx.restore();
}

// ---------------------------------------------------------------------------
// The tide (World 6)
// ---------------------------------------------------------------------------

/** how high the water stands in the mudflat: 0 low tide .. 1 full */
export function tideLevel(z: Zone, st: ZoneState): number {
  const idle = idleTime(z);
  if (st.phase === 'warn') return 0.5 * st.u * st.u;
  if (st.phase === 'active') return 0.5 + 0.5 * Math.min(1, st.strength * 1.6);
  const since = st.u * idle;
  // the water drains away over the first moments of low tide
  return Math.max(0, 1 - since / 1.6) * 0.5;
}

function drawTide(ctx: CanvasRenderingContext2D, z: Zone, st: ZoneState, t: number) {
  const w = z.x1 - z.x0;
  const level = tideLevel(z, st);
  const bottom = z.baseY + 14;
  const surface = bottom - level * 106;
  ctx.save();
  ctx.beginPath();
  ctx.rect(z.x0, z.top, w, bottom - z.top);
  ctx.clip();
  // wet mud shine at low tide
  // (soft: a damp darkening laid on in overlapping soft shadows, and long soft sheens of sky on the wet, no box and no flat ovals)
  if (level < 0.1) {
    for (let x = z.x0 + 30; x < z.x1; x += 60) drawSoftShadow(ctx, x, z.baseY + 5, 120, 22, 0.3);
    const sheen = glowPic('#bee6f0');
    ctx.save();
    ctx.globalAlpha = 0.5;
    for (let i = 0; i < Math.round(w / 70); i++) {
      const sd = hash(i * 4.4 + z.x0 * 0.02);
      const rx = 16 + sd * 14;
      ctx.drawImage(sheen, z.x0 + 20 + sd * (w - 40) - rx, z.baseY - 1, rx * 2, 6);
    }
    ctx.restore();
  }
  // the tide is fast water (Matt, 2026-10-29: from World 6 the deadly water is dirty or fast): Matt's painted sheet, rushing toward the
  // bank it sweeps you to; the drawn water below only until the sheet has loaded
  if (level > 0.01 && drawBadWater(ctx, z.x0, z.x1, surface, bottom, t, z.dir < 0 ? -1 : 1)) {
    // (painted)
  } else if (level > 0.01) {
    const wave = (x: number) => surface + Math.sin(x * 0.045 + t * 2.4) * 3 + Math.sin(x * 0.11 - t * 1.7) * 1.6;
    const g = ctx.createLinearGradient(0, surface, 0, bottom);
    g.addColorStop(0, 'rgba(70, 170, 190, 0.62)');
    g.addColorStop(1, 'rgba(24, 100, 125, 0.86)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(z.x0, bottom);
    for (let x = z.x0; x <= z.x1 + 10; x += 10) ctx.lineTo(x, wave(x));
    ctx.lineTo(z.x1, bottom);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = z.x0; x <= z.x1 + 10; x += 10) (x === z.x0 ? ctx.moveTo(x, wave(x)) : ctx.lineTo(x, wave(x)));
    ctx.stroke();
    // while it is up, streaks run toward the bank it sweeps you to
    if (st.phase === 'active') {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 2;
      for (let i = 0; i < Math.round(w / 40); i++) {
        const sd = hash(i * 2.9 + z.x0 * 0.01);
        const x = z.x0 + ((sd * w + t * 160 * -z.dir * (0.7 + sd)) % w + w) % w;
        const y = surface + 14 + sd * (bottom - surface - 24);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + z.dir * 28, y);
        ctx.stroke();
      }
    }
  }
  ctx.restore();
  // the warning: arrows that say the water is coming up
  if (st.phase === 'warn' || (st.phase === 'active' && st.u < 0.25)) {
    const a = st.phase === 'warn' ? 0.3 + 0.6 * Math.abs(Math.sin(st.u * Math.PI * 5)) : 0.8;
    const cx = (z.x0 + z.x1) / 2;
    // (the painted arrow, recoloured a pale sea-white and turned to point up: no stroked chevrons)
    const y = z.baseY - 130 - (st.phase === 'warn' ? st.u * 14 : 0);
    drawFx(ctx, 'warnArrow', cx, y, 64, { rot: -Math.PI / 2, alpha: a, recolor: '#e6fbff' });
  }
}

// ---------------------------------------------------------------------------
// Crumbling ruin tiles (World 7)
// ---------------------------------------------------------------------------

/** cracks on every ruin tile, and dust and a shudder on the ones that have started to go */
export function drawCrumbleTiles(ctx: CanvasRenderingContext2D, plats: readonly Platform[], cam: View, t: number) {
  // (asked for only once a crumbling tile is on screen: asked every frame, every stage loaded the sheet, and froze as it arrived mid-run)
  let painted: boolean | null = null;
  for (const p of plats) {
    if (p.crumbleAfter === undefined) continue;
    if (p.x + p.width < cam.x - 40 || p.x > cam.x + cam.w + 40) continue;
    // (World 9's cracked basalt is its kit's painted slab: w9Art.ts)
    if (p.art === 'basalt') {
      if (!p.broken) drawW9Crumble(ctx, p, t);
      continue;
    }
    painted ??= crumbleArtReady();
    // (a tile just broken: its painted pieces fall, crumbleArt.ts; the painted slab carries its own cracks, so only the dust is drawn here)
    if (p.broken) {
      if (painted) drawCrumbleTile(ctx, p, t);
      continue;
    }
    const timer = p.fragileTimer;
    const prog = timer === undefined ? 0 : Math.max(0, Math.min(1, 1 - timer / p.crumbleAfter));
    if (painted && prog <= 0) continue;
    ctx.save();
    ctx.translate(p.x, p.y);
    if (prog > 0) ctx.translate(Math.sin(t * 70) * 2.2 * prog, Math.sin(t * 83) * 1.2 * prog);
    ctx.strokeStyle = `rgba(28, 20, 12, ${0.55 + 0.4 * prog})`;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    const seed = p.x * 0.017;
    for (let k = 0; k < (painted ? 0 : 2); k++) {
      const x0 = p.width * (0.2 + 0.4 * k) + (hash(seed + k) - 0.5) * 10;
      ctx.beginPath();
      ctx.moveTo(x0, 2);
      ctx.lineTo(x0 + (hash(seed + k * 3) - 0.5) * 16, 11);
      ctx.lineTo(x0 + (hash(seed + k * 5) - 0.5) * 18, 20);
      ctx.lineTo(x0 + (hash(seed + k * 7) - 0.5) * 12, p.height - 2);
      ctx.stroke();
    }
    if (prog > 0) {
      // (the old plank's warm tint: the painted slab shows its breaking frame instead)
      if (!painted) {
        ctx.fillStyle = `rgba(220, 120, 60, ${0.28 * prog})`;
        ctx.fillRect(0, 0, p.width, p.height);
      }
      ctx.fillStyle = `rgba(214, 196, 160, ${0.8 * (1 - prog * 0.4)})`;
      for (let i = 0; i < 6; i++) {
        const sd = hash(i * 5.3 + seed);
        const fall = (t * (40 + sd * 50) + sd * 30) % 40;
        ctx.fillRect(sd * p.width, p.height + fall, 3, 3);
      }
    }
    ctx.restore();
  }
}

// ---------------------------------------------------------------------------
// Darkness (World 8)
// ---------------------------------------------------------------------------

let darkCanvas: HTMLCanvasElement | null = null;
/** pixels per CSS pixel the dark veil is painted at (drawDarkness) */
const DARK_RES = 0.5;

/**
 * The light holes cut in the dark, baked once (WIP-17: no gradient built per light per frame): `soft` falls off from a hot middle, as the
 * old per-frame gradient did; `ring` stays clear to near its edge and then closes in fast, so the lantern's light reads as a shaped ring
 * with real dark outside it (8-4's jar).
 */
const holePics: Partial<Record<'soft' | 'ring', HTMLCanvasElement>> = {};
function holePic(kind: 'soft' | 'ring'): HTMLCanvasElement | null {
  const have = holePics[kind];
  if (have) return have;
  const cv = document.createElement('canvas');
  cv.width = cv.height = 128;
  const g = cv.getContext('2d');
  if (!g) return null;
  const gr = g.createRadialGradient(64, 64, kind === 'soft' ? 6.4 : 0, 64, 64, 64);
  const stops: Array<[number, number]> = kind === 'soft' ? [[0, 1], [0.55, 0.75], [1, 0]] : [[0, 1], [0.72, 1], [0.86, 0.55], [1, 0]];
  for (const [at, a] of stops) gr.addColorStop(at, `rgba(0,0,0,${a})`);
  g.fillStyle = gr;
  g.fillRect(0, 0, 128, 128);
  holePics[kind] = cv;
  return cv;
}

/**
 * The dark itself, drawn over the finished scene in screen space: a near-black veil with soft holes cut out for Pokey's lantern
 * and every firefly. `level` fades it in and out at the edges of a dark stretch.
 */
export function drawDarkness(
  ctx: CanvasRenderingContext2D, vw: number, vh: number, level: number,
  hero: { x: number; y: number }, lights: ReadonlyArray<{ x: number; y: number; r: number }>, t: number,
  opts: { heroR?: number; ink?: string; fireflies?: boolean; depth?: number; ring?: boolean } = {},
) {
  if (level <= 0.01 || typeof document === 'undefined') return;
  const soft = holePic('soft');
  const ring = opts.ring ? holePic('ring') : soft;
  if (!soft || !ring) return;
  if (!darkCanvas) darkCanvas = document.createElement('canvas');
  // the veil is all soft edges, so it is painted at half the CSS resolution and stretched over the screen: a phone used to fill, cut and
  // blend a canvas the size of the whole screen every frame (PF-1)
  const dpr = Math.min(DARK_RES, (ctx.getTransform?.().a ?? 1) || 1);
  const cw = Math.max(1, Math.round(vw * dpr));
  const ch = Math.max(1, Math.round(vh * dpr));
  if (darkCanvas.width !== cw || darkCanvas.height !== ch) { darkCanvas.width = cw; darkCanvas.height = ch; }
  const d = darkCanvas.getContext('2d');
  if (!d) return;
  d.setTransform(dpr, 0, 0, dpr, 0, 0);
  d.globalCompositeOperation = 'source-over';
  d.clearRect(0, 0, vw, vh);
  d.fillStyle = opts.ink ?? 'rgb(3, 6, 22)';
  d.fillRect(0, 0, vw, vh);
  d.globalCompositeOperation = 'destination-out';
  const hole = (pic: HTMLCanvasElement, x: number, y: number, r: number, a: number) => {
    d.globalAlpha = a;
    d.drawImage(pic, x - r, y - r, r * 2, r * 2);
  };
  // Pokey's lantern
  hole(ring, hero.x, hero.y, (opts.heroR ?? 210) + Math.sin(t * 3) * 6, 1);
  for (let i = 0; i < lights.length; i++) {
    const l = lights[i];
    const bob = Math.sin(t * 1.7 + i * 2.1);
    hole(soft, l.x + Math.cos(t * 0.9 + i) * 8, l.y + bob * 6, l.r * (0.94 + 0.06 * Math.sin(t * 4 + i)), 0.97);
  }
  d.globalAlpha = 1;
  d.globalCompositeOperation = 'source-over';
  ctx.save();
  ctx.globalAlpha = (opts.depth ?? 0.9) * level;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'low';
  ctx.drawImage(darkCanvas, 0, 0, cw, ch, 0, 0, vw, vh);
  ctx.restore();
  // the fireflies themselves: small warm points in each light (World 3's lights are glowworms, drawn by the stage)
  if (opts.fireflies === false) return;
  const fly = glowPic('#fde047', 'fly');
  ctx.save();
  ctx.globalAlpha = level;
  for (let i = 0; i < lights.length; i++) {
    const l = lights[i];
    if (l.r < 150) continue;
    for (let k = 0; k < 6; k++) {
      const a = t * (0.6 + k * 0.13) + i * 3 + k * 1.7;
      const fx = l.x + Math.cos(a) * (l.r * 0.42) * (0.5 + 0.5 * Math.sin(a * 0.7 + k));
      const fy = l.y + Math.sin(a * 1.3) * 34;
      // (the baked firefly glow, glow.ts: a gradient per firefly per frame was 102 a frame on 8-4, the draw check)
      ctx.drawImage(fly, fx - 9, fy - 9, 18, 18);
    }
  }
  ctx.restore();
}
