/**
 * predators — the behaviour kit (reference/design/PREDATORS.md): every predator is one small state machine read from data.
 *
 * One rhythm for all of them, so a player can learn any animal by its tell:
 *
 *   rest (its habit: walk a beat, sit at a post, sweep)  ->  hunt (it has him, or a noise)  ->  TELL  ->  act  ->  recover  ->  rest
 *
 * Only 'act' can hurt, and 'act' is only ever entered from a tell that ran its full length (core.ts `stepPredator`, one place).
 * Being beaten is data too: each way that works on a kind names how it ends, and it always ends with the animal stunned, fleeing
 * home, dozing off or chased off. Nothing here is eaten, carried off or killed.
 *
 * Built on the one clock (clock.ts), stillness (stillness.ts `watcherSees`) and noise (heroNoise.ts: a predator IS a `Listener`).
 * Pure: no canvas, no engine, no stage ids, no rolls.
 */
import type { ClockRead } from '../clock.ts';
import type { Listener } from '../heroNoise.ts';

/** the one readable habit a kind has (PREDATORS.md §5, in order of reuse) */
export type Habit =
  | 'patrol' // walks its beat; strikes what comes within reach in front of it
  | 'ambush' // sits at its post, facing both ways; strikes far, then is open for a long time
  | 'stalk' // closes in only while he gives it the chance (he moves, or his back is turned); pounces from close
  | 'charge' // sees him from far off, paws the ground, then runs its line to the end and is winded there
  | 'sweep' // its eye (a shadow, a gaze, a beam) crosses its stretch on a beat; it only gets what it sees
  | 'drop' // waits overhead; comes straight down where he was when the tell began, then has to climb back
  | 'guard' // stands in the way and cannot be hit; strikes only what comes within reach
  | 'seek'; // asleep or pacing until it hears something; goes to the noise and looks around

/** every way Pokey has to beat one. No kind is beaten only by the stomp (core.ts `checkPredator`) */
export type Way = 'stomp' | 'punch' | 'kick' | 'trap' | 'lure' | 'still' | 'drum' | 'break' | 'push' | 'light' | 'geyser' | 'wind';

/**
 * How being beaten ends. `stunned`: it sits dazed for `seconds`, then carries on. `flees`: it gives up and goes home for `seconds`.
 * `dozes`: it falls asleep where it is (a noise can wake it again). `chasedOff`: it leaves the stage on its own legs and stays away. `when: 'open'`: the way only works while it is recovering, stunned or asleep
 * (its head is out, its back is turned); otherwise the way works any time.
 */
export type Outcome =
  | { ends: 'stunned'; seconds: number; when?: 'any' | 'open' }
  | { ends: 'flees'; seconds: number; when?: 'any' | 'open' }
  | { ends: 'dozes'; when?: 'any' | 'open' }
  | { ends: 'chasedOff'; when?: 'any' | 'open' };

export interface PredatorDef {
  /** the animal, by the name the game already has for it */
  kind: string;
  habit: Habit;
  /**
   * what it sees: a box round its eye, further ahead than behind. `seesStill`: holding still in the open does not hide him from it.
   * `remembers`: stillness in the open hides him only until it has seen him once (the Drake's gaze)
   */
  sight: { ahead: number; behind: number; tall: number; seesStill?: boolean; remembers?: boolean };
  /**
   * the noise lure: it goes to a noise it hears and looks around there this long (s), noticing nobody. Absent: a noise only wakes it
   */
  hears?: number;
  /** asleep, it wakes when he MOVES within this far of it (px). Absent: only a noise wakes it. A still sloth never wakes anything */
  wakeAt?: number;
  /** a sweeper: seconds its eye shows at the end of its stretch before it starts across (the screech, the shadow at the edge) */
  warn?: number;
  /** px/s at rest (its beat, or its eye for a sweeper) and on the hunt. Hunt 0: it never comes after him */
  speed: { rest: number; hunt: number };
  /** it gives ground at this speed while he is in sight and out of reach (the shy snake), until it has nowhere left to go */
  shy?: number;
  /** a stalker's speed as a fraction while he is facing it (0: it freezes when looked at). Absent: it does not care */
  watched?: number;
  /** it starts its tell from this far (px) */
  engage: number;
  /** the tell, seconds on Normal: what the player sees and hears before it can hurt. Never under TELL_MIN */
  tell: number;
  /** a tell he can call off: if it no longer sees him when the tell ends, it does not act */
  callsOff?: boolean;
  /**
   * keeps a stage clock: its tell starts only on the clock's 'warn' and its act only on the clock's 'on' (a sweeper: its pass is
   * called on the 'warn' and its eye starts across on the 'on')
   */
  onBeat?: boolean;
  /**
   * the act. `aim`: 'ahead' runs or strikes along the ground the way it faces; 'below' comes straight down to where he was when the
   * tell began (move on and it misses); 'him' follows him (a sweeper's dive: only hiding before the tell ends stops it). `speed` px/s for `seconds` at most; `reach` x `tall`: the box in front of it (or round it, in the air)
   * that hurts while it acts
   */
  act: { aim: 'ahead' | 'below' | 'him'; seconds: number; speed: number; reach: number; tall: number };
  /** seconds it is open after acting, and seconds before it may tell again */
  recover: number;
  cool: number;
  /** seconds on the hunt without seeing him before it gives up (a sweeper: passes that found nobody) */
  giveUp: number;
  /** it stands in the way: he cannot walk through it while it is up */
  blocks?: boolean;
  /** Easy, as multiples of Normal: the tell and the cool never shorter (>= 1), the speeds never faster (<= 1) */
  easy: { tell: number; cool: number; speed: number };
  /** every way that works, and how each ends */
  beatenBy: Partial<Record<Way, Outcome>>;
  /** the way its world teaches first */
  first: Way;
  /** kinds it runs from (the food chain): one of them awake and near chases it off by its 'lure' outcome */
  fears?: readonly string[];
}

