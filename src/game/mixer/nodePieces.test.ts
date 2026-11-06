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
  const runout = stage([...(stair as any).platforms, P({ x: 1200, y: 980, width: 200, style: 'log' })]);
  assert.deepEqual(nodePieceBreaches(runout, 1, [{ token: 'Xc2^', x0: 0, x1: 1500 }]), [], 'a step down after the summit is the run-out, not the stair');
});

test('V19: a late descent made good before the exit passes; one that leaves him lower, or sits straight before the exit, is caught', async () => {
  const { v19Breaches } = await import('./nodePieces.ts');
  const plats = [P({ x: 0, y: 1000, width: 3000 }), P({ x: 2000, y: 700, width: 300 }), P({ x: 2400, y: 900, width: 200 }), P({ x: 2700, y: 600, width: 300 })];
  const st = { platforms: plats } as never;
  const ok = [{ token: 'A', x0: 0, x1: 1000 }, { token: 'R', x0: 1000, x1: 2000 }, { token: 'Df_', x0: 2100, x1: 2500 }, { token: 'Sf2', x0: 2500, x1: 2750 }, { token: 'E', x0: 2750, x1: 3000 }];
  assert.deepEqual(v19Breaches(st, ok, 'up'), []);
  const low = [{ token: 'A', x0: 0, x1: 1000 }, { token: 'R', x0: 1000, x1: 2000 }, { token: 'Df_', x0: 2100, x1: 2500 }, { token: 'Sf2', x0: 2500, x1: 2600 }, { token: 'E', x0: 2600, x1: 2650 }];
  assert.match(v19Breaches(st, low, 'up').join(';'), /not above where the late descent began/);
  const straight = [{ token: 'A', x0: 0, x1: 1000 }, { token: 'R', x0: 1000, x1: 2000 }, { token: 'Df_', x0: 2100, x1: 2700 }, { token: 'E', x0: 2700, x1: 3000 }];
  assert.match(v19Breaches(st, straight, 'up').join(';'), /straight before the exit/);
  assert.deepEqual(v19Breaches(st, low, 'level'), [], 'only an up-trend stage');
});

test('V18 and the element reader read a bouncy piece by its TYPE: gen2\'s mushroom (style moss_stone) passes; no mushroom, a breaking stone, a springy limb in World 1 still FAIL (planted)', async () => {
  const { landingKind } = await import('./catalog.ts');
  const gen2Shroom = P({ x: 300, y: 1170, width: 70, height: 30, type: 'bouncy', style: 'moss_stone' });
  assert.ok(landingKind(gen2Shroom).some((k) => k.name === 'bounce mushroom' && (k.worlds as readonly number[]).includes(1)), 'a World 1 kind');
  assert.deepEqual(nodePieceBreaches(stage([floor, gen2Shroom]), 1, [{ token: 'Tb<', x0: 0, x1: 1000 }]), []);
  assert.match(nodePieceBreaches(stage([floor]), 1, [{ token: 'Tb<', x0: 0, x1: 1000 }]).join(';'), /MUST a mushroom seated/);
  const breaking = P({ x: 500, y: 1170, width: 120, height: 30, type: 'fragile', style: 'moss_stone' });
  assert.match(nodePieceBreaches(stage([floor, gen2Shroom, breaking]), 1, [{ token: 'Tb<', x0: 0, x1: 1000 }]).join(';'), /NEVER a bouncy branch or stone in World 1/);
  const limb = P({ x: 500, y: 1000, width: 160, type: 'bouncy', style: 'branch' });
  assert.match(nodePieceBreaches(stage([floor, gen2Shroom, limb]), 1, [{ token: 'Tb<', x0: 0, x1: 1000 }]).join(';'), /NEVER a bouncy branch or stone in World 1/);
  assert.ok(!landingKind(limb).some((k) => (k.worlds as readonly number[]).includes(1)), 'a springy limb is still no World 1 kind');
});
