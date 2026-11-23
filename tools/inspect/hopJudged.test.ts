/**
 * The hop judged is the hop flown (level.md rule 28, amended 11-21 on ENG-27l's proposal; ENG-27m): every bot gate that judges a hop with
 * hopLandsOn (the bank's edge wait for a float, the racing hop off a log, the hop upstream off a log's front, the board hop's single)
 * decides on ONE flight: from where he stands, on the frame judged plus the thumb lag judged, a single held the hold judged. The press
 * that follows must be that flight, and he must come down where the gate said. Four times on 2-7 a gate judged one hop and the bot flew
 * another (the liana, the wheel, the race, the bank's edge wait: other frame, other x, a hold drawn shorter), and he fell in the river.
 *
 * HOP_TRACE (firsttimer.ts) records, for every judged hop that was pressed, the judgment, the hop flown and where he came down; it draws
 * nothing and no decision reads it. Flown on the real engine: 2-7's home toy (homeToys.ts, the race leg's banks and logs), the middle
 * tier on Normal, the rows whose falls ENG-27k/l traced to a bank-to-log hop (seed 5: x 8794, 4664, 1691; seed 2: x 4427, 9789, 5678).
 */
import '../../src/game/headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { homeRun } from './homeToys.ts';
import { HOP_TRACE, WaitAim, gateAirtime, gateLands, racePick, type DrawnHop, type HopRow, type ThumbAt } from './firsttimer.ts';

const DT = 1 / 30;
const show = (r: HopRow) =>
  `${r.site} q#${r.q} judged t ${r.t.toFixed(2)} x ${Math.round(r.x)} lag ${r.lag} hold ${r.hold.toFixed(3)}${r.kind ? ' ' + r.kind : ''} | flown t ${r.flown!.t.toFixed(2)} x ${Math.round(r.flown!.x)} hold ${r.flown!.hold.toFixed(3)} ${r.flown!.kind} | came down ${r.landed === undefined ? '?' : r.landed === 'lost' ? 'LOST' : '#' + r.landed}${r.landedType ? ' ' + r.landedType : ''}`;

function trace(seed: number, setting: 'normal' | 'easy'): HopRow[] {
  HOP_TRACE.on = true;
  HOP_TRACE.rows.length = 0;
  try {
    homeRun('middle', setting, seed, 1);
    return HOP_TRACE.rows.slice();
  } finally {
    HOP_TRACE.on = false;
    HOP_TRACE.rows.length = 0;
  }
}

// (Easy too, ENG-27o: its second press is the engine's own, 1.12x (FirstTimerRun.v2), and the thumb's fumbles are flown on both)
for (const [setting, seed] of [['normal', 5], ['normal', 2], ['easy', 5], ['easy', 2]] as const) {
  test(`2-7 home, middle ${setting === 'easy' ? 'Easy' : 'Normal'} seed ${seed}: every judged hop is flown as judged and comes down where the gate said; every press from a bank with logs near its edge flies on a judgment of its own frame or comes down on solid (ruling A)`, () => {
    const rows = trace(seed, setting);
    assert.ok(rows.length > 0, 'no judged hop was pressed: the trace is not wired');
    // (the lead's ruling A, ENG-27p: every press at a river's edge with a float within reach flies on a judgment of its own frame)
    //  (a judgment left from an earlier frame or another branch always fails; a press no gate judged may come down only on SOLID: from
    //   these banks most such presses are hops to the next bank (13 of 14 on d2408e867's four runs). On a log, in the water or nowhere
    //   seen, it fails: a bank hop that falls in the river is a lost life no gate judged (the lead, on ENG-27p's measure))
    const isJudged = (r: HopRow) => r.site !== 'unjudged' && !r.site.startsWith('stale');
    const unjudged = rows.filter((r) => r.site.startsWith('stale') || (r.site === 'unjudged' && r.landedType !== 'solid'));
    // (the flight judged: the press on the frame judged plus its lag; a drawn hop (the lead's ruling, a row with its kind) flown with the
    //  SAME kind and hold; a gate still judging a single held who.hold[0] (boardHop), a single held at least that)
    const flownWrong = rows.filter(isJudged).filter((r) => Math.abs(r.flown!.t - (r.t + r.lag)) > DT / 2 + 1e-6 || (r.kind !== undefined ? r.flown!.kind !== r.kind || Math.abs(r.flown!.hold - r.hold) > 1e-9 : r.flown!.kind !== 'single' || r.flown!.hold + 1e-9 < r.hold));
    // (and where he came down: the platform the gate judged)
    const cameWrong = rows.filter(isJudged).filter((r) => r.landed !== undefined && (r.q === -2 ? r.landed !== 'lost' : r.landed !== r.q));
    //  (ENG-27r: q -2 is a predicted fall, the flown draw with its thumb noise landing on nothing judged: consistent only if he is lost)
    const lines = [...new Set([...unjudged, ...flownWrong, ...cameWrong])].map(show);
    for (const r of rows.filter((r) => !isJudged(r))) console.log('  [bank press] ' + show(r));
    console.log(`${setting} seed ${seed}: ${rows.length} judged hops pressed (${[...new Set(rows.map((r) => r.site))].join(', ')}); unjudged or stale ${unjudged.length}, flown not as judged ${flownWrong.length}, came down elsewhere ${cameWrong.length}`);
    for (const l of lines) console.log('  ' + l);
    assert.deepEqual(lines, [], 'a gate judged one hop and the bot flew another');
  });
}

