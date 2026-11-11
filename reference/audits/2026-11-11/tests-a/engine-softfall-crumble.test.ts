/**
 * AUDIT A-03 (2026-11-11): "a required crumbling platform is whole again when he respawns" (CLAUDE.md stage rules, Matt 2026-11-02,
 * roadmap A-37 / R-150.5) holds only for a LOST LIFE. engine.ts respawnAtCheckpoint() restores every fragile platform; softFall()
 * (Easy's soft falls, 1-1's "no fall costs a life", gen2's soft zones through heartFall, 8-4's lanternSetBack) restores none.
 * After a soft fall the platform stays gone for 30-35 s AND until it is 80 px off screen (regrow.ts), and he is set back on the ledge
 * he left (regrow.ts mayRegrow: `return !inside && offScreen(p, view)`), so wherever it is in view from there it cannot come back.
 *
 * Today no shipped stage puts a crumbling platform over a dry soft pit (scan of all 200 builds, ENGINE-AUDIT-A.md A-03), so this is a
 * trap, not a live soft-lock: it goes live the day R-150.5 or a soft-fall world lays a required crumble.
 * Fixed looks like: every set-back (soft fall, heart fall, lantern set-back) makes the crumbled platforms whole, as a lost life does.
 *
 * Run: npx tsx --test reference/audits/2026-11-11/tests-a/engine-softfall-crumble.test.ts
 */
import { makeEngine, standOn, step } from './_harness.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';

function breakThenFall(mode: 'soft' | 'life') {
  // Easy 10-2: soft falls on (an old-generator stage on Easy), six crumbling platforms, no water under it
  const { e } = makeEngine('10-2', 'easy');
  assert.equal(e.softOn, true, 'Easy 10-2 has soft falls');
  const frag = e.platforms.find((p: any) => p.type === 'fragile')!;
  const ground = e.platforms.filter((p: any) => p.type === 'solid' && p.width >= 200 && !p.push).sort((a: any, b: any) => Math.abs(a.y - frag.y) - Math.abs(b.y - frag.y))[0];
  // he stands on still ground (the soft fall's set-back spot), then on the crumbling platform until it gives way
  standOn(e, ground);
  step(e, 5);
  assert.ok(e.softAt, 'the set-back spot is known');
  standOn(e, frag);
  for (let i = 0; i < 90 && !frag.broken; i++) {
    standOn(e, frag);
    step(e, 1);
  }
  assert.equal(frag.broken, true, 'the platform crumbled under him');
  if (mode === 'soft') {
    // he falls past the bottom of the stage: the engine's own pit branch, which on this stage is a soft fall
    Object.assign(e.player, { y: e.currentStage.config.levelHeight + 200, vy: 300, grounded: false });
    const lives = e.lives;
    step(e, 2);
    assert.equal(e.lives, lives, 'a soft fall: no life lost');
    assert.ok(e.player.y < e.currentStage.config.levelHeight, 'he was set back on his ledge');
  } else {
    e.loseLife('pit');
    step(e, 40);
  }
  return { e, frag };
}

test('A-03 control: after a LOST LIFE the crumbled platform is whole again (respawnAtCheckpoint)', () => {
  const { frag } = breakThenFall('life');
  assert.equal(frag.broken, false);
});

test('A-03 after a SOFT FALL the crumbled platform is whole again too (the same rule: "whole again when he respawns")', () => {
  const { frag } = breakThenFall('soft');
  assert.equal(frag.broken, false, 'the platform he broke is still gone after the set-back');
});
