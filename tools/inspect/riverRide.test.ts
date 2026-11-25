// npx tsx --test tools/inspect/riverRide.test.ts   (CI: gates.yml, the engine tools' tests)
/**
 * The bot toy for the river (level.md rule 21, ENG-W2b 1g; before any level lays a river): a fixture stage rolled by gen2 the way the game
 * rolls a listed stage (listed.ts withTestStage, a planted one-seed list, the toy kit with World 2's river table, World 2's finish), with
 * ONE river section: a bank, a deep river (W2_RIVERS.deep, with him, a fall costs a life), the far bank. The middle and child bots, on
 * both settings, cross it on the logs and reach the shrine, at most RIDE_LIVES lives lost each. Planted: with the bot's ride skill
 * switched off (firsttimer.ts SKILLS.ride: he no longer boards a log only when a flown hop comes down on it, nor rides it to the next),
 * they drown in it over the bar (measured 11-15 on seed 1, with the one carry rule (RIDE.keep): lives AT THE RIVER on, 2/0/0/0 for middle
 * Normal/Easy, child Normal/Easy; off, 7/0/0/3).
 * BUILD-21 (2-1.md NEW 4): AGAINST THE FLOW (SKILLS.upstream) on a river flowing back at him (W2_RIVERS.back): every tier crosses the
 * toy. Its plant moved to 2-1 itself (FIX-GATES 11-15, the lead's ruling 5:32 PM ET): since FIX-21 9137470f (the look past the floor's
 * end) no toy river drowned a bot without it, but 2-1's deep Normal back river does (adult seed 12, 5 lives, rescued; ENG-285c re-stated
 * the child's case on the final judge model as lives: seeds 4 and 5, at least 5 more lost without it, measured 1 -> 9; ENG-26t 11-24: child seeds 4 and 23, middle seed 26).
 * UP THE FAR BANK (SKILLS.bankUp, FIX-GATES): off a log running back at him he hops up the far bank's 28 px face; without it the child on
 * Easy walked into the face, was carried off and splashed back until rescued (2-1 seeds 20, 23; ENG-285c re-stated it on the final judge
 * model, THIN, at its own bank: seed 22 (ENG-26t 11-24: now the child on Normal, seed 40, as lives: 1 -> 6 off, and the far bank +34 s), boarding to the both-ways far bank at least 2 s longer without it, measured +3.8 s; RETIRED 11-25 per R-165.432, no live case: the note above the clean crossings). HANDED TO THE BANK (SKILLS.handed) on the long log (W2_RIVERS.long, laid deep here): he rides a log running his
 * way in until it hands him onto the bank; planted on the middle bot on Normal (lives at the river 1 with it, 3 without, t-int-11 7b012852e).
 */
import '../../src/game/headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { withTestStage } from '../../src/game/gen2/listed.ts';
import { buildGen2Stage, keptFoes } from '../../src/game/gen2/pipeline.ts';
import { packPlan, plantSeedList } from '../../src/game/gen2/seedList.ts';
import { withFixtureConfig } from '../../src/game/realPlay.ts';
import { cfg as toyCfg, kit as toyKit, meadow } from '../../src/game/gen2/toyWorld.ts';
import { w2Finish, W2_RIVERS } from '../../src/game/gen2/worlds/w2.ts';
import type { SectionTemplate, WorldKit } from '../../src/game/gen2/types.ts';
import type { LevelConfig } from '../../src/game/types.ts';
import type { Platform } from '../../src/game/types.ts';
import { SKILLS, firstTimer, FirstTimerRun, FT_ADULT, FT_CHILD, FT_CHILD_EASY, FT_EXPERT, FT_MIDDLE, FT_MIDDLE_EASY, HOP_TRACE, type FirstTimer } from './firsttimer.ts';
import { CAST_BOTS, castRun } from './castBots.ts';
import { runTier, type Setting, type Tier, type TierRun } from './tierBots.ts';

const ID = '2-91';
/** the fixture's one river section, laying World 2's row `row` (the long log is laid DEEP here: a fall costs a life, so a hop at the water
 *  off its front end shows in the count) */
const riverOf = (row: string): SectionTemplate => ({
  id: 'toy-one-river', name: 'one river', archetypes: 'any', phases: ['ki', 'sho', 'ten', 'ketsu'], difficulty: 2, maxPerStage: 1,
  pieces: [
    { key: 'near', shape: 'bank', w: [340, 340], place: { kind: 'start' }, main: true },
    { key: 'far', shape: 'bank', w: [420, 420], place: { kind: 'river', after: 'near', row }, main: true, landing: true },
  ],
  entry: { piece: 'near', kind: 'ground' }, exit: { piece: 'far', kind: 'ground' }, exitDy: 0, sockets: [], mirrorable: false,
});
const river = riverOf('deep');
const kitOf = (row: string): WorldKit => ({
  ...toyKit,
  manifest: {
    ...toyKit.manifest, world: 2, rivers: W2_RIVERS, creatures: [], props: [], pairs: [], tips: {},
    sections: [{ ...meadow, phases: ['start', 'rest', 'ki', 'sho', 'ten', 'ketsu', 'goal'], mirrorable: false, sockets: meadow.sockets.filter((k) => k.role !== 'prop') }, riverOf(row)],
  },
});
const kit = kitOf('deep');
const cfg: LevelConfig = { ...toyCfg(ID, 'sprint'), unlocked: true };

