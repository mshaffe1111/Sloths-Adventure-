/**
 * Where Dot goes for a line (the new look, Matt's pick C, 2026-10-26): she perches on the scenery near the thing she is teaching, with a
 * glowing ring and an arrow on it, and her bubble sits beside her, on screen, clear of the HUD, the thumbs, the animals and Pokey. When no
 * perch is in view, or the lesson is the controls themselves, she hovers beside Pokey on the empty side behind him (option A).
 *
 * Pure geometry: world points in, world or screen points out. The screen's safe area comes from the HUD (setGuideSafeArea), with a
 * fallback until the new HUD registers its own: the band under the top HUD, and never the bottom corners (the thumbs).
 */
import type { TopicId } from './dotGuide.ts';
import { toScreenX, toScreenY, type GuideView } from './dotGuideView.ts';

export interface Rect {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}
export interface SafeArea {
  /** where a bubble may go at all (screen css px) */
  rect: Rect;
  /** parts of it still off limits: the HUD's pieces, the thumb corners */
  keepOut: Rect[];
}

// ───────────────────────────── the screen's safe area ─────────────────────────────

type SafeFn = (w: number, h: number) => SafeArea;
let safeFn: SafeFn | null = null;
/** the HUD registers where its pieces are (hearts, goal, Menu, boss bar), so Dot keeps clear of them */
export function setGuideSafeArea(fn: SafeFn | null): void {
  safeFn = fn;
}

/** the fallback: a 16 px side gutter, the band under the top HUD, and the thumb zones left empty */
export function fallbackSafeArea(w: number, h: number): SafeArea {
  const land = w > h;
  const short = land && h < 430;
  const top = short ? 58 : land ? 68 : 84;
  const rect = { x0: 16, y0: top, x1: w - 16, y1: h - 10 };
  const keepOut: Rect[] = land
    ? [
        { x0: 0, y0: h * 0.56, x1: w * 0.3, y1: h },
        { x0: w * 0.7, y0: h * 0.56, x1: w, y1: h },
      ]
    : [{ x0: 0, y0: h * 0.76, x1: w, y1: h }];
  return { rect, keepOut };
}

export function guideSafeArea(w: number, h: number): SafeArea {
  try {
    if (safeFn) return safeFn(w, h);
  } catch {
    /* the HUD's helper failed: use the fallback */
  }
  return fallbackSafeArea(w, h);
}

/** the widest a bubble may be: upright, the screen less 32 px and no more than 340; sideways, 44% of the screen and no more than 420 */
export function bubbleMaxW(w: number, h: number): number {
  return h > w ? Math.min(w - 32, 340) : Math.min(Math.round(w * 0.44), 420);
}

// ───────────────────────────── what to point at ─────────────────────────────

export interface Target {
  x: number;
  y: number;
  /** ring radius, world units */
  r: number;
}

const inView = (v: GuideView, x: number, y: number, m = 0) =>
  x >= v.camX - m && x <= v.camX + v.cssW / v.zoom + m && y >= v.camY - m && y <= v.camY + v.cssH / v.zoom + m;

/**
 * The thing a line is about, near Pokey and on screen: the nearest of its kind ahead of him (or anywhere in view when nothing is ahead).
 * Returns null when there is nothing to point at (a controls lesson, a line about nothing in particular).
 */
