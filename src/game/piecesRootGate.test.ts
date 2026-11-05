// The root gate (src/game/pieces/rootgate.ts): shut, its door stops him and its root wall is too tall to jump; one step on the knot plate
// opens it for good, and he walks through. Real engine, Normal and Easy.
import test from 'node:test';
import assert from 'node:assert/strict';
import { GATE, rootGate } from './pieces/rootgate.ts';
import { bareWorld, rng, THUMB } from './pieces/pieceBot.ts';
import { LANDINGS, landingKind } from './mixer/catalog.ts';
import { DT, type RealPlay } from './realPlay.ts';
import type { Platform } from './types.ts';

const G = 1000, DOOR_X = 1200;
function course() {
  const parts = rootGate({ x: DOOR_X, floorY: G, gate: 1 }).map((p, i) => ({ id: 10 + i, ...p, ...(p.rootgate ? { rootgate: { ...p.rootgate } } : {}) }) as Platform);
  const floor: Platform = { id: 1, x: 0, y: G, width: 3000, height: 400, type: 'solid', style: 'moss_stone' };
  return [floor, ...parts];
}
const door = (rp: RealPlay) => rp.platforms.find((p) => p.rootgate?.role === 'door')!;

test('shut, the door stops a walk and the wall over it stops every jump', () => {
  for (const setting of ['normal', 'easy'] as const) {
    const rp = bareWorld(course(), setting);
    rp.stand(DOOR_X - 60, G);
    for (let i = 0; i < 90; i++) rp.frame({ right: true });
    assert.ok(rp.p.x < DOOR_X, `${setting}: a walk stops at the door (x ${rp.p.x.toFixed(0)})`);
    // the best jump there is: a held jump and the second at its top, steering on
    rp.stand(DOOR_X - 140, G);
    for (let i = 0; i < 70; i++) rp.frame({ press: i === 0 || i === 10, jump: i < 10 || (i > 10 && i < 22), right: true });
    assert.ok(rp.p.x < DOOR_X, `${setting}: no jump gets over the wall (x ${rp.p.x.toFixed(0)})`);
    assert.equal(door(rp).broken, undefined, 'still shut');
  }
});

test('real engine: a hop onto the knot block opens it, it stays open, and he walks through (first-timer thumbs, Normal and Easy)', () => {
  for (const setting of ['normal', 'easy'] as const) {
    const r = rng(setting === 'easy' ? 21 : 22);
    const th = THUMB[setting];
    let through = 0;
    const N = 20;
    for (let k = 0; k < N; k++) {
      const rp = bareWorld(course(), setting);
      const rock = rp.platforms.find((p) => p.rootgate?.role === 'knot')!;
      rp.stand(rock.x - 60, G);
      // walk up to the rock and hop onto it: a short thumb (held N(hold) s), steering on until he lands
      const hold = Math.max(0.06, th.hold[0] + (r() - 0.5) * 2 * th.hold[1]);
      for (let i = 0; i < 60 && rp.p.x < rock.x - 24; i++) rp.frame({ right: true });
      for (let i = 0; i < 40; i++) { rp.frame({ press: i === 0, jump: i * DT < hold, right: true }); if (i > 2 && rp.p.grounded) break; }
      // then on: off the rock's far side and through the door
      for (let i = 0; i < 240; i++) rp.frame({ right: true });
      if (rp.p.x > DOOR_X + GATE.doorW + 20 && door(rp).broken) through++;
    }
    assert.ok(through / N >= (setting === 'easy' ? 0.85 : 0.7), `${setting}: through ${through} of ${N}`);
  }
});

test('open, it stays open: back and through again, and after time', () => {
  const rp = bareWorld(course(), 'normal');
  const plate = rp.platforms.find((p) => p.rootgate?.role === 'plate')!;
  rp.stand(plate.x + plate.width / 2, plate.y);
  rp.frame();
  rp.frame();
  assert.equal(door(rp).broken, true, 'standing on the plate opened it');
  // (down off the block, between it and the door, five seconds on)
  rp.stand(DOOR_X - 50, G);
  rp.wait(5);
  for (let i = 0; i < 120; i++) rp.frame({ right: true });
  assert.ok(rp.p.x > DOOR_X + GATE.doorW, 'still open five seconds later, with him off the plate');
});

test('its label is in the library: built, on the ground, never floating; World 1 on', () => {
  const parts = course().filter((p) => p.rootgate);
  for (const p of parts) assert.deepEqual(landingKind(p as Platform & Record<string, unknown>).map((q) => q.name), ['root gate']);
  const e = LANDINGS.find((q) => q.name === 'root gate')!;
  assert.equal(e.mayFloat, 'no');
  assert.ok(e.worlds.includes(1));
});
