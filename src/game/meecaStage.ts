/**
 * meecaStage — Meeca's stage (5-M, "On the March North"), the first stage of World 5 (Matt, 2026-10-27/28): weeks before Pokey comes,
 * on the march north, the column camps one night in the Orchid Sanctuary. While the guards sleep she slips out of line and tiptoes
 * off. She is free, and lost; a firefly's light blinks on (Flicker, who is her guide here: Dot is a hill over, following a hibiscus),
 * and she starts a trail of carvings, to find her way back and for Pokey to follow. Each of her five warnings is a puzzle room where
 * she learns that rule the hard way (never deadly, never sent back), then carves it:
 *
 *   PROLOGUE  the night camp (she tiptoes past the sleeping guards), the dark woods where two paths look the same, Flicker, and her
 *             first trail mark (he shows the circle: trace a circle on the trunk)
 *   1 SIT     a ledge too high to jump; a soft armchair is the obvious step and a trap (it holds her in silk until she wiggles free);
 *             a young sapling, climbed, bends over under her into a bridge. POKEY. DON'T SIT. M.
 *   2 EAT     a two-plate gate. A beetle by the door eats a cake and falls asleep where it ate; a cake on the far plate brings the other
 *             beetle onto it, and she stands on the near one. DON'T EAT. M.
 *   3 SILK    a shining silk line hangs down like a vine (grabbed, it holds her a moment and drops her); up top a vine ladder is rolled
 *             and tied with a silk knot: a pinecone thrown up snaps it, and the ladder unrolls. HANDS OFF THE SILK. M.
 *   4 TEA     a polite spider butler blocks the low root arch with tea (manners get her a cup and a sleepy moment); she tips his teapot
 *             over, the tea runs down a trough into a hanging basket, and its weight lifts her over the arch. NO TEA. BE RUDE. M.
 *   5 LOOK    the last path is dark: its steps show only in Flicker's light. At the top his glow opens a moonflower that lights it all;
 *             she stops to look, and Lieutenant Pell steps out with the guards ("Since the first tree"). She cuts the last warning,
 *             DON'T STOP TO LOOK. LOVE, M., while he waits; then the blanket.
 *
 * Every room is the shared puzzle kit's (puzzleKit.ts, phase 2b's pieces for the chair, the sapling, the silk line, the knot and its
 * ladder, the teapot, Flicker's light and the moonflower), proven by the validator (puzzleCheck.ts) and played in the real engine
 * (meecaReal.test.ts). Each room fits an upright phone (under 800 x 540), has a lantern-stake reset post, and costs no life.
 *
 * Planned, details rolled: the beats are always there in that order; the seed rolls the camp (who sleeps where, the tents), the walk
 * between rooms, the room-5 steps a little, and which of the guards' coats come with Pell.
 */
import { G, stream } from './protoStage.ts';
import type { GeneratedStage } from './stageGenerator.ts';
import type { LevelConfig, Platform, TreeStructure, Vine } from './types.ts';
import { addKitPlatforms, kitPlatId, type Anchor, type KitExtras, type RoomSpec } from './puzzleKit.ts';
import { MEECA_ENDING, MEECA_MARK, MEECA_WARNINGS, ROOM_LINES } from './meecaLines.ts';
import { MODEL_FAST, MODEL_TYPICAL, TIME, walkSpeed, type ModelParams } from './stageTime.ts';
import type { Zone } from './zones.ts';

/** the ground (her path), as the rest of the game's */
export const MEECA_G = G;
export const MEECA_LEVEL_H = 1200;
/** a letter of a warning takes this long to cut (s), a full stop or a comma this long; a circle traced cuts CIRCLE_S per radian */
export const LETTER_S = 0.28;
export const MARK_S = 0.12;
export const CIRCLE_S = 0.32;
/** her walk through the camp: on tiptoe (px/s of her run 285) */
export const TIPTOE = 120;

/** a tree she carves (the trail mark, then the five warnings) */
export interface MeecaTrunk {
  /** 'mark', then the warnings' ids */
  id: string;
  /** -1 for the trail mark, else the warning's index (the HUD counts these) */
  index: number;
  lines: readonly string[];
  /** the trunk's middle, and its foot */
  x: number;
  ground: number;
  w: number;
  h: number;
  /** the words: their middle, the top line's height, the letters' height */
  textX: number;
  textY: number;
  size: number;
  /** where she stands to carve it (her feet), and how near counts */
  standX: number;
  standY: number;
  /** the room it closes ('' for the trail mark) */
  room: string;
}

/** a piece of the night camp's dressing (meecaNightData.ts names) */
export interface CampProp {
  n: string;
  x: number;
  y: number;
  scale?: number;
  flip?: boolean;
  /** drawn in front of her (a sleeper she tiptoes behind is behind) */
  front?: boolean;
}

