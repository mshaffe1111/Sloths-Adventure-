/** The painted pictures of the keepsakes (and the scroll), cut from the item sheet and kept in src/assets/items as <name>.webp. */
const files = import.meta.glob('../assets/items/*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

const byName: Record<string, string> = {};
for (const [path, url] of Object.entries(files)) {
  const m = /\/([^/]+)\.webp$/.exec(path);
  if (m) byName[m[1]] = url;
}

/** the picture for an item (a keepsake icon name, or 'scroll' / 'token'), or null when there is none */
export function itemUrl(name: string): string | null {
  return byName[name] ?? null;
}