export function findTarget(topic: TopicId | undefined, v: GuideView): Target | null {
  if (!topic || topic === 'controls') return null;
  const cx = v.px + v.pw / 2;
  const f = v.facing;
  let best: Target | null = null;
  let bestD = Infinity;
  const consider = (x: number, y: number, r: number) => {
    if (!inView(v, x, y, -8)) return;
    const ahead = (x - cx) * f;
    // ahead counts more than behind
    const d = Math.hypot(x - cx, (y - v.py) * 1.3) + (ahead < -30 ? 400 : 0);
    if (d < bestD) {
      bestD = d;
      best = { x, y, r };
    }
  };
  switch (topic) {
    case 'vine':
      for (const vi of v.vines) if (vi.vineType !== 'tree_climb') consider(vi.x, Math.min(vi.bottomY - 10, v.camY + v.cssH / v.zoom - 30), 30);
      break;
    case 'trunk':
      for (const vi of v.vines) if (vi.vineType === 'tree_climb') consider(vi.x, Math.max(vi.topY + 40, Math.min(vi.bottomY - 40, v.py - 70)), 34);
      break;
    case 'rope':
      for (const r of v.ropes) {
        consider(r.x0 + 20, r.y, 26);
        consider(r.x1 - 20, r.y, 26);
      }
      break;
    case 'log':
      for (const p of v.platforms) if (p.push) consider(p.x + p.width / 2, p.y + p.height / 2, Math.max(30, p.width / 2));
      break;
    case 'foe':
      for (const e of v.enemies) if (!e.defeated && e.type !== 'boss') consider(e.x, e.y - (e.height ?? 40) / 2, 32);
      break;
    case 'mushroom':
    case 'crumble':
    case 'moving': {
      const type = topic === 'mushroom' ? 'bouncy' : topic === 'crumble' ? 'fragile' : 'moving';
      for (const p of v.platforms) if (p.type === type && !p.broken) consider(p.x + p.width / 2, p.y, Math.max(28, Math.min(60, p.width / 2)));
      break;
    }
    case 'petal':
      for (const c of v.collectibles) if (!c.collected && !c.hidden && (c.type === 'flower' || c.type === 'fruit' || c.type === 'leaf')) consider(c.x, c.y, 24);
      break;
    case 'cage':
      for (const c of v.collectibles) if (!c.collected && c.type === 'cage') consider(c.x, c.y, 34);
      break;
    case 'heart':
      for (const c of v.collectibles) if (!c.collected && (c.type === 'heart' || c.type === 'super_heart')) consider(c.x, c.y, 24);
      break;
    case 'power':
      for (const c of v.collectibles) if (!c.collected && c.type.startsWith('powerup')) consider(c.x, c.y, 24);
      break;
    case 'relic':
      for (const c of v.collectibles) if (!c.collected && c.type === 'relic') consider(c.x, c.y, 24);
      break;
    case 'exit':
      for (const c of v.collectibles) if (c.type === 'exit_totem') consider(c.x, c.y - 40, 44);
      break;
    case 'bush':
    case 'fern':
      for (const b of v.bushes) if (topic === 'bush' ? b.kind !== 'fern' && b.kind !== 'grotto' : b.kind === 'fern' || b.kind === 'grotto') consider(b.x, b.y - 30, Math.max(30, Math.min(56, b.w / 2)));
      break;
    case 'flag':
      // (the flag is already behind him when its line comes: nothing to point at)
      break;
    case 'puzzle':
      for (const k of v.kit) consider(k.x, k.y, k.r);
      break;
    case 'cocoon':
    case 'orchid':
    case 'seamstress':
      for (const w of v.w5) if (w.kind === topic && !w.done) consider(w.x, w.y, topic === 'cocoon' ? 36 : topic === 'seamstress' ? 56 : 40);
      break;
    case 'gap':
    case 'ledge':
    case 'water': {
      // the next edge ahead at about his height (a gap), or the next platform top above him (a ledge)
      for (const p of v.platforms) {
        if (p.broken || p.type === 'drift') continue;
        if (topic === 'ledge') {
          if (p.y < v.py - 20 && p.y > v.py - 260) consider(f > 0 ? p.x + 14 : p.x + p.width - 14, p.y, 28);
          continue;
        }
        const edge = f > 0 ? p.x + p.width : p.x;
        if (Math.abs(p.y - v.py) > 120 || (edge - cx) * f < 20) continue;
        // a real gap: no platform starting just past this edge at that height
        let open = true;
        for (const q of v.platforms) {
          if (q === p || q.broken) continue;
          const near = f > 0 ? q.x - edge : edge - (q.x + q.width);
          if (near >= -4 && near < 50 && Math.abs(q.y - p.y) < 40) {
            open = false;
            break;
          }
        }
        if (open) consider(edge + f * 34, p.y + 6, 34);
      }
      break;
    }
  }
  return best;
}

// ───────────────────────────── where she perches ─────────────────────────────

export interface Perch {
  /** her feet, world units */
  x: number;
  y: number;
  /** hand-placed for this stage */
  placed?: boolean;
}

/** hand-placed perches per stage ('1-6': [{ x, y }]), for spots the automatic choice gets wrong */
const PERCH_OVERRIDES: Record<string, Perch[]> = {};
export function addPerchOverride(stageId: string, p: Perch): void {
  (PERCH_OVERRIDES[stageId] ??= []).push({ ...p, placed: true });
}
export function perchOverrides(stageId: string): readonly Perch[] {
  return PERCH_OVERRIDES[stageId] ?? [];
}

