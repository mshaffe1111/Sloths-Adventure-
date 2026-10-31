/**
 * World 5's hand-built stages (the Orchid Sanctuary), built the new way: planned beats, details rolled by the seed, every piece checked.
 * The mechanics are Dot's rules (w5Kit.ts, run by w5Play.ts); every prop comes from the story (reference/STORY-REWRITE.md "World 5").
 *
 * 5-1 The Loveliest Place (sprint, the golden afternoon): "Run through the loveliest place on the road. Do not stop."
 *   1. START    the first tree, with Meeca's carving: POKEY. DON'T SIT. M. (cut with a hairpin as they marched her past).
 *   2. LEARN    the little table in the middle of the path, set for two, with its card ("Do sit. The pot is warm. It is always warm.")
 *               and two soft chairs that tug: the stillness is taught gently here (a wrap is only a fright: W5Extras.gentle).
 *   3. DEVELOP  the open garden: soft jumps, stumps, a high road of petals, and the jumping spider (it crouches, then rushes). Everything
 *               up to the first wide gap is one plain jump high (1-1's stepping-stone numbers); the second jump is taught at that gap,
 *               the first place that needs it (QA, 2026-10-26).
 *   4. TWIST    the guests who sat: silk-wrapped chairs along the way, soft chairs at the lip of the jumps, spiders in pairs.
 *   5. FINISH   the ideas again in new pairs, a flag after each, until a quick player has had about 2:45 (STAGE_SECONDS).
 *
 * 5-2 Don't Sit (stealth, gold): "POKEY. DON'T SIT. Stay hidden and keep moving."
 *   1. START    Dot's rules: don't sit, don't eat, don't drink, don't touch the silk, don't admire the silk (with room to say them
 *               before anything they are about comes near, for a player who runs from the first moment).
 *   2. LEARN    the sleeping spiders first (one lies alone, to be hopped: it wakes only if he walks right into it), then the humming
 *               threads: strung low across the way, they hum at a touch, and the sleeping spiders near them wake and come. Each is
 *               taught before the first one he could touch (QA, 2026-10-26).
 *   3. DEVELOP  the cakes: one tiny cake on its own (they make him sleepy), then a pair; then the first Butler, holding out a tray with a cake on
 *               it (punch the tray away, or jump over him).
 *   4. TWIST    soft chairs among the threads ("You'd be a very still chair"), and Pell's blanket note in plain sight on a pink bell.
 *   5. TWIST    everything at once: threads before the jumps (the wide one with a reminder of the second jump), cakes on the high
 *               road, sleeping spiders under it, the Butler again.
 *   6. FINISH   new pairs until about 3:20 (STAGE_SECONDS).
 *
 * 5-3 Closing Orchids (harvest, gold): "The orchids are closing early. Gather {n} before they do."
 *   1. START    the garden, with the sanctuary's orchids and the visitor chairs along the way: room for the goal before anything else.
 *   2. LEARN    the first orchid, alone, over the grass and one plain hop up, with flowers in its cup: Dot's line comes before it, and
 *               a miss (it shut) is only a drop to the grass. Then the story's "barely afternoon, and the orchids were already
 *               closing", and two in a row, still over the grass, closing one after the other.
 *   3. DEVELOP  the rhythm: orchids strung across soft pits, each a plain hop from the last, closing one after another down the row like
 *               doors down a hall (go as the first opens); a cake alone on the path, a step of orchids up to a cupful, a spider.
 *   4. TWIST    "they shut sooner now": from here each orchid stays open for less of its beat (Matt: closing earlier as it goes on),
 *               a spider after a row, a soft chair and the guests who sat, a row of four.
 *   5. FINISH   the ideas again in new pairs, a flag after each two, until about 2:55 (STAGE_SECONDS).
 *   Its flowers count most of the way to the quota on the path, and the rest is in the cups: they are what the stage is for.
 *
 * Every drop is a soft pit (a mossy floor and a step back up the far side): a miss costs a climb, never a life. The hearts are lost to
 * spiders and to the silk, never to a fall.
 */
import { fixPickups } from './flowerReach.ts';
import { G, heartsAtFlags, stageSeconds, stream, type LeafCover, type ProtoExtras, type StageHint } from './protoStage.ts';
import type { GeneratedStage } from './stageGenerator.ts';
import { findForStage } from './finds.ts';
import { reachJump } from './physics.ts';
import { PAST_SHRINE } from './rules.ts';
import { newTeapot, orchidTiming, TABLE_CARD, W5_TEACH, type Teapot, type SilkSheet, type Butler, type Cake, type Carving, type Chair, type Orchid, type TeaTable, type Thread, type W5Decor, type W5Extras, type W5Spider } from './w5Kit.ts';
import { W5_HINTS, type W5Hint } from './w5Lines.ts';
import { silkLine, type Cocoon, type RestBranch } from './w5Kit.ts';
import type { Collectible, Enemy, LevelConfig, Platform, TreeStructure, Vine } from './types.ts';

export type W5Plan = '5-1' | '5-2' | '5-3' | '5-5';

/** the floor of a soft pit, and the step out of it (as protoStage.ts) */
const HOLLOW_Y = 710;
const PIT_STEP = 55;
const BANK_H = 90;
/** a quick, sure player runs at 285 px/s */
const RUN = 285;
/** a gap's widths: one jump (a little under the 175 px a running jump reaches), and two (well under the 313 of a double jump) */
const GAP1: [number, number] = [130, 165];
const GAP2: [number, number] = [205, 250];
/** how far a spider's patch keeps from a flag or the spawn (levelCheck.ts SAFE_APPROACH is 200) */
const SAFE_GAP = 230;
/**
 * Stumps before the second jump is taught: 1-1's stepping-stone numbers (protoStage.ts stumps: the first 50 px, the rest 50, 60 or 70),
 * an easy single hop. 5-1's old 60 to 88 px stumps came before the lesson and a first-timer was stuck at them for 20 s (QA, 2026-10-26).
 */
export const W5_PLAIN_STUMPS = { first: 50, steps: [50, 60, 70] } as const;
/** after it: one jump high (60 to 88, under SAFE.rise1), or (`tall`) two */
const STUMP_H: [number, number] = [60, 88];
const TALL_H: [number, number] = [118, 138];
/**
 * The first stump only the second jump climbs, after the lesson: no single jump lands on it (one reaches about 120 px with the ledge's
 * help), and a double flick from right next to it lands on top however quick the second flick (from 67 ms on: at 135 px a quick double
 * flick bumped the lip and a first-timer needed 4 tries, QA 5-1, 2026-10-26). The later ones climb back up to TALL_H.
 */
export const W5_FIRST_TALL = 125;
/** how far up the hearts at the flags float: walking height (the engine picks up within 34 px of his middle, 20 px above his feet) */
export const W5_HEART_UP = 34;
/** how far before a gap's edge Dot's line about it is said (px): room to say it before he is near it, for a player at full run */
const GAP_TELL = 760;
/** 5-2's reminder (its first wide gap comes in a drawn piece: far enough ahead to be read, not so far it holds up the line before) */
const GAP_TELL_52 = 1300;
/**
 * 5-3's closing orchids: the bloom's width (its ledge), each one's beat (s), and how long it stays open: from World 5's first stage's
 * (the lesson, and the stage's start) down to its fifth's by the end (w5Kit orchidTiming): "closing earlier" as the stage goes on.
 * In a row, each opens (and closes) this much after the one before it, so they close one after another down the row as he crosses: a
 * little under the time the quickest running hop takes from one bloom to the next (210 px or more at a full run, 0.73 s), so a player
 * who sets off while the first is open finds each in turn about as open as the first was, and one who goes early never meets the next
 * still shut. (It was 0.45 s: he fell 0.3 s further behind the closing with every bloom, and a running hop that set off late in the
 * first one's beat met the third or fourth shut, QA v200 upright: 55 of 116 cup flowers missed.)
 */
export const W5_ORCHID = { w: 124, period: 6, openFirst: orchidTiming(1).open, openLast: orchidTiming(5).open, lag: 0.6 } as const;
/** how high an orchid over the grass stands (its ledge, px above the path): 70 px above a plain 50 px stump beside it */
export const W5_GRASS_ORCHID = 120;
/**
 * 5-3's first orchid, the lesson: on clear grass with nothing before it, one plain hop up from the path itself (no stump to get caught
 * behind: QA v200 at 320 x 782, Dot's "Quick!" came while Pokey was stuck in the silk behind the stump, and it shut before he was
 * free), a little narrower so its painted bloom still reaches the grass, and a generous beat: open for most of it, shut only briefly.
 */
export const W5_LESSON_ORCHID = { up: 94, w: 108, period: 8, open: 5.6 } as const;
/** the orchids just after it (the first steps and the first row): a longer beat, and this much longer open, while the rhythm is new */
export const W5_EARLY_ORCHID = { period: 7, more: 0.9 } as const;
/** 5-3's quota: the share of its flowers to gather (the path's alone fall short of it: the cups are what the stage is for) */
export const W5_HARVEST_SHARE = 0.62;

// ── 5-5 Caught in Silk ──
/** 5-5's goal: creatures freed (the stage hangs half again as many cocoons, the ones in the high web on top) */
export const COCOON_GOAL_55 = 12;
/** how far a wrapped chair (or any silk-wrapped visitor in the scenery) keeps from a hanging cocoon (px, middle to middle, past its half) */
export const W5_CLEAR_OF_COCOON = 240;
/** the scenery that is a silk-wrapped visitor (furniture, a lump), kept clear of the cocoons */
const WRAPPED_LOOKS = new Set(['wrappedChair', 'wrappedStool', 'silkLump', 'wrappedCup', 'wrappedCup2', 'cocoon']);
/** how far over the ground a cocoon's bottom hangs: his fist (40 px up) lands by its middle (w5Kit COCOON.mid, 34 px over its bottom) */
export const COCOON_UP = 18;
/** a quick player's seconds at a cocoon: stop, three punches, on */
const COCOON_SECONDS = 1.4;
/** how far ahead a first-time line is said in 5-5 (its own line would come at w5Play's SEE, 560 px: too late while the scene plays) */
const EARLY = 900;
/**
 * 5-5's most cocoons: Normal's goal is every one of them (goals.ts GOAL_SHARE.rescue), so the finish's new pieces never take the stage past
 * the most it held before them (19 to 22)
 */
