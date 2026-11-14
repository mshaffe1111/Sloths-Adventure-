/**
 * RIDE as a piece any world lays (rideLay.ts, ridePlay.ts, ride.ts on B14's stage beat): the rows, the path, the emitters and the
 * fairness check, each with a planted fault (reference/qa-reports/PIECES/planted-faults.py); three worlds' kits through the real
 * pipeline; and the ride in the real engine at 30 fps (realPlay.ts): it keeps its beat, carries him across and up, and brings him back.
 */
import '../headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { beatClock } from '../beat.ts';
import { RealPlay } from '../realPlay.ts';
import type { Ride } from '../ride.ts';
import type { ClockDef } from '../stageKit.types.ts';
import type { Platform } from '../types.ts';
import { generateAllLevels } from '../worldsData.ts';
import { buildGen2Stage } from './pipeline.ts';
import { cfg, kit as toyKit } from './toyWorld.ts';
import type { FilledSocket, SectionTemplate, StageSink, WorldKit } from './types.ts';
import { RIDE_LAY, RIDE_RULE, RIDE_TAG, rideClock, rideEmitters, rideFaults, ridePath, rideProps, rideSocket, rideTag, type RideTable } from './rideLay.ts';
import { w6Kit } from './worlds/w6.ts';
import { w8Kit } from './worlds/w8.ts';

const G = 580;
const plat = (id: number, x: number, width: number, y = G, more: Partial<Platform> = {}): Platform => ({ id, x, y, width, height: 90, type: 'solid', ...more });
const sink = (platforms: Platform[]): StageSink => {
  let n = 100;
  return { platforms, enemies: [], collectibles: [], proto: { hints: [], covers: [], beats: [] }, extras: {}, zones: [], nextPlatformId: () => n++, nextCollectibleId: () => n++, nextEnemyId: () => n++ };
};
const fill = (what: string, x: number, y = G): FilledSocket => ({ section: 's', socket: 'ferry', role: 'prop', what, x, y });

/** a river world's table: a log on the current and a lily pad two lanes apart on one beat; a basket lift on its own, eased */
const TABLE: RideTable = {
  beats: { river: { period: 5, tell: 1, on: 2, easyStretch: 1.3 }, hoist: { period: 6, tell: 1.2, on: 2.4, easyStretch: 1.3 } },
  rides: {
    log: { way: 'across', w: 50, h: 22, beat: 'river', style: 'log', lanes: 2, looks: ['logA', 'logB'] },
    lift: { way: 'up', w: 70, h: 18, beat: 'hoist', smooth: true },
  },
};
const prop = (id: string) => rideProps(TABLE).find((p) => p.id === id)!;

test("a world's ride table gives its props by tag, its beats as stage clocks, and the socket any section lists", () => {
  assert.deepEqual(rideProps(TABLE), [
    { id: 'log', tags: ['ride', 'ride-across'], w: 50, minApart: 400, beat: true, looks: ['logA', 'logB'] },
    { id: 'lift', tags: ['ride', 'ride-up'], w: 70, minApart: 400, beat: true },
  ]);
  assert.deepEqual(rideSocket('ferry', 'a'), { id: 'ferry', role: 'prop', on: 'a', t: 0.97, allow: [RIDE_TAG] });
  assert.deepEqual(rideSocket('ferry', 'a', 'up').allow, [rideTag('up')]);
  assert.deepEqual(rideClock('river', TABLE.beats.river),
    { id: 'river', phases: [{ name: 'off', seconds: 2 }, { name: 'warn', seconds: 1 }, { name: 'on', seconds: 2 }], offset: 0, easyStretch: 1.3 });
});

