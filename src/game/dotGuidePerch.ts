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

function overlap(a: Rect, b: Rect): number {
  const w = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0);
  const h = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0);
  return w > 0 && h > 0 ? w * h : 0;
}

/**
 * Put a bubble of size w x h beside a speaker at (sx, sy) (screen px, her middle): above her first, then to either side, then below. Each
 * spot is pushed inside the safe rect; the first that covers nothing it must not (the HUD, the thumbs, Pokey, the animals) wins, or else
 * the one that covers least. `order` sets which sides to try first.
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
): BubblePlace {
  const r = safe.rect;
  const gap = Math.max(34, me + 12);
  let best: BubblePlace | null = null;
  let bestCost = Infinity;
  for (const side of order) {
    let x = side === 'left' ? sx - gap - w : side === 'right' ? sx + gap : sx - w / 2;
    let y = side === 'above' ? sy - gap - h : side === 'below' ? sy + gap : sy - h / 2;
    x = Math.max(r.x0, Math.min(r.x1 - w, x));
    y = Math.max(r.y0, Math.min(r.y1 - h, y));
    const box = { x0: x, y0: y, x1: x + w, y1: y + h };
    let cost = 0;
    // (the thumb corners and the HUD count most: nothing to read under a thumb, nothing over the hearts)
    for (const k of safe.keepOut) cost += overlap(box, k) * 3;
    for (const a of avoid) cost += overlap(box, a) * 2;
    for (const a of hard) cost += overlap(box, a) * 12;
    // she must not end up under her own bubble (it was pushed over her by the edge)
    cost += overlap(box, { x0: sx - me, y0: sy - meH, x1: sx + me, y1: sy + meH }) * 20;
    // a bubble far from her reads as someone else's
    const far = Math.max(0, Math.hypot(Math.max(box.x0 - sx, 0, sx - box.x1), Math.max(box.y0 - sy, 0, sy - box.y1)) - gap - 10);
    cost += far * far * 4;
    const tail: TailSide = side === 'above' ? 'b' : side === 'below' ? 't' : side === 'left' ? 'r' : 'l';
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

/** where she hovers beside Pokey: behind his shoulder, on the side he is not facing (screen px, her middle) */
export function hoverSpot(v: GuideView): { x: number; y: number } {
  const p = pokeyRect(v, 0);
  const cx = (p.x0 + p.x1) / 2;
  // (his painting is wider than his body box: keep clear of his arms)
  const off = (p.x1 - p.x0) / 2 + 52;
  let x = cx - v.facing * off;
  // at the screen's edge with his back to it: the other shoulder
  if (x < 28 || x > v.cssW - 28) x = cx + v.facing * off;
  return { x, y: Math.max(guideSafeArea(v.cssW, v.cssH).rect.y0 + 20, p.y0 - 14) };
}

/** which sides to try for a bubble when she hovers beside him: upright above him (toward his back), sideways behind him at head height */
export function hoverOrder(v: GuideView): ('above' | 'below' | 'left' | 'right')[] {
  const back = v.facing > 0 ? 'left' : 'right';
  const front = v.facing > 0 ? 'right' : 'left';
  return v.cssH > v.cssW ? ['above', back, 'below', front] : [back, 'above', 'below', front];
}
