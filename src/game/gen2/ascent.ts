/**
 * gen2/ascent — the upward flow (DESIGN.md B2 / B10 piece C): what an ascent adds to the stitcher (pipeline layStage), so the same
 * sections, sockets, bags, checks and curation build a climb.
 *
 * An ascent zig-zags up a column (6-8 Stilt Climb's shape, the hand-built climb Matt approved): a row of climbing sections is laid
 * across the column the way the climb is heading (each section in its own space as usual, then turned end to end on the way back), and
 * a `turn` section at the row's end climbs to the next row and sends the climb back the other way. Every row stands clear of the row
 * under it (ASCENT.clear), and a miss costs a climb, never the stage: every gap has a catch under it (a ledge a plain hop below the lips,
 * a shelf and a vine back up under a liana) or the row below within ASCENT.maxFall. What really costs a life on Normal is the world's:
 * a stage's rising lava or water (risingTide.ts) and the hazards its sections' sockets ask for.
 *
 * Laid with y growing up from 0 and x from 0, then shifted (shiftLaid) so the stage starts at the bottom of a level just tall enough.
 * Progress along the climb (`along`) is what the passes after the stitcher read where a horizontal stage reads x: the flags' spacing,
 * the opening seconds, the animals' spacing, the dead stretches. The time model reads the climb's steps (stageTime.ts modelAscent,
 * `meta.ascentChain`).
 *
 * Pure: no engine, no canvas.
 */
import { PHYS } from '../physics.ts';
import type { GeneratedStage } from '../stageGenerator.ts';
import { MODEL_TYPICAL, TIME } from '../stageTime.ts';
import type { Platform, Vine } from '../types.ts';
import type { Zone } from '../zones.ts';
import type { PlacedSection } from './types.ts';

export const ASCENT = {
  /** the column the climb zig-zags in (px): wider than 6-8's 1,700, so a row holds a section or two and a turn */
  column: 2400,
  /** the least room (px) between a piece's top and the underside of a piece of another row over it (a double jump's 185 and his body) */
  clear: 250,
  /** a row keeps this much room at its end (px) for the turn that takes it up */
  turnRoom: 380,
  /** a turn's shelf clears the rows under it this far on (px), the way the next row heads: room for that row's first section */
  ahead: 700,
  /** a catch under a hop's gap: its top this far under the lower lip (6-8's branch: a plain hop back up, a double jump on) */
  catchDrop: 90,
  /** a catch reaches this far under each lip */
  catchOver: 30,
  /** under a liana: the shelf this far under the swing's ledge, and a vine at the ledge's end back up to it (6-8) */
  lianaDrop: 240,
  /** a miss falls at most this far (STAGE-RULES §2 "Falls in climbs": about one trunk section) */
  maxFall: 450,
  /** after the shift: the column's margin each side, and how far under the level's top the highest piece stands */
  side: 60,
  top: 520,
  /** the runway at the foot of the climb and the shrine's ledge at the top (px) */
  runway: 620,
  shrine: 520,
} as const;

/** a piece's world box laid from its section's local box: from origin `ox` the way `dir` heads (on the way back, turned end to end) */
export const worldX = (ox: number, dir: 1 | -1, lx: number, w = 0): number => (dir > 0 ? ox + lx : ox - lx - w);

/**
 * Is a new piece clear of everything laid before it? Each earlier platform overlapping it across (with `ASCENT.clear` / 5 of slack at
 * the ends) must lie wholly above it or below it with `ASCENT.clear` between the one's top and the other's underside. `skip`: the
 * pieces it may touch (the section's own, and the piece it joins from).
 */
export function clearOf(p: Pick<Platform, 'x' | 'y' | 'width' | 'height'>, laid: readonly Platform[], skip: ReadonlySet<Platform>): Platform | null {
  const slack = ASCENT.clear / 5;
  for (const q of laid) {
    if (skip.has(q) || q.x >= p.x + p.width + slack || q.x + q.width <= p.x - slack) continue;
    const below = q.y >= p.y ? q.y - (p.y + thick(p)) : p.y - (q.y + thick(q));
    if (below < ASCENT.clear) return q;
  }
  return null;
}
/** how thick a piece reads for the room under it: a ledge's own depth, at most 60 (a bank's art runs on down; its collider is its top) */
export const thick = (p: Pick<Platform, 'height'>): number => Math.min(60, p.height);