test('the path: across to the next bank at its level, a step off each; up beside the ledge above; none where there is no bank, no room, or a stone in the way', () => {
  const a = plat(1, 0, 400), b = plat(2, 600, 400);
  assert.deepEqual(ridePath([a, b], a, { way: 'across', w: 50 }), [{ x: 400 + RIDE_LAY.gap, y: G }, { x: 600 - RIDE_LAY.gap - 50, y: G }]);
  assert.equal(ridePath([a], a, { way: 'across', w: 50 }), null, 'no bank ahead');
  assert.equal(ridePath([a, plat(2, 500, 400)], a, { way: 'across', w: 50 }), null, 'a 100 px gap leaves a 50 px ride 38 px to travel: not worth a ride');
  assert.equal(ridePath([a, plat(2, 600, 400, G - 40)], a, { way: 'across', w: 50 }), null, 'the next bank is a step up: a log does not climb');
  assert.equal(ridePath([a, b, plat(3, 480, 40, G + 20)], a, { way: 'across', w: 50 }), null, 'a stone in the water: the lay already has its way over');
  assert.deepEqual(ridePath([a, b, plat(3, 480, 40, G + 400)], a, { way: 'across', w: 50 })?.[0], { x: 406, y: G }, 'a pit floor far below is no stone');
  const ledge = plat(4, 490, 300, G - 200);
  assert.deepEqual(ridePath([a, ledge], a, { way: 'up', w: 70 }), [{ x: 410, y: G }, { x: 410, y: G - 200 }], 'centred in the slot: 10 px from each');
  assert.equal(ridePath([a, plat(4, 460, 300, G - 200)], a, { way: 'up', w: 70 }), null, 'no room for the lift between them');
  assert.equal(ridePath([a, plat(4, 520, 300, G - 200)], a, { way: 'up', w: 70 }), null, 'a slot so wide a straight lift is a hop from one of them');
  assert.equal(ridePath([a, b], a, { way: 'up', w: 70 }), null, 'nothing above');
});

test('a filled socket lays its ride over the gap after its piece: a moving platform on its beat, the beat listed once, its lane rolled from the spot', () => {
  const out = sink([plat(1, 0, 400), plat(2, 600, 400), plat(3, 1200, 400), plat(4, 1690, 300, G - 200)]);
  const noted: Array<{ id: number; way: string; look: string }> = [];
  const emit = rideEmitters(TABLE, (_o, at) => noted.push({ id: at.id, way: at.way, look: at.look }));
  emit.log(fill('log', 390), prop('log'), out);
  emit.log(fill('log', 990), prop('log'), out);
  emit.lift(fill('lift', 1590), prop('lift'), out);
  const rides = out.platforms.filter((p) => p.ride);
  assert.deepEqual(rides.map((p) => [p.type, p.x, p.y, p.width, p.height, p.style ?? '']), [['moving', 406, G, 50, 22, 'log'], ['moving', 1006, G, 50, 22, 'log'], ['moving', 1610, G, 70, 18, '']]);
  assert.deepEqual(rides[0].ride!.path, [{ x: 406, y: G }, { x: 544, y: G }]);
  assert.deepEqual(rides[2].ride, { clock: 'hoist', path: [{ x: 1610, y: G }, { x: 1610, y: G - 200 }], w: 70, smooth: true });
  assert.deepEqual(out.clocks!.map((c) => c.id), ['river', 'hoist'], 'each beat once, however many ride it');
  for (const p of rides.slice(0, 2)) assert.ok(p.ride!.shift === undefined || p.ride!.shift === 2.5, 'a lane of two on a 5 s beat is in step or half a beat on');
  assert.equal(noted.length, 3);
  assert.match(noted[0].look, /^log[AB]$/);
  assert.deepEqual(rideFaults(out), [], 'and what it laid is fair');
  // (a socket with no bank ahead lays nothing: no ride, no beat, no note)
  const bare = sink([plat(1, 0, 400)]);
  emit.log(fill('log', 390), prop('log'), bare);
  assert.deepEqual([bare.platforms.length, bare.clocks, noted.length], [1, undefined, 3]);
});

