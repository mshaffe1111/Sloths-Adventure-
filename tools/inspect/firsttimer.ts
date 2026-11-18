/**
 * The first-timer bot: a new player on a phone, played in the REAL engine (src/game/realPlay.ts runs engine.ts one 30 fps frame at a
 * time), on Easy and on Normal, for the pre-QA pass (Matt, 2026-10-28: "before we turn it over to the QA-ers, we're doing a first pass").
 * The route bots (jumps.ts) prove a stage can be finished by a good thumb; this one plays the way someone who has never seen the stage
 * does, and reports what such a player runs into first.
 *
 * How he plays:
 *   - He goes the way the stage leads (along the inspector's main route, route.ts: right on a run, up on a climb) and holds that way.
 *   - When he is stopped (a step, a wall) or comes to an edge, he tries a plain jump: a short flick up (the thumb is down 0.06-0.25 s,
 *     so the jump is often cut short), sometimes a little early or late at an edge, and now and then the flick goes straight up and the
 *     steer lets go for a moment. Never a run-up and never the full held jump; he never backs up to try again from further away.
 *   - He double jumps only at a spot where a single jump has already failed him.
 *   - He climbs straight up a trunk he touches when the way goes up (or when he is stopped beside it), lets go of a liana on the swing
 *     forward, and jumps off a rope at its end.
 *   - He does not know puzzles: at a puzzle room's entrance he stands a moment ("stopped at a puzzle", not a failure) and is then put
 *     past it, at the room's way on.
 *   - He knows nothing the stage has not told him: he hides from a watching eagle only once Dot's hide tip has been on screen, punches
 *     only once a tip or lesson has said to, glides only once told. Every reaction to a warning or a tip comes about a second late.
 *   - He picks up whatever lies in his way, and loses hearts and lives for real (respawning at the flag, continuing after a game over).
 *   - Stopped with no forward progress for 20 s (or falling back into the same spot 5 times), he is put a little further along the route
 *     (a "rescue", counted), so the rest of the stage is still played.
 *
 * Dot is followed as the phone shows her: every engine line, lesson and struggle line goes through the game's own guide queue
 * (dotGuide.ts GuideQueue with dotLines.ts engineGuideLine, the moves seen by dotGuideWatch.ts MoveWatch), so "when a tip is on screen"
 * is when the player could read it, not when the engine sent it. Story asides are left out.
 *
 * Nothing here changes the engine: it uses realPlay.ts's harness, puts back the engine's own lessonTick, watchForStuck, updateCamera,
 * loseLife and damagePlayer (the harness stubs them), and sizes the view to a phone held sideways (844 x 390).
 */
import { DT, RealPlay, levelConfig, type Pad } from '../../src/game/realPlay.ts';
import { glanceView, glancing, hurt, touches } from '../../src/game/predators/core.ts';
import { GameEngine } from '../../src/game/engine.ts';
import { frontBehind, type ChaseRun } from '../../src/game/chase.ts';
import { rollRadius } from '../../src/game/rolling.ts';
import type { Rolling } from '../../src/game/pieces/rollingPiece.ts';
import { MODES, along, reached } from '../../src/game/stageModes.ts';
import type { StageMode } from '../../src/game/stageKit.types.ts';
import { setDifficulty } from '../../src/game/difficulty.ts';
import { GuideQueue, type GuideLine, type MoveId, type TopicId } from '../../src/game/dotGuide.ts';
import { DotSay } from '../../src/game/dotSay.ts';
import { dotHelp, movesDone, seenSkills } from '../../src/game/dotGuideHelp.ts';
import { engineGuideLine } from '../../src/game/dotLines.ts';
import { lessonDotLine, type LessonId } from '../../src/game/lessons.ts';
import { MoveWatch, StruggleWatch, inDanger, type StruggleHelp } from '../../src/game/dotGuideWatch.ts';
import { emptyGuideView, type GuideView } from '../../src/game/dotGuideView.ts';
import { findTarget } from '../../src/game/dotGuidePerch.ts';

/** a move tip about one of these is over once none is in view (as DotGuide.tsx has it) */
const GONE_TOPICS = new Set<TopicId>(['trunk', 'vine', 'rope', 'log', 'foe']);
import { driftX, DRIFT_CATCH, lianasOver, LOG_DROP, logClock, type RiverZone } from '../../src/game/river.ts';
import { RIDE } from '../../src/game/ride.ts';
import { padShows } from '../../src/game/pieces/padPiece.ts';
import { PAD_FAIR } from '../../src/game/gen2/rideLay.ts';
import { airStep, canGrabSwing, DOUBLE_RISE, JUMP_RISE, PHYS, SWING, reachJump, reachJumpHeld, TIMED, pressLaunches, vineAmp, vinePeriod } from '../../src/game/physics.ts';
import { MIN_TOUCH_JUMP_HOLD_MS } from '../../src/game/inputEngine.ts';
import { handsAlong } from '../../src/game/pieces/vineSnakePiece.ts';
import { onVine, type SnakeNow } from '../../src/game/vineSnake.ts';
import type { Platform, PlayerState, Vine } from '../../src/game/types.ts';
import { runnerLip, RUNNER } from '../../src/game/runnerLiana.ts';
import { scares } from '../../src/game/dropTrap.ts';
import { engageOf } from '../../src/game/predators/core.ts';
import type { PredatorDef } from '../../src/game/predators/types.ts';
import type { TrapPost } from '../../src/game/castPlay.types.ts';
import { findRoute } from './route.ts';
import { markUp } from './markClimb.ts';
import { FigPush, type FieldView } from './figPush.ts';
/** the objectives whose goal is a count (engine.ts isQuotaType); every other stage's goal is the shrine */
const QUOTA_TYPES = new Set(['harvest', 'purge', 'relic_hunt', 'rescue', 'gauntlet']);
import { buildRoll } from './eraRoll.ts';
import { STAGE_SECONDS } from '../../src/game/protoStage.ts';
import { sampleRoute } from './beats.ts';
import { towerRoutePts } from './towerRoute.ts';
import type { Stage } from './stages.ts';
import { liftStop } from '../../src/game/lift.ts';

/**
 * The bot's clock-read skill (METER-2a, R-165.272; METER-COVERAGE §2a "read a stage clock", board + step-off half). A toy test switches
 * it off to prove the bot needs it (level.md rule 21: clockRide.test.ts goes RED with it off). Always on outside a test.
 */
export const CLOCK_SKILL = { read: true };

/**
 * The bot's pad skills (ENG-22; 2-2.md NEW 5; level.md rule 21, toys first: tools/inspect/padRide.test.ts plants each off -> RED). Read off
 * what a person sees of a pad (pieces/padPiece.ts padShows: down, or its shiver) and of a beat row's breath (the stage clock). Always on
 * outside a test. OUT-AND-BACK (FIX-22): a spur pond's dead-end stone (gen2/rideLay.ts PadRow.spur) is on his way, out for its flower and
 * back to the near bank before the way on (route.ts findRoute `spurs`); on the stone WAIT-FOR-THE-RISE holds him till the pads he sank
 * are up (padRide.test.ts 'the spur').
 */
export const PAD_SKILL = { keepHopping: true, waitRise: true, breath: true, outBack: true };

// a phone: the lessons and tips say "slide" and "flick", not keys (lessons.ts lessonInputMode reads pointer: coarse)
{
  const w = (globalThis as Record<string, any>).window;
  if (w) w.matchMedia = (q: string) => ({ matches: /coarse/.test(q), addEventListener() {}, removeEventListener() {} });
}

// ───────────────────────────── who plays ─────────────────────────────

/**
 * The thumb is modelled on Matt's Gemini research (reference/GEMINI-PCG-RESEARCH.md, part 3, "Stage B: Monte Carlo Noisy-Bot
 * Simulation" and the 4-channel "touch-fumble state machine"), tuned for a first-timer's plain flicks:
 *   - every press comes late (or now and then early) by the reaction noise: N(+90 ms, 65 ms) for the Easy kid, N(+30 ms, 30 ms) for the
 *     Normal adult;
 *   - the thumb stays down N(t, 80 ms) (kid) or N(t, 35 ms) (adult) around his idea of a jump, which is a flick, not the full held jump,
 *     and 8% (kid) / 3% (adult) of flicks are cut to a 2-frame tap (Channel 3);
 *   - 0.4 s (kid) / 0.2 s (adult) of hesitation before a punch, and 133-200 ms from a jump press to a tap (Channel 4, one thumb);
 *   - the steering thumb drifts outward ~N(+4, 2) px/s while he holds one way, capped where the game's anchor follows the thumb
 *     (Channel 1: the research says a floating anchor halves the error), and turning round costs the thumb's travel back across the
 *     dead zone and the drift (about 0.2-0.35 s for the kid, 0.1-0.2 s for the adult); now and then it slips into the dead zone;
 *   - lifting off to stop comes late by a log-normal 1-4 frames (kid) / 0-2 (adult) (Channel 2), so he runs on past where he meant to.
 */
/** a distribution as the tester profiles keep it (tools/playtesters/profiles/README.md "Distributions"): [p10, p25, p50, p75, p90] */
export type Q5 = [number, number, number, number, number];

export interface FirstTimer {
  /** KID and ADULT: the hand-tuned first-timers; CHILD, MIDDLE and EXPERT: the tier bots built from the testers' saved numbers (R-165.59) */
  name: 'KID' | 'ADULT' | 'CHILD' | 'MIDDLE' | 'EXPERT';
  setting: 'easy' | 'normal';
  /** s at the stage start before he takes in anything (the goal card, finding his thumb): he holds the way on, nothing else */
  look: number;
  /** s from a warning or a tip on screen to acting on it (a human's ~1 s) */
  heed: number;
  /** s from being stopped dead to deciding to jump */
  stopReact: number;
  /** he freezes when a watcher's head turns toward him (its glance's tell, core.ts stepGlance), his stopReact after it began; false: never
   *  (the plant: eagleGlance.test.ts's toy goes red without it) */
  freeze?: boolean;
  /** thumb latency on every press: N(mean, sd) s */
  thumb: [number, number];
  /** how long the thumb stays down on a flick: N(his idea of a jump, sd) s, never under 2 frames */
  hold: [number, number];
  /** chance a flick is cut to a 2-frame tap */
  short: number;
  /** chance a flick goes straight up and the steer lets go for a moment, and for how long (s) */
  upOnly: number;
  upOnlyT: [number, number];
  /** how far before an edge (px) he means to jump; the latency then moves it */
  edgeAim: number;
  /** the second flick comes when he is rising slower than this (px/s, negative is up): a range around the top of the jump */
  dblAt: [number, number];
  /** chance he jumps an animal walking at him (else he walks into it) */
  hopFoe: number;
  /** s he stops before a punch (or a pick-up) */
  hesitate: number;
  /** s from a jump press to the next tap at least (one thumb), a range */
  swap: [number, number];
  /**
   * Channel 1: the steering thumb drifts outward N(mean, sd) px/s while he holds one way (the game's anchor follows the thumb past
   * touchGestures.ts TUNING.reanchor, 30 px, so the drift never builds past that); turning round, the thumb travels back across the
   * dead zone (2 x TUNING.moveDead) and the drift at `thumbSpeed` px/s, with no steer meanwhile
   */
  drift: [number, number];
  thumbSpeed: number;
  /** and now and then (chance a second) it slips into the dead zone for a few frames anyway */
  slip: number;
  slipFrames: [number, number];
  /** Channel 2: frames of late lift-off when he means to stop: round(exp(N(mu, sd))), clipped to the range */
  release: [number, number];
  releaseMax: [number, number];
  // ── the tier bots' own fields (R-165.59): each one is drawn from a tester profile distribution; KID and ADULT have none of them,
  // so they play exactly as before. Every value and its source: reference/qa-reports/R-165.59/BOTS.md ──
  /** the jump press held, press to release (s): replaces `hold` and `short` (profiles jumpHoldMs) */
  holdQ?: Q5;
  /** where a running ground jump is pressed, px before the lip (Pokey's middle to the end of the ground): replaces `edgeAim`, and the
   *  press then comes at once (the measured distance already has the thumb's latency in it) (profiles groundPressToLipPx) */
  aimQ?: Q5;
  /** chance an edge jump is pressed late, after walking off (coyote), and how late (s) (latePressShareOfLipJumps, latePressAfterLeavingLedgeMs) */
  lateShare?: number;
  lateQ?: Q5;
  /** chance he stops at an edge and jumps from standing, and how long he stands (s) (groundPressFromStandstillShare, steering.standStillMs) */
  standShare?: number;
  standQ?: Q5;
  /** chance any jump gets a second press, and the second press's delay after the first (s) (secondPressDelayMs: its n over the first presses) */
  dblShare?: number;
  dbl2Q?: Q5;
  /** the steering rhythm on open ground: a direction held (s), then let go (s) (steering.moveHoldMs, steering.moveGapMs) */
  steerQ?: Q5;
  gapQ?: Q5;
  /** the share of those let-go spells he takes on open ground (the rest the testers took in the air, at a stop or on a landing, where the
   *  bot steers by need): a tuning field, fitted to the tier's finish time */
  gapShare?: number;
  /** where a jump has failed him before, his hold is drawn from this quantile of holdQ up (he holds on longer): a tuning field, no profile */
  retryHold?: number;
  /** he knows the double jump from the start (doubleUsedShare 1.0: every tester run used it): a gap one jump does not cross gets one */
  knowsDouble?: boolean;
  /** the chase skill REMOVED (level.md rule 21's planted toy test only, tools/inspect/chaseBots.test.ts): on a running chase he stands at
   *  an edge and lets go of the thumb as anywhere else. Every bot has the skill: with the branch breaking behind him (the crack, the
   *  creak, the ember at the edge) he keeps his thumb down and takes each edge in stride (1-8.md: every chase beat passable IN STRIDE) */
  noChaseStride?: boolean;
  /** the rolling nut and bouncing fruit's reading REMOVED (level.md rule 21's planted toy test only, chaseBots.test.ts): he runs on as
   *  if neither were there. Every bot has it: a small nut rolling at him, a hop as it closes; a big fruit bouncing at him, he stays down
   *  and runs on under it (1-8.md: "small and rolling = hop; big and bouncing = stay down") */
  noRollRead?: boolean;
  /** the freeze REMOVED (level.md rule 21's planted toy test only, tools/inspect/boaBots.test.ts): an animal of the cast rears at him
   *  and he walks on into its strike. Every bot has it once told (1-9.md "be the bait"): a rear starts within its engage, and after his
   *  reaction (stopReact, then the thumb's lag: BOTS.md keeps both from KID / ADULT, no profile measures reaction) the thumb comes off
   *  and stays off until it is beaten (it flees) or its strike is over */
  noFreeze?: boolean;

  /** the runner liana's held thumb REMOVED (level.md rule 21's planted toy test only, chaseBots.test.ts): on open ground he lifts his
   *  thumb by his rhythm (gapQ) on the run to a liana phased to a runner too, stops short and waits for it. Every bot has it: running at
   *  a runner liana's lip (1-8 NEW 4: it swings to meet a full run), his thumb stays down, as on a chase and under a fruit */
  noRunnerHold?: boolean;
  /** at a gap or a face he must clear, his hold is drawn from this quantile of holdQ up (he reads the jump): a tuning field */
  readHold?: number;
  /** and a double up a step gets its second press from dbl2Q's quantiles up to this one (early enough to climb): a tuning field */
  readDbl?: number;
  /** a double across a gap, from the first of these quantiles to the second (late enough to carry him, before he has fallen past the
   *  far ledge): a tuning field */
  readGap?: [number, number];
  /** at a gap that needs his double, his press distance is drawn again up to this quantile of aimQ, if it was further out (aimQ counts
   *  every moving ground press near an edge, hops along flat ground among them): a tuning field */
  readAim?: number;
}
export const FT_KID: FirstTimer = {
  name: 'KID', setting: 'easy', look: 1.2, heed: 1.1, stopReact: 0.4, thumb: [0.09, 0.065], hold: [0.16, 0.08], short: 0.08, upOnly: 0.45,
  upOnlyT: [0.08, 0.2], edgeAim: 32, dblAt: [-260, 160], hopFoe: 0.55, hesitate: 0.4, swap: [0.133, 0.2], drift: [4, 2], thumbSpeed: 180,
  slip: 0.03, slipFrames: [3, 6], release: [0.7, 0.5], releaseMax: [1, 4],
};
export const FT_ADULT: FirstTimer = {
  name: 'ADULT', setting: 'normal', look: 0.8, heed: 0.9, stopReact: 0.3, thumb: [0.03, 0.03], hold: [0.2, 0.035], short: 0.03, upOnly: 0.25,
  upOnlyT: [0.06, 0.14], edgeAim: 22, dblAt: [-200, 90], hopFoe: 0.8, hesitate: 0.2, swap: [0.133, 0.2], drift: [4, 2], thumbSpeed: 320,
  slip: 0.01, slipFrames: [2, 3], release: [0, 0.5], releaseMax: [0, 2],
};
/**
 * The tier bots (R-165.59): child, middle and expert, built from the testers' saved numbers (tools/playtesters/profiles/tiers/<tier>.json,
 * `all.<setting>`: P-numbers only), calibrated on 0.9.5's gen2 1-1 (reference/qa-reports/R-165.59/BOTS.md: every field, its value and its
 * source; tools/inspect/tierBots.test.ts pins both). Times are the profiles' ms / 1000. The fields no profile measures are kept from FT_KID
 * (child) or FT_ADULT (middle, expert). FT_<TIER> plays Normal; FT_<TIER>_EASY is the same player on Easy, from that setting's numbers.
 */
const ms = (q: Q5): Q5 => q.map((v) => v / 1000) as Q5;
const KEPT_KID = { look: FT_KID.look, heed: FT_KID.heed, stopReact: FT_KID.stopReact, thumb: FT_KID.thumb, hold: FT_KID.hold, short: 0, upOnly: FT_KID.upOnly, upOnlyT: FT_KID.upOnlyT, dblAt: FT_KID.dblAt, hopFoe: FT_KID.hopFoe, hesitate: FT_KID.hesitate, swap: FT_KID.swap, drift: FT_KID.drift, thumbSpeed: FT_KID.thumbSpeed, slip: FT_KID.slip, slipFrames: FT_KID.slipFrames, release: FT_KID.release, releaseMax: FT_KID.releaseMax };
const KEPT_ADULT = { look: FT_ADULT.look, heed: FT_ADULT.heed, stopReact: FT_ADULT.stopReact, thumb: FT_ADULT.thumb, hold: FT_ADULT.hold, short: 0, upOnly: FT_ADULT.upOnly, upOnlyT: FT_ADULT.upOnlyT, dblAt: FT_ADULT.dblAt, hopFoe: FT_ADULT.hopFoe, hesitate: FT_ADULT.hesitate, swap: FT_ADULT.swap, drift: FT_ADULT.drift, thumbSpeed: FT_ADULT.thumbSpeed, slip: FT_ADULT.slip, slipFrames: FT_ADULT.slipFrames, release: FT_ADULT.release, releaseMax: FT_ADULT.releaseMax };
export const FT_EXPERT: FirstTimer = {
  ...KEPT_ADULT, name: 'EXPERT', setting: 'normal', gapShare: 0.5, upOnly: 0.2, edgeAim: 61, knowsDouble: true, readHold: 0.5, readDbl: 0.75, readGap: [0.4, 0.9], readAim: 0.5,
  holdQ: ms([84, 125, 180, 278, 701]), aimQ: [17, 36, 61, 91, 131], lateShare: 0.073, lateQ: ms([17, 41, 92, 157, 259]),
  standShare: 0.206, standQ: ms([100, 133, 200, 300, 500]), dblShare: 0.236, dbl2Q: ms([284, 329, 441, 559, 683]),
  steerQ: ms([137, 267, 563, 1128, 1853]), gapQ: ms([50, 230, 328, 469, 763]),
};
export const FT_MIDDLE: FirstTimer = {
  ...KEPT_ADULT, name: 'MIDDLE', setting: 'normal', gapShare: 0.5, upOnly: 0.02, edgeAim: 58, knowsDouble: true, readHold: 0.5, readDbl: 0.75, readGap: [0.4, 0.9], readAim: 0.5,
  holdQ: ms([50, 82, 118, 181, 329]), aimQ: [11, 32, 58, 92, 156], lateShare: 0.123, lateQ: ms([16, 37, 99, 152, 234]),
  standShare: 0.524, standQ: ms([133, 200, 292, 401, 601]), dblShare: 0.262, dbl2Q: ms([250, 319, 416, 517, 650]),
  steerQ: ms([104, 164, 333, 712, 1303]), gapQ: ms([164, 266, 473, 719, 1033]),
};
export const FT_MIDDLE_EASY: FirstTimer = {
  ...KEPT_ADULT, name: 'MIDDLE', setting: 'easy', gapShare: 0.5, upOnly: 0.02, edgeAim: 61, knowsDouble: true, readHold: 0.5, readDbl: 0.75, readGap: [0.4, 0.9],
  holdQ: ms([51, 91, 135, 202, 467]), aimQ: [8, 30, 61, 106, 182], lateShare: 0.11, lateQ: ms([16, 34, 66, 117, 216]),
  standShare: 0.483, standQ: ms([115, 158, 235, 335, 468]), dblShare: 0.255, dbl2Q: ms([249, 317, 383, 484, 627]),
  steerQ: ms([107, 169, 367, 767, 1401]), gapQ: ms([102, 233, 393, 615, 863]),
};
export const FT_CHILD: FirstTimer = {
  ...KEPT_KID, name: 'CHILD', setting: 'normal', upOnly: 0.16, edgeAim: 73, knowsDouble: true, readHold: 0.5, readDbl: 0.5, readGap: [0, 0.9],
  holdQ: ms([22, 49, 74, 115, 231]), aimQ: [1, 28, 73, 119, 232], lateShare: 0.121, lateQ: ms([18, 46, 83, 113, 129]),
  standShare: 0.81, standQ: ms([237, 394, 560, 740, 1131]), dblShare: 0.234, dbl2Q: ms([291, 323, 406, 530, 710]),
  steerQ: ms([56, 80, 120, 192, 524]), gapQ: ms([268, 420, 630, 1041, 1489]),
};
/** the child tier's one Easy run (P27, 37 minutes, 187 put-backs): an outlier no bot is tuned to; printed, never checked */
export const FT_CHILD_EASY: FirstTimer = {
  ...KEPT_KID, name: 'CHILD', setting: 'easy', upOnly: 0.16, edgeAim: 71, knowsDouble: true, readHold: 0.5, readDbl: 0.5, readGap: [0, 0.9],
  holdQ: ms([49, 100, 219, 395, 1108]), aimQ: [0, 27, 71, 161, 245], lateShare: 0.25, lateQ: ms([65, 100, 180, 247, 362]),
  standShare: 0.663, standQ: ms([132, 263, 631, 1187, 2371]), dblShare: 0.3, dbl2Q: ms([361, 413, 543, 724, 1251]),
  steerQ: ms([64, 132, 231, 444, 931]), gapQ: ms([50, 83, 297, 717, 1708]),
};

/** a rolling nut this near in front of him (px, its near side to his), closing: he hops (a full run closes about 405 px/s: 0.15 s) */
const HOP_AT = 60;
/** a bouncing fruit within twice this ahead (px), dropping in or bouncing: he keeps his thumb down and runs on under it, no stop */
const UNDER_AT = 240;
/** a chased player's stand at an edge leaves this much of the front's stop budget (s): his jump and the step after it still to come */
const CHASE_MARGIN = 0.8;

/** seeded random numbers (mulberry32): the same seed plays the same run */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const between = (r: () => number, [a, b]: [number, number]) => a + (b - a) * r();
/** a normal draw (Box-Muller) */
export const gauss = (r: () => number, [mu, sd]: [number, number]) => mu + sd * Math.sqrt(-2 * Math.log(Math.max(1e-9, r()))) * Math.cos(2 * Math.PI * r());
/** the random streams' salt: KID and ADULT keep theirs (kid, adult); each tier bot has its own */
function salt(who: FirstTimer, kid: number, adult: number): number {
  return who.name === 'KID' ? kid : who.name === 'ADULT' ? adult : kid * 100 + ({ CHILD: 11, MIDDLE: 13, EXPERT: 17 } as const)[who.name];
}
/**
 * a draw from a profile distribution: the inverse of the piecewise-linear curve through its five points (u = 0.10 .. 0.90), the tails
 * carried on at the slope of the last span to u = 0 and 1 (not under `min`); `lo` draws from that quantile up
 */
export function drawQ(r: () => number, q: Q5, min = 0, lo = 0, hi = 1): number {
  const u = lo + (hi - lo) * r();
  const P = [0.1, 0.25, 0.5, 0.75, 0.9];
  const v0 = q[0] - ((q[1] - q[0]) * 0.1) / 0.15, v1 = q[4] + ((q[4] - q[3]) * 0.1) / 0.15;
  const xs = [0, ...P, 1], ys = [v0, ...q, v1];
  let i = 0;
  while (i < xs.length - 2 && u > xs[i + 1]) i++;
  const f = (u - xs[i]) / (xs[i + 1] - xs[i]);
  return Math.max(min, ys[i] + f * (ys[i + 1] - ys[i]));
}
/** the thumb's hold on one flick */
export function flickHold(r: () => number, who: FirstTimer, lo = 0): number {
  // (a tier bot: the testers' own holds, one frame at least, as a press and its release can fall in one 30 fps frame)
  if (who.holdQ) return Math.min(1.5, drawQ(r, who.holdQ, DT, lo));
  if (r() < who.short) return 2 * DT;
  return Math.max(2 * DT, Math.min(0.45, gauss(r, who.hold)));
}

// ───────────────────────────── what he remembers about a spot ─────────────────────────────

/**
 * The jumps he tried at each spot (a spot: within 60 px across and 30 px up of where a jump first took off there), and how they went.
 * A spot where a single jump failed gets a double next time; a landing back at or below where he took off, with no progress, is a
 * fall back (the same spot twice is a loop).
 */
export class SpotMemory {
  private list: Array<{ x: number; y: number; singles: number; doubles: number; fails: number; deaths: number }> = [];
  private find(x: number, y: number) {
    return this.list.find((s) => Math.abs(s.x - x) < 60 && Math.abs(s.y - y) < 30);
  }
  private get(x: number, y: number) {
    let s = this.find(x, y);
    if (!s) this.list.push((s = { x, y, singles: 0, doubles: 0, fails: 0, deaths: 0 }));
    return s;
  }
  /**
   * a double where a single has failed here: fallen back, or died (LV-2 round 2: a death never counted, so at 1-8's 212 px gap mid-chase
   * he tried singles to the end; and his take-off moves from try to try, so a death within 160 px before counts for this spot)
   */
  plan(x: number, y: number): 'single' | 'double' {
    const s = this.find(x, y);
    if (s && s.fails > 0) return 'double';
    return this.list.some((q) => q.deaths > 0 && Math.abs(q.y - y) < 30 && q.x - x >= -40 && q.x - x < 160) ? 'double' : 'single';
  }
  /** a jump from (x, y) ended: `ok` when it got him on */
  result(x: number, y: number, kind: 'single' | 'double', ok: boolean): void {
    const s = this.get(x, y);
    if (kind === 'single') s.singles++;
    else s.doubles++;
    if (!ok) s.fails++;
  }
  /** he lost a life here (a drowning loop counts as falling back too) */
  died(x: number, y: number): number {
    const s = this.get(x, y);
    s.deaths++;
    return s.deaths;
  }
  fails(x: number, y: number): number {
    return this.find(x, y)?.fails ?? 0;
  }
  /** spots he fell back at (or died at) 2 or more times */
  loops(): Array<{ x: number; y: number; n: number; doubles: number; deaths: number }> {
    return this.list.filter((s) => s.fails + s.deaths >= 2).map((s) => ({ x: Math.round(s.x), y: Math.round(s.y), n: s.fails + s.deaths, doubles: s.doubles, deaths: s.deaths }));
  }
}

// ───────────────────────────── how far along the way he is ─────────────────────────────

export interface Pt { x: number; y: number; /** a point along a shimmy rope (route.ts 'rope'): it lies at the ledges' height, in the air over
 *  whatever lies under the rope, so he is followed onto it only while he hangs from it (FIX-22: a kid on a step under 2-2's rope was
 *  followed onto the rope's line and walked off the step toward it) */ rope?: boolean }

/**
 * Progress along the route: the route's points every ~24 px, and which one he is nearest (looked for near the last one, so a route
 * that doubles back under itself does not jump ahead). `hi` is the furthest since he last came back to life.
 */
/** how near a pin's point he stands to have reached it (px, Progress.d: the stone's half width less a step) */
const PIN_AT = 50;
export class Progress {
  cur = 0;
  hi = 0;
  best = 0;
  /** the way back he can be followed no further than (set when he is put past a puzzle room; a respawn or rescue clears it) */
  floor = 0;
  /** points he must stand at before the way on past them counts (a spur's dead-end stone, OUT-AND-BACK, FIX-22): the route goes out
   *  and back over the same ground, so without them the nearest point ahead jumped to the way back before he went out. Indices into
   *  pts, in order; `pin` is the next one not reached */
  pins: number[] = [];
  private pin = 0;
  /** the last pin he stood at: the way back over the same ground lies past it, so he is never followed back before it (the out-and-back
   *  ground's outbound points lie beside its return points, and the nearer one pulled him back out to the stone: a middle bot hopped
   *  stone to pad and back for 20 s, 2-2 Easy seed 12, FIX-22). Kept through a respawn */
  private pinFloor = 0;
  constructor(readonly pts: Pt[]) {}
  /** the furthest point he may be followed to: up to the next pin he has not stood at */
  private cap(i: number): number {
    return this.pin < this.pins.length ? Math.min(i, this.pins[this.pin]) : i;
  }
  private d(i: number, p: Pt) {
    const q = this.pts[i];
    return Math.abs(q.x - p.x) + Math.abs(q.y - p.y) * 0.7;
  }
  /** follow him: true when he got further than he has been since he came back */
  step(p: Pt & { hanging?: boolean }): boolean {
    if (!this.pts.length) return false;
    let bi = this.cur, bd = this.d(this.cur, p);
    const lo = Math.max(this.floor, this.pinFloor, this.cur - 25), hi = this.cap(Math.min(this.pts.length - 1, this.cur + 40));
    for (let i = lo; i <= hi; i++) {
      if (this.pts[i].rope && !p.hanging && i !== this.cur) continue;
      const d = this.d(i, p);
      if (d < bd - 1e-6 || (Math.abs(d - bd) < 1e-6 && i > bi)) {
        bd = d;
        bi = i;
      }
    }
    if (bd < 160) this.cur = bi;
    // (a pin is reached when he stands at it: on its stone, within PIN_AT of its middle, whichever route point is nearest)
    if (this.pin < this.pins.length && this.d(this.pins[this.pin], p) < PIN_AT) { this.cur = this.pinFloor = this.pins[this.pin]; this.pin++; }
    const more = this.cur > this.hi;
    if (more) this.hi = this.cur;
    if (this.cur > this.best) this.best = this.cur;
    return more;
  }
  /** how far he stands from the point he is at along the way (0 with no route) */
  off(p: Pt): number {
    return this.pts.length ? this.d(this.cur, p) : 0;
  }
  /** after a respawn or a rescue: find him anywhere along the way */
  relocate(p: Pt, level = false): void {
    let bi = 0, bd = Infinity;
    // (`level`: after a fall, only the points about his height or below: the way back up starts where he can walk to)
    const ok = (i: number) => this.cap(i) === i && i >= this.pinFloor && !this.pts[i].rope && (!level || this.pts[i].y >= p.y - 80);
    if (level && !this.pts.some((_, i) => ok(i))) level = false;
    for (let i = 0; i < this.pts.length; i++) {
      if (!ok(i)) continue;
      const d = this.d(i, p);
      if (d < bd) {
        bd = d;
        bi = i;
      }
    }
    this.cur = bi;
    this.hi = bi;
    this.floor = 0;
  }
  /** the point he heads for: the first one ahead that is more than `far` px from him */
  target(p: Pt & { hanging?: boolean }, far = 90): Pt | null {
    if (!this.pts.length) return null;
    for (let i = this.cur; i < this.pts.length; i++) {
      const q = this.pts[i];
      // (never past a pin he has not stood at: he goes to it first)
      if (this.pin < this.pins.length && i >= this.pins[this.pin]) return this.pts[this.pins[this.pin]];
      // (a rope's line is in the air: off it, he heads for where it starts, its ledge's end, until he stands there; from a step under it
      // the line's far points pulled him off the step away from the ledge: FIX-22, 2-2's dip)
      if (q.rope && !p.hanging) {
        let k = i;
        while (k > 0 && this.pts[k - 1].rope) k--;
        const at = this.pts[k];
        if (Math.abs(at.y - p.y) > 20 || Math.abs(at.x - p.x) > 60) return at;
      }
      if (Math.hypot(q.x - p.x, q.y - p.y) > far) return q;
    }
    return this.pts[this.pts.length - 1];
  }
  get share(): number {
    return this.pts.length ? this.best / (this.pts.length - 1) : 0;
  }
}

