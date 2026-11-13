/**
 * Audit C (things): two systems share one id range. A boss's summoned minions get ids from 9000 (engine.ts spawnMinion), and "id >= 9000"
 * means "a minion" everywhere: not counted as a kill (knockOut: `e.id < 9000`), swept away when the boss falls. 1-9's ring drops its
 * snakes and prowlers with ids from 9500 (updateRing), so they read as minions too: every one of them counts for the stage's goal
 * (goals.ts: "the ring's snakes ... count too") and none of them is counted as a predator beaten for the medals (Predator Patrol,
 * Pest Control), the creature cards ("Defeated xN") or the journal's note.
 *
 * Correct: an animal that counts toward the stage's beat-the-animals goal is a predator beaten in the stage's report.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from './realPlay.ts';
import type { Enemy } from './types.ts';

test("1-9: the ring's animals he beats are in the stage's count of predators beaten", () => {
  const r = new RealPlay('1-9', 1);
  const e = r.e;
  const ring = e.proto?.ring as { x0: number; x1: number; waves: unknown[][] } | undefined;
  assert.ok(ring, '1-9 has its ring');
  const floor = r.platforms.filter((p) => ring.x0 + 300 >= p.x && ring.x0 + 300 <= p.x + p.width).sort((a, b) => a.y - b.y)[0];
  r.stand(ring.x0 + 300, floor?.y ?? r.p.y);
  // the first wave drops and lands
  for (let i = 0; i < 150 && !(e.enemies as Enemy[]).some((x) => x.id >= 9500); i++) r.frame();
  for (let i = 0; i < 90 && e.ringDrops.length; i++) r.frame();
  const wave = (e.enemies as Enemy[]).filter((x) => x.id >= 9500 && !x.defeated);
  assert.ok(wave.length > 0, 'the first wave is in the ring');

  const goalBefore = r.p.enemiesDefeated;
  for (const x of wave) {
    x.hp = 0;
    e.knockOut(x, 1, 'test'); // (the engine's own knock-out, as a punch that finishes one calls it)
  }
  const beaten = r.p.enemiesDefeated - goalBefore;
  assert.equal(beaten, wave.length, 'each one counts toward the goal');
  const kills = Object.values(e.liveStats().kills as Record<string, number>).reduce((a, b) => a + b, 0);
  assert.equal(kills, beaten, `the goal counted ${beaten} beaten, the stage's report (medals, cards, journal) counts ${kills}`);
});

test("a guardian's summoned animals are still not predators beaten (the rule the ring was caught by)", () => {
  const r = new RealPlay('1-10', 1);
  const e = r.e;
  assert.ok(e.currentStage.arena, '1-10 is fought in an arena');
  e.spawnMinion('snake', e.currentStage.arena.left + 200, 0);
  const minions = (e.enemies as Enemy[]).filter((x) => x.minion);
  assert.equal(minions.length, 1, 'the guardian summoned one');
  e.knockOut(minions[0], 1, 'test');
  assert.deepEqual(e.liveStats().kills, {}, 'a summoned animal is not counted');
});
