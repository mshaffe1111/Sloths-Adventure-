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
import { HOME_CODE, POST_CODE } from '../../src/game/gen2/toyHome.ts';
import { HOP_TRACE, W1_CAP, WaitAim, gateAirtime, gateLands, racePick, type DrawnHop, type HopRow, type ThumbAt } from './firsttimer.ts';

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

// c27 (the lead's rulings on 2-7's race flips, rule 28: the judged hop is the hop flown). At the bank-edge float wait's 6 s cap (W1) he
// went BLIND off the bank (a bank hop no gate judged, 46-81 px back of the lip), the water set him back, he waited 6 s again: the race
// flipped WON -> LOST (c26: home middle Normal 1 at banks f71 and f83, post middle Normal 5 at f78; ENG-PLANT REPORT sessions 14-15).
// Read by what the engine does, never where: a hop off a bank (not a log) within 2 s of a stand of 6 s or more on it is never set back by
// the water (one frame moving him more than 60 px with no life lost); the race is WON; and NO DEADLOCK (the ruling's condition 2): every
// by-choice stand past the cap ends inside a full drift cycle of the logs in view (W1_CAP). RED on c26 51ffe7eab (2 set-backs on each,
// both LOST), GREEN on c27.
type RaceSim = { e: { player: { x: number; vx: number; grounded: boolean }; lives: number; standingOnId: number | null; platforms: { id: number; type?: string }[]; pieces: { kind: string; verdict?: { won: boolean; him: number; boat: number } }[] } };
for (const [race, code, seed] of [['home', HOME_CODE, 1], ['post', POST_CODE, 5]] as const) {
  test(`2-7's race ${race} middle Normal ${seed}: no hop off a bank after the float wait is set back by the water, the race WON, no deadlock (c27)`, () => {
    let piece: RaceSim['e']['pieces'][number] | undefined, lives: number | undefined, x: number | undefined;
    let f = 0, still = -1, stood = -1, stoodOn: number | null = null, flight: string | null = null;
    const setBack: string[] = [];
    W1_CAP.on = true; W1_CAP.rows = [];
    try {
      homeRun('middle', 'normal', seed, 1, { onFrame: (sim) => {
        const e = (sim as unknown as RaceSim).e, t = f++ / 30;
        piece ??= e.pieces.find((q) => q.kind === 'pacer');
        const here = e.player.grounded ? e.platforms.find((q) => q.id === e.standingOnId) : undefined;
        if (here && here.type !== 'drift' && Math.abs(e.player.vx) < 1) { if (still < 0) still = t; if (t - still >= 6) { stood = t; stoodOn = here.id; } } else still = -1;
        if (!e.player.grounded && flight === null && x !== undefined && stoodOn !== null && t - stood <= 2) flight = `t ${t.toFixed(1)} off f${stoodOn} x ${Math.round(x)}`;
        if (x !== undefined && lives === e.lives && Math.abs(e.player.x - x) > 60 && flight) setBack.push(`${flight}: set back ${Math.round(x)} -> ${Math.round(e.player.x)}`);
        if (e.player.grounded) flight = null;
        x = e.player.x; lives = e.lives;
      } }, code);
      assert.deepEqual(setBack, [], 'a hop off a bank after the float wait, set back by the water');
      assert.ok(piece?.verdict?.won, `the race ${piece?.verdict ? `LOST by ${(piece.verdict.him - piece.verdict.boat).toFixed(2)} s` : 'never decided'}`);
      for (const r of W1_CAP.rows) assert.ok(r.dur < r.cycle, `a stand past the cap at x ${Math.round(r.x)} lasted ${r.dur.toFixed(2)} s, the logs' cycle ${r.cycle.toFixed(2)} s`);
    } finally { W1_CAP.on = false; W1_CAP.rows = []; }
  });
}

// (ENG-PLANT-CI red 4: the judged flight's "anything else catches him first" takes the ledge-landing forgiveness by the ENGINE's own
//  conditions (engine.ts onFloor): his feet at least 2 px above the top before the frame, and the jump carrying him toward it at 30 px/s
//  or more. 2-7 home middle Easy 5 t 22.133: the judge had him caught on bank #14 (feet 0.3 px above its top before the frame, centre
//  23.8 px past its end) and read a fall; the engine landed him on #18. The toys: one built ledge each, the same flight flown by hopFlight
//  and pressed on the REAL engine (realPlay.ts, a bare world: the ledge thin, no wall, and a wide floor under it). The ledge stands where
//  the flight's first frame below `y0 + 40` puts his centre `miss` px past its right end, outside the side catch, inside landPx)
async function ledgeToy(prevAbove: number, vx0: number) {
  const { RealPlay } = await import('../../src/game/realPlay.ts');
  const { airStep, takeOffStep, ASSIST, PHYS } = await import('../../src/game/physics.ts');
  const { hopFlight } = await import('./firsttimer.ts');
  const rp = new RealPlay('1-1', 1);
  const e = rp.e as unknown as { forgive: { landPx: number }; assistNow(): number; easy: boolean; standingOnId: number };
  const w = rp.p.width, land = e.forgive.landPx, assist = e.assistNow();
  const side = 0.26 + ASSIST.landSide * assist;
  const x0 = 5000, y0 = 3000;
  // (the flight with no steer (upOnly past it: his speed kept, the engine's refined controls) and the jump held all the way)
  const b = { x: x0, y: y0, vx: vx0, vy: -PHYS.jumpV };
  let prevK = 0;
  for (let i = 1; i < 75; i++) {
    const prev = b.y;
    (i === 1 ? takeOffStep : airStep)(b, DT, 0, true);
    if (b.vy >= 0 && b.y > y0 + 40) { prevK = prev; break; }
  }
  const miss = land - 3, top = prevK + prevAbove;
  const bank = { id: 14, x: b.x - w * side - miss - 300, y: top, width: 300, height: 12, type: 'solid' as const };
  const floor = { id: 18, x: x0 - 1500, y: top + 160, width: 3000, height: 40, type: 'solid' as const };
  const h: DrawnHop = { kind: 'single', hold: 5, d2: -1, dblAt: 0, hold2: 0, upOnly: 5 };
  const others = { list: [bank, floor], at: (o: { x: number }) => () => o.x, w, easy: e.easy, assist, land, glide: false };
  const judged = hopFlight(floor, () => floor.x, x0, y0, vx0 < 0 ? -1 : 1, h, 0, vx0, 24, PHYS.doubleV, undefined, others) !== null;
  rp.bare([bank, floor]);
  rp.fly(x0, y0, vx0, -PHYS.jumpV);
  let on = -1;
  for (let i = 0; i < 90 && on < 0; i++) {
    rp.frame({ jump: true });
    if (rp.p.grounded) on = e.standingOnId;
  }
  return { judged, on, miss, prevAbove };
}
for (const [name, prevAbove, vx0, lands] of [
  ['(a) his feet 0.3 px above the top before the frame, moving toward it: the engine does not catch him, the judge must not', 0.3, -60, 18],
  ['(b) from 5 px above, moving toward it at 60 px/s: both catch him on it (the guard: the forgiveness the engine gives stays)', 5, -60, 14],
  ['(c) from 5 px above, moving away at 60 px/s: neither catches him', 5, 60, 18],
] as const) {
  test(`the judged flight's ledge forgiveness is the engine's (ENG-PLANT-CI red 4): ${name}`, async () => {
    const r = await ledgeToy(prevAbove, vx0);
    assert.equal(r.on, lands, `the built ledge: the engine set him down on #${r.on}, the case wants #${lands}`);
    assert.equal(r.judged, r.on === 18, `the judge says ${r.judged ? 'he lands on the floor #18' : 'something else catches him first'}; the engine set him down on #${r.on}`);
  });
}