const river: ClockDef = rideClock('river', TABLE.beats.river);
const ride = (id: number, path: Ride['path'], more: Partial<Ride> = {}, w = 50): Platform => ({ id, x: path[0].x, y: path[0].y, width: w, height: 22, type: 'moving', ride: { clock: 'river', path, w, ...more } });
const banks = [plat(1, 0, 400), plat(2, 600, 400)];
const across = [{ x: 406, y: G }, { x: 544, y: G }];

test('the fairness check names each planted fault, and passes the same ride laid fair', () => {
  assert.deepEqual(rideFaults({ platforms: [...banks, ride(9, across)], clocks: [river] }), []);
  // planted: its beat is not in the stage
  assert.deepEqual(rideFaults({ platforms: [...banks, ride(9, across)], clocks: [] }), ['ride 9: its beat river is not in the stage']);
  // planted: a warning under the rule's second
  assert.match(rideFaults({ platforms: [...banks, ride(9, across)], clocks: [rideClock('river', { period: 5, tell: 0.5, on: 2 })] }).join(), /its warning is 0.5 s, under 1 s/);
  // planted: it barely stops (0.8 s at each end)
  assert.match(rideFaults({ platforms: [...banks, ride(9, across)], clocks: [rideClock('river', { period: 3.8, tell: 1, on: 3 })] }).join(), /it stands 0.8 s at a stop, under 1.2 s/);
  // planted: too fast (138 px in 0.6 s); and an eased ride's peak counts (138 px in 1.2 s is 115 px/s even, 173 at its peak)
  assert.match(rideFaults({ platforms: [...banks, ride(9, across)], clocks: [rideClock('river', { period: 5, tell: 1, on: 0.6 })] }).join(), /it travels at 230 px\/s, over 143/);
  assert.deepEqual(rideFaults({ platforms: [...banks, ride(9, across)], clocks: [rideClock('river', { period: 5, tell: 1, on: 1.2 })] }), []);
  assert.match(rideFaults({ platforms: [...banks, ride(9, across, { smooth: true })], clocks: [rideClock('river', { period: 5, tell: 1, on: 1.2 })] }).join(), /it travels at 173 px\/s/);
  // planted: it stops short of the far bank (he cannot step off), and it starts away from the near one
  assert.deepEqual(rideFaults({ platforms: [...banks, ride(9, [across[0], { x: 500, y: G }])], clocks: [river] }), ['ride 9: at its far stop no bank is in stepping reach']);
  assert.deepEqual(rideFaults({ platforms: [...banks, ride(9, [{ x: 440, y: G }, across[1]])], clocks: [river] }), ['ride 9: at its first stop no bank is in stepping reach']);
  // planted: a lift that rises through a ledge
  const up = [{ x: 410, y: G }, { x: 410, y: G - 200 }];
  const ledge = plat(4, 490, 300, G - 200);
  assert.deepEqual(rideFaults({ platforms: [banks[0], ledge, ride(9, up, {}, 70)], clocks: [river] }), []);
  assert.deepEqual(rideFaults({ platforms: [banks[0], ledge, plat(5, 430, 40, G - 120, { height: 20 }), ride(9, up, {}, 70)], clocks: [river] }), ['ride 9: it passes through piece 5']);
  // planted: a lift a hop from the piece below (24 px off its end)
  assert.deepEqual(rideFaults({ platforms: [banks[0], plat(4, 500, 300, G - 200), ride(9, [{ x: 424, y: G }, { x: 424, y: G - 200 }], {}, 70)], clocks: [river] }), ['ride 9: at its first stop no bank is in stepping reach']);
  // planted: two rides seen together leaving at the same moment (one thing at a time), and the same two half a beat apart
  const two = (shift?: number) => [...banks, plat(3, 800, 0), ride(9, across), ride(10, [{ x: 406, y: G - 150 }, { x: 544, y: G - 150 }], shift ? { shift } : {})];
  assert.match(rideFaults({ platforms: [...two(), plat(6, 0, 400, G - 150), plat(7, 600, 400, G - 150)], clocks: [river] }).join(), /ride 9 and ride 10: their warnings start within 0.4 s/);
  assert.deepEqual(rideFaults({ platforms: [...two(2.5), plat(6, 0, 400, G - 150), plat(7, 600, 400, G - 150)], clocks: [river] }), []);
});

