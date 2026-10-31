/**
 * w8LanternRun — 8-4's jar of fireflies inside the game engine (lantern.ts is the jar, w8Lantern.ts the stage). The engine hands it the
 * player each frame; it steps the jar, says when a fall is soft, gives the darkness its light ring, and draws the flowers, the moths, the
 * jar and the firefly tree's swarm.
 */
import { glowPic } from './glow.ts';
import { KIT_FRAMES } from './kitAtlasData.ts';
import { LANTERN_FRAMES, POKEY_JAR_FRAMES, type LanternFrame } from './w8LanternAtlas.ts';
import type { StdFrame } from './heroStandardData.ts';
import { TREE_CROWN, TREE_H } from './w8Lantern.ts';
import { jarAt, LANTERN, lanternRadius, newLantern, setbackTo, stepLantern, takeoff, type LanternEvent, type LanternPlan, type LanternSetting, type LanternState } from './lantern.ts';

/** how full the jar is as the stage starts: half, so the first flower (just ahead) fills it before anything can go wrong */
export const START_LEVEL = 0.5;

const FLOWER_URL = new URL('../assets/w6to10/props-made/w8c.webp', import.meta.url).href;
/** World 8's painted night bloom (props-made/w8c 'night-flowers'): the glowing flower */
const BLOOM = { x: 0, y: 0, w: 245, h: 320, ax: 116, ay: 320 } as const;
let bloomPic: HTMLImageElement | null = null;
/** the jar and the moth, painted on Hugging Face (src/assets/w8/lantern.webp, w8LanternAtlas.ts) */
const PIECES_URL = new URL('../assets/w8/lantern.webp', import.meta.url).href;
let piecesPic: HTMLImageElement | null = null;
const pieces = (): HTMLImageElement | null => {
  if (typeof Image === 'undefined') return null;
  if (!piecesPic) {
    piecesPic = new Image();
    piecesPic.src = PIECES_URL;
  }
  return piecesPic.complete && piecesPic.naturalWidth ? piecesPic : null;
};
/** World 8's kit (src/assets/kits/w8.webp, kitAtlasData.ts KIT_FRAMES[8]): its big trunk and its twisted vine, for the trunks he climbs */
const KIT8_URL = new URL('../assets/kits/w8.webp', import.meta.url).href;
const KIT8 = KIT_FRAMES[8] as Record<'wall' | 'liana', { x: number; y: number; w: number; h: number }>;
let kit8Pic: HTMLImageElement | null = null;
const kit8 = (): HTMLImageElement | null => {
  if (typeof Image === 'undefined') return null;
  if (!kit8Pic) {
    kit8Pic = new Image();
    kit8Pic.src = KIT8_URL;
  }
  return kit8Pic.complete && kit8Pic.naturalWidth ? kit8Pic : null;
};

/** Pokey with the jar in his paws (src/assets/w8/pokey-jar.webp): his frames for standing, the hurry and the air */
const JAR_HERO_URL = new URL('../assets/w8/pokey-jar.webp', import.meta.url).href;
let jarHeroPic: HTMLImageElement | null = null;
export function jarHeroImage(): HTMLImageElement | null {
  if (typeof Image === 'undefined') return null;
  if (!jarHeroPic) {
    jarHeroPic = new Image();
    jarHeroPic.src = JAR_HERO_URL;
  }
  return jarHeroPic;
}
/**
 * the jar frame for a standard pose (heroStandard.ts names), or undefined where his paws are busy (a climb, a swing, a punch: the
 * standard frame, the jar at his hip). The walk and the run's eight frames step through the four jar steps, two to each.
 */
export function jarFrame(name: string): StdFrame | undefined {
  const m = /^(walk|run)_(\d)$/.exec(name);
  if (m) return POKEY_JAR_FRAMES[`walk_${Number(m[2]) >> 1}`];
  if (name === 'idle' || name === 'blink' || name === 'land' || name === 'recover' || name === 'duck') return POKEY_JAR_FRAMES.hold;
  // (going up and over the top he tucks round the jar; coming down, legs down for the landing)
  if (name === 'launch' || name.startsWith('rise') || name === 'apex' || name === 'tuck') return POKEY_JAR_FRAMES.tuck;
  if (name.startsWith('fall')) return POKEY_JAR_FRAMES.air;
  return undefined;
}

