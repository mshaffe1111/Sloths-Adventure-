/**
 * How wide a view a boss fight opens to (engine.ts bossFrame turns it into the zoom): just far enough that both fighters fit, within
 * limits that keep Pokey a readable size. Pure, so the tests can check what a phone screen shows of a fight.
 */

/** the share of the screen's height the bar at the top covers (the boss bar and the hearts) */
export const HUD_SHARE = 0.19;

export interface BossViewIn {
  /** the screen, css px, and the level's height */
  w: number;
  h: number;
  levelH: number;
  /** the hero's and the boss's middles, and the boss's size and height above the floor */
  px: number;
  bx: number;
  bw: number;
  bh: number;
  air: number;
  arenaW: number;
  frameArena?: boolean;
  frameAir?: boolean;
  floorAt?: number;
  /** the world width a screen shows outside a boss fight: landscape is this tall, portrait this wide */
  worldViewH: number;
  portraitViewW: number;
}

/** the screen's usual scale (css px per world unit) */
export function baseScale(o: Pick<BossViewIn, 'w' | 'h' | 'levelH' | 'worldViewH' | 'portraitViewW'>): number {
  const portrait = o.h > o.w;
  const base = portrait ? Math.max(o.w / o.portraitViewW, o.h / o.levelH) : o.h / o.worldViewH;
  return Math.max(0.5, Math.min(1.8, base));
}

/** the width of world the view should show */
export function bossViewWidth(o: BossViewIn): number {
  const portrait = o.h > o.w;
  const baseViewW = o.w / baseScale(o);
  let need = o.frameArena && !portrait ? o.arenaW + 120 : Math.abs(o.px - o.bx) + 440 + Math.max(0, o.bw - 140) * 0.6;
  if (o.frameAir) {
    // a sky boss (the Sovereign): her head reaches ~230 past her middle, so both ends of her and the hero fit; and the view also opens
    // far enough up to show her when she climbs, under the bar at the top of the screen
    need = Math.max(need, Math.max(o.px, o.bx + 230) - Math.min(o.px, o.bx - 230) + 140);
    const above = o.air + o.bh * 0.65 + 40;
    need = Math.max(need, (above / ((o.floorAt ?? 0.7) - HUD_SHARE)) * (o.w / o.h));
  }
  // upright, the hero stays a readable size: the view never opens wider than ~720 units (a sky boss, whose openings are spread wider, 860)
  const widest = portrait ? Math.max(baseViewW, o.frameAir ? 860 : 720) : o.arenaW + 200;
  return Math.max(baseViewW, Math.min(need, widest));
}

/** the left edge of the view: midway between them, but never letting the hero slip off the edge */
export function bossViewX(px: number, bx: number, vw: number): number {
  const tx = (px + bx) / 2 - vw / 2;
  return Math.max(px + 70 - vw, Math.min(px - 70, tx));
}
