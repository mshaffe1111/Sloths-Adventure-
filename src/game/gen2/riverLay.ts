/**
 * gen2/riverLay — the RIVER as one lay any world uses (ENG-W2 (2), 11-14; reference/design/2-1.md "NEW 1"): drifting logs between two
 * banks from a row of data (river.ts's rules, recipes and log clock), and the fairness checks a laid river is held to. Pure (no canvas,
 * no engine): the hand-built World 2 stages lay their rivers through it today (w2Stages.ts river(): the stage lock holds them byte for
 * byte), and the gen2 river section lays through it next (the place rule: EXACT NEXT STEP in reference/qa-reports/ENG-W2/REPORT.md).
 *
 * A river's row is data (a world's table: w2.ts W2_RIVERS): which way it flows, how fast, its logs' length, how many log spacings of
 * water lie between the banks, and whether a fall splashes him back. Everything else follows from river.ts:
 *   - the gap between logs is river.ts gapFor (a river flowing back at him may keep its logs closer: they come toward him), unless the
 *     row names its own;
 *   - the water is an exact whole number of log spacings (minus one log), so the logs sit evenly all the way round (river.ts logLayout);
 *   - each log's offset spaces it on the river's one clock (driftX), so the game, the validator and the bots agree where a log is.
 */
import type { Platform, Vine } from '../types.ts';
import { driftCycle, driftX, gapFor, hopLimit, lianasOver, lianasOverLogs, logLayout, LOG_DROP, LOG_HEIGHT, onRiver, riverEnd, surfaceBelowBank, DRIFT_CATCH, type DriftInfo, type RiverZone } from '../river.ts';
import { airStep, ASSIST, canGrabSwing, FORGIVE, flyLaunch, FORWARD_END, forwardEndLands, PHYS, pressLaunches, secondJumpV, vinePeriod, type AirBody, type PressLaunch } from '../physics.ts';
import { withSetting } from '../settingDials.ts';
import { gripsOf, lianaCaught } from '../levelCheck.ts';
import { LAND_IN } from './landings.ts';
import { RIDE } from '../ride.ts';
import type { Difficulty } from '../difficulty.ts';

/** a river as data: a world's row */
export interface RiverRow {
  /** +1 flows the way he runs, -1 back at him */
  dir: 1 | -1;
  /** px per second (river.ts: 70-120 in World 2; never as fast as his run, so riding is a rest, never a shortcut) */
  speed: number;
  /** a log's length (px) */
  logW: number;
  /** log spacings of water between the banks (the window is (logs + 1) spacings minus one log) */
  logs: number;
  /** edge-to-edge space between neighbouring logs (px); unset: river.ts gapFor */
  gap?: number;
  /** a fall splashes him back onto the near bank, nothing lost (the teaching river) */
  safe?: boolean;
  /** how many of its logs carry one petal each, from the first log (data; unset: none). Each rides its log (Collectible.rides,
   *  ridePickups.ts): at its middle, PETAL_SIT over its top, hidden with it under a bank */
  petals?: number;
  /** what floats on it (data; unset: logs). 'raft': a lashed raft (R-165.288; 2-4's last row to the jetty): the same carrier on the same
   *  clock, drawn as World 2's painted raft (riverArt.ts drawRiverLog), its deck the walkable top (art = collider) */
  look?: 'raft';
  /**
   * its TAIL (ENG-24e, R-165.301; data, unset: none): log-free water this wide (px) between where the logs go under and the far bank. The
   * logs' window (`logs` spacings, as ever) ends `tail` short of the far bank, under World 2's painted end (riverArt.ts drawRiverTail), so a
   * rider cannot ride a log bank to bank: the way across is something else (2-4's liana: up from the log, its let-go onto the far bank).
   * riverFaults holds it wider than the farthest a rider reaches off a log's end (rideReach + RIVER_LAY.tailMargin)
   */
  tail?: number;
}

/** how high over its log's top a riding petal sits (px): a petal's height over the floor it is laid on (the sections' pickup `dn`) */
export const PETAL_SIT = 34;

