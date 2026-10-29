/**
 * Where the new HUD's pieces sit, and the room it leaves for Dot (HUD research spec D, "Layout per orientation", with Matt's change
 * of 2026-10-26: the goal counter hangs at the top centre and is the biggest thing in the HUD). Pure, so the Dot helper and the
 * tests can ask without a screen.
 *
 *   top-left:   the hearts on their vine          top centre: the goal counter, big, on its own vine          top-right: the Menu leaf
 *   portrait:        Dot gets the full-width band under all of it (on a narrow phone the counter takes a row of its own under the hearts)
 *   landscape:       Dot gets a top-centre lane (at most 46% wide) right under the counter
 *   short landscape: (430 px tall or less) the same in one compact row, smaller; the counter stays the biggest piece
 *   boss fights:     the boss bar takes the top centre (no counter); Dot goes under the bar
 *
 * Nothing to read ever goes in the bottom corners (the thumbs).
 *
 * The live numbers are also set as CSS variables on <html> while the new HUD is up (VineHud.tsx):
 *   --hud-lane-x, --hud-lane-y, --hud-lane-w, --hud-lane-h   Dot's room, in px from the viewport's top-left
 *   --hud-band-bottom                                        the bottom of everything the HUD has at the top (px from the top)
 * and `data-hud="vine"` plus `data-hud-mode="port|land|short"` (and `data-hud-boss` in a boss fight) on <html>.
 */

export type HudMode = 'port' | 'land' | 'short';

export interface Insets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}
const NO_INSETS: Insets = { top: 0, right: 0, bottom: 0, left: 0 };

export function hudMode(w: number, h: number): HudMode {
  if (h >= w || w <= 520) return 'port';
  return h <= 430 ? 'short' : 'land';
}

export interface HudGeo {
  mode: HudMode;
  /** side gutter inside the safe area */
  gutter: number;
  /** heart drawing size, and the distance from one heart to the next */
  heart: number;
  step: number;
  /** where the vine runs (its middle), from the top of the safe area */
  vineY: number;
  /** the small numbers' size (lives, the folded hearts) */
  num: number;
  /** the Menu leaf: its drawing and its touch box (at least 44 pt) */
  menu: number;
  menuHit: number;
  /** the bottom of the hearts row, from the top of the safe area */
  band: number;
  /** the boss block's height (name line plus bar) */
  bossH: number;
}

/** `h` (the screen's height) only matters in short landscape: the smallest sizes are for the very short screens (about 640x320) */
export function hudGeo(mode: HudMode, h = 390): HudGeo {
  // (the very short screens, about 780x288: the band shrinks again so more of the stage shows under it, QA v189)
  if (mode === 'short' && h <= 300) return { mode, gutter: 8, heart: 16, step: 20, vineY: 8, num: 16, menu: 36, menuHit: 44, band: 34, bossH: 34 };
  if (mode === 'short' && h <= 350) return { mode, gutter: 10, heart: 18, step: 23, vineY: 9, num: 18, menu: 40, menuHit: 46, band: 40, bossH: 38 };
  if (mode === 'short') return { mode, gutter: 12, heart: 20, step: 26, vineY: 10, num: 19, menu: 42, menuHit: 46, band: 44, bossH: 42 };
  if (mode === 'land') return { mode, gutter: 14, heart: 22, step: 28, vineY: 12, num: 20, menu: 44, menuHit: 48, band: 48, bossH: 48 };
  return { mode, gutter: 12, heart: 22, step: 28, vineY: 12, num: 20, menu: 44, menuHit: 48, band: 52, bossH: 50 };
}

/** how many hearts are drawn before they fold into "heart x N" (short landscape only, spec D) */
export const heartsShown = (mode: HudMode, maxHp: number) => (mode === 'short' && maxHp > 6 ? 1 : maxHp);

