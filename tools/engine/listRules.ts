// The seed list's own rules, judged on a bot's route (tools/inspect), so never shipped in the game: the quiet line (seedList.ts QUIET_MAX:
// a listed seed's longest quiet stretch on Normal, the goal run-out excluded). ONE definition for the list builder, its --check and the
// yield probe; `quietJudge` hands it to the search as BuildRequest.also (R-165.120), so a roll is repaired for it, not thrown away.
import { withGoals } from '../../src/game/goals.ts';
import { buildPlayStage, QUIET_MAX } from '../../src/game/gen2/seedList.ts';
import { pickRoute } from '../inspect/eraRoll.ts';
import { deadTime, NORMAL_GAP } from '../inspect/analyze.ts';
import { softFallStage } from '../../src/game/gen2/pipeline.ts';
import { roomBreaches } from '../../src/game/gen2/helpRoom.ts';
import { easyStage } from '../../src/game/easyMode.ts';
import type { BuildRequest, Gen2Stage, WorldKit } from '../../src/game/gen2/types.ts';
import type { LevelConfig } from '../../src/game/types.ts';

/** a roll's finish as Play gives it (listed.ts playFinish, by the stage's row), on a stage it may write onto */
export type RollFinish = (st: Gen2Stage, difficulty: 'normal' | 'easy') => Gen2Stage;

/**
 * the longest quiet stretch on Normal before the goal section's entry (the outro excluded), where its middle lies, and the outro's px.
 * Measured on the roll AS PLAYED when `finish` is given (the row's, listed.ts playFinish): a hazard its finish lays is a beat (ENG-CL (7))
 */