/** the numbers a laid river is held to (riverFaults) */
export const RIVER_LAY = {
  /** the least gap between logs (px): closer, two logs read as one (levelCheck's own floor) */
  minGap: 60,
  /** the least bank before the water where he waits for a log (px): the hand-built World 2's least lead into a river (w2Stages river():
   *  run 120-135 px before the water), the bank every shipped World 2 river has been played from */
  board: 120,
  /** the longest wait between two logs at the bank (s): a beat he can count (2-1.md: 242 px at 70 px/s is 3.5 s) */
  beat: 4,
  /** the fastest a river may run (px/s): it carries him, it never outruns his walk (physics.ts maxRun 285 at half) */
  speed: 143,
  /** the most of the river an upright phone shows ahead of where he stands (px; level.md World 1 notes): the next log's slide-out tell
   *  must be inside it from the bank he boards at, or he hops blind */
  view: 425,
  /** a tail's margin past the farthest a rider reaches off a log's end (px; rideReach): two frames of the fastest run on the fastest
   *  river ((PHYS.maxRun 285 + RIVER_LAY.speed 143) / 30 = 14.3 px a frame), for a take-off a frame off the flight's */
  tailMargin: 30,
} as const;

/** the gap a row's logs keep */
export const rowGap = (row: Pick<RiverRow, 'dir' | 'speed' | 'gap'>): number => row.gap ?? Math.round(gapFor(row.dir, row.speed));
/** the logs' window: from the near bank to where they go under (the far bank, or the painted end before a tail) */
export const carrierWidth = (row: RiverRow): number => (row.logs + 1) * (row.logW + rowGap(row)) - row.logW;
/** the water's width, bank to bank (the logs' window and its tail) */
export const riverWidth = (row: RiverRow): number => carrierWidth(row) + (row.tail ?? 0);
/** how long he waits at the bank between two logs (s) */
export const riverBeat = (row: RiverRow): number => (row.logW + rowGap(row)) / row.speed;

/**
 * Lay one river: the water from `x0` (the near bank's end) across `riverWidth(row)` to the far bank's start, under banks whose top is
 * `bankY`, and its logs (platforms 'drift', ids from `nextId`) across the logs' window (carrierWidth: the water less its tail). The zone's
 * `safe` sets him back 70 px short of the edge on the near bank.
 */
export function layRiver(row: RiverRow, x0: number, bankY: number, nextId: () => number): { zone: RiverZone; logs: Platform[]; petals: Array<{ log: Platform; dx: number; dy: number }> } {
  const gap = rowGap(row);
  const width = carrierWidth(row);
  const tail = row.tail ?? 0;
  const x1 = x0 + width;
  const logY = bankY + LOG_DROP;
  const { count, period } = logLayout({ dir: row.dir, speed: row.speed, logW: row.logW, gap, width });
  const logs: Platform[] = [];
  for (let i = 0; i < count; i++) {
    const drift: DriftInfo = { x0, x1, dir: row.dir, speed: row.speed, width: row.logW, offset: (i * period) / count, baseY: logY, ...(row.look ? { look: row.look } : {}), ...(tail ? { tail } : {}) };
    const p: Platform = { id: nextId(), x: x0, y: logY, width: row.logW, height: LOG_HEIGHT, type: 'drift', style: 'log', drift };
    p.x = driftX(drift, 0);
    logs.push(p);
  }
  const zone: RiverZone = { x0, x1: x1 + tail, surfaceY: bankY + surfaceBelowBank, dir: row.dir, speed: row.speed, ...(row.safe ? { safe: { backX: x0 - 70, backY: bankY } } : {}), ...(tail ? { tail } : {}) };
  const petals = logs.slice(0, Math.max(0, row.petals ?? 0)).map((log) => ({ log, dx: Math.round(log.width / 2), dy: -PETAL_SIT }));
  return { zone, logs, petals };
}

/**
 * What is unfair about a stage's log rivers, in words (none: they may be laid). For each river with a current:
 *   - two logs or more on it, evenly spaced, a gap between neighbours a hop clears (river.ts hopLimit) and at least RIVER_LAY.minGap;
 *   - it runs no faster than RIVER_LAY.speed, and a log reaches the bank at least every RIVER_LAY.beat s;
 *   - a bank at each end, with RIVER_LAY.board of it to wait on before the water;
 *   - the next log's slide-out (where it comes out from under a bank) is inside an upright screen of where he boards: with the current,
 *     the near bank's own edge; against it, the far bank's edge, which must be within RIVER_LAY.view of the near one plus a log he can
 *     see coming (so a river flowing back at him is never wider than the view plus its logs' spacing);
 *   - a TAIL (RiverRow.tail) is wider than the farthest a rider reaches off a log's end (rideReach) by RIVER_LAY.tailMargin, so no log
 *     carries him within a jump of the far bank.
 * Still water (speed 0, a splash-back pond, a lily pond) and open water (crossed some other way) are not log rivers: none of this applies.
 */
