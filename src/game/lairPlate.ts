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
}

export class LairPlate {
  private calm: Picture;
  private rage: Picture;
  constructor(private spec: PlateSpec) {
    this.calm = new Picture(spec.calm);
    this.rage = new Picture(spec.rage);
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
    const dw = (a.right - a.left) * s.widthK;
    const dh = (dw * base.naturalHeight) / base.naturalWidth;
    const mid = (a.left + a.right) / 2;
    const camMid = v.x + v.vw / 2;
    const left = mid - dw / 2 - v.x + (camMid - mid) * s.drift;
    const top = a.floor - s.floorAt * dh - v.y;
    if (c && (!r || rage < 0.99)) tile(ctx, c, left, top, dw, dh, v);
    if (r) {
      ctx.save();
      ctx.globalAlpha = c ? Math.min(1, rage) : 1;
      tile(ctx, r, left, top, dw, dh, v);
      ctx.restore();
    }
  }
}

/** the painting, and its mirror images on any side the view reaches past it (a mirror meets its original edge to edge, so no seam) */
function tile(ctx: CanvasRenderingContext2D, img: HTMLImageElement, left: number, top: number, dw: number, dh: number, v: LairView) {
  for (let ty = -1; ty <= 1; ty++) {
    const y = top + ty * dh;
    if (y + dh <= 0 || y >= v.vh) continue;
    for (let tx = -1; tx <= 1; tx++) {
      const x = left + tx * dw;
      if (x + dw <= 0 || x >= v.vw) continue;
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
