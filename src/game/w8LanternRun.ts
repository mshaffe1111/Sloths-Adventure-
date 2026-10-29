/**
 * w8LanternRun — 8-4's jar of fireflies inside the game engine (lantern.ts is the jar, w8Lantern.ts the stage). The engine hands it the
 * player each frame; it steps the jar, says when a fall is soft, gives the darkness its light ring, and draws the flowers, the moths, the
 * jar and the firefly tree's swarm.
 */
import { glowPic } from './glow.ts';
import { jarAt, LANTERN, lanternRadius, newLantern, setbackTo, stepLantern, takeoff, type LanternEvent, type LanternPlan, type LanternSetting, type LanternState } from './lantern.ts';

/** how full the jar is as the stage starts: half, so the first flower (just ahead) fills it before anything can go wrong */
export const START_LEVEL = 0.5;

const FLOWER_URL = new URL('../assets/w6to10/props-made/w8c.webp', import.meta.url).href;
/** World 8's painted night bloom (props-made/w8c 'night-flowers'): the glowing flower */
const BLOOM = { x: 0, y: 0, w: 245, h: 320, ax: 116, ay: 320 } as const;
let bloomPic: HTMLImageElement | null = null;
const bloom = (): HTMLImageElement | null => {
  if (typeof Image === 'undefined') return null;
  if (!bloomPic) {
    bloomPic = new Image();
    bloomPic.src = FLOWER_URL;
  }
  return bloomPic.complete && bloomPic.naturalWidth ? bloomPic : null;
};

export interface LanternPlayer {
  x: number;
  y: number;
  grounded: boolean;
  climbing: boolean;
  isVineSwinging?: boolean;
  facing: number;
}

export class LanternRun {
  readonly set: LanternSetting;
  readonly st: LanternState;
  /** the last take-off: was the far side lit (a fall costs a life on Normal), and the bough to set him back on */
  private leap: { lit: boolean; x: number; y: number } | null = null;
  private wasUp = true;
  /** where he last stood still on a bough (a soft fall puts him back there) */
  private stood: { x: number; y: number } = { x: 0, y: 0 };
  /** the swarm: seconds since he opened the jar under the firefly tree (-1: not yet) */
  swarm = -1;
  /** the flowers' fill bursts (flower id -> game seconds when it last filled the jar) */
  private burst = new Map<number, number>();

  constructor(readonly plan: LanternPlan, readonly easy: boolean) {
    this.set = easy ? LANTERN.easy : LANTERN.normal;
    this.st = newLantern(plan);
    this.st.level = START_LEVEL;
  }

  /** the jar's light ring (world px) */
  radius(): number {
    if (this.swarm >= 0) return this.set.rMax * (1 + Math.min(1, this.swarm / 2) * 2);
    return lanternRadius(this.set, this.st.level, this.st.t);
  }

  /** how dark the night is (the engine's darkShow): the swarm lifts it */
  night(): number {
    return this.swarm < 0 ? 1 : Math.max(0.28, 1 - this.swarm / 3);
  }

  /** his speed this frame (share): slow in the dark */
  speed(): number {
    return this.st.level <= 0 && this.swarm < 0 ? this.set.slow : 1;
  }

  step(dt: number, p: LanternPlayer, punch: boolean): LanternEvent | 'swarm' {
    const up = p.grounded || p.climbing || !!p.isVineSwinging;
    if (p.grounded && !p.climbing) this.stood = { x: p.x, y: p.y };
    // leaving a bough or a liana: was the far side lit?
    if (this.wasUp && !up) {
      const t = takeoff(this.plan, this.set, this.st.level, p.x, p.y, p.facing);
      this.leap = { lit: !!t?.lit, x: this.stood.x, y: this.stood.y };
    }
    this.wasUp = up;
    if (this.swarm >= 0) {
      this.swarm += dt;
      this.st.level = 1;
      return null;
    }
    if (p.x >= this.plan.swarmX && p.grounded) {
      this.swarm = 0;
      return 'swarm';
    }
    const ev = stepLantern(this.st, this.plan, this.set, dt, p.x, p.y, punch);
    if (ev === 'filled') this.burst.set(this.st.last, this.st.t);
    return ev;
  }

  /** a fall past the bottom: soft (back on the bough) on Easy, or when the far side was dark as he left; else it costs a life */
  fallIsSoft(): boolean {
    return this.easy || !this.leap?.lit;
  }
  /** where a soft fall puts him back */
  backTo(): { x: number; y: number } {
    return this.leap ? { x: this.leap.x, y: this.leap.y } : this.stood;
  }
  /** where the dark's setback puts him: the last flower he filled at */
  setbackAt(): { x: number; y: number } {
    const f = setbackTo(this.plan, this.st);
    return { x: f.x - 50, y: f.y };
  }
  /** a life lost (or a flag): the jar full again, the moths back on their perches */
  restart(): void {
    this.st.level = 1;
    this.st.target = 1;
    this.st.dark = 0;
    for (const m of this.st.moths) {
      m.mode = 'rest';
      m.x = m.home.x;
      m.y = m.home.y;
    }
    this.leap = null;
  }

