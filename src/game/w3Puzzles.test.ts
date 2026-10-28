/**
 * World 3's puzzle rooms (2026-10-28), built from the puzzle kit (puzzleKit.ts): 3-2's glowing mushroom (the carried light: a ledge that is
 * there only in its glow, then one so high that the light has to be thrown up after it), 3-5's awake thorn vines (a bell to ring for the
 * first, then pebbles to throw: the vine strikes the noise and listens to it while he walks by), and 3-7's "Which fern?" (Dot's marking
 * stones by the ferns, shown only by the mushroom's light; the twin of the stone by the door tells the fern). Their layout and check, and
 * each played in the real engine.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildProtoStage, G, W3_PUZZLES } from './protoStage.ts';
import { validateStage } from './levelCheck.ts';
import { anchorAt, isLit, ITEM, kitPlatId, ledgeLit, roomBox, type PieceSpec, type RoomSpec } from './puzzleKit.ts';
import { inReach, vinePhase, vineSees } from './thornVine.ts';
import { RealPlay } from './realPlay.ts';
import type { KitPlay } from './puzzlePlay.ts';
import type { LevelConfig } from './types.ts';

type W3 = '3-2' | '3-5' | '3-7';
const TYPE: Record<W3, LevelConfig['objectiveType']> = { '3-2': 'stealth', '3-5': 'stealth', '3-7': 'relic_hunt' };
const cfg = (id: W3): LevelConfig =>
  ({
    worldIndex: 3, miniIndex: Number(id.split('-')[1]), id, name: id, objectiveType: TYPE[id], targetCount: 1, timeLimit: 0, levelWidth: 9000,
    levelHeight: 900, description: '', unlocked: true, completed: false, stars: 0, highScore: 0, bestTime: 0,
  }) as LevelConfig;
const SEEDS = Array.from({ length: 10 }, (_, i) => 1 + i * 37);
const build = (id: W3, s: number) => buildProtoStage(cfg(id), s, id);
const roomErrors = (st: ReturnType<typeof build>, id?: string) => validateStage(st).errors.filter((e) => e.startsWith(id ? `room ${id}:` : 'room '));
const piece = <K extends PieceSpec['kind']>(r: RoomSpec, k: K) => r.pieces.filter((p): p is Extract<PieceSpec, { kind: K }> => p.kind === k);

test('World 3: the stages with puzzle rooms are the ones listed (their pieces load with the stage), and each room is fit to learn in', () => {
  for (const id of ['3-2', '3-5', '3-7'] as W3[]) {
    assert.ok(W3_PUZZLES.has(id));
    for (const s of SEEDS) {
      const st = build(id, s);
      assert.ok(st.kit && st.kit.rooms.length >= 2, `${id} seed ${s}`);
      assert.deepEqual(roomErrors(st), [], `${id} seed ${s}`);
      for (const r of st.kit!.rooms) {
        const b = roomBox(r, st.platforms);
        // narrow and tall enough for an upright phone and a sideways one; Dot says what the room is about as he comes in
        assert.ok(b.x1 - b.x0 <= 860 && b.y1 - b.y0 <= 600, `${id} seed ${s}: ${r.id} is ${Math.round(b.x1 - b.x0)} wide, ${b.y1 - b.y0} tall`);
        assert.ok(r.tips?.enter, `${id} seed ${s}: ${r.id} says nothing as he comes in`);
        // no animal in or near it, no water under it, no flag inside it
        assert.ok(!st.enemies.some((e) => e.patrolMaxX > b.x0 - 300 && e.patrolMinX < b.x1 + 300), `${id} seed ${s}: an animal by ${r.id}`);
        assert.ok(st.platforms.filter((p) => r.ground.includes(p.id)).every((p) => p.y < st.waterY! - 40), `${id} seed ${s}: ${r.id} stands in the water`);
        assert.ok(!(st.checkpoints ?? []).some((c) => c.x > b.x0 && c.x < b.x1), `${id} seed ${s}: a flag inside ${r.id}`);
      }
    }
  }
});

test('3-2: the mushroom rooms: a ledge there only in the glow, the way up out of the patch\'s light, and the high one out of any light on the floor', () => {
  for (const s of SEEDS) {
    const st = build('3-2', s);
    const rooms = st.kit!.rooms;
    // (the variety pass: the glow room always teaches first; the finish's room is the high glow room, or on some rolls the stone plates)
    const names = rooms.map((r) => r.id.replace(/-\d+$/, ''));
    assert.equal(names[0], 'glow', `seed ${s}`);
    assert.ok(names.slice(1).every((n) => ['glowHigh', 'plate', 'platesTwo'].includes(n)) && names.length >= 2, `seed ${s}: ${names}`);
    rooms.forEach((r, ri) => {
      if (!r.id.startsWith('glow')) return;
      const src = anchorAt(piece(r, 'source')[0].at, st.platforms)!;
      const patch = [{ x: src.x, y: src.y - ITEM.mushroom.r, r: ITEM.mushroom.light! }];
      const lit = (id: string) => {
        const p = st.platforms.find((q) => q.id === kitPlatId(ri, id, 0))!;
        assert.ok(p.broken, `seed ${s}: ${id} is solid in the dark`);
        return (lights: typeof patch) => ledgeLit(p.x, p.x + p.width, p.y, lights);
      };
      // the way up is dark while the mushroom lies at its patch
      assert.ok(!lit(r.exit)(patch), `seed ${s}: ${r.id}'s way up is lit from the patch`);
      // the room is in the dark, and fails its check without the mushroom
      assert.ok((st.zones ?? []).some((z) => z.kind === 'dark' && z.x0 < src.x && z.x1 > src.x), `seed ${s}: ${r.id} is not in the dark`);
      const t = build('3-2', s);
      t.kit!.rooms[ri].pieces = t.kit!.rooms[ri].pieces.filter((p) => p.kind !== 'item');
      assert.ok(roomErrors(t, r.id).some((e) => e.includes('can never be opened')), `seed ${s}: ${r.id} opens with no mushroom`);
      if (r.id.startsWith('glowHigh')) {
        // no light lying anywhere on the room's floor reaches the last ledge: it has to go higher (thrown onto the stones)
        const floor = st.platforms.find((p) => p.id === r.ground[0])!;
        for (let fx = floor.x; fx <= floor.x + floor.width; fx += 10) assert.ok(!lit(r.exit)([{ x: fx, y: floor.y - ITEM.mushroom.r, r: ITEM.mushroom.light! }]), `seed ${s}: lit from the floor at ${fx}`);
        const t2 = build('3-2', s);
        t2.kit!.rooms[ri].ground = [r.ground[0]];
        assert.ok(roomErrors(t2, r.id).length > 0, `seed ${s}: ${r.id} can be done without lifting the light`);
      } else {
        // the room shows the idea first: the little ledge by the patch is lit from the start
        assert.ok(lit(`show${r.exit.slice(3)}`)(patch), `seed ${s}: the shown ledge is dark`);
      }
    });
  }
});

test('3-5: an awake vine never sleeps, and sees whatever moves in its reach unless it is listening to a noise', () => {
  for (const s of SEEDS) {
    const st = build('3-5', s);
    const rooms = st.kit!.rooms;
    // (the variety pass: after the pebbles, two awake vines or World 3's two stone plates)
    const names = rooms.map((r) => r.id.replace(/-\d+$/, ''));
    assert.deepEqual(names.slice(0, 2), ['vineBell', 'pebbles'], `seed ${s}`);
    assert.ok(['pebblesTwo', 'platesTwo'].includes(names[2]) && names.length === 3, `seed ${s}: ${names}`);
    const awake = (st.proto.thorns ?? []).filter((v) => v.awake);
    assert.equal(awake.length, names[2] === 'pebblesTwo' ? 4 : 2, `seed ${s}`);
    for (const r of rooms.filter((q) => !q.id.startsWith('plates'))) {
      const b = roomBox(r, st.platforms);
      const mine = awake.filter((v) => v.x > b.x0 && v.x < b.x1);
      assert.equal(mine.length, r.id.startsWith('pebblesTwo') ? 2 : 1, `seed ${s}: ${r.id}`);
      // the way on is past every one of them
      const beyond = anchorAt(r.beyond, st.platforms)!;
      assert.ok(mine.every((v) => !inReach(v, beyond.x, G) && beyond.x > v.x), `seed ${s}: ${r.id}'s way on is in a vine's reach`);
    }
    for (const v of awake) for (const t of [0, 1.3, 2.9, 4.4, 5.9, 7.7]) {
      assert.equal(vinePhase(v, t).phase, 'look');
      assert.ok(vineSees(v, t, { x: v.x + 30, y: G, vx: 200, grounded: true }));
      assert.ok(!vineSees(v, t, { x: v.x + 30, y: G, vx: 200, grounded: true }, true), 'listening');
      assert.ok(!vineSees(v, t, { x: v.x + 30, y: G, vx: 0, grounded: true }), 'standing still');
    }
  }
});

test('3-7: which fern? one stone by the ferns is the twin of the one by the door, and that fern holds the thing; only the light shows them', () => {
  for (const s of SEEDS) {
    const st = build('3-7', s);
    const rooms = st.kit!.rooms;
    const riddles = rooms.filter((r) => r.id.startsWith('whichFern'));
    assert.equal(riddles.length, 2, `seed ${s}`);
    assert.ok(rooms.every((r) => /^(whichFern|plate)-/.test(r.id)), `seed ${s}`);
    for (const r of riddles) {
      const src = anchorAt(piece(r, 'source')[0].at, st.platforms)!;
      const patch = [{ x: src.x, y: src.y - ITEM.mushroom.r, r: ITEM.mushroom.light! }];
      const marks = piece(r, 'mark').map((m) => ({ ...m, ...anchorAt(m.at, st.platforms)! }));
      const key = marks.find((m) => m.id.startsWith('key'))!;
      const stones = marks.filter((m) => m !== key);
      // the stone by the door shows from the start; the ones by the ferns only once the light is brought to them
      assert.ok(isLit(key.x, key.y - 40, patch), `seed ${s}: the door's stone is dark`);
      assert.ok(stones.every((m) => !isLit(m.x, m.y - 40, patch)), `seed ${s}: a fern's stone shows from the door`);
      assert.equal(stones.length, 2);
      const twins = stones.filter((m) => m.look === key.look);
      assert.equal(twins.length, 1, `seed ${s}: ${twins.length} stones like the door's`);
      // the thing is in the fern the twin stands at (on its left foot), it is a riddle (no "hold down" over it), and nothing else is there
      const b = roomBox(r, st.platforms);
      const things = st.collectibles.filter((c) => c.type === 'relic' && c.x > b.x0 && c.x < b.x1);
      assert.equal(things.length, 1, `seed ${s}`);
      assert.ok(things[0].riddle && things[0].hidden, `seed ${s}`);
      assert.ok(Math.abs(things[0].x - 68 - twins[0].x) < 2, `seed ${s}: the thing is not at the marked fern`);
      // three ferns, painted alike, every one rustling on a beat of its own
      const ferns = (st.proto.w3decor ?? []).filter((d) => d.n === 'fern' && d.x > b.x0 && d.x < b.x1);
      assert.equal(ferns.length, 3, `seed ${s}`);
      assert.ok(ferns.every((f) => f.rustle !== undefined && f.w === 150), `seed ${s}`);
      // carried along the ferns, the light shows each stone in turn
      for (const m of stones) assert.ok(isLit(m.x, m.y - 40, [{ x: m.x + 60, y: G - 86, r: ITEM.mushroom.light! }]));
    }
    // over the stage, the riddles' things are two of the eleven or so it holds
    assert.ok(st.collectibles.filter((c) => c.type === 'relic').length >= 9, `seed ${s}`);
  }
});

// ───────────────────────────── in the real engine ─────────────────────────────

const kitOf = (r: RealPlay) => r.e.kit as KitPlay;
/** the first layout of a stage whose roll has a room of this kind (the rooms vary with the roll: w3Sections.ts) */
const withRoom = (id: W3, prefix: string) => {
  for (let s = 1; s < 400; s++) if (build(id, s).kit?.rooms.some((q) => q.id.startsWith(`${prefix}-`))) return s;
  throw new Error(`no roll of ${id} has a ${prefix} room`);
};
const roomRun = (r: RealPlay, prefix: string) => kitOf(r).rooms.find((q) => q.spec.id.startsWith(`${prefix}-`))!;
const walkTo = (r: RealPlay, x: number, max = 600) => {
  for (let i = 0; i < max && Math.abs(r.p.x - x) > 8; i++) r.frame(r.p.x < x ? { right: true } : { left: true });
  r.frame();
};
const face = (r: RealPlay, d: 1 | -1) => {
  r.frame(d > 0 ? { right: true } : { left: true });
  r.frame();
};
const pickUp = (r: RealPlay, x: number) => {
  r.stand(x - 30, G);
  face(r, 1);
  r.frame({ punch: true });
  r.frame();
};

