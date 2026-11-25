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
