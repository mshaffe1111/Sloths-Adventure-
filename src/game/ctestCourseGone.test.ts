/**
 * R-165.151: the old control course is gone (new replaces old). A tester on the #ctest link who walks to 1-2 from the map plays the real
 * 1-2 (gen2, its own row), never the 2026-10-24 control course; the picture sheets 1-2 asks for are the same with #ctest as without.
 * Planted: with stageGenerator.ts's control-course line back, the #ctest build of 1-2 is the old course and this fails.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import './headlessDom.ts';
import { generateStage, setLayoutVariant } from './stageGenerator.ts';
import { ctestEnabled } from './playRecorder.ts';
import { stageSheets } from './stageSheets.ts';
import { generateAllLevels } from './worldsData.ts';

const lvl = (id: string) => ({ ...generateAllLevels().find((l) => l.id === id)!, unlocked: true });
const loc = globalThis as unknown as { location: { hash: string; search: string } };

function withCtest<T>(fn: () => T): T {
  const was = loc.location.hash;
  loc.location.hash = '#ctest';
  try {
    assert.equal(ctestEnabled(), true, 'the #ctest link is on');
    return fn();
  } finally {
    loc.location.hash = was;
  }
}

for (const difficulty of ['normal', 'easy'] as const) {
  test(`#ctest's 1-2 is the real 1-2, the same stage as without #ctest (${difficulty}, layouts 1-3)`, () => {
    for (const v of [1, 2, 3]) {
      setLayoutVariant(v);
      const plain = generateStage(lvl('1-2'), difficulty);
      setLayoutVariant(v);
      const ct = withCtest(() => generateStage(lvl('1-2'), difficulty));
      assert.equal((ct as { proto?: { mix?: string } }).proto?.mix, undefined, 'no control-course mix');
      assert.equal(ct.platforms.length, plain.platforms.length, `layout ${v}: the same platforms`);
      assert.deepEqual(ct.platforms.map((p) => [p.x, p.y, p.width, p.height]), plain.platforms.map((p) => [p.x, p.y, p.width, p.height]), `layout ${v}`);
    }
  });
}

test("#ctest asks for 1-2's own sheets, nothing of the control course's (World 2's river, its four creatures)", () => {
  const sw = { hand: true, paint: true };
  const plain = stageSheets(lvl('1-2'), sw);
  assert.deepEqual(withCtest(() => stageSheets(lvl('1-2'), sw)), plain);
  assert.ok(!plain.includes('w2-props'), 'no river sheet for 1-2');
});
