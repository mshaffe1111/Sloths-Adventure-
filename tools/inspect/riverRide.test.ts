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
 * end) no toy river drowned a bot without it, but 2-1's deep Normal back river does (adult seed 12, child seed 23, 5 lives, rescued).
 * UP THE FAR BANK (SKILLS.bankUp, FIX-GATES): off a log running back at him he hops up the far bank's 28 px face; without it the child on
 * Easy walked into the face, was carried off and splashed back until rescued (2-1 seeds 20, 23). HANDED TO THE BANK (SKILLS.handed) on the long log (W2_RIVERS.long, laid deep here): he rides a log running his
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
import { SKILLS } from './firsttimer.ts';
import { castRun } from './castBots.ts';
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

test('planted: with the ride skill off, the middle and child bots drown in the river', () => {
  SKILLS.ride = false;
  const off: string[] = [];
  let failed = 0;
  try {
    for (const [tier, setting] of RUNS) {
      const r = ride(tier, setting, SEED);
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
test('planted: with the handed-to-the-bank skill off, the middle on Normal hops at the water off the long log and drowns over the bar', () => {
  SKILLS.handed = false;
  try {
    const r = ride('middle', 'normal', SEED_LONG, LONG);
    assert.ok(livesAt(r) > SKILL_LIVES, `handed off, the middle on Normal still crossed within ${SKILL_LIVES}: handed ${r.handed}, ${told(r)}`);
  } finally {
    SKILLS.handed = true;
  }
});

// ───────────────────────── FIX-GATES: against the flow and up the far bank, on 2-1's own rivers ─────────────────────────
// (the lead's ruling 11-15 5:32 PM ET: planted on the live cases, the stage as the game builds it (castBots castRun: the cast bot, its
//  seed, both rolls the game plays). Measured on t-int-11 7b012852e and this head: every case below passes with its skill on)
const crossedClean = (r: ReturnType<typeof castRun>) => r.end === 'shrine' && r.rescues === 0;
const said = (r: ReturnType<typeof castRun>) => `${r.bot} ${r.setting} seed ${r.seed}: ${r.end}, rescues ${r.rescues}, lives ${r.lives}, stuck ${JSON.stringify(r.stuck)}`;
const UPSTREAM_CASES: Array<[string, 'normal' | 'easy', number]> = [['adult', 'normal', 12], ['child', 'normal', 23]];
const BANKUP_CASES: Array<[string, 'normal' | 'easy', number]> = [['child', 'easy', 20], ['child', 'easy', 23]];

test('2-1, against the flow and up the far bank on: the adult and child on Normal (12, 23) and the child on Easy (20, 23) cross clean', () => {
  for (const [bot, setting, seed] of [...UPSTREAM_CASES, ...BANKUP_CASES]) {
    const r = castRun(bot, setting, '2-1', seed);
    assert.ok(crossedClean(r), said(r));
  }
});
test('planted: with the against-the-flow skill off, the adult and child on Normal drown at 2-1\'s back river and are rescued', () => {
  SKILLS.upstream = false;
  try {
    for (const [bot, setting, seed] of UPSTREAM_CASES) {
      const r = castRun(bot, setting, '2-1', seed);
      assert.ok(!crossedClean(r), `upstream off, still clean: ${said(r)}`);
    }
  } finally {
    SKILLS.upstream = true;
  }
});
test('planted: with the up-the-far-bank skill off, the child on Easy walks into 2-1\'s far bank face, splashes back and is rescued', () => {
  SKILLS.bankUp = false;
  try {
    for (const [bot, setting, seed] of BANKUP_CASES) {
      const r = castRun(bot, setting, '2-1', seed);
      assert.ok(!crossedClean(r), `bankUp off, still clean: ${said(r)}`);
    }
  } finally {
    SKILLS.bankUp = true;
  }
});
