import { buzz } from './haptics.ts';
import { SlowWatch } from './slowTip.ts';
import { drawW7Chairs } from './w7ChairsArt.ts';
import { drawSentrySprite } from './sentrySprite.ts';
import { lastSheet } from './atlasLoader.ts';
import { FlipFlopWatch, frameSpread, JitterWatch } from './glitchWatch.ts';
import { goalLine } from './stagePlan.ts';
import { FIRST_OF_STAGE, markTipHeard, tipHeard } from './tipMemory.ts';
import { harmlessPass, hidden, lureShadow, newWatch, sees, shadowX as plainShadowX, stepWatch, WATCH, zoneAt, type WatchState } from './watcher.ts';
import { caught, newChase, restartAt, sectionState, stepChase, type ChaseState } from './chase.ts';
import { newTide, onHeld, restartTide, stepTide, surging, TIDE, type TideSetting, type TideState } from './risingTide.ts';
import { drawBadWater } from './badWaterArt.ts';
import { drawStiltDecor, drawStiltLedges } from './w6StiltArt.ts';
import { recorder } from './playRecorder.ts';
import { liftY, pickFloor } from './lift.ts';
import { StuckWatch, stuckLine } from './stuckHelper.ts';
import { W5_STEP_HELP, W5_STEP_HELP_KEYS, W5_STEP_HELP_PAD } from './w5Lines.ts';
import { KICK_NEAR_PX, refinedControls } from './refinedControls.ts';
import { SectionTrack } from './sectionTrack.ts';
import { isGen2Stage } from './gen2/game.ts';
import { difficulty, easeInShare, isEasy } from './difficulty.ts';
import { VINE_HANG } from './heroVine.ts';
import { easyStage } from './easyMode.ts';
import { withGoals } from './goals.ts';

import type {
  LevelConfig,
  PlayerState,
  Enemy,
  BossEntity,
  Collectible,
  Platform,
  Vine,
  Rope,
  Camera,
  Particle,
  FloatingText,
} from './types.ts';
import { WORLDS_DATA } from './worldsData.ts';
import type { StageStats } from './badges.ts';
import { loadCosmetic } from './badgeStore.ts';
import { setHeroCoat } from './heroSprite.ts';
import { generateStage, GeneratedStage } from './stageGenerator.ts';
import { coachWanted, firstJumpSpot, markCoachDone, TouchCoach, type CoachStep } from './touchCoach.ts';
import { controlStyle } from './controlPrefs.ts';
import { cardSafe, DONE_LESSONS, HARMLESS_LESSONS, lessonDone, lessonInputMode, lessonsOn, lessonsSeen, lessonStale, markLessonSeen, pickLesson, type LessonId } from './lessons.ts';
import { rockAt } from './rockfall.ts';
import { gameSpeed, startingLives } from './assist.ts';
import { ASSIST, DOUBLE_RISE, EDGE, FORGIVE, LEAN_SPEED, PHYS, airCarry, airTakeOff, blockBeside, secondJumpV, canGrabSwing, easeAssist, inSweetSpot, knockDir, newAirDrive, releaseCall, RELEASE, setTimedSwing, swingGrab, swingLanding, SWING_LAND, swingStep, swingSetup, timedLaunch, vineAmp, vineAngle, type SwingState } from './physics.ts';
import { jumpHelp } from './jumpHelp.ts';
import { HAND_REACH, HANG_DROP, ROPE_GRAB, ROPE_SPEED, ropeYAt } from './rope.ts';
import { drawRopes, ropeDip, type RopeLoad } from './ropeArt.ts';
import { learnedSkills, type SkillId } from './skills.ts';
import { newGlide, glideStep, glideBrake, glideLift, drawGlideLeaf } from './glide.ts';
import { drawGlideSprite, drawLeafBit } from './leafSprites.ts';
import { renderScenery, renderOverlay, setCanopy, setReveal, setWeatherAvoid, lookFor } from './scenery.ts';
import { revealSet, setBackdropStage } from './paintedBackdrops.ts';
import { polishEnabled, polishTier, setPolishTier, pskip, rigFor, drawGroundShadow, drawBackGlow, drawLit, drawBloom, type Rig } from './polish.ts';
import { setSceneSeed, rollSceneSeed, getSceneSeed } from './sceneSeed.ts';
import { drawEagleSprite } from './eagleSprite.ts';
import { sovereignSprite } from './sovereignSprite.ts';
import { startDive, stepDive, stepGlide } from './harpyDive.ts';
import { drawJennifurSprite, jennifurSpriteReady } from './jennifurSprite.ts';
import { drawSnakeSprite } from './snakeSprite.ts';
import { drawGoldSnake } from './goldSnake.ts';
import { drawTayraSprite } from './tayraSprite.ts';
import { drawHarpyFallback, drawHarpySprite } from './harpySprite.ts';
import { drawOcelotSprite } from './ocelotSprite.ts';
import { drawBoaSprite } from './boaSprite.ts';
import { drawSpiderSprite } from './spiderSprite.ts';
import { drawFrogSprite } from './frogSprite.ts';
import { drawCaimanSprite } from './caimanSprite.ts';
import { drawJaguarSprite } from './jaguarSprite.ts';
import { renderWorldObjects, drawWater } from './terrain.ts';
import { deepEnough, kitPools, poolAt, startsSwim, SWIM, SWIM_CAM, SWIM_FIRST_LINE, SWIM_LINES, swimStep, underOf, type CalmPool, type SwimState } from './swim.ts';
import { drawCalmWaterBack, drawCalmWaterFront, drawCalmWaterPlain } from './calmWaterArt.ts';
import { swimHeadY } from './heroSwim.ts';
import { drawLadder, drawLily, drawLogComing, drawRiverLog, drawRiverWater, drawW2Cage, drawW2Decor, drawW2Lift, riverArtReady } from './riverArt.ts';
import { driftCycle, driftProgress, driftX, floodLevel, logClock, LOG_DROP, DRIFT_CATCH } from './river.ts';
import { heard, NOISE } from './noise.ts';
import { mayRegrow, regrowDelay } from './regrow.ts';
import { zoneEffect, windPush, zoneDrag, columnHit, inZone, ventLift, drowsyLevel, drowsySpeed, drowsyJump, GLOW_STILL, GLOW_REACH } from './zones.ts';
import { drawGlowworm, drawThornVine, drawW3Decor, drawW3Fern, drawW3Piece, GLOWWORM_H, w3FernHeight } from './w3Art.ts';
import { inReach, VINE, vinePeriod, vinePhase, vineSees } from './thornVine.ts';
import { drawAbyss, drawLandingShadow, W4Play } from './w4Play.ts';
import { cardScale, W5Play } from './w5Play.ts';
import { KitPlay, type KitHost } from './puzzlePlay.ts';
import { drawKitDecor } from './puzzleArt.ts';
import { drawDress } from './dressArt.ts';
import { drawWaterSign, signRattle } from './waterSign.ts';
import { ROOM_CAM, roomCentre, roomFloor, roomLean, roomView } from './puzzleCamera.ts';
/** no World 5 pieces for Dot to point at (any other world) */
const NO_W5_THINGS: readonly never[] = [];
import { setGuideKeepOuts, type KeepOutBox } from './guideKeepOut.ts';
import { recordCake } from './w5Kit.ts';
import { DotRun } from './dotFlightRun.ts';
import { SlideRun } from './w7SlideRun.ts';
import { MeecaPlay, MEECA_REACH, type MeecaControls } from './meecaPlay.ts';
import { drawMeecaBack, drawMeecaFront, drawMeecaHero, drawNightGrade, drawSay, drawSceneBox, drawThought, drawTitleCard, warmMeecaArt, wordsBox } from './meecaArt.ts';
import { tipText } from './puzzleKit.ts';
import { DotLog } from './dotRecord.ts';
import { FALLS } from './waterfalls.ts';
import { drawNest } from './w4Nests.ts';
import { drawCheckpointArt } from './stageArt.ts';
import { drawW4Bush } from './w4Art.ts';
import { camAnchor, camLook, camRun, CAM, FRAME, framing, RUN, runOffset, snapCam, HUD_BAND, landingAhead, landingBox, showBoth, underHud, keepHeroX, type Box } from './cameraFollow.ts';
import { ArrivalWarm, warmStageSheets } from './sheetWarm.ts';
import { drawZoneBases, drawZoneEffects, drawDrowsyVeil, drawCrumbleTiles, drawDarkness } from './zoneArt.ts';
import {
  drawHeroSloth,
  drawTreeSnake,
  drawHarpyEagle,
  drawOcelot,
  drawHazardEntity,
  drawGirlfriendDaisy,
  drawCollectible,
  pickupName,
} from './vectorArt.ts';
import {
  checkAABBCollision,
  distance2D,
  isObjectiveComplete,
  calculateLevelStars,
  calculateHitScore,
  atExitDoor,
  atSealedDoor,
  ascentProgress,
  SHRINE_STOP,
} from './rules.ts';
import { InputEngine } from './inputEngine.ts';
import { sound } from './audio.ts';
import { FIND_BY_ID } from './finds.ts';
import { bossMaterial, materialFor } from '../audio/combat.ts';
import { FEET, endStagger, isPredator, staggerPredator, stepPredator, stepSpider, turtleGuard } from './predatorAI.ts';
import { drawTurtle, drawTurtleSprite } from './turtleArt.ts';
import { drawGuardSprite } from './guardArt.ts';
import { assignTerritories, keepOnLedge, separateHunters, walkBounds } from './enemyBrain.ts';
import {
  applyHit, bodyRect, canCancel, chooseMove, contactPoint, headRect, hurtRect, isCommitted, koLaunch, moveBox, moveLength, MOVES, phaseAt,
  playerHurtRect, rectsOverlap, resolveMelee, stompSpec, stompTest, swingPose, sweptBox, TRAITS,
  type AttackWant, type MoveId, type MoveSpec, type Rect,
} from './fight.ts';
import { drawJaguar, drawBoa, drawCaiman, drawTayra } from './predators.ts';
import { drawEntrance, ENTRANCE_LONG, entranceBeat, takeEntranceLength } from './bossEntrance.ts';
import { queenTeaTableX } from './lairQueen.ts';
import { drawLairBack, drawLairFront, drawLairObjects, drawLairWorld, lairOwnsScene } from './lairArt.ts';
import { EASY_OPEN_MUL, bodyHurts, hazardBox, interruptBoss, stepBoss, stepHazards, vulnerability, weakOpen, weakRect } from './bossAI.ts';
import type { BossCtx, BossDef, BossHazard } from './bossAI.ts';
import { bossDefForLevel } from './bossDefs.ts';
import { hitLabel, hitsLeft } from './bossHits.ts';
import { drawBossOverDark, drawGroundCues } from './bossCues.ts';
import { prowlerGlow } from './lairProwler.ts';
import { baseScale, bossViewWidth, bossViewX, keepInView } from './bossCamera.ts';
import { fadeShove, gustPush, makePillars, PILLAR, screechShove, type SkyPillar } from './sovereignFight.ts';
import { CHIME_POSTS, chimeAngle, drawBackCue, drawChimePost, drawScreechCue, setSovereignPillars } from './sovereignArt.ts';
import { maxHearts } from './secret.ts';
import { BRANCH_TILE, drawLeafCover, drawPushLog, drawSeed, markSeedFound, seedFound, type ProtoExtras } from './protoStage.ts';
import { CHEER_SECONDS, hasClip, heroClipsEnabled, heroClipsLive, resetHeroClips, warmHeroClips } from './heroClips.ts';
import { bushHeight, drawBushArt, drawChaseBroken, drawEarthWall, setLianaTops, drawChaseSection, drawCrownArt, drawCurtainArt, drawHollowArt, drawProtoScene, drawSeedArt, hasKit, paintedKitEnabled, setGroundPaint, setKitWorld, paintedPlatforms, protoArtReady, type ProtoSceneState } from './protoArt.ts';
import { drawFx, fxFrame } from './bossFx.ts';
import { drawGritBit, drawSoftShadow } from './w4Grit.ts';
import { drawBossFighter, drawHazards } from './bossArt.ts';
import { drawAura } from './readable.ts';
import { FrameGovernor, startQuality, noteStepDown, noteStepUp } from './frameGovernor.ts';
import { perfEnabled, perfLog, perfNote } from './perfLog.ts';
import { dotHelp } from './dotGuideHelp.ts';
import type { GuideView } from './dotGuideView.ts';
import { FONT_UI } from './fonts.ts';
import { withHurtFlash } from './hurtFlash.ts';
import { shakeOffset } from './screenShake.ts';

/** how far right of the painted tea table the Queen stands for her tea (her pot hangs over it as she faces left) */
const TEA_STAND = 150;
/** a landing this fast (px/s down) buzzes the phone (AN-9): a drop of about two body heights or more, not a hop */
const HARD_LAND_VY = 560;

/** the banner that dodges Pokey (markWayDodge): on for everyone since Matt approved it (2026-10-24); `?waydodge=0` turns it off */
function wayDodgeOn(): boolean {
  try {
    return !/[?&]waydodge=0\b/.test(location.search);
  } catch {
    return true;
  }
}

/** How many world units tall the screen shows. */
/** how long Pokey crouches beside a Hush Fern before it gives up what it hides */
const FIND_SEARCH_SECONDS = 0.9;
/** how near a flower must be to pick it while swinging on a vine (34 on foot) */
const SWING_PICK = 56;
/** a Jump or a direction let go this short a time before a pause still counts as held when play carries on (seconds) */
const HELD_RECENT = 0.35;
/** how fast Pokey pushes a hollow log (px/s): slower than a walk, so it reads as effort */
const PUSH_SPEED = 120;

const WORLD_VIEW_H = 540;
/** world units across a portrait screen */
/**
 * In the air against a wall too tall to catch the lip of, he slides down it: his drawing stands this far off the face, so his reaching paw
 * is not planted on it and it does not read as a grab that ought to hold (QA, 2026-10-26: a first-timer kept trying to climb 1-1's stones
 * by their sides). Only the picture moves; the lip catch, his body and every reach stay as they were.
 */
const WALL_OFF = 9;
const PORTRAIT_VIEW_W = 440; // was 360: only ~270 units of warning ahead of the hero in portrait
/** the play-start dolly-in: begins at this fraction of the final zoom and settles over this long */
/** how fast the shift that shows a landing across a gap eases in and out (per second), and for a landing still out of the view */
const LAND_EASE = { rate: 4.5, fast: 10 } as const;
const INTRO_ZOOM_FROM = 0.9; // a gentle dolly: the old 0.78 opened on a wide shot full of dark ground, so every stage began noticeably darker
const INTRO_ZOOM_SECS = 1.3;

export interface GameEngineCallbacks {
  onProgressUpdate: (
    current: number,
    target: number,
    score: number,
    hp: number,
    distanceRatio?: number,
    activePowerUp?: 'speed' | 'invincible' | 'magnet' | null,
    powerUpTimer?: number
  ) => void;
  onVictory: (stars: number, timeSec: number, score: number) => void;
  onDefeat: (score: number) => void;
  /** the stage ended (won or lost): what happened, for the Trophy Room. Sent just before onVictory / onDefeat. */
  onStageStats?: (stats: StageStats) => void;
  onLivesChange?: (lives: number, maxLives: number) => void;
  /** the game loop failed over and over: the app should leave the stage */
  onFatal?: () => void;
  /** the picture is at its lightest and still under 10 frames a second for a while: the app may show the one-time tip (slowTip.ts) */
  onSlowDevice?: () => void;
  /** a guiding line (a stage tip, the goal, a reminder, the sealed door): the app has Dot say it (Wayside.tsx) */
  onGuide?: (text: string, seconds: number, passed?: boolean) => void;
  onBossEncounter?: (boss: BossEntity) => void;
  /** Pokey stepped through the hidden Thorn Gate */
  onSecret?: () => void;
  /** Pokey picked up a note, book or keepsake (see finds.ts); the app shows it */
  onFind?: (findId: string) => void;
  /** the boss bar: sent only when something on it changes */
  /** the first-stage lesson moved to a new step (or ended): the app shows or clears the hint */
  onCoach?: (step: CoachStep) => void;
  /** a first-time lesson is due: the stage has paused itself, and the app shows the card (then calls lessonClosed) */
  onLesson?: (id: LessonId) => void;
  onBossUpdate?: (info: { name: string; hp: number; maxHp: number; phase: number; hits?: number; color?: string; entering?: boolean } | null) => void;
  /** Meeca's stage: its title card or its ending is up (the HUD steps aside), or not */
  onCinematic?: (on: boolean) => void;
}

/** World 5's low steps for the stuck-helper (px above his feet: a face one jump climbs), and how long the stillness waits after it speaks */
export const STEP_FACE = { min: 30, max: 100 } as const;
/**
 * World 5's step help (takeOff): a step this many px above his feet (one plain jump's climb: it rises about 108), with its face no more
 * than `near` px from his body, is where a plain flick up with the thumb lifted carries him onto it
 */
export const STEP_UP = { min: 20, max: 96, near: 14 } as const;
/** World 5: how far over a ledge's edge the lip's hoist puts his body (px past the face), so a foot is on it (the floor check wants ~8) */
export const LIP_IN = 13;
const STUCK_HOLD = 7;

/** the swing's sweet-spot glow on the vine (a soft warm disc), painted once */
let sweetGlowCv: HTMLCanvasElement | null = null;
function sweetGlowPic(): HTMLCanvasElement | null {
  if (sweetGlowCv || typeof document === 'undefined') return sweetGlowCv;
  const cv = document.createElement('canvas');
  cv.width = cv.height = 64;
  const g = cv.getContext('2d');
  if (!g) return null;
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255, 246, 200, 0.95)');
  gr.addColorStop(0.35, 'rgba(255, 214, 90, 0.55)');
  gr.addColorStop(1, 'rgba(255, 196, 40, 0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, 64, 64);
  sweetGlowCv = cv;
  return cv;
}

/** at most this many particles at once: past it the oldest is reused (AN-5: one pooled system with a cap) */
const MAX_PARTICLES = 260;
/** the colour of the bits a creature leaves when it is knocked out: its own (fur, scales, feathers), not one green for all */
const DEBRIS_COLOR: Partial<Record<string, string>> = {
  snake: '#4d7c0f', eagle: '#f59e0b', harpy: '#9ca3af', ocelot: '#e0a64b', jaguar: '#d4a03a', boa: '#65a30d', caiman: '#6b7d3a',
  tayra: '#5b3a24', frog: '#38bdf8', spider: '#6b4f3a', turtle: '#7c8a3a',
};

/**
 * A painted particle, by its type (types.ts Particle): the dust puff and the hit spark (a frame for how far through its life it is, fading
 * at the end; the spark with a brief warm glow), a leaf tumbling, a chip of grit spinning, a puff of spray, the splash crown, a feather
 * see-sawing down. Nothing is drawn while the sheets load (stagePreload has them ready before a stage starts).
 */
function drawFxParticle(ctx: CanvasRenderingContext2D, pt: Particle) {
  const u = 1 - pt.life / pt.maxLife;
  const seed = pt.seed ?? 0.5;
  const fade = Math.min(1, (1 - u) * 3);
  const spin = (seed - 0.5) * 18;
  switch (pt.type) {
    case 'puff':
      drawFx(ctx, fxFrame('dust', u), pt.x, pt.y, pt.size, { ay: 0.9, alpha: fade * 0.92 });
      return;
    case 'leaf':
      drawLeafBit(ctx, pt.color === 'warm' ? 'warm' : 'green', seed, pt.x, pt.y, pt.size * 4.2, seed * 6 + spin * 0.4 * u, Math.cos(u * 9 + seed * 6), fade);
      return;
    case 'grit':
      drawGritBit(ctx, seed, pt.x, pt.y, pt.size * 2.6, seed * 6 + spin * u, fade, pt.color || undefined);
      return;
    case 'water':
      drawFx(ctx, fxFrame('dust', Math.min(0.99, 0.2 + u * 0.8)), pt.x, pt.y, pt.size * 5, { ay: 0.5, alpha: fade * 0.75, recolor: '#e0f2fe', flipX: seed > 0.5 });
      return;
    case 'splash':
      drawFx(ctx, 'splash', pt.x, pt.y, pt.size * (0.7 + 0.45 * u), { ay: 1, h: pt.size * (0.75 + 0.35 * Math.sin(Math.PI * Math.min(1, u * 1.3))) * 0.75, alpha: Math.min(1, (1 - u) * 2.2) });
      return;
    case 'feather':
      drawFx(ctx, 'feather', pt.x, pt.y, pt.size * 4.5, { rot: seed * 6 + Math.sin(u * 8 + seed * 5) * 0.8, alpha: fade, flipX: seed > 0.5 });
      return;
    case 'flash':
      break;
    default:
      return;
  }
  if (u < 0.45) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const r = pt.size * (0.5 + u);
    const g = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, r);
    g.addColorStop(0, `rgba(255, 240, 190, ${0.55 * (1 - u / 0.45)})`);
    g.addColorStop(1, 'rgba(255, 240, 190, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(pt.x - r, pt.y - r, r * 2, r * 2);
    ctx.restore();
  }
  drawFx(ctx, fxFrame('spark', u), pt.x, pt.y, pt.size * (0.8 + 0.4 * u), { alpha: fade });
}

/** what a burst of bits looks like for a colour: gold, yellow or bright red sparkles; green leaves; grey stone grit; anything else (wood,
 *  earth, fur) brown-tinted grit under a dust puff */
function debrisLook(color: string): 'star' | 'leaf' | 'grit' | 'earth' {
  const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(color);
  if (!m) return 'grit';
  const [r, g, b] = [m[1], m[2], m[3]].map((h) => parseInt(h, 16) / 255);
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  const sat = mx === 0 ? 0 : (mx - mn) / mx;
  if (sat < 0.25) return 'grit';
  const hue = mx === r ? ((g - b) / (mx - mn) + 6) % 6 * 60 : mx === g ? ((b - r) / (mx - mn) + 2) * 60 : ((r - g) / (mx - mn) + 4) * 60;
  if (hue >= 70 && hue <= 170) return 'leaf';
  if (mx > 0.85 && ((hue >= 40 && hue < 70) || hue < 12 || hue > 340)) return 'star';
  return 'earth';
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private input: InputEngine;
  private callbacks: GameEngineCallbacks;

  private currentStage: GeneratedStage;
  private player: PlayerState;
  private platforms: Platform[];
  private vines: Vine[];
  private ropes: Rope[];
  /** the skills Pokey has (worked out from the stages he has cleared) */
  private skills: Set<SkillId>;
  /** Leaf Glide: the rules' state, and how far the leaf is spread (0 folded .. 1 open) */
  private glide = newGlide();
  private glideOpen = 0;
  /** for the glide sound: whether the leaf was open last frame, and the time to the next little flutter */
  private glideHeard = false;
  private glideFlutter = 0;
  private ropeCooldown = 0;
  private ropeGrace = 0;
  private ropeId = -1;
  /** his weight on a rope, for the drawing: the rope gives under his hands, easing in as he grabs and out as he lets go (ropeArt.ts) */
  private ropeLoad: RopeLoad = { id: -1, x: 0, amt: 0 };
  private enemies: Enemy[];
  private boss: BossEntity | null;
  /** refined controls (refinedControls.ts), fixed for the stage */
  private refined = refinedControls();
  private collectibles: Collectible[];
  /** the hand-built stage's extras (protoStage.ts): logs to push, hints, leaves over secrets */
  private proto: ProtoExtras | null = null;
  /** the stage's sheets still to arrive and be drawn once (sheetWarm.ts) */
  private arrivals = new ArrivalWarm([]);
  /** the stretches of this stage, in order (the control test's end questions list them) */
  public stretchNames(): string[] {
    return (this.proto?.beats ?? []).map((b) => b[2]);
  }
  private pushLogs: Platform[] = [];
  private drawPlats: Platform[] = [];
  /** the hand-built stage's painted props: the platforms they draw, and their state */
  private paintedPlats: Platform[] = [];
  private swingVines: Vine[] = [];
  /** the vines the scene paints (a puzzle piece's climb, a kit vine, is the kit's own to draw) */
  private plainVines: Vine[] = [];
  /** which way the thumb steered before a kit trap took the steering (a trap chair counts the wiggles) */
  private kitSteer = 0;
  private paintKit = false;
  private protoScene: ProtoSceneState = { brokeAt: new Map(), movedAt: new Map() };
  /** when he came within reach of each water sign (its index), so it rattles for a moment (waterSign.ts signRattle) */
  private signNear = new Map<number, number>();
  private pushSoundT = 0;
  /** a hint that rides above Pokey for a few seconds */
  private stageHint: { text: string; life: number } | null = null;

  // --- boss fight (rules in bossAI.ts / bossDefs.ts) ---
  private hazards: BossHazard[] = [];
  private bossDef: BossDef | null = null;
  private bossCtx: BossCtx | null = null;
  private bossIntro = false;
  /** a giant's entrance while it plays (the fight and the player wait) */
  /** `tea`: the Tarantula Queen's tea (bossDefs entrance.tea, the long version only): where the fight starts her, to walk back to */
  private entrance: { t: number; total: number; roared: boolean; named: boolean; tea: { home: number } | null } | null = null;
  private entranceDone = false;
  /** the line on screen is one of the boss fight's (bossCtx.guide) */
  private bossGuideUp = false;
  private guideN = 0;
  /** the boss's state when its line was said */
  private bossGuideIn = '';
  /** real seconds of slow motion still to play (the last hit on a giant) */
  private slowMoLeft = 0;
  private bossSig = '';
  private clangCd = 0;
  /** seconds the player is stuck in web or goo (he runs slower) */
  private slowTimer = 0;
  private minionSeq = 0;
  /** 1 = normal; below 1 pulls the camera back so the boss and Pokey both stay in view */
  private bossZoom = 1;

  private camera: Camera;
  /** screen pixels per world unit */
  private zoom = 1;
  /** css size of the canvas, and the seconds since play began (drives the zoom-in) */
  private viewCssW = 0;
  private viewCssH = 0;
  private introT = 0;
  private particles: Particle[] = [];
  /** spent particles kept for reuse, so a busy fight does not churn the garbage collector */
  private particlePool: Particle[] = [];
  /** where the next particle goes once the cap is reached (the oldest is reused) */
  private particleWrap = 0
  private floatingTexts: FloatingText[] = [];
  /** stage tips said that go once he is past their spot (StageHint.passX), with the words they were said in */
  private passTips: Array<{ x: number; text: string }> = [];

  private isRunning: boolean = false;
  /** the first time a snapper hides, Dot's line says what to do about it */
  private turtleTold = false;
  /** the first time a guard of the river king blocks (2-9) */
  private guardTold = false;
  /** 2-8: when each rising river began to rise (game time), and whether Dot has warned about it */
  private floodAt = new Map<import('./river.ts').RiverZone, number>();
  private floodTold = false;
  private isPaused: boolean = false;
  private animFrameId: number | null = null;
  private lastTime: number = 0;
  private lastRenderTime: number = 0;
  private readonly frameIntervalMs: number = 1000 / 30; // 33.33ms fixed 30 FPS
  /** the longest slice the simulation takes in one go (frames longer than this are cut into equal parts) */
  private readonly STEP = 1 / 60;
  /** seconds of real time not yet simulated */
  private acc = 0;
  /**
   * the swinging vines' clock (physics.ts, the self-swing): every liana's angle is worked out from it, so it swings the same on every
   * screen and frame rate, and the same whether he is on it or not. It runs with the game (stops for a pause, slows with slow motion).
   */
  private vineClock = 0;
  private lastPausedRender = 0;
  /**
   * Automatic quality: 0 = full, 1 = lighter resolution, 2 = lightest. Only ever steps down, and only when the
   * screen genuinely cannot keep up (the simulation itself never changes).
   */
  private quality = startQuality(typeof performance !== 'undefined' ? performance.now() : 0);
  private slowWatch = new SlowWatch();
  private gov = new FrameGovernor();

  private hitstopTimer: number = 0;
  private gameTime: number = 0;
  private standingOnId: number = -1;
  private riverHinted = false;
  /** World 3: how drowsy the spore cloud makes him right now, 0 (awake) to 1 (in the thick of it); it follows the cloud and ends with it. And how strongly the screen shows it */
  private drowsy = 0;
  /** a jump that left the ground while Pokey was awake stays full strength to the landing, even if a spore cloud wakes under him mid-air */
  private flightClear = false;
  private drowsyShow = 0;
  private zzzTimer = 0;
  /** World 4: the push the wind adds to the hero this frame, px/s */
  private windV = 0;
  /** 4-10, the Sky Sovereign: her rock pillars (sovereignFight.ts), the shove of her screech (fading) and the push of her gust, px/s */
  private skyPillars: SkyPillar[] | null = null;
  private bossShove = 0;
  private bossGust = 0;
  private chimeT = 0;
  /** Worlds 5 and 6: what webs and the mudflat do to run speed and jump this frame (1 = nothing) */
  private dragSpeed = 1;
  private dragJump = 1;
  /** World 8: how dark it is on screen, 0..1 */
  private darkShow = 0;
  /** World 3's glowworms (zones.ts): how long he has stood still in the dark, and when each sleeping light woke (game time, by id) */
  private glowStill = 0;
  private glowWake = new Map<number, number>();
  /** World 3's thorn vines: a lash under way (by vine index: when it saw him, which way, whether it has landed), and the cycle it was in */
  private vineLash = new Map<number, { at: number; dir: number; landed: boolean; cycle: number }>();
  /** and the noise (its game time) each vine last struck at (3-5's pebble lure: once per noise) */
  private vineStruck = new Map<number, number>();
  /**
   * LV-14 (polish report 2026-10-29: hits nobody teaches): when the stir warning went up (game time; -1: not yet this stage), and whether
   * a vine has lashed him yet. A stage's first lash, if the warning has not been up 2.5 s, is a swat back that costs no heart
   */
  private vineWarnAt = -1;
  private vineLashed = false;
  /** the height the camera keeps level with, and its eased look-ahead (cameraFollow.ts) */
  private camAnchorY = NaN;
  private camLookX: number = CAM.lookAhead;
  /** the way the view looks (his facing, held through a swing), and the facing he caught the swinging vine with */
  private camFacing = 1;
  private camSwingFacing = 1;
  private camSwung = false;
  /** the eased shift that shows a landing across a gap (world px; cameraFollow.ts showBoth, LAND_EASE) */
  private camLandX = 0;
  private camLandY = 0;
  /** how much of the run lead the view is taking (cameraFollow.ts camRun) */
  private camRunK = 0;
  private camRunSlow = 0;
  /** World 4's rocks, fern, falls, chimes, knots and capuchins for this run (w4Play.ts) */
  private w4: W4Play | null = null;
  /** World 5's stillness and silk, chairs, cakes, teapots, threads, sheets, orchids and cocoons for this run (w5Play.ts) */
  private w5: W5Play | null = null;
  /**
   * World 5's step and lip help (a plain flick at a one-jump step lands on it, a jump into a face carries over its lip, the lip's hoist
   * puts a foot on the ledge) is on here too: every stage of every world (QA 2026-10-28, build 39fc3db: a plain walk stopped
   * dead at 1-7's and 1-9's waist-high steps and dips, and only an up-and-over flick got out; reference/STAGE-RULES.md: rules learned
   * in one world apply to every world). Not Meeca's stage (its own helper's), the boss arenas or Dot's flight.
   */
  private stepHelp = false;
  /** the stage's puzzle rooms (puzzleKit.ts, run by puzzlePlay.ts): things to carry and throw, plates, gates, levers, lifts, beetles */
  private kit: KitPlay | null = null;
  private kitHostObj: KitHost | null = null;
  /** 1 = normal; below 1 pulls the camera back in a puzzle room so Pokey, the puzzle part and what it works all fit (puzzleCamera.ts:
   * never below 0.75 sideways, further upright, roomFloor) */
  private roomZoom = 1;
  /** 6-8's crown: the view pulls back as he stands on it (1: no pull; proto.reveal), and its chime has sounded */
  private revealZoom = 1;
  private revealHeard = false;
  /** the zoom a room pulls back from (css px per world px: the usual framing, applyZoom) */
  private roomUsual = 1;
  /** how far the room's framing is blended in (0 outside, 1 inside a room), and where it last aimed (the view's middle) */
  private roomK = 0;
  private roomAim: { x: number; y: number; pan: boolean } | null = null;
  /** World 5: the vines the lessons may teach (not its silk lines, which its own tip teaches) */
  private lessonVines: Vine[] | null = null;
  /** the parts of World 5's stage Dot's bubble keeps off (Meeca's carvings), in world units, then on the page (guideKeepOut.ts) */
  private keepWorld: KeepOutBox[] = [];
  private keepPage: KeepOutBox[] = [];
  /** where the canvas sits on the page (css px), for marking stage boxes there */
  private viewCssX = 0;
  private viewCssY = 0;
  /** Dot's netting flight (dotFlightRun.ts): while it is set, she is the player and it runs the stage */
  private dotRun: DotRun | null = null;
  /** 7-4's slide (w7SlideRun.ts): side-on until the crumble, then it runs the stage until he comes out in the chamber */
  private slideRun: SlideRun | null = null;
  /** Meeca's stage (5-M, meecaPlay.ts): she is the player, on his physics, with no fighting and no Dot */
  private mc: MeecaPlay | null = null;
  private mcCinematic: boolean | null = null;
  private zoneHinted: Record<string, boolean> = {};
  /** true while rising from a mushroom/vine launch (those must not be cut short like a jump) */
  private launched = false;
  /** swimming (swim.ts): his dive and the first-swim moment; whether he has swum yet this stage; when Dot says how to get out */
  private swimSt: SwimState = { diveT: 0, firstLeft: 0 };
  private swamYet = false;
  /** the first swim's lines still to say, and when (game time) */
  private swimLines: Array<{ at: number; text: string; s: number }> = [];
  /** the camera's ease in on him in calm water (SWIM_CAM), times the usual zoom */
  private swimZoom = 1;
  private runScore: number = 0;
  // what happened this stage, for badges
  private statLivesLost = 0;
  private statHeartsLost = 0;
  private statStomps = 0;
  private statMaxStompChain = 0;
  private statMaxCombo = 0;
  private statGlideSec = 0;
  private statShimmySec = 0;
  /** vines grabbed to swing on, and punches and kicks that landed on an animal or a guardian */
  private statSwings = 0;
  private statPunches = 0;
  private statKicks = 0;
  private statKills: Record<string, number> = {};
  private statSeen = new Set<string>();
  private seenCheck = 0;
  // the reward Pokey wears
  private trailOn = false;
  private trailT = 0;
  private barrierMsgCooldown = 0;
  /** the goal hints already shown this stage (start, and late if well short) */
  private goalSaid = { start: false, late: false };
  /** the watching eagle (1-7: watcher.ts): its rhythm, the eagle drawn for it, where it was when it saw him, and rustling bushes */
  private watch: WatchState = newWatch();
  private watchEagle: Enemy | null = null;
  private watchFrom = { x: 0, y: 0 };
  private bushRustle = new Map<number, number>();
  /** 1-9's ring: 'idle' until he comes in, then each wave drops (snakes falling from the canopy, not yet in play), then 'open' */
  private ring = { state: 'idle' as 'idle' | 'fight' | 'open', wave: 0, ids: [] as number[] };
  /** animals coming into a ring: snakes dropping from the canopy, or (3-9) prowlers leaping in from the dark at `from` */
  private ringDrops: Array<{ e: Enemy; t: number; delay: number; from?: { x: number; y: number } }> = [];
  /** a snake that has just dropped into the ring is shaken for a moment and cannot bite yet (game time it can from, by id) */
  private harmlessUntil = new Map<number, number>();
  /** 1-8's collapsing branch (chase.ts): its state, the pieces falling away, and whether the last leap has had its slow motion */
  private chase: ChaseState | null = null;
  private chaseFalling: Array<{ x: number; y: number; w: number; h: number; vx: number; vy: number; rot: number; vr: number; t: number; right: boolean }> = [];
  private chaseSlowDone = false;
  private chaseNext = 0;
  /** 6-8's rising tide (risingTide.ts): its state, its setting, and the flag Dot warned under (Infinity: not yet; once a stage) */
  private tide: TideState | null = null;
  private tideSet: TideSetting = TIDE.normal;
  private tideWarned = Infinity;
  private tideChurn = 0;
  /** where the eagle's shadow falls this frame (drawn after the bushes and the front grass), or null */
  private watchShadowAt: { x: number; a: number } | null = null;
  /** World 3: the watcher is a pair of eyes in the dark, not an eagle (where they are this frame, world px; drawn over the darkness) */
  private watchEyes: { x: number; y: number; s: number; a: number; narrow: number } | null = null;
  private comboCount: number = 0;
  private comboResetTimer: number = 0;
  /** the first-stage lesson for a new touch player (see touchCoach.ts), when there is one */
  private coach: TouchCoach | null = null;
  private coachWasGrounded = true;
  /** first-time lessons: one open at a time, and a breather after each */
  private lessonOpen = false;
  private lessonQuietUntil = 0;
  /** when the last lesson (or find) was shown or closed: the swing's lesson needs only a second's breather after it */
  private lessonAt = -1e9;
  private lessonFrame = 0;
  /** the last lesson said (a harmless one, such as the petals', does not hold back the lesson for a danger ahead: HARMLESS_LESSONS) */
  private lessonLast: LessonId | null = null;
  private lessonSeen: Set<LessonId> | null = null;
  /** a lesson that came due while stopping was not safe (mid-air, mid-swing, a foe at hand): it opens once he is safe (cardSafe) */
  private lessonWaiting: { id: LessonId; at: number } | null = null;
  /** finds picked up while stopping was not safe: the reader opens once he is (the same rule as the lesson cards) */
  private findsWaiting: string[] = [];
  private coyoteTimer: number = 0;
  /** the jump forgiveness for the difficulty (physics.ts FORGIVE): coyote time, jump buffer, ledge landing */
  private forgive: (typeof FORGIVE)['normal' | 'easy'] = FORGIVE.normal;
  private jumpBufferTimer: number = 0;
  /** what carries him through the air on a touch screen (see jumpHelp.ts): the way he was going when he left the ground, until he lands or pushes back */
  private airDrive = newAirDrive();
  private maxLives: number = startingLives();
  private lives: number = this.maxLives;
  /** what the last life was lost to, for Dot's death help (DOT-10) */
  private lostTo: '' | 'water' | 'pit' | 'hurt' = '';
  /** the run ended because the lives ran out (not a win): the one case a Continue can pick up from the checkpoint */
  private outOfLives = false;
  /** the assist speed for this stage (1 = normal), read once so a menu change mid-stage waits for the next entry */
  private readonly speedScale: number = gameSpeed();
  /** Easy's help still fading out after a switch to Normal (difficulty.ts easeInShare, LV-7), read once as the stage starts */
  private easeIn = -1;
  /** Easy's kinder drifting logs (river.ts DRIFT_CATCH, LV-5), read once as the stage starts */
  private readonly easyLogs: boolean = isEasy();
  /**
   * Easy's soft falls on land (LV-4, polish report 2026-10-29: only the new generator's stages had them, so a child on Easy found Worlds
   * 1-5 harsher than World 6): on a hand-built or old-generator stage a fall off land (not into water) sets him back on the last still
   * ground he stood on, his hearts and lives kept. Water still costs a life on Easy, with its warning (waterTeach.ts), as on gen2.
   * `softAt`: that ground (null until he has stood somewhere); `softOn`: whether this stage has them.
   */
  private softOn = false;
  private softAt: { x: number; y: number } | null = null;
  private checkpoint = { x: 0, y: 0 };
  private respawnFlash = 0;
  /** where he stood when the exit cheer began (heroClips.ts) */
  private cheerX = 0;
  /** Seconds at the start of a stage / after a respawn where run input is ignored, so Pokey is dropped in standing still. */
  private inputGrace = 0.5;

  // --- fight system (see fight.ts) ---
  /** the attack being played: which move, how far into it, which animals it has already hit */
  private atk: { move: MoveSpec; t: number; id: number; connected: boolean; lunged: boolean; hits: Set<number>; sounded: boolean; want?: AttackWant } | null = null;
  private atkQueue: { want: AttackWant; ttl: number; face: number } | null = null;
  /** game time until which a touch jab may still be taken back, and waits in its wind-up (CT-17) */
  private jabHold = 0;
  private lastPunch: MoveId | null = null;
  private chainTimer = 0;
  /** kicks thrown close together take turns: a front snap kick, then a high side kick (only the new animation sheets show it) */
  private kickTurn = 0;
  private kickChain = 0;
  private swingId = 0;
  private megaCooldown = 0;
  /** after a stomp, a short breather where nothing can hurt Pokey (the thing he landed on is not a threat any more) */
  private stompGrace = 0;
  /** stomps in a row without touching the ground */
  private stompChain = 0;
  /** the last falling speed and feet height in the air, and how long he has been on the ground since: a landing ON an animal's back
   *  that the frame step carried straight to the ground still counts as a stomp for a moment (resolveStomps) */
  private fallVy = 0;
  private fallFeet = 0;
  private groundedFor = 0;
  /** ?hitboxes=1 draws every hit and hurt box, so you can see exactly what the game is judging */
  private debugBoxes = false;
  private dbgHurt: Rect[] = [];
  private dbgStrike: Rect | null = null;

  private exitTotemReached: boolean = false;
  /** a climbing stage: the highest his feet have been (smallest y), so its progress bar only ever goes up */
  private bestClimbY = Infinity;
  private daisyRescued: boolean = false;
  private isGameOver: boolean = false;
  private nearTreeVine: Vine | null = null;
  private nearSwingVine: Vine | null = null;
  private vineCooldownTimer: number = 0;
  /**
   * the liana he last let go of, until he stands, climbs, hangs or catches another: it swings on its own (physics.ts), and its swing used
   * to come round and catch him again in the air as he leapt off it
   */
  private swungOff = -1;
  /** after grabbing a trunk, the press that grabbed it is not also a leap or a hop off */
  private climbGrace = 0;
  /** how long a sideways push has been held, with no up or down, while on a trunk */
  private climbSideTimer = 0;
  /** a jump / up press a moment ago: touching a trunk in the next instant still grabs it */
  private upIntent = 0;
  /** a quick flick that grabbed a trunk keeps the climb going for a moment, so one flick is enough to get on */
  private climbAssist = 0;
  /** same for a liana: the jump press that caught it is not also the leap off it */
  private swingGrace = 0;
  /** down and a sideways steer held together on the swing, and for how long (getting off onto a ledge beside it) */
  private swingDownHeld: { dir: number; t: number } = { dir: 0, t: 0 };
  /** seconds until the next sweet-spot glint on a swinging vine */
  private sweetGlint = 0;
  /** 0..1: the golden glow round him while he is in the sweet spot (eased in and out) */
  private sweetGlow = 0;
  /** the swing's last moment in its sweet spot (for a press to let go a beat late), and a press made a beat early that is waiting for it */
  private sweetSnap: (SwingState & { dir: -1 | 1; at: number }) | null = null;
  private swingLeapWait = 0;
  private lastReleasedVineId: number = -1;
  private wasQuotaMet: boolean = false;
  private treeClimbAudioTimer: number = 0;

  constructor(
    canvas: HTMLCanvasElement,
    config: LevelConfig,
    input: InputEngine,
    callbacks: GameEngineCallbacks
  ) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('Could not get Canvas2D context');
    this.ctx = ctx;
    this.input = input;
    this.callbacks = callbacks;
    const cosmetic = loadCosmetic();
    setHeroCoat(cosmetic.coat);
    this.trailOn = cosmetic.trail;
    try {
      this.debugBoxes = new URLSearchParams(window.location.search).get('hitboxes') === '1';
    } catch {
      /* no window.location in some test setups */
    }

    // every stage load rolls a fresh look for the backdrop and ground (the layout itself does not change)
    setSceneSeed(rollSceneSeed());

    // Generate Stage data
    // Easy (difficulty.ts): the vines' wide sweet spot, then the same stage made gentler (easyMode.ts)
    setTimedSwing(isEasy());
    this.forgive = isEasy() ? FORGIVE.easy : FORGIVE.normal;
    // (a gen2 stage, gen2/game.ts, is laid for Easy by its own pipeline: the difficulty goes in with the build)
    this.currentStage = isEasy() ? easyStage(withGoals(generateStage(config, 'easy'))) : withGoals(generateStage(config, 'normal'));
    // (gen2 lays real soft pits on Easy; a boss's arena and 1-8's chase keep their own rules)
    this.softOn = isEasy() && !isGen2Stage(config) && config.objectiveType !== 'boss_lair' && !this.currentStage.arena;
    if (import.meta.env?.DEV) (window as unknown as { __engine?: unknown }).__engine = this; // dev-only debug handle
    this.platforms = this.currentStage.platforms;
    this.vines = this.currentStage.vines;
    // each liana's own swing: its size (neighbours' swings never meet) and its place in the swing (physics.ts swingSetup)
    swingSetup(this.vines);
    this.ropes = this.currentStage.ropes ?? [];
    this.ropeLoad = { id: -1, x: 0, amt: 0 };
    this.skills = learnedSkills(config.id);
    this.enemies = this.currentStage.enemies;
    // hunters may chase past their own patch, but only along ground that is really there
    assignTerritories(this.enemies, this.platforms, (e) => e.y + (isPredator(e.type) ? FEET[e.type] : 0));
    this.boss = this.currentStage.boss;
    if (this.boss) this.bossDef = bossDefForLevel(config);
    this.skyPillars = this.bossDef?.pillars && this.currentStage.arena ? makePillars(this.currentStage.arena.left) : null;
    setSovereignPillars(this.skyPillars);
    // Easy (difficulty.ts): a guardian takes about two thirds as many hits, each hit worth the same, and warns a little longer (tellMul)
    if (this.boss && this.bossDef?.hits && isEasy()) {
      const per = this.boss.maxHp / this.bossDef.hits;
      this.bossHits = Math.max(4, Math.round(this.bossDef.hits * 0.7));
      this.boss.maxHp = Math.round(per * this.bossHits);
      this.boss.hp = this.boss.maxHp;
    } else this.bossHits = this.bossDef?.hits;
    this.collectibles = this.currentStage.collectibles;
    this.proto = (this.currentStage as GeneratedStage & { proto?: ProtoExtras }).proto ?? null;
    // moves the stage lends him (the control test's rope), and the test's mix, logged so the run can be built again
    for (const s of this.proto?.grant ?? []) this.skills.add(s);
    if (this.proto?.mix) recorder.event('mix', this.proto.mix);
    // Dot's help setting, so the QA team can compare first-timers by it
    recorder.event('look', `help ${dotHelp()}`);
    this.ring = { state: 'idle', wave: 0, ids: [] };
    this.ringDrops = [];
    this.chase = this.proto?.chase ? newChase(this.proto.chase) : null;
    this.chaseFalling = [];
    this.chaseSlowDone = false;
    this.chaseNext = 0;
    this.tide = this.proto?.tide ? newTide(this.proto.tide) : null;
    this.revealZoom = 1;
    this.revealHeard = false;
    setReveal(0, null);
    this.tideSet = isEasy() ? TIDE.easy : TIDE.normal;
    this.tideWarned = Infinity;
    if (this.tide) this.currentStage.waterY = this.tide.y;
    this.watch = newWatch();
    this.watch.dur = 5; // the first pass waits a little longer, for the hint to be read
    this.bushRustle.clear();
    this.glowStill = 0;
    this.glowWake.clear();
    this.vineLash.clear();
    this.vineStruck.clear();
    resetHeroClips();
    warmHeroClips();
    // every sheet this stage can draw starts loading now (its creatures' clips: a snake's is the golden snake's; the eagle over a
    // watched stretch, a ring's drop-ins, Pokey on a liana, the bushes), not as each first comes on screen; and each is drawn once the
    // frame it arrives, not when he meets it (sheetWarm.ts: QA's 'blank wait' lines and the freezes after a sheet)
    this.arrivals = new ArrivalWarm(warmStageSheets({ enemies: this.enemies, vines: this.vines, proto: this.proto, ropes: this.ropes }));
    if (this.proto) for (const h of this.proto.hints) h.shown = false;
    if (this.currentStage.waterHint) this.currentStage.waterHint.shown = false;
    this.passTips = [];
    this.pushLogs = this.platforms.filter((pl) => !!pl.push && !pl.art); // (a pushed boulder is World 4's to paint: w4Play.ts)
    this.w4 = this.proto?.w4 ? new W4Play(this.proto.w4, this.platforms, this.vines) : null;
    this.w5 = this.proto?.w5 ? new W5Play(this.proto.w5, this.platforms, this.vines) : null;
    // (every world, the generated stages too, Gemini G4: not Meeca's stage, the boss arenas or Dot's flight)
    this.stepHelp = !!this.w5 || (!this.proto?.meeca && !this.currentStage.arena && !this.currentStage.dot);
    // (Meeca's stage: her night look, and Easy's stuck watch without a clock, Matt's research rule)
    this.kit = this.currentStage.kit ? new KitPlay(this.currentStage.kit, this.platforms, { zones: this.currentStage.zones, rivers: this.currentStage.rivers, collectibles: this.collectibles, world: config.worldIndex, stage: config.miniIndex, vines: this.vines, ...(this.proto?.meeca ? { noClock: true, night: true } : {}) }) : null;
    this.plainVines = this.vines.filter((v) => !v.kit);
    if (this.currentStage.dot) this.startDot(this.currentStage.dot);
    if (this.proto?.meeca) this.startMeeca(this.proto.meeca);
    this.slideRun = null;
    this.drawPlats = this.pushLogs.length || this.proto?.chase || this.platforms.some((pl) => pl.art)
      ? this.platforms.filter((pl) => !pl.push && !pl.chase && !pl.crown && !pl.art)
      : this.platforms;
    // Matt's painted World 1 kit: always in the hand-built 1-6, and in the rest of World 1 when switched on (off by default)
    setKitWorld(config.worldIndex);
    // the stage's painted backdrop (World 5's light changes through the world: w5Backdrop.ts)
    setBackdropStage(config.id);
    // a stage that hangs its vines from painted boughs (2-4) draws no leafy clump at each liana's top
    setLianaTops(!this.proto?.decor?.some((d) => d.n === 'canopy' || d.n === 'swingFrame'));
    this.paintKit = !!this.proto || (hasKit(config.worldIndex) && paintedKitEnabled() && config.objectiveType !== 'boss_lair');
    setGroundPaint(this.paintKit);
    if (this.paintKit) {
      const painted = paintedPlatforms(this.platforms);
      this.paintedPlats = this.platforms.filter((pl) => !painted.has(pl.id) && !pl.chase && !pl.crown && !pl.art);
      this.swingVines = this.vines.filter((v) => v.vineType !== 'tree_climb');
      this.protoScene = { brokeAt: new Map(), movedAt: new Map(), pillars: !!this.proto?.w4?.pillarTrunks };
      protoArtReady(); // start loading the props
    }
    if (perfEnabled()) {
      // a fresh frame-time log for each stage, so a slowdown that grows through the stage shows on the timeline
      perfLog.reset(performance.now());
      perfNote(`stage ${config.id} started`);
    }
    this.checkpoint = { x: this.currentStage.spawnX, y: this.currentStage.spawnY };
    if (this.proto?.slide) this.startSlide(this.proto.slide);
    this.camLedge = null;
    this.camLand = null;
    this.bestDropY = -Infinity;

    // Initialize Hero Sloth
    this.player = {
      x: this.currentStage.spawnX,
      y: this.currentStage.spawnY,
      vx: 0,
      vy: 0,
      width: 44,
      height: 48,
      facing: 1,
      grounded: true,
      climbing: false,
      ducking: false,
      punching: false,
      punchTimer: 0,
      punchType: 'normal',
      kicking: false,
      kickTimer: 0,
      attackType: 'none',
      jumpsLeft: 2,
      isDoubleJumping: false,
      somersaultAngle: 0,
      megaCharge: 1.0,
      hp: maxHearts(),
      maxHp: maxHearts(),
      fruitsCollected: 0,
      relicsFound: 0,
      crittersRescued: 0,
      enemiesDefeated: 0,
      invincibleTimer: 0,
      walkCycle: 0,
      squashX: 1,
      squashY: 1,
      targetScaleX: 1,
      targetScaleY: 1,
    };

    // Initialize Camera
    this.camera = {
      x: Math.max(0, this.player.x - 300),
      y: Math.max(0, this.player.y - 300),
      targetX: this.player.x - 300,
      targetY: this.player.y - 300,
      zoom: 1.0,
      targetZoom: 1.0,
      trauma: 0,
      viewportWidth: canvas.width,
      viewportHeight: canvas.height,
    };

    this.resizeCanvas();
    window.addEventListener('resize', this.handleResize);
    // the control test: the phone took the canvas's memory away (the picture goes blank until it is given back)
    // (the stand-in canvas of the engine tests has no events)
    canvas.addEventListener?.('contextlost', this.onContextLost);
    canvas.addEventListener?.('contextrestored', this.onContextRestored);
  }

  private onContextLost = () => recorder.glitch('contextlost', `x${Math.round(this.player?.x ?? 0)} q${this.quality} ${this.canvas.width}x${this.canvas.height}`);
  private onContextRestored = () => recorder.glitch('contextrestored', `x${Math.round(this.player?.x ?? 0)}`);

  private handleResize = () => {
    this.resizeCanvas();
    // the control test: the screen changed (turned, a bar came or went, full screen): noted once it has settled (a turn sends several)
    if (recorder.on) {
      clearTimeout(this.screenTimer);
      this.screenTimer = setTimeout(() => recorder.glitch('screen', this.screenLine()), 400);
    }
  };
  private screenTimer: ReturnType<typeof setTimeout> | undefined;
  /** the window, how the phone is held, the pixel ratio, and the canvas's own size in pixels (what it is drawn at) */
  private screenLine(): string {
    const w = Math.round(window.innerWidth), h = Math.round(window.innerHeight);
    const o = (typeof screen !== 'undefined' && screen.orientation?.type) || (w >= h ? 'landscape' : 'portrait');
    return `${w}x${h} ${o.replace('-primary', '').replace('-secondary', '2')} dpr${window.devicePixelRatio} canvas ${this.canvas.width}x${this.canvas.height} q${this.quality}`;
  }

  /** device pixels per css pixel to draw at: sharp by default, lighter when the screen is struggling */
  private renderDpr(): number {
    const native = window.devicePixelRatio || 1;
    const cap = [2, 1.5, 1][this.quality] ?? 1;
    return Math.max(1, Math.min(native, cap));
  }

  /** the screen cannot keep up: the sparkle goes first (bloom, rim light, wind, then all of the polish), and only then the resolution */
  private stepQuality() {
    // (the control test: each change of picture, with the governor's last window: LOG_EVENTS.md 'quality')
    const avg = `avg ${Math.round(this.gov.lastAvg)}ms`;
    if (polishEnabled() && polishTier() < 2) {
      if (recorder.on) recorder.glitch('quality', `polish ${polishTier()}→${polishTier() + 1} slow ${avg}`);
      setPolishTier(polishTier() + 1);
    } else if (this.quality < 2) {
      if (recorder.on) recorder.glitch('quality', `q${this.quality}→${this.quality + 1} slow ${avg}`);
      this.quality++;
      noteStepDown(this.quality, performance.now());
      this.resizeCanvas();
      // (drawn again at once: resizing clears the canvas, and this runs after the frame was drawn, so the screen showed one black frame)
      this.render();
    }
    perfNote(`slow: stepped down (quality ${this.quality}, polish ${polishEnabled() ? polishTier() : 'off'})`);
  }

  public resizeCanvas() {
    const dpr = this.renderDpr();
    const rect = this.canvas.getBoundingClientRect();
    const w = rect.width || window.innerWidth;
    const h = rect.height || window.innerHeight;

    this.canvas.width = Math.floor(w * dpr);
    this.canvas.height = Math.floor(h * dpr);
    // (resizing resets the context: smoothing back to plain bilinear, which smears the magnified backdrops upright)
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
    this.viewCssW = w;
    this.viewCssH = h;
    this.viewCssX = rect.left || 0;
    this.viewCssY = rect.top || 0;
    this.applyZoom();
    this.camCut = true;
  }

  /**
   * How much of the world fits on screen.
   *  landscape: the world is always about WORLD_VIEW_H tall, so a hero is the same share of the screen on a phone,
   *             a tablet and a desktop (like a store platformer).
   *  portrait:  the screen is narrow, so fit a fixed width of world instead (never taller than the level itself).
   * When play begins the camera dollies in from a wider shot to this framing.
   */
  private applyZoom() {
    const w = this.viewCssW;
    const h = this.viewCssH;
    if (!w || !h) return;
    const levelH = this.currentStage?.config.levelHeight ?? 900;
    const portrait = h > w;
    // (a stage may show more of the world than usual: 4-7, where the next ledge is far across and far below)
    const wide = this.proto?.view ?? this.proto?.w4?.view;
    let base = portrait ? Math.max(w / (wide?.port ?? PORTRAIT_VIEW_W), h / levelH) : h / (wide?.land ?? WORLD_VIEW_H);
    base = Math.max(0.5, Math.min(1.8, base));
    const t = Math.min(1, this.introT / INTRO_ZOOM_SECS);
    const ease = 1 - Math.pow(1 - t, 3);
    const dolly = INTRO_ZOOM_FROM + (1 - INTRO_ZOOM_FROM) * ease;
    // never show more height than the level has
    // (a boss fight in a tall, narrow window may show some sky above the arena rather than crop the fight to the level's height)
    const bossFight = !!this.currentStage?.arena && portrait;
    // (a puzzle room pulls back from that, past the level's height if it must: upright a room never fit across a view the level's height
    // tall; the extra is the sky over the level, updateCamera. Its floor is roomFloor, puzzleCamera.ts)
    this.roomUsual = Math.max(base * dolly * this.bossZoom, bossFight ? 0.4 : h / levelH);
    this.zoom = bossFight ? Math.max(base * dolly * this.bossZoom * this.roomZoom, 0.4) : this.roomUsual * this.roomZoom * this.revealZoom * this.swimZoom;
    this.camera.viewportWidth = w / this.zoom;
    this.camera.viewportHeight = h / this.zoom;
  }

  /** a stage is under way (running, not yet won or lost): stagePreload.ts draws nothing on the canvas then */
  public inPlay(): boolean {
    return this.isRunning && !this.isGameOver;
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    recorder.stage(this, true);
    this.lastTime = performance.now();
    this.lastRenderTime = this.lastTime;
    this.callbacks.onLivesChange?.(this.lives, this.maxLives);
    const cfg = this.currentStage.config;
    if (coachWanted(cfg.id, cfg.secret)) {
      this.coach = new TouchCoach(controlStyle(), (st) => this.callbacks.onCoach?.(st), markCoachDone);
      markCoachDone(); // once per device: leaving halfway does not bring it back
      this.coach.setCourse(this.player.x, firstJumpSpot(this.platforms, this.player.x, this.player.y));
      // the coach is already teaching the jump over the first gap, so the gap card would only say it twice
      markLessonSeen('gap');
      this.lessonSeen = lessonsSeen();
    }
    sound.setTempo(1); // a boss fight that was enraged must not restart at the enraged speed
    sound.playLevelStart();
    this.loop(this.lastTime);
  }

  /** a note, book or keepsake is picked up: a burst, a line of text, and the app opens it */
  private collectFind(c: Collectible) {
    c.collected = true;
    this.runScore += 300;
    sound.playRelicFound();
    this.spawnSparkBurst(c.x, c.y, '#fde68a');
    this.addFloatingText(`FOUND: ${FIND_BY_ID[c.findId ?? '']?.title ?? 'a find'}`, c.x, c.y - 34, '#fde68a');
    // the app stops the stage to show it: that waits until he is standing or holding on, like a lesson card (lessonTick)
    if (c.findId) this.findsWaiting.push(c.findId);
  }

  /** where Pokey's middle is on the screen, in CSS px (the new HUD flies a pickup from here to its counter); null before the first frame */
  public heroScreenPoint(): { x: number; y: number } | null {
    if (!this.viewCssW) return null;
    const p = this.player;
    const run = this.dotRun;
    const wx = run ? run.fl.x : p.x + p.width / 2;
    const wy = run ? run.fl.y : p.y - 50; // (his drawing stands well above his box: head about 125 up, feet about 10 down)
    return { x: (wx - this.camera.x) * this.zoom, y: (wy - this.camera.y) * this.zoom };
  }

  public pause() {
    if (!this.isPaused) {
      // in mid-air, remember what his thumb was holding a moment ago: pressing the Menu button takes it off the glass first, and play
      // should carry on the way it was going (a glide stays open) rather than drop him (see resume)
      const p = this.player;
      const air = !p.grounded && !p.climbing && !p.isVineSwinging && !p.hanging && !this.isGameOver;
      this.pauseHeld = air ? { jump: this.gameTime - this.heldJumpAt < HELD_RECENT, dir: this.gameTime - this.heldDirAt < HELD_RECENT ? this.heldDir : 0 } : null;
    }
    this.isPaused = true;
  }

  public resume() {
    const was = this.isPaused;
    this.isPaused = false;
    this.lastTime = performance.now();
    this.lastRenderTime = this.lastTime;
    this.acc = 0;
    // paused in mid-air: hold what he held until a fresh touch or key takes over, or he lands (inputEngine.ts carry)
    const h = this.pauseHeld;
    this.pauseHeld = null;
    if (was && h && (h.jump || h.dir)) {
      this.input.carry(h.jump, h.dir);
      this.carryLeft = 1.5;
    }
  }
  /** what his thumb held just before a pause in mid-air, and how long resume() may keep holding it */
  private pauseHeld: { jump: boolean; dir: -1 | 0 | 1 } | null = null;
  private carryLeft = 0;
  private heldJumpAt = -1e9;
  private heldDirAt = -1e9;
  private heldDir: -1 | 0 | 1 = 0;
  /** the respawn pause on steering lasts until the first fresh input (InputEngine.moves) */
  private graceMoves = -1;

  public stop() {
    // (the banner goes back to its usual place for whatever comes next)
    if (typeof document !== 'undefined') {
      delete document.documentElement.dataset.wayLow;
      delete document.documentElement.dataset.wayBoss;
    }
    this.wayLow = false;
    this.isRunning = false;
    setGuideKeepOuts([]);
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    window.removeEventListener('resize', this.handleResize);
    this.canvas.removeEventListener?.('contextlost', this.onContextLost);
    this.canvas.removeEventListener?.('contextrestored', this.onContextRestored);
    clearTimeout(this.screenTimer);
    recorder.stage(this, false);
    sound.setLowHealth(false);
  }

  private loop = (now: number) => {
    if (!this.isRunning) return;
    this.animFrameId = requestAnimationFrame(this.loop);

    // 30 FPS cap: one steady 30 fps rhythm (every other frame on a 60 Hz screen) looks smoother than a
    // frame rate that wobbles between 30 and 60.
    const elapsed = now - this.lastRenderTime;
    // a vsync that lands a hair early (33.2 ms) still counts, or every fourth frame would be skipped and run at 50 ms
    if (elapsed < this.frameIntervalMs - 2) {
      return;
    }
    this.lastRenderTime = elapsed < this.frameIntervalMs + 2 ? now : now - (elapsed % this.frameIntervalMs);

    const dt = Math.min(elapsed / 1000, 0.05);
    // the frame-time check (menu switch, off by default): how long this frame's update and draw took on their own
    const pl = perfEnabled() ? perfLog : null;
    // (the control test times it too: a stall line says how much of the gap was the game's own work, js below)
    const timed = !!pl || recorder.on;
    let tUpd = 0;

    try {
      if (!this.isPaused) {
        if (this.hitstopTimer > 0) {
          // Hitstop freeze: the world holds for a few ticks; keep the camera shake settling
          this.hitstopTimer -= dt;
          this.camera.trauma = Math.max(0, this.camera.trauma - dt * 2.5);
        } else {
          // the killing blow of a giant plays in slow motion (real time runs the clock down)
          let sdt = dt * this.speedScale;
          if (this.slowMoLeft > 0) {
            this.slowMoLeft -= dt;
            sdt = dt * 0.3 * this.speedScale;
          }
          const u0 = timed ? performance.now() : 0;
          this.update(sdt);
          if (timed) tUpd = performance.now() - u0;
          if (recorder.on) this.watchGlitches(now);
        }
      }

      const r0 = timed ? performance.now() : 0;
      this.render();
      const tDraw = timed ? performance.now() - r0 : 0;
      if (pl) pl.record(elapsed, tUpd, tDraw, now, () => this.perfInfo());
      if (recorder.on) this.recordFrames(elapsed, now);
      this.lastJs = { upd: tUpd, draw: tDraw };
      // judge the real frame gap: too slow for a moment -> a lighter picture (never while a menu holds the game, or once at the lightest)
      if (!this.isPaused && (this.quality < 2 || (polishEnabled() && polishTier() < 2)) && this.gov.feed(elapsed)) this.stepQuality();
      else if (!this.isPaused && this.quality === 2) this.gov.feed(elapsed);
      // at the lightest picture and still under 10 frames a second for a while: the browser itself is the trouble (slowTip.ts)
      if (!this.isPaused && this.slowWatch.feed(elapsed, this.gov.lastAvg, this.quality === 2 && !(polishEnabled() && polishTier() < 2))) {
        if (recorder.on) recorder.glitch('slowtip', `avg ${Math.round(this.gov.lastAvg)}ms`);
        this.callbacks.onSlowDevice?.();
      }
      // steady for a while at a lightened picture: back up a notch (it used to stay low for good after one slow start)
      if (!this.isPaused && this.quality > 0 && this.gov.takeUp()) {
        if (recorder.on) recorder.glitch('quality', `q${this.quality}→${this.quality - 1} steady avg ${Math.round(this.gov.lastAvg)}ms`);
        this.quality--;
        noteStepUp(this.quality, performance.now());
        this.resizeCanvas();
        this.render();
        perfNote(`steady: stepped up (quality ${this.quality})`);
      }
      this.failStreak = 0;
    } catch (err) {
      // one bad frame must not freeze the game; a frame that fails over and over ends the stage cleanly
      console.error('frame error', err);
      if (recorder.on) recorder.error(err, 'frame');
      if (++this.failStreak >= 20) {
        this.stop();
        this.callbacks.onFatal?.();
      }
    }
  };
  private failStreak = 0;

  /**
   * the control test: every 5 s, how smooth the picture was (frames a second, the slowest tenth, the worst frame), the picture quality
   * the game settled on, the canvas size, and the sound's own line. Testers called a run choppy with the sound breaking up; this shows
   * where, on their own phones.
   */
  private frameWin: number[] = [];
  private frameWinAt = 0;
  /** the last frame's update and drawing time in ms (timed only for the control test and the frame-time check) */
  private lastJs = { upd: 0, draw: 0 };
  private recordFrames(elapsed: number, now: number) {
    if (!this.frameWinAt) this.frameWinAt = now;
    // a gap that spans the page being hidden (another app, the lock button) is time away, not a freeze ('hidden' / 'shown' say so)
    if (now - elapsed <= recorder.shownAt) return;
    if (!this.isPaused) this.frameWin.push(elapsed);
    // a hitch long enough to see (over 100 ms): noted on its own, with where he was and the last picture sheet to arrive (an atlas
    // decoding mid-play is the usual cause), so a stall can be tied to what caused it
    // (`js u<ms> d<ms>`: the frame before the gap, its update and its drawing in the game's own code; a gap much longer than both is the
    // browser's time, outside the game: putting the picture on screen, or a drawing it put off, QA 2026-10-29's 2 fps replay)
    if (!this.isPaused && elapsed > 100) recorder.glitch('stall', `${Math.round(elapsed)}ms x${Math.round(this.player.x)} q${this.quality} js u${Math.round(this.lastJs.upd)} d${Math.round(this.lastJs.draw)}${lastSheet.name && now - lastSheet.at < 1500 ? ` after ${lastSheet.name}` : ''}`);
    if (now - this.frameWinAt < 5000) return;
    // memory (Chrome and Android only: iPhones don't report it), and how many live things the game is carrying, so the QA team can see
    // memory climbing the longer someone plays
    const mem = (performance as Performance & { memory?: { usedJSHeapSize: number; totalJSHeapSize: number } }).memory;
    recorder.event('mem', `${mem ? `${Math.round(mem.usedJSHeapSize / 2 ** 20)}/${Math.round(mem.totalJSHeapSize / 2 ** 20)}MB ` : ''}parts ${this.particles.length} foes ${this.enemies.length} items ${this.collectibles.length}`);
    const f = this.frameWin.sort((a, b) => a - b);
    this.frameWinAt = now;
    if (f.length < 5) {
      f.length = 0;
      return;
    }
    const total = f.reduce((a, b) => a + b, 0);
    const p90 = f[Math.floor(f.length * 0.9)];
    // stutter: frames over 50 ms (a missed beat at 30 fps), and how uneven the frame times were (sd: a few ms is even pacing)
    const sp = frameSpread(f, 50);
    recorder.event('fps', `${(1000 * f.length / total).toFixed(1)}fps p90 ${Math.round(p90)}ms max ${Math.round(f[f.length - 1])}ms q${this.quality} ${this.canvas.width}x${this.canvas.height} slow ${sp.over} sd ${sp.sd.toFixed(1)}ms${recorder.longTasks >= 0 ? ` lt ${recorder.longTasks}` : ''} | ${sound.report()}`);
    if (recorder.longTasks > 0) recorder.longTasks = 0;
    f.length = 0;
  }

  /**
   * The control test, every frame the world moved: the camera jumping (more than 120 px in a frame, outside a respawn, a resize or a
   * teleport), the camera or Pokey shaking back and forth in a few pixels (outside an intended screen shake), and his state see-sawing in
   * one spot (standing / falling at an edge). Nothing is allocated unless a line is logged (glitchWatch.ts, LOG_EVENTS.md).
   */
  private camCut = true;
  private camGraceUntil = 0;
  private camPrevX = NaN;
  private camPrevY = NaN;
  private pPrevX = NaN;
  private pPrevY = NaN;
  private jitCX = new JitterWatch(6, 12, 1000, 0.5);
  private jitCY = new JitterWatch(6, 12, 1000, 0.5);
  private jitPX = new JitterWatch(6, 12, 1000, 0.5);
  private jitPY = new JitterWatch(6, 12, 1000, 0.5);
  private flip = new FlipFlopWatch(6, 24, 1000);
  private watchGlitches(now: number) {
    const c = this.camera;
    const p = this.player;
    const st = p.climbing ? 'c' : p.isVineSwinging ? 's' : p.hanging ? 'h' : p.grounded ? (p.ducking ? 'k' : 'g') : 'a';
    // a teleport (a door, a respawn): the view is allowed to catch up
    if (Math.abs(p.x - this.pPrevX) > 300 || Math.abs(p.y - this.pPrevY) > 300) this.camCut = true;
    this.pPrevX = p.x;
    this.pPrevY = p.y;
    if (this.camCut) {
      this.camCut = false;
      this.camGraceUntil = now + 600;
      this.jitCX.reset();
      this.jitCY.reset();
      this.jitPX.reset();
      this.jitPY.reset();
      this.flip.reset();
    }
    const dx = c.x - this.camPrevX;
    const dy = c.y - this.camPrevY;
    this.camPrevX = c.x;
    this.camPrevY = c.y;
    if (now > this.camGraceUntil && (dx > 120 || dx < -120 || dy > 120 || dy < -120)) {
      recorder.glitch('camjump', `dx${Math.round(dx)} dy${Math.round(dy)} x${Math.round(p.x)} y${Math.round(p.y)} ${st}`);
    }
    // (the screen shake is drawn on top of the camera, not in it; a shaking moment is still left out, as intended)
    if (c.trauma < 0.01) {
      if (this.jitCX.feed(c.x, now)) this.logJitter('cam-x', this.jitCX, st);
      if (this.jitCY.feed(c.y, now)) this.logJitter('cam-y', this.jitCY, st);
    } else {
      this.jitCX.reset();
      this.jitCY.reset();
    }
    if (this.jitPX.feed(p.x, now)) this.logJitter('pokey-x', this.jitPX, st);
    if (this.jitPY.feed(p.y, now)) this.logJitter('pokey-y', this.jitPY, st);
    if (this.flip.feed(st, p.x, now)) recorder.glitch('flipflop', `${this.flip.a}↔${this.flip.b} n${this.flip.changes} x${Math.round(p.x)} y${Math.round(p.y)}`);
  }
  private logJitter(axis: string, w: JitterWatch, st: string) {
    recorder.glitch('jitter', `${axis} n${w.turns} span${w.span.toFixed(1)} x${Math.round(this.player.x)} y${Math.round(this.player.y)} ${st}`);
  }

  /** what the game was doing, for the frame-time check (only built when a freeze is logged or a timeline line is due) */
  private perfInfo() {
    const p = this.player;
    const alive = this.enemies.filter((e) => !e.defeated).length;
    return {
      what: `${p.grounded ? 'ground' : 'air'} vy=${Math.round(p.vy)} x=${Math.round(p.x)} enemies=${alive}/${this.enemies.length} particles=${this.particles.length} quality=${this.quality} polish=${polishEnabled() ? polishTier() : 'off'}`,
      parts: this.particles.length,
    };
  }

  /**
   * Main Physics & Simulation Tick (30 FPS)
   */
  private update(dt: number) {
    this.gameTime += dt;
    this.vineClock += dt;
    // every liana swings on its own (the climbing vines hang still): it is drawn, and caught, where its swing puts it now
    for (const v of this.vines) {
      if (v.vineType === 'tree_climb') continue;
      v.swingAngle = vineAngle(v, this.vineClock);
      v.isSwingingVine = true;
    }
    if (this.introT < INTRO_ZOOM_SECS) {
      this.introT += dt;
      this.applyZoom();
    }
    if (this.stepEntrance(dt)) return;
    this.input.update(dt);
    if (this.dotRun) return this.stepDot(dt);
    if (this.slideRun?.sliding) return this.stepSlide(dt);
    if (this.slideRun) this.slideRun.side(dt, this.player, this.input.state);
    // Meeca's stage: she cannot fight, and while the card, a catch or the ending is on, the controls are not hers
    if (this.mc) this.mc.filter(this.input.state as MeecaControls);
    {
      // what his thumb holds, for a pause in mid-air (pause / resume)
      const inp = this.input.state;
      if (inp.jumpHeld) this.heldJumpAt = this.gameTime;
      const d = inp.left ? -1 : inp.right ? 1 : 0;
      if (d) {
        this.heldDir = d;
        this.heldDirAt = this.gameTime;
      }
      if (this.carryLeft > 0) {
        const pl = this.player;
        this.carryLeft -= dt;
        if (!this.input.carrying || this.carryLeft <= 0 || pl.grounded || pl.climbing || pl.isVineSwinging || pl.hanging) {
          this.carryLeft = 0;
          this.input.dropCarry();
        }
      }
    }

    const p = this.player;
    const groundedBefore = p.grounded;
    const vyBefore = p.vy;
    if (recorder.on) this.recordPokey();
    // the touch recogniser reads this: in the air with a second jump to spare, a shorter slide up is that jump
    this.input.airJumpReady = !p.grounded && p.jumpsLeft > 0 && !p.climbing && !p.isVineSwinging && !p.hanging && !this.isGameOver;
    if (this.refined) {
      // (carrying, a flick toward is a throw: the touch rules keep it a kick, never a run)
      this.input.kickNear = this.somethingToKick() || !!this.kit?.holding;
      this.input.onVine = p.climbing || !!p.isVineSwinging;
      this.input.onSwing = !!p.isVineSwinging;
      this.input.onRope = !!p.hanging;
    }
    // (Meeca never kicks: a sideways flick is a run, unless her hands are full: then it throws)
    if (this.mc) this.input.kickNear = !!this.kit?.holding;
    // (and at a trunk, a finger tracing a circle is carving, not steering: the touch controls ask. Every frame, on every stage: written
    // only in Meeca's stage it stayed true after leaving her stage on a carving spot, and later stages read curved swipes as circles, CT-20)
    (this.input as { carveSpot?: boolean }).carveSpot = !!this.mc?.carveSpot;
    // inside a bush a watcher's stretch hides him in: a slide down there hides him even mid-run (touchGestures.ts inCover)
    this.input.inCover = !!this.proto?.watch && p.grounded && (this.proto.bushes ?? []).some((b) => !b.secret && !b.hanging && p.x > b.x + 10 && p.x < b.x + b.w - 10 && Math.abs(p.y - b.y) < 10);
    // on a trunk, a liana or a rope nothing carries him: what he does when he lets go is his own
    if (p.climbing || p.isVineSwinging || p.hanging) this.airDrive = newAirDrive();
    // the glide leaf is gone the moment he lands or grabs anything
    if (p.grounded || p.climbing || p.isVineSwinging || p.hanging) {
      this.glideOpen = 0;
      this.glide.on = false;
    }
    // the glide sound: the leaf opens, flutters now and then while he drifts, and folds away
    if (this.glide.on !== this.glideHeard) {
      this.glideHeard = this.glide.on;
      sound.playGlide(this.glide.on ? 0 : 2);
      this.glideFlutter = 0.34 + Math.random() * 0.16;
    } else if (this.glide.on) {
      this.glideFlutter -= dt;
      if (this.glideFlutter <= 0) {
        sound.playGlide(1);
        this.glideFlutter = 0.3 + Math.random() * 0.22;
      }
    }

    this.lessonTick();
    // the puzzle kit reads the intents again (puzzlePlay.ts control): a tap by a piece uses it, and carrying, the jump and kick throw
    if (this.kit) this.kitControls();

    if (this.coach && !this.coach.done) {
      this.coach.update(dt, p.x, this.coachWasGrounded && !p.grounded && p.vy < -200);
      this.coachWasGrounded = p.grounded;
    }

    // --- Moving platforms: slide on a sine path and carry whoever stands on them ---
    for (const plat of this.platforms) {
      if (plat.type !== 'moving' || plat.broken) continue;
      if (plat.lift) {
        // World 2's basket lift rides up and down, and carries whoever stands in it
        const ny = liftY(plat.lift, this.gameTime);
        const dy = ny - plat.y;
        plat.y = ny;
        if (p.grounded && this.standingOnId === plat.id) p.y += dy;
        continue;
      }
      const nx = (plat.baseX ?? plat.x) + Math.sin(this.gameTime * (plat.moveSpeed ?? 1) + (plat.swayOffset ?? 0)) * (plat.moveRange ?? 0);
      const dx = nx - plat.x;
      plat.x = nx;
      if (p.grounded && this.standingOnId === plat.id) p.x += dx;
    }

    // --- Drifting logs (World 2 rivers): slide with the current, carry whoever rides them, hand a rider over to the bank ---
    for (const plat of this.platforms) {
      if (plat.type !== 'drift' || !plat.drift || plat.broken) continue;
      const d = plat.drift;
      // (a river a sluice runs keeps its own clock: puzzleKit.ts 'sluice')
      const nx = driftX(d, logClock(this.currentStage.rivers, d, this.gameTime));
      // a log that wraps from one end of the river to the other must not drag its rider across the whole window
      const dx = Math.abs(nx - plat.x) > d.width * 2 ? 0 : nx - plat.x;
      plat.x = nx;
      if (p.grounded && this.standingOnId === plat.id) {
        p.x += dx;
        // carried under a bank: step up onto it instead of riding into the wall
        if (p.x > d.x1 || p.x < d.x0) {
          p.x = p.x > d.x1 ? d.x1 + 6 : d.x0 - 6;
          p.y = d.baseY - LOG_DROP;
          p.vy = 0;
        }
      }
    }
    // 2-8: rising water. It starts once he steps in, and covers the low reed islands; out on a bank again (either one) it drains away as
    // fast as it rose, so a little one left behind can still be gone back for (every one of them is the goal)
    for (const r of this.currentStage.rivers ?? []) {
      const f = r.flood;
      if (!f) continue;
      f.y0 ??= r.surfaceY;
      let at = this.floodAt.get(r);
      const inBasin = p.x > f.trigger && p.x < r.x1 + 10;
      if (at !== undefined && !inBasin && p.grounded) {
        at = Math.min(this.gameTime, at + 2 * dt);
        if (at >= this.gameTime) {
          this.floodAt.delete(r);
          at = undefined;
        } else this.floodAt.set(r, at);
      }
      if (at === undefined && inBasin && !this.isGameOver) {
        at = this.gameTime;
        this.floodAt.set(r, at);
        if (!this.floodTold) {
          this.floodTold = true;
          this.guide('The water is rising! Free them and get back to the bank!', 4);
        }
      }
      r.surfaceY = floodLevel(f, f.y0, at === undefined ? undefined : this.gameTime - at);
    }
    if (!this.riverHinted && this.currentStage.rivers?.length) {
      const r0 = this.currentStage.rivers[0];
      if (p.x > r0.x0 - 380 && p.x < r0.x1) {
        this.riverHinted = true;
        this.addFloatingText('LOGS DRIFT! HOP ON AND RIDE', p.x, p.y - 90, '#7dd3fc');
      }
    }

    // --- Spore clouds and wind gusts (Worlds 3 and 4, see zones.ts) ---
    const zones = this.currentStage.zones;
    if (zones?.length) {
      const bodyY = p.y - 30;
      const level = drowsyLevel(zoneEffect(zones, 'spore', p.x, bodyY, this.gameTime).strength);
      if (level > 0 && this.drowsy <= 0) {
        if (!this.zoneHinted.sleepy) this.addFloatingText('SLEEPY SPORES...', p.x, p.y - 80, '#c4b5fd');
        this.zoneHinted.sleepy = true;
        this.zzzTimer = 0.3;
      }
      this.drowsy = level;
      this.windV = windPush(zones, p.x, bodyY, this.gameTime, p.grounded);
      const drag = zoneDrag(zones, p.x, bodyY, this.gameTime);
      this.dragSpeed = drag.speed;
      this.dragJump = drag.jump;
      if (drag.speed < 0.5 && !this.zoneHinted.stuck && zones.some((z) => z.kind === 'web' && inZone(z, p.x, bodyY))) {
        this.zoneHinted.stuck = true;
        this.addFloatingText('STUCK IN THE WEB!', p.x, p.y - 80, '#e2e8f0');
      }
      // lava geysers and lightning (Worlds 9 and 10): a firing column burns whoever stands in it
      const hot = columnHit(zones, p.x - 14, p.y - 64, 28, 64, this.gameTime);
      if (hot && p.invincibleTimer <= 0) {
        this.damagePlayer(1);
        this.camera.trauma = Math.min(1, this.camera.trauma + 0.3);
      }
      // the first time a zone of each kind is close, say what it is (once a session)
      for (const z of zones) {
        if (this.zoneHinted[z.kind] || p.x < z.x0 - 420 || p.x > z.x1) continue;
        this.zoneHinted[z.kind] = true;
        const hint: Record<string, [string, string]> = {
          web: ['STICKY WEBS SLOW YOU. GO ABOVE THEM OR PUSH THROUGH', '#e2e8f0'],
          tide: ['THE TIDE RISES ON A BEAT. CROSS WHILE IT IS LOW', '#7dd3fc'],
          dark: ['IT IS DARK. FOLLOW THE FIREFLIES', '#fde68a'],
          crumble: ['THESE TILES CRUMBLE. KEEP MOVING', '#fdba74'],
          spore: ['SPORES PUFF ON A BEAT. WAIT FOR THEM TO CLEAR', '#c4b5fd'],
          wind: ['GUSTS BLOW ON A BEAT. WATCH THE LEAVES', '#99f6e4'],
          geyser: ['VENTS ERUPT ON A BEAT. STAND BETWEEN THEM', '#fdba74'],
          bolt: ['LIGHTNING STRIKES WHERE THE RODS CHARGE', '#bae6fd'],
        };
        if (z.kind === 'dark' && z.lights?.some((l) => l.sleep)) {
          this.addFloatingText('TOO DARK. STAND STILL AND LISTEN', p.x, p.y - 100, '#99f6e4');
          continue;
        }
        this.addFloatingText(hint[z.kind][0], p.x, p.y - 100, hint[z.kind][1]);
      }
    } else {
      this.windV = 0;
      this.dragSpeed = 1;
      this.dragJump = 1;
      this.drowsy = 0;
    }
    {
      // World 8: the dark fades in as you reach a dark stretch and out as you leave it
      let want = 0;
      for (const z of zones ?? []) {
        if (z.kind !== 'dark') continue;
        const out = Math.max(z.x0 - p.x, p.x - z.x1, 0);
        want = Math.max(want, Math.max(0, 1 - out / 220));
      }
      this.darkShow += (want - this.darkShow) * Math.min(1, dt * 3);
      this.stepGlowworms(dt, zones);
      if (this.proto?.thorns) this.stepThornVines();
      if (this.w4) this.stepW4(dt);
      if (this.w5) this.stepW5(dt);
      if (this.kit) this.stepKit(dt);
      // (Meeca's stage: on tiptoe through the camp)
      if (this.mc) this.dragSpeed *= this.mc.speedK();
    }
    this.drowsyShow += (this.drowsy - this.drowsyShow) * Math.min(1, dt * 4);
    if (this.drowsy > 0) {
      this.zzzTimer -= dt;
      if (this.zzzTimer <= 0) {
        this.zzzTimer = 0.9;
        this.emit({ x: p.x + p.facing * 14, y: p.y - 62, vx: p.facing * 12, vy: -30, color: '#ddd6fe', size: 3, life: 0.9, maxLife: 0.9, type: 'star' });
        this.addFloatingText('z', p.x + p.facing * 16, p.y - 66, '#ddd6fe');
      }
    }

    // --- Invincibility Timer ---
    if (p.invincibleTimer > 0) {
      p.invincibleTimer -= dt;
    }

    // --- Active Power-Up Timer & Special State Effects ---
    if (p.powerUpTimer && p.powerUpTimer > 0) {
      p.powerUpTimer -= dt;
      if (p.powerUpTimer <= 0) {
        p.activePowerUp = null;
        p.powerUpTimer = 0;
        this.addFloatingText('POWER-UP EXPIRED', p.x, p.y - 45, '#94a3b8');
      }
    }

    if (p.activePowerUp === 'invincible') {
      p.invincibleTimer = 0.5; // continuous invulnerability while active
      // Knock out enemies on contact
      for (const e of this.enemies) {
        if (e.defeated) continue;
        if (distance2D(p.x, p.y - 20, e.x, e.y) < 54) {
          e.hp = 0;
          this.camera.trauma = Math.min(1.0, this.camera.trauma + 0.2);
          this.runScore += 300;
          this.knockOut(e, e.x >= p.x ? 1 : -1, 'STAR K.O.! +300');
          this.spawnDebrisBurst(e.x, e.y, '#facc15');
        }
      }
    }

    if (this.comboCount > this.statMaxCombo) this.statMaxCombo = this.comboCount;
    // the sparkle trail reward: stardust drifting off Pokey as he moves
    if (this.trailOn && Math.abs(this.player.vx) > 40 && (this.trailT += dt) > 0.04) {
      this.trailT = 0;
      const pl = this.player;
      const hues = ['#fbbf24', '#f9a8d4', '#6ee7b7', '#fde047'];
      this.emit({
        x: pl.x - pl.facing * (6 + Math.random() * 10),
        y: pl.y - 8 - Math.random() * 38,
        vx: -pl.facing * (10 + Math.random() * 30),
        vy: -10 - Math.random() * 40,
        color: hues[Math.floor(Math.random() * hues.length)],
        size: 4.2 + Math.random() * 3.6,
        life: 0.8 + Math.random() * 0.4,
        maxLife: 1.2,
        type: 'star',
      });
    }
    // creatures that came on screen (the journal's "met" list)
    if ((this.seenCheck += dt) > 0.4) {
      this.seenCheck = 0;
      const cam = this.camera;
      for (const e of this.enemies) {
        if (e.defeated || e.type === 'boss' || e.type === 'ant_hazard' || this.statSeen.has(e.type)) continue;
        if (e.x > cam.x - 60 && e.x < cam.x + cam.viewportWidth + 60 && e.y > cam.y - 60 && e.y < cam.y + cam.viewportHeight + 60) this.statSeen.add(e.type);
      }
    }

    // --- Combo Reset Timer ---
    if (this.comboResetTimer > 0) {
      this.comboResetTimer -= dt;
      if (this.comboResetTimer <= 0) {
        this.comboCount = 0;
      }
    }

    if (p.grounded || p.climbing || p.hanging) this.swungOff = -1;
    // --- Vine Re-grab Cooldown & Scratch Audio Timers ---
    if (this.vineCooldownTimer > 0) {
      this.vineCooldownTimer -= dt;
      if (this.vineCooldownTimer <= 0) {
        this.lastReleasedVineId = -1;
      }
    }
    if (this.treeClimbAudioTimer > 0) {
      this.treeClimbAudioTimer -= dt;
    }

    this.respawnFlash = Math.max(0, this.respawnFlash - dt);
    this.inputGrace = Math.max(0, this.inputGrace - dt);
    // the pause on steering after a respawn is for a thumb still held from before the fall: a fresh touch or key counts at once
    if (this.inputGrace > 0 && this.graceMoves >= 0 && this.input.moves !== this.graceMoves) this.inputGrace = 0;

    // --- Camera Trauma Shake Decay ---
    this.camera.trauma = Math.max(0, this.camera.trauma - dt * 2.2);

    // --- Squash & Stretch Restoration ---
    p.squashX += (p.targetScaleX - p.squashX) * Math.min(1, dt * 14);
    p.squashY += (p.targetScaleY - p.squashY) * Math.min(1, dt * 14);

    // --- for the drawing: is he diving onto something, and how long since a bounce ---
    p.diving = !p.grounded && !p.climbing && !p.isVineSwinging && !p.hanging && this.input.state.down && p.vy > 0;
    if (p.bounce) {
      p.bounce.t += dt;
      if (p.grounded || p.climbing || p.isVineSwinging || p.hanging || p.bounce.t > 1.6) p.bounce = undefined;
    }

    // --- Dynamic Rainforest Tree Climbing & Vine Swinging Mechanics ---
    let nearTreeVine: Vine | null = null;
    let nearSwingVine: Vine | null = null;

    // A liana we are already swinging on stays ours however far it carries us, and no other is in reach meanwhile: the lianas swing on
    // their own (physics.ts), and a neighbour's swing can come within reach of him; it used to be taken for his own (the first match in
    // the list), which threw him across to its swing
    const own = p.isVineSwinging ? this.vines.find((v) => v.id === p.swingVineId) : undefined;
    for (const v of own ? [own] : this.vines) {
      if (own) {
        nearSwingVine = v;
        break;
      }
      // Prevent instant magnetic re-grabbing when jumping off a vine!
      if ((this.vineCooldownTimer > 0 && v.id === this.lastReleasedVineId) || v.id === this.swungOff) {
        continue;
      }

      if (v.vineType === 'tree_climb') {
        if (v.off) continue;
      if (Math.abs(p.x - v.x) < (p.climbing ? 60 : 54) && p.y >= v.topY - 12 && p.y <= v.bottomY + 25) {
          nearTreeVine = v;
          break;
        }
      } else {
        // (the timed swing's catch, physics.ts TIMED.grabX: 60 px, Easy's 76; the stage checks assume it, and it used to be a fixed 48 here)
        if (canGrabSwing(p.x, p.y, v, this.vineClock)) {
          nearSwingVine = v;
          break;
        }
      }
    }
    // hands full (puzzlePlay.ts): no climbing a trunk, no catching a vine
    if (this.kit?.holding) {
      nearTreeVine = null;
      nearSwingVine = null;
    }
    this.nearTreeVine = nearTreeVine;
    this.nearSwingVine = nearSwingVine;

    // 1. TREE CLIMBING LOGIC (Vertical vines on tree trunks)
    // a flick up is a jump press and an up press at once, and a thumb lifts again quickly: remember it for a moment
    // so a jump that touches a trunk grabs it even if the thumb has already left the glass
    if (this.input.state.jumpPressed) this.upIntent = 0.35;
    else this.upIntent = Math.max(0, this.upIntent - dt);
    let wantGrab = this.input.state.up || this.upIntent > 0 || (!p.grounded && this.input.state.down);
    // (only a jump straight up or toward the trunk grabs it, and not while steering away; in the air, only moving toward it or holding up
    // or down without leaning or steering away: any jump within reach grabbed it, so a leap away from beside a trunk stuck to it, CT-10)
    if (wantGrab && nearTreeVine && !p.climbing) {
      const toward = Math.abs(nearTreeVine.x - p.x) < 8 ? 0 : Math.sign(nearTreeVine.x - p.x);
      const st = this.input.state;
      const steer = st.left ? -1 : st.right ? 1 : 0;
      const lean = this.upIntent > 0 ? (st.jumpLean ?? 0) : 0;
      const aimedAway = toward !== 0 && (lean === -toward || steer === -toward);
      const movingToward = toward !== 0 && p.vx * toward > 20;
      wantGrab = p.grounded ? !aimedAway : movingToward || !aimedAway;
    }
    const onRope = this.updateRope(dt);
    this.updateRopeLoad(dt);
    if (onRope) {
      // hanging from a rope: updateRope has done all the moving
    } else if (p.swim && !(nearTreeVine && wantGrab) && this.swimMove(dt)) {
      // swimming in calm water: swimMove (swim.ts) has done all the moving
    } else if (nearTreeVine && (p.climbing || wantGrab) && (p.climbing || !(p.grounded && p.y <= nearTreeVine.topY + 14))) {
      // (standing on the branch at the very top of a trunk, a jump is a jump: it used to grab the trunk and turn into the
      // little vault off its top, a 21 px hop, so nothing could be jumped to from beside a trunk's top)
      if (!p.climbing) {
        sound.playVineGrab();
        // the press that grabbed the trunk must not also leap off it or hop away with a drifting thumb
        this.climbGrace = 0.3;
        this.climbSideTimer = 0;
        this.upIntent = 0;
        this.jumpBufferTimer = 0;
        this.climbAssist = 0.45;
      }
      // (the grab's little carry runs down even while up is held, and an explicit stop ends it: it used to be topped up to 0.25 s while
      // up was held, so he climbed 50 to 90 px past where the thumb stopped, polish report CT-4)
      if (this.input.state.down || (this.input as { takeClimbStop?: () => boolean }).takeClimbStop?.()) this.climbAssist = 0;
      else this.climbAssist = Math.max(0, this.climbAssist - dt);
      this.climbGrace = Math.max(0, this.climbGrace - dt);
      if (this.climbGrace > 0) this.input.state.jumpPressed = false;
      // a sideways push only lets go once it is clearly deliberate: held, and not while climbing up or down. By touch and with the Pad it
      // must be held longer, and on a trunk both steer only on a clearly sideways stroke (touchGestures.ts trunkSide, padControl.ts): a
      // climbing stroke that drifted a little sideways dropped him off the moment the thumb stopped (CT-4)
      const sideHeld = this.input.state.left || this.input.state.right;
      const vertHeld = this.input.state.up || this.input.state.down || this.climbAssist > 0;
      this.climbSideTimer = sideHeld && !vertHeld && this.climbGrace <= 0 ? this.climbSideTimer + dt : 0;
      p.climbing = true;
      p.isVineSwinging = false;
      p.grounded = false;
      p.vx = 0;
      p.vy = 0;
      p.x = nearTreeVine.x; // snap smoothly to tree trunk vine

      // Climb Up / Down
      if (this.input.state.up || this.climbAssist > 0) {
        p.y = Math.max(nearTreeVine.topY - 4, p.y - 220 * dt);
        // one soft grip per hand, a little uneven like real hands (every 0.18 s sounded like the audio skipping on an iPhone)
        if (this.treeClimbAudioTimer <= 0) {
          sound.playTreeClimb();
          this.treeClimbAudioTimer = 0.36 + Math.random() * 0.12;
        }
      } else if (this.input.state.down) {
        p.y = Math.min(nearTreeVine.bottomY + 4, p.y + 220 * dt);
        if (this.treeClimbAudioTimer <= 0) {
          sound.playTreeClimb();
          this.treeClimbAudioTimer = 0.36 + Math.random() * 0.12;
        }
      }

      // Natural Exit A: Reached the Top of the Tree -> Vault onto Branch Platform!
      if (p.y <= nearTreeVine.topY + 12 && (this.input.state.up || this.climbAssist > 0 || this.input.state.jumpPressed || this.input.state.left || this.input.state.right)) {
        p.climbing = false;
        this.vineCooldownTimer = 0.35;
        this.lastReleasedVineId = nearTreeVine.id;
        this.input.state.jumpPressed = false;
        p.y = nearTreeVine.topY - 12;
        p.vy = -190;
        // (with only up held, toward the side with more ledge at the top: he used to vault the way he faced, and walking back to a trunk
        // (4-3's, after the water threw him back) he faced away from the shelf and vaulted off its short end)
        p.vx = (this.input.state.left ? -1 : this.input.state.right ? 1 : this.vaultSide(nearTreeVine, p.facing)) * 160;
        p.grounded = true;
        p.jumpsLeft = 2;
        sound.playJump();
        this.spawnSparkBurst(p.x, p.y, '#34d399');
      }
      // Natural Exit B: Reached the Ground -> Step off smoothly!
      else if (p.y >= nearTreeVine.bottomY - 8 && this.input.state.down) {
        p.climbing = false;
        this.vineCooldownTimer = 0.30;
        this.lastReleasedVineId = nearTreeVine.id;
        p.grounded = true;
        p.vy = 0;
      }
      // Natural Exit C: Deliberate Jump off Tree Trunk!
      else if (this.input.state.jumpPressed) {
        p.climbing = false;
        this.input.state.jumpPressed = false;
        this.vineCooldownTimer = 0.42; // Prevent immediate re-grab!
        this.lastReleasedVineId = nearTreeVine.id;

        // (the way a leaning flick leaned first: leapDir)
        const jumpDir = this.leapDir(p.facing);
        p.facing = jumpDir as 1 | -1;
        p.vx = jumpDir * 330;
        p.vy = -PHYS.treeLeapV;
        this.launched = true;
        p.jumpsLeft = 2; // Gives double-jump in air for full player control!
        p.isDoubleJumping = false;
        p.somersaultAngle = 0;
        p.squashX = 0.8;
        p.squashY = 1.3;

        sound.playJump();
        this.spawnSparkBurst(p.x, p.y, '#34d399');
      }
      // Natural Exit D: Steer away with Left / Right (held on purpose) -> Natural graceful hop off trunk!
      else if (this.climbSideTimer >= (this.input.source === 'keys' ? 0.2 : 0.35)) {
        const steerDir = this.input.state.left ? -1 : 1;
        p.climbing = false;
        this.vineCooldownTimer = 0.35;
        this.lastReleasedVineId = nearTreeVine.id;
        p.facing = steerDir;
        p.vx = steerDir * 240;
        p.vy = -PHYS.treeHopV;
        this.launched = true;
        p.jumpsLeft = 2;
        sound.playJump();
      }
    } else {
      if (p.climbing && !nearTreeVine) {
        p.climbing = false;
      }

      // 2. SWINGING LIANA LOGIC (Chasms & ravines)
      if (
        nearSwingVine &&
        !p.isVineSwinging &&
        !p.grounded &&
        (this.input.state.up || Math.abs(p.vx) > 25 || this.input.state.left || this.input.state.right) &&
        (this.vineCooldownTimer <= 0 || nearSwingVine.id !== this.lastReleasedVineId)
      ) {
        p.isVineSwinging = true;
        p.climbing = false;
        p.swingVineId = nearSwingVine.id;
        this.statSwings++;
        this.sweetSnap = null;
        this.swingLeapWait = 0;
        {
          const sw = swingGrab({ x: p.x, y: p.y, vx: p.vx, vy: p.vy }, nearSwingVine, this.vineClock);
          p.swingLength = sw.len;
          p.swingAngle = sw.angle;
          p.swingAngularVelocity = sw.omega;
        }
        p.jumpsLeft = 2;
        p.isDoubleJumping = false;
        p.somersaultAngle = 0;
        this.swingGrace = 0.25;
        this.swingDownHeld = { dir: 0, t: 0 };
        this.input.state.jumpPressed = false;
        this.jumpBufferTimer = 0;
        sound.playVineGrab();
      }

      if (p.isVineSwinging && nearSwingVine) {
        this.swingGrace = Math.max(0, this.swingGrace - dt);
        {
          const st = this.input.state;
          const dir = st.down ? (st.left ? -1 : st.right ? 1 : 0) : 0;
          // (only the time it is held against the swing counts, kept while the swing comes back its way: a thumb pumping the swing
          // turns round with it every stroke and starts again, a thumb holding to get off adds up over a swing or so)
          const against = dir !== 0 && dir !== Math.sign(p.swingAngularVelocity || 0);
          this.swingDownHeld = dir !== 0 && dir === this.swingDownHeld.dir ? { dir, t: this.swingDownHeld.t + (against ? dt : 0) } : { dir, t: 0 };
        }
        if (this.swingGrace > 0) this.input.state.jumpPressed = false;
        p.grounded = false;
        p.somersaultAngle = 0;
        p.jumpsLeft = 2;

        {
          // (the vine's own clock, a frame ago: the step moves it on to now, and the vine is where its swing puts it)
          const sw: SwingState = { angle: p.swingAngle || 0, omega: p.swingAngularVelocity || 0, len: p.swingLength || 100, t: this.vineClock - dt, amp: vineAmp(nearSwingVine) };
          if (this.input.state.right) p.facing = 1;
          if (this.input.state.left) p.facing = -1;
          // the self-swing (physics.ts TIMED): the vine swings itself at a steady height and rhythm; holding a direction only turns
          // him to face the way he will let go, up and down climb, and the only choice is when. A glint shows the sweet spot for letting go.
          const climb = this.input.state.up ? -1 : this.input.state.down ? 1 : 0;
          const r = swingStep(sw, nearSwingVine, dt, p.facing, climb);
          const sweet = inSweetSpot(sw, p.facing);
          if (sweet) this.sweetSnap = { angle: sw.angle, omega: sw.omega, len: sw.len, dir: p.facing, at: this.gameTime };
          // a press a beat early waits for the sweet spot, then lets go (physics.ts RELEASE)
          if (this.swingLeapWait > 0) {
            this.swingLeapWait -= dt;
            if (sweet || this.swingLeapWait <= 0) {
              this.swingLeapWait = -1; // (-1: this press has waited already, so it lets go now whatever the swing is doing)
              this.input.state.jumpPressed = true;
            }
          }
          this.sweetGlow += ((sweet ? 1 : 0) - this.sweetGlow) * Math.min(1, dt * 14);
          this.sweetGlint -= dt;
          if (sweet && this.sweetGlint <= 0) {
            this.sweetGlint = 0.14;
            this.spawnSparkBurst(r.x - Math.sin(sw.angle) * VINE_HANG, r.y - Math.cos(sw.angle) * VINE_HANG, '#fde68a');
          }
          p.swingAngle = sw.angle;
          p.swingAngularVelocity = sw.omega;
          p.swingLength = sw.len;
          p.x = r.x;
          p.y = r.y;
          p.vx = r.vx;
          p.vy = r.vy;
          nearSwingVine.swingAngle = sw.angle;
        }

        // --- NATURAL SWING EXIT 1: DROP / LET GO (Holding Down + Jump, or Down at low speed) ---
        if (this.input.state.down && this.input.state.jumpPressed) {
          p.isVineSwinging = false;
          this.input.state.jumpPressed = false;
          this.vineCooldownTimer = 0.45; // Prevent re-grab!
          this.swungOff = nearSwingVine.id;
          this.lastReleasedVineId = nearSwingVine.id;

          const dropDir = this.input.state.left ? -1 : this.input.state.right ? 1 : p.facing;
          p.facing = dropDir as 1 | -1;
          p.vx = dropDir * 140;
          p.vy = 80;
          p.jumpsLeft = 2;
        }
        // --- NATURAL SWING EXIT 2: HEROIC TARZAN LEAP (Jump button Pressed) ---
        // (a press a beat before the sweet spot is held until he reaches it, below)
        else if (this.input.state.jumpPressed && !this.holdLeapForSweet(this.leapDir(p.facing))) {
          p.isVineSwinging = false;
          this.input.state.jumpPressed = false;
          this.vineCooldownTimer = 0.50; // Guaranteed window to fly free from the vine!
          this.swungOff = nearSwingVine.id;
          this.lastReleasedVineId = nearSwingVine.id;

          // the way a leaning flick leaned, then the held steer, then (refined) the way he faces, toward the next vine (the swing's side
          // threw testers backward); the old rules fall back to the side of the swing he is on
          const releaseDir = this.leapDir(
            this.refined ? p.facing : (Math.sin(p.swingAngle) > 0.05 ? 1 : Math.sin(p.swingAngle) < -0.05 ? -1 : p.facing),
          );

          p.facing = releaseDir as 1 | -1;
          // Forward boost + heroic upward arc (capped so a big swing cannot rocket you off the map)
          {
            // let go in the sweet spot: the leap toward the next vine. Anywhere else he flies off the way the vine was carrying him.
            const sw = { angle: p.swingAngle || 0, omega: p.swingAngularVelocity || 0, len: p.swingLength || 100, amp: vineAmp(nearSwingVine) };
            // a press a beat after the sweet spot, while still out in front (the forward end of the swing): the leap it would have given
            const snap = this.sweetSnap;
            const call = releaseCall(sw, releaseDir as 1 | -1, snap && snap.dir === releaseDir ? this.gameTime - snap.at : Infinity);
            const l = timedLaunch(call === 'late' && snap ? snap : sw, releaseDir as 1 | -1, this.input.state.jumpLean === releaseDir);
            p.vx = l.vx;
            p.vy = l.vy;
            this.launched = l.sweet;
            this.swingLeapWait = 0;
            this.sweetSnap = null;
          }
          p.jumpsLeft = 2; // Full air control - player can double jump mid-air!
          p.isDoubleJumping = false;
          p.somersaultAngle = 0;
          p.squashX = 0.72;
          p.squashY = 1.38;

          sound.playJump();
          this.spawnSparkBurst(p.x, p.y, '#34d399');
        }
        // --- NATURAL SWING EXIT 3: AUTOMATIC PLATFORM LANDING ---
        // (only when he plausibly wants off: swingLanding. On 1-6, climbing down a liana lowered his feet past the corner of the ledge
        // beside it, and it set him down there in the middle of a pump, which read as the vine letting go, QA 2026-10-26)
        else {
          const steer = this.input.state.right ? 1 : this.input.state.left ? -1 : 0;
          const hands = { steer: steer as -1 | 0 | 1, down: this.input.state.down, held: this.swingDownHeld.t };
          for (const plat of this.platforms) {
            if (p.x >= plat.x - 10 && p.x <= plat.x + plat.width + 10 && p.vy >= 0 && p.y < plat.y + 14 && p.y > plat.y - SWING_LAND.reach) {
              const how = swingLanding({ angle: p.swingAngle || 0, omega: p.swingAngularVelocity || 0, amp: vineAmp(nearSwingVine) }, nearSwingVine.x, plat, hands, p.y - plat.y);
              if (how === 'step') {
                // down and toward a ledge just below his feet: he steps off and drops onto it
                p.isVineSwinging = false;
                p.vx = (plat.x + plat.width / 2 < nearSwingVine.x ? -1 : 1) * 140;
                p.vy = 40;
                this.vineCooldownTimer = 0.40;
                this.lastReleasedVineId = nearSwingVine.id;
                break;
              }
              if (how === 'land') {
                p.isVineSwinging = false;
                p.grounded = true;
                p.y = plat.y;
                p.vy = 0;
                // (on the ledge, not on the 10 px of air beside it, and not carried straight back off the edge he just reached)
                if (p.x < plat.x + 6 || p.x > plat.x + plat.width - 6) {
                  p.x = Math.max(plat.x + 6, Math.min(plat.x + plat.width - 6, p.x));
                  const off = p.x < plat.x + plat.width / 2 ? -1 : 1;
                  if (Math.sign(p.vx) === off) p.vx = 0;
                }
                this.vineCooldownTimer = 0.40;
                this.lastReleasedVineId = nearSwingVine.id;
                this.spawnJumpDust(p.x, p.y);
                break;
              }
            }
          }
        }
      } else {
        if (p.isVineSwinging) {
          p.isVineSwinging = false;
        }

        // --- Standard Ground / Aerial Movement ---
        if (this.input.state.down && p.grounded) {
          p.ducking = true;
          if (Math.abs(p.vx) <= PHYS.groundDec * dt) p.vx = 0;
          else p.vx -= Math.sign(p.vx) * PHYS.groundDec * dt;
        } else {
          p.ducking = false;

          // the fog only decides the take-off: awake when he leaves the ground means the whole flight is awake (so a cloud that wakes
          // mid-jump can never drop him into the gap; it only weighs on jumps that start inside it)
          if (p.grounded) this.flightClear = this.drowsy <= 0;
          const sleepy = this.drowsy > 0 && !(this.flightClear && !p.grounded);
          const speedMult = (p.activePowerUp === 'speed' ? 1.4 : 1.0) * (this.slowTimer > 0 ? 0.45 : 1) * (sleepy ? drowsySpeed(this.drowsy) : 1) * this.dragSpeed;
          let maxSpeed = PHYS.maxRun * speedMult * this.attackMoveMul();
          const steer = this.inputGrace > 0 ? 0 : this.input.state.left ? -1 : this.input.state.right ? 1 : 0;
          // touch jump help: a second jump taken with nothing steering pushes him forward until he lands or the thumb takes over
          let dir: -1 | 0 | 1 = steer;
          let leaning = false;
          if (this.touchHelp() === 'off' || p.grounded) {
            if (p.grounded) this.airDrive = newAirDrive();
          } else if (this.inputGrace <= 0) {
            dir = airCarry(this.airDrive, steer, this.input.state.down);
            leaning = this.airDrive.lean && steer === 0;
          }
          // that push is gentler than a run, so a double jump does not fly off a small platform
          if (leaning) maxSpeed *= LEAN_SPEED;
          if (dir !== 0) {
            if (!this.facingLocked()) p.facing = dir as 1 | -1;
            const reversing = Math.sign(p.vx) === -dir && Math.abs(p.vx) > 20;
            const acc = (p.grounded ? PHYS.groundAcc : PHYS.airAcc) * speedMult + (reversing ? (p.grounded ? PHYS.turnBonus : PHYS.airTurn) : 0);
            if (dir * p.vx < maxSpeed) {
              p.vx += dir * acc * dt;
              if (dir * p.vx > maxSpeed) p.vx = dir * maxSpeed;
            } else {
              // launched faster than run speed (vine release, bounce): bleed off gently
              p.vx -= dir * (this.atk && p.grounded ? PHYS.groundDec : PHYS.airDec) * dt;
            }
          } else {
            // refined controls: a finger lifted in mid-air no longer brakes him (holding down still does). Nor does one lifted on the frame
            // he takes off: a one-thumb flick lifts at once, and when the lift beat the frame, ground braking ran before the jump below and
            // took 113 px/s off the take-off, so the same running jump carried 93 px or 178 px by luck (polish report CT-1, touchRig.test.ts)
            const takeOff = p.grounded && this.input.state.jumpPressed;
            const dec = p.grounded ? (takeOff ? 0 : PHYS.groundDec) : this.refined && !this.input.state.down ? 0 : PHYS.airStop;
            if (Math.abs(p.vx) <= dec * dt) p.vx = 0;
            else p.vx -= Math.sign(p.vx) * dec * dt;
            // standing still past the end of a ledge: drawn a small step back, so no more than about a quarter of him is over the air (EDGE)
            if (p.vx === 0 && !takeOff && !this.atk) this.edgeTarget = this.edgeOffset();
          }
        }
        // (where he is drawn eases to that step back while he stands there, and back onto his footing within a few frames when he moves)
        {
          const cur = p.drawDx ?? 0;
          const rate = (this.edgeTarget !== 0 ? EDGE.stepV : EDGE.snapV) * dt;
          const d = this.edgeTarget - cur;
          p.drawDx = Math.abs(d) <= rate ? this.edgeTarget : cur + Math.sign(d) * rate;
          p.teeter = this.edgeTarget !== 0 && Math.abs(this.edgeTarget - p.drawDx) < 1 ? (this.edgeTarget < 0 ? 1 : -1) : 0;
          this.edgeTarget = 0;
        }

        const assist = this.assistNow();
        if (p.grounded) {
          // (133 ms on Normal, 167 on Easy, on every stage; the early-stage help adds on top: physics.ts FORGIVE)
          // (and a hair over, so a press on the frame that reaches it, 4 frames at 30 fps for 133 ms, still counts)
          this.coyoteTimer = this.forgive.coyote + ASSIST.coyote * assist + 0.001;
        } else {
          this.coyoteTimer = Math.max(0, this.coyoteTimer - dt);
        }

        if (this.jumpBufferTimer > 0) {
          this.jumpBufferTimer -= dt;
        }

        if (this.input.state.jumpPressed) {
          if (p.grounded || this.coyoteTimer > 0) {
            p.vy = -PHYS.jumpV * drowsyJump(this.drowsy) * this.dragJump;
            p.grounded = false;
            p.jumpsLeft = 1;
            p.isDoubleJumping = false;
            p.somersaultAngle = 0;
            this.coyoteTimer = 0;
            this.jumpBufferTimer = 0;
            this.input.state.jumpPressed = false;
            p.squashX = 0.82;
            p.squashY = 1.28;
            this.takeOff(false);
            sound.playJump();
            this.spawnJumpDust(p.x, p.y);
          } else if (p.jumpsLeft > 0 && !p.climbing) {
            p.vy = secondJumpV(p.vy, PHYS.doubleV * (1 + ASSIST.doubleJump * assist) * (this.flightClear ? 1 : drowsyJump(this.drowsy)) * this.dragJump);
            p.jumpsLeft = 0;
            p.isDoubleJumping = true;
            p.somersaultAngle = 0;
            this.jumpBufferTimer = 0;
            this.input.state.jumpPressed = false;
            p.squashX = 0.80;
            p.squashY = 1.32;
            this.takeOff(true);
            sound.playDoubleJump();
            this.spawnDoubleJumpBurst(p.x, p.y);
          } else {
            this.jumpBufferTimer = this.forgive.buffer + ASSIST.buffer * assist;
            this.input.state.jumpPressed = false;
          }
        }

        if (p.isDoubleJumping) {
          p.somersaultAngle += p.facing * dt * 14;
        }

        // Variable jump height: releasing early cuts the ascent (tap = hop, hold = full)
        if (p.vy >= 0) this.launched = false;
        if (!this.input.state.jumpHeld && p.vy < -PHYS.cutV && !this.launched) {
          p.vy = -PHYS.cutV;
        }

        // Gravity: lighter going up, heavier coming down, a touch of hang at the apex
        let gravity = p.vy < 0 ? PHYS.gravUp : PHYS.gravDown;
        if (Math.abs(p.vy) < 90 && this.input.state.jumpHeld) gravity *= 0.72;
        p.vy += gravity * dt;
        if (p.vy > PHYS.maxFall) p.vy = PHYS.maxFall;
        // Leaf Glide: holding Jump while falling opens the leaf and slows the fall
        const lift = (this.currentStage.config.worldIndex === 9 && ventLift(this.currentStage.zones, p.x, p.y - 32, this.gameTime)) || !!this.w4?.inUpdraft(p.x, p.y - 32);
        // (pouring water folds the leaf: World 4's falls cannot be glided through, w4Play.ts inPour)
        const glideCap = glideStep(this.glide, { has: this.skills.has('glide') && !this.w4?.inPour(p.x, p.y) && !this.kit?.holding, airborne: !p.grounded && !p.climbing, held: this.input.state.jumpHeld, vy: p.vy, lift }, dt);
        p.vy = glideBrake(p.vy, glideCap, dt);
        if (lift && this.glide.on) {
          p.vy = glideLift(p.vy, dt);
          if (!this.zoneHinted.lift) {
            this.zoneHinted.lift = true;
            this.addFloatingText('WARM AIR! HOLD THE LEAF OPEN TO RISE', p.x, p.y - 80, '#fdba74');
          }
        }
        this.glideOpen += ((this.glide.on ? 1 : 0) - this.glideOpen) * Math.min(1, dt * 16);
        if (this.glide.on) this.statGlideSec += dt;
        if (p.grounded) this.glideOpen = 0;

        p.x += (p.vx + this.windV + this.bossShove + this.bossGust) * dt;
        p.y += p.vy * dt;
      }
    }

      // Walk cycle animation
      if (p.grounded && Math.abs(p.vx) > 10) {
        p.walkCycle += Math.abs(p.vx) * dt * 0.08;
      }

      // Clamp horizontal level bounds (safely stops player right at the victory shrine altar)
      const maxX = this.currentStage.exitTotemX > 0 && this.currentStage.config.objectiveType !== 'ascent'
        ? this.currentStage.exitTotemX + SHRINE_STOP
        : this.currentStage.config.levelWidth - 20;
      p.x = Math.max(20, Math.min(maxX, p.x));

      // --- Solid ground blocks: walls you cannot walk through (Mario-style) ---
      p.pushing = false;
      let wallSide = 0;
      if (!p.climbing && !p.isVineSwinging && !p.hanging) {
        const half = 19;
        const prevX = p.x - (p.vx + this.windV + this.bossShove + this.bossGust) * dt;
        for (const plat of this.platforms) {
          if (plat.broken || plat.type !== 'solid' || plat.height < 50) continue;
          // (not when he stands on it or above its top, nor when he is wholly under it: a boulder up on a shelf, World 4, is no wall to him
          // on the ground under the shelf, and he cannot push it from below)
          if (!blockBeside(p.y, p.height, plat)) continue;
          if (p.x + half <= plat.x || p.x - half >= plat.x + plat.width) continue;
          const fromLeft = prevX + half <= plat.x + 2;
          const fromRight = prevX - half >= plat.x + plat.width - 2;
          // World 5: a body a little way over the edge already (he came over the corner in the air, a foot short of standing) with his
          // feet just under the top is at the lip too. He used to slide down inside the face to the foot of it
          const lipL = this.stepHelp && !fromLeft && !fromRight && p.x + half - plat.x <= LIP_IN && p.x < plat.x + plat.width / 2;
          const lipR = this.stepHelp && !fromLeft && !fromRight && plat.x + plat.width - (p.x - half) <= LIP_IN && p.x >= plat.x + plat.width / 2;
          if (!fromLeft && !fromRight && !lipL && !lipR) continue;
          if (p.y <= plat.y + this.forgive.mantle && p.vy >= -120) {
            // caught the lip of the ledge: hoist up onto it
            p.y = plat.y;
            p.vy = 0;
            // World 5: and far enough onto it to stand. Hoisted with only a pixel or two of him over the edge, the floor check (a foot on
            // it, about 8 px) never took him, so he hung in the air at the corner, dropped and was hoisted again, frame after frame, or
            // slid down inside the face: QA's sideways player at the soft pits' lips of 5-3, 5-4 and 5-5 "ends up hanging on its side"
            // (v198). Now the hoist puts a foot on the ledge, and he stands there.
            if (this.stepHelp) p.x = fromLeft || lipL ? Math.max(p.x, plat.x - half + LIP_IN) : Math.min(p.x, plat.x + plat.width + half - LIP_IN);
            continue;
          }
          if (lipL || lipR) continue;
          // a hollow log (protoStage.ts): walking into it pushes it along, slower than a walk
          if (plat.push && p.grounded && ((fromLeft && this.input.state.right) || (fromRight && this.input.state.left))) {
            const dir = fromLeft ? 1 : -1;
            p.pushing = true;
            const nx = Math.max(plat.push.min, Math.min(plat.push.max - plat.width, plat.x + dir * PUSH_SPEED * dt));
            if (nx !== plat.x) {
              plat.x = nx;
              this.protoScene.movedAt.set(plat.id, this.gameTime);
              this.pushSoundT -= dt;
              if (this.pushSoundT <= 0) {
                this.pushSoundT = 0.28;
                sound.playTreeClimb();
                this.spawnJumpDust(fromLeft ? plat.x + plat.width - 6 : plat.x + 6, plat.y + plat.height);
              }
            }
            p.x = fromLeft ? plat.x - half : plat.x + plat.width + half;
            p.vx = dir * Math.min(Math.abs(p.vx), PUSH_SPEED);
            continue;
          }
          p.x = fromLeft ? plat.x - half : plat.x + plat.width + half;
          if (fromLeft && p.vx > 0) p.vx = 0;
          if (fromRight && p.vx < 0) p.vx = 0;
          // in the air below the lip: he cannot hold on, so he is drawn a little off the face (wallOff), not with a paw on it
          if (!p.grounded) wallSide = fromLeft ? 1 : -1;
        }
      }
      // World 5, by touch: jumping into a face carries him on into it until he is over its top, unless the thumb steers away. One thumb
      // steers to the face, lifts and flicks: the face stopped him dead, and with the thumb off the glass he rose past its top and came
      // straight back down beside it (QA v198: the same flick worked one try and not the next, by whether the thumb was still on).
      if (wallSide !== 0 && this.stepHelp && this.touchHelp() !== 'off') {
        const steerNow = this.input.state.left ? -1 : this.input.state.right ? 1 : 0;
        if (steerNow !== -wallSide && !this.input.state.down) this.airDrive = { drive: wallSide as -1 | 1, lean: true };
      }
      // (eased, so meeting a wall and leaving it never pops the drawing sideways)
      this.wallOff += (-wallSide * WALL_OFF - this.wallOff) * Math.min(1, dt * 18);

      // Mushrooms spring you up when you run into them, not only when you land on them
      if (!p.climbing && !p.isVineSwinging && !p.hanging) {
        for (const plat of this.platforms) {
          if (plat.type !== 'bouncy' || plat.broken) continue;
          if (p.x + 12 > plat.x && p.x - 12 < plat.x + plat.width && p.y > plat.y && p.y <= plat.y + plat.height + 8 && p.vy >= -100) {
            p.y = plat.y;
            this.bounceOff();
            break;
          }
        }
      }

      // --- Platform Collisions (with generous edge forgiveness) ---
      p.grounded = false;
      this.standingOnId = -1;
      const assist = this.assistNow();
      const playerFeet = p.y;
      const playerPrevFeet = p.y - p.vy * dt;

      // every floor his feet meet this frame (in stage order)
      const floors = (p.hanging ? [] : this.platforms).filter((plat) => {
        if (plat.broken) return false;
        // a log is only there between its banks; the part hidden under a bank is not standable
        if (plat.type === 'drift' && plat.drift && (p.x < plat.drift.x0 || p.x > plat.drift.x1)) return false;
        // Check if player is horizontally within platform (generous width tolerance)
        // How far the player's CENTRE may hang past a ledge and still count as standing on it. It was 0.48 (21 px), which left
        // Pokey standing in mid-air with most of his body off the cliff. 0.26 (about 11 px) keeps a foot on the ledge.
        const side = plat.type === 'drift' ? DRIFT_CATCH.side + (this.easyLogs ? DRIFT_CATCH.easySide : 0) : 0.26 + ASSIST.landSide * assist;
        const catchDrop = plat.type === 'drift' ? DRIFT_CATCH.drop : 14 + ASSIST.catchDrop * assist;
        if (!(p.x + p.width * side > plat.x && p.x - p.width * side < plat.x + plat.width)) {
          // ledge-landing forgiveness (physics.ts FORGIVE.landPx, every stage): falling onto it from above, a foot that misses its edge
          // by a few px still lands, nudged on. Never for walking off an edge (his feet were not above its top) nor a drifting log
          // (but a log too on Easy: river.ts DRIFT_CATCH, LV-5)
          if ((plat.type === 'drift' && !this.easyLogs) || !(playerPrevFeet < plat.y - 2)) return false;
          const missL = plat.x - (p.x + p.width * side);
          const missR = p.x - p.width * side - (plat.x + plat.width);
          // (and only for a jump carrying him toward it that fell a little short: a hop straight up beside a step is not caught here,
          // the step help is for that, STEP_UP, and World 5's stuck-helper waits for a player hopping in place)
          if (Math.max(missL, missR) > this.forgive.landPx || (missL > 0 ? p.vx : -p.vx) < 30) return false;
        }
        // Check landing from above
        return p.vy >= 0 && playerPrevFeet <= plat.y + catchDrop && playerFeet >= plat.y;
      });
      // two at the same height (a basket flush on the path at its bottom stop): the one under his middle, a moving one first (lift.ts),
      // so a lift never rises without him
      const plat = pickFloor(floors, p.x);
      if (plat && (plat.type !== 'drift' || this.easyLogs)) {
        // (caught by the ledge-landing forgiveness: on with a foot, as far as the usual tolerance needs)
        const side = plat.type === 'drift' ? DRIFT_CATCH.side + DRIFT_CATCH.easySide : 0.26 + ASSIST.landSide * assist;
        const missL = plat.x - (p.x + p.width * side);
        const missR = p.x - p.width * side - (plat.x + plat.width);
        if (missL >= 0) p.x += missL + 1;
        else if (missR >= 0) p.x -= missR + 1;
      }
      if (plat) {
        p.y = plat.y;
        const landV = p.vy; // how hard he came down: the squash below follows it
        p.vy = 0;
        p.grounded = true;
        this.standingOnId = plat.id;
        p.jumpsLeft = 2; // Restore double jump capability on landing
        p.isDoubleJumping = false;
        p.somersaultAngle = 0;

        // Jump Buffering: If jump was tapped just before landing, instantly jump!
        if (this.jumpBufferTimer > 0) {
          this.jumpBufferTimer = 0;
          p.vy = -PHYS.jumpV;
          p.grounded = false;
          p.jumpsLeft = 1;
          p.squashX = 0.82;
          p.squashY = 1.28;
          this.takeOff(false);
          sound.playJump();
          this.spawnJumpDust(p.x, p.y);
        } else {
          // Squash on landing: a hop settles lightly, a long drop flattens him more
          if (p.squashY > 0.9) {
            const hard = Math.max(0, Math.min(1, landV / PHYS.maxFall));
            p.squashX = 1.1 + 0.15 * hard;
            p.squashY = 0.9 - 0.17 * hard;
          }
          // the dust he kicks up as he lands (none for a step down that hardly falls)
          if (landV > 260) this.spawnJumpDust(p.x, p.y, landV);

          // Bouncy mushroom interaction
          if (plat.type === 'bouncy') this.bounceOff();

          // Fragile branch interaction
          if (plat.type === 'fragile') {
            if (plat.fragileTimer === undefined) {
              plat.fragileTimer = plat.crumbleAfter ?? 1.1; // generous 1.1s before breaking (ruin tiles set their own)
              // a boss's cracking ledge: Dot says so the first time he stands on one
              if (plat.crackFrom !== undefined && this.bossDef?.crackTip) this.bossCtx?.guide?.('crack', this.bossDef.crackTip);
              if (plat.crumbleAfter !== undefined && !this.zoneHinted.crumble) {
                this.zoneHinted.crumble = true;
                this.addFloatingText('IT CRUMBLES! KEEP MOVING', p.x, p.y - 80, '#fdba74');
              }
            }
          }
        }
      }

      // calm water (swim.ts): in deep enough, he swims; it never costs a life
      this.swimCheck(dt);

      // (Easy's soft falls: the last still ground he stood on)
      if (this.softOn && p.grounded && !p.climbing) {
        const g = this.platforms.find((q) => q.id === this.standingOnId);
        if (g && g.type === 'solid' && !g.broken && !g.push && !g.chase && g.width >= 60) this.softAt = { x: Math.max(g.x + 30, Math.min(g.x + g.width - 30, p.x)), y: g.y };
      }
      // Pits and water: falling below the surface costs a life (Mario-style)
      const waterY = this.currentStage.waterY;
      const river = this.currentStage.rivers?.find((r) => p.x > r.x0 && p.x < r.x1);
      // a teaching pool under the floor (waterTeach.ts, LV-8): a splash and back on the bank, no life
      const pool = waterY !== undefined && !river ? this.currentStage.safeWater?.find((s) => p.x > s.x0 && p.x < s.x1) : undefined;
      if (pool && p.y > waterY! + 20 && !this.isGameOver) {
        this.spawnWaterSplash(p.x, waterY!);
        sound.playWhoosh();
        this.addFloatingText('SPLASH!', p.x, waterY! - 40, '#7dd3fc');
        p.x = pool.backX;
        p.y = pool.backY;
        p.vx = 0;
        p.vy = 0;
        p.grounded = true;
        p.invincibleTimer = Math.max(p.invincibleTimer, 1);
      } else if (river?.safe && p.y > river.surfaceY + 8 && !this.isGameOver) {
        // a teaching river (2-1): a splash and back to the bank to try again, no life lost
        this.spawnWaterSplash(p.x, river.surfaceY);
        sound.playWhoosh();
        this.addFloatingText('SPLASH! TRY AGAIN', p.x, river.surfaceY - 40, '#7dd3fc');
        p.x = river.safe.backX;
        p.y = river.safe.backY;
        p.vx = 0;
        p.vy = 0;
        p.grounded = true;
        p.invincibleTimer = Math.max(p.invincibleTimer, 1);
        // a rising teaching river (2-8) goes back down for the next try
        if (river.flood) this.floodAt.delete(river);
      } else if (river && p.y > river.surfaceY + 8 && !this.isGameOver) {
        this.spawnWaterSplash(p.x, river.surfaceY);
        sound.playWhoosh();
        sound.playHitImpact(true);
        this.addFloatingText('SPLASH!', p.x, river.surfaceY - 40, '#7dd3fc');
        this.loseLife('water');
      } else if (waterY !== undefined && p.y > waterY + 20 && !this.isGameOver) {
        this.spawnWaterSplash(p.x, waterY);
        sound.playWhoosh();
        sound.playHitImpact(true);
        this.addFloatingText('SPLASH!', p.x, waterY - 40, '#7dd3fc');
        this.loseLife('water');
      } else if (p.y > this.currentStage.config.levelHeight + 120 && !this.isGameOver) {
        if (!this.softFall()) {
          sound.playPlayerHurt();
          this.loseLife('pit');
        }
      }

      // Checkpoints
      for (const cp of this.currentStage.checkpoints ?? []) {
        if (!cp.reached && Math.abs(p.x - cp.x) < 70 && p.y > cp.y - 150 && p.y < cp.y + 40) {
          cp.reached = true;
          recorder.event('checkpoint', Math.round(cp.x));
          // a flag touched while backtracking never replaces a later one (a tall climb goes up, a run goes right, a descent goes down)
          const further = this.currentStage.config.objectiveType === 'ascent' ? cp.y < this.checkpoint.y : this.proto?.w4?.descent ? cp.y > this.checkpoint.y : cp.x > this.checkpoint.x;
          if (further) this.checkpoint = { x: cp.x, y: cp.y };
          this.addFloatingText('CHECKPOINT!', cp.x, cp.y - 90, '#fde047');
          this.spawnSparkBurst(cp.x, cp.y - 40, '#fde047');
          sound.playCheckpoint();
          buzz('checkpoint');
        }
      }

    // --- Fragile Platform Decay ---
    for (const plat of this.platforms) {
      if (plat.type === 'fragile' && plat.fragileTimer !== undefined && plat.fragileTimer > 0) {
        plat.fragileTimer -= dt;
        if (plat.fragileTimer <= 0) {
          plat.broken = true;
          plat.regrowAt = this.gameTime + regrowDelay(plat.id);
          this.spawnDebrisBurst(plat.x + plat.width * 0.5, plat.y, '#a16207');
          sound.playHitImpact(true);
        }
      }
      // a crumbled platform is a penalty (regrow.ts): it comes back only after half a minute or so, and only off screen, so it never
      // pops back in view (no stage needs one: falling costs time, never the way on)
      if (plat.broken && plat.type === 'fragile' && plat.regrowAt !== undefined && this.gameTime >= plat.regrowAt) {
        const cam = this.camera;
        if (mayRegrow(plat, this.gameTime, { x: cam.x, y: cam.y, w: cam.viewportWidth, h: cam.viewportHeight }, p)) {
          plat.broken = false;
          plat.fragileTimer = undefined;
          plat.regrowAt = undefined;
          this.spawnSparkBurst(plat.x + plat.width * 0.5, plat.y - 6, '#86efac');
        }
      }
    }

    // --- Attacks: wind-up, strike, follow-through (see fight.ts) ---
    this.updateAttack(dt);
    this.resolveStomps(dt);
    this.watchForStuck();

    // --- Enemy Behavior & AI ---
    for (const e of this.enemies) {
      if (e.defeated) {
        this.updateKo(e, dt);
        continue;
      }

      if (e.hitFlashTimer > 0) e.hitFlashTimer -= dt;
      // a hit animal flinches, slides back and may stand dazed (no moves, no damage) for a moment
      if (this.reactToHits(e, dt)) continue;

      // Distinct enemy movement & attack policies:
      if (e.type === 'eagle') {
        // Harpy Eagle aerial trajectory & swoop attack cycle (fair, telegraphed, and easy to hit!)
        e.behaviorTimer += dt;
        if (!e.swoopPhase) e.swoopPhase = 'patrol';

        if (e.swoopPhase === 'patrol') {
          // Aerial patrol
          e.x += e.vx * dt;
          if (e.x < e.patrolMinX || e.x > e.patrolMaxX) {
            e.vx = Math.abs(e.vx) * (e.x < e.patrolMinX ? 1 : -1);
            e.facing = e.vx > 0 ? 1 : -1;
          }
          if (e.attackCooldown > 0) e.attackCooldown -= dt;

          // Spot player and initiate telegraphed swoop warning (never beyond its own patch of sky, never straight after a swoop)
          const home = (e.patrolMinX + e.patrolMaxX) / 2;
          if (e.attackCooldown <= 0 && Math.abs(e.x - p.x) < 260 && Math.abs(p.x - home) < (e.patrolMaxX - e.patrolMinX) / 2 + 300) {
            e.swoopPhase = 'telegraph';
            e.telegraphTimer = 0.8; // 0.8s clear visual/sound telegraph!
            sound.playEagleScreech();
            this.addFloatingText('!', e.x, e.y - 30, '#f59e0b');
          }
        } else if (e.swoopPhase === 'telegraph') {
          // Warning windup: eagle slows and flares wings
          e.telegraphTimer -= dt;
          e.facing = p.x > e.x ? 1 : -1;
          if (e.telegraphTimer <= 0) {
            e.swoopPhase = 'swoop';
            e.isAttacking = true;
            e.dive = undefined;
          }
        } else if (e.swoopPhase === 'swoop') {
          // A homing strafing run (harpyDive.ts): it follows the player's body, locks its line a beat before contact, then glides low
          if (!e.dive) e.dive = startDive(e, p);
          const prevX = e.x;
          const step = stepDive(e, e.dive, p, dt);
          e.facing = e.dive.vx >= 0 ? 1 : -1;
          void prevX;

          if (checkAABBCollision(...this.pBox(), e.x - 24, e.y - 18, 48, 36)) {
            if (p.ducking) {
              // Successfully ducked under swoop!
              sound.playWhoosh();
              e.swoopPhase = 'hover';
              e.hoverTimer = 1.4;
              e.isAttacking = false;
              e.dive = undefined;
            } else {
              this.damagePlayer(1, e.x - (e.dive?.vx ?? 0) * 0.1);
              e.swoopPhase = 'hover';
              e.hoverTimer = 1.0;
              e.isAttacking = false;
              e.dive = undefined;
            }
          } else if (step.done === 'passed') {
            // flew past: it settles into a low glide where it can be hit
            e.swoopPhase = 'hover';
            e.hoverTimer = 1.4;
            e.isAttacking = false;
            e.dive = undefined;
            this.addFloatingText('VULNERABLE!', e.x, e.y - 25, '#fde047');
          } else if (step.done === 'timeout') {
            // the player ran off: it gives up and climbs away
            e.swoopPhase = 'ascend';
            e.isAttacking = false;
            e.dive = undefined;
          }
        } else if (e.swoopPhase === 'hover') {
          // VULNERABLE LOW GLIDE: it faces Pokey and settles at his height, within reach of a punch or kick
          e.hoverTimer = (e.hoverTimer ?? 1.4) - dt;
          e.facing = stepGlide(e, p, dt);
          if (e.hoverTimer <= 0) {
            e.swoopPhase = 'ascend';
          }
        } else if (e.swoopPhase === 'ascend') {
          // Gently ascend back to sky patrol
          e.y -= 110 * dt;
          // glide back toward its post while climbing
          const post = (e.patrolMinX + e.patrolMaxX) / 2;
          const toward = post > e.x ? 1 : -1;
          e.x += toward * Math.min(70, Math.abs(post - e.x)) * dt * 2;
          e.facing = toward;
          if (e.y <= (e.homeY ?? 310)) {
            e.y = e.homeY ?? 310;
            e.swoopPhase = 'patrol';
            e.attackCooldown = 4.0;
            e.facing = e.vx > 0 ? 1 : -1;
          }
        }
      } else if (isPredator(e.type)) {
        // Ground animals (snake, ocelot, jaguar, boa, caiman, tayra, night harpy) each hunt in their own way (enemyBrain.ts), then
        // attack: telegraph -> committed attack -> vulnerable recovery
        // a snapper hears the puzzle kit's noise (noise.ts) and goes to it
        if (e.type === 'turtle') e.lureX = this.kit ? heard(this.kit.noises, e.x, e.y, this.gameTime)?.x : undefined;
        const slid = e.type === 'turtle' && !e.royal && e.state === 'slide';
        const step = stepPredator(e, { x: p.x, y: p.y, facing: p.facing, ducking: p.ducking }, dt);
        // a kicked snapper's shell that slides to a stop is out of the fight, and counts (2-5's goal): Dot says "Kick the shell!", and a
        // shell that did as she said came back dizzy, then walking, and the goal stayed at 0 (QA 2026-10-28: "predators 0/17")
        if (slid && e.state === 'dizzy') {
          e.hp = 0;
          this.knockOut(e, (e.slideDir ?? 1) as 1 | -1, 'BONK!');
          continue;
        }
        // the tree snake has no call of its own: it hisses like the boa
        // (the night harpy chitters and thumps like the tayra)
        const call = e.type === 'snake' ? 'boa' : e.type === 'harpy' ? 'tayra' : e.type === 'turtle' ? 'caiman' : e.type;
        if (e.type === 'snake') {
          // the painted/vector snake reads these two flags for its red warning ring and its strike cycle
          e.isAttacking = e.state === 'rear' || e.state === 'strike';
          e.telegraphTimer = e.state === 'rear' ? Math.max(0, 0.38 - (e.stateT ?? 0)) : 0;
        }
        if (step.ev.notice) this.addFloatingText('?', e.x, e.y - (e.type === 'boa' ? 46 : 34), '#fde047');
        if (step.ev.telegraph) {
          sound.playPredator(call, 0);
          this.addFloatingText('!', e.x, e.y - (e.type === 'boa' ? 46 : 34), '#f97316');
        }
        if (step.ev.launch) sound.playPredator(call, 1);
        if (step.ev.impact) {
          sound.playPredator(call, 2);
          if (e.type === 'jaguar' || e.type === 'caiman') {
            this.camera.trauma = Math.min(1.0, this.camera.trauma + 0.22);
          }
          // the harpy's stomp shakes the ground, and kicks up the cave dust
          if (e.type === 'harpy') {
            this.camera.trauma = Math.min(1.0, this.camera.trauma + 0.3);
            this.spawnDebrisBurst(e.x, e.y + 22, '#8b7fb0');
          }
          if (e.type === 'jaguar' || e.type === 'tayra') this.spawnDebrisBurst(e.x, e.y + 22, '#a16207');
        }
        if (this.debugBoxes) this.dbgHurt.push(...step.hurt);
        const shaken = this.gameTime < (this.harmlessUntil.get(e.id) ?? -1);
        for (const h of shaken ? [] : step.hurt) {
          if (checkAABBCollision(...this.pBox(), h.x, h.y, h.w, h.h)) {
            this.damagePlayer(1, e.x);
            break;
          }
        }
      } else if (e.type === 'spider') {
        // a spiderling waits, then rushes in short bursts with a pause between (the pause is the moment to stomp it)
        e.animTimer += dt;
        // World 5's spiders sleep, or crouch before they rush (w5Play.ts): held, it stands still and harmless this frame
        if (this.w5?.spiderHeld(e)) continue;
        const step = stepSpider(e, { x: p.x, y: p.y }, dt);
        if (step.ev.notice) this.addFloatingText('?', e.x, e.y - 30, '#fde047');
        // it ran onto a punch or kick already thrown at it: the blow wins, never a trade (QA v195: a heart lost on the frame he beat it)
        if (this.ranOntoBlow(e)) continue;
        for (const h of step.hurt) {
          if (checkAABBCollision(...this.pBox(), h.x, h.y, h.w, h.h)) {
            this.damagePlayer(1, e.x);
            break;
          }
        }
      } else if (e.type === 'frog') {
        // Poison frog hopping
        e.animTimer += dt;
        if (checkAABBCollision(...this.pBox(), e.x - 12, e.y - 10, 24, 20)) {
          this.damagePlayer(1, e.x);
        }
      }
    }

    // a kicked snapper shell slides along the bank and knocks over whatever it meets
    for (const s of this.enemies) {
      if (s.defeated || s.type !== 'turtle' || s.state !== 'slide') continue;
      for (const o of this.enemies) {
        if (o === s || o.defeated || o.type === 'eagle' || Math.abs(o.x - s.x) > 34 || Math.abs(o.y - s.y) > 30) continue;
        o.hp = 0;
        this.knockOut(o, (s.slideDir ?? 1) as 1 | -1, 'BOWLED OVER!');
      }
    }
    separateHunters(this.enemies, dt);
    for (const e of this.enemies) if (!e.defeated && isPredator(e.type)) keepOnLedge(e);

    // --- Boss fight ---
    if (this.boss && this.bossDef && !this.boss.defeated) this.updateBoss(dt);
    if (this.clangCd > 0) this.clangCd -= dt;
    if (this.slowTimer > 0) this.slowTimer -= dt;

    // --- Collectibles Magnet Attraction (when Nectar Magnet power-up is active) ---
    if (p.activePowerUp === 'magnet') {
      for (const c of this.collectibles) {
        if (c.collected || c.type === 'cage' || c.type === 'exit_totem' || c.type === 'thorn_gate' || c.type === 'find' || c.hidden) continue;
        // (a heart he cannot take yet is not dragged along after him)
        if (c.type === 'heart' && p.hp >= p.maxHp) continue;
        const dist = distance2D(p.x, p.y - 20, c.x, c.y);
        if (dist < 260 && dist > 10) {
          const pullSpeed = 460 * dt;
          c.x += ((p.x - c.x) / dist) * pullSpeed;
          c.y += ((p.y - 20 - c.y) / dist) * pullSpeed;
        }
      }
    }

    // the water warning on a stage with no hand-built hints (the old generator's: waterTeach.ts, LV-8), said as a stage hint is
    const wh = this.currentStage.waterHint;
    if (wh && !this.proto && !p.swim) {
      if (!wh.shown && p.x >= wh.x) {
        wh.shown = true;
        if (!tipHeard(this.currentStage.config.id, `tip:${wh.text}`)) {
          markTipHeard(this.currentStage.config.id, `tip:${wh.text}`);
          this.guide(wh.text, 3.6);
          this.passTips.push({ x: wh.passX, text: wh.text });
        }
      }
      for (let i = this.passTips.length - 1; i >= 0; i--) {
        const pt = this.passTips[i];
        if (p.x < pt.x || !p.grounded) continue;
        this.passTips.splice(i, 1);
        if (this.stageHint?.text === pt.text) this.stageHint = null;
        this.callbacks.onGuide?.(pt.text, 0, true);
      }
    }
    // the hand-built stage's one-time hints (protoStage.ts)
    if (this.proto) {
      // (a line that waits for his depth waits for him to stand down there: a fall into 4-7's mist, past the ledges below, used up
      // the lines meant for them)
      // (none while he swims in calm water: 6-7's warning about the dirty pit past the well came while he swam in the clean water, and
      // talked over his first-swim lines; it waits until he is out, still before the pit)
      // (several passed in one frame, as when a run starts from a later flag: only the last is said, and only it counts as heard, so a
      // line nobody saw is not lost for good)
      const due = p.swim ? [] : this.proto.hints.filter((h) => !(h.shown || p.x < h.x || (h.belowY !== undefined && (p.y < h.belowY || !p.grounded)) || (h.aboveY !== undefined && p.y > h.aboveY) || (h.beforeX !== undefined && p.x > h.beforeX)));
      for (const h of due) {
        h.shown = true;
        if (h !== due[due.length - 1]) continue;
        // said once per stage on this device: not again on a replay or a retry (tipMemory.ts)
        const id = `tip:${h.text}`;
        if (tipHeard(this.currentStage.config.id, id)) continue;
        // (a lesson line, once on this device whichever stage reaches it first: StageHint.firstOf)
        if (h.firstOf && tipHeard(FIRST_OF_STAGE, h.firstOf)) continue;
        markTipHeard(this.currentStage.config.id, id);
        if (h.firstOf) markTipHeard(FIRST_OF_STAGE, h.firstOf);
        const mode = lessonInputMode();
        const said = mode === 'pad' ? h.pad : mode === 'keys' ? h.keys : h.text;
        this.guide(said, 3.6);
        if (h.passX !== undefined) this.passTips.push({ x: h.passX, text: said });
      }
      // a move tip about one spot goes once he is on the ground past it, done or not (StageHint.passX)
      for (let i = this.passTips.length - 1; i >= 0; i--) {
        const pt = this.passTips[i];
        if (p.x < pt.x || !p.grounded) continue;
        this.passTips.splice(i, 1);
        if (this.stageHint?.text === pt.text) this.stageHint = null;
        this.callbacks.onGuide?.(pt.text, 0, true);
      }
    }

    // the watching eagle (1-7): calm, a screech, then its shadow sweeps the ground; seen in the open, it dives (watcher.ts)
    if (this.proto?.watch) this.updateWatch(dt);
    if (this.chase) this.updateChase(dt);
    if (this.tide) this.updateTide(dt);
    if (this.proto?.reveal) this.updateReveal(dt);
    if (this.ringDrops.length) this.stepDrops(dt);
    if (this.proto?.ring) this.updateRing(dt);

    // --- Collectibles Pickup & Objectives ---
    for (const c of this.collectibles) {
      if (c.collected) continue;
      // a petal in a shut orchid (World 5) waits for it to open
      if (this.w5?.shut(c)) continue;

      if (c.type === 'cage') {
        // Cage is freed when punched (handled in executePunchHitbox)
        continue;
      }

      if (c.type === 'exit_totem') {
        // Handled below after objective quota check to guarantee quota locking
        continue;
      }

      if (c.type === 'thorn_gate') {
        // the hidden gate: stepping into it leaves this stage for Thornbark's Hollow
        if (distance2D(p.x, p.y - 20, c.x, c.y) < 46 && !this.isGameOver) {
          c.collected = true;
          this.isGameOver = true;
          this.camera.trauma = 0.7;
          this.spawnSparkBurst(c.x, c.y, '#a78bfa');
          this.addFloatingText('THE THORN GATE OPENS...', c.x, c.y - 30, '#c4b5fd');
          sound.playBossRoar(this.currentStage.config.worldIndex);
          this.callbacks.onSecret?.();
        }
        continue;
      }

      if (c.type === 'find') {
        if (!c.hidden) {
          // a Keeper's Bell: just touch it
          if (distance2D(p.x, p.y - 20, c.x, c.y) < 40) this.collectFind(c);
          continue;
        }
        // a Hush Fern: crouch beside it for a moment and it gives something up; stand up and the search slowly fades
        const close = Math.abs(p.x - c.x) < 54 && Math.abs(p.y - (c.y + 26)) < 26 && p.grounded;
        c.near = close && !p.ducking;
        // the stage's opening line says one plant here looks different; beside it, the first time, Dot says what to do with it
        if (!close && !p.ducking && p.grounded && Math.abs(p.x - c.x) < 150 && Math.abs(p.y - (c.y + 26)) < 26) {
          const stageId = this.currentStage.config.id;
          if (!tipHeard(stageId, 'fern:near')) {
            markTipHeard(stageId, 'fern:near');
            const mode = lessonInputMode();
            this.guide(mode === 'screen' ? 'That fern looks different! Stand beside it and slide your thumb down to crouch and search it' : 'That fern looks different! Stand beside it and hold down to crouch and search it', 4.2);
          }
        }
        if (close && p.ducking) c.search = Math.min(1, (c.search ?? 0) + dt / FIND_SEARCH_SECONDS);
        else if ((c.search ?? 0) > 0) c.search = Math.max(0, (c.search ?? 0) - dt * 1.6);
        if ((c.search ?? 0) >= 1) this.collectFind(c);
        continue;
      }

      if (c.type === 'relic' && c.hidden) {
        // World 3: one of Grandma's things in a fern (Dot hid them very fast, because there were boots): crouch beside it, like a Hush Fern
        const close = Math.abs(p.x - c.x) < 64 && Math.abs(p.y - (c.y + 26)) < 26 && p.grounded;
        // (3-7's riddle fern says nothing when he is beside it: the stones in the light tell it)
        c.near = close && !p.ducking && !c.riddle;
        if (close && p.ducking) c.search = Math.min(1, (c.search ?? 0) + dt / FIND_SEARCH_SECONDS);
        else if ((c.search ?? 0) > 0) c.search = Math.max(0, (c.search ?? 0) - dt * 1.6);
        if ((c.search ?? 0) >= 1) {
          c.collected = true;
          p.relicsFound++;
          this.runScore += 500;
          sound.playRelicFound();
          this.spawnSparkBurst(c.x, c.y, '#fde68a');
          this.addFloatingText(`GRANDMA'S ${(c.thing ?? 'keepsake').toUpperCase()}!`, c.x, c.y - 40, '#fde68a', 2);
        }
        continue;
      }

      if (c.type === 'seed') {
        // a golden seed: a secret, saved on the device (protoStage.ts)
        if (distance2D(p.x, p.y - 20, c.x, c.y) < 38) {
          c.collected = true;
          const id = this.currentStage.config.id;
          const n = c.findId ?? 'seed';
          const again = seedFound(id, n);
          markSeedFound(id, n);
          const all = this.collectibles.filter((q) => q.type === 'seed');
          const got = all.filter((q) => seedFound(id, q.findId ?? 'seed')).length;
          this.runScore += again ? 200 : 1000;
          sound.playRelicFound();
          this.spawnSparkBurst(c.x, c.y, '#facc15');
          this.camera.trauma = Math.max(this.camera.trauma, 0.25);
          this.addFloatingText(again ? 'GOLDEN SEED (found before)' : `SECRET! GOLDEN SEED ${got} OF ${all.length}`, c.x, c.y - 34, '#facc15', 2.4);
        }
        continue;
      }

      const dist = distance2D(p.x, p.y - 20, c.x, c.y);
      // swinging, he cannot steer to a flower the way he can running, so the reach is wider (the control test: flowers along the
      // vines were the hardest thing to line up, 2026-10-23); and in World 5 an open orchid's cup gives up its petals to a hop that lands
      // anywhere in it (w5Play.ts inCup)
      if (dist < (p.isVineSwinging ? SWING_PICK : 34) || (this.w5 && !p.isVineSwinging && this.w5.inCup(c, p.x, p.y))) {
        // a heart is for when he is hurt: at full health it stays where it is, for later (the heart card says so)
        if (c.type === 'heart' && p.hp >= p.maxHp) {
          if (!this.zoneHinted.fullHeart) {
            this.zoneHinted.fullHeart = true;
            this.addFloatingText('FULL HEALTH! SAVE IT FOR LATER', c.x, c.y - 30, '#fda4af', 1.6);
          }
          continue;
        }
        c.collected = true;

        if (c.type === 'flower' || c.type === 'leaf' || c.type === 'fruit') {
          p.fruitsCollected++;
          this.comboCount++;
          this.comboResetTimer = 2.5;
          this.runScore += 100;

          if (c.type === 'flower') {
            sound.playFlowerPickup(this.comboCount);
          } else {
            sound.playLeafPickup();
          }

          const pColor = c.type === 'flower' ? '#f43f5e' : '#4ade80';
          this.spawnSparkBurst(c.x, c.y, pColor);
          // named for what is drawn (vectorArt.ts pickupName), not the variant the drawing never used
          const cfg = this.currentStage.config;
          const txt = `+100 ${pickupName(c, cfg.worldIndex, cfg.miniIndex)}!`;
          this.addFloatingText(txt, c.x, c.y - 20, pColor);

          if (this.comboCount > 1) {
            const comboBonus = this.comboCount * 50;
            this.runScore += comboBonus;
            this.addFloatingText(`${this.comboCount}x COMBO! +${comboBonus}`, c.x, c.y - 42, '#facc15');
          }
        } else if (c.type === 'relic') {
          p.relicsFound++;
          this.runScore += 500;
          sound.playRelicFound();
          this.spawnSparkBurst(c.x, c.y, '#38bdf8');
          this.addFloatingText('JUNGLE IDOL! +500', c.x, c.y - 30, '#38bdf8');
        } else if (c.type === 'heart') {
          p.hp = Math.min(p.maxHp, p.hp + 1);
          sound.playHeartPickup();
          this.spawnSparkBurst(c.x, c.y, '#f43f5e');
          this.addFloatingText('+1 HP RESTORED', c.x, c.y - 20, '#f43f5e');
        } else if (c.type === 'super_heart') {
          p.hp = p.maxHp;
          p.invincibleTimer = 3.5;
          sound.playSuperHeart();
          this.spawnSparkBurst(c.x, c.y, '#facc15');
          this.addFloatingText('MAX HP RESTORED + SHIELD!', c.x, c.y - 30, '#facc15');
        } else if (c.type === 'powerup_speed') {
          p.activePowerUp = 'speed';
          p.powerUpTimer = 10.0;
          p.maxPowerUpTimer = 10.0;
          sound.playPowerUp('speed');
          this.spawnSparkBurst(c.x, c.y, '#34d399');
          this.addFloatingText('⚡ CHEETAH SPEED (10s)!', c.x, c.y - 35, '#34d399');
        } else if (c.type === 'powerup_invincible') {
          p.activePowerUp = 'invincible';
          p.powerUpTimer = 8.0;
          p.maxPowerUpTimer = 8.0;
          sound.playPowerUp('invincible');
          this.spawnSparkBurst(c.x, c.y, '#facc15');
          this.addFloatingText('⭐ SOLAR INVINCIBLE (8s)!', c.x, c.y - 35, '#facc15');
        } else if (c.type === 'powerup_magnet') {
          p.activePowerUp = 'magnet';
          p.powerUpTimer = 12.0;
          p.maxPowerUpTimer = 12.0;
          sound.playPowerUp('magnet');
          this.spawnSparkBurst(c.x, c.y, '#38bdf8');
          this.addFloatingText('🧲 NECTAR MAGNET (12s)!', c.x, c.y - 35, '#38bdf8');
        }
      }
    }

    // Meeca's stage: the line carries her, the column marches, the guards look back, and she carves
    if (this.mc) {
      this.mc.after();
      this.mc.step(dt);
      if (this.mc.cinematic !== this.mcCinematic) {
        this.mcCinematic = this.mc.cinematic;
        this.callbacks.onCinematic?.(this.mc.cinematic);
      }
    }

    // --- Check Objective Completion ---
    let currentProgress = 0;
    const objType = this.currentStage.config.objectiveType;

    switch (objType) {
      case 'harvest':
        currentProgress = p.fruitsCollected;
        break;
      case 'purge':
        currentProgress = p.enemiesDefeated;
        break;
      case 'relic_hunt':
        currentProgress = p.relicsFound;
        break;
      case 'rescue':
        currentProgress = p.crittersRescued;
        break;
      case 'gauntlet':
        currentProgress = p.enemiesDefeated;
        break;
      default:
        currentProgress = this.exitTotemReached ? 1 : 0;
    }
    // (Meeca's stage counts her warnings: "M. 1/5")
    if (this.mc) currentProgress = this.mc.count;

    const isQuotaType =
      objType === 'harvest' ||
      objType === 'purge' ||
      objType === 'relic_hunt' ||
      objType === 'rescue' ||
      objType === 'gauntlet';

    const quotaMet = currentProgress >= this.currentStage.config.targetCount;
    const isExitUnlocked = !isQuotaType || quotaMet;

    // Trigger celebration announcement once quota is fulfilled!
    if (isQuotaType && quotaMet && !this.wasQuotaMet) {
      this.wasQuotaMet = true;
      sound.playShrineUnlocked();
      this.spawnSparkBurst(p.x, p.y - 40, '#facc15');
      this.addFloatingText('✨ SHRINE UNSEALED! ENTER TO CLEAR! ✨', p.x, p.y - 65, '#facc15');
      this.camera.trauma = Math.min(1.0, this.camera.trauma + 0.25);
    }

    // the goal, said plainly (Matt, 2026-10-23: players did not know why the sanctuary stayed shut): once at the start, and once more
    // when he is most of the way along and still well short, so nobody reaches a sealed door by surprise
    if (isQuotaType && !quotaMet) {
      const need = this.currentStage.config.targetCount - currentProgress;
      const along = p.x / Math.max(1, this.currentStage.exitTotemX);
      if (!this.goalSaid.start && this.gameTime > 0.3 && !this.stageHint) {
        this.goalSaid.start = true;
        // the first time this stage is played on this device only (the yellow counter says it after that)
        const gid = `goal:${this.currentStage.config.targetCount}`;
        if (!tipHeard(this.currentStage.config.id, gid)) {
          // (the HUD's stage-start goal card says it, so Dot does not: hud/GoalCard.tsx)
          markTipHeard(this.currentStage.config.id, gid);
        }
      } else if (this.goalSaid.start && !this.goalSaid.late && along > 0.7 && need > this.currentStage.config.targetCount * 0.25 && !this.stageHint) {
        this.goalSaid.late = true;
        const line = goalLine('late', this.currentStage.config.worldIndex, objType, need);
        if (line) this.guide(line, 4);
      }
    }

    // Update Exit Totem locked visual in collectibles list
    const exitItem = this.collectibles.find((c) => c.type === 'exit_totem');
    if (exitItem) {
      exitItem.isLocked = !isExitUnlocked;
      // a sealed door shows how many are still missing
      exitItem.missing = isQuotaType ? Math.max(0, this.currentStage.config.targetCount - currentProgress) : undefined;
    }

    if (this.barrierMsgCooldown > 0) this.barrierMsgCooldown -= dt;
    // Interactive Exit Totem / Sacred Portal Encounter
    if (!this.exitTotemReached && this.currentStage.exitTotemX > 0) {
      // the door only counts when his body is really at it (rules.atExitDoor): level with it on the screen, past it, or
      // on another floor does not win. A sealed door stops him at its near side.
      const doorX = this.currentStage.exitTotemX;
      const doorY = this.currentStage.exitTotemY;
      if (isExitUnlocked ? atExitDoor(p, doorX, doorY) : atSealedDoor(p, doorX, doorY)) {
        if (isExitUnlocked) {
          this.exitTotemReached = true;
          // (a short chime here; the full victory sting plays when the Stage Cleared card lands, StatusModals.tsx, SN-5)
          sound.playExitChime();
          buzz('clear');
          this.spawnSparkBurst(this.currentStage.exitTotemX, p.y - 30, '#34d399');
          this.addFloatingText('SANCTUARY UNLOCKED! VICTORY!', p.x, p.y - 60, '#34d399');
        } else {
          // Push player back gently from sealed barrier and show clear reminder
          p.x = this.currentStage.exitTotemX - 35;
          p.vx = -140;
          if (this.barrierMsgCooldown <= 0) {
          this.barrierMsgCooldown = 1.2;
          const remaining = this.currentStage.config.targetCount - currentProgress;
          // the same word the counter at the top uses, so the two always agree
          const line = goalLine('sealed', this.currentStage.config.worldIndex, objType, remaining);
          // in the banner the stage hints use (the small red floating text was hard to read on the bright doorway)
          if (!this.stageHint) this.guide(line || 'Finish the goal to open the sanctuary', 3);
          }
        }
      }
    }

    const bossDefeated = this.boss ? this.boss.defeated : false;
    const isWin = isObjectiveComplete(
      objType,
      currentProgress,
      this.currentStage.config.targetCount,
      this.exitTotemReached,
      bossDefeated
    );

    // with the new clips on (heroClips.ts, test), reaching the exit plays his cheer before the stage clears
    let cheering = false;
    if (isWin && !this.isGameOver && this.exitTotemReached && heroClipsEnabled() && hasClip('cheer')) {
      if (p.cheerAt === undefined) {
        p.cheerAt = this.gameTime;
        this.cheerX = p.x;
      }
      if (this.gameTime - p.cheerAt < CHEER_SECONDS) {
        cheering = true;
        p.vx = 0;
        if (p.grounded) p.x = this.cheerX; // he stays at the door while he cheers
      }
    }
    if (isWin && !this.isGameOver && !cheering) {
      this.isGameOver = true;
      const stars = calculateLevelStars(
        (p.cheerAt ?? this.gameTime),
        this.currentStage.config.timeLimit,
        p.hp / p.maxHp,
        objType === 'boss_lair' ? (bossDefeated ? 1 : 0) : currentProgress / Math.max(1, this.currentStage.config.targetCount),
        this.statLivesLost
      );

      this.callbacks.onStageStats?.(this.buildStats(true, stars));
      // a find still waiting for a safe moment is handed over now, so it is never lost
      for (const fid of this.findsWaiting.splice(0)) this.callbacks.onFind?.(fid);
      recorder.event('finish', Math.round(p.cheerAt ?? this.gameTime));
      this.callbacks.onVictory(stars, Math.round(p.cheerAt ?? this.gameTime), this.runScore);
    }

    // --- Particle System Update ---
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.life -= dt;
      if (pt.life <= 0) {
        // (order does not matter: the last one takes its place, and the spent one goes back to the pool)
        const last = this.particles.pop()!;
        if (last !== pt) this.particles[i] = last;
        this.particlePool.push(pt);
        continue;
      }
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      if (pt.type === 'puff' || pt.type === 'flash' || pt.type === 'splash') {
        // the painted puffs drift out and slow; they do not fall
        pt.vx *= Math.max(0, 1 - dt * 5);
        pt.vy *= Math.max(0, 1 - dt * 5);
      } else if (pt.type === 'leaf' || pt.type === 'feather') {
        // (leaves and feathers catch the air: they slow, and drift down gently)
        pt.vx *= Math.max(0, 1 - dt * 2.2);
        pt.vy = Math.min(pt.vy + 300 * dt, 70);
      } else pt.vy += 300 * dt; // gravity
    }

    if (this.stageHint && (this.stageHint.life -= dt) <= 0) this.stageHint = null;
    // --- Floating Texts Update ---
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life -= dt;
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
        continue;
      }
      ft.y -= 35 * dt;
    }

    // --- Camera Tracking ---
    this.bossFrame(dt);
    if (this.mc) {
      // the ending comes in close on the two of them
      const z = this.mc.zoomWant();
      if (Math.abs(z - this.bossZoom) > 0.002) {
        this.bossZoom = z;
        this.applyZoom();
      }
    }
    this.updateCamera(dt);
    this.mc?.camera(this.camera, dt);

    // Calculate progress ratio across the level (a climbing stage counts how high he has got, not how far along: its door is at the top)
    let distanceRatio: number;
    if (objType === 'ascent') {
      this.bestClimbY = Math.min(this.bestClimbY, p.y);
      distanceRatio = ascentProgress(this.currentStage.spawnY, this.currentStage.exitTotemY, this.bestClimbY);
    } else if (this.proto?.w4?.descent) {
      // down the cliff, back and forth (4-7): how far down he has got (left or right says nothing about how far on he is)
      this.bestDropY = Math.max(this.bestDropY, p.grounded ? p.y : -Infinity);
      const span = Math.max(1, this.currentStage.exitTotemY - this.currentStage.spawnY);
      distanceRatio = Math.max(0, Math.min(1, (this.bestDropY - this.currentStage.spawnY) / span));
    } else if (this.mc) {
      distanceRatio = this.mc.ratio();
    } else {
      const totalDist = Math.max(1, (this.currentStage.exitTotemX || this.currentStage.config.levelWidth) - 140);
      const distTraveled = Math.max(0, p.x - 140);
      distanceRatio = Math.min(1.0, distTraveled / totalDist);
    }

    // Notify HUD
    this.callbacks.onProgressUpdate(
      currentProgress,
      this.currentStage.config.targetCount,
      this.runScore,
      p.hp,
      distanceRatio,
      p.activePowerUp,
      p.powerUpTimer
    );

    this.updateSound(dt, groundedBefore, vyBefore, distanceRatio);
    this.markWayDodge(dt);
  }

  /** Dot's lines dodge Pokey: true while the banner has moved to the bottom of the screen (see markWayDodge) */
  private wayLow = false;
  /** how many hits the guardian takes in this fight (its own count, or Easy's fewer) */
  private bossHits: number | undefined;
  private wayClearT = 0;
  /**
   * Dot's banner (Wayside.tsx) sits in a band across the upper middle of the screen, which on a phone held sideways is where Pokey
   * often is (on a liana, up a tree, on a high shelf). While any part of him is in that band, the banner moves to the bottom of the
   * screen; it comes back once he has been clear of the band for a moment, so it does not flick back and forth.
   * (`?waydodge=0` turns it off, to compare)
   */
  private markWayDodge(dt: number) {
    if (!wayDodgeOn() || typeof document === 'undefined') return;
    const p = this.player;
    const w = this.viewCssW, h = this.viewCssH;
    if (!w || !h) return;
    const boss = this.markWayBoss(w, h);
    // the banner's slot (index.css .way): its top, and about two lines of height below it
    const slot = boss ? 64 : w <= 520 ? 132 : h <= 430 ? 110 : 96;
    const bandTop = slot - 12, bandBot = slot + 88;
    // (Dot is smaller than Pokey: her own body and the note under her. Upright, her nectar panel is at the bottom of the screen and
    // her camera keeps her well below the banner, so there the banner never moves down over the panel: QA, 2026-10-25)
    const dot = this.dotRun;
    const head = ((dot ? dot.fl.y - 34 : p.y - 125) - this.camera.y) * this.zoom;
    const feet = ((dot ? dot.fl.y + 40 : p.y + 10) - this.camera.y) * this.zoom;
    const under = feet > bandTop && head < bandBot && !(dot && h > w);
    if (under) {
      this.wayClearT = 0;
      if (!this.wayLow) {
        this.wayLow = true;
        document.documentElement.dataset.wayLow = '1';
      }
    } else if (this.wayLow) {
      this.wayClearT += dt;
      if (this.wayClearT > 0.8) {
        this.wayLow = false;
        delete document.documentElement.dataset.wayLow;
      }
    }
  }

  /**
   * A boss fight: Dot's banner keeps off the boss plate and off the boss herself (her weak spot shows on her body). Upright it sits at
   * the bottom (under the arena floor); held sideways it sits under the plate, narrow, on the half of the screen away from the boss
   * (index.css :root[data-way-boss]). Returns whether a fight is on.
   */
  private markWayBoss(w: number, h: number): boolean {
    const root = document.documentElement.dataset;
    const b = this.boss && !this.boss.defeated ? this.boss : null;
    if (!b) {
      if (root.wayBoss) delete root.wayBoss;
      return false;
    }
    const r = hurtRect(b);
    const sx = (r.x + r.w / 2 - this.camera.x) * this.zoom;
    let side = root.wayBoss;
    if (h > w) side = 'low';
    else if (side !== 'l' && side !== 'r') side = sx > w / 2 ? 'l' : 'r';
    // (it changes sides only once she is well over on its half, so it does not flick to and fro while she hovers in the middle)
    else if (side === 'l' && sx < w * 0.38) side = 'r';
    else if (side === 'r' && sx > w * 0.62) side = 'l';
    if (root.wayBoss !== side) root.wayBoss = side;
    return true;
  }

  /** landings, footsteps and the music's intensity (calm while exploring, fuller near danger) */
  private soundTimer = 0;
  private stepDist = 0;
  private updateSound(dt: number, groundedBefore: boolean, vyBefore: number, progress: number) {
    const p = this.player;
    // the stage is over (game over / victory screen up): no heartbeat, and the screen's own music intensity stands
    if (this.isGameOver) {
      sound.setLowHealth(false);
      return;
    }
    if (p.grounded && !groundedBefore && vyBefore > 140 && !p.climbing && !p.isVineSwinging) {
      sound.playLand(Math.min(1, vyBefore / 700));
      // (a hard landing buzzes: AN-9)
      if (vyBefore > HARD_LAND_VY) buzz('hardLand');
    }
    // footsteps: one leaf-crunch every few body-lengths on the ground
    if (p.grounded && !p.climbing && Math.abs(p.vx) > 25) {
      this.stepDist += Math.abs(p.vx) * dt;
      if (this.stepDist > 52) {
        this.stepDist = 0;
        sound.playStep();
      }
    } else if (!p.grounded) {
      this.stepDist = 26;
    }

    this.soundTimer -= dt;
    if (this.soundTimer > 0) return;
    this.soundTimer = 0.25;
    let v = 0.3 + 0.25 * progress;
    let near = 9999;
    for (const e of this.enemies) {
      if (e.defeated) continue;
      const d = Math.hypot(e.x - p.x, (e.y - p.y) * 0.6);
      if (d < near) near = d;
    }
    if (near < 460) v += 0.32 * (1 - near / 460);
    if (this.boss && !this.boss.defeated) {
      const b = this.boss;
      v = 0.55 + 0.4 * (1 - Math.max(0, b.hp) / Math.max(1, b.maxHp)) + (b.telegraphTimer > 0 ? 0.08 : 0);
    }
    if (p.activePowerUp === 'invincible' || p.activePowerUp === 'speed') v = Math.max(v, 0.95);
    sound.setIntensity(Math.min(1, v));
    sound.setLowHealth(this.lives <= 1 && p.hp <= 1);
  }

  // ===========================================================================================
  // The boss fight (rules live in bossAI.ts and bossDefs.ts; this is the part that touches the world)
  // ===========================================================================================

  /** what the boss may ask of the world this tick */
  private bossContext(): BossCtx {
    const p = this.player;
    const arena = this.currentStage.arena ?? { left: 0, right: this.currentStage.config.levelWidth, floor: 560 };
    if (!this.bossCtx) {
      const world = this.currentStage.config.worldIndex;
      this.bossCtx = {
        px: p.x,
        py: p.y,
        pGrounded: p.grounded,
        pDucking: p.ducking,
        arena,
        rnd: Math.random,
        hazards: this.hazards,
        minionsAlive: 0,
        spawnMinion: (kind, x, y) => this.spawnMinion(kind, x, y),
        shake: (a) => {
          this.camera.trauma = Math.min(1, Math.max(this.camera.trauma, a));
          // (a slam that shakes the arena hard buzzes: AN-9)
          if (a >= 0.5) buzz('bossSlam');
        },
        roar: () => sound.playBossRoar(world),
        thud: (heavy) => sound.playHitImpact(heavy ?? true, bossMaterial(world)),
        debris: (x, y, color) => this.spawnDebrisBurst(x, y, color),
        text: (msg, x, y, color) => this.addFloatingText(msg, x, y, color),
        dropMinion: (kind, x) => {
          const a = this.currentStage.arena;
          if (!a) return;
          const id = 9000 + this.minionSeq++;
          const e = {
            id, type: kind, x, y: a.floor - 14, vx: 28, vy: 0, width: 38, height: 22, hp: 1, maxHp: 1, facing: x > this.player.x ? -1 : 1,
            patrolMinX: Math.max(a.left + 30, x - 160), patrolMaxX: Math.min(a.right - 30, x + 160), attackCooldown: 0.9, telegraphTimer: 0,
            isAttacking: false, animTimer: 0, hitFlashTimer: 0, defeated: false, koTimer: 0, behaviorTimer: 0,
          } as Enemy;
          this.ringDrops.push({ e, t: 0, delay: this.ringDrops.length * 0.3 });
          sound.playWhoosh();
        },
        tellMul: isEasy() ? 1.3 : 1,
        openMul: isEasy() && this.bossDef?.openCue ? EASY_OPEN_MUL : 1,
        dropHeart: (x) => {
          const a = this.currentStage.arena;
          if (!a) return;
          this.collectibles.push({ id: 80000 + this.minionSeq++, type: 'heart', x, y: a.floor - 40, collected: false, bobPhase: 0 });
          this.spawnSparkBurst(x, a.floor - 60, '#fda4af');
        },
        onPillar: (pl, broke) => this.pillarSlammed(pl, broke),
        guide: (key, line) => {
          const id = this.currentStage.config.id;
          if (tipHeard(id, 'boss:' + key)) return false;
          markTipHeard(id, 'boss:' + key);
          this.guide(line, 3.6);
          this.bossGuideUp = true;
          this.bossGuideIn = this.boss?.ai?.state ?? '';
          return true;
        },
        crackPerches: (phase) => {
          for (const pl of this.platforms) {
            if (pl.crackFrom === undefined || pl.crackFrom > phase || pl.type === 'fragile') continue;
            pl.type = 'fragile';
            pl.crumbleAfter = 2.0;
            this.spawnDebrisBurst(pl.x + pl.width / 2, pl.y + 4, '#a16207');
          }
        },
      };
    }
    const c = this.bossCtx;
    c.pillars = this.skyPillars ?? undefined;
    c.px = p.x;
    c.py = p.y;
    c.pGrounded = p.grounded;
    c.pDucking = p.ducking;
    c.arena = arena;
    let alive = 0;
    for (const e of this.enemies) if (e.id >= 9000 && !e.defeated) alive++;
    c.minionsAlive = alive;
    return c;
  }

  /** 4-10: her dive or swoop hit a rock pillar. It shakes and cracks; the slam that breaks it knocks its top off and leaves a stump */
  private pillarSlammed(pl: SkyPillar, broke: boolean) {
    const i = this.skyPillars?.indexOf(pl) ?? -1;
    const plat = this.platforms.find((q) => q.pillar === i);
    if (!plat) return;
    const floor = plat.y + plat.height;
    for (let k = 0; k < (broke ? 5 : 2); k++) this.spawnDebrisBurst(pl.x + (Math.random() - 0.5) * pl.w, plat.y + Math.random() * plat.height, '#a8a29e');
    if (broke) {
      plat.y = floor - PILLAR.stump;
      plat.height = PILLAR.stump;
      sound.playHitImpact(true, 'armor');
      this.camera.trauma = Math.max(this.camera.trauma, 0.8);
    }
  }

  /**
   * 4-10: what the Sky Sovereign's screech and gust do to him (sovereignFight.ts), and her feathers stopping on the rocks. A screech's front
   * shoves him once as it passes (not behind a rock; crouched, much less); the gust pushes him while it blows (the leaf rides it).
   */
  private stepSkyFight(b: BossEntity, c: BossCtx, dt: number) {
    const p = this.player;
    const floor = c.arena.floor;
    const ps = this.skyPillars ?? [];
    this.bossShove = fadeShove(this.bossShove, dt);
    let gust = 0;
    const bodyTop = playerHurtRect(p).y;
    const free = !p.climbing && !p.isVineSwinging && !p.hanging;
    for (const h of this.hazards) {
      if (h.kind !== 'push') continue;
      const src = h.src ?? h.x;
      const dir: 1 | -1 = h.dir >= 0 ? 1 : -1;
      if (h.look === 'screech') {
        if (h.shoved || (p.x - src) * dir < 0 || (h.x - p.x) * dir < 0) continue;
        h.shoved = true;
        const v = free ? screechShove({ ps, srcX: src, dir, px: p.x, bodyTop, floor, ducking: p.ducking, grounded: p.grounded }) : 0;
        if (v !== 0) {
          this.bossShove = v;
          this.camera.trauma = Math.min(1, Math.max(this.camera.trauma, 0.35));
          this.addFloatingText(p.ducking && p.grounded ? 'HOLD ON!' : 'BLOWN BACK!', p.x, p.y - 80, '#bae6fd');
        } else if (free) this.addFloatingText('SAFE BEHIND THE ROCK!', p.x, p.y - 80, '#bbf7d0');
      } else if (h.look === 'gust' && free) {
        gust = gustPush({ ps, srcX: src, dir, phase: b.phase, px: p.x, bodyTop, floor, grounded: p.grounded, gliding: this.glide.on });
      }
    }
    this.bossGust = gust;
    // the chimes ring while she winds up her wingbeats (sovereignArt.ts swings them)
    const br = b.ai;
    if (br?.move === 'wingGust' && br.state === 'tell') {
      this.chimeT -= dt;
      if (this.chimeT <= 0) {
        this.chimeT = 0.32;
        sound.playVineGrab();
      }
    } else this.chimeT = 0;
    // her feathers do not go through rock
    for (const h of this.hazards) {
      if (h.kind !== 'bolt' || h.life <= 0) continue;
      for (const pl of ps) {
        if (Math.abs(h.x - pl.x) < pl.w / 2 + h.w / 2 && h.y > floor - pl.h - h.h / 2) {
          h.life = 0;
          this.spawnSparkBurst(h.x, h.y, '#fde68a');
          break;
        }
      }
    }
  }

  /** a summoned animal joins the fight */
  private spawnMinion(kind: 'spider' | 'snake' | 'ocelot' | 'frog' | 'eagle' | 'tayra', x: number, y: number) {
    const arena = this.currentStage.arena;
    if (!arena) return;
    const f = arena.floor;
    const id = 9000 + this.minionSeq++;
    const mk = (w: number, h: number, hp: number, oy: number, vx: number): Enemy => ({
      id, type: kind, x, y: f - oy, vx, vy: 0, width: w, height: h, hp, maxHp: hp, facing: vx >= 0 ? 1 : -1,
      patrolMinX: arena.left + 30, patrolMaxX: arena.right - 30, attackCooldown: 1.2, telegraphTimer: 0, isAttacking: false,
      animTimer: 0, hitFlashTimer: 0, defeated: false, koTimer: 0, behaviorTimer: 0,
    });
    let e: Enemy;
    if (kind === 'ocelot') e = mk(48, 28, 2, 18, x < (arena.left + arena.right) / 2 ? 55 : -55);
    else if (kind === 'tayra') e = mk(46, 26, 1, 15, 70);
    else if (kind === 'spider') {
      e = mk(34, 22, 1, 12, 0);
      (e as unknown as { noThread: boolean }).noThread = true;
    } else e = mk(38, 22, 1, 14, 30);
    e.x = Math.max(arena.left + 30, Math.min(arena.right - 30, x));
    this.enemies.push(e);
    this.spawnDebrisBurst(e.x, f - 10, '#e5e7eb');
  }

  /**
   * A boss with its own lair makes an entrance (see bossEntrance.ts): everything else holds still while the screen goes dark,
   * the eyes open, the boss is revealed, roars and its name lands. Returns true while it plays.
   */
  private stepEntrance(dt: number): boolean {
    const b = this.boss;
    const def = this.bossDef;
    if (!b || !def?.lair || b.defeated || !b.ai) return false;
    if (!this.entrance) {
      if (this.entranceDone) return false;
      const total = takeEntranceLength(this.currentStage.config.id);
      const tea = def.entrance?.tea && total >= ENTRANCE_LONG ? { home: b.x } : null;
      this.entrance = { t: 0, total, roared: false, named: false, tea };
      this.bossIntro = true; // the usual first roar is part of the entrance instead
      b.ai.alpha = 0;
      this.reportBoss();
    }
    const en = this.entrance;
    en.t += dt;
    const beat = entranceBeat(en.t, en.total, !!en.tea);
    b.ai.alpha = beat.reveal;
    b.ai.intro = beat.u;
    if (en.tea && this.currentStage.arena) {
      // her tea: at the painted table (facing it from its right, so the pot she holds is over it) until she has roared, then she
      // skitters back, still facing the sloth, to where the fight starts her
      const a = this.currentStage.arena;
      const view = { x: this.camera.x, y: this.camera.y, vw: this.camera.viewportWidth, vh: this.camera.viewportHeight };
      const home = this.teaHome();
      const at = Math.min(en.tea.home, queenTeaTableX(view, a) + TEA_STAND);
      const back = Math.max(0, Math.min(1, (beat.u - 0.7) / 0.22));
      b.x = at + (home - at) * back * back * (3 - 2 * back);
      b.facing = -1;
    }
    const world = this.currentStage.config.worldIndex;
    if (beat.roaring && !en.roared) {
      en.roared = true;
      sound.playBossRoar(world);
      this.camera.trauma = Math.max(this.camera.trauma, 0.85);
    }
    if (beat.nameAlpha > 0.5 && beat.nameIn < 0.06 && !en.named) {
      en.named = true;
      sound.playHitImpact(true, bossMaterial(world));
      this.camera.trauma = Math.max(this.camera.trauma, 0.5);
    }
    // a low rumble while it is revealed
    if (beat.reveal > 0.02 && beat.reveal < 0.98) this.camera.trauma = Math.max(this.camera.trauma, 0.22);
    this.camera.trauma = Math.max(0, this.camera.trauma - dt * 1.6);
    this.bossFrame(dt);
    this.updateCamera(dt);
    // Dot says the fight's opening tip during the entrance, before the boss wakes, so her bubble is gone by the time it moves (QA
    // v189, 1-10 upright: it filled the arena for 10-21 s of the fight)
    if (en.t >= en.total * 0.45) {
      const start = def.guide?.start;
      if (start && !tipHeard(this.currentStage.config.id, 'boss:start')) {
        markTipHeard(this.currentStage.config.id, 'boss:start');
        this.guide(start, 5);
      }
    }
    if (en.t >= en.total) {
      if (en.tea) b.x = this.teaHome();
      this.entrance = null;
      this.entranceDone = true;
      b.ai.intro = undefined;
      const start = def.guide?.start;
      if (start && !tipHeard(this.currentStage.config.id, 'boss:start')) {
        markTipHeard(this.currentStage.config.id, 'boss:start');
        this.guide(start, 5);
      }
      b.ai.alpha = 1;
      b.ai.state = 'roar';
      b.ai.t = 0;
      b.ai.hold = 0.35;
      b.ai.roarReason = 'enter';
      this.reportBoss();
    }
    return true;
  }

  private updateBoss(dt: number) {
    const b = this.boss!;
    const def = this.bossDef!;
    const br = b.ai;
    if (!br) return;
    const p = this.player;
    const c = this.bossContext();
    const world = this.currentStage.config.worldIndex;
    if (b.hitFlashTimer > 0) b.hitFlashTimer -= dt;
    b.behaviorTimer += dt;

    if (!this.bossIntro) {
      this.bossIntro = true;
      sound.playBossRoar(world);
      this.camera.trauma = Math.max(this.camera.trauma, 0.5);
    }

    if (br.state === 'dying') {
      this.stepBossDeath(b, def, dt);
      return;
    }

    const prevPhase = b.phase;
    const prevState = br.state;
    const wasOpen = weakOpen(b, def);
    const guideWas = this.bossGuideUp;
    const guideN = this.guideN;
    stepBoss(b, def, c, dt);
    // Dot's fight line belongs to the moment it was said: when a new move begins (or a life is lost) it goes, so "get her head" never
    // hangs over the next attack
    if (guideWas && this.bossGuideUp && br.state === 'tell' && prevState !== 'tell' && this.guideN === guideN) this.clearGuide();
    // (a warning said in a wind-up goes when that attack is over: "stay down" is not left up once the sweep has passed)
    else if (guideWas && this.bossGuideUp && this.bossGuideIn === 'tell' && prevState === 'act' && br.state !== 'act' && this.guideN === guideN) this.clearGuide();
    // the opening begins: a chime, and for a giant with a glowing spot a NOW! over it (a crash already says DIZZY!, CAUGHT! ...), so the
    // moment is heard and seen wherever the eye is
    if (def.openCue && !wasOpen && weakOpen(b, def) && b.phase === prevPhase) {
      sound.playCheckpoint();
      // (Venom's head is placed by weakAt: it gets its NOW! too)
      const wr = def.weak || def.weakAt ? weakRect(b, def, c.arena.floor) : null;
      if (wr && br.state === 'rec') this.addFloatingText('NOW!', wr.x + wr.w / 2, wr.y - 18, '#fde047');
    }

    if (b.phase !== prevPhase) {
      def.onPhase?.(b.phase, b, c);
      sound.playBossRoar(this.currentStage.config.worldIndex);
      const line = def.guide?.[b.phase as 2 | 3];
      if (line) {
        const id = this.currentStage.config.id;
        if (!tipHeard(id, 'boss:' + b.phase)) {
          markTipHeard(id, 'boss:' + b.phase);
          this.guide(line, 4);
        }
        sound.setTempo(b.phase === 3 ? 1.08 : 1.04);
      } else if (b.phase === 3) {
        sound.setTempo(1.08);
        this.addFloatingText('PHASE 3: ENRAGED!', b.x, b.y - b.height, '#ef4444');
      } else {
        sound.setTempo(1.04);
        this.addFloatingText('PHASE 2: SPEED UP!', b.x, b.y - b.height, '#f97316');
      }
    }
    if (br.state === 'tell' && prevState !== 'tell') sound.playPredator(def.tellCall ?? 'jaguar', 0);
    if (br.state === 'act' && prevState !== 'act') {
      if (br.move === 'screech') sound.playEagleScreech();
      else sound.playWhoosh();
    }
    if (br.state === 'stun' && prevState !== 'stun') this.hitstopTimer = Math.max(this.hitstopTimer, 0.08);

    stepHazards(this.hazards, c.arena, dt, {
      land: (x, y, heavy, color) => {
        this.camera.trauma = Math.min(1, Math.max(this.camera.trauma, heavy ? 0.4 : 0.2));
        sound.playHitImpact(heavy, bossMaterial(world));
        this.spawnDebrisBurst(x, y - 6, color);
      },
    });

    if (this.skyPillars) this.stepSkyFight(b, c, dt);

    // ---- what hurts Pokey ----
    const boxes: Rect[] = [];
    if (bodyHurts(b, def)) boxes.push({ x: b.x - b.width / 2, y: b.y - b.height / 2, w: b.width, h: b.height });
    for (const r of br.hurt) boxes.push(r);
    const hz: Array<{ r: Rect; h: BossHazard }> = [];
    for (const h of this.hazards) {
      const r = hazardBox(h);
      if (r) hz.push({ r, h });
    }
    if (this.debugBoxes) {
      for (const r of boxes) this.dbgHurt.push(r);
      for (const z of hz) this.dbgHurt.push(z.r);
    }
    const pb = this.pBox();
    const bodyN = boxes.length - br.hurt.length;
    for (let i = 0; i < boxes.length; i++) {
      const r = boxes[i];
      if (checkAABBCollision(...pb, r.x, r.y, r.w, r.h)) {
        if (p.invincibleTimer <= 0) this.noteBossHurt(i < bodyN ? 'body' : 'strike', br.state, br.move, br.t);
        this.damagePlayer(1, b.x);
        break;
      }
    }
    for (const { r, h } of hz) {
      if (!checkAABBCollision(...pb, r.x, r.y, r.w, r.h)) continue;
      if (h.dmg > 0 && p.invincibleTimer <= 0 && this.stompGrace <= 0) this.noteBossHurt('hazard:' + h.kind, br.state, br.move, br.t);
      if (h.eff === 'slow') {
        if (this.slowTimer <= 0) this.addFloatingText('STUCK!', p.x, p.y - 50, '#e2e8f0');
        this.slowTimer = Math.max(this.slowTimer, h.kind === 'puddle' ? 0.4 : 2.5);
        if (h.kind !== 'puddle') h.spent = true;
      }
      if (h.dmg > 0 && p.invincibleTimer <= 0 && this.stompGrace <= 0) {
        this.damagePlayer(h.dmg, h.x);
        if (h.kind === 'glob' || h.kind === 'bolt' || h.kind === 'web') h.spent = true;
        if (h.kind === 'bolt' || h.kind === 'glob') h.life = 0;
      }
    }

    this.reportBoss();
  }

  /**
   * What hurt Pokey in a boss fight, and what the boss was doing (the last 40): read by the fairness tests (bossTells.test.ts) and by
   * tools/qa/bossReach.cjs through the harness, so every heart lost can be traced to an attack and its wind-up (QA gate: "unwarned hits?")
   */
  readonly bossHurtLog: Array<{ t: number; by: string; state: string; move: string | null; bt: number }> = [];
  private noteBossHurt(by: string, state: string, move: string | null, bt: number) {
    this.bossHurtLog.push({ t: this.gameTime, by, state, move, bt });
    // (and in the play log, for the QA team: tools/playtesters/LOG_EVENTS.md `bossHurt`)
    recorder.event('bossHurt', `${by} ${state} ${move ?? '-'} ${bt.toFixed(2)}`);
    if (this.bossHurtLog.length > 40) this.bossHurtLog.shift();
  }

  private stepBossDeath(b: BossEntity, def: BossDef, dt: number) {
    const br = b.ai!;
    const end = def.ending;
    const prevT = br.t;
    br.t += dt;
    br.air += (0 - br.air) * Math.min(1, dt * (end ? 2.6 : 5));
    b.y = (this.currentStage.arena?.floor ?? 560) - b.height / 2 - br.air;
    if (end) {
      // a guardian who is beaten, not killed (Meeca's note: be kind to them): she comes down to rest, folds her wings and stays. Feathers
      // drift off her, the shaking stops, and Dot calls it over
      if (Math.random() < dt * 5) this.spawnSparkBurst(b.x + (Math.random() - 0.5) * def.w, b.y - def.h * 0.3, '#f1e4cc');
      if (br.t < 0.6) this.camera.trauma = Math.max(this.camera.trauma, 0.3);
      if (prevT < 1.2 && br.t >= 1.2) {
        this.addFloatingText(end.text, b.x, b.y - b.height * 0.45, '#fde68a', 2.2);
        if (end.line) this.guide(end.line, 3.2);
      }
    } else {
      if (Math.random() < dt * 14) this.spawnDebrisBurst(b.x + (Math.random() - 0.5) * def.w, b.y + (Math.random() - 0.5) * def.h, '#fde68a');
      if (br.t > 0.2) this.camera.trauma = Math.max(this.camera.trauma, 0.35);
    }
    if (br.t >= (end ? 3.4 : 2.0)) {
      b.defeated = true;
      this.daisyRescued = true;
      sound.playBossVictory();
      this.camera.trauma = end ? 0.3 : 0.9;
      this.addFloatingText(this.currentStage.config.secret ? 'THORNBARK IS FREE!' : end ? 'VICTORY!' : 'VICTORY! MEECA IS SAVED!', b.x, b.y - 70, '#ec4899');
      if (!end) this.spawnDebrisBurst(b.x, b.y, '#dc2626');
      this.bossShove = 0;
      this.bossGust = 0;
    }
    this.reportBoss();
  }

  /** tell the HUD about the boss, only when its bar would change */
  private reportBoss() {
    const b = this.boss;
    const def = this.bossDef;
    if (!b || !def || !this.callbacks.onBossUpdate) return;
    const entering = !!this.entrance;
    const sig = `${b.hp}|${b.phase}|${b.defeated ? 1 : 0}|${entering ? 1 : 0}`;
    if (sig === this.bossSig) return;
    this.bossSig = sig;
    this.callbacks.onBossUpdate(b.defeated ? null : { name: def.name, hp: b.hp, maxHp: b.maxHp, phase: b.phase, hits: this.bossHits, color: def.color, entering });
  }

  /** while the boss lives the fight is fenced in, and the camera follows both fighters */
  private bossFrame(dt: number) {
    const b = this.boss;
    const arena = this.currentStage.arena;
    if (!b || !arena || b.defeated) {
      if (this.bossZoom !== 1) {
        this.bossZoom = 1;
        this.applyZoom();
      }
      return;
    }
    const p = this.player;
    if (p.x < arena.left + 14) {
      p.x = arena.left + 14;
      if (p.vx < 0) p.vx = 0;
    } else if (p.x > arena.right - 14) {
      p.x = arena.right - 14;
      if (p.vx > 0) p.vx = 0;
    }
    // a boss whose body is a heap at one fence (Venom's coils) is a wall: no getting behind it, where no attack reaches (QA gate)
    if (this.bossDef?.blockBody) {
      const face = b.x + (b.facing < 0 ? -1 : 1) * (b.width / 2 + 10);
      if (b.facing < 0 && p.x > face) {
        p.x = face;
        if (p.vx > 0) p.vx = 0;
      } else if (b.facing > 0 && p.x < face) {
        p.x = face;
        if (p.vx < 0) p.vx = 0;
      }
    }
    // pull back just far enough that both of them fit
    const w = this.viewCssW;
    const h = this.viewCssH;
    if (!w || !h) return;
    const levelH = this.currentStage.config.levelHeight;
    const portrait = h > w;
    // in a tall narrow window the arena is wider than the screen: the boss makes its entrance close enough to be seen
    // (not during the Queen's tea: she stands at her table and the view goes to her, teaAimK)
    if (portrait && b.ai?.state === 'roar' && b.ai.roarReason === 'enter' && !this.entrance?.tea) b.x = Math.min(b.x, p.x + 540);
    const baseViewW = w / baseScale({ w, h, levelH, worldViewH: WORLD_VIEW_H, portraitViewW: PORTRAIT_VIEW_W });
    const def = this.bossDef;
    const want = bossViewWidth({
      w, h, levelH, px: p.x, bx: b.x, bw: b.width, bh: b.height, air: b.ai?.air ?? 0, arenaW: arena.right - arena.left,
      frameArena: def?.frameArena, frameAir: def?.frameAir, floorAt: def?.floorAt, worldViewH: WORLD_VIEW_H, portraitViewW: PORTRAIT_VIEW_W,
      minW: def?.frameRefuges ? def.frameRefuges[1] - def.frameRefuges[0] + 30 : undefined,
    });
    // the killing blow pushes the camera in
    const target = Math.max(0.4, (baseViewW / want) * (this.slowMoLeft > 0 ? 1.3 : 1));
    const prev = this.bossZoom;
    // (a sky boss climbs fast: the view keeps up with her)
    this.bossZoom += (target - this.bossZoom) * Math.min(1, dt * (this.bossDef?.frameAir ? 3.6 : 2.2));
    if (Math.abs(this.bossZoom - prev) > 0.001) this.applyZoom();
  }

  // ===========================================================================================
  // The fight system (rules live in fight.ts; this is the part that touches the world)
  // ===========================================================================================

  /** world rect of Pokey's hurt box, as the four numbers checkAABBCollision wants */
  private pBox(): [number, number, number, number] {
    const r = playerHurtRect(this.player);
    return [r.x, r.y, r.w, r.h];
  }

  /** while winding up or striking he cannot turn around; the follow-through can */
  private facingLocked(): boolean {
    const a = this.atk;
    return !!a && phaseAt(a.move, a.t) !== 'recovery' && phaseAt(a.move, a.t) !== 'done';
  }

  /** the share of his running speed he keeps while a move plays on the ground (1 in the air) */
  private attackMoveMul(): number {
    const a = this.atk;
    if (!a || !this.player.grounded) return 1;
    const m = a.move;
    const t = a.t;
    if (t < m.startup + m.active) return m.moveMul;
    const u = Math.min(1, (t - m.startup - m.active) / m.recovery);
    return m.moveMul + (1 - m.moveMul) * u;
  }

  /** read the attack buttons, advance the current move, start or chain the next one */
  private updateAttack(dt: number) {
    const p = this.player;
    const inp = this.input.state;
    if (this.megaCooldown > 0) this.megaCooldown -= dt;
    this.input.megaReady = this.megaCooldown <= 0;
    if (this.chainTimer > 0) this.chainTimer -= dt;
    if (this.kickChain > 0) this.kickChain -= dt;
    if (p.grounded) this.stompChain = 0;

    // a touch jab taken back (CT-17): the finger that pressed it turned out to be a flick or a swipe. A swing still winding up stops,
    // as if never pressed; one that has struck stays
    if (inp.punchCancel) {
      inp.punchCancel = false;
      if (this.atkQueue?.want === 'punch') this.atkQueue = null;
      if (this.atk?.want === 'punch' && this.atk.t < this.atk.move.startup) this.atk = null;
    }
    let want: AttackWant | null = null;
    if (inp.megaPunchPressed) want = 'mega';
    else if (inp.kickPressed) want = 'kick';
    else if (inp.punchPressed) want = 'punch';
    if (want === 'punch' && inp.punchHold) this.jabHold = this.gameTime + inp.punchHold;
    inp.punchHold = 0;
    const face = inp.kickPressed ? inp.kickDir : 0;
    inp.megaPunchPressed = false;
    inp.kickPressed = false;
    inp.kickDir = 0;
    inp.punchPressed = false;
    // a press is remembered until the swing it came during can give way (and a little after), so a press is never lost: a tap early in a
    // long move (the hook, the jump kick) used to run out before the move ended, and nothing came of it (testers' logs, 2026-10-24)
    if (want) {
      const busy = this.atk ? Math.max(0, moveLength(this.atk.move) - this.atk.t) : 0;
      this.atkQueue = { want, ttl: Math.max(0.32, busy + 0.15), face };
    }
    else if (this.atkQueue) {
      this.atkQueue.ttl -= dt;
      if (this.atkQueue.ttl <= 0) this.atkQueue = null;
    }

    const a0 = this.atk;
    if (a0) {
      const t0 = a0.t;
      a0.t += dt;
      // (a touch jab that may yet be taken back waits in its wind-up: CT-17)
      if (a0.want === 'punch' && this.gameTime < this.jabHold) a0.t = Math.min(a0.t, Math.max(t0, a0.move.startup - 1e-3));
      if (!a0.sounded && a0.t >= a0.move.startup) {
        a0.sounded = true;
        this.onStrikeBegin(a0.move);
      }
      this.strike(a0, t0, a0.t);
      if (a0.t >= moveLength(a0.move)) this.endAttack();
    }

    if (this.atkQueue) {
      const q = this.atkQueue;
      const a = this.atk;
      if (q.want === 'mega' && this.megaCooldown > 0) {
        this.atkQueue = null;
      } else if (!a || canCancel(a.move, a.t, a.connected) || (a.move.id === 'airKick' && p.grounded && a.t >= a.move.startup)) {
        // (a jump kick ends the moment he lands if another press is waiting: it used to play on along the ground and swallow the punch)
        this.atkQueue = null;
        if (a) this.endAttack();
        this.startAttack(q.want, q.face);
      }
    }
    this.syncAttackPose();
  }

  private startAttack(want: AttackWant, face = 0) {
    const p = this.player;
    const inp = this.input.state;
    const id = chooseMove(want, !p.grounded, this.lastPunch, this.chainTimer > 0);
    const move = MOVES[id];
    // a flicked kick goes the way the thumb flicked, even against the way the other thumb steers (QA, World 5: running right with a
    // spider rushing from behind, a kick flicked left at it went right, the way he was steering, whiffed, and the spider bit)
    if (face) p.facing = face > 0 ? 1 : -1;
    else if (inp.left && !inp.right) p.facing = -1;
    else if (inp.right && !inp.left) p.facing = 1;
    if (id === 'mega') this.megaCooldown = 1.0;
    if (id === 'kick') this.kickTurn = this.kickChain > 0 ? this.kickTurn + 1 : 0;
    this.chainTimer = 0;
    this.atk = { move, t: 0, id: ++this.swingId, connected: false, lunged: false, hits: new Set(), sounded: false, want };
  }

  private endAttack() {
    const a = this.atk;
    if (!a) return;
    const id = a.move.id;
    this.lastPunch = id === 'jab' || id === 'cross' ? id : null;
    this.chainTimer = this.lastPunch ? 0.35 : 0;
    this.kickChain = id === 'kick' ? 0.5 : 0;
    this.atk = null;
  }

  /** the strike starts: the swoosh, the step forward, the shake of a mega punch */
  private onStrikeBegin(m: MoveSpec) {
    const p = this.player;
    if (m.kind === 'punch') sound.playPunch();
    else if (m.kind === 'kick') sound.playKick();
    else {
      sound.playMegaPunch();
      this.camera.trauma = Math.min(1, this.camera.trauma + 0.4);
      this.addFloatingText('MEGA PUNCH!', p.x, p.y - 50, '#fde047');
    }
    if (m.lunge && p.grounded) p.vx = Math.max(-380, Math.min(380, p.vx + p.facing * m.lunge));
  }

  /** a little one is free: out of its cage (punched open, or lifted out on its pulley, puzzlePlay.ts) */
  private freeCritter(c: Collectible) {
    if (c.collected) return;
    c.collected = true;
    c.freedAt = this.gameTime;
    this.player.crittersRescued++;
    this.runScore += 400;
    sound.playCritterRescued();
    this.addFloatingText('RESCUED! +400', c.x, c.y - 30, '#c084fc');
  }

  /** refined controls: is an animal, the boss or a cage close enough that a sideways flick should kick? */
  private somethingToKick(): boolean {
    const p = this.player;
    const cx = p.x + p.width / 2, cy = p.y - p.height / 2;
    const near = (x: number, y: number) => Math.abs(x - cx) < KICK_NEAR_PX && Math.abs(y - cy) < KICK_NEAR_PX * 0.6;
    for (const e of this.enemies) if (!e.defeated && near(e.x + (e.width ?? 0) / 2, e.y)) return true;
    if (this.boss && near(this.boss.x, this.boss.y)) return true;
    for (const c of this.collectibles) if (c.type === 'cage' && !c.collected && !this.kit?.holdsCage(c) && near(c.x, c.y)) return true;
    return false;
  }

  /** which stretch the recorder says he is in (it changes only once he is well into the next one) */
  private sectionTrack = new SectionTrack();
  /** the control-test recorder: where Pokey is, what he is doing and which stretch of the test he is on */
  private recordPokey() {
    const p = this.player;
    const st = this.input.state;
    let s = p.climbing ? 'c' : p.isVineSwinging ? 's' : p.hanging ? 'h' : p.grounded ? (p.ducking ? 'k' : 'g') : 'a';
    if (p.attackMove) s += ':' + p.attackMove;
    // Meeca's stage: the column carrying her in line, or Pell walking her back after a catch (QA read 0.8 s of her moving with no
    // finger down as a loss of control: it was the march, meecaPlay.ts after(); the log now says so)
    if (this.mc) s += this.mc.phase !== 'play' && this.mc.phase !== 'last' ? `:${this.mc.phase}` : this.mc.carvingNow ? ':carve' : '';
    // what the controls are holding (touch, pad or keys alike)
    const held = (st.left ? 'L' : '') + (st.right ? 'R' : '') + (st.up ? 'U' : '') + (st.down ? 'D' : '');
    if (held) s += '/' + held;
    // (with hysteresis: swinging over the line between two stretches no longer flips the label back and forth, sectionTrack.ts)
    const section = this.proto ? this.sectionTrack.update(this.proto.beats, p.x, this.gameTime, !!p.isVineSwinging) : '';
    recorder.pokey(p.x, p.y, p.vx, p.vy, s, section);
  }

  /** copy the move's progress into the player state the drawing reads */
  private syncAttackPose() {
    const p = this.player;
    const a = this.atk;
    if (!a) {
      p.punching = false;
      p.kicking = false;
      p.attackType = 'none';
      p.swingCock = 0;
      p.swingReach = 0;
      p.attackMove = undefined;
      p.attackU = undefined;
      return;
    }
    const m = a.move;
    p.attackMove = m.id === 'kick' && this.kickTurn % 2 ? 'kick2' : m.id;
    p.attackU = Math.min(1, a.t / Math.max(0.001, moveLength(m)));
    p.punching = m.kind !== 'kick';
    p.kicking = m.kind === 'kick';
    p.attackType = m.kind;
    p.punchType = m.kind === 'mega' ? 'mega' : 'normal';
    const left = Math.max(0.001, moveLength(m) - a.t);
    p.punchTimer = left;
    p.kickTimer = left;
    const sp = swingPose(m, a.t);
    p.swingCock = sp.cock;
    p.swingReach = sp.reach;
  }

  /** test everything the strike zone covered since the last tick against animals, the boss and cages (each once per swing) */
  private strike(a: NonNullable<GameEngine['atk']>, t0: number, t1: number) {
    const p = this.player;
    const m = a.move;
    const box = sweptBox(m, t0, t1, { x: p.x, y: p.y, facing: p.facing });
    if (box) this.dbgStrike = box;
    if (!box) return;

    for (const e of this.enemies) {
      if (e.defeated || a.hits.has(e.id)) continue;
      const hr = hurtRect(e);
      if (!rectsOverlap(box, hr)) continue;
      a.hits.add(e.id);
      this.hitEnemy(e, m, box, hr, a);
    }

    const b = this.boss;
    if (b && !b.defeated && !a.hits.has(-1)) {
      const hr = hurtRect(b);
      const wr = this.bossDef ? weakRect(b, this.bossDef, this.currentStage.arena?.floor ?? 560) : null;
      if (rectsOverlap(box, hr) || (wr && rectsOverlap(box, wr))) {
        a.hits.add(-1);
        a.connected = true;
        this.hitBoss(b, m, box, hr);
      }
    }

    for (const c of this.collectibles) {
      if (c.type !== 'cage' || c.collected || a.hits.has(1_000_000 + c.id)) continue;
      const cr: Rect = { x: c.x - 24, y: c.y - 26, w: 48, h: 52 };
      if (!rectsOverlap(box, cr)) continue;
      a.hits.add(1_000_000 + c.id);
      // (a reed cage hung over the water, World 2: too tough to break, the pulley lifts it out: puzzlePlay.ts)
      if (this.kit?.holdsCage(c)) {
        this.addFloatingText('LIFT IT OUT!', c.x, c.y - 40, '#fde68a');
        continue;
      }
      a.connected = true;
      c.cageHp = (c.cageHp ?? 2) - m.damage;
      this.hitstopTimer = Math.max(this.hitstopTimer, 0.04);
      sound.playHitImpact(true, 'chitin');
      this.spawnDebrisBurst(c.x, c.y, '#ca8a04');
      if (c.cageHp <= 0) this.freeCritter(c);
      else {
        this.addFloatingText('CRACK!', c.x, c.y - 20, '#fef08a');
      }
    }
  }

  /**
   * A spider rushing in this frame, after the strike was tested: if it has run into the reach of a punch or kick he has already thrown
   * (winding up or striking), the blow lands now, before it can bite. The strike is tested before the animals move, so a spider stepping
   * into a fist a frame from landing used to bite first and be beaten the frame after: a trade for a well-timed tap. True when it was hit.
   */
  private ranOntoBlow(e: Enemy): boolean {
    const a = this.atk;
    if (!a || a.hits.has(e.id)) return false;
    const m = a.move;
    const ph = phaseAt(m, a.t);
    if (ph !== 'startup' && ph !== 'active') return false;
    const p = this.player;
    const box = moveBox(m, ph === 'startup' ? m.startup : a.t, { x: p.x, y: p.y, facing: p.facing });
    if (!box) return false;
    const hr = hurtRect(e);
    if (!rectsOverlap(box, hr)) return false;
    a.hits.add(e.id);
    this.hitEnemy(e, m, box, hr, a);
    return true;
  }

  private hitEnemy(e: Enemy, m: MoveSpec, box: Rect, hr: Rect, a: NonNullable<GameEngine['atk']>) {
    const p = this.player;
    const dir: 1 | -1 = m.kind === 'mega' ? (e.x >= p.x ? 1 : -1) : p.facing;
    // a river snapper hides from a blow to its face; its shell can be kicked away (predatorAI.ts turtleGuard)
    if (e.type === 'turtle') {
      const g = turtleGuard(e, p.x, m.kind === 'kick');
      if (g !== 'hit') {
        a.connected = true;
        this.hitstopTimer = Math.max(this.hitstopTimer, 0.05);
        sound.playHitImpact(g === 'slide', 'armor');
        const cp = contactPoint(box, hr);
        this.spawnSparkBurst(cp.x, cp.y, '#e2e8f0');
        if (g === 'shell') {
          e.state = 'shell';
          e.stateT = 0;
          e.vx = 0;
          if (e.royal) {
            // the river king's guard blocks with his spear
            if (!this.guardTold) this.addFloatingText('BLOCKED! GET BEHIND HIM, OR KICK HIM', e.x, e.y - 60, '#cbd5e1');
            else this.addFloatingText('CLANK!', e.x, e.y - 50, '#cbd5e1');
            this.guardTold = true;
          } else {
            if (!this.turtleTold) this.addFloatingText('IT HID! GET BEHIND IT, OR KICK THE SHELL', e.x, e.y - 40, '#cbd5e1');
            else this.addFloatingText('TINK!', e.x, e.y - 30, '#cbd5e1');
            this.turtleTold = true;
          }
        } else if (g === 'slide') {
          e.state = 'slide';
          e.stateT = 0;
          e.slideDir = dir;
          this.addFloatingText(e.royal ? 'OOF! WHOA!' : 'WHOOSH!', e.x, e.y - (e.royal ? 56 : 30), '#fef08a');
        } else {
          e.x += dir * 10;
          this.addFloatingText('TINK!', e.x, e.y - 30, '#cbd5e1');
        }
        return;
      }
    }
    const wasCommitted = isCommitted(e);
    const res = resolveMelee(e, m, dir);
    applyHit(e, res);
    a.connected = true;
    const cp = contactPoint(box, hr);
    const kick = m.kind === 'kick';
    if (kick) this.statKicks++;
    else this.statPunches++;

    // weight: the game freezes a moment, the screen shakes, and the blow sounds like what it hit
    this.hitstopTimer = Math.max(this.hitstopTimer, res.killed ? m.hitstop * 1.5 : m.hitstop);
    this.camera.trauma = Math.min(1, this.camera.trauma + m.shake * (res.armored ? 0.5 : 1));
    sound.playHitImpact(m.heavy || res.killed, materialFor(e.type));
    if (kick) this.spawnKickHitBurst(cp.x, cp.y);
    else this.spawnClawHitSparks(cp.x, cp.y, m.heavy);
    if (m.heavy) p.vx -= p.facing * 45; // a heavy blow pushes back on him a little too

    this.comboCount++;
    this.comboResetTimer = 2.0;
    const pts = calculateHitScore(e.type, m.kind === 'mega', this.comboCount) * (kick ? 2 : 1);
    this.runScore += pts;

    // a kick from the air bounces him off the animal, ready to go again
    if (m.id === 'airKick') {
      p.vy = -420;
      p.jumpsLeft = Math.max(p.jumpsLeft, 1);
      p.isDoubleJumping = false;
      this.launched = true;
    }

    if (e.type === 'eagle') {
      this.spawnEagleFeatherBurst(e.x, e.y);
      if (!res.killed && res.interrupt) {
        e.swoopPhase = 'hover';
        e.hoverTimer = 0.9;
        e.isAttacking = false;
      }
    }

    if (res.killed) {
      this.knockOut(e, dir, `+${pts}`);
      return;
    }
    if (res.interrupt && isPredator(e.type)) staggerPredator(e);
    const label = res.armored ? 'TOUGH!' : wasCommitted ? 'STOPPED!' : this.comboCount >= 3 ? `${this.comboCount} HITS!` : 'HIT!';
    this.addFloatingText(label, e.x, e.y - 24, res.armored ? '#cbd5e1' : '#fef08a');
  }

  private hitBoss(b: BossEntity, m: MoveSpec, box: Rect, hr: Rect) {
    const world = this.currentStage.config.worldIndex;
    const def = this.bossDef;
    const c = this.bossContext();
    const cp = contactPoint(box, hr);
    let vul = vulnerability(b);

    // roaring or dying: nothing gets through
    if (vul === 'closed') {
      this.hitstopTimer = Math.max(this.hitstopTimer, 0.03);
      sound.playHitImpact(false, 'armor');
      return;
    }

    // a giant has one weak point, up high: the body only clangs, and even the weak point is guarded unless it is glowing
    const wr = def ? weakRect(b, def, this.currentStage.arena?.floor ?? 560) : null;
    if (wr) {
      const onWeak = rectsOverlap(box, wr);
      if (!onWeak) {
        this.hitstopTimer = Math.max(this.hitstopTimer, 0.04);
        sound.playHitImpact(false, 'armor');
        this.spawnSparkBurst(cp.x, cp.y, '#e2e8f0');
        if (this.clangCd <= 0) {
          this.clangCd = 0.6;
          this.addFloatingText(def?.aimText ?? 'TOO TOUGH! AIM HIGH', cp.x, cp.y - 30, '#cbd5e1');
        }
        return;
      }
      if (!weakOpen(b, def ?? undefined)) {
        // the head is covered while it is moving or attacking: a heavy blow can still rattle it, a light one clangs
        if (vul === 'open') vul = 'armored';
      }
    }

    if (vul === 'armored') {
      if (!m.heavy) {
        // a light hit bounces off a boss that is mid-attack: wait for the opening
        this.hitstopTimer = Math.max(this.hitstopTimer, 0.04);
        sound.playHitImpact(false, 'armor');
        this.spawnSparkBurst(cp.x, cp.y, '#e2e8f0');
        if (this.clangCd <= 0) {
          this.clangCd = 0.45;
          if (def?.openCue && wr) this.addFloatingText('NOT YET!', cp.x, cp.y - 30, '#cbd5e1');
          else this.addFloatingText('CLANG!', b.x, b.y - b.height * 0.7, '#cbd5e1');
        }
        return;
      }
      // a heavy blow rattles the boss; a second one in quick succession breaks the attack
      const broke = def ? interruptBoss(b, def, c) : false;
      if (!broke) {
        // it shrugged it off (poise held): the blow still counts, but for half
        // (a covered weak point takes nothing: the glow is the only time it hurts)
        // (Venom's head is placed by weakAt, not weak: it counts as covered too, so a blow mid-lunge took hits off unseen)
        const chip = wr ? 0 : Math.max(1, Math.ceil(m.bossDamage / 2));
        b.hp = Math.max(0, b.hp - chip);
        b.hitFlashTimer = 0.1;
        this.hitstopTimer = Math.max(this.hitstopTimer, 0.05);
        sound.playHitImpact(false, 'armor');
        this.spawnSparkBurst(cp.x, cp.y, '#fde68a');
        if (this.clangCd <= 0) {
          this.clangCd = 0.45;
          // (a boss with announced openings says the head is not open yet, at the spot that was hit)
          if (def?.openCue && wr) this.addFloatingText('NOT YET!', cp.x, cp.y - 30, '#fde68a');
          else this.addFloatingText('RATTLED!', b.x, b.y - b.height * 0.7, '#fde68a');
        }
        if (b.hp <= 0) this.startBossDeath(b);
        return;
      }
    }

    let dmg = m.bossDamage;
    const crit = vul === 'stunned';
    if (crit) dmg = Math.ceil(dmg * 1.5);
    const leftBefore = hitsLeft(b.hp, b.maxHp, this.bossHits);
    b.hp = Math.max(0, b.hp - dmg);
    this.capStun(b, dmg);
    if (def?.openCap && b.ai?.state === 'rec' && b.ai.move) {
      const br = b.ai;
      br.d.taken = (br.d.taken ?? 0) + dmg;
      const rec = (def.moves[br.move!]?.rec ?? 0) * (this.bossCtx?.openMul ?? 1);
      // he has had enough: a moment to see the hit land, then he drags his head away
      if (br.d.taken >= def.openCap) br.t = Math.max(br.t, rec - 0.35);
    }
    b.hitFlashTimer = 0.15;
    this.hitstopTimer = Math.max(this.hitstopTimer, m.hitstop + 0.02);
    this.camera.trauma = Math.min(1, this.camera.trauma + 0.4);
    sound.playHitImpact(true, bossMaterial(world));
    if (m.kind === 'kick') {
      this.statKicks++;
      this.spawnKickHitBurst(cp.x, cp.y);
    } else {
      this.statPunches++;
      this.spawnClawHitSparks(cp.x, cp.y, true);
    }
    this.comboCount++;
    this.comboResetTimer = 2.0;
    const pts = calculateHitScore('boss', m.kind === 'mega', this.comboCount) * (m.kind === 'kick' ? 2 : 1);
    this.runScore += pts;
    if (def?.openCue && wr) {
      // what came off the bar (half a hit, one, two), over the spot that was hit
      this.addFloatingText(hitLabel(leftBefore, hitsLeft(b.hp, b.maxHp, this.bossHits), crit, pts), wr.x + wr.w / 2, wr.y - 12, crit ? '#fb923c' : '#facc15');
    } else this.addFloatingText(crit ? `CRITICAL! +${pts}` : `BOSS HIT! +${pts}`, b.x, b.y - b.height * 0.7, crit ? '#fb923c' : '#facc15');
    if (b.hp <= 0) this.startBossDeath(b);
  }

  /** a boss with a stun cap (the Sovereign) shakes off a daze once it has taken that much: a moment to see the hit land, then up */
  private capStun(b: BossEntity, dmg: number) {
    const br = b.ai;
    const cap = this.bossDef?.stunCap;
    if (!cap || !br || br.state !== 'stun') return;
    br.d.stunTaken = (br.d.stunTaken ?? 0) + dmg;
    if (br.d.stunTaken >= cap) br.t = Math.max(br.t, br.hold - 0.4);
  }

  /**
   * Landing on a stunned boss's back from above (its `stompSpot`: the Sovereign's, after she slams into a rock). A stomp is a hit; floating
   * down onto it on the leaf is a big one. Returns true when he landed on it.
   */
  private stompBoss(vyNow: number, prevFeet: number): boolean {
    const b = this.boss;
    const def = this.bossDef;
    const arena = this.currentStage.arena;
    const k = def?.stompSpot;
    if (!b || !def || !k || !arena || b.defeated || b.ai?.state !== 'stun' || vyNow <= 0) return false;
    const p = this.player;
    const cx = b.x + b.facing * k.dx;
    const top = arena.floor - b.ai.air - k.dy - k.h / 2;
    if (Math.abs(p.x - cx) > k.w / 2 + 14 || prevFeet > top + k.h * 0.6 || p.y < top - 6 || p.y > top + k.h + 20) return false;
    const leaf = this.glide.on || this.glideOpen > 0.3;
    const dmg = leaf ? 4 : 2;
    b.hp = Math.max(0, b.hp - dmg);
    this.capStun(b, dmg);
    p.vy = leaf ? -680 : -600;
    p.grounded = false;
    p.jumpsLeft = Math.max(p.jumpsLeft, 1);
    p.isDoubleJumping = false;
    p.squashX = 1.3;
    p.squashY = 0.7;
    p.bounce = { kind: leaf ? 'big' : 'stomp', t: 0 };
    this.launched = true;
    this.fallVy = 0;
    this.stompGrace = 0.5;
    b.hitFlashTimer = 0.15;
    this.hitstopTimer = Math.max(this.hitstopTimer, leaf ? 0.12 : 0.08);
    this.camera.trauma = Math.min(1, this.camera.trauma + (leaf ? 0.5 : 0.35));
    sound.playHitImpact(true, bossMaterial(this.currentStage.config.worldIndex));
    this.spawnDebrisBurst(p.x, top, '#fde68a');
    this.comboCount++;
    this.comboResetTimer = 2.0;
    const pts = calculateHitScore('boss', leaf, this.comboCount) * (leaf ? 2 : 1);
    this.runScore += pts;
    this.statStomps++;
    recorder.event('stomp', 'boss');
    this.addFloatingText(`${leaf ? 'LEAF DIVE!' : 'ON HER BACK!'} +${pts}`, b.x, b.y - b.height * 0.7, leaf ? '#86efac' : '#facc15');
    if (b.hp <= 0) this.startBossDeath(b);
    return true;
  }

  /** the last hit: the boss does not vanish, it falls apart */
  private startBossDeath(b: BossEntity) {
    const br = b.ai;
    if (br) {
      br.state = 'dying';
      br.t = 0;
      br.hurt = [];
      br.move = null;
      br.alpha = 1;
    }
    b.telegraphTimer = 0;
    b.isAttacking = false;
    this.hazards.length = 0;
    for (const e of this.enemies) if (!e.defeated && e.id >= 9000) this.knockOut(e, e.x >= b.x ? 1 : -1, 'FREE!');
    this.hitstopTimer = Math.max(this.hitstopTimer, 0.3);
    if (this.bossDef?.lair) this.slowMoLeft = 1.2; // a giant's last hit plays in slow motion, the camera pushing in
    this.camera.trauma = 1;
    this.addFloatingText('K.O.!', b.x, b.y - b.height, '#fde047');
    this.spawnDebrisBurst(b.x, b.y, '#fde047');
  }

  /** an animal is beaten: it is launched away in its own style instead of vanishing */
  /** what happened this stage, for the Trophy Room */
  private buildStats(win: boolean, stars: number): StageStats {
    let floraTotal = 0;
    let floraCollected = 0;
    for (const c of this.collectibles) {
      if (c.type === 'flower' || c.type === 'leaf' || c.type === 'fruit') {
        floraTotal++;
        if (c.collected) floraCollected++;
      }
    }
    return {
      win,
      stars,
      livesLost: this.statLivesLost,
      heartsLost: this.statHeartsLost,
      floraTotal,
      floraCollected,
      ...(this.currentStage.config.objectiveType === 'harvest' ? { floraGoal: { cur: this.player.fruitsCollected, target: this.currentStage.config.targetCount } } : {}),
      timeSec: this.gameTime,
      timeLimit: this.currentStage.config.timeLimit,
      maxStompChain: this.statMaxStompChain,
      maxCombo: this.statMaxCombo,
      stomps: this.statStomps,
      id: this.currentStage.config.id,
      glideSec: this.statGlideSec,
      shimmySec: this.statShimmySec,
      swings: this.statSwings,
      punches: this.statPunches,
      kicks: this.statKicks,
      freed: this.player.crittersRescued,
      ...(this.w5 ? this.w5.tally(this.collectibles, win) : {}),
      ...(this.dotRun ? { scratches: this.dotRun.fl.scratches } : {}),
      ...(this.mc ? { hints: this.mc.hintsAsked } : {}),
      difficulty: difficulty(),
      quiet: dotHelp() === 'quiet',
      kills: { ...this.statKills },
      seen: Array.from(this.statSeen),
    };
  }

  private knockOut(e: Enemy, dir: 1 | -1, label: string) {
    const p = this.player;
    e.defeated = true;
    if (e.id < 9000 && e.type !== 'boss' && e.type !== 'ant_hazard') this.statKills[e.type] = (this.statKills[e.type] ?? 0) + 1;
    e.koTimer = 0;
    e.koAngle = 0;
    e.koLanded = false;
    p.enemiesDefeated++;
    if (e.groundY === undefined) e.groundY = e.y;
    if (isPredator(e.type)) staggerPredator(e); // open crouch pose, then the hop and flop
    const ko = koLaunch(e, dir);
    e.koVx = ko.vx;
    e.koVy = ko.vy;
    e.koSpin = ko.spin;
    e.koLife = ko.life;
    sound.playEnemyDefeated(e.type);
    this.hitstopTimer = Math.max(this.hitstopTimer, 0.1);
    this.addFloatingText(label, e.x, e.y - 25, '#86efac');
    this.spawnDebrisBurst(e.x, e.y, DEBRIS_COLOR[e.type] ?? '#22c55e');
  }

  /** a knocked-out animal tumbles (small), drops (flyers) or hops and flops belly-up (big), then fades */
  private updateKo(e: Enemy, dt: number) {
    e.koTimer += dt;
    const style = TRAITS[e.type].ko;
    e.koVy = (e.koVy ?? 0) + 1500 * dt;
    e.x += (e.koVx ?? 0) * dt;
    e.y += e.koVy * dt;
    const spin = e.koSpin ?? 0;
    e.koAngle = style === 'flop' ? Math.max(-Math.PI, Math.min(Math.PI, spin * e.koTimer)) : spin * e.koTimer;
    if (style === 'flop' && e.groundY !== undefined && e.y >= e.groundY && (e.koVy ?? 0) > 0) {
      e.y = e.groundY;
      e.koVy = 0;
      e.koVx = (e.koVx ?? 0) * 0.3;
      if (!e.koLanded) {
        e.koLanded = true;
        this.camera.trauma = Math.min(1, this.camera.trauma + 0.15);
        this.spawnDebrisBurst(e.x, e.y + 20, '#a16207');
      }
    }
  }

  /** an animal that is hit flinches, slides back, and (if the hit was strong enough) stands dazed; returns true while dazed */
  private reactToHits(e: Enemy, dt: number): boolean {
    if (e.recoil) e.recoil = Math.max(0, e.recoil - dt / 0.24);
    if (e.knockVx) {
      e.x += e.knockVx * dt;
      e.knockVx *= Math.exp(-dt * 9);
      if (Math.abs(e.knockVx) < 8) e.knockVx = 0;
      if (e.type !== 'eagle') {
        const [lo, hi] = walkBounds(e);
        e.x = Math.max(lo - 14, Math.min(hi + 14, e.x));
      }
    }
    if ((e.stagger ?? 0) > 0) {
      e.stagger = (e.stagger ?? 0) - dt;
      if (isPredator(e.type)) {
        e.stateT = (e.stateT ?? 0) + dt;
        if ((e.stagger ?? 0) <= 0) endStagger(e);
      }
      return true;
    }
    return false;
  }

  /** Dot's stuck-helper (stuckHelper.ts): jumping again and again at a wall only the second jump climbs gets the second jump explained */
  private stuck = new StuckWatch();
  private wallWasAhead = false;
  /**
   * World 5's second watch, for a step ONE jump climbs: a first-timer hopping straight up beside it with the thumb lifted lands where
   * he began, again and again (QA, 5-1, 2026-10-26). There the help is to keep sliding forward through the flick.
   */
  private stuckStep = new StuckWatch();
  private stepWasAhead = false;
  /** how far (px, signed) his drawing stands off a wall he is sliding down in the air (WALL_OFF): it never moves his body */
  private wallOff = 0;
  private watchForStuck() {
    if (this.mc) return;
    const p = this.player;
    // (no stage tips in a boss fight: Dot's lines there are the fight's own)
    if (this.boss && !this.boss.defeated && (this.entrance || this.entranceDone)) return;
    if (p.grounded) this.wallWasAhead = this.wallAhead();
    const air = !p.grounded && !p.climbing && !p.isVineSwinging;
    if (this.stuck.tick({ grounded: !air, x: p.x, y: p.y, doubleJumping: !!p.isDoubleJumping, wallAhead: this.wallWasAhead })) {
      this.guide(stuckLine(lessonInputMode()), 6);
      // (in World 5 the stillness waits while she says it: her help is read, not the silk's warning over it)
      this.w5?.holdStill(STUCK_HOLD);
      recorder.event('stuckHelp', Math.round(p.x));
    }
    if (this.w5) {
      if (p.grounded) this.stepWasAhead = this.wallAhead(STEP_FACE.min, STEP_FACE.max);
      if (this.stuckStep.tick({ grounded: !air, x: p.x, y: p.y, doubleJumping: !!p.isDoubleJumping, wallAhead: this.stepWasAhead })) {
        const mode = lessonInputMode();
        this.guide(mode === 'pad' ? W5_STEP_HELP_PAD : mode === 'keys' ? W5_STEP_HELP_KEYS : W5_STEP_HELP, 6);
        this.w5.holdStill(STUCK_HOLD);
        recorder.event('stuckStepHelp', Math.round(p.x));
      }
    }
  }
  /** a solid face just in front of him, standing on the ground, taller than one jump climbs but one a double jump clears (or, given,
   * between `lo` and `hi` px tall): Dot's "jump twice" tip must never point at a face a double jump can't clear (QA 2026-10-29, 4-5) */
  private wallAhead(lo = 100, hi = DOUBLE_RISE + 10): boolean {
    const p = this.player;
    const f = p.facing >= 0 ? 1 : -1;
    for (const q of this.platforms) {
      if (q.type !== 'solid' || q.broken) continue;
      const near = f > 0 ? q.x - p.x : p.x - (q.x + q.width);
      if (near < 0 || near > 90) continue;
      if (q.y < p.y - lo && q.y > p.y - hi && q.y + q.height >= p.y - 12) return true;
    }
    return false;
  }

  /** landing on an animal's back from above: it takes damage and Pokey bounces; armored backs just bounce him */
  private resolveStomps(dt: number) {
    const p = this.player;
    if (this.stompGrace > 0) this.stompGrace -= dt;
    if (p.climbing || p.isVineSwinging) return;
    if (!p.grounded) {
      this.groundedFor = 0;
      if (p.vy > 0) {
        this.fallVy = p.vy;
        this.fallFeet = p.y - p.vy * dt;
      }
    } else {
      this.groundedFor += dt;
      // just touched down from a fall: check that landing once more, as if still falling
      if (this.groundedFor > 0.09 || this.fallVy <= 40) return;
    }
    const vyNow = p.grounded ? this.fallVy : p.vy;
    const prevFeet = p.grounded ? this.fallFeet : p.y - p.vy * dt;
    const diving = this.input.state.down;
    if (this.stompBoss(vyNow, prevFeet)) return;
    for (const e of this.enemies) {
      if (e.defeated) continue;
      const r = stompTest({ x: p.x, y: p.y, vy: vyNow }, prevFeet, e, diving);
      if (!r) continue;
      this.fallVy = 0;
      p.grounded = false;
      recorder.event('stomp', e.type);
      this.stompGrace = 0.3;
      p.jumpsLeft = Math.max(p.jumpsLeft, 1);
      p.isDoubleJumping = false;
      this.launched = true;
      p.squashX = 1.3;
      p.squashY = 0.7;
      p.bounce = { kind: r.kind === 'stomp' && r.damage >= 2 ? 'big' : 'stomp', t: 0 };
      const head = headRect(e);
      if (r.kind === 'bounce') {
        p.vy = -430;
        sound.playHitImpact(false, 'armor');
        this.spawnSparkBurst(p.x, head.y, '#cbd5e1');
        this.addFloatingText('ARMORED!', e.x, head.y - 14, '#cbd5e1');
        return;
      }
      const dir: 1 | -1 = p.vx >= 0 ? 1 : -1;
      const hs = stompSpec(r.damage);
      const wasCommitted = isCommitted(e);
      const res = resolveMelee(e, hs, dir);
      applyHit(e, res);
      p.vy = r.damage >= 2 ? -700 : this.input.state.jumpHeld ? -620 : -460;
      this.stompChain++;
      this.statStomps++;
      this.statMaxStompChain = Math.max(this.statMaxStompChain, this.stompChain);
      this.hitstopTimer = Math.max(this.hitstopTimer, res.killed ? 0.1 : 0.06);
      this.camera.trauma = Math.min(1, this.camera.trauma + (r.damage >= 2 ? 0.35 : 0.18));
      sound.playHitImpact(r.damage >= 2 || res.killed, materialFor(e.type));
      this.spawnDebrisBurst(p.x, head.y, '#fde68a');
      this.comboCount++;
      this.comboResetTimer = 2.0;
      const pts = calculateHitScore(e.type, false, this.comboCount) * (1 + Math.min(3, this.stompChain - 1));
      this.runScore += pts;
      if (e.type === 'eagle') this.spawnEagleFeatherBurst(e.x, e.y);
      if (res.killed) {
        this.knockOut(e, dir, `STOMP${this.stompChain > 1 ? ` x${this.stompChain}` : ''}! +${pts}`);
      } else {
        if (res.interrupt && isPredator(e.type)) staggerPredator(e);
        if (e.type === 'eagle' && res.interrupt) {
          e.swoopPhase = 'hover';
          e.hoverTimer = 0.9;
          e.isAttacking = false;
        }
        // a tough one (the boa takes three): say how many more, so a stomp that did not finish it still reads as working
        const more = Math.max(0, Math.ceil(e.hp / Math.max(1, r.damage)));
        const word = wasCommitted && res.interrupt ? 'STOMPED!' : 'STOMP!';
        this.addFloatingText(more > 0 ? `${word} ${more} MORE` : word, e.x, head.y - 14, '#fde68a');
        // and a longer breather after bouncing off one that is still standing
        this.stompGrace = 0.5;
      }
      return;
    }
  }

  /** is a point within `pad` world units of what the camera shows? Things that are not are not drawn (a stage holds 100+ pickups and up to 40 animals) */
  private onScreen(x: number, y: number, pad: number): boolean {
    const c = this.camera;
    return x > c.x - pad && x < c.x + c.viewportWidth + pad && y > c.y - pad && y < c.y + c.viewportHeight + pad;
  }

  /** draw an animal with its hit reaction: leaning away and squashed after a blow, or tumbling and fading when beaten */
  private drawWithReaction(ctx: CanvasRenderingContext2D, e: Enemy, paint: (c: CanvasRenderingContext2D) => void) {
    // a creature just hit flashes white (hurtFlash.ts, AN-6); the box it is drawn in is its body with room for legs, tails and wings
    const draw = () => {
      const b = bodyRect(e);
      const pad = Math.max(b.w, b.h) * 0.9 + 60;
      withHurtFlash(ctx, e.hitFlashTimer > 0, b.x - pad, b.y - pad, b.w + pad * 2, b.h + pad * 2, paint);
    };
    const recoil = e.recoil ?? 0;
    if (!e.defeated && recoil < 0.02) {
      draw();
      return;
    }
    const b = bodyRect(e);
    const cx = b.x + b.w / 2;
    const feet = b.y + b.h;
    ctx.save();
    if (e.defeated) {
      const cy = b.y + b.h / 2;
      const life = e.koLife ?? 0.8;
      ctx.globalAlpha = 1 - Math.max(0, Math.min(1, (e.koTimer - (life - 0.3)) / 0.3));
      ctx.translate(cx, cy);
      ctx.rotate(e.koAngle ?? 0);
      ctx.translate(-cx, -cy);
    } else {
      ctx.translate(cx, feet);
      ctx.rotate((e.recoilDir ?? 1) * 0.24 * recoil);
      ctx.scale(1 + 0.12 * recoil, 1 - 0.16 * recoil);
      ctx.translate(-cx, -feet);
    }
    draw();
    ctx.restore();
  }

  /** ?hitboxes=1: draw what the game judges, so a hit that looks wrong can be seen */
  private drawHitboxes(ctx: CanvasRenderingContext2D) {
    const p = this.player;
    const stroke = (r: Rect, color: string, fill?: string) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      if (fill) {
        ctx.fillStyle = fill;
        ctx.fillRect(r.x, r.y, r.w, r.h);
      }
      ctx.strokeRect(r.x, r.y, r.w, r.h);
    };
    ctx.save();
    stroke(playerHurtRect(p), '#22d3ee');
    if (this.atk) {
      const a = this.atk;
      const now = moveBox(a.move, a.t, { x: p.x, y: p.y, facing: p.facing });
      if (now) stroke(now, '#ef4444', 'rgba(239,68,68,0.28)');
      else if (this.dbgStrike) stroke(this.dbgStrike, 'rgba(239,68,68,0.35)');
    } else if (this.dbgStrike) {
      stroke(this.dbgStrike, 'rgba(239,68,68,0.25)');
    }
    for (const e of this.enemies) {
      if (e.defeated) continue;
      stroke(hurtRect(e), '#4ade80');
      stroke(headRect(e), '#60a5fa');
    }
    if (this.boss && !this.boss.defeated) stroke(hurtRect(this.boss), '#4ade80');
    ctx.setLineDash([4, 3]);
    for (const r of this.dbgHurt) stroke(r, '#fb923c');
    ctx.restore();
    this.dbgHurt = [];
  }

  /** the rope's give under him (drawing only): the rope he hangs from takes his weight over a moment, and lets it go as he drops off */
  private updateRopeLoad(dt: number) {
    const p = this.player;
    const ld = this.ropeLoad;
    if (p.hanging) {
      if (ld.id !== this.ropeId) ld.amt = 0;
      ld.id = this.ropeId;
      ld.x = p.x;
      ld.amt = Math.min(1, ld.amt + dt * 9);
    } else {
      ld.amt = Math.max(0, ld.amt - dt * 6);
    }
    const r = p.hanging ? this.ropes.find((q) => q.id === ld.id) : undefined;
    p.hangDip = r ? ropeDip(r, p.x, p.x, ld.amt) : 0;
  }

  /** let go of a rope (hurt, respawn, or a deliberate drop); `cooldown` is how long before it can be grabbed again */
  private letGoOfRope(cooldown: number) {
    const p = this.player;
    if (!p.hanging) return;
    p.hanging = false;
    this.ropeCooldown = cooldown;
  }

  /**
   * Shimmy ropes. Returns true while Pokey is hanging from one (and this has done all his moving for the frame).
   * Grab: jump up so his hands reach the rope (or press Up under it). Move: Left/Right at a deliberate creep.
   * Let go: Down drops him, Jump hops off, and walking off either end lets go onto the ledge there.
   */
  private updateRope(dt: number): boolean {
    const p = this.player;
    this.ropeCooldown = Math.max(0, this.ropeCooldown - dt);
    if (!this.ropes.length || !this.skills.has('shimmy')) {
      if (p.hanging) p.hanging = false;
      return false;
    }
    const inp = this.input.state;
    let rope: Rope | undefined = p.hanging ? this.ropes.find((r) => r.id === this.ropeId) : undefined;

    if (!rope) {
      p.hanging = false;
      if (this.ropeCooldown > 0 || p.grounded || p.climbing || p.isVineSwinging || this.isGameOver || this.kit?.holding) return false;
      const handY = p.y - HAND_REACH;
      for (const r of this.ropes) {
        // (from beside a post, over the ledge it stands on, counts: a jump straight up next to the post catches the rope's end, and he
        // is slid onto it. Play-testers jumped up beside the post and missed, by a body's width)
        if (p.x < r.x0 - ROPE_GRAB || p.x > r.x1 + ROPE_GRAB) continue;
        const ry = ropeYAt(r, p.x);
        // his hands are on the rope: rising through it, or falling past it with Up held
        if (handY > ry - 12 && handY < ry + 30 && (p.vy < 40 || inp.up || this.upIntent > 0)) {
          rope = r;
          break;
        }
      }
      if (!rope) return false;
      // grab
      p.x = Math.max(rope.x0, Math.min(rope.x1, p.x));
      this.ropeId = rope.id;
      p.hanging = true;
      p.climbing = false;
      p.isVineSwinging = false;
      p.ducking = false;
      p.vx = 0;
      p.vy = 0;
      p.jumpsLeft = 1;
      p.isDoubleJumping = false;
      p.somersaultAngle = 0;
      this.ropeGrace = 0.25; // the press that got him up there must not also let go
      this.inputGrace = 0;
      inp.jumpPressed = false;
      this.jumpBufferTimer = 0;
      this.upIntent = 0;
      p.squashX = 1.12;
      p.squashY = 0.9;
      sound.playVineGrab();
      this.spawnSparkBurst(p.x, p.y - HAND_REACH, '#fde68a');
    }

    // hanging
    this.ropeGrace = Math.max(0, this.ropeGrace - dt);
    if (this.ropeGrace > 0) inp.jumpPressed = false;
    const dir = (inp.right ? 1 : 0) - (inp.left ? 1 : 0);
    p.grounded = false;
    p.vy = 0;
    p.vx = dir * ROPE_SPEED;
    if (dir !== 0) p.facing = dir as 1 | -1;
    p.x += p.vx * dt;
    if (dir !== 0) this.statShimmySec += dt;
    p.walkCycle += Math.abs(p.vx) * dt * 0.08;
    const atEnd = p.x <= rope.x0 || p.x >= rope.x1;
    p.x = Math.max(rope.x0, Math.min(rope.x1, p.x));
    p.y = ropeYAt(rope, p.x) + HANG_DROP;

    // let go
    const off = (vx: number, vy: number, cool: number) => {
      p.hanging = false;
      this.ropeCooldown = cool;
      p.vx = vx;
      p.vy = vy;
    };
    if (inp.jumpPressed && this.ropeGrace <= 0) {
      inp.jumpPressed = false;
      // (the way the flick leaned first, then the steer, then his facing, as off a vine or a trunk: leapDir. It took the steer only, so
      // creeping one way and flicking up and the other hopped him the way he crept, polish report CT-21)
      const jd = this.leapDir(dir !== 0 ? (dir as -1 | 1) : p.facing);
      p.facing = jd;
      off(jd * 230, -PHYS.jumpV * 0.82, 0.35);
      p.jumpsLeft = 1;
      this.launched = true;
      p.squashX = 0.8;
      p.squashY = 1.25;
      sound.playJump();
      this.spawnJumpDust(p.x, p.y);
      return false;
    }
    if (inp.down && this.ropeGrace <= 0) {
      off(0, 60, 0.4);
      p.jumpsLeft = 1;
      return false;
    }
    if (atEnd && dir !== 0 && ((dir < 0 && p.x <= rope.x0) || (dir > 0 && p.x >= rope.x1))) {
      // walked off the end: he lets go over the ledge and lands on it
      off(dir * 90, 0, 0.3);
      p.jumpsLeft = 2;
      return false;
    }
    return true;
  }

  /** a hit: one heart (or `amount`), a flinch and a knock back AWAY from `fromX`, where the hit came from (his back, when it is not known) */
  private damagePlayer(amount: number, fromX?: number) {
    const p = this.player;
    if (this.isGameOver || p.invincibleTimer > 0 || this.stompGrace > 0) return;

    this.statHeartsLost += amount;
    p.hp = Math.max(0, p.hp - amount);
    recorder.event('hurt', p.hp);
    p.invincibleTimer = 1.2; // 1.2s invulnerability
    p.squashX = 1.3;
    p.squashY = 0.7; // hurt flinch
    this.letGoOfRope(0.6);
    p.vy = -PHYS.hurtKnockV;     // small knockup
    // away from what hit him: it used to push him away from where he FACED, so a hit from behind threw him back into the foe, which
    // hit him again as soon as the 1.2 s of safety ran out (play-testers, 2026-10-25)
    p.vx = knockDir(p.x, p.facing, fromX) * 180;
    this.airDrive = newAirDrive();
    this.camera.trauma = Math.min(1.0, this.camera.trauma + 0.5);
    sound.playPlayerHurt();
    buzz('hurt');
    // (the hit that costs a life says so at the respawn instead: two lots of words on one spot were unreadable)
    if (p.hp > 0) this.addFloatingText(`-${amount} HP`, p.x, p.y - 45, '#ef4444');

    if (p.hp <= 0 && !this.isGameOver) {
      this.loseLife('hurt');
    }
  }

  /** Lose a life and respawn at the last checkpoint, or end the run when none are left. */
  private bounceOff() {
    const p = this.player;
    p.vy = -PHYS.bounceV;
    this.launched = true;
    p.grounded = false;
    p.jumpsLeft = 1;
    p.isDoubleJumping = false;
    p.squashX = 0.78;
    p.squashY = 1.38;
    p.bounce = { kind: 'spring', t: 0 };
    sound.playJump();
    this.spawnSparkBurst(p.x, p.y, '#facc15');
  }

  private loseLife(reason: 'water' | 'pit' | 'hurt') {
    recorder.event('lostLife', reason);
    this.lostTo = reason;
    if (this.bossGuideUp) this.clearGuide();
    this.lives -= 1;
    this.statLivesLost++;
    this.callbacks.onLivesChange?.(this.lives, this.maxLives);
    if (this.lives <= 0) {
      this.isGameOver = true;
      this.outOfLives = true;
      sound.playDefeat();
      this.callbacks.onStageStats?.(this.buildStats(false, 0));
      this.callbacks.onDefeat(this.runScore);
      return;
    }
    this.respawnAtCheckpoint(reason);
    // Dot's flight: she says a life went (QA, 2026-10-25: losing one came with no line)
    this.dotRun?.lostLife(this.lives);
  }

  /**
   * After Game Over: stand Pokey up at the last checkpoint with every life back. Stage progress (flowers, defeated animals, the boss's
   * hurt) is kept, which is the point. Only valid when the lives ran out; returns false otherwise so the app can start over instead.
   */
  public continueFromCheckpoint(): boolean {
    if (!this.isRunning || !this.isGameOver || !this.outOfLives) return false;
    this.isGameOver = false;
    this.outOfLives = false;
    this.maxLives = startingLives(); // picks up extra lives switched on from the Game Over card
    this.lives = this.maxLives;
    this.callbacks.onLivesChange?.(this.lives, this.maxLives);
    this.respawnAtCheckpoint('hurt');
    return true;
  }

  /** Easy's soft fall on land (softOn): back on the last still ground he stood on, nothing lost. False when it does not apply */
  private softFall(): boolean {
    const at = this.softAt;
    if (!this.softOn || !at) return false;
    const p = this.player;
    recorder.event('softFall', Math.round(p.x));
    sound.playWhoosh();
    p.x = at.x;
    p.y = at.y;
    p.vx = 0;
    p.vy = 0;
    this.airDrive = newAirDrive();
    p.grounded = false;
    p.climbing = false;
    p.isVineSwinging = false;
    this.letGoOfRope(0.5);
    p.jumpsLeft = 2;
    p.invincibleTimer = Math.max(p.invincibleTimer, 1.2);
    this.respawnFlash = 0.6;
    this.inputGrace = 0.35;
    this.graceMoves = this.input.moves;
    const fr = framing(this.viewCssW, this.viewCssH, this.camera.viewportWidth);
    this.camera.x = Math.max(0, p.x - this.camera.viewportWidth * FRAME.across);
    this.camera.y = Math.max(0, p.y - this.camera.viewportHeight * fr.feetAt);
    this.camCut = true;
    this.camera.targetX = this.camera.x;
    this.camera.targetY = this.camera.y;
    this.camAnchorY = NaN;
    this.addFloatingText('TRY AGAIN!', p.x, p.y - 112, '#fde68a', 1.2);
    return true;
  }

  private respawnAtCheckpoint(reason: 'water' | 'pit' | 'hurt') {
    const p = this.player;
    // the rising rivers go back down: he comes back to water at its starting level
    this.floodAt.clear();
    this.hazards.length = 0;
    this.slowTimer = 0;
    this.drowsy = 0;
    this.flightClear = false;
    this.drowsyShow = 0;
    this.windV = 0;
    this.bossShove = 0;
    this.bossGust = 0;
    this.dragSpeed = 1;
    this.dragJump = 1;
    // planks that crumbled since the checkpoint come back, or a respawn could leave a gap nobody can cross
    // 6-8: the tide starts again under his flag, waiting a moment (risingTide.ts)
    if (this.tide) {
      restartTide(this.tide, this.proto!.tide!, this.tideSet, this.checkpoint.y);
      this.currentStage.waterY = this.tide.y;
    }
    for (const pl of this.platforms) {
      if (pl.type === 'fragile') {
        pl.broken = false;
        pl.fragileTimer = undefined;
        pl.regrowAt = undefined;
      }
    }
    // every animal loses its lock on him: whatever got him goes back to its business (it re-notices if he is still in range)
    for (const e of this.enemies) e.alertT = 0;
    p.hp = p.maxHp;
    p.x = this.checkpoint.x;
    p.y = this.checkpoint.y;
    p.vx = 0;
    p.vy = 0;
    this.airDrive = newAirDrive();
    p.grounded = false;
    p.climbing = false;
    p.isVineSwinging = false;
    p.swim = undefined;
    this.letGoOfRope(0.5);
    p.jumpsLeft = 2;
    p.invincibleTimer = 2.0;
    this.respawnFlash = 0.6;
    // what he was carrying goes back to its source
    this.kit?.onRespawn();
    this.inputGrace = 0.35;
    this.graceMoves = this.input.moves;
    const fr = framing(this.viewCssW, this.viewCssH, this.camera.viewportWidth);
    this.camera.x = Math.max(0, p.x - this.camera.viewportWidth * FRAME.across);
    this.camera.y = Math.max(0, p.y - this.camera.viewportHeight * fr.feetAt);
    this.camCut = true;
    this.camera.targetX = this.camera.x;
    this.camera.targetY = this.camera.y;
    this.camAnchorY = NaN;
    this.camRunK = 0;
    this.camRunSlow = 0;
    // above his head, one line over the other with room between (at his head they sat on top of him and of each other), and up long
    // enough to read; any older words still rising there go first
    this.floatingTexts = this.floatingTexts.filter((ft) => Math.abs(ft.x - p.x) > 160 || Math.abs(ft.y - p.y) > 220);
    this.addFloatingText(reason === 'hurt' ? 'TRY AGAIN!' : 'OH NO!', p.x, p.y - 112, '#fca5a5', 1.4);
    if (reason !== 'hurt') this.addFloatingText(`${this.lives} ${this.lives === 1 ? 'LIFE' : 'LIVES'} LEFT`, p.x, p.y - 88, '#fde68a', 1.4);
    // Dot's flight: she comes back at the last flower she drank at
    if (this.dotRun) this.dotRun.fl.respawn();
    if (this.slideRun?.sliding) this.slideRun.respawn();
  }

  /**
   * World 2 rivers. Before the platforms: the water body between the banks, with streaks that show the flow.
   * After them (`over`): a translucent sheet across the lower half of every log, so the logs sit in the water, not on it.
   */
  private drawRivers(ctx: CanvasRenderingContext2D, world: (typeof WORLDS_DATA)[number], over: boolean, floodsOnly = false) {
    const rivers = floodsOnly ? this.currentStage.rivers?.filter((r) => r.flood && this.floodAt.has(r)) : this.currentStage.rivers;
    if (!rivers?.length) return;
    const cam = this.camera;
    const t = this.gameTime;
    const bottom = cam.y + cam.viewportHeight + 40;
    for (const r of rivers) {
      if (r.x1 < cam.x - 40 || r.x0 > cam.x + cam.viewportWidth + 40) continue;
      const a = Math.max(r.x0, cam.x - 20);
      const b = Math.min(r.x1, cam.x + cam.viewportWidth + 20);
      ctx.save();
      ctx.beginPath();
      ctx.rect(r.x0, r.surfaceY - 30, r.x1 - r.x0, bottom - r.surfaceY + 30);
      ctx.clip();
      const wave = (x: number) => r.surfaceY + Math.sin(x * 0.03 + t * 2.2 * r.dir) * 2.5 + Math.sin(x * 0.07 - t * 1.5 * r.dir) * 1.5;
      const painted = this.paintedRivers(world.id) && riverArtReady();
      if (!over) {
        if (!painted || !drawRiverWater(ctx, a, b, r.surfaceY, bottom, t, r.dir, r.speed)) drawWater(ctx, world.id, a, b, r.surfaceY, bottom, t);
        // the current: pale streaks sliding along the surface the way the logs go (still water, a lily pond, has none)
        if (r.speed > 0) {
          ctx.strokeStyle = painted ? 'rgba(235,250,245,0.38)' : 'rgba(255,255,255,0.55)';
          ctx.lineWidth = 2.4;
          ctx.lineCap = 'round';
          const span = 140;
          for (let k = Math.floor(a / span) - 1; k < b / span + 1; k++) {
            for (let row = 0; row < 3; row++) {
              const sx = (((k * span + row * 47 + (r.flowT ?? t) * r.speed * r.dir) % (r.x1 - r.x0 + span)) + (r.x1 - r.x0 + span)) % (r.x1 - r.x0 + span);
              const x = r.x0 + sx - span * 0.5;
              const y = wave(x) + 7 + row * 9;
              ctx.beginPath();
              ctx.moveTo(x, y);
              ctx.lineTo(x + r.dir * 26, y);
              ctx.stroke();
            }
          }
        }
      } else {
        const g = ctx.createLinearGradient(0, r.surfaceY, 0, r.surfaceY + 60);
        // (the painted river's own colours when it is painted, so the logs sink into the same water)
        g.addColorStop(0, painted ? 'rgba(96, 160, 152, 0.3)' : 'rgba(56, 148, 168, 0.55)');
        g.addColorStop(1, painted ? 'rgba(38, 66, 71, 0.75)' : 'rgba(24, 90, 120, 0.8)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(a, bottom);
        ctx.lineTo(a, wave(a));
        for (let x = a; x <= b + 12; x += 12) ctx.lineTo(x, wave(x));
        ctx.lineTo(b, bottom);
        ctx.closePath();
        ctx.fill();
        // foam where the logs cut the surface
        ctx.strokeStyle = 'rgba(255,255,255,0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = a; x <= b + 12; x += 12) {
          if (x === a) ctx.moveTo(x, wave(x));
          else ctx.lineTo(x, wave(x));
        }
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  /** World 2 draws its drifting logs and lily pads from Matt's painted sheet once it has loaded */
  private riverLogsPainted(worldId: number): boolean {
    return this.paintedRivers(worldId) && (!!this.currentStage.rivers?.length || this.platforms.some((p) => p.lily)) && riverArtReady();
  }
  /** World 2's painted water, logs and lily pads: World 2, and the control test's river stretches (built on World 1's ground) */
  private paintedRivers(worldId: number): boolean {
    return worldId === 2 || !!this.proto?.mix;
  }
  private noLogs: { from: Platform[]; out: Platform[] } | null = null;
  /** the platforms the drawn layer paints, less the drifting logs and lily pads when the painted ones draw instead (kept between frames) */
  private withoutPaintedLogs(worldId: number, plats: Platform[]): Platform[] {
    if (!this.riverLogsPainted(worldId)) return plats;
    if (this.noLogs?.from !== plats) this.noLogs = { from: plats, out: plats.filter((p) => p.type !== 'drift' && !p.lily) };
    return this.noLogs.out;
  }

  /** Pit water (behind the ground banks) and checkpoint flags. */
  /** mark on the page what Dot's bubble must leave clear on this stage (World 5's carvings; nothing elsewhere): guideKeepOut.ts */
  private markKeepOuts() {
    const cam = this.camera;
    if (this.w5) this.w5.keepOuts({ x0: cam.x, x1: cam.x + cam.viewportWidth }, this.keepWorld);
    else this.keepWorld.length = 0;
    const out = this.keepPage;
    const z = this.zoom;
    while (out.length < this.keepWorld.length) out.push({ x0: 0, y0: 0, x1: 0, y1: 0 });
    for (let i = 0; i < this.keepWorld.length; i++) {
      const b = this.keepWorld[i];
      const o = out[i];
      o.x0 = this.viewCssX + (b.x0 - cam.x) * z;
      o.y0 = this.viewCssY + (b.y0 - cam.y) * z;
      o.x1 = this.viewCssX + (b.x1 - cam.x) * z;
      o.y1 = this.viewCssY + (b.y1 - cam.y) * z;
    }
    setGuideKeepOuts(out, this.keepWorld.length);
  }

  private drawWaterAndFlags(ctx: CanvasRenderingContext2D, world: (typeof WORLDS_DATA)[number]) {
    const waterY = this.currentStage.waterY;
    const t = this.gameTime;
    const x0 = this.camera.x - 20;
    const x1 = this.camera.x + this.camera.viewportWidth + 20;
    if (waterY !== undefined) {
      const bottom = this.camera.y + this.camera.viewportHeight + 40;
      drawWater(ctx, world.id, x0, x1, waterY, bottom, t);
    }
    for (const cp of this.currentStage.checkpoints ?? []) {
      if (cp.x < x0 - 80 || cp.x > x1 + 80) continue;
      // World 5: the painted lace pennant
      if (this.w5?.drawFlag(ctx, cp, t, world.id)) continue;
      // the painted leaf-pennant post (stageArt.ts): unlit, then lit and fluttering once reached
      if (!cp.reached) {
        ctx.save();
        ctx.translate(cp.x + 20, cp.y - 52);
        drawAura(ctx, 'take', world.id, 30, 40, t, cp.x * 0.01);
        ctx.restore();
      }
      drawCheckpointArt(ctx, cp.x, cp.y, cp.reached, t);
    }
    // the new generator's water warnings (gen2 proto.gen2.waterWarnings): the painted warning sign at the water's edge (World 5's garden
    // sign, the jungle one in the other worlds: waterSign.ts), a plain post with a wave on it while its sheet loads
    // (and the sign at a hand-built stage's first water: waterTeach.ts, LV-8)
    [...(this.proto?.gen2?.waterWarnings ?? []), ...(this.currentStage.waterSigns ?? [])].forEach((w, i) => {
      if (w.x < x0 - 80 || w.x > x1 + 80) return;
      // (it rattles for a moment as he comes up to it: once each time he comes within reach)
      const near = Math.abs(this.player.x + this.player.width / 2 - w.x) < 150 && Math.abs(this.player.y + this.player.height - w.y) < 200;
      if (near && !this.signNear.has(i)) this.signNear.set(i, this.gameTime);
      else if (!near) this.signNear.delete(i);
      const since = this.signNear.has(i) ? this.gameTime - this.signNear.get(i)! : undefined;
      if (drawWaterSign(ctx, this.currentStage.config.worldIndex, w.x, w.y + 3, signRattle(since))) return;
      const cy = w.y - 50;
      ctx.save();
      ctx.fillStyle = '#7c5a32';
      ctx.fillRect(w.x - 3, w.y - 40, 6, 40);
      ctx.fillRect(w.x - 18, cy - 12, 36, 24);
      ctx.strokeStyle = '#1d4ed8';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      for (const dy of [-5, 4]) {
        ctx.beginPath();
        ctx.moveTo(w.x - 12, cy + dy);
        ctx.quadraticCurveTo(w.x - 6, cy + dy - 5, w.x, cy + dy);
        ctx.quadraticCurveTo(w.x + 6, cy + dy + 5, w.x + 12, cy + dy);
        ctx.stroke();
      }
      ctx.restore();
    });
  }

  /** a splash, painted: the splash crown where he went in, and puffs of spray thrown up out of it */
  private spawnWaterSplash(x: number, y: number) {
    this.emit({ x, y: y + 6, vx: 0, vy: 0, color: '', size: 96, life: 0.55, maxLife: 0.55, type: 'splash' });
    for (let i = 0; i < 9; i++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 1.4;
      const sp = 150 + Math.random() * 220;
      this.emit({
        x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        color: '', size: 3 + Math.random() * 3, life: 0.7, maxLife: 0.7, type: 'water',
      });
    }
  }

  /**
   * Camera Controller with lookahead and trauma screen shake
   */
  /** where the Queen's tea sends her home to: her fight start (upright, as close to Pokey as any entering boss is put, updateCamera) */
  private teaHome(): number {
    const home = this.entrance?.tea?.home ?? this.boss?.x ?? 0;
    return this.viewCssH > this.viewCssW ? Math.min(home, this.player.x + 540) : home;
  }

  /** how far the view is turned over to the Queen's tea table (0..1): upright only, through the pour, easing off as she walks home */
  private teaAimK(): number {
    const en = this.entrance;
    if (!en?.tea || !this.boss || this.viewCssH <= this.viewCssW) return 0;
    const u = en.t / en.total;
    const k = Math.min(1, u / 0.3) * (1 - Math.max(0, Math.min(1, (u - 0.7) / 0.2)));
    return k * k * (3 - 2 * k);
  }

  private updateCamera(dt: number) {
    const p = this.player;
    const { viewportWidth: vw, viewportHeight: vh } = this.camera;

    // the framing for this screen's shape: less look-ahead on a narrow upright phone, his feet lower on a squat sideways one (cameraFollow.ts)
    const fr = framing(this.viewCssW, this.viewCssH, vw);
    // the way the view looks: the way he faces, but on a swinging vine the way he faced as he caught it, held for the whole swing (each
    // swing back turns him round, and the view swung back and forth with it, QA 2026-10-28 `camjump`, 1-6's swing frames)
    if (p.isVineSwinging && !this.camSwung) this.camSwingFacing = p.facing < 0 ? -1 : 1;
    this.camSwung = !!p.isVineSwinging;
    const facing = p.isVineSwinging ? this.camSwingFacing : p.facing;
    this.camFacing = facing;
    // Look-ahead tracking: eased across when he turns, and a height that ignores hops and swings (cameraFollow.ts: the screen jiggled)
    this.camLookX = camLook(this.camLookX, facing, dt, fr.look);
    // (and at a run, on a narrow view, it leads further: cameraFollow.ts runLead; it follows the look-ahead's side, so a turn eases it over)
    this.camRunK = camRun(this.camRunK, p.vx, facing, dt);
    this.camRunSlow = camRun(this.camRunSlow, p.vx, facing, dt, RUN.settle);
    const runX = runOffset(vw, this.camRunK, this.camRunSlow, dt, fr) * Math.max(-1, Math.min(1, this.camLookX / (fr.look || 1)));
    const sv = p.isVineSwinging ? this.nearSwingVine : null;
    this.camAnchorY = camAnchor(this.camAnchorY, { y: p.y, grounded: p.grounded, climbing: p.climbing, hanging: !!p.hanging, swingBottom: sv ? sv.topY + (p.swingLength ?? 100) : undefined }, vh);
    // in the chase the view looks well ahead, so what is coming is seen in time (and the break behind is just in view)
    this.camera.targetX = this.chase?.active ? p.x - vw * 0.3 : p.x - vw * FRAME.across + this.camLookX + runX;
    this.camera.targetY = this.camAnchorY - vh * fr.feetAt;
    // 4-6's mist (w4Play.ts): standing still on a mist spot, the view drifts over to the way up the settling mist is showing him
    const look = this.w4?.look(p.x, p.y);
    if (look) {
      // (a knot, on a wide view: kept 110 px in from the left edge, clear of Dot's banner across the middle of the screen)
      const lx = look.leftX !== undefined && vw > vh * 1.3 ? look.leftX - 110 : look.x - vw / 2;
      this.camera.targetX += (lx - this.camera.targetX) * look.u;
      this.camera.targetY += (look.y - vh / 2 - this.camera.targetY) * look.u;
      // (never so far that he leaves the view: his feet stay above the bottom tenth)
      this.camera.targetY = Math.max(this.camera.targetY, p.y - vh * 0.9);
    }
    // a puzzle room (puzzleCamera.ts): the view leans from him toward the part of the puzzle that matters now, or goes to a far gate
    // that has just opened; outside every room this is nothing
    const kf = !look && this.kit ? this.kit.camFocus(p, vw * this.roomZoom, vh * this.roomZoom, this.roomFloorNow()) : null;
    if (kf) {
      // (moved from the lean point just enough to keep the key box in: the stone, its basket and the cage it lifts, all at once)
      const lean = roomLean(p.x, p.y - 45, kf.x, kf.y);
      this.roomAim = { ...(kf.pan ? { x: kf.x, y: kf.y } : kf.box ? roomCentre(lean, kf.box, vw, vh) : lean), pan: kf.pan };
    }
    // (the room's framing blends in over ROOM_CAM.blend s coming in, and out again leaving, from the last place it aimed: the aim no
    // longer swaps at the room's edge, which swung the view 130 px at once)
    this.roomK = Math.max(0, Math.min(1, this.roomK + (kf ? dt : -dt) / ROOM_CAM.blend));
    const ra = this.roomAim;
    if (ra && this.roomK > 0) {
      const v = ra.pan ? { x: ra.x - vw / 2, y: ra.y - vh / 2 } : roomView(ra.x, ra.y, vw, vh, p.x, p.y);
      const k = this.roomK * this.roomK * (3 - 2 * this.roomK);
      this.camera.targetX += (v.x - this.camera.targetX) * k;
      this.camera.targetY += (v.y - this.camera.targetY) * k;
    }
    if (this.roomK === 0) this.roomAim = null;
    // in calm water, zoomed in on him (SWIM_CAM): the view centres on him at the water's top, as far as it is zoomed in
    if (this.swimZoom > 1.001) {
      const k = Math.min(1, (this.swimZoom - 1) / (SWIM_CAM.swim - 1));
      const sy = p.swim?.surfaceY ?? p.y;
      this.camera.targetX += (p.x - vw / 2 - this.camera.targetX) * k;
      this.camera.targetY += (sy - vh * 0.58 - this.camera.targetY) * k;
    }
    // near the end of a ledge with a gap ahead, the view shows the far side too (cameraFollow.ts landingAhead)
    let landShown: Box | null = null;
    let landX = 0;
    let landY = 0;
    if (!look && !kf && !this.chase?.active && !this.currentStage.arena) {
      const land = this.landingToShow(dt);
      landShown = land;
      if (land) {
        const v = showBoth(this.camera.targetX, this.camera.targetY, p.x, p.y, land, vw, vh);
        landX = v.x - this.camera.targetX;
        landY = v.y - this.camera.targetY;
      }
    }
    // (the shift that shows the landing eases in and out, never all at once: a turn on a stone between two gaps, or a turn on a swing,
    // swapped the landing from one side to the other and the view jumped 130-200 px in a frame, QA 2026-10-28 `camjump`; a landing
    // still outside the view, as when he turns round at the end of a ledge and jumps at once for the vine he now faces, comes in faster,
    // so it is on screen as he leaves the ledge for it, QA 2026-10-26)
    const behind = !!landShown && (landShown.x0 < this.camera.x || landShown.x1 > this.camera.x + vw);
    const lk = Math.min(1, dt * (behind ? LAND_EASE.fast : LAND_EASE.rate));
    this.camLandX += (landX - this.camLandX) * lk;
    this.camLandY += (landY - this.camLandY) * lk;
    this.camera.targetX += this.camLandX;
    this.camera.targetY += this.camLandY;
    const bs = this.boss;
    if (bs && !bs.defeated && this.currentStage.arena) {
      // frame both fighters, but never let Pokey slip off the edge
      const arenaWide = this.bossDef?.frameArena && vw >= this.currentStage.arena.right - this.currentStage.arena.left;
      // (while the weak point glows, frame it rather than his middle: Venom's dazed head lies far from his coils, off a phone held upright)
      const def = this.bossDef;
      const wr = def?.openCue && weakOpen(bs, def) ? weakRect(bs, def, this.currentStage.arena.floor) : null;
      const fx = wr ? wr.x + wr.w / 2 : bs.x;
      let tx = arenaWide ? (this.currentStage.arena.left + this.currentStage.arena.right) / 2 - vw / 2 : bossViewX(p.x, fx, vw);
      // (upright, a boss that lists its refuges keeps them in the view: the tree, stump and vine you dodge Venom from)
      const fr = def?.frameRefuges;
      if (fr && !arenaWide && this.viewCssH > this.viewCssW) tx = keepInView(tx, vw, this.currentStage.arena.left + fr[0], this.currentStage.arena.left + fr[1]);
      tx = Math.max(p.x + 70 - vw, Math.min(p.x - 70, tx));
      this.camera.targetX = tx;
      this.camera.targetY = Math.min(this.camera.targetY, this.currentStage.arena.floor - vh * (this.bossDef?.floorAt ?? 0.7));
      // the Queen's tea, upright: the narrow view goes over to her table while she pours and eases back as she skitters home
      // (sideways, both already fit). Everything holds still in the entrance, so Pokey may be off the edge for those seconds.
      const k = this.teaAimK();
      if (k > 0) this.camera.targetX += (bs.x - TEA_STAND * 0.6 - vw / 2 - this.camera.targetX) * k;
    }

    // 6-8: the rising tide is the star: the view drops so its line sits near the bottom of the screen while he climbs (as far as his
    // head under the HUD allows, just below)
    // (not up the last root: there the view is the reveal's)
    const revealing = !!this.proto?.reveal && p.y < this.proto.reveal.from;
    if (this.tide?.on && !revealing) this.camera.targetY = Math.max(this.camera.targetY, this.tide.y - vh * 0.86);

    // his head stays under the HUD along the top, whatever the view wanted (cameraFollow.ts HUD_BAND): measured from the ground he
    // stands on (in the air, the height the camera keeps level with), so a hop does not drag the view up after him
    const band = (this.viewCssH > this.viewCssW ? HUD_BAND.port : HUD_BAND.land) / this.zoom;
    const refY = p.grounded || !Number.isFinite(this.camAnchorY) ? p.y : this.camAnchorY;
    this.camera.targetY = Math.min(this.camera.targetY, underHud(refY, band));

    // Smooth damp camera
    const smoothFactor = Math.min(1, dt * RUN.follow);
    this.camera.x += (this.camera.targetX - this.camera.x) * smoothFactor;
    this.camera.y += (this.camera.targetY - this.camera.y) * smoothFactor;
    // the easing never loses him off the side: the aim keeps him in the view, but on a narrow view the eased camera trailed a quick swing
    // back by 60 px or more, and on 5-4's long silk lines upright (320 x 782) he swung out past the left edge (QA v200). The framing is
    // the aim's; this only keeps his whole body (and a little room) inside while the camera catches up (cameraFollow.ts keepHeroX)
    const teaK = this.teaAimK();
    const kept = keepHeroX(this.camera.x, p.x, vw);
    this.camera.x = kept + (this.camera.x - kept) * teaK;
    // (standing, never even for a moment while the view eases)
    if (p.grounded) this.camera.y = Math.min(this.camera.y, underHud(p.y, band));

    // Clamp camera within stage bounds
    this.camera.x = Math.max(0, Math.min(this.currentStage.config.levelWidth - vw, this.camera.x));
    const maxY = this.currentStage.config.levelHeight - vh;
    // a normal stage never shows past its top; a boss arena in a tall window may (the sky simply continues), and so may a puzzle room
    // pulled back further than the level is tall (upright): its foot stays the level's foot, the extra is sky over the top
    const overTop = this.currentStage.arena || this.mc || this.roomZoom < 1 || this.revealZoom < 1;
    this.camera.y = Math.max(overTop ? Math.min(0, maxY) - (this.mc ? 600 : 0) : 0, Math.min(maxY, this.camera.y));
  }

  /** the ledge he last stood on, the landing the view is showing, and how long it is kept once he has left the ground (s) */
  /** a stage down a cliff (w4.descent): the lowest ledge he has stood on, for its progress bar */
  private bestDropY = -Infinity;
  /** 4-7: the height the mist under the ledges starts at (eased after the ledge he stands on) */
  private abyssLip = NaN;
  private camLedge: Platform | null = null;
  private camLand: Box | null = null;
  private camLandKeep = 0;
  /**
   * The landing the view should show as well as him. A stage that runs along a set path (4-7 down the cliff: w4.route) shows the next
   * ledge on it wherever it is, above, across or straight below; any other stage, the nearest ledge or vine across the gap when he
   * stands near the end of his ledge. In the air it keeps the one he set off for a little while, so the jump ends where he saw it.
   */
  private landingToShow(dt: number): Box | null {
    const p = this.player;
    if (p.grounded && this.standingOnId >= 0) {
      if (this.camLedge?.id !== this.standingOnId) this.camLedge = this.platforms.find((q) => q.id === this.standingOnId) ?? null;
    }
    // swinging on a vine: where the swing will throw him, the way he faces (the way he lets go, physics.ts TIMED): the next vine or
    // ledge past this one (QA, 1-8 upright: the landing branch was off screen, and the bot let go blind)
    const sv = p.isVineSwinging ? this.nearSwingVine : null;
    if (sv) {
      const hang = { x: sv.x, width: 0, y: sv.topY + (p.swingLength ?? 100) + 30 };
      this.camLand = landingAhead(sv.x, this.camFacing, hang, this.platforms, this.vines.filter((v) => v !== sv));
      this.camLandKeep = 1.2;
      return this.camLand;
    }
    if (p.climbing || p.hanging) {
      this.camLand = null;
      return null;
    }
    const ledge = this.camLedge;
    const route = this.proto?.w4?.route;
    if (route && ledge) {
      const i = route.indexOf(ledge.id);
      const next = i >= 0 && i + 1 < route.length ? this.platforms.find((q) => q.id === route[i + 1]) : undefined;
      if (!next) return null;
      // a crossing too wide for one view (upright the view is only 620 wide): warm air in the gap is the first landing, shown from the
      // edge; once he is out over it, the ledge past it (Matt, 2026-10-26: every stage works upright too)
      const dirN = Math.sign(next.x + next.width / 2 - (ledge.x + ledge.width / 2)) || p.facing;
      const gapA = dirN > 0 ? ledge.x + ledge.width : next.x + next.width, gapB = dirN > 0 ? next.x : ledge.x;
      const across = (this.proto?.w4?.updrafts ?? []).find((u) => u.x0 >= gapA - 10 && u.x1 <= gapB + 10 && u.top < ledge.y + 40 && u.bottom > ledge.y);
      if (across && gapB - gapA > this.camera.viewportWidth * 0.75 && (dirN > 0 ? p.x < across.x0 : p.x > across.x1)) {
        return { x0: across.x0, x1: across.x1, y0: Math.min(across.top, ledge.y - 100), y1: ledge.y + 40 };
      }
      // (the near end of it, or the part right under him when it runs under his ledge: a turn)
      const x = Math.max(next.x + 40, Math.min(next.x + next.width - 40, p.x));
      const far = Math.hypot(x - p.x, next.y - p.y);
      if (far > this.camera.viewportWidth * 1.2) return null;
      return landingBox(x, next.y, Math.sign(next.x + next.width / 2 - p.x) || p.facing);
    }
    if (p.grounded && ledge && Math.abs(p.y - ledge.y) < 4) {
      this.camLand = landingAhead(p.x, p.facing, ledge, this.platforms, this.vines);
      this.camLandKeep = 1.2;
    } else if (!p.grounded) {
      this.camLandKeep -= dt;
      if (this.camLandKeep <= 0) this.camLand = null;
    }
    return this.camLand;
  }

  /**
   * which way letting go of a vine or a trunk leaps: the way the touch flick behind the press leaned, when it leaned 20 degrees or more
   * (touchGestures.ts leanSlant: one thumb flicking up and LEFT at the end of a pump to the right used to leap right, with the steer
   * still held right, and a flick up and right while he faced left threw him backward, QA 2026-10-26); then the held steer; then `fallback`
   */
  private leapDir(fallback: -1 | 1): -1 | 1 {
    const s = this.input.state;
    if (s.jumpLean) return s.jumpLean;
    return s.right ? 1 : s.left ? -1 : fallback;
  }

  /** a press to let go a beat before the swing's sweet spot toward `dir`: keep it and let go when he gets there (true = held, he swings on) */
  private holdLeapForSweet(dir: -1 | 1): boolean {
    if (this.swingLeapWait !== 0) {
      // already waited once: this is that press, let go now
      if (this.swingLeapWait < 0) this.swingLeapWait = 0;
      return false;
    }
    const p = this.player;
    const own = this.vines.find((v) => v.id === p.swingVineId);
    const sw = { angle: p.swingAngle || 0, omega: p.swingAngularVelocity || 0, len: p.swingLength || 100, amp: own ? vineAmp(own) : undefined };
    if (releaseCall(sw, dir, Infinity) !== 'early') return false;
    this.swingLeapWait = RELEASE.early;
    this.input.state.jumpPressed = false;
    return true;
  }

  /** look for the first of something new ahead of the hero a few times a second; when one is there, stop and let the app explain it */
  private lessonTick() {
    // (Meeca's stage has no Dot and no lesson cards: her own thoughts teach it, meecaPlay.ts)
    if (this.lessonOpen || this.isGameOver || this.mc) return;
    if ((this.lessonFrame = (this.lessonFrame + 1) % 6) !== 0) return;
    // a find picked up a moment ago: its reader opens as soon as stopping is safe (before any lesson), and a lesson leaves it a breather
    if (this.findsWaiting.length) {
      if (!this.safeToStop()) return;
      const fid = this.findsWaiting.shift()!;
      this.lessonQuietUntil = Math.max(this.lessonQuietUntil, this.gameTime + 3);
      this.lessonAt = this.gameTime;
      this.callbacks.onFind?.(fid);
      return;
    }
    if (this.gameTime < 2.5) return;
    // (the breather after a lesson: the swing's lesson cuts it short, see below)
    const quiet = this.gameTime < this.lessonQuietUntil;
    if (quiet && this.gameTime - this.lessonAt < 1) return;
    const st = this.currentStage;
    // not in a boss arena or the secret stage, and not in the middle of an entrance
    if (st.arena || st.config.secret || this.boss || this.entrance) return;
    if (!lessonsOn()) return;
    const seen = (this.lessonSeen ??= lessonsSeen());
    // a card that came due while he was busy keeps a while (after that, the next one of its kind brings it back)
    const p = this.player;
    // a lesson whose thing he has already done (a petal picked, a foe beaten) is learned: it is not said, now or later (lessons.ts
    // lessonDone); a waiting heart's lesson goes once he is back to full health
    const state = { enemies: this.enemies, collectibles: this.collectibles, hp: p.hp, maxHp: p.maxHp };
    for (const d of DONE_LESSONS) {
      if (!seen.has(d) && lessonDone(d, state)) {
        seen.add(d);
        markLessonSeen(d);
      }
    }
    if (this.lessonWaiting && (seen.has(this.lessonWaiting.id) || lessonStale(this.lessonWaiting.id, state) || this.gameTime - this.lessonWaiting.at > 8)) this.lessonWaiting = null;
    const cam = this.camera;
    const picked = pickLesson(
      {
        px: p.x,
        py: p.y,
        view: { x0: cam.x, x1: cam.x + cam.viewportWidth, y0: cam.y, y1: cam.y + cam.viewportHeight },
        enemies: this.enemies,
        collectibles: this.collectibles,
        // (World 5's silk lines are taught by its own tip, in silk words, with the let-go said while he swings: w5Lines.ts w5.silk. The
        // vine lesson's "Flick up into the vine to grab it" came at 5-4's first silk line, QA v198)
        vines: this.w5 ? (this.lessonVines ??= this.vines.filter((v) => !v.silk)) : this.vines,
        platforms: this.platforms,
        checkpoints: st.checkpoints ?? [],
        rivers: st.rivers ?? [],
        ropes: this.skills.has('shimmy') ? this.ropes : [],
        hp: p.hp,
        maxHp: p.maxHp,
      },
      seen,
    );
    // a swinging vine within reach is taught now, ahead of a card still waiting and after only a short breather from the last lesson:
    // grabbing, pumping and letting go are all needed the moment he jumps for it (QA, 1-6, 2026-10-26: a gap card just before the vine
    // left the swing's lesson waiting until after his first let-go)
    const id = picked === 'swing' ? picked : this.lessonWaiting?.id ?? picked;
    // (nor is a danger's lesson held back by the breather after a harmless one: the petals' lesson at 2.6 s held the gap's back for six
    // seconds, past the first gap of 1-8 and 2-2's first river, QA 2026-10-28)
    if (!id || (quiet && id !== 'swing' && !(this.lessonLast && HARMLESS_LESSONS.has(this.lessonLast) && !HARMLESS_LESSONS.has(id)))) return;
    // only when stopping cannot hurt him: standing or holding on, not hurt, no foe at hand, nothing falling on him (lessons.ts cardSafe).
    // The swing's lesson may also come on the vine: a liana keeps swinging with no thumb, and a lesson that waited for him to land came
    // only after his first let-go, when grabbing, pumping and letting go had all been needed already (QA, 1-6, 2026-10-26)
    if (!this.safeToStop(id === 'swing')) {
      this.lessonWaiting ??= { id, at: this.gameTime };
      return;
    }
    this.lessonWaiting = null;
    seen.add(id);
    markLessonSeen(id);
    // no card and no pause: the lesson is one of Dot's lines, said in play (dotGuide.ts)
    this.lessonQuietUntil = this.gameTime + 6;
    this.lessonAt = this.gameTime;
    this.lessonLast = id;
    this.callbacks.onLesson?.(id);
  }

  /** what Dot's guide needs to see, filled into `out` in place (nothing is allocated: it runs every frame) */
  public guideView(out: GuideView): GuideView {
    const p = this.player;
    const cam = this.camera;
    const cfg = this.currentStage.config;
    out.live = !this.isGameOver;
    out.flight = !!this.dotRun;
    out.slide = !!this.slideRun?.sliding;
    out.stageId = cfg.id;
    out.t = this.gameTime;
    out.paused = this.isPaused;
    out.zoom = this.zoom;
    out.camX = cam.x;
    out.camY = cam.y;
    out.cssW = this.viewCssW;
    out.cssH = this.viewCssH;
    out.px = p.x;
    // (swimming, he is drawn high in the water, his head well over its top: the box the bubbles keep clear of is where he shows)
    out.py = p.swim ? p.swim.surfaceY + 2 : p.y;
    out.pw = p.width;
    out.ph = p.height;
    out.vx = p.vx;
    out.vy = p.vy;
    out.facing = p.facing;
    out.grounded = p.grounded;
    out.climbing = p.climbing;
    out.swinging = !!p.isVineSwinging;
    out.hanging = !!p.hanging;
    out.ducking = p.ducking;
    out.gliding = this.glide.on;
    out.pushing = !!p.pushing;
    out.doubleJumping = p.isDoubleJumping;
    out.attack = p.attackType;
    out.hurt = p.invincibleTimer > 0 && p.activePowerUp !== 'invincible';
    out.hp = p.hp;
    out.maxHp = p.maxHp;
    out.lives = this.lives;
    out.lostTo = this.lostTo;
    out.kickNear = this.input.kickNear;
    out.boss = !!this.boss || !!this.currentStage.arena;
    out.chase = !!this.chase;
    out.levelH = cfg.levelHeight;
    out.enemies = this.enemies;
    out.platforms = this.platforms;
    out.vines = this.vines;
    out.ropes = this.ropes;
    out.collectibles = this.collectibles;
    out.hazards = this.hazards;
    out.bushes = this.proto?.bushes ?? out.bushes;
    out.w5 = this.w5?.guideThings ?? NO_W5_THINGS;
    out.kit = this.kit?.guideThings ?? NO_W5_THINGS;
    out.popups = this.floatingTexts;
    // (a boss's open weak spot, for Dot to keep her bubble off: copied into the view, no new object)
    const bs = this.boss;
    const bd = this.bossDef;
    const ar = this.currentStage.arena;
    const wr = bs && bd && ar && !bs.defeated && weakOpen(bs, bd) ? weakRect(bs, bd, ar.floor) : null;
    out.weakOn = !!wr;
    out.bossX = bs && !bs.defeated ? bs.x : NaN;
    if (wr) {
      out.weakX = wr.x;
      out.weakY = wr.y;
      out.weakW = wr.w;
      out.weakH = wr.h;
    }
    return out;
  }

  /** is it safe to stop the stage for a card right now? (lessons.ts cardSafe) */
  /** `swinging`: a swinging vine counts as holding on (for the swing's own lesson) */
  private safeToStop(swinging = false): boolean {
    const p = this.player;
    let foeDx = Infinity;
    let foeDy = Infinity;
    for (const e of this.enemies) {
      if (e.defeated) continue;
      const dx = e.x - p.x;
      const dy = e.y - p.y;
      if (Math.abs(dy) < 400 && Math.abs(dx) < Math.abs(foeDx)) {
        foeDx = dx;
        foeDy = dy;
      }
    }
    let hazard = Infinity;
    for (const h of this.hazards) hazard = Math.min(hazard, Math.hypot(h.x - p.x, h.y - p.y));
    // World 4's falling rocks: one warning or falling just above him
    for (const r of this.proto?.w4?.rocks ?? []) {
      if (Math.abs(r.x - p.x) > 140) continue;
      const ph = rockAt(r, this.gameTime).phase;
      if (ph === 'warn' || ph === 'fall') hazard = 0;
    }
    // standing on a branch that has started to crumble
    if (p.grounded) {
      for (const pl of this.platforms) {
        if (pl.type === 'fragile' && pl.fragileTimer !== undefined && !pl.broken && p.x >= pl.x - 4 && p.x <= pl.x + pl.width + 4 && Math.abs(p.y - pl.y) < 6) hazard = 0;
      }
    }
    return cardSafe({
      grounded: p.grounded && Math.abs(p.vy) < 1,
      holding: ((p.climbing || !!p.hanging) && !p.isVineSwinging) || (swinging && !!p.isVineSwinging),
      hurt: p.invincibleTimer > 0,
      foeDx,
      foeDy,
      hazard,
    });
  }

  /** the app has closed a lesson card: carry on, and leave a few seconds before the next one */
  public lessonClosed() {
    if (!this.lessonOpen) return;
    this.lessonOpen = false;
    this.lessonQuietUntil = this.gameTime + 4;
    this.lessonAt = this.gameTime;
    this.resume();
  }

  /** the touch jump help in force: only for the Screen gestures (the keyboard, a pad and the on-screen Pad keep their own exact feel) */
  private touchHelp(): 'off' | 'keep' | 'forward' {
    return this.input.source === 'gesture' ? jumpHelp() : 'off';
  }

  /** he has just jumped (`second`: double jumped). A plain jump is as it always was; a second jump taken with nothing steering pushes forward the way he faces, except where a drift would hurt (the climbing and boss stages) */
  /** the calm water of this stage (swim.ts): today, the water a puzzle room's raft floats in (6-7's well) */
  private calmPools(): CalmPool[] {
    return kitPools(this.kit, this.platforms);
  }

  /**
   * One frame in calm water (swim.ts swimStep): the thumb swims him left and right, down dives, a flick up leaps out, moving into a bank
   * climbs out onto it. False (and he is out of the water) when there is no water deep enough under him any more: it drained.
   */
  private swimMove(dt: number): boolean {
    const p = this.player;
    const w = poolAt(this.calmPools(), p.x);
    if (!w || !deepEnough(w)) {
      p.swim = undefined;
      return false;
    }
    const inp = this.input.state;
    const steer = this.inputGrace > 0 ? 0 : inp.left ? -1 : inp.right ? 1 : 0;
    const r = swimStep(p, this.swimSt, w, { steer, down: inp.down, jump: inp.jumpPressed }, dt, this.platforms);
    p.grounded = false;
    p.ducking = false;
    p.isDoubleJumping = false;
    p.somersaultAngle = 0;
    if (r.kind === 'leap') {
      // a full leap out (a quick thumb never cuts it short), and one more flick in the air
      inp.jumpPressed = false;
      p.swim = undefined;
      p.jumpsLeft = 1;
      this.launched = true;
      this.coyoteTimer = 0;
      this.jumpBufferTimer = 0;
      p.squashX = 0.82;
      p.squashY = 1.28;
      this.takeOff(false);
      sound.playJump();
      this.spawnWaterSplash(p.x, w.surfaceY);
    } else if (r.kind === 'out') {
      // up onto the bank he swam into
      p.swim = undefined;
      p.grounded = true;
      p.jumpsLeft = 2;
      p.squashX = 1.12;
      p.squashY = 0.88;
      sound.playTreeClimb();
      this.spawnWaterSplash(p.x - p.facing * 24, w.surfaceY);
    } else {
      const first = p.swim?.first !== undefined && this.swimSt.firstLeft > 0 ? SWIM.firstFor - this.swimSt.firstLeft : undefined;
      p.swim = { surfaceY: w.surfaceY, under: underOf(w, p.y), ...(first !== undefined ? { first } : {}) };
    }
    return true;
  }

  /**
   * Into calm water and out of it, after the frame's moving: falling (or set down) into water deep enough, hands free, he swims; standing
   * on something, climbing, or holding something heavy, he is out. The first time a stage, the first-swim moment and Dot's lines.
   */
  private swimCheck(dt: number) {
    const p = this.player;
    while (this.swimLines.length && this.gameTime >= this.swimLines[0].at) {
      const l = this.swimLines.shift()!;
      this.guide(l.text, l.s);
    }
    // the camera eases in on him in the water (further for the first-swim moment), and back out on land
    const want = p.swim ? (p.swim.first !== undefined ? SWIM_CAM.first : SWIM_CAM.swim) : 1;
    const was = this.swimZoom;
    this.swimZoom += (want - this.swimZoom) * Math.min(1, dt * SWIM_CAM.ease);
    if (Math.abs(want - this.swimZoom) < 0.002) this.swimZoom = want;
    if (this.swimZoom !== was) this.applyZoom();
    const busy = p.climbing || !!p.hanging || !!p.isVineSwinging || !!this.kit?.holding || this.isGameOver;
    if (p.swim) {
      if (busy || p.grounded) p.swim = undefined;
      return;
    }
    const w = poolAt(this.calmPools(), p.x);
    if (!startsSwim(w, p.y, p.vy, busy)) return;
    const first = !this.swamYet;
    this.swamYet = true;
    p.vy *= SWIM.splash;
    // (the first time he all but stops where he splashed in: the moment plays on the spot)
    p.vx *= first ? 0.15 : 0.5;
    p.grounded = false;
    this.swimSt = { diveT: 0, firstLeft: first ? SWIM.firstFor : 0 };
    p.swim = { surfaceY: w.surfaceY, under: underOf(w, p.y), ...(first ? { first: 0 } : {}) };
    this.spawnWaterSplash(p.x, w.surfaceY);
    sound.playWhoosh();
    recorder.event('swim', Math.round(p.x));
    if (first) {
      // the moment: a big splash, a beat under it, then the flail turns into the grin (heroSwim.ts), and his line after the beat
      this.spawnWaterSplash(p.x - 18, w.surfaceY);
      this.spawnWaterSplash(p.x + 18, w.surfaceY);
      this.camera.trauma = Math.min(1, this.camera.trauma + 0.18);
      this.swimLines = [
        { at: this.gameTime + SWIM.firstLine, text: SWIM_LINES.first, s: SWIM_FIRST_LINE },
        { at: this.gameTime + SWIM.firstLine + SWIM_FIRST_LINE, text: SWIM_LINES.out, s: 3.5 },
      ];
    }
  }

  /** the calm water: behind him (`front` false) or its veil in front of him, with the ring round him and his bubbles */
  private drawCalmWater(ctx: CanvasRenderingContext2D, front: boolean) {
    const p = this.player;
    for (const w of this.calmPools()) {
      if (w.x1 < this.camera.x - 40 || w.x0 > this.camera.x + this.camera.viewportWidth + 40) continue;
      const mine = p.swim && p.x > w.x0 && p.x < w.x1;
      const who = mine ? { x: p.x, headY: swimHeadY(p), under: p.swim!.under, stroke: Math.min(1, Math.abs(p.vx) / SWIM.speed) } : undefined;
      const drew = front ? drawCalmWaterFront(ctx, w, this.gameTime, who) : drawCalmWaterBack(ctx, w, this.gameTime);
      if (!drew) drawCalmWaterPlain(ctx, w, front);
    }
  }

  /** this frame, the drawn step back at a ledge's end (edgeOffset): applied to where he is drawn, p.drawDx */
  private edgeTarget = 0;
  /**
   * He stands still with his middle past the end of the platform under him, and nothing at that height carries on beyond it: how far to
   * DRAW him back from where he stands (px, - toward the left), so his middle shows EDGE.inset inside the end and at most about a quarter
   * of him over the air (QA, 2-6, 2026-10-29: "he stands in the air"); 0 otherwise. Only the picture moves: his footing, every jump from
   * that edge, coyote time and the landing forgiveness are exactly as before (moving him back cost 4-4 a liana jump, w4RealReach).
   */
  private edgeOffset(): number {
    const p = this.player;
    if (!p.grounded || p.climbing || p.hanging || p.isVineSwinging || p.ducking || p.pushing) return 0;
    const plat = this.platforms.find((q) => q.id === this.standingOnId);
    if (!plat || plat.type === 'drift' || plat.width < EDGE.inset * 2 + 8) return 0;
    const carriesOn = (x: number) => this.platforms.some((q) => q !== plat && !q.broken && Math.abs(q.y - plat.y) <= 3 && x >= q.x && x <= q.x + q.width);
    const r = plat.x + plat.width;
    if (p.x > r - EDGE.inset && !carriesOn(r + 2)) return r - EDGE.inset - p.x;
    if (p.x < plat.x + EDGE.inset && !carriesOn(plat.x - 2)) return plat.x + EDGE.inset - p.x;
    return 0;
  }

  private takeOff(second: boolean) {
    // (a touch or Pad jump's minimum hold counts from now, in game time: CT-12)
    (this.input as { noteTakeOff?: () => void }).noteTakeOff?.();
    const help = this.touchHelp();
    if (help === 'off') return;
    const inp = this.input.state;
    const steer = this.inputGrace > 0 ? 0 : inp.left ? -1 : inp.right ? 1 : 0;
    const kind = this.currentStage.config.objectiveType;
    airTakeOff(this.airDrive, steer, this.player.facing, second, help === 'forward' && kind !== 'ascent' && kind !== 'boss_lair');
    // World 5: a plain flick up with the thumb off the glass, standing right at a step one jump climbs, lands on it. One thumb lifts
    // to flick, so he jumped straight up beside the step and came down where he began: in the soft pits' dips QA's one-thumb player
    // stayed stuck, and only an up-and-right flick now and then got out (v198, 2026-10-26). A one-step ledge takes one ordinary jump.
    if (!second && steer === 0 && this.stepHelp) {
      const lean = inp.jumpLean ?? 0;
      const face: -1 | 1 = this.player.facing >= 0 ? 1 : -1;
      // (the way the flick leaned first; then, with no step that way, the way he faces. A thumb's flick leans 20 to 40 degrees either
      // way by chance, and one that leaned away from the step he faced went straight up and down: QA's sideways player, v198, at every
      // soft pit's lip, one try in two)
      const dir = lean !== 0 && this.stepAt(lean) ? lean : face;
      if (this.stepAt(dir)) {
        this.airDrive.drive = dir;
        this.airDrive.lean = true;
        this.player.facing = dir;
      }
    }
  }

  /** a step one plain jump climbs (STEP_UP), right against him on the `dir` side, standing on the ground */
  private stepAt(dir: -1 | 1): boolean {
    const p = this.player;
    for (const q of this.platforms) {
      if (q.type !== 'solid' || q.broken || q.height < 50) continue;
      const near = dir > 0 ? q.x - (p.x + 19) : p.x - 19 - (q.x + q.width);
      if (near < -2 || near > STEP_UP.near) continue;
      const rise = p.y - q.y;
      if (rise >= STEP_UP.min && rise <= STEP_UP.max && q.y + q.height >= p.y - 12) return true;
    }
    return false;
  }

  /** how much early-stage help is in force on this stage (1 on stage 1-1, fading to 0 by stage 25) */
  private assistNow(): number {
    const c = this.currentStage.config;
    // Easy keeps the first stage's help (the longer ledge grace, the stronger second jump, the wider landing) the whole game
    if (isEasy()) return 1;
    // (and just after a switch from Easy, it fades out over five stages: difficulty.ts easeInShare, LV-7)
    if (this.easeIn < 0) this.easeIn = easeInShare(c.id);
    return Math.max(easeAssist((c.worldIndex - 1) * 10 + c.miniIndex), this.easeIn);
  }

  /**
   * Main Render Pass
   */
  public render() {
    const ctx = this.ctx;
    const dpr = this.renderDpr();
    const world = WORLDS_DATA[this.currentStage.config.worldIndex - 1] || WORLDS_DATA[0];
    // (a sheet of this stage's that has just arrived: drawn once into the corner, under this frame)
    this.arrivals.frame(ctx);

    ctx.save();
    ctx.scale(dpr * this.zoom, dpr * this.zoom);

    // Clean viewport clearing to prevent any screen flicker or ghosting
    ctx.clearRect(0, 0, this.camera.viewportWidth, this.camera.viewportHeight);
    if (this.dotRun) {
      this.renderDot(ctx, dpr);
      ctx.restore();
      return;
    }
    if (this.slideRun?.sliding) {
      this.slideRun.draw(ctx, this.viewCssW, this.viewCssH, dpr);
      ctx.restore();
      return;
    }

    // the screen shake: a smooth wobble that dies away with the trauma, turned down or off in the settings (screenShake.ts, AN-10)
    // (on the real clock: in a hit's freeze the game clock stops, and the shake must keep settling, not hang off to one side)
    const { x: shakeX, y: shakeY } = shakeOffset(this.camera.trauma, performance.now() / 1000, 16);

    // 1. Render Multi-Layer Parallax Background
    // a boss with its own lair: either the backdrop is darkened and re-lit, or (lairOwnsScene) the lair paints all of it itself
    const lair = this.currentStage.arena && this.bossDef?.lair ? this.bossDef.lair : null;
    const ownScene = !!lair && lairOwnsScene(lair);
    // up in the trees the backdrop is the canopy: all of 1-8's long branch, and 1-4's climb fading over to it as he goes up
    setCanopy(this.proto?.chase ? 1 : this.proto && this.currentStage.config.objectiveType === 'ascent' ? (this.currentStage.spawnY - this.player.y - 1200) / 2600 : 0);
    // (the backdrop shakes with the world, each layer by its own depth, so the layers never slide against each other)
    if (!ownScene) renderScenery(ctx, world.id, this.camera.x - shakeX, this.camera.y - shakeY, this.camera.viewportWidth, this.camera.viewportHeight, this.gameTime, this.quality > 0);
    // 4-7: under the ledges is a long drop into the mist, never the painted ground (w4Play drawAbyss)
    if (this.proto?.w4?.deepFall !== undefined) {
      const lipY = this.camLedge?.y ?? this.player.y;
      this.abyssLip = Number.isFinite(this.abyssLip) && Math.abs(this.abyssLip - lipY) < 2000 ? this.abyssLip + (lipY - this.abyssLip) * 0.12 : lipY;
      drawAbyss(ctx, this.camera.viewportWidth, this.camera.viewportHeight, this.abyssLip - this.camera.y, this.gameTime);
    }
    const lairView = { x: this.camera.x, y: this.camera.y, vw: this.camera.viewportWidth, vh: this.camera.viewportHeight };
    if (lair && this.currentStage.arena) drawLairBack(ctx, lair, lairView, this.currentStage.arena, this.gameTime, this.boss?.x ?? this.currentStage.arena.right, this.boss?.phase ?? 1);

    // the secret Hollow is a dusk of purple thorn-light
    if (this.currentStage.config.secret) {
      ctx.fillStyle = 'rgba(46, 16, 101, 0.5)';
      ctx.fillRect(0, 0, this.camera.viewportWidth, this.camera.viewportHeight);
    }

    // 2. Render In-World Game Elements with Camera Transform
    ctx.save();
    // (snapped to whole device pixels: whole CSS pixels moved the world in steps of three on a phone while he moved smoothly)
    const snap = dpr * this.zoom;
    ctx.translate(-snapCam(this.camera.x, snap) + shakeX, -snapCam(this.camera.y, snap) + shakeY);

    this.drawWaterAndFlags(ctx, world);
    // 6-8: the root wall and the hides and arches behind the climb
    if (this.proto?.stilt) drawStiltDecor(ctx, this.proto.stilt, { x0: this.camera.x, x1: this.camera.x + this.camera.viewportWidth, y0: this.camera.y, y1: this.camera.y + this.camera.viewportHeight });
    this.drawRivers(ctx, world, false);
    // 2-6: the river bank the village is dug into, behind the whole climb
    if (this.proto?.bankWall)
      drawEarthWall(ctx, this.proto.bankWall, { x0: this.camera.x, x1: this.camera.x + this.camera.viewportWidth, y0: this.camera.y, y1: this.camera.y + this.camera.viewportHeight });

    // the bounce mushrooms wear the gold rim too (they sit in the scenery's colours)
    for (const pl of this.platforms) {
      if (pl.type !== 'bouncy' || pl.broken) continue;
      if (pl.x + pl.width < this.camera.x - 60 || pl.x > this.camera.x + this.camera.viewportWidth + 60) continue;
      ctx.save();
      ctx.translate(pl.x + pl.width / 2, pl.y + 2);
      drawAura(ctx, 'take', world.id, pl.width * 0.55, 30, this.gameTime, pl.x * 0.013);
      ctx.restore();
    }

    // Matt's World 3 and 4 puzzle sheets set in behind the ground (artDress.ts: World 4's far rope bridge, the broken one's ends)
    if (this.proto?.kitDecor) drawKitDecor(ctx, this.proto.kitDecor, { x0: this.camera.x, x1: this.camera.x + this.camera.viewportWidth, y0: this.camera.y, y1: this.camera.y + this.camera.viewportHeight }, this.player.x, true);
    // World 4's pieces that stand back behind the ground (4-3's pool basins)
    this.w4?.drawUnder(ctx, { x0: this.camera.x, x1: this.camera.x + this.camera.viewportWidth });
    // Render In-World Trees, Vines and Platforms
    if (ownScene && lair) drawLairObjects(ctx, lair, this.platforms, this.vines, this.currentStage.trees, this.camera, this.gameTime);
    else renderWorldObjects(
      ctx,
      world.id,
      this.withoutPaintedLogs(world.id, this.paintKit && protoArtReady() ? this.paintedPlats : this.drawPlats),
      this.paintKit && protoArtReady() ? this.swingVines : this.vines,
      this.paintKit && protoArtReady() ? [] : this.currentStage.trees,
      this.camera,
      this.gameTime
    );

    // World 2's painted drifting logs (the drawn ones were left out above), under the water's sheet so they sit in the river
    if (this.riverLogsPainted(world.id)) {
      for (const pl of this.platforms) if (pl.type === 'drift' && !pl.broken && this.onScreen(pl.x + pl.width / 2, pl.y, pl.width)) drawRiverLog(ctx, pl, this.gameTime);
    }
    // a ripple where the next log is about to slide out from under the bank, so it never appears without warning
    for (const pl of this.platforms) {
      const d = pl.drift;
      if (pl.type !== 'drift' || !d || pl.broken) continue;
      const travelled = driftProgress(d, logClock(this.currentStage.rivers, d, this.gameTime)) * driftCycle(d) * d.speed;
      const lead = d.speed * 1.1;
      if (travelled > d.width || travelled < d.width - lead) continue;
      const ex = d.dir === 1 ? d.x0 + 18 : d.x1 - 18;
      if (!this.onScreen(ex, d.baseY, 80)) continue;
      drawLogComing(ctx, ex, d.baseY + LOG_DROP - 10, 1 - (d.width - travelled) / lead, this.gameTime);
    }
    this.drawRivers(ctx, world, true);
    // 7-3's ring of stone chairs, behind the courtyard's floor (w7ChairsArt.ts)
    const w7chairs = (this.proto?.gen2 as { w7?: { chairs?: Array<{ x: number; b: number }> } } | undefined)?.w7?.chairs;
    if (w7chairs) drawW7Chairs(ctx, w7chairs, this.camera.x, this.camera.x + this.camera.viewportWidth);
    if (!(this.paintKit && drawProtoScene(ctx, this.platforms, this.currentStage.trees, this.proto?.ladders ? this.swingVines : this.plainVines, this.gameTime, { x0: this.camera.x, x1: this.camera.x + this.camera.viewportWidth, y0: this.camera.y, y1: this.camera.y + this.camera.viewportHeight + 60 }, this.protoScene)))
      for (const lg of this.pushLogs) if (this.onScreen(lg.x + lg.width / 2, lg.y, 200)) drawPushLog(ctx, lg, this.gameTime);
    // 6-8: its ledges in Matt's other World 6 pieces (over the roots that top out on them, as the kit's planks are)
    if (this.proto?.stiltLedges) drawStiltLedges(ctx, this.proto.stiltLedges, { x0: this.camera.x, x1: this.camera.x + this.camera.viewportWidth, y0: this.camera.y, y1: this.camera.y + this.camera.viewportHeight });
    // 6-8's crown: a warm light behind him as the view pulls back, so he stands out against the ruins at dusk (the lead's review)
    if (this.proto?.reveal && this.revealZoom < 1) {
      const p = this.player;
      const k = Math.min(1, (1 - this.revealZoom) / 0.1);
      const g = ctx.createRadialGradient(p.x, p.y - 34, 8, p.x, p.y - 34, 120);
      g.addColorStop(0, `rgba(255, 226, 160, ${0.7 * k})`);
      g.addColorStop(0.45, `rgba(255, 200, 120, ${0.32 * k})`);
      g.addColorStop(1, 'rgba(255, 190, 100, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(p.x - 124, p.y - 158, 248, 248);
    }
    // 2-8: a rising river's water over the reed islands it has covered (the scene above paints the islands on top of the water)
    if (this.floodAt.size) this.drawRivers(ctx, world, true, true);
    // World 2's basket lifts (2-7): the crane, the ropes and the basket where it is now (over the ground, so the basket shows at the bottom)
    for (const pl of this.platforms) if (pl.lift && this.onScreen(pl.x + pl.width / 2, (pl.lift.top + pl.lift.bottom) / 2, 400)) drawW2Lift(ctx, pl, !!pl.lift.postRight);
    // 2-6: the village's ladders where the climbs are
    if (this.proto?.ladders) {
      for (const v of this.vines) if (v.vineType === 'tree_climb' && this.onScreen(v.x, (v.topY + v.bottomY) / 2, (v.bottomY - v.topY) / 2 + 200)) drawLadder(ctx, v.x, v.topY, v.bottomY);
    }
    // World 2: lily pads on the water, then the village and the reeds behind Pokey (riverArt.ts)
    if (this.paintedRivers(this.currentStage.config.worldIndex) && riverArtReady()) {
      for (const pl of this.platforms) if (pl.lily && this.onScreen(pl.x + pl.width / 2, pl.y, pl.width)) drawLily(ctx, pl.x + pl.width / 2, pl.y + 8, pl.width * 1.15, this.gameTime, pl.id % 2 === 1);
    }
    if (this.proto?.decor) drawW2Decor(ctx, this.proto.decor, this.camera.x, this.camera.x + this.camera.viewportWidth, this.gameTime, false);
    if (this.proto?.w3decor) drawW3Decor(ctx, this.proto.w3decor, this.camera.x, this.camera.x + this.camera.viewportWidth, this.gameTime, false, (id) => this.glowLit(id), (id) => !!this.platforms.find((pl) => pl.id === id)?.broken);
    // Matt's World 3 and 4 puzzle sheets set in as dressing (artDress.ts)
    if (this.proto?.kitDecor) drawKitDecor(ctx, this.proto.kitDecor, { x0: this.camera.x, x1: this.camera.x + this.camera.viewportWidth, y0: this.camera.y, y1: this.camera.y + this.camera.viewportHeight }, this.player.x, false, (id) => this.kit?.roomDone(id) ?? {});
    // Worlds 1, 2 and 5: the bank, hanging and clutter sets (artDress.ts dressSets)
    if (this.proto?.dress) drawDress(ctx, this.proto.dress, { x0: this.camera.x, x1: this.camera.x + this.camera.viewportWidth, y0: this.camera.y, y1: this.camera.y + this.camera.viewportHeight });
    // World 3's sleeping thorn vines (thornVine.ts)
    for (let i = 0; i < (this.proto?.thorns?.length ?? 0); i++) {
      const v = this.proto!.thorns![i];
      if (!this.onScreen(v.x, (v.top + v.bud) / 2, 400)) continue;
      const ph = vinePhase(v, this.gameTime);
      const l = this.vineLash.get(i);
      // (listening to the kit's noise, it looks toward the noise: noise.ts)
      const ear = this.kit ? heard(this.kit.noises, v.x, v.bud, this.gameTime) : null;
      // (struck at it, it hangs tangled while it listens: harmless, it sees nobody then)
      const knot = ear && !l && this.vineStruck.get(i) === ear.t ? Math.max(0, ear.t + NOISE.dur - this.gameTime) : -1;
      drawThornVine(ctx, v, ph.phase, ph.u, l ? (this.gameTime - l.at) / (VINE.windup + VINE.out) : -1, l ? l.dir : ear ? (ear.x >= v.x ? 1 : -1) : this.player.x >= v.x ? 1 : -1, this.gameTime, knot);
    }
    // 4-7: in the air, a shadow on the ledge he is coming down to
    if (this.proto?.w4?.deepFall !== undefined && !this.player.grounded && !this.player.climbing) {
      const p = this.player;
      let under = Infinity;
      for (const q of this.platforms) if (!q.broken && q.y >= p.y && q.y < under && p.x > q.x && p.x < q.x + q.width && q.y - p.y < this.proto.w4.deepFall) under = q.y;
      if (under < Infinity) drawLandingShadow(ctx, p.x, p.y, under);
    }
    this.w4?.drawBack(ctx, this.gameTime, { x0: this.camera.x, x1: this.camera.x + this.camera.viewportWidth, y0: this.camera.y, y1: this.camera.y + this.camera.viewportHeight }, this.currentStage.zones ?? [], this.platforms);
    this.w5?.drawBack(ctx, this.gameTime, { x0: this.camera.x, x1: this.camera.x + this.camera.viewportWidth });
    this.drawCalmWater(ctx, false);
    this.kit?.drawBack(ctx, { x0: this.camera.x, x1: this.camera.x + this.camera.viewportWidth });
    if (this.mc) drawMeecaBack(ctx, this.mc, { x0: this.camera.x, x1: this.camera.x + this.camera.viewportWidth }, this.gameTime);
    this.markKeepOuts();
    // World 3's glowworms, hanging over the dark (asleep until he stands still: stepGlowworms)
    for (const z of this.currentStage.zones ?? []) {
      if (z.kind !== 'dark' || !z.lights) continue;
      for (const l of z.lights) {
        if (!l.sleep || !this.onScreen(l.x, l.y, 200)) continue;
        const at = this.glowWake.get(l.id ?? -1);
        drawGlowworm(ctx, l.x, l.y - GLOWWORM_H / 2, at === undefined || this.gameTime < at ? -1 : this.gameTime - at, this.gameTime, l.id ?? 0);
      }
    }
    if (this.chase) this.drawChase(ctx);
    // trunk hollows (1-4): over the trunk, glowing once he is close enough to see in
    for (const h of this.proto?.hollows ?? []) {
      if (this.onScreen(h.x, h.y, 260)) drawHollowArt(ctx, h.x, h.y, Math.hypot(this.player.x - h.x, this.player.y - 30 - h.y) < 230);
    }
    drawCrumbleTiles(ctx, this.platforms, { x: this.camera.x, y: this.camera.y, w: this.camera.viewportWidth, h: this.camera.viewportHeight }, this.gameTime);
    drawZoneBases(ctx, this.currentStage.zones, { x: this.camera.x, y: this.camera.y, w: this.camera.viewportWidth, h: this.camera.viewportHeight }, this.gameTime);
    if (lair && this.currentStage.arena) drawLairWorld(ctx, lair, this.currentStage.arena, lairView, this.gameTime);

    // Shimmy ropes (behind the hero)
    if (this.ropes.length) {
      drawRopes(ctx, this.ropes, this.gameTime, { load: this.ropeLoad.amt > 0 ? this.ropeLoad : undefined });
    }

    // Render Collectibles
    this.collectibles.forEach((item) => {
      if (!this.onScreen(item.x, item.y, 260)) return;
      if (this.w5?.shut(item)) return;
      // World 5's painted pink bell (Pell's note) and the painted exit totem
      if (this.w5?.drawItem(ctx, item, this.gameTime, this.currentStage.config.worldIndex)) return;
      if (item.type === 'seed') {
        if (!item.collected && !drawSeedArt(ctx, item, this.gameTime)) drawSeed(ctx, item, this.gameTime);
        return;
      }
      // a reed cage hanging over the water: the kit draws it (puzzlePlay.ts), and the little one hopping home once it is free
      if (item.type === 'cage' && this.kit?.holdsCage(item)) {
        if (item.collected) drawW2Cage(ctx, item, this.gameTime, true);
        return;
      }
      // World 2's painted reed cages, and the little one hopping home once it is free
      if (item.type === 'cage' && item.critter && drawW2Cage(ctx, item, this.gameTime)) return;
      // 4-8's eaglets in their nests, the netting over them, and their parents (w4Nests.ts)
      if (item.type === 'cage' && item.critter === 'eaglet') return drawNest(ctx, item, this.gameTime);
      drawCollectible(ctx, item, this.gameTime, this.currentStage.config.worldIndex, this.currentStage.config.miniIndex);
    });

    // Render Meeca if present in level
    if (this.currentStage.daisyX !== undefined && this.currentStage.daisyY !== undefined) {
      // the painted Meeca (scared while she is held, cheering once rescued), else the vector one
      let paintedJen = false;
      if (jennifurSpriteReady()) {
        ctx.save();
        ctx.translate(this.currentStage.daisyX, this.currentStage.daisyY);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.3)';
        ctx.beginPath();
        ctx.ellipse(0, 0, 22, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        paintedJen = drawJennifurSprite(ctx, this.daisyRescued ? 'cheer' : 'scared', this.gameTime, 0.8);
        ctx.restore();
      }
      if (!paintedJen) {
        drawGirlfriendDaisy(
          ctx,
          this.currentStage.daisyX,
          this.currentStage.daisyY,
          this.gameTime,
          this.daisyRescued
        );
      }
    }

    // polish prototype: this stage's lighting rig (null when the switch is off)
    const rig: Rig | null = polishEnabled() && polishTier() < 2 ? rigFor(lookFor(world.id), world.id, getSceneSeed()) : null;
    if (rig) {
      // fliers throw a shadow on the ground below them (walkers already carry their own)
      for (const e of this.enemies) {
        if (e.defeated || e.type !== 'eagle' || !this.onScreen(e.x, e.y, 300)) continue;
        drawGroundShadow(ctx, rig, this.platforms, e.x, e.y + e.height * 0.5, e.width * 0.45, 0.8);
      }
    }

    // Render Enemies
    this.enemies.forEach((enemy) => {
      if (enemy.defeated && enemy.koTimer > (enemy.koLife ?? 0)) return;
      if (!this.onScreen(enemy.x, enemy.y, 400)) return;
      if (!enemy.defeated) {
        // the ember rim (see readable.ts): everything that can hurt you wears it
        ctx.save();
        ctx.translate(enemy.x, enemy.y);
        drawAura(ctx, 'danger', world.id, enemy.width * 0.8, enemy.height * 0.8, this.gameTime, enemy.id * 1.7);
        ctx.restore();
      }
      const draw = (ctx: CanvasRenderingContext2D) => {
        if (enemy.type === 'snake') {
          if (!drawGoldSnake(ctx, enemy, this.gameTime) && !drawSnakeSprite(ctx, enemy, this.gameTime)) drawTreeSnake(ctx, enemy, this.gameTime);
          if (enemy.state === 'sleep') this.drawSleepZ(ctx, enemy);
        } else if (enemy.type === 'eagle') {
          if (!drawEagleSprite(ctx, enemy, this.gameTime)) drawHarpyEagle(ctx, enemy, this.gameTime);
        } else if (enemy.type === 'ocelot') {
          // (World 7's Stone Sentry: a prowler's body, the sentry's painted clips)
          if (enemy.look === 'sentry' && drawSentrySprite(ctx, enemy, this.gameTime)) return;
          if (!drawOcelotSprite(ctx, enemy, this.gameTime)) drawOcelot(ctx, enemy, this.gameTime);
        } else if (enemy.type === 'jaguar') {
          if (!drawJaguarSprite(ctx, enemy, this.gameTime)) drawJaguar(ctx, enemy, this.gameTime);
        } else if (enemy.type === 'boa') {
          if (!drawBoaSprite(ctx, enemy, this.gameTime)) drawBoa(ctx, enemy, this.gameTime);
        } else if (enemy.type === 'caiman') {
          if (!drawCaimanSprite(ctx, enemy, this.gameTime)) drawCaiman(ctx, enemy, this.gameTime);
        } else if (enemy.type === 'tayra') {
          if (!drawTayraSprite(ctx, enemy, this.gameTime)) drawTayra(ctx, enemy, this.gameTime);
        } else if (enemy.type === 'turtle') {
          if (enemy.royal) {
            if (!drawGuardSprite(ctx, enemy, this.gameTime)) drawTurtle(ctx, enemy, this.gameTime);
          } else if (!drawTurtleSprite(ctx, enemy, this.gameTime)) drawTurtle(ctx, enemy, this.gameTime);
        } else if (enemy.type === 'harpy') {
          if (!drawHarpySprite(ctx, enemy, this.gameTime)) drawHarpyFallback(ctx, enemy, this.gameTime);
        } else if (enemy.type === 'frog') {
          if (!drawFrogSprite(ctx, enemy, this.gameTime)) drawHazardEntity(ctx, enemy, this.gameTime);
        } else if (enemy.type === 'spider') {
          // (World 5's jumping spiders: their trained clips, w5Play.ts)
          if (!this.w5?.drawSpider(ctx, enemy, this.gameTime, this.player.x) && !drawSpiderSprite(ctx, enemy, this.gameTime, this.player.x)) drawHazardEntity(ctx, enemy, this.gameTime);
        } else {
          drawHazardEntity(ctx, enemy, this.gameTime);
        }
      };
      this.drawWithReaction(ctx, enemy, draw);
    });

    // Render Boss
    if (this.skyPillars && this.currentStage.arena) {
      const a = this.currentStage.arena;
      const ang = chimeAngle(this.boss && !this.boss.defeated ? this.boss : null, this.gameTime);
      for (const dx of CHIME_POSTS) drawChimePost(ctx, a.left + dx, a.floor, ang);
    }
    if (this.boss && (!this.boss.defeated || this.bossDef?.ending) && this.bossDef) {
      const floor = this.currentStage.arena?.floor ?? 560;
      drawBossFighter(ctx, this.boss, this.bossDef, this.gameTime, this.currentStage.config.worldIndex, floor);
      drawGroundCues(ctx, this.boss, this.bossDef, floor, this.gameTime, 1, this.currentStage.arena ?? undefined);
      if (this.skyPillars && !this.boss.defeated && this.bossDef.stompSpot) drawBackCue(ctx, this.boss, this.bossDef.stompSpot, floor, this.gameTime);
      if (this.skyPillars && !this.boss.defeated) drawScreechCue(ctx, this.boss, floor, this.gameTime, (this.bossDef.moves.screech?.tell ?? 1) * (this.bossCtx?.tellMul ?? 1));
    }

    // Leaf Glide: he floats on a small leaf under his feet (it spreads when the glide starts and is gone after he lands)
    // (never once he stands or holds on: the frame he landed used to still draw it open under his feet)
    const gl = this.player;
    if (this.glideOpen > 0.02 && !gl.grounded && !gl.climbing && !gl.isVineSwinging && !gl.hanging) {
      const gp = this.player;
      const lean = Math.max(-1, Math.min(1, gp.vx / 285));
      const fade = this.glide.left < 0.3 ? 0.4 + this.glide.left * 2 : 1;
      if (!drawGlideSprite(ctx, gp.x, gp.y, this.glideOpen, this.gameTime, lean, fade)) drawGlideLeaf(ctx, gp.x, gp.y, this.glideOpen, this.gameTime, lean, fade);
    }
    if (this.proto?.watch) this.drawWatchBack(ctx);
    if (this.ringDrops.length) this.drawRingDrops(ctx);
    // the swing's sweet spot: a small warm glow on the vine where he holds it while letting go now would leap to the next vine (the
    // glints along the vine as well, step), painted once (sweetGlowPic), no ring round him and no per-frame blur
    if (this.player.isVineSwinging && this.sweetGlow > 0.03) {
      const gp = this.player;
      const k = this.sweetGlow;
      const r = 30 * (1 + 0.08 * Math.sin(this.gameTime * 18));
      const pic = sweetGlowPic();
      if (pic) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 0.9 * k;
        // (at his grip: he hangs from it, his toes at his place, heroVine.ts)
        const a = gp.swingAngle ?? 0;
        const hx = gp.x - Math.sin(a) * VINE_HANG;
        const hy = gp.y - Math.cos(a) * VINE_HANG;
        ctx.drawImage(pic, hx - r, hy - r, r * 2, r * 2);
        ctx.restore();
      }
    } else if (!this.player.isVineSwinging) this.sweetGlow = 0;
    // Render Hero Sloth
    heroClipsLive(true);
    // (and in World 5 a wobble while he pulls against the silk on him: w5Play.ts wobble)
    const drawOff = this.wallOff + (this.w5?.wobble(this.gameTime) ?? 0);
    const shiftOff = Math.abs(drawOff) > 0.3;
    if (shiftOff) {
      ctx.save();
      ctx.translate(drawOff, 0);
    }
    // carrying, throwing or setting down: Matt's carry poses (puzzlePlay.ts drawPokey)
    // (Meeca's stage: her own sheet draws her carrying, in the chair and on the silk: meecaArt.ts meecaPose)
    // (7-4's crumble: the floor's painted break and Matt's falling poses, w7SlideRun.ts)
    const kitPose = !!this.mc || (!!this.slideRun && this.slideRun.drawHero(ctx, this.player)) || (!!this.kit && this.kit.drawPokey(ctx, this.player));
    if (this.mc) drawMeecaHero(ctx, this.player, this.mc, this.kit, this.gameTime);
    else if (kitPose) { /* drawn */ }
    else if (rig) {
      const hp = this.player;
      drawGroundShadow(ctx, rig, this.platforms, hp.x, hp.y, 30 * (hp.ducking ? 1.3 : 1.05));
      drawBackGlow(ctx, rig, hp.x, hp.y - 38, 78, 0.13);
      if (this.quality === 0 && polishTier() === 0 && !pskip('lit')) drawLit(ctx, rig, dpr * this.zoom, hp.x, hp.y, (c) => drawHeroSloth(c, hp, this.gameTime));
      else drawHeroSloth(ctx, hp, this.gameTime);
    } else if (!kitPose) drawHeroSloth(ctx, this.player, this.gameTime);
    if (shiftOff) ctx.restore();
    this.kit?.drawFront(ctx, this.player, kitPose);
    this.drawCalmWater(ctx, true);
    heroClipsLive(false);
    if (this.proto?.bushes) this.drawBushes(ctx);
    if (this.proto?.decor) drawW2Decor(ctx, this.proto.decor, this.camera.x, this.camera.x + this.camera.viewportWidth, this.gameTime, true);
    if (this.proto?.w3decor) drawW3Decor(ctx, this.proto.w3decor, this.camera.x, this.camera.x + this.camera.viewportWidth, this.gameTime, true, (id) => this.glowLit(id), (id) => !!this.platforms.find((pl) => pl.id === id)?.broken);
    if (this.watchShadowAt) this.drawWatchShadow(ctx, this.watchShadowAt.x, this.watchShadowAt.a);
    this.w4?.drawFront(ctx, this.platforms, this.gameTime);
    if (this.mc) drawMeecaFront(ctx, this.mc, this.player, this.gameTime);
    this.w5?.drawFront(ctx, this.gameTime, { x0: this.camera.x, x1: this.camera.x + this.camera.viewportWidth, y0: this.camera.y, y1: this.camera.y + this.camera.viewportHeight, zoom: this.zoom, hud: this.camera.y + (this.viewCssH > this.viewCssW ? HUD_BAND.port : HUD_BAND.land) / this.zoom });
    // leaves in front of a hidden nook part as he comes near (protoStage.ts)
    if (this.proto) {
      for (const cv of this.proto.covers) {
        if (!this.onScreen(cv.x + cv.w / 2, cv.y, 300)) continue;
        const near = Math.max(0, Math.min(1, (1 - Math.hypot(this.player.x - (cv.x + cv.w / 2), this.player.y - 30 - (cv.y + cv.h / 2)) / 260) * 1.6));
        if (!drawCurtainArt(ctx, cv.x - 20, cv.y - 40, cv.w + 40, cv.h + 60, near)) drawLeafCover(ctx, cv, this.player.x, this.player.y - 30, this.gameTime);
      }
    }
    // the boss's attacks go over him, so a warning is never hidden behind Pokey
    if (this.boss && !this.boss.defeated && this.hazards.length) drawHazards(ctx, this.hazards, this.gameTime);
    if (this.debugBoxes) this.drawHitboxes(ctx);

    // Render Particles
    this.particles.forEach((pt) => {
      if (pt.type !== 'star') return drawFxParticle(ctx, pt);
      // a four-pointed sparkle
      const r = pt.size * (pt.life / pt.maxLife);
      const k = r * 1.7;
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.moveTo(pt.x, pt.y - k);
      ctx.quadraticCurveTo(pt.x, pt.y, pt.x + k, pt.y);
      ctx.quadraticCurveTo(pt.x, pt.y, pt.x, pt.y + k);
      ctx.quadraticCurveTo(pt.x, pt.y, pt.x - k, pt.y);
      ctx.quadraticCurveTo(pt.x, pt.y, pt.x, pt.y - k);
      ctx.fill();
    });

    drawZoneEffects(ctx, this.currentStage.zones, { x: this.camera.x, y: this.camera.y, w: this.camera.viewportWidth, h: this.camera.viewportHeight }, this.gameTime);

    // Render Floating Combat Texts (in 3-10's dark they come after the Prowler is drawn back over it, so he never hides them)
    // (World 5's come after its golden light and the sleepy veil, below, which washed them out: "TRAY AWAY!" went unread, QA 5-2)
    if (!(lair === 'prowler' && prowlerGlow() < 0.98) && !this.w5) this.drawPopups(ctx);
    // (when the app has Dot say the hints, it draws them: this canvas banner is only the fallback)
    if (this.stageHint && !this.callbacks.onGuide) {
      const h = this.stageHint;
      const a = Math.min(1, h.life / 0.4, (3.6 - h.life) / 0.25);
      ctx.save();
      ctx.globalAlpha = Math.max(0, a);
      ctx.font = `700 17px ${FONT_UI}`;
      ctx.textAlign = 'center';
      const w = ctx.measureText(h.text).width + 28;
      // kept inside the view, so on a narrow portrait screen the bubble is never cut off at the edge
      const hx = Math.max(this.camera.x + w / 2 + 8, Math.min(this.camera.x + this.camera.viewportWidth - w / 2 - 8, this.player.x));
      const hy = Math.max(this.camera.y + 130, this.player.y - 118);
      ctx.fillStyle = 'rgba(20, 38, 26, 0.82)';
      ctx.beginPath();
      ctx.roundRect(hx - w / 2, hy - 22, w, 34, 17);
      ctx.fill();
      ctx.fillStyle = '#fff3c4';
      ctx.fillText(h.text, hx, hy);
      ctx.restore();
    }

    if (this.tide?.on) this.drawTideFront(ctx);
    ctx.restore(); // end world transform
    if (this.chase) this.drawChaseEdge(ctx, this.camera.viewportWidth, this.camera.viewportHeight);
    if (this.proto?.watch) this.drawWatchEdge(ctx, this.camera.viewportWidth, this.camera.viewportHeight);

    // 3. Render Foreground Foliage (Framing screen edges)
    setWeatherAvoid(this.player.x - this.camera.x, this.player.y - 28 - this.camera.y);
    if (lair) drawLairFront(ctx, lair, lairView, this.gameTime);
    // 3-10's last phase: the cave goes dark, so the Prowler (faintly, and lit as he winds up) and his eyes are drawn back over it
    if (lair === 'prowler' && this.boss && this.bossDef && !this.boss.defeated && prowlerGlow() < 0.98) {
      ctx.save();
      ctx.translate(-snapCam(this.camera.x, snap) + shakeX, -snapCam(this.camera.y, snap) + shakeY);
      drawBossOverDark(ctx, this.boss, this.bossDef, this.currentStage.config.worldIndex, this.currentStage.arena?.floor ?? 560, this.gameTime, (1 - prowlerGlow()) / (1 - 0.16), this.currentStage.arena ?? undefined);
      this.drawPopups(ctx);
      ctx.restore();
    }
    else renderOverlay(ctx, world.id, this.camera.x, this.camera.viewportWidth, this.camera.viewportHeight, this.gameTime, this.quality > 0);
    if (rig && this.quality === 0 && polishTier() === 0) drawBloom(ctx, rig, this.camera.viewportWidth, this.camera.viewportHeight);
    this.w5?.drawLight(ctx, this.camera.viewportWidth, this.camera.viewportHeight, this.gameTime);
    drawDrowsyVeil(ctx, this.camera.viewportWidth, this.camera.viewportHeight, Math.max(this.drowsyShow, this.w5?.veil ?? 0), this.gameTime);
    if (this.w5) {
      ctx.save();
      ctx.translate(-snapCam(this.camera.x, snap) + shakeX, -snapCam(this.camera.y, snap) + shakeY);
      this.drawPopups(ctx);
      // (and its warnings over all of it: a crouching spider's "!" is never under the words or the light)
      this.w5.drawWarnings(ctx, this.gameTime, { x0: this.camera.x, x1: this.camera.x + this.camera.viewportWidth, zoom: this.zoom });
      ctx.restore();
    }
    if (this.darkShow > 0.01) {
      const cx0 = this.camera.x;
      const cy0 = this.camera.y;
      const lights: Array<{ x: number; y: number; r: number }> = [];
      for (const z of this.currentStage.zones ?? []) {
        if (z.kind !== 'dark' || !z.lights || z.x1 < cx0 - 300 || z.x0 > cx0 + this.camera.viewportWidth + 300) continue;
        for (const l of z.lights) {
          // a sleeping glowworm glimmers faintly (something is up there); awake, its light opens out
          const u = l.sleep ? this.glowLit(l.id ?? -1) : 1;
          lights.push({ x: l.x - cx0, y: l.y - cy0, r: u > 0.01 ? l.r * (0.35 + 0.65 * u) : 42 });
        }
      }
      // the puzzle kit's glowing things (World 3's mushroom), carried or set down
      for (const l of this.kit?.lights() ?? []) lights.push({ x: l.x - cx0, y: l.y - cy0, r: l.r });
      // every flower and leaf glows a little, so a reward is never lost in the dark
      for (const c of this.collectibles) {
        if (c.collected || (c.type !== 'flower' && c.type !== 'leaf')) continue;
        if (c.x < cx0 - 80 || c.x > cx0 + this.camera.viewportWidth + 80) continue;
        lights.push({ x: c.x - cx0, y: c.y - cy0, r: 62 });
      }
      // World 3 has no lantern: Pokey is dim, but steady (a small glow of his own), and the grotto's dark is green-black
      const grotto = this.currentStage.config.worldIndex === 3;
      if (this.watchShadowAt) lights.push({ x: this.watchShadowAt.x - cx0, y: this.player.y - 40 - cy0, r: 150 * this.watchShadowAt.a * 2 });
      drawDarkness(ctx, this.camera.viewportWidth, this.camera.viewportHeight, this.darkShow, { x: this.player.x - cx0, y: this.player.y - 30 - cy0 }, lights, this.gameTime, grotto ? { heroR: 125, ink: 'rgb(2, 12, 10)', fireflies: false } : undefined);
    }
    if (this.watchEyes) {
      // World 3's watcher: two amber eyes, over the darkness so they always show
      const e = this.watchEyes;
      const ex = e.x - this.camera.x, ey = e.y - this.camera.y;
      ctx.save();
      ctx.globalAlpha = e.a;
      // the shape of something big around them, darker than the cave, so the eyes read on a lit stretch too
      const shade = ctx.createRadialGradient(ex, ey + 8 * e.s, 4, ex, ey + 8 * e.s, 95 * e.s);
      shade.addColorStop(0, 'rgba(2, 8, 6, 0.75)');
      shade.addColorStop(1, 'rgba(2, 8, 6, 0)');
      ctx.fillStyle = shade;
      ctx.beginPath();
      ctx.ellipse(ex, ey + 8 * e.s, 110 * e.s, 70 * e.s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'lighter';
      for (const side of [-1, 1]) {
        const cx = ex + side * 26 * e.s, cy = ey;
        const halo = ctx.createRadialGradient(cx, cy, 2, cx, cy, 34 * e.s);
        halo.addColorStop(0, 'rgba(253, 224, 71, 0.9)');
        halo.addColorStop(1, 'rgba(234, 88, 12, 0)');
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(cx, cy, 34 * e.s, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
      for (const side of [-1, 1]) {
        const cx = ex + side * 26 * e.s, cy = ey;
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        // a cat's eye: an almond, tilted up at the outside, thinner as it narrows
        ctx.ellipse(cx, cy, 15 * e.s, (8 - 5 * e.narrow) * e.s, side * -0.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1c1206';
        ctx.beginPath();
        ctx.ellipse(cx, cy, 2.6 * e.s, (7 - 4 * e.narrow) * e.s, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    if (this.respawnFlash > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${this.respawnFlash / 0.6 * 0.7})`;
      ctx.fillRect(0, 0, this.camera.viewportWidth, this.camera.viewportHeight);
    }

    if (this.entrance && this.boss && this.bossDef && this.currentStage.arena) {
      const head = weakRect(this.boss, this.bossDef, this.currentStage.arena.floor);
      drawEntrance(
        ctx,
        {
          vw: this.camera.viewportWidth,
          vh: this.camera.viewportHeight,
          eyeX: head ? head.x + head.w / 2 - this.camera.x : this.camera.viewportWidth / 2,
          eyeY: head ? head.y + head.h / 2 - this.camera.y : this.camera.viewportHeight / 2,
          name: this.bossDef.name,
          color: this.bossDef.color,
          eyeRgb: this.bossDef.entrance?.eye,
          darkRgb: this.bossDef.entrance?.dark,
        },
        entranceBeat(this.entrance.t, this.entrance.total, !!this.entrance.tea),
        this.gameTime
      );
    }

    if (this.mc) this.renderMeecaScreen(ctx, dpr);
    if (this.slideRun) {
      const p = this.player;
      const at = (x: number, y: number): [number, number] => [(x - this.camera.x) * this.zoom, (y - this.camera.y) * this.zoom];
      this.slideRun.overlay(ctx, dpr, this.viewCssW, this.viewCssH, at, at(p.x + p.width / 2, p.y - 130));
    }

    ctx.restore(); // end DPR transform
  }

  // --- Meeca's stage (meecaPlay.ts does the work; these lend it his physics, the camera, the canvas and the clear) ---
  private startMeeca(st: import('./meecaStage.ts').MeecaStage) {
    const engine = this;
    warmMeecaArt();
    // (the last path's dark has its own words: Flicker's)
    this.zoneHinted.dark = true;
    const kitOf = () => this.kit;
    this.mc = new MeecaPlay(st, {
      kit: kitOf,
      stageId: this.currentStage.config.id,
      get view() {
        const c = engine.camera;
        return { x0: c.x, x1: c.x + c.viewportWidth, y0: c.y, y1: c.y + c.viewportHeight };
      },
      get player() {
        return engine.player;
      },
      win: () => {
        if (this.isGameOver) return;
        this.isGameOver = true;
        const p = this.player;
        const stars = calculateLevelStars(this.gameTime, 0, p.hp / p.maxHp, 1, this.statLivesLost);
        this.callbacks.onStageStats?.(this.buildStats(true, stars));
        recorder.event('finish', Math.round(this.gameTime));
        this.callbacks.onVictory(stars, Math.round(this.gameTime), this.runScore);
      },
      score: (n) => (this.runScore += n),
      stepAt: (dir) => this.stepAt(dir),
      sfx: (kind) => {
        if (kind === 'scratch') sound.playTreeClimb();
        else if (kind === 'cut') sound.playRelicFound();
        else if (kind === 'blink') sound.playWhoosh();
        else if (kind === 'card') sound.playLevelStart();
        else if (kind === 'next' || kind === 'step') sound.playStep();
        else if (kind === 'blanket') sound.playCheckpoint();
      },
    });
  }

  /** Meeca's stage: a hint from Flicker, asked for from the pause menu (null when he cannot be asked now) */
  meecaHint(): string | null {
    return this.mc?.canAsk ? this.mc.askHint() : null;
  }

  /** the words Meeca's stage has on the screen now (meecaPlay.ts screenWords), for the page's text; none on any other stage */
  meecaWords(): Array<{ kind: 'card' | 'thought' | 'pell' | 'scene'; text: string }> {
    return this.mc?.screenWords() ?? [];
  }

  /** Meeca's stage on top of the play, in CSS px: the night and its lights, her thought, the others' bubbles, the card, the story box, the fade */
  private renderMeecaScreen(ctx: CanvasRenderingContext2D, dpr: number) {
    const mc = this.mc!;
    const W = this.viewCssW || this.camera.viewportWidth * this.zoom;
    const H = this.viewCssH || this.camera.viewportHeight * this.zoom;
    const z = this.zoom;
    const sx = (x: number) => (x - this.camera.x) * z;
    const sy = (y: number) => (y - this.camera.y) * z;
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // the night, and the close lights that bring the colour back
    const st = mc.st;
    const lights: Array<{ x: number; y: number; r: number; c: string; a: number }> = [];
    if (mc.flicker.on) lights.push({ x: sx(mc.flicker.x), y: sy(mc.flicker.y), r: 120 * z, c: 'rgba(220, 255, 170, A)', a: 0.45 * mc.flicker.show });
    for (const c of st.camp) if (c.n === 'fire' || c.n === 'stakeLit') lights.push({ x: sx(c.x), y: sy(c.y - 40), r: 170 * z, c: 'rgba(255, 170, 90, A)', a: 0.4 });
    if (mc.phase !== 'play') for (const x of st.clearing.stakes) lights.push({ x: sx(x + 14), y: sy(st.clearing.y - 78), r: 130 * z, c: 'rgba(255, 200, 120, A)', a: 0.35 });
    for (const l of this.kit?.lights() ?? []) if (l.r > 400) lights.push({ x: sx(l.x), y: sy(l.y), r: Math.min(420, l.r * 0.4) * z, c: 'rgba(225, 232, 255, A)', a: 0.35 });
    drawNightGrade(ctx, W, H, lights, Math.min(1, this.darkShow));
    // under the HUD's band at the top (the counter and the Menu)
    const top = H > W ? 96 : H <= 430 ? 66 : 84;
    const p = this.player;
    let tb: { x: number; y: number; w: number; h: number } | null = null;
    if (mc.thought && mc.phase !== 'card') {
      const a = Math.min(1, (mc.t - mc.thought.at) / 0.2, (mc.thought.until - mc.t) / 0.3);
      const tr = mc.next;
      const wb = tr ? wordsBox(tr) : null;
      tb = drawThought(ctx, mc.thought.text, sx(p.x), sy(p.y - 92), W, H, top, Math.max(0, a), wb && { x0: sx(wb.x0), y0: sy(wb.y0), x1: sx(wb.x1), y1: sy(wb.y1) });
    }
    if (mc.bubble) {
      const b = mc.bubble;
      const a = Math.max(0, Math.min(1, (mc.t - b.at) / 0.2, (b.until - mc.t) / 0.3));
      // (by the speaker: Flicker where he is; the Butler over his arch)
      let bx = sx(mc.flicker.x);
      let by = sy(mc.flicker.y - 26);
      if (b.who === 'butler') {
        const g = this.kit?.butlerAt();
        if (g) {
          bx = sx(g.x);
          by = sy(g.y - 130);
        }
      }
      drawSay(ctx, b.who, b.text, bx, by, W, H, top, a, tb);
    }
    const cardA = mc.phase === 'card' ? 1 : mc.cardOut >= 0 && mc.cardOut < 1 ? 1 - mc.cardOut : 0;
    drawTitleCard(ctx, W, H, cardA, mc.t);
    if (mc.sceneLine && mc.line >= 0) drawSceneBox(ctx, W, H, mc.scene, mc.line, Math.min(1, (mc.t - mc.lineAt) / 0.25 + 0.4), mc.t);
    if (mc.fade > 0) {
      ctx.fillStyle = 'rgba(8, 6, 22, ' + mc.fade + ')';
      ctx.fillRect(0, 0, W, H);
    }
    ctx.restore();
  }

  // --- 7-4's slide (w7SlideRun.ts does the work; these hand it the engine's hearts, platforms and canvas) ---
  private startSlide(st: import('./w7Slide.ts').SlideStage) {
    this.slideRun = new SlideRun(st, {
      easy: isEasy(),
      loseHeart: () => {
        const p = this.player;
        if (this.isGameOver) return;
        this.statHeartsLost++;
        p.hp = Math.max(0, p.hp - 1);
        recorder.event('hurt', p.hp);
        if (p.hp <= 0) this.loseLife('hurt');
      },
      score: (n) => (this.runScore += n),
      shake: (n) => (this.camera.trauma = Math.min(1, this.camera.trauma + n)),
      dropFloor: (ids) => {
        const gone = (pl: Platform) => !ids.includes(pl.id);
        this.platforms = this.platforms.filter(gone);
        this.drawPlats = this.drawPlats.filter(gone);
        this.paintedPlats = this.paintedPlats.filter(gone);
        this.player.grounded = false;
      },
      comeOut: (x, y) => {
        const p = this.player;
        p.x = x;
        p.y = y;
        p.vx = 420;
        p.vy = -120;
        p.grounded = false;
        this.checkpoint = { x: this.slideRun!.st.chamberFlag.x, y: this.slideRun!.st.chamberFlag.y };
        this.camera.x = x - this.camera.viewportWidth * 0.3;
        this.camera.y = y - this.camera.viewportHeight * 0.5;
        this.respawnFlash = 0.6;
      },
    });
  }

  private stepSlide(dt: number) {
    const run = this.slideRun!;
    const p = this.player;
    this.input.kickNear = false;
    this.input.onVine = false;
    this.input.onRope = false;
    if (!this.isGameOver) run.step(dt, this.input.state);
    this.camera.trauma = Math.max(0, this.camera.trauma - dt * 2.5);
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life -= dt;
      if (ft.life <= 0) this.floatingTexts.splice(i, 1);
    }
    this.callbacks.onProgressUpdate(0, 1, this.runScore, p.hp, 0.35 + 0.4 * run.sim.ratio(), null, 0);
  }

  // --- Dot's netting flight (dotFlightRun.ts does the work; these hand it the engine's input, hearts, camera and canvas) ---
  private startDot(st: import('./dotFlightStage.ts').DotStage) {
    this.dotRun = new DotRun(st, {
      stageId: this.currentStage.config.id,
      guide: (text, seconds) => this.guide(text, seconds),
      float: (text, x, y, color) => this.addFloatingText(text, x, y, color, 1.2),
      loseHeart: () => {
        const p = this.player;
        if (this.isGameOver) return;
        this.statHeartsLost++;
        p.hp = Math.max(0, p.hp - 1);
        recorder.event('hurt', p.hp);
        if (p.hp <= 0) this.loseLife('hurt');
      },
      score: (n) => (this.runScore += n),
      shake: (n) => (this.camera.trauma = Math.min(1, this.camera.trauma + n)),
      win: () => {
        if (this.isGameOver) return;
        this.isGameOver = true;
        const p = this.player;
        const stars = calculateLevelStars(this.gameTime, 0, p.hp / p.maxHp, 1, this.statLivesLost);
        this.callbacks.onStageStats?.(this.buildStats(true, stars));
        this.callbacks.onVictory(stars, Math.round(this.gameTime), this.runScore);
      },
    });
  }

  /** the control-test recorder in her flight: her, not Pokey (dotRecord.ts) */
  private dotLog = new DotLog();
  private recordDot(run: DotRun) {
    const st = this.input.state;
    const lines = this.dotLog.step(run.fl, run.lastEvents, { dir: (st.right ? 1 : 0) - (st.left ? 1 : 0), down: !!st.jumpHeld }, this.gameTime);
    for (const l of lines) {
      if (l.k === 'p') recorder.pokey(l.x, l.y, l.vx, l.vy, l.state, l.section);
      else if (l.k === 'i') recorder.intent(l.name, l.arg);
      else recorder.event(l.what, l.detail);
    }
  }

  private stepDot(dt: number) {
    const run = this.dotRun!;
    const p = this.player;
    // the touch recogniser reads these: a short slide up flaps while she has a flap in hand; nothing is ever a kick or a climb
    this.input.airJumpReady = run.fl.canFlap();
    this.input.kickNear = false;
    this.input.onVine = false;
    this.input.onRope = false;
    // (nor a swing, a bush or a carving spot: left set from the stage before, they bent her flaps, CT-20)
    this.input.onSwing = false;
    this.input.inCover = false;
    (this.input as { carveSpot?: boolean }).carveSpot = false;
    this.input.megaReady = true;
    if (!this.isGameOver || run.fl.through) run.step(dt, this.input.state);
    else run.lastEvents = [];
    this.checkpoint = { ...run.fl.checkpoint };
    // her flowers are the stage's checkpoints: the ones up to hers are reached (Continue after a game over comes back to hers)
    for (const cp of this.currentStage.checkpoints ?? []) if (!cp.reached && cp.x <= run.fl.checkpoint.x + 1) cp.reached = true;
    p.x = run.fl.x;
    p.y = run.fl.y + 22;
    p.vx = run.fl.vx;
    p.vy = run.fl.vy;
    p.facing = run.fl.face;
    if (recorder.on) this.recordDot(run);
    // the moment at the gap: the view closes in a touch
    const z = 1 + 0.12 * run.moment();
    if (Math.abs(z - this.bossZoom) > 0.002) {
      this.bossZoom = z;
      this.applyZoom();
    }
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life -= dt;
      if (ft.life <= 0) this.floatingTexts.splice(i, 1);
      else ft.y -= 35 * dt;
    }
    if (this.stageHint && (this.stageHint.life -= dt) <= 0) this.stageHint = null;
    this.camera.trauma = Math.max(0, this.camera.trauma - dt * 2.5);
    run.camera(this.camera, dt);
    this.callbacks.onProgressUpdate(run.fl.through ? 1 : 0, 1, this.runScore, p.hp, run.ratio(), null, 0);
    this.markWayDodge(dt);
  }

  private hudLeftAt = -1e9;
  private hudLeftY = -1;
  /** where the HUD's hearts and lives end (css px from the top), looked up twice a second; -1 when there is no HUD (tests) */
  private hudLeftBottom(): number {
    const now = performance.now();
    if (now - this.hudLeftAt < 500) return this.hudLeftY;
    this.hudLeftAt = now;
    const el = typeof document !== 'undefined' ? document.querySelector?.('.game-hud .hud-left') : null;
    const r = el?.getBoundingClientRect();
    const top = this.canvas.getBoundingClientRect?.().top ?? 0;
    this.hudLeftY = r && r.height > 0 ? r.bottom - top : -1;
    return this.hudLeftY;
  }

  private renderDot(ctx: CanvasRenderingContext2D, dpr: number) {
    const shake = shakeOffset(this.camera.trauma, performance.now() / 1000, 14);
    // her panel: held sideways it sits under the hearts and lives (GameHUD.tsx), left; upright, the top is full (the stage card, Dot's banner), so it sits bottom left
    const portrait = this.viewCssH > this.viewCssW;
    // a short landscape screen has the compact HUD (index.css): her panel shrinks too and sits right under the hearts and lives
    const compact = !portrait && this.viewCssH <= 430;
    const scale = compact ? (this.viewCssH <= 340 ? 0.72 : 0.84) : 1;
    const under = this.hudLeftBottom();
    const hudAt = { x: 12, y: portrait ? this.viewCssH - 66 : under > 0 ? under + 8 : this.viewCssH < 430 ? 112 : 124, scale };
    this.dotRun!.draw(ctx, this.camera, dpr, this.zoom, this.viewCssW, this.viewCssH, shake, hudAt);
    // the floating words (a scratch, the silk), in the world
    ctx.save();
    const snap = dpr * this.zoom;
    ctx.translate(-snapCam(this.camera.x, snap), -snapCam(this.camera.y, snap));
    ctx.textAlign = 'center';
    ctx.font = `bold 15px ${FONT_UI}`;
    for (const ft of this.floatingTexts) {
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(30, 20, 30, 0.6)';
      ctx.strokeText(ft.text, ft.x, ft.y);
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
    }
    ctx.restore();
    if (this.respawnFlash > 0) {
      this.respawnFlash = Math.max(0, this.respawnFlash - 1 / 30);
      ctx.fillStyle = `rgba(255, 255, 255, ${(this.respawnFlash / 0.6) * 0.7})`;
      ctx.fillRect(0, 0, this.camera.viewportWidth, this.camera.viewportHeight);
    }
  }

  /**
   * The floating words over the fight (in the world). Kept inside the view (upright, the screen is narrow and a pop-up beside Pokey ran
   * off the edge: "00 HIBISCUS!", "OMBO! +200"), outlined so they read over a boss's body, and stacked: a word that would land on one
   * already drawn this frame goes up above it (2026-10-26, QA: fast hits piled their pop-ups on top of each other).
   */
  private drawPopups(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.textAlign = 'center';
    // (a boss fight is zoomed out to show both fighters: the words grow back to a readable size on the phone, QA gate)
    // (World 5's words, a tray knocked away or a cake eaten, are as large as upright on a short landscape screen too: cardScale)
    const fs = this.boss && !this.boss.defeated && this.zoom < 1 ? Math.round(Math.max(15, (15 / this.zoom) * 0.85)) : this.w5 ? Math.round(15 * cardScale(this.zoom)) : 15;
    ctx.font = `bold ${fs}px ${FONT_UI}`;
    ctx.lineJoin = 'round';
    const cam = this.camera;
    const placed: Array<{ x0: number; x1: number; y: number }> = [];
    // (newest last, so the newest climbs above the older ones)
    for (const ft of this.floatingTexts) {
      const half = ctx.measureText(ft.text).width / 2 + 6;
      const x0 = cam.x + half, x1 = cam.x + cam.viewportWidth - half;
      const x = x0 > x1 ? cam.x + cam.viewportWidth / 2 : Math.max(x0, Math.min(x1, ft.x));
      let y = Math.max(cam.y + 22, Math.min(cam.y + cam.viewportHeight - 8, ft.y));
      for (let k = 0; k < 6; k++) {
        const hit = placed.find((q) => x - half < q.x1 && x + half > q.x0 && Math.abs(y - q.y) < fs + 2);
        if (!hit) break;
        y = hit.y - fs - 3;
      }
      y = Math.max(cam.y + fs + 7, y);
      placed.push({ x0: x - half, x1: x + half, y });
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(20, 14, 24, 0.7)';
      ctx.strokeText(ft.text, x, y);
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, x, y);
    }
    ctx.restore();
  }

  // --- Juice Helpers ---
  /** the leap of a prowler into its ring: how long it takes (s), and how high it arcs (px) */
  private static readonly RING_LEAP = { t: 0.7, h: 90 };
  /** the drop: how long a snake takes from the canopy to the branch (s), and from how high it falls (px) */
  private static readonly RING_DROP = { t: 0.55, h: 420 };

  /** 1-9's ring: drop the waves, and open the wall when every one of them is down */
  private updateRing(dt: number) {
    const ring = this.proto!.ring!;
    const r = this.ring;
    const p = this.player;
    const id = this.currentStage.config.id;
    const dropWave = (n: number) => {
      ring.waves[n].forEach((d, k) => {
        const cat = d.kind === 'ocelot' || d.kind === 'jaguar';
        const base = d.kind === 'boa'
          ? { type: 'boa', width: 58, height: 26, hp: 3, maxHp: 3, vx: 0, y: d.surface - 16, patrolMinX: d.x - 12, patrolMaxX: d.x + 12 }
          : d.kind === 'jaguar'
            ? { type: 'jaguar', width: 64, height: 38, hp: 3, maxHp: 3, vx: 42, y: d.surface - 24, patrolMinX: d.x - 90, patrolMaxX: d.x + 90, groundY: d.surface - 24 }
            : d.kind === 'ocelot'
              ? { type: 'ocelot', width: 48, height: 28, hp: 2, maxHp: 2, vx: 55, y: d.surface - 18, patrolMinX: d.x - 90, patrolMaxX: d.x + 90, groundY: d.surface - 18 }
              : { type: 'snake', width: 38, height: 22, hp: 1, maxHp: 1, vx: 28, y: d.surface - 14, patrolMinX: d.x - 70, patrolMaxX: d.x + 70 };
        const e = {
          id: 9500 + n * 10 + k, x: d.x, vy: 0, facing: d.x > p.x ? -1 : 1, attackCooldown: cat ? 1.4 : 0.9, telegraphTimer: 0, isAttacking: false,
          animTimer: 0, hitFlashTimer: 0, defeated: false, koTimer: 0, behaviorTimer: 0, ...base,
        } as Enemy;
        // a prowler comes out of the dark a little beyond its spot, on the side away from him (inside the ring, so it is in view), and
        // leaps to it
        const fx = d.x + (d.x >= p.x ? 300 : -300);
        const from = cat ? { x: Math.max(ring.x0 + 30, Math.min(ring.x1 - 30, fx)), y: e.y } : undefined;
        if (from) e.facing = d.x > from.x ? 1 : -1;
        this.ringDrops.push({ e, t: 0, delay: k * (cat ? 0.6 : 0.35), from });
        r.ids.push(e.id);
      });
      // snakes come with the rush of their fall; prowlers with a growl out of the dark
      if (ring.waves[n].some((d) => d.kind === 'ocelot' || d.kind === 'jaguar')) sound.playPredator('jaguar', 0);
      else sound.playWhoosh();
    };
    if (r.state === 'idle') {
      if (p.x > ring.x0 + 120 && p.x < ring.x1) {
        r.state = 'fight';
        r.wave = 0;
        dropWave(0);
        this.camera.trauma = Math.min(1, this.camera.trauma + 0.3);
        if (!tipHeard(id, 'ring:go')) {
          markTipHeard(id, 'ring:go');
          this.guide(ring.waves[0].some((d) => d.kind === 'ocelot' || d.kind === 'jaguar') ? 'Prowlers out of the dark! Drive them all off to open the way' : 'Snakes from above! Clear them all to open the way', 3);
        }
      }
      return;
    }
    if (r.state !== 'fight' || this.ringDrops.length) return;
    const alive = this.enemies.some((e) => r.ids.includes(e.id) && !e.defeated);
    if (alive) return;
    if (r.wave + 1 < ring.waves.length) {
      r.wave++;
      dropWave(r.wave);
      return;
    }
    // every one down: the wall gives way
    r.state = 'open';
    const wall = this.platforms.find((pl) => pl.id === ring.wallId);
    if (wall) {
      wall.broken = true;
      this.spawnSparkBurst(wall.x + wall.width / 2, wall.y + 60, '#8b5a2b');
      this.spawnSparkBurst(wall.x + wall.width / 2, wall.y + 180, '#a3d977');
    }
    this.camera.trauma = Math.min(1, this.camera.trauma + 0.45);
    sound.playShrineUnlocked();
    if (!tipHeard(id, 'ring:open')) {
      markTipHeard(id, 'ring:open');
      this.guide('The way is open!', 2.4);
    }
  }

  /** animals falling from the canopy (1-9's ring, Venom Fang's call): in play where they land */
  private stepDrops(dt: number) {
    for (const d of this.ringDrops) d.t += dt;
    const dur = (d: { from?: unknown }) => (d.from ? GameEngine.RING_LEAP.t : GameEngine.RING_DROP.t);
    const landed = this.ringDrops.filter((d) => d.t >= d.delay + dur(d));
    for (const d of landed) {
      if (d.from) {
        // landed: back to prowling where it came down
        d.e.state = 'patrol';
        d.e.stateT = 0;
        this.camera.trauma = Math.min(1, this.camera.trauma + (d.e.type === 'jaguar' ? 0.25 : 0.12));
      }
      this.enemies.push(d.e);
      this.harmlessUntil.set(d.e.id, this.gameTime + 0.6);
      this.spawnJumpDust(d.e.x, d.e.y + 14);
      sound.playLand(0.5);
    }
    this.ringDrops = this.ringDrops.filter((d) => d.t < d.delay + dur(d));
  }

  /** the snakes still falling into the ring, drawn on their way down */
  private drawRingDrops(ctx: CanvasRenderingContext2D) {
    for (const d of this.ringDrops) {
      if (d.t < d.delay) continue;
      const e = d.e;
      if (d.from) {
        // a prowler's leap in from the dark: an arc from the ring's edge to its spot, drawn in its own leap poses
        const u = Math.min(1, (d.t - d.delay) / GameEngine.RING_LEAP.t);
        const x0 = e.x, y0 = e.y, st0 = e.state, t0 = e.stateT;
        const yEnd = y0;
        e.x = d.from.x + (x0 - d.from.x) * u;
        e.y = d.from.y + (yEnd - d.from.y) * u - GameEngine.RING_LEAP.h * 4 * u * (1 - u);
        e.state = 'leap';
        e.stateT = u * (e.type === 'jaguar' ? 0.58 : 0.36);
        // two eyes in the dark first, then the cat
        if (u < 0.12) {
          // Matt's eyes in the dark (World 3's ring sheet), or two amber dots until it has loaded
          if (!drawW3Piece(ctx, 'catEyes', d.from.x, d.from.y + 4, 70, 0.6 + 3.4 * u)) {
            ctx.save();
            ctx.fillStyle = `rgba(255, 190, 60, ${0.5 + 4 * u})`;
            for (const s of [-1, 1]) {
              ctx.beginPath();
              ctx.ellipse(d.from.x + s * 7, d.from.y - 18, 4, 2.4, 0, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.restore();
          }
        } else if (e.type === 'jaguar') {
          if (!drawJaguarSprite(ctx, e, this.gameTime)) drawJaguar(ctx, e, this.gameTime);
        } else if (!drawOcelotSprite(ctx, e, this.gameTime)) drawOcelot(ctx, e, this.gameTime);
        e.x = x0;
        e.y = y0;
        e.state = st0;
        e.stateT = t0;
        continue;
      }
      const u = Math.max(0, d.t - d.delay) / GameEngine.RING_DROP.t;
      const y0 = e.y;
      // where it will land: a shadow on the branch that darkens as it comes down
      drawSoftShadow(ctx, e.x, y0 + (e.type === 'boa' ? 12 : 10), e.width * (1.5 + 0.8 * u), 20 + 8 * u, 0.4 + 0.5 * u);
      e.y = y0 - GameEngine.RING_DROP.h * (1 - u * u);
      if (e.type === 'snake') {
        if (!drawGoldSnake(ctx, e, this.gameTime) && !drawSnakeSprite(ctx, e, this.gameTime)) drawTreeSnake(ctx, e, this.gameTime);
      } else if (!drawBoaSprite(ctx, e, this.gameTime)) drawBoa(ctx, e, this.gameTime);
      e.y = y0;
    }
  }

  /** step 1-8's collapse: sections behind it fall, caught or off the branch costs a heart and the flag (chase.ts) */
  private updateChase(dt: number) {
    const plan = this.proto!.chase!;
    const ch = this.chase!;
    const p = this.player;
    const wasActive = ch.active;
    stepChase(ch, plan, dt, p.x);
    if (ch.active && !wasActive) {
      // it starts: a crack, a jolt, and Dot's warning (said once on this device)
      sound.playHitImpact(true);
      this.camera.trauma = Math.min(1, this.camera.trauma + 0.45);
      const id = this.currentStage.config.id;
      if (!tipHeard(id, 'chase:go')) {
        markTipHeard(id, 'chase:go');
        this.guide('It is breaking behind us! Keep moving!', 3);
      }
    }
    // sections behind the front fall away (and a creak now and then just ahead of it)
    for (const pl of this.platforms) {
      if (!pl.chase || pl.broken) continue;
      if (sectionState(ch, pl.x, pl.x + pl.width) !== 'fallen') continue;
      pl.broken = true;
      const half = pl.width / 2;
      const h = (pl.width * 100) / 370;
      for (const right of [false, true]) {
        this.chaseFalling.push({ x: pl.x + (right ? half : 0), y: pl.y - 8, w: half, h, vx: (right ? 40 : -30) + Math.random() * 30, vy: -40 - Math.random() * 60, rot: 0, vr: (right ? 1 : -1) * (0.8 + Math.random()), t: 0, right });
      }
      this.spawnSparkBurst(pl.x + pl.width, pl.y, '#8b5a2b');
      if (this.onScreen(pl.x + pl.width, pl.y, 200)) {
        sound.playHitImpact(false);
        this.camera.trauma = Math.min(0.5, this.camera.trauma + 0.12);
      }
    }
    if (ch.active && this.gameTime > this.chaseNext) {
      this.chaseNext = this.gameTime + 0.9 + Math.random() * 0.6;
      if (p.x - ch.front < 700) sound.playTreeClimb();
    }
    for (const f of this.chaseFalling) {
      f.t += dt;
      f.vy += 1500 * dt;
      f.x += f.vx * dt;
      f.y += f.vy * dt;
      f.rot += f.vr * dt;
    }
    this.chaseFalling = this.chaseFalling.filter((f) => f.t < 1.8);
    // the last liana: a moment of slow motion as he catches it, with everything coming down behind him
    if (!this.chaseSlowDone && p.isVineSwinging && this.vines.find((v) => v.id === p.swingVineId)?.x === plan.end) {
      this.chaseSlowDone = true;
      this.slowMoLeft = 0.55;
    }
    // caught by the front, or off the branch (below the lowest section near him by more than a fall can come back from)
    let low = -Infinity;
    for (const pl of this.platforms) if (pl.chase && Math.abs(pl.x + pl.width / 2 - p.x) < 800) low = Math.max(low, pl.y);
    const off = low > -Infinity && p.y > low + 300 && !p.isVineSwinging && !p.climbing;
    if ((caught(ch, p.x) && !p.isVineSwinging) || off) this.chaseCaught();
  }

  /**
   * step 6-8's tide: it turns once he is up the first root (a churn, a rumble, Dot's line), then rises under him, holding while he stands
   * at a flag or on a held shelf. The water line is the stage's (drawn with the painted dirty water; under it costs a life as any water)
   */
  private updateTide(dt: number) {
    const plan = this.proto!.tide!;
    const t = this.tide!;
    const p = this.player;
    const atFlag = p.grounded && (this.currentStage.checkpoints ?? []).some((c) => Math.abs(p.y - c.y) < 6 && Math.abs(p.x - c.x) < 160);
    const resting = atFlag || onHeld(plan, p.x, p.y, p.grounded);
    // up the last root (the reveal): he has made it, and the tide drains away below him instead of rising
    const rv = this.proto?.reveal;
    if (rv && p.y < rv.from && t.on) {
      t.y = Math.min(plan.low, t.y + 140 * dt);
      this.currentStage.waterY = t.y;
      return;
    }
    const ev = stepTide(t, plan, this.tideSet, dt, p.y, resting);
    if (ev === 'surge') {
      // a surge: a pulse of foam along the line, splashes, a low rush
      for (let i = 0; i < 3; i++) this.spawnWaterSplash(this.camera.x + ((i + 0.2 + Math.random() * 0.6) / 3) * this.camera.viewportWidth, t.y);
      if (t.y - p.y < this.tideSet.band + 200) sound.playWhoosh();
    }
    if (ev === 'turned') {
      sound.playHitImpact(true);
      this.camera.trauma = Math.min(1, this.camera.trauma + 0.4);
      const id = this.currentStage.config.id;
      if (!tipHeard(id, 'tide:turn')) {
        markTipHeard(id, 'tide:turn');
        this.guide("The tide's coming in. Climb!", 3.5); // (new, needs Matt's approval)
      }
    }
    this.currentStage.waterY = t.y;
    // the churn while it turns: splashes along the line where he can see it
    if (t.on && t.warn > 0 && this.gameTime > this.tideChurn) {
      this.tideChurn = this.gameTime + 0.25;
      this.spawnWaterSplash(this.camera.x + Math.random() * this.camera.viewportWidth, t.y);
    }
    // Dot's warning the first time the water comes close under him (once a stage: STAGE-RULES §6, no repeated tips)
    if (t.on && t.warn <= 0 && t.y - p.y < this.tideSet.near && this.tideWarned === Infinity) {
      this.tideWarned = this.checkpoint.y;
      this.guide('The tide! Keep climbing.', 2.5); // (new, needs Matt's approval)
    }
  }

  /**
   * 6-8's crown: climbing the last root, the backdrop turns from the mangrove to the ruins of World 7 in golden light (scenery setReveal);
   * standing on the crown, the view pulls back to take it in
   */
  private updateReveal(dt: number) {
    const rv = this.proto!.reveal!;
    const p = this.player;
    const strips = p.y < rv.load ? revealSet(rv.strips) : null;
    setReveal((rv.from - p.y) / (rv.from - rv.full), strips);
    const onCrown = p.grounded && p.y < rv.crown + 6;
    // the first step onto the crown: a chime of discovery as the view opens (once a run)
    if (onCrown && !this.revealHeard) {
      this.revealHeard = true;
      sound.playRelicFound();
    }
    // (upright pulls back only a little: the view is narrow, and pulled far back he would be small at the top of a tall, empty screen;
    // sideways not so far that he is lost in it: the lead's review, 2026-10-29)
    const want = onCrown ? (this.viewCssH > this.viewCssW ? 0.9 : 0.8) : 1;
    const prev = this.revealZoom;
    this.revealZoom += (want - this.revealZoom) * Math.min(1, dt * 1.2);
    if (Math.abs(want - this.revealZoom) < 0.002) this.revealZoom = want;
    if (this.revealZoom !== prev) this.applyZoom();
  }

  /**
   * 6-8's tide in front of the climb: the painted dirty water again over everything under its line, a little see-through, so the roots
   * it has swallowed show dimly in it; along the line a band of foam that flares as each surge comes in (and while it turns)
   */
  private drawTideFront(ctx: CanvasRenderingContext2D) {
    const t = this.tide!;
    const x0 = this.camera.x - 20, x1 = this.camera.x + this.camera.viewportWidth + 20;
    const bottom = this.camera.y + this.camera.viewportHeight + 40;
    if (t.y > bottom) return;
    ctx.save();
    ctx.globalAlpha = 0.78;
    drawBadWater(ctx, x0, x1, t.y, bottom, this.gameTime);
    ctx.restore();
    // the foam: brightest as a surge comes in, a soft glow otherwise
    const flare = t.warn > 0 ? 0.6 + 0.4 * Math.sin(this.gameTime * 14) : surging(t, this.tideSet);
    const a = 0.18 + 0.5 * flare;
    const g = ctx.createLinearGradient(0, t.y - 16, 0, t.y + 12);
    g.addColorStop(0, 'rgba(236, 232, 214, 0)');
    g.addColorStop(0.55, `rgba(236, 232, 214, ${a})`);
    g.addColorStop(1, 'rgba(236, 232, 214, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(x0, t.y - 16, x1 - x0, 28);
  }

  /** caught on the long branch: one heart, back at the flag with the branch whole again from there, the collapse waiting a moment */
  private chaseCaught() {
    const p = this.player;
    const hp = p.hp - 1;
    this.statHeartsLost += 1;
    recorder.event('hurt', hp);
    sound.playPlayerHurt();
    if (hp <= 0) this.loseLife('pit');
    else {
      this.respawnAtCheckpoint('pit');
      p.hp = hp;
    }
    const flagX = this.checkpoint.x;
    for (const pl of this.platforms) if (pl.chase && pl.x + pl.width > flagX - 700) pl.broken = false;
    this.chaseFalling = [];
    restartAt(this.chase!, this.proto!.chase!, flagX);
  }

  /** 1-8's long branch: its sections from Matt's sheet (cracking just ahead of the collapse), the pieces falling away */
  private drawChase(ctx: CanvasRenderingContext2D) {
    const ch = this.chase!;
    for (const pl of this.platforms) {
      if (!pl.crown || !this.onScreen(pl.x + pl.width / 2, pl.y, pl.width + 300)) continue;
      if (!drawCrownArt(ctx, pl)) {
        ctx.fillStyle = '#4a6b2e';
        ctx.fillRect(pl.x, pl.y, pl.width, 60);
      }
    }
    for (const pl of this.platforms) {
      if (!pl.chase || pl.broken || !this.onScreen(pl.x + pl.width / 2, pl.y, pl.width + 200)) continue;
      const state = sectionState(ch, pl.x, pl.x + pl.width);
      // a quiver in the cracking sections
      const dy = state === 'cracked' ? Math.sin(this.gameTime * 40 + pl.x) * 1.2 : 0;
      if (!drawChaseSection(ctx, pl, state === 'cracked', Math.round(pl.x / BRANCH_TILE) % 2 === 1, dy)) {
        ctx.fillStyle = state === 'cracked' ? '#7a5532' : '#8a6238';
        ctx.fillRect(pl.x, pl.y + dy, pl.width, 34);
      }
    }
    for (const f of this.chaseFalling) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - f.t / 1.8);
      ctx.translate(f.x + f.w / 2, f.y + f.h / 2);
      ctx.rotate(f.rot);
      if (!drawChaseBroken(ctx, f.right, -f.w / 2, -f.h / 2, f.w, f.h)) {
        ctx.fillStyle = '#7a5532';
        ctx.fillRect(-f.w / 2, -f.h / 4, f.w, f.h / 2);
      }
      ctx.restore();
    }
  }

  /** the danger at the trailing edge of the view: darker the closer the collapse (screen space) */
  private drawChaseEdge(ctx: CanvasRenderingContext2D, vw: number, vh: number) {
    const ch = this.chase!;
    if (!ch.active) return;
    const gap = this.player.x - ch.front;
    const k = Math.max(0, Math.min(1, (650 - gap) / 500));
    if (k <= 0.02) return;
    const w = vw * 0.32;
    const g = ctx.createLinearGradient(0, 0, w, 0);
    g.addColorStop(0, `rgba(70, 18, 8, ${0.55 * k})`);
    g.addColorStop(1, 'rgba(70, 18, 8, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, vh);
  }

  /** the eagle's warning on the screen: the edge it will come from pulses amber until the sweep starts (screen space) */
  private drawWatchEdge(ctx: CanvasRenderingContext2D, vw: number, vh: number) {
    const w = this.watch;
    if (w.phase !== 'warn') return;
    const u = Math.min(1, w.t / WATCH.warn);
    const k = (0.35 + 0.65 * u) * (0.6 + 0.4 * Math.sin(this.gameTime * 11));
    const width = vw * 0.22;
    const fromLeft = w.dir === 1;
    const g = ctx.createLinearGradient(fromLeft ? 0 : vw, 0, fromLeft ? width : vw - width, 0);
    g.addColorStop(0, `rgba(245, 158, 11, ${0.8 * k})`);
    g.addColorStop(0.35, `rgba(251, 191, 36, ${0.35 * k})`);
    g.addColorStop(1, 'rgba(251, 191, 36, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(fromLeft ? 0 : vw - width, 0, width, vh);
  }

  /** does a watcher at (x, y) hear the puzzle kit's noise now (noise.ts) */
  private listens(x: number, y: number): boolean {
    return !!this.kit && !!heard(this.kit.noises, x, y, this.gameTime);
  }

  /**
   * Where the watching eagle's shadow is: sweeping across the view (watcher.ts), or, when a noise in its watched stretch draws it
   * (noise.ts), circling over the noise.
   */
  private shadowX(w: WatchState, camX: number, viewW: number): number {
    const zones = this.proto?.watch ?? [];
    for (const n of this.kit?.noises ?? []) {
      if (w.phase === 'pass' && zoneAt(zones, n.x) && heard([n], n.x, n.y, this.gameTime)) return lureShadow(n.x, this.gameTime);
    }
    return plainShadowX(w, camX, viewW);
  }

  /** step the watching eagle and its dive (1-7) */
  /** the eagle caught him out in the open on its last pass (Dot calls the next warning too) */
  private watchCaught = false;
  /** how many of the watcher's later warnings Dot has said this stage (watchCaught) */
  private watchVoiced = 0;

  private updateWatch(dt: number) {
    const p = this.player;
    const bushes = this.proto?.bushes ?? [];
    const zone = zoneAt(this.proto!.watch!, p.x);
    const before = this.watch.diveT;
    const ev = stepWatch(this.watch, dt, zone, Math.random);
    const id = this.currentStage.config.id;
    // World 3's watcher is the eyes in the dark: a low growl, and ferns to hide in
    const grotto = this.currentStage.config.worldIndex === 3;
    // World 4's watcher is the Sky Sovereign (4-5), and the water of a pouring fall hides him from her as well as a bush does
    const cliffs = this.currentStage.config.worldIndex === 4;
    const water = !!this.w4?.behindFall(p.x, p.y);
    const cry = (phase: 0 | 2) => (grotto ? sound.playPredator('jaguar', phase) : sound.playEagleScreech());
    const hide = grotto ? 'fern' : 'bush';
    if (ev.warned) {
      cry(0);
      // every pass is called out, not only the first: a word over his head and a buzz on a phone (many play with the sound off)
      this.addFloatingText(cliffs ? 'HIDE! WATER OR BUSH' : `HIDE! ${hide === 'fern' ? 'INTO A FERN' : 'INTO A BUSH'}`, p.x, p.y - 96, '#fbbf24');
      this.input.triggerHaptic(120);
      if (!tipHeard(id, 'watch:hide')) {
        markTipHeard(id, 'watch:hide');
        const duck = lessonInputMode() === 'screen' ? `Slide down inside a ${hide}` : `Hold down inside a ${hide}`;
        this.guide(cliffs ? `Here she comes! Stand behind a waterfall, or ${duck.toLowerCase()}` : `Here it comes! ${duck} to hide`, 3);
      } else if (this.watchVoiced < 3 && !hidden(bushes, { x: p.x, y: p.y, ducking: !!p.ducking, grounded: p.grounded, hanging: !!p.hanging }) && (this.watch.passes <= 2 || this.watchCaught)) {
        // (three times a stage at most: the first-timer bot heard it six times in 1-7; the sign over his head stays every pass)
        this.watchVoiced++;
        // (the sign over his head was in the world only: Dot says it too, for the next two passes and after any pass that caught him,
        // when he is out in the open. QA 2026-10-28)
        this.guide(cliffs ? 'Hide! Water or a bush!' : `Hide! Into a ${hide}!`, 2.4);
      }
      this.watchCaught = false;
    }
    const me = { x: p.x, y: p.y, ducking: !!p.ducking, grounded: p.grounded, hanging: !!p.hanging };
    if (this.watch.phase === 'pass') {
      const sx = this.shadowX(this.watch, this.camera.x, this.camera.viewportWidth);
      if (!water && sees(this.watch, sx, bushes, me)) {
        this.watch.seen = true;
        this.watchFrom = { x: sx, y: this.camera.y + 125 };
        cry(2);
        if (!tipHeard(id, 'watch:seen')) {
          markTipHeard(id, 'watch:seen');
          this.guide(grotto ? 'It saw you! Get into a fern before it reaches you' : cliffs ? 'She saw you! Get behind the water or into a bush, quick' : 'It saw you! Get into a bush before its shadow reaches you', 3.2);
        }
      }
      // the strike: unless he made it into a bush (or behind the water) in time
      if (this.watch.seen && before < WATCH.dive && this.watch.diveT >= WATCH.dive) {
        if (water || hidden(bushes, me)) this.addFloatingText('PHEW!', p.x, p.y - 70, '#bbf7d0');
        else if (harmlessPass(this.watch)) {
          // (the first pass only warns: it pulls up short of him)
          this.addFloatingText('TOO CLOSE!', p.x, p.y - 80, '#fbbf24');
          this.watchCaught = true;
        } else {
          this.damagePlayer(1);
          this.watchCaught = true;
        }
      }
    }
    // a bush rustles while he moves in it
    for (let i = 0; i < bushes.length; i++) {
      const b = bushes[i];
      const inside = p.x > b.x && p.x < b.x + b.w && (b.hanging ? p.hanging && p.y > b.y : Math.abs(p.y - b.y) < 12);
      const r = this.bushRustle.get(i) ?? 0;
      this.bushRustle.set(i, inside && Math.abs(p.vx) > 15 ? 1 : Math.max(0, r - dt * 2.5));
    }
  }

  /** the watching eagle, its shadow, and (in front of Pokey) the bushes: drawn in the world's space */
  private drawWatchBack(ctx: CanvasRenderingContext2D) {
    this.watchShadowAt = null;
    this.watchEyes = null;
    const w = this.watch;
    const zone = zoneAt(this.proto!.watch!, this.player.x);
    if (this.currentStage.config.worldIndex === 3) {
      // the Mossy Grotto: something large in the dark, watching. Two eyes far back among the stalactites (calm), opening wide at the
      // edge of the view (warn), sweeping across with a pool of their amber light on the floor (pass), and if they see him, narrowing
      // and coming at him: a paw out of the dark
      const cam = this.camera;
      if (w.phase === 'calm') {
        if (!zone) return;
        const a = this.gameTime * 0.35;
        const blink = Math.sin(this.gameTime * 1.3) > 0.97 ? 0.15 : 1;
        this.watchEyes = { x: cam.x + cam.viewportWidth * (0.5 + 0.36 * Math.cos(a)), y: cam.y + 160 + 12 * Math.sin(a * 1.7), s: 0.6, a: 0.5 * blink, narrow: 0 };
      } else if (w.phase === 'warn') {
        const u = w.t / WATCH.warn;
        this.watchEyes = { x: w.dir === 1 ? cam.x + 40 + 30 * u : cam.x + cam.viewportWidth - 40 - 30 * u, y: cam.y + 175, s: 0.8 + 0.5 * u, a: 0.5 + 0.5 * u, narrow: 0 };
        this.watchShadowAt = { x: w.dir === 1 ? cam.x + 30 : cam.x + cam.viewportWidth - 30, a: 0.18 + 0.3 * u };
      } else if (w.seen) {
        const u = Math.min(1, w.diveT / WATCH.dive);
        const k = u * u;
        this.watchEyes = { x: this.watchFrom.x + (this.player.x - this.watchFrom.x) * k, y: this.watchFrom.y + (this.player.y - 70 - this.watchFrom.y) * k, s: 1.3 + 0.5 * k, a: 1, narrow: 0.6 };
      } else {
        const sx = this.shadowX(w, cam.x, cam.viewportWidth);
        this.watchEyes = { x: sx, y: cam.y + 175, s: 1.3, a: 1, narrow: 0 };
        this.watchShadowAt = { x: sx, a: 0.5 };
      }
      return;
    }
    if (!this.watchEagle) {
      this.watchEagle = { id: 9977, type: 'eagle', x: 0, y: 0, vx: 0, vy: 0, width: 58, height: 42, hp: 1, maxHp: 1, facing: 1, patrolMinX: 0, patrolMaxX: 0, attackCooldown: 0, telegraphTimer: 0, isAttacking: false, animTimer: 0, hitFlashTimer: 0, defeated: false, koTimer: 0, behaviorTimer: 0 } as Enemy;
    }
    const e = this.watchEagle;
    const cam = this.camera;
    let scale = 1;
    let alpha = 1;
    if (w.phase === 'calm') {
      if (!zone) return;
      // far off, small, circling high over the trees
      const a = this.gameTime * 0.7;
      e.x = cam.x + cam.viewportWidth * (0.5 + 0.32 * Math.cos(a));
      e.y = cam.y + 120 + 10 * Math.sin(a * 2);
      e.facing = Math.sin(a) > 0 ? -1 : 1;
      e.swoopPhase = 'patrol';
      e.isAttacking = false;
      scale = 0.38;
      alpha = 0.55;
    } else if (w.phase === 'warn') {
      // it turns for its run: at the edge, flaring, and its shadow starts to show there
      const u = w.t / WATCH.warn;
      // (in from the edge to well inside the view, all of it on screen by the screech's end: upright, it sat half off the edge with
      // only its "!" showing, QA 2026-10-28)
      const inX = Math.min(130, cam.viewportWidth * 0.2);
      e.x = w.dir === 1 ? cam.x - 40 + (40 + inX) * Math.min(1, u * 1.6) : cam.x + cam.viewportWidth + 40 - (40 + inX) * Math.min(1, u * 1.6);
      e.y = cam.y + 125;
      e.facing = w.dir;
      e.swoopPhase = 'telegraph';
      scale = 0.6 + 0.4 * u;
      this.watchShadowAt = { x: w.dir === 1 ? cam.x + 30 : cam.x + cam.viewportWidth - 30, a: 0.18 + 0.3 * u };
    } else {
      const sx = this.shadowX(w, cam.x, cam.viewportWidth);
      e.facing = w.dir;
      if (w.seen) {
        // the dive: from where it saw him down to him, then back up and away
        const u = Math.min(1, w.diveT / WATCH.dive);
        const k = u < 1 ? u * u : 1;
        // (the harmless first pass pulls up short of him; and after a strike it climbs away on its way, never sitting on him: QA
        // 2026-10-28, 1-7, "the eagle sits on Pokey when it hits")
        const short = harmlessPass(w) ? 70 : 0;
        const away = Math.max(0, Math.min(1, (w.diveT - WATCH.dive) / 0.7));
        e.x = this.watchFrom.x + (this.player.x - this.watchFrom.x) * k + w.dir * 320 * away;
        e.y = this.watchFrom.y + (this.player.y - 40 - short - this.watchFrom.y) * k - 300 * away * away;
        e.swoopPhase = 'swoop';
        e.isAttacking = u > 0.6 && away === 0 && !short;
      } else {
        e.x = sx;
        e.y = cam.y + 125;
        e.swoopPhase = 'patrol';
        e.isAttacking = false;
        this.watchShadowAt = { x: sx, a: 0.5 };
      }
    }
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(e.x, e.y);
    ctx.scale(scale, scale);
    ctx.translate(-e.x, -e.y);
    if (!(this.currentStage.config.worldIndex === 4 && this.drawSovereignWatch(ctx, e)) && !drawEagleSprite(ctx, e, this.gameTime)) drawHarpyEagle(ctx, e, this.gameTime);
    ctx.restore();
  }

  /**
   * World 4's watcher is the Sky Sovereign herself, in her painted boss frames (sovereignSprite.ts): beating her wings while she
   * circles far off, screaming with her wings up at the edge of the view, gliding wide over the cliffs, plunging when she has seen him.
   * False until her atlas has loaded (the eagle stands in).
   */
  private drawSovereignWatch(ctx: CanvasRenderingContext2D, e: Enemy): boolean {
    const flap = ['down', 'glide', 'up', 'glide'][Math.floor(this.gameTime * 6.5) % 4];
    const name = e.swoopPhase === 'telegraph' ? 'alert' : e.swoopPhase === 'swoop' ? (e.isAttacking ? 'talon' : 'diveplunge') : this.watch.phase === 'pass' ? 'glide' : flap;
    // (she flies a little lower than the eagle, below the stage card in landscape, and comes down to him when she dives)
    const low = 50 * (e.swoopPhase === 'swoop' ? 1 - Math.min(1, this.watch.diveT / WATCH.dive) : 1);
    ctx.save();
    ctx.translate(e.x, e.y + 36 + low);
    ctx.scale(e.facing < 0 ? -1 : 1, 1);
    const ok = sovereignSprite.still(ctx, name);
    ctx.restore();
    return ok;
  }

  /** the eagle's shadow on the ground under x (the surface nearest below the middle of the view) */
  private drawWatchShadow(ctx: CanvasRenderingContext2D, x: number, a: number) {
    const top = this.camera.y + 120;
    let gy = this.player.y;
    let best = Infinity;
    for (const pl of this.platforms) {
      if (x < pl.x || x > pl.x + pl.width || pl.y < top || pl.y > this.camera.y + this.camera.viewportHeight + 60) continue;
      if (pl.y < best) { best = pl.y; gy = pl.y; }
    }
    if (this.currentStage.config.worldIndex === 3) {
      // the eyes' gaze: a pool of amber light on the floor
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(x, gy - 10, 10, x, gy - 10, 130);
      g.addColorStop(0, `rgba(251, 191, 36, ${a * 0.55})`);
      g.addColorStop(1, 'rgba(251, 191, 36, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(x, gy - 10, 130, 34, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }
    // a dark shadow on the grass (drawn after the front grass and the bushes, so they never hide it): a wide soft halo and a firmer
    // core, plain enough to read against the dark soil at a glance; the soft shadow sprite (w4Grit.ts), so neither shows an edge
    drawSoftShadow(ctx, x, gy - 6, 280, 46, a);
    drawSoftShadow(ctx, x, gy - 6, 190, 30, a * 1.6);
    drawSoftShadow(ctx, x, gy - 6, 150, 22, a * 1.4);
  }

  /** the bushes, in front of Pokey */
  /**
   * World 3's glowworms: standing still in the dark for GLOW_STILL wakes the sleeping lights near him, the far ones a moment later, and
   * they stay lit (the story: he stopped to listen, and the glowworms noticed).
   */
  private stepGlowworms(dt: number, zones: readonly import('./zones.ts').Zone[] | undefined) {
    const p = this.player;
    // a glowing mushroom's light wakes the glowworms it reaches, carried or set down (puzzleKit.ts ITEM.mushroom)
    const lamps = this.kit?.lights() ?? [];
    if (lamps.length) {
      for (const z of zones ?? []) {
        if (z.kind !== 'dark') continue;
        for (const l of z.lights ?? []) {
          if (!l.sleep || l.id === undefined || this.glowWake.has(l.id)) continue;
          if (lamps.some((m) => Math.hypot(m.x - l.x, m.y - l.y) <= m.r + 40)) this.glowWake.set(l.id, this.gameTime);
        }
      }
    }
    const dark = (zones ?? []).filter((z) => z.kind === 'dark' && z.lights?.some((l) => l.sleep) && p.x >= z.x0 - 120 && p.x <= z.x1 + 120);
    if (!dark.length) {
      this.glowStill = 0;
      return;
    }
    const still = p.grounded && Math.abs(p.vx) < 25 && !this.isGameOver;
    this.glowStill = still ? this.glowStill + dt : 0;
    if (this.glowStill < GLOW_STILL) return;
    let woke = 0;
    for (const z of dark) {
      for (const l of z.lights!) {
        if (!l.sleep || l.id === undefined || this.glowWake.has(l.id)) continue;
        if (l.x < p.x - GLOW_REACH.back || l.x > p.x + GLOW_REACH.ahead) continue;
        this.glowWake.set(l.id, this.gameTime + Math.max(0, l.x - p.x) / GLOW_REACH.speed);
        woke++;
      }
    }
    if (woke) {
      sound.playShrineUnlocked();
      const id = this.currentStage.config.id;
      if (!tipHeard(id, 'glow:woke')) {
        markTipHeard(id, 'glow:woke');
        this.guide('The glowworms noticed you! They light up when you stop and listen.', 4.5);
      }
    }
  }

  /**
   * World 3's thorn vines (thornVine.ts): a vine that is looking lashes at him if he moves within its reach; the lash lands a moment
   * later, and costs a heart if he is still in reach. One lash per look.
   */
  private stepThornVines() {
    const p = this.player;
    const vines = this.proto!.thorns!;
    const id = this.currentStage.config.id;
    for (let i = 0; i < vines.length; i++) {
      const v = vines[i];
      if (Math.abs(v.x - p.x) > 900) continue;
      const ph = vinePhase(v, this.gameTime);
      const cycle = Math.floor((this.gameTime + v.offset) / vinePeriod(v));
      // (the warning also comes walking up to one already looking, toward it: he may never be near one while it stirs, LV-14)
      const toward = (v.x - p.x) * (p.facing || 1) > 0;
      if ((ph.phase === 'stir' || (ph.phase === 'look' && toward)) && Math.abs(v.x - p.x) < v.reach + 260 && !tipHeard(id, 'vine:freeze')) {
        markTipHeard(id, 'vine:freeze');
        this.vineWarnAt = this.gameTime;
        // (3-8: on a liana the answer is to hang on, not to freeze)
        this.guide(p.isVineSwinging ? 'A thorn vine is stirring! Hang on to your liana until it sleeps' : 'A vine is stirring! Freeze until it goes back to sleep', 3.2);
      }
      const lash = this.vineLash.get(i);
      if (lash && this.gameTime - lash.at > VINE.windup + VINE.out) this.vineLash.delete(i);
      // a vine that hears the kit's noise while it looks (a pebble landing, a bell: noise.ts) strikes at the noise, once, and then
      // listens to it, seeing nobody (3-5's pebble lure: the vine strikes the clack while he slips past)
      const ear = this.kit ? heard(this.kit.noises, v.x, v.bud, this.gameTime) : null;
      if (ear && ph.phase === 'look' && !this.vineLash.has(i) && this.vineStruck.get(i) !== ear.t) {
        this.vineStruck.set(i, ear.t);
        this.vineLash.set(i, { at: this.gameTime, dir: ear.x >= v.x ? 1 : -1, landed: true, cycle });
        sound.playWhoosh();
      }
      if (!this.vineLash.has(i) && (lash?.cycle ?? -1) !== cycle && vineSees(v, this.gameTime, { ...p, swinging: p.isVineSwinging }, !!ear)) {
        // something flying past is struck at once (a leap is through its reach in half a second); on the ground it winds up first
        // (an awake vine swats him back the way he came)
        this.vineLash.set(i, { at: this.gameTime - (p.grounded ? 0 : VINE.windup - 0.1), dir: v.awake ? (p.facing >= 0 ? -1 : 1) : p.x >= v.x ? 1 : -1, landed: false, cycle });
        sound.playWhoosh();
      }
      const l = this.vineLash.get(i);
      if (l && !l.landed && this.gameTime - l.at >= VINE.windup) {
        l.landed = true;
        if (v.awake && inReach(v, p.x, p.y) && !p.isVineSwinging) {
          // the awake vine (3-5's pebble lure): a swat back out of its reach, never a heart (a puzzle never costs a life)
          p.vx = l.dir * 430;
          p.vy = -PHYS.hurtKnockV;
          p.grounded = false;
          p.squashX = 1.3;
          p.squashY = 0.7;
          this.airDrive = newAirDrive();
          // (his steering comes back a moment later, so the swat reads as a swat and carries him out of its reach)
          this.inputGrace = Math.max(this.inputGrace, 0.5);
          this.graceMoves = -1;
          this.camera.trauma = Math.min(1, this.camera.trauma + 0.3);
          if (!tipHeard(id, 'vine:awake')) {
            markTipHeard(id, 'vine:awake');
            this.guide("Swatted! This old vine doesn't sleep. It turns to any little sound, though", 3.6);
          }
          continue;
        }
        // (caught the next liana before it landed: he is out of its sight again)
        if (inReach(v, p.x, p.y) && p.invincibleTimer <= 0 && !p.isVineSwinging) {
          const flying = !p.grounded;
          // a safe first showing (LV-14): the stage's first lash, before its warning has been up 2.5 s (a kid's reaction), is a swat back (on the ground)
          // or a near miss (in a leap), never a heart
          const first = !this.vineLashed && (this.vineWarnAt < 0 || this.gameTime - this.vineWarnAt < 2.5);
          this.vineLashed = true;
          if (first) {
            if (!flying) {
              p.vx = l.dir * 360;
              p.vy = -PHYS.hurtKnockV * 0.7;
              p.grounded = false;
              this.airDrive = newAirDrive();
              this.inputGrace = Math.max(this.inputGrace, 0.4);
              this.graceMoves = -1;
            }
            p.squashX = 1.25;
            p.squashY = 0.75;
            p.invincibleTimer = Math.max(p.invincibleTimer, 1);
            this.camera.trauma = Math.min(1, this.camera.trauma + 0.25);
            // (the swat says why, in Dot's own words for a lash: a warning lost behind another line leaves it unexplained)
            const key = flying ? 'vine:hitAir' : 'vine:hit';
            if (!tipHeard(id, key)) {
              markTipHeard(id, key);
              markTipHeard(id, 'vine:freeze');
              this.guide(flying ? 'Ouch! Hang on to your liana while a thorn vine looks, and let go while it sleeps' : 'Ouch! When a vine opens an eye, stand still, or duck', 3.4);
            }
            continue;
          }
          this.damagePlayer(1);
          p.vx = l.dir * 260;
          const key = flying ? 'vine:hitAir' : 'vine:hit';
          if (!tipHeard(id, key)) {
            markTipHeard(id, key);
            this.guide(flying ? 'Ouch! Hang on to your liana while a thorn vine looks, and let go while it sleeps' : 'Ouch! When a vine opens an eye, stand still, or duck', 3.4);
          }
        }
      }
    }
  }

  /**
   * World 4 (w4Play.ts): the rocks, the fern and the mist, the falls and their pools, the chimes, Dot's knots and the capuchins. Wading
   * in pouring water slows him on top of whatever the wind is doing; a lookout's screech brings the Sovereign's pass early.
   */
  private stepW4(dt: number) {
    const p = this.player;
    const id = this.currentStage.config.id;
    const me = { x: p.x, y: p.y, ducking: !!p.ducking, grounded: p.grounded, hanging: !!p.hanging };
    const out = this.w4!.step(dt, {
      t: this.gameTime,
      player: p,
      platforms: this.platforms,
      vines: this.vines,
      collectibles: this.collectibles,
      zones: this.currentStage.zones ?? [],
      punch: p.punching && (p.attackU ?? 1) < 0.6 ? { x: p.x + p.facing * 40, y: p.y - 40 } : null,
      hidden: hidden(this.proto?.bushes ?? [], me) || this.w4!.behindFall(p.x, p.y),
      hurt: (dir) => {
        this.damagePlayer(1);
        p.vx = dir * 240;
        this.camera.trauma = Math.min(1, this.camera.trauma + 0.3);
      },
      tip: (key, text, seconds) => {
        if (tipHeard(id, key)) return;
        markTipHeard(id, key);
        this.guide(text, seconds);
      },
      float: (text, x, y, color) => this.addFloatingText(text, x, y, color),
      screech: () => {
        // the monkey's shout brings the Sovereign: her warning starts now (and is as long as ever, so there is time to hide)
        if (this.proto?.watch && this.watch.phase === 'calm') {
          this.watch.phase = 'warn';
          this.watch.t = 0;
          this.watch.dur = WATCH.warn;
          sound.playEagleScreech();
          this.addFloatingText('HIDE!', p.x, p.y - 96, '#fbbf24');
          this.input.triggerHaptic(120);
        }
      },
      fellOff: () => {
        if (this.isGameOver || this.softFall()) return;
        sound.playPlayerHurt();
        this.loseLife('pit');
      },
      // 4-9 The Aerie: a guard blown off its ledge while he is close counts toward the stage's goal
      defeat: () => {
        p.enemiesDefeated++;
      },
      shake: (n) => {
        this.camera.trauma = Math.min(1, Math.max(this.camera.trauma, n));
      },
      sfx: (kind) => {
        if (kind === 'cry') sound.playEagleScreech();
        else if (kind === 'rock') sound.playHitImpact();
        else if (kind === 'chime') sound.playVineGrab();
        else if (kind === 'monkey') sound.playPredator('tayra', 0);
        else if (kind === 'frond') sound.playShrineUnlocked();
        else if (kind === 'knot') sound.playRelicFound();
        else sound.playWhoosh();
      },
    });
    this.dragSpeed *= out.speed;
    // thrown back by pouring water: his steering comes back a moment later, so the knock reads as a knock
    if (out.knocked) this.inputGrace = Math.max(this.inputGrace, FALLS.stagger);
    // a freed eaglet's parent beating its wings over the nest (4-8): a tailwind on top of the gust lanes
    this.windV += out.wind;
  }

  /** the puzzle kit's view of the engine this frame (one object, its fields kept up to date) */
  private kitHost(): KitHost {
    const id = this.currentStage.config.id;
    const h = (this.kitHostObj ??= {
      t: 0,
      player: this.player,
      standingOn: -1,
      easy: isEasy(),
      tip: (key, text, seconds) => {
        // (Meeca's stage: her own thoughts and the others' bubbles, never Dot's)
        if (this.mc) return this.mc.kitLine(key, text, seconds);
        if (tipHeard(id, key)) return;
        markTipHeard(id, key);
        this.guide(tipText(text), seconds);
      },
      float: (text, x, y, color) => this.addFloatingText(text, x, y, color),
      passTip: (text) => this.callbacks.onGuide?.(text, 0, true),
      freeCage: (c) => this.freeCritter(c),
      stuck: (room) => this.mc?.stuck(room),
      glowAt: () => this.mc?.flickerAt() ?? null,
      sfx: (kind) => {
        if (kind === 'pick') sound.playVineGrab();
        else if (kind === 'drop' || kind === 'land') sound.playLand(kind === 'drop' ? 0.4 : 0.25);
        else if (kind === 'throw' || kind === 'lost') sound.playWhoosh();
        else if (kind === 'press' || kind === 'lift') sound.playTreeClimb();
        else if (kind === 'gate') sound.playShrineUnlocked();
        else if (kind === 'lever') sound.playPunch();
        else if (kind === 'munch') sound.playFruitPickup();
        else if (kind === 'reset') sound.playCheckpoint();
        else if (kind === 'ring') sound.playShrineUnlocked();
        else if (kind === 'noise') sound.playHitImpact(false);
        else if (kind === 'tilt') sound.playLand(0.3);
        else if (kind === 'trade') sound.playFruitPickup();
        else if (kind === 'sink' || kind === 'stick') sound.playLand(0.35);
        else if (kind === 'wiggle') sound.playStep();
        else if (kind === 'pop' || kind === 'bend' || kind === 'unroll') sound.playWhoosh();
        else if (kind === 'snap') sound.playPunch();
        else if (kind === 'tip' || kind === 'pour') sound.playLand(0.5);
        else if (kind === 'bloom') sound.playShrineUnlocked();
        else if (kind === 'sip') sound.playFruitPickup();
      },
    });
    h.t = this.gameTime;
    h.player = this.player;
    h.standingOn = this.standingOnId;
    h.steer = this.kitSteer;
    h.poke = this.kitPoke;
    // (Meeca's stage: a generous tap, QA 2026-10-29)
    if (this.mc) h.reachK = MEECA_REACH;
    return h;
  }
  /** a new tap, flick or press this frame (a trap chair counts it as a wiggle), and whether one was down the frame before */
  private kitPoke = false;
  private kitPokeWas = false;

  /**
   * The puzzle kit's controls, from the intents as they are (touchGestures.ts and the input are untouched): a tap with a piece in reach
   * in front of him uses it instead of punching; carrying, the jump intent throws up and forward, the kick intent throws forward and a
   * tap sets it down, and none of them is ever a jump, a kick or a punch while his hands are full.
   */
  private kitControls() {
    const inp = this.input.state;
    this.kitSteer = inp.left && !inp.right ? -1 : inp.right && !inp.left ? 1 : 0;
    const poke = inp.punchPressed || inp.jumpPressed || inp.kickPressed;
    this.kitPoke = poke && !this.kitPokeWas;
    this.kitPokeWas = poke;
    const took = this.kit!.control({ tap: inp.punchPressed, up: inp.jumpPressed, side: inp.kickPressed, sideDir: inp.kickDir }, this.kitHost(), this.platforms);
    if (took.tap) inp.punchPressed = false;
    if (took.up) {
      inp.jumpPressed = false;
      this.upIntent = 0;
    }
    if (took.side) {
      inp.kickPressed = false;
      inp.kickDir = 0;
    }
    if (this.kit!.holding) {
      inp.megaPunchPressed = false;
      inp.jumpPressed = false;
      inp.punchPressed = false;
      inp.kickPressed = false;
      this.jumpBufferTimer = 0;
      this.atkQueue = null;
    }
    // held by a trap (a soft chair, the silk line) or riding a sapling over: his steering, jumping and climbing are not his (the wiggle
    // was counted from the steering first, kitSteer)
    const hold = this.kit!.hold();
    if (hold && hold !== 'sip') {
      Object.assign(inp, { left: false, right: false, up: false, down: false, jumpPressed: false, jumpHeld: false, punchPressed: false, kickPressed: false, megaPunchPressed: false });
      this.jumpBufferTimer = 0;
      this.upIntent = 0;
      this.climbAssist = 0;
      this.atkQueue = null;
    }
    // Meeca cannot fight: what the kit did not take of a tap or a flick is nothing
    if (this.mc) {
      inp.punchPressed = false;
      inp.kickPressed = false;
      inp.megaPunchPressed = false;
      this.atkQueue = null;
    }
  }

  /** the most a puzzle room may pull back now, of the usual zoom (puzzleCamera.ts roomFloor: further upright than sideways) */
  private roomFloorNow(): number {
    return roomFloor(this.viewCssW, this.viewCssH, this.roomUsual);
  }

  /** the puzzle rooms, each frame (puzzlePlay.ts): carrying, he walks slower; the room's framing eases in, and out again outside it */
  private stepKit(dt: number) {
    this.dragSpeed *= this.kit!.step(dt, this.kitHost(), this.platforms);
    // (the Butler's sleepy steam: the drowsy veil, as World 5's teapots give it)
    this.drowsy = Math.max(this.drowsy, this.kit!.sleepy());
    const cam = this.camera;
    const kf = this.kit!.camFocus(this.player, cam.viewportWidth * this.roomZoom, cam.viewportHeight * this.roomZoom, this.roomFloorNow());
    const want = kf ? (kf.pan ? this.roomZoom : kf.zoom) : 1;
    const prev = this.roomZoom;
    this.roomZoom += (want - this.roomZoom) * Math.min(1, dt * ROOM_CAM.ease);
    if (Math.abs(want - this.roomZoom) < 0.002) this.roomZoom = want;
    if (this.roomZoom !== prev) this.applyZoom();
  }

  /**
   * World 5 (w5Play.ts): the stillness and its silk, the soft chairs' tug, the cakes and the Butler, the teapots, the humming threads and
   * the spiders they wake, the sheets, the orchids and the cocoons. Sleepy (a cake, the steam) or silk-stuck, he walks slower; a chair's
   * tug is a push like the wind's.
   */
  private stepW5(dt: number) {
    const p = this.player;
    const id = this.currentStage.config.id;
    const s = this.input.state;
    const cam = this.camera;
    const out = this.w5!.step(dt, {
      t: this.gameTime,
      player: p,
      steer: s.left && !s.right ? -1 : s.right && !s.left ? 1 : 0,
      // (the spiders crouch only in full view: the real view at every orientation, viewportWidth being the CSS width over the zoom)
      view: { x0: cam.x, x1: cam.x + cam.viewportWidth, y0: cam.y, y1: cam.y + cam.viewportHeight },
      platforms: this.platforms,
      collectibles: this.collectibles,
      enemies: this.enemies,
      punch: p.punching && (p.attackU ?? 1) < 0.6 ? { x: p.x + p.facing * 40, y: p.y - 40 } : null,
      swing: this.swingId,
      hurt: (dir) => {
        this.damagePlayer(1);
        if (dir) p.vx = dir * 200;
      },
      tip: (key, text, seconds) => {
        if (tipHeard(id, key)) return;
        markTipHeard(id, key);
        this.guide(text, seconds);
      },
      clearTip: () => this.clearGuide(),
      passTip: (text) => this.callbacks.onGuide?.(text, 0, true),
      float: (text, x, y, color, life) => this.addFloatingText(text, x, y, color, life),
      rescue: () => {
        p.crittersRescued++;
      },
      ate: () => {
        recordCake(id);
      },
      sfx: (kind) => {
        if (kind === 'hum') sound.playVineGrab();
        else if (kind === 'wrap') sound.playPlayerHurt();
        else if (kind === 'cake') sound.playFruitPickup();
        else if (kind === 'tray') sound.playHitImpact();
        else if (kind === 'crack') sound.playPunch();
        else if (kind === 'free') sound.playCritterRescued();
        else sound.playWhoosh();
      },
    });
    this.dragSpeed *= out.speed;
    if (p.grounded) this.windV += out.pull;
  }

  /** how awake a sleeping light is: 0 asleep, rising to 1 over GLOW_REACH.fade once it wakes */
  private glowLit(id: number): number {
    const at = this.glowWake.get(id);
    if (at === undefined) return 0;
    return Math.max(0, Math.min(1, (this.gameTime - at) / GLOW_REACH.fade));
  }

  private drawBushes(ctx: CanvasRenderingContext2D) {
    const p = this.player;
    const bushes = this.proto?.bushes ?? [];
    for (let i = 0; i < bushes.length; i++) {
      const b = bushes[i];
      if (!this.onScreen(b.x + b.w / 2, b.y, 400)) continue;
      const inside = p.x > b.x && p.x < b.x + b.w && (b.hanging ? !!p.hanging && p.y > b.y : Math.abs(p.y - b.y) < 12);
      // (World 4 has its own painted cover: w4Art.ts)
      if (this.w4 && !b.hanging && drawW4Bush(ctx, b, inside, this.bushRustle.get(i) ?? 0, this.gameTime)) continue;
      if (b.kind === 'grotto' ? drawW3Fern(ctx, b, inside, this.bushRustle.get(i) ?? 0, this.gameTime) : drawBushArt(ctx, { ...b, kind: b.kind }, inside, this.bushRustle.get(i) ?? 0, this.gameTime)) continue;
      // before the sheet loads: a plain green mound
      const h = b.kind === 'grotto' ? w3FernHeight(b.w) : bushHeight({ ...b, kind: b.kind });
      ctx.save();
      ctx.globalAlpha = inside ? 0.8 : 1;
      ctx.fillStyle = '#2f6b2a';
      ctx.beginPath();
      if (b.hanging) ctx.ellipse(b.x + b.w / 2, b.y + h / 2, b.w / 2, h / 2, 0, 0, Math.PI * 2);
      else ctx.ellipse(b.x + b.w / 2, b.y - h / 2 + 6, b.w / 2, h / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  /** a sleeping animal's Z's, drifting up from its head (a stand-in until the sleeping snake art arrives) */
  private drawSleepZ(ctx: CanvasRenderingContext2D, e: Enemy) {
    ctx.save();
    ctx.font = `700 15px ${FONT_UI}`;
    ctx.textAlign = 'center';
    for (let i = 0; i < 3; i++) {
      const u = (this.gameTime * 0.45 + i / 3 + e.id * 0.13) % 1;
      ctx.globalAlpha = Math.sin(u * Math.PI) * 0.9;
      ctx.fillStyle = '#eef6ff';
      ctx.strokeStyle = 'rgba(20, 38, 26, 0.7)';
      ctx.lineWidth = 3;
      const zx = e.x + e.facing * 10 + u * 22, zy = e.y - 18 - u * 40;
      ctx.font = `700 ${11 + u * 9}px ${FONT_UI}`;
      ctx.strokeText('z', zx, zy);
      ctx.fillText('z', zx, zy);
    }
    ctx.restore();
  }

  /** a guiding line: kept as the stage hint (one at a time), and handed to the app for Dot to say */
  private guide(text: string, seconds: number) {
    this.stageHint = { text, life: seconds };
    this.bossGuideUp = false;
    this.guideN++;
    this.callbacks.onGuide?.(text, seconds);
  }

  /** take Dot's line down now (an empty line clears it: Wayside.tsx) */
  private clearGuide() {
    this.stageHint = null;
    this.bossGuideUp = false;
    this.callbacks.onGuide?.('', 0);
  }

  private addFloatingText(text: string, x: number, y: number, color: string, life = 0.8) {
    this.floatingTexts.push({
      id: Math.random(),
      text,
      x,
      y,
      color,
      life,
      maxLife: life,
      scale: 1,
    });
  }

  /** which way off a trunk's top has more ledge to land on (within 200 px), so a vault with only up held lands on it; a tie keeps `facing` */
  private vaultSide(v: Vine, facing: 1 | -1): 1 | -1 {
    const reach = (dir: 1 | -1) => {
      let d = 0;
      while (d < 200) {
        const x = v.x + dir * (d + 10);
        if (!this.platforms.some((q) => !q.broken && q.type !== 'bouncy' && x >= q.x && x <= q.x + q.width && q.y >= v.topY - 16 && q.y <= v.topY + 30)) break;
        d += 10;
      }
      return d;
    };
    const l = reach(-1), r = reach(1);
    return l === r ? facing : r > l ? 1 : -1;
  }

  /** one particle, from the pool; past the cap the oldest is reused, so a frame never holds more than MAX_PARTICLES */
  private emit(p: Particle) {
    let q: Particle;
    if (this.particles.length >= MAX_PARTICLES) {
      q = this.particles[this.particleWrap++ % MAX_PARTICLES];
    } else {
      q = this.particlePool.pop() ?? ({} as Particle);
      this.particles.push(q);
    }
    q.x = p.x;
    q.y = p.y;
    q.vx = p.vx;
    q.vy = p.vy;
    q.color = p.color;
    q.size = p.size;
    q.life = p.life;
    q.maxLife = p.maxLife;
    q.type = p.type;
    q.seed = p.seed ?? Math.random();
  }

  /** the painted hit spark (a brief glow and the star bursting into rays), `w` wide, and a few sparkles flying off it */
  private spawnHitSpark(x: number, y: number, w: number, color: string, sparkles: number) {
    this.emit({ x, y, vx: 0, vy: 0, color, size: w, life: 0.3, maxLife: 0.3, type: 'flash' });
    for (let i = 0; i < sparkles; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 90 + Math.random() * 120;
      this.emit({ x, y, vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd - 30, color, size: 2.6, life: 0.32, maxLife: 0.32, type: 'star' });
    }
  }

  private spawnSparkBurst(x: number, y: number, color: string) {
    this.spawnHitSpark(x, y, 46, color, 3);
  }

  private spawnClawHitSparks(x: number, y: number, isMega: boolean) {
    this.spawnHitSpark(x + this.player.facing * 6, y, isMega ? 74 : 50, isMega ? '#fef08a' : '#bbf7d0', isMega ? 5 : 3);
    const count = isMega ? 4 : 0;
    for (let i = 0; i < count; i++) {
      const angle = (Math.random() - 0.5) * Math.PI;
      const spd = 120 + Math.random() * 180;
      this.emit({
        x,
        y,
        vx: (this.player.facing * spd * 0.8) + (Math.random() - 0.5) * 80,
        vy: (Math.random() - 0.5) * 120,
        color: isMega ? '#fef08a' : '#86efac',
        size: 3.2,
        life: 0.35,
        maxLife: 0.35,
        type: 'star',
      });
    }
  }

  /** a burst of bits, painted (debrisLook: sparkles, leaves, stone grit, or earth-brown grit under a puff of dust) */
  private spawnDebrisBurst(x: number, y: number, color: string) {
    const look = debrisLook(color);
    if (look === 'earth') this.emit({ x, y: y + 6, vx: 0, vy: -10, color: '', size: 46, life: 0.5, maxLife: 0.5, type: 'puff' });
    const n = look === 'star' ? 8 : look === 'leaf' ? 8 : 10;
    for (let i = 0; i < n; i++) {
      this.emit({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 180,
        vy: -80 - Math.random() * 160,
        color: look === 'star' ? color : look === 'earth' ? color : look === 'leaf' ? 'green' : '',
        size: look === 'star' ? 2.6 + Math.random() * 1.4 : 3 + Math.random() * 3,
        life: 0.5 + Math.random() * 0.3,
        maxLife: 0.8,
        type: look === 'star' ? 'star' : look === 'leaf' ? 'leaf' : 'grit',
      });
    }
  }

  /**
   * A soft painted dust puff where he takes off or lands (the dust strip in boss-fx.webp), bigger and slower to clear the harder he came
   * down (`speed`: how fast he was falling, px/s); a hard landing throws two more puffs out to the sides.
   */
  private spawnJumpDust(x: number, y: number, speed = 0) {
    const k = Math.max(0, Math.min(1, speed / PHYS.maxFall));
    const life = 0.36 + 0.2 * k;
    this.emit({ x, y: y + 2, vx: 0, vy: -8, color: '', size: 40 + 44 * k, life, maxLife: life, type: 'puff' });
    if (k > 0.4) {
      for (const d of [-1, 1]) this.emit({ x: x + d * 10, y: y + 2, vx: d * (70 + 90 * k), vy: -6, color: '', size: 26 + 22 * k, life: life * 0.9, maxLife: life * 0.9, type: 'puff' });
    }
  }

  private spawnDoubleJumpBurst(x: number, y: number) {
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      const spd = 70 + Math.random() * 90;
      this.emit({
        x: x + Math.cos(angle) * 12,
        y: y + Math.sin(angle) * 8,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd + 40,
        color: 'green',
        size: 3.5,
        life: 0.55,
        maxLife: 0.55,
        type: 'leaf',
      });
    }
  }

  private spawnKickHitBurst(x: number, y: number) {
    this.spawnHitSpark(x + this.player.facing * 8, y, 62, '#fde047', 4);
    for (let i = 0; i < 4; i++) {
      const angle = (Math.random() - 0.5) * Math.PI;
      const spd = 140 + Math.random() * 190;
      this.emit({
        x,
        y,
        vx: (this.player.facing * spd * 0.9) + (Math.random() - 0.5) * 60,
        vy: (Math.random() - 0.5) * 140,
        color: i % 2 === 0 ? '#fdba74' : '#fde047',
        size: 3.4,
        life: 0.38,
        maxLife: 0.38,
        type: 'star',
      });
    }
  }

  private spawnEagleFeatherBurst(x: number, y: number) {
    for (let i = 0; i < 14; i++) {
      const angle = (Math.random() - 0.5) * Math.PI * 2;
      const spd = 50 + Math.random() * 120;
      this.emit({
        x: x + (Math.random() - 0.5) * 24,
        y: y + (Math.random() - 0.5) * 18,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd - 35,
        color: '',
        size: 3.6 + Math.random() * 1.4,
        life: 0.9,
        maxLife: 0.9,
        type: 'feather',
      });
    }
  }
}
