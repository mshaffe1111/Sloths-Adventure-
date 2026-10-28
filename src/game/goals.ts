/**
 * goals — how much of what a stage holds its goal asks for (Matt, 2026-10-28), in one place for every stage, hand-built or generated:
 *
 *   gather (harvest)        about 85-90% of the petals and flowers the stage holds, counting only those a player can reach (never one
 *                           lying on a crumbling platform: those break, and no stage needs one);
 *   free (rescue)           every animal there is to free (the cages, World 5's cocoons);
 *   beat (purge, gauntlet)  about 70-80% of the stage's predators (the ring's snakes and the aerie's guard monkeys count too).
 *
 * Easy keeps the lower bars each stage had before (its own quota, `easyGoal`), and easyMode.ts makes a beat-the-animals goal gentler
 * still. A search (relic_hunt) keeps its own count: it is a finding goal, not a share.
 *
 * The engine applies it as it builds a stage on Normal (engine.ts), and the stage inspector reads the same counts (tools/inspect).
 * Pure: no engine, no canvas.
 */
import type { GeneratedStage } from './stageGenerator.ts';
import type { Collectible, Platform } from './types.ts';

/** Normal's shares */
export const GOAL_SHARE = {
  /** the middle of 85-90%: rounded to the nearest whole flower */
  collect: 0.875,
  /** the middle of 70-80% */
  defeat: 0.75,
  rescue: 1,
} as const;

type Stage = GeneratedStage & { proto?: { ring?: { waves: unknown[][] }; w4?: { monkeys?: Array<{ job: string; blowOff?: number }> }; w5?: { cocoons?: unknown[] } } };

/** is a collectible lying on a crumbling platform (one that breaks: fragile, or a ruin tile with a crumble time) */
export function onCrumbling(c: Pick<Collectible, 'x' | 'y'>, platforms: readonly Platform[]): boolean {
  // the platform right under it: its top a little under the flower (a flower floats about 30 px over its ground)
  let under: Platform | null = null;
  for (const p of platforms) {
    if (p.broken && p.type !== 'fragile') continue;
    if (c.x < p.x - 4 || c.x > p.x + p.width + 4 || p.y < c.y - 4 || p.y > c.y + 90) continue;
    if (!under || p.y < under.y) under = p;
  }
  return !!under && (under.type === 'fragile' || under.crumbleAfter !== undefined);
}

/** what a stage holds of what each kind of goal counts */
export function goalCounts(st: Stage): { petals: number; animals: number; rescuable: number; relics: number } {
  const c = (f: (t: string) => boolean) => st.collectibles.filter((x) => f(x.type)).length;
  const ring = (st.proto?.ring?.waves ?? []).reduce((s, w) => s + w.length, 0);
  const guards = (st.proto?.w4?.monkeys ?? []).filter((m) => m.job === 'guard' && m.blowOff).length;
  return {
    petals: st.collectibles.filter((x) => (x.type === 'flower' || x.type === 'leaf') && !onCrumbling(x, st.platforms)).length,
    animals: st.enemies.length + ring + guards,
    rescuable: c((t) => t === 'cage') + (st.proto?.w5?.cocoons?.length ?? 0),
    relics: c((t) => t === 'relic'),
  };
}

/** Normal's goal for a stage, from what it holds; null for a stage whose goal is not a share (a sprint, a search, a boss) */
export function normalGoal(st: Stage): number | null {
  const type = st.config.objectiveType;
  const n = goalCounts(st);
  const share = (have: number, k: number) => (have > 0 ? Math.max(1, Math.min(have, Math.round(have * k))) : null);
  if (type === 'harvest') return share(n.petals, GOAL_SHARE.collect);
  if (type === 'rescue') return share(n.rescuable, GOAL_SHARE.rescue);
  if (type === 'purge' || type === 'gauntlet') return share(n.animals, GOAL_SHARE.defeat);
  return null;
}

/**
 * Set a built stage's goal: Normal's share (normalGoal), keeping the stage's own quota as Easy's (`easyGoal`). Changes the stage and
 * returns it; a stage already set is left as it is.
 */
export function withGoals<T extends GeneratedStage>(st: T): T {
  if (st.easyGoal !== undefined || st.boss) return st;
  const g = normalGoal(st as Stage);
  if (g === null) return st;
  st.easyGoal = Math.min(st.config.targetCount, g);
  st.config = { ...st.config, targetCount: g };
  return st;
}