export interface MeecaStage {
  seed: number;
  width: number;
  spawn: { x: number; y: number };
  /** the camp: from 0 to campEnd she walks on tiptoe past the sleeping column */
  campEnd: number;
  camp: CampProp[];
  /** the first gully past the camp (her thought: the way on is the high way) */
  highX: number;
  /** room 1's high wall (the face of its ledge): she says it is the way up to find, at its foot */
  wallX: number;
  /** the two paths that look the same (her thought, "Which way is back?") */
  forkX: number;
  /** where Flicker's light blinks on, as she reaches flickerX */
  flickerX: number;
  flickerAt: { x: number; y: number };
  trunks: MeecaTrunk[];
  /**
   * the checkpoint flags (x, on the path's ground): past the camp, by Flicker before the trail mark (past it, it stood right at the
   * trunk's wall and read as the thing stopping her; a life lost after the mark comes back here with the mark still cut), at each room's door, and for room 5 (whose door
   * is in the dark, where no flag may stand) past room 4's trunk (QA 2026-10-31: the spawn was the only flag, so any lost life sent her
   * back to her bedroll). Each stands behind the next trunk to cut, never past it.
   */
  flags: number[];
  /** the last path's dark (room 5), and the clearing past it */
  darkX0: number;
  clearing: { y: number; pellFrom: number; pellAt: number; soldiers: Array<{ x: number; coat: 'a' | 'b' }>; stakes: number[]; moonX: number };
  /** the beats, for the tests and the inspector: [x0, x1, name] */
  beats: Array<[number, number, string]>;
  /** the trails between the story's moments: each its way through, step by step (the bot follows it) */
  trails: MeecaTrail[];
  /** a landmark at the start of each trail section (meecaArt.ts draws them) */
  landmarks: MeecaLandmark[];
}

/** a World 5 piece standing at the start of a trail section, so each section is a place of its own */
export interface MeecaLandmark {
  n: (typeof LANDMARKS)[number][0];
  /** its foot's middle, its width drawn, mirrored */
  x: number;
  y: number;
  w: number;
  flip: boolean;
}
/** the landmarks (World 5's pieces, w5PropsData.ts) and how wide each is drawn: a big orchid, a mossy broken stump, a silk cocoon... */
export const LANDMARKS = [
  ['orchidPink', 150], ['orchidPink2', 170], ['cocoonWrapped', 130], ['cocoonTorn', 120], ['mossRoot', 150], ['mossRoot2', 140],
  ['fern', 150], ['wrappedStool', 70], ['orchidSprout2', 72],
] as const;

/**
 * The kinds of trail section (2026-10-28, after Matt played it: "climbing is unneeded because you can just run straight across the
 * bottom"). Every one is a high way that is the only way on: its floor is a deep gully whose only way out is the stairs back at its near
 * end (or, for the bank, a wall), so a climb, a branch, a log or a jump is the way across, never a walk under it.
 */
export type TrailKind = 'canopy' | 'logs' | 'hollow' | 'fallen' | 'double';
/** a step along a trail: onto a platform, or up a climbing trunk */
export type TrailStep = { kind: 'plat'; id: number } | { kind: 'climb'; vine: number };
export interface MeecaTrail {
  x0: number;
  x1: number;
  name: string;
  steps: TrailStep[];
  /** its sections, in order: the kind, and where each starts and ends (on the path, G) */
  /** each section, and a log crossing's shape (a level row, steps up, two sagging logs) */
  sections: Array<{ kind: TrailKind; x0: number; x1: number; shape?: 'row' | 'steps' | 'sag' }>;
}
/** how many sections each trail has: out of the camp, after the mark, then before rooms 2 to 5 (tuned to the stage's length) */
export const TRAIL_SECTIONS: readonly number[] = [2, 4, 4, 4, 4, 4];
/** a gully's floor, this far below the path: deeper than a second jump climbs (DOUBLE_RISE ~185), so its far wall is a wall */
export const GULLY = 260;
/** the practice pinecone at the top of room 1's ledge (the first thing she carries) */
export const PRACTICE_ID = 'try1';

/** how long a warning's cut takes, from `from` characters already cut (s of holding) */
export function carveSeconds(lines: readonly string[], from = 0): number {
  let s = 0;
  let i = 0;
  for (const line of lines) {
    for (const ch of line) {
      if (ch === ' ') continue;
      if (i++ < from) continue;
      s += /[A-Z]/.test(ch) ? LETTER_S : MARK_S;
    }
  }
  return s;
}
/** the characters of a warning that are cut (no spaces) */
export const carveChars = (lines: readonly string[]): number => lines.reduce((a, l) => a + l.replace(/ /g, '').length, 0);

const BANK = 90;

/** the pieces of ground and the rooms the builder made, kept with the stage it made them for */
const BUILT = new WeakMap<MeecaStage, { platforms: Platform[]; vines: Vine[]; trees: TreeStructure[]; kit: KitExtras; zones: Zone[] }>();

