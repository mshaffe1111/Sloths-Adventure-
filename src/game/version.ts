/**
 * When the game was last updated. The build stamps the time of the latest commit into `__BUILD_TIME__` (see vite.config.ts), so the
 * start screen can show which version a device is running. Empty when it was not stamped (tests, an odd build).
 */
declare const __BUILD_TIME__: string;

export const BUILD_TIME: string = typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : '';

/** "Oct 19, 2026, 7:23 PM" in the viewer's own time zone; '' for a missing or unreadable stamp */
export function formatBuildTime(iso: string, locale?: string): string {
  const d = new Date(iso);
  if (!iso || Number.isNaN(d.getTime())) return '';
  return d.toLocaleString(locale, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}