test('3-2 in play: the little ledge by the patch is there in its glow; the mushroom carried to the bank and set down there lights the way up', () => {
  const r = new RealPlay('3-2', 1);
  const room = roomRun(r, 'glow');
  const [show, step, way] = room.ledges;
  r.stand(room.box.x0 + 10, G);
  r.wait(0.5);
  assert.ok(show.lit && !show.plat.broken, 'the shown ledge is there in the glow');
  assert.ok(!way.lit && way.plat.broken, 'the way up is not');
  pickUp(r, room.sources[0].x);
  assert.ok(kitOf(r).holding, 'picked up');
  walkTo(r, step.plat.x - 40);
  face(r, 1);
  r.frame({ punch: true });
  r.wait(0.8);
  assert.ok(!kitOf(r).holding, 'set down');
  assert.ok(step.lit && way.lit && !way.plat.broken, 'both ledges up are lit, and solid');
});

test('3-2 in play: the high room\'s last ledge stays dark from the floor, and lights once the mushroom is thrown up onto the stone', () => {
  const r = new RealPlay('3-2', withRoom('3-2', 'glowHigh'));
  const room = roomRun(r, 'glowHigh');
  const way = room.ledges[0];
  const stone = r.platforms.find((p) => p.id === room.spec.ground[1])!;
  pickUp(r, room.sources[0].x);
  // carrying, he can go no further than the stone's foot (no jumping with his hands full)
  walkTo(r, stone.x + 60, 300);
  assert.ok(r.p.x < stone.x, `stopped at the stone (${Math.round(r.p.x - stone.x)})`);
  face(r, 1);
  r.frame({ punch: true });
  r.wait(0.8);
  assert.ok(!way.lit, 'set down on the floor, the light does not reach it');
  const it = room.items[0];
  r.stand(it.x - 30, G);
  face(r, 1);
  r.frame({ punch: true });
  r.frame();
  assert.ok(kitOf(r).holding);
  walkTo(r, stone.x + 60, 300);
  face(r, 1);
  r.frame({ press: true });
  r.wait(1.5);
  assert.ok(it.mode === 'rest' && it.y < G - 60, `up on the stones (${it.mode}, ${Math.round(it.y)})`);
  assert.ok(way.lit && !way.plat.broken, 'the last ledge is there');
});

