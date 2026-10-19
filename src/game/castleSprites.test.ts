import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CASTLES, FORTRESS_CASTLE } from './castleSprites.ts';
import { ENDING_PANELS, INTRO_PANELS, WORLD_STORIES } from './story.ts';

test('the fortress castle exists and every castle stands inside its painting', () => {
  assert.ok(CASTLES[FORTRESS_CASTLE]);
  for (const [n, c] of Object.entries(CASTLES)) {
    assert.ok(c.x > 0.1 && c.x < 0.9, `castle ${n}`);
    assert.ok(c.name.length > 0);
  }
});

test('every castle a story picture asks for is one that ships', () => {
  const scenes = [
    ...INTRO_PANELS.map((p) => p.scene),
    ...ENDING_PANELS.map((p) => p.scene),
    ...Object.values(WORLD_STORIES).flatMap((w) => w.panels.map((p) => p.scene)),
  ];
  for (const s of scenes) if (s.castle !== undefined) assert.ok(CASTLES[s.castle], `castle ${s.castle}`);
});
