// ENG-26 probe: the edge wheel's step-off window with its street moved (relative imports, D83)
import { flyWheel } from '../../../src/game/gen2/wheelFlights.ts';
import { rowLayout } from '../../../src/game/gen2/wheelLay.ts';
import { W2_WHEELS } from '../../../src/game/gen2/worlds/w2.ts';
for (const [dx, dy] of [[90, 0], [120, 0], [0, -60], [60, -40]]) {
  const f = await flyWheel({ ...rowLayout(W2_WHEELS.edge, 'normal'), moved: { dx, dy } }, 'normal');
  console.log(dx, dy, 'step', f.step, 'walk', f.walk.window, 'tap', f.tap.window);
}
