// E3: every stage the engine builds from its spec stands up on every layout and both settings: no piece that never floats with open
// air under its drawn body, no tree piece without a trunk, no water piece off drawn water (support.ts, on terrain's own footing)
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { generateAllLevels } from '../worldsData.ts';
import { generateStage, setLayoutVariant } from '../stageGenerator.ts';
import { easyStage } from '../easyMode.ts';
import { withGoals } from '../goals.ts';
import { SPECS } from './stages.ts';
import { supportBreaches } from './support.ts';

test('every engine-built stage stands up: 16 layouts, Normal and Easy', () => {
  const levels = generateAllLevels();
  for (const { id } of SPECS) {
    const c = levels.find((l) => l.id === id)!;
    for (const setting of ['normal', 'easy'] as const) for (let v = 1; v <= 16; v++) {
      setLayoutVariant(v);
      const st: any = setting === 'easy' ? easyStage(withGoals(generateStage({ ...c, unlocked: true }, 'easy'))) : withGoals(generateStage({ ...c, unlocked: true }, 'normal'));
      setLayoutVariant(null);
      const b = supportBreaches(st, c.worldIndex);
      assert.equal(b.length, 0, `${id} ${setting} layout ${v}: ${b.slice(0, 3).map((x) => `${x.kind} x ${Math.round(x.x)} (${x.drawn}, air ${x.air}): ${x.why}`).join('; ')}`);
    }
  }
});

test('a stone step seated on a deep bank stands; the same stone moved over air still FAILS (planted, on a real gen2 World 1 build)', async () => {
  const { footingsFor } = await import('../terrain.ts');
  const { buildGen2Stage } = await import('../gen2/pipeline.ts');
  const { w1World } = await import('../gen2/worlds/w1.ts');
  const config = generateAllLevels().find((l) => l.id === '1-1')!;
  // (a thin piece's look is a weighted pick over the stage (platformPlan.ts): find a stone seated on a bank that the plan draws as a
  // floating island's earth, its drawn earth reaching under its foot into the bank, as gen2 1-1's rolls drew theirs)
  let found: { st: any; p: any } | undefined;
  for (let seed = 1; seed <= 24 && !found; seed++) {
    const st: any = buildGen2Stage({ config, kit: w1World(), seed, difficulty: 'normal' });
    const f = footingsFor(st, 1);
    const p = st.platforms.find((q: any) => f.get(q.id)?.drawn === 'island-earth' && f.get(q.id)!.bodyBottom > q.y + q.height + 8
      && st.platforms.some((b: any) => b !== q && b.height >= 200 && Math.abs(b.y - (q.y + q.height)) <= 2 && b.x <= q.x && b.x + b.width >= q.x + q.width));
    if (p) found = { st, p };
  }
  assert.ok(found, 'no seated island-earth stone in gen2 1-1 seeds 1-24');
  const { st, p } = found;
  assert.deepEqual(supportBreaches(st, 1).filter((b) => b.id === p.id), [], 'the seated stone stands');
  // (planted: the same stone lifted 60 px off its bank, open air under it: still a breach)
  const lifted = { ...st, platforms: st.platforms.map((q: any) => (q === p ? { ...q, y: q.y - 60 } : q)) };
  assert.deepEqual(supportBreaches(lifted, 1).filter((b) => b.id === p.id).map((b) => b.id), [p.id], 'lifted, it floats');
});
