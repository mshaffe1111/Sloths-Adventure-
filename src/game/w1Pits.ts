/**
 * World 1's pits, painted (R-6.38, fix-petals 2026-11-04; the pictures are R-159.1's, approved by Matt on the pit list, PIT-LIST.md, and
 * accepted by the lead: the drop s52-7, the lip s55-7, the bed s60-7, the high drop s65-23; cut by tools/art/combat/pitcut.py).
 * The quality supervisor's stills: a gap Pokey falls through read as more foliage (1-8) or as a log over a muddy stream (1-3, 1-5, 1-9).
 * Now:
 *   - a soft pit (World 1's vault pits: a floor 100-200 px down, a miss costs nothing): the drop down its walls, dark earth and roots to
 *     its floor, the torn lip at each end where the ground is a bank of earth, and the bed of big leaves on its floor: a pit, and a soft one;
 *   - 1-8's long branch (a stage with the chase): the high drop under each gap, canopy tops far below in a mist band going black;
 *   - a floorless gap a builder marks with `pit: 'drop'` on either bank (1-9's hard vault): the drop all the way down, over the water;
 *   - an unmarked floorless gap anywhere else in World 1 is water (1-6's, with Dot's "Careful, water!" and its sign): it keeps its water.
 * For the builders (W1-REBUILD-PLAN): a soft pit needs nothing but a floor SOFT_FLOOR to FALL_BELOW px down and a piece standing in it as
 * its way out; a drop needs `pit: 'drop'` on a bank beside it; 1-8's gaps need nothing.
 * Everything is found once per stage from its platforms (the gaps never move: a breaking branch over a gap is not a floor) and drawn each
 * frame for the gaps in view, behind the platforms (protoArt.ts drawProtoScene, after the ground). Nothing here touches the HUD.
 */
import { trackAtlas } from './atlasLoader.ts';
import type { Platform } from './types.ts';

const URL_OF = {
  drop: new URL('../assets/props/pits/w1-drop.webp', import.meta.url).href,
  lip: new URL('../assets/props/pits/w1-lip.webp', import.meta.url).href,
  bed: new URL('../assets/props/pits/w1-bed.webp', import.meta.url).href,
  high: new URL('../assets/props/pits/w1-high.webp', import.meta.url).href,
} as const;
type Pic = keyof typeof URL_OF;
export const W1_PIT_URLS: readonly string[] = Object.values(URL_OF);

const imgs = new Map<Pic, { img: HTMLImageElement | null; ready: boolean }>();
function pic(k: Pic): HTMLImageElement | null {
  let s = imgs.get(k);
  if (!s) imgs.set(k, (s = { img: null, ready: false }));
  if (!s.img && typeof Image !== 'undefined') {
    const im = new Image();
    const sh = s;
    sh.img = im;
    trackAtlas(im, URL_OF[k], () => { sh.ready = true; }, () => { sh.img = null; });
  }
  return s.ready ? s.img : null;
}
/** start the four pictures loading; true once they are all in (stagePreload.ts waits for it on World 1's stages) */
export function w1PitsReady(): boolean {
  let all = true;
  for (const k of Object.keys(URL_OF) as Pic[]) if (!pic(k)) all = false;
  return all;
}

/** the world px each picture is drawn at (its height follows its own proportions) */
export const PIT_SIZE = { dropTile: 256, highTile: 512, lipW: 84, bedTile: 220 } as const;
/** deeper than this under the ground line and there is no floor: a fall */
export const FALL_BELOW = 200;
/** the ground line drops this far and it is a gap (a sunk step or a pit) */
export const SOFT_BELOW = 50;
/** a soft pit's floor sits this far under the ground line, or more (and under FALL_BELOW): 1-3's, 130 down; a 75 px sunk step is not one */
export const SOFT_FLOOR = 100;
/** where 1-8's high drop is cut from: the canopy far below shows a little, then the mist band and the dark under it */
export const HIGH_FROM = 0.2;
/** a marked drop is nearly black this far under its lip (px) */
export const DROP_DARK = 200;

/** `steps`: the pieces standing in a soft pit above its floor (its way out): never painted over */
/** `drop`: a fall a builder marked as a painted drop (either bank's `pit: 'drop'`); an unmarked fall is water (1-6's) */
export interface PitGap { x0: number; x1: number; top: number; kind: 'fall' | 'soft'; floor?: number; lipL: boolean; lipR: boolean; steps?: Array<[number, number, number, number]>; drop?: boolean }

