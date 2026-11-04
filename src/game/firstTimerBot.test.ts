/**
 * The first-timer bot's own self-test (bot-fix, 2026-11-01). The bot (tools/inspect/firsttimer.ts) is the measuring stick for bands,
 * curation, the first-timer checks and the "flown over" findings, so it is tested like game code, in the real engine on a bare world.
 *
 * The defect this guards: "stopped dead against something" measured his movement against lastX, which the end of the frame had already
 * set to where he is, so it read 0 every frame. Every 0.3 s of walking counted as a stop, and he hopped along flat ground (9 hops in
 * 10 s) and took off for a ledge up to ~1100 px before its end instead of edgeAim's 22-44 px.
 *
 * And the gaps those hops had been hiding (the same day): a fall back down a climb never led to a rescue (each fall moved his place back
 * down the way, so climbing back counted as progress); put past a puzzle room, he walked back into it, or stood on its top and it
 * "started again"; and a rescue put him back on the spot he had just failed. On main 6-3 and 1-4 ran out the clock on every roll.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { FirstTimerRun, firstTimer, freshPhone, FT_ADULT, FT_KID, type FirstTimer } from '../../tools/inspect/firsttimer.ts';
import type { Pad } from './realPlay.ts';
import type { Platform, Vine } from './types.ts';
import { GEN2_STAGES, KID_RUNS_59 } from './gen2/game.ts';
import { reachJump } from './physics.ts';
import { TRICK, vaultGap } from './w1Tricks.ts';

const Y = 580;
const ground = (id: number, x: number, width: number): Platform => ({ id, x, y: Y, width, height: 90, type: 'solid' }) as Platform;

/** a run on a bare world along a straight route at ground height, with every jump press he makes from the ground (x) */
function run(who: FirstTimer, seed: number, platforms: Platform[], cap: number) {
  const route = Array.from({ length: 250 }, (_, i) => ({ x: 100 + i * 24, y: Y }));
  const r = new FirstTimerRun('1-1', seed, who, { route, cap, rescueAfter: 1000 });
  r.sim.bare(platforms);
  r.sim.stand(100, Y);
  r.prog.relocate(r.sim.p);
  const presses: number[] = [];
  const frame = r.sim.frame.bind(r.sim);
  r.sim.frame = (pad?: Pad) => {
    if (pad?.press && r.sim.p.grounded) presses.push(r.sim.p.x);
    frame(pad);
  };
  r.play();
  return { r, presses };
}

const WHO: Array<[string, FirstTimer]> = [
  ['the adult (Normal)', FT_ADULT],
  ['the kid (Easy)', FT_KID],
];

