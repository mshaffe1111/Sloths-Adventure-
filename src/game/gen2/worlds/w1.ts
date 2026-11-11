/**
 * gen2/worlds/w1 — World 1's kit on gen2, as a chunk pool (CHUNK-POOL-BRIEF.md step 2, the engine-core porter, 11-05).
 *
 * HARVEST, not content: every section here is cut from a live stage on main (old 1-1, protoStage.ts buildPlan '1-1' and w1Sections.ts
 * '1-1'; old 1-3's non-combat stretches, w1Sections.ts '1-3' less its snakes), keeping the old builders' own numbers (cited per
 * section). The designer rates, phases and tags them, and adds new sections from the rulebook kit so 1-1 is not old 1-1 reshuffled.
 * `rating` and `phases` here are the porter's first reading of the old stage, for the designer to rule.
 *
 * World 1 art only (LABELS rule 4): banks of earth (moss_stone), mossy stones and stumps (block), boughs (branch), the mushroom (bouncy).
 *
 * The floor is gen2's own ground (the planner's correction, 11-05 4:19 PM): old 1-1's ground at G is ordinary 'bank' pieces, and sections
 * enter and exit on 'ground' ports on the manifest's ground line; stones, stumps, logs and boughs are ordinary pieces over it. The
 * pipeline does not read this file until the planner's step 1 wires World 1 in.
 */
import { DOT_LINES } from '../../dotLinesData.ts';
import type { Move, NodeJob, Phase, PortKind, SectionPiece, SectionTemplate, Socket, WorldKit, WorldManifest } from '../types.ts';
import { DOUBLE_RISE, reachJump } from '../../physics.ts';
import { hollowLogSize, w1DressFacing, w1DressWidth } from '../../w1NewArt.ts';
import { pickCut, W1_CUT } from '../../w1CutArt.ts';
import type { Platform } from '../../types.ts';
import { SPRINT_GRAPHS } from '../graphs.ts';

/**
 * World 1's manifest rows for its floor (the planner's correction, 11-05 4:19 PM: gen2's own ground IS the floor). `ground` is the
 * continuous moss floor line sections join on with 'ground' ports (pipeline.ts:868); `pit: 'soft'` with `pitDepth` lays a floor under each
 * pit with stair steps out (pitUnder, pitSteps, pipeline.ts:735-761, :1090-1121); `floorRoll` is the per-roll floor depth the planner adds
 * to types.ts (step 1), with old 1-1's families (his numbers, 11-05 4:19 PM).
 */
export const W1_KIT = {
  ground: { y: 580, bankH: 120, style: 'moss_stone' as const },
  /** the planner's 4:43 PM (the lead's audit, finding 4): World 1 stays off gen2's roll-wide theme lock */
  themeShare: [1, 1] as [number, number],
  /** (audit finding 7) 1-1 rises from the floor into the boughs: the corridor spans about 900 px from the floor line up */
  corridor: { top: 580 - 900, bottom: 580 + 80, soft: 80 },
  /** the seed perch is laid on every 1-1 roll (the planner's `required`, pipeline.ts: never swapped out nor trimmed) */
  required: { '1-1': [{ section: 'w1-seed-perch' }] },
  /**
   * The rolled stage graph's data (NODES.md §4, §8.4; the planner's CHECK 3b; the shape is the porter's, for the planner's types):
   * `list` the sprint graphs as code strings (the planner's parser reads them); `briefs` each stage's brief knobs (the designer's 1-1
   * brief, f560b7916); `terrains` World 1's terrain families (§3); `chunkSeconds` the kit's mean section seconds on the FAST clock
   * (width / the fast walk, 228 px/s, every 1-1 section's every version, seeds 1-3, measured through layLocal: 11.2 s; 12.9 s for the
   * content sections alone); `maxPerStage` a section at most once a stage
   */
  graphs: {
    /** the sprint graphs A-D (gen2/graphs.ts SPRINT_GRAPHS, the planner's; NODES §8.4's code strings: A `A T P F R X R S E`, B `A T M F R C U X R S R L E`, C `A P F X R W R D_ S E`, D `A T P R U F X R S E`) */
    list: [...SPRINT_GRAPHS],
    briefs: { '1-1': { ends: 'quiet' as const, trend: 'up' as const, endHigh: true, softFalls: true, branching: 'some' as const, teaches: ['jump', 'double', 'bounce'], deal: { ground: 40, floating: 25, climb: 20, bounce: 15 } } },
    /** floating pieces only in the last third (NODES V12; the designer's bough window) */
    windows: { floating: [0.67, 1] as const },
    /** a bounce node only once the bounce is taught (V3): the move's name as the sections' `teaches` */
    typeNeeds: { bounce: 'bounce' },
    terrains: ['floor-stones', 'raised-logs', 'mounds', 'boughs'],
    chunkSeconds: 11.2,
    maxPerStage: 1,
  },
  /**
   * The per-roll tempo (manifest rollRanges, the planner's type): 1-1 is calm and rolling (its profile), so the designer's measured old 1-1
   * ranges (ENGINE-SPEC 53c0b9960, rs-main-11.json): every roll's median gap share across the whole 0.79-0.91 spread, centred 0.82 (old
   * 1-1's median of roll medians), p90 at most 0.99; rises in the home band 0.65-0.69 (25 of 32 rolls), the hilly break 0.81-0.94 on 7 of
   * 32. `centre` is what a section's own shares are scaled against (the lead's numbers, gap 0.65, rise 0.67): the roll's median is never
   * under it, so a block's share (0.85+, NODES §8.7) is never scaled down
   */
  rollRanges: { gap: { min: 0.79, mode: 0.82, max: 0.91, p90: 0.99, centre: 0.65 }, rise: { home: [0.65, 0.69] as [number, number], hilly: [0.81, 0.94] as [number, number], hillyShare: 7 / 32, centre: 0.67 } },
  pit: 'soft' as const,
  pitDepth: 110,
  /** the planner's 4:27 PM: catch boughs laid 90 px under a canopy gap by the engine (floorRoll.catchDrop, engine-chunks types) */
  floorRoll: { catchDrop: 90, hop: [{ range: [0.43, 0.51] as [number, number], weight: 11 }, { range: [0.74, 0.8] as [number, number], weight: 11 }, { range: [0.99, 1.0] as [number, number], weight: 10 }], shallow: 70, deep: 240, hopRoll: 0.9, jumpRoll: 0.55 },
};

/** a stage feel a section serves, and the World 1 stages it must never be used for (CHUNK-POOL-BRIEF step 2) */
export type W1Feel = '1-1' | '1-2' | '1-3' | '1-4' | '1-5' | '1-6' | '1-7' | '1-8' | '1-9';
/** what a section must never be used for, the brief's list: each is another World 1 stage's own */
export type W1Not = 'meeca-note' | 'hibiscus-trail' | 'punch' | 'combat' | 'kapok-climb' | 'view-north' | 'folded-petals' | 'chase' | 'lianas' | 'bush';
/** the brief's not-list for every section that is not that stage's (a section serving 1-3 drops 'punch'/'combat' from its own) */
export const NOT_ELSEWHERE: readonly W1Not[] = ['meeca-note', 'hibiscus-trail', 'punch', 'combat', 'kapok-climb', 'view-north', 'folded-petals', 'chase', 'lianas', 'bush'];

/** a node job (NODES.md §1): gen2's own NodeJob (the planner's type, engine-chunks 83224cdc) */
export type W1Job = NodeJob;

type W1Piece = SectionPiece;
export type W1Section = SectionTemplate & {
  /** the stage feels it serves */
  feel: W1Feel[];
  /** what it must never be used for */
  not: readonly W1Not[];
  /** 1-10, the porter's first reading (the designer rules) */
  rating: number;
  /** where it was cut from, with the old builder's numbers */
  source: string;
  /** the node jobs it can fill (NODES.md §1, ruled §8.8) */
  jobs?: W1Job[];
  /** each version's rhythm string (Round 4, R2 lesson 1: kinds, not pixels): h hop, j gap jump, d double, b bounce, c climb step, w walk */
  rhythms?: Record<string, string>;
  /** a two-answer twist's two moves (NODES §8.7 B5: the gate runs it with both away, which must fail, and each alone, which must pass);
   *  for the planner to carry into gen2.nodes[].moves */
  answers?: Array<'double' | 'bounce'>;
  /** a version's own jobs where they differ from the section's (§8.8: #7's double version a test, its mushroom version a twist, B5) */
  versionJobs?: Record<string, W1Job[]>;
  /** its terrain family (NODES.md §3 `terrain`, W1: floor and stones, raised logs, mounds, boughs): the porter's reading, for the designer */
  terrain?: W1Terrain;
  /** its content type (NODES.md §7.7, the designer's tags, engine-spec d4526ee5e): the deal rolls the type first, then the chunk; a fork is a
   *  shape, so a fork section takes its low road's type; structural sections (start, rest, goal) never count toward the deal */
  content?: W1Content;
};
export type W1Content = 'ground' | 'floating' | 'climb' | 'bounce' | 'rope' | 'structural';
export type W1Terrain = 'floor-stones' | 'raised-logs' | 'mounds' | 'boughs';

// ───────────────────────────── helpers (World 1's pieces, with the old builders' numbers) ─────────────────────────────

type Opt = Partial<Socket>;
const petals = (id: string, on: string, t: Socket['t'], count = 2, span = 140, o: Opt = {}): Socket => ({ id, role: 'pickup', on, t, dn: 34, count, span, ...o });
const flag = (on: string, t: Socket['t']): Socket => ({ id: 'flag', role: 'flag', on, t });
const tip = (on: string, t: Socket['t'] = 0.2): Socket => ({ id: 'tip', role: 'tip', on, t });
/** Dot's line at a place (the designer's 1-1 brief, f560b7916: which shipped line where); `line` names it in dotLinesData.ts terms */
const dot = (id: string, on: string, t: Socket['t'], line: string): Socket => ({ id, role: 'tip', on, t, allow: [line] });
/** a find on a fork's high road (NODES §8.8, V7: a fork is a fork only when its high road holds a find) */
const find = (id: string, on: string): Socket => ({ id, role: 'find', on, t: 0.5, dn: 34 });
const decor = (id: string, on: string, t: Socket['t']): Socket => ({ id, role: 'decor', on, t, chance: 0.6 });
/** the brief's squirrels ("the squirrels came to watch him leave", 1-1.md must; Round 7 (c)): an arrival's `sq` socket, one of the three, always */
const SQUIRRELS = ['squirrel-sit', 'squirrel-wave', 'squirrel-tip'];
const squirrels = (id: string, on: string, t: Socket['t']): Socket => ({ id, role: 'decor', on, t, allow: SQUIRRELS });
/** a stretch of the moss floor: a bank on the ground line (old 1-1's ground at G) */
const floor = (key: string, w: SectionPiece['w'], place: SectionPiece['place'] = { kind: 'start' }): W1Piece => ({ key, shape: 'bank', w, place, style: 'moss_stone', main: true, landing: true });
/** the floor after a soft gap a plain jump crosses (`share` of the widest gap the difficulty allows) */
// (a double gap's landing is a double BLOCK (NODES §8.7 B1): the engine swaps a teach or test whose block a single jump reaches, blockBreaches)
// ── the flown bands (C1, R-165.72: reference/specs/bands.md §5 at t-designer-reach@e97542b4; every figure laid 1 px inside its band,
//    since a laid rise or gap rounds to the band's edge) ──
/** a double gap is a Normal TEST only, 252-262 px lip to lip: one jump crosses 246 at best (bands.md §2-3). The old TEACH band 195-205 and
 *  TEST 205-228 are gone: one jump crosses both. Easy has no double gap: every version that lays one names its Easy twin */
const DOUBLE_TEST: [number, number] = [253, 256]; // (the band's easy end: a double flick lands 72% at 250, 67% at 256, 61% at 262; the bots' put-backs, C1)
/** the D block rise onto a bank (a face 50 px or taller): Normal 136-140; Easy's 128-132 is the pipeline's riseCap (reach.ts) */
const D_RISE: [number, number] = [-140, -137];
/** a thin double rise (a log or bough top, no lip hoist), from the ground only (a stair must fit in front of it): Normal 128-134;
 *  Easy's 122-128 is riseCap's thin cap */
const THIN_RISE: [number, number] = [-134, -129];
/** a bounce lip over the mushroom's floor: the teach's 232-246 and the U/V test's 236-250 meet at 236-246 */
const BOUNCE_LIP: [number, number] = [-245, -237];
/** a single rise inside the single band (Normal up to 80; Easy's riseCap lays it under its 63) */
const HOP_UP: [number, number] = [-78, -70];
/** the `at` that stands a mushroom (70 wide) with its edge 25-45 px from the far end of a floor `w` wide: the bounce teach's 20-60 from
 *  the face (bands.md §4); Easy's widened landings add 5-20 px, so the top of the band is kept for them */
const faceAt = (w: [number, number]): [number, number] => [Math.round((1 - 45 / (w[1] - 70)) * 1000) / 1000, Math.round((1 - 25 / (w[0] - 70)) * 1000) / 1000];
const softGap = (key: string, after: string, w: SectionPiece['w'], share: [number, number], jump: 'jump' | 'double' = 'jump', gapPx?: [number, number]): W1Piece => ({ key, shape: 'bank', w, place: { kind: 'pit', after, jump, share, soft: true, ...(jump === 'double' ? { gapPx: gapPx ?? DOUBLE_TEST } : {}) }, style: 'moss_stone', main: true, landing: true, ...(jump === 'double' ? { block: 'double' as const } : {}) });
/** the PRACTICE double gap (C1): the test's 252-262 px, over a soft pit with a floor and a step out to the far bank, so a miss is a short
 *  fall and a climb on, never a set-back; it comes before every test gap (w1.test 'teach first') */
const practiceGap = (key: string, after: string, w: SectionPiece['w']): W1Piece => ({ key, shape: 'bank', w, place: { kind: 'pit', after, jump: 'double', gapPx: DOUBLE_TEST, soft: true }, style: 'moss_stone', main: true, landing: true });
/** a double rise with flat ground before its face (C1, the help's room: a stair of faces 60 px or less, treads 80, the top 160, stands
 *  on the floor `f` right up to the face, no pit in it): the floor, then the bank or log with no gap (gapPx 0) */
const riseFace = (k: string, after: string | null, thin: boolean, w: [number, number], lead = true): Group => {
  // (`lead` false: `after` is already a flat floor 260 px or longer (a teach's rest), so the face stands at its end)
  const f = lead ? floor(`${k}f`, [260, 300], startOr(after)) : { key: after! } as W1Piece;
  const b: W1Piece = thin ? { key: `${k}E`, shape: 'branch', w, place: { kind: 'double', after: f.key, dy: THIN_RISE, gapPx: [0, 0] }, style: 'log', main: true, landing: true, block: 'double' } : { key: `${k}D`, shape: 'bank', w, place: { kind: 'double', after: f.key, dy: D_RISE, gapPx: [0, 0] }, style: 'moss_stone', main: true, landing: true, block: 'double' };
  return { pieces: lead ? [f, b] : [b], sockets: [petals(`${k}p`, b.key, [0.4, 0.7], thin ? 1 : 2)], last: b.key };
};
/** a mossy stump or rock standing on `on` (one easy hop: lowStumps 36-76, logHop 34-46) */
const stump = (key: string, on: string, at: SectionPiece['w'], h: SectionPiece['w'], w: SectionPiece['w'] = [130, 170]): W1Piece => ({ key, shape: 'block', w, place: { kind: 'on', on, at, h }, style: 'moss_stone', landing: true });
/** a stepping stone: a jump from `after`, `dy` up (negative) or down; it stands on the floor (pillars: 110-160 wide) */
const stone = (key: string, after: string, dy: SectionPiece['w'], share: [number, number] = [0.55, 0.68]): W1Piece => ({ key, shape: 'block', w: [110, 160], place: { kind: 'jump', after, dy, share, soft: true }, style: 'moss_stone', landing: true, main: true });
/** a bough over `on`, off the main route unless `main` */
const bough = (key: string, on: string, at: SectionPiece['w'], dy: SectionPiece['w'], w: SectionPiece['w'], main = false): W1Piece => ({ key, shape: 'branch', w, place: { kind: 'over', on, at, dy }, style: 'branch', main, landing: true });
/** the mushroom (70 wide, 30 tall: bounceWall, highLeaps) standing on `on` */
const mushroom = (key: string, on: string, at: SectionPiece['w']): W1Piece => ({ key, shape: 'bouncy', w: [70, 70], place: { kind: 'on', on, at, h: [30, 30] } });
/** a bounce lip (the planner's bounce place, engine-chunks 3919248e): its rise clamped to the bounce's reach from mushroom `m`'s cap, not a walk's */
const lip = (p: W1Piece, m: string): W1Piece => ({ ...p, block: 'bounce', from: m });

const ONE = reachJump(0, false);
const TWO = reachJump(0, true);
/** sections that serve 1-1 never take 1-1's own rules away from the others: every other stage's own items are on their not-list */
const NOT_11 = NOT_ELSEWHERE;
/** old 1-3's harvested stretches are its non-combat ones: they serve 1-3's walking, never its punch or combat, so they keep the whole list */
const NOT_13 = NOT_ELSEWHERE;

// ───────────────────────────── the old builders' piece groups, chained ─────────────────────────────
// Each group is one of old 1-1's (or 1-3's) builder calls, laid after the piece `after` names, its keys prefixed so a section can
// chain several (old 1-1's sections were such chains: w1Sections.ts '1-1' on main). It returns its pieces, sockets and its last floor.
type Group = { pieces: W1Piece[]; sockets: Socket[]; last: string };
type G = (k: string, after: string | null) => Group;
const startOr = (after: string | null): SectionPiece['place'] => (after ? { kind: 'walk', after, dy: [0, 0] } : { kind: 'start' });

/** rest(w): a stretch of moss floor (rest 400-440; a flag on it when `withFlag`) */
const gRest = (w: SectionPiece['w'], withFlag = false): G => (k, after) => ({
  pieces: [floor(`${k}f`, w, startOr(after))],
  sockets: [petals(`${k}p`, `${k}f`, [0.3, 0.6], 2), decor(`${k}d`, `${k}f`, [0.1, 0.2]), ...(withFlag ? [flag(`${k}f`, [0.45, 0.55])] : [])],
  last: `${k}f`,
});
/** lowStumps (protoStage.ts:1149 on main): 3-4 stumps 130-170 wide, h 40-50 then +40/+50/-30 within 36-76, gaps 70-105 */
const gLowStumps = (n: 3 | 4): G => (k, after) => {
  // (FR9, Round 7 (d): every hop stump a wall, 50 px or more (engine.ts walls only at 50 px; a 36-42 px stump was walked through))
  const hs = n === 3 ? [[50, 56], [76, 80], [54, 60]] : [[50, 56], [76, 80], [54, 60], [50, 56]];
  const f = floor(`${k}f`, [n === 3 ? 760 : 900, n === 3 ? 840 : 980], startOr(after));
  const ps = hs.map((h, j) => stump(`${k}s${j}`, f.key, [(j + 0.5) / n - 0.06, (j + 0.5) / n - 0.02], h as [number, number]));
  return { pieces: [f, ...ps], sockets: ps.map((p) => petals(`p-${p.key}`, p.key, 0.5, 1)), last: f.key };
};
/** dip(): a soft gap of one jump x 0.34-0.46 (protoStage.ts:1117 on main), a petal over it */
const gDip = (): G => (k, after) => ({ pieces: [softGap(`${k}f`, after!, [300, 380], [0.4, 0.52])], sockets: [petals(`${k}p`, `${k}f`, [0.2, 0.3], 1)], last: `${k}f` });
/** logHop(): a mossy rock across the path, 34-46 high, 120-170 wide, a petal on top (protoStage.ts:1093 on main) */
const gLogHop = (): G => (k, after) => {
  const f = floor(`${k}f`, [420, 500], startOr(after));
  const r = stump(`${k}r`, f.key, [0.4, 0.5], [34, 46], [120, 170]);
  return { pieces: [f, r], sockets: [petals(`${k}p`, r.key, 0.5, 1)], last: f.key };
};
/** busy(n, kinds): n hops or dips about a second apart, then plain floor 255-295 (protoStage.ts on main) */
const gBusy = (kinds: Array<'log' | 'dip'>): G => (k, after) => {
  const out: Group = { pieces: [], sockets: [], last: after! };
  kinds.forEach((kind, j) => { const g = (kind === 'log' ? gLogHop() : gDip())(`${k}${j}`, out.last); out.pieces.push(...g.pieces); out.sockets.push(...g.sockets); out.last = g.last; });
  const tail = floor(`${k}t`, [255, 295], startOr(out.last));
  out.pieces.push(tail); out.last = tail.key;
  return out;
};
/** pillars(heights, share): stepping stones in a soft pit at these heights over the floor, then the floor beyond (protoStage.ts:1013) */
const gStones = (heights: number[], share: [number, number] = [0.55, 0.68], dbl = false): G => (k, after) => {
  const pieces: W1Piece[] = [];
  let prev = after!, prevH = 0;
  heights.forEach((h, j) => {
    const key = `${k}s${j}`;
    // (a stone, 50 px thick (World 1's painted rock: mixer w1mix plat 'stone'), so the soft pit's banks reach it down to the pit floor (pipeline.ts pitUnder deepen: 40 px or more): a pillar
    // standing in the pit, as main's 1-1 pillars stood, never a 24 px slab over it (the lead, 11-05: no floating stones))
    // (the designer, 11-06: seated on the ground, a bank down to it (rocks never float): a 50 px block over a shallow hole was left in the air
    //  when the pit's deepen skipped it, V18's "rock in the air")
    pieces.push({ key, shape: 'bank', w: [110, 160], place: { kind: dbl ? 'double' : 'jump', after: prev, dy: [prevH - h, prevH - h], share, soft: true }, style: 'moss_stone', landing: true, main: true });
    prev = key; prevH = h;
  });
  const f: W1Piece = { ...floor(`${k}f`, [300, 380]), place: { kind: 'jump', after: prev, dy: [prevH, prevH], share: [0.5, 0.6], soft: true } };
  return { pieces: [...pieces, f], sockets: pieces.map((p) => petals(`p-${p.key}`, p.key, 0.5, 1)), last: f.key };
};
/** mushroomCache (protoStage.ts:1143 on main): a mushroom on the floor, a bough DOUBLE_RISE + 70 up, 4 petals on it */
const gCache = (): G => (k, after) => {
  const f = floor(`${k}f`, [640, 760], startOr(after));
  // (C1: the mushroom's edge 23-52 px short of the bough's near end, bands.md §4's 20-60: the bounce gives the rise, a lip's place)
  const b = bough(`${k}b`, f.key, [0.22, 0.22], [-(Math.round(DOUBLE_RISE) + 70), -(Math.round(DOUBLE_RISE) + 70)], [270, 270]);
  return { pieces: [f, mushroom(`${k}m`, f.key, [0.065, 0.085]), b], sockets: [petals(`${k}p`, b.key, [0.2, 0.8], 4, 190)], last: f.key };
};
/** the soft gaps a plain jump crosses, each wider (old 1-1 Learn: one x 0.35 / 0.45 / 0.55; gen2's share is of the gap allowed) */
const gSoftGaps = (): G => (k, after) => {
  const b = softGap(`${k}b`, after!, [220, 300], [0.4, 0.45]), c = softGap(`${k}c`, b.key, [220, 300], [0.52, 0.58]), d = softGap(`${k}d`, c.key, [260, 320], [0.64, 0.7]);
  return { pieces: [b, c, d], sockets: [petals(`${k}pb`, b.key, 0.5, 1), petals(`${k}pc`, c.key, 0.5, 1), petals(`${k}pd`, d.key, [0.3, 0.5], 2)], last: d.key };
};
/** practiceShelf (protoStage.ts:1235 on main): a 160 px shelf 150 up, 220 along, over flat floor; a rock just past it */
const gShelf = (): G => (k, after) => {
  const f = floor(`${k}f`, [720, 820], startOr(after));
  const sh = bough(`${k}sh`, f.key, [0.28, 0.3], [-150, -150], [160, 160]);
  const r = stump(`${k}r`, f.key, [0.82, 0.88], [34, 46], [120, 170]);
  return { pieces: [f, sh, r], sockets: [tip(f.key, 0.1), petals(`${k}psh`, sh.key, [0.25, 0.75], 2, 80), petals(`${k}pr`, r.key, 0.5, 1)], last: f.key };
};
/** gapRun(widths) of the second jump (twist 'gaps': reachTwo x 0.62 / 0.72 / 0.82, a run of 220-300 after each) */
const gDoubleGaps = (shares: Array<[number, number]>, px: [number, number] = DOUBLE_TEST): G => (k, after) => {
  const pieces: W1Piece[] = []; const sockets: Socket[] = [];
  let prev = after!;
  shares.forEach((sh, j) => { const p = softGap(`${k}g${j}`, prev, [220, 300], sh, 'double', px); pieces.push(p); sockets.push({ id: `${k}arc${j}`, role: 'arc', on: p.key, t: 0 }); prev = p.key; });
  return { pieces, sockets, last: prev };
};
/** the practice double gap as a group (C1): see practiceGap */
const gPractice = (): G => (k, after) => { const p = practiceGap(`${k}t`, after!, [220, 260]); return { pieces: [p], sockets: [{ id: `${k}arc`, role: 'arc', on: p.key, t: 0 }], last: p.key }; };
/** a level gap a single crosses, onto a bank (Easy's twin of a double gap, C1: inside Easy's single band, 0.5-0.6 of it) */
const gLevelHop = (): G => (k, after) => { const b: W1Piece = { key: `${k}a`, shape: 'bank', w: [220, 260], place: { kind: 'jump', after: after!, dy: [-6, 6], share: [0.5, 0.6], soft: true }, style: 'moss_stone', main: true, landing: true }; return { pieces: [b], sockets: [petals(`${k}p`, b.key, [0.4, 0.6], 1)], last: b.key }; };
/** highLeaps(n, dbl) (protoStage.ts:1300 on main): a mushroom, boughs 170-230 at G - 236..246, the floor on under them */
const gHighLeaps = (n: number, dbl: boolean): G => (k, after) => {
  const f = floor(`${k}f`, [400 + n * 330, 460 + n * 360], startOr(after));
  const pieces: W1Piece[] = [f, mushroom(`${k}m`, f.key, [0.04, 0.06])];
  const sockets: Socket[] = [];
  let prev = '';
  for (let j = 0; j < n; j++) {
    const key = `${k}b${j}`;
    pieces.push(j === 0 ? bough(key, f.key, [0.1, 0.12], [-241, -241], [170, 230], true) : { key, shape: 'branch', w: [170, 230], place: { kind: dbl ? 'double' : 'jump', after: prev, dy: [0, 0], share: dbl ? [0.6, 0.7] : [0.4, 0.55] }, style: 'branch', main: true, landing: true });
    sockets.push(petals(`p-${key}`, key, [0.3, 0.7], 2));
    prev = key;
  }
  // (Round 4 FR4: the floor road's own beat, low stumps under the boughs, 177 px+ head room, with petals)
  [0.22, 0.42, 0.62, 0.82].forEach((at, j) => { const q = stump(`${k}lo${j}`, f.key, [at, at + 0.02], [34, 40], [154, 220]); pieces.push(q); sockets.push(petals(`p-${q.key}`, q.key, 0.5, 1)); });
  return { pieces, sockets, last: f.key };
};
/** bounceWall (protoStage.ts:1248 on main): a mushroom, a cliff 225-240 tall and 330-400 long with a rock on it, a dip where he lands */
const gBounceWall = (): G => (k, after) => {
  const a = floor(`${k}a`, [300, 360], startOr(after));
  const w: W1Piece = { key: `${k}w`, shape: 'bank', w: [330, 400], place: { kind: 'walk', after: a.key, dy: [-240, -225] }, style: 'moss_stone', main: true, landing: true };
  const r = stump(`${k}r`, w.key, [0.55, 0.65], [34, 46], [120, 150]);
  const b: W1Piece = { ...floor(`${k}b`, [160, 220]), place: { kind: 'walk', after: w.key, dy: [225, 240] } };
  const c = softGap(`${k}c`, b.key, [260, 320], [0.4, 0.5]);
  return { pieces: [a, mushroom(`${k}m`, a.key, [0.7, 0.75]), lip(w, `${k}m`), r, b, c], sockets: [petals(`${k}pw`, w.key, [0.15, 0.35], 2), petals(`${k}pr`, r.key, 0.5, 1)], last: c.key };
};
/** snakeBranches(n, y) with its snakes left out (w1Sections '1-3' on main): n low boughs 100-150 over the floor */
const gLowBoughs = (n: number, up: number): G => (k, after) => {
  const f = floor(`${k}f`, [300 + n * 300, 340 + n * 330], startOr(after));
  const pieces: W1Piece[] = [f]; const sockets: Socket[] = [];
  let prev = '';
  for (let j = 0; j < n; j++) {
    const key = `${k}b${j}`;
    pieces.push(j === 0 ? bough(key, f.key, [0.08, 0.1], [-up, -up], [200, 260], true) : { key, shape: 'branch', w: [200, 260], place: { kind: 'jump', after: prev, dy: [-20, 10], share: [0.45, 0.6] }, style: 'branch', main: true, landing: true });
    sockets.push(petals(`p-${key}`, key, [0.3, 0.7], 2));
    prev = key;
  }
  return { pieces, sockets, last: f.key };
};
/** snakeLedge with its snake left out: up a stump onto a raised ledge, along it, down a soft step (w1Sections '1-3' on main) */
const gLedge = (): G => (k, after) => {
  const a = floor(`${k}a`, [360, 440], startOr(after));
  const s = stump(`${k}s`, a.key, [0.75, 0.82], [50, 60]);
  const l: W1Piece = { key: `${k}l`, shape: 'bank', w: [420, 520], place: { kind: 'jump', after: s.key, dy: [-50, -40], share: [0.4, 0.5] }, style: 'moss_stone', main: true, landing: true };
  const b: W1Piece = { ...floor(`${k}b`, [300, 360]), place: { kind: 'jump', after: l.key, dy: [100, 110], share: [0.45, 0.55], soft: true } };
  return { pieces: [a, s, l, b], sockets: [petals(`${k}ps`, s.key, 0.5, 1), petals(`${k}pl`, l.key, [0.3, 0.7], 2, 200)], last: b.key };
};
/** ropeGap: a gap only the shimmy rope crosses (1-3's own move) */
const gRope = (): G => (k, after) => {
  const b: W1Piece = { ...floor(`${k}b`, [320, 400]), place: { kind: 'rope', after: after!, gap: [380, 460], soft: true } };
  return { pieces: [b], sockets: [petals(`${k}p`, b.key, [0.3, 0.6], 2)], last: b.key };
};

