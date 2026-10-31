/**
 * The goal card's clock (GoalCard.tsx, UI-22): in, hold, shrink into the counter, done. Started once per stage run and never restarted by
 * a change in the card's words (2-3's count arriving from the engine used to restart it after the shrink had begun, leaving the card up
 * for good, deaf to touches). Its phases only go forward. Pure: the timers are handed in, so the tests can run it on a fake clock.
 */
export type CardPhase = 'in' | 'hold' | 'shrink' | 'done';

export interface CardTimers {
  set: (fn: () => void, ms: number) => number;
  clear: (id: number) => void;
}

export interface CardClock {
  /** a touch or a key: sends the card to the counter, once it has been up a moment */
  poke: () => void;
  stop: () => void;
  phase: () => CardPhase;
}

const ORDER: Record<CardPhase, number> = { in: 0, hold: 1, shrink: 2, done: 3 };

export function startGoalCard(o: {
  quick: boolean;
  /** ms from the start to the shrink */
  holdMs: number;
  reducedMotion: boolean;
  timers: CardTimers;
  onPhase: (p: CardPhase) => void;
  /** just before the shrink: the card measures where the counter is */
  onShrink?: () => void;
}): CardClock {
  let phase: CardPhase = 'in';
  let armed = false;
  const ids: number[] = [];
  const go = (p: CardPhase) => {
    if (ORDER[p] <= ORDER[phase]) return;
    phase = p;
    o.onPhase(p);
  };
  const shrink = () => {
    if (ORDER[phase] >= ORDER.shrink) return;
    o.onShrink?.();
    go('shrink');
    ids.push(o.timers.set(() => go('done'), o.reducedMotion ? 200 : 480));
  };
  ids.push(o.timers.set(() => go('hold'), 30));
  ids.push(o.timers.set(shrink, o.holdMs));
  ids.push(o.timers.set(() => (armed = true), o.quick ? 200 : 900));
  return {
    poke: () => {
      if (armed) shrink();
    },
    stop: () => ids.forEach((id) => o.timers.clear(id)),
    phase: () => phase,
  };
}
