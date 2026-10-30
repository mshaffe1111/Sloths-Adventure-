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
import { w5RunFinish, w5RunKit } from './worlds/w5Run.ts';
import { w6Finish } from './worlds/w6.ts';
import { W6_GAME_STAGES, w6GameKit } from './worlds/w6Game.ts';
import { W7_GAME_STAGES, w7GameKit } from './worlds/w7Game.ts';
import { w7Finish } from './worlds/w7.ts';

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

/** World 7's stages (w7Game.ts): its sections and the stage's room in one kit, on the difficulty played; w7Finish puts Pokey's line
 *  before 7-5's first Stone Sentry (the other animals were taught in earlier worlds) */
const w7Entry = (stage: number, o: Partial<Gen2Entry> = {}): Gen2Entry => ({
  kit: (d) => w7GameKit(stage, d ?? 'normal'),
  kitName: `w7Game.ts:w7GameKit(${stage})`,
  finish: w7Finish,
  ...o,
});

/**
 * The stages gen2 builds, each with its kit (the per-stage chooser). 6-8 Stilt Climb is hand-built (w6Stages.ts).
 */
export const GEN2_STAGES: Readonly<Record<string, Gen2Entry>> = {
  // (5-6: Meeca's carvings are its messages, her words put on after the build: w5Run.ts)
  '5-6': { kit: w5RunKit, kitName: 'w5Run.ts:w5RunKit(6)', finish: (st) => w5RunFinish(st) },
  '5-7': { kit: () => w5Kit(7), kitName: 'w5.ts:w5Kit(7)' },
  // (5-9 Easy: the kid beat 5, 5, 9, 10, 10 and 10 spiders on seeds 1-3 before the shrine; 5 opens it in all six)
  '5-9': { kit: w5ArenaKit, kitName: 'w5Arena.ts:w5ArenaKit(9)', easyGoal: 5 },
  ...Object.fromEntries(W6_GAME_STAGES.map((id) => [id, w6Entry(Number(id.split('-')[1]))])),
  ...Object.fromEntries(W7_GAME_STAGES.map((id) => [id, w7Entry(Number(id.split('-')[1]))])),
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
  return M.pit === 'water' || M.pit === 'void' || M.sections.some((s) => s.pieces.some((p) => 'water' in p.place && !!p.place.water));
}

/** the creature sheets a gen2 stage's world can lay (its manifest's animals, by clip-sheet name: a snake draws the golden snake's) */
export function gen2Creatures(id: string): string[] {
  const M = GEN2_STAGES[id]?.kit('normal').manifest;
  return M ? [...new Set(M.creatures.map((c) => (c.enemy === 'snake' ? 'goldsnake' : c.enemy)))] : [];
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
