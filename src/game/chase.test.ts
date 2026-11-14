import test from 'node:test';
import assert from 'node:assert/strict';
import { CHASE, CHASE_ROWS, caught, caughtInRun, chaseLayProblems, chaseSpeed, frontBehind, newChase, newChaseRun, restartAt, restartRunAt, sectionInRun, sectionState, sectionStretch, stepChase, stepChaseRun, type ChaseLay, type ChasePlan } from './chase.ts';
import { PHYS } from './physics.ts';
import { BRANCH_TILE, buildProtoStage, EXPERT_SECONDS, G } from './protoStage.ts';
import { badPickups } from './flowerReach.ts';
import { reachJump } from './physics.ts';
import type { LevelConfig } from './types.ts';

const plan: ChasePlan = { start: 2000, end: 30000, finalFrom: 28000 };

test('the collapse waits until he passes its start, then sets off behind him', () => {
  const s = newChase(plan);
  stepChase(s, plan, 1, 1500);
  assert.equal(s.active, false);
  stepChase(s, plan, 1 / 30, 2010);
  assert.equal(s.active, true);
  assert.ok(2010 - s.front >= CHASE.behind - 1);
});

test('a player who keeps running pulls away; one who stops is caught within a few seconds', () => {
  const run = newChase(plan);
  let x = 2010;
  stepChase(run, plan, 1 / 30, x);
  for (let i = 0; i < 30 * 20; i++) {
    x += 285 / 30;
    stepChase(run, plan, 1 / 30, x);
    assert.equal(caught(run, x), false, `caught while running at ${i / 30} s`);
  }
  // the band: far ahead, it speeds up, so the gap stays bounded
  assert.ok(x - run.front < CHASE.band + CHASE.ramp + 200, `gap ${x - run.front}`);
  const stop = newChase(plan);
  stepChase(stop, plan, 1 / 30, 2010);
  let t = 0;
  while (!caught(stop, 2010) && t < 10) {
    stepChase(stop, plan, 1 / 30, 2010);
    t += 1 / 30;
  }
  assert.ok(t > 1.5 && t < 4, `stopping is caught after ${t.toFixed(1)} s`);
});

test('it goes faster the farther ahead he is, and faster again on the last stretch', () => {
  assert.equal(chaseSpeed(plan, 100, 5000), CHASE.base);
  assert.ok(chaseSpeed(plan, CHASE.band + CHASE.ramp, 5000) === CHASE.max);
  assert.ok(chaseSpeed(plan, 100, 28500) > CHASE.base);
  assert.ok(CHASE.base < 285, 'slower than his run');
});

test('a restart puts the collapse well behind the flag and holds it a moment', () => {
  const s = newChase(plan);
  stepChase(s, plan, 1 / 30, 2100);
  restartAt(s, plan, 9000);
  assert.equal(s.front, 9000 - CHASE.behind);
  const f = s.front;
  stepChase(s, plan, 1, 9000);
  assert.equal(s.front, f, 'held');
  assert.equal(sectionState(s, 9000, 9222), 'whole');
  assert.equal(sectionState(s, f - 300, f - 100), 'fallen');
  assert.equal(sectionState(s, f + 10, f + 200), 'cracked');
});

