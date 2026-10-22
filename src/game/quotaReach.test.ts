import test from 'node:test';
import assert from 'node:assert/strict';
import { generateAllLevels } from './worldsData.ts';
import { generateStage, setLayoutVariant } from './stageGenerator.ts';

/**
 * A "defeat enough" stage (purge or gauntlet) must hold its quota of enemies on the way to the exit. These layouts once put eagles
 * beyond the exit (they were placed over the planned width, not the real one), so the shrine could never open.
 */
const KNOWN: Array<[string, number]> = [
  ['5-9', 16903], ['5-9', 999], ['5-9', 925817],
  ['6-9', 48592], ['6-9', 56511], ['6-9', 5150], ['6-9', 755183],
  ['9-9', 8675309],
];

test('layouts that once left the quota out of reach now hold every enemy before the exit', () => {
  const levels = generateAllLevels();
  for (const [id, v] of KNOWN) {
    const l = levels.find((x) => x.id === id)!;
    setLayoutVariant(v);
    const st = generateStage(l);
    const reachable = st.enemies.filter((e) => e.x <= st.exitTotemX + 35).length;
    assert.ok(reachable >= l.targetCount, `${id} layout ${v}: quota ${l.targetCount}, only ${reachable} before the exit`);
  }
  setLayoutVariant(null);
});
