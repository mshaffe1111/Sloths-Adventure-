/**
 * gen2/game — the new generator's hook-up into the game (DESIGN.md B10, piece G): which stages it builds, from which world kit, and
 * which of the curated rolls (seeds.ts) a layout number plays.
 *
 * stageGenerator.generateStage builds a stage listed here through `buildGen2Stage` (on the difficulty being played: Easy is the same
 * stage as Normal under Easy's rules, laid by the pipeline itself), then runs the shared post-passes the old generator runs
 * (hearts at the flags, the petal arcs it finds missing, the finds, fixPickups). easyMode.easyStage leaves out what gen2 already did
 * on Easy (stones, the animal cut, the longer tell, the gauntlet's lower bar) and keeps the flags, hearts and goal it does not.
 *
 * The layout number (layoutMemory.ts: kept until the stage is cleared, then a fresh one that is not the last one played) picks one
 * of the stage's shipped rolls, `seeds[variant % n]`: a retry keeps the roll, a fresh entry changes it, and every roll that can be
 * played was checked by the curation tool (tools/gen2/curate.ts) and is guarded by seeds.test.ts / game.test.ts.
 */
import type { Difficulty } from '../difficulty.ts';
import type { LevelConfig } from '../types.ts';
import { buildGen2Stage } from './pipeline.ts';
import { GEN2_SEEDS, type Gen2Seed } from './seeds.ts';
import type { Gen2Stage, WorldKit } from './types.ts';
import { w5Kit } from './worlds/w5.ts';
import { w5ArenaKit } from './worlds/w5Arena.ts';
import { w6Finish } from './worlds/w6.ts';
import { W6_GAME_STAGES, w6GameKit } from './worlds/w6Game.ts';
import { w8Finish } from './worlds/w8.ts';
import { W8_GAME_STAGES, w8GameKit } from './worlds/w8Game.ts';

export interface Gen2Entry {
  /**
   * the stage's world kit on a difficulty (a fresh one per build: a kit holds no state, but its emitters are made for the stage's
   * number; World 6's water room has an Easy version: w6Rooms.ts)
   */
  kit: (difficulty?: Difficulty) => WorldKit;
  /** what the world does to the built stage before the shared post-passes (World 6: w6Finish, Dot's first line for each new animal) */
  finish?: (st: Gen2Stage) => Gen2Stage;
  /** the kit's name as the curation tool writes it in seeds.ts (`kit`): the shipped rolls were checked on this kit */
  kitName: string;
  /**
   * Easy's goal for a fight stage, when set: the highest the first-timer kid bot opens the shrine with in at least 5 of its 6 Easy runs
   * (seeds 1-3, two trials each: the lead's rule, 2026-10-28). Normal keeps its share of what the stage holds (goals.ts)
   */
  easyGoal?: number;
}

/** World 6's stages (w6Game.ts): the ground, the swings and the stage's room in one kit, on the difficulty played */
const w6Entry = (stage: number, o: Partial<Gen2Entry> = {}): Gen2Entry => ({
  kit: (d) => w6GameKit(stage, d ?? 'normal'),
  kitName: `w6Game.ts:w6GameKit(${stage})`,
  finish: w6Finish,
  ...o,
});

/** World 8's stages (w8Game.ts): the boughs, the dark, the lianas and the stage's room in one kit, on the difficulty played */
const w8Entry = (stage: number, o: Partial<Gen2Entry> = {}): Gen2Entry => ({
  kit: (d) => w8GameKit(stage, d ?? 'normal'),
  kitName: `w8Game.ts:w8GameKit(${stage})`,
  finish: w8Finish,
  ...o,
});

/**
 * The stages gen2 builds, each with its kit (the per-stage chooser). 5-8 stays hand-built (Matt, 2026-10-28): it is still the old
 * generator's until its own build lands; 6-8 Stilt Climb is hand-built later.
 */
export const GEN2_STAGES: Readonly<Record<string, Gen2Entry>> = {
  '5-7': { kit: () => w5Kit(7), kitName: 'w5.ts:w5Kit(7)' },
  // (5-9 Easy: the kid beat 5, 5, 9, 10, 10 and 10 spiders on seeds 1-3 before the shrine; 5 opens it in all six)
  '5-9': { kit: w5ArenaKit, kitName: 'w5Arena.ts:w5ArenaKit(9)', easyGoal: 5 },
  ...Object.fromEntries(W6_GAME_STAGES.map((id) => [id, w6Entry(Number(id.split('-')[1]))])),
  ...Object.fromEntries(W8_GAME_STAGES.map((id) => [id, w8Entry(Number(id.split('-')[1]))])),
};

/** is this stage built by gen2 (a secret stage of the same number never is) */
export const isGen2Stage = (cfg: Pick<LevelConfig, 'id' | 'secret'>): boolean => !cfg.secret && !!GEN2_STAGES[cfg.id];

/**
 * does this gen2 stage lay water (a fall costs a life, so a warning sign stands at each: proto.gen2.waterWarnings): its world's pits, or
 * its sections' own water gaps (World 6's creeks)
 */
export function gen2Water(id: string): boolean {
  const M = GEN2_STAGES[id]?.kit('normal').manifest;
  if (!M) return false;
  return M.pit === 'water' || M.sections.some((s) => s.pieces.some((p) => 'water' in p.place && !!p.place.water));
}

/** how many rolls a stage ships (0: none, or not a gen2 stage) */
export const gen2SeedCount = (id: string): number => GEN2_SEEDS[id]?.seeds.length ?? 0;

/** which shipped roll a layout number plays (DESIGN.md B8: `variant % n`) */
export const gen2SeedIndex = (id: string, variant: number): number => {
  const n = gen2SeedCount(id);
  return n ? ((Math.abs(Math.floor(variant)) % n) + n) % n : 0;
};

/** the shipped roll a layout number plays */
export function gen2SeedFor(id: string, variant: number): Gen2Seed {
  const e = GEN2_SEEDS[id];
  if (!e?.seeds.length) throw new Error(`gen2: ${id} ships no curated rolls (run tools/gen2/curate.ts --stages ${id})`);
  return e.seeds[gen2SeedIndex(id, variant)];
}

/** the stage for a layout number, on the difficulty being played, before the shared post-passes (stageGenerator.generateStage) */
export function buildGen2ForGame(config: LevelConfig, difficulty: Difficulty, variant: number): Gen2Stage {
  const entry = GEN2_STAGES[config.id];
  if (!entry) throw new Error(`gen2: ${config.id} is not a gen2 stage`);
  const e = GEN2_SEEDS[config.id];
  const s = gen2SeedFor(config.id, variant);
  const st = buildGen2Stage({ config, kit: entry.kit(difficulty), seed: s.seed, difficulty, recent: e.recent });
  return entry.finish ? entry.finish(st) : st;
}