for (const [name, who] of WHO) {
  test(`${name}: on flat ground he walks, never hops, and never "stops dead"`, () => {
    for (const seed of [1, 2, 3]) {
      const { r, presses } = run(who, seed, [ground(1, 0, 8000)], 10);
      assert.equal(presses.length, 0, `seed ${seed}: ${presses.length} hops on flat ground, at x ${presses.map(Math.round).join(', ')}`);
      assert.equal(r.stops.length, 0, `seed ${seed}: stopped dead ${r.stops.length} times with nothing in the way`);
      assert.ok(r.sim.p.x > 2000, `seed ${seed}: he walks on (x ${Math.round(r.sim.p.x)})`);
    }
  });

  test(`${name}: at a ledge's end he takes off within edgeAim of it, once, and gets across`, () => {
    const end = 1500;
    for (const seed of [1, 2, 3]) {
      for (const gap of [140, 200]) {
        const { r, presses } = run(who, seed, [ground(1, 0, end), ground(2, end + gap, 6000)], 12);
        assert.ok(presses.length >= 1, `seed ${seed}, gap ${gap}: no jump at the ledge`);
        const before = end - presses[0];
        // (he means to jump 22 + edgeAim px before the end; his thumb's lag only moves the press later, towards and a little past the
        // end, where the engine's coyote time still lets it go: never earlier than he meant)
        assert.ok(before <= 22 + who.edgeAim, `seed ${seed}, gap ${gap}: took off ${Math.round(before)} px before the end (edgeAim ${who.edgeAim})`);
        assert.ok(before >= -30, `seed ${seed}, gap ${gap}: pressed ${Math.round(-before)} px past the end`);
        assert.equal(presses.filter((x) => x < end - 120).length, 0, `seed ${seed}, gap ${gap}: hops on the way to the ledge`);
        assert.equal(r.harms.length, 0, `seed ${seed}, gap ${gap}: hurt (${JSON.stringify(r.harms)})`);
        assert.ok(r.sim.p.x > end + gap + 200, `seed ${seed}, gap ${gap}: across (x ${Math.round(r.sim.p.x)})`);
      }
    }
  });

  test(`${name}: he stops dead only where something really blocks him, and that is where he jumps`, () => {
    const face = 900;
    for (const seed of [1, 2, 3]) {
      const step = { id: 2, x: face, y: Y - 60, width: 300, height: 60, type: 'solid' } as Platform;
      const { r, presses } = run(who, seed, [ground(1, 0, 8000), step], 10);
      assert.ok(r.stops.length >= 1, `seed ${seed}: the 60 px step did not stop him`);
      for (const s of r.stops) assert.ok(s.x > face - 40 && s.x <= face, `seed ${seed}: a stop at x ${Math.round(s.x)}, not at the step's face (${face})`);
      assert.ok(Math.abs(r.stops[0].h - 60) < 4, `seed ${seed}: the step's height read ${r.stops[0].h}`);
      assert.equal(presses.filter((x) => x < face - 40).length, 0, `seed ${seed}: hops before the step, at x ${presses.map(Math.round).join(', ')}`);
      assert.ok(r.sim.p.x > face + 300, `seed ${seed}: up and over (x ${Math.round(r.sim.p.x)})`);
    }
  });
}

test('a climb he keeps falling back down: after the third fall from the same spot he is put past it, not left looping to the cap', () => {
  const P = (id: number, x: number, y: number, width: number, height = 30): Platform => ({ id, x, y, width, height, type: 'solid' }) as Platform;
  // (five 90 px steps up to a gap no jump crosses (580 px); a miss drops him to the ground, back near the start of the way)
  const steps = [[800, 490], [950, 400], [1100, 310], [1250, 220], [1400, 130]];
  const plats = [P(1, 0, Y, 3200, 90), ...steps.map(([x, y], i) => P(10 + i, x, y, 120)), P(20, 2100, 130, 900)];
  const route: Array<{ x: number; y: number }> = [];
  for (let x = 100; x < 800; x += 24) route.push({ x, y: Y });
  for (const [x, y] of steps) for (let k = 0; k < 120; k += 24) route.push({ x: x + k, y });
  for (let x = 1520; x < 3000; x += 24) route.push({ x, y: 130 });
  for (const [name, who] of WHO) {
    for (const seed of [1, 2, 3]) {
      const r = new FirstTimerRun('1-1', seed, who, { route, cap: 150 });
      r.sim.bare(plats);
      r.sim.stand(100, Y);
      r.prog.relocate(r.sim.p);
      let across = -1;
      const frame = r.sim.frame.bind(r.sim);
      r.sim.frame = (pad?: Pad) => {
        frame(pad);
        const p = r.sim.p;
        if (across < 0 && p.grounded && p.x > 2100 && Math.abs(p.y - 130) < 4) across = r.sim.t;
      };
      r.play();
      assert.ok(across > 0 && across < 100, `${name}, seed ${seed}: never put across the gap (at x ${Math.round(r.sim.p.x)}, ${r.rescues} rescues)`);
      assert.ok(r.stuck.some((q) => q.what === 'fell back down from here 3 times'), `${name}, seed ${seed}: the loop is not reported`);
    }
  }
});

test("put past a puzzle room he goes on from there, not back into it: 6-3's seesaw reaches the shrine (the kid, every roll)", () => {
  // (the route runs through the room's far wall there: placed at the nearest point, he walked back into the room until the cap)
  for (const seed of [1, 2, 3]) {
    const r = firstTimer('6-3', seed, FT_KID);
    assert.equal(r.end, 'shrine', `6-3 seed ${seed}: ${r.end} at ${r.time} s, x ${r.x}`);
  }
});

