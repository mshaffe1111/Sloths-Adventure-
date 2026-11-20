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

/**
 * A SOUNDING thing as a stage lays it (ENG-NOISE; gen2/soundLay.ts lays it from a prop socket): a fixed thing that makes ITS noise at its
 * place when a blow lands on it (a chime stone, a bell: heroNoise.ts bellNoise, the call that carries), or when the stage fires it
 * (CastPlay.ring). A blow that strikes one makes only that thing's sound, never his punch's (engine.ts strike).
 */
export interface SoundPost {
  /** its middle, and the surface it stands on (the noise is made there, at the cast's own ground height) */
  x: number;
  y: number;
  /** its box over that surface (px): what a blow must reach */
  w: number;
  h: number;
  /** the noise it makes (heroNoise.ts) */
  sound: 'bell';
}

export interface CastData {
  /** the kinds this stage's cast names (predators/registry.ts): an animal of one of these kinds is run by the kit */
  kinds: string[];
  traps: TrapPost[];
  /**
   * Dot's words for the cast's first moments, as the stage's kit carries them (the story keeper's, never the engine's): `trap`, said
   * once, the first time a drop trap sends an animal off; `punch`, once, the first time a punch does; `spared`, once, the first time a
   * sweeper's free pass dives on him and pulls up short (1-7: the eagle saw him move). Absent: she says nothing
   */
  said?: { trap?: string; punch?: string; spared?: string };
  /** the stage's lure targets (predators/lure.ts; gen2/lureLay.ts lays them): fixed things an animal of the cast fears */
  lures?: LurePost[];
  /** the stage's sounding things (gen2/soundLay.ts lays them): struck by a blow, or fired by the stage, each makes its own noise */
  sounds?: SoundPost[];
  /** his hard landings are heard in this stage (a stage that teaches quiet feet says so, whatever its world); absent: by the move
   *  ladder (roster.ts TAUGHT.landing) */
  landing?: boolean;
  /** this stage TEACHES the freeze (its brief's `teaches` holds 'still', the kit's way; pipeline.ts castOf writes it): the stage's FIRST
   *  animal beaten by his stillness is the freeze moment wherever he stands (inside its engage, outside its strike: 1-9's beat 2, where
   *  the boa's post is 140 px from the edge he stops at). Later freezes are the moment only inside the strike's reach. Absent: only
   *  inside the reach, every time (CastStep.froze) */
  teachStill?: boolean;
}
