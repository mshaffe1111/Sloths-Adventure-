/**
 * The stage graphs (reference/engine/NODES.md §4, the designer's starting set): an archetype's several skeletons, each an ordered list of
 * node jobs. A world lists the ones it rolls from (manifest `graphs.list`); the pipeline rolls one per stage under the stage's brief and
 * lays the brief's rules on it by construction (pipeline.ts rolledGraph). Each graph is JUDGMENT (NODES.md §4): the research gives the
 * jobs and shapes, no shipped game publishes its list; each is judged by the gates and by Matt's play. 1-1 needs sprint A-D now (§6).
 */
import type { StageGraphDef } from './types.ts';

export const SPRINT_GRAPHS: readonly StageGraphDef[] = [
  // (NODES.md §4 as fixed at 5:17 PM: A and C gained the rest after a test or twist, B and D a signature; cooldown is not a node)
  { id: 'sprint-A', archetype: 'sprint', jobs: ['arrive', 'teach', 'practise', 'fork', 'rest', 'test', 'rest', 'signature', 'exit'] },
  { id: 'sprint-B', archetype: 'sprint', jobs: ['arrive', 'teach', 'flow', 'fork', 'rest', 'combine', 'climb', 'test', 'rest', 'signature', 'rest', 'finale', 'exit'] },
  { id: 'sprint-C', archetype: 'sprint', jobs: ['arrive', 'practise', 'fork', 'test', 'rest', 'twist', 'rest', 'descent', 'signature', 'exit'] },
  { id: 'sprint-D', archetype: 'sprint', jobs: ['arrive', 'teach', 'practise', 'rest', 'climb', 'fork', 'test', 'rest', 'signature', 'exit'] },
];