// ───────────────────────────── Dot, as the phone shows her ─────────────────────────────

export interface Shown {
  key: string;
  text: string;
  kind: string;
  source: string;
  topic?: TopicId;
  move?: MoveId;
  /** s of play it went up and came down (null: still up at the end) */
  t0: number;
  t1: number | null;
  why?: string;
  /** of the frames it was up, how many had what it is about out of reach (more than 400 px away), and how many had it near */
  far: number;
  near: number;
  /** its move had already been done in this run when it went up */
  doneBefore?: boolean;
}

/** Dot's guide for one run: the game's queue, fed what the engine, the lessons and the struggle watch send */
class DotShadow {
  /** (Worlds 1-4 have Dot toned down, as the app has her: dotGuide.ts CALM, components/dot/DotGuide.tsx) */
  readonly queue: GuideQueue;
  readonly moves = new MoveWatch();
  readonly struggle = new StruggleWatch();
  clock = 0;
  readonly shown: Shown[] = [];
  private open = new Map<number, Shown>();
  private prevLives = -1;
  private alive = { x: 0, y: 0, foe: false, falling: false };
  private restart = true;
  private prevJR = 0;
  /** Dot's setting as the game applies it (DotSay.allows, the phone's default: Tips on Normal, Help on Easy), when the run asks for it */
  private sayer: DotSay | null = null;
  constructor(readonly stageId: string, setting = false) {
    const w = Number(stageId.split('-')[0]);
    this.queue = new GuideQueue(w >= 1 && w <= 4 && !/-D$/.test(stageId));
    if (setting) this.sayer = new DotSay(this.queue, dotHelp(), seenSkills(), movesDone());
  }
  private say(l: GuideLine | null | undefined) {
    if (!l) return;
    if (this.sayer) this.sayer.say(l, this.clock);
    else this.queue.push(l, this.clock);
  }
  engine(text: string, seconds: number, passed: boolean | undefined, o?: { teach?: true; lock?: true }) {
    if (passed) {
      const l = engineGuideLine(text, this.stageId, { dot: true });
      if (l) this.queue.clear((q) => q.key === l.key, this.clock);
      return;
    }
    if (!text) {
      this.queue.clear((l) => l.source === 'engine' && l.kind === 'danger', this.clock);
      return;
    }
    // (the locked exit's line as the phone takes it: a must, whatever its words, DotGuide.tsx engineLine; R-165.241)
    this.say(engineGuideLine(text, this.stageId, { dot: true, ms: seconds * 1000, teach: !!o?.teach, lock: !!o?.lock }));
  }
  lesson(id: LessonId, holding: boolean) {
    this.say(lessonDotLine(id, 'screen', holding));
  }
  private help(h: StruggleHelp | null, topic?: TopicId) {
    if (h) this.say({ key: h.key, text: h.text, kind: 'struggle', who: 'Dot', topic, source: 'struggle' });
  }
  /** one frame: `t` s of play, `far` says whether a topic's thing is out of reach now */
  tick(v: GuideView, t: number, far: (topic: TopicId | undefined) => boolean | null) {
    if (!v.hurt) this.clock += DT * 1000;
    this.moves.step(v);
    // (the struggle watch, as DotGuide.tsx perceive does it: two deaths at one spot, no progress for 15 s with a thumb down)
    if (this.prevLives < 0) this.prevLives = v.lives;
    if (this.restart) {
      this.struggle.restart(v.px, v.py);
      this.restart = false;
    }
    if (!v.boss) {
      if (v.hp > 0 && v.py < v.levelH - 10) {
        let foe = false;
        for (const en of v.enemies) if (!en.defeated && Math.abs(en.x - v.px) < 150 && Math.abs(en.y - v.py) < 160) foe = true;
        this.alive = { x: v.px, y: v.py, foe: foe || v.hurt, falling: !v.grounded && v.vy > 400 };
      }
      if (v.lives < this.prevLives) {
        const fell = this.alive.y > v.levelH - 140 || (this.alive.falling && !this.alive.foe);
        const h = this.struggle.death(this.alive.x, this.alive.y, fell ? 'fall' : this.alive.foe ? 'foe' : 'other');
        this.help(h, h?.cause === 'fall' ? 'gap' : h?.cause === 'foe' ? 'foe' : undefined);
        this.restart = true;
      }
      const jr = this.moves.count('jump') + this.moves.count('run') + this.moves.count('grab');
      if (jr !== this.prevJR) {
        this.prevJR = jr;
        this.struggle.otherMove();
      }
      this.help(this.struggle.step(DT * 1000, v.px, v.py));
    }
    this.prevLives = v.lives;
    const danger = !v.flight && (inDanger(v) || v.boss || v.chase);
    this.queue.tick(this.clock, { danger, hold: t < 1, moveCount: (m) => this.moves.count(m), swinging: v.swinging, gone: (l) => !!l.topic && GONE_TOPICS.has(l.topic) && !findTarget(l.topic, v) });
    for (const ev of this.queue.drain()) {
      const l = ev.show.line;
      if (ev.type === 'start') {
        const s: Shown = { key: l.key, text: l.text, kind: l.kind, source: l.source, topic: l.topic, move: l.move, t0: t, t1: null, far: 0, near: 0, doneBefore: !!l.move && this.moves.count(l.move) > 0 };
        this.shown.push(s);
        this.open.set(ev.show.n, s);
      } else {
        const s = this.open.get(ev.show.n);
        if (s) {
          s.t1 = t;
          s.why = ev.why;
          this.open.delete(ev.show.n);
        }
        if (l.next && (ev.why === 'done' || ev.why === 'read')) this.say(l.next);
      }
    }
    for (const s of this.open.values()) {
      const f = far(s.topic);
      if (f === true) s.far++;
      else if (f === false) s.near++;
    }
  }
  /** lines on screen now, and since when */
  up(): Shown[] {
    return [...this.open.values()];
  }
}

// ───────────────────────────── what the run reports ─────────────────────────────

export interface Harm {
  kind: 'hit' | 'life';
  t: number;
  x: number;
  y: number;
  cause: string;
  /** what hurt him was on the screen when it did (null: no one thing to see, a fall) */
  onScreen: boolean | null;
  /** he was heading for a bush, or down in one, when it hit */
  hiding?: boolean;
  /** the watching eagle: how far the nearest bush at his level was (px), and which of its passes this was */
  bush?: number | null;
  pass?: number;
}
export interface StuckSpot {
  x: number;
  y: number;
  t: number;
  /** s with no progress */
  dur: number;
  what: string;
  /** the face in front of him (px), or the dip he is in (px deep), when there is one */
  step: number | null;
  dip: number | null;
  /** at a puzzle or a piece the stage teaches (a knot, a still spot): stopped there, not a failure */
  puzzle: boolean;
  rescued: boolean;
}
export interface FirstHarm {
  cause: string;
  t: number;
  x: number;
  kind: 'hit' | 'life';
  /** Dot's first line on screen that teaches it, if any came before the end of the run */
  tip: { t: number; text: string } | null;
  /** the tip was up (for a reaction's worth) before the harm */
  ok: boolean;
}
export interface DotReport {
  heard: number;
  lines: Array<{ t: number; dur: number | null; text: string; kind: string; source: string }>;
  repeats: Array<{ text: string; n: number; at: number[] }>;
  /** a line started under 10 s after the one before it started */
  quick: Array<{ t: number; gap: number; text: string; after: string }>;
  /** up 20 s or more */
  long: Array<{ t: number; dur: number; text: string; outOfReach: boolean | null }>;
  /** a tip that teaches a move he had already done in this run */
  reteach: Array<{ t: number; text: string }>;
  /** lines of more than 10 words */
  wordy: Array<{ t: number; text: string; words: number }>;
}
/**
 * The rules the bot checks, by their names in reference/STAGE-RULES.md (section 2's rows and section 6's lessons), with the thresholds
 * used. A finding names the rule it breaks.
 */
/**
 * The bot's skills a toy test switches off to prove the bot needs them (level.md rule 21: the plant goes RED with the skill off). `ride`:
 * he boards a drifting log (or a lily pad) only when a hop from where he stands, flown as the engine flies it, comes down on it where it
 * will be (hopLandsOn), and on a log he rides it until such a hop takes him to the next log, or the bank is near (riverRide.test.ts: with
 * it off, he hops at a river's edge whatever the logs are doing). Always on outside a test.
 */
export const SKILLS = { ride: true, upstream: true, bankUp: true, handed: true, dropOnLog: true, vineFromLog: true };
/**
 * (ENG-24, reference/design/2-4.md NEW 2) `dropOnLog`, drop on a log: on a liana hung over a log river, he lets go at the swing's forward
 * end only when that let-go comes down on a log (or past the water on the far bank), flown as the engine flies it (timedLaunch and the air
 * tick with the engine's turn), the logs where they will be on their clock; otherwise he rides the swing round and waits for the logs, as
 * a person watching both clocks does ("not yet... NOW"). `vineFromLog`, a vine from a log: riding a drifting log under a liana hung over
 * the river ahead (not the one he just left), he jumps for it the moment a jump off the moving log (its carry his, RIDE.keep) catches it
 * where it will be on the vines' clock (hopCatches), after his thumb's lag. Both fly the press as the phone's touch layer holds it (at
 * least MIN_TOUCH_JUMP_HOLD_MS from the take-off, inputEngine.ts), never FakeInput's bare one-frame press. Always on outside a test.
 */
/**
 * (BUILD-21, 2-1.md NEW 4) `upstream`, against the flow: on a log carrying him back the way he came (a river flowing back at him), every
 * log runs at the river's one speed, so the gap to the next never closes while he waits: waiting at the front end only carries him back.
 * He hops from the log's front end as soon as the next log (or the far bank) is in reach of a hop, flown as the engine flies it, and never
 * walks off a log's end to press late (a ground edge's late press: off a log the water is 14 px under him, river.ts LOG_DROP - LOG_HEIGHT/2,
 * so there is no fall to press in; riverRide.test.ts, measured 11-15: the child on Easy walked off and drowned 4 times). `handed`, handed to
 * the bank: on a log carrying him on toward the bank ahead, he stands and rides it in (engine.ts drift loop: carried under a bank he steps
 * up onto it), never a hop at the water off its front end. (FIX-GATES 11-15) `bankUp`, up the far bank: on a log running back at him, the far
 * bank's face (a step of LOG_DROP up) in a hop's reach, he hops up onto it now; it reads as floor ahead, so no gap rule ran there (2-1
 * child Easy seeds 20, 23). Always on outside a test.
 */

export const RULES = {
  opening: { name: 'Opening seconds', ref: 'STAGE-RULES §2', rule: 'Nothing can hurt in the first ~3-5 s of plain walking; the first tip comes before the first hazard it teaches.', secs: 5 },
  plainWalk: { name: 'Plain walk', ref: 'STAGE-RULES §2', rule: 'No step, lip or dip that stops a plain walk dead; every dip has a one-jump way out; a jump into a face carries over its lip.', stuckSecs: 8, loops: 2 },
  eagle: { name: "1-7's eagle", ref: 'STAGE-RULES §6', rule: 'The first swoop must be a harmless warning; swoops come from on screen or with a clear tell; hiding works the way a thumb naturally does it.' },
  dot: { name: 'Dot pacing', ref: 'STAGE-RULES §6', rule: 'A gap of ~10-12 s between her lines (a warning just before a danger and a locked-exit explanation aside); no repeating a tip once done; no re-teaching moves already used; under 10 words.', gap: 10, words: 10, long: 20 },
  wayOn: { name: 'Way on', ref: 'first-timer bot', rule: 'A first-timer going the way the stage leads is never stopped 8 s with no progress (outside a puzzle).', stuckSecs: 8 },
  outcome: { name: 'First-timer outcome', ref: 'first-timer bot', rule: 'A first-timer reaches the shrine without losing lives over and over.', hitsPerMin: 2, livesPerMin: 0.6 },
  survival: { name: 'Hotspots (survival per jump)', ref: 'STAGE-RULES §2; Gemini Part 2 §8; GEMINI-LEDGER F3', rule: 'Every jump edge is crossed without a fall or a hit by 85% of tries on Easy, 70% on Normal (Worlds 1-5).' },
  window: { name: 'Minimum input window', ref: 'Gemini Part 2 §8; GEMINI-LEDGER F5', rule: 'No jump needs its press within less than 300 ms on Easy (9 frames), 167 ms on Normal (5 frames).' },
  stress: { name: 'Peak stress per burst', ref: 'Gemini Part 2 §8; GEMINI-LEDGER F5', rule: 'The risk of the jumps in one burst before a rest adds up to 2.5 at most on Easy, 5.5 on Normal.' },
  backtrack: { name: 'Backtracking ratio', ref: 'Gemini Part 2 §8; GEMINI-LEDGER F5', rule: 'The path is 1.0-1.25 times the straight line from start to shrine on Easy, 1.15-1.6 on Normal.' },
} as const;
export type RuleId = keyof typeof RULES;

export interface Flag {
  /** higher is worse */
  sev: number;
  kind: 'opening' | 'before-tip' | 'eagle' | 'stuck' | 'loop' | 'harm-rate' | 'unfinished' | 'dot-long' | 'dot-repeat' | 'dot-quick' | 'dot-reteach' | 'dot-words'
    | 'gate-survival' | 'gate-window' | 'gate-stress' | 'gate-backtrack';
  /** the rule it breaks (RULES) */
  rule: RuleId;
  x: number | null;
  t: number | null;
  what: string;
}
export interface FTRun {
  who: FirstTimer['name'];
  setting: FirstTimer['setting'];
  seed: number;
  end: 'shrine' | 'sealed door' | 'time' | 'stranded';
  /** s of play */
  time: number;
  x: number;
  /** how far along the route he got (0-1) */
  progress: number;
  goal: { got: number; need: number } | null;
  /** holding the way on from the first frame, no jumps: the first hit and life lost in 5 s */
  holdOn: { hit: Harm | null; life: Harm | null };
  /** hits and lives lost in the bot's own first 5 s */
  opening: Harm[];
  harms: Harm[];
  /** Easy's soft falls on land (no life lost: engine.ts softFall) */
  softFalls?: number;
  /** the spur stones he stood on (a spur pond's dead-end stone, RiverZone.spur: OUT-AND-BACK, FIX-22) */
  spurs?: number;
  /** times a log carried him under a bank and he stepped up onto it, never in the air between (engine.ts drift loop; SKILLS.handed) */
  handed?: number;
  /** let-gos of a liana that came down on a drifting log (SKILLS.dropOnLog), and lianas caught by a jump off one (SKILLS.vineFromLog) */
  ontoLog?: number;
  fromLog?: number;
  perMin: { hits: number; lives: number };
  gameOvers: number;
  firstHarm: FirstHarm[];
  stuck: StuckSpot[];
  loops: Array<{ x: number; y: number; n: number; doubles: number; deaths: number; what: string; step: number | null; dip: number | null; puzzle: boolean }>;
  /** times a face stopped his walk dead, and how many of those a first plain jump did not get over */
  stops: { n: number; firstJumpFailed: number; heights: number[] };
  puzzles: Array<{ id: string; x: number; t: number }>;
  rescues: number;
  /** where each rescue picked him up and where each soft fall set him back (x): a gate that limits a move reads these inside a node */
  rescueXs: number[];
  softFallXs: number[];
  dot: DotReport;
  flags: Flag[];
  /** every jump he tried (left out of the report: the gates are worked out from them) */
  tries: Try[];
  /** the steering thumb's turns, and the s of no steer they cost (reversal lag, GEMINI-LEDGER G7) */
  turns: { n: number; lag: number };
  /** path length over the straight line from spawn to shrine: the main route's, and the bot's own walk (when he got there) */
  backtrack: { route: number | null; bot: number | null };
  /** no route could be traced, so he headed straight for the shrine (his findings there say more about the bot than the stage) */
  noRoute: boolean;
  frames: number;
  /** a tier bot's double jumps: each second press, ms after the first (R-165.59) */
  secondPressMs?: number[];
  /** the furthest right he got (px) */
  maxX?: number;
  /** times he turned back from a sealed shrine for an animal he passed (a purge, Dot having said why) */
  turnBacks?: number;
  /** a stage whose data names a cast (castPlay.ts): its animals, how each one he cleared went (the kit's way: punch, kick, stomp,
   *  trap), those left, and its drop traps, how many he sprung (castTally) */
  cast?: CastTally;
  /** the furthest on he got along the stage's travel (px: x in a run, y in a climb or a way down, stageModes.ts): which pieces he entered */
  far?: number;
  /** where he was every 0.5 s of play (px): the seconds he spent in each piece */
  xTrace?: number[];
  ms: number;
}

// ───────────────────────────── reading Dot's lines ─────────────────────────────

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]+/g, '').replace(/\s+/g, ' ').trim();

/** Dot's lines, judged: repeats, lines too close together, lines up 20 s or more */
export function dotReport(shown: Shown[], end: number): DotReport {
  const lines = shown.map((s) => ({ t: +s.t0.toFixed(1), dur: s.t1 === null ? null : +(s.t1 - s.t0).toFixed(1), text: s.text, kind: s.kind, source: s.source }));
  const by = new Map<string, { text: string; at: number[] }>();
  for (const s of shown) {
    const k = norm(s.text);
    const e = by.get(k) ?? { text: s.text, at: [] };
    e.at.push(+s.t0.toFixed(1));
    by.set(k, e);
  }
  const repeats = [...by.values()].filter((e) => e.at.length > 1).map((e) => ({ text: e.text, n: e.at.length, at: e.at }));
  // (a warning just before a danger and a locked-exit explanation may come at once: STAGE-RULES §6)
  const exempt = (s: Shown) => s.kind === 'danger' || s.kind === 'must';
  const quick: DotReport['quick'] = [];
  for (let i = 1; i < shown.length; i++) {
    const gap = shown[i].t0 - shown[i - 1].t0;
    if (gap < RULES.dot.gap && !exempt(shown[i])) quick.push({ t: +shown[i].t0.toFixed(1), gap: +gap.toFixed(1), text: shown[i].text, after: shown[i - 1].text });
  }
  const long: DotReport['long'] = [];
  for (const s of shown) {
    const dur = (s.t1 ?? end) - s.t0;
    if (dur < RULES.dot.long) continue;
    const seen = s.far + s.near;
    long.push({ t: +s.t0.toFixed(1), dur: +dur.toFixed(1), text: s.text, outOfReach: seen ? s.far > s.near : null });
  }
  const reteach = shown.filter((s) => s.doneBefore && s.kind === 'teach').map((s) => ({ t: +s.t0.toFixed(1), text: s.text }));
  const words = (t: string) => (t.trim().match(/\S+/g) ?? []).length;
  const seenW = new Set<string>();
  const wordy: DotReport['wordy'] = [];
  for (const s of shown) {
    const n = words(s.text);
    if (n > RULES.dot.words && !seenW.has(s.text)) {
      seenW.add(s.text);
      wordy.push({ t: +s.t0.toFixed(1), text: s.text, words: n });
    }
  }
  return { heard: shown.length, lines, repeats, quick, long, reteach, wordy };
}

/** the words that teach how to deal with a cause of harm */
export function teaches(cause: string, s: Pick<Shown, 'text' | 'topic' | 'source' | 'key' | 'kind'>): boolean {
  // (the goal and the story are not teaching: "the river king's crown" says nothing about jumping the river)
  if (s.kind === 'goal' || s.kind === 'story') return false;
  const t = s.text.toLowerCase();
  if (cause === 'water' || cause === 'pit') return s.topic === 'gap' || s.topic === 'water' || s.topic === 'ledge' || s.topic === 'moving' || /\b(jump|flick up|leap|gap|water|river|edge|hop|log|raft|over)\b/.test(t);
  if (cause === 'watcher') return /\b(hide|bush|fern|waterfall)\b/.test(t);
  if (cause === 'thorn') return /\b(thorn|vines?|freeze|eye)\b/.test(t);
  if (cause.startsWith('foe:')) {
    const type = cause.slice(4).toLowerCase();
    return s.topic === 'foe' || /lesson:foe/.test(s.key) || (type.length > 2 && t.includes(type.replace(/_/g, ' ')));
  }
  if (cause === 'rock' || cause.startsWith('hazard')) return /\b(rock|rocks|stone|falling|thorn|spike|spores?|careful|watch out|look up)\b/.test(t);
  return false;
}

/** for each kind of harm, the first time it happened against the first time Dot taught it (on screen a reaction's worth before) */
export function firstHarms(harms: Harm[], shown: Shown[], react: number): FirstHarm[] {
  const out: FirstHarm[] = [];
  const done = new Set<string>();
  for (const h of harms) {
    // (a life lost to a hit is judged by its first hit)
    if (done.has(h.cause)) continue;
    done.add(h.cause);
    const tip = shown.find((s) => teaches(h.cause, s));
    out.push({ cause: h.cause, t: +h.t.toFixed(1), x: Math.round(h.x), kind: h.kind, tip: tip ? { t: +tip.t0.toFixed(1), text: tip.text } : null, ok: !!tip && tip.t0 + react <= h.t });
  }
  return out;
}

// ───────────────────────────── the run ─────────────────────────────

type Eng = Record<string, any>;
const proto = GameEngine.prototype as unknown as Eng;
const PHONE = { w: 844, h: 390 };
/** FT_TRACE=1: every jump and how it went, on stderr */
const TRACE = typeof process !== 'undefined' && !!process.env.FT_TRACE;
/** FT_FRAMES=a,b: every frame between a and b s of play, on stderr */
/** the share of a liana's swing out in front at which he decides to let go (his thumb's lag on top): the forward end (intend, on a liana) */
export const LET_GO_AT = 0.75;
/** the highest a hold on a liana goes (physics.ts SWING.minLen: px under the anchor) */
const SWING_TOP = SWING.minLen;
const side1 = (d: -1 | 1): Pad => (d > 0 ? { right: true } : { left: true });
/**
 * Does a hop off (x, y) toward `dir` (at `vx0`, a run by default), the jump held `hold` s (then the engine's cut, PHYS.cutV), taking off at the vines' clock
 * `t0`, meet liana `v` where the engine catches (physics.ts canGrabSwing)? Flown frame by frame with the engine's air tick (airStep)
 * until he is 200 px under the take-off. (FirstTimerRun.lianaWait; pitClimb.test.ts)
 */
export function hopCatches(v: Parameters<typeof canGrabSwing>[2], x: number, y: number, dir: -1 | 1, hold: number, t0: number, vx0 = dir * PHYS.maxRun): boolean {
  const b = { x, y, vx: vx0, vy: -PHYS.jumpV };
  for (let i = 1; i < 60; i++) {
    const held = i * DT < hold;
    if (!held && b.vy < -PHYS.cutV) b.vy = -PHYS.cutV;
    airStep(b, DT, dir, held);
    if (canGrabSwing(b.x, b.y, v, t0 + i * DT)) return true;
    if (b.y > y + 200) return false;
  }
  return false;
}
/**
 * Does a hop from (x, y) at game time t0, held `hold` s, come down on the float `q` where it will be (`at(t)`: a drifting log on its
 * river's clock), `margin` px in from either end, inside its river's window (a log hidden under a bank is no floor: engine.ts onFloor)?
 * Flown frame by frame as the engine flies it (airStep), as hopCatches flies a hop to a liana (ENG-W2b: the old "a log is near" read a log
 * within 90 px of the edge as boardable ~90% of its cycle, and the middle bot drowned 5 times in one deep river on Normal).
 */
export function hopLandsOn(q: Platform, at: (t: number) => number, x: number, y: number, dir: -1 | 1, hold: number, t0: number, vx0: number, margin = 24): boolean {
  const b = { x, y, vx: vx0, vy: -PHYS.jumpV };
  for (let i = 1; i < 60; i++) {
    const held = i * DT < hold;
    if (!held && b.vy < -PHYS.cutV) b.vy = -PHYS.cutV;
    const prev = b.y;
    airStep(b, DT, dir, held);
    if (b.vy >= 0 && prev <= q.y && b.y >= q.y) {
      if (q.drift && (b.x < q.drift.x0 || b.x > q.drift.x1)) return false;
      const lx = at(t0 + i * DT);
      return b.x >= lx + margin && b.x <= lx + q.width - margin;
    }
    if (b.y > y + 200) return false;
  }
  return false;
}
/** where a float's left edge is at game time t: a drifting log on its river's clock (river.ts logClock), anything else where it stands */
const floatAt = (rivers: readonly RiverZone[] | undefined, q: Platform) => (t: number): number => (q.drift ? driftX(q.drift, logClock(rivers, q.drift, t)) : q.x);

/** px: the highest ledge over him he hops for on a tower's stair (a single jump rises 108 px, stageMetrics JUMP_RISE; a stair step is 60) */
const STAIR_HOP = 100;
const TRACE_FRAMES = typeof process !== 'undefined' && process.env.FT_FRAMES ? process.env.FT_FRAMES.split(",").map(Number) : null;

interface Jump {
  t0: number;
  x: number;
  y: number;
  cur: number;
  kind: 'single' | 'double';
  hold: number;
  upOnly: number;
  dir: -1 | 0 | 1;
  pressed2: boolean;
  dblAt: number;
  /** a tier bot's second press: s after the first (dbl2Q), or -1 */
  d2: number;
  /** a tier bot's hop back onto a bounce mushroom: the way on, steered once the bounce throws him up (0: none) */
  back?: -1 | 0 | 1;
  /** the mushroom's middle: he steers back until he is over it, then lets go */
  backX?: number;
  /** thrown up by the mushroom: the second press that follows is not a double's delay */
  bounced?: boolean;
  /** a hop off a lip for a liana (lianaWait): held toward it all the way, never steered back onto a small landing below */
  liana?: boolean;
  /** a jump he read (a gap or a face): the second press is held as the first */
  needs?: boolean;
  /** a jump up for a way on over his head: he steers to this x, then lets go */
  toX?: number;
  left: boolean;
  /** the face stop (stops[]) this jump answers */
  stop?: number;
  /** harms so far when it began */
  harms: number;
  running: boolean;
}

/** one jump he tried */
export interface Try {
  x: number;
  y: number;
  dir: -1 | 0 | 1;
  t0: number;
  t1: number;
  kind: 'single' | 'double';
  ok: boolean;
  /** hurt or killed during it */
  hurt: boolean;
  /** running when he took off (a jump over a gap or onto a ledge, not a hop from a standstill) */
  running: boolean;
  /** where an ok jump landed: the platform and his feet */
  land?: { id: number; x: number; y: number };
  hold: number;
}

export interface RunOptions {
  /** s of play at most */
  cap?: number;
  /** drive the engine through the game's own InputEngine (RealPlay.useRealInput: the touch layer's calls and minimum hold), never FakeInput's
   *  bare press: true for the touch's hold, a number for another (ms, the Pad button's PAD_HOP_MS) (ENG-24) */
  realInput?: true | number;
  /** called after every frame with the run's sim (a clip's recording, ENG-24 lianaClip) */
  onFrame?: (sim: RealPlay) => void;
  /** the route's points; default: the inspector's main route on the engine's own stage */
  route?: Pt[];
  /** stuck this long (s) without progress: put him further on */
  rescueAfter?: number;
  /** a phone held upright instead of sideways */
  portrait?: boolean;
  /** which run of several (a different thumb on the same layout) */
  trial?: number;
  /** Dot says only what the phone's default setting lets through (Tips on Normal, Help on Easy: DotSay.allows), as the game does.
   *  Off by default: the tier bots are calibrated to the testers without it (tierBots.test) */
  dotSetting?: boolean;
  /** moves an earlier stage of the world taught him, known from the start (a player plays a world in order: 1-8's still fork asks the
   *  hide 1-7 taught, and Dot need not say it again). The learned words' own ids ('hide', 'still', 'double', ...) */
  knows?: readonly string[];
}

/** a fresh phone: no lessons, tips or settings from the last run (a first-timer's own lessons carry over within one pass) */
export function freshPhone(setting: FirstTimer['setting']) {
  try {
    localStorage.clear();
  } catch {
    /* none */
  }
  setDifficulty(setting);
}

/** the nearest ground cover at his level within 600 px (a bush, a moss carpet or patch: not hanging, not the dressing in front of a
 *  hollow), the one a player heads for when the eagle screams (1-7) */
export function stillCoverNear(bushes: ReadonlyArray<{ x: number; w: number; y: number; hanging?: boolean; secret?: boolean }>, x: number, y: number): { x: number; w: number; y: number } | null {
  let best: { x: number; w: number; y: number } | null = null;
  const d = (b: { x: number; w: number }) => (x >= b.x + 16 && x <= b.x + b.w - 16 ? 0 : Math.min(Math.abs(b.x + 16 - x), Math.abs(b.x + b.w - 16 - x)));
  for (const b of bushes) if (!b.secret && !b.hanging && Math.abs(b.y - y) < 14 && (!best || d(b) < d(best))) best = b;
  return best && d(best) < 600 ? best : null;
}