// (ENG-PLANT-CI red 4, the last row: 2-7 home middle Easy 5 race q#91 t 142.467: a take-off off a drifting log. The engine's press frame
//  carries him with the log first (the logs move, him on them), then steers his own speed on the ground, then adds the log's carry once
//  (engine.ts groundJump, RIDE.keep): a 268 px/s run off a log at 80 px/s leaves at 365. The judge was handed the sum (348) and steered
//  it, bleeding it to 330, from where he stood before the frame: it landed him 8 px short, on #91; the engine on #88. The toys: one built
//  log in a bare world drifting left at 80 px/s, him running left on it, a press near its end; the engine sets him down on a wide floor
//  at x_E. The judge's verdict on a target 1.5 px either side of x_E (its margin end there) must be the engine's, at both of a held run's
//  two speeds (268 under the top: the steer then carry; 285 at it: the bleed is the same either way, the frame's ride is not)
async function carryToy(slow: boolean) {
  const { RealPlay } = await import('../../src/game/realPlay.ts');
  const { PHYS } = await import('../../src/game/physics.ts');
  const { driftX } = await import('../../src/game/river.ts');
  const { RIDE } = await import('../../src/game/ride.ts');
  const { hopFlight } = await import('./firsttimer.ts');
  const rp = new RealPlay('1-1', 1);
  const e = rp.e as unknown as { standingOnId: number };
  const Y = 3000, W = 600;
  const d = { x0: 0, x1: 20000, dir: -1 as const, speed: 80, width: W, offset: 0, baseY: Y };
  const log = { id: 90, x: 0, y: Y, width: W, height: 30, type: 'drift' as const, drift: d };
  const floor = { id: 18, x: 0, y: Y + 60, width: 20000, height: 40, type: 'solid' as const };
  rp.bare([log as never, floor as never]);
  d.offset = (d.x1 - 10000) / d.speed - rp.t;
  log.x = driftX(d, rp.t);
  rp.fly(log.x + W - 30, Y - 1, 0, 0);
  for (let f = 0; f < 60; f++) {
    rp.frame({ left: true });
    const sp = -rp.p.vx;
    if (rp.p.grounded && e.standingOnId === 90 && rp.p.x - log.x < 90 && (slow ? sp > 260 && sp < 280 : sp > PHYS.maxRun - 0.5)) break;
  }
  const at = { x: rp.p.x, y: rp.p.y, vx: rp.p.vx, t: rp.t, on: e.standingOnId };
  // (the bot's carry, as the gates read it: the log's move over a frame, RIDE.keep of it)
  const carry = ((driftX(d, at.t + DT) - driftX(d, at.t)) / DT) * RIDE.keep.x;
  let frames = 0;
  for (let i = 0; i < 75; i++) {
    rp.frame({ left: true, jump: true, press: i === 0 });
    frames++;
    if (i > 2 && rp.p.grounded) break;
  }
  const xE = rp.p.x, landed = e.standingOnId;
  const h: DrawnHop = { kind: 'single', hold: 5, d2: -1, dblAt: 0, hold2: 0, upOnly: 0 };
  const judge = (lands: boolean) => {
    const tw = 300, tx = lands ? xE + 1.5 + 24 - tw : xE + 1.5 - 24;
    const target = { id: 7, x: tx, y: floor.y, width: tw, height: 40, type: 'solid' as const };
    return hopFlight(target, () => target.x, at.x, at.y, -1, h, at.t, at.vx + carry, 24, PHYS.doubleV, undefined, undefined, carry);
  };
  return { at, carry, xE, landed, frames, lands: judge(true), misses: judge(false) };
}
for (const slow of [true, false]) for (const way of ['lands', 'misses'] as const) {
  test(`the judged take-off off a drifting log flies as the engine's (ENG-PLANT-CI red 4, Easy 5's last row): a held run at ${slow ? '268 px/s, under the top' : '285 px/s, the top'}, the engine's landing 1.5 px ${way === 'lands' ? 'inside' : 'outside'} the target's margin`, async () => {
    const r = await carryToy(slow);
    const sp = -r.at.vx;
    assert.ok(r.at.on === 90 && (slow ? sp > 260 && sp < 280 : sp > 284.5), `the built take-off: on #${r.at.on} at ${sp.toFixed(1)} px/s`);
    assert.ok(Math.abs(r.carry + 80) < 1e-6, `the log drifts left at 80 px/s (${r.carry})`);
    assert.equal(r.landed, 18, 'the engine sets him down on the floor');
    if (way === 'lands') {
      assert.notEqual(r.lands, null, `the engine lands him 1.5 px inside the target's margin (x ${r.xE.toFixed(2)}); the judge says he does not`);
      assert.ok(r.lands !== null && Math.abs(r.lands - r.frames * DT) < 1e-6, `the judged airtime ${r.lands?.toFixed(3)} s, the engine's ${(r.frames * DT).toFixed(3)} s`);
    } else assert.equal(r.misses, null, `the engine sets him down 1.5 px outside the target's margin (x ${r.xE.toFixed(2)}); the judge says he lands on it`);
  });
}