/** the first seed whose roll lays exactly one log river and builds clean */
function fixtureSeed(k: WorldKit = kit): number {
  for (let seed = 1; seed <= 60; seed++) {
    const st = buildGen2Stage({ config: cfg, kit: k, seed, difficulty: 'normal' });
    if (!st.gen2.errors?.length && st.rivers?.filter((r) => r.speed > 0).length === 1) return seed;
  }
  throw new Error('no roll of 1-60 lays the one river clean');
}

/** a tier's run over the fixture, rolled the game's way (the listed row, the planted list, World 2's finish) */
function ride(tier: Tier, setting: Setting, seed: number, k: WorldKit = kit) {
  const st = buildGen2Stage({ config: cfg, kit: k, seed, difficulty: 'normal' });
  const dict: string[] = [];
  const packed = packPlan({ seed: st.gen2.seed, rerolls: st.gen2.rerolls, plan: st.gen2.plan, foes: [...keptFoes(st)] }, dict);
  return withTestStage({ [ID]: { kit: () => k, world: (s, _sq, d) => w2Finish(s as never, d) as typeof s, seeds: [] } }, () => {
    const undo = plantSeedList(ID, { dict, seeds: [seed], plans: [packed] });
    try {
      return withFixtureConfig(cfg, () => runTier(tier, setting, 1, ID));
    } finally {
      undo();
    }
  });
}

/** the most lives a tier may lose crossing the one river (the middle bot on Normal measured 2 with the skill, 5 without) */
const RIDE_LIVES = 2;
const SEED = fixtureSeed();
/** he crossed: reached the shrine, and in the river's own section lost at most RIDE_LIVES lives and was never stuck (the run's other
 *  pieces are the fixture's meadows: a stuck spot there is the meadow's, named in the message, never the river's) */
const atRiver = (r: TierRun) => r.pieces.find((q) => q.id === river.id);
const crossed = (r: TierRun) => r.end === 'shrine' && !!atRiver(r) && atRiver(r)!.lives <= RIDE_LIVES && !r.stuck.some((k) => k.piece === river.id);
const told = (r: TierRun) => `ended ${r.end}, at the river ${JSON.stringify(atRiver(r))} (at most ${RIDE_LIVES} lives), stuck ${JSON.stringify(r.stuck)}`;
const RUNS: Array<[Tier, Setting]> = [['middle', 'normal'], ['middle', 'easy'], ['child', 'normal'], ['child', 'easy']];

test('the fixture: one deep log river, rolled clean', () => {
  const st = buildGen2Stage({ config: cfg, kit, seed: SEED, difficulty: 'normal' });
  const rivers = st.rivers!.filter((r) => r.speed > 0);
  assert.equal(rivers.length, 1);
  assert.equal(rivers[0].safe, undefined, 'deep: a fall costs a life');
  assert.ok(st.platforms.filter((p) => p.drift?.x0 === rivers[0].x0).length >= 3);
});

for (const [tier, setting] of RUNS) {
  test(`${tier}, ${setting}: rides the logs across the river and reaches the shrine`, () => {
    const r = ride(tier, setting, SEED);
    assert.ok(crossed(r), `${tier} ${setting}: ${told(r)}`);
  });
}

// (ENG-PLANT-c 11-24, the lead's ruling (ENG-PLANT session 1): since the judged hops off a log (SKILLS.floatSure) no tier drowns over
//  the bar on the first one-river roll with the ride skill off, so the plant moved to the fixture's roll 4, measured on the fixed bot
//  (a64f02ce5, toyfind deep ride 4): on, every tier 0 lives at the river; off, middle Normal 2, middle Easy 3, child Normal 3, child
//  Easy 1: two tiers over RIDE_LIVES. The bar is unchanged (law 22): at least one tier over it off, every tier within it on)
const PLANT_SEED = 4;
test('the ride plant\'s roll: one deep log river, rolled clean', () => {
  const st = buildGen2Stage({ config: cfg, kit, seed: PLANT_SEED, difficulty: 'normal' });
  const rivers = st.rivers!.filter((r) => r.speed > 0);
  assert.equal(rivers.length, 1);
  assert.ok(!st.gen2.errors?.length, JSON.stringify(st.gen2.errors));
  assert.equal(rivers[0].safe, undefined, 'deep: a fall costs a life');
});
test('planted: with the ride skill off, the middle and child bots drown in the river', () => {
  for (const [tier, setting] of RUNS) {
    const r = ride(tier, setting, PLANT_SEED);
    assert.ok(crossed(r), `ride on, roll ${PLANT_SEED}: ${tier} ${setting}: ${told(r)}`);
  }
  SKILLS.ride = false;
  const off: string[] = [];
  let failed = 0;
  try {
    for (const [tier, setting] of RUNS) {
      const r = ride(tier, setting, PLANT_SEED);
      off.push(`${tier} ${setting}: ${told(r)}`);
      if (!crossed(r)) failed++;
    }
    assert.ok(failed >= 1, `with no ride skill every tier still crossed within ${RIDE_LIVES} lives: ${off.join('; ')}`);
  } finally {
    SKILLS.ride = true;
  }
});