/** a stage turned about a river he crosses right to left (RiverZone.way): x becomes `x0 + x1 - x`, the current and the logs' windows with it,
 *  so the river reads as one crossed rightwards (gen2/legs.ts reflectLeg's own mirror, for the judge only: the stage is not changed) */
function rightwards(r: RiverZone, platforms: readonly Platform[], vines: readonly Vine[]): { r: RiverZone; platforms: Platform[]; vines: Vine[] } {
  const sum = r.x0 + r.x1;
  const turn = (p: Platform): Platform => ({ ...p, x: sum - p.x - p.width, ...(p.drift ? { drift: { ...p.drift, x0: sum - p.drift.x1, x1: sum - p.drift.x0, dir: -p.drift.dir as 1 | -1 } } : {}) });
  const { way: _w, ...rest } = r;
  return { r: { ...rest, x0: sum - r.x1, x1: sum - r.x0, dir: -r.dir as 1 | -1 }, platforms: platforms.map(turn), vines: vines.map((v) => ({ ...v, x: sum - v.x })) };
}

export function riverFaults(st: { platforms: readonly Platform[]; rivers?: readonly RiverZone[]; vines?: readonly Vine[] }, difficulty: Difficulty = 'normal'): string[] {
  const out: string[] = [];
  for (const r0 of st.rivers ?? []) {
    if (r0.speed === 0 || r0.open || r0.raft || r0.flood) continue;
    const at = `river at x=${Math.round(r0.x0)}`;
    // (a river he crosses right to left (a leg laid left, RiverZone.way) is judged in its own frame: the stage turned about it, so his near
    //  bank is on the left and `dir` is the current against or with him, as every rule below reads it)
    const { r, platforms, vines } = r0.way === -1 ? rightwards(r0, st.platforms, st.vines ?? []) : { r: r0, platforms: st.platforms, vines: st.vines ?? [] };
    const solids = platforms.filter((p) => p.type === 'solid' && !p.broken);
    // (a liana hung over it (place `river` after a liana, ENG-24): its logs are a let-go's landing, crossed by the vine, never hopped log
    //  to log, so the hop rule gives way to the drop's (lianaRiverFaults); every other rule stands. ENG-24f, the lead's ruling 11-19 9:12 PM
    //  ET: a liana is judged by what is under its throw. One hung over the TAIL (river.ts lianasOverLogs: its anchor at or past the logs'
    //  window end) throws over open water: World 1's vine rules (tailLianaFaults), never the share, and the logs before it are hopped)
    const over = lianasOverLogs(vines, r);
    const overTail = lianasOver(vines, r).filter((v) => !over.includes(v));
    const logs = platforms.filter((p) => p.type === 'drift' && p.drift && onRiver(p.drift, r)).map((p) => p.drift!);
    if (logs.length < 2) { out.push(`${at}: ${logs.length} logs, under 2`); continue; }
    const d = logs[0];
    const spacing = (d.x1 - d.x0 + d.width) / logs.length;
    const gap = spacing - d.width;
    if (gap < RIVER_LAY.minGap) out.push(`${at}: ${Math.round(gap)} px between logs, under ${RIVER_LAY.minGap}`);
    if (gap > hopLimit(d.dir) && !over.length) out.push(`${at}: ${Math.round(gap)} px between logs, past a hop (${hopLimit(d.dir)})`);
    const offs = logs.map((q) => q.offset).sort((a, b) => a - b), T = driftCycle(d);
    for (let i = 0; i < offs.length; i++) {
      const next = i + 1 < offs.length ? offs[i + 1] : offs[0] + T;
      if (Math.abs(next - offs[i] - T / offs.length) > 0.05) { out.push(`${at}: its logs are not evenly spaced`); break; }
    }
    if (d.speed > RIVER_LAY.speed) out.push(`${at}: it runs at ${d.speed} px/s, over ${RIVER_LAY.speed}`);
    if (spacing / d.speed > RIVER_LAY.beat + 1e-6) out.push(`${at}: a log every ${(spacing / d.speed).toFixed(1)} s, over ${RIVER_LAY.beat}`);
    const near = solids.find((p) => Math.abs(p.x + p.width - r.x0) <= 2);
    const far = solids.find((p) => Math.abs(p.x - r.x1) <= 2);
    if (!near || !far) { out.push(`${at}: no bank at one end`); continue; }
    if (near.width < RIVER_LAY.board) out.push(`${at}: ${near.width} px of bank to wait on, under ${RIVER_LAY.board}`);
    // (a river flowing back at him: its logs come out at the window's far end, the painted end before a tail or the far bank)
    if (d.dir === -1 && d.x1 - r.x0 > RIVER_LAY.view + spacing) out.push(`${at}: it flows back at him across ${Math.round(d.x1 - r.x0)} px, so the next log comes out of sight (over ${Math.round(RIVER_LAY.view + spacing)})`);
    if (d.tail) {
      const reach = Math.ceil(rideReach(d.dir, d.speed));
      if (d.tail < reach + RIVER_LAY.tailMargin) out.push(`${at}: its tail of ${Math.round(d.tail)} px is inside a jump off a log's end (${reach} px + ${RIVER_LAY.tailMargin}): he rides to the far bank on a log alone`);
    }
    if (over.length) out.push(...lianaRiverFaults(r, logs, over, near, difficulty).map((f) => `${at}: ${f}`));
    if (overTail.length) out.push(...tailLianaFaults(r, logs, overTail, near, far, difficulty).map((f) => `${at}: ${f}`));
  }
  return out;
}

