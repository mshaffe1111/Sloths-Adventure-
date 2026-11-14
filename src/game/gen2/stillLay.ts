/**
 * gen2/stillLay — STILL as a piece any world lays (ENGINE-NEEDS.md §2 packet 2; the map has 10 stealth stages, 1-7 first): somewhere to
 * hide, and something that watches a stretch on a rhythm (watcher.ts runs both in every world already: proto.bushes, proto.watch).
 *
 * A world says what its hides and its watcher ARE in one table of rows (`StillRow`, by prop id); everything else is here, once:
 *   stillProps      the manifest's prop rows (tags 'hide' + 'cover', or the watcher's own tag), so a section's sockets ask by tag
 *   hideSocket / watchSocket   the world-neutral sockets a section lists
 *   stillEmitters   what a filled socket lays: a Bush under a hide; a WatchZone along the bank a watcher stands at the start of
 *   clipWatches     pass 6: each watched stretch cut to the hides laid along it; one with nowhere to hide is no watched stretch
 *   stillFaults     the builder's fairness check on what was laid, in words
 * The look (a root den, a tree hollow, a fern) is the world's own: `StillNote` hands each laid hide and watcher to the world's extras.
 *
 * World 6 (the watched water) and World 8 (the bat roosts) lay through this; their numbers are their rows (w6.ts, w8.ts).
 */
import type { Enemy, Platform } from '../types.ts';
import { PHYS } from '../physics.ts';
import type { Bush, WatchZone } from '../watcher.ts';
import type { PropDef, PropEmitter, Socket, StageSink } from './types.ts';

/** the tags a section's sockets ask by, in every world (pipeline WANT.stealth weighs 'cover') */
export const STILL_TAG = { hide: 'hide', cover: 'cover', watch: 'watch' } as const;

/** how long the watcher stays away between passes (s): where it is taught, and at the world's first and last stealth stages */
export interface CalmBand {
  teach: [number, number];
  early: [number, number];
  late: [number, number];
  /** how many stages further along the band this world sits (World 8's roosts wake as World 6's stage + 2 would) */
  lead?: number;
}

/** a hiding place: watcher.ts draws and hides by `bush`; `w` is how wide it stands (px) */
export interface HideRow {
  role: 'hide';
  bush: Bush['kind'];
  w: number;
  /** it hangs from where its socket stands (a rope's line, a bough's underside: its top there), and hides him while he hangs in it
   *  (stillness.ts inCover's hanging rule; World 1's hanging moss) */
  hanging?: boolean;
  minApart?: number;
  looks?: string[];
}

/** a watcher: it stands at the start of the stretch it looks along */
export interface WatchRow {
  role: 'watch';
  /** the tag its sockets ask by (default 'watch') */
  tag?: string;
  calm: CalmBand;
  /** the sockets (by id) laid where it is taught: the long calm */
  lesson?: readonly string[];
  /** sockets whose id starts with one of these watch only the piece they stand on (default: the bank and the pieces walked on from it) */
  own?: readonly string[];
  /** sockets whose id starts with one of these are a scare run: no hides along it, seen is a set-back to its start, never a heart */
  scare?: readonly string[];
  /** the kit animal that watches (World 1: 'eagle'): each stretch is laid as that animal over it (castWatches), not as watcher.ts's eagle */
  cast?: string;
  /** whose first pass is free (it dives and pulls up short): the stretches where it is taught, or none (default) */
  free?: 'lesson';
  /** the longest a watched stretch runs (px) and how far it runs past the last hide along it */
  max?: number;
  w?: number;
  minApart?: number;
  looks?: string[];
}

export type StillRow = HideRow | WatchRow;

/** the defaults every world has used so far (World 6's, World 8's) */
export const STILL = {
  /** the longest watched stretch (px) */
  max: 1400,
  /** a watched stretch runs this far past the last hide along it (px) */
  past: 120,
  /** a stretch starts and ends this far in from its bank's ends (px) */
  inset: 40,
  /** pieces within this of the watcher's bank in height are the same bank (a knee root up and down) */
  band: 60,
  /** a scare run sets him back to this far past the bank's start (px) */
  setback: 20,
  /** with no piece under it, a watcher looks this far each way (px) */
  blind: 300,
  hideApart: 260,
  watchApart: 500,
  watchW: 120,
} as const;

