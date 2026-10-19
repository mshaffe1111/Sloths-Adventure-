/**
 * Drawing for the timed zones (see zones.ts). Everything is a function of the zone's state and the clock, so a cloud or a gust looks the
 * same to every player at the same moment, and the three beats read clearly:
 *   idle   - nearly nothing: a wisp now and then
 *   warn   - the mushrooms swell and glow / leaves start to stream and chevrons pulse: "it is about to start"
 *   active - the cloud fills the box / the gust streams hard
 */
import { zoneState, type Zone } from './zones.ts';

const hash = (n: number) => {
  const v = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
};

interface View { x: number; y: number; w: number; h: number }

const visible = (z: Zone, cam: View) => z.x1 > cam.x - 80 && z.x0 < cam.x + cam.w + 80 && z.bottom > cam.y - 80 && z.top < cam.y + cam.h + 80;

/** the mushrooms that puff the clouds: drawn before the player, on top of the ground */
export function drawSporeMushrooms(ctx: CanvasRenderingContext2D, zones: readonly Zone[] | undefined, cam: View, t: number) {
  if (!zones) return;
  for (const z of zones) {
    if (z.kind !== 'spore' || !z.emit || !visible(z, cam)) continue;
    const st = zoneState(z, t);
    const swell = st.phase === 'warn' ? 1 + 0.32 * Math.sin(st.u * Math.PI * (0.5 + st.u * 2.5)) ** 2 + 0.1 * st.u : st.phase === 'active' ? 1.12 - 0.12 * st.u + 0.06 * Math.sin(t * 18) * st.strength : 1;
    const glow = st.phase === 'warn' ? 0.3 + 0.7 * st.u : st.phase === 'active' ? 0.6 * st.strength : 0;
    z.emit.forEach((ex, i) => {
      const by = z.baseY;
      ctx.save();
      ctx.translate(ex, by);
      // ground glow
      if (glow > 0) {
        const g = ctx.createRadialGradient(0, -4, 2, 0, -4, 70);
        g.addColorStop(0, `rgba(216, 180, 254, ${0.55 * glow})`);
        g.addColorStop(1, 'rgba(216, 180, 254, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(0, -4, 70, 22, 0, 0, Math.PI * 2);
        ctx.fill();
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

/** the clouds and gusts themselves: drawn over the player, so the hero is inside them */
export function drawZoneEffects(ctx: CanvasRenderingContext2D, zones: readonly Zone[] | undefined, cam: View, t: number) {
  if (!zones) return;
  for (const z of zones) {
    if (!visible(z, cam)) continue;
    const st = zoneState(z, t);
    if (z.kind === 'spore') drawCloud(ctx, z, st, t);
    else drawGust(ctx, z, st, t);
  }
}

function drawCloud(ctx: CanvasRenderingContext2D, z: Zone, st: ReturnType<typeof zoneState>, t: number) {
  const w = z.x1 - z.x0;
  const h = z.baseY - z.top;
  // a few wisps always, so an idle cloud is still a place you can see
  const idleWisps = st.phase === 'idle' ? 0.25 : 0;
  const level = st.phase === 'active' ? st.strength : st.phase === 'warn' ? 0.18 + 0.3 * st.u : idleWisps;
  if (level <= 0) return;
  const n = Math.max(10, Math.round(w / 18));
  ctx.save();
  // a haze that fills the box so the cloud reads as a place, soft at its edges
  ctx.save();
  ctx.translate((z.x0 + z.x1) / 2, z.baseY + 6);
  ctx.scale(w / 2, h);
  const hz = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
  hz.addColorStop(0, `rgba(192, 132, 252, ${0.42 * level})`);
  hz.addColorStop(0.7, `rgba(167, 139, 250, ${0.2 * level})`);
  hz.addColorStop(1, 'rgba(167, 139, 250, 0)');
  ctx.fillStyle = hz;
  ctx.beginPath();
  ctx.arc(0, 0, 1, Math.PI, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
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
    const g = ctx.createRadialGradient(x, y, 1, x, y, r);
    g.addColorStop(0, `rgba(221, 205, 255, ${a})`);
    g.addColorStop(0.6, `rgba(167, 139, 250, ${a * 0.6})`);
    g.addColorStop(1, 'rgba(167, 139, 250, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  // glittering spores
  if (st.phase === 'active') {
    ctx.fillStyle = `rgba(253, 246, 178, ${0.85 * st.strength})`;
    const m = Math.round(w / 14);
    for (let i = 0; i < m; i++) {
      const s = hash(i * 1.7 + z.x1 * 0.011);
      const x = z.x0 + s * w + Math.sin(t * 1.3 + i) * 10;
      const y = z.baseY - 12 - (((t * (14 + s * 22) + s * 400) % h) );
      ctx.fillRect(x, y, 2.4, 2.4);
    }
  }
  ctx.restore();
}

function drawGust(ctx: CanvasRenderingContext2D, z: Zone, st: ReturnType<typeof zoneState>, t: number) {
  const w = z.x1 - z.x0;
  const h = z.bottom - z.top;
  const level = st.phase === 'active' ? st.strength : st.phase === 'warn' ? 0.15 + 0.5 * st.u : 0.05;
  ctx.save();
  ctx.beginPath();
  ctx.rect(z.x0, z.top, w, h);
  ctx.clip();
  ctx.lineCap = 'round';
  // streaks racing along the lane, longer and faster the harder it blows
  const n = Math.max(14, Math.round((w * h) / 2600));
  const speed = z.force * (st.phase === 'active' ? 2.6 : 1.1);
  for (let i = 0; i < n; i++) {
    const sx = hash(i * 2.1 + z.x0 * 0.01);
    const sy = hash(i * 5.3 + z.x1 * 0.01);
    const len = 46 + sx * 90 * (0.4 + level);
    const travel = (t * speed * (0.7 + sy * 0.6) + sx * (w + 200)) % (w + 200);
    const x = z.dir === 1 ? z.x0 - 100 + travel : z.x1 + 100 - travel;
    const y = z.top + 20 + sy * (h - 40) + Math.sin(t * 2 + i) * 4;
    ctx.strokeStyle = i % 3 === 0 ? `rgba(240, 253, 250, ${0.7 * level * (0.5 + sy * 0.5)})` : `rgba(15, 118, 110, ${0.55 * level * (0.5 + sy * 0.5)})`;
    ctx.lineWidth = 2 + sy * 2.4;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + z.dir * len * 0.5, y - 5 * Math.sin(t * 3 + i), x + z.dir * len, y);
    ctx.stroke();
  }
  // leaves tumbling with it
  const leaves = Math.round(w / 60) + 3;
  for (let i = 0; i < leaves; i++) {
    const sx = hash(i * 9.9 + z.x0 * 0.02);
    const sy = hash(i * 3.7 + z.x1 * 0.02);
    const travel = (t * speed * (0.55 + sy * 0.4) + sx * (w + 160)) % (w + 160);
    const x = z.dir === 1 ? z.x0 - 80 + travel : z.x1 + 80 - travel;
    const y = z.top + 40 + sy * (h - 80) + Math.sin(t * 3.4 + i * 2) * 14;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(t * (2 + sx * 3) * z.dir + i);
    ctx.fillStyle = `rgba(${i % 2 ? '134, 239, 172' : '74, 222, 128'}, ${Math.min(1, 0.15 + level)})`;
    ctx.beginPath();
    ctx.ellipse(0, 0, 11, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
  // chevrons that say which way it blows: they pulse in the warning and stay solid while it blows
  if (st.phase !== 'idle') {
    const a = st.phase === 'warn' ? 0.3 + 0.5 * Math.abs(Math.sin(st.u * Math.PI * 6)) : 0.85 * st.strength;
    const cx = (z.x0 + z.x1) / 2;
    const cy = z.top + 34;
    ctx.save();
    ctx.strokeStyle = `rgba(255, 255, 255, ${a})`;
    ctx.shadowColor = 'rgba(15, 23, 42, 0.8)';
    ctx.shadowBlur = 4;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let k = -1; k <= 1; k++) {
      const x = cx + k * 34;
      ctx.beginPath();
      ctx.moveTo(x - z.dir * 9, cy - 13);
      ctx.lineTo(x + z.dir * 9, cy);
      ctx.lineTo(x - z.dir * 9, cy + 13);
      ctx.stroke();
    }
    ctx.restore();
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
