/**
 * gen2/rideLay — RIDE as a piece any world lays (ENGINE-NEEDS.md §2 packet 4; the map has 11 ride stages, World 2 first): a platform
 * that moves on a stage beat and carries him (ride.ts; the engine moves it through ridePlay.ts). A world says what its rides ARE in
 * one table of rows (`RideRow`, by prop id) and what beats they keep (`beats`); everything else is here, once:
 *   rideProps      the manifest's prop rows (tags 'ride' and 'ride-<how it travels>'), so a section's sockets ask by tag
 *   rideSocket     the world-neutral socket a section lists: at the far end of the piece the ride leaves from
 *   rideEmitters   what a filled socket lays: the ride over the gap after that piece (a log or a pad across to the next bank, a lift
 *                  up to the ledge above), its beat listed once in the stage's clocks
 *   rideFaults     the builder's fairness check on what was laid, in words (boarding, time at each stop, speed, the beat's own rules)
 * The look (a drifting log, a lily pad, a basket lift) is the world's own: `style` on the row, and `note` for the world's extras.
 *
 * A ride laid here crosses a gap the lay already made (a jump, a pit): it is a second way over, never yet the only one. A gap only a
 * ride crosses needs a place rule in the pipeline's reach checks (named in the PIECES report).
 */
import { beatDef, beatFaults, type BeatRule, type BeatSeen } from '../beat.ts';
import { beatOf, clockAt } from '../clock.ts';
import { RIDE, rideAt, type Point, type Ride } from '../ride.ts';
import { brickFair } from '../beatBrick.ts';
import { surfaceBelowBank, type RiverZone } from '../river.ts';
import { PETAL_SIT } from './riverLay.ts';
import type { ClockDef, ClockId } from '../stageKit.types.ts';
import type { Platform } from '../types.ts';
import type { PropDef, PropEmitter, Socket, StageSink } from './types.ts';
import { hash01, lookAt, pieceAt } from './stillLay.ts';

export const RIDE_TAG = 'ride';
/** how a ride travels: across to the next bank, or up to the ledge above */
export type RideWay = 'across' | 'up';
export const rideTag = (way: RideWay): string => `${RIDE_TAG}-${way}`;

/** a beat a world's rides keep: every `period` s it warns for `tell` s and then travels for `on` s; Easy stretches it */
export interface RideBeat {
  period: number;
  tell: number;
  on: number;
  easyStretch?: number;
}

/** a ride: how it travels, its size, the beat it keeps, and what it is drawn as */
export interface RideRow {
  way: RideWay;
  /** its width and thickness (px) */
  w: number;
  h: number;
  beat: ClockId;
  /** ease away from and into each stop (a lift); without it the speed is even (a log on a current) */
  smooth?: boolean;
  style?: Platform['style'];
  /** how many lanes its stagger is rolled over (rides seen together on one beat leave at different moments); default 1: in step */
  lanes?: number;
  minApart?: number;
  looks?: string[];
}

export interface RideTable {
  beats: Readonly<Record<ClockId, RideBeat>>;
  rides: Readonly<Record<string, RideRow>>;
}

export const RIDE_LAY = {
  /** a ride stops this far from the bank it meets (px): he steps across, it never grinds on the bank */
  gap: 6,
  /** the most a lift may stand off the piece below and the ledge above (px each side): a step, never a hop */
  reach: 14,
  /** the least it must travel to be worth laying (px) */
  travel: 60,
  /** banks whose tops differ by more than this are not joined by a ride across (px) */
  level: 4,
  /** rides this far above or below one another share a screen (px): the fairness check sees them together */
  tall: 200,
  /** how far past the piece's end a ride looks for the next bank (px) */
  look: 900,
  minApart: 400,
} as const;

/** the manifest's prop rows for a world's ride table */
export function rideProps(t: RideTable): PropDef[] {
  return Object.entries(t.rides).map(([id, r]) =>
    ({ id, tags: [RIDE_TAG, rideTag(r.way)], w: r.w, minApart: r.minApart ?? RIDE_LAY.minApart, beat: true, ...(r.looks ? { looks: r.looks } : {}) }));
}

/** a ride socket at the far end of the piece it leaves from: any of the world's rides, or (`way`) one that travels that way */
export const rideSocket = (id: string, on: string, way?: RideWay, more: Partial<Socket> = {}): Socket =>
  ({ id, role: 'prop', on, t: 0.97, allow: [way ? rideTag(way) : RIDE_TAG], ...more });

/** a world's beat as the stage's clock runs it */
export const rideClock = (id: ClockId, b: RideBeat): ClockDef => beatDef(id, b.period, b.tell, b.on, b.easyStretch ?? 1);

/**
 * The path of a ride leaving `from`: across to the next bank at its level (its left end from just off `from` to just short of the
 * bank), or up beside the ledge above (from `from`'s top to the ledge's). Null when there is no such bank or no room to travel.
 */