test('3-5 in play: the awake vine swats him back out of its reach and costs no heart; a rung bell or a thrown pebble lets him by', () => {
  const r = new RealPlay('3-5', 1);
  r.safe = false;
  const vineIn = (prefix: string) => {
    const box = roomRun(r, prefix).box;
    return r.e.proto.thorns.filter((v: { awake?: boolean; x: number }) => v.awake && v.x > box.x0 && v.x < box.x1);
  };
  // no noise: he runs in and is swatted back out of reach, still on full hearts
  const [v] = vineIn('pebbles');
  r.stand(v.x - 220, G);
  const hp = r.p.hp;
  let furthest = -Infinity;
  for (let i = 0; i < 50; i++) { r.frame({ right: true }); furthest = Math.max(furthest, r.p.x); }
  r.wait(0.8);
  assert.ok(furthest < v.x + v.reach, `he never got past (${Math.round(furthest - v.x)})`);
  assert.ok(r.p.x < v.x - v.reach, `swatted back out of its reach (${Math.round(r.p.x - v.x)})`);
  assert.equal(r.p.hp, hp, 'no heart lost');
  assert.ok(r.said.some((l) => l.text.startsWith('Swatted!')));
  // the bell: rung, the vine strikes at it and lets him walk by
  const bellRoom = roomRun(r, 'vineBell');
  const [bv] = vineIn('vineBell');
  r.stand(bellRoom.bells[0].x - 30, G);
  face(r, 1);
  r.frame({ punch: true });
  r.frame();
  assert.equal(kitOf(r).noises.length, 1, 'the bell rang');
  r.frame();
  assert.ok((r.e as unknown as { vineStruck: Map<number, number> }).vineStruck.size >= 1, 'the vine struck at the ring');
  for (let i = 0; i < 90; i++) r.frame({ right: true });
  assert.ok(r.p.x > bv.x + bv.reach + 20, `past the vine (${Math.round(r.p.x - bv.x)})`);
  assert.equal(r.p.hp, hp);
  // the pebble: thrown from outside its reach, it lands past the vine; he walks by while the vine listens
  r.wait(5);
  const room = roomRun(r, 'pebbles');
  pickUp(r, room.sources[0].x);
  assert.ok(kitOf(r).holding, 'a pebble in hand');
  walkTo(r, v.x - 190);
  r.frame({ kick: 1 });
  r.wait(0.7);
  const noise = kitOf(r).noises.at(-1)!;
  assert.ok(noise && noise.from === 'land' && Math.abs(noise.x - v.x) < 300, 'it landed with a clack by the vine');
  for (let i = 0; i < 90; i++) r.frame({ right: true });
  assert.ok(r.p.x > v.x + v.reach + 20, `past the vine (${Math.round(r.p.x - v.x)})`);
  assert.equal(r.p.hp, hp);
});

