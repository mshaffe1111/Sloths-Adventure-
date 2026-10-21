import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { IRONCLAW_FRAMES } from './ironclawAtlasData.ts';

// every pose the boss brain can ask for in ironclawSprite.ts
const USED = [
  'idle', 'march0', 'march1', 'march2', 'hurt', 'stunned', 'knockback', 'groundhit', 'defeat1', 'defeat2', 'defeat3', 'fallen',
  'roar', 'enrage3', 'rageblast', 'overhead1', 'overhead2', 'armed', 'slash', 'block', 'stomp1', 'stomp2', 'charge', 'run',
  'claw1', 'claw2', 'punch2', 'crouch', 'ultslam', 'quakewalk',
];

test('every pose the Iron-Claw pick asks for is in the atlas', () => {
  for (const n of USED) assert.ok(IRONCLAW_FRAMES[n], `frame ${n}`);
});

test('every frame name in the pick source exists', () => {
  const src = readFileSync(new URL('./ironclawSprite.ts', import.meta.url), 'utf8');
  const names = new Set([...src.matchAll(/'([a-z0-9]+)'/g)].map((m) => m[1]));
  for (const n of names) if (/^(march\d|idle|hurt|stunned|knockback|groundhit|defeat\d|fallen|roar|enrage3|rageblast|overhead\d|armed|slash|block|stomp\d|charge|run|claw\d|punch\d|crouch|ultslam|quakewalk)$/.test(n)) assert.ok(IRONCLAW_FRAMES[n], `frame ${n}`);
});

test('each frame has a size and a body anchor', () => {
  for (const [n, f] of Object.entries(IRONCLAW_FRAMES)) {
    assert.ok(f.w > 8 && f.h > 8, `${n} size`);
    assert.ok(Number.isFinite(f.ax) && Number.isFinite(f.ay), `${n} anchor`);
  }
});

test('the story card poses for world 10 exist', () => {
  const src = readFileSync(new URL('./bossArt.ts', import.meta.url), 'utf8');
  const m = src.match(/^\s*10: \[('[a-z0-9]+'), ('[a-z0-9]+'), ('[a-z0-9]+')\],/m);
  assert.ok(m, 'CARD_POSES has a world 10 entry');
  for (const q of m.slice(1)) assert.ok(IRONCLAW_FRAMES[q.slice(1, -1)], `card pose ${q}`);
});
