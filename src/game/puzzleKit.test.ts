import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BEETLE, evalWire, falseLeaves, flyAll, ITEM, KIT, setDownX, stepBeetle, throwStart, useReach, wireIds, type BeetleState, type FlightWorld,
} from './puzzleKit.ts';
import { roomLean, roomZoom, ROOM_CAM } from './puzzleCamera.ts';
import { KitPlay, STUCK, type KitHost } from './puzzlePlay.ts';
import { buildKitStage, kitStageConfig } from './kitStage.ts';
import { RealPlay } from './realPlay.ts';
import type { Platform, PlayerState } from './types.ts';

const G = 580;
const floor: Platform = { id: 1, x: 0, y: G, width: 2000, height: 90, type: 'solid' };
const world = (extra: Partial<FlightWorld> = {}): FlightWorld => ({ platforms: [floor], box: { x0: 0, x1: 2000, y0: 0, y1: 700 }, baskets: [], levers: [], ...extra });

// ───────────────────────────── wires ─────────────────────────────

test('a wire reads its pieces: all, any and not, and lists what is still to do', () => {
  const on = new Set(['a']);
  const out = (id: string) => on.has(id);
  assert.equal(evalWire('a', out), true);
  assert.equal(evalWire({ all: ['a', 'b'] }, out), false);
  assert.equal(evalWire({ any: ['a', 'b'] }, out), true);
  assert.equal(evalWire({ not: 'b' }, out), true);
  assert.deepEqual(falseLeaves({ all: ['a', 'b', 'c'] }, out), ['b', 'c']);
  on.add('b');
  on.add('c');
  assert.equal(evalWire({ all: ['a', { any: ['b', 'z'] }, { not: 'z' }] }, out), true);
  assert.deepEqual(falseLeaves({ all: ['a', 'b', 'c'] }, out), []);
  assert.deepEqual(wireIds({ all: ['a', { not: 'q' }] }), ['a', 'q']);
});

// ───────────────────────────── throws and set-downs ─────────────────────────────

test('a throw up rises and comes down a little in front of him; a throw forward goes much further; both land on the ground', () => {
  const up = flyAll(throwStart('up', 500, G, 1), world());
  const fwd = flyAll(throwStart('fwd', 500, G, 1), world());
  assert.equal(up.end.kind, 'ground');
  assert.equal(fwd.end.kind, 'ground');
  const ux = up.end.kind === 'ground' ? up.end.x : 0;
  const fx = fwd.end.kind === 'ground' ? fwd.end.x : 0;
  assert.ok(ux > 560 && ux < 700, `up lands at ${ux}`);
  assert.ok(fx > 0, `forward lands at ${fx}`);
  assert.ok(fx > ux + 150, `forward lands at ${fx}`);
  // facing left mirrors it
  const back = flyAll(throwStart('up', 500, G, -1), world());
  assert.ok(back.end.kind === 'ground' && Math.abs(500 - back.end.x - (ux - 500)) < 2);
});

test('a throw lands on a plate when it comes down on one, and drops into a basket mouth from above', () => {
  const up = flyAll(throwStart('up', 500, G, 1), world());
  const at = up.end.kind === 'ground' ? up.end.x : NaN;
  // the same arc with a basket mouth where it comes down at the height of its mouth
  const mouthY = G - 200;
  // (where the arc crosses mouthY falling)
  const b = throwStart('up', 500, G, 1);
  let x = NaN;
  for (let i = 0; i < 400; i++) {
    const py = b.y;
    b.vy += 1500 / 60;
    b.x += b.vx / 60;
    b.y += b.vy / 60;
    if (b.vy > 0 && py <= mouthY && b.y >= mouthY) { x = b.x; break; }
  }
  const inBasket = flyAll(throwStart('up', 500, G, 1), world({ baskets: [{ x, y: mouthY, half: KIT.mouthHalf }] }));
  assert.deepEqual(inBasket.end, { kind: 'basket', idx: 0 });
  // a plate is ground: what lands at its x is on it (puzzleKit onPlate)
  assert.ok(Math.abs(at - 600) < 100);
});

test('a throw bounces off a shut gate, and knocks a lever it passes', () => {
  const wall: Platform = { id: 2, x: 620, y: G - 330, width: 90, height: 330, type: 'solid' };
  const r = flyAll(throwStart('fwd', 500, G, 1), world({ platforms: [floor, wall] }));
  assert.ok(r.end.kind === 'ground' && r.end.x < 620, JSON.stringify(r.end));
  const lever = flyAll(throwStart('fwd', 500, G, 1), world({ levers: [{ x0: 560, x1: 600, y0: G - 200, y1: G }] }));
  assert.deepEqual(lever.knocked, [0]);
});

