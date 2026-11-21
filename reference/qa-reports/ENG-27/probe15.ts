import { homeRun } from '../../../tools/inspect/homeToys.ts';
import { riverAt } from '../../../src/game/river.ts';
let done = false;
homeRun('middle', 'normal', 1, 1, { onFrame: (sim: { t: number; p: { x: number; y: number }; stage: { config: { levelHeight: number }; rivers?: Array<{ x0: number; x1: number; surfaceY: number; safe?: unknown }>; waterY?: number; safeWater?: unknown; heartFalls?: unknown }; e: { softAt?: unknown } }) => {
  if (!done && sim.t > 88.0) {
    done = true;
    const st = sim.stage;
    console.log('levelHeight', st.config.levelHeight, 'waterY', st.waterY, 'safeWater', JSON.stringify(st.safeWater), 'softAt', JSON.stringify(sim.e.softAt));
    console.log('riverAt', JSON.stringify(riverAt(st.rivers as never, 12105, 1567)));
    console.log('rivers near', JSON.stringify((st.rivers ?? []).filter((r) => r.x1 > 11000 && r.x0 < 13000)));
    console.log('heartFalls', JSON.stringify(st.heartFalls)?.slice(0, 300));
  }
} } as never);
