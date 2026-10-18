/**
 * The sloth's real predators, drawn on the creature body engine (creatureRig.ts):
 * jaguar, boa constrictor, spectacled caiman and tayra.
 *
 * Behaviour lives in predatorAI.ts; this file only reads `enemy.state` / `enemy.stateT` and poses a body
 * to match, so what you see is always what the game logic is doing.
 */
import type { Enemy } from './types.ts';
import { mixc, softBlob, glossEye } from './drawKit.ts';
import { pulse, groundShadow } from './creatures.ts';
import {
  bodyFor,
  clamp,
  damp,
  FollowChain,
  Gait,
  lerp,
  mirrorAbout,
  smooth,
  Spring,
  strokePath,
  VerletChain,
  type LegSpec,
  type V2,
} from './creatureRig.ts';

// ---------------------------------------------------------------------------------------------
// Jaguar
// ---------------------------------------------------------------------------------------------

const JG = 24; // ground, local y

const JG_LEGS: LegSpec[] = [
  // group 0: near-front + far-hind   group 1: far-front + near-hind (walk-trot)
  { hx: 20, hy: 3, l1: 14, l2: 15.5, bend: 1, group: 0, restX: 4 }, // near front
  { hx: 15, hy: 3, l1: 14, l2: 15.5, bend: 1, group: 1, restX: 4 }, // far front
  { hx: -20, hy: 4, l1: 14, l2: 14.5, bend: -1, group: 1, restX: -3 }, // near hind
  { hx: -15, hy: 4, l1: 14, l2: 14.5, bend: -1, group: 0, restX: -3 }, // far hind
];

interface JaguarRig {
  gait: Gait;
  tail: VerletChain;
  headX: Spring;
  headY: Spring;
  earL: Spring;
  earR: Spring;
  torso: Spring;
  crouch: Spring;
  jaw: Spring;
  pitch: Spring;
  squash: Spring;
  dist: number;
  bob: number;
  wasAir: boolean;
  lastState: string;
}

const jgTailRest = (wx: number, wy: number, f: number, t: number, id: number, lift: number, lash: number): V2[] => {
  const out: V2[] = [];
  for (let i = 0; i < 11; i++) {
    const sway = Math.sin(t * 2.1 + id + i * 0.5) * i * 0.45 + Math.sin(t * 17 + i * 0.7) * i * 0.75 * lash;
    const lx = -27 - i * 5.1 + i * i * 0.12;
    const ly = -9 - Math.pow(i, 1.5) * 1.15 * lift + sway;
    out.push({ x: wx + f * lx, y: wy + ly });
  }
  return out;
};

