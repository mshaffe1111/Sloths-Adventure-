import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ALWAYS, builtStageKeys } from './stageManifest.ts';
import { generateAllLevels } from './worldsData.ts';
import { generateStage, setLayoutVariant } from './stageGenerator.ts';
import { stageAnims } from './sheetWarm.ts';
import { pendingSheets, releaseWorldArt, trackAtlas, unwarmedSheets, warmSheets } from './atlasLoader.ts';
import { plainUrls } from './plainSheets.ts';

const levels = generateAllLevels();

test('a built stage asks for every creature it holds, its boss, Meeca, its rivers, bounce mushrooms and crumbling tiles, and what every stage shows', () => {
  const g = globalThis as { location?: unknown };
  const had = 'location' in g;
  g.location ??= { search: '' };
  const misses: string[] = [];
  try {
    for (const l of levels) {
      for (const v of [1]) {
        setLayoutVariant(v);
        const st = generateStage(l, 'normal');
        const keys = new Set(builtStageKeys(st));
        for (const k of ALWAYS) if (!keys.has(k)) misses.push(`${l.id}: ${k}`);
        for (const n of stageAnims(st)) if (!keys.has(`foe:${n}`)) misses.push(`${l.id} roll ${v}: foe:${n}`);
        if (st.boss && !keys.has(`boss:${l.worldIndex}`)) misses.push(`${l.id}: its boss`);
        if (st.daisyX !== undefined && !keys.has('meeca-standard')) misses.push(`${l.id}: Meeca`);
        if (st.rivers?.length && !keys.has('w2-props')) misses.push(`${l.id}: its river`);
        if (st.platforms.some((p) => p.type === 'bouncy') && !keys.has('bounce')) misses.push(`${l.id}: the bounce mushrooms`);
        // (and only those: a stage with no bounce mushroom does not load their sheet)
        if (!st.platforms.some((p) => p.type === 'bouncy') && keys.has('bounce')) misses.push(`${l.id}: bounce for nothing`);
        // (the crumbling tiles' sheet: a stage with one has it before its first frame, one without never loads it)
        if (st.platforms.some((p) => p.crumbleAfter !== undefined) !== keys.has('crumble-tile')) misses.push(`${l.id}: crumble-tile`);
      }
    }
  } finally {
    setLayoutVariant(null);
    if (!had) delete g.location;
  }
  assert.deepEqual(misses, []);
});

test('a boss lair asks for its guardian and Meeca; World 6 on, water asks for the dirty water', () => {
  const g = globalThis as { location?: unknown };
  const had = 'location' in g;
  g.location ??= { search: '' };
  try {
    const lair = generateStage(levels.find((l) => l.id === '3-10')!, 'normal');
    const keys = builtStageKeys(lair);
    assert.ok(keys.includes('boss:3'));
    const fake = { config: { worldIndex: 8, id: '8-2' }, platforms: [], enemies: [], waterY: 700 };
    assert.ok(builtStageKeys(fake).includes('bad-water'));
    assert.ok(!builtStageKeys({ ...fake, config: { worldIndex: 2, id: '2-2' } }).includes('bad-water'));
  } finally {
    if (!had) delete g.location;
  }
});

test('the plain pictures: no bundler under the test runner, so none; never a sheet atlasLoader tracks', () => {
  assert.deepEqual(plainUrls([]), []);
});

/** just enough of an <img> for trackAtlas */
const fakeImage = () => ({ onload: null as null | (() => void), onerror: null as null | (() => void), src: '', naturalWidth: 512, naturalHeight: 256 }) as unknown as HTMLImageElement;

test('whoever asked for a sheet, a stage about to start sees it waiting, then ready and not yet drawn, then drawn', () => {
  releaseWorldArt();
  const img = fakeImage();
  trackAtlas(img, 'asked-by-a-draw.webp', () => {}, () => {}, () => {});
  assert.ok(pendingSheets().includes('asked-by-a-draw.webp'));
  img.onload!.call(img, {} as Event);
  assert.ok(!pendingSheets().includes('asked-by-a-draw.webp'));
  assert.ok(unwarmedSheets().includes('asked-by-a-draw.webp'));
  const ctx = { drawImage: () => {}, clearRect: () => {} } as unknown as CanvasRenderingContext2D;
  warmSheets(unwarmedSheets(), ctx);
  assert.ok(!unwarmedSheets().includes('asked-by-a-draw.webp'));
});

test('a laid chase gets its long-branch sheet in behind the card; a stage without one never loads it (B2: flat bars on its first frames)', async () => {
  const { start } = await import('./stagePreload.ts');
  const { PROTO3_URL } = await import('./protoArt.ts');
  const g = globalThis as { location?: unknown };
  const had = 'location' in g;
  g.location ??= { search: '' };
  try {
    setLayoutVariant(1);
    const st = generateStage(levels.find((l) => l.id === '1-2')!, 'normal');
    assert.ok(!builtStageKeys(st).includes('props3'), 'a stage with no chase does not load the long-branch sheet');
    const laid = { ...st, chase: { stretches: [{ start: 1000, end: 3000, last: true }] } };
    assert.ok(builtStageKeys(laid).includes('props3'), 'a stage that lays a chase asks for the long-branch sheet');
    assert.ok(start(['props3']).includes(PROTO3_URL), 'and the key starts that sheet');
  } finally {
    setLayoutVariant(null);
    if (!had) delete g.location;
  }
});
