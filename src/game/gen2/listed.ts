/**
 * The listed stages (packet E12 item 1; D43): the ONE definition of "a stage rolled from a proven seed list". A row per stage: its kit,
 * and what is that stage's alone as FIELDS. Moving a stage onto gen2 is a row here, its world's rows and its seed list (proven/seeds-<stage>.ts and its line in provenIndex.ts,
 * written by tools/engine/seedlist.ts); no tool and no engine line names a stage. DATA, not engine code.
 */
import { hasSeedList, plantSeedList } from './seedList.ts';
import { STAGE_TABLE } from './worlds/stageTable.ts';
import { w1Finish, w1World } from './worlds/w1.ts';
import { kitLib12 } from './worlds/w1Arc12.ts';
import { kitLib15 } from './worlds/w1Arc15.ts';
import { finish16, kitLib16 } from './worlds/w1Arc16.ts';
import { finish14, kitLib14 } from './worlds/w1Arc14.ts';
import { finish17, kitLib17 } from './worlds/w1Arc17.ts';
import { finish18, kitLib18 } from './worlds/w1Arc18.ts';
import { finish19, kitLib19 } from './worlds/w1Arc19.ts';
import { w2Finish, w2World } from './worlds/w2.ts';
import { finish21, kitLib21 } from './worlds/w2Arc21.ts';
import { kitLib22 } from './worlds/w2Arc22.ts';
import { finish23, kitLib23 } from './worlds/w2Arc23.ts';
import { kitLib24 } from './worlds/w2Arc24.ts';
import { kitLib25 } from './worlds/w2Arc25.ts';
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
  /** its WORLD's finish, run first on every built roll (World 1's w1Finish: the cut art, the squirrels a row asks for, Meeca's marks;
   *  World 2's w2Finish: the rivers), by the kit's world. Every shipped row has one (LISTED); a test fixture without one is World 1's */
  world?: <T>(st: T, squirrels: boolean, difficulty: Difficulty) => T;
  /** what its kit lays after its world's finish (1-4's vine fields, figs, gates, pods and beats: w1Arc14.ts finish14) */
  finish?: <T>(st: T, difficulty: Difficulty) => T;
}

/** the world kits a row names (worlds/stageTable.ts `kit`); 'w1-12' is World 1's with 1-2's manifest-wide rows over it (w1Arc12.ts) */
const KITS: Record<string, () => WorldKit> = { w1: w1World, 'w1-12': () => kitLib12(), 'w1-14': kitLib14, 'w1-15': kitLib15, 'w1-16': kitLib16, 'w1-17': kitLib17, 'w1-18': kitLib18, 'w1-19': kitLib19, w2: w2World, 'w2-21': kitLib21, 'w2-22': kitLib22, 'w2-23': kitLib23, 'w2-24': kitLib24, 'w2-25': kitLib25 };
/** each kit's world finish (by kit name; every World 1 kit runs World 1's). A row's world finish, World 1's when it names none (a test's fixture) */
type WorldFinish = NonNullable<ListedStage['world']>;
const W1: WorldFinish = (st, squirrels) => w1Finish(st as never, squirrels) as typeof st;
const W2: WorldFinish = (st, _squirrels, difficulty) => w2Finish(st as never, difficulty) as typeof st;
export const worldFinish = (row: Pick<ListedStage, 'world'>): WorldFinish => row.world ?? W1;
const WORLD: Record<string, WorldFinish> = { w1: W1, 'w1-12': W1, 'w1-14': W1, 'w1-15': W1, 'w1-16': W1, 'w1-17': W1, 'w1-18': W1, 'w1-19': W1, w2: W2, 'w2-21': W2, 'w2-22': W2, 'w2-23': W2, 'w2-24': W2, 'w2-25': W2 };
/** the kits' own finishes, run after the world's (by kit name) */
const FINISH: Record<string, ListedStage['finish']> = { 'w1-14': finish14 as ListedStage['finish'], 'w1-16': finish16 as ListedStage['finish'], 'w1-17': finish17 as ListedStage['finish'], 'w1-18': finish18 as ListedStage['finish'], 'w1-19': finish19 as ListedStage['finish'], 'w2-21': finish21 as ListedStage['finish'], 'w2-23': finish23 as ListedStage['finish'] };

/** the rows, from the ONE stage table (worlds/stageTable.ts, world data): each stage's kit and its own flags */
export const LISTED: Record<string, ListedStage> = Object.fromEntries(Object.entries(STAGE_TABLE).map(([id, r]) => [id, {
  kit: KITS[r.kit],
  world: WORLD[r.kit],
  ...(FINISH[r.kit] ? { finish: FINISH[r.kit] } : {}),
  ...(r.squirrels ? { squirrels: true as const } : {}),
  ...(r.firstRun ? { firstRun: true as const } : {}),
  ...(r.pick ? { pick: true as const } : {}),
}]));

/**
 * a roll as Play finishes it (stageGenerator.ts generateStage: its world's finish (worldFinish: World 1's with its squirrels when the row says, World 2's rivers) when the row says, then the kit's own), on
 * a stage it may write onto: the ONE definition Play and the list's judges share (tools/engine/listRules.ts quietJudge), so whatever a
 * finish lays (a stage's hazards, its beats) is judged where the player meets it (ENG-CL (7): the quiet line judged 1-8's chase on the
 * roll before its finish; D19)
 */
export function playFinish<T>(row: ListedStage, st: T, difficulty: Difficulty): T {
  const done = worldFinish(row)(st, !!row.squirrels, difficulty);
  return row.finish ? row.finish(done, difficulty) : done;
}

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
