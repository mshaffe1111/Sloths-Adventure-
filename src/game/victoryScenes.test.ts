import { test } from 'node:test';
import assert from 'node:assert/strict';
import { victoryPanels } from './victoryScenes.ts';
import { BOSS_STORIES } from './story.ts';

test('a directed victory still says every line of the boss\'s own defeat dialogue, in order', () => {
  for (const w of [1]) {
    const panels = victoryPanels(w, 'Test Boss')!;
    assert.ok(panels, `world ${w} has a directed victory`);
    const spoken = panels.filter((p) => p.speaker !== 'Narrator').map((p) => `${p.speaker}|${p.text}`);
    assert.deepEqual(spoken, BOSS_STORIES[w].defeat.map((l) => `${l.speaker}|${l.text}`));
  }
});

test('every directed victory panel has a camera, in-bounds actors, and ordered pose timelines', () => {
  const panels = victoryPanels(1, 'Venom Fang')!;
  assert.ok(panels.length >= 3);
  for (const p of panels) {
    assert.ok(p.scene.camera, 'moves the camera');
    assert.ok(p.chapter.startsWith('VICTORY'));
    for (const a of p.scene.actors) {
      assert.ok(a.x >= 0 && a.x <= 1);
      const keys = a.seq ?? [];
      for (let i = 1; i < keys.length; i++) assert.ok(keys[i].at >= keys[i - 1].at, 'timeline is in time order');
    }
  }
});

test('worlds without a directed victory keep the plain card', () => {
  assert.equal(victoryPanels(2, 'Crocus Rex'), null);
});
