/**
 * court29 — 2-9 "The King's Drum": every toy on ONE beat, FLOWN on the real engine (DESIGN-29, level.md rule 24). Pokey is engine.ts at
 * 30 fps (realPlay.ts) with the game's own InputEngine (a tap's 80 ms minimum hold, as snapClock.ts / flight.ts; never a FakeInput
 * one-frame press, R-165.284). The beat is read from the code, never typed: B = physics.ts TIMED.period / 4 (one liana swing = one bar of
 * four) on each setting (setTimedSwing: 2.85 s Normal, 3.3 s Easy).
 *
 * HOP  the real tap hop (air time, px along at a run), to set every pitch.
 * BEAT a row of floors (W px wide, G px of water between) crossed with a tap ON EVERY BEAT (frame = round(k B / DT)), right held from the
 *      bank's run-up (style RUN), or right pressed only with each tap (style STEP: he stops on each landing). Read: does every hop land on the
 *      next floor in order (no skip, no swim), the time stood on each (s), the pad margin (PAD_SIZES small hold, x1.5 Easy, less the most
 *      stood), and a MISSED beat: one tap held back one beat on floor 2 (stands a beat longer: does the small pad still hold?).
 *      SNAP stones on the same path: the jaws' clock (counts of B; off, warn 0.5 s, on = count 4) read by beatBrick.ts brickNow('bites') of
 *      clock.ts clockAt along his real path, the bar starting on his first tap (ONE): in step, and the WAVE (stone i a count LATER).
 *      Also every other start phase of the bar: the share of starts that are safe (what ignoring the beat costs).
 * LOG  a court river (riverLay.ts layRiver, spacing a whole number of beats): standing at the bank's lip, a tap at every frame of one
 *      spacing after a log's knock (river.ts logKnocks: the log's front at the lip); LOG or WATER. Read: the share, and which BEATS after the
 *      knock land. Also the King's Barge (one long log on its own row) boarded the same way.
 * SWING the liana (2-1's measured geometry, as swingLog.ts) over a court river whose spacing is one bar: both clocks one bar long, so their
 *      relative phase never drifts. For each lock (river phase against the swing, 16 steps of a bar) a held let-go at every frame of the
 *      swing: LOG / BANK / WATER. Read: the best lock, its let-go window (frames in a row onto a log) and where the beats fall in it.
 * Run (from a checkout of origin/main, node_modules installed): npx tsx reference/specs/sims/court29.ts normal|easy [hop|beat|log|swing|all]
 * Output: reference/specs/sims/out/court29-<setting>.txt (2-9.md pastes from it).
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { RealPlay, DT } from '../../../src/game/realPlay.ts';
import { setDifficulty } from '../../../src/game/difficulty.ts';
import { InputEngine } from '../../../src/game/inputEngine.ts';
import { brickNow } from '../../../src/game/beatBrick.ts';
import { clockAt } from '../../../src/game/clock.ts';
import { setTimedSwing, TIMED } from '../../../src/game/physics.ts';
import { layRiver, riverWidth, rowGap, riverBeat, type RiverRow } from '../../../src/game/gen2/riverLay.ts';
import { PAD_SIZES, PAD_LAY } from '../../../src/game/gen2/rideLay.ts';
import type { ClockDef } from '../../../src/game/stageKit.types.ts';
import type { Platform, Vine } from '../../../src/game/types.ts';

const setting = (process.argv[2] ?? 'normal') as 'normal' | 'easy';
const what = process.argv[3] ?? 'all';
const easy = setting === 'easy';
setDifficulty(setting);
const r = new RealPlay('2-9', 1);
setTimedSwing(easy);
const BAR = TIMED.period;
const B = BAR / 4;
/** the court's Easy stretch: Easy's liana bar over Normal's (physics.ts setTimedSwing 3.3 / 2.85), so a court clock on Easy keeps the liana's bar */
const STRETCH = 3.3 / 2.85;
const inp = new InputEngine();
inp.source = 'pad';
r.e.input = inp;
const FLOOR = 800;
const LIP = 2000;

