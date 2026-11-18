// npx tsx --test tools/inspect/pitClimb.test.ts   (CI: gates.yml, the engine tools' tests)
/**
 * The first-timer climbs back out of a pit the way on cannot be reached from (BUILD-16c, the lead's 11:43 AM ET ruling 11-14): a moss
 * pit under a liana on 1-6 has its far wall 225 px up (over any jump) and a stair of 56 px steps back up to the bank he left from. The bot
 * walked into the far wall until the 20 s rescue put him past it ("a 225 px wall ahead, the way on is 225 px up"), so every 1-6 run read
 * "rescued", which no player is (castBots.ts runHolds: 0 rescues). A person turns round, climbs the stair and tries again; so does he.
 * A toy stage, no stage of the game: the bank, a pit 225 px under it with its stair on the near side, a ledge over the pit at the bank's
 * height (the way on: two plain 130 px hops), the far bank.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { FirstTimerRun, FT_ADULT, FT_CHILD, FT_KID, FT_MIDDLE, hopCatches } from './firsttimer.ts';
import type { Platform, Vine } from '../../src/game/types.ts';

const BANK = 580, PIT = BANK + 225;
const block = (id: number, x: number, y: number, width: number, bottom = PIT + 120): Platform =>
  ({ id, x, y, width, height: bottom - y, type: 'solid' }) as Platform;
/** the near bank to 1000, the pit floor 1000-1556 with its stair at the near end (56 px steps), a ledge at the bank's height 1130-1426
 *  (130 px plain hops either side), the far bank from 1556 */
const PLATS = (): Platform[] => [
  block(1, 0, BANK, 1000),
  block(2, 1000, PIT, 556),
  block(3, 1000, PIT - 56, 300),
  block(4, 1000, PIT - 112, 200),
  block(5, 1000, PIT - 168, 100),
  { id: 6, x: 1130, y: BANK, width: 296, height: 24, type: 'solid' } as Platform,
  block(7, 1556, BANK, 2400),
];
/** the route along the banks' height, as the inspector's route runs over a pit (route.ts: the pit is the miss, never the way) */
const ROUTE = Array.from({ length: 150 }, (_, i) => ({ x: 100 + i * 24, y: BANK }));

const fromThePit = (who = FT_ADULT, x = 1500) => {
  const run = new FirstTimerRun('1-1', 1, who, { route: ROUTE, cap: 24, rescueAfter: 12 });
  run.sim.bare(PLATS());
  run.sim.stand(x, PIT);
  run.prog.relocate(run.sim.p);
  return run.play();
};

test('in the pit under the far wall, he climbs the stair back to the bank he left from, then goes on over the ledge: no rescue', () => {
  for (const who of [FT_ADULT, FT_KID]) {
    const run = fromThePit(who);
    const p = run.sim.p;
    assert.equal(run.rescues, 0, `${who.name}: rescued (stuck: ${JSON.stringify(run.stuck)})`);
    assert.ok(run.climbBacks >= 1, `${who.name}: turned back for the stair`);
    assert.ok(p.x > 1600 && Math.abs(p.y - BANK) < 4, `${who.name}: on the far bank at the end (x ${Math.round(p.x)}, y ${Math.round(p.y)})`);
  }
});

test('he climbs back only out of a pit: on the route he goes on as before, and a pit he can jump out of forward is left forward', () => {
  // on the near bank, the way on ahead: he never turns back
  const run = new FirstTimerRun('1-1', 1, FT_ADULT, { route: ROUTE, cap: 10, rescueAfter: 12 });
  run.sim.bare(PLATS());
  run.sim.stand(600, BANK);
  run.prog.relocate(run.sim.p);
  run.play();
  assert.ok(run.sim.p.x > 1600 && run.rescues === 0 && run.climbBacks === 0, `straight on from the bank (x ${Math.round(run.sim.p.x)}, turned back ${run.climbBacks})`);
  // a shallow dip (a waist-high step up ahead, 56 px): he hops out forward, never back up the stair
  const dip = new FirstTimerRun('1-1', 1, FT_ADULT, { route: ROUTE, cap: 10, rescueAfter: 12 });
  dip.sim.bare([block(1, 0, BANK, 1000), block(2, 1000, BANK + 56, 300), block(3, 1300, BANK, 2600)]);
  dip.sim.stand(1150, BANK + 56);
  dip.prog.relocate(dip.sim.p);
  dip.play();
  assert.ok(dip.sim.p.x > 1400 && dip.rescues === 0 && dip.climbBacks === 0, `out of the dip forward (x ${Math.round(dip.sim.p.x)}, turned back ${dip.climbBacks})`);
});