// (ENG-27r, the lead's concern: no foresight. A player sees the log, the gap and his aim, presses, and only then does his thumb slip. The
//  toy: a single held 0.2 s at a solid 120 px on; aimed, it lands; with a 24-frame slip drawn on the press frame it falls short. The gate
//  must press it (the aim lands): it may not read the noise he cannot see. RED on 74a97ad44's read, GREEN on the no-foresight gate)
test('a drawn-hop gate decides on the hop as aimed, never on the thumb noise drawn for it (no foresight, ENG-27r)', () => {
  const n = 75, z = (v: number) => Array<number>(n).fill(v);
  const q = { id: 1, x: 220, y: 500, width: 120, height: 20, type: 'solid' } as never;
  const aim: DrawnHop = { kind: 'single', hold: 0.2, d2: -1, dblAt: 0, hold2: 0, upOnly: 0 };
  const noisy: DrawnHop = { ...aim, thumb: { drift: z(0), slip: [24, ...z(-1).slice(1)], release: z(0) } };
  const th: ThumbAt = { last: 1, driftPx: 0, armed: false, releaseLeft: 0, travel: -1, slip: -1, speed: 600, once: false };
  assert.equal(gateLands(q, () => 220, 100, 500, 1, aim, 0, 0, 24, 1e9, th), true, 'the aimed hop lands (the toy)');
  assert.equal(gateLands(q, () => 220, 100, 500, 1, noisy, 0, 0, 24, 1e9, th), true, 'the gate read the slip drawn for the hop before he pressed');
});

// (ENG-27s, the lead's ruling on D's aim: the aim is drawn ONCE when a wait begins, from the tier's kind and hold draws (R-165.59: a
//  player picks his hop when he sees the log), and HELD until he presses or the target leaves reach; no redraw inside a wait. The toy:
//  a 1 s wait, the target in reach every frame, a gate that presses only a hold of 0.3 s or more; the first draw holds 0.1 s, a redraw
//  would hold 0.4 s (the lucky hold). He must not press: the held aim never lands. RED on the plant 64134c343 (D's 0.5 s beat), GREEN with it deleted)
test('a wait holds its aim: drawn once when the wait begins, never redrawn for a lucky hold (ENG-27s, the lead\'s ruling)', () => {
  const base: DrawnHop = { kind: 'single', hold: 0.1, d2: -1, dblAt: 0, hold2: 0, upOnly: 0 };
  const holds = [0.1, 0.4, 0.4, 0.4];
  let k = 0;
  const draw = (): DrawnHop => ({ ...base, hold: holds[Math.min(k++, holds.length - 1)] });
  const aim = new WaitAim();
  let pressed = -1;
  for (let f = 0; f < 30 && pressed < 0; f++) if (aim.at(1, f * DT, draw).hold >= 0.3) pressed = f;
  assert.equal(pressed, -1, `he pressed a redrawn lucky hold at frame ${pressed} (${aim.draws} draws in one wait)`);
  assert.equal(aim.draws, 1, 'one draw per wait');
  // (the target left reach: the next wait draws its own aim, once)
  aim.end();
  for (let f = 30; f < 60; f++) aim.at(1, f * DT, draw);
  assert.equal(aim.draws, 2, 'the next wait draws once');
});