export function ridePath(platforms: readonly Platform[], from: Platform, row: Pick<RideRow, 'way' | 'w'>): Point[] | null {
  const end = from.x + from.width;
  const ahead = platforms.filter((p) => p !== from && p.type !== 'fragile' && p.x >= end - 1 && p.x - end <= RIDE_LAY.look).sort((a, b) => a.x - b.x);
  if (row.way === 'across') {
    const to = ahead.find((p) => Math.abs(p.y - from.y) <= RIDE_LAY.level);
    if (!to) return null;
    const x0 = end + RIDE_LAY.gap, x1 = to.x - RIDE_LAY.gap - row.w;
    // (nothing may stand in the water between: a stone in the way is the lay's own way over)
    if (x1 - x0 < RIDE_LAY.travel || ahead.some((p) => p !== to && p.x < to.x && p.y < from.y + 200 && p.y > from.y - 200)) return null;
    return [{ x: Math.round(x0), y: from.y }, { x: Math.round(x1), y: from.y }];
  }
  // (a lift goes straight up, so it must be a step from the piece below at the bottom AND from the ledge at the top: the slot
  // between them holds it with no more than `reach` to spare each side, or it serves only one of them and is not laid)
  const to = ahead.find((p) => p.y < from.y - RIDE_LAY.travel);
  const room = to ? to.x - end : 0;
  if (!to || room < row.w + 2 * RIDE_LAY.gap || room > row.w + 2 * RIDE_LAY.reach) return null;
  const x = Math.round(end + (room - row.w) / 2);
  return [{ x, y: from.y }, { x, y: to.y }];
}

/** where the world keeps what it draws */
export type RideNote = (out: StageSink, at: { id: number; x: number; y: number; w: number; way: RideWay; look: string }) => void;

/** the emitters for a world's ride table */
export function rideEmitters(t: RideTable, note?: RideNote): Record<string, PropEmitter> {
  const emit: Record<string, PropEmitter> = {};
  for (const [id, row] of Object.entries(t.rides)) {
    emit[id] = (f, p, out) => {
      const from = pieceAt(out.platforms, f.x, f.y);
      const path = from && ridePath(out.platforms, from, row);
      const b = t.beats[row.beat];
      if (!from || !path || !b) return;
      const lanes = Math.max(1, row.lanes ?? 1);
      const lane = Math.floor(hash01(f.x, 31) * lanes);
      const ride: Ride = { clock: row.beat, path, w: row.w, ...(lane ? { shift: Math.round((lane * b.period * 10) / lanes) / 10 } : {}), ...(row.smooth ? { smooth: true } : {}) };
      const plat: Platform = { id: out.nextPlatformId(), x: path[0].x, y: path[0].y, width: row.w, height: row.h, type: 'moving', ride, ...(row.style ? { style: row.style } : {}) };
      out.platforms.push(plat);
      const clocks = (out.clocks ??= []);
      if (!clocks.some((c) => c.id === row.beat)) clocks.push(rideClock(row.beat, b));
      note?.(out, { id: plat.id, x: plat.x, y: plat.y, w: row.w, way: row.way, look: lookAt(p, f.x, 32) });
    };
  }
  return emit;
}

/** what a laid ride must give him (the numbers the check holds a stage to) */
export interface RideRule extends BeatRule {
  /** the least time it stands at each stop (s, Normal): time to step on, time to step off */
  stop: number;
  /** the fastest it may travel (px/s): it carries him, it is not a hazard */
  speed: number;
  /** at a stop, its end is this near the bank it serves (px across, px up or down), or he cannot step on or off */
  board: { gap: number; rise: number };
}
/** a 1 s warning as the falling pods give (B14's beat), one thing at a time; a stop long enough to walk on; no faster than half his run */
export const RIDE_RULE: RideRule = { tellMin: 1, apart: 0.4, seen: 420, stop: 1.2, speed: 143, board: { gap: 14, rise: 20 } };

/**
 * What is unfair about the rides a stage carries, in words (none: it may be laid):
 *   - its beat is missing, breaks the clock's rules, or warns for less than the rule (beat.ts beatFaults); two rides seen together
 *     leave at the same moment;
 *   - it stands at a stop for less than `stop` s, or travels faster than `speed`;
 *   - at either stop no bank is within stepping reach of it (he cannot get on, or cannot get off);
 *   - it passes through something solid on its way.
 */