export class FirstTimerRun {
  readonly sim: RealPlay;
  readonly e: Eng;
  readonly r: () => number;
  readonly prog: Progress;
  readonly mem = new SpotMemory();
  readonly dot: DotShadow;
  readonly harms: Harm[] = [];
  /** Easy's soft falls on land (engine.ts softFall, LV-4): no life, but a setback like one (three at a spot is a loop, and he is put past) */
  readonly softFalls: Array<{ t: number; x: number; y: number }> = [];
  /** the spur ponds (by their near end, RiverZone.x0) whose dead-end stone he has stood on */
  readonly spursMet = new Set<number>();
  /** handed to a bank by a log (FTRun.handed): counted where the frame after a log is a bank and he never left the ground */
  handed = 0;
  private wasOnLog = false;
  /** let-gos onto a log and catches off one (FTRun.ontoLog, fromLog): his last floor a log, his last hold a liana */
  ontoLog = 0;
  fromLog = 0;
  private lastFloorLog = false;
  /** the let-go coming is aimed at a log (SKILLS.dropOnLog): a drop, no second press after it */
  private aimedDrop = false;
  /** a liana's let-gos at a grip (physics.ts pressLaunches), kept by vine, grip and swing (SKILLS.dropOnLog) */
  private launches = new Map<string, ReturnType<typeof pressLaunches>>();
  private lastSwung = false;
  private wasSwinging = false;
  readonly stuck: StuckSpot[] = [];
  readonly puzzles: Array<{ id: string; x: number; t: number }> = [];
  private view = emptyGuideView();
  private jump: Jump | null = null;
  private lastLand = -1;
  private airFrom: { t: number; x: number; y: number; cur: number } | null = null;
  private blockedT = 0;
  private lastX = 0;
  /** a press he has decided on, and when the thumb gets there */
  private pending: { at: number; dir: -1 | 0 | 1; kind: 'single' | 'double'; off: boolean; still?: boolean } | null = null;
  private punchAt: number | null = null;
  /** a drop trap he has just hit: he stands until it is down (castPlan) */
  private trapWait: { post: TrapPost; until: number } | null = null;
  /** the drop trap he means to use (castPlan): kept until it is sprung, so he walks back to it when his thumb carries him past */
  private trapGoal: TrapPost | null = null;
  /** (a first-timer past the handle: backing off for a run-up at it) */
  private trapRunUp = false;
  /** the shrine sealed with the goal short, and Dot has said why: he turns back for an animal he passed, as a player told so does
   *  (`id` the animal, `best` the nearest he has come to it, `since` when he turned, `more` when he last came nearer: 20 s
   *  with no nearer and he gives it up); `turnBacks` how often */
  private hunt: { id: number; best: number; since: number; more: number } | null = null;
  turnBacks = 0;
  private huntMore = false;
  /** back from a turn: the nearest he has come to the shrine since (his walk back to it is progress, not a stuck spot) */
  private home: number | null = null;
  private swapGap = 0.15;
  private lastPress = -1;
  private lastSteer: -1 | 0 | 1 = 0;
  /** the way he last went */
  private way: -1 | 0 | 1 = 1;
  private travelUntil = -1;
  private driftUntil = -1;
  private releaseLeft = 0;
  /** a tier bot's late lift-off has been drawn for this let-go */
  private releaseArmed = false;
  private driftPx = 0;
  /** waiting at an edge for something drifting across since (s), or -1 */
  private edgeWait = -1;
  /** riding a moving floor: when the next floor first came in reach (s), or -1, and how long his reaction to it takes (clockRide) */
  private offSeen = -1;
  /** a pond's pad ahead first read ready (s), or -1 (padRead's reaction) */
  private padSeen = -1;
  /** with KEEP-HOPPING off: the pad he stops on and until when (padRead) */
  private padStop: { id: number; until: number } | null = null;
  private offDelay = 0;
  /** waiting at an edge for a ride on a stage clock to stand at his end, since (s), or -1 */
  private clockWait = -1;
  /** the last frame's clockRide held him by choice (a wait, not a block: blockedT does not count it) */
  private clockHeld = false;
  /** stopped on a small pad a beat after landing on it */
  private padPause: { until: number; id: number } | null = null;
  /** turns of the steering thumb, and the s of no steer they cost */
  turns = 0;
  turnLag = 0;
  /** every jump he tried: where, how it went, and the ground it was meant for */
  readonly tries: Try[] = [];
  /** how far he moved under his own steam (px; respawns and rescues are not moves) */
  walked = 0;
  /** the straight line from spawn to shrine, and the main route's length over it */
  direct = 0;
  routeRatio: number | null = null;
  /** the inspector traced no route: he headed straight for the shrine */
  noRoute = false;
  /** heading for a bush, or down in one, this frame */
  hiding = false;
  /** what was at each spot he fell back at */
  private whatAt: Array<{ x: number; y: number; what: string; step: number | null; dip: number | null; puzzle: boolean }> = [];
  /** where he last stood */
  private ground = { x: 0, y: 0 };
  /** every time a face stopped his walk dead: where, and how tall (px) */
  readonly stops: Array<{ x: number; y: number; h: number; t: number; ok?: boolean }> = [];
  /** the stop the next jump is the answer to */
  private nextStop: number | null = null;
  private foeSeen = new Map<number, boolean>();
  private stillT = 0;
  private hideFrom = -1;
  private warnSeenAt = -1;
  /** when the kit eagle's look over his stretch began (its screech), or -1 */
  private castWarnAt = -1;
  /** when a watcher's head began to turn toward him (its glance), or -1 */
  private glanceAt = -1;
  /** a rear he has seen start (freezePlan): which animal, and when his thumb comes off (his reaction) */
  private rearSeen: { m: unknown; at: number } | null = null;
  private swingT = 0;
  private ropeStill = 0;
  private climbStill = 0;
  /** falls back down the way from the same best point, and that point */
  private fallBacks = 0;
  private fallTop = -1;
  /** the route point the last rescue put him at */
  private lastRescue = -1;
  /** s he has stood far off the way (after a fall) */
  private offRoute = 0;
  /** he was on a trunk last frame */
  private wasClimbing = false;
  /** s he has held up beside a trunk standing still, and till when he lets it be */
  private trunkUpT = 0;
  private trunkIgnoreUntil = -1;
  /** when he was last put past each puzzle room */
  private roomAt = new Map<number, number>();
  /** the trunk he is on, and whether climbing down it got him nowhere */
  private climbVine: unknown = null;
  /** in a vine field: the figs under a shut gate pushed free, a pod's column stepped off (figPush.ts) */
  private figs: FigPush | null = null;
  /** this frame's want is a fig push's tap (or its let-go): kept as it is, never run through the thumb (tapped) */
  private figTap = false;
  /** he follows a tower's own route (towerRoute.ts): corners, no jump arcs, so he reads a stair of ledges himself */
  private onTower = false;
  private climbDown = false;
  private climbTurned = false;
  /** he was on a trunk when the last choice was made */
  private wasOnTrunk = false;
  /** how far he moved in the last frame */
  private moveX = 0;
  private moveY = 0;
  private lastY = 0;
  private visited = new Set<number>();
  private puzzleWait: { until: number; room: number } | null = null;
  private stillSpot: { until: number } | null = null;
  rescues = 0;
  readonly rescueXs: number[] = [];
  /** times he turned round to climb back out of a pit the way on could not be reached from (pitWayBack; pitClimb.test.ts) */
  climbBacks = 0;
  /** climbing back out of such a pit: the ledges from the pit's floor up to the route, in order, and the way he heads now */
  private climbBack: { path: Platform[]; dir: -1 | 1; t: number } | null = null;
  /** how often he has climbed back out of each pit (its floor): the same pit `tries3` times is a loop, and he is put past it */
  private pitFalls = new Map<Platform, number>();
  /** when he last let go of a liana (s of play): a pit he falls into soon after was a let-go that fell short, and he learns to hang low */
  private letGoAt = -Infinity;
  /** the liana he last swung on (its id): out of a pit, a liana further along the route than it is a way on, not the way back (pitWayUp) */
  private swungOn: number | null = null;
  /** the ledge pitWayUp last chose for a liana ahead of that one (a climb toward it is followed even when it heads the way on) */
  private catchAhead: Platform | null = null;
  /** seconds he has stood at an edge waiting for a liana to swing to him (lianaWait) */
  private lianaWaitT = 0;
  /** the press decided on is a hop for a liana (lianaWait; startJump marks the jump) */
  private lianaHop = false;
  gameOvers = 0;
  frames = 0;
  private lastCause = 'other';
  private stuckOpen: StuckSpot | null = null;
  private noProg = 0;
  end: FTRun['end'] = 'time';
  private goal: { got: number; need: number } | null = null;
  private sealedT = 0;
  private learned = new Set<string>();
  /** what he has been told (takeIn), for the report */
  knows(what: string): boolean {
    return this.learned.has(what);
  }
  /** where he started (the report's "first" trap is the nearest to it) */
  start = { x: 0 };
  // ── a tier bot's own state (R-165.59; KID and ADULT never touch it) ──
  /** how he takes the next edge: where he presses (px before the lip), and run / late (walk off, then press) / stand (stop, then press) */
  private edge: { aim: number; how: 'run' | 'late' | 'stand'; stand: number; late: number; read?: boolean } | null = null;
  /** walking off for a late press, the way he goes */
  private lateArmed: { dir: -1 | 1; t: number; here: Platform | null } | null = null;
  /** stopped at an edge to jump from standing: till when he stands (-1: still slowing) */
  private standing: { dir: -1 | 1; until: number } | null = null;
  /** the steering rhythm: the direction held till, then let go till */
  private steerUntil = -1;
  private gapUntil = -1;
  /** each double's second press, ms after the first (the profiles' secondPressDelayMs) */
  readonly secondPressMs: number[] = [];
  /** the furthest right he got (px) */
  maxX = -Infinity;
  /** the stage's travel, and the furthest on he got along it (px: x in a run, y in a climb or a way down) */
  readonly mode: StageMode;
  farOn = NaN;
  /** where he was every 15 frames (0.5 s) */
  readonly xTrace: number[] = [];
  /** the same loss at one spot this many times and he is put past it: 3 for KID and ADULT; a tier bot is a player, who tries again (8, a
   *  stop for a spot he cannot pass, counted as a rescue) */
  private get tries3(): number {
    return this.who.holdQ ? 8 : 3;
  }
  /** the ledge he is walking off the far end of, away from its mushroom, and which way */
  private dropOff: { id: number; dir: -1 | 1; t: number } | null = null;
  /** the jump coming is for a way on over his head: read as a climb, steered to this x */
  private climbJump = false;
  private climbToX: number | null = null;
  /** when he was last put back (a tier bot does not read the set-back's stillness as being stopped dead) */
  private backAt = -Infinity;

