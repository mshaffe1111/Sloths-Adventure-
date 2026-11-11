import { flickWindow } from '../flight.ts';
import { gapFor, planBudget } from '../../../gen2/pipeline.ts';
import { w1World } from '../../../gen2/worlds/w1.ts';
import { generateAllLevels } from '../../../worldsData.ts';
import { TAKEOFF } from '../../../gen2/reach.ts';
const cfg = { ...generateAllLevels().find((l) => l.id === '1-1')!, unlocked: true };
for (const s of ['normal', 'easy'] as const) {
  const b = planBudget(cfg, w1World().manifest, s);
  console.log(`\n${s}: single jump, the builder's envelope gapFor(rise) on 1-1; flick window = furthest before the lip a flick still lands (rule: ${TAKEOFF[s]} px)`);
  for (const rise of [0, 10, 20, 21, 30, 40, 50, 60, 63, 70, 80]) {
    if (s === 'easy' && rise > 63) continue;
    const g = Math.round(gapFor(rise, false, b));
    const row = [1, 0.9, 0.75, 0.6].map((sh) => { const gap = Math.max(60, Math.round(g * sh)); return `${sh}:${gap}px blk ${flickWindow(s, { rise, gap, thin: false })} thin ${flickWindow(s, { rise, gap, thin: true })}`; });
    console.log(`rise ${String(rise).padStart(2)} env ${g} | ` + row.join(' | '));
  }
}