// ───────────────────────── BUILD-21: against the flow, handed to the bank ─────────────────────────
const BACK = kitOf('back'), LONG = kitOf('long');
const SEED_BACK = fixtureSeed(BACK), SEED_LONG = fixtureSeed(LONG);
/** at most this many lives at the river, the bar each skill is held to (measured with it: back 0/1/0/0, long 1/1/0/0) */
const SKILL_LIVES = 1;
const livesAt = (r: TierRun) => atRiver(r)?.lives ?? Infinity;

for (const [tier, setting] of RUNS) {
  test(`${tier}, ${setting}: against the flow (W2_RIVERS.back), hops log to log off each front end and reaches the shrine`, () => {
    const r = ride(tier, setting, SEED_BACK, BACK);
    assert.ok(r.end === 'shrine' && livesAt(r) <= SKILL_LIVES, `${tier} ${setting}: ${told(r)}`);
  });
  test(`${tier}, ${setting}: the long log (W2_RIVERS.long, laid deep) rides him in and hands him onto the far bank`, () => {
    const r = ride(tier, setting, SEED_LONG, LONG);
    assert.ok(r.end === 'shrine' && livesAt(r) <= SKILL_LIVES && r.handed >= 1, `${tier} ${setting}: handed ${r.handed}, ${told(r)}`);
  });
}

// (FIX-GATES 11-15, the lead's ruling 5:43 PM ET: the skill's job since FIX-21 ec96fe0c2, whose engine handover hands a rider who WALKS
//  into the bank as well as one the log carries: without the skill the child walks in and is handed, rightly, so the old claim 'off, never
//  handed' is gone; what the skill still stops is the middle bot on Normal hopping at the water off the long log's front end: measured on
//  t-int-11 7b012852e, lives at the river 1 with it, 3 without)
// (ENG-PLANT-c 11-24, the lead's ruling (ENG-PLANT session 1): since the judged hops off a log the middle on Normal crosses the long
//  log's first roll within the bar without the skill, so the plant moved to the child on Normal on the long kit's roll 12, measured on
//  the fixed bot (a64f02ce5, toyfind long handed 12): on 0 lives at the river and handed 1, off 4 lives. The bar is unchanged (law 22))
const HANDED_SEED = 12;
test('planted: with the handed-to-the-bank skill off, the child on Normal hops at the water off the long log and drowns over the bar', () => {
  const on = ride('child', 'normal', HANDED_SEED, LONG);
  assert.ok(on.end === 'shrine' && livesAt(on) <= SKILL_LIVES && on.handed >= 1, `handed on, roll ${HANDED_SEED}: handed ${on.handed}, ${told(on)}`);
  SKILLS.handed = false;
  try {
    const r = ride('child', 'normal', HANDED_SEED, LONG);
    assert.ok(livesAt(r) > SKILL_LIVES, `handed off, the child on Normal still crossed within ${SKILL_LIVES}: handed ${r.handed}, ${told(r)}`);
  } finally {
    SKILLS.handed = true;
  }
});