export function buildMeecaStage(seed = 1): MeecaStage {
  const R = stream(seed * 17 + 3);
  let pid = 1;
  const P: Platform[] = [];
  const ground = (x0: number, x1: number, y: number, h = BANK, style: Platform['style'] = 'moss_stone'): Platform => {
    const p: Platform = { id: pid++, x: x0, y, width: x1 - x0, height: h, type: 'solid', style };
    P.push(p);
    return p;
  };
  const vines: Vine[] = [];
  let vid = 1;
  const kitVine = (x: number, topY: number, bottomY: number): Vine => {
    const v: Vine = { id: vid++, x, topY, bottomY, swaySpeed: 0, swayPhase: 0, vineType: 'tree_climb', kit: true };
    vines.push(v);
    return v;
  };
  const on = (p: Platform, x: number, dy = 0): Anchor => ({ on: p.id, at: (x - p.x) / p.width, ...(dy ? { dy } : {}) });
  const trunks: MeecaTrunk[] = [];
  const trunk = (index: number, x: number, gy: number, size: number, room: string): MeecaTrunk => {
    const w = index < 0 ? MEECA_MARK : MEECA_WARNINGS[index];
    const tw = index < 0 ? 104 : 116;
    const th = index < 0 ? 380 : 440;
    const t: MeecaTrunk = {
      id: w.id, index, lines: w.lines, x, ground: gy, w: tw, h: th, textX: x, textY: gy - (index < 0 ? 150 : 178), size,
      standX: x - 74, standY: gy, room,
    };
    trunks.push(t);
    return t;
  };
  const beats: Array<[number, number, string]> = [];
  const rooms: RoomSpec[] = [];
  // (the walk between rooms rolls a little: never so long it is a quiet stretch, STAGE-RULES §2)
  const walk = () => Math.round(R.r(-30, 30));

  // ── the trail between the rooms: the night forest, lost and circling (rolled from real alternatives, each a little platforming) ──
  const trees: TreeStructure[] = [];
  let tid = 1;
  const trails: MeecaTrail[] = [];
  const block = (x0: number, x1: number, top: number, style: Platform['style'] = 'moss_stone'): Platform => ground(x0, x1, top, G + BANK - top, style);
  const branch = (x0: number, x1: number, y: number): Platform => {
    const p: Platform = { id: pid++, x: x0, y, width: x1 - x0, height: 24, type: 'solid', style: 'branch' };
    P.push(p);
    return p;
  };
  const climbTree = (x: number, perchY: number): Vine => {
    const tree: TreeStructure = { id: tid++, x, groundY: G, topY: perchY - 150, trunkWidth: 76, hasClimbVine: true, canopyRadius: 150 };
    trees.push(tree);
    const v: Vine = { id: vid++, x, topY: perchY - 2, bottomY: G - 6, swaySpeed: 0.9, swayPhase: (x * 0.007) % 6.28, vineType: 'tree_climb', treeId: tree.id };
    vines.push(v);
    return v;
  };
  /** ground at the path's height whose face goes down to a gully's floor (walls reach the ground: STAGE-RULES §6) */
  const gbank = (x0: number, x1: number): Platform => ground(x0, x1, G, GULLY + BANK);
  /**
   * A gully from x0 to x1: stairs down at its near end (three steps a short hop each: the floor leads back the way she came), a soft
   * floor, and its far end the next bank's face, too high to jump. A miss costs a walk back, never a life.
   */
  const gully = (x0: number, x1: number): Platform => {
    const fy = G + GULLY;
    for (let i = 1; i <= 3; i++) ground(x0 + (i - 1) * 56, x0 + i * 56, G + i * 65, fy + BANK - (G + i * 65));
    return ground(x0 + 168, x1, fy, BANK);
  };
  const log = (x0: number, x1: number, y: number): Platform => {
    const p: Platform = { id: pid++, x: x0, y, width: x1 - x0, height: 30, type: 'solid', style: 'log' };
    P.push(p);
    return p;
  };
  /**
   * The sections a trail is made of (each starts and ends on the path, G, and the next one's bank is its far side): each a few real
   * moves (STAGE-RULES §2: no quiet stretch over about 4 s, a rest after each burst) and a way on that the floor does not give.
   */
  const SECTIONS: Record<TrailKind, (x: number, steps: TrailStep[]) => number> = {
    // up a tree on the near bank, along its branch and over the gully on the next ones, and down onto the far bank
    canopy: (x, steps) => {
      const g0 = gbank(x, x + 250);
      steps.push({ kind: 'plat', id: g0.id });
      const perch = G - R.i(220, 245);
      const v = climbTree(x + 120, perch);
      steps.push({ kind: 'climb', vine: v.id });
      let b = branch(x + 70, x + 300, perch);
      steps.push({ kind: 'plat', id: b.id });
      const n = R.i(2, 3);
      for (let i = 0; i < n; i++) {
        const bx = b.x + b.width + R.i(80, 115);
        b = branch(bx, bx + R.i(150, 200), Math.max(G - 250, Math.min(G - 205, b.y + R.i(-25, 25))));
        steps.push({ kind: 'plat', id: b.id });
      }
      // (the last branch reaches out over the far bank: she walks off its end onto it)
      const farX = b.x + b.width - 90;
      gully(g0.x + g0.width, farX);
      const g1 = gbank(farX, b.x + b.width + R.i(150, 200));
      steps.push({ kind: 'plat', id: g1.id });
      return g1.x + g1.width;
    },
    // logs jammed across a gully, hop to hop (they do not reach the floor: under them is the gully's floor, and the stairs back). Three
    // shapes, dealt in turn so no two log crossings in a play look alike (Matt, 2026-10-31: "Repetitive"; QA: four precise hops of
    // 94-110 px over the same pit before every room, a bot fell ~15 times): a level row of wide logs, logs stepping up toward a high far
    // bank, and two long logs set low. Every hop is a short one (60-85 px, at most 30 px up), on a log wide enough to land on
    logs: (x, steps) => {
      const shape = logShapes[logTurn++ % logShapes.length];
      lastShape = shape;
      const g0 = gbank(x, x + 200);
      steps.push({ kind: 'plat', id: g0.id });
      let ex = g0.x + g0.width;
      let y = G;
      const hop = () => R.i(60, 85);
      if (shape === 'row') {
        for (let i = 0; i < 3; i++) {
          const lx = ex + hop();
          y = Math.max(G - 40, Math.min(G + 15, y + R.i(-25, 20)));
          const l = log(lx, lx + R.i(150, 170), y);
          steps.push({ kind: 'plat', id: l.id });
          ex = l.x + l.width;
        }
      } else if (shape === 'steps') {
        for (let i = 0; i < 3; i++) {
          const lx = ex + hop();
          y -= R.i(20, 30);
          const l = log(lx, lx + R.i(140, 160), y);
          steps.push({ kind: 'plat', id: l.id });
          ex = l.x + l.width;
        }
      } else {
        // (two long logs, lower than the path: a walk along one, a hop, a walk along the other. Not so long that the next is off an
        // upright screen from its near end: meecaCamera.test.ts)
        for (let i = 0; i < 2; i++) {
          const lx = ex + hop();
          y = G + R.i(10, 20);
          const l = log(lx, lx + R.i(175, 195), y);
          steps.push({ kind: 'plat', id: l.id });
          ex = l.x + l.width;
        }
      }
      const gx = ex + R.i(60, 80);
      gully(g0.x + g0.width, gx);
      // (the far bank of the steps is a stump's height above the last log; the others are level with the path)
      const g1 = shape === 'steps' ? block(gx, gx + R.i(170, 210), Math.max(y - 20, G - 100)) : gbank(gx, gx + R.i(170, 210));
      if (shape === 'steps') g1.height = G + GULLY + BANK - g1.y;
      steps.push({ kind: 'plat', id: g1.id });
      if (shape === 'steps') {
        // (and down off it to the path again)
        const g2 = gbank(g1.x + g1.width, g1.x + g1.width + R.i(220, 260));
        steps.push({ kind: 'plat', id: g2.id });
        return g2.x + g2.width;
      }
      return g1.x + g1.width;
    },
    // down the stairs into a hollow; its far side is a wall, and a trunk against it is the only way up and out
    hollow: (x, steps) => {
      const g0 = gbank(x, x + 180);
      steps.push({ kind: 'plat', id: g0.id });
      const wallX = g0.x + g0.width + R.i(400, 470);
      const floor = gully(g0.x + g0.width, wallX);
      steps.push({ kind: 'plat', id: floor.id });
      const fy = G + GULLY;
      const tree: TreeStructure = { id: tid++, x: wallX - 34, groundY: fy, topY: G - 170, trunkWidth: 70, hasClimbVine: true, canopyRadius: 140 };
      trees.push(tree);
      const v: Vine = { id: vid++, x: wallX - 34, topY: G - 2, bottomY: fy - 6, swaySpeed: 0.9, swayPhase: (wallX * 0.007) % 6.28, vineType: 'tree_climb', treeId: tree.id };
      vines.push(v);
      steps.push({ kind: 'climb', vine: v.id });
      // (a root lip over the trunk's top, at the path's height: she climbs up onto it, then the bank)
      branch(wallX - 80, wallX, G);
      const g1 = gbank(wallX, wallX + R.i(200, 250));
      steps.push({ kind: 'plat', id: g1.id });
      // a stump on the far bank to hop before the next thing
      const s = block(g1.x + g1.width, g1.x + g1.width + 90, G - R.i(55, 75));
      s.height = G + GULLY + BANK - s.y;
      steps.push({ kind: 'plat', id: s.id });
      const g2 = gbank(s.x + s.width, s.x + s.width + R.i(150, 190));
      steps.push({ kind: 'plat', id: g2.id });
      return g2.x + g2.width;
    },
    // a fallen tree over a gully, broken in two: a stump step up onto it, a hop up onto its higher half, and off its end onto the bank
    fallen: (x, steps) => {
      const g0 = gbank(x, x + 260);
      steps.push({ kind: 'plat', id: g0.id });
      const s1 = block(x + 110, x + 200, G - 70);
      s1.height = G + GULLY + BANK - s1.y;
      steps.push({ kind: 'plat', id: s1.id });
      const ly = G - R.i(140, 150);
      const len = R.i(460, 540);
      const lx = x + 230;
      const breakX = lx + R.i(200, len - 220);
      const a = log(lx, breakX, ly);
      steps.push({ kind: 'plat', id: a.id });
      const b = log(breakX, lx + len, ly - R.i(40, 50));
      steps.push({ kind: 'plat', id: b.id });
      const farX = lx + len - 90;
      gully(g0.x + g0.width, farX);
      const g1 = gbank(farX, lx + len + R.i(150, 200));
      steps.push({ kind: 'plat', id: g1.id });
      return g1.x + g1.width;
    },
    // a tall bank only a second jump (flick again at the top) gets up: the bank itself is the wall, and off its far end she drops down
    double: (x, steps) => {
      const g0 = gbank(x, x + 180);
      steps.push({ kind: 'plat', id: g0.id });
      // (her one jump reaches 98 px, her two about 166 on Normal and 185 on Easy with a 70% hold on each, a second flick from just
      // before the top of the first to about 0.13 s past it: 124-134 px is a second jump's bank on every roll, with a margin for a
      // late flick. QA 2026-10-29: at 136-146 a player "got level with the lip and dropped back", meecaReal.test.ts)
      const top = G - R.i(124, 134);
      const b = ground(g0.x + g0.width, g0.x + g0.width + R.i(240, 300), top, G + GULLY + BANK - top);
      steps.push({ kind: 'plat', id: b.id });
      const g1 = gbank(b.x + b.width, b.x + b.width + R.i(200, 250));
      steps.push({ kind: 'plat', id: g1.id });
      return g1.x + g1.width;
    },
  };
  /**
   * the kinds, dealt from one shuffled bag for the whole stage (it used to be a new bag for each trail, so the log pit came on nearly
   * every trail, before every room: Matt, 2026-10-31 "Repetitive"), so no kind comes twice running and each comes once in five
   */
  let bag: TrailKind[] = [];
  let last: TrailKind | null = null;
  /** the log crossings' shapes, in a rolled order, one after another */
  const logShapes = R.shuffle(['row', 'steps', 'sag'] as const);
  let logTurn = 0;
  let lastShape: 'row' | 'steps' | 'sag' | undefined;
  /** a trail `n` sections long from x (on the ground), the kinds dealt from the stage's bag so no kind comes twice running */
  const trail = (x: number, n: number, name: string, lead = 0): number => {
    const steps: TrailStep[] = [];
    // (down off a room's high exit: a little path first, so the first branches are not a jump from the room's top)
    if (lead) {
      const g = ground(x, x + lead, G);
      steps.push({ kind: 'plat', id: g.id });
      x += lead;
    }
    const sections: MeecaTrail['sections'] = [];
    const x0 = x;
    for (let i = 0; i < n; i++) {
      if (!bag.length) bag = R.shuffle(['canopy', 'logs', 'hollow', 'fallen', 'double'] as TrailKind[]);
      let k = bag.pop()!;
      if (k === last && bag.length) {
        bag.unshift(k);
        k = bag.pop()!;
      }
      // (three log crossings a play at most, one of each shape: a fourth or fifth repeated a shape already crossed)
      if (k === 'logs' && logTurn >= logShapes.length) {
        const others = (['canopy', 'hollow', 'fallen', 'double'] as TrailKind[]).filter((q) => q !== last);
        k = others[R.i(0, others.length - 1)];
      }
      last = k;
      const sx = x;
      x = SECTIONS[k](x, steps);
      sections.push({ kind: k, x0: sx, x1: x, ...(k === 'logs' ? { shape: lastShape } : {}) });
    }
    trails.push({ x0, x1: x, steps, sections, name });
    beats.push([x0, x, `Trail: ${name}`]);
    return x;
  };

  // ── PROLOGUE: the night camp, the dark woods, Flicker, the first mark ──
  const spawn = 250;
  const campEnd = 900 + walk();
  const camp: CampProp[] = [];
  {
    const sleepers = R.shuffle(['guard1', 'guard2', 'guard3', 'guard4', 'guard6', 'guard8']);
    camp.push({ n: 'tent', x: 90, y: G, scale: 1 });
    camp.push({ n: 'packs', x: 170, y: G });
    camp.push({ n: 'bedroll', x: spawn + 6, y: G });
    camp.push({ n: sleepers[0], x: 380, y: G });
    camp.push({ n: 'fire', x: 500, y: G });
    camp.push({ n: sleepers[1], x: 600, y: G, flip: true });
    camp.push({ n: R.chance(0.5) ? 'tent' : 'packs', x: 700, y: G, flip: R.chance(0.5) });
    camp.push({ n: 'guardStump', x: 800, y: G, flip: true });
    camp.push({ n: sleepers[2], x: 160, y: G });
    camp.push({ n: 'stakeLit', x: 880, y: G });
  }
  const floor0 = ground(0, campEnd + 240, G);
  beats.push([0, campEnd, 'Prologue: the night camp, on tiptoe']);
  // out of the camp into the dark woods (she thinks she is free: a little trail, then she is lost)
  let cx = trail(floor0.x + floor0.width, TRAIL_SECTIONS[0], 'out into the woods');
  const woods = ground(cx, cx + 720, G);
  const forkX = woods.x + 160;
  const flickerX = forkX + 140;
  const mark = trunk(-1, flickerX + 260, G, 24, '');
  beats.push([woods.x, mark.x + 100, 'Prologue: lost, Flicker, the first mark']);
  cx = trail(woods.x + woods.width, TRAIL_SECTIONS[1], 'lost, with Flicker');

  // ── ROOM 1: DON'T SIT ──
  const r1 = cx + 40;
  // the floor to the dip; the dip (a hop deep, a soft floor); the ledge too high to jump
  const floorA = ground(cx, r1 + 460, G);
  const dip = ground(floorA.x + floorA.width, r1 + 660, G + 70, BANK);
  const ledge1 = ground(dip.x + dip.width, r1 + 1240, G - 240, 240 + BANK);
  const sapX = r1 + 260;
  const sap = kitVine(sapX, G - 330, G - 6);
  const sit: RoomSpec = {
    id: 'sit',
    left: on(floorA, r1 + 20), right: on(ledge1, ledge1.x + 140), above: 420, below: 120,
    pieces: [
      { kind: 'reset', id: 'post1', at: on(floorA, r1 + 50) },
      { kind: 'chair', id: 'chair1', at: on(floorA, r1 + 400) },
      { kind: 'sapling', id: 'sapling1', at: on(floorA, sapX), to: on(ledge1, ledge1.x + 30), h: 330, vine: sap.id },
      // (up on the ledge, safe, the first thing she can carry: picking up, setting down and throwing taught before room 2 needs them,
      // QA 2026-10-29. Not for anything: thrown off the ledge it is gone, and room 2 has its own)
      { kind: 'item', id: PRACTICE_ID, variant: 'pinecone', at: on(ledge1, ledge1.x + 110) },
    ],
    exit: 'sapling1',
    beyond: on(ledge1, ledge1.x + 120),
    ground: [floorA.id, dip.id, ledge1.id],
    tips: { ...ROOM_LINES.sit },
  };
  rooms.push(sit);
  const t1 = trunk(0, ledge1.x + 260, ledge1.y, 30, 'sit');
  beats.push([r1, t1.x + 100, "Room 1: DON'T SIT (the chair, the sapling)"]);
  cx = trail(ledge1.x + ledge1.width, TRAIL_SECTIONS[2], 'on through the orchids', 220);

  // ── ROOM 2: DON'T EAT ──
  const r2 = cx;
  const b0 = r2 + 50;
  const floorB = ground(r2, b0 + 1020, G);
  // (QA 2026-10-29, upright: the two plates and the gate did not fit on one screen. They now stand within about 370 px, the cake's
  // stool just before them: on a 390 px wide phone held upright the room's framing shows her, both plates and the gate together)
  const eat: RoomSpec = {
    id: 'eat',
    left: on(floorB, b0 - 20), right: on(floorB, b0 + 705), above: 420, below: 80,
    pieces: [
      { kind: 'reset', id: 'post2', at: on(floorB, b0) },
      // (by the door a beetle waits by a cake that fell off the stool: it eats it and falls asleep there, as she comes in, so everyone
      // sees what a cake does before they carry one)
      { kind: 'item', id: 'crumb2', variant: 'cake', at: on(floorB, b0 + 60) },
      { kind: 'beetle', id: 'dozer2', at: on(floorB, b0 + 120), waitNear: 190 },
      // (the stool out of the dozer's sight, so it eats the crumb by the door and not the stool's cakes)
      { kind: 'source', id: 'stool2', variant: 'cake', at: on(floorB, b0 + 340), look: 'pile' },
      { kind: 'item', id: 'cake2', variant: 'cake', source: 'stool2', for: 'plateB' },
      { kind: 'plate', id: 'plateA', at: on(floorB, b0 + 420) },
      { kind: 'plate', id: 'plateB', at: on(floorB, b0 + 535) },
      { kind: 'beetle', id: 'beetle2', at: on(floorB, b0 + 595) },
      { kind: 'gate', id: 'gate2', at: on(floorB, b0 + 665), open: { all: ['plateA', 'plateB'] }, latch: true, look: 'woven' },
    ],
    exit: 'gate2',
    beyond: on(floorB, b0 + 745),
    ground: [floorB.id],
    tips: { ...ROOM_LINES.eat },
  };
  rooms.push(eat);
  const t2 = trunk(1, b0 + 860, G, 30, 'eat');
  beats.push([r2, t2.x + 100, "Room 2: DON'T EAT (the cake, the beetles, two plates)"]);
  cx = trail(floorB.x + floorB.width, TRAIL_SECTIONS[3], 'deeper in');

  // ── ROOM 3: HANDS OFF THE SILK ──
  const c0 = cx + 30;
  const floorC = ground(cx, c0 + 520, G);
  const cliffX = floorC.x + floorC.width;
  const cliff = ground(cliffX, cliffX + 640, G - 280, 280 + BANK);
  const silk = kitVine(c0 + 260, G - 400, G - 6);
  const ladderV = kitVine(cliffX - 23, G - 286, G - 6);
  const silkRoom: RoomSpec = {
    id: 'silk',
    left: on(floorC, c0 - 20), right: on(cliff, cliffX + 100), above: 440, below: 100,
    pieces: [
      { kind: 'reset', id: 'post3', at: on(floorC, c0) },
      { kind: 'source', id: 'cones3', variant: 'pinecone', at: on(floorC, c0 + 100), look: 'pile' },
      { kind: 'item', id: 'cone3', variant: 'pinecone', source: 'cones3', for: 'knot3' },
      { kind: 'silk', id: 'silk3', at: on(floorC, silk.x), vine: silk.id },
      // (on the cliff's face, low enough to clear the HUD's sign on a phone held sideways: QA 2026-10-31 saw it under 'Warnings')
      { kind: 'knot', id: 'knot3', at: on(floorC, cliffX - 25, -220) },
      { kind: 'ladder', id: 'ladder3', at: on(cliff, cliffX + 4), vine: ladderV.id, open: 'knot3' },
    ],
    exit: 'ladder3',
    beyond: on(cliff, cliffX + 80),
    ground: [floorC.id],
    tips: { ...ROOM_LINES.silk },
  };
  rooms.push(silkRoom);
  const t3 = trunk(2, cliffX + 300, cliff.y, 28, 'silk');
  beats.push([c0, t3.x + 100, 'Room 3: HANDS OFF THE SILK (the silk line, the knot, the ladder)']);
  cx = trail(cliff.x + cliff.width, TRAIL_SECTIONS[4], 'down from the bank', 220);

  // ── ROOM 4: NO TEA. BE RUDE. ──
  const d0 = cx + 60;
  // (the floor stops at the lift's well and goes on past it, under the arch, to the tree)
  const floorD = ground(cx, d0 + 390, G);
  const well = ground(d0 + 390, d0 + 500, G + 60, BANK);
  const archX = d0 + 550;
  const floorD2 = ground(well.x + well.width, archX + 400, G);
  const tea: RoomSpec = {
    id: 'tea',
    left: on(floorD, d0 - 20), right: on(floorD2, archX + 70), above: 420, below: 90,
    pieces: [
      { kind: 'reset', id: 'post4', at: on(floorD, d0) },
      // (the pot stands on its table right by the lift: tipped from the lift's plank, its tea lifts her; tipped from the floor, the lift
      // goes up without her, and the post sets the table again)
      { kind: 'basket', id: 'basket4', at: on(floorD, d0 + 170), mouth: 110, need: 1, drop: 70 },
      { kind: 'teapot', id: 'pot4', at: on(floorD, d0 + 345, -110), into: 'basket4', trough: [on(floorD, d0 + 260, -122), on(floorD, d0 + 178, -116)] },
      { kind: 'lift', id: 'lift4', at: { on: well.id, at: 0.5, dy: G - well.y }, w: well.width, rise: 250, by: 'basket4' },
      { kind: 'gate', id: 'butler4', at: on(floorD2, archX), open: { any: [] }, h: 250, look: 'butler' },
    ],
    exit: 'lift4',
    beyond: on(floorD2, archX + 110),
    ground: [floorD.id, well.id],
    tips: { ...ROOM_LINES.tea },
  };
  rooms.push(tea);
  const t4 = trunk(3, archX + 220, G, 28, 'tea');
  beats.push([d0, t4.x + 100, 'Room 4: NO TEA. BE RUDE. (the Butler, the teapot, the trough, the lift)']);
  cx = trail(floorD2.x + floorD2.width, TRAIL_SECTIONS[5], 'to the last path');

  // ── ROOM 5: DON'T STOP TO LOOK, and the clearing ──
  const e0 = cx;
  const floorE = ground(e0, e0 + 150, G);
  // the pit under the dark steps: a soft floor (never deadly), and a step out of it at its near end
  const pit = ground(floorE.x + floorE.width, e0 + 580, G + 150, BANK);
  const step = ground(pit.x, pit.x + 70, G + 75, BANK + 75);
  // (its face reaches down past the pit's floor: walls reach the ground, STAGE-RULES §6)
  const bank = ground(pit.x + pit.width, e0 + 1500, G - 250, 250 + 150 + BANK);
  const lift = Math.round(R.r(-8, 8));
  const look: RoomSpec = {
    id: 'look',
    left: on(floorE, e0 + 4), right: on(bank, bank.x + 140), above: 440, below: 200,
    pieces: [
      { kind: 'reset', id: 'post5', at: on(floorE, e0 + 20) },
      { kind: 'glow', id: 'flicker5', r: 170 },
      { kind: 'ledge', id: 'step5a', at: on(pit, e0 + 210, -200 + lift), w: 100 },
      { kind: 'ledge', id: 'step5b', at: on(pit, e0 + 350, -270), w: 100 },
      { kind: 'ledge', id: 'step5c', at: on(pit, e0 + 490, -340 - lift), w: 100 },
      // (out of Flicker's reach from the last step: it opens as she comes up onto the bank)
      { kind: 'moonflower', id: 'moon5', at: on(bank, bank.x + 200), r: 900 },
    ],
    exit: 'moon5',
    beyond: on(bank, bank.x + 80),
    ground: [floorE.id],
    tips: {},
  };
  rooms.push(look);
  void step;
  const t5 = trunk(4, bank.x + 420, bank.y, 27, 'look');
  const coats: Array<'a' | 'b'> = R.chance(0.5) ? ['a', 'b'] : ['b', 'a'];
  const clearing = {
    y: bank.y, pellFrom: t5.x + 470, pellAt: t5.x + 130,
    soldiers: [{ x: t5.x + 240, coat: coats[0] }, { x: t5.x + 330, coat: coats[1] }],
    stakes: [t5.x + 100, t5.x + 200, t5.x + 310, t5.x + 410], moonX: bank.x + 200,
  };
  beats.push([e0, bank.x + bank.width, "Room 5: DON'T STOP TO LOOK (the dark steps, the moonflower, Pell)"]);

  const kit: KitExtras = { rooms };
  addKitPlatforms(P, kit);
  // (the lift's plank is ground a thing may rest on; nothing is carried in room 4, but the kit counts it so)
  tea.ground.push(kitPlatId(rooms.indexOf(tea), 'lift4', 0));
  const zones: Zone[] = [
    { kind: 'dark', x0: e0 - 60, x1: bank.x + bank.width, top: G - 900, bottom: G + 400, baseY: G, dir: 1, period: 1, warn: 0, active: 1, offset: 0, force: 0, lights: [] },
  ];
  const width = bank.x + bank.width;
  // a landmark at the start of every trail section, dealt from a shuffled bag of World 5's pieces so no two near each other are the
  // same (QA 2026-10-29: the rolled sections looked alike, and a slow walker felt she was going round in circles). Its own stream: the
  // layout rolls as before
  const landmarks: MeecaLandmark[] = [];
  {
    const L = stream(seed * 31 + 11);
    let bag: Array<(typeof LANDMARKS)[number]> = [];
    let lastN = '';
    for (const tr of trails) {
      for (const sec of tr.sections) {
        if (!bag.length) bag = L.shuffle([...LANDMARKS]);
        let pick = bag.pop()!;
        if (pick[0] === lastN && bag.length) {
          bag.unshift(pick);
          pick = bag.pop()!;
        }
        lastN = pick[0];
        landmarks.push({ n: pick[0], x: sec.x0 + 46, y: G, w: Math.round(pick[1] * L.r(0.9, 1.1)), flip: L.chance(0.5) });
      }
    }
  }
  const st: MeecaStage = {
    seed, width, spawn: { x: spawn, y: G }, campEnd, camp, highX: trails[0].x0 + 20, wallX: ledge1.x, forkX, flickerX, flickerAt: { x: flickerX + 150, y: G - 130 },
    trunks, darkX0: e0 - 60, clearing, beats, trails, landmarks,
    flags: [campEnd + 60, mark.x - 200, r1 + 20, b0 - 20, c0 - 20, d0 - 20, t4.x + 120],
  };
  BUILT.set(st, { platforms: P, vines, trees, kit, zones });
  return st;
}

