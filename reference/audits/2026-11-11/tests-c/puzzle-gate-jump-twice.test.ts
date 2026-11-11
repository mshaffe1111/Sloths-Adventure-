/**
 * Audit C (puzzle), finding P-03. Asserts the CORRECT behaviour; FAILS today.
 * Run: npx tsx --test reference/audits/2026-11-11/tests-c/puzzle-gate-jump-twice.test.ts
 *
 * Two helpers answer the same moment. A room's shut gate is a door 118 px tall (puzzleKit.ts KIT.doorH) with its wall standing on it.
 * The engine's wall helper (engine.ts watchForStuck -> wallAhead: "a solid face ... taller than one jump climbs but one a double jump
 * clears", 100..DOUBLE_RISE + 10 px) reads only the door, not the wall on it, so three plain jumps at a locked puzzle gate make Dot
 * say "Too tall for one jump! ... jump twice": advice that cannot work, over the room's own line about the shut door. In World 7 it
 * is a Dot line in a world where Dot is away (STAGE-RULES §1 "World 7").
 *
 * Correct: at a shut room gate the wall helper stays quiet (the room's own lines explain a locked exit).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from '../../../../src/game/realPlay.ts';
import type { KitPlay } from '../../../../src/game/puzzlePlay.ts';

for (const id of ['7-3', '3-2', '2-9', '6-7']) {
  test(`P-03: ${id}: jumping at the room's shut gate never brings the "jump twice" line`, () => {
    const sim = new RealPlay(id, 1);
    // (RealPlay switches the stuck watch off as cosmetic: the engine's own is put back)
    delete (sim.e as Record<string, unknown>).watchForStuck;
    const kit = sim.e.kit as KitPlay;
    const room = kit.rooms.find((r) => r.gates.length)!;
    const g = room.gates[0];
    sim.stand(g.x - 75, g.y);
    sim.frame({ right: true });
    sim.frame({ right: true });
    for (let k = 0; k < 4; k++) {
      sim.frame({ press: true });
      for (let i = 0; i < 40; i++) sim.frame();
    }
    assert.equal(g.open, false, 'the gate is shut');
    const wrong = sim.said.filter((s) => /jump twice/i.test(s.text)).map((s) => s.text);
    assert.deepEqual(wrong, [], `${room.spec.id}: Dot's wall helper spoke at a locked door`);
  });
}
