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
  /** the world kit the stage is rolled from, by name (listed.ts KITS): a world's own, or a world's kit with one stage's rows over it
   *  where they are manifest-wide (1-2's corridor room, thorn row and lessons: w1Arc12.ts kitLib12) */
  kit: 'w1' | 'w1-12' | 'w1-14' | 'w1-15' | 'w1-16' | 'w1-17' | 'w1-18' | 'w1-19' | 'w2' | 'w2-21' | 'w2-22' | 'w2-24';
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
  // (1-2 The Petal Trail: the piece library's roll F12 judged, w1Arc12.ts; the game rolls it, the hand-built 1-2 is deleted)
  '1-2': { kit: 'w1-12', judged: 'normal-1-2' },
  // (1-3 Branch Snakes: the designed arc, w1Arc13.ts; judged on its own flown rows, flownArcs.ts normal-1-3, P13 11-12. Its seed list is owed)
  '1-3': { kit: 'w1', judged: 'normal-1-3' },
  // (1-4 Up the Kapok: the designed arc laid UP (w1Arc14.ts, the ascent lay); its fields, figs, gates and pods by its own finish. Judged on
  // its own flown rows, flownArcs.ts normal-1-4, INT-3 11-13)
  '1-4': { kit: 'w1-14', judged: 'normal-1-4' },
  // (1-5 Where She Walked: the designed arc, w1Arc15.ts, on World 1's kit with its own rows (kitLib15); the mixer's 1-5 is deleted. Judged
  // on its own flown rows, flownArcs.ts normal-1-5, B15 11-13)
  '1-5': { kit: 'w1-15', judged: 'normal-1-5' },
  // (1-6 First Lianas: the designed arc, w1Arc16.ts, on World 1's kit with the swing and its own rows (kitLib16), its snakes by its finish
  // (finish16); the hand-built seesaw 1-6 is deleted. Judged on its own flown rows, flownArcs.ts normal-1-6, BUILD-16 11-14)
  '1-6': { kit: 'w1-16', judged: 'normal-1-6' },
  // (1-7 A Very Good Bush: the designed arc, w1Arc17.ts, on World 1's kit with its own rows (kitLib17) and its finish (finish17: the mossy
  //  lianas, one eye a beat, the perched eagle); the old hand-built 1-7 (protoStage.ts) is deleted. BUILD-17 11-14)
  // (1-7 A Very Good Bush: judged on its own flown rows, flownArcs.ts normal-1-7, INT-9 11-14)
  '1-7': { kit: 'w1-17', judged: 'normal-1-7' },
  // (1-8 The Long Branch: the designed arc, w1Arc18.ts, on World 1's kit with its own rows (kitLib18) and its finish (finish18: the nuts
  //  and fruit by data, the still fork, the tip, the hearts); the hand-built 1-8's routing is gone (protoStage HAND_STAGES). BUILD-18 11-14.
  //  Judged on its own flown rows, flownArcs.ts normal-1-8 (BUILD-18c), since FIX-GATES' bounce-reuse kind judges its plain bounces)
  '1-8': { kit: 'w1-18', judged: 'normal-1-8' },
  // (1-9 The Boa's Branches: its designed arc (w1Arc19.ts, kit 'w1-19', judged 'normal-1-9') is held back from release 1 (INT-14): the
  //  hand-built 1-9 (protoStage HAND_STAGES) ships as main had it until VAR-19's variety is green; its row comes back with it)
  // (2-1 Down to the River and 2-2 Petals for the Crown: World 2's kit (w2.ts, ENG-W2 11-14) on their placeholder arcs, until each
  //  level's designed arc replaces its bricks (reference/design/2-1.md, 2-2.md); the hand-built 2-1 and 2-2 are deleted. Judged on their
  //  own flown rows (flownArcs.ts normal-2-1 / normal-2-2) since ENG-W2b taught floor.unmarked and drop.unwarned World 2's water (the
  //  lead's ruling 11-14: painted water is its own mark; Dot warns at the first water))
  '2-1': { kit: 'w2-21', judged: 'normal-2-1' },
  // (2-2 Petals for the Crown: the designed arc, w2Arc22.ts, its own kit 'w2-22' (kitLib22), BUILD-22 11-15; its placeholder arc is gone)
  '2-2': { kit: 'w2-22', judged: 'normal-2-2' },
  // (2-4 Never Touch the Bank: the designed arc, w2Arc24.ts, its own kit 'w2-24' (kitLib24), BUILD-24 11-18: lianas over log rivers
  //  (ENG-24's place `river` after a liana); the hand-built 2-4 (w2Stages.ts) is deleted. Judged on its own flown rows, flownArcs.ts normal-2-4)
  '2-4': { kit: 'w2-24', judged: 'normal-2-4' },
};

/** a stage's row; undefined when the table has none (an inherited name is no row) */
export const stageRow = (stageId: string): StageRow | undefined => (Object.hasOwn(STAGE_TABLE, stageId) ? STAGE_TABLE[stageId] : undefined);