const out: string[] = [`court29 ${setting}: beat B = TIMED.period / 4 = ${BAR} / 4 = ${B.toFixed(4)} s (${(60 / B).toFixed(1)} BPM); engine '2-9' realPlay + InputEngine; ${new Date().toISOString()}`];
const say = (s: string) => { console.log(s); out.push(s); };
const f2 = (x: number) => x.toFixed(2);

function reset(pl: Platform[], vines: Vine[] = []) {
  r.bare(pl, vines);
  inp.clearAll();
  r.e.input = inp;
}

// ───────── HOP ─────────
function hop(run: boolean) {
  reset([{ id: 1, x: 0, y: FLOOR, width: 8000, height: 200, type: 'solid' } as Platform]);
  r.stand(600, FLOOR);
  for (let i = 0; i < 5; i++) r.e.update(DT);
  inp.triggerTouchMove('right');
  if (run) for (let i = 0; i < 40; i++) r.e.update(DT);
  const x0 = r.p.x;
  inp.triggerTouchUp(0, 80);
  let f = 0;
  while (f < 120) { if (f === 2) inp.releaseTouchUp(); r.e.update(DT); f++; if (r.p.grounded && f > 2) break; }
  return { s: f * DT, along: Math.round(r.p.x - x0) };
}

// ───────── BEAT ─────────
type Style = 'RUN' | 'STEP';
/** one crossing: taps on the beat grid (beats `skip` held back one beat); returns per-frame floor index (-1 air/bank, 0..n-1 a floor, n far bank) */
function beatRun(W: number, G: number, n: number, style: Style, skip = -1) {
  const pl: Platform[] = [{ id: 1, x: 0, y: FLOOR, width: LIP, height: 200, type: 'solid' } as Platform];
  for (let i = 0; i < n; i++) pl.push({ id: 10 + i, x: LIP + G + i * (W + G), y: FLOOR, width: W, height: 40, type: 'solid' } as Platform);
  pl.push({ id: 2, x: LIP + G + n * (W + G), y: FLOOR, width: 3000, height: 200, type: 'solid' } as Platform);
  reset(pl);
  r.stand(LIP - 200, FLOOR);
  inp.triggerTouchMove('right');
  const on: number[] = [];
  let f0 = -1, lift = -1, fell = false, k = 0;
  const taps: number[] = [];
  for (let fr = 0; fr < 900; fr++) {
    const p = r.p;
    const idx = p.grounded ? pl.findIndex((q) => q.id === r.standingOn) : -1;
    const floor = idx >= 1 && idx <= n ? idx - 1 : idx === n + 1 ? n : -1;
    if (f0 < 0 && p.grounded && p.x > LIP - 30) { f0 = fr; taps.push(0); }
    if (f0 >= 0) {
      on.push(floor);
      const beatNo = Math.round(((fr - f0) * DT) / B);
      const isBeatFrame = Math.abs((fr - f0) * DT - beatNo * B) < DT / 2 && beatNo !== taps[taps.length - 1];
      if (fr === f0 || (isBeatFrame && beatNo !== skip)) {
        if (fr !== f0) taps.push(beatNo);
        if (style === 'STEP') inp.triggerTouchMove('right');
        inp.triggerTouchUp(0, 80); lift = fr + 2;
      }
      if (style === 'STEP' && p.grounded && floor >= 0 && floor < n && fr > lift + 1) inp.triggerTouchMove('none');
      if (floor === n) break;
    }
    if (fr === lift) inp.releaseTouchUp();
    r.e.update(DT);
    if (r.p.y > FLOOR + 100) { fell = true; break; }
    k++;
  }
  // the floors in the order he stood on them, and the time on each
  const order: number[] = [];
  const stood = new Array(n).fill(0);
  for (const i of on) { if (i >= 0 && order[order.length - 1] !== i) order.push(i); if (i >= 0 && i < n) stood[i] += DT; }
  const clean = !fell && order.join(',') === [...Array(n + 1).keys()].join(',');
  return { on, fell, clean, order, stood };
}
/** the court's snap jaws: counts of B (Normal seconds; Easy x STRETCH), bite on count 4 */
const jaws = (): ClockDef => {
  const b = 2.85 / 4;
  return { id: 'jaws', phases: [{ name: 'off', seconds: 3 * b - 0.5 }, { name: 'warn', seconds: 0.5 }, { name: 'on', seconds: b }], offset: 0, easyStretch: STRETCH } as ClockDef;
};
/** is a recorded path safe against the stones, the bar starting s0 frames before his first tap; shift = counts per stone (-1: a count LATER) */
function safeAt(on: number[], n: number, s0: number, shift: number): boolean {
  const def = jaws();
  for (let t = 0; t < on.length; t++) {
    const i = on[t];
    if (i < 0 || i >= n) continue;
    // a + shift runs a stone ahead in its cycle (clock.ts beatAt); shift is in Normal seconds, stretched on Easy
    if (brickNow('bites', clockAt(def, (s0 + t) * DT, easy, i * shift * (2.85 / 4))).hurts) return false;
  }
  return true;
}
function flyBeat() {
  const hold = PAD_SIZES.small.hold * (easy ? PAD_LAY.easyStretch : 1);
  say(`\nBEAT: a tap on every beat (B ${f2(B)} s); small pad holds ${hold} s on ${setting} (rideLay PAD_SIZES x PAD_LAY.easyStretch on Easy)`);
  for (const style of ['RUN', 'STEP'] as Style[]) for (const W of [80, 130]) for (const G of [30, 40, 50, 60, 70, 80, 90, 100, 110]) {
    const n = 5;
    const a = beatRun(W, G, n, style);
    if (!a.clean) { say(`${style} W${W} G${String(G).padStart(3)}: NOT CLEAN (${a.fell ? 'swam' : 'skipped'}: floors ${a.order.join(',')})`); continue; }
    const maxStood = Math.max(...a.stood);
    const m = beatRun(W, G, n, style, 2);
    const mStood = m.clean ? Math.max(...m.stood) : NaN;
    // snap stones along the same path: the bar starting on his first tap (ONE), and every start phase of the bar
    const bar = Math.round((4 * B) / DT);
    const res: string[] = [];
    for (const [name, shift] of [['in step', 0], ['wave (a count later)', -1]] as const) {
      for (const N of [2, 3, 5]) {
        const p = beatRun(W, G, N, style);
        if (!p.clean) { res.push(`${name} x${N}: path not clean`); continue; }
        // the first tap at count k (k = 1..4) of the bar: the bar started (k-1) beats earlier
        const onK = [1, 2, 3, 4].map((k) => (safeAt(p.on, N, Math.round(((k - 1) * B) / DT), shift) ? `${k}` : '-')).join('');
        let ok = 0;
        for (let s0 = 0; s0 < bar; s0++) if (safeAt(p.on, N, s0, shift)) ok++;
        res.push(`${name} x${N}: first hop on count [${onK}] safe; any phase ${Math.round((100 * ok) / bar)}%`);
      }
    }
    say(`${style} W${W} G${String(G).padStart(3)}: clean, stood ${a.stood.map(f2).join('/')} s; pad margin ${f2(hold - maxStood)} s | one beat late on floor 2: ${m.clean ? `stood ${f2(mStood)} s, margin ${f2(hold - mStood)} s` : `NOT CLEAN (${m.fell ? 'swam' : 'skipped'})`} | ${res.join('; ')}`);
  }
}

