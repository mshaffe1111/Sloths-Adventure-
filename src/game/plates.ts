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
/** plates kept decoded at once (a repainted plate is 2560 x 2720, about 28 MB decoded: the one showing and the next) */
const KEEP = 2;

/** the loaded picture for a plate, or null while it is still on its way */
export function plateImage(key: string): HTMLImageElement | null {
  let im = imgs.get(key);
  if (im) {
    // most recently used goes to the end, so the oldest is the one let go
    imgs.delete(key);
    imgs.set(key, im);
  } else {
    const url = plateUrl(key);
    if (!url || typeof Image === 'undefined') return null;
    im = new Image();
    im.src = url;
    imgs.set(key, im);
    for (const k of imgs.keys()) {
      if (imgs.size <= KEEP) break;
      imgs.delete(k);
    }
  }
  return im.complete && im.naturalWidth > 0 ? im : null;
}

/** let go of every plate (a story has closed) */
export function releasePlates() {
  imgs.clear();
}

/** start loading the plates a cutscene will show, so the first one is not late */
export function preloadPlates(keys: Array<string | undefined>) {
  for (const k of keys) if (k) plateImage(k);
}
