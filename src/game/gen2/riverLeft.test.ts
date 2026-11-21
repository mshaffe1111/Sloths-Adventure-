/**
 * A river crossed RIGHT TO LEFT (ENG-26c, readiness gap G2: 2-6's millrace on a tower storey that runs left; before it, pipeline.ts threw
 * "far's river runs right to left, which is not laid yet" on 24 of 24 rolls of the draft row). layRiver `way` -1 lays the exact mirror of
 * the same row run right; riverFaults judges it as that mirror; levelCheck reads its current against him (`dir * way`). And the tower:
 * a section too long for the storey turned at the wall fails by name instead of being laid through the wall (gap G5).
 */
import '../headlessDom.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateStage } from '../levelCheck.ts';
import { driftX, type RiverZone } from '../river.ts';
import type { Platform } from '../types.ts';
import { layRiver, riverFaults, type RiverRow } from './riverLay.ts';
import { buildGen2Stage } from './pipeline.ts';
import { towerCfg, upManifest } from './toyTower.ts';
import type { SectionTemplate, WorldKit } from './types.ts';
import { W2_RIVERS } from './worlds/w2.ts';

const ids = () => { let n = 100; return () => n++; };
const bank = (id: number, x: number, w: number, y: number): Platform => ({ id, x, y, width: w, height: 90, type: 'solid', style: 'log' });

test('a river crossed right to left is the mirror of the same row crossed left to right: water, every log at every moment, current, petals, splash-back', () => {
  for (const row of [W2_RIVERS.ride, W2_RIVERS.deep, W2_RIVERS.back, { ...W2_RIVERS.ride, petals: 2 }] as RiverRow[]) {
    const x0 = 2000, y = 500, M = 2 * x0;
    const R = layRiver(row, x0, y, ids()), L = layRiver(row, x0, y, ids(), -1);
    assert.equal(L.zone.way, -1);
    assert.equal(R.zone.way, undefined, 'a river laid right carries no way (every river before it, unchanged)');
    assert.deepEqual([L.zone.x0, L.zone.x1], [M - R.zone.x1, M - R.zone.x0], 'the water runs left from the near bank');
    assert.equal(L.zone.x1, x0, "the water starts at the near bank's start");
    assert.equal(L.zone.dir, -R.zone.dir, 'the current turned: a row that flows with him flows left');
    assert.equal(L.logs.length, R.logs.length);
    for (let i = 0; i < R.logs.length; i++) for (const t of [0, 0.7, 3.1, 9.9, 41.3]) {
      assert.ok(Math.abs(driftX(L.logs[i].drift!, t) - (M - driftX(R.logs[i].drift!, t) - row.logW)) < 1e-6, `log ${i} at ${t} s`);
    }
    assert.equal(L.petals.length, R.petals.length);
    if (row.safe) assert.equal(L.zone.safe!.backX, M - R.zone.safe!.backX, '70 px in from the near bank, the other side');
  }
  assert.throws(() => layRiver({ ...W2_RIVERS.ride, tail: 300 }, 2000, 500, ids(), -1), /tail .* right to left is not laid yet/);
});

/** the river laid from a near bank at 2000 (its end, crossed right; its start, crossed left) with a far bank, as riverFaults reads it */
function crossing(row: RiverRow, way: 1 | -1): { platforms: Platform[]; rivers: RiverZone[] } {
  const r = way > 0 ? layRiver(row, 2000, 500, ids()) : layRiver(row, 2000, 500, ids(), -1);
  const near = way > 0 ? bank(1, 1700, 300, 500) : bank(1, 2000, 300, 500);
  const far = way > 0 ? bank(2, r.zone.x1, 300, 500) : bank(2, r.zone.x0 - 300, 300, 500);
  return { platforms: [near, ...r.logs, far], rivers: [r.zone] };
}

