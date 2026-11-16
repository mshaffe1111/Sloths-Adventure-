// ENG-S1: the FAR cap's inputs, measured. For World 1's FAR liana as gen2 lays it (1-6's kit, rng 1), the foot's release window
// (pipeline lianaRelease: the engine's pressWindow) onto a perch level with the bough, by its near end past the anchor and its width.
//   npx tsx reference/qa-reports/ENG-S1/cap.ts
import { layLocal, lianaRelease, planBudget, rngFor } from '../../../src/game/gen2/pipeline.ts';
import { generateAllLevels } from '../../../src/game/worldsData.ts';
import { w1World } from '../../../src/game/gen2/worlds/w1.ts';
import { W1_SWING_SECTIONS, withSwing } from '../../../src/game/gen2/worlds/w1Swing.ts';
const kit = withSwing(w1World());
const cfg = { ...generateAllLevels().find((l) => l.id === '1-6')!, unlocked: true };
for (const d of ['normal', 'easy'] as const) {
  const b = planBudget(cfg, kit.manifest, d);
  const L = layLocal(W1_SWING_SECTIONS.find((t) => t.id === 'w1-liana-far')!, b, rngFor(1));
  const [a, l] = ['a', 'l'].map((k) => L.pieces.find((q) => q.key === k)!);
  const v = { x: l.x, topY: l.y, bottomY: l.y + l.h }, sw = l.hang!.swing!;
  console.log(`${d}: liana len ${Math.round(l.h)} amp ${sw.amp.toFixed(3)} period ${sw.period.toFixed(2)}; window ms (grip low) by near end past the anchor x perch width`);
  for (const w of [100, 120, 140, 160, 200, 240]) {
    const row: string[] = [];
    for (let gap = 340; gap <= 580; gap += 20) row.push(`${gap}:${Math.round(1000 * lianaRelease(v, { amp: sw.amp, period: sw.period, grip: 'low' }, { x: l.x + gap, y: a.y, w }, d))}`);
    console.log(`  w ${String(w).padStart(3)}  ${row.join(' ')}`);
  }
}
