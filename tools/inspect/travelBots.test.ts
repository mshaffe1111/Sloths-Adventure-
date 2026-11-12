// The bots measure "how far on" by the stage's travel (ADR-003 kit step 2): an up stage by height, a leftward fixture by x going down.
//   npx tsx --test tools/inspect/travelBots.test.ts
import test from 'node:test';
import assert from 'node:assert/strict';
import '../../src/game/headlessDom.ts';
import { firstTimer, FT_MIDDLE } from './firsttimer.ts';
import { enteredPieces, pieceAt } from './tierBots.ts';
import { MODES, along, reached } from '../../src/game/stageModes.ts';
import { RealPlay } from '../../src/game/realPlay.ts';

test('along and reached: the travel axis and its direction', () => {
  assert.equal(along(MODES.right, { x: 7, y: 9 }), 7);
  assert.equal(along(MODES.left, { x: 7, y: 9 }), 7);
  assert.equal(along(MODES.up, { x: 7, y: 9 }), 9);
  assert.equal(along(MODES.down, { x: 7, y: 9 }), 9);
  assert.deepEqual([reached(MODES.right, 500, 400), reached(MODES.right, 300, 400)], [true, false]);
  assert.deepEqual([reached(MODES.left, 300, 400), reached(MODES.left, 500, 400)], [true, false]);
  assert.deepEqual([reached(MODES.up, 300, 400), reached(MODES.up, 500, 400)], [true, false]);
  assert.deepEqual([reached(MODES.down, 500, 400), reached(MODES.down, 300, 400)], [true, false]);
});

test('the first-timer on an up stage (1-4): his furthest on is the best height, not the furthest right', () => {
  const spawnY = new RealPlay('1-4', 1).stage.spawnY;
  const r = firstTimer('1-4', 1, FT_MIDDLE, { cap: 25 });
  assert.equal(typeof r.far, 'number');
  assert.ok(r.far! < spawnY - 100, `he climbed: far ${r.far}, started at ${spawnY}`);
  assert.notEqual(r.far, r.maxX, 'and it is not his furthest right');
});

test('the first-timer on a run (1-1): furthest on is still the furthest right', () => {
  const r = firstTimer('1-1', 1, FT_MIDDLE, { cap: 10 });
  assert.equal(r.far, r.maxX);
});

test('the tier bots on a leftward fixture: the pieces he entered and the piece he is in are counted from the right', () => {
  const P = [{ id: 'c', x0: 0, x1: 1000 }, { id: 'b', x0: 1000, x1: 2000 }, { id: 'a', x0: 2000, x1: 3000 }];
  // (he started at the right end and got as far left as x 1500: pieces a and b, never c)
  assert.deepEqual(enteredPieces(P, 1500, MODES.left).map((p) => p.id), ['b', 'a']);
  assert.equal(pieceAt(P, 1500, MODES.left), 'b');
  assert.equal(pieceAt(P, 2000, MODES.left), 'b', 'a join belongs to the piece he has just entered going left');
  assert.equal(pieceAt(P, 3500, MODES.left), null, 'right of the first piece: not in the stage yet');
  // (and a run to the right is as it was: the last piece starting at or before him)
  assert.deepEqual(enteredPieces(P, 1500, MODES.right).map((p) => p.id), ['c', 'b']);
  assert.equal(pieceAt(P, 1500), 'b');
  assert.equal(pieceAt(P, 1000), 'b');
  assert.equal(pieceAt(P, -5), null);
});
