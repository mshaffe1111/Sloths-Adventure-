/**
 * The new HUD lets play show through (QA, v189: in 4-2 sideways a column of flowers sat behind the hearts and three more on the Menu
 * leaf). When something the player needs, a pickup, an animal or Pokey himself, is under a HUD piece, that piece fades to about 30%
 * (CSS .vh-see). The world itself (a ledge, a log, a branch, the scenery) never does: the HUD stays over it (R-164.7). The HUD takes no touches but the Menu's, so touches already go through to play; the Menu leaf keeps its tap
 * while faded.
 *
 * Cheap: the pieces (each marked data-hud-fade) are measured at most every 0.4 s, and each frame is a few rect checks against what is
 * on screen, with no allocations.
 */
import type { GuideView } from '../../game/dotGuideView.ts';

/** how see-through a faded piece is (hud.css .vh-see), and the goal counter's floor: it is read at a glance, so it never fades past
 *  this (hud.css .vh-goal.vh-see; QA v198, 5-5 sideways: faded over a log the counter was nearly unreadable) */
export const FADE_OPACITY = 0.3;
export const GOAL_MIN_OPACITY = 0.62;

export interface FadePiece {
  el: Element;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  /** faded now */
  on: boolean;
}

/** do world boxes a and b overlap? */
const over = (ax0: number, ay0: number, ax1: number, ay1: number, bx0: number, by0: number, bx1: number, by1: number) => ax0 < bx1 && ax1 > bx0 && ay0 < by1 && ay1 > by0;

/** is anything the player needs inside screen box (x0, y0, x1, y1)? (screen css px; the view's camera turns world into screen) */
export function needsUnder(v: GuideView, x0: number, y0: number, x1: number, y1: number): boolean {
  const z = v.zoom;
  // the piece, in the world
  const wx0 = v.camX + x0 / z;
  const wy0 = v.camY + y0 / z;
  const wx1 = v.camX + x1 / z;
  const wy1 = v.camY + y1 / z;
  // Pokey (x is his left edge, y his feet)
  if (over(v.px, v.py - v.ph, v.px + v.pw, v.py, wx0, wy0, wx1, wy1)) return true;
  for (let i = 0; i < v.collectibles.length; i++) {
    const c = v.collectibles[i];
    if (c.collected || c.hidden) continue;
    if (over(c.x - 18, c.y - 18, c.x + 18, c.y + 18, wx0, wy0, wx1, wy1)) return true;
  }
  for (let i = 0; i < v.enemies.length; i++) {
    const e = v.enemies[i];
    if (e.defeated) continue;
    const hw = (e.width ?? 50) / 2;
    if (over(e.x - hw, e.y - (e.height ?? 40), e.x + hw, e.y, wx0, wy0, wx1, wy1)) return true;
  }
  // (never the world itself: a ledge, log or branch top under the hearts faded them to 30% and the logs and berries read as drawn over
  // Matt's hearts and lives, 1-5, R-164.7. The HUD stays over the world; only a thing he must see through it fades it)
  return false;
}

/** run once a frame: fades each piece with something it must not hide under it (and brings it back when clear). Returns how many are faded. */
export function fadeCovered(v: GuideView, pieces: readonly FadePiece[]): number {
  let n = 0;
  for (let i = 0; i < pieces.length; i++) {
    const p = pieces[i];
    const on = v.live && p.x1 > p.x0 && needsUnder(v, p.x0, p.y0, p.x1, p.y1);
    if (on !== p.on) {
      p.on = on;
      p.el.classList.toggle('vh-see', on);
    }
    if (on) n++;
  }
  return n;
}

/** measure the HUD pieces again (each element marked data-hud-fade), keeping the faded state of the ones still there */
export function measurePieces(root: ParentNode, into: FadePiece[]): FadePiece[] {
  const els = Array.from(root.querySelectorAll('[data-hud-fade]'));
  // (a piece that went away lets go of its fade)
  for (const p of into) if (p.on && !els.includes(p.el)) p.el.classList.remove('vh-see');
  into.length = 0;
  for (const el of els) {
    const r = el.getBoundingClientRect();
    into.push({ el, x0: r.left, y0: r.top, x1: r.right, y1: r.bottom, on: el.classList.contains('vh-see') });
  }
  return into;
}