/** how far from the thing she points at she likes to sit (screen px): close enough to be about it, far enough to leave it clear */
export const PERCH_NEAR = { min: 60, best: 150, max: 320 } as const;

function inRects(x: number, y: number, rs: readonly Rect[], m = 0): boolean {
  for (const r of rs) if (x >= r.x0 - m && x <= r.x1 + m && y >= r.y0 - m && y <= r.y1 + m) return true;
  return false;
}

/**
 * The best perch near the target: a platform top or a vine's crown on screen, near the target, off Pokey's path (the strip ahead of him at
 * his height), away from animals and hazards, and with room above for her bubble. Null when there is none (she hovers instead).
 */
export function choosePerch(v: GuideView, t: Target, safe: SafeArea): Perch | null {
  const z = v.zoom;
  const tx = toScreenX(v, t.x);
  const ty = toScreenY(v, t.y);
  const pcx = toScreenX(v, v.px + v.pw / 2);
  const pfy = toScreenY(v, v.py);
  const f = v.facing;
  // (a tall upright screen has room for a longer arrow: the crown of a vine is well above where Pokey grabs it)
  const maxD = Math.max(PERCH_NEAR.max, 0.5 * Math.max(v.cssW, v.cssH));
  const ok = (x: number, y: number): number => {
    const sx = toScreenX(v, x);
    const sy = toScreenY(v, y);
    const r = safe.rect;
    // on screen with room for her (and some of her bubble above)
    if (sx < r.x0 + 24 || sx > r.x1 - 24 || sy < r.y0 + 70 || sy > r.y1 - 6) return Infinity;
    if (inRects(sx, sy - 20, safe.keepOut, 6)) return Infinity;
    // not on Pokey, nor on the strip ahead of him at his height (where he is about to run)
    if (Math.abs(sx - pcx) < 70 && Math.abs(sy - pfy) < 110) return Infinity;
    const ahead = (sx - pcx) * f;
    if (ahead > 0 && ahead < Math.max(260, (Math.abs(tx - pcx) + 60)) && Math.abs(sy - pfy) < 70) return Infinity;
    // not on the target itself
    const d = Math.hypot(sx - tx, sy - ty);
    if (d < Math.max(PERCH_NEAR.min, t.r * z + 30) || d > maxD) return Infinity;
    // clear of animals and hazards
    for (const e of v.enemies) if (!e.defeated && Math.hypot(e.x - x, e.y - y) < 110) return Infinity;
    for (const h of v.hazards) if (Math.hypot(h.x - x, h.y - y) < 140) return Infinity;
    // closer to the best distance is better; above the target a little better (the arrow points down at it, as in the mock-up)
    return Math.abs(d - PERCH_NEAR.best) + (sy < ty ? -25 : 0);
  };
  for (const p of perchOverrides(v.stageId)) if (ok(p.x, p.y) < Infinity) return p;
  let best: Perch | null = null;
  let bestS = Infinity;
  const tryAt = (x: number, y: number) => {
    const s = ok(x, y);
    if (s < bestS) {
      bestS = s;
      best = { x, y };
    }
  };
  for (const p of v.platforms) {
    if (p.broken || p.type === 'moving' || p.type === 'drift' || p.push || p.chase || p.width < 40) continue;
    const a = p.x + 16;
    const b = p.x + p.width - 16;
    tryAt(Math.min(b, Math.max(a, t.x - 110)), p.y);
    tryAt(Math.min(b, Math.max(a, t.x + 110)), p.y);
    tryAt(a, p.y);
    tryAt(b, p.y);
  }
  // the crown of a vine (where it hangs from), as in the mock-up
  for (const vi of v.vines) tryAt(vi.x, vi.topY);
  return best;
}

// ───────────────────────────── where her bubble goes ─────────────────────────────

export type TailSide = 'b' | 't' | 'l' | 'r';
export interface BubblePlace {
  x: number;
  y: number;
  /** the tail: which edge of the bubble, and how far along it (px), pointing at Dot */
  tail: TailSide;
  at: number;
  /** what it still covers (0: nothing it must not) */
  cost?: number;
}

