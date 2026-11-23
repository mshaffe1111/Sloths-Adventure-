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
 * the child's case on the final judge model as lives: seeds 4 and 5, at least 5 more lost without it, measured 1 -> 9).
 * UP THE FAR BANK (SKILLS.bankUp, FIX-GATES): off a log running back at him he hops up the far bank's 28 px face; without it the child on
 * Easy walked into the face, was carried off and splashed back until rescued (2-1 seeds 20, 23; ENG-285c re-stated it on the final judge
 * model, THIN, at its own bank: seed 22, boarding to the both-ways far bank at least 2 s longer without it, measured +3.8 s). HANDED TO THE BANK (SKILLS.handed) on the long log (W2_RIVERS.long, laid deep here): he rides a log running his
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
import type { RiverZone } from '../../src/game/river.ts';
import type { Platform } from '../../src/game/types.ts';
import { SKILLS, firstTimer, FirstTimerRun, FT_CHILD, stepLandsOn, walkOntoTail } from './firsttimer.ts';
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
// (ENG-285c 11-19, the lead's ruling 1: on the final judge model (ENG-285b ba6b225b, code e236233c) the child on Normal, seed 23, is no
//  longer rescued with the skill off (shrine, 0 rescues, 0 -> 9 lives), so 'rescued' holds for the adult on Normal, seed 12, alone; the
//  child's case is re-stated as LIVES on seeds 4 and 5: with the skill on and off his runs are the same frame for frame up to 2-1's
//  both-ways back river (seed 4: t 284 s, x 25,7xx; seed 5 parts 1 s at the first back river's far bank), and off he loses 8 more lives
//  each, at that river (1 -> 9, x 24,4xx-25,9xx))
const UPSTREAM_CASES: Array<[string, 'normal' | 'easy', number]> = [['adult', 'normal', 12]];
const UPSTREAM_LIVES: Array<[string, 'normal' | 'easy', number]> = [['child', 'normal', 4], ['child', 'normal', 5]];
/** with the against-the-flow skill off, at least this many more lives than with it (measured +8 on each of UPSTREAM_LIVES) */
const UPSTREAM_MORE = 5;
// (ENG-285c, the lead's ruling 2 (A): on the final judge model the child on Easy, seeds 20 and 23, crosses clean without the skill, and
//  bankUp moves no life and no rescue anywhere (2-1 every cast bot both settings 1-40; 2-2 lays no river running back at him; the toy
//  back river the same lives every tier): off a log running back at him, the against-the-flow front-end hop (SKILLS.upstream) takes him
//  up the same bank within a frame or two on most crossings. Its one measured effect is at its own bank: the child on Easy, seed 22, at
//  2-1's both-ways back river is carried back on the log and stands on the far bank 3.8 s later without it (4.73 -> 8.56 s from
//  boarding); the other crossings measured move under 0.4 s (seeds 4, 20, 23). THIN: a time plant at the skill's bank, not lives)
const BANKUP_CASES: Array<[string, 'normal' | 'easy', number]> = [['child', 'easy', 22]];
/** with the up-the-far-bank skill off, at least this much longer (s) from boarding the both-ways back river to its far bank (+3.8 s) */
const BANKUP_MORE_S = 2;
/** 2-1's both-ways back river (the one running back at him laid just past a river running his way, w2Arc21 bothWays) for the cast bot's
 *  run of `seed`: the s from first standing on one of its logs to first standing on its far bank */
function bothWaysCrossing(bot: string, setting: 'normal' | 'easy', seed: number) {
  let back: RiverZone | null | undefined, boarded: number | undefined, banked: number | undefined;
  const r = firstTimer('2-1', seed, CAST_BOTS[bot][setting]!, { cap: 1200, dotSetting: true, onFrame: (sim) => {
    if (back === undefined) {
      const rivers = (sim.stage as { rivers?: RiverZone[] }).rivers ?? [];
      const found = rivers.filter((b) => b.dir < 0 && b.speed > 0 && rivers.some((w) => w.dir > 0 && w.speed > 0 && b.x0 > w.x1 && b.x0 - w.x1 < 600));
      back = found.length === 1 ? found[0] : null;
    }
    if (!back || !sim.p.grounded) return;
    if (boarded === undefined && sim.p.x > back.x0 && sim.p.x < back.x1) boarded = sim.t;
    if (boarded !== undefined && banked === undefined && sim.p.x > back.x1 + 4 && sim.p.x < back.x1 + 400) banked = sim.t;
  } });
  assert.ok(back, `seed ${seed}: one both-ways back river on 2-1 (a back river just past one running his way)`);
  assert.ok(boarded !== undefined && banked !== undefined, `seed ${seed}: boarded ${boarded}, on the far bank ${banked}, ended ${r.end}`);
  return { seconds: banked! - boarded!, boarded: boarded!, end: r.end };
}