/** a section from a chain of groups (the first opens on the floor), with sub-blocks rolled from alternative chains */
function chain(groups: G[]): Group {
  const out: Group = { pieces: [], sockets: [], last: '' };
  // (no 'i' or 'n': group i's beat n would be named 'in', the section's entry piece)
  groups.forEach((g, j) => { const r = g(`${'abcdefghjklmopqrstuvwxyz'[j]}`, j ? out.last : null); out.pieces.push(...r.pieces); out.sockets.push(...r.sockets); out.last = r.last; });
  return out;
}
/** a section whose pieces are one of several chains (Spelunky's sub-blocks: one version rolled per use) */
function section(o: Omit<W1Section, 'pieces' | 'entry' | 'exit' | 'sockets' | 'subBlocks' | 'mirrorable' | 'exitDy' | 'archetypes'> & { versions: Array<{ id: string; groups: G[]; easy?: G[] }>; ports?: [PortKind, PortKind]; exitDy?: number }): W1Section {
  // (C1: a version that lays a Normal-only double gap names its Easy twin, `easy`: laid on Easy in its place, never drawn on its own)
  const all = o.versions.flatMap((v) => (v.easy ? [{ id: v.id, groups: v.groups, easy: `${v.id}-easy` }, { id: `${v.id}-easy`, groups: v.easy, easyOnly: true }] : [{ id: v.id, groups: v.groups }]));
  // (every version must end on the same key: the last floor is renamed `out`)
  const vs = all.map((v) => { const c = chain(v.groups); return { id: v.id, c, ...('easy' in v && typeof v.easy === 'string' ? { easy: v.easy } : {}), ...('easyOnly' in v ? { easyOnly: true } : {}) }; });
  const open = vs[0].c.pieces[0].key;
  const versions = vs.map(({ id, c, ...tw }) => {
    const ren = (s: string) => (s === c.last ? 'out' : s);
    const pieces = c.pieces.slice(1).map((p) => ({ ...p, key: ren(p.key), place: renPlace(p.place, (s) => (s === open ? 'in' : ren(s))) }));
    const sockets = c.sockets.map((s) => ({ ...s, on: s.on === open ? 'in' : ren(s.on) }));
    return { id, pieces, sockets, ...tw };
  });
  const first = { ...vs[0].c.pieces[0], key: 'in' };
  const { versions: _v, ports = ['ground', 'ground'], exitDy = 0, ...rest } = o;
  return { ...rest, archetypes: 'any', pieces: [first], subBlocks: [{ id: 'body', versions }], entry: { piece: 'in', kind: ports[0] }, exit: { piece: 'out', kind: ports[1] }, exitDy, sockets: [], mirrorable: true };
}
function renPlace(pl: SectionPiece['place'], f: (s: string) => string): SectionPiece['place'] {
  const q = { ...pl } as Record<string, unknown>;
  if (typeof q.after === 'string') q.after = f(q.after);
  if (typeof q.on === 'string') q.on = f(q.on);
  return q as SectionPiece['place'];
}

// ───────────────────────────── old 1-1: its beats and w1Sections.ts '1-1' versions, each one section ─────────────────────────────

/** old 1-1 Learn: rest(400-440), lowStumps, busy(1, [log]), three soft gaps, a flag (protoStage.ts on main 1414-1433) */
const learn = section({
  id: 'w1-learn', floor: 'hop', name: 'run and jump', phases: ['start', 'ki'], difficulty: 2, needs: ['jump'], teaches: 'jump', // (the move's name, as the brief's teaches: the designer's 1-1 brief, f560b7916)
  maxPerStage: 1,
  versions: [3, 4].map((n) => ({ id: n === 3 ? 'old' : 'four-stumps', groups: [gRest([200, 260]), gLowStumps(n as 3 | 4), gBusy(['log']), (k: string, after: string | null) => { const g = gSoftGaps()(k, after); g.sockets.push(dot(`${k}gaps`, g.pieces[0].key, 0.1, 'hint.1-1.gaps')); return g; }, gRest([260, 320], true)] })),
  feel: ['1-1'], not: NOT_11, rating: 2,
  source: "old 1-1 'Learn: run and jump' (protoStage.ts on main 1414-1433): rest 400-440, lowStumps, busy(1, ['log'], 240-290), soft gaps one x 0.35/0.45/0.55, a flag",
});
/** w1Sections '1-1' develop: 'stones', 'stumpStones', 'stoneDips' (on main 241-270). Each old version ran 20-26 s, past the brief's
 *  10-20 s, so each is cut at its seam (the mushroom cache) into two sections */
const STONES: Array<[string, number[]]> = [['a', [40, 80, 110, 70]], ['b', [50, 100, 70, 40]], ['c', [40, 90, 60, 100]]];
const developStones = section({
  id: 'w1-stones', floor: 'jump', name: 'stepping stones', phases: ['ki', 'sho'], difficulty: 3, needs: ['jump'], teaches: 'stones',
  versions: STONES.map(([id, hs]) => ({ id, groups: [gRest([100, 140]), gStones([60, 110, 60], [0.5, 0.62]), gBusy(['log']), gStones(hs)] })),
  feel: ['1-1'], not: NOT_11, rating: 3,
  source: "w1Sections '1-1' develop 'stones' (on main 241-246), its first half: pillars [60,110,60], busy(1-2), pillars of one of [40,80,110,70]/[50,100,70,40]/[40,90,60,100]",
});
const cacheStones = section({
  id: 'w1-cache-stones', floor: 'jump', name: 'mushroom cache and stones', phases: ['sho'], difficulty: 3, needs: ['jump'], uses: ['bounce'], maxPerStage: 1, // (Round 2 (d): no 'rest', a rest rates 1)
  versions: [{ id: 'stones', groups: [gRest([100, 140]), gCache(), gDip(), gStones([60, 30, 90, 60], [0.58, 0.7])] }, ...STONES.map(([id, hs]) => ({ id: `dip-${id}`, groups: [gRest([100, 140]), gCache(), gBusy(['dip']), gStones(hs)] }))],
  feel: ['1-1'], not: NOT_11, rating: 3,
  source: "w1Sections '1-1' develop 'stones' and 'stumpStones' (on main 247-249, 257-259), their second halves: mushroomCache, dip or busy(1, [dip, log]), pillars [60,30,90,60] or POOL.stones",
});
const developStumpStones = section({
  id: 'w1-stump-stones', floor: 'hop', name: 'stones and stumps', phases: ['ki', 'sho'], difficulty: 3, needs: ['jump'],
  versions: [{ id: 'dips', groups: [gRest([100, 140]), gStones([60, 110, 60], [0.5, 0.62]), gLowStumps(3), gBusy(['dip', 'dip'])] }, { id: 'four', groups: [gRest([100, 140]), gStones([60, 110, 60], [0.5, 0.62]), gLowStumps(4), gBusy(['dip', 'log'])] }],
  feel: ['1-1'], not: NOT_11, rating: 3,
  source: "w1Sections '1-1' develop 'stumpStones' (on main 252-256), its first half: pillars [60,110,60], lowStumps, busy(2, [dip])",
});
const developStoneDips = section({
  id: 'w1-stone-dips', floor: 'jump', name: 'stones and dips', phases: ['sho'], difficulty: 3, needs: ['jump'],
  versions: [{ id: 'old', groups: [gRest([100, 140]), gStones([60, 110, 60], [0.5, 0.62]), gBusy(['dip', 'log', 'dip']), gLowStumps(3)] },
    { id: 'four-stumps', groups: [gRest([100, 140]), gStones([60, 110, 60], [0.5, 0.62]), gBusy(['log', 'dip']), gLowStumps(4)] }],
  feel: ['1-1'], not: NOT_11, rating: 3,
  source: "w1Sections '1-1' develop 'stoneDips' (on main 262-270), less its mushroom cache (in w1-cache-stones): pillars [60,110,60], POOL.hopDip, lowStumps",
});
/** w1Sections '1-1' twist: 'gaps', 'highLeaps', 'stoneLeaps' (on main 272-302); 'highLeaps' and 'stoneLeaps' ran 24-36 s, so cut */
const twistGaps = section({
  id: 'w1-second-jump', floor: 'jump', name: 'the second jump', phases: ['ten'], difficulty: 5, needs: ['double'], uses: ['double'], maxPerStage: 1, // (Round 2 (c): the double's first test; #8 teaches it)
  // (C1: the gaps 252-262 on Normal, a practice gap first; Easy's twin lays single gaps; the stones single jumps, inside the band)
  versions: [{ id: 'old', groups: [gShelf(), gPractice(), gDoubleGaps([[0.85, 0.89]]), gRest([200, 260]), gStones([60, 70, 50], [0.5, 0.6])], easy: [gShelf(), gLevelHop(), gLevelHop(), gRest([200, 260]), gStones([60, 70, 50], [0.5, 0.6])] }],
  feel: ['1-1'], not: NOT_11, rating: 5,
  source: "w1Sections '1-1' twist 'gaps' (on main 273-280): practiceShelf, gapRun(reachTwo x 0.62/0.72/0.82), a run of 200-260, pillars [60,70,50] dbl at 0.6-0.72",
});
const twistLeapStones = section({
  id: 'w1-leap-stones', floor: 'jump', name: 'leaps and stones', phases: ['ten', 'ketsu'], difficulty: 6, needs: ['double'], uses: ['double'],
  // (C1: practice then test gaps on Normal, Easy's twin single gaps; the 'double' stones of 50-70 px were single jumps by the flown band)
  // (C1, the bots: one test a stage is enough past the teach's; here two practice gaps, a floor under each, a miss a climb on)
  versions: [{ id: 'two-gaps', groups: [gRest([200, 260]), gPractice(), gPractice(), gStones([60, 70, 50], [0.5, 0.6]), gStones([50, 60, 60, 50], [0.5, 0.6])], easy: [gRest([200, 260]), gLevelHop(), gLevelHop(), gStones([60, 70, 50], [0.5, 0.6]), gStones([50, 60, 60, 50], [0.5, 0.6])] },
    { id: 'one-gap', groups: [gRest([200, 260]), gPractice(), gStones([60, 70, 50], [0.5, 0.6]), gBusy(['dip']), gStones([50, 60, 50], [0.5, 0.6])], easy: [gRest([200, 260]), gLevelHop(), gStones([60, 70, 50], [0.5, 0.6]), gBusy(['dip']), gStones([50, 60, 50], [0.5, 0.6])] }],
  feel: ['1-1'], not: NOT_11, rating: 6,
  source: "w1Sections '1-1' twist 'stoneLeaps' and 'highLeaps' (on main 284-302) less the practice shelf (in w1-second-jump): gapRun(reachTwo x 0.62[/0.72]), pillars [60,70,50] dbl, busy(2, [leap, dip]), pillars [50,60,60,50] dbl",
});
const twistHighLeaps = section({
  id: 'w1-high-leaps', name: 'high boughs', phases: ['ten', 'ketsu'], difficulty: 6, needs: ['double'], uses: ['double', 'bounce'],
  versions: [{ id: 'three-three', groups: [gRest([150, 210]), gHighLeaps(3, true), gHighLeaps(3, true)] }, { id: 'four', groups: [gRest([150, 210]), gHighLeaps(4, true), gBusy(['dip'])] }],
  feel: ['1-5'], not: NOT_11, rating: 6, window: [0.67, 1], // (C1: out of 1-1: its boughs at 241 over the floor, a bounce lip with no face, and level doubles under 252)
  source: "w1Sections '1-1' twist 'highLeaps' (on main 290-291): highLeaps(3, dbl) then highLeaps(4, dbl); the second run kept at 3 here for the brief's 20 s",
});
/** w1Sections '1-1' finish: 'hopBounce', 'bounceRun', 'stoneRoad' (on main 304-331), one round of each fill */
const finishHopBounce = section({
  id: 'w1-hop-bounce', floor: 'hop', name: 'bounce walls', phases: ['sho', 'ketsu'], difficulty: 4, needs: ['jump'], teaches: 'bounce',
  versions: [{ id: 'walls', groups: [gRest([150, 210]), gBounceWall(), gBounceWall(), gLogHop()] }, { id: 'wall-leap', groups: [gRest([150, 210]), gBounceWall(), gLogHop(), gBounceWall(), gDip()] }],
  feel: ['1-3'], not: NOT_11, rating: 4, // (C1: out of 1-1: fewer bounce pieces; its cliff 225-240 a lip the bounce alone nearly clears)
  source: "w1Sections '1-1' finish 'hopBounce' (on main 306-311): bounceWall, then bounceWall + run 60-90 + logHop, or bounceWall + leap",
});
const finishBounceRun = section({
  id: 'w1-bounce-run', name: 'up and along', phases: ['ketsu'], difficulty: 6, needs: ['double'], uses: ['bounce', 'double'],
  versions: [{ id: 'five', groups: [gRest([150, 210]), gHighLeaps(5, true), gBusy(['dip', 'log'])] }, { id: 'three-wall', groups: [gRest([150, 210]), gHighLeaps(3, false), gBounceWall()] }],
  feel: ['1-5'], not: NOT_11, rating: 6, window: [0.67, 1], // (C1: out of 1-1, as high-leaps)
  source: "w1Sections '1-1' finish 'bounceRun' (on main 313-319): highLeaps(5, dbl), or highLeaps(3) + bounceWall",
});
const finishStoneRoad = section({
  id: 'w1-stone-road', floor: 'jump', name: 'stone road home', phases: ['ketsu', 'goal'], difficulty: 3, needs: ['jump'],
  versions: STONES.map(([id, hs]) => ({ id, groups: [gRest([150, 210]), gStones(hs), gBusy(['log', 'dip', 'log']), gLowStumps(3)] })),
  feel: ['1-3'], not: NOT_11, rating: 3, // (Round 2 (d): not 1-1, it ends on the ground against 1-1's trend up)
  source: "w1Sections '1-1' finish 'stoneRoad' (on main 321-330): POOL.stones, busy(3, [log, dip]), lowStumps",
});
/** old 1-1's rests between beats and its home run: the meadow (rest 400-440 + a flag; busy and low stumps on it) */
const meadow = section({
  id: 'w1-meadow', floor: 'hop', name: 'home meadow', phases: ['rest'], // (Round 7 (c): not an arrival, it needs a jump and has a dip; it stays a rest)
  difficulty: 1, // (Round 2 (d): not goal; 1-1 ends on the high log)
  needs: ['jump'],
  versions: [{ id: 'stumps', groups: [gRest([200, 260], true), gLowStumps(3), gBusy(['log', 'dip', 'log'])] }, { id: 'rocks', groups: [gRest([200, 260], true), gBusy(['log', 'log', 'dip']), gLowStumps(3)] }],
  feel: ['1-1', '1-2', '1-3', '1-5'], not: NOT_11, rating: 1,
  source: "old 1-1's rests (rest 400-440, flag) with busy and lowStumps around them (protoStage.ts on main), and homeRun's open run",
});

// ───────────────────────────── old 1-3, less its snakes (w1Sections.ts '1-3' on main 386-415) ─────────────────────────────

const lowBoughs = section({
  id: 'w1-low-boughs', floor: 'hop', name: 'low boughs', phases: ['sho', 'ten'], difficulty: 3, needs: ['jump'],
  versions: [{ id: 'branches', groups: [gRest([150, 210]), gLowBoughs(3, 130), gLowBoughs(4, 150)] }, { id: 'ground', groups: [gRest([150, 210]), gLowBoughs(3, 130), gBusy(['log', 'dip']), gLowStumps(3)] }],
  feel: ['1-3'], not: NOT_13, rating: 3, // (Round 2 (b): not 1-1, its boughs come mid-stage)
  source: "w1Sections '1-3' develop 'branches'/'ground' (on main 392-393): snakeBranches(3, G-130), busy(1), lowStumps, snakeBranches(4, G-150), its snakes left out; feel '1-1' proposed by the porter (1-1 rises into the boughs), for the designer",
});
const ledges = section({
  id: 'w1-ledges', floor: 'hop', name: 'ledges and walls', phases: ['sho', 'ten'], difficulty: 4, needs: ['jump'],
  versions: [{ id: 'ledges', groups: [gRest([150, 210]), gLedge(), gBusy(['log']), gLedge()] }, { id: 'walls', groups: [gRest([150, 210]), gLowBoughs(3, 150), gBounceWall(), gBusy(['dip'])] }], // (Round 4 FR2: boughs 150 up)
  feel: ['1-3'], not: NOT_13, rating: 4, // (Round 2 (b): not 1-1 for now; its 'ledges' version may return with version-level feel)
  source: "w1Sections '1-3' 'ledge'/'ledges'/'walls' (on main 389, 394, 396): snakeLedge, busy(1), snakeLedge; snakeBranches, bounceWall, snakeWalk, bounceWall; snakes left out; feel '1-1' proposed",
});
const ropes = section({
  id: 'w1-ropes', name: 'rope gaps', phases: ['ten', 'ketsu'], difficulty: 5, needs: ['rope'], uses: ['rope'],
  versions: [{ id: 'branches', groups: [gRest([150, 210]), gRope(), gLowBoughs(3, 140), gRope()] }, { id: 'wall', groups: [gRest([150, 210]), gRope(), gBounceWall(), gRope()] }],
  feel: ['1-3'], not: NOT_13, rating: 5,
  source: "w1Sections '1-3' twist 'ropeBranches'/'ropeWall' (on main 399, 402): ropeGap, snakeBranches / bounceWall, ropeGap, snakes left out; 1-3 only (it needs 'rope')",
});


// ───────────────────────────── the designer's new sections (W1-NEW-SECTIONS.md, engine-spec b62633914) ─────────────────────────────
// Entered as written, in gen2's place rules, with the designer's ruling on the porter's entry findings (engine-spec 08c5a2944): every
// challenge section's versions reach 10 s by more repetitions (rests and goals may be short), trunks dropped (platforms may float, Matt)
// so petals sit low on low logs, the exit totem an `objective` socket. Catch boughs are the engine's (floorRoll.catchDrop).