// ───────────────────────── FIX-GATES: against the flow and up the far bank, on 2-1's own rivers ─────────────────────────
// (the lead's ruling 11-15 5:32 PM ET: planted on the live cases, the stage as the game builds it (castBots castRun: the cast bot, its
//  seed, both rolls the game plays). Measured on t-int-11 7b012852e and this head: every case below passes with its skill on)
const crossedClean = (r: ReturnType<typeof castRun>) => r.end === 'shrine' && r.rescues === 0;
const said = (r: ReturnType<typeof castRun>) => `${r.bot} ${r.setting} seed ${r.seed}: ${r.end}, rescues ${r.rescues}, lives ${r.lives}, stuck ${JSON.stringify(r.stuck)}`;
// (ENG-285c 11-19, the lead's ruling 1: on the final judge model (ENG-285b ba6b225b, code e236233c) the child on Normal, seed 23, is no
//  longer rescued with the skill off (shrine, 0 rescues, 0 -> 9 lives), so 'rescued' holds for the adult on Normal, seed 12, alone; the
//  child's case is re-stated as LIVES on seeds 4 and 5: with the skill on and off his runs are the same frame for frame up to 2-1's
//  both-ways back river (seed 4: t 284 s, x 25,7xx; seed 5 parts 1 s at the first back river's far bank), and off he loses 8 more lives
//  each, at that river (1 -> 9, x 24,4xx-25,9xx))
// (ENG-26t 11-24, the lead's ruling: since BUILD-26j's step-up rule (d6350d3e7) the child on Normal, seed 5, crosses without the skill
//  (1 -> 1 life), so it left the plant; the search of 2-1 (every cast bot, both settings, seeds 1-40, skill on and off,
//  BUILD-26/b26t/skilljudge-23cdb07e8.txt) found 12 live cases. Measured on 997f7e98c: child N 4 1 -> 9, child N 23 0 -> 8, middle N 26
//  0 -> 8 (a second tier); adult N 12 0 -> 5 and rescued)
// (ENG-PLANT-t 11-25, R-165.432 re-plant at the SAME bar: on 36e8efe6f the adult on Normal, seed 12, crosses clean without the skill (1 -> 1
//  life, 0 rescues) and child N 4 and 23 lose 1 more, middle N 26 3 more. The search of 2-1 (every cast bot, both settings, seeds 1-40,
//  skill on and off, castRun as here: reference/qa-reports/ENG-PLANT/data/t/search1.txt, search2.txt) found the live cases: RESCUED off
//  while clean on: adult N 16 (4 -> 4 lives, 0 -> 1 rescue), kid N 2, 23, 38, child E 11, 15; 5+ MORE LIVES: child N 11 (0 -> 7),
//  child N 15 (0 -> 14), middle N 16 (0 -> 6) (and child N 9, 28, 40, +5; middle N 15, +5))
const UPSTREAM_CASES: Array<[string, 'normal' | 'easy', number]> = [['adult', 'normal', 16]];
const UPSTREAM_LIVES: Array<[string, 'normal' | 'easy', number]> = [['child', 'normal', 11], ['child', 'normal', 15], ['middle', 'normal', 16]];
/** with the against-the-flow skill off, at least this many more lives than with it (measured +8 on each of UPSTREAM_LIVES on 11-24; +7, +14, +6 on the re-planted rows 11-25) */
const UPSTREAM_MORE = 5;
// (ENG-285c, the lead's ruling 2 (A): on the final judge model the child on Easy, seeds 20 and 23, crosses clean without the skill, and
//  bankUp moves no life and no rescue anywhere (2-1 every cast bot both settings 1-40; 2-2 lays no river running back at him; the toy
//  back river the same lives every tier): off a log running back at him, the against-the-flow front-end hop (SKILLS.upstream) takes him
//  up the same bank within a frame or two on most crossings. Its one measured effect is at its own bank: the child on Easy, seed 22, at
//  2-1's both-ways back river is carried back on the log and stands on the far bank 3.8 s later without it (4.73 -> 8.56 s from
//  boarding); the other crossings measured move under 0.4 s (seeds 4, 20, 23). THIN: a time plant at the skill's bank, not lives)
// (ENG-26t 11-24, the lead's ruling: since BUILD-26j's step-up rule the child on Easy, seed 22, reaches that bank as soon without the
//  skill (4.93 s on and off), so the THIN time plant left; the search found 11 live cases on the base, and on 997f7e98c (its overSmall
//  strip) one holds: the child on Normal, seed 40, off loses 5 more lives (1 -> 6) and reaches the both-ways far bank 34 s later
//  (6.23 -> 40.23 s). A LIVES plant now, the time kept as a second check)
// ((RETIRED 11-25, R-165.432 (the lead's ruling: a plant with no live case anywhere is retired with the search as evidence; the skill's
//  code stays; re-plant when a stage needs it; R-165.424 reviews whether it is still needed), ENG-PLANT-u: the up-the-far-bank plant
//  (SKILLS.bankUp: off, 5+ more lives and the both-ways far bank 2+ s later) has no live case. Searched on 36e8efe6f, every cast bot, both
//  settings, bankUp on and off: 2-1 seeds 1-40 (the most it moves: child N 39 2 -> 4 lives, kid N 37 5 -> 7; child N 40 1 -> 1); 2-7 seeds
//  1-40 (one row at the lives bar, kid N 17 5 -> 12, traced (rule 28): every extra life is on the way home, on a river running his way,
//  where bankUp never fires (a log running back at him), and the 3 rescues are at near banks; its one bankUp hop, x 13,461, leaves his path
//  within 0.5 px for 2 s); 2-8 and 2-9, the only other stages that lay one (seeds 9, 14, 16, 18, 19, 22, 24, 26; neither listed: every run
//  there ends at a sealed door): 4 and 7 of 72 rows move, none by more than +2 lives off and none rescued off while clean on. No other
//  World 2 stage lays a river running back at him (seeds 1-40). The time half: 2-7 lays no both-ways river. Search:
//  reference/qa-reports/ENG-PLANT/data/t/search1.txt, search2.txt, search27.txt and data/u/. The child on Normal, seed 40, stays below as a
//  clean crossing with both skills on)
const KEPT_CLEAN: Array<[string, 'normal' | 'easy', number]> = [['child', 'normal', 40]];