/** the nearest platform top under the band [x0, x1] below `y` (px under y), or Infinity */
export function dropUnder(x0: number, x1: number, y: number, laid: readonly Platform[], skip?: ReadonlySet<Platform>): number {
  let d = Infinity;
  for (const q of laid) {
    if (skip?.has(q) || q.x >= x1 || q.x + q.width <= x0 || q.y <= y) continue;
    d = Math.min(d, q.y - y);
  }
  return d;
}

/**
 * Progress along the climb (px of route) at a point: inside a section's box, its share of the way through that section (across its row
 * the way it heads, or up a turn); elsewhere the nearest section's. `along0` / `along1` are each section's progress at its entry and
 * exit (pipeline layStage's running sum).
 */
export function alongOf(sections: readonly PlacedSection[]) {
  return (x: number, y: number): number => {
    let best = sections[0];
    let bd = Infinity;
    for (const s of sections) {
      const dx = x < s.x0 ? s.x0 - x : x > s.x1 ? x - s.x1 : 0;
      const top = s.top ?? s.entry.y;
      const bottom = s.bottom ?? s.entry.y;
      const dy = y < top - 200 ? top - 200 - y : y > bottom + 60 ? y - bottom - 60 : 0;
      const d = dx + dy * 2;
      if (d < bd) (bd = d), (best = s);
    }
    if (!best) return x;
    const s = best;
    const a0 = s.along0 ?? s.x0;
    const span = (s.along1 ?? s.x1) - a0;
    let f: number;
    if (s.turn) f = (s.entry.y - y) / Math.max(1, s.entry.y - s.exit.y);
    else f = (s.dir ?? 1) > 0 ? (x - s.x0) / Math.max(1, s.x1 - s.x0) : (s.x1 - x) / Math.max(1, s.x1 - s.x0);
    return a0 + Math.max(0, Math.min(1, f)) * span;
  };
}

/** the steps of a climb for the time model (stageTime.ts modelAscent: each step's ledge half walked, plus its own cost) */
export type ClimbStep = NonNullable<NonNullable<GeneratedStage['meta']>['ascentChain']>[number];

/**
 * Move a laid ascent so it starts at the bottom of its level: x by `dx`, y by `dy`, every platform, vine and zone once, and every
 * point the passes after read (sections' anchors and boxes, sockets, gaps, the spawn, the exit).
 */
export function shiftAll(
  dx: number,
  dy: number,
  o: {
    platforms: Platform[];
    vines: Vine[];
    zones: Zone[];
    gaps: Array<{ x0: number; x1: number; y: number }>;
    sections: PlacedSection[];
    points: Array<{ x: number; y: number }>;
  },
): void {
  for (const p of o.platforms) (p.x += dx), (p.y += dy);
  for (const v of o.vines) (v.x += dx), (v.topY += dy), (v.bottomY += dy);
  for (const z of o.zones) (z.x0 += dx), (z.x1 += dx), (z.top += dy), (z.bottom += dy), (z.baseY += dy);
  for (const g of o.gaps) (g.x0 += dx), (g.x1 += dx), (g.y += dy);
  for (const s of o.sections) {
    s.entry.x += dx;
    s.entry.y += dy;
    s.exit.x += dx;
    s.exit.y += dy;
    s.x0 += dx;
    s.x1 += dx;
    if (s.top !== undefined) s.top += dy;
    if (s.bottom !== undefined) s.bottom += dy;
    for (const k of s.sockets) (k.x += dx), (k.y += dy);
    for (const v of s.vines) if (v.gap) v.gap = [v.gap[0] + dx, v.gap[1] + dx];
  }
  for (const pt of o.points) (pt.x += dx), (pt.y += dy);
}

/** a section's piece as the stitcher reads it for the climb's steps (pipeline LocalPiece: its box, how it was placed, a hanging piece) */
interface StepPiece {
  w: number;
  h: number;
  y: number;
  main: boolean;
  via?: string;
  hang?: { kind: 'liana' | 'vine' };
}

/**
 * The climb's steps a section adds (stageTime.ts modelAscent): a ledge reached by a walk is crossed, by a jump hopped (two jumps:
 * hop2), a perch past a liana crossed after its swing, a climb its height. `seamHop`: the section is joined by a jump.
 */