const floorish = (q: Platform) => !q.broken && q.type !== 'bouncy' && q.type !== 'fragile' && q.type !== 'drift' && q.type !== 'moving';

/**
 * The stage's pits, from its platforms. The ground line is the commonest top of its banks of earth. A spot is ground where a piece stands
 * in the ground band (a bank, a stump or a pillar reaching down to the line, or a log bridge across it); between two stretches of ground
 * is a gap, a soft pit when a floor lies SOFT_FLOOR to FALL_BELOW px down (1-3's, 130), else a fall. A sunk step (75 px) is not a pit.
 * 1-8's long branch has no ground: its gaps are the holes between the chase's sections (and the branches beside them), all falls.
 */
export function findW1Pits(platforms: readonly Platform[]): PitGap[] {
  const chase = platforms.filter((q) => (q as Platform & { chase?: boolean }).chase && !q.broken);
  if (chase.length) return chaseGaps(platforms, chase);
  const banks = platforms.filter((q) => q.height >= 90 && floorish(q));
  if (!banks.length) return [];
  const tops = new Map<number, number>();
  for (const b of banks) tops.set(Math.round(b.y), (tops.get(Math.round(b.y)) ?? 0) + b.width);
  const G = [...tops].sort((p, q) => q[1] - p[1])[0][0];
  // (ground: reaches the ground band from above, or lies across the line itself)
  const ground = platforms.filter((q) => floorish(q) && q.y <= G + SOFT_BELOW && (q.y + q.height >= G + 30 || q.y >= G - 20));
  const under = platforms.filter((q) => floorish(q) && q.y > G + SOFT_BELOW && q.y <= G + FALL_BELOW);
  if (!ground.length) return [];
  // (the ground's stretches along x, merged)
  const spans = ground.map((q) => [q.x, q.x + q.width] as [number, number]).sort((p, q) => p[0] - q[0]);
  const merged: Array<[number, number]> = [];
  for (const [a0, a1] of spans) {
    const m = merged[merged.length - 1];
    if (m && a0 <= m[1] + 2) m[1] = Math.max(m[1], a1);
    else merged.push([a0, a1]);
  }
  const topAt = (x: number) => Math.min(...ground.filter((q) => x >= q.x - 1 && x <= q.x + q.width + 1).map((q) => q.y));
  const bankAt = (x: number) => ground.some((q) => x >= q.x - 1 && x <= q.x + q.width + 1 && q.height >= 90);
  const out: PitGap[] = [];
  for (let i = 0; i + 1 < merged.length; i++) {
    const x0 = merged[i][1], x1 = merged[i + 1][0];
    if (x1 - x0 < 24 || x1 - x0 > 1600) continue;
    const fl = under.filter((q) => q.x < x1 - 4 && q.x + q.width > x0 + 4);
    const top = Math.max(topAt(x0), topAt(x1));
    const lip = { lipL: bankAt(x0), lipR: bankAt(x1) };
    const marked = ground.some((q) => q.pit === 'drop' && (Math.abs(q.x + q.width - x0) < 3 || Math.abs(q.x - x1) < 3));
    if (!fl.length) out.push({ x0, x1, top, kind: 'fall', ...lip, ...(marked ? { drop: true } : {}) });
    else {
      // (the floor is the piece under most of the gap: the soil steps at a soft pit's walls are its way out, not its floor)
      // (and a sunk step's own floor, under all of it, is its floor even with deeper ground below: the highest piece under most of it)
      const ov = (q: Platform) => Math.min(x1, q.x + q.width) - Math.max(x0, q.x);
      const most = fl.filter((q) => ov(q) >= 0.7 * (x1 - x0));
      const floor = most.length ? Math.min(...most.map((q) => q.y)) : [...fl].sort((p, q) => ov(q) - ov(p))[0].y;
      // (the steps out, and anything else standing in it: x, y, w, h)
      const steps = platforms.filter((q) => !q.broken && q.type !== 'fragile' && q.x < x1 && q.x + q.width > x0 && q.y > top + 4 && q.y < floor - 4).map((q) => [q.x, q.y, q.width, q.height] as [number, number, number, number]);
      if (floor - G >= SOFT_FLOOR) out.push({ x0, x1, top, kind: 'soft', floor, ...lip, steps });
    }
  }
  return out;
}