// ───────────────────────────── three worlds' kits, through the real pipeline ─────────────────────────────

const ferry: SectionTemplate = {
  id: 'x-ferry', name: 'the ferry', archetypes: 'any', phases: ['start', 'rest', 'ki', 'sho', 'ten', 'ketsu', 'goal'], difficulty: 1,
  // (a double jump's gap: the ride is the other way over it)
  pieces: [{ key: 'a', shape: 'bank', w: [300, 360], place: { kind: 'start' } }, { key: 'b', shape: 'bank', w: [300, 360], place: { kind: 'double', after: 'a', share: [0.85, 0.95], dy: 0 }, landing: true }],
  entry: { piece: 'a', kind: 'ground' }, exit: { piece: 'b', kind: 'ground' }, exitDy: 0,
  sockets: [rideSocket('ferry', 'a', 'across')], mirrorable: false, weight: 9,
};
const withRides = (k: WorldKit, note?: Parameters<typeof rideEmitters>[1]): WorldKit =>
  ({ ...k, manifest: { ...k.manifest, sections: [...k.manifest.sections, ferry], props: [...k.manifest.props, ...rideProps(TABLE)] }, emit: { ...k.emit, ...rideEmitters(TABLE, note) } });
const levels = generateAllLevels();
const lv = (id: string) => ({ ...levels.find((l) => l.id === id)!, unlocked: true });

for (const [name, kit, config] of [['the toy world', toyKit, cfg('5-7', 'stealth')], ["World 6's kit (6-2)", w6Kit(2), lv('6-2')], ["World 8's kit (8-2)", w8Kit(2), lv('8-2')]] as const) {
  test(`laid through the real pipeline, ${name} (6 seeds, both settings): the rides stand on their beat between two banks, the stage carries the beat, and every one is fair`, () => {
    let rides = 0;
    for (const d of ['normal', 'easy'] as const) for (let seed = 1; seed <= 6; seed++) {
      const st = buildGen2Stage({ config, kit: withRides(kit), seed, difficulty: d });
      assert.deepEqual(st.gen2.errors ?? [], [], `${d} ${seed}`);
      const laid = st.platforms.filter((p) => p.ride);
      rides += laid.length;
      if (laid.length) assert.deepEqual((st.clocks ?? []).map((c) => c.id), ['river'], `${d} ${seed}: the stage carries the beat its rides keep`);
      assert.deepEqual(rideFaults(st, RIDE_RULE, d === 'easy'), [], `${d} ${seed}`);
      for (const p of laid) {
        assert.equal(p.type, 'moving');
        assert.ok(p.ride!.path[1].x - p.ride!.path[0].x >= RIDE_LAY.travel, 'it has somewhere to go');
        assert.equal(new Set(st.platforms.map((q) => q.id)).size, st.platforms.length, 'its id is its own');
      }
    }
    assert.ok(rides >= 6, `rides laid: ${rides}`);
  });
}

// ───────────────────────────── the real engine, 30 fps ─────────────────────────────

type Eng = { clock: ReturnType<typeof beatClock>; softOn: boolean };
function host(platforms: Platform[], clocks: ClockDef[], easy = false): RealPlay {
  const r = new RealPlay('1-1', 1);
  r.bare(platforms);
  const e = (r as unknown as { e: Eng }).e;
  e.clock = beatClock(clocks, easy, 0);
  return r;
}