  /** the glowing flowers (behind him): World 8's painted bloom, its glow, and the burst as it fills the jar */
  drawBack(ctx: CanvasRenderingContext2D, x0: number, x1: number, t: number): void {
    const pic = bloom();
    for (const f of this.plan.flowers) {
      if (f.x < x0 - 300 || f.x > x1 + 300) continue;
      const s = f.big ? 0.62 : 0.4;
      const pulse = 0.85 + 0.15 * Math.sin(t * 2.1 + f.id);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.55 * pulse;
      const g = glowPic('#fde68a');
      const gs = (f.big ? 320 : 220) * pulse;
      ctx.drawImage(g, f.x - gs / 2, f.y - BLOOM.h * s * 0.75 - gs / 2, gs, gs);
      ctx.restore();
      if (pic) ctx.drawImage(pic, BLOOM.x, BLOOM.y, BLOOM.w, BLOOM.h, f.x - BLOOM.ax * s, f.y - BLOOM.ay * s + 4, BLOOM.w * s, BLOOM.h * s);
      // (the fill: fireflies streaming from the flower into the jar)
      const b = this.burst.get(f.id);
      if (b !== undefined && this.st.t - b < this.set.fill + 0.5) {
        const u = (this.st.t - b) / (this.set.fill + 0.5);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const fly = glowPic('#fef08a', 'fly');
        for (let k = 0; k < 10; k++) {
          const a = k * 0.63 + t * 3;
          const ux = Math.min(1, u * 1.3 + k * 0.03);
          const fx = f.x + Math.cos(a) * 30 * (1 - ux);
          const fy = f.y - 100 + Math.sin(a) * 30 * (1 - ux);
          ctx.globalAlpha = 1 - u * 0.6;
          ctx.drawImage(fly, fx - 9, fy - 9, 18, 18);
        }
        ctx.restore();
      }
    }
  }

  /** the moths, and the jar in his arms (in front of him) */
  drawFront(ctx: CanvasRenderingContext2D, p: LanternPlayer, x0: number, x1: number, t: number): void {
    for (const m of this.st.moths) {
      if (m.mode === 'gone' || m.x < x0 - 100 || m.x > x1 + 100) continue;
      drawMoth(ctx, m.x, m.y, m.beat, m.mode === 'seek');
    }
    // the jar (a stand-in until its painted frames come: a glass jar of fireflies in his arms)
    const j = jarAt(p.x, p.y);
    const lv = this.st.level;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.15 + 0.3 * lv;
    const g = glowPic('#fde047');
    const gs = 30 + 40 * lv;
    ctx.drawImage(g, j.x + p.facing * 6 - gs / 2, j.y - gs / 2, gs, gs);
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = 'rgba(190, 230, 255, 0.35)';
    ctx.strokeStyle = 'rgba(230, 245, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(j.x + p.facing * 6 - 11, j.y - 13, 22, 26, 6);
    ctx.fill();
    ctx.stroke();
    ctx.globalCompositeOperation = 'lighter';
    const fly = glowPic('#fef9c3', 'fly');
    const n = Math.round(1 + 5 * lv);
    for (let k = 0; k < n; k++) {
      const a = t * (1.3 + k * 0.4) + k * 2.1;
      ctx.drawImage(fly, j.x + p.facing * 6 + Math.cos(a) * 6 - 6, j.y + Math.sin(a * 1.3) * 8 - 6, 12, 12);
    }
    ctx.restore();
  }

  /** over the dark: the moths' wing dust (so one is never unseen), and the swarm rising into the firefly tree */
  drawOver(ctx: CanvasRenderingContext2D, cx: number, cy: number, t: number): void {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const dust = glowPic('#c7d2fe', 'fly');
    for (const m of this.st.moths) {
      if (m.mode === 'gone') continue;
      ctx.globalAlpha = 0.5 + 0.3 * Math.sin(t * 6 + m.id);
      ctx.drawImage(dust, m.x - cx - 14, m.y - cy - 14, 28, 28);
    }
    if (this.swarm >= 0) {
      const fly = glowPic('#fef08a', 'fly');
      const tree = this.plan.swarmTree;
      for (let k = 0; k < 90; k++) {
        const u = Math.min(1, Math.max(0, (this.swarm - k * 0.015) / 2.5));
        const a = k * 2.399 + t * (0.4 + (k % 7) * 0.05);
        const rad = 40 + (k % 13) * 22;
        const fx = tree.x + Math.cos(a) * rad * u - cx;
        const fy = tree.y + 260 * (1 - u) + Math.sin(a * 1.2) * rad * 0.5 * u - cy;
        ctx.globalAlpha = 0.8;
        ctx.drawImage(fly, fx - 10, fy - 10, 20, 20);
      }
    }
    ctx.restore();
  }
}

/** a moth (a stand-in until its painted frames come): pale wings beating, drawn toward the light */
function drawMoth(ctx: CanvasRenderingContext2D, x: number, y: number, beat: number, seeking: boolean): void {
  const flap = Math.abs(Math.sin(beat * Math.PI * 2));
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = seeking ? '#e9d5ff' : '#cbd5e1';
  ctx.strokeStyle = '#1e1b4b';
  ctx.lineWidth = 1.5;
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(s * 9, -2, 12, 9 * (0.35 + 0.65 * flap), s * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.fillStyle = '#6b5b45';
  ctx.beginPath();
  ctx.ellipse(0, 0, 3.5, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** the HUD's jar (screen px): a small glass with its light level, under the hearts */
export function drawJarMeter(ctx: CanvasRenderingContext2D, x: number, y: number, level: number, t: number, low: number): void {
  ctx.save();
  const w = 26, h = 34;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
  ctx.beginPath();
  ctx.roundRect(x - 4, y - 4, w + 8, h + 8, 9);
  ctx.fill();
  ctx.fillStyle = 'rgba(200, 230, 255, 0.18)';
  ctx.strokeStyle = 'rgba(226, 240, 255, 0.85)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 7);
  ctx.fill();
  const lh = (h - 6) * Math.max(0, level);
  const blink = level < low ? 0.6 + 0.4 * Math.sin(t * 10) : 1;
  ctx.fillStyle = `rgba(253, 224, 71, ${0.85 * blink})`;
  ctx.beginPath();
  ctx.roundRect(x + 3, y + h - 3 - lh, w - 6, lh, 4);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 7);
  ctx.stroke();
  ctx.restore();
}
