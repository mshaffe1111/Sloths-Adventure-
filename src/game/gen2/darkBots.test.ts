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
  // (ENG-DARK box 13: on the final lay roll 12's first 85 s no longer hold it; box 12's scan (scan-box12-jump.txt, plant 13 on rolls 1-40)
  //  found it on real rows again, the earliest the expert Easy roll 2: the jump over the rim at the right end of 225-484 at 22.97 s with its
  //  landing dark; unplanted, the first 26 s go over 4 dark rims, every one lit. A REAL row, not a shape toy)
  if (readied !== DRAFT) readyDraft(DRAFT);
  const { firstTimer, FT_EXPERT } = await import('../../../tools/inspect/firsttimer.ts');
  const r = firstTimer(DRAFT, 2, { ...FT_EXPERT, setting: 'easy' }, { cap: 26 });
  assert.ok(r.dark && r.dark.crossed >= 3, `he went over dark rims (${r.dark?.crossed})`);
  assert.deepEqual(r.dark.unlit, []);
});

test("the dark's stop FACES the rim: the child's stop, taken facing away 40 px in from a rim, turns him to it and its light wakes (GREEN; planted: the turn removed)", async () => {
  // (castBots x40 on b71163ea, unlit cause 2: the child Normal stood still at x 1014 facing right, 40 px in from the rim at the left end
  //  of 974-1154; the landing's light 357 px behind him, past GLOW_REACH.back, never woke; he waited it out and went over dark at 42.07 s,
  //  then, the give-up kept for the run, over it again at 48.53 s 0.34 s after its light woke. This roll's first 50 s hold that stop)
  // (ENG-DARK box 12: on the final lay every landing's light is within GLOW_REACH.back of a stop, so a stop facing away wakes it and no
  //  run of rolls 1-40 needs the turn; the toy is hand-built: the child on roll 1 stood 40 px in from the draft's first sleeping rim facing
  //  away at 0.5 s, that rim's light held asleep while he faces away from it (a light behind him past his reach, as on b71163ea))
  if (readied !== DRAFT) readyDraft(DRAFT);
  const { firstTimer, FT_CHILD } = await import('../../../tools/inspect/firsttimer.ts');
  const { darkRims } = await import('./dark.ts');
  let rim: ReturnType<typeof darkRims>[number] | undefined;
  const r = firstTimer(DRAFT, 1, FT_CHILD, { cap: 12, onFrame(sim) {
    if (rim?.light?.id !== undefined && sim.p.facing !== rim.dir) (sim.e as unknown as { glowWake: Map<number, number> }).glowWake.delete(rim.light.id);
    if (rim || sim.e.gameTime <= 0.5) return;
    rim = darkRims(sim.stage as Parameters<typeof darkRims>[0]).find((q) => q.light?.sleep);
    assert.ok(rim, 'the draft has a sleeping rim');
    sim.stand(rim.x - rim.dir * 40, rim.y);
    sim.p.facing = -rim.dir as -1 | 1;
    sim.p.vx = 0;
  } });
  assert.ok(rim && r.dark, 'he was stood at a sleeping rim in the lit dark');
  assert.ok(r.dark.crossed >= 1, `he went over the rim (${r.dark.crossed})`);
  assert.deepEqual(r.dark.unlit, []);
  assert.deepEqual(r.dark.gaveUp, []);
});

/** (ENG-DARK box 14) the draft's first rim in the dark with a glowworm, its light laid ASLEEP for the toy and the bot's rim list re-read:
 *  box 14's lay wakes the landings a run off a rim with no stop comes down near (awakeLights), and that woke roll 1's first sleeping rim
 *  (x 846, y 927, left end of 846-1099), which the give-up and turn-room toys were built on; `undo` puts the lay back */
function asleepRim(sim: { stage: unknown }, b: unknown, darkRims: (st: never) => Array<{ x: number; y: number; dir: -1 | 1; light: { id?: number; sleep?: boolean } | null }>) {
  const rim = darkRims(sim.stage as never).find((q) => q.light?.id !== undefined);
  assert.ok(rim?.light, 'the draft has a rim with a glowworm');
  const was = rim.light.sleep;
  rim.light.sleep = true;
  (b as { glowRims: unknown }).glowRims = null;
  return { rim, undo: () => { rim.light!.sleep = was; } };
}