/** the stage as the engine builds it (stageGenerator.ts generateStage hands Meeca's stage here) */
export function meecaGeneratedStage(config: LevelConfig, seed: number): GeneratedStage & { proto: import('./protoStage.ts').ProtoExtras } {
  const st = buildMeecaStage(seed);
  const b = BUILT.get(st)!;
  return {
    config: { ...config, levelWidth: st.width, levelHeight: Math.max(config.levelHeight, MEECA_LEVEL_H), targetCount: MEECA_WARNINGS.length },
    trees: b.trees,
    platforms: b.platforms,
    vines: b.vines,
    enemies: [],
    boss: null,
    collectibles: [],
    spawnX: st.spawn.x,
    spawnY: st.spawn.y,
    // no shrine: the stage ends with the blanket scene (meecaPlay.ts)
    exitTotemX: 0,
    exitTotemY: 0,
    checkpoints: st.flags.map((x) => ({ x, y: st.spawn.y, reached: false })),
    zones: b.zones,
    kit: b.kit,
    proto: { hints: [], covers: [], beats: st.beats, meeca: st },
  };
}

/**
 * The stage for the level check: its end is the last tree (the clearing), as a shrine would be; and she has no leaf (meecaPlay.ts
 * filter), so the check walks her as at a stage before the glide is needed (4-6: the second jump and everything else as in World 5).
 */