// CI-11 (rule 28, the lead's ruling on ENG-PLANT-CI session 7's (c)): vineFromLog's STANDING catch is the catch flown. Its own shape,
//  2-4 kid Easy 35: him standing on log #48 drifting his way at 75 px/s, liana #4 ahead. On CI-10 the judge flew the press with his steer
//  from its first frame and a 0.16 s hold, said 'catches' at t 47.500; the bot pressed at 47.600 with his thumb still travelling (2
//  frames unsteered) and its own drawn hold (0.097 s), the engine never had him in reach of #4, and he was set down from the water at
//  48.067. The real stage and bot, as castBots rolls them: every standing press vineFromLog judged (its pending still and judged, or
//  pressed at once under pressJudged with no run-up) must end on a liana, never grounded or set down first.
test('a vine from a log pressed from a stand is the catch flown: 2-4 kid Easy 35, standing on a log drifting his way at 75 px/s under liana #4 (CI-11)', async () => {
  const ft = await import('./firsttimer.ts');
  type Run = { t: number; e: { lives: number }; sim: { p: { x: number }; standingOn: number }; pending: { still?: boolean; judged?: boolean } | null; pressJudged: boolean; runUpHold: unknown };
  const P = ft.FirstTimerRun.prototype as unknown as { startJump: (this: Run, ...a: unknown[]) => unknown };
  const sj = P.startJump;
  type Row = { t: number; x: number; on: number; n: number; caught: number | null; down: string | null };
  const rows: Row[] = [];
  let open: Row | null = null;
  P.startJump = function (this: Run, ...a: unknown[]) {
    const stand = (this.pressJudged && !this.runUpHold) || (!!this.pending?.still && !!this.pending?.judged);
    const out = sj.apply(this, a);
    if (stand) rows.push((open = { t: this.t, x: this.sim.p.x, on: this.sim.standingOn, n: 0, caught: null, down: null }));
    return out;
  };
  try {
    ft.firstTimer('2-4', 35, { ...ft.FT_KID, setting: 'easy' }, { cap: 49, dotSetting: true, onFrame: (sim) => {
      if (!open) return;
      const e = (sim as unknown as { e: { player: { x: number; y: number; grounded: boolean; isVineSwinging?: boolean; swingVineId?: number }; standingOnId: number | null } }).e;
      const p = e.player;
      open.n++;
      if (p.isVineSwinging) { open.caught = p.swingVineId ?? -1; open = null; }
      else if (open.n > 2 && p.grounded) { open.down = `grounded on #${e.standingOnId} at x ${p.x.toFixed(1)} y ${p.y.toFixed(1)}, frame ${open.n}`; open = null; }
      else if (open.n > 60) { open.down = 'no liana in 60 frames'; open = null; }
    } });
  } finally {
    P.startJump = sj;
  }
  assert.ok(rows.length >= 1, 'vineFromLog pressed from a stand at least once (the shape is in the row)');
  for (const r of rows) assert.ok(r.caught !== null, `the standing press at t ${r.t.toFixed(3)} from x ${r.x.toFixed(1)} on #${r.on} was judged to catch; the engine: ${r.down}`);
});

// CI-12 (the lead's ruling (b) on ENG-PLANT-CI session 9's (A)): the standing press is judged over the thumb's WHOLE lag spread, the gauss
//  decide draws from. Its own shape, 2-4 kid Easy 19: him standing on log #73 at x 16,432 drifting his way at 80 px/s, liana #6 ahead at
//  x 16,572. On CI-11 vineFromLog judged 'catches' at t 97.667 at the three lags mid and mid -+ sd/2 (take-off 0.067 / 0.100 / 0.133 s);
//  decide drew 0.033 s, a frame before the earliest judged, he took off at 0.033, was never in reach of #6 and came down on log #74 at
//  98.267. The real stage and bot, as castBots rolls them: every standing press vineFromLog judged must end on a liana.
test('a vine from a log pressed from a stand is judged at every lag his thumb draws: 2-4 kid Easy 19, on log #73 drifting his way at 80 px/s under liana #6 (CI-12)', async () => {
  const ft = await import('./firsttimer.ts');
  type Run = { t: number; sim: { p: { x: number }; standingOn: number }; pending: { still?: boolean; judged?: boolean } | null; pressJudged: boolean; runUpHold: unknown };
  const P = ft.FirstTimerRun.prototype as unknown as { startJump: (this: Run, ...a: unknown[]) => unknown };
  const sj = P.startJump;
  type Row = { t: number; x: number; on: number; n: number; caught: number | null; down: string | null };
  const rows: Row[] = [];
  let open: Row | null = null;
  P.startJump = function (this: Run, ...a: unknown[]) {
    const stand = (this.pressJudged && !this.runUpHold) || (!!this.pending?.still && !!this.pending?.judged);
    const out = sj.apply(this, a);
    if (stand) rows.push((open = { t: this.t, x: this.sim.p.x, on: this.sim.standingOn, n: 0, caught: null, down: null }));
    return out;
  };
  try {
    ft.firstTimer('2-4', 19, { ...ft.FT_KID, setting: 'easy' }, { cap: 99, dotSetting: true, onFrame: (sim) => {
      if (!open) return;
      const e = (sim as unknown as { e: { player: { x: number; y: number; grounded: boolean; isVineSwinging?: boolean; swingVineId?: number }; standingOnId: number | null } }).e;
      const p = e.player;
      open.n++;
      if (p.isVineSwinging) { open.caught = p.swingVineId ?? -1; open = null; }
      else if (open.n > 2 && p.grounded) { open.down = `grounded on #${e.standingOnId} at x ${p.x.toFixed(1)} y ${p.y.toFixed(1)}, frame ${open.n}`; open = null; }
      else if (open.n > 60) { open.down = 'no liana in 60 frames'; open = null; }
    } });
  } finally {
    P.startJump = sj;
  }
  assert.ok(rows.length >= 1, 'vineFromLog pressed from a stand at least once (the shape is in the row)');
  for (const r of rows) assert.ok(r.caught !== null, `the standing press at t ${r.t.toFixed(3)} from x ${r.x.toFixed(1)} on #${r.on} was judged to catch; the engine: ${r.down}`);
});

// CI-13 (ENG-PLANT-CI session 9's (B), traced in session 10, s10/tag-*): on a log running his way he rides in (SKILLS.handed), the
//  stand at its front is a stop he MEANS. intend returned that stand as a bare {} and a bot with no holdQ (the kid, the adult) never lets
//  go of a bare {} (thumbify's late lift-off re-arms every frame, R-165.59): 2-4 kid Easy 19 on CI-12, down on log #48 at 47.400, walked
//  on (intend's last walk) and was handed the stand at 47.833 52 px from #48's front, ran on at 285 px/s, decided the edge's jump past the
//  front (48.033) and walked off it at 48.100 into the water, set down (the same branches on CI-11 at 77.367 off #75). The real stage and
//  bot: he never walks off a log he stands on (grounded on it, then airborne with no take-off) into the water (set down within 20 frames)
test('a stand on a log running his way is a stop he means: 2-4 kid Easy 19, down on log #48 at 47.4, handed the stand 52 px from its front (CI-13)', async () => {
  const ft = await import('./firsttimer.ts');
  type E = { player: { x: number; y: number; vy: number; grounded: boolean; isVineSwinging?: boolean }; standingOnId: number | null };
  const offs: { t: number; x: number; from: number; n: number; down: boolean }[] = [];
  let last: { x: number; on: number | null; g: boolean; swing: boolean } | null = null;
  ft.firstTimer('2-4', 19, { ...ft.FT_KID, setting: 'easy' }, { cap: 49, dotSetting: true, onFrame: (sim) => {
    const s = sim as unknown as { t: number; e: E; platforms: { id: number; drift?: unknown }[] };
    const p = s.e.player;
    for (const o of offs) if (!o.down && o.n < 20) { o.n++; if (last && !p.isVineSwinging && !last.swing && Math.abs(p.x - last.x) > 60) o.down = true; }
    const was = last ? s.platforms.find((q) => q.id === last!.on) : undefined;
    if (last?.g && was?.drift && !p.grounded && p.vy >= 0 && !p.isVineSwinging) offs.push({ t: s.t, x: p.x, from: was.id, n: 0, down: false });
    last = { x: p.x, on: s.e.standingOnId, g: p.grounded, swing: !!p.isVineSwinging };
  } });
  for (const o of offs) assert.ok(!o.down, `he walked off log #${o.from} at t ${o.t.toFixed(3)} x ${o.x.toFixed(1)} with no take-off and was set down from the water`);
});

