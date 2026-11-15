/**
 * The laid chase's dev fixture (chaseFixtureStage.ts; ENG-B5 packet c): the page's `?fixture=chase` builds the game's own gen2 chase
 * (chaseLay.test.ts's fixture, one definition) with nuts and fruit laid by its own ground, so the draw check and the clips play a real
 * laid chase before 1-8 exists. Red before the module: no such stage, nothing for the page to load.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import './headlessDom.ts';
import { buildChaseFixtureStage, chaseFixtureConfig, chaseFixtureLevel, CHASE_FIXTURE_ID } from './chaseFixtureStage.ts';
import { rollGroundProblems, rollProblems, rollTeaches } from './rolling.ts';
import { stretchAt } from './chase.ts';
import { generateStage } from './stageGenerator.ts';

test('chase fixture: never outside a dev build (no config, and generateStage never builds it)', () => {
  assert.equal(chaseFixtureConfig(), null);
  const st = generateStage(chaseFixtureLevel(), 'normal');
  assert.ok(!st.rolling?.length, 'a non-dev build rolls no fixture hazards');
});

test('chase fixture: a real laid chase, both settings, three seeds: its nuts and fruit by its own ground, the teach pair before the crack, one hazard to a run', () => {
  for (const difficulty of ['normal', 'easy'] as const) {
    for (const seed of [1, 2, 3]) {
      const st = buildChaseFixtureStage(chaseFixtureLevel(), seed, difficulty);
      const at = `${difficulty} seed ${seed}`;
      assert.equal(st.config.id, CHASE_FIXTURE_ID);
      // (its own size: every platform he stands on is above the pit line, levelHeight + 120, engine.ts)
      assert.ok(st.platforms.every((q) => q.y < st.config.levelHeight + 120), `${at}: ground under the pit line (levelHeight ${st.config.levelHeight})`);
      assert.ok(st.platforms.some((q) => st.spawnX >= q.x && st.spawnX <= q.x + q.width), `${at}: no ground at the spawn`);
      assert.ok(st.chase?.stretches.length, `${at}: no chase laid`);
      const rl = st.rolling ?? [];
      assert.deepEqual(rollProblems(rl), [], at);
      assert.deepEqual(rollGroundProblems(rl, st.platforms), [], `${at}: every run-in plain ground (no rock, no gap)`);
      assert.ok(rl.length >= 3, `${at}: ${rl.length} hazards`);
      assert.ok(rl.some((h) => !h.teach), `${at}: none on a stretch`);
      assert.ok(rl.some((h) => h.kind === 'low') && rl.some((h) => h.kind === 'high'), `${at}: both heights`);
      const first = st.chase!.stretches[0].start;
      for (const h of rl) {
        assert.equal(rollTeaches(h, st.chase), h.dropX < first, `${at}: ${h.kind} at ${h.dropX} teaches only before the crack`);
        if (h.dropX >= first) assert.ok(stretchAt(st.chase!, h.dropX) >= 0, `${at}: ${h.kind} at ${h.dropX} is on a stretch`);
        // (ground under where it lands, and unbroken for the run-in before it)
        for (let x = h.dropX - 420; x <= h.dropX; x += 20) {
          assert.ok(st.platforms.some((p) => p.type === 'solid' && x >= p.x && x <= p.x + p.width), `${at}: ${h.kind} at ${h.dropX}: no ground at ${x}`);
        }
      }
    }
  }
});