test('out of the room, a thrown thing is lost', () => {
  const r = flyAll(throwStart('fwd', 500, G, 1), world({ box: { x0: 400, x1: 620, y0: 0, y1: 700 } }));
  assert.equal(r.end.kind, 'lost');
});

test('a set-down snaps onto a plate in reach in front of him, else lands just in front of his feet; reach is forgiving, more on Easy', () => {
  assert.equal(useReach(false), KIT.reach * 1.25);
  assert.equal(useReach(true), KIT.reach * 1.6);
  assert.equal(setDownX(500, 1, [560], useReach(false)), 560);
  assert.equal(setDownX(500, 1, [440], useReach(false)), 500 + KIT.setDown);
  assert.equal(setDownX(500, -1, [440], useReach(false)), 440);
  assert.equal(setDownX(500, 1, [585], useReach(false)), 500 + KIT.setDown);
  assert.equal(setDownX(500, 1, [585], useReach(true)), 585);
});

test('the cake is too light to press a plate (its beetle is what presses one); acorns and stones are not', () => {
  assert.equal(ITEM.cake.weight, 0);
  assert.ok(ITEM.cake.food && !ITEM.acorn.food);
  assert.ok(ITEM.acorn.weight >= 1 && ITEM.stone.weight > ITEM.acorn.weight);
});

// ───────────────────────────── the beetle ─────────────────────────────

const beetle = (x: number): BeetleState => ({ mode: 'idle', x, plat: 1, dir: -1, t: 0, food: -1 });
const run = (b: BeetleState, foods: Array<{ idx: number; plat: number; x: number }>, secs: number, walls: number[] = []) => {
  let ate = -1;
  for (let t = 0; t < secs; t += 1 / 30) {
    const a = stepBeetle(b, 1 / 30, ate >= 0 ? [] : foods, BEETLE.sight, { x0: 0, x1: 2000 }, walls);
    if (a >= 0) ate = a;
  }
  return ate;
};

test('the beetle walks to food it can see, stops with its mouth at it, eats it, and falls asleep there for good', () => {
  const b = beetle(700);
  const ate = run(b, [{ idx: 3, plat: 1, x: 560 }], 12);
  assert.equal(ate, 3);
  assert.equal(b.mode, 'sleep');
  assert.equal(b.x, 560 + BEETLE.mouth);
  run(b, [{ idx: 4, plat: 1, x: 640 }], 5);
  assert.equal(b.mode, 'sleep');
  assert.equal(b.x, 560 + BEETLE.mouth);
});

test('the beetle does not see food out of its sight, on another ledge, or behind a shut gate', () => {
  const far = beetle(700);
  run(far, [{ idx: 0, plat: 1, x: 700 - BEETLE.sight - 20 }], 5);
  assert.equal(far.mode, 'idle');
  const other = beetle(700);
  run(other, [{ idx: 0, plat: 2, x: 650 }], 5);
  assert.equal(other.mode, 'idle');
  const walled = beetle(700);
  run(walled, [{ idx: 0, plat: 1, x: 600 }], 5, [650]);
  assert.equal(walled.mode, 'idle');
});

test('picked up while it walks to it, the food is forgotten: the beetle stops and looks about again', () => {
  const b = beetle(700);
  for (let i = 0; i < 4; i++) stepBeetle(b, 0.1, [{ idx: 0, plat: 1, x: 560 }], BEETLE.sight, { x0: 0, x1: 2000 }, []);
  assert.equal(b.mode, 'walk');
  stepBeetle(b, 0.1, [], BEETLE.sight, { x0: 0, x1: 2000 }, []);
  assert.equal(b.mode, 'idle');
  assert.ok(b.x < 700 && b.x > 560);
});

// ───────────────────────────── the camera ─────────────────────────────

test('in a room the view leans 35% toward the puzzle part and pulls back to fit both, never below three quarters', () => {
  assert.deepEqual(roomLean(0, 0, 100, -200), { x: 35, y: -70 });
  assert.equal(ROOM_CAM.lean, 0.35);
  // near: no zoom; far: zoomed out, but never past 0.75 (upright 415 x 900 and sideways 1170 x 540)
  assert.equal(roomZoom(1170, 540, 500, 500, 600, 480), 1);
  assert.ok(roomZoom(415, 900, 500, 500, 900, 480) < 1);
  assert.equal(roomZoom(415, 900, 500, 500, 3000, 480), ROOM_CAM.minZoom);
  assert.equal(roomZoom(1170, 540, 500, 535, 520, -400), ROOM_CAM.minZoom);
});