/**
 * The catch off a lip (BUILD-16c, the lead's ruling B 11-14): a liana swings itself, its foot 180 px either way, and the bot's old jump
 * at the lip, whatever the swing was doing, missed it as it swung away and fell into the pit under it (most of 1-6's Normal misses). He
 * now flies the hop he can make as the engine flies it and presses when the engine's own catch takes him (hopCatches, canGrabSwing).
 * A toy: the bank, a liana 170 px past its lip (420 px long, the self-swing), the pit, the far bank; the liana at every phase of its swing.
 */
const lianaToy = (who: typeof FT_MIDDLE, phase: number) => {
  const run = new FirstTimerRun('1-1', 1, who, { route: ROUTE, cap: 9, rescueAfter: 100 });
  const vine = { id: 1, x: 1170, topY: BANK - 420, bottomY: BANK, swaySpeed: 0, swayPhase: 0, vineType: 'swing_liana', swingAmp: 0.45, swingPeriod: 2.85, swingPhase: phase } as unknown as Vine;
  run.sim.bare([block(1, 0, BANK, 1000), block(2, 1000, PIT, 600), block(7, 1600, BANK, 2400)], [vine]);
  run.sim.stand(300, BANK);
  run.prog.relocate(run.sim.p);
  // (watched every frame: caught before he ever drops into the pit)
  let caught = false, fell = false;
  const hook = run as unknown as { after: () => void };
  const after = hook.after.bind(run);
  hook.after = () => {
    after();
    if (fell) return;
    if (run.sim.p.isVineSwinging) caught = true;
    else if (!caught && run.sim.p.y > BANK + 100) fell = true;
  };
  run.play();
  return caught && !fell;
};

// (a tier bot, who can stand at a lip and watch: KID and ADULT never let go of a held steer, thumbify R-165.59, so they choose only the
// moment of the press on the run, and some phases of a swing they meet at the lip are past catching)
test('off a lip he stands, watches and catches a swinging liana at every phase of its swing (the engine\'s own catch)', () => {
  for (const who of [{ ...FT_MIDDLE, setting: 'normal' as const }]) {
    const missed = Array.from({ length: 10 }, (_, i) => i / 10).filter((ph) => !lianaToy(who, ph));
    assert.deepEqual(missed, [], `${who.name}: missed the liana at phases ${missed.join(', ')}`);
  }
});

test('the hop model: a hop off the lip as the liana swings toward him is caught; as it swings away, not', () => {
  const v = { id: 1, x: 1170, topY: BANK - 420, bottomY: BANK, swingAmp: 0.45, swingPeriod: 2.85, swingPhase: 0, vineType: 'swing_liana' } as unknown as Vine;
  const at = Array.from({ length: 24 }, (_, i) => hopCatches(v, 988, BANK, 1, FT_KID.hold[0], (2.85 * i) / 24, 0));
  assert.ok(at.some(Boolean) && !at.every(Boolean), `some moments catch, not all: ${at.map((b) => (b ? 'x' : '.')).join('')}`);
});

