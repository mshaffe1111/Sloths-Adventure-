/**
 * The guardians as the story shows them (2026-10-30 cutscene audit: their game frames were drawn up to 4.2 screen px per painted px in
 * the boss scenes and read soft): each frame a story uses, repainted at HD_GUARD times the game atlas (tools/art/storyart make_spec
 * round6), on story pages (storyHd.ts set 'guard', storyHdData_guard.ts). A story warms them; paintedBoss.ts still() draws a frame from
 * them when they have loaded, in the same box as the game frame, so nothing else moves.
 */
import { hdLoaded, warmHd, type HdSet } from './storyHd.ts';
import { HD_GUARD, HD_GUARD_FRAMES, HD_GUARD_PAGES } from './storyHdData_guard.ts';

const SET: HdSet = { hd: HD_GUARD, pages: HD_GUARD_PAGES, frames: HD_GUARD_FRAMES };

/** start loading the guardians' story pages (a story is opening) */
export function warmStoryGuardians() {
  warmHd('guard', SET);
}

/** the story painting of a guardian's frame, if its page has loaded: the image and its source rect (the game frame's rect, times HD) */
export function guardianFrame(param: string, name: string): { img: HTMLImageElement; x: number; y: number; w: number; h: number } | null {
  const f = HD_GUARD_FRAMES[`${param}.${name}`];
  if (!f) return null;
  const img = hdLoaded('guard', f);
  if (!img) return null;
  return { img, x: f.x + f.m, y: f.y + f.m, w: f.w - 2 * f.m, h: f.h - 2 * f.m };
}
