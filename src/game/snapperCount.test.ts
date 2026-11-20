/**
 * 2-5 River Snappers' goal counts every snapper beaten (QA 2026-10-28: "Punching raised the score but predators stayed 0/17").
 * Re-pointed by BUILD-25b to the snappers 2-5 lays now (the creature kit's turtle, gen2/worlds/w2Cast.ts; the hand-built stage's shell and
 * punch ways are gone, new replaces old): in the real engine (realPlay.ts) on the listed 2-5, the sleeper kicked off counts one, and an
 * awake one bonked (he lands on it) then kicked while it is dazed counts one. Nobody is hurt: each is chased off, never knocked out.
 */
import './headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from './realPlay.ts';
import { loadSeedList } from './gen2/seedList.ts';
import { setDifficulty } from './difficulty.ts';
import type { Enemy } from './types.ts';

type Sim = RealPlay & { e: { enemies: Enemy[] } };

/** he beats the `which`-th snapper of 2-5 (by x) the given way; what the goal counted and how it ended */
async function beat(which: number, way: 'kick the sleeper' | 'bonk then kick'): Promise<{ counted: number; off: boolean; by: string | null; hurt: number; asleep: boolean }> {
  await loadSeedList('2-5');
  setDifficulty('normal');
  const sim = new RealPlay('2-5', 1) as Sim;
  sim.safe = false;
  sim.p.invincibleTimer = 0;
  const e = sim.e.enemies.filter((x) => x.type === 'turtle').sort((a, b) => a.x - b.x)[which];
  assert.ok(e?.kit, 'the snapper is the creature kit\'s (in the cast)');
  const asleep = !!e.asleep;
  const hp = sim.p.hp;
  const feet = e.y + e.height / 2 + 14;
  if (way === 'kick the sleeper') {
    sim.stand(e.x - 40, feet);
    sim.p.facing = 1;
    for (let f = 0; f < 10; f++) sim.frame();
    sim.frame({ kick: 1 });
  } else {
    // (he drops onto its back: the cast's own stomp dazes it; then he kicks it from beside it while it is dazed)
    sim.fly(e.x, e.y - 150, 0, 0);
    for (let f = 0; f < 60 && e.kit?.phase !== 'stunned'; f++) sim.frame();
    assert.equal(e.kit?.phase, 'stunned', 'the bonk dazes it');
    sim.stand(e.x - 40, feet);
    sim.p.facing = 1;
    sim.frame({ kick: 1 });
  }
  for (let f = 0; f < 30 * 6 && sim.p.enemiesDefeated < 1; f++) sim.frame();
  return { counted: sim.p.enemiesDefeated, off: !!e.kit?.leaving || !!e.defeated, by: e.kit?.beatenBy ?? null, hurt: hp - sim.p.hp, asleep };
}

test('2-5: a snapper beaten counts toward the goal: the sleeper kicked off, and an awake one bonked then kicked, each count one; he is never hurt', async () => {
  const sleeper = await beat(0, 'kick the sleeper');
  assert.ok(sleeper.asleep, 'the first snapper sleeps');
  assert.ok(sleeper.off && sleeper.counted === 1 && sleeper.by === 'kick' && sleeper.hurt === 0, `the sleeper: ${JSON.stringify(sleeper)}`);
  const awake = await beat(1, 'bonk then kick');
  assert.ok(!awake.asleep, 'the second is awake');
  assert.ok(awake.off && awake.counted === 1 && awake.by === 'kick' && awake.hurt === 0, `the awake one: ${JSON.stringify(awake)}`);
  setDifficulty('normal');
});
