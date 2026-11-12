/**
 * The stages gen2 rolls from data (packet E12 items 1 and 3, D43; the lead's ruling at the integration, INT-E 11-12): ONE table, a row a
 * stage, every fact that is that stage's alone. WORLD DATA (tools/engine/generalitycheck.ts EXEMPT: src/game/gen2/worlds/): the code
 * reads a row by the stage id it was handed and never names a stage. Its readers:
 *  - listed.ts: the listed stages (rolled from a proven seed list), each with its kit and its flags;
 *  - reach.ts JUDGED: the stages judged on the flown arcs, each with its Normal scope (Easy is easy-any);
 *  - seedList.ts standIn: the one listed seed with its plan, played when the stage's list cannot be had.
 * No world kit is imported here (reach.ts and seedList.ts load before any world's file): a row names its kit, listed.ts holds the kits.
 * Moving a stage onto gen2 is a row here, its world's rows and its seed list (tools/engine/seedlist.ts); judging the next stage is flying
 * it, entering its rows in reach.ts and giving its row `judged`.
 */
import type { BuildRequest } from '../types.ts';
import type { ReachScope } from '../verdicts.types.ts';
import { FIRST_RUN_11 } from '../firstRun11.ts';

export interface StageRow {
  /** the world kit the stage is rolled from, by name (listed.ts KITS) */
  kit: 'w1';
  /** its finish dresses squirrels (a roll where too few find a spot is never listed) */
  squirrels?: true;
  /** it has a fixed first run, held to its lock */
  firstRun?: true;
  /** the test link's A, B, C picker runs on it */
  pick?: true;
  /** judged on the flown arcs: its Normal scope (reach.ts JUDGED; Easy's rows are easy-any) */
  judged?: ReachScope;
  /** played when its list cannot be had: one listed seed with its proven plan (seedList.ts standIn) */
  standIn?: NonNullable<BuildRequest['replay']>;
}

export const STAGE_TABLE: Readonly<Record<string, StageRow>> = {
  // (1-1's stand-in is its fixed first run, firstRun11.ts, locked by `seedlist 1-1 --check`; seedList.test.ts holds it to the list's entry)
  '1-1': { kit: 'w1', squirrels: true, firstRun: true, pick: true, judged: 'normal-1-1', standIn: { seed: FIRST_RUN_11.seed, rerolls: FIRST_RUN_11.rerolls, plan: FIRST_RUN_11.plan, foes: FIRST_RUN_11.foes ?? [] } },
  '1-2': { kit: 'w1', judged: 'normal-1-2' },
  // (1-3 Branch Snakes: the designed arc, w1Arc13.ts. Not judged yet: P13 marks it. W1C tried `judged: 'normal-1-3'` on 11-12: 24 of 24
  //  rolls clean on both settings under 1-3's own flown rows; judgedTable.test.ts pins this table, so the mark and that test go together)
  '1-3': { kit: 'w1' },
};

/** a stage's row; undefined when the table has none (an inherited name is no row) */
export const stageRow = (stageId: string): StageRow | undefined => (Object.hasOwn(STAGE_TABLE, stageId) ? STAGE_TABLE[stageId] : undefined);
