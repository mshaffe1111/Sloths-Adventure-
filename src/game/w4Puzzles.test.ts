/**
 * World 4's puzzle rooms (2026-10-28), built from the puzzle kit (puzzleKit.ts): Dot's knot pulley on the cliff (4-1: a stone from the
 * broken ledge in the basket winds the lift up), the wind shutter and the pinwheel lift (4-6, twice: pull the lever, the shutter opens,
 * the gusts spin the pinwheel and its winch winds the lift up with him on it), and the capuchin's trade (4-8: it took the pulley's
 * stone; a mango gets it back, and the pulley takes him up to a nest). Each room is proven by the validator on every roll and fails
 * without what it needs, cannot be passed by, fits an upright phone, has no animal and no falling rock in it, says what it is as he
 * comes in, and is played through in the real engine.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildProtoStage, type StagePlan } from './protoStage.ts';
import { validateStage } from './levelCheck.ts';
import { roomBox } from './puzzleKit.ts';
import { RealPlay } from './realPlay.ts';
import type { KitPlay } from './puzzlePlay.ts';
import type { Collectible, LevelConfig } from './types.ts';

const cfg = (id: string, type: LevelConfig['objectiveType']): LevelConfig =>
  ({
    worldIndex: 4, miniIndex: Number(id.split('-')[1]), id, name: id, objectiveType: type, targetCount: 1, timeLimit: 0, levelWidth: 9000,
    levelHeight: 900, description: '', unlocked: true, completed: false, stars: 0, highScore: 0, bestTime: 0,
  }) as LevelConfig;
const SEEDS = Array.from({ length: 16 }, (_, i) => 1 + i * 37);
const STAGES: Array<{ id: StagePlan; type: LevelConfig['objectiveType']; rooms: RegExp[] }> = [
  { id: '4-1', type: 'ascent', rooms: [/^knot-pulley-/] },
  { id: '4-6', type: 'ascent', rooms: [/^pinwheel-lift-/, /^pinwheel-lift-/] },
  { id: '4-8', type: 'rescue', rooms: [/^capuchin-trade-/] },
];

test('World 4\'s rooms: the validator solves each on every roll, each fails without its stone, mango or lever, and none can be passed by', () => {
  for (const { id, type, rooms: want } of STAGES) {
    const build = (s: number) => buildProtoStage(cfg(id, type), s, id);
    for (const s of SEEDS) {
      const st = build(s);
      const rooms = st.kit?.rooms ?? [];
      assert.equal(rooms.length, want.length, `${id} seed ${s}: ${rooms.map((r) => r.id).join(', ')}`);
      rooms.forEach((r, i) => assert.match(r.id, want[i], `${id} seed ${s}`));
      assert.deepEqual(validateStage(st).errors, [], `${id} seed ${s}`);
      for (let k = 0; k < rooms.length; k++) {
        // without the things the room is worked with, its way on never opens
        const t = build(s);
        t.kit!.rooms[k].pieces = t.kit!.rooms[k].pieces.filter((p) => p.kind !== 'item' && p.kind !== 'source' && p.kind !== 'lever');
        assert.ok(validateStage(t).errors.some((e) => e.startsWith(`room ${t.kit!.rooms[k].id}:`)), `${id} seed ${s}: ${rooms[k].id} works without its pieces`);
        // and with the room left unsolved (its lift stays down) the shrine cannot be reached: there is no way round it
        const u = build(s);
        u.kit!.rooms.splice(k, 1);
        assert.equal(validateStage(u).ok, false, `${id} seed ${s}: ${rooms[k].id} can be passed by`);
      }
    }
  }
});

test('World 4\'s rooms: narrow and tall enough for an upright phone, nothing in them that hurts, and each says what it is', () => {
  for (const { id, type } of STAGES) {
    for (const s of SEEDS) {
      const st = buildProtoStage(cfg(id, type), s, id);
      for (const r of st.kit!.rooms) {
        const b = roomBox(r, st.platforms);
        assert.ok(b.x1 - b.x0 <= 800 && b.y1 - b.y0 <= 540, `${id} seed ${s}: ${r.id} is ${Math.round(b.x1 - b.x0)} x ${Math.round(b.y1 - b.y0)}`);
        const near = (x: number, y: number, pad: number) => x > b.x0 - pad && x < b.x1 + pad && y > b.y0 - pad && y < b.y1 + pad;
        assert.ok(!st.enemies.some((e) => near(e.x, e.y, 100)), `${id} seed ${s}: an animal by ${r.id}`);
        const w4 = st.proto.w4;
        assert.ok(!(w4?.rocks ?? []).some((q) => near(q.x, q.land, 60)), `${id} seed ${s}: a rock falls in ${r.id}`);
        assert.ok(!(w4?.monkeys ?? []).some((m) => near(m.x, m.y, 100)), `${id} seed ${s}: a capuchin guard by ${r.id}`);
        assert.ok(r.tips?.enter, `${id} seed ${s}: ${r.id} says nothing as he comes in`);
        assert.ok(r.pieces.some((p) => p.kind === 'reset'), `${id} seed ${s}: ${r.id} has no signpost to start it again`);
      }
    }
  }
});

const kitOf = (r: RealPlay) => (r.e as unknown as { kit: KitPlay }).kit;
const walkTo = (r: RealPlay, x: number) => {
  for (let i = 0; i < 600 && Math.abs(r.p.x - x) > 8; i++) r.frame(r.p.x < x ? { right: true } : { left: true });
  r.frame();
};
const face = (r: RealPlay, d: 1 | -1) => {
  r.frame(d > 0 ? { right: true } : { left: true });
  r.frame();
};

test('4-1 in the real engine: a stone from the heap, set in Dot\'s basket from the lift, winds him up to the ledge above', () => {
  const r = new RealPlay('4-1', 1);
  const kit = kitOf(r);
  const room = kit.rooms[0];
  const heap = room.sources[0];
  const lift = room.lifts[0];
  const up = r.platforms.find((p) => p.id === room.spec.beyond.on)!;
  r.stand(heap.x - 40, heap.y);
  face(r, 1);
  r.frame({ punch: true });
  assert.ok(kit.holding, 'a tap by the heap picks a stone up');
  walkTo(r, lift.plat.x + 20);
  face(r, -1);
  const y0 = r.p.y;
  r.frame({ punch: true });
  r.wait(3.5);
  assert.ok(!kit.holding && room.baskets[0].count === 1, 'the stone is in the basket');
  assert.ok(r.p.y < y0 - 250, `he rode the lift up (${Math.round(y0)} -> ${Math.round(r.p.y)})`);
  walkTo(r, up.x + up.width / 2);
  assert.ok(Math.abs(r.p.y - up.y) < 3, 'on the ledge up there');
});

test('4-6 in the real engine: shut, the pinwheel stands still; the lever opens the shutter and the gusts wind the lift up with him on it', () => {
  const r = new RealPlay('4-6', 1);
  const kit = kitOf(r);
  for (const room of kit.rooms) {
    const lift = room.lifts[0];
    const z = room.shutters[0].zone!;
    const up = r.platforms.find((p) => p.id === room.spec.beyond.on)!;
    // standing on the lift with the shutter shut: through two gusts' time, nothing moves
    r.stand(lift.plat.x + 14, lift.plat.y);
    r.wait(7);
    assert.equal(z.shut, true, 'shut to start with');
    assert.ok(!room.pinwheels[0].spin && lift.level === 0, 'no wind, no winding');
    face(r, -1);
    r.frame({ punch: true });
    r.frame();
    assert.equal(room.levers[0].on, true, 'the lever is pulled from the lift');
    assert.equal(z.shut, false, 'and the shutter is open');
    const y0 = r.p.y;
    r.wait(16);
    assert.ok(lift.level >= 0.999, `wound right up (${lift.level.toFixed(2)})`);
    assert.ok(r.p.y < y0 - 250, `he rode it (${Math.round(y0)} -> ${Math.round(r.p.y)})`);
    walkTo(r, up.x + up.width / 2);
    assert.ok(Math.abs(r.p.y - up.y) < 3, 'on the ledge up there');
  }
});

test('4-8 in the real engine: a mango for the capuchin, its stone back, the stone in the basket, up to the nest, and the chick freed', () => {
  const r = new RealPlay('4-8', 1);
  const kit = kitOf(r);
  const room = kit.rooms[0];
  const tr = room.traders[0];
  const lift = room.lifts[0];
  const top = r.platforms.find((p) => p.id === room.spec.beyond.on)!;
  const src = room.sources[0];
  // a tap by the mangoes picks one up; offered, the capuchin takes it and drops the stone
  r.stand(src.x - 40, src.y);
  face(r, 1);
  r.frame({ punch: true });
  assert.ok(kit.holding, 'a mango in his hands');
  walkTo(r, tr.x - 50);
  face(r, 1);
  r.frame({ punch: true });
  r.wait(1.2);
  assert.ok(!kit.holding && tr.done, 'the capuchin took the mango');
  const stone = room.items.find((it) => it.variant === 'stone')!;
  assert.equal(stone.mode, 'rest', 'and dropped the stone');
  walkTo(r, stone.x - 24);
  face(r, 1);
  r.frame({ punch: true });
  assert.ok(kit.holding, 'the stone in his hands');
  walkTo(r, lift.plat.x + 20);
  face(r, -1);
  const y0 = r.p.y;
  r.frame({ punch: true });
  r.wait(3.5);
  assert.ok(!kit.holding && room.baskets[0].count === 1, 'the stone is in the basket');
  assert.ok(r.p.y < y0 - 250, `he rode the lift up (${Math.round(y0)} -> ${Math.round(r.p.y)})`);
  // the nest on the terrace: two blows tear its netting
  const cage = r.e.collectibles.find((c: Collectible) => c.type === 'cage' && c.y === top.y - 26 && c.x > top.x && c.x < top.x + top.width)!;
  assert.ok(cage && !cage.collected, 'a chick caught on the terrace');
  walkTo(r, cage.x - 45);
  face(r, 1);
  for (let k = 0; k < 3 && !cage.collected; k++) {
    r.frame({ punch: true });
    r.wait(0.6);
  }
  assert.ok(cage.collected, 'the chick is free');
});
