/**
 * predators/registry — the kinds a stage's cast may name, as each plays in a world (ways.ts `inWorld`: a way to beat an animal is
 * only there once its move is taught). One file of rows per world, in world order: the world an animal is first met in holds its
 * row, and a later world that lays it again may hold its own, tuned there. A stage gets the newest row at or before its world, so an
 * animal met earlier plays as it last played, and no stage can name an animal from a world still ahead of it.
 */
import { inWorld } from './ways.ts';
import type { PredatorDef } from './types.ts';
import { WORLD1 } from './world1.ts';
import { WORLD2 } from './world2.ts';
import { WORLD3 } from './world3.ts';
import { WORLD5 } from './world5.ts';
import { WORLD6 } from './world6.ts';
import { WORLD7 } from './world7.ts';
import { WORLD8 } from './world8.ts';

/** every world's own rows, first world first (a world with no animal of its own yet holds none) */
export const BY_WORLD: ReadonlyArray<readonly PredatorDef[]> = [WORLD1, WORLD2, WORLD3, [], WORLD5, WORLD6, WORLD7, WORLD8];

/** the rows of every world after the first, in world order (predatorCasts.test.ts holds each fair) */
export const CASTS_AFTER_1: readonly PredatorDef[] = BY_WORLD.slice(1).flat();

const rowsAt = (world: number, all: ReadonlyArray<readonly PredatorDef[]> = BY_WORLD): ReadonlyArray<readonly PredatorDef[]> => all.slice(0, Math.max(0, world));

/** the row a world plays a kind from, before the move ladder: the newest at or before that world (`all`: the tests' own tables) */
export function castRow(kind: string, world: number, all: ReadonlyArray<readonly PredatorDef[]> = BY_WORLD): PredatorDef | undefined {
  const rows = rowsAt(world, all);
  for (let i = rows.length - 1; i >= 0; i--) {
    const d = rows[i].find((q) => q.kind === kind);
    if (d) return d;
  }
  return undefined;
}

/** the kit's data for a kind in a world, or undefined when the kit has no such animal there (it then plays as it always has) */
export const castDef = (kind: string, world: number): PredatorDef | undefined => {
  const d = castRow(kind, world);
  return d && inWorld(d, world);
};

/** every kind a stage of this world may name */
export const castKinds = (world: number): string[] => [...new Set(rowsAt(world).flat().map((d) => d.kind))];
