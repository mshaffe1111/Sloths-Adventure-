/**
 * gen2/lureLay — LURE as a piece any world lays (ENGINE-NEEDS.md §2 packet 3; the map has 8 lure stages): a lure target is a prop
 * socket. A world says what its targets ARE in one table of rows (`LureRow`, by prop id: the owl's light stands for the owl, the
 * caiman's water for the caiman); everything else is here, once:
 *   lureProps      the manifest's prop rows (tags 'lure' and 'lure-<what it stands for>'), so a section's sockets ask by tag
 *   lureSocket     the world-neutral socket a section lists
 *   lureEmitters   what a filled socket lays: a LurePost in the stage's cast (proto.cast.lures; castPlay.ts runs predators/lure.ts)
 *   lureFaults     the builder's fairness check on what was laid, in words
 * The look (a lantern bough, a still pool) is the world's own: `note` hands each laid post to the world's extras.
 */
import { groundUnder } from '../castPlay.ts';
import type { CastData } from '../castPlay.types.ts';
import { castDef } from '../predators/registry.ts';
import { inReach, type LurePost } from '../predators/lure.ts';
import type { Enemy, Platform } from '../types.ts';
import type { PropDef, PropEmitter, Socket, StageSink } from './types.ts';
import { lookAt } from './stillLay.ts';

export const LURE_TAG = 'lure';
/** the tag of a target that stands for one feared kind */
export const lureTag = (fear: string): string => `${LURE_TAG}-${fear}`;

/** a lure target: what it stands for (a kind some animal `fears`), and how near an animal that fears it must come (px) */
export interface LureRow {
  fear: string;
  reach: number;
  w?: number;
  minApart?: number;
  looks?: string[];
}

export const LURE_LAY = { w: 80, minApart: 600 } as const;

/** the manifest's prop rows for a world's lure table */
export function lureProps(rows: Readonly<Record<string, LureRow>>): PropDef[] {
  return Object.entries(rows).map(([id, r]) =>
    ({ id, tags: [LURE_TAG, lureTag(r.fear)], w: r.w ?? LURE_LAY.w, minApart: r.minApart ?? LURE_LAY.minApart, beat: true, ...(r.looks ? { looks: r.looks } : {}) }));
}

/** a lure-target socket on a piece: any of the world's targets, or (`fear`) the one that stands for that kind */
export const lureSocket = (id: string, on: string, t: Socket['t'] = 0.5, fear?: string, more: Partial<Socket> = {}): Socket =>
  ({ id, role: 'prop', on, t, allow: [fear ? lureTag(fear) : LURE_TAG], ...more });

const castOf = (out: StageSink): CastData => (out.proto.cast ??= { kinds: [], traps: [] });

/** the emitters for a world's lure table; `note` is where the world keeps what it draws */
export function lureEmitters(
  rows: Readonly<Record<string, LureRow>>,
  note?: (out: StageSink, at: { x: number; y: number; fear: string; look: string }) => void,
): Record<string, PropEmitter> {
  const emit: Record<string, PropEmitter> = {};
  for (const [id, row] of Object.entries(rows)) {
    emit[id] = (f, p, out) => {
      const post: LurePost = { x: Math.round(f.x), y: f.y, fear: row.fear, reach: row.reach };
      (castOf(out).lures ??= []).push(post);
      note?.(out, { x: post.x, y: post.y, fear: row.fear, look: lookAt(p, f.x, 21) });
    };
  }
  return emit;
}

type Beast = Pick<Enemy, 'type' | 'x' | 'y' | 'height' | 'patrolMinX' | 'patrolMaxX' | 'defeated'>;

/**
 * What is unfair about a stage's lure targets and the animals laid with them, in words (none: it may be laid). `world` decides what
 * each animal fears there (the move ladder and who is about: predators/ways.ts inWorld):
 *   - a target nothing in the stage's cast fears, in this world: it is scenery that promises a trick;
 *   - a target no animal that fears it can be drawn to: the kit keeps an animal on its patch, so the target must stand on the
 *     animal's ground within its reach of that patch;
 *   - a target within its reach of where an animal that fears it starts: it would run the moment it noticed him, with no chase to read;
 *   - an animal whose FIRST way here is the lure (its world teaches it so), with nothing to lure it to: no target it can be drawn to
 *     and none of the kinds it fears in the stage.
 */
export function lureFaults(st: { enemies: readonly Beast[]; platforms: readonly Platform[]; cast?: Pick<CastData, 'kinds' | 'lures'> }, world: number): string[] {
  const out: string[] = [];
  const posts = st.cast?.lures ?? [];
  const kinds = st.cast?.kinds ?? [];
  const cast = st.enemies.filter((e) => !e.defeated && kinds.includes(e.type)).map((e) => ({ e, def: castDef(e.type, world), y: groundUnder(st.platforms, e) }));
  const fearing = (fear: string) => cast.filter((m) => m.def?.beatenBy.lure && m.def.fears?.includes(fear));
  type Laid = (typeof cast)[number];
  const drawnTo = (m: Laid, p: LurePost): boolean => inReach(p, Math.max(m.e.patrolMinX, Math.min(m.e.patrolMaxX, p.x)), m.y);
  const atStart = (m: Laid, p: LurePost): boolean => inReach(p, m.e.x, m.y);
  for (const p of posts) {
    const name = `lure target at ${p.x} (${p.fear})`;
    const who = fearing(p.fear);
    if (!who.length) {
      out.push(`${name}: nothing in the cast fears it here`);
      continue;
    }
    if (!who.some((m) => drawnTo(m, p))) out.push(`${name}: no animal that fears it can be drawn to it`);
    for (const m of who) if (atStart(m, p)) out.push(`${name}: the ${m.e.type} starts inside its reach (at ${Math.round(m.e.x)}), and would run the moment it noticed him`);
  }
  for (const m of cast) {
    if (m.def?.first !== 'lure' || !m.def.fears?.length) continue;
    const post = posts.some((p) => m.def!.fears!.includes(p.fear) && drawnTo(m, p));
    const hunter = cast.some((q) => q !== m && m.def!.fears!.includes(q.e.type));
    if (!post && !hunter) out.push(`${m.e.type} at ${Math.round(m.e.x)}: its first way here is the lure, with nothing to lure it to`);
  }
  return out;
}
