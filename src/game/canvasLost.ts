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

/**
 * The copies that were taken back at some point. A lost 2D canvas is given back by Chrome a moment later ('contextrestored'), but EMPTY:
 * isContextLost() is false again, and drawing from it draws nothing, for good. Asked only "is it lost now?", a check between the two
 * missed it, and that copy drew nothing from then on: Meeca's walk, idle, jump and climb come from a baked copy at Matt's phone's size
 * (her tiptoe and carry frames do not), so on his Pixel she went in and out across the whole of 5-M, 2026-10-31. Every canvas checked here
 * is watched, so a loss is remembered even when it is over by the next check.
 */
const watched = new WeakSet<object>();
const blanked = new WeakSet<object>();
function watch(cv: HTMLCanvasElement) {
  if (watched.has(cv) || typeof cv.addEventListener !== 'function') return;
  watched.add(cv);
  const gone = () => blanked.add(cv);
  cv.addEventListener('contextlost', gone);
  cv.addEventListener('contextrestored', gone);
}

/** true when `cv`'s pictures are gone (a 2D context loss, now or since it was last baked); notes each one for the control test's log */
export function canvasLost(cv: HTMLCanvasElement | null | undefined, what: string): boolean {
  if (!cv || !cv.width) return false;
  watch(cv);
  const g = cv.getContext('2d') as Ctx2D | null;
  const now = !!g && typeof g.isContextLost === 'function' && g.isContextLost();
  if (!now && !blanked.has(cv)) return false;
  // (once said, the caller lets the copy go or bakes it again: a canvas baked again has its pictures back)
  blanked.delete(cv);
  lost++;
  perfNote(`canvas lost: ${what} ${cv.width}x${cv.height} (${lost} so far)${now ? '' : ' (given back empty)'}`);
  return true;
}