test('2-1, against the flow and up the far bank on: the adult on Normal (16), the child on Normal (11, 15, 40) and the middle on Normal (16) cross clean', () => {
  for (const [bot, setting, seed] of [...UPSTREAM_CASES, ...UPSTREAM_LIVES, ...KEPT_CLEAN]) {
    const r = castRun(bot, setting, '2-1', seed);
    assert.ok(crossedClean(r), said(r));
  }
});
// (ENG-PLANT-c 11-24, the lead's packet: a refused hop leaves a WAY ON. Under SKILLS.floatSure the hop up the far bank's face off a log
//  running back at him is pressed only when the gate lands it; refused with nothing else to do, the child stood while the log carried him
//  back, boarded again, stood again, and the stuck rule rescued him: 2-1 child Normal seed 1, x 19,890, 6 s then 5 s, rescued at x 19,576
//  (candidate 2, ea573b4e4: RED). Now the hop of his own table that the gate lands is pressed (FirstTimerRun.tablePick): GREEN. The blind
//  press's toy is the test above (the adult on Normal, seed 12: RED on the release head dfe631913, GREEN with the judged hops))
test('2-1, a refused hop leaves a way on: the child on Normal (1) is never stood at the far bank until a rescue', () => {
  const r = castRun('child', 'normal', '2-1', 1);
  assert.ok(crossedClean(r), said(r));
});
// (ENG-PLANT-d, the lead's invariant: a bot that refuses a hop never stands on a carrier until it is carried into a rescue. 2-4 adult
//  Normal 30, traced on candidate 3b 06b5316be: three times he boards a log running his way (x 10,361), vineFromLog refuses the liana
//  (its catch judged at three thumb lags; his own aim, the middle lag alone, catches once in the three rides, 0.2 s before the drop),
//  SKILLS.handed holds him standing on it, and the log carries him under at its river end (x 10,767) 430 px short of the bank: set
//  down 3 times there, rescued. Main has the same stand (two drops, 10,774 and 10,768) and passes by the luck of the vine's swing)
test('2-4, a bot that refuses a hop is never ridden into a rescue: the adult on Normal (30) is never carried under on a log he stands on', () => {
  const r = castRun('adult', 'normal', '2-4', 30);
  assert.ok(crossedClean(r), said(r));
});
// (ENG-PLANT-e, the lead's ruling 1: every hop off a carrier goes through the landing judge. 2-4 adult Normal 6 on candidate 4 6b5f43da0:
//  the step-back lands him on #45's very tip; floorAt read no floor at his x, the river block was skipped and the edge code pressed an
//  unjudged hop back onto #46, a log going under before the bank (t 51.53, no HOP_TRACE row): set down 3 times, rescued twice)
test('2-4, every hop off a log is judged: the adult on Normal (6) is never sent back onto a log going under', () => {
  const r = castRun('adult', 'normal', '2-4', 6);
  assert.ok(crossedClean(r), said(r));
});
// (ENG-PLANT-e, the lead's ruling 2: 2-1 child Normal 11 on candidate 4: a judged single lands him 40 px from the front of #137, a log
//  running his way; the landing walk-on and his thumb's let-go ran him off its front 4+ times, rescued. Main walks onto its back and stops)
test('2-1, he never runs off the front of the log he just landed on: the child on Normal (11) stops on it', () => {
  const r = castRun('child', 'normal', '2-1', 11);
  assert.ok(crossedClean(r), said(r));
});
test('planted: with the against-the-flow skill off, the adult on Normal is rescued on 2-1 (16) and the child and the middle on Normal lose 5+ more lives (child 11, 15; middle 16)', () => {
  const withIt = UPSTREAM_LIVES.map(([bot, setting, seed]) => castRun(bot, setting, '2-1', seed));
  SKILLS.upstream = false;
  try {
    for (const [bot, setting, seed] of UPSTREAM_CASES) {
      const r = castRun(bot, setting, '2-1', seed);
      assert.ok(!crossedClean(r), `upstream off, still clean: ${said(r)}`);
    }
    UPSTREAM_LIVES.forEach(([bot, setting, seed], i) => {
      const r = castRun(bot, setting, '2-1', seed);
      assert.ok(r.lives - withIt[i].lives >= UPSTREAM_MORE, `upstream off, ${r.lives - withIt[i].lives} more lives (at least ${UPSTREAM_MORE}): on ${said(withIt[i])}; off ${said(r)}`);
    });
  } finally {
    SKILLS.upstream = true;
  }
});
/** (ENG-BOT27, ENG-BOT27b) a bare river of 150 px logs 80 px apart flowing AT him, 6 phases; the first hop drawn while he stands on a
 *  log is planted as a 0.033 s tap the upstream gate refuses (every later draw is his own). Per phase: how his first log ended, 'hop'
 *  (off it, upward) or 'back' (ridden back to the bank), and the frame. SKILLS.reAim set to `on` for the flight */
const w = 150, gap = 80, speed = 75, x0 = 1000, x1 = 2840, T = (x1 - x0 + w) / speed, n = Math.round((x1 - x0 + w) / (w + gap));
const pieces = (phase: number): Platform[] => [
  { id: 1, x: 0, y: 600, width: x0, height: 90, type: 'solid' } as Platform,
  { id: 2, x: x1, y: 600, width: 1200, height: 90, type: 'solid' } as Platform,
  ...Array.from({ length: n }, (_, k) => ({ id: 10 + k, x: 0, y: 628, width: w, height: 24, type: 'drift', drift: { x0, x1, dir: -1, speed, width: w, baseY: 628, offset: ((k * (w + gap)) / speed + phase) % T } }) as unknown as Platform),
];
const plantedRide = (who: FirstTimer, on: boolean, phases: readonly number[] = [0, 0.5, 1, 1.5, 2, 2.5]): string[] => {
  const was = SKILLS.reAim;
  SKILLS.reAim = on;
  const out: string[] = [];
  try {
    for (const phase of phases) {
      const line = Array.from({ length: 200 }, (_, i) => ({ x: 100 + i * 24, y: 600 }));
      let log: number | null = null, onLog = false, f = 0, fEnd = -1, stubbed = false, prev: { g: boolean; id: number | null } = { g: false, id: null }, end = '';
      const run = new FirstTimerRun('1-1', 1, who, { route: line, cap: 20, rescueAfter: 1000, onFrame: (sim) => {
        const e = (sim as unknown as { e: { player: { vy: number; grounded: boolean }; platforms: Platform[]; standingOnId: number | null } }).e;
        f++;
        const here = e.platforms.find((q) => q.id === e.standingOnId);
        onLog = !!here?.drift && e.player.grounded;
        if (onLog && log === null) log = here!.id;
        if (log !== null && !end) {
          if (prev.g && prev.id === log && !e.player.grounded && e.player.vy < 0) end = 'hop';
          else if (e.player.grounded && here?.id === 1) end = 'back';
          if (end) fEnd = f;
        }
        prev = { g: e.player.grounded, id: here?.id ?? null };
      } });
      const own = run as unknown as { drawHop: (d: -1 | 1) => { kind: string; hold: number; d2: number } };
      const real = own.drawHop.bind(run);
      own.drawHop = (d) => { const h = real(d); if (!stubbed && onLog) { stubbed = true; return { ...h, kind: 'single', hold: 0.033, d2: -1 }; } return h; };
      run.sim.bare(pieces(phase));
      (run.sim as unknown as { e: { currentStage: { config: { levelHeight: number } } } }).e.currentStage.config.levelHeight = 720;
      run.sim.stand(700, 600);
      run.prog.relocate(run.sim.p);
      run.play();
      out.push(stubbed ? `${end || 'none'}@${fEnd}` : 'unplanted');
    }
  } finally {
    SKILLS.reAim = was;
  }
  return out;
};

