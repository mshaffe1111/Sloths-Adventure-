// BUILD-23d trace tool (not a gate): the child check's widest open mud by heron rhythm and line length (a toy stretch): npx tsx tools/engine/runs/_toy23.ts
import '../../../src/game/headlessDom.ts';
import { childCross } from '../../../src/game/gen2/lineFaults.ts';
import { W2_FOLLOW } from '../../../src/game/gen2/worlds/w2.ts';
const plat = (x: number, w: number, y = 580) => ({ type: 'solid', x, y, width: w, height: 170 } as any);
const bush = (x: number, w: number) => ({ x, y: 580, w, h: 90, kind: 'reeds' } as any);
for (const easy of [false, true]) for (const two of [0, 1.0, 3.2]) for (const calm0 of [5, 6, 7, 8]) {
  const row: string[] = [];
  for (const n of [3, 4, 5]) {
    let best = -1;
    for (let G = 0; G <= 500; G += 10) {
      const A = 10000, w = easy ? 340 : 300;
      const zones: any[] = [{ x0: A + 40, x1: A + w + G + w - 40, calm: [calm0, calm0 + 0.9] }];
      if (two) zones.push({ ...zones[0], lag: two });
      const covers = [bush(A, w), bush(A + w + G, w)];
      const m = childCross(W2_FOLLOW, easy, zones, covers, [plat(8000, 6000)], [], n, 1);
      if (!m) best = G; else break;
    }
    row.push(`n${n}:${best}`);
  }
  console.log(`${easy ? 'E' : 'N'} lag ${two} calm ${calm0}: max open ${row.join(' ')}`);
}