// BUILD-17 (the lead's 1:24 PM ET ruling 11-14): 1-7's moss pit under a SHORT liana. The pit is shallower (179 px under the bank), so the
// route over it is inside a double's rise, but the way on past it is the liana's perch, 80 px OVER the bank: the face in front of him is
// 259 px, over any jump. The climb-back read only the route's height ("the way on is 179 px up"), never the wall, and the kid stood
// facing that wall until the 20 s rescue (castBots 1-7 Easy seed 11, x 33575). Planted: with the climb-back reading the route's height
// alone, this test is red.
test("in a shallow pit whose route is inside a double but whose far wall is over one (1-7's SHORT liana pit), he climbs back: no rescue", () => {
  const PIT2 = BANK + 179, PERCH = BANK - 80;
  const plats: Platform[] = [
    block(1, 0, BANK, 1000, PIT2 + 120),
    block(2, 1000, PIT2, 556, PIT2 + 120),
    block(3, 1000, PIT2 - 60, 300, PIT2 + 120),
    block(4, 1000, PIT2 - 120, 200, PIT2 + 120),
    { id: 6, x: 1130, y: BANK, width: 296, height: 24, type: 'solid' } as Platform,
    block(7, 1556, PERCH, 2400, PIT2 + 120),
  ];
  const route = Array.from({ length: 150 }, (_, i) => ({ x: 100 + i * 24, y: 100 + i * 24 < 1556 ? BANK : PERCH }));
  for (const who of [FT_KID, FT_ADULT]) {
    const run = new FirstTimerRun('1-1', 1, who, { route, cap: 24, rescueAfter: 12 });
    run.sim.bare(plats);
    run.sim.stand(1530, PIT2);
    run.prog.relocate(run.sim.p);
    run.play();
    const p = run.sim.p;
    assert.equal(run.rescues, 0, `${who.name}: rescued (stuck: ${JSON.stringify(run.stuck)})`);
    assert.ok(run.climbBacks >= 1, `${who.name}: turned back for the stair`);
    assert.ok(p.x > 1600 && Math.abs(p.y - PERCH) < 4, `${who.name}: on the far perch at the end (x ${Math.round(p.x)}, y ${Math.round(p.y)})`);
  }
});

/**
 * BUILD-16d: a vine snake on HIS liana, as the screen shows it (the snake piece's place this step): coming UP from the foot under his
 * hands he climbs high ahead of it; coming DOWN from the anchor over them he slides low; past him, or none showing, neither. 1-6 Normal
 * seed 3 (castBots): knowing nothing of snakes, the kid slid to the foot he had learned to hang from, met a riser, was let go into the
 * pit and looped on its stair to a rescue. Planted: a bot blind to the snake piece reads null on every case (RED).
 */
test('a vine snake on his liana: up from the foot -> he climbs high; down from the anchor -> he slides low; past him or none -> neither', () => {
  const LEN = 420;
  const at = (now: object | null) => {
    const run = Object.create(FirstTimerRun.prototype) as { e: unknown; snakeAhead(id: number, len: number, swing: number): string | null };
    (run as { e: unknown }).e = { pieces: now ? [{ kind: 'vine-snake', vines: [{ id: 3 }, { id: 7 }], now: [{ shown: false, tell: false, live: false, head: 0, tail: 0, dir: 1 }, now] }] : [] };
    return run;
  };
  // (his hands 200 px down the liana: swingLength 200 + VINE_HANG)
  const hands = 200 + 30;
  const cases: Array<[string, object | null, string | null]> = [
    ['a riser in its tell at the foot', { shown: true, tell: true, live: false, head: LEN, tail: LEN + 115, dir: -1 }, 'up'],
    ['a riser half way up, under his hands', { shown: true, tell: false, live: true, head: 300, tail: 415, dir: -1 }, 'up'],
    ['a snake coming down from the anchor, over his hands', { shown: true, tell: false, live: true, head: 120, tail: 5, dir: 1 }, 'down'],
    ['a snake gone down past him', { shown: true, tell: false, live: true, head: 400, tail: 285, dir: 1 }, null],
    ['no snake showing', { shown: false, tell: false, live: false, head: 0, tail: 0, dir: 1 }, null],
    ['no snake piece on the stage', null, null],
  ];
  for (const [what, now, want] of cases) assert.equal(at(now).snakeAhead(7, LEN, hands), want, what);
  // (another liana's snake is not his)
  assert.equal(at({ shown: true, tell: false, live: true, head: 300, tail: 415, dir: -1 }).snakeAhead(3, LEN, hands), null, 'the snake on liana 7 is not on his liana 3');
});

/**
 * The climb back ends on a liana (ENG-16E, R-165.246; 1-6's gorge, castBots adult Normal seed 4 x6 and kid seed 3 x6 rescues): in the pit
 * past the creaky limb (its floor split from the pit before by the open gap under the limb) his way back runs up the stair and on through
 * the pit before; a liana's foot swinging back over the stair took him, and he kept the climb-back's way (back) on it: held back and
 * leapt back over the gone limb into the pit before (FT_FRAMES 236.8-240.4). A person on a liana that leads on swings and lets go toward
 * the way on: on a liana the climb back is over and the route steers. RED with the climb back kept on a liana.
 */
