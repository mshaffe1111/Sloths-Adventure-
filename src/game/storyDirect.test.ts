import test from 'node:test';
import assert from 'node:assert/strict';
import { directScene, pagesOf, PAGE_MAX, strayOverrides } from './storyDirect.ts';
import { INTRO_PANELS, WORLD_STORIES, WORLD_MID, WORLD_GATE, ENDING_PANELS, bossPanels, thornbarkPanels } from './story.ts';
import { MEMORIES, MEMORY_ORDER } from './storyChapters.ts';
import type { StoryPanel } from './story.ts';

const scenes: StoryPanel[][] = [
  INTRO_PANELS, ENDING_PANELS, thornbarkPanels('intro'), thornbarkPanels('defeat'),
  ...Object.values(WORLD_STORIES).map((w) => w.panels), ...Object.values(WORLD_MID), ...Object.values(WORLD_GATE),
  ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].flatMap((w) => [bossPanels(w, 'intro', 'boss'), bossPanels(w, 'defeat', 'boss')]),
  ...MEMORY_ORDER.map((id) => MEMORIES[id].panels ?? []),
];

test('every hand-directed line still matches a line of the script (a changed line would lose its direction silently)', () => {
  assert.deepEqual(strayOverrides(scenes.flat()), []);
});

test('pages keep every word, in order, and none is a wall of text', () => {
  for (const p of scenes.flat()) {
    const pages = pagesOf(p.text);
    assert.equal(pages.join(' ').replace(/\s+/g, ' '), p.text.replace(/\s+/g, ' '));
    if (pages.length > 1) for (const g of pages) assert.ok(g.length <= PAGE_MAX + 40, `${g.length}: ${g}`);
  }
});

test('every picture gets a sane delivery: a beat under 1.6 s, a reading pace, a camera that never zooms past the cap', () => {
  for (const sc of scenes) {
    const ds = directScene(sc);
    assert.equal(ds.length, sc.length);
    ds.forEach((d, i) => {
      assert.ok(d.beat >= 0 && d.beat <= 1600, `beat ${d.beat}`);
      assert.ok(d.typeMs >= 18 && d.typeMs <= 80, `type ${d.typeMs}`);
      if (d.camera) assert.ok(d.camera.to.zoom <= 2.6 && d.camera.from.zoom <= 2.6);
      if (i === 0) assert.equal(d.enter, 'dip', 'a scene opens from dark');
    });
  }
});

test('a scene in one place cuts instead of blinking to black on every line', () => {
  const ds = directScene(WORLD_MID[6]);
  assert.ok(ds.filter((d) => d.enter === 'cut').length >= ds.length - 3);
});

test('the big silences are silent, and the lullaby is sung, not babbled', () => {
  const tea = WORLD_MID[6].findIndex((p) => p.speaker === 'Pokey' && p.text.startsWith('We stopped for tea'));
  assert.equal(directScene(WORLD_MID[6])[tea].music, 'silence');
  const ds = directScene(ENDING_PANELS);
  const knock = ENDING_PANELS.findIndex((p) => p.text === 'I should have knocked.');
  assert.equal(ds[knock].music, 'silence');
  const song = ENDING_PANELS.findIndex((p) => p.text.includes('♪'));
  assert.ok(ds[song].tone.silent);
});
