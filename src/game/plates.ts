/** The plate pictures, loaded as the photographs are: one webp per key in src/assets/story/plates (the list of keys is plateData.ts). */
const files = import.meta.glob('../assets/story/plates/*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

const byKey: Record<string, string> = {};
for (const [path, url] of Object.entries(files)) {
  const m = /\/([^/]+)\.webp$/.exec(path);
  if (m) byKey[m[1]] = url;
}

export function plateUrl(key?: string): string | null {
  return key ? byKey[key] ?? null : null;
}

const imgs = new Map<string, HTMLImageElement>();

/** the loaded picture for a plate, or null while it is still on its way */
export function plateImage(key: string): HTMLImageElement | null {
  let im = imgs.get(key);
  if (!im) {
    const url = plateUrl(key);
    if (!url || typeof Image === 'undefined') return null;
    im = new Image();
    im.src = url;
    imgs.set(key, im);
  }
  return im.complete && im.naturalWidth > 0 ? im : null;
}

/** start loading the plates a cutscene will show, so the first one is not late */
export function preloadPlates(keys: Array<string | undefined>) {
  for (const k of keys) if (k) plateImage(k);
}
