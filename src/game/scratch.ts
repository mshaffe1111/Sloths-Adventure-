/**
 * scratch — one reusable offscreen canvas for baking. Painting each backdrop tree into its own freshly allocated
 * canvas dominated load time; reusing one buffer (cleared per use) removes the allocation and the memory churn.
 */
let cv: HTMLCanvasElement | null = null;
let cx: CanvasRenderingContext2D | null = null;

export function getScratch(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  if (!cv || !cx || cv.width < w || cv.height < h) {
    cv = document.createElement('canvas');
    cv.width = Math.max(w, cv?.width ?? 0, 1);
    cv.height = Math.max(h, 1);
    cx = cv.getContext('2d', { willReadFrequently: false })!;
  }
  cx!.setTransform(1, 0, 0, 1, 0, 0);
  cx!.globalCompositeOperation = 'source-over';
  cx!.globalAlpha = 1;
  cx!.clearRect(0, 0, w, h);
  return [cv, cx!];
}

export function disposeScratch() {
  cv = null;
  cx = null;
}
