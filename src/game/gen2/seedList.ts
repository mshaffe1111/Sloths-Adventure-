/**
 * A rolled stage's proven seeds (the lead, 11-06, approving the planner's build-time fix): Play draws its seed from this list, so a play
 * never walks (provenGen2Stage stays the guard behind it). Each seed on the list was built at build time and laid cleanly on BOTH
 * settings (no gen2.errors: every slot filled by its rule, the required sections placed, no V-rule broken, Easy laying Normal's plan).
 * The list is written by tools/engine/seedlist.ts and held to it by its --check (a seed that no longer builds cleanly fails the gate),
 * so an engine or kit change that breaks a listed seed is caught before a player could draw it.
 */
import { buildGen2Stage } from './pipeline.ts';
import { PROVEN_SEEDS } from './provenSeeds.ts';
import type { WorldKit } from './types.ts';
import type { LevelConfig } from '../types.ts';

/** how many seeds a stage's list holds at least (the lead: a tester never notices a repeat) */
export const SEED_LIST_MIN = 300;

/** the proven seeds of a stage, in the order they were found */
export function provenSeeds(stageId: string): readonly number[] {
  return PROVEN_SEEDS[stageId]?.seeds ?? [];
}

/** the seed for a play: the n-th play draws the list's (n mod length)-th seed (a caller passes a random n for a fresh stage a play) */
export function provenSeedFor(stageId: string, n: number): number {
  const s = provenSeeds(stageId);
  if (!s.length) throw new Error(`gen2 ${stageId}: no proven seed list (tools/engine/seedlist.ts ${stageId})`);
  return s[((Math.floor(n) % s.length) + s.length) % s.length];
}

/** every way a stage's seed list breaks the rule, by name: too short, a repeat, or a seed that no longer lays cleanly on a setting */
export function seedListBreaches(config: LevelConfig, kit: () => WorldKit, seeds: readonly number[], min = SEED_LIST_MIN): string[] {
  const out: string[] = [];
  if (seeds.length < min) out.push(`${config.id}: ${seeds.length} proven seeds, under ${min}`);
  if (new Set(seeds).size !== seeds.length) out.push(`${config.id}: a seed is listed twice`);
  for (const seed of seeds) for (const difficulty of ['normal', 'easy'] as const) {
    const errs = buildGen2Stage({ config, kit: kit(), seed, difficulty }).gen2.errors ?? [];
    if (errs.length) out.push(`${config.id} seed ${seed} ${difficulty}: ${errs[0]}`);
  }
  return out;
}