/** the first and last stages the band runs between (a world's stealth stages sit at 2..9) */
const BAND_FROM = 2, BAND_TO = 9;

/**
 * How long the watcher stays away between passes at a stage of its world: the long calm where it is taught, else along the band from
 * `early` to `late`. World 6's rule (w6.ts watchCalm before this file), now any world's by its own numbers.
 */
export function calmFor(band: CalmBand, stage: number, lesson: boolean): [number, number] {
  if (lesson) return [band.teach[0], band.teach[1]];
  const at = Math.min(BAND_TO, stage + (band.lead ?? 0));
  const k = Math.max(0, Math.min(1, (at - BAND_FROM) / (BAND_TO - BAND_FROM)));
  const mix = (a: number, b: number) => Math.round((a + (b - a) * k) * 10) / 10;
  return [mix(band.early[0], band.late[0]), mix(band.early[1], band.late[1])];
}

/** a number in 0..1 from a spot and a salt (the same socket in the same place always rolls the same) */
export const hash01 = (x: number, salt: number): number => {
  const s = Math.sin(x * 12.9898 + salt * 78.233) * 43758.5453;
  return s - Math.floor(s);
};
/** the look a prop wears at a spot: one of its `looks` by the spot's own roll, or its id */
export const lookAt = (p: Pick<PropDef, 'id' | 'looks'>, x: number, salt: number): string =>
  p.looks?.length ? p.looks[Math.floor(hash01(x, salt) * p.looks.length)] : p.id;

const R = Math.round;

/** the manifest's prop rows for a world's still table: sockets ask for them by tag */
export function stillProps(rows: Readonly<Record<string, StillRow>>): PropDef[] {
  return Object.entries(rows).map(([id, r]) =>
    r.role === 'hide'
      ? { id, tags: [STILL_TAG.hide, STILL_TAG.cover], w: r.w, minApart: r.minApart ?? STILL.hideApart, ...(r.looks ? { looks: r.looks } : {}) }
      : { id, tags: [r.tag ?? STILL_TAG.watch], w: r.w ?? STILL.watchW, minApart: r.minApart ?? STILL.watchApart, hazard: true, beat: true, ...(r.looks ? { looks: r.looks } : {}) });
}

/** a hide socket on a piece (a little above its top, where the cover stands) */
export const hideSocket = (id: string, on: string, t: Socket['t'] = 0.5, more: Partial<Socket> = {}): Socket =>
  ({ id, role: 'prop', on, t, allow: [STILL_TAG.hide, STILL_TAG.cover], ...more });
/** a watcher socket at the start of the piece it looks along; `tag` when the world's watcher has its own (World 8's 'roost') */
export const watchSocket = (id: string, on: string, t: Socket['t'] = 0.03, tag: string = STILL_TAG.watch, more: Partial<Socket> = {}): Socket =>
  ({ id, role: 'prop', on, t, allow: [tag], ...more });

/** the platform a socket's spot stands on (its top at the spot's y, the spot inside it) */
export function pieceAt(platforms: readonly Platform[], x: number, y: number): Platform | undefined {
  return platforms.find((p) => Math.abs(p.y - y) < 1 && x >= p.x && x <= p.x + p.width && p.type !== 'fragile');
}

/**
 * The stretch a watcher looks along: the piece under the spot and the pieces walked on from it onward with no gap between, up to
 * `max`; a gap ends it (the next bank has its own watcher). It never reaches back: a watcher stands at the start of its stretch.
 */
export function watchedRun(platforms: readonly Platform[], x: number, y: number, max: number = STILL.max): [number, number] | null {
  const p0 = pieceAt(platforms, x, y);
  if (!p0) return null;
  const banks = platforms.filter((p) => p.type !== 'fragile' && Math.abs(p.y - p0.y) <= STILL.band);
  const x0 = p0.x;
  let x1 = p0.x + p0.width;
  for (let grown = true; grown && x1 - x0 < max; ) {
    grown = false;
    for (const p of banks) if (Math.abs(p.x - x1) <= 2 && p.x + p.width > x1) (x1 = Math.min(p.x + p.width, x0 + max)), (grown = true);
  }
  return [x0, x1];
}

