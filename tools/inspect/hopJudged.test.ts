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
import { HOP_TRACE, gateLands, type DrawnHop, type HopRow, type ThumbAt } from './firsttimer.ts';

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