/** the phases of the bare at-him river (gap 80) that test the re-aim (ENG-PLANT-CI session 11, by phase): the gate's `next` reads a log in
 *  reach with a real margin, and reAim splits them (on = hop, off = back). 0.25-0.75, 1.25 and 2.25 ride back either way (`next` false
 *  at the press, margin 21-23 under the gate's 24); 1.75, 2 and 3 hop either way; 2.75 splits but its press margin is 26 (kept out) */
const REAIM_PHASES = [0, 1, 1.5, 2.5] as const;
const DT_S = 1 / 30;

test('in the real engine: on a log flowing AT him, a held hop the upstream gate refuses is aimed again after his reaction, never held for the whole ride back (SKILLS.reAim; RED with it off)', () => {
  // (ENG-BOT27, 2-7's 'water ahead' stall, traced on the draft (with ENG-JETTY's band hunk), child Normal seeds 6 x 9412 and 8 x 8702: at
  //  an at-him log's front end the wait's drawn aim was a 0.033 s tap the gate never saw reach the next log 80 px off; the gap never
  //  changes on a river (one speed), so he held it, rode back to the bank and boarded again until rescued. Planted: the first hop drawn
  //  while he stands on a log is that tap; every later draw is his own. A bare river of 150 px logs 80 px apart flowing at him, 6 phases)
  //  Re-planted BY PHASE at gap 80 (the lead's ruling, ENG-PLANT-CI session 11; a gap change scrambles the phases): the kept phases are
  //  REAIM_PHASES, where the upstream gate's `next` reads a log in reach with a real margin (at the press 63 / 54 / 49 / 45 px, never under
  //  27 on a frame it reads one; the gate's own is 24) and the skill splits them, on = hop, off = back (s11/margins-gap80-ci14.txt)
  const first = (on: boolean) => plantedRide(FT_CHILD, on, REAIM_PHASES).map((r) => r.split('@')[0]);
  const on = first(true), off = first(false);
  assert.ok(on.every((s) => s === 'hop'), `with the skill: he aims again and hops off the first log every phase (${on.join(' ')})`);
  assert.ok(off.every((s) => s === 'back'), `RED: with SKILLS.reAim off he holds the tap and rides back to the bank (${off.join(' ')})`);
});

