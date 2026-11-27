/**
 * predators/lure — a lure target: a fixed thing in a stage that an animal fears (the owl's light, the caiman's water, the eagle's
 * roost), by the food chain's own rule (core.ts foodChain) with a place standing in for the hunter. An animal that `fears` what the
 * post stands for is chased off by its 'lure' outcome, away from the post, when it comes within the post's reach on the post's own
 * ground WHILE IT IS AFTER HIM (hunting, drawn to a noise, in its tell or its strike). On its own rounds it takes no notice: the kit
 * keeps every animal on its patch, at rest as in a charge, so a post that worked at rest would play the trick by itself. He does the
 * luring. The post does nothing to Pokey and nothing to an animal that does not fear it (gen2/lureLay.ts lureFaults holds a stage
 * to a target its animal can be drawn to).
 *
 * A post that stands for a ZONE KIND (World 3's spore patch: `fear: 'spore'`) is a place, not a creature: it works only while that
 * zone's effect at the post has been over its floor for LURE.cloud.hold seconds (the clock gate, 3-3.md NEW 1 (b)), so an animal called
 * onto a patch whose cloud is in, or just starting, walks on it and back unharmed. A post of any other kind has no gate.
 *
 * Pure (no canvas, no engine).
 */
import { beat } from './core.ts';
import type { PredatorDef, PredatorState } from './types.ts';
import { DROWSY_MIN, zoneEffect, type Zone, type ZoneKind } from '../zones.ts';

/** one lure target as a stage lays it (castPlay.types.ts CastData.lures) */
export interface LurePost {
  x: number;
  /** the ground it stands on */
  y: number;
  /** what it stands for: a kind some animal `fears` */
  fear: string;
  /** how near an animal that fears it must come (px along the ground) */
  reach: number;
}

export const LURE = {
  /** a post works on its own ground only: an animal this far above or below it is on another level (px) */
  tall: 70,
  /** a zone post's gate: the zone's effect at the post over `floor` (the spore's drowsy floor) for `hold` seconds running */
  cloud: { floor: DROWSY_MIN, hold: 0.3 },
} as const;

/** the zone kinds a post can stand for (a place's effect, not a creature) */
const ZONE_FEARS: ReadonlySet<string> = new Set<ZoneKind>(['spore', 'wind', 'geyser', 'bolt', 'web', 'tide', 'dark', 'crumble']);

/** does this post stand for a zone kind (and so wait on its gate)? */
export const isZonePost = (p: Pick<LurePost, 'fear'>): boolean => ZONE_FEARS.has(p.fear);

/**
 * The stage's lure gates: one per post, stepped once a step. A creature post is always open; a zone post opens once its zone's effect
 * at the post has been over LURE.cloud.floor for LURE.cloud.hold s running, and shuts the moment it drops under. `zones`: the stage's.
 */
export function lureGates(posts: readonly LurePost[], zones: readonly Zone[]): (t: number) => readonly boolean[] {
  const since: (number | null)[] = posts.map(() => null);
  const open: boolean[] = posts.map((p) => !isZonePost(p));
  return (t: number) => {
    posts.forEach((p, i) => {
      if (!isZonePost(p)) return;
      const on = zoneEffect(zones, p.fear as ZoneKind, p.x, p.y, t).strength > LURE.cloud.floor;
      if (!on) since[i] = null;
      else if (since[i] === null) since[i] = t;
      open[i] = on && t - (since[i] as number) >= LURE.cloud.hold - 1e-9;
    });
    return open;
  };
}

/** the phases in which an animal is after him (or after a noise he made somewhere else): only then does a post work on it */
const AFTER_HIM: ReadonlySet<PredatorState['phase']> = new Set(['hunt', 'tell', 'act']);

/** is this animal inside this post's reach, on its ground? */
export const inReach = (p: LurePost, x: number, y: number): boolean => Math.abs(p.x - x) <= p.reach && Math.abs(p.y - y) <= LURE.tall;

/** one step of the stage's lure targets over its cast (`open`: each post's gate this step, lureGates; none given, all open). Returns how many ran */
export function stepLures(all: ReadonlyArray<{ def: PredatorDef; s: PredatorState }>, posts: readonly LurePost[], t: number, open?: readonly boolean[]): number {
  let ran = 0;
  for (const a of all) {
    if (!a.def.fears?.length || !AFTER_HIM.has(a.s.phase)) continue;
    for (const [i, p] of posts.entries()) {
      if (open && !open[i]) continue;
      if (!a.def.fears.includes(p.fear) || !inReach(p, a.s.x, a.s.y)) continue;
      if (beat(a.def, a.s, 'lure', t, p.x)) ran++;
      break;
    }
  }
  return ran;
}
