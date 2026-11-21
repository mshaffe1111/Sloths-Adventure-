/**
 * The POST (2-7's doors, reference/design/2-7.md NEW 2): a PLEASE BE PATIENT door on the way out takes a letter as he passes its slot,
 * and is then drawn OPEN; on the way home each river's step holds a reply. Both are the stage's petals (counted collectibles, type
 * 'flower') in letter art (Collectible.mark 'letter' | 'reply'). A slot sits ON his path: at the height of the engine's own pick-up
 * reach about his middle (engine.ts: 34 px about his feet less 20), straight over the ground he walks, never a step off it (D8).
 * gen2/postLay.ts lays it; pieces/postPiece.ts opens and draws the doors; postDraw.ts draws the letters by inventory id.
 * Pure data and arithmetic. No stage id, world number, seed or x.
 */
import type { Collectible, Platform } from './types.ts';

/** the engine's pick-up reach (px, engine.ts collectibles: a petal is taken within 34 px of his feet less 20) */
export const PICK = { reach: 34, up: 20 } as const;

/** a laid door: where it stands (its foot on the ground at `y`, centred on `x`) and the id of the letter its slot takes */
export interface PostDoor { x: number; y: number; letter: number }

/** a stage's post (GeneratedStage.post) */
export interface Post {
  doors: PostDoor[];
  /** its art by inventory id: the door shut, the door open, a letter's two frames, a reply's two frames */
  art: PostArt;
}
export interface PostArt { door: string; open: string; letter: readonly string[]; reply: readonly string[] }

/** a brief's post (GraphBrief.post): how many doors the way out has, and the art */
export interface PostSpec { doors: number; art: PostArt }

/** is he taking the letter at (x, y): the engine's reach, at his middle */
export const inReach = (px: number, py: number, x: number, y: number): boolean => Math.hypot(px - x, py - PICK.up - y) < PICK.reach;

/** what is wrong with a stage's slots, by name: a slot's letter missing, or a slot no ground under it carries his middle through */
export function postFaults(post: Post, collectibles: readonly Collectible[], platforms: readonly Platform[]): string[] {
  const out: string[] = [];
  for (const d of post.doors) {
    const c = collectibles.find((q) => q.id === d.letter);
    if (!c || c.mark !== 'letter') { out.push(`post: the door at x ${Math.round(d.x)} has no letter in its slot`); continue; }
    // (his feet on a top under the slot, inside its ends: the slot within his reach as he walks over it)
    const floor = platforms.some((q) => (q.type === 'solid' || q.type === 'bouncy') && !q.broken && c.x >= q.x + 8 && c.x <= q.x + q.width - 8 && inReach(c.x, q.y, c.x, c.y));
    if (!floor) out.push(`post: the slot at x ${Math.round(c.x)}, y ${Math.round(c.y)} is off his path: no ground under it carries his middle through its reach`);
  }
  return out;
}