/**
 * The farthest a rider reaches toward the far bank off a log's end (px, from his middle where the log goes under, river.ts DriftInfo.x1, to
 * the bank's lip), on a river flowing `dir` at `speed` px/s: what a TAIL must be wider than (riverFaults). Flown with the engine's own air
 * step (physics.ts airStep, 30 fps) at the strongest jump the game ever gives, Easy's (whatever the setting: a player just off Easy keeps
 * its help for five stages, engine.ts assistNow): he runs off the log's end at his full run plus the log's speed (RIDE.keep), jumps
 * within his coyote time (FORGIVE.easy.coyote + ASSIST.coyote) unless the water takes him first (feet 8 px under its surface, engine.ts),
 * holds it, and takes the second jump (ASSIST.doubleJump stronger) on its best frame. He reaches the bank when his front (his middle + 22,
 * half his 44 px body) meets its lip with his feet no lower than its top's hoist (FORGIVE.mantle) and not rising fast (engine.ts mantle).
 */
export function rideReach(dir: 1 | -1, speed: number): number {
  const F = 1 / 30, top = 0, bankTop = top - LOG_DROP, sink = top + (surfaceBelowBank - LOG_DROP) + 8;
  const coyote = FORGIVE.easy.coyote + ASSIST.coyote;
  let best = 0;
  for (let c = 0; c * F <= coyote + 1e-9; c++) {
    for (let k = 1; k <= 45; k++) {
      const b: AirBody = { x: 0, y: top, vx: PHYS.maxRun + dir * speed * RIDE.keep.x, vy: 0 };
      let wet = false;
      for (let i = 0; i < c && !wet; i++) { airStep(b, F, 1); wet = b.y > sink; }
      if (wet) break;
      b.vy = -PHYS.jumpV;
      for (let i = 1; i <= 120; i++) {
        if (i === k) b.vy = secondJumpV(b.vy, PHYS.doubleV * (1 + ASSIST.doubleJump));
        airStep(b, F, 1, true);
        if (b.y <= bankTop + FORGIVE.easy.mantle && b.vy >= -120) best = Math.max(best, b.x + BODY_W / 2);
        if (b.y > sink) break;
      }
    }
  }
  return best;
}

