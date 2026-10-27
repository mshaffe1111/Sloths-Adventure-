/**
 * meecaStage — Meeca's stage (5-M), the stage right after 5-5 that every player plays (Matt, 2026-10-26: "big in how it relates to the
 * game", not big in size). On the march north, at dusk: you play Meeca, marched through the Orchid Sanctuary in the General's column,
 * with Lieutenant Pell walking just ahead of her place. She cannot fight. She slips out of line while the guards' backs are turned,
 * cuts a warning into a trunk with her hairpin (hold a thumb on the trunk), and gets back into line before they look round.
 *
 *   0. OPENING  the "On the March North" card over the first tree: she finishes "POKEY. DON'T SIT. M." (the carving Pokey reads on the
 *               first tree of 5-1) while the column's lanterns go on ahead and wait. Then back to her place in line.
 *   1. LEARN    marching in line: Pell's ring fills while his back is turned, and he looks back down the line (the tell, never a
 *               catch while she is in her place). The column halts by the second tree: his back turned, she slips out and carves
 *               DON'T EAT. M. Only Pell looks back here, with long windows.
 *   2. DEVELOP  the soldier ahead of Pell starts looking back too (two rings, on their own rhythms), and a fern by the third tree to
 *               hide in: NO TEA. BE RUDE. M.
 *   3. TWIST    the fourth carving is up a tree, on a branch only the climb reaches (with a fern up there too): HANDS OFF THE SILK. M.
 *   4. FINISH   the last and longest, with shorter windows: DON'T STOP TO LOOK. LOVE, M. Then Pell catches her, gently, and the
 *               blanket ("It is not from the General."), and the stage clears.
 *
 * The column halts by each tree until its warning is cut, so nothing can be missed and nothing can soft-lock; the march between trees
 * sets the length (about 2:45 for a quick player, STAGE_SECONDS). Getting caught costs no heart and no life: a guard walks her back into
 * line and she tries again. Every catch comes from a look-back whose tell (the turn, at least TELL seconds, with the ring full over
 * him) plays in full view first (meecaPlay.ts). Nothing can hurt her: there are no pits, no animals, no hazards.
 *
 * Planned, details rolled: the beats are always there in that order; the seed rolls the spacing of the trees, which side a fern
 * grows, the soldiers' coats, the guards' rhythms by a little, and the ferns along the way.
 */
import { G, stream } from './protoStage.ts';
import type { GeneratedStage } from './stageGenerator.ts';
import type { LevelConfig, Platform, TreeStructure, Vine } from './types.ts';
import { MEECA_WARNINGS } from './meecaLines.ts';
import { isEasy } from './difficulty.ts';

export const MEECA_STAGE_SECONDS = 165;
/** the path (the column walks along it, and so does she) */
export const MEECA_G = G;
/** how fast the column marches (px/s): a slow walk; her run is 285 */
export const MARCH = 62;
/**
 * Upright, the stage shows this much of the world across (the game's usual 440 is too narrow for her at a tree and the two guards who
 * look back: their tell must be in full view while she carves), and so its level is this tall (the engine never shows more height
 * than a level has).
 */
export const MEECA_VIEW = { land: 540, port: 520 } as const;
export const MEECA_LEVEL_H = 1200;
/** Pell walks this far ahead of her place in line; the soldiers ahead of him, this far apart */
export const PELL_AHEAD = 90;
export const FILE_GAP = 100;
/** the column is drawn on a lane a little behind the path (it never meets the play) */
export const LANE_UP = 12;
/** the turn round to look back: the guards' tell, before any look can catch her (Pell's turn clip is 13 frames at 12 fps) */
export const TELL = 1.1;
/** turning back to the front again */
export const TURN_BACK = 0.85;
/** how far behind a guard a look-back sees */
export const SIGHT = 900;
/** how far behind her place in line she may go (the line does not leave her behind) */
export const BACK_MAX = 520;
/** how far ahead of her place she may step (not past Pell) */
export const AHEAD_MAX = 40;
/** a letter of a warning takes this long to cut (s), a full stop or a comma this long */
export const LETTER_S = 0.28;
export const MARK_S = 0.12;

export type SoldierCoat = 'a' | 'b';
/** one of the column: Pell, or a soldier (`coat`), `ahead` px in front of her place in line */
export interface Marcher {
  kind: 'pell' | 'soldier';
  coat: SoldierCoat;
  ahead: number;
}

/** a guard's look-back rhythm: `away` s with his back to her (his ring fills), the TELL turn, `look` s looking back, TURN_BACK, again */
export interface WatchRhythm {
  /** which marcher (index into MeecaStage.marchers) */
  who: number;
  away: number;
  look: number;
  /** how far into its first `away` it starts (s): two guards never turn together */
  offset: number;
}