// ───────────────────────────── the rooms in play (the real engine) ─────────────────────────────

const walkTo = (r: RealPlay, x: number) => {
  for (let i = 0; i < 400 && Math.abs(r.p.x - x) > 8; i++) r.frame(r.p.x < x ? { right: true } : { left: true });
  r.frame();
};
const face = (r: RealPlay, d: 1 | -1) => {
  r.frame(d > 0 ? { right: true } : { left: true });
  r.frame();
};
const kitOf = (r: RealPlay) => r.e.kit as KitPlay;

test('the test room plays through in the real engine: carry to a plate, lure the beetle, throw into the basket and ride the lift', () => {
  const r = new RealPlay('kit', 1);
  const kit = kitOf(r);
  // 1. carry: the gate opens while the acorn lies on the plate
  r.stand(500, G);
  face(r, 1);
  r.frame({ punch: true });
  assert.ok(kit.holding, 'a tap by the acorn picks it up (not a punch)');
  walkTo(r, 690);
  face(r, 1);
  r.frame({ punch: true });
  r.wait(0.6);
  assert.ok(!kit.holding);
  assert.equal(kit.rooms[0].plates[0].down, true);
  assert.equal(kit.rooms[0].gates[0].open, true);
  walkTo(r, 990);
  assert.ok(r.p.x > 980, `through the first gate (${r.p.x})`);
  // 2. lure: the cake on the far plate, the beetle eats and sleeps on it, then Pokey on the near one
  walkTo(r, 1370);
  face(r, 1);
  r.frame({ punch: true });
  assert.ok(kit.holding);
  walkTo(r, 1540);
  face(r, 1);
  r.frame({ punch: true });
  r.wait(6);
  assert.equal(kit.rooms[1].beetles[0].st.mode, 'sleep');
  assert.equal(kit.rooms[1].plates[1].down, true, 'the beetle asleep presses the far plate');
  assert.equal(kit.rooms[1].gates[0].open, false, 'one plate is not enough');
  walkTo(r, 1222);
  r.wait(0.3);
  assert.equal(kit.rooms[1].gates[0].open, true);
  walkTo(r, 1840);
  assert.ok(r.p.x > 1830, 'the gate latched open behind him');
  // 3. throw: from the lift, up into the basket; the lift rises with him to the cliff
  walkTo(r, 2010);
  face(r, -1);
  r.frame({ punch: true });
  assert.ok(kit.holding);
  walkTo(r, 2280);
  face(r, -1);
  const y0 = r.p.y;
  r.frame({ press: true });
  r.wait(3.5);
  assert.ok(!kit.holding);
  assert.equal(kit.rooms[2].baskets[0].count, 1);
  assert.ok(r.p.y < y0 - 250, `he rode the lift up (${r.p.y})`);
  walkTo(r, 2500);
  assert.ok(r.p.x > 2490 && r.p.y < G - 250, 'on the cliff top');
});

test('carrying, he cannot jump (the flick up throws), cannot climb a trunk, and walks slower', () => {
  const r = new RealPlay('kit', 1);
  const kit = kitOf(r);
  r.stand(300, G);
  for (let i = 0; i < 30; i++) r.frame({ right: true });
  const free = r.p.x - 300;
  r.stand(500, G);
  face(r, 1);
  r.frame({ punch: true });
  assert.ok(kit.holding);
  // a trunk right here: up does not grab it while his hands are full
  r.e.vines.push({ id: 99, x: r.p.x, topY: G - 300, bottomY: G - 6, swaySpeed: 0, swayPhase: 0, vineType: 'tree_climb' });
  for (let i = 0; i < 10; i++) r.frame({ up: true });
  assert.equal(r.p.climbing, false);
  r.e.vines.pop();
  const x0 = r.p.x;
  for (let i = 0; i < 30; i++) r.frame({ right: true });
  const carried = r.p.x - x0;
  assert.ok(carried < free * 0.8, `carrying ${carried.toFixed(0)} px vs ${free.toFixed(0)} free`);
  // the jump intent: no jump, a throw
  r.frame({ press: true });
  r.frame();
  assert.equal(r.p.grounded, true);
  assert.ok(!kit.holding, 'the flick up threw it');
});

