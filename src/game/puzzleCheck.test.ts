import test from 'node:test';
import assert from 'node:assert/strict';
import { buildKitStage, kitStageConfig } from './kitStage.ts';
import { validateStage } from './levelCheck.ts';
import { kitSolved } from './puzzleCheck.ts';
import type { GeneratedStage } from './stageGenerator.ts';
import type { PieceSpec } from './puzzleKit.ts';

const stage = () => buildKitStage(kitStageConfig());
const without = (room: number, ids: string[]): GeneratedStage => {
  const st = stage();
  st.kit!.rooms[room].pieces = st.kit!.rooms[room].pieces.filter((p) => !ids.includes(p.id));
  return st;
};

test('the test room passes the level check: every room can be solved, and nothing in one can be lost for good', () => {
  const r = validateStage(stage());
  assert.deepEqual(r.errors, []);
  assert.ok(r.ok);
});

test('a room that cannot be solved fails: no acorn for the plate, no beetle or no cake for the far plate, no acorn for the basket', () => {
  assert.match(validateStage(without(0, ['acorn1'])).errors.join('\n'), /room carry: .*can't be reached/);
  assert.match(validateStage(without(1, ['beetle2'])).errors.join('\n'), /room lure: its way on \(gate2\) can never be opened/);
  assert.match(validateStage(without(1, ['cake2'])).errors.join('\n'), /room lure: its way on \(gate2\) can never be opened/);
  assert.match(validateStage(without(2, ['acorn3'])).errors.join('\n'), /room throw: its way on \(lift3\) can never be opened/);
});

test('standing on a plate is not holding it down: a gate wired to one plate he must stand on never lets him through', () => {
  // (the carry room with its acorn gone: he can press the plate himself, but the gate shuts as he steps off)
  const errs = validateStage(without(0, ['acorn1'])).errors;
  assert.ok(errs.some((e) => /opens, but/.test(e)), errs.join('\n'));
});

test('a thing that can be lost with nothing to bring it back fails the check', () => {
  const st = stage();
  const it = st.kit!.rooms[2].pieces.find((p) => p.id === 'acorn3') as Extract<PieceSpec, { kind: 'item' }>;
  delete it.source;
  it.at = { on: st.platforms[0].id, at: 2030 / st.platforms[0].width };
  assert.match(validateStage(st).errors.join('\n'), /room throw: acorn3 can be lost, and nothing brings it back/);
});

test('carrying is walking only: a plate up a ledge he must jump to cannot be reached with the acorn in his hands', () => {
  const st = stage();
  const floor = st.platforms[0];
  // a ledge a jump up from the floor in the carry room, and the plate moved onto it: thrown up there it could still land, so the room
  // stays solvable only by a throw (the check finds it); with throws out of reach too (a ledge too high), it fails
  const ledge = { id: 77, x: 600, y: floor.y - 100, width: 140, height: 24, type: 'solid' as const, style: 'branch' as const };
  st.platforms.push(ledge);
  const room = st.kit!.rooms[0];
  room.ground.push(77);
  const plate = room.pieces.find((p) => p.id === 'plate1')!;
  (plate as { at: { on: number; at: number } }).at = { on: 77, at: 0.5 };
  assert.deepEqual(validateStage(st).errors, [], 'thrown up onto the ledge, the acorn can press the plate');
  ledge.y = floor.y - 420;
  assert.match(validateStage(st).errors.join('\n'), /room carry/);
});

test('the rest of the stage is walked as it stands once the rooms are solved: gates open, lifts at both their stops', () => {
  const solved = kitSolved(stage());
  assert.equal(solved.kit, undefined);
  assert.ok(solved.platforms.some((p) => p.lift && p.lift.bottom - p.lift.top === 260));
  assert.ok(validateStage(solved).ok);
});
