import test from 'node:test';
import assert from 'node:assert/strict';
import { trackAtlas, enterWorld, releaseWorldArt, heldSheets } from './atlasLoader.ts';

/** just enough of an <img> for trackAtlas: it sets the handlers and the src */
const fakeImage = () => ({ onload: null as null | (() => void), onerror: null as null | (() => void), src: '' }) as unknown as HTMLImageElement;

test('a world sheet is let go when a stage starts in another world, and kept within the same world', () => {
  releaseWorldArt();
  enterWorld(1);
  let forgot = 0;
  trackAtlas(fakeImage(), 'kit.webp', () => {}, () => {}, () => { forgot++; });
  trackAtlas(fakeImage(), 'hero.webp', () => {}, () => {}); // no forget: the hero's sheet is kept for good
  assert.equal(heldSheets(), 1);
  enterWorld(1);
  assert.equal(forgot, 0, 'another stage in the same world kept its sheet');
  enterWorld(2);
  assert.equal(forgot, 1);
  assert.equal(heldSheets(), 0);
});

test('a sheet let go while it was still loading does not mark its module ready', () => {
  releaseWorldArt();
  const img = fakeImage();
  let readyCalls = 0;
  trackAtlas(img, 'boss.webp', () => { readyCalls++; }, () => {}, () => {});
  const onload = img.onload!;
  releaseWorldArt();
  onload.call(img, {} as Event); // the picture arrives after it was let go (no decode() on the fake, so ready would run at once)
  assert.equal(readyCalls, 0);
});
