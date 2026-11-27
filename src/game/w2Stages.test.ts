import test from 'node:test';
import assert from 'node:assert/strict';
import { buildW2Stage, COURT_GOAL_29, type W2Plan } from './w2Stages.ts';
import { turtleGuard } from './predatorAI.ts';
import type { Enemy } from './types.ts';
import { EXPERT_SECONDS } from './protoStage.ts';
import { validateStage } from './levelCheck.ts';
import { w2Picks } from './w2Sections.ts';
import type { LevelConfig } from './types.ts';

const cfg = (id: W2Plan): LevelConfig =>
  ({
    worldIndex: 2, miniIndex: Number(id.split('-')[1]), id, name: id, objectiveType: id === '2-9' ? 'gauntlet' : 'rescue',
    targetCount: 1, timeLimit: 0, levelWidth: 9000, levelHeight: 900, description: '', unlocked: true, completed: false, stars: 0, highScore: 0, bestTime: 0,
  }) as LevelConfig;
const SEEDS = Array.from({ length: 16 }, (_, i) => 1 + i * 37);
// (2-4 is gen2's since BUILD-24, 11-18: gen2/worlds/w2Arc24.ts; its crossings are held in w2Arc24.test.ts. 2-3 is gen2's since BUILD-23,
//  11-20: gen2/worlds/w2Arc23.ts, held in w2Arc23.test.ts)
// (2-7 is gen2's since BUILD-27, 11-23: gen2/worlds/w2Arc27.ts, held in w2Arc27.test.ts)
// (2-8's hand build is gone, BUILD-28: the designed 2-8 is laid by gen2, gen2/worlds/w2Arc28.ts)
const PLANS: W2Plan[] = ['2-9'];