  constructor(readonly id: string, readonly seed: number, readonly who: FirstTimer, readonly opts: RunOptions = {}) {
    this.r = rng(seed * 7919 + (opts.trial ?? 0) * 104723 + salt(who, 1, 2));
    this.sim = new RealPlay(id, seed);
    if (opts.realInput) this.sim.useRealInput(opts.realInput === true ? undefined : opts.realInput);
    this.start = { x: this.sim.p.x };
    this.mode = MODES[this.sim.stage.config.travel ?? 'right'];
    this.sim.safe = false;
    for (const k of opts.knows ?? []) this.learned.add(k);
    const e = (this.e = this.sim.e as Eng);
    // the engine's own lessons, stuck help and camera (the harness turns them off)
    for (const m of ['lessonTick', 'watchForStuck', 'updateCamera']) delete e[m];
    // a phone held sideways (or upright)
    const vw = opts.portrait ? PHONE.h : PHONE.w, vh = opts.portrait ? PHONE.w : PHONE.h;
    const c = e.canvas;
    c.getBoundingClientRect = () => ({ width: vw, height: vh, left: 0, top: 0 });
    e.resizeCanvas();
    this.dot = new DotShadow(id, !!opts.dotSetting);
    e.callbacks.onGuide = (text: string, s: number, passed?: boolean, o?: { teach?: true; lock?: true }) => this.dot.engine(text, s, passed, o);
    e.callbacks.onLesson = (lid: LessonId) => this.dot.lesson(lid, !!(this.sim.p.climbing || this.sim.p.isVineSwinging || this.sim.p.hanging));
    e.callbacks.onProgressUpdate = (cur: number, target: number) => {
      this.goal = { got: cur, need: target };
    };
    // real harm: hits and lives, with what did it
    e.damagePlayer = (amount: number, fromX?: number) => {
      const hp = this.sim.p.hp;
      const cause = this.causeNow();
      proto.damagePlayer.call(e, amount, fromX);
      if (this.sim.p.hp < hp) {
        this.lastCause = cause.cause;
        const h: Harm = { kind: 'hit', t: this.sim.t, x: this.sim.p.x, y: this.sim.p.y, cause: cause.cause, onScreen: cause.onScreen, hiding: this.hiding };
        if (cause.cause === 'watcher') {
          h.bush = this.bushNear();
          h.pass = this.e.watch?.passes;
        }
        this.harms.push(h);
      }
    };
    e.loseLife = (reason: 'water' | 'pit' | 'hurt') => {
      const p = this.sim.p;
      this.harms.push({ kind: 'life', t: this.sim.t, x: p.x, y: p.y, cause: reason === 'hurt' ? this.lastCause : reason, onScreen: null });
      const j = this.jump;
      if (j) this.tries.push({ x: j.x, y: j.y, dir: j.dir, t0: j.t0, t1: this.t, kind: j.kind, ok: false, hurt: true, running: j.running, hold: j.hold });
      if (TRACE) process.stderr.write(`  ${this.t.toFixed(2)} ${j ? `${j.kind} from ${Math.round(j.x)},${Math.round(j.y)} hold ${j.hold.toFixed(2)}${j.d2 >= 0 ? ` d2 ${j.d2.toFixed(2)} 2nd ${j.pressed2}` : ''} run ${j.running}` : `no jump, ground ${Math.round(this.ground.x)},${Math.round(this.ground.y)}`} -> LIFE LOST\n`);
      const deaths = this.mem.died(this.ground.x, this.ground.y);
      if (!this.whatAt.some((w) => Math.abs(w.x - this.ground.x) < 60 && Math.abs(w.y - this.ground.y) < 30)) {
        this.whatAt.push({ x: this.ground.x, y: this.ground.y, what: `${reason === 'water' ? 'drowned' : reason === 'pit' ? 'fell' : 'lost a life'} going on from here`, step: null, dip: null, puzzle: false });
      }
      const best = this.prog.best;
      proto.loseLife.call(e, reason);
      this.respawned();
      if (deaths >= this.tries3 && this.prog.best <= best) {
        // (the same death three times: it is noted as a loop, and he is put past it, so the rest of the stage is played)
        this.prog.hi = Math.max(this.prog.hi, this.progAt(p.x, p.y));
        if (!this.rescue()) this.end = 'stranded';
      }
    };
    if (typeof proto.softFall === 'function') {
      e.softFall = () => {
        const p = this.sim.p;
        const at = { t: this.sim.t, x: p.x, y: p.y };
        const best = this.prog.best;
        if (!proto.softFall.call(e)) return false;
        this.softFalls.push(at);
        const j = this.jump;
        if (j) this.tries.push({ x: j.x, y: j.y, dir: j.dir, t0: j.t0, t1: this.t, kind: j.kind, ok: false, hurt: true, running: j.running, hold: j.hold });
        if (TRACE) process.stderr.write(`  ${this.t.toFixed(2)} ${j ? `${j.kind} from ${Math.round(j.x)},${Math.round(j.y)} hold ${j.hold.toFixed(2)}${j.d2 >= 0 ? ` d2 ${j.d2.toFixed(2)} 2nd ${j.pressed2}` : ''} run ${j.running}` : `no jump, ground ${Math.round(this.ground.x)},${Math.round(this.ground.y)}`} -> PUT BACK\n`);
        const deaths = this.mem.died(this.ground.x, this.ground.y);
        this.respawned();
        if (deaths >= this.tries3 && this.prog.best <= best) {
          this.prog.hi = Math.max(this.prog.hi, this.progAt(p.x, p.y));
          if (!this.rescue()) this.end = 'stranded';
        }
        return true;
      };
    }
    let pts = opts.route;
    const st = this.sim.stage as Stage;
    this.direct = Math.hypot((st.exitTotemX || this.sim.p.x) - this.sim.p.x, (st.exitTotemY ?? this.sim.p.y) - this.sim.p.y);
    if (!pts) {
      let route = findRoute(st, [], { spurs: PAD_SKILL.outBack });
      // (the engine's own copy of a stage with puzzle rooms or Dot's pulley is changed as it loads, and the check cannot follow it: the
      // route is then traced on the stage as built, the same roll and setting, as the inspector traces it, round 5 2026-10-29)
      // (a tower the inspector cannot trace: the stage's own laid route, each turn's climb where its vine stands (towerRoute.ts), before
      // any rebuild: buildRoll's roll of a LISTED tower is not the proven variant he plays, and its route led him under the storey
      // above to dither (1-4 seed 1: 'the way on is 123 px up' at a vine he never walked to; INT-4 11-13))
      const tower = route.traced === 'failed' ? towerRoutePts(st, this.sim.p) : null;
      this.onTower = !!tower;
      if (route.traced === 'failed' && !tower) route = findRoute(buildRoll(levelConfig(this.id), this.seed, this.who.setting === 'easy'), [], { spurs: PAD_SKILL.outBack });
      pts = tower ?? (route.traced === 'failed' ? [] : sampleRoute(route).map((s) => ({ x: s.x, y: s.y, ...(s.seg.kind === 'rope' ? { rope: true } : {}) })));
      // (no route the inspector can trace: the straight line from the spawn to the shrine gives him a way to head, and the run is marked)
      if (!pts.length && st.exitTotemX) {
        this.noRoute = true;
        const a = { x: this.sim.p.x, y: this.sim.p.y }, b = { x: st.exitTotemX, y: st.exitTotemY ?? a.y };
        const n = Math.max(2, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 24));
        pts = Array.from({ length: n + 1 }, (_, i) => ({ x: a.x + ((b.x - a.x) * i) / n, y: a.y + ((b.y - a.y) * i) / n }));
      }
      if (route.traced !== 'failed' && this.direct > 0) this.routeRatio = +(route.segs.reduce((a, g) => a + Math.hypot(g.x1 - g.x0, g.y1 - g.y0), 0) / this.direct).toFixed(2);
    }
    this.prog = new Progress(pts);
    // (each spur's dead-end stone on his way is a pin: he stands at it before the way back counts, OUT-AND-BACK)
    if (PAD_SKILL.outBack) {
      for (const r of st.rivers ?? []) {
        if (!r.spur) continue;
        const i = pts.findIndex((q) => Math.abs(q.x - r.spur!.x) < 30 && Math.abs(q.y - r.spur!.y) < 14);
        if (i >= 0) this.prog.pins.push(i);
      }
      this.prog.pins.sort((a, b) => a - b);
    }
    this.prog.relocate(this.sim.p);
    this.lastX = this.sim.p.x;
    this.lastY = this.sim.p.y;
  }

  private respawned() {
    this.backAt = this.t;
    this.dropOff = null;
    this.edge = null;
    this.lateArmed = null;
    this.standing = null;
    this.padPause = null;
    this.pending = null;
    this.punchAt = null;
    this.jump = null;
    this.airFrom = null;
    this.blockedT = 0;
    this.hideFrom = -1;
    this.prog.relocate(this.sim.p);
    this.closeStuck(false);
  }

  get t(): number {
    return this.sim.t;
  }

  /** what is hurting him right now, and whether it is on the screen */
  private causeNow(): { cause: string; onScreen: boolean | null } {
    const e = this.e, p = this.sim.p, cam = e.camera;
    const on = (x: number, y: number) => x >= cam.x - 10 && x <= cam.x + cam.viewportWidth + 10 && y >= cam.y - 40 && y <= cam.y + cam.viewportHeight + 40;
    if (e.proto?.watch && e.watch?.seen && e.watch.phase === 'pass') {
      const from = e.watchFrom as Pt | undefined;
      return { cause: 'watcher', onScreen: from ? on(from.x, from.y) : null };
    }
    // (a cast animal in its act whose box is on him: the kit's eagle dives from its eye or its post, often more than 160 px from where the
    //  nearest-foe rule below looks, so its hits were counted 'other': ENG-WATCH, eagleGlance.test.ts holds the count)
    for (const m of (e.cast?.members ?? []) as any[]) if (m.s.phase === 'act' && touches(hurt(m.def, m.s), p, 20, 52)) return { cause: `foe:${m.e.type}`, onScreen: on(m.e.x, m.e.y) };
    let best: { e: any; d: number } | null = null;
    for (const m of e.enemies as any[]) {
      if (m.defeated) continue;
      const d = Math.hypot(m.x - p.x, (m.y ?? p.y) - p.y);
      if (d < 160 && (!best || d < best.d)) best = { e: m, d };
    }
    if (best) return { cause: `foe:${best.e.type}`, onScreen: on(best.e.x, best.e.y) };
    for (const h of e.hazards as any[]) if (Math.hypot(h.x - p.x, h.y - p.y) < 120) return { cause: `hazard:${h.type ?? 'thing'}`, onScreen: on(h.x, h.y) };
    for (const r of e.proto?.w4?.rocks ?? []) if (Math.abs(r.x - p.x) < 140) return { cause: 'rock', onScreen: on(r.x, p.y) };
    // (World 3's thorn vines: a lash within its reach, LV-14)
    for (const v of e.proto?.thorns ?? []) if (Math.abs(v.x - p.x) < v.reach + 80) return { cause: 'thorn', onScreen: on(v.x, v.bud) };
    if (e.w5) return { cause: 'silk', onScreen: true };
    return { cause: 'other', onScreen: null };
  }

  // ── looking at the ground ──

  private solid(q: Platform) {
    return !q.broken;
  }
  /** a floor under x near his feet (from a little above to `down` px below) */
  /**
   * The jump for the edge ahead: a double where he failed before (SpotMemory), and once Dot's double-jump tip has been on screen for his
   * read time (takeIn: learned 'double'), a double at a gap wider than one jump on his setting (Easy: a thumb that lets go at about 70%).
   * Before this the bot never doubled at a gap it had not missed, so a tip teaching the second jump could not change what it did.
   */
  private jumpFor(p: { x: number; y: number }, dir: -1 | 0 | 1, here: Platform | null): 'single' | 'double' {
    const plan = this.mem.plan(p.x, p.y);
    if (plan === 'double' || !(this.learned.has('double') || this.who.knowsDouble) || !here || dir === 0) return plan;
    const edgeX = dir > 0 ? here.x + here.width : here.x;
    let gap = Infinity;
    for (const q of this.sim.platforms) {
      if (q.broken || q === here || Math.abs(q.y - here.y) > 40) continue;
      const d = dir > 0 ? q.x - edgeX : edgeX - (q.x + q.width);
      // (a piece that starts at the edge itself carries the same ground on: not across a gap)
      if (d >= 5 && d < gap) gap = d;
    }
    const one = this.who.setting === 'easy' ? reachJumpHeld(0, false) : reachJump(0, false);
    if (gap > one && gap < 600) return 'double';
    // (a tier bot reads a step up as well: the next ledge ahead over a single jump's height (about 108 px; 90 with his margin) gets a double)
    return this.who.knowsDouble && this.stepUp(here, dir) ? 'double' : 'single';
  }

  /** a tier bot's read of a step up: a ledge ahead of the edge of `here` (within 260 px) over a single jump's height (90 px with margin) */
  private stepUp(here: Platform, dir: -1 | 1): boolean {
    const edgeX = dir > 0 ? here.x + here.width : here.x;
    for (const q of this.sim.platforms) {
      if (q.broken || q === here || q.type === 'bouncy') continue;
      const d = dir > 0 ? q.x - edgeX : edgeX - (q.x + q.width);
      // (from 150 px back over his own ground: a block standing on it, against his face, counts as well as a ledge past its end)
      if (d > -150 && d < 260 && here.y - q.y > 90 && here.y - q.y < 260) return true;
    }
    return false;
  }

  floorAt(x: number, y: number, down = 40): Platform | null {
    // (a top under the water is no floor to him: a cage's lift resting in its pool, 10 px under the surface, round 5 2-8, read as a
    // step down and was walked onto, a drowning, again and again; a person sees it is under water)
    const river = (this.sim.stage.rivers ?? []).find((r) => x > r.x0 && x < r.x1);
    for (const q of this.sim.platforms) {
      if (!this.solid(q)) continue;
      if (river && q.type !== 'drift' && q.y > river.surfaceY) continue;
      if (x >= q.x && x <= q.x + q.width && q.y >= y - 6 && q.y <= y + down) return q;
    }
    return null;
  }
  /** the face just in front of him (its height over his feet), or null */
  faceAhead(dir: -1 | 1, reach = 40): number | null {
    const p = this.sim.p;
    let best: number | null = null;
    for (const q of this.sim.platforms) {
      if (!this.solid(q) || q.type !== 'solid') continue;
      const near = dir > 0 ? q.x - (p.x + 22) : p.x - 22 - (q.x + q.width);
      if (near < -4 || near > reach) continue;
      if (q.y < p.y - 8 && q.y > p.y - 1200 && q.y + q.height > p.y - 4) {
        const h = p.y - q.y;
        if (best === null || h < best) best = h;
      }
    }
    return best;
  }
  /** how deep the dip he stands in is: the lower of the floors either side over him (px), or null */
  dipHere(): number | null {
    const p = this.sim.p;
    const top = (x: number) => {
      let y: number | null = null;
      for (const q of this.sim.platforms) if (this.solid(q) && x >= q.x && x <= q.x + q.width && q.y < p.y - 12 && q.y > p.y - 420) y = y === null ? q.y : Math.max(y, q.y);
      return y;
    };
    const l = top(p.x - 110), r = top(p.x + 110);
    if (l === null || r === null) return null;
    return Math.round(p.y - Math.max(l, r));
  }

  /**
   * Coming down over a small ledge or pad (under 220 px across), past its near quarter: he lets go of the steer to land on it (the
   * research's Channel 2: the lift-off then comes late, thumbify, so he may still run off its far side)
   */
  /** over a small landing, falling to it: 1 near its middle (let go of the steer), 2 past it (steer back), 0 not over one */
  private overSmall(dir: -1 | 0 | 1): 0 | 1 | 2 {
    const p = this.sim.p;
    // (on a tower's stair of short steps he is already over the next step on the way up: he lets go there, as a thumb does, not at the
    // top of the arc; waiting for the fall carried him off a 100 px rotten step's far end at a run (1-4's crown, POLISH-1 11-13))
    const rising = p.vy < -60;
    if (dir === 0 || (rising && !this.onTower)) return 0;
    // (rising, only a step higher than the one he jumped from: the step under his take-off is behind him)
    const from = this.airFrom?.y ?? p.y;
    for (const q of this.sim.platforms) {
      if (q.broken || q.width >= 220 || p.x < q.x || p.x > q.x + q.width || q.y < p.y - 2 || q.y > p.y + 140) continue;
      if (rising && q.y > from - 20) continue;
      // (a tier bot does not aim to land on a bounce mushroom: on w1-twin-mushroom-fork he steered back onto one until rescued)
      if (this.who.holdQ && q.type === 'bouncy') continue;
      const past = dir * (p.x - (q.x + q.width / 2));
      if (past > q.width * 0.15) return 2;
      if (past > -q.width * 0.25) return 1;
    }
    return 0;
  }

  /** how far the nearest bush at his level is (px), or null */
  bushNear(): number | null {
    const p = this.sim.p;
    let d: number | null = null;
    for (const b of this.e.proto?.bushes ?? []) {
      if (b.secret || b.hanging || Math.abs(b.y - this.ground.y) > 14) continue;
      const dd = Math.max(0, Math.abs(b.x + b.w / 2 - this.ground.x) - b.w / 2);
      if (d === null || dd < d) d = Math.round(dd);
    }
    return d;
  }

  /** what is at a spot, in words */
  describe(dir: -1 | 1): { what: string; step: number | null; dip: number | null; puzzle: boolean } {
    const p = this.sim.p, e = this.e;
    const step = this.faceAhead(dir, 60);
    const dip = this.dipHere();
    const parts: string[] = [];
    const puzzle = this.nearPuzzle(p.x, 220);
    if (puzzle) parts.push(puzzle);
    if (step !== null) parts.push(`a ${Math.round(step)} px ${step <= 75 ? 'waist-high step' : step <= 110 ? 'chest-high step' : 'wall'} ahead`);
    if (dip !== null) parts.push(`in a dip ${dip} px deep`);
    if (!this.floorAt(p.x + dir * 50, p.y, 40)) {
      let top: number | null = null;
      for (const q of this.sim.platforms) if (this.solid(q) && p.x + dir * 70 >= q.x && p.x + dir * 70 <= q.x + q.width && q.y > p.y + 30 && q.y < p.y + 500) top = top === null ? q.y : Math.min(top, q.y);
      parts.push(top === null ? 'an open drop ahead' : `a drop of ${Math.round(top - p.y)} px ahead`);
    }
    const st = this.sim.stage as any;
    const river = (st.rivers ?? []).find((rv: any) => p.x + dir * 120 > rv.x0 && p.x + dir * 120 < rv.x1);
    if (river) parts.push('water ahead');
    const foe = (e.enemies as any[]).find((m) => !m.defeated && Math.abs(m.x - p.x) < 200 && Math.abs(m.y - p.y) < 160);
    if (foe) parts.push(`a ${foe.type} near`);
    if (e.nearTreeVine) parts.push('a trunk beside him');
    if (this.sealed()) parts.push('the sealed shrine');
    const on = this.prog.target(p, 120);
    if (on && on.y < p.y - 60) parts.push(`the way on is ${Math.round(p.y - on.y)} px up`);
    else if (on && on.y > p.y + 60) parts.push(`the way on is ${Math.round(on.y - p.y)} px down`);
    if (p.hanging) parts.push('on a rope');
    if (p.climbing) parts.push('on a trunk');
    if (!parts.length) parts.push(p.grounded ? 'nothing in the way the bot can see' : 'in the air');
    return { what: parts.join(', '), step: step === null ? null : Math.round(step), dip, puzzle: !!puzzle };
  }

  /**
   * Fallen into a pit whose far wall is over any jump (1-6's moss pits under a liana: the far bank 225 px up, the pit's stair of 56 px
   * steps back up to the bank he swung from), he turns round and climbs back to the ledge the route left from, as a person does, and
   * tries the way on again (BUILD-16c, the lead's 11:43 AM ET ruling 11-14: he walked into the far wall until the 20 s rescue, so every
   * run read "rescued"). Only when he stands off the route, under it, with the way on over a double's rise (DOUBLE_RISE), and the way up
   * he can walk and hop (pitWayUp) starts back the other way: a dip he can hop out of forward is left forward, by the steer as before.
   * Returns the way to head (0: not climbing back).
   */
  /** the vine snake on liana `id` (`len` px) as the screen shows it now, if it is coming at his hands (`swingLength` px down): 'up' when
   *  it comes up from the foot under them (he climbs high), 'down' when it comes down from the anchor over them (he slides low); null
   *  when none shows or it is past him. Read from the snake piece's own place this step (vineSnakePiece.ts now[i]): what he can see */
  private snakeAhead(id: number, len: number, swingLength: number): 'up' | 'down' | null {
    const piece = ((this.e as unknown as { pieces?: Array<{ kind: string; vines?: Array<{ id: number }>; now?: SnakeNow[] }> }).pieces ?? []).find((q) => q.kind === 'vine-snake');
    const i = piece?.vines?.findIndex((v) => v.id === id) ?? -1;
    const n = i >= 0 ? piece!.now?.[i] : undefined;
    if (!n || !n.shown) return null;
    const hands = handsAlong(swingLength, len);
    // (its tell: reared at the end it starts from, head onto the vine; its trip: the part of it on the vine, the way its head leads)
    const on = onVine(n, len) ?? { from: n.head, to: n.head };
    if (n.dir < 0 && on.to > hands) return 'up';
    if (n.dir > 0 && on.from < hands) return 'down';
    return null;
  }

  private pitWayBack(tgt: Pt | null): -1 | 0 | 1 {
    const p = this.sim.p;
    const toward = (q: Platform): -1 | 0 | 1 => {
      const x = Math.min(Math.max(p.x, q.x + 24), q.x + q.width - 24);
      return x > p.x + 4 ? 1 : x < p.x - 4 ? -1 : 0;
    };
    const cb = this.climbBack;
    if (cb) {
      // (a liana took him on the way back (its foot swinging back over the stair): the climb back is over and the route steers him on.
      // Kept, he held back on it and leapt back over the gone limb into the pit before, round and round: 1-6's gorge, castBots adult
      // Normal seed 4 and kid seed 3, six rescues each; ENG-16E, R-165.246)
      if (p.isVineSwinging) {
        this.climbBack = null;
        return 0;
      }
      if (p.grounded) {
        const on = this.floorAt(p.x, p.y, 6);
        const k = on ? cb.path.indexOf(on) : -1;
        // (up on the route's ledge, or 20 s gone: the route steers again)
        if (k === cb.path.length - 1 || this.t - cb.t > 20) {
          this.climbBack = null;
          return 0;
        }
        if (k >= 0) cb.dir = toward(cb.path[k + 1]) || cb.dir;
      }
      return cb.dir;
    }
    if (!tgt || !p.grounded || p.climbing || p.hanging || p.isVineSwinging || this.e.nearTreeVine) return 0;
    // (a way on within a double's rise is jumped for, unless it is a swinging liana's foot: that is no ledge, it is there for a moment of
    // its swing, and from a pit floor he jumped at it untimed. 1-6 Normal kid seed 5 under the first liana, its foot 179 px up: seven
    // jumps in 9 s to a rescue, the pit's stair beside him back to the bank he catches it from (ENG-16F, FT_TRACE 10.8-19.6))
    const onLiana = this.sim.vines.some((v) => (v.vineType === 'swing_liana' || v.isSwingingVine) && !v.off && vineAmp(v) > 0.05
      && Math.abs(tgt.x - v.x) <= (v.bottomY - v.topY) * Math.sin(vineAmp(v)) + 40 && tgt.y >= v.topY - 40 && tgt.y <= v.bottomY + 60);
    if (this.prog.off(p) < 120) return 0;
    // (the way the route travels from his place on it, not where its nearest point is: under the far wall that point is straight over him)
    const pts = this.prog.pts, i = this.prog.cur, run = pts[Math.min(i + 10, pts.length - 1)].x - pts[Math.max(i - 10, 0)].x;
    const ahead = run >= 0 ? 1 : -1;
    // (out of reach forward: the way on over a double's rise, OR the face in front of him over one. 1-7's SHORT liana pit is 179 px under
    //  the bank, so the route over it is inside a double, but its far wall is the perch 80 px over the bank: 259 px, and he stood facing
    //  it until the rescue (BUILD-17, 1-7 Easy seed 11; pitClimb.test.ts "shallow pit"))
    const face = this.faceAhead(ahead, 60);
    if (!onLiana && tgt.y > p.y - (DOUBLE_RISE + 10) && !(face !== null && face > DOUBLE_RISE + 10)) return 0;
    const from = this.floorAt(p.x, p.y, 6);
    const path = from ? this.pitWayUp(from) : null;
    if (!path) return 0;
    const dir = toward(path[1]);
    // (a climb that heads the way on is left to the steer, unless it climbs to a liana ahead: from the pit under the first liana the way
    // up to the next one runs forward under the crumbled limb, and the steer walked him into the far wall for 20 s; ENG-16I)
    if (dir === 0 || (dir === ahead && path[path.length - 1] !== this.catchAhead)) return 0;
    // (the same pit `tries3` times, no further on: a loop, as the same fall three times is (fallBacks); he is put past it)
    const n = (this.pitFalls.get(from!) ?? 0) + 1;
    this.pitFalls.set(from!, n);
    if (n >= this.tries3) {
      this.pitFalls.delete(from!);
      this.stuck.push({ x: Math.round(p.x), y: Math.round(p.y), t: +this.t.toFixed(1), dur: 0, what: `fell into this pit ${n} times (its far wall ${Math.round(p.y - tgt.y)} px up)`, step: null, dip: null, puzzle: false, rescued: true });
      if (!this.rescue()) this.end = 'stranded';
      return 0;
    }
    this.climbBacks++;
    this.climbBack = { path, dir, t: this.t };
    // (fallen short off a liana, a few seconds ago: next time he hangs low, as a person tries the grip Dot showed)
    if (this.t - this.letGoAt < 5) this.learned.add('low');
    return dir;
  }

  /**
   * On a liana, the way on is the first route point past that liana's own swing (ENG-16F, R-165.246). A route point ON its swing (where
   * the route caught it, or a cut liana hanging inside it) passed under him as it swung him on, so the steer turned him back at the forward
   * end and the let-go went out facing back with no leap: 1-6 Normal kid seed 6, the gorge's first liana, its route point the cut liana's
   * foot 85 px behind the anchor (FT_FRAMES 247.5-248.4): he fell into the pit short of the creaky limb, twice, to a rescue. A person on a
   * liana looks at where it is taking him.
   */
  private pastLiana(p: PlayerState): Pt | null {
    const own = this.sim.vines.find((q) => q.id === p.swingVineId);
    if (!own) return this.prog.target(p);
    const reach = (own.bottomY - own.topY) * Math.sin(Math.max(vineAmp(own), 0.1)) + 40;
    const on = (q: Pt) => Math.abs(q.x - own.x) <= reach && q.y <= own.bottomY + 60 && q.y >= own.topY - 40;
    const pts = this.prog.pts;
    // (where the route crosses this liana, from his place on the route on: a liana the route does not cross steers as before)
    let i = this.prog.cur;
    while (i < pts.length && !on(pts[i])) i++;
    if (i >= pts.length) return this.prog.target(p);
    for (; i < pts.length; i++) if (!on(pts[i])) return pts[i];
    return this.prog.target(p);
  }

  /**
   * Near the end of his ledge with a liana on the way ahead to catch, the catch is his own act (null: not here, the steer as before; {}:
   * stand and watch it swing; a press). A liana swings itself (physics.ts, the self-swing), its foot 180 px either way, so a jump at it
   * as it swings away falls short into the pit under it (the kid's short flick, 1-6 Easy seed 1: three misses, no grab, BUILD-16c). He
   * flies the hop he can make from where he stands, as the engine flies it (hopCatches: airStep, his own flick's hold, the engine's cut),
   * after his thumb's lag, and presses when the engine's own catch (canGrabSwing on the vines' clock) takes him on the way; the hop is
   * held toward the liana (Jump.liana: never steered back onto a small landing below). A liana no moment of whose swing his hop from
   * here catches: on to the lip, then the steer's own jump. 4 s is the most he waits. Measured on 1-6 seeds 1-6: these hops catch 99%
   * (adult) and 85-89% (kid) of the time.
   */
  /** the press he makes, held (s): his own hold, and on the phone's touch layer never under its minimum (RunOptions.realInput) */
  private pressHold(): number {
    const own = this.who.hold[0];
    const real = this.opts.realInput;
    return real ? Math.max(own, (real === true ? MIN_TOUCH_JUMP_HOLD_MS : real) / 1000) : own;
  }

  /**
   * SKILLS.dropOnLog: on liana `v`, hung over a log river, would a let-go now (after his thumb's lag) MISS the logs? Read as the engine
   * plays it: the swing where it will be on the vines' clock, its leap (timedLaunch), the air tick with the engine's turn (airStep), the
   * logs where they will be on their own clock as his feet come down through their top inside the river's window (margin 12 px in from a
   * log's end); past the water on the far bank is a landing too. Not over a log river: never waits.
   */
  private dropWaits(v: Vine, dir: -1 | 1, t: number): boolean {
    const rivers = this.sim.stage.rivers ?? [];
    const r = rivers.find((q) => q.speed > 0 && !q.open && lianasOver([v], q).length);
    if (!r) return false;
    const logs = this.sim.platforms.filter((q) => q.type === 'drift' && q.drift && q.drift.x0 === r.x0 && q.drift.x1 === r.x1 && !q.broken);
    if (!logs.length) return false;
    // (his press comes after his thumb's lag, drawn about thumb[0] (decide): he lets go only when the press lands at the lag's middle and
    //  half a spread either side, as a person aims for the middle of the moment, never its edge)
    const [mid, sd] = this.who.thumb;
    return [mid, Math.max(0, mid - sd / 2), mid + sd / 2].some((lag) => this.dropMisses(v, dir, t, lag, r, logs, rivers));
  }

  /** the drifting log `q` is on a river with a liana hung over it (ENG-24's skills' ground) */
  private lianaRiver(q: Platform): boolean {
    return !!q.drift && (this.sim.stage.rivers ?? []).some((r) => r.speed > 0 && r.x0 === q.drift!.x0 && lianasOver(this.sim.vines, r).length);
  }

  /** liana `v` hangs over a log river with logs on it (SKILLS.dropOnLog's ground) */
  private overLogs(v: Vine): boolean {
    return (this.sim.stage.rivers ?? []).some((q) => q.speed > 0 && !q.open && lianasOver([v], q).length && this.sim.platforms.some((d) => d.type === 'drift' && d.drift?.x0 === q.x0));
  }

  /** does a let-go of liana `v` pressed `lag` s from now miss the logs of river `r` (dropWaits)? The press as the engine plays it: the
   *  let-go of that moment of the swing at his grip (physics.ts pressLaunches: the sweet spot's leap, a press a beat late leaping from the
   *  sweet spot, a beat early waiting for it), the one gen2's drop judge flies (riverLay lianaDrops) */
  private dropMisses(v: Vine, dir: -1 | 1, t: number, lag: number, r: RiverZone, logs: readonly Platform[], rivers: readonly RiverZone[]): boolean {
    const clock = (this.e as unknown as { vineClock: number }).vineClock;
    const p = this.sim.p;
    const vlen = v.bottomY - v.topY;
    const grip = Math.min(1, (p.swingLength ?? vlen) / vlen);
    const key = `${v.id}:${grip.toFixed(2)}:${vinePeriod(v)}`;
    let L = this.launches.get(key);
    if (!L) this.launches.set(key, (L = pressLaunches(v, grip)));
    const P = vinePeriod(v), mod = (x: number) => ((x % P) + P) % P, ph = mod(clock + lag);
    let l = L[0];
    for (const q of L) if (Math.min(Math.abs(mod(q.pt) - ph), P - Math.abs(mod(q.pt) - ph)) < Math.min(Math.abs(mod(l.pt) - ph), P - Math.abs(mod(l.pt) - ph))) l = q;
    if (dir < 0) return true;
    const b = { x: l.x, y: l.y, vx: l.vx, vy: l.vy };
    // (flown as the drop judge flies it, the jump held: a flick lands the same within a point, swingLog.ts)
    const top = logs[0].y, bankTop = top - LOG_DROP;
    const leaves = t + lag + (l.t - l.pt);
    for (let i = 1; i < 90; i++) {
      const prev = b.y;
      airStep(b, DT, dir, true, true);
      if (b.vy < 0) continue;
      const inWindow = b.x >= r.x0 && b.x <= r.x1;
      // (the far bank: his middle well onto it, 16 px past its lip; one just past the lip met the bank's face and fell, catch toy v3)
      if (!inWindow && prev <= bankTop + 14 && b.y >= bankTop) return b.x < r.x1 + 16;
      if (inWindow && prev <= top + DRIFT_CATCH.drop && b.y >= top) {
        const at = leaves + i * DT;
        return !logs.some((q) => { const x = floatAt(rivers, q)(at); return b.x > x + 12 && b.x < x + q.width - 12; });
      }
      if (b.y > top + 60) return true;
    }
    return true;
  }

  /**
   * SKILLS.vineFromLog: standing on a drifting log under a liana hung over its river ahead (never the one he just left), does a jump now
   * (after his thumb's lag, the log's carry his) catch it where it will be? Then the press.
   */
  private vineFromLog(p: RealPlay['p'], dir: -1 | 1, t: number): Pad | null {
    if (!p.grounded) return null;
    const here = this.sim.platforms.find((q) => q.id === this.sim.standingOn);
    if (!here?.drift) return null;
    const d = here.drift;
    const v = this.sim.vines.find((q) => (q.vineType === 'swing_liana' || q.isSwingingVine) && !q.off && q.id !== this.swungOn && q.x > d.x0 && q.x < d.x1
      && dir * (q.x - p.x) > -30 && dir * (q.x - p.x) < 420);
    if (!v) return null;
    const rivers = this.sim.stage.rivers;
    const carry = ((floatAt(rivers, here)(t + DT) - floatAt(rivers, here)(t)) / DT) * RIDE.keep.x;
    const clock = (this.e as unknown as { vineClock: number }).vineClock;
    // (the press after his thumb's lag, drawn about thumb[0] (decide): it must catch at the lag's middle and half a spread either side,
    //  as dropWaits aims; a press at the middle alone missed it on the catch toy, middle Normal variant 5)
    const [mid, sd] = this.who.thumb;
    const hold = this.pressHold();
    // (and taken off while still on the log: walking on as the press came, he stepped off its front end into the water, catch toy v3)
    // (he stands while the press comes (pending.still): flown from where the log carries him, at his speed now and at a stand)
    const catches = (lag: number) => [p.vx, 0].every((vx) => {
      const x = p.x + (vx + carry) * lag, lx = floatAt(rivers, here)(t + lag);
      return x > lx + 10 && x < lx + here.width - 10 && hopCatches(v, x, p.y, dir, hold, clock + lag, vx + carry);
    });
    if (![mid, Math.max(0, mid - sd / 2), mid + sd / 2].every(catches)) return null;
    const out = this.decide(dir, 'single', true, {});
    if (this.pending) this.pending.still = true;
    return out;
  }

  private lianaWait(dir: -1 | 1): Pad | null {
    const p = this.sim.p;
    const here = p.grounded ? this.floorAt(p.x, p.y, 6) : null;
    // (never off a drifting log under a liana over its river: its front end is no ledge to wait at (it moves), and a vine from a log is
    //  SKILLS.vineFromLog's (ENG-24))
    if (SKILLS.vineFromLog && here?.drift && this.lianaRiver(here)) return null;
    const edgeX = here ? (dir > 0 ? here.x + here.width : here.x) : NaN;
    // (160 px out: from a run he slides about 75 px once the steer is let go, and from 70 px he slid off the lip, BUILD-16c's toy)
    const dist = here ? dir * (edgeX - p.x) : Infinity;
    const near = here && dist < 160 && !this.floorAt(edgeX + dir * 24, p.y, 40);
    const pts = this.prog.pts;
    const v = near
      ? this.sim.vines.find((q) => (q.vineType === 'swing_liana' || q.isSwingingVine) && !q.off && dir * (q.x - edgeX) > -40 && dir * (q.x - edgeX) < 360
        && q.bottomY >= p.y - 140 && q.topY < p.y - 100 && pts.some((r) => Math.abs(r.x - q.x) < 60 && r.y >= q.topY && r.y <= q.bottomY + 60))
      : undefined;
    if (!v || this.lianaWaitT > 4) {
      if (!near) this.lianaWaitT = 0;
      return null;
    }
    const clock = (this.e as unknown as { vineClock: number }).vineClock;
    const lag = this.who.thumb[0];
    const hold = this.who.hold[0];
    // (the hop he can make from where the press lands, after his thumb's lag: does the engine's catch take him on the way? KID and
    // ADULT never let go of a held steer (thumbify, R-165.59), so they cannot stand and wait: on the run, the press is the only choice,
    // and they keep running to the lip unless it is now)
    const from = (x: number, t0: number) => hopCatches(v, x, p.y, dir, hold, t0, p.vx);
    const takeoff = p.x + p.vx * lag;
    if (dir * (edgeX - takeoff) >= 0 && from(takeoff, clock + lag)) {
      this.lianaWaitT = 0;
      this.lianaHop = true;
      return this.decide(dir, 'single', true, {});
    }
    if (!this.who.holdQ) return dist > 20 ? side1(dir) : null;
    const per = vinePeriod(v);
    let any = false;
    for (let i = 0; i < 24 && !any; i++) any = from(p.x, clock + (per * i) / 24);
    if (!any) {
      // (no moment of its swing is caught from here: on toward the lip, a step at a time from a stand (braking between), and from the
      // lip the steer's own jump)
      if (dist <= 30) return null;
      return Math.abs(p.vx) < 60 ? side1(dir) : {};
    }
    this.lianaWaitT += DT;
    return {};
  }

  /**
   * The way up out of a pit over the stage's ledges, with plain hops only (a step up to JUMP_RISE - 8 px, a step down, a gap of 90 px or
   * less), from the ledge he stands on to the nearest ledge higher than it that the route walks on or that a liana on the route can be
   * caught from: the ledges in order, or null.
   */
  private pitWayUp(from: Platform): Platform[] | null {
    const pts = this.prog.pts;
    const P = this.sim.platforms.filter((q) => !q.broken && q.width >= 40 && q.type !== 'bouncy' && q.type !== 'moving' && q.type !== 'drift' && !q.push && Math.abs(q.x - from.x) < 2400);
    // (back on the way: a ledge the route walks on; failing that (a creaky limb crumbled, 1-6's creaky landing: the pit's stair tops out
    // under the next liana with no bank left), a ledge a liana on the route can be caught from by the hop he makes (hopCatches, at some
    // moment of its swing). The nearest catch ledge first was a low stair step he could not reach the liana from: he jumped, missed and
    // fell back in, three times, rescued (BUILD-16c: most of the Normal kid's pit falls))
    const lianas = this.sim.vines.filter((v) => (v.vineType === 'swing_liana' || v.isSwingingVine) && !v.off)
      .filter((v) => pts.some((r) => Math.abs(r.x - v.x) < 60 && r.y >= v.topY && r.y <= v.bottomY + 60));
    const walked = (q: Platform) => q.y < from.y - 60 && pts.some((r) => r.x >= q.x && r.x <= q.x + q.width && Math.abs(r.y - q.y) < 12);
    // (how many of 24 moments of a liana's swing his hop off the lip catches: he climbs to the ledge it is caught from most often, as a
    // person climbs to the top of a stair under a liana, not the first step that catches it at some moment. 1-6 Normal adult seed 1, the
    // gorge: the second step caught gl2 at 14 of 48 moments, the top one at 29; he hopped from the second three times and was rescued, ENG-16F)
    const catches = (q: Platform, of = lianas) => q.y < from.y - 60 ? Math.max(0, ...of.map((v) => {
      const d: -1 | 1 = v.x >= q.x + q.width / 2 ? 1 : -1;
      const lip = d > 0 ? q.x + q.width - 12 : q.x + 12;
      const per = vinePeriod(v);
      let n = 0;
      for (let i = 0; i < 24; i++) if (hopCatches(v, lip, q.y, d, this.who.hold[0], (per * i) / 24, 0)) n++;
      return n;
    })) : 0;
    const prev = new Map<Platform, Platform>();
    const seen = new Set<Platform>([from]);
    const reached: Platform[] = [];
    let line: Platform[] = [from];
    while (line.length) {
      const next: Platform[] = [];
      for (const a of line) {
        for (const b of P) {
          if (seen.has(b)) continue;
          const rise = a.y - b.y;
          const gap = Math.max(0, b.x - (a.x + a.width), a.x - (b.x + b.width));
          if (rise > JUMP_RISE - 8 || rise < -300 || gap > 90) continue;
          seen.add(b);
          prev.set(b, a);
          reached.push(b);
          next.push(b);
        }
      }
      line = next;
    }
    let goal = reached.find(walked);
    // (a liana further along the route than the one he last swung on, caught from a ledge of this pit at a quarter of its swing or more,
    // beats a walk back to a ledge the route reaches before it: the creaky limb crumbled under him, and since soft-pit floors join under a
    // perch (ENG-16H pitFloorJoin) the pit past it is open to the pit before, so the walk back led him to the first liana again and off the
    // limb again, three times, to a rescue (castBots 1-6 Normal kid 33 of 40, the creaky landing and the gorge; ENG-16I). A person in
    // that pit climbs the stair and jumps for the next liana over its top step (pitClimb.test.ts "crumbled creaky limb")
    const along = (x: number, y0: number, y1: number) => pts.findIndex((r) => Math.abs(r.x - x) < 60 && r.y >= y0 && r.y <= y1 + 60);
    const last = this.sim.vines.find((v) => v.id === this.swungOn);
    const lastAt = last ? along(last.x, last.topY, last.bottomY) : -1;
    if (goal && lastAt >= 0) {
      const goalAt = Math.max(-1, ...pts.map((r, i) => (r.x >= goal!.x && r.x <= goal!.x + goal!.width && Math.abs(r.y - goal!.y) < 12 ? i : -1)));
      const on = lianas.filter((v) => v !== last && along(v.x, v.topY, v.bottomY) > Math.max(lastAt, goalAt));
      let most = 5, ahead: Platform | undefined;
      if (on.length) for (const q of reached) { const n = catches(q, on); if (n > most) { most = n; ahead = q; } }
      if (ahead) goal = ahead;
    }
    this.catchAhead = goal && goal !== reached.find(walked) ? goal : null;
    if (!goal) {
      let most = 0;
      for (const q of reached) {
        const n = catches(q);
        if (n > most) { most = n; goal = q; }
      }
    }
    if (!goal) return null;
    const path = [goal];
    for (let q = prev.get(goal)!; q !== from; q = prev.get(q)!) path.unshift(q);
    path.unshift(from);
    return path;
  }


  /** a puzzle room or a piece Dot teaches near x */
  nearPuzzle(x: number, within: number): string | null {
    const e = this.e;
    for (const room of e.kit?.rooms ?? []) if (x > room.box.x0 - within && x < room.box.x1 + within) return `the puzzle "${room.spec.id.replace(/-\d+$/, '')}"`;
    const w4 = e.proto?.w4;
    for (const k of w4?.knots ?? []) if (x > k.x0 - within && x < k.x1 + within) return "Dot's knot";
    for (const s of w4?.patience ?? []) if (x > s.x0 - within && x < s.x1 + within) return `a still spot (${s.kind})`;
    for (const q of this.sim.platforms as Array<Platform & { pushSaved?: unknown }>) if ((q.push || q.pushSaved) && x > q.x - within && x < q.x + q.width + within) return 'a thing to push';
    for (const m of w4?.monkeys ?? []) if (m.job === 'trade' && Math.abs(m.x - x) < within) return "the capuchin's trade";
    return null;
  }

  private sealed(): boolean {
    const st = this.sim.stage as any;
    const exit = (this.sim.collectibles as any[]).find((c) => c.type === 'exit_totem');
    return !!exit?.isLocked && Math.abs(this.sim.p.x - st.exitTotemX) < 90;
  }

  /** how far the nearest thing a topic is about is from him (null: no such things to measure) */
  private far(topic: TopicId | undefined): boolean | null {
    if (!topic) return null;
    const p = this.sim.p, e = this.e;
    const xs: Pt[] = [];
    const things: Partial<Record<TopicId, () => void>> = {
      vine: () => this.sim.vines.forEach((v) => xs.push({ x: v.x, y: (v.topY + v.bottomY) / 2 })),
      trunk: () => this.sim.vines.forEach((v) => xs.push({ x: v.x, y: (v.topY + v.bottomY) / 2 })),
      rope: () => (this.sim.ropes as any[]).forEach((r) => xs.push({ x: (r.x0 + r.x1) / 2, y: r.y ?? p.y })),
      foe: () => (e.enemies as any[]).forEach((m) => !m.defeated && xs.push(m)),
      bush: () => (e.proto?.bushes ?? []).forEach((b: any) => xs.push({ x: b.x + b.w / 2, y: b.y })),
      puzzle: () => (e.kit?.rooms ?? []).forEach((room: any) => xs.push({ x: (room.box.x0 + room.box.x1) / 2, y: room.box.y1 })),
      petal: () => (this.sim.collectibles as any[]).forEach((c) => !c.collected && (c.type === 'flower' || c.type === 'leaf') && xs.push(c)),
      cage: () => (this.sim.collectibles as any[]).forEach((c) => !c.collected && c.type === 'cage' && xs.push(c)),
      log: () => this.sim.platforms.forEach((q) => q.push && xs.push({ x: q.x + q.width / 2, y: q.y })),
    };
    const f = things[topic];
    if (!f) return null;
    f();
    if (!xs.length) return true;
    let d = Infinity;
    for (const q of xs) d = Math.min(d, Math.hypot(q.x - p.x, (q.y - p.y) * 0.8));
    return d > 400;
  }

  /** what Dot has had on screen long enough for him to take in */
  private takeIn() {
    for (const s of [...this.dot.up(), ...this.dot.shown.slice(-4)]) {
      const upFor = (s.t1 ?? this.t) - s.t0;
      if (upFor < this.who.heed) continue;
      const t = s.text.toLowerCase();
      if (s.move) this.learned.add(s.move);
      // (1-7's words for the kit's eagle are moss and green, held still: 'get into the green and hold still')
      if (/\b(hide|bush|fern|moss|green)\b/.test(t) && /\b(down|slide|hold|duck|into|inside|behind|still)\b/.test(t)) this.learned.add('hide');
      if (/\b(punch|tap)\b/.test(t)) this.learned.add('punch');
      if (/\bkick\b/.test(t)) this.learned.add('kick');
      // (a drop trap, castPlay.ts: told to shake its vine or cut its tendril, or to punch or hit one)
      if (/\b(vine|tendril)s?\b/.test(t) && /\b(shake|cut|punch|hit|pull)\b/.test(t)) this.learned.add('trap');
      if (/\b(glide|leaf)\b/.test(t)) this.learned.add('glide');
      // (World 8's glide line, "Jump twice, then hold to glide": the second jump first, then the glide, at a gap one jump does not cross)
      if (/\bjump twice\b/.test(t)) this.learned.add('double');
      // (1-6's "Hang low, fly far!": a lower grip on a liana throws him further, so he climbs down it before he lets go, swingLow)
      if (/\b(hang|hold on|grip|climb down)\b/.test(t) && /\blow(er)?\b/.test(t)) this.learned.add('low');
      if (/\b(stand still|stay still|keep still|wait (here|for|under|on)|stand (on|under|here))\b/.test(t)) this.learned.add('still');
      // (the freeze in a hunter's rear, 1-9's beat 2: told to freeze or not to move. Never 'hold / keep / stand still': 1-7's hide line
      // and the still spots say those, and a still spot's 'still' is used up at the spot (stillSpot), so the freeze has its own words)
      if (/\b(freeze|frozen|don'?t (move|budge|twitch))\b/.test(t)) this.learned.add('freeze');
    }
  }

  // ── one frame ──

  /** what he means to do this frame (before the thumb's own fumbles) */
  private intend(): Pad {
    const sim = this.sim, p = sim.p, e = this.e, t = this.t, who = this.who;
    // (a spur's dead-end stone stood on: counted, FTRun.spurs)
    if (p.grounded) for (const r of (sim.stage as Stage).rivers ?? []) if (r.spur && Math.abs(p.x - r.spur.x) < 70 && Math.abs(p.y - r.spur.y) < 10) this.spursMet.add(r.x0);
    const tgt = p.isVineSwinging ? this.pastLiana(p) : this.prog.target(p);
    if (p.isVineSwinging && p.swingVineId != null) this.swungOn = p.swingVineId;
    if (this.dropOff && ((p.grounded && e.standingOnId !== this.dropOff.id) || t - this.dropOff.t > 6)) this.dropOff = null;
    // which way: along the route; with no route, right
    let dir: -1 | 0 | 1 = 1;
    let up = false;
    if (tgt) {
      const dx = tgt.x - p.x, dy = tgt.y - p.y;
      dir = dx > 16 ? 1 : dx < -16 ? -1 : 0;
      up = dy < -40;
      // (on a liana the way on is the side its point past the swing lies (pastLiana), never the way he was going: ENG-16H, R-165.246.
      // Back up a pit's stair the way was BACK; caught again, with the perch below him and close across, the rule below kept that way,
      // so he let go at the back end of the swing, into the same pit: 1-6 Normal kid seeds 14, 20 and 21, "fell into this pit 3 times",
      // each let-go on the backswing (f3603 vx -294). pitClimb.test.ts 'a stale way back')
      if (p.isVineSwinging) dir = dx >= 0 ? 1 : -1;
      if (dir === 0) {
        const far = this.prog.target(p, 200);
        if (far) dir = far.x > p.x + 16 ? 1 : far.x < p.x - 16 ? -1 : 0;
      }
      // (the way on is below, close across: he keeps going the way he was until he finds the edge, never turns back for it)
      // (a tier bot heads the way the route goes on from there, not back the way a bounce threw him, which on w1-twin-mushroom-fork put
      // him on the mushroom again and again)
      if (dy > 40 && Math.abs(dx) < 120 && this.way !== 0 && !p.isVineSwinging) {
        const far = who.holdQ ? this.prog.target(p, 240) : null;
        dir = far && Math.abs(far.x - p.x) > 40 ? (far.x > p.x ? 1 : -1) : this.way;
        // (and not over a bounce mushroom on his own ledge: off the other end. v16 middle Easy: up on a ledge over the route, he
        // walked into its mushroom and bounced on it until rescued)
        const here = who.holdQ && p.grounded ? this.floorAt(p.x, p.y, 6) : null;
        if (here) {
          const inWay = (d: number) => this.sim.platforms.some((b) => b.type === 'bouncy' && !b.broken && Math.abs(b.y + b.height - here.y) < 6 && (d > 0 ? b.x > p.x && b.x < here.x + here.width : b.x + b.width < p.x && b.x + b.width > here.x));
          // (and once he has picked the end, he keeps to it until he is off that ledge: the route's point pulled him back at the end, v16)
          // (an end with a bounce mushroom under it, within 100 px, throws him back up: v1 expert, off the left end onto the floor's)
          const below = (d: number) => {
            const ex = d > 0 ? here.x + here.width : here.x;
            return this.sim.platforms.some((b) => b.type === 'bouncy' && !b.broken && b.y > here.y && b.x + b.width > ex - 100 && b.x < ex + 100);
          };
          const bad = (d: number) => inWay(d) || below(d);
          // (only off a ledge well over the way on, 100+ px: on a 42 px block (v18 seed-perch) the way is over the mushroom)
          if (!this.dropOff && dy > 100 && inWay(dir) && !bad(-dir)) this.dropOff = { id: here.id, dir: dir > 0 ? -1 : 1, t };
        }
        // (kept until he stands on other ground (the engine's standingOnId) or 6 s pass: at the lip his middle is past the ledge and it
        // no longer reads as his floor)
        if (who.holdQ && this.dropOff) dir = this.dropOff.dir;
      }
    }
    // (fallen into a pit the way on cannot be reached from: back up its stair the way he came, pitWayBack)
    const back = this.pitWayBack(tgt);
    if (back !== 0) dir = back;
    // (turned back for an animal he passed: its way, not the route's)
    const prey = this.hunt ? (e.enemies as Array<{ id: number; x: number }>).find((m) => m.id === this.hunt!.id) : undefined;
    if (prey) dir = prey.x > p.x + 16 ? 1 : prey.x < p.x - 16 ? -1 : prey.x >= p.x ? 1 : -1;
    if (dir !== 0) this.way = dir;
    const fdir: -1 | 1 = dir === 0 ? (p.facing >= 0 ? 1 : -1) : dir;
    const side = (d: -1 | 0 | 1): Pad => (d > 0 ? { right: true } : d < 0 ? { left: true } : {});
    this.takeIn();
    this.hiding = false;

    // a puzzle room: stand at its entrance a moment, then on past it
    if (this.puzzleWait) {
      if (t < this.puzzleWait.until) return {};
      const room = e.kit.rooms[this.puzzleWait.room];
      this.puzzleWait = null;
      if (room.beyond) {
        this.placeAt(room.beyond.x, room.beyond.y);
        this.pastRoom(room.box, room.beyond);
      }
      return {};
    }
    for (const room of e.kit?.rooms ?? []) {
      // (a room he comes back to after a fall, its lift wound back down: worked again, as a person works it again, round 5 2026-10-29;
      // counted once)
      const again = this.visited.has(room.ri);
      const b = room.box;
      // (and only fallen back down into it, under the spot he is put at: 1-4's lift puts him on its own top, inside its box, and the way
      // on crosses back over it; standing there 12 s later started the room again, every 12 s until the cap, with his stuck clock wound
      // back each time, bot-fix 2026-11-01)
      if (again && (t - (this.roomAt.get(room.ri) ?? -Infinity) < 12 || (room.beyond && p.y < room.beyond.y + 40))) continue;
      if (p.x > b.x0 - 40 && p.x < b.x1 && p.y > b.y0 - 40 && p.y < b.y1 + 40 && p.grounded) {
        this.visited.add(room.ri);
        this.roomAt.set(room.ri, t);
        if (!again) this.puzzles.push({ id: room.spec.id, x: Math.round(p.x), t: +t.toFixed(1) });
        this.puzzleWait = { until: t + 3, room: room.ri };
        this.closeStuck(false);
        return {};
      }
    }

    // (he has just caught a trunk: a press he decided on before it is dropped, as a thumb that has gone to the climb does; one still on
    // its way threw him off halfway up, round 5 2026-10-29)
    if (p.climbing && !this.wasClimbing) this.pending = null;
    this.wasClimbing = !!p.climbing;
    // a press he has decided on comes when his thumb gets there (the reaction noise)
    if (this.pending && t >= this.pending.at && !this.jump) {
      const q = this.pending;
      this.pending = null;
      if (p.grounded || p.climbing || p.isVineSwinging || p.hanging || t - (this.airFrom?.t ?? t) < 0.4) return this.startJump(q.dir, q.kind, q.off);
    }

    // the rolling nut and the bouncing fruit, read at a glance as they come at him
    const rolled = this.rollPlan(dir, side);
    if (rolled) return rolled;

    // the watching eagle: once told how to hide, he heads for the nearest bush a second after its cry, and stays down until it has gone
    const w = e.proto?.watch ? e.watch : null;
    if (w) {
      if (w.phase === 'warn' && this.warnSeenAt < 0) this.warnSeenAt = t;
      if (w.phase === 'calm') this.warnSeenAt = -1;
      if (this.learned.has('hide') && this.warnSeenAt >= 0 && t >= this.warnSeenAt + who.heed && (w.phase === 'warn' || w.phase === 'pass') && !this.jump) {
        const bushes = (e.proto.bushes ?? []).filter((b: any) => !b.secret && !b.hanging && Math.abs(b.y - p.y) < 14);
        let best: any = null;
        for (const b of bushes) if (!best || Math.abs(b.x + b.w / 2 - p.x) < Math.abs(best.x + best.w / 2 - p.x)) best = b;
        if (best && Math.abs(best.x + best.w / 2 - p.x) < 600) {
          this.hiding = true;
          const cx = best.x + best.w / 2;
          if (p.x > best.x + 16 && p.x < best.x + best.w - 16 && p.grounded) return { down: true };
          return side(cx > p.x ? 1 : -1);
        }
      }
    }

    // the kit watcher's glance (core.ts stepGlance: red light, green light): its head turns toward him (the head-cock, its tell); his
    // stop reaction after it began, he takes his thumb off and holds still until its head is away again (a fake-out too: he cannot tell
    // one from a real turn until it turns away). In the air or on a liana he cannot stop: he lands, or swings on
    const turned = who.freeze !== false && ((e.cast?.sweepers ?? []) as any[]).some((m) => m.s.phase === 'rest' && glancing(m.s) && glanceView(m.s, p));
    if (!turned) this.glanceAt = -1;
    else {
      if (this.glanceAt < 0) this.glanceAt = t;
      // (a jump he has begun, its run-up and its press, he finishes, as he does when the eagle screams: a thumb mid-jump does not freeze)
      if (t >= this.glanceAt + who.stopReact && p.grounded && !this.jump && !p.isVineSwinging && !p.climbing && !p.hanging) {
        this.hiding = true;
        return {};
      }
    }

    // the kit's eagle (1-7, castPlay's sweepers: no proto.watch): once told how to hide, a second after its screech (a look starting over
    // the stretch he is in) he heads for the nearest cover at his level (a bush, a moss carpet or patch) and, inside it, takes his thumb
    // off: the kit hides a STILL sloth in cover, no crouch (stillness.ts). He holds still until its look, or its dive, is over
    const looking = ((e.cast?.sweepers ?? []) as any[]).some((m) => p.x >= m.s.minX - 40 && p.x <= m.s.maxX + 40 && (m.s.phase === 'hunt' || m.s.phase === 'tell' || m.s.phase === 'act'));
    if (!looking) this.castWarnAt = -1;
    else if (this.castWarnAt < 0) this.castWarnAt = t;
    // (on a liana he never lets go toward ground cover: that drops him into the gap (BUILD-17: every rescue on 1-7 was a bot letting go
    // of a mossy liana mid-swing when the eagle looked). A MOSSY liana is cover while it swings him (1-7 beat 10, stillness.ts inCover's
    // rope rule): told how to hide, he holds on, no input, until the look is over; on any other liana his swing goes on as before)
    if (p.isVineSwinging) {
      const held = (e.vines ?? []).find((v: any) => v.id === p.swingVineId);
      if (looking && this.learned.has('hide') && t >= this.castWarnAt + who.heed && held?.mossy) {
        this.hiding = true;
        return {};
      }
    } else if (looking && this.learned.has('hide') && t >= this.castWarnAt + who.heed && !this.jump) {
      const cover = stillCoverNear(e.proto?.bushes ?? [], p.x, p.y);
      if (cover) {
        this.hiding = true;
        if (p.x > cover.x + 16 && p.x < cover.x + cover.w - 16 && p.grounded) return {};
        return side(cover.x + cover.w / 2 > p.x ? 1 : -1);
      }
    }

    // a still spot Dot has explained: he stands there a while
    if (this.stillSpot) {
      if (t < this.stillSpot.until) return {};
      this.stillSpot = null;
    } else if (this.learned.has('still') && p.grounded && this.nearPuzzle(p.x, 0)?.startsWith('a still spot')) {
      this.stillSpot = { until: t + 6 };
      this.learned.delete('still');
      return {};
    }

    // a jump in progress: the thumb down for its hold, the steer back after a straight-up flick, a second flick near the top
    const j = this.jump;
    if (j) {
      const age = t - j.t0;
      if (j.back && p.vy < -700) {
        // (thrown up: the way on, as the route has it now, or the way he named)
        const far = this.prog.target(p, 200);
        j.dir = far && Math.abs(far.x - p.x) > 16 ? (far.x > p.x ? 1 : -1) : j.back;
        j.back = 0;
        // (and a second press near the bounce's top, his second-press delay drawn up to readDbl's quantile; not counted as a double's delay)
        j.kind = 'double';
        j.pressed2 = false;
        j.bounced = true;
        j.d2 = age + drawQ(this.r, who.dbl2Q!, 2 * DT, 0, who.readDbl ?? 1);
      }
      const aimX = j.back && j.backX !== undefined ? j.backX : j.toX;
      if (aimX !== undefined) {
        const out: Pad = Math.abs(p.x - aimX) > 6 ? side(aimX > p.x ? 1 : -1) : {};
        if (age < j.hold) out.jump = true;
        // (the second press on the way up to a high mushroom)
        if (j.kind === 'double' && !j.pressed2 && j.d2 >= 0 && age >= j.d2 - 1e-6 && !p.grounded && p.jumpsLeft > 0) {
          j.pressed2 = true;
          out.press = true;
          out.jump = true;
          this.lastPress = t;
          j.hold = age + flickHold(this.r, who, who.readHold ?? 0);
        }
        return out;
      }
      // (past the middle of a small landing, a log or a pad, the thumb steers back onto it: round 2 of LV-2, 2-1's drownings were the bot
      // landing on a log's far end at a run and running off it)
      const small = age < j.upOnly || j.liana ? 0 : this.overSmall(j.dir);
      const out: Pad = age < j.upOnly || small === 1 ? {} : small === 2 ? side(j.dir === 1 ? -1 : 1) : side(j.dir);
      if (age < j.hold) out.jump = true;
      if (j.kind === 'double' && !j.pressed2 && (j.d2 >= 0 ? age >= j.d2 - 1e-6 : age > j.hold + DT && p.vy > j.dblAt) && !p.grounded && p.jumpsLeft > 0) {
        if (j.d2 >= 0 && !j.bounced) this.secondPressMs.push(Math.round(age * 1000));
        j.pressed2 = true;
        out.press = true;
        out.jump = true;
        this.lastPress = t;
        j.hold = age + flickHold(this.r, who, j.needs || j.bounced ? (who.readHold ?? 0) : 0);
      }
      if (this.learned.has('glide') && e.skills?.has('glide') && !p.grounded && p.vy > 150 && age > 0.4) out.jump = true;
      return out;
    }

    // in a vine field (figPush.ts): under a shut gate, the figs pushed free; a pod's tell on his column, a vine over
    if (p.climbing) {
      const fig = (this.figs ??= new FigPush(who.stopReact)).step(e as unknown as FieldView, p, t);
      if (fig) {
        this.figTap = true;
        return fig;
      }
    }
    // on a trunk: straight up to its top (down where the way goes down), then off it with a flick the way on
    if (p.climbing) {
      // (round 5, 2026-10-29: measured against lastY, which after() has already moved to where he is, this read 0 every frame, and he
      // flicked off every trunk about 90 px up: the tall climbs ran out the clock)
      const moved = Math.abs(this.moveY);
      this.climbStill = moved < 0.5 ? this.climbStill + DT : 0;
      // (the way up or down a trunk is chosen as he catches it and kept: chosen afresh every frame, it flipped with the point he
      // headed for, up one frame and down the next, at a trunk's foot for half a minute; and when it gets him nowhere, the other way,
      // once, before he flicks off, round 5 2026-10-29)
      if (this.climbVine !== e.nearTreeVine || !this.wasOnTrunk) {
        this.climbVine = e.nearTreeVine;
        // (never down a trunk whose top is where her mark stands: he caught it to go up for it, markClimb.ts)
        this.climbDown = !!(tgt && tgt.y > p.y + 40 && Math.abs(tgt.x - p.x) < 60) && !(e.nearTreeVine && markUp(e.nearTreeVine, p, this.sim.collectibles as never, dir));
        this.climbTurned = false;
      }
      if (this.climbStill < 0.4) return this.climbDown ? { down: true } : { up: true };
      this.climbStill = 0;
      if (!this.climbTurned) {
        this.climbTurned = true;
        this.climbDown = !this.climbDown;
        return this.climbDown ? { down: true } : { up: true };
      }
      return this.decide(fdir, 'single', true, side(fdir));
    }
    // on a liana: the vine swings itself (physics.ts, the self-swing), so he only holds the way on (that just turns him) and lets go as
    // it swings forward: a moment to pick in each swing, never a pump
    if (p.isVineSwinging) {
      this.swingT += DT;
      const own = this.sim.vines.find((q) => q.id === p.swingVineId);
      // (hanging low, once he knows to (Dot's line, or a let-go that dropped him short into a pit, pitWayBack): down to the liana's foot
      // first, the thumb on down alone (down with the press is the engine's drop, not the leap; down with a steer can step him off), then
      // the let-go as below. BUILD-16c: 1-6's LONG gaps fly only from a low grip, by design, and the bot never climbed down)
      // (and only once clear of the ledge he caught it from: half a second on it, no ledge just under his feet. Down at a lip, his feet at
      // its top, the engine set him down or dropped him (engine.ts swing exits): 1-6 Normal seed 2 x 14029, a catch lost at once)
      // (a vine snake on HIS liana, as the screen shows it (the snake piece's own place this step: its tell or its trip): he climbs ahead
      // of it, away from the end it comes from, as Dot's lines say (1-6: "If one heads down your liana, climb down ahead of it"; "Snakes
      // coming UP the lianas now! Climb high, ahead of them"). BUILD-16d: knowing nothing of snakes, the kid slid to the foot he had
      // learned to hang from, met a riser there, was let go into the pit and looped on its stair to a rescue (1-6 Normal seed 3, x 32439).
      // Up: never down to the foot while it shows; down: to the foot, the same clear-of-the-ledge rule as hanging low)
      const len = own ? own.bottomY - own.topY : 0;
      const ahead = own && !this.pending ? this.snakeAhead(own.id, len, p.swingLength ?? 0) : null;
      if (ahead === 'up' && (p.swingLength ?? 0) > SWING_TOP + 4) return { up: true };
      if (ahead === 'down' && this.swingT > 0.5 && !this.floorAt(p.x, p.y, 80) && (p.swingLength ?? 0) < len - 4) return { down: true };
      if (own && ahead !== 'up' && this.learned.has('low') && !this.pending && this.swingT > 0.5 && !this.floorAt(p.x, p.y, 80) && (p.swingLength ?? 0) < own.bottomY - own.topY - 4) return { down: true };
      // (how far forward, as a share of the vine's own swing: physics.ts swingSetup sizes each one)
      const a = (p.swingAngle ?? 0) / Math.max(0.05, own ? vineAmp(own) : TIMED.amp), om = p.swingAngularVelocity ?? 0;
      // (the let-go at the swing's forward end, as the testers let go (physics.ts RELEASE: "the natural moment, just past the sweet
      // spot", which the engine gives the sweet spot's leap): decided at 3/4 of the way out, the thumb's lag on top. Decided at 0.4 it
      // came at about half way, a lower, shorter leap: 1-6's LONG gaps (laid at the far end of the low holds' band, W1_LIANA_GAP) fell
      // short every time, Easy too (BUILD-16c: castBots 1-6 seeds 1-6, adult Easy 0/6 at 0.4, 6/6 at 0.75))
      // (on a liana 7 s (a snake climbed away from and back, a swing he never liked): he lets go as it next carries him out in front,
      // never at the back of the swing, which dropped him into the pit he hung over: 1-6 Normal kid seed 4, the risers' liana, round
      // and round to a rescue (ENG-16F, FT_FRAMES 187-208). A liana that never swings him (no swing of its own) is let go at 7 s as
      // before; nothing holds him past 14 s)
      const still = !own || vineAmp(own) < 0.05;
      const late = this.swingT > 7 && (still || (a * fdir > 0.3 && om * fdir > 0));
      // (drop on a log, SKILLS.dropOnLog: over a log river he lets go only when the let-go comes down on a log, after his thumb's lag)
      // (his 7 s "late" let-go too: over the logs he waits for them up to the 14 s cap, as a person watching the river does; the late
      //  let-go at the forward end then drowned the child on Normal, ENG-24 drop toy gap280)
      const wait = SKILLS.dropOnLog && own && this.swingT <= 14 && this.dropWaits(own, fdir, t);
      if (!this.pending && !wait && ((this.swingT > 1 && a * fdir > LET_GO_AT && om * fdir > 0) || (late && !(SKILLS.dropOnLog && own && this.overLogs(own))) || this.swingT > 14)) {
        this.swingT = 0;
        this.letGoAt = t;
        // (a let-go aimed at a log is a drop: no second press after it, which threw the middle bot past his log into the water)
        this.aimedDrop = SKILLS.dropOnLog && !!own && this.overLogs(own);
        return this.decide(fdir, 'single', true, side(fdir));
      }
      return side(fdir);
    }
    this.swingT = 0;
    // on a rope: along it the way on, off at its end
    if (p.hanging) {
      // (caught a rope his way does not take yet (a hop down the steps under 2-2's rope, before the spur's stone): he drops off it (down,
      // the engine's let-go), as a person drops off a rope he grabbed by mistake; hanging on, he shimmied to and fro under the way out
      // until rescued, and a jump off it caught it again: FIX-22)
      const along = this.prog.pts.slice(this.prog.cur, this.prog.cur + 6).some((q) => q.rope);
      if (!along) return { down: true };
      this.ropeStill = Math.abs(this.moveX) < 0.5 ? this.ropeStill + DT : 0;
      if (this.ropeStill > 0.5 && !this.pending) {
        this.ropeStill = 0;
        return this.decide(fdir, 'single', true, side(fdir));
      }
      return side(fdir);
    }
    if (!p.grounded) {
      // (a tier bot walking off for a late press: the press comes his late-press time after he left the ground; the engine's coyote time
      // decides whether it is still a jump)
      if (this.lateArmed && this.edge && this.airFrom && t >= this.airFrom.t + this.edge.late) {
        const d = this.lateArmed.dir, here = this.lateArmed.here;
        this.lateArmed = null;
        return this.startJump(d, this.jumpFor(this.ground, d, here), true);
      }
      // in the air off a ledge he walked off: steer the way on; grab a trunk if he touches one on the way up
      const out = this.overSmall(fdir) ? {} : side(fdir);
      if (e.nearTreeVine && up) out.up = true;
      if (this.learned.has('glide') && e.skills?.has('glide') && p.vy > 150) out.jump = true;
      return out;
    }

    // on the ground
    // (the first moments of a stage: he holds the way on and takes nothing in yet)
    if (t < who.look) return side(dir || 1);
    // (a vine from a log, SKILLS.vineFromLog: riding a log under a liana ahead, he jumps for it when the jump catches it)
    if (SKILLS.vineFromLog && dir !== 0 && !this.jump && !this.pending) {
      const go = this.vineFromLog(p, dir, t);
      if (go) return go;
    }
    // (a ride on a stage clock, a lift, a drifting log: he reads its clock as a person watching it does, before any other ground move:
    // clockRide. Its edge is the plain look ahead, 22 px and his edgeAim, the float-wait's own)
    // (a pond of sinking pads: he reads each pad's state and a beat row's breath as a person watching does, padRead)
    if (dir !== 0 && !this.jump && !this.pending) {
      const held = this.padRead(p, dir, t);
      if (held) {
        this.clockHeld = !held.left && !held.right && !held.jump;
        return held;
      }
    }
    if (CLOCK_SKILL.read && dir !== 0 && !this.jump && !this.pending && !this.standing) {
      const held = this.clockRide(p, dir, t, this.floorAt(p.x + dir * (22 + who.edgeAim), p.y, 40));
      this.clockHeld = !!held && !held.left && !held.right && !held.jump;
      if (held) return held;
    }
    // (a liana to catch off this edge: he stands at the edge until it swings to him, as a person watches a swing come, lianaWait)
    if (dir !== 0 && !this.jump && !this.pending && !this.standing) {
      const lw = this.lianaWait(dir);
      if (lw) return lw;
    }
    // (a tier bot stopped at an edge: he lets go, comes to a stand, stands his time, then jumps from there)
    if (this.standing) {
      const s = this.standing;
      if (s.until < 0 && Math.abs(p.vx) < 10) s.until = t + (this.edge?.stand ?? 0.2);
      if (s.until < 0 || t < s.until) return {};
      this.standing = null;
      return this.startJump(s.dir, this.jumpFor(p, s.dir, this.floorAt(p.x, p.y, 6)), false);
    }
    // (a tier bot: the way on far over him and a bounce mushroom just ahead on his floor: he hops onto it)
    if (who.holdQ && dir !== 0 && !this.jump && tgt) {
      const hi = this.prog.target(p, 320);
      if (hi && hi.y < p.y - 100) {
        const b = this.sim.platforms.find((q) => q.type === 'bouncy' && !q.broken && q.y < p.y && p.y - q.y < 110 && (dir > 0 ? q.x - p.x > 10 && q.x - p.x < 160 : p.x - (q.x + q.width) > 10 && p.x - (q.x + q.width) < 160));
        if (b) return this.hopOnto(b, dir, dir);
      }
      // (and the way on over a double's reach (170 px) with a bounce mushroom within 220 px either side, on his floor or on a block up
      // to 110 px over it: he goes back for it. A1 v4 middle: put back right of a block whose mushroom sits 73 px over the floor, the way
      // on 250 px up, he made 9 standing doubles into the pit)
      if (hi && hi.y < p.y - 170 && p.grounded) {
        let best: Platform | null = null;
        for (const q of this.sim.platforms) {
          if (q.type !== 'bouncy' || q.broken || q.y > p.y + 10 || p.y - q.y > 110) continue;
          const d = Math.abs(q.x + q.width / 2 - p.x);
          if (d < 220 && (!best || d < Math.abs(best.x + best.width / 2 - p.x))) best = q;
        }
        if (best) {
          const to: -1 | 1 = best.x + best.width / 2 > p.x ? 1 : -1;
          return this.hopOnto(best, to, hi.x > p.x ? 1 : -1);
        }
      }
    }
    // (a tier bot with the way on straight over his head, over his reach on foot: he jumps up for it, a double over one jump's height,
    // read as a climb; the route's point flips side to side over him and a first-timer only dithers there)
    // (within 40 px across; within 80 when the ledge the way goes up to spans over him, give or take 40 px)
    // (and only within a double's reach, 175 px: from w1-backstep-twist's right block, 211 px under the ledge, he doubled straight up 14
    // times; the way round is the route's)
    // (the ledge: the lowest one 60-260 px over him that the route's point stands under or on)
    let q: Platform | undefined;
    if (who.holdQ && tgt && tgt.y < p.y - 60) {
      for (const u of this.sim.platforms) {
        if (u.broken || u.y > p.y - 60 || u.y < p.y - 260 || u.y > tgt.y + 30 || tgt.x <= u.x - 40 || tgt.x >= u.x + u.width + 40) continue;
        if (!q || u.y > q.y) q = u;
      }
    }
    const over = !!q && p.x > q.x - 40 && p.x < q.x + q.width + 40;
    const reach = !q || p.y - q.y <= 175;
    // (out of reach, the way on straight over him: he hops up onto the nearest step (20-100 px up, within 160 px) first. v30 expert: in
    // a dip between two 50 px blocks under a ledge 196 px up, he stood 20 s)
    if (who.holdQ && tgt && q && !reach && !this.pending && p.grounded && Math.abs(tgt.x - p.x) < 40) {
      let st: Platform | null = null;
      for (const u of this.sim.platforms) {
        if (u.broken || u.y < p.y - 100 || u.y > p.y - 20) continue;
        const d = Math.abs(Math.max(u.x, Math.min(u.x + u.width, p.x)) - p.x);
        if (d < 160 && (!st || d < Math.abs(Math.max(st.x, Math.min(st.x + st.width, p.x)) - p.x))) st = u;
      }
      if (st) {
        const to: -1 | 1 = st.x + st.width / 2 > p.x ? 1 : -1;
        return this.decide(to, 'single', false, side(to));
      }
    }
    if (who.holdQ && tgt && !this.pending && reach && Math.abs(tgt.x - p.x) < (over ? 80 : 40) && tgt.y < p.y - 60) {
      // (he steers for a spot 30 px inside the ledge the way goes up to, then lets go: w1-backstep-twist's way up through two thin
      // ledges, 137 and 142 px, from a block's corner; steering on the whole way he flew off the block, 8 times)
      // (no ledge there, the route's point in the air on a way down: he goes on the way the route does, as before)
      const far = this.prog.target(p, 200);
      const d: -1 | 1 = far && Math.abs(far.x - p.x) > 16 ? (far.x > p.x ? 1 : -1) : fdir;
      const toX = q ? Math.max(q.x + 30, Math.min(q.x + q.width - 30, p.x)) : null;
      this.climbJump = true;
      this.climbToX = toX;
      return this.decide(toX === null ? d : toX > p.x + 6 ? 1 : toX < p.x - 6 ? -1 : 0, tgt.y < p.y - 90 ? 'double' : this.mem.plan(p.x, p.y), false, {});
    }
    // (walking off for a late press that never came: the ground went on after all)
    if (this.lateArmed && t - this.lateArmed.t > 1) {
      this.lateArmed = null;
      this.edge = null;
    }
    // (a late walk-off that came down on a drifting log: the ground went on after all, and off a log there is no fall to press in, so he
    // never walks on off its end with the old press armed: SKILLS.upstream; riverRide.test.ts, the child on Easy, 11-15)
    if (SKILLS.upstream && this.lateArmed && p.grounded) {
      const on = this.floorAt(p.x, p.y, 6);
      if (on?.type === 'drift' && on !== this.lateArmed.here) {
        this.lateArmed = null;
        this.edge = null;
      }
    }
    if (this.lateArmed) return side(this.lateArmed.dir);
    // (a press on its way: he keeps going until it comes; a jump off a log for a vine he waits for standing, the log carrying him, as it
    //  was judged (SKILLS.vineFromLog): walking on, he ran off the log's front end before it came, catch toy v3)
    if (this.pending) return this.pending.still ? {} : side(this.pending.dir);
    // (just landed: the thumb comes back down before the next flick)
    if (t - this.lastLand < 0.1) {
      // (landed on a small pad or ledge: he stops on it a beat, then flicks on from where he stands if its edge is close)
      const here = this.floorAt(p.x, p.y, 6);
      // (never on a sinking pad once he knows it sinks: KEEP-HOPPING, padRead; never on a drifting log running his way under a liana over
      //  its river, which the handed skill rides in (SKILLS.handed): after a let-go onto a 150 px log the pause flicked him on blind into
      //  the water, ENG-24 drop toy gap280, middle Normal 17 lives. Every other river keeps it as it was (its bots' plants are measured on
      //  it, riverRide.test; the general change is ENG-24 REPORT's suggestion)
      if (here && here.width < 220 && !this.padPause && !(PAD_SKILL.keepHopping && here.pad) && !(SKILLS.ride && SKILLS.handed && SKILLS.dropOnLog && here.drift && here.drift.dir === dir && this.lianaRiver(here))) this.padPause = { until: t + between(this.r, [0.25, 0.5]), id: here.id };
      if (!this.padPause) return side(dir);
    }
    if (this.padPause) {
      const here = this.floorAt(p.x, p.y, 6);
      if (!here || here.id !== this.padPause.id) this.padPause = null;
      else if (t < this.padPause.until) return {};
      else {
        this.padPause = null;
        if (dir !== 0 && !this.floorAt(p.x + dir * 80, p.y, 40)) {
          const on = this.prog.target(p, 160);
          if (!(on && on.y > p.y + 50)) return this.decide(dir, this.jumpFor(p, dir, here), false, side(dir));
        }
      }
    }
    // a stage's cast: a hunter rearing at him, once told to freeze (freezePlan); a drop trap whose load hangs over an animal ahead, once
    // he has been told of it (castPlan). Any stage by its data
    const fz = this.freezePlan();
    if (fz) return fz;
    if (this.punchAt === null) {
      const c = this.castPlan(fdir);
      if (c) return c;
    }
    // (getting ready to punch: a moment's hesitation, then the tap, never right on top of a jump press)
    if (this.punchAt !== null) {
      if (t < this.punchAt || t - this.lastPress < this.swapGap) return {};
      this.punchAt = null;
      return { punch: true };
    }
    // a trunk he is touching, and the way goes up (or he is stopped beside it): straight up
    // (holding up at the top of the trunk he just came up takes him nowhere: after a moment he lets the trunk be and goes on as on
    // open ground, a hop up to the ledge above, round 5 2026-10-29)
    this.trunkUpT = e.nearTreeVine && !p.climbing && p.grounded && Math.abs(this.moveY) < 0.5 ? this.trunkUpT + DT : 0;
    if (this.trunkUpT > 0.6) this.trunkIgnoreUntil = t + 2;
    // (and where one of her marks stands up on the high road this climb leads to: he goes up for it, markClimb.ts)
    if (e.nearTreeVine && t >= this.trunkIgnoreUntil && (up || this.blockedT > who.stopReact || markUp(e.nearTreeVine, p, this.sim.collectibles as never, dir))) return { up: true };
    // stopped dead against something: a plain jump
    // (bot-fix, 2026-11-01: measured against lastX, which after() has already moved to where he is, this read 0 every frame, as the
    // trunk's lastY did in round 5: every 0.3 s of walking was a "stop", so he hopped along flat ground and took off ~110 px before a
    // ledge's end instead of edgeAim's 22-44. The frame's own movement, moveX, is what it means)
    const moved = Math.abs(this.moveX);
    // (a tier bot's thumb lifting for a moment (rhythm, gapQ) holds the count, never starts it over: against a log's face his short
    // pushes between lifts each fell under stopReact, so he stood at it until rescued (P13 11-12, 1-3's logs). P13 held it only on a stage
    // that names a cast, which left 1-6 (its snakes are pieces, no cast): the child stood 20 s at a 53 px stump's face to a rescue,
    // 1-6 Normal seed 2 (ENG-16F, frames 370.4-372.6). On every stage now (level.md rule 22); 1-1's calibration re-run with it)
    const lifted = t < this.gapUntil, holdCount = lifted && moved < 0.8;
    // (and never while the game itself holds his steer: after a put-back or a respawn the engine ignores a thumb still held from before
    // the fall for 0.35 s (engine.ts inputGrace). A person sees he was set back, not a wall. POLISH-9, R-165.228: ADULT's stopReact 0.3
    // read that hold as being stopped dead on every put-back, so at 1-1's 255 px double test he jumped where he was set down, 116 px short
    // of the lip with no run-up, and missed until rescued (6 of 10 layouts); the tier bots already waited, backAt below)
    const graceHeld = (e.inputGrace ?? 0) > 0;
    // (nor while he waits on a clock by choice: for a ride to stand at his end, or riding one, clockRide; he is not stopped dead)
    this.blockedT = moved < 0.8 && dir !== 0 && !p.pushing && !lifted && !graceHeld && !this.clockHeld && !(who.holdQ && t - this.backAt < 1) ? this.blockedT + DT : holdCount ? this.blockedT : 0;
    this.clockHeld = false;
    if (this.blockedT >= who.stopReact) {
      this.blockedT = 0;
      const face = this.faceAhead(fdir, 30);
      if (face !== null) {
        this.stops.push({ x: p.x, y: p.y, h: face, t });
        this.nextStop = this.stops.length - 1;
      }
      // (a tier bot under a wall taller than his double (about 185 px), a bounce mushroom just behind him: he hops back onto it and lets
      // it throw him up, as every tester did at w1-hop-bounce (38 expert runs, no life or put-back there))
      const back = face !== null ? this.bounceBack(fdir, face) : null;
      if (back) return back;
      // (a tier bot stopped at a face reads it as he reads an edge: a step over one jump's height gets a double)
      return this.decide(fdir, who.holdQ ? this.jumpFor(p, fdir, this.floorAt(p.x, p.y, 6)) : this.mem.plan(p.x, p.y), false, side(dir));
    }
    // the way goes up right here (a ledge over him): jump for it
    if (up && dir === 0 && tgt && tgt.y < p.y - 60) return this.decide(fdir, this.mem.plan(p.x, p.y), false, {});
    // (on a tower's own route, which has corners and no jump arcs (towerRoute.ts): the way rises across a stair of ledges over him, each
    // a hop up, and he walked under all three and jumped for the top one, 240 px, 1-4 Easy: he jumps for the ledge over him that the way
    // goes onto, as he does for one straight over him. Towers only: a traced route draws its own hops)
    // (read 240 px along the way, as a player sees the stair rise ahead: the near point rises too little to call while he steps under the
    // first ledge, and he jumped late, from under its far end, clean over it)
    const rise = this.onTower && dir !== 0 && p.grounded ? this.prog.target(p, 240) : null;
    // (and straight up through it, stopped first: a jump on the run carried him past the step's far end, the thumb's latency on top)
    if (rise && rise.y < p.y - 40) {
      const over = this.sim.platforms.some((q) => this.solid(q) && q.y < p.y - 30 && q.y > p.y - STAIR_HOP && p.x >= q.x + 12 && p.x <= q.x + q.width - 12 && rise.y <= q.y + 20);
      if (over) return Math.abs(p.vx) > 40 ? {} : this.decide(0, this.mem.plan(p.x, p.y), false, {});
    }
    if (dir !== 0) {
      // an edge coming: he means to jump `edgeAim` px before it (the thumb's latency moves it), unless the way on drops down
      // (a tier bot looks his own press distance ahead, drawn afresh for each edge; a stand lets go at the press distance's p25 and
      // 31 px more (his lift-off up to 2 frames late, 19 px, and the 12 px Pokey slides to a stop), so he stands about p25 before the lip:
      // groundPressToLipPx counts only presses made moving)
      const tierEdge = who.aimQ ? this.edgePlan() : null;
      const look = tierEdge ? (tierEdge.how === 'stand' ? who.aimQ![1] + 31 : tierEdge.aim) : 22 + who.edgeAim;
      // (and a gap between: a look past the end of the floor he stands on sees the gap only if nothing stands just past that end. A
      // tier bot's press distance (aimQ, up to ~270 px) looked clean over 2-1's 110 px splash creeks onto the far bank, so he walked into
      // the creek, was splashed back and walked in again until rescued: child Easy seed 10, x 2,063, FIX-21)
      const under = p.grounded ? this.floorAt(p.x, p.y, 6) : null;
      const lip = under ? (dir > 0 ? under.x + under.width : under.x) : NaN;
      // (only over WATER: the creek he walked into. A pit gap the same width is left to the edge's own press, as before: with this look
      //  on every gap the middle bot jumped 1-8's 120 px chase gaps from his full press distance and fell in, chaseBots, INT-11 11-15)
      const wet = (x0: number, x1: number) => ((this.sim.stage as { rivers?: Array<{ x0: number; x1: number }> }).rivers ?? []).some((rv) => rv.x1 > Math.min(x0, x1) && rv.x0 < Math.max(x0, x1));
      const past = under && dir * (p.x + dir * look - lip) > 0 && wet(lip, p.x + dir * look);
      const ahead = this.floorAt(p.x + dir * look, p.y, 40) && (!past || this.floorAt(lip + dir * 24, p.y, 40));
      // (up the far bank, SKILLS.bankUp: at a river's far end the bank stands a step up from the log (river.ts LOG_DROP, 28 px), so it
      //  reads as floor ahead and the gap logic below never runs, and a log running back at him never carries him under it to be handed
      //  over. He walked into its face, stood while the log carried him off, walked off its end and splashed back, again, until rescued:
      //  2-1 child Easy seeds 20 and 23, x 19,576 and 26,074, FIX-GATES 11-15. The bank face in a hop's reach, he hops up onto it now)
      if (SKILLS.bankUp && under?.type === 'drift' && under.drift && under.drift.dir !== dir) {
        const front = dir > 0 ? under.x + under.width : under.x;
        const up = this.sim.platforms.find((q) => q.type !== 'drift' && !q.broken && q.y < p.y - 6 && q.y > p.y - 70 && (dir > 0 ? q.x >= front - 2 && q.x - p.x < 90 : q.x + q.width <= front + 2 && p.x - (q.x + q.width) < 90));
        if (up) return this.startJump(dir, this.jumpFor(p, dir, under), false);
      }
      if (!ahead) {
        const on = this.prog.target(p, 160);
        // (a ledge at about his height just across the gap is a jump, whatever the way does after it: 2-7's lifts, round 4, the kid
        // walked off a plank into the river six times because the route dropped down past the next bank)
        const across = this.sim.platforms.some((q) => !q.broken && q.type !== 'drift' && Math.abs(q.y - p.y) < 50 && (dir > 0 ? q.x > p.x && q.x - p.x < 150 + who.edgeAim : q.x + q.width < p.x && p.x - (q.x + q.width) < 150 + who.edgeAim) && !this.floorAt(p.x + dir * look, p.y, 40));
        // (a tier bot sees a pit: where nothing stands under the edge for 400 px, the way down to a lower ledge across it is a jump)
        const pit = !!who.holdQ && !this.floorAt(p.x + dir * (look + 40), p.y, 400);
        const drops = on && on.y > p.y + 50 && !across && !pit;
        // (a log or a lily pad drifting across the gap: he can see it, so he waits at the edge until it is near, up to 6 s)
        const here = this.floorAt(p.x, p.y, 6);
        // (ENG-W2b: a float is near when a hop he makes now, or a beat later as his thumb gets there, comes down on it where it will be,
        // hopLandsOn; drifting logs come out from under the bank at his feet, so every log on the water is looked at, not only those ahead)
        const rivers = (this.sim.stage as { rivers?: RiverZone[] }).rivers;
        // (a hop off a log keeps the log's sideways speed, the one carry rule (engine.ts groundJump, RIDE.keep): flown with it)
        const carry = here?.drift ? ((floatAt(rivers, here)(t + DT) - floatAt(rivers, here)(t)) / DT) * RIDE.keep.x : 0;
        const lands = (q: Platform) => [0, 0.1, 0.2].some((lag) => hopLandsOn(q, floatAt(rivers, q), p.x + (p.vx + carry) * lag, p.y, dir as -1 | 1, who.hold[0], t + lag, p.vx + (Math.abs(carry) < 400 ? carry : 0)));
        if (SKILLS.ride && !drops && here && here.type !== 'drift' && here.type !== 'moving') {
          const edgeX = dir > 0 ? here.x + here.width : here.x;
          // (a lift or a lily pad, 'moving', keeps the read it always had: near the edge now)
          const ahead = (q: Platform) => (dir > 0 ? q.x + q.width > edgeX && q.x < edgeX + 320 : q.x < edgeX && q.x + q.width > edgeX - 320);
          const floats = this.sim.platforms.filter((q) => (q.type === 'drift' || q.type === 'moving') && !q.broken && Math.abs(q.y - p.y) < 70 && (q.type === 'drift' ? Math.abs(q.x + q.width / 2 - edgeX) < 400 : ahead(q)));
          const near = floats.some((q) => (q.type === 'drift' ? lands(q) : dir > 0 ? q.x - edgeX < 90 && q.x + q.width - edgeX > 40 : edgeX - (q.x + q.width) < 90 && edgeX - q.x > 40));
          if (floats.length && !near) {
            if (this.edgeWait < 0) this.edgeWait = t;
            if (t - this.edgeWait < 6) return {};
          }
        }
        // (and riding a drifting log: he waits on it until the next log or the bank is near, LV-2 round 2: he used to hop off the end
        // of the log the moment he reached it, whatever was ahead, which a person watching the river does not)
        if (SKILLS.ride && !drops && here && here.type === 'drift') {
          const edgeX = dir > 0 ? here.x + here.width : here.x;
          const bank = this.sim.platforms.some((q) => q !== here && q.type !== 'drift' && !q.broken && Math.abs(q.y - p.y) < 70 && (dir > 0 ? q.x - edgeX < 80 && q.x + q.width > edgeX : edgeX - (q.x + q.width) < 80 && q.x < edgeX));
          const next = this.sim.platforms.some((q) => q !== here && q.type === 'drift' && !q.broken && Math.abs(q.y - p.y) < 70 && Math.abs(q.x - here.x) < 600 && lands(q));
          // (handed to the bank, SKILLS.handed: a log running his way carries him onto the bank it slides under; he rides it in)
          if (SKILLS.handed && here.drift && here.drift.dir === dir) {
            this.edgeWait = -1;
            return {};
          }
          // (against the flow, SKILLS.upstream: the next log or the bank in reach, he hops now off the front end, a press made standing on
          // the log, never a late walk-off into the water; out of reach, he stands, and the log hands him back to the bank he came from)
          if (SKILLS.upstream && here.drift && here.drift.dir !== dir) {
            this.edgeWait = -1;
            return next || bank ? this.startJump(dir, this.jumpFor(p, dir, here), false) : {};
          }
          if (!bank && !next) {
            if (this.edgeWait < 0) this.edgeWait = t;
            if (t - this.edgeWait < 6) return {};
          }
        }
        this.edgeWait = -1;
        const wall = tierEdge ? this.faceAhead(dir, 60) : null;
        const back = wall !== null ? this.bounceBack(dir, wall) : null;
        if (back) return back;
        if (!drops && tierEdge) {
          // (the measured press distance already holds his thumb's latency: the press comes now)
          const kind = this.jumpFor(p, dir, here);
          // (a late press is a walk-off: with a face ahead (a stump at a log's end, middle v3 on 164e4cf8: 9.4 s pressed against it,
          // the plan re-armed every second) there is no lip to walk off, so he jumps)
          if (tierEdge.how === 'late' && this.faceAhead(dir, 40) !== null) tierEdge.how = 'run';
          if (tierEdge.how === 'run' && kind === 'double' && who.readAim !== undefined && !tierEdge.read) {
            tierEdge.read = true;
            const near = drawQ(this.r, who.aimQ!, 0, 0, who.readAim);
            if (near < tierEdge.aim) {
              tierEdge.aim = near;
              return side(dir);
            }
          }
          if (tierEdge.how === 'run') return this.startJump(dir, kind, false);
          // (KEEP-HOPPING: on a sinking pad he never stops at its edge to stand his time: he goes)
          if (tierEdge.how === 'stand' && PAD_SKILL.keepHopping && here?.pad) return this.startJump(dir, kind, false);
          if (tierEdge.how === 'stand') {
            this.standing = { dir, until: -1 };
            return {};
          }
          this.lateArmed = { dir, t, here };
          return side(dir);
        }
        if (!drops) return this.decide(dir, this.jumpFor(p, dir, here), false, side(dir));
      }
      // an animal walking at him: hop it (or punch it, once told how), or walk on into it
      for (const m of e.enemies as any[]) {
        if (m.defeated) continue;
        // (an animal of the cast whose coil hurts on touch (PredatorDef.coil: the boa on its bough) never walks at him: the freeze is his
        // answer once told (freezePlan), else he walks on into it. Hopping a rearing coil is the expert's move, not a tier bot's yet:
        // ENG-19b, the lead 11:20 AM. 1-3's snakes have no coil: hopped or punched as before)
        if (m.kit && (e.cast?.members as Array<{ e: unknown; def: PredatorDef }> | undefined)?.some((q) => q.e === m && !!q.def.coil)) continue;
        const dx = (m.x - p.x) * dir;
        if (dx < 20 || dx > 130 || Math.abs(m.y + 12 - p.y) > 60) continue;
        if (!this.foeSeen.has(m.id)) this.foeSeen.set(m.id, this.r() < who.hopFoe);
        // (an animal of a stage's cast up on a low log he can walk into, R-165.150: from below his punch only shoves it, so he hops up
        // onto its log first, as a player standing in the log under it does; 1-3's finale, the kid's strands at c925d4e6)
        if (m.kit && p.grounded && p.y - (m.y + 14) > 15 && dx < 100) return this.decide(dir, 'single', false, side(dir));
        if (this.learned.has('punch') && dx < 110) {
          this.punchAt = t + who.hesitate;
          this.swapGap = between(this.r, who.swap);
          return {};
        }
        if (this.foeSeen.get(m.id) && dx < 90) return this.decide(dir, 'single', false, side(dir));
      }
    }
    return side(dir);
  }

  /**
   * The freeze (1-9.md "be the bait"; any stage by its cast's data): an animal of the cast that is not a sweeper starts its rear (the kit's
   * 'tell') with him within its engage on its ground; once told to freeze, after his reaction (stopReact, then a thumb's lag) he takes
   * the thumb off, and keeps it off while it rears and strikes, until it is beaten (it leaves) or its strike is over. By a lure post it
   * fears (1-9's roost) it leaves in its first rear frame (lure.ts), before any reaction, so he walks on: no reading of the post is
   * needed (boaBots.test's roost toy, planted with the post removed).
   */
  private freezePlan(): Pad | null {
    const c = this.e.cast as { members: Array<{ def: PredatorDef; s: { phase: string; x: number; y: number; leaving?: boolean } }> } | null;
    if (!c || this.who.noFreeze || !this.learned.has('freeze')) {
      this.rearSeen = null;
      return null;
    }
    const p = this.sim.p, t = this.t;
    // (the kit reads him as castPlay's CastHero does: x his middle, y his feet)
    const mid = p.x, feet = p.y;
    const rearing = (m: (typeof c.members)[number]) => m.def.habit !== 'sweep' && !m.s.leaving && (m.s.phase === 'tell' || m.s.phase === 'act') &&
      Math.abs(m.s.x - mid) <= engageOf(m.def, this.who.setting === 'easy') + 20 && Math.abs(m.s.y - feet) <= 60;
    if (this.rearSeen && !c.members.some((m) => m === this.rearSeen!.m && rearing(m))) this.rearSeen = null;
    if (!this.rearSeen) {
      const m = c.members.find((q) => q.s.phase === 'tell' && rearing(q));
      if (!m) return null;
      this.rearSeen = { m, at: t + this.who.stopReact + Math.max(0, gauss(this.r, this.who.thumb)) };
    }
    return t >= this.rearSeen.at ? {} : null;
  }

  /**
   * A drop trap (dropTrap.ts) on his way, once told of traps: its handle ahead on the ground he stands on and its load over an animal of
   * the cast not yet cleared (the trap is the safe way: the handle stands outside the animal's strike). He walks to the handle, a
   * moment's hesitation, punches it, and stands until the load is down. A trap over nothing he passes; an animal with no trap over it
   * is the walk's own business (a punch or a hop, intend). Nothing here names a stage, a kind or an x: all of it is the stage's data.
   */
  private castPlan(fdir: -1 | 1): Pad | null {
    const c = this.e.cast as { traps: Array<{ post: TrapPost; phase: string }>; members: Array<{ cleared: boolean; s: { x: number; y: number } }> } | null;
    if (!c) return null;
    const p = this.sim.p, t = this.t;
    if (this.trapWait) {
      const tr = c.traps.find((q) => q.post === this.trapWait!.post);
      if (t < this.trapWait.until && tr && tr.phase !== 'down') return {};
      this.trapWait = null;
    }
    if (!this.learned.has('trap') || !p.grounded || p.climbing) {
      this.trapGoal = null;
      return null;
    }
    const mid = p.x + p.width / 2;
    // (armed: an animal of the cast not yet cleared under its load, on the far side of the handle from him: he meets the handle first,
    // the safe way. Coming back along the branch, he meets the animal first, and the walk's own punch or hop is his)
    const armed = (h: TrapPost, from: number) => c.members.some((m) => !m.cleared && scares(h, m.s.x, m.s.y) && (m.s.x - h.x) * (h.x - from) > 0);
    // (a trap he has picked stays his goal until it is sprung or no longer worth it: his thumb carries him on 200 px and more after he
    // means to stop (W1C's trace, 1-3 adult Easy seed 1), and he turns back for the vine he was just told to punch, as a player does)
    let goal = this.trapGoal ? c.traps.find((q) => q.post === this.trapGoal && q.phase === 'set') : undefined;
    if (goal && (Math.abs(goal.post.y - p.y) > 24 || Math.abs(goal.post.x - mid) > 420 || !armed(goal.post, goal.post.x - Math.sign(goal.post.loadX - goal.post.x)))) goal = undefined;
    if (!goal) {
      this.trapGoal = null;
      goal = c.traps.find((tr) => {
        if (tr.phase !== 'set') return false;
        const h = tr.post;
        // (on the ground he stands on, ahead of him, or just behind his middle: he went a step past it)
        if (Math.abs(h.y - p.y) > 24) return false;
        const ahead = (h.x - mid) * fdir;
        return ahead >= -40 && ahead <= 260 && armed(h, mid);
      });
      if (!goal) return null;
      this.trapGoal = goal.post;
    }
    const h = goal.post;
    // (he punches from anywhere in the blow's reach of the handle, on the side away from the load, facing it: measured in the real
    // engine, a punch springs the vine from 10 px past it to 85 px short of it (P13 11-12); he aims for -4 to 80. A point to stand on was too fine for a
    // first-timer's thumb, which runs him to full speed at every nudge: he rocked either side of it until rescued, 1-3 kid seed 6)
    const toLoad: -1 | 1 = h.loadX >= h.x ? 1 : -1;
    const short = (h.x - p.x) * toLoad;
    const toward: Pad = toLoad > 0 ? { right: true } : { left: true }, away: Pad = toLoad > 0 ? { left: true } : { right: true };
    // (the first-timers' thumbs, KID and ADULT, never let go once held, thumbify R-165.59: they cannot stop at a spot, so they punch on
    // the move, the tap timed by their own hesitation to land mid-reach; past the handle, they back off a run-up and come again)
    if (!this.who.holdQ) {
      if (this.trapRunUp) {
        if (short < 170) return away;
        this.trapRunUp = false;
      }
      if (short < -4) {
        this.trapRunUp = true;
        return away;
      }
      const coming = p.vx * toLoad;
      if (coming > 100 && short <= 40 + coming * this.who.hesitate) {
        this.punchAt = t + this.who.hesitate;
        this.swapGap = between(this.r, this.who.swap);
        this.trapWait = { post: h, until: this.punchAt + 1.5 };
        return toward;
      }
      return toward;
    }
    // (a tier bot's thumb lets go: far off he runs at it; within 150 px of the reach he taps, one press from a standstill, then lets the
    // slide stop him and looks again)
    const off = short > 80 ? short - 80 : short < -4 ? short + 4 : 0;
    if (off !== 0) {
      const go = (off > 0) === (toLoad > 0) ? { right: true } : { left: true };
      if (Math.abs(off) > 150) return go;
      return Math.abs(p.vx) > 20 ? {} : go;
    }
    // (stopped: the thumb is off; he waits for himself to stand still before he turns and punches)
    if (Math.abs(p.vx) > 20) return {};
    if ((p.facing >= 0 ? 1 : -1) !== toLoad) return toLoad > 0 ? { right: true } : { left: true };
    this.punchAt = t + this.who.hesitate;
    this.swapGap = between(this.r, this.who.swap);
    this.trapWait = { post: h, until: this.punchAt + 2.5 };
    this.trapGoal = null;
    return {};
  }

  /** a tier bot under a wall `face` px tall, over his double (about 185 px), with a bounce mushroom just behind him: he hops back onto it
   *  and lets it throw him up the way on, as every tester did at w1-hop-bounce (38 expert runs, no life or put-back there) */
/**
   * THE PAD SKILLS (ENG-22; 2-2.md NEW 5): a pond of sinking pads (pieces/padPiece.ts), read off what a person sees.
   *   KEEP-HOPPING   on a pad that sinks under him (or rides a breath), he never stands: no pause on landing, no standing his time at
   *                  its edge (those two are where the hooks above check PAD_SKILL.keepHopping), and once it shivers he goes now.
   *   WAIT-FOR-THE-RISE  at an edge with the next pad down or still shivering (a beat row under, a pad he just sank on a there-and-back),
   *                  he holds on the floor he is on until it is up and still, then goes after his own reaction.
   *   CROSS-ON-THE-BREATH  at an edge before a beat row, he goes only on a breath that has time left to cross the whole run to the next
   *                  floor that stays (padFaults' pace): he waits for the next rise rather than start late in one.
   * Returns a pad to hold (or a jump), or null to let the edge's own walk or jump go.
   */
  private padRead(p: PlayerState, dir: -1 | 1, t: number): Pad | null {
    const who = this.who;
    const e = this.e as any;
    // (the floor his feet are on: a point read at his middle loses it once he has slid a pixel past its end while still standing on it, and
    // the plain edge's jump then went blind onto a beat pad; BUILD-22, the rise toy's child-Normal trace)
    const here = (p.grounded ? this.sim.platforms.find((q) => q.id === this.sim.standingOn) : undefined) ?? this.floorAt(p.x, p.y, 6);
    if (!here) { this.padSeen = -1; return null; }
    const shows = (q: Platform) => padShows(q) ?? { solid: !q.broken, tell: 0 };
    const edgeX = dir > 0 ? here.x + here.width : here.x;
    const toEdge = dir > 0 ? edgeX - p.x : p.x - edgeX;
    // (the next floor across the water ahead, within a held jump's reach, at his height: a pad (up or down), a stone, the far bank)
    let next: Platform | null = null;
    for (const q of this.sim.platforms) {
      if (q === here || (q.broken && !q.pad) || Math.abs(q.y - p.y) > 70) continue;
      const off = dir > 0 ? q.x - edgeX : edgeX - (q.x + q.width);
      if (off < 2 || off > PAD_FAIR.reach) continue;
      if (!next || (dir > 0 ? q.x < next.x : q.x > next.x)) next = q;
    }
    // (a pond crossing is a hop from a pad or onto one; any other edge is the edge's own)
    if (!next || (!here.pad && !next.pad)) { this.padSeen = -1; return null; }
    const go: Pad = dir > 0 ? { right: true } : { left: true };
    // (he lets go where he comes to a stand before a lip, the clock-ride wait's own distance (clockRide): at 30 px the kid's late lift-off
    // and his slide ran him off a stone into the breath row while it was under, 2-2 Easy seed 3 (BUILD-22))
    const stand = who.aimQ ? who.aimQ[1] + 31 : 22 + who.edgeAim;
    const approach = (): Pad => (toEdge > stand ? go : {});
    // (a person who does not know pads sink treats one as any small floor: he stops on it a beat when he lands, and stands his time at its
    // edge when his tier stands; KEEP-HOPPING is knowing not to)
    if (here.pad && !PAD_SKILL.keepHopping) {
      if (this.padStop?.id !== here.id) this.padStop = { id: here.id, until: t + between(this.r, [0.25, 0.5]) + (this.edgePlan().how === 'stand' ? this.edgePlan().stand : 0) };
      if (t < this.padStop.until) return approach();
    }
    let ready = true;
    // (WAIT-FOR-THE-RISE: a pad down, or still shivering, is no pad to hop for)
    if (next.pad && PAD_SKILL.waitRise) {
      const s = shows(next);
      if (!s.solid || s.tell > 0) ready = false;
    }
    // (CROSS-ON-THE-BREATH: from a floor that stays, the run of beat pads to the next floor that stays, and the breath left to cross it)
    // (read at the rise; once he has seen it ready he is going, through his reaction: padSeen)
    // (he reads the breath standing at the edge, never on his walk up to it: read from afar, the breath he saw was spent on the walk and
    // a stretched one (Easy) was under by the time he hopped; BUILD-22, the rise toy's child-Easy trace)
    if (ready && this.padSeen < 0 && PAD_SKILL.breath && next.pad?.by === 'beat' && here.pad?.by !== 'beat' && toEdge > stand) ready = false;
    if (ready && this.padSeen < 0 && PAD_SKILL.breath && next.pad?.by === 'beat' && here.pad?.by !== 'beat') {
      const row = this.sim.platforms.filter((q) => Math.abs(q.y - p.y) < 90 && (dir > 0 ? q.x >= edgeX - 4 : q.x + q.width <= edgeX + 4)).sort((a, b) => (dir > 0 ? a.x - b.x : b.x - a.x));
      let to = NaN;
      for (const q of row) if (q.pad?.by !== 'beat') { to = dir > 0 ? q.x : q.x + q.width; break; }
      // (the run as the stage's own fairness measures it, padFaults: edge to the floor after, at its pace after its reaction)
      const across = Math.abs(to - edgeX);
      const r = e.clock.read(next.pad.clock, next.pad.shift);
      const def = (((this.sim.stage as any).clocks ?? []) as any[]).find((c) => c.id === next!.pad!.clock);
      const stretch = who.setting === 'easy' ? Math.max(1, def?.easyStretch ?? 1) : 1;
      const warn = (def?.phases.find((ph: any) => ph.name === 'warn')?.seconds ?? 0) * stretch;
      const left = r.phase === 'off' ? r.left + warn : r.phase === 'warn' ? r.left : 0;
      if (!Number.isFinite(across) || r.phase !== 'off' || left < across / PAD_FAIR.pace + PAD_FAIR.react - DT) ready = false;
    }
    if (!ready) { this.padSeen = -1; return approach(); }
    // (from a floor that stays, he goes after his own reaction to it being ready; on a pad he is already going)
    if (!here.pad) {
      if (this.padSeen < 0) this.padSeen = t;
      if (t - this.padSeen < who.stopReact) return approach();
    }
    // (the hop: he presses where a flown hop comes down on it whatever he holds, a tap or a full hold, after his thumb's lag; where no
    // press point lands both, within 40 px of the edge where his own usual hold does; at the very edge he presses whatever)
    const flies = (hold: number, lag: number) => hopLandsOn(next!, () => next!.x, p.x + p.vx * lag, p.y, dir, hold, t + lag, p.vx, 6);
    const lands = [0.03, 0.1].every((lag) => flies(0, lag) && flies(0.7, lag)) || (toEdge < 40 && [0.03, 0.1].every((lag) => flies(who.hold[0], lag)));
    // (KEEP-HOPPING: his pad shivers; he does not walk on to his usual press point, he goes now)
    const shiver = here.pad && PAD_SKILL.keepHopping && shows(here).tell > 0;
    // (a pond hop is a single, its hold his own: every water in a pond is under a held single's reach (padFaults PAD_FAIR.reach). The
    // plain edge's plan read the next floor at his height, a bank 900 px on, and the spot memory then kept the double a failed double
    // had left: a middle bot fell 8 times at one 110 px gap, 2-2 seed 6 (BUILD-22). His own second press stays, at his share (startJump))
    if (lands || toEdge < 6 || (shiver && hopLandsOn(next, () => next!.x, p.x, p.y, dir, who.hold[1] + who.hold[0], t, p.vx))) return this.decide(dir, 'single', false, go);
    return go;
  }

  /**
   * READ A STAGE CLOCK (METER-2a): the float-wait at an edge made a skill for any floor that moves by a clock. A ride on a stage beat
   * (ride.ts; gen2/rideLay.ts lays it) and a basket lift (lift.ts) move by the stage's clock and stand at each end; he reads it the way
   * a person watching does, from whether it stands and where:
   *   BOARD     at an edge with one across the gap (at his height, within the float-wait's 320 px), he waits until it stands at his end
   *             (its near side within 90 px of the edge, as the float-wait's "near"), then goes; never onto one that is moving. He waits
   *             at most two of its cycles.
   *   RIDE      on it, he holds still while it moves: he never walks off its end into the gap.
   *   STEP OFF  when it stands with a floor in reach ahead, he goes after his own reaction to it stopping: his tier's stopReact, plus a
   *             late press as often and as late as his tier's lateShare / lateQ. Too late and it leaves again and carries him back,
   *             the miss a person makes (the meter's FB step-off, score.ts rideChallenges).
   * A drifting log never stands (river.ts): on one, once the bank or the next log is near (the float-wait's own "near"), he goes after
   * the same reaction; too late and it carries him toward the bank it slides under.
   * Returns a pad to hold (wait), or null to let the edge's own walk or jump go.
   */
  private clockRide(p: PlayerState, dir: -1 | 1, t: number, ahead: Platform | null): Pad | null {
    const who = this.who;
    const e = this.e as any;
    const here = this.floorAt(p.x, p.y, 6);
    const clocked = (q: Platform | null | undefined): boolean => !!q && q.type === 'moving' && (!!q.ride || !!q.lift);
    // (at an edge: nothing under his look ahead, or only the ride itself, which he must not walk onto while it moves)
    const atEdge = !ahead || (clocked(ahead) && ahead !== here);
    // (does it stand now: a ride outside its 'on' (ride.ts rideAt: off, warn and rest stand at an end), a lift at a stop (lift.ts liftStop))
    const stands = (q: Platform) => (q.ride ? e.clock.read(q.ride.clock, q.ride.shift).phase !== 'on' : liftStop(q.lift!, e.gameTime) !== 0);
    const edgeOf = (q: Platform) => (dir > 0 ? q.x + q.width : q.x);
    // (a floor in reach across from an edge: the float-wait's "near", 90 px across and 40 px of footing; a lift's ledge a step above)
    const inReach = (q: Platform, edgeX: number) => Math.abs(q.y - p.y) < 70 && (dir > 0 ? q.x - edgeX < 90 && q.x + q.width - edgeX > 40 : edgeX - (q.x + q.width) < 90 && edgeX - q.x > 40);
    const reaction = () => {
      if (this.offSeen >= 0) return t - this.offSeen >= this.offDelay;
      this.offSeen = t;
      this.offDelay = who.stopReact + (who.lateQ && this.r() < (who.lateShare ?? 0) ? drawQ(this.r, who.lateQ) : 0);
      return this.offDelay <= 0;
    };
    if (here && (clocked(here) || here.type === 'drift')) {
      this.clockWait = -1;
      const edgeX = edgeOf(here);
      const next = this.sim.platforms.some((q) => q !== here && !q.broken && inReach(q, edgeX) && (here.type === 'drift' || q.type !== 'moving'));
      if (here.type === 'drift') {
        // (a drifting log is the river bot's: its float-wait, against-the-flow and handed-to-the-bank skills (ENG-W2b, FIX-GATES b58ec0e6,
        // riverRide.test). A reaction here before each step-off, never planted, stood the child on Easy 8 s+ at 2-1's river edge and stopped
        // four of riverRide's plants biting once both lines met (FIX-22; METER-2a's EXACT NEXT STEP 2 named the join))
        this.offSeen = -1;
        return null;
      }
      // (a ride or a lift: hold still while it moves, and while it stands with nothing in reach ahead, it is about to carry him)
      if (!stands(here) || !next) { this.offSeen = -1; return {}; }
      return reaction() ? null : {};
    }
    this.offSeen = -1;
    if (!here) { this.clockWait = -1; return null; }
    const edgeX = edgeOf(here);
    const toEdge = dir > 0 ? edgeX - p.x : p.x - edgeX;
    // (a ride that docks at this edge: one end of its path (a lift: where it stands) across from it within the float-wait's 90 px, at
    // his height. Within his longest look of it (320 px), the approach is the skill's: the crack a docked ride leaves (RIDE_LAY.gap) is
    // no pit, and a ride away from the dock is no floor to jump for)
    const off = (x: number, w: number) => (dir > 0 ? x - edgeX : edgeX - (x + w));
    const docks = (q: Platform) => (q.ride ? q.ride.path.some((pt) => Math.abs(pt.y - here.y) < 70 && off(pt.x, q.width) > -40 && off(pt.x, q.width) < 90) : off(q.x, q.width) > -40 && off(q.x, q.width) < 90);
    const rides = toEdge >= -4 && toEdge < 320 ? this.sim.platforms.filter((q) => clocked(q) && !q.broken && docks(q)) : [];
    if (!rides.length) { this.clockWait = -1; return null; }
    const boardable = rides.find((q) => stands(q) && inReach(q, edgeX));
    if (boardable) {
      this.clockWait = -1;
      // (standing flush at his edge, a step across and level, he walks onto it: the crack is no gap to jump, and a jump over it
      // overshoots a ride 140 px long. Standing a hop off, the edge's own jump goes)
      const crack = off(boardable.x, boardable.width);
      return crack <= 12 && Math.abs(boardable.y - p.y) <= 16 ? (dir > 0 ? { right: true } : { left: true }) : atEdge ? null : dir > 0 ? { right: true } : { left: true };
    }
    // (away, or moving: he walks up to the edge and waits there for it, at most two of its cycles. He lets go where a tier bot comes to a
    // stand before a lip, his press distance's p25 and 31 px (the edge stand above), so his thumb's lag and the slide never take him off)
    if (toEdge > (who.aimQ ? who.aimQ[1] + 31 : 22 + who.edgeAim)) return dir > 0 ? { right: true } : { left: true };
    if (this.clockWait < 0) this.clockWait = t;
    // (a ride stands at his end once in two of its periods, rideAt; a lift once a round trip, lift.ts liftCycle)
    const period = (id: string) => {
      const def = (((this.sim.stage as any).clocks ?? []) as any[]).find((c) => c.id === id);
      return def ? def.phases.reduce((s: number, ph: any) => s + ph.seconds, 0) * (this.who.setting === 'easy' ? Math.max(1, def.easyStretch ?? 1) : 1) : 6;
    };
    const cycle = Math.max(...rides.map((q) => (q.ride ? 2 * period(q.ride.clock) : 2 * ((q.lift!.bottom - q.lift!.top) / q.lift!.speed + q.lift!.wait))));
    return t - this.clockWait < Math.max(6, 2 * cycle) ? {} : null;
  }

  private bounceBack(fdir: -1 | 1, face: number): Pad | null {
    const p = this.sim.p;
    if (!this.who.holdQ || face <= 170) return null;
    const b = this.sim.platforms.find((q) => q.type === 'bouncy' && !q.broken && Math.abs(q.y - p.y) < 60 && (fdir > 0 ? q.x + q.width <= p.x + 10 && p.x - (q.x + q.width) < 160 : q.x >= p.x - 10 && q.x - p.x < 160));
    if (!b) return null;
    return this.hopOnto(b, fdir > 0 ? -1 : 1, fdir);
  }
  /** a short hop onto a bounce mushroom `b`, going `dir`; once it throws him up he steers the way on (the route; else `then`) */
  private hopOnto(b: Platform, dir: -1 | 1, then: -1 | 1): Pad {
    // (a mushroom up on a block over a single's reach of his feet (80 px) gets a double, read as a climb)
    const high = this.sim.p.y - b.y > 80;
    if (high) this.climbJump = true;
    const out = this.startJump(dir, high ? 'double' : 'single', true);
    this.jump!.back = then;
    this.jump!.backX = b.x + b.width / 2;
    return out;
  }

  /**
   * the rolling nut and the bouncing fruit (pieces/rollingPiece.ts; 1-8.md NEW 9): what is in view coming at him on the ground. A NUT
   * (small, rolling): a hop when its near side is HOP_AT px or less in front of his and it is closing; a FRUIT (big, bouncing): within
   * UNDER_AT px he stays down, thumb on, no jump started, while the ground goes on ahead (one threat at a time: never at a gap, 1-8.md)
   */
  /** the ground goes on under his way for the next UNDER_AT px (no gap whose edge his own edge plan must take first) */
  private groundOn(p: { x: number; y: number }, way: -1 | 1): boolean {
    for (let d = 40; d <= UNDER_AT; d += 40) if (!this.floorAt(p.x + way * d, p.y, 40)) return false;
    return true;
  }

  /** this frame his thumb is held for a fruit (rollPlan): no thumb gap (rhythm), as on a chase */
  private rollHeld = false;
  private rollPlan(dir: -1 | 0 | 1, side: (d: -1 | 0 | 1) => Pad): Pad | null {
    if (this.who.noRollRead) return null;
    const e = this.sim.e as unknown as { pieces?: Array<{ kind: string; list?: Rolling[] }> };
    const list = e.pieces?.find((q) => q.kind === 'rolling')?.list;
    if (!list?.length) return null;
    const p = this.sim.p;
    if (!p.grounded || p.climbing) return null;
    // (his way on: the route's, or the way he faces; a step back the route asks for is not his way on)
    const way: -1 | 1 = dir === 0 ? (p.facing >= 0 ? 1 : -1) : dir;
    for (const h of list) {
      if (h.phase === 'wait' || h.phase === 'gone' || h.spent) continue;
      const ahead = (h.x - p.x) * way;
      if (h.spec.kind === 'high') {
        // (a fruit dropping in or bouncing on his way: he keeps his thumb down toward it and runs on under it, no stop to look and no
        // thumb lifted, as on a chase: its shadow says where it lands; one stops and starts again under it as it comes down)
        if (ahead > -40 && ahead < UNDER_AT * 2 && this.groundOn(p, way)) {
          this.rollHeld = true;
          return side(way);
        }
        continue;
      }
      if (h.phase === 'drop') continue;
      if (h.spec.kind === 'low') {
        const closing = (p.vx - h.vx) * way;
        const near = ahead - rollRadius('low') - p.width / 2;
        if (near > -6 && near <= HOP_AT && closing > 0 && this.groundOn(p, way)) {
          // (a hop he means: held two frames at least, 47 px up, never the shortest tap's 30)
          const out = this.startJump(way, 'single', false);
          if (this.jump) this.jump.hold = Math.max(this.jump.hold, 2 * DT + 0.001);
          return out;
        }
      }
    }
    return null;
  }

  /** a chase runs behind him (the engine's guide view: the hand-built 1-8, or a laid stretch) and he has the skill to keep moving */
  private chased(): boolean {
    return this.view.chase && !this.who.noChaseStride;
  }

  /** the seconds he could stand before a laid chase's front reaches him (what the screen tells him: the crack, the creak, the ember
   *  at the edge growing as it closes), at its own row's speed; Infinity with no laid chase running behind him */
  private chaseRoom(): number {
    const e = this.sim.e as unknown as { pieces?: Array<{ kind: string; run?: ChaseRun }> };
    const run = e.pieces?.find((q) => q.kind === 'chase')?.run;
    const x = this.sim.p.x;
    const f = run ? frontBehind(run, x) : null;
    if (!run || f === null) return Infinity;
    return (x - f - run.row.catchAt) / run.row.base;
  }

  /** a tier bot's next edge: drawn once, kept until he jumps or is put back */
  private edgePlan(): NonNullable<FirstTimerRun['edge']> {
    if (!this.edge) {
      const r = this.r, w = this.who;
      const u = r();
      const how = u < (w.lateShare ?? 0) ? 'late' : r() < (w.standShare ?? 0) ? 'stand' : 'run';
      this.edge = { aim: drawQ(r, w.aimQ!, 0), how, stand: w.standQ ? drawQ(r, w.standQ, DT) : 0.2, late: w.lateQ ? drawQ(r, w.lateQ, 0) : 0.05 };
    }
    // (on a running chase he stands at an edge only as long as the front leaves him: the stand he drew must fit the stop budget it
    // leaves now, with a margin; else he takes the edge in stride)
    if (this.chased() && this.edge.how === 'stand' && !this.standing && this.edge.stand > this.chaseRoom() - CHASE_MARGIN) this.edge.how = 'run';
    return this.edge;
  }

  /** each runner liana's lip (its far end), by the vine's id, found once (runnerLiana.ts runnerLip, the piece's own) */
  private readonly runnerLips = new Map<number, number | null>();
  /**
   * He is on the ground running at a runner liana's lip, within the run it is eased over (runnerLiana.ts RUNNER.from): a liana phased to
   * meet a full run (1-8 NEW 4), seen swinging toward him, so his thumb stays down: no rhythm lift on the way (ENG-B6: the MIDDLE tier's
   * gapQ lift 200 px before the lip stopped him dead, and the liana, eased for a run that stopped coming, made him wait at the lip)
   */
  private runnerAhead(): boolean {
    if (this.who.noRunnerHold) return false;
    const p = this.sim.p;
    if (!p.grounded) return false;
    for (const v of this.sim.vines as Vine[]) {
      if (!v.runner || v.vineType === 'tree_climb') continue;
      let lip = this.runnerLips.get(v.id);
      if (lip === undefined) {
        const l = runnerLip(v, this.sim.platforms);
        this.runnerLips.set(v.id, (lip = l ? l.x + l.width : null));
      }
      if (lip !== null && p.x <= lip && p.x >= lip - RUNNER.from) return true;
    }
    return false;
  }

  /** a tier bot's steering rhythm on open ground: a direction held its time, then let go its time (the profiles' moveHoldMs, moveGapMs) */
  private rhythm(want: Pad): Pad {
    const w = this.who, p = this.sim.p, t = this.t;
    if (!w.steerQ || !w.gapQ || this.chased()) return want;
    if (!p.grounded || this.jump || this.pending || this.standing || this.lateArmed || want.press || !(want.left || want.right)) return want;
    // (KEEP-HOPPING: on a sinking pad his thumb never lets go between steers: padRead)
    if (PAD_SKILL.keepHopping && this.floorAt(p.x, p.y, 6)?.pad) return want;
    if (t < this.gapUntil) {
      const out = { ...want };
      delete out.left;
      delete out.right;
      return out;
    }
    if (this.steerUntil < 0 || this.steerUntil < this.gapUntil) this.steerUntil = t + drawQ(this.r, w.steerQ, DT);
    if (t < this.steerUntil) return want;
    if (this.r() >= (w.gapShare ?? 1)) {
      this.steerUntil = t + drawQ(this.r, w.steerQ, DT);
      return want;
    }
    this.gapUntil = t + drawQ(this.r, w.gapQ, DT);
    const out = { ...want };
    delete out.left;
    delete out.right;
    return out;
  }

  /** he decides to flick: it comes after the thumb's latency (N(mean, sd); an early one comes at once) */
  private decide(dir: -1 | 0 | 1, kind: 'single' | 'double', off: boolean, meanwhile: Pad): Pad {
    const lag = gauss(this.r, this.who.thumb);
    if (lag <= DT / 2) return this.startJump(dir, kind, off);
    this.pending = { at: this.t + lag, dir, kind, off };
    return meanwhile;
  }

  /** the thumb's own fumbles on top of what he means: drift into the dead zone, travel when turning, a late lift-off */
  /** a fig push (figPush.ts) is a tap and a let-go, each kept as it is: the thumb's late lift-off re-arms every frame for KID and ADULT
   *  (thumbify, R-165.59), so their taps ran together into one long hold, the engine saw one press (sideLatch), and under 1-4's shut gate
   *  he held on a field vine until the clock ran out (INT-4, 11-13). A tap game is played with taps: none of his thumb's drift here. */
  private tapped(want: Pad): Pad {
    this.lastSteer = want.right ? 1 : want.left ? -1 : 0;
    this.releaseLeft = 0;
    this.releaseArmed = false;
    return want;
  }

  private thumbify(want: Pad): Pad {
    const who = this.who, t = this.t;
    const steer: -1 | 0 | 1 = want.right ? 1 : want.left ? -1 : 0;
    const out: Pad = { ...want };
    const drop = () => {
      delete out.right;
      delete out.left;
    };
    if (steer !== 0 && steer === this.lastSteer) this.driftPx = Math.min(30, this.driftPx + Math.max(0, gauss(this.r, who.drift)) * DT);
    if (steer !== 0 && this.lastSteer !== 0 && steer !== this.lastSteer) {
      const lag = (2 * 16 + this.driftPx) / who.thumbSpeed;
      this.travelUntil = t + lag;
      this.turns++;
      this.turnLag += lag;
      this.driftPx = 0;
    }
    if (steer !== 0 && this.r() < who.slip * DT) this.driftUntil = t + Math.round(between(this.r, who.slipFrames)) * DT;
    // (R-165.59: lastSteer is not moved on while the late lift-off runs, so for KID and ADULT this re-arms every frame and the steer is
    // never let go once held; a tier bot arms it once per let-go, as the thumb does)
    if (steer === 0 && this.lastSteer !== 0 && !want.press && !(who.holdQ && this.releaseArmed)) {
      const [lo, hi] = who.releaseMax;
      this.releaseLeft = Math.max(lo, Math.min(hi, Math.round(Math.exp(gauss(this.r, who.release)))));
      this.releaseArmed = true;
    }
    if (steer !== 0) {
      this.releaseLeft = 0;
      this.releaseArmed = false;
    }
    if (t < this.travelUntil || t < this.driftUntil) drop();
    else if (steer === 0 && this.releaseLeft > 0 && !want.down) {
      this.releaseLeft--;
      if (this.lastSteer > 0) out.right = true;
      else out.left = true;
      return out;
    }
    this.lastSteer = steer;
    return out;
  }

  private pad(): Pad {
    this.figTap = false;
    this.rollHeld = false;
    const intended = this.intend();
    const want = this.rollHeld || this.runnerAhead() ? intended : this.rhythm(intended);
    const out = this.figTap ? this.tapped(want) : this.thumbify(want);
    this.wasOnTrunk = !!this.sim.p.climbing;
    if (out.press) this.lastPress = this.t;
    return out;
  }

  /** a flick up: short, sometimes straight up for a moment; a second flick only where a single one failed before */
  private startJump(dir: -1 | 0 | 1, kind: 'single' | 'double', off: boolean): Pad {
    const p = this.sim.p, who = this.who;
    // (a tier bot: where a jump has failed him he holds on longer; any jump may get its second press, at his own delay)
    const overhead = this.climbJump;
    const toX = this.climbToX;
    this.climbJump = false;
    this.climbToX = null;
    const needs = who.readHold !== undefined && (overhead || dir !== 0 && (this.faceAhead(dir, 60) !== null || !this.floorAt(p.x + dir * ((this.edge?.aim ?? 0) + 100), p.y, 40)));
    let hold = flickHold(this.r, who, who.retryHold && this.mem.fails(p.x, p.y) > 0 ? who.retryHold : needs ? (who.readHold ?? 0) : 0);
    let d2 = -1;
    if (who.dbl2Q) {
      if (kind === 'single' && !this.aimedDrop && this.r() < (who.dblShare ?? 0)) kind = 'double';
      // (up a step, the second press early enough to climb: from dbl2Q's quantiles up to readDbl; across a gap, his own delay)
      const here = this.floorAt(p.x, p.y, 6);
      const climb = overhead || (needs && dir !== 0 && !!here && this.stepUp(here, dir));
      const [lo, hi] = climb ? [0, who.readDbl ?? 1] : needs ? (who.readGap ?? [0, 1]) : [0, 1];
      d2 = drawQ(this.r, who.dbl2Q, 2 * DT, lo, hi);
      if (kind === 'double') hold = Math.min(hold, d2 - DT);
      this.edge = null;
      this.lateArmed = null;
    }
    const upOnly = !off && this.r() < who.upOnly ? between(this.r, who.upOnlyT) : 0;
    this.pending = null;
    this.jump = { t0: this.t, x: p.x, y: p.y, cur: this.prog.cur, kind, hold, upOnly, dir, pressed2: false, dblAt: between(this.r, who.dblAt), d2, needs: needs || undefined, toX: overhead && toX !== null ? toX : undefined, left: false, stop: this.nextStop ?? undefined, harms: this.harms.length, running: p.grounded && Math.abs(p.vx) > 150 };
    this.aimedDrop = false;
    this.nextStop = null;
    if (this.lianaHop) {
      this.jump.liana = true;
      this.lianaHop = false;
      // (held at least as long as the hop lianaWait judged would catch it (hopCatches with who.hold[0]): a tier bot's drawn press (holdQ,
      // 22-231 ms) was often shorter than the hop it decided on, so a hop judged to catch fell short onto the lip's end and he walked off
      // it into the gap (ENG-B6, the MIDDLE strider at a runner liana, trace in chaseBots.test). The decision and the act now agree)
      this.jump.hold = Math.max(this.jump.hold, this.who.hold[0]);
    }
    const out: Pad = upOnly > 0 ? {} : dir > 0 ? { right: true } : dir < 0 ? { left: true } : {};
    out.press = true;
    out.jump = true;
    return out;
  }

  /** put him somewhere along the way (a puzzle passed, a rescue) */
  private placeAt(x: number, y: number) {
    const sim = this.sim;
    const lives = this.e.lives;
    sim.stand(x, y);
    this.e.lives = lives;
    this.e.checkpoint = { x, y };
    this.sim.p.invincibleTimer = 0;
    this.jump = null;
    this.airFrom = null;
    this.blockedT = 0;
    this.prog.relocate(sim.p);
  }

  /** the route point nearest a spot */
  private progAt(x: number, y: number): number {
    let bi = 0, bd = Infinity;
    this.prog.pts.forEach((q, i) => {
      const d = Math.abs(q.x - x) + Math.abs(q.y - y) * 0.7;
      if (d < bd) {
        bd = d;
        bi = i;
      }
    });
    return bi;
  }

  /** stuck too long: on to the next place to stand along the route, a little further on */
  private rescue(): boolean {
    const pts = this.prog.pts;
    const p = this.sim.p;
    // (not back to where the last rescue put him when he is no further on than that: he failed the same way from there, and was put
    // there again, four times running on 1-4's climb; each time a little further on, bot-fix 2026-11-01)
    const from = this.lastRescue >= this.prog.hi ? this.lastRescue + 8 : this.prog.hi + 4;
    for (let i = from; i < pts.length; i++) {
      const q = pts[i];
      if (Math.hypot(q.x - p.x, q.y - p.y) < 160) continue;
      const f = this.floorAt(q.x, q.y - 2, 8);
      if (!f || f.type === 'fragile') continue;
      this.rescues++;
      this.rescueXs.push(Math.round(p.x));
      this.lastRescue = i;
      if (this.stuckOpen) this.stuckOpen.rescued = true;
      this.closeStuck(true);
      this.placeAt(q.x, f.y);
      return true;
    }
    return false;
  }

  /**
   * Put past a puzzle room: his place along the way is the first point past the room on the side he was put (bot-fix 2026-11-01: the
   * nearest point could be one the route traced through the room's far wall, behind him, and he walked straight back into the room; on
   * 6-3's seesaw he did that until the cap)
   */
  private pastRoom(box: { x0: number; x1: number; y0: number; y1: number }, beyond: { x: number; y: number }) {
    const pts = this.prog.pts;
    const right = beyond.x >= (box.x0 + box.x1) / 2;
    // (and not one inside a solid piece: the route is traced on the stage as built, and through a room's far wall it can run inside it)
    const inside = (q: Pt) => this.sim.platforms.some((b) => !b.broken && q.x > b.x && q.x < b.x + b.width && q.y > b.y + 8 && q.y < b.y + (b.height ?? 0));
    let bi = -1;
    for (let i = 0; i < pts.length; i++) {
      if ((right ? pts[i].x > box.x1 : pts[i].x < box.x0) && !inside(pts[i])) {
        bi = i;
        break;
      }
    }
    if (bi < 0 || bi <= this.prog.cur) return;
    this.prog.cur = bi;
    this.prog.hi = bi;
    this.prog.floor = bi;
    this.prog.best = Math.max(this.prog.best, bi);
  }

  private closeStuck(_rescued: boolean) {
    this.stuckOpen = null;
    this.noProg = 0;
  }

  /** after a frame: landings, progress, stuck spots, game over */
  private after() {
    const sim = this.sim, p = sim.p, e = this.e, t = this.t;
    const more = this.prog.step(p);
    // landings: did the jump get him on?
    const held = p.climbing || p.isVineSwinging || p.hanging;
    if (!p.grounded && !held && !this.airFrom) this.airFrom = { t, x: p.x, y: p.y, cur: this.prog.cur };
    if ((p.grounded || held) && this.airFrom) {
      const j = this.jump;
      if (t - this.airFrom.t > 0.12) {
        this.lastLand = t;
        if (j) {
          // (a jump that took him on along the way but dropped him far under where he set off is a miss: he fell past the ledge,
          // round 5 2026-10-29; counted a success, the bot never tried the jump another way)
          const ok = held || p.y < j.y - 6 || (this.prog.cur > j.cur + 2 && p.y < j.y + 60);
          this.mem.result(j.x, j.y, j.kind, ok);
          const hurt = this.harms.length > j.harms;
          this.tries.push({ x: j.x, y: j.y, dir: j.dir, t0: j.t0, t1: t, kind: j.kind, ok: ok && !hurt, hurt, running: j.running, land: ok && p.grounded ? { id: this.e.standingOnId, x: p.x, y: p.y } : undefined, hold: j.hold });
          if (j.stop !== undefined && this.stops[j.stop].ok === undefined) this.stops[j.stop].ok = ok;
          if (!ok && !this.whatAt.some((w) => Math.abs(w.x - j.x) < 60 && Math.abs(w.y - j.y) < 30)) {
            const d = this.describe(j.dir === -1 ? -1 : 1);
            this.whatAt.push({ x: j.x, y: j.y, ...d });
          }
          if (TRACE) process.stderr.write(`  ${t.toFixed(2)} ${j.kind} from ${Math.round(j.x)},${Math.round(j.y)} hold ${j.hold.toFixed(2)} up ${j.upOnly.toFixed(2)}${j.d2 >= 0 ? ` d2 ${j.d2.toFixed(2)} 2nd ${j.pressed2}` : ''} -> ${Math.round(p.x)},${Math.round(p.y)} ${ok ? 'ok' : 'FELL BACK'}\n`);
        }
      }
      this.airFrom = null;
      this.jump = null;
    }
    if (this.jump && !this.airFrom && t - this.jump.t0 > 0.5) {
      // (the flick never left the ground: a jump under a ceiling, or eaten)
      this.mem.result(this.jump.x, this.jump.y, this.jump.kind, false);
      this.jump = null;
    }
    // fallen off the way (a miss in a climb drops him to a branch or the floor far under where he was): once he stands there a moment,
    // he finds his place along the way again and heads back to the way up, as a person climbs back (round 5, 2026-10-29: the bot kept
    // heading for the point straight over his head, never walked back to the trunk, and the tall climbs ran out the clock)
    if (this.prog.off(p) > 260 && !held) {
      this.offRoute += DT;
      if (this.offRoute > 0.5 && p.grounded) {
        const top = this.prog.best;
        this.prog.relocate(p, true);
        this.offRoute = 0;
        // (the same fall three times, never getting higher: noted as a loop and he is put past it, as the same death three times is.
        // bot-fix 2026-11-01: each fall moved his place back down the way, so the climb back up counted as progress and the 20 s clock
        // never ran out: on 1-4 he climbed and fell from the same branch every 24 s until the cap, and the run read "time")
        // (a pod's knock off a vine field is a hit, counted as one, never a missed climb: figPush.ts knockedRecently)
        if (top === this.fallTop && !this.figs?.knockedRecently(t)) this.fallBacks++;
        else {
          this.fallTop = top;
          this.fallBacks = 1;
        }
        if (this.fallBacks >= this.tries3 && this.prog.best <= top) {
          this.fallBacks = 0;
          const at = this.prog.pts[top];
          this.stuck.push({ x: Math.round(at.x), y: Math.round(at.y), t: +t.toFixed(1), dur: 0, what: `fell back down from here ${this.tries3} times${process.env.FT_BROKEN ? ' broken:' + this.sim.platforms.filter((q) => q.broken).map((q) => `${Math.round(q.x)},${Math.round(q.y)}`).join(' ') : ''}`, step: null, dip: null, puzzle: false, rescued: true });
          this.prog.hi = Math.max(this.prog.hi, top);
          if (!this.rescue()) this.end = 'stranded';
        }
      }
    } else this.offRoute = 0;
    // stuck: no progress for 8 s (not while standing at a puzzle)
    // (and not while he works a vine field's gate or steps off a pod's column: figPush.ts busy, the figs are the way on)
    // (and not while he climbs back out of a pit, pitWayBack: the way back up is a person's retry, and three of them are a loop there)
    if (more || this.huntMore || this.puzzleWait || this.stillSpot || this.figs?.busy(t) || this.climbBack) {
      if (this.stuckOpen && this.noProg >= 8) this.stuckOpen.dur = +this.noProg.toFixed(1);
      this.stuckOpen = null;
      this.noProg = 0;
    } else if (this.hiding) {
      // (holding still for a watcher, its glance or its pass: he is waiting, not stuck. The clock HOLDS, it does not start over, so a spot
      //  he cannot get past is still a spot he cannot get past: ENG-WATCH, the glance's freezes inside 1-7's dip had read as 'stuck')
    } else {
      this.noProg += DT;
      if (this.noProg >= 8 && !this.stuckOpen) {
        // (described where he stands; in the air mid-try, as the spot he keeps falling back to was)
        const g = this.ground;
        const w = p.grounded ? null : this.whatAt.find((q) => Math.abs(q.x - g.x) < 80 && Math.abs(q.y - g.y) < 40);
        const dir = (this.prog.target(p)?.x ?? p.x + 1) >= p.x ? 1 : -1;
        const d = w ?? (p.grounded ? this.describe(dir) : null);
        if (d) {
          const at = p.grounded ? p : g;
          this.stuckOpen = { x: Math.round(at.x), y: Math.round(at.y), t: +(t - this.noProg).toFixed(1), dur: 8, what: d.what, step: d.step, dip: d.dip, puzzle: d.puzzle, rescued: false };
          this.stuck.push(this.stuckOpen);
        }
      }
      if (this.stuckOpen) this.stuckOpen.dur = +this.noProg.toFixed(1);
      const fallbacks = this.mem.fails(p.x, p.y);
      if (this.noProg >= (this.opts.rescueAfter ?? 20) || (fallbacks >= (this.who.holdQ ? 8 : 5) && this.noProg > 8.5)) {
        if (!this.rescue()) this.end = 'stranded';
      }
    }
    // out of lives: Continue, as a player does
    if (e.isGameOver && e.outOfLives) {
      this.gameOvers++;
      e.isRunning = true;
      e.continueFromCheckpoint();
      this.respawned();
    }
    // the sealed shrine: once Dot has said why (a 'must' line: "It's sealed. Defeat ... first."), he turns back for the nearest animal
    // still out (a purge on a stage that names a cast, by its own goal and animals); with none to find, or after 12 turns, he stands a moment and gives up
    this.huntMore = false;
    if (this.hunt) {
      const m = (e.enemies as Array<{ id: number; x: number; y: number; defeated?: boolean; kit?: { leaving?: unknown } }>).find((q) => q.id === this.hunt!.id);
      if (!m || m.defeated || m.kit?.leaving || t - this.hunt.more > 20) {
        this.hunt = null;
        this.home = Infinity;
      } else {
        const d = Math.abs(m.x - p.x) + Math.abs(m.y - p.y);
        if (d < this.hunt.best - 2) {
          this.hunt.best = d;
          this.hunt.more = t;
          this.huntMore = true;
        }
      }
    }
    if (this.home !== null && !this.hunt) {
      const d = Math.abs((this.sim.stage as { exitTotemX: number }).exitTotemX - p.x);
      if (d < this.home - 2) {
        this.home = d;
        this.huntMore = true;
      }
    }
    if (this.sealed()) {
      this.home = null;
      const told = this.dot.shown.some((q) => q.kind === 'must' && t - q.t0 < 12);
      // (only on a stage whose data names a cast, castPlay.ts: elsewhere the bot's runs are measurements that set game numbers, 5-9's
      // Easy goal from the kid's runs, firstTimerBot.test.ts, and stay as they were measured)
      if (!this.hunt && told && e.cast && this.turnBacks < 12 && this.goal && this.goal.got < this.goal.need) {
        const left = (e.enemies as Array<{ id: number; x: number; y: number; defeated?: boolean; type: string; kit?: { leaving?: unknown } }>)
          .filter((q) => !q.defeated && !q.kit?.leaving && q.type !== 'boss')
          .sort((a, b) => Math.abs(a.x - p.x) + Math.abs(a.y - p.y) - (Math.abs(b.x - p.x) + Math.abs(b.y - p.y)));
        if (left.length) {
          this.hunt = { id: left[0].id, best: Infinity, since: t, more: t };
          this.turnBacks++;
        }
      }
      if (!this.hunt) this.sealedT += DT;
    }
    if (p.grounded) this.ground = { x: p.x, y: p.y };
    if (p.x > this.maxX) this.maxX = p.x;
    const on = along(this.mode, p);
    if (Number.isNaN(this.farOn) || reached(this.mode, on, this.farOn)) this.farOn = on;
    if (this.who.holdQ && this.frames % 15 === 0) this.xTrace.push(Math.round(p.x));
    // (the frame's own movement, for the next frame's choices: by then lastX and lastY are where he already is)
    this.moveX = p.x - this.lastX;
    this.moveY = p.y - this.lastY;
    const step = Math.hypot(p.x - this.lastX, p.y - this.lastY);
    if (step < 100) this.walked += step;
    this.lastX = p.x;
    this.lastY = p.y;
  }

  /** the whole run, until the shrine, a sealed shrine, or the time cap */
  play(): this {
    // (three times the stage's own length where it has one (STAGE_SECONDS), as 360 s is for a two-minute stage: World 4's longer stages ran out of time at 360 s while
    // the bot was still making its way up, round 5 2026-10-29)
    const cap = this.opts.cap ?? Math.max(360, 3 * (STAGE_SECONDS[this.id] ?? 0));
    const e = this.e;
    while (this.t < cap) {
      const pad = this.pad();
      this.sim.frame(pad);
      this.opts.onFrame?.(this.sim);
      { const on = this.sim.p.grounded ? this.sim.platforms.find((q) => q.id === this.sim.standingOn) : undefined; if (this.wasOnLog && on && on.type !== 'drift') this.handed++; this.wasOnLog = !!on && on.type === 'drift'; }
      {
        const p = this.sim.p, sw = !!p.isVineSwinging;
        if (sw && !this.wasSwinging && this.lastFloorLog) this.fromLog++;
        if (sw) this.lastSwung = true;
        if (p.grounded) {
          const log = this.wasOnLog;
          if (this.lastSwung && log) this.ontoLog++;
          this.lastSwung = false;
          this.lastFloorLog = log;
        }
        this.wasSwinging = sw;
      }
      if (TRACE_FRAMES && this.t > TRACE_FRAMES[0] && this.t < TRACE_FRAMES[1]) process.stderr.write(`    f ${this.t.toFixed(2)} ${Math.round(this.sim.p.x)},${Math.round(this.sim.p.y)} g${+this.sim.p.grounded} vx${Math.round(this.sim.p.vx)} pad ${JSON.stringify(pad)} on ${this.e.standingOnId}\n`);
      this.frames++;
      e.guideView(this.view);
      this.dot.tick(this.view, this.t, (tp) => this.far(tp));
      this.after();
      if (e.exitTotemReached) {
        this.end = 'shrine';
        // (a stage with no quota (an ascent, a sprint: engine.ts's progress `default`) counts its goal as the shrine itself; the engine
        // reports that a frame after the one that reaches it, which the loop never plays, so the goal reads 0 of 1 at the shrine)
        if (this.goal && !QUOTA_TYPES.has(String(this.sim.e.currentStage.config.objectiveType))) this.goal.got = Math.max(this.goal.got, this.goal.need);
        break;
      }
      if (this.sealedT > 3) {
        this.end = 'sealed door';
        break;
      }
      if (this.end === 'stranded') break;
    }
    return this;
  }

  /** the faces that stopped his walk dead: one per spot, and whether the first plain jump there got him over */
  stopsReport(): FTRun['stops'] {
    const firsts: Array<{ x: number; y: number; h: number; ok?: boolean }> = [];
    for (const st of this.stops) if (!firsts.some((q) => Math.abs(q.x - st.x) < 60 && Math.abs(q.y - st.y) < 30)) firsts.push(st);
    return { n: firsts.length, firstJumpFailed: firsts.filter((q) => q.ok === false).length, heights: [...new Set(firsts.filter((q) => q.ok === false).map((q) => Math.round(q.h)))].sort((a, b) => a - b) };
  }

  loopsReport() {
    return this.mem.loops().map((l) => {
      const near = this.whatAt.find((w) => Math.abs(w.x - l.x) < 80 && Math.abs(w.y - l.y) < 40) ?? this.stuck.find((s) => Math.abs(s.x - l.x) < 160) ?? null;
      return { ...l, what: near?.what ?? '', step: near?.step ?? null, dip: near?.dip ?? null, puzzle: !!near?.puzzle };
    });
  }

  goalNow() {
    return this.goal;
  }
}

/** hold the way on from the very first frame for 5 s (no jumps at all): what costs a heart or a life before anyone could react */
export function holdOn(id: string, seed: number, who: FirstTimer): { hit: Harm | null; life: Harm | null } {
  // (on a fresh phone, and the phone as it was is put back after: this probe is not part of the player's own play)
  const saved = phoneState();
  freshPhone(who.setting);
  try {
    return holdOnHere(id, seed);
  } finally {
    restorePhone(saved);
    setDifficulty(who.setting);
  }
}

/** what the phone remembers (lessons seen, tips heard, settings) */
export function phoneState(): Array<[string, string]> {
  const out: Array<[string, string]> = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k !== null) out.push([k, localStorage.getItem(k) ?? '']);
    }
  } catch {
    /* none */
  }
  return out;
}
export function restorePhone(st: Array<[string, string]>): void {
  try {
    localStorage.clear();
    for (const [k, v] of st) localStorage.setItem(k, v);
  } catch {
    /* none */
  }
}

