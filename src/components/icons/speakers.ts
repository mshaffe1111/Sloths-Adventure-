/** Who wears what next to their name in a story or a wayside line: a painted portrait where the game has one, otherwise an icon. */
import type { IconName } from './index.tsx';
import { crestForSpeaker, type CrestKey } from './crests.ts';

export type SpeakerMarkSpec =
  | { kind: 'crest'; key: CrestKey }
  | { kind: 'pokey' }
  | { kind: 'dot' }
  | { kind: 'head' }
  | { kind: 'icon'; icon: IconName };

const ICONS: Record<string, IconName> = {
  Narrator: 'book',
  Petal: 'flower',
  Squirrel: 'paw',
  Flicker: 'sparkle',
  Soldier: 'shield',
};

/** the speakers painted on the story sheets: their face sits beside the name (CelHead.tsx) */
export const HEAD_SPEAKERS = new Set(['Grandma', 'Lieutenant Pell', 'Grandfather', 'Gruntlewick']);

export function speakerMark(name: string): SpeakerMarkSpec {
  if (HEAD_SPEAKERS.has(name)) return { kind: 'head' };
  if (name === 'Pokey') return { kind: 'pokey' };
  if (name === 'Dot') return { kind: 'dot' };
  const key = crestForSpeaker(name);
  if (key !== undefined) return { kind: 'crest', key };
  return { kind: 'icon', icon: ICONS[name] ?? 'swords' };
}
