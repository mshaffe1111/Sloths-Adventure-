/**
 * vineFieldArt — how a vine field draws (vineField.ts, R-165.177). STAND-INS until 1-4's own art (R-165.178), named plainly:
 *   - a field vine is World 1's painted vine (castArt.ts vineTile) hung straight from its top, a little curl at its free end (a plain
 *     green line while the sheet loads);
 *   - a fruit cluster is CODE-DRAWN: a bunch of small round orange-red wild figs on a stalk (circles; the story keeper's nature check,
 *     11-13: never purple grocery figs), no painted art yet;
 *   - a falling pod, its burst, a fig bunch and a shut gate's bough are ART's painted pieces (11-13, the inventory's hf1113/w14-*, sized
 *     by its pokey_scale against his drawn 89.1: pod 0.45, burst 0.34, figs 0.45, bough by its own walk line); the fluff's trickle is a
 *     small code touch (STAGE-RULES §4). The code-drawn shapes below draw only while a picture loads (named stand-ins).
 * Nothing allocates per frame (PERFORMANCE-RULES §3.1): the strand's points are a kept array.
 */
import type { Platform, Vine } from './types.ts';
import type { PodColumn, PodState } from './podfall.ts';
import { trackAtlas } from './atlasLoader.ts';

// ───────────────────────────── 1-4's painted pieces (ART 11-13, the inventory's hf1113/w14-*) ─────────────────────────────
/** his drawn height (heroSprite.ts; LESSONS D41): the inventory's pokey_scale is a share of it */
const POKEY_H = 89.1;
type Piece = { url: string; img: HTMLImageElement | null; ready: boolean };
const piece = (url: string): Piece => ({ url, img: null, ready: false });
const PIECES = {
  pod: piece(new URL('../assets/w1-1113/w14-kapokpod.webp', import.meta.url).href),
  burst: piece(new URL('../assets/w1-1113/w14-kapokpod-burst.webp', import.meta.url).href),
  figs: piece(new URL('../assets/w1-1113/w14-figcluster.webp', import.meta.url).href),
  bough: piece(new URL('../assets/w1-1113/w14-roughbough.webp', import.meta.url).href),
  // (a silk tuft cut from the burst's own plume, its husk side faded out: POLISH-1 11-13, the inventory's hf1113/w14-fluff)
  fluff: piece(new URL('../assets/w1-1113/w14-fluff.webp', import.meta.url).href),
  // (a shut gate's thorn tangle: 1-2's own painted bramble, the inventory's w1-thorn-bramble-long, the art World 1's hurt floor ships)
  thorns: piece(new URL('../assets/props/pits/w1-thorn-long.webp', import.meta.url).href),
};
/** a piece's picture once loaded (starts the load; the phone taking it back reloads it: atlasLoader.ts) */
function pic(p: Piece): HTMLImageElement | null {
  if (!p.img && typeof Image !== 'undefined') {
    const im = new Image();
    p.img = im;
    trackAtlas(im, p.url, () => { p.ready = true; }, () => { p.img = null; }, () => { p.img = null; p.ready = false; });
  }
  return p.ready ? p.img : null;
}
/** drawn heights (px), the inventory's pokey_scale x his drawn height */
const POD_H = 0.45 * POKEY_H, BURST_H = 0.34 * POKEY_H, FIGS_H = 0.45 * POKEY_H;
/** the rough bough's picture: 707 x 180, his feet at 42 px down, walkable from 90 to 666 px across (the inventory row) */
const BOUGH = { w: 707, h: 180, walkY: 42, x0: 90, x1: 666 } as const;
import { vineTile } from './castArt.ts';
import { layRope } from './ropeArt.ts';
import type { VineCluster } from './vineField.ts';

/** a field vine's drawn thickness (px): thinner than the draped pair's liana (pairArt.ts 15), a vine a hand */
export const FIELD_THICK = 11;

const pts: Array<[number, number]> = [[0, 0], [0, 0], [0, 0], [0, 0]];

/** a field vine, top to its free end */
export function drawFieldVine(ctx: CanvasRenderingContext2D, x: number, top: number, bottom: number) {
  pts[0][0] = x; pts[0][1] = top - 6;
  pts[1][0] = x; pts[1][1] = bottom - 22;
  pts[2][0] = x + 4; pts[2][1] = bottom - 6;
  pts[3][0] = x + 10; pts[3][1] = bottom + 2;
  const v = vineTile();
  if (v) {
    layRope(ctx, v.src, pts, FIELD_THICK, v.tile);
    return;
  }
  ctx.strokeStyle = '#6f7d2f';
  ctx.lineWidth = FIELD_THICK * 0.8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < 4; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.stroke();
}

