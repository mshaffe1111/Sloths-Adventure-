/**
 * castPlay.types — what a stage carries when its brief names a cast (reference/design/PREDATORS.md; GAME-MAP B2, drop traps). Data
 * only: a built stage holds it at `proto.cast`, and the engine runs it (castPlay.ts). A stage with no `proto.cast` plays as it always
 * has (predatorAI.ts).
 */

/**
 * One drop trap as a stage lays it: a load (a hive, a stone) hung over an animal's ground, and the handle that lets it go (a vine he
 * shakes, a tendril he cuts: either is a blow on the handle). The load never hurts him.
 */
export interface TrapPost {
  id: number;
  /** the handle: 'vine' hangs from above and is shaken; 'tendril' is tied off at his height and is cut */
  kind: 'vine' | 'tendril';
  load: 'hive' | 'stone';
  /** the handle: where he hits it (x, and the surface he stands on to do it) */
  x: number;
  y: number;
  /** the load: where it hangs, and the surface it comes down on */
  loadX: number;
  loadY: number;
  landY: number;
}

export interface CastData {
  /** the kinds this stage's cast names (predators/registry.ts): an animal of one of these kinds is run by the kit */
  kinds: string[];
  traps: TrapPost[];
  /**
   * Dot's words for the cast's first moments, as the stage's kit carries them (the story keeper's, never the engine's): `trap`, said
   * once, the first time a drop trap sends an animal off; `punch`, once, the first time a punch does. Absent: she says nothing
   */
  said?: { trap?: string; punch?: string };
}
