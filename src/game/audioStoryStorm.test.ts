/**
 * Audit C (audio) #4, 2026-11-11. The story's thunderstorm ambience was keyed to a chapter TITLE, "THE STORM...", that no story has any
 * more (the storm scenes are now 'THE CHASE' and 'THE VOW' in the intro and 'THE TOWER' in the finale, all with the 'storm' mood):
 * game/audio.ts storyPanel never asked for it. It now follows the picture's own mood.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

const g = globalThis as unknown as Record<string, unknown>;
g.window ??= { setTimeout: () => 0, clearTimeout: () => {}, addEventListener: () => {}, location: { search: '' } };
g.localStorage ??= { getItem: () => null, setItem: () => {} };
g.document ??= { hidden: false, addEventListener: () => {} };

const { sound } = await import('./audio.ts');
const { INTRO_PANELS, WORLD_STORIES, WORLD_MID, WORLD_GATE, ENDING_PANELS, bossPanels, thornbarkPanels } = await import('./story.ts');
const { MEMORIES, MEMORY_ORDER, finalePanels, endTagPanels } = await import('./storyChapters.ts');
import type { StoryPanel } from './story.ts';

const scenes: StoryPanel[][] = [
  INTRO_PANELS, ENDING_PANELS, thornbarkPanels('intro'), thornbarkPanels('defeat'), finalePanels([]), endTagPanels(['w8_keepsake'], true),
  ...Object.values(WORLD_STORIES).map((w) => w.panels), ...Object.values(WORLD_MID), ...Object.values(WORLD_GATE),
  ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].flatMap((w) => [bossPanels(w, 'intro', 'boss'), bossPanels(w, 'defeat', 'boss')]),
  ...MEMORY_ORDER.map((id) => MEMORIES[id].panels ?? []),
];
const all = scenes.flat();

test('the storm pictures of the story have the storm around them (the thunderstorm ambience)', () => {
  const c = (sound as unknown as { c: { setAmbient: (t: string | null) => void; setScene: () => void; warmStoryStings: () => void } }).c;
  const asked = new Map<string, number>();
  const was = { a: c.setAmbient, s: c.setScene, w: c.warmStoryStings };
  let last = '';
  c.setAmbient = (t) => void (last = String(t));
  c.setScene = () => {};
  c.warmStoryStings = () => {};
  try {
    const stormy = all.filter((p) => p.scene.mood === 'storm');
    assert.ok(stormy.length > 20, `the story has ${stormy.length} pictures in a storm`);
    for (const p of stormy) {
      sound.storyPanel(p);
      asked.set(last, (asked.get(last) ?? 0) + 1);
    }
    assert.ok((asked.get('thunderstorm') ?? 0) > 0, `of ${stormy.length} storm pictures, the ambience asked for was ${JSON.stringify([...asked])}`);
    assert.equal(asked.get('thunderstorm'), stormy.length, 'every storm picture has the storm around it');
    // and the quiet pictures after it do not keep the thunder
    for (const p of all.filter((x) => x.scene.mood !== 'storm')) {
      sound.storyPanel(p);
      assert.equal(last, 'gentle_breeze', `"${p.chapter}" (${p.scene.mood})`);
    }
  } finally {
    c.setAmbient = was.a;
    c.setScene = was.s;
    c.warmStoryStings = was.w;
  }
});
