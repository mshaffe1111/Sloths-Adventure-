/**
 * A stage that GATHERS petals though its mission is another (stagePlan.ts StageSpec.gathers; 1-6's vine run, "Swing after her, and gather
 * her petals"): its goal is a share of the petals it holds, as a harvest's is, read from the plan's data (goals.ts goalCountsPetals), never
 * from a stage id or a world. BUILD-16b, the lead's ruling 11-14 (option A). A stage of the same mission without the field keeps no count.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { countedGoal, goalCountsPetals, goalHave, normalGoal, GOAL_SHARE } from './goals.ts';
import { STAGE_PLAN } from './stagePlan.ts';
import { goalInfo } from '../components/hud/goalInfo.ts';
import type { GeneratedStage } from './stageGenerator.ts';

/** a toy stage: its plan row by (world, mini), `petals` petals on solid ground, one foe */
function toy(world: number, mini: number, type: string, petals: number): GeneratedStage {
  const ground = { x: 0, y: 900, width: 9000, height: 100, type: 'solid' };
  const collectibles = Array.from({ length: petals }, (_, i) => ({ type: 'flower', x: 200 + i * 100, y: 870 }));
  return { config: { id: `${world}-${mini}`, worldIndex: world, miniIndex: mini, objectiveType: type, targetCount: 1 }, platforms: [ground], collectibles, enemies: [{}] } as unknown as GeneratedStage;
}
/** the plan's rows by what they gather, found from the data (no stage named here) */
const rows = Object.entries(STAGE_PLAN).flatMap(([w, specs]) => specs.map((s, i) => ({ world: Number(w), mini: i + 1, spec: s })));
const gathering = rows.filter((r) => r.spec.gathers === 'petals');
const plainRun = rows.find((r) => r.spec.type === 'vine_runner' && !r.spec.gathers)!;

test('a stage whose plan gathers petals counts them: its goal is the harvest share of the petals it holds', () => {
  assert.ok(gathering.length >= 1, 'the plan names at least one stage that gathers petals');
  for (const r of gathering) {
    const st = toy(r.world, r.mini, r.spec.type, 16);
    assert.equal(goalCountsPetals(st.config), true, `${r.world}-${r.mini}`);
    assert.equal(countedGoal(st.config), 'harvest');
    assert.equal(goalHave(st as never), 16, `${r.world}-${r.mini}: holds 16 petals`);
    assert.equal(normalGoal(st as never), Math.round(16 * GOAL_SHARE.collect), `${r.world}-${r.mini}: Normal asks the harvest's share`);
    // (the HUD's goal card counts petals with the petal icon, not "swing to the end" with a door)
    const g = goalInfo({ ...st.config, targetCount: 14 });
    assert.equal(g.kind, 'count');
    assert.equal(g.line, 'This stage: collect 14 petals');
    assert.deepEqual(g.icon, { kind: 'pickup', name: 'petal' });
    // (no petals laid: nothing to count, and no goal to seal the exit with)
    assert.equal(normalGoal(toy(r.world, r.mini, r.spec.type, 0) as never), null);
  }
});

test('the same mission WITHOUT the plan field keeps no count (null stays null), and a harvest still counts', () => {
  const st = toy(plainRun.world, plainRun.mini, 'vine_runner', 16);
  assert.equal(goalCountsPetals(st.config), false);
  assert.equal(countedGoal(st.config), 'vine_runner');
  assert.equal(goalHave(st as never), null, 'a vine run that gathers nothing has no goal count');
  assert.equal(normalGoal(st as never), null);
  assert.equal(goalInfo(st.config).kind, 'distance');
  const h = rows.find((r) => r.spec.type === 'harvest')!;
  assert.equal(goalHave(toy(h.world, h.mini, 'harvest', 9) as never), 9);
});
