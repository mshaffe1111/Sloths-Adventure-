import { test } from 'node:test';
import assert from 'node:assert/strict';
import v8 from 'node:v8';
import vm from 'node:vm';
import { setSceneSeed } from './sceneSeed.ts';
import { lookFor, poolFor } from './scenery.ts';
import { paletteFor } from './platformPalette.ts';

// Every run rolls a new scene seed and with it a whole new Look. Anything cached against an old Look must let it go,
// or each stage entered leaves a palette, a pool colour and their strings behind for the rest of the session.
v8.setFlagsFromString('--expose-gc');
const gc = vm.runInNewContext('gc') as () => void;
const settle = () => new Promise<void>((r) => setImmediate(r));

/** deref() pins its target until the end of the current job, so collect first and look once at the end */
async function collected(refs: WeakRef<object>[]): Promise<boolean> {
  for (let i = 0; i < 6; i++) {
    gc();
    await settle();
  }
  return refs.every((r) => r.deref() === undefined);
}

test('a Look from an old scene seed is freed once the seed changes, whatever has cached against it', async () => {
  const refs: WeakRef<object>[] = [];
  (() => {
    setSceneSeed(9001);
    for (const w of [1, 3, 6, 9]) {
      const look = lookFor(w);
      paletteFor(look, w);
      poolFor(look, w);
      refs.push(new WeakRef(look));
    }
  })();
  setSceneSeed(9002);
  for (const w of [1, 3, 6, 9]) lookFor(w); // the next run builds its own
  assert.ok(await collected(refs), 'an old Look is still reachable after the seed moved on');
});
