/**
 * 8-4 Lantern Run: the jar (lantern.ts) and the stage (w8Lantern.ts), pure. The rules: the jar drains in its time and a flower fills it;
 * empty, the dark closes in only after its grace, and the setback is soft (back to the last flower); a moth steals light, a punch
 * scatters it; a fall is deadly on Normal only when the far side was lit; a careful player (half again as slow as the quick one) always
 * reaches the next flower before the dark closes in; the stage is at least 2 minutes and sideways, not up high.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LANTERN, lanternRadius, newLantern, stepLantern, takeoff, type LanternPlan } from './lantern.ts';
import { buildLanternRun, LANTERN_G, LANTERN_H } from './w8Lantern.ts';
import type { LevelConfig } from './types.ts';

const CFG = { id: '8-4', worldIndex: 8, miniIndex: 4 } as LevelConfig;
const plan = (over: Partial<LanternPlan> = {}): LanternPlan => ({
  flowers: [{ id: 1, x: 0, y: 700, r: 190 }],
  moths: [],
  gaps: [],
  swarmX: 1e9,
  swarmTree: { x: 0, y: 0 },
  ...over,
});
const run = (s: ReturnType<typeof newLantern>, p: LanternPlan, set = LANTERN.normal, secs: number, x = 5000, feet = 700) => {
  const evs: string[] = [];
  for (let t = 0; t < secs; t += 1 / 30) {
    const ev = stepLantern(s, p, set, 1 / 30, x, feet);
    if (ev) evs.push(ev);
  }
  return evs;
};

test('the jar drains in its time, warns once when low, and its ring shrinks to an ember (never nothing)', () => {
  for (const d of ['normal', 'easy'] as const) {
    const set = LANTERN[d];
    const p = plan();
    const s = newLantern(p);
    const evs = run(s, p, set, set.drain - 0.2);
    assert.ok(s.level > 0 && s.level < 0.05, `${d}: ${s.level}`);
    assert.equal(evs.filter((e) => e === 'low').length, 1);
    assert.ok(lanternRadius(set, 0) >= 60, 'Pokey never vanishes');
    assert.ok(lanternRadius(set, 1) > lanternRadius(set, 0.3) * 1.8);
  }
});

test('empty, the dark closes in only after its grace, and the setback fills the jar (nothing lost)', () => {
  const set = LANTERN.normal;
  const p = plan();
  const s = newLantern(p);
  run(s, p, set, set.drain + 0.1);
  assert.equal(s.level, 0);
  const evs = run(s, p, set, set.grace - 0.3);
  assert.ok(!evs.includes('setback'));
  const evs2 = run(s, p, set, 0.6);
  assert.ok(evs2.includes('setback'));
  assert.ok(s.level > 0.95, 'the jar full again');
});

test('a flower fills the jar in about its fill time, as often as he passes', () => {
  const set = LANTERN.normal;
  const p = plan();
  const s = newLantern(p);
  s.level = 0.1;
  const evs = run(s, p, set, set.fill + 0.1, 30, 700);
  assert.ok(evs.includes('filled'));
  assert.ok(s.level > 0.97, `${s.level}`);
});

test('a moth steals light on a touch and flutters off; a punch scatters it first', () => {
  const set = LANTERN.normal;
  const p = plan({ moths: [{ id: 1, x: 5150, y: 640 }] });
  const s = newLantern(p);
  const evs = run(s, p, set, 4);
  assert.ok(evs.includes('stolen'));
  assert.ok(s.level < 1 - set.steal + 0.01);
  const s2 = newLantern(p);
  let stolen = false;
  for (let t = 0; t < 4; t += 1 / 30) {
    const m = s2.moths[0];
    const near = Math.hypot(m.x - 5000, m.y - 662) < 85;
    if (stepLantern(s2, p, set, 1 / 30, 5000, 700, near) === 'stolen') stolen = true;
  }
  assert.ok(!stolen, 'a punch as it comes in scatters it');
});

test('a fall is deadly on Normal only when the far side was lit as he left the bough', () => {
  const set = LANTERN.normal;
  const p = plan({ flowers: [], gaps: [{ x0: 1000, x1: 1180, y0: 700, y1: 700 }] });
  assert.equal(takeoff(p, set, 1, 990, 700, 1)?.lit, true, 'a bright jar shows the far side');
  assert.equal(takeoff(p, set, 0.05, 990, 700, 1)?.lit, false, 'a dim jar does not: the fall is soft');
  assert.equal(takeoff(p, set, 1, 500, 700, 1), null, 'no gap ahead');
});

test('8-4: sideways, at least 2 minutes, flowers close enough for a careful player, void under every gap', () => {
  for (const seed of [1, 2, 3, 7, 11]) {
    const st = buildLanternRun(CFG, seed);
    const l = st.lantern84;
    // (the swarm and the walk to the shrine add about 5 s to the model's run)
    assert.ok(l.expert + 5 >= 140, `${seed}: ${l.expert}`);
    // a careful player (half again as slow) reaches every next flower before the dark closes in, on both settings
    const ts = [...l.flowerT, l.expert];
    for (let i = 1; i < ts.length; i++) {
      const gap = (ts[i] - ts[i - 1]) * 1.5;
      assert.ok(gap < LANTERN.normal.drain + LANTERN.normal.grace - 3, `${seed}: flower ${i} is ${gap.toFixed(1)} s after the last`);
    }
    // sideways: no bough far above or below the resting height
    for (const p of st.platforms) assert.ok(p.y > LANTERN_G - 480 && p.y < LANTERN_G + 120, `${seed}: bough ${p.id} at ${p.y}`);
    assert.ok(st.config.levelWidth > 30000);
    // nothing under a gap: a fall is the long drop (the bough's own face aside)
    for (const g of l.plan.gaps) {
      const under = st.platforms.filter((p) => p.x < g.x1 - 4 && p.x + p.width > g.x0 + 4);
      assert.equal(under.length, 0, `${seed}: something under the gap at ${g.x0}`);
      assert.ok(LANTERN_H > g.y0);
    }
    // the first flower is on screen at the start (sideways and upright: within 400 px of the spawn)
    assert.ok(l.plan.flowers[0].x - st.spawnX < 400);
  }
});