const COCOON_MAX_55 = 22;
/** 5-5's soft chairs come only after this many expert seconds: sooner, their line waits behind the scene's, the web's or the "Still n animals" nag (about 100-112 s; w5Order.test.ts) */
const CHAIRS_55_AFTER = 120;
/** the rest branch: how high (one hop from its mossy stump) */
const REST_UP = 92;
/**
 * the high web: the silk line's top and bottom, how far past it the branch starts, and how high the branch is (above any jump). The
 * calmer swing of 2026-10-28 lets go 70 px lower at the front of its swing: the line hangs 20 px higher and the branch 15 px lower
 * (still 20 px above a double jump) so a leap from it lands there again.
 */
const WEB_TOP = 500;
const WEB_LOW = 100;
const WEB_OFF = 190;
/** the silk line hangs this far short of the pit's lip */
const WEB_LIP = 20;
const WEB_UP = 205;

/**
 * the most of each thing a roll holds (a theme draws some pieces again and again: without these, one play of 5-1 met 27 spiders and the
 * next 5, so the rolls' difficulty stays in one band, STAGE-RULES §1b). Past it, a soft pit where the piece would be.
 */
const MOST: Record<W5Plan, { spiders: number; threads: number; sheets: number }> = {
  '5-1': { spiders: 14, threads: 0, sheets: 0 },
  '5-2': { spiders: 22, threads: 15, sheets: 0 },
  '5-3': { spiders: 12, threads: 0, sheets: 0 },
  '5-5': { spiders: 18, threads: 9, sheets: 5 },
};
/** the most warm teapots a hand stage holds (5-3: a few, a seasoning among its orchids) */
const POTS_MAX = 12;
/** the story aside's return (px from the last line said): it starts once her lines have been quiet 8 s, and is clear this far on */
const ASIDE = { after: 3000, clear: 5600 } as const;
/** room for a first-time line after the one before it: about 4 s at a full run */
const LINE_ROOM = 1300;
const LINE_ROOM_55 = 2300;
/** a long high road's hop: from this share of the way along (about 90 px across); a stage hangs its things on the road at HOP_SAFE */
const HOP_AT = 0.46;
export const HOP_SAFE = [0.25, 0.85] as const;

/** what the tests read back about the stage (ids and x's) */
export interface W5Info {
  plan: W5Plan;
  /** the expert seconds at which each flag stands (spawn first, the exit last) */
  flagSeconds: number[];
  gaps: Array<{ edge: number; far: number; double: boolean }>;
  /** the high roads: the step up (platform id) and the road (platform id), each over solid ground */
  highRoads: Array<{ step: number; road: number }>;
  /** enemy ids of the spiders */
  spiders: number[];
  /** the stumps (x, height, whether the second jump was taught by then) */
  stumps: Array<{ x: number; h: number; taught: boolean }>;
  /** where the second jump is taught (5-1) or reminded (5-2): the x of its line and of the gap's edge */
  doubleLesson?: { hint: number; edge: number };
  /** the reminder before the first stump only the second jump climbs: the x of its line and of that stump, and its height */
  tallLesson?: { hint: number; at: number; h?: number };
  /** 5-5: the high web (the silk line's vine id, the branch it reaches, and the cocoons over it, by their place in w5.cocoons) */
  web55?: { vine: number; branch: number; cocoons: number[] };
  /** 5-3's orchids: the bloom's left and right, its top, the ground its stem grows from, how long it is open, and which piece it is in */
  orchids: Array<{ x0: number; x1: number; y: number; ground: number; open: number; piece: 'lesson' | 'steps' | 'row' }>;
  /** 5-3's rows of orchids over a soft pit: the near edge, the far bank, and the orchids (indices into `orchids`) */
  rows: Array<{ edge: number; far: number; orchids: number[] }>;
  /** 5-3's flowers in the cups of the orchids (ids), and the rest */
  cupFlowers: number[];
}

