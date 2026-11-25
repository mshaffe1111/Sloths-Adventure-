/**
 * THE BOTS' SKILL FOR THE DARK (ENG-DARK, R-165.449; level.md rule 21: a skill every bot has, with its planted toy): at a rim in the
 * glowworms' dark whose landing is still dark, he stands until it is lit, then goes (firsttimer.ts glowWait; 3-1.md "Stand still, and
 * the glowworms show the way down"). On a REAL row (level.md rule 23): World 3's first stage drafted down (stageTable.ts DRAFT_TABLE
 * '3-1'), the whole bot run in the real engine, the rims he goes over judged by litAhead ('every gap lit 1 s ahead', GAME-MAP B9).
 *   - with the skill: every rim he goes over in the run's first minute was lit 1 s ahead: GREEN;
 *   - the skill REMOVED (noGlowWait, the plant): he walks off into the dark: RED.
 * The draft is readied before the bots' harness loads (realPlay.ts builds the levels at load), so the bots are imported after it.
 */
import '../headlessDom.ts';
import { readied, readyDraft } from '../../../tools/engine/draft.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const DRAFT = '3-1';
/** the bot's first minute on the draft's roll 1 (a minute crosses several of its dark rims) */
async function run(noGlowWait: boolean) {
  if (readied !== DRAFT) readyDraft(DRAFT);
  const { firstTimer, FT_ADULT } = await import('../../../tools/inspect/firsttimer.ts');
  return firstTimer(DRAFT, 1, noGlowWait ? { ...FT_ADULT, noGlowWait } : FT_ADULT, { cap: 60 });
}

test("the dark's skill: he stands at a dark rim until its landing is lit, then goes: every rim he went over was lit 1 s ahead (GREEN)", async () => {
  const r = await run(false);
  assert.ok(r.dark, 'the drafted 3-1 has a lit dark (FTRun.dark)');
  assert.ok(r.dark.crossed >= 3, `he went over dark rims in his first minute (${r.dark.crossed})`);
  assert.deepEqual(r.dark.unlit, []);
});

test("the dark's skill REMOVED (noGlowWait, rule 21's plant): he walks off into the dark (RED)", async () => {
  const r = await run(true);
  assert.ok(r.dark && r.dark.crossed >= 3, `he went over dark rims (${r.dark?.crossed})`);
  assert.ok(r.dark.unlit.length >= 1, 'a rim gone over with its landing dark');
  assert.match(r.dark.unlit[0], /landing dark|after its light woke/);
});

test("the dark's skill holds a running JUMP too: the expert's jump into the dark waits for the landing's light (GREEN; planted: glowJump removed)", async () => {
  // (castBots x40 on 653bb970: the expert went over the rim at the right end of a piece with its landing dark, the jump pressed 94 px
  //  out, just past GLOW_NEAR; this roll's first 85 s hold that jump)
  if (readied !== DRAFT) readyDraft(DRAFT);
  const { firstTimer, FT_EXPERT } = await import('../../../tools/inspect/firsttimer.ts');
  const r = firstTimer(DRAFT, 12, FT_EXPERT, { cap: 85 });
  assert.ok(r.dark && r.dark.crossed >= 3, `he went over dark rims (${r.dark?.crossed})`);
  assert.deepEqual(r.dark.unlit, []);
});

test("the dark's stop FACES the rim: the child's stop, taken facing away 40 px in from a rim, turns him to it and its light wakes (GREEN; planted: the turn removed)", async () => {
  // (castBots x40 on b71163ea, unlit cause 2: the child Normal stood still at x 1014 facing right, 40 px in from the rim at the left end
  //  of 974-1154; the landing's light 357 px behind him, past GLOW_REACH.back, never woke; he waited it out and went over dark at 42.07 s,
  //  then, the give-up kept for the run, over it again at 48.53 s 0.34 s after its light woke. This roll's first 50 s hold that stop)
  if (readied !== DRAFT) readyDraft(DRAFT);
  const { firstTimer, FT_CHILD } = await import('../../../tools/inspect/firsttimer.ts');
  const r = firstTimer(DRAFT, 19, FT_CHILD, { cap: 50 });
  assert.ok(r.dark && r.dark.crossed >= 3, `he went over dark rims (${r.dark?.crossed})`);
  assert.deepEqual(r.dark.unlit, []);
  assert.deepEqual(r.dark.gaveUp, []);
});

