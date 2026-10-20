/** The old photographs in the photo books, cut from the sheets and kept in src/assets/photos as <key>.webp (key = sheet and number, e.g. s1_05). */
const files = import.meta.glob('../assets/photos/*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

const byKey: Record<string, string> = {};
for (const [path, url] of Object.entries(files)) {
  const m = /\/([^/]+)\.webp$/.exec(path);
  if (m) byKey[m[1]] = url;
}

/** the picture for a photo key, or null when it has not been cut yet (the book then shows a faded print) */
export function photoUrl(key?: string): string | null {
  return key ? byKey[key] ?? null : null;
}