// CI-14 (ENG-PLANT-CI session 11, CI-13's moved row 2-2 adult Normal 4, traced in s11/): padRead's 'once he has seen it ready he is going'
//  (padSeen) was set on floor #108 at 133.733 and carried over weight pads #113 and #114 to the next floor that stays, #109: there the
//  CROSS-ON-THE-BREATH read was skipped and he hopped onto beat row #115 / #116 (clock pads-deepBeat22: up 2.0, shiver 0.6, under 0.6) at
//  138.900 with 1.3 s of the breath left for the 500 px run to #110 (PAD_FAIR: 500 / 230 + 0.3 = 2.47 s); it went under with him on #115
//  at 140.233 and he lost the life. The real stage and bot: every take-off from a floor that stays onto a beat row leaves with the breath
//  left to cross the row to the next floor that stays at the fair pace (PAD_FAIR.pace; his reaction is already spent), less what the read
//  itself allows after it: a frame and his thumb's lag (mid + 3 sd, as thumbLags). An honest start (#49 onto #53 at 69.433: 1.97 s for 2.04)
//  is 0.07 s short, his thumb; the stale read was 0.87 s short
// (re-pointed in session 12, the lead's ruling (A): CI-15 moved the adult's run and the start off #109 came at 150.87, past the cap 144.
//  The toy now reads the CASE by what he meets, never by an id: a start off a floor that stays B that he reached by hops over pads with
//  the latch (padSeen) seen on another floor A and still set on landing; cap 152. CI-13: #108 ~> #109 -> #115 at 138.93, 1.27 s for 2.17
//  (RED); CI-15: three such starts, #35 ~> #39, #49 ~> #50, #108 ~> #109 at 150.87 with 2.13 s for 2.17 (GREEN); data/ci/s12/toy14-*)
test('a beat row is started from a floor that stays only on a breath that crosses it: 2-2 adult Normal 4, the latch carried over pads (CI-14)', async () => {
  const ft = await import('./firsttimer.ts');
  const { PAD_FAIR } = await import('../../src/game/gen2/rideLay.ts');
  type Q = { id: number; x: number; y: number; width: number; pad?: { by?: string; clock?: string; shift?: number } };
  type S = { t: number; e: { player: { x: number; y: number; grounded: boolean }; standingOnId: number | null; clock: { read: (c: string, s?: number) => { phase: string; left: number } } }; platforms: Q[]; stage: { clocks?: { id: string; phases: { name: string; seconds: number }[] }[] } };
  const starts: { t: number; from: number; left: number; need: number; on: number | null; carried: number | null }[] = [];
  let last: { g: boolean; on: number | null; x: number } | null = null;
  let open: { t: number; from: Q; x: number } | null = null;
  // (the run, for its latch: padSeen >= 0 once he has seen it ready; the floor that stays it was seen on, and the floors reached by hops
  //  over pads with it still set on landing: the case CI-14 reads afresh)
  const P = ft.FirstTimerRun.prototype as unknown as { play: (this: unknown) => unknown };
  const play = P.play;
  let run: { padSeen: number } | null = null;
  P.play = function (this: unknown) { run = this as typeof run; return play.call(this); };
  let seenOn = -1, prevSeen = -1, stay = -1, padSince = false;
  const carried = new Map<number, number>();
  try {
  ft.firstTimer('2-2', 4, { ...ft.FT_ADULT, setting: 'normal' }, { cap: 152, dotSetting: true, onFrame: (sim) => {
    const s = sim as unknown as S;
    const p = s.e.player;
    const under = p.grounded ? s.platforms.find((q) => q.id === s.e.standingOnId) : undefined;
    const ps = run?.padSeen ?? -1;
    if (ps >= 0 && prevSeen < 0) seenOn = under && !under.pad ? under.id : stay;
    prevSeen = ps;
    if (under?.pad) padSince = true;
    if (under && !under.pad) {
      if (under.id !== stay && padSince && ps >= 0 && seenOn >= 0 && seenOn !== under.id) carried.set(under.id, seenOn);
      if (under.id !== stay) padSince = false;
      stay = under.id;
    }
    const was = last?.on != null ? s.platforms.find((q) => q.id === last!.on) : undefined;
    // (a take-off from a floor that stays: grounded on a floor with no pad, then airborne, going up)
    if (last?.g && !p.grounded && was && !was.pad) open = { t: s.t, from: was, x: last.x };
    if (open && p.grounded) {
      const on = s.platforms.find((q) => q.id === s.e.standingOnId);
      if (on?.pad?.by === 'beat' && on.pad.clock && on.id !== open.from.id) {
        const r = s.e.clock.read(on.pad.clock, on.pad.shift);
        const def = (s.stage.clocks ?? []).find((c) => c.id === on.pad!.clock);
        const warn = def?.phases.find((ph) => ph.name === 'warn')?.seconds ?? 0;
        const dir = on.x > open.x ? 1 : -1;
        const edge = dir > 0 ? open.from.x + open.from.width : open.from.x;
        const row = s.platforms.filter((q) => Math.abs(q.y - open!.from.y) < 90 && q !== open!.from && (dir > 0 ? q.x >= edge - 4 : q.x + q.width <= edge + 4)).sort((a, b) => (dir > 0 ? a.x - b.x : b.x - a.x));
        const stays = row.find((q) => q.pad?.by !== 'beat');
        const across = stays ? Math.abs((dir > 0 ? stays.x : stays.x + stays.width) - edge) : Infinity;
        // (the breath left at the take-off: he was in the air from open.t to now, so add that back)
        const left = (r.phase === 'off' ? r.left + warn : r.phase === 'warn' ? r.left : 0) + (s.t - open.t);
        starts.push({ t: open.t, from: open.from.id, left, need: across / PAD_FAIR.pace, on: on.id, carried: carried.get(open.from.id) ?? null });
      }
      open = null;
    }
    last = { g: p.grounded, on: s.e.standingOnId, x: p.x };
  } });
  } finally {
    P.play = play;
  }
  assert.ok(starts.some((b) => b.carried !== null), `he never started a beat row off a floor that stays reached over pads with the latch seen on another floor, by t 152 (${starts.map((b) => '#' + b.from + '@' + b.t.toFixed(2)).join(' ')})`);
  // (his thumb's lag as thumbLags bins it, the comment above: mid + 3 sd pressed on its own frame, pressIn (the adult's 0.12 s presses at
  //  0.167 s). The raw lag stood a frame short of that: the honest start off #50 at 75.533 (1.87 s for 2.04, the bar 1.8435) read red on
  //  C9 and C11 and green on C10 as the run's random stream moved; R-165.465 ruling 2, a test correction)
  const lagMax = ft.pressIn(ft.FT_ADULT.thumb[0] + 3 * ft.FT_ADULT.thumb[1]);
  for (const b of starts) assert.ok(b.left >= b.need - DT - lagMax, `he left floor #${b.from} at t ${b.t.toFixed(3)} onto beat pad #${b.on} with ${b.left.toFixed(2)} s of the breath left for a run that needs ${b.need.toFixed(2)} s`);
});

