/**
 * canvasLost — whether a canvas we baked into has lost its pictures.
 *
 * Chrome on a phone can take a canvas's memory back when the graphics chip runs short (a 2D canvas "context loss"): the canvas stays, but
 * what was drawn into it is gone, and drawing from it draws nothing. Every picture we bake once and stamp each frame (the creatures'
 * clips, the shrunk sheets, the ground squares, the fitted skies) checks this before it is used and is baked again if it is lost.
 * (Matt's Pixel, 2026-10-30: the creatures went missing when a stage readied every sheet at once under its title card.)
 */
import { perfNote } from './perfLog.ts';

type Ctx2D = CanvasRenderingContext2D & { isContextLost?: () => boolean };

let lost = 0;

/** true when `cv`'s pictures are gone (a 2D context loss); notes each one for the control test's log */
export function canvasLost(cv: HTMLCanvasElement | null | undefined, what: string): boolean {
  if (!cv || !cv.width) return false;
  const g = cv.getContext('2d') as Ctx2D | null;
  if (!g || typeof g.isContextLost !== 'function' || !g.isContextLost()) return false;
  lost++;
  perfNote(`canvas lost: ${what} ${cv.width}x${cv.height} (${lost} so far)`);
  return true;
}