type R2 = [number, number];
/** a landing 3.5-5 body widths (Pokey is 44 wide: WORLD-RULEBOOK §7's 3.5-7.0) */
const LAND: R2 = [154, 220];
/** a stump sized as a landing, standing on `on` */
const stumpL = (key: string, on: string, at: R2, h: R2): W1Piece => stump(key, on, at, h, LAND);
/** a post: a narrow stump under a log (the 12:51 ruling: the stump meets the log) */
const post = (key: string, on: string, at: R2, h: R2): W1Piece => ({ key, shape: 'block', w: [44, 56], place: { kind: 'on', on, at, h }, style: 'moss_stone' });
/** a thin log seated on its post's top, centred over it (gen2 draws a 'branch' shape 24 thick; the page's h 30) */
const logOn = (key: string, p: string, w: R2 = [180, 240], main = true): W1Piece => ({ key, shape: 'branch', w, place: { kind: 'over', on: p, at: [-1.6, -1.4], dy: [-24, -24] }, style: 'log', main, landing: true });
/** a bough or a high log placed by any rule (the canopy sections' own pieces) */
const limb = (key: string, place: SectionPiece['place'], w: R2, style: 'branch' | 'log' = 'branch', main = true): W1Piece => ({ key, shape: 'branch', w, place, style, main, landing: true });
/** a bank (earth: a mound step, a raised road) walked onto from `after`, `dy` up (negative) or down */
const bankW = (key: string, after: string, dy: R2, w: R2): W1Piece => ({ key, shape: 'bank', w, place: { kind: 'walk', after, dy }, style: 'moss_stone', main: true, landing: true });
/** the long high log main's old 1-1 ends on (685 px at y 580, exit_totem on it: eraRoll build, layout 1); its trunks are the planner's */
const END_LOG: R2 = [685, 685];
const BOUGH_WINDOW: R2 = [0.67, 1];
const seq = (n: number, f: (j: number) => void) => { for (let j = 0; j < n; j++) f(j); };

/** a group laid `n` times in a row (the designer's ruling, 08c5a2944: a challenge section reaches 10 s by more repetitions); Dot's tip
 *  comes once, with the first */
const times = (n: number, g: G): G => (k, after) => {
  const out: Group = { pieces: [], sockets: [], last: after! };
  seq(n, (j) => { const r = g(`${k}${j}`, j ? out.last : after); out.pieces.push(...r.pieces); out.sockets.push(...r.sockets.filter((so) => !j || so.role !== 'tip')); out.last = r.last; });
  return out;
};
/** a low log off the route under a canopy piece, its petals at marching height (the ruling: petals low on low logs, never a petal road in
 *  the boughs); its top 136-144 px under the bough's: 110 px+ head room (Round 4 FR2, FR5: the mid road) */
const lowLog = (key: string, over: string, at: R2): W1Piece => limb(key, { kind: 'over', on: over, at, dy: [136, 144] }, [180, 220], 'log', false);
/** the exit totem's socket on the end log (the ruling: an `objective` socket; main's stageGenerator.ts:2136 gen.item('exit_totem')) */
const totem = (on: string): Socket => ({ id: 'exit-totem', role: 'objective', on, t: 0.85, allow: ['exit_totem'] });
/** 1-1's clue, the bootprint, on the end log's walking line 200-260 px WEST of the totem, so he walks over it before the door (the lead,
 *  11-05, on the mixed 1-1's still: there it lay past the door). On a 685 px log with the totem at t 0.85 (582 px): t 0.47-0.56 */
const clue = (on: string): Socket => ({ id: 'clue', role: 'decor', on, t: [0.47, 0.56], dn: 0, allow: ['bootprint'] });

/** #1 stump stile: stumps stepping up then down (or down then up) over the floor */
const gStile = (hs: number[]): G => (k, after) => {
  const f = floor(`${k}f`, [hs.length * 250 + 260, hs.length * 270 + 300], startOr(after));
  // (FR9b, the designer 11-06: every floor stump 50 px or more, a wall he hops; a 40 px one was walked through, no beat)
  const ps = hs.map((h, j) => stumpL(`${k}s${j}`, f.key, [(j + 0.5) / hs.length - 0.04, (j + 0.5) / hs.length - 0.01], [Math.max(h, 50), Math.max(h, 50) + 6]));
  return { pieces: [f, ...ps], sockets: ps.map((p) => petals(`p-${p.key}`, p.key, 0.5, 1)), last: f.key };
};
/** #2 stone zigzag: stones at two (or three) heights, every upper one seated on a mound (a bank top), the floor walk beside */
const gZigzag = (tiers: 2 | 3, log: boolean): G => (k, after) => {
  const f = floor(`${k}f`, [320, 380], startOr(after));
  const m1 = bankW(`${k}m1`, f.key, [-55, -45], [340, 400]);
  const f2 = bankW(`${k}g2`, m1.key, [45, 55], [320, 380]);
  const up: W1Piece[] = log ? [post(`${k}u1`, m1.key, [0.45, 0.55], [30, 40]), logOn(`${k}l1`, `${k}u1`)] : [stumpL(`${k}u1`, m1.key, [0.4, 0.6], [50, 60])];
  const pieces = [f, stumpL(`${k}s0`, f.key, [0.5, 0.65], [50, 60]), m1, ...up, f2, stumpL(`${k}s2`, f2.key, [0.4, 0.6], [50, 60])];
  let last = f2.key;
  if (tiers === 3) {
    const m2 = bankW(`${k}m2`, f2.key, [-85, -75], [340, 400]), f3 = bankW(`${k}g3`, m2.key, [75, 85], [300, 360]);
    pieces.push(m2, stumpL(`${k}u2`, m2.key, [0.4, 0.6], [50, 60]), f3);
    last = f3.key;
  }
  const tops = pieces.filter((p) => p.key.includes('s') || p.key.includes('u2') || p.key.includes('l1') || (!log && p.key.endsWith('u1')));
  return { pieces, sockets: tops.map((p) => petals(`p-${p.key}`, p.key, 0.5, 1)), last };
};
/** #3 / #14: a road of thin logs on posts over the floor, 100-120 px up (head room 76-96 >= Pokey's 48 + 20) */
const gLogRoad = (n: number, ends: boolean, hops = false, withFind = false, postH: R2 = [76, 86], rockW: R2 = [120, 154]): G => (k, after) => {
  const pieces: W1Piece[] = []; const sockets: Socket[] = [];
  let prev = after;
  if (ends) { const a = floor(`${k}a`, [200, 240], startOr(after)); const st = bankW(`${k}st`, a.key, [-45, -35], [170, 200]); pieces.push(a, st); prev = st.key; }
  // (the high road's logs 110 px over the floor road (Round 4 FR2) are narrower, so they sit closer: a gap a single crosses, 130 px or so)
  const tall = postH[0] >= 100, FW: R2 = tall ? [n * 280 + 100, n * 285 + 110] : [n * 300 + 100, n * 320 + 120];
  const f: W1Piece = ends ? bankW(`${k}f`, prev!, [35, 45], FW) : floor(`${k}f`, FW, startOr(prev));
  pieces.push(f);
  seq(n, (j) => {
    // (Round 4 FR1/FR7: the tall road's logs float over the floor road, no posts walling off the low road; platforms may float, Matt 11-05)
    if (tall) { const l = limb(`${k}l${j}`, { kind: 'over', on: f.key, at: [(j + 0.5) / n - 0.05, (j + 0.5) / n - 0.045], dy: [-(postH[0] + 24), -(postH[1] + 24)] }, [140, 160], 'log', !hops); pieces.push(l); sockets.push(petals(`p-${l.key}`, l.key, [0.3, 0.7], 2, 100)); }
    else { const p = post(`${k}p${j}`, f.key, [(j + 0.5) / n - 0.02, (j + 0.5) / n], j === n - 1 && n > 3 ? [92, 96] : postH); const l = logOn(`${k}l${j}`, p.key, [180, 240], !hops); pieces.push(p, l); sockets.push(petals(`p-${l.key}`, l.key, [0.3, 0.7], 2, 100)); }
    if (hops && j < n - 1) { const fw = (FW[0] + FW[1]) / 2, mid = (((j + 1) / n) * (fw - 50) + 25 - (rockW[0] + rockW[1]) / 4) / (fw - (rockW[0] + rockW[1]) / 2); const s = stump(`${k}h${j}`, f.key, [mid - 0.005, mid + 0.005], [34, 46], rockW); pieces.push(s); sockets.push(petals(`p-${s.key}`, s.key, 0.5, 1)); }
  });
  if (withFind) sockets.push(find(`${k}find`, `${k}l${n - 1}`));
  let last = f.key;
  if (ends) { const e = bankW(`${k}e`, f.key, [-45, -35], [170, 200]); const o = bankW(`${k}o`, e.key, [35, 45], [220, 260]); pieces.push(e, o); last = o.key; }
  return { pieces, sockets, last };
};
/** a perched mushroom: a stump on `on`, the mushroom on the stump (the perch rule, Q2). Under 50 px (FR9b's perch exception, the
 *  designer 11-06): no wall, the step help lifts him onto it and the mushroom; at 50-56 its face was a step he could only bounce off from
 *  (plainWalk's one-jump steps, 1-1 seeds 1 and 3) */
const perch = (k: string, on: string, at: R2, w: R2 = LAND): W1Piece[] => [stump(`${k}st`, on, at, [40, 46], w), mushroom(`${k}m`, `${k}st`, [0.5, 0.5])];
/** (C1) the `at` over the seed perch's stump (170-176 wide, the mushroom at its middle) where the bough starts 30-35 px past the mushroom's
 *  edge (Easy's widened stump adds 10-20) */
const PAST_PERCH: R2 = [0.88, 0.9];

/** #1 */
const stumpStile = section({
  id: 'w1-stump-stile', floor: 'hop', name: 'stump stile', phases: ['ki'], difficulty: 2, needs: ['jump'],
  versions: [{ id: 'up3', groups: [gRest([140, 180]), times(2, gStile([40, 76, 40]))] }, { id: 'up5', groups: [gRest([140, 180]), times(2, gStile([40, 76, 100, 76, 40]))] }, { id: 'down4', groups: [gRest([140, 180]), times(2, gStile([90, 50, 40, 80]))] }],
  feel: ['1-1', '1-2', '1-3'], not: NOT_11, rating: 2,
  source: 'W1-NEW-SECTIONS #1 (designer): "hills and little areas to jump up on" (ES 592); up/down on most landings (old 1-1 floor)',
});
/** #2 */
const stoneZigzag = section({
  id: 'w1-stone-zigzag', floor: 'hop', name: 'mossy stone zigzag', phases: ['ki', 'sho'], difficulty: 3, needs: ['jump'],
  versions: [{ id: 'two', groups: [gRest([140, 180]), times(2, gZigzag(2, false))] }, { id: 'three', groups: [gRest([140, 180]), times(2, gZigzag(3, false))] }, { id: 'two-log', groups: [gRest([140, 180]), times(2, gZigzag(2, true))] }],
  feel: ['1-1', '1-2', '1-5'], not: NOT_11, rating: 3,
  source: 'W1-NEW-SECTIONS #2: LABELS §1 mossy stone (ground, never floats: Matt, rule 1); every upper stone on a mound; high/low split',
});
/** #3 */
const logRoad = section({
  id: 'w1-log-road', floor: 'hop', name: 'raised log road', phases: ['sho'], difficulty: 3, needs: ['jump'],
  versions: [4, 5, 6].map((n) => ({ id: `logs${n}`, groups: [gRest([140, 180]), gLogRoad(n, true, true, false, [110, 114], [40, 50])] })), // (Round 4 FR1-FR4: logs 110 px over the floor road, low rocks between them)
  feel: ['1-1', '1-2', '1-5'], not: NOT_11, rating: 3,
  source: 'W1-NEW-SECTIONS #3: thin logs on stumps 100-120 px up, a bank step each end (the 12:51 and 3:40 rulings, Q1); the floor road',
});
/** #4: the hollow log on the floor (the planner's 'hollow', engine-chunks a105feed): walk through inside (the low road) or hop along its top
 *  (the high road); its height is the art's own (hollowLogSize: 124 at 300 px, 150 at 360, past one jump from the floor), so a stump
 *  step stands before it, and the floor rejoins past it */
const hollowTwoway = section({
  id: 'w1-hollow-twoway', floor: 'hop', name: 'hollow-log two-way', phases: ['sho'], difficulty: 3, needs: ['jump'],
  versions: ([300, 360] as const).flatMap((len) => (['stump', 'stone'] as const).map((after) => ({ id: `${len}-${after}`, groups: [gRest([140, 180]), times(2, (k: string, prev: string | null) => {
    const f = floor(`${k}f`, [len + 760, len + 820], startOr(prev));
    const hh = hollowLogSize('moss', len).height;
    const step = stumpL(`${k}s`, f.key, [0.08, 0.1], [50, 56]);
    const H: W1Piece = { key: `${k}H`, shape: 'hollow', w: [len, len], place: { kind: 'on', on: f.key, at: [0.3, 0.32], h: [hh, hh] }, landing: true };
    const a = after === 'stump' ? stumpL(`${k}a`, f.key, [0.92, 0.95], [50, 60]) : stump(`${k}a`, f.key, [0.92, 0.95], [30, 36], LAND);
    const mid = stump(`${k}mid`, f.key, [0.72, 0.74], [30, 36], [120, 140]);
    return { pieces: [f, step, H, mid, a], sockets: [petals(`${k}ph`, H.key, [0.3, 0.7], 2, 120), petals(`${k}pa`, a.key, 0.5, 1), find(`${k}find`, H.key)], last: f.key };
  })] }))),
  feel: ['1-1', '1-2'], not: NOT_11, rating: 3,
  source: 'W1-NEW-SECTIONS #4: LABELS §2 hollow log (a two-road split, W1 art in the w1-new atlas); the stump step is the porter\'s (the top is past one jump at the art\'s own height)',
});
/** #5 */
const mushroomLift = section({
  id: 'w1-mushroom-lift', name: 'first lift', phases: ['sho'], difficulty: 2, teaches: 'bounce', ports: ['ground', 'ledge'], exitDy: -241,
  versions: [
    { id: 'mound', groups: [gRest([160, 200]), gStile([40, 76, 100, 76, 40]), (k, after) => { const f = floor(`${k}f`, [520, 600], startOr(after)); const L = bankW(`${k}L`, f.key, BOUNCE_LIP, [330, 400]); /* (C1, bands.md §5: the floor ends at the bank face, its lip 237-245 up, the mushroom 25-55 px from it) */ return { pieces: [f, mushroom(`${k}m`, f.key, faceAt([520, 600])), lip(L, `${k}m`)], sockets: [tip(f.key, 0.05), petals(`${k}pl`, L.key, [0.3, 0.7], 2)], last: L.key }; }] },
    { id: 'log-road', groups: [gRest([160, 200]), gStile([40, 76, 100, 76, 40]), (k, after) => { const f = floor(`${k}f`, [520, 600], startOr(after)); const B = bankW(`${k}B`, f.key, BOUNCE_LIP, [300, 340]); const P = post(`${k}P`, B.key, [0.6, 0.7], [70, 80]); const L = logOn(`${k}L`, P.key, [240, 300]); /* (back down to the lip's height off the log's end: the exit is the lip's, exitDy -241) */ const o = bankW(`${k}o`, L.key, [90, 104], [220, 280]); return { pieces: [f, mushroom(`${k}m`, f.key, faceAt([520, 600])), lip(B, `${k}m`), P, L, o], sockets: [tip(f.key, 0.05), petals(`${k}pl`, L.key, [0.3, 0.7], 2)], last: o.key }; }] },
  ],
  feel: ['1-1'], not: NOT_11, rating: 2,
  source: 'W1-NEW-SECTIONS #5: the brief\'s "first lift" (1-1.md:20); the perch rule (Q2). sho (the ruling, 08c5a2944: the bounce taught after the double); a stump stile before the lift for the 10 s',
});
/** #6 */
const twinBounce = section({
  id: 'w1-twin-bounce', name: 'twin bounce', phases: ['sho'], difficulty: 4, uses: ['bounce'], ports: ['ledge', 'ground'], exitDy: 100,
  versions: [3, 4].flatMap((n) => (['stair', 'drop'] as const).map((down) => ({ id: `${n}-${down}`, groups: [(k: string) => {
    const pieces: W1Piece[] = [{ key: `${k}L0`, shape: 'bank', w: [300, 360], place: { kind: 'start' }, style: 'moss_stone', main: true, landing: true }];
    const sockets: Socket[] = [];
    seq(n, (j) => { pieces.push(...perch(`${k}${j}`, `${k}L${j}`, [0.5, 0.6]), lip(bankW(`${k}L${j + 1}`, `${k}L${j}`, [-130, -110], [260, 320]), `${k}${j}m`)); sockets.push(petals(`p${k}${j}`, `${k}L${j + 1}`, [0.3, 0.7], 2)); });
    // (down by stair or drop, both to the climb's foot plus 100 (exitDy 100): the stair's three steps 120 + rise / 2 - 10 twice)
    const top = `${k}L${n}`, rise = n * 120;
    if (down === 'stair') { pieces.push(bankW(`${k}d1`, top, [110, 130], [200, 240]), bankW(`${k}d2`, `${k}d1`, [rise / 2 - 20, rise / 2], [200, 240]), bankW(`${k}o`, `${k}d2`, [rise / 2 - 20, rise / 2], [260, 300])); return { pieces, sockets, last: `${k}o` }; }
    pieces.push({ ...floor(`${k}o`, [300, 360]), place: { kind: 'jump', after: top, dy: [rise + 90, rise + 110], share: [0.25, 0.35] } });
    return { pieces, sockets, last: `${k}o` };
  }, gStile([40, 76, 40])] }))),
  feel: ['1-5'], not: NOT_11, rating: 4, // (C1: out of 1-1: its perched lips (110-130) a single climbs; fewer bounce pieces)
  source: 'W1-NEW-SECTIONS #6: two (or three) perched mushrooms, each a step higher, then down by stair or drop; the pair on one beat (LEDGER-11-02:33)',
});
/** #7 */
const fallenTrunk = section({
  id: 'w1-fallen-trunk', floor: 'hop', name: 'the fallen trunk', phases: ['ten'], difficulty: 5, needs: ['double'], uses: ['double'],
  versions: [false, true].map((m) => ({ id: m ? 'mushroom' : 'double', groups: [gRest([160, 200]), times(3, (k, after) => {
    const f = floor(`${k}f`, [820, 900], startOr(after));
    // (C1: the trunk's top in the D band (Normal 136-140; Easy's cap 132), and no stump before it: flat floor up to its face, the stair's room)
    const T: W1Piece = { key: `${k}T`, shape: 'block', w: [220, 260], place: { kind: 'on', on: f.key, at: [0.52, 0.53], h: [137, 140] }, style: 'log', landing: true };
    const lo = [stump(`${k}l1`, f.key, [0.9, 0.92], [34, 40], [120, 140])];
    return { pieces: [f, ...(m ? [mushroom(`${k}m`, f.key, [0.277, 0.287])] : []), T, ...lo], sockets: [petals(`${k}pt`, T.key, [0.3, 0.7], 2), ...lo.map((q) => petals(`p-${q.key}`, q.key, 0.5, 1))], last: f.key };
  }), gRest([200, 260])] })),
  feel: ['1-1', '1-3'], not: NOT_11, rating: 5,
  source: 'W1-NEW-SECTIONS #7: a fallen log too tall for one jump, a double over it or a mushroom beside it (LEDGER-ENGINE-GEMINI:479)',
});
/** #8 */
const doubleTeach = section({
  id: 'w1-double-teach', floor: 'hop', name: 'up the tall step', phases: ['ki'], difficulty: 3, needs: ['double'], teaches: 'double', maxPerStage: 1, exitDy: -138,
  // (C1, bands.md §3: the rise is the lesson (one jump never climbs it, a double always does), then a practice gap and the test on Normal;
  //  Easy has no double gap, so its twin lays single gaps; the test sits inside the 1,500 px promises11 reads from the teach)
  versions: [1, 2].map((n) => {
    const head: G[] = [(k, after) => { const g = gRest([260, 300])(k, after); g.sockets.push(dot(`${k}nice`, g.last, 0.2, 'coach.nice')); return g; }, (k, after) => riseFace(k, after, false, [280, 320], false)];
    const tail: G = (k: string, after: string | null) => { const g = gRest([200, 240])(k, after); g.sockets.push(dot(`${k}dbl`, g.last, 0.3, 'hint.1-1.double')); return g; };
    return { id: n === 1 ? 'rise' : 'rise-two', groups: [...head, ...Array.from({ length: n }, () => gPractice()), gDoubleGaps([[0.85, 0.89]]), gLogHop(), gDip(), tail], easy: [...head, ...Array.from({ length: n + 1 }, () => gLevelHop()), gLogHop(), gDip(), tail] };
  }),
  feel: ['1-1'], not: NOT_11, rating: 3,
  source: 'W1-NEW-SECTIONS #8, re-laid C1 (bands.md §3: the double gap is no lesson); before: one gap just past a single jump over a safe dip (soft pit: a floor under it, stair steps back, pipeline pitUnder/pitSteps), then two more (R2, the 3:11 ruling)',
});
/** #9 */
const boughStepup = section({
  id: 'w1-bough-stepup', name: 'into the boughs', phases: ['sho'], difficulty: 4, needs: ['jump'], ports: ['ground', 'ledge'], exitDy: -491, window: BOUGH_WINDOW,
  versions: [5].flatMap((n) => [false, true].map((log) => ({ id: `${n}${log ? '-log' : ''}`, groups: [gRest([160, 200]), gStile([40, 76, 40]), (k: string, after: string | null) => {
    const f = floor(`${k}f`, [n * 260 + 500, n * 280 + 560], startOr(after));
    const pieces: W1Piece[] = [f, bough(`${k}b0`, f.key, [0.25, 0.3], [-182, -178], [200, 240], true), stump(`${k}lo0`, f.key, [0.56, 0.58], [34, 40], LAND), stump(`${k}lo1`, f.key, [0.8, 0.82], [34, 40], LAND), ...[0.1, 0.3, 0.42, 0.68, 0.93].map((at, i) => stump(`${k}lf${i}`, f.key, [at, at + 0.01], [34, 40], [120, 140]))];
    let prev = `${k}b0`;
    seq(n - 1, (j) => {
      const key = `${k}b${j + 1}`;
      // (the log version's second step a log that floats, laid as the boughs are: Round 4 FR2 head room over the floor road's stumps)
      pieces.push(limb(key, { kind: 'jump', after: prev, dy: [-90, -70], share: [0.4, 0.5] }, [200, 240], log && j === 0 ? 'log' : 'branch'));
      prev = key;
    });
    return { pieces, sockets: [petals(`p-${k}lo0`, `${k}lo0`, 0.5, 1), petals(`p-${k}lo1`, `${k}lo1`, 0.5, 1)], last: prev };
  }] }))),
  feel: ['1-1', '1-5'], not: NOT_11, rating: 4,
  source: 'W1-NEW-SECTIONS #9: low boughs on one plain W1 trunk (the planner lays it; not the kapok, no climb, no view) rising from the floor road; LATE only (window); "a ground stage that becomes a tree stage" (9:20 ruling)',
});
/** canopy boughs: `n` rises each a double (share past a single) from a start bough; catch boughs under the gaps are the engine's (catchDrop) */
// (C1: every bough-to-bough step a single, inside the band (bands.md §2): a double rise between two floating pieces leaves no ground for
//  the help's stair; `kind` stays for the old callers, a 'double' laid as a 'jump')
const gRungs = (n: number, rise: R2, kind: 'jump' | 'double', share: R2, w: R2 = [200, 260]): G => (k) => {
  const pieces: W1Piece[] = [limb(`${k}r0`, { kind: 'start' }, [260, 320])];
  // (Round 11, the designer 11-06: the rungs alternate bough and log, so the thin landings are not all branch)
  seq(n, (j) => pieces.push(limb(`${k}r${j + 1}`, { kind: 'jump', after: `${k}r${j}`, dy: rise, share }, w, j % 2 ? 'branch' : 'log')));
  // (Round 4 FR6 for the set piece: a mid road of low logs under the approach and the run-out only, never past the chain)
  pieces.push(lowLog(`${k}lo0`, `${k}r0`, [0.2, 0.3]), lowLog(`${k}lo1`, `${k}r${n}`, [0.4, 0.5]));
  return { pieces, sockets: [dot(`${k}nomoss`, `${k}r0`, 0.7, 'hint.1-1.noMoss'), petals(`${k}p0`, `${k}lo0`, [0.3, 0.7], 2), petals(`${k}p1`, `${k}lo1`, [0.3, 0.7], 2)], last: `${k}r${n}` };
};
/** #10 */
const canopyRungs = section({
  id: 'w1-canopy-rungs', name: 'canopy rungs', phases: ['ten'], difficulty: 6, needs: ['jump'], ports: ['ledge', 'ledge'], exitDy: -296, window: BOUGH_WINDOW,
  // (NODES §8.7 B2a as amended, 891908b5b: a block rise 130-145 px, past a single's 108 and under the 148 px clamp); 4-5 rungs, wide, for the 10 s inside the 900 px corridor (the porter's note to the designer, 11-05)
  versions: [{ id: 'rungs4', groups: [gRungs(4, HOP_UP, 'jump', [0.4, 0.5], [500, 580])] },
    { id: 'rungs4-top', groups: [(k, after) => { const g = gRungs(4, HOP_UP, 'jump', [0.4, 0.5], [380, 440])(k, after); const top = g.last; g.pieces.push(limb(`${k}t`, { kind: 'jump', after: top, dy: [-6, 6], share: [0.5, 0.6] }, [380, 440])); g.last = `${k}t`; return g; }] }],
  feel: ['1-1'], not: NOT_11, rating: 7,
  source: "W1-NEW-SECTIONS #10: the brief's double chain (1-1.md:21-22); catch boughs 60-120 under each gap are the engine's (floorRoll.catchDrop 90, the planner's); left or right leaning by the mirror",
});
/** #11 */
/** a canopy rest's two roads (Round 4 FR5): the bough `a`, a level gap a hop crosses, the bough `b`; the MID road a low log 136-144 under
 *  `a` with the petals, and a log step 66-74 under the gap's middle, so the mid road climbs back up to `b` (FR3, steps under 88) */