// CI-15 (ENG-PLANT-CI session 12, the wide sample's 4 BAR PASS -> FAIL vs main, traced by frame): padPause's 'he stops on it a beat' is a
//  bare {}; a bot with no holdQ (the kid, the adult) never lets go of one (thumbify's late lift-off re-arms every frame, R-165.59), so on
//  a small log he ran on at 285 px/s off its front into the water. 2-1 kid Easy 10 on CI-14: landed on upstream log #116 56 px from its
//  front at 117.100, padPause {} every frame, off the front at 117.367 with no press, his 3rd life at one flag, rescued. The real stage
//  and bot: while a pause runs on a log he never leaves it unpressed (a walk-off within two frames of a pause frame on that log)
test('a pause on a small log is a stop he means: he never runs off its front while it runs: 2-1 kid Easy 10, log #116 (CI-15)', async () => {
  const ft = await import('./firsttimer.ts');
  const { CAST_BOTS } = await import('./castBots.ts');
  type Q = { id: number; drift?: unknown };
  type S = { t: number; e: { player: { x: number; grounded: boolean }; standingOnId: number | null }; platforms: Q[] };
  type R = { t: number; sim: { p: { grounded: boolean } }; padPause: { until: number; id: number } | null };
  const P = ft.FirstTimerRun.prototype as unknown as { intend: (this: R) => { left?: boolean; right?: boolean; jump?: boolean }; startJump: (this: R, ...a: unknown[]) => unknown };
  const it = P.intend, sj = P.startJump;
  const pauses: { t: number; on: number }[] = [], presses: number[] = [], offs: string[] = [];
  P.intend = function (this: R) {
    const o = it.call(this), pp = this.padPause;
    if (pp && this.t < pp.until && this.sim.p.grounded && !o.left && !o.right && !o.jump) pauses.push({ t: this.t, on: pp.id });
    return o;
  };
  P.startJump = function (this: R, ...a: unknown[]) { presses.push(this.t); return sj.apply(this, a); };
  let last: { g: boolean; on: number | null } | null = null;
  try {
    ft.firstTimer('2-1', 10, CAST_BOTS.kid.easy!, { cap: 118, dotSetting: true, onFrame: (sim) => {
      const s = sim as unknown as S, p = s.e.player;
      if (last?.g && last.on != null && !p.grounded) {
        const q = s.platforms.find((x) => x.id === last!.on);
        const paused = pauses.some((b) => b.on === last!.on && s.t - b.t <= 2 * DT + 1e-6);
        if (q?.drift && paused && !presses.some((j) => s.t - j <= 2 * DT + 1e-6)) offs.push(`off log #${q.id} at t ${s.t.toFixed(3)} x ${p.x.toFixed(0)}`);
      }
      last = { g: p.grounded, on: s.e.standingOnId };
    } });
  } finally {
    P.intend = it;
    P.startJump = sj;
  }
  assert.ok(pauses.length > 0, 'no pause by t 118: the toy reads nothing');
  assert.deepEqual(offs, [], `he ran off a log while its pause ran, unpressed: ${offs.join('; ')}`);
});

// R-165.465 (ENG-THUMB, the root fix): thumbify's late lift-off re-armed every frame for a bot with no holdQ (the kid, the adult),
//  so a BARE STAND (intend's {} on a floor: nothing steered, pressed, held or climbed) was never let go unless a per-stand stopMeant
//  line said so (c11's ride read, CI-13's handed ride, CI-15's pad pause and five more, each one {}). The real stage and bot, 2-1 kid
//  Normal 40 (a rule-28 row) to t 150: on c73cb9766 bare stands of 5 and 6 frames (t 38.400 x 8,542; 68.500 x 14,264; 141.833
//  x 24,341) kept the steer held every frame. (a) inside a run of bare stand frames the steer is held at most releaseMax[1] frames
//  (the thumb lets go once); (b) the late lift-off is still his: a stand straight after a frame he meant and held a steer holds it
//  its first releaseMax[0] frames (a drift or a turn's travel may drop one: 90% at least)
test('a bare stand is a stop the thumb lets go, its late lift-off kept: 2-1 kid Normal 40 to t 150 (R-165.465)', async () => {
  const ft = await import('./firsttimer.ts');
  const { CAST_BOTS } = await import('./castBots.ts');
  const who = CAST_BOTS.kid.normal!;
  type Pd = { left?: boolean; right?: boolean };
  type R = { t: number; sim: { p: { grounded: boolean } } };
  const P = ft.FirstTimerRun.prototype as unknown as { intend: (this: R) => Pd; pad: (this: R) => Pd };
  const it = P.intend, pd = P.pad;
  let meant: Pd = {};
  const frames: { t: number; bare: boolean; steer: boolean; meantSteer: boolean }[] = [];
  P.intend = function (this: R) { meant = it.call(this); return meant; };
  P.pad = function (this: R) {
    const o = pd.call(this);
    frames.push({ t: this.t, bare: this.sim.p.grounded && !Object.values(meant).some(Boolean), steer: !!(o.left || o.right), meantSteer: !!(meant.left || meant.right) });
    return o;
  };
  try {
    ft.firstTimer('2-1', 40, who, { cap: 150, dotSetting: true });
  } finally {
    P.intend = it;
    P.pad = pd;
  }
  const [lo, hi] = who.releaseMax;
  const long: string[] = [];
  let lifts = 0, kept = 0;
  for (let i = 0; i < frames.length;) {
    if (!frames[i].bare) { i++; continue; }
    let j = i;
    while (j < frames.length && frames[j].bare) j++;
    const held = frames.slice(i, j).filter((f) => f.steer).length;
    if (held > hi) long.push(`t ${frames[i].t.toFixed(3)}: ${held} of ${j - i} bare frames steered`);
    if (i > 0 && frames[i - 1].meantSteer && frames[i - 1].steer && j - i > lo) {
      lifts++;
      if (frames.slice(i, i + lo).every((f) => f.steer)) kept++;
    }
    i = j;
  }
  assert.ok(frames.length > 4000 && lifts >= 5, `the toy reads too little: ${frames.length} frames, ${lifts} let-gos into a stand`);
  assert.deepEqual(long, [], `a bare stand never let go (more than releaseMax[1] = ${hi} frames steered): ${long.slice(0, 6).join('; ')}`);
  assert.ok(kept >= 0.9 * lifts, `the late lift-off is gone: ${kept} of ${lifts} let-gos into a stand held the steer ${lo} frame(s)`);
});

