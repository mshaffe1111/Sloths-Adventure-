/**
 * Every attack is seen coming (2026-10-26, QA play of 1-10 and 3-10): Venom Fang's lunge has a rear-back of at least 0.6 s with a hiss,
 * and Dot's tip for it comes well before the first one; in 3-10's dark the Shadow Prowler is drawn back over the dark, lit as he winds up.
 * The idle gap and the on-screen wind-ups are checked in the real fights in bossFair.test.ts.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BossPlay } from './bossPlay.ts';
import { venomPose, VF } from './venomFang.ts';
import { darkReveal } from './bossCues.ts';
import { hitLabel, hitsLeft } from './bossHits.ts';
import type { BossEntity } from './types.ts';

test("1-10: Dot's tip comes before the first lunge, which rears back for at least 0.6 s with a hiss", () => {
  const sim = new BossPlay('1-10');
  sim.skipEntrance();
  for (let i = 0; i < 30 * 30 && sim.tells.filter((t) => t.move === 'sweep').length < 3; i++) sim.frame();
  const tip = sim.guides.find((g) => /rears back/i.test(g.text));
  assert.ok(tip, "Dot's lunge tip was never said");
  const lunges = sim.tells.filter((t) => t.move === 'sweep');
  assert.ok(lunges.length >= 2);
  assert.ok(lunges[0].t0 - tip.t >= 3, `the first lunge came ${(lunges[0].t0 - tip.t).toFixed(1)} s after Dot's tip`);
  for (const l of lunges.slice(0, -1)) assert.ok(l.dur >= 0.6, `a wind-up of ${l.dur.toFixed(2)} s`);
  assert.equal(sim.def.tellCall, 'boa');
  // the head draws up and back over the first 0.6 s of the wind-up, so it reads as a rear-back, not a twitch
  assert.ok(VF.rear >= 0.6);
  const b = sim.boss;
  const at = (t: number) => venomPose({ ...b, ai: { ...b.ai!, state: 'tell', move: 'sweep', t } } as BossEntity, sim.arena.floor, 0);
  const moved = (t: number) => Math.hypot(at(t).jx - at(0).jx, at(t).jy - at(0).jy);
  const rise = moved(VF.rear);
  const half = moved(VF.rear / 2);
  assert.ok(rise > 80 && half < rise * 0.85, `the head moves ${rise.toFixed(0)} px (half way ${half.toFixed(0)})`);
});

test('3-10: in the dark the Prowler is drawn back over it, faintly while he prowls and lit as he winds up and strikes', () => {
  const sim = new BossPlay('3-10');
  sim.skipEntrance();
  const b = sim.boss;
  const as = (state: string, move: string | null) => ({ ...b, ai: { ...b.ai!, state, move, t: 0 } }) as BossEntity;
  assert.equal(darkReveal(as('tell', 'pounce'), sim.def, 0), 0, 'nothing extra while the cave is lit');
  for (const mv of ['pounce', 'clawCombo', 'shadowStep', 'streak']) {
    assert.ok(darkReveal(as('tell', mv), sim.def, 1) >= 0.8, `${mv} wind-up in the dark`);
    assert.ok(darkReveal(as('act', mv), sim.def, 1) >= 0.8, `${mv} in the dark`);
  }
  const idle = darkReveal(as('idle', null), sim.def, 1);
  assert.ok(idle > 0.2 && idle < 0.6, 'a shape at the edge of the moonlight while he prowls');
  assert.ok(sim.def.moves.pounce.tell >= 0.6, 'the pounce crouch lasts long enough to read');
});

test('the hit pop says what came off the bar: half a hit, one, or two', () => {
  // Venom: 12 hit points, 6 segments (2 a segment). A jab (1) from full takes half, the next one a whole segment
  assert.equal(hitsLeft(12, 12, 6), 6);
  assert.equal(hitsLeft(11, 12, 6), 6);
  assert.equal(hitsLeft(10, 12, 6), 5);
  assert.match(hitLabel(6, 6, false, 100), /½ HIT/);
  assert.match(hitLabel(6, 5, false, 100), /BOSS HIT!/);
  // a hook on a stunned boss (3) can take two at once: it says so
  assert.equal(hitsLeft(3, 12, 6) - hitsLeft(0, 12, 6), 2);
  assert.match(hitLabel(2, 0, true, 100), /CRITICAL ×2!/);
});
