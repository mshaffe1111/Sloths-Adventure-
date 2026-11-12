/**
 * The listed stages (packet E12 item 1; D43): the ONE definition of "a stage rolled from a proven seed list". A row per stage: its kit,
 * and what is that stage's alone as FIELDS. Moving a stage onto gen2 is a row here, its world's rows and its seed list (provenSeeds.ts,
 * written by tools/engine/seedlist.ts); no tool and no engine line names a stage. DATA, not engine code.
 */
import { PROVEN_SEEDS } from './provenSeeds.ts';
import { w1World } from './worlds/w1.ts';
import { JUDGED } from './reach.ts';
import type { WorldKit } from './types.ts';
import type { ReachScope } from './verdicts.types.ts';

export interface ListedStage {
  /** the world kit the stage is rolled from */
  kit: () => WorldKit;
  /** its finish dresses squirrels (a roll where too few find a spot is never listed) */
  squirrels?: true;
  /** it has a fixed first run, held to its lock */
  firstRun?: true;
  /** the test link's A, B, C picker runs on it */
  pick?: true;
}

export const LISTED: Record<string, ListedStage> = {
  '1-1': { kit: w1World, squirrels: true, firstRun: true, pick: true },
  '1-2': { kit: w1World },
};

/** a stage's row; undefined when it is not a listed stage */
export const listedStage = (stageId: string): ListedStage | undefined => (Object.hasOwn(LISTED, stageId) ? LISTED[stageId] : undefined);

/**
 * TEST-ONLY (nothing in the game calls it: listed.test.ts greps): add fixture rows to the table, their stub seed lists and, where a row
 * gives a `scope`, its line in the reach table (reach.ts JUDGED: the fixture is then judged on that scope's rows); run `fn`, and restore
 * all three, after a throw too. A fixture never writes over a shipped row.
 */
export function withTestStage<T>(rows: Record<string, ListedStage & { seeds: number[]; scope?: ReachScope }>, fn: () => T): T {
  const ids = Object.keys(rows);
  for (const id of ids) if (Object.hasOwn(LISTED, id) || Object.hasOwn(PROVEN_SEEDS, id) || Object.hasOwn(JUDGED, id)) throw new Error(`withTestStage: ${id} is already listed`);
  try {
    for (const id of ids) {
      const { seeds, scope, ...row } = rows[id];
      LISTED[id] = row;
      if (scope) JUDGED[id] = scope;
      PROVEN_SEEDS[id] = { dict: [], seeds, plans: [] };
    }
    return fn();
  } finally {
    for (const id of ids) { delete LISTED[id]; delete PROVEN_SEEDS[id]; delete JUDGED[id]; }
  }
}