export function meecaCheckStage(stage: GeneratedStage & { proto: { meeca?: MeecaStage } }): GeneratedStage {
  const t = stage.proto.meeca!.trunks[stage.proto.meeca!.trunks.length - 1];
  return { ...stage, config: { ...stage.config, worldIndex: 4, miniIndex: 6 }, exitTotemX: t.standX, exitTotemY: t.standY };
}

/**
 * How long the stage takes a player (stageTime.ts's models: MODEL_FAST is the quick player), in seconds: the walk from her bedroll to
 * the last tree at the model's pace (the camp on tiptoe), each climb, each room worked the quick way (a moment to read it, then each
 * step: the sapling bending, the cake carried, the beetles eating, the throw, the tea running and the lift rising, the moonflower
 * opening), each carving traced, and the scenes (the card, Flicker blinking on, the moonflower, Pell walking in, the story box read at
 * a quick reader's pace). A model, not a measurement: meecaReal.test.ts plays it in the real engine as well.
 */
export function meecaSeconds(stage: GeneratedStage & { proto: { meeca?: MeecaStage } }, P: ModelParams = MODEL_FAST): number {
  const st = stage.proto.meeca!;
  const v = walkSpeed(P);
  const last = st.trunks[st.trunks.length - 1];
  const camp = st.campEnd - st.spawn.x;
  let t = camp / TIPTOE + Math.max(0, last.standX - st.campEnd) / v;
  for (const vn of stage.vines) {
    if (vn.vineType !== 'tree_climb') continue;
    t += (vn.bottomY - vn.topY) / TIME.climbSpeed + (vn.kit ? 0.5 : TIME.climbOverhead * (MODEL_TYPICAL.alpha / P.alpha));
  }
  for (const room of stage.kit?.rooms ?? []) {
    t += 1;
    for (const pc of room.pieces) {
      if (pc.kind === 'item' && pc.source) t += 2.5;
      else if (pc.kind === 'beetle') t += pc.waitNear ? 0 : 1.5;
      else if (pc.kind === 'lift') t += pc.rise / 120;
      else if (pc.kind === 'sapling') t += 1.25;
      else if (pc.kind === 'teapot') t += 1.1 + 0.6;
      else if (pc.kind === 'ladder') t += 0.9;
      else if (pc.kind === 'moonflower') t += 1.6;
    }
  }
  // the carvings: a finger going round about one and a half times a second
  for (const tr of st.trunks) t += carveSeconds(tr.lines) / (Math.PI * 2 * 1.5 * CIRCLE_S) + 0.5;
  const read = (s: string) => Math.max(0.9, 0.5 + 0.22 * s.trim().split(/\s+/).length);
  t += 2.2 + 1.2 + 2.6 + (st.clearing.pellFrom - st.clearing.pellAt) / 110 + MEECA_ENDING.reduce((a, l) => a + read(l.text) + 0.2, 0) + 1.4;
  return t;
}