export function quietOf(cfg: LevelConfig, st: Gen2Stage, finish?: RollFinish): { quiet: number; outro: number; x: number } {
  const goal = st.gen2.sections.filter((q) => q.phase === 'goal').pop();
  // (on a copy: withGoals writes the goal numbers onto the stage it is given, and a stage the list's search measured then differed from
  // its own replay on a purge stage, easyGoal/normalGoal/easyToday: seedlist 1-3 --check, P13 11-12. A finish writes onto it too, so it
  // gets a deep copy and the search keeps its own build)
  const played = finish ? finish(structuredClone(st), 'normal') : st;
  const R = pickRoute(cfg.objectiveType, withGoals({ ...played } as never) as never);
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

/**
 * the quiet line as a rule the search holds a roll to: on Normal, a stretch over `max` s refuses the roll and names the slot it lies in.
 * Judged on the roll as played: the caller passes its row's finish (listed.ts playFinish), so a chase's nuts and fruit a finish lays
 * count (ENG-CL (7), BUILD-18: 1-8's K3 read as 18.2 s of nothing on the bare roll)
 */
export function quietJudge(cfg: LevelConfig, finish?: RollFinish, max: number = QUIET_MAX): NonNullable<BuildRequest['also']> {
  return (st, difficulty) => (difficulty !== 'normal' ? [] : quietLine(st, quietOf(cfg, st, finish), max));
}

/** the quiet line's refusal for a roll measured at `q`, naming the slot (of the roll's own plan) its longest stretch lies in */
function quietLine(st: Gen2Stage, q: { quiet: number; x: number }, max: number): ReturnType<NonNullable<BuildRequest['also']>> {
  if (q.quiet <= max) return [];
  const slot = st.gen2.sections.findIndex((s) => q.x >= s.x0 && q.x <= s.x1);
  return [{ line: `the quiet line: ${q.quiet} s with nothing to do at x ${Math.round(q.x)}, over ${max} s (the goal run-out excluded)`, ...(slot >= 0 ? { slot } : {}) }];
}

/**
 * a roll's finish on one setting, on a copy (the finish writes onto the stage it is given): the line that refuses the roll when the
 * finish THROWS, else undefined. Play runs the row's finish (listed.ts playFinish) with no catch (stageGenerator.ts generateStage), so a
 * finish that throws is a stage that does not load on a phone. ENG-DR (1): the list ran World 1's finish only (w1Finish, a `squirrels`
 * row), so a seed whose own finish (1-4's finish14, 1-7's finish17, 1-8's finish18) throws on a setting could be listed.
 */
export function finishThrow(st: Gen2Stage, difficulty: 'normal' | 'easy', finish: RollFinish): string | undefined {
  try { finish(structuredClone(st), difficulty); return undefined; } catch (err) { return `the finish throws (${difficulty}): ${(err as Error).message}`; }
}

/**
 * the list's rules as ONE judge the search holds a roll to (BuildRequest.also; seedlist.ts and yield.ts --list): on each setting the
 * roll's finish must not throw (finishThrow: a line with no slot, so the search rolls the stage again, R-165.120), and on Normal the quiet
 * line (quietJudge), measured on the same finish. One finish per setting.
 */
export function listJudge(cfg: LevelConfig, finish: RollFinish, max: number = QUIET_MAX): NonNullable<BuildRequest['also']> {
  return (st, difficulty) => {
    let played: Gen2Stage;
    try { played = finish(structuredClone(st), difficulty); } catch (err) { return [{ line: `the finish throws (${difficulty}): ${(err as Error).message}` }]; }
    // (quietJudge's own rule, on the stage just finished: quietOf with no finish measures the stage it is handed)
    return difficulty !== 'normal' ? [] : quietLine(st, quietOf(cfg, played), max);
  };
}

/**
 * Room for help (R-165.62's ladder; src/game/gen2/helpRoom.ts, the relay test's (b) rule): on a no-lethal stage (softFallStage, the
 * stages the help ladder serves) every rise of the stage AS PLAYED (its world's finish, its goals, and Easy's own transform on Easy, as
 * the relay test lays it) leaves room for the ladder's stair, or a single jump or a mushroom gives it. A roll with such a rise is refused
 * by name. POLISH-9b (R-165.228, the lead's ruling 8:21 AM 11-14): POLISH-7's relist listed 4 Easy layouts the test refused (33825,
 * 55341, 61613, 28931) because this judge did not ask it. `finish` is the row's (the caller's: seedlist passes listed.ts playFinish).
 */
export function helpRoomBreaches(st: Gen2Stage, difficulty: 'normal' | 'easy', finish: RollFinish = (s) => s): string[] {
  if (!softFallStage(st)) return [];
  // (on a copy: the finish and the goals write onto the stage they are given, and the list keeps the search's own build. The finish is
  // the row's whole one on this setting (listed.ts playFinish): ENG-CL found it judged before 1-4's, 1-7's and 1-8's own, ENG-DR (1))
  let played = withGoals(finish(structuredClone(st), difficulty) as never) as unknown as Gen2Stage;
  if (difficulty === 'easy') played = easyStage(played as never) as unknown as Gen2Stage;
  return roomBreaches(played).map((l) => `room for help (${difficulty}): ${l}`);
}

/**
 * Each listed seed AS PLAY BUILDS IT, on each setting (D19: the two calls stageGenerator.ts generateStage makes): its proven plan replayed
 * (seedList.ts buildPlayStage), then the row's whole finish (`finish`: listed.ts playFinish). A finish that throws (a squirrels row's too
 * few spots among them) is a stage that does not load on a phone, refused by name (ENG-DR (1)); on the rest, the quiet line on Normal
 * (at most `max` s, the outro excluded) and room for help on each setting (helpRoomBreaches). seedlist.ts --check's own lines.
 */
export function asPlayedBreaches(cfg: LevelConfig, kit: () => WorldKit, seeds: readonly number[], finish: RollFinish, max: number = QUIET_MAX): string[] {
  const out: string[] = [];
  for (const seed of seeds) for (const difficulty of ['normal', 'easy'] as const) {
    const st = buildPlayStage(cfg, kit(), seed, difficulty);
    const t = finishThrow(st, difficulty, finish);
    if (t) { out.push(`${cfg.id} seed ${seed}: ${t}`); continue; }
    // (the quiet line BINDS, the lead 11-06: every listed seed's longest quiet stretch on Normal, the outro excluded)
    const q = difficulty === 'normal' ? quietOf(cfg, st, finish).quiet : 0;
    if (q > max) out.push(`${cfg.id} seed ${seed}: ${q} s quiet, over the line ${max} s (the outro excluded)`);
    for (const l of helpRoomBreaches(st, difficulty, finish)) out.push(`${cfg.id} seed ${seed}: ${l}`);
  }
  return out;
}
