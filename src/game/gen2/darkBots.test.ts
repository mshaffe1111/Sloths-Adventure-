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

test("the dark's skill holds a running JUMP too: the expert running at a hop rim whose landing is dark waits for its light (GREEN; planted: glowJump removed)", async () => {
  // (castBots x40 on 653bb970: the expert went over the rim at the right end of a piece with its landing dark, the jump pressed 94 px
  //  out, just past GLOW_NEAR. Boxes 13-15 anchored it on real rows (roll 12, then Easy roll 2); on the going-down lay no real row of
  //  box 12's scan holds that jump planted (box 15: plant 13 MISSED; box 18: Easy 2, Normal 4, 17 and 27 unlit [] planted). A SHAPE
  //  toy on a real rim (ENG-DARK box 18): Normal roll 4's hop rim at (808, 5980), facing right, its landing's light asleep; the expert
  //  is put 150 px before it at 0.5 s, running at it (250 px/s). Unplanted he stops and waits for the light; planted (glowJump not
  //  read) he jumps over it dark)
  if (readied !== DRAFT) readyDraft(DRAFT);
  const { firstTimer, FT_EXPERT } = await import('../../../tools/inspect/firsttimer.ts');
  const { darkRims } = await import('./dark.ts');
  let rim: ReturnType<typeof darkRims>[number] | undefined, done = false;
  const r = firstTimer(DRAFT, 4, { ...FT_EXPERT, setting: 'normal' }, { cap: 7, onFrame(sim, b) {
    if (done || sim.e.gameTime <= 0.5) return;
    done = true;
    rim = darkRims(sim.stage as never).find((q) => !q.drop && q.x === 808 && Math.round(q.y) === 5980 && q.dir === 1);
    assert.ok(rim?.light?.sleep && !(sim.e as unknown as { glowWake: Map<number, number> }).glowWake.has(rim.light.id!), 'the hop rim at (808, 5980), its light asleep');
    (b as { placeAt(x: number, y: number): void }).placeAt(rim.x - 150, rim.y);
    sim.p.facing = 1;
    sim.p.vx = 250;
  } });
  assert.ok(rim && r.dark, 'he was put running at the hop rim');
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

/** roll 6's seam: a way-on point under a 22 px gap from 271-451 (y 5914) to 473-708, 15 px lower, a step he walks over both ways (box 14:
 *  on ENG-DOWNBOT's lay roll 32's 35 px seam no longer has the way on under it; rolls 6, 11 and 35 looped 17-30 times at such a seam with
 *  the 8 px test, probes/seamscan.mts) */
async function seamRun(noSeamWalk: boolean) {
  if (readied !== DRAFT) readyDraft(DRAFT);
  const { firstTimer, FT_ADULT } = await import('../../../tools/inspect/firsttimer.ts');
  return firstTimer(DRAFT, 6, { ...FT_ADULT, setting: 'normal', noSeamWalk }, { cap: 200 });
}
/** the most times one rim was gone over with its landing dark */
const worstRim = (unlit: readonly string[]) => Math.max(0, ...[...unlit.reduce((m, u) => m.set(u.replace(/ at [\d.]+ s .*$/, ''), (m.get(u.replace(/ at [\d.]+ s .*$/, '')) ?? 0) + 1), new Map<string, number>()).values()]);

test("a seam he walks over is no way down: over roll 6's 22 px seam (a 15 px step) with the way on under it, he goes on and every rim he went over was lit (GREEN; planted: noSeamWalk)", async () => {
  const r = await seamRun(false);
  assert.ok(r.dark && r.dark.crossed >= 20, `he went over dark rims (${r.dark?.crossed})`);
  assert.deepEqual(r.dark.unlit, []);
  // (ENG-DARK box 12: on the final lay the loop's crossings are lit (the second lights), so the loop is read on all of them: FTRun.dark.loop)
  assert.ok(r.dark.loop < 10, `no rim gone over again and again (the most over one rim: ${r.dark.loop})`);
});

test("a seam read as a way down (noSeamWalk, the plant): both sides of the seam point him at the way on under it, and he walks back and forth over one dark rim (RED)", async () => {
  const r = await seamRun(true);
  assert.ok(r.dark, 'the drafted 3-1 has a lit dark (FTRun.dark)');
  // (box 14, roll 6: 30 times over one rim with the plant, lit; box 12's roll 32 on its lay: 31, unplanted 3)
  assert.ok(Math.max(r.dark.loop, worstRim(r.dark.unlit)) >= 10, `one rim gone over again and again (the most over one rim: ${r.dark.loop}; unlit ${JSON.stringify(r.dark.unlit.slice(0, 3))})`);
});

/** roll 11's seam (ENG-DARK box 15): the way on drops through a 13 px gap from 355-591 (y 11405) to 604-784, 13 px UP (a step he walks
 *  over), and comes out past 784 on the storey under it (604-817, y 11552). Steered by his facing, a turn on 355-591 flipped him and he
 *  walked to and fro over the rim at 604 eleven times (probes/seamscan.mts); he steps off the run's end the way on comes out past */
async function seam11(seamByFacing: boolean) {
  if (readied !== DRAFT) readyDraft(DRAFT);
  const { firstTimer, FT_ADULT } = await import('../../../tools/inspect/firsttimer.ts');
  return firstTimer(DRAFT, 11, { ...FT_ADULT, setting: 'normal', seamByFacing }, { cap: 200 });
}

test("the way on under a seam run comes out past its far end: on roll 11's 13 px seam he steps off that end and reaches the shrine, no rim gone over again and again (GREEN; planted: seamByFacing)", async () => {
  const r = await seam11(false);
  assert.equal(r.end, 'shrine', `he reached the shrine (${r.end} at ${r.time})`);
  assert.ok(r.dark && r.dark.crossed >= 20, `he went over dark rims (${r.dark?.crossed})`);
  assert.deepEqual(r.dark.unlit, []);
  assert.ok(r.dark.loop < 6, `no rim gone over again and again (the most over one rim: ${r.dark.loop})`);
});

test("the seam run's end picked by his facing (seamByFacing, the plant): turned on the low side, he walks to and fro over roll 11's seam (RED)", async () => {
  const r = await seam11(true);
  assert.ok(r.dark, 'the drafted 3-1 has a lit dark (FTRun.dark)');
  assert.ok(Math.max(r.dark.loop, worstRim(r.dark.unlit)) >= 8, `one rim gone over again and again (the most over one rim: ${r.dark.loop})`);
});

/** roll 15's run by the wall (ENG-DARK box 16): the expert on Normal runs off 10758 at full speed, carries past the piece the way drops
 *  onto (842-1080, y 11039) and lands on 826-1280 (y 11320), wood that runs on to the right side wall, the shrine 347 px straight under
 *  it. The way on never comes out past that run, so downEnd read no end and he stood over the shrine turning until stranded (child and
 *  middle on Normal 15 and Easy 27 the same); he steps off the run's open end (826) */
async function wall15(noOpenEnd: boolean) {
  if (readied !== DRAFT) readyDraft(DRAFT);
  const { firstTimer } = await import('../../../tools/inspect/firsttimer.ts');
  const { CAST_BOTS } = await import('../../../tools/inspect/castBots.ts');
  return firstTimer(DRAFT, 15, { ...CAST_BOTS.expert.normal!, noOpenEnd }, { cap: 200 });
}

test("the way on straight under a run that ends at a side wall: on Normal roll 15 the expert steps off its open end and reaches the shrine (GREEN; planted: noOpenEnd)", async () => {
  const r = await wall15(false);
  assert.equal(r.end, 'shrine', `he reached the shrine (${r.end} at ${r.time}; ${JSON.stringify(r.stuck.slice(-2).map((s) => s.what))})`);
  assert.ok(!r.stuck.some((s) => /fell back down/.test(s.what)), `never fell back down again and again (${JSON.stringify(r.stuck.map((s) => s.what))})`);
});

test("no end picked under that run (noOpenEnd, the plant): the expert stands over the shrine by roll 15's right wall until stranded (RED)", async () => {
  const r = await wall15(true);
  assert.notEqual(r.end, 'shrine', `stranded by the wall (${r.end} at ${r.time})`);
});

/** roll 26's way down (ENG-DARK box 16): the middle on Normal runs off 5 (y 1188) past 6 (224-460, y 1469), where the way drops, onto
 *  0-703 (y 1599), the floor the way reaches 15 points on. Followed by the nearest point (on 6, over his head) he climbed the trunk at
 *  x 244 back up, ran off and fell again, three times, then a rescue ('a trunk beside him, on a trunk', 'fell back down from here 8
 *  times'); landed ahead, he is put on the way at his floor (landedAhead) */
async function ahead26(noLandAhead: boolean) {
  if (readied !== DRAFT) readyDraft(DRAFT);
  const { firstTimer } = await import('../../../tools/inspect/firsttimer.ts');
  const { CAST_BOTS } = await import('../../../tools/inspect/castBots.ts');
  return firstTimer(DRAFT, 26, { ...CAST_BOTS.middle.normal!, noLandAhead }, { cap: 30 });
}

test("landed ahead on the way's own floor: on Normal roll 26 the middle walks on from where he came down, never back up the trunk (GREEN; planted: noLandAhead)", async () => {
  const r = await ahead26(false);
  assert.ok(!r.stuck.some((s) => /on a trunk|fell back down/.test(s.what)), `no climb back up and fall again (${JSON.stringify(r.stuck.map((s) => s.what))})`);
  assert.equal(r.rescues, 0, `no rescue in his first 30 s (${r.rescues})`);
});

test("followed by the point over his head (noLandAhead, the plant): the middle climbs roll 26's trunk back up and falls again until rescued (RED)", async () => {
  const r = await ahead26(true);
  assert.ok(r.stuck.some((s) => /fell back down/.test(s.what)), `fell back down again and again (${JSON.stringify(r.stuck.map((s) => s.what))})`);
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

/** (ENG-DARK box 17's rule on the real row, box 18's toys) the drafted 3-1 Normal 22: turn 17's vine (x 833) stops on catch #193
 *  (824-1004, y 8384) whose LEFT end is walled (log #51, 427-807 at y 8311, 90 px thick, 17 px from it: tower.ts walledEnd). The way on
 *  steps off the open RIGHT end (x > 1004); stepping off the walled end, the kid, the middle and the adult stood at it turning until
 *  rescued. Planted: towerRoute's dropTo without walledEnd (the route); walledEnd false (lay, verdict, route and the bot's open ends) */
async function n22() {
  if (readied !== DRAFT) readyDraft(DRAFT);
  const { generateAllLevels } = await import('../worldsData.ts');
  const { generateStage, setLayoutVariant } = await import('../stageGenerator.ts');
  setLayoutVariant(22);
  const st = generateStage({ ...generateAllLevels().find((c) => c.id === DRAFT && !c.secret)!, unlocked: true }, 'normal');
  setLayoutVariant(null);
  return st;
}

test("the way down off a walled catch goes off its OPEN end: Normal roll 22's catch under the vine at x 833 is left by its right end (GREEN; planted: dropTo without walledEnd)", async () => {
  const st = await n22();
  const { towerCorners } = await import('../../../tools/inspect/towerRoute.ts');
  const c = towerCorners(st as never, { x: st.spawnX, y: st.spawnY })!;
  const k = c.findIndex((q) => Math.abs(q.x - 833) <= 2 && Math.abs(q.y - 8384) <= 2);
  assert.ok(k >= 0, `the route comes down the vine onto the catch (833, 8384): ${JSON.stringify(c.filter((q) => q.y > 8200 && q.y < 8700))}`);
  const off = c.slice(k + 1).find((q) => q.y > 8384 + 2)!;
  assert.ok(off && off.x > 1004, `the route steps off the catch's open right end (x > 1004), not its walled left one: ${JSON.stringify(c.slice(k, k + 4))}`);
});

test("no rescue at the walled catch: the kid on Normal roll 22 passes the turn at x 833 (y 8311-8658) by himself (GREEN; planted: walledEnd false)", async () => {
  if (readied !== DRAFT) readyDraft(DRAFT);
  const { firstTimer } = await import('../../../tools/inspect/firsttimer.ts');
  const { CAST_BOTS } = await import('../../../tools/inspect/castBots.ts');
  const r = firstTimer(DRAFT, 22, CAST_BOTS.kid.normal!, { cap: 135 });
  const at = r.stuck.filter((s) => s.rescued && s.y >= 8311 && s.y <= 8658);
  assert.deepEqual(at.map((s) => `${s.x},${s.y} ${s.what}`), [], 'no rescue at the walled catch');
  assert.ok(!r.stuck.some((s) => s.y >= 8311 && s.y <= 8658 && s.t + s.dur >= 134), `not still standing at it when the cap ends (${JSON.stringify(r.stuck.slice(-2))})`);
});

/** (ENG-DARK box 16's change 89ef9a985, glowWait's second rim; its toy written box 18 as a SHAPE toy: the real run's child Normal 22
 *  unlit at piece 106 no longer comes on the final lay) piece 106's left end (699, 5658) on Normal roll 22 is two rims: its own (its
 *  landing's light) and the run off's (the light of the sleeping rim the run meets on 590-811, runOffRims). The child is put on 106 at
 *  0.5 s 63 px in, facing that end, its OWN rim's light woken by hand long ago and the met rim's asleep. He stops at the end until the
 *  met rim's light has been lit DARK_AHEAD, then goes. Planted: glowWait takes the FIRST rim there (its own, lit) and goes at once,
 *  the met rim's light asleep */
async function secondRim() {
  if (readied !== DRAFT) readyDraft(DRAFT);
  const { firstTimer, FT_CHILD } = await import('../../../tools/inspect/firsttimer.ts');
  const { darkRims, runOffRims, DARK_AHEAD } = await import('./dark.ts');
  let placed = false, metId = -1, left: { t: number; woke: number | undefined } | undefined;
  firstTimer(DRAFT, 22, { ...FT_CHILD, setting: 'normal' }, { cap: 8, onFrame(sim, b) {
    const wake = (sim.e as unknown as { glowWake: Map<number, number>; gameTime: number }).glowWake;
    if (placed) {
      if (!left && !sim.p.grounded && sim.p.x < 699) left = { t: sim.e.gameTime, woke: wake.get(metId) };
      return;
    }
    if (sim.e.gameTime <= 0.5) return;
    const st = sim.stage as never;
    const own = darkRims(st).find((q) => q.x === 699 && Math.round(q.y) === 5658 && q.dir === -1);
    const met = runOffRims(st, 'normal').find((q) => q.x === 699 && q.y === 5658 && q.dir === -1);
    assert.ok(own?.light?.id !== undefined && met?.light?.id !== undefined && own.light !== met.light, 'the end is two rims, two lights');
    metId = met.light.id;
    wake.set(own.light.id, -100);
    assert.ok(!wake.has(metId), "the met rim's light sleeps");
    (b as { placeAt(x: number, y: number): void }).placeAt(699 + 63, 5658);
    sim.p.facing = -1;
    placed = true;
  } });
  assert.ok(placed && left, 'he was put on piece 106 and went off its left end');
  return { left: left!, ahead: DARK_AHEAD.normal };
}

test("a dark stop at an end that is two rims waits for the rim not yet lit: Normal roll 22's piece 106, its own rim lit, the run's rim asleep: he goes only once that rim's light is lit DARK_AHEAD (GREEN; planted: glowWait takes the first rim)", async () => {
  const { left, ahead } = await secondRim();
  assert.ok(left.woke !== undefined && left.t >= left.woke + ahead, `he left the end at ${left.t.toFixed(2)} s, the met rim's light woke at ${left.woke}`);
});

/** roll 19's dip on the way down (ENG-DARK box 21): the child on Normal comes down the vine at x 99 onto 79-289 (y 8689) and walks
 *  right to a 97 px dip (289-386, 70 px deep); the route runs level across it; over its lip lies the catch of the storey's end above
 *  (284-464, y 8501, 188 px over his floor), the shape of every storey of the way down (622 such catches over the 80 rolls). Read as a
 *  step up (stepUp), the bough got a double: he stood his time, the standing double's second press came after the flick's hop had
 *  landed, he was steered back and went back up the vine, 8.7 s at the lip. The read at the lip (his first stand there), and the row to
 *  240 s (with the read fixed he reaches the lip later, about 195 s: the bot's draws run differently from the first read on) */
async function lip19(noLevelRead: boolean) {
  if (readied !== DRAFT) readyDraft(DRAFT);
  const { firstTimer } = await import('../../../tools/inspect/firsttimer.ts');
  const { CAST_BOTS } = await import('../../../tools/inspect/castBots.ts');
  const reads: string[] = [];
  const r = firstTimer(DRAFT, 19, { ...CAST_BOTS.child.normal!, noLevelRead }, { cap: 240, dotSetting: true, onFrame(sim, b) {
    const p = sim.p;
    if (reads.length || !p.grounded || Math.abs(p.y - 8689) > 2 || p.x < 230 || p.x > 289) return;
    const bot = b as unknown as { jumpFor(p: unknown, dir: number, here: unknown): string; floorAt(x: number, y: number, d: number): unknown };
    reads.push(bot.jumpFor(p, 1, bot.floorAt(p.x, p.y, 6)));
  } });
  const lip = r.stuck.filter((s) => Math.abs(s.y - 8689) < 4 && s.x > 200 && s.x < 400);
  return { read: reads[0], lip, end: r.end };
}

test("going down, a ledge over him is a step up only where the way rises: at Normal roll 19's dip, the way level across it, the child reads a single, and crosses without a stand at its lip (GREEN; planted: noLevelRead)", async () => {
  const { read, lip } = await lip19(false);
  assert.equal(read, 'single', 'the way on runs level across the dip: the bough over it is no step up');
  assert.deepEqual(lip.map((s) => s.what), [], 'no stuck line at the dip');
});

test("every ledge over him read as a step up (noLevelRead, the plant): at Normal roll 19's dip the child reads a double and stands at its lip (RED)", async () => {
  const { read, lip } = await lip19(true);
  assert.equal(read, 'double', 'the bough 188 px over his floor read as a step up');
  assert.ok(lip.some((s) => /in a dip 188 px deep/.test(s.what)), `stuck at the dip's lip (${JSON.stringify(lip.map((s) => s.what))})`);
});

/** the SHAPE of roll 19's dip, hand-built (ENG-DARK box 22, the lead's ruling: a toy each way, N 19's row and the shape alone). On the
 *  draft's own way down (gen2.tower.flow 'down'), his ground and the route are set aside for one read and the shape put in their place:
 *  a floor 0-289, a dip 289-386 70 px down (97 px wide), the floor on 386-700, and a bough 284-464 188 px over his floor, over the dip's
 *  lip; he stands 20 px from the lip facing it. With the route level across the dip the bough is no step up: a single; with the route
 *  rising 120 px within 300 px the same bough is one: a double (the read is of the way, not every ledge dropped). The plant
 *  (noLevelRead) reads every ledge over him as a step up: a double on the level way */
function shapeRead(noLevelRead: boolean, rise: number) {
  return (async () => {
    if (readied !== DRAFT) readyDraft(DRAFT);
    const { firstTimer } = await import('../../../tools/inspect/firsttimer.ts');
    const { CAST_BOTS } = await import('../../../tools/inspect/castBots.ts');
    let read: string | undefined, flow: string | undefined;
    firstTimer(DRAFT, 1, { ...CAST_BOTS.child.normal!, noLevelRead }, { cap: 2, dotSetting: true, onFrame(sim, b) {
      if (read !== undefined) return;
      flow = (sim.stage as { gen2?: { tower?: { flow?: string } } }).gen2?.tower?.flow;
      const Y = 1000, keep = sim.platforms.slice(), like = keep[0];
      const piece = (x: number, y: number, width: number) => ({ ...like, x, y, width, type: 'solid' as const, broken: false });
      const floor = piece(0, Y, 289);
      sim.platforms.length = 0;
      sim.platforms.push(floor, piece(289, Y + 70, 97), piece(386, Y, 314), piece(284, Y - 188, 180));
      const bot = b as unknown as { prog: { pts: Array<{ x: number; y: number }>; cur: number }; jumpFor(p: unknown, dir: number, here: unknown): string };
      const pts = bot.prog.pts.slice(), cur = bot.prog.cur;
      const way = [200, 269, 330, 363, 420, 500, 600].map((x) => ({ ...pts[0], x, y: x > 400 ? Y - rise : Y }));
      bot.prog.pts.splice(0, bot.prog.pts.length, ...way);
      bot.prog.cur = 1;
      try { read = bot.jumpFor({ x: 269, y: Y }, 1, floor); }
      finally {
        sim.platforms.length = 0; sim.platforms.push(...keep);
        bot.prog.pts.splice(0, bot.prog.pts.length, ...pts); bot.prog.cur = cur;
      }
    } });
    return { read, flow };
  })();
}

test("going down, a ledge over him is a step up only where the way rises: the SHAPE hand-built (a 97 px dip, a bough 188 px over its lip): the way level across it, a single; the way rising 120 px past it, a double (GREEN; planted: noLevelRead)", async () => {
  const level = await shapeRead(false, 0), rising = await shapeRead(false, 120);
  assert.equal(level.flow, 'down', 'the draft is laid going down');
  assert.equal(level.read, 'single', 'the way level across the dip: the bough over its lip is no step up');
  assert.equal(rising.read, 'double', 'the way rising past the dip: the same bough is a step up');
});

test("every ledge over him read as a step up (noLevelRead, the plant): the SHAPE hand-built, the way level across the dip, reads a double (RED)", async () => {
  const { read } = await shapeRead(true, 0);
  assert.equal(read, 'double', 'the bough 188 px over his floor read as a step up');
});

/** the lip (ENG-DARK box 22, 7 of the 9 unlit crossings of c15's x40): the child on Easy, roll 8, comes onto 251-515 (y 4375) toward its
 *  dark right rim; his stop starts at 102.67 s, his slide carries his middle past the end (to x 524) while the engine still stands him on
 *  the piece (standingOnId), and the stop read the piece's span alone: it dropped and he walked over the rim at 103.37 s, its landing
 *  dark. The stop is held while the engine stands him on the rim's piece. The run to 110 s: the frames of a stop held at that rim with
 *  his middle past its end, and the rim's crossings */
async function lip8(noLipHold: boolean) {
  if (readied !== DRAFT) readyDraft(DRAFT);
  const { firstTimer } = await import('../../../tools/inspect/firsttimer.ts');
  const { CAST_BOTS } = await import('../../../tools/inspect/castBots.ts');
  let past = 0;
  const r = firstTimer(DRAFT, 8, { ...CAST_BOTS.child.easy!, noLipHold }, { cap: 110, dotSetting: true, onFrame(sim, b) {
    const g = (b as unknown as { glowStop: { rim: { x: number; y: number } } | null }).glowStop;
    if (g && g.rim.x === 515 && Math.round(g.rim.y) === 4375 && sim.p.grounded && sim.p.x > 515) past++;
  } });
  return { past, unlit: (r.dark?.unlit ?? []).filter((u) => u.includes('the rim at x 515, y 4375')) };
}

test("a dark stop holds at the lip: his middle past the rim's end, the engine still standing him on its piece (child Easy roll 8, the rim at x 515, y 4375): he stands there until its landing is lit, and does not go over it dark (GREEN; planted: noLipHold)", async () => {
  const { past, unlit } = await lip8(false);
  assert.ok(past > 0, 'the stop was held with his middle past the end');
  assert.deepEqual(unlit, [], 'he did not go over that rim with its landing dark');
});

test("the stop read by the piece's span alone (noLipHold, the plant): at roll 8's lip he walks over the rim at x 515, y 4375 dark (RED)", async () => {
  const { unlit } = await lip8(true);
  assert.equal(unlit.length, 1, `he went over that rim dark (${JSON.stringify(unlit)})`);
});