test('1-8: the branch runs unbroken but for jumpable gaps and vine swings, the chase starts after a calm run, and it takes two minutes', () => {
  const cfg = { worldIndex: 1, miniIndex: 8, id: '1-8', name: 'The Long Branch', objectiveType: 'sprint', targetCount: 1, timeLimit: 0, levelWidth: 16700, levelHeight: 900, description: '', unlocked: true, completed: false, stars: 0, highScore: 0, bestTime: 0 } as LevelConfig;
  const two = reachJump(0, true);
  for (let seed = 1; seed < 900; seed += 41) {
    const st = buildProtoStage(cfg, seed, '1-8');
    const ch = st.proto.chase!;
    assert.ok(ch.start > 2000 && ch.start < ch.finalFrom && ch.finalFrom < ch.end && ch.end < st.exitTotemX);
    assert.ok(st.meta!.timing!.layoutSeconds >= EXPERT_SECONDS - 15, `seed ${seed}`);
    const secs = st.platforms.filter((p) => p.chase && p.width === BRANCH_TILE).sort((a, b) => a.x - b.x);
    assert.ok(secs.length > 80);
    // every gap along the main branch is a jump (single or double), a drop, or has a vine or a trunk over it
    for (let i = 1; i < secs.length; i++) {
      const a = secs[i - 1], b = secs[i];
      const g = b.x - (a.x + a.width);
      if (g <= 1) continue;
      const helped = st.vines.some((v) => v.x > a.x + a.width - 120 && v.x < b.x + 120);
      assert.ok(helped || (g < two * 0.78 && b.y >= a.y - 10), `seed ${seed}: gap of ${g} at ${a.x + a.width}`);
    }
    assert.equal(st.proto.movedPickups, 0);
    assert.equal(badPickups({ platforms: st.platforms, vines: st.vines }, st.collectibles).length, 0);
    assert.ok(st.collectibles.some((c) => c.type === 'seed'), 'the fast line holds a seed');
    // World 1's book, in a fern before the chase starts
    const book = st.collectibles.find((c) => c.type === 'find');
    assert.ok(book && book.findId === 'w1_book' && book.hidden && book.x < ch.start, `seed ${seed}: the book before the chase`);
    assert.ok(st.platforms.some((p) => p.chaseTip));
    assert.ok(st.checkpoints!.length >= 6);
    assert.ok(st.platforms[0].y === G);
  }
});

// --- a laid chase: stretches, living forks, the Easy row (ENGINE-678 B1). Numbers are the rows' own, never x positions of a stage.

/** two stretches with a living fork between them (400 px), the second the last */
const lay: ChaseLay = { stretches: [{ start: 1000, end: 4000 }, { start: 4400, end: 7400, last: true }] };
const DT = 1 / 30;

test('the rows: Normal is the old 1-8 (unchanged); Easy is at most 200 px/s and never faster than his run, last stretch included', () => {
  for (const k of Object.keys(CHASE) as Array<keyof typeof CHASE>) assert.equal(CHASE_ROWS.normal[k], CHASE[k], `normal ${k}`);
  const easy = CHASE_ROWS.easy;
  for (const finalFrom of [Infinity, -Infinity]) {
    for (let gap = 0; gap <= 3000; gap += 10) {
      const v = chaseSpeed({ start: 0, end: 1e9, finalFrom }, gap, 0, easy);
      assert.ok(v <= 200 && v <= PHYS.maxRun, `easy ${v} px/s at gap ${gap}`);
    }
  }
  // (Normal's last stretch still runs faster than his run: the designed finale, 1-8.md)
  assert.ok(chaseSpeed({ start: 0, end: 1e9, finalFrom: -Infinity }, 0, 0) > PHYS.maxRun);
  // (the stop budget: Easy gives more room to stop than Normal)
  const budget = (r: typeof easy) => (r.behind - r.catchAt) / r.base;
  assert.ok(budget(easy) > budget(CHASE_ROWS.normal) * 1.4, `easy ${budget(easy)} s vs normal ${budget(CHASE_ROWS.normal)} s`);
});

test('a lay that cannot run is named: overlapping stretches, an end before its start, a "last" that is not last, none at all', () => {
  assert.deepEqual(chaseLayProblems(lay), []);
  assert.equal(chaseLayProblems({ stretches: [] }).length, 1);
  assert.equal(chaseLayProblems({ stretches: [{ start: 10, end: 5 }] }).length, 1);
  assert.equal(chaseLayProblems({ stretches: [{ start: 0, end: 500 }, { start: 400, end: 900 }] }).length, 1);
  assert.equal(chaseLayProblems({ stretches: [{ start: 0, end: 500, last: true }, { start: 600, end: 900 }] }).length, 1);
});

