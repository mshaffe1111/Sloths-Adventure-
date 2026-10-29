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

export function mergeBest(prev: Partial<StageBest> | null | undefined, run: { stars: number; score: number; time: number }, mode: Difficulty): StageBest {
  const p = prev ?? {};
  const prevStars = typeof p.stars === 'number' ? p.stars : 0;
  const prevScore = typeof p.highScore === 'number' ? p.highScore : 0;
  const prevTime = typeof p.bestTime === 'number' && p.bestTime > 0 ? p.bestTime : 0;
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