function holdOnHere(id: string, seed: number): { hit: Harm | null; life: Harm | null } {
  const sim = new RealPlay(id, seed);
  sim.safe = false;
  const e = sim.e as Eng;
  sim.p.invincibleTimer = 0;
  let life: Harm | null = null;
  e.loseLife = (reason: string) => {
    life ??= { kind: 'life', t: +sim.t.toFixed(1), x: Math.round(sim.p.x), y: Math.round(sim.p.y), cause: reason === 'hurt' ? 'hit' : reason, onScreen: null };
    sim.died = true;
  };
  let hit: Harm | null = null;
  let hp = sim.p.hp;
  for (let i = 0; i < 5 * 30 && !sim.died; i++) {
    sim.frame({ right: true });
    if (sim.p.hp < hp && !hit) hit = { kind: 'hit', t: +sim.t.toFixed(1), x: Math.round(sim.p.x), y: Math.round(sim.p.y), cause: 'hit', onScreen: null };
    hp = sim.p.hp;
  }
  return { hit, life };
}

/** one stage, one setting: the run, judged */
export function firstTimer(id: string, seed: number, who: FirstTimer, opts: RunOptions & { fresh?: boolean; trial?: number } = {}): FTRun {
  const t0 = Date.now();
  const hold = holdOn(id, seed, who);
  if (opts.fresh !== false) freshPhone(who.setting);
  else setDifficulty(who.setting);
  // (the engine's own chances, the eagle's passes and the like, are seeded too: the same seed plays the same run)
  const mr = Math.random;
  Math.random = rng(seed * 104729 + (opts.trial ?? 0) * 31 + salt(who, 3, 5));
  let run: FirstTimerRun;
  try {
    run = new FirstTimerRun(id, seed, who, opts).play();
  } finally {
    Math.random = mr;
  }
  const end = run.t;
  // (FT_MISSED=1: the goal's pickups he never took, by x and what carried them, to trace a sealed door: BUILD-22)
  if (typeof process !== 'undefined' && process.env.FT_MISSED) {
    const cs = (run.sim.e as unknown as { collectibles: Array<{ type: string; x: number; y: number; collected: boolean; rides?: { id: number } }> }).collectibles;
    const left = cs.filter((c) => (c.type === 'flower' || c.type === 'leaf') && !c.collected);
    process.stderr.write(`  missed ${left.length}: ${left.map((c) => `${Math.round(c.x)},${Math.round(c.y)}${c.rides ? `@${c.rides.id}` : ''}`).join(' ')}\n`);
  }
  const harms = run.harms.map((h) => ({ ...h, t: +h.t.toFixed(1), x: Math.round(h.x), y: Math.round(h.y) }));
  const mins = Math.max(0.25, end / 60);
  const shown = run.dot.shown;
  const dot = dotReport(shown, end);
  const fh = firstHarms(run.harms, shown, who.heed);
  const loops = run.loopsReport();
  const out: FTRun = {
    who: who.name,
    setting: who.setting,
    seed,
    end: run.end,
    time: +end.toFixed(1),
    x: Math.round(run.sim.p.x),
    progress: +run.prog.share.toFixed(3),
    goal: run.goalNow(),
    holdOn: hold,
    opening: harms.filter((h) => h.t < 5),
    harms,
    perMin: { hits: +(harms.filter((h) => h.kind === 'hit').length / mins).toFixed(2), lives: +(harms.filter((h) => h.kind === 'life').length / mins).toFixed(2) },
    softFalls: run.softFalls.length,
    spurs: run.spursMet.size,
    handed: run.handed,
    ontoLog: run.ontoLog,
    fromLog: run.fromLog,
    gameOvers: run.gameOvers,
    firstHarm: fh,
    stuck: run.stuck,
    loops,
    stops: run.stopsReport(),
    puzzles: run.puzzles,
    rescues: run.rescues,
    rescueXs: run.rescueXs,
    softFallXs: run.softFalls.map((f) => Math.round(f.x)),
    dot,
    flags: [],
    tries: run.tries,
    noRoute: run.noRoute,
    turns: { n: run.turns, lag: +run.turnLag.toFixed(1) },
    backtrack: { route: run.routeRatio, bot: run.end === 'shrine' && run.direct > 0 && run.rescues === 0 ? +(run.walked / run.direct).toFixed(2) : null },
    frames: run.frames,
    ...(who.holdQ ? { secondPressMs: run.secondPressMs, maxX: Math.round(run.maxX), far: Math.round(run.farOn), xTrace: run.xTrace } : {}),
    ...(run.sim.e.cast ? { cast: castTally({ cast: run.sim.e.cast, player0: run.start }, run.knows('trap')) } : {}),
    ...(run.turnBacks ? { turnBacks: run.turnBacks } : {}),
    ms: Date.now() - t0,
  };
  out.flags = flagsFor(out);
  return out;
}