/** draw a piece with its anchor at (x, y), `sx` and `sy` its scale */
const blitPiece = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, f: LanternFrame, x: number, y: number, sx: number, sy = sx) =>
  ctx.drawImage(img, f.x, f.y, f.w, f.h, x - f.ax * sx, y - f.ay * sy, f.w * sx, f.h * sy);
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
  hanging?: boolean;
  attacking?: boolean;
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
  /** where the jar was as he opened it (the swarm streams from there up into the tree) */
  private swarmFrom = { x: 0, y: 0 };
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
      this.swarmFrom = jarAt(p.x + p.facing * 12, p.y - 14);
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
    // the firefly tree (Hugging Face, w8LanternAtlas.ts): standing on the last bough, its crown lit by the swarm at the end
    const tree = this.plan.swarmTree;
    const tp = pieces();
    if (tp && tree.x > x0 - 600 && tree.x < x1 + 600) {
      const f = LANTERN_FRAMES.tree;
      blitPiece(ctx, tp, f, tree.x, tree.y + 24, TREE_H / f.h);
    }
    this.drawTrunks(ctx, x0, x1);
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

  /**
   * the trunks he climbs: World 8's painted trunk (the kit's 'wall' piece, the big mossy blue trunk) at a real tree's girth, standing
   * on the bough at its foot and rising past the one it leads up to, just behind the vine; the kit's twisted vine up its face where he
   * climbs (the lead's review: the thin kapok trunk read as a purple pole against the boughs' walls)
   */
  private drawTrunks(ctx: CanvasRenderingContext2D, x0: number, x1: number): void {
    const img = kit8();
    if (!img) return;
    for (const tr of this.plan.trunks ?? []) {
      if (tr.x < x0 - 300 || tr.x > x1 + 300) continue;
      const f = KIT8.wall, v = KIT8.liana;
      const tw = 170, th = (tw * f.h) / f.w;
      const cx = tr.x - 52;
      ctx.save();
      ctx.beginPath();
      ctx.rect(cx - tw / 2, tr.top - 260, tw, tr.foot + 14 - (tr.top - 260));
      ctx.clip();
      // (the piece once at the foot, its roots on the bough; above it only the piece's middle, so no cut top or root flare shows as a
      // band partway up: §5b item 2)
      const mid = { y: f.y + f.h * 0.18, h: f.h * 0.36 };
      const mh = (tw * mid.h) / f.w;
      for (let y = tr.foot + 10 - th * 0.82 - mh, k = 1; y > tr.top - 260 - mh; y -= mh, k++) {
        ctx.save();
        // (every other one flipped upside down: neighbours then meet on the same row of the picture, so there is no seam where they join)
        if (k % 2 === 1) { ctx.translate(0, y * 2 + mh); ctx.scale(1, -1); }
        ctx.drawImage(img, f.x, mid.y, f.w, mid.h, cx - tw / 2, y, tw, mh);
        ctx.restore();
      }
      ctx.drawImage(img, f.x, f.y + f.h * 0.18, f.w, f.h * 0.82, cx - tw / 2, tr.foot + 10 - th * 0.82, tw, th * 0.82);
      ctx.restore();
      const vw = 44, vh = (vw * v.h) / v.w;
      ctx.save();
      ctx.beginPath();
      ctx.rect(tr.x - vw, tr.top - 10, vw * 2, tr.foot - tr.top + 16);
      ctx.clip();
      for (let y = tr.foot + 6 - vh; y > tr.top - 10 - vh; y -= vh - 6) ctx.drawImage(img, v.x, v.y, v.w, v.h, tr.x - vw / 2, y, vw, vh);
      ctx.restore();
    }
  }

  /** the moths, and the jar in his arms (in front of him) */
  drawFront(ctx: CanvasRenderingContext2D, p: LanternPlayer, x0: number, x1: number, t: number): void {
    for (const m of this.st.moths) {
      if (m.mode === 'gone' || m.x < x0 - 100 || m.x > x1 + 100) continue;
      drawMoth(ctx, m.x, m.y, m.beat, m.mode === 'seek');
    }
    // the jar's own light: a soft warm glow where it is (in his paws, or at his hip while his paws are busy)
    const busy = p.climbing || !!p.isVineSwinging || !!p.hanging || !!p.attacking;
    const j = busy ? { x: p.x - p.facing * 14, y: p.y - 34 } : { x: p.x + p.facing * 12, y: p.y - 52 };
    const lv = this.st.level;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.18 + 0.4 * lv;
    const gs = 34 + 46 * lv;
    ctx.drawImage(glowPic('#fde047'), j.x - gs / 2, j.y - gs / 2, gs, gs);
    ctx.restore();
    // (at his hip on its twine while he climbs, swings or punches: the painted jar, lit by its level)
    const img = pieces();
    if (busy && img) {
      const s = 0.26;
      blitPiece(ctx, img, LANTERN_FRAMES.jarDim, j.x, j.y, s);
      ctx.save();
      ctx.globalAlpha = lv;
      blitPiece(ctx, img, LANTERN_FRAMES.jar, j.x, j.y, s);
      ctx.restore();
    }
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
      // (the fireflies stream out of the jar one after another, rise in a loose spiral and settle round the tree's crown, blinking)
      const fly = glowPic('#fef08a', 'fly');
      const tree = this.plan.swarmTree;
      const cy0 = tree.y - TREE_CROWN;
      const from = this.swarmFrom;
      for (let k = 0; k < 110; k++) {
        const u0 = Math.min(1, Math.max(0, (this.swarm - k * 0.02) / 2.2));
        const u = u0 * u0 * (3 - 2 * u0);
        const a = k * 2.399 + t * (0.35 + (k % 7) * 0.05);
        const rad = 30 + (k % 13) * 21;
        const ox = tree.x + Math.cos(a) * rad, oy = cy0 + Math.sin(a * 1.2) * rad * 0.55;
        const sx = from.x + (ox - from.x) * u + Math.sin(u * 9 + k) * 30 * (1 - u);
        const sy = from.y + (oy - from.y) * u;
        if (u0 <= 0) continue;
        ctx.globalAlpha = 0.55 + 0.45 * Math.sin(t * (3 + (k % 5)) + k);
        const sz = 14 + (k % 3) * 5;
        ctx.drawImage(fly, sx - cx - sz / 2, sy - cy - sz / 2, sz, sz);
      }
    }
    ctx.restore();
  }
}

