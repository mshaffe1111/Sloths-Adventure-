/**
 * The edge marker (R-165.372, UI-372's mock-up, the lead's yes): a little one that a look spooked back off the screen gets a small amber
 * arrow at the screen's edge on its side, at its height, carrying its own face, so the player can see which one to fetch and where. Any
 * stage whose little ones follow him (never a stage id). Shown only while it is spooked AND off the screen; gone the moment it is on the
 * screen, rejoined or home. Not tappable (drawn on the game canvas, under the HUD).
 *
 * Pure placement here (tested: edgeMarker.test.ts); the engine draws it (engine.ts drawEdgeMarks) with the w2-props sheet riverArt
 * has already loaded. Written into a reused array: no allocation per frame (PERFORMANCE-RULES §1).
 */
import type { Follower, FollowKind } from './follow.ts';
import { FONT_UI } from './fonts.ts';

/** the '!' badge's font: the game's own UI face (no bare family: fonts test), made once */
const BANG_FONT = `800 13px ${FONT_UI}`;

/** the face's radius (css px): a 44 px circle, the HUD's smallest tap size, read at arm's length */
export const MARK_R = 22;
/** from the screen's edge (inside the safe inset) to the arrow's tip (css px) */
export const MARK_EDGE = 10;
/** the arrow's length past the circle (css px) */
export const MARK_TIP = 13;
/** about half a little one's painted width (world px) */
export const OFF_PAD = 24;
/**
 * the marker goes only once its WHOLE body is inside the screen by this much (world px), both sides: a little one crouched in the reeds at
 * the very edge is not yet seen (the lead's ruling on UI-372's 'gone' stills)
 */
export const INSIDE = 48;
/** the bands kept clear (css px from the safe inset): the HUD's top plates and the pad's buttons at the bottom */
export const CLEAR_TOP = 130;
export const CLEAR_BOTTOM = 150;
/** two marks on the same side are kept this far apart (css px) */
const STACK = MARK_R * 2 + 6;

export interface EdgeMark {
  kind: FollowKind;
  /** -1 off the left edge, +1 off the right */
  side: -1 | 1;
  /** the circle's centre (css px on the screen) */
  x: number;
  y: number;
}

export interface MarkView {
  /** the camera's left and top (world px), the view's size (world px), css px per world px */
  camX: number;
  camY: number;
  vw: number;
  vh: number;
  zoom: number;
  /** the screen's size (css px) and its safe-area insets */
  w: number;
  h: number;
  ins: { top: number; right: number; bottom: number; left: number };
}

/** an empty mark, for the reused array */
const blank = (): EdgeMark => ({ kind: 'duck', side: -1, x: 0, y: 0 });

/**
 * The marks for this frame, written into `out` (grown once, never shrunk); returns how many. A little one counts when it is spooked
 * (running back or hiding where it ran to) and its whole body is not yet inside the screen by INSIDE. Its mark sits at its body's height, clamped clear of the HUD's
 * band and the pad's, and stacked away from another mark on the same side.
 */
export function edgeMarks(line: readonly Follower[], v: MarkView, out: EdgeMark[]): number {
  let n = 0;
  const yMin = v.ins.top + CLEAR_TOP + MARK_R;
  const yMax = Math.max(yMin, v.h - v.ins.bottom - CLEAR_BOTTOM - MARK_R);
  for (let i = 0; i < line.length; i++) {
    const f = line[i];
    if (f.state !== 'spooked') continue;
    const seen = f.x - OFF_PAD >= v.camX + INSIDE && f.x + OFF_PAD <= v.camX + v.vw - INSIDE;
    if (seen) continue;
    const side: -1 | 1 = f.x < v.camX + v.vw / 2 ? -1 : 1;
    let y = Math.max(yMin, Math.min(yMax, (f.y - 30 - v.camY) * v.zoom));
    for (let j = 0; j < n; j++) if (out[j].side === side && Math.abs(out[j].y - y) < STACK) y = out[j].y + (y >= out[j].y ? STACK : -STACK);
    if (n === out.length) out.push(blank());
    const m = out[n++];
    m.kind = f.kind;
    m.side = side;
    m.x = side < 0 ? v.ins.left + MARK_EDGE + MARK_TIP + MARK_R : v.w - v.ins.right - MARK_EDGE - MARK_TIP - MARK_R;
    m.y = y;
  }
  return n;
}

/**
 * Each one's worried head on w2-props (its Sad painting, the pose it hides in: the lead's note on the mock-up), as a circle in the frame's
 * own px: the centre and the width the marker's circle shows. Read off the sheet (reference/qa-reports/UI-372/stills/sad-heads.png).
 */
