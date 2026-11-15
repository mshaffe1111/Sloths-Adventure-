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
import type { Platform } from '../types.ts';
import { driftCycle, driftX, gapFor, hopLimit, logLayout, LOG_DROP, LOG_HEIGHT, surfaceBelowBank, type DriftInfo, type RiverZone } from '../river.ts';

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
} as const;

/** the gap a row's logs keep */
export const rowGap = (row: Pick<RiverRow, 'dir' | 'speed' | 'gap'>): number => row.gap ?? Math.round(gapFor(row.dir, row.speed));
/** the water's width, bank to bank */
export const riverWidth = (row: RiverRow): number => (row.logs + 1) * (row.logW + rowGap(row)) - row.logW;
/** how long he waits at the bank between two logs (s) */
export const riverBeat = (row: RiverRow): number => (row.logW + rowGap(row)) / row.speed;

/**
 * Lay one river: the water from `x0` (the near bank's end) across `riverWidth(row)` to the far bank's start, under banks whose top is
 * `bankY`, and its logs (platforms 'drift', ids from `nextId`). The zone's `safe` sets him back 70 px short of the edge on the near bank.
 */
export function layRiver(row: RiverRow, x0: number, bankY: number, nextId: () => number): { zone: RiverZone; logs: Platform[]; petals: Array<{ log: Platform; dx: number; dy: number }> } {
  const gap = rowGap(row);
  const width = riverWidth(row);
  const x1 = x0 + width;
  const logY = bankY + LOG_DROP;
  const { count, period } = logLayout({ dir: row.dir, speed: row.speed, logW: row.logW, gap, width });
  const logs: Platform[] = [];
  for (let i = 0; i < count; i++) {
    const drift: DriftInfo = { x0, x1, dir: row.dir, speed: row.speed, width: row.logW, offset: (i * period) / count, baseY: logY };
    const p: Platform = { id: nextId(), x: x0, y: logY, width: row.logW, height: LOG_HEIGHT, type: 'drift', style: 'log', drift };
    p.x = driftX(drift, 0);
    logs.push(p);
  }
  const zone: RiverZone = { x0, x1, surfaceY: bankY + surfaceBelowBank, dir: row.dir, speed: row.speed, ...(row.safe ? { safe: { backX: x0 - 70, backY: bankY } } : {}) };
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
 *     see coming (so a river flowing back at him is never wider than the view plus its logs' spacing).
 * Still water (speed 0, a splash-back pond, a lily pond) and open water (crossed some other way) are not log rivers: none of this applies.
 */
export function riverFaults(st: { platforms: readonly Platform[]; rivers?: readonly RiverZone[] }): string[] {
  const out: string[] = [];
  const solids = st.platforms.filter((p) => p.type === 'solid' && !p.broken);
  for (const r of st.rivers ?? []) {
    if (r.speed === 0 || r.open || r.raft || r.flood) continue;
    const at = `river at x=${Math.round(r.x0)}`;
    const logs = st.platforms.filter((p) => p.type === 'drift' && p.drift && p.drift.x0 === r.x0 && p.drift.x1 === r.x1).map((p) => p.drift!);
    if (logs.length < 2) { out.push(`${at}: ${logs.length} logs, under 2`); continue; }
    const d = logs[0];
    const spacing = (d.x1 - d.x0 + d.width) / logs.length;
    const gap = spacing - d.width;
    if (gap < RIVER_LAY.minGap) out.push(`${at}: ${Math.round(gap)} px between logs, under ${RIVER_LAY.minGap}`);
    if (gap > hopLimit(d.dir)) out.push(`${at}: ${Math.round(gap)} px between logs, past a hop (${hopLimit(d.dir)})`);
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
    if (d.dir === -1 && r.x1 - r.x0 > RIVER_LAY.view + spacing) out.push(`${at}: it flows back at him across ${Math.round(r.x1 - r.x0)} px, so the next log comes out of sight (over ${Math.round(RIVER_LAY.view + spacing)})`);
  }
  return out;
}