test('caught by a liana while he climbs back out of a pit, the climb back is over: the route steers him on, never back', () => {
  const run = new FirstTimerRun('1-1', 1, FT_ADULT, { route: ROUTE, cap: 5, rescueAfter: 100 });
  const vine = { id: 1, x: 1250, topY: BANK - 420, bottomY: BANK, swaySpeed: 0, swayPhase: 0, vineType: 'swing_liana', swingAmp: 0.45, swingPeriod: 2.85 } as unknown as Vine;
  run.sim.bare(PLATS(), [vine]);
  run.sim.swing(vine, { angle: -0.2, omega: -0.3, len: 400 });
  run.prog.relocate(run.sim.p);
  const bot = run as unknown as { climbBack: { path: Platform[]; dir: -1 | 1; t: number } | null; pitWayBack(t: null): -1 | 0 | 1; t: number };
  bot.climbBack = { path: PLATS().slice(1, 5), dir: -1, t: bot.t };
  assert.equal(bot.pitWayBack(null), 0, 'on the liana he still steers back the way he was climbing');
  assert.equal(bot.climbBack, null, 'the climb back is not over once a liana holds him');
  // (and on the ground, climbing back, it still steers back: the climb back itself is unchanged)
  run.sim.stand(1450, PIT);
  bot.climbBack = { path: PLATS().slice(1, 5), dir: -1, t: bot.t };
  assert.equal(bot.pitWayBack(null), -1, 'on the pit floor, climbing back, he no longer steers back');
});

/**
 * ENG-16F (R-165.246): on a liana 7 s, he lets go as it next carries him out in front, never at the back of the swing. 1-6 Normal kid
 * seed 4: caught the risers' liana, climbed high ahead of a rising snake, back down to the foot he had learned, and the 7 s let-go came as
 * the swing went BACK over the pit: dropped in, climbed the stair, caught it again, round and round to a rescue (FT_FRAMES 187-208).
 * A toy: the liana over the pit, he hangs at its foot 7 s already, the swing carrying him back. RED with the let-go at any moment.
 */
test('on a liana 7 s, the let-go comes as it carries him out in front, never at the back of the swing: he lands on the far bank', () => {
  for (const who of [FT_KID, FT_ADULT]) {
    const run = new FirstTimerRun('1-1', 1, { ...who, setting: 'normal' }, { route: ROUTE, cap: 8, rescueAfter: 100 });
    const vine = { id: 1, x: 1300, topY: BANK - 400, bottomY: BANK + 10, swaySpeed: 0, swayPhase: 0, vineType: 'swing_liana', swingAmp: 0.45, swingPeriod: 2.85, swingPhase: 0 } as unknown as Vine;
    run.sim.bare([block(1, 0, BANK, 1000), block(2, 1000, PIT, 600), block(7, 1600, BANK, 2400)], [vine]);
    // (at the foot, out at the back and swinging further back)
    run.sim.swing(vine, { angle: -0.3, omega: -0.25, len: 395 });
    run.prog.relocate(run.sim.p);
    const bot = run as unknown as { swingT: number; after: () => void };
    bot.swingT = 7.2;
    let fell = false;
    const after = bot.after.bind(run);
    bot.after = () => {
      after();
      if (run.sim.p.y > BANK + 100) fell = true;
    };
    run.play();
    assert.ok(!fell, `${who.name}: let go at the back of the swing and fell into the pit`);
    assert.ok(run.sim.p.x > 1600 && run.sim.p.y <= BANK + 2, `${who.name}: not on the far bank (${Math.round(run.sim.p.x)}, ${Math.round(run.sim.p.y)})`);
  }
});

/**
 * ENG-16F (R-165.246): on a liana he steers by the way on past it, never by a route point on its own swing. 1-6 Normal kid seed 6: the
 * route's point at the gorge's first liana was a cut liana's foot 85 px behind the anchor and 250 px up; swung forward past it, the steer
 * turned him back at the forward end and the let-go went out facing back with no leap, into the pit short of the creaky limb (FT_FRAMES
 * 247.5-248.4). A toy: the near bank, the liana over the pit, the far bank; the route has that point. RED with the plain route target.
 */
