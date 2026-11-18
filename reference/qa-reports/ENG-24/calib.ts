// npx tsx reference/qa-reports/ENG-24/calib.ts  (ENG-24: riverLay lianaDrops against the designer's real-engine flight, swingLog.ts)
import { setDifficulty } from '../../../src/game/difficulty.ts';
import { setTimedSwing, TIMED } from '../../../src/game/physics.ts';
import { layRiver, lianaDrops, type RiverRow } from '../../../src/game/gen2/riverLay.ts';
import { W2_RIVERS } from '../../../src/game/gen2/worlds/w2.ts';
import type { Vine } from '../../../src/game/types.ts';

const ROWS: Record<string, RiverRow> = { ...W2_RIVERS, lashed: { dir: 1, speed: 60, logW: 300, logs: 2 }, gap200: { dir: 1, speed: 100, logW: 150, logs: 2, gap: 200 }, gap280: { dir: 1, speed: 110, logW: 150, logs: 2, gap: 280 } };
for (const d of ['normal', 'easy'] as const) {
  setDifficulty(d);
  setTimedSwing(d === 'easy');
  for (const [name, row] of Object.entries(ROWS)) {
    let id = 100;
    const { logs } = layRiver(row, 2000, 800, () => id++);
    const v = { id: 50, x: 2165, topY: 390, bottomY: 800, vineType: 'swing_liana', isSwingingVine: true, swingAmp: 0.45, swingPeriod: TIMED.period, swingPhase: 0 } as unknown as Vine;
    const t0 = Date.now();
    const r = lianaDrops(v, logs.map((p) => p.drift!), d);
    console.log(`${d.padEnd(6)} ${name.padEnd(7)} share ${Math.round(r.share * 100)}% wait ${r.wait.toFixed(2)} s (swing ${r.period}) ${Date.now() - t0} ms`);
  }
}