test("a room starts again only when he has fallen back down into it, never while he stands on its top (1-4's lift)", () => {
  // (1-4's lift puts him on its own top, inside its box, and the way on crosses back over it: standing there 12 s later started the
  // room again, every 12 s until the cap)
  type Room = { box: { x0: number; x1: number; y0: number; y1: number }; beyond?: { x: number; y: number } };
  for (const who of [FT_KID, FT_ADULT]) {
    for (const seed of [1, 2, 3]) {
      freshPhone(who.setting);
      const r = new FirstTimerRun('1-4', seed, who, { cap: 200 });
      const rooms = ((r.e as unknown as { kit?: { rooms: Room[] } }).kit?.rooms ?? []).filter((q) => q.beyond);
      assert.ok(rooms.length > 0, '1-4 has its lift rooms');
      const bad: string[] = [];
      const seen = new Set<number>();
      let starts = 0;
      // (judged where he stands as the room starts: a lift can carry him up during the moment he waits there)
      const host = r as unknown as { puzzleWait: { room: number } | null };
      const frame = r.sim.frame.bind(r.sim);
      let was: unknown = null;
      r.sim.frame = (pad?: Pad) => {
        frame(pad);
        const w = host.puzzleWait;
        if (w && w !== was) {
          starts++;
          const room = ((r.e as unknown as { kit: { rooms: Room[] } }).kit.rooms)[w.room];
          // (a room's first start is judged by nothing here: only its starting again)
          const again = seen.has(w.room);
          seen.add(w.room);
          if (again && room.beyond && r.sim.p.y < room.beyond.y + 40) bad.push(`at ${Math.round(r.sim.t)} s from y ${Math.round(r.sim.p.y)} (its top ${room.beyond.y})`);
        }
        was = w;
      };
      r.play();
      assert.ok(starts >= 1, `${who.name} seed ${seed}: never worked a room`);
      assert.deepEqual(bad, [], `${who.name} seed ${seed}: the room started again while he stood on it`);
    }
  }
});

test('a rescue from no further on than the last one puts him further on, never back on the spot he just failed', () => {
  const route = Array.from({ length: 200 }, (_, i) => ({ x: 100 + i * 24, y: Y }));
  const r = new FirstTimerRun('1-1', 1, FT_ADULT, { route, cap: 1 });
  r.sim.bare([ground(1, 0, 8000)]);
  const at: number[] = [];
  for (let k = 0; k < 3; k++) {
    // (back where he was, no further on: as after a fall)
    r.sim.stand(300, Y);
    r.prog.relocate(r.sim.p);
    (r as unknown as { rescue(): boolean }).rescue();
    at.push(Math.round(r.sim.p.x));
  }
  assert.ok(at[1] > at[0] && at[2] > at[1], `put at x ${at.join(', ')}`);
});

test("5-9's Easy goal rests on the kid's runs: re-measured, they are still the ones recorded (gen2/game.ts KID_RUNS_59)", () => {
  // (as they were measured: Easy's goal at the 65% floor, so the shrine does not stop him before he has beaten what he will beat)
  const entry = GEN2_STAGES['5-9'] as { easyGoal?: number };
  const kept = entry.easyGoal;
  entry.easyGoal = undefined;
  try {
    const runs: number[] = [];
    for (const seed of [1, 2, 3]) for (const trial of [0, 1]) runs.push(firstTimer('5-9', seed, FT_KID, { trial }).goal?.got ?? -1);
    assert.deepEqual(runs, [...KID_RUNS_59], 'the kid bot or 5-9 changed: re-measure, and set the goal from the new runs (goals.ts kidMedian)');
  } finally {
    entry.easyGoal = kept;
  }
});