test('3-5 in play: one pebble between the two awake vines is heard by both, and he walks past the pair', () => {
  const r = new RealPlay('3-5', withRoom('3-5', 'pebblesTwo'));
  r.safe = false;
  const room = roomRun(r, 'pebblesTwo');
  const vs = r.e.proto.thorns.filter((v: { awake?: boolean; x: number }) => v.awake && v.x > room.box.x0 && v.x < room.box.x1);
  assert.equal(vs.length, 2);
  pickUp(r, room.sources[0].x);
  walkTo(r, vs[0].x - 190);
  r.frame({ kick: 1 });
  r.wait(0.7);
  const hp = r.p.hp;
  for (let i = 0; i < 120; i++) r.frame({ right: true });
  assert.ok(r.p.x > vs[1].x + vs[1].reach + 20, `past both (${Math.round(r.p.x - vs[1].x)})`);
  assert.equal(r.p.hp, hp);
});

test('3-7 in play: beside the right fern nothing says so; the stones show in the carried light; crouching at the marked fern finds the thing', () => {
  const r = new RealPlay('3-7', 1);
  const room = roomRun(r, 'whichFern');
  const key = room.marks.find((m) => m.spec.id.startsWith('key'))!;
  const twin = room.marks.find((m) => m !== key && m.spec.look === key.spec.look)!;
  const thing = r.collectibles.find((c) => c.riddle && c.x > room.box.x0 && c.x < room.box.x1)!;
  r.stand(room.box.x0 + 10, G);
  r.wait(0.6);
  assert.ok(key.show > 0.5, 'the door\'s stone shows in the patch\'s light');
  assert.ok(twin.show < 0.05, 'the fern\'s stone does not');
  // walking past the right fern with empty hands: no "hold down", and no stone shows
  r.stand(thing.x - 10, G);
  r.wait(0.5);
  assert.equal(thing.near, false);
  assert.ok(twin.show < 0.05);
  // with the mushroom, its stone shows; crouching there finds the thing
  pickUp(r, room.sources[0].x);
  walkTo(r, twin.x + 20);
  r.wait(0.6);
  assert.ok(twin.show > 0.5, 'the light shows the twin');
  face(r, 1);
  r.frame({ punch: true });
  r.wait(0.4);
  r.stand(thing.x, G);
  for (let i = 0; i < 90 && !thing.collected; i++) r.frame({ down: true });
  assert.ok(thing.collected, 'Grandma\'s thing, found');
});

