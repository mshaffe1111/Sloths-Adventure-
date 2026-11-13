/**
 * Audit C (puzzle), finding P-02 (an unrated lead, confirmed and fixed by EN-F): the reset post did not put a pushed log back.
 * Run: npx tsx --test src/game/roomLogReset.test.ts
 *
 * 1-6's third seesaw room ("seesaw-twist"): the log lies on the far floor, 30 px in, and must be pushed LEFT onto the seesaw's far
 * end. He arrives from the left, so walking on pushes it RIGHT: 80 px and it is flush against the 260 px bank (protoStage.ts
 * seesawTwist: `push: { min: pivot + 10, max: farFloor.x + farFloor.width }`, the bank starts at that same x). Nobody can stand to its
 * right any more, so it can never be pushed back (engine.ts: a log moves only when walked into from its side). The room's signpost
 * says STARTING AGAIN and moves nothing a log (puzzlePlay.ts resetRoom knows items, beetles, levers, gates, traders, lifts, bells,
 * teapots: not the pushed logs a seesaw room is made of), and a respawn does not put it back either.
 *
 * Correct: a tap on the room's signpost puts the room's log back where it started (STAGE-RULES §3: "Every room has a reset post").
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from './realPlay.ts';
import type { KitPlay } from './puzzlePlay.ts';
import type { Platform } from './types.ts';

for (const seed of [1, 38]) {
  test(`P-02: 1-6 seed ${seed}: the twist room's log, walked into from the left, can be got back (the signpost starts the room again)`, () => {
    const sim = new RealPlay('1-6', seed);
    const kit = sim.e.kit as KitPlay;
    const room = kit.rooms.find((r) => r.spec.id.startsWith('seesaw-twist'))!;
    assert.ok(room, 'the twist room is in this roll');
    const log = sim.platforms.filter((p) => p.push && p.x >= room.box.x0 && p.x <= room.box.x1 + 400).pop() as Platform & { push: { min: number; max: number } };
    const floorY = log.y + log.height;
    const start = log.x;
    const bank = sim.platforms.find((p) => !p.push && Math.abs(p.x - log.push.max) < 2 && p.y < floorY - 200)!;
    assert.ok(bank, 'the high bank closes the far floor where the log\'s push range ends');

    // he comes off the seesaw and walks on to the right, into the log
    sim.stand(log.x - 30, floorY);
    for (let i = 0; i < 30 * 4; i++) sim.frame({ right: true });
    assert.ok(log.x > start + 60, `the log went right with him (${Math.round(log.x - start)} px)`);
    assert.ok(bank.x - (log.x + log.width) < 1, `and is flush against the bank (${(bank.x - (log.x + log.width)).toFixed(1)} px left to stand in)`);

    // every way of getting at it again: from its top stepping off to the right, and over it from the left
    const pushed = log.x;
    for (const sx of [log.x + log.width - 12, log.x + log.width - 2]) {
      sim.stand(sx, log.y);
      for (let i = 0; i < 30; i++) sim.frame({ right: true });
      for (let i = 0; i < 90; i++) sim.frame({ left: true });
    }
    sim.stand(log.x - 60, floorY);
    sim.frame({ right: true, press: true });
    for (let i = 0; i < 40; i++) sim.frame({ right: true, jump: true });
    for (let i = 0; i < 90; i++) sim.frame({ left: true });
    assert.equal(log.x, pushed, 'it cannot be pushed back by hand (this is the softlock, not the assertion that fails)');
    assert.equal(room.seesaws[0].tilt, room.seesaws[0].rest, 'and the seesaw is as it was: the way on is shut');

    // the room's signpost
    const post = room.resets[0];
    sim.stand(post.x - 20, post.y);
    sim.frame({ right: true });
    sim.frame({ punch: true });
    sim.wait(1);
    assert.ok(Math.abs(log.x - start) < 2, `the signpost started the room again but left the log ${Math.round(log.x - start)} px from where it began, against the bank: only leaving the stage gets him out`);
  });
}
