import test from 'node:test';
import assert from 'node:assert/strict';
import { buildProtoStage, EXPERT_SECONDS, HAND_STAGES } from './protoStage.ts';
import { validateStage } from './levelCheck.ts';
import { rockFits } from './rockfall.ts';
import type { LevelConfig } from './types.ts';

const cfg = { worldIndex: 4, miniIndex: 7, id: '4-7', name: '4-7', objectiveType: 'sprint', targetCount: 1, timeLimit: 0, levelWidth: 9000, levelHeight: 900, description: '', unlocked: true, completed: false, stars: 0, highScore: 0, bestTime: 0 } as LevelConfig;
const SEEDS = Array.from({ length: 16 }, (_, i) => 1 + i * 37);
const build = (s: number) => buildProtoStage(cfg, s, '4-7');

test('4-7: every roll can be finished on the leaf, and cannot be without it', () => {
  assert.equal(HAND_STAGES['4-7'], '4-7');
  for (const s of SEEDS) {
    const st = build(s);
    const res = validateStage(st);
    assert.ok(res.ok, `seed ${s}: ${res.errors.join('; ')}`);
    assert.equal(st.collectibles.filter((c) => c.type === 'exit_totem').length, 1);
    // judged as a stage before the leaf can be counted on (4-6), it must fail: the leaf is needed here
    const without = validateStage({ ...st, config: { ...st.config, miniIndex: 6 } });
    assert.equal(without.ok, false, `seed ${s}: 4-7 can be finished without the leaf`);
    assert.ok(st.meta!.timing!.layoutSeconds >= EXPERT_SECONDS - 8, `seed ${s}: ${Math.round(st.meta!.timing!.layoutSeconds)} s`);
    assert.ok((st.proto.movedPickups ?? 0) <= 2, `seed ${s}: ${st.proto.movedPickups} pickups moved`);
  }
});

test('4-7: it goes down; rocks drop through the gaps (never onto a ledge), with time to spare; updrafts and close flags', () => {
  for (const s of SEEDS) {
    const st = build(s);
    const ys = st.platforms.map((p) => p.y);
    assert.ok(ys[ys.length - 1] - ys[0] > 2500, `seed ${s}: only ${ys[ys.length - 1] - ys[0]} px down`);
    const rocks = st.proto.w4?.rocks ?? [];
    assert.ok(rocks.length >= 4, `seed ${s}: ${rocks.length} rocks`);
    for (const r of rocks) {
      assert.ok(r.air && rockFits(r), `seed ${s}`);
      assert.ok(!st.platforms.some((p) => r.x > p.x - 30 && r.x < p.x + p.width + 30 && p.y > r.top && p.y < r.land), `seed ${s}: a rock falls onto a ledge`);
    }
    assert.ok((st.proto.w4?.updrafts ?? []).length >= 2, `seed ${s}`);
    assert.equal(st.proto.w4?.deepFall, 700);
    const cps = st.checkpoints!;
    for (let i = 1; i < cps.length; i++) assert.ok(cps[i].x - cps[i - 1].x < 3200, `seed ${s}: flags ${cps[i].x - cps[i - 1].x} px apart`);
    for (const re of [/only way now is down/, /keep your thumb on the glass/, /Too far to jump/, /Rocks are dropping/, /Warm air/]) assert.ok(st.proto.hints.some((h) => re.test(h.text)), `seed ${s}: no hint ${re}`);
  }
});

test('4-7 runtime: falling well below the last ledge is a fall into the mist; an updraft lifts the leaf', async () => {
  const { W4Play } = await import('./w4Play.ts');
  const player = { x: 100, y: 1000, vx: 0, vy: 0, grounded: true, invincibleTimer: 0 } as never as import('./types.ts').PlayerState;
  let fell = 0;
  const host = { t: 0, player, platforms: [], vines: [], collectibles: [], zones: [], punch: null, hidden: false, hurt() {}, tip() {}, float() {}, screech() {}, sfx() {}, fellOff: () => fell++ };
  const w = new W4Play({ deepFall: 700, updrafts: [{ x0: 500, x1: 600, top: 800, bottom: 1400 }] }, [], []);
  w.step(1 / 30, host);
  player.grounded = false;
  player.y = 1650;
  w.step(1 / 30, host);
  assert.equal(fell, 0, 'a 650 px fall is not yet into the mist');
  player.y = 1720;
  w.step(1 / 30, host);
  assert.equal(fell, 1);
  w.step(1 / 30, host);
  assert.equal(fell, 1, 'it counts once');
  assert.equal(w.inUpdraft(550, 1000), true);
  assert.equal(w.inUpdraft(650, 1000), false);
});