/** how far her name tag ("Dot") stands up above the bubble's top edge (dotGuide.css .dg-tag): it covers what is under it too */
export const BUBBLE_TAG_H = 14;

function overlap(a: Rect, b: Rect): number {
  const w = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0);
  const h = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0);
  return w > 0 && h > 0 ? w * h : 0;
}

/**
 * Put a bubble of size w x h beside a speaker at (sx, sy) (screen px, her middle): above her first, then to either side, then below. Each
 * spot is pushed inside the safe rect; the first that covers nothing it must not (the HUD, the thumbs, Pokey, the animals) wins, or else
 * the one that covers least. `order` sets which sides to try first. When every side of her covers something, it also tries just above
 * and just below each `hard` box (Pokey first of all) and the top of the safe rect, a little further from her (QA v194, 5-1 upright:
 * beside her it sat on Meeca's carving, or on Pokey's feet, with the open ground under him empty). The name tag above it counts.
 */
export function placeBubble(
  sx: number,
  sy: number,
  w: number,
  h: number,
  safe: SafeArea,
  avoid: readonly Rect[],
  order: readonly ('above' | 'below' | 'left' | 'right')[] = ['above', 'left', 'right', 'below'],
  /** half her size: the bubble keeps this far off her middle */
  me = 26,
  /** what it must cover least of all: Pokey himself */
  hard: readonly Rect[] = [],
  /** half her height (she is wider than tall) */
  meH = me,
  /**
   * Pokey's own box: the one thing it may never cover while anywhere else on the screen is free of him. Every spot that covers him
   * loses to every spot that does not (QA v200 upright: "Tap to punch the spider" in 5-3 and "Still stuck?" in 5-4 sat on him, because
   * a spot far from her cost more than a corner of him); and the spots beside him, left and right at his height, are tried too
   */
  body: Rect | null = null,
): BubblePlace {
  const r = safe.rect;
  const gap = Math.max(34, me + 12);
  const tag = BUBBLE_TAG_H;
  let best: BubblePlace | null = null;
  let bestCost = Infinity;
  type Side = 'above' | 'below' | 'left' | 'right';
  // (the sides of her, then the spots clear of each hard box: [side, y, x] with the bubble centred on her unless x is set)
  const spots: [Side, number | null, number | null][] = order.map((s) => [s, null, null]);
  // (his painting reaches past his body box, his feet most of all: more room under a hard box than over it)
  for (const k of hard) spots.push(['above', k.y0 - 16 - h, null], ['below', k.y1 + 24 + tag, null]);
  spots.push(['above', r.y0, null]);
  if (body) {
    const my = (body.y0 + body.y1) / 2 - h / 2;
    spots.push(['left', my, body.x0 - 10 - w], ['right', my, body.x1 + 10], ['below', body.y1 + 24 + tag, body.x0 - 10 - w], ['below', body.y1 + 24 + tag, body.x1 + 10]);
    spots.push(['below', r.y1 - h, null], ['above', body.y0 - 16 - h, body.x0 - 10 - w], ['above', body.y0 - 16 - h, body.x1 + 10]);
  }
  for (let i = 0; i < spots.length; i++) {
    const [side, fixY, fixX] = spots[i];
    let x = fixX ?? (fixY !== null ? sx - w / 2 : side === 'left' ? sx - gap - w : side === 'right' ? sx + gap : sx - w / 2);
    let y = fixY ?? (side === 'above' ? sy - gap - h : side === 'below' ? sy + gap + tag : sy - h / 2);
    x = Math.max(r.x0, Math.min(r.x1 - w, x));
    y = Math.max(r.y0, Math.min(r.y1 - h, y));
    const box = { x0: x, y0: y - tag, x1: x + w, y1: y + h };
    let cost = 0;
    // (the thumb corners and the HUD count most: nothing to read under a thumb, nothing over the hearts)
    for (const k of safe.keepOut) cost += overlap(box, k) * 3;
    for (const a of avoid) cost += overlap(box, a) * 2;
    for (const a of hard) cost += overlap(box, a) * 12;
    // (on Pokey: worse than anything else it could do)
    const onHim = body ? overlap(box, body) : 0;
    if (onHim > 0) cost += 1e8 + onHim * 100;
    // she must not end up under her own bubble (it was pushed over her by the edge)
    cost += overlap(box, { x0: sx - me, y0: sy - meH, x1: sx + me, y1: sy + meH }) * 20;
    // a bubble far from her reads as someone else's
    const far = Math.max(0, Math.hypot(Math.max(box.x0 - sx, 0, sx - box.x1), Math.max(box.y0 - sy, 0, sy - box.y1)) - gap - tag - 10);
    cost += far * far * 4;
    // (a spot clear of a hard box may land on her far side of it: the tail points the way she is)
    const vert = fixX !== null ? (x + w < sx ? 'left' : x > sx ? 'right' : y + h / 2 < sy ? 'above' : 'below') : fixY !== null ? (y + h / 2 < sy ? 'above' : 'below') : side;
    const tail: TailSide = vert === 'above' ? 'b' : vert === 'below' ? 't' : vert === 'left' ? 'r' : 'l';
    const at = tail === 'b' || tail === 't' ? Math.max(18, Math.min(w - 30, sx - x - 8)) : Math.max(14, Math.min(h - 28, sy - y - 8));
    if (cost < bestCost) {
      bestCost = cost;
      best = { x, y, tail, at, cost };
      if (cost === 0) break;
    }
  }
  return best!;
}

