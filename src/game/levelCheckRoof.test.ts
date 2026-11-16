// The reach check never links a straight fall onto a piece lying under a continuous road (the lead, 11-05: Matt could not reach two
// petals on gen2 1-1 Roll C's low log under its end road, which the check passed; levelCheck.ts roofedDrop). Planted on the real build.
import test from 'node:test';
import assert from 'node:assert/strict';
import './headlessDom.ts';
import { generateAllLevels } from './worldsData.ts';
import { validateStage } from './levelCheck.ts';
import { buildGen2Stage } from './gen2/pipeline.ts';
import { w1World } from './gen2/worlds/w1.ts';
import { provenPlan, provenSeeds } from './gen2/seedList.ts';

test('a log wholly under a continuous road is out of reach; a log under a road with an open edge close by is not (gen2 1-1, a listed layout)', () => {
  const config = generateAllLevels().find((l) => l.id === '1-1')!;
  // (the first listed layout whose end road runs on unbroken 250 px and more west of the end bank's face: found from the list, never copied.
  // Re-pinned by POLISH-9b (R-165.228): raw 118786 drew sprint-B or -C, and with 1-1 on A and D its end lays another road)
  const roadOver = (st: any) => {
    const bank = st.platforms.find((p: any) => p.x <= st.exitTotemX && p.x + p.width >= st.exitTotemX && Math.abs(p.y - st.exitTotemY) < 6);
    return bank && st.platforms.some((p: any) => p !== bank && Math.abs(p.y - bank.y) < 3 && p.x <= bank.x - 250 && p.x + p.width >= bank.x - 4);
  };
  let st: any;
  for (const seed of provenSeeds('1-1')) {
    const b = buildGen2Stage({ config, kit: w1World(), seed, difficulty: 'normal', replay: provenPlan('1-1', seed) });
    if (roadOver(b)) { st = b; break; }
  }
  assert.ok(st, 'a listed layout whose end road runs on over the spot');
  // (the end: log 153 and branch 152 run on into the end bank, so the low log under them has no open edge within 700 px; the log under
  // 140 is reached off 140's open end and back, 109 px, as the real engine's bot lands it)
  // (planted where quiet-arrival's low log lay on the test link: 142 px under the end road, 300-490 px west of the end bank's face, the
  // road running on unbroken over it; the section no longer lays it)
  const bank = st.platforms.find((p: any) => p.x <= st.exitTotemX && p.x + p.width >= st.exitTotemX && Math.abs(p.y - st.exitTotemY) < 6);
  const end: any = { id: 9000, x: bank.x - 250, y: bank.y + 142, width: 189, height: 24, type: 'solid', style: 'log' };
  assert.ok(st.platforms.some((p: any) => p !== bank && Math.abs(p.y - bank.y) < 3 && p.x <= end.x && p.x + p.width >= bank.x - 4), 'the road runs on over it');
  st.platforms.push(end);
  assert.ok(end, 'the roofed low log');
  // (planted where the shared petal pass laid two on the test link, 34 px over the log: it trusted this check's reach)
  const on = [0.1, 0.75].map((t, i) => ({ id: 9001 + i, type: 'flower', x: Math.round(end.x + t * end.width), y: end.y - 34, collected: false, bobPhase: 0 }));
  st.collectibles.push(...on);
  const v = validateStage(st, { rooms: false });
  assert.ok(!v.reachableIds.includes(end.id), 'the roofed low log is not reached');
  for (const c of on) assert.ok(v.errors.some((e: string) => e.includes(`#${c.id} `) && /out of reach/.test(e)), `petal #${c.id} named out of reach: ${v.errors.join('; ')}`);
});