export function rideFaults(st: { platforms: readonly Platform[]; clocks?: readonly ClockDef[] }, rule: RideRule = RIDE_RULE, easy = false): string[] {
  const rides = st.platforms.filter((p) => p.type === 'moving' && p.ride);
  const defs = st.clocks ?? [];
  const subs: BeatSeen[] = rides.map((p) => ({ id: `ride ${p.id}`, clock: p.ride!.clock, shift: p.ride!.shift, x: p.ride!.path[0].x, y0: Math.min(...p.ride!.path.map((q) => q.y)) - RIDE_LAY.tall, y1: Math.max(...p.ride!.path.map((q) => q.y)) + RIDE_LAY.tall }));
  const used = defs.filter((d) => rides.some((p) => p.ride!.clock === d.id));
  const out = beatFaults(used, subs, rule, easy);
  const still = st.platforms.filter((p) => p.type !== 'moving' && p.type !== 'drift');
  for (const p of rides) {
    const r = p.ride!, name = `ride ${p.id}`;
    const def = defs.find((d) => d.id === r.clock);
    if (!def) continue;
    const b = beatOf(def, false);
    const on = def.phases.filter((ph) => ph.name === 'on').reduce((s, ph) => s + ph.seconds, 0);
    const stop = b.period - on;
    if (stop < rule.stop - 1e-6) out.push(`${name}: it stands ${Math.round(stop * 100) / 100} s at a stop, under ${rule.stop} s`);
    let far = 0;
    for (let i = 1; i < r.path.length; i++) far += Math.hypot(r.path[i].x - r.path[i - 1].x, r.path[i].y - r.path[i - 1].y);
    // (an eased ride peaks at 1.5 times its even speed)
    const peak = on > 0 ? (far / on) * (r.smooth ? 1.5 : 1) : Infinity;
    if (peak > rule.speed + 1e-6) out.push(`${name}: it travels at ${Math.round(peak)} px/s, over ${rule.speed}`);
    const ends: Array<[string, Point]> = [['its first stop', r.path[0]], ['its far stop', r.path[r.path.length - 1]]];
    for (const [what, at] of ends) {
      const reach = still.some((q) => Math.abs(q.y - at.y) <= rule.board.rise && (Math.abs(q.x + q.width - at.x) <= rule.board.gap || Math.abs(at.x + r.w - q.x) <= rule.board.gap));
      if (!reach) out.push(`${name}: at ${what} no bank is in stepping reach`);
    }
    // (its body at eight moments of the trip against everything that stands still)
    for (let k = 1; k < 8; k++) {
      const at = rideAt(r, { phase: 'on', u: k / 8, cycle: 0, index: 0, into: 0, left: 0, toOn: 0 });
      const hit = still.find((q) => at.x < q.x + q.width - 1 && at.x + r.w > q.x + 1 && at.y < q.y + q.height - 1 && at.y + p.height > q.y + 1);
      if (hit) {
        out.push(`${name}: it passes through piece ${hit.id}`);
        break;
      }
    }
  }
  return out;
}

// ---------------------------------------------------------------------------------------------------------------------------------------
// SINKING PADS (ENG-22; 2-2.md NEW 1 and 2): a row of lily pads across still water between two banks, from one row of data. A 'weight'
// row's pads sink while he stands on them and come back up when he leaves (ride.ts stepPad, by each pad's size); a 'beat' row keeps one
// clock of its own, every pad in step, so the whole row sinks and rises together (the pond's breath). pieces/padPiece.ts runs them.

/** a pad's size (2-2.md "the pads, measured from code first, and the hop FLOWN"): its width (px), how long it holds him on Normal (s),
 *  and when its shiver starts (s). Widths: the hand-built ponds' 124-144 px floor (w2Stages.ts, QA 2026-10-29: on narrower pads a hop
 *  past a pad's middle ran on off its far end) for a small one, twice that for a big one, so the two read at a glance */
export interface PadSize { w: number; hold: number; shiver: number }
export const PAD_SIZES = {
  small: { w: 130, hold: 1.0, shiver: 0.5 },
  big: { w: 260, hold: 2.0, shiver: 1.2 },
} as const satisfies Record<string, PadSize>;
export type PadSizeId = keyof typeof PAD_SIZES;