/** Pokey's box on screen, grown by `m` */
export function pokeyRect(v: GuideView, m = 24): Rect {
  const x = toScreenX(v, v.px);
  const y = toScreenY(v, v.py - v.ph);
  return { x0: x - m, y0: y - m, x1: x + v.pw * v.zoom + m, y1: y + v.ph * v.zoom + m };
}

/** the strip ahead of him (about a quarter of the screen), where the danger comes from */
export function aheadRect(v: GuideView): Rect {
  const p = pokeyRect(v, 0);
  const w = v.cssW * 0.25;
  return v.facing > 0 ? { x0: p.x1, y0: p.y0 - 40, x1: p.x1 + w, y1: p.y1 + 10 } : { x0: p.x0 - w, y0: p.y0 - 40, x1: p.x0, y1: p.y1 + 10 };
}

/** animals and hazards on screen, as boxes to keep the bubble off */
export function dangerRects(v: GuideView, out: Rect[]): Rect[] {
  out.length = 0;
  for (const e of v.enemies) {
    if (e.defeated) continue;
    const x = toScreenX(v, e.x);
    const y = toScreenY(v, e.y);
    if (x < -60 || x > v.cssW + 60 || y < -60 || y > v.cssH + 60) continue;
    const hw = ((e.width ?? 60) / 2 + 16) * v.zoom;
    const hh = ((e.height ?? 50) + 16) * v.zoom;
    out.push({ x0: x - hw, y0: y - hh, x1: x + hw, y1: y + 12 });
  }
  for (const h of v.hazards) {
    const x = toScreenX(v, h.x);
    const y = toScreenY(v, h.y);
    out.push({ x0: x - 40, y0: y - 40, x1: x + 40, y1: y + 40 });
  }
  return out;
}

/** how far in front of him his punch reaches (world px), so she never hovers there */
export const PUNCH_REACH = 90;

/**
 * Where she hovers beside Pokey (screen px, her middle): behind his shoulder, on the side he is not facing. Never on his body or in
 * front of him where his punch goes: with his back to the screen's edge she hovers above his head instead, a little behind. Never on a
 * score pop-up ("+100 FLOWER!"): she rises above it (QA, v189: at the first snake in 1-3 she hovered on him, in front of his punch, over
 * the pop-up).
 */
export function hoverSpot(v: GuideView): { x: number; y: number } {
  const p = pokeyRect(v, 0);
  const cx = (p.x0 + p.x1) / 2;
  const half = (p.x1 - p.x0) / 2;
  const top = guideSafeArea(v.cssW, v.cssH).rect.y0 + 20;
  // (his painting is wider than his body box: keep clear of his arms and his pack; at 52 her wing sat on his back upright, QA 1-7,
  // 2026-10-28)
  const off = half + 64;
  let x = cx - v.facing * off;
  let y = Math.max(top, p.y0 - 14);
  if (x < 28 || x > v.cssW - 28) {
    // his back is to the edge: above his head (clear of his ears and hat), on his back half
    x = Math.max(28, Math.min(v.cssW - 28, cx - v.facing * half * 0.6));
    y = Math.max(top, p.y0 - 62);
  }
  // keep off his body and his punch reach (she is about 26 px either side of her middle)
  const reach = PUNCH_REACH * v.zoom;
  const no = { x0: v.facing > 0 ? p.x0 - 8 : p.x0 - reach, y0: p.y0 - 30, x1: v.facing > 0 ? p.x1 + reach : p.x1 + 8, y1: p.y1 };
  if (x + 26 > no.x0 && x - 26 < no.x1 && y + 20 > no.y0 && y - 20 < no.y1) y = Math.max(top, no.y0 - 24);
  // and off the score pop-ups, which float up from where a pickup was
  for (let i = 0; i < v.popups.length; i++) {
    const q = v.popups[i];
    const sx = toScreenX(v, q.x);
    const sy = toScreenY(v, q.y);
    if (Math.abs(sx - x) < 70 && Math.abs(sy - y) < 44) y = Math.max(top, sy - 48);
  }
  return { x, y };
}