// ───────────────────────────── World 3's stone plates (the variety pass, 2026-10-28) ─────────────────────────────

test('World 3 stone plates: a root gate a plate holds open, a pebble heap by the door; fails without the pebbles, and on some rolls of 3-2, 3-5 and 3-7', () => {
  let seen = 0;
  for (const id of ['3-2', '3-5', '3-7'] as W3[]) {
    for (let s = 1; s < 60; s++) {
      const st = build(id, s);
      for (const [ri, r] of (st.kit?.rooms ?? []).entries()) {
        if (!/^plates?(Two)?-/.test(r.id)) continue;
        seen++;
        assert.deepEqual(roomErrors(st, r.id), [], `${id} seed ${s}`);
        const plates = piece(r, 'plate');
        assert.equal(plates.length, r.id.startsWith('platesTwo') ? 2 : 1);
        assert.equal(piece(r, 'gate')[0].look, 'roots');
        // without the pebbles nothing holds the plate down once he steps off it to go through
        const t = build(id, s);
        t.kit!.rooms[ri].pieces = t.kit!.rooms[ri].pieces.filter((p) => p.kind !== 'item');
        assert.ok(roomErrors(t, r.id).length > 0, `${id} seed ${s}: ${r.id} opens with no pebble`);
      }
    }
  }
  assert.ok(seen >= 6, `only ${seen} plate rooms in 180 rolls`);
});

test('World 3 stone plate in play: a pebble set on the plate holds the roots open, and he walks through; stepping off without one shuts them', () => {
  const r = new RealPlay('3-2', withRoom('3-2', 'plate'));
  const room = roomRun(r, 'plate');
  const gate = room.gates[0];
  const plate = room.plates[0];
  // standing on the plate opens the roots; stepping off shuts them
  r.stand(room.sources[0].x - 60, G);
  walkTo(r, plate.x);
  r.wait(0.6);
  assert.ok(plate.down, 'pressed under him');
  walkTo(r, plate.x - 120);
  r.wait(0.6);
  assert.ok(!plate.down, 'up again once he steps off');
  pickUp(r, room.sources[0].x);
  assert.ok(kitOf(r).holding, 'a pebble in hand');
  walkTo(r, plate.x - 10);
  face(r, 1);
  r.frame({ punch: true });
  r.wait(0.8);
  assert.ok(plate.down, 'the pebble holds it down');
  for (let i = 0; i < 150; i++) r.frame({ right: true });
  assert.ok(r.p.x > gate.x + 30, `through the roots (${Math.round(r.p.x - gate.x)})`);
});