// ───────── LOG ─────────
/** a tap from the bank's lip at time tau after a knock: where does he come down? */
function board(row: RiverRow, tau: number): 'LOG' | 'WATER' | 'BANK' {
  let id = 100;
  const bank: Platform = { id: 1, x: 0, y: FLOOR, width: LIP, height: 200, type: 'solid' } as Platform;
  const w = riverWidth(row);
  const far: Platform = { id: 2, x: LIP + w, y: FLOOR, width: 3000, height: 200, type: 'solid' } as Platform;
  const { logs } = layRiver(row, LIP, FLOOR, () => id++);
  reset([bank, far, ...logs]);
  r.stand(LIP - 12, FLOOR);
  // a knock is at every whole spacing of game time (river.ts logKnocks: offsets i T / count, T = count spacings)
  r.t = tau;
  inp.triggerTouchMove('right');
  inp.triggerTouchUp(0, 80);
  for (let f = 0; f < 90; f++) {
    if (f === 2) inp.releaseTouchUp();
    r.e.update(DT);
    const p = r.p;
    if (p.grounded && f > 2) {
      const q = r.platforms.find((x) => x.id === r.standingOn);
      inp.triggerTouchMove('none');
      return q?.type === 'drift' ? 'LOG' : 'BANK';
    }
    if (p.y > FLOOR + 100) return 'WATER';
  }
  return 'WATER';
}
function flyLog(name: string, row: RiverRow) {
  const sp = riverBeat(row);
  const m = Math.round(sp / DT);
  const res: string[] = [];
  let lands = 0;
  for (let j = 0; j < m; j++) { const o = board(row, j * DT); res.push(o === 'LOG' ? '#' : o === 'BANK' ? 'b' : '.'); if (o === 'LOG') lands++; }
  const beats = sp / B;
  const onBeats: string[] = [];
  for (let k = 0; k < Math.round(beats); k++) { const o = board(row, k * B); onBeats.push(`${k}:${o}`); }
  say(`${name.padEnd(8)} speed ${row.speed} log ${row.logW} gap ${rowGap(row)} logs ${row.logs}: spacing ${f2(sp)} s = ${beats.toFixed(3)} beats; taps after a knock land ${Math.round((100 * lands) / m)}% [${res.join('')}]; on the beats after the knock: ${onBeats.join(' ')}`);
}

