/**
 * gpuProf — honest per-layer draw times, for hunting slow frames on a real phone (PERFORMANCE-RULES.md §6.2).
 *
 * A canvas only records our calls; the GPU runs them later, so timing `render()` with performance.now() mostly measures whichever
 * call happened to wait for the GPU. Here every layer group ends with a one-pixel read of the main canvas, which makes the browser
 * finish everything drawn so far, so each layer's time includes its GPU work. That costs time itself, so it is only on in the
 * control test with `gpuprof=1` in the address (test link only: the control test never opens in the shipped game), and its lines go
 * into the recording as 'layers' events for QA to read.
 */
import { ctestEnabled } from './playRecorder.ts';

export const LAYERS = ['bg', 'ground', 'decor', 'enemies', 'hero', 'front', 'overlay'] as const;
export type Layer = (typeof LAYERS)[number];

let on: boolean | null = null;
export function gpuProfOn(): boolean {
  if (on !== null) return on;
  try {
    on = ctestEnabled() && /[?&#]gpuprof=1\b/.test(location.search + location.hash);
  } catch {
    on = false;
  }
  return on;
}

const ms = new Map<Layer, number>();
const sum = new Map<Layer, number>();
let t = 0;
let frames = 0;
let worst = 0;

const flush = (ctx: CanvasRenderingContext2D) => {
  ctx.getImageData(0, 0, 1, 1);
};

/** the start of a frame's drawing */
export function profBegin(ctx: CanvasRenderingContext2D) {
  if (!gpuProfOn()) return;
  flush(ctx);
  ms.clear();
  t = performance.now();
}

/** the end of one layer group (everything drawn since the last mark counts to it) */
export function profMark(ctx: CanvasRenderingContext2D, layer: Layer) {
  if (!gpuProfOn()) return;
  flush(ctx);
  const n = performance.now();
  ms.set(layer, (ms.get(layer) ?? 0) + n - t);
  t = n;
}

const line = (m: Map<Layer, number>, div = 1) =>
  LAYERS.map((l) => `${l} ${((m.get(l) ?? 0) / div).toFixed(1)}`).join(' ');

/**
 * The end of the frame: a 'slow' line for any frame whose drawing took over 45 ms, and every 90 frames (3 s) an 'avg' line, both
 * with the layer times in ms. `note` is called with the kind and the text (the recorder's event).
 */
export function profEnd(x: number, note: (what: string, detail: string) => void) {
  if (!gpuProfOn()) return;
  let total = 0;
  for (const l of LAYERS) {
    const v = ms.get(l) ?? 0;
    total += v;
    sum.set(l, (sum.get(l) ?? 0) + v);
  }
  worst = Math.max(worst, total);
  if (total > 45) note('layers', `slow ${total.toFixed(0)}ms x${Math.round(x)}: ${line(ms)}`);
  if (++frames >= 90) {
    note('layers', `avg of ${frames} (worst ${worst.toFixed(0)}ms) x${Math.round(x)}: ${line(sum, frames)}`);
    sum.clear();
    frames = 0;
    worst = 0;
  }
}
