/**
 * The draw watch (the measured release, testers only, 2026-11-04): which single canvas call makes a long draw frame.
 *
 * The OnePlus (Adreno 619, 4 GB) on 0.9.4 had draw spikes of 150-460 ms every 5-10 s (stall lines `js u1-5 d150-463`) with no sheet
 * load before them. A stall line says the draw took the time, not what in it. This times every 2D canvas call that can be that slow
 * (drawImage, the first draw of a fresh canvas being an upload; fill and stroke of big paths; reading or writing pixels; patterns) and
 * logs any single call over SLOW_MS as a `slowdraw` event: the call, what it drew and its size, and the canvas it drew on.
 *
 * Only where the measurement switch is on (gpuLayer.ts gpuBackdropOn: a QA build or the testers' link #ctest), never for a player and
 * never in the store app. It goes with the switch: deleted the same day (GPU-RENDERER-PLAN.md, "The measured release").
 */
import { gpuBackdropOn } from './gpuLayer.ts';
import { recorder } from './playRecorder.ts';

/** one call slower than this is logged */
export const SLOW_MS = 30;
const WATCHED = ['drawImage', 'fill', 'stroke', 'fillRect', 'getImageData', 'putImageData', 'createPattern', 'fillText'] as const;

let installed = false;

/** a short name for what a call drew: a picture's file, or a canvas's size (a baked canvas has no name) */
export function sourceName(src: unknown): string {
  if (!src || typeof src !== 'object') return '';
  const o = src as { src?: string; width?: number; height?: number; tagName?: string; isConnected?: boolean };
  if (typeof o.src === 'string' && o.src) return o.src.split('/').pop()!.split('?')[0];
  const kind = o.tagName === 'CANVAS' ? (o.isConnected ? 'screen canvas' : 'canvas') : o.tagName === 'VIDEO' ? 'video' : 'bitmap';
  return `${kind} ${o.width ?? '?'}x${o.height ?? '?'}`;
}

/** the line for one slow call: `<ms>ms <call> <what> <w>x<h> on <target>` (what and its size for drawImage, the area for the rest) */
export function slowLine(ms: number, call: string, args: readonly unknown[], target: { width: number; height: number; isConnected?: boolean }): string {
  let what = '';
  if (call === 'drawImage') {
    const n = args.length;
    const dw = n >= 9 ? args[7] : n >= 5 ? args[3] : (args[0] as { width?: number })?.width;
    const dh = n >= 9 ? args[8] : n >= 5 ? args[4] : (args[0] as { height?: number })?.height;
    what = ` ${sourceName(args[0])} -> ${Math.round(Number(dw) || 0)}x${Math.round(Number(dh) || 0)}`;
  } else if (call === 'fillRect' || call === 'getImageData') {
    what = ` ${Math.round(Number(args[2]) || 0)}x${Math.round(Number(args[3]) || 0)}`;
  } else if (call === 'putImageData') {
    const d = args[0] as { width?: number; height?: number };
    what = ` ${d?.width ?? '?'}x${d?.height ?? '?'}`;
  } else if (call === 'createPattern') {
    what = ` ${sourceName(args[0])}`;
  }
  const on = `${target.isConnected ? 'screen' : 'canvas'} ${target.width}x${target.height}`;
  return `${Math.round(ms)}ms ${call}${what} on ${on}`;
}

/** start the watch (once); a player never gets it (the measurement switch) */
export function installDrawWatch(): boolean {
  if (installed || !gpuBackdropOn()) return false;
  if (typeof CanvasRenderingContext2D === 'undefined' || typeof performance === 'undefined') return false;
  installed = true;
  const proto = CanvasRenderingContext2D.prototype as unknown as Record<string, (...a: unknown[]) => unknown>;
  for (const call of WATCHED) {
    const orig = proto[call];
    if (typeof orig !== 'function') continue;
    proto[call] = function (this: CanvasRenderingContext2D, ...args: unknown[]) {
      const t0 = performance.now();
      const r = orig.apply(this, args);
      const ms = performance.now() - t0;
      if (ms >= SLOW_MS && recorder.on) {
        try {
          recorder.glitch('slowdraw', slowLine(ms, call, args, this.canvas));
        } catch {
          /* a line we cannot make: the call itself already ran */
        }
      }
      return r;
    };
  }
  return true;
}
