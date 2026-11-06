/**
 * The stage graphs (reference/engine/NODES.md §4, the designer's starting set): an archetype's several skeletons, each an ordered list of
 * node jobs. A world lists the ones it rolls from (manifest `graphs.list`); the pipeline rolls one per stage under the stage's brief and
 * lays the brief's rules on it by construction (pipeline.ts rolledGraph). Each graph is JUDGMENT (NODES.md §4): the research gives the
 * jobs and shapes, no shipped game publishes its list; each is judged by the gates and by Matt's play. 1-1 needs sprint A-D now (§6).
 */
import type { StageGraphDef } from './types.ts';

/** NODES.md §8.4's sprint graphs in the node code, as fixed at 5:17 PM and 5:22 PM (B's fork for V17) */
export const SPRINT_CODES: Readonly<Record<string, string>> = {
  'sprint-A': 'A T P F R X R S E',
  'sprint-B': 'A T M F R C U X R S R L E',
  'sprint-C': 'A P F X R W R D_ S E',
  'sprint-D': 'A T P R U F X R S E',
};
export const SPRINT_GRAPHS: readonly StageGraphDef[] = Object.entries(SPRINT_CODES).map(([id, code]) => ({ id, archetype: 'sprint', code }));
