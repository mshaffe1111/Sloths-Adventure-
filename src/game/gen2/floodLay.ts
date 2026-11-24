/**
 * gen2/floodLay: lay a stage's FLOOD CLOCK (flood.ts; 2-8's rising river, reference/design/2-8.md NEW 1) on its built ground, when its
 * graph's brief names a flood table (GraphBrief.flood). The clock starts at the LAST cage he meets (tower.ts lastMet: on a leg stage the
 * route's order, never x, D130); the waters it raises are the stage's rivers laid from rows with a `flood` mark (RiverRow.flood): every one
 * rises to paddling depth (FLOOD_PADDLE px under its banks' top) over the close, and the one marked 'close' (the fork's low road) turns
 * deep at the close (brim-full: a wall the line waits at). A little one in it then is set on its NEAR bank: the bank he meets first.
 * The check is flood.ts floodFaults (the close against the line's prompt tail-off of the laid low road, at the setting's flown rate, plus
 * the spare) and highRoadFaults (a high road over the low road the line can walk: steps of at most FLOOD_STEP px). Each refusal by name.
 * No stage id, world number, seed or x.
 */
import { floodFaults, floodTailOff, highRoadFaults, type Flood, type FloodRow, type FloodWater } from '../flood.ts';
import { alongOf, lastMet } from './tower.ts';
import type { Gen2Stage } from './types.ts';

/** paddling depth: the flood stops this far under its banks' top (2-8.md:39: "stops 10 px under them") */
export const FLOOD_PADDLE = 10;
/** the high road's steps: at most this high, up or down, a hop he and the line both make (2-8.md:35, :58: "each <= 60 px") */
export const FLOOD_STEP = 60;
/** the widest gap between two pieces of the high road (px): a hop he and the line both make, never a jump over open water (the carved
 *  steps and porches touch; a gap is a step's tread at most) */
export const FLOOD_HOP = 60;
/** where a set-back little one sits on the near bank, back from the water's edge (px) */
export const FLOOD_SIT = 40;

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
    // (it rises to paddling depth, and never sinks: water already at or over it stays where it lies)
    const w: FloodWater = { river: i, x0: r.x0, x1: r.x1, y0: r.surfaceY, y1: Math.min(r.surfaceY, lip + FLOOD_PADDLE), seconds: close, lip };
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
    problems.push(...highRoadFaults(tops.filter((t) => t.y < low.lip - 1), span, FLOOD_STEP, FLOOD_HOP));
  }
  const flood: Flood = { start: { id: last.id, x: last.x, y: last.y }, close, waters, tailOff: floodTailOff(row, Math.max(0, px), easy), spare: easy ? row.spare.easy : row.spare.normal, px: Math.max(0, px) };
  return { flood, problems: [...problems, ...floodFaults(flood)] };
}