/** where the world keeps what it draws: each laid hide's look, each watcher that got its stretch */
export interface StillNote {
  hide?: (out: StageSink, at: { x: number; w: number; y: number; look: string }) => void;
  watch?: (out: StageSink, at: { x: number; y: number; run: [number, number]; scare: boolean; socket: string }) => void;
}

const starts = (id: string, list: readonly string[] | undefined): boolean => !!list?.some((p) => id.startsWith(p));

/** the emitters for a world's still table at one of its stages (the stage sets the watcher's calm) */
export function stillEmitters(rows: Readonly<Record<string, StillRow>>, stage: number, note: StillNote = {}): Record<string, PropEmitter> {
  const emit: Record<string, PropEmitter> = {};
  for (const [id, row] of Object.entries(rows)) {
    if (row.role === 'hide') {
      emit[id] = (f, p, out) => {
        const b: Bush = { x: R(f.x - row.w / 2), w: row.w, y: f.y, kind: row.bush, ...(row.hanging ? { hanging: true } : {}) };
        (out.proto.bushes ??= []).push(b);
        note.hide?.(out, { x: b.x, w: row.w, y: f.y, look: lookAt(p, f.x, 1) });
      };
      continue;
    }
    emit[id] = (f, _p, out) => {
      const scare = starts(f.socket, row.scare);
      const own = starts(f.socket, row.own) || scare ? pieceAt(out.platforms, f.x, f.y) : undefined;
      const run: [number, number] = own ? [own.x, own.x + own.width] : watchedRun(out.platforms, f.x, f.y, row.max) ?? [f.x - STILL.blind, f.x + STILL.blind];
      const lesson = !!row.lesson?.includes(f.socket);
      const z: WatchZone = {
        x0: R(run[0] + STILL.inset), x1: R(run[1] - STILL.inset), calm: calmFor(row.calm, stage, lesson),
        ...(scare ? { setback: R(run[0] + STILL.setback) } : {}),
        ...(row.cast ? { cast: row.cast } : {}),
        ...(row.free === 'lesson' && lesson ? { freeFirst: true } : {}),
      };
      const zones = (out.proto.watch ??= []);
      // (two watchers on one stretch make one zone)
      if (zones.some((q) => q.x0 < z.x1 && z.x0 < q.x1)) return;
      zones.push(z);
      note.watch?.(out, { x: f.x, y: f.y, run, scare, socket: f.socket });
    };
  }
  return emit;
}

/**
 * Each watched stretch cut to the hides laid along it (the pipeline lays a watcher before its hides, so this waits for pass 6): from
 * its start to `past` beyond its last hide. One with no hide in it is no watched stretch at all (seen with nowhere to go is unfair);
 * a scare run has none by design and stays whole.
 */
export function clipWatches(out: Pick<StageSink, 'proto'>, past: number = STILL.past): void {
  const zones = out.proto.watch;
  if (!zones?.length) return;
  const bushes = out.proto.bushes ?? [];
  out.proto.watch = zones.flatMap((z) => {
    if (z.setback !== undefined) return [z];
    const inside = bushes.filter((b) => b.x + b.w > z.x0 && b.x < z.x1);
    if (!inside.length) return [];
    return [{ ...z, x1: R(Math.min(z.x1, Math.max(...inside.map((b) => b.x + b.w)) + past)) }];
  });
}

/**
 * A world whose watcher is a creature-kit animal (WatchRow.cast; World 1's eagle, 1-7): after clipWatches, each of its stretches becomes
 * that animal over the stretch (`lay` makes it: w1Cast.ts eagleOver), with the stretch's calm as its own cool (the middle of the rolled
 * band) and its first pass free where the zone says so; the stretch leaves proto.watch (watcher.ts never runs it) and the kind joins the
 * stage's cast. One animal a stretch: the kit's eye crosses exactly that stretch.
 */
