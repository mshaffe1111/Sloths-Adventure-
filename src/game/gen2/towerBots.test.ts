/**
 * The bots fly a tower (R-165.170 piece 1): the fixture tower (toyTower.ts) in the REAL engine at 30 fps, built the way the game
 * builds a listed stage (its proven plan replayed, then the game's own finishing passes), flown from the spawn to the shrine by
 * plain inputs only (tools/engine/towerFly.ts: walk, jump at an edge, hold up at a vine; no rescue, nothing put back). Every storey
 * in order, no fall, both settings. A planted cut vine strands it at that storey, by name.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { towerCfg, upKit } from './toyTower.ts';
import { flyTower, withTowerSim } from '../../../tools/engine/towerFly.ts';
import { withFixtureConfig } from '../realPlay.ts';
import { MODES } from '../stageModes.ts';

const ID = '5-93';
const SEEDS = [1, 2, 3, 4, 5, 6];
const up = () => towerCfg(ID, 'ascent');

test('the fixture tower is flown to its shrine in the real engine by plain inputs: every storey in order, no fall, both settings', () => {
  for (const setting of ['normal', 'easy'] as const) for (const seed of SEEDS) {
    const f = withTowerSim(up(), upKit, seed, setting, (sim) => {
      // (the stage the engine holds is a tower the engine reads as one: its travel is up, its flags are its own)
      assert.equal(sim.stage.config.travel, 'up');
      assert.equal((sim.e as { mode: unknown }).mode, MODES.up, 'the engine plays it as a climb');
      return flyTower(sim, 400);
    });
    assert.equal(f.end, 'shrine', `up ${setting} ${seed}: ${f.end} at ${JSON.stringify(f.at)}`);
    assert.equal(f.legs, f.of, `up ${setting} ${seed}: every section, in order`);
    assert.equal(f.falls, 0, `up ${setting} ${seed}: a plain run never falls a storey`);
    assert.ok(f.climbs >= 8, `up ${setting} ${seed}: ${f.climbs} vines climbed`);
    assert.ok(f.t > 60 && f.t < 300, `up ${setting} ${seed}: ${f.t} s of play`);
    for (let k = 1; k < f.legT.length; k++) assert.ok(f.legT[k] > f.legT[k - 1], 'each section after the one before');
  }
});

test('planted: with one turn\'s vine cut in the engine, the flyer is stranded at that storey (it has no other way up)', () => {
  const f = withTowerSim(up(), upKit, 2, 'normal', (sim) => {
    const T = (sim.stage as unknown as { gen2: { tower: { turns: Array<{ x: number; from: number; to: number }> } } }).gen2.tower;
    const t = T.turns[4];
    const k = sim.vines.findIndex((v) => v.vineType === 'tree_climb' && Math.abs(v.x - t.x) <= 2 && Math.abs(v.topY - t.to) <= 30);
    assert.ok(k >= 0, 'the turn names its vine where it stands (after it was moved off the ledge face)');
    sim.vines.splice(k, 1);
    return flyTower(sim, 120);
  });
  assert.notEqual(f.end, 'shrine');
  assert.ok(f.legs >= 3 && f.legs < f.of, `stranded after ${f.legs} sections: ${JSON.stringify(f.at)}`);
});

test('a fixture config is found by id only while its test runs, and never stands in for a stage of the game', () => {
  assert.throws(() => withFixtureConfig({ ...up(), id: '1-1' }, () => 0), /is a stage of the game/);
  assert.equal(withFixtureConfig(up(), () => 7), 7);
});
