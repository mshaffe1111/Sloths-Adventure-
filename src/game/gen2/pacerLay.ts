/**
 * gen2/pacerLay: lay a stage's PACER (pacer.ts; 2-7's mail boat, reference/design/2-7.md NEW 1) on its built ground, when its graph's
 * brief names a pacer table (GraphBrief.pacer). The race leg is the run leg laid straight after the stage's last column (gen2 legs.ts:
 * 2-7's home leg after the weir), and the dock is the stage's exit, on that leg. Its time is the design's rule, from the laid leg:
 *   the careful middle's time = each river on the leg crossed at its row's flown rate (with `crossingBank` px of bank) + the rest of the
 *   leg at the bank rate; the pacer's = that x (1 + the setting's share), and never more than the ride-only time (the same, at the ride-only
 *   rates) less `under`. A river's row is found by what it is (its current's speed and its logs' length, the world's river rows): a
 *   river no flown row matches, or two with different rates, is refused by name, as is a stage with no race leg or no fair race.
 * No stage id, world number, seed or x.
 */
import type { Pacer, PacerRow } from '../pacer.ts';
import { pacerFaults } from '../pacer.ts';
import type { RiverRow } from './riverLay.ts';
import type { Gen2Stage } from './types.ts';

/** how far above the race leg's highest top his feet may be and still be on it (a hop: the out leg above lies far higher) */
const ON_LEG = 60;

export function layPacer(st: Gen2Stage, table: PacerRow, rows: Readonly<Record<string, RiverRow>>, easy: boolean): { pacer?: Pacer; problems: string[] } {
  const legs = st.gen2.tower?.legs ?? [];
  const col = legs.map((g, i) => ({ g, i })).filter((q) => q.g.frame).at(-1);
  const race = col ? legs[col.i + 1] : undefined;
  if (!race || race.frame || (race.travel !== 'left' && race.travel !== 'right')) return { problems: ['pacer: no run leg laid after a column to race on'] };
  const dir = race.travel === 'left' ? -1 : 1;
  const x0 = dir < 0 ? race.x1 : race.x0;
  const dock = st.exitTotemX;
  if (dock === undefined || dock < race.x0 - 1 || dock > race.x1 + 1) return { problems: [`pacer: the exit (x ${dock}) is not on the race leg (x ${Math.round(race.x0)}-${Math.round(race.x1)})`] };
  const L = Math.abs(dock - x0);
  const lo = Math.min(x0, dock), hi = Math.max(x0, dock);
  const rivers = (st.rivers ?? []).filter((r) => r.x0 >= lo - 1 && r.x1 <= hi + 1 && r.surfaceY >= race.y0 - ON_LEG && r.surfaceY <= race.y1 + 1).sort((a, b) => (a.x0 - b.x0) * dir);
  const problems: string[] = [];
  const flown = Object.keys(table.rivers);
  let middle = 0, rideOnly = 0, waterPx = 0;
  const marks: Array<[number, number]> = [[x0, 0]];
  let at = x0, tMid = 0;
  const bankS = (px: number) => px / table.bank;
  for (const r of rivers) {
    const logW = st.platforms.find((q) => q.type === 'drift' && q.drift && Math.abs(q.drift.x0 - r.x0) <= 1)?.width;
    const names = flown.filter((n) => rows[n] && rows[n].speed === r.speed && (logW === undefined || Math.abs(rows[n].logW - logW) <= 1));
    const rates = [...new Set(names.map((n) => JSON.stringify(table.rivers[n])))];
    if (rates.length !== 1) {
      problems.push(`pacer: the river at x ${Math.round(r.x0)}-${Math.round(r.x1)} (${r.speed} px/s, logs ${logW ?? '?'} px) ${names.length ? `matches rows ${names.join(', ')} with different flown rates` : 'matches no flown row'}`);
      continue;
    }
    const rate = table.rivers[names[0]];
    const w = r.x1 - r.x0, cross = w + table.crossingBank;
    const near = dir > 0 ? r.x0 : r.x1, far = dir > 0 ? r.x1 : r.x0;
    // (the crossing's time on its water; its crossingBank px are bank px at the bank rate, so the leg's total is the rule's)
    tMid += bankS(Math.abs(near - at));
    marks.push([near, tMid]);
    tMid += cross / rate.middle - bankS(table.crossingBank);
    marks.push([far, tMid]);
    at = far;
    middle += cross / rate.middle;
    rideOnly += cross / rate.rideOnly;
    waterPx += cross;
  }
  if (problems.length) return { problems };
  const banks = bankS(L - waterPx);
  middle += banks;
  rideOnly += banks;
  marks.push([dock, middle]);
  const seconds = Math.min(middle * (1 + (easy ? table.margin.easy : table.margin.normal)), rideOnly - table.under);
  const R = (v: number) => Math.round(v * 100) / 100;
  const yMin = race.y0 - ON_LEG;
  const lane = rivers.length ? Math.max(...rivers.map((r) => r.surfaceY)) : race.y1;
  const pacer: Pacer = { x0, x1: dock, lane, dir, yMin, seconds: R(seconds), middle: R(middle), rideOnly: R(rideOnly), marks: marks.map(([x, t]) => [x, R(t)] as const), floor: easy ? table.floor.easy : table.floor.normal, under: table.under, art: table.art };
  return { pacer, problems: pacerFaults(pacer, table.under) };
}
