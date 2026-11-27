import { airStep } from '../../../../src/game/physics.ts';
for (const hold of [false, true]) {
  const c = { x: 14388.75, y: 727.48, vx: 502.7, vy: -499.4 };
  const out: string[] = [];
  for (let i = 1; i <= 19; i++) { const py = c.y; airStep(c, 1 / 30, 1, hold); if (i >= 16) out.push(`${i}:x${c.x.toFixed(2)} y${c.y.toFixed(2)}${py <= 806 && c.y >= 798 ? ' CROSS' : ''}`); }
  console.log('hold', hold, out.join(' | '));
}