/** a pad row as data: a world's row (WorldManifest.pads, place `pads` names it) */
export interface PadRow {
  /** 'weight': each pad sinks under him by its size; 'beat': the row keeps its own breath (`beat`), weight or not; 'snap': a row of SNAP
   *  STONES (ENG-25; 2-5.md NEW 1) on the row's own bar (`snap`): floors that bite on four */
  by: 'weight' | 'beat' | 'snap';
  /** the row, near bank first: a pad's size, 'stone' (a stepping stone that never sinks: a rest, the far end of a there-and-back),
   *  'crown' (the crown lily, 2-2.md beat 11: a giant lily that never sinks, its flower opening once he stands on it; pieces/padPiece.ts)
   *  or, in a 'snap' row, 'snap' (a snap stone: solid always, it bites while its bar is on four; pieces/padPiece.ts) */
  pads: readonly (PadSizeId | 'stone' | 'crown' | 'snap')[];
  /** a 'snap' row's bar on Normal: one `count` (s; the bite lasts one count, the bar is four), the jaw's creak (`warn`, s, at the end of
   *  count 3; SNAP_LAY.warn when absent) and the WAVE (`wave`: each snap stone bites a count LATER than the one before it, the snap running
   *  ahead the way he goes; without it the row snaps in step). A wave that runs back at him is never laid (2-5.md's flight: 0-38% safe) */
  snap?: { count: number; warn?: number; wave?: true };
  /** edge-to-edge water before each piece and before the far bank (px): one for every gap, or one each (pads.length + 1) */
  gap: number | readonly number[];
  /** a 'beat' row's breath on Normal (s): up (holds), shiver (holds, warning), under (gone) */
  beat?: { up: number; shiver: number; under: number };
  /** a fall splashes him back onto the near bank, nothing lost (the teaching pond); else the water costs a life */
  safe?: boolean;
  /** the pieces that carry a petal, by index: on a pad it rides (Collectible.rides: sinks and rises with it, taken on landing) */
  petals?: readonly number[];
  /** Easy stretches every count and breath this much (2-2.md: x1.5); never below 1 */
  easyStretch?: number;
  /** a SPUR (FIX-22; 2-2's there-and-back): the row ends in a dead-end stone (its last piece must be 'stone'), the far bank stands over it out
   *  of reach, and the way on is from the near bank (place `pads` with its `rope`): he comes back over the pads he sank. Its zone names the
   *  stone (RiverZone.spur), which the route visits out and back (route.ts). Its stone stands against the far bank's foot (no water past
   *  it; its last gap is not used) */
  spur?: true;
}

export const PAD_LAY = {
  /** a pad's top under its banks' (px): it floats on the river's surface (river.ts surfaceBelowBank), its drawn surface 8 px under its top */
  drop: surfaceBelowBank - 8,
  /** a pad's thickness (px) */
  h: 12,
  /** how long a weight pad stays 'on' in its size's clock (s): longer than RIDE.padRise, so the count's cap falls inside it */
  under: 1.0,
  /** a stepping stone: its width (World 2's stone, w2.ts) and how deep it stands into the water (px). 50 px tall in moss_stone is the
   *  painted kit's rock (protoArt paintedPlatforms, drawn as World 2's boulder): at 60 it was drawn by terrain as a flat block with grid
   *  lines (the lead's still review, FIX-22) */
  stoneW: 136,
  stoneH: 50,
  /** the crown lily's floor (px): Matt's giant Victoria pad M-02-a at about 300 u (ART-W2's slot map), over three Pokeys (89.1) wide */
  crownW: 300,
  easyStretch: 1.5,
} as const;

/** the numbers a laid pad row is held to (padFaults) */
export const PAD_FAIR = {
  /** a weight pad holds a landing and one more decision (s, Normal): 2-2.md, a child's land-decide-tap 0.2-0.4 s plus the tap hop's 0.30 s */
  hold: 1.0,
  /** a shiver he can read before it goes (s, Normal) */
  shiver: 0.4,
  /** a sunk pad is whole again (holds a landing and a decision) within a wait he can count (s; riverLay RIVER_LAY.beat) */
  back: 4,
  /** how fast he crosses a pond, hopping and running pad to pad (px/s): a tap hop flies 83 px in 0.30 s (277 px/s, hopAir.ts) and his run
   *  tops out at 285 px/s (physics.ts maxRun), less his landings; a beat row's run must be crossed inside one breath at this pace */
  pace: 230,
  /** a person's reaction to a beat row rising before he goes (s) */
  react: 0.3,
  /** the widest water between two pieces (px): a held jump flies 184 px (hopAir.ts), less a margin so the child makes it */
  reach: 160,
  /** the least water between two pieces (px): closer, two read as one */
  apart: 20,
  /** the narrowest pad or stone he lands on (px): the hand-built ponds' QA floor */
  minW: 124,
} as const;

/** the water before piece i (i = pads.length: before the far bank). A spur's stone stands against the far bank's foot: no water past it,
 *  so its dead end reads at a glance and no step off its far edge is a swim (FIX-22) */
const gapAt = (row: PadRow, i: number): number => (row.spur && i === row.pads.length ? 0 : typeof row.gap === 'number' ? row.gap : row.gap[i]);
const pieceW = (k: PadRow['pads'][number]): number => (k === 'stone' ? PAD_LAY.stoneW : k === 'crown' ? PAD_LAY.crownW : k === 'snap' ? SNAP_LAY.w : PAD_SIZES[k].w);
/** the water's width, bank to bank */
export const padRowWidth = (row: PadRow): number => row.pads.reduce((s, k, i) => s + gapAt(row, i) + pieceW(k), 0) + gapAt(row, row.pads.length);
/** the clock a weight pad of this size reads by its count */
export const padSizeClock = (size: PadSizeId, easyStretch: number = PAD_LAY.easyStretch): ClockDef => {
  const z = PAD_SIZES[size];
  return beatDef(`pad-${size}`, z.hold + PAD_LAY.under, z.hold - z.shiver, PAD_LAY.under, easyStretch);
};
/** the clock a beat row keeps (`id`: the row's own, one per row) */
export const padBeatClock = (id: ClockId, b: NonNullable<PadRow["beat"]>, easyStretch: number = PAD_LAY.easyStretch): ClockDef =>
  beatDef(id, b.up + b.shiver + b.under, b.shiver, b.under, easyStretch);