/** a moth: the painted moth seen from above, its wings beating (the picture narrows and widens as they fold up and open: a flap) */
function drawMoth(ctx: CanvasRenderingContext2D, x: number, y: number, beat: number, seeking: boolean): void {
  const img = pieces();
  if (!img) return;
  const flap = 0.3 + 0.7 * Math.abs(Math.cos(beat * Math.PI * 2));
  const s = seeking ? 0.36 : 0.32;
  ctx.save();
  // (a little tilt with the flutter)
  ctx.translate(x, y);
  ctx.rotate(Math.sin(beat * Math.PI * 4) * 0.08);
  blitPiece(ctx, img, LANTERN_FRAMES.moth, 0, 0, s * flap, s);
  ctx.restore();
}

/** the HUD's jar gauge (screen px, its top-left at x, y): the painted jar on the HUD's wooden plate, hung on its tendril (Hugging Face,
 *  in the painted HUD's style); the lit jar fades out over the empty one as the light goes, and blinks when low */
export function drawJarMeter(ctx: CanvasRenderingContext2D, x: number, y: number, level: number, t: number, low: number): void {
  const img = pieces();
  if (!img) return;
  const f = LANTERN_FRAMES.gaugeLit, fd = LANTERN_FRAMES.gaugeDim;
  const s = 52 / f.h;
  ctx.save();
  blitPiece(ctx, img, fd, x + f.ax * s, y + f.ay * s, s);
  const blink = level < low ? 0.55 + 0.45 * Math.sin(t * 10) : 1;
  ctx.globalAlpha = Math.max(0, Math.min(1, level)) * blink;
  blitPiece(ctx, img, f, x + f.ax * s, y + f.ay * s, s);
  ctx.restore();
}
