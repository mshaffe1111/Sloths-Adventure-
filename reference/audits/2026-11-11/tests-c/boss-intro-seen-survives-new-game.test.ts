/**
 * Audit C (boss slice): App.tsx marks a guardian's intro as seen under `sloth_story_b<world>` (bossIntroKey), and from then on
 * bossPanels(world, 'intro', name, true) plays the short retry intro (storyBosses.ts RETRY_INTRO_LINES: the General's nine-line
 * argument becomes two lines). The key is not one of saveFile.ts's ALLOWED entries (`sloth_story_[wmng]`), so a New Game
 * (resetProgress: "forget every stage result, the stories seen and the secret") leaves it set, a save file does not carry it, and
 * loading a save does not clear it. A new adventure on the same phone meets the General with the cut-down intro.
 */
import '../../../../src/game/bossPlayDom.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildSave, isSaveKey, resetProgress, type Store } from '../../../../src/game/saveFile.ts';
import { BOSS_STORIES, bossPanels } from '../../../../src/game/storyBosses.ts';

function mapStore(init: Record<string, string>): Store {
  const m = new Map(Object.entries(init));
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v), removeItem: (k) => void m.delete(k), keys: () => [...m.keys()] };
}
/** App.tsx bossIntroKey / hasSeenBossIntro, word for word */
const bossIntroKey = (w: number) => `sloth_story_b${w}`;
const hasSeenBossIntro = (s: Store, w: number) => s.getItem(bossIntroKey(w)) === '1';

test('a New Game forgets that the General\'s intro was seen: the first meeting plays the whole argument', () => {
  const s = mapStore({ [bossIntroKey(10)]: '1', sloth_story_w10: '1', 'sloth_lvl_10-9': '{"stars":3}' });
  resetProgress(s);
  assert.equal(s.getItem('sloth_story_w10'), null, 'the world story flag is forgotten (the control)');
  const panels = bossPanels(10, 'intro', 'General Iron-Claw', hasSeenBossIntro(s, 10));
  assert.equal(panels.length, BOSS_STORIES[10].intro.length, `a new adventure's first meeting plays all ${BOSS_STORIES[10].intro.length} lines, not the retry's ${panels.length}`);
});

test('the intro-seen flag is part of the saved game (it travels in a save file)', () => {
  assert.ok(isSaveKey(bossIntroKey(10)), 'sloth_story_b10 is a save key');
  const save = buildSave(mapStore({ [bossIntroKey(10)]: '1' }));
  assert.equal(save.data[bossIntroKey(10)], '1');
});