/** a tree she carves a warning into */
export interface MeecaTrunk {
  /** its warning (meecaLines.ts MEECA_WARNINGS) */
  id: string;
  index: number;
  lines: readonly string[];
  /** the trunk's middle, and its foot */
  x: number;
  ground: number;
  /** the painted trunk: how wide, how tall */
  w: number;
  h: number;
  /** the words: their middle, the top line's height, the letters' height */
  textX: number;
  textY: number;
  size: number;
  /** where she stands to carve it (her feet), and how near counts */
  standX: number;
  standY: number;
  /** the column halts when her place in line is this far past the tree, until it is cut */
  haltPast: number;
  /** cut already when the stage starts (the opening carving: all but its "M.") */
  preCut: number;
  /** a climbing tree whose branch it stands on (its vine and branch ids) */
  climb?: { vine: number; branch: number; treeX: number };
}

/** a fern to hide in (crouched in it, a look-back does not see her) */
export interface MeecaFern {
  x: number;
  /** its foot */
  y: number;
  w: number;
}

/** the guards' rhythms in each stretch: stretch i is the one leading up to trunk i (stretch 0 is the opening: nobody looks) */
export interface MeecaStretch {
  trunk: number;
  watch: WatchRhythm[];
}

export interface MeecaStage {
  seed: number;
  width: number;
  spawn: { x: number; y: number };
  /** where her place in line starts, and where the column first halts (the opening) */
  slot0: number;
  marchers: Marcher[];
  trunks: MeecaTrunk[];
  ferns: MeecaFern[];
  stretches: MeecaStretch[];
  /** the beats, for the tests and the blueprint: [x0, x1, name] */
  beats: Array<[number, number, string]>;
}

/** how long a warning's cut takes, from `from` characters already cut (s) */
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

/** the marcher index of Pell */
export const pellIndex = (st: MeecaStage) => st.marchers.findIndex((m) => m.kind === 'pell');

/** the stage's guards' rhythms (Easy: longer windows, as Easy warns longer elsewhere) */
function rhythm(who: number, away: number, look: number, offset: number): WatchRhythm {
  const k = isEasy() ? 1.25 : 1;
  return { who, away: away * k, look, offset: offset * k };
}