export interface CastTally { animals: number; cleared: Record<string, number>; left: number; traps: number; sprung: number; firstSprung: boolean; told: boolean }
/** the cast at the run's end, from the engine's own state (any stage that names a cast: no stage, kind or way is named here) */
/** (`told`: he learned the trap from Dot; `firstSprung`: the trap he comes to first, the nearest to the stage's start, is sprung) */
export function castTally(e: { cast: { members: Array<{ cleared: boolean; s: { beatenBy?: string | null } }>; traps: Array<{ phase: string; post: { x: number } }> }; player0?: { x: number } }, told = false): CastTally {
  const c = e.cast;
  const cleared: Record<string, number> = {};
  for (const m of c.members) if (m.cleared) cleared[m.s.beatenBy ?? '?'] = (cleared[m.s.beatenBy ?? '?'] ?? 0) + 1;
  const x0 = e.player0?.x ?? 0;
  const first = [...c.traps].sort((a, b) => Math.abs(a.post.x - x0) - Math.abs(b.post.x - x0))[0];
  return { animals: c.members.length, cleared, left: c.members.filter((m) => !m.cleared).length, traps: c.traps.length, sprung: c.traps.filter((t) => t.phase !== 'set').length, firstSprung: !!first && first.phase !== 'set', told };
}

