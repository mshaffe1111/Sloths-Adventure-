import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sceneList, sceneUnlocked, scenePanels, unlockedScenes, type SceneProgress } from './sceneList.ts';
import { MEMORY_ORDER } from './storyChapters.ts';

const prog = (cleared: string[], memories: SceneProgress['memories'] = []): SceneProgress => ({ cleared: new Set(cleared), memories, gateFound: false, thornHeart: false });
const ctx = { finds: [], thornHeart: false, bossName: () => 'Boss' };

test('every scene has panels, and ids are unique', () => {
  const list = sceneList();
  assert.equal(new Set(list.map((e) => e.id)).size, list.length);
  for (const e of list) assert.ok(scenePanels(e, ctx).length > 0, e.id);
});

test('every flashback and Tower scene is in the list', () => {
  const mem = new Set(sceneList().map((e) => e.memory).filter(Boolean));
  for (const m of MEMORY_ORDER) assert.ok(mem.has(m), m);
});

test('the prologue comes first and is always open; nothing else is open on a new game', () => {
  const open = unlockedScenes(prog([]));
  assert.deepEqual(open.map((e) => e.id), ['prologue']);
});

test('progress unlocks scenes the player passed before the list existed', () => {
  const cleared = ['1-1', '1-2', '1-3', '1-4', '1-5', '1-6', '1-7', '1-8', '1-9', '1-10', '2-1'];
  const ids = unlockedScenes(prog(cleared)).map((e) => e.id);
  for (const id of ['prologue', 'open1', 'mid1', 'boss1', 'fall1', 'open2']) assert.ok(ids.includes(id), id);
  assert.ok(!ids.includes('mid2'));
  assert.ok(!ids.includes('mem_waiting'));
});

test('a watched flashback counts even without the progress', () => {
  const e = sceneList().find((x) => x.memory === 'waiting')!;
  assert.ok(sceneUnlocked(e, prog([], ['waiting'])));
});

test('the order follows the story: worlds ascend, the ending is last of the main story', () => {
  const list = sceneList();
  for (let i = 1; i < list.length; i++) assert.ok(list[i].world >= list[i - 1].world, list[i].id);
  const iEnd = list.findIndex((e) => e.id === 'ending');
  assert.ok(list.findIndex((e) => e.id === 'fall10') < iEnd);
});