export function buildMeecaStage(seed = 1): MeecaStage {
  const R = stream(seed * 13 + 5);
  const marchers: Marcher[] = [];
  marchers.push({ kind: 'pell', coat: 'a', ahead: PELL_AHEAD });
  const firstCoat: SoldierCoat = R.chance(0.5) ? 'a' : 'b';
  for (let i = 1; i <= 4; i++) marchers.push({ kind: 'soldier', coat: (i % 2 === 1) === (firstCoat === 'a') ? 'a' : 'b', ahead: PELL_AHEAD + i * FILE_GAP });
  const pell = 0;
  const soldier = 1;

  const trunks: MeecaTrunk[] = [];
  const ferns: MeecaFern[] = [];
  const beats: Array<[number, number, string]> = [];
  const tall = (index: number, x: number, size: number, haltPast: number, preCut = 0): MeecaTrunk => {
    const w = MEECA_WARNINGS[index];
    const t: MeecaTrunk = {
      id: w.id, index, lines: w.lines, x, ground: G, w: index === 0 ? 128 : 116, h: index === 0 ? 470 : 450,
      textX: x, textY: G - (index === 0 ? 196 : 182), size, standX: x - 74, standY: G, haltPast, preCut,
    };
    trunks.push(t);
    return t;
  };
  // 0. the opening: the 5-1 carving, all but its "M." (the same tree, the same words, the same size as 5-1's: w5Stages.ts)
  const t0 = tall(0, 760, 32, 380, carveChars(MEECA_WARNINGS[0].lines) - 2);
  beats.push([0, t0.x + 400, 'Opening: POKEY. DON\'T SIT. M.']);
  // 1. the second tree, Pell alone, long windows
  const t1 = tall(1, Math.round(2350 + R.r(-90, 90)), 30, 80);
  beats.push([t0.x + 400, t1.x + 200, 'Learn: the ring, then DON\'T EAT. M.']);
  // 2. two rings, and a fern beside the third tree
  const t2 = tall(2, Math.round(t1.x + 1500 + R.r(-90, 90)), 28, 80);
  ferns.push({ x: t2.standX - (R.chance(0.5) ? 78 : 86), y: G, w: 112 });
  beats.push([t1.x + 200, t2.x + 200, 'Develop: two rings, a fern, NO TEA. BE RUDE. M.']);
  // 3. up a tree: the branch only the climb reaches, its own fern, and the carving trunk standing on the branch
  const treeX = Math.round(t2.x + 1500 + R.r(-90, 90));
  const perchY = G - 232;
  const platforms: Platform[] = [];
  const vines: Vine[] = [];
  const trees: TreeStructure[] = [];
  let pid = 2;
  let vid = 1;
  const branch: Platform = { id: pid++, x: treeX - 40, y: perchY, width: 300, height: 24, type: 'solid', style: 'branch' };
  platforms.push(branch);
  const tree: TreeStructure = { id: 1, x: treeX, groundY: G, topY: perchY - 150, trunkWidth: 76, hasClimbVine: true, canopyRadius: 150 };
  trees.push(tree);
  const vine: Vine = { id: vid++, x: treeX, topY: perchY - 2, bottomY: G - 6, swaySpeed: 0.9, swayPhase: (treeX * 0.007) % 6.28, vineType: 'tree_climb', treeId: tree.id };
  vines.push(vine);
  const x3 = treeX + 196;
  const w3 = MEECA_WARNINGS[3];
  const t3: MeecaTrunk = {
    id: w3.id, index: 3, lines: w3.lines, x: x3, ground: perchY, w: 104, h: 300, textX: x3, textY: perchY - 176, size: 26,
    standX: x3 - 66, standY: perchY, haltPast: 40, preCut: 0, climb: { vine: vine.id, branch: branch.id, treeX },
  };
  trunks.push(t3);
  ferns.push({ x: treeX + 58, y: perchY, w: 92 });
  beats.push([t2.x + 200, x3 + 200, 'Twist: up the tree, HANDS OFF THE SILK. M.']);
  // 4. the last tree: the longest warning, the shortest windows, a fern on the side away from her place
  const t4 = tall(4, Math.round(x3 + 1500 + R.r(-90, 90)), 27, 80);
  ferns.push({ x: t4.standX - 80, y: G, w: 112 });
  beats.push([x3 + 200, t4.x + 400, 'Finish: DON\'T STOP TO LOOK. LOVE, M., then Pell and the blanket']);
  // ferns along the way, for the look of the place (they hide her too)
  for (const [a, b] of [[t0.x + 500, t1.x - 300], [t1.x + 300, t2.x - 400], [t2.x + 300, treeX - 300], [x3 + 300, t4.x - 400]]) {
    const n = R.i(1, 2);
    for (let i = 0; i < n; i++) ferns.push({ x: Math.round(a + ((b - a) * (i + 0.5)) / n + R.r(-60, 60)), y: G, w: Math.round(R.r(90, 118)) });
  }
  ferns.sort((a, b) => a.x - b.x);

  // the guards' rhythms in each stretch (shorter windows as it goes on; the soldier's never in step with Pell's)
  const j = () => R.r(-0.3, 0.3);
  const stretches: MeecaStretch[] = [
    { trunk: 0, watch: [] },
    { trunk: 1, watch: [rhythm(pell, 7.5 + j(), 1.8, 0)] },
    { trunk: 2, watch: [rhythm(pell, 7.0 + j(), 1.8, 0), rhythm(soldier, 8.0 + j(), 1.6, 4.2)] },
    { trunk: 3, watch: [rhythm(pell, 6.6 + j(), 1.8, 0), rhythm(soldier, 7.6 + j(), 1.7, 3.6)] },
    { trunk: 4, watch: [rhythm(pell, 6.2 + j(), 2.0, 0), rhythm(soldier, 7.2 + j(), 1.8, 3.2)] },
  ];

  const width = t4.x + 1300;
  // the path, the whole way (no gaps and no pits: there is nothing to fall into)
  platforms.unshift({ id: 1, x: 0, y: G, width, height: 90, type: 'solid', style: 'moss_stone' });
  const st: MeecaStage = {
    seed, width, spawn: { x: t0.standX, y: G }, slot0: t0.x + 150, marchers, trunks, ferns, stretches, beats,
  };
  BUILT.set(st, { platforms, vines, trees });
  return st;
}

/** the pieces of ground the builder made, kept with the stage it made them for */
const BUILT = new WeakMap<MeecaStage, { platforms: Platform[]; vines: Vine[]; trees: TreeStructure[] }>();

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
    // no shrine: the stage ends with the blanket scene (meecaPlay.ts), so there is nothing past it either
    exitTotemX: 0,
    exitTotemY: 0,
    checkpoints: [],
    proto: { hints: [], covers: [], beats: st.beats, meeca: st },
  };
}