export function castWatches(out: Pick<StageSink, 'proto' | 'platforms' | 'enemies'>, lay: (z: WatchZone, groundY: number) => Enemy): void {
  const zones = out.proto.watch;
  if (!zones?.some((z) => z.cast)) return;
  const cast = (out.proto.cast ??= { kinds: [], traps: [] });
  for (const z of zones) {
    if (!z.cast) continue;
    const mid = (z.x0 + z.x1) / 2;
    const under = out.platforms.filter((p) => p.type !== 'fragile' && mid >= p.x && mid <= p.x + p.width).sort((a, b) => a.y - b.y)[0];
    out.enemies.push(lay(z, under?.y ?? 0));
    if (!cast.kinds.includes(z.cast)) cast.kinds.push(z.cast);
  }
  out.proto.watch = zones.filter((z) => !z.cast);
  if (!out.proto.watch.length) delete out.proto.watch;
}

/** the stretches a stage's kit sweepers watch, as zones, so stillFaults holds them to the same rules (their cool is their calm) */
export const sweptZones = (enemies: readonly Enemy[], kinds: readonly string[] = ['eagle']): WatchZone[] =>
  enemies.filter((e) => kinds.includes(e.type) && e.kitCool !== undefined).map((e) => ({ x0: e.patrolMinX, x1: e.patrolMaxX, calm: [e.kitCool!, e.kitCool!] }));

/** what a laid stretch must give him (the numbers the check holds a stage to) */
export interface StillRule {
  /** the shortest calm any stretch may have (s) */
  calmMin: number;
  /** how fast he is taken to cross open ground between hides (px/s) */
  pace: number;
}
/** watchCalm's floor since World 6 ("never under 5 s"), and a walk at half his full run (a first-timer creeping, not sprinting) */
export const STILL_RULE: StillRule = { calmMin: 5, pace: PHYS.maxRun / 2 };

/**
 * What is unfair about the hides and watched stretches a stage carries, in words (none: it may be laid):
 *   - a calm under the floor, or a calm written backwards;
 *   - a watched stretch (not a scare run) with no hide inside it;
 *   - open ground he cannot cross inside the shortest calm at `pace`: from the stretch's start to its first hide, between two hides,
 *     and from its last hide to its end;
 *   - a hide he cannot use: no ground under it (watcher.ts hides him only crouched on the surface at the bush's foot).
 */
export function stillFaults(st: { bushes?: readonly Bush[]; watch?: readonly WatchZone[]; platforms: readonly Platform[] }, rule: StillRule = STILL_RULE): string[] {
  const out: string[] = [];
  const bushes = (st.bushes ?? []).filter((b) => !b.secret);
  for (const z of st.watch ?? []) {
    const name = `watch ${z.x0}-${z.x1}`;
    if (z.calm[0] > z.calm[1]) out.push(`${name}: its calm runs backwards (${z.calm[0]} to ${z.calm[1]} s)`);
    if (z.calm[0] < rule.calmMin - 1e-6) out.push(`${name}: its calm is ${z.calm[0]} s, under ${rule.calmMin} s`);
    if (z.setback !== undefined) continue;
    const inside = bushes.filter((b) => b.x + b.w > z.x0 && b.x < z.x1).sort((a, b) => a.x - b.x);
    if (!inside.length) {
      out.push(`${name}: nowhere to hide along it`);
      continue;
    }
    const far = rule.pace * z.calm[0];
    // (he is hidden 10 px inside a hide's ends: watcher.ts hidden)
    const edges: Array<[string, number, number]> = [['its start', z.x0, inside[0].x + 10]];
    for (let i = 1; i < inside.length; i++) edges.push([`hide ${inside[i - 1].x}`, inside[i - 1].x + inside[i - 1].w - 10, inside[i].x + 10]);
    const last = inside[inside.length - 1];
    edges.push([`hide ${last.x}`, last.x + last.w - 10, z.x1]);
    for (const [from, a, b] of edges) if (b - a > far + 1e-6) out.push(`${name}: ${R(b - a)} px in the open from ${from}, more than a ${z.calm[0]} s calm crosses (${R(far)} px)`);
  }
  for (const b of bushes) {
    if (b.hanging) continue;
    const mid = b.x + b.w / 2;
    if (!st.platforms.some((p) => Math.abs(p.y - b.y) < 10 && mid >= p.x && mid <= p.x + p.width)) out.push(`hide ${b.x}: no ground under it`);
  }
  return out;
}
