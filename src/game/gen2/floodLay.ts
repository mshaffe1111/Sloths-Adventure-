/**
 * gen2/floodLay: lay a stage's FLOOD CLOCK (flood.ts; 2-8's rising river, reference/design/2-8.md NEW 1) on its built ground, when its
 * graph's brief names a flood table (GraphBrief.flood). The clock starts at the LAST cage he meets (tower.ts lastMet: on a leg stage the
 * route's order, never x, D130); the waters it raises are the stage's rivers laid from rows with a `flood` mark (RiverRow.flood): every one
 * rises to paddling depth (FLOOD_PADDLE px under its banks' top) over the close, and the one marked 'close' (the fork's low road) turns
 * deep at the close (brim-full: a wall the line waits at). A little one in it then is set on its NEAR bank: the bank he meets first.
 * The check is flood.ts floodFaults (the close against the line's prompt tail-off of the laid low road, at the setting's flown rate, plus
 * the spare), highRoadFaults (a high road over the low road the line can walk: steps of at most FLOOD_STEP px), forkFaults (its wall-step),
 * strandFaults (off either end of every piece, ground within the line's step, FloodRow.step) and lowHopFaults (no high-road top
 * within a single jump of the low road's floor: FLOOD_LOW_HOP). Each refusal by name.
 * No stage id, world number, seed or x.
 */
import { floodFaults, floodTailOff, forkFaults, highRoad, lowHopFaults, strandFaults, type Flood, type FloodRow, type FloodWater } from '../flood.ts';
import { alongOf, lastMet } from './tower.ts';
import { APEX } from './reach.ts';
import { ASSIST } from '../physics.ts';
import type { Gen2Stage } from './types.ts';
import type { RiverZone } from '../river.ts';

/** paddling depth: the flood stops this far under its banks' top (2-8.md:39: "stops 10 px under them") */
export const FLOOD_PADDLE = 10;
/** the high road's steps: at most this high, up or down, a hop he and the line both make (2-8.md:35, :58: "each <= 60 px") */
export const FLOOD_STEP = 60;
/** the widest gap between two pieces of the high road (px): a hop he and the line both make, never a jump over open water (the carved
 *  steps and porches touch; a gap is a step's tread at most) */
export const FLOOD_HOP = 60;
/** the low road's hop (flood.ts lowHopFaults; BUILD-28 session 6, the lead's ruling (c)): no high-road top within a SINGLE jump's reach of
 *  the low road's floor, plus a margin. `reach` DERIVED: a single full held jump's rise (reach.ts APEX single-hold, 97.8, flown) + the
 *  engine's landing catch under the apex (engine.ts onFloor catchDrop: 14 on Normal) + Easy's added catch (physics.ts ASSIST.catchDrop),
 *  117.8 (flown, BUILD-28 probe-a3reach: the highest top a single jump lands him on, thin or block, standing or from a full run: 115
 *  Normal, 117 Easy). `margin`: the lead's ruling, at least 15 px over it */
export const FLOOD_LOW_HOP = { reach: APEX['single-hold'].px + 14 + ASSIST.catchDrop, margin: 15 } as const;
/** where a set-back little one sits on the near bank, back from the water's edge (px) */
export const FLOOD_SIT = 40;

/** a flood-marked river's water (river `i` of the stage, `close` s): it rises to paddling depth, and never sinks: water already at or over
 *  it stays where it lies; a marsh's paddling depth is under its FLOOR's top (RiverZone.marsh): over it the floor would be under water
 *  before the close. The deep (the near bank by `along`) is laid by layFlood on the one marked 'close' */
export function floodWaterOf(r: RiverZone, i: number, close: number): FloodWater {
  const lip = r.floodMark!.lip;
  return { river: i, x0: r.x0, x1: r.x1, y0: r.surfaceY, y1: Math.min(r.surfaceY, (r.marsh?.floor ?? lip) + FLOOD_PADDLE), seconds: close, lip };
}

export function layFlood(st: Gen2Stage, row: FloodRow, easy: boolean): { flood?: Flood; problems: string[] } {
  const marked = (st.rivers ?? []).map((r, i) => ({ r, i })).filter((q) => q.r.floodMark);
  if (!marked.length) return { problems: ['flood: the brief names a flood, but no water is laid from a row marked for it'] };
  const cages = st.collectibles.filter((c) => c.type === 'cage');
  const last = lastMet(st, cages, (c) => ({ x: c.x, y: c.y }));
  if (!last) return { problems: ['flood: no cage to start its clock (it starts at the last cage he meets)'] };
  const along = alongOf(st);
  const close = easy ? row.close.easy : row.close.normal;
  const waters: FloodWater[] = marked.map(({ r, i }) => {
    const lip = r.floodMark!.lip;
    const w = floodWaterOf(r, i, close);
    if (r.floodMark!.kind === 'close') {
      const nearX = along(r.x0, lip) <= along(r.x1, lip) ? r.x0 : r.x1;
      w.deep = { y: lip, near: { x: nearX === r.x0 ? r.x0 - FLOOD_SIT : r.x1 + FLOOD_SIT, y: lip } };
    }
    return w;
  });
  const low = waters.find((w) => w.deep);
  const problems: string[] = [];
  let px = 0;
  if (low) {
    // (the leg the line must clear: from the last cage to OFF the low road, its far bank, along the route)
    const farX = low.deep!.near.x < low.x0 ? low.x1 : low.x0;
    px = along(farX, low.lip) - along(last.x, last.y);
    if (px <= 0) problems.push(`flood: the low road (x ${Math.round(low.x0)}-${Math.round(low.x1)}) is met before the last cage: the clock starts after it`);
    const tops = st.platforms.filter((p) => p.type === 'solid' && !p.pad && !p.broken).map((p) => ({ x: p.x, w: p.width, y: p.y, h: p.height }));
    const nearIsX0 = low.deep!.near.x < low.x0;
    const span = { x0: low.x0, x1: low.x1, from: { x: nearIsX0 ? low.x0 : low.x1, y: low.lip }, to: { x: nearIsX0 ? low.x1 : low.x0, y: low.lip } };
    // (the banks themselves are not the high road: only what stands over the water)
    const road = highRoad(tops.filter((t) => t.y < low.lip - 1), span, FLOOD_STEP, FLOOD_HOP);
    // (and its fork at the wall-step: a way down onto the low road, and a gap after it each tier's play crosses: forkFaults; and off
    //  either end of every piece of it, ground within the line's step (strandFaults): the first ground under x is a solid top, else the low
    //  road's water at its laid surface (the flood only raises it) over its span, else none)
    const under = (x: number): number => (x >= low.x0 && x <= low.x1 ? low.y0 : Infinity);
    // (and no piece of it within his single jump of the low road's walked floor (a marsh's): his ordinary hop keeps the low road)
    const marsh = st.rivers![low.river].marsh;
    const hop = marsh ? lowHopFaults(road.chain, { x0: low.x0, x1: low.x1, y: marsh.floor }, FLOOD_LOW_HOP) : [];
    problems.push(...road.faults, ...(road.faults.length ? [] : [...forkFaults(road.chain, span, row.climb), ...strandFaults(road.chain, tops, under, row.step), ...hop]));
  }
  const flood: Flood = { start: { id: last.id, x: last.x, y: last.y }, close, waters, tailOff: floodTailOff(row, Math.max(0, px), easy), spare: easy ? row.spare.easy : row.spare.normal, px: Math.max(0, px) };
  return { flood, problems: [...problems, ...floodFaults(flood)] };
}
