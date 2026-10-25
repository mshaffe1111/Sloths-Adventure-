import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildDotStage, checkFlight, DOT, DOT_STAGE_ID, DOT_STAGE_SECONDS, dotStageConfig } from './dotFlightStage.ts';
import { stageSeconds } from './protoStage.ts';

const SEEDS = Array.from({ length: 16 }, (_, i) => 1 + i * 37);

test("Dot's stage has its own length in STAGE_SECONDS, about 200 s for a quick player", () => {
  assert.equal(stageSeconds(DOT_STAGE_ID), DOT_STAGE_SECONDS);
  assert.ok(DOT_STAGE_SECONDS >= 190 && DOT_STAGE_SECONDS <= 220);
});

test('every roll passes the flight check: energy between flowers, holes against her body, thorns clear, gusts crossable (16 seeds)', () => {
  for (const seed of SEEDS) {
    const st = buildDotStage(seed);
    const c = checkFlight(st);
    assert.ok(c.ok, `seed ${seed}: ${c.problems.map((p) => `${p.what} (x ${p.x})`).join('; ')}`);
    assert.ok(c.worstStretch < DOT.energy * 0.75);
  }
});

test('every roll runs its length (at least 2 minutes, about STAGE_SECONDS for a quick player)', () => {
  for (const seed of SEEDS) {
    const st = buildDotStage(seed);
    assert.ok(st.est.seconds >= Math.max(120, DOT_STAGE_SECONDS - 8) && st.est.seconds <= DOT_STAGE_SECONDS + 20, `seed ${seed}: ${st.est.seconds.toFixed(0)} s`);
  }
});

test('the beats come in order: learn, develop, twist, finish, ending at the folded-letter gap', () => {
  for (const seed of SEEDS) {
    const st = buildDotStage(seed);
    const names = st.beats.map((b) => b[2].split(':')[0]);
    const order = ['Start', 'Learn', 'Develop', 'Twist', 'Finish'];
    let at = 0;
    for (const n of names) {
      const k = order.indexOf(n);
      assert.ok(k >= at, `seed ${seed}: ${names.join(', ')}`);
      at = k;
    }
    // the last wall is the gap, and it is the smallest hole of all
    const last = [...st.walls].sort((a, b) => a.x - b.x).at(-1)!;
    assert.ok(last.letter && last.id === st.letter.wall);
    assert.equal(last.openings.length, 1);
    const smallest = Math.min(...st.walls.filter((w) => !w.letter).flatMap((w) => w.openings.map((o) => o.h)));
    assert.ok(last.openings[0].h < smallest);
    assert.ok(last.openings[0].h >= 2 * DOT.R + 8, 'she still fits');
  }
});

test('the same seed builds the same stage; another seed rolls the details', () => {
  assert.deepEqual(buildDotStage(38), buildDotStage(38));
  const a = buildDotStage(38).walls.map((w) => Math.round(w.openings[0].y));
  const b = buildDotStage(75).walls.map((w) => Math.round(w.openings[0].y));
  assert.notDeepEqual(a, b);
});

test("the stage's entry: World 4, after 4-5, a sprint to the gap", () => {
  const c = dotStageConfig();
  assert.equal(c.worldIndex, 4);
  assert.equal(c.miniIndex, 11);
  assert.equal(c.objectiveType, 'sprint');
  assert.equal(c.timeLimit, 0);
});
