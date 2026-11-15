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
import { beatOf } from '../clock.ts';
import { rideAt, type Point, type Ride } from '../ride.ts';
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