const HEAD: Record<FollowKind, { n: 'duckSad' | 'otterSad' | 'capySad'; cx: number; cy: number; d: number }> = {
  duck: { n: 'duckSad', cx: 86, cy: 58, d: 118 },
  otter: { n: 'otterSad', cx: 124, cy: 60, d: 126 },
  capy: { n: 'capySad', cx: 108, cy: 66, d: 140 },
};

/**
 * The marks, drawn in css px (the caller has set the device-pixel transform). `img` is w2-props (riverArt's, already loaded for the stage's
 * little ones). The ring breathes gently (its brightness, never its size), still when `still` (reduced motion).
 */
export function drawEdgeMarks(ctx: CanvasRenderingContext2D, img: CanvasImageSource, frames: Record<string, { x: number; y: number; w: number; h: number }>, marks: readonly EdgeMark[], n: number, t: number, still: boolean): void {
  const glow = still ? 1 : 0.8 + 0.2 * Math.sin(t * (Math.PI * 2) / 1.5);
  for (let i = 0; i < n; i++) {
    const m = marks[i];
    const R = MARK_R;
    const { x, y, side } = m;
    ctx.save();
    // (the soft shadow under it all, so it reads on the bright sky: two stacked translucent discs, never shadowBlur: PERFORMANCE-RULES §1)
    ctx.fillStyle = 'rgba(20, 10, 2, 0.16)';
    ctx.beginPath();
    ctx.arc(x, y + 2, R + 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(20, 10, 2, 0.22)';
    ctx.beginPath();
    ctx.arc(x, y + 2, R + 5, 0, Math.PI * 2);
    ctx.fill();
    // the arrow: an amber wedge from the circle out to the edge
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(x + side * (R + MARK_TIP), y);
    ctx.lineTo(x + side * (R - 3), y - 13);
    ctx.lineTo(x + side * (R - 3), y + 13);
    ctx.closePath();
    ctx.fill();
    // the plate under the face
    ctx.fillStyle = '#3f3a33';
    ctx.beginPath();
    ctx.arc(x, y, R + 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(40, 20, 4, 0.85)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + side * (R + MARK_TIP), y);
    ctx.lineTo(x + side * (R - 3), y - 13);
    ctx.lineTo(x + side * (R - 3), y + 13);
    ctx.closePath();
    ctx.stroke();
    // its worried face, in the circle
    const h = HEAD[m.kind];
    const f = frames[h.n];
    const k = (2 * R) / h.d;
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, R, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, f.x, f.y, f.w, f.h, x - h.cx * k, y - h.cy * k, f.w * k, f.h * k);
    ctx.restore();
    // the amber ring (breathing) and its thin dark edge
    ctx.globalAlpha = glow;
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(x, y, R, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(40, 20, 4, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y, R + 2.5, 0, Math.PI * 2);
    ctx.stroke();
    // the HUD face's own amber '!', on its inner shoulder
    const bx = x - side * (R * 0.72);
    const by = y - R * 0.74;
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(bx, by, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(40, 20, 4, 0.85)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#1c1206';
    ctx.font = BANG_FONT;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('!', bx, by + 1);
    ctx.restore();
  }
}

/** the safe-area insets (css px), read from a hidden probe that uses env(), once per screen size; zero outside a page */
const ins = { top: 0, right: 0, bottom: 0, left: 0 };
let insW = -1;
let insH = -1;
let probe: HTMLElement | null = null;
export function safeInsets(w: number, h: number): { top: number; right: number; bottom: number; left: number } {
  if ((w === insW && h === insH) || typeof document === 'undefined' || !document.body) return ins;
  insW = w;
  insH = h;
  if (!probe) {
    probe = document.createElement('div');
    probe.setAttribute('aria-hidden', 'true');
    probe.style.cssText = 'position:fixed;visibility:hidden;pointer-events:none;width:0;height:0;padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)';
    document.body.appendChild(probe);
  }
  const cs = getComputedStyle(probe);
  ins.top = parseFloat(cs.paddingTop) || 0;
  ins.right = parseFloat(cs.paddingRight) || 0;
  ins.bottom = parseFloat(cs.paddingBottom) || 0;
  ins.left = parseFloat(cs.paddingLeft) || 0;
  return ins;
}

/** the player asked for less motion (the phone's setting): the ring holds still. The query is made once and read live after */
let rm: MediaQueryList | null | undefined;
export function stillMarks(): boolean {
  if (rm === undefined) rm = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  return !!rm?.matches;
}
