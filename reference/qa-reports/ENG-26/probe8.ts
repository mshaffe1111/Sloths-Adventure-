// ENG-26 probe: fly sparse wheels (relative imports, D83)
import { flyWheel } from '../../../src/game/gen2/wheelFlights.ts';
for (const N of [4, 5]) for (const d of ['normal', 'easy'] as const) {
  const f = await flyWheel({ R: 180, V: d === 'easy' ? 60 : 70, N, street: 'edge' }, d);
  console.log(N, d, JSON.stringify({ board: f.board, ride: f.ride, step: f.step, walk: f.walk, tap: f.tap }));
}
