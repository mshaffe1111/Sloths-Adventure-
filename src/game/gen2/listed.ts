/**
 * The listed stages (packet E12 item 1; D43): the ONE definition of "a stage rolled from a proven seed list". A row per stage: its kit,
 * and what is that stage's alone as FIELDS. Moving a stage onto gen2 is a row here, its world's rows and its seed list (proven/seeds-<stage>.ts and its line in provenIndex.ts,
 * written by tools/engine/seedlist.ts); no tool and no engine line names a stage. DATA, not engine code.
 */
import { hasSeedList, plantSeedList } from './seedList.ts';
import { STAGE_TABLE } from './worlds/stageTable.ts';
import { w1World } from './worlds/w1.ts';
import { kitLib12 } from './worlds/w1Arc12.ts';
import { kitLib15 } from './worlds/w1Arc15.ts';
import { finish14, kitLib14 } from './worlds/w1Arc14.ts';
import { finish17, kitLib17 } from './worlds/w1Arc17.ts';
import type { Difficulty } from '../difficulty.ts';
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
  /** what its kit lays after World 1's finish (1-4's vine fields, figs, gates, pods and beats: w1Arc14.ts finish14) */
  finish?: <T>(st: T, difficulty: Difficulty) => T;
}

/** the world kits a row names (worlds/stageTable.ts `kit`); 'w1-12' is World 1's with 1-2's manifest-wide rows over it (w1Arc12.ts) */
const KITS: Record<string, () => WorldKit> = { w1: w1World, 'w1-12': () => kitLib12(), 'w1-14': kitLib14, 'w1-15': kitLib15, 'w1-17': kitLib17 };
/** the kits' own finishes, run after World 1's (by kit name) */
const FINISH: Record<string, ListedStage['finish']> = { 'w1-14': finish14 as ListedStage['finish'], 'w1-17': finish17 as ListedStage['finish'] };

/** the rows, from the ONE stage table (worlds/stageTable.ts, world data): each stage's kit and its own flags */
export const LISTED: Record<string, ListedStage> = Object.fromEntries(Object.entries(STAGE_TABLE).map(([id, r]) => [id, {
  kit: KITS[r.kit],
  ...(FINISH[r.kit] ? { finish: FINISH[r.kit] } : {}),
  ...(r.squirrels ? { squirrels: true as const } : {}),
  ...(r.firstRun ? { firstRun: true as const } : {}),
  ...(r.pick ? { pick: true as const } : {}),
}]));

/** a stage's row; undefined when it is not a listed stage */
export const listedStage = (stageId: string): ListedStage | undefined => (Object.hasOwn(LISTED, stageId) ? LISTED[stageId] : undefined);

/**
 * TEST-ONLY (nothing in the game calls it: listed.test.ts greps): add fixture rows to the table, their stub seed lists and, where a row
 * gives a `scope`, its line in the reach table (reach.ts JUDGED: the fixture is then judged on that scope's rows); run `fn`, and restore
 * all three, after a throw too. A fixture never writes over a shipped row.
 */
export function withTestStage<T>(rows: Record<string, ListedStage & { seeds: number[]; scope?: ReachScope }>, fn: () => T): T {
  const ids = Object.keys(rows);
  for (const id of ids) if (Object.hasOwn(LISTED, id) || hasSeedList(id) || Object.hasOwn(JUDGED, id)) throw new Error(`withTestStage: ${id} is already listed`);
  const undo: Array<() => void> = [];
  try {
    for (const id of ids) {
      const { seeds, scope, ...row } = rows[id];
      LISTED[id] = row;
      if (scope) JUDGED[id] = scope;
      undo.push(plantSeedList(id, { dict: [], seeds, plans: [] }));
    }
    return fn();
  } finally {
    for (const u of undo.reverse()) u();
    for (const id of ids) { delete LISTED[id]; delete JUDGED[id]; }
  }
}