test('on a liana the steer is the way on past it: a route point on its swing behind him never turns him back, and he lands on the far bank', () => {
  const X = 1300, TOP = BANK - 420;
  const route = [...Array.from({ length: 38 }, (_, i) => ({ x: 100 + i * 24, y: BANK })), { x: X - 85, y: TOP + 160 }, ...Array.from({ length: 60 }, (_, i) => ({ x: 1630 + i * 24, y: BANK }))];
  for (const who of [FT_KID, FT_ADULT]) {
    for (const angle of [-0.35, -0.2, 0]) {
      const run = new FirstTimerRun('1-1', 1, { ...who, setting: 'normal' }, { route, cap: 6, rescueAfter: 100 });
      const vine = { id: 1, x: X, topY: TOP, bottomY: BANK + 10, swaySpeed: 0, swayPhase: 0, vineType: 'swing_liana', swingAmp: 0.45, swingPeriod: 2.85, swingPhase: 0 } as unknown as Vine;
      run.sim.bare([block(1, 0, BANK, 1000), block(2, 1000, PIT, 600), block(7, 1600, BANK, 2400)], [vine]);
      // (at the foot, swinging forward from behind the anchor)
      run.sim.swing(vine, { angle, omega: 0.5, len: 420 });
      run.prog.relocate(run.sim.p);
      const bot = run as unknown as { swingT: number; prog: { cur: number }; after: () => void };
      bot.swingT = 1.2;
      bot.prog.cur = 38;
      let fell = false;
      const after = bot.after.bind(run);
      bot.after = () => {
        after();
        if (run.sim.p.y > BANK + 100) fell = true;
      };
      run.play();
      assert.ok(!fell && run.sim.p.x > 1600 && run.sim.p.y <= BANK + 2, `${who.name} from ${angle}: ${fell ? 'fell into the pit' : `not on the far bank (${Math.round(run.sim.p.x)}, ${Math.round(run.sim.p.y)})`}`);
    }
  }
});

/**
 * ENG-16H (R-165.246, the lead's packet item 2): every soft pit under a liana has its stair back (pipeline backPit lays it; ENG-16G's
 * traces wrote "fell into this pit 3 times" only once pitWayUp had found that way up, on all six), and the kid took it each time; what put
 * him back in was the let-go. Back up the stair his way was BACK, and caught again with the perch below him and close across, the steer's
 * "keep the way he was going" rule kept it, so he let go at the back end of the swing into the same pit: 1-6 Normal kid seeds 14, 20 and
 * 21 (f3603 vx -294 and the like). A toy: the liana over the pit, the far bank 80 px under the near one, his way left at -1. RED with the
 * stale way (he let go backwards into the pit, KID and ADULT from 0.3 rad); planted-faults.py 'stale-way'.
 */
test('on a liana after a climb back, a stale way back never turns him round: from every place in the swing he lands on the far bank', () => {
  const X = 1300, TOP = BANK - 420, LOW = BANK + 80;
  const route = [...Array.from({ length: 38 }, (_, i) => ({ x: 100 + i * 24, y: BANK })), ...Array.from({ length: 60 }, (_, i) => ({ x: 1500 + i * 24, y: LOW }))];
  for (const who of [FT_KID, FT_ADULT]) {
    for (const angle of [-0.35, 0, 0.3]) {
      const run = new FirstTimerRun('1-1', 1, { ...who, setting: 'normal' }, { route, cap: 6, rescueAfter: 100 });
      const vine = { id: 1, x: X, topY: TOP, bottomY: BANK + 10, swaySpeed: 0, swayPhase: 0, vineType: 'swing_liana', swingAmp: 0.45, swingPeriod: 2.85, swingPhase: 0 } as unknown as Vine;
      run.sim.bare([block(1, 0, BANK, 1000), block(2, 1000, PIT, 500), block(7, 1500, LOW, 2400)], [vine]);
      run.sim.swing(vine, { angle, omega: 0.5, len: 420 });
      run.prog.relocate(run.sim.p);
      const bot = run as unknown as { swingT: number; way: -1 | 0 | 1; prog: { cur: number }; after: () => void };
      bot.swingT = 1.2;
      bot.prog.cur = 38;
      bot.way = -1;
      let fell = false;
      const after = bot.after.bind(run);
      bot.after = () => {
        after();
        if (run.sim.p.y > PIT - 10) fell = true;
      };
      run.play();
      assert.ok(!fell && run.sim.p.x > 1500 && Math.abs(run.sim.p.y - LOW) < 4, `${who.name} from ${angle}: ${fell ? 'let go back into the pit' : `not on the far bank (${Math.round(run.sim.p.x)}, ${Math.round(run.sim.p.y)})`}`);
    }
  }
});