/**
 * Lay one pad row: still water from `x0` (the near bank's end) across padRowWidth(row) to the far bank's start, under banks whose top is
 * `bankY`, and its pads (lily 'moving' platforms carrying a `pad`) and stones; `id` names a beat row's clock. Returns the water, the pieces,
 * the petals that ride them and the clocks the stage must list.
 */
export function layPads(row: PadRow, id: string, x0: number, bankY: number, nextId: () => number): { zone: RiverZone; pads: Platform[]; petals: Array<{ log: Platform; dx: number; dy: number }>; clocks: ClockDef[] } {
  if (typeof row.gap !== 'number' && row.gap.length !== row.pads.length + 1) throw new Error(`pad row ${id}: ${row.gap.length} gaps for ${row.pads.length} pieces (one before each and one before the far bank)`);
  if (row.by === 'beat' && !row.beat) throw new Error(`pad row ${id}: a beat row with no beat`);
  if ((row.by === 'snap') !== !!row.snap) throw new Error(`pad row ${id}: ${row.by === 'snap' ? 'a snap row with no bar (snap)' : `a ${row.by} row with a snap bar`}`);
  if (row.pads.some((k) => (k === 'snap') !== (row.by === 'snap') && k !== 'stone')) throw new Error(`pad row ${id}: a ${row.by} row lays only ${row.by === 'snap' ? "'snap' and 'stone'" : "pads, 'stone' and 'crown'"}`);
  const stretch = Math.max(1, row.easyStretch ?? PAD_LAY.easyStretch);
  const clocks: ClockDef[] = [];
  const beatId = `pads-${id}`;
  if (row.by === 'beat') clocks.push(padBeatClock(beatId, row.beat!, stretch));
  const snapId = `snap-${id}`;
  if (row.snap) clocks.push(snapClock(snapId, row.snap, stretch));
  let nSnap = 0;
  const y = bankY + PAD_LAY.drop;
  const pads: Platform[] = [];
  let x = x0;
  row.pads.forEach((k, i) => {
    x += gapAt(row, i);
    if (k === 'stone') {
      pads.push({ id: nextId(), x, y, width: PAD_LAY.stoneW, height: PAD_LAY.stoneH, type: 'solid', style: 'moss_stone' });
    } else if (k === 'crown') {
      // (a floor that never sinks, painted by the pad piece: never a `pad`, so nothing reads it as one that sinks)
      pads.push({ id: nextId(), x, y, width: PAD_LAY.crownW, height: PAD_LAY.h, type: 'solid', art: 'crownLily' });
    } else if (k === 'snap') {
      // (a snap stone: a floor always ('solid'), painted by the pad piece; the wave's stone i bites i counts later: shift -i x count)
      const shift = row.snap!.wave ? -nSnap * row.snap!.count : 0;
      nSnap++;
      pads.push({ id: nextId(), x, y, width: SNAP_LAY.w, height: SNAP_LAY.h, type: 'solid', art: 'snapStone', pad: { by: 'beat', on: 'bites', clock: snapId, ...(shift ? { shift } : {}), look: 'snap' } });
    } else {
      const clock = row.by === 'beat' ? beatId : `pad-${k}`;
      if (row.by === 'snap') throw new Error(`pad row ${id}: a snap row lays a ${k} pad`);
      if (row.by === 'weight' && !clocks.some((c) => c.id === clock)) clocks.push(padSizeClock(k, stretch));
      pads.push({ id: nextId(), x, y, width: PAD_SIZES[k].w, height: PAD_LAY.h, type: 'moving', lily: true, pad: { by: row.by, clock, look: row.by === 'beat' ? 'beat' : k } });
    }
    x += pieceW(k);
  });
  const x1 = x + gapAt(row, row.pads.length);
  if (row.spur && row.pads[row.pads.length - 1] !== 'stone') throw new Error(`pad row ${id}: a spur row ends in its dead-end stone, not a ${row.pads[row.pads.length - 1]}`);
  const end = pads[pads.length - 1];
  const zone: RiverZone = { x0, x1, surfaceY: bankY + surfaceBelowBank, dir: 1, speed: 0, ...(row.safe ? { safe: { backX: x0 - 70, backY: bankY } } : {}), ...(row.spur ? { spur: { x: Math.round(end.x + end.width / 2), y: end.y } } : {}) };
  const petals = (row.petals ?? []).map((i) => {
    const q = pads[i];
    if (!q) throw new Error(`pad row ${id}: a petal on piece ${i}, past its ${pads.length}`);
    return { log: q, dx: Math.round(q.width / 2), dy: -PETAL_SIT };
  });
  return { zone, pads, petals, clocks };
}

