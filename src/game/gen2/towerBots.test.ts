/**
 * The bots fly a tower (R-165.170 piece 1): the fixture tower (toyTower.ts) in the REAL engine at 30 fps, built the way the game
 * builds a listed stage (its proven plan replayed, then the game's own finishing passes), flown from the spawn to the shrine by
 * plain inputs only (tools/engine/towerFly.ts: walk, jump at an edge, hold up at a vine; no rescue, nothing put back). Every storey
 * in order, no fall, both settings. A planted cut vine strands it at that storey, by name.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { arcKit, towerCfg, upKit } from './toyTower.ts';
import { buildGen2Stage } from './pipeline.ts';
import { routeAt, type Route } from './tower.ts';
import { flyTower, withTowerSim } from '../../../tools/engine/towerFly.ts';
import { withFixtureConfig } from '../realPlay.ts';
import { MODES } from '../stageModes.ts';
import { CLIMB_VIEW } from '../cameraFollow.ts';

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

test('the tower with a rolled graph (a designed arc: one brick a beat) is flown to its shrine too, both settings', () => {
  const ARC = '5-94';
  for (const setting of ['normal', 'easy'] as const) for (const seed of [1, 2, 3]) {
    const f = withTowerSim(towerCfg(ARC, 'ascent'), arcKit(ARC), seed, setting, (sim) => flyTower(sim, 400));
    assert.equal(f.end, 'shrine', `arc ${setting} ${seed}: ${f.end} at ${JSON.stringify(f.at)}`);
    assert.equal(f.legs, f.of);
    assert.equal(f.falls, 0, `arc ${setting} ${seed}`);
  }
});

test('the engine takes a tower\'s flags along the ROUTE: two on one storey both count, in the order he meets them, and never back', () => {
  withTowerSim(up(), upKit, 3, 'normal', (sim) => {
    const st = sim.stage as unknown as { checkpoints: Array<{ x: number; y: number; reached: boolean }>; gen2: { tower: { route: Route } } };
    const e = sim.e as { checkpoint: { x: number; y: number } };
    // (the stage as the engine holds it carries the lay's own flags, in the order of the way)
    const lay = buildGen2Stage({ config: up(), kit: upKit, seed: 3, difficulty: 'normal' });
    assert.deepEqual(st.checkpoints.map((c) => [c.x, c.y]), (lay.checkpoints ?? []).map((c) => [c.x, c.y]), 'no pass after the lay moved, added or re-ordered a flag');
    // (two flags planted on one flat storey that runs LEFT: b is further on, further left and no higher)
    const R = st.gen2.tower.route;
    const leg = R.legs.find((g) => g.exit.x < g.entry.x - 500 && g.entry.y === g.exit.y)!;
    assert.ok(leg, 'a flat storey that runs left');
    const a = { x: leg.entry.x - 120, y: leg.entry.y, reached: false }, b = { x: leg.entry.x - 420, y: leg.entry.y, reached: false };
    st.checkpoints.splice(0, st.checkpoints.length, a, b);
    assert.ok(routeAt(R, b.x, b.y) > routeAt(R, a.x, a.y));
    const touch = (c: { x: number; y: number }) => { sim.stand(c.x, c.y); sim.frame(); };
    touch(a);
    assert.deepEqual(e.checkpoint, { x: a.x, y: a.y }, 'the first flag is taken: it is further on than the spawn');
    touch(b);
    assert.deepEqual(e.checkpoint, { x: b.x, y: b.y }, 'the second, on the same storey, is taken too (by height it was no further on)');
    a.reached = false;
    touch(a);
    assert.deepEqual(e.checkpoint, { x: b.x, y: b.y }, 'and going back to the first never replaces it');
  });
});

test('on a tower with an animal the hearts stand by every second flag ALONG THE ROUTE (Normal), by every flag on Easy', () => {
  let judged = 0;
  for (const seed of [1, 2, 4, 6, 8]) for (const setting of ['normal', 'easy'] as const) {
    withTowerSim(up(), upKit, seed, setting, (sim) => {
      const st = sim.stage as unknown as { checkpoints: Array<{ x: number; y: number }>; enemies: unknown[]; collectibles: Array<{ type: string; x: number; y: number }>; gen2: { tower: { route: Route } } };
      const hearts = st.collectibles.filter((c) => c.type === 'heart');
      if (!st.enemies.length) { assert.equal(hearts.length, 0, `up ${setting} ${seed}: nothing costs a heart, so none is laid (hearts follow risk)`); return; }
      judged++;
      const R = st.gen2.tower.route;
      const s = st.checkpoints.map((c) => routeAt(R, c.x, c.y));
      assert.deepEqual([...s].sort((p, q) => p - q), s, 'the flags are in the order of the way');
      // (each heart's flag: the nearest one)
      const by = hearts.map((h) => st.checkpoints.reduce((best, c, k) => (Math.hypot(c.x - h.x, c.y - h.y) < Math.hypot(st.checkpoints[best].x - h.x, st.checkpoints[best].y - h.y) ? k : best), 0)).sort((p, q) => p - q);
      const want = st.checkpoints.map((_c, k) => k).filter((k) => setting === 'easy' || k % 2 === 1);
      assert.deepEqual(by, want, `up ${setting} ${seed}: hearts by flags ${by} of ${st.checkpoints.length} (every ${setting === 'easy' ? 'flag' : 'second flag along the way'})`);
      for (const h of hearts) assert.ok(st.checkpoints.some((c) => Math.abs(c.x - h.x) <= 140 && Math.abs(c.y - h.y) <= 120), `up ${setting} ${seed}: the heart at x ${h.x}, y ${h.y} stands by a flag`);
    });
  }
  assert.ok(judged >= 2, `towers with an animal judged: ${judged}`);
});

test('the climb camera in the engine: on a tower his feet rest low in the view standing and climbing, and a set-back cuts straight to it', () => {
  withTowerSim(up(), upKit, 3, 'normal', (sim) => {
    const e = sim.e as { camera: { y: number; viewportHeight: number }; checkpoint: { x: number; y: number }; updateCamera: (dt: number) => void; respawnAtCheckpoint: (r: string) => void };
    // (the harness skips the camera as paint; here it is the thing under test: the engine's own, put back)
    e.updateCamera = (Object.getPrototypeOf(e) as { updateCamera: (dt: number) => void }).updateCamera.bind(e);
    const T = (sim.stage as unknown as { gen2: { tower: { route: Route; turns: Array<{ x: number; from: number; to: number }> } } }).gen2.tower;
    const share = () => (sim.p.y - e.camera.y) / e.camera.viewportHeight;
    const leg = T.route.legs[8];
    sim.stand((leg.entry.x + leg.exit.x) / 2, leg.entry.y);
    for (let i = 0; i < 120; i++) sim.frame();
    assert.ok(Math.abs(share() - CLIMB_VIEW.up) < 0.02, `standing on a storey: his feet ${share().toFixed(3)} down the view (${CLIMB_VIEW.up})`);
    // (on a turn's vine, half way up: the same framing, so the storey he climbs to is over him in view)
    const t = T.turns[9];
    const vine = sim.vines.find((v) => Math.abs(v.x - t.x) <= 2 && Math.abs(v.topY - t.to) <= 30)!;
    sim.climb(vine, (t.from + t.to) / 2);
    for (let i = 0; i < 90; i++) { sim.climb(vine, (t.from + t.to) / 2); sim.frame(); }
    assert.ok(Math.abs(share() - CLIMB_VIEW.up) < 0.03, `on a vine: his feet ${share().toFixed(3)} down the view`);
    assert.ok(sim.p.y - e.camera.y >= sim.p.y - t.to, 'the storey the vine leads to is inside the view over him');
    // (a set-back to a flag on a storey: the view cuts to the same framing at once, it never eases up from the old 55%)
    const flag = (sim.stage.checkpoints ?? [])[6];
    e.checkpoint = { x: flag.x, y: flag.y };
    e.respawnAtCheckpoint('pit');
    assert.ok(Math.abs(share() - CLIMB_VIEW.up) < 0.02, `just set back: his feet ${share().toFixed(3)} down the view`);
    const y0 = e.camera.y;
    for (let i = 0; i < 60; i++) sim.frame();
    assert.ok(Math.abs(e.camera.y - y0) <= 6, `and the view holds still after it (it moved ${Math.round(Math.abs(e.camera.y - y0))} px)`);
  });
});

test('a fixture config is found by id only while its test runs, and never stands in for a stage of the game', () => {
  assert.throws(() => withFixtureConfig({ ...up(), id: '1-1' }, () => 0), /is a stage of the game/);
  assert.equal(withFixtureConfig(up(), () => 7), 7);
});
