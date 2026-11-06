// The reach check never links a straight fall onto a piece lying under a continuous road (the lead, 11-05: Matt could not reach two
// petals on gen2 1-1 Roll C's low log under its end road, which the check passed; levelCheck.ts roofedDrop). Planted on the real build.
import test from 'node:test';
import assert from 'node:assert/strict';
import './headlessDom.ts';
import { generateAllLevels } from './worldsData.ts';
import { validateStage } from './levelCheck.ts';
import { buildGen2Stage } from './gen2/pipeline.ts';
import { w1World } from './gen2/worlds/w1.ts';

test('a log wholly under a continuous road is out of reach; a log under a road with an open edge close by is not (gen2 1-1 seed 118786)', () => {
  const config = generateAllLevels().find((l) => l.id === '1-1')!;
  const st: any = buildGen2Stage({ config, kit: w1World(), seed: 118786, difficulty: 'normal' });
  // (the end: log 153 and branch 152 run on into the end bank, so the low log under them has no open edge within 700 px; the log under
  // 140 is reached off 140's open end and back, 109 px, as the real engine's bot lands it)
  const end = st.platforms.find((p: any) => p.style === 'log' && p.height === 24 && st.platforms.some((q: any) => q.y < p.y - 100 && q.x <= p.x && q.x + q.width >= p.x + p.width && q.x > st.exitTotemX - 1400));
  assert.ok(end, 'the roofed low log');
  // (planted where the shared petal pass laid two on the test link, 34 px over the log: it trusted this check's reach)
  const on = [0.1, 0.75].map((t, i) => ({ id: 9001 + i, type: 'flower', x: Math.round(end.x + t * end.width), y: end.y - 34, collected: false, bobPhase: 0 }));
  st.collectibles.push(...on);
  const v = validateStage(st, { rooms: false });
  assert.ok(!v.reachableIds.includes(end.id), 'the roofed low log is not reached');
  for (const c of on) assert.ok(v.errors.some((e: string) => e.includes(`#${c.id} `) && /out of reach/.test(e)), `petal #${c.id} named out of reach: ${v.errors.join('; ')}`);
});
