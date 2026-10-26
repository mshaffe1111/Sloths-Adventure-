/**
 * What Dot's guide reads from the stage each frame : where the camera is, where Pokey is and what he is doing,
 * and the things on screen she may perch on or point at. The engine fills one of these in place (GameEngine.guideView), so reading it
 * every frame allocates nothing; the arrays are the engine's own, read-only here.
 */
export interface GuideThing {
  x: number;
  y: number;
}
export interface GuideEnemy extends GuideThing {
  type: string;
  defeated: boolean;
  width?: number;
  height?: number;
}
export interface GuidePlatform {
  x: number;
  y: number;
  width: number;
  height: number;
  type: string;
  broken?: boolean;
  push?: { min: number; max: number };
  chase?: boolean;
}
export interface GuideVine {
  x: number;
  topY: number;
  bottomY: number;
  vineType?: string;
}
export interface GuideRope {
  x0: number;
  x1: number;
  y: number;
  g0: number;
  g1: number;
}
export interface GuideCollectible extends GuideThing {
  type: string;
  collected: boolean;
  hidden?: boolean;
}
export interface GuideBush extends GuideThing {
  w: number;
  kind: string;
}
/** one of World 5's pieces Dot can point at (w5Play.ts guideThings): a cocoon's middle, or a closing orchid's cup */
export interface GuideW5 extends GuideThing {
  kind: 'cocoon' | 'orchid';
  /** a cocoon already punched open: nothing to point at */
  done?: boolean;
}

export interface GuideView {
  /** a stage is running at all (false before the engine exists, and in Dot's own flight stage) */
  live: boolean;
  stageId: string;
  /** seconds of play (stands still while paused) */
  t: number;
  paused: boolean;
  /** css px per world unit, the camera's top-left in world units, and the canvas in css px */
  zoom: number;
  camX: number;
  camY: number;
  cssW: number;
  cssH: number;
  /** Pokey: x is his left edge, y his feet */
  px: number;
  py: number;
  pw: number;
  ph: number;
  vx: number;
  vy: number;
  facing: 1 | -1;
  grounded: boolean;
  climbing: boolean;
  swinging: boolean;
  hanging: boolean;
  ducking: boolean;
  gliding: boolean;
  pushing: boolean;
  doubleJumping: boolean;
  attack: 'none' | 'punch' | 'kick' | 'mega';
  /** still blinking from a hit (not the sun power-up) */
  hurt: boolean;
  hp: number;
  lives: number;
  /** something is close enough to kick (the engine works it out for the touch rules) */
  kickNear: boolean;
  boss: boolean;
  chase: boolean;
  /** Dot's own flight stage (she is the player: no perch, no ring, and Pokey's state means nothing) */
  flight: boolean;
  levelH: number;
  enemies: readonly GuideEnemy[];
  platforms: readonly GuidePlatform[];
  vines: readonly GuideVine[];
  ropes: readonly GuideRope[];
  collectibles: readonly GuideCollectible[];
  hazards: readonly GuideThing[];
  bushes: readonly GuideBush[];
  /** World 5's cocoons and closing orchids (empty elsewhere) */
  w5: readonly GuideW5[];
  /** the score pop-ups floating up ("+100 FLOWER!"): Dot keeps off them */
  popups: readonly GuideThing[];
  /** a boss's weak spot while it is open (world units; the NOW! marker sits on it): Dot's bubble never covers it */
  weakOn: boolean;
  /** the boss's middle (world x), while one is up */
  bossX: number;
  weakX: number;
  weakY: number;
  weakW: number;
  weakH: number;
}

const NONE: readonly never[] = [];

export function emptyGuideView(): GuideView {
  return {
    live: false,
    stageId: '',
    t: 0,
    paused: true,
    zoom: 1,
    camX: 0,
    camY: 0,
    cssW: 0,
    cssH: 0,
    px: 0,
    py: 0,
    pw: 40,
    ph: 60,
    vx: 0,
    vy: 0,
    facing: 1,
    grounded: true,
    climbing: false,
    swinging: false,
    hanging: false,
    ducking: false,
    gliding: false,
    pushing: false,
    doubleJumping: false,
    attack: 'none',
    hurt: false,
    hp: 1,
    lives: 1,
    kickNear: false,
    boss: false,
    chase: false,
    flight: false,
    levelH: 900,
    enemies: NONE,
    platforms: NONE,
    vines: NONE,
    ropes: NONE,
    collectibles: NONE,
    hazards: NONE,
    bushes: NONE,
    w5: NONE,
    popups: NONE,
    weakOn: false,
    bossX: NaN,
    weakX: 0,
    weakY: 0,
    weakW: 0,
    weakH: 0,
  };
}

/** world to screen (css px) */
export const toScreenX = (v: GuideView, x: number) => (x - v.camX) * v.zoom;
export const toScreenY = (v: GuideView, y: number) => (y - v.camY) * v.zoom;
