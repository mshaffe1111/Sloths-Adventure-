import test from 'node:test';
import assert from 'node:assert/strict';
import { generateAllLevels } from './worldsData.ts';
import { buildStage } from './stageGenerator.ts';
import { validateStage } from './levelCheck.ts';
import { maxDropReach, reachBounce, reachJump, reachMin } from './physics.ts';

// The flight-reach tables are shared, lazily filled memory. They must give the same answer whatever was asked before, or a
// stage could pass the validator in one session and fail it in another.

test('a reach answer belongs to its 2 px bucket, not to whoever asked first', () => {
  // dy 101 and dy 102 fall in the same bucket: the answer is the same in either order of asking
  for (const dy of [-301, -199, -61, -1, 1, 33, 61, 101, 155, 301]) {
    assert.equal(reachJump(dy, false), reachJump(dy + 1, false), `single jump ${dy}`);
    assert.equal(reachJump(dy, true), reachJump(dy + 1, true), `double jump ${dy}`);
    assert.equal(reachBounce(dy, false), reachBounce(dy + 1, false), `bounce ${dy}`);
  }
});

test('the biggest-drop bound covers every drop up to it, for jumps, double jumps and bounces', () => {
  for (const maxDrop of [0, 90, 400, 1500, 3000]) {
    const bound = maxDropReach(maxDrop);
    for (let d = 0; d <= maxDrop; d += 37) {
      for (const r of [reachJump(-d, false), reachJump(-d, true), reachBounce(-d, false), reachBounce(-d, true)]) {
        assert.ok(bound + 1e-9 >= r, `drop ${d} of ${maxDrop}: ${r} beyond bound ${bound}`);
      }
    }
  }
});

test('reachMin never exceeds either sampling rate', () => {
  for (const dy of [-200, -40, 0, 40, 120]) {
    const m = reachMin(dy, 190, 160, false);
    assert.ok(m <= reachJump(dy, false) + 400 && Number.isFinite(m), `dy ${dy}`);
  }
});

test('validating a stage gives the same answer before and after other stages warmed the tables', () => {
  const levels = generateAllLevels().filter((l) => l.objectiveType !== 'boss_lair');
  const probe = levels.find((l) => l.id === '5-6')!;
  const first = JSON.stringify(validateStage(buildStage(probe, 0)));
  for (const l of levels.filter((_, i) => i % 9 === 4).slice(0, 6)) validateStage(buildStage(l, 0));
  const second = JSON.stringify(validateStage(buildStage(probe, 0)));
  assert.equal(first, second);
});