test('World 2 trio: every roll passes the reachability check, keeps its beats in order, has one exit and hearts on the way', () => {
  for (const plan of PLANS) {
    for (const s of SEEDS) {
      const st = buildW2Stage(cfg(plan), s, plan);
      {
        // (2-7's vine crossings are chains too, and so are the vines' rolls of 2-1..2-3: a bridge stands in for each, checked by the swing
        // tests as they are built, and the rest is checked here)
        const swings = (st.rivers ?? []).some((r) => r.open && st.vines.some((v) => v.x > r.x0 && v.x < r.x1));
        const bridged = swings
          ? { ...st, platforms: [...st.platforms, ...(st.rivers ?? []).filter((r) => r.open && st.vines.some((v) => v.x > r.x0 && v.x < r.x1)).map((r, i) => ({ id: 90000 + i, x: r.x0, y: 580, width: r.x1 - r.x0, height: 20, type: 'solid' as const }))] }
          : st;
        const res = validateStage(bridged);
        if (swings) {
          // the flowers along a swing are checked with the swings (flowerReach.ts), not from the stand-in bridge
          const spans = (st.rivers ?? []).filter((r) => r.open && st.vines.some((v) => v.x > r.x0 && v.x < r.x1));
          res.errors = res.errors.filter((e) => {
            const m = e.match(/^flower #\d+ at \((\d+), \d+\) is out of reach$/);
            return !(m && spans.some((r) => Number(m[1]) > r.x0 - 60 && Number(m[1]) < r.x1 + 60));
          });
          res.ok = res.errors.length === 0;
        }
        assert.ok(res.ok, `${plan} seed ${s}: ${res.errors.join('; ')}`);
      }
      assert.deepEqual(st.proto.beats.map((b) => b[2].split(':')[0]), ['Learn', 'Develop', 'Twist', 'Finish'], `${plan} seed ${s}`);
      assert.equal(st.collectibles.filter((c) => c.type === 'exit_totem').length, 1);
      assert.equal(st.collectibles.filter((c) => c.type === 'seed').length, 1, `${plan}: one golden seed`);
      assert.ok(st.collectibles.filter((c) => c.type === 'heart').length >= 2, `${plan} seed ${s}: hearts on the hard stretches`);
      assert.ok(st.meta!.timing!.layoutSeconds >= EXPERT_SECONDS - 15, `${plan} seed ${s}: ${st.meta!.timing!.layoutSeconds.toFixed(0)} s`);
      assert.equal(st.proto.movedPickups, 0, `${plan} seed ${s}: every pickup placed where he can get it`);
      // every river has a bank at both ends and logs (a lily pond has pads instead)
      for (const r of st.rivers ?? []) {
        const logs = st.platforms.filter((p) => p.drift?.x0 === r.x0);
        const pads = st.platforms.filter((p) => p.lily && p.x >= r.x0 && p.x <= r.x1);
        const vines = st.vines.filter((v) => v.vineType === 'swing_liana' && v.x > r.x0 && v.x < r.x1);
        const porches = st.platforms.filter((p) => p.art === 'porch' && p.x > r.x0 && p.x < r.x1);
        // (still water is crossed on lily pads or stepping stones, or it is a pool a hop across: a hanging cage's; 2-2's ferry has one raft)
        const stones = st.platforms.filter((p) => p.style === 'moss_stone' && p.x >= r.x0 && p.x + p.width <= r.x1);
        const still = pads.length >= 3 || stones.length >= 3 || r.x1 - r.x0 <= 180;
        assert.ok(r.open ? vines.length >= 2 || porches.length >= 2 : r.speed === 0 ? still : r.raft ? logs.length === 1 : logs.length >= 2, `${plan} seed ${s}: river at ${r.x0}`);
      }
    }
  }
});

test('2-9: the court: guards (royal snappers) and snappers, about one and a half times the goal, a row close enough to bowl over', () => {
  for (const s of SEEDS) {
    const st = buildW2Stage(cfg('2-9'), s, '2-9');
    assert.equal(st.config.targetCount, COURT_GOAL_29);
    assert.ok(st.enemies.length >= COURT_GOAL_29 * 1.35, `seed ${s}: ${st.enemies.length}`);
    const guards = st.enemies.filter((e) => e.royal);
    assert.ok(guards.length >= COURT_GOAL_29 * 0.8, `seed ${s}: ${guards.length} guards`);
    assert.ok(guards.every((g) => g.type === 'turtle' && g.hp === 2 && g.height > 50));
    const xs = guards.map((e) => e.x).sort((a, b) => a - b);
    let run = 1, best = 1;
    for (let i = 1; i < xs.length; i++) {
      run = xs[i] - xs[i - 1] < 160 ? run + 1 : 1;
      best = Math.max(best, run);
    }
    assert.ok(best >= 4, `seed ${s}: a row of four guards`);
    assert.ok(st.proto.decor!.some((d) => d.n === 'throne') && st.proto.decor!.some((d) => d.n === 'archway'), `seed ${s}: the king's throne and the archway`);
  }
});

test('the snapper: head-on it hides, its shell is kicked away, and from behind (or open after a snap) the blow lands', () => {
  const t = (state: string, facing: 1 | -1) => ({ x: 100, state, facing }) as unknown as Enemy;
  assert.equal(turtleGuard(t('patrol', -1), 40, false), 'shell', 'he is on the side it faces');
  assert.equal(turtleGuard(t('patrol', 1), 40, false), 'hit', 'behind it');
  assert.equal(turtleGuard(t('windup', -1), 40, true), 'shell');
  assert.equal(turtleGuard(t('recover', -1), 40, false), 'hit', 'open after the snap');
  assert.equal(turtleGuard(t('shell', -1), 40, true), 'slide');
  assert.equal(turtleGuard(t('shell', -1), 40, false), 'bump');
  assert.equal(turtleGuard(t('dizzy', -1), 40, false), 'hit');
});

// (2-6's look test moved to gen2/worlds/w2Arc26.test.ts with its assertions when the hand build was deleted, BUILD-26)
