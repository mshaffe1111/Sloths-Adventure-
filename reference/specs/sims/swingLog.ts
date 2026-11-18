/**
 * swingLog — 2-4's two clocks, FLOWN on the real engine (DESIGN-24-25, level.md rule 24). Pokey is engine.ts at 30 fps (realPlay.ts);
 * the liana is World 2's (2-1's measured geometry: anchor 165 px past the bank's end, 410 px over it, 410 px long, World 1's self-swing
 * amp 0.45, period from physics.ts TIMED); the logs are riverLay.ts layRiver's (drift platforms the engine moves by river.ts driftX).
 *
 * DROP (beat 1, 3, 6, 8, 9): he hangs on the liana at a grip (share of its length from the anchor, as pressWindow's grips), the vine at
 * clock k (every frame of one swing) and the river at phase j (every frame of one log spacing); he presses jump (held to the top, or a
 * 7-frame flick) holding right. Outcome: LOG (standing on a drift platform), BANK, or WATER. Then each start (k0, j0) is played forward as
 * time runs (both clocks advance together) to read what a player waiting on the liana sees: the share of his forward swings that have a
 * let-go onto a log, the window per swing (frames in a row that land), and the longest wait from any moment to the next landing press.
 * UP (beat 4): he stands on a log carried at the row's speed, dx px before the liana, the vine at clock k; he presses jump (held) and
 * holds right. Outcome: CAUGHT (on the liana) or not. Read per ride: from 420 px before the vine to 60 px past it, how many frames of
 * the ride a press catches it (worst and median over the vine's phase when the ride starts).
 * Run (from a checkout of origin/main 6e7b85f8, node_modules installed): npx tsx reference/specs/sims/swingLog.ts [normal|easy] [drop|up|all]
 * Output: reference/specs/sims/out/swingLog-<setting>.txt (the spec, reference/specs/swingLog.md, pastes from it).
 */
import { RealPlay, DT } from '../../../src/game/realPlay.ts';
import { setDifficulty } from '../../../src/game/difficulty.ts';
import { setTimedSwing, TIMED } from '../../../src/game/physics.ts';
import { layRiver, riverWidth, rowGap, type RiverRow } from '../../../src/game/gen2/riverLay.ts';
import { W2_RIVERS } from '../../../src/game/gen2/worlds/w2.ts';
import type { DriftInfo } from '../../../src/game/river.ts';
import type { Platform, Vine } from '../../../src/game/types.ts';

const setting = (process.argv[2] ?? 'normal') as 'normal' | 'easy';
const what = process.argv[3] ?? 'all';
const easy = setting === 'easy';
setDifficulty(setting);

const BANK_Y = 800;
const BANK_END = 2000;
/** 2-1's measured liana (realPlay on 2-1 seed 1: x 4922 over a bank ending 4761, topY 369 over a bank at 785, 410 long) */
const VINE = { dx: 165, top: 410, len: 410 };
/** the rows flown: World 2's own (w2.ts W2_RIVERS) and the design's proposals (fast: the late relay; lashed: Easy's lashed pair; slow: a
 *  long log at 60 px/s) */
const ALL_ROWS: Record<string, RiverRow> = {
  ...W2_RIVERS,
  fast: { dir: 1, speed: 110, logW: 150, logs: 3 },
  lashed: { dir: 1, speed: 60, logW: 300, logs: 2 },
  slow: { dir: 1, speed: 60, logW: 240, logs: 2 },
  /** the relay's narrower target: logs further apart (the water wider than a hop: crossed by the vines, never log to log) */
  sparse: { dir: 1, speed: 80, logW: 150, logs: 2, gap: 200 },
  sparse2: { dir: 1, speed: 100, logW: 150, logs: 2, gap: 300 },
  /** the same knob inside RIVER_LAY.beat (a log every 4 s or sooner): 3.5 s and 3.9 s spacings */
  gap200: { dir: 1, speed: 100, logW: 150, logs: 2, gap: 200 },
  gap280: { dir: 1, speed: 110, logW: 150, logs: 2, gap: 280 },
};
/** ONLY=<row,row> flies those rows alone */
const ROWS = Object.fromEntries(Object.entries(ALL_ROWS).filter(([k]) => !process.env.ONLY || process.env.ONLY.split(',').includes(k)));