export function climbSteps(L: { pieces: readonly StepPiece[] }, seamHop: boolean): ClimbStep[] {
  const out: ClimbStep[] = [];
  let prevY = 0;
  for (const lp of L.pieces) {
    if (lp.hang) {
      out.push(lp.hang.kind === 'vine' ? { kind: 'climb', w: 0, rise: lp.h } : { kind: 'swing', w: 0, rise: 0 });
      continue;
    }
    if (!lp.main) continue;
    const rise = Math.max(0, prevY - lp.y);
    prevY = lp.y;
    const v = lp.via ?? 'walk';
    // (modelAscent walks half of every step's ledge; a crossed ledge walks the rest: two thirds of it given here is its whole width)
    if (v === 'start') out.push(seamHop ? { kind: 'hop', w: lp.w, rise } : { kind: 'cross', w: lp.w * (2 / 3), rise });
    else if (v === 'double') out.push({ kind: 'hop2', w: lp.w, rise });
    else if (v === 'jump' || v === 'pit' || v === 'on') out.push({ kind: 'hop', w: lp.w, rise });
    else out.push({ kind: 'cross', w: lp.w * (2 / 3), rise });
  }
  return out;
}

/** the seconds those steps cost a player (stageTime.ts modelAscent's own sum, without the first hop or the animals) */
export function climbSeconds(steps: readonly ClimbStep[], P: { alpha: number }): number {
  const v = P.alpha * PHYS.maxRun;
  const k = MODEL_TYPICAL.alpha / P.alpha;
  const a = TIME.ascent;
  let t = 0;
  for (const s of steps) {
    t += (0.5 * s.w) / v;
    if (s.kind === 'hop') t += a.hop * k;
    else if (s.kind === 'hop2') t += a.hop2 * k;
    else if (s.kind === 'bounce') t += a.bounce * k;
    else if (s.kind === 'swing') t += a.swing * k;
    else if (s.kind === 'climb') t += s.rise / TIME.climbSpeed + a.climbOverhead * k;
    else if (s.kind === 'cross') t += s.w / v;
  }
  return t;
}

/**
 * A catch under each gap of the climb (STAGE-RULES §2 "Falls in climbs"; 6-8's branches and root shelves): under a hop's gap a ledge
 * ASCENT.catchDrop under the lower lip, reaching ASCENT.catchOver under both (a plain hop back up, a double jump on, never a shortcut:
 * it lies under the route); under a liana a shelf ASCENT.lianaDrop under the swing's ledge with a vine at the ledge's end back up to it.
 * Each only where it stands clear of every other row (clearOf) and nothing is already close under the gap; deeper tries for a hop's
 * catch when the first height is taken. Returns the catches' platform ids.
 */
export function catchGaps(
  gaps: ReadonlyArray<{ x0: number; x1: number; lips: [Platform, Platform]; liana?: { ledge: Platform } }>,
  platforms: Platform[],
  vines: Vine[],
  mk: (x: number, y: number, w: number, shape: 'branch' | 'block', h: number, style?: Platform['style']) => Platform,
  budget: { pit: string },
): number[] {
  void budget;
  const out: number[] = [];
  for (const g of gaps) {
    const [a, b] = g.lips;
    const skip = new Set([a, b]);
    if (g.liana) {
      const ledge = g.liana.ledge;
      const right = ledge === a;
      const end = right ? ledge.x + ledge.width : ledge.x;
      const span = g.x1 - g.x0;
      const x0 = right ? end - 90 : g.x1 - span * 0.7;
      const x1 = right ? g.x0 + span * 0.7 : end + 90;
      const y = ledge.y + ASCENT.lianaDrop;
      if (dropUnder(x0, x1, ledge.y, platforms, skip) <= ASCENT.lianaDrop + 20) continue;
      const box = { x: x0, y, width: x1 - x0, height: 24 };
      if (clearOf(box, platforms, skip)) continue;
      const c = mk(x0, y, x1 - x0, 'branch', 24, 'branch');
      out.push(c.id);
      const vx = right ? end - 40 : end + 40;
      vines.push({ id: vines.length + 1, x: Math.round(vx), topY: Math.round(ledge.y - 2), bottomY: Math.round(y - 6), swaySpeed: 0.9, swayPhase: (vx * 0.007) % 6.28, vineType: 'tree_climb' });
      continue;
    }
    const lip = Math.max(a.y, b.y);
    if (dropUnder(g.x0 + 10, g.x1 - 10, lip, platforms, skip) <= ASCENT.catchDrop + 40) continue;
    for (const d of [ASCENT.catchDrop, ASCENT.catchDrop + 60, ASCENT.catchDrop + 120]) {
      const box = { x: g.x0 - ASCENT.catchOver, y: lip + d, width: g.x1 - g.x0 + 2 * ASCENT.catchOver, height: 24 };
      if (clearOf(box, platforms, skip)) continue;
      const c = mk(box.x, box.y, box.width, 'branch', 24, 'branch');
      out.push(c.id);
      break;
    }
  }
  return out;
}
