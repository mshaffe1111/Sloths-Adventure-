/**
 * How 1-1 is built. The card's own Play button is gen2 1-1 from the proven-seed list (below). The rest is TEST-LINK ONLY, REMOVE BEFORE
 * ANY RELEASE with the restored old 1-1 block in protoStage.ts (new replaces old): Matt's picker (the lead, 11-05: he compares OLD 1-1 with
 * gen2 1-1's Rolls A, B and C on his phone), in a QA build with its flag only (pickerOn); the pick holds until another is made.
 *   - 'play': gen2 1-1, a fresh proven seed each press of Play;
 *   - 'old': main's 1-1 builder as it is (protoStage.ts with 1-1's mixer spec skipped);
 *   - 'A' | 'B' | 'C': gen2 1-1 from World 1's kit (gen2/worlds/w1.ts), the seed from testlink1_1.json, which the lead sets at publish.
 */
import ROLLS from './testlink1_1.json';
import { qaBuild } from './playRecorder.ts';
import { provenSeedFor } from './gen2/seedList.ts';

export type Pick11 = 'play' | 'old' | 'A' | 'B' | 'C';
let pick: Pick11 = 'play';
/** set the pick ('play': the card's own Play button; the others only from Matt's picker in a QA build) */
export const setPick11 = (p: Pick11): void => { pick = p; };
/** how 1-1 is built now: gen2 from the proven-seed list ('play') outside a QA build */
export const pick11 = (): Pick11 => (qaBuild() ? pick : 'play');
/** the seed of a gen2 roll */
export const roll11Seed = (p: 'A' | 'B' | 'C'): number => (ROLLS as Record<string, number>)[p];
/** whether 1-1's mixer spec is skipped (the old builder) */
export const skip11Spec = (id: string): boolean => id === '1-1' && pick11() === 'old';

/**
 * 1-1's Play (the lead, 11-06, Matt: "1-1's Play = gen2, a fresh proven seed per play"): each press of Play draws a seed from the proven
 * list (gen2/seedList.ts), kept until the next press, so a restart or a respawn in the same play builds the same stage. With no draw yet
 * (the tests and the tools) the stage's layout variant picks it, so a run is the same each time
 */
let playSeed: number | null = null;
/** the next play's seed, drawn ahead so its stage can be built while the map is up (buildAhead.ts); Play takes it */
let nextSeed: number | null = null;
export const peekPlay11 = (rand: () => number = Math.random): number => (nextSeed ??= provenSeedFor('1-1', Math.floor(rand() * 1e9)));
export const newPlay11 = (rand: () => number = Math.random): number => {
  playSeed = nextSeed ?? provenSeedFor('1-1', Math.floor(rand() * 1e9));
  nextSeed = null;
  return playSeed;
};
export const play11Seed = (variant: number): number => playSeed ?? provenSeedFor('1-1', variant - 1);
/** run `fn` as if `seed` had been drawn for this play (the build-ahead builds the next play's stage with it) */
export function withPlaySeed<T>(seed: number, fn: () => T): T {
  const was = playSeed;
  playSeed = seed;
  try {
    return fn();
  } finally {
    playSeed = was;
  }
}
/** forget the drawn seeds (tests) */
export const clearPlay11 = (): void => { playSeed = null; nextSeed = null; };

/** Matt's picker (Old 1-1, Rolls A/B/C) shows only in a QA build with its flag: ?pick11 once (kept on the device), never for testers */
export function pickerOn(): boolean {
  if (!qaBuild()) return false;
  try {
    if (typeof location !== 'undefined' && new URLSearchParams(location.search).has('pick11')) localStorage.setItem('sloth_qa_pick11', '1');
    return localStorage.getItem('sloth_qa_pick11') === '1';
  } catch {
    return false;
  }
}

/**
 * A child process measuring a picked roll (stage.ts --roll, the red team's RT-ENGINE #1: its children graded the mixer's 1-1): set the
 * pick from STAGE_ROLL (A, B or C) and stand in for a QA build, so generateStage builds that roll. Returns the roll and the seed it must
 * measure (the caller asserts it on what it built), or null when no roll is asked for. Throws on an unknown roll: never a silent fallback
 */
export async function applyRollEnv(env: Record<string, string | undefined>): Promise<{ roll: 'A' | 'B' | 'C'; seed: number } | null> {
  const r = env.STAGE_ROLL;
  if (!r) return null;
  if (r !== 'A' && r !== 'B' && r !== 'C') throw new Error(`STAGE_ROLL=${r}: A, B or C`);
  const { asQaBuildForTest } = await import('./playRecorder.ts');
  asQaBuildForTest(true);
  setPick11(r);
  return { roll: r, seed: roll11Seed(r) };
}