const gRestRoads = (aw: R2, bw: R2, line?: string, rise: R2 = [-2, 2]): G => (k) => {
  const a = limb(`${k}a`, { kind: 'start' }, aw);
  const b = limb(`${k}b`, { kind: 'jump', after: `${k}a`, dy: rise, share: rise[0] < -10 ? [0.45, 0.55] : [0.86, 0.9] }, bw);
  const step = limb(`${k}st`, { kind: 'jump', after: `${k}a`, dy: [66, 74], share: [0.15, 0.2] }, [50, 60], 'log', false);
  return { pieces: [a, b, step, lowLog(`${k}lo`, `${k}a`, [0.15, 0.25])], sockets: [petals(`${k}p`, `${k}lo`, [0.3, 0.7], 3, 140), ...(line ? [dot(`${k}high`, `${k}a`, 0.4, line)] : [])], last: `${k}b` };
};
const highWalk = section({
  id: 'w1-high-walk', name: 'high branch, petals low', phases: ['rest'], difficulty: 1, needs: ['walk'], ports: ['ledge', 'ledge'], window: BOUGH_WINDOW,
  versions: [{ id: 'long', groups: [gRestRoads([420, 460], [380, 440], 'hint.1-1.high')] }, { id: 'short', groups: [gRestRoads([340, 380], [340, 380], 'hint.1-1.high')] }],
  feel: ['1-1', '1-5'], not: NOT_11, rating: 1,
  source: 'W1-NEW-SECTIONS #11: a rest about 2x the beat (C2), a Dot spot; petals low on a low log under the branch (brief :26; the ruling 08c5a2944, trunks dropped)',
});
/** #12 */
const dropdownStair = section({
  id: 'w1-dropdown-stair', name: 'drop and climb back', phases: ['sho'], difficulty: 3, needs: ['jump'], ports: ['ledge', 'ground'], exitDy: 110,
  versions: [2, 3, 4].map((n) => ({ id: `steps${n}`, groups: [(k: string) => {
    const deep = 80; // (the climb out on every version: a walk rise lays at most 80 px, layLocal; the stair's steps share it)
    const a: W1Piece = { key: `${k}a`, shape: 'bank', w: [300, 360], place: { kind: 'start' }, style: 'moss_stone', main: true, landing: true };
    const f = bankW(`${k}f`, a.key, [110 + deep - 2, 110 + deep + 2], [n * 160 + 260, n * 170 + 300]);
    const st = Array.from({ length: n - 1 }, (_, j) => stumpL(`${k}s${j}`, f.key, [1 - (n - 1 - j) * 0.3, 1 - (n - 1 - j) * 0.3 + 0.02].map((v) => Math.max(0, Math.min(1, v))) as R2, [Math.round(((j + 1) * deep) / n) - 2, Math.round(((j + 1) * deep) / n) + 2]));
    const o = bankW(`${k}o`, f.key, [-deep - 2, -deep + 2], [300, 360]);
    return { pieces: [a, f, ...st, o], sockets: [petals(`${k}pf`, f.key, [0.2, 0.4], 2), ...st.map((s) => petals(`p-${s.key}`, s.key, 0.5, 1))], last: o.key };
  }, gStile([40, 76, 40])] })),
  feel: ['1-1', '1-2'], not: NOT_11, rating: 3,
  source: 'W1-NEW-SECTIONS #12: a raised road ends, a drop to the floor, a stump stair (2-4 steps) back up; every dip a one-jump way out',
});
/** #13 (knots: none, no knot art in the W1 kit; a knot sits on wood, never an earth face) */
const knotBank = section({ // (knots: dressing, the ruling 08c5a2944)
 
  id: 'w1-knot-bank', floor: 'hop', name: 'stepped mound', phases: ['ki'], difficulty: 2, needs: ['jump'],
  versions: [2, 3].flatMap((n) => (['step', 'hop'] as const).map((down) => ({ id: `${n}-${down}`, groups: [gRest([160, 200]), times(2, (k: string, after: string | null) => {
    const a = floor(`${k}a`, [260, 300], startOr(after));
    const pieces: W1Piece[] = [a];
    let prev = a.key;
    // (FR9b: each mound step 50-56 up, a wall he hops; at 40-50 he walked up them, no beat in a 4-5 s stretch)
    seq(n, (j) => { const key = `${k}m${j}`; pieces.push(bankW(key, prev, [-56, -50], j === n - 1 ? [300, 360] : [180, 220])); prev = key; });
    const up = n * 53;
    if (down === 'step') { pieces.push(bankW(`${k}d`, prev, [up / 2 - 5, up / 2 + 5], [200, 240]), bankW(`${k}o`, `${k}d`, [up / 2 - 5, up / 2 + 5], [260, 320])); }
    else pieces.push({ ...floor(`${k}o`, [300, 360]), place: { kind: 'jump', after: prev, dy: [up - 5, up + 5], share: [0.25, 0.35] } });
    return { pieces, sockets: [petals(`${k}pt`, prev, [0.3, 0.7], 2), dot(`${k}bank`, `${k}m0`, 0.3, 'hint.1-1.bank')], last: `${k}o` };
  })] }))),
  feel: ['1-1', '1-2'], not: NOT_11, rating: 2,
  source: 'W1-NEW-SECTIONS #13: stepped earth mounds (2-3) up to a top, a step or hop down ("hills and little areas to jump up on", ES 592, 619)',
});
/** #14 */
const floorDash = section({
  id: 'w1-floor-dash', floor: 'hop', name: 'floor and high road', phases: ['ki', 'sho'], difficulty: 2, needs: ['jump'],
  versions: [5, 6, 7].map((n) => ({ id: `road${n}`, groups: [gRest([140, 180]), gLogRoad(n, false, true, true), gRest([200, 240])] })),
  feel: ['1-1', '1-2', '1-3', '1-5'], not: NOT_11, rating: 2,
  source: "W1-NEW-SECTIONS #14: old 1-1's floor (its 0.384) as a section: a high road of thin logs on posts over the floor, hop stumps below, either road walks on; the last post a new height",
});
/** #15: the exit totem an `objective` socket on the end log; the bootprint the held clue's place (R-165.31), reported. No low log (the
 *  lead, 11-05: lowLog assumes a floor road under it and the end has none, so it lay unreachable under the end road: Matt's Roll C petals) */
const quietArrival = section({
  id: 'w1-quiet-arrival', name: 'quiet arrival', phases: ['goal'], difficulty: 1, needs: ['walk'], ports: ['ledge', 'ledge'], window: BOUGH_WINDOW,
  versions: [[240, 280], [520, 600]].map((w, j) => ({ id: j ? 'long' : 'short', groups: [(k: string) => ({ pieces: [limb(`${k}a`, { kind: 'start' }, w as R2), limb(`${k}L`, { kind: 'walk', after: `${k}a`, dy: [0, 0] }, END_LOG, 'log')], sockets: [totem(`${k}L`), clue(`${k}L`)], last: `${k}L` })] })),
  feel: ['1-1'], not: NOT_11, rating: 1,
  source: "W1-NEW-SECTIONS #15: a calm high-branch walk onto the long high log (main's old 1-1 end: 685 px, exit_totem, no shrine); 1-1.md:23; stageClue.ts:16",
});
/** #16 */
const forestEdge = section({
  id: 'w1-forest-edge', floor: 'hop', name: "the forest's edge", phases: ['start'], difficulty: 1, needs: ['walk'], maxPerStage: 1,
  versions: [{ id: 'two', groups: [(k) => { const a = floor(`${k}a`, [640, 700]); const b = bankW(`${k}b`, a.key, [0, 0], [660, 720]); /* (Round 7 (d): one 50-56 px stump on the bank, a soft beat; no ground end) */ const st = stump(`${k}st`, b.key, [0.45, 0.55], [50, 56], LAND); return { pieces: [a, b, st], sockets: [dot(`${k}tip`, a.key, 0.1, 'coach.run'), squirrels(`${k}sq`, a.key, [0.6, 0.7]), petals(`${k}p`, b.key, [0.3, 0.6], 2)], last: b.key }; }] },
    { id: 'three-step', groups: [(k) => { const a = floor(`${k}a`, [440, 480]); const b = bankW(`${k}b`, a.key, [-30, -24], [440, 480]); const c = bankW(`${k}c`, b.key, [24, 30], [440, 480]); return { pieces: [a, b, c], sockets: [dot(`${k}tip`, a.key, 0.1, 'coach.run'), squirrels(`${k}sq`, a.key, [0.6, 0.7]), petals(`${k}p`, b.key, [0.3, 0.6], 2)], last: c.key }; }] }],
  feel: ['1-1'], not: NOT_11, rating: 1,
  source: "W1-NEW-SECTIONS #16: flat home-edge banks, no gaps in the first 1,300 px, the squirrels' spot clear of the spawn, coach.run (brief :19; STAGE-RULES:161)",
});
/** #17 */
const fernBank = section({
  id: 'w1-fern-bank', floor: 'hop', name: 'fern bank', phases: ['rest'], difficulty: 1, needs: ['walk'],
  versions: [[true, [760, 840]], [false, [520, 600]]].map(([step, w]) => ({ id: step ? 'long-step' : 'short', groups: [(k: string, after: string | null) => {
    const a = floor(`${k}a`, w as R2, startOr(after)); const b = bankW(`${k}b`, a.key, [0, 0], [260, 300]);
    // (Round 7 (d), FR9: one 50-56 px stump at about the middle on both versions, a soft beat in the rest)
    const s = [stump(`${k}s`, a.key, step ? [0.6, 0.7] : [0.45, 0.55], [50, 56], LAND)];
    return { pieces: [a, ...s, b], sockets: [decor(`${k}fern`, a.key, [0.1, 0.3]), decor(`${k}seat`, a.key, [0.4, 0.5]), petals(`${k}p`, s.length ? s[0].key : a.key, 0.5, 2)], last: b.key };
  }] })),
  feel: ['1-1'], not: NOT_11, rating: 1,
  source: 'W1-NEW-SECTIONS #17: a long flat bank, ferns and a fallen-log seat (dressing), one low stump step (C2: rest about 2x the beat)',
});
/** #18 (no sky opening, no long view north: 1-4's) */
const clearing = section({
  id: 'w1-clearing', floor: 'hop', name: 'sunlit clearing', phases: ['rest'], difficulty: 1, needs: ['walk'],
  versions: ([[30, 40], [-40, -30]] as R2[]).map((d, j) => ({ id: j ? 'step-up' : 'dip', groups: [(k: string, after: string | null) => {
    const a = floor(`${k}a`, [500, 560], startOr(after)); const m = bankW(`${k}m`, a.key, d, [260, 300]); const b = bankW(`${k}b`, m.key, [-d[1], -d[0]], [500, 560]);
    return { pieces: [a, m, b], sockets: [tip(a.key, 0.5), petals(`${k}p`, b.key, [0.3, 0.6], 2)], last: b.key };
  }] })),
  feel: ['1-1'], not: NOT_11, rating: 1,
  source: 'W1-NEW-SECTIONS #18: two long banks joined by a one-step dip (no gap), a Dot spot (C2; LEDGER-11-02:336)',
});
/** #19 */
const boughBench = section({
  id: 'w1-bough-bench', name: 'high rest', phases: ['rest'], difficulty: 1, needs: ['walk'], ports: ['ledge', 'ledge'], window: BOUGH_WINDOW,
  versions: ([[300, 340], [460, 520]] as R2[]).map((w, j) => ({ id: j ? 'long' : 'short', groups: [gRestRoads([300, 340], w, 'hint.1-1.high')] })),
  feel: ['1-1'], not: NOT_11, rating: 1,
  source: 'W1-NEW-SECTIONS #19: a long thick bough between two plain W1 trunks, after the moment (rulebook §4 rule 3); petals low on a low log under it (the ruling 08c5a2944)',
});
/** #20: floating thin logs at rising heights, each a double up (the ruling 08c5a2944: they replace the too-tall stumps) */
const stumpTowers = section({
  id: 'w1-stump-towers', floor: 'jump', name: 'stump towers', phases: ['ten'], difficulty: 4, needs: ['jump'],
  versions: [4, 5].map((n) => ({ id: `towers${n}`, groups: [gRest([200, 260]), (k: string, after: string | null) => {
    const pieces: W1Piece[] = []; let prev = after!;
    // (C1: each tower a single step up inside the band, a stair of logs; the old 136-140 double between two floating logs left the help no
    //  ground to stand a stair on (the lead's 11-11 5:46 ruling))
    seq(n, (j) => { const key = `${k}t${j}`; pieces.push(limb(key, { kind: 'jump', after: prev, dy: HOP_UP, share: [0.3, 0.4], soft: true }, LAND, 'log')); prev = key; });
    pieces.push({ ...floor(`${k}o`, [300, 360]), place: { kind: 'jump', after: prev, dy: [n * 74 - 4, n * 74 + 4], share: [0.25, 0.35], soft: true } });
    return { pieces, sockets: pieces.slice(0, n).map((p) => petals(`p-${p.key}`, p.key, 0.5, 1)), last: `${k}o` };
  }, gStile([40, 76, 40])] })),
  feel: ['1-1'], not: NOT_11, rating: 5,
  source: 'W1-NEW-SECTIONS #20: towers of rising height, each a double up, the floor road below (soft pits: a fall is a walk back)',
});
/** #21 (C1: out of 1-1, see ROUND6) */
const bounceDouble = section({
  id: 'w1-bounce-double', name: 'bounce, then fly', phases: ['ten'], difficulty: 6, needs: ['double'], uses: ['bounce', 'double'], ports: ['ground', 'ledge'], exitDy: -295,
  versions: ([[-290, -270], [-320, -300]] as R2[]).map((dy, j) => ({ id: j ? 'high' : 'low', groups: [gRest([200, 240]), gStile([40, 76, 100, 76, 40]), (k: string, after: string | null) => {
    // (Round 4 FR1-FR4: the floor road runs on under the high log, its own beat low stumps with the petals)
    const f = floor(`${k}f`, [1200, 1260], startOr(after));
    const L = limb(`${k}L`, { kind: 'over', on: f.key, at: [0.42, 0.44], dy }, [400, 480], 'log');
    const lo = [stump(`${k}lo0`, f.key, [0.5, 0.52], [34, 40], LAND), stump(`${k}lo2`, f.key, [0.64, 0.66], [34, 40], [120, 140]), stump(`${k}lo1`, f.key, [0.8, 0.82], [34, 40], LAND)];
    return { pieces: [f, ...perch(k, f.key, [0.12, 0.16]), L, ...lo], sockets: [...lo.map((q) => petals(`p-${q.key}`, q.key, 0.5, 1)), find(`${k}find`, L.key)], last: L.key };
  }] })),
  feel: ['1-5'], not: NOT_11, rating: 6,
  source: 'W1-NEW-SECTIONS #21: a perched mushroom\'s bounce, then a double onto a high log road (LEDGER-11-02:33); a stump stile before it for the 10 s; the high log floats (platforms may)',
});
/** #22 */
const canopyWeave = section({
  id: 'w1-canopy-weave', name: 'canopy weave', phases: ['ketsu'], difficulty: 5, needs: ['jump'], ports: ['ledge', 'ledge'], window: BOUGH_WINDOW,
  versions: [5, 6].map((n) => ({ id: `high${n}`, groups: [(k: string) => {
    const pieces: W1Piece[] = [limb(`${k}a`, { kind: 'start' }, [260, 320])];
    let hi = `${k}a`, mid = `${k}a`;
    seq(n, (j) => {
      pieces.push(limb(`${k}h${j}`, { kind: 'jump', after: hi, dy: j ? [-3, 3] : HOP_UP, share: j ? [0.5, 0.6] : [0.4, 0.5] }, [200, 240])); // (C1: singles, inside the band)
      pieces.push(limb(`${k}m${j}`, { kind: 'jump', after: mid, dy: j ? [-3, 3] : [25, 35], share: [0.45, 0.55] }, [200, 240], 'branch', false));
      hi = `${k}h${j}`; mid = `${k}m${j}`;
    });
    pieces.push(limb(`${k}o`, { kind: 'jump', after: hi, dy: [70, 78], share: [0.3, 0.4] }, [260, 320]));
    pieces.push(lowLog(`${k}lo`, `${k}m0`, [0.2, 0.3]));
    return { pieces, sockets: [petals(`${k}p`, `${k}lo`, [0.3, 0.7], 2), find(`${k}find`, hi)], last: `${k}o` };
  }] })),
  feel: ['1-1'], not: NOT_11, rating: 6,
  source: 'W1-NEW-SECTIONS #22: two roads in the boughs (high, mid, about 100 px apart) that rejoin (LEDGER-11-04 part1:317); catch boughs are the engine\'s',
});
/** #23: the exit totem an `objective` socket (stageGenerator.ts:2136 on main); the bootprint reported (R-165.31) */
const sunlitLog = section({
  id: 'w1-sunlit-log', name: 'onto the high log', phases: ['goal'], difficulty: 1, needs: ['walk'], ports: ['ledge', 'ledge'], exitDy: -60, window: BOUGH_WINDOW,
  versions: [1, 2].map((n) => ({ id: `steps${n}`, groups: [(k: string) => {
    const pieces: W1Piece[] = [limb(`${k}a`, { kind: 'start' }, [260, 300])];
    if (n === 2) pieces.push(limb(`${k}s`, { kind: 'walk', after: `${k}a`, dy: [-32, -28] }, [200, 240]));
    pieces.push(limb(`${k}L`, { kind: 'walk', after: pieces[pieces.length - 1].key, dy: n === 2 ? [-32, -28] : [-62, -58] }, END_LOG, 'log'), lowLog(`${k}lo`, `${k}a`, [0.2, 0.3]));
    return { pieces, sockets: [totem(`${k}L`), clue(`${k}L`), petals(`${k}p`, `${k}lo`, [0.3, 0.7], 2)], last: `${k}L` };
  }] })),
  feel: ['1-1'], not: NOT_11, rating: 1,
  source: "W1-NEW-SECTIONS #23: a bough walk-on (one or two steps) to the long high log with the exit totem (stageGenerator.ts:2136 on main; a 685 px log at y 580, eraRoll layout 1); 1-1.md:23",
});
/** #24 */
const stumpDescent = section({
  id: 'w1-stump-descent', floor: 'hop', name: 'stumps down', phases: ['sho'], difficulty: 3, needs: ['jump'],
  versions: [[3, 2], [4, 3]].map(([dn, up]) => ({ id: `${dn}-${up}`, groups: [gRest([140, 180]), (k: string, after: string | null) => {
    const a = floor(`${k}a`, [200, 240], startOr(after));
    const t = bankW(`${k}t`, a.key, [-80, -76], [200, 240]);
    const f = bankW(`${k}f`, t.key, [76, 80], [(dn + up) * 230 + 200, (dn + up) * 250 + 240]);
    const tot = dn + up;
    const downs = Array.from({ length: dn }, (_, j) => stumpL(`${k}d${j}`, f.key, [j / tot + 0.01, j / tot + 0.03], [80 - j * (60 / dn) - 3, 80 - j * (60 / dn) + 3]));
    const ups = Array.from({ length: up }, (_, j) => { const pk = `${k}p${j}`; return [post(pk, f.key, [(dn + j + 0.5) / tot, (dn + j + 0.5) / tot + 0.02], [46 + j * 30, 50 + j * 30]), logOn(`${k}l${j}`, pk)]; }).flat();
    return { pieces: [a, t, f, ...downs, ...ups], sockets: [...downs, ...ups.filter((p) => p.style === 'log')].map((p) => petals(`p-${p.key}`, p.key, 0.5, 1)), last: f.key };
  }, gRest([200, 240])] })),
  feel: ['1-1'], not: NOT_11, rating: 3,
  source: 'W1-NEW-SECTIONS #24: stumps stepping down to the floor, then a log jam (thin logs on posts) back up (old 1-1 floor; the log road rules)',
});
/** #25 */
const moundLog = section({
  id: 'w1-mound-log', floor: 'hop', name: 'log over the mound', phases: ['ki'], difficulty: 2, needs: ['jump'],
  versions: [2, 3].map((n) => ({ id: `steps${n}`, groups: [gRest([160, 200]), times(2, (k: string, after: string | null) => {
    // (a wall stump on the start floor too: laid mirrored, this side is the way down, and its drops carry no beat)
    const a = floor(`${k}a`, [340, 400], startOr(after));
    const pieces: W1Piece[] = [a, stumpL(`${k}wa`, a.key, [0.4, 0.5], [50, 56])]; let prev = a.key;
    // (FR9b: each mound step 50-56 up, a wall he hops, as #13)
    seq(n, (j) => { const key = `${k}m${j}`; pieces.push(bankW(key, prev, [-56, -50], j === n - 1 ? [380, 440] : [180, 220])); prev = key; });
    const top = prev, up = n * 53;
    pieces.push(limb(`${k}L`, { kind: 'over', on: top, at: [0.15, 0.25], dy: [-24, -24] }, [200, 240], 'log', false));
    // (and a 50-56 px stump on the floor below, a wall he hops: the way down and on was 4-5 s with no beat, the quiet line)
    pieces.push(bankW(`${k}d`, top, [up / 2 - 5, up / 2 + 5], [200, 240]), bankW(`${k}o`, `${k}d`, [up / 2 - 5, up / 2 + 5], [340, 400]), stumpL(`${k}w`, `${k}o`, [0.5, 0.6], [50, 56]));
    return { pieces, sockets: [petals(`${k}pl`, `${k}L`, [0.3, 0.7], 2), dot(`${k}bank`, `${k}m0`, 0.3, 'hint.1-1.bank')], last: `${k}o` };
  })] })),
  feel: ['1-1'], not: NOT_11, rating: 2,
  source: 'W1-NEW-SECTIONS #25: a stepped earth mound with a thin log lying across its top as a short high road (ES 619; the log rules)',
});
/** #26 (dressing w1Fern and w1LeafLitter only: no mushroom-shaped dressing, D38) */
const logWalk = section({
  id: 'w1-log-walk', floor: 'hop', name: 'along the fallen log', phases: ['rest'], difficulty: 1, needs: ['walk'],
  versions: [false, true].map((two) => ({ id: two ? 'two-logs' : 'one-log', groups: [(k: string, after: string | null) => {
    const a = floor(`${k}a`, [1000, 1100], startOr(after));
    const L: W1Piece = { key: `${k}L`, shape: 'block', w: two ? [520, 580] : [640, 720], place: { kind: 'on', on: a.key, at: [0.1, 0.15], h: [50, 56] }, style: 'log', landing: true };
    const L2: W1Piece[] = two ? [{ key: `${k}L2`, shape: 'block', w: [240, 280], place: { kind: 'on', on: a.key, at: [0.85, 0.9], h: [50, 56] }, style: 'log', landing: true }] : [];
    const s = stump(`${k}s`, a.key, [0.98, 1], [34, 40], LAND);
    const b = bankW(`${k}b`, a.key, [0, 0], [240, 280]);
    return { pieces: [a, L, ...L2, s, b], sockets: [{ ...decor(`${k}fern`, a.key, [0.05, 0.1]), allow: ['w1Fern'] }, { ...decor(`${k}lit`, a.key, [0.6, 0.7]), allow: ['w1LeafLitter'] }, petals(`${k}p`, s.key, 0.5, 2)], last: b.key };
  }] })),
  feel: ['1-1'], not: NOT_11, rating: 1,
  source: 'W1-NEW-SECTIONS #26: a long fallen log lying ON the floor, a calm walk along its top; ferns and leaf litter; petals low on a stump (C2; LABELS §1, §5; D38)',
});
/** #27: thin logs that float (platforms may, the ruling 08c5a2944), each a double from the last */
const stiltLogs = section({
  id: 'w1-stilt-logs', floor: 'jump', name: 'high stump logs', phases: ['ten'], difficulty: 4, needs: ['jump'],
  versions: [4, 5].map((n) => ({ id: `logs${n}`, groups: [gRest([200, 260]), (k: string, after: string | null) => {
    const pieces: W1Piece[] = []; let prev = after!;
    // (C1: single steps up, as #20)
    seq(n, (j) => { const key = `${k}l${j}`; pieces.push(limb(key, { kind: 'jump', after: prev, dy: HOP_UP, share: [0.4, 0.5], soft: true }, [180, 240], 'log')); prev = key; });
    pieces.push({ ...floor(`${k}o`, [300, 360]), place: { kind: 'jump', after: prev, dy: [n * 74 - 4, n * 74 + 4], share: [0.25, 0.35], soft: true } });
    return { pieces, sockets: pieces.slice(0, n).map((p) => petals(`p-${p.key}`, p.key, 0.5, 1)), last: `${k}o` };
  }, gStile([40, 76, 40])] })),
  feel: ['1-1'], not: NOT_11, rating: 5,
  source: 'W1-NEW-SECTIONS #27: thin logs at rising heights, each a double from the last, the floor road below (the 12:51 and 3:40 log rules)',
});
/** #28 */
const twoAnswers = section({
  id: 'w1-two-answers', floor: 'hop', name: 'two answers', phases: ['ten'], difficulty: 6, needs: ['double'], uses: ['double'],
  // (C1: the gap 252-262 on Normal, the first of the three a practice gap (a floor and a step out under it); Easy's twin a single gap)
  versions: [true, false].map((m) => ({ id: m ? 'mushroom' : 'double', ...((): { groups: G[]; easy: G[] } => { const g = (easy: boolean): G[] => [gRest([200, 240]), times(3, (k: string, after: string | null) => {
    const f = floor(`${k}f`, [500, 560], startOr(after));
    const first = k.endsWith('0');
    const o = easy ? softGap(`${k}o`, f.key, [300, 360], [0.5, 0.6]) : first ? practiceGap(`${k}o`, f.key, [300, 360]) : softGap(`${k}o`, f.key, [300, 360], [0.85, 0.89], 'double');
    const lo2 = stump(`${k}l2`, `${k}o`, [0.6, 0.7], [34, 40], [120, 140]);
    const lo = stump(`${k}l0`, f.key, [0.25, 0.3], [34, 40], [120, 140]);
    return { pieces: [f, lo, ...(m ? perch(k, f.key, [0.7, 0.75]) : []), o, lo2], sockets: [{ id: `${k}arc`, role: 'arc', on: o.key, t: 0 }, petals(`p-${lo.key}`, lo.key, 0.5, 1)], last: o.key };
  })]; return { groups: g(false), easy: g(true) }; })() })),
  feel: ['1-1'], not: NOT_11, rating: 6,
  source: 'W1-NEW-SECTIONS #28: a gap past a single jump; a perched mushroom on the near bank as the other way across (LEDGER-11-02:33)',
});
/** #29 (no rope: the span is a thick log held at both ends by the top boughs, Round 3 story fix) */
const boughLog = section({
  id: 'w1-bough-log', name: 'bough stair and log span', phases: ['ketsu'], difficulty: 4, needs: ['jump'], ports: ['ledge', 'ledge'], exitDy: -222, window: BOUGH_WINDOW,
  // (NODES §8.7 B2a as amended, 891908b5b: a block rise 130-145 px, past a single's 108 and under the 148 px clamp); 4-5 boughs, wide, inside the corridor
  versions: [4].flatMap((n) => [true, false].map((span) => ({ id: `${n}-${span ? 'log' : 'bough'}`, groups: [(k: string) => {
    const pieces: W1Piece[] = [limb(`${k}b0`, { kind: 'start' }, [240, 280])];
    // (C1: single steps up the boughs, inside the band)
    seq(n - 1, (j) => pieces.push(limb(`${k}b${j + 1}`, { kind: 'jump', after: `${k}b${j}`, dy: HOP_UP, share: [0.4, 0.5] }, [520, 600])));
    const top = `${k}b${n - 1}`;
    pieces.push(span ? limb(`${k}S`, { kind: 'walk', after: top, dy: [0, 0] }, [380, 440], 'log') : limb(`${k}S`, { kind: 'jump', after: top, dy: [-10, 0], share: [0.5, 0.6] }, [200, 240]));
    pieces.push(limb(`${k}o`, { kind: 'walk', after: `${k}S`, dy: [0, 0] }, [200, 240]), lowLog(`${k}lo`, `${k}b0`, [0.2, 0.3]));
    return { pieces, sockets: [petals(`${k}p`, `${k}lo`, [0.3, 0.7], 2)], last: `${k}o` };
  }] }))),
  feel: ['1-1'], not: NOT_11, rating: 5,
  source: 'W1-NEW-SECTIONS #29: boughs stepping up two plain W1 trunks, then a thick log held at both ends by the top boughs (LABELS §1; Round 3: no rope)',
});
/** #30 */
const lastStepUp = section({
  id: 'w1-last-step-up', name: 'the last step up', phases: ['goal'], difficulty: 1, needs: ['jump'], ports: ['ledge', 'ledge'], exitDy: -75, window: BOUGH_WINDOW,
  versions: [false, true].map((walk) => ({ id: walk ? 'walk-first' : 'hop', groups: [(k: string) => {
    const pieces: W1Piece[] = [limb(`${k}a`, { kind: 'start' }, [240, 280])];
    if (walk) pieces.push(limb(`${k}w`, { kind: 'walk', after: `${k}a`, dy: [0, 0] }, [200, 240]));
    pieces.push(limb(`${k}L`, { kind: 'jump', after: pieces[pieces.length - 1].key, dy: [-80, -70], share: [0.2, 0.3] }, END_LOG, 'log'), lowLog(`${k}lo`, `${k}a`, [0.2, 0.3]));
    return { pieces, sockets: [totem(`${k}L`), clue(`${k}L`), petals(`${k}p`, `${k}lo`, [0.3, 0.7], 2)], last: `${k}L` };
  }] })),
  feel: ['1-1'], not: NOT_11, rating: 1,
  source: "W1-NEW-SECTIONS #30: one easy hop from a lower bough onto the long high log with the exit totem (main's 1-1 end; 1-1.md:23)",
});
/** the planner's ask (4:27 PM): a seed perch, a mushroom on a perch and the seed's socket more than 200 px up past a double
 *  (mixer/post.ts placeSeed's bough, DOUBLE_RISE + 50 over the perch). A bough section, so it keeps the bough window */