// ───────────────────────────── a liana over a river (ENG-24; reference/design/2-4.md NEW 1) ─────────────────────────────
/**
 * The numbers a liana over a log river is held to (reference/design/2-4.md "Engine" NEW 1, flown on the real engine by
 * reference/specs/sims/swingLog.ts, DESIGN-24-25; the lead's ruling: the GAP between logs is the knob). The river under a liana is its
 * let-go's landing: every moment of the vine's swing against every moment of the logs' spacing (both clocks), a press to let go lands
 * him on a log (LOG) or not. Held to the DROP share, never riverFaults' hop rule (its water is crossed by the vine, like RiverZone.open):
 *   - `share`: the least share of let-go moments that land him on a log, or past the water on the far bank (the way on: a liana hung
 *     near the far bank throws him onto it), never back on the bank he came from (Normal 40%: gap280's 41% is the design's hardest row;
 *     Easy 85%, its dense rows only);
 *   - `wait`: the longest he waits on the vine, from any moment, for the next press that lands (Normal: one swing of the liana, its own
 *     period; Easy 0.6 s);
 *   - `easyCatch`: on Easy, a river whose way on is a liana caught from its log (no bank reaches the liana) runs at most this fast
 *     (px/s: the design flew Easy's catches at 80 px/s and under only);
 *   - and a liana no bank reaches must be caught from the log: a held jump off a log the river carries under it catches it.
 */
export const LIANA_RIVER = {
  share: { normal: 0.4, easy: 0.85 },
  wait: { normal: 'swing', easy: 0.6 },
  easyCatch: 80,
  /** the holds flown (shares of the liana's length from its anchor: pressWindow's), the worse counts */
  grips: [0.7, 0.95],
} as const;

/** how a liana's let-go lands on a river's logs (lianaDrops): the share of let-go moments onto a log, and the longest wait (s) */
export interface LianaDrops {
  share: number;
  wait: number;
  /** the liana's own swing (s) */
  period: number;
}
const FRAME = 1 / 30;
/** Pokey's collider width (engine.ts player: 44 px), what a log's catch is measured against (engine.ts onFloor, DRIFT_CATCH) */
const BODY_W = 44;

/**
 * One let-go's way down over a river's window (R-165.289: the drop judge's flight, lianaDrops, and the engine's let-go glow, letGoCue.ts,
 * fly it here, so the glow and the judge can never disagree): `far`, he comes down on the bank past the water (the way on, whatever the
 * logs do); else `cross`, the frames his feet come down through a log's top inside the window before any bank takes him (where, how fast,
 * how long after the press in s, and whether from above). Flown as lianaDrops always has: the jump held, right held, the engine's air turn.
 * (ENG-285: split out as ENG-24c split it, word for word, so the planted test lands the judge's own call against the engine's; the
 * engine's frame order is pinned there: the logs move before he does, on the game's clock, from the frame of the press.)
 */
export interface LetGoFall {
  far: boolean;
  cross: Array<{ x: number; vx: number; dt: number; above: boolean }>;
}
export function letGoFall(l: PressLaunch, w: Pick<DriftInfo, 'x0' | 'x1' | 'baseY' | 'tail'>): LetGoFall {
  const top = w.baseY, bankTop = top - LOG_DROP;
  // (the far bank's lip: the logs' window's end, or past its tail of log-free water, ENG-24e: a let-go into the tail is in the water)
  const end = riverEnd(w);
  const cross: LetGoFall['cross'] = [];
  let far = false;
  flyLaunch(l, { held: 99, dbl: 99 }, top + 200, (c: AirBody, t: number, prevY: number) => {
    if (c.vy < 0) return false;
    const inWindow = c.x >= w.x0 && c.x <= w.x1;
    if ((c.x < w.x0 || c.x > end) && prevY <= bankTop + 14 && c.y >= bankTop) {
      far = c.x > end;
      return true;
    }
    if (inWindow && prevY <= top + DRIFT_CATCH.drop && c.y >= top) cross.push({ x: c.x, vx: c.vx, dt: t - l.pt, above: prevY < top - 2 });
    return c.y > top + DRIFT_CATCH.drop;
  });
  return { far, cross };
}

/**
 * Does let-go `f` come down on one of `logs` when the river's clock reads `off` as he presses? As the engine lands him on a drift
 * platform (onFloor): his middle within the log by DRIFT_CATCH.side of his width (Easy + easySide), his feet coming down through its top
 * within DRIFT_CATCH.drop (letGoFall); Easy's ledge forgiveness, FORGIVE.landPx, for a foot just off its end moving toward it. `inset`
 * (px, the glow's margin, letGoCue.ts; the judge none): the catch that much narrower at each end.
 */
