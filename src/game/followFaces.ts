/**
 * The HUD's faces on a stage whose little ones follow him home (2-3; the lead's ruling 11-20 7:54 PM ET, built as ENG-23 mocked them:
 * reference/qa-reports/ENG-23/stills/hud-mock-*.webp). Upright the line is often off screen behind him, so the goal plank's slots carry
 * it: slot i is little one i's face, in the order they joined the line. Pure: followFaces.test.ts.
 *   home     gold: it is home (it counts toward the goal)
 *   spooked  grey with an amber '!': the look saw it and it ran back to hide at its stretch's start, until he fetches it
 *   hid      lit: hiding, still, in a reed clump (the look passes it by: follow.ts lineSeen)
 *   open     dim: out in the open, or moving, or paddling (the look would see it)
 */
import { lineInCover, type FollowKind, type Follower, type LineCover } from './follow.ts';

export type FaceState = 'home' | 'spooked' | 'hid' | 'open';
export interface Face {
  kind: FollowKind;
  st: FaceState;
}

/** one little one's face: as the look reads it (lineSeen: in cover and still is hidden) */
export function faceOf(f: Pick<Follower, 'state' | 'x' | 'y' | 'paddle' | 'moved'>, covers: readonly LineCover[]): FaceState {
  if (f.state === 'home') return 'home';
  if (f.state === 'spooked') return 'spooked';
  return lineInCover(covers, f) && !f.moved ? 'hid' : 'open';
}

/** every little one's face, in the line's order */
export function lineFaces(line: readonly Follower[], covers: readonly LineCover[]): Face[] {
  return line.map((f) => ({ kind: f.kind, st: faceOf(f, covers) }));
}

/** a short key for a list of faces (the HUD redraws only when it changes) */
export const facesKey = (fs: readonly Face[] | null | undefined): string => (fs ?? []).map((f) => `${f.kind}:${f.st}`).join(',');
