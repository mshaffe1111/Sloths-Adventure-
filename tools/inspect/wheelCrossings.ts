/**
 * Every water wheel a tier bot meets on a stage, as a person watching would tell it (ENG-26c; level.md rule 21): for each wheel (wheel.ts,
 * laid by gen2 place `wheel`), from the first frame he stands on its jetty or in one of its buckets to the first on its street (s; null:
 * never), how many times he left one of its buckets and came down anywhere but its street (a scramble), and how many times he fell into
 * its pond. wheelToys.ts wheelCrossing tells one toy wheel; this tells every wheel of a stage, both ways round (Wheel.way), so a level's
 * own row is judged the way its toy was. Nothing here names a stage: the caller hands the run.
 */
import type { RealPlay } from '../../src/game/realPlay.ts';
import type { Wheel } from '../../src/game/wheel.ts';
import type { RiverZone } from '../../src/game/river.ts';

export interface WheelCrossing {
  /** the wheel's row (W2_WHEELS key) and the way its top runs (1 right, -1 left) */
  row: string;
  way: 1 | -1;
  /** jetty (or bucket) to street, s; null: he never reached the street from this wheel */
  seconds: number | null;
  scrambles: number;
  pond: number;
}

/** a frame hook that tallies every wheel of the stage (call it from runTier's onFrame), and the tally */
export function wheelTally(): { onFrame: (sim: RealPlay) => void; crossings: () => WheelCrossing[] } {
  type T = { w: Wheel; pond?: RiverZone; t0: number; t1: number; scrambles: number; pond: number; wet: boolean; left: boolean; prev: string };
  let all: T[] | null = null;
  const onFrame = (sim: RealPlay) => {
    if (!all) {
      const ws = [...new Set(sim.platforms.flatMap((p) => (p.wheel ? [p.wheel.w as Wheel] : [])))];
      all = ws.map((w) => ({ w, pond: sim.stage.rivers?.find((r) => r.wheelPond && r.x0 <= w.cx && r.x1 >= w.cx && r.surfaceY > w.cy && r.surfaceY < w.cy + w.R + 400), t0: -1, t1: -1, scrambles: 0, pond: 0, wet: false, left: false, prev: '' }));
    }
    const on = sim.standingOn;
    const q = sim.platforms.find((p) => p.id === on);
    for (const c of all) {
      const lay = c.w.lay;
      if (!lay || c.t1 >= 0) continue;
      const street = sim.platforms.find((p) => p.id === lay.streetId);
      // (its street's storey: the street, or wood laid on from its far end at its height, past the lip)
      const onStreet = !!q && !!street && (q === street || (!q.wheel && Math.abs(q.y - street.y) <= 4 && (sim.p.x - c.w.cx) * c.w.way > 0 && Math.abs(sim.p.x - c.w.cx) < c.w.R + 600));
      const mine = q?.wheel?.w === c.w;
      const where = on === lay.jetty ? 'jetty' : mine ? 'bucket' : c.t0 >= 0 && onStreet ? 'street' : on >= 0 ? 'other' : 'air';
      if (c.t0 < 0 && (where === 'jetty' || where === 'bucket')) c.t0 = sim.t;
      if (c.t0 >= 0 && c.prev === 'bucket' && where === 'air') c.left = true;
      if (c.left && where !== 'air') { if (where !== 'street') c.scrambles++; c.left = false; }
      if (c.t0 >= 0 && where === 'street') c.t1 = sim.t;
      const z = c.pond;
      const inPond = !!z && c.t0 >= 0 && sim.p.x > z.x0 && sim.p.x < z.x1 && sim.p.y > z.surfaceY - 8 && sim.p.y < z.surfaceY + 200;
      if (inPond && !c.wet) c.pond++;
      c.wet = inPond;
      c.prev = where;
    }
  };
  const crossings = (): WheelCrossing[] => (all ?? []).sort((a, b) => b.w.cy - a.w.cy).map((c) => ({
    row: c.w.lay?.row ?? '?', way: c.w.way, seconds: c.t0 >= 0 && c.t1 >= 0 ? +(c.t1 - c.t0).toFixed(1) : null, scrambles: c.scrambles, pond: c.pond,
  }));
  return { onFrame, crossings };
}