for (const easy of [false, true]) {
  const set = easy ? 'Easy' : 'Normal';
  test(`${set}: a runner in stride is never caught; each front stops at its fork; the next cracks behind him as he leaves the fork`, () => {
    const r = newChaseRun(lay, easy);
    let x = 0;
    let fork = false;
    for (let i = 0; i < 30 * 40 && x < 7300; i++) {
      x += PHYS.maxRun * DT;
      stepChaseRun(r, DT, x);
      assert.equal(caughtInRun(r, x), false, `caught at ${x.toFixed(0)}`);
      for (const f of r.fronts) assert.ok(f.front <= lay.stretches[r.fronts.indexOf(f)].end, 'no front past its fork');
      if (x >= lay.stretches[1].start && !fork) {
        fork = true;
        assert.equal(r.fronts[1].active, true, 'the second stretch cracks as he passes its start');
        assert.ok(x - r.fronts[1].front >= r.row.behind - 1, 'its front sets off `behind` back');
      }
      if (x < lay.stretches[1].start) assert.equal(r.fronts[1].active, false, 'the second waits for him');
    }
    assert.ok(fork);
  });

  test(`${set}: he stops on a stretch and is caught within its stop budget; he stops on the fork and is never caught`, () => {
    // (he stops the moment the crack sets off: caught after exactly the row's stop budget, (behind - catchAt) / base, 1-8.md)
    const r = newChaseRun(lay, easy);
    const x = lay.stretches[0].start;
    stepChaseRun(r, DT, x);
    let t = 0;
    while (!caughtInRun(r, x) && t < 20) (t += DT), stepChaseRun(r, DT, x);
    const budget = (r.row.behind - r.row.catchAt) / r.row.base;
    assert.ok(Math.abs(t - budget) <= DT + 1e-9, `caught after ${t.toFixed(3)} s, budget ${budget.toFixed(3)} s`);
    // (on the fork, 30 s still: the front comes to the fork's edge and stops)
    const f = newChaseRun(lay, easy);
    let y = 0;
    for (; y < 4100; y += PHYS.maxRun * DT) stepChaseRun(f, DT, y);
    for (let i = 0; i < 30 * 30; i++) {
      stepChaseRun(f, DT, 4100);
      assert.equal(caughtInRun(f, 4100), false, 'never caught on the fork');
    }
    assert.equal(f.fronts[0].front, lay.stretches[0].end, 'the front rests at the fork');
    // (and right at the fork's edge, within catchAt of the stopped front: still safe)
    assert.equal(caughtInRun(f, lay.stretches[0].end + 1), false);
  });

  test(`${set}: back at a flag on the fork, the stretch behind stays fallen to its fork and the next waits; a flag in a stretch holds its front`, () => {
    const r = newChaseRun(lay, easy);
    for (let x = 0; x < 6000; x += PHYS.maxRun * DT) stepChaseRun(r, DT, x);
    restartRunAt(r, 4200);
    assert.equal(r.fronts[0].front, lay.stretches[0].end);
    assert.equal(r.fronts[1].active, false, 'the stretch ahead waits for him to pass its start again');
    assert.equal(sectionInRun(r, 0, 3600, 3800), 'fallen', 'behind the fork stays fallen');
    assert.equal(sectionInRun(r, 1, 4600, 4800), 'whole', 'ahead of the fork is whole again');
    restartRunAt(r, 5000);
    assert.equal(r.fronts[1].front, 5000 - r.row.behind);
    assert.equal(r.fronts[1].hold, r.row.hold);
    assert.equal(caughtInRun(r, 5000), false);
  });
}

test('sections: each on its own stretch\'s ground; one on a fork or past the last fork belongs to none and never falls', () => {
  assert.equal(sectionStretch(lay, 0, 200), 0, 'the base behind the first crack is the first stretch\'s (the long crack)');
  assert.equal(sectionStretch(lay, 3800, 4000), 0);
  assert.equal(sectionStretch(lay, 4000, 4400), -1, 'on the fork');
  assert.equal(sectionStretch(lay, 4400, 4600), 1);
  assert.equal(sectionStretch(lay, 7400, 7600), -1, 'past the last fork');
  const r = newChaseRun(lay, false);
  for (let x = 0; x < 7400; x += PHYS.maxRun * DT) stepChaseRun(r, DT, x);
  for (let i = 0; i < 30 * 30; i++) stepChaseRun(r, DT, 7500);
  assert.equal(sectionInRun(r, -1, 4000, 4400), 'whole');
  assert.equal(frontBehind(r, 7500), null, 'both fronts rest at their forks: nothing behind him runs');
});