const rosette = (ctx: CanvasRenderingContext2D, x: number, y: number, s: number, rot: number, fill: string) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(0, 0, 5.4 * s, 3.7 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#2a1408';
  ctx.lineWidth = 2.5 * s;
  ctx.beginPath();
  ctx.ellipse(0, 0, 5.4 * s, 3.7 * s, 0, Math.PI * 0.12, Math.PI * 1.88);
  ctx.stroke();
  ctx.fillStyle = '#2a1408';
  ctx.beginPath();
  ctx.arc(0.5 * s, 0, 1.15 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

export function drawJaguar(ctx: CanvasRenderingContext2D, enemy: Enemy, time: number) {
  const b = bodyFor('jaguar', enemy, time);
  const f = b.facing;
  if (!b.rig) {
    const tail = new VerletChain(11, 5.1, b.wx, b.wy);
    tail.reset(jgTailRest(b.wx, b.wy, f, time, enemy.id, 1, 0));
    b.rig = {
      gait: new Gait(JG_LEGS), tail, headX: new Spring(0), headY: new Spring(0), earL: new Spring(0), earR: new Spring(0),
      torso: new Spring(0), crouch: new Spring(0), jaw: new Spring(0), pitch: new Spring(0), squash: new Spring(0),
      dist: 0, bob: 0, wasAir: false, lastState: 'patrol',
    } as JaguarRig;
  }
  const r = b.rig as JaguarRig;
  const dt = b.dt;
  const st = enemy.state ?? 'patrol';
  const air = st === 'leap';
  const speed = Math.abs(b.fv);
  const run = clamp(speed / 120, 0, 1);
  const groundWorld = (enemy.groundY !== undefined ? enemy.groundY / (enemy.rigScale ?? 1) : b.wy) + JG;
  const height = Math.max(0, groundWorld - (b.wy + JG));

  if (dt > 0) {
    if (b.turned) {
      r.gait.mirror(b.wx);
      mirrorAbout(b.wx, r.tail.pts);
      mirrorAbout(b.wx, r.tail.prev);
    }
    if (st !== r.lastState) {
      if (st === 'recover') {
        r.squash.x = 1; // landing: body slams down, then settles
        r.squash.v = -6;
      }
      r.lastState = st;
    }
    if (r.wasAir && !air) r.gait.plant(b, groundWorld, 0);
    r.wasAir = air;

    r.dist += speed * dt;
    const stride = 14 + speed * 0.06;
    const ph = (r.dist / stride) * Math.PI;
    const walkBob = -Math.abs(Math.sin(ph)) * (1.1 + run * 1.8);
    r.bob = damp(r.bob, air ? 0 : walkBob, 18, dt);
    const crouchT = st === 'windup' ? 1 : st === 'recover' ? 0.18 : 0;
    r.crouch.step(crouchT, st === 'windup' ? 55 : 150, st === 'windup' ? 11 : 15, dt);
    const sq = r.squash.step(0, 170, 11, dt);
    const dy = r.crouch.x * 9 + sq * 5;
    r.gait.update(
      b,
      { stepDist: 10 + speed * 0.02, stepHeight: 6 + run * 3, slow: 0.3, fast: 0.15, groundY: groundWorld, maxLead: 18, airborne: air },
      r.bob + dy
    );
    r.torso.step(-clamp(b.fv / 150, -1, 1) * 0.06 + Math.sin(ph * 2) * 0.012 + r.crouch.x * 0.08, 110, 12, dt);
    r.pitch.step(air ? clamp(b.vy / 330, -0.55, 0.6) : 0, 90, 12, dt);
    r.headX.step(r.crouch.x * 5 + (air ? 3 : 0) - r.bob * 0.3, 120, 12, dt);
    r.headY.step(r.crouch.x * 7 + sq * 4 - r.bob * 0.6, 110, 11, dt);
    r.jaw.step(st === 'windup' ? 0.45 : air ? 1 : st === 'recover' ? 0.3 + Math.sin(time * 11) * 0.12 : 0, 170, 16, dt);
    const tw = pulse(time, enemy.id, 2.9, 0.3, 2);
    const flat = st === 'windup' || air;
    r.earL.step(flat ? 0.9 : tw >= 0 ? Math.sin(tw * Math.PI * 4) * 0.4 : -run * 0.2, 250, 18, dt);
    const tw2 = pulse(time, enemy.id, 3.5, 0.3, 9);
    r.earR.step(flat ? -0.9 : tw2 >= 0 ? Math.sin(tw2 * Math.PI * 4) * -0.4 : -run * 0.2, 250, 18, dt);
    const lift = air ? 0.15 : lerp(1, 0.3, run);
    const lash = st === 'windup' ? 1 : 0;
    const rest = jgTailRest(b.wx, b.wy + r.bob + dy, f, time, enemy.id, lift, lash);
    if (b.fresh) r.tail.reset(rest);
    r.tail.update({ x: b.wx - f * 26, y: b.wy - 9 + r.bob + dy }, rest, lash ? 0.55 : 0.9, lash ? 3 : 5, 260, dt);
  }

  // ---------------- draw ----------------
  const dy = r.crouch.x * 9 + r.squash.x * 5;
  ctx.save();
  ctx.translate(enemy.x, enemy.y);
  ctx.scale(b.fs, 1);
  if (enemy.hitFlashTimer > 0) ctx.filter = 'brightness(2.2)';
  const GOLD = '#e6a137';
  const GOLD_D = '#c47a1f';
  const CREAM = '#fff0cc';
  const DARK = '#2a1408';
  const wx = b.wx;
  const wy = b.wy;

  groundShadow(ctx, -2, JG - 1 + height, 36 * (1 - clamp(height / 110, 0, 0.5)), 6 * (1 - clamp(height / 110, 0, 0.5)), 0.3 * (1 - clamp(height / 140, 0, 0.6)));

  ctx.save();
  ctx.translate(0, -6);
  ctx.rotate(r.pitch.x);
  ctx.translate(0, 6);

  // tail
  const tp: V2[] = r.tail.pts.map((p) => ({ x: (p.x - wx) * f, y: p.y - wy }));
  ctx.lineCap = 'round';
  for (let i = 0; i < tp.length - 1; i++) {
    const w = lerp(11.5, 8.5, i / (tp.length - 1));
    ctx.strokeStyle = i >= tp.length - 3 ? DARK : i % 3 === 1 ? '#6b3c14' : GOLD;
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(tp[i].x, tp[i].y);
    ctx.lineTo(tp[i + 1].x, tp[i + 1].y);
    ctx.stroke();
  }

  const air4 = air
    ? (i: number): V2 | null => {
        const fall = smooth(clamp((b.vy + 60) / 240, 0, 1));
        const s = JG_LEGS[i];
        if (i < 2) return { x: s.hx + lerp(18, 9, fall), y: s.hy + lerp(7, 17, fall) };
        return { x: s.hx + lerp(-16, -3, fall), y: s.hy + lerp(9, 17, fall) };
      }
    : undefined;
  const legs = r.gait.solve(b, r.bob + dy, air4);
  const drawLeg = (i: number, shade: number) => {
    const L = legs[i];
    const s = JG_LEGS[i];
    const col = mixc(GOLD, '#6b4217', shade);
    const hip = { x: s.hx, y: s.hy + r.bob + dy };
    const pts = [hip, { x: L.kx, y: L.ky }, { x: L.fx, y: L.fy }];
    strokePath(ctx, pts, 13, 8.8, mixc(col, '#2a1408', 0.3));
    strokePath(ctx, pts.map((p) => ({ x: p.x - 0.6, y: p.y - 0.8 })), 10.6, 6.8, col);
    ctx.fillStyle = DARK;
    ctx.globalAlpha = 0.55;
    ctx.beginPath();
    ctx.arc(lerp(hip.x, L.kx, 0.55), lerp(hip.y, L.ky, 0.55), 1.6, 0, Math.PI * 2);
    ctx.arc(lerp(L.kx, L.fx, 0.5) - 1, lerp(L.ky, L.fy, 0.5), 1.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    softBlob(ctx, L.fx + 2.4, L.fy - 1.4, 8, 4.6, 0, mixc('#f3c26a', '#7a5a2a', shade), 0.3);
    ctx.strokeStyle = 'rgba(42, 20, 8, 0.6)';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(L.fx + 5, L.fy - 3);
    ctx.lineTo(L.fx + 5.6, L.fy + 0.8);
    ctx.moveTo(L.fx + 7.6, L.fy - 2.4);
    ctx.lineTo(L.fx + 8, L.fy + 0.4);
    ctx.stroke();
  };
  drawLeg(3, 0.4);
  drawLeg(1, 0.4);

  // torso
  ctx.save();
  ctx.translate(0, r.bob + dy);
  ctx.rotate(r.torso.x);
  softBlob(ctx, -2, -10, 31, 13.5, 0.03, GOLD, 0.3);
  softBlob(ctx, 15, -9, 16, 15.5, 0, GOLD, 0);
  softBlob(ctx, -18, -9, 14, 15, 0, GOLD, 0);
  softBlob(ctx, 2, 1, 22, 7.5, 0, CREAM, 0.1);
  rosette(ctx, -22, -14, 1.1, 0.4, GOLD_D);
  rosette(ctx, -12, -18, 1.15, 0.1, GOLD_D);
  rosette(ctx, -1, -19, 1.15, -0.1, GOLD_D);
  rosette(ctx, 10, -19, 1.1, -0.2, GOLD_D);
  rosette(ctx, 19, -15, 1.0, -0.4, GOLD_D);
  rosette(ctx, -17, -6, 1.0, 0.3, GOLD_D);
  rosette(ctx, -6, -9, 1.1, 0, GOLD_D);
  rosette(ctx, 5, -10, 1.05, 0, GOLD_D);
  rosette(ctx, 15, -4, 0.85, -0.2, GOLD_D);
  ctx.restore();

  drawLeg(2, 0.05);
  drawLeg(0, 0.05);

  // ---------------- head ----------------
  const HX = 41 + r.headX.x;
  const HY = -19 + r.bob + dy * 0.9 + r.headY.x;
  const open = r.jaw.x;
  ctx.save();
  ctx.translate(HX, HY);
  ctx.rotate(-r.torso.x * 0.5 + (air ? r.pitch.x * -0.35 : 0));
  // ears
  ([[-12, -15, r.earL.x], [12, -15, r.earR.x]] as Array<[number, number, number]>).forEach(([ex, ey, tw], i) => {
    ctx.save();
    ctx.translate(ex, ey + 5);
    ctx.rotate((i ? 0.3 : -0.3) + tw * 0.7);
    ctx.translate(0, -5);
    softBlob(ctx, 0, 0, 7.8, 7.8, 0, GOLD, 0.2);
    ctx.strokeStyle = DARK;
    ctx.lineWidth = 2.1;
    ctx.beginPath();
    ctx.arc(0, 0.5, 7.4, Math.PI * 1.05, Math.PI * 1.95);
    ctx.stroke();
    softBlob(ctx, i ? -0.5 : 0.5, 1.5, 4.2, 4.6, 0, '#f4a3b4', 0.1);
    ctx.restore();
  });
  // lower jaw
  if (open > 0.04) {
    ctx.save();
    ctx.translate(0, 9);
    ctx.rotate(0);
    ctx.fillStyle = mixc(GOLD, '#5a2a10', 0.35);
    ctx.beginPath();
    ctx.ellipse(1, 3 + open * 4.5, 11.5, 4.6 + open * 1.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#7a1730';
    ctx.beginPath();
    ctx.ellipse(1, 7.5 + open * 2.5, 9, 2.2 + open * 4.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ff7a98';
    ctx.beginPath();
    ctx.ellipse(1.5, 11 + open * 3.4, 5, 1.8 + open * 1.6, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  softBlob(ctx, 0, 0, 22, 17.5, 0, GOLD, 0.3);
  // cheek ruff
  softBlob(ctx, -19, 5, 5.5, 7, 0.3, GOLD, 0);
  softBlob(ctx, 19, 5, 5.5, 7, -0.3, GOLD, 0);
  softBlob(ctx, 0, 8, 14.5, 8.8, 0, CREAM, 0.1);
  // forehead + cheek spots
  ctx.fillStyle = DARK;
  [[-8, -12, 1.5], [-3, -14, 1.3], [3, -14, 1.3], [8, -12, 1.5], [-14, -4, 1.4], [14, -4, 1.4], [-11, 2, 1.2], [11, 2, 1.2]].forEach(([sx, sy, sr]) => {
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
  });
  // whisker dots
  ctx.fillStyle = 'rgba(42, 20, 8, 0.7)';
  [[-6, 8], [-9, 10.5], [-4, 11], [6, 8], [9, 10.5], [4, 11]].forEach(([sx, sy]) => {
    ctx.beginPath();
    ctx.arc(sx, sy, 0.95, 0, Math.PI * 2);
    ctx.fill();
  });
  // eyes
  const blink = pulse(time, enemy.id, 3.3, 0.15, 1) >= 0 && st === 'patrol';
  const mad = clamp(st === 'windup' ? 1 : air ? 0.8 : st === 'recover' ? 0.2 : 0.35, 0, 1);
  const eyeSq = 1 - mad * 0.3;
  ([[-10.5, -3], [10.5, -3]] as Array<[number, number]>).forEach(([ex, ey], i) => {
    if (blink) {
      ctx.strokeStyle = DARK;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(ex - 4.6, ey);
      ctx.quadraticCurveTo(ex, ey + 2.6, ex + 4.6, ey);
      ctx.stroke();
      return;
    }
    ctx.save();
    ctx.translate(ex, ey);
    ctx.scale(1, eyeSq);
    glossEye(ctx, 0, 0, 5.7, '#a3a732', { ring: '#e6d958', lookX: 0.6 });
    ctx.restore();
    // heavy brow: slants inward-down as it gets angrier
    ctx.strokeStyle = DARK;
    ctx.lineWidth = 2.6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    const s = i ? -1 : 1;
    ctx.moveTo(ex - s * 6.5, ey - 7.5 + mad * 1.2);
    ctx.lineTo(ex + s * 5, ey - 6 - mad * 3.4);
    ctx.stroke();
    ctx.fillStyle = 'rgba(42, 20, 8, 0.28)';
    ctx.beginPath();
    ctx.ellipse(ex, ey - 4.2 + mad * 1.2, 6.4, 2.6 + mad * 2, 0, Math.PI, Math.PI * 2);
    ctx.fill();
  });
  // nose + mouth
  ctx.fillStyle = '#5a2a30';
  ctx.beginPath();
  ctx.moveTo(-4.4, 3.2);
  ctx.quadraticCurveTo(0, 1, 4.4, 3.2);
  ctx.quadraticCurveTo(0, 8.2, -4.4, 3.2);
  ctx.fill();
  ctx.fillStyle = '#ff9aa6';
  ctx.beginPath();
  ctx.ellipse(-0.6, 3.2, 1.6, 0.9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#4a2410';
  ctx.lineWidth = 1.7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  if (open < 0.12) {
    ctx.moveTo(0, 6);
    ctx.lineTo(0, 8.4);
    ctx.moveTo(-8.5, 9);
    ctx.quadraticCurveTo(-3.5, 12, 0, 8.4);
    ctx.quadraticCurveTo(3.5, 12, 8.5, 9);
  } else {
    ctx.moveTo(0, 6);
    ctx.lineTo(0, 8);
  }
  ctx.stroke();
  if (open > 0.12) {
    ctx.fillStyle = '#fffdf2';
    ctx.strokeStyle = 'rgba(80, 50, 30, 0.5)';
    ctx.lineWidth = 0.8;
    [[-6.5, 1], [6.5, -1]].forEach(([fx, s]) => {
      ctx.beginPath();
      ctx.moveTo(fx - 2, 8.6);
      ctx.lineTo(fx + s * 0.4, 8.6 + 4.6 + open * 2.4);
      ctx.lineTo(fx + 2, 8.6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });
  }
  ctx.fillStyle = 'rgba(255, 140, 130, 0.4)';
  ctx.beginPath();
  ctx.ellipse(-15, 4, 3, 2, 0, 0, Math.PI * 2);
  ctx.ellipse(15, 4, 3, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  enemy.headDeco?.(ctx);
  ctx.restore();

  ctx.restore();
  ctx.restore();
}

// ---------------------------------------------------------------------------------------------
// Boa constrictor
// ---------------------------------------------------------------------------------------------

const BN = 34; // spine points, head first
const BSEG = 4.1;
const BG = 16; // ground, local y

const boaR = (i: number) => {
  const t = i / (BN - 1);
  if (t < 0.16) return lerp(7.2, 10.2, smooth(t / 0.16));
  if (t < 0.55) return lerp(10.2, 11.2, smooth((t - 0.16) / 0.39));
  return lerp(11.2, 2.4, Math.pow((t - 0.55) / 0.45, 1.1));
};

interface BoaRig {
  chain: FollowChain;
  hx: Spring;
  hy: Spring;
  pitch: Spring;
  mouth: Spring;
  hump: Spring;
  lastState: string;
}

/** the body's resting shape: a neck from the head down to the ground, then a lumpy heap trailing behind */
function boaRest(wx: number, wy: number, f: number, headX: number, headY: number, hump: number, t: number): V2[] {
  const out: V2[] = [];
  const neckLen = Math.max(14, (BG - 10 - headY) * 1.25);
  const baseX = headX - neckLen * 0.4;
  let px = 0;
  let py = 0;
  let i = 0;
  for (; i < BN; i++) {
    const a = i * BSEG;
    const r = boaR(i);
    let lx: number;
    let ly: number;
    if (a < neckLen) {
      const u = a / neckLen;
      lx = headX - (headX - baseX) * smooth(u) - Math.sin(u * Math.PI) * 3.5;
      ly = headY + (BG - r - headY) * Math.pow(u, 1.15);
      px = lx;
      py = ly;
    } else {
      const k = i - Math.floor(neckLen / BSEG);
      const phase = k * 0.62;
      const lump = hump * (0.5 - 0.5 * Math.cos(phase)) * (1 - clamp(k / 26, 0, 0.75));
      ly = BG - r - lump + Math.sin(t * 2.0 - k * 0.3) * 0.5;
      const dy = ly - py;
      lx = px - Math.sqrt(Math.max(0.5, BSEG * BSEG - dy * dy));
      px = lx;
      py = ly;
    }
    out.push({ x: wx + f * lx, y: wy + ly });
  }
  return out;
}

export function drawBoa(ctx: CanvasRenderingContext2D, enemy: Enemy, time: number) {
  const b = bodyFor('boa', enemy, time);
  const f = b.facing;
  if (!b.rig) {
    const rest = boaRest(b.wx, b.wy, f, 22, -3, 24, time);
    const chain = new FollowChain(BN, BSEG, b.wx, b.wy);
    chain.reset(rest);
    b.rig = { chain, hx: new Spring(22), hy: new Spring(-3), pitch: new Spring(0), mouth: new Spring(0), hump: new Spring(24), lastState: 'coil' } as BoaRig;
  }
  const r = b.rig as BoaRig;
  const dt = b.dt;
  const st = enemy.state ?? 'coil';
  const id = enemy.id;
  const T = enemy.stateT ?? 0;

  if (dt > 0) {
    if (b.turned) mirrorAbout(b.wx, r.chain.pts);
    let tx = 22 + Math.sin(time * 1.1 + id) * 1.2;
    let ty = -3 + Math.sin(time * 1.9 + id) * 1.1;
    let tp = Math.sin(time * 1.3 + id) * 0.04;
    let tm = 0;
    let th = 24;
    let k = 60;
    let c = 11;
    if (st === 'rear') {
      // rises up and sways back, mouth cracked, hissing
      const u = smooth(T / 0.45);
      tx = lerp(22, 5, u) + Math.sin(time * 9) * 1.2 * u;
      ty = lerp(-3, -37, u);
      tp = -0.35 * u;
      tm = 0.5 * u;
      th = lerp(24, 12, u);
    } else if (st === 'strike') {
      tx = 118;
      ty = -1;
      tp = 0.35;
      tm = 1;
      th = 1;
      k = 1300;
      c = 52;
    } else if (st === 'bite') {
      tx = 112;
      ty = 1;
      tp = 0.3;
      tm = 0.15;
      th = 2;
      k = 400;
      c = 30;
    } else if (st === 'recover') {
      tx = 30;
      ty = -10;
      tp = 0.05;
      tm = 0.2;
      th = 16;
      k = 36;
      c = 9;
    }
    r.hx.step(tx, k, c, dt);
    r.hy.step(ty, k, c, dt);
    r.pitch.step(tp, 120, 14, dt);
    r.mouth.step(tm, 220, 22, dt);
    r.hump.step(th, 40, 9, dt);
    const rest = boaRest(b.wx, b.wy, f, r.hx.x, r.hy.x, r.hump.x, time);
    const head = { x: b.wx + f * r.hx.x, y: b.wy + r.hy.x };
    if (b.fresh) r.chain.reset(rest);
    const strike = st === 'strike' || st === 'bite';
    r.chain.update(head, rest, (i) => (strike ? (i < 8 ? 26 : 5) : i < 10 ? 16 : 10), dt, (i) => b.wy + BG - boaR(i));
  }

  // ---------------- draw ----------------
  ctx.save();
  ctx.translate(enemy.x, enemy.y);
  ctx.scale(b.fs, 1);
  if (enemy.hitFlashTimer > 0) ctx.filter = 'brightness(2.2)';
  const wx = b.wx;
  const wy = b.wy;
  const pts: V2[] = r.chain.pts.map((p) => ({ x: (p.x - wx) * f, y: p.y - wy }));
  const C = { dark: '#4a2a12', base: '#cc9d5a', light: '#efd29a', belly: '#f8ebc4', saddle: '#6a3a1a', tail: '#c24a2a' };
  const breathe = 1 + Math.sin(time * 2.2 + id) * 0.035;

  groundShadow(ctx, -14, BG - 1, 44, 5.5);

  const rad = (i: number) => boaR(i) * breathe;
  const nrm: V2[] = pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)];
    const c = pts[Math.min(pts.length - 1, i + 1)];
    let dx = a.x - c.x;
    let dy = a.y - c.y;
    const d = Math.hypot(dx, dy) || 1;
    dx /= d;
    dy /= d;
    return { x: -dy, y: dx };
  });
  const tailMix = (i: number) => clamp((i / (BN - 1) - 0.7) / 0.28, 0, 1);
  const band = (scale: number, color: (i: number) => string, off: number, alpha = 1) => {
    ctx.lineCap = 'round';
    ctx.globalAlpha = alpha;
    for (let i = 1; i < pts.length; i++) {
      ctx.strokeStyle = color(i);
      ctx.lineWidth = rad(i) * 2 * scale;
      ctx.beginPath();
      ctx.moveTo(pts[i - 1].x + nrm[i - 1].x * off * rad(i - 1), pts[i - 1].y + nrm[i - 1].y * off * rad(i - 1));
      ctx.lineTo(pts[i].x + nrm[i].x * off * rad(i), pts[i].y + nrm[i].y * off * rad(i));
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  };
  // draw tail-first so the heap overlaps naturally: the head end sits on top
  band(1.06, (i) => mixc(C.dark, '#6a1d12', tailMix(i)), 0.04);
  band(0.9, (i) => mixc(C.base, C.tail, tailMix(i)), -0.04);
  band(0.42, () => C.belly, 0.58, 0.95);
  band(0.2, () => C.light, -0.62, 0.8);
  // saddle blotches along the back
  for (let i = 3; i < pts.length - 3; i += 2) {
    const ang = Math.atan2(pts[i - 1].y - pts[i + 1].y, pts[i - 1].x - pts[i + 1].x);
    const rr = rad(i);
    const tm = tailMix(i);
    ctx.fillStyle = mixc(C.saddle, '#7a1d12', tm);
    ctx.beginPath();
    ctx.ellipse(pts[i].x - nrm[i].x * rr * 0.36, pts[i].y - nrm[i].y * rr * 0.36, rr * 0.62, rr * 0.5, ang, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(246, 222, 170, 0.8)';
    ctx.beginPath();
    ctx.ellipse(pts[i].x - nrm[i].x * rr * 0.36, pts[i].y - nrm[i].y * rr * 0.36, rr * 0.22, rr * 0.16, ang, 0, Math.PI * 2);
    ctx.fill();
    // flank spot
    ctx.fillStyle = 'rgba(90, 50, 24, 0.5)';
    ctx.beginPath();
    ctx.arc(pts[i].x + nrm[i].x * rr * 0.25, pts[i].y + nrm[i].y * rr * 0.25, rr * 0.16, 0, Math.PI * 2);
    ctx.fill();
  }

  // ---------------- head ----------------
  const H = pts[0];
  const open = r.mouth.x;
  ctx.save();
  ctx.translate(H.x, H.y);
  ctx.rotate(r.pitch.x);
  const hg = ctx.createRadialGradient(-6, -7, 2, 0, 0, 22);
  hg.addColorStop(0, C.light);
  hg.addColorStop(0.5, C.base);
  hg.addColorStop(1, '#9a6a32');
  // lower jaw
  ctx.save();
  ctx.translate(-3, 5);
  ctx.rotate(open * 0.6);
  ctx.fillStyle = mixc('#9a6a32', C.belly, 0.25);
  ctx.beginPath();
  ctx.ellipse(10, 3, 14, 5.2, 0, 0, Math.PI * 2);
  ctx.fill();
  if (open > 0.1) {
    ctx.fillStyle = '#fff';
    for (let k = 0; k < 4; k++) {
      ctx.beginPath();
      ctx.moveTo(6 + k * 4.2, -0.5);
      ctx.lineTo(7.6 + k * 4.2, -4 - open * 1.4);
      ctx.lineTo(9.2 + k * 4.2, -0.5);
      ctx.fill();
    }
  }
  ctx.restore();
  if (open > 0.1) {
    ctx.fillStyle = '#c93a5c';
    ctx.beginPath();
    ctx.ellipse(8, 5 + open * 1.8, 11, 1.6 + open * 4.2, 0.08, 0, Math.PI * 2);
    ctx.fill();
  }
  // skull + snout
  ctx.fillStyle = hg;
  ctx.beginPath();
  ctx.ellipse(-3, 0, 14.5, 12.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(10, 2.5, 13, 8.6, 0.06, 0, Math.PI * 2);
  ctx.fill();
  // upper-jaw lip line + belly
  ctx.fillStyle = C.belly;
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  ctx.ellipse(8, 7, 13, 3.6 - open * 1.2, 0.04, 0, Math.PI);
  ctx.fill();
  ctx.globalAlpha = 1;
  // dark markings: crown arrow + eye stripe
  ctx.fillStyle = C.saddle;
  ctx.beginPath();
  ctx.moveTo(-14, -3);
  ctx.quadraticCurveTo(-4, -13.5, 5, -7);
  ctx.quadraticCurveTo(-3, -6, -14, 3);
  ctx.fill();
  ctx.strokeStyle = C.saddle;
  ctx.lineWidth = 3.2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(6.5, -1.5);
  ctx.quadraticCurveTo(0, 5, -6, 10.5);
  ctx.stroke();
  // eyes: big and glossy with a vertical pupil slit
  const blink = pulse(time, id, 3.6, 0.16) >= 0 && st === 'coil';
  const mad = st === 'rear' || st === 'strike' || st === 'bite' ? 1 : 0.25;
  ([[-2.5, -5.2, 5.3], [8.2, -5.4, 5.7]] as Array<[number, number, number]>).forEach(([ex, ey, er]) => {
    if (blink) {
      ctx.strokeStyle = '#3a2008';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ex - er * 0.8, ey);
      ctx.lineTo(ex + er * 0.8, ey);
      ctx.stroke();
      return;
    }
    glossEye(ctx, ex, ey, er, '#e0a020', { sclera: true, ring: '#f3d060', lookX: 0.8 });
    ctx.fillStyle = '#120a06';
    ctx.beginPath();
    ctx.ellipse(ex + 0.5, ey, er * 0.2, er * 0.56, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(ex - er * 0.18, ey - er * 0.28, er * 0.17, 0, Math.PI * 2);
    ctx.fill();
  });
  // brow ridge
  ctx.strokeStyle = '#4a2a12';
  ctx.lineWidth = 2.3;
  ctx.beginPath();
  ctx.moveTo(-8.5, -9.5 + mad * 0.5);
  ctx.lineTo(1.5, -9.4 - mad * 1.8);
  ctx.moveTo(3, -10.6 - mad * 1.8);
  ctx.lineTo(13.5, -9.8 + mad * 1.2);
  ctx.stroke();
  // nostril
  ctx.fillStyle = '#5a3216';
  ctx.beginPath();
  ctx.arc(19, 0.8, 1.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 140, 140, 0.4)';
  ctx.beginPath();
  ctx.ellipse(-7, 5, 3, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  if (open < 0.2) {
    ctx.strokeStyle = '#4a2a12';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(0, 7.2);
    ctx.quadraticCurveTo(9, 10.5, 20, 6);
    ctx.stroke();
  }
  // tongue
  let ext = 0;
  const fl = pulse(time, id, 1.9, 0.5, 5);
  if (fl >= 0) ext = Math.pow(Math.sin(Math.PI * fl), 0.6);
  if (st === 'rear') ext = Math.max(ext, 0.8 + Math.sin(time * 38) * 0.2);
  if (st === 'strike') ext = 0;
  if (ext > 0.02) {
    const tl = 6 + ext * 15;
    const wig = Math.sin(time * 44 + id) * 1.5 * ext;
    const mx = 20;
    const my = 6.5 + open * 3;
    ctx.strokeStyle = '#ff5c86';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(mx, my);
    ctx.quadraticCurveTo(mx + tl * 0.55, my + 2 + wig * 0.5, mx + tl, my + 1.2 + wig);
    ctx.stroke();
    ctx.lineWidth = 1.8;
    const fk = 2.8 + ext * 1.8;
    ctx.beginPath();
    ctx.moveTo(mx + tl, my + 1.2 + wig);
    ctx.lineTo(mx + tl + fk, my - 1.4 + wig);
    ctx.moveTo(mx + tl, my + 1.2 + wig);
    ctx.lineTo(mx + tl + fk, my + 3.8 + wig);
    ctx.stroke();
  }
  enemy.headDeco?.(ctx);
  ctx.restore();
  ctx.restore();
}

// ---------------------------------------------------------------------------------------------
// Spectacled caiman
// ---------------------------------------------------------------------------------------------

const CG = 15; // ground, local y

const CA_LEGS: LegSpec[] = [
  { hx: 20, hy: -1, l1: 9, l2: 9.5, bend: 1, group: 0, restX: 3 }, // near front
  { hx: 15, hy: -1, l1: 9, l2: 9.5, bend: 1, group: 1, restX: 3 }, // far front
  { hx: -19, hy: 0, l1: 9, l2: 9.5, bend: -1, group: 1, restX: -2 }, // near hind
  { hx: -14, hy: 0, l1: 9, l2: 9.5, bend: -1, group: 0, restX: -2 }, // far hind
];

interface CaimanRig {
  gait: Gait;
  tail: VerletChain;
  jaw: Spring;
  pitch: Spring;
  headY: Spring;
  throat: Spring;
  stretch: Spring;
  dist: number;
  bob: number;
}

const caTailRest = (wx: number, wy: number, f: number, t: number, id: number, lift: number, lash: number): V2[] => {
  const out: V2[] = [];
  for (let i = 0; i < 10; i++) {
    const lx = -25 - i * 5.1;
    const ly = 3 - i * 0.2 * lift - Math.sin(t * 1.6 + id - i * 0.55) * i * 0.35 - Math.sin(t * 9 - i * 0.6) * i * 0.5 * lash;
    out.push({ x: wx + f * lx, y: wy + ly });
  }
  return out;
};

export function drawCaiman(ctx: CanvasRenderingContext2D, enemy: Enemy, time: number) {
  const b = bodyFor('caiman', enemy, time);
  const f = b.facing;
  if (!b.rig) {
    const tail = new VerletChain(10, 5.1, b.wx, b.wy);
    tail.reset(caTailRest(b.wx, b.wy, f, time, enemy.id, 1, 0));
    b.rig = {
      gait: new Gait(CA_LEGS), tail, jaw: new Spring(0), pitch: new Spring(0), headY: new Spring(0), throat: new Spring(0),
      stretch: new Spring(0), dist: 0, bob: 0,
    } as CaimanRig;
  }
  const r = b.rig as CaimanRig;
  const dt = b.dt;
  const st = enemy.state ?? 'patrol';
  const speed = Math.abs(b.fv);
  const run = clamp(speed / 60, 0, 1);
  const groundWorld = b.wy + CG;

  if (dt > 0) {
    if (b.turned) {
      r.gait.mirror(b.wx);
      mirrorAbout(b.wx, r.tail.pts);
      mirrorAbout(b.wx, r.tail.prev);
    }
    r.dist += speed * dt;
    const ph = (r.dist / 9) * Math.PI;
    r.bob = damp(r.bob, -Math.abs(Math.sin(ph)) * 0.8 * run, 14, dt);
    r.gait.update(b, { stepDist: 6 + speed * 0.03, stepHeight: 4 + run * 2, slow: 0.34, fast: 0.2, groundY: groundWorld, maxLead: 8 }, r.bob);
    const jawT = st === 'windup' ? 1 : st === 'lunge' ? 0.95 : st === 'bite' ? 0 : st === 'recover' ? 0.14 + Math.sin(time * 9) * 0.06 : 0;
    r.jaw.step(jawT, st === 'bite' ? 1600 : 160, st === 'bite' ? 60 : 18, dt);
    const pitchT = st === 'windup' ? -0.13 : st === 'lunge' ? 0.03 : st === 'bite' ? 0.1 : Math.sin(ph) * 0.012 * run;
    r.pitch.step(pitchT, 90, 11, dt);
    r.headY.step(st === 'windup' ? -5 : st === 'bite' ? 3 : st === 'recover' ? Math.sin(time * 13) * 1.8 : 0, 110, 12, dt);
    r.throat.step(st === 'windup' ? 1 : 0, 90, 10, dt);
    r.stretch.step(st === 'lunge' ? 1 : 0, 130, 14, dt);
    const lift = st === 'windup' ? 2.2 : 1;
    const lash = st === 'windup' || st === 'lunge' ? 1 : 0;
    const rest = caTailRest(b.wx, b.wy + r.bob, f, time, enemy.id, lift, lash);
    if (b.fresh) r.tail.reset(rest);
    r.tail.update({ x: b.wx - f * 24, y: b.wy + r.bob }, rest, 0.8, 4, 120, dt);
    const floor = b.wy + CG - 3;
    for (const p of r.tail.pts) if (p.y > floor) p.y = floor;
  }

  // ---------------- draw ----------------
  ctx.save();
  ctx.translate(enemy.x, enemy.y);
  ctx.scale(b.fs, 1);
  if (enemy.hitFlashTimer > 0) ctx.filter = 'brightness(2.2)';
  const GREEN = '#6f9040';
  const GREEN_D = '#46632a';
  const PALE = '#e6e3a2';
  const DARK = '#243714';
  const wx = b.wx;
  const wy = b.wy;

  groundShadow(ctx, 0, CG - 1, 56, 6.5);

  // tail
  const tp: V2[] = r.tail.pts.map((p) => ({ x: (p.x - wx) * f, y: p.y - wy }));
  for (let i = 0; i < tp.length - 1; i++) {
    const w = lerp(13, 3, Math.pow(i / (tp.length - 1), 0.9));
    ctx.lineCap = 'round';
    ctx.strokeStyle = mixc(GREEN_D, '#1c2a10', 0.2);
    ctx.lineWidth = w + 1.6;
    ctx.beginPath();
    ctx.moveTo(tp[i].x, tp[i].y);
    ctx.lineTo(tp[i + 1].x, tp[i + 1].y);
    ctx.stroke();
    ctx.strokeStyle = i % 2 ? GREEN_D : GREEN;
    ctx.lineWidth = w;
    ctx.stroke();
    // ridge bump
    ctx.fillStyle = DARK;
    ctx.beginPath();
    ctx.ellipse(tp[i].x, tp[i].y - w * 0.5, 2.2, 1.7, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  const legs = r.gait.solve(b, r.bob);
  const drawLeg = (i: number, shade: number) => {
    const L = legs[i];
    const s = CA_LEGS[i];
    const col = mixc(GREEN, '#2a3c16', shade);
    const hip = { x: s.hx, y: s.hy + r.bob };
    const pts = [hip, { x: L.kx, y: L.ky }, { x: L.fx, y: L.fy }];
    strokePath(ctx, pts, 9.5, 6.4, mixc(col, '#1c2a10', 0.35));
    strokePath(ctx, pts.map((p) => ({ x: p.x - 0.5, y: p.y - 0.6 })), 7.6, 4.8, col);
    softBlob(ctx, L.fx + 2.4, L.fy - 1.1, 6.6, 3.5, 0, mixc('#8aa850', '#2a3c16', shade), 0.3);
    ctx.fillStyle = '#f3efd0';
    [[5.2, -0.8], [7.4, -0.3], [9.2, 0.4]].forEach(([cx, cy]) => {
      ctx.beginPath();
      ctx.moveTo(L.fx + cx, L.fy + cy - 1.4);
      ctx.lineTo(L.fx + cx + 1.8, L.fy + cy + 0.2);
      ctx.lineTo(L.fx + cx - 0.4, L.fy + cy + 0.6);
      ctx.fill();
    });
  };
  drawLeg(3, 0.4);
  drawLeg(1, 0.4);

  // torso
  ctx.save();
  ctx.translate(0, r.bob);
  ctx.rotate(r.pitch.x);
  const st0 = 1 + r.stretch.x * 0.06;
  ctx.scale(st0, 1);
  softBlob(ctx, -2, -1, 31, 11.8, 0, GREEN, 0.3);
  softBlob(ctx, 3, 5.5, 25, 5.6, 0, PALE, 0.1);
  // dark cross-bands on the back
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(-2, -1, 30.5, 11.4, 0, 0, Math.PI * 2);
  ctx.clip();
  ctx.strokeStyle = 'rgba(30, 50, 18, 0.42)';
  ctx.lineWidth = 3.8;
  ctx.lineCap = 'round';
  for (let x = -24; x <= 22; x += 9) {
    ctx.beginPath();
    ctx.moveTo(x, -13);
    ctx.quadraticCurveTo(x - 4, -4, x - 2.5, 3);
    ctx.stroke();
  }
  ctx.restore();
  // scutes along the spine
  for (let x = -28; x <= 24; x += 4.2) {
    const y = -12.2 + Math.pow((x + 2) / 31, 2) * 2.4;
    ctx.fillStyle = DARK;
    ctx.beginPath();
    ctx.moveTo(x - 2.3, y + 1.4);
    ctx.lineTo(x, y - 2.6);
    ctx.lineTo(x + 2.3, y + 1.4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#8fb052';
    ctx.beginPath();
    ctx.moveTo(x - 0.6, y + 0.8);
    ctx.lineTo(x, y - 1.2);
    ctx.lineTo(x + 0.8, y + 0.8);
    ctx.fill();
  }
  ctx.restore();

  drawLeg(2, 0.06);
  drawLeg(0, 0.06);

  // ---------------- head ----------------
  const open = r.jaw.x;
  ctx.save();
  ctx.translate(0, r.bob + r.headY.x * 0.5);
  ctx.rotate(r.pitch.x * 0.6);
  // throat puff while it hisses
  if (r.throat.x > 0.05) softBlob(ctx, 34, 8, 9 + r.throat.x * 3, 4.5 + r.throat.x * 3.4, 0, PALE, 0.1);
  // lower jaw
  ctx.save();
  ctx.translate(29, 3);
  ctx.rotate(open * 0.22);
  softBlob(ctx, 14, 2.6, 18, 4.6, 0, mixc(GREEN, PALE, 0.45), 0.3);
  // lower teeth
  ctx.fillStyle = '#fffdf0';
  for (let k = 0; k < 7; k++) {
    const x = 6 + k * 3.9;
    ctx.beginPath();
    ctx.moveTo(x - 1.3, -0.4);
    ctx.lineTo(x, -4.2 - (k % 2) * 1.1);
    ctx.lineTo(x + 1.3, -0.4);
    ctx.fill();
  }
  ctx.restore();
  if (open > 0.1) {
    ctx.fillStyle = '#d94a6a';
    ctx.beginPath();
    ctx.ellipse(44, 3.6 - open * 1.3, 15, 1.4 + open * 4.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ff90a8';
    ctx.beginPath();
    ctx.ellipse(40, 5.4 - open * 0.4, 8, 1 + open * 1.6, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // upper jaw + skull, hinged at the back of the mouth
  ctx.save();
  ctx.translate(29, 3);
  ctx.rotate(-open * 0.62);
  softBlob(ctx, 16, -4.4, 20, 6.8, 0, GREEN, 0.3);
  softBlob(ctx, 2, -6, 12.5, 11, 0, GREEN, 0.3);
  // bumpy nose
  softBlob(ctx, 33.5, -7.8, 4.2, 3.2, 0, mixc(GREEN, '#2a3c16', 0.2), 0.3);
  ctx.fillStyle = '#1c2a10';
  ctx.beginPath();
  ctx.ellipse(34.5, -8.6, 1.15, 0.9, 0, 0, Math.PI * 2);
  ctx.fill();
  // upper teeth
  ctx.fillStyle = '#fffdf0';
  for (let k = 0; k < 7; k++) {
    const x = 8 + k * 3.9;
    ctx.beginPath();
    ctx.moveTo(x - 1.4, 0.4);
    ctx.lineTo(x + 0.2, 4.2 + (k % 2 ? 1.1 : 0));
    ctx.lineTo(x + 1.5, 0.4);
    ctx.fill();
  }
  // spectacles: bony ridge between the eyes
  ctx.strokeStyle = '#c9c24a';
  ctx.lineWidth = 1.8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-1, -12.8);
  ctx.quadraticCurveTo(7, -15.6, 14, -12.2);
  ctx.stroke();
  // eyes
  const blink = pulse(time, enemy.id, 3.7, 0.17) >= 0 && st === 'patrol';
  const mad = st === 'windup' || st === 'lunge' || st === 'bite' ? 1 : 0.3;
  ([[1.5, -13, 5.8], [11, -12.4, 4.9]] as Array<[number, number, number]>).forEach(([ex, ey, er], i) => {
    softBlob(ctx, ex, ey + 1.5, er + 2, er + 1.2, 0, GREEN, 0.3);
    if (blink) {
      ctx.strokeStyle = DARK;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ex - er * 0.8, ey);
      ctx.lineTo(ex + er * 0.8, ey);
      ctx.stroke();
      return;
    }
    glossEye(ctx, ex, ey, er, '#d6a62a', { sclera: false, ring: '#f1d664', lookX: 0.9 });
    ctx.fillStyle = '#120a06';
    ctx.beginPath();
    ctx.ellipse(ex + 0.7, ey, er * 0.2, er * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = DARK;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(ex - er * 0.95, ey - er * (0.55 - mad * 0.2) + (i ? 0 : 0));
    ctx.lineTo(ex + er * 0.95, ey - er * (0.9 + mad * 0.15) * (mad > 0.5 ? 0.35 : 0.95));
    ctx.stroke();
  });
  enemy.headDeco?.(ctx);
  ctx.restore();
  ctx.restore();
  ctx.restore();
}

// ---------------------------------------------------------------------------------------------
// Tayra
// ---------------------------------------------------------------------------------------------

const TG = 15; // ground, local y

const TA_LEGS: LegSpec[] = [
  { hx: 15, hy: -1, l1: 9, l2: 10, bend: 1, group: 0, restX: 3 }, // near front
  { hx: 11, hy: -1, l1: 9, l2: 10, bend: 1, group: 1, restX: 3 }, // far front
  { hx: -17, hy: 0, l1: 9.5, l2: 9.5, bend: -1, group: 1, restX: -2 }, // near hind
  { hx: -13, hy: 0, l1: 9.5, l2: 9.5, bend: -1, group: 0, restX: -2 }, // far hind
];

interface TayraRig {
  gait: Gait;
  tail: VerletChain;
  headX: Spring;
  headY: Spring;
  earL: Spring;
  earR: Spring;
  pitch: Spring;
  arch: Spring;
  mouth: Spring;
  tuck: Spring;
  dist: number;
  bob: number;
  cyc: number;
  wasDash: boolean;
}

const taTailRest = (wx: number, wy: number, f: number, t: number, id: number, stream: number, hang: number): V2[] => {
  const out: V2[] = [];
  for (let i = 0; i < 9; i++) {
    const lx = -27 - i * 5.2;
    const ly = -6 + i * 0.5 * (1 - stream) + Math.pow(i, 1.6) * 0.16 * hang + Math.sin(t * 2.4 + id - i * 0.6) * i * 0.4;
    out.push({ x: wx + f * lx, y: wy + ly });
  }
  return out;
};

export function drawTayra(ctx: CanvasRenderingContext2D, enemy: Enemy, time: number) {
  const b = bodyFor('tayra', enemy, time);
  const f = b.facing;
  if (!b.rig) {
    const tail = new VerletChain(9, 5.2, b.wx, b.wy);
    tail.reset(taTailRest(b.wx, b.wy, f, time, enemy.id, 0, 0));
    b.rig = {
      gait: new Gait(TA_LEGS), tail, headX: new Spring(0), headY: new Spring(0), earL: new Spring(0), earR: new Spring(0),
      pitch: new Spring(0), arch: new Spring(0), mouth: new Spring(0), tuck: new Spring(0), dist: 0, bob: 0, cyc: 0, wasDash: false,
    } as TayraRig;
  }
  const r = b.rig as TayraRig;
  const dt = b.dt;
  const st = enemy.state ?? 'patrol';
  const dash = st === 'dash';
  const alert = st === 'alert';
  const speed = Math.abs(b.fv);
  const run = clamp(speed / 110, 0, 1);
  const groundWorld = b.wy + TG;

  if (dt > 0) {
    if (b.turned) {
      r.gait.mirror(b.wx);
      mirrorAbout(b.wx, r.tail.pts);
      mirrorAbout(b.wx, r.tail.prev);
    }
    if (r.wasDash && !dash) r.gait.plant(b, groundWorld, 0);
    r.wasDash = dash;
    r.dist += speed * dt;
    const ph = (r.dist / 13) * Math.PI;
    r.cyc += (dash ? 1 : 0) * Math.max(speed, 60) * dt / 40 * Math.PI * 2;
    const walkBob = -Math.abs(Math.sin(ph)) * (0.9 + run * 1.6);
    r.bob = damp(r.bob, dash ? -Math.abs(Math.sin(r.cyc + 0.5)) * 3.2 : alert ? 0 : walkBob, 20, dt);
    r.gait.update(b, { stepDist: 7 + speed * 0.025, stepHeight: 4.5 + run * 3, slow: 0.24, fast: 0.13, groundY: groundWorld, maxLead: 12, airborne: dash }, r.bob);
    r.pitch.step(alert ? -0.82 : dash ? 0.06 : st === 'recover' ? -0.07 : 0, alert ? 70 : 100, alert ? 9 : 12, dt);
    r.arch.step(dash ? Math.sin(r.cyc + 0.3) * 0.07 : Math.sin(ph * 2) * 0.012, 140, 13, dt);
    r.tuck.step(alert ? 1 : 0, 90, 12, dt);
    r.mouth.step(dash ? 0.8 : alert ? 0.15 : st === 'recover' ? 0.5 + Math.sin(time * 14) * 0.15 : 0, 180, 18, dt);
    r.headX.step(dash ? 5 : 0, 120, 12, dt);
    r.headY.step((dash ? 2 : 0) - r.bob * 0.5 + (alert ? Math.sin(time * 16) * 0.9 : 0), 120, 12, dt);
    const tw = pulse(time, enemy.id, 2.4, 0.28, 2);
    r.earL.step(dash ? 0.9 : tw >= 0 ? Math.sin(tw * Math.PI * 4) * 0.4 : alert ? -0.2 : 0, 260, 18, dt);
    r.earR.step(dash ? -0.9 : 0, 260, 18, dt);
    const stream = dash ? 1 : run * 0.6;
    const rest = taTailRest(b.wx, b.wy + r.bob, f, time, enemy.id, stream, alert ? 2.2 : 0.4);
    if (b.fresh) r.tail.reset(rest);
    r.tail.update({ x: b.wx - f * 26, y: b.wy - 6 + r.bob }, rest, dash ? 0.75 : 0.85, dash ? 3.5 : 5, 240, dt);
  }

  // ---------------- draw ----------------
  ctx.save();
  ctx.translate(enemy.x, enemy.y);
  ctx.scale(b.fs, 1);
  if (enemy.hitFlashTimer > 0) ctx.filter = 'brightness(2.2)';
  const FUR = '#5c3b21';
  const FUR_D = '#33200f';
  const TAN = '#c9a46c';
  const BIB = '#f3c95a';
  const wx = b.wx;
  const wy = b.wy;

  groundShadow(ctx, -3, TG - 1, 33, 5, 0.28);

  // bushy tail: outline pass first, then the fur, so the segments blend into one smooth brush
  const tp: V2[] = r.tail.pts.map((p) => ({ x: (p.x - wx) * f, y: p.y - wy }));
  ctx.lineCap = 'round';
  const tw = (i: number) => {
    const u = i / (tp.length - 1);
    return lerp(7, 11.5, Math.sin(Math.min(1, u * 1.5) * Math.PI * 0.5)) * (1 - Math.pow(u, 3) * 0.6);
  };
  for (let pass = 0; pass < 2; pass++) {
    for (let i = 0; i < tp.length - 1; i++) {
      const u = i / (tp.length - 1);
      ctx.strokeStyle = pass === 0 ? FUR_D : mixc(FUR, '#6a4426', 0.35 - u * 0.25);
      ctx.lineWidth = tw(i) + (pass === 0 ? 2.4 : 0);
      ctx.beginPath();
      ctx.moveTo(tp[i].x, tp[i].y);
      ctx.lineTo(tp[i + 1].x, tp[i + 1].y);
      ctx.stroke();
    }
  }

  const cyc = r.cyc;
  const dashFeet = dash
    ? (i: number): V2 | null => {
        const s = TA_LEGS[i];
        const front = i < 2;
        const off = (i % 2) * 0.35;
        const phi = cyc + (front ? 0 : 2.3) + off;
        const A = front ? 11 : 12;
        const lift = Math.max(0, Math.sin(phi)) * 7;
        return { x: s.hx + (front ? 7 : -5) + A * Math.cos(phi), y: TG - lift };
      }
    : undefined;
  const tuck = r.tuck.x;
  const legsSolved = r.gait.solve(b, r.bob, (i) => {
    const d = dashFeet?.(i) ?? null;
    if (d) return d;
    if (i < 2 && tuck > 0.02) {
      // paws held up in front of the chest while it stands to sniff
      const s = TA_LEGS[i];
      const t0 = { x: s.hx + 6 + i * 2, y: s.hy + 9 + i * 1.5 };
      const g = r.gait.footLocal(i, b);
      return { x: lerp(g.x, t0.x, tuck), y: lerp(g.y, t0.y, tuck) };
    }
    return null;
  });
  const drawLeg = (i: number, shade: number) => {
    const L = legsSolved[i];
    const s = TA_LEGS[i];
    const col = mixc(FUR, '#1c0f06', shade);
    const hip = { x: s.hx, y: s.hy + r.bob };
    const pts = [hip, { x: L.kx, y: L.ky }, { x: L.fx, y: L.fy }];
    strokePath(ctx, pts, 9.5, 6.4, mixc(col, '#150a04', 0.4));
    strokePath(ctx, pts.map((p) => ({ x: p.x - 0.5, y: p.y - 0.6 })), 7.6, 4.8, col);
    softBlob(ctx, L.fx + 2.2, L.fy - 1.1, 6.2, 3.5, 0, mixc('#5a3a22', '#150a04', shade), 0.3);
    ctx.strokeStyle = '#e9d6b4';
    ctx.lineWidth = 1;
    ctx.beginPath();
    [4.6, 6.6, 8.4].forEach((cx) => {
      ctx.moveTo(L.fx + cx, L.fy - 1.6);
      ctx.lineTo(L.fx + cx + 1.3, L.fy + 0.9);
    });
    ctx.stroke();
  };
  drawLeg(3, 0.45);

  // hind legs and rump stay planted; the front of the body rises when it stands up
  const pivot = { x: -15, y: 1 };
  ctx.save();
  ctx.translate(0, r.bob);
  ctx.translate(pivot.x, pivot.y);
  ctx.rotate(r.pitch.x + r.arch.x);
  ctx.translate(-pivot.x, -pivot.y);
  drawLeg(1, 0.45);
  softBlob(ctx, 0, -3.5, 28, 9.6, 0, '#744b28', 0.3);
  softBlob(ctx, -17, -3, 11.5, 10.2, 0, '#744b28', 0);
  softBlob(ctx, 14, -3, 11, 10, 0, '#744b28', 0);
  // golden bib on the chest
  softBlob(ctx, 17, 2.4, 8, 5.4, 0.2, BIB, 0.15);
  // fur tufts
  ctx.strokeStyle = 'rgba(20, 10, 4, 0.5)';
  ctx.lineWidth = 1.2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  [[-10, -10], [-3, -11.4], [5, -11.2], [-18, -9]].forEach(([x, y]) => {
    ctx.moveTo(x, y);
    ctx.lineTo(x - 2, y + 4);
  });
  ctx.stroke();
  drawLeg(0, 0.05);
  ctx.restore();

  ctx.save();
  ctx.translate(0, r.bob);
  ctx.translate(pivot.x, pivot.y);
  ctx.rotate(r.arch.x * 0.4);
  ctx.translate(-pivot.x, -pivot.y);
  drawLeg(2, 0.05);
  ctx.restore();

  // ---------------- head ----------------
  const mouth = r.mouth.x;
  ctx.save();
  ctx.translate(0, r.bob);
  ctx.translate(pivot.x, pivot.y);
  ctx.rotate(r.pitch.x + r.arch.x);
  ctx.translate(-pivot.x, -pivot.y);
  ctx.translate(31 + r.headX.x, -9 + r.headY.x);
  ctx.rotate(-r.pitch.x * 0.55 + (dash ? 0.12 : 0));
  // ears
  ([[-8, -10, r.earL.x], [8, -10, r.earR.x]] as Array<[number, number, number]>).forEach(([ex, ey, tw], i) => {
    ctx.save();
    ctx.translate(ex, ey + 4);
    ctx.rotate((i ? 0.25 : -0.25) + tw * 0.7);
    ctx.translate(0, -4);
    softBlob(ctx, 0, 0, 5.4, 5.8, 0, FUR, 0.2);
    softBlob(ctx, i ? -0.3 : 0.3, 0.8, 3.1, 3.4, 0, '#f2d3b6', 0.1);
    ctx.restore();
  });
  // throat bib shows under the chin
  softBlob(ctx, 1, 9.5, 7.4, 4.2, 0, BIB, 0.1);
  if (mouth > 0.1) {
    ctx.fillStyle = '#7a1730';
    ctx.beginPath();
    ctx.ellipse(1, 7.4 + mouth * 1.2, 6.2, 1.4 + mouth * 3.6, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  softBlob(ctx, 0, 0, 14, 11.4, 0, TAN, 0.3);
  softBlob(ctx, 0, 5.6, 9, 5.4, 0, '#ecd9b0', 0.1);
  // dark brow band and eye patches
  ctx.fillStyle = 'rgba(60, 34, 16, 0.32)';
  ctx.beginPath();
  ctx.ellipse(-6, -1.4, 4.6, 4, 0, 0, Math.PI * 2);
  ctx.ellipse(6, -1.4, 4.6, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  const blink = pulse(time, enemy.id, 3.0, 0.15, 3) >= 0 && st === 'patrol';
  const mad = dash ? 1 : alert ? 0.1 : 0.2;
  ([[-5.6, -1.6], [5.6, -1.6]] as Array<[number, number]>).forEach(([ex, ey], i) => {
    if (blink) {
      ctx.strokeStyle = FUR_D;
      ctx.lineWidth = 1.9;
      ctx.beginPath();
      ctx.moveTo(ex - 3.6, ey);
      ctx.quadraticCurveTo(ex, ey + 2, ex + 3.6, ey);
      ctx.stroke();
      return;
    }
    ctx.save();
    ctx.translate(ex, ey);
    ctx.scale(1, 1 - mad * 0.25);
    glossEye(ctx, 0, 0, alert ? 5 : 4.5, '#3a2210', { ring: '#8a5a2a', lookX: 0.6 });
    ctx.restore();
    ctx.strokeStyle = FUR_D;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    const s = i ? -1 : 1;
    ctx.beginPath();
    ctx.moveTo(ex - s * 4.6, ey - 5 + mad * 0.8);
    ctx.lineTo(ex + s * 3.6, ey - 4.4 - mad * 2.2);
    ctx.stroke();
  });
  // nose + mouth
  ctx.fillStyle = '#3a2020';
  ctx.beginPath();
  ctx.moveTo(-3, 3.8);
  ctx.quadraticCurveTo(0, 2.2, 3, 3.8);
  ctx.quadraticCurveTo(0, 7, -3, 3.8);
  ctx.fill();
  ctx.fillStyle = '#ff9aa6';
  ctx.beginPath();
  ctx.ellipse(-0.6, 3.6, 1.1, 0.7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#4a2a14';
  ctx.lineWidth = 1.4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  if (mouth < 0.12) {
    ctx.moveTo(0, 5.8);
    ctx.lineTo(0, 7);
    ctx.moveTo(-5.2, 7.4);
    ctx.quadraticCurveTo(-2.4, 9.4, 0, 7);
    ctx.quadraticCurveTo(2.4, 9.4, 5.2, 7.4);
  } else {
    ctx.moveTo(0, 5.8);
    ctx.lineTo(0, 6.6);
  }
  ctx.stroke();
  if (mouth > 0.12) {
    ctx.fillStyle = '#fffdf2';
    [[-3.4, 1], [3.4, -1]].forEach(([fx, s]) => {
      ctx.beginPath();
      ctx.moveTo(fx - 1.3, 7);
      ctx.lineTo(fx + s * 0.3, 7 + 3.2 + mouth * 1.6);
      ctx.lineTo(fx + 1.3, 7);
      ctx.fill();
    });
  }
  ctx.fillStyle = 'rgba(255, 140, 130, 0.4)';
  ctx.beginPath();
  ctx.ellipse(-10, 3, 2.4, 1.6, 0, 0, Math.PI * 2);
  ctx.ellipse(10, 3, 2.4, 1.6, 0, 0, Math.PI * 2);
  ctx.fill();
  enemy.headDeco?.(ctx);
  ctx.restore();
  ctx.restore();
}
