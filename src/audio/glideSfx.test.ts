import test from 'node:test';
import assert from 'node:assert/strict';
import { SFX, runFx } from './sfx.ts';

/** a stand-in for the audio graph: any node, method or property is another stand-in, and every note it is asked to schedule is counted */
function stub() {
  let nodes = 0;
  const make = (): any =>
    new Proxy(function () {}, {
      get: (_t, k) => (k === 'currentTime' ? 1 : k === Symbol.toPrimitive ? () => 0 : make()),
      set: () => true,
      apply: () => {
        nodes++;
        return make();
      },
    });
  return { core: make(), count: () => nodes };
}
const key = { root: 60, scale: 'major' } as never;

test('the leaf glide effect exists and builds its three sounds (open, flutter, fold) without a crash', () => {
  assert.equal(typeof SFX.glide, 'function');
  for (const phase of [0, 1, 2]) {
    const { core, count } = stub();
    runFx('glide', core, key, phase, { variant: 0 });
    assert.ok(count() > 0, `phase ${phase} made no sound`);
  }
});

test('each phase makes sound, and none of them is empty', () => {
  const a = stub();
  const b = stub();
  runFx('glide', a.core, key, 0);
  runFx('glide', b.core, key, 1);
  assert.ok(b.count() > 0 && a.count() > 0);
});
