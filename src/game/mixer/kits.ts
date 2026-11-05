/**
 * Each world's kit, as data the mixer reads: the sizes its pieces come in, how tall they stand, the steps between landings, the height the
 * way keeps to, the cap on bounce mushrooms, and the looks its art paints. The mixer holds no world's numbers of its own: a world it builds
 * has a row here (World 1's from the shipped stages and CP2's measured sizes, 11-05). A world without a row is refused.
 */
export interface WorldKit {
  world: number;
  /** each piece kind's widths by size band (short under 150 px, medium 150-300, long over 300), inside the shipped p10-p90
   *  (cp2/library.txt) and CP2's proven sizes */
  bands: Record<string, Array<[number, number]>>;
  /** a piece kind's height where it is not the platform default (a bank of earth, a stone, a log; `stumpLog`, a log laid on a stump) */
  heights: Record<string, number>;
  /** a landing steps up or down by one of these (px; the designer's (c): at least 4 of 5 landings do) */
  steps: number[];
  /** the band the way keeps to, top and bottom (px) */
  limit: { yMin: number; yMax: number };
  /** the most bounce mushrooms a stage lays (World 1: the old 1-1's, median over its 16 layouts, cp1-old.json) */
  mushroomCap: number;
  /** the platform styles its kit paints (anything else falls back to terrain's code-drawn island: a build that lays one throws) */
  styles: string[];
  /** the world's creek, where a stage has water (the profile's `water`): how far under a bank's top the drawn surface lies, how far each
   *  water piece's top stands over that surface (a lily pad floats on it; a log or a reed isle rises out of it), and how far the drawn
   *  water reaches in under each bank, so its edge is hidden by the bank's face. No row: the world lays no water idea */
  water?: { depth: number; top: Record<string, number>; inset: number };
}

export const KITS: Record<number, WorldKit> = {
  1: {
    world: 1,
    // (short stones stop at 120 px: Easy's own pass widens a ledge by its jump, and a 140 px stone came out medium, easyMode.ts)
    bands: {
      bank: [[110, 148], [160, 290], [310, 360]], stone: [[60, 120], [160, 233]], log: [[180, 290], [310, 420]], branch: [[110, 148], [160, 290]],
      bridge: [[112, 148], [160, 300]], creaky: [[110, 148], [150, 170]], crumble: [[110, 110]], lily: [[82, 102]], reed: [[150, 190]],
    },
    // (a log on a stump is a thin log, 30 px, drawn as a log on its stump: a 90 px one is painted as an earth column (the designer's
    // 12:52 ruling (a), ENGINE-SPEC 3951b0f9f))
    heights: { bank: 120, stone: 50, log: 90, stumpLog: 30 },
    steps: [40, 30, 50, -30, -40, -60],
    limit: { yMin: 300, yMax: 1400 },
    mushroomCap: 14,
    styles: ['moss_stone', 'log', 'branch', 'ruin', 'canopy_bridge'],
    // (a pad's top 8 px over the surface, where the engine draws it on the water (engine.ts lily surface, padsOffWater); a log 30 and a
    // reed isle 40 over it, so no landing sits flat with the one before (FLAT 20); the bank's face 60 px over the water; the water 40 px
    // in under each bank, inside the face's lean (engine.ts ZONE_INSET))
    water: { depth: 60, top: { lily: 8, log: 30, reed: 40 }, inset: 40 },
  },
};

/** a world's kit, or a plain refusal for a world the mixer has no kit for yet */
export function kitFor(world: number): WorldKit {
  const k = KITS[world];
  if (!k) throw new Error(`the mixer has no kit for World ${world} yet (src/game/mixer/kits.ts)`);
  return k;
}