const r = new RealPlay('2-4', 1);
setTimedSwing(easy);
const n = Math.round(TIMED.period / DT);

function world(row: RiverRow) {
  let id = 100;
  const bank: Platform = { id: 1, x: 0, y: BANK_Y, width: BANK_END, height: 200, type: 'solid' } as Platform;
  const w = riverWidth(row);
  const far: Platform = { id: 2, x: BANK_END + w, y: BANK_Y, width: 3000, height: 200, type: 'solid' } as Platform;
  const { logs } = layRiver(row, BANK_END, BANK_Y, () => id++);
  const vine = { id: 50, x: BANK_END + VINE.dx, topY: BANK_Y - VINE.top, bottomY: BANK_Y - VINE.top + VINE.len, vineType: 'swing_liana', swingAmp: 0.45, swingPeriod: TIMED.period, swingPhase: 0 } as unknown as Vine;
  r.bare([bank, far, ...logs], [vine]);
  return { vine, logs, spacing: (row.logW + rowGap(row)) / row.speed, w };
}

type Out = 'LOG' | 'BANK' | 'WATER' | 'HANG';
function drop(vine: Vine, grip: number, k: number, phase: number, held: number): Out {
  const len = Math.min((vine.bottomY - vine.topY) * grip, vine.bottomY - vine.topY - 20);
  r.t = phase;
  r.swing(vine, { angle: 0, omega: 0, len, t: k * DT });
  r.frame({ press: true, right: true });
  for (let f = 1; f < 120; f++) {
    r.frame({ jump: f < held, right: true });
    const p = r.p;
    if (p.isVineSwinging) continue;
    if (p.grounded) {
      const on = r.platforms.find((q) => q.id === r.standingOn);
      return on?.type === 'drift' ? 'LOG' : 'BANK';
    }
    if (p.y > BANK_Y + 120) return 'WATER';
  }
  return 'HANG';
}

const pct = (a: number, b: number) => `${Math.round((100 * a) / Math.max(1, b))}%`;
const p10 = (a: number[]) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 10)] : NaN; };
const med = (a: number[]) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : NaN; };

function flyDrop(name: string, row: RiverRow, grip: number, held: number) {
  const { vine, spacing } = world(row);
  const m = Math.round(spacing / DT);
  // G[k][j]: a press with the vine at frame k of its swing and the river at phase j of one log spacing
  const G: boolean[][] = [];
  let lands = 0, bank = 0, total = 0;
  for (let k = 0; k < n; k++) {
    G.push([]);
    for (let j = 0; j < m; j++) {
      const o = drop(vine, grip, k, (j * spacing) / m, held);
      G[k].push(o === 'LOG');
      lands += o === 'LOG' ? 1 : 0; bank += o === 'BANK' ? 1 : 0; total++;
    }
  }
  // DUMP=1 prints the press grid (rows: the vine's frame k, every second one; columns: the river's phase j; # lands on a log)
  if (process.env.DUMP) { for (let k = 0; k < n; k += 2) console.log(String(k).padStart(3), G[k].map((b) => (b ? '#' : '.')).join('')); process.exit(0); }
  // play each start forward 6 swings: both clocks run together (the river's phase wraps every spacing). Runs and waits are read on the
  // whole timeline (a window that spans the end of a swing is one window); a swing "has a let-go" if any press in it lands
  let swingsWith = 0, swings = 0, worstWait = 0;
  const windows: number[] = [];
  for (let k0 = 0; k0 < n; k0 += 3) for (let j0 = 0; j0 < m; j0 += 3) {
    const L = 6 * n;
    const at = (tau: number) => G[(k0 + tau) % n][Math.round(((((j0 * spacing) / m + tau * DT) % spacing) / spacing) * m) % m];
    const A = Array.from({ length: L }, (_, tau) => at(tau));
    for (let s = 0; s < 6; s++) { swings++; if (A.slice(s * n, (s + 1) * n).some(Boolean)) swingsWith++; }
    let tau = 0;
    while (tau < L && !A[tau]) tau++;
    worstWait = Math.max(worstWait, tau);
    while (tau < L) {
      const start = tau;
      while (tau < L && A[tau]) tau++;
      if (start > 0 && tau < L) windows.push(tau - start);
      const gap0 = tau;
      while (tau < L && !A[tau]) tau++;
      if (tau < L) worstWait = Math.max(worstWait, tau - gap0);
    }
  }
  const passS = row.logW / row.speed;
  return `${name.padEnd(7)} dir ${row.dir > 0 ? '+1' : '-1'} ${String(row.speed).padStart(3)} px/s log ${String(row.logW).padStart(3)} gap ${String(rowGap(row)).padStart(3)} | pass ${passS.toFixed(2)} s vs swing ${TIMED.period} s (${passS >= TIMED.period ? 'pass >= swing' : 'pass < swing'}) | grip ${grip} ${held > 20 ? 'held' : 'flick'} | press lands LOG ${pct(lands, total)} BANK ${pct(bank, total)} | swings with a let-go onto a log ${pct(swingsWith, swings)} | window median ${med(windows)} p10 ${p10(windows)} frames | worst wait ${(worstWait * DT).toFixed(2)} s`;
}