/** 1-8: the holes between the chase's sections (and any branch at their height), with nothing under them within 400 px: falls */
function chaseGaps(platforms: readonly Platform[], chase: readonly Platform[]): PitGap[] {
  const path = platforms.filter((q) => floorish(q) && q.width >= 40 && chase.some((c) => Math.abs(c.y - q.y) < 80));
  const s = path.map((q) => [q.x, q.x + q.width, q.y] as [number, number, number]).sort((p, q) => p[0] - q[0]);
  const merged: Array<[number, number, number, number]> = [];
  for (const [a0, a1, y] of s) {
    const m = merged[merged.length - 1];
    if (m && a0 <= m[1] + 2) { m[1] = Math.max(m[1], a1); m[3] = y; } else merged.push([a0, a1, y, y]);
  }
  const out: PitGap[] = [];
  for (let i = 0; i + 1 < merged.length; i++) {
    const x0 = merged[i][1], x1 = merged[i + 1][0];
    if (x1 - x0 < 24 || x1 - x0 > 2400) continue;
    const top = Math.max(merged[i][3], merged[i + 1][2]);
    if (platforms.some((q) => floorish(q) && q.x < x1 - 4 && q.x + q.width > x0 + 4 && q.y > top + 20 && q.y < top + 400)) continue;
    out.push({ x0, x1, top, kind: 'fall', lipL: false, lipR: false });
  }
  return out;
}

const cache = new WeakMap<readonly Platform[], PitGap[]>();
const grads = new WeakMap<PitGap, [CanvasGradient, CanvasGradient, CanvasGradient]>();
const pitsOf = (platforms: readonly Platform[]) => {
  let v = cache.get(platforms);
  if (!v) cache.set(platforms, (v = findW1Pits(platforms)));
  return v;
};

/** draw the pits in view (World 1 only: protoArt.ts calls it there); false while the pictures load */
/**
 * `layer`: 'under' is drawn before the ground (the drop in each pit, 1-8's high drop): the ground's own pit shade, floor, steps and bank
 * faces then draw over it as they always did, so a step out of a pit is never hidden; 'over' after it (the lips, the leaf bed).
 */
