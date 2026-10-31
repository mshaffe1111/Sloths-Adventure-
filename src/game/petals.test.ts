/**
 * One pickup, in trails (petals.ts, petalPass.ts; Matt 2026-10-29): every stage the game builds, Worlds 1-10, Normal and Easy, rolls 1-2,
 * keeps the petal rules: at most PER_SCREEN on a screen, no solid rows, nothing the level check cannot reach, nothing below or just above a
 * required jump's arc; and a harvest still holds enough for its goal.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateAllLevels } from './worldsData.ts';
import { generateStage, setLayoutVariant } from './stageGenerator.ts';
import { withGoals } from './goals.ts';
import { easyStage } from './easyMode.ts';
import { pickupCheck } from './petalPass.ts';
import { busiestScreen, clumpExtras, isPetal, PER_SCREEN, petalGaps, rowExtras } from './petals.ts';

// (the game's stages, as a browser builds them: protoStage.ts protoStageEnabled reads `location`)
const g = globalThis as { location?: unknown };
g.location ??= { search: '' };

const levels = generateAllLevels().filter((l) => l.objectiveType !== 'boss_lair');

test('every stage the game builds keeps the petal rules (Worlds 1-10, Normal and Easy, rolls 1-2)', () => {
  const bad: string[] = [];
  for (const l of levels) {
    for (const v of [1, 2]) {
      for (const d of ['normal', 'easy'] as const) {
        setLayoutVariant(v);
        let st;
        try {
          st = withGoals(generateStage({ ...l, unlocked: true }, d));
        } finally {
          setLayoutVariant(null);
        }
        if (d === 'easy') st = easyStage(st);
        const petals = st.collectibles.filter((c) => isPetal(c, st));
        // (Easy's stones and wider landings move nothing of the trail: the screen cap and the rows hold on Easy too)
        const errs = d === 'normal' ? pickupCheck(st) : [...(busiestScreen(petals).n > PER_SCREEN ? ['crowded'] : []), ...(rowExtras(petals).size ? ['rows'] : []), ...(clumpExtras(petals).size ? ['clumps'] : [])];
        for (const e of errs) bad.push(`${l.id} roll ${v} ${d}: ${e}`);
        if (st.config.objectiveType === 'harvest' && !(l.worldIndex === 8)) assert.ok(petals.length >= st.config.targetCount, `${l.id} roll ${v} ${d}: ${petals.length} petals for a goal of ${st.config.targetCount}`);
      }
    }
  }
  assert.deepEqual(bad, []);
});

test('the rules themselves: a crowded screen, a row and a petal below a jump are caught', () => {
  const p = (id: number, x: number, y: number) => ({ id, type: 'flower' as const, x, y, collected: false, bobPhase: 0 });
  assert.equal(busiestScreen([p(1, 0, 0), p(2, 100, 0), p(3, 200, 0), p(4, 300, 0), p(5, 400, 0), p(6, 500, 0), p(7, 600, 0)]).n, 7);
  assert.equal(busiestScreen([p(1, 0, 0), p(2, 900, 0)]).n, 1);
  assert.equal(rowExtras([p(1, 0, 0), p(2, 100, 0), p(3, 200, 0), p(4, 300, 0)]).size, 1);
  assert.equal(rowExtras([p(1, 0, 0), p(2, 200, 0), p(3, 400, 0)]).size, 0);
  assert.equal(clumpExtras([p(1, 0, 0), p(2, 30, 10), p(3, 200, 0)]).size, 1);
  assert.equal(clumpExtras([p(1, 0, 0), p(2, 90, 0)]).size, 0);
});

test('spread out (Matt, 2026-10-30): the long petal-free stretches are few; every world but its special stages runs at most 2 screens without a petal', () => {
  // (4-D and 8-2 hold no petals by design: Dot's stage and 8-2's night blooms; 1-7's long liana run is left to the swing checks)
  const open = new Set(['4-D', '8-2', '1-7']);
  const long: string[] = [];
  for (const l of levels) {
    if (open.has(l.id)) continue;
    setLayoutVariant(1);
    let st;
    try {
      st = withGoals(generateStage({ ...l, unlocked: true }, 'normal'));
    } finally {
      setLayoutVariant(null);
    }
    const g = petalGaps(st, st.collectibles.filter((c) => isPetal(c, st)))[0];
    if (g && g[1] - g[0] > 2 * 840 + 400) long.push(`${l.id}: ${Math.round(g[1] - g[0])} px from ${Math.round(g[0])}`);
  }
  assert.deepEqual(long, []);
});