// (E, the honest middle (the lead's ruling, ENG-27v): at the race gate he picks the SMALLEST calibrated hop whose AIMED flight lands with
//  RACE_MARGIN (50 px), and only then is the thumb's noise drawn and flown. The toy: a solid 40 px past his front; a 0.1 s single (the
//  held draw, D') comes down short of the 50 px, a 0.3 s single lands with it, a 0.5 s single lands too. E presses the 0.3 s single; D'
//  (the one drawn hop held: the short single) never presses. RED on the D' plant (racePick keeps the first candidate only), GREEN on E)
test('the race gate presses the smallest calibrated hop whose aimed flight lands with the race margin (E, the honest middle, ENG-27v)', () => {
  const q = { id: 1, x: 184, y: 500, width: 400, height: 20, type: 'solid' } as never;
  const single = (hold: number): DrawnHop => ({ kind: 'single', hold, d2: -1, dblAt: 0, hold2: 0, upOnly: 0 });
  const cands = [single(0.1), single(0.3), single(0.5)];
  const lands = (h: DrawnHop) => gateLands(q, () => 184, 100, 500, 1, h, 0, 0, 50, 1e9);
  const air = (h: DrawnHop) => gateAirtime(q, () => 184, 100, 500, 1, h, 0, 0, 50, 1e9);
  assert.deepEqual(cands.map(lands), [false, true, true], 'the toy: the short single comes down short of the margin, the others land');
  assert.deepEqual(cands.map((h) => air(h) !== null), cands.map(lands), 'gateAirtime lands where gateLands does');
  const pick = racePick(cands, air);
  assert.ok(pick, 'E rode on: no hop pressed though a calibrated hop lands with the margin (the held short draw decided)');
  assert.equal(pick.hold, 0.3, 'E pressed a bigger hop than the smallest that lands');
  // (no foresight: a slip drawn for the press does not change the pick, which reads the aim only)
  const n = 75, z = (v: number) => Array<number>(n).fill(v);
  const slipped = racePick(cands.map((c) => ({ ...c, thumb: { drift: z(0), slip: [24, ...z(-1).slice(1)], release: z(0) } })), air);
  assert.equal(slipped?.hold, 0.3, 'the pick read the thumb noise drawn for the press');
  // (none lands: he rides on)
  assert.equal(racePick([single(0.1)], air), null, 'E pressed a hop whose aim does not land');
});

// (E's order as the lead ruled "smallest" (ENG-27w): the SHORTEST aimed flight by airtime to a safe landing with the race margin; ties: the
//  smaller hold. ENG-27v built kind-then-hold (the first in the table that lands: singles before doubles), so the expert's 0.70 s glide
//  single (holdQ's top quantile, its leaf braking the fall) was pressed over a double that comes down safe sooner. The toy: the tier's
//  table as raceCandidates orders it (singles by hold, then doubles), with SET airtimes (the rule, not the physics): the 0.70 s single
//  safe at 1.10 s, the doubles at 0.93 s and 0.97 s, the short singles not at all. E presses the 0.93 s double. RED on the kind-then-hold
//  plant (the first that lands), GREEN on the ruled order. A tie in airtime goes to the smaller hold, whatever its place in the table.
//  On the real 2-7 race the glide single IS the quickest safe flight (0.83-0.90 s against the quickest double's 0.90-0.93 s, 0 of 412
//  expert race decisions differ from kind-then-hold: reference/qa-reports/ENG-27/w/racepick-airtimes-expert.txt), so the ruled order moves no row there)
test('the race gate presses the shortest aimed flight that lands safe, by airtime; ties: the smaller hold (E as ruled, ENG-27w)', () => {
  const single = (hold: number): DrawnHop => ({ kind: 'single', hold, d2: -1, dblAt: 0, hold2: 0.18, upOnly: 0 });
  const double = (d2: number): DrawnHop => ({ kind: 'double', hold: 0.18, d2, dblAt: 0, hold2: 0.18, upOnly: 0 });
  const glide = single(0.701), dblA = double(0.284), dblB = double(0.329);
  const cands = [single(0.084), single(0.18), glide, dblA, dblB];
  const airs = new Map<DrawnHop, number | null>([[cands[0], null], [cands[1], null], [glide, 1.1], [dblA, 0.93], [dblB, 0.97]]);
  const pick = racePick(cands, (h) => airs.get(h) ?? null);
  assert.ok(pick, 'E rode on though three aimed flights land safe');
  assert.notEqual(pick, glide, "E pressed the expert's 0.70 s glide single (1.10 s in the air) over a double that lands safe in 0.93 s (kind-then-hold)");
  assert.equal(pick, dblA, 'E pressed a slower safe flight than the shortest');
  // (ties: the smaller hold, wherever it sits in the table)
  const big = single(0.4), small = single(0.2);
  assert.equal(racePick([big, small], () => 0.8), small, 'a tie in airtime went to the bigger hold');
  // (the real flight: gateAirtime is the s from the take-off to the landing; a longer single comes down later on the same solid)
  const q = { id: 1, x: 184, y: 500, width: 400, height: 20, type: 'solid' } as never;
  const a3 = gateAirtime(q, () => 184, 100, 500, 1, single(0.3), 0, 0, 50, 1e9), a5 = gateAirtime(q, () => 184, 100, 500, 1, single(0.5), 0, 0, 50, 1e9);
  assert.ok(a3 !== null && a5 !== null && a3 > 0 && a5 > a3, `the airtime read is not the flight's: 0.3 s single ${a3}, 0.5 s single ${a5}`);
});
