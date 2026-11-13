/**
 * Which build and which test a tester's run came from (Matt, 11-06: "track the version so we can see how changes affect previous
 * versions"). The sheet's Version column holds the build time; the recorder's 'env' moment (once a run) and every 'gen2' moment add:
 *   build  the git short commit the build was made from (vite.config.ts and the test link's config stamp __GIT_COMMIT__)
 *   list   the proven seed list's version, a short hash of the stage's list: a rebuilt list changes what seed N builds, so a play is
 *          only rebuilt from its seed with the same list
 *   round  TEST_ROUND below, bumped BY HAND for each round of testing; the testers' front page shows it in small print, so Matt can tell
 *          testers which round they are on
 */
import { PROVEN_INDEX } from './gen2/provenIndex.ts';

/** bump this by hand for each test round (and say so in the round's notes) */
export const TEST_ROUND = '1-1 gen2 r1';

declare const __GIT_COMMIT__: string;
export const GIT_COMMIT: string = typeof __GIT_COMMIT__ !== 'undefined' && __GIT_COMMIT__ ? __GIT_COMMIT__ : 'dev';

/** the stage's proven list as a version: its seeds and packed plans hashed (seedList.ts listVersion; the list tool writes it into the
 *  index, so it is known without the list in hand), or 'none' for a stage with no list */
export function seedListVersion(stageId: string): string {
  return PROVEN_INDEX[stageId]?.version ?? 'none';
}

/** the three, as the moments carry them: `build <commit> list <hash> round <label>` (the round last: it has spaces) */
export function runVersions(stageId = '1-1'): string {
  return `build ${GIT_COMMIT} list ${seedListVersion(stageId)} round ${TEST_ROUND}`;
}
