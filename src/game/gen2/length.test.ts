// A rolled stage has no length ceiling (the red team, 11-05, RT-ENGINE #7; Matt: "at least 2:00, no cap"): its length comes from its
// section count, held only to the floors. planBudget's ceiling (target x 1.1, 153 s for 1-1, under the 1-1 floor's own typical) trimmed
// every roll toward the floor and shipped the rest with a "ships long" note. Planted: 1-1's rolls carried those notes.
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { buildGen2Stage } from './pipeline.ts';
import { w1World } from './worlds/w1.ts';
import { generateAllLevels } from '../worldsData.ts';

test('a rolled 1-1 is never trimmed toward the floor nor called long (8 seeds), and still meets the floors', () => {
  const c = generateAllLevels().find((l) => l.id === '1-1')!;
  for (const seed of Array.from({ length: 8 }, (_, i) => 1 + i * 7919)) {
    const st = buildGen2Stage({ config: c, kit: w1World(), seed, difficulty: 'normal' });
    const notes = st.gen2.repairs.filter((r) => r.kind === 'length').map((r) => r.note);
    assert.ok(!notes.some((n) => /one section fewer|ships long|ceiling/.test(n)), `seed ${seed}: ${notes.join(' | ')}`);
  }
});
