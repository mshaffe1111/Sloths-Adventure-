/**
 * podfall — falling pods (1-4.md engine piece 3, "4-1's rockfall down a column, a tell, the cost by data"): a ripe pod hangs under a
 * bough over a column of a vine field and lets go on its own steady beat. First it creaks and its fluff trickles down the column (the
 * tell, `warn` s before it lets go: 1.0 s on Normal, 1.5 s on Easy, 1-4.md "Pods fair"), then it drops down the column at the rockfall's
 * speed and bursts on the sound wood under it. A pod is dodged SIDEWAYS: a step to a vine out of its column. On two hands he spans two
 * columns, so a pod down either finds him (1-4.md "Two hands span two columns, so the fast way is the exposed way").
 *
 * The clock is 4-1's rockfall (rockfall.ts rockAt: idle, the tell, the fall, the burst), so a pod and a rock agree on time. What a pod
 * costs is the piece's own data (`cost`): 'knock' knocks him off his vine to the catch bough under him; 'heart' does that and costs a
 * heart (Normal; Easy's pods only knock, 1-4.md "Easy ... no hearts lost to pods"). Nothing he does harms a pod.
 *
 * Pure (no canvas, no engine, no stage ids): the stage builder, the engine (engine.ts, its pods block) and the tests agree on every pod.
 */
import { ROCK, rockAt, rockFits, type RockDrop, type RockPhase } from './rockfall.ts';
import type { Platform, Vine } from './types.ts';

/** what a pod costs him when it finds him */
export type PodCost = 'knock' | 'heart';

/** a column a pod falls down: a rockfall drop through open air (`air`: the tell is the creak and the trickle, never a shadow) */
export interface PodColumn extends RockDrop {
  id: number;
  /** the field vine whose column it falls down (its x is the vine's), if it is over one */
  vine?: number;
  cost: PodCost;
}

export const POD = {
  /** its body, for hitting him (px): a kapok pod about a quarter of his drawn height long (89.1, heroSprite.ts; LESSONS D41) */
  radius: 14,
  /** how far either side of a hand's line a pod finds him (px): his arms and head on the vine, never the vine beside it (70-90 px away) */
  hands: 26,
  /** how far either side of his middle it finds him off a vine (px): rockfall's 22 + 14, the same body */
  body: ROCK.radius + 14,
  /** the tell's least length (s): 1-4.md "Pods fair: the tell 1.0 s+ before one lets go" */
  tellMin: 1.0,
  /** no two tells he can see start within this long of each other (s): World 1 is one thing at a time (1-4.md "Rules") */
  apart: 1.5,
  /** how far apart two columns may be and still both be in his view (px): an upright phone's 440 px across, a little over */
  seen: 480,
  /** the farthest sound wood may be under any point of a column (px): STAGE-RULES §2 "Falls in climbs" */
  catchBelow: 450,
} as const;

export type PodPhase = RockPhase;

/** what a pod is doing at time t (rockfall's clock): its phase, how far through it, and its height while it falls */
export const podAt = (p: PodColumn, t: number): { phase: PodPhase; u: number; y: number } => rockAt(p, t);

/** which beat of its own a pod is on at time t (a hit is counted once a beat) */
export const podBeat = (p: PodColumn, t: number): number => Math.floor((t + p.offset) / p.every);

/**
 * Does a falling pod find him now? `xs`: the lines he occupies (on a vine field, each hand's vine x; off one, his middle), `feetY` his
 * feet, `height` his body. Off a vine the body's width counts (`POD.body`); on vines, only a pod down a column he holds (`POD.hands`).
 */
export function podHits(p: PodColumn, t: number, xs: readonly number[], feetY: number, height: number, onVines: boolean): boolean {
  const s = podAt(p, t);
  if (s.phase !== 'fall') return false;
  const near = onVines ? POD.hands : POD.body;
  if (!xs.some((x) => Math.abs(x - p.x) < near)) return false;
  return s.y > feetY - height && s.y - POD.radius * 2 < feetY;
}

/** a pod's cycle leaves room for the tell, the fall and the burst (rockfall's own check) */
export const podFits = (p: PodColumn): boolean => rockFits(p);

