/**
 * A painted lair plate behind a boss fight: a calm painting and its phase-3 (rage) twin, cross-faded by how far the lair has turned.
 * The plate is pinned to the arena (its painted floor line sits on the arena floor) and drifts a little against the camera so it reads
 * as far away. Past its edges the painting carries on as its own mirror image, so a tall phone or a wide screen never sees a hard end. Used by the Moonlit Mire (Crocus Rex), the Cloud Aerie (Sky Sovereign) and the Silk Hollow (Tarantula Queen).
 *
 * A foreground strip (painted, keyed) can go over the fight in screen space: its top band hangs from the top of the view and its bottom
 * band stands along the bottom edge.
 */
import type { LairArena, LairView } from './lairArt.ts';
import { trackAtlas } from './atlasLoader.ts';

class Picture {
  img: HTMLImageElement | null = null;
  ready = false;
  constructor(private url: string) {}
  get(): HTMLImageElement | null {
    if (typeof Image === 'undefined') return null;
    if (!this.img) {
      const img = new Image();
      this.img = img;
      trackAtlas(img, this.url, () => { this.ready = true; }, () => { this.img = null; }, () => { this.img = null; this.ready = false; });
    }
    return this.ready ? this.img : null;
  }
}

export interface PlateSpec {
  calm: string;
  rage: string;
  /** how far down the painting its floor line is (0..1): that line is put on the arena floor */
  floorAt: number;
  /** the plate's width as a multiple of the arena's */
  widthK: number;
  /** how much it drifts with the camera (0 = pinned to the arena, 1 = pinned to the screen) */
  drift: number;
  /** the fill while the painting loads */
  fill: string;
  /**
   * Where the painting's centre of interest is across it (0..1). On an upright phone the view is a narrow slice of the plate, so the
   * plate slides to put this on the screen, and drifts more with the camera so it stays there. Left out, the middle (no slide).
   */
  focusX?: number;
  /**
   * Above the painting, carry on its own top band stretched upward (an open sky) instead of a mirror image: a mirror would show the
   * moon twice on a tall screen.
   */
  skyTop?: boolean;
  /**
   * Where the view reaches above the painting, grow it (about its floor line) until its top meets the top of the view, rather than
   * showing a mirror image: for a painting whose top is a canopy or a cave roof, where a mirror shows as a seam.
   */
  cover?: boolean;
}

export class LairPlate {
  private calm: Picture;
  private rage: Picture;
  constructor(private spec: PlateSpec) {
    this.calm = new Picture(spec.calm);
    this.rage = new Picture(spec.rage);
  }

  /** where the point `fx` of the way across the painting is, in world x, for this view (16:9 assumed while it loads) */
  worldX(fx: number, v: LairView, a: LairArena): number {
    const base = this.calm.get();
    const g = this.place(v, a, base ? base.naturalHeight / base.naturalWidth : 9 / 16);
    return v.x + g.left + fx * g.dw;
  }

  /** the painting's place in the view: its left and top edges (view units) and its drawn size */
  private place(v: LairView, a: LairArena, aspect: number) {
    const s = this.spec;
    let dw = (a.right - a.left) * s.widthK;
    let dh = dw * aspect;
    if (s.cover) {
      // (from the view's height, not where the floor sits in it, so the painting never breathes as the camera rises and falls)
      const need = (v.vh * 0.85) / s.floorAt;
      if (need > dh) {
        dw *= need / dh;
        dh = need;
      }
    }
    const mid = (a.left + a.right) / 2;
    const camMid = v.x + v.vw / 2;
    // upright (taller than wide), slide the focus onto the screen and let the plate follow the camera more so it stays there
    const tall = Math.max(0, Math.min(1, (v.vh / v.vw - 1) / 0.8));
    const slide = s.focusX === undefined ? 0 : (0.5 - s.focusX) * dw * tall;
    const drift = s.drift + (s.focusX === undefined ? 0 : (0.7 - s.drift) * tall);
    const left = mid - dw / 2 - v.x + (camMid - mid) * drift + slide;
    const top = a.floor - s.floorAt * dh - v.y;
    return { left, top, dw, dh };
  }