test('the way he keeps is the way he flew: in the air on a jump the jump steers, never the route point lagging under him: 2-1 kid Easy 25 to t 40 (R-165.465 step 1)', async () => {
  const ft = await import('./firsttimer.ts');
  const { CAST_BOTS } = await import('./castBots.ts');
  type R = { t: number; way: number; jump: { dir: number } | null; sim: { p: { grounded: boolean; x: number } } };
  const P = ft.FirstTimerRun.prototype as unknown as { intend: (this: R) => unknown };
  const it = P.intend;
  const turned: string[] = [];
  let airFrames = 0;
  P.intend = function (this: R) {
    const o = it.call(this);
    const j = this.jump;
    if (j && j.dir !== 0 && !this.sim.p.grounded) {
      airFrames++;
      if (this.way !== j.dir) turned.push(`t ${this.t.toFixed(2)} x ${Math.round(this.sim.p.x)}: way ${this.way}, the jump's ${j.dir}`);
    }
    return o;
  };
  let run: ReturnType<typeof ft.firstTimer>;
  try {
    run = ft.firstTimer('2-1', 25, CAST_BOTS.kid.easy!, { cap: 40, dotSetting: true });
  } finally {
    P.intend = it;
  }
  assert.ok(airFrames > 200, `the toy reads too little: ${airFrames} air frames on a jump`);
  assert.deepEqual(turned.slice(0, 6), [], `in the air the way turned against the jump flying him (${turned.length} frames)`);
  // (the row: down on #13 off the liana at 20.2 s he goes on right, never back off its left end into the pit at x 4,042)
  const there = run.stuck.filter((s) => s.x > 3600 && s.x < 4500);
  assert.deepEqual(there.map((s) => `${s.x}: ${s.what}`), [], 'stuck at the liana and #13 (x 3,600-4,500)');
});

test('a pad hop is flown from the pad: padRead judges it with the lag decide() then draws, and no press on its way walks him off the front: 2-2 kid Normal 15 to t 170 (R-165.465 step 2)', async () => {
  const ft = await import('./firsttimer.ts');
  const { CAST_BOTS } = await import('./castBots.ts');
  type Pend = { at: number; fromPad?: number };
  type R = { t: number; pending: Pend | null; jump: unknown; sim: { standingOn: number | null; p: { grounded: boolean; x: number } } };
  const P = ft.FirstTimerRun.prototype as unknown as { intend: (this: R) => unknown; padRead: (this: R, ...a: unknown[]) => unknown };
  const it = P.intend, pr = P.padRead;
  const off: string[] = [];
  let pressed = 0;
  P.padRead = function (this: R, ...a: unknown[]) {
    const before = this.pending;
    const o = pr.apply(this, a);
    if (!before && this.pending) { this.pending.fromPad = this.sim.standingOn ?? -1; pressed++; }
    return o;
  };
  P.intend = function (this: R) {
    const q = this.pending;
    if (q && q.fromPad !== undefined && !this.jump && !this.sim.p.grounded) {
      off.push(`t ${this.t.toFixed(2)} x ${Math.round(this.sim.p.x)}: off #${q.fromPad}'s front, the press due ${q.at.toFixed(3)}`);
      q.fromPad = undefined;
    }
    return it.call(this);
  };
  let run: ReturnType<typeof ft.firstTimer>;
  try {
    run = ft.firstTimer('2-2', 15, CAST_BOTS.kid.normal!, { cap: 170, dotSetting: true });
  } finally {
    P.intend = it;
    P.padRead = pr;
  }
  assert.ok(pressed > 30, `the toy reads too little: ${pressed} pad presses`);
  assert.deepEqual(off, [], 'a press decided on a pad came after he walked off its front');
  // (the row: pads #112-#116 near 2-2's end, x 28,000-30,200, cleared with no set-down)
  const there = run.stuck.filter((s) => s.x > 28000 && s.x < 30200);
  assert.deepEqual(there.map((s) => `${s.x}: ${s.what}`), [], 'stuck on the last pads (x 28,000-30,200)');
});

test('a put-back by the game spends the edge plan: a teaching river splashes him back with no life lost, and the lip he left has no plan left armed for it (2-2 child Easy 21 to t 266, R-165.465)', async () => {
  const ft = await import('./firsttimer.ts');
  const { CAST_BOTS } = await import('./castBots.ts');
  type R = { t: number; edge: object | null; lateArmed: object | null; sim: { p: { x: number } } };
  const P = ft.FirstTimerRun.prototype as unknown as { intend: (this: R) => unknown };
  const it = P.intend;
  const stale: string[] = [];
  let backs = 0, lastT = -1, lastX = 0, held: { edge: object | null; late: object | null } = { edge: null, late: null };
  P.intend = function (this: R) {
    const x = this.sim.p.x;
    // (the game moved him 100 px or more in one frame: a put-back; every plan held for the lip he left is spent by the next frame he reads)
    if (lastT >= 0 && Math.abs(this.t - lastT - 1 / 30) < 1e-3 && Math.abs(x - lastX) >= 100 && (held.edge || held.late)) {
      backs++;
      if ((held.late && this.lateArmed === held.late) || (held.edge && this.edge === held.edge)) stale.push(`t ${this.t.toFixed(2)} x ${Math.round(lastX)} -> ${Math.round(x)}: ${this.lateArmed === held.late ? 'the late press' : 'the edge'} armed before it`);
    }
    const o = it.call(this);
    lastT = this.t; lastX = this.sim.p.x; held = { edge: this.edge, late: this.lateArmed };
    return o;
  };
  let run: ReturnType<typeof ft.firstTimer>;
  try {
    run = ft.firstTimer('2-2', 21, CAST_BOTS.child.easy!, { cap: 266, dotSetting: true });
  } finally {
    P.intend = it;
  }
  assert.ok(backs >= 1, `the toy reads too little: ${backs} put-backs with a plan held`);
  assert.deepEqual(stale, [], 'a plan for the lip he left outlived the put-back');
  // (the row: the river between #92 and #94, x 24,000-24,900, crossed with no set-down loop)
  const there = run.stuck.filter((s) => s.x > 24000 && s.x < 24900);
  assert.deepEqual(there.map((s) => `${s.x}: ${s.what}`), [], 'stuck at the river before #94 (x 24,000-24,900)');
});

