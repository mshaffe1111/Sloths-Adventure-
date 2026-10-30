/**
 * The level check's walls (levelCheck.ts blockBetween): a solid block 50 px tall or more stops him at its face in the engine (engine.ts
 * "Solid ground blocks"), so a jump or a glide between two boughs never passes through a trunk whose top no jump from the take-off
 * clears. The way is up it (its climbing vine) or onto it. Until 2026-10-29 the check's jumps and glides went straight through such a
 * trunk, and the quick route skipped World 8's climbs (8-5: 13 of 52 climbed).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { validateStage } from './levelCheck.ts';
import { DOUBLE_RISE } from './physics.ts';
import { buildProtoStage, HAND_STAGES } from './protoStage.ts';
import { levelConfig } from './realPlay.ts';
import type { Platform, Vine } from './types.ts';

const Y = 600;
const block = (id: number, x0: number, x1: number, y: number, h: number): Platform => ({ id, x: x0, y, width: x1 - x0, height: h, type: 'solid', style: 'log' } as Platform);

/** a bough, a trunk `rise` px over it (with a climbing vine on its near face, or none), and the bough past it at the start's height */
function stage(rise: number, vine: boolean) {
  const st = buildProtoStage(levelConfig('6-3'), 1, HAND_STAGES['1-3']);
  const trunk = block(2, 600, 860, Y - rise, rise + 90);
  const v: Vine = { id: 1, x: 574, topY: Y - rise, bottomY: Y, swaySpeed: 0, swayPhase: 0, vineType: 'tree_climb' };
  Object.assign(st, {
    config: { ...st.config, objectiveType: 'sprint', targetCount: 1 },
    platforms: [block(1, 0, 600, Y, 90), trunk, block(3, 860, 1900, Y, 90)],
    vines: vine ? [v] : [],
    ropes: [], enemies: [], rivers: [], checkpoints: [], zones: [], updrafts: [], kit: undefined,
    collectibles: [{ id: 1, type: 'exit_totem', x: 1700, y: Y - 30, collected: false, bobPhase: 0 }],
    spawnX: 100, spawnY: Y, exitTotemX: 1700, exitTotemY: Y,
  });
  return st;
}

test('a trunk too tall to jump is climbed, never jumped or glided through; one a jump clears is no wall', () => {
  const tall = Math.round(DOUBLE_RISE + 30);
  assert.equal(validateStage(stage(tall, false)).ok, false, `a ${tall} px trunk with no vine: the far bough is out of reach`);
  const climbed = validateStage(stage(tall, true));
  assert.ok(climbed.ok, `its vine climbs it: ${climbed.errors.join('; ')}`);
  const low = Math.round(DOUBLE_RISE - 40);
  const over = validateStage(stage(low, false));
  assert.ok(over.ok, `a ${low} px trunk: the second jump goes over it or onto it: ${over.errors.join('; ')}`);
});