test('2-1, against the flow and up the far bank on: the adult on Normal (12), the child on Normal (4, 5) and on Easy (22) cross clean', () => {
  for (const [bot, setting, seed] of [...UPSTREAM_CASES, ...UPSTREAM_LIVES, ...BANKUP_CASES]) {
    const r = castRun(bot, setting, '2-1', seed);
    assert.ok(crossedClean(r), said(r));
  }
});
test('planted: with the against-the-flow skill off, the adult on Normal is rescued at 2-1\'s back river (12) and the child on Normal loses 5+ more lives (4, 5)', () => {
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
test('planted (THIN): with the up-the-far-bank skill off, the child on Easy is carried back on 2-1\'s both-ways log and reaches its far bank 2+ s later (22)', () => {
  const withIt = BANKUP_CASES.map(([bot, setting, seed]) => bothWaysCrossing(bot, setting, seed));
  SKILLS.bankUp = false;
  try {
    BANKUP_CASES.forEach(([bot, setting, seed], i) => {
      const off = bothWaysCrossing(bot, setting, seed);
      const more = off.seconds - withIt[i].seconds;
      assert.ok(more >= BANKUP_MORE_S, `bankUp off, ${bot} ${setting} seed ${seed}: boarding to far bank ${withIt[i].seconds.toFixed(2)} s on, ${off.seconds.toFixed(2)} s off (+${more.toFixed(2)}, at least ${BANKUP_MORE_S})`);
    });
  } finally {
    SKILLS.bankUp = true;
  }
});

// ---- ENG-BOT27: the child's two river faults on 2-7 (BUILD-27b's trace), each a bare toy in the real engine, RED with its skill off ----
/** a bare river: bank A (0-1000, top 600), logs `w` px wide `gap` px apart 28 px under the banks (river.ts LOG_DROP) flowing `dir` at
 *  75 px/s on the window 1000..x1, bank B past it; every log's place at the bot's time 0 shifted `phase` s along its cycle (driftX) */
function bareRiver(dir: 1 | -1, w: number, gap: number, x1: number, phase: number): Platform[] {
  const bank = (id: number, x: number, width: number) => ({ id, x, y: 600, width, height: 90, type: 'solid' }) as Platform;
  const speed = 75, T = (x1 - 1000 + w) / speed, n = Math.floor((x1 - 1000 + w) / (w + gap));
  const logs = Array.from({ length: n }, (_, k) => {
    const offset = (((k * (w + gap)) / speed + phase) % T + T) % T;
    return { id: 10 + k, x: 0, y: 628, width: w, height: 24, type: 'drift', drift: { x0: 1000, x1, dir, speed, width: w, baseY: 628, offset } } as unknown as Platform;
  });
  return [bank(1, 0, 1000), bank(2, x1, 1200), ...logs];
}
/** the child on Normal over a bare river from x 700, one run of `cap` s; a fall below the toy is a level put-back (softFalls) */
function bareRun(pieces: Platform[], onFrame: (p: { x: number; y: number; vx: number; vy: number; grounded: boolean }, under: Platform | undefined, falls: number) => void, cap = 25) {
  const line = Array.from({ length: 200 }, (_, i) => ({ x: 100 + i * 24, y: 600 }));
  const run = new FirstTimerRun('1-1', 1, FT_CHILD, { route: line, cap, rescueAfter: 1000, onFrame: (sim) => {
    const e = (sim as unknown as { e: { player: { x: number; y: number; vx: number; vy: number; grounded: boolean }; platforms: Platform[]; standingOnId: number | null } }).e;
    onFrame(e.player, e.platforms.find((q) => q.id === e.standingOnId), run.softFalls.length);
  } });
  run.sim.bare(pieces);
  (run.sim as unknown as { e: { currentStage: { config: { levelHeight: number } } } }).e.currentStage.config.levelHeight = 720;
  run.sim.stand(700, 600);
  run.prog.relocate(run.sim.p);
  return run.play();
}
const PHASES = Array.from({ length: 12 }, (_, i) => i * 0.25);

test('the floor-ahead read at a bank\'s lip: a log flowing AT him whose tail a plain walk off the lip cannot land on is no floor (SKILLS.meetLog; RED with it off)', () => {
  // (planted at the read itself, as the boardHop toy is: BUILD-27b's trace, re-traced by ENG-BOT27 on the 2-7 draft, child Normal seed 14
  //  t 127.37: he stood at x 13898 just past the lip (bank 13636-13896, top 734), a log flowing at him (75 px/s) showing 48 px past it
  //  (13784-13944, top 762, 28 px down), walked off at 268-285 px/s, crossed its far end before his drop landed him and drowned at 13962.
  //  The log is on its own clock (driftX) where the trace had it at the read's time 0)
  const bank = { id: 1, x: 13636, y: 734, width: 260, height: 90, type: 'solid' } as Platform;
  const x1 = 13896 + 600;
  const log = (x: number, dir: 1 | -1 = -1) => ({
    id: 2, x, y: 762, width: 160, height: 24, type: 'drift',
    drift: { x0: 13896, x1, dir, speed: 75, width: 160, baseY: 762, offset: dir === -1 ? (x1 - x) / 75 : (x - 13896 + 160) / 75 },
  }) as unknown as Platform;
  const stand = { x: 13898, y: 734, vx: 0, grounded: true };
  const read = (fa: Platform, on: boolean) => {
    const was = SKILLS.meetLog;
    SKILLS.meetLog = on;
    try {
      return walkOntoTail(fa, null, undefined, stand, 13896, 1, 0);
    } finally {
      SKILLS.meetLog = was;
    }
  };
  assert.equal(read(log(13784), true), true, 'the 48 px tail: a walk off the lip cannot land on it, so it is no floor ahead');
  assert.equal(read(log(13784), false), false, 'RED: with SKILLS.meetLog off the tail reads as floor ahead and he walks onto it');
  // (and nothing else moves: a log whose front has reached the lip (all of it past the lip) is floor he walks onto; a log running his way
  //  is not this read's (boardLog's); standing ON a log, no read)
  assert.equal(read(log(13896), true), false, 'a log whose front has reached the lip: floor, he steps on');
  assert.equal(read(log(13784, 1), true), false, 'a log running his way: not this read');
  assert.equal(walkOntoTail(log(13784), log(13600), undefined, { ...stand, y: 762 }, 13896, 1, 0), false, 'on a log: not this read');
  // (the flight itself: from the stand at the lip a walk lands on the full log, not on the tail)
  assert.equal(stepLandsOn(log(13896), (t) => 13896 - 75 * t, 13898, 734, 13896, 1, 0, 0), true);
  assert.equal(stepLandsOn(log(13784), (t) => 13784 - 75 * t, 13898, 734, 13896, 1, 0, 0), false);
});

test('in the real engine: on a log flowing his way he never takes the landing pause\'s flick from mid-log; every hop off it is from its front end (SKILLS.logEnd; RED with it off)', () => {
  // (2-7 child Normal seed 13 x 8700 (BUILD-27b's seed 14 x 8709): landed on a 150 px log, paused a beat, then the pause's flick, a hop
  //  no gate judges, fired from 64 px behind its front and came down short of the next. A hop off a log his way from more than 40 px
  //  behind its front end is the fault)
  const hops = (on: boolean) => {
    const was = SKILLS.logEnd;
    SKILLS.logEnd = on;
    let mid = 0, all = 0;
    try {
      for (const ph of PHASES) {
        let prev: { g: boolean; under: Platform | undefined; x: number } = { g: false, under: undefined, x: 0 };
        bareRun(bareRiver(1, 150, 72, 2400, ph), (p, under) => {
          if (prev.g && prev.under?.drift && !p.grounded && p.vy < 0) {
            all++;
            const q = prev.under;
            if (q.x + q.width - prev.x > 40) mid++;
          }
          prev = { g: p.grounded, under, x: p.x };
        });
      }
    } finally {
      SKILLS.logEnd = was;
    }
    return { mid, all };
  };
  const on = hops(true), off = hops(false);
  assert.equal(on.mid, 0, `with the skill: no hop off a log his way from mid-log (${JSON.stringify(on)})`);
  assert.ok(off.mid >= 1, `RED: with SKILLS.logEnd off the pause's flick fires from mid-log (${JSON.stringify(off)})`);
});