test("a dark give-up ends with the visit: with the turn removed (noGlowTurn) he waits out the same rim facing away on BOTH visits (GREEN; planted: the give-up kept for the run)", async () => {
  // (the give-up kept for the run, the child's second visit to that rim had no stop at all; ended with the visit, he stops again)
  // (ENG-DARK box 12: on the final lay a stop facing away always wakes its light (every landing's light is within GLOW_REACH.back of a
  //  stop inside GLOW_NEAR), so no run of rolls 1-40 gives up; the toy is hand-built: the child on roll 1 is stood 40 px in from the
  //  draft's first sleeping rim facing away at 0.5 s and again at 12 s, that rim's light held asleep (its wake cleared every frame):
  //  a light that cannot wake, met on two visits)
  if (readied !== DRAFT) readyDraft(DRAFT);
  const { firstTimer, FT_CHILD } = await import('../../../tools/inspect/firsttimer.ts');
  const { darkRims } = await import('./dark.ts');
  let rim: ReturnType<typeof darkRims>[number] | undefined, stood = 0, undo = () => {};
  const r = firstTimer(DRAFT, 1, { ...FT_CHILD, noGlowTurn: true }, { cap: 20, onFrame(sim, b) {
    if (rim?.light?.id !== undefined) (sim.e as unknown as { glowWake: Map<number, number> }).glowWake.delete(rim.light.id);
    if (stood >= 2 || sim.e.gameTime <= (stood ? 12 : 0.5)) return;
    if (!rim) ({ rim, undo } = asleepRim(sim, b, darkRims as never) as unknown as { rim: ReturnType<typeof darkRims>[number]; undo: () => void });
    assert.ok(rim, 'the draft has a sleeping rim');
    sim.stand(rim.x - rim.dir * 40, rim.y);
    sim.p.facing = -rim.dir as -1 | 1;
    sim.p.vx = 0;
    stood++;
  } });
  undo();
  assert.equal(stood, 2, 'he was stood at the rim twice');
  assert.ok(r.dark, 'the drafted 3-1 has a lit dark (FTRun.dark)');
  const rims = r.dark.gaveUp.map((g) => g.replace(/ at [\d.]+ s$/, ''));
  assert.equal(rims.length, 2, `two waited-out stops: ${JSON.stringify(r.dark.gaveUp)}`);
  assert.equal(rims[0], rims[1], 'both at the same rim, one per visit');
});

test("the dark's stop reads the THUMB: the KID's held steer that carries him toward a dark rim stops him there (GREEN; planted: glowSteer not read)", async () => {
  // (castBots x40 on ef811c2a, unlit cause 3: the KID Normal landed on a piece steering left in the air, meant to stand (intended {}),
  //  and his thumb's late lift-off, re-armed every frame (R-165.59), ran him 90 px left over the dark rim at its left end at 73.90 s with
  //  its landing dark: the route said right, so glowWait never looked left. This roll's first 80 s hold that run, as castBots plays it)
  // (ENG-DARK box 13: on the final lay no run of rolls 1-40 is carried by the thumb at a dark rim his route turns from (plant 16 changed
  //  no run), so the toy is hand-built on the draft's first sleeping rim: the KID on roll 1, its light held asleep until 0.5 s, is stood
  //  200 px in from it and steers at it; at 130 px out he means to stand (intended {}, glowWait read first, as intend reads it) until 4 s,
  //  then his own plan; his late lift-off re-arms every frame and carries him on; planted, it carries him over that rim with its landing dark)
  if (readied !== DRAFT) readyDraft(DRAFT);
  const { firstTimer, FT_KID } = await import('../../../tools/inspect/firsttimer.ts');
  const { darkRims } = await import('./dark.ts');
  type Bot = { sim: { p: { x: number } }; intend(): object; glowWait(d: number): object | null };
  let rim: ReturnType<typeof darkRims>[number] | undefined, stood = false, meant = -1;
  const r = firstTimer(DRAFT, 1, { ...FT_KID, setting: 'normal' }, { cap: 12, dotSetting: true, onFrame(sim, b) {
    rim ??= darkRims(sim.stage as Parameters<typeof darkRims>[0]).find((q) => q.light?.sleep);
    assert.ok(rim?.light?.id !== undefined, 'the draft has a sleeping rim');
    if (!stood) (sim.e as unknown as { glowWake: Map<number, number> }).glowWake.delete(rim.light.id);
    if (stood || sim.e.gameTime <= 0.5) return;
    stood = true;
    const at = rim, bot = b as Bot, intend = bot.intend;
    sim.stand(at.x - at.dir * 200, at.y);
    sim.p.facing = at.dir;
    sim.p.vx = 0;
    bot.intend = function (this: Bot) {
      if (sim.e.gameTime > 4) return intend.call(this);
      const out = (at.x - this.sim.p.x) * at.dir;
      if (meant < 0 && out > 130) return at.dir > 0 ? { right: true } : { left: true };
      if (meant < 0) meant = Math.round(out);
      return this.glowWait(0) ?? {};
    };
  } });
  assert.ok(meant > 0, `he meant to stand on the rim's piece (${meant} px out)`);
  assert.ok(r.dark && r.dark.crossed >= 1, `he went over dark rims (${r.dark?.crossed})`);
  assert.deepEqual(r.dark.unlit, []);
});

