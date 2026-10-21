/**
 * heroLane — where the hero is on the screen, so the backdrop can keep a calm lane around him.
 *
 * The engine tells scenery where Pokey stands (in view units) once a frame. Small drifting things (petals, leaves, glow orbs, motes,
 * butterflies) fade out as they pass through the lane around him, and a very soft pool of calm light is laid behind the lane, so the
 * hero is always the highest-contrast thing in the picture. Nothing here is a hard shape: every edge is a smooth fall-off.
 */
interface Spot {
  x: number;
  y: number;
}
// one spot, updated in place (no object is made per frame)
const spot: Spot = { x: 0, y: 0 };
let has = false;
let pinned = false;

/** the hero's centre on the screen, in view units (call once a frame) */
export function setHeroScreen(x: number, y: number) {
  if (pinned) return;
  spot.x = x;
  spot.y = y;
  has = true;
}
/** forget the hero (menus and cutscenes have none) */
export function clearHeroScreen() {
  if (pinned) return;
  has = false;
}
export function heroScreen(): Spot | null {
  return has ? spot : null;
}
/**
 * Measurement hook (tests and the clutter meter): while pinned the hero's screen spot stays where it is, so a frame drawn with the hero
 * moved out of the way still carries the same calm pool and the same faded drifters, and the two frames differ only by the hero himself.
 */
export function pinHeroScreen(on: boolean) {
  pinned = on;
}

/** the lane around the hero, in view units: half-width, and how far it reaches above and below his centre */
export const LANE = { halfW: 190, up: 150, down: 50 };

const smooth = (t: number) => {
  const u = Math.min(1, Math.max(0, t));
  return u * u * (3 - 2 * u);
};

/**
 * 1 well away from the lane, falling smoothly to `floor` in its middle: the factor a small drifting thing's opacity is multiplied by.
 * `reach` is how far outside the lane the fade starts (view units).
 */
export function laneClear(x: number, y: number, floor = 0.2, reach = 80): number {
  if (!has) return 1;
  // the lane's core is a box around him; the distance to the box (0 inside it) drives the fade
  const dx = Math.max(0, Math.abs(x - spot.x) - LANE.halfW * 0.6);
  const dy = Math.max(0, spot.y - LANE.up - y, y - (spot.y + LANE.down));
  return floor + (1 - floor) * smooth(Math.hypot(dx, dy) / reach);
}
