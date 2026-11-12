// The seed list's own rules, judged on a bot's route (tools/inspect), so never shipped in the game: the quiet line (seedList.ts QUIET_MAX:
// a listed seed's longest quiet stretch on Normal, the goal run-out excluded). ONE definition for the list builder, its --check and the
// yield probe; `quietJudge` hands it to the search as BuildRequest.also (R-165.120), so a roll is repaired for it, not thrown away.
import { withGoals } from '../../src/game/goals.ts';
import { QUIET_MAX } from '../../src/game/gen2/seedList.ts';
import { pickRoute } from '../inspect/eraRoll.ts';
import { deadTime, NORMAL_GAP } from '../inspect/analyze.ts';
import type { BuildRequest, Gen2Stage } from '../../src/game/gen2/types.ts';
import type { LevelConfig } from '../../src/game/types.ts';

/** the longest quiet stretch on Normal before the goal section's entry (the outro excluded), where its middle lies, and the outro's px */
export function quietOf(cfg: LevelConfig, st: Gen2Stage): { quiet: number; outro: number; x: number } {
  const goal = st.gen2.sections.filter((q) => q.phase === 'goal').pop();
  const R = pickRoute(cfg.objectiveType, withGoals(st as never) as never);
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
