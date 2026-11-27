// npx tsx --test tools/engine/storyTipScan.test.ts: the laid-line gate's own test (R-165.412, WARN-412). On 2-1 as the game builds it,
// every laid line is said on Tips (Normal's default), its water warning a must; with the data's marks taken off (the escape as it
// shipped: the warning laid as plain words), the gate fails by name: the water warning as 'info', the story beats with it.
import '../../src/game/headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from '../../src/game/realPlay.ts';
import { setDifficulty } from '../../src/game/difficulty.ts';
import { provenSeeds } from '../../src/game/gen2/seedList.ts';
import { W2_TIPS } from '../../src/game/gen2/worlds/w2.ts';
import { engineGuideLine } from '../../src/game/dotLines.ts';
import type { StageHint } from '../../src/game/protoStage.ts';
import { droppedOnTips } from './storyTipScan.ts';

const STAGE = '2-1';
function laid(): StageHint[] {
  setDifficulty('normal');
  const r = new RealPlay(STAGE, provenSeeds(STAGE)[0] ?? 1);
  return (r.e as unknown as { proto?: { hints?: StageHint[] } }).proto?.hints ?? [];
}

test('2-1 on Normal: the water warning is laid as a warning (a must) and every laid line is said on Tips', () => {
  const hints = laid();
  const water = hints.find((h) => h.text === W2_TIPS.water);
  assert.ok(water, `2-1 lays its water warning: ${hints.map((h) => h.text).join(' / ')}`);
  assert.equal(water.warn, true);
  assert.equal(engineGuideLine(water.text, STAGE, { dot: true, warn: water.warn })?.kind, 'must');
  assert.ok(hints.some((h) => h.story), 'its story beats are laid as story lines');
  assert.deepEqual(droppedOnTips(STAGE, hints), []);
});

test('planted: the marks taken off (the warning laid as plain words), the gate fails by name, the warning as info', () => {
  const bare = laid().map(({ warn: _w, story: _s, ...h }) => h as StageHint);
  const d = droppedOnTips(STAGE, bare);
  assert.ok(d.some((l) => l.kind === 'info' && l.text === W2_TIPS.water), d.map((l) => `${l.kind} | ${l.text}`).join('\n'));
  assert.ok(d.length >= 2, `the story beats drop with it: ${d.length}`);
});