// ---- the mushroom's bounce (fix-petals, 2026-11-04) ----
// 1-1's high runs: a mushroom on the floor up to branches 245 px over it (one bounce rises about 180), double-jump gaps between them, an
// earth wall at the end only they reach. The bot never flicked a second time after a bounce, walked off the branches and was rescued at
// the foot of every wall (10-21 times a run on 1-1).
const shroomWorld = (): Platform[] => {
  const P = (id: number, x: number, y: number, width: number, height = 24, type: Platform['type'] = 'solid'): Platform => ({ id, x, y, width, height, type }) as Platform;
  return [
    P(1, 0, Y, 1760, 90), // the floor, to the wall's foot
    P(2, 900, Y - 30, 70, 30, 'bouncy'), // the mushroom
    P(3, 940, Y - 245, 210), // branch A
    P(4, 1360, Y - 245, 200), // branch B, 210 px on (a double)
    P(5, 1760, Y - 245, 1600, 245), // the earth wall and the high ground past it
  ];
};
const shroomRoute = (): Array<{ x: number; y: number }> => {
  const pts: Array<{ x: number; y: number }> = [];
  for (let x = 100; x < 940; x += 24) pts.push({ x, y: Y });
  for (let x = 940; x < 3300; x += 24) pts.push({ x, y: Y - 245 });
  return pts;
};
function shroomRun(who: FirstTimer, seed: number, taught: boolean, id = '1-1') {
  const r = new FirstTimerRun(id, seed, who, { route: shroomRoute(), cap: 40, rescueAfter: 1000 });
  r.sim.bare(shroomWorld());
  r.sim.stand(300, Y);
  r.prog.relocate(r.sim.p);
  if (taught) (r as unknown as { learned: Set<string> }).learned.add('double');
  let up = -1;
  const frame = r.sim.frame.bind(r.sim);
  r.sim.frame = (pad?: Pad) => {
    frame(pad);
    const p = r.sim.p;
    if (up < 0 && p.grounded && p.x > 1800 && Math.abs(p.y - (Y - 245)) < 4) up = r.sim.t;
  };
  r.play();
  return { r, up };
}
for (const [name, who] of WHO) {
  test(`${name}: taught the second jump, a mushroom's bounce takes him up to the branches, across a double gap and onto the wall's top`, () => {
    let made = 0;
    for (const seed of [1, 2, 3, 4, 5]) {
      const { r, up } = shroomRun(who, seed, true);
      // (up on his own: before the fix every run got there only by a rescue, 18-33 s in)
      if (up > 0 && r.rescues === 0) made++;
    }
    // (a first-timer's thumb can still miss a double now and then: most runs make it)
    assert.ok(made >= 4, `${made} of 5 got up onto the high ground without a rescue`);
  });
  test(`${name}: before Dot's tip teaches the second jump, his first bounce is a plain one (a double only after it fell short)`, () => {
    for (const seed of [1, 2]) {
      const { r } = shroomRun(who, seed, false);
      const first = r.tries.find((t) => Math.abs(t.y - (Y - 30)) < 6 && t.x > 860 && t.x < 1000);
      assert.ok(first, `seed ${seed}: no bounce tried`);
      assert.equal(first.kind, 'single', `seed ${seed}: the first bounce was a ${first.kind}, untaught`);
    }
  });
  test(`${name}: on a stage after 1-1 (whose hint teaches it) he knows the second jump from the start, and the first bounce takes him up`, () => {
    let made = 0;
    for (const seed of [1, 2, 3]) {
      const { r, up } = shroomRun(who, seed, false, '1-5');
      const first = r.tries.find((t) => Math.abs(t.y - (Y - 30)) < 6 && t.x > 860 && t.x < 1000);
      assert.equal(first?.kind, 'double', `seed ${seed}`);
      if (up > 0 && r.rescues === 0) made++;
    }
    assert.ok(made >= 2, `${made} of 3 got up without a rescue`);
  });
}

