/**
 * The HUD's progress bar measured ALONG THE ROUTE (ENG-HUD27): on a stage laid as more than one leg (gen2/legs.ts: out right, down a
 * column, back left; any stage that lays a leg back), his x alone stalls or runs backward (2-7's way out goes right from a start that
 * lies right of its exit: the leftward run's bar sat at 0 for the whole way out), so the bar reads the px of route he has come, out of
 * the route's whole length (gen2/tower.ts routeOf, routeAt: the route the lay itself measures its flags by), from the spawn to the
 * totem. It never goes back (the best so far, like a climb's), it counts only where he stands or climbs (a fall past the leg laid under
 * this one is no progress: a frame in the air could sit nearer the leg below), and it reads 1 at the totem.
 *
 * A stage of ONE leg (every run, every tower, a run laid left) has no route bar: the travel mode's own measure stands (stageModes.ts),
 * exactly as before.
 */
import { routeAt, type Route } from './gen2/tower.ts';
import type { Mark } from './stageKit.types.ts';

const span = (a: Mark, b: Mark): number => Math.abs(b.x - a.x) + Math.abs(b.y - a.y);

/**
 * How far along the route a place is (px from the spawn), the tail to the totem included: routeAt ends at the last section's end, so a
 * place past it (on the walk to the totem) adds how much nearer the totem he stands than that end, never more than the tail itself
 */
export function routeDone(route: Route, at: Mark): number {
  const s = routeAt(route, at.x, at.y);
  const last = route.legs[route.legs.length - 1];
  if (!last) return s;
  const end = last.s0 + last.len;
  if (s < end) return s;
  const tail = route.length - end;
  return end + Math.max(0, Math.min(tail, tail - span(at, route.exit)));
}

/** the bar on a stage of legs: the best route px so far over the whole route (0 at the spawn, 1 at the totem) */
export class RouteBar {
  private best = 0;
  constructor(readonly route: Route) {}
  /** a step where he stands or climbs at `at`: the bar takes it if it is further on than any before */
  stood(at: Mark) {
    this.best = Math.max(this.best, routeDone(this.route, at));
  }
  ratio(): number {
    return Math.max(0, Math.min(1, this.best / Math.max(1, this.route.length)));
  }
}

/** the stage's route bar, when it is laid as more than one leg (gen2 tower flow 'legs'); none on every other stage */
export function routeBarOf(stage: object): RouteBar | null {
  const T = (stage as { gen2?: { tower?: { flow?: string; legs?: readonly unknown[]; route?: Route } } }).gen2?.tower;
  if (!T || T.flow !== 'legs' || (T.legs?.length ?? 0) < 2 || !T.route?.legs.length) return null;
  return new RouteBar(T.route);
}
