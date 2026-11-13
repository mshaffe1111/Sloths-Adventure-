/**
 * gen2/legs: a stage as LEGS (R-165.196). A node carries its travel (right, left, up, down); a run of nodes with one travel is a
 * leg, and a stage's graph is a sequence of legs. The lay (pipeline.ts layStage) lays each leg with the lay its travel calls for:
 * the RUN lay at the leg's own ground for right and left, the TOWER lay (tower.ts) in a column that starts where he stands for up
 * and down. This file holds the pure pieces: the leg marks of a graph's code, the legs of a graph, a leg's frame (its column), the
 * mirror that makes a left leg from a right one, and the walls that hold him in a column that stands mid-stage.
 *
 * Nothing here names a stage, a seed or a place.
 */
import type { Platform, Rope, Vine } from '../types.ts';
import type { Zone } from '../zones.ts';
import { TOWER } from './tower.ts';

/** which way a node is laid */
export type Travel = 'right' | 'left' | 'up' | 'down';
export const upOrDown = (t: Travel): t is 'up' | 'down' => t === 'up' || t === 'down';

/** the leg marks of a graph's code: their own tokens between the nodes' (R, U, D and L are jobs already, NODES.md §8.0) */
const MARK: Readonly<Record<string, Travel>> = { '/R': 'right', '/L': 'left', '/U': 'up', '/D': 'down' };

/**
 * A graph's code with its leg marks taken out, and each top-level token's travel (undefined before the first mark: the graph's own
 * flow). A mark sets the travel of every node after it, to the next mark: `A P /D D D /R P R /U U U /R X R S E`. A code with no mark
 * comes back as it was, with no travel named (`marked` false): every graph written before legs reads exactly as it did.
 */
export function legMarks(code: string): { code: string; travel: Array<Travel | undefined>; marked: boolean } {
  const out: string[] = [];
  const travel: Array<Travel | undefined> = [];
  let now: Travel | undefined, depth = 0, cur = '', marked = false;
  const push = () => {
    if (!cur) return;
    if (cur[0] === '/') {
      const t = MARK[cur];
      if (!t) throw new Error(`node code: "${cur}" is not a leg mark (/R /L /U /D)`);
      now = t;
      marked = true;
    } else { out.push(cur); travel.push(now); }
    cur = '';
  };
  for (const ch of code.trim()) {
    if (ch === '[') depth++;
    if (ch === ']') depth--;
    if (ch === ' ' && depth === 0) push(); else cur += ch;
  }
  push();
  return { code: out.join(' '), travel, marked };
}

/** a leg: its travel and the nodes it holds, `from` to `to` (not included) */
export interface Leg { travel: Travel; from: number; to: number }

/** a graph's legs: each run of nodes with one travel, in order. A node that names none travels the graph's own way (`flow`) */
export function legsOf(nodes: ReadonlyArray<{ travel?: Travel }>, flow: Travel): Leg[] {
  const legs: Leg[] = [];
  nodes.forEach((n, i) => {
    const t = n.travel ?? flow;
    const last = legs[legs.length - 1];
    if (last && last.travel === t) last.to = i + 1; else legs.push({ travel: t, from: i, to: i + 1 });
  });
  return legs;
}

/** is a graph laid as legs (a route through more than one travel, or a run laid left)? A graph of one right leg is a run and one of
 *  a single up or down leg is a tower, each laid exactly as before legs */
export const mixed = (legs: readonly Leg[]): boolean => legs.length > 1 || legs[0]?.travel === 'left';

/** a leg's frame: the x a vertical leg's storeys keep between (its column, wall to wall). A run or a tower of one leg: 0 to its width */
export interface Frame { x0: number; x1: number }

/** how thick a column's wall is, and how far over the highest storey (and a jump from it) a wall he does not leave by stands */
export const WALL = { w: 60, over: 320 } as const;

/**
 * The column of a vertical leg that begins where he stands (`x`, heading `dir`): `width` wide, on ahead of him. Going UP the vine
 * stands on the ledge he leaves, `TOWER.vineIn` back from its tip, so the column takes that ledge's tip in (the wall hangs over it,
 * the doorway under); going DOWN the way is past the tip, and the column begins at it.
 */
export function columnFrame(travel: 'up' | 'down', x: number, dir: 1 | -1, width: number): Frame {
  const back = travel === 'up' ? TOWER.wall + TOWER.vineIn : 0;
  const near = x - dir * back, far = near + dir * width;
  return { x0: Math.min(near, far), x1: Math.max(near, far) };
}

/** a wall or a floor of a column: a plain solid box */
export interface Slab { x: number; y: number; w: number; h: number; what: 'wall' | 'floor' }