// ───────── SWING ─────────
const VINE = { dx: 165, top: 410, len: 410 };
function letGo(row: RiverRow, k: number, lock: number, grip: number): 'LOG' | 'BANK' | 'WATER' | 'HANG' {
  let id = 100;
  const bank: Platform = { id: 1, x: 0, y: FLOOR, width: LIP, height: 200, type: 'solid' } as Platform;
  const w = riverWidth(row);
  const far: Platform = { id: 2, x: LIP + w, y: FLOOR, width: 3000, height: 200, type: 'solid' } as Platform;
  const { logs } = layRiver(row, LIP, FLOOR, () => id++);
  const vine = { id: 50, x: LIP + VINE.dx, topY: FLOOR - VINE.top, bottomY: FLOOR - VINE.top + VINE.len, vineType: 'swing_liana', swingAmp: TIMED.amp, swingPeriod: TIMED.period, swingPhase: 0 } as unknown as Vine;
  reset([bank, far, ...logs], [vine]);
  const len = Math.min(VINE.len * grip, VINE.len - 20);
  // the river at game time (k + lock) frames: both clocks one bar long, so `lock` is the river's phase against the swing
  r.t = ((k + lock) * DT) % riverBeat(row);
  r.swing(vine, { angle: 0, omega: 0, len, t: k * DT });
  inp.triggerTouchMove('right');
  inp.triggerTouchUp(0, 400);
  for (let f = 0; f < 120; f++) {
    if (f === 12) inp.releaseTouchUp();
    r.e.update(DT);
    const p = r.p;
    if (p.isVineSwinging) continue;
    if (p.grounded) { const q = r.platforms.find((x) => x.id === r.standingOn); return q?.type === 'drift' ? 'LOG' : 'BANK'; }
    if (p.y > FLOOR + 120) return 'WATER';
  }
  return 'HANG';
}
function flySwing(name: string, row: RiverRow) {
  const n = Math.round(TIMED.period / DT);
  let best = { lock: 0, win: 0, start: 0, grid: '' };
  for (let L = 0; L < 16; L++) {
    const lock = Math.round((L * n) / 16);
    const g = Array.from({ length: n }, (_, k) => letGo(row, k, lock, 0.7));
    const A = g.map((o) => o === 'LOG');
    // the longest run of landing presses round the swing
    let win = 0, start = 0;
    for (let a = 0; a < n; a++) { let c = 0; while (c < n && A[(a + c) % n]) c++; if (c > win) { win = c; start = a; } }
    if (win > best.win) best = { lock, win, start, grid: g.map((o) => (o === 'LOG' ? '#' : o === 'BANK' ? 'b' : o === 'WATER' ? '.' : 'h')).join('') };
  }
  // where the beats fall: put ONE in the middle of the window (the design's lock of the swing to the court's bar)
  const mid = (best.start + best.win / 2) % n;
  say(`${name.padEnd(8)} speed ${row.speed} log ${row.logW} spacing ${f2(riverBeat(row))} s, swing ${TIMED.period} s: best lock ${best.lock} frames; let-go window ${best.win} frames (${f2(best.win * DT)} s = ${(best.win * DT / B).toFixed(2)} beats) from swing frame ${best.start}; ONE at frame ${mid.toFixed(1)} lands with ${f2((best.win / 2) * DT)} s either side; presses [${best.grid}]`);
}