/**
 * What is unfair about a stage's sinking pads, in words (none: they may be laid). On Normal (Easy only stretches):
 *   - a weight pad holds a landing and one decision (PAD_FAIR.hold) and shivers long enough to read (PAD_FAIR.shiver), and once sunk it is
 *     whole again within a wait he can count (PAD_FAIR.back): a there-and-back finds its pads back when he has waited on the stone;
 *   - a beat row's breath holds long enough to cross each run of its pads between two floors that stay (at PAD_FAIR.pace, after his
 *     PAD_FAIR.react to the rise), with a shiver he can read (beatBrick.ts brickFair);
 *   - nothing strands him: across each still water, every floor from bank to bank (pads, stones) is a hop from the next (PAD_FAIR.reach),
 *     no closer than PAD_FAIR.apart, and wide enough to land on (PAD_FAIR.minW);
 *   - every pad's clock is listed in the stage's clocks.
 */
export function padFaults(st: { platforms: readonly Platform[]; rivers?: readonly RiverZone[]; clocks?: readonly ClockDef[] }): string[] {
  const out: string[] = [];
  const pads = st.platforms.filter((p) => p.pad);
  if (!pads.length) return out;
  const defs = new Map((st.clocks ?? []).map((d) => [d.id, d]));
  const seen = new Set<string>();
  for (const q of pads) {
    const def = defs.get(q.pad!.clock);
    const at = `pad at x=${Math.round(q.x)}`;
    if (!def) { out.push(`${at}: its clock ${q.pad!.clock} is not in the stage's clocks`); continue; }
    // (a snap stone is judged by snapFaults on its own flown numbers: its width, its bar, its window; one model per rule, D80)
    if (q.pad!.on === 'bites') continue;
    if (q.width < PAD_FAIR.minW) out.push(`${at}: ${q.width} px wide, under ${PAD_FAIR.minW}`);
    if (seen.has(def.id)) continue;
    seen.add(def.id);
    const b = beatOf(def, false);
    const up = b.ons[0] ?? b.period;
    const warn = b.seconds[b.names.indexOf('warn')] ?? 0;
    if (warn < PAD_FAIR.shiver - 1e-6) out.push(`${at}: its shiver lasts ${warn} s, under ${PAD_FAIR.shiver}`);
    if (q.pad!.by === 'weight') {
      if (up < PAD_FAIR.hold - 1e-6) out.push(`${at}: it holds him ${up} s, under ${PAD_FAIR.hold}`);
      // (sunk, its count sits at its cap, ride.ts stepPad; it holds a landing and a decision again once the count is back down by that)
      const cap = Math.min(up + RIDE.padRise, b.period - 1e-6);
      const back = cap - Math.max(0, up - PAD_FAIR.hold);
      if (back > PAD_FAIR.back + 1e-6) out.push(`${at}: sunk, it is whole again only ${Math.round(back * 100) / 100} s after he leaves, over ${PAD_FAIR.back}`);
    }
  }
  for (const r of st.rivers ?? []) {
    if (r.speed !== 0) continue;
    const inside = (p: Platform) => p.x + p.width / 2 > r.x0 && p.x + p.width / 2 < r.x1;
    const row = st.platforms.filter((p) => inside(p) && !p.broken && (p.pad || p.type === 'solid') && p.y > r.surfaceY - 80 && p.y < r.surfaceY + 10).sort((a, b) => a.x - b.x);
    if (!row.some((p) => p.pad)) continue;
    const at = `pad pond at x=${Math.round(r.x0)}`;
    // (a spur's stone stands against the far bank: its far edge is the pond's end, no water to judge past it)
    const edges = [r.x0, ...row.flatMap((p) => [p.x, p.x + p.width]), ...(r.spur ? [] : [r.x1])];
    for (let i = 0; i + 1 < edges.length; i += 2) {
      const gap = edges[i + 1] - edges[i];
      if (gap > PAD_FAIR.reach) out.push(`${at}: ${Math.round(gap)} px of water at x=${Math.round(edges[i])}, past a hop (${PAD_FAIR.reach})`);
      if (gap < PAD_FAIR.apart) out.push(`${at}: ${Math.round(gap)} px of water at x=${Math.round(edges[i])}, under ${PAD_FAIR.apart}`);
    }
    for (const p of row) if (!p.pad && p.width < PAD_FAIR.minW) out.push(`${at}: a stone ${p.width} px wide, under ${PAD_FAIR.minW}`);
    // (a beat row: each run of its pads between two floors that stay, from the edge before it to the floor after it, crossed inside one
    // breath at his pace after his reaction to the rise)
    let run = 0, clock: string | null = null, from = r.x0;
    const close = (to: number) => {
      if (run && clock) {
        const def = defs.get(clock);
        const need = Math.round(((to - from) / PAD_FAIR.pace + PAD_FAIR.react) * 100) / 100;
        if (def) for (const e of brickFair(def, { warn: PAD_FAIR.shiver, safe: need })) out.push(`${at}: ${run} beat pads in a run (${Math.round(to - from)} px): ${e}`);
      }
      run = 0;
      clock = null;
    };
    for (const p of row) {
      if (p.pad?.by === 'beat' && p.pad.on !== 'bites') { run++; clock = p.pad.clock; } else { close(p.x); from = p.x + p.width; }
    }
    close(r.x1);
  }
  return out;
}

