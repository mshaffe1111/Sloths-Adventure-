/**
 * 1-7's watcher laid as gen2 content on the creature kit (ENG-E1, 1-7.md NEW 1, 4, 5, 7): World 1's still table (w1Cast.ts W1_STILL) lays
 * hides and a watched stretch; the finish turns the stretch, cut to its hides, into ONE kit eagle over it, with the stretch's calm as its
 * own cool and its first pass free where it is taught; the built stage carries no watcher.ts zone. Then the real cast plays it: a still
 * sloth in a laid bush is never taken (two empty passes and it gives up), one in the open is spared once and taken the next pass.
 * Planted: none of this exists on the base (t-eng-s1@a1739b43): no eagle row, no castWatches.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { CastPlay } from '../castPlay.ts';
import type { Enemy, Platform } from '../types.ts';
import { stillFaults, sweptZones } from './stillLay.ts';
import type { FilledSocket, PropDef, StageSink } from './types.ts';
import { EAGLE_SKY, w1Still } from './worlds/w1Cast.ts';

const G = 500;
const sink = (platforms: Platform[]): StageSink => {
  let e = 100;
  return { platforms, enemies: [], collectibles: [], proto: {}, extras: {}, zones: [], nextPlatformId: () => 1, nextCollectibleId: () => 1, nextEnemyId: () => e++ } as unknown as StageSink;
};
const fill = (socket: string, what: string, x: number): FilledSocket => ({ section: 's', socket, role: 'prop', what, x, y: G });

function laid(lessonSocket: string) {
  const out = sink([{ id: 1, x: 0, y: G, width: 2400, height: 40, type: 'solid' } as Platform]);
  // (the eagle is taught at the watch sockets the stage names: here the test's own)
  const kit = w1Still(7, ['teach1']);
  const def = (id: string): PropDef => kit.props.find((p) => p.id === id)!;
  kit.emit['w1-eagle'](fill(lessonSocket, 'w1-eagle', 20), def('w1-eagle'), out);
  kit.emit['w1-hide-bush'](fill('h1', 'w1-hide-bush', 400), def('w1-hide-bush'), out);
  kit.emit['w1-hide-bush-wide'](fill('h2', 'w1-hide-bush-wide', 760), def('w1-hide-bush-wide'), out);
  kit.finish(out);
  return out;
}

test("World 1's still table lays a watched stretch as one kit eagle over it: cut to its hides, its own cool, free where taught", () => {
  const out = laid('teach1');
  assert.equal(out.proto.watch, undefined, 'no watcher.ts zone is left on the built stage');
  assert.deepEqual(out.proto.cast?.kinds, ['eagle']);
  assert.equal(out.enemies.length, 1);
  const e = out.enemies[0];
  assert.equal(e.type, 'eagle');
  assert.equal(e.patrolMinX, 40, 'its eye starts at the stretch (the bank in by its inset)');
  assert.equal(e.patrolMaxX, 760 + 80 + 120, 'and ends 120 px past the last hide (stillLay clipWatches)');
  assert.equal(e.y, G - EAGLE_SKY);
  assert.ok(e.kitCool! >= 6 && e.kitCool! <= 6.5, `the taught calm as its cool: ${e.kitCool}`);
  assert.equal(e.kitFree, true);
  const plain = laid('later1').enemies[0];
  assert.ok(plain.kitCool! < 6 && plain.kitCool! >= 5, `a later stretch's calm: ${plain.kitCool}`);
  assert.equal(plain.kitFree, undefined, 'not taught: its first pass is real on Normal');
  assert.deepEqual(stillFaults({ bushes: out.proto.bushes, watch: sweptZones(out.enemies), platforms: out.platforms }), [], 'and stillFaults holds the stretch');
});

/** the laid stretch in the real cast: him standing at x, still; the acts in order ('spared' or 'hurt'), and whether it gave up */
function play(out: StageSink, x: number, seconds: number, easy = false) {
  const c = new CastPlay(out.proto.cast!, out.enemies as Enemy[], out.platforms, 1, out.proto.bushes ?? []);
  const h = { x, y: G, vx: 0, vy: 0, facing: 1 as const, grounded: true, holding: false };
  const acts: string[] = [];
  let gaveUp = false;
  for (let i = 0; i < seconds * 30; i++) {
    const r = c.step(h, 1 / 30, i / 30, easy);
    if (r.spared.length) acts.push('spared');
    if (r.struck.length) acts.push('hurt');
    if (c.members[0].s.phase === 'flee') gaveUp = true;
  }
  return { acts, gaveUp };
}

test('the laid eagle plays: still in a laid bush he is never dived on and it gives up; still in the open, spared once, then taken', () => {
  const hid = play(laid('teach1'), 400, 30);
  assert.deepEqual(hid.acts, [], 'never a dive on him in the bush');
  assert.ok(hid.gaveUp, 'two empty passes with him still there: it flees (core.ts endPass)');
  const open = play(laid('teach1'), 620, 30);
  assert.deepEqual(open.acts.slice(0, 2), ['spared', 'hurt']);
});
