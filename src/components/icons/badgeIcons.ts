/** How a badge is drawn: its `icon` name in game/badges.ts is an icon from the set (a guardian badge shows the guardian's crest). */
import { ICON_NAMES, type IconName } from './index.tsx';

/** the icon for a badge's `icon` field; a name the set does not know gets a star */
export function badgeIconName(icon: string): IconName {
  return (ICON_NAMES as string[]).includes(icon) ? (icon as IconName) : 'star';
}

/** the world of a guardian badge ("guardian_4" -> 4), or undefined for any other badge */
export function guardianWorld(badgeId: string): number | undefined {
  const m = /^guardian_(\d{1,2})$/.exec(badgeId);
  return m ? Number(m[1]) : undefined;
}
