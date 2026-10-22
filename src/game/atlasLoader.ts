import { perfNote } from './perfLog.ts';

/**
 * Loads a painted sprite atlas. The picture is decoded before the sprite counts as ready, so the first draw
 * never stalls on a big decode, and a failed fetch is retried a few seconds later instead of leaving the
 * creature as vector art for the whole session.
 */
export function trackAtlas(img: HTMLImageElement, url: string, onReady: () => void, onFail: () => void): void {
  const t0 = typeof performance !== 'undefined' ? performance.now() : 0;
  const ready = () => {
    perfNote(`sheet ready: ${url.split('/').pop()} (${Math.round(performance.now() - t0)} ms to load and decode)`);
    onReady();
  };
  img.onload = () => {
    if (typeof img.decode === 'function') img.decode().then(ready, ready);
    else ready();
  };
  img.onerror = () => {
    setTimeout(onFail, 4000);
  };
  img.src = url;
}