test('landed on the very end of a small log, the pause comes: he never walks off a log unpressed within half a second of landing on it (2-1 middle Normal 17 to t 120, R-165.465 step 3)', async () => {
  const ft = await import('./firsttimer.ts');
  const { CAST_BOTS } = await import('./castBots.ts');
  type R = { t: number; sim: { standingOn: number | null; platforms: Array<{ id: number; x: number; width: number; drift?: unknown }>; p: { grounded: boolean; x: number; vy: number } } };
  const P = ft.FirstTimerRun.prototype as unknown as { intend: (this: R) => unknown };
  const it = P.intend;
  const off: string[] = [];
  let land: { t: number; id: number } | null = null, was: { g: boolean; on: number | null } = { g: false, on: null }, landings = 0;
  P.intend = function (this: R) {
    const s = this.sim, g = s.p.grounded, on = g ? s.standingOn : null;
    const q = on !== null ? s.platforms.find((u) => u.id === on) : undefined;
    // (a landing on a drifting log: down from the air, or down a step onto it)
    if (g && q?.drift && (!was.g || was.on !== on)) { land = { t: this.t, id: on! }; landings++; }
    // (off that log with no press: in the air, not going up, within 0.5 s of the landing)
    if (!g && was.g && land && was.on === land.id && s.p.vy >= 0 && this.t - land.t < 0.5) off.push(`t ${this.t.toFixed(2)} x ${Math.round(s.p.x)}: walked off log #${land.id} ${(this.t - land.t).toFixed(2)} s after landing on it`);
    was = { g, on };
    return it.call(this);
  };
  let run: ReturnType<typeof ft.firstTimer>;
  try {
    run = ft.firstTimer('2-1', 17, CAST_BOTS.middle.normal!, { cap: 120, dotSetting: true });
  } finally {
    P.intend = it;
  }
  assert.ok(landings >= 3, `the toy reads too little: ${landings} landings on a log`);
  assert.deepEqual(off, [], 'he walked off a log he had just landed on, unpressed');
  // (the row: the upstream river past #85, x 19,400-19,900, crossed with no life lost)
  const lost = run.harms.filter((h) => h.kind === 'life' && h.x > 19400 && h.x < 19900);
  assert.deepEqual(lost.map((h) => `t ${h.t.toFixed(2)} x ${Math.round(h.x)}: ${h.cause}`), [], 'a life lost at the river past #85 (x 19,400-19,900)');
  const there = run.stuck.filter((s) => s.x > 19400 && s.x < 19900);
  assert.deepEqual(there.map((s) => `${s.x}: ${s.what}`), [], 'stuck at the river past #85 (x 19,400-19,900)');
});

// (C11, R-165.465 step 3 narrowed: the landing floor read by his feet comes only where the walk-on would run him off: his middle past
//  the end IN HIS WAY and no pull-back due. C10 read it everywhere his middle was off his floor, and broke two shapes: on a log running
//  his way it replaced the pull-back with the edge plan's stand (standing, until -1), his run carried him off the front, and the stand
//  outlived the river's splash-back: he stood at the bank until rescued (2-1 child Normal 20 at #41, 2-5 child Normal 34 at #42, 'water
//  ahead'); and a ledge he landed short of drew a pause dropped the same frame, moving the whole run after it (2-1 kid Normal 29, 3 lives
//  at the upstream river past #85, 'set down here 3 times'). One toy for each; 'landed on the very end of a small log' keeps C10's cure)
test('a pull-back due on a log running his way is kept where his middle is past its front: the steer on landing is back onto it, never a stand (2-1 child Normal 20 to t 90, R-165.465 C11)', async () => {
  const ft = await import('./firsttimer.ts');
  const { CAST_BOTS } = await import('./castBots.ts');
  type Pad = { left?: boolean; right?: boolean };
  type R = { t: number; lastLand: number; sim: { standingOn: number | null; platforms: Array<{ id: number; x: number; width: number; drift?: { dir: number } }>; p: { grounded: boolean; x: number } } };
  const P = ft.FirstTimerRun.prototype as unknown as { intend: (this: R) => Pad };
  const it = P.intend;
  const cases: string[] = [], bad: string[] = [];
  P.intend = function (this: R) {
    const s = this.sim, x = s.p.x;
    const q = s.p.grounded && s.standingOn !== null ? s.platforms.find((u) => u.id === s.standingOn) : undefined;
    const d = q?.drift?.dir ?? 0;
    // (just landed on a log running his way with his middle already past its front: the case the pull-back is for)
    const caseNow = !!q && d !== 0 && this.t - this.lastLand < 0.1 && (d > 0 ? x > q.x + q.width : x < q.x);
    const o = it.call(this);
    if (caseNow) {
      cases.push(`t ${this.t.toFixed(2)} #${q!.id}`);
      if (!(d > 0 ? o.left : o.right)) bad.push(`t ${this.t.toFixed(2)} x ${Math.round(x)} on #${q!.id} (${Math.round(q!.x)}-${Math.round(q!.x + q!.width)}): steer ${JSON.stringify(o)}, not back onto it`);
    }
    return o;
  };
  let run: ReturnType<typeof ft.firstTimer>;
  try {
    run = ft.firstTimer('2-1', 20, CAST_BOTS.child.normal!, { cap: 90, dotSetting: true });
  } finally {
    P.intend = it;
  }
  assert.ok(cases.length >= 1, 'the toy reads too little: no landing on a log running his way with his middle past its front');
  assert.deepEqual(bad, [], 'the pull-back due on landing was not pressed');
  // (the row: the first river, logs #37-#43, x 8,300-8,700, crossed with no set-down)
  const there = run.stuck.filter((s) => s.x > 8300 && s.x < 8700);
  assert.deepEqual(there.map((s) => `${s.x}: ${s.what}`), [], 'stuck at the first river (x 8,300-8,700)');
});