/**
 * ENG-16F (R-165.246): out of a pit under a liana, he climbs to the stair step the liana is caught from most often, not the first step
 * that catches it at some moment. 1-6 Normal adult seed 1, the gorge (its numbers here, moved 44561 px left): the creaky limb gone, the
 * pit's stair 1021 / 961 / 901 under gl2; the 961 step caught it at 14 of 48 moments, the top step at 29; he hopped from 961 three times
 * and was rescued. RED with the nearest catching step.
 */
test('out of a pit under a liana, the climb ends on the stair step the liana is caught from most often (the top), not the nearest', () => {
  const blk = (id: number, x: number, y: number, w: number): Platform => ({ id, x, y, width: w, height: 1300 - y, type: 'solid' }) as Platform;
  const plats = [blk(1, 0, 841, 283), blk(2, 1000, 1081, 549), blk(3, 1000, 1021, 300), blk(4, 1000, 961, 200), blk(5, 1000, 901, 100), blk(6, 1549, 841, 580)];
  const gl2 = { id: 1, x: 1174, topY: 429, bottomY: 849, swaySpeed: 0, swayPhase: 0, vineType: 'swing_liana', swingAmp: 0.45, swingPeriod: 2.85, swingPhase: 0.82 } as unknown as Vine;
  const route = Array.from({ length: 90 }, (_, i) => ({ x: 40 + i * 24, y: 841 }));
  for (const who of [FT_ADULT, FT_KID]) {
    const run = new FirstTimerRun('1-1', 1, { ...who, setting: 'normal' }, { route, cap: 2, rescueAfter: 100 });
    run.sim.bare(plats, [gl2]);
    run.sim.stand(1400, 1081);
    const bot = run as unknown as { pitWayUp(from: Platform): Platform[] | null };
    const path = bot.pitWayUp(run.sim.platforms.find((q) => q.id === 2)!);
    assert.ok(path, `${who.name}: no way up`);
    assert.equal(path[path.length - 1].y, 901, `${who.name}: climbs to the ${path[path.length - 1].y} step, not the top (901)`);
  }
});

/**
 * ENG-16F (R-165.246): in a pit under a swinging liana whose foot hangs within a double's rise, he climbs back out by the stair to the bank
 * he catches it from, never jumps at the foot from the floor: it is there for a moment of its swing. 1-6 Normal kid seed 5, under the
 * first liana (its numbers here): the foot 179 px over the pit floor, seven untimed jumps in 9 s, a rescue. RED with the foot taken for a
 * ledge (pitWayBack returned 0: the way on "within a double").
 */
test('in a pit under a swinging liana, its foot within a double\'s rise is no ledge: he climbs back out by the stair', () => {
  const blk = (id: number, x: number, y: number, w: number): Platform => ({ id, x, y, width: w, height: 1300 - y, type: 'solid' }) as Platform;
  const plats = [blk(1, 2000, 798, 800), blk(2, 2800, 1002, 280), blk(3, 2800, 934, 200), blk(4, 2800, 866, 100), blk(5, 3080, 718, 280), blk(6, 3360, 853, 600)];
  const liana = { id: 1, x: 2988, topY: 384, bottomY: 804, swaySpeed: 0, swayPhase: 0, vineType: 'swing_liana', swingAmp: 0.45, swingPeriod: 2.85, swingPhase: 0.62 } as unknown as Vine;
  const route = [...Array.from({ length: 34 }, (_, i) => ({ x: 2000 + i * 24, y: 798 })), { x: 2988, y: 823 }, ...Array.from({ length: 12 }, (_, i) => ({ x: 3100 + i * 24, y: 718 }))];
  for (const who of [FT_KID, FT_ADULT]) {
    const run = new FirstTimerRun('1-1', 1, { ...who, setting: 'normal' }, { route, cap: 2, rescueAfter: 100 });
    run.sim.bare(plats, [liana]);
    run.sim.stand(3061, 1002);
    run.prog.relocate(run.sim.p);
    const bot = run as unknown as { pitWayBack(t: { x: number; y: number } | null): -1 | 0 | 1; climbBack: unknown; prog: { target(p: unknown): { x: number; y: number } | null } };
    const tgt = bot.prog.target(run.sim.p);
    assert.ok(tgt && Math.abs(tgt.x - 2988) < 60, `${who.name}: the way on is not the liana's foot (${JSON.stringify(tgt)})`);
    assert.equal(bot.pitWayBack(tgt), -1, `${who.name}: he does not climb back out by the stair`);
    assert.ok(bot.climbBack, `${who.name}: no climb back started`);
  }
});

