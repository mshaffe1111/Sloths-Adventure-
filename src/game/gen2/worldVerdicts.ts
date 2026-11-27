// A WORLD'S OWN VERDICTS, declared on its manifest (R-165.537; ENG-MOON-b, the way ENG-W2FALL declared World 2's fall painter).
// A world whose bricks carry their own judges (World 3's dark, its moon) names them on WorldManifest.verdicts; the pipeline runs every
// named judge on every roll, on the roll's own setting, into gen2.errors (pipeline.ts buildGen2StageOn, and Easy's Normal build). One
// registry: a judge written but not named here is not run; a judge named on no manifest refuses nothing.
import type { Difficulty } from '../difficulty.ts';
import type { Gen2Stage } from './types.ts';
import { darkFlags, darkGaps, darkLandings } from './dark.ts';
import { moonVerdicts } from '../moon.ts';

/** every judge a manifest can name: its lines are the roll's faults, each by name */
export const WORLD_VERDICTS = {
  /** the dark brick (dark.ts): every gap out of the dark has a light a stop on its rim wakes */
  darkGaps: (st: Gen2Stage, d: Difficulty) => darkGaps(st, d),
  /** the dark brick: every landing he reaches in the dark is lit when he lands */
  darkLandings: (st: Gen2Stage, d: Difficulty) => darkLandings(st, d),
  /** the dark brick: no flag in the dark */
  darkFlags: (st: Gen2Stage) => darkFlags(st),
  /** the moon (moon.ts): every flower opens for the stair time, over its own storey's stone */
  moon: (st: Gen2Stage, d: Difficulty) => moonVerdicts(st as unknown as Parameters<typeof moonVerdicts>[0], d),
} as const satisfies Record<string, (st: Gen2Stage, d: Difficulty) => string[]>;

export type WorldVerdict = keyof typeof WORLD_VERDICTS;

/** the lines of every judge the manifest names, on this setting, each once */
export function worldVerdictLines(names: readonly WorldVerdict[] | undefined, st: Gen2Stage, d: Difficulty): string[] {
  const out: string[] = [];
  for (const n of names ?? []) for (const l of WORLD_VERDICTS[n](st, d)) if (!out.includes(l)) out.push(l);
  return out;
}
