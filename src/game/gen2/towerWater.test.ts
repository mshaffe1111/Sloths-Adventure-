/**
 * Water stacked over him (ENG-26d, the readiness gap G6 as it really is): a stage of storeys (a tower, or legs laid one under another)
 * has water whose window shares x with ground on another storey. The engine found "the river he is in" by x alone, so standing on a
 * storey UNDER a pond's window he read as under its surface: a splash-back pond set him on its jetty, a deep river took a life, every frame.
 * On 2-6's draft row the first frame moved him from the spawn (140, 6649) to beat 10's pond jetty (234, 2037), four storeys up, and the bots
 * met the first three wheels never (ENG-26c read it as wheels' axles left behind a height shift; the axles were where they were laid).
 * The engine reads water by river.ts riverAt (t-eng-27's, byte for byte: its window holds x and he is no deeper than RIVER_DEPTH under it).
 * RED on f79e86f2a: both tests.
 */
import '../headlessDom.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DT, RealPlay } from '../realPlay.ts';
import { setDifficulty } from '../difficulty.ts';
import type { RiverZone } from '../river.ts';
import type { Platform } from '../types.ts';
import { generateAllLevels } from '../worldsData.ts';
import { withTestStage } from './listed.ts';
import { buildGen2Stage, keptFoes } from './pipeline.ts';
import { packPlan, plantSeedList } from './seedList.ts';
import { w2Finish } from './worlds/w2.ts';
import { kitLib26, STAGE_26 } from './worlds/w2Arc26.ts';
import { W2_STAGES } from '../w2Stages.ts';

const LOW = 3000, HIGH = 1500;

test('a storey under water: standing beneath a higher pond or river he is in neither; falling into the higher one splashes as ever', () => {
  setDifficulty('normal');
  const sim = new RealPlay('2-3', 1);
  const e = sim.e as never as Record<string, any>;
  const pl: Platform[] = [
    { id: 1, x: 0, y: LOW, width: 2400, height: 200, type: 'solid' } as Platform,
    // (the storey above: its ground either side of its water)
    { id: 2, x: 200, y: HIGH, width: 400, height: 60, type: 'solid' } as Platform,
    { id: 3, x: 1400, y: HIGH, width: 400, height: 60, type: 'solid' } as Platform,
  ];
  sim.bare(pl);
  const pond: RiverZone = { x0: 600, x1: 1400, surfaceY: HIGH + 20, speed: 0, dir: 1, wheelPond: true, safe: { backX: 500, backY: HIGH } };
  const deep: RiverZone = { x0: 1900, x1: 2300, surfaceY: HIGH + 20, speed: 0, dir: 1 };
  e.currentStage.rivers = [pond, deep];
  e.currentStage.exitTotemX = 9000;
  for (const x of [1000, 2100]) {
    sim.died = false;
    sim.stand(x, LOW);
    for (let k = 0; k < 45; k++) sim.e.update(DT);
    assert.ok(Math.abs(sim.p.x - x) < 2 && Math.abs(sim.p.y - LOW) < 2, `on the lower storey under ${x < 1500 ? 'the pond' : 'the deep river'}: still at ${x}, ${LOW} (at ${Math.round(sim.p.x)}, ${Math.round(sim.p.y)})`);
    assert.ok(!sim.died, `no life lost under ${x < 1500 ? 'the pond' : 'the deep river'}`);
  }
  // (and the higher water is water: a fall into the pond sets him on its jetty)
  sim.fly(1000, HIGH - 10, 0, 300);
  let back = false;
  for (let k = 0; k < 30 && !back; k++) { sim.e.update(DT); back = Math.abs(sim.p.x - 500) < 2 && Math.abs(sim.p.y - HIGH) < 2; }
  assert.ok(back, `a fall into the higher pond splashes him back to its jetty (at ${Math.round(sim.p.x)}, ${Math.round(sim.p.y)})`);
});

test("2-6's draft row (a tower with five wheels' ponds over its lower storeys): the first frames keep him at the spawn, both settings", () => {
  const cfg = generateAllLevels().find((c) => c.id === STAGE_26 && !c.secret)!;
  for (const d of ['easy', 'normal'] as const) for (const seed of [1, 2, 3]) {
    const kit = kitLib26();
    const st = buildGen2Stage({ config: cfg, kit, seed, difficulty: 'normal' });
    const dict: string[] = [];
    const packed = packPlan({ seed: st.gen2.seed, rerolls: st.gen2.rerolls, plan: st.gen2.plan, foes: [...keptFoes(st)] }, dict);
    withTestStage({ [STAGE_26]: { kit: () => kit, world: (s, _sq, dd) => w2Finish(s as never, dd) as typeof s, seeds: [] } }, () => {
      const undo = plantSeedList(STAGE_26, { dict, seeds: [seed], plans: [packed] });
      // (the hand-built 2-6 is routed before any listed row: hidden for the run, as the bots' runner does)
      const hand = (W2_STAGES as Record<string, unknown>)[STAGE_26];
      delete (W2_STAGES as Record<string, unknown>)[STAGE_26];
      try {
        setDifficulty(d);
        const sim = new RealPlay(STAGE_26, 1);
        const s = sim.stage;
        // (the row really stacks water over its spawn: some pond's window holds the spawn's x, storeys above him)
        assert.ok((s.rivers ?? []).some((r) => r.x0 < s.spawnX && r.x1 > s.spawnX && r.surfaceY < s.spawnY - 400), `seed ${seed} ${d}: water stacked over the spawn`);
        for (let k = 0; k < 4; k++) sim.frame({});
        assert.ok(Math.abs(sim.p.x - s.spawnX) < 60 && Math.abs(sim.p.y - s.spawnY) < 60, `seed ${seed} ${d}: at the spawn (${s.spawnX}, ${s.spawnY}), not set on a pond's jetty (he is at ${Math.round(sim.p.x)}, ${Math.round(sim.p.y)})`);
        assert.ok(!sim.died, `seed ${seed} ${d}: no life lost at the start`);
      } finally {
        undo();
        (W2_STAGES as Record<string, unknown>)[STAGE_26] = hand;
      }
    });
  }
});