  /** the plate, with `rage` (0..1) of the phase-3 painting over the calm one */
  draw(ctx: CanvasRenderingContext2D, v: LairView, a: LairArena, rage: number) {
    const s = this.spec;
    ctx.fillStyle = s.fill;
    ctx.fillRect(0, 0, v.vw, v.vh);
    const c = this.calm.get();
    const r = rage > 0.01 ? this.rage.get() : null;
    const base = c ?? r;
    if (!base) return;
    const { left, top, dw, dh } = this.place(v, a, base.naturalHeight / base.naturalWidth);
    const sky = !!s.skyTop;
    if (c && (!r || rage < 0.99)) tile(ctx, c, left, top, dw, dh, v, sky);
    if (r) {
      ctx.save();
      ctx.globalAlpha = c ? Math.min(1, rage) : 1;
      tile(ctx, r, left, top, dw, dh, v, sky);
      ctx.restore();
    }
  }
}

/**
 * the painting, and its mirror images on any side the view reaches past it (a mirror meets its original edge to edge, so no seam).
 * With `sky`, above it the painting's top band is stretched up to the top of the view instead.
 */
function tile(ctx: CanvasRenderingContext2D, img: HTMLImageElement, left: number, top: number, dw: number, dh: number, v: LairView, sky = false) {
  for (let ty = -1; ty <= 1; ty++) {
    const y = top + ty * dh;
    if (y + dh <= 0 || y >= v.vh) continue;
    for (let tx = -1; tx <= 1; tx++) {
      const x = left + tx * dw;
      if (x + dw <= 0 || x >= v.vw) continue;
      if (ty < 0 && sky) {
        // the top 3% of the painting, stretched from the view's top down to the painting's top edge (mirrored sideways like the rest)
        const band = Math.max(2, Math.round(img.naturalHeight * 0.03));
        const h = Math.max(0, top) + 1;
        ctx.save();
        ctx.translate(x + (tx ? dw / 2 : 0), 0);
        if (tx) ctx.scale(-1, 1);
        ctx.drawImage(img, 0, 0, img.naturalWidth, band, tx ? -dw / 2 : 0, 0, dw, h);
        ctx.restore();
        continue;
      }
      ctx.save();
      ctx.translate(x + (tx ? dw / 2 : 0), y + (ty ? dh / 2 : 0));
      if (tx || ty) ctx.scale(tx ? -1 : 1, ty ? -1 : 1);
      ctx.drawImage(img, tx ? -dw / 2 : 0, ty ? -dh / 2 : 0, dw, dh);
      ctx.restore();
    }
  }
}

/**
 * A painted foreground strip (keyed, 2048 wide): the band above `split` (a fraction of its height) hangs from the top of the view, the
 * band below it stands along the bottom edge. `h` is the drawn height of the whole strip in view units; it tiles across, mirrored every
 * other time, and slides with the camera faster than the fight so it reads as near.
 */
export class LairStrip {
  private pic: Picture;
  constructor(url: string, private split: number) {
    this.pic = new Picture(url);
  }

  draw(ctx: CanvasRenderingContext2D, v: LairView, h: number, alpha = 1) {
    const img = this.pic.get();
    if (!img) return;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const dw = (iw * h) / ih;
    const sy = Math.round(ih * this.split);
    const hTop = h * this.split;
    const hBot = h - hTop;
    const off = -(((v.x * 1.25) % (dw * 2)) + dw * 2) % (dw * 2);
    ctx.save();
    ctx.globalAlpha = alpha;
    for (let k = 0, x = off; x < v.vw; k++, x += dw) {
      const flip = k % 2 === 1;
      ctx.save();
      ctx.translate(x + (flip ? dw : 0), 0);
      if (flip) ctx.scale(-1, 1);
      if (sy > 0) ctx.drawImage(img, 0, 0, iw, sy, 0, 0, dw, hTop);
      if (sy < ih) ctx.drawImage(img, 0, sy, iw, ih - sy, 0, v.vh - hBot, dw, hBot);
      ctx.restore();
    }
    ctx.restore();
  }
}