test("the way down a trunk he stands beside MID-WAY (roll 33 Easy): the child takes it with up and climbs down past the ledge (GREEN; planted: the one-sided top test back, the mid-trunk grab removed)", async () => {
  // (castBots x40 on 653bb970-4527e73f, the dark-only strand: a rescue set the CHILD Easy on a piece that trunk 26 runs through, its top
  //  281 px over his feet, the way on down it to the floor and the shrine. The way-down plan pressed DOWN there (it asked only that the top
  //  be at or above his feet; the engine climbs down from the ground only at a vine's very top), and he held it 20 s to a strand at
  //  295.9 s; with the top asked both ways alone the route's point under him turned him at the trunk until stranded. The whole run)
  // (ENG-DARK box 13: on the final lay castRun child Easy 25 reaches the shrine with either plant, so the toy is hand-built: the child
  //  Easy on roll 1 is placed (placeAt: the route's progress and the checkpoint follow) at 0.5 s 10 px beside the deepest trunk that runs
  //  past a ledge mid-way, its top above his feet (277 px on this lay), the way on down it to the shrine; GREEN he takes it with up, climbs
  //  down and reaches the shrine in 20 s with no rescue; with either plant he stands at the trunk until rescued (shrine at 24.6-29.6 s))
  // (ENG-DARK box 14: ENG-DOWNBOT's lay (merged) leaves roll 1 Easy no trunk past a ledge mid-way; of rolls 1-40 Easy only roll 33 has
  //  one (probes/anchors.mts), so the toy stands on roll 33 Easy)
  if (readied !== DRAFT) readyDraft(DRAFT);
  const { firstTimer, FT_CHILD } = await import('../../../tools/inspect/firsttimer.ts');
  type Spot = { x: number; y: number; top: number };
  let spot: Spot | undefined, placed = false, climbed = 0, deepest = -Infinity;
  const r = firstTimer(DRAFT, 33, { ...FT_CHILD, setting: 'easy' }, { cap: 20, onFrame(sim, b) {
    if (placed) { if (sim.p.climbing) climbed++; if (climbed) deepest = Math.max(deepest, sim.p.y); return; }
    if (sim.e.gameTime <= 0.5) return;
    const vines = (sim.e as unknown as { vines: Array<{ vineType: string; x: number; topY: number; bottomY: number }> }).vines;
    for (const v of vines) if (v.vineType === 'tree_climb') for (const q of sim.platforms)
      if (q.x <= v.x && v.x <= q.x + q.width && v.topY < q.y - 14 && v.bottomY > q.y + 60 && (!spot || q.y > spot.y)) spot = { x: v.x, y: q.y, top: v.topY };
    assert.ok(spot, 'the draft has a trunk that runs past a ledge mid-way');
    (b as { placeAt(x: number, y: number): void }).placeAt(spot.x + 10, spot.y);
    sim.p.vx = 0;
    placed = true;
  } });
  assert.ok(spot && spot.y - spot.top > 14, `the trunk's top stands above his feet (${spot && spot.y - spot.top} px)`);
  assert.ok(climbed > 0, 'he took the trunk');
  // (box 14: on roll 33 the trunk is not the last way to the shrine, so the run asks the climb down past the ledge, not the shrine)
  assert.ok(spot && deepest > spot.y + 60, `he climbed down past the ledge (${spot && Math.round(deepest - spot.y)} px under it)`);
  assert.deepEqual(r.stuck.map((q) => q.what), [], 'no rescue on the way down');
});