/** what the run says needs looking at, worst first; each names the rule it breaks (RULES, from reference/STAGE-RULES.md) */
export function flagsFor(r: FTRun): Flag[] {
  const f: Flag[] = [];
  const add = (rule: RuleId, kind: Flag['kind'], sev: number, x: number | null, t: number | null, what: string) => f.push({ sev, kind, rule, x, t, what });
  const cause = (c: string) => (c === 'water' ? 'drowned' : c === 'pit' ? 'fell' : c === 'watcher' ? 'the watching eagle' : c.startsWith('foe:') ? `a ${c.slice(4)}` : c);
  const S = RULES.opening.secs;
  // Opening seconds: holding the way on from the first frame, and the bot's own first seconds
  if (r.holdOn.life) add('opening', 'opening', 100, r.holdOn.life.x, r.holdOn.life.t, `holding the way on from the start costs a life at ${r.holdOn.life.t} s (${cause(r.holdOn.life.cause)})`);
  else if (r.holdOn.hit) add('opening', 'opening', 85, r.holdOn.hit.x, r.holdOn.hit.t, `holding the way on from the start costs a heart at ${r.holdOn.hit.t} s`);
  for (const h of r.opening) add('opening', 'opening', h.kind === 'life' ? 95 : 80, h.x, h.t, `${h.kind === 'life' ? 'life lost' : 'hit'} in the first ${S} s (${cause(h.cause)}${h.onScreen === false ? ', from off screen' : ''})`);
  // ... and the first tip comes before the first hazard it teaches
  for (const h of r.firstHarm) {
    if (h.ok) continue;
    add('opening', 'before-tip', h.kind === 'life' ? 72 : 62, h.x, h.t, `${cause(h.cause)} ${h.kind === 'life' ? 'costs a life' : 'hits him'} at ${h.t} s; ${h.tip ? `Dot's tip that teaches it is on screen at ${h.tip.t} s ("${h.tip.text}")` : 'no tip of Dot teaches it'}`);
  }
  // 1-7's eagle: the first swoop must be harmless; swoops from on screen; hiding must work
  const eagle = r.harms.filter((h) => h.cause === 'watcher' && h.kind === 'hit');
  if (eagle.length) {
    const h = eagle[0];
    add('eagle', 'eagle', 68, h.x, h.t, `the watching eagle's first strike hurts (pass ${(h.pass ?? 0) + 1}, at ${h.t} s)${h.bush === null || h.bush === undefined ? ', no bush at his level' : h.bush > 150 ? `, the nearest bush ${h.bush} px away` : ''}${h.hiding ? ', while he was going for a bush' : ''}`);
    const off = eagle.filter((e) => e.onScreen === false).length;
    if (off) add('eagle', 'eagle', 64, null, null, `${off} of the eagle's ${eagle.length} strikes come from off screen`);
    const gaps = eagle.slice(1).map((e, i) => e.t - eagle[i].t);
    if (eagle.length > 1) add('eagle', 'eagle', 52 + Math.min(10, eagle.length), null, null, `the eagle hits him ${eagle.length} times (every ${Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length)} s on average; ${eagle.filter((e) => e.hiding).length} while he was hiding or going for a bush)`);
  }
  // Plain walk: a face or dip that stops a plain walk dead, a dip with no one-jump way out
  for (const l of r.loops) {
    // (a step or dip a jump should carry: waist to chest high; a taller face is a wall, a question of the way on)
    // (Plain walk: a dip (higher ground both sides) he cannot get out of, or a step up to chest height a plain jump does not carry; a
    // taller face on its own, or a fall, is a question of the way on)
    const dipOrStep = l.dip !== null || (l.step !== null && l.step <= 110);
    add(l.puzzle ? 'wayOn' : dipOrStep ? 'plainWalk' : 'wayOn', 'loop', (l.puzzle ? 30 : 50) + 4 * Math.min(6, l.n), l.x, null,
      `${l.deaths ? `lost ${l.deaths} lives${l.n > l.deaths ? ` and fell back ${l.n - l.deaths} times` : ''} at the same spot` : `fell back into the same spot ${l.n} times`} (${l.doubles} double jumps tried)${l.what ? `: ${l.what}` : ''}`);
  }
  if (r.stops.firstJumpFailed) add('plainWalk', 'stuck', 46, null, null, `${r.stops.firstJumpFailed} of the ${r.stops.n} faces that stopped his walk dead were not got over by his first plain jump (heights ${r.stops.heights.join(', ')} px)`);
  for (const s of r.stuck) {
    if (s.puzzle) continue;
    const plain = s.dip !== null || (s.step !== null && s.step <= 110);
    add(plain ? 'plainWalk' : 'wayOn', 'stuck', 44 + Math.min(16, s.dur / 2), s.x, s.t, `no progress for ${Math.round(s.dur)} s: ${s.what}${s.rescued ? ' (the bot was put further on)' : ''}`);
  }
  // the outcome
  if (r.noRoute) add('outcome', 'unfinished', 20, null, null, 'the inspector traced no route here, so the bot headed straight for the shrine: check this stage by hand');
  if (r.end !== 'shrine') add('outcome', 'unfinished', r.end === 'sealed door' ? 30 : 66, r.x, r.time, r.end === 'sealed door' ? `reached the shrine short of the goal (${r.goal?.got ?? '?'} of ${r.goal?.need ?? '?'})` : `did not reach the shrine (${r.end}, ${Math.round(r.progress * 100)}% along the way)`);
  const hits = r.harms.filter((h) => h.kind === 'hit').length, lives = r.harms.filter((h) => h.kind === 'life').length;
  if (r.perMin.hits > RULES.outcome.hitsPerMin || r.perMin.lives > RULES.outcome.livesPerMin) add('outcome', 'harm-rate', 40 + Math.min(15, r.perMin.lives * 10 + r.perMin.hits), null, null, `${hits} hits and ${lives} lives lost in ${Math.round(r.time)} s (${r.perMin.hits} hits, ${r.perMin.lives} lives a minute)${r.gameOvers ? `, ${r.gameOvers} game overs` : ''}`);
  // Dot pacing
  for (const l of r.dot.long) add('dot', 'dot-long', l.outOfReach ? 36 : 28, null, l.t, `"${l.text}" up ${Math.round(l.dur)} s${l.outOfReach ? ' with its thing out of reach' : ''}`);
  for (const p of r.dot.repeats) add('dot', 'dot-repeat', 20 + 2 * p.n, null, p.at[1], `"${p.text}" said ${p.n} times (at ${p.at.join(', ')} s)`);
  for (const p of r.dot.reteach) add('dot', 'dot-reteach', 24, null, p.t, `"${p.text}" teaches a move he had already done`);
  if (r.dot.quick.length) add('dot', 'dot-quick', 14 + Math.min(10, r.dot.quick.length), null, r.dot.quick[0].t, `${r.dot.quick.length} of her ${r.dot.heard} lines start under ${RULES.dot.gap} s after the one before (first at ${r.dot.quick[0].t} s: "${r.dot.quick[0].text}", ${r.dot.quick[0].gap} s after "${r.dot.quick[0].after}")`);
  for (const p of r.dot.wordy) add('dot', 'dot-words', 12, null, p.t, `"${p.text}" is ${p.words} words (under ${RULES.dot.words})`);
  return f.sort((a, b) => b.sev - a.sev);
}

// ───────────────────────────── the Gemini gates (Part 2 §8; GEMINI-LEDGER F3, F5) ─────────────────────────────

/** one jump edge: every try he made from one spot (60 px across, 30 px up), across all runs */
export interface Edge {
  x: number;
  y: number;
  tries: number;
  ok: number;
  /** survival rate: tries that got him on without a hit or a lost life */
  sr: number;
  /** first try (s) */
  t: number;
  /** the first good try, when there was one */
  good?: Try;
}

export function edgesOf(tries: Try[]): Edge[] {
  const out: Edge[] = [];
  for (const tr of [...tries].sort((a, b) => a.t0 - b.t0)) {
    let e = out.find((q) => Math.abs(q.x - tr.x) < 60 && Math.abs(q.y - tr.y) < 30);
    if (!e) out.push((e = { x: Math.round(tr.x), y: Math.round(tr.y), tries: 0, ok: 0, sr: 0, t: +tr.t0.toFixed(1) }));
    e.tries++;
    if (tr.ok) {
      e.ok++;
      e.good ??= tr;
    }
  }
  for (const e of out) e.sr = +(e.ok / e.tries).toFixed(2);
  return out;
}

/**
 * Peak consecutive stress: an edge's risk is the share of his tries there that failed or hurt (0-1); edges with less than a rest pad of
 * plain going between them (2.0 s Easy, 1.0 s Normal: the research's T_min_recovery) are one burst; the peak is the burst with the most.
 */
export function peakStress(edges: Edge[], rest: number): { peak: number; at: { x: number; t: number } | null; bursts: number } {
  const passed = edges.filter((e) => e.good).sort((a, b) => a.good!.t0 - b.good!.t0);
  let peak = 0, at: { x: number; t: number } | null = null, bursts = 0;
  let sum = 0, start: Edge | null = null, lastEnd = -1e9;
  for (const e of passed) {
    const g = e.good!;
    if (g.t0 - lastEnd > rest) {
      if (start) bursts++;
      sum = 0;
      start = e;
    }
    sum += 1 - e.sr;
    if (sum > peak) {
      peak = sum;
      at = { x: start!.x, t: +start!.good!.t0.toFixed(1) };
    }
    lastEnd = g.t1;
  }
  if (start) bursts++;
  return { peak: +peak.toFixed(2), at, bursts };
}

/**
 * The input window of a jump, in the real engine: from a short walk-up to where he took off, the press is moved a frame earlier or later
 * at a time (with his own flick and his own second flick) until it no longer lands where his good try did. The window is how many
 * frames work in a row around his own take-off, at 30 fps. Only jumps he took running (a gap, a ledge), on still ground to still ground
 * (a moving platform's timing is not the press's); the world around it (an animal walking) is as it is at that moment of a fresh run.
 */
export function inputWindows(id: string, seed: number, who: FirstTimer, edges: Edge[], max = 12): Array<{ x: number; y: number; frames: number; ms: number; wide: boolean }> {
  setDifficulty(who.setting);
  const sim = new RealPlay(id, seed);
  const still = (pid: number) => {
    const q = sim.platforms.find((pl) => pl.id === pid);
    return !!q && q.type !== 'moving' && q.type !== 'drift' && q.type !== 'fragile';
  };
  const floorAt = (x: number, y: number) => sim.platforms.find((q) => !q.broken && x >= q.x && x <= q.x + q.width && Math.abs(q.y - y) < 3);
  const out: Array<{ x: number; y: number; frames: number; ms: number; wide: boolean }> = [];
  const pick = edges.filter((e) => e.good && e.good.running && e.good.land && still(e.good.land.id) && e.good.dir !== 0).sort((a, b) => a.sr - b.sr || a.t - b.t).slice(0, max);
  for (const e of pick) {
    const g = e.good!;
    const dir = g.dir as -1 | 1;
    const from = floorAt(g.x, g.y);
    if (!from || !still(from.id)) continue;
    const run = Math.min(150, dir > 0 ? g.x - from.x - 4 : from.x + from.width - g.x - 4);
    if (run < 40) continue;
    const sx = g.x - dir * run;
    const side: Pad = dir > 0 ? { right: true } : { left: true };
    // frames of walking until he is where he took off
    sim.stand(sx, from.y);
    let n0 = 0;
    while (n0 < 45 && (sim.p.x - g.x) * dir < 0) {
      sim.frame(side);
      n0++;
    }
    const holdF = Math.max(2, Math.round(g.hold / DT));
    const tryAt = (n: number): boolean => {
      if (n < 1) return false;
      sim.stand(sx, from.y);
      for (let i = 0; i < n; i++) sim.frame(side);
      let air = false, pressed2 = false;
      for (let i = 0; i < 90; i++) {
        const pad: Pad = { ...side };
        if (i === 0) pad.press = true;
        if (i < holdF) pad.jump = true;
        if (g.kind === 'double' && !pressed2 && i > holdF && !sim.p.grounded && sim.p.vy > -80) {
          pressed2 = true;
          pad.press = true;
          pad.jump = true;
        }
        sim.frame(pad);
        if (sim.died) return false;
        if (!sim.p.grounded) air = true;
        else if (air) return sim.standingOn === g.land!.id || (Math.abs(sim.p.y - g.land!.y) < 6 && Math.abs(sim.p.x - g.land!.x) < 160);
      }
      return false;
    };
    if (!tryAt(n0)) continue; // (not reproduced from a fresh start: left out)
    let lo = 0, hi = 0;
    while (hi < 8 && tryAt(n0 + hi + 1)) hi++;
    while (lo < 10 && tryAt(n0 - lo - 1)) lo++;
    const frames = lo + hi + 1;
    out.push({ x: e.x, y: e.y, frames, ms: Math.round(frames * DT * 1000), wide: hi >= 8 || lo >= 10 });
  }
  return out;
}

export interface Gates {
  survival: { gate: number; edges: number; min: number | null; below: Array<{ x: number; y: number; sr: number; tries: number }> };
  window: { gate: number; measured: number; min: { x: number; ms: number } | null; below: Array<{ x: number; ms: number }> };
  stress: { gate: number; peak: number; at: { x: number; t: number } | null; bursts: number };
  backtrack: { gate: [number, number]; route: number | null; bot: number | null };
  turns: { n: number; lag: number };
}

/** the gates for one stage and setting, over all its runs */
export function gatesFor(setting: FirstTimer['setting'], tries: Try[], windows: Array<{ x: number; ms: number }>, route: number | null, bot: number | null, turns: { n: number; lag: number }): Gates {
  const G = GATES[setting];
  const edges = edgesOf(tries);
  // (the research flies 20 bots over each edge; with a few runs an edge needs 3 tries before its rate means anything)
  const counted = edges.filter((e) => e.tries >= 3);
  const below = counted.filter((e) => e.sr < G.survival).map((e) => ({ x: e.x, y: e.y, sr: e.sr, tries: e.tries }));
  const wmin = windows.length ? windows.reduce((a, b) => (b.ms < a.ms ? b : a)) : null;
  return {
    survival: { gate: G.survival, edges: counted.length, min: counted.length ? Math.min(...counted.map((e) => e.sr)) : null, below },
    window: { gate: G.windowMs, measured: windows.length, min: wmin ? { x: wmin.x, ms: wmin.ms } : null, below: windows.filter((w) => w.ms < G.windowMs).map((w) => ({ x: w.x, ms: w.ms })) },
    stress: { gate: G.stress, ...peakStress(edges, G.rest) },
    backtrack: { gate: G.backtrack, route, bot },
    turns,
  };
}

/** Part 2 §8's numbers (Normal's survival is for Worlds 1-5) */
export const GATES = {
  easy: { survival: 0.85, windowMs: 300, stress: 2.5, rest: 2.0, backtrack: [1.0, 1.25] as [number, number] },
  normal: { survival: 0.7, windowMs: 167, stress: 5.5, rest: 1.0, backtrack: [1.15, 1.6] as [number, number] },
} as const;

// ───────────────────────────── one stage, several runs ─────────────────────────────

export interface FTStage {
  id: string;
  who: FirstTimer['name'];
  setting: FirstTimer['setting'];
  seed: number;
  trials: number;
  /** each run (thumb seeds differ), without its tries */
  runs: Array<Omit<FTRun, 'tries'>>;
  gates: Gates;
  windows: Array<{ x: number; y: number; frames: number; ms: number; wide: boolean }>;
  /** the runs' findings, one per spot and kind, worst first, with how many runs had it */
  flags: Array<Flag & { runs: number }>;
  ms: number;
}

/** a stage on one setting: `trials` runs (the same layout, different thumbs), the gates over all of them, the findings merged */
export function firstTimerStage(id: string, seed: number, who: FirstTimer, o: RunOptions & { trials?: number; fresh?: boolean; windows?: number } = {}): FTStage {
  const t0 = Date.now();
  const n = Math.max(1, o.trials ?? 2);
  const runs: FTRun[] = [];
  // (every run starts from the phone as it was: what the first run learned, lessons seen and tips heard, is kept for the next stage)
  if (o.fresh !== false) freshPhone(who.setting);
  const before = phoneState();
  let after = before;
  for (let i = 0; i < n; i++) {
    restorePhone(before);
    runs.push(firstTimer(id, seed, who, { ...o, trial: i, fresh: false }));
    if (i === 0) after = phoneState();
  }
  restorePhone(after);
  const tries = runs.flatMap((r) => r.tries);
  const windows = o.windows === 0 ? [] : inputWindows(id, seed, who, edgesOf(tries), o.windows ?? 12);
  const done = runs.filter((r) => r.backtrack.bot !== null);
  const gates = gatesFor(who.setting, tries, windows, runs[0].backtrack.route, done.length ? +(done.reduce((a, r) => a + r.backtrack.bot!, 0) / done.length).toFixed(2) : null, {
    n: Math.round(runs.reduce((a, r) => a + r.turns.n, 0) / n),
    lag: +(runs.reduce((a, r) => a + r.turns.lag, 0) / n).toFixed(1),
  });
  // the findings: the same kind at the same spot (within 200 px) in several runs is one finding
  const merged: Array<Flag & { runs: number }> = [];
  runs.forEach((r) => {
    const mine = new Set<Flag & { runs: number }>();
    for (const f of r.flags) {
      const textKey = f.what.replace(/[\d.]+/g, '#');
      const m = merged.find((q) => !mine.has(q) && q.rule === f.rule && q.kind === f.kind && (f.x === null || q.x === null ? f.x === q.x && (f.x !== null || q.what.replace(/[\d.]+/g, '#') === textKey || f.kind.startsWith('dot') || f.kind === 'harm-rate' || f.kind === 'unfinished') : Math.abs(q.x - f.x) < 200));
      if (m) {
        m.runs++;
        mine.add(m);
        if (f.sev > m.sev) Object.assign(m, f, { runs: m.runs });
      } else {
        const q = { ...f, runs: 1 };
        merged.push(q);
        mine.add(q);
      }
    }
  });
  for (const f of gateFlags(gates, who.setting)) merged.push({ ...f, runs: n });
  const score = (f: Flag & { runs: number }) => f.sev * (0.6 + 0.4 * (f.runs / n));
  merged.sort((a, b) => score(b) - score(a));
  // (at most 4 of one kind: the rest are named in one line)
  const flags: Array<Flag & { runs: number }> = [];
  const byKind = new Map<string, Array<Flag & { runs: number }>>();
  for (const f of merged) {
    const k = `${f.rule}|${f.kind}`;
    const list = byKind.get(k) ?? [];
    list.push(f);
    byKind.set(k, list);
    if (list.length <= 4) flags.push(f);
  }
  for (const list of byKind.values()) {
    if (list.length <= 4) continue;
    const rest = list.slice(4);
    const xs = rest.map((f) => f.x).filter((x): x is number => x !== null);
    flags.push({ ...rest[0], sev: rest[0].sev - 5, x: null, t: null, what: `and ${rest.length} more like that${xs.length ? ` (x ${xs.slice(0, 8).join(', ')}${xs.length > 8 ? '...' : ''})` : ''}` });
  }
  flags.sort((a, b) => score(b) - score(a));
  return { id, who: who.name, setting: who.setting, seed, trials: n, runs: runs.map(({ tries: _t, ...r }) => r), gates, windows, flags, ms: Date.now() - t0 };
}

/** findings from the gates */
export function gateFlags(g: Gates, setting: FirstTimer['setting']): Flag[] {
  const f: Flag[] = [];
  const pct = (v: number) => `${Math.round(v * 100)}%`;
  for (const b of g.survival.below.slice(0, 6)) f.push({ sev: 40 + 20 * (1 - b.sr / g.survival.gate), kind: 'gate-survival', rule: 'survival', x: b.x, t: null, what: `a jump he gets over ${pct(b.sr)} of the time (${b.tries} tries; gate ${pct(g.survival.gate)} on ${setting === 'easy' ? 'Easy' : 'Normal'})` });
  for (const w of g.window.below.slice(0, 4)) f.push({ sev: 38 + Math.min(12, (g.window.gate - w.ms) / 20), kind: 'gate-window', rule: 'window', x: w.x, t: null, what: `a jump whose press works only within ${w.ms} ms (gate ${g.window.gate} ms)` });
  if (g.stress.peak > g.stress.gate) f.push({ sev: 36, kind: 'gate-stress', rule: 'stress', x: g.stress.at?.x ?? null, t: g.stress.at?.t ?? null, what: `a burst of jumps with stress ${g.stress.peak} before a rest (gate ${g.stress.gate})` });
  const r = g.backtrack.route;
  // (only too long a path is a finding: a straight run under Normal's 1.15 is shown, not flagged)
  if (r !== null && r > g.backtrack.gate[1] + 0.005) f.push({ sev: 18, kind: 'gate-backtrack', rule: 'backtrack', x: null, t: null, what: `the main route is ${r} times the straight line from start to shrine (gate ${g.backtrack.gate[0]}-${g.backtrack.gate[1]})` });
  return f;
}
