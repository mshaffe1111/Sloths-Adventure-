import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { STAGE_ANIMS, stageSheets } from './stageSheets.ts';
import { buildProtoStage, HAND_STAGES } from './protoStage.ts';
import { buildW2Stage, W2_STAGES } from './w2Stages.ts';
import { generateAllLevels } from './worldsData.ts';
import { dotStageConfig } from './extraStages.ts';
import { whenSheetsReady, warmSheets, trackAtlas, releaseWorldArt, enterWorld, sheetReady } from './atlasLoader.ts';

const on = { hand: true, paint: true, ctest: false };
const levels = generateAllLevels();
const lvl = (id: string) => levels.find((l) => l.id === id)!;

test('4-2 gets World 4 ready: both kit sheets and the World 4 props, nothing else', () => {
  assert.deepEqual(stageSheets(lvl('4-2'), on), ['kit:1', 'kit:4', 'w4-props']);
});

test('every hand-built World 3 stage gets the World 3 props and kit; 3-3 its cats too', () => {
  for (let m = 1; m <= 9; m++) {
    const s = stageSheets(lvl(`3-${m}`), on);
    assert.deepEqual(s.slice(0, 3), ['kit:1', 'kit:3', 'w3-props'], `3-${m}`);
  }
  assert.deepEqual(stageSheets(lvl('3-3'), on).slice(3), ['anim:jaguar', 'anim:ocelot']);
});

test("Dot's flight gets her own sheets only (it draws no platforms)", () => {
  assert.deepEqual(stageSheets(dotStageConfig(), on), ['dot']);
});

test('a boss lair and a generated stage get only what they draw', () => {
  // a boss lair draws no painted platforms and is not hand-built
  assert.deepEqual(stageSheets(lvl('3-10'), on), []);
  // a generated stage: the kit when painting is on (its creatures are rolled with it, so they load as it starts)
  // (5-4: 5-1 to 5-3 are hand-built now)
  const five = stageSheets(lvl('5-4'), on);
  assert.deepEqual(five, ['kit:1', 'kit:5']);
  assert.deepEqual(stageSheets(lvl('5-4'), { ...on, paint: false }), []);
  // with the hand-built stages switched off (?proto=0), 3-1 is a generated stage: no World 3 props
  assert.deepEqual(stageSheets(lvl('3-1'), { ...on, hand: false }), ['kit:1', 'kit:3']);
});

test("the creature clip sheets listed for the hand-built stages are the ones in them, in every roll", () => {
  // the creatures with clip sheets: <name>-anim.webp
  const anims = new Set(readdirSync(new URL('../assets/enemies/', import.meta.url)).map((f) => /^([a-z0-9]+)-anim\.webp$/.exec(f)?.[1]).filter(Boolean) as string[]);
  for (const l of levels) {
    const hand = HAND_STAGES[l.id];
    const w2 = W2_STAGES[l.id];
    if (!hand && !w2) continue;
    for (const v of [1, 2, 3]) {
      const st = hand ? buildProtoStage(l, v, hand) : buildW2Stage(l, v, w2);
      const want = [...new Set(st.enemies.flatMap((e) => (e.type === 'turtle' && e.royal ? ['guard'] : [e.type])))].filter((n) => anims.has(n)).sort();
      assert.deepEqual([...(STAGE_ANIMS[l.id] ?? [])].sort(), want, `${l.id} roll ${v}`);
    }
  }
});

/** just enough of an <img> for trackAtlas */
const fakeImage = () => ({ onload: null as null | (() => void), onerror: null as null | (() => void), src: '', naturalWidth: 2048, naturalHeight: 1024 }) as unknown as HTMLImageElement;

test('a stage waits for its sheets, then each is drawn once at its own size into a corner', async () => {
  releaseWorldArt();
  enterWorld(4);
  const img = fakeImage();
  trackAtlas(img, 'w4-props.webp', () => {}, () => {}, () => {});
  const wait = whenSheetsReady(['w4-props.webp', 'never-asked.webp'], 5000);
  assert.equal(sheetReady('w4-props.webp'), false);
  img.onload!.call(img, {} as Event); // (no decode() on the fake: ready at once)
  assert.equal(await wait, 1);
  const draws: number[][] = [];
  const clears: number[][] = [];
  const ctx = { drawImage: (...a: unknown[]) => draws.push(a.slice(1) as number[]), clearRect: (...a: number[]) => clears.push(a) } as unknown as CanvasRenderingContext2D;
  assert.equal(warmSheets(['w4-props.webp'], ctx), 1);
  assert.deepEqual(draws, [[0, 0, 4, 4, 0, 0, 4, 4]], '1:1, a few pixels');
  assert.deepEqual(clears, [[0, 0, 4, 4]]);
  assert.equal(warmSheets(['w4-props.webp'], ctx), 0, 'only the first time');
  // let go with its world: no longer counted as ready
  enterWorld(5);
  assert.equal(sheetReady('w4-props.webp'), false);
});

test('waiting gives up after its time', async () => {
  releaseWorldArt();
  trackAtlas(fakeImage(), 'slow.webp', () => {}, () => {}, () => {});
  const t0 = Date.now();
  assert.equal(await whenSheetsReady(['slow.webp'], 60), 0);
  assert.ok(Date.now() - t0 < 1000);
  releaseWorldArt();
});