export function fallOnLog(f: LetGoFall, logs: readonly DriftInfo[], off: number, easy: boolean, inset = 0): boolean {
  const half = BODY_W * (DRIFT_CATCH.side + (easy ? DRIFT_CATCH.easySide : 0)) - inset;
  const landPx = easy ? FORGIVE.easy.landPx : 0;
  return f.cross.some((q) => logs.some((d) => {
    const lx = driftX(d, q.dt + off);
    if (q.x + half > lx && q.x - half < lx + d.width) return true;
    if (!landPx || !q.above) return false;
    const missL = lx - (q.x + half), missR = q.x - half - (lx + d.width);
    return Math.max(missL, missR) <= landPx && (missL > 0 ? q.vx : -q.vx) >= 30;
  }));
}

/**
 * Every let-go of liana `v` onto the logs `logs` (one river's: its x0..x1 window), as the engine plays the press (physics.ts pressLaunches:
 * the sweet spot's leap, the press a beat early or late) and lands it (engine.ts onFloor on a drift platform: his middle within the log
 * by DRIFT_CATCH.side of his width (Easy + easySide), his feet coming down through its top within DRIFT_CATCH.drop; Easy's ledge
 * forgiveness, FORGIVE.landPx, for a foot just off its end moving toward it; a log only between its banks). One flight per press (the
 * jump held, right held: a flick lands the same within a point, swingLog.ts), then every phase of the logs' spacing read off it: the
 * vine and the river are two clocks, and a waiting player meets every pair (the river's phase `j` is its phase as he presses). The wait
 * is read on the timeline where both run together.
 */
export function lianaDrops(v: Vine, logs: readonly DriftInfo[], difficulty: Difficulty): LianaDrops {
  return withSetting(difficulty, () => {
    const easy = difficulty === 'easy';
    const d0 = logs[0];
    const spacing = (d0.x1 - d0.x0 + d0.width) / logs.length / d0.speed;
    const m = Math.max(1, Math.round(spacing / FRAME));
    const period = vinePeriod(v);
    let share = 1, wait = 0;
    for (const g of LIANA_RIVER.grips) {
      const L = pressLaunches(v, g);
      const n = L.length;
      const G = new Uint8Array(n * m);
      L.forEach((l, k) => {
        const f = letGoFall(l, d0);
        // (on the far bank: the way on, whatever the logs are doing)
        if (f.far) G.fill(1, k * m, (k + 1) * m);
        else for (let j = 0; j < m; j++) if (fallOnLog(f, logs, (j * spacing) / m, easy)) G[k * m + j] = 1;
      });
      let lands = 0;
      for (let i = 0; i < G.length; i++) lands += G[i];
      share = Math.min(share, lands / G.length);
      // (the wait: from every pair of moments, frames to the next pair that lands, both clocks running together; capped at four swings)
      const cap = 4 * Math.max(n, m);
      let worst = 0;
      for (let k0 = 0; k0 < n; k0++) for (let j0 = 0; j0 < m; j0++) {
        let tau = 0;
        while (tau < cap && !G[((k0 + tau) % n) * m + ((j0 + tau) % m)]) tau++;
        if (tau > worst) worst = tau;
      }
      wait = Math.max(wait, worst * FRAME);
    }
    return { share, wait, period };
  });
}

/**
 * Does a held jump off a log the river carries under liana `v` catch it (a jump timed for it, as levelCheck's catch off a ledge:
 * canGrabSwing on the line the vine swings through)? He stands on the log (its speed his, RIDE.keep) or runs on it (his run on top), from
 * every point of the ride up to the vine.
 */
export function logCatches(v: Vine, d: DriftInfo): boolean {
  const top = d.baseY;
  for (let x = Math.max(d.x0, v.x - 420); x <= Math.min(d.x1, v.x + 60); x += 10) {
    for (const run of [0, PHYS.maxRun]) {
      const b: AirBody = { x, y: top, vx: d.dir * d.speed * RIDE.keep.x + run, vy: -PHYS.jumpV };
      for (let i = 0; i < 90; i++) {
        airStep(b, FRAME, 1, true);
        if (b.y > top + 40) break;
        if (canGrabSwing(b.x, b.y, v) && Math.abs(b.vx) > 25) return true;
      }
    }
  }
  return false;
}