// ───────────────────────── snap stones (ENG-25; 2-5.md NEW 1, flown: reference/specs/sims/snapClock.ts on DESIGN-24-25) ─────────────────────────

/** a snap stone's floor (px): World 2's river stone 80 px wide, 0.9 of Pokey's drawn 89.1 (2-5.md "Art", D41); its body under its top. The
 *  creak (s, Normal) a snap row's bar has when its data names none (2-5.md: "warn 0.5 s (the jaw creaks wide: the tell)") */
export const SNAP_LAY = { w: 80, h: 40, warn: 0.5 } as const;

/**
 * The numbers a laid snap row is held to (snapFaults), each from 2-5.md's flight on the real engine with the game's InputEngine
 * (snapClock.ts, out/snapClock-normal.txt, -easy.txt) and the lead's rulings (DESIGN-24-25 REPORT, 10:54 AM ET 11-18):
 *   hop     a real tap hop's air (s): 13 frames, InputEngine's 80 ms hold ("the hop: a tap is 13 frames in the air (0.43 s)")
 *   gap     the water each side of a snap stone (px): "30-40 px of water between (a pitch of 110-120 px: one tap hop)"; at 60 he misses
 *   inStep  snap stones in step in one run, at most ("in-step rows hold 3 stones at most": 5 in step read 18-32% safe)
 *   window  the window to leave the bank onto a run, straight through on the tap hop (s, Normal: "a window to leave the bank >= 0.9 s")
 *   warn    the shortest creak he can read (s, Normal)
 */
export const SNAP_FAIR = { hop: 13 / 30, gap: [30, 40], inStep: 3, window: 0.9, warn: 0.5 } as const;

/** a snap row's bar: four counts, the bite the fourth, the creak at the end of the third; Easy stretches it */
export const snapClock = (id: ClockId, b: NonNullable<PadRow['snap']>, easyStretch: number = PAD_LAY.easyStretch): ClockDef =>
  beatDef(id, 4 * b.count, b.warn ?? SNAP_LAY.warn, b.count, easyStretch);

/**
 * The window to leave the bank onto a run of snap stones (s): crossing it straight through on the tap hop (one hop a stone, SNAP_FAIR.hop
 * apart, a frame on each), the longest spell of start moments round the bar from which he never stands on a stone while it bites. The
 * same read the flight makes of his recorded path (snapClock.ts judge), on the tap hop's own timing: 3 in step at count 0.75 reads 1.38 s
 * (flown 1.40), a wave of 3 1.61 (flown 1.63), of 5 0.97 (flown 1.00).
 */
export function snapWindow(def: ClockDef, shifts: readonly number[], easy: boolean, hop: number = SNAP_FAIR.hop): number {
  const b = beatOf(def, easy);
  const dt = 1 / 30;
  const m = Math.round(b.period / dt);
  const safe: boolean[] = [];
  for (let s0 = 0; s0 < m; s0++) {
    let ok = true;
    for (let i = 0; i < shifts.length && ok; i++) {
      const t = s0 * dt + i * hop;
      for (const tau of [t, t + dt]) if (clockAt(def, tau, easy, shifts[i]).phase === 'on') ok = false;
    }
    safe.push(ok);
  }
  if (safe.every(Boolean)) return b.period;
  let best = 0;
  for (let a = 0; a < m; a++) { let k = 0; while (k < m && safe[(a + k) % m]) k++; best = Math.max(best, k); }
  return Math.round(best * dt * 100) / 100;
}

/**
 * What is unfair about a stage's snap stones, in words (none: they may be laid):
 *   - each is SNAP_LAY.w wide (the flown stone) and its clock is listed, fair (every bite out of a creak: clock.ts checkClock; a creak of
 *     SNAP_FAIR.warn or more: beatBrick.ts brickFair) and bites for one count of a four-count bar;
 *   - the water each side of it is SNAP_FAIR.gap (one tap hop);
 *   - each run of snap stones between floors that never bite (a bank, a plain stone): at most SNAP_FAIR.inStep in step; a wave runs ahead
 *     only (each a count later or in step with the one before, never earlier); its window to leave the bank, straight through, is
 *     SNAP_FAIR.window or more on Normal, and Easy's is never under Normal's (level.md rule 4).
 */