/**
 * The two walls of a column that stands mid-stage (a tower of one leg has the level's own edges; this has none). Each stands just
 * outside the frame, from the column's top to its floor, with a DOORWAY where he comes in and where he goes out: `TOWER.clear` of
 * open height over the ledge he walks through on. `top`: the highest storey's y; `floor`: the floor's top (the lowest y he stands
 * on); `doors`: the side (-1 left, 1 right) and the ledge height of each way through. A wall he does not leave over stands
 * `WALL.over` px over the highest storey (past any jump); a doorway at the very top is a wall that simply ends at that ledge.
 */
export function columnWalls(frame: Frame, top: number, floor: number, doors: ReadonlyArray<{ side: -1 | 1; y: number }>): Slab[] {
  const out: Slab[] = [];
  for (const side of [-1, 1] as const) {
    const x = side < 0 ? frame.x0 - WALL.w : frame.x1;
    // (the open heights on this side, top to bottom: each doorway from `clear` over its ledge down to the ledge)
    const open = doors.filter((d) => d.side === side).map((d) => [d.y - TOWER.clear, d.y] as const).sort((a, b) => a[0] - b[0]);
    let y = top - WALL.over;
    for (const [a, b] of open) {
      // (a doorway at the very top has open sky over it: no lintel hangs there)
      if (a > y && b > top + 1) out.push({ x, y, w: WALL.w, h: a - y, what: 'wall' });
      y = Math.max(y, b);
    }
    if (floor > y) out.push({ x, y, w: WALL.w, h: floor - y, what: 'wall' });
  }
  return out;
}

/** what a leg laid, for the mirror: the lay's own lists from where the leg began (the same objects the stage keeps) */
export interface LegLaid {
  platforms: Platform[];
  vines: Vine[];
  ropes: Rope[];
  zones: Zone[];
  gaps: Array<{ x0: number; x1: number }>;
  asks: Array<{ x0: number; x1: number }>;
  heartFalls: Array<{ x0: number; x1: number }>;
  sections: Array<{
    uid: string;
    entry: { x: number; y: number };
    exit: { x: number; y: number };
    x0: number;
    x1: number;
    vines: Array<{ vine: Vine; gap?: [number, number] }>;
    sockets: Array<{ x: number }>;
    beats: Array<{ x: number }>;
    room?: unknown;
  }>;
}

/**
 * A LEFT leg from a right one: everything the leg laid, mirrored about the line `x = sum / 2` (x becomes `sum - x`; a box's left
 * edge `sum - x - width`). The leg is laid rightwards off to one side by the run lay, every rule of a run kept, and then set where
 * it belongs running left: the physics has no handedness, so a jump that was fair is fair, a pit keeps its way out, water stays
 * under its gap. What does have a hand is turned with it: a wind's direction, a gap's two edges. Not mirrored yet, and refused by
 * name so no roll lays one silently: a puzzle room (anchored by its own left and right) and a liana (its swing's phase is the
 * engine's, set from where it hangs).
 */
export function reflectLeg(laid: LegLaid, sum: number): void {
  const span = (o: { x0: number; x1: number }) => { const a = sum - o.x1, b = sum - o.x0; o.x0 = a; o.x1 = b; };
  for (const p of laid.platforms) p.x = sum - p.x - p.width;
  const vines = new Set<Vine>([...laid.vines, ...laid.sections.flatMap((q) => q.vines.map((e) => e.vine))]);
  for (const v of vines) {
    if (v.vineType === 'swing_liana') throw new Error('gen2 legs: a liana in a leg laid left is not mirrored yet (its swing is the engine\'s)');
    v.x = sum - v.x;
  }
  for (const r of laid.ropes) { const a = sum - r.x1, b = sum - r.x0, g = r.g0; r.x0 = a; r.x1 = b; r.g0 = r.g1; r.g1 = g; }
  for (const z of laid.zones) {
    span(z);
    z.dir = -z.dir as 1 | -1;
    if (z.emit) z.emit = z.emit.map((x) => sum - x);
    for (const l of z.lights ?? []) l.x = sum - l.x;
  }
  for (const g of laid.gaps) span(g);
  for (const k of laid.asks) span(k);
  for (const h of laid.heartFalls) span(h);
  for (const q of laid.sections) {
    if (q.room) throw new Error(`gen2 legs: section ${q.uid} holds a puzzle room, which a leg laid left does not mirror yet`);
    q.entry.x = sum - q.entry.x;
    q.exit.x = sum - q.exit.x;
    span(q);
    for (const e of q.vines) if (e.gap) e.gap = [sum - e.gap[1], sum - e.gap[0]];
    for (const k of q.sockets) k.x = sum - k.x;
    for (const b of q.beats) b.x = sum - b.x;
  }
}
