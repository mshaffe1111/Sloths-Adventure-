/**
 * Audit C (audio), 2026-11-11. Two rules in the story's sound are keyed to a chapter TITLE, "THE STORM...", that no story has any more
 * (the storm scenes are now 'THE CHASE' and 'THE VOW' in the intro and 'THE TOWER' in the finale, all with mood/particles of rain):
 *   - game/audio.ts storyPanel: the thunderstorm ambience plays only under a chapter that starts 'THE STORM' -> never;
 *   - audio/scenes.ts sceneForPanel: its chapter-title table (PROLOGUE, MEMORY, THE SONG, THE REVEAL, THE STORM, THE VOW...) is only
 *     read for a panel with no cue, and no such panel has those titles: three recorded pieces (3.7 MB packed in the app) never play.
 * Each test asserts the CORRECT behaviour and fails today.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const g = globalThis as unknown as Record<string, unknown>;
g.window ??= { setTimeout: () => 0, clearTimeout: () => {}, addEventListener: () => {}, location: { search: '' } };
g.localStorage ??= { getItem: () => null, setItem: () => {} };
g.document ??= { hidden: false, addEventListener: () => {} };

const { sound } = await import('../../../../src/game/audio.ts');
const { sceneForPanel, sceneForScreen } = await import('../../../../src/audio/scenes.ts');
const { INTRO_PANELS, WORLD_STORIES, WORLD_MID, WORLD_GATE, ENDING_PANELS, bossPanels, thornbarkPanels } = await import('../../../../src/game/story.ts');
const { MEMORIES, MEMORY_ORDER, finalePanels, endTagPanels } = await import('../../../../src/game/storyChapters.ts');
import type { StoryPanel } from '../../../../src/game/story.ts';

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
  } finally {
    c.setAmbient = was.a;
    c.setScene = was.s;
    c.warmStoryStings = was.w;
  }
});

test('every recorded piece packed in the app can be asked for by something', () => {
  const manifest = JSON.parse(readFileSync(new URL('../../../../src/assets/music/manifest.json', import.meta.url), 'utf8')) as { pieces: Record<string, { stems: Record<string, string> }>; stages: Record<string, string[]> };
  const used = new Set<string>();
  for (const p of all) used.add(sceneForPanel(p).id);
  for (const list of Object.values(manifest.stages)) for (const id of list) used.add(id);
  for (let w = 1; w <= 10; w++) {
    for (const s of ['title', 'satchel', 'world_map', 'victory', 'game_over', 'story_ending']) used.add(sceneForScreen(s, w, false)!.id);
    used.add(sceneForScreen('playing', w, true, `${w}-10`)!.id);
  }
  used.add(sceneForScreen('playing', 5, false, '5-M')!.id);
  const never = Object.keys(manifest.pieces).filter((id) => !used.has(id));
  assert.deepEqual(never, [], 'recorded and packed, but no screen, stage or story picture asks for them');
});
