import { mustPickMode } from '../game/difficulty.ts';

/** what Start Adventure (or the map) shows next on the title: the how-to, the mode card, or straight on (LV-19) */
export type StartStep = 'howto' | 'pick' | 'go';

export function nextStartStep(s: { hasProgress: boolean; howToSeen: boolean; modeChosen: boolean; /** the map skips the how-to */ toMap?: boolean }): StartStep {
  if (!s.hasProgress && !s.howToSeen && !s.toMap) return 'howto';
  if (mustPickMode(s.hasProgress, s.modeChosen)) return 'pick';
  return 'go';
}