/**
 * The landings ahead of him (screen px): the near part of each platform ahead that he will jump onto, and the air just above it where
 * he lands. Her bubble keeps off them (QA, v189: in 1-3 it covered the mossy block he had to jump to, for 6 s). Not the ground he
 * stands on.
 */
export function landingRects(v: GuideView, out: Rect[]): Rect[] {
  const z = v.zoom;
  const front = v.facing > 0 ? v.px + v.pw : v.px;
  const range = (v.cssW * 0.7) / z;
  for (let i = 0; i < v.platforms.length; i++) {
    const q = v.platforms[i];
    if (q.broken) continue;
    // (the one under his feet)
    if (q.x <= v.px + v.pw && q.x + q.width >= v.px && Math.abs(q.y - v.py) < 8) continue;
    const near = v.facing > 0 ? q.x : q.x + q.width;
    const ahead = (near - front) * v.facing;
    if (ahead < -40 || ahead > range) continue;
    if (q.y > v.py + 160 || q.y < v.py - 320) continue;
    // the near 220 px of it: where he lands
    const a = v.facing > 0 ? Math.max(q.x, front) : Math.max(q.x, Math.min(q.x + q.width, front) - 220);
    const b = Math.min(q.x + q.width, a + 220);
    if (b <= a) continue;
    out.push({ x0: toScreenX(v, a), y0: toScreenY(v, q.y) - 80 * z, x1: toScreenX(v, b), y1: toScreenY(v, q.y) + 14 * z });
  }
  return out;
}

/** a boss's open weak spot on screen, grown by `m` (its NOW! marker sits just above it), or null while it is closed */
export function weakSpotRect(v: GuideView, m = 30): Rect | null {
  if (!v.weakOn) return null;
  const x = toScreenX(v, v.weakX);
  const y = toScreenY(v, v.weakY);
  return { x0: x - m, y0: y - m - 36, x1: x + v.weakW * v.zoom + m, y1: y + v.weakH * v.zoom + m };
}

/** the score pop-ups on screen, as boxes to keep her bubble off */
export function popupRects(v: GuideView, out: Rect[]): Rect[] {
  for (let i = 0; i < v.popups.length; i++) {
    const q = v.popups[i];
    const x = toScreenX(v, q.x);
    const y = toScreenY(v, q.y);
    out.push({ x0: x - 70, y0: y - 60, x1: x + 70, y1: y + 16 });
  }
  return out;
}

/**
 * In a boss fight her bubble keeps out of the arena's middle (QA v189, 1-10 upright: it covered the hanging ledge and the space the
 * boss rears into): a corner band, on the side away from the boss. Upright the top band under the boss bar, else the bottom band above
 * the thumb zones; sideways the top band. Off Pokey, the open weak spot and its NOW!, and the ledges (`hard`). Dot hovers by the bubble's
 * inner corner, off Pokey. Returns the bubble (tail toward her) and her spot.
 */