test("a dark give-up ends with the visit: with the turn removed (noGlowTurn) he waits out the same rim facing away on BOTH visits (GREEN; planted: the give-up kept for the run)", async () => {
  // (the give-up kept for the run, the child's second visit to that rim had no stop at all; ended with the visit, he stops again)
  if (readied !== DRAFT) readyDraft(DRAFT);
  const { firstTimer, FT_CHILD } = await import('../../../tools/inspect/firsttimer.ts');
  const r = firstTimer(DRAFT, 19, { ...FT_CHILD, noGlowTurn: true }, { cap: 50 });
  assert.ok(r.dark, 'the drafted 3-1 has a lit dark (FTRun.dark)');
  const rims = r.dark.gaveUp.map((g) => g.replace(/ at [\d.]+ s$/, ''));
  assert.equal(rims.length, 2, `two waited-out stops: ${JSON.stringify(r.dark.gaveUp)}`);
  assert.equal(rims[0], rims[1], 'both at the same rim, one per visit');
});

test("the dark's stop reads the THUMB: the KID's held steer that carries him toward a dark rim stops him there (GREEN; planted: glowSteer not read)", async () => {
  // (castBots x40 on ef811c2a, unlit cause 3: the KID Normal landed on a piece steering left in the air, meant to stand (intended {}),
  //  and his thumb's late lift-off, re-armed every frame (R-165.59), ran him 90 px left over the dark rim at its left end at 73.90 s with
  //  its landing dark: the route said right, so glowWait never looked left. This roll's first 80 s hold that run, as castBots plays it)
  if (readied !== DRAFT) readyDraft(DRAFT);
  const { firstTimer, FT_KID } = await import('../../../tools/inspect/firsttimer.ts');
  const r = firstTimer(DRAFT, 16, { ...FT_KID, setting: 'normal' }, { cap: 80, dotSetting: true });
  assert.ok(r.dark && r.dark.crossed >= 3, `he went over dark rims (${r.dark?.crossed})`);
  assert.deepEqual(r.dark.unlit, []);
});

test("the way down a trunk he stands beside MID-WAY: the child takes it with up and climbs down to the shrine (GREEN; planted: the one-sided top test back, the mid-trunk grab removed)", async () => {
  // (castBots x40 on 653bb970-4527e73f, the dark-only strand: a rescue set the CHILD Easy on a piece that trunk 26 runs through, its top
  //  281 px over his feet, the way on down it to the floor and the shrine. The way-down plan pressed DOWN there (it asked only that the top
  //  be at or above his feet; the engine climbs down from the ground only at a vine's very top), and he held it 20 s to a strand at
  //  295.9 s; with the top asked both ways alone the route's point under him turned him at the trunk until stranded. The whole run)
  if (readied !== DRAFT) readyDraft(DRAFT);
  const { castRun } = await import('../../../tools/inspect/castBots.ts');
  const r = castRun('child', 'easy', DRAFT, 25);
  assert.equal(r.end, 'shrine', `the child Easy roll 25 reaches the shrine (${r.end} at ${r.time})`);
});

/** roll 32's seam: a way-on point under a 35 px gap between two pieces at his height (79-332 and 367-547 on this lay) he walks over */
async function seamRun(noSeamWalk: boolean) {
  if (readied !== DRAFT) readyDraft(DRAFT);
  const { firstTimer, FT_ADULT } = await import('../../../tools/inspect/firsttimer.ts');
  return firstTimer(DRAFT, 32, { ...FT_ADULT, setting: 'normal', noSeamWalk }, { cap: 200 });
}
/** the most times one rim was gone over with its landing dark */
const worstRim = (unlit: readonly string[]) => Math.max(0, ...[...unlit.reduce((m, u) => m.set(u.replace(/ at [\d.]+ s .*$/, ''), (m.get(u.replace(/ at [\d.]+ s .*$/, '')) ?? 0) + 1), new Map<string, number>()).values()]);

test("a seam he walks over is no way down: over roll 32's 35 px seam with the way on under it, he goes on and every rim he went over was lit (GREEN; planted: noSeamWalk)", async () => {
  const r = await seamRun(false);
  assert.ok(r.dark && r.dark.crossed >= 20, `he went over dark rims (${r.dark?.crossed})`);
  assert.deepEqual(r.dark.unlit, []);
});

test("a seam read as a way down (noSeamWalk, the plant): both sides of the seam point him at the way on under it, and he walks back and forth over one dark rim (RED)", async () => {
  const r = await seamRun(true);
  assert.ok(r.dark, 'the drafted 3-1 has a lit dark (FTRun.dark)');
  assert.ok(worstRim(r.dark.unlit) >= 10, `one rim gone over dark again and again: ${JSON.stringify(r.dark.unlit.slice(0, 3))}`);
});
