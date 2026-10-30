/**
 * protoStage — a hand-built 1-6 "First Lianas", the first stage designed the new way (2026-10-23 test, off by default).
 *
 * One idea, played in four beats (learn, develop, twist, finish), with a puzzle and two secrets:
 *   1. LEARN    two swing hollows with a soft mossy floor: a missed swing costs a few seconds, never a life;
 *   2. DEVELOP  a three-liana chain over the gorge, then climb a kapok and leap from its top to a liana only the top can reach;
 *   3. PUZZLE   the high canopy is a wall too tall to jump: push the hollow log against it and climb. Push the log the
 *               other way, under the low branch, and it reaches a hidden nook with a golden seed (secret 1);
 *   4. TWIST    the canopy road: a long branch creaks and snaps under Pokey, and two lianas hang below to catch him.
 *               A ledge far out over the forest floor holds a second seed that only the Leaf Glide (World 4) can reach:
 *               you see it now and come back for it later (secret 2);
 *   5. FINISH   four lianas home over the last gorge, to the Exit Shrine.
 *
 * Planned, details rolled (Matt's choice, 2026-10-23): the beats above are always there, in that order, and a seed (the dice) sets how
 * many vines each chain has, how far apart and how high they hang, the length of every stretch, the snakes, and the order inside a beat.
 * Every rolled piece is checked against the shared physics (protoCheck.ts) and rolled again if it fails (see protoStage.test.ts).
 */
import { teachWater } from './waterTeach.ts';
import { fixPickups } from './flowerReach.ts';
import { PAST_SHRINE } from './rules.ts';
import type { GeneratedStage } from './stageGenerator.ts';
import type { Collectible, Enemy, LevelConfig, Platform, Rope, TreeStructure, Vine } from './types.ts';
import { DOUBLE_RISE, JUMP_RISE, PHYS, reachGlide, reachJump, reachJumpHeld, SAFE } from './physics.ts';
import { validateStage, type CheckGraph } from './levelCheck.ts';
import { HANG_DROP, ROPE_RISE, ROPE_SPEED } from './rope.ts';
import { findForStage } from './finds.ts';
import type { Bush, WatchZone } from './watcher.ts';
import { catchWindow, earlyCatch, jumpGrab, jumpReaches, landWindow, leapBand, maxRise } from './protoCheck.ts';
import type { W2Decor } from './riverArt.ts';
import { driftX, gapFor, LOG_DROP, LOG_HEIGHT, logLayout, surfaceBelowBank, type RiverZone } from './river.ts';
import type { SkillId } from './skills.ts';
import type { Zone } from './zones.ts';
import type { W3Decor } from './w3Art.ts';
import type { ThornVine } from './thornVine.ts';
import { ROCK, rockFits, type RockDrop } from './rockfall.ts';
import { PATIENCE, type PatienceSpot } from './patience.ts';
import { NEST, type Nest } from './eaglet.ts';
import { DOT_HELP, KNOT_TEACH, type Chime, type DotKnot } from './w4Kit.ts';
import { buildWaterfallSteps } from './w4Stage43.ts';
import type { CliffNest, NestKind } from './w4Nests.ts';
import { buildLongDrop } from './w4LongDrop.ts';
import { buildStiltClimb } from './w6Stages.ts';
import { buildSlideStage } from './w7Slide.ts';
import { buildAerie } from './w4Stage49.ts';
import { buildW5Stage } from './w5Stages.ts';
import { buildW5Stage54 } from './w5Stage54.ts';
import type { FruitTree, W4Extras } from './w4Play.ts';
import type { Waterfall } from './waterfalls.ts';
import type { Capuchin } from './capuchin.ts';
import { DRESS_WORLDS, dressSets, dressStage } from './artDress.ts';
import { w1Chase, w1Kapok, w1Section, type Slot, type W1Kit, type W1Stage } from './w1Sections.ts';
import { W4Roll } from './w4Sections.ts';
import { buildSinkhole, w3Pick } from './w3Sections.ts';
import { addKitPlatforms, roomBox, type Anchor, type KitExtras, type RoomSpec, type RoomTips } from './puzzleKit.ts';

export const PROTO_STAGE_ID = '1-6';
/** every stage built the new way so far (behind the New stages switch): stage id -> its plan */
export type StagePlan = 'proto' | 'ctest' | '1-1' | '1-2' | '1-3' | '1-4' | '1-5' | '1-7' | '1-8' | '1-9' | '3-1' | '3-2' | '3-3' | '3-4' | '3-5' | '3-6' | '3-7' | '3-8' | '3-9' | '4-1' | '4-2' | '4-3' | '4-4' | '4-5' | '4-6' | '4-7' | '4-8' | '4-9' | '5-1' | '5-2' | '5-3' | '5-4' | '5-5' | '6-8' | '7-4';
export const HAND_STAGES: Record<string, Exclude<StagePlan, 'ctest'>> = { '1-1': '1-1', '1-2': '1-2', '1-3': '1-3', '1-4': '1-4', '1-5': '1-5', '1-6': 'proto', '1-7': '1-7', '1-8': '1-8', '1-9': '1-9', '3-1': '3-1', '3-2': '3-2', '3-3': '3-3', '3-4': '3-4', '3-5': '3-5', '3-6': '3-6', '3-7': '3-7', '3-8': '3-8', '3-9': '3-9', '4-1': '4-1', '4-2': '4-2', '4-3': '4-3', '4-4': '4-4', '4-5': '4-5', '4-6': '4-6', '4-7': '4-7', '4-8': '4-8', '4-9': '4-9', '5-1': '5-1', '5-2': '5-2', '5-3': '5-3', '5-4': '5-4', '6-8': '6-8' };
// 5-5 Caught in Silk (w5Stages.ts): the cocoons and the pouch scene
HAND_STAGES['5-5'] = '5-5';
// 7-4 The Way Down (Matt, 2026-10-29: not a climb; the floor crumbles into a slide seen from behind: w7Slide.ts)
HAND_STAGES['7-4'] = '7-4';

/** the hand-built 1-6 is played instead of the generated one (saved on the device; ?proto=1 also turns it on) */
export function protoStageEnabled(): boolean {
  // the stages rebuilt from the stage plan are the game's stages since 2026-10-24 (Matt tested them; no switch since 2026-10-26).
  // Outside a browser (the generator's own tests) the generated stages are what is being checked, so they are built there; the
  // hand-built stages have their own tests (stage1x.test.ts, protoStage.test.ts), which call buildProtoStage directly.
  return typeof location !== 'undefined';
}
/** ground height, the water line, and the height of a bank of earth */
export const G = 580;
const WATER = 730;
const BANK_H = 90;

/** the pushable hollow log */
export const LOG = { w: 220, h: 100 } as const;

/** a short line shown above Pokey the first time he passes x */
/** `text` is for screen gestures (the default), `pad` and `keys` for the on-screen pad and a keyboard */
export interface StageHint {
  x: number; text: string; pad: string; keys: string; shown?: boolean;
  /** only when Pokey is this low or lower (fell to the floor) */
  belowY?: number;
  /** only when Pokey is this high or higher (a climbing stage: the hint waits for his height, not his x) */
  aboveY?: number;
  /** only while Pokey is left of this x (a line about something he has already gone by is not said late, from further on) */
  beforeX?: number;
  /**
   * a move tip about one spot (a wide gap, a tall stump): once he stands on the ground past this x the moment has passed, and the line
   * goes, done or not (engine.ts; QA 5-1, 2026-10-26: "Wide gap!" stayed up from the gap on to the next stumps)
   */
  passX?: number;
  /**
   * the thing this line teaches the first time (a mechanic, a creature, a hazard): said once on this device, in the first stage that
   * reaches it, never again in a later stage (Matt's rule: a lesson line is said once per save). Without it the line is the stage's own
   * (said the first time that stage is played)
   */
  firstOf?: string;
}
/** leaves drawn in front of a hidden nook; they part when Pokey comes close */
export interface LeafCover { x: number; y: number; w: number; h: number }

export interface ProtoExtras {
  hints: StageHint[];
  covers: LeafCover[];
  /** the beats, for the blueprint and the tests: [x0, x1, name] */
  beats: Array<[number, number, string]>;
  /** pickups the last pass had to move to where he can get them (flowerReach.ts): a hand-built stage should need none */
  movedPickups?: number;
  /** hollows in climb trunks (1-4): drawn on the trunk at this height, glowing once he is close */
  hollows?: Array<{ x: number; y: number }>;
  /**
   * a ring of branches walled at its far end (1-9): snakes drop from the canopy in waves when he comes in, and the wall opens when
   * every one of them is down. Each drop names the surface it lands on. In 3-9's ring the prowlers leap in out of the dark instead.
   */
  ring?: { x0: number; x1: number; wallId: number; waves: Array<Array<{ x: number; surface: number; kind: 'snake' | 'boa' | 'ocelot' | 'jaguar' }>> };
  /** the collapse that chases him along the long branch (1-8: chase.ts) */
  chase?: import('./chase.ts').ChasePlan;
  /** the dirty tide that comes in under him as he climbs (6-8: risingTide.ts) */
  tide?: import('./risingTide.ts').TidePlan;
  /**
   * the top of a climb opening onto the next world (6-8: the ruins of World 7): from height `from` to `full` (world y) the backdrop turns
   * to `strips` (backdrop stems) in golden light, loaded once he is above `load`; standing on the crown (`crown`, its top) the view pulls back
   */
  reveal?: { from: number; full: number; load: number; crown: number; strips: { far: string; mid: string; near: string } };
  /** 6-8's dressing from Matt's painted World 6 pieces: hides and arches on the shelves, the root wall behind (w6StiltArt.ts) */
  stilt?: import('./w6StiltArt.ts').StiltDecor[];
  /** 6-8's ledges painted in Matt's other World 6 pieces (their platforms are art 'stilt': w6StiltArt.ts) */
  stiltLedges?: import('./w6StiltArt.ts').StiltLedge[];
  /** a stage that shows more of the world than usual (engine applyZoom: world px tall sideways, wide upright), as 4-7's w4.view */
  view?: { land: number; port: number };
  /** bushes to hide in, and the stretches the eagle watches (1-7: watcher.ts) */
  bushes?: import('./watcher.ts').Bush[];
  watch?: import('./watcher.ts').WatchZone[];
  /** World 4's rocks, patience spots, falls and pools, chimes, Dot's knots, capuchins and fruit (w4Play.ts) */
  w4?: import('./w4Play.ts').W4Extras;
  /** World 5's chairs, cakes, teapots, threads, sheets, orchids, cocoons, carvings and spiders (w5Kit.ts, run by w5Play.ts) */
  w5?: import('./w5Kit.ts').W5Extras;
  /** the new generator's own extras (gen2/pipeline.ts fillSockets): the water-warning signs at the water's edge */
  gen2?: { waterWarnings?: Array<{ x: number; y: number }> };
  /** Meeca's stage (5-M, after 5-5): the column, the trees she carves, the ferns and the guards' rhythms (meecaStage.ts, run by meecaPlay.ts) */
  meeca?: import('./meecaStage.ts').MeecaStage;
  /** 7-4's slide (w7Slide.ts): the crumble, the chute's courses and the chamber (run by w7SlideRun.ts) */
  slide?: import('./w7Slide.ts').SlideStage;
  /** World 3's sleeping thorn vines (3-5: thornVine.ts) */
  thorns?: import('./thornVine.ts').ThornVine[];
  /** World 3's painted dressing: stalactites, glowworm threads, ferns, the grotto mouth (protoStage.ts, drawn by w3Art.ts) */
  w3decor?: import('./w3Art.ts').W3Decor[];
  /** Matt's World 3 and 4 puzzle sheets set in as dressing once the stage is built (artDress.ts): pictures only */
  kitDecor?: import('./puzzleArt.ts').KitDecor[];
  /** Worlds 1, 2 and 5: the bank, hanging and clutter sets (artDress.ts dressSets; pictures only) */
  dress?: import('./dressArt.ts').DressPiece[];
  /** World 2's painted dressing: reeds, lily pads, the village's doors and signs, and its folk (w2Stages.ts, drawn by riverArt.ts) */
  decor?: import('./riverArt.ts').W2Decor[];
  /** 2-6: the climbs are the village's ladders (riverArt.ts drawLadder), not trunks */
  ladders?: boolean;
  /** 4-1 and 4-6's catch branches under the hop gaps of the climb (platform id, the gap's two planks) */
  catches?: Array<{ plat: number; planks: [number, number] }>;
  /** 2-6: the face of the river bank the village is dug into, behind the whole climb (drawn by protoArt.ts drawEarthWall) */
  bankWall?: { x0: number; x1: number; top: number; bottom: number };
  /** the control test's mix: the seed and the stretches it drew, in order (logged when the run starts, so any run can be built again) */
  mix?: string;
  /** moves this stage lends him whether or not he has learned them yet (the control test's rope stretch needs Shimmy Rope) */
  grant?: SkillId[];
}

/** a small seeded random stream (mulberry32): the same seed always builds the same stage */
export function stream(seed: number) {
  let a = (seed * 2654435761) >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    f: next,
    /** a number between a and b */
    r: (a: number, b: number) => a + (b - a) * next(),
    /** a whole number from a to b */
    i: (a: number, b: number) => a + Math.floor(next() * (b - a + 1)),
    chance: (p: number) => next() < p,
    pick: <T,>(xs: readonly T[]) => xs[Math.floor(next() * xs.length)],
    shuffle: <T,>(xs: T[]) => {
      for (let k = xs.length - 1; k > 0; k--) {
        const j = Math.floor(next() * (k + 1));
        [xs[k], xs[j]] = [xs[j], xs[k]];
      }
      return xs;
    },
  };
}

/**
 * Hearts on the harder stretches (Matt, 2026-10-24): beside every second checkpoint flag from the second on, a heart floats a jump
 * up over the flag, so a player who has been knocked about through the middle of a stage can top up before what comes next.
 * Returns the next free pickup id.
 */
export function heartsAtFlags(C: Collectible[], flags: Array<{ x: number; y: number }>, cid: number, up = 60): number {
  const sorted = [...flags].sort((a, b) => a.x - b.x || b.y - a.y);
  sorted.forEach((f, i) => {
    if (i % 2 === 0) return;
    const hx = f.x + 70, hy = f.y - up;
    // never on top of another pickup
    if (C.some((c) => Math.hypot(c.x - hx, c.y - hy) < 40)) return;
    C.push({ id: cid++, type: 'heart', x: hx, y: hy, collected: false, bobPhase: hx * 0.01 });
  });
  return cid;
}

/** the floor under a teaching swing: soft moss, high enough above the water that a miss costs a hop, not a life */
const HOLLOW_Y = 710;
/**
 * 1-7's secret bush: its trunk's climbing vine starts this far above the ground (over the 90 px under a vine's foot where Dot's climb
 * lesson finds a trunk, lessons.ts pickLesson; within a flick's rise of the 25 px the engine catches a trunk from)
 */
export const SECRET_VINE_UP = 96;
/** the step out of a soft pit: the pit is 130 deep and one jump rises about 108, so 55 up and then 75 up, each an easy single jump */
const PIT_STEP = 55;
/** the width of a step at a soft pit's near wall (4-2's lesson drops: the way back up to try the leaf again) */
const BACK_STEP = 70;
/**
 * the deepest a soft pit between two walls may be: in the engine (30 fps) a second jump and the lip hoist climb a 190 px wall from a
 * standstill and a plain jump 122 px (realPlay.test.ts measures it), so a gap deeper than this, with margin, gets its floor raised to
 * PIT_CLIMB under its lower side
 */
export const PIT_ESCAPE = 170;
export const PIT_CLIMB = 100;
/** the tallest stump one jump from the ground climbs with room to spare */
const STUMP_REACH = 90;
/** the control test's line before its first two-jump gap (its words for the new look: dotLinesData.ts ctest.gap3) */
export const CTEST_GAP3 = 'This one needs two jumps: jump, then jump again in the air';
/** the long jumps' own tip, on the single jumps (dotLinesData.ts ctest.gaps; Matt, 2026-10-29: one line for each move, the second jump's
 * at gap 3) */
const CTEST_GAPS = 'Jump across the gaps';
/** LV-3: Dot's line at the practice spot: on the screen, with the pad, with keys (approved 2026-10-29; dotLinesData.ts hint.1-6.double) */
export const DBL_PRACTICE = [
  'Double jump! Flick up, then flick up again midair.',
  'Double jump! Press Jump, then Jump again midair.',
  'Double jump! Press Space, then Space again midair.',
] as const;
/** LV-3's double-jump practice spot in 1-6 (dblPractice): the low rock up to it, the two ledges' height, the gap between them (px) */
export const PRACTICE = { step: 50, ledge: 125, gap: 205 } as const;
/** before the second jump is taught (1-1's stepping stones): how far below a stone's lower side a gap's floor sits, an easy single hop */
export const PLAIN_CLIMB = 75;
/** 1-1's practice shelf for the second jump: this far past the start of the twist (the tip is said at 60), and this high above the path */
export const PRACTICE_AT = 220;
export const PRACTICE_H = 150;
/**
 * Stepping-stone heights in an order where each stone stands at most STUMP_REACH above the one before (the bank counts as 0), so one
 * plain jump climbs every one. Picks, in turn, the first height in the rolled order that fits (the smallest when none does): it uses no
 * dice, so the rest of the roll is untouched, and an order that already fits is kept as it is.
 */
export function plainOrder(heights: readonly number[]): number[] {
  const left = [...heights];
  const out: number[] = [];
  let prev = 0;
  while (left.length) {
    let i = left.findIndex((h) => h - prev <= STUMP_REACH);
    if (i < 0) i = left.indexOf(Math.min(...left));
    prev = left.splice(i, 1)[0];
    out.push(prev);
  }
  return out;
}
/** how high a double jump lifts him (computed once from the physics) */
const RISE = maxRise();

/**
 * 1-2 The Petal Trail asks for 80 petals, not the generated stage's 33 (Matt, 2026-10-23): the trail holds about half again as many, so he
 * has to follow most of it, high and low, to open the sanctuary.
 */
export const PETAL_GOAL_12 = 80;
/** 1-5 More Petals asks for 90 (a step up from 1-2's 80), and holds about one and a half times that */
export const PETAL_GOAL_15 = 90;
/** 1-9 The Boa's Branches asks for 16 (24 to 31 to fight, the boas taking three hits each): two in three, not the generated 14 */
export const GUARD_GOAL_19 = 16;
/** 3-3 asks for 12 prowlers driven off (the stage holds about one and a half times that) */
export const PROWLER_GOAL_33 = 12;
/** 3-9 The Prowler's Ring: how many prowlers to drive off (the ring's own waves count too, on top of these) */
export const PROWLER_GOAL_39 = 14;
/** 3-6 asks for 5 of Grandma's things (the stage hides 7) */
export const GRANDMA_GOAL_36 = 5;
/** 3-7 Which Fern?: how many more of Grandma's things */
export const GRANDMA_GOAL_37 = 6;
/** World 3's stages with puzzle rooms (the shared puzzle kit, 2026-10-28): 3-2's glowing mushroom, 3-5's awake vines, 3-7's which fern */
export const W3_PUZZLES: ReadonlySet<string> = new Set(['3-2', '3-5', '3-7']);
/** 4-8 Nests on the Cliff asks for 8 chicks freed (the cliff holds 12 nests, one and a half times that) */
export const NEST_GOAL_48 = 8;
/** 4-8's falls: how far onto the shelf the water lands (the boulder's last stretch), and how far above the shelf it pours from */
const FALL_LIP = 60;
const FALL_HEAD = 280;
/** 1-3 Branch Snakes asks for 16 snakes, not 10: the stage holds about 25, so the punching it teaches is most of the way through */
export const SNAKE_GOAL_13 = 16;

/** the stage's length target: a quick, sure player (Matt) needs at least this long (s) */
export const EXPERT_SECONDS = 140;
/**
 * Each stage's own length (s, a quick, sure player), from World 4 on (Matt, 2026-10-25: "2 mins is the minimum. Stages should vary and
 * can go as long as 5 plus minutes"). A slower player takes about half as long again. A stage not listed takes EXPERT_SECONDS.
 */
export const STAGE_SECONDS: Record<string, number> = {
  '4-1': 120, // the climb (climbs count 20 s short of the others)
  '4-2': 180,
  '4-3': 210,
  '4-4': 170,
  '4-5': 140, // Matt: leave as is
  '4-6': 240,
  '4-7': 270, // the long glide down
  '4-8': 180,
  '4-9': 300, // the Aerie: the long climb before the Sky Sovereign
  '4-D': 200, // Dot's netting flight, after 4-5 (dotFlightStage.ts DOT_STAGE_SECONDS)
  '5-1': 165, // the loveliest place: a sprint through the gold garden, with the table and the first chairs (w5Stages.ts)
  '5-2': 200, // don't sit: the threads, the cakes and the Butler
  '5-3': 175, // closing orchids: a harvest from the orchids' cups as they open and shut, closing sooner as it goes on
  '5-4': 170, // silk bridges: the first dusk, the silk lines and the sheets (w5Stage54.ts)
  '5-M': 315, // Meeca's stage, the first of World 5: the night camp, five puzzle rooms, the clearing (meecaStage.ts meecaSeconds: 5:00 to 5:30)
  '7-4': 141, // the slide (w7Slide.ts slideSeconds): the hall, the crumble, about 110 s down the chute, the chamber
  '5-5': 190, // caught in silk: the cocoons, the pouch scene at the rest branch, the silk line up to the high web
};
export const stageSeconds = (id: string): number => STAGE_SECONDS[id] ?? EXPERT_SECONDS;
/** 4-8's length (STAGE_SECONDS: about three minutes for a quick player) */
export const W48_SECONDS = stageSeconds('4-8');

export type PieceKind = 'rest' | 'hollow' | 'gorge' | 'kapok' | 'log' | 'canopy' | 'highrun' | 'stumps' | 'snakes' | 'river' | 'pond' | 'turtles' | 'cages';

/**
 * The hand-built 1-6, planned and rolled: the stage is always the same chain of beats (learn, develop, puzzle, twist, develop again,
 * finish), and the dice (`seed`) decide how many vines a chain has, how far apart and how high they hang, how long each stretch is,
 * where the snakes sit, the order of the pieces inside a beat, and the dressing. Every rolled piece is checked against the physics
 * (protoCheck.ts) and rolled again if a swing or a landing would not work.
 */
export function buildProtoStage(config: LevelConfig, seed = 1, plan: StagePlan = 'proto', easy = false): GeneratedStage & { proto: ProtoExtras } {
  const st = buildPlan(config, seed, plan, easy);
  // Worlds 3 and 4, and World 1's rooms: Matt's puzzle sheets set in as dressing (pictures only: artDress.ts)
  const w = config.worldIndex;
  if ((w === 3 || w === 4) && /^[34]-[1-9]$/.test(plan) || (w === 1 && /^1-[467]$/.test(config.id))) {
    const kd = dressStage({ world: w, stage: config.miniIndex, seed, platforms: st.platforms, rooms: st.kit?.rooms ?? [], collectibles: st.collectibles, w3decor: st.proto.w3decor });
    if (kd.length) st.proto.kitDecor = kd;
  }
  // water taught before it costs a life (LV-8); then the dressing, once the stage is final
  const out = teachWater(st);
  addDress(out, seed);
  return out;
}

/** Worlds 1, 2 and 5: the dressing sets (artDress.ts dressSets), on any of their built stages (hand-built, World 2's, the new generator's) */
export function addDress(st: GeneratedStage & { proto?: ProtoExtras; kit?: { rooms: RoomSpec[] } }, seed: number) {
  const c = st.config;
  if (!st.proto || !DRESS_WORLDS.includes(c.worldIndex as 1 | 2 | 5) || c.objectiveType === 'boss_lair') return;
  const ds = dressSets({ world: c.worldIndex, stage: c.miniIndex, seed, platforms: st.platforms, rooms: st.kit?.rooms ?? [], collectibles: st.collectibles, checkpoints: st.checkpoints });
  if (ds.length) st.proto.dress = ds;
}

/** `easy`: built for Easy (only the control test's long jumps differ, gaps; the rest of Easy is easyMode.ts on the built stage) */
function buildPlan(config: LevelConfig, seed: number, plan: StagePlan, easy = false): GeneratedStage & { proto: ProtoExtras } {
  if (plan === '1-4') return buildKapok(config, seed);
  if (plan === '3-4') return buildSinkhole(config, seed);
  if (plan === '4-1') return buildKapok(config, seed, false, false, true);
  if (plan === '4-3') return buildWaterfallSteps(config, seed);
  if (plan === '4-6') return buildKapok(config, seed, false, false, false, true);
  if (plan === '4-7') return buildLongDrop(config, seed);
  if (plan === '7-4') return buildSlideStage(config, seed);
  if (plan === '4-9') return buildAerie(config, seed);
  if (plan === '5-1' || plan === '5-2' || plan === '5-3') return buildW5Stage(config, seed, plan);
  if (plan === '5-4') return buildW5Stage54(config, seed);
  if (plan === '5-5') return buildW5Stage(config, seed, plan);
  if (plan === '6-8') return buildStiltClimb(config, seed);
  if (plan === '1-8') return buildLongBranch(config, seed);
  const R = stream(seed);
  const P: Platform[] = [];
  const V: Vine[] = [];
  const ROPES: Rope[] = [];
  const RIVERS: RiverZone[] = [];
  let MIX: string | undefined;
  const BUSHES: Bush[] = [];
  const ZONES: WatchZone[] = [];
  /** the acorn meadows' watched stretches (1-7): their passes are the puzzle, as built */
  const MEADOWS = new Set<WatchZone>();
  /** World 1's puzzle rooms (the shared puzzle kit, puzzleKit.ts): the seesaw (1-6) and the acorns (1-7) */
  const ROOMS: RoomSpec[] = [];
  let RING: ProtoExtras['ring'];
  const T: TreeStructure[] = [];
  const E: Enemy[] = [];
  const C: Collectible[] = [];
  const checkpoints: Array<{ x: number; y: number; reached: boolean }> = [];
  const covers: LeafCover[] = [];
  const hints: StageHint[] = [];
  const beats: Array<[number, number, string]> = [];
  const pieces: Array<{ k: PieceKind; x0: number; x1: number }> = [];
  let pid = 1, vid = 1, tid = 1, eid = 1, cid = 1, seedN = 0;
  /** how long a quick, sure player takes (s): running at full speed, swinging at about 430 px/s, climbing at 220 px/s, pushing at 120 */
  let expert = 0;
  const RUN = 285, SWING = 430, CLIMB = 220, PUSH = 120;

  // ----- the drawing kit -----
  const bank = (x0: number, x1: number, y = G, style: Platform['style'] = 'log') => {
    const p: Platform = { id: pid++, x: x0, y, width: x1 - x0, height: BANK_H, type: 'solid', style };
    P.push(p);
    return p;
  };
  const branch = (x0: number, x1: number, y: number, type: Platform['type'] = 'solid', extra: Partial<Platform> = {}) => {
    const p: Platform = { id: pid++, x: x0, y, width: x1 - x0, height: 24, type, style: 'branch', ...extra };
    P.push(p);
    return p;
  };
  /**
   * a soft pit between two banks: a mossy floor, walled on both sides down to it. (Without the walls the floor stopped at the banks'
   * edges and there was open air under them, so walking along the floor carried him under a bank and off the end, into the water.)
   */
  const softPit = (edge: number, far: number) => {
    const wallTop = G + BANK_H;
    const wallH = HOLLOW_Y - wallTop + 4;
    P.push({ id: pid++, x: edge - 60, y: wallTop, width: 60, height: wallH, type: 'solid', style: 'moss_stone', soil: true });
    P.push({ id: pid++, x: far, y: wallTop, width: 60, height: wallH, type: 'solid', style: 'moss_stone', soil: true });
    bank(edge - 60, far + 60, HOLLOW_Y, 'moss_stone');
    // a low mossy step at the foot of the far wall: the pit is deeper than one jump rises, so without it only the second jump got him
    // out, and beginners who had not found the second jump were stuck there (the control test, 2026-10-23)
    // (a narrow pit gets its whole floor raised instead: a sliver of a step is no help)
    const sw = far - edge < 170 ? far - edge : 70;
    P.push({ id: pid++, x: far - sw, y: HOLLOW_Y - PIT_STEP, width: sw, height: PIT_STEP, type: 'solid', style: 'moss_stone', soil: true });
  };
  /**
   * the gaps stepping stones leave in a soft pit (between the banks at `edge` and `far`): a gap between two stones that both stand higher
   * than a second jump climbs out of the pit is a pit with no way out (the real engine stranded him there, realReach.ts), so its floor
   * is raised to a plain jump under its lower side
   */
  const pitFloors = (edge: number, stones: Platform[], far: number, plain = false) => {
    const sides = [{ x0: edge, x1: edge, top: G }, ...stones.map((q) => ({ x0: q.x, x1: q.x + q.width, top: q.y })), { x0: far, x1: far, top: G }];
    for (let i = 0; i + 1 < sides.length; i++) {
      const lower = Math.max(sides[i].top, sides[i + 1].top);
      // `plain`: before the second jump is taught (1-1), every gap's floor is one easy hop under its lower side, so a miss is a hop back
      // up and another go, never a wall only the second jump climbs (QA, 2026-10-26: first-timers were stuck in 1-1's first stone pit)
      if (HOLLOW_Y - lower <= (plain ? STUMP_REACH : PIT_ESCAPE)) continue;
      const floor = lower + (plain ? PLAIN_CLIMB : PIT_CLIMB);
      const w = sides[i + 1].x0 - sides[i].x1;
      if (plain && w <= 0) continue;
      P.push({ id: pid++, x: sides[i].x1, y: floor, width: w, height: HOLLOW_Y + 10 - floor, type: 'solid', style: 'moss_stone' });
    }
  };
  /**
   * the floor of a stepping-stone pit before the second jump is practised (1-1): each gap between two stones (or a stone and a bank)
   * has its own mossy floor one easy hop under its lower side, and nothing else lies below, so a miss is always a hop back up. (Over
   * one long floor under the stones the level check walked him along under the raised floors and the stones, and the inspector's kid
   * bot then had to climb 105 px out of a pit that is not there, 2026-10-28.)
   */
  const plainPit = (edge: number, stones: Platform[], far: number) => {
    const sides = [{ x0: edge, x1: edge, top: G }, ...stones.map((q) => ({ x0: q.x, x1: q.x + q.width, top: q.y })), { x0: far, x1: far, top: G }];
    for (let i = 0; i + 1 < sides.length; i++) {
      const w = sides[i + 1].x0 - sides[i].x1;
      if (w <= 0) continue;
      // (one easy hop, 75 at most, under the higher side, so under the lower one too: a kid's short flick gets out either way; never
      // level with the ground, where it would read as a bank of its own)
      let floor = Math.min(HOLLOW_Y, Math.min(sides[i].top, sides[i + 1].top) + PLAIN_CLIMB);
      if (Math.abs(floor - G) < 4) floor = G + 4;
      P.push({ id: pid++, x: sides[i].x1, y: floor, width: w, height: HOLLOW_Y + 10 - floor, type: 'solid', style: 'moss_stone' });
    }
  };
  const block = (x0: number, x1: number, h: number) => {
    const p: Platform = { id: pid++, x: x0, y: G - h, width: x1 - x0, height: h, type: 'solid', style: 'moss_stone' };
    P.push(p);
    return p;
  };
  const liana = (x: number, topY: number, bottomY = topY + 340): Vine => {
    const v: Vine = { id: vid++, x, topY, bottomY, swaySpeed: 1.1, swayPhase: (x * 0.013) % 6.28, vineType: 'swing_liana', isSwingingVine: true };
    V.push(v);
    return v;
  };
  const trunk = (x: number, groundY: number, perchY: number) => {
    const tree: TreeStructure = { id: tid++, x, groundY, topY: perchY - 150, trunkWidth: 76, hasClimbVine: true, canopyRadius: 150 };
    T.push(tree);
    V.push({ id: vid++, x, topY: perchY - 2, bottomY: groundY - 6, swaySpeed: 0.9, swayPhase: (x * 0.007) % 6.28, vineType: 'tree_climb', treeId: tree.id });
  };
  const flower = (x: number, y: number, v: Collectible['botanicalVariant'] = 'orchid') =>
    C.push({ id: cid++, type: 'flower', botanicalVariant: v, x, y, collected: false, bobPhase: (x * 0.031) % 6.28 });
  const row = (x0: number, x1: number, y: number, n: number, v: Collectible['botanicalVariant'] = 'orchid') => {
    for (let i = 0; i < n; i++) flower(x0 + ((x1 - x0) * i) / Math.max(1, n - 1), y, v);
  };
  const arc = (x0: number, x1: number, yTop: number, n: number, v: Collectible['botanicalVariant'] = 'hibiscus') => {
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      flower(x0 + (x1 - x0) * t, yTop + 70 * (1 - Math.sin(Math.PI * t)), v);
    }
  };
  const snake = (x: number, surface: number, range = 90, asleep = false) => {
    E.push({
      asleep,
      id: eid++, type: 'snake', x, y: surface - 14, vx: 28, vy: 0, width: 38, height: 22, hp: 1, maxHp: 1, facing: R.chance(0.5) ? 1 : -1,
      patrolMinX: x - range / 2, patrolMaxX: x + range / 2, attackCooldown: 2, telegraphTimer: 0, isAttacking: false,
      animTimer: 0, hitFlashTimer: 0, defeated: false, koTimer: 0, behaviorTimer: 0,
    } as Enemy);
  };
  const goldenSeed = (x: number, y: number) => {
    seedN++;
    C.push({ id: cid++, type: 'seed', x, y, collected: false, bobPhase: seedN, findId: `seed-${seedN}` });
  };
  const hint = (x: number, text: string, pad = text, keys = text, belowY?: number) => hints.push({ x, text, pad, keys, belowY });
  const said = new Set<string>();
  const once = (key: string, f: () => void) => {
    if (said.has(key)) return;
    said.add(key);
    f();
  };

  // ----- the ground: the cursor x is the open end of the bank Pokey is on (always at ground level G) -----
  let bankFrom = 0;
  let x = 0;
  const run = (len: number) => { x += len; };
  /** end the bank here (a gap or a wall follows) */
  const close = () => {
    if (x - bankFrom > 1) bank(bankFrom, x);
  };
  /** a new bank starts at `at` */
  const open = (at: number) => { bankFrom = at; x = at; };
  const flag = () => checkpoints.push({ x: x - 80, y: G, reached: false });

  // ----- the pieces. Each starts and ends on open ground at G; each one is checked as it is built. -----

  /** a stretch of forest floor with a few flowers */
  function rest(len: number) {
    const x0 = x;
    run(len);
    expert += len / RUN;
    if (len > 260) row(x0 + 80, x - 80, G - 34, Math.max(2, Math.round(len / 160)), R.pick(['orchid', 'hibiscus'] as const));
    pieces.push({ k: 'rest', x0, x1: x });
  }

  /**
   * vines over a gap. `soft`: a mossy floor below (a teaching swing). Rolled again until the jump grabs the first vine, every vine
   * catches the next, and the last one lands on the bank beyond.
   */
  function chain(n: number, soft: boolean, kind: PieceKind, rocks = false) {
    const x0 = x;
    run(R.r(150, 260));
    const edge = x;
    for (let tries = 0; tries < 12; tries++) {
      const easy = soft || tries > 6;
      const d0 = R.r(170, 200);
      const sp = Array.from({ length: n - 1 }, () => (easy ? R.r(300, 330) : R.r(315, 350)));
      const d1 = R.r(200, 240);
      const xs = [edge + d0];
      for (const s of sp) xs.push(xs[xs.length - 1] + s);
      const farX = xs[n - 1] + d1;
      // long vines hung from high up: whatever height a leap carries him at, the next vine is there to grab
      const tops = xs.map(() => (soft ? Math.round(R.r(190, 220)) : Math.round(R.r(140, 200))));
      const vs: Vine[] = xs.map((vx, k) => ({ id: -1 - k, x: vx, topY: tops[k], bottomY: Math.min(G + 30, tops[k] + 410), swaySpeed: 1.1, swayPhase: 0, vineType: 'swing_liana', isSwingingVine: true }));
      const far: Platform = { id: -99, x: farX, y: G, width: 400, height: BANK_H, type: 'solid' };
      let ok = jumpGrab(edge, G, vs[0]) >= 4;
      for (let k = 0; ok && k < n - 1; k++) ok = catchWindow(vs[k], vs[k + 1]) > 0.6 && earlyCatch(vs[k], vs[k + 1]);
      if (ok) ok = landWindow(n > 1 ? vs[n - 2] : null, vs[n - 1], far) >= 8;
      if (!ok && tries < 11) continue;
      // build it
      close();
      if (soft) softPit(edge, farX);
      // (`rocks`: 1-6's teaching swings have mossy rocks on the moss below, to hop for whoever missed a vine and crosses down there)
      if (soft && rocks) for (let rx = edge + 170; rx < farX - 200; rx += 300) { P.push({ id: pid++, x: Math.round(rx), y: HOLLOW_Y - 52, width: 100, height: 52, type: 'solid', style: 'moss_stone' }); flower(rx + 50, HOLLOW_Y - 86, 'orchid'); }
      for (let k = 0; k < n; k++) {
        liana(xs[k], vs[k].topY, vs[k].bottomY);
        arc(k === 0 ? edge + 10 : (xs[k - 1] + xs[k]) / 2, k === n - 1 ? farX - 10 : (xs[k] + xs[k + 1]) / 2, Math.min(G - 150, vs[k].topY + 200), 4);
      }
      open(farX);
      run(R.r(90, 140));
      expert += (edge - x0) / RUN + (farX - edge) / SWING + 0.3 * n + (x - farX) / RUN;
      pieces.push({ k: kind, x0, x1: x });
      return;
    }
  }

  /** a kapok tree: climb it, step out on the branch at its top, leap for a vine that only the top can reach, swing over the gorge */
  function kapok() {
    const x0 = x;
    run(R.r(260, 360));
    const trunkX = x - R.r(150, 190);
    const perchY = Math.round(R.r(292, 312));
    const perchR = trunkX + R.r(140, 170);
    once('kapok', () => {
      hint(x0 + 40, 'That vine is too high. Climb the tree!');
      hint(x0 + 120, 'Flick up beside the trunk, keep your thumb up', 'Jump at the trunk, hold Pad up', 'Jump at the trunk, hold W or up');
    });
    for (let tries = 0; tries < 12; tries++) {
      const vx = perchR + R.r(160, 190);
      const top = Math.round(R.r(110, 135));
      const bottom = Math.min(perchY + 55, Math.floor(G - RISE - 32));
      const v: Vine = { id: -1, x: vx, topY: top, bottomY: bottom, swaySpeed: 1, swayPhase: 0, vineType: 'swing_liana', isSwingingVine: true };
      const gap = Math.max(x + 380, vx + R.r(300, 340));
      const perch: Platform = { id: -2, x: trunkX - 40, y: perchY, width: perchR - trunkX + 40, height: 24, type: 'solid' };
      const far: Platform = { id: -99, x: gap, y: G, width: 400, height: BANK_H, type: 'solid' };
      const lands = landWindow(null, v, far) >= 8 && jumpGrab(perch.x + perch.width, perchY, v) >= 3;
      if (!lands && tries < 11) continue;
      trunk(trunkX, G, perchY);
      branch(perch.x, perch.x + perch.width, perchY);
      for (let i = 0; i < 4; i++) flower(trunkX, G - 70 - i * 55, 'hibiscus');
      close();
      liana(vx, top, bottom);
      arc(perch.x + perch.width, gap, top + 90, 5);
      open(gap);
      run(R.r(110, 150));
      expert += (trunkX - x0) / RUN + (G - perchY) / CLIMB + 1.2 + (gap - perch.x - perch.width) / SWING + (x - gap) / RUN;
      pieces.push({ k: 'kapok', x0, x1: x });
      return;
    }
  }

  /**
   * the fallen kapok: a wall too tall to jump, and a hollow log to push against it. Pushed the other way, against the mossy rock,
   * the log reaches a hidden nook with a golden seed. After the wall, a stretch of high canopy and a drop back to the ground.
   */
  function logPuzzle(busyTop = false) {
    const x0 = x;
    run(R.r(140, 220));
    const rock = block(x, x + 90, 50);
    // the nook: a branch above the rock and the log's far left, hidden behind leaves (the log, against the rock, sits under it)
    const nookX = rock.x + 30;
    branch(nookX, nookX + 170, 325);
    goldenSeed(nookX + 85, 292);
    covers.push({ x: nookX - 30, y: 250, w: 230, h: 110 });
    run(90 + R.r(560, 760));
    const wallX = x;
    const logX = Math.round(R.r(rock.x + 200 + 100, wallX - LOG.w - 140));
    P.push({ id: pid++, x: logX, y: G - LOG.h, width: LOG.w, height: LOG.h, type: 'solid', style: 'log', push: { min: rock.x + rock.width, max: wallX - 55 } });
    row(logX + LOG.w + 40, wallX - 40, G - 34, 3);
    once('log', () => hint(logX - 160, 'Keep sliding into the log to push it', 'Hold the pad into the log to push it', 'Hold left or right into the log to push it'));
    close();
    // the high canopy: 230 px up (a double jump tops out near 175, plus 26 for catching the lip). Its face is solid down to the ground:
    // as a 90 px bank floating 230 up, there was open air under it, and walking up to the wall carried him under it and off the end of
    // the ground into the water (QA: Sally drowned 12 times at the control test's "Push the log", Matt twice at 1-6's fallen log)
    const plateau = R.r(520, 820);
    P.push({ id: pid++, x: wallX, y: G - 230, width: plateau, height: 230 + BANK_H, type: 'solid', style: 'log' });
    // (said only at the wall's foot, so a player who went past the log and found the wall learns it is not a jump; the log's own line
    // says how to push it, and neither says what to do with it)
    once('logWall', () => hint(wallX - 100, 'Too high to jump, even twice. Look around!'));
    row(wallX + 80, wallX + plateau - 80, G - 264, Math.round(plateau / 130));
    // (`busyTop`, 1-6 since 2026-10-28: a mossy rock to hop on the high canopy, a petal on it)
    if (busyTop) {
      const rx = Math.round(wallX + plateau * 0.32);
      P.push({ id: pid++, x: rx, y: G - 230 - 52, width: 100, height: 52, type: 'solid', style: 'moss_stone' });
      flower(rx + 50, G - 230 - 86, 'hibiscus');
    }
    checkpoints.push({ x: wallX + 140, y: G - 230, reached: false });
    if (R.chance(0.6)) snake(wallX + plateau * R.r(0.55, 0.75), G - 230, 110);
    open(wallX + plateau);
    run(R.r(110, 150));
    expert += (logX - x0) / RUN + (wallX - 55 - LOG.w - logX) / PUSH + 2.5 + (x - wallX) / RUN;
    pieces.push({ k: 'log', x0, x1: x });
  }

  // ----- 1-6's seesaw (the puzzle kit, puzzleKit.ts), 2026-10-28: a plank on a pivot over a shallow pit. Weight on one end lowers it and
  // raises the other into a step. The hollow log (taught just before, at the fallen kapok) outweighs Pokey: pushed onto one end it holds
  // that end down while he climbs the other. Each room is narrow (a seesaw, a log and a bank: about 700 px) and tall (the bank 270 up),
  // so it fits an upright phone as well as a sideways one, and a miss is a hop out of a 60 px pit: never a life.
  /** a spot on a platform as a kit anchor (0..1 along its top) */
  const onP = (p: Platform, ax: number, dy = 0): Anchor => ({ on: p.id, at: (ax - p.x) / p.width, ...(dy ? { dy } : {}) });
  const SEE = { w: 260, rise: 110, pit: 60, logW: 140, logH: 60, bank: 270 } as const;
  /** the bank Pokey is on, from where it started to the cursor, ended here and returned (the kit anchors its pieces on it) */
  const endBank = (): Platform => {
    const p = bank(bankFrom, x);
    bankFrom = x;
    return p;
  };
  /** a mossy rock to hop on a high bank's top, `at` of the way along, with a petal on it */
  const topRock = (p: Platform, at: number) => {
    const rx = Math.round(p.x + p.width * at - 50);
    P.push({ id: pid++, x: rx, y: p.y - 52, width: 100, height: 52, type: 'solid', style: 'moss_stone' });
    flower(rx + 50, p.y - 86, 'orchid');
  };
  /** a high bank (`h` px up) from x0 to x1: its face too tall to jump, its top the way on */
  const cliff = (x0: number, x1: number, h: number): Platform => {
    const p: Platform = { id: pid++, x: Math.round(x0), y: G - h, width: Math.round(x1 - x0), height: h + BANK_H, type: 'solid', style: 'log' };
    P.push(p);
    return p;
  };
  /**
   * `demo`: the seesaw shows itself first. A hollow log lies wedged on its near end (it cannot be moved), so the far end stands up as a
   * step to a ledge of petals: hop up the plank and the log holds it. Nothing has to be done here; the way on is the floor past it.
   * `learn`: the same seesaw with the log beside it on the floor and a bank too high to jump past it. Push the log onto the near end and
   * the far end is a step up to the bank (the second jump from its top).
   */
  function seesawRoom(demo: boolean) {
    const x0 = x;
    run(R.r(150, 190));
    const logX = Math.round(x);
    if (!demo) run(SEE.logW + R.r(70, 90));
    const floor = endBank();
    const edge = x;
    const pivot = edge + SEE.w / 2;
    const pit = bank(edge, edge + SEE.w, G + SEE.pit, 'moss_stone');
    const id = `seesaw${ROOMS.length}`;
    const kit: RoomSpec['pieces'] = [
      { kind: 'reset', id: `post${ROOMS.length}`, at: onP(floor, Math.max(floor.x + 20, demo ? edge - 120 : logX - 45)) },
      { kind: 'seesaw', id, at: onP(pit, pivot, -SEE.pit), w: SEE.w, rise: SEE.rise, rest: -1 },
    ];
    if (demo) {
      // the log, wedged on the near end for good (its push range is its own width), and the petal ledge over the raised far end
      P.push({ id: pid++, x: pivot - 150, y: G - SEE.logH, width: SEE.logW, height: SEE.logH, type: 'solid', style: 'log', push: { min: pivot - 150, max: pivot - 10 } });
      const ledge = branch(pivot + 40, pivot + 210, G - SEE.rise - 95);
      row(ledge.x + 30, ledge.x + ledge.width - 30, ledge.y - 34, 3, 'hibiscus');
      ROOMS.push({
        id: `seesaw-show-${ROOMS.length}`,
        left: onP(floor, edge - 150), right: { on: pit.id, at: 1, dx: 40 }, above: 420, below: SEE.pit + 10,
        pieces: kit, exit: id, beyond: { on: ledge.id, at: 0.5 }, ground: [floor.id, pit.id],
        // (the seesaw's first room: the room shows the idea by itself, and Dot names what it shows; the move only after struggle)
        tips: { enter: 'See? The log holds that end down.', nudge: 'That high end makes a step.', move: 'Hop up the other end!' },
        mech: 'seesaw',
      });
      open(edge + SEE.w);
      run(R.r(260, 320));
      expert += (x - x0) / RUN + 2;
      pieces.push({ k: 'log', x0, x1: x });
      return;
    }
    P.push({ id: pid++, x: logX, y: G - SEE.logH, width: SEE.logW, height: SEE.logH, type: 'solid', style: 'log', push: { min: floor.x + 20, max: pivot - 10 } });
    const top = cliff(edge + SEE.w, edge + SEE.w + R.r(440, 520), SEE.bank);
    row(top.x + 70, top.x + 150, top.y - 34, 2, 'orchid');
    topRock(top, 0.62);
    ROOMS.push({
      id: `seesaw-${ROOMS.length}`,
      left: onP(floor, logX - 60), right: { on: top.id, at: 0, dx: 60 }, above: 420, below: SEE.pit + 10,
      pieces: kit, exit: id, beyond: { on: top.id, at: 0.3 }, ground: [floor.id, pit.id],
      // (the problem on walking in, never the answer: DOT-2)
      tips: { enter: 'Too high! That log could help.', nudge: 'That log looks heavy.', move: 'Push the log onto the near end.' },
    });
    // down off the far end of the bank onto the floor again, and a dip to jump on the way on
    open(top.x + top.width);
    run(R.r(110, 150));
    dip();
    run(R.r(230, 260));
    expert += (x - x0) / RUN + (SEE.logW + 160) / PUSH + 4;
    pieces.push({ k: 'log', x0, x1: x });
  }
  /**
   * the twist: the seesaw's far end rests down, and the log lies past it, on the far side. Cross the seesaw, get round the log, and push
   * it back onto the far end: now the near end stays up, a step to the branch overhead that leads on over the bank. (A bank 260 up
   * closes the floor beyond; from the log's top the branch and the bank are out of reach, so only the raised near end gets him there.)
   */
  function seesawTwist() {
    const x0 = x;
    run(R.r(220, 260));
    const floor = endBank();
    const edge = x;
    const pivot = edge + SEE.w / 2;
    // (a stump at the foot of the near end: a short hop up onto it, then onto the raised end; the log is a low one, so from its top the
    // branch is out of reach even with the second jump)
    const rise = 100, high = 260, logH = 50;
    block(edge - 110, edge - 10, 40);
    const pit = bank(edge, edge + SEE.w, G + SEE.pit, 'moss_stone');
    const farFloor = bank(edge + SEE.w, edge + SEE.w + 250);
    const logX = farFloor.x + 30;
    P.push({ id: pid++, x: logX, y: G - logH, width: SEE.logW, height: logH, type: 'solid', style: 'log', push: { min: pivot + 10, max: farFloor.x + farFloor.width } });
    const top = cliff(farFloor.x + farFloor.width, farFloor.x + farFloor.width + R.r(400, 480), high);
    // the branch over it all, from above the near end to the bank's top, in two with a gap to jump over the far floor
    const mid = Math.round(farFloor.x + 150);
    const over = branch(edge - 30, mid, G - high);
    const over2 = branch(mid + 80, top.x + 10, G - high);
    row(over.x + 60, over.x + over.width - 50, over.y - 34, 3, 'hibiscus');
    flower(over2.x + over2.width / 2, over2.y - 34, 'hibiscus');
    row(top.x + 60, top.x + 130, top.y - 34, 2, 'orchid');
    topRock(top, 0.6);
    const id = `seesaw${ROOMS.length}`;
    ROOMS.push({
      id: `seesaw-twist-${ROOMS.length}`,
      left: onP(floor, edge - 140), right: { on: top.id, at: 0, dx: 60 }, above: 440, below: SEE.pit + 10,
      pieces: [
        { kind: 'reset', id: `post${ROOMS.length}`, at: onP(floor, edge - 128) },
        { kind: 'seesaw', id, at: onP(pit, pivot, -SEE.pit), w: SEE.w, rise, rest: 1 },
      ],
      exit: id, beyond: { on: top.id, at: 0.4 }, ground: [floor.id, pit.id, farFloor.id],
      tips: { enter: "The log's moved. Hmm, that won't tip now.", nudge: "The log's past the seesaw now.", move: 'Push it back onto the far end!' },
    });
    open(top.x + top.width);
    run(R.r(110, 150));
    dip();
    run(R.r(200, 240));
    expert += (x - x0) / RUN + 14;
    pieces.push({ k: 'log', x0, x1: x });
  }

  /**
   * the canopy road: up a trunk, along branches high over a safe forest floor. One long branch creaks and snaps, and two vines hang
   * below it to catch him. A trunk part way along climbs back up for anyone who falls. With `glideSeed`, a far ledge holds a seed
   * only the Leaf Glide reaches.
   */
  function canopy(glideSeed: boolean) {
    const x0 = x;
    run(R.r(160, 240));
    const t1 = x - 60;
    const y0 = Math.round(R.r(350, 390));
    trunk(t1, G, y0);
    for (let i = 0; i < 3; i++) flower(t1, G - 70 - i * 55, 'hibiscus');
    let bx = t1 - 50;
    const branches: Platform[] = [];
    const n = R.i(3, 5);
    const creakAt = R.i(1, n - 2);
    for (let k = 0; k < n; k++) {
      const y = k === 0 ? y0 : Math.round(Math.max(330, Math.min(410, branches[k - 1].y + R.r(-40, 40))));
      const w = k === creakAt ? R.r(400, 480) : R.r(260, 420);
      if (k === creakAt) {
        // joined to the branch before it, so he walks onto it and is standing on it when it goes
        const prev = branches[k - 1];
        const cb = branch(prev.x + prev.width, prev.x + prev.width + w, prev.y, 'fragile', { crumbleAfter: 0.55 });
        liana(cb.x + w * 0.45, prev.y - 160, prev.y + 200);
        liana(cb.x + w * 0.45 + 200, prev.y - 160, prev.y + 200);
        branches.push(cb);
        bx = cb.x + w;
        // the next branch is close enough that the second catch vine lands on it
        bx += R.r(70, 100);
        continue;
      }
      const b = branch(bx, bx + w, y);
      branches.push(b);
      if (k > 0 && k !== creakAt + 1 && R.chance(0.5)) snake(bx + w * 0.5, y, Math.min(140, w - 80));
      row(bx + 50, bx + w - 50, y - 34, Math.max(2, Math.round(w / 140)), 'hibiscus');
      bx += w + R.r(90, 140);
    }
    // the way back up, after the snapping branch
    const back = branches[creakAt + 1] ?? branches[branches.length - 1];
    trunk(back.x + Math.min(back.width - 40, 140), G, back.y);
    once('fell', () => hint(branches[creakAt].x + 100, 'Fell? Climb the next tree back up', 'Fell? Climb the next tree back up', 'Fell? Climb the next tree back up', 520));
    once('canopy', () => hint(t1 - 100, 'The canopy road'));
    const last = branches[branches.length - 1];
    x = last.x + last.width;
    if (glideSeed) {
      // out of reach from the floor (higher than a double jump lifts him), and out over a gap a double jump falls well short of
      // but the Leaf Glide crosses: the gap sits halfway between the two reaches
      const gy = Math.round(Math.min(last.y + 30, G - RISE - 30));
      const dy = last.y - gy;
      const gap = Math.round((reachJump(dy, true) + reachGlide(dy, true)) / 2);
      branch(x + gap, x + gap + 120, gy);
      goldenSeed(x + gap + 60, gy - 34);
      hint(x - 120, 'Something shiny, far away...');
      const end = x + gap + 120 + 420;
      // (World 1: the floor on under the far ledge holds dips of moss to jump, as glideLookout's does: it was a 6-9 s empty walk, the
      // stage inspector, 2026-10-28; never a rock, from whose top a double jump would reach the ledge the glide is for)
      if (w1Rocks) while (end - x > 260) { run(R.r(180, 260)); dip(); }
      x = Math.max(x, end);
      // (and a rock where the road comes down to the floor: the walk on to what follows was four quiet seconds)
      if (w1Rocks) logHop();
    } else x += R.r(110, 170);
    // the forest floor under the whole road is one long safe bank (the bank before carries on under it)
    run(R.r(90, 140));
    expert += (x - x0) / RUN + (G - y0) / CLIMB + 1 + 0.35 * n;
    pieces.push({ k: 'canopy', x0, x1: x });
  }

  /** a run of vines high in the canopy: from a branch, over a safe forest floor, to a branch */
  function highRun() {
    const x0 = x;
    run(R.r(160, 220));
    const tX = x - 60;
    const y0 = Math.round(R.r(330, 370));
    trunk(tX, G, y0);
    const start = branch(tX - 50, tX + 200, y0);
    for (let tries = 0; tries < 12; tries++) {
      const n = R.i(2, 3);
      const xs = [start.x + start.width + R.r(150, 180)];
      for (let k = 1; k < n; k++) xs.push(xs[k - 1] + R.r(300, 340));
      const tops = xs.map(() => Math.round(R.r(110, 160)));
      const vs: Vine[] = xs.map((vx, k) => ({ id: -1 - k, x: vx, topY: tops[k], bottomY: Math.min(y0 + 120, tops[k] + 330), swaySpeed: 1, swayPhase: 0, vineType: 'swing_liana', isSwingingVine: true }));
      const endB: Platform = { id: -99, x: xs[n - 1] + R.r(210, 240), y: Math.round(R.r(330, 380)), width: R.r(260, 360), height: 24, type: 'solid' };
      let ok = jumpGrab(start.x + start.width, y0, vs[0]) >= 3;
      for (let k = 0; ok && k < n - 1; k++) ok = catchWindow(vs[k], vs[k + 1]) > 0.6 && earlyCatch(vs[k], vs[k + 1]);
      if (ok) ok = landWindow(n > 1 ? vs[n - 2] : null, vs[n - 1], endB) >= 8;
      if (!ok && tries < 11) continue;
      for (const v of vs) liana(v.x, v.topY, v.bottomY);
      arc(start.x + start.width, endB.x, Math.min(...tops) + 160, 7);
      const eb = branch(endB.x, endB.x + endB.width, endB.y);
      row(eb.x + 40, eb.x + eb.width - 40, eb.y - 34, 2, 'hibiscus');
      // a trunk back up from the floor, for a missed vine
      // (out of a double jump's reach from the floor, 185 up at least: at 173 up the stage inspector's route jumped onto it and walked
      // the floor under the whole run, 2026-10-28; the trunk is the way up to it)
      const ry = Math.min(y0 + 40, 395);
      trunk(xs[Math.min(1, n - 1)] + 60, G, ry);
      branch(xs[Math.min(1, n - 1)] + 20, xs[Math.min(1, n - 1)] + 200, ry);
      x = eb.x + eb.width + R.r(100, 150);
      expert += (tX - x0) / RUN + (G - y0) / CLIMB + 1 + (endB.x - start.x - start.width) / SWING + 0.3 * n + (x - endB.x) / RUN;
      pieces.push({ k: 'highrun', x0, x1: x });
      return;
    }
  }

  /** stumps and mossy rocks to hop up and over */
  function stumps() {
    const x0 = x;
    run(R.r(120, 200));
    const n = R.i(3, 5);
    let h = 0;
    let gap = 0;
    for (let k = 0; k < n; k++) {
      h = Math.max(50, Math.min(150, h + R.pick([50, 60, 70, -50] as const)));
      const w = R.r(90, 150);
      const top = k === 0 ? 50 : h;
      // too tall to reach from the ground with one jump: a low step in the gap before it, against its side, so dropping into the gap
      // is never a wall that only the second jump climbs (beginners gave up there, the control test, 2026-10-23)
      if (top > STUMP_REACH && gap > 0) block(x - Math.round(gap / 2), x, Math.max(40, top - 70));
      block(x, x + w, top);
      flower(x + w / 2, G - top - 34, 'orchid');
      gap = R.r(60, 120);
      run(w + gap);
    }
    run(R.r(80, 160));
    expert += (x - x0) / 240;
    pieces.push({ k: 'stumps', x0, x1: x });
  }

  /** a stretch with snakes on it (punch them, or hop them) */
  function snakes() {
    const x0 = x;
    const len = R.r(700, 1000);
    run(len);
    const m = R.i(1, 2);
    for (let k = 0; k < m; k++) snake(x0 + len * (0.35 + 0.35 * k) + R.r(-40, 40), G, 120);
    row(x0 + 80, x - 80, G - 34, Math.round(len / 180));
    expert += len / RUN + 1.5 * m;
    pieces.push({ k: 'snakes', x0, x1: x });
  }

  // ----- the plan: always the same beats, the dice fill them in -----
  const beat = (name: string, f: () => void) => {
    const b0 = x;
    f();
    beats.push([b0, x, name]);
  };
  const mixed = (...fs: Array<() => void>) => R.shuffle(fs).forEach((g) => g());

  /**
   * gaps to jump across, each wider than the last, over a soft mossy floor (a miss costs a hop back up, never a life):
   * half and three quarters of a single jump, then two that need the second jump
   */
  function gaps() {
    const x0 = x;
    run(R.r(200, 260));
    // (Easy's own reach, a thumb that lets go at about 70%, physics.ts EASY_HOLD: 73 / 109 / 200 / 242 px where Normal's are 87 / 131 /
    // 219 / 267, which on Easy were 90% of a single jump and 94% of a double; QA batch E, 2026-10-29, every new player fell back here, and
    // Matt chose this with the flags below)
    const reach = easy ? reachJumpHeld : reachJump;
    const one = reach(0, false), two = reach(0, true);
    const ws = [one * 0.5, one * 0.75, two * 0.7, two * 0.85];
    ws.forEach((w, k) => {
      const edge = x;
      close();
      const far = Math.round(edge + w);
      softPit(edge, far);
      flower(edge + w / 2, G - 120, 'hibiscus');
      open(far);
      // a flag on the far bank once the single jumps are done, and another before the last gap, so a missed double jump starts again
      // just before it (there was none for 2,100 px on Normal)
      if (k === 1 || k === 2) checkpoints.push({ x: far + 70, y: G, reached: false });
      // and Dot teaches the second jump on the bank before the first gap that needs it, once he stands on it (never mid-jump: belowY
      // waits for him on the ground), the first time on this phone (Matt, 2026-10-29: the kids missed gaps 3 and 4 with one jump)
      // (the stretch's own tip, on the same move, comes down there, or it held the bubble until after his try at the gap: passX)
      if (k === 1) {
        const intro = hints.find((h) => h.text === CTEST_GAPS);
        if (intro) intro.passX = far + 20;
        hint(far + 20, CTEST_GAP3, CTEST_GAP3, CTEST_GAP3, G - 4);
      }
      run(R.r(260, 320));
    });
    expert += (x - x0) / RUN + 2;
    pieces.push({ k: 'stumps', x0, x1: x });
  }

  /** a tree to climb all the way up, and back down: flowers on the trunk and on the branch at the top */
  function climbTree(tight = false) {
    const x0 = x;
    run(tight ? R.r(250, 300) : R.r(300, 360));
    const tX = x - 150;
    const perchY = 300;
    trunk(tX, G, perchY);
    branch(tX - 40, tX + 220, perchY);
    for (let i = 0; i < 4; i++) flower(tX, G - 70 - i * 60, 'hibiscus');
    row(tX + 60, tX + 190, perchY - 34, 2, 'orchid');
    run(tight ? R.r(150, 200) : R.r(200, 260));
    expert += (x - x0) / RUN + (2 * (G - perchY)) / CLIMB;
    pieces.push({ k: 'kapok', x0, x1: x });
  }

  /**
   * stepping stones: mossy pillars standing in a soft pit, at the heights given (px above the ground), each gap a share of what a jump
   * between those heights can reach (`share` of a single jump, or of a double jump when `dbl`). Lands on open ground after the last.
   */
  function pillars(heights: number[], share: [number, number], dbl = false, plain = false) {
    const x0 = x;
    if (plain) heights = plainOrder(heights);
    // (`plain`, 1-1 since 2026-10-28: a quicker run up to the stones and away from them)
    run(plain ? R.r(100, 140) : R.r(140, 200));
    const edge = x;
    close();
    let px = edge, prevTop = G;
    const tops: number[] = [];
    const stones: Platform[] = [];
    for (const h of heights) {
      const top = G - h;
      const gap = Math.round(reachJump(prevTop - top, dbl) * R.r(share[0], share[1]));
      const w = Math.round(R.r(110, 160));
      px += gap;
      const p: Platform = { id: pid++, x: px, y: top, width: w, height: HOLLOW_Y - top + 10, type: 'solid', style: 'moss_stone' };
      P.push(p);
      stones.push(p);
      flower(px + w / 2, top - 34, 'orchid');
      tops.push(top);
      px += w;
      prevTop = top;
    }
    // (`plain`, 1-1: the last hop down onto the bank is a short one, whatever the stones' spacing)
    const far = Math.round(px + reachJump(prevTop - G, dbl && !plain) * R.r(share[0], share[1]));
    if (plain) plainPit(edge, stones, far);
    else {
      softPit(edge, far);
      pitFloors(edge, stones, far, plain);
    }
    open(far);
    run(plain ? R.r(130, 170) : R.r(160, 240));
    expert += (x - x0) / RUN + 0.6 * heights.length;
    pieces.push({ k: 'stumps', x0, x1: x });
  }

  /** a mushroom that bounces Pokey up to a high branch nobody can jump to: a cache of petals and a golden seed (1-1's secret) */
  function mushroomCache() {
    const x0 = x;
    run(R.r(120, 160));
    const mx = x;
    P.push({ id: pid++, x: mx, y: G - 30, width: 70, height: 30, type: 'bouncy' });
    // higher than a double jump reaches from the ground, so only the mushroom gets him there
    const by = Math.round(G - RISE - 70);
    branch(mx - 40, mx + 230, by);
    row(mx + 10, mx + 200, by - 34, 4, 'hibiscus');
    goldenSeed(mx + 150, by - 70);
    run(R.r(220, 260));
    expert += (x - x0) / RUN + 1.5;
    pieces.push({ k: 'rest', x0, x1: x });
  }

  /**
   * the high road: a mushroom bounces him up onto a run of branches with small gaps between them (flowers along the top). Falling off
   * only drops him onto the ground path below, which runs the same way, so the high road is a bonus, never a trap.
   */
  function highRoad() {
    const x0 = x;
    run(R.r(160, 220));
    P.push({ id: pid++, x: x, y: G - 30, width: 70, height: 30, type: 'bouncy' });
    const y = Math.round(G - R.r(170, 200));
    let bx = x + 40;
    const n = R.i(3, 5);
    for (let k = 0; k < n; k++) {
      const w = Math.round(R.r(170, 260));
      branch(bx, bx + w, y);
      row(bx + 30, bx + w - 30, y - 34, 2, 'hibiscus');
      bx += w + Math.round(reachJump(0, false) * R.r(0.4, 0.6));
    }
    x = bx + R.r(100, 160);
    expert += (x - x0) / RUN + 1.2;
    pieces.push({ k: 'highrun', x0, x1: x });
  }

  // ----- World 1's open ground, rebuilt (2026-10-28, the stage inspector): something to do every second or two, never a long empty
  // walk and never only petals on flat ground, with a short plain rest after each burst. Gentle: nothing taller than one easy hop.
  /** World 4's rocks are its painted mossy rock (art 'rock', sized to the rock: protoArt drawRockArt), not the kit's thin ledge */
  const w4Rocks = config.worldIndex === 4;
  const w1Rocks = config.worldIndex === 1;
  /** a mossy rock lying across the path, one easy hop high, a petal on top */
  function logHop(h = R.i(34, 46)) {
    const w = Math.round(w4Rocks ? R.r(84, 96) : R.r(120, 170));
    // (World 1, 2026-10-28: the rock stands down into the ground, the bank broken around it, as 1-1's stumps: on one bank under it the
    // stage inspector's quick route walked straight through it and counted the hop as a quiet walk)
    // (never at the very edge of a dip just crossed: the rock would stand on the dip's way out, too high a hop from its step)
    // (World 4 too, 2026-10-28: its mossy rocks on one bank read as four quiet seconds at 4-8's start and between 4-5's cover)
    const sunk = w1Rocks || w4Rocks;
    if (sunk && x - bankFrom < 60) run(60);
    if (sunk) close();
    const rk = block(x, x + w, h);
    if (sunk) rk.height = h + BANK_H;
    if (w4Rocks) rk.art = 'rock';
    flower(x + w / 2, G - h - 34, 'orchid');
    run(w);
    if (sunk) open(x);
    expert += w / RUN + 0.15;
  }
  /** a little dip of soft moss to jump (a miss is a hop back out, never a life) */
  function dip(share = R.r(0.34, 0.46)) {
    const edge = x;
    close();
    const far = Math.round(edge + reachJump(0, false) * share);
    softPit(edge, far);
    open(far);
    expert += (far - edge) / RUN + 0.15;
  }
  /** a wide gap of soft moss that the second jump crosses (level both sides: across, never up), petals arcing over it */
  function leap(share = R.r(0.64, 0.72)) {
    const edge = x;
    close();
    const far = Math.round(edge + reachJump(0, true) * share);
    softPit(edge, far);
    arc(edge - 30, far + 30, G - 150, 3, 'hibiscus');
    open(far);
    expert += (far - edge) / RUN + 0.4;
  }
  /** `n` hops or dips (the kinds rolled from `kinds`) about a second apart, then plain ground to rest on (`restAfter` px) */
  function busy(n: number, kinds: ReadonlyArray<'log' | 'dip' | 'leap'> = ['log', 'dip'], restAfter = R.r(255, 295)) {
    const x0 = x;
    for (let k = 0; k < n; k++) {
      const go = k ? R.r(200, 290) : R.r(90, 140);
      run(go);
      expert += go / RUN;
      const kind = R.pick(kinds);
      if (kind === 'log') logHop();
      else if (kind === 'leap') leap();
      else dip();
    }
    run(restAfter);
    expert += restAfter / RUN;
    pieces.push({ k: 'rest', x0, x1: x });
  }
  /**
   * World 1's first stumps: three or four, each at most 50 above the one before (never higher than 90), each wide enough for a short
   * thumb to land on, with no thin step in the gaps (the inspector's kid bot missed 30-45 px steps and 100 px step-ups, 2026-10-28)
   */
  function lowStumps() {
    const x0 = x;
    run(R.r(50, 90));
    const n = R.i(3, 4);
    let h = 0;
    for (let k = 0; k < n; k++) {
      // (76 at most since 2026-10-28: a stump 90 up from the ground between them was a jump the kid bot made 81% of the time)
      h = k === 0 ? R.i(40, 50) : Math.max(36, Math.min(76, h + R.pick([40, 50, -30] as const)));
      const w = Math.round(R.r(130, 170));
      // (each stump stands down into the ground, the bank broken around it: on one long bank under them the stage inspector's quick
      // route walked straight through them, and read World 1's openings as five quiet seconds, 2026-10-28)
      close();
      block(x, x + w, h).height = h + BANK_H;
      flower(x + w / 2, G - h - 34, 'orchid');
      const g = Math.round(R.r(70, 105));
      run(w);
      open(x);
      run(k < n - 1 ? g : 0);
    }
    // (far enough on that a flag after them stands on the ground, not on the last stump)
    run(R.r(100, 130));
    expert += (x - x0) / 240;
    pieces.push({ k: 'stumps', x0, x1: x });
  }
  /**
   * the high road over busy ground: the same branches as highRoad, and on the floor below, where the way runs on for anyone who did
   * not take the mushroom, a low rock or a dip every second or so (the quick way under the branches was a 19 s empty walk)
   */
  function highRoadOver() {
    const x0 = x;
    run(R.r(160, 220));
    P.push({ id: pid++, x: x, y: G - 30, width: 70, height: 30, type: 'bouncy' });
    const y = Math.round(G - R.r(175, 200));
    let bx = x + 40;
    const n = R.i(3, 4);
    for (let k = 0; k < n; k++) {
      const w = Math.round(R.r(170, 240));
      branch(bx, bx + w, y);
      row(bx + 30, bx + w - 30, y - 34, 2, 'hibiscus');
      bx += w + Math.round(reachJump(0, false) * R.r(0.4, 0.55));
    }
    // the floor below: from past the mushroom to the end of the road, rocks a hop high (well under the branches)
    const end = bx;
    run(180);
    while (end - x > 330) {
      const go = R.r(200, 280);
      run(go);
      if (end - x < 200) break;
      logHop(R.i(30, 40));
    }
    x = Math.max(x, end) + R.r(90, 130);
    // (where the road comes down, a dip to jump as he lands, then a short rest)
    dip();
    run(R.r(250, 280));
    expert += (x - x0) / RUN + 1.2;
    pieces.push({ k: 'highrun', x0, x1: x });
  }
  /** the last stretch: two little jumps, and the shrine a short run past them (the old walk home was four empty seconds) */
  function homeRun(kinds: ReadonlyArray<'log' | 'dip'> = ['dip', 'log']) {
    run(R.r(180, 240));
    if (R.pick(kinds) === 'log') logHop(); else dip();
    run(R.r(220, 280));
    if (R.pick(kinds) === 'log') logHop(); else dip();
    // (the shrine stands 260 short of the end: about a second and a half of plain ground to it)
    run(R.r(640, 700));
    expert += 4.2;
  }

  // ----- World 1's section versions (w1Sections.ts, the variety pass 2026-10-28): the pieces above and below, handed to the versions
  /** soft gaps of these widths, a run of ground after each (`arcs`: petals over each, where the jump goes) */
  function gapRun(widths: number[], after: [number, number], arcs = false) {
    const x0 = x;
    widths.forEach((w, i) => {
      run(i ? R.r(after[0], after[1]) : R.r(100, 140));
      const edge = x;
      close();
      const far = Math.round(edge + w);
      softPit(edge, far);
      if (arcs) arc(edge - 40, far + 40, G - 150, 3, 'hibiscus');
      else flower(edge + w / 2, G - 150, 'hibiscus');
      open(far);
    });
    expert += (x - x0) / RUN + 0.4 * widths.length;
    pieces.push({ k: 'stumps', x0, x1: x });
  }
  /** somewhere safe to try the second jump first, right after its tip: a shelf over flat ground that only the second jump reaches */
  function practiceShelf() {
    const sx = x + PRACTICE_AT;
    branch(sx, sx + 160, G - PRACTICE_H);
    row(sx + 40, sx + 120, G - PRACTICE_H - 34, 2, 'hibiscus');
    run(PRACTICE_AT + 160 + 140);
    expert += (PRACTICE_AT + 300) / RUN;
    // (a rock just past it: nothing may stand under the shelf, and the walk from the tip to the first gap was 4-5 quiet seconds)
    logHop();
  }
  /**
   * a wall too tall to jump, even twice, with a mushroom at its foot: bounce up onto it, run along its top (petals), drop off the far end.
   * A miss is a bounce again; the face reaches the ground (nothing to walk under). `first` teaches the bounce before it is needed.
   */
  function bounceWall(first = false, rock = true) {
    const x0 = x;
    run(R.r(150, 210));
    if (first) once('bounceWall', () => hint(x - 120, 'Land on the mushroom to bounce up high', 'Land on the mushroom to bounce up high', 'Land on the mushroom to bounce up high'));
    P.push({ id: pid++, x: Math.round(x), y: G - 30, width: 70, height: 30, type: 'bouncy' });
    run(70 + R.r(50, 70));
    const h = R.i(225, 240);
    close();
    const top = cliff(x, x + (rock ? R.r(330, 400) : R.r(240, 290)), h);
    row(top.x + 50, top.x + 110, top.y - 34, 2, 'hibiscus');
    // (a mossy rock to hop on its top: the run along it is not an empty walk; a short top needs none)
    if (rock) topRock(top, 0.62);
    open(top.x + top.width);
    // (where he comes down, a dip to jump as he lands: no empty walk to the next thing)
    run(R.r(70, 100));
    dip();
    run(R.r(90, 130));
    expert += (x - x0) / RUN + 0.6;
    pieces.push({ k: 'highrun', x0, x1: x });
  }
  /**
   * LV-3 (Matt, 2026-10-29: the double jump stays on from the start on Easy, and 1-6 teaches it just before the first gap that needs
   * it): a practice spot over solid floor, no fall and no clock. A low rock (50 px), then a ledge, then a second ledge across a gap at the same
   * height that one jump falls short of (Normal's 175 px) and the second jump clears even with Easy's short hold (285 px); petals on the
   * far ledge. Both ledges stand above one jump's rise (108 px), so the floor runs on under them and a plain walk passes beneath.
   */
  function dblPractice() {
    const x0 = x;
    run(R.r(150, 190));
    // (a painted rock on the floor: a 50 px mossy stone draws as the boulder (protoArt.ts drawRockArt); a bare block drew as a grey box,
    // and a rock sunk into the bank as a soil step with a hard cut face)
    const rock = block(x, x + 110, PRACTICE.step);
    flower(rock.x + rock.width / 2, rock.y - 34, 'orchid');
    x = rock.x + rock.width;
    const ay = G - PRACTICE.ledge;
    const a = branch(x + 30, x + 190, ay);
    // (Dot names the move once, on the ground, where the near ledge is on screen upright too (the upright view is about 420 px of the
    // world wide): DBL_PRACTICE, approved by the lead for Matt, 2026-10-29)
    hint(a.x - 170, DBL_PRACTICE[0], DBL_PRACTICE[1], DBL_PRACTICE[2], G - 4);
    flower(a.x + a.width / 2, ay - 34, 'orchid');
    const b = branch(a.x + a.width + PRACTICE.gap, a.x + a.width + PRACTICE.gap + 170, ay);
    row(b.x + 45, b.x + b.width - 45, ay - 34, 2, 'hibiscus');
    x = b.x + b.width;
    run(R.r(140, 180));
    expert += (x - x0) / RUN + 1.5;
    pieces.push({ k: 'stumps', x0, x1: x });
  }
  /**
   * the high branches: a mushroom up to a run of branches 240 over the ground, short hops between them (a miss drops him onto the
   * ground below, a walk back to the mushroom), and the run ends on the top of a wall that only the branches reach. `dbl`: the gaps
   * want the second jump (across, never up)
   */
  function highLeaps(n: number, dbl = false, first = false, snakes = false) {
    // (1-6: the first gaps that want the second jump get the practice spot just before them, LV-3)
    if (dbl && plan === 'proto') once('dblPractice', dblPractice);
    const x0 = x;
    run(R.r(110, 150));
    if (first) once('bounceWall', () => hint(x - 120, 'Land on the mushroom to bounce up high', 'Land on the mushroom to bounce up high', 'Land on the mushroom to bounce up high'));
    P.push({ id: pid++, x: Math.round(x), y: G - 30, width: 70, height: 30, type: 'bouncy' });
    const y = G - R.i(236, 246);
    let bx = x + 40;
    const one = reachJump(0, false), two = reachJump(0, true);
    for (let k = 0; k < n; k++) {
      // (`snakes`, 1-3 on: a snake on every second branch, which is wider for it: punch it or hop it, a miss is a drop to the ground)
      const guard = snakes && k % 2 === 1;
      const w = Math.round(guard ? R.r(240, 270) : R.r(170, 230));
      branch(bx, bx + w, y);
      if (guard) snake(bx + w / 2, y, w - 100);
      else row(bx + 40, bx + w - 40, y - 34, 2, 'hibiscus');
      bx += w + Math.round(dbl ? two * R.r(0.6, 0.7) : one * R.r(0.4, 0.55));
    }
    // (the ground runs on under the branches, to the wall's foot)
    x = bx;
    close();
    const top = cliff(bx, bx + R.r(120, 150), G - y);
    flower(top.x + top.width / 2, top.y - 34, 'orchid');
    open(top.x + top.width);
    // (far enough on that a flag after it stands on the ground, not on the wall's top)
    run(R.r(95, 115));
    expert += (x - x0) / RUN + 0.6 + n * (dbl ? 0.2 : 0.1) + (snakes ? 0.8 * Math.floor(n / 2) : 0);
    pieces.push({ k: 'highrun', x0, x1: x });
  }
  /**
   * a wall of earth too tall to jump, and a trunk beside it: climb up to the branch at its top and across onto the high ground, then down
   * off its far end onto a dip (1-9's trunkGuard without its guard; the climb is taught in 1-4)
   */
  function climbWall(guard = false) {
    const x0 = x;
    run(R.r(220, 280));
    const tX = x - 120;
    const perchY = G - 260;
    trunk(tX, G, perchY);
    for (let i = 0; i < 3; i++) flower(tX, G - 70 - i * 60, 'hibiscus');
    const bEnd = tX + Math.round(R.r(250, 300));
    branch(tX - 40, bEnd, perchY);
    row(tX + 70, bEnd - 40, perchY - 34, 3, 'orchid');
    const wx = bEnd + Math.round(R.r(90, 120));
    const ww = Math.round(R.r(300, 380));
    block(wx, wx + ww, 230);
    row(wx + 50, wx + ww - 50, G - 264, 4, 'orchid');
    // (`guard`, 1-9: a snake on the high ground, seen from the branch before he steps across)
    if (guard) snake(wx + ww * 0.6, G - 230, ww * 0.5);
    x = wx + ww + R.r(90, 120);
    dip();
    run(R.r(160, 220));
    expert += (x - x0) / RUN + (G - perchY) / CLIMB + 1;
    pieces.push({ k: 'kapok', x0, x1: x });
  }
  const w1: W1Kit = {
    climbWall: (g) => climbWall(g),
    bounceWall: (f, r) => bounceWall(f, r), highLeaps: (n, d, f, sn) => highLeaps(n, d, f, sn),
    R, G, EXPERT: EXPERT_SECONDS,
    get x() { return x; },
    get expert() { return expert; },
    hint: (hx, text, pad, keys) => hint(hx, text, pad ?? text, keys ?? pad ?? text),
    flag: () => flag(), run: (n) => run(n), rest: (n) => rest(n),
    logHop: (h) => logHop(h), dip: (s) => dip(s), leap: (s) => leap(s), busy: (n, kinds, r) => busy(n, kinds, r),
    lowStumps: () => lowStumps(), stumps: () => stumps(), pillars: (h, s, d, p) => pillars(h, s, d, p),
    gapRun: (w, a, arcs) => gapRun(w, a, arcs), practiceShelf: () => practiceShelf(),
    reachOne: reachJump(0, false), reachTwo: reachJump(0, true),
    mushroomCache: () => mushroomCache(), highRoadOver: () => highRoadOver(), homeRun: (kinds) => homeRun(kinds),
    trailUp: (n) => trailUp(n), petalClimb: () => petalClimb(), petalPerch: () => petalPerch(), splitTrail: () => splitTrail(),
    dipArc: () => dipArc(), doubleArcs: (t) => doubleArcs(t),
    snakeBranches: (n, y) => snakeBranches(n, y), ropeGap: (g, b, t) => ropeGap(g, b, t), snakeWalk: (m) => snakeWalk(m), snakeLedge: () => snakeLedge(),
    climbTree: (t) => climbTree(t), fernTree: () => fernTree(), glideLookout: () => glideLookout(), creakRun: () => creakRun(),
    chain: (n, soft, rocks) => chain(n, soft, soft ? 'hollow' : 'gorge', rocks), kapok: () => kapok(), canopy: (g) => canopy(g), highRun: () => highRun(),
    logPuzzle: (b) => logPuzzle(b), seesawRoom: (d) => seesawRoom(d), seesawTwist: () => seesawTwist(),
    bushRow: (n, g, kinds, calm, rocks) => bushRow(n, g, kinds, calm, rocks), secretBush: (c) => secretBush(c), ropeBushes: (c) => ropeBushes(c), acornMeadow: (c) => acornMeadow(c),
    guardBranch: (l) => guardBranch(l), ropeGuard: () => ropeGuard(), trunkGuard: () => trunkGuard(), sleepingGuard: () => sleepingGuard(), snakeRing: () => snakeRing(),
  };
  const w1Stage = (plan === 'proto' ? '1-6' : plan) as W1Stage;
  /** this roll's version of one of the stage's sections (w1Sections.ts) */
  const section = (slot: Slot) => w1Section(w1, w1Stage, slot, seed);

  if (plan === '1-1') {
    // 1-1 Into the Canopy: run and jump. Taught over soft moss, tested on stepping stones at three heights, and twisted at the end
    // into gaps only the second jump crosses. The touch coach teaches the gestures at the start (engine.ts), so the hints come later.
    // (Rebuilt 2026-10-28: the open ground between the pieces holds hops and dips, the stumps and stones stay one easy jump up, and
    // the finish keeps the double jump to gaps over level stones: no tall double jumps in World 1's first stages, Matt.)
    beat('Learn: run and jump', () => {
      rest(R.r(400, 440));
      lowStumps();
      busy(1, ['log'], R.r(240, 290));
      hint(x + 40, 'Jump the little gaps', 'Jump the little gaps', 'Jump the little gaps');
      const one = reachJump(0, false);
      for (const w of [one * 0.35, one * 0.45, one * 0.55]) {
        const edge = x;
        close();
        const far = Math.round(edge + w);
        softPit(edge, far);
        open(far);
        run(R.r(220, 300));
      }
      flag();
    });
    beat('Test: the stepping stones', () => {
      hint(x + 60, 'Hop from stone to stone', 'Hop from stone to stone', 'Hop from stone to stone');
      // (the stones climb 60 at most from one to the next, and the first stands 60 up: the kid bot missed 80 and more, 2026-10-28)
      section('develop');
      // (a dip before the twist's tip: the walk past its practice shelf follows)
      run(R.r(60, 90));
      dip();
      run(R.r(120, 160));
      flag();
    });
    beat('Twist: the second jump', () => {
      hint(x + 60, 'Flick up again in the air to jump twice', 'Press Jump again in the air', 'Press Space again in the air');
      section('twist');
      flag();
    });
    beat('Finish', () => {
      // more of the second jump and the stones, in this roll's rhythm, until even a quick player needs two minutes
      section('finish');
      homeRun();
    });
  }

  /**
   * the petal stairs: stumps rising to a run of branches, the petals climbing with them. The forest floor carries on below (safe),
   * but the petals are up top. With `nook`, a branch above the run hides behind leaves that part as he comes close: more petals there.
   */
  function trailUp(nook: boolean) {
    const x0 = x;
    run(R.r(160, 220));
    // (each step 40 up, and wide: World 1's second stage asks for nothing a short flick misses, 2026-10-28)
    const steps = [40, 80, 120];
    for (const h of steps) {
      const w = R.r(115, 140);
      block(x, x + w, h);
      flower(x + w / 2, G - h - 34, 'orchid');
      run(w + R.r(50, 75));
    }
    const y = G - Math.round(R.r(165, 180));
    let bx = x - 30;
    const n = R.i(3, 4);
    let nookAt = -1;
    for (let k = 0; k < n; k++) {
      const w = Math.round(R.r(220, 300));
      branch(bx, bx + w, y);
      row(bx + 40, bx + w - 40, y - 34, 2, 'orchid');
      if (k === n - 2) nookAt = bx + w * 0.5;
      bx += w + Math.round(reachJump(0, false) * R.r(0.35, 0.5));
    }
    if (nook && nookAt > 0) {
      // a hidden shelf of petals behind leaves, up a mushroom that grows on the run (no tall double jump in World 1's first stages)
      const ny = y - Math.round(R.r(140, 160));
      P.push({ id: pid++, x: Math.round(nookAt - 35), y: y - 30, width: 70, height: 30, type: 'bouncy' });
      branch(nookAt - 60, nookAt + 160, ny);
      row(nookAt - 20, nookAt + 100, ny - 34, 3, 'hibiscus');
      // World 1's note waits on the shelf (the generated 1-2 places it itself; a hand-built stage has to: finds.ts, a note in stage 2)
      const note = findForStage(config.worldIndex, config.miniIndex);
      if (note && note.kind === 'note') C.push({ id: cid++, type: 'find', findId: note.id, hidden: false, x: nookAt + 140, y: ny - 40, collected: false, bobPhase: 0 });
      covers.push({ x: nookAt - 90, y: ny - 80, w: 280, h: 110 });
    }
    // the petals lead back down to the floor, and on over a dip
    arc(bx - 60, bx + 160, y + 20, 3, 'orchid');
    x = bx + R.r(110, 150);
    const e0 = x;
    dip(R.r(0.45, 0.55));
    arc(e0 - 30, x + 30, G - 110, 2, 'hibiscus');
    run(R.r(200, 240));
    expert += (x - x0) / RUN + 2;
    pieces.push({ k: 'highrun', x0, x1: x });
  }

  /**
   * the split trail: a high road of branches and the forest floor run side by side, and the petals swap between them. Each time
   * they go high a mushroom on the floor bounces him up; each time they go low he drops. Three drops in all.
   */
  function splitTrail() {
    const x0 = x;
    run(R.r(160, 220));
    const y = G - Math.round(R.r(175, 195));
    for (let k = 0; k < 3; k++) {
      // high: a mushroom up, then branches with petals
      P.push({ id: pid++, x: x, y: G - 30, width: 70, height: 30, type: 'bouncy' });
      let bx = x + 40;
      const n = R.i(2, 3);
      for (let j = 0; j < n; j++) {
        const w = Math.round(R.r(200, 280));
        branch(bx, bx + w, y);
        row(bx + 40, bx + w - 40, y - 34, 2, 'hibiscus');
        bx += w + Math.round(reachJump(0, false) * R.r(0.35, 0.5));
      }
      // low: the branches carry on overhead with nothing on them, and the petals are on the floor, arcing over a dip of soft moss
      const lowLen = Math.round(R.r(560, 700));
      branch(bx, bx + lowLen, y);
      arc(bx - 40, bx + 120, y + 60, 2, 'orchid');
      for (const u of [0.3, 0.7]) {
        x = Math.max(x + 120, bx + Math.round(lowLen * u));
        const e0 = x;
        dip(R.r(0.5, 0.6));
        // (low, under the branches overhead: never tucked up against them)
        arc(e0 - 30, x + 30, G - 95, 2, 'hibiscus');
      }
      x = Math.max(x + 200, bx + lowLen + R.r(60, 110));
    }
    expert += (x - x0) / RUN + 4;
    pieces.push({ k: 'highrun', x0, x1: x });
  }

  /**
   * the goal is a real test when the stage holds about one and a half times it (two in three to find, room to miss some): the
   * finish is thinned evenly, the taught parts and the hidden shelf are left whole
   */
  function thinFinish(goal: number) {
    const fin = beats[beats.length - 1];
    const late = C.filter((c) => c.type === 'flower' && c.x >= fin[0]);
    const keep = Math.max(Math.round(late.length / 3), Math.round(goal * 1.5) - (C.filter((c) => c.type === 'flower').length - late.length));
    if (late.length > keep) {
      const step = late.length / (late.length - keep);
      const out = new Set<Collectible>();
      for (let i = 0; i < late.length - keep; i++) out.add(late[Math.min(late.length - 1, Math.floor(i * step + step / 2))]);
      for (let i = C.length - 1; i >= 0; i--) if (out.has(C[i])) C.splice(i, 1);
    }
  }

  /** a mushroom on the path up to a short branch of petals, and the petals arcing back down over a dip (1-2's trail, in between) */
  function petalPerch() {
    const x0 = x;
    run(R.r(140, 200));
    P.push({ id: pid++, x: x, y: G - 30, width: 70, height: 30, type: 'bouncy' });
    const y = G - Math.round(R.r(170, 185));
    const bx = x + 40, w = Math.round(R.r(220, 260));
    branch(bx, bx + w, y);
    row(bx + 40, bx + w - 40, y - 34, 3, 'hibiscus');
    x = bx + w + Math.round(R.r(70, 110));
    const e0 = x;
    dip(R.r(0.45, 0.55));
    arc(e0 - 20, x + 20, G - 110, 2, 'orchid');
    run(R.r(190, 230));
    expert += (x - x0) / RUN + 1.2;
    pieces.push({ k: 'highrun', x0, x1: x });
  }

  /**
   * the petal tree: a mushroom on the path up to a branch of petals, a second mushroom growing on that branch up to a higher one, and
   * down again past the end, over a dip (1-2's trail climbs by bounces, where 1-1 climbs stone by stone)
   */
  function petalClimb() {
    const x0 = x;
    run(R.r(140, 200));
    P.push({ id: pid++, x: x, y: G - 30, width: 70, height: 30, type: 'bouncy' });
    const y1 = G - Math.round(R.r(170, 182));
    const b1x = x + 40, w1 = Math.round(R.r(260, 300));
    branch(b1x, b1x + w1, y1);
    row(b1x + 40, b1x + 120, y1 - 34, 2, 'hibiscus');
    const m2 = b1x + w1 - 110;
    P.push({ id: pid++, x: m2, y: y1 - 30, width: 70, height: 30, type: 'bouncy' });
    const y2 = y1 - Math.round(R.r(150, 165));
    const b2x = m2 + 30, w2 = Math.round(R.r(240, 280));
    branch(b2x, b2x + w2, y2);
    row(b2x + 50, b2x + w2 - 40, y2 - 34, 3, 'orchid');
    x = b2x + w2 + Math.round(R.r(60, 100));
    const e0 = x;
    dip(R.r(0.45, 0.55));
    arc(e0 - 20, x + 20, G - 110, 2, 'hibiscus');
    run(R.r(190, 230));
    expert += (x - x0) / RUN + 2;
    pieces.push({ k: 'highrun', x0, x1: x });
  }

  if (plan === '1-2') {
    // 1-2 The Petal Trail: the petals show the way. Taught on the floor (they arc over each gap where the jump goes), tested up the
    // stumps to the branches overhead, twisted into a trail that swaps between high and low. The stage asks for 33 of them.
    // (Rebuilt 2026-10-28: the trail is bounces and arcs, up and down, where 1-1 is hops along stones; the steps are 40 up and wide,
    // the hidden shelf is a mushroom up, and between the pieces the petals go up a mushroom and arc back down over a dip.)
    beat('Learn: follow the petals', () => {
      rest(R.r(300, 340));
      hint(x - 160, 'Follow the petals', 'Follow the petals', 'Follow the petals');
      row(x - 160, x + 40, G - 34, 3, 'orchid');
      const one = reachJump(0, false);
      for (const w of [one * 0.4, one * 0.5, one * 0.6]) {
        run(R.r(160, 220));
        const edge = x;
        close();
        const far = Math.round(edge + w);
        softPit(edge, far);
        arc(edge - 50, far + 50, G - 110, 3, 'hibiscus');
        open(far);
      }
      run(R.r(160, 220));
      // (then the petals up the stumps, or up a mushroom, in this roll's rhythm)
      section('start');
      flag();
    });
    beat('Test: up to the branches', () => {
      hint(x + 60, 'The petals go up', 'The petals go up', 'The petals go up');
      // (every version climbs the stairs to the hidden shelf with World 1's note: w1Sections.ts)
      section('develop');
      flag();
    });
    beat('Twist: high and low', () => {
      hint(x + 60, 'Stay on the petals, high or low', 'Stay on the petals, high or low', 'Stay on the petals, high or low');
      section('twist');
      flag();
    });
    beat('Finish', () => {
      // (the trail's own beat, in this roll's rhythm: up a mushroom to the petals and down again, or up the stairs and along)
      section('finish');
      homeRun(['dip']);
    });
    thinFinish(PETAL_GOAL_12);
  }

  /** branches over a soft pit with a snake on most of them: punch it or hop over it (falling only drops him to the moss) */
  function snakeBranches(n: number, y: number) {
    const x0 = x;
    run(R.r(160, 220));
    const edge = x;
    close();
    let bx = edge + Math.round(reachJump(G - y, false) * R.r(0.45, 0.6));
    let m = 0;
    for (let k = 0; k < n; k++) {
      const w = Math.round(R.r(210, 280));
      const top = y + Math.round(R.r(-20, 20));
      branch(bx, bx + w, top);
      if (k !== 0 || n < 3) { snake(bx + w / 2, top, w - 90); m++; }
      else row(bx + 50, bx + w - 50, top - 34, 2, 'orchid');
      bx += w + Math.round(reachJump(0, false) * R.r(0.4, 0.55));
    }
    const far = Math.round(bx + 20);
    softPit(edge, far);
    open(far);
    run(R.r(200, 280));
    expert += (x - x0) / RUN + 1.6 * m;
    pieces.push({ k: 'snakes', x0, x1: x });
  }

  /**
   * a rope over a wide soft pit, a snake on the near ledge beside its end. Before Shimmy Rope is learned (clearing this stage) he drops
   * into the moss and climbs out the far side; after, he shimmies across. `bonus`: petals along under the rope for the shimmy.
   */
  function ropeGap(guard: boolean, bonus: boolean, tight = false) {
    const x0 = x;
    // (`tight`: World 1's rebuilt stages run up to it and away from it quicker, 2026-10-28)
    run(tight ? (guard ? R.r(400, 440) : R.r(150, 210)) : R.r(260, 340));
    const edge = x;
    // (`tight` with a guard: it waits further back from the rope, so a second's rest lies between the fight and the jump down)
    if (guard) snake(edge - (tight ? 330 : 120), G, 140);
    close();
    const far = Math.round(edge + R.r(380, 430));
    softPit(edge, far);
    // (`tight`: a mossy rock to hop on the moss below, for whoever crosses down there)
    if (tight) {
      P.push({ id: pid++, x: Math.round((edge + far) / 2 - 50), y: HOLLOW_Y - 52, width: 100, height: 52, type: 'solid', style: 'moss_stone' });
      flower((edge + far) / 2, HOLLOW_Y - 86, 'orchid');
    }
    ROPES.push({ id: ROPES.length + 1, x0: edge - 44, x1: far + 44, y: G - 146, g0: G, g1: G, required: false });
    if (bonus) row(edge + 60, far - 60, G - 146 + 86 - 40, 3, 'hibiscus');
    open(far);
    run(tight ? R.r(170, 230) : R.r(220, 300));
    expert += (x - x0) / RUN + 2.5 + (guard ? 1.5 : 0);
    pieces.push({ k: 'snakes', x0, x1: x });
  }

  /** snakes on the open ground, each after a rock to hop: hop, then punch it or hop it too (1-3's walks were empty between snakes) */
  function snakeWalk(m: number) {
    const x0 = x;
    for (let k = 0; k < m; k++) {
      run(R.r(150, 210));
      logHop();
      run(R.r(150, 200));
      snake(x + 70, G, 120);
      flower(x + 70, G - 120, 'orchid');
      // (and a short rest of plain ground before the next: about a second, Gemini's rest pad)
      run(R.r(270, 300));
    }
    expert += (x - x0) / RUN + 1.5 * m;
    pieces.push({ k: 'snakes', x0, x1: x });
  }

  if (plan === '1-3') {
    // 1-3 Branch Snakes: punching. One snake asleep on a wide branch to learn on, then snakes on narrow branches (punch or hop),
    // then a snake guarding a rope: clearing the stage teaches Shimmy Rope, and a short rope near the end is there to try it on.
    // (Rebuilt 2026-10-28: the walks between the snakes hold rocks to hop and dips, the stumps stay low, no tall double jumps.)
    beat('Learn: the sleeping snake', () => {
      rest(R.r(420, 470));
      // (stumps and a rock before the first snake: the first-timer bot walked into it 2.5 s in, before Dot's tip, on every roll; nothing
      // can hurt in the first five seconds, 2026-10-28)
      lowStumps();
      busy(1, ['log'], R.r(200, 240));
      const wx = x + 120;
      branch(wx, wx + 420, G - 90);
      snake(wx + 260, G - 90, 60, true);
      row(wx + 40, wx + 160, G - 124, 2, 'orchid');
      hint(wx - 80, 'Hop up beside the sleeping snake and tap to punch it', 'Hop up beside the sleeping snake and press Punch', 'Hop up beside the sleeping snake and press J to punch');
      run(R.r(600, 640));
      expert += 3;
      // (then two more snakes, awake now, in this roll's rhythm: w1Sections.ts)
      section('start');
      flag();
    });
    beat('Test: snakes on the branches', () => {
      hint(x + 60, 'Punch the snakes or hop over them', 'Punch the snakes or hop over them', 'Punch the snakes or hop over them');
      section('develop');
      flag();
    });
    beat('Twist: the rope guard', () => {
      hint(x + 60, 'A snake guards the rope', 'A snake guards the rope', 'A snake guards the rope');
      section('twist');
      flag();
    });
    beat('Finish', () => {
      section('finish');
      // the short rope to try the new move on (it needs the skill this stage teaches, so it is a reason to come back)
      ropeGap(false, true, true);
      homeRun();
    });
  }

  /** petals arcing over soft gaps only a double jump crosses: the top of each arc is higher than one jump reaches */
  function doubleArcs(tight = false) {
    const x0 = x;
    run(R.r(180, 240));
    const two = reachJump(0, true);
    for (const w of [two * 0.66, two * 0.74, two * 0.8]) {
      const edge = x;
      close();
      const far = Math.round(edge + w);
      softPit(edge, far);
      arc(edge - 40, far + 40, Math.round(G - 20 - JUMP_RISE - 45), 3, 'hibiscus');
      open(far);
      run(tight ? R.r(190, 250) : R.r(240, 320));
    }
    expert += (x - x0) / RUN + 2;
    pieces.push({ k: 'stumps', x0, x1: x });
  }

  /**
   * creaking branches with petals on them, over safe ground: each one gives way a moment after he lands (and grows back), so he grabs
   * and keeps moving. Never needed to get through (the floor runs underneath), only to get the petals.
   */
  function creakRun() {
    const x0 = x;
    run(R.r(160, 220));
    block(x, x + 100, 60);
    flower(x + 50, G - 94, 'orchid');
    run(100 + R.r(50, 80));
    const y = G - Math.round(R.r(135, 150));
    const n = R.i(4, 5);
    for (let k = 0; k < n; k++) {
      const w = Math.round(R.r(150, 200));
      branch(x, x + w, y + Math.round(R.r(-12, 12)), 'fragile');
      row(x + 35, x + w - 35, y - 34, 2, 'hibiscus');
      run(w + Math.round(reachJump(0, false) * R.r(0.35, 0.5)));
    }
    run(R.r(160, 240));
    expert += (x - x0) / RUN + 1;
    pieces.push({ k: 'highrun', x0, x1: x });
  }

  /** a tree to climb, with World 1's keepsake hidden in a Hush Fern at the end of its branch (crouch beside it to search) */
  function fernTree() {
    const x0 = x;
    run(R.r(250, 300));
    const tX = x - 150;
    const perchY = 300;
    trunk(tX, G, perchY);
    // (a shorter branch since 2026-10-28: the walk out to the fern and back down read as four quiet seconds)
    branch(tX - 40, tX + 220, perchY);
    for (let i = 0; i < 4; i++) flower(tX, G - 70 - i * 60, 'hibiscus');
    row(tX + 60, tX + 120, perchY - 34, 2, 'orchid');
    const keep = findForStage(config.worldIndex, config.miniIndex);
    if (keep && keep.kind === 'keepsake') C.push({ id: cid++, type: 'find', findId: keep.id, hidden: true, x: tX + 180, y: perchY - 26, collected: false, bobPhase: 0 });
    run(R.r(170, 220));
    expert += (x - x0) / RUN + (2 * (G - perchY)) / CLIMB;
    pieces.push({ k: 'kapok', x0, x1: x });
  }

  /** a lookout up a trunk, and far out over the floor a ledge only the Leaf Glide reaches, with a golden seed (back after World 4) */
  function glideLookout() {
    const x0 = x;
    // (a dip on the way to the lookout: the walk to it was four quiet seconds after a high run, 2026-10-28)
    run(R.r(140, 170));
    dip();
    run(R.r(170, 200));
    const tX = x - 120;
    const perchY = 300;
    trunk(tX, G, perchY);
    branch(tX - 40, tX + 220, perchY);
    for (let i = 0; i < 3; i++) flower(tX, G - 70 - i * 70, 'orchid');
    // higher than a double jump from the floor, and past a double jump from the lookout, well inside a glide
    const gy = Math.round(G - RISE - 30);
    const dy = perchY - gy;
    const gap = Math.round((reachJump(dy, true) + reachGlide(dy, true)) / 2);
    const lx = tX + 220 + gap;
    branch(lx, lx + 120, gy);
    goldenSeed(lx + 60, gy - 34);
    hint(tX - 60, 'Something shiny, far away...', 'Something shiny, far away...', 'Something shiny, far away...', undefined);
    const end = lx + 120 + R.r(380, 460);
    // the floor on under the lookout and the far ledge: dips of moss to jump (never a rock: from on top of one a double jump would
    // reach the ledge the glide is for)
    x = tX + 240;
    while (end - x > 260) {
      run(R.r(180, 260));
      dip();
    }
    x = Math.max(x, end);
    expert += (x - x0) / RUN + (2 * (G - perchY)) / CLIMB;
    pieces.push({ k: 'kapok', x0, x1: x });
  }
  /** a dip with two petals arcing over it */
  function dipArc() {
    const e0 = x;
    dip();
    // (each over a bank's edge, at the top of the jump across)
    arc(e0 - 30, x + 30, G - 125, 2, 'hibiscus');
  }
  /** a low branch with a snake on it, awake, and petals behind it: punch it off, or hop it (1-5's punch group; 1-3 walks among snakes) */
  function snakeLedge() {
    const x0 = x;
    run(R.r(150, 200));
    const bx = x, w = Math.round(R.r(300, 340));
    branch(bx, bx + w, G - 90);
    snake(bx + w * 0.45, G - 90, 80);
    row(bx + w * 0.7, bx + w - 30, G - 124, 2, 'hibiscus');
    x = bx + w + Math.round(R.r(60, 100));
    dipArc();
    run(R.r(190, 230));
    expert += (x - x0) / RUN + 1.6;
    pieces.push({ k: 'snakes', x0, x1: x });
  }

  if (plan === '1-5') {
    // 1-5 More Petals: everything so far, mixed. Every group of petals asks for a different move (a climb, a rope, a double jump, a
    // bounce, a punch), then the petals go onto creaking branches that give way: grab and keep moving. The keepsake hides in a fern
    // up a tree, and a seed far out from a lookout waits for the Leaf Glide.
    // (Rebuilt 2026-10-28: a dip or a rock between the groups, and a finish of climbs, ropes, creaking runs and snakes, where 1-2's
    // trail is bounces and stairs: the two read as different stages now.)
    beat('Start', () => {
      rest(R.r(400, 440));
      busy(1, ['log']);
      flag();
    });
    beat('Test: a move for every group', () => {
      hint(x + 40, 'Every group of petals needs a different move', 'Every group of petals needs a different move', 'Every group of petals needs a different move');
      // (every version climbs the tree with the keepsake in its fern: w1Sections.ts)
      section('develop');
      flag();
    });
    beat('Twist: creaking branches', () => {
      hint(x + 60, 'Creaky branches! Grab the petals and keep moving', 'Creaky branches! Grab the petals and keep moving', 'Creaky branches! Grab the petals and keep moving');
      section('twist');
      flag();
    });
    beat('Finish', () => {
      section('finish');
      glideLookout();
      homeRun();
    });
    thinFinish(PETAL_GOAL_15);
  }

  /** the bush sizes (px wide); each painting keeps its own shape */
  const BUSH_W = { tall: 124, wide: 176, fern: 150, grotto: 170 } as const;
  const bush = (bx: number, kind: Bush['kind'], extra: Partial<Bush> = {}) => {
    const b: Bush = { x: Math.round(bx), w: BUSH_W[kind], y: G, kind, ...extra };
    BUSHES.push(b);
    return b;
  };
  /** the time a stretch takes a quick player who waits out the eagle's passes in the bushes (calm, plus a warning and a sweep) */
  const watched = (len: number, calm: number) => (len / RUN) * ((calm + 4) / calm);

  /** bushes along the ground, `gap` apart, petals between them (a run, a bush, a run...) */
  function bushRow(n: number, gap: [number, number], kinds: Array<Bush['kind']>, calm: [number, number], rocks = false) {
    const x0 = x;
    for (let k = 0; k < n; k++) {
      const g = R.r(gap[0], gap[1]);
      if (k > 0 && !rocks) row(x + 80, x + g - 80, G - 34, Math.max(1, Math.round(g / 260)), 'orchid');
      // (`rocks`, World 1's rebuilt 1-7: a mossy rock or two to hop between the bushes, a petal on each: the run from bush to bush is
      // a hop and a dash, not an empty walk)
      // (and before the first bush of a row 400 px and more in, 2026-10-29: 1-7's rows are closer now, and a first gap with no rock was
      // two and a half seconds of plain running)
      if (rocks && (k > 0 || g >= 400)) {
        // (three in the longest runs, World 1's rebuilt 1-7 since 2026-10-28: two left two seconds of plain running between them)
        const m = g >= 760 ? 3 : g >= 640 ? 2 : 1;
        for (let j = 0; j < m; j++) {
          const rw = Math.round(R.r(110, 140));
          const rx = Math.round(x + (g * (j + 1)) / (m + 1) - rw / 2);
          const rh = R.i(34, 44);
          block(rx, rx + rw, rh);
          flower(rx + rw / 2, G - rh - 34, 'orchid');
        }
      }
      run(g);
      const kind = kinds[k % kinds.length];
      bush(x - BUSH_W[kind] / 2, kind);
    }
    const lastBush = BUSHES[BUSHES.length - 1];
    run(R.r(260, 340));
    // (1-7, QA 2026-10-29: the eagle watches up to just past the last bush, not the walk on from it: a pass that came as he walked on
    // caught him 300 px from the bush behind him, off an upright screen)
    ZONES.push({ x0, x1: plan === '1-7' ? Math.min(x, lastBush.x + lastBush.w + 40) : x, calm });
    expert += watched(x - x0, (calm[0] + calm[1]) / 2);
    pieces.push({ k: 'rest', x0, x1: x });
  }

  /**
   * one bush with a secret: a short trunk stands inside it, up to a branch path hidden behind leaves (a golden seed at its end).
   * From outside it looks like any other bush; climb up from inside it.
   */
  function secretBush(calm: [number, number]) {
    const x0 = x;
    run(R.r(380, 460));
    const b = bush(x - BUSH_W.tall / 2, 'tall');
    const tX = Math.round(b.x + b.w / 2);
    const perchY = Math.round(G - 160);
    trunk(tX, G, perchY);
    // (its climbing vine starts a hop up the trunk, QA 2026-10-29, 1-7: Dot's climb lesson, "Flick up into the trunk to grab it", fired
    // here on the ground, for a trunk hidden in the leaves; the player saw no trunk, walked on to the next wall and flicked up into it six
    // times, where the spring mushroom is the way. A flick up from inside the bush still catches it: the secret stays a secret)
    V[V.length - 1].bottomY = G - SECRET_VINE_UP;
    const end = tX + Math.round(R.r(360, 420));
    branch(tX - 40, end, perchY);
    row(tX + 70, end - 90, perchY - 34, 3, 'hibiscus');
    goldenSeed(end - 40, perchY - 34);
    covers.push({ x: tX + 30, y: perchY - 90, w: end - tX, h: 110 });
    run(R.r(520, 620));
    // (1-7's rebuild: a rock to hop past the end of the secret path, on the way to the next bush)
    if (plan === '1-7') {
      const rx = Math.max(end + 40, x - 160);
      block(rx, rx + 120, 40);
      flower(rx + 60, G - 74, 'orchid');
    }
    // (1-7, QA 2026-10-29: watched to just past the bush, as the bush rows are: the walk on from it was 500 px with no bush on screen)
    ZONES.push({ x0, x1: plan === '1-7' ? b.x + b.w + 40 : x, calm });
    expert += watched(x - x0, (calm[0] + calm[1]) / 2);
    pieces.push({ k: 'rest', x0, x1: x });
  }

  /** a rope over a wide soft pit with bushes hanging from it: shimmy from one to the next between the eagle's passes */
  function ropeBushes(calm: [number, number]) {
    const x0 = x;
    run(R.r(300, 380));
    bush(x - 200, 'wide');
    const edge = x;
    close();
    const far = Math.round(edge + R.r(980, 1100));
    softPit(edge, far);
    const ry = G - ROPE_RISE;
    ROPES.push({ id: ROPES.length + 1, x0: edge - 44, x1: far + 44, y: ry, g0: G, g1: G, required: false });
    const span = far - edge;
    // hanging just under the rope (by a few vine strands): his body, hanging from his hands, is inside the bush
    for (const u of [0.26, 0.52, 0.78]) bush(edge + span * u - 52, 'tall', { w: 104, y: ry + 6, hanging: true });
    for (const u of [0.13, 0.39, 0.65, 0.9]) flower(edge + span * u, ry + HANG_DROP - 26, 'orchid');
    // (and mossy rocks on the moss below, a petal on each, for whoever drops off the rope and crosses down there)
    for (const u of [0.33, 0.66]) {
      const rx = Math.round(edge + span * u - 50);
      P.push({ id: pid++, x: rx, y: HOLLOW_Y - 52, width: 100, height: 52, type: 'solid', style: 'moss_stone' });
      flower(rx + 50, HOLLOW_Y - 86, 'orchid');
    }
    open(far);
    // (1-7, QA 2026-10-29: a bush on the far bank as he drops off the rope, and the eagle watches to just past it: the walk on from the
    // rope's end was 500 px with no bush on an upright screen)
    let x1 = x + R.r(260, 340);
    if (plan === '1-7') {
      run(R.r(50, 70));
      const fb = bush(x, 'tall');
      x1 = fb.x + fb.w + 40;
    }
    run(Math.max(0, x1 - x) + (plan === '1-7' ? R.r(180, 240) : 0));
    ZONES.push({ x0, x1: Math.min(x, x1), calm });
    expert += (edge - x0) / RUN + (span + 88) / ROPE_SPEED * ((calm[0] + calm[1]) / 2 + 4) / ((calm[0] + calm[1]) / 2) + (x - far) / RUN;
    pieces.push({ k: 'snakes', x0, x1: x });
  }

  /**
   * the acorn meadow (1-7's puzzle, the shared kit's noise lure, 2026-10-28): open ground the eagle watches, too long to cross between
   * two of its passes, with an acorn tree by the bush at each end of it. Carry an acorn out (hands full: no jumping), and when the eagle
   * screeches, flick up to throw it and keep running: it lands behind him with a clack, the eagle circles over the noise instead of
   * sweeping on, and he is past. The first stretch is short enough to cross without it (a bush at its end: the safe place to try the
   * throw), the second is not. No rock or dip in the first part of each stretch (carrying, he cannot hop), a rock or two after it.
   */
  function acornMeadow(calm: [number, number]) {
    const x0 = x;
    run(R.r(260, 320));
    bush(x - BUSH_W.wide / 2, 'wide');
    const room = (len: number, first: boolean) => {
      run(R.r(120, 150));
      const oakX = x;
      run(660);
      const floor = endBank();
      const n = ROOMS.length;
      ROOMS.push({
        id: `acorns-${n}`,
        left: onP(floor, oakX - 150), right: onP(floor, oakX + 640), above: 380, below: 60,
        pieces: [
          { kind: 'reset', id: `post${n}`, at: onP(floor, oakX - 120) },
          { kind: 'source', id: `oak${n}`, variant: 'acorn', at: onP(floor, oakX), look: 'tree' },
          { kind: 'item', id: `acorn${n}`, variant: 'acorn', source: `oak${n}` },
        ],
        exit: `acorn${n}`, beyond: onP(floor, oakX + 620), ground: [floor.id],
        // (QA 2026-10-29, 1-7: "Carry one out with you" read as a must, and a player who walked on without one was left wondering. The
        // first stretch is crossable without it, the second only with it: the first room says what an acorn is for, the second that
        // this time it is needed. Both lines new, need Matt's approval)
        tips: first
          ? { enter: "The squirrels' acorn tree, and that eagle!", hold: 'When it screeches, flick up to throw it.', nudge: 'An acorn could fool that eagle.', move: 'Take an acorn. Throw it when it screeches.' }
          : { enter: 'Too far to run without an acorn.', nudge: 'That acorn tree again. Hmm.', move: 'Take an acorn!' },
        // (Dot's lines: the problem on walking in, a nudge on struggle, the move only on Help: dotTips.ts)
        mech: first ? 'acornDecoy' : undefined,
      });
      flower(oakX + 300, G - 34, 'hibiscus');
      // the rest of the stretch: a rock or two to hop once his hands are free, then the next bush
      const rest = len - 660 - 140;
      const m = rest > 700 ? 2 : 1;
      for (let j = 0; j < m; j++) {
        run(rest / (m + 1) - 70);
        logHop(R.i(34, 42));
      }
      run(Math.max(120, rest / (m + 1) - 60));
      bush(x - BUSH_W.tall / 2, 'tall');
    };
    // the first stretch: crossable in one calm (try the throw here, a bush waits at its end); the second: only with the acorn
    room(Math.round(R.r(1300, 1420)), true);
    room(Math.round(R.r(2050, 2200)), false);
    run(R.r(260, 320));
    ZONES.push({ x0, x1: x, calm });
    MEADOWS.add(ZONES[ZONES.length - 1]);
    expert += (x - x0) / RUN + 2 * 4 + watched(x - x0, (calm[0] + calm[1]) / 2) - (x - x0) / RUN;
    pieces.push({ k: 'rest', x0, x1: x });
  }

  if (plan === '1-7') {
    // 1-7 A Very Good Bush: hide from the eagle. Taught with long calms and big bushes close together, tested with the bushes farther
    // apart and shorter calms, then twisted onto a rope line with bushes hanging from it. One bush hides a way up to a secret path.
    // (Rebuilt 2026-10-28: a rock or two to hop between the bushes, and the finish opens with the acorn meadow, the kit's noise lure:
    // the squirrels' acorns thrown to draw the eagle off; then more of the same until a quick player needs two minutes.)
    // (QA the same day, an expert took 16 hits: the calms between passes are longer, 9-11 s while it teaches and 6-8 s after, about
    // half again; the meadow keeps its own, which its puzzle is built on, stage17.test.ts)
    beat('Start', () => {
      rest(R.r(380, 430));
      flag();
    });
    beat('Learn: hide in the bushes', () => {
      hint(x + 20, 'An eagle is watching. Slide down inside a bush to hide', 'An eagle is watching. Hold down inside a bush to hide', 'An eagle is watching. Hold down inside a bush to hide');
      bushRow(5, [380, 470], ['tall', 'tall', 'wide'], [9, 11], true);
      flag();
    });
    beat('Test: farther apart', () => {
      hint(x + 40, 'Run when it has gone by', 'Run when it has gone by', 'Run when it has gone by');
      // (every version keeps the secret bush: w1Sections.ts)
      section('develop');
      flag();
    });
    beat('Twist: the rope line', () => {
      hint(x + 60, 'Bushes on the rope too. Hang inside one while it goes by', 'Bushes on the rope too. Hang inside one while it goes by', 'Bushes on the rope too. Hang inside one while it goes by');
      ropeBushes([7, 8]);
      flag();
    });
    beat('Finish: the acorn meadow', () => {
      acornMeadow([4.6, 5.4]);
      flag();
      // (a quick player who waits out the passes in the bushes: 1-7 runs long, three minutes, and the meadow is part of it)
      section('finish');
      homeRun(['log']);
    });
    // (QA 2026-10-29: the first pass over each of 1-7's watched stretches only warns, as the stage's first pass does: World 1's eagle
    // shows each stretch's rhythm once before it strikes. The acorn meadow keeps its own passes, which its puzzle is built on)
    for (const z of ZONES) if (!MEADOWS.has(z)) z.freeFirst = true;
  }

  /** a coiled boa guarding a spot (it never moves; it rears, lunges about 130 px, and takes three hits) */
  const boa = (bx: number, surface: number, facing: 1 | -1 = -1) => {
    E.push({
      id: eid++, type: 'boa', x: Math.round(bx), y: surface - 16, vx: 0, vy: 0, width: 58, height: 26, hp: 3, maxHp: 3, facing,
      patrolMinX: bx - 12, patrolMaxX: bx + 12, attackCooldown: 1.2, telegraphTimer: 0, isAttacking: false,
      animTimer: 0, hitFlashTimer: 0, defeated: false, koTimer: 0, behaviorTimer: 0,
    } as Enemy);
  };

  /** a wide branch over soft moss with one boa coiled in the middle of it: the way on is across the branch, past the guard */
  function guardBranch(low = false) {
    const x0 = x;
    run(low ? R.r(120, 170) : R.r(180, 240));
    // a stump up to the branch, the branch over a soft pit, and the far side
    // (`low`, World 1's rebuilt 1-9: the branch one plain jump over the stump and under 100 over the ground, where the kid bot
    // missed a 120 px jump up from the floor, 2026-10-28)
    block(x, x + 100, 60);
    run(160);
    const y = low ? G - R.i(92, 100) : G - Math.round(R.r(115, 130));
    const w = Math.round(R.r(520, 600));
    const edge = x;
    close();
    branch(edge - 40, edge + w, y);
    boa(edge + w * 0.55, y);
    row(edge + 40, edge + w * 0.3, y - 34, 2, 'orchid');
    const far = Math.round(edge + w + R.r(60, 100));
    softPit(edge, far);
    open(far);
    run(R.r(380, 460));
    // and no rest after it: a snake on the far bank (fighting on the move)
    snake(far + R.r(220, 300), G, 120);
    expert += (x - x0) / RUN + 5;
    pieces.push({ k: 'snakes', x0, x1: x });
  }

  /** a rope over a soft pit to a far bank where a boa waits, with room to land before it */
  function ropeGuard() {
    const x0 = x;
    ropeGap(false, false, true);
    // ropeGap leaves him past the far edge: the guard stands a little on
    boa(x + R.r(120, 180), G);
    run(R.r(380, 460));
    expert += 4;
    pieces.push({ k: 'snakes', x0, x1: x });
  }

  /** a wall of earth: the way over is up a trunk and across a branch, where a boa is coiled */
  function trunkGuard() {
    const x0 = x;
    run(R.r(260, 320));
    const tX = x - 120;
    const perchY = G - 260;
    trunk(tX, G, perchY);
    for (let i = 0; i < 3; i++) flower(tX, G - 70 - i * 60, 'hibiscus');
    const bEnd = tX + Math.round(R.r(380, 430));
    branch(tX - 40, bEnd, perchY);
    boa(tX + (bEnd - tX) * 0.6, perchY);
    // the high ground beyond: a wall from the floor (he cannot walk under it or jump onto it from below)
    const wx = bEnd + Math.round(R.r(90, 120));
    const ww = Math.round(R.r(480, 560));
    block(wx, wx + ww, 230);
    row(wx + 60, wx + ww - 60, G - 264, 3, 'orchid');
    x = wx + ww + R.r(110, 150);
    // (down off the high ground onto a dip to jump: no empty walk after it)
    dip();
    run(R.r(200, 260));
    expert += (x - x0) / RUN + (G - perchY) / CLIMB + 5;
    pieces.push({ k: 'kapok', x0, x1: x });
  }

  /** a high branch path with a snake asleep on it and a golden seed beyond: hop over it while it sleeps, or knock it off */
  function sleepingGuard() {
    const x0 = x;
    run(R.r(200, 260));
    P.push({ id: pid++, x: x, y: G - 30, width: 70, height: 30, type: 'bouncy' });
    const y = Math.round(G - RISE - 60);
    const w = Math.round(R.r(420, 480));
    branch(x - 40, x - 40 + w, y);
    snake(x - 40 + w * 0.45, y, 60, true);
    goldenSeed(x - 40 + w - 50, y - 34);
    row(x + 10, x + 120, y - 34, 2, 'hibiscus');
    run(w + R.r(120, 200));
    expert += (x - x0) / RUN + 1.5;
    pieces.push({ k: 'rest', x0, x1: x });
  }

  /** the ring: branches around a clearing, walled at the far end; snakes drop in two waves and the wall opens when they are all down */
  function snakeRing() {
    const x0 = x;
    run(R.r(160, 220));
    const r0 = x;
    const W = Math.round(R.r(1050, 1150));
    const ly = G - 140, ty = G - 265;
    const L = branch(r0 + 140, r0 + 400, ly);
    const Rb = branch(r0 + W - 400, r0 + W - 140, ly);
    const Tp = branch(r0 + W / 2 - 160, r0 + W / 2 + 160, ty);
    row(Tp.x + 50, Tp.x + Tp.width - 50, ty - 34, 3, 'hibiscus');
    // (two mossy rocks on the clearing's floor, a petal on each, clear of where the snakes drop and of the branches: something to hop on
    // the way in and on the way to the wall, where the stage inspector found 4.5-5.5 s of plain walking in the ring on every roll,
    // 2026-10-28; and one more past the wall)
    // (each stands down into the ground, the bank broken around it, as World 1's other rocks: logHop)
    for (const rx of [Math.round(r0 + 20), Math.round(r0 + W - 125)]) {
      x = rx;
      close();
      block(rx, rx + 110, 40).height = 40 + BANK_H;
      flower(rx + 55, G - 74, 'orchid');
      open(rx + 110);
    }
    const wall = block(r0 + W, r0 + W + 120, 330);
    const mid = (p: Platform) => p.x + p.width / 2;
    RING = {
      x0: r0, x1: r0 + W, wallId: wall.id,
      waves: [
        [{ x: r0 + W * 0.45, surface: G, kind: 'snake' }, { x: mid(L), surface: ly, kind: 'snake' }, { x: mid(Rb), surface: ly, kind: 'snake' }],
        [{ x: r0 + W * 0.3, surface: G, kind: 'snake' }, { x: mid(Tp), surface: ty, kind: 'snake' }, { x: r0 + W * 0.7, surface: G, kind: 'snake' }, { x: r0 + W * 0.55, surface: G, kind: 'boa' }],
      ],
    };
    x = r0 + W + 120;
    if (w1Rocks) {
      run(R.r(110, 140));
      logHop();
      run(R.r(120, 160));
    } else run(R.r(260, 340));
    expert += (x - x0) / RUN + 16;
    pieces.push({ k: 'snakes', x0, x1: x });
  }

  if (plan === '1-9') {
    // 1-9 The Boa's Branches: fighting on the move. The boa's guards coil on the branches you have to cross: read the warning (it rears),
    // step out of the lunge, punch it while it recovers. Then guards past ropes and up trunks, and a ring where snakes drop from the
    // canopy until every one is down. A snake asleep on a high branch guards a seed.
    // (Rebuilt 2026-10-28: the guards' branches one plain jump up from their stumps, rocks and dips between the fights, and a quicker
    // run on after the high ground and the ring.)
    beat('Learn: one guard at a time', () => {
      rest(R.r(380, 420));
      // (two rocks to hop before the first guard: the first-timer bot, jumping onto its stump, was bitten 3.5 s in, 2026-10-28)
      busy(2, ['log'], R.r(120, 160));
      hint(x + 40, 'A guard! Wait for it to rear and strike, then tap to punch it', 'A guard! Wait for it to rear and strike, then press Punch', 'A guard! Wait for it to rear and strike, then press J to punch');
      guardBranch(true);
      // (then the second guard and a snake, in this roll's flavour: w1Sections.ts)
      section('start');
      flag();
    });
    beat('Test: guards along the way', () => {
      // (every version keeps the sleeping guard and its seed: w1Sections.ts)
      section('develop');
      flag();
    });
    beat('Twist: the ring', () => {
      hint(x + 60, 'Snakes from above! Clear them all to open the way', 'Snakes from above! Clear them all to open the way', 'Snakes from above! Clear them all to open the way');
      section('twist');
      flag();
    });
    beat('Finish', () => {
      section('finish');
      homeRun();
    });
  }

  // ----- the control test's own pieces: World 2's water and its animals, built on World 1's ground -----
  const SURF = G + surfaceBelowBank;
  const LOG_Y = G + LOG_DROP;
  /** a river with drifting logs; falling in only puts him back on the bank (a test is cheap to fail) */
  function riverCross(dir: 1 | -1, speed: number, logs: number, logW: number) {
    const x0 = x;
    run(R.r(140, 200));
    close();
    const rx0 = x;
    const gap = Math.round(gapFor(dir, speed));
    const width = (logs + 1) * (logW + gap) - logW;
    const rx1 = rx0 + width;
    const { count, period } = logLayout({ dir, speed, logW, gap, width });
    for (let i = 0; i < count; i++) {
      const pl: Platform = {
        id: pid++, x: rx0, y: LOG_Y, width: logW, height: LOG_HEIGHT, type: 'drift', style: 'log',
        drift: { x0: rx0, x1: rx1, dir, speed, width: logW, offset: (i * period) / count, baseY: LOG_Y },
      };
      pl.x = driftX(pl.drift!, 0);
      P.push(pl);
    }
    RIVERS.push({ x0: rx0, x1: rx1, surfaceY: SURF, dir, speed, safe: { backX: rx0 - 70, backY: G } });
    arc(rx0 + 50, rx1 - 50, G - 80, logs + 1, 'hibiscus');
    open(rx1);
    run(R.r(160, 220));
    expert += (x - x0) / RUN + width / (RUN * (dir === 1 ? 0.75 : 0.45)) + 1;
    pieces.push({ k: 'river', x0, x1: x });
  }
  /** still water crossed on lily pads (falling in puts him back on the bank) */
  function lilyPads(n: number) {
    const x0 = x;
    run(R.r(140, 190));
    close();
    const px0 = x;
    let px = px0;
    const one = reachJump(0, false);
    for (let i = 0; i < n; i++) {
      px += Math.round(one * R.r(0.42, 0.55));
      const w = Math.round(R.r(84, 104));
      P.push({ id: pid++, x: px, y: SURF - 8, width: w, height: 12, type: 'solid', lily: true });
      flower(px + w / 2, SURF - 60, 'hibiscus');
      px += w;
    }
    px += Math.round(one * R.r(0.42, 0.55));
    RIVERS.push({ x0: px0, x1: px, surfaceY: SURF, dir: 1, speed: 0, safe: { backX: px0 - 70, backY: G } });
    open(px);
    run(R.r(160, 220));
    expert += (x - x0) / RUN + n * 0.35;
    pieces.push({ k: 'pond', x0, x1: x });
  }
  /** snapping turtles along the ground: punch one from behind, or kick its shell into the others */
  function turtles() {
    const x0 = x;
    run(R.r(260, 320));
    const n = R.i(3, 4);
    for (let k = 0; k < n; k++) {
      run(R.r(150, 220));
      E.push({
        id: eid++, type: 'turtle', x, y: G - 14, vx: 22, vy: 0, width: 48, height: 24, hp: 1, maxHp: 1, facing: R.chance(0.5) ? 1 : -1,
        patrolMinX: x - 60, patrolMaxX: x + 60, attackCooldown: 1.5, telegraphTimer: 0, isAttacking: false,
        animTimer: 0, hitFlashTimer: 0, defeated: false, koTimer: 0, behaviorTimer: 0,
      } as Enemy);
    }
    // (well clear of the flag that follows)
    run(R.r(440, 500));
    expert += (x - x0) / RUN + 2 * n;
    pieces.push({ k: 'turtles', x0, x1: x });
  }
  /** cages with a little one in each: punch a cage twice to break it */
  function cages() {
    const x0 = x;
    const kinds = R.shuffle(['capy', 'duck', 'otter'] as Array<'capy' | 'duck' | 'otter'>);
    for (const critter of kinds) {
      run(R.r(280, 360));
      C.push({ id: cid++, type: 'cage', x, y: G - 26, collected: false, bobPhase: 0, cageHp: 2, critter });
    }
    run(R.r(300, 360));
    expert += (x - x0) / RUN + 3;
    pieces.push({ k: 'cages', x0, x1: x });
  }

  /**
   * the control test: move everything built from `x0` on (ground, branches, vines, trunks, ropes, bushes, water, animals, pickups,
   * hints) `dx` further along, and the cursor with it, leaving a longer stretch of ground before it
   */
  function shiftFrom(x0: number, dx: number) {
    dx = Math.round(dx);
    for (const p of P) {
      if (p.x >= x0) {
        p.x += dx;
        if (p.drift) p.drift = { ...p.drift, x0: p.drift.x0 + dx, x1: p.drift.x1 + dx };
        if (p.push) p.push = { min: p.push.min + dx, max: p.push.max + dx };
      } else if (p.drift && p.drift.x0 >= x0) p.drift = { ...p.drift, x0: p.drift.x0 + dx, x1: p.drift.x1 + dx };
    }
    for (const v of V) if (v.x >= x0) v.x += dx;
    for (const t of T) if (t.x >= x0) t.x += dx;
    for (const r of ROPES) if (r.x0 >= x0 - 60) { r.x0 += dx; r.x1 += dx; }
    for (const b of BUSHES) if (b.x >= x0) b.x += dx;
    for (const z of ZONES) if (z.x0 >= x0) { z.x0 += dx; z.x1 += dx; }
    for (const r of RIVERS) if (r.x0 >= x0) { r.x0 += dx; r.x1 += dx; if (r.safe) r.safe = { ...r.safe, backX: r.safe.backX + dx }; }
    for (const e of E) if (e.x >= x0) { e.x += dx; e.patrolMinX += dx; e.patrolMaxX += dx; }
    for (const c of C) if (c.x >= x0) c.x += dx;
    for (const h of hints) if (h.x >= x0) h.x += dx;
    for (const c of covers) if (c.x >= x0) c.x += dx;
    if (RING && RING.x0 >= x0) RING = { ...RING, x0: RING.x0 + dx, x1: RING.x1 + dx, waves: RING.waves.map((w) => w.map((d) => ({ ...d, x: d.x + dx }))) };
    if (bankFrom >= x0) bankFrom += dx;
    x += dx;
    expert += dx / RUN;
  }

  if (plan === 'ctest') {
    // The control test (Matt, 2026-10-24): the basics every run, then six short stretches drawn from the whole game, two of each kind
    // (moving about, fighting, and the rest: the eagle and the water). Every run is a different mix (the caller gives each run a new
    // seed: playRecorder.ts ctestSeed), so across runs every stretch gets played, and stretches can be compared tester by tester.
    // The seed and the mix are logged when the run starts, so any run can be built again (?mix=<seed>).
    beat('Run and stop', () => {
      hint(x + 60, 'Run to the flowers and stop on them');
      run(450);
      row(x, x + 160, G - 34, 3, 'orchid');
      run(550);
      hint(x - 250, 'Now turn around and run back a little');
      run(250);
      flag();
    });
    beat('Short hops', () => {
      hint(x + 60, 'Hop up the stumps');
      stumps();
      flag();
    });
    beat('Long jumps', () => {
      hint(x + 60, CTEST_GAPS);
      gaps();
      flag();
    });
    type Stretch = { name: string; tip: [string, string, string]; build: () => void };
    const same = (t: string): [string, string, string] => [t, t, t];
    const moving: Stretch[] = [
      { name: 'Climb', tip: same('Climb to the top of the tree, then back down'), build: () => climbTree() },
      { name: 'Swing', tip: same('Jump into the vine to grab it, jump again to let go'), build: () => { chain(1, true, 'hollow'); rest(R.r(250, 350)); chain(2, true, 'hollow'); } },
      { name: 'Rope', tip: ['Jump up into the rope to grab it, then slide to move along', 'Jump up into the rope, then hold left or right', 'Jump up into the rope, then hold left or right'], build: () => { ropeGap(false, true); ropeGap(false, true); } },
      { name: 'Crumbling branches', tip: same('Creaky branches! Grab the petals and keep moving'), build: () => creakRun() },
      { name: 'Bounce', tip: same('Land on the mushroom to bounce up high'), build: () => { highRoad(); mushroomCache(); } },
      { name: 'Stepping stones', tip: same('Hop from stone to stone'), build: () => pillars(R.shuffle([60, 110, 70, 130]), [0.55, 0.68]) },
      { name: 'Double jumps', tip: same('Jump, then jump again in the air to cross'), build: () => doubleArcs() },
      { name: 'Canopy road', tip: same('Climb up and cross the high branches'), build: () => canopy(false) },
      { name: 'High vines', tip: same('Climb the tree, then swing across the vines'), build: () => highRun() },
      { name: 'Push the log', tip: same('Push the log against the wall, then climb up'), build: () => logPuzzle() },
    ];
    const fighting: Stretch[] = [
      { name: 'Snakes', tip: same('Punch and kick the snakes'), build: () => { snakes(); } },
      { name: 'Snakes on branches', tip: same('Punch the snakes or hop over them'), build: () => snakeBranches(3, G - 130) },
      { name: 'Boa guard', tip: same('A guard! Wait for it to strike, then punch it'), build: () => guardBranch() },
      { name: 'Sleeping snake', tip: same('Sneak past the sleeping snake, or knock it off'), build: () => sleepingGuard() },
      { name: 'Snake ring', tip: same('Snakes from above! Clear them all to open the way'), build: () => snakeRing() },
      { name: 'Snapping turtles', tip: same('Hit a turtle from behind, or kick its shell'), build: () => turtles() },
      { name: 'Cages', tip: same('Punch each cage twice to free the little one'), build: () => cages() },
    ];
    const other: Stretch[] = [
      { name: 'Hide from the eagle', tip: ['An eagle is watching. Slide down inside a bush to hide', 'An eagle is watching. Hold down inside a bush to hide', 'An eagle is watching. Hold down inside a bush to hide'], build: () => bushRow(4, [420, 520], ['tall', 'wide', 'fern'], [6.5, 8]) },
      { name: 'River logs', tip: same('Hop on the logs and ride them across'), build: () => { riverCross(1, 55, 2, 190); rest(R.r(260, 340)); riverCross(-1, 55, 2, 185); } },
      { name: 'Lily pads', tip: same('Hop across the lily pads'), build: () => lilyPads(5) },
    ];
    const drawn = R.shuffle([...R.shuffle(moving).slice(0, 2), ...R.shuffle(fighting).slice(0, 2), ...R.shuffle(other).slice(0, 2)]);
    // an animal's patch keeps this far from every flag (levelCheck.ts SAFE_APPROACH is 200), so a respawn never lands beside one
    const CLEAR = 240;
    for (const st of drawn) {
      beat(st.name, () => {
        const flagAt = x - 80;
        const foes = E.length;
        rest(R.r(160, 220));
        hint(x - 60, ...st.tip);
        const from = x;
        st.build();
        // too near the flag behind? slide the whole stretch on (everything it built since `from`)
        const near = E.slice(foes).reduce((m, e) => Math.min(m, e.patrolMinX - flagAt), Infinity);
        if (near < CLEAR) shiftFrom(from, CLEAR - near);
        // and room before the next flag
        const far = E.slice(foes).reduce((m, e) => Math.max(m, e.patrolMaxX), -Infinity);
        if (x - 80 - far < CLEAR) run(CLEAR - (x - 80 - far));
        flag();
      });
    }
    beat('Finish', () => rest(700));
    MIX = `seed ${seed}: ${drawn.map((d) => d.name).join(', ')}`;
    // no secrets in a test
    for (let i = C.length - 1; i >= 0; i--) if (C[i].type === 'seed' || C[i].type === 'find') C.splice(i, 1);
    // a piece's own flag can sit by its own animal (the log's high ground): that animal stays home
    const nearFlag = (e: Enemy) => checkpoints.some((f) => Math.abs(e.y - f.y) < 400 && (f.x >= e.patrolMinX - CLEAR && f.x <= e.patrolMaxX + CLEAR));
    for (let i = E.length - 1; i >= 0; i--) if (nearFlag(E[i])) E.splice(i, 1);
    // where two stretches meet, a flower can land on another or inside a branch: the later one goes
    const solid = (c: Collectible) => P.some((p) => p.type !== 'drift' && !p.push && c.x >= p.x && c.x <= p.x + p.width && c.y > p.y + 2 && c.y < p.y + p.height - 2);
    for (let i = C.length - 1; i >= 0; i--) {
      const c = C[i];
      if (c.type !== 'flower') continue;
      if (solid(c) || C.some((o, j) => j < i && o.type === 'flower' && Math.hypot(o.x - c.x, o.y - c.y) < 40)) C.splice(i, 1);
    }
    covers.length = 0;
  }

  if (plan === 'proto') {
  // (Rebuilt 2026-10-28: shorter rests with something to do in them, mossy rocks on the moss under the teaching swings, and the seesaw
  // after the fallen log: shown, then learned, and twisted later; see seesawRoom and seesawTwist)
  beat('Start', () => rest(R.r(380, 430)));
  beat('Learn: swing over soft moss', () => {
    hint(x + 120, 'Flick up into the vine to grab it', 'Jump into the vine to grab it', 'Jump into the vine to grab it');
    chain(1, true, 'hollow', true);
    busy(1);
    hint(x + 40, 'Flick up again as you swing forward', 'Press Jump as you swing forward', 'Press Space as you swing forward');
    chain(2, true, 'hollow', true);
    busy(1);
    chain(R.i(2, 3), true, 'hollow', true);
    stumps();
    flag();
  });
  beat('Develop: the gorge and the tall kapok', () => {
    // (the gorge and the kapok in this roll's order and rhythm: w1Sections.ts)
    section('develop');
    flag();
  });
  beat('Puzzle: the fallen log', () => {
    rest(R.r(160, 220));
    logPuzzle(true);
    // the seesaw: shown (a log already holds one end down), then the real thing (push the log onto it yourself)
    seesawRoom(true);
    seesawRoom(false);
    flag();
  });
  beat('Twist: the canopy road', () => {
    section('twist');
    flag();
  });
  beat('Develop again: higher and wider', () => {
    mixed(() => stumps(), () => snakeWalk(1));
    kapok();
    flag();
    // the seesaw, turned about: the log on the far side, pushed back onto the far end
    seesawTwist();
    flag();
    chain(R.i(3, 4), false, 'gorge');
    flag();
    // then more of the world's pieces, in this roll's rhythm, until even a quick, sure player needs the stage's minimum time
    // (the finish adds about 10 s); a flag after every second piece
    section('finish');
  });
  beat('Finish: the long swing home', () => {
    busy(1);
    chain(4, false, 'gorge');
    homeRun();
    // the walk to the shrine makes up any last seconds the dice left short
    if (expert < EXPERT_SECONDS) rest((EXPERT_SECONDS - expert) * RUN + 60);
  });
  }

  // ======================================================================================================================
  // World 3, the Mossy Grotto (2026-10-24, three stages at a time): World 1's pieces in the grotto's kit, with the grotto's own things.
  // Mushrooms puff sleepy spores on a beat (zones.ts). Stretches of real dark where the glowworms hang asleep on their threads until
  // Pokey stands still and listens; then they wake, glow and light the way, and stay lit (the story: he stopped to listen, and the
  // glowworms noticed). Prowlers (ocelots, and a jaguar or two) in 3-3. Dressed with Matt's grotto sheets (w3Art.ts).
  const GZ: Zone[] = [];
  const W3D: W3Decor[] = [];
  let glowN = 1;
  /** a spore cloud over [x0, x1], puffed by mushrooms at `emit`, on the World 3 beat (6.4 s: 1 s warning, 2.2 s of cloud) */
  const sporeZone = (x0: number, x1: number, emit: number[]) =>
    GZ.push({ kind: 'spore', x0, x1, top: G - 220, bottom: G + 40, baseY: G, dir: 1, period: 6.4, warn: 1.0, active: 2.2, force: 0, offset: R.r(0, 6.4), emit });
  /**
   * a stretch of grotto floor under a spore cloud: wait for it to clear, or walk through drowsy (nothing to lose). (Rebuilt 2026-10-28,
   * the stage inspector: a grotto stone or two to hop on the way through, a petal on each, so the wait is not an empty walk.)
   */
  function sporeRest(len: number) {
    const x0 = x;
    const e0 = expert;
    // (one stone under each cloud: the level check reads two stones on one floor as a gap between them)
    const m = 1;
    for (let j = 0; j < m; j++) {
      run(len / (m + 1) - 65);
      logHop(R.i(34, 44));
    }
    run(Math.max(80, x0 + len - x));
    expert = e0 + (x - x0) / RUN + 0.15 * m;
    pieces.push({ k: 'rest', x0, x1: x });
    sporeZone(x0 + 80, x - 80, [x0 + 150, x0 + len / 2, x - 150]);
    expert += 2.5;
  }
  /** a gap with a cloud on both sides of it: jump it while the air is clear */
  function sporeGap(deep = false) {
    const x0 = x;
    // (over the stream the way up to it and away from it is shorter: the 300 px walks either side read as quiet stretches)
    run(deep ? R.r(200, 240) : R.r(240, 280));
    const edge = x;
    close();
    // (`deep`, 2026-10-28: over the stream, no moss below: a miss costs a life, so the gap stays well inside a jump)
    const far = Math.round(edge + reachJump(0, false) * (deep ? R.r(0.44, 0.54) : R.r(0.55, 0.68)));
    if (!deep) softPit(edge, far);
    else deepTip(edge);
    arc(edge - 30, far + 30, G - 110, deep ? 3 : 4);
    open(far);
    // (a flag may follow: it stands 80 short of the end, clear of the cloud's far edge)
    run(R.r(255, 280));
    sporeZone(edge - 150, far + 150, [edge - 110, far + 100]);
    expert += (x - x0) / RUN + 3;
    pieces.push({ k: 'stumps', x0, x1: x });
  }
  /**
   * a stretch of real dark: the glowworms hang asleep on their threads, one over the start and one over every gap. Standing still for a
   * moment wakes the ones ahead (zones.ts GLOW_STILL / GLOW_REACH), and they stay lit. Gaps are soft (a mossy floor below). `ferns`:
   * a fern to stop in before each gap (3-2's eyes cannot see him in one). Returns where the stops are, for the stealth stretches.
   */
  function glowDark(len: number, gaps: number, opts: { ferns?: boolean; rocks?: boolean; lead?: boolean } = {}): number[] {
    const x0 = x;
    const e0 = expert;
    let hops = 0;
    /** `rocks` (2026-10-28, the stage inspector): a grotto stone to hop in each long stretch of the dark, clear of where he stops */
    const go = (len: number, last = false) => {
      if (!opts.rocks || len < 300) return run(len);
      const s0 = x;
      // (the last stretch has no stop at its end to keep clear: more stones on the way out of the dark)
      // (round 2, 2026-10-28: a stone about every 300 px, still 30% of the stretch clear before the stop at its end; quiet walks in the
      // dark were most of 3-1's and 3-2's dead time)
      const k = Math.max(1, Math.round((len * (last ? 0.8 : 0.6)) / 300));
      const ats = Array.from({ length: k }, (_, i) => (last ? 0.12 + (0.72 * (i + 0.5)) / k : 0.12 + (0.55 * (i + 0.5)) / k));
      for (const at of ats) {
        run(s0 + len * at - x);
        logHop(R.i(34, 44));
        hops++;
      }
      run(s0 + len - x);
    };
    run(260);
    const zx0 = x - 200;
    const lights: NonNullable<Zone['lights']> = [];
    const stops: number[] = [x - 90];
    const glow = (gx: number, gy = G - Math.round(R.r(150, 175))) => lights.push({ x: Math.round(gx), y: gy, r: 260, sleep: true, id: glowN++ });
    glow(x - 40);
    const lead = (opts.lead ?? (opts.ferns && opts.rocks)) && gaps > 0;
    const seg = Math.max(260, lead ? (len - 480) / gaps : (len - 260) / (gaps + 1));
    for (let i = 0; i < gaps; i++) {
      // (`ferns`: the way into a dark the eyes watch is a burst of its own, the eyes and the dark at once; the first gap comes after a
      // breath of plain floor, and no stone before it)
      if (i === 0 && lead) run(220);
      else go(seg);
      const edge = x;
      close();
      // (the gaps in the dark always have soft moss below: before the glowworms wake he cannot see them, and a fall into the stream there
      // would be a blind jump costing a life; the first-timer drowned in them six times running, 2026-10-28)
      const far = Math.round(edge + reachJump(0, false) * R.r(0.5, 0.66));
      softPit(edge, far);
      flower(edge + (far - edge) / 2, G - 110, 'orchid');
      glow((edge + far) / 2);
      open(far);
      run(R.r(80, 120));
      stops.push(edge - 120);
    }
    go(seg, true);
    // a glowworm every 450 px or so along the flat too, so once they wake the whole way is lit
    for (let gx = zx0 + 450; gx < x - 150; gx += 450) if (!lights.some((l) => Math.abs(l.x - gx) < 220)) glow(gx);
    GZ.push({ kind: 'dark', x0: zx0, x1: x - 40, top: G - 700, bottom: G + 260, baseY: G, dir: 1, period: 1, warn: 0, active: 1, force: 0, offset: 0, lights });
    // out of the dark before anything else (a flag never stands in it)
    run(220);
    if (opts.ferns) for (const sx of stops) bush(sx - BUSH_W.grotto / 2, 'grotto');
    // a stop to listen at the start, and wherever the lit reach runs out
    expert = e0 + (x - x0) / RUN + 1.2 * Math.ceil((x - x0) / 1000) + 0.8 * gaps + 0.15 * hops;
    pieces.push({ k: 'rest', x0, x1: x });
    return stops;
  }
  /** an ocelot (two hits, quick) or a jaguar (three hits, pounces) prowling its patch of ground */
  const prowler = (kind: 'ocelot' | 'jaguar', px: number, surface: number, range = 160) => {
    const big = kind === 'jaguar';
    E.push({
      id: eid++, type: kind, x: Math.round(px), y: surface - (big ? 24 : 18), vx: (R.chance(0.5) ? -1 : 1) * (big ? 42 : 55), vy: 0,
      width: big ? 64 : 48, height: big ? 38 : 28, hp: big ? 3 : 2, maxHp: big ? 3 : 2, facing: R.chance(0.5) ? 1 : -1,
      patrolMinX: Math.round(px - range / 2), patrolMaxX: Math.round(px + range / 2), attackCooldown: big ? 1.2 : 2.5, telegraphTimer: 0, isAttacking: false,
      animTimer: 0, hitFlashTimer: 0, defeated: false, koTimer: 0, behaviorTimer: 0,
    } as Enemy);
  };
  /** a trail of giant pawprints pressed in the mud */
  const prints = (x0: number, x1: number) => {
    for (let px = x0; px < x1; px += R.r(170, 230)) W3D.push({ n: 'pawprint', x: Math.round(px), b: G + 10, w: Math.round(R.r(92, 110)), flip: R.chance(0.3) });
  };
  /** a stretch of floor with prowlers on it, well inside its ends */
  function prowlFloor(kinds: Array<'ocelot' | 'jaguar'>) {
    const x0 = x;
    const len = R.r(900, 1100) + 260 * (kinds.length - 1);
    run(len);
    // well inside the stretch: a flag may stand at either end of it, and no patch of ground comes within SAFE_APPROACH of one
    const a = x0 + 330, b = x - 410;
    kinds.forEach((k, i) => prowler(k, kinds.length === 1 ? (a + b) / 2 : a + ((b - a) * i) / (kinds.length - 1), G, 180));
    // (2026-10-28, the stage inspector: a grotto stone to hop on the way in and on the way out, clear of the prowlers' ground)
    for (const rx of [x0 + 40, x - 230]) {
      block(rx, rx + 120, R.i(34, 42));
      flower(rx + 60, G - 76, 'orchid');
    }
    row(x0 + 220, x - 270, G - 34, Math.round(len / 240));
    prints(x0 + 60, x0 + Math.min(500, len - 60));
    expert += len / RUN + 2.2 * kinds.length + 0.3;
    pieces.push({ k: 'snakes', x0, x1: x });
  }
  /**
   * 3-9: a trunk up to a high branch an ocelot prowls (climb up, and fight it up there), and the drop down off the branch's far end to the
   * floor beyond, a hop to land on
   */
  function prowlTree() {
    const x0 = x;
    run(R.r(200, 250));
    const tX = x - 60;
    const perchY = Math.round(G - R.r(200, 230));
    trunk(tX, G, perchY);
    for (let i = 0; i < 2; i++) flower(tX, G - 80 - i * 60, 'hibiscus');
    const bw = Math.round(R.r(380, 440));
    const b = branch(tX - 40, tX - 40 + bw, perchY);
    prowler('ocelot', b.x + bw * 0.62, perchY, bw - 200);
    row(b.x + 70, b.x + 150, perchY - 34, 2, 'hibiscus');
    x = b.x + bw + R.r(140, 180);
    logHop(R.i(34, 42));
    run(R.r(260, 300));
    expert += (x - x0) / RUN + (G - perchY) / CLIMB + 2.2;
    pieces.push({ k: 'kapok', x0, x1: x });
  }
  /** limestone shelves over a soft pit with ocelots on them (punch them, or hop them) */
  function prowlShelves(n: number, y: number, deep = false) {
    const x0 = x;
    run(R.r(160, 220));
    const edge = x;
    close();
    // (`deep`: over the stream, lower shelves and shorter gaps: a first-timer's flick, not a full jump, 2026-10-28)
    const sh: [number, number] = deep ? [0.32, 0.4] : [0.45, 0.6];
    let bx = edge + Math.round(reachJump(G - y, false) * R.r(sh[0], sh[1]));
    let m = 0;
    // (round 2, 2026-10-28: the first shelf a plain jump up from the floor, 95 px at most, and each next one at most 45 higher until the
    // shelves reach their height: a 120-170 px climb from the floor straight onto the first shelf wanted the second jump, and the kid
    // bot made it 81-84% of the time on Easy, under the 85% floor)
    let prevTop = G;
    for (let k = 0; k < n; k++) {
      const w = Math.round(R.r(240, 300));
      const top = Math.round(Math.max(y + R.r(-10, 10), prevTop - (k === 0 ? 95 : 45)));
      prevTop = top;
      branch(bx, bx + w, top);
      if (k !== 0 || n < 3) { prowler('ocelot', bx + w / 2, top, w - 100); m++; }
      else row(bx + 50, bx + w - 50, top - 34, 2, 'orchid');
      bx += w + Math.round(reachJump(0, false) * (deep ? R.r(0.32, 0.4) : R.r(0.4, 0.55)));
    }
    const far = Math.round(bx + 20);
    // (`deep`, 2026-10-28: the shelves stand over the stream, a punch and a jump at once)
    if (!deep) softPit(edge, far);
    else deepTip(edge);
    open(far);
    run(R.r(320, 380));
    expert += (x - x0) / RUN + 2.2 * m;
    pieces.push({ k: 'snakes', x0, x1: x });
  }

  // ----- World 3's harder ground (the variety pass, 2026-10-28: STAGE-RULES §1b, World 3 sits between World 2 and World 4) -----
  /** the roll's picks for a World 3 stage: which version of each section, the mirror, the dressing (w3Sections.ts) */
  const W3P = config.worldIndex === 3 ? w3Pick(plan, seed) : undefined;
  /** the pieces of a section in the roll's order: as given, or the other way about on a mirrored roll (C8) */
  const w3Order = (...fs: Array<() => void>) => (W3P?.mirror ? fs.reverse() : fs).forEach((f) => f());
  /**
   * World 3's stepping stones in a soft pit, with a one-jump way out of every gap (STAGE-RULES §2 "Plain walk"; the gap list: the
   * first-timer was stuck 17-20 times a run in 3-1's stone pits, a 180-270 px face ahead and 130 px back). Every gap between two stones
   * (or a stone and a bank) has its own mossy floor one easy hop under its higher side (plainPit, as 1-1's), so a miss is a hop back up.
   */
  function w3Stones(heights: number[], share: [number, number]) {
    const x0 = x;
    run(R.r(100, 140));
    const edge = x;
    close();
    let px = edge, prevTop = G;
    const stones: Platform[] = [];
    for (const h of heights) {
      const top = G - h;
      px += Math.round(reachJump(prevTop - top, false) * R.r(share[0], share[1]));
      const w = Math.round(R.r(120, 160));
      const p: Platform = { id: pid++, x: px, y: top, width: w, height: HOLLOW_Y - top + 10, type: 'solid', style: 'moss_stone' };
      P.push(p);
      stones.push(p);
      flower(px + w / 2, top - 34, 'orchid');
      px += w;
      prevTop = top;
    }
    const far = Math.round(px + reachJump(prevTop - G, false) * R.r(share[0], share[1]));
    plainPit(edge, stones, far);
    open(far);
    run(R.r(130, 170));
    expert += (x - x0) / RUN + 0.6 * heights.length;
    pieces.push({ k: 'stumps', x0, x1: x });
  }
  /**
   * Dot's line before the first real drop of a World 3 stage, whatever kind it is (stones over the stream, a gap in the spores, a liana
   * chain, a vine over a gap): the first-timer drowned before it where the first drop was not a run of stones (new, needs Matt's approval)
   */
  const deepTip = (at: number) => once('deep', () => hint(at - 260, 'No moss down there. Jump true!'));
  /**
   * World 3's first water (3-1, QA 2026-10-29: plain hops lost all three lives in about 10 s at 3-1's first gap over the stream, with no
   * tip before it: Dot's line waited behind the spores' tip and the lessons, and the gap came 270 px out of the spore cloud, 56-64 px
   * wide, a slot the eye barely sees). Dot's water line first, on open floor in the light (no spores, no dark, no stone to land on), two
   * grotto rocks to hop on the way, then one level gap over the stream: a plain jump (40-45% of one, wider than the slot, well inside
   * the shortest flick from a run), petals over it where the hop goes, and a wide landing. Every later water of the stage comes after it.
   */
  function firstWater() {
    const x0 = x;
    run(R.r(180, 220));
    // (Dot's line about 1500 px, five seconds, before the edge: it may wait behind a lesson, she keeps ten seconds between lines)
    once('deep', () => hint(x, 'No moss down there. Jump true!'));
    for (let k = 0; k < 3; k++) {
      run(R.r(240, 280));
      logHop(R.i(34, 42));
    }
    run(R.r(300, 340));
    const edge = x;
    close();
    const far = Math.round(edge + reachJump(0, false) * R.r(0.4, 0.45));
    arc(edge - 40, far + 40, G - 110, 3);
    open(far);
    // (the landing: plain floor, nothing on it for a long hop that runs on)
    run(R.r(340, 380));
    expert += (x - x0) / RUN + 0.6;
    pieces.push({ k: 'gorge', x0, x1: x });
  }
  /** a stone pillar standing up out of the deep (no floor under it: the water below costs a life) */
  const deepStone = (x0: number, w: number, top: number) => {
    const p: Platform = { id: pid++, x: Math.round(x0), y: Math.round(top), width: Math.round(w), height: WATER + 40 - Math.round(top), type: 'solid', style: 'moss_stone' };
    P.push(p);
    return p;
  };
  /**
   * the deep: a run of real jumps over the grotto's underground stream (no moss below: a miss costs a life). Stones stand up out of the
   * water, some a step higher, some across a gap only the second jump crosses, each landing wide (160-210 px) and every gap well inside
   * what the jump reaches (at most 40% of a single jump, 52% of a double: a press window well over the 167 ms floor). `n` stones; `dbl`: how many of the gaps want
   * the second jump. Easy lays a stepping stone in each second-jump gap (easyMode.ts easyStones), so it stays a single jump there.
   */
  function deepRun(n: number, dbl = 1, rise = true) {
    const x0 = x;
    run(R.r(180, 240));
    const edge = x;
    close();
    // which gaps want the second jump (never the first: the run starts with a plain one)
    const want = new Set(R.shuffle(Array.from({ length: n }, (_, i) => i + 1)).slice(0, Math.min(dbl, n)));
    let px = edge, prevTop = G;
    for (let k = 0; k <= n; k++) {
      const last = k === n;
      // (`dbl`: where a second-jump gap was, a step up instead: the first-timer tries the second jump only where a single one has failed
      // him, and over the stream that failure is a life; the second jump is World 3's over soft moss, as in 3-1's twist, 2026-10-28)
      const up = !last && (want.has(k) || (rise && R.chance(0.4))) ? Math.round(R.r(30, 60)) : 0;
      // (never a stone lower than the one before: a stone a little lower and close by was walked off rather than jumped, and the
      // first-timer drowned ten times at one 80 px gap, 2026-10-28)
      const top = last ? G : Math.max(G - 150, prevTop - up);
      const two = false;
      // (a first-timer's flick is short, so a gap over the stream is short too: a third of a full jump; the second-jump gaps half of a
      // double jump, and the first-timer tries the second jump only where the first has failed him, 2026-10-28)
      const gap = Math.round(reachJump(prevTop - top, two) * (two ? R.r(0.46, 0.52) : R.r(0.32, 0.4)));
      px += Math.max(56, gap);
      if (last) break;
      const w = Math.round(R.r(160, 210));
      deepStone(px, w, top);
      flower(px + w / 2, top - 34, 'orchid');
      // a petal arc over each second-jump gap (it shows the way across)
      if (two) arc(px - gap + 10, px - 10, Math.min(prevTop, top) - 150, 3, 'hibiscus');
      px += w;
      prevTop = top;
    }
    open(px);
    run(R.r(240, 300));
    expert += (x - x0) / RUN + 0.5 * n;
    pieces.push({ k: 'gorge', x0, x1: x });
    deepTip(edge);
  }
  /**
   * World 3's stone plate (Matt's `stonePlate` / `stonePlateDown`, wired in the kit but never seen in a stage before): a root gate across
   * the way, a mossy stone plate in front of it, and a heap of pebbles by the door. Standing on the plate opens the roots, but stepping
   * off to go through shuts them: a pebble set on the plate holds it down. `two` (the twist): two plates, both to be held down (a pebble
   * each: two trips with his hands full, on a flat floor, since carrying he cannot jump). Nothing here hurts; a pebble lost rolls back to the heap.
   */
  function plateRoom(two: boolean) {
    const x0 = x;
    run(R.r(150, 190));
    const door = x;
    const before = endBank();
    const span = two ? 800 : 600;
    run(span);
    const floor = endBank();
    const n = ROOMS.length;
    const parts: RoomSpec['pieces'] = [
      { kind: 'reset', id: `post${n}`, at: onP(floor, door + 16) },
      { kind: 'source', id: `heap${n}`, variant: 'pebble', at: onP(floor, door + 100), look: 'pile' },
      { kind: 'item', id: `pebble${n}`, variant: 'pebble', source: `heap${n}`, for: `plateA${n}` },
      { kind: 'plate', id: `plateA${n}`, at: onP(floor, door + 300) },
    ];
    const ground = [floor.id];
    if (two) {
      parts.push({ kind: 'item', id: `pebbleB${n}`, variant: 'pebble', source: `heap${n}`, for: `plateB${n}` });
      parts.push({ kind: 'plate', id: `plateB${n}`, at: onP(floor, door + 580) });
      parts.push({ kind: 'gate', id: `roots${n}`, at: onP(floor, door + 680), open: { all: [`plateA${n}`, `plateB${n}`] }, look: 'roots' });
    } else parts.push({ kind: 'gate', id: `roots${n}`, at: onP(floor, door + 520), open: `plateA${n}`, look: 'roots' });
    ROOMS.push({
      id: `${two ? 'platesTwo' : 'plate'}-${n}`,
      left: onP(before, door - 30), right: onP(floor, door + span - 10), above: 400, below: 60,
      pieces: parts, exit: `roots${n}`, beyond: onP(floor, door + span - 30), ground,
      tips: two
        ? { enter: 'Two stone plates this time.', hold: 'Tap to set it down.', nudge: 'Two plates. Two pebbles?', move: 'One pebble on each plate.' }
        : { enter: 'Roots! Stepping off the plate shuts them.', hold: 'Tap to set it down.', open: 'Held open!', nudge: 'Something heavy could hold the plate.', move: 'Set a pebble on the plate.' },
      mech: two ? undefined : 'plate',
    });
    run(R.r(90, 130));
    logHop(R.i(34, 44));
    run(R.r(120, 160));
    expert += (x - x0) / RUN + (two ? 8 : 5);
    pieces.push({ k: 'log', x0, x1: x });
  }

  // ----- World 3's puzzle rooms (the shared puzzle kit, puzzleKit.ts; 2026-10-28) -----
  /** the dark over a room, with its own sleeping glowworms at `at` ([x, y] each) */
  const roomDark = (x0: number, x1: number, at: Array<[number, number]>) =>
    GZ.push({
      kind: 'dark', x0: Math.round(x0), x1: Math.round(x1), top: G - 760, bottom: G + 260, baseY: G, dir: 1, period: 1, warn: 0, active: 1, force: 0, offset: 0,
      lights: at.map(([lx, ly]) => ({ x: Math.round(lx), y: Math.round(ly), r: 260, sleep: true, id: glowN++ })),
    });
  /**
   * 3-2's glowing mushroom (the kit's carried light): a dark hollow the glowworms do not reach, and a bank too high to jump. The room shows
   * the idea first: beside the mushroom patch a little ledge is there only in its glow (hop up for the petal on it). Carry the mushroom to
   * the foot of the bank and set it down, and its light finds the ledge up under the bank's lip (and Grandma's carved stone beside it).
   * `high` (the twist, later): the last ledge up is so high that no light on the floor reaches it. The mushroom has to go higher: thrown up
   * onto the stones below it (flick up), and then the ledge is there. Nothing in either room can hurt him; a miss is a hop back down.
   */
  function glowRoom(high: boolean) {
    const x0 = x;
    run(R.r(150, 190));
    const door = x;
    // (the room's floor is a piece of its own, from the door to the bank: the check sets a thing down at a piece's middle)
    const before = endBank();
    run(high ? 670 : 600);
    const floor = endBank();
    const n = ROOMS.length;
    const top = cliff(x, x + R.r(440, 520), high ? 330 : 225);
    const parts: RoomSpec['pieces'] = [
      { kind: 'reset', id: `post${n}`, at: onP(floor, door + 16) },
      { kind: 'source', id: `patch${n}`, variant: 'mushroom', at: onP(floor, high ? door + 100 : door + 80), look: 'pile' },
      { kind: 'item', id: `shroom${n}`, variant: 'mushroom', source: `patch${n}`, for: `way${n}` },
    ];
    const ground = [floor.id];
    if (!high) {
      // the shown ledge: its near end 50 px from the patch, a petal on it. The way up: two ledges, a hop each (75, 75 and 70 up to the
      // bank's top), their near end 250 px from the patch, out of its light; Grandma's carved stone at the foot of the first
      parts.push({ kind: 'ledge', id: `show${n}`, at: onP(floor, door + 185, -58), w: 110 });
      flower(door + 185, G - 58 - 34, 'hibiscus');
      parts.push({ kind: 'ledge', id: `step${n}`, at: onP(floor, door + 385, -80), w: 110 });
      parts.push({ kind: 'ledge', id: `way${n}`, at: onP(floor, door + 525, -155), w: 110 });
      parts.push({ kind: 'mark', id: `mark${n}`, at: onP(floor, door + 300), look: 'fernStone' });
    } else {
      // a stone a hop high, a shelf on from it, and the last ledge over the shelf: from the shelf's top (or the stone's far end) the
      // mushroom's light reaches it; from anywhere on the floor it is 234 px and more away
      // (the stone against the shelf: carrying, he stops at the stone's foot, and a flick up from there lands the mushroom on its top)
      const step = block(door + 270, door + 410, 90);
      const shelf = block(door + 410, door + 510, 150);
      flower(step.x + 50, step.y - 34, 'orchid');
      flower(shelf.x + 50, shelf.y - 34, 'orchid');
      ground.push(step.id, shelf.id);
      parts.push({ kind: 'ledge', id: `way${n}`, at: onP(floor, door + 590, -250), w: 120 });
    }
    row(top.x + 70, top.x + 160, top.y - 34, 2, 'orchid');
    ROOMS.push({
      id: `${high ? 'glowHigh' : 'glow'}-${n}`,
      left: onP(before, door - 30), right: { on: top.id, at: 0, dx: 80 }, above: high ? 520 : 440, below: 60,
      pieces: parts, exit: `way${n}`, beyond: { on: top.id, at: 0.35 }, ground,
      tips: high
        ? { enter: 'Somewhere up there, out of the light.', hold: 'From down here its light only reaches so high.', open: 'There it is!', nudge: 'Its light needs to be higher.', move: 'Carry it up onto the stone.' }
        : { enter: 'Too dark, and that bank is too high.', hold: 'Tap to set it down.', open: 'A ledge, in the light!', nudge: 'That little mushroom glows.', move: 'Carry the mushroom. Its light finds ledges.' },
      mech: high ? undefined : 'glow',
    });
    // the room's own dark, a glowworm by the door and one over the bank (standing still wakes them, but only the mushroom finds a ledge)
    roomDark(door - 140, top.x + 240, [[door + 30, G - 175], [top.x + 150, top.y - 170]]);
    // down off the far end of the bank onto the floor again, and a dip to jump on the way on
    open(top.x + top.width);
    run(R.r(150, 190));
    dip();
    run(R.r(250, 290));
    expert += (x - x0) / RUN + (high ? 11 : 7);
    pieces.push({ k: 'log', x0, x1: x });
  }

  /**
   * lianas, World 3's way (the variety pass): one short chain over the stream in a stage, the first time; after that a root up a wall too
   * high to jump (a tree to climb up and over was a detour the quick way walks past; the first-timer drowned three or four times at every liana chain over water, 2026-10-28: one is a World 3 test, more
   * piled lives up far past World 3's band; 3-8, the vine stage, has its own chains)
   */
  let w3Chained = false;
  const w3Vines = () => {
    if (!w3Chained) {
      w3Chained = true;
      deepTip(x + 200);
      chain(2, false, 'gorge');
    } else rootClimb(3);
  };
  /**
   * a wall of grotto rock too high to jump (250-300 up), and a root hanging down its face to climb (the way on goes up it, so it is not a
   * detour); a rock to hop along its top, and down the far side with a short gap over the stream to jump as he lands. `n` walls, one after another. Nothing here costs a life.
   */
  function rootClimb(n: number) {
    const x0 = x;
    for (let k = 0; k < n; k++) {
      run(R.r(180, 230));
      close();
      const h = Math.round(R.r(250, 300));
      const w = Math.round(R.r(240, 320));
      // (the root hangs just in front of the face, so he climbs it from the floor and steps off onto the top)
      const top = cliff(x, x + w, h);
      trunk(x - 34, G, G - h);
      for (let i = 0; i < 2; i++) flower(x - 34, G - 80 - i * 70, 'hibiscus');
      // (a rock to hop on the top, and a dip just past the foot of the far side: the climb is a burst, not a climb and a walk)
      topRock(top, 0.55);
      flower(top.x + 60, top.y - 34, 'orchid');
      open(x + w);
      run(R.r(70, 100));
      // (a short gap over the stream past the foot: a third of a jump, the first-timer's flick clears it)
      deepTip(x);
      close();
      open(x + Math.round(reachJump(0, false) * R.r(0.32, 0.38)));
      expert += h / CLIMB + 0.8 + w / RUN + 0.3;
    }
    run(R.r(160, 200));
    expert += (x - x0) / RUN;
    pieces.push({ k: 'kapok', x0, x1: x });
  }
  /**
   * the climax near the end of every World 3 stage (Gemini's sawtooth: the hardest stretch just before the walk out, STAGE-RULES §2
   * "Tension"), whatever the roll: a run of stones over the stream, then a breath of floor. It also keeps each stage in World 3's band
   * on every roll (a roll of only ferns and dark was World 2-easy, 2026-10-28)
   */
  const w3Climax = () => {
    busy(1, ['log'], R.r(200, 240));
    deepRun(4, 2);
  };
  /** World 3's openings (the variety pass): every one safe (soft moss under every dip), a hop or two in the first seconds */
  const w3Start = (v: number) => {
    // (a little more plain floor first: the first hop came 300 px from the spawn, before he was up to speed, and the first-timer's press
    // window there was 133 ms on Normal, under the 167 ms floor)
    run(R.r(70, 100));
    expert += 0.3;
    // (wide rocks, 190-230 px: on the narrow ones the first-timer's press window to land on top was 100-133 ms on some rolls, under the
    // 167 ms floor, 2026-10-28)
    const wideRock = (gap: number) => {
      run(gap);
      const w = Math.round(R.r(190, 230)), h = R.i(34, 42);
      block(x, x + w, h);
      flower(x + w / 2, G - h - 34, 'orchid');
      run(w);
      expert += (gap + w) / RUN + 0.15;
    };
    const x0 = x;
    if (v === 0) { wideRock(R.r(90, 130)); run(R.r(200, 260)); dip(); }
    else if (v === 1) { wideRock(R.r(90, 130)); wideRock(R.r(200, 260)); }
    else { dip(); run(R.r(200, 260)); wideRock(R.r(60, 90)); }
    run(R.r(230, 270));
    expert += 0.6;
    pieces.push({ k: 'rest', x0, x1: x });
  };
  /** World 3's finish: pieces drawn from a shuffle bag (C1) until a quick player has had the stage's time, a flag every `every` */
  const w3Finish = (target: number, kit: Array<() => void>, every = 2, more: () => boolean = () => false) => {
    const next = W3P!.bag(kit);
    let n = 0;
    while ((expert < target || more()) && n < 24) {
      next()();
      n++;
      if (n % every === 0) flag();
    }
  };

  if (plan === '3-1') {
    // 3-1 Into the Grotto: follow the glowworm light down into the grotto. Run and hop on the grotto's stones, wait out the sleepy
    // spores, and in the twist meet the dark: stand still, and the glowworms wake.
    // (The variety pass, 2026-10-28: two or three versions of each section, picked by the roll (w3Sections.ts); the stone pits have a
    // one-jump way out of every gap (w3Stones); from the Develop on, real jumps over the grotto's stream (deepRun), World 3's step up
    // from World 2.)
    const v = W3P!;
    beat('Start: the grotto mouth', () => {
      rest(R.r(340, 380));  // (round 2: a shorter walk in, the opening was 2-3 quiet seconds)
      W3D.push({ n: 'grottoMouth', x: x - 140, b: G + 8, w: 320 });
      hint(x - 300, 'Into the grotto!');
      w3Start(v.start);
      flag();
    });
    beat('Learn: the grotto stones', () => {
      if (v.learn === 0) w3Order(() => stumps(), () => busy(1), () => w3Stones([60, 120, 60], [0.5, 0.62]));
      // (the mushroom first: its lesson well before the water's tip, which waits ten seconds after any line before it)
      else { highRoadOver(); w3Stones([50, 90, 130, 80], [0.5, 0.62]); }
      busy(1);
      // (QA 2026-10-29: the stage's first water, taught, before anything else over the stream on every roll; late in the Learn, so the
      // first lessons have had their say and Dot's line is not held back behind them)
      firstWater();
      flag();
    });
    beat('Develop: the sleepy spores', () => {
      hint(x + 40, 'Mushrooms puff sleepy spores. Wait for them to clear');
      sporeRest(R.r(440, 500));
      if (v.develop === 0) w3Order(() => sporeGap(), () => w3Stones(R.shuffle([40, 100, 140, 80]), [0.55, 0.68]), () => sporeGap(true));
      else if (v.develop === 1) w3Order(() => deepRun(3, 1), () => sporeGap(true), () => deepRun(3, 1));
      else w3Order(() => w3Vines(), () => sporeGap(true), () => w3Vines());
      flag();
    });
    beat('Twist: the dark', () => {
      hint(x + 60, 'Too dark to see. Stand still and listen...');
      // (the first dark is flat, stones in it; what comes round it changes with the roll: spores, the stream, or vines)
      glowDark(R.r(1000, 1100), 0, { rocks: true });
      if (v.twist === 0) { sporeGap(); glowDark(R.r(1250, 1400), 1, { rocks: true }); sporeGap(true); }
      else if (v.twist === 1) { deepRun(3, 1); glowDark(R.r(1250, 1400), 2, { rocks: true }); }
      else { w3Vines(); glowDark(R.r(1150, 1300), 1, { }); w3Vines(); }
      flag();
    });
    beat('Finish', () => {
      // (each version leans on one thing, drawn from a shuffle bag: lianas over the stream, the spores and the dark, or the deep)
      const kits: Array<Array<() => void>> = [
        [() => w3Vines(), () => { w3Vines(); busy(1); }, () => highRoadOver(), () => { w3Vines(); busy(1); }],
        // (round 2: no long cloud to wait under here, it was most of the spore roll's quiet seconds: gaps in the spores, stones between)
        [() => { sporeGap(true); w3Stones(R.shuffle([40, 80, 60]), [0.5, 0.6]); }, () => glowDark(R.r(1100, 1250), 1, { rocks: true }), () => { sporeGap(true); sporeGap(); }, () => { sporeGap(); deepRun(2, 1); }],
        [() => deepRun(4, 2), () => w3Stones(R.shuffle([50, 110, 70, 130]), [0.5, 0.6]), () => deepRun(3, 1), () => busy(3, ['log', 'dip'])],
      ];
      w3Finish(EXPERT_SECONDS + 18, kits[v.finish], 3);
      homeRun();
    });
  }

  if (plan === '3-2') {
    // 3-2 Glowworm Path: something is watching. First the dark alone (stop and listen, and the glowworms light the gaps), then the eyes
    // alone (hide in the ferns while they look), then both: stop inside a fern, where the eyes cannot see him and the glowworms can.
    // The glowing mushroom, the puzzle kit's carried light, where no glowworm reaches: taught at the end of the dark, and in the finish the
    // ledge too high for its light from the floor (or, on some rolls, World 3's stone plates).
    // (The variety pass, 2026-10-28: two or three versions of each section, picked by the roll (w3Sections.ts), and real jumps over the
    // stream in the dark and between the ferns.)
    const v = W3P!;
    beat('Start', () => {
      rest(R.r(380, 440));
      w3Start(v.start);
      flag();
    });
    beat('Learn: stop and listen', () => {
      hint(x + 20, 'Too dark to see the way. Stand still and listen...');
      if (v.learn === 0) {
        glowDark(R.r(1150, 1300), 1, { rocks: true });
        busy(1);
        glowDark(R.r(1250, 1400), 1, { rocks: true });
      } else {
        glowDark(R.r(1200, 1350), 1, { rocks: true });
        w3Stones([50, 100, 70], [0.5, 0.6]);
      }
      flag();
      glowRoom(false);
      flag();
    });
    beat('Develop: something is watching', () => {
      hint(x + 20, 'Eyes in the dark! Slide down inside a fern to hide', 'Eyes in the dark! Hold down inside a fern to hide', 'Eyes in the dark! Hold down inside a fern to hide');
      // (round 2: rows with two stones between the ferns, 640 px and more apart: one stone in 420-520 px left 2-3 s quiet walks)
      bushRow(3, [640, 700], ['grotto'], [7, 8.5], true);
      flag();
      if (v.develop === 0) bushRow(3, [640, 720], ['grotto'], [5, 6.2], true);
      else if (v.develop === 1) { const x0 = x; glowDark(R.r(1300, 1450), 1, { ferns: true, rocks: true }); ZONES.push({ x0, x1: x, calm: [6, 7.2] }); expert += 3; }
      else { w3Vines(); bushRow(3, [640, 700], ['grotto'], [5.4, 6.4], true); }
      flag();
    });
    beat('Twist: the eyes in the dark', () => {
      hint(x + 20, 'Stop inside a fern. The eyes cannot see you there, and the glowworms can');
      const x0 = x;
      // (the twist's own dark is shorter when a plate room or the roots follow it)
      if (v.twist === 0) glowDark(R.r(1350, 1500), 2, { ferns: true, rocks: true });
      else glowDark(R.r(1050, 1150), 1, { ferns: true, rocks: true });
      ZONES.push({ x0, x1: x, calm: [5.5, 6.8] });
      expert += 4;
      flag();
      // (on some rolls World 3's stone plate here, Matt's pressed plate seen at last)
      if (v.twist === 1) { busy(1); plateRoom(false); flag(); }
      else if (v.twist === 2) { rootClimb(2); flag(); }
    });
    beat('Finish', () => {
      busy(1);
      if (v.finish === 2 && v.twist !== 1) plateRoom(true);
      else glowRoom(true);
      flag();
      const dark = () => {
        // (a breath of plain floor between the ferns' eyes and the dark's)
        rest(R.r(110, 150));
        const x0 = x;
        glowDark(R.r(1600, 1800), 2, { ferns: true, rocks: true });
        ZONES.push({ x0, x1: x, calm: [5, 6.2] });
        expert += 4;
      };
      // (the ferns' finish: rows a little closer, the eyes quicker)
      const ferns = () => bushRow(3, [640, 720], ['grotto'], [4.4, 5.4], true);
      const kits: Array<Array<() => void>> = [
        [ferns, ferns, () => { busy(1); ferns(); }],
        [() => deepRun(4, 1), () => { dark(); deepRun(3, 1); }, () => deepRun(5, 2)],
        [() => { w3Vines(); rootClimb(1); }, () => w3Vines(), () => { rootClimb(1); w3Vines(); }],
      ];
      w3Finish(EXPERT_SECONDS + 34, kits[v.finish], 1);
      w3Climax();
      homeRun();
    });
  }

  if (plan === '3-3') {
    // 3-3 Footprints in a Circle: drive off the prowlers circling in the dark. One ocelot on open ground to learn on, then ocelots on
    // the limestone shelves, then a jaguar (three hits, and it pounces), and in the finish, prowlers in the dark by glowworm light.
    // (Rebuilt 2026-10-28, the stage inspector: stones to hop between the fights, and the shelves are 3-3's own: where 3-9 climbs the
    // trunks to fight on the branches, here every fight but the floor's is a jump up onto a shelf.)
    // (The variety pass, 2026-10-28: versions of each section picked by the roll (w3Sections.ts): shelves over the stream, fights in the
    // dark, or fights between liana chains; the first prowler's tip well before it, 3-3's Easy ocelot hit before its tip was read.)
    const v = W3P!;
    const placed = () => E.filter((e) => e.type === 'ocelot' || e.type === 'jaguar').length;
    beat('Start', () => {
      const x0 = x;
      rest(R.r(420, 480));
      prints(x0 + 200, x - 80);
      hint(x0 + 120, 'Footprints... a prowler is near');
      w3Start(v.start);
      flag();
    });
    beat('Learn: a prowler', () => {
      hint(x - 200, 'A prowler! Punch it twice, or kick it');
      // (hops and stones after the tip, before the first prowler: Dot's lines come 10-12 s apart and the opening's footprints line comes
      // first, so the first-timer met the ocelot at 7 s with the tip still queued, 2026-10-28)
      busy(2, ['log', 'dip'], R.r(200, 240));
      w3Stones([50, 90, 60], [0.5, 0.6]);
      rest(R.r(160, 200));
      prowlFloor(['ocelot']);
      busy(1);
      if (v.learn === 0) prowlFloor(['ocelot', 'ocelot']);
      else { w3Stones([60, 110, 70], [0.5, 0.6]); prowlFloor(['ocelot', 'ocelot']); }
      flag();
    });
    beat('Develop: on the shelves', () => {
      prowlShelves(3, G - 130);
      busy(1);
      if (v.develop === 0) { stumps(); prowlShelves(4, G - 150); }
      else if (v.develop === 1) { glowDark(R.r(1150, 1300), 1, { rocks: true }); prowlFloor(['ocelot']); }
      else { deepRun(3, 1); prowlShelves(3, G - 150); }
      flag();
    });
    beat('Twist: the big one', () => {
      hint(x + 40, 'A jaguar! Three hits, and jump when it crouches to pounce');
      prowlFloor(['jaguar']);
      if (v.twist === 0) { sporeGap(true); prowlFloor(['ocelot', 'jaguar']); }
      else if (v.twist === 1) { busy(1); prowlShelves(3, G - 140); }
      else { sporeRest(R.r(440, 500)); sporeGap(); prowlFloor(['ocelot', 'jaguar']); }
      flag();
    });
    beat('Finish', () => {
      const kits: Array<Array<() => void>> = [
        [() => prowlShelves(R.i(3, 4), G - Math.round(R.r(105, 120)), true), () => prowlShelves(3, G - 140), () => { busy(1); prowlFloor(['ocelot', 'ocelot']); }],
        [() => { glowDark(R.r(1150, 1300), 1, { rocks: true }); prowlFloor(['ocelot']); }, () => { glowDark(R.r(1000, 1100), 0, { rocks: true }); prowlFloor([R.chance(0.35) ? 'jaguar' : 'ocelot', 'ocelot']); }, () => { sporeRest(R.r(440, 500)); glowDark(R.r(1000, 1100), 1, { rocks: true }); }],
        [() => { w3Vines(); prowlFloor(['ocelot', 'ocelot']); }, () => { w3Vines(); prowlFloor([R.chance(0.35) ? 'jaguar' : 'ocelot']); }, () => { w3Vines(); w3Vines(); }],
      ];
      w3Finish(EXPERT_SECONDS + 6, kits[v.finish], 2, () => placed() < Math.ceil(PROWLER_GOAL_33 * 1.5));
      w3Climax();
      homeRun();
    });
  }

  // ----- 3-5 Sleeping Vines: the old thorn vines (thornVine.ts) -----
  const THORNS: ThornVine[] = [];
  /** a thorn vine hanging over the path at vx: its bud just over his head, dozing `sleep` seconds a cycle */
  const thornAt = (vx: number, sleep: [number, number]) =>
    THORNS.push({ x: Math.round(vx), top: G - 470, bud: G - 112, reach: 105, sleep: R.r(sleep[0], sleep[1]), stir: 1.1, look: 1.7, offset: R.r(0, 10) });
  /**
   * a row of thorn vines, `spacing` apart: room to stand between two of them and freeze. `pits`: every other vine hangs over a soft pit,
   * hopped while it sleeps.
   */
  function vineRow(n: number, sleep: [number, number], spacing: [number, number], pits = false, deep = false) {
    const x0 = x;
    const e0 = expert;
    // (2026-10-28, the stage inspector: a grotto stone to hop on the way up to the row and on the way out of it, clear of every reach)
    run(R.r(90, 130));
    logHop(R.i(34, 44));
    run(R.r(60, 90));
    for (let k = 0; k < n; k++) {
      if (pits && k % 2 === 1) {
        const w = Math.round(reachJump(0, false) * R.r(0.45, 0.55));
        run(R.r(spacing[0], spacing[1]) - w / 2);
        const edge = x;
        close();
        const far = edge + w;
        // (`deep`, 2026-10-28: the gap under the vine is over the stream: wait on the bank while it looks, jump while it sleeps)
        if (!deep) softPit(edge, far);
        else deepTip(edge);
        thornAt((edge + far) / 2, sleep);
        open(far);
        // (the next vine is measured from this one, so the pocket between them stays as wide as the rest)
        x -= w / 2;
        continue;
      } else {
        run(R.r(spacing[0], spacing[1]));
        thornAt(x, sleep);
      }
      // a flower in the pocket before each vine: where he stands to wait
      flower(x - R.r(150, 180), G - 40, 'orchid');
    }
    run(R.r(135, 165));
    logHop(R.i(34, 44));
    run(R.r(100, 140));
    expert = e0 + (x - x0) / RUN + n * 1.4 + 0.3;
    pieces.push({ k: 'rest', x0, x1: x });
  }

  // ----- 3-6 Grandma's Things: what Dot hid in the ferns -----
  // (3-7's things are others of hers: Dot hid a great many things)
  const THINGS = plan === '3-7' ? ['teacup', 'spectacles', 'thimble', 'ball of wool', 'seed pouch'] : ['locket', 'rattle', 'teddy bear', 'bell'];
  let thingsPlaced = 0;
  /** one of Grandma's things in a fern at px on the surface: crouch beside it to find it (engine.ts, a hidden relic) */
  const thingFern = (px: number, surface: number) => {
    const id = cid++;
    C.push({ id, type: 'relic', hidden: true, x: Math.round(px), y: surface - 26, collected: false, bobPhase: 0, thing: THINGS[id % THINGS.length] });
    thingsPlaced++;
    // nothing else in the fern: a flower there would hide it (and give it away)
    for (let i = C.length - 2; i >= 0; i--) if (C[i].type === 'flower' && Math.abs(C[i].x - px) < 90 && Math.abs(C[i].y - (surface - 26)) < 90) C.splice(i, 1);
  };
  /** a fern that holds nothing, the same as the rest (all ferns look alike) */
  const plainFern = (px: number, surface = G) => W3D.push({ n: 'fern', x: Math.round(px), b: surface + 6, w: 150, flip: R.chance(0.5) });
  /**
   * a stretch of floor with ferns along it, one of them hiding a thing. `stones` (rebuilt 2026-10-28, the stage inspector): each fern on a
   * low grotto stone of its own, a hop between them, so the search is a hop from fern to fern, not a walk past them
   */
  function fernPatch(ferns: number, stones = false) {
    const x0 = x;
    if (stones) {
      // (the stones stand in a shallow mossy hollow, one easy hop under them: a hop up onto each, or across from one to the next)
      run(R.r(130, 170));
      const edge = x;
      close();
      const hide = R.i(0, ferns - 1);
      // (the hollow's floor is a piece in each gap, between the stones: a floor running on under them would let the way along it pass
      // through them, which the game does not)
      const hollow = (x0: number, x1: number) => P.push({ id: pid++, x: Math.round(x0), y: G + 30, width: Math.round(x1 - x0), height: HOLLOW_Y + 10 - (G + 30), type: 'solid', style: 'moss_stone' });
      let px = edge + Math.round(R.r(70, 100));
      hollow(edge, px);
      for (let k = 0; k < ferns; k++) {
        const w = Math.round(R.r(170, 190));
        const top = G - R.i(30, 46);
        P.push({ id: pid++, x: px, y: top, width: w, height: HOLLOW_Y + 10 - top, type: 'solid', style: 'moss_stone' });
        if (k === hide) thingFern(px + w / 2, top);
        else plainFern(px + w / 2, top);
        const g = Math.round(k < ferns - 1 ? R.r(80, 110) : R.r(70, 100));
        hollow(px + w, px + w + g);
        px += w + g;
      }
      const far = px;
      open(far);
      // (a burst of hops: a breath of plain floor after it)
      run(R.r(300, 340));
      expert += (x - x0) / RUN + 3 + 0.3 * ferns;
      pieces.push({ k: 'snakes', x0, x1: x });
      return;
    }
    const len = 300 + ferns * R.r(190, 230);
    run(len);
    const hide = R.i(0, ferns - 1);
    for (let k = 0; k < ferns; k++) {
      const fx = x0 + 200 + ((len - 400) * k) / Math.max(1, ferns - 1);
      if (k === hide) thingFern(fx, G);
      else plainFern(fx);
    }
    expert += len / RUN + 3;
    pieces.push({ k: 'snakes', x0, x1: x });
  }

  /** an awake thorn vine (3-5's lure): it never sleeps, so standing still gets nobody past it; a noise turns it; its swat costs no heart */
  const awakeVine = (vx: number) => THORNS.push({ x: Math.round(vx), top: G - 470, bud: G - 112, reach: 105, sleep: 0, stir: 0, look: 6, offset: 0, awake: true });
  /**
   * 3-5's lure (the puzzle kit's noise, 2026-10-28): an old vine wide awake over the way on. It never sleeps, so freezing gets nobody
   * past it, and its swat sends him back a few steps (never a heart). `bell`, shown first: a bell on a post by the door. Ring it and the
   * vine strikes at the ring and listens to it for a while: walk on by. `pebble`: no bell, a pile of pebbles: thrown, a pebble lands with
   * a clack, and the vine strikes that instead. `two`: two awake vines, and one clack between them that both hear.
   */
  function lureRoom(kind: 'bell' | 'pebble' | 'two') {
    const x0 = x;
    run(R.r(150, 190));
    const door = x;
    const before = endBank();
    const span = kind === 'two' ? 960 : 720;
    run(span);
    const floor = endBank();
    const n = ROOMS.length;
    const parts: RoomSpec['pieces'] = [{ kind: 'reset', id: `post${n}`, at: onP(floor, door + 16) }];
    if (kind === 'bell') parts.push({ kind: 'bell', id: `bell${n}`, at: onP(floor, door + 130) });
    else parts.push({ kind: 'source', id: `pile${n}`, variant: 'pebble', at: onP(floor, door + 110), look: 'pile' }, { kind: 'item', id: `pebble${n}`, variant: 'pebble', source: `pile${n}` });
    awakeVine(kind === 'two' ? door + 400 : door + 440);
    if (kind === 'two') awakeVine(door + 690);
    // past the vine (or both), out of its reach, a stone to hop with a petal on it: where he wants to go
    const past = kind === 'two' ? door + 820 : door + 575;
    const rock = block(past, past + 120, 40);
    flower(past + 60, G - 74, 'hibiscus');
    const tips: RoomSpec['tips'] =
      kind === 'bell' ? { enter: 'This old vine is wide awake. Nobody gets by.', nudge: 'That bell looks loud.', move: 'Ring the bell. The vine turns to look.' }
        : kind === 'pebble' ? { enter: 'Another one awake, and no bell this time.', hold: 'Pebbles clack when they land.', nudge: 'Any noise turns its head.', move: 'Throw a pebble past it. Then go.' }
          : { enter: 'Two of them, both awake.', nudge: 'One clack each?', move: 'Throw a pebble past each one.' };
    ROOMS.push({
      id: `${kind === 'bell' ? 'vineBell' : kind === 'pebble' ? 'pebbles' : 'pebblesTwo'}-${n}`,
      // (the room ends past the last vine's reach: narrow enough for an upright phone)
      left: onP(before, door - 30), right: onP(floor, kind === 'two' ? door + 810 : door + span), above: 440, below: 60,
      pieces: parts, exit: kind === 'bell' ? `bell${n}` : `pebble${n}`, beyond: onP(floor, kind === 'two' ? door + 800 : door + span - 40), ground: [floor.id, rock.id], tips,
    });
    run(R.r(80, 120));
    expert += (x - x0) / RUN + (kind === 'two' ? 5 : 4);
    pieces.push({ k: 'log', x0, x1: x });
  }

  if (plan === '3-5') {
    // 3-5 Sleeping Vines: the old thorn vines Grandma said were asleep. One of them moved. Pass under them while they sleep; when one
    // opens an eye, freeze (or duck) until it dozes off again. World 3's keepsake, the medal, is in a Hush Fern along the way.
    // (Rebuilt 2026-10-28, the stage inspector and the puzzle kit: stones to hop between the rows, and the vine that is awake: a bell to
    // ring for it first, then pebbles to throw, then two of them at once.)
    // (The variety pass, 2026-10-28: versions of each section picked by the roll (w3Sections.ts): vines over gaps in the stream, lianas,
    // the spores; after the pebbles, two awake vines or World 3's stone plates.)
    const v = W3P!;
    beat('Start', () => {
      rest(R.r(380, 440));
      hint(x - 300, 'Grandma said the old thorn vines were asleep...');
      w3Start(v.start);
      flag();
    });
    beat('Learn: one vine', () => {
      hint(x + 40, 'When a vine opens an eye, freeze! Move on when it sleeps');
      vineRow(1, [5, 6], [380, 420]);
      busy(1);
      if (v.learn === 0) vineRow(2, [4.5, 5.5], [380, 440]);
      else { w3Stones([50, 100, 60], [0.5, 0.6]); vineRow(2, [4.5, 5.5], [380, 440]); }
      flag();
    });
    beat('Develop: a row of them', () => {
      if (v.develop === 0) vineRow(4, [3.6, 4.6], [340, 420]);
      else if (v.develop === 1) { deepRun(3, 1); vineRow(3, [3.6, 4.6], [340, 420], true, true); }
      else { w3Vines(); vineRow(3, [3.6, 4.6], [340, 420]); }
      flag();
      // the keepsake: the medal, in a Hush Fern on a quiet stretch
      const keep = findForStage(config.worldIndex, config.miniIndex);
      busy(1, ['log'], R.r(120, 160));
      const k0 = x;
      run(R.r(380, 440));
      expert += (x - k0) / RUN;
      pieces.push({ k: 'rest', x0: k0, x1: x });
      if (keep && keep.kind === 'keepsake') C.push({ id: cid++, type: 'find', findId: keep.id, hidden: true, x: Math.round(k0 + (x - k0) / 2), y: G - 26, collected: false, bobPhase: 0 });
      expert += 3;
      busy(1, ['dip'], R.r(140, 180));
      // one of them is awake: the bell first
      lureRoom('bell');
      flag();
      if (v.develop === 0) vineRow(4, [3.6, 4.4], [360, 430], true);
      else if (v.develop === 1) vineRow(3, [3.6, 4.4], [360, 430], true, true);
      else w3Vines();
      flag();
    });
    beat('Twist: vines in the dark', () => {
      hint(x + 40, 'In the dark, standing still does two things');
      const z0 = x;
      glowDark(R.r(1500, 1700), 1, { rocks: true });
      // the vines hang between the glowworms, clear of where the dark starts
      for (let vx = z0 + 640; vx < x - 420; vx += R.r(380, 460)) if (!P.some((pl) => pl.style === 'moss_stone' && vx > pl.x - 120 && vx < pl.x + pl.width + 120)) thornAt(vx, [3.6, 4.4]);
      expert += 3;
      if (v.twist === 1) deepRun(3, 1);
      else if (v.twist === 2) { rootClimb(2); vineRow(2, [3.4, 4.2], [340, 420]); }
      flag();
    });
    beat('Finish', () => {
      lureRoom('pebble');
      flag();
      // (after the pebbles: two awake vines, or the stone plates)
      if (v.finish === 1) plateRoom(true);
      else lureRoom('two');
      flag();
      const kits: Array<Array<() => void>> = [
        [() => vineRow(R.i(3, 4), [3.4, 4.2], [340, 420], true, true), () => busy(2), () => vineRow(4, [3.2, 4], [330, 400])],
        [() => deepRun(4, 1), () => { sporeGap(true); vineRow(2, [3.4, 4.2], [340, 420], true, true); }, () => deepRun(5, 2)],
        [() => w3Vines(), () => { w3Vines(); vineRow(2, [3.4, 4.2], [340, 420]); }, () => w3Vines()],
      ];
      w3Finish(EXPERT_SECONDS + 18, kits[v.finish], 2);
      homeRun();
    });
  }

  if (plan === '3-6') {
    // 3-6 Grandma's Things: Dot hid Grandma's things in the ferns, a LOT of ferns, very fast, because there were boots. Crouch beside a
    // fern that rustles on its own. On the floor first, then up on the grotto's stones, past the spores, and in the dark.
    // (Rebuilt 2026-10-28, the stage inspector: the ferns stand on low stones, a hop from one to the next, and stones to hop on the way
    // between the patches, so the search is never an empty walk.)
    // (The variety pass, 2026-10-28: versions of each section picked by the roll (w3Sections.ts); the stepping stones have a one-jump way
    // out of every gap (w3Stones: the first-timer was stuck in them), and a thing on a stone over the stream on some rolls.)
    const v = W3P!;
    /** a thing in a fern on the highest stone built since x0 */
    const onHigh = (x0: number) => {
      const hi = P.filter((pl) => pl.style === 'moss_stone' && pl.x > x0 && pl.y < G - 50).sort((a, b) => a.y - b.y)[0];
      if (hi) thingFern(hi.x + hi.width / 2, hi.y);
    };
    beat('Start', () => {
      rest(R.r(380, 440));
      hint(x - 340, "Dot hid Grandma's things in the ferns. Crouch beside one that rustles", "Dot hid Grandma's things in the ferns. Hold down beside one that rustles", "Dot hid Grandma's things in the ferns. Hold down beside one that rustles");
      w3Start(v.start);
      flag();
    });
    beat('Learn: the rustling fern', () => {
      fernPatch(3, true);
      busy(1);
      if (v.learn === 0) fernPatch(4, true);
      else { w3Stones([50, 90, 60], [0.5, 0.6]); fernPatch(3, true); }
      flag();
    });
    beat('Develop: up high and past the spores', () => {
      // on top of the stones: the highest one's top holds a fern
      const x0 = x;
      if (v.develop === 0) { w3Stones([60, 130, 90], [0.5, 0.62]); onHigh(x0); sporeRest(R.r(520, 600)); fernPatch(3, true); }
      else if (v.develop === 1) { sporeRest(R.r(440, 500)); sporeGap(true); w3Stones([50, 110, 80], [0.5, 0.62]); onHigh(x0); sporeGap(); }
      else { deepRun(3, 1); onHigh(x0); fernPatch(3, true); deepRun(3, 1); }
      flag();
    });
    beat('Twist: ferns in the dark', () => {
      hint(x + 40, 'Ferns in the dark too. Stand still, and the glowworms help you look');
      const z0 = x;
      const stops = glowDark(R.r(1500, 1700), 1, { rocks: true });
      // a fern by the first stop, and plain ones about, clear of the stones and the gap
      const clear = (fx: number) => !P.some((pl) => pl.style === 'moss_stone' && fx > pl.x - 140 && fx < pl.x + pl.width + 140);
      thingFern(stops[0] + 130, G);
      for (let fx = z0 + 640; fx < x - 400; fx += R.r(360, 440)) if (clear(fx)) plainFern(fx);
      if (v.twist === 1) { sporeRest(R.r(440, 500)); sporeGap(true); }
      else if (v.twist === 2) deepRun(4, 1);
      flag();
    });
    beat('Finish', () => {
      const kits: Array<Array<() => void>> = [
        [() => fernPatch(R.i(3, 4), true), () => { busy(1); lowStumps(); run(R.r(110, 140)); busy(1); }, () => fernPatch(4, true), () => highRoadOver()],
        [() => { const x0 = x; deepRun(4, 1); onHigh(x0); }, () => fernPatch(3, true), () => { const x0 = x; deepRun(5, 2); onHigh(x0); }],
        [() => w3Vines(), () => fernPatch(3, true), () => { w3Vines(); fernPatch(3, true); }],
      ];
      w3Finish(EXPERT_SECONDS + 4, kits[v.finish], 2, () => thingsPlaced < GRANDMA_GOAL_36 + 3);
      w3Climax();
      homeRun();
    });
  }

  // ----- 3-7 Which Fern?: Grandma's things, among everything the grotto has taught so far -----
  /**
   * a row of thorn vines with a fern under each: crouching beside a fern to search is also keeping still, so a vine that wakes while he
   * searches lets him be. One fern of the row holds a thing; the others are only ferns.
   */
  function vineFerns(n: number, sleep: [number, number], spacing: [number, number]) {
    const x0 = x;
    const e0 = expert;
    // (2026-10-28, the stage inspector: a grotto stone on the way up to the row and one on the way out, clear of every reach)
    run(R.r(90, 130));
    logHop(R.i(34, 44));
    run(R.r(60, 90));
    const hide = R.i(0, n - 1);
    for (let k = 0; k < n; k++) {
      run(R.r(spacing[0], spacing[1]));
      thornAt(x, sleep);
      // the fern a little to one side of the vine, still well inside its reach
      const fx = x + (R.chance(0.5) ? -1 : 1) * Math.round(R.r(30, 50));
      if (k === hide) thingFern(fx, G);
      else plainFern(fx);
    }
    run(R.r(150, 175));
    logHop(R.i(34, 44));
    run(R.r(100, 140));
    expert = e0 + (x - x0) / RUN + n * 1.6 + 1.8;
    pieces.push({ k: 'rest', x0, x1: x });
  }
  /**
   * ferns the eyes watch: hiding ferns (bushes) and searching ferns in turn. A search takes a moment out in the open, so it is done
   * between the eyes' passes, and the next hiding fern is never far.
   */
  function watchedFerns(n: number, calm: [number, number]) {
    const x0 = x;
    const e0 = expert;
    const hide = R.i(0, n - 1);
    // (2026-10-28, the stage inspector: a grotto stone to hop on the way to each hiding fern)
    const toFern = () => {
      const s0 = x;
      run(R.r(100, 130));
      logHop(R.i(34, 44));
      run(Math.max(60, s0 + R.r(320, 380) - x));
    };
    for (let k = 0; k < n; k++) {
      toFern();
      bush(x - BUSH_W.grotto / 2, 'grotto');
      // (and a little stone, a petal on it, between the hiding fern and the one to search)
      const b0 = x;
      run(105);
      const sw = Math.round(R.r(90, 100));
      block(x, x + sw, R.i(30, 38));
      flower(x + sw / 2, G - 72, 'orchid');
      run(Math.max(sw + 75, b0 + R.r(285, 330) - x));
      if (k === hide) thingFern(x, G);
      else plainFern(x);
    }
    toFern();
    bush(x - BUSH_W.grotto / 2, 'grotto');
    run(R.r(260, 340));
    ZONES.push({ x0, x1: x, calm });
    expert = e0 + watched(x - x0, (calm[0] + calm[1]) / 2) + 2 + 0.15 * (n + 1);
    pieces.push({ k: 'rest', x0, x1: x });
  }

  /**
   * 3-7's "Which fern?" (the puzzle kit's carried light and its marks, 2026-10-28): a dark hollow with three ferns that look alike and all
   * rustle now and then (rustling tells nothing here: "or that might be the wind"). Dot marked the fern she used with a stone, and a stone
   * like it lies by the door, in the light of the mushroom patch: a carved fern stone or a crystal (rolled). By each fern there is a stone
   * of one kind or the other, or none, and only the mushroom's light shows them: carry it along the ferns, find the twin of the stone by
   * the door, and search that fern. Searching the others finds nothing (and costs nothing); beside the right one nothing says so (the
   * stones are what tell it). Nothing in the room can hurt him.
   */
  function whichFern() {
    const x0 = x;
    run(R.r(150, 190));
    const door = x;
    const before = endBank();
    run(880);
    const floor = endBank();
    const n = ROOMS.length;
    const first = !ROOMS.some((r) => r.id.startsWith('whichFern'));
    const key = R.pick(['fernStone', 'crystal'] as const);
    const other = key === 'fernStone' ? 'crystal' : 'fernStone';
    const looks = R.shuffle([key, other, null] as Array<'fernStone' | 'crystal' | null>);
    const parts: RoomSpec['pieces'] = [
      { kind: 'reset', id: `post${n}`, at: onP(floor, door + 16) },
      { kind: 'source', id: `patch${n}`, variant: 'mushroom', at: onP(floor, door + 80), look: 'pile' },
      { kind: 'item', id: `shroom${n}`, variant: 'mushroom', source: `patch${n}` },
      // the stone by the door, in the patch's light from the start
      { kind: 'mark', id: `key${n}`, at: onP(floor, door + 145), look: key },
    ];
    // the ferns 180 apart, each one's stone at its foot on the left: the first stone 240 px from the patch, out of its light
    [door + 390, door + 570, door + 750].forEach((fx, k) => {
      const look = looks[k];
      if (look) parts.push({ kind: 'mark', id: `stone${n}_${k}`, at: onP(floor, fx - 68), look });
      // (every fern here is painted the same way, rustling on a beat of its own; the right one's thing is hidden in it)
      W3D.push({ n: 'fern', x: Math.round(fx), b: G + 6, w: 150, rustle: R.i(1, 97) });
      if (look === key) {
        thingFern(fx, G);
        C[C.length - 1].riddle = true;
      }
    });
    ROOMS.push({
      id: `whichFern-${n}`,
      left: onP(before, door - 30), right: onP(floor, door + 830), above: 420, below: 60,
      pieces: parts, exit: `shroom${n}`, beyond: onP(floor, door + 820), ground: [floor.id],
      tips: first
        ? { enter: 'I marked the right fern with a stone.', hold: 'Its light shows the stones.', nudge: 'Look at the stone by the door.', move: 'Find its twin by a fern. Search there.' }
        : { enter: 'I marked this one too.', nudge: 'Same stone as the one by the door.', move: 'Find its twin by a fern. Search there.' },
    });
    roomDark(door - 140, door + 900, [[door + 40, G - 175], [door + 560, G - 190]]);
    // (out of the room, a stone to hop)
    run(R.r(60, 80));
    logHop(R.i(34, 44));
    run(R.r(110, 140));
    expert += (x - x0) / RUN + 6;
    pieces.push({ k: 'log', x0, x1: x });
  }

  if (plan === '3-7') {
    // 3-7 Which Fern?: all ferns look alike, and Dot has apologized to twelve of them. More of Grandma's things, hidden among everything
    // the grotto has taught: a fern under a sleeping vine (crouching to search is keeping still), ferns the eyes watch (search between
    // their passes), and in the twist ferns under vines in the dark, where crouching does three things at once.
    // (Rebuilt 2026-10-28, the stage inspector and the puzzle kit: the real "which fern?", twice: in a dark hollow three ferns that look
    // and rustle alike, and Dot's marking stones beside them that only the glowing mushroom shows; the twin of the stone by the door
    // tells the fern. Stones to hop between the rows.)
    // (The variety pass, 2026-10-28: versions of each section picked by the roll (w3Sections.ts): the eyes, the vines, or real jumps
    // over the stream between the ferns; on some rolls World 3's stone plate after the dark.)
    const v = W3P!;
    beat('Start', () => {
      rest(R.r(380, 440));
      hint(x - 340, 'More of Grandma\'s things. Crouch beside a fern that rustles', 'More of Grandma\'s things. Hold down beside a fern that rustles', 'More of Grandma\'s things. Hold down beside a fern that rustles');
      w3Start(v.start);
      flag();
    });
    beat('Learn: a fern under a vine', () => {
      hint(x - 200, 'Searching is keeping still. A vine that wakes leaves you be');
      vineFerns(2, [4.6, 5.4], [420, 480]);
      busy(1);
      if (v.learn === 0) vineFerns(3, [4.2, 5], [400, 460]);
      else { w3Stones([60, 110, 70], [0.5, 0.6]); vineFerns(2, [4.2, 5], [400, 460]); }
      flag();
      // which fern? (Dot's stones, in the mushroom's light)
      busy(1, ['dip'], R.r(140, 180));
      whichFern();
      flag();
    });
    beat('Develop: ferns the eyes watch', () => {
      hint(x + 40, 'The eyes are back. Search between their looks, and hide in the next fern');
      watchedFerns(2, [6.5, 7.5]);
      flag();
      if (v.develop === 0) { sporeRest(R.r(520, 600)); watchedFerns(3, [5.8, 6.8]); }
      else if (v.develop === 1) { w3Vines(); rootClimb(1); w3Vines(); }
      else { deepRun(3, 1); fernPatch(3, true); deepRun(3, 1); }
      flag();
    });
    beat('Twist: ferns in the dark, under the vines', () => {
      hint(x + 40, 'In the dark, under a vine, crouching by a fern does three things at once');
      const z0 = x;
      const stops = glowDark(R.r(1600, 1800), 2, { rocks: true, lead: true });
      // a vine over the first stop, with the fern that hides a thing under it; plain ferns about
      const vx = stops[0] + 150;
      thornAt(vx, [4.2, 5]);
      thingFern(vx + 40, G);
      const clear = (fx: number) => !P.some((pl) => pl.style === 'moss_stone' && fx > pl.x - 140 && fx < pl.x + pl.width + 140);
      if (clear(stops[0] + 470)) plainFern(stops[0] + 470);
      for (let fx = z0 + 900; fx < x - 500; fx += R.r(420, 520)) if (clear(fx)) plainFern(fx);
      expert += 3;
      flag();
      if (v.twist === 1) { busy(1); plateRoom(false); flag(); }
      else if (v.twist === 2) { rootClimb(2); flag(); }
    });
    beat('Finish', () => {
      busy(1, ['log'], R.r(140, 180));
      whichFern();
      flag();
      const kits: Array<Array<() => void>> = [
        [() => { w3Vines(); rootClimb(1); }, () => { w3Vines(); vineFerns(2, [3.8, 4.6], [380, 450]); }, () => { rootClimb(1); w3Vines(); fernPatch(3, true); }],
        [() => watchedFerns(R.i(2, 3), [5.2, 6.2]), () => bushRow(3, [560, 660], ['grotto'], [4.6, 5.6], true), () => watchedFerns(3, [5, 6])],
        [() => { deepRun(4, 1); fernPatch(3, true); }, () => deepRun(5, 2), () => { deepRun(3, 1); w3Stones([50, 100, 70], [0.5, 0.6]); }],
      ];
      w3Finish(EXPERT_SECONDS + 14, kits[v.finish], 2, () => thingsPlaced < GRANDMA_GOAL_37 + 3);
      w3Climax();
      homeRun();
    });
  }

  // ----- 3-8 Thorn Vine Swing: lianas with old thorn vines hanging in the gaps between them -----
  // ----- 3-8 Thorn Vine Swing: lianas with old thorn vines hanging in the gaps between them -----
  /**
   * a chain of lianas (chain(): every vine catches the next) with a thorn vine hanging in each gap between two of them, low enough
   * that the leap from one to the next passes through its reach. Hanging on a liana he is out of its sight (thornVine.ts), so he waits
   * there while it looks and leaps while it sleeps. Neighbouring vines keep different rhythms.
   */
  function thornChain(n: number, soft: boolean, sleep: [number, number]) {
    const before = V.length;
    chain(n, soft, soft ? 'hollow' : 'gorge', soft);
    const ls = V.slice(before).filter((v) => v.isSwingingVine).sort((a, b) => a.x - b.x);
    for (let k = 0; k + 1 < ls.length; k++) {
      const mx = Math.round((ls[k].x + ls[k + 1].x) / 2);
      // the bud just above the highest his feet go in that leap, and its reach down to the floor of the gap: a leap taken while it
      // looks always passes through it, and the next liana (60 px of grab either side) is clear of it
      const reach = Math.min(95, Math.round((ls[k + 1].x - ls[k].x) / 2 - 70));
      const band = leapBand(ls[k], ls[k + 1], mx, reach) ?? [G - 260, G - 120];
      const bud = Math.round(band[0] - 8);
      const sl = R.r(sleep[0], sleep[1]);
      THORNS.push({ x: mx, top: Math.min(bud - 200, ls[k].topY), bud, reach, below: Math.round(band[1] - bud + 40), sleep: sl, stir: 1.1, look: 1.8, offset: R.r(0, sl + 2.9) });
      expert += 1.4;
    }
  }

  if (plan === '3-8') {
    // 3-8 Thorn Vine Swing: swing past the thorn vines without touching the thorns. A sloth hanging on a liana is the stillest thing
    // in the forest, so the vines cannot see him there: ride the liana while the vine in the next gap looks, and leap while it sleeps.
    // The timed swing's gold ring says when to let go; the vine's eye says whether. World 3's photo album is in a fern on the way.
    // (Rebuilt 2026-10-28, the stage inspector: hops on the way in and between the chains, and a short run home.)
    // (The variety pass, 2026-10-28: versions of each section picked by the roll (w3Sections.ts): longer chains, real jumps over the
    // stream with vines over the gaps, or the grotto dark between the chains.)
    const v = W3P!;
    beat('Start', () => {
      rest(R.r(340, 380));  // (round 2: a shorter walk in, the opening was 2-3 quiet seconds)
      hint(x - 320, 'Thorn vines hang between the lianas. Swing past without touching the thorns');
      w3Start(v.start);
      flag();
    });
    beat('Learn: one vine in the gap', () => {
      // (said on the walk up, so Dot's line is gone by the time he is on the liana: it hangs where the vine and he are)
      hint(x - 260, 'Hang on while the thorn vine looks. Let go while it sleeps');
      thornChain(2, true, [4.8, 5.6]);
      busy(1);
      if (v.learn === 0) thornChain(2, true, [4.4, 5.2]);
      else { w3Stones([50, 100, 60], [0.5, 0.6]); thornChain(2, false, [4.4, 5.2]); }
      flag();
    });
    beat('Develop: a longer chain', () => {
      if (v.develop === 0) thornChain(3, false, [4.2, 5]);
      else if (v.develop === 1) { deepRun(3, 1); thornChain(2, false, [4.2, 5]); }
      else vineRow(3, [4, 4.8], [360, 430], true, true);
      flag();
      // the photo album, in a Hush Fern on a quiet stretch between the chains
      const book = findForStage(config.worldIndex, config.miniIndex);
      busy(1, ['log'], R.r(120, 160));
      const b0 = x;
      run(R.r(380, 440));
      expert += (x - b0) / RUN;
      pieces.push({ k: 'rest', x0: b0, x1: x });
      if (book && book.kind === 'book') C.push({ id: cid++, type: 'find', findId: book.id, hidden: true, x: Math.round(b0 + (x - b0) / 2), y: G - 26, collected: false, bobPhase: 0 });
      expert += 3;
      busy(1, ['dip'], R.r(140, 180));
      thornChain(3, false, [4, 4.8]);
      flag();
    });
    beat('Twist: a vine over the landing', () => {
      hint(x - 260, 'One hangs over the landing too. Land, and freeze if it wakes');
      thornChain(3, false, [3.8, 4.6]);
      // the far bank: a sleeping vine just past where he lands (3-5's rule: on the ground, standing still is safe)
      const landX = x;
      run(R.r(220, 280));
      thornAt(x, [3.6, 4.4]);
      run(R.r(300, 360));
      expert += (x - landX) / RUN + 1.6;
      flag();
      if (v.twist === 1) deepRun(4, 1);
      else if (v.twist === 2) glowDark(R.r(1150, 1300), 1, { rocks: true });
      else thornChain(2, false, [3.8, 4.6]);
      flag();
    });
    beat('Finish', () => {
      const kits: Array<Array<() => void>> = [
        [() => thornChain(R.i(3, 4), false, [3.6, 4.4]), () => { busy(1); stumps(); }, () => thornChain(4, false, [3.4, 4.2])],
        [() => vineRow(R.i(2, 3), [3.6, 4.4], [360, 430], true, true), () => { busy(1); stumps(); }, () => { vineRow(3, [3.4, 4.2], [340, 420]); thornChain(2, false, [3.6, 4.4]); }],
        [() => deepRun(4, 1), () => thornChain(3, false, [3.6, 4.4]), () => deepRun(5, 2)],
      ];
      w3Finish(EXPERT_SECONDS + 14, kits[v.finish], 1);
      homeRun();
    });
  }

  // ----- 3-9 The Prowler's Ring: a ring of clawed limestone, and the prowlers it belongs to -----
  /**
   * the ring: limestone shelves round a floor, walled at its far end. When he comes in, ocelots and then a jaguar leap in out of the
   * dark at its edge in waves (engine.ts updateRing), and the wall gives way when every one is down.
   */
  function prowlerRing() {
    const x0 = x;
    run(R.r(180, 240));
    const r0 = x;
    const W = Math.round(R.r(1150, 1250));
    const ly = G - 140, ty = G - 270;
    const L = branch(r0 + 160, r0 + 420, ly);
    const Rb = branch(r0 + W - 420, r0 + W - 160, ly);
    const Tp = branch(r0 + W / 2 - 170, r0 + W / 2 + 170, ty);
    row(Tp.x + 50, Tp.x + Tp.width - 50, ty - 34, 3, 'orchid');
    // a heart on the high shelf: the ring is a long fight
    C.push({ id: cid++, type: 'heart', x: Math.round(Tp.x + Tp.width / 2), y: ty - 80, collected: false, bobPhase: 0 });
    const wall = block(r0 + W, r0 + W + 120, 330);
    // (2026-10-28, the variety pass: grotto stones on the ring's floor, one under the high shelf and one by the way out, so the walk
    // across the cleared ring is not five quiet seconds)
    for (const [rx, rh] of [[r0 + W / 2 - 60, 38], [r0 + W - 100, 40]] as const) { block(rx, rx + 90, rh); flower(rx + 45, G - rh - 34, 'orchid'); }
    const mid = (pl: Platform) => pl.x + pl.width / 2;
    RING = {
      x0: r0, x1: r0 + W, wallId: wall.id,
      waves: [
        [{ x: r0 + W * 0.5, surface: G, kind: 'ocelot' }, { x: mid(L), surface: ly, kind: 'ocelot' }],
        [{ x: r0 + W * 0.35, surface: G, kind: 'ocelot' }, { x: mid(Rb), surface: ly, kind: 'ocelot' }, { x: r0 + W * 0.65, surface: G, kind: 'ocelot' }],
        [{ x: r0 + W * 0.55, surface: G, kind: 'jaguar' }, { x: mid(Tp), surface: ty, kind: 'ocelot' }],
      ],
    };
    // the scratched floor: pawprints round the ring
    prints(r0 + 120, r0 + W - 120);
    // Matt's ring pieces: a clawed pillar at the way in, a low scratched wall and old bones inside, and the way out a cracked pillar that
    // lies broken once the ring is cleared (it stands over the wall block, and is drawn only while the block stands, then the broken one)
    W3D.push({ n: 'pillar', x: r0 + 30, b: G + 6, w: 150 });
    W3D.push({ n: 'ringWall', x: r0 + W * 0.5, b: G + 8, w: 250 });
    W3D.push({ n: 'bones', x: r0 + W * 0.28, b: G + 6, w: 120 });
    W3D.push({ n: 'pillarCracked', x: r0 + W + 60, b: G + 6, w: 170, front: true, wall: wall.id });
    W3D.push({ n: 'pillarBroken', x: r0 + W + 60, b: G + 8, w: 300, wall: wall.id, whenBroken: true });
    x = r0 + W + 120;
    run(R.r(260, 340));
    expert += (x - x0) / RUN + 24;
    pieces.push({ k: 'snakes', x0, x1: x });
  }

  if (plan === '3-9') {
    // 3-9 The Prowler's Ring: break out of the ring. The prowlers again, now all together: ocelots on the floor and up the trees, a jaguar,
    // the old vines and the dark between fights, and the ring, where they leap in out of the dark in waves until every one is down and
    // the way opens. (Rebuilt 2026-10-28, the stage inspector: World 3's last stage before the lair goes up the trunks to fight on the
    // branches and passes the sleeping vines again, where 3-3 fights on the limestone shelves: two different fights, not one twice.)
    // (The variety pass, 2026-10-28: versions of each section picked by the roll (w3Sections.ts); real jumps over the stream; a hop just
    // past the ring, where every roll had a 5 s quiet walk.)
    const v = W3P!;
    const placed = () => E.filter((e) => e.type === 'ocelot' || e.type === 'jaguar').length;
    beat('Start', () => {
      const x0 = x;
      rest(R.r(420, 480));
      prints(x0 + 200, x - 80);
      hint(x0 + 120, 'Pawprints in a circle, and they all go one way...');
      w3Start(v.start);
      flag();
    });
    beat('Learn: two at once', () => {
      hint(x - 200, 'Two prowlers! Keep one in front of you');
      // (hops and stones after the tip, before the prowlers: see 3-3's)
      busy(2, ['log', 'dip'], R.r(200, 240));
      w3Stones([50, 90, 60], [0.5, 0.6]);
      rest(R.r(160, 200));
      prowlFloor(['ocelot', 'ocelot']);
      busy(1);
      if (v.learn === 0) prowlTree();
      else { w3Stones([50, 100, 70], [0.5, 0.6]); prowlTree(); }
      flag();
    });
    beat('Develop: the jaguar, the vines and the dark', () => {
      prowlFloor(['jaguar', 'ocelot']);
      flag();
      if (v.develop === 0) { prowlTree(); flag(); w3Vines(); prowlTree(); }
      else if (v.develop === 1) { glowDark(R.r(1150, 1300), 1, { rocks: true }); vineRow(2, [4.4, 5.2], [380, 440]); flag(); vineRow(2, [4.4, 5.2], [380, 440], true, true); }
      else { deepRun(4, 1); prowlFloor(['ocelot']); flag(); deepRun(3, 1); vineRow(2, [4.4, 5.2], [380, 440], true, true); }
      flag();
    });
    beat('Twist: the ring', () => {
      if (v.twist === 1) { prowlTree(); flag(); }
      else if (v.twist === 2) { glowDark(R.r(1000, 1100), 1, { rocks: true }); flag(); }
      hint(x + 60, 'The ring! They will come out of the dark. Drive them all off to open the way');
      prowlerRing();
      // (out of the ring, a hop and a dip straight away: the walk on from the broken pillar was five quiet seconds on every roll)
      busy(2, ['log', 'dip'], R.r(230, 270));
      flag();
    });
    beat('Finish', () => {
      const kits: Array<Array<() => void>> = [
        [() => { prowlTree(); prowlTree(); }, () => { w3Vines(); prowlTree(); }, () => { prowlTree(); prowlFloor(['ocelot']); }],
        [() => { deepRun(4, 1); prowlFloor(['ocelot', 'ocelot']); }, () => { prowlFloor([R.chance(0.4) ? 'jaguar' : 'ocelot', 'ocelot', 'ocelot']); deepRun(3, 1); }, () => deepRun(5, 2)],
        [() => { glowDark(R.r(1150, 1300), 1, { rocks: true }); prowlFloor(['ocelot', 'ocelot']); }, () => { vineRow(3, [4, 4.8], [360, 430], true, true); prowlFloor(['ocelot']); }, () => { sporeRest(R.r(440, 500)); sporeGap(true); prowlFloor([R.chance(0.4) ? 'jaguar' : 'ocelot', 'ocelot']); }],
      ];
      w3Finish(EXPERT_SECONDS + 16, kits[v.finish], 2, () => placed() < Math.ceil(PROWLER_GOAL_39 * 1.4));
      w3Climax();
      homeRun();
    });
  }

  // ======================================================================================================================
  // World 4, the Mist Cascades (2026-10-25): the leaf, and the wind. Gusts blow on a beat (zones.ts), and bamboo chimes on posts beside
  // each gust lane ring and swing the way the next gust will blow while it warns (w4Kit.ts chimeLean): read them, and jump with the
  // wind behind you or wait for it to drop. The leaf is taught here (learned on clearing 4-1) but no drop needs it before 4-7.
  const W4C: Chime[] = [];
  /** a gust lane over [x0, x1] (`dir` +1: behind him, -1: into his face), with its chimes on a post at `chimeX` */
  /**
   * World 4's soft pit with a stepped floor (softPit's walls and its step out at the far wall): the mossy floor rises a low step at each
   * of `cuts`, so a walk along it (a slip off a vine, a glide that drops short) is a hop up or two, not three to five quiet seconds to
   * the far wall (2026-10-28, the 200-roll tool: the route walks these floors where a player swings or glides over them)
   */
  const steppedPit = (edge: number, farX: number, cuts: number[]) => {
    const wallTop = G + BANK_H;
    P.push({ id: pid++, x: edge - 60, y: wallTop, width: 60, height: HOLLOW_Y - wallTop + 4, type: 'solid', style: 'moss_stone', soil: true });
    P.push({ id: pid++, x: farX, y: wallTop, width: 60, height: HOLLOW_Y - wallTop + 4, type: 'solid', style: 'moss_stone', soil: true });
    const xs = [edge - 60, ...cuts, farX + 60];
    // (up a step and down again in turn, so a long pit's floor never climbs toward the bank)
    let fy = HOLLOW_Y;
    for (let k = 0; k + 1 < xs.length; k++) {
      fy = k % 2 ? HOLLOW_Y - 30 : HOLLOW_Y;
      bank(xs[k], xs[k + 1], fy, 'moss_stone');
    }
    P.push({ id: pid++, x: farX - 70, y: fy - PIT_STEP, width: 70, height: PIT_STEP, type: 'solid', style: 'moss_stone', soil: true });
  };
  const gustZone = (x0: number, x1: number, dir: 1 | -1, chimeX: number, force = 120) => {
    GZ.push({ kind: 'wind', x0: Math.round(x0), x1: Math.round(x1), top: G - 560, bottom: G + 40, baseY: G, dir, period: 2.8 + 1.4 + 2.2, warn: 1.4, active: 2.2, force, offset: Math.round(R.r(0, 6.4) * 10) / 10 });
    W4C.push({ x: Math.round(chimeX), y: G, zone: GZ.length - 1 });
  };
  /**
   * the leaf, taught: up a trunk to a perch that ends at the edge of a soft pit, and a gap a double jump still crosses (from the perch
   * or from the ground: the leaf makes it easy, it is never needed). Petals trail down the way the leaf drifts.
   */
  function leafDrop(share: number, back = false) {
    const x0 = x;
    // (2026-10-28, the stage inspector: a shorter walk in and out, the breath between pieces is w4Breath's)
    // (round 5: 220-260 to 170-200, and a shorter walk on: the leaf flavour's finish was a fifth quiet)
    run(R.r(170, 200));
    const tX = x - 130;
    const perchY = Math.round(G - R.r(230, 270));
    trunk(tX, G, perchY);
    branch(tX - 40, x, perchY);
    for (let i = 0; i < 3; i++) flower(tX, G - 70 - i * 55, 'hibiscus');
    const edge = x;
    close();
    const gap = Math.round(reachJump(0, true) * share);
    const far = edge + gap;
    if (back) softPit(edge, far);
    else steppedPit(edge, far, [Math.round(edge + gap / 2)]);
    // `back` (the lesson's drops): a step at the near wall too, so a glide that falls short is two hops back up and the trunk again, a
    // few seconds, not a wall only the second jump climbs (QA, 2026-10-26: a short flick dropped a tester in 4-2's first pit, 6 tries out)
    if (back) P.push({ id: pid++, x: edge, y: HOLLOW_Y - PIT_STEP, width: BACK_STEP, height: PIT_STEP, type: 'solid', style: 'moss_stone', soil: true });
    for (let i = 1; i <= 4; i++) {
      const u = i / 5;
      flower(Math.round(edge + gap * u), Math.round(perchY - 10 + (G - 70 - perchY) * u * u), 'orchid');
    }
    open(far);
    run(R.r(110, 140));
    expert += (tX - x0) / RUN + (G - perchY) / CLIMB + 1.2 + (x - edge) / RUN;
    pieces.push({ k: 'canopy', x0, x1: x });
  }
  /**
   * a gap with a gust lane over it. Behind him (+1): a plain jump crosses it, and with the gust a glide carries far out to petals only
   * the wind reaches. Into his face (-1): small enough that the double jump still makes it in the gust (levelCheck), easy in the calm.
   */
  function gustGap(dir: 1 | -1) {
    const x0 = x;
    run(R.r(250, 290));
    const edge = x;
    close();
    const one = reachJump(0, false);
    // (the level check keeps every gap under a gust within a safe plain jump, and a headwind's within the double jump)
    const gap = Math.round(dir > 0 ? Math.min(one * R.r(0.68, 0.74), SAFE.gap1 - 12) : Math.min(one * 0.6, SAFE.gap2 - 120 * 0.7 - 40));
    const far = edge + gap;
    softPit(edge, far);
    if (dir > 0) arc(edge + 20, far + 140, G - 175, 5, 'hibiscus');
    else flower(edge + gap / 2, G - 110, 'orchid');
    open(far);
    run(R.r(220, 260));
    gustZone(edge - 170, far + 110, dir, edge - 120);
    expert += (x - x0) / RUN + (dir < 0 ? 3.2 : 1.2);
    pieces.push({ k: 'rest', x0, x1: x });
  }

  /**
   * the secret: a tall trunk to a perch 400 px up, and out past its end a little ledge with a golden seed, too far for any jump and too
   * high to reach from the ground: only the leaf drifts that far. The ground runs on underneath, so a try costs nothing.
   */
  function leafSecret() {
    const x0 = x;
    run(R.r(300, 360));
    const tX = x - 140;
    const perchY = G - 400;
    trunk(tX, G, perchY);
    const perch = branch(tX - 40, tX + 170, perchY);
    row(perch.x + 70, perch.x + perch.width - 30, perchY - 34, 2, 'hibiscus');
    const drop = 160;
    const lx = Math.round(perch.x + perch.width + reachJump(-drop, true) * 1.08);
    branch(lx, lx + 130, perchY + drop);
    goldenSeed(lx + 25, perchY + drop - 34);
    hint(x0 + 40, 'Something shiny, far out from the top of that tree...');
    // the ground runs on underneath: dips of soft moss along it, for the way on (it was five quiet seconds, the stage inspector)
    const end = lx + 130 + 260;
    run(R.r(150, 190));
    dip();
    while (end - x > 420) {
      run(R.r(220, 270));
      dip();
    }
    x = Math.max(x, end);
    expert += (tX - x0) / RUN + (x - tX) / RUN;
    pieces.push({ k: 'rest', x0, x1: x });
  }

  /**
   * the leaf on the wind (4-2's second twist): up a trunk to a high perch at the edge of a soft pit, and a gust lane behind him out over
   * the pit and the far bank, its chimes on the end of the perch. The lane stops just above the ground (nothing he stands on is in it but
   * the perch's end, so no gust shoves him along a bank): it is the air the leaf drifts through. Open the leaf as the chimes swing his way
   * and the gust carries it far out along the petals; in the calm the leaf, or the second jump, still crosses (the pit is leafDrop's).
   */
  function gustLeaf() {
    const x0 = x;
    run(R.r(250, 290));
    const tX = x - 150;
    const perchY = Math.round(G - R.r(260, 290));
    trunk(tX, G, perchY);
    branch(tX - 40, x, perchY);
    for (let i = 0; i < 3; i++) flower(tX, G - 70 - i * 55, 'hibiscus');
    const edge = x;
    close();
    const gap = Math.round(reachJump(0, true) * R.r(0.78, 0.86));
    const far = edge + gap;
    steppedPit(edge, far, [Math.round((edge + far) / 2)]);
    // the petals ride the wind: two just off the perch, then a long high line out over the far bank, where the gust carries the leaf
    // (each one a double jump from the bank, so the wind and the leaf are never needed for them)
    for (let i = 1; i <= 2; i++) flower(edge + 70 * i, perchY + 12 * i, 'orchid');
    for (let i = 0; i < 4; i++) flower(Math.round(far - 60 + 150 * i), Math.round(G - 185 + 7 * i), 'orchid');
    GZ.push({ kind: 'wind', x0: edge - 20, x1: far + 420, top: G - 600, bottom: G - 24, baseY: G, dir: 1, period: 2.8 + 1.4 + 2.2, warn: 1.4, active: 2.2, force: 120, offset: Math.round(R.r(0, 6.4) * 10) / 10 });
    W4C.push({ x: edge - 12, y: perchY, zone: GZ.length - 1 });
    open(far);
    // (the walk on under the high wind: a dip of soft moss in it, nothing standing up into the wind)
    run(R.r(170, 210));
    dip();
    run(R.r(230, 270));
    expert += (tX - x0) / RUN + (G - perchY) / CLIMB + 1.6 + (x - edge) / RUN;
    pieces.push({ k: 'canopy', x0, x1: x });
  }

  /**
   * the wind turns (4-2's second twist): stepping stones over a soft pit under two gust lanes, the first behind him and the second in his
   * face. The first lane's chimes stand on the bank; the second's on the broad stone in the middle, where the wind turns. Each gap keeps
   * the gust rules (a plain jump with the wind behind, the double jump into it), so he hops with the first gust, then waits on the broad
   * stone for the second to drop.
   */
  function turnStones() {
    const x0 = x;
    run(R.r(250, 290));
    const edge = x;
    close();
    const one = reachJump(0, false);
    const tail = () => Math.round(Math.min(one * R.r(0.6, 0.68), SAFE.gap1 - 12));
    const head = () => Math.round(Math.min(one * R.r(0.5, 0.55), SAFE.gap2 - 120 * 0.7 - 40));
    const stones: Platform[] = [];
    const stone = (gap: number, h: number, w: number) => {
      const last = stones[stones.length - 1];
      const sx = (last ? last.x + last.width : edge) + gap;
      const p: Platform = { id: pid++, x: sx, y: G - h, width: w, height: HOLLOW_Y - (G - h) + 10, type: 'solid', style: 'moss_stone' };
      P.push(p);
      stones.push(p);
      flower(sx + w / 2, G - h - 34, 'orchid');
      return p;
    };
    // (the two stones before the turn 140-170 to 230-260 wide too, round 3: the same running-jump overshoot, 33-67 ms windows)
    stone(tail(), Math.round(R.r(45, 65)), Math.round(R.r(230, 260)));
    stone(tail(), Math.round(R.r(70, 95)), Math.round(R.r(230, 260)));
    const mid = stone(tail(), Math.round(R.r(60, 85)), Math.round(R.r(230, 270)));
    // (the two stones into the turned wind 130-160 to 230-260 wide, 2026-10-28: a running jump off the broad stone overshot a narrow one
    // unless it was pressed within 33-100 ms, the first-timer bot; wide enough now to land a plain running jump on)
    stone(head(), Math.round(R.r(80, 105)), Math.round(R.r(230, 260)));
    stone(head(), Math.round(R.r(50, 75)), Math.round(R.r(230, 260)));
    const lastS = stones[stones.length - 1];
    const far = lastS.x + lastS.width + head();
    // (a stepped floor under the stones, round 3: the route walked the plain floor under them, 1900 px and seven quiet seconds)
    steppedPit(edge, far, stones.map((q) => Math.round(q.x + q.width / 2)));
    pitFloors(edge, stones, far);
    const turn = Math.round(mid.x + mid.width * 0.45);
    gustZone(edge - 170, turn, 1, edge - 120);
    gustZone(turn, far + 110, -1, turn + 30);
    W4C[W4C.length - 1].y = mid.y;
    open(far);
    run(R.r(220, 260));
    expert += (x - x0) / RUN + 0.6 * stones.length + 1.2 + 3.2;
    pieces.push({ k: 'stumps', x0, x1: x });
  }

  /**
   * World 4's open ground between two pieces (2026-10-28, the stage inspector): a hop over a mossy rock or a dip of soft moss a moment
   * out, then plain ground a breath long. (The old 220-380 px of empty path either side of every piece was three to five quiet seconds.)
   */
  // (4-4's crosswind and Dot's knots, declared ahead of 4-2, 4-5 and 4-8, whose flavours use them too)
  /** Dot's knots (w4Kit.ts DotKnot) and the rocks coming loose over a landing (rockfall.ts) */
  const W4K: DotKnot[] = [];
  const W4R: RockDrop[] = [];
  /** how hard a crosswind gust blows (px/s; the level check allows up to 160) */
  const CROSS = 140;
  /** the stage's very first gust lane blows softer (over its mossy floor), while he learns when to let go */
  const FIRST_GUST = 110;
  /**
   * where a knotted vine ends while it is tied (w4Play.ts tiedBottom): its knot, low enough to be on screen above him while he waits
   * there, and well out of reach of any jump (his hands would need to come within 30 px of it, and the double jump stops 35 short)
   */
  const KNOT_Y = Math.round(G - RISE - 66);
  /** the spot where he waits for Dot ends this far short of the bank's edge (px): more than his body, so a step past it is still safe */
  const KNOT_EDGE = 40;
  /** and the knotted vine hangs this far (to 10 more) back from the edge, so the spot between them is wider than he is */
  const KNOT_BACK = 112;
  /**
   * the roll's ground between World 4's pieces (w4Sections.ts, the variety pass 2026-10-28): mossy rocks and dips to hop, or wide gaps
   * of soft moss for the second jump (a miss is a hop back out, never a life). Rolls that differ in this differ all
   * through the stage, not only in one section.
   */
  const w4Fill = new W4Roll(seed, `${plan}/fill`).theme('fill', ['hops', 'leaps'] as const);
  const W4_FILL: Record<typeof w4Fill, ReadonlyArray<'log' | 'dip' | 'leap'>> = { hops: ['log', 'dip'], leaps: ['leap'] };
  const w4Breath = (restAfter = R.r(250, 290)) => busy(1, W4_FILL[w4Fill], restAfter);
  /**
   * World 4's swings over a real drop (round 2 of the variety pass, 2026-10-28): `n` lianas, each alone over its own gap from bank to
   * bank (the level check follows a swing from a ledge to a ledge, not from vine to vine), with a crosswind over each when `wind` (4-4's
   * gusts, from 4-5 on). A miss is a life: World 4 asks more than World 3 here.
   */
  let swingWindSaid = plan === '4-4';
  const swings = (n: number, wind = false) => {
    // (the first windy swing of a stage says what its chimes mean: 4-4's own line)
    if (wind && !swingWindSaid) hint(x + 40, 'The chimes swing the way the wind will blow. Let go when they swing your way, and the wind carries you over');
    if (wind) swingWindSaid = true;
    for (let k = 0; k < n; k++) {
      windChain(1, R.chance(0.5) ? 1 : -1, false, false, CROSS, !wind);
    }
  };

  if (plan === '4-2') {
    // 4-2 First Glide: learn the leaf over soft moss, then the chimes and the gusts behind him, then the twist: gusts into his face,
    // waited out. A canopy road with a seed only the leaf reaches (the secret). Open the leaf and drift across the falls to the shrine.
    // (2026-10-28, the stage inspector: 88 s of 4-2's 177 were quiet walking. Now a short start, a hop or a dip and a breath between the
    // pieces, the high road's floor busy too, and a short run home; the finish adds pieces until it is three minutes long again)
    beat('Start: the falls', () => {
      rest(R.r(300, 340));
      hint(x - 200, 'Across the falls to the shrine!');
      busy(2, ['log', 'dip'], R.r(230, 270));
      flag();
    });
    beat('Learn: the leaf', () => {
      hint(x + 40, 'Your leaf! Flick up, then keep your thumb on the glass as you fall', 'Your leaf! Hold Jump as you fall', 'Your leaf! Hold Space as you fall');
      leafDrop(0.72, true);
      w4Breath();
      leafDrop(0.86, true);
      flag();
    });
    // (the variety pass, round 2, 2026-10-28: a flavour from the roll that carries through the whole stage, w4Sections.ts. After the
    // chimes, after the headwind and after the second twist comes one of its own pieces, and its finish leans to it: the leaf (a climb
    // and a drop, again and again), the gusts, or the vines (a chain of lianas over a drop, World 1's swing over a real fall: a miss
    // costs a life, so World 4 asks more than World 3 here)
    const roll = new W4Roll(seed, '4-2');
    const flavour = roll.theme('finish', ['leaf', 'gusts', 'vines', 'ground'] as const);
    // (round 5, 2026-10-28: each flavour's own pieces only, two at each break: a windy liana at every break in every flavour, round 3,
    // made the rolls alike again. The vines' lianas are over a real drop: a miss is a life; the others' misses are soft moss)
    const sig = () => {
      for (let k = 0; k < 2; k++) {
        if (flavour === 'leaf') (k ? () => busy(2, W4_FILL[w4Fill], R.r(160, 200)) : () => leafDrop(R.r(0.8, 0.88)))();
        else if (flavour === 'gusts') (k ? turnStones : () => gustGap(R.chance(0.5) ? 1 : -1))();
        else if (flavour === 'vines') swings(2);
        else (k ? highRoadOver : () => busy(3, W4_FILL[w4Fill], R.r(200, 240)))();
        w4Breath();
      }
    };
    beat('Develop: the chimes', () => {
      hint(x + 40, 'Hear the chimes? They ring before the wind blows. Jump with it behind you');
      gustGap(1);
      w4Breath();
      gustGap(1);
      flag();
      sig();
    });
    beat('Twist: into the wind', () => {
      hint(x + 40, 'The chimes swing back at you: the wind will blow against you. Wait for it to drop');
      gustGap(-1);
      w4Breath();
      gustGap(-1);
      w4Breath();
      leafSecret();
      flag();
      sig();
    });
    // (2026-10-28, the variety pass: 200 rolls of 4-2 were 94% alike. The second twist's two crossings come in either order, and the
    // finish draws from a bag leaning to the roll's theme, the leaf, the gusts or the stones and branches, w4Sections.ts)
    const twist2 = roll.pick(['leafFirst', 'stonesFirst'] as const);
    beat('Twist again: the wind turns', () => {
      // the leaf and the gusts together: a high wind that carries the leaf far, then a crossing where the wind turns halfway over
      const high = () => {
        hint(x + 40, 'Wind up high! Open your leaf as the chimes swing your way, and ride it far');
        gustLeaf();
        w4Breath();
        flag();
      };
      const turn = () => {
        hint(x + 40, 'The wind turns halfway across! The chimes on the big stone tell you the second gust');
        turnStones();
        w4Breath();
      };
      if (twist2 === 'leafFirst') { high(); turn(); gustLeaf(); }
      else { turn(); flag(); high(); gustLeaf(); w4Breath(); }
      flag();
      sig();
    });
    type Piece42 = 'drop' | 'gust' | 'pillars' | 'high' | 'stones' | 'gustLeaf' | 'vines';
    const counts: Record<typeof flavour, Record<Piece42, number>> = {
      leaf: { drop: 3, gust: 0, pillars: 2, high: 0, stones: 0, gustLeaf: 1, vines: 0 },
      gusts: { drop: 0, gust: 3, pillars: 0, high: 0, stones: 2, gustLeaf: 0, vines: 0 },
      vines: { drop: 0, gust: 0, pillars: 1, high: 0, stones: 0, gustLeaf: 0, vines: 4 },
      ground: { drop: 0, gust: 0, pillars: 3, high: 2, stones: 0, gustLeaf: 0, vines: 0 },
    };
    const bag = roll.bag<Piece42>(['drop', 'gust', 'pillars', 'high', 'stones', 'gustLeaf', 'vines'], (k) => counts[flavour][k]);
    beat('Finish', () => {
      // 4-2 runs three minutes (STAGE_SECONDS); the run home (two hops and the shrine, about 4 s) closes it
      let n = 0;
      while (expert + 4.2 < stageSeconds('4-2') && n < 40) {
        const k = bag.draw()!;
        if (k === 'drop') leafDrop(R.r(0.78, 0.88));
        else if (k === 'gust') gustGap(R.chance(0.5) ? 1 : -1);
        else if (k === 'pillars') busy(3, W4_FILL[w4Fill], R.r(200, 240));
        else if (k === 'high') highRoadOver();
        else if (k === 'stones') turnStones();
        else if (k === 'vines') swings(R.i(2, 3));
        else gustLeaf();
        w4Breath();
        n++;
        if (n % 3 === 0) flag();
      }
      homeRun();
    });
  }

  // 4-5 The Sovereign's Dive (2026-10-25): the Sky Sovereign herself hunts along the foot of the cliffs, the way the eagle did in 1-7
  // (watcher.ts: calm, a scream and her shadow at the edge, then the sweep). Hide from her the old way, crouched in a bush, or the World
  // 4 way: stand behind a curtain of water pouring off the cliff (waterfalls.ts `veil`; the engine counts it as hidden). Capuchin
  // lookouts sit on the path watching the stretch ahead of them: seen in the open, one stares, then screeches and brings her pass early.
  // Punch the fruit down from the tree before its stretch and it goes off to eat (capuchin.ts), and sees nothing while it eats.
  const W4X: W4Extras = {};
  if (plan === '4-5') {
    /** the roll's section versions (w4Sections.ts) */
    const roll = new W4Roll(seed, '4-5');
    const FALLS4: Waterfall[] = (W4X.falls = []);
    const MONKEYS: Capuchin[] = (W4X.monkeys = []);
    const FRUIT: FruitTree[] = (W4X.fruit = []);
    /** a curtain's width: room for him to stand inside it with a step to spare either side */
    const VEIL_W = 140;
    /** the fruit hangs this high (a standing punch knocks it down: w4Play reaches 70 px from his fist) */
    const FRUIT_Y = G - 85;
    /** a curtain of water centred on cx, from far above the view down onto the path */
    const veil = (cx: number) => FALLS4.push({ id: FALLS4.length + 1, x: Math.round(cx - VEIL_W / 2), width: VEIL_W, top: G - 1100, bottom: G, veil: true });
    type Cover = Bush['kind'] | 'fall';
    /** a place to hide, centred on the cursor */
    const cover = (kind: Cover) => (kind === 'fall' ? veil(x) : bush(x - BUSH_W[kind] / 2, kind));
    /** the opening stretches under her eye, where her first strike comes: cover close all along (hopRun, LV-13) */
    let dense = false;
    let denseKind: Cover = 'fern';
    let lookoutFern = false;
    /**
     * a bush at the end of her stretch: a pass that starts as he leaves it sweeps on past its end, and with the last cover 500-1200 px
     * back it caught him in the open (2026-10-28, the first-timer bot: first strikes at 27-173 s)
     */
    const endCover = () => {
      cover(R.pick(['tall', 'fern'] as const));
      run(R.r(90, 120));
    };
    /**
     * `len` px of the cliff path with a mossy rock or a dip of soft moss every 300 px or so, about halfway between two places to hide
     * (2026-10-28, the stage inspector: the runs between the cover were up to twelve quiet seconds). Nothing here is tall enough to hide
     * behind, and none of it slows a run between two hiding places by more than a moment.
     */
    function hopRun(len: number) {
      const end = x + len;
      if (dense) {
        // (LV-13: under her eye a rock to hop and a fern just past it, about every 330 px, so no spot of a hop run is more
        // than about 100 px from a place to hide when her first strike comes; QA: 11 hurts at "Hide from the eagle" since 2026-10-26,
        // and the first-timer's first strike landed 194-215 px from the nearest bush on every seed)
        // (spread evenly over the stretch, each fern's rock just before it: n of them, about one each 330 px)
        const x0 = x;
        const len = end - x0;
        const n = Math.max(1, Math.round(len / 330) - 1);
        for (let i = 1; i <= n; i++) {
          const k: Cover = lookoutFern ? 'fern' : denseKind;
          const cw = k === 'fall' ? VEIL_W : BUSH_W[k];
          const mid = x0 + (len * i) / (n + 1);
          const rockAt = mid - cw / 2 - 12 - 96;
          if (rockAt > x) run(rockAt - x);
          const ra = x;
          logHop();
          // (a petal of the stretch's row that the rock now stands on goes: the rock carries its own on top)
          for (let j = C.length - 1; j >= 0; j--) if (C[j].type === 'flower' && C[j].y > G - 50 && C[j].x > ra - 24 && C[j].x < x + 24) C.splice(j, 1);
          // (the kind of cover the row teaches: a curtain of water in the waterfall row, so the water is still what hides him there; on
          // the flat just past the rock, clear of it, so it reads as growing there and hides him on the ground)
          if (mid > x) run(mid - x);
          cover(k);
        }
        if (x < end) run(end - x);
        return;
      }
      let k = Math.floor(len / 300);
      while (k-- > 0) {
        run(Math.max(70, (end - x) / (k + 2) - 60));
        // (only rocks under her eye, 2026-10-28: down in a dip or a leap's pit no bush is at his level, and her pass caught him there;
        // the dips and leaps stay out of her sight, in the breaths between her stretches)
        logHop();
      }
      if (x < end) run(end - x);
    }
    /** cover along the ground `gap` apart (a run, a place to hide, a run...), petals between, under her watch */
    function coverRow(n: number, gap: [number, number], kinds: Cover[], calm: [number, number]) {
      const x0 = x;
      for (let k = 0; k < n; k++) {
        const g = R.r(gap[0], gap[1]);
        if (k > 0) row(x + 80, x + g - 80, G - 34, Math.max(1, Math.round(g / 260)), 'orchid');
        denseKind = kinds[k % kinds.length];
        if (k > 0) hopRun(g);
        // (the first place to hide is a short run into the row: her first pass can come as he walks in, 2026-10-28)
        else run(Math.min(g, R.r(160, 220)));
        cover(kinds[k % kinds.length]);
      }
      // (a hop on the way out of the row: from its last cover to the next piece's first hop was three quiet seconds, 2026-10-28)
      hopRun(R.r(300, 360));
      endCover();
      ZONES.push({ x0, x1: x, calm });
      expert += watched(x - x0, (calm[0] + calm[1]) / 2);
      pieces.push({ k: 'rest', x0, x1: x });
    }
    /** a lookout sitting on the path at mx, watching sx0..x1, and its fruit tree (`trunk` 1: the trunk stands right of the fruit) */
    function lookout(sx0: number, mx: number, x1: number, fruitX: number, trunk?: 1) {
      MONKEYS.push({ job: 'lookout', x: Math.round(mx), y: G, x0: Math.round(sx0), x1: Math.round(x1) });
      FRUIT.push({ x: Math.round(fruitX), y: FRUIT_Y, ground: G, ...(trunk ? { trunk } : {}) });
    }
    /**
     * a lookout on the path, watching the stretch ahead of it (to at most 1150 px past it: w4Play steps monkeys within 1200 px of him),
     * with cover along the stretch for her passes. Its fruit tree stands just short of the stretch: punch the fruit down from there and
     * it walks back to eat.
     */
    function lookoutRun(kinds: Cover[], gap: [number, number], calm: [number, number]) {
      const x0 = x;
      // (on a lookout's stretch the extra cover is a fern, never a curtain: a curtain hides him from the lookout too, and its fruit
      // trick would be a choice; in a fern he is hidden only crouched and still, and the lookout sees him run on, LV-13)
      const wasFern = lookoutFern;
      lookoutFern = true;
      // a bush on the way in, short of the fruit tree: with it, no stretch of a lookout's run is more than ~700 px from a place to hide,
      // so her pass always has cover within the 2 s warning (2026-10-28, the first-timer: her first strike at ~23 s, cover 680-1490 px off)
      run(R.r(110, 150));
      cover(R.pick(['tall', 'fern'] as const));
      run(R.r(130, 170));
      const tx = x;
      const sx0 = tx + 110;
      const mx = sx0 + R.r(40, 80);
      x = mx;
      for (const kind of kinds) {
        const g = R.r(gap[0], gap[1]);
        row(x + 80, x + g - 80, G - 34, Math.max(1, Math.round(g / 260)), 'orchid');
        hopRun(g);
        cover(kind);
      }
      hopRun(R.r(300, 340));
      lookout(sx0, mx, Math.min(x, mx + 1150), tx);
      run(R.r(100, 140));
      endCover();
      ZONES.push({ x0, x1: x, calm });
      expert += watched(x - x0, (calm[0] + calm[1]) / 2) + 1.5;
      pieces.push({ k: 'rest', x0, x1: x });
      lookoutFern = wasFern;
    }
    /**
     * two lookouts in a row: the first one's fruit is the old trick, and its stretch ends in a curtain of water. The second one's tree
     * stands just past that curtain, low enough to punch from inside the water, where neither of them (nor she) can see him.
     */
    function lookoutPair(calm: [number, number]) {
      const x0 = x;
      // (on a lookout's stretch the extra cover is a fern, never a curtain: a curtain hides him from the lookout too, and its fruit
      // trick would be a choice; in a fern he is hidden only crouched and still, and the lookout sees him run on, LV-13)
      const wasFern = lookoutFern;
      lookoutFern = true;
      // (a bush on the way in, as in lookoutRun)
      run(R.r(110, 150));
      cover(R.pick(['tall', 'fern'] as const));
      run(R.r(130, 170));
      const tA = x;
      const a0 = tA + 110;
      const mA = a0 + R.r(40, 80);
      x = mA;
      hopRun(R.r(360, 420));
      cover(R.pick(['tall', 'fern'] as const));
      row(x + 80, x + 300, G - 34, 2, 'orchid');
      hopRun(R.r(380, 440));
      const fx = x;
      veil(fx);
      lookout(a0, mA, fx, tA);
      // the second tree, just outside the water: from inside it, facing on, his fist reaches it (w4Play: 70 px)
      const tB = fx + VEIL_W / 2 + 15;
      const mB = tB + R.r(170, 210);
      x = mB;
      hopRun(R.r(360, 420));
      cover(R.pick(['fall', 'wide'] as const));
      hopRun(R.r(300, 360));
      lookout(fx + VEIL_W / 2, mB, Math.min(x, mB + 1150), tB, 1);
      run(R.r(160, 220));
      endCover();
      ZONES.push({ x0, x1: x, calm });
      expert += watched(x - x0, (calm[0] + calm[1]) / 2) + 3;
      pieces.push({ k: 'rest', x0, x1: x });
      lookoutFern = wasFern;
    }
    /**
     * the secret: one curtain hides a trunk in the hollow behind it, up to a branch path behind leaves with a golden seed at its end.
     * From outside it looks like any other curtain; climb up from inside the water.
     */
    function secretFall(calm: [number, number]) {
      const x0 = x;
      hopRun(R.r(380, 460));
      veil(x);
      const tX = Math.round(x);
      const perchY = Math.round(G - 160);
      trunk(tX, G, perchY);
      const end = tX + Math.round(R.r(360, 420));
      branch(tX - 40, end, perchY);
      row(tX + 90, end - 90, perchY - 34, 3, 'hibiscus');
      goldenSeed(end - 40, perchY - 34);
      covers.push({ x: tX + VEIL_W / 2, y: perchY - 90, w: end - tX - VEIL_W / 2 + 20, h: 110 });
      // (the path runs on under the branch: hops on it, clear of the trunk and the curtain, to a bush at the end of her stretch: from
      // the curtain to the next cover it was 1200 px, and her pass caught him in the open, 2026-10-28)
      run(R.r(120, 160));
      hopRun(R.r(400, 460));
      cover(R.pick(['tall', 'fern'] as const));
      run(R.r(120, 160));
      ZONES.push({ x0, x1: x, calm });
      expert += watched(x - x0, (calm[0] + calm[1]) / 2);
      pieces.push({ k: 'rest', x0, x1: x });
    }

    // (2026-10-28, the stage inspector: 77 s of 4-5's 116 were quiet, and a quick player was through in under two minutes. Now a
    // short start, hops and dips on the runs between the cover, a hop and a breath between the pieces, and more of the finish)
    beat('Start: the cliff path', () => {
      rest(R.r(300, 340));
      hint(x - 200, 'The Sky Sovereign is hunting along the cliffs. Stay under cover!');
      busy(2, ['log', 'dip'], R.r(230, 270));
      flag();
    });
    beat('Learn: under cover', () => {
      dense = true;
      hint(x + 20, 'Her shadow! Slide down inside a bush to hide', 'Her shadow! Hold down inside a bush to hide', 'Her shadow! Hold down inside a bush to hide');
      coverRow(3, [380, 460], ['tall', 'wide', 'fern'], [7.5, 9]);
      hint(x + 20, 'Stand behind a waterfall. She cannot see you through the water');
      coverRow(4, [400, 480], ['fall'], [7, 8.5]);
      flag();
    });
    // (2026-10-28, the variety pass: 200 rolls of 4-5 were 99.3% alike. The Develop and Twist each have versions, picked by the roll
    // through w4Sections.ts, and the Finish draws its pieces from a bag weighted to the roll's own theme: under cover, among the lookouts,
    // or the cliff's open climbs between them, the World 4 moves from 4-2 and 4-4 out of her sight)
    const lookTip = () => hint(x + 20, 'A monkey lookout! If it sees you, it calls her. Tap to punch the fruit down, and it will go and eat', 'A monkey lookout! If it sees you, it calls her. Press Punch to knock the fruit down, and it will go and eat', 'A monkey lookout! If it sees you, it calls her. Press J to knock the fruit down, and it will go and eat');
    /** out of her sight between two watched stretches: one of World 4's open-cliff pieces (all taught in 4-2), and a breath */
    const openCliff = (k: 'drop' | 'gust' | 'pillars' | 'high' | 'gorge') => {
      if (k === 'drop') leafDrop(R.r(0.74, 0.86));
      // (a crosswind gorge, from 4-4, out of her sight: a miss is a life)
      else if (k === 'gorge') swings(2, true);
      else if (k === 'gust') gustGap(R.chance(0.5) ? 1 : -1);
      // (not the shared pillars here, round 3: standing on one bank, the route walked through them, five to seven quiet seconds)
      else if (k === 'pillars') busy(3, W4_FILL[w4Fill], R.r(200, 240));
      else highRoadOver();
      w4Breath();
    };
    // (round 2, 2026-10-28: the finish's theme is a flavour for the whole stage: after the Develop and the Twist, out of her sight, one
    // of its own pieces, another row of cover under her eye, another lookout, or a crosswind gorge from 4-4)
    const flavour = roll.theme('finish', ['cover', 'lookouts', 'gorges', 'leaf'] as const);
    // (round 5, 2026-10-28: each flavour's own pieces only: a windy gorge at every break in every flavour, round 3, made the rolls alike
    // again. The gorges are out of her sight, over a real drop: a miss is a life; the leaf's drops are over soft moss)
    const sig = () => {
      if (flavour === 'cover') coverRow(3, [600, 720], R.shuffle<Cover>(['fall', 'wide', 'fern']), [5, 6]);
      else if (flavour === 'lookouts') lookoutRun(R.shuffle<Cover>(['fall', 'tall']), [400, 460], [5, 6]);
      else if (flavour === 'gorges') openCliff('gorge');
      else openCliff('drop');
      w4Breath();
    };
    const develop = roll.pick(['lookFirst', 'rowFirst', 'climbBetween'] as const);
    beat('Develop: the lookout', () => {
      if (develop === 'rowFirst') {
        coverRow(3, [560, 680], ['fall', 'fern', 'fall'], [5.5, 6.6]);
        w4Breath();
        lookTip();
        lookoutRun(['fall', 'wide'], [380, 440], [6, 7.5]);
      } else {
        lookTip();
        lookoutRun(['fall', 'wide'], [380, 440], [6, 7.5]);
        w4Breath();
        if (develop === 'climbBetween') openCliff(roll.pick(['drop', 'pillars'] as const));
        coverRow(3, [640, 780], ['fall', 'fern', 'fall'], [5, 6.2]);
      }
      flag();
      w4Breath();
      sig();
    });
    const twist = roll.pick(['pairFirst', 'secretFirst'] as const);
    beat('Twist: two lookouts', () => {
      const pair = () => {
        hint(x + 20, 'Two lookouts! Knock the second fruit down from behind the waterfall');
        lookoutPair([5, 6]);
      };
      if (twist === 'pairFirst') {
        pair();
        w4Breath();
        secretFall([5, 6]);
        // (World 4's hop ground, not the shared stumps on one bank: the route walked through them, round 3)
        busy(3, W4_FILL[w4Fill], R.r(200, 240));
      } else {
        secretFall([5, 6]);
        w4Breath();
        pair();
        w4Breath();
        busy(3, W4_FILL[w4Fill], R.r(200, 240));
      }
      flag();
      w4Breath();
      sig();
      flag();
    });
    type Piece45 = 'row' | 'look' | 'pair' | 'drop' | 'gust' | 'pillars' | 'high' | 'gorge';
    const counts: Record<typeof flavour, Record<Piece45, number>> = {
      cover: { row: 4, look: 0, pair: 1, drop: 0, gust: 0, pillars: 0, high: 0, gorge: 0 },
      lookouts: { row: 0, look: 3, pair: 2, drop: 0, gust: 0, pillars: 0, high: 0, gorge: 0 },
      gorges: { row: 1, look: 0, pair: 0, drop: 0, gust: 0, pillars: 0, high: 0, gorge: 4 },
      leaf: { row: 1, look: 0, pair: 0, drop: 3, gust: 0, pillars: 1, high: 1, gorge: 0 },
    };
    const bag = roll.bag<Piece45>(['row', 'look', 'pair', 'drop', 'gust', 'pillars', 'high', 'gorge'], (k) => counts[flavour][k]);
    beat('Finish', () => {
      let n = 0;
      // (the builder's watched-stretch estimate runs long: to two minutes for a quick player it reaches 4-5's own length and more)
      while (expert < stageSeconds('4-5') + 34 && n < 16) {
        const k = bag.draw()!;
        if (k === 'row') coverRow(3, [700, 860], R.shuffle<Cover>(['fall', 'wide', 'fall']), [4.6, 5.6]);
        else if (k === 'look') lookoutRun(R.shuffle<Cover>(['fall', 'tall']), [400, 460], [4.8, 5.8]);
        else if (k === 'pair') lookoutPair([4.6, 5.6]);
        else {
          openCliff(k);
          n++;
          continue;
        }
        w4Breath();
        n++;
        if (n % 2 === 0) flag();
      }
      homeRun();
    });
  }

  // ----- 4-4 Crosswind: lianas over the gorges, and gusts blowing across them -----
  /**
   * a crosswind gorge: a chain of lianas where every vine catches the next in the calm (chain()'s checks), with its first gap wide, and a
   * gust lane over the whole chain, its chimes on a post at the near edge. In the wide gap a plain leap in the calm falls about half the
   * time and the second jump always makes it; a gust behind him (`dir` +1) carries a plain leap over; a gust in his face (-1) pulls it
   * short, so he hangs on and lets it blow past (wind only pushes him in the air: on the vine he is safe). The gust behind is checked
   * too, so it never carries him past the next vine or the far bank. `soft`: a mossy floor under it (taught). `rock`: rocks come loose
   * over the far bank's landing, so he waits on the last vine for the shadow. `force`: the first gorge's gusts are gentler (FIRST_GUST)
   * while the timing is learned.
   */
  function windChain(n: number, dir: 1 | -1, soft: boolean, rock = false, force = CROSS, calm = false) {
    const x0 = x;
    run(R.r(200, 240));
    const edge = x;
    for (let tries = 0; tries < 16; tries++) {
      const easy = soft || tries > 8;
      const d0 = R.r(150, 175);
      const wide = easy ? R.r(375, 392) : R.r(388, 412);
      const sp = Array.from({ length: n - 1 }, (_, k) => (k === 0 ? wide : R.r(300, 330)));
      const d1 = R.r(200, 240);
      const xs = [edge + d0];
      for (const s of sp) xs.push(xs[xs.length - 1] + s);
      const farX = xs[n - 1] + d1;
      const tops = xs.map(() => (soft ? Math.round(R.r(190, 215)) : Math.round(R.r(150, 200))));
      const vs: Vine[] = xs.map((vx, k) => ({ id: -1 - k, x: vx, topY: tops[k], bottomY: Math.min(G + 30, tops[k] + 410), swaySpeed: 1.1, swayPhase: 0, vineType: 'swing_liana', isSwingingVine: true }));
      const far: Platform = { id: -99, x: farX, y: G, width: 400, height: BANK_H, type: 'solid' };
      let ok = jumpGrab(edge, G, vs[0]) >= 4;
      for (let k = 0; ok && k < n - 1; k++) {
        ok = catchWindow(vs[k], vs[k + 1]) > 0.6 && earlyCatch(vs[k], vs[k + 1]) && catchWindow(vs[k], vs[k + 1], force) > 0.6 && earlyCatch(vs[k], vs[k + 1], 0.5, force);
      }
      if (ok) ok = landWindow(n > 1 ? vs[n - 2] : null, vs[n - 1], far) >= 8 && landWindow(n > 1 ? vs[n - 2] : null, vs[n - 1], far, force) >= 8;
      if (!ok && tries < 15) continue;
      close();
      // (a soft pit whose floor rises a low step halfway along each gap between the vines: steppedPit)
      if (soft) steppedPit(edge, farX, xs.slice(0, -1).map((vx, k) => Math.round((vx + xs[k + 1]) / 2)));
      for (let k = 0; k < n; k++) {
        liana(xs[k], vs[k].topY, vs[k].bottomY);
        arc(k === 0 ? edge + 10 : (xs[k - 1] + xs[k]) / 2, k === n - 1 ? farX - 10 : (xs[k] + xs[k + 1]) / 2, Math.min(G - 150, vs[k].topY + 200), 4);
      }
      // the lane: from just behind the first vine (where the first leap starts) to just short of the far bank, so no ground stands in it
      // (`calm`: World 4's plain swings over a drop, `swings`: the same checked lianas with no gust lane)
      if (!calm) gustZone(xs[0] - 50, farX - 10, dir, edge - 80, force);
      open(farX);
      if (rock) {
        const rx = Math.round(farX + R.r(80, 110));
        const r: RockDrop = { x: rx, top: G - 470, land: G, every: Math.round(R.r(5, 5.6) * 10) / 10, warn: 1.4, offset: Math.round(R.r(0, 5) * 10) / 10 };
        if (rockFits(r)) W4R.push(r);
        run(R.r(380, 440));
        // (a shorter walk off the far bank: with the next piece's walk in, it was four quiet seconds, 2026-10-28)
      } else run(R.r(90, 130));
      expert += (edge - x0) / RUN + (farX - edge) / SWING + 0.3 * n + 2.4 + (rock ? 2 : 0) + (x - farX) / RUN;
      pieces.push({ k: soft ? 'hollow' : 'gorge', x0, x1: x });
      return;
    }
  }

  /**
   * Dot's knot: the gorge's first liana hangs over the end of the bank, tied up out of reach (it ends at its knot, w4Play.ts). Standing
   * still on its spot (glowing on the ground, w4Play.ts drawKnot), from the vine to a step short of the edge, sends Dot up to pick it
   * loose, and it drops down for him: a jump from under it grabs it, and the swing carries him out over the gorge; the rest of the chain is as chain() rolls it. No jump reaches the tied-up vine or the second one, so
   * the knot is the way across. In the calm: the knot is the lesson here. (He waits between the vine and the edge, so the knot and Dot
   * are a little left of him: in landscape that keeps them clear of the menu button at the top of the screen.)
   *
   * `dir` (4-4's second twist, the knot in the wind): a gust lane over the whole gorge, from just past the bank's end to just short of the
   * far bank, its chimes on the bank behind the knotted vine. The gap after the short second vine is the wide one (windChain's): with
   * the gust behind him a plain leap makes it, in his face it falls short, so he waits for Dot, then waits on the short vine for the
   * chimes. Every leap is checked with the gust behind as well as in the calm (it never carries him past a vine or the far bank).
   */
  function knotChain(n: number, dir?: 1 | -1) {
    const x0 = x;
    run(R.r(340, 380));
    const edge = x;
    const wind = dir ? CROSS : 0;
    for (let tries = 0; tries < (dir ? 24 : 14); tries++) {
      // (the knotted vine hangs well back from the edge, so the spot where he waits for Dot is a sloth's length short of the drop: a
      // player who walks a little past it is still on the bank, and no gust lane comes near it)
      const k0 = edge - R.r(KNOT_BACK, KNOT_BACK + 10);
      // the second vine is short and hangs from high up, far enough out that no jump from the bank reaches it (jumpReaches), and still
      // caught by every leap from the knotted vine
      const xs = [k0, k0 + R.r(383, 400)];
      for (let k = 2; k < n; k++) xs.push(xs[k - 1] + (dir && k === 2 ? R.r(378, 402) : R.r(300, 330)));
      const farX = xs[n - 1] + R.r(200, 240);
      const tops = xs.map((_, k) => Math.round(k === 0 ? R.r(148, 160) : R.r(140, 180)));
      const bottoms = xs.map((_, k) => (k === 0 ? G - 40 : k === 1 ? 370 : Math.min(G + 30, tops[k] + 410)));
      const vs: Vine[] = xs.map((vx, k) => ({ id: -1 - k, x: vx, topY: tops[k], bottomY: bottoms[k], swaySpeed: 1.1, swayPhase: 0, vineType: 'swing_liana', isSwingingVine: true }));
      const tied: Vine = { ...vs[0], bottomY: KNOT_Y };
      const far: Platform = { id: -99, x: farX, y: G, width: 400, height: BANK_H, type: 'solid' };
      // freed, a jump from the bank under it grabs it; tied up, no jump from anywhere on the bank does, nor to the second vine
      let ok = jumpGrab(xs[0] + 60, G, vs[0]) >= 6 && jumpGrab(edge - KNOT_EDGE, G, vs[0]) >= 4 && !jumpReaches(bankFrom, edge, G, tied) && !jumpReaches(bankFrom, edge + 15, G, vs[1]);
      for (let k = 0; ok && k < n - 1; k++) {
        ok = catchWindow(vs[k], vs[k + 1]) > 0.6 && earlyCatch(vs[k], vs[k + 1]);
        if (ok && dir) ok = catchWindow(vs[k], vs[k + 1], wind) > 0.6 && earlyCatch(vs[k], vs[k + 1], 0.5, wind);
      }
      if (ok) ok = landWindow(vs[n - 2], vs[n - 1], far) >= 8 && (!dir || landWindow(vs[n - 2], vs[n - 1], far, wind) >= 8);
      // in the wind, the wide gap is one the gust in his face really does pull short
      if (ok && dir) ok = catchWindow(vs[1], vs[2], -wind) < catchWindow(vs[1], vs[2]) - 0.3;
      if (!ok && tries < (dir ? 23 : 13)) continue;
      close();
      const lv = xs.map((vx, k) => liana(vx, vs[k].topY, vs[k].bottomY));
      for (let k = 1; k < n; k++) arc(k === 1 ? edge + 60 : (xs[k - 1] + xs[k]) / 2, k === n - 1 ? farX - 10 : (xs[k] + xs[k + 1]) / 2, Math.min(G - 150, vs[k].topY + 200), 4);
      W4K.push({ x: lv[0].x, y: KNOT_Y, x0: lv[0].x + 8, x1: edge - KNOT_EDGE, ground: G, releases: { kind: 'vine', id: lv[0].id } });
      // (the chimes stand behind the knotted vine, clear of the spot where he waits for Dot; the lane starts out over the gorge)
      if (dir) gustZone(edge + 40, farX - 10, dir, k0 - R.r(70, 90), CROSS);
      open(farX);
      run(R.r(140, 200));
      expert += (edge - x0) / RUN + 0.6 + 0.9 + 1.1 + 0.8 + (farX - edge) / SWING + 0.3 * n + (dir ? 2.4 : 0) + (x - farX) / RUN;
      pieces.push({ k: 'gorge', x0, x1: x });
      return;
    }
  }

  /**
   * the secret: another knot, over a quiet stretch of floor, and out past the end of its swing a branch higher than any jump from the
   * floor reaches, behind leaves, with a golden seed on it. Dot frees the vine, the vine's leap lands on the branch. The floor runs on
   * underneath, so nothing is lost by passing it by.
   */
  function knotSecret() {
    const x0 = x;
    run(R.r(320, 380));
    const kx = x;
    for (let tries = 0; tries < 12; tries++) {
      const top = Math.round(R.r(170, 210));
      const v: Vine = { id: -1, x: kx, topY: top, bottomY: G - 20, swaySpeed: 1.1, swayPhase: 0, vineType: 'swing_liana', isSwingingVine: true };
      // (a little lower than it was, 40-60 to 26-34 over a jump's reach, and nearer, round 3: the level check's swing reaches it now)
      const by = Math.round(G - RISE - R.r(26, 34));
      const bx = Math.round(kx + R.r(220, 260));
      const ledge: Platform = { id: -99, x: bx, y: by, width: 150, height: 24, type: 'solid' };
      if ((landWindow(null, v, ledge) < 8 || jumpReaches(kx - 420, kx + 420, G, { ...v, bottomY: KNOT_Y })) && tries < 11) continue;
      const lv = liana(kx, top, G - 20);
      // (a narrow dip of soft moss under the vine, round 3: the floor ends just short of it, so the level check sees the swing from
      // that edge to the branch and counts the seed as reachable; over one floor running on under the vine it never did. Dot's spot is
      // just past the dip, beside the vine, as before)
      x = kx - 30;
      dip(R.r(0.26, 0.28));
      W4K.push({ x: kx, y: KNOT_Y, x0: Math.max(kx + 30, x + 6), x1: Math.max(kx + 110, x + 70), ground: G, releases: { kind: 'vine', id: lv.id } });
      branch(bx, bx + 150, by);
      goldenSeed(bx + 95, by - 34);
      covers.push({ x: bx - 30, y: by - 90, w: 210, h: 120 });
      hint(kx - 260, 'Another vine tied up in the trees... what is it for?');
      // (a mossy rock on the floor under the branch, where the plain way on runs: past the vine it was four quiet seconds, 2026-10-28)
      x = Math.max(x, kx + R.r(380, 420));
      logHop();
      // (past the branch, a dip of soft moss on the floor, and a breath)
      x = Math.max(x, bx + 150 + 60);
      dip();
      run(R.r(220, 260));
      expert += (x - x0) / RUN;
      pieces.push({ k: 'rest', x0, x1: x });
      return;
    }
  }

  if (plan === '4-4') {
    // 4-4 Crosswind: swing the gorges while gusts blow across them. The chimes at each gorge's edge swing the way the next gust will
    // blow: let go with it behind you and it carries the leap over the wide gap; with it in your face, hang on until the wind dies down
    // (on the vine he is safe, the wind only pushes him in the air). In the calm the second jump always makes it. Then Dot's knot, a vine tied up
    // out of reach that she frees when he stands still under it, and rocks coming loose over a landing. A second knot hides the seed.
    // (2026-10-28, the stage inspector: a short start, and a hop or a dip and a breath between the gorges instead of empty path)
    // (2026-10-28, the variety pass: 200 rolls of 4-4 were 98% alike, and every roll opened on a 4.6-5.0 s quiet stretch. Now the
    // start has a third hop, and the Develop, the Twists and the Finish have versions the roll picks (w4Sections.ts): the gorges in a
    // different order, the knots on different gorges, and a finish that leans to the wind, to the knots, or to the open cliff of 4-2)
    const roll = new W4Roll(seed, '4-4');
    // (round 2, 2026-10-28: the finish's theme is a flavour for the whole stage. After the Develop and after each Twist comes one of its
    // pieces: another windy gorge, another of Dot's knots, or the leaf from 4-2, up a trunk and out over a drop)
    const flavour = roll.theme('finish', ['wind', 'knots', 'leaf'] as const);
    const sig = () => {
      if (flavour === 'wind') windChain(3, R.chance(0.5) ? 1 : -1, false);
      // (no wind over a knot before the second twist teaches the two together)
      else if (flavour === 'knots') knotChain(3);
      else { w4Breath(); leafDrop(R.r(0.8, 0.88)); }
      w4Breath();
    };
    beat('Start', () => {
      rest(R.r(260, 300));
      hint(x - 200, 'The wind blows across the gorges here. Listen for the chimes');
      busy(3, ['log', 'dip'], R.r(120, 150));
      flag();
    });
    beat('Learn: the wind behind you', () => {
      hint(x + 40, 'The chimes swing the way the wind will blow. Let go when they swing your way, and the wind carries you over');
      windChain(2, 1, true, false, FIRST_GUST);
      w4Breath();
      hint(x + 40, 'No wind? Then add your second jump as you fly', 'No wind? Then press Jump again as you fly', 'No wind? Then press Space again as you fly');
      windChain(2, 1, true);
      flag();
    });
    const develop = roll.pick(['knotLast', 'knotMiddle'] as const);
    beat('Develop: into the wind, and Dot\'s knot', () => {
      const headwind = () => {
        hint(x + 40, 'See the chimes swinging back at you? That wind will blow in your face. Hang on to your vine until the wind dies down, then let go');
        windChain(2, -1, true);
        w4Breath();
      };
      const knot = () => {
        hint(x + 60, KNOT_TEACH);
        knotChain(3);
        w4Breath();
      };
      headwind();
      flag();
      // (round 5: the gorge beside the knot is the flavour's own piece, not another windy gorge in every roll)
      // (the knots flavour's piece is a knot: it comes after the one Dot teaches)
      if (develop === 'knotLast' && flavour !== 'knots') {
        sig();
        knot();
      } else {
        knot();
        sig();
      }
      flag();
      sig();
    });
    const twist = roll.pick(['rocksFirst', 'pairFirst'] as const);
    beat('Twist: rocks on the landing', () => {
      const rocks = () => {
        hint(x + 40, 'Rocks fall on the next landing! Hang on until the shadow comes and the rock falls, then let go');
        windChain(3, R.chance(0.5) ? 1 : -1, false, true);
        // (the flag clear of the rocks)
        rest(R.r(200, 260));
        flag();
      };
      // two gorges back to back, the wind each way
      const pair = () => {
        if (flavour !== 'wind') { sig(); flag(); return; }
        const d = R.chance(0.5) ? 1 : -1;
        windChain(2, d, false);
        windChain(2, d > 0 ? -1 : 1, false);
        w4Breath();
        flag();
      };
      if (twist === 'rocksFirst') { rocks(); pair(); } else { pair(); rocks(); }
      sig();
    });
    const twist2 = roll.pick(['knotWind', 'rockWind'] as const);
    beat('Twist again: knots in the wind', () => {
      // what the stage taught, two at a time: Dot's knot over a gorge the gusts blow across (wait for Dot, then for the chimes), and
      // the wind in his face over a landing the rocks fall on (hang on through the gust and the rock both)
      const knotWind = () => {
        hint(x + 60, 'Another knot, and wind over the gorge! Stand still on the glowing spot while I untie it, about three seconds. Then let go when the chimes swing your way, and hang on while they swing back at you');
        knotChain(4, R.chance(0.5) ? 1 : -1);
        w4Breath();
        flag();
      };
      const rockWind = () => {
        hint(x + 40, 'Wind in your face and rocks on the landing: hang on for the gust and the rock both');
        windChain(3, -1, false, true);
        w4Breath();
        flag();
      };
      if (twist2 === 'knotWind') { knotWind(); rockWind(); } else { rockWind(); knotWind(); }
      // (round 5: the second knot in the wind is the knots flavour's own; the others go on with their flavour's piece)
      if (flavour === 'knots') knotChain(3, R.chance(0.5) ? 1 : -1);
      else sig();
      flag();
    });
    type Piece44 = 'wind' | 'long' | 'knot' | 'rocks' | 'gust' | 'pillars' | 'high' | 'stumps' | 'leaf';
    const counts: Record<typeof flavour, Record<Piece44, number>> = {
      wind: { wind: 2, long: 2, knot: 0, rocks: 1, gust: 0, pillars: 0, high: 0, stumps: 0, leaf: 0 },
      knots: { wind: 0, long: 0, knot: 3, rocks: 0, gust: 0, pillars: 0, high: 0, stumps: 0, leaf: 0 },
      // (no gust lane over open ground here: 4-4's gusts blow across the lianas only)
      leaf: { wind: 0, long: 0, knot: 0, rocks: 0, gust: 0, pillars: 1, high: 0, stumps: 0, leaf: 3 },
    };
    const bag = roll.bag<Piece44>(['wind', 'long', 'knot', 'rocks', 'gust', 'pillars', 'high', 'stumps', 'leaf'], (k) => counts[flavour][k]);
    beat('Finish', () => {
      // 4-4 runs 170 s (STAGE_SECONDS); the run home (two hops and the shrine, about 4 s) closes it. The secret knot comes second.
      // (the flavour's own piece first, out of the second twist's knots in the wind)
      sig();
      flag();
      let n = 0;
      while (expert + 4.2 < stageSeconds('4-4') && n < 30) {
        if (n === 1) knotSecret();
        else {
          const k = bag.draw()!;
          if (k === 'wind') windChain(R.i(2, 3), R.chance(0.5) ? 1 : -1, false);
          else if (k === 'long') windChain(4, R.chance(0.5) ? 1 : -1, false);
          else if (k === 'knot') { knotChain(3, R.chance(0.5) ? 1 : -1); w4Breath(); }
          else if (k === 'rocks') {
            windChain(3, R.chance(0.5) ? 1 : -1, false, true);
            // (a flag may follow: keep it clear of the rocks)
            rest(R.r(200, 260));
          } else if (k === 'gust') { gustGap(R.chance(0.5) ? 1 : -1); w4Breath(); }
          else if (k === 'pillars') { busy(3, W4_FILL[w4Fill], R.r(200, 240)); w4Breath(); }
          else if (k === 'high') { highRoadOver(); w4Breath(); }
          else if (k === 'leaf') { leafDrop(R.r(0.8, 0.88)); w4Breath(); }
          else { w4Breath(); busy(3, W4_FILL[w4Fill], R.r(200, 240)); }
        }
        n++;
        if (n % 2 === 0) flag();
      }
      // (a hop after the last gorge: off its far bank it was four quiet seconds to the run home's first hop)
      w4Breath();
      homeRun();
    });
  }

  // 4-8 Nests on the Cliff (2026-10-25): eaglet chicks caught in old netting on the cliff nests (w4Nests.ts). Two blows tear a
  // netting open (a 'cage', as in World 2); each nest is a small puzzle with a World 4 idea in it, each taught where it first comes:
  // a vine tied up out of reach that Dot unties (w4Kit.ts DotKnot), a fall pouring between him and the nest that a boulder rolled under
  // its spout stops (waterfalls.ts plug), a capuchin guard pacing the nest's ledge that a gust knocks over (capuchin.ts), and a branch
  // too far out for any jump that only the leaf reaches (needed from 4-7 on). The second twist puts two of them together. A freed
  // chick's parent swoops down and its wingbeats blow a tailwind along the stretch ahead for a few seconds. The forest floor runs
  // under everything: a miss is a climb back, never a life.
  if (plan === '4-8') {
    const KNOTS: DotKnot[] = (W4X.knots = []);
    const FALLS8: Waterfall[] = (W4X.falls = []);
    const GUARDS: Capuchin[] = (W4X.monkeys = []);
    const NESTS: CliffNest[] = (W4X.cliffNests = []);
    /** the seconds a quick player spends at a nest: two blows, and the parent's swoop */
    const FREE = 1.8;
    /** the seconds Dot takes, from standing still under a knot to the vine on the ground */
    const DOT = DOT_HELP.ask + DOT_HELP.fly + DOT_HELP.pick + 0.8;
    /** a chick in a nest at cx on platform pl (`also`: the second idea in a nest that needs two) */
    const nest = (cx: number, pl: Platform, kind: NestKind, also?: NestKind) => {
      const id = cid++;
      C.push({ id, type: 'cage', x: Math.round(cx), y: pl.y - 26, collected: false, bobPhase: 0, cageHp: 2, critter: 'eaglet' });
      NESTS.push({ cageId: id, kind, ...(also ? { also } : {}), platformId: pl.id, x: Math.round(cx), y: pl.y });
    };
    /** the way up to a ledge at y from the floor at x: a trunk, or (`rope`) a vine down the cliff tied up under its knot for Dot */
    const wayUp = (vx: number, y: number, rope: boolean) => {
      if (!rope) trunk(vx, G, y);
      else {
        const id = vid++;
        V.push({ id, x: vx, topY: y - 2, bottomY: G - 6, swaySpeed: 0.9, swayPhase: 0, vineType: 'tree_climb', rope: true });
        KNOTS.push({ x: vx, y: y + 16, x0: vx - 44, x1: vx + 44, ground: G, releases: { kind: 'vine', id } });
      }
      // (up the climb, the top one well under the ledge)
      for (let i = 0; i < 3; i++) flower(vx, Math.round(G - 80 - (i * (G - y - 140)) / 2), 'hibiscus');
      return (G - y) / CLIMB + (rope ? DOT : 0);
    };
    /** the plain one, to learn the netting on: a nest on a low rock by the path */
    function plainNest() {
      const x0 = x;
      run(R.r(220, 260));
      const rock = block(x, x + 180, 50);
      nest(x + 110, rock, 'plain');
      run(180 + R.r(150, 190));
      dip();
      run(R.r(240, 280));
      expert += (x - x0) / RUN + 0.5 + FREE;
      pieces.push({ k: 'cages', x0, x1: x });
    }
    /**
     * a ledge up the cliff, far higher than a jump, and a vine down from it tied up out of reach under its knot: stand still under it
     * and Dot flies up and unties it, and it drops to the ground. `high`: the nest is a hop further up, on a second ledge.
     */
    function knotNest(high: boolean) {
      const x0 = x;
      run(R.r(260, 300));
      const vx = Math.round(x);
      const y = Math.round(G - R.r(250, 265));
      const ledge = branch(vx - 40, vx + Math.round(R.r(260, 300)), y);
      expert += wayUp(vx, y, true);
      let top = ledge;
      if (high) {
        const rise = Math.round(R.r(90, 110));
        const gap = Math.round(reachJump(rise, false) * R.r(0.4, 0.5));
        const nx = ledge.x + ledge.width + gap;
        top = branch(nx, nx + Math.round(R.r(220, 250)), y - rise);
        row(ledge.x + 120, ledge.x + ledge.width - 30, y - 34, 2, 'orchid');
      }
      nest(top.x + top.width - 70, top, 'knot');
      x = Math.max(x, top.x + top.width) + R.r(220, 260);
      expert += (vx - x0) / RUN + (top.x + top.width - vx) / RUN + (high ? 1 : 0) + FREE + 0.8 + (x - top.x - top.width) / RUN;
      pieces.push({ k: 'kapok', x0, x1: x });
    }
    /**
     * a shelf up a trunk, and water pouring down from a spout high on the cliff, past the shelf's end and over the gap to the nest's
     * ledge, from higher than any jump goes: in pouring water a jump is pushed down (and the leaf folds). Roll the boulder along the
     * shelf to its end, under the spout, and the water runs off it instead; then the gap is a jump from the top of the boulder.
     */
    function fallNest() {
      const x0 = x;
      run(R.r(260, 300));
      const tX = Math.round(x);
      const sy = Math.round(G - R.r(230, 245));
      const shelfEnd = tX + Math.round(R.r(360, 400));
      branch(tX - 40, shelfEnd, sy);
      expert += wayUp(tX, sy, false);
      const BW = 100, BH = 84;
      const boulder: Platform = { id: pid++, x: tX + 70, y: sy - BH, width: BW, height: BH, type: 'solid', style: 'moss_stone', push: { min: tX + 60, max: shelfEnd } };
      P.push(boulder);
      // (LV-12, polish report 2026-10-29: 220-240 failed every scripted try from the boulder's top in both modes. In the real engine,
      // from the boulder's 100 px top, 8 of 252 presses landed, all full holds at the very edge; 15% shorter, 76. So both: 15% shorter
      // and the landing 40 px nearer)
      const gap = Math.round(R.r(187, 204)) - 40;
      // (the water lands on the shelf's last stretch too, where the boulder stops; it starts higher than a double jump off the boulder)
      FALLS8.push({ id: FALLS8.length + 1, x: shelfEnd - FALL_LIP, width: gap + FALL_LIP, top: sy - FALL_HEAD, bottom: G, plug: { platformId: boulder.id, atX: shelfEnd - BW } });
      const nl = branch(shelfEnd + gap, shelfEnd + gap + Math.round(R.r(200, 240)), sy + Math.round(R.r(0, 16)));
      nest(nl.x + nl.width - 70, nl, 'fall');
      x = nl.x + nl.width + R.r(220, 260);
      expert += (tX - x0) / RUN + 0.5 + (shelfEnd - BW - tX - 70) / PUSH + 1.2 + 1.4 + nl.width / RUN + FREE + 0.8 + (x - nl.x - nl.width) / RUN;
      pieces.push({ k: 'log', x0, x1: x });
    }
    /**
     * a ledge up a trunk (or a knotted vine) with a capuchin pacing it: on its feet it will not let him by (nor over: it leaps up at
     * him). Chimes on a post below ring before each gust along the cliff, and a gust knocks it over for a while. The nest is at the
     * ledge's far end; or (`glide`) the ledge is a high perch and the nest is out on a branch only the leaf reaches from its far end,
     * with the gust behind him.
     */
    function guardNest(rope: boolean, glide: boolean) {
      const x0 = x;
      run(R.r(300, 340));
      const tX = Math.round(x);
      const chimeX = tX - 150;
      const gy = Math.round(glide ? G - R.r(335, 350) : G - R.r(230, 245));
      const end = tX + Math.round(R.r(440, 480));
      const ledge = branch(tX - 40, end, gy);
      expert += wayUp(tX, gy, rope);
      const gx0 = tX + 120, gx1 = end - 180;
      GUARDS.push({ job: 'guard', x: Math.round((gx0 + gx1) / 2), y: gy, x0: gx0, x1: gx1 });
      gustZone(tX - 220, end + 60, 1, chimeX);
      let last = end;
      if (glide) {
        const nb = glideOut(ledge);
        nest(nb.x + nb.width - 70, nb, 'guard', 'glide');
        last = nb.x + nb.width;
      } else nest(end - 60, ledge, 'guard', rope ? 'knot' : undefined);
      x = last + R.r(240, 280);
      expert += (tX - x0) / RUN + 3.6 + (end - tX) / RUN + (glide ? 1.6 : 0) + FREE + 0.8 + (x - last) / RUN;
      pieces.push({ k: 'kapok', x0, x1: x });
    }
    /**
     * out from the end of a high perch: the nest's branch a little lower, too far for any jump (and far higher than a jump from the
     * floor), easy for the leaf. Petals trail down the way the leaf drifts.
     */
    function glideOut(perch: Platform) {
      const drop = Math.round(R.r(50, 70));
      const gap = Math.round((reachJump(-drop, true) + reachGlide(-drop, true)) / 2);
      const bx = perch.x + perch.width + gap;
      const nb = branch(bx, bx + Math.round(R.r(170, 200)), perch.y + drop);
      for (let i = 1; i <= 3; i++) {
        const u = i / 4;
        flower(Math.round(perch.x + perch.width + gap * u), Math.round(perch.y - 20 + (drop + 50) * u), 'orchid');
      }
      return nb;
    }
    /**
     * up a tall trunk (or a knotted vine) to a perch, and the nest out on a branch only the leaf reaches. `secret`: farther out again,
     * from the nest's branch, a little ledge with a golden seed only a second glide reaches.
     */
    function glideNest(secret: boolean, rope: boolean) {
      const x0 = x;
      run(R.r(260, 300));
      const tX = Math.round(x);
      const py = Math.round(G - R.r(335, 355));
      const perch = branch(tX - 40, tX + 170, py);
      expert += wayUp(tX, py, rope);
      const nb = glideOut(perch);
      nest(nb.x + nb.width - 70, nb, 'glide', rope ? 'knot' : undefined);
      let end = nb.x + nb.width;
      if (secret) {
        const sx = Math.round(end + (reachJump(-40, true) + reachGlide(-40, true)) / 2);
        branch(sx, sx + 120, nb.y + 40);
        goldenSeed(sx + 60, nb.y + 40 - 34);
        hint(nb.x - 200, 'Something shiny, far out past that nest...');
        end = sx + 120;
      }
      // dips of soft moss in the floor under the nest's branch and on past it: down off the branch it was four and a half quiet
      // seconds to the next thing (2026-10-28, the 200-roll tool)
      x = Math.max(x, nb.x + 40);
      while (x < end - 60) {
        run(R.r(260, 330));
        dip();
      }
      x = Math.max(x, end + R.r(240, 280));
      expert += (tX - x0) / RUN + 1 + (nb.x - perch.x - perch.width) / 330 + FREE + 0.8 + (x - nb.x - nb.width) / RUN;
      pieces.push({ k: 'canopy', x0, x1: x });
    }
    /**
     * the capuchin's trade (the puzzle kit's trader, 2026-10-28). Dot's knot pulley from 4-1 hangs by a terrace too high to jump, its
     * basket empty, and a capuchin sits on its stump beside it with the pulley's stone held up over its head; mangoes lie at the near end
     * of the floor. Bring it a mango (a tap by it, carrying one) and it drops the stone; set the stone in the basket from the lift's plank
     * and the pulley winds the plank up to the terrace, and the nest on it. The terrace closes the path, so the room is never passed by;
     * a slip is a step back down, the signpost starts it again, and nothing else is near: no part of it costs a life. About 780 px across
     * and 520 tall, so an upright phone shows it as well as a sideways one.
     */
    function tradeNest() {
      const x0 = x;
      run(R.r(200, 240));
      const FLOOR = 390, WELL = 100, TOP = 290, RISE = 260;
      const fx = x;
      run(FLOOR);
      const floor = endBank();
      const well = bank(x, x + WELL, G + 60);
      const top = cliff(x + WELL, x + WELL + TOP, RISE);
      const n = ROOMS.length;
      ROOMS.push({
        id: `capuchin-trade-${n}`,
        left: onP(floor, fx + 10), right: { on: top.id, at: 1 }, above: 430, below: 90,
        pieces: [
          { kind: 'reset', id: `post${n}`, at: onP(floor, fx + 30) },
          { kind: 'source', id: `mangoes${n}`, variant: 'mango', at: onP(floor, fx + 110), look: 'pile' },
          { kind: 'item', id: `mango${n}`, variant: 'mango', source: `mangoes${n}`, for: `capuchin${n}` },
          { kind: 'trader', id: `capuchin${n}`, at: onP(floor, fx + 240), wants: 'mango' },
          // (the stone weighs 2: alone it fills the basket)
          { kind: 'item', id: `stone${n}`, variant: 'stone', with: `capuchin${n}`, for: `basket${n}` },
          { kind: 'basket', id: `basket${n}`, at: onP(floor, well.x - 40), mouth: 100, need: 2, drop: 60 },
          { kind: 'lift', id: `lift${n}`, at: { on: well.id, at: 0.5, dy: -60 }, w: WELL, rise: RISE, by: `basket${n}` },
        ],
        exit: `lift${n}`,
        beyond: { on: top.id, at: 0.5 },
        ground: [floor.id, well.id],
        tips: { enter: 'The capuchin took our stone!', hold: 'Tap by the capuchin to offer it.', open: 'Stone in, up you go!', nudge: 'Hmm. It looks hungry.', move: 'Bring it a mango. Tap by it.' },
        mech: 'trader',
      });
      row(top.x + 60, top.x + 130, top.y - 34, 2, 'orchid');
      nest(top.x + top.width - 70, top, 'trade');
      // down off the terrace onto the path again, a dip, and a breath
      open(top.x + top.width);
      run(R.r(130, 170));
      dip();
      run(R.r(240, 280));
      expert += (x - x0) / RUN + 1 + 2.5 + 1.5 + 2.5 + RISE / 120 + FREE + 1;
      pieces.push({ k: 'cages', x0, x1: x });
    }
    /**
     * the forest floor between two nests: far enough apart that no glide from one reaches the next one's ledges, with a hop or a dip
     * of soft moss on it and a breath after (2026-10-28, the stage inspector: it was five quiet seconds between every two nests)
     */
    const between = () => {
      const x0 = x;
      busy(1, W4_FILL[w4Fill], R.r(200, 240));
      if (x - x0 < 440) rest(440 - (x - x0));
    };

    beat('Start: the cliff path', () => {
      rest(R.r(300, 340));
      hint(x - 200, 'Eaglet chicks are caught in old netting on the cliff nests. Free them!');
      busy(2, ['log', 'dip'], R.r(240, 280));
      hint(x + 40, 'Tap twice to tear the netting', 'Press Punch twice to tear the netting', 'Press J twice to tear the netting');
      plainNest();
      hint(x - 300, 'Its parent can reach it now! Feel its wings blow you along?');
      rest(R.r(120, 160));
      flag();
    });
    beat('Learn: Dot and the boulder', () => {
      hint(x + 40, 'That vine is tied up out of reach. Stand still under the knot and Dot will fly up');
      knotNest(false);
      between();
      hint(x + 40, 'Water pours between you and that nest. Climb up and keep sliding into the boulder to roll it under the water', 'Water pours between you and that nest. Climb up and hold the pad into the boulder to roll it under the water', 'Water pours between you and that nest. Climb up and hold right into the boulder to roll it under the water');
      fallNest();
      between();
      flag();
    });
    // (2026-10-28, the variety pass: 200 rolls of 4-8 were 98% alike. The Develop and the first Twist come in either order inside, the
    // capuchins near the end come in either order (the trade, a mango for the pulley's stone; a guard on a tied-up ledge), the cliff path after
    // it draws from a bag leaning to the roll's theme: the open cliff, more nests, or the leaf, w4Sections.ts)
    const roll = new W4Roll(seed, '4-8');
    // (round 2, 2026-10-28: a flavour for the whole stage from the roll. After the leaf is taught and after the two-at-once, one of its
    // own pieces, and the finish leans to it: the capuchin guards, Dot's knots, a crosswind gorge (4-4's, a miss is a life), or the leaf)
    const flavour = roll.theme('finish', ['guards', 'knots', 'gorges', 'leaf'] as const);
    // (round 3: every flavour crosses two windy lianas over a real drop at each break: a miss is a life)
    // (round 5, 2026-10-28: each flavour's own pieces only, two at a break: three windy lianas at every break in every flavour, round 4,
    // made the rolls alike again)
    const sigOne = () => {
      if (flavour === 'guards') guardNest(false, false);
      else if (flavour === 'knots') knotNest(R.chance(0.5));
      else if (flavour === 'gorges') swings(3, true);
      else glideNest(false, false);
      between();
    };
    const sig = () => {
      sigOne();
      sigOne();
      sigOne();
      flag();
    };
    const develop = roll.pick(['guardFirst', 'knotFirst'] as const);
    beat('Develop: the guard', () => {
      const guard = () => {
        hint(x + 40, 'A capuchin guards that nest! When the chimes ring, the wind will knock it over');
        guardNest(false, false);
        between();
        flag();
      };
      // (the knot nest a hop higher; round 5: or the flavour's own piece in its place, the gorges' windy lianas, the leaf's fall nest)
      const high = () => {
        if (flavour === 'gorges') swings(3, true);
        else if (flavour === 'leaf') fallNest();
        else knotNest(true);
        between();
        flag();
      };
      if (develop === 'guardFirst') { guard(); between(); high(); }
      else { high(); guard(); }
    });
    const twist = roll.pick(['glideFirst', 'fallFirst'] as const);
    // (round 5: the boulder nest beside the leaf's is the flavour's own piece, except in the leaf's)
    const twistMate = () => (flavour === 'leaf' ? fallNest() : sigOne());
    beat('Twist: by leaf', () => {
      if (twist === 'fallFirst') { twistMate(); between(); }
      hint(x + 40, 'That nest is too far to jump to. Climb up, jump, and keep your thumb on the glass to open your leaf', 'That nest is too far to jump to. Climb up, jump, and hold Jump to open your leaf', 'That nest is too far to jump to. Climb up, jump, and hold Space to open your leaf');
      glideNest(false, false);
      between();
      if (twist === 'glideFirst') { twistMate(); between(); }
      flag();
      sig();
    });
    beat('Twist: two at once', () => {
      // (the order is rolled; each says what it needs)
      const combos: Array<() => void> = [
        () => {
          hint(x + 40, 'Dot first, then your leaf: the vine takes you up to a perch, and the nest is a glide away');
          glideNest(false, true);
        },
        () => {
          hint(x + 40, 'Another guard, and its ledge is tied up too. Dot first, then wait for the chimes');
          guardNest(true, false);
        },
        () => {
          hint(x + 40, 'A guard on the high perch! When the wind knocks it over, run past and glide with the wind behind you');
          guardNest(false, true);
        },
      ];
      // (round 5: the roll's flavour picks the two: the guards two guard nests, the leaf the glides, the knots Dot first, the gorges one
      // and three windy lianas)
      const pickOf: Record<typeof flavour, number[]> = { guards: [1, 2], leaf: [0, 2], knots: [0, 1], gorges: [R.i(0, 2)] };
      const chosen = R.shuffle(pickOf[flavour].map((k) => combos[k]));
      if (flavour === 'gorges') chosen.push(() => swings(3, true));
      chosen.forEach((f, i) => {
        if (i) between();
        f();
        between();
        flag();
      });
      sig();
    });
    const capuchin = roll.pick(['trade', 'guard'] as const);
    type Piece48 = 'gust' | 'pillars' | 'high' | 'nest' | 'knot' | 'drop' | 'gustLeaf' | 'guard' | 'gorge' | 'glide';
    const counts: Record<typeof flavour, Record<Piece48, number>> = {
      guards: { gust: 1, pillars: 0, high: 0, nest: 0, knot: 0, drop: 0, gustLeaf: 0, guard: 3, gorge: 0, glide: 0 },
      knots: { gust: 0, pillars: 0, high: 0, nest: 1, knot: 3, drop: 0, gustLeaf: 0, guard: 0, gorge: 0, glide: 0 },
      gorges: { gust: 0, pillars: 0, high: 0, nest: 0, knot: 0, drop: 0, gustLeaf: 0, guard: 0, gorge: 4, glide: 0 },
      leaf: { gust: 0, pillars: 0, high: 0, nest: 0, knot: 0, drop: 2, gustLeaf: 1, guard: 0, gorge: 0, glide: 3 },
    };
    const bag = roll.bag<Piece48>(['gust', 'pillars', 'high', 'nest', 'knot', 'drop', 'gustLeaf', 'guard', 'gorge', 'glide'], (k) => counts[flavour][k]);
    beat('Finish', () => {
      between();
      // (a guard nest on its own again: each puzzle comes at least twice on its own)
      guardNest(false, false);
      between();
      flag();
      // the capuchin's trade, once: a nest up on a terrace that only Dot's knot pulley reaches, and a capuchin holding its stone. By the
      // roll, a second capuchin guards a ledge tied up under Dot's knot, before the trade or after it
      const guardKnot = () => {
        hint(x + 40, 'A guard up a tied-up vine. Dot first, then wait for the chimes');
        guardNest(true, false);
        between();
        flag();
      };
      // (round 5: the second capuchin, the guard up a tied vine, only in the guards' flavour; the others' own piece instead)
      const second = () => (flavour === 'guards' ? guardKnot() : (sigOne(), flag()));
      if (capuchin === 'guard') second();
      tradeNest();
      flag();
      if (capuchin === 'trade') second();
      // the cliff path on toward the shrine, until a quick player has had about three minutes, then the last nest
      let n = 0;
      while (expert < W48_SECONDS - 20 && n < 24) {
        const k = bag.draw()!;
        if (k === 'gust') gustGap(R.chance(0.5) ? 1 : -1);
        else if (k === 'pillars') busy(3, W4_FILL[w4Fill], R.r(200, 240));
        else if (k === 'high') highRoadOver();
        else if (k === 'nest') plainNest();
        else if (k === 'knot') knotNest(R.chance(0.5));
        else if (k === 'drop') leafDrop(R.r(0.78, 0.88));
        else if (k === 'guard') guardNest(false, false);
        else if (k === 'gorge') swings(2, true);
        else if (k === 'glide') glideNest(false, false);
        else gustLeaf();
        w4Breath();
        n++;
        if (n % 2 === 0) flag();
      }
      // (every puzzle at least twice on its own whatever the flavour, and half as many nests again as the goal: the last one next)
      const alone = (k: NestKind) => NESTS.filter((q) => q.kind === k && !q.also).length;
      const more: Record<string, () => void> = { knot: () => knotNest(false), fall: fallNest, guard: () => guardNest(false, false), glide: () => glideNest(false, false) };
      for (const k of ['knot', 'fall', 'guard'] as const) while (alone(k) < 2) { between(); more[k](); }
      while (NESTS.length + 1 < Math.ceil(NEST_GOAL_48 * 1.5)) {
        between();
        knotNest(R.chance(0.5));
      }
      between();
      glideNest(true, false);
      // (hops on the way to the shrine make up any last seconds the dice left short; then the run home)
      for (let k = 0; k < 8 && expert + 4.2 < W48_SECONDS; k++) w4Breath();
      homeRun();
    });
  }

  if (plan === '3-2') {
    // World 3's note (Meeca, in plain sight: a Keeper's Bell) on the quiet floor just before the eyes
    const note = findForStage(config.worldIndex, config.miniIndex);
    const at = beats.find((b) => b[2].startsWith('Develop'));
    if (note && note.kind === 'note' && at) C.push({ id: cid++, type: 'find', findId: note.id, hidden: false, x: Math.round(at[0] + 70), y: G - 26, collected: false, bobPhase: 0 });
  }
  // the walk to the shrine makes up any last seconds the dice left short
  if ((config.worldIndex === 3 || config.worldIndex === 4) && expert < EXPERT_SECONDS) rest((EXPERT_SECONDS - expert) * RUN + 60);

  // the grotto's dressing behind every stretch of floor: stalagmites, glowing mushrooms, a clawed rock; stalactites and glowworm threads
  // hanging from the roof (no ferns in 3-2, where a fern is a hiding place)
  if (config.worldIndex === 3) {
    const darkAt = (px: number) => GZ.some((z) => z.kind === 'dark' && px > z.x0 - 80 && px < z.x1 + 80);
    for (const pc of pieces) {
      // (over the stream and the chasms only the roof's pieces hang: nothing stands where there is no floor)
      const roofOnly = pc.k === 'gorge';
      if (pc.k !== 'rest' && pc.k !== 'snakes' && !roofOnly) continue;
      for (let cx = pc.x0 + R.r(80, 200); cx < pc.x1 - 80; cx += R.r(280, 460)) {
        // (the variety pass: the set of floor pieces and hanging pieces rotates with the roll, w3Sections.ts W3_DECOR_SETS)
        const set = W3P!.decor;
        const kinds = plan === '3-2' ? set.floor.filter((n) => n !== 'fern') : set.floor;
        const k = R.pick(kinds);
        const w = k === 'stalagmites' ? R.r(140, 200) : k === 'mushrooms' ? R.r(84, 110) : k === 'fern' ? R.r(140, 180) : k === 'pawprint' ? R.r(92, 110) : k === 'bones' ? R.r(100, 120) : R.r(100, 130);
        const busy = BUSHES.some((b) => cx > b.x - 60 && cx < b.x + b.w + 60) || C.some((c) => (c.hidden || c.type === 'find') && Math.abs(c.x - cx) < 170) || W3D.some((d) => d.n === 'fern' && Math.abs(d.x - cx) < 170);
        if (!busy && !roofOnly) W3D.push({ n: k, x: Math.round(cx), b: G + 8, w: Math.round(w), flip: R.chance(0.5) });
        if (R.chance(0.5)) {
          // (a lit glowworm thread never hangs in the dark, where they sleep until he listens)
          const hangs = set.hang.filter((n) => n !== 'glowLit' || !darkAt(cx));
          const hn = R.pick(hangs.length ? hangs : ['stalactite' as const]);
          const hw = hn === 'glowLit' ? R.r(70, 90) : hn === 'mossCurtain' ? R.r(160, 220) : R.r(110, 150);
          W3D.push({ n: hn, x: Math.round(cx + R.r(-90, 90)), b: G - 480, w: Math.round(hw), hang: true, flip: R.chance(0.5) });
        }
      }
    }
  }
  const exitX = x - 260;
  close();
  // nothing lies past the shrine: the engine stops him at it (exitTotemX + 35), so a flower the last stretch laid beyond it could never
  // be picked up (one did, in every stage built here, 2026-10-25)
  for (let i = C.length - 1; i >= 0; i--) if (C[i].x > exitX + PAST_SHRINE) C.splice(i, 1);
  C.push({ id: cid++, type: 'exit_totem', x: exitX, y: G - 30, collected: false, bobPhase: 0 });

  const width = Math.ceil(x + 20);
  const cfg: LevelConfig = { ...config, levelWidth: width, levelHeight: Math.max(config.levelHeight, 900), ...(plan === '1-2' ? { targetCount: PETAL_GOAL_12 } : plan === '1-3' ? { targetCount: SNAKE_GOAL_13 } : plan === '1-5' ? { targetCount: PETAL_GOAL_15 } : plan === '1-9' ? { targetCount: GUARD_GOAL_19 } : plan === '3-3' ? { targetCount: PROWLER_GOAL_33 } : plan === '3-6' ? { targetCount: GRANDMA_GOAL_36 } : plan === '3-7' ? { targetCount: GRANDMA_GOAL_37 } : plan === '3-9' ? { targetCount: PROWLER_GOAL_39 } : plan === '4-8' ? { targetCount: NEST_GOAL_48 } : {}) };
  cid = heartsAtFlags(C, checkpoints, cid);
  // the puzzle rooms' own platforms (a seesaw's two ends, a gate's door): added once, here, so the game and the check see the same ground
  const kit: KitExtras | undefined = ROOMS.length ? { rooms: ROOMS } : undefined;
  if (kit) addKitPlatforms(P, kit);
  // every flower where he can get it (nothing tucked under a branch, nothing out of reach: flowerReach.ts)
  const movedPickups = fixPickups({ platforms: P, vines: V, ropes: ROPES, waterY: WATER }, C);
  return {
    config: cfg,
    ...(kit ? { kit } : {}),
    trees: T,
    platforms: P,
    vines: V,
    ropes: ROPES,
    enemies: E,
    boss: null,
    collectibles: C,
    spawnX: 140,
    spawnY: G,
    exitTotemX: exitX,
    exitTotemY: G,
    checkpoints: checkpoints.sort((a, b) => a.x - b.x),
    waterY: WATER,
    meta: { attempt: seed, chunks: pieces.map((p) => p.k), width, pieces: pieces.map((p) => ({ k: p.k, x0: p.x0, x1: p.x1 })), timing: { layoutSeconds: expert, decorSeconds: 0, route: width } },
    ...(RIVERS.length ? { rivers: RIVERS } : {}),
    ...(GZ.length ? { zones: GZ } : {}),
    proto: {
      ...(W3D.length ? { w3decor: W3D } : {}),
      ...(THORNS.length ? { thorns: THORNS } : {}),
      hints: hints.sort((a, b) => a.x - b.x), covers, beats, movedPickups, ...(BUSHES.length ? { bushes: BUSHES } : {}), ...(ZONES.length ? { watch: ZONES } : {}), ...(RING ? { ring: RING } : {}),
      ...(MIX ? { mix: MIX, grant: ['shimmy'] as SkillId[] } : {}),
      ...(W4C.length || W4K.length || W4R.length || Object.keys(W4X).length ? { w4: { ...W4X, ...(W4C.length ? { chimes: W4C } : {}), ...(W4K.length ? { knots: W4K } : {}), ...(W4R.length ? { rocks: W4R } : {}) } } : {}),
    },
  };
}
// ---------------------------------------------------------------------------------------------------------------------------
// 1-4 Up the Kapok: the first climbing stage, built from the floor up

/** the kapok's width (the engine keeps him inside it) and the margin nothing is built in */
const KAPOK_W = 3200;
const KAPOK_MARGIN = 90;
/**
 * 4-6's mist: the wide ledge at the foot of each hidden column (it catches every miss from the column), the three lanes the small
 * hidden ledges stand in (their middles this far apart) and how wide they are, how long standing still takes to settle the mist (s),
 * and the seconds the climb below leaves for everything above it (the mist, the nests, the two together, across the tree, the high
 * mist: about 160 s of 4-6's 240)
 */
const MIST_FOOT = 560;
const MIST_LANE = 150;
const MIST_STEP = 130;
/** Dot's rock line in 4-1 and 4-6 (and said by w4Play when the first rock warns near him, if it was missed: w4.rockTip) */
const ROCKS_LOOSE = 'Rocks are coming loose! Wait for the shadow, then go once it has fallen';
const MIST_FILL = 3;
const MIST_LEAVES = 160;
/**
 * 4-1's knot pulley (2026-10-28, the puzzle kit's counterweight basket and lift, built by buildKapok's liftRoom): Dot has knotted a rope
 * over a branch, a basket on one end and the lift's plank on the other, and a heap of stones from the broken ledge lies by it. What she
 * says in the room, and the platforms it is built on (no rock falls on them: a puzzle never costs a life)
 */
interface KnotPulley { tips: RoomTips; plats: number[] }
/** 4-6: the seconds of the climb across the tree that its second pinwheel lift takes the place of (2026-10-28) */
const PINWHEEL_AGAIN = 16;
export const KNOT_PULLEY_TIPS: RoomTips = { enter: 'I knotted us a pulley!', hold: 'Stand on the lift. Tap to drop it in.', open: 'Up you go!', nudge: 'That basket looks empty.', move: 'Fill the basket to raise the lift.' };

/**
 * 1-4 Up the Kapok: going up. Learn: climb a trunk to its branch, twice, straight up from the floor. Test: a zigzag of rope, branch and
 * trunk, back and forth across the tree (with a hidden hollow up a side trunk: a golden seed). Twist: one long rope across the widest
 * gap, near the top. Finish: the last trunk to the crown and the shrine. A fall only drops him to a lower branch or the floor: it costs
 * the climb, never a life. Built from y = 0 upward and shifted down at the end, so the crown sits near the top of the stage.
 *
 * `village` (2-6 Up the Bank Houses, w2Stages.ts): the same climb up the riverbank village. World 2's kit paints it (bamboo posts, plank
 * porches, earth), the porches get the village's round doors, windows and washing, the secret hollow is a lit round window instead,
 * and Gruntlewick waits at the top with his scroll.
 *
 * `grotto` (3-4 The Sinkhole): the same climb up the wall of the sinkhole toward the moonlight. World 3's kit paints it (root columns,
 * limestone shelves), prowling ocelots stand in for the snakes, and Matt's grotto pieces dress it: moss hanging under the shelves,
 * glowing mushrooms and ferns on them, stalactites and glowworm threads up in the dark.
 *
 * `cliff` (4-1 The Broken Ledge, World 4's first stage): the same climb back up the cliff after the ledge broke away under him. Bits of
 * the broken ledge keep coming loose: on some of the wide ledges a rock drops on its own rhythm, its shadow growing first (rockfall.ts),
 * so the new thing to learn is to stop short and go once it has fallen. The first one is on a ledge of its own, with nothing else to
 * do there. At the top the way to the shrine is a gap too wide to jump, and a curled fern frond at its edge: stand still beside it and
 * it unrolls into a bridge (patience.ts: "slow is not stopped"). Clearing it teaches the Leaf Glide (skills.ts).
 *
 * `mist` (4-6 Above the Mist): the same climb up the cliff, then up through a bank of mist toward the eagle nests. In the mist the way
 * up is a column of small hidden ledges: stand still on the wide ledge at its foot and the mist settles and shows them (patience.ts,
 * kind 'mist'); move and it slowly rises again, so the way must be remembered. The ledges are solid all along, and the wide ledge at
 * the foot of each column catches every miss, so a slip costs a look, never a life. The first column is two ledges, then four, then
 * five. Above the mist the nests: eaglets asleep on wide ledges (eaglet.ts); move near one while they look about and their wings blow
 * him back a few steps, so go while they sleep and stand still while they look. The first nest is alone on its ledge, then a ledge
 * with two on different rhythms. Then the two together: a mist spot with eaglets watching it and the first step up (one nest, then one
 * either side), so he stands still for the mist, then waits for them to doze before he climbs out of their sight into it. Then across
 * the tree on ropes between nest ledges, out one way and back the other (hang on at each rope's end, out of their sight, until they
 * doze). At the top the high mist: two tall columns with a small ledge halfway, which the lower mist shows and which settles the upper
 * mist in turn; then the crown and the shrine. It is a long stage (stageSeconds('4-6'), four minutes). No glide is needed (4-7 is the
 * first stage that needs the leaf).
 */
export function buildKapok(config: LevelConfig, seed: number, village = false, grotto = false, cliff = false, mist = false): GeneratedStage & { proto: ProtoExtras } {
  const R = stream(seed);
  const W = KAPOK_W;
  const P: Platform[] = [];
  const V: Vine[] = [];
  const T: TreeStructure[] = [];
  const E: Enemy[] = [];
  const C: Collectible[] = [];
  const ROPES: Rope[] = [];
  const checkpoints: Array<{ x: number; y: number; reached: boolean }> = [];
  const hints: StageHint[] = [];
  const beats: Array<[number, number, string]> = [];
  const hollows: Array<{ x: number; y: number }> = [];
  const villageWindows: Array<{ x: number; y: number }> = [];
  let pid = 1, vid = 1, tid = 1, eid = 1, cid = 1, seedN = 0;
  let expert = 0;
  const RUN = 285, CLIMB = 220;

  const ledge = (x0: number, x1: number, y: number) => {
    const p: Platform = { id: pid++, x: Math.round(x0), y: Math.round(y), width: Math.round(x1 - x0), height: 24, type: 'solid', style: 'branch' };
    P.push(p);
    return p;
  };
  const trunk = (x: number, groundY: number, perchY: number) => {
    const tree: TreeStructure = { id: tid++, x, groundY, topY: perchY - 150, trunkWidth: 76, hasClimbVine: true, canopyRadius: 150 };
    T.push(tree);
    V.push({ id: vid++, x, topY: perchY - 2, bottomY: groundY - 6, swaySpeed: 0.9, swayPhase: (x * 0.007) % 6.28, vineType: 'tree_climb', treeId: tree.id });
  };
  /**
   * the air a puzzle room needs kept empty: over its basket and lift, where the acorn is thrown and the plank rides up (1-4, Matt
   * 2026-10-29: "The 2nd basket on the 1-4 climb level is impossible. Has a platform that blocks the rock": the hops after a room were
   * laid across it, about 300 up, over the high basket and the lift)
   */
  const air: { x0: number; x1: number; y0: number; y1: number }[] = [];
  /** is there already a branch across this span within about a body's height and a half of y (above or below), or a room's air? */
  const blocked = (x0: number, x1: number, y: number) =>
    P.some((p) => p !== P[0] && p.x < x1 + 30 && p.x + p.width > x0 - 30 && Math.abs(p.y - y) < 130) ||
    air.some((a) => x0 < a.x1 && x1 > a.x0 && y > a.y0 && y < a.y1);
  const flower = (x: number, y: number, v: Collectible['botanicalVariant'] = 'orchid') =>
    C.push({ id: cid++, type: 'flower', botanicalVariant: v, x: Math.round(x), y: Math.round(y), collected: false, bobPhase: (x * 0.031) % 6.28 });
  const row = (x0: number, x1: number, y: number, n: number, v: Collectible['botanicalVariant'] = 'orchid') => {
    for (let i = 0; i < n; i++) flower(x0 + ((x1 - x0) * i) / Math.max(1, n - 1), y, v);
  };
  const snake = (x: number, surface: number, range: number) => {
    E.push({
      id: eid++, type: 'snake', x, y: surface - 14, vx: 28, vy: 0, width: 38, height: 22, hp: 1, maxHp: 1, facing: R.chance(0.5) ? 1 : -1,
      patrolMinX: x - range / 2, patrolMaxX: x + range / 2, attackCooldown: 2, telegraphTimer: 0, isAttacking: false,
      animTimer: 0, hitFlashTimer: 0, defeated: false, koTimer: 0, behaviorTimer: 0,
    } as Enemy);
  };
  const hint = (text: string, pad: string, keys: string, aboveY?: number) => hints.push({ x: 0, text, pad, keys, aboveY });

  // the floor: the whole width, so a fall is never more than a climb back
  P.push({ id: pid++, x: 0, y: 0, width: W, height: BANK_H, type: 'solid', style: 'log' });

  /** 4-1: the fern frond at the cliff top, and Dot's knot pulley on the way up */
  let spot: PatienceSpot | undefined;
  const pulley: KnotPulley = { tips: KNOT_PULLEY_TIPS, plats: [] };
  /** 4-1: each run of hops up the wide ledges (a rock comes loose on one ledge of each, where there is room for it) */
  const hopGroups: number[][] = [];
  /** 4-6: the gust lane of the pinwheel lift (its shutter shuts it), the stage's only zone */
  const gusts: Zone[] = [];
  /** 4-6: the mist's spots, one at the foot of each hidden column, and the eagle nests above it */
  const mistSpots: PatienceSpot[] = [];
  const nests: Nest[] = [];
  /**
   * World 4's two climbs take a theme from the roll (w4Sections.ts, the variety pass 2026-10-28: 200 rolls were 89-90% alike): 4-1 up
   * the wide ledges by hops (its rocks), by more ropes, or the two in turn; 4-6 across the tree by ropes, by hops, or both. The zigzag's
   * own dice are untouched (the roll has its own stream), and 1-4 and 3-4 climb as before.
   */
  const w4Climb = cliff || mist ? (() => {
    const t = new W4Roll(seed, cliff ? '4-1' : '4-6').theme('climb', ['hops', 'ropes', 'turns'] as const);
    return { theme: t, hopsAt: (n: number) => (t === 'hops' ? n % 4 !== 1 : t === 'ropes' ? n % 4 === 3 : n % 2 === 0) };
  })() : null;
  /** where he stands now, and which way the climb is heading across the tree */
  let cur: Platform;
  /** the one trunk up from the floor (4-6 marks the way back to it) */
  let firstTrunkX = 0;
  let dir: 1 | -1 = 1;
  /** a trunk up from `cur` (near its end on the way he is heading), to a branch growing out to the right of it */
  const climb = (h0: number, flowers = 3) => {
    let h = h0;
    // (kept far enough from the right edge for the branch it grows: the trunk moves in along the branch he is on)
    const tX = Math.round(Math.max(cur.x + 40, Math.min(dir === 1 ? cur.x + cur.width - 60 : cur.x + 60, W - KAPOK_MARGIN - 220)));
    // the branch at the top grows out to the right of the trunk, never past the edge of the tree
    const pw = Math.max(170, Math.min(Math.round(R.r(260, 320)), W - KAPOK_MARGIN - tX));
    // a little higher if another branch is already in the way
    for (let k = 0; k < 3 && blocked(tX - 40, tX + pw, cur.y - h); k++) h += 70;
    const y = cur.y - h;
    trunk(tX, cur.y, y);
    for (let i = 0; i < flowers; i++) flower(tX, cur.y - 70 - ((h - 110) * i) / Math.max(1, flowers - 1), 'hibiscus');
    expert += h / CLIMB + 0.8;
    cur = ledge(tX - 40, tX + pw, y);
    return tX;
  };
  /** the room left past `cur` on the side he is heading */
  const room = () => (dir === 1 ? W - KAPOK_MARGIN - (cur.x + cur.width) : cur.x - KAPOK_MARGIN);
  /** a rope from the end of `cur` across a gap to a new branch at the same height (Shimmy Rope: needed from 1-4) */
  const rope = (gap: number, w: number, under = 3) => {
    const y = cur.y;
    const at = (d: 1 | -1) => (d === 1 ? cur.x + cur.width + gap : cur.x - gap - w);
    const fits = (d: 1 | -1) => (d === 1 ? W - KAPOK_MARGIN - (cur.x + cur.width) : cur.x - KAPOK_MARGIN) >= gap + w && !blocked(at(d), at(d) + w, y);
    if (!fits(dir) && fits(dir === 1 ? -1 : 1)) dir = dir === 1 ? -1 : 1;
    else if (room() < gap + w) dir = dir === 1 ? -1 : 1;
    const nx0 = at(dir);
    const next = ledge(nx0, nx0 + w, y);
    const a = dir === 1 ? cur : next, b = dir === 1 ? next : cur;
    ROPES.push({ id: ROPES.length + 1, x0: a.x + a.width - 44, x1: b.x + 44, y: y - ROPE_RISE, g0: y, g1: y, required: true });
    // petals under the rope, at the height he hangs (only a shimmy reaches them)
    if (under) row(a.x + a.width + 70, b.x - 70, y - ROPE_RISE + HANG_DROP - 26, under, 'orchid');
    row(next.x + 50, next.x + next.width - 50, y - 34, 2, 'hibiscus');
    expert += 1.2 + (b.x - a.x - a.width + 88) / ROPE_SPEED + w / RUN;
    cur = next;
  };
  /** a few short hops along and up branches (`wide`: 4-1's wide ledges, where the rocks come loose) */
  const hops = (n: number, wide = false) => {
    const group: number[] = [];
    for (let k = 0; k < n; k++) {
      const w = Math.round(wide ? R.r(280, 330) : R.r(180, 240));
      const rise = Math.round(R.r(20, 60));
      const gap = Math.round(reachJump(rise, false) * R.r(0.4, 0.55));
      const at = (d: 1 | -1) => (d === 1 ? cur.x + cur.width + gap : cur.x - gap - w);
      const fits = (d: 1 | -1) => (d === 1 ? W - KAPOK_MARGIN - (cur.x + cur.width) : cur.x - KAPOK_MARGIN) >= gap + w && !blocked(at(d), at(d) + w, cur.y - rise);
      if (!fits(dir)) {
        if (fits(dir === 1 ? -1 : 1)) dir = dir === 1 ? -1 : 1;
        else return; // no room either way: the trunk that follows takes him up instead
      }
      const nx0 = at(dir);
      cur = ledge(nx0, nx0 + w, cur.y - rise);
      flower(nx0 + w / 2, cur.y - 34, 'orchid');
      expert += (gap + w) / RUN + 0.5;
      if (wide) group.push(cur.id);
    }
    if (group.length) hopGroups.push(group);
  };
  const flag = () => checkpoints.push({ x: Math.round(cur.x + cur.width / 2), y: cur.y, reached: false });
  const beat = (name: string, f: () => void) => {
    const b0 = cur ? cur.y : 0;
    f();
    beats.push([b0, cur.y, name]);
  };

  // ---- 1-4's squirrels' lift (the shared puzzle kit, puzzleKit.ts: the counterweight basket and its lift), 2026-10-28
  /** only the kapok of 1-4 has the squirrels' lift (the bank houses, the sinkhole and the cliffs climb as they did) */
  const squirrels = !village && !grotto && !cliff && !mist;
  const ROOMS: RoomSpec[] = [];
  const onL = (p: Platform, ax: number, dy = 0): Anchor => ({ on: p.id, at: (ax - p.x) / p.width, ...(dy ? { dy } : {}) });
  /**
   * A wide branch with the squirrels' acorn stash on it, a basket hanging on a pulley by its end, and the lift's plank resting in a
   * notch past it, flush with the branch. A ledge 260 up, too high to jump to, is where the plank goes. Put an acorn in the basket
   * while he stands on the plank and the basket's weight winds the plank up with him. `high`: the basket hangs high over the plank
   * (flick up to throw the acorn in); else low beside it (a tap sets it in). The branch joins on at the end of the one he is on.
   * About 750 px across and 500 tall: an upright phone and a sideways one both show it. A miss is a hop: nothing here costs a life.
   */
  const liftRoom = (high: boolean, knot?: KnotPulley): boolean => {
    const FLOOR = 340, WELL = 100, HIGH = 320, RISE = 260;
    const span = FLOOR + WELL + HIGH;
    const fits = (d: 1 | -1) => {
      const r = d === 1 ? W - KAPOK_MARGIN - (cur.x + cur.width) : cur.x - KAPOK_MARGIN;
      if (r < span + 10) return false;
      const x0 = d === 1 ? cur.x + cur.width : cur.x - span;
      // (the branch he is on joins it: it is not in the way)
      const clear = (y: number) => !P.some((p) => p !== P[0] && p !== cur && p.x < x0 + span + 30 && p.x + p.width > x0 - 30 && Math.abs(p.y - y) < 130);
      return clear(cur.y) && clear(cur.y - RISE) && clear(cur.y - RISE / 2);
    };
    // (always built going right: a room is come into at its left edge, as the check walks it, puzzleCheck.ts)
    const d: 1 | 0 = fits(1) ? 1 : 0;
    if (!d) return false;
    dir = d;
    const y = cur.y;
    // laid out going right, mirrored going left: the branch, the notch, the ledge up there
    const at = (u: number, w: number) => (d === 1 ? cur.x + cur.width + u : cur.x - u - w);
    const floor = ledge(at(0, FLOOR), at(0, FLOOR) + FLOOR, y);
    const well = ledge(at(FLOOR, WELL), at(FLOOR, WELL) + WELL, y + 60);
    const up = ledge(at(FLOOR + WELL, HIGH), at(FLOOR + WELL, HIGH) + HIGH, y - RISE);
    const near = (u: number) => (d === 1 ? floor.x + u : floor.x + floor.width - u);
    const stashX = near(90);
    const basketX = well.x - 40;
    // (from past the basket to the lift's far side, from the room's top down to a body above the branch)
    air.push({ x0: Math.min(basketX, well.x) - 90, x1: well.x + well.width + 30, y0: y - 440, y1: y - 40 });
    const n = ROOMS.length;
    const thing = knot ? 'stone' : 'acorn';
    ROOMS.push({
      id: knot ? `knot-pulley-${n}` : `squirrel-lift-${n}`,
      // (the left anchor is where he comes in, the branch's near end, whichever way the room faces: the check starts him there)
      left: onL(floor, near(10)), right: { on: up.id, at: d === 1 ? 1 : 0 },
      above: 420, below: 90,
      pieces: [
        { kind: 'reset', id: `post${n}`, at: onL(floor, near(30)) },
        { kind: 'source', id: `stash${n}`, variant: thing, at: onL(floor, stashX), look: 'pile' },
        { kind: 'item', id: `${thing}${n}`, variant: thing, source: `stash${n}`, for: `basket${n}` },
        // (a stone weighs two: alone it fills Dot's basket)
        { kind: 'basket', id: `basket${n}`, at: onL(floor, basketX), mouth: high ? 236 : 100, need: knot ? 2 : 1, drop: high ? 130 : 60 },
        { kind: 'lift', id: `lift${n}`, at: { on: well.id, at: 0.5, dy: -60 }, w: WELL, rise: RISE, by: `basket${n}` },
      ],
      exit: `lift${n}`,
      beyond: { on: up.id, at: 0.5 },
      ground: [floor.id, well.id],
      tips: knot?.tips ?? (high
        ? { enter: 'The basket hangs high this time.', hold: 'Stand on the lift. Flick up to throw!', nudge: 'Too high to reach. Throw?', move: 'Stand on the lift. Throw stones in.' }
        : { enter: "The squirrels' lift! It won't rise.", hold: 'Stand on the lift. Tap to drop it in.', nudge: 'That basket looks empty.', move: 'Fill the basket to raise it.' }),
      mech: knot || high ? undefined : 'pulley',
    });
    knot?.plats.push(floor.id, well.id, up.id);
    row(near(150), near(250), y - 34, 2, 'hibiscus');
    row(up.x + 70, up.x + up.width - 70, up.y - 34, 3, 'orchid');
    expert += (FLOOR + WELL) / RUN + 2.5 + (high ? 2 : 1) + RISE / 120 + HIGH / RUN;
    cur = up;
    return true;
  };

  // ---- Learn: up two trunks from the floor
  cur = P[0];
  beat('Learn: up the trunk', () => {
    // the patch of floor the first trunk stands on
    // (2-6, QA 2026-10-29: the first ladder stood 440 px from where he starts, off an upright screen (it shows 70-510); the tip to slide
    // up a post came as he walked past it, and he walked the floor seeing only the bank's dirt. In the village it stands 220 px on)
    cur = (village ? { ...P[0], x: 200, width: 280 } : { ...P[0], x: 300, width: 400 }) as Platform;
    if (village) hint('Up through the village! Slide up a post to climb', 'Up through the village! Hold up on a post to climb', 'Up through the village! Hold up on a post to climb');
    else if (grotto) hint('Up the sinkhole, toward the moonlight! Slide up a root to climb', 'Up the sinkhole, toward the moonlight! Hold up on a root to climb', 'Up the sinkhole, toward the moonlight! Hold up on a root to climb');
    else if (mist) hint('Up toward the eagle nests, above the mist! Slide up a trunk to climb', 'Up toward the eagle nests, above the mist! Hold up on a trunk to climb', 'Up toward the eagle nests, above the mist! Hold up on a trunk to climb');
    else if (cliff) hint('The ledge broke away! Climb back up. Slide up a trunk to climb', 'The ledge broke away! Climb back up. Hold up on a trunk to climb', 'The ledge broke away! Climb back up. Hold up on a trunk to climb');
    else hint('Slide up on the trunk to climb', 'Hold up on the trunk to climb', 'Hold up on the trunk to climb');
    firstTrunkX = climb(Math.round(R.r(280, 320)), 4);
    // (2-6: a log lying on the floor just past the first ladder, a hop high: a plain walk stops by the ladder instead of carrying him off
    // along the floor, and coming back to it after a fall is a hop over, QA 2026-10-29)
    if (village) P.push({ id: pid++, x: firstTrunkX + 70, y: -40, width: 100, height: 40 + BANK_H, type: 'solid', style: 'log' });
    row(cur.x + 80, cur.x + cur.width - 30, cur.y - 34, 2, 'hibiscus');
    climb(Math.round(R.r(260, 300)), 3);
    flag();
  });

  // ---- 4-6: the wind shutter and the pinwheel lift, first thing above the floor (pinwheelRoom)
  if (mist) beat('Develop: the pinwheel lift', () => {
    // (built going right: when there is no room that way, hop back across the tree first, and up)
    for (let k = 0; k < 4 && !pinwheelRoom(); k++) {
      dir = -1;
      hops(2);
      climb(Math.round(R.r(260, 300)));
    }
    flag();
  });

  // ---- Test: across and up, rope, branch and trunk, back and forth; a side trunk with a hollow
  beat('Test: zigzag up', () => {
    if (mist) hint('A rope! Stand by its post and jump straight up to grab it, then slide the way to go', 'A rope! Stand by its post and jump straight up to grab it, then hold the way to go', 'A rope! Stand by its post and jump straight up to grab it, then hold the way to go', cur.y + 10);
    else hint('Jump up to the rope, then slide along it', 'Jump up to the rope, then hold the way to go', 'Jump up to the rope, then hold the way to go', cur.y + 10);
    // (4-1 sets off up the cliff's wide ledges by hops, 2026-10-28: the tree's first rope is 4-6's)
    if (cliff) hops(2, true);
    else rope(Math.round(R.r(390, 440)), Math.round(R.r(300, 360)));
    climb(Math.round(R.r(270, 320)));
    // (a long branch: the side trunk stands at its near end, the way on at its far end)
    rope(Math.round(R.r(390, 450)), Math.round(R.r(410, 450)));
    // the secret: a side trunk at the near end of this branch, up to a dead end, with a hollow halfway (a golden seed inside)
    {
      const sx = Math.round(dir === 1 ? cur.x + 60 : cur.x + cur.width - 60);
      const h = Math.round(R.r(380, 420));
      trunk(sx, cur.y, cur.y - h);
      const hy = Math.round(cur.y - h * 0.5);
      if (!village) hollows.push({ x: sx, y: hy });
      else villageWindows.push({ x: sx, y: hy });
      seedN++;
      C.push({ id: cid++, type: 'seed', x: sx, y: hy + 4, collected: false, bobPhase: seedN, findId: `seed-${seedN}` });
      const top = ledge(sx - 40, sx + 150, cur.y - h);
      row(top.x + 70, top.x + top.width - 25, top.y - 34, 2, 'hibiscus');
    }
    climb(Math.round(R.r(270, 320)));
    flag();
    // 1-4: the squirrels' lift, the first time (a tap sets the acorn in the low basket)
    if (squirrels) {
      // (built going right: when there is no room that way, hop back across the tree first, and up)
      for (let k = 0; k < 4 && !liftRoom(false); k++) {
        dir = -1;
        hops(2);
        climb(Math.round(R.r(260, 300)));
      }
      flag();
    }
    // 4-1: Dot's knot pulley, once (the basket hangs low beside the lift: stand on it and a tap sets a stone in)
    if (cliff) {
      for (let k = 0; k < 4 && !liftRoom(false, pulley); k++) {
        dir = -1;
        hops(2);
        climb(Math.round(R.r(260, 300)));
      }
      flag();
    }
    hops(R.i(2, 3));
    climb(Math.round(R.r(260, 300)));
    // more of the same until even a quick climber needs most of two minutes (the twist and the crown add the rest)
    let n = 0;
    // (4-6 leaves room for the mist and the nests, which take a while: it is a longer stage, stageSeconds('4-6'))
    // (and since 2026-10-28 its pinwheel lift a second time: a shorter climb across the tree leaves it room, PINWHEEL_AGAIN)
    // (1-4, the variety pass 2026-10-28: the roll's rhythm of hops and ropes, and how often a snake waits: w1Sections.ts w1Kapok)
    const climb14 = squirrels ? w1Kapok(seed) : null;
    while (expert < (mist ? stageSeconds('4-6') - MIST_LEAVES - PINWHEEL_AGAIN : EXPERT_SECONDS - 32) && n < 30) {
      // (4-1, 2026-10-28: the cliff climbs mostly by hops up wide ledges, where its rocks come loose, and a rope now and then: 4-6's
      // climb is the tree's ropes. The stage inspector found the two alike on every measure)
      if (climb14 ? climb14.steps[n % climb14.steps.length] === 'hops' : w4Climb ? w4Climb.hopsAt(n) : cliff ? n % 3 !== 1 : n % 3 === 2) hops(R.i(2, 3), cliff);
      else rope(Math.round(R.r(390, 460)), Math.round(R.r(300, 380)), n % 2 ? 3 : 0);
      // from the third run on, a snake now and then on a wide branch (the punch learned in 1-3 comes back)
      // (the sinkhole is a quiet climb toward the moonlight: nothing prowls on its shelves)
      // (the cliff has its falling rocks instead)
      if (n >= 2 && cur.width >= 320 && R.chance(climb14?.snakes ?? 0.4) && !grotto && !cliff && !mist) snake(cur.x + cur.width / 2, cur.y, cur.width - 140);
      climb(Math.round(R.r(260, 320)));
      n++;
      if (n % 2 === 0) flag();
    }
    // 4-6: the pinwheel lift again, before the mist (the climb across the tree above was the rest of the old zigzag)
    if (mist) {
      for (let k = 0; k < 4 && !pinwheelRoom(); k++) {
        dir = -1;
        hops(2);
        climb(Math.round(R.r(260, 300)));
      }
      flag();
    }
  });

  // ---- 4-6's wind shutter and pinwheel lift (the puzzle kit, puzzleKit.ts 'shutter' and 'pinwheel', 2026-10-28)
  /**
   * A wide branch with a gust lane blowing along it behind a wooden shutter, a pinwheel standing in the lane, a lever by the branch's
   * far end, and past it the lift's plank on its rope in a notch, flush with the branch. A ledge 260 up, too high to jump to, is where
   * the lift goes. The shutter holds the wind back, so the pinwheel stands still. Pull the lever and the shutter opens: each gust spins
   * the pinwheel, and the spinning pinwheel winds the winch, the lift a little higher with him on it each time (a ratchet: it holds
   * where it was wound to; wound with nobody on it, it stays down). The gusts blow toward the lift, softly on the branch. No animal is
   * near, a miss is a hop back up: nothing here costs a life. About 800 px across and 510 tall: an upright phone and a sideways one
   * both show it. Built going right (a room is come into at its left edge, as the check walks it, puzzleCheck.ts).
   */
  function pinwheelRoom(): boolean {
    const FLOOR = 440, WELL = 100, HIGH = 260, RISE = 260;
    const span = FLOOR + WELL + HIGH;
    if (W - KAPOK_MARGIN - (cur.x + cur.width) < span + 10) return false;
    const x0 = cur.x + cur.width;
    // (the branch he is on joins it: it is not in the way)
    const clear = (y: number) => !P.some((p) => p !== P[0] && p !== cur && p.x < x0 + span + 30 && p.x + p.width > x0 - 30 && Math.abs(p.y - y) < 130);
    if (!clear(cur.y) || !clear(cur.y - RISE) || !clear(cur.y - RISE / 2)) return false;
    // (nor over a rope's end post close under the lift's notch: its knot of wood is a step up into the notch, a 150-170 px double jump
    // onto 100 px that the kid bot missed half the time, 2026-10-28)
    const wx = x0 + FLOOR + WELL / 2;
    if (ROPES.some((r) => [[r.x0 + 44, r.g0], [r.x1 - 44, r.g1]].some(([ex, ey]) => Math.abs(ex - wx) < 170 && ey > cur.y && ey - cur.y < 300))) return false;
    dir = 1;
    const y = cur.y;
    const floor = ledge(x0, x0 + FLOOR, y);
    const well = ledge(x0 + FLOOR, x0 + FLOOR + WELL, y + 60);
    const up = ledge(x0 + FLOOR + WELL, x0 + span, y - RISE);
    const n = ROOMS.length;
    // the gust lane: from the shutter to short of the lever, so the lever and the lift stand in still air
    gusts.push({ kind: 'wind', x0: x0 + 130, x1: x0 + 350, top: y - 420, bottom: y, baseY: y, dir: 1, period: 5.6, warn: 1.1, active: 2.2, offset: 0, force: 110 });
    ROOMS.push({
      id: `pinwheel-lift-${n}`,
      left: onL(floor, x0 + 10), right: { on: up.id, at: 1 },
      above: 420, below: 90,
      pieces: [
        { kind: 'reset', id: `post${n}`, at: onL(floor, x0 + 26) },
        { kind: 'shutter', id: `shutter${n}`, at: onL(floor, x0 + 100), zone: gusts.length - 1, open: `lever${n}` },
        { kind: 'pinwheel', id: `pin${n}`, at: onL(floor, x0 + 240) },
        { kind: 'lever', id: `lever${n}`, at: onL(floor, x0 + 400) },
        { kind: 'lift', id: `lift${n}`, at: { on: well.id, at: 0.5, dy: -60 }, w: WELL, rise: RISE, by: `pin${n}`, hold: true },
      ],
      exit: `lift${n}`,
      beyond: { on: up.id, at: 0.5 },
      ground: [floor.id, well.id],
      tips: { enter: 'The lift needs winding. No wind in here.', open: 'Wound right up!', nudge: 'That shutter holds the wind back.', move: 'Pull the lever. Let the wind in.' },
      mech: 'pinwheel',
    });
    row(up.x + 70, up.x + up.width - 70, up.y - 34, 3, 'orchid');
    // (a quick player: the walk in, the lever, and two or three gusts on the lift while the winch takes him up)
    expert += FLOOR / RUN + 1 + 9 + HIGH / RUN;
    cur = up;
    return true;
  }

  // ---- 4-6's twist: up through the mist, three hidden columns, each shown by standing still at its foot
  if (mist) beat('Twist: the mist', () => {
    // up a trunk to the first wide ledge, at the foot of the mist
    const tX = Math.round(dir === 1 ? cur.x + cur.width - 60 : cur.x + 60);
    const out: 1 | -1 = W - KAPOK_MARGIN - (tX - 40) >= MIST_FOOT ? 1 : -1;
    const span = (y: number) => (out === 1 ? [tX - 40, tX - 40 + MIST_FOOT, y] : [tX + 40 - MIST_FOOT, tX + 40, y]) as [number, number, number];
    let h = Math.round(R.r(280, 310));
    for (let k = 0; k < 3 && blocked(...span(cur.y - h)); k++) h += 70;
    trunk(tX, cur.y, cur.y - h);
    for (let i = 0; i < 3; i++) flower(tX, cur.y - 70 - ((h - 110) * i) / 2, 'hibiscus');
    expert += h / CLIMB + 0.8;
    // (no petals here or anywhere in the mist: they are drawn over it, and would give the hidden ledges away)
    cur = ledge(...span(cur.y - h));
    flag();
    const sizes = [2, 4, 5];
    sizes.forEach((n, k) => {
      const foot = cur;
      const cx = Math.round(foot.x + foot.width / 2);
      if (k === 0) hint('Thick mist! Stand still here and it settles to show the ledges. Then remember the way', 'Thick mist! Stand still here and it settles to show the ledges. Then remember the way', 'Thick mist! Stand still here and it settles to show the ledges. Then remember the way', foot.y + 10);
      if (k === 1) hint('Further up this time. Stand still, look hard, and remember', 'Further up this time. Stand still, look hard, and remember', 'Further up this time. Stand still, look hard, and remember', foot.y + 10);
      // the column: one small ledge to a step, in one of three lanes (left, middle, right of the foot), never the same lane twice
      // running unless the dice say so; each a plain hop up from the last
      const rise = R.i(66, 72);
      const hidden: number[] = [];
      let lane = R.i(-1, 1);
      let last = foot;
      for (let i = 1; i <= n; i++) {
        if (i > 1) lane += R.chance(0.2) ? 0 : R.pick([-1, 1].filter((m) => Math.abs(lane + m) <= 1));
        const lx = cx + lane * MIST_LANE;
        last = ledge(lx - MIST_STEP / 2, lx + MIST_STEP / 2, foot.y - i * rise);
        hidden.push(last.id);
        expert += 0.8;
      }
      // the next wide ledge over the top of the column (it catches the next column's misses in turn), shifted a little
      const lastX = last.x + last.width / 2;
      const nx = Math.round(Math.max(lastX - 200, Math.min(lastX + 200, Math.max(KAPOK_MARGIN + MIST_FOOT / 2, Math.min(W - KAPOK_MARGIN - MIST_FOOT / 2, cx + R.r(-90, 90))))));
      const top = ledge(nx - MIST_FOOT / 2, nx + MIST_FOOT / 2, foot.y - (n + 1) * rise);
      hidden.push(top.id);
      // the band it settles: from just under the foot (the first foot stands clear, below the mist) to just over the next wide ledge
      mistSpots.push({
        kind: 'mist', x0: cx - 100, x1: cx + 100, y: foot.y, fill: MIST_FILL, hides: hidden,
        area: { top: top.y - 30, bottom: k === 0 ? foot.y - 40 : foot.y + 40 },
        view: { x: cx, y: Math.round((foot.y + top.y) / 2) },
      });
      expert += MIST_FILL + PATIENCE.settle + 1.2;
      cur = top;
    });
    flag();
  });

  // ---- Twist: the long rope across the widest gap, with the whole crown around him
  if (!mist) beat('Twist: the long rope', () => {
    // set out from the side of the tree that leaves the most room
    dir = cur.x + cur.width / 2 < W / 2 ? 1 : -1;
    hint('A long way across. Keep sliding', 'A long way across. Keep holding the way to go', 'A long way across. Keep holding the way to go', cur.y + 10);
    const gap = Math.min(Math.round(R.r(900, 1050)), Math.round(room() - 340));
    const before = cur.y;
    rope(gap, 340, 6);
    // (1-4: unless the climb's last flag already stands at this height, at the rope's near end)
    if (!squirrels || !checkpoints.some((c) => Math.abs(c.y - before) < 1)) flag();
  });

  // ---- 4-6 after the mist: the nests, then the nests and the mist together, across the tree, and the high mist at the top
  /** 4-6: up a trunk from one end of `cur` (`at`; by default the end with more room past it) to a new ledge `len` long, growing out
   * from the trunk the way there is room for it. Returns the new ledge's near end (where the trunk tops out) and which way it grows */
  const trunkTo = (len: number, at?: 1 | -1) => {
    const side: 1 | -1 = at ?? (W - KAPOK_MARGIN - (cur.x + cur.width) >= cur.x - KAPOK_MARGIN ? 1 : -1);
    const tX = Math.round(side === 1 ? cur.x + cur.width - 60 : cur.x + 60);
    const fitsOut = (d: 1 | -1) => (d === 1 ? W - KAPOK_MARGIN - (tX - 40) : tX + 40 - KAPOK_MARGIN) >= len;
    const d: 1 | -1 = fitsOut(side) ? side : side === 1 ? -1 : 1;
    const x0 = d === 1 ? tX - 40 : tX + 40 - len;
    let h = Math.round(R.r(280, 310));
    for (let k = 0; k < 3 && blocked(x0, x0 + len, cur.y - h); k++) h += 70;
    trunk(tX, cur.y, cur.y - h);
    // (from a little way up the trunk: its foot may be in the top of the mist)
    for (let i = 0; i < 3; i++) flower(tX, cur.y - 140 - ((h - 180) * i) / 2, 'hibiscus');
    expert += h / CLIMB + 0.8;
    cur = ledge(x0, x0 + len, cur.y - h);
    dir = d;
    return { e: d === 1 ? cur.x : cur.x + cur.width, d };
  };
  /** 4-6: a column of `n` small hidden ledges up from height y0, each a plain hop up from the last, in the three lanes around cx */
  const hiddenSteps = (cx: number, y0: number, n: number, rise: number) => {
    const ids: number[] = [];
    let lane = R.i(-1, 1);
    let last: Platform | undefined;
    for (let i = 1; i <= n; i++) {
      if (i > 1) lane += R.chance(0.2) ? 0 : R.pick([-1, 1].filter((m) => Math.abs(lane + m) <= 1));
      const lx = cx + lane * MIST_LANE;
      last = ledge(lx - MIST_STEP / 2, lx + MIST_STEP / 2, y0 - i * rise);
      ids.push(last.id);
      expert += 0.8;
    }
    return { ids, lane, last: last! };
  };
  /** 4-6: the wide ledge over the top of a column (it catches the next column's misses in turn), shifted a little from cx */
  const overColumn = (last: Platform, cx: number, rise: number) => {
    const lastX = last.x + last.width / 2;
    const nx = Math.round(Math.max(lastX - 200, Math.min(lastX + 200, Math.max(KAPOK_MARGIN + MIST_FOOT / 2, Math.min(W - KAPOK_MARGIN - MIST_FOOT / 2, cx + R.r(-90, 90))))));
    return ledge(nx - MIST_FOOT / 2, nx + MIST_FOOT / 2, last.y - rise);
  };
  /** 4-6: a long ledge with a nest in its middle, or two on different rhythms (above the mist, taught alone first) */
  const nestLedge = (len: number, at: number[], reach: number, first: boolean) => {
    const goRight = W - KAPOK_MARGIN - (cur.x + cur.width) >= cur.x - KAPOK_MARGIN;
    const tX = Math.round(goRight ? cur.x + cur.width - 60 : cur.x + 60);
    const d: 1 | -1 = goRight ? 1 : -1;
    const x0 = d === 1 ? tX - 40 : tX + 40 - len;
    let h = Math.round(R.r(280, 310));
    for (let k = 0; k < 3 && blocked(x0, x0 + len, cur.y - h); k++) h += 70;
    trunk(tX, cur.y, cur.y - h);
    // (from a little way up the trunk: its foot is still in the top of the mist)
    for (let i = 0; i < 3; i++) flower(tX, cur.y - 140 - ((h - 180) * i) / 2, 'hibiscus');
    expert += h / CLIMB + 0.8;
    cur = ledge(x0, x0 + len, cur.y - h);
    const e = d === 1 ? cur.x : cur.x + cur.width;
    if (first) hint('Sleeping eaglets! Go while they sleep. When one peeks up, stand still', 'Sleeping eaglets! Go while they sleep. When one peeks up, stand still', 'Sleeping eaglets! Go while they sleep. When one peeks up, stand still', cur.y + 10);
    for (const u of at) {
      const x = Math.round(e + d * u);
      const every = Math.round(R.r(5.4, 6.4) * 10) / 10;
      nests.push({ x, y: cur.y, x0: x - reach, x1: x + reach, every, offset: Math.round(R.r(0, every) * 10) / 10 });
      expert += 2.4;
    }
    // petals between the nests and past them (worth the wait)
    row(e + d * 90, e + d * (at[0] - reach - 40), cur.y - 34, 2, 'hibiscus');
    expert += len / RUN;
    dir = d;
  };
  /**
   * 4-6: the nests and the mist together. A long ledge, clear of the mist, with the mist spot near its far end and the eaglets beside
   * it (`two`: one either side), close enough that the spot and the first step up are in their sight. Standing still on the spot
   * settles the mist and the eaglets do not mind it; then the climb starts in their sight, so it waits for them to doze. The first step
   * is plain to see, under the mist (it starts high enough that the nests stand clear of it); the hidden column goes on up from there,
   * out of their sight, and every miss lands back on the long ledge. Two nests share a rhythm, one waking a moment after the other, so
   * there is always a while when both sleep.
   */
  const NEST_OFF = 150, NEST_SEES = 255, SPOT_IN = 580;
  const nestMist = (two: boolean, n: number, first: boolean, at?: 1 | -1) => {
    // (laid out from the trunk: the way in, the near nest's sight, the spot, the far nest's sight, and room past each to be blown back)
    const push = (NEST.push * NEST.blow) / 2 + 10;
    const len = Math.ceil(SPOT_IN + NEST_SEES - NEST_OFF + push + 10 + (two ? 2 * NEST_OFF : 0));
    const { e, d } = trunkTo(len, at);
    const foot = cur;
    const cx = Math.round(e + d * SPOT_IN);
    checkpoints.push({ x: Math.round(e + d * 100), y: foot.y, reached: false });
    if (first) hint('Eaglets by the mist! Stand still and it settles: they do not mind that. Then climb while they sleep', 'Eaglets by the mist! Stand still and it settles: they do not mind that. Then climb while they sleep', 'Eaglets by the mist! Stand still and it settles: they do not mind that. Then climb while they sleep', foot.y + 10);
    const every = Math.round(R.r(two ? 6.2 : 5.6, two ? 6.6 : 6.4) * 10) / 10;
    const offset = Math.round(R.r(0, every) * 10) / 10;
    const nx = Math.round(cx - d * NEST_OFF);
    nests.push({ x: nx, y: foot.y, x0: nx - NEST_SEES, x1: nx + NEST_SEES, every, offset });
    if (two) {
      const fx = Math.round(cx + d * NEST_OFF);
      // (the same rhythm, a little ahead: it wakes first, then the other, and both sleep again for a while before the next look)
      const lag = Math.round(R.r(1, 1.3) * 10) / 10;
      nests.push({ x: fx, y: foot.y, x0: fx - NEST_SEES, x1: fx + NEST_SEES, every, offset: Math.round(((offset + lag) % every) * 10) / 10 });
    }
    // petals by the trunk, before their sight
    row(e + d * 60, e + d * 120, foot.y - 34, 2, 'hibiscus');
    // the first step, plain to see; then the hidden column above it, all inside the mist
    const step = ledge(cx - MIST_STEP / 2, cx + MIST_STEP / 2, foot.y - 82);
    const rise = R.i(68, 72);
    const col = hiddenSteps(cx, step.y, n, rise);
    const top = overColumn(col.last, cx, rise);
    mistSpots.push({
      kind: 'mist', x0: cx - 100, x1: cx + 100, y: foot.y, fill: MIST_FILL, hides: [...col.ids, top.id],
      area: { top: top.y - 30, bottom: foot.y - 150 },
      view: { x: cx, y: Math.round((foot.y + top.y) / 2) },
    });
    // the walk in, the nests, the mist, the wait for them to doze, the step
    expert += SPOT_IN / RUN + 2.4 * (two ? 2 : 1) + MIST_FILL + PATIENCE.settle + 1.2 + 1.2 + 0.8;
    cur = top;
  };
  /**
   * 4-6: the high mist. A tall column with a ledge to stop on halfway: standing still at the foot settles the lower half and shows the
   * ledge in the middle; standing still on that ledge settles the upper half. Every step stands over the wide ledge at the foot, so a
   * miss from anywhere in it lands there.
   */
  const splitMist = (nLow: number, nHigh: number, first: boolean, at?: 1 | -1) => {
    trunkTo(MIST_FOOT + 80, at);
    const foot = cur;
    flag();
    const cx = Math.round(foot.x + foot.width / 2);
    const rise = R.i(66, 72);
    const low = hiddenSteps(cx, foot.y, nLow, rise);
    // the ledge halfway, over the last step of the lower half (and close enough to the middle that the upper lanes stay over the foot)
    const cm = Math.round(cx + low.lane * 75);
    const mid = ledge(cm - 110, cm + 110, low.last.y - rise);
    mistSpots.push({
      kind: 'mist', x0: cx - 100, x1: cx + 100, y: foot.y, fill: MIST_FILL, hides: [...low.ids, mid.id],
      area: { top: mid.y - 30, bottom: foot.y - 40 },
      view: { x: cx, y: Math.round((foot.y + mid.y) / 2) },
    });
    if (first) hint('A ledge to stop on, halfway up! Stand still on it too, and the mist above settles', 'A ledge to stop on, halfway up! Stand still on it too, and the mist above settles', 'A ledge to stop on, halfway up! Stand still on it too, and the mist above settles', mid.y + 10);
    const high = hiddenSteps(cm, mid.y, nHigh, rise);
    const top = overColumn(high.last, cm, rise);
    // (anywhere on the ledge halfway settles the upper mist: the whole ledge glows, w4Play drawSettleGlow)
    mistSpots.push({
      kind: 'mist', x0: mid.x + 12, x1: mid.x + mid.width - 12, y: mid.y, fill: MIST_FILL, hides: [...high.ids, top.id],
      area: { top: top.y - 30, bottom: mid.y + 40 },
      view: { x: cm, y: Math.round((mid.y + top.y) / 2) },
    });
    expert += 2 * (MIST_FILL + PATIENCE.settle + 1.2) + 0.8;
    cur = top;
  };

  // ---- 4-6: above the mist, the eagle nests. Up a trunk at the end of the ledge to a long ledge with a nest in its middle, alone
  // (taught), then a longer one with two nests on different rhythms
  if (mist) beat('Develop: the nests', () => {
    nestLedge(900, [450], 230, true);
    // (the flag where he arrives, clear of the nest)
    checkpoints.push({ x: Math.round((dir === 1 ? cur.x : cur.x + cur.width) + dir * 100), y: cur.y, reached: false });
    nestLedge(1100, [350, 750], 170, false);
  });

  // ---- 4-6: the nests and the mist together: one nest by the first spot, then one either side of a longer column. The trunk up
  // stands at the far end of the nests' ledge (so they are always passed)
  if (mist) beat('Twist: nests in the mist', () => {
    nestMist(false, 3, true, dir);
    nestMist(true, 4, false);
  });

  // ---- 4-6: across the tree on ropes, high over the mist, with eaglets on the ledges between: hang on at the end of each rope (out of
  // their sight) until they doze. Out one way, up a trunk at the far side and back the other way when there is no room left.
  if (mist) beat('Test: across the tree', () => {
    trunkTo(300);
    flag();
    // (round 5: a roll whose climb is by turns crosses on its ropes to the snakes' ledges, ledgeSnakes below, not the eaglets')
    const snakesAcross = w4Climb?.theme === 'turns';
    if (snakesAcross) hint('All the way across the tree, rope after rope!', 'All the way across the tree, rope after rope!', 'All the way across the tree, rope after rope!', cur.y + 10);
    else hint('All the way across the tree! Stop at the end of each rope, and go while the eaglets doze', 'All the way across the tree! Stop at the end of each rope, and go while the eaglets doze', 'All the way across the tree! Stop at the end of each rope, and go while the eaglets doze', cur.y + 10);
    /** room to land on past the rope, a nest's sight, and room to be blown back and to leave from past it */
    const IN = 140, SEES = 160, GAP2 = 120;
    [1, 2, 1].forEach((k, i) => {
      const minLen = k === 2 ? 2 * IN + 4 * SEES + GAP2 : 2 * IN + 2 * SEES + 40;
      const want = minLen + Math.round(R.r(40, 120));
      if (room() < 380 + minLen) {
        // up a trunk at the far end of this ledge (clear of its nests' sight) to a short ledge heading back across
        const tX = Math.round(dir === 1 ? cur.x + cur.width - 60 : cur.x + 60);
        const x0 = dir === 1 ? tX - 260 : tX - 40;
        let h = Math.round(R.r(280, 310));
        for (let q = 0; q < 3 && blocked(x0, x0 + 300, cur.y - h); q++) h += 70;
        trunk(tX, cur.y, cur.y - h);
        for (let f = 0; f < 3; f++) flower(tX, cur.y - 70 - ((h - 110) * f) / 2, 'hibiscus');
        expert += h / CLIMB + 0.8;
        cur = ledge(x0, x0 + 300, cur.y - h);
        dir = dir === 1 ? -1 : 1;
      }
      const gap = Math.max(360, Math.min(R.i(380, 430), room() - minLen));
      const len = Math.max(minLen, Math.min(want, room() - gap));
      rope(gap, len, 2);
      const e = dir === 1 ? cur.x : cur.x + cur.width;
      const at = snakesAcross ? [] : k === 2 ? [IN + SEES, len - IN - SEES] : [len / 2];
      if (snakesAcross) expert += 1.5;
      for (const u of at) {
        const x = Math.round(e + dir * u);
        const every = Math.round(R.r(5.4, 6.4) * 10) / 10;
        nests.push({ x, y: cur.y, x0: x - SEES, x1: x + SEES, every, offset: Math.round(R.r(0, every) * 10) / 10 });
        expert += 2.4;
      }
      if (i === 1) flag();
    });
  });

  // ---- Finish: up to the crown and the shrine
  beat('Finish: the crown', () => {
    if (mist) {
      // 4-6: the high mist, up past the nests: two tall columns with a ledge to stop on halfway, then the crown and the shrine.
      // (The first trunk stands at the far end of the last ledge across the tree, past its nest.)
      splitMist(2, 3, true, dir);
      splitMist(3, 4, false);
      dir = W - KAPOK_MARGIN - (cur.x + cur.width) >= cur.x - KAPOK_MARGIN ? 1 : -1;
      // the crown, up a trunk at the end of the last column's ledge, out the way there is room
      const tX = Math.round(dir === 1 ? cur.x + cur.width - 60 : cur.x + 60);
      const out = dir === 1 ? W - KAPOK_MARGIN - (tX - 40) >= 560 : tX + 40 - KAPOK_MARGIN < 560;
      const top = cur.y - 300;
      trunk(tX, cur.y, top);
      expert += 300 / CLIMB + 1;
      cur = out ? ledge(tX - 40, tX + 520, top) : ledge(tX - 520, tX + 40, top);
      row(cur.x + 80, cur.x + 300, top - 34, 3, 'hibiscus');
      return;
    }
    climb(Math.round(R.r(280, 320)));
    // 1-4: the squirrels' lift again, its basket hung high now (flick up to throw the acorn in)
    if (squirrels) {
      for (let k = 0; k < 4 && !liftRoom(true); k++) {
        dir = -1;
        hops(2);
        climb(Math.round(R.r(260, 300)));
      }
      flag();
    }
    // (4-1: up the cliff's wide ledges, where its rocks come loose)
    hops(2, cliff);
    // the crown: a wide branch with the shrine on it
    if (room() < 620) dir = dir === 1 ? -1 : 1;
    const tX = Math.round(dir === 1 ? cur.x + cur.width - 60 : cur.x + 60);
    const top = cur.y - 300;
    trunk(tX, cur.y, top);
    expert += 300 / CLIMB + 1;
    if (!cliff) {
      cur = ledge(tX - 40, Math.min(W - KAPOK_MARGIN, tX + 560), top);
      row(cur.x + 80, cur.x + 300, top - 34, 3, 'hibiscus');
      return;
    }
    // the cliff top: a ledge, the gap, and the fern frond at its edge that bridges it for a sloth who waits. The bridge goes toward
    // the side of the stage with the room for it; the shrine's ledge is beyond.
    const lw = 300, fw = 300;
    const gap = Math.round(reachJump(0, true) + 110);
    const right = W - KAPOK_MARGIN - (tX + lw) >= gap + fw;
    const spotLedge = right ? ledge(tX - 40, tX + lw, top) : ledge(tX - lw + 40, tX + 40, top);
    row(spotLedge.x + 60, spotLedge.x + spotLedge.width - 60, top - 34, 2, 'hibiscus');
    const edge = right ? spotLedge.x + spotLedge.width : spotLedge.x;
    const farX0 = right ? edge + gap : edge - gap - fw;
    // the bridge: solid in the stage data (the reachability check counts it), held away by the engine until the frond unrolls (w4Play.ts)
    const bridge = ledge(right ? edge : farX0 + fw, right ? farX0 : edge, top);
    bridge.art = 'frond';
    spot = { kind: 'frond', x0: right ? edge - 120 : edge + 20, x1: right ? edge - 20 : edge + 120, y: top, fill: 4, platformId: bridge.id, dir: right ? 1 : -1 };
    hint('A curled-up fern at the edge. Stand still beside it, and be patient', 'A curled-up fern at the edge. Stand still beside it, and be patient', 'A curled-up fern at the edge. Stand still beside it, and be patient', top + 10);
    expert += 4 + PATIENCE.settle + gap / RUN;
    cur = ledge(farX0, farX0 + fw, top);
    row(cur.x + 60, cur.x + 160, top - 34, 2, 'hibiscus');
  });

  // shift down: the crown sits 400 px under the top of the stage, the floor 120 px over its bottom
  const crown = cur;
  const decor: W2Decor[] = [];
  if (village) {
    // the village on its porches: a round door on every wide one (clear of the posts and the rope ends), a lit window or washing on
    // the others, a chimney and Gruntlewick with his scroll up top, and the lit window where 1-4 has its hollow
    // (only the posts that stand on or rise from this porch, and the ropes tied to it, are in the way)
    const clear = (p: Platform, x: number, half: number) =>
      V.every((v) => v.vineType !== 'tree_climb' || v.topY > p.y + 10 || v.bottomY < p.y - 10 || Math.abs(v.x - x) > half + 40) &&
      ROPES.every((r) => (r.g0 !== p.y && r.g1 !== p.y) || (Math.abs(r.x0 - x) > half + 30 && Math.abs(r.x1 - x) > half + 30));
    let k = 0;
    for (const p of P) {
      if (p === P[0] || p === crown || p.width < 220) continue;
      // try the middle of the porch, then a third of the way along from each end
      const spots = [0.5, 0.33, 0.67].map((u) => p.x + p.width * u);
      const kind = k % 3;
      const half = kind === 0 ? 70 : kind === 1 ? 36 : 85;
      const at = spots.find((x) => clear(p, x, half));
      if (at === undefined) continue;
      k++;
      if (kind === 0) {
        decor.push({ n: 'doorRoof', x: at, b: p.y + 6, w: 150, flip: k % 2 === 0 });
        decor.push({ n: 'lantern', x: at + (k % 2 === 0 ? -92 : 92), b: p.y - 62, w: 26 });
      }
      else if (kind === 1) decor.push({ n: 'window', x: at, b: p.y - 16, w: 62 });
      else decor.push({ n: 'laundry', x: at, b: p.y + 4, w: 160 });
    }
    for (const w of villageWindows) decor.push({ n: 'window', x: w.x, b: w.y + 34, w: 70 });
    decor.push({ n: 'rooftop', x: crown.x + 150, b: crown.y + 4, w: 170 });
    decor.push({ n: 'bell', x: crown.x + crown.width - 330, b: crown.y + 4, w: 96 });
    decor.push({ cel: 'tc.hat_shout', x: crown.x + crown.width - 60, b: crown.y + 2, k: 0.42, flip: true });
    // the floor at the bottom is the river's bank, with reeds
    decor.push({ n: 'reedTall', x: 160, b: 6, w: 64 }, { n: 'reedShort', x: W - 200, b: 6, w: 90 });
  }
  const w3decor: W3Decor[] = [];
  if (grotto) {
    // the sinkhole: moss hanging under the shelves, mushrooms and ferns on them, the clawed rock and stalagmites on the floor,
    // stalactites and glowworm threads up in the dark (clear of the root columns and the ropes)
    const clear = (x: number, y: number, half: number) =>
      V.every((v) => v.vineType !== 'tree_climb' || v.topY > y + 10 || v.bottomY < y - 10 || Math.abs(v.x - x) > half + 30) &&
      ROPES.every((r) => Math.abs(r.y + ROPE_RISE - y) > 20 || (Math.abs(r.x0 - x) > half + 30 && Math.abs(r.x1 - x) > half + 30));
    let k = 0;
    for (const p of P) {
      if (p === P[0] || p.width < 180) continue;
      const at = [0.5, 0.3, 0.7].map((u) => p.x + p.width * u).find((x) => clear(x, p.y, 50));
      if (at === undefined) continue;
      const kind = k++ % 4;
      if (kind === 0) w3decor.push({ n: 'mushrooms', x: at, b: p.y + 6, w: 80 });
      else if (kind === 1) w3decor.push({ n: 'fern', x: at, b: p.y + 6, w: 120, flip: k % 2 === 0 });
      else if (kind === 2) w3decor.push({ n: 'mossCurtain', x: p.x + p.width / 2, b: p.y + 14, w: Math.min(220, p.width * 0.7), hang: true });
      else w3decor.push({ n: 'glowLit', x: at, b: p.y + 20, w: 60, hang: true });
    }
    for (let fx = 200; fx < W - 200; fx += R.r(420, 620)) w3decor.push({ n: R.pick(['stalagmites', 'clawRock', 'mushrooms'] as const), x: Math.round(fx), b: 8, w: Math.round(R.r(110, 170)) });
    // Matt's sinkhole sheet: the sinkhole's wet walls rising either side of the climb, and water trickling down to the floor
    const top = Math.min(...P.map((p) => p.y)) - 300;
    const tileW = 340, tileH = Math.round((340 * 1200) / 1054);
    for (const wx of [tileW / 2 - 40, W - tileW / 2 + 40]) for (let wb = 8; wb > top; wb -= tileH - 6) w3decor.unshift({ n: 'wallTile', x: Math.round(wx), b: Math.round(wb), w: tileW, flip: wx > W / 2 });
    for (const tx of [tileW + 60, W - tileW - 60]) w3decor.push({ n: 'trickle', x: Math.round(tx), b: 8, w: 96 });
  }
  // 4-1: rocks coming loose over the wide ledges of the middle of the climb, clear of every trunk and rope end on that ledge (he can
  // always stop beside one to wait). One rock to a ledge, never on the first ledges (the climb is learned first) or the top.
  const rocks: RockDrop[] = [];
  /**
   * World 4's climbs, harder but still safe (Matt, 2026-10-28, round 4: "Harder, still safe"): rocks coming loose down a trunk's own
   * column while he climbs it, from under the branch the trunk climbs to, warned by grit trickling down first (an `air` rock, as in 4-7).
   * A rock knocks him off the trunk: the climb again, never a life. From the climbs above `below` (the lesson's ledge rock comes first),
   * every trunk after the first, up to `max`.
   */
  const climbRocks = (below: number, max: number): number => {
    const trunks = V.filter((v) => v.vineType === 'tree_climb' && v.bottomY - v.topY >= 200 && v.bottomY < below).sort((a, b) => b.bottomY - a.bottomY);
    let n = 0;
    for (let k = 1; k < trunks.length && n < max; k++) {
      const v = trunks[k];
      const perch = P.find((q) => Math.abs(q.y - (v.topY + 2)) < 4 && q.x <= v.x && q.x + q.width >= v.x);
      // (never in or by a puzzle room: a puzzle never costs a life, nor a knock)
      const land = v.bottomY + 6;
      if (ROOMS.some((rm) => {
        const b = roomBox(rm, P);
        return v.x > b.x0 - 80 && v.x < b.x1 + 80 && land > b.y0 - 80 && land < b.y1 + 80;
      })) continue;
      // (nor onto a snake's patch: one thing at a time)
      if (E.some((e) => Math.abs(e.y + 14 - land) < 40 && v.x > e.patrolMinX - 200 && v.x < e.patrolMaxX + 200)) continue;
      const top = (perch ? perch.y : v.topY) + 24;
      // (nothing else across its column between the branch and the foot, so it falls clean down the trunk)
      if (P.some((q) => q !== perch && q.x < v.x + 30 && q.x + q.width > v.x - 30 && q.y > top && q.y < v.bottomY - 4)) continue;
      const r: RockDrop = { x: Math.round(v.x), top: Math.round(top), land: Math.round(v.bottomY + 6), every: Math.round(R.r(5.4, 6.2) * 10) / 10, warn: 1.6, offset: Math.round(R.r(0, 5) * 10) / 10, air: true };
      if (!rockFits(r)) continue;
      rocks.push(r);
      expert += 1.2;
      n++;
    }
    return n;
  };
  // (round 5: a roll that climbs by turns is the snakes' flavour, 4-1 and 4-6: a snake on the wide ledges, on the part of each clear of
  // the flags (the level check's SAFE_APPROACH, with room to spare) and of the puzzle rooms; World 1's punch comes back, and the rolls
  // differ in what they do, not only in where. Fewer rocks then, and never on a snake's ledge)
  const ledgeSnakes = (skip: (p: Platform) => boolean, margin: number) => {
    const spots = [...checkpoints, { x: crown.x + crown.width / 2, y: crown.y }];
    const wide = P.filter((p) => p !== P[0] && p !== crown && p.width >= 300 && p.y < P[0].y - 400 && p.y > crown.y + 300 && !skip(p)).sort((a, b) => b.y - a.y);
    let lowest = -Infinity;
    for (const p of wide) {
      if (ROOMS.some((rm) => { const b = roomBox(rm, P); return p.x < b.x1 + 160 && p.x + p.width > b.x0 - 160 && p.y > b.y0 - 160 && p.y < b.y1 + 160; })) continue;
      // the stretches of the ledge clear of every flag near its height
      let parts: Array<[number, number]> = [[p.x + margin, p.x + p.width - margin]];
      for (const q of spots) {
        if (Math.abs(q.y - p.y) >= 420) continue;
        parts = parts.flatMap(([a, b]): Array<[number, number]> => [[a, Math.min(b, q.x - 240)], [Math.max(a, q.x + 240), b]]).filter(([a, b]) => b - a >= 120);
      }
      const best = parts.sort((u, v) => v[1] - v[0] - (u[1] - u[0]))[0];
      if (!best || !R.chance(0.85)) continue;
      // (a long clear stretch holds two, each on its own half, with a gap between them to land in)
      const [a, b] = best;
      if (b - a >= 560) {
        const m = (a + b) / 2;
        snake((a + m - 60) / 2, p.y, m - 60 - a);
        snake((m + 60 + b) / 2, p.y, b - m - 60);
      } else snake((a + b) / 2, p.y, b - a);
      lowest = Math.max(lowest, p.y);
    }
    if (lowest > -Infinity) hint('Snakes on the ledges! Punch them or hop over them', 'Snakes on the ledges! Punch them or hop over them', 'Snakes on the ledges! Punch them or hop over them', lowest + 200);
  };
  if (cliff && w4Climb?.theme === 'turns') ledgeSnakes((p) => p.id === spot?.platformId || pulley.plats.includes(p.id), 60);
  if (cliff) {
    // (and since 2026-10-28 up to the last hops under the crown, 300 under it: the frond's ledge and the crown stay quiet)
    const ledges = P.filter((p) => p !== P[0] && p !== crown && p.y < P[0].y - 600 && p.y > crown.y + 300 && p.width >= 260 && p.id !== spot?.platformId && !pulley.plats.includes(p.id)).sort((a, b) => b.y - a.y);
    const climbsAt = (p: Platform) => [
      ...V.filter((v) => v.topY <= p.y + 10 && v.bottomY >= p.y - 10).map((v) => v.x),
      ...ROPES.filter((r) => r.g0 === p.y || r.g1 === p.y).flatMap((r) => [r.x0, r.x1]),
    ];
    // (2026-10-28: one on a ledge of each run of hops up the wide ledges first, then spread up the whole climb, about ten in all: the
    // climb is mostly those hops now, and the rocks are its beat)
    // (round 2, 2026-10-28: a roll whose climb is by hops is the rockfall flavour, a rock over every wide ledge it can, up to sixteen)
    // (round 3: every 4-1 roll, World 4 sitting above World 3: the warning stays 1.4 s, so each rock is fair, there are just more)
    // (round 5: the rockfall is the hops' flavour; a roll by ropes or by turns (its snakes) has a few, so the rolls differ in what
    // they hold)
    const rockFlavour = w4Climb?.theme === 'hops';
    const every = rockFlavour ? 1 : Math.max(1, Math.floor(ledges.length / 6));
    const inGroup = (g: number[]) => [g[Math.floor(g.length / 2)], ...g].map((id) => ledges.find((p) => p.id === id)).filter((p): p is Platform => !!p);
    const order = [...hopGroups.map(inGroup), ...ledges.filter((_, k) => k % every === 0).map((p) => [p])];
    for (const tries of order) {
      if (rocks.length >= (rockFlavour ? 16 : w4Climb?.theme === 'ropes' ? 3 : 5)) break;
      for (const p of tries) {
        if (rocks.some((q) => q.land === p.y)) continue;
        // (not over a snake's ledge: one thing at a time)
        if (E.some((e) => Math.abs(e.y + 14 - p.y) < 6 && e.x > p.x - 40 && e.x < p.x + p.width + 40)) continue;
        const busy = climbsAt(p);
        const rx = [0.5, 0.38, 0.62].map((u) => Math.round(p.x + p.width * u)).find((rx) => busy.every((bx) => Math.abs(bx - rx) > ROCK.radius + 90));
        if (rx === undefined) continue;
        // it falls from the underside of whatever ledge hangs over this one, or from high above
        const over = P.filter((q) => q.y < p.y - 60 && q.x < rx + ROCK.radius && q.x + q.width > rx - ROCK.radius).reduce((m, q) => Math.max(m, q.y + 24), p.y - 460);
        const r: RockDrop = { x: rx, top: over, land: p.y, every: Math.round(R.r(4.6, 5.6) * 10) / 10, warn: 1.4, offset: Math.round(R.r(0, 5) * 10) / 10 };
        if (!rockFits(r)) continue;
        rocks.push(r);
        expert += 1.6;
        break;
      }
    }
    // (round 4: rocks down the trunks too, from above the lowest ledge rock: the ledge's lesson comes first)
    const ledgeFirst = rocks.reduce((m, q) => Math.max(m, q.land), -Infinity);
    if (ledgeFirst > -Infinity) climbRocks(ledgeFirst, rockFlavour ? 10 : 4);
    // (Dot names the first one he comes to: the lowest; as he climbs up toward its ledge, a trunk's height below it, so the line is
    // up before he stands under the rock: at its own height it came after the first hit on some rolls, 2026-10-28)
    const firstRock = rocks.reduce<RockDrop | undefined>((a, q) => (!a || q.land > a.land ? q : a), undefined);
    if (firstRock) hint(ROCKS_LOOSE, ROCKS_LOOSE, ROCKS_LOOSE, firstRock.land + 280);
  }

  /**
   * A knot of wood at each end of a high branch where a step too far drops him `drop` px or more (or at a rope's post), so a plain walk
   * stops there instead of carrying him into a long fall; he can still hop over it. Returns the knots. `floor` (2-6): the drop is where
   * a walk off lands (walkOff), and an end onto the floor gets one too; `doubt`: every knot is listed there for the level check to judge
   * (one that saves a move goes), and knots under a ledge a double jump off their top might reach are made anyway (2-6: a knot's top was
   * a step up to a porch 180 px up and 130 px across, a double jump the kid bot made 78% of the time).
   */
  const knots = (drop: number, o: { floor?: boolean; doubt?: Platform[] } = {}): Platform[] => {
    const LIP = { w: 18, h: 56 };
    const made: Platform[] = [];
    /**
     * Where a walk off the end of p lands (`floor`, 2-6): the arc of a walk off at a run, held on the way it was going (he carries on
     * well past the end as he falls: 30 and 80 px past it missed porches below that he sails over), and how far down that is. An end
     * that drops him to the floor gets a knot however short the fall.
     */
    const walkOff = (p: Platform, end: number, side: 1 | -1): { drop: number; floor: boolean } => {
      let y = 0, vy = 0;
      for (let t = 0; t < 4; t += 1 / 60) {
        const x = end + side * (8 + PHYS.maxRun * t);
        const y1 = y + vy / 60;
        vy = Math.min(PHYS.maxFall, vy + PHYS.gravDown / 60);
        // (a landing within 60 px of a porch's end counts as a miss: he comes down on the knot there, half his body past it, and walks on
        // off it)
        const hit = P.filter((q) => q !== p && !q.lip && q.y - p.y > y && q.y - p.y <= y1 && q.x + 60 <= x && q.x + q.width - 60 >= x);
        if (hit.length) {
          const q = hit.reduce((a, b) => (b.y < a.y ? b : a));
          return { drop: q.y - p.y, floor: q === P[0] };
        }
        y = y1;
      }
      return { drop: Infinity, floor: false };
    };
    const dropAt = (p: Platform, x: number) => {
      const under = P.filter((q) => q !== p && q.y > p.y && q.x <= x + 19 && q.x + q.width >= x - 19);
      return under.length ? Math.min(...under.map((q) => q.y)) - p.y : Infinity;
    };
    for (const p of [...P]) {
      if (p === P[0] || p.height !== 24 || p.width < 150) continue;
      for (const side of [-1, 1] as const) {
        const end = side < 0 ? p.x : p.x + p.width;
        // (and at an end where a rope's post stands: walking up to the post he used to run past it and off the end, 44 px on, before
        // he could jump up to the rope; the knot stops him at the post. Hanging, he passes over it, and he steps off the rope beyond it)
        const post = ROPES.some((q) => (side > 0 ? Math.abs(q.x0 + 44 - end) < 2 : Math.abs(q.x1 - 44 - end) < 2) && Math.abs(q.g0 - p.y) < 2);
        const off = o.floor ? walkOff(p, end, side) : null;
        if (!post && (off ? off.drop < drop && !off.floor : Math.max(dropAt(p, end + side * 30), dropAt(p, end + side * 80)) < drop)) continue;
        // (never under a ledge a double jump off the knot's top would reach: under a mist column's top it was a step up past the hidden
        // ledges, a 150 px jump straight up that the kid bot made 54-65% of the time, 2026-10-28. A fall here costs a climb, not a life)
        // (a knot under a rope's post stays: the post needs it; the engine's walls are 50 px or taller, so it cannot be made lower)
        const lx = side < 0 ? end : end - LIP.w;
        const over = P.some((q) => q !== p && q.y < p.y && p.y - LIP.h - q.y < DOUBLE_RISE + 30 && q.x < lx + LIP.w + 60 && q.x + q.width > lx - 60);
        // (`doubt`: kept for now, and the level check takes it away if it saves a move, as it does the catch branches below)
        if (over && !post && !o.doubt) continue;
        // (nor where the next branch is a hop away at about the same height, round 4: a knot at both ends of a 70 px gap made the hop clear
        // two walls, a 100 ms press on Easy; a slip into that gap drops to a branch or the floor, the climb again, never a life)
        const hopNext = P.some((q) => q !== p && q.height === 24 && Math.abs(q.y - p.y) < 90 && (side > 0 ? q.x >= end && q.x - end < 200 : end >= q.x + q.width && end - (q.x + q.width) < 200));
        if (hopNext && !post) continue;
        const knot: Platform = { id: pid++, x: lx, y: p.y - LIP.h, width: LIP.w, height: LIP.h, type: 'solid', style: 'branch', lip: true };
        P.push(knot);
        made.push(knot);
        o.doubt?.push(knot);
      }
    }
    return made;
  };

  // 2-6 (QA 2026-10-29, ?layout=1: "plank ends walk you off to the floor"): the same knots at the porches' dead ends where a step too far
  // drops him past the porch below (400 px or more: a climb back is one ladder, a fall past it a long way back) or onto the floor (where
  // he walked off along the bank, away from the ladders); each is a mailbox on its post (the World 2 sheet: placed once the level check
  // has had its say, below)
  /** the knots for the level check to judge (it keeps only those that save no move) */
  const doubtKnots: Platform[] = [];
  const villageKnots = village ? knots(400, { floor: true, doubt: doubtKnots }) : [];

  // 4-6: the ends of the branches high in the tree where a step too far drops him a very long way (the floor, or a ledge far below):
  // a knot of wood stands at each such end, a little wall, so he cannot walk off into a ten-second fall (he can still hop over it). And
  // a trail of petals along the floor leads back to the one trunk that climbs up from it.
  if (mist) {
    knots(600);
    for (let x = firstTrunkX + 260; x < W - KAPOK_MARGIN - 60; x += 300) flower(x, P[0].y - 34, 'hibiscus');
    // (round 4, harder but still safe: rocks down the trunks above the mist, Dot's 4-1 line when he first climbs toward one)
    const firstMist = mistSpots.reduce((m, q) => Math.max(m, q.y), -Infinity);
    // (round 5: the snakes' flavour here too, never in the mist (its feet, its hidden ledges and the ledges over them) nor by a nest,
    // clear of the knots at the branch ends; and the rocks down the trunks are the hops' flavour, a few in the others)
    if (w4Climb?.theme === 'turns') {
      const misty = new Set(mistSpots.flatMap((m) => m.hides));
      ledgeSnakes((p) => misty.has(p.id) || mistSpots.some((m) => Math.abs(m.y - p.y) < 4 && m.x0 < p.x + p.width && m.x1 > p.x) || nests.some((q) => Math.abs(q.y - p.y) < 4 && q.x > p.x - 200 && q.x < p.x + p.width + 200), 110);
    }
    if (firstMist > -Infinity && climbRocks(firstMist - 200, w4Climb?.theme === 'hops' ? 12 : 4)) {
      const low = rocks.reduce((m, q) => Math.max(m, q.land), -Infinity);
      hint(ROCKS_LOOSE, ROCKS_LOOSE, ROCKS_LOOSE, low + 120);
    }
  }

  // ---- catch branches (round 6, 2026-10-29; Matt's call: catch ledges under high planks in tall climbs). A miss at a hop gap of the
  // climb fell to the floor or a ledge far below, up to the whole climb lost (4-1 seed 1: 1,940 px). Under every hop gap with more than
  // CATCH.max under it goes a short branch a body and a half down, a double jump back up to the lower of the gap's two planks. It is
  // placed last, and only where nothing under it can jump up to it and nothing stands in its column, so the only ways onto it are a
  // miss above and back from it to its own planks: never a shortcut (the level check's route is unchanged, w4Catch.test.ts).
  const catches: Array<{ plat: number; planks: [number, number] }> = [];
  /** the gap between planks a (left) and b closed, the higher run on to meet the lower, where nothing is in the way: false if not */
  const closeGap = (a: Platform, b: Platform): boolean => {
    const gl = a.x + a.width, gr = b.x;
    const hi = a.y >= b.y ? b : a;
    const clearRun = !P.some((q) => q !== a && q !== b && q.x < gr + 30 && q.x + q.width > gl - 30 && Math.abs(q.y - hi.y) < 120) &&
      !V.some((v) => v.x > gl - 40 && v.x < gr + 40 && v.bottomY > hi.y - 160 && v.topY < hi.y + 40) &&
      !ROPES.some((r) => r.x1 > gl - 60 && r.x0 < gr + 60 && r.y > hi.y - 200 && r.y < hi.y + 40);
    if (!clearRun) return false;
    if (hi === b) { b.width += b.x - gl; b.x = gl; }
    else a.width = gr - a.x;
    return true;
  };
  if (cliff || mist) {
    const CATCH = { max: 400, rises: [150, 165, 135, 175], reach: DOUBLE_RISE + 15 };
    const made = new Set<number>();
    const misty = new Set(mistSpots.flatMap((m) => m.hides));
    const firstUnder = (x: number, y: number) => P.reduce((m, q) => (q.x <= x && q.x + q.width >= x && q.y > y + 4 ? Math.min(m, q.y) : m), Infinity);
    const planks = P.filter((p) => p !== P[0] && p !== crown && p.height === 24 && !p.lip && p.width >= 60 && !misty.has(p.id));
    /** from q to p in one move: a drop, or a jump across (a double jump's rise; a trunk is two moves, up it and off it, so it is not) */
    const linked = (q: Platform, p: Platform) => {
      const dx = Math.max(0, p.x - (q.x + q.width), q.x - (p.x + p.width));
      return dx <= 260 && q.y - p.y <= DOUBLE_RISE;
    };
    for (const a of planks) for (const b of planks) {
      if (b.x < a.x + a.width) continue;
      const gl = a.x + a.width, gr = b.x, g = gr - gl;
      if (g < 20 || g > 260 || Math.abs(a.y - b.y) > 110) continue;
      // (a branch across the gap between them: not a gap)
      if (P.some((c) => c !== a && c !== b && c.x < gr && c.x + c.width > gl && Math.abs(c.y - (a.y + b.y) / 2) < 60)) continue;
      const top = Math.max(a.y, b.y);
      const drop = Math.max(...[gl + 10, gl + g / 2, gr - 10].map((x) => firstUnder(x, top))) - top;
      if (drop <= CATCH.max) continue;
      const low = a.y >= b.y ? a : b;
      // (trimmed clear of a trunk close by, as long as it still spans the gap)
      let x0 = Math.max(KAPOK_MARGIN, gl - 70), x1 = Math.min(W - KAPOK_MARGIN, gr + 70);
      for (const v of V) if (v.bottomY > top - 20 && v.topY < low.y + 240) {
        if (v.x >= gr && v.x - 45 < x1) x1 = Math.max(gr, v.x - 45);
        if (v.x <= gl && v.x + 45 > x0) x0 = Math.min(gl, v.x + 45);
      }
      const ok = (y: number) => {
        // whatever can jump up to it, or that it can jump up to, reaches the gap's planks in one move already: so it opens no way that was
        // not there and saves no move; and nothing in its column between the planks and it
        const near = (q: Platform) => q !== a && q !== b && !made.has(q.id) && Math.max(0, x0 - (q.x + q.width), q.x - x1) <= 260 && Math.abs(q.y - y) <= CATCH.reach;
        if (P.some((q) => near(q) && (q === P[0] || !(linked(q, a) || linked(q, b))))) return false;
        if (P.some((q) => q !== a && q !== b && q.x < x1 + 20 && q.x + q.width > x0 - 20 && q.y > top - 30 && q.y < y + 30)) return false;
        // no vine, trunk or rope through it
        if (V.some((v) => v.x > x0 - 40 && v.x < x1 + 40 && v.bottomY > top - 20 && v.topY < y + 60)) return false;
        // (nor a trunk he could jump off sideways onto it, unless that trunk tops out on one of the gap's planks: then it saves no move)
        const topsOn = (v: Vine, p: Platform) => Math.abs(v.topY + 2 - p.y) < 12 && v.x >= p.x - 60 && v.x <= p.x + p.width + 60;
        if (V.some((v) => Math.max(0, x0 - v.x, v.x - x1) <= 260 && v.bottomY > y - DOUBLE_RISE && v.topY < y + 200 && !topsOn(v, a) && !topsOn(v, b))) return false;
        if (ROPES.some((r) => r.x1 > x0 - 60 && r.x0 < x1 + 60 && r.y + HANG_DROP + 100 > top + 30 && r.y < y + 30)) return false;
        if (ROOMS.some((rm) => { const bx = roomBox(rm, P); return x1 > bx.x0 - 60 && x0 < bx.x1 + 60 && y > bx.y0 - 60 && top < bx.y1 + 60; })) return false;
        if (mistSpots.some((m) => m.area && x1 > m.x0 - 300 && x0 < m.x1 + 300 && y > m.area.top - 60 && top < m.area.bottom + 60)) return false;
        if (nests.some((q) => q.x > x0 - 320 && q.x < x1 + 320 && q.y > top - 60 && q.y < y + 60)) return false;
        if (E.some((e) => e.x > x0 - 240 && e.x < x1 + 240 && e.y + 14 > top + 20 && e.y < y + 60)) return false;
        if (rocks.some((r) => r.x > x0 - 120 && r.x < x1 + 120 && r.land > top + 20 && r.land < y + 60)) return false;
        return true;
      };
      const y = CATCH.rises.map((rz) => low.y + rz).find(ok);
      if (y === undefined) {
        // (no room for a catch, a rope hanging under the gap or a room by it: the gap is closed instead, the higher plank run on to
        // meet the lower, so the hop is a step up with nothing to miss)
        closeGap(a, b);
        continue;
      }
      const c = ledge(x0, x1, y);
      made.add(c.id);
      catches.push({ plat: c.id, planks: [a.id, b.id] });
    }
  }

  const shift = 400 - crown.y;
  for (const r of rocks) { r.top += shift; r.land += shift; }
  for (const z of gusts) { z.top += shift; z.bottom += shift; z.baseY += shift; }
  if (spot) spot.y += shift;
  for (const m of mistSpots) {
    m.y += shift;
    m.area!.top += shift;
    m.area!.bottom += shift;
    m.view!.y += shift;
  }
  for (const n of nests) n.y += shift;
  for (const d of w3decor) d.b += shift;
  for (const p of P) p.y += shift;
  for (const v of V) { v.topY += shift; v.bottomY += shift; }
  for (const t of T) { t.groundY += shift; t.topY += shift; }
  for (const c of C) c.y += shift;
  for (const e of E) e.y += shift;
  for (const r of ROPES) { r.y += shift; r.g0 += shift; r.g1 += shift; }
  for (const cp of checkpoints) cp.y += shift;
  for (const h of hollows) h.y += shift;
  for (const d of decor) d.b += shift;
  for (const h of hints) if (h.aboveY !== undefined) h.aboveY += shift;
  for (const b of beats) { b[0] += shift; b[1] += shift; }
  const floorY = P[0].y;
  const H = floorY + 120;
  // the bank's face rises from the floor to just under the top porch, where the village opens onto the sky
  const bankWall = village ? { x0: 0, x1: W, top: crown.y + 40, bottom: floorY + 10 } : undefined;
  const exitX = Math.round(crown.x + crown.width - 140);
  C.push({ id: cid++, type: 'exit_totem', x: exitX, y: crown.y - 30, collected: false, bobPhase: 0 });
  cid = heartsAtFlags(C, checkpoints, cid);

  // the lift rooms' own platforms (each lift's plank), added once the tree has been moved into place: placed from the branches they hang on
  const kit: KitExtras | undefined = ROOMS.length ? { rooms: ROOMS } : undefined;
  if (kit) addKitPlatforms(P, kit);
  const movedPickups = fixPickups({ platforms: P, vines: V, ropes: ROPES }, C);
  const cfg: LevelConfig = { ...config, levelWidth: W, levelHeight: H };
  const out = {
    config: cfg,
    trees: T,
    platforms: P,
    vines: V,
    ropes: ROPES,
    enemies: E,
    boss: null,
    collectibles: C,
    spawnX: 200,
    spawnY: floorY,
    exitTotemX: exitX,
    exitTotemY: crown.y,
    checkpoints: checkpoints.sort((a, b) => b.y - a.y),
    meta: { attempt: seed, chunks: [], width: W, timing: { layoutSeconds: expert, decorSeconds: 0, route: H } },
    ...(kit ? { kit } : {}),
    ...(gusts.length ? { zones: gusts } : {}),
    proto: {
      hints, covers: [], beats, movedPickups, hollows, ...(catches.length ? { catches } : {}), ...(decor.length ? { decor } : {}), ...(w3decor.length ? { w3decor } : {}), ...(bankWall ? { bankWall, ladders: true } : {}),
      ...(cliff ? { w4: { rocks, patience: spot ? [spot] : [], rockTip: ROCKS_LOOSE } } : {}),
      ...(mist ? { w4: { patience: mistSpots, nests, floor: { y: floorY, trunkX: firstTrunkX }, ...(rocks.length ? { rocks, rockTip: ROCKS_LOOSE } : {}) } } : {}),
    },
  };
  // (the catch branches, judged by the level check itself: one that lets any place be reached in fewer moves than without the catches
  // is taken away, and its gap closed instead where it can be. The rules above keep most clear; this catches the rest. 2-6's knots the
  // same way: one that saves a move is taken away)
  if (catches.length || doubtKnots.length) {
    let g: CheckGraph | null = null;
    validateStage(out as unknown as GeneratedStage, { inspect: (q) => (g = q) });
    const graph = g as CheckGraph | null;
    if (graph) {
      const ck = new Map<string, { plat: number; planks?: [number, number] }>([
        ...catches.map((c) => [graph.key(P.find((p) => p.id === c.plat)!), c] as const),
        ...doubtKnots.map((k) => [graph.key(k), { plat: k.id }] as const),
      ]);
      const start = graph.key(P[0]);
      const bfs = (skip: (k: string) => boolean) => {
        const d = new Map<string, number>([[start, 0]]);
        const queue = [start];
        while (queue.length) {
          const k = queue.shift()!;
          for (const n of graph.adj.get(k) ?? []) if (!skip(n) && !d.has(n)) { d.set(n, d.get(k)! + 1); queue.push(n); }
        }
        return d;
      };
      const without = bfs((k) => ck.has(k));
      const gone = new Set<string>();
      for (let round = 0; round < 50; round++) {
        const withC = bfs((k) => gone.has(k));
        // the catches on a way that reaches somewhere as soon as without them, or sooner (a tie would let the route take the catch)
        const bad = [...ck.keys()].filter((k) => !gone.has(k) && withC.has(k) && [...(graph.adj.get(k) ?? [])].some((w) => withC.get(k)! + 1 === withC.get(w) && withC.get(w)! <= (without.get(w) ?? Infinity)));
        if (!bad.length) break;
        for (const k of bad) gone.add(k);
      }
      for (const k of gone) {
        const c = ck.get(k)!;
        P.splice(P.findIndex((p) => p.id === c.plat), 1);
        if (!c.planks) {
          villageKnots.splice(villageKnots.findIndex((q) => q.id === c.plat), 1);
          continue;
        }
        catches.splice(catches.indexOf(c as (typeof catches)[number]), 1);
        const [a, b] = c.planks.map((id) => P.find((p) => p.id === id)!);
        closeGap(a, b);
      }
    }
  }
  // 2-6's knots: a mailbox on its post (its post 6% of the picture right of its middle: flipped, as far left), facing either way, and
  // every third a signpost (its post in the middle), so some fifty of them never read as one piece repeated (STAGE-RULES §5b)
  villageKnots.forEach((k, i) => {
    k.art = 'post';
    const b = k.y + k.height + 2, cx = k.x + k.width / 2;
    if (i % 3 === 2) decor.push({ n: 'sign', x: Math.round(cx), b, w: 50 });
    else {
      const flip = (i + Math.floor(i / 3)) % 2 === 1;
      decor.push({ n: 'mailbox', x: Math.round(cx + (flip ? 2 : -2)), b, w: 38, flip });
    }
  });
  return out;
}

// ---------------------------------------------------------------------------------------------------------------------------
// 1-8 The Long Branch: the chase (World 1's special stage)

/** one section of the long branch: one painted tile (Matt's repeating log, 370 x 100, drawn 60 high) */
export const BRANCH_TILE = 222;

/**
 * 1-8 The Long Branch: a huge branch high in the canopy, and a chase (chase.ts). Learn: run the branch, calm, a couple of easy gaps.
 * Test: it cracks and starts to fall away behind him; gaps, snakes, a swing over a break, a trunk up to a higher branch, a drop to a
 * lower one, and a fast line above for players who never stop. Twist: the collapse speeds up, the branch thins to its tip, and the
 * last liana swings him off it to the shrine on the next tree. Caught or off the branch: a heart, back to the flag (chase.ts).
 */
function buildLongBranch(config: LevelConfig, seed: number): GeneratedStage & { proto: ProtoExtras } {
  const R = stream(seed);
  const P: Platform[] = [];
  const V: Vine[] = [];
  const T: TreeStructure[] = [];
  const E: Enemy[] = [];
  const C: Collectible[] = [];
  const checkpoints: Array<{ x: number; y: number; reached: boolean }> = [];
  const hints: StageHint[] = [];
  const beats: Array<[number, number, string]> = [];
  let pid = 1, vid = 1, tid = 1, eid = 1, cid = 1, seedN = 0;
  let expert = 0;
  const RUN = 285, SWING = 430, CLIMB = 220;
  const TILE = BRANCH_TILE;
  let x = 0;
  let level = G;

  const flower = (fx: number, fy: number, v: Collectible['botanicalVariant'] = 'orchid') =>
    C.push({ id: cid++, type: 'flower', botanicalVariant: v, x: Math.round(fx), y: Math.round(fy), collected: false, bobPhase: (fx * 0.031) % 6.28 });
  const row = (x0: number, x1: number, fy: number, n: number, v: Collectible['botanicalVariant'] = 'orchid') => {
    for (let i = 0; i < n; i++) flower(x0 + ((x1 - x0) * i) / Math.max(1, n - 1), fy, v);
  };
  const hint = (hx: number, text: string) => hints.push({ x: hx, text, pad: text, keys: text });
  const flag = () => checkpoints.push({ x: Math.round(x - TILE / 2), y: level, reached: false });
  /** n sections of branch at the current height */
  const sec = (n: number, w = TILE) => {
    for (let k = 0; k < n; k++) {
      P.push({ id: pid++, x: Math.round(x), y: level, width: w, height: 40, type: 'solid', chase: true });
      x += w;
    }
    expert += (n * w) / RUN;
  };
  const gap = (w: number) => {
    x += Math.round(w);
    expert += w / RUN + 0.15;
  };
  const snake = (sx: number, range: number) => {
    E.push({
      id: eid++, type: 'snake', x: sx, y: level - 14, vx: 28, vy: 0, width: 38, height: 22, hp: 1, maxHp: 1, facing: -1,
      patrolMinX: sx - range / 2, patrolMaxX: sx + range / 2, attackCooldown: 2, telegraphTimer: 0, isAttacking: false,
      animTimer: 0, hitFlashTimer: 0, defeated: false, koTimer: 0, behaviorTimer: 0,
    } as Enemy);
    expert += 1;
  };
  const one = reachJump(0, false), two = reachJump(0, true);

  /** a break in the branch with one liana over it (checked against the swing physics), landing on the branch beyond */
  const swingGap = () => {
    const edge = x;
    for (let tries = 0; tries < 14; tries++) {
      const easy = tries > 8;
      const d0 = R.r(170, 200);
      const d1 = easy ? R.r(190, 220) : R.r(200, 245);
      const top = Math.round(level - R.r(360, 400));
      const v: Vine = { id: -1, x: edge + d0, topY: top, bottomY: Math.min(level + 30, top + 410), swaySpeed: 1.1, swayPhase: 0, vineType: 'swing_liana', isSwingingVine: true };
      const far: Platform = { id: -99, x: edge + d0 + d1, y: level, width: TILE * 3, height: 40, type: 'solid' };
      if (!(jumpGrab(edge, level, v) >= 4 && landWindow(null, v, far) >= 8) && tries < 13) continue;
      V.push({ ...v, id: vid++, swayPhase: (v.x * 0.013) % 6.28 });
      row(edge + 30, edge + d0 + d1 - 30, Math.min(level - 150, top + 200), 3, 'hibiscus');
      x = Math.round(edge + d0 + d1);
      expert += (d0 + d1) / SWING + 0.6;
      return;
    }
  };
  /** the branch meets a trunk: climb it to a higher branch that carries on */
  const climbUp = (h: number) => {
    const tX = Math.round(x - 60);
    const tree: TreeStructure = { id: tid++, x: tX, groundY: level, topY: level - h - 150, trunkWidth: 76, hasClimbVine: true, canopyRadius: 150 };
    T.push(tree);
    V.push({ id: vid++, x: tX, topY: level - h - 2, bottomY: level - 6, swaySpeed: 0.9, swayPhase: (tX * 0.007) % 6.28, vineType: 'tree_climb', treeId: tree.id });
    for (let i = 0; i < 3; i++) flower(tX, level - 70 - i * 60, 'hibiscus');
    level -= h;
    x = tX - 40;
    expert += h / CLIMB + 0.8;
  };
  /** a short drop to a lower branch */
  const dropDown = (h: number) => {
    gap(Math.round(one * R.r(0.3, 0.45)));
    level += h;
  };
  /** the fast line: a few short branches above the main one (petals, and at its end a golden seed), for players who never stop */
  const fastLine = () => {
    const y0 = level;
    let fx = x + TILE * 0.6;
    const hy = y0 - Math.round(R.r(140, 155));
    for (let k = 0; k < 3; k++) {
      const w = 170;
      P.push({ id: pid++, x: Math.round(fx), y: hy, width: w, height: 40, type: 'solid', chase: true });
      row(fx + 40, fx + w - 40, hy - 34, 2, 'hibiscus');
      if (k === 2) {
        seedN++;
        C.push({ id: cid++, type: 'seed', x: Math.round(fx + w - 30), y: hy - 40, collected: false, bobPhase: seedN, findId: `seed-${seedN}` });
      }
      fx += w + Math.round(one * R.r(0.45, 0.55));
    }
  };
  const beat = (name: string, f: () => void) => {
    const b0 = x;
    f();
    beats.push([b0, x, name]);
  };

  // ---- Learn: the long branch, calm
  /**
   * a mossy knot on the branch, one easy hop high, in place of a stretch of it (its foot reaches the branch's underside: on top of a
   * section the stage inspector's quick route walked through it). Only in the calm, before the branch starts to fall.
   */
  const knot = () => {
    const w = Math.round(R.r(100, 120));
    P.push({ id: pid++, x: Math.round(x), y: level - 36, width: w, height: 76, type: 'solid', style: 'moss_stone' });
    flower(x + w / 2, level - 70, 'orchid');
    x += w;
    expert += w / RUN + 0.15;
  };
  beat('Learn: the long branch', () => {
    // (seven sections before the first gap: over four seconds of running, so the gap's tip is up before he can fall. With four, a plain
    // run fell in at 3.3 s: stageStart.test.ts. Since 2026-10-28 two mossy knots to hop among them, where the calm read as five quiet
    // seconds on every roll)
    sec(2);
    knot();
    sec(2);
    knot();
    sec(2);
    hint(300, 'This branch goes on and on');
    row(x - TILE * 3, x - 60, level - 34, 3, 'hibiscus');
    gap(one * 0.4);
    sec(1);
    knot();
    sec(1);
    // World 1's book hides in a Hush Fern here, in the calm before the chase (stage 8 holds the book: finds.ts); nobody can crouch
    // and search once the branch is falling
    const book = findForStage(config.worldIndex, config.miniIndex);
    if (book && book.kind === 'book') C.push({ id: cid++, type: 'find', findId: book.id, hidden: true, x: Math.round(x - TILE * 1.5), y: level - 26, collected: false, bobPhase: 0 });
    gap(one * 0.5);
    sec(3);
    flag();
    sec(1);
    knot();
    sec(1);
  });
  const start = x;

  // ---- Test: it breaks behind him; keep moving
  beat('Test: keep moving', () => {
    sec(4);
    row(x - TILE * 3, x - 80, level - 34, 3, 'orchid');
    gap(one * R.r(0.45, 0.55));
    sec(3);
    snake(x - TILE * 1.5, TILE * 1.6);
    sec(2);
    gap(two * R.r(0.62, 0.7));
    sec(3);
    flag();
    swingGap();
    sec(3);
    climbUp(Math.round(R.r(190, 220)));
    sec(4);
    fastLine();
    sec(4);
    flag();
    dropDown(Math.round(R.r(120, 160)));
    sec(3);
    snake(x - TILE * 1.5, TILE * 1.6);
    sec(2);
    // more of the same, in this roll's rhythm (w1Sections.ts w1Chase: leaps, swings, or climbs and drops), until even a quick player
    // needs most of two minutes
    const pattern = w1Chase(seed);
    let n = 0;
    while (expert < EXPERT_SECONDS - 22 && n < 40) {
      const k = pattern[n % pattern.length];
      if (k === 'gap') { gap(one * R.r(0.45, 0.6)); sec(3); }
      else if (k === 'leap') { gap(two * R.r(0.6, 0.72)); sec(3); row(x - TILE * 2, x - 60, level - 34, 2, 'orchid'); }
      else if (k === 'swing') { swingGap(); sec(3); }
      else if (k === 'snake') { sec(2); snake(x - TILE, TILE * 1.4); sec(2); }
      else { if (level < G - 100) dropDown(Math.round(R.r(120, 160))); else climbUp(Math.round(R.r(180, 210))); sec(3); }
      n++;
      if (n % 3 === 0) flag();
    }
    sec(2);
    flag();
  });

  // ---- Twist: it breaks for good: faster, the branch thins to its tip, and the last liana swings him off to the shrine
  let finalFrom = 0;
  let end = 0;
  beat('Twist: the last liana', () => {
    finalFrom = x;
    hint(x + 60, 'It is all coming down. The vine at the end!');
    sec(3);
    gap(one * 0.5);
    sec(3);
    // the tip: the last section (drawn from the sheet's branch end)
    P.push({ id: pid++, x: Math.round(x), y: level, width: TILE, height: 40, type: 'solid', chase: true, chaseTip: true });
    x += TILE;
    expert += TILE / RUN;
    // the last liana, out over the gap between the trees, and the shrine on the next tree's crown
    const edge = x;
    let vx = edge + 185, top = level - 380;
    for (let tries = 0; tries < 14; tries++) {
      const d0 = R.r(170, 195);
      const t = Math.round(level - R.r(360, 395));
      const v: Vine = { id: -1, x: edge + d0, topY: t, bottomY: Math.min(level + 30, t + 410), swaySpeed: 1.1, swayPhase: 0, vineType: 'swing_liana', isSwingingVine: true };
      const far: Platform = { id: -99, x: edge + d0 + 230, y: level, width: 900, height: BANK_H, type: 'solid' };
      vx = v.x;
      top = t;
      if (jumpGrab(edge, level, v) >= 4 && landWindow(null, v, far) >= 8) break;
    }
    V.push({ id: vid++, x: Math.round(vx), topY: top, bottomY: Math.min(level + 30, top + 410), swaySpeed: 1.1, swayPhase: 0, vineType: 'swing_liana', isSwingingVine: true });
    end = Math.round(vx);
    x = Math.round(vx + 230);
    expert += 415 / SWING + 0.6;
  });
  // the next tree's crown: solid, and the shrine on it
  const crown: Platform = { id: pid++, x: Math.round(x), y: level, width: 900, height: 40, type: 'solid', crown: true };
  P.push(crown);
  row(crown.x + 80, crown.x + 340, level - 34, 3, 'hibiscus');
  const exitX = crown.x + 620;
  C.push({ id: cid++, type: 'exit_totem', x: exitX, y: level - 30, collected: false, bobPhase: 0 });
  x = crown.x + crown.width;
  expert += 620 / RUN;

  // nothing should sit under the branch; the stage is as tall as the deepest branch needs, plus the fall
  const lowest = Math.max(...P.map((p) => p.y));
  const movedPickups = fixPickups({ platforms: P, vines: V }, C);
  const width = Math.ceil(x + 20);
  const cfg: LevelConfig = { ...config, levelWidth: width, levelHeight: Math.max(config.levelHeight, lowest + 320) };
  return {
    config: cfg,
    trees: T,
    platforms: P,
    vines: V,
    ropes: [],
    enemies: E,
    boss: null,
    collectibles: C,
    spawnX: 140,
    spawnY: G,
    exitTotemX: exitX,
    exitTotemY: level,
    checkpoints: checkpoints.sort((a, b) => a.x - b.x),
    meta: { attempt: seed, chunks: [], width, timing: { layoutSeconds: expert, decorSeconds: 0, route: width } },
    proto: { hints: hints.sort((a, b) => a.x - b.x), covers: [], beats, movedPickups, chase: { start, end, finalFrom } },
  };
}

// ---------------------------------------------------------------------------------------------------------------------------
// golden seeds: the secrets, saved per stage

const seedKey = (stageId: string, n: string) => `sloth_seed_${stageId}_${n}`;
export function seedFound(stageId: string, n: string): boolean {
  try {
    return localStorage.getItem(seedKey(stageId, n)) === '1';
  } catch {
    return false;
  }
}
export function markSeedFound(stageId: string, n: string) {
  try {
    localStorage.setItem(seedKey(stageId, n), '1');
  } catch {
    /* ignore */
  }
}

// ---------------------------------------------------------------------------------------------------------------------------
// drawing: the log, the seeds and the leaves over the nook

export function drawPushLog(ctx: CanvasRenderingContext2D, p: Platform, t: number) {
  const { x, y, width: w, height: h } = p;
  const r = h / 2;
  ctx.save();
  // shadow
  ctx.fillStyle = 'rgba(20, 30, 10, 0.28)';
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h + 2, w * 0.55, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  // body
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, '#9a6a3c');
  g.addColorStop(0.45, '#7a4f2a');
  g.addColorStop(1, '#4f321b');
  ctx.fillStyle = g;
  ctx.strokeStyle = '#2e1d0f';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + r * 0.5, y);
  ctx.lineTo(x + w - r * 0.5, y);
  ctx.ellipse(x + w - r * 0.5, y + r, r * 0.5, r, 0, -Math.PI / 2, Math.PI / 2);
  ctx.lineTo(x + r * 0.5, y + h);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // bark lines
  ctx.strokeStyle = 'rgba(46, 29, 15, 0.55)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i++) {
    const yy = y + h * (0.22 + i * 0.19);
    ctx.beginPath();
    ctx.moveTo(x + r * 0.6 + i * 6, yy);
    ctx.bezierCurveTo(x + w * 0.4, yy - 4, x + w * 0.6, yy + 4, x + w - r * 0.7, yy);
    ctx.stroke();
  }
  // moss on top
  ctx.fillStyle = '#5f9a3a';
  ctx.beginPath();
  ctx.ellipse(x + w * 0.45, y + 3, w * 0.32, 6, 0, Math.PI, 0);
  ctx.fill();
  // the hollow end, facing the player
  ctx.fillStyle = '#b98a55';
  ctx.strokeStyle = '#2e1d0f';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(x + r * 0.5, y + r, r * 0.5, r, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#2b1a0c';
  ctx.beginPath();
  ctx.ellipse(x + r * 0.5, y + r, r * 0.3, r * 0.66, 0, 0, Math.PI * 2);
  ctx.fill();
  // a small "push me" shimmer the first seconds of the stage
  const a = 0.25 + 0.2 * Math.sin(t * 3);
  ctx.strokeStyle = `rgba(255, 236, 160, ${a})`;
  ctx.lineWidth = 2;
  ctx.strokeRect(x - 3, y - 3, w + 6, h + 6);
  ctx.restore();
}

export function drawSeed(ctx: CanvasRenderingContext2D, c: Collectible, t: number) {
  const bob = Math.sin(t * 2.2 + c.bobPhase) * 4;
  const x = c.x, y = c.y + bob;
  ctx.save();
  const glow = ctx.createRadialGradient(x, y, 2, x, y, 34);
  glow.addColorStop(0, 'rgba(255, 226, 120, 0.85)');
  glow.addColorStop(1, 'rgba(255, 200, 60, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, 34, 0, Math.PI * 2);
  ctx.fill();
  // the seed: a fat golden teardrop with a little sprout
  const g = ctx.createLinearGradient(x - 10, y - 14, x + 10, y + 14);
  g.addColorStop(0, '#fff3b0');
  g.addColorStop(0.5, '#f2b632');
  g.addColorStop(1, '#b8741a');
  ctx.fillStyle = g;
  ctx.strokeStyle = '#6b3d0c';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x, y - 15);
  ctx.bezierCurveTo(x + 13, y - 4, x + 12, y + 14, x, y + 14);
  ctx.bezierCurveTo(x - 12, y + 14, x - 13, y - 4, x, y - 15);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#58a33c';
  ctx.strokeStyle = '#24451a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(x + 6, y - 17, 7, 3.5, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // sparkle
  const s = (Math.sin(t * 4 + c.bobPhase) + 1) / 2;
  ctx.fillStyle = `rgba(255,255,255,${0.5 + 0.5 * s})`;
  ctx.beginPath();
  ctx.arc(x - 4, y - 5, 2.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** leaves in front of the hidden nook: thick until Pokey comes within reach, then they part */
export function drawLeafCover(ctx: CanvasRenderingContext2D, cv: LeafCover, px: number, py: number, t: number) {
  const near = Math.max(0, 1 - Math.hypot(px - (cv.x + cv.w / 2), py - (cv.y + cv.h / 2)) / 260);
  const alpha = 1 - 0.8 * Math.min(1, near * 1.6);
  if (alpha <= 0.02) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  const n = 14;
  for (let i = 0; i < n; i++) {
    const fx = cv.x + ((i * 37) % cv.w);
    const fy = cv.y + ((i * 53) % cv.h);
    const sway = Math.sin(t * 1.3 + i) * 3;
    ctx.fillStyle = i % 3 === 0 ? '#2f6b2a' : i % 3 === 1 ? '#3f8a35' : '#24521f';
    ctx.beginPath();
    ctx.ellipse(fx + sway, fy, 34, 16, (i % 5) * 0.6 - 1.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
