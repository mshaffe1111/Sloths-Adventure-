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