/** what is unfair about the lianas over one log river (its logs `logs`, its near bank `near`), in words */
export function lianaRiverFaults(r: RiverZone, logs: readonly DriftInfo[], over: readonly Vine[], near: Platform | undefined, difficulty: Difficulty): string[] {
  const out: string[] = [];
  const easy = difficulty === 'easy';
  for (const v of over) {
    const at = `the liana at x=${Math.round(v.x)}`;
    const { share, wait, period } = lianaDrops(v, logs, difficulty);
    const needShare = LIANA_RIVER.share[difficulty];
    const needWait = easy ? LIANA_RIVER.wait.easy : period;
    if (share < needShare) out.push(`${at}: ${Math.round(share * 100)}% of its let-gos land on a log, under ${Math.round(needShare * 100)}%`);
    if (wait > needWait + 1e-6) out.push(`${at}: he waits ${wait.toFixed(2)} s on it for a let-go that lands on a log, over ${needWait.toFixed(2)} s`);
    // (no bank reaches it: the way on is a catch from a log)
    const fromBank = !!near && lianaCaught(near, v, 1, r.surfaceY);
    if (!fromBank) {
      if (!logs.some((d) => logCatches(v, d))) out.push(`${at}: no bank reaches it and no jump off a log catches it`);
      if (easy && r.speed > LIANA_RIVER.easyCatch) out.push(`${at}: caught from a log on a river at ${r.speed} px/s, over Easy's ${LIANA_RIVER.easyCatch}`);
    }
  }
  return out;
}

/**
 * What is unfair about the lianas hung over a log river's TAIL (ENG-24f, the lead's ruling 11-19 9:12 PM ET, level.md World 2 notes): its
 * anchor at or past the logs' window end (river.ts lianasOverLogs), so every let-go throws over log-free water, a swing over open water
 * held to World 1's vine rules, never the log-drop share (which no let-go over a tail can meet: no log is under it):
 *   - FAR, the testers' let-go (level.md World 1 notes; physics.ts forwardEndLands, FORWARD_END 0.75, from every hold its grip dial names,
 *     the jump held, as gen2 lays a perch he reaches by what he sees, pipeline lianaBand): it lands his middle LAND_IN inside the far bank;
 *   - the wait: that let-go is on the first forward sweep of every swing, so he never waits more than one swing on it for a landing one
 *     (lianaRiverFaults' Normal wait), with nothing to time against the logs;
 *   - caught as a liana over logs is: from the near bank (levelCheck lianaCaught), else by a held jump off a log the river carries under it
 *     (logCatches), on Easy only on a river at most LIANA_RIVER.easyCatch fast.
 * Its way on is the far bank (a liana chained past it over the tail is not judged here: such a stage is refused until it is).
 */
export function tailLianaFaults(r: RiverZone, logs: readonly DriftInfo[], over: readonly Vine[], near: Platform | undefined, far: Platform, difficulty: Difficulty): string[] {
  const out: string[] = [];
  const easy = difficulty === 'easy';
  for (const v of over) {
    const at = `the liana at x=${Math.round(v.x)} over the tail`;
    const y = far.y;
    const lands = (c: AirBody, _t: number, prevY: number) => c.vy >= 0 && prevY <= y + 14 && c.y >= y && c.x >= far.x + LAND_IN.px && c.x <= far.x + far.width - LAND_IN.px;
    const fwd = withSetting(difficulty, () => forwardEndLands({ x: v.x, topY: v.topY, bottomY: v.bottomY, swingAmp: v.swingAmp, swingPeriod: v.swingPeriod, swingPhase: 0 }, lands, gripsOf(v.grip, v.bottomY - v.topY)));
    if (!fwd) out.push(`${at}: the testers' let-go (FORWARD_END ${FORWARD_END}) does not land him ${LAND_IN.px} px inside the far bank`);
    const fromBank = !!near && lianaCaught(near, v, 1, r.surfaceY);
    if (!fromBank) {
      if (!logs.some((d) => logCatches(v, d))) out.push(`${at}: no bank reaches it and no jump off a log catches it`);
      if (easy && r.speed > LIANA_RIVER.easyCatch) out.push(`${at}: caught from a log on a river at ${r.speed} px/s, over Easy's ${LIANA_RIVER.easyCatch}`);
    }
  }
  return out;
}
