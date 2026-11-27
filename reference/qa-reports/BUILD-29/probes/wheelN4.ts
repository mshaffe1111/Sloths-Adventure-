// BUILD-29-h: the terrace wheel's drum-locked shapes under the 4 s quiet line (N4, a bucket every two beats on Normal), flown on the
// engine (wheelFlights.ts flyWheel, World 2's wheel stage). npx tsx reference/qa-reports/BUILD-29/probes/wheelN4.ts
import { flyWheel } from '../../../../src/game/gen2/wheelFlights.ts';
import { W2_WHEEL_STAGE } from '../../../../src/game/gen2/worlds/w2.ts';
const BEAT = 0.7125, EBEAT = 0.825; // Normal and Easy beats (2-9's tempo: period 2.85 s a bar, Easy 3.3 s)
const V = (R: number, N: number, period: number) => Math.round(((2 * Math.PI * R) / (N * period)) * 100) / 100;
const rows: Array<[string, number, number, 'normal' | 'easy']> = [];
for (const R of [160, 140, 120]) rows.push([`N4 2-beat R${R}`, R, V(R, 4, 2 * BEAT), 'normal']);
for (const R of [160, 140, 120]) rows.push([`N4 bar R${R} (Easy)`, R, V(R, 4, 4 * EBEAT), "easy"], [`N4 2-beat R${R} (Easy)`, R, V(R, 4, 2 * EBEAT), "easy"], [`N4 3-beat R${R} (Easy)`, R, V(R, 4, 3 * EBEAT), "easy"], [`N4 5-beat R${R} (Easy)`, R, V(R, 4, 5 * EBEAT), "easy"], [`N4 6-beat R${R} (Easy)`, R, V(R, 4, 6 * EBEAT), "easy"]);
const only = process.argv[2] ? new RegExp(process.argv[2]) : null;
for (const [name, R, v, d] of rows.filter(([n, , , d]) => !only || only.test(`${d} ${n}`))) {
  const { misses, ...f } = await flyWheel({ R, V: v, N: 4, street: 'edge' }, d, W2_WHEEL_STAGE);
  console.log(`${d} ${name} V${v}: turn ${f.turn} s, period ${f.period} s, lift ${f.lift}; board tap ${f.board.tap.share}% ${f.board.tap.window} s, walk ${f.board.walk.share}% ${f.board.walk.window} s; ride ${f.ride}; step ${f.step} s (walk ${f.walk.window}, tap ${f.tap.window}); half turn + half period ${Math.round((f.turn / 2 + f.period / 2) * 100) / 100} s`);
}
