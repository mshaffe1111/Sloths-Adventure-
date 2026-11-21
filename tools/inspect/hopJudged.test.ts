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
import { HOP_TRACE, type HopRow } from './firsttimer.ts';

const DT = 1 / 30;
const show = (r: HopRow) =>
  `${r.site} q#${r.q} judged t ${r.t.toFixed(2)} x ${Math.round(r.x)} lag ${r.lag} hold ${r.hold.toFixed(3)} | flown t ${r.flown!.t.toFixed(2)} x ${Math.round(r.flown!.x)} hold ${r.flown!.hold.toFixed(3)} ${r.flown!.kind} | came down ${r.landed === undefined ? '?' : r.landed === 'lost' ? 'LOST' : '#' + r.landed}`;

function trace(seed: number): HopRow[] {
  HOP_TRACE.on = true;
  HOP_TRACE.rows.length = 0;
  try {
    homeRun('middle', 'normal', seed, 1);
    return HOP_TRACE.rows.slice();
  } finally {
    HOP_TRACE.on = false;
    HOP_TRACE.rows.length = 0;
  }
}

for (const seed of [5, 2]) {
  test(`2-7 home, middle Normal seed ${seed}: every judged hop is flown as judged and comes down where the gate said`, () => {
    const rows = trace(seed);
    assert.ok(rows.length > 0, 'no judged hop was pressed: the trace is not wired');
    // (the flight judged: the press on the frame judged plus its lag, a single held at least the hold judged)
    const flownWrong = rows.filter((r) => Math.abs(r.flown!.t - (r.t + r.lag)) > DT / 2 + 1e-6 || r.flown!.kind !== 'single' || r.flown!.hold + 1e-9 < r.hold);
    // (and where he came down: the platform the gate judged)
    const cameWrong = rows.filter((r) => r.landed !== undefined && r.landed !== r.q);
    const lines = [...new Set([...flownWrong, ...cameWrong])].map(show);
    console.log(`seed ${seed}: ${rows.length} judged hops pressed (${[...new Set(rows.map((r) => r.site))].join(', ')}); flown not as judged ${flownWrong.length}, came down elsewhere ${cameWrong.length}`);
    for (const l of lines) console.log('  ' + l);
    assert.deepEqual(lines, [], 'a gate judged one hop and the bot flew another');
  });
}
