/**
 * A stage's saved result (`sloth_lvl_<id>`): the best stars, score and time, each with the mode it was set on (polish report LV-1:
 * a best on Easy and a best on Normal are not the same feat, so the record says which it was). A worse replay never overwrites a
 * better result; an old record with no mode keeps its results and has no mode for them.
 */
import type { Difficulty } from './difficulty.ts';

export interface StageBest {
  completed: boolean;
  stars: number;
  highScore: number;
  bestTime: number;
  /** the mode each best was set on */
  starsMode?: Difficulty;
  scoreMode?: Difficulty;
  timeMode?: Difficulty;
}

/**
 * A stored stage result, read one way by every reader (the stage list, the extra stages, the save summary, the expedition total, the
 * journal): typed and clamped, stars a whole 0..3, score and time finite and not below 0; null when there is none or it cannot be read.
 * Audit lead save-hydrate-and-summary (2026-11-11): the readers each had their own rule, so "stars":"3" became the title's star total
 * "033", and a stars of 1e9 was shown and then kept for good by mergeBest.
 */
export function readStageResult(raw: string | null | undefined): Pick<StageBest, 'completed' | 'stars' | 'highScore' | 'bestTime'> | null {
  if (!raw) return null;
  let o: unknown;
  try {
    o = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!o || typeof o !== 'object') return null;
  const r = o as Record<string, unknown>;
  const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : 0);
  return { completed: !!r.completed, stars: Math.min(3, Math.floor(num(r.stars))), highScore: num(r.highScore), bestTime: num(r.bestTime) };
}

export function mergeBest(prev: Partial<StageBest> | null | undefined, run: { stars: number; score: number; time: number }, mode: Difficulty): StageBest {
  const p = prev ?? {};
  // (read as readStageResult reads it: a damaged or edited record cannot keep a best no run can beat)
  const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : 0);
  const prevStars = Math.min(3, Math.floor(num(p.stars)));
  const prevScore = num(p.highScore);
  const prevTime = num(p.bestTime);
  // (a tie on stars or score goes to Normal: the same result on the harder mode is the one worth keeping)
  const better = (now: number, was: number, wasMode: Difficulty | undefined) => now > was || (now === was && now > 0 && mode === 'normal' && wasMode !== 'normal');
  const starsUp = better(run.stars, prevStars, p.starsMode);
  const scoreUp = better(run.score, prevScore, p.scoreMode);
  const timeUp = run.time > 0 && (prevTime === 0 || run.time < prevTime);
  const out: StageBest = {
    completed: true,
    stars: starsUp ? run.stars : prevStars,
    highScore: scoreUp ? run.score : prevScore,
    bestTime: timeUp ? run.time : prevTime,
  };
  const sm = starsUp ? mode : p.starsMode;
  const cm = scoreUp ? mode : p.scoreMode;
  const tm = timeUp ? mode : p.timeMode;
  if (sm) out.starsMode = sm;
  if (cm) out.scoreMode = cm;
  if (tm) out.timeMode = tm;
  return out;
}
