/** Who wears what next to their name in a story or a wayside line: a painted portrait where the game has one, otherwise an icon. */
import type { IconName } from './index.tsx';
import { crestForSpeaker, type CrestKey } from './crests.ts';

export type SpeakerMarkSpec =
  | { kind: 'crest'; key: CrestKey }
  | { kind: 'pokey' }
  | { kind: 'icon'; icon: IconName };

const ICONS: Record<string, IconName> = {
  Narrator: 'book',
  Grandma: 'leaf',
  Officer: 'medal',
  Grandfather: 'shield',
  Petal: 'flower',
};

export function speakerMark(name: string): SpeakerMarkSpec {
  if (name === 'Pokey') return { kind: 'pokey' };
  const key = crestForSpeaker(name);
  if (key !== undefined) return { kind: 'crest', key };
  return { kind: 'icon', icon: ICONS[name] ?? 'swords' };
}