/** where a stage puts one (the stage's data, never the kit's) */
export interface Post {
  x: number;
  y: number;
  /** the ends of its ground or its stretch */
  minX: number;
  maxX: number;
  facing?: 1 | -1;
  asleep?: boolean;
  /** left out on Easy (Easy has fewer) */
  normalOnly?: boolean;
}

export type Phase = 'rest' | 'hunt' | 'tell' | 'act' | 'recover' | 'stunned' | 'flee' | 'gone';

/** one predator in a running stage. It is a heroNoise `Listener`: a noise wakes it and the drum stuns it by the same rule as everything else */
export interface PredatorState extends Listener {
  phase: Phase;
  /** seconds in the phase */
  t: number;
  facing: 1 | -1;
  homeX: number;
  homeY: number;
  minX: number;
  maxX: number;
  /** a sweeper's eye (its shadow, its gaze): where it looks from. Everything else looks from its body */
  eyeX: number;
  /** where the act is going: set when the tell begins and not changed after, so a dodge is a dodge (but an act that aims 'him' follows him) */
  aimX: number;
  aimY: number;
  /** where it is heading on the hunt: him, or a noise */
  goalX: number;
  /** it is following a noise, not him, and has looked at the spot for `look` seconds */
  drawn: boolean;
  look: number;
  /** it has seen him once (a kind that `remembers`) */
  knows: boolean;
  /** chased off: it is on its way out of the stage */
  leaving: boolean;
  /** seconds hunting without seeing him; a sweeper: passes that found nobody */
  lost: number;
  /** seconds before it may tell again */
  cool: number;
  /** game time its flight home ends */
  awayUntil: number;
  /** it saw him at some point in this act (a sweeper's pass) */
  saw: boolean;
  /** the last way that beat it, for the art and the sounds */
  beatenBy: Way | null;
}

/** what a predator reads of Pokey on a frame */
export interface Prey {
  x: number;
  y: number;
  facing: 1 | -1;
  /** stillness.ts `isStill` */
  still: boolean;
  /** stillness.ts `inCover` */
  covered: boolean;
}

/** one fixed step of the stage, as a predator sees it */
export interface Scene {
  /** game time (s) and the step */
  t: number;
  dt: number;
  hero: Prey;
  easy: boolean;
  /** the clock an `onBeat` kind keeps */
  beat?: ClockRead;
}

export interface Box { x: number; y: number; w: number; h: number }

/** what happened on a step, for the sounds, the art and the guide */
export interface PredatorEvents {
  /** it just noticed him, or a sweeper's pass was just called (the first, far cue) */
  notice?: boolean;
  /** the tell just began (the cue the player learns) */
  tell?: boolean;
  /** the act just began */
  act?: boolean;
  /** it just lost him and stood down */
  lostHim?: boolean;
  /** it was just beaten this way (stillness is the one way the machine finds by itself) */
  beaten?: Way;
}
