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
import { FirstTimerRun, FT_ADULT, FT_KID, FT_MIDDLE, hopCatches } from './firsttimer.ts';
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