const seedPerch = section({
  id: 'w1-seed-perch', name: 'the seed perch', phases: ['sho', 'ten'], difficulty: 4, needs: ['double'], uses: ['bounce', 'double'], maxPerStage: 1, window: BOUGH_WINDOW,
  versions: [{ id: 'perch', groups: [gRest([200, 240]), (k, after) => {
    const f = floor(`${k}f`, [640, 720], startOr(after));
    // (Round 11: the seed's perch is a log, floating: Matt's rule, walked-on logs may float)
    const b: W1Piece = { ...bough(`${k}b`, `${k}st`, PAST_PERCH, [-(Math.round(DOUBLE_RISE) + 50), -(Math.round(DOUBLE_RISE) + 50)], [200, 240]), style: 'log' };
    // (FR9b: a 50-56 px stump on the floor past the perch, a wall he hops: the perch itself is under 50, no beat, and the floor ran 4-5.6 s quiet)
    return { pieces: [f, ...perch(k, f.key, [0.3, 0.35], [170, 176]), b, stumpL(`${k}w`, f.key, [0.74, 0.8], [50, 56])], sockets: [{ id: 'seed', role: 'find', on: b.key, t: 0.5, dn: 70 }], last: f.key };
  }, gStile([40, 76, 100, 76, 40])] },
  // (Round 6, engine-spec fc34a6f44: the low route's version, climbing into the perch from the floor (c c, then the bounce) and back down
  // the same height, so it fits a low route; the seed's promise kept (stage11: more than 200 px up, past a double, a mushroom within 260))
  { id: 'low', groups: [gRest([200, 240]), (k, after) => {
    const c1 = bankW(`${k}c1`, after!, [-78, -62], [260, 320]), c2 = bankW(`${k}c2`, c1.key, [-78, -62], [640, 720]);
    // (Round 11: the seed's perch is a log, floating: Matt's rule, walked-on logs may float)
    const b: W1Piece = { ...bough(`${k}b`, `${k}st`, PAST_PERCH, [-(Math.round(DOUBLE_RISE) + 50), -(Math.round(DOUBLE_RISE) + 50)], [200, 240]), style: 'log' };
    const n1 = bankW(`${k}n1`, c2.key, [62, 78], [260, 320]), n2 = bankW(`${k}n2`, n1.key, [62, 78], [360, 420]);
    return { pieces: [c1, c2, ...perch(k, c2.key, [0.3, 0.35], [170, 176]), b, stumpL(`${k}w`, c2.key, [0.74, 0.8], [50, 56]), n1, n2, stumpL(`${k}w2`, n2.key, [0.45, 0.55], [50, 56])], sockets: [{ id: 'seed', role: 'find', on: b.key, t: 0.5, dn: 70 }, petals(`${k}p`, c1.key, [0.3, 0.6], 1)], last: n2.key };
  }, gStile([40, 76, 40])] }],
  feel: ['1-1'], not: NOT_11, rating: 4,
  source: "the planner's seed perch (4:27 PM): mixer/post.ts placeSeed (a bough DOUBLE_RISE + 50 over the perch, reached by the bounce and a double)",
});

// ───────────────────────────── Round 4, part 2 (engine-spec 0164dff4f): the pool cells that bind ─────────────────────────────
// Each version is built from its rhythm string, beat by beat (BEATS), so versions differ in kind or order, never only in size. The block
// beats (NODES §8.7) are their own letters: K a jump block (a 66-78 px bank face, no step beside it, then down), L a log face 62-80 px
// on the floor, D a double rise block onto a bank (136-140 px, double place), B a bounce lip (the mushroom on the floor, lip 200-220 px:
// lays short until the planner's bounce place, the named exitDy failure). Lower case are the designer's beats.
const BEATS: Record<string, G> = {
  w: gRest([260, 320]),
  h: gLogHop(),
  j: gDip(),
  /** a double TEST gap, Normal only (252-262, a level block: a miss is set back on the take-off); every version with one names its Easy twin */
  d: gDoubleGaps([[0.85, 0.89]]),
  /** the PRACTICE double gap before a test (C1): 252-262 over a soft pit with a floor and a step out, a miss is a fall and a climb on */
  t: (k, after) => { const p = practiceGap(`${k}t`, after!, [220, 260]); return { pieces: [p], sockets: [{ id: `${k}arc`, role: 'arc', on: p.key, t: 0 }], last: p.key }; },
  /** a climb step: a bank one hop up (62-78 px), the route stays up */
  c: (k, after) => { const b = bankW(`${k}c`, after!, [-78, -62], [260, 320]); return { pieces: [b], sockets: [petals(`${k}p`, b.key, [0.3, 0.6], 1)], last: b.key }; },
  /** a very low root (24-36 px) on the floor: the arrival's hop */
  r: (k, after) => { const f = floor(`${k}f`, [400, 460], startOr(after)); const q = stump(`${k}r`, f.key, [0.45, 0.55], [24, 36], LAND); return { pieces: [f, q], sockets: [petals(`${k}p`, q.key, 0.5, 1)], last: f.key }; },
  /** a low log lying on the floor (30-34 px) */
  l: (k, after) => { const f = floor(`${k}f`, [420, 500], startOr(after)); const q: W1Piece = { key: `${k}l`, shape: 'block', w: [200, 240], place: { kind: 'on', on: f.key, at: [0.4, 0.5], h: [50, 56] }, style: 'log', landing: true }; return { pieces: [f, q], sockets: [petals(`${k}p`, q.key, 0.5, 1)], last: f.key }; },
  /** a jump block: a bank face 66-78 px with no lower step beside it, the floor ending at it (B1), then a step back down */
  K: (k, after) => { const u = bankW(`${k}u`, after!, [-78, -66], [300, 360]); const dn = bankW(`${k}n`, u.key, [66, 78], [240, 280]); return { pieces: [u, dn], sockets: [petals(`${k}p`, u.key, [0.4, 0.7], 2)], last: dn.key }; },
  /** a jump block of a log: a fallen log 62-80 px tall across the floor, nothing beside it */
  L: (k, after) => { const f = floor(`${k}f`, [620, 700], startOr(after)); const q: W1Piece = { key: `${k}L`, shape: 'block', w: [220, 260], place: { kind: 'on', on: f.key, at: [0.4, 0.5], h: [62, 80] }, style: 'log', landing: true }; return { pieces: [f, q], sockets: [petals(`${k}p`, q.key, [0.3, 0.7], 2)], last: f.key }; },
  /** a double rise block onto a bank (bands.md §5: Normal 136-140, Easy 128-132), its face at the end of a flat floor (the help's stair room) */
  D: (k, after) => riseFace(k, after, false, [320, 380]),
  /** the double's TEACH rise (C1): the D face straight off the rest before it (a 'w', flat 260-320: the stair's room), so the test after
   *  it falls inside the 1,500 px the teach promise reads */
  T: (k, after) => riseFace(k, after, false, [280, 320], false),
  /** a step down a bank (62-78 px) */
  n: (k, after) => { const b = bankW(`${k}n`, after!, [62, 78], [260, 320]); return { pieces: [b], sockets: [], last: b.key }; },
  /** logs that float (platforms may): a double rise block (136-140 px, double place), a climb step (62-78), a level gap a single crosses */
  // (C1: a fallen trunk, its face on the ground (the D band: a block 50 px or taller), a stair's room before it; a floating thin log at the
  //  thin band (128-134) left a hole under it that w1Pits reads as a floorless pit, and between two floating logs no ground for the stair)
  E: (k, after) => { const g = riseFace(k, after, false, [300, 360]); g.pieces[g.pieces.length - 1].style = 'log'; return g; },
  e: (k, after) => { const q = limb(`${k}e`, { kind: 'jump', after: after!, dy: [-78, -62], share: [0.3, 0.4], soft: true }, [280, 340], 'log'); return { pieces: [q], sockets: [], last: q.key }; },
  g: (k, after) => { const q = limb(`${k}g`, { kind: 'jump', after: after!, dy: [-6, 6], share: [0.5, 0.6], soft: true }, [300, 360], 'log'); return { pieces: [q], sockets: [], last: q.key }; },
  /** Round 5's beats: a bank a double away, level (X) or a step DOWN (Y) across (share 0.86-0.9); a floor piece with a mushroom on it (m);
   *  a bank at nearly a double's full reach, 90-100 up (Q) or level (q); a log or a bough over the last floor, bounce-and-double high (Z, z) */
  // (C1: X a Normal double TEST gap, 252-262 (its Easy twin lays 'a'); Y a single jump down a step (a double gap down is no lesson: one jump
  //  carries further downhill than the level band it is judged on))
  X: (k, after) => { const b: W1Piece = { key: `${k}X`, shape: 'bank', w: [300, 360], place: { kind: 'double', after: after!, dy: [0, 0], gapPx: DOUBLE_TEST, soft: true }, style: 'moss_stone', main: true, landing: true, block: 'double' }; return { pieces: [b], sockets: [petals(`${k}p`, b.key, [0.4, 0.6], 1)], last: b.key }; },
  Y: (k, after) => { const b: W1Piece = { key: `${k}Y`, shape: 'bank', w: [300, 360], place: { kind: 'jump', after: after!, dy: [62, 70], share: [0.5, 0.6], soft: true }, style: 'moss_stone', main: true, landing: true }; return { pieces: [b], sockets: [petals(`${k}p`, b.key, [0.4, 0.6], 1)], last: b.key }; },
  m: (k, after) => { const f = floor(`${k}f`, [380, 440], startOr(after)); return { pieces: [f, mushroom(`${k}m`, f.key, faceAt([380, 440]))], sockets: [petals(`${k}p`, f.key, [0.2, 0.4], 1)], last: f.key }; },
  Q: (k, after) => { const b: W1Piece = { key: `${k}Q`, shape: 'bank', w: [300, 360], place: { kind: 'double', after: after!, dy: [-100, -90], share: [0.95, 1], soft: true }, style: 'moss_stone', main: true, landing: true }; return { pieces: [b], sockets: [petals(`${k}p`, b.key, [0.4, 0.6], 1)], last: b.key }; },
  q: (k, after) => { const b: W1Piece = { key: `${k}q`, shape: 'bank', w: [300, 360], place: { kind: 'double', after: after!, dy: [-4, 4], share: [0.95, 1], soft: true }, style: 'moss_stone', main: true, landing: true }; return { pieces: [b], sockets: [], last: b.key }; },
  // (C1: the log or bough starts at the mushroom floor's end, so the mushroom (m) stands 25-55 px from its near end: a bounce lip's place)
  Z: (k, after) => { const q = limb(`${k}Z`, { kind: 'over', on: after!, at: [1, 1], dy: BOUNCE_LIP }, [340, 400], 'log'); return { pieces: [q], sockets: [petals(`${k}p`, q.key, [0.4, 0.6], 1)], last: q.key }; },
  z: (k, after) => { const q = limb(`${k}z`, { kind: 'over', on: after!, at: [1, 1], dy: BOUNCE_LIP }, [340, 400]); return { pieces: [q], sockets: [], last: q.key }; },
  /** a level gap jump (the designer's (g), 11-06): a short soft gap, 0.4-0.5 of a single's reach, onto a bank at the same height (±6 px),
   *  nothing to land on in the gap and no stump: the climb's step that is not a step down (V18) */
  a: (k, after) => { const b: W1Piece = { key: `${k}a`, shape: 'bank', w: [300, 360], place: { kind: 'jump', after: after!, dy: [-6, 6], share: [0.4, 0.5], soft: true }, style: 'moss_stone', main: true, landing: true }; return { pieces: [b], sockets: [petals(`${k}p`, b.key, [0.4, 0.6], 1)], last: b.key }; },
  /** a bough a single away, level (the bough form of g) */
  /** (C1) a log a step DOWN from a log (70-78 px, a single), and a floor a hop down (50-60 px) from it: a run-out back to the ground with
   *  no earth floating in the air (the old 'n' steps after a log laid banks over nothing) */
  o: (k, after) => { const q = limb(`${k}o`, { kind: 'jump', after: after!, dy: [70, 78], share: [0.4, 0.5] }, [260, 320], 'log'); return { pieces: [q], sockets: [], last: q.key }; },
  F: (k, after) => { const f: W1Piece = { ...floor(`${k}F`, [300, 360]), place: { kind: 'jump', after: after!, dy: [50, 60], share: [0.3, 0.4], soft: true } }; return { pieces: [f], sockets: [petals(`${k}p`, f.key, [0.3, 0.6], 1)], last: f.key }; },
  G: (k, after) => { const q = limb(`${k}G`, { kind: 'jump', after: after!, dy: [-6, 6], share: [0.5, 0.6], soft: true }, [300, 360]); return { pieces: [q], sockets: [], last: q.key }; },
  /** FR9 (engine-spec af831c63e): a floor hop that is a wall, 50 px (World 1's painted rock height), on a short floor (no plain run over 4 s) */
  H: (k, after) => { const f = floor(`${k}f`, [300, 360], startOr(after)); const r = stump(`${k}r`, f.key, [0.45, 0.55], [50, 50], [120, 160]); return { pieces: [f, r], sockets: [petals(`${k}p`, r.key, 0.5, 1)], last: f.key }; },
  /** Round 6 #63 (b D): a floor mushroom at the near lip of a soft dip 120-160 px wide, the far bank 240-260 px over the floor: the bounce,
   *  then the air jump, lands it (a double from the floor, 185, can't): a bounce block, sheer (B7) */
  U: (k, after) => { const f = floor(`${k}f`, [360, 420], startOr(after)); const b: W1Piece = { key: `${k}U`, shape: 'bank', w: [300, 360], place: { kind: 'double', after: f.key, dy: BOUNCE_LIP, share: [0.52, 0.7], soft: true }, style: 'moss_stone', main: true, landing: true, block: 'bounce', from: `${k}m` }; return { pieces: [f, mushroom(`${k}m`, f.key, [0.86, 0.9]), b], sockets: [petals(`${k}p`, b.key, [0.4, 0.7], 2)], last: b.key }; },
  /** Round 6 #64 (b D): a floor mushroom 60-90 px before a fallen log 220-260 wide whose top is 240-260 over the floor: he lands on the log */
  // (C1: the log's face at the floor's end (gapPx 0) and the mushroom 25-55 px from it; its top 237-245 over the floor, bands.md §5)
  V: (k, after) => { const f = floor(`${k}f`, [380, 420], startOr(after)); const g: W1Piece = lip({ ...bankW(`${k}V`, f.key, BOUNCE_LIP, [220, 260]), style: 'log' }, `${k}m`); return { pieces: [f, mushroom(`${k}m`, f.key, faceAt([380, 420])), g], sockets: [petals(`${k}p`, g.key, [0.4, 0.7], 2)], last: g.key }; },
  /** a bounce block: the mushroom on the floor 25-55 px before a bank lip 237-245 px up (bands.md §5, C1), the route stays up */
  B: (k, after) => { const f = floor(`${k}f`, [360, 420], startOr(after)); const L = bankW(`${k}B`, f.key, BOUNCE_LIP, [300, 360]); return { pieces: [f, mushroom(`${k}m`, f.key, faceAt([360, 420])), lip(L, `${k}m`)], sockets: [petals(`${k}p`, L.key, [0.3, 0.6], 2)], last: L.key }; },
};
const fromRhythm = (r: string): G[] => r.split(' ').map((t) => { const g = BEATS[t]; if (!g) throw new Error(`w1.ts: no beat '${t}'`); return g; });
/** a section from rhythm strings: versions { id: [built beats, the designer's rhythm] } */
function rhythmic(o: Omit<Parameters<typeof section>[0], 'versions'> & { versions: Record<string, [string, string] | [string, string, string]> }): W1Section {
  const { versions, ...rest } = o;
  // (a third string: the version's Easy twin, C1: Easy has no double gap, so a version with 't' or 'd' lays this in its place on Easy)
  const sec = section({ ...rest, versions: Object.entries(versions).map(([id, [built, , easy]]) => ({ id, groups: fromRhythm(built), ...(easy ? { easy: fromRhythm(easy) } : {}) })) });
  return { ...sec, rhythms: Object.fromEntries(Object.entries(versions).map(([id, [, r]]) => [id, r])) };
}

