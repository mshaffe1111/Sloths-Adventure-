// npx tsx reference/qa-reports/ENG-25b/targets.mts   (2-5.md's rows on the meter's snap channel: snapClock + snapWindow, both settings)
import { snapClock, snapWindow } from '../../../src/game/gen2/rideLay.ts';
import { beatOf } from '../../../src/game/clock.ts';
import { windowBits } from '../../../tools/difficulty/score.ts';
const rows: Array<[string, number, number[]]> = [
  ['teach: 1 stone, count 0.75', 0.75, [0]],
  ['in step: 3, count 0.75', 0.75, [0, 0, 0]],
  ['wave of 3, count 0.75', 0.75, [0, -0.75, -1.5]],
  ['wave of 5, count 0.75', 0.75, [0, -0.75, -1.5, -2.25, -3]],
  ['quickening: 3 in step, count 0.6', 0.6, [0, 0, 0]],
];
for (const [name, count, shifts] of rows) {
  const def = snapClock('snap-x' as never, { count } as never);
  const r = (easy: boolean) => { const bar = beatOf(def, easy).period, w = snapWindow(def, shifts, easy); return `${w.toFixed(2)} s of ${bar.toFixed(2)} -> ${windowBits(bar, w).toFixed(2)} bits`; };
  console.log(`${name}: Normal ${r(false)}; Easy ${r(true)}`);
}
