/**
 * 1-4's squirrels' lift (2026-10-28, the puzzle kit's counterweight basket and lift): twice on the way up the kapok. First the basket
 * hangs low beside the lift (stand on the lift, a tap sets the acorn in), then high over it (flick up to throw it in). The validator
 * proves every roll's rooms and that each needs its acorns; the real engine rides both up.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildProtoStage } from './protoStage.ts';
import { validateStage } from './levelCheck.ts';
import { roomBox } from './puzzleKit.ts';
import { RealPlay } from './realPlay.ts';
import type { KitPlay } from './puzzlePlay.ts';
import type { LevelConfig } from './types.ts';

const cfg = {
  worldIndex: 1, miniIndex: 4, id: '1-4', name: 'Up the Kapok', objectiveType: 'ascent', targetCount: 1, timeLimit: 0,
  levelWidth: 3200, levelHeight: 3400, description: '', unlocked: true, completed: false, stars: 0, highScore: 0, bestTime: 0,
} as LevelConfig;
const SEEDS = Array.from({ length: 12 }, (_, i) => 1 + i * 41);

test('1-4: two squirrels\' lifts (a low basket, then a high one) pass the validator, and neither works without its acorns', () => {
  for (const s of SEEDS) {
    const st = buildProtoStage(cfg, s, '1-4');
    const rooms = st.kit!.rooms;
    assert.equal(rooms.length, 2, `seed ${s}`);
    assert.deepEqual(validateStage(st).errors.filter((e) => e.startsWith('room ')), [], `seed ${s}`);
    const mouths = rooms.map((r) => (r.pieces.find((p) => p.kind === 'basket') as { mouth: number }).mouth);
    assert.ok(mouths[0] <= 120 && mouths[1] > 200, `seed ${s}: low, then high (${mouths})`);
    // the first in the test (the zigzag), the second near the crown; each narrow and tall enough for both orientations
    const test1 = st.proto.beats.find((b) => b[2].startsWith('Test'))!;
    const box = rooms.map((r) => roomBox(r, st.platforms));
    assert.ok(box[0].y1 <= test1[0] + 1 && box[0].y0 >= test1[1] - 600, `seed ${s}: the first lift is in the zigzag`);
    assert.ok(box[1].y1 < box[0].y0, `seed ${s}: the second is higher up`);
    for (const b of box) assert.ok(b.x1 - b.x0 <= 800 && b.y1 - b.y0 <= 540, `seed ${s}: a room ${Math.round(b.x1 - b.x0)} x ${Math.round(b.y1 - b.y0)}`);
    // no snake in a lift room
    for (const b of box) assert.ok(!st.enemies.some((e) => e.x > b.x0 - 100 && e.x < b.x1 + 100 && e.y > b.y0 - 100 && e.y < b.y1 + 100), `seed ${s}: a snake by a lift`);
    // without the acorns the ledge above is out of reach
    for (let i = 0; i < 2; i++) {
      const t = buildProtoStage(cfg, s, '1-4');
      t.kit!.rooms[i].pieces = t.kit!.rooms[i].pieces.filter((p) => p.kind !== 'item' && p.kind !== 'source');
      assert.ok(validateStage(t).errors.some((e) => e.startsWith(`room ${t.kit!.rooms[i].id}:`)), `seed ${s}: ${t.kit!.rooms[i].id} without acorns`);
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

test('1-4 in the real engine: the low basket takes a tap, the high one a throw, and each lift carries him up to the ledge', () => {
  const r = new RealPlay('1-4', 1);
  const kit = kitOf(r);
  for (const ri of [0, 1]) {
    const room = kit.rooms[ri];
    const stash = room.sources[0];
    const lift = room.lifts[0];
    const up = r.platforms.find((p) => p.id === room.spec.beyond.on)!;
    // fetch an acorn from the squirrels' stash
    r.stand(stash.x - 40, stash.y);
    face(r, 1);
    r.frame({ punch: true });
    assert.ok(kit.holding, `room ${ri}: a tap by the stash picks one up`);
    // onto the lift, facing the basket
    // (on its near half: a tap reaches the low basket from there, and a flick up lands the acorn in the high one)
    walkTo(r, lift.plat.x + (ri === 0 ? 20 : 45));
    face(r, -1);
    const y0 = r.p.y;
    if (ri === 0) r.frame({ punch: true });
    else r.frame({ press: true });
    r.wait(3.5);
    assert.ok(!kit.holding, `room ${ri}: the acorn is in the basket`);
    assert.equal(room.baskets[0].count, 1, `room ${ri}`);
    assert.ok(r.p.y < y0 - 250, `room ${ri}: he rode the lift up (${Math.round(y0)} -> ${Math.round(r.p.y)})`);
    walkTo(r, up.x + up.width / 2);
    assert.ok(Math.abs(r.p.y - up.y) < 3, `room ${ri}: on the ledge up there (${Math.round(r.p.x)}, ${Math.round(r.p.y)} vs ${up.y})`);
  }
});