test('riverFaults judges a river crossed right to left as its mirror: fair rows pass, an unfair one fails in the same words', () => {
  for (const row of [W2_RIVERS.ride, W2_RIVERS.deep, W2_RIVERS.back] as RiverRow[]) {
    assert.deepEqual(riverFaults(crossing(row, 1)), [], 'right');
    assert.deepEqual(riverFaults(crossing(row, -1)), [], 'left');
  }
  // (logs flowing with him 120 px apart: past a hop's 80; the same fault, the river named as crossed right to left)
  const wide: RiverRow = { ...W2_RIVERS.ride, gap: 120 };
  const right = riverFaults(crossing(wide, 1)), left = riverFaults(crossing(wide, -1));
  assert.ok(right.some((f) => /past a hop \(80\)/.test(f)), right.join(' | '));
  assert.deepEqual(left.map((f) => f.replace(/^river at x=-?\d+ \(crossed right to left\)/, 'R')), right.map((f) => f.replace(/^river at x=-?\d+/, 'R')));
});

test("levelCheck reads a leftward river's current against him: logs flowing WITH him 100 px apart are too far to hop (80), as crossed right", () => {
  // (the river crossed right to left built by hand, the mirror of the rightward one, so this holds levelCheck alone: its world current
  // runs LEFT (dir -1), with him; read as 'against him' it would be held to 130 and pass)
  const row: RiverRow = { ...W2_RIVERS.ride, gap: 100, safe: undefined };
  const R = layRiver(row, 2000, 500, ids()), M = 2 * 2000;
  const zone: RiverZone = { ...R.zone, x0: M - R.zone.x1, x1: M - R.zone.x0, dir: -1, way: -1 };
  const logs = R.logs.map((p) => ({ ...p, drift: { ...p.drift!, x0: M - p.drift!.x1, x1: M - p.drift!.x0, dir: -1 as const } }));
  const left = { platforms: [bank(1, 2000, 300, 500), ...logs, bank(2, zone.x0 - 300, 300, 500)], rivers: [zone] };
  for (const [name, c] of [['right', crossing(row, 1)], ['left', left]] as const) {
    const st = { ...c, vines: [], collectibles: [], enemies: [], checkpoints: [], spawnX: name === 'right' ? 1750 : 2250, spawnY: 500, exitTotemX: name === 'right' ? 3000 : 1000, config: { levelWidth: 5000, levelHeight: 1200, worldIndex: 2, miniIndex: 1, id: '2-97', objectiveType: 'sprint' } };
    const hop = validateStage(st as never).errors.filter((e) => /too far to hop/.test(e));
    assert.equal(hop.length, 1, `${name}: ${validateStage(st as never).errors.join(' | ')}`);
  }
});

test('a tower section too long for the storey turned at the wall fails by name, never laid through the wall (G5)', () => {
  // (a 1100 px section: under the storey's 1140, over the 1096 a storey turned at the wall holds (its near end a vine's step in))
  const wide: SectionTemplate = {
    id: 'tower-wide', name: 'wide', archetypes: 'any', phases: ['ki', 'sho', 'ten', 'ketsu'], difficulty: 3,
    pieces: [{ key: 'a', shape: 'branch', w: [300, 300], place: { kind: 'start' } }, { key: 'b', shape: 'branch', w: [800, 800], place: { kind: 'walk', after: 'a', dy: [0, 0] }, landing: true }],
    entry: { piece: 'a', kind: 'ledge' }, exit: { piece: 'b', kind: 'ledge' }, exitDy: 0, sockets: [], mirrorable: false,
  };
  const kit: WorldKit = { manifest: { ...upManifest, sections: [...upManifest.sections, wide], required: { '1-97': [{ section: 'tower-wide' }] } }, emit: {} };
  let named = 0;
  for (let seed = 1; seed <= 12; seed++) {
    try {
      const st = buildGen2Stage({ config: towerCfg('1-97', 'ascent'), kit, seed, difficulty: 'normal' });
      const out = st.platforms.filter((p) => p.type === 'solid' && (p.x < -1 || p.x + p.width > 1281));
      assert.deepEqual(out.map((p) => [p.x, p.width]), [], `seed ${seed}: wood laid through the tower's wall`);
    } catch (e) {
      if (e instanceof assert.AssertionError) throw e;
      assert.match((e as Error).message, /section tower-wide runs 1100 px on from its entry, and the storey turned at the wall holds 1096 px/);
      named++;
    }
  }
  assert.ok(named > 0, 'the toy never needed the turn at the wall');
});