/** #31 (teach jump): shown on hops, the check a bank face (K), then the gaps */
const stepStonesTeach = rhythmic({
  id: 'w1-step-stones-teach', floor: 'hop', name: 'the first stones', phases: ['ki'], difficulty: 2, needs: ['jump'], teaches: 'jump',
  versions: { a: ['w h h K j w', 'w h h j w'], b: ['w j w K j j j', 'w j w j j'], c: ['w h j K h j', 'w h j h j'] },
  feel: ['1-1'], not: NOT_11, rating: 2,
  source: "Round 4 #31 (designer, 0164dff4f): 1-1's teach run then jump (CoachOverlay.tsx:10); the jump block a 66-78 px bank face, no step beside (B1)",
});
/** #32 (teach jump): low logs, the check a log face (L) */
const logTeach = rhythmic({
  id: 'w1-log-teach', floor: 'hop', name: 'up the first log', phases: ['ki'], difficulty: 2, needs: ['jump'], teaches: 'jump',
  versions: { a: ['w l w L j j', 'w h w j j'], b: ['w j L l l l', 'w j h h'] },
  feel: ['1-1'], not: NOT_11, rating: 2,
  source: 'Round 4 #32: old 1-1\'s logs (LABELS §1 solid log); the jump block a fallen log face 62-80 px with no step beside (B1)',
});
/** #33 (teach double): the double gap past a single, share 0.85+ (the Easy rise version is the planner's, no per-setting version) */
const dipDoubleTeach = rhythmic({
  id: 'w1-dip-double-teach', floor: 'hop', name: 'the wide dip', phases: ['ki'], difficulty: 3, needs: ['double'], teaches: 'double', exitDy: -138,
  // (C1: the rise teaches (T), then the practice gap (t) and the test (d) on Normal; Easy's twin hops the same places (a))
  versions: { a: ['w T t d w j w', 'D t d j', 'w T a a w j w'], b: ['w T t d j j w', 'D t d j j', 'w T a a j j w'] },
  feel: ['1-1'], not: NOT_11, rating: 3,
  source: 'Round 4 #33: R2 (3:11); NODES §8.7 (a gap at share 0.85+, back-only pit: the planner\'s block rule)',
});
/** #34 (teach double): the rise block onto a tall bank */
const bankDoubleTeach = rhythmic({
  id: 'w1-bank-double-teach', floor: 'hop', name: 'the tall bank', phases: ['ki'], difficulty: 3, needs: ['double'], teaches: 'double', exitDy: -276,
  // (C1: the teach rise first (T), the practice gap and the test on Normal (Easy's twin hops), then a second rise (D))
  versions: { a: ['w T t d w h D w', 'D t d h D', 'w T a a w h D w'], b: ['w T t d h h D h', 'D t d h h D', 'w T a a h h D h'] },
  feel: ['1-1'], not: NOT_11, rating: 3,
  source: 'Round 4 #34: NODES §8.7 B2a (a rise block 136-140 px onto a bank, the floor ending at its face)',
});
/** #35 (teach bounce): the mushroom on the floor, the lip 200-220 px (the bounce place, its rise from the mushroom's cap) */
const mushroomBankTeach = rhythmic({
  id: 'w1-mushroom-bank-teach', floor: 'hop', name: 'the bounce bank', phases: ['sho'], difficulty: 2, teaches: 'bounce', exitDy: -241,
  versions: { a: ['w h h B w h', 'w b w h'], b: ['w h h h B j', 'w h b j'] }, // (more hops before the lip: 10 s by repetition)
  feel: ['1-1'], not: NOT_11, rating: 2,
  source: "Round 4 #35: the brief's first lift (1-1.md:20); B3 as amended (the mushroom on the floor, lip 200-220)",
});
/** #46 (arrive): flat and safe, no ground ends in the first 1,300 px, very low roots; the squirrels' spot */
const morningPath = rhythmic({
  id: 'w1-morning-path', floor: 'hop', name: 'the morning path', phases: ['start'], difficulty: 1, needs: ['walk'], maxPerStage: 1,
  versions: { a: ['w w r w', 'w w h w'], b: ['w r w r', 'w h w h'] },
  feel: ['1-1'], not: NOT_11, rating: 1,
  source: 'Round 4 #46: the brief\'s start (the squirrels: 1-1.md must); STAGE-RULES:161 (flat and safe)',
});
// (the arrival's squirrels sit on its first floor, clear of the spawn: the brief's must; the start's Dot line, coach.run)
morningPath.sockets = [squirrels('sq', 'in', [0.6, 0.7]), dot('tip', 'in', 0.1, 'coach.run')];
/**
 * A fork on the floor road (Round 4's FR1-FR4): one floor `f` the whole length is the LOW road, with its own beats standing on it (low
 * stumps h, mushrooms b, low logs l, a low stair c: each step at most 88 px) and the petals; the HIGH road's pieces stand over it (a
 * bough or log `over` f), the lowest 180 px up so a 46 px stump under it leaves 110 px of head room, the find on its last piece. The high
 * road rejoins by dropping back to the floor. Beats are placed by their share along f (`at`), so both roads span the same stretch.
 */
type LowBeat = ['h' | 'b' | 'l' | 'c', number, number?];
type HighBeat = { at: number; dy: number; w?: R2; mush?: boolean; style?: 'branch' | 'log' };
const gFork = (fw: R2, low: LowBeat[], high: HighBeat[]): G => (k, after) => {
  const f = floor(`${k}f`, fw, startOr(after));
  const pieces: W1Piece[] = [f]; const sockets: Socket[] = [];
  low.forEach(([t, at, h], j) => {
    const key = `${k}lo${j}`, A: R2 = [at, at + 0.01];
    if (t === 'b') pieces.push(mushroom(key, f.key, A));
    else if (t === 'l') { pieces.push({ key, shape: 'block', w: [200, 240], place: { kind: 'on', on: f.key, at: A, h: [50, 56] }, style: 'log', landing: true }); sockets.push(petals(`p-${key}`, key, 0.5, 1)); }
    // (FR9b: a low-road stump 50-56 px, a wall he hops (under 50 he walked through it); a taller stair step keeps its height)
    else { const hh = Math.max(h ?? 53, 53); pieces.push(stump(key, f.key, A, [hh - 3, hh + 3], LAND)); sockets.push(petals(`p-${key}`, key, 0.5, 1)); }
  });
  high.forEach((q, j) => {
    const key = `${k}hi${j}`;
    // (C1: every high road 17-23 px lower than written, so its first piece is 106-115 px over a 53 px low-road stump: one jump climbs it, the
    //  help's rule (a thin top 185 px up was 128-131 px over the stump, past a single's 117))
    pieces.push(limb(key, { kind: 'over', on: f.key, at: [q.at, q.at + 0.005], dy: [q.dy + 17, q.dy + 23] }, q.w ?? [200, 240], q.style ?? 'branch', false));
    if (q.mush) pieces.push(mushroom(`${key}m`, key, [0.1, 0.2]));
  });
  // (Round 4 FR7: the low road keeps its beats dense: a low stump in any stretch of plain floor longer than about 0.24 of the floor, so
  //  no walk runs past about 1.4 s; every high piece is 185 px+ up, so a 42 px stump under one keeps 118 px+ of head room)
  const ats = [0, ...low.map(([, at]) => at), 1].sort((x, y) => x - y);
  ats.slice(1).forEach((at, j) => { const g = at - ats[j]; if (g > 0.19) { const fill = Math.ceil(g / 0.18) - 1; for (let i = 1; i <= fill; i++) { const m = ats[j] + (g * i) / (fill + 1); pieces.push(stump(`${k}fl${j}_${i}`, f.key, [m, m + 0.005], [50, 56], [120, 140])); } } });
  sockets.push(find(`${k}find`, `${k}hi${high.length - 1}`), petals(`${k}pf`, f.key, [0.85, 0.95], 2));
  return { pieces, sockets, last: f.key };
};
const FW: R2 = [1500, 1560];
/** #36 (fork, bounce low road): a mushroom up onto the high road and a double along it, or the floor's own mushroom and hops */
/** (each fork's floor road carries a hop before it and a hop and a dip after: 10 s by repetition of the low road's own beats) */
const mushroomFork = section({
  id: 'w1-mushroom-fork', floor: 'hop', name: 'mushroom or the long way', phases: ['sho'], difficulty: 3, uses: ['bounce'],
  versions: [
    { id: 'a', groups: [gRest([200, 240]), gLogHop(), (k, after) => { const g = gFork(FW, [['b', 0.03], ['b', 0.62], ['h', 0.76], ['h', 0.88]], [{ at: 0.1, dy: -185 }, { at: 0.37, dy: -185 }])(k, after); return g; }, gLogHop(), gDip()] },
    { id: 'b', groups: [gRest([200, 240]), gLogHop(), gFork(FW, [['b', 0.03], ['h', 0.6], ['b', 0.74]], [{ at: 0.1, dy: -185 }, { at: 0.27, dy: -265 }, { at: 0.45, dy: -335 }]), gLogHop(), gDip()] },
  ],
  feel: ['1-1'], not: NOT_11, rating: 3,
  source: 'Round 4 #36 (0164dff4f): V7, FR3-FR4 (petals low); high a `b d +`, low [`b h h`]; high b `b c c +`, low [`h b w`]',
});
/** #37 (fork, bounce): two mushrooms up (one on the high road's first bough), or a jump and the floor's mushroom */
const twinMushroomFork = section({
  id: 'w1-twin-mushroom-fork', floor: 'hop', name: 'two mushrooms', phases: ['sho'], difficulty: 4, uses: ['bounce'],
  versions: [
    { id: 'a', groups: [gRest([200, 240]), gLogHop(), gFork(FW, [['b', 0.02], ['b', 0.55], ['h', 0.7]], [{ at: 0.1, dy: -195, w: [260, 300], mush: true, style: 'log' }, { at: 0.3, dy: -380, style: 'log' }]), gLogHop(), gDip()] },
    { id: 'b', groups: [gRest([200, 240]), gLogHop(), gDip(), gFork(FW, [['b', 0.02], ['b', 0.6], ['h', 0.78]], [{ at: 0.1, dy: -195, style: 'log' }, { at: 0.39, dy: -195, style: 'log' }]), gLogHop(), gDip()] },
  ],
  feel: ['1-1', '1-5'], not: NOT_11, rating: 4,
  source: 'Round 4 #37: as #36, #6 twin bounce; high a `b b +` / low [`b j`]; high b `b d +` / low [`j b w`]',
});
/** #38 (fork, climb low road): a stump stair up to a log road with a double, or a low stair of stumps on the floor (each step 40 px) */
const stairFork = section({
  id: 'w1-stair-fork', floor: 'hop', name: 'the stump stair or the floor', phases: ['sho'], difficulty: 4, needs: ['double'],
  versions: [
    { id: 'a', groups: [gRest([200, 240]), gLogHop(), gFork(FW, [['c', 0.02, 70], ['c', 0.11, 140], ['c', 0.62, 40], ['h', 0.74], ['c', 0.86, 40]], [{ at: 0.25, dy: -185, style: 'log' }, { at: 0.54, dy: -185, style: 'log' }]), gLogHop(), gDip()] },
    { id: 'b', groups: [gRest([200, 240]), gLogHop(), gFork(FW, [['c', 0.02, 70], ['c', 0.64, 40], ['c', 0.76, 80], ['h', 0.9]], [{ at: 0.17, dy: -185, style: 'log' }, { at: 0.34, dy: -255, style: 'log' }]), gLogHop(), gDip()] },
  ],
  feel: ['1-1'], not: NOT_11, rating: 4,
  source: 'Round 4 #38: V7, FR3; high a `c c d +` / low [`c h c`]; high b `c d c +` / low [`c c w`]; every low step <= 88 px',
});
/** #39 (fork, climb): bank steps up to a bough road, or hops and a low stair */
const bankStairFork = section({
  id: 'w1-bank-stair-fork', floor: 'hop', name: 'bank steps, two ways', phases: ['sho'], difficulty: 3, needs: ['jump'],
  versions: [
    { id: 'a', groups: [gRest([200, 240]), gLogHop(), gFork(FW, [['c', 0.02, 60], ['c', 0.1, 120], ['h', 0.58], ['c', 0.7, 40], ['c', 0.82, 80]], [{ at: 0.25, dy: -185 }, { at: 0.49, dy: -185 }]), gLogHop(), gDip()] },
    { id: 'b', groups: [gRest([200, 240]), gLogHop(), gFork(FW, [['c', 0.02, 70], ['c', 0.6, 40], ['h', 0.72], ['c', 0.84, 40]], [{ at: 0.17, dy: -200 }, { at: 0.34, dy: -270 }]), gLogHop(), gDip()] },
  ],
  feel: ['1-1', '1-2'], not: NOT_11, rating: 3,
  source: 'Round 4 #39: stepped mounds (#24 kin); high a `c c j +` / low [`h c c`]; high b `d c +` / low [`c j c`]',
});
/** #40 (test double, climb): banks, each `d` a rise block 136-140 (B2a); b ends a step down so every version ends 416 px up */
const stairTest = rhythmic({
  id: 'w1-stair-test', floor: 'hop', name: 'the steep stair', phases: ['ketsu'], difficulty: 6, needs: ['double'], uses: ['double'], exitDy: -416,
  versions: { a: ['w h c D c D w', 'c d c d'], b: ['w h D c D D n', 'd c d d'], c: ['w h c c D D w', 'c c d d'] },
  feel: ['1-1'], not: NOT_11, rating: 6,
  source: 'Round 4 #40 (0164dff4f): NODES §8.7 B2a; LEDGER-11-02:54 (rising); a hop before for the 10 s; b\'s last step down so the versions meet',
});
/** #41 (test double, climb): logs that float, up from the floor */
const logStairTest = rhythmic({
  id: 'w1-log-stair-test', floor: 'hop', name: 'logs up the bank', phases: ['ketsu'], difficulty: 6, needs: ['double'], uses: ['double'], exitDy: -279, ports: ['ground', 'ledge'],
  // (C1: one thin double rise from the ground (E, a stair's room before it), then single steps up the logs: a double between two floating
  //  logs leaves the help nowhere to stand)
  versions: { a: ['w h h E e e', 'd c c'], b: ['w h h E g e e', 'd j c c'] },
  feel: ['1-1'], not: NOT_11, rating: 6,
  source: 'Round 4 #41: as #40, logs (platforms may float, Matt 11-05); hops before for the 10 s',
});
/** #42 (twist, climb): a stair that turns. a: stumps up to the right, then logs back LEFT and up (a switchback), then a long log out
 *  to the right over all of it; b: up, a double, a drop, then back up */
const backstepTwist = section({
  id: 'w1-backstep-twist', floor: 'hop', name: 'the stair that turns', phases: ['ten'], difficulty: 5, needs: ['double'], exitDy: -350, ports: ['ground', 'ledge'],
  versions: [
    { id: 'a', groups: [gRest([200, 240]), gLogHop(), gLogHop(), (k, after) => {
      const f = floor(`${k}f`, [1500, 1540], startOr(after));
      const s1 = stump(`${k}s1`, f.key, [0.55, 0.56], [68, 72], LAND), s2 = stump(`${k}s2`, f.key, [0.75, 0.76], [138, 142], LAND);
      const l1 = limb(`${k}l1`, { kind: 'over', on: f.key, at: [0.5, 0.505], dy: [-212, -208] }, [200, 220], 'log');
      const l2 = limb(`${k}l2`, { kind: 'over', on: f.key, at: [0.27, 0.275], dy: [-282, -278] }, [200, 220], 'log');
      const top = limb(`${k}top`, { kind: 'over', on: f.key, at: [0.42, 0.425], dy: [-352, -348] }, [860, 880], 'log');
      return { pieces: [f, s1, s2, l1, l2, top], sockets: [petals(`${k}p1`, s1.key, 0.5, 1), petals(`${k}p2`, l2.key, 0.5, 1), petals(`${k}pf`, f.key, [0.1, 0.3], 2)], last: top.key };
    }] },
    { id: 'b', groups: fromRhythm('w h h c D n c c c') },
  ],
  feel: ['1-1'], not: NOT_11, rating: 5,
  source: 'Round 4 #42: §1 twist ("break the rhythm just learned"), LEDGER-11-02:72; a `c c` right then `c c` left (a switchback under a long top log), b `c d`, a drop, `c c` back (one more step so the versions meet)',
  rhythms: { a: 'c c, then c c left', b: 'c d, drop, c c' },
});
/** #43 (twist, floating, window): boughs that go up and down; a mid road of low logs under it (FR5) */
const dippingBoughsTwist = section({
  id: 'w1-dipping-boughs-twist', name: 'up and down the boughs', phases: ['ten'], difficulty: 4, needs: ['jump'], exitDy: -75, ports: ['ledge', 'ledge'], window: BOUGH_WINDOW,
  versions: [
    // (C1: the ups single steps inside the band; a: up, down, up, up; b: down, down, up, up, up, so both end about 80 px up)
    { id: 'a', groups: [(k) => { const ps = [limb(`${k}a`, { kind: 'start' }, [600, 680]), limb(`${k}b`, { kind: 'jump', after: `${k}a`, dy: HOP_UP, share: [0.4, 0.5] }, [600, 680]), limb(`${k}c`, { kind: 'jump', after: `${k}b`, dy: [58, 62], share: [0.5, 0.6] }, [600, 680]), limb(`${k}d`, { kind: 'jump', after: `${k}c`, dy: HOP_UP, share: [0.4, 0.5] }, [600, 680]), limb(`${k}e`, { kind: 'jump', after: `${k}d`, dy: [-6, 6], share: [0.5, 0.6] }, [500, 580]), lowLog(`${k}lo`, `${k}a`, [0.3, 0.4])]; return { pieces: ps, sockets: [petals(`${k}p`, `${k}lo`, [0.3, 0.7], 2)], last: `${k}e` }; }] },
    { id: 'b', groups: [(k) => { const ps = [limb(`${k}a`, { kind: 'start' }, [520, 600]), limb(`${k}b`, { kind: 'jump', after: `${k}a`, dy: [38, 42], share: [0.5, 0.6] }, [500, 580]), limb(`${k}c`, { kind: 'jump', after: `${k}b`, dy: [38, 42], share: [0.5, 0.6] }, [500, 580]), limb(`${k}d`, { kind: 'jump', after: `${k}c`, dy: HOP_UP, share: [0.4, 0.5] }, [500, 580]), limb(`${k}e`, { kind: 'jump', after: `${k}d`, dy: HOP_UP, share: [0.4, 0.5] }, [520, 600]), lowLog(`${k}lo`, `${k}a`, [0.3, 0.4])]; return { pieces: ps, sockets: [petals(`${k}p`, `${k}lo`, [0.3, 0.7], 2)], last: `${k}e` }; }] },
  ],
  feel: ['1-1'], not: NOT_11, rating: 5,
  source: 'Round 4 #43: §1 twist; platforms may float (Matt 11-05); a `d` up, `j` down, `d` up; b `j` down twice, then `d d`',
  rhythms: { a: 'j up, j down, j up, j', b: 'j j down, j j up' },
});
/** #44 (signature, raised logs, window): the double chain across floating logs, with a mid road under the approach only (FR6 for S) */
const logChain = section({
  id: 'w1-log-chain', name: 'the log chain', phases: ['ketsu'], difficulty: 6, needs: ['jump'], exitDy: -148, ports: ['ledge', 'ledge'], window: BOUGH_WINDOW, maxPerStage: 1,
  versions: [
    { id: 'a', groups: [(k) => { const ps = [limb(`${k}a`, { kind: 'start' }, [460, 520], 'log'), lowLog(`${k}lo`, `${k}a`, [0.2, 0.3])];
      // (C1, R-165.72: the chain inside the single band (bands.md §2), a catch bough under every gap (the engine's, floorRoll.catchDrop): two steps up, two level)
      const dys: R2[] = [HOP_UP, HOP_UP, [-4, 4], [-4, 4]]; let prev = `${k}a`;
      dys.forEach((dy, j) => { const key = `${k}c${j}`; ps.push(limb(key, { kind: 'jump', after: prev, dy, share: dy[0] < -50 ? [0.4, 0.5] : [0.5, 0.6] }, [400, 460], 'log')); prev = key; });
      return { pieces: ps, sockets: [petals(`${k}p`, `${k}lo`, [0.3, 0.7], 2), dot(`${k}nomoss`, `${k}a`, 0.7, 'hint.1-1.noMoss')], last: prev }; }] },
    { id: 'b', groups: [(k) => { const ps = [limb(`${k}a`, { kind: 'start' }, [460, 520], 'log'), lowLog(`${k}lo`, `${k}a`, [0.2, 0.3])];
      const steps: Array<['double' | 'jump', R2, R2, R2]> = [['jump', HOP_UP, [0.4, 0.5], [400, 460]], ['jump', [48, 52], [0.5, 0.6], [400, 460]], ['jump', HOP_UP, [0.4, 0.5], [400, 460]], ['jump', [-52, -48], [0.4, 0.5], [560, 640]]];
      let prev = `${k}a`; steps.forEach(([kind, dy, share, w], j) => { const key = `${k}c${j}`; ps.push(limb(key, { kind, after: prev, dy, share }, w, 'log')); prev = key; });
      return { pieces: ps, sockets: [petals(`${k}p`, `${k}lo`, [0.3, 0.7], 2), dot(`${k}nomoss`, `${k}a`, 0.7, 'hint.1-1.noMoss')], last: prev }; }] },
  ],
  feel: ['1-1'], not: NOT_11, rating: 7,
  source: "Round 4 #44: the double chain (1-1.md:21-22); Wonder's 3 tests (R1 L6); a `d d d d` rising then level, b `d j d d` with a fall, ending on a long log",
  rhythms: { a: 'j j j j (up, up, level, level)', b: 'j j j j (up, down, up, up)' },
});
/** #45 (signature, bounce, window): a mushroom into a double chain up boughs; or two mushrooms, each into a double */
const mushroomChain = section({
  id: 'w1-mushroom-chain', name: 'bounce into the boughs', phases: ['ketsu'], difficulty: 6, needs: ['jump'], uses: ['bounce'], exitDy: -348, ports: ['ground', 'ledge'], window: BOUGH_WINDOW, maxPerStage: 1,
  versions: [
    { id: 'a', groups: [gRest([200, 240]), gLogHop(), (k, after) => {
      const f = floor(`${k}f`, [520, 580], startOr(after));
      const b0 = limb(`${k}b0`, { kind: 'over', on: f.key, at: [0.75, 0.755], dy: [-202, -198] }, [360, 420]);
      // (C1: the mushroom's edge 25-55 px short of the bough's near end, a bounce lip's place; the chain on single steps inside the band)
      const ps: W1Piece[] = [f, mushroom(`${k}m`, f.key, [0.62, 0.66]), b0]; let prev = b0.key;
      ([HOP_UP, HOP_UP, [-4, 4]] as R2[]).forEach((dy, j) => { const key = `${k}c${j}`; ps.push(limb(key, { kind: 'jump', after: prev, dy, share: dy[0] < -50 ? [0.4, 0.5] : [0.5, 0.6] }, [340, 400])); prev = key; });
      return { pieces: ps, sockets: [petals(`${k}pf`, f.key, [0.1, 0.4], 2)], last: prev };
    }] },
  ],
  feel: ['1-1'], not: NOT_11, rating: 7,
  source: "Round 4 #45: the double chain (1-1.md:21-22) with the bounce as its way in; LEDGER-11-02:33 (the pair); a `b d d d`, b `b d b d`",
  rhythms: { a: 'b j j j' },
});
/** a canopy chain from a start piece (Round 5's descents): each step [kind, dy, share, width]; a mid road of low logs under the start (FR5) */
const gChain = (steps: Array<['jump' | 'double' | 'walk', R2, R2, R2]>, style: 'branch' | 'log' = 'branch'): G => (k) => {
  const ps: W1Piece[] = [limb(`${k}a`, { kind: 'start' }, [400, 460], style)]; let prev = `${k}a`;
  steps.forEach(([kind, dy, share, w], j) => { const key = `${k}s${j}`; ps.push(limb(key, kind === 'walk' ? { kind, after: prev, dy } : { kind, after: prev, dy, share }, w, style)); prev = key; });
  ps.push(lowLog(`${k}lo`, `${k}a`, [0.15, 0.25]));
  return { pieces: ps, sockets: [petals(`${k}p`, `${k}lo`, [0.3, 0.7], 2)], last: prev };
};
const R5 = { feel: ['1-1'] as W1Feel[], not: NOT_11 };
const w47 = section({ id: 'w1-mushroom-fork-dip', floor: 'hop', name: 'the dip mushroom', phases: ['sho'], difficulty: 3, uses: ['bounce'], ...R5, rating: 3,
  versions: [{ id: 'a', groups: [gRest([200, 240]), gLogHop(), gFork(FW, [['b', 0.02], ['h', 0.74], ['b', 0.86], ['h', 0.95]], [{ at: 0.09, dy: -185, w: [200, 220] }, { at: 0.3, dy: -185 }, { at: 0.58, dy: -185 }]), gLogHop(), gDip()] },
    { id: 'b', groups: [gRest([200, 240]), gLogHop(), gFork(FW, [['b', 0.03], ['b', 0.86]], [{ at: 0.105, dy: -185 }, { at: 0.39, dy: -185 }, { at: 0.55, dy: -185 }]), gLogHop(), gDip()] }],
  source: 'Round 5 #47 (0b9229628): V7, FR3-FR4; high a `j d +` / low [`h b h`], high b `d j +` / low [`b w b`]', rhythms: { a: 'high j d + / low h b h', b: 'high d j + / low b w b' } });
const w48 = section({ id: 'w1-root-stair-fork', floor: 'hop', name: 'roots up, or the stair', phases: ['sho'], difficulty: 4, needs: ['double'], ...R5, rating: 4,
  versions: [{ id: 'a', groups: [gRest([200, 240]), gLogHop(), gFork(FW, [['c', 0.02, 70], ['c', 0.6, 40], ['c', 0.72, 80], ['c', 0.84, 40]], [{ at: 0.17, dy: -185, style: 'log' }, { at: 0.42, dy: -185, style: 'log' }]), gLogHop(), gDip()] },
    { id: 'b', groups: [gRest([200, 240]), gLogHop(), gFork(FW, [['c', 0.02, 70], ['c', 0.62, 40], ['c', 0.84, 40]], [{ at: 0.17, dy: -185, style: 'log' }, { at: 0.34, dy: -185, style: 'log' }, { at: 0.55, dy: -185, style: 'log' }])] }],
  source: 'Round 5 #48: V7, FR3 (low steps <= 80); high a `d d +` / low [`c c c`], high b `j d +` / low [`c w c`]', rhythms: { a: 'high d d + / low c c c', b: 'high j d + / low c w c' } });
const w49 = rhythmic({ id: 'w1-bank-stair-test', floor: 'hop', name: 'the bank wall', phases: ['ketsu'], difficulty: 6, needs: ['double'], uses: ['double'], exitDy: -416, ...R5, rating: 6,
  versions: { a: ['w h h c D c D', 'c D c D'], b: ['w h D w D c c', 'D w D c'] }, source: 'Round 5 #49: NODES §8.7 (D a rise 136-140); b one more climb step so the versions meet' });
