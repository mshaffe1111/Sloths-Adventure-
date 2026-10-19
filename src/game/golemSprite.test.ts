import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GOLEM_FRAMES } from './golemAtlasData.ts';
import { readFileSync } from 'node:fs';

// every pose the boss brain can ask for in golemSprite.ts
const USED = [
  'hurt', 'defeat1', 'defeat2', 'stunned', 'awaken', 'enrage', 'charge2', 'roar', 'tremor', 'doublefist', 'shards', 'quake',
  'march1', 'march2', 'march3',
];

test('every pose the Golem pick asks for is in the atlas', () => {
  for (const n of USED) assert.ok(GOLEM_FRAMES[n], `frame ${n}`);
});

test('each frame has a size and a body anchor on the ground line', () => {
  for (const [n, f] of Object.entries(GOLEM_FRAMES)) {
    assert.ok(f.w > 8 && f.h > 8, `${n} size`);
    assert.ok(Number.isFinite(f.ax) && Number.isFinite(f.ay), `${n} anchor`);
  }
});

test('the story card poses for world 7 exist', () => {
  // bossArt.ts pulls in the canvas art, so read the pose list from its source
  const src = readFileSync(new URL('./bossArt.ts', import.meta.url), 'utf8');
  const m = src.match(/^\s*7: \[('[a-z0-9]+'), ('[a-z0-9]+'), ('[a-z0-9]+')\],/m);
  assert.ok(m, 'CARD_POSES has a world 7 entry');
  for (const q of m.slice(1)) assert.ok(GOLEM_FRAMES[q.slice(1, -1)], `card pose ${q}`);
});
