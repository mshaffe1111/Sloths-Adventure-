/** The drawn fallback for a medal (until the painted medal sheet loads): its `icon` name in game/badges.ts is an icon from the set. */
import { ICON_NAMES, type IconName } from './index.tsx';

/** the icon for a badge's `icon` field; a name the set does not know gets a star */
export function badgeIconName(icon: string): IconName {
  return (ICON_NAMES as string[]).includes(icon) ? (icon as IconName) : 'star';
}
