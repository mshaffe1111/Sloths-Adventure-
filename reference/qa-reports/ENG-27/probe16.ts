import { homeRun } from '../../../tools/inspect/homeToys.ts';
const seed = Number(process.argv[2] ?? 2);
let lives = -1, n = 0;
const where = new Map<string, number>();
homeRun('middle', 'normal', seed, 1, { onFrame: (sim: { t: number; p: { x: number; y: number }; e: { lives: number } }) => {
  if (lives >= 0 && sim.e.lives < lives) { const k = `${Math.round(sim.p.x / 50) * 50},${Math.round(sim.p.y / 50) * 50}`; where.set(k, (where.get(k) ?? 0) + 1); if (n++ < 6) console.log('death t', sim.t.toFixed(1), 'at', Math.round(sim.p.x), Math.round(sim.p.y)); }
  lives = sim.e.lives;
} } as never);
console.log('deaths by place', JSON.stringify([...where].sort((a, b) => b[1] - a[1]).slice(0, 8)));
