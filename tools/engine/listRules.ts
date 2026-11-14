// The seed list's own rules, judged on a bot's route (tools/inspect), so never shipped in the game: the quiet line (seedList.ts QUIET_MAX:
// a listed seed's longest quiet stretch on Normal, the goal run-out excluded). ONE definition for the list builder, its --check and the
// yield probe; `quietJudge` hands it to the search as BuildRequest.also (R-165.120), so a roll is repaired for it, not thrown away.
import { withGoals } from '../../src/game/goals.ts';
import { QUIET_MAX } from '../../src/game/gen2/seedList.ts';
import { pickRoute } from '../inspect/eraRoll.ts';
import { deadTime, NORMAL_GAP } from '../inspect/analyze.ts';
import { softFallStage } from '../../src/game/gen2/pipeline.ts';
import { roomBreaches } from '../../src/game/gen2/helpRoom.ts';
import { easyStage } from '../../src/game/easyMode.ts';
import type { BuildRequest, Gen2Stage } from '../../src/game/gen2/types.ts';
import type { LevelConfig } from '../../src/game/types.ts';

/** the longest quiet stretch on Normal before the goal section's entry (the outro excluded), where its middle lies, and the outro's px */
export function quietOf(cfg: LevelConfig, st: Gen2Stage): { quiet: number; outro: number; x: number } {
  const goal = st.gen2.sections.filter((q) => q.phase === 'goal').pop();
  // (on a copy: withGoals writes the goal numbers onto the stage it is given, and a stage the list's search measured then differed from
  // its own replay on a purge stage, easyGoal/normalGoal/easyToday: seedlist 1-3 --check, P13 11-12)
  const R = pickRoute(cfg.objectiveType, withGoals({ ...st } as never) as never);
  const dn = deadTime(R.used.br.beats, R.used.br.total, NORMAL_GAP, R.used.samples);
  const gx = goal ? goal.x0 : Infinity;
  let worst = 0, x = 0;
  for (const d of dn.list) {
    const lo = Math.min(d.x0, d.x1), hi = Math.max(d.x0, d.x1);
    if (lo >= gx) continue;
    const share = hi > gx ? (gx - lo) / Math.max(1, hi - lo) : 1;
    if (d.counted * share > worst) { worst = d.counted * share; x = (lo + Math.min(hi, gx)) / 2; }
  }
  return { quiet: Math.round(worst * 10) / 10, outro: goal ? Math.round(goal.x1 - goal.x0) : 0, x };
}

/** the quiet line as a rule the search holds a roll to: on Normal, a stretch over `max` s refuses the roll and names the slot it lies in */
export function quietJudge(cfg: LevelConfig, max: number = QUIET_MAX): NonNullable<BuildRequest['also']> {
  return (st, difficulty) => {
    if (difficulty !== 'normal') return [];
    const q = quietOf(cfg, st);
    if (q.quiet <= max) return [];
    const slot = st.gen2.sections.findIndex((s) => q.x >= s.x0 && q.x <= s.x1);
    return [{ line: `the quiet line: ${q.quiet} s with nothing to do at x ${Math.round(q.x)}, over ${max} s (the goal run-out excluded)`, ...(slot >= 0 ? { slot } : {}) }];
  };
}

/**
 * Room for help (R-165.62's ladder; src/game/gen2/helpRoom.ts, the relay test's (b) rule): on a no-lethal stage (softFallStage, the
 * stages the help ladder serves) every rise of the stage AS PLAYED (its world's finish, its goals, and Easy's own transform on Easy, as
 * the relay test lays it) leaves room for the ladder's stair, or a single jump or a mushroom gives it. A roll with such a rise is refused
 * by name. POLISH-9b (R-165.228, the lead's ruling 8:21 AM 11-14): POLISH-7's relist listed 4 Easy layouts the test refused (33825,
 * 55341, 61613, 28931) because this judge did not ask it. `finish` is the world's own (the caller's: seedlist passes its row's).
 */
export function helpRoomBreaches(st: Gen2Stage, difficulty: 'normal' | 'easy', finish: (s: Gen2Stage) => Gen2Stage = (s) => s): string[] {
  if (!softFallStage(st)) return [];
  // (on a copy: the finish and the goals write onto the stage they are given, and the list keeps the search's own build)
  let played = withGoals(finish(structuredClone(st)) as never) as unknown as Gen2Stage;
  if (difficulty === 'easy') played = easyStage(played as never) as unknown as Gen2Stage;
  return roomBreaches(played).map((l) => `room for help (${difficulty}): ${l}`);
}