const descent = (id: string, name: string, a: Array<['jump' | 'double' | 'walk', R2, R2, R2]>, b: Array<['jump' | 'double' | 'walk', R2, R2, R2]>, exitDy: number, ra: string, rb: string, style: 'branch' | 'log' = 'branch', src = '') => section({
  id, name, phases: ['sho'], difficulty: 3, needs: ['jump'], ports: ['ledge', 'ledge'], exitDy, window: BOUGH_WINDOW, ...R5, rating: 3,
  versions: [{ id: 'a', groups: [gChain(a, style)] }, { id: 'b', groups: [gChain(b, style)] }], rhythms: { a: ra, b: rb },
  source: `Round 5 ${src} (0b9229628): §1 descent (falling); each drop <= 140 px; platforms may float; a mid road under the top (FR5)` });
const BW: R2 = [620, 700]; // (wide boughs: a descent's 10 s comes from its walk, not more drops)
const w50 = descent('w1-bough-descent', 'down through the boughs', [['jump', [108, 112], [0.4, 0.5], BW], ['jump', [108, 112], [0.4, 0.5], BW], ['jump', [33, 37], [0.4, 0.5], BW]], [['jump', [33, 37], [0.4, 0.5], BW], ['jump', [108, 112], [0.4, 0.5], BW], ['walk', [0, 0], [0, 0], BW], ['jump', [108, 112], [0.4, 0.5], BW]], 255, 'j j h', 'h j w j', 'branch', '#50');
const w51 = descent('w1-log-steps-descent', 'floating logs down', [['jump', [-4, 4], [0.5, 0.6], BW], ['jump', [108, 112], [0.4, 0.5], BW], ['jump', [108, 112], [0.4, 0.5], BW]], [['jump', [73, 77], [0.4, 0.5], BW], ['jump', [33, 37], [0.4, 0.5], BW], ['jump', [73, 77], [0.4, 0.5], BW], ['jump', [33, 37], [0.4, 0.5], BW]], 220, 'j j j', 'j h j h', 'log', '#51 (C1: its level double a single, inside the band)');
const w52 = descent('w1-canopy-drop', 'bough to bough, down', [['jump', [55, 59], [0.45, 0.55], BW], ['jump', [55, 59], [0.45, 0.55], BW], ['jump', [55, 59], [0.45, 0.55], BW]], [['jump', [38, 42], [0.4, 0.5], BW], ['jump', [128, 132], [0.4, 0.5], BW], ['jump', [-4, 4], [0.5, 0.6], BW]], 171, 'j j j', 'h j j', 'branch', '#52 (the catch bough under the gaps is the engine\'s, catchDrop)');
const flow = (id: string, name: string, a: [string, string], b: [string, string], exitDy: number, src: string, ports?: [PortKind, PortKind]) => rhythmic({ id, floor: 'hop', name, phases: ['sho'], difficulty: 3, needs: ['jump'], exitDy, ...(ports ? { ports } : {}), ...R5, rating: 3, versions: { a, b }, source: `Round 5 ${src} (0b9229628): §1 flow (no dead time over 2.5 s), WORLD-RULEBOOK §7.1, R2 L1; single steps <= 80 px` });
const w53 = flow('w1-stair-run', 'up the stump stair at a run', ['w h h h c c c c', 'c c c c'], ['w c h c h c c', 'c h c h c'], -280, '#53 (b one more step so the versions meet)');
const w54 = flow('w1-bank-run', 'bank steps at a run', ['w h h c c h c', 'h c c h c'], ['w h h h c c a c', 'c c a c'], -210, '#54 (the designer\'s (g), 11-06: the dip before the summit a level gap jump, a)');
const w55 = flow('w1-zigzag-run', 'the quick zigzag up', ['w h h h c c e e', 'c c (stones) c c (logs)'], ['w h c a c a c c', 'c a c a'], -280, '#55 (b two more steps so the versions meet; the designer\'s (g), 11-06: the dips before the summit level gap jumps, a)', ['ground', 'ledge']);
const twist = (id: string, name: string, a: [string, string], b: [string, string] | [string, string, string], exitDy: number, uses: string[], src: string, needs: Move[] = ['double']) => rhythmic({ id, floor: 'hop', name, phases: ['ten'], difficulty: 5, needs, uses, exitDy, ...R5, rating: 5, versions: { a, b }, source: `Round 5 ${src} (0b9229628): §1 twist ("break the rhythm just learned"), LEDGER-11-02:72` });
const w56 = twist('w1-high-step-twist', 'up, then the double back down', ['w h h h c c c Y', 'c c c, then d across to a lower stair'], ['w h h h c t X c', 'c, practice, d, c (the double level)', 'w h h h c a a c'], -142, ['double'], '#56');
const w57 = twist('w1-stair-gap-twist', 'the broken stair', ['w h h h c c a c', 'c c a c'], ['w h h c a c a c', 'c a c a'], -210, [], '#57 (b one more step so the versions meet; its j a level gap jump, the designer\'s (g), 11-06)', ['jump']);
const w58 = twist('w1-drop-bounce-twist', 'drop onto the mushroom', ['w h h L m D', 'w off a log down onto a floor mushroom, b up across'], ['w h h c n m D j', 'h down, b, j'], -138, ['bounce'], '#58 (the mushrooms on the floor)', ['jump']);
const w59 = twist('w1-long-bounce-twist', 'the long bounce', ['w h h h m Q w', 'b across a wide gap'], ['w m Q j m q', 'b j b'], -95, ['bounce'], '#59 (a gap at a double\'s full reach, past a single, the bounce steered across)', ['jump']);
const w60 = twist('w1-dip-bounce-twist', 'out of the dip', ['w h h n m D w', 'h into a dip, b out'], ['w h h j n m D', 'j over, h down, b up'], -68, ['bounce'], '#60', ['jump']);
const w61 = rhythmic({ id: 'w1-bounce-stair-combine', floor: 'hop', name: 'bounce, double, up the stair', phases: ['ten'], difficulty: 6, needs: ['double'], uses: ['bounce', 'double'], exitDy: -390, ports: ['ground', 'ledge'], ...R5, rating: 6,
  versions: { a: ['w h h m Z e e', 'b d c c'], b: ['w h h h c m Z e', 'c b d c'] }, source: 'Round 5 #61: the pair (bounce + double) onto a stair, LEDGER-11-02:33' });
const w62 = rhythmic({ id: 'w1-bounce-bough-combine', name: 'bounce into the bough', phases: ['ten'], difficulty: 6, needs: ['double'], uses: ['bounce', 'double'], exitDy: -250, ports: ['ground', 'ledge'], window: BOUGH_WINDOW, ...R5, rating: 6,
  versions: { a: ['w h h m z G G', 'b d onto a bough, j j'], b: ['w h h m z G', 'h b d h'] }, source: 'Round 5 #62: the pair onto floating boughs (platforms may float)' });
// ───────────────────────────── Round 6 (engine-spec fc34a6f44, the designer, the supervisor's PASS 9:40 PM): the 8 rolls that don't build ─────────────
// Cause 2's level and net-zero versions are entered as their own sections (the original's jobs, content and terrain), each with its own
// exitDy: the engine reads one exit per section (pipeline exitDyOf, the median of three lays), so a version that ends elsewhere would steer
// the corridor wrong (w1.test.ts exitDy). The roll trying a section's other versions before a swap is the planner's (Round 6, cause 2)
/** #10 level: 4 doubles across the canopy, not up */
const canopyRungsLevel = section({
  id: 'w1-canopy-rungs-level', name: 'canopy rungs across', phases: ['ten'], difficulty: 6, needs: ['jump'], ports: ['ledge', 'ledge'], exitDy: 0, window: BOUGH_WINDOW,
  versions: [{ id: 'level4', groups: [gRungs(5, [-4, 4], 'jump', [0.5, 0.6], [380, 440])] }], // (C1: five rungs, singles: the 10 s)
  feel: ['1-1'], not: NOT_11, rating: 7,
  source: 'Round 6 #10 (fc34a6f44): a level version, 4 doubles across (share 0.86-0.9, past a single), for a route already high',
});
/** #40, #41, #49 with a run-out stair back down after the summit (V18 judges the stair up to the summit) */
const w40back = rhythmic({ id: 'w1-stair-test-back', floor: 'hop', name: 'the steep stair and back', phases: ['ketsu'], difficulty: 6, needs: ['double'], uses: ['double'], exitDy: 4, ...R5, rating: 6,
  versions: { a: ['w H c D c D n h n h n n n n', 'c d c d, then down'] }, source: 'Round 6 #40 (fc34a6f44): #40 a, then a run-out stair back down; its run-out `n h n h n n`, hops between the steps down (the designer, 11-06, the quiet line)' });
const w41back = rhythmic({ id: 'w1-log-stair-test-back', floor: 'hop', name: 'logs up the bank and back', phases: ['ketsu'], difficulty: 6, needs: ['double'], uses: ['double'], exitDy: -21, ...R5, rating: 6,
  versions: { a: ['w H H E e e o o F F h', 'd c c, then down'] }, source: 'Round 6 #41 (fc34a6f44): #41 a, then a run-out stair back down; hops between the steps down, as #40-back (the quiet line)' });
const w49back = rhythmic({ id: 'w1-bank-stair-test-back', floor: 'hop', name: 'the bank wall and back', phases: ['ketsu'], difficulty: 6, needs: ['double'], uses: ['double'], exitDy: 4, ...R5, rating: 6,
  versions: { a: ['w H D w D c c n h n h n n n n', 'D w D c, then down'] }, source: 'Round 6 #49 (fc34a6f44): #49 b, then a run-out stair back down; hops between the steps down, as #40-back (the quiet line)' });
/** #45 up two boughs, then down two */
const mushroomChainBack = section({
  id: 'w1-mushroom-chain-back', name: 'bounce into the boughs and down', phases: ['ketsu'], difficulty: 6, needs: ['jump'], uses: ['bounce'], exitDy: -200, ports: ['ground', 'ledge'], window: BOUGH_WINDOW, maxPerStage: 1,
  versions: [{ id: 'updown', groups: [gRest([200, 240]), gLogHop(), (k, after) => {
    const f = floor(`${k}f`, [520, 580], startOr(after));
    const b0 = limb(`${k}b0`, { kind: 'over', on: f.key, at: [0.75, 0.755], dy: [-202, -198] }, [360, 420]);
    // (C1: the mushroom 25-55 px short of the bough, a bounce lip's place; up two single steps inside the band, down two, every gap a soft pit)
    const ps: W1Piece[] = [f, mushroom(`${k}m`, f.key, [0.62, 0.66]), b0]; let prev = b0.key;
    ([HOP_UP, HOP_UP, [70, 78], [70, 78]] as R2[]).forEach((dy, j) => { const key = `${k}c${j}`; ps.push(limb(key, { kind: 'jump', after: prev, dy, share: dy[0] < 0 ? [0.4, 0.5] : [0.5, 0.6] }, [340, 400], dy[0] < 0 ? 'branch' : 'log')); prev = key; }); // (Round 11: the down legs logs)
    return { pieces: ps, sockets: [petals(`${k}pf`, f.key, [0.1, 0.4], 2)], last: prev };
  }] }],
  feel: ['1-1'], not: NOT_11, rating: 7,
  source: 'Round 6 #45 (fc34a6f44): #45 a, up two boughs then down two, so it fits a late route already high',
});
/** #61 ending on its own start height */
const w61level = rhythmic({ id: 'w1-bounce-stair-level', floor: 'hop', name: 'bounce, double, up the stair and down', phases: ['ten'], difficulty: 6, needs: ['double'], uses: ['bounce', 'double'], exitDy: -38, ports: ['ground', 'ledge'], ...R5, rating: 6,
  versions: { a: ['w H H m Z e e o o o o F h', 'b d c c, then down'] }, source: 'Round 6 #61 (fc34a6f44): #61 a, then back down near its start height (n x 5: 59 px over it, never under: V19 on an up stage)' });
/** #66, #67: bounce tests (B3/B7: the mushroom on the floor, the lip 200-220 px, the bank face sheer to the floor) */
const w66 = rhythmic({ id: 'w1-two-lifts', floor: 'hop', name: 'two lifts', phases: ['ten', 'ketsu'], difficulty: 5, needs: ['double'], uses: ['bounce'], exitDy: -478, ports: ['ground', 'ledge'], ...R5, rating: 5,
  versions: { a: ['w H B w B', 'B w B'], b: ['w H H B B', 'B B'] }, source: 'Round 6 #66 (fc34a6f44): two bounce blocks, each lip 200-220 px (B3, B7)' });
const w67 = rhythmic({ id: 'w1-bounce-wall', floor: 'hop', name: 'the bounce wall', phases: ['ten', 'ketsu'], difficulty: 6, needs: ['double'], uses: ['bounce', 'double'], exitDy: -380, ports: ['ground', 'ledge'], ...R5, rating: 6,
  versions: { a: ['w H H H B D w', 'B D'], b: ['w H H B w D', 'B w D'] }, source: 'Round 6 #67 (fc34a6f44): a bounce block, then a double block (B3, B2a, B7)' });
/** #63-#65 (the designer's strings, 11-05 10:17 PM): every mushroom on the floor, every block face sheer (B7), every hop a 50 px wall (FR9: H) */
const w63 = rhythmic({ id: 'w1-bounce-over-dip', floor: 'hop', name: 'bounce over the dip', phases: ['sho', 'ten'], difficulty: 5, needs: ['double'], uses: ['bounce', 'double'], exitDy: -250, ports: ['ground', 'ledge'], ...R5, rating: 5,
  versions: { a: ['w H H U w H', 'b D'], b: ['w H H H U w', 'b D'] }, source: 'Round 6 #63 (designer 10:17 PM): a floor mushroom at a soft dip\'s near lip, the far bank 240-260 up (bounce + air jump)' });
const w64 = rhythmic({ id: 'w1-mushroom-log', floor: 'hop', name: 'mushroom by the fallen log', phases: ['sho', 'ten'], difficulty: 5, needs: ['double'], uses: ['bounce', 'double'], exitDy: -180, ports: ['ground', 'ledge'], ...R5, rating: 5,
  versions: { a: ['w H H H V n w', 'b D n'], b: ['w V n w H H H', 'b D n'] }, source: 'Round 6 #64 (designer 10:17 PM): a floor mushroom 60-90 px before a fallen log 240-260 tall, down a step after' });
const w65 = rhythmic({ id: 'w1-mushroom-stair', floor: 'hop', name: 'mushroom stair', phases: ['sho', 'ten'], difficulty: 6, needs: ['double'], uses: ['bounce', 'double'], exitDy: -99, ports: ['ground', 'ledge'], ...R5, rating: 6,
  versions: { a: ['w H B X n n w', 'B D n n'], b: ['w B H X n n w', 'B h D n n'] }, source: 'Round 6 #65 (designer 10:17 PM): a bounce block, a double across a level gap 195+ to a bank, a 2-step stair down' });
// (C1: out of 1-1, fewer bounce pieces: #59's Q a double rise under the band and no face for the help; #63's dip puts the mushroom 120 px
//  or more from its face; #65's lip and level double; #21's perched mushroom far from its log)
for (const q of [w59, w63, w65]) q.feel = ['1-5'];
// (C1: out of 1-1 too, their climbs thin logs floating over open ground (the testers' raised pieces, R-165.72): #41 and its back, #61 and
//  its level)
for (const q of [logStairTest, w41back, w61, w61level]) q.feel = ['1-5'];
// (C1: out of 1-1, the help's room (w1.relay.test (b), (c)): the two mushroom chains put him back on the bough past the mushroom after a
//  miss in the chain; #37's and #38's and #48's high roads start a thin log 118-184 px over a gap or a stump, where no stair fits)
for (const q of [mushroomChain, mushroomChainBack, twinMushroomFork, stairFork, w48]) q.feel = ['1-5'];
const ROUND6 = [canopyRungsLevel, w40back, w41back, w49back, mushroomChainBack, w61level, w66, w67, w63, w64, w65];
/** #68 (Round 7 (c), arrive): the home banks, flat, no ground end in the first 1,300 px (STAGE-RULES:161), one 50 px stump about 900 px
 *  in (FR9: no plain floor over 4 s), the squirrels and Dot's run line at its start; a third arrival now the meadow is a rest only */
const homeBanks = rhythmic({
  id: 'w1-home-banks', floor: 'hop', name: 'the home banks', phases: ['start'], difficulty: 1, needs: ['walk'], maxPerStage: 1, exitDy: 0,
  versions: { a: ['w w H w', 'w w h w'], b: ['w H w w', 'w h w w'] }, feel: ['1-1'], not: NOT_11, rating: 1,
  source: 'Round 7 (c) #68 (designer 11-06 8:32 AM): the brief\'s start (the squirrels: 1-1.md must); STAGE-RULES:161 (flat and safe)',
});
homeBanks.sockets = [squirrels('sq', 'in', [0.6, 0.7]), dot('tip', 'in', 0.1, 'coach.run')];
/**
 * Round 12 (the designer 11-06, engine-spec): rising versions for the late rise (V19), each its own section since a section's versions
 * share one exit: #11 and #19 'up' (the second limb 50-80 px up, a plain hop, no hard input), #22 'rise' (both roads climb two doubles of
 * 130-145), #44 'rise' (three doubles rising, then a level log). Jobs, content and terrain are their bases' (R6_BASE)
 */
const highWalkUp = section({
  id: 'w1-high-walk-up', name: 'high branch, a step up', phases: ['rest'], difficulty: 1, needs: ['jump'], ports: ['ledge', 'ledge'], window: BOUGH_WINDOW, exitDy: -65,
  versions: [{ id: 'up', groups: [gRestRoads([420, 460], [380, 440], 'hint.1-1.high', [-80, -50])] }],
  feel: ['1-1'], not: NOT_11, rating: 1, source: 'Round 12: #11 up, its second limb 50-80 px up',
});
const boughBenchUp = section({
  id: 'w1-bough-bench-up', name: 'high rest, a step up', phases: ['rest'], difficulty: 1, needs: ['jump'], ports: ['ledge', 'ledge'], window: BOUGH_WINDOW, exitDy: -65,
  versions: [{ id: 'up', groups: [gRestRoads([300, 340], [460, 520], 'hint.1-1.high', [-80, -50])] }],
  feel: ['1-1'], not: NOT_11, rating: 1, source: 'Round 12: #19 up, its second limb 50-80 px up',
});
const canopyWeaveRise = section({
  id: 'w1-canopy-weave-rise', name: 'canopy weave, rising', phases: ['ketsu'], difficulty: 5, needs: ['jump'], ports: ['ledge', 'ledge'], window: BOUGH_WINDOW, exitDy: -148,
  versions: [{ id: 'rise', groups: [(k: string) => {
    const pieces: W1Piece[] = [limb(`${k}a`, { kind: 'start' }, [260, 320])];
    let hi = `${k}a`, mid = `${k}a`;
    // (C1: both roads climb on single steps inside the band, every gap a soft pit)
    ([HOP_UP, HOP_UP, [-3, 3], [-3, 3], [-3, 3]] as R2[]).forEach((dy, j) => {
      pieces.push(limb(`${k}h${j}`, { kind: 'jump', after: hi, dy, share: dy[0] < -50 ? [0.4, 0.5] : [0.5, 0.6] }, [200, 240]));
      // (the mid road climbs too, about 100 px under the high one)
      pieces.push(limb(`${k}m${j}`, { kind: 'jump', after: mid, dy: j === 0 ? [-40, -30] : dy[0] < -50 ? HOP_UP : [-3, 3], share: [0.45, 0.55] }, [200, 240], 'branch', false));
      hi = `${k}h${j}`; mid = `${k}m${j}`;
    });
    pieces.push(limb(`${k}o`, { kind: 'jump', after: hi, dy: [-3, 3], share: [0.3, 0.4] }, [420, 480]));
    pieces.push(lowLog(`${k}lo`, `${k}m0`, [0.2, 0.3]));
    return { pieces, sockets: [petals(`${k}p`, `${k}lo`, [0.3, 0.7], 2), find(`${k}find`, hi)], last: `${k}o` };
  }] }],
  feel: ['1-1'], not: NOT_11, rating: 6, source: 'Round 12: #22 rise, both roads climbing (C1: on single steps inside the band, was two doubles of 130-145)',
});
const logChainRise = section({
  id: 'w1-log-chain-rise', name: 'the log chain, rising', phases: ['ketsu'], difficulty: 6, needs: ['jump'], exitDy: -370, ports: ['ledge', 'ledge'], window: BOUGH_WINDOW, maxPerStage: 1,
  versions: [{ id: 'rise', groups: [(k) => { const ps = [limb(`${k}a`, { kind: 'start' }, [460, 520], 'log'), lowLog(`${k}lo`, `${k}a`, [0.2, 0.3])];
    // (C1, R-165.72: the chain the testers lost most lives in, now inside the single band: five steps up, then a level log; every gap a
    //  soft pit with its floor and a step out, so a miss is a short fall and a climb back)
    const dys: R2[] = [HOP_UP, HOP_UP, HOP_UP, HOP_UP, HOP_UP, [-4, 4]]; let prev = `${k}a`;
    dys.forEach((dy, j) => { const key = `${k}c${j}`; ps.push(limb(key, { kind: 'jump', after: prev, dy, share: dy[0] < -50 ? [0.4, 0.5] : [0.5, 0.6] }, [300, 360], 'log')); prev = key; });
    return { pieces: ps, sockets: [petals(`${k}p`, `${k}lo`, [0.3, 0.7], 2), dot(`${k}nomoss`, `${k}a`, 0.1, 'hint.1-1.noMoss')], last: prev }; }] }],
  feel: ['1-1'], not: NOT_11, rating: 7, source: 'Round 12: #44 rise (C1: five single steps rising inside the band, was d d d), then a level log', rhythms: { rise: 'j j j j j g' },
});
// (C1: the canopy rests never mirrored: mirrored, their mid road's step down off the bough was judged a rise past the band)
for (const q of [highWalk, boughBench, highWalkUp, boughBenchUp]) q.mirrorable = false;
// (and the cache stones: mirrored, its last stone's drop to the floor (up to 110 px) was judged a rise past the single band)
cacheStones.mirrorable = false;
// (and the seed perch: mirrored, its bough's near end faced away from the mushroom, a 227 px rise from the stump beside it)
seedPerch.mirrorable = false;
// (and the mushroom forks: mirrored, a tiered high road's upper piece came first, 262 px over the floor)
for (const q of [mushroomFork, w47]) q.mirrorable = false;
const ROUND12 = [highWalkUp, boughBenchUp, canopyWeaveRise, logChainRise];
const ROUND7 = [homeBanks];
const ROUND5 = [w47, w48, w49, w50, w51, w52, w53, w54, w55, w56, w57, w58, w59, w60, w61, w62];
const ROUND4 = [stepStonesTeach, logTeach, dipDoubleTeach, bankDoubleTeach, mushroomBankTeach, morningPath, mushroomFork, twinMushroomFork, stairFork, bankStairFork, stairTest, logStairTest, backstepTwist, dippingBoughsTwist, logChain, mushroomChain];

/** the designer's sections entered (all 30) and the planner's seed perch */
export const W1_NEW: readonly W1Section[] = [stumpStile, stoneZigzag, logRoad, hollowTwoway, mushroomLift, twinBounce, fallenTrunk, doubleTeach, boughStepup, canopyRungs, highWalk, dropdownStair, knotBank, floorDash, quietArrival, forestEdge, fernBank, clearing, boughBench, stumpTowers, bounceDouble, canopyWeave, sunlitLog, stumpDescent, moundLog, logWalk, stiltLogs, twoAnswers, boughLog, lastStepUp, seedPerch, ...ROUND4, ...ROUND5, ...ROUND6, ...ROUND7, ...ROUND12];

const HARVEST: readonly W1Section[] = [learn, developStones, cacheStones, developStumpStones, developStoneDips, twistGaps, twistLeapStones, twistHighLeaps, finishHopBounce, finishBounceRun, finishStoneRoad, meadow, lowBoughs, ledges, ropes];
/**
 * Each section's node jobs (NODES.md §1), ruled by the designer (NODES §8.8, engine-spec 20398a84c): a teach shows its move
 * over safe ground, a test needs a taught move, combine is the stage's pair on one beat (bounce + double), fork and choice-reward lay
 * two roads (the high one holding petals or the find), climb and descent are the route going up or down, exit carries the end log
 */
