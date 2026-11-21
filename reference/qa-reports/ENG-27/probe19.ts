import { homeRun } from '../../../tools/inspect/homeToys.ts';
homeRun('middle', 'normal', 2, 1, { onFrame: (sim: { t: number; p: { x: number; y: number; vx: number; vy: number; grounded: boolean }; standingOn: number; platforms: Array<{ id: number; x: number; width: number; drift?: unknown }>; e: { lives: number } }) => {
  if (sim.t > 89.5 && sim.t < 92.7) {
    const logs = sim.platforms.filter((q) => q.drift && q.x < 13100 && q.x + q.width > 12250).map((q) => `${q.id}:${Math.round(q.x)}-${Math.round(q.x + q.width)}`).join(' ');
    if (Math.round(sim.t * 30) % 3 === 0) console.log(sim.t.toFixed(2), Math.round(sim.p.x), Math.round(sim.p.y), Math.round(sim.p.vx), Math.round(sim.p.vy), sim.p.grounded ? 'G' : '-', sim.standingOn, sim.e.lives, '|', logs);
  }
} } as never);
