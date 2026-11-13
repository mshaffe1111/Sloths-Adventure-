/**
 * Build-ahead's timing (stageGenerator.ts buildAhead): while the world map's 1-1 card or the testers' questions are up, the next play's
 * seed is drawn and its stage built at idle (requestIdleCallback, a timer where there is none), on the setting it will be played on, so
 * Play opens on a ready stage. Nothing is built twice for the same seed and setting
 */
import type { LevelConfig } from './types.ts';
import { difficulty } from './difficulty.ts';
import { aheadKeys, buildAhead } from './stageGenerator.ts';
import { peekPlay11 } from './testlink1_1.ts';
import { loadSeedList } from './gen2/seedList.ts';

type Idle = (cb: () => void, o?: { timeout: number }) => number;
let pending = 0;
/** the latest call's number: a list that arrives after a newer call (or none) schedules nothing */
let asked = 0;
export function scheduleAhead(config: LevelConfig): void {
  if (config.id !== '1-1' || config.secret || typeof window === 'undefined') return;
  const mine = ++asked;
  // (the stage's proven list first: its own file, R-165.112. In memory already, this is the same tick's work as before; a failed load
  // builds nothing ahead, and Play builds the stand-in as it would any stage)
  void loadSeedList(config.id).then((ok) => {
    if (!ok || mine !== asked) return;
    const w = window as unknown as { requestIdleCallback?: Idle; cancelIdleCallback?: (n: number) => void };
    if (pending) (w.cancelIdleCallback ?? clearTimeout)(pending);
    const run = () => {
      pending = 0;
      try {
        const seed = peekPlay11();
        if (seed !== null) buildAhead(config, seed, difficulty());
      } catch {
        /* a failed build-ahead leaves Play to build as before */
      }
    };
    pending = w.requestIdleCallback ? w.requestIdleCallback(run, { timeout: 1500 }) : window.setTimeout(run, 300);
  });
}

// (dev only: what is built ahead, for the stage-start measure, tools/perf: startms)
if (import.meta.env?.DEV && typeof window !== 'undefined') (window as unknown as { __ahead?: () => string[] }).__ahead = aheadKeys;