test('SKILLS.reAim keeps the honest aim (D121, the lead\'s two conditions): on a log a re-draw never comes inside his stopReact, and the press is decided on the aimed hop alone, never its drawn thumb noise', () => {
  // (the bare at-him river of the toy above, the first on-log draw planted as the 0.033 s tap; every draw made while he stands on a log
  //  is timed; a run is flown twice, the on-log draws as drawn and again with a LOUD thumb (a slip of 30 frames on every frame he steers,
  //  no drift, no late lift-off; a slip on frame 0 alone never fired on the kept phases, whose hop starts up-only: ENG-PLANT-CI session 11): the first upstream press (its frame and x, HOP_TRACE) must be the same, the noise only flown
  //  after it. Planted: a gate that flies the drawn thumb (gateAirtime keeping h.thumb) refuses the loud hop and presses later, RED)
  const loud = (th: { drift: number[]; slip: number[]; release: number[] } | undefined) => ({
    drift: (th?.drift ?? Array(60).fill(0)).map(() => 0), slip: (th?.slip ?? Array(60).fill(-1)).map(() => 30), release: (th?.release ?? Array(60).fill(0)).map(() => 0),
  });
  const fly = (phase: number, quiet: boolean) => {
    HOP_TRACE.on = true;
    HOP_TRACE.rows.length = 0;
    const line = Array.from({ length: 200 }, (_, i) => ({ x: 100 + i * 24, y: 600 }));
    let onLog = false, log: number | null = null, stubbed = false, t = 0, prevG = false, prevLog = false;
    const draws: Array<{ t: number; log: number | null }> = [], offs: number[] = [], logOffs: number[] = [];
    try {
      const run = new FirstTimerRun('1-1', 1, FT_CHILD, { route: line, cap: 20, rescueAfter: 1000, onFrame: (sim) => {
        const e = (sim as unknown as { e: { player: { vy: number; grounded: boolean }; platforms: Platform[]; standingOnId: number | null } }).e;
        const here = e.platforms.find((q) => q.id === e.standingOnId);
        t = sim.t;
        onLog = !!here?.drift && e.player.grounded;
        log = onLog ? here!.id : null;
        if (prevG && !e.player.grounded && e.player.vy < 0) offs.push(t);
        if (prevLog && !e.player.grounded && e.player.vy < 0) logOffs.push(t);
        prevG = e.player.grounded;
        prevLog = onLog;
      } });
      const own = run as unknown as { drawHop: (d: -1 | 1) => { kind: string; hold: number; d2: number; thumb?: { drift: number[]; slip: number[]; release: number[] } } };
      const real = own.drawHop.bind(run);
      own.drawHop = (d) => {
        const h = real(d);
        if (!onLog) return h;
        draws.push({ t, log });
        const g = stubbed ? h : { ...h, kind: 'single', hold: 0.033, d2: -1 };
        stubbed = true;
        return quiet ? { ...g, thumb: loud(g.thumb) } : g;
      };
      run.sim.bare(pieces(phase));
      (run.sim as unknown as { e: { currentStage: { config: { levelHeight: number } } } }).e.currentStage.config.levelHeight = 720;
      run.sim.stand(700, 600);
      run.prog.relocate(run.sim.p);
      run.play();
      const up = HOP_TRACE.rows.find((r) => r.site === 'upstream');
      let gapMin = Infinity;
      for (let i = 1; i < draws.length; i++) if (draws[i].log === draws[i - 1].log && !offs.some((o) => o > draws[i - 1].t && o <= draws[i].t)) gapMin = Math.min(gapMin, draws[i].t - draws[i - 1].t);
      return { up: up ? `${up.t.toFixed(3)}@${up.x.toFixed(1)}` : 'none', upT: up ? up.t : NaN, logOff: logOffs.length ? logOffs[0] : NaN, gapMin, redraws: draws.length };
    } finally {
      HOP_TRACE.on = false;
      HOP_TRACE.rows.length = 0;
    }
  };
  //  (by phase, as the toy above: on REAIM_PHASES the first upstream press IS his first hop off a log, so the t@x compare is the press's own
  //   decision, never an earlier on-log hop's noise flown after its press; phase 0.5 had padPause's hop first, ENG-PLANT-CI session 7 (b))
  for (const phase of REAIM_PHASES) {
    const noisy = fly(phase, false), quiet = fly(phase, true);
    assert.ok(noisy.logOff > noisy.upT && noisy.logOff - noisy.upT < 3 * DT_S + 1e-6, `phase ${phase}: the first upstream press (${noisy.up}) is not his first hop off a log (${noisy.logOff.toFixed(3)})`);
    assert.ok(noisy.redraws >= 2, `phase ${phase}: the planted tap was aimed again (${noisy.redraws} on-log draws)`);
    assert.ok(noisy.gapMin >= FT_CHILD.stopReact - 1e-6, `phase ${phase}: a re-draw on a log came inside stopReact ${FT_CHILD.stopReact} s (${noisy.gapMin.toFixed(3)} s)`);
    assert.notEqual(noisy.up, 'none', `phase ${phase}: an upstream press was judged`);
    assert.equal(quiet.up, noisy.up, `phase ${phase}: the press was decided on the drawn noise (as drawn ${noisy.up}, loud ${quiet.up})`);
  }
});

test('SKILLS.reAim is the CHILD bot\'s alone (ENG-BOT27b, the lead\'s ruling 11-23): with it on, every other cast bot holds the refused aim exactly as with it off, frame for frame (RED if the switch leaks past FirstTimer.reAim)', () => {
  // (on every bot, reAim moved pacerLay's careful middle (SKILLS.race beat the boat, normal seed 2, one re-aim at t 84.63); the race is
  //  calibrated on the middle, so its play changes only by its own ruling, R-165.413. Planted: the gate reading SKILLS.reAim alone (no
  //  who.reAim): RED, 'middle normal: the switch moved a bot that is not the child' (seen). With the leak the kid and adult still flew
  //  this river identically (seen; not traced), so the real proof for every bot is its x40 rows against base (rule 28))
  assert.ok(FT_CHILD.reAim && FT_CHILD_EASY.reAim, 'the child plays it on both settings');
  for (const [bot, bySetting] of Object.entries(CAST_BOTS)) {
    for (const [setting, who] of Object.entries(bySetting)) {
      if (!who) continue;
      if (bot === 'child') { assert.equal(who.reAim, true, `child ${setting} has the skill`); continue; }
      assert.ok(!who.reAim, `${bot} ${setting} has no reAim`);
      assert.deepEqual(plantedRide(who, true), plantedRide(who, false), `${bot} ${setting}: the switch moved a bot that is not the child`);
    }
  }
});

