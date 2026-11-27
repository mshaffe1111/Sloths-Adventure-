/**
 * What a world's pit painter lays under a fall the stage left open (ENG-W2FALL): ONE definition, read by the world's finish that lays it and
 * by the verdicts judged before that finish runs (pipeline.ts dropsOf, promises11.ts floorlessGaps through the drops), so the judges read
 * what the player will see. A world declares its painter on its manifest (WorldManifest.pitPainter), never by a world number.
 *   - 'w1Pits': World 1's (w1Pits.ts paints a soft pit's floor, a marked fall as a drop, a hollow's hurt floor): it lays no river.
 *   - 'splashRivers': every soft fall becomes a SPLASH-BACK river (set back on the bank he left, drawn as the shallow backwater, riverArt.ts
 *     RIVER_LOOK.safe), every water fall a deep river (a life). World 2's finish (worlds/w2.ts w2Finish) lays them.
 */
import type { PitKind } from './types.ts';

export type PitPainter = 'w1Pits' | 'splashRivers';
export type FallPaint = 'safe-river' | 'deep-river';

export const FALL_PAINT: Readonly<Record<PitPainter, Readonly<Partial<Record<PitKind, FallPaint>>>>> = {
  w1Pits: {},
  splashRivers: { soft: 'safe-river', water: 'deep-river' },
};

/** what the world's painter lays under an open fall of this kind (undefined: no river) */
export function paintsUnder(m: { pitPainter?: PitPainter }, kind: string): FallPaint | undefined {
  return m.pitPainter ? FALL_PAINT[m.pitPainter][kind as PitKind] : undefined;
}
