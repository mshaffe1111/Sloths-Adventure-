// TIPS: the 1-1 first-run lock's drift is the bands alone. Builds FIRST_RUN_11 (seed 9652) on both settings as seedlist --check does
// (stageParts hashed), then again with every hint's `band` taken off: that hash must equal the recorded lock; and every part but
// proto.hints must be identical between the two builds.   npx tsx reference/qa-reports/TIPS/firstrun-lock.ts
import { createHash } from 'node:crypto';
import '../../../src/game/headlessDom.ts';
import { generateAllLevels } from '../../../src/game/worldsData.ts';
import { buildGen2Stage } from '../../../src/game/gen2/pipeline.ts';
import { stageParts } from '../../../src/game/gen2/seedList.ts';
import { listedStage } from '../../../src/game/gen2/listed.ts';
import { FIRST_RUN_11 as L } from '../../../src/game/gen2/firstRun11.ts';
const h = (x: unknown) => createHash('sha256').update(JSON.stringify(x)).digest('hex').slice(0, 16);
const cfg = generateAllLevels().find((l) => l.id === '1-1')!;
const row = listedStage('1-1')!;
/** the lock before TIPS re-recorded it (firstRun11.ts at t-int-8@0a9be28c) */
const OLD = { normal: '598f2cf9d031bb9f', easy: 'faba40c194f515f7' } as const;
let ok = true;
for (const difficulty of ['normal', 'easy'] as const) {
  const st = buildGen2Stage({ config: cfg, kit: row.kit(), seed: L.seed, difficulty, replay: { seed: L.seed, plan: L.plan, rerolls: L.rerolls, foes: L.foes } });
  const now = stageParts(st);
  const hints = (st.proto as unknown as { hints: Array<Record<string, unknown>> }).hints;
  const bare = { ...st, proto: { ...st.proto, hints: hints.map(({ band: _b, ...rest }) => rest) } } as unknown as typeof st;
  const was = stageParts(bare);
  const moved = Object.keys(now).filter((k) => now[k] !== was[k]);
  const without = h(was), withBands = h(now);
  console.log(`${difficulty}: with bands ${withBands} (recorded now ${L.lock[difficulty]}); bands taken off ${without} (the old lock ${OLD[difficulty]}); parts moved by the bands: ${moved.join(', ') || 'none'}`);
  if (without !== OLD[difficulty] || withBands !== L.lock[difficulty] || moved.join() !== 'proto.hints') ok = false;
}
console.log(ok ? 'PASS: the drift is proto.hints (the bands) alone' : 'FAIL');
process.exit(ok ? 0 : 1);
