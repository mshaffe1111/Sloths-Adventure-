import test from 'node:test';
import assert from 'node:assert/strict';
import { layoutForEntry, savedLayout, layoutKey } from './layoutMemory.ts';
import { isSaveKey, resetProgress, type Store } from './saveFile.ts';
import { generateAllLevels } from './worldsData.ts';
import { generateStage, setLayoutVariant } from './stageGenerator.ts';
import { validateStage } from './levelCheck.ts';

const memory = () => {
  const m = new Map<string, string>();
  return Object.assign(m, { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) });
};
const lv = (id: string) => generateAllLevels().find((l) => l.id === id)!;

test('a stage keeps the layout it was first entered with', () => {
  const mem = memory();
  let n = 100;
  const roll = () => ++n;
  const a = layoutForEntry(lv('1-1'), mem, roll, false);
  const b = layoutForEntry(lv('1-1'), mem, roll, false);
  assert.equal(a, 101);
  assert.equal(b, 101, 'second entry reuses the saved layout');
  assert.equal(layoutForEntry(lv('1-2'), mem, roll, false), 102, 'a stage never entered gets its own fresh roll');
  assert.equal(savedLayout('1-3', mem), null, 'a stage never entered has nothing saved');
});

test('boss lairs, the secret stage and test overrides are never saved', () => {
  const mem = memory();
  layoutForEntry(lv('1-10'), mem, () => 7, false);
  assert.equal(mem.size, 0);
  layoutForEntry(lv('1-1'), mem, () => 9, true);
  assert.equal(mem.size, 0);
});

test('a damaged saved layout is ignored', () => {
  const mem = memory();
  mem.setItem(layoutKey('1-1'), 'banana');
  assert.equal(savedLayout('1-1', mem), null);
  mem.setItem(layoutKey('1-1'), '-4');
  assert.equal(savedLayout('1-1', mem), null);
});

test('layout numbers are part of the save and a New Game clears them', () => {
  assert.ok(isSaveKey(layoutKey('1-1')));
  assert.ok(isSaveKey(layoutKey('10-9')));
  const m = new Map<string, string>([[layoutKey('1-1'), '55'], ['sloth_music_vol', '0.5']]);
  const store: Store = { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v), removeItem: (k) => void m.delete(k), keys: () => [...m.keys()] };
  resetProgress(store);
  assert.equal(m.has(layoutKey('1-1')), false);
  assert.equal(m.get('sloth_music_vol'), '0.5');
});

test('stage 1-1 comes out different for different players, and is always beatable', () => {
  const cfg = lv('1-1');
  const seen = new Set<string>();
  for (let v = 1; v <= 60; v++) {
    setLayoutVariant(v * 7919 + 13);
    const s = generateStage(cfg);
    assert.ok(validateStage(s).ok, `1-1 variant ${v} must be beatable`);
    seen.add(((s.meta as { chunks: string[] }).chunks).join());
  }
  setLayoutVariant(null);
  assert.ok(seen.size >= 50, `only ${seen.size} different layouts out of 60`);
});

test('the same layout number always rebuilds the very same stage', () => {
  const cfg = lv('2-3');
  setLayoutVariant(424242);
  const a = JSON.stringify(generateStage(cfg).platforms);
  const b = JSON.stringify(generateStage(cfg).platforms);
  setLayoutVariant(null);
  assert.equal(a, b);
});

test('clearing a stage forgets its layout, so a replay rolls a fresh one; a retry keeps it', async () => {
  const { forgetLayout, layoutForEntry } = await import('./layoutMemory.ts');
  const m = new Map<string, string>();
  const mem = { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k) };
  let n = 100;
  const roll = () => ++n;
  const lvl = { id: '2-3', objectiveType: 'sprint' as const, secret: undefined };
  const first = layoutForEntry(lvl, mem, roll, false);
  assert.equal(layoutForEntry(lvl, mem, roll, false), first, 'a retry keeps the layout');
  forgetLayout('2-3', mem);
  const next = layoutForEntry(lvl, mem, roll, false);
  assert.notEqual(next, first, 'after a clear the next visit rolls again');
  assert.equal(layoutForEntry(lvl, mem, roll, false), next);
});