test("a RUN off a lit edge in the dark whose touchdown lies within his slide of a sleeping rim: he stops at that edge until that rim's light is lit, then runs on, and goes over it lit (adult Normal roll 1: x 556, y 3672 onto x 673, y 3850) (GREEN; planted: runOffRims not read)", async () => {
  // (the 3-1 trial merge of ENG-DOWNBOT: the adult ran off a ledge with no dark stop at 268 px/s, flew 92 px, landed 7 px from a sleeping
  //  rim and went over it dark: 74 such crossings in 44 of 76 runs. On the merged lay this roll's adult runs off the lit edge x 556,
  //  y 3672 (its own landing's light is the cave mouth's, so it is no dark stop of its own), touches down 10 px from the rim at x 673,
  //  y 3850 and went over it dark at 36.30 s. A stop on 376-556 wakes that rim's light (runOffs' stops), so the bot stops there)
  if (readied !== DRAFT) readyDraft(DRAFT);
  const { firstTimer, FT_ADULT } = await import('../../../tools/inspect/firsttimer.ts');
  const { runOffRims } = await import('./dark.ts');
  let stopped = false, listed = false;
  const r = firstTimer(DRAFT, 1, { ...FT_ADULT, setting: 'normal' }, { cap: 40, onFrame(sim, b) {
    if (!listed) listed = runOffRims(sim.stage as Parameters<typeof runOffRims>[0], 'normal').some((q) => q.x === 556 && q.y === 3672 && q.land.y === 3850);
    const g = (b as { glowStop: { rim: { x: number; y: number; runOff?: true } } | null }).glowStop;
    if (g?.rim.runOff && g.rim.x === 556 && g.rim.y === 3672) stopped = true;
  } });
  assert.ok(listed, 'the edge x 556, y 3672 is a run-off stop (runOffRims)');
  assert.ok(stopped, 'he stopped at it');
  assert.ok(r.dark && r.dark.crossed >= 1, `he went over dark rims (${r.dark?.crossed})`);
  assert.deepEqual(r.dark.unlit.filter((u) => u.includes('the rim at x 673, y 3850')), [], 'the rim his run lands near was lit');
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
  // (ENG-DARK box 12: on the final lay the loop's crossings are lit (the second lights), so the loop is read on all of them: FTRun.dark.loop)
  assert.ok(r.dark.loop < 10, `no rim gone over again and again (the most over one rim: ${r.dark.loop})`);
});

test("a seam read as a way down (noSeamWalk, the plant): both sides of the seam point him at the way on under it, and he walks back and forth over one dark rim (RED)", async () => {
  const r = await seamRun(true);
  assert.ok(r.dark, 'the drafted 3-1 has a lit dark (FTRun.dark)');
  // (box 12, the final lay: 31 times over one rim, lit or not; unplanted 3. Box 10's lay: the same loop, its crossings unlit)
  assert.ok(Math.max(r.dark.loop, worstRim(r.dark.unlit)) >= 10, `one rim gone over again and again (the most over one rim: ${r.dark.loop}; unlit ${JSON.stringify(r.dark.unlit.slice(0, 3))})`);
});

/** (ENG-DARK box 12) the turn-room stop, hand-built: on the final lay no bot's own run (middle Normal, rolls 1-40) stops facing away at a
 *  rim's very edge, so he is STOOD there: the middle on Normal roll 1, at 0.5 s set standing 2 px in from the draft's first sleeping rim,
 *  facing away from it, its landing dark (asleepRim, box 14); the run then plays on (12 s). Box 10's real case: roll 16 x 920 on the lay before the second
 *  lights. FTRun.dark.edgeTurns names each turn press nearer the rim than its turn room */
async function turnRun(noTurnRoom: boolean) {
  if (readied !== DRAFT) readyDraft(DRAFT);
  const { firstTimer, FT_MIDDLE } = await import('../../../tools/inspect/firsttimer.ts');
  const { darkRims } = await import('./dark.ts');
  let rim: ReturnType<typeof darkRims>[number] | undefined, undo = () => {};
  const r = firstTimer(DRAFT, 1, { ...FT_MIDDLE, setting: 'normal', noTurnRoom }, { cap: 12, onFrame(sim, b) {
    if (rim || sim.e.gameTime <= 0.5) return;
    ({ rim, undo } = asleepRim(sim, b, darkRims as never) as unknown as { rim: ReturnType<typeof darkRims>[number]; undo: () => void });
    assert.ok(rim, 'the draft has a sleeping rim');
    sim.stand(rim.x - rim.dir * 2, rim.y);
    sim.p.facing = -rim.dir as -1 | 1;
    sim.p.vx = 0;
  } });
  undo();
  assert.ok(rim && r.dark, 'he was stood at a sleeping rim in the lit dark');
  return { dark: r.dark, at: `x ${rim.x}, y ${Math.round(rim.y)}` };
}

test("the dark stop's turn is never pressed at the rim's very edge: stood 2 px in from a sleeping rim facing away, he steps back, then turns, and no rim is gone over dark (GREEN; planted: noTurnRoom)", async () => {
  const { dark } = await turnRun(false);
  assert.deepEqual(dark.edgeTurns, []);
  assert.deepEqual(dark.unlit, []);
});

test("the turn pressed at the rim's very edge (noTurnRoom, the plant): the press that turns him carries him off that rim into the dark (RED)", async () => {
  const { dark, at } = await turnRun(true);
  assert.ok(dark.edgeTurns.some((t) => t.includes(at)), `a turn pressed at the edge of the rim at ${at}: ${JSON.stringify(dark.edgeTurns)}`);
  assert.ok(dark.unlit.some((u) => u.includes(at)), `the rim at ${at} gone over dark: ${JSON.stringify(dark.unlit.slice(0, 3))}`);
});
