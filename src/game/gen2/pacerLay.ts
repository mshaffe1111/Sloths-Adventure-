/**
 * gen2/pacerLay: lay a stage's PACER (pacer.ts; 2-7's mail boat, reference/design/2-7.md NEW 1) on its built ground, when its graph's
 * brief names a pacer table (GraphBrief.pacer). The race leg is the run leg laid straight after the stage's last column (gen2 legs.ts:
 * 2-7's home leg after the weir), ending at the stage's exit. The boat is SEEN where it waits and where it docks (the lead's ruling 11-21,
 * ENG-27d: the child must see the rival leave; it shows only over water, pacerDraw.ts). Its race point is its BOW (its hull trails it over
 * the water it has come along, pacerDraw.ts pacerHull): it waits with its bow at the far bank of the FIRST river on the leg that holds it
 * whole (its length, from its art, plus PACER_SHORE px each end), so he crosses that river beside it and it sets off as he reaches its bow,
 * and it docks with its bow at the far bank of the LAST such river before the exit, where the race is judged. So the race is whole
 * crossings, as they were flown. A leg with no two such rivers is refused by name, and its box at both ends is checked over one river's
 * water (pacerShoreFaults). Its time is the design's rule, from the wait to the dock on the laid leg:
 *   the careful middle's time = each river on the leg crossed at its row's flown rate (with `crossingBank` px of bank) + the rest of the
 *   leg at the bank rate; the pacer's = that x (1 + the setting's share), and never more than the ride-only time (the same, at the ride-only
 *   rates) less `under`. A river's row is found by what it is (its current's speed and its logs' length, the world's river rows): a
 *   river no flown row matches, or two with different rates, is refused by name, as is a stage with no race leg or no fair race.
 * No stage id, world number, seed or x.
 */
import type { Pacer, PacerRow } from '../pacer.ts';
import { pacerFaults } from '../pacer.ts';
import { PACER_SHORE, pacerHull, pacerLength } from '../pacerDraw.ts';
import type { RiverRow } from './riverLay.ts';
import type { Gen2Stage } from './types.ts';

/** how far above the race leg's highest top his feet may be and still be on it (a hop: the out leg above lies far higher) */
const ON_LEG = 60;
/** where a pacer is seen, by name (empty: both ends seen): its hull (`len` long) where it waits (x0) and where it docks (x1) lies wholly
 *  over one river's water, PACER_SHORE px clear of each bank */
export function pacerShoreFaults(p: Pick<Pacer, 'x0' | 'x1' | 'dir'>, len: number, rivers: ReadonlyArray<{ x0: number; x1: number }>): string[] {
  const out: string[] = [];
  for (const [name, x] of [['waits', p.x0], ['docks', p.x1]] as const) {
    const h = pacerHull(p, x, len);
    if (!rivers.some((r) => h.x0 >= r.x0 + PACER_SHORE - 1e-6 && h.x1 <= r.x1 - PACER_SHORE + 1e-6))
      out.push(`pacer: where it ${name} (x ${Math.round(x)}) its ${Math.round(len)} px hull is not wholly over one river's water: the child must see it`);
  }
  return out;
}

export function layPacer(st: Gen2Stage, table: PacerRow, rows: Readonly<Record<string, RiverRow>>, easy: boolean): { pacer?: Pacer; problems: string[] } {
  const legs = st.gen2.tower?.legs ?? [];
  const col = legs.map((g, i) => ({ g, i })).filter((q) => q.g.frame).at(-1);
  const race = col ? legs[col.i + 1] : undefined;
  if (!race || race.frame || (race.travel !== 'left' && race.travel !== 'right')) return { problems: ['pacer: no run leg laid after a column to race on'] };
  const dir = race.travel === 'left' ? -1 : 1;
  const start = dir < 0 ? race.x1 : race.x0;
  const exit = st.exitTotemX;
  if (exit === undefined || exit < race.x0 - 1 || exit > race.x1 + 1) return { problems: [`pacer: the exit (x ${exit}) is not on the race leg (x ${Math.round(race.x0)}-${Math.round(race.x1)})`] };
  const len = pacerLength(table.art);
  if (!len) return { problems: [`pacer: its art (${table.art.join(', ')}) has no frame to size it by: it cannot be laid on the water`] };
  const leg = (st.rivers ?? []).filter((r) => r.x0 >= Math.min(start, exit) - 1 && r.x1 <= Math.max(start, exit) + 1 && r.surfaceY >= race.y0 - ON_LEG && r.surfaceY <= race.y1 + 1).sort((a, b) => (a.x0 - b.x0) * dir);
  // (where it is seen: its bow at the far bank of the first river that holds it whole, and of the last; the race is the crossings after
  //  the first, whole, the last one's included)
  const holds = leg.filter((r) => r.x1 - r.x0 >= len + 2 * PACER_SHORE);
  const first = holds[0], last = holds.at(-1);
  if (!first || !last || first === last) return { problems: [`pacer: the race leg has ${holds.length} river(s) wide enough to hold it whole (${Math.round(len)} px + ${PACER_SHORE} each end): it needs one to wait in and another to dock in, so the child sees it`] };
  const farBank = (r: { x0: number; x1: number }) => (dir > 0 ? r.x1 : r.x0);
  const x0 = farBank(first), dock = farBank(last);
  const rivers = leg.slice(leg.indexOf(first) + 1, leg.indexOf(last) + 1);
  const problems: string[] = [];
  const flown = Object.keys(table.rivers);
  const marks: Array<[number, number]> = [[x0, 0]];
  let at = x0, tMid = 0, tRide = 0;
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
    // (the crossing's time on its water: its flown time less its crossingBank px at the bank rate (they are bank px); every bank px at
    //  the bank rate, so the leg's total is the rule's)
    tMid += bankS(Math.abs(near - at));
    tRide += bankS(Math.abs(near - at));
    marks.push([near, tMid]);
    tMid += cross / rate.middle - bankS(table.crossingBank);
    tRide += cross / rate.rideOnly - bankS(table.crossingBank);
    if (r !== last) marks.push([far, tMid]);
    at = far;
  }
  if (problems.length) return { problems };
  const middle = tMid, rideOnly = tRide;
  marks.push([dock, middle]);
  const seconds = Math.min(middle * (1 + (easy ? table.margin.easy : table.margin.normal)), rideOnly - table.under);
  const R = (v: number) => Math.round(v * 100) / 100;
  const yMin = race.y0 - ON_LEG;
  const lane = rivers.length ? Math.max(...rivers.map((r) => r.surfaceY)) : race.y1;
  const pacer: Pacer = { x0, x1: dock, lane, dir, yMin, seconds: R(seconds), middle: R(middle), rideOnly: R(rideOnly), marks: marks.map(([x, t]) => [x, R(t)] as const), floor: easy ? table.floor.easy : table.floor.normal, under: table.under, art: table.art };
  return { pacer, problems: [...pacerShoreFaults(pacer, len, leg), ...pacerFaults(pacer, table.under)] };
}