/**
 * ENG-16F (R-165.246): a tier bot's thumb lifting for a moment holds his count at a face, on every stage. P13 held it only on a stage with
 * a cast, so on 1-6 (snakes as pieces, no cast) the child stood 20 s at a 53 px stump's face to a rescue, his count started over at every
 * lift (Normal seed 2, frames 370.4-372.6). A toy with no cast: the floor, a 53 px stump on it (1-6's), the way on over it. RED with the
 * count held on cast stages only.
 */
test('a tier bot at a plain step\'s face jumps it though his thumb lifts now and then (no cast on the stage)', () => {
  const plats = [{ id: 1, x: 0, y: 808, width: 3000, height: 456, type: 'solid' } as Platform, { id: 2, x: 1095, y: 755, width: 130, height: 53, type: 'solid' } as Platform];
  const route = [...Array.from({ length: 44 }, (_, i) => ({ x: 40 + i * 24, y: 808 })), ...Array.from({ length: 6 }, (_, i) => ({ x: 1100 + i * 24, y: 755 })), ...Array.from({ length: 60 }, (_, i) => ({ x: 1260 + i * 24, y: 808 }))];
  for (const v of [1, 2, 3, 4]) {
    const run = new FirstTimerRun('1-1', v, { ...FT_CHILD, setting: 'normal' }, { route, cap: 14, rescueAfter: 100 });
    run.sim.bare(plats);
    (run.e as unknown as { cast: unknown }).cast = null;
    run.sim.stand(1000, 808);
    run.prog.relocate(run.sim.p);
    run.play();
    assert.ok(run.sim.p.x > 1300, `variant ${v}: still at the stump's face (x ${Math.round(run.sim.p.x)}) after 14 s`);
  }
});

/**
 * ENG-16I (R-165.246): in the pit past a crumbled creaky limb, a liana AHEAD of the one he came off, caught from the pit's stair top, beats
 * the walk back. Since soft-pit floors join under a perch (ENG-16H pitFloorJoin), the pit past the limb is open to the pit before, so
 * pitWayUp found the bank before the first liana ("a ledge the route walks on") and he walked all the way back, took the first liana,
 * landed on the regrown or crumbling limb and fell again: three falls, a rescue (castBots 1-6 Normal kid 33 of 40 seeds, the creaky
 * landing and the gorge). A person in that pit climbs the stair and jumps for the next liana over its top step: from that step a jump
 * anywhere in its last 40 px catches it (reference/qa-reports/ENG-16I/bots/pitout-7-creaky.txt). A toy: 1-6 Normal seed 7's creaky
 * landing moved 26835 px left. RED with the walk back first (pitWayUp's walked ledge before any catch ledge).
 */
