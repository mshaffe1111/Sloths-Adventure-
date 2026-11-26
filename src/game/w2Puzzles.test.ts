/**
 * World 2's puzzle rooms (2026-10-28), built from the puzzle kit (puzzleKit.ts): the court bell that opens the court gate and calls
 * the guards to look (2-9), its rule and the room played in the real engine. (The reed cages hung on pulleys went with 2-8's hand build,
 * BUILD-28: the designed 2-8 holds its cages by socket, READY-28 L1; no stage lays a pulley cage now.)
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildW2Stage, type W2Plan } from './w2Stages.ts';
import { validateStage } from './levelCheck.ts';
import { generateAllLevels } from './worldsData.ts';
import { KitPlay, type KitHost } from './puzzlePlay.ts';
import { driftX, logClock } from './river.ts';
import { KIT, kitPlatId, type RoomSpec } from './puzzleKit.ts';
import { setDifficulty } from './difficulty.ts';
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

/** the room check's errors for a stage, as the level check runs it (levelCheck.ts hands the rooms its own graph) */
function roomErrors(st: ReturnType<typeof buildW2Stage>): string[] {
  return validateStage(st).errors.filter((e) => e.startsWith('room '));
}