test('in the real engine: the log waits out its warning, carries him across with his feet on it, waits, and brings him back; he never slips and never drops', () => {
  const log = ride(9, across);
  const r = host([plat(1, 0, 400), plat(2, 600, 400), log], [river]);
  r.stand(430, G);
  r.wait(0.2);
  assert.equal(r.standingOn, 9, 'he is standing on the log');
  r.wait(2.7);
  assert.deepEqual([log.x, Math.round(r.p.x)], [406, 430], 'through the quiet and the warning (3 s) it has not moved');
  let onIt = 0, frames = 0;
  for (let t = 2.9; t < 5.2; t += 1 / 30) {
    r.frame();
    frames++;
    if (r.standingOn === 9 && Math.abs(r.p.y - log.y) < 1) onIt++;
  }
  assert.equal(onIt, frames, 'on it every frame of the trip');
  assert.equal(log.x, 544, 'at the far bank');
  assert.ok(Math.abs(r.p.x - (430 + 138)) < 1.5, `carried the whole way: ${r.p.x}`);
  r.wait(5);
  assert.equal(log.x, 406, 'and a beat later it has brought him back');
  assert.ok(Math.abs(r.p.x - 430) < 1.5);
  assert.equal(r.died, false);
});

test('in the real engine: the lift carries him up to the ledge and down again, eased, and Easy stretches its beat', () => {
  const up = [{ x: 410, y: G }, { x: 410, y: G - 200 }];
  const hoist = rideClock('hoist', TABLE.beats.hoist);
  const run = (easy: boolean) => {
    const lift: Platform = { id: 9, x: 410, y: G, width: 70, height: 18, type: 'moving', ride: { clock: 'hoist', path: up, w: 70, smooth: true } };
    const r = host([plat(1, 0, 400), plat(4, 490, 300, G - 200), lift], [hoist], easy);
    r.stand(445, G);
    // (every frame of the way up and the way down his feet are on it and he is grounded: no hop, no drop a frame behind it)
    let top = -1, off = 0;
    const step = () => {
      r.frame();
      if (r.standingOn !== 9 || !r.p.grounded || Math.abs(r.p.y - lift.y) > 0.01) off++;
    };
    for (let i = 0; i < 30 * 14 && top < 0; i++) {
      step();
      if (lift.y === G - 200) top = (i + 1) / 30;
    }
    const atTop = { y: Math.round(r.p.y), on: r.standingOn };
    for (let i = 0; i < Math.round((easy ? 1.3 : 1) * 6 * 30); i++) step();
    return { top, atTop, off, back: Math.round(r.p.y), on: r.standingOn, died: r.died };
  };
  const n = run(false);
  assert.ok(Math.abs(n.top - 6) < 0.05, `Normal: at the top when its 6 s beat ends (${n.top})`);
  assert.deepEqual(n.atTop, { y: G - 200, on: 9 }, 'he rode it up');
  assert.deepEqual([n.back, n.on, n.died], [G, 9, false], 'and down again, still on it');
  assert.equal(n.off, 0, 'his feet never left it, up or down');
  const e = run(true);
  assert.ok(Math.abs(e.top - 6 * 1.3) < 0.05, `Easy: the same trip on a beat 1.3 times as long (${e.top})`);
  assert.deepEqual(e.atTop, { y: G - 200, on: 9 });
  assert.equal(e.off, 0);
});

test('in the real engine: a ride has no timer of its own; put the clock anywhere and the ride is where its beat says', () => {
  const log = ride(9, across, { shift: 2.5 });
  const r = host([plat(1, 0, 400), plat(2, 600, 400), log], [river]);
  const e = (r as unknown as { e: Eng }).e;
  // (its lane is half a beat on: at game time 1.5 it is half way through its trip; at 0 it is waiting at the near bank)
  e.clock.seek(1.5);
  r.fly(100, 300);
  r.frame();
  assert.ok(Math.abs(log.x - (406 + 69)) < 6, `half way: ${log.x}`);
  e.clock.seek(0);
  r.frame();
  assert.equal(log.x, 406);
});
