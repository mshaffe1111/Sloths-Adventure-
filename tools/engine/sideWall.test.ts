/**
 * R-165.434's planted check (tools/engine/sideWall.ts, wired into paintcheck.ts): 2-6 as main builds it has no side-on wall painted as
 * bank soil (GREEN); the same stage with one of BUILD-26q's soft-pit faces added (b6a35d7e8: a 24 x 94 moss_stone solid, its sides open)
 * is RED on exactly that block; the same block at 60 px wide (wider than his body, 44) is GREEN, so the limit is the one named.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import '../../src/game/headlessDom.ts';
import type { Platform } from '../../src/game/types.ts';

// (every sheet "arrives" at once, as paintcheck.ts sets it: the painters decide as they do once the art is in)
(globalThis as Record<string, unknown>).Image = class {
  onload: null | (() => void) = null;
  onerror: null | (() => void) = null;
  width = 1; height = 1; naturalWidth = 1; naturalHeight = 1; complete = true;
  set src(_u: string) { this.onload?.(); }
  decode() { return { then: (ok: () => void) => ok() }; }
};

test('a side-on wall painted as bank soil is caught: 2-6 GREEN as built, RED with a 24 x 94 face, GREEN at 60 wide', async () => {
  const { generateAllLevels } = await import('../../src/game/worldsData.ts');
  const { generateStage, setLayoutVariant } = await import('../../src/game/stageGenerator.ts');
  const { withGoals } = await import('../../src/game/goals.ts');
  const { loadSeedList } = await import('../../src/game/gen2/seedList.ts');
  const { stagePaintInput } = await import('./paintStage.ts');
  const { sideWalls } = await import('./sideWall.ts');
  const c = generateAllLevels().find((l) => l.id === '2-6')!;
  await loadSeedList('2-6');
  setLayoutVariant(0);
  const st = withGoals(generateStage({ ...c, unlocked: true }, 'normal'));
  setLayoutVariant(null);
  const inp = stagePaintInput(st, c)!;
  assert.ok(inp, '2-6 paints its ground');
  assert.deepEqual(sideWalls(st.platforms, inp.f), [], 'main 2-6 as built: no side-on wall painted as soil');
  // (in open air above the stage's lowest piece's top: nothing touches its sides)
  const low = st.platforms.reduce((a, b) => (b.y > a.y ? b : a));
  const face = (w: number): Platform => ({ id: 987654, x: low.x + 4, y: low.y - 400, width: w, height: 94, type: 'solid', style: 'moss_stone' } as Platform);
  const red = sideWalls([...st.platforms, face(24)], inp.f);
  assert.ok(red.length >= 1 && red.every((b) => b.id === 987654), `the 24 x 94 face is caught, and only it: ${JSON.stringify(red)}`);
  assert.deepEqual(sideWalls([...st.platforms, face(60)], inp.f), [], 'a block wider than his body (44) is a bank the painter draws');
});