/** the seconds into each beat its tell starts (the creak; then `warn` s to the drop) */
export function tellStart(p: PodColumn): number {
  const fallT = Math.max(0.01, (p.land - p.top) / ROCK.speed);
  return p.every - p.warn - fallT - ROCK.shatter;
}

/** the game times its tells start in [t0, t1) */
export function tellsIn(p: PodColumn, t0: number, t1: number): number[] {
  const out: number[] = [];
  const s = tellStart(p);
  // (rockAt's clock: beat k runs from k * every - offset; its tell starts `s` into it)
  for (let k = Math.floor((t0 + p.offset) / p.every) - 1; ; k++) {
    const at = k * p.every - p.offset + s;
    if (at >= t1) break;
    if (at >= t0) out.push(at);
  }
  return out;
}

/**
 * What is wrong with a stage's pods, in words (none: they may be laid). 1-4.md "Rules" and "Pods fair":
 *   - each pod's cycle fits (rockfall's own check) and its tell is at least POD.tellMin;
 *   - two columns he can see at once (within POD.seen px across and both reaching the same heights) never start their tells within
 *     POD.apart s of each other, over a whole common cycle;
 *   - a pod over a field vine leaves a free vine within that vine's reach (no pod falls down it), so a step aside always dodges it;
 *   - sound wood lies under every point of a column within POD.catchBelow px (the knock lands him on it, never in a long fall).
 * `reach`: how far a step to a neighbour reaches (vineField.ts FIELD_FEEL.reach).
 */
export function podFaults(pods: readonly PodColumn[], vines: readonly Vine[], platforms: readonly Platform[], reach: number): string[] {
  const out: string[] = [];
  for (const p of pods) {
    if (!podFits(p)) out.push(`pod ${p.id}: its beat (${p.every} s) has no room for its tell, its fall and its burst`);
    if (p.warn < POD.tellMin - 1e-6) out.push(`pod ${p.id}: its tell is ${p.warn} s, under ${POD.tellMin} s`);
  }
  // tells apart, over one common stretch long enough for every pair's beats to meet (two whole cycles of the slower)
  for (let i = 0; i < pods.length; i++) {
    for (let j = i + 1; j < pods.length; j++) {
      const a = pods[i], b = pods[j];
      if (Math.abs(a.x - b.x) > POD.seen || a.land < b.top || b.land < a.top) continue;
      const span = 8 * Math.max(a.every, b.every);
      const ta = tellsIn(a, 0, span), tb = tellsIn(b, 0, span);
      if (ta.some((x) => tb.some((y) => Math.abs(x - y) < POD.apart - 1e-6))) out.push(`pods ${a.id} and ${b.id}: their tells start within ${POD.apart} s`);
    }
  }
  const podded = new Set(pods.map((p) => p.vine).filter((v): v is number => v !== undefined));
  for (const p of pods) {
    if (p.vine === undefined) continue;
    const v = vines.find((q) => q.id === p.vine);
    if (!v) {
      out.push(`pod ${p.id}: its vine ${p.vine} is not in the stage`);
      continue;
    }
    const free = vines.some((q) => q !== v && q.field && !podded.has(q.id) && Math.abs(q.x - v.x) <= reach && q.bottomY > v.topY && q.topY < v.bottomY);
    if (!free) out.push(`pod ${p.id}: no free vine within a step (${reach} px) of vine ${v.id}`);
  }
  for (const p of pods) {
    // the lowest point of the column he can be at: the vine's foot (on a vine) or the pod's landing
    const v = p.vine === undefined ? undefined : vines.find((q) => q.id === p.vine);
    const from = v ? v.topY : p.top;
    const wood = platforms.filter((q) => !q.broken && p.x >= q.x - 4 && p.x <= q.x + q.width + 4 && q.y >= from).map((q) => q.y);
    const under = wood.length ? Math.min(...wood) : Infinity;
    if (under - from > POD.catchBelow + (v ? v.bottomY - v.topY : 0)) out.push(`pod ${p.id}: no sound wood within ${POD.catchBelow} px under its column`);
    if (v && under - v.bottomY > POD.catchBelow) out.push(`pod ${p.id}: the wood under vine ${v.id}'s foot is ${Math.round(under - v.bottomY)} px down (over ${POD.catchBelow})`);
  }
  return out;
}
