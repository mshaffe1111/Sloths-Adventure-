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
import { HOP_TRACE, GATE_TRACE, type HopRow, type GateRow } from './firsttimer.ts';

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
    const cameWrong = rows.filter(isJudged).filter((r) => r.landed !== undefined && r.landed !== r.q);
    const lines = [...new Set([...unjudged, ...flownWrong, ...cameWrong])].map(show);
    for (const r of rows.filter((r) => !isJudged(r))) console.log('  [bank press] ' + show(r));
    console.log(`${setting} seed ${seed}: ${rows.length} judged hops pressed (${[...new Set(rows.map((r) => r.site))].join(', ')}); unjudged or stale ${unjudged.length}, flown not as judged ${flownWrong.length}, came down elsewhere ${cameWrong.length}`);
    for (const l of lines) console.log('  ' + l);
    assert.deepEqual(lines, [], 'a gate judged one hop and the bot flew another');
  });
}

// (the lead's ruling, ENG-27q: the one-draw hold is a bot misread. A tester re-aims every moment; the gates kept ONE drawn hop until a
//  gate pressed it (the race) or for a 0.5 s beat (edgeWait, upstream, the edge stand), a bare literal with no source, so one bad draw held
//  him at the edge or on the log while a fresh aim the next frame would land (ENG-27p: 2-21% of the calibrated draws land at the race
//  sites). No profile measures a reaction or a decision time (BOTS.md, the kept KID/ADULT row: "no profile measures reaction, thumb
//  latency"), so the cadence is every frame: the hop a gate judges is drawn on the frame it judges it. 2-7 home middle Normal 1, the run
//  ENG-27p measured (finish 190.0 s, 104.6 s standing still))
test('2-7 home, middle Normal seed 1: every frame a drawn-hop gate judges, the hop it judges is aimed that frame (no draw held from an earlier frame), and a refused aim is followed by fresh aims that land', () => {
  GATE_TRACE.on = true;
  GATE_TRACE.rows.length = 0;
  let rows: GateRow[];
  try {
    homeRun('middle', 'normal', 1, 1);
    rows = GATE_TRACE.rows.slice();
  } finally {
    GATE_TRACE.on = false;
    GATE_TRACE.rows.length = 0;
  }
  assert.ok(rows.length > 0, 'no gate judged a hop: the trace is not wired');
  const held = rows.filter((r) => Math.abs(r.drawnAt - r.t) > 1e-6);
  const bySite = (rs: GateRow[]) => [...new Set(rs.map((r) => r.site))].map((s) => `${s} ${rs.filter((r) => r.site === s).length}`).join(', ');
  const refused = rows.filter((r) => !r.pressed);
  // (a refused aim, then a press on the same gate the next frame: the next aim landed)
  const reaimed = refused.filter((r) => rows.some((n) => n.site === r.site && n.pressed && Math.abs(n.t - (r.t + DT)) < 1e-3));
  console.log(`gate frames ${rows.length} (${bySite(rows)}); refused ${refused.length}; judged on a draw held from an earlier frame ${held.length}${held.length ? ' (' + bySite(held) + ')' : ''}; refused then pressed the next frame ${reaimed.length}`);
  for (const r of held.slice(0, 5)) console.log(`  held: ${r.site} t ${r.t.toFixed(2)} x ${Math.round(r.x)} drawn t ${r.drawnAt.toFixed(2)} (${(r.t - r.drawnAt).toFixed(2)} s held)${r.pressed ? ' pressed' : ' refused'}`);
  assert.equal(held.length, 0, 'a gate judged a hop drawn on an earlier frame: one draw held him');
  assert.ok(reaimed.length > 0, 'no refused aim was followed by a fresh aim that landed');
});
