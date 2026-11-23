/**
 * The HUD's faces on a follow stage (followFaces.ts; the lead's ruling 11-20 7:54 PM ET, ENG-23's mock-up): each little one's face says
 * what the heron's look would do with it, by follow.ts's own rule (lineSeen: in cover and still is hidden).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { faceOf, facesKey, lineFaces } from './followFaces.ts';
import type { Follower, LineCover } from './follow.ts';

const reeds: LineCover[] = [{ x: 1000, w: 300, y: 600 }];
const one = (o: Partial<Follower>): Follower => ({ kind: 'duck', s: 0, x: 1150, y: 600, moved: false, state: 'follow', facing: 1, ...o }) as Follower;

test('a face is lit while it hides still in the reeds, dim out in the open or moving or paddling, grey once spooked back, gold home', () => {
  assert.equal(faceOf(one({}), reeds), 'hid', 'still, in the clump: hiding');
  // (planted: a face that ignores movement shows a moving one as hidden, and the look would see it: RED)
  assert.equal(faceOf(one({ moved: true }), reeds), 'open', 'moving in the clump: the look sees it');
  assert.equal(faceOf(one({ x: 1600 }), reeds), 'open', 'out on the mud');
  assert.equal(faceOf(one({ paddle: true }), reeds), 'open', 'paddling');
  assert.equal(faceOf(one({ state: 'spooked', x: 1150 }), reeds), 'spooked', 'spooked, even crouched in a clump: until he fetches it');
  assert.equal(faceOf(one({ state: 'home', x: 9000 }), reeds), 'home');
  assert.equal(faceOf(one({ state: 'join', x: 1150 }), reeds), 'hid', 'joining, still, in cover: as the look reads it');
});

test("the faces are the line's, in its order, and the key changes only when a face does", () => {
  const line = [one({ kind: 'duck' }), one({ kind: 'otter', x: 1600 }), one({ kind: 'capy', state: 'spooked' })];
  const f = lineFaces(line, reeds);
  assert.deepEqual(f, [{ kind: 'duck', st: 'hid' }, { kind: 'otter', st: 'open' }, { kind: 'capy', st: 'spooked' }]);
  assert.equal(facesKey(f), facesKey(lineFaces(line, reeds)));
  line[1].x = 1100;
  assert.notEqual(facesKey(f), facesKey(lineFaces(line, reeds)), 'the otter stepped into the clump');
  assert.equal(facesKey(null), '');
});