// ENG-PLANT (the lead's ruling on 2-7's B+C, rule 28): a bot is never ridden into a rescue and never repeats an identical round. Read by
// what he meets, never where: a hand-back is a stand on a floor (not a log), then logs only, then a stand on that same floor again; a
// floor handed back to twice is the loop (c25: middle Easy 11 rode log #19 back to bank #16 three times, rescued; expert Normal 29 rode
// #37 back to #33 five times, rescued: ENG-PLANT REPORT sessions 12-13). RED on c25 6a64aa41e,
// GREEN on c26 (the front stand, firsttimer.ts FRONT_STAND_PX).
function handBackRounds(seed: number, who: FirstTimer, cap: number): { handBacks: number; worst: number; rescues: number } {
  const back = new Map<number, number>();
  let floor: number | null = null, rode = false, handBacks = 0;
  const r = firstTimer('2-7', seed, who, { cap, dotSetting: true, onFrame: (sim) => {
    const e = (sim as unknown as { e: { player: { grounded: boolean }; platforms: Platform[]; standingOnId: number | null } }).e;
    if (!e.player.grounded) return;
    const here = e.platforms.find((q) => q.id === e.standingOnId);
    if (!here) return;
    if (here.type === 'drift') { if (floor !== null) rode = true; return; }
    if (rode && here.id === floor) { handBacks++; back.set(here.id, (back.get(here.id) ?? 0) + 1); }
    floor = here.id; rode = false;
  } });
  return { handBacks, worst: Math.max(0, ...back.values()), rescues: (r as { rescues?: number }).rescues ?? 0 };
}

for (const [name, seed, who] of [['middle Easy 11', 11, FT_MIDDLE_EASY], ['expert Normal 29', 29, FT_EXPERT]] as const) {
  test(`2-7 ${name}: no floor is handed back to twice by a log, and no rescue (the hand-back loop, B+C)`, () => {
    const got = handBackRounds(seed, who, 120);
    assert.ok(got.worst <= 1, `a floor handed back to ${got.worst} times (${got.handBacks} hand-backs)`);
    assert.equal(got.rescues, 0, `rescues ${got.rescues}`);
  });
}

// (ENG-PLANT-CI-c, rule 28: the race's front stand on a log running HIS way (CI-3/CI-4). Traced on CI-4 4da085f92 with this toy: the
//  adult let go of the walk 23 px from #10's front at 260 px/s (the walk is judged once a frame) and his thumb's late lift-off re-armed
//  every frame (no stopMeant: thumbify, R-165.59), 3 frames held, so he ran 5 px past the front; floorAt(p.x) then read nothing and the
//  edge's blind press fired into the water (set back to the bank): phases 0, 2, 3; 0.5/1.5/3.5 hopped from 3-13 px past it. RED on CI-4.)
test('on the race leg, a log running his way: every tier walks to its front and stands there, never off it, never into the water (the front stand)', () => {
  const w = 240, gap = 150, speed = 80, x0 = 1000, x1 = 3600, T = (x1 - x0 + w) / speed, n = Math.round((x1 - x0 + w) / (w + gap));
  const bad: string[] = [];
  for (const [name, who] of [['middle', FT_MIDDLE], ['adult', FT_ADULT], ['child', FT_CHILD], ['expert', FT_EXPERT]] as const) for (const ph of [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5]) {
    let A: number | null = null, lives = -1, water = false, past = 1e9;
    const line = Array.from({ length: 260 }, (_, i) => ({ x: 100 + i * 24, y: 600 }));
    const run = new FirstTimerRun('1-1', 1, who, { route: line, cap: 25, rescueAfter: 1000, onFrame: (sim) => {
      const e = sim.e as unknown as { lives: number; standingOnId: number | null; player: { x: number; grounded: boolean }; platforms: Array<{ id: number; x: number; width: number; drift?: unknown }> };
      if (lives < 0) lives = e.lives;
      if (e.lives < lives) water = true;
      const here = e.platforms.find((q) => q.id === e.standingOnId);
      if (A === null && e.player.grounded && here?.drift) A = here.id;
      if (A !== null && e.player.grounded && here?.id === A) past = Math.min(past, here.x + here.width - e.player.x);
    } });
    run.sim.bare([
      { id: 1, x: 0, y: 600, width: x0, height: 90, type: 'solid' },
      { id: 2, x: x1, y: 600, width: 1200, height: 90, type: 'solid' },
      ...Array.from({ length: n }, (_, k) => ({ id: 10 + k, x: 0, y: 628, width: w, height: 24, type: 'drift', drift: { x0, x1, dir: 1, speed, width: w, baseY: 628, offset: ((k * (w + gap)) / speed + ph) % T } })),
    ] as never);
    (run.sim.e as unknown as { currentStage: { config: { levelHeight: number } } }).currentStage.config.levelHeight = 720;
    (run.sim.stage as unknown as { pacer: unknown }).pacer = { x0: 0, x1: 99999, lane: 628, dir: 1, yMin: 0, seconds: 999, middle: 100, rideOnly: 200, under: 0, art: [] };
    run.sim.stand(700, 600);
    run.prog.relocate(run.sim.p);
    run.play();
    if (water || past < 0) bad.push(`${name} ${ph}: ${water ? 'into the water' : `${Math.round(-past)} px past the front`}`);
  }
  assert.deepEqual(bad, [], `every tier stands behind the front of the log he rides on the race leg (${bad.join('; ')})`);
});