test('the kick intent throws it forward, and a thing lost out of the room comes back to its source', () => {
  const r = new RealPlay('kit', 1);
  const kit = kitOf(r);
  r.stand(500, G);
  face(r, 1);
  r.frame({ punch: true });
  assert.ok(kit.holding);
  // facing left at the room's left edge: a forward throw sails out of the room
  walkTo(r, 440);
  face(r, -1);
  r.frame({ kick: -1 });
  assert.ok(!kit.holding);
  const it = kit.rooms[0].items[0];
  r.wait(1.2);
  assert.ok(it.mode === 'wait' || it.mode === 'fly', it.mode);
  r.wait(2.5);
  assert.equal(it.mode, 'rest');
  assert.ok(Math.abs(it.x - 548) < 4, `back under its tree (${it.x})`);
});

test('the signpost starts the room again: things home and the beetle awake at home', () => {
  const r = new RealPlay('kit', 1);
  const kit = kitOf(r);
  const room = kit.rooms[1];
  // the cake set down in the wrong place: the beetle sleeps off the plates
  r.stand(1380, G);
  face(r, 1);
  r.frame({ punch: true });
  walkTo(r, 1460);
  face(r, 1);
  r.frame({ punch: true });
  r.wait(9);
  assert.equal(room.beetles[0].st.mode, 'sleep');
  assert.equal(room.plates[1].down, false);
  walkTo(r, 1120);
  face(r, 1);
  r.frame({ punch: true });
  r.frame();
  assert.equal(room.beetles[0].st.mode, 'idle');
  assert.equal(room.beetles[0].st.x, 1690);
  assert.ok(room.items.every((it) => it.mode === 'rest' && Math.abs(it.x - it.home.x) < 1));
});

// ───────────────────────────── the stuck help ─────────────────────────────

const fakeHost = (p: PlayerState, easy: boolean, stuck: string[]): KitHost => ({
  t: 0, player: p, standingOn: 1, easy, tip: () => {}, float: () => {}, sfx: () => {}, stuck: (id) => stuck.push(id),
});

test('Easy: a silent sparkle on the important piece once he has been stuck in the room a while; Normal: nothing automatic', () => {
  for (const easy of [true, false]) {
    const st = buildKitStage(kitStageConfig());
    const kit = new KitPlay(st.kit!, st.platforms);
    const p = { x: 600, y: G, vx: 0, vy: 0, facing: 1, grounded: true, walkCycle: 0 } as unknown as PlayerState;
    const stuck: string[] = [];
    const h = fakeHost(p, easy, stuck);
    for (let t = 0; t < STUCK.calm + 1; t += 1 / 30) kit.step(1 / 30, h, st.platforms);
    assert.equal(kit.inRoom, 0);
    assert.equal(kit.sparkling(0), easy);
    assert.deepEqual(stuck, ['carry'], 'the hook for on-request hints is told either way');
    // the active part: the acorn (before it is picked up)
    assert.ok(Math.abs(kit.guideThings[0].x - 548) < 2);
  }
});

test('the active part: the thing to fetch first, then where it goes, then the part still waiting (the lure room: cake, far plate, near plate)', () => {
  const st = buildKitStage(kitStageConfig());
  const kit = new KitPlay(st.kit!, st.platforms);
  const p = { x: 1300, y: G, vx: 0, vy: 0, facing: 1, grounded: true, walkCycle: 0 } as unknown as PlayerState;
  const h = fakeHost(p, false, []);
  kit.step(1 / 30, h, st.platforms);
  assert.equal(kit.inRoom, 1);
  assert.ok(Math.abs(kit.guideThings[0].x - 1400) < 2, `the cake first (${kit.guideThings[0].x})`);
  const room = kit.rooms[1];
  // the cake on the far plate and the beetle asleep there: the near plate is what is left
  room.items[0].x = 1582;
  room.beetles[0].st = { ...room.beetles[0].st, mode: 'sleep', x: 1604 };
  kit.step(1 / 30, h, st.platforms);
  assert.ok(Math.abs(kit.guideThings[0].x - 1222) < 2, `then the near plate (${kit.guideThings[0].x})`);
});

test('turning back and forth with nothing changing also counts as stuck (Easy)', () => {
  const st = buildKitStage(kitStageConfig());
  const kit = new KitPlay(st.kit!, st.platforms);
  const p = { x: 600, y: G, vx: 0, vy: 0, facing: 1, grounded: true, walkCycle: 0 } as unknown as PlayerState;
  const h = fakeHost(p, true, []);
  let t = 0;
  for (; t < STUCK.turnsCalm + 0.5; t += 1 / 30) {
    p.vx = Math.floor(t * 2) % 2 ? 200 : -200;
    kit.step(1 / 30, h, st.platforms);
  }
  assert.equal(kit.sparkling(0), true);
});
