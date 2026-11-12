/**
 * predators/registry — the kinds a stage's cast may name, as each plays in a world (ways.ts `inWorld`, over roster.ts's casts: a way to beat an animal is
 * only there once its move is taught). World 1's three today; a world adds its own when it is laid (casts.ts holds the first drafts,
 * kept out of here so the game does not carry animals no stage can name yet).
 */
import { inWorld } from './ways.ts';
import type { PredatorDef } from './types.ts';
import { WORLD1 } from './world1.ts';

const BY_KIND = new Map<string, PredatorDef>(WORLD1.map((d) => [d.kind, d]));

/** the kit's data for a kind in a world, or undefined when the kit has no such animal (it then plays as it always has) */
export const castDef = (kind: string, world: number): PredatorDef | undefined => {
  const d = BY_KIND.get(kind);
  return d && inWorld(d, world);
};
