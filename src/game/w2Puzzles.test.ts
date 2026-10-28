/**
 * World 2's puzzle rooms (2026-10-28), built from the puzzle kit (puzzleKit.ts): the reed cages hung on pulleys over the water (2-3, 2-8),
 * lifted out by river stones in their counter-baskets; the ferry's raft behind its sluice (2-2); the court bell that opens the court
 * gate and calls the guards to look (2-9). Their rules, their check, and the rooms played in the real engine.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildW2Stage, type W2Plan } from './w2Stages.ts';
import { validateStage } from './levelCheck.ts';
import { generateAllLevels } from './worldsData.ts';
import { KitPlay, type KitHost } from './puzzlePlay.ts';
import { driftX, logClock } from './river.ts';
import { kitPlatId, type RoomSpec } from './puzzleKit.ts';
import { heard } from './noise.ts';
import { RealPlay } from './realPlay.ts';
import type { Collectible, LevelConfig, PlayerState } from './types.ts';

const levels = generateAllLevels();
const cfg = (id: W2Plan): LevelConfig => ({ ...levels.find((l) => l.id === id)!, unlocked: true });
const SEEDS = [1, 38, 75, 112];
const G = 580;

const host = (p: PlayerState, freed: Collectible[]): KitHost => ({
  t: 0, player: p, standingOn: -1, easy: false, tip: () => {}, float: () => {}, sfx: () => {},
  freeCage: (c) => {
    c.collected = true;
    freed.push(c);
  },
});
const idle = (x: number) => ({ x, y: G, vx: 0, vy: 0, facing: 1, grounded: true, walkCycle: 0 }) as unknown as PlayerState;

test('a hanging cage starts down in the water, rides its rope up as stones go in its basket, and opens all the way up', () => {
  for (const s of SEEDS) {
    const st = buildW2Stage(cfg('2-3'), s, '2-3');
    const kit = new KitPlay(st.kit!, st.platforms, { rivers: st.rivers, collectibles: st.collectibles });
    // the heavy cage (two stones): one stone lifts it halfway, the second all the way
    const ri = kit.rooms.findIndex((r) => (r.baskets[0].spec.need ?? 1) === 4 && r.baskets[0].spec.mouth < 200);
    const room = kit.rooms[ri];
    const lift = room.lifts[0];
    const cage = lift.cage!;
    assert.ok(kit.holdsCage(cage));
    const low = cage.y;
    assert.ok(Math.abs(low - (lift.plat.y - 26)) < 1, 'it hangs at the rope end');
    assert.ok(lift.plat.broken, 'nothing to stand on under a hanging cage');
    const freed: Collectible[] = [];
    const h = host(idle(room.box.x0 + 10), freed);
    const step = (sec: number) => { for (let t = 0; t < sec; t += 1 / 30) kit.step(1 / 30, h, st.platforms); };
    room.items[0].mode = 'basket';
    room.items[0].basket = 0;
    step(2);
    assert.ok(Math.abs(lift.level - 0.5) < 0.01, `one stone: halfway (${lift.level})`);
    assert.ok(cage.y < low - 20 && !cage.collected, 'up out of the water a way, still shut');
    room.items[1].mode = 'basket';
    room.items[1].basket = 0;
    step(2);
    assert.equal(lift.level, 1);
    assert.deepEqual(freed, [cage], 'all the way up, its floor drops open');
    assert.ok(Math.abs(cage.y - (lift.baseY - lift.spec.rise - 26)) < 1, 'it stays up, where the check placed it');
  }
});

test('the check: a cage room is solved only with its cage lifted; a basket the room cannot fill fails it', () => {
  const st = buildW2Stage(cfg('2-3'), 1, '2-3');
  assert.deepEqual(roomErrors(st), []);
  // (a basket asking for three stones, with two to hand: the cage never comes all the way up)
  const room = st.kit!.rooms.find((r) => r.pieces.filter((p) => p.kind === 'item').length === 2)!;
  const basket = room.pieces.find((p) => p.kind === 'basket')!;
  if (basket.kind === 'basket') basket.need = 6;
  const errs = roomErrors(st);
  assert.ok(errs.some((e) => e.includes(room.id) && e.includes('can never be opened')), errs.join('; '));
});

test('the across room: the stones lie on a reed island over a channel, and only a throw gets them to the basket', () => {
  for (const s of SEEDS) {
    const st = buildW2Stage(cfg('2-3'), s, '2-3');
    const on = (r: RoomSpec, k: 'source' | 'basket') => (r.pieces.find((p) => p.kind === k) as { at: { on: number } }).at.on;
    const room = st.kit!.rooms.find((r) => on(r, 'source') !== on(r, 'basket'))!;
    const src = room.pieces.find((p) => p.kind === 'source')!;
    const basket = room.pieces.find((p) => p.kind === 'basket')!;
    assert.ok('at' in src && 'at' in basket && src.at!.on !== basket.at.on, 'the pile and the basket on two pieces of ground');
    const isl = st.platforms.find((p) => p.id === (src as { at: { on: number } }).at.on)!;
    // (still water both sides of the island: no walking over with a stone)
    assert.ok(st.rivers!.some((r) => r.speed === 0 && Math.abs(r.x1 - isl.x) < 2) && st.rivers!.some((r) => r.speed === 0 && Math.abs(r.x0 - (isl.x + isl.width)) < 2));
  }
  assert.deepEqual(validateStage(buildW2Stage(cfg('2-3'), 1, '2-3')).errors, []);
});

test('2-8: every cage in the rising basins hangs off a reed island, and every room is solvable', () => {
  for (const s of SEEDS) {
    const st = buildW2Stage(cfg('2-8'), s, '2-8');
    assert.deepEqual(roomErrors(st), [], `seed ${s}`);
    assert.ok(st.collectibles.filter((c) => c.type === 'cage').every((c) => st.kit!.rooms.some((r) => r.pieces.some((p) => p.kind === 'lift' && p.cage === c.id))));
  }
});

test('the ferry: moored out of reach under the far bank while the sluice is shut; the lever lets the river run and brings it round', () => {
  for (const s of SEEDS) {
    const st = buildW2Stage(cfg('2-2'), s, '2-2');
    const ri = st.kit!.rooms.findIndex((r) => r.id.startsWith('ferry'));
    assert.ok(ri >= 0, 'a ferry room');
    const river = st.rivers!.find((r) => r.raft)!;
    assert.ok(river.safe, 'the first sluice: a splash costs nothing');
    assert.ok(river.x1 - river.x0 > 313 + 100, 'too wide for a double jump');
    const raft = st.platforms.find((p) => p.type === 'drift' && p.drift!.x0 === river.x0)!;
    const kit = new KitPlay(st.kit!, st.platforms, { rivers: st.rivers, collectibles: st.collectibles });
    const h = host(idle(river.x0 - 200), []);
    let t = 0;
    const step = (sec: number) => { for (let u = 0; u < sec; u += 1 / 30, t += 1 / 30) { h.t = t; kit.step(1 / 30, h, st.platforms); } };
    const at = () => driftX(raft.drift!, logClock(st.rivers, raft.drift!, t));
    step(3);
    const moored = at();
    assert.ok(moored > river.x1 - 30, `moored under the far bank (${Math.round(moored)} of ${river.x1})`);
    step(5);
    assert.ok(Math.abs(at() - moored) < 1, 'and it stays there');
    kit.rooms[ri].levers[0].on = true;
    // the current comes round: the raft out from under his bank and over the water within a couple of seconds
    step(2.5);
    assert.ok(at() > river.x0 - raft.width + 20 && at() < river.x0 + 200, `here it comes (${Math.round(at())})`);
  }
});

test('the court bell: a tap rings it, the court gate opens and stays open, and the guard past the gate comes to look', () => {
  const st = buildW2Stage(cfg('2-9'), 1, '2-9');
  const room = st.kit!.rooms[0];
  assert.ok(room.pieces.some((p) => p.kind === 'gate' && p.latch && p.open === room.pieces.find((q) => q.kind === 'bell')!.id));
  // (no animal on the bell's side of the gate)
  const gate = room.pieces.find((p) => p.kind === 'gate')!;
  const gx = st.platforms.find((p) => p.id === kitPlatId(0, gate.id, 0))!.x;
  assert.equal(st.enemies.filter((e) => e.patrolMaxX < gx).length, 0);
  // the check needs the ring (a gate the bell only opens for a moment would not do)
  assert.deepEqual(roomErrors(st), []);
  if (gate.kind === 'gate') gate.latch = false;
  assert.ok(roomErrors(st).some((e) => e.includes('can never be opened')));
});

test('the court bell in play: tapped, the gate opens for good, and the first guard hears it', () => {
  const r = new RealPlay('2-9', 1);
  const kit = r.e.kit as KitPlay;
  assert.ok(kit, 'the stage has its rooms in the engine');
  const room = kit.rooms[0];
  const bell = room.bells[0];
  const gate = room.gates[0];
  r.stand(bell.x - 30, G);
  r.frame({ right: true });
  r.frame();
  r.frame({ punch: true });
  r.frame();
  assert.equal(kit.noises.length, 1, 'the bell rang');
  r.wait(0.5);
  assert.ok(gate.open && gate.latched, 'the gate is open');
  r.wait(6);
  assert.ok(gate.open, 'and stays open after the ring has gone');
  const first = r.e.enemies.filter((e: { x: number }) => e.x > gate.x).sort((a: { x: number }, b: { x: number }) => a.x - b.x)[0];
  assert.ok(first, 'a guard past the gate');
  assert.ok(Math.abs(first.x - bell.x) <= 680, 'within earshot of the bell');
  void heard;
});

test('a hanging cage in play: no punch breaks it; a stone set in its basket lifts it out and frees the little one', () => {
  const r = new RealPlay('2-3', 1);
  const kit = r.e.kit as KitPlay;
  assert.ok(kit);
  const room = kit.rooms[0];
  const cage = room.lifts[0].cage!;
  const before = r.p.crittersRescued;
  // punching at it from the bank does nothing to it
  r.stand(room.baskets[0].x + 40, G);
  r.frame({ right: true });
  r.frame();
  for (let i = 0; i < 3; i++) {
    r.frame({ punch: true });
    r.wait(0.5);
  }
  assert.equal(cage.collected, false, 'too tough to punch open');
  // pick up the stone at its pile, carry it to the basket, tap: in it goes
  const stone = room.items[0];
  r.stand(stone.x - 30, G);
  r.frame({ right: true });
  r.frame();
  r.frame({ punch: true });
  r.frame();
  assert.equal(stone.mode, 'held', 'picked up');
  for (let i = 0; i < 400 && r.p.x < room.baskets[0].x - 40; i++) r.frame({ right: true });
  r.frame();
  r.frame({ punch: true });
  r.frame();
  assert.equal(stone.mode, 'basket', 'in the basket');
  r.wait(2.5);
  assert.ok(cage.collected, 'up it comes, and the little one is free');
  assert.equal(r.p.crittersRescued, before + 1);
});

/** the room check's errors for a stage, as the level check runs it (levelCheck.ts hands the rooms its own graph) */
function roomErrors(st: ReturnType<typeof buildW2Stage>): string[] {
  return validateStage(st).errors.filter((e) => e.startsWith('room '));
}
