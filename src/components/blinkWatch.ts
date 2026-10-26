import { useEffect } from 'react';
import { recorder } from '../game/playRecorder.ts';

/**
 * The control test: a HUD piece or overlay notes each time it is shown (`shown` is what it shows: a key, a line's number, or null while
 * nothing is up). Shown more than 4 times in 2 s is logged as a 'blink' (tools/playtesters/LOG_EVENTS.md). Costs nothing otherwise.
 */
export function useBlinkWatch(name: string, shown: string | number | null | undefined | false) {
  useEffect(() => {
    if (shown !== null && shown !== undefined && shown !== false) recorder.shown(name);
  }, [name, shown]);
}
