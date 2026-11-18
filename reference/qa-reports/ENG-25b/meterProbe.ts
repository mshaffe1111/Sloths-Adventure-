// npx tsx reference/qa-reports/ENG-25b/meterProbe.ts   (ENG-25b: what the meter reads on ENG-25's snap toys, both settings)
import { scoreStage } from '../../../tools/difficulty/score.ts';
import { fixtureSeed, ID, onSnapToy, pondOf, snapStage, TOY_SNAPS, type ToySnap } from '../../../tools/inspect/snapToys.ts';

for (const row of Object.keys(TOY_SNAPS) as ToySnap[]) {
  const seed = fixtureSeed(row);
  const pond = pondOf(snapStage(row, seed));
  for (const setting of ['normal', 'easy'] as const) {
    const r = onSnapToy(row, seed, setting, () => scoreStage(ID, setting, seed, new Map()));
    console.log(`${row} ${setting} (seed ${seed}, pond ${Math.round(pond.x0)}-${Math.round(pond.x1)}): score bits ${r.bits}, pieces ${r.pieces.filter((p) => /pad|snap|move:/.test(p)).join(' ')}`);
    for (const c of r.challenges) if (c.x > pond.x0 - 150 && c.x < pond.x1 + 50) console.log(`   ${c.kind} x ${Math.round(c.x)} bits ${c.bits.toFixed(2)} cost ${c.cost} :: ${c.note}`);
  }
}