test('landed short of a small floor, the walk-on runs him onto it and no pause is drawn from his feet: the upstream river past #85 crossed with no set-down loop (2-1 kid Normal 29 to t 125, R-165.465 C11)', async () => {
  const ft = await import('./firsttimer.ts');
  const { CAST_BOTS } = await import('./castBots.ts');
  // (a row toy: the pause C10 drew and dropped in one frame at #18 and #20 (x 5,650 and 5,955, his middle 13 and 8 px short of their
  //  back ends) is not seen from outside intend; what it moved is: 3 lives at x 19,352-19,856, 108.7-111.1 s, 'set down here 3 times', rescued. C9 and C11 lose 1 there
  //  and go on: the bar is the set-down loop)
  const run = ft.firstTimer('2-1', 29, CAST_BOTS.kid.normal!, { cap: 125, dotSetting: true });
  assert.ok(run.x > 19950, `the toy reads too little: he stands at x ${Math.round(run.x)} at t 125, short of the river's far side`);
  const there = run.stuck.filter((s) => s.x > 19300 && s.x < 19950);
  assert.deepEqual(there.map((s) => `${s.x}: ${s.what}`), [], 'stuck at the river past #85 (x 19,300-19,950)');
});

test('set down behind a stood pin, his place is found where he is: a respawn at a flag before the spur counts no falls back (2-2 middle Normal 7 to t 75, R-165.465 C9)', async () => {
  const ft = await import('./firsttimer.ts');
  const { CAST_BOTS } = await import('./castBots.ts');
  const run = ft.firstTimer('2-2', 7, CAST_BOTS.middle.normal!, { cap: 75, dotSetting: true });
  // (the row: a life lost past the stone at x 9,242 and the flag at x 7,347; no rewinds counted as falls there, and no rescue)
  assert.ok(run.harms.some((h) => h.kind === 'life' && h.x > 9300), 'the toy reads too little: no life lost past the stone');
  const there = run.stuck.filter((s) => s.x > 7000 && s.x < 10500);
  assert.deepEqual(there.map((s) => `${s.x}: ${s.what}`), [], 'stuck between the flag and the stone (x 7,000-10,500)');
  assert.deepEqual(run.rescueXs.filter((x) => x > 7000 && x < 10500), [], 'rescued between the flag and the stone');
});

test("his middle past a drifting log's front, the log is read by his feet: the river's judged hop is flown, never the edge plan's late press into the water (2-1 child Easy 3 to t 175, R-165.465 C12)", async () => {
  const ft = await import('./firsttimer.ts');
  const { CAST_BOTS } = await import('./castBots.ts');
  // (C11: on #86 running back at him, a late press drawn with a look of 0 px walked him off its front at 169.80, x 20,007, into the
  //  water; splashed back to #81 (x 19,552) and the same front again, rescued at x 19,753. The bar: the river past #85 crossed by t 175
  //  with no put-back on it, on the far bank by t 175)
  type R = { t: number; sim: { p: { x: number } } };
  const P = ft.FirstTimerRun.prototype as unknown as { intend: (this: R) => unknown };
  const it = P.intend;
  const backs: string[] = [];
  let lastT = -1, lastX = 0;
  P.intend = function (this: R) {
    const x = this.sim.p.x;
    if (lastT >= 0 && Math.abs(this.t - lastT - 1 / 30) < 1e-3 && Math.abs(x - lastX) >= 100 && lastX > 19300 && lastX < 20600) backs.push(`t ${this.t.toFixed(2)} x ${Math.round(lastX)} -> ${Math.round(x)}`);
    const o = it.call(this);
    lastT = this.t; lastX = this.sim.p.x;
    return o;
  };
  let run: ReturnType<typeof ft.firstTimer>;
  try {
    run = ft.firstTimer('2-1', 3, CAST_BOTS.child.easy!, { cap: 175, dotSetting: true });
  } finally {
    P.intend = it;
  }
  assert.deepEqual(backs, [], 'put back at the river past #85 (x 19,300-20,600)');
  // (the far bank starts at x 20,202, a step up from the logs)
  assert.ok(run.x > 20202, `the toy reads too little: he stands at x ${Math.round(run.x)} at t 175, short of the river's far bank`);
});

test("a put-back by the game spends the edge plan's stand: a stand drawn for the lip he left never holds him where he is set down (2-1 middle Easy 18 to t 12, R-165.465 C12)", async () => {
  const ft = await import('./firsttimer.ts');
  const { CAST_BOTS } = await import('./castBots.ts');
  // (C11: standing for a lip when the game set him back 125 px at t 10.00 (x 2,135 -> 2,010), the stand kept; 2-1 child Easy 24 kept
  //  one at t 190.10 (x 24,046 -> 23,933). On C10 such a stand held 2-1 child Normal 20 at x 8,390 until rescued)
  type R = { t: number; standing: object | null; sim: { p: { x: number } } };
  const P = ft.FirstTimerRun.prototype as unknown as { intend: (this: R) => unknown };
  const it = P.intend;
  const stale: string[] = [];
  let backs = 0, lastT = -1, lastX = 0, held: object | null = null;
  P.intend = function (this: R) {
    const x = this.sim.p.x;
    if (lastT >= 0 && Math.abs(this.t - lastT - 1 / 30) < 1e-3 && Math.abs(x - lastX) >= 100 && held) {
      backs++;
      if (this.standing === held) stale.push(`t ${this.t.toFixed(2)} x ${Math.round(lastX)} -> ${Math.round(x)}`);
    }
    const o = it.call(this);
    lastT = this.t; lastX = this.sim.p.x; held = this.standing;
    return o;
  };
  try {
    ft.firstTimer('2-1', 18, CAST_BOTS.middle.easy!, { cap: 12, dotSetting: true });
  } finally {
    P.intend = it;
  }
  assert.ok(backs >= 1, `the toy reads too little: ${backs} put-backs with a stand held`);
  assert.deepEqual(stale, [], 'a stand for the lip he left outlived the put-back');
});

test("a log running his way, his middle past its end: the feet read leaves it to the edge plan, which flies him to the liana (lianaRide's catch toy, middle Easy variant 2, R-165.465 C13)", async () => {
  const ft = await import('./firsttimer.ts');
  const { lianaRun } = await import('./lianaRiverToys.ts');
  // (C12 read every drifting log by his feet; on this one, running his way, the ride wait ran where the edge plan had stood and
  //  pressed: he stood at the log's end and rode past the liana, 0 catches off a log (C11 and C13: 1). The other way, a log running
  //  back at him, is the toy above ('his middle past a drifting log's front'))
  const was = ft.SKILLS.vineFromLog;
  ft.SKILLS.vineFromLog = true;
  try {
    const r = lianaRun('catch', 'twin', 'middle', 'easy', 2, 2, 'long', { realInput: true });
    assert.equal(r.end, 'shrine', `ended ${r.end}`);
    assert.ok(r.fromLog >= 1, `he never jumped from the log to the liana (${r.fromLog} catches off a log)`);
  } finally {
    ft.SKILLS.vineFromLog = was;
  }
});