const CREAKY = () => {
  const blk = (id: number, x: number, y: number, w: number): Platform => ({ id, x, y, width: w, height: 1211 - y, type: 'solid' }) as Platform;
  const plats = [
    blk(1, 0, 866, 320), // the bank he takes the first liana from
    blk(2, 320, 1091, 556), blk(3, 876, 1091, 150), blk(4, 1026, 1091, 536), // the one floor under both pits and the limb (pitFloorJoin)
    blk(5, 320, 1034, 300), blk(6, 320, 978, 200), blk(7, 320, 922, 100), // the stair back up to the bank
    blk(8, 1026, 1034, 300), blk(9, 1026, 978, 200), blk(10, 1026, 922, 100), // the stair up toward the limb, its top under the next liana
    { id: 11, x: 876, y: 866, width: 150, height: 24, type: 'fragile', broken: true, regrowAt: 1e9 } as unknown as Platform, // the limb, crumbled
    blk(12, 1562, 866, 700), // the far bank, 225 px over the floor
  ];
  const liana = (id: number, x: number, top: number, bottom: number) =>
    ({ id, x, topY: top, bottomY: bottom, swaySpeed: 0, swayPhase: 0, vineType: 'swing_liana', swingAmp: 0.45, swingPeriod: 2.85, swingPhase: 0.82 }) as unknown as Vine;
  return { plats, vines: [liana(1, 506, 452, 872), liana(2, 1192, 447, 867)], route: Array.from({ length: 90 }, (_, i) => ({ x: 40 + i * 24, y: 866 })) };
};

test('in the pit past a crumbled creaky limb, the stair top under the NEXT liana beats the walk back to the first: he climbs to it', () => {
  const { plats, vines, route } = CREAKY();
  for (const who of [FT_KID, FT_ADULT, FT_CHILD, FT_MIDDLE]) {
    const run = new FirstTimerRun('1-1', 1, { ...who, setting: 'normal' }, { route, cap: 2, rescueAfter: 100 });
    run.sim.bare(plats, vines);
    run.sim.stand(1400, 1091);
    const bot = run as unknown as { pitWayUp(from: Platform): Platform[] | null; swungOn: number | null };
    bot.swungOn = 1;
    const path = bot.pitWayUp(run.sim.platforms.find((q) => q.id === 4)!);
    assert.ok(path, `${who.name}: no way up`);
    const end = path[path.length - 1];
    assert.equal(end.id, 10, `${who.name}: climbs to ${end.id} (x ${end.x} y ${end.y}), not the stair top under the next liana (10)`);
  }
  // (off the FIRST liana into the pit under it, the walk back is kept: the liana he came off is no way ahead; pitClimb's moss pit as before)
  const run = new FirstTimerRun('1-1', 1, { ...FT_KID, setting: 'normal' }, { route, cap: 2, rescueAfter: 100 });
  run.sim.bare(plats.filter((q) => q.id !== 12).concat([{ ...plats[11], x: 1562 } as Platform]), [vines[0]]);
  run.sim.stand(600, 1091);
  const bot = run as unknown as { pitWayUp(from: Platform): Platform[] | null; swungOn: number | null };
  bot.swungOn = 1;
  const path = bot.pitWayUp(run.sim.platforms.find((q) => q.id === 2)!);
  assert.equal(path?.[path.length - 1].id, 1, 'off the first liana with no liana ahead: he climbs back to the bank he took it from');
});

// (from the pit past the limb, and from the pit under the first liana: there the way up to the next liana runs forward under the limb,
// and a climb that heads forward was left to the steer, which walked him into the far wall for 20 s: castBots 1-6 Normal kid seeds 1, 2,
// 6, 24 "the way on is 228 px up" once the stair top ahead was his way out; ENG-16I)
test('in the pit past a crumbled creaky limb he climbs the stair, takes the next liana and lands on the far bank: no rescue', () => {
  const { plats, vines, route } = CREAKY();
  for (const [who, x] of [[FT_KID, 1400], [FT_ADULT, 1400], [FT_KID, 600], [FT_ADULT, 600]] as const) {
    const run = new FirstTimerRun('1-1', 1, { ...who, setting: 'normal' }, { route, cap: 30, rescueAfter: 100 });
    run.sim.bare(plats, vines);
    run.sim.stand(x, 1091);
    run.prog.relocate(run.sim.p);
    (run as unknown as { swungOn: number | null }).swungOn = 1;
    const r = run.play();
    assert.equal(r.rescues, 0, `${who.name} from x ${x}: rescued ${r.rescues}x (${JSON.stringify(r.stuck?.slice(0, 2))})`);
    assert.ok(run.sim.p.x > 1562 && run.sim.p.y < 870, `${who.name} from x ${x}: ends at x ${Math.round(run.sim.p.x)} y ${Math.round(run.sim.p.y)}, not on the far bank`);
  }
});
