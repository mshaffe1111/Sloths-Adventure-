import { homeRun, homeStage } from '../../../tools/inspect/homeToys.ts';
const seed = Number(process.argv[2] ?? 2);
const st = homeStage(seed);
for (const r of st.rivers ?? []) console.log('river', Math.round(r.x0), Math.round(r.x1), 'surf', Math.round(r.surfaceY), 'dir', r.dir, 'way', r.way ?? '', 'speed', r.speed, r.safe ? 'safe' : '');
let lives = -1, px = 0, py = 0, n = 0;
homeRun('middle', 'normal', seed, 1, { onFrame: (sim: { t: number; p: { x: number; y: number }; e: { lives: number } }) => {
  if (lives >= 0 && sim.e.lives < lives && n++ < 14) console.log('death t', sim.t.toFixed(1), 'from', Math.round(px), Math.round(py));
  lives = sim.e.lives; px = sim.p.x; py = sim.p.y;
} } as never);
