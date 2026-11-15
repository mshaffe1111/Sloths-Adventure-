// ENG-S5: the chain window (physics chainWindow) by anchor spacing, Normal and Easy, top hold vs the two low holds, with and without
// the view rule (B's whole swing within SWING_SEEN of him as he presses). A 420 px liana hung 410 over the ledge (1-6.md's measured liana).
// npx tsx reference/qa-reports/ENG-S5/chainband.ts
import { chainWindow, chainPhase, setTimedSwing, swingReach, SWING, TIMED, LETGO_FLIGHTS, type SwingVine } from '../../../src/game/physics.ts';
import { SWING_SEEN } from '../../../src/game/cameraFollow.ts';
const L = 420, top = 0;
for (const easy of [false, true]) {
  setTimedSwing(easy);
  console.log(easy ? 'EASY' : 'NORMAL', 'period', TIMED.period, 'SWING_SEEN', SWING_SEEN);
  for (let dx = 200; dx <= 560; dx += 20) {
    const A: SwingVine = { x: 0, topY: top, bottomY: top + L, swingAmp: 0.45, swingPeriod: TIMED.period, swingPhase: 0 };
    const rA = swingReach(A);
    const room = dx - rA - 50;
    const ampB = room <= 0 ? 0 : Math.min(0.45, Math.asin(Math.min(1, room / L)));
    const B0: SwingVine = { x: dx, topY: top, bottomY: top + L, swingAmp: ampB, swingPeriod: TIMED.period };
    const ph = chainPhase(A, B0);
    const B = { ...B0, swingPhase: ph };
    const far = dx + swingReach(B);
    const seen = (px: number) => far <= px + SWING_SEEN;
    const high = [SWING.minLen / L];
    const row = [
      chainWindow(A, B, LETGO_FLIGHTS.filter((f) => f.dbl > 9), high),
      chainWindow(A, B, LETGO_FLIGHTS.filter((f) => f.dbl > 9)),
      chainWindow(A, B, LETGO_FLIGHTS.filter((f) => f.dbl > 9), high, seen),
      chainWindow(A, B, LETGO_FLIGHTS.filter((f) => f.dbl > 9), undefined, seen),
      chainWindow(A, B, LETGO_FLIGHTS, high, seen),
      chainWindow(A, B, LETGO_FLIGHTS, undefined, seen),
    ].map((v) => String(Math.round(v)).padStart(5));
    console.log(`dx ${dx} ampB ${ampB.toFixed(3)} ph ${ph.toFixed(3)} far ${Math.round(far)} | top ${row[0]} low ${row[1]} | seen: top ${row[2]} low ${row[3]} | +dbl seen: top ${row[4]} low ${row[5]}`);
  }
}