export interface LaneRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * The goal counter: top centre, on its own bit of vine, clearly bigger than the hearts (Matt, 2026-10-26: "make the counter bigger
 * and in the middle to stand out; it gets lost in the hearts"). Its sizes, by layout:
 */
export interface CentreGeo {
  /** the goal icon and the number's size (about 1.5 to 2 times the hearts) */
  icon: number;
  num: number;
  /** one slot, for small quotas */
  slot: number;
  /** where its vine runs, from the counter's top */
  vineY: number;
  /** the painted plate's height (it hangs 7 px under the vine); its width follows what it holds */
  plate: number;
  /** the whole counter's height, vine to the bottom of its plate */
  height: number;
}
/** the painted goal plate (hud-goal-plate, 540 x 210): its ends keep their shape, the middle stretches for a wider count */
export const PLATE_ASPECT = 540 / 210;
/** the room the plate's rounded ends and curls take beside what it holds, as a share of its height */
export const PLATE_ENDS = 0.8;
const cgeo = (icon: number, num: number, slot: number, vineY: number, plate: number): CentreGeo => ({ icon, num, slot, vineY, plate, height: vineY + 7 + plate });
export function centreGeo(mode: HudMode, h = 390): CentreGeo {
  if (mode === 'short' && h <= 300) return cgeo(24, 20, 18, 7, 36);
  if (mode === 'short' && h <= 350) return cgeo(27, 22, 21, 8, 44);
  if (mode === 'short') return cgeo(31, 25, 24, 9, 52);
  if (mode === 'land') return cgeo(36, 29, 28, 11, 58);
  return cgeo(33, 27, 26, 11, 52);
}

/** the counter's width: 'count' (icon and "13/33"), 'slots' (one per item), 'distance' (the trail), or 0 for 'none' */
export function counterW(c: CentreGeo, kind: 'count' | 'slots' | 'distance' | 'none', target = 30, word = ''): number {
  if (kind === 'none') return 0;
  const ends = Math.round(c.plate * PLATE_ENDS);
  if (kind === 'distance') return (c.icon >= 36 ? 150 : c.icon >= 31 ? 130 : 112) + ends;
  if (kind === 'slots') return target * (c.slot + 4) + ends;
  const dg = String(Math.max(1, Math.round(target))).length;
  // (a word before the count, "Warnings": its letters at about 0.62 of the number's size, and a gap)
  const wd = word ? Math.round(word.length * c.num * 0.62 * 0.56 + 8) : 0;
  return Math.max(Math.round(c.plate * PLATE_ASPECT), Math.round(c.icon + 6 + wd + c.num * (0.6 * dg + 0.42 * (dg + 1)) + ends));
}

export interface CentrePlace extends LaneRect {
  /** the counter's middle, px from the viewport left */
  cx: number;
  /** 1: in the top row between the hearts and the Menu; 2: lower down (its own row under the hearts, or under a boss bar) */
  row: 1 | 2;
}

/** where the centre counter goes: the middle of the screen, nudged clear of the hearts and the Menu, or a row lower if it cannot fit */
export function centrePlace(w: number, h: number, cw: number, opts: { hearts?: number; insets?: Insets; underBoss?: LaneRect } = {}): CentrePlace {
  const mode = hudMode(w, h);
  const g = hudGeo(mode, h);
  const ins = opts.insets ?? NO_INSETS;
  if (opts.underBoss) {
    // (smaller, under the bar)
    const b = opts.underBoss;
    return { cx: b.x + b.w / 2, x: b.x + b.w / 2 - cw / 2, y: b.y + b.h + 4, w: cw, h: centreGeo('short', 320).height, row: 2 };
  }
  const c = centreGeo(mode, h);
  const leftEnd = ins.left + g.gutter + (opts.hearts ?? 5) * g.step + 6;
  const rightStart = w - ins.right - g.gutter - g.menuHit;
  if (cw + 16 <= rightStart - leftEnd) {
    const cx = Math.max(leftEnd + cw / 2 + 8, Math.min(rightStart - cw / 2 - 8, w / 2));
    return { cx, x: cx - cw / 2, y: ins.top, w: cw, h: c.height, row: 1 };
  }
  const cx = w / 2;
  return { cx, x: cx - cw / 2, y: ins.top + g.band - 6, w: cw, h: c.height, row: 2 };
}

export interface HudSafe extends LaneRect {
  mode: HudMode;
  /** the bottom of everything the HUD has at the top (hearts row, centre counter, boss block), px from the viewport top */
  bandBottom: number;
  /** the right end of the hearts and the left end of the Menu, px from the viewport left */
  leftEnd: number;
  rightStart: number;
  /** the centre counter's box, when there is one */
  counter: LaneRect | null;
}

/**
 * Dot's room: where her bubble may sit without touching the HUD. Always under the HUD, never in the bottom corners:
 *   portrait: the full-width band right under the hearts and the centre counter (under the boss block in a fight);
 *   landscape and short landscape: a top-centre lane at most 46% of the width, right under the centre counter (in a fight, under
 *   the boss bar).
 * `hearts` defaults to five; `counter` is the centre counter's width (counterW), defaulting to a two-digit count; 0 for none.
 */
export function hudSafeRect(
  w: number,
  h: number,
  opts: { boss?: boolean; hearts?: number; counter?: number; insets?: Insets } = {},
): HudSafe {
  const mode = hudMode(w, h);
  const g = hudGeo(mode, h);
  const ins = opts.insets ?? NO_INSETS;
  const hearts = opts.hearts ?? 5;
  const cw = opts.counter ?? (opts.boss ? 0 : counterW(centreGeo(mode, h), 'count', 30));
  const leftEnd = ins.left + g.gutter + hearts * g.step;
  const rightStart = w - ins.right - g.gutter - g.menuHit;
  const boss = opts.boss ? bossRect(w, h, ins) : null;
  const place = cw > 0 ? centrePlace(w, h, cw, { hearts, insets: ins, underBoss: boss ?? undefined }) : null;
  const counter = place ? { x: place.x, y: place.y, w: place.w, h: place.h } : null;
  const bandBottom = Math.max(ins.top + g.band, boss ? boss.y + boss.h : 0, place ? place.y + place.h : 0);
  if (mode === 'port') {
    const x = ins.left + g.gutter;
    return { mode, x, y: bandBottom + 6, w: w - ins.left - ins.right - 2 * g.gutter, h: 76, bandBottom, leftEnd, rightStart, counter };
  }
  const lw = Math.round(w * 0.46);
  return { mode, x: Math.round((w - lw) / 2), y: bandBottom + 6, w: lw, h: mode === 'short' ? 46 : 56, bandBottom, leftEnd, rightStart, counter };
}

/** the boss block's box: top centre, at most 46% wide sideways, nearly full width upright (under the hearts row) */
export function bossRect(w: number, h: number, insets: Insets = NO_INSETS): LaneRect {
  const mode = hudMode(w, h);
  const g = hudGeo(mode, h);
  if (mode === 'port') {
    const x = insets.left + g.gutter;
    return { x, y: insets.top + g.band + 4, w: w - insets.left - insets.right - 2 * g.gutter, h: g.bossH };
  }
  const leftEnd = insets.left + g.gutter + 5 * g.step;
  const rightStart = w - insets.right - g.gutter - g.menuHit;
  const bw = Math.min(Math.round(w * 0.46), rightStart - leftEnd - 24);
  const x = Math.max(leftEnd + 12, Math.round((w - bw) / 2));
  return { x, y: insets.top + 6, w: bw, h: g.bossH };
}

/** reading time for a card or tip: 1.5 s plus 0.5 s a word (teaching spec), at least `min` ms */
export function readMs(text: string, min = 3000): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(min, 1500 + 500 * words);
}
