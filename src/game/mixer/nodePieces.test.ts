// V18 (NODES.md §8.0 PIECES): a realised node's pieces match its content row. Planted failures are caught; a node that has its row's
// pieces passes.
import test from 'node:test';
import assert from 'node:assert/strict';
import { nodePieceBreaches } from './nodePieces.ts';

const P = (o: Record<string, unknown>) => ({ id: Math.random(), type: 'solid', width: 200, height: 24, ...o }) as never;
const stage = (platforms: unknown[], extra: Record<string, unknown> = {}) => ({ platforms, config: { levelHeight: 1400 }, ...extra }) as never;
const floor = P({ x: 0, y: 1200, width: 3000, height: 200, style: 'moss_stone' });

test('V18: a ground node on the floor road with stones passes; a stone in the air, a pad off water, and an r node in 1-1 are caught', () => {
  const ok = stage([floor, P({ x: 400, y: 1150, width: 160, height: 50, style: 'moss_stone' })]);
  assert.deepEqual(nodePieceBreaches(ok, 1, [{ token: 'Pg1', x0: 0, x1: 1000 }], { stage: '1-1' }), []);
  const stoneUp = stage([floor, P({ x: 400, y: 700, width: 160, height: 50, style: 'moss_stone' })]);
  assert.match(nodePieceBreaches(stoneUp, 1, [{ token: 'Pg1', x0: 0, x1: 1000 }]).join(';'), /NEVER a rock, stone, mound or bank in the air/);
  const padOff = stage([floor, P({ x: 400, y: 1000, width: 120, lily: true })]);
  assert.match(nodePieceBreaches(padOff, 1, [{ token: 'Pw1', x0: 0, x1: 1000 }]).join(';'), /NEVER pads, reeds or drift logs off water/);
  assert.match(nodePieceBreaches(ok, 1, [{ token: 'Pr1', x0: 0, x1: 1000 }], { stage: '1-1' }).join(';'), /NEVER a rope or vine node in 1-1/);
});

test('V18: a bounce node needs a seated mushroom, a floating node a floating platform, a climb node rising landings', () => {
  const noShroom = stage([floor]);
  assert.match(nodePieceBreaches(noShroom, 1, [{ token: 'Pb', x0: 0, x1: 1000 }]).join(';'), /MUST a mushroom seated/);
  const shroom = stage([floor, P({ x: 300, y: 1170, width: 70, height: 30, type: 'bouncy' })]);
  assert.deepEqual(nodePieceBreaches(shroom, 1, [{ token: 'Pb', x0: 0, x1: 1000 }]), []);
  assert.match(nodePieceBreaches(noShroom, 1, [{ token: 'Xf2', x0: 0, x1: 1000 }]).join(';'), /MUST a floating platform/);
  const boughs = stage([floor, P({ x: 300, y: 1000, style: 'branch' })]);
  assert.deepEqual(nodePieceBreaches(boughs, 1, [{ token: 'Xf2', x0: 0, x1: 1000 }]), []);
  const stair = stage([P({ x: 0, y: 1200, width: 200, height: 200, style: 'moss_stone' }), P({ x: 300, y: 1100, width: 200, style: 'log' }), P({ x: 600, y: 1000, width: 200, style: 'log' }), P({ x: 900, y: 900, width: 200, style: 'log' })]);
  assert.deepEqual(nodePieceBreaches(stair, 1, [{ token: 'Uc^', x0: 0, x1: 1100 }]), []);
  assert.match(nodePieceBreaches(stage([floor]), 1, [{ token: 'Uc^', x0: 0, x1: 1000 }]).join(';'), /MUST landings that each sit higher/);
  const dip = stage([P({ x: 0, y: 1200, width: 200, height: 200, style: 'moss_stone' }), P({ x: 300, y: 1100, width: 200, style: 'log' }), P({ x: 600, y: 1150, width: 200, style: 'log' }), P({ x: 900, y: 1000, width: 200, style: 'log' }), P({ x: 1200, y: 900, width: 200, style: 'log' })]);
  assert.match(nodePieceBreaches(dip, 1, [{ token: 'Uc^', x0: 0, x1: 1500 }]).join(';'), /no step down/, 'a dip inside a climb is not a stair');
});
