import { flyJump } from '../flight.ts';
// a stump on the floor: a block face `rise` px tall right at the lip (gap 0), 150 px wide; share of take-off spots 10..110 px before it that end standing on it
for (const s of ['easy', 'normal'] as const) for (const rise of [56, 63, 70, 76, 78, 80, 84, 87]) {
  const share = (hold: number) => { let ok = 0, n = 0; for (let d = 10; d <= 110; d += 2) { n++; if (flyJump(s, { rise, gap: 0, thin: false, landW: 150 }, d, hold).ok) ok++; } return Math.round((100 * ok) / n); };
  console.log(`${s} stump ${rise} px: Pad tap (2 frames, 67 ms) ${share(2)}%  tap (3 frames, 100 ms) ${share(3)}%  flick (7 frames) ${share(7)}%`);
}