const JOBS: Record<string, W1Job[]> = {
  'w1-learn': ['teach'], 'w1-stones': ['practise'], 'w1-cache-stones': ['practise'], 'w1-stump-stones': ['practise'],
  'w1-stone-dips': ['practise', 'flow'], 'w1-second-jump': ['test'], 'w1-leap-stones': ['test', 'flow'], 'w1-high-leaps': ['climb', 'combine'],
  'w1-hop-bounce': ['teach', 'practise'], 'w1-bounce-run': ['combine', 'climb'], 'w1-stone-road': ['flow', 'descent'], 'w1-meadow': ['rest', 'arrive'],
  'w1-low-boughs': ['practise', 'flow'], 'w1-ledges': ['practise', 'climb'], 'w1-ropes': ['test'],
  'w1-stump-stile': ['practise'], 'w1-stone-zigzag': ['practise'], 'w1-log-road': ['practise'], 'w1-hollow-twoway': ['fork', 'choice-reward'],
  'w1-mushroom-lift': ['teach'], 'w1-twin-bounce': ['practise', 'climb'], 'w1-fallen-trunk': ['test', 'twist'], 'w1-double-teach': ['teach'],
  'w1-bough-stepup': ['climb'], 'w1-canopy-rungs': ['signature', 'test'], 'w1-high-walk': ['rest'], 'w1-dropdown-stair': ['descent'],
  'w1-knot-bank': ['practise'], 'w1-floor-dash': ['fork', 'flow'], 'w1-quiet-arrival': ['exit'], 'w1-forest-edge': ['arrive'],
  'w1-fern-bank': ['rest'], 'w1-clearing': ['rest'], 'w1-bough-bench': ['rest'], 'w1-stump-towers': ['test'], 'w1-bounce-double': ['combine'],
  'w1-canopy-weave': ['fork', 'choice-reward'], 'w1-sunlit-log': ['exit'], 'w1-stump-descent': ['descent', 'practise'], 'w1-mound-log': ['practise'],
  'w1-log-walk': ['rest'], 'w1-stilt-logs': ['test'], 'w1-two-answers': ['twist'], 'w1-bough-log': ['climb'], 'w1-last-step-up': ['exit'],
  'w1-seed-perch': ['reward'],
  'w1-step-stones-teach': ['teach'], 'w1-log-teach': ['teach'], 'w1-dip-double-teach': ['teach'], 'w1-bank-double-teach': ['teach'], 'w1-mushroom-bank-teach': ['teach'], 'w1-morning-path': ['arrive'], 'w1-mushroom-fork': ['fork'], 'w1-twin-mushroom-fork': ['fork'], 'w1-stair-fork': ['fork'], 'w1-bank-stair-fork': ['fork'], 'w1-stair-test': ['test'], 'w1-log-stair-test': ['test'], 'w1-backstep-twist': ['twist'], 'w1-dipping-boughs-twist': ['twist'], 'w1-log-chain': ['signature'], 'w1-mushroom-chain': ['signature'],
  'w1-mushroom-fork-dip': ['fork'], 'w1-root-stair-fork': ['fork'], 'w1-bank-stair-test': ['test'], 'w1-bough-descent': ['descent'], 'w1-log-steps-descent': ['descent'], 'w1-canopy-drop': ['descent'], 'w1-stair-run': ['flow', 'climb'], 'w1-bank-run': ['flow', 'climb'], 'w1-zigzag-run': ['flow', 'climb'], // (Round 6: climb x climb x sho outside the window)
  'w1-canopy-rungs-level': ['signature', 'test'], 'w1-stair-test-back': ['test'], 'w1-log-stair-test-back': ['test'], 'w1-bank-stair-test-back': ['test'], 'w1-mushroom-chain-back': ['signature'], 'w1-bounce-stair-level': ['combine'], 'w1-two-lifts': ['test'], 'w1-bounce-wall': ['test'], 'w1-home-banks': ['arrive'], 'w1-bounce-over-dip': ['combine'], 'w1-mushroom-log': ['combine'], 'w1-mushroom-stair': ['combine'], 'w1-high-step-twist': ['twist'], 'w1-stair-gap-twist': ['twist'], 'w1-drop-bounce-twist': ['twist'], 'w1-long-bounce-twist': ['twist'], 'w1-dip-bounce-twist': ['twist'], 'w1-bounce-stair-combine': ['combine'], 'w1-bounce-bough-combine': ['combine'],
};
/** the designer's content tags (NODES.md §7.7, engine-spec d4526ee5e; forks retagged by their low road). The seed perch is the porter's
 *  reading ('bounce': its find is reached by the perched mushroom), for the designer to rule */
const CONTENT: Record<string, W1Content> = {
  'w1-learn': 'ground', 'w1-stones': 'ground', 'w1-stump-stones': 'ground', 'w1-stone-dips': 'ground', 'w1-second-jump': 'ground', 'w1-leap-stones': 'ground', 'w1-stone-road': 'ground',
  'w1-high-leaps': 'floating', 'w1-low-boughs': 'floating', 'w1-cache-stones': 'bounce', 'w1-hop-bounce': 'bounce', 'w1-bounce-run': 'bounce', 'w1-ledges': 'climb', 'w1-ropes': 'rope', 'w1-meadow': 'structural',
  'w1-stump-stile': 'ground', 'w1-stone-zigzag': 'ground', 'w1-fallen-trunk': 'ground', 'w1-double-teach': 'ground', 'w1-stump-descent': 'ground',
  'w1-hollow-twoway': 'ground', 'w1-floor-dash': 'ground', 'w1-two-answers': 'ground',
  'w1-log-road': 'floating', 'w1-canopy-rungs': 'floating', 'w1-stump-towers': 'floating', 'w1-stilt-logs': 'floating', 'w1-canopy-weave': 'floating',
  'w1-bough-stepup': 'climb', 'w1-dropdown-stair': 'climb', 'w1-knot-bank': 'ground', 'w1-mound-log': 'climb', 'w1-bough-log': 'climb',
  'w1-mushroom-lift': 'bounce', 'w1-twin-bounce': 'bounce', 'w1-bounce-double': 'bounce', 'w1-seed-perch': 'bounce',
  'w1-high-walk': 'structural', 'w1-quiet-arrival': 'structural', 'w1-forest-edge': 'structural', 'w1-fern-bank': 'structural', 'w1-clearing': 'structural',
  'w1-bough-bench': 'structural', 'w1-sunlit-log': 'structural', 'w1-log-walk': 'structural', 'w1-last-step-up': 'structural',
  'w1-step-stones-teach': 'ground', 'w1-log-teach': 'ground', 'w1-dip-double-teach': 'ground', 'w1-bank-double-teach': 'ground', 'w1-mushroom-bank-teach': 'bounce', 'w1-morning-path': 'structural', 'w1-mushroom-fork': 'bounce', 'w1-twin-mushroom-fork': 'bounce', 'w1-stair-fork': 'climb', 'w1-bank-stair-fork': 'climb', 'w1-stair-test': 'climb', 'w1-log-stair-test': 'climb', 'w1-backstep-twist': 'climb', 'w1-dipping-boughs-twist': 'floating', 'w1-log-chain': 'floating', 'w1-mushroom-chain': 'bounce',
  'w1-mushroom-fork-dip': 'bounce', 'w1-root-stair-fork': 'climb', 'w1-bank-stair-test': 'climb', 'w1-bough-descent': 'floating', 'w1-log-steps-descent': 'floating', 'w1-canopy-drop': 'floating', 'w1-stair-run': 'climb', 'w1-bank-run': 'climb', 'w1-zigzag-run': 'climb', 'w1-high-step-twist': 'climb', 'w1-stair-gap-twist': 'climb', 'w1-drop-bounce-twist': 'bounce', 'w1-long-bounce-twist': 'bounce', 'w1-dip-bounce-twist': 'bounce', 'w1-bounce-stair-combine': 'climb', 'w1-bounce-bough-combine': 'floating',
};
/** every W1 section: the harvest, then the designer's new ones (and the planner's seed perch), each with its proposed jobs and its type */
/** each section's terrain family: where most of its landings are (ruled by the designer, 11-05: hollow-twoway, fallen-trunk and log-walk raised-logs) */
const TERRAIN: Record<string, W1Terrain> = {
  'w1-learn': 'floor-stones', 'w1-stones': 'floor-stones', 'w1-cache-stones': 'floor-stones', 'w1-stump-stones': 'floor-stones', 'w1-stone-dips': 'floor-stones',
  'w1-second-jump': 'floor-stones', 'w1-leap-stones': 'floor-stones', 'w1-stone-road': 'floor-stones', 'w1-meadow': 'floor-stones', 'w1-hop-bounce': 'mounds',
  'w1-high-leaps': 'boughs', 'w1-bounce-run': 'boughs', 'w1-low-boughs': 'boughs', 'w1-ledges': 'mounds', 'w1-ropes': 'floor-stones',
  'w1-stump-stile': 'floor-stones', 'w1-stone-zigzag': 'floor-stones', 'w1-log-road': 'raised-logs', 'w1-hollow-twoway': 'raised-logs', 'w1-mushroom-lift': 'mounds',
  'w1-twin-bounce': 'mounds', 'w1-fallen-trunk': 'raised-logs', 'w1-double-teach': 'floor-stones', 'w1-bough-stepup': 'boughs', 'w1-canopy-rungs': 'boughs',
  'w1-high-walk': 'boughs', 'w1-dropdown-stair': 'mounds', 'w1-knot-bank': 'mounds', 'w1-floor-dash': 'raised-logs', 'w1-quiet-arrival': 'boughs',
  'w1-forest-edge': 'floor-stones', 'w1-fern-bank': 'floor-stones', 'w1-clearing': 'floor-stones', 'w1-bough-bench': 'boughs', 'w1-stump-towers': 'raised-logs',
  'w1-bounce-double': 'raised-logs', 'w1-canopy-weave': 'boughs', 'w1-sunlit-log': 'boughs', 'w1-stump-descent': 'raised-logs', 'w1-mound-log': 'mounds',
  'w1-log-walk': 'raised-logs', 'w1-stilt-logs': 'raised-logs', 'w1-two-answers': 'floor-stones', 'w1-bough-log': 'boughs', 'w1-last-step-up': 'boughs',
  'w1-seed-perch': 'boughs',
  'w1-step-stones-teach': 'floor-stones', 'w1-log-teach': 'raised-logs', 'w1-dip-double-teach': 'floor-stones', 'w1-bank-double-teach': 'mounds', 'w1-mushroom-bank-teach': 'mounds', 'w1-morning-path': 'floor-stones', 'w1-mushroom-fork': 'boughs', 'w1-twin-mushroom-fork': 'boughs', 'w1-stair-fork': 'raised-logs', 'w1-bank-stair-fork': 'mounds', 'w1-stair-test': 'mounds', 'w1-log-stair-test': 'raised-logs', 'w1-backstep-twist': 'raised-logs', 'w1-dipping-boughs-twist': 'boughs', 'w1-log-chain': 'raised-logs', 'w1-mushroom-chain': 'boughs',
  'w1-mushroom-fork-dip': 'boughs', 'w1-root-stair-fork': 'raised-logs', 'w1-bank-stair-test': 'mounds', 'w1-bough-descent': 'boughs', 'w1-log-steps-descent': 'raised-logs', 'w1-canopy-drop': 'boughs', 'w1-stair-run': 'mounds', 'w1-bank-run': 'mounds', 'w1-zigzag-run': 'floor-stones', 'w1-high-step-twist': 'mounds', 'w1-stair-gap-twist': 'mounds', 'w1-drop-bounce-twist': 'floor-stones', 'w1-long-bounce-twist': 'floor-stones', 'w1-dip-bounce-twist': 'floor-stones', 'w1-bounce-stair-combine': 'raised-logs', 'w1-bounce-bough-combine': 'boughs',
};
/** the two-answer twists (B5): #7's mushroom version, #28, #59 (the designer, 11-05) */
const ANSWERS: Record<string, Array<'double' | 'bounce'>> = { 'w1-fallen-trunk': ['double', 'bounce'], 'w1-two-answers': ['double', 'bounce'], 'w1-long-bounce-twist': ['double', 'bounce'] };
const VERSION_JOBS: Record<string, Record<string, W1Job[]>> = { 'w1-fallen-trunk': { double: ['test'], mushroom: ['twist'] } };
/** Round 6's level and net-zero sections take the content and terrain of the section they are a version of */
const R6_BASE: Record<string, string> = { 'w1-high-walk-up': 'w1-high-walk', 'w1-bough-bench-up': 'w1-bough-bench', 'w1-canopy-weave-rise': 'w1-canopy-weave', 'w1-log-chain-rise': 'w1-log-chain', 'w1-canopy-rungs-level': 'w1-canopy-rungs', 'w1-stair-test-back': 'w1-stair-test', 'w1-log-stair-test-back': 'w1-log-stair-test', 'w1-bank-stair-test-back': 'w1-bank-stair-test', 'w1-mushroom-chain-back': 'w1-mushroom-chain', 'w1-bounce-stair-level': 'w1-bounce-stair-combine', 'w1-two-lifts': 'w1-mushroom-bank-teach', 'w1-bounce-wall': 'w1-mushroom-bank-teach' };
/** Round 6's new combines: their content (NODES §7.7) and terrain */
const R6_KIND: Record<string, [W1Content, W1Terrain]> = { 'w1-home-banks': ['structural', 'floor-stones'], 'w1-bounce-over-dip': ['ground', 'mounds'], 'w1-mushroom-log': ['ground', 'raised-logs'], 'w1-mushroom-stair': ['bounce', 'mounds'] };
/**
 * Round 7 (a), the teach lines (TT1-TT3, the designer 11-06 8:32 AM, the supervisor's PASS): a T section is never mirrored (mirroring
 * reversed #8's order: "Nice!" before the gaps, the teach after), and its lines are said in walking order: the entry line on its ENTRY piece
 * (t 0.1, before any block), the move's line on the take-off piece of its first gap of that kind. The bounce is the lesson card's
 * (lesson.bounce), no Dot line. The old teach sockets are replaced, never doubled
 */
const TEACH_LINES: Partial<Record<string, { entry: string; take?: string; gap: (pl: SectionPiece['place']) => boolean }>> = {
  jump: { entry: 'coach.jump', take: 'hint.1-1.gaps', gap: (pl) => pl.kind === 'jump' || (pl.kind === 'pit' && pl.jump === 'jump') },
  double: { entry: 'hint.1-1.double', gap: (pl) => pl.kind === 'double' || (pl.kind === 'pit' && pl.jump === 'double') },
};
const TEACH_IDS = new Set(['coach.jump', 'hint.1-1.gaps', 'coach.nice', 'hint.1-1.double']);
function teachLines(q: W1Section): W1Section {
  if (!q.teaches) return q;
  const L = TEACH_LINES[q.teaches];
  const sub = q.subBlocks![0];
  const versions = sub.versions.map((v) => {
    if (!L) return v;
    const keep = (v.sockets ?? []).filter((k) => !(k.role === 'tip' && (k.allow ?? []).some((a) => TEACH_IDS.has(a))));
    const first = v.pieces.find((pc) => L.gap(pc.place));
    const take = first && 'after' in first.place ? first.place.after : undefined;
    const lines: Socket[] = [{ id: 'teach-entry', role: 'tip', on: 'in', t: 0.1, allow: [L.entry] }, ...(take && L.take ? [{ id: 'teach-take', role: 'tip', on: take, t: 0.4, allow: [L.take] } as Socket] : [])];
    return { ...v, sockets: [...lines, ...keep] };
  });
  return { ...q, mirrorable: false, subBlocks: [{ ...sub, versions }] };
}
export const W1_SECTIONS: readonly W1Section[] = [...HARVEST, ...W1_NEW].map(teachLines).map((q) => ({ ...q, jobs: JOBS[q.id] ?? JOBS[R6_BASE[q.id]], content: CONTENT[q.id] ?? CONTENT[R6_BASE[q.id]] ?? R6_KIND[q.id]?.[0], terrain: TERRAIN[q.id] ?? TERRAIN[R6_BASE[q.id]] ?? R6_KIND[q.id]?.[1], ...(ANSWERS[q.id] ? { answers: ANSWERS[q.id] } : {}), ...(VERSION_JOBS[q.id] ? { versionJobs: VERSION_JOBS[q.id] } : {}) }));

/** the phases a stage's slots fill */
export const W1_PHASES: readonly Phase[] = ['start', 'ki', 'sho', 'rest', 'ten', 'ketsu', 'goal'];

/** what World 1 does to a built gen2 stage (GEN2_STAGES `finish`; the test link's picker calls it too): every piece keeps its own kind,
 *  never re-labelled for variety (W1-ART-AUDIT §3.1, Matt's approval 11-05: the leaf ledge, the frond strip and the stone drawn as a log came
 *  from that swap, not from w1.ts). A finished stage is returned for chaining */
export function w1Finish<T extends { platforms: Array<{ ownLook?: boolean; cut?: string } & Pick<Platform, 'id' | 'x' | 'y' | 'width' | 'height' | 'style' | 'type'>> }>(st: T): T {
  for (const p of st.platforms) p.ownLook = true;
  // (the art swap, W1-ART-AUDIT §3.2-3.5: each stone, stump and thin log drawn as one of the art director's cut pieces, w1CutArt.ts)
  // (a stone or stump stands on the ground: only where a solid piece meets its foot, so a pit's step drawn as a rock never ends in the air,
  //  Roll 5's upright still; a plank may float)
  const onGround = (p: Pick<Platform, 'x' | 'y' | 'width' | 'height'>) => st.platforms.some((q) => q !== p && q.type === 'solid' && Math.abs(q.y - (p.y + p.height)) <= 6 && q.x <= p.x + p.width / 2 && q.x + q.width >= p.x + p.width / 2);
  for (const p of st.platforms) if (p.type === 'solid') { const c = pickCut(p); if (c && (W1_CUT[c].kind === 'log' || onGround(p))) p.cut = c; }
  // (a built roll only: a toy stage of bare platforms, w1CutArt.test's, has no spawn or sections to dress)
  if ((st as { gen2?: unknown }).gen2) w1Squirrels(st as never);
  return st;
}

/** the squirrel poses (w1-new): a roll's order of them is shuffled by its seed, so the poses vary roll to roll */
const SQUIRREL_POSES = ['squirrel-sit', 'squirrel-wave', 'squirrel-tip', 'squirrel-haul', 'squirrel-run'] as const;
/** the least a stage is dressed with (live 1-1's brief: "the squirrels came to watch him leave"; w1NewArt.test holds it) */
export const SQUIRREL_MIN = 3;
type DressStage = {
  platforms: Platform[]; spawnX: number; spawnY: number; exitTotemX?: number; exitTotemY?: number;
  collectibles?: Array<{ x: number; y: number }>; checkpoints?: Array<{ x: number; y: number }>; hints?: Array<{ x: number; y?: number }>;
  gen2?: { seed?: number; sections?: Array<{ phase: string; x0: number; x1: number }> };
  proto?: { mixDress?: Array<{ n: string; x: number; b: number; flip?: boolean }> };
};
/**
 * gen2 1-1's squirrels (the lead 11-06, 0.9.5: at least SQUIRREL_MIN from w1-new, on banks and the ground at rests, never in the play band or
 * over a socket, the pose varied per roll). One on the spawn's ground ahead of him, facing him as he sets off; one on the widest bank of each
 * rest; the rest of the minimum on the spawn's ground. A spot is taken only where the squirrel stands on the top of a bank 90 px deep or
 * more (the ground, not a step or a log), nothing solid stands in its box (the play band: nothing he jumps on or through), no pickup, flag,
 * hint or the exit totem lies within 70 px of it (a socket), and it is clear of the spawn (one body width each side) and of the other
 * dressing. Thrown when fewer than SQUIRREL_MIN find a spot, so a roll that can't be dressed fails its build, never ships bare.
 */
export function w1Squirrels(st: DressStage): void {
  const dress = (st.proto ??= {}).mixDress ??= [];
  let r = ((st.gen2?.seed ?? 1) * 2654435761) >>> 0;
  const rnd = () => { r = (Math.imul(r ^ (r >>> 15), 2246822507) + 0x9e3779b9) >>> 0; return r / 2 ** 32; };
  const poses = [...SQUIRREL_POSES].map((n) => ({ n, k: rnd() })).sort((a, b) => a.k - b.k).map((q) => q.n);
  const bank = (p: Platform) => p.type === 'solid' && p.style !== 'log' && p.style !== 'branch' && p.height >= 90;
  const marks = [...(st.collectibles ?? []), ...(st.checkpoints ?? []), ...(st.hints ?? []).map((h) => ({ x: h.x, y: h.y ?? st.spawnY })), ...(st.exitTotemX !== undefined ? [{ x: st.exitTotemX, y: st.exitTotemY ?? st.spawnY }] : [])];
  const clear = (n: string, x: number, p: Platform): boolean => {
    const w = w1DressWidth(n) || 60, x0 = x - w / 2, x1 = x + w / 2, b = p.y;
    if (x0 < p.x + 8 || x1 > p.x + p.width - 8) return false;
    if (st.platforms.some((q) => q !== p && q.x < x1 && q.x + q.width > x0 && q.y < b && q.y + q.height > b - 70)) return false;
    if (marks.some((m) => Math.abs(m.x - x) < w / 2 + 70 && m.y > b - 260 && m.y < b + 40)) return false;
    if (x1 > st.spawnX - 44 && x0 < st.spawnX + 88 && Math.abs(b - st.spawnY) < 120) return false;
    return !dress.some((d) => Math.abs(d.x - x) < (w1DressWidth(d.n) || 60) / 2 + w / 2 + 70 && Math.abs(d.b - b) < 80);
  };
  let k = 0;
  const put = (p: Platform, from: number, to: number, faceLeft: boolean): boolean => {
    const n = poses[k % poses.length];
    // (a seeded spot along the bank, then outward from it in 20 px steps until one is clear)
    const a = from + (to - from) * (0.3 + 0.4 * rnd());
    for (let d = 0; d <= to - from; d += 20) for (const x of [a + d, a - d]) {
      if (x < from || x > to || !clear(n, x, p)) continue;
      dress.push({ n, x: Math.round(x), b: p.y, ...(faceLeft && w1DressFacing(n) === 'right' ? { flip: true } : {}) });
      k++;
      return true;
    }
    return false;
  };
  const ground = st.platforms.filter(bank).find((p) => p.x <= st.spawnX && p.x + p.width >= st.spawnX + 44 && Math.abs(p.y - st.spawnY) <= 6);
  if (ground) put(ground, st.spawnX + 100, ground.x + ground.width, true);
  for (const q of st.gen2?.sections ?? []) {
    if (q.phase !== 'rest') continue;
    const banks = st.platforms.filter((p) => bank(p) && p.x < q.x1 && p.x + p.width > q.x0).sort((a, b) => b.width - a.width);
    for (const p of banks) if (put(p, Math.max(p.x, q.x0), Math.min(p.x + p.width, q.x1), rnd() < 0.5)) break;
  }
  if (ground) for (let t = 0; k < SQUIRREL_MIN && t < 3; t++) put(ground, ground.x, ground.x + ground.width, true);
  if (k < SQUIRREL_MIN) throw new Error(`w1Squirrels: only ${k} of ${SQUIRREL_MIN} squirrels found a clear spot on a bank (seed ${st.gen2?.seed})`);
}
/** every Dot line by id, its words (the old text, which the new look swaps where it is said; a cut line's new text if it has no old) */
export const W1_TIPS: Record<string, string> = Object.fromEntries(DOT_LINES.map((r) => [r[0], r[4] ?? r[5]] as const).filter((e): e is [string, string] => !!e[1]));
/**
 * World 1's gen2 kit (the planner, 11-05: one kit for the game, stage.ts and the CHECK 3b harness): W1_KIT's rows as a WorldManifest with
 * World 1's pool. 1-1 lays no creatures, props or rooms; its dressing comes after the build (protoStage.ts addDress), as on gen2's other
 * stages. A fresh one per build.
 */
export function w1World(): WorldKit {
  const manifest: WorldManifest = {
    world: 1, name: 'The Home Forest', moves: ['double'],
    ground: W1_KIT.ground, pit: W1_KIT.pit, pitDepth: W1_KIT.pitDepth, floorRoll: W1_KIT.floorRoll, rollRanges: W1_KIT.rollRanges,
    graphs: W1_KIT.graphs, corridor: W1_KIT.corridor, themeShare: W1_KIT.themeShare, required: W1_KIT.required,
    creatures: [], props: [], pairs: [], decor: [], flowers: ['orchid', 'hibiscus'], sections: [...W1_SECTIONS], handBuilt: [],
    // (Dot's lines by their text id: the words a hint carries are the line's old text, which dotLines.ts swaps for the new look's words
    // where it is said; without these the pipeline put the raw id on screen, the red team's RT-ENGINE #1: "hint.1-1.double")
    tips: W1_TIPS,
  };
  return { manifest };
}