export function cornerBubble(v: GuideView, w: number, h: number, safe: SafeArea, hard: readonly Rect[]): { bub: BubblePlace; dot: { x: number; y: number } } {
  const r = safe.rect;
  // the boss (or else the biggest animal on screen), or the arena middle
  let bx = Number.isFinite(v.bossX) ? toScreenX(v, v.bossX) : v.cssW / 2;
  let big = Number.isFinite(v.bossX) ? Infinity : 0;
  for (const e of v.enemies) {
    if (e.defeated) continue;
    const s = (e.width ?? 60) * (e.height ?? 50);
    if (s > big) {
      big = s;
      bx = toScreenX(v, e.x);
    }
  }
  const away = bx > v.cssW / 2 ? 'left' : 'right';
  const near = away === 'left' ? 'right' : 'left';
  const port = v.cssH > v.cssW;
  const xs = (side: 'left' | 'right') => (side === 'left' ? r.x0 : r.x1 - w);
  const top = r.y0;
  // (the bottom band: above the thumb zones, which take the bottom quarter upright)
  const bottom = Math.min(r.y1, v.cssH * 0.76) - h - 34;
  const spots: { x: number; y: number; up: boolean }[] = [
    { x: xs(away), y: top, up: false },
    ...(port ? [{ x: xs(away), y: bottom, up: true }] : []),
    { x: xs(near), y: top, up: false },
    ...(port ? [{ x: xs(near), y: bottom, up: true }] : []),
  ];
  const pk = pokeyRect(v, 10);
  let best: { bub: BubblePlace; dot: { x: number; y: number } } | null = null;
  let bestCost = Infinity;
  for (const s of spots) {
    const box = { x0: s.x, y0: s.y, x1: s.x + w, y1: s.y + h };
    let cost = 0;
    for (const k of safe.keepOut) cost += overlap(box, k) * 3;
    for (const k of hard) cost += overlap(box, k) * 12;
    // her spot: under (or over) the bubble's inner corner; if that is on Pokey, the outer corner
    const inner = s.x === r.x0 ? s.x + w - 24 : s.x + 24;
    const outer = s.x === r.x0 ? s.x + 24 : s.x + w - 24;
    const dy = s.up ? s.y - 30 : s.y + h + 30;
    const dbox = (x: number) => ({ x0: x - 28, y0: dy - 22, x1: x + 28, y1: dy + 22 });
    const dx = overlap(dbox(inner), pk) === 0 ? inner : outer;
    cost += overlap(dbox(dx), pk) * 12;
    if (cost < bestCost) {
      bestCost = cost;
      best = { bub: { x: s.x, y: s.y, tail: s.up ? 't' : 'b', at: dx - s.x, cost }, dot: { x: dx, y: dy } };
      if (cost === 0) break;
    }
  }
  return best!;
}

/** which sides to try for a bubble when she hovers beside him: upright above him (toward his back), sideways behind him at head height */
export function hoverOrder(v: GuideView): ('above' | 'below' | 'left' | 'right')[] {
  const back = v.facing > 0 ? 'left' : 'right';
  const front = v.facing > 0 ? 'right' : 'left';
  return v.cssH > v.cssW ? ['above', back, 'below', front] : [back, 'above', 'below', front];
}

// ───────────────────────────── her pose on the perch ─────────────────────────────

export type PerchPoseName = 'perch' | 'pointFwd' | 'pointUp' | 'pointDown' | 'talk' | 'talkSmall';
/** her beak while she says a line: open, half open, closed between words */
const TALK_SEQ: readonly PerchPoseName[] = ['talkSmall', 'talk', 'talkSmall', 'perch', 'talk', 'talkSmall', 'talk', 'perch'];
const TALK_FPS = 8;

/**
 * Which painted pose she sits in (game/dotPerchAtlasData.ts). While a line is up she talks first (about a quarter second a word, at
 * most 2.6 s), then points at the thing it is about: ahead, up or down, from where it is; a move tip that stays up has her say it again
 * every 6 s. With no line up, or nothing to point at once she has said it, she just sits.
 *   since: ms of play the line has been up (-1: no line);  words: its length;  stays: a move tip (it stays until done)
 *   tdx, tdy: from her middle to the target (screen px), tdx null with no target;  now: a clock for the beak (ms)
 */
export function perchPoseFor(since: number, words: number, stays: boolean, tdx: number | null, tdy: number, now: number): PerchPoseName {
  if (since < 0) return 'perch';
  const talkMs = Math.min(2600, 600 + 260 * words);
  const t = stays ? since % 6000 : since;
  if (t < talkMs) return TALK_SEQ[Math.floor((now / 1000) * TALK_FPS) % TALK_SEQ.length];
  if (tdx === null) return 'perch';
  const s = tdy / (Math.hypot(tdx, tdy) || 1);
  return s < -0.55 ? 'pointUp' : s > 0.55 ? 'pointDown' : 'pointFwd';
}
