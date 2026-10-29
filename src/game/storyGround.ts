/**
 * The painted ground the figures stand on in a story picture over a world's own backdrop (the plates carry their own floor): one strip
 * per world, src/assets/story/ground/w<N>.webp, painted on Hugging Face from the old code-drawn branch (tools/art/storyart). `line` is
 * where the feet go, as a share of the strip's height; the strip is laid along the ground line and repeated (every other copy turned
 * over, so the joins match) as far as the camera travels.
 */
// (under the test runner there is no bundler and so no glob: the call throws and there are no pictures, as paintedBackdrops.ts)
let files: Record<string, string> = {};
try {
  files = import.meta.glob('../assets/story/ground/*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
} catch {
  files = {};
}

/** the walk line on each world's strip (share of its height) */
export const GROUND_LINE: Record<number, number> = { 1: 0.402, 2: 0.402, 3: 0.412, 4: 0.479, 5: 0.607, 6: 0.402, 7: 0.402, 8: 0.598, 9: 0.404, 10: 0.457 };

const imgs = new Map<number, HTMLImageElement>();
export function groundUrl(world: number): string | null {
  return files[`../assets/story/ground/w${world}.webp`] ?? null;
}
/** the loaded strip of a world, or null while it is on its way */
export function groundImage(world: number): HTMLImageElement | null {
  let im = imgs.get(world);
  if (!im) {
    const url = groundUrl(world);
    if (!url || typeof Image === 'undefined') return null;
    im = new Image();
    im.src = url;
    imgs.set(world, im);
  }
  return im.complete && im.naturalWidth > 0 ? im : null;
}