// ---- off a trunk's top on to a ledge's very edge (fix-petals, 2026-11-04, R-150.8: 1-4's climbs) ----
// 1-4 layout 1 at x 2229-2346: a trunk on a branch, the next branch 85 px to the left and 30 px up. He leapt off the trunk's top to the left,
// came down 7 px from the branch's end at a run, and "the thumb comes back down" held the way on for 0.1 s: off the end, to the foot of
// the trunk again, three times, then a rescue (1-4: 55-58 rescues a run on seeds 1-3). Copied from the stage, 5045 px lower.
const trunkWorld = (): { plats: Platform[]; vines: Vine[] } => ({
  plats: [
    { id: 11, x: 2286, y: Y, width: 194, height: 24, type: 'solid', style: 'branch' } as Platform,
    { id: 12, x: 2306, y: Y - 289, width: 313, height: 24, type: 'solid', style: 'branch' } as Platform,
    { id: 13, x: 2000, y: Y - 319, width: 221, height: 24, type: 'solid', style: 'branch' } as Platform,
    { id: 20, x: 1600, y: Y, width: 686, height: 90, type: 'solid' } as Platform, // (the ground at the trunk's foot, as on the stage: a miss is tried again)
  ],
  vines: [{ id: 7, x: 2346, topY: Y - 291, bottomY: Y - 6, swaySpeed: 0.9, swayPhase: 3.862, vineType: 'tree_climb', treeId: 7 } as Vine],
});
const trunkRoute = (): Array<{ x: number; y: number }> => {
  const pts: Array<{ x: number; y: number }> = [];
  for (let x = 2470; x > 2346; x -= 24) pts.push({ x, y: Y });
  for (let y = Y; y > Y - 289; y -= 24) pts.push({ x: 2346, y });
  for (let x = 2346; x > 2010; x -= 24) pts.push({ x, y: x > 2221 ? Y - 289 : Y - 319 });
  return pts;
};
for (const [name, who] of WHO) {
  test(`${name}: up a trunk and off its top on to a branch's edge, he stops and jumps the gap instead of running off the end`, () => {
    let made = 0, offs = 0;
    const notes: string[] = [];
    for (const seed of [1, 2, 3, 4, 5]) {
      const w = trunkWorld();
      // (as '1-1': under the id '1-4' the stage's own puzzle rooms, a squirrel lift at x 2020, took him over in the bare world)
      const r = new FirstTimerRun('1-1', seed, who, { route: trunkRoute(), cap: 30, rescueAfter: 1000 });
      r.sim.bare(w.plats, w.vines);
      r.sim.stand(2470, Y);
      r.prog.relocate(r.sim.p);
      let on13 = -1, off = 0, was12 = false;
      const frame = r.sim.frame.bind(r.sim);
      r.sim.frame = (pad?: Pad) => {
        frame(pad);
        const p = r.sim.p;
        if (on13 < 0 && p.grounded && r.sim.standingOn === 13) on13 = r.sim.t;
        // (off the branch's end with no jump pressed: what he did at every 1-4 trunk top)
        if (on13 < 0 && was12 && !p.grounded && !pad?.jump && !pad?.press && p.x < 2306) off++;
        was12 = p.grounded && r.sim.standingOn === 12;
      };
      r.play();
      offs += off;
      notes.push(`seed ${seed}: on the far branch at ${on13.toFixed(1)} s, ran off the end ${off} times, ${r.rescues} rescues`);
      if (on13 > 0 && r.rescues === 0) made++;
    }
    assert.equal(offs, 0, notes.join('; '));
    assert.ok(made >= 4, notes.join('; '));
  });
}

// ---- World 1's tricks, learned only from Dot's words (w8-rope2, 2026-11-04, R-159.1) ----
// The bot answers a dazed lunge snake and a coiled boa only once Dot's words have taught him the answer ("hop on it", "kick it"), as a real
// first-timer does; until then he does what a first-timer does. An animal without World 1's tag is met exactly as before.
type Foe = { id: number; type: string; x: number; trick?: string; state?: string; stagger?: number; staggerMax?: number; patrolMinX?: number; patrolMaxX?: number; defeated: boolean };
function foe(type: 'snake' | 'boa', x: number, o: Partial<Foe> = {}) {
  const boa = type === 'boa';
  return {
    id: 1, type, x, y: Y - (boa ? 16 : 14), vx: 0, vy: 0, width: boa ? 58 : 38, height: boa ? 26 : 22, hp: boa ? 3 : 1, maxHp: boa ? 3 : 1,
    facing: -1, patrolMinX: x - 6, patrolMaxX: x + 6, attackCooldown: 99, telegraphTimer: 0, isAttacking: false, animTimer: 0, hitFlashTimer: 0,
    defeated: false, koTimer: 0, behaviorTimer: 0, edgeMinX: 0, edgeMaxX: 8000, ...o,
  };
}
/** a bare-world run past one animal at x 1000 (far enough that the kid, who looks up only after his first 1.2 s, sees it coming), with
 *  the moves he already knows; every pad he presses near it is kept */