// ───────── the court's rows (the design's; spacing a whole number of beats, read back by riverBeat) ─────────
const ROWS: Record<string, RiverRow> = easy
  ? {
      court: { dir: 1, speed: 70, logW: 159, logs: 3, safe: true }, // 231 px / 70 = 3.3 s = one Easy bar
      double: { dir: 1, speed: 70, logW: 159, logs: 3 }, // Easy keeps one log a bar in the twist (never faster)
      barge: { dir: 1, speed: 70, logW: 390, logs: 2 }, // 462 px / 70 = 6.6 s = two Easy bars
    }
  : {
      court: { dir: 1, speed: 80, logW: 156, logs: 3, safe: true }, // 228 px / 80 = 2.85 s = one bar
      double: { dir: 1, speed: 140, logW: 127.5, logs: 3 }, // 199.5 px / 140 = 1.425 s = two beats (the twist)
      barge: { dir: 1, speed: 80, logW: 384, logs: 2 }, // 456 px / 80 = 5.7 s = two bars
    };

if (what === 'hop' || what === 'all') {
  const a = hop(true), b = hop(false);
  say(`\nHOP: tap at a run ${f2(a.s)} s ${a.along} px; from a stand, right held ${f2(b.s)} s ${b.along} px; a beat is ${f2(B)} s: ${f2(B - a.s)} s on the floor between beat hops`);
}
if (what === 'beat' || what === 'all') flyBeat();
if (what === 'log' || what === 'all') { say('\nLOG: board from the lip, a tap at every frame of one spacing after a knock (# log, . water, b bank)'); for (const [k, row] of Object.entries(ROWS)) flyLog(k, row); }
if (what === 'swing' || what === 'all') { say('\nSWING: a held let-go (grip 0.7) at every frame of the swing, the river locked 16 ways against it (# log, b bank, . water)'); flySwing('court', ROWS.court); }

const here = dirname(fileURLToPath(import.meta.url));
mkdirSync(join(here, 'out'), { recursive: true });
writeFileSync(join(here, 'out', `court29-${setting}${what === 'all' ? '' : '-' + what}.txt`), out.join('\n') + '\n');