export function snapFaults(st: { platforms: readonly Platform[]; rivers?: readonly RiverZone[]; clocks?: readonly ClockDef[] }): string[] {
  const out: string[] = [];
  const snaps = st.platforms.filter((p) => p.pad?.on === 'bites');
  if (!snaps.length) return out;
  const defs = new Map((st.clocks ?? []).map((d) => [d.id, d]));
  const seen = new Set<string>();
  for (const q of snaps) {
    const at = `snap stone at x=${Math.round(q.x)}`;
    const def = defs.get(q.pad!.clock);
    if (q.width !== SNAP_LAY.w) out.push(`${at}: ${q.width} px wide, not the flown ${SNAP_LAY.w}`);
    if (!def) { out.push(`${at}: its clock ${q.pad!.clock} is not in the stage's clocks`); continue; }
    if (seen.has(def.id)) continue;
    seen.add(def.id);
    for (const e of brickFair(def, { warn: SNAP_FAIR.warn, safe: 0 })) out.push(`${at}: ${e}`);
    const b = beatOf(def, false);
    const on = b.seconds[b.names.indexOf('on')] ?? 0;
    if (on > 0 && Math.abs(b.period - 4 * on) > 1e-6) out.push(`${at}: clock ${def.id} bites ${on} s of a ${b.period} s bar, not one count of four`);
  }
  for (const r of st.rivers ?? []) {
    if (r.speed !== 0) continue;
    const inside = (p: Platform) => p.x + p.width / 2 > r.x0 && p.x + p.width / 2 < r.x1;
    const row = st.platforms.filter((p) => inside(p) && (p.pad || p.type === 'solid') && p.y > r.surfaceY - 80 && p.y < r.surfaceY + 10).sort((a, b) => a.x - b.x);
    if (!row.some((p) => p.pad?.on === 'bites')) continue;
    const pond = `snap pond at x=${Math.round(r.x0)}`;
    // (the water each side of every snap stone: the near bank's end, the floors between, the far bank's start)
    const edges = [r.x0, ...row.flatMap((p) => [p.x, p.x + p.width]), r.x1];
    row.forEach((p, i) => {
      if (p.pad?.on !== 'bites') return;
      for (const g of [edges[2 * i + 1] - edges[2 * i], edges[2 * i + 3] - edges[2 * i + 2]]) {
        if (g < SNAP_FAIR.gap[0] - 0.5 || g > SNAP_FAIR.gap[1] + 0.5) out.push(`${pond}: ${Math.round(g)} px of water beside the snap stone at x=${Math.round(p.x)}, not ${SNAP_FAIR.gap[0]}-${SNAP_FAIR.gap[1]} (one tap hop)`);
      }
    });
    // (each run of snap stones between floors that never bite)
    const runs: Platform[][] = [];
    let cur: Platform[] = [];
    for (const p of row) {
      if (p.pad?.on === 'bites') cur.push(p);
      else if (cur.length) { runs.push(cur); cur = []; }
    }
    if (cur.length) runs.push(cur);
    for (const run of runs) {
      const at = `${pond}: the run of ${run.length} snap stones from x=${Math.round(run[0].x)}`;
      const clocks = new Set(run.map((p) => p.pad!.clock));
      if (clocks.size > 1) { out.push(`${at} keeps ${clocks.size} clocks; a run keeps one bar`); continue; }
      const def = defs.get(run[0].pad!.clock);
      if (!def) continue;
      const shifts = run.map((p) => p.pad!.shift ?? 0);
      let step = 1;
      for (let i = 1; i < shifts.length; i++) {
        if (shifts[i] > shifts[i - 1] + 1e-9) out.push(`${at}: the stone at x=${Math.round(run[i].x)} bites before the one behind it: the wave runs back at him (never laid)`);
        step = Math.abs(shifts[i] - shifts[i - 1]) < 1e-9 ? step + 1 : 1;
        if (step > SNAP_FAIR.inStep) out.push(`${at}: ${step} stones in step at x=${Math.round(run[i].x)}, over ${SNAP_FAIR.inStep}`);
      }
      const wn = snapWindow(def, shifts, false), we = snapWindow(def, shifts, true);
      if (wn < SNAP_FAIR.window - 1e-6) out.push(`${at}: a ${wn} s window to leave the bank on Normal, under ${SNAP_FAIR.window}`);
      if (we < wn - 1e-6) out.push(`${at}: Easy's window to leave the bank is ${we} s, under Normal's ${wn} (Easy is never harder)`);
    }
  }
  return out;
}
