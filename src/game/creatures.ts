/**
 * Enemy drawing on top of the creature body engine (creatureRig.ts).
 * Same signatures as the old vectorArt functions, so the game and the boss props call them unchanged.
 */
import type { Enemy } from './types.ts';
import { mixc, softBlob, glossEye } from './drawKit.ts';
import {
  bodyFor,
  clamp,
  damp,
  FollowChain,
  Gait,
  ik2,
  lerp,
  mirrorAbout,
  smooth,
  Spring,
  strokePath,
  VerletChain,
  type Body,
  type V2,
} from './creatureRig.ts';

// ---------------------------------------------------------------------------------------------
// shared bits
// ---------------------------------------------------------------------------------------------

/** cheap deterministic 0..1 noise for blink / twitch timing */
const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

/** true while a periodic event (blink, flick, twitch) is active; `period` seconds, lasting `len`. */
export function pulse(time: number, id: number, period: number, len: number, salt = 0) {
  const cycle = Math.floor(time / period);
  const start = hash(id * 13.7 + cycle * 3.1 + salt) * (period - len);
  const u = time - cycle * period - start;
  return u >= 0 && u < len ? u / len : -1;
}

export function groundShadow(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, a = 0.28) {
  ctx.fillStyle = `rgba(15, 23, 42, ${a})`;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

// ---------------------------------------------------------------------------------------------
// Emerald tree snake
// ---------------------------------------------------------------------------------------------

const SN = 22; // spine points, head first
const SEG = 3.2;
const SNAKE_G = 14; // ground, local y

const snakeR = (i: number) => {
  const t = i / (SN - 1);
  if (t < 0.36) return lerp(5.0, 8.4, smooth(t / 0.36));
  return lerp(8.4, 2.4, Math.pow((t - 0.36) / 0.64, 1.15));
};

interface SnakeRig {
  chain: FollowChain;
  hx: Spring;
  hy: Spring;
  pitch: Spring;
  mouth: Spring;
  rise: Spring;
  mode: 'prowl' | 'rear' | 'strike' | 'recover';
  modeT: number;
  dist: number;
}

function snakeRest(wx: number, wy: number, facing: number, headX: number, headY: number, dist: number, t: number, moving: number): V2[] {
  const out: V2[] = [];
  const neckLen = (SNAKE_G - 6 - headY) * 1.45;
  const baseX = headX - neckLen * 0.42;
  const wavK = 0.34;
  for (let i = 0; i < SN; i++) {
    const a = i * SEG;
    let lx: number;
    let ly: number;
    const r = snakeR(i);
    if (a < neckLen) {
      const u = a / neckLen;
      lx = headX - (baseX < headX ? (headX - baseX) * smooth(u) : 0) - Math.sin(u * Math.PI) * 4;
      ly = headY + (SNAKE_G - r - headY) * Math.pow(u, 1.15);
    } else {
      const b = a - neckLen;
      lx = baseX - b;
      const wave = Math.sin((dist - b) * wavK) * 2.6 * moving + Math.sin(t * 2 - b * 0.22) * 0.9;
      ly = SNAKE_G - r - Math.max(0, wave) * 1.1 - Math.min(0, wave) * 0.2;
    }
    out.push({ x: wx + facing * lx, y: wy + ly });
  }
  return out;
}

export function drawTreeSnake(ctx: CanvasRenderingContext2D, enemy: Enemy, time: number) {
  const b = bodyFor('snake', enemy, time);
  const f = b.facing;
  if (!b.rig) {
    const rest = snakeRest(b.wx, b.wy, f, 18, -19, 0, time, 0);
    const chain = new FollowChain(SN, SEG, b.wx, b.wy);
    chain.reset(rest);
    b.rig = {
      chain, hx: new Spring(18), hy: new Spring(-14), pitch: new Spring(0), mouth: new Spring(0), rise: new Spring(0),
      mode: 'prowl', modeT: 0, dist: 0,
    } as SnakeRig;
  }
  const r = b.rig as SnakeRig;
  const dt = b.dt;
  const id = enemy.id;

  if (dt > 0) {
    if (b.turned) mirrorAbout(b.wx, r.chain.pts);
    r.dist += b.fv * dt;
    // --- strike cycle, driven by the game's isAttacking flag ---
    r.modeT += dt;
    if (enemy.isAttacking) {
      if (r.mode === 'prowl') {
        r.mode = 'rear';
        r.modeT = 0;
      } else if (r.mode === 'rear' && r.modeT > 0.38) {
        r.mode = 'strike';
        r.modeT = 0;
      } else if (r.mode === 'strike' && r.modeT > 0.18) {
        r.mode = 'recover';
        r.modeT = 0;
      } else if (r.mode === 'recover' && r.modeT > 0.55) {
        r.mode = 'rear';
        r.modeT = 0;
      }
    } else if (r.mode !== 'prowl') {
      if (r.mode === 'strike' && r.modeT < 0.18) {
        /* finish the lunge */
      } else {
        r.mode = 'prowl';
        r.modeT = 0;
      }
    }
    let tx = 18;
    let ty = -19 + Math.sin(time * 1.7 + id) * 1.4;
    let tp = Math.sin(time * 1.3 + id) * 0.05;
    let tm = 0;
    if (r.mode === 'rear') {
      tx = 6;
      ty = -31;
      tp = -0.3;
      tm = 0.6;
    } else if (r.mode === 'strike') {
      tx = 36;
      ty = -2;
      tp = 0.5;
      tm = 1;
    } else if (r.mode === 'recover') {
      tx = 20;
      ty = -20;
      tp = 0.1;
      tm = 0.3;
    }
    r.hx.step(tx, r.mode === 'strike' ? 900 : 90, r.mode === 'strike' ? 46 : 13, dt);
    r.hy.step(ty, r.mode === 'strike' ? 900 : 90, r.mode === 'strike' ? 46 : 13, dt);
    r.pitch.step(tp, 120, 14, dt);
    r.mouth.step(tm, 200, 22, dt);

    const moving = clamp(Math.abs(b.fv) / 30, 0, 1);
    const rest = snakeRest(b.wx, b.wy, f, r.hx.x, r.hy.x, r.dist, time, moving);
    const head = { x: b.wx + f * r.hx.x, y: b.wy + r.hy.x };
    if (b.fresh) r.chain.reset(rest);
    const floor = (i: number) => b.wy + SNAKE_G - snakeR(i);
    r.chain.update(head, rest, (i) => (i < 10 ? 16 : 9), dt, floor);
  }

  // ---------------- draw ----------------
  ctx.save();
  ctx.translate(enemy.x, enemy.y);
  if (enemy.wx !== undefined) ctx.translate(-0, 0);
  ctx.scale(b.fs, 1);
  if (enemy.hitFlashTimer > 0) ctx.filter = 'brightness(2.2)';
  const C = { dark: '#2f9a2c', base: '#52c53f', light: '#9be873', belly: '#e4f7a6' };
  const wx = b.wx;
  const wy = b.wy;
  const pts: V2[] = r.chain.pts.map((p) => ({ x: (p.x - wx) * f, y: p.y - wy }));

  groundShadow(ctx, -6, SNAKE_G - 1, 30, 4.5);

  const nrm: V2[] = pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)];
    const c = pts[Math.min(pts.length - 1, i + 1)];
    let dx = a.x - c.x; // toward the head
    let dy = a.y - c.y;
    const d = Math.hypot(dx, dy) || 1;
    dx /= d;
    dy /= d;
    return { x: -dy, y: dx }; // belly side (down when the head points right)
  });
  const strokeBand = (scale: number, color: string, off: number, alpha = 1, from = 1) => {
    ctx.strokeStyle = color;
    ctx.globalAlpha = alpha;
    ctx.lineCap = 'round';
    for (let i = from; i < pts.length; i++) {
      const w = snakeR(i) * 2 * scale;
      ctx.lineWidth = w;
      ctx.beginPath();
      ctx.moveTo(pts[i - 1].x + nrm[i - 1].x * off * snakeR(i - 1), pts[i - 1].y + nrm[i - 1].y * off * snakeR(i - 1));
      ctx.lineTo(pts[i].x + nrm[i].x * off * snakeR(i), pts[i].y + nrm[i].y * off * snakeR(i));
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  };
  strokeBand(1.05, C.dark, 0.04);
  strokeBand(0.88, C.base, -0.04);
  strokeBand(0.4, C.belly, 0.58, 0.95);
  strokeBand(0.22, C.light, -0.6, 0.85);
  // soft scale blotches
  ctx.fillStyle = 'rgba(30, 120, 40, 0.26)';
  for (let i = 4; i < pts.length - 2; i += 2) {
    ctx.beginPath();
    ctx.ellipse(pts[i].x - nrm[i].x * snakeR(i) * 0.15, pts[i].y - nrm[i].y * snakeR(i) * 0.15, snakeR(i) * 0.3, snakeR(i) * 0.2, Math.atan2(pts[i - 1].y - pts[i + 1].y, pts[i - 1].x - pts[i + 1].x), 0, Math.PI * 2);
    ctx.fill();
  }

  // ---------------- head ----------------
  const H = pts[0];
  const open = r.mouth.x;
  ctx.save();
  ctx.translate(H.x, H.y);
  ctx.rotate(r.pitch.x);
  const hg = ctx.createRadialGradient(-7, -7, 2, -2, 0, 19);
  hg.addColorStop(0, C.light);
  hg.addColorStop(0.5, C.base);
  hg.addColorStop(1, C.dark);
  // lower jaw (drops open when striking)
  if (open > 0.05) {
    ctx.save();
    ctx.translate(-2, 5);
    ctx.rotate(open * 0.45);
    ctx.fillStyle = mixc(C.dark, C.base, 0.4);
    ctx.beginPath();
    ctx.ellipse(8, 2, 11, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#e4506a';
    ctx.beginPath();
    ctx.ellipse(10, 4.5 + open * 2, 7.5, 2 + open * 3.8, 0.1, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = hg;
  ctx.beginPath();
  ctx.ellipse(0, 0, 15.5, 13, 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = C.belly;
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  ctx.ellipse(7, 5.5, 8, 4.4 - open * 1.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  const blink = pulse(time, id, 3.4, 0.16) >= 0;
  const eyes: Array<[number, number, number]> = [[-4.5, -4.5, 5.6], [6.5, -5, 6.1]];
  eyes.forEach(([ex, ey, er]) => {
    if (blink) {
      ctx.strokeStyle = '#1f6a22';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ex - er * 0.8, ey);
      ctx.lineTo(ex + er * 0.8, ey);
      ctx.stroke();
    } else glossEye(ctx, ex, ey, er, '#1a1008', { sclera: true, lookX: 0.8 });
  });
  if (r.mode === 'rear' || r.mode === 'strike') {
    ctx.strokeStyle = '#1f4a18';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-9, -10.5);
    ctx.lineTo(4, -7.5);
    ctx.moveTo(2, -11.5);
    ctx.lineTo(12.5, -9);
    ctx.stroke();
  }
  ctx.fillStyle = '#237a22';
  ctx.beginPath();
  ctx.arc(13, 0.5, 1.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 140, 140, 0.45)';
  ctx.beginPath();
  ctx.ellipse(-7.5, 4.5, 3.2, 2.1, 0, 0, Math.PI * 2);
  ctx.fill();
  if (open < 0.2) {
    ctx.strokeStyle = '#1f6a22';
    ctx.lineWidth = 1.7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(2, 5.5);
    ctx.quadraticCurveTo(8.5, 9.5, 14, 5);
    ctx.stroke();
  } else {
    // fangs
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(8, 3.4);
    ctx.lineTo(9.4, 8 + open * 3);
    ctx.lineTo(11, 3.4);
    ctx.fill();
  }
  // tongue: slow idle flicks, constant when alert
  let ext = 0;
  const fl = pulse(time, id, 1.3, 0.45, 5);
  if (fl >= 0) ext = Math.pow(Math.sin(Math.PI * fl), 0.6);
  if (r.mode === 'rear') ext = Math.max(ext, 0.75 + Math.sin(time * 40) * 0.2);
  if (r.mode === 'strike') ext = 0;
  if (ext > 0.02) {
    const tl = 5 + ext * 13;
    const wig = Math.sin(time * 46 + id) * 1.4 * ext;
    const mx = 14;
    const my = 5.8 + open * 2;
    ctx.strokeStyle = '#ff5c86';
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(mx, my);
    ctx.quadraticCurveTo(mx + tl * 0.55, my + 2.2 + wig * 0.5, mx + tl, my + 1.2 + wig);
    ctx.stroke();
    ctx.lineWidth = 1.7;
    const fk = 2.6 + ext * 1.8;
    ctx.beginPath();
    ctx.moveTo(mx + tl, my + 1.2 + wig);
    ctx.lineTo(mx + tl + fk, my - 1.4 + wig);
    ctx.moveTo(mx + tl, my + 1.2 + wig);
    ctx.lineTo(mx + tl + fk, my + 3.8 + wig);
    ctx.stroke();
  }
  if (enemy.telegraphTimer > 0) {
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(2, 0, 26, 0, Math.PI * 2);
    ctx.stroke();
  }
  enemy.headDeco?.(ctx);
  ctx.restore();
  ctx.restore();
}

// ---------------------------------------------------------------------------------------------
// Ocelot
// ---------------------------------------------------------------------------------------------

const OC_G = 19; // ground, local y

interface OcelotRig {
  gait: Gait;
  tail: VerletChain;
  head: Spring;
  headY: Spring;
  earL: Spring;
  earR: Spring;
  torso: Spring;
  pitch: Spring;
  dist: number;
  bob: number;
  wasAir: boolean;
}

const OC_LEGS = [
  // group 0: near-front + far-hind (trot diagonal)   group 1: far-front + near-hind
  { hx: 13, hy: 1, l1: 12.5, l2: 13, bend: 1 as const, group: 0, restX: 4 }, // near front
  { hx: 10, hy: 1, l1: 12.5, l2: 13, bend: 1 as const, group: 1, restX: 4 }, // far front
  { hx: -14, hy: 2, l1: 12.5, l2: 12.5, bend: -1 as const, group: 1, restX: -3 }, // near hind
  { hx: -11, hy: 2, l1: 12.5, l2: 12.5, bend: -1 as const, group: 0, restX: -3 }, // far hind
];

const ocTailRest = (wx: number, wy: number, f: number, t: number, id: number, lift: number): V2[] => {
  const out: V2[] = [];
  for (let i = 0; i < 9; i++) {
    const sway = Math.sin(t * 2.3 + id + i * 0.55) * i * 0.55;
    const lx = -21 - i * 4.4 + i * i * 0.1;
    const ly = -7 - Math.pow(i, 1.55) * 1.35 * lift + sway;
    out.push({ x: wx + f * lx, y: wy + ly });
  }
  return out;
};

export function drawOcelot(ctx: CanvasRenderingContext2D, enemy: Enemy, time: number) {
  const b = bodyFor('ocelot', enemy, time);
  const f = b.facing;
  if (!b.rig) {
    const tail = new VerletChain(9, 4.4, b.wx, b.wy);
    tail.reset(ocTailRest(b.wx, b.wy, f, time, enemy.id, 1));
    b.rig = {
      gait: new Gait(OC_LEGS), tail, head: new Spring(0), headY: new Spring(0), earL: new Spring(0), earR: new Spring(0),
      torso: new Spring(0), pitch: new Spring(0), dist: 0, bob: 0, wasAir: false,
    } as OcelotRig;
  }
  const r = b.rig as OcelotRig;
  const dt = b.dt;
  const air = enemy.state === 'leap';
  const groundWorld = (enemy.groundY !== undefined ? enemy.groundY / (enemy.rigScale ?? 1) : b.wy) + OC_G;
  const height = Math.max(0, groundWorld - (b.wy + OC_G));
  const speed = air ? 0 : Math.abs(b.fv);
  const run = clamp(speed / 150, 0, 1);

  if (dt > 0) {
    if (b.turned) {
      r.gait.mirror(b.wx);
      mirrorAbout(b.wx, r.tail.pts);
      mirrorAbout(b.wx, r.tail.prev);
    }
    if (r.wasAir && !air) r.gait.plant(b, groundWorld, 0);
    r.wasAir = air;
    r.dist += speed * dt;
    const stride = 11 + speed * 0.05;
    const ph = (r.dist / stride) * Math.PI;
    r.bob = damp(r.bob, air ? 0 : -Math.abs(Math.sin(ph)) * (1.2 + run * 2.4), 18, dt);
    r.gait.update(
      b,
      { stepDist: 8 + speed * 0.02, stepHeight: 5 + run * 4, slow: 0.26, fast: 0.12, groundY: groundWorld, maxLead: 18, airborne: air },
      r.bob
    );
    r.pitch.step(air ? clamp(b.vy / 300, -0.5, 0.55) : 0, 90, 12, dt);
    r.torso.step(-clamp(b.fv / 150, -1, 1) * 0.08 + Math.sin(ph * 2) * 0.012 * (1 + run), 120, 13, dt);
    r.head.step(-r.bob * 0.4, 130, 12, dt);
    r.headY.step(-r.bob * 0.7 + (run > 0.5 ? 1.5 : 0), 110, 11, dt);
    // ears twitch now and then
    const tw = pulse(time, enemy.id, 2.7, 0.3, 2);
    r.earL.step(tw >= 0 ? Math.sin(tw * Math.PI * 4) * 0.45 : -run * 0.25, 280, 18, dt);
    const tw2 = pulse(time, enemy.id, 3.3, 0.3, 9);
    r.earR.step(tw2 >= 0 ? Math.sin(tw2 * Math.PI * 4) * -0.45 : -run * 0.25, 280, 18, dt);
    // tail: trails behind when running, curls up when strolling
    const lift = lerp(1, 0.25, run);
    const rest = ocTailRest(b.wx, b.wy + r.bob, f, time, enemy.id, lift);
    if (b.fresh) r.tail.reset(rest);
    r.tail.update({ x: b.wx - f * 20, y: b.wy - 7 + r.bob }, rest, 0.9, 5, 260, dt);
  }

  // ---------------- draw ----------------
  ctx.save();
  ctx.translate(enemy.x, enemy.y);
  ctx.scale(b.fs, 1);
  if (enemy.hitFlashTimer > 0) ctx.filter = 'brightness(2.2)';
  const GOLD = '#dba444';
  const GOLD_D = '#b97a22';
  const CREAM = '#fff3d4';
  const DARK = '#2b1a10';
  const wx = b.wx;
  const wy = b.wy;

  const sh = 1 - clamp(height / 90, 0, 0.5);
  groundShadow(ctx, -2, OC_G - 1 + height, 31 * sh, 5.5 * sh, 0.28 * sh);
  ctx.save();
  ctx.translate(0, -6);
  ctx.rotate(r.pitch.x);
  ctx.translate(0, 6);

  // tail (behind everything)
  const tp: V2[] = r.tail.pts.map((p) => ({ x: (p.x - wx) * f, y: p.y - wy }));
  ctx.lineCap = 'round';
  for (let i = 0; i < tp.length - 1; i++) {
    const w = lerp(10.5, 8, i / (tp.length - 1));
    ctx.strokeStyle = i >= tp.length - 3 ? DARK : i % 3 === 1 ? '#5a3418' : GOLD;
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(tp[i].x, tp[i].y);
    ctx.lineTo(tp[i + 1].x, tp[i + 1].y);
    ctx.stroke();
  }

  const legs = r.gait.solve(
    b,
    r.bob,
    air
      ? (i) => {
          const fall = smooth(clamp((b.vy + 50) / 200, 0, 1));
          const s = OC_LEGS[i];
          return i < 2 ? { x: s.hx + lerp(14, 7, fall), y: s.hy + lerp(6, 14, fall) } : { x: s.hx + lerp(-13, -3, fall), y: s.hy + lerp(8, 14, fall) };
        }
      : undefined
  );
  const drawLeg = (i: number, shade: number) => {
    const L = legs[i];
    const s = OC_LEGS[i];
    const col = mixc(GOLD, '#6b4217', shade);
    const hip = { x: s.hx, y: s.hy + r.bob };
    const pts = [hip, { x: L.kx, y: L.ky }, { x: L.fx, y: L.fy }];
    strokePath(ctx, pts, 11, 7.6, mixc(col, '#2a1408', 0.28));
    strokePath(ctx, pts.map((p) => ({ x: p.x - 0.6, y: p.y - 0.7 })), 8.8, 5.8, col);
    // paw
    softBlob(ctx, L.fx + 1.8, L.fy - 1.2, 6.6, 3.9, 0, shade > 0.1 ? mixc('#fff4dc', '#a07a40', shade) : '#ffffff', 0.25);
  };
  drawLeg(3, 0.38);
  drawLeg(1, 0.38);

  ctx.save();
  ctx.translate(0, r.bob);
  ctx.rotate(r.torso.x);
  // body
  softBlob(ctx, 0, -6, 25, 17, 0.04, GOLD);
  softBlob(ctx, 3, -1, 16, 9.5, 0, CREAM, 0.12);
  ctx.fillStyle = DARK;
  [[-14, -12], [-5, -15], [6, -13], [-10, -4], [-19, -4]].forEach(([sx, sy]) => {
    ctx.beginPath();
    ctx.ellipse(sx, sy, 4.4, 2.8, 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = GOLD_D;
    ctx.beginPath();
    ctx.ellipse(sx, sy, 1.8, 1.1, 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = DARK;
  });
  ctx.restore();

  drawLeg(2, 0.06);
  drawLeg(0, 0.06);

  // head: springs behind the body for follow-through
  ctx.save();
  ctx.translate(r.head.x, r.bob + r.headY.x * 0.6);
  ctx.rotate(-r.torso.x * 0.6);
  [[10, -30, r.earL.x], [30, -30, r.earR.x]].forEach(([ex, ey, tw], i) => {
    ctx.save();
    ctx.translate(ex, ey + 6);
    ctx.rotate((i ? 0.25 : -0.25) + tw);
    ctx.translate(0, -6);
    softBlob(ctx, 0, 0, 7.5, 8.6, 0, DARK, 0.1);
    softBlob(ctx, i ? -0.5 : 0.5, 1, 4.6, 5.8, 0, '#f4a3b4', 0.1);
    softBlob(ctx, i ? -2 : 2, 0.5, 2.4, 4.6, 0, '#ffffff', 0.1);
    ctx.restore();
  });
  softBlob(ctx, 20, -17, 19, 16, 0, GOLD);
  softBlob(ctx, 20, -10, 14.5, 8.4, 0, CREAM, 0.1);
  ctx.strokeStyle = DARK;
  ctx.lineCap = 'round';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  [[15, -31, 16, -26], [20, -32, 20, -25], [25, -31, 24, -26]].forEach(([x1, y1, x2, y2]) => {
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
  });
  ctx.stroke();
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(3, -14);
  ctx.quadraticCurveTo(9, -11, 11, -7);
  ctx.moveTo(3, -9);
  ctx.quadraticCurveTo(8, -7, 10, -3);
  ctx.moveTo(38, -14);
  ctx.quadraticCurveTo(33, -11, 31, -7);
  ctx.stroke();
  const blink = pulse(time, enemy.id, 3.1, 0.15, 1) >= 0;
  if (blink) {
    ctx.strokeStyle = DARK;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(7, -19);
    ctx.quadraticCurveTo(13.5, -16, 20, -19);
    ctx.moveTo(22, -19);
    ctx.quadraticCurveTo(28.5, -16, 35, -19);
    ctx.stroke();
  } else {
    glossEye(ctx, 13.5, -19, 7.4, '#6b3f1c', { ring: '#b07a3a', lookX: 0.6 });
    glossEye(ctx, 28.5, -19, 6.8, '#6b3f1c', { ring: '#b07a3a', lookX: 0.8 });
    ctx.strokeStyle = DARK;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(13.5, -19, 8, Math.PI * 1.05, Math.PI * 1.85);
    ctx.arc(28.5, -19, 7.4, Math.PI * 1.15, Math.PI * 1.95);
    ctx.stroke();
  }
  ctx.fillStyle = '#ff7a98';
  ctx.beginPath();
  ctx.ellipse(21.5, -11.4, 3.6, 2.6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#6b3f1c';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(21.5, -9);
  ctx.lineTo(21.5, -7);
  ctx.moveTo(15, -6.5);
  ctx.quadraticCurveTo(18.5, -3, 21.5, -7);
  ctx.quadraticCurveTo(24.5, -3, 28, -6.5);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255, 150, 150, 0.5)';
  ctx.beginPath();
  ctx.ellipse(8, -8, 3, 2, 0, 0, Math.PI * 2);
  ctx.ellipse(34, -8, 3, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.restore();
  ctx.restore();
}


// ---------------------------------------------------------------------------------------------
// Harpy eagle
// ---------------------------------------------------------------------------------------------

type EagleMode = 'patrol' | 'flare' | 'dive' | 'hover' | 'climb';

interface EagleRig {
  ph: number;
  omega: number;
  amp: number;
  fold: number;
  rise: number;
  gape: number;
  legMode: number; // 0 tuck, 1 dangle, 2 talons forward
  pitch: Spring;
  tail: Spring;
  foot: Spring[]; // x0,y0,x1,y1
  headY: Spring;
}

const dirOf = (a: number): V2 => ({ x: Math.cos(a), y: Math.sin(a) });

export function drawHarpyEagle(ctx: CanvasRenderingContext2D, enemy: Enemy, time: number) {
  const b = bodyFor('eagle', enemy, time);
  if (!b.rig) {
    b.rig = {
      ph: enemy.id * 1.7, omega: 12, amp: 0.85, fold: 0, rise: 0, gape: 0, legMode: 0,
      pitch: new Spring(0), tail: new Spring(0), foot: [new Spring(-8), new Spring(24), new Spring(2), new Spring(25)],
      headY: new Spring(0),
    } as EagleRig;
  }
  const r = b.rig as EagleRig;
  const dt = b.dt;
  const phase = enemy.swoopPhase;
  let mode: EagleMode = 'patrol';
  if (phase === 'telegraph' || (enemy.telegraphTimer > 0 && phase !== 'swoop')) mode = 'flare';
  else if (phase === 'swoop' || enemy.isAttacking) mode = 'dive';
  else if (phase === 'hover') mode = 'hover';
  else if (phase === 'ascend') mode = 'climb';

  let pitchBias = 0;
  if (dt > 0) {
    const T = {
      patrol: { w: 12, a: 0.85, f: 0, rise: 0, l: 0, g: 0 },
      flare: { w: 36, a: 0.2, f: 0, rise: -0.55, l: 1, g: 1 },
      dive: { w: 6, a: 0.08, f: 1, rise: 0, l: 2, g: 0.45 },
      hover: { w: 21, a: 0.8, f: 0, rise: 0.1, l: 1, g: 0 },
      climb: { w: 17, a: 1.0, f: 0, rise: -0.1, l: 0, g: 0 },
    }[mode];
    r.omega = damp(r.omega, T.w, 9, dt);
    r.amp = damp(r.amp, T.a, 9, dt);
    r.fold = damp(r.fold, T.f, 10, dt);
    r.rise = damp(r.rise, T.rise, 9, dt);
    r.legMode = damp(r.legMode, T.l, 8, dt);
    r.gape = damp(r.gape, T.g, 14, dt);
    r.ph += r.omega * dt;
    pitchBias = mode === 'hover' ? -0.28 : mode === 'flare' ? -0.15 : 0;
    const tp = clamp(Math.atan2(b.vy, Math.abs(b.fv) + 25) * 0.85, -0.7, 0.9) + pitchBias;
    r.pitch.step(tp, 70, 11, dt);
    r.tail.step(-r.pitch.x * 0.7 + Math.sin(r.ph - 1.4) * 0.14 * r.amp, 90, 9, dt);
    // feet: tucked back in cruise, hanging when hovering, talons forward in the dive
    const hips = [-3, 7];
    for (let k = 0; k < 2; k++) {
      const sway = Math.sin(time * 5 + k * 1.3 + enemy.id) * 1.2;
      const tx = lerp(lerp(hips[k] - 9, hips[k] + 2 + sway, clamp(r.legMode, 0, 1)), hips[k] + 24 + k * 6, clamp(r.legMode - 1, 0, 1));
      const ty = lerp(lerp(23, 34 + sway, clamp(r.legMode, 0, 1)), 20 + k * 6, clamp(r.legMode - 1, 0, 1));
      r.foot[k * 2].step(tx, 120, 13, dt);
      r.foot[k * 2 + 1].step(ty, 120, 13, dt);
    }
    r.headY.step(-Math.sin(r.ph) * 1.2 * r.amp, 130, 12, dt);
  }

  ctx.save();
  ctx.translate(enemy.x, enemy.y);
  ctx.scale(b.fs, 1);
  if (enemy.hitFlashTimer > 0) ctx.filter = 'brightness(2.4)';

  const BR = '#8d5b2b';
  const TAN = '#d4a05a';
  const CREAM = '#f7e8c4';
  const BLUE = '#6f89ac';
  const flapBob = -Math.sin(r.ph) * 2.6 * r.amp;
  const isSwooping = mode === 'dive';
  const isHovering = mode === 'hover';
  const isTelegraphing = mode === 'flare';

  if (isHovering) {
    ctx.save();
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.85)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, -6, 40, 0, Math.PI * 2);
    ctx.stroke();
    ctx.font = 'bold 12px sans-serif';
    for (let k = 0; k < 3; k++) {
      const a = time * 5 + (k * Math.PI * 2) / 3;
      ctx.fillText('✨', 16 + Math.cos(a) * 22, -16 + Math.sin(a) * 12);
    }
    ctx.restore();
  }

  ctx.save();
  ctx.translate(0, flapBob);
  ctx.rotate(r.pitch.x);

  // ---- wing ----
  const wing = (sx: number, sy: number, delay: number, scale: number, tone: number) => {
    const ph = r.ph - delay;
    const mid = lerp(-0.85 + r.rise, 2.75, r.fold);
    const amp = 1.3 * r.amp;
    const a1 = mid + amp * Math.sin(ph);
    const a2 = mid + amp * 0.95 * Math.sin(ph - 0.55) + r.fold * 0.12;
    const a3 = mid + amp * 0.8 * Math.sin(ph - 1.15) + r.fold * 0.1;
    const L1 = 23 * scale;
    const L2 = 21 * scale;
    const S = { x: sx, y: sy };
    const E = { x: S.x + Math.cos(a1) * L1, y: S.y + Math.sin(a1) * L1 };
    const W = { x: E.x + Math.cos(a2) * L2, y: E.y + Math.sin(a2) * L2 };
    const down = clamp(Math.cos(ph - 0.3), -1, 1); // 1 at top of the upstroke -> feathers bunch, -1 on the down-power stroke
    const spread = lerp(0.2, 0.09, (down + 1) / 2) * (1 - r.fold * 0.6);
    const dark = (k: number) => mixc(BLUE, '#2e4466', tone + k);
    // secondaries trail from the forearm
    for (let j = 0; j < 5; j++) {
      const u = (j + 0.5) / 5;
      const bx = lerp(E.x, W.x, u);
      const by = lerp(E.y, W.y, u);
      const fx = Math.cos(a2) * 0.35 - 0.9;
      const fy = Math.sin(a2) * 0.35 + 0.22;
      const ang = Math.atan2(fy, fx);
      const len = (22 - j * 0.8) * scale * (1 - r.fold * 0.3);
      softBlob(ctx, bx + Math.cos(ang) * len * 0.45, by + Math.sin(ang) * len * 0.45, len * 0.55, 5.4 * scale, ang, dark(0.12 + j * 0.03));
    }
    // primaries fan from the wrist
    for (let k = 0; k < 6; k++) {
      const ang = a3 + (k - 2.5) * spread + 0.12;
      const len = (37 - Math.abs(k - 1.5) * 2.6) * scale;
      const bx = W.x + Math.cos(a3) * k * 1.2;
      const by = W.y + Math.sin(a3) * k * 1.2;
      softBlob(ctx, bx + Math.cos(ang) * len * 0.5, by + Math.sin(ang) * len * 0.5, len * 0.58, 6.6 * scale, ang, dark(0.02 + k * 0.045));
    }
    // arm bones + tan coverts
    strokePath(ctx, [S, E, W], 8 * scale, 5.5 * scale, mixc(TAN, BR, 0.35 + tone * 0.4));
    for (let k = 0; k < 3; k++) {
      const u = (k + 0.4) / 3;
      softBlob(ctx, lerp(S.x, E.x, u) - 1, lerp(S.y, E.y, u) + 1, 8 * scale, 5.2 * scale, a1 + 0.2, mixc(TAN, BR, 0.1 + k * 0.1 + tone * 0.3));
    }
  };

  wing(-8, -9, 0.45, 0.88, 0.32); // far wing, darker, a beat behind

  // ---- tail feathers ----
  ctx.save();
  ctx.translate(-17, 13);
  ctx.rotate(r.tail.x);
  softBlob(ctx, -10, 1, 14, 5.4, 0.1, '#6b4423');
  softBlob(ctx, -12, 6.5, 13, 4.8, 0.32, '#7a5128');
  softBlob(ctx, -9, -4, 12, 4.4, -0.14, '#5f3d1e');
  ctx.restore();

  // ---- body with scalloped feather rows ----
  softBlob(ctx, 2, 3, 19, 22, 0.12, BR);
  const scallop = (x: number, y: number, rr: number, c: string) => {
    const g = ctx.createLinearGradient(0, y - rr, 0, y + rr);
    g.addColorStop(0, mixc(c, '#ffffff', 0.22));
    g.addColorStop(1, mixc(c, '#2a1408', 0.3));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, rr, 0, Math.PI);
    ctx.quadraticCurveTo(x, y - rr * 1.1, x + rr, y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = mixc(c, '#2a1408', 0.5);
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, rr, 0.1, Math.PI - 0.1);
    ctx.stroke();
    ctx.globalAlpha = 1;
  };
  for (let row = 0; row < 4; row++) for (let col = 0; col < 3; col++) scallop(-7 + col * 9 + (row % 2) * 4.5, 4 + row * 5.5, 5.4, mixc(TAN, BR, 0.3 + row * 0.12));
  for (let row = 0; row < 3; row++) for (let col = 0; col < 3 - (row === 2 ? 1 : 0); col++) scallop(4 + col * 8 + (row % 2) * 4 - 2, -3 + row * 6, 5.6, mixc(CREAM, '#cdb48a', 0.1 + row * 0.1));

  // ---- legs (two-bone IK) ----
  const hips = [-3, 7];
  for (let k = 0; k < 2; k++) {
    const hx = hips[k];
    const hy = 17;
    const fx = r.foot[k * 2].x;
    const fy = r.foot[k * 2 + 1].x;
    const L = ik2(hx, hy, fx, fy, 7, 8.5, k === 0 ? 1 : -1);
    strokePath(ctx, [{ x: hx, y: hy }, { x: L.kx, y: L.ky }, { x: L.fx, y: L.fy }], 7.5, 5.4, '#f39a2a');
    softBlob(ctx, L.fx + 1, L.fy + 1, 4.6, 3.4, 0, '#f39a2a');
    const spread = 0.35 + r.legMode * 0.12;
    for (let t = -1; t <= 1; t++) {
      const a = (isSwooping ? 0.2 : 1.35) + t * spread;
      const cx = L.fx + 1 + Math.cos(a) * 4.5;
      const cy = L.fy + 1 + Math.sin(a) * 4.5;
      softBlob(ctx, cx, cy, 2.4, 3.8, a - Math.PI / 2, '#f7b448', 0.2);
    }
  }

  wing(2, -7, 0, 0.98, 0.04); // near wing

  // ---- crest ----
  const blade = (bx: number, by: number, tx: number, ty: number, w: number, c: string) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.moveTo(bx - w, by);
    ctx.quadraticCurveTo((bx + tx) / 2 - w * 0.6, (by + ty) / 2, tx, ty);
    ctx.quadraticCurveTo((bx + tx) / 2 + w * 0.8, (by + ty) / 2 + 2, bx + w, by);
    ctx.closePath();
    ctx.fill();
  };
  // head counter-rotates against the body so it stays steady and looks where it's going
  ctx.save();
  ctx.translate(13, -8 + r.headY.x * 0.5);
  ctx.rotate(-r.pitch.x * 0.6);
  ctx.translate(-13, 8);
  const crestFlare = isTelegraphing ? 1 : 0;
  const cw = Math.sin(time * 3 + enemy.id) * 1.2 + (isSwooping ? 6 : 0);
  blade(6, -24, -10 - cw - crestFlare * 4, -46 + crestFlare * 3, 4, '#f1d28f');
  blade(10, -27, 0 - cw * 0.7, -50 + crestFlare * 2, 4.5, CREAM);
  blade(15, -28, 12, -52 - crestFlare * 3, 4.5, '#f1d28f');
  blade(20, -26, 24 + cw * 0.5, -48, 4, CREAM);
  blade(2, -20, -14 - cw, -38, 3.5, TAN);

  softBlob(ctx, 15, -15, 17, 15.5, 0, '#c99556');
  softBlob(ctx, 13, -7, 12, 7.5, 0, CREAM, 0.15);
  const blink = pulse(time, enemy.id, 3.7, 0.14, 4) >= 0;
  if (blink) {
    ctx.strokeStyle = '#3a2412';
    ctx.lineWidth = 2.6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(13, -16);
    ctx.quadraticCurveTo(20.5, -12.5, 28, -17);
    ctx.stroke();
  } else glossEye(ctx, 20.5, -16, 8.2, '#3a2412', { ring: '#8ec9ee', lookX: 0.9, lash: true });
  if (isSwooping || isTelegraphing) {
    ctx.strokeStyle = '#3a2412';
    ctx.lineWidth = 2.6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(11, -27);
    ctx.lineTo(27, -21);
    ctx.stroke();
  }
  // beak: upper hooked mandible + lower jaw that drops for the screech
  const gape = r.gape;
  if (gape > 0.05) {
    ctx.save();
    ctx.translate(27, -8);
    ctx.rotate(gape * 0.55);
    ctx.fillStyle = '#e8a61a';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(8, 1, 11, 6);
    ctx.quadraticCurveTo(5, 6, 0, 3);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#c0392b';
    ctx.beginPath();
    ctx.moveTo(27, -8);
    ctx.lineTo(36, -3);
    ctx.lineTo(34 + gape * 2, 1 + gape * 5);
    ctx.lineTo(27, -3);
    ctx.fill();
  }
  const bg = ctx.createLinearGradient(26, -18, 36, -2);
  bg.addColorStop(0, '#ffd84a');
  bg.addColorStop(1, '#e8a61a');
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.moveTo(28, -17);
  ctx.quadraticCurveTo(43, -14, 38, -2 - gape * 0.5);
  ctx.quadraticCurveTo(33, -7, 27, -8);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(120, 70, 10, 0.5)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.fillStyle = '#7a4a12';
  ctx.beginPath();
  ctx.arc(31, -13, 1.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.beginPath();
  ctx.ellipse(34, -13, 3.5, 1.3, 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 140, 140, 0.45)';
  ctx.beginPath();
  ctx.ellipse(10, -6, 3.4, 2.2, 0, 0, Math.PI * 2);
  ctx.fill();
  enemy.headDeco?.(ctx);
  ctx.restore(); // head
  ctx.restore(); // body bob + pitch

  if (isTelegraphing) {
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.95)';
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.arc(0, 0, 42, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(16, -56, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('!', 16, -56);
  }
  ctx.restore();
}

// ---------------------------------------------------------------------------------------------
// Poison-dart frog and canopy spider (hazards; also the Bog Behemoth / Tarantula Queen bodies)
// ---------------------------------------------------------------------------------------------

type FrogPhase = 'idle' | 'crouch' | 'air' | 'land';
interface FrogRig {
  phase: FrogPhase;
  t: number;
  wait: number;
  sx: Spring;
  sy: Spring;
  tongue: number;
  lift: number;
}

const FROG_G = 14;

function drawFrog(ctx: CanvasRenderingContext2D, enemy: Enemy, time: number) {
  const b = bodyFor('frog', enemy, time);
  if (!b.rig) {
    b.rig = { phase: 'idle', t: 0, wait: 0.8 + hash(enemy.id) * 1.4, sx: new Spring(1), sy: new Spring(1), tongue: -1, lift: 0 } as FrogRig;
  }
  const r = b.rig as FrogRig;
  const dt = b.dt;
  const HOP = 0.56;
  if (dt > 0) {
    r.t += dt;
    if (r.phase === 'idle' && r.t > r.wait) {
      r.phase = 'crouch';
      r.t = 0;
    } else if (r.phase === 'crouch' && r.t > 0.17) {
      r.phase = 'air';
      r.t = 0;
      r.sy.kick(9);
      r.sx.kick(-5);
    } else if (r.phase === 'air' && r.t > HOP) {
      r.phase = 'land';
      r.t = 0;
      r.sy.kick(-9);
      r.sx.kick(6);
    } else if (r.phase === 'land' && r.t > 0.2) {
      r.phase = 'idle';
      r.t = 0;
      r.wait = 0.9 + hash(enemy.id * 3.3 + time) * 1.8;
    }
    const sq = r.phase === 'crouch' ? 0.8 : r.phase === 'air' ? 1.14 : r.phase === 'land' ? 0.86 : 1 + Math.sin(time * 5) * 0.012;
    r.sy.step(sq, 320, 22, dt);
    r.sx.step(1 / Math.sqrt(Math.max(0.5, sq)), 320, 22, dt);
    r.lift = r.phase === 'air' ? Math.sin((r.t / HOP) * Math.PI) * (17 / (enemy.rigScale ?? 1)) : 0;
    // tongue snap while idling
    const tg = r.phase === 'idle' ? pulse(time, enemy.id, 3.4, 0.3, 11) : -1;
    r.tongue = tg;
  }
  const hop = r.phase === 'air' ? clamp(r.t / HOP, 0, 1) : 0;

  ctx.save();
  ctx.translate(enemy.x, enemy.y);
  ctx.scale(b.fs, 1);
  if (enemy.hitFlashTimer > 0) ctx.filter = 'brightness(2.2)';
  const B = '#2a8cf0';
  groundShadow(ctx, 0, FROG_G, 18 - r.lift * 0.25, 4 - r.lift * 0.08, 0.25 - r.lift * 0.005);
  ctx.translate(0, -r.lift);
  ctx.translate(0, FROG_G);
  ctx.scale(r.sx.x, r.sy.x);
  ctx.translate(0, -FROG_G);

  // hind leg (two-bone IK): folds under the body at rest, kicks out behind in the air
  const hip = { x: -9, y: 6 };
  const foot =
    r.phase === 'air' ? { x: -9 - 15 * Math.sin(hop * Math.PI * 0.9 + 0.5) - 3, y: 6 + 7 + hop * 4 }
    : r.phase === 'crouch' ? { x: -14, y: FROG_G }
    : { x: -16, y: FROG_G - 0.5 };
  const hl = ik2(hip.x, hip.y, foot.x, foot.y, 10, 11, 0);
  const hind = [hip, { x: hl.kx, y: hl.ky }, { x: hl.fx, y: hl.fy }];
  strokePath(ctx, hind, 10, 6, mixc(B, '#0a3a8a', 0.4));
  softBlob(ctx, hl.fx - 2, hl.fy - 0.5, 7, 2.8, 0, '#5db6ff', 0.2);
  // body
  softBlob(ctx, 0, 0, 18, 14, 0, B);
  softBlob(ctx, 3, 5, 12, 7, 0, '#a8dcff', 0.1);
  ctx.fillStyle = '#10243e';
  [[-6, -5, 3.3], [3, -7, 2.8], [-10, 2, 2.6], [8, -1, 2.2]].forEach(([sx, sy, sr]) => {
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
  });
  // throat sac pulse
  const pulseSz = (Math.sin(time * 6) + 1) * 1.2;
  softBlob(ctx, 14, 5, 5 + pulseSz, 4 + pulseSz, 0, '#c9e8ff', 0.1);
  // bulging eyes (they sink when blinking)
  const blink = pulse(time, enemy.id, 2.6, 0.18, 2) >= 0;
  softBlob(ctx, 5, -11, 7.4, 7, 0, B);
  softBlob(ctx, 15, -10, 6.6, 6.4, 0, B);
  if (blink) {
    ctx.strokeStyle = '#10243e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(1, -10.5);
    ctx.lineTo(10, -10.5);
    ctx.moveTo(11, -9.5);
    ctx.lineTo(19, -9.5);
    ctx.stroke();
  } else {
    glossEye(ctx, 6, -11.5, 5.2, '#e9a31a', { ring: '#ffd04a', lookX: 0.9 });
    glossEye(ctx, 15.5, -10.5, 4.8, '#e9a31a', { ring: '#ffd04a', lookX: 0.9 });
  }
  ctx.strokeStyle = '#10243e';
  ctx.lineWidth = 1.6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(8, 1);
  ctx.quadraticCurveTo(16, 6, 22, 1);
  ctx.stroke();
  if (r.tongue >= 0) {
    const e = Math.sin(Math.PI * Math.pow(r.tongue, 0.7));
    const len = 6 + e * 17;
    ctx.strokeStyle = '#ff6f91';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(21, 1.5);
    ctx.lineTo(21 + len, 0.5 - e * 2);
    ctx.stroke();
    ctx.fillStyle = '#ff6f91';
    ctx.beginPath();
    ctx.arc(21 + len, 0.5 - e * 2, 3 * (0.6 + e * 0.5), 0, Math.PI * 2);
    ctx.fill();
  }
  // front leg: planted ahead, tucks in mid-air
  const fl = ik2(9, 7, r.phase === 'air' ? 12 : 14, r.phase === 'air' ? 11 : FROG_G - 1, 6, 6.5, 0);
  strokePath(ctx, [{ x: 9, y: 7 }, { x: fl.kx, y: fl.ky }, { x: fl.fx, y: fl.fy }], 6.5, 4.5, mixc(B, '#0a3a8a', 0.15));
  softBlob(ctx, fl.fx + 2, fl.fy, 5.4, 3, 0, '#5db6ff', 0.2);
  enemy.headDeco?.(ctx);
  ctx.restore();
}

interface SpiderRig {
  gait: Gait;
  bob: Spring;
  dist: number;
  sway: Spring;
}

const SP_G = 17; // ground, local y
export const spiderLegs = (() => {
  const L: ConstructorParameters<typeof Gait>[0] = [];
  [-1, 1].forEach((side) => {
    for (let leg = 0; leg < 4; leg++) {
      // alternate tetrapod groups: front-left/back-left alternate against the right side's pattern
      const group = (leg + (side > 0 ? 1 : 0)) % 2;
      L.push({ hx: side * 6, hy: -4 + leg * 2.6, l1: 16 + (leg === 0 || leg === 3 ? 1 : 0), l2: 18, bend: 0, group, restX: side * (19 + leg * 3.4) });
    }
  });
  return L;
})();

function drawSpider(ctx: CanvasRenderingContext2D, enemy: Enemy, time: number) {
  const b = bodyFor('spider', enemy, time);
  const hanging = !(enemy as unknown as { noThread?: boolean }).noThread;
  if (!b.rig) b.rig = { gait: new Gait(spiderLegs), bob: new Spring(0), dist: 0, sway: new Spring(0) } as SpiderRig;
  const r = b.rig as SpiderRig;
  const dt = b.dt;
  // the spider is seen head-on: local space is world space, no left/right flip
  const bb: Body = { ...b, facing: 1 };
  const speed = Math.abs(b.vx);
  if (dt > 0 && !hanging) {
    r.dist += speed * dt;
    r.bob.step(-Math.abs(Math.sin((r.dist / 9) * Math.PI)) * (0.8 + clamp(speed / 80, 0, 1) * 1.8), 200, 18, dt);
    r.gait.update(bb, { stepDist: 7 + speed * 0.04, stepHeight: 6, slow: 0.22, fast: 0.12, groundY: b.wy + SP_G, maxLead: 10 }, r.bob.x);
  }
  if (dt > 0 && hanging) r.bob.step(Math.sin(time * 1.9 + enemy.id) * 2.2, 60, 6, dt);
  const bob = r.bob.x;

  ctx.save();
  ctx.translate(enemy.x, enemy.y);
  const O = '#f2812a';
  if (enemy.hitFlashTimer > 0) ctx.filter = 'brightness(2.2)';
  if (hanging) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, -70);
    ctx.lineTo(0, -12 + bob);
    ctx.stroke();
  } else {
    groundShadow(ctx, 0, SP_G, 26, 4.5);
  }

  // legs: eight two-bone limbs. Walking = planted feet; hanging = feet dangle and curl.
  const legs = hanging
    ? spiderLegs.map((s, i) => {
        const wave = Math.sin(time * 3 + i * 1.3 + enemy.id) * 2.6;
        const fx = s.restX * 1.1 + wave;
        const fy = 9 + (i % 4) * 2.5 + Math.cos(time * 2.4 + i) * 2.2;
        return ik2(s.hx, s.hy + bob, fx, fy, s.l1, s.l2, 0);
      })
    : r.gait.solve(bb, bob);
  const drawLegs = (far: boolean) => {
    spiderLegs.forEach((s, i) => {
      const isFar = i % 4 >= 2; // rear legs sit behind the body
      if (isFar !== far) return;
      const L = legs[i];
      const pts = [{ x: s.hx, y: s.hy + bob }, { x: L.kx, y: L.ky }, { x: L.fx, y: L.fy }];
      strokePath(ctx, pts, 5.8, 3.2, '#4a2410');
      strokePath(ctx, pts.map((p) => ({ x: p.x, y: p.y - 0.6 })), 4.4, 2.3, '#7a4420');
    });
  };
  drawLegs(true);
  softBlob(ctx, 0, 4 + bob, 15, 13.5, 0, O);
  ctx.fillStyle = '#ffd7a8';
  [[-5, 0], [5, 0], [0, 6], [-8, 7], [8, 7]].forEach(([sx, sy]) => {
    ctx.beginPath();
    ctx.arc(sx, sy + bob, 2.4, 0, Math.PI * 2);
    ctx.fill();
  });
  drawLegs(false);
  softBlob(ctx, 0, -7 + bob, 11, 9, 0, '#8a4a22');
  const blink = pulse(time, enemy.id, 3.9, 0.15, 6) >= 0;
  if (blink) {
    ctx.strokeStyle = '#1a1008';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-8, -8 + bob);
    ctx.lineTo(-1, -8 + bob);
    ctx.moveTo(1, -8 + bob);
    ctx.lineTo(8, -8 + bob);
    ctx.stroke();
  } else {
    glossEye(ctx, -4.4, -8 + bob, 4.6, '#1a1008', { sclera: true, lookX: 0 });
    glossEye(ctx, 4.4, -8 + bob, 4.6, '#1a1008', { sclera: true, lookX: 0 });
  }
  // chelicerae twitch
  const tw = Math.sin(time * 9 + enemy.id) * 0.5;
  ctx.strokeStyle = '#3a1a0a';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-3, -1 + bob);
  ctx.quadraticCurveTo(0, 2 + bob, 3, -1 + bob);
  ctx.stroke();
  ctx.fillStyle = '#ffd7a8';
  ctx.beginPath();
  ctx.moveTo(-2.6, -0.4 + bob);
  ctx.lineTo(-1.6 + tw, 3 + bob);
  ctx.lineTo(-0.6, -0.2 + bob);
  ctx.moveTo(2.6, -0.4 + bob);
  ctx.lineTo(1.6 - tw, 3 + bob);
  ctx.lineTo(0.6, -0.2 + bob);
  ctx.fill();
  ctx.restore();
}

export function drawHazardEntity(ctx: CanvasRenderingContext2D, enemy: Enemy, time: number) {
  if (enemy.type === 'frog') drawFrog(ctx, enemy, time);
  else if (enemy.type === 'spider') drawSpider(ctx, enemy, time);
}
