/**
 * predators/lure — a lure target: a fixed thing in a stage that an animal fears (the owl's light, the caiman's water, the eagle's
 * roost), by the food chain's own rule (core.ts foodChain) with a place standing in for the hunter. An animal that `fears` what the
 * post stands for is chased off by its 'lure' outcome, away from the post, when it comes within the post's reach on the post's own
 * ground WHILE IT IS AFTER HIM (hunting, drawn to a noise, in its tell or its strike). On its own rounds it takes no notice: the kit
 * keeps every animal on its patch, at rest as in a charge, so a post that worked at rest would play the trick by itself. He does the
 * luring. The post does nothing to Pokey and nothing to an animal that does not fear it (gen2/lureLay.ts lureFaults holds a stage
 * to a target its animal can be drawn to).
 *
 * Pure (no canvas, no engine).
 */
import { beat } from './core.ts';
import type { PredatorDef, PredatorState } from './types.ts';

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
} as const;

/** the phases in which an animal is after him (or after a noise he made somewhere else): only then does a post work on it */
const AFTER_HIM: ReadonlySet<PredatorState['phase']> = new Set(['hunt', 'tell', 'act']);

/** is this animal inside this post's reach, on its ground? */
export const inReach = (p: LurePost, x: number, y: number): boolean => Math.abs(p.x - x) <= p.reach && Math.abs(p.y - y) <= LURE.tall;

/** one step of the stage's lure targets over its cast. Returns how many ran */
export function stepLures(all: ReadonlyArray<{ def: PredatorDef; s: PredatorState }>, posts: readonly LurePost[], t: number): number {
  let ran = 0;
  for (const a of all) {
    if (!a.def.fears?.length || !AFTER_HIM.has(a.s.phase)) continue;
    for (const p of posts) {
      if (!a.def.fears.includes(p.fear) || !inReach(p, a.s.x, a.s.y)) continue;
      if (beat(a.def, a.s, 'lure', t, p.x)) ran++;
      break;
    }
  }
  return ran;
}
