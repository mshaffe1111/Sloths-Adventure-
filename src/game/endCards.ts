/**
 * The ending cards (S-7): one painted card a character, shown in a run between the weeks after and the hill, with a line under each.
 * story-art paints them at 1920 x 1080 with everything that matters in the middle 1440 x 880 (src/assets/story/cards/<key>.webp).
 * Loading here (the sizes and lines are endCardsData.ts, so the script and its tests read them without the browser); storyArt.ts draws them.
 */
const files = import.meta.glob('../assets/story/cards/*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

const byKey: Record<string, string> = {};
for (const [path, url] of Object.entries(files)) {
  const m = /\/([^/]+)\.webp$/.exec(path);
  if (m) byKey[m[1]] = url;
}

export { CARD_W, CARD_H, CARD_SAFE_W, CARD_SAFE_H } from './endCardsData.ts';

export function cardUrl(key?: string): string | null {
  return key ? byKey[key] ?? null : null;
}