/** UP: from a log carried at the row's speed, a held jump to the liana */
function flyUp(name: string, row: RiverRow) {
  const { vine } = world(row);
  // one long log of the row's speed under the liana, its own river window, nothing else
  const d: DriftInfo = { x0: BANK_END - 4000, x1: BANK_END + 4000, dir: 1, speed: row.speed, width: row.logW, offset: 0, baseY: BANK_Y + 28 };
  const log = { id: 300, x: 0, y: BANK_Y + 28, width: row.logW, height: 28, type: 'drift', style: 'log', drift: d } as Platform;
  r.bare([log], [vine]);
  const T = (d.x1 - d.x0 + d.width) / d.speed;
  const step = row.speed * DT;
  const dxs: number[] = [];
  for (let dx = -420; dx <= 60; dx += step) dxs.push(dx);
  const C: boolean[][] = [];
  for (let k = 0; k < n; k++) {
    C.push([]);
    for (const dx of dxs) {
      // stand him on the log's middle 3 frames before the press, so he is riding (carried) when he presses
      const heroX = vine.x + dx - 3 * step;
      const left = heroX - row.logW / 2;
      const u = (left - d.x0 + d.width) / d.speed;
      r.t = ((u % T) + T) % T;
      r.vineClock = 0;
      r.stand(heroX, d.baseY);
      r.vineClock = (k - 3 + n) * DT;
      for (let i = 0; i < 3; i++) r.frame();
      r.frame({ press: true, right: true });
      let got = false;
      for (let f = 1; f < 60 && !got; f++) {
        r.frame({ jump: true, right: true });
        if (r.p.isVineSwinging && r.p.swingVineId === vine.id) got = true;
        if (r.p.grounded && f > 3) break;
      }
      C[k].push(got);
    }
  }
  // a ride starts 420 px before the vine with the vine at frame k0: frame tau of the ride is (k0 + tau, dx index tau)
  const per: number[] = [];
  for (let k0 = 0; k0 < n; k0++) {
    let c = 0;
    for (let tau = 0; tau < dxs.length; tau++) if (C[(k0 + tau) % n][tau]) c++;
    per.push(c);
  }
  const zero = per.filter((c) => c === 0).length;
  return `${name.padEnd(7)} ${row.speed} px/s | a ride from 420 px before the liana to 60 px past it (${(dxs.length * DT).toFixed(1)} s): frames a held jump catches it: min ${Math.min(...per)} median ${med(per)} max ${Math.max(...per)} | rides with no catch ${pct(zero, per.length)}`;
}

const lines: string[] = [`swingLog ${setting} (period ${TIMED.period} s = ${n} frames, grabX ${TIMED.grabX}); engine on '2-4' (realPlay); ${new Date().toISOString()}`];
if (what === 'drop' || what === 'all') {
  for (const [name, row] of Object.entries(ROWS)) for (const grip of [0.7, 0.95]) for (const held of [99, 7]) {
    const line = flyDrop(name, row, grip, held);
    console.log(line);
    lines.push(line);
  }
}
if (what === 'up' || what === 'all') {
  for (const [name, row] of Object.entries(ROWS)) {
    if (row.dir < 0) continue;
    const line = flyUp(name, row);
    console.log(line);
    lines.push(line);
  }
}
const fs = await import('node:fs');
fs.mkdirSync(new URL('./out/', import.meta.url), { recursive: true });
fs.writeFileSync(new URL(`./out/swingLog-${setting}-${what}.txt`, import.meta.url), lines.join('\n') + '\n');
