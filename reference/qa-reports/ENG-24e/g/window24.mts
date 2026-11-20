// the catch window of 2-4's tail lianas from a log: share of (take-off x, swing moment) pairs a jump catches, standing vs running
//   npx tsx reference/qa-reports/ENG-24e/g/window24.mts   (ENG-24g: seeds 2, 14, 19; each tier hold[0], FakeInput, the stand at the log speed vs + PHYS.maxRun)
import '../../../../src/game/headlessDom.ts';
import { RealPlay } from '../../../../src/game/realPlay.ts';
import { hopCatches, FT_CHILD, FT_MIDDLE, FT_EXPERT } from '../../../../tools/inspect/firsttimer.ts';
import { vinePeriod, PHYS } from '../../../../src/game/physics.ts';
import { riverEnd } from '../../../../src/game/river.ts';
import { logCatches } from '../../../../src/game/gen2/riverLay.ts';
for (const seed of [2, 14, 19]) {
  const rp = new RealPlay('2-4', seed);
  for (const pl of rp.platforms) {
    const d = pl.drift; if (!d?.tail) continue;
    if (rp.platforms.find((q) => q.drift && q.drift.x0 === d.x0 && q.id < pl.id)) continue;
    const vs = rp.vines.filter((v) => v.vineType === 'swing_liana' && v.x > d.x1 && v.x < riverEnd(d));
    for (const v of vs) {
      const P = vinePeriod(v);
      const top = d.baseY - 0; const y = top - 0;
      const row: string[] = [];
      for (const [name, who] of [['child', FT_CHILD], ['middle', FT_MIDDLE], ['expert', FT_EXPERT]] as const) {
        const hold = who.hold[0];
        for (const run of [0, PHYS.maxRun]) {
          let n = 0, k = 0, xs = new Set<number>();
          for (let x = d.x1 - 300; x <= d.x1 - 10; x += 5) for (let i = 0; i < 60; i++) { k++; if (hopCatches(v, x, rp.platforms.find((q) => q.id === pl.id)!.y, 1, hold, (P * i) / 60, d.speed + run)) { n++; xs.add(x); } }
          row.push(`${name} ${run ? 'run' : 'stand'}: ${(100 * n / k).toFixed(1)}% from x1-${xs.size ? d.x1 - Math.min(...xs) : '-'}..x1-${xs.size ? d.x1 - Math.max(...xs) : '-'}`);
        }
      }
      console.log(`seed ${seed} river ${d.x0}-${d.x1} tail ${d.tail} speed ${d.speed} logClock ${((d.width + (0)) / d.speed).toFixed(2)} liana x ${Math.round(v.x)} (x1+${Math.round(v.x - d.x1)}) period ${P.toFixed(2)} logCatches ${logCatches(v, d)}`);
      console.log('   ' + row.join(' | '));
    }
  }
}
