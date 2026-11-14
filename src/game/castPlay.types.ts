/**
 * castPlay.types — what a stage carries when its brief names a cast (reference/design/PREDATORS.md; GAME-MAP B2, drop traps). Data
 * only: a built stage holds it at `proto.cast`, and the engine runs it (castPlay.ts). A stage with no `proto.cast` plays as it always
 * has (predatorAI.ts).
 */
import type { LurePost } from './predators/lure.ts';

/**
 * One drop trap as a stage lays it: a load (a hive, a stone) hung over an animal's ground, and the handle that lets it go (a vine he
 * shakes, a tendril he cuts: either is a blow on the handle). The load never hurts him.
 */
export interface TrapPost {
  id: number;
  /** the handle: 'vine' hangs from above and is shaken; 'tendril' is tied off at his height and is cut; 'limb': no handle, the load IS a
   *  creaky limb (gen2/creak.ts) and it goes when the limb gives way under him (he rides it down: 1-5.md beat 7, 1-4.md #7) */
  kind: 'vine' | 'tendril' | 'limb';
  load: 'hive' | 'stone' | 'limb';
  /** a 'limb' trap: the creaky limb's platform id, and its width (the load's span: it must come down BESIDE an animal, never on one) */
  limb?: number;
  w?: number;
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
  /** the stage's lure targets (predators/lure.ts; gen2/lureLay.ts lays them): fixed things an animal of the cast fears */
  lures?: LurePost[];
  /** his hard landings are heard in this stage (a stage that teaches quiet feet says so, whatever its world); absent: by the move
   *  ladder (roster.ts TAUGHT.landing) */
  landing?: boolean;
}