function foeRun(who: FirstTimer, seed: number, id: string, m: ReturnType<typeof foe>, knows: string[] | null, cap = 12) {
  const route = Array.from({ length: 120 }, (_, i) => ({ x: 100 + i * 24, y: Y }));
  const r = new FirstTimerRun(id, seed, who, { route, cap, rescueAfter: 1000 });
  r.sim.bare([ground(1, 0, 8000)]);
  r.sim.e.enemies = [m as never];
  r.sim.stand(300, Y);
  r.prog.relocate(r.sim.p);
  const learned = (r as unknown as { learned: Set<string> }).learned;
  // (null: what he knows from the stages before this one, as the stage starts)
  if (knows) {
    learned.clear();
    for (const k of knows) learned.add(k);
  }
  const pads: string[] = [];
  let punches = 0, kicks = 0, stomped = false, rolled = false;
  const frame = r.sim.frame.bind(r.sim);
  r.sim.frame = (pad?: Pad) => {
    // (a dazed snake stays dazed while he comes: the case is his choice, not the daze running out)
    if (m.trick === 'lunge' && !m.defeated) m.stagger = m.staggerMax = 4;
    const near = Math.abs(r.sim.p.x - m.x) < 160;
    if (near && pad?.punch) punches++;
    if (near && pad?.kick) kicks++;
    if (near) pads.push(JSON.stringify(pad ?? {}));
    const vy = r.sim.p.vy;
    frame(pad);
    if (m.defeated && vy > 0 && r.sim.p.vy < 0) stomped = true;
    if (m.state === 'roll') rolled = true;
  };
  r.play();
  return { r, punches, kicks, stomped, rolled, pads };
}
for (const [name, who] of WHO) {
  test(`${name}: a dazed snake: until Dot says "hop on it" he walks past it; once told, he hops on it (a stomp)`, () => {
    for (const seed of [1, 2, 3]) {
      const before = foeRun(who, seed, '1-1', foe('snake', 1000, { trick: 'lunge', state: 'patrol', stagger: 4, staggerMax: 4 }), ['punch']);
      assert.equal(before.stomped, false, `seed ${seed}: untaught, he stomped it`);
      assert.ok(before.r.sim.p.x > 1400, `seed ${seed}: untaught, he walks on past it (x ${Math.round(before.r.sim.p.x)})`);
      const after = foeRun(who, seed, '1-1', foe('snake', 1000, { trick: 'lunge', state: 'patrol', stagger: 4, staggerMax: 4 }), ['punch', 'stomp']);
      assert.ok(after.stomped, `seed ${seed}: told to hop on it, he did not stomp it`);
    }
  });
  test(`${name}: a coiled boa: once told "kick", he kicks it (it rolls); told only to punch, he punches it once and no more`, () => {
    for (const seed of [1, 2, 3]) {
      const b = foe('boa', 1000, { trick: 'coil', state: 'coil' });
      const kicked = foeRun(who, seed, '1-1', b, ['punch', 'kick']);
      assert.ok(kicked.kicks >= 1, `seed ${seed}: told to kick, he never kicked`);
      assert.equal(kicked.punches, 0, `seed ${seed}: told to kick, he punched ${kicked.punches} times`);
      assert.ok(kicked.rolled, `seed ${seed}: the kick did not roll it (${b.state})`);
      const punched = foeRun(who, seed, '1-1', foe('boa', 1000, { trick: 'coil', state: 'coil' }), ['punch']);
      assert.ok(punched.punches <= 1, `seed ${seed}: he punched the coiled boa ${punched.punches} times`);
      assert.equal(punched.kicks, 0, `seed ${seed}: untaught, he kicked it`);
    }
  });
  test(`${name}: an animal without World 1's trick, outside World 1, is met exactly as before: knowing the stomp and kick changes nothing`, () => {
    for (const type of ['snake', 'boa'] as const) {
      for (const seed of [1, 2]) {
        const plain = foeRun(who, seed, '3-1', foe(type, 1000), ['punch'], 8);
        const knows = foeRun(who, seed, '3-1', foe(type, 1000), ['punch', 'stomp', 'kick'], 8);
        assert.ok(plain.pads.length > 0, `${type} seed ${seed}: he never came near it`);
        assert.deepEqual(knows.pads, plain.pads, `${type} seed ${seed}: knowing the stomp and kick changed how he meets an untricked ${type}`);
      }
    }
  });
}

