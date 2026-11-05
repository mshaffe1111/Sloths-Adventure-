// RUNS #66 #72: the take-off window, in the real engine, at the top of the dial's rise and gap shares. CP2's own window measure
// (engine-spec reference/engine/cp2/cp2-trace.ts.txt: RealPlay.bare, the take-off swept in 5 px steps, a full 30-frame hold and a
// 4-frame flick, from a run-up; window = the span of take-off times that land, ms at full run), its attempt() copied. The piece pair is
// the mixer's own at a dial value: the rise is w1mix.ts:886's share of the highest rise the gate allows (w1mix.ts:894-896), the gap is
// w1mix.ts:885's share of the gate's widest at that rise (w1mix.ts:192-204 gateGap, levelCheck.ts jumpOK / heldMaxGap, copied).
// Floors (GEMINI-LEDGER F5, TRIAGE #66/#72): 167 ms Normal, 300 ms Easy.   npx tsx tools/engine/runs/flick.ts
import '../../../src/game/headlessDom.ts';
import { RealPlay } from '../../../src/game/realPlay.ts';
import { PHYS } from '../../../src/game/physics.ts';
import { setDifficulty } from '../../../src/game/difficulty.ts';
import { heldMaxGap, jumpOK } from '../../../src/game/levelCheck.ts';
import type { Platform } from '../../../src/game/types.ts';
const MIN_GAP = 40;
function gateGap(easy: boolean, aY: number, dy: number): number {
  const A = { id: 0, x: 0, y: aY, width: 100, height: 24, type: 'solid' } as Platform;
  let lo = 0, hi = 400;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; const B = { id: 1, x: 100 + m, y: aY - dy, width: 100, height: 24, type: 'solid' } as Platform; if (jumpOK(A, B, false).ok) lo = m; else hi = m; }
  let max = lo;
  if (easy) max = Math.min(max, Math.floor(heldMaxGap(A, { id: 1, x: 100 + max, y: aY - dy, width: 100, height: 24, type: 'solid' } as Platform, false)));
  return max;
}
for (const easy of [false, true]) {
  setDifficulty(easy ? 'easy' : 'normal');
  const r = new RealPlay('3-5', 1);
  const attempt = (a: Platform, b: Platform, takeX: number, hold: number, runFrom: number): boolean => {
    const lead: Platform = { id: 90, x: runFrom - 40, y: a.y, width: a.x - runFrom + 41, height: 24, type: 'solid', style: 'branch' } as Platform;
    r.bare(runFrom < a.x ? [lead, { ...a }, { ...b }] : [{ ...a }, { ...b }]);
    r.stand(runFrom, a.y);
    let pressed = -1;
    for (let i = 0; i < 240; i++) {
      if (pressed < 0 && r.p.x >= takeX) { pressed = i; r.frame({ right: true, press: true }); continue; }
      if (pressed < 0 && !r.p.grounded && r.p.y > a.y + 30) return false;
      r.frame({ right: true, jump: pressed >= 0 && i - pressed < hold });
      if (pressed >= 0 && i - pressed > 2 && r.p.grounded) return Math.abs(r.p.y - b.y) < 2 && r.p.x >= b.x - 10;
      if (r.p.y > Math.max(a.y, b.y) + 250) return false;
    }
    return false;
  };
  let maxRise = 0;
  for (let dy = 10; dy <= 200; dy += 5) if (gateGap(easy, 800, dy) >= MIN_GAP + 10) maxRise = dy;
  console.log(`== ${easy ? 'EASY' : 'NORMAL'}: the highest rise the gate allows ${maxRise} px`);
  for (const d of [0, 0.09, 0.5, 1]) {
    const riseShare = easy ? 0.4 + 0.4 * d : 0.5 + 0.45 * d, gapShare = easy ? 0.45 + 0.35 * d : 0.55 + 0.37 * d;
    const rise = Math.max(30, Math.round(maxRise * riseShare));
    const cells: string[] = [];
    for (const [what, dy] of [['flat', 0], ['top rise', rise]] as const) {
      const gap = Math.max(MIN_GAP, Math.round(gateGap(easy, 900, dy) * gapShare));
      const a = { id: 1, x: 0, y: 900, width: 200, height: 24, type: 'solid', style: 'branch' } as Platform;
      const b = { id: 2, x: 200 + gap, y: 900 - dy, width: 150, height: 24, type: 'solid', style: 'branch' } as Platform;
      const w: string[] = [];
      for (const [hn, hold] of [['full', 30], ['flick', 4]] as const) {
        let lo = Infinity, hi = -Infinity;
        for (let tx = a.x + 5; tx <= a.x + a.width + 40; tx += 5) if (attempt(a, b, tx, hold, a.x - 900)) { lo = Math.min(lo, tx); hi = Math.max(hi, tx); }
        w.push(`${hn} ${hi >= lo ? Math.round((hi - lo + 5) / PHYS.maxRun * 1000) : 0} ms`);
      }
      cells.push(`${what} (rise ${dy}, gap ${gap}): ${w.join(', ')}`);
    }
    console.log(`  d ${d}: rise share ${riseShare.toFixed(2)}, gap share ${gapShare.toFixed(2)} | ${cells.join(' | ')}`);
  }
}