export function buildW5Stage(config: LevelConfig, seed: number, plan: W5Plan): GeneratedStage & { proto: ProtoExtras; w5info: W5Info } {
  // (5-1 rolls from 501, 5-2 from 502, 5-3 from 503)
  const R = stream(seed * 7 + 450 + Number(plan.replace('-', '')));
  const P: Platform[] = [];
  const V: Vine[] = [];
  const T: TreeStructure[] = [];
  const C: Collectible[] = [];
  const E: Enemy[] = [];
  const checkpoints: Array<{ x: number; y: number; reached: boolean }> = [];
  const hints: StageHint[] = [];
  const beats: Array<[number, number, string]> = [];
  const covers: LeafCover[] = [];
  const chairs: Chair[] = [];
  const tables: TeaTable[] = [];
  const cakes: Cake[] = [];
  const butlers: Butler[] = [];
  const threads: Thread[] = [];
  const carvings: Carving[] = [];
  const spiders: W5Spider[] = [];
  const decor: W5Decor[] = [];
  const orchids: Orchid[] = [];
  const pots: Teapot[] = [];
  const sheets: SilkSheet[] = [];
  const info: W5Info = { plan, flagSeconds: [0], gaps: [], highRoads: [], spiders: [], stumps: [], orchids: [], rows: [], cupFlowers: [] };
  /** has the second jump been taught? (in 5-1, at its first wide gap; 5-2 comes after 5-1, and reminds at its first) */
  let doubleTaught = plan !== '5-1';
  let doubleSaid = false;
  let tallSaid = false;
  let pid = 1, cid = 1, eid = 1;
  let expert = 0;
  const r = Math.round;

  // ----- the kit -----
  const bank = (x0: number, x1: number, y = G, style: Platform['style'] = 'log') => {
    const p: Platform = { id: pid++, x: r(x0), y: r(y), width: r(x1) - r(x0), height: BANK_H, type: 'solid', style };
    P.push(p);
    return p;
  };
  const branch = (x0: number, x1: number, y: number) => {
    const p: Platform = { id: pid++, x: r(x0), y: r(y), width: r(x1) - r(x0), height: 24, type: 'solid', style: 'branch' };
    P.push(p);
    return p;
  };
  const block = (x0: number, x1: number, h: number) => {
    const p: Platform = { id: pid++, x: r(x0), y: r(G - h), width: r(x1) - r(x0), height: r(h), type: 'solid', style: 'moss_stone' };
    P.push(p);
    return p;
  };
  /** a soft pit between two banks: a mossy floor walled down to it, and a low step at the far wall's foot (protoStage.ts softPit) */
  const softPit = (edge: number, far: number) => {
    const wallTop = G + BANK_H;
    const wallH = HOLLOW_Y - wallTop + 4;
    P.push({ id: pid++, x: r(edge - 60), y: wallTop, width: 60, height: wallH, type: 'solid', style: 'moss_stone', soil: true });
    P.push({ id: pid++, x: r(far), y: wallTop, width: 60, height: wallH, type: 'solid', style: 'moss_stone', soil: true });
    bank(edge - 60, far + 60, HOLLOW_Y, 'moss_stone');
    const sw = far - edge < 170 ? far - edge : 70;
    P.push({ id: pid++, x: r(far - sw), y: HOLLOW_Y - PIT_STEP, width: r(sw), height: PIT_STEP, type: 'solid', style: 'moss_stone', soil: true });
  };
  const flower = (x: number, y: number, v: Collectible['botanicalVariant'] = 'orchid') => {
    const c: Collectible = { id: cid++, type: 'flower', botanicalVariant: v, x: r(x), y: r(y), collected: false, bobPhase: (x * 0.031) % 6.28 };
    C.push(c);
    return c;
  };
  const row = (x0: number, x1: number, y: number, n: number, v: Collectible['botanicalVariant'] = 'orchid') => {
    for (let i = 0; i < n; i++) flower(x0 + ((x1 - x0) * i) / Math.max(1, n - 1), y, v);
  };
  const arc = (x0: number, x1: number, yTop: number, n: number, v: Collectible['botanicalVariant'] = 'hibiscus') => {
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      flower(x0 + (x1 - x0) * t, yTop + 60 * (1 - Math.sin(Math.PI * t)), v);
    }
  };
  /** the first-time things already met (their lines said), and where the last line is said */
  const told = new Set<string>();
  let saidX = -1e9;
  const hint = (x: number, h: W5Hint, kind?: string) => {
    const sh: StageHint = { x: r(x), text: h.old, pad: h.pad ?? h.old, keys: h.keys ?? h.old };
    hints.push(sh);
    // (a story line waits its turn in the new look and reads longer: it holds the screen further on)
    saidX = Math.max(saidX, r(x + (h.kind === 'story' ? 700 : 0)));
    if (kind) told.add(kind);
    return sh;
  };
  /**
   * Before the first of a kind: its line (said `lead` px ahead of the cursor) gets LINE_ROOM after the line before it, with a calm
   * stretch first if need be. The pieces are drawn in any order, and a line waits while another is up: two new things close together
   * left the second one's line late (QA's order checks, 2026-10-31).
   */
  /** where a piece can bring a line of its own (a breath of steam, a cake eaten, a hum): it is on screen from there */
  // (each of these is said the first time only: w5Play's tips are once a stage)
  const lineAt = (at: number, once: string) => {
    if (told.has(once)) return;
    told.add(once);
    saidX = Math.max(saidX, r(at));
  };
  /** how far a chase can run (a line waits while anything chases him): a first-time line is said after it */
  let chaseX = -1e9;
  const chaseTo = (at: number) => { chaseX = Math.max(chaseX, r(at)); };
  let asideBack = true;
  /**
   * room on the way, `len` px of it, filled with plain stumps and soft pits: things already known that bring no line, so the room a line
   * needs is never a long plain walk (the 4 s quiet rule)
   */
  const room = (len: number) => {
    const end = x + len;
    while (end - x > 420) {
      if (R.chance(0.5)) gap();
      else stumps(R.chance(0.5) ? 1 : 2);
    }
    if (end - x > 0) rest(end - x, false);
  };
  const fresh = (kind: string, lead: number) => {
    if (told.has(kind)) return;
    told.add(kind);
    if (x - lead < chaseX) room(chaseX - (x - lead));
    const gapNow = x - lead - saidX;
    // (5-5's lines run calm, a long breath between them: dotGuide.ts GuideQueue calm)
    const need = plan === '5-5' ? LINE_ROOM_55 : LINE_ROOM;
    if (gapNow < need) room(need - gapNow);
    else if (asideBack && gapNow > ASIDE.after) {
      // (the stage's own story aside steps aside for the first lesson and comes back after the first long quiet in her lines, then
      // reads for about 6.5 s: dotGuide.ts storyGapMs. A first-time line in that span waits behind it, so this one comes after it)
      asideBack = false;
      if (gapNow < ASIDE.clear) room(ASIDE.clear - gapNow);
    }
    saidX = r(x - lead);
  };
  /** the move tips about one spot (a wide gap, a tall stump): taken down once he is past it, done or not (QA, 2026-10-26: "Wide gap!"
   *  stayed up from 5-1 17% to 26%, long after the gap) */
  const PASS_BY = 80;
  /** a jumping spider on the ground the cursor is on, pacing [x0, x1]; `doze`: asleep until a thread hums or he walks into it */
  const spider = (sx: number, x0: number, x1: number, doze = false) => {
    const id = 500 + eid++;
    // (never pacing within reach of the flag behind it: a respawn is always a safe spot, levelCheck SAFE_APPROACH)
    x0 = Math.max(x0, lastFlag + SAFE_GAP);
    sx = Math.max(sx, x0 + 20);
    x1 = Math.max(x1, sx + 20);
    E.push({
      id, type: 'spider', x: r(sx), y: G - 12, vx: 0, vy: 0, width: 34, height: 22, hp: 1, maxHp: 1, facing: doze ? 1 : -1,
      // (its painted legs reach about 30 px out either side of its middle: a punch or kick that lands on them lands, crouched or
      // rushing. With only its 34 px body, a tap at a crouching spider about 85 px off whiffed though the fist was on its legs: QA v195)
      hitW: 60,
      patrolMinX: r(x0), patrolMaxX: r(x1), attackCooldown: 1.2, telegraphTimer: 0, isAttacking: false, animTimer: 0, hitFlashTimer: 0,
      defeated: false, koTimer: 0, behaviorTimer: 0, edgeMinX: r(x0), edgeMaxX: r(x1),
      // (on the ground, not hanging on a thread: drawn as the painted jumping spider, w5Creatures.ts and spiderSprite.ts)
      noThread: true,
      // (a clean stomp beats it: QA v198, a stomp on one cost a heart, the spider's kind being unstompable on its thread elsewhere)
      stompable: true,
    } as Enemy);
    spiders.push({ id, ...(doze ? { doze: true } : {}) });
    info.spiders.push(id);
  };
  const scenery = (n: string, x: number, w: number, o: Partial<W5Decor> = {}) => decor.push({ n, x: r(x), b: G, w: r(w), ...o });
  /** the garden's dressing along a stretch: flowering bushes and ferns behind the path */
  const garden = (x0: number, x1: number) => {
    for (let gx = x0 + R.r(40, 140); gx < x1 - 60; gx += R.r(170, 300)) {
      const k = R.f();
      // (5-3: the sanctuary's own orchids among the bushes, and now and then one of the guests who sat)
      if (plan === '5-3' && k > 0.74) {
        if (k > 0.95) chairs.push({ x: r(gx), y: G, face: R.chance(0.5) ? 1 : -1, wrapped: true });
        else {
          // (small things only: a big painted bloom on the ground would look like a closing orchid to stand on)
          const n = R.pick(['orchidSprout', 'orchidSprout2', 'mossRoot', 'mossRoot2', 'wrappedCup', 'wrappedStool'] as const);
          scenery(n, gx, n.startsWith('orchidSprout') ? R.r(54, 70) : n.startsWith('mossRoot') ? R.r(90, 120) : n === 'wrappedCup' ? R.r(40, 50) : R.r(56, 66), { flip: R.chance(0.5) });
        }
        continue;
      }
      scenery(k < 0.45 ? (R.chance(0.5) ? 'blossom' : 'blossom2') : 'fern', gx, k < 0.45 ? R.r(70, 110) : R.r(80, 120));
    }
  };

  // ----- the ground: `x` is the open end of the bank he is on (at G) -----
  let bankFrom = 0;
  let x = 0;
  const run = (len: number) => { x += r(len); };
  const close = () => {
    if (x - bankFrom > 1) bank(bankFrom, x);
  };
  const open = (at: number) => {
    bankFrom = r(at);
    x = r(at);
  };
  /** where the last flag (or the spawn) stands */
  let lastFlag = 140;
  const flag = () => {
    // a little more garden first if a spider's patch reaches too near where the flag would stand
    const reach = Math.max(-1e9, ...E.map((e) => e.patrolMaxX));
    if (x - 80 - reach < SAFE_GAP) {
      const add = SAFE_GAP - (x - 80 - reach);
      run(add);
      expert += add / RUN;
    }
    lastFlag = r(x - 80);
    checkpoints.push({ x: r(x - 80), y: G, reached: false });
    info.flagSeconds.push(expert);
  };
  const beat = (name: string, f: () => void) => {
    const x0 = x;
    f();
    beats.push([r(x0), r(x), name]);
  };
  /**
   * A finish's pieces, drawn as a shuffled deck: each roll lays them in its own order, never the same piece twice running, and every
   * piece comes up before any comes back (Matt, 2026-10-30: more pieces, not the same four in the same order on every play).
   */
  const deck = (all: Array<() => void>, keep = all.length, core: number[] = [], once = 0) => {
    // (`keep`: the roll's theme, the share of the pieces it draws from, so two rolls differ in what is in them, not only in its order;
    // `core`: the pieces every theme keeps, the stage's own idea: 5-2's cakes and Butler, 5-3's rows of orchids and its spider;
    // `once`: this many more of the rest, each drawn a single time in the play (one play holds more different pieces, while the theme,
    // what comes back, is what makes two plays differ: Matt, 2026-10-31, "very repetitive")
    const rest = R.shuffle(all.filter((_, i) => !core.includes(i)));
    const pieces = keep < all.length ? [...core.map((i) => all[i]), ...rest.slice(0, Math.max(0, keep - core.length))] : all;
    const guests = keep < all.length ? rest.slice(Math.max(0, keep - core.length), Math.max(0, keep - core.length) + once) : [];
    let left: number[] = [];
    let last = -1;
    let drawn = 0;
    return () => {
      drawn++;
      // (a guest piece every third draw, from the second on, while any is left)
      if (guests.length && drawn % 3 === 2) {
        guests.shift()!();
        return;
      }
      if (!left.length) {
        left = R.shuffle(pieces.map((_, i) => i));
        if (pieces.length > 1 && left[left.length - 1] === last) [left[0], left[left.length - 1]] = [left[left.length - 1], left[0]];
      }
      last = left.pop()!;
      pieces[last]();
    };
  };

  // ----- the pieces (each starts and ends on open ground at G) -----
  /** a stretch of garden with petals along it */
  function rest(len: number, petals = true) {
    const x0 = x;
    run(len);
    // (5-3's quota is mostly in the orchids' cups: its path petals are thinner)
    if (petals && len > 260) row(x0 + 80, x - 80, G - 34, Math.max(2, r(len / (plan === '5-3' ? 260 : 170))), R.pick(['orchid', 'hibiscus'] as const));
    garden(x0, x);
    expert += len / RUN;
  }
  /** a jump over a soft pit (two jumps' worth when `double`), petals in an arc over it */
  function gap(double = false) {
    if (double && !doubleSaid) fresh('double', (plan === '5-1' ? GAP_TELL : GAP_TELL_52) - 140);
    const x0 = x;
    // (run-ins and run-outs kept short: the walks between pieces were most of World 5's dead time, 2026-10-31)
    run(R.r(120, 170));
    const edge = x;
    let tell: StageHint | null = null;
    if (double && !doubleSaid) {
      // the first gap only the second jump crosses: 5-1 teaches it here (the first place that needs it), 5-2 reminds
      doubleSaid = true;
      doubleTaught = true;
      // (5-2's reminder comes well ahead, at the start of its beat: its stage's story aside, once it has given way, is read to the end
      // when it comes back, and it must not be what is on screen as he reaches the gap)
      const at = Math.min(x0 + 20, edge - (plan === '5-1' ? GAP_TELL : GAP_TELL_52));
      tell = hint(at, plan === '5-1' ? W5_HINTS.s51double : W5_HINTS.s52double);
      info.doubleLesson = { hint: r(at), edge: r(edge) };
    }
    const w = r(R.r(...(double ? GAP2 : GAP1)));
    // (never wider than the jump reaches, with room to spare: a real thumb makes every one)
    const far = edge + Math.min(w, r(reachJump(0, double) * (double ? 0.8 : 0.94)));
    if (tell) tell.passX = r(far + PASS_BY);
    close();
    softPit(edge, far);
    arc(edge + 10, far - 10, G - (double ? 170 : 128), double ? 4 : plan === '5-3' ? 2 : 3);
    info.gaps.push({ edge, far, double });
    open(far);
    run(R.r(110, 150));
    expert += (far - edge) / RUN + 0.35 + 240 / RUN;
  }
  /** stumps to hop: one jump high, or (taller) two */
  function stumps(n: number, tall = false) {
    // (nothing a second jump is needed for before it is taught)
    if (tall && !doubleTaught) throw new Error(`${plan}: tall stumps before the second jump is taught`);
    // (5-2 reminds of the second jump at its first wide gap: a drawn piece's tall stump coming first brings that gap with it)
    if (tall && plan === '5-2' && !doubleSaid) gap(true);
    let tell: StageHint | null = null;
    if (tall && n > 1 && !tallSaid) {
      // the first stump only the second jump climbs: a reminder before it (QA, 2026-10-26: the help came only after 3 to 5 tries)
      fresh('tall', 120);
      tallSaid = true;
      tell = hint(x - 120, plan === '5-1' ? W5_HINTS.s51tall : W5_HINTS.s52tall);
      info.tallLesson = { hint: r(x - 120), at: 0 };
    }
    for (let i = 0; i < n; i++) {
      run(R.r(100, 150));
      const w = R.r(130, 190);
      const isTall = tall && i % 2 === 1;
      // (the first tall one after the lesson is the fair one: W5_FIRST_TALL; the rest climb as World 5 does)
      const firstTall = isTall && !!info.tallLesson && !info.tallLesson.at;
      // (the roll is made either way, so the rest of the stage is laid out as before)
      const rolled = !doubleTaught
        ? info.stumps.length === 0 ? W5_PLAIN_STUMPS.first : R.pick(W5_PLAIN_STUMPS.steps)
        : isTall ? R.r(...TALL_H) : R.r(...STUMP_H);
      const h = firstTall ? W5_FIRST_TALL : rolled;
      info.stumps.push({ x: r(x), h: r(h), taught: doubleTaught });
      if (firstTall) {
        info.tallLesson!.at = r(x);
        info.tallLesson!.h = r(h);
        if (tell) tell.passX = r(x + w + PASS_BY);
      }
      block(x, x + w, h);
      flower(x + w / 2, G - h - 34, 'hibiscus');
      run(w);
      expert += (w + 125) / RUN + 0.4;
    }
    run(R.r(80, 130));
  }
  /** a high road of branches over the path: a step up (the catch ledge under it), the road with its petals, and the ground below */
  function highRoad(len: number, extra?: (x0: number, x1: number, y: number) => void) {
    run(R.r(130, 180));
    const s0 = x;
    const step = branch(s0, s0 + 150, G - 92);
    const roadY = G - 92 - R.r(78, 90);
    const r0 = s0 + 110;
    // (a long road is two branches with a hop between, from HOP_AT of the way along: a walk the length of a branch was the most dead
    // time World 5 had, 2026-10-31. What a stage hangs on its road keeps off the hop: HOP_SAFE)
    const split = len >= 440;
    const g0 = r(r0 + len * HOP_AT), g1 = r(g0 + R.r(80, 105));
    const road = branch(r0, split ? g0 : r0 + len, roadY);
    if (split) branch(g1, r0 + len, roadY);
    row(r0 + 60, r0 + len - 60, roadY - 34, Math.max(3, r(len / (plan === '5-3' ? 170 : 120))), 'hibiscus');
    if (split) for (let i = C.length - 1; i >= 0 && C[i].y === r(roadY - 34); i--) if (C[i].x > g0 - 20 && C[i].x < g1 + 20) C.splice(i, 1);
    extra?.(r0, r0 + len, roadY);
    info.highRoads.push({ step: step.id, road: road.id });
    run(150 + len);
    expert += (150 + len) / RUN + 0.8;
    run(R.r(100, 150));
  }
  /** jumping spiders on a long stretch of garden, `n` of them, each pacing its own patch (awake: they crouch, then rush) */
  function spiderRun(n: number, len: number) {
    n = Math.min(n, MOST[plan].spiders - info.spiders.length);
    if (n <= 0) {
      gap();
      return;
    }
    // (at least 470 px between two spiders of a run: a double jump over one landed in the next one's reach, w5QA5.test.ts)
    len = Math.max(len, 200 + 470 * n);
    // (its line comes 1,300 px ahead of the first awake spider, w5Play SPIDER_SEE)
    fresh('spider', 1300 - 160 - ((len - 200) / n) * 0.6);
    const x0 = x;
    run(len);
    const sp = (len - 200) / n;
    for (let i = 0; i < n; i++) {
      const sx = x0 + 160 + sp * (i + 0.6);
      spider(sx, Math.max(bankFrom + 30, sx - 220), Math.min(x - 30, sx + 220));
    }
    row(x0 + 80, x - 80, G - 34, Math.max(plan === '5-3' ? 1 : 2, r(len / (plan === '5-3' ? 320 : 200))), 'orchid');
    garden(x0, x);
    chaseTo(x);
    expert += len / RUN + 1.4 * n;
  }
  /** soft chairs along the path (they tug), with wrapped ones (the guests who sat) between */
  function chairWalk(n: number, wrapped: number) {
    if (n) fresh('chair', -150);
    const x0 = x;
    const live: number[] = [];
    for (let i = 0; i < n; i++) {
      run(R.r(270, 340));
      live.push(x);
      chairs.push({ x: r(x), y: G, face: i % 2 ? -1 : 1, color: i % 2 ? 'lilac' : 'pink' });
    }
    run(R.r(180, 230));
    // the guests who sat: wrapped chairs between the soft ones (and after the last), never on top of one
    const spots = [x0 + 90, ...live, x - 60];
    for (let k = 0; k < wrapped; k++) {
      const a = spots[k % (spots.length - 1)], b = spots[(k % (spots.length - 1)) + 1];
      chairs.push({ x: r((a + b) / 2 + (k >= spots.length - 1 ? 40 : 0)), y: G, face: k % 2 ? -1 : 1, wrapped: true });
    }
    row(x0 + 100, x - 100, G - 34, Math.max(2, r((x - x0) / 180)), 'hibiscus');
    expert += (x - x0) / RUN + 0.3 * n;
  }
  /** a humming thread strung low across the way (jump it), and `n` sleeping spiders beyond it, in the reach of its hum */
  function threadTrap(n: number, sleepers = true) {
    if (threads.length >= MOST[plan].threads || info.spiders.length + n > MOST[plan].spiders) {
      gap();
      return;
    }
    fresh('thread', 520 - 130);
    run(R.r(130, 170));
    const t0 = x;
    const tw = r(R.r(60, 90));
    threads.push({ x0: t0, x1: t0 + tw, y: G - 14 });
    // (the sleepers lie well inside the hum's reach, THREAD.alert from the thread's middle)
    run(tw + R.r(160, 220));
    const s0 = x;
    for (let i = 0; i < n; i++) {
      run(R.r(120, 170));
      // (a woken sleeper rushes from a little behind where it lay: its patch starts there, not back at the thread)
      if (sleepers) spider(x, Math.max(s0 - 120, x - 170), x + 240, true);
    }
    run(R.r(120, 160));
    lineAt(t0, 'hummed');
    if (n) chaseTo(x);
    row(s0 + 40, x - 80, G - 34, Math.max(2, n + 1), 'orchid');
    expert += (x - t0 + 220) / RUN + 0.5 + 0.35 * n;
  }
  /** tiny cakes floating among the petals on the path: they look like a treat (jump over them) */
  function cakeRow(n: number) {
    // (a little more room than its line's own reach: it was read just as he came to the cake)
    fresh('cake', -150);
    run(R.r(140, 190));
    const x0 = x;
    for (let i = 0; i < n; i++) {
      // (far enough apart that a hop over one lands well before the next, with time to see it: upright the view ahead is short)
      run(R.r(300, 360));
      cakes.push({ x: r(x), y: G - 34 });
      flower(x - 85, G - 34, 'orchid');
    }
    lineAt(x, 'ate');
    run(R.r(130, 180));
    flower(x - 60, G - 34, 'orchid');
    expert += (x - x0 + 170) / RUN + 0.3 * n;
  }
  /** the Butler, on the path facing the way Pokey comes, holding a cake out on his tray */
  function butler() {
    fresh('butler', 1100 - 260);
    run(R.r(260, 310));
    butlers.push({ x: r(x), y: G, dir: -1 });
    lineAt(x, 'ate');
    run(R.r(240, 290));
    flower(x - 80, G - 34, 'hibiscus');
    expert += 550 / RUN + 1.2;
  }

  /** warm teapots on the grass by the path, `n` of them, each on its own beat: wait for the puff to pass, then go (beat Z) */
  function potWalk(n: number) {
    // (never more than POTS_MAX on a stage: past it, a soft pit where the pot would stand)
    n = Math.min(n, POTS_MAX - pots.length);
    if (n <= 0) {
      gap();
      return;
    }
    fresh('pot', 560 - 260);
    const x0 = x;
    run(R.r(260, 320));
    for (let i = 0; i < n; i++) {
      const pot = newTeapot(r(x), G, R.chance(0.5) ? 1 : -1);
      pot.offset = Math.round(R.r(0, pot.idle + pot.warn + pot.puff) * 100) / 100;
      pots.push(pot);
      // (a breath of steam: its line reads while he is sleepy and slow, so it holds the screen well past the pot)
      lineAt(x + 700, 'steam');
      run(R.r(360, 440));
    }
    run(R.r(140, 200));
    flower(x - 90, G - 34, 'hibiscus');
    garden(x0, x);
    // (a quick player's wait for the puff to pass, on the average)
    expert += (x - x0) / RUN + 1.6 * n;
  }

  // ----- 5-3's closing orchids -----
  /** how long an orchid stays open here: from openFirst at the start down to openLast at the end ("closing earlier" as it goes on) */
  const openNow = () => {
    // (all the way down by the last rows: the finish's last pieces come 12 to 30 s before the end)
    const u = Math.max(0, Math.min(1, expert / (stageSeconds('5-3') - 30)));
    return Math.round((W5_ORCHID.openFirst + (W5_ORCHID.openLast - W5_ORCHID.openFirst) * u) * 10) / 10;
  };
  /** a big orchid, its bloom's ledge at `top` (`cx` its middle), its stem from `ground`; `petals` flowers in its cup */
  const orchid = (cx: number, top: number, ground: number, openS: number, offset: number, petals: number, piece: W5Info['orchids'][number]['piece'], w: number = W5_ORCHID.w, period: number = W5_ORCHID.period) => {
    const pl: Platform = { id: pid++, x: r(cx - w / 2), y: r(top), width: w, height: 22, type: 'solid', style: 'branch', art: 'orchid' };
    P.push(pl);
    const ids: number[] = [];
    for (let k = 0; k < petals; k++) {
      const f = flower(cx + (k - (petals - 1) / 2) * 40, top - 34, 'orchid');
      ids.push(f.id);
      info.cupFlowers.push(f.id);
    }
    orchids.push({ x: r(cx), y: r(top), w, period, open: openS, lesson: piece === 'lesson' || undefined, offset: Math.round((((offset % period) + period) % period) * 100) / 100, platformId: pl.id, petalIds: ids, stem: ground });
    info.orchids.push({ x0: pl.x, x1: pl.x + w, y: pl.y, ground, open: openS, piece });
    return info.orchids.length - 1;
  };
  /**
   * a plain stump to step up from (1-1's first stepping stone), and the orchid over the grass beside it, one plain hop above it. (The
   * painted bloom hangs about 110 px below the ledge on its top petals: an orchid over the grass stands that high, or it sinks into the
   * ground; a stump makes it one plain jump.)
   */
  const grassOrchid = () => {
    const sw = r(R.r(100, 120));
    block(x, x + sw, W5_PLAIN_STUMPS.first);
    info.stumps.push({ x: r(x), h: W5_PLAIN_STUMPS.first, taught: doubleTaught });
    run(sw + R.r(36, 48));
  };
  /**
   * the first orchid: alone, on clear grass, one plain hop up from the path, long open, two flowers in its cup (a miss is a drop to the
   * grass). The stillness waits all along its stretch (w5Play.ts): the lesson is the orchid, not the silk
   */
  function orchidLesson() {
    const x0 = x;
    const L = W5_LESSON_ORCHID;
    run(R.r(300, 360));
    orchid(x + L.w / 2, G - L.up, G, L.open, R.r(0, L.period), 2, 'lesson', L.w, L.period);
    run(L.w);
    run(R.r(260, 320));
    garden(x0, x);
    expert += (x - x0) / RUN + 1.2;
  }
  /** orchids over the grass, each a plain hop above the last, closing one after the other; a fuller cup at the top */
  function orchidSteps(n: number, early = false) {
    const x0 = x;
    run(R.r(200, 260));
    const openS = Math.round((openNow() + (early ? W5_EARLY_ORCHID.more : 0)) * 10) / 10;
    const period = early ? W5_EARLY_ORCHID.period : W5_ORCHID.period;
    const base = R.r(0, W5_ORCHID.period);
    grassOrchid();
    let cx = x + W5_ORCHID.w / 2;
    for (let i = 0; i < n; i++) {
      orchid(cx, G - W5_GRASS_ORCHID - (early ? 62 : stepRise) * i, G, openS, base - i * W5_ORCHID.lag, i === n - 1 ? 3 : 2, 'steps', W5_ORCHID.w, period);
      if (i < n - 1) cx += W5_ORCHID.w + R.r(40, 60);
    }
    x = r(cx + W5_ORCHID.w / 2);
    run(R.r(240, 300));
    garden(x0, x);
    expert += (x - x0) / RUN + 0.6 * n + 1;
  }
  /** a row of orchids strung across a soft pit, each a plain hop from the last (and from the banks), closing one after another */
  /** the roll's shape for its rows of orchids: level, a zigzag, climbing bloom to bloom, or down into a dip and up (5-3 sets it a play) */
  let rowShape: 'zig' | 'level' | 'climb' | 'dip' | 'tall' = 'zig';
  /** how far each orchid of a flight of steps stands above the one below: a plain hop, or (5-3's tall plays) one the second jump climbs */
  let stepRise = 62;
  function orchidRow(n: number, early = false) {
    run(R.r(180, 240));
    const edge = x;
    const openS = Math.round((openNow() + (early ? W5_EARLY_ORCHID.more : 0)) * 10) / 10;
    const period = early ? W5_EARLY_ORCHID.period : W5_ORCHID.period;
    const base = R.r(0, W5_ORCHID.period);
    const top = G - 30;
    // (the hops: from the bank's edge to a bloom's lip, bloom to bloom, and off the last: well inside one running jump, about 175 px)
    let cx = edge + R.r(95, 115) + W5_ORCHID.w / 2;
    const ids: number[] = [];
    for (let i = 0; i < n; i++) {
      // (how high each bloom stands: every shape stays a plain hop up or down from the one before, and from the banks)
      const lift = early || rowShape === 'zig' ? (i % 2 ? R.r(0, 24) : 0)
        : rowShape === 'level' ? 0
        : rowShape === 'climb' ? Math.min(i, 2) * R.r(34, 42)
        // (every other bloom a second jump up, 104 to 118 px, under the second jump's safe reach: the row asks for the double jump)
        : rowShape === 'tall' ? (i % 2 ? R.r(104, 118) : 0)
        : (i === 0 || i === n - 1 ? R.r(30, 40) : -R.r(10, 20));
      ids.push(orchid(cx, top - lift, HOLLOW_Y, openS, base - i * W5_ORCHID.lag, R.chance(0.5) ? 2 : 1, 'row', W5_ORCHID.w, period));
      // (bloom to bloom: a short hop, so upright, standing on one, the whole of the next is in view: the view shows about 290 px ahead)
      if (i < n - 1) cx += W5_ORCHID.w + R.r(85, 100);
    }
    const far = r(cx + W5_ORCHID.w / 2 + R.r(95, 115));
    close();
    softPit(edge, far);
    info.rows.push({ edge: r(edge), far, orchids: ids });
    open(far);
    run(R.r(180, 240));
    // (the wait for the first to open, and a hop on each)
    expert += (far - edge) / RUN + 0.45 * n + 1.4 + 200 / RUN;
  }

  // ───────────────────────────── 5-1 The Loveliest Place ─────────────────────────────
  if (plan === '5-1') {
    beat('Start: the first tree', () => {
      hint(60, W5_HINTS.s51start);
      // the first tree of the sanctuary, and Meeca's warning cut into it on the move
      const tx = 700;
      // (the words at his eye level: the camera keeps the ground low in the view)
      carvings.push({ x: tx, y: G - 196, lines: ['POKEY.', 'DON\'T', 'SIT.', 'M.'], size: 32, trunk: { ground: G, w: 128, h: 470 } });
      hint(tx - 220, W5_HINTS.s51carving);
      // (room for the first lines to be said before the table's soft chairs tug: a player who runs from the first moment has the goal
      // card and the opening line before the chairs' tip can come; QA, 2026-10-26. Two plain stepping stones in it, 1-1's, which carry
      // no line of their own: the opening was 9 s of plain walk, over the 4 s quiet rule)
      rest(R.r(850, 950));
      stumps(2);
      rest(R.r(350, 450));
      flag();
    });
    beat('Learn: the table set for two', () => {
      gap();
      run(R.r(320, 380));
      const tx = x;
      // (said before the chairs' own line: a chair's tip comes 480 px short of it, and the first chair stands 120 px short of the table)
      hint(tx - 700, W5_HINTS.s51table);
      tables.push({ x: tx, y: G, card: TABLE_CARD });
      chairs.push({ x: tx - 120, y: G, face: 1, color: 'pink' }, { x: tx + 120, y: G, face: -1, color: 'lilac' });
      told.add('chair');
      // (the opening line gives way to the chairs' and comes back after it: it reads on until about here)
      saidX = Math.max(saidX, r(tx + 900));
      scenery('doily', tx - 210, 46, { b: G - 2 });
      run(R.r(360, 420));
      expert += 2.5; // (the card, read in passing)
      stumps(2);
      flag();
    });
    // (Matt, 2026-10-31: "very repetitive". Only the lessons are fixed now: the second jump at its first wide gap, the tall stump, the
    // guests who sat. Everything around them is drawn, a different few of many pieces each play, so the spiders are somewhere new)
    beat('Develop: the open garden', () => {
      // before the second jump is taught: one-jump pieces only
      const early = deck([
        () => { gap(); stumps(2); },
        () => { spiderRun(1, R.r(720, 820)); gap(); },
        () => { highRoad(R.r(480, 600)); },
        () => { stumps(3); gap(); },
        () => { spiderRun(2, R.r(950, 1050)); },
        () => { gap(); spiderRun(1, R.r(640, 720)); gap(); },
        () => { gap(); gap(); },
      ], 4);
      early();
      early();
      flag();
      early();
      // the second jump, taught at the first gap that needs it, with room after the flag for its line to be said on its own and read
      flag();
      // (a spider drawn just before can hold the line back a moment: more room than the line alone needs)
      rest(R.r(700, 800));
      gap(true);
      hint(x + 60, W5_HINTS.s51petals);
      highRoad(R.r(560, 680));
      flag();
      if (R.chance(0.5)) spiderRun(R.chance(0.5) ? 1 : 2, R.r(760, 1000));
      stumps(3, true);
      flag();
    });
    beat('Finish', () => {
      // (the roll's theme: a few of many pieces, drawn as a deck. The first is the guests who sat, with its line, on every roll)
      let guestsSaid = false;
      const guests = () => {
        if (!guestsSaid) hint(x + 80, W5_HINTS.s51guests);
        guestsSaid = true;
        chairWalk(2, 4);
        gap();
      };
      // (once, as its own lesson, after a rolled number of pieces: the guests in every piece drawn made every play alike)
      const guestsAt = R.pick([0, 1, 2]);
      const next = deck([
        // three soft pits in a row, the last a wide one
        () => { gap(); gap(); gap(true); },
        // a pack of spiders on a long stretch of garden
        () => { spiderRun(3, R.r(1150, 1300)); },
        // stump stairs up to a high road, and down the far side
        () => { stumps(3); highRoad(R.r(520, 620)); },
        // tall stumps, then the second jump
        () => { stumps(2, true); gap(true); },
        // a high road with a spider pacing the grass under it: stay up, or meet it
        () => { const x0 = x; highRoad(R.r(560, 660)); if (info.spiders.length < MOST['5-1'].spiders) spider(x0 + (x - x0) * 0.55, x0 + 60, x - 40); },
        // a spider between two soft pits: deal with it on the narrow ground between
        () => { gap(); spiderRun(1, R.r(640, 720)); gap(true); },
        // soft chairs at the lip of a wide pit
        () => { chairWalk(2, 2); gap(true); },
        // the long high road, then spiders in a pair
        () => { highRoad(R.r(600, 700)); spiderRun(2, R.r(900, 1000)); },
        // a tall stump between two spiders
        () => { spiderRun(1, R.r(700, 780)); stumps(1, true); spiderRun(1, R.r(700, 780)); },
        // a soft chair, then a spider just past it
        () => { chairWalk(1, 1); spiderRun(1, R.r(700, 780)); },
        // a spider, the guests who sat with a soft chair among them, a spider
        () => { spiderRun(1, R.r(700, 780)); chairWalk(1, 2); spiderRun(1, R.r(700, 780)); },
      ], 2, [], 2);
      let n = 0;
      while (expert < stageSeconds('5-1') - 6 && n < 30) {
        if (n === guestsAt) guests();
        next();
        if (n % 2 === 1) flag();
        n++;
      }
      if (!guestsSaid) guests();
      // (a roll whose theme drew few animals still meets five jumping spiders: the stage's enemy)
      while (info.spiders.length < 5) spiderRun(Math.min(2, 5 - info.spiders.length), R.r(900, 1000));
      hint(x + 40, W5_HINTS.s51end);
      rest(R.r(480, 560));
      if (expert < stageSeconds('5-1')) rest((stageSeconds('5-1') - expert) * RUN + 60);
    });
  }

  // ───────────────────────────── 5-2 Don't Sit ─────────────────────────────
  if (plan === '5-2') {
    beat('Start: the rules', () => {
      hint(60, W5_HINTS.s52rules);
      carvings.push({ x: 380, y: G - 128, lines: ['DON\'T', 'SIT.'], size: 32, trunk: { ground: G, w: 112, h: 420 } });
      // (past the carving's trunk)
      rest(R.r(500, 540));
      stumps(1);
      // (room for the rules to be said, and read, before the first sleeper or thread comes near: a player who runs from the first
      // moment has the goal card, then the rules, then their second half, before the sleeping spiders' line; QA, 2026-10-26. A soft
      // pit and two stumps in it, which carry no line: the opening was 9 s of plain walk, over the 4 s quiet rule)
      rest(R.r(200, 260));
      gap();
      stumps(2);
      rest(R.r(120, 160), false);
      flag();
    });
    beat('Learn: the sleeping spiders, then the humming threads', () => {
      // the first sleeper lies on its own, to be hopped (it wakes only if he walks into it); Dot's line comes well before it
      gap();
      hint(x, W5_HINTS.s52doze);
      stumps(1);
      run(R.r(520, 580));
      spider(x, x - 160, x + 200, true);
      run(R.r(300, 360));
      expert += 900 / RUN;
      // then the first thread, alone (its line comes as it comes into view, w5Play.ts), and a thread with sleepers beyond it. (The
      // lone sleeper lies within its hum, behind him: a hum wakes spiders off the screen too, w5Play.test.ts)
      rest(R.r(240, 300), false);
      told.add('thread');
      threadTrap(0, false);
      threadTrap(2);
      flag();
      gap();
      // (a breath after the landing: the thread is seen, and hopped, not landed on)
      run(R.r(100, 140));
      expert += 120 / RUN;
      threadTrap(1);
      flag();
    });
    beat('Develop: the cakes and the Butler', () => {
      // (each new thing with room before it: its line is said, and read, before he is at it, whatever was said just before; QA, 2026-10-26)
      // the first cake on its own, with room to try a hop over it, and the pair after (QA, 5-2, 2026-10-26: the line was followed at
      // once by two cakes). Plain stumps in the room before each: no line of their own
      stumps(2);
      // (a plain stretch before each: upright, the view ahead is short, and a cake met just off a stump or a landing is seen too late)
      rest(R.r(240, 300), false);
      cakeRow(1);
      gap();
      rest(R.r(140, 180), false);
      cakeRow(2);
      flag();
      stumps(2);
      // (room for the Butler's line: it comes 1,100 px ahead, and the cakes' lines may still be up)
      rest(R.r(300, 360));
      butler();
      flag();
    });
    beat('Finish', () => {
      // (Matt, 2026-10-31: "very repetitive". The soft chairs and Pell's note come once, at a rolled place; the rest is the roll's theme,
      // a few of many pieces drawn as a deck, and one more drawn once, so the threads, sleepers and cakes are somewhere new each play)
      const chairsAt = R.pick([0, 1, 2, 3]);
      let chairsTaught = false;
      /** soft chairs (only once their line has been said: until then, the guests who sat alone) */
      const softChairs = (n: number, wrapped: number) => chairWalk(chairsTaught ? n : 0, wrapped);
      const chairsAndNote = () => {
        chairsTaught = true;
        // (a calm stretch first: a hum's or a cake's line before it has its say, then the chairs' own line well ahead of them)
        stumps(1);
        rest(R.r(220, 280), false);
        chairWalk(2, 3);
        // (her remark after the chairs, not before: said first, it stepped aside for the chairs' own line and came back over it)
        hint(x - 120, W5_HINTS.s52chair);
        // Pell's blanket note, in plain sight: a pink bell on top of a stump beside the path
        const note = findForStage(config.worldIndex, config.miniIndex);
        run(R.r(200, 260));
        const sw = 170;
        block(x, x + sw, 70);
        if (note && note.kind === 'note') C.push({ id: cid++, type: 'find', findId: note.id, hidden: false, x: r(x + sw / 2), y: G - 70 - 26, collected: false, bobPhase: 0 });
        run(sw);
        expert += (sw + 230) / RUN + 0.5;
        threadTrap(1);
      };
      const next = deck([
        () => { threadTrap(1); gap(R.chance(0.5)); },
        () => { cakeRow(R.chance(0.5) ? 2 : 3); softChairs(2, 1); },
        () => { highRoad(R.r(480, 600), (x0, x1, y) => { cakes.push({ x: r(x0 + (x1 - x0) * HOP_SAFE[0]), y: r(y - 34) }); }); threadTrap(1); },
        () => { butler(); stumps(2, true); },
        // an awake spider's patch, then a thread
        () => { spiderRun(1, R.r(720, 820)); threadTrap(1); },
        // a long row of sleepers behind one thread, then a cake
        () => { threadTrap(2); cakeRow(1); },
        // the Butler among the soft chairs, then a wide pit
        () => { softChairs(1, 1); butler(); gap(true); },
        // threads close together, a sleeper behind each, then a wide pit
        () => { threadTrap(1); threadTrap(1); gap(true); },
        // the Butler, then a cake
        () => { butler(); cakeRow(1); },
        // a soft pit each side of a thread
        () => { gap(); threadTrap(1); gap(); },
        // cakes, then a high road
        () => { cakeRow(2); highRoad(R.r(480, 560)); },
        // a wide pit, then a thread, and an awake spider after
        () => { gap(true); threadTrap(1); spiderRun(1, R.r(720, 820)); },
      ], 2, [], 2);
      let n = 0;
      while (expert < stageSeconds('5-2') - 6 && n < 30) {
        if (n === chairsAt) chairsAndNote();
        next();
        if (n % 2 === 1 || expert - info.flagSeconds[info.flagSeconds.length - 1] > 28) flag();
        n++;
      }
      if (n <= chairsAt) chairsAndNote();
      // (whatever the theme drew, the stage keeps its own idea: six threads and five sleepers, six cakes, the Butler twice)
      const sleepers = () => spiders.filter((sp) => sp.doze).length;
      while (threads.length < 6 || sleepers() < 5) threadTrap(1);
      while (cakes.length < 6) cakeRow(Math.min(2, 6 - cakes.length));
      while (butlers.length < 2) butler();
      // (and some awake ones: they are a threat at every size of screen, w5SpiderView.test.ts)
      while (spiders.filter((sp) => !sp.doze).length < 3 && info.spiders.length < MOST['5-2'].spiders) spiderRun(1, R.r(720, 820));
      if (!doubleSaid) gap(true);
      hint(x + 40, W5_HINTS.s52end);
      rest(R.r(480, 560));
      if (expert < stageSeconds('5-2')) rest((stageSeconds('5-2') - expert) * RUN + 60);
    });
  }

  // ───────────────────────────── 5-3 Closing Orchids ─────────────────────────────
  if (plan === '5-3') {
    beat('Start: barely afternoon', () => {
      // (room for the goal card and the goal before the first orchid's line: a player who runs from the first moment has the goal read,
      // then the orchid's line well before the first bloom. The story's line waits until he has seen one close. A soft pit and two
      // stumps in it, which carry no line: the opening was 9 s of plain walk, over the 4 s quiet rule)
      rest(R.r(800, 900));
      gap();
      stumps(2);
      rest(R.r(250, 350));
      flag();
    });
    beat('Learn: the first orchid, over the grass', () => {
      rest(R.r(260, 320));
      orchidLesson();
      hint(x - 120, W5_HINTS.s53start);
      rest(R.r(380, 440));
      orchidSteps(2, true);
      flag();
    });
    beat('Develop: the rhythm, and the warm teapot', () => {
      rest(R.r(260, 320));
      orchidRow(2, true);
      // the warm teapot, on its own on the grass with nothing else near: its line comes as it comes into view (w5Play.ts), and a breath
      // of its steam only makes him sleepy for a moment (Matt, 2026-10-31: 5-3 was orchids and nothing else)
      rest(R.r(300, 360), false);
      potWalk(1);
      flag();
    });
    beat('Finish', () => {
      // (the roll's theme: a few of many pieces, drawn as a deck, and one more drawn once. Every piece holds orchids, a teapot or an
      // animal; none a thread, a Butler or a sleeper, 5-2's things)
      // (the roll's own row: two, three or four blooms long, and its shape. Rows are most of the stage, so what they share sets how a play feels)
      const rowN = R.pick([2, 3, 4]);
      const rowNear = () => Math.max(2, Math.min(4, rowN + (R.chance(0.3) ? (R.chance(0.5) ? 1 : -1) : 0)));
      // (how the orchids are reached, two of four styles a play, each with its own pattern: plain hops up steps and along rows, tall ones
      // the second jump climbs, rows broken by islands with a warm teapot on each (wait out its puff between the blooms), or with a jumping
      // spider on each. Matt, 2026-10-31: 5-3 is "boring"; the lead: change how the orchids are reached, not how many)
      const isle = (what: 'pot' | 'spider') => {
        if (what === 'pot' && pots.length < POTS_MAX) {
          run(R.r(40, 70));
          const pot = newTeapot(r(x), G, 1);
          pot.offset = Math.round(R.r(0, pot.idle + pot.warn + pot.puff) * 100) / 100;
          pots.push(pot);
          lineAt(x + 700, 'steam');
          run(R.r(200, 240));
          expert += 260 / RUN + 1.6;
        } else if (what === 'spider' && info.spiders.length < MOST['5-3'].spiders) {
          fresh('spider', 1300 - 200);
          run(R.r(380, 440));
          spider(x - 200, x - 330, x - 60);
          chaseTo(x);
          expert += 400 / RUN + 1.4;
        } else gap();
      };
      const styles: Array<() => void> = [
        () => { stepRise = 62; rowShape = R.pick(['zig', 'level', 'climb', 'dip'] as const); if (R.chance(0.4)) orchidSteps(3); else orchidRow(rowNear()); },
        () => { stepRise = Math.round(R.r(108, 122)); rowShape = 'tall'; if (R.chance(0.4)) orchidSteps(3); else orchidRow(R.pick([3, 4])); },
        () => { rowShape = 'level'; orchidRow(R.pick([1, 2])); isle('pot'); orchidRow(R.pick([1, 2])); isle('pot'); orchidRow(R.pick([1, 2])); },
        () => { rowShape = 'zig'; orchidRow(R.pick([1, 2])); isle('spider'); orchidRow(R.pick([1, 2])); isle('spider'); orchidRow(R.pick([1, 2])); },
      ];
      // (one style the whole play: a play of tall orchids and a play of teapot islands share little; a mix of two made every play alike)
      const one = R.pick([0, 1, 2, 3]);
      const mine = [one, one];
      // (the cakes and the guests who sat, once each, at rolled places: the stage's own idea, never in the same spot)
      const cakeAt = new Set([R.pick([0, 1]), R.pick([3, 4, 5])]);
      const guestsAt = R.pick([2, 3, 4, 5, 6]);
      // (and what comes between the orchids, one of these a play)
      const season = R.pick([() => gap(), () => stumps(2), () => highRoad(R.r(440, 520)), () => potWalk(1), () => spiderRun(1, R.r(720, 820)), () => { gap(); gap(); }]);
      let k = 0;
      const next = () => {
        if (R.chance(0.65)) season();
        if (cakeAt.has(k)) cakeRow(1);
        styles[mine[k % 2]]();
        if (k === guestsAt) chairWalk(1, 2);
        k++;
      };
      const soonerAt = R.pick([1, 2, 3]);
      let n = 0;
      while (expert < stageSeconds('5-3') - 6 && n < 30) {
        if (n === soonerAt) {
          hint(x + 60, W5_HINTS.s53sooner);
          rest(R.r(380, 440));
        }
        next();
        if (n % 2 === 1 || expert - info.flagSeconds[info.flagSeconds.length - 1] > 20) flag();
        n++;
      }
      // (whatever the theme drew, the stage keeps its own idea: rows of orchids, three awake spiders, a cake or two, the guests who sat)
      if (n <= soonerAt) hint(x + 60, W5_HINTS.s53sooner);
      const cakesNow = () => cakes.length;
      if (!chairs.some((c) => !c.wrapped) || chairs.filter((c) => c.wrapped).length < 2) chairWalk(1, 2);
      rowShape = 'zig';
      while (info.rows.length < 6 || orchids.length < 22) orchidRow(Math.max(3, rowN));
      while (info.spiders.length < 3) spiderRun(1, R.r(720, 820));
      while (cakesNow() < 2) { rest(R.r(700, 760)); cakeRow(1); }
      hint(x + 40, W5_HINTS.s53end);
      rest(R.r(480, 560));
      if (expert < stageSeconds('5-3')) rest((stageSeconds('5-3') - expert) * RUN + 60);
    });
  }

  // ───────────────────────────── 5-5 Caught in Silk ─────────────────────────────
  // 5-5 Caught in Silk (rescue, dusk): "Free {n} creatures wrapped in the silk." (COCOON_GOAL_55; the stage hangs about half again more)
  //   1. START    the guests who sat, and silk over everything as the light goes (room for the goal card and the fern's line).
  //   2. LEARN    the first cocoons hang low over the ground: Dot's line ("Tap to punch it open") as the first comes into view.
  //   3. REST     the rest branch where the orchids hang in rows: the pouch scene (STORY-REWRITE.md World 5, "The pouch") plays there
  //               and on as he walks, and standing on the branch while it plays is resting, not sitting (w5Play.ts stepRest). The calm
  //               after it has cocoons to free and nothing that bites.
  //   4. DEVELOP cocoons along a high road, a jumping spider by them, the second jump over a soft pit.
  //   5. TWIST   a humming thread and its sleeper, then the high web: a silk line to swing up to a branch above any jump, with three
  //               cocoons over it (on top of the goal: the ground and the high roads hold enough).
  //   6. FINISH  the ideas again in new pairs, flags between, then World 5's keepsake (the pressed petal) in a Hush Fern near the end
  //               (its crouch line holds the screen until he crouches, so nothing new comes after it), and the shrine.
  // Every first-time line is said well ahead here (EARLY): a line of the scene on screen takes a moment to give way to it.
  // (its own pieces: the cocoons, the rest branch and its scene, the silk line up to the high web, and World 5's keepsake in a fern)
  const cocoons55: Cocoon[] = [];
  let rest55: RestBranch | undefined;
  if (plan === '5-5') {
    // (the second jump and its stumps were taught in 5-1 and reminded in 5-2: no reminders here)
    doubleSaid = true;
    tallSaid = true;
    /** a cocoon hanging with its bottom COCOON_UP px above the ground at `ground` (low enough for a standing punch: COCOON.mid over his fist) */
    const cocoon = (cx: number, ground: number) => {
      // (the first is tied across the path: he punches it open to go on, so nobody walks past the stage's idea unknowing. QA, v198)
      cocoons55.push({ x: r(cx), y: r(ground - COCOON_UP), ...(cocoons55.length ? {} : { block: true }) });
      return cocoons55.length - 1;
    };
    /** cocoons hanging low over the path, one at a time, with room between to stop and punch */
    const cocoonRow = (n: number) => {
      n = Math.max(0, Math.min(n, COCOON_MAX_55 - cocoons55.length));
      // (at the most: a plain stretch where it would have hung, so the next piece keeps its room, with no petals bunched in it)
      if (!n) {
        rest(R.r(300, 360), false);
        return;
      }
      const x0 = x;
      for (let i = 0; i < n; i++) {
        run(R.r(280, 340));
        cocoon(x, G);
        // (a cocoon lying in the grass nearby, burst open: somebody already let out. Never a whole one: it cannot be punched, and a
        // shut cocoon lying there asked to be, QA v198. The roll is kept so the rest of the stage is laid out as before)
        if (R.chance(0.35)) {
          R.chance(0.5);
          scenery('cocoonTorn', x + R.r(90, 130), R.r(70, 90));
        }
      }
      run(R.r(200, 260));
      row(x0 + 140, x - 120, G - 34, Math.max(2, n), 'orchid');
      garden(x0, x);
      expert += (x - x0) / RUN + COCOON_SECONDS * n;
    };
    /** a quiet stretch with no fern but one: World 5's keepsake hides in a Hush Fern (crouch beside it) */
    const fernStretch = () => {
      const keep = findForStage(config.worldIndex, config.miniIndex);
      const k0 = x;
      run(R.r(560, 640));
      if (keep && keep.kind === 'keepsake') C.push({ id: cid++, type: 'find', findId: keep.id, hidden: true, x: r(k0 + (x - k0) / 2), y: G - 26, collected: false, bobPhase: 0 });
      scenery('blossom', k0 + 60, 90);
      scenery('blossom2', x - 60, 90);
      expert += (x - k0) / RUN + 3;
    };
    /**
     * The rest branch where the orchids hang in rows (the pouch scene plays here: w5Play.ts, w5Lines.ts W5_POUCH). A mossy stump to step
     * up from, the branch a hop above it (ground under the whole of it), the orchid rows hanging over, and nothing near that bites.
     */
    const restBranch = () => {
      run(R.r(160, 200));
      block(x, x + 130, W5_PLAIN_STUMPS.first);
      run(150);
      const y = G - REST_UP;
      const len = r(R.r(600, 660));
      branch(x - 20, x + len, y);
      rest55 = { x0: r(x - 20), x1: r(x + len), y };
      for (let k = 0; k < 3; k++) {
        // two rows of hanging blooms, the near one low over his head, the far one higher and between
        scenery(k % 2 ? 'orchidRow2' : 'orchidRow', x + 90 + k * 220, 250, { b: y - 92 });
        if (k < 2) scenery(k % 2 ? 'orchidRow' : 'orchidRow2', x + 200 + k * 220, 220, { b: y - 200 });
      }
      row(x + 80, x + len - 80, y - 34, 3, 'orchid');
      run(len + 40);
      expert += (len + 320) / RUN + 1;
    };
    /**
     * The high web: a silk line to swing on (World 5's lianas), and a branch high off the ground that only a leap from the swing reaches
     * (above any jump), with cocoons hanging over it. Ground under all of it: a miss is a step back. These are on top of the goal.
     */
    const silkWeb = (n = 3) => {
      run(R.r(260, 320));
      const vx = x;
      const v = silkLine(900 + V.length, vx, G - WEB_TOP, G - WEB_LOW);
      V.push(v);
      // the silk line hangs at the lip of a soft pit (the swing is taken from the bank's end); the way on is the second jump over it
      run(WEB_LIP);
      const edge = x;
      const far = edge + Math.min(r(R.r(...GAP2)), r(reachJump(0, true) * 0.8));
      close();
      softPit(edge, far);
      info.gaps.push({ edge, far, double: true });
      open(far);
      const b0 = vx + WEB_OFF;
      // (three cocoons at least 150 px apart: closer, one punch freed two, a count the goal relies on)
      const len = r(n > 1 ? R.r(530, 590) : R.r(340, 400));
      const br = branch(b0, b0 + len, G - WEB_UP);
      // (the first is the high web the tests read back; a later one, the finish's silk swing, hangs a single cocoon over its branch)
      const web = (info.web55 ??= { vine: v.id, branch: br.id, cocoons: [] });
      for (let i = 0; i < n && (web.branch === br.id || cocoons55.length < COCOON_MAX_55); i++) {
        const k = cocoon(n > 1 ? b0 + 110 + ((len - 220) * i) / (n - 1) : b0 + len / 2, G - WEB_UP);
        if (web.branch === br.id) web.cocoons.push(k);
      }
      x = Math.max(x, r(b0 + len));
      run(R.r(220, 280));
      expert += (x - vx) / RUN + 0.6 + 3 + COCOON_SECONDS * n;
    };

    /** a shimmering silk sheet by the path, to be walked straight past (5-4's: don't stop to look at it). Its line well ahead (EARLY) */
    const sheetWalk = () => {
      if (sheets.length >= MOST['5-5'].sheets) {
        gap();
        return;
      }
      const x0 = x;
      if (!sheets.length) {
        fresh('sheet', 300);
        hint(x - 300, { stage: '5-5', kind: 'move', old: W5_TEACH.sheet, text: null });
      }
      run(R.r(200, 260));
      const s0 = x;
      const w = r(R.r(300, 380));
      sheets.push({ x0: s0, x1: s0 + w, top: G - r(R.r(240, 270)), bottom: G });
      run(w + R.r(160, 220));
      row(s0 + 60, x - 60, G - 34, 2, 'orchid');
      garden(x0, x);
      expert += (x - x0) / RUN;
    };

    beat('Start: the silk', () => {
      // the guests who sat, wrapped where they sat, and silk over everything as the light goes
      scenery('wrappedChair', 520, 80);
      scenery('silkLump', 760, 90);
      // (a soft pit and two stumps in the room for the goal card and the fern's line: they carry no line, and the opening was 10 s of
      // plain walk, over the 4 s quiet rule)
      rest(R.r(950, 1050));
      gap();
      stumps(2);
      rest(R.r(300, 400));
      flag();
    });
    beat('Learn: the cocoons, on the ground', () => {
      // (room after the flag for the fern's line and the goal card: the cocoon's own line comes as the first one comes into view)
      rest(R.r(450, 520));
      cocoonRow(3);
      flag();
    });
    beat('Rest: the pouch', () => {
      // (early in the stage: the scene is long, and it plays out as he goes on, well before the shrine)
      restBranch();
      // the calm after it: the scene goes on as he walks here, with cocoons to free, stumps to hop, and nothing that bites
      stumps(1);
      cocoonRow(2);
      stumps(2);
      rest(R.r(200, 260), false);
      flag();
      // (the scene plays here only, the branch and the calm garden after it, up to that flag: never over the pits beyond. QA v198)
      if (rest55) rest55.calm = checkpoints[checkpoints.length - 1].x;
      // (the scene's lines go on a while past its calm: the next new thing's line comes after them)
      saidX = Math.max(saidX, r(x + 1500));
    });
    beat('Develop: cocoons along the high road, a spider by them', () => {
      // (drawn: three of these in the roll's own order, so the first spider and the first high road are somewhere new each play)
      const dev = deck([
        () => { gap(); stumps(2); },
        () => {
          highRoad(R.r(560, 640), (x0, x1, y) => {
            cocoon(x0 + (x1 - x0) * HOP_SAFE[0], y);
            cocoon(x0 + (x1 - x0) * HOP_SAFE[1], y);
          });
        },
        () => { spiderRun(1, R.r(720, 820)); },
        () => { gap(true); cocoonRow(1); },
        () => { cocoonRow(1); gap(); spiderRun(1, R.r(720, 820)); },
      ], 3);
      // (the first never a spider: the pouch scene's lines are still going as he leaves the calm. Then the first awake spider, always
      // before the thread, so its line is not the hum's)
      const calmFirst = [() => { gap(); stumps(2); }, () => { gap(true); cocoonRow(1); }];
      R.pick(calmFirst)();
      R.pick([() => spiderRun(1, R.r(720, 820)), () => { cocoonRow(1); gap(); spiderRun(1, R.r(720, 820)); }])();
      dev();
      // (never a spider just before the thread: a line waits while anything chases him, and the thread's and the web's must come ahead)
      gap(true);
      flag();
      rest(R.r(300, 360), false);
    });
    beat('Twist: the high web', () => {
      // (each first-time line well ahead of its thing: while the pouch scene plays, a line of it on screen takes a moment to give way.
      // The thread and the web come in the roll's own order, and what follows them is drawn)
      const threadPart = () => {
        fresh('thread', EARLY);
        hint(x - EARLY, { stage: '5-5', kind: 'move', old: W5_TEACH.thread, text: null }, 'thread');
        threadTrap(1);
      };
      const webPart = () => {
        fresh('silk', EARLY);
        hint(x - EARLY, { stage: '5-5', kind: 'move', old: W5_TEACH.silk, text: null }, 'silk');
        silkWeb();
      };
      const parts = R.chance(0.5) ? [threadPart, webPart] : [webPart, threadPart];
      parts[0]();
      // (a breath between them, plain stumps in it, which carry no line)
      rest(R.r(250, 320), false);
      stumps(2);
      rest(R.r(200, 260), false);
      parts[1]();
      R.pick([() => spiderRun(2, R.r(1000, 1100)), () => { gap(true); stumps(2); }, () => { stumps(1); spiderRun(1, R.r(720, 820)); gap(); }])();
      flag();
    });
    beat('Finish', () => {
      const next = deck([
        // a silk swing up to a cocoon, then a spider beyond
        () => {
          silkWeb(1);
          spiderRun(1, R.r(720, 820));
        },
        // a high road with a cocoon on it, and a spider after
        () => {
          highRoad(R.r(480, 560), (x0, x1, y) => {
            if (R.chance(0.5) && cocoons55.length < COCOON_MAX_55) cocoon(x0 + (x1 - x0) * HOP_SAFE[0], y);
          });
          spiderRun(1, R.r(900, 1000));
        },
        // soft chairs among the guests who sat, then a cocoon
        () => {
          // (the first soft chairs of the stage: a calm stretch first, so a spider woken by the piece before has given up and the line
          // is up well ahead; a line waits while anything chases him)
          // (and only once the pouch scene and the web's lines are well over, CHAIRS_55_AFTER: drawn sooner, only the guests who sat)
          const soft = expert > CHAIRS_55_AFTER;
          if (soft && !chairs.some((c) => !c.wrapped)) {
            // (said as the calm begins, about 1,700 px ahead of the first chair: room for a line already up, the "Still n animals" nag
            // or a hum's, to have its say first and the chairs' still to come well ahead of them. Petals along it)
            hint(x, { stage: '5-5', kind: 'move', old: W5_TEACH.chair, text: null }, 'chair');
            rest(R.r(1300, 1400));
          }
          if (soft) chairWalk(2, 2);
          else {
            // (too soon for soft chairs: the guests who sat, wrapped where they sat, along a stretch of garden)
            const x0 = x;
            rest(R.r(560, 640));
            chairs.push({ x: r(x0 + (x - x0) * 0.3), y: G, face: 1, wrapped: true }, { x: r(x0 + (x - x0) * 0.7), y: G, face: -1, wrapped: true });
          }
          cocoonRow(1);
        },
        // a humming thread and its sleeper, then the second jump
        () => {
          threadTrap(1);
          gap(true);
        },
        // NEW: two threads strung close, a sleeper behind each, then a cocoon (a timed hop and a hop, beat Z; nothing that holds a line)
        () => {
          threadTrap(1);
          threadTrap(1);
          cocoonRow(1);
          gap(R.chance(0.5));
        },
        // NEW: a spider on the narrow ground between two soft pits, then a cocoon (beat C between two J's)
        () => {
          gap();
          spiderRun(1, R.r(700, 800));
          gap(true);
          cocoonRow(1);
        },
        // NEW: cocoons on a high road with sleeping spiders on the grass under it (hop them, or stay up top: a walk into one wakes it).
        // (Not 5-3's orchids: their line holds the screen until he hops onto one, and every line after it waits behind it)
        () => {
          const x0 = x;
          highRoad(R.r(560, 640), (a, b, y) => {
            for (const u of HOP_SAFE) if (cocoons55.length < COCOON_MAX_55) cocoon(a + (b - a) * u, y);
          });
          const x1 = x;
          for (const u of [0.35, 0.7]) if (info.spiders.length < MOST['5-5'].spiders) spider(x0 + (x1 - x0) * u, Math.max(bankFrom + 30, x0), x1 - 30, true);
          rest(R.r(240, 300), false);
          gap();
        },
        // NEW: a silk swing over a soft pit to a high branch with one cocoon on it (the way on is the second jump; ground under all of it)
        () => {
          silkWeb(1);
          rest(R.r(240, 300), false);
        },
        // a shimmering silk sheet by the path (5-4's: don't stop to look), then a cocoon
        () => { sheetWalk(); cocoonRow(1); },
        // a sheet, then a spider
        () => { sheetWalk(); spiderRun(1, R.r(720, 820)); },
        // a sheet, then a humming thread and its sleeper
        () => { sheetWalk(); threadTrap(1); },
        // two spiders, then a sheet
        () => { spiderRun(2, R.r(1000, 1100)); sheetWalk(); },
      ], 2, [], 2);
      let n = 0;
      while (expert < stageSeconds('5-5') - 8 && n < 30) {
        next();
        // (cocoons along the way whenever the count falls behind the goal's pace: never one clump at the end, the same each play)
        const pace = (COCOON_GOAL_55 * 1.5 + 1) * Math.min(1, expert / (stageSeconds('5-5') - 20));
        if (cocoons55.length < pace - 1) cocoonRow(cocoons55.length < pace - 3 ? 2 : 1);
        if (n % 2 === 1) flag();
        n++;
      }
      // (whatever the theme drew, half again the goal in cocoons, most of them off the web: w5Stage55.test.ts)
      const offWeb = () => cocoons55.length - (info.web55?.cocoons.length ?? 0);
      while ((cocoons55.length < COCOON_GOAL_55 * 1.5 + 1 || offWeb() < COCOON_GOAL_55 * 1.25 + 1) && cocoons55.length < COCOON_MAX_55) cocoonRow(2);
      // the keepsake's fern, near the end: its line (crouch beside it) waits for him to crouch, so nothing new comes after it
      fernStretch();
      rest(R.r(480, 560));
      if (expert < stageSeconds('5-5')) rest((stageSeconds('5-5') - expert) * RUN + 60);
    });
  }

  // the shrine, and nothing past it (and no spider's patch within reach of it: a spot he arrives at is safe, levelCheck SAFE_APPROACH)
  const reach = Math.max(-1e9, ...E.map((e) => e.patrolMaxX));
  if (x - 220 - reach < SAFE_GAP) run(SAFE_GAP - (x - 220 - reach));
  const exitX = r(x - 220);
  close();
  C.push({ id: cid++, type: 'exit_totem', x: exitX, y: G - 30, collected: false, bobPhase: 0 });
  const past = (px: number) => px > exitX + PAST_SHRINE;
  for (let i = C.length - 1; i >= 0; i--) if (past(C[i].x)) C.splice(i, 1);
  for (let i = cocoons55.length - 1; i >= 0; i--) if (past(cocoons55[i].x)) cocoons55.splice(i, 1);
  // (5-5: the guests who sat, wrapped where they sat, are kept well away from where the cocoons hang, so a silk bundle by a cocoon is
  // never one that cannot be opened: both QA bots punched a wrapped chair beside one, v198)
  if (plan === '5-5') {
    const nearCocoon = (px: number, w = 0) => cocoons55.some((c) => Math.abs(c.x - px) < W5_CLEAR_OF_COCOON + w / 2);
    for (let i = chairs.length - 1; i >= 0; i--) if (chairs[i].wrapped && nearCocoon(chairs[i].x, 84)) chairs.splice(i, 1);
    for (let i = decor.length - 1; i >= 0; i--) if (WRAPPED_LOOKS.has(decor[i].n) && nearCocoon(decor[i].x, decor[i].w)) decor.splice(i, 1);
  }
  // (5-5: no petal at or past the shrine's door, where touching the shrine ends the stage before it can be picked)
  if (plan === '5-5') for (let i = C.length - 1; i >= 0; i--) if (C[i].type === 'flower' && C[i].x > exitX - 40) C.splice(i, 1);
  for (const list of [cakes, butlers, chairs, threads, orchids, pots] as Array<Array<{ x?: number; x0?: number }>>) {
    for (let i = list.length - 1; i >= 0; i--) if (past(list[i].x ?? list[i].x0 ?? 0)) list.splice(i, 1);
  }
  info.flagSeconds.push(expert);

  const W = Math.ceil(x + 20);
  // (the hearts at the flags at walking height, as the petals are: 60 px up, a first-timer ran under them at 4 of 5 hearts; QA, 2026-10-26)
  cid = heartsAtFlags(C, checkpoints, cid, W5_HEART_UP);
  const movedPickups = fixPickups({ platforms: P, vines: V, ropes: [] }, C);
  // (5-3's quota: a share of its flowers, more than the path holds alone)
  const flowers = C.filter((c) => c.type === 'flower').length;
  const cfg: LevelConfig = { ...config, levelWidth: W, levelHeight: Math.max(config.levelHeight, 900), ...(plan === '5-3' ? { targetCount: Math.round(flowers * W5_HARVEST_SHARE) } : {}) };
  if (plan === '5-5') cfg.targetCount = COCOON_GOAL_55;
  const w5: W5Extras = {
    mood: 'gold', petals: true, ...(plan === '5-1' ? { gentle: true } : {}),
    chairs, tables, cakes, butlers, threads, carvings, spiders, decor, ...(orchids.length ? { orchids } : {}), ...(pots.length ? { pots } : {}), ...(sheets.length ? { sheets } : {}),
  };
  // 5-5: the dusk (the other take from 5-4's, w5Backdrop.ts), the cocoons and the rest branch
  if (plan === '5-5') Object.assign(w5, { mood: 'dusk', petals: false, cocoons: cocoons55, rest: rest55 } satisfies Partial<W5Extras>);
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
    exitTotemY: G,
    checkpoints: checkpoints.sort((a, b) => a.x - b.x),
    zones: [],
    meta: { attempt: seed, chunks: [], width: W, timing: { layoutSeconds: expert, decorSeconds: 0, route: W } },
    proto: { hints: hints.sort((a, b) => a.x - b.x), covers, beats, movedPickups, w5 },
    w5info: info,
  };
}