export function drawW1Pits(ctx: CanvasRenderingContext2D, platforms: readonly Platform[], view: { x0: number; x1: number; y0?: number; y1?: number }, layer: 'under' | 'over'): boolean {
  if (!w1PitsReady()) return false;
  const drop = pic('drop')!, lip = pic('lip')!, bed = pic('bed')!, high = pic('high')!;
  const chase = platforms.some((q) => (q as Platform & { chase?: boolean }).chase);
  const bottom = (view.y1 ?? 2000) + 40;
  const lw = PIT_SIZE.lipW, lh = (lw * lip.height) / lip.width;
  const lips = (g: PitGap) => {
    // (the torn lip where the ground is a bank of earth: the left bank's end as painted, the right's mirrored)
    if (g.lipL) ctx.drawImage(lip, g.x0 - lw + 10, g.top - 10, lw, lh);
    if (g.lipR) {
      ctx.save();
      ctx.translate(g.x1 + lw - 10, g.top - 10);
      ctx.scale(-1, 1);
      ctx.drawImage(lip, 0, 0, lw, lh);
      ctx.restore();
    }
  };
  /** the picture tiled across the gap from `top` down to `to`, from a fixed origin (the same earth whatever the camera does) */
  /** `sy`: the share of the picture's height its top is cut at (1-8's high drop shows its mist and the dark under it, not the canopy) */
  const fill = (g: PitGap, img: HTMLImageElement, tw: number, top: number, to: number, sy = 0, feather = 0) => {
    const syPx = img.height * sy;
    const th = (tw * (img.height - syPx)) / img.width;
    // (`feather`: the outer px each side fade in over the scene behind, in 6 px strips: 1-8's gap has no bank face to end on)
    const parts: Array<[number, number, number]> = [];
    const f = Math.min(feather, (g.x1 - g.x0) / 3);
    if (f > 0) {
      for (let u = 0; u < f; u += 6) {
        const a = (u + 3) / f;
        parts.push([g.x0 + u, Math.min(6, f - u), a], [g.x1 - u - Math.min(6, f - u), Math.min(6, f - u), a]);
      }
      parts.push([g.x0 + f, g.x1 - g.x0 - 2 * f, 1]);
    } else parts.push([g.x0, g.x1 - g.x0, 1]);
    for (const [cx, cw, a] of parts) {
      if (cw <= 0) continue;
      ctx.save();
      ctx.globalAlpha = Math.min(1, a);
      ctx.beginPath();
      ctx.rect(cx, g.top, cw, to - g.top);
      ctx.clip();
      for (let x = Math.floor(cx / tw) * tw; x < cx + cw; x += tw) ctx.drawImage(img, 0, syPx, img.width, img.height - syPx, x, top, tw, th);
      ctx.fillStyle = '#050403';
      if (top + th - 2 < to) ctx.fillRect(cx, top + th - 2, cw, to - (top + th - 2));
      ctx.restore();
    }
  };
  /** a soft pit's inside in shadow (it covers the ground's own pit shade): darker down to its floor, darker still at its two walls */
  // (its three gradients are made once per pit and kept: a pit never moves, and a gradient a frame is what drawcheck counts)
  const shade = (g: PitGap, to: number, deep = false) => {
    let gr = grads.get(g);
    const wall = Math.min(46, (g.x1 - g.x0) / 3);
    if (!gr) {
      const v = ctx.createLinearGradient(0, g.top, 0, to);
      v.addColorStop(0, deep ? 'rgba(10,7,5,0.45)' : 'rgba(10,7,5,0.30)');
      v.addColorStop(1, deep ? 'rgba(10,7,5,0.94)' : 'rgba(10,7,5,0.72)');
      const side = (a: number, b: number) => {
        const h = ctx.createLinearGradient(a, 0, b, 0);
        h.addColorStop(0, 'rgba(10,7,5,0.55)');
        h.addColorStop(1, 'rgba(10,7,5,0)');
        return h;
      };
      grads.set(g, (gr = [v, side(g.x0, g.x0 + wall), side(g.x1, g.x1 - wall)]));
    }
    ctx.save();
    ctx.fillStyle = gr[0];
    ctx.fillRect(g.x0, g.top, g.x1 - g.x0, to - g.top);
    ctx.fillStyle = gr[1];
    ctx.fillRect(g.x0, g.top, wall, to - g.top);
    ctx.fillStyle = gr[2];
    ctx.fillRect(g.x1 - wall, g.top, wall, to - g.top);
    ctx.restore();
  };
  /** clip to the pit's box minus its steps (a step is drawn by the ground under this and must stay in view: it is the way out) */
  const clipOut = (g: PitGap, y0: number, y1: number) => {
    ctx.beginPath();
    ctx.rect(g.x0 - 8, y0, g.x1 - g.x0 + 16, y1 - y0);
    for (const [sx, sy, sw, sh] of g.steps ?? []) ctx.rect(sx + sw, sy - 2, -sw, sh + 4);
    ctx.clip('evenodd');
  };
  for (const g of pitsOf(platforms)) {
    if (g.x1 < view.x0 - 100 || g.x0 > view.x1 + 100) continue;
    if (g.kind === 'fall') {
      // (a fall off the long branch: the canopy far below, a mist band, then black; it starts a little under the branch)
      if (chase && layer === 'under') fill(g, high, PIT_SIZE.highTile, g.top, bottom, HIGH_FROM, 24);
      // (a drop a builder marked, `pit: 'drop'` on a bank, 1-9's hard vault: the drop down to the view's bottom, over the water, and its lips)
      else if (g.drop) {
        if (layer === 'under') {
          fill(g, drop, PIT_SIZE.dropTile, g.top, bottom);
          // (darker and sooner than a soft pit's: nearly black DROP_DARK px down, so it reads as a fall and not as more earth)
          shade(g, g.top + DROP_DARK, true);
          ctx.fillStyle = 'rgba(10,7,5,0.94)';
          if (bottom > g.top + DROP_DARK) ctx.fillRect(g.x0, g.top + DROP_DARK, g.x1 - g.x0, bottom - (g.top + DROP_DARK));
        } else lips(g);
      }
      // (an unmarked floorless gap is water, which Dot warns of by name on 1-6: it keeps its painted water)
      continue;
    }
    if (g.floor === undefined) continue;
    // a soft pit: dark earth and roots down its walls to the floor, the lips, and the bed of big leaves on its floor (it catches him)
    if (layer === 'under') {
      // (and never over a step: some are drawn by the platforms' own pass before this one, 1-5's middle stump)
      ctx.save();
      clipOut(g, g.top, g.floor + 12);
      fill(g, drop, PIT_SIZE.dropTile, g.top, g.floor + 12);
      shade(g, g.floor + 12);
      ctx.restore();
      continue;
    }
    lips(g);
    const bw = PIT_SIZE.bedTile, bh = (bw * bed.height) / bed.width;
    ctx.save();
    clipOut(g, g.floor - bh - 20, g.floor + 14);
    for (let x = g.x0 - 20; x < g.x1; x += bw * 0.8) ctx.drawImage(bed, x, g.floor - bh + 14, bw, bh);
    ctx.restore();
  }
  return true;
}