/** the bunch's fruit, as offsets in a 1 x 1 box (x from the middle, y up from the bottom), and each one's radius */
const FRUIT: ReadonlyArray<readonly [number, number, number]> = [
  [0, 0.16, 0.17], [-0.24, 0.3, 0.16], [0.24, 0.3, 0.16], [-0.12, 0.52, 0.17], [0.13, 0.54, 0.17], [0, 0.74, 0.15],
];

/** the clusters still on screen: each on its vine's line, its bottom at `y` (stand-in: code-drawn) */
export function drawClusters(ctx: CanvasRenderingContext2D, clusters: readonly VineCluster[], vines: readonly Vine[], x0: number, x1: number) {
  for (const c of clusters) {
    if (c.gone) continue;
    let x = NaN;
    for (const v of vines) if (v.id === c.vine) x = v.x + (c.dx ?? 0);
    if (!(x > x0 - 80 && x < x1 + 80)) continue;
    const figs = pic(PIECES.figs);
    if (figs) {
      // (the bunch hangs from its stalk at the top: its bottom at c.y, its height the inventory's)
      const w = (FIGS_H * figs.width) / figs.height;
      ctx.drawImage(figs, x - w / 2, c.y - FIGS_H, w, FIGS_H);
      continue;
    }
    const h = c.h;
    // the stalk up to the vine
    ctx.strokeStyle = '#4d5a1e';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x, c.y - h);
    ctx.lineTo(x, c.y - h * 0.7);
    ctx.stroke();
    for (const [fx, fy, r] of FRUIT) {
      const cx = x + fx * h, cy = c.y - fy * h, rr = r * h;
      ctx.fillStyle = '#c94a24';
      ctx.strokeStyle = '#5a1d0c';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, rr, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'rgba(255, 214, 170, 0.6)';
      ctx.beginPath();
      ctx.arc(cx - rr * 0.35, cy - rr * 0.35, rr * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
    // a leaf over the stalk
    ctx.fillStyle = '#3f7d2a';
    ctx.beginPath();
    ctx.ellipse(x + h * 0.18, c.y - h * 0.86, h * 0.2, h * 0.08, -0.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** a kapok pod (stand-in): an upright spindle `r` px across at its widest (drawn 1.5x its hit radius: a pod must read on a phone, and
 *  a drawing a little bigger than its hit is the forgiving side), a dark outline against the foliage, its seam, a stalk; `shake` rad */
function podShape(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, shake: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(shake);
  const im = pic(PIECES.pod);
  if (im) {
    // (the painted pod on its twig, its middle at (x, y), its height the inventory's scaled with r against the stand-in's)
    const h = POD_H * (r / POD_DRAW), w = (h * im.width) / im.height;
    ctx.drawImage(im, -w / 2, -h / 2, w, h);
    ctx.restore();
    return;
  }
  const w = r * 0.95, h = r * 1.9;
  ctx.fillStyle = '#b08a46';
  ctx.strokeStyle = '#2a1d0b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(0, 0, w, h, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // its seam, and a pale split showing the fluff inside (a ripe pod)
  ctx.strokeStyle = '#5a4119';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -h * 0.85);
  ctx.lineTo(0, h * 0.85);
  ctx.stroke();
  ctx.fillStyle = '#faf8ee';
  ctx.beginPath();
  ctx.ellipse(w * 0.32, h * 0.1, w * 0.22, h * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();
  // the stalk up to the bough
  ctx.strokeStyle = '#3e2c12';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, -h);
  ctx.lineTo(0, -h - 10);
  ctx.stroke();
  ctx.restore();
}

/** a fluff tuft: the painted silk tuft (w14-fluff), `r` its half-height-ish size; a white puff stand-in only while it loads */
function fluff(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, a: number, turn = 0, flip = false) {
  // (no colour string built per tuft: fixed fills and the alpha, PERFORMANCE-RULES §3.1)
  ctx.globalAlpha = Math.max(0, Math.min(1, a));
  // (painted: a silk tuft cut from ART's pod-burst plume (w14-fluff), never a code-drawn circle: Matt 11-13, R-165.213, "a column of
  //  white bubbles" down the fig vine. The circles below draw only while the picture loads)
  const im = pic(PIECES.fluff);
  if (im) {
    const h = r * 3, w = (h * im.width) / im.height;
    // (each tuft its own turn and side, so no two read as one stamp: the lead's still review 11-13 6:31 PM)
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(turn);
    if (flip) ctx.scale(-1, 1);
    ctx.drawImage(im, -w / 2, -h / 2, w, h);
    ctx.restore();
    ctx.globalAlpha = 1;
    return;
  }
  ctx.fillStyle = '#8f8b7e';
  ctx.beginPath();
  ctx.arc(x, y + 1, r + 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fffdf4';
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

/** the tell's loose tufts: [phase, size, pace (falls a second), spin (rad/s), sway (rad/s)], each its own (four, never a column) */
const TUFTS: ReadonlyArray<readonly [number, number, number, number, number]> = [
  [0.0, 1.2, 0.42, 0.7, 1.9],
  [0.29, 0.75, 0.55, -1.3, 2.6],
  [0.53, 1.0, 0.37, 1.8, 1.4],
  [0.8, 0.85, 0.5, -0.5, 2.2],
];

/** the drawn pod's size (px across its widest, half): 1.5x the hit radius (podfall.ts POD.radius 14) */
const POD_DRAW = 21;

/**
 * A falling pod at its phase (podfall.ts podAt): hanging under the bough (idle), shaking with its fluff trickling down the column (the
 * tell: a stream of tufts that reaches further down the longer it runs, so on a short sideways view he sees fluff falling past him on
 * his own column), falling with fluff streaming off it, then a white burst on the wood (stand-in, code-drawn).
 */
export function drawPod(ctx: CanvasRenderingContext2D, p: PodColumn, s: PodState, t: number) {
  const r = POD_DRAW;
  // (its bottom hangs at the column's top, where the fall starts: podfall.ts rockAt's y is the pod's bottom)
  const hangY = p.top - r * 1.9;
  if (s.phase === 'idle') {
    // (a new pod swells in over the first part of the beat)
    const g = Math.min(1, s.u * 4);
    ctx.globalAlpha = g;
    podShape(ctx, p.x, hangY, r * (0.6 + 0.4 * g), 0);
    ctx.globalAlpha = 1;
    return;
  }
  if (s.phase === 'warn') {
    // MOCK FIX-14 (code-drawn stand-in): the vine the pod hangs on glows amber to red and shivers for the whole tell, dust sifting down it
    {
      const u = s.u;
      const pulse = 0.5 + 0.5 * Math.sin(t * (8 + 10 * u));
      const top = p.top - 110;
      ctx.save();
      ctx.lineCap = 'round';
      const wob = Math.sin(t * 34) * (1.5 + 3 * u);
      ctx.globalAlpha = 0.28 + 0.35 * pulse;
      ctx.strokeStyle = u < 0.5 ? '#ffb02e' : '#ff5a1f';
      ctx.lineWidth = 16;
      ctx.beginPath();
      ctx.moveTo(p.x, top);
      ctx.quadraticCurveTo(p.x + wob * 2, (top + p.land) / 2, p.x, p.land);
      ctx.stroke();
      ctx.globalAlpha = 0.55 + 0.3 * pulse;
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#fff0b0';
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#6b4a2b';
      for (let i = 0; i < 9; i++) {
        const f = (t * (0.6 + (i % 3) * 0.17) + i * 0.13) % 1;
        ctx.globalAlpha = 0.8 * (1 - f);
        ctx.fillRect(p.x - 10 + ((i * 37) % 20) + Math.sin(t * 5 + i) * 4, top + 8 + f * (p.land - top) * Math.min(1, 0.3 + u), 3, 3);
      }
      ctx.restore();
    }
    // the trickle: a stream of tufts drifting down the column from the pod, reaching further each moment of the tell (at its start a
    // third of the way, by its end the whole column), so on a phone he sees fluff falling past him on his own column before the drop
    // (a few loose tufts, never a column: each its own size, pace, turn and drift, fading in under the pod and out as it falls)
    const reach = (p.land - p.top) * Math.min(1, 0.35 + s.u * 0.9);
    for (let i = 0; i < TUFTS.length; i++) {
      const [phase, size, pace, spin, sway] = TUFTS[i];
      const f = (t * pace + phase) % 1;
      const y = p.top + 6 + f * reach;
      const x = p.x + Math.sin(t * sway + i * 2.3) * (6 + 16 * f);
      const a = Math.min(1, f * 6) * (1 - f * f);
      fluff(ctx, x, y, 9 * size, a, spin * (t + i * 1.9), i % 2 === 1);
    }
    podShape(ctx, p.x, hangY, r, Math.sin(t * 38) * 0.14 * (0.4 + s.u));
    return;
  }
  if (s.phase === 'gone') return;
  if (s.phase === 'fall') {
    const y = s.y - r * 1.9;
    for (let i = 0; i < 3; i++) {
      const [, size, , spin] = TUFTS[i];
      fluff(ctx, p.x + (i - 1) * 9 + Math.sin(t * 5 + i) * 3, y - r * 1.9 - 8 - i * 16, 5 * size, 0.85 - i * 0.25, spin * t, i === 1);
    }
    podShape(ctx, p.x, y, r, 0);
    return;
  }
  // the burst: the painted pod burst open on the wood, silk spilling, fading; and a puff of fluff thinning out
  const bim = pic(PIECES.burst);
  if (bim) {
    const w = (BURST_H * bim.width) / bim.height;
    ctx.globalAlpha = Math.max(0, 1 - s.u * 0.8);
    ctx.drawImage(bim, p.x - w / 2, p.land - BURST_H, w, BURST_H);
    ctx.globalAlpha = 1;
  }
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const d = 8 + s.u * 30;
    fluff(ctx, p.x + Math.cos(a) * d, p.land - 10 + Math.sin(a) * d * 0.5 - s.u * 12, 5 + ((i * 7) % 5) * 0.8, 0.95 * (1 - s.u), a + s.u * (i % 2 ? 1.5 : -1.5), i % 2 === 0);
  }
}

/**
 * A shut gate's bough (stand-in): the bough's own length, tilted down at its `far` end by `sag` px under the weight of its fruit, with
 * bracket-fungus shelves. Drawn only while it sags; once open the stage's painted ground draws it, level.
 */
export function drawGate(ctx: CanvasRenderingContext2D, b: Pick<Platform, 'x' | 'y' | 'width' | 'height'>, far: -1 | 1, sag: number) {
  const pivotX = far > 0 ? b.x : b.x + b.width;
  const ang = Math.atan2(sag, b.width) * far;
  const thick = Math.max(16, Math.min(26, b.height || 22));
  ctx.save();
  ctx.translate(pivotX, b.y);
  ctx.rotate(ang);
  const x0 = far > 0 ? 0 : -b.width, w = b.width;
  const im = pic(PIECES.bough);
  if (im) {
    // (the painted rough bough, its walk line on the bough's top, its walkable span over the bough's width, sagging with it)
    const k = w / (BOUGH.x1 - BOUGH.x0);
    ctx.drawImage(im, x0 - BOUGH.x0 * k, -BOUGH.walkY * k, BOUGH.w * k, BOUGH.h * k);
    ctx.restore();
    return;
  }
  ctx.fillStyle = '#5a4026';
  ctx.beginPath();
  ctx.roundRect(x0, 0, w, thick, thick / 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 230, 190, 0.18)';
  ctx.fillRect(x0 + 6, 3, w - 12, 4);
  ctx.fillStyle = '#c9a25a';
  for (let i = 1; i <= 3; i++) {
    const fx = x0 + (w * i) / 4;
    ctx.beginPath();
    ctx.ellipse(fx, thick + 2, 12, 5, 0, 0, Math.PI);
    ctx.fill();
  }
  ctx.restore();
}

/** the bramble's picture (522 x 203, its stems' foot about 92% down) and how tall it stands on a shut bough (a share of his height) */
const THORNS = { w: 522, h: 203, foot: 0.92, tall: 1.25 } as const;

/** how a shut gate's thorn tangle stands now (fieldPlay.ts thornsOf) */
export interface ThornState {
  /** how much of it is still there (1 every fig on; less a notch for each fig freed; the pull-back runs 0 to 1 after the last) */
  hold: number;
  /** 0..1 the most-pushed fig's way up its vine: the tangle strains up as he pushes */
  strain: number;
  /** 0..1 the settle after a fig locks in (a quick shudder down) */
  settle: number;
  /** 0..1 the pull-back once the last fig is in: the tangle draws back off the bough to its two ends and is gone */
  pull: number;
}

/**
 * A shut gate's thorn tangle (Matt, R-165.212: "put something over the platform... that shows it is locked"; World 1 has no made things):
 * 1-2's painted bramble lying along the shut bough, over the way up, tilted with its sag. It strains as a fig is pushed, shudders down a
 * notch as each fig locks in, and on the last it pulls back off the bough to its ends. Only its motion is code (STAGE-RULES §4).
 */
export function drawGateThorns(ctx: CanvasRenderingContext2D, b: Pick<Platform, 'x' | 'y' | 'width'>, far: -1 | 1, sag: number, s: ThornState, t: number) {
  if (s.pull >= 1 || s.hold <= 0) return;
  const im = pic(PIECES.thorns);
  if (!im) return;
  const pivotX = far > 0 ? b.x : b.x + b.width;
  const ang = Math.atan2(sag, b.width) * far;
  const h0 = THORNS.tall * POKEY_H;
  const pw = (h0 * THORNS.w) / THORNS.h;
  const span = b.width * 0.94;
  const n = Math.max(1, Math.ceil(span / (pw * 0.8)));
  const step = n > 1 ? (span - pw) / (n - 1) : 0;
  const ease = s.pull * s.pull * (3 - 2 * s.pull);
  const tall = h0 * (0.55 + 0.45 * s.hold) * (1 - 0.85 * ease) * (1 - 0.12 * s.settle) * (1 + 0.1 * s.strain);
  const shake = s.strain * 1.6 * Math.sin(t * 47) + s.settle * 2.5 * Math.sin(t * 61);
  ctx.save();
  ctx.translate(pivotX, b.y);
  ctx.rotate(ang);
  const x0 = (far > 0 ? 0 : -b.width) + (b.width - span) / 2;
  const mid = x0 + span / 2;
  ctx.globalAlpha = 1 - ease;
  for (let i = 0; i < n; i++) {
    const cx = n > 1 ? x0 + pw / 2 + step * i : mid;
    // (the pull-back: each clump draws away from the middle, to its own end of the bough)
    const out = (cx < mid ? -1 : 1) * ease * span * 0.35;
    const flip = i % 2 ? -1 : 1;
    ctx.save();
    ctx.translate(cx + out + (i % 2 ? shake : -shake), 0);
    ctx.scale(flip, 1);
    ctx.drawImage(im, -pw / 2, -tall * THORNS.foot, pw, tall);
    ctx.restore();
  }
  ctx.restore();
}

/** MOCK FIX-14: one fig's tie on a gate's thatch: where it is, how hard its fig is pushing (0..1), and how long since it snapped (-1 not) */
export interface TieState { x: number; strain: number; age: number }

/**
 * MOCK FIX-14 (code-drawn stand-in; the real pieces are painted, named for the HF batch): a thatch of woven leaves lashed over the shut
 * bough, one vine tie per fig at that fig's vine. As he pushes a fig the tie strains (stretches up, pales, shivers, frays); at full it
 * SNAPS (its ends whip apart, a burst of fibres, a white crack), that end of the thatch kicks up; the last snap throws the thatch off.
 */
export function drawGateThatch(ctx: CanvasRenderingContext2D, b: Pick<Platform, 'x' | 'y' | 'width'>, far: -1 | 1, sag: number, ties: readonly TieState[], pull: number, t: number) {
  if (pull >= 1) return;
  const pivotX = far > 0 ? b.x : b.x + b.width;
  const ang = Math.atan2(sag, b.width) * far;
  const ease = pull * pull * (3 - 2 * pull);
  ctx.save();
  ctx.translate(pivotX, b.y);
  ctx.rotate(ang);
  const x0 = far > 0 ? 0 : -b.width;
  const toLocal = (wx: number) => wx - pivotX;
  // the thatch: thrown up and away on the last snap
  ctx.save();
  ctx.translate(0, -ease * 140);
  ctx.rotate(ease * 0.5 * far);
  ctx.globalAlpha = 1 - ease;
  const H = 20;
  // overlapping leaves in two rows, each its own turn and shade, a dark midrib: a thatch laid over the bough, not a tube
  const shades = ['#56702a', '#6f8a2e', '#88a03c', '#4a6324'];
  for (let row = 0; row < 2; row++) {
    for (let x = x0 + 10 + row * 7, i = 0; x < x0 + b.width - 8; x += 13, i++) {
      const turn = ((i * 7 + row * 3) % 5 - 2) * 0.18 + (row ? 0.35 : -0.35);
      ctx.save();
      ctx.translate(x, -H * (row ? 0.35 : 0.7));
      ctx.rotate(turn);
      ctx.fillStyle = shades[(i + row * 2) % shades.length];
      ctx.strokeStyle = '#26330e';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, 15, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = 'rgba(28,40,10,0.7)';
      ctx.beginPath();
      ctx.moveTo(-13, 0);
      ctx.lineTo(13, 0);
      ctx.stroke();
      ctx.restore();
    }
  }
  ctx.restore();
  // the ties
  for (const tie of ties) {
    const lx = toLocal(tie.x);
    if (tie.age < 0) {
      const s = tie.strain;
      const shiver = s > 0.5 ? Math.sin(t * 60) * 2.5 * (s - 0.5) * 2 : 0;
      const lift = s * 14;
      const r = Math.round(96 + 150 * s), g = Math.round(58 + 70 * s), bl = Math.round(24 + 50 * s);
      ctx.strokeStyle = `rgb(${r},${g},${bl})`;
      ctx.lineCap = 'round';
      // (a pale edge first so the tie reads on the dark bough and the green thatch)
      ctx.save();
      ctx.strokeStyle = 'rgba(255,240,200,0.85)';
      ctx.lineWidth = 13 - 4 * s;
      ctx.beginPath();
      ctx.moveTo(lx - 12 + shiver, 28);
      ctx.quadraticCurveTo(lx - 16 + shiver, -H - 10 - lift, lx + shiver, -H - 6 - lift);
      ctx.quadraticCurveTo(lx + 16 + shiver, -H - 10 - lift, lx + 12 + shiver, 28);
      ctx.stroke();
      ctx.restore();
      ctx.lineWidth = 9 - 4 * s;
      // a loop over the thatch and under the bough, bulging up as the fig pushes
      ctx.beginPath();
      ctx.moveTo(lx - 12 + shiver, 28);
      ctx.quadraticCurveTo(lx - 16 + shiver, -H - 10 - lift, lx + shiver, -H - 6 - lift);
      ctx.quadraticCurveTo(lx + 16 + shiver, -H - 10 - lift, lx + 12 + shiver, 28);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(30,40,10,0.6)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = s > 0.6 ? '#f0c060' : '#4a2c12';
      ctx.beginPath();
      ctx.arc(lx + shiver, -H - 6 - lift, 6, 0, Math.PI * 2);
      ctx.fill();
      // fraying fibres near the break
      if (s > 0.6) {
        ctx.strokeStyle = '#f2e6b8';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI + Math.sin(t * 20 + i) * 0.3;
          const L = 4 + 8 * (s - 0.6) / 0.4;
          ctx.beginPath();
          ctx.moveTo(lx + shiver, -H - 6 - lift);
          ctx.lineTo(lx + shiver + Math.cos(a) * L, -H - 6 - lift - Math.sin(a) * L);
          ctx.stroke();
        }
      }
      continue;
    }
    // snapped: the two ends whip apart and fall, a crack of light, fibres
    const a = tie.age;
    if (a > 1.2) continue;
    const k = Math.min(1, a / 0.35);
    ctx.globalAlpha = 1 - Math.max(0, (a - 0.6) / 0.6);
    ctx.strokeStyle = '#d9c88e';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    for (const sd of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(lx + sd * 12, 28);
      ctx.quadraticCurveTo(lx + sd * (16 + 30 * k), -H - 10 - 30 * k, lx + sd * (8 + 46 * k), -H + 10 + 60 * k * k);
      ctx.stroke();
    }
    if (a < 0.3) {
      const R = 10 + 70 * (a / 0.3);
      ctx.globalAlpha = 1 - a / 0.3;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      for (let i = 0; i < 10; i++) {
        const an = (i / 10) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(lx + Math.cos(an) * R * 0.45, -H - 6 + Math.sin(an) * R * 0.45);
        ctx.lineTo(lx + Math.cos(an) * R, -H - 6 + Math.sin(an) * R);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}