for (const [name, who] of WHO) {
  test(`${name}: on a stage after the one whose hint teaches it, he knows the stomp (after 1-3) and the kick (after 1-9) from the start`, () => {
    const knows = (id: string) => (new FirstTimerRun(id, 1, who, { route: [{ x: 100, y: Y }], cap: 1, rescueAfter: 1000 }) as unknown as { learned: Set<string> }).learned;
    assert.ok(!knows('1-2').has('stomp'), 'before 1-3 he does not know the stomp');
    assert.ok(knows('1-5').has('stomp'), 'after 1-3 he knows the stomp');
    assert.ok(!knows('1-8').has('kick'), 'before 1-9 he does not know the kick');
    assert.ok(knows('2-1').has('kick'), 'after 1-9 he knows the kick');
    for (const seed of [1, 2]) {
      const s = foeRun(who, seed, '1-5', foe('snake', 1000, { trick: 'lunge', state: 'patrol', stagger: 4, staggerMax: 4 }), null);
      assert.ok(s.stomped, `seed ${seed}: on 1-5 he did not stomp the dazed snake`);
      const b = foeRun(who, seed, '2-1', foe('boa', 1000, { trick: 'coil', state: 'coil' }), null);
      assert.ok(b.kicks >= 1 && b.rolled, `seed ${seed}: on 2-1 he did not kick the coiled boa (${b.kicks} kicks)`);
    }
  });
}

// the stomp vault (1-3's first vault, "Stomp it, thumb on the glass, and fly!"): a drop past any jump with a lunge snake on its lip
function vaultRun(who: FirstTimer, seed: number, knows: string[]) {
  const edge = 1500, gap = vaultGap(reachJump(0, true)), far = edge + gap;
  const route = [...Array.from({ length: 60 }, (_, i) => ({ x: 100 + i * 24, y: Y })).filter((q) => q.x < edge), ...Array.from({ length: 60 }, (_, i) => ({ x: far + 20 + i * 24, y: Y }))];
  const r = new FirstTimerRun('1-1', seed, who, { route, cap: 14, rescueAfter: 1000 });
  r.sim.bare([ground(1, 0, edge), ground(2, far, 3000)]);
  const s = foe('snake', edge - TRICK.vaultLip, { trick: 'lunge', state: 'patrol', patrolMinX: edge - TRICK.vaultLip - 6, patrolMaxX: edge - TRICK.vaultLip + 6 });
  r.sim.e.enemies = [s as never];
  r.sim.stand(300, Y);
  r.prog.relocate(r.sim.p);
  const learned = (r as unknown as { learned: Set<string> }).learned;
  learned.clear();
  for (const k of knows) learned.add(k);
  let across = -1;
  const frame = r.sim.frame.bind(r.sim);
  r.sim.frame = (pad?: Pad) => {
    frame(pad);
    if (across < 0 && r.sim.p.grounded && r.sim.p.x > far + 10 && Math.abs(r.sim.p.y - Y) < 4) across = r.sim.t;
  };
  r.play();
  return { r, across, far };
}
for (const [name, who] of WHO) {
  test(`${name}: the stomp vault: untaught he never gets across the drop; told "stomp it, thumb on the glass, and fly", he dazes the snake on its lip and vaults over`, () => {
    let made = 0;
    const notes: string[] = [];
    for (const seed of [1, 2, 3, 4, 5]) {
      const before = vaultRun(who, seed, ['punch', 'stomp', 'double']);
      assert.equal(before.across, -1, `seed ${seed}: untaught, he got across at ${before.across} s`);
      const after = vaultRun(who, seed, ['punch', 'stomp', 'double', 'vault']);
      notes.push(`seed ${seed}: across at ${after.across.toFixed(1)} s, x ${Math.round(after.r.sim.p.x)} y ${Math.round(after.r.sim.p.y)} far ${after.far} harms ${after.r.harms.map((h) => h.cause).join(",")}`);
      if (after.across > 0) made++;
    }
    // (a first-timer's thumb can miss the hop now and then: most runs make it)
    assert.ok(made >= 4, notes.join('; '));
  });
}
