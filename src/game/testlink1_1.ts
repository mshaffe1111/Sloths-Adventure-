/**
 * The test link's 1-1 picker (the lead, 11-05: Matt compares OLD 1-1 with gen2 1-1's Rolls A, B and C on his phone). QA builds only
 * (playRecorder.ts qaBuild: the dev server and the test link, never the shipped game): the world map's 1-1 card shows four buttons, and
 * the pick decides how 1-1 is built until another is made.
 *   - 'mixer': the game as it is on this branch (the mixer's 1-1), the card's own Play button;
 *   - 'old': main's 1-1 builder as it is (protoStage.ts with 1-1's mixer spec skipped);
 *   - 'A' | 'B' | 'C': gen2 1-1 from World 1's kit (gen2/worlds/w1.ts), the seed from testlink1_1.json, which the lead sets at publish.
 */
import ROLLS from './testlink1_1.json';
import { qaBuild } from './playRecorder.ts';

export type Pick11 = 'mixer' | 'old' | 'A' | 'B' | 'C';
let pick: Pick11 = 'mixer';
/** set the pick (only a QA build's world map calls this) */
export const setPick11 = (p: Pick11): void => { pick = p; };
/** how 1-1 is built now: always the mixer outside a QA build */
export const pick11 = (): Pick11 => (qaBuild() ? pick : 'mixer');
/** the seed of a gen2 roll */
export const roll11Seed = (p: 'A' | 'B' | 'C'): number => (ROLLS as Record<string, number>)[p];
/** whether 1-1's mixer spec is skipped (the old builder) */
export const skip11Spec = (id: string): boolean => id === '1-1' && pick11() === 'old';
