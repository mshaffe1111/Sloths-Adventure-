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
import type { NodeJob, Phase, PortKind, SectionPiece, SectionTemplate, Socket } from '../types.ts';
import { DOUBLE_RISE, reachJump } from '../../physics.ts';
import { hollowLogSize } from '../../w1NewArt.ts';
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
    briefs: { '1-1': { ends: 'quiet' as const, trend: 'up' as const, branching: 'some' as const, teaches: ['jump', 'double', 'bounce'], deal: { ground: 40, floating: 25, climb: 20, bounce: 15 } } },
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
/** a stretch of the moss floor: a bank on the ground line (old 1-1's ground at G) */
const floor = (key: string, w: SectionPiece['w'], place: SectionPiece['place'] = { kind: 'start' }): W1Piece => ({ key, shape: 'bank', w, place, style: 'moss_stone', main: true, landing: true });
/** the floor after a soft gap a plain jump crosses (`share` of the widest gap the difficulty allows) */
const softGap = (key: string, after: string, w: SectionPiece['w'], share: [number, number], jump: 'jump' | 'double' = 'jump'): W1Piece => ({ key, shape: 'bank', w, place: { kind: 'pit', after, jump, share, soft: true }, style: 'moss_stone', main: true, landing: true });
/** a mossy stump or rock standing on `on` (one easy hop: lowStumps 36-76, logHop 34-46) */
const stump = (key: string, on: string, at: SectionPiece['w'], h: SectionPiece['w'], w: SectionPiece['w'] = [130, 170]): W1Piece => ({ key, shape: 'block', w, place: { kind: 'on', on, at, h }, style: 'moss_stone', landing: true });
/** a stepping stone: a jump from `after`, `dy` up (negative) or down; it stands on the floor (pillars: 110-160 wide) */
const stone = (key: string, after: string, dy: SectionPiece['w'], share: [number, number] = [0.55, 0.68]): W1Piece => ({ key, shape: 'block', w: [110, 160], place: { kind: 'jump', after, dy, share, soft: true }, style: 'moss_stone', landing: true, main: true });
/** a bough over `on`, off the main route unless `main` */
const bough = (key: string, on: string, at: SectionPiece['w'], dy: SectionPiece['w'], w: SectionPiece['w'], main = false): W1Piece => ({ key, shape: 'branch', w, place: { kind: 'over', on, at, dy }, style: 'branch', main, landing: true });
/** the mushroom (70 wide, 30 tall: bounceWall, highLeaps) standing on `on` */
const mushroom = (key: string, on: string, at: SectionPiece['w']): W1Piece => ({ key, shape: 'bouncy', w: [70, 70], place: { kind: 'on', on, at, h: [30, 30] } });

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
  const hs = n === 3 ? [[40, 50], [76, 76], [46, 46]] : [[40, 50], [76, 76], [46, 46], [36, 40]];
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
    pieces.push({ key, shape: 'block', w: [110, 160], place: { kind: dbl ? 'double' : 'jump', after: prev, dy: [prevH - h, prevH - h], share, soft: true }, style: 'moss_stone', landing: true, main: true });
    prev = key; prevH = h;
  });
  const f: W1Piece = { ...floor(`${k}f`, [300, 380]), place: { kind: 'jump', after: prev, dy: [prevH, prevH], share: [0.5, 0.6], soft: true } };
  return { pieces: [...pieces, f], sockets: pieces.map((p) => petals(`p-${p.key}`, p.key, 0.5, 1)), last: f.key };
};
/** mushroomCache (protoStage.ts:1143 on main): a mushroom on the floor, a bough DOUBLE_RISE + 70 up, 4 petals on it */
const gCache = (): G => (k, after) => {
  const f = floor(`${k}f`, [640, 760], startOr(after));
  const b = bough(`${k}b`, f.key, [0.2, 0.26], [-(Math.round(DOUBLE_RISE) + 70), -(Math.round(DOUBLE_RISE) + 70)], [270, 270]);
  return { pieces: [f, mushroom(`${k}m`, f.key, [0.25, 0.3]), b], sockets: [petals(`${k}p`, b.key, [0.2, 0.8], 4, 190)], last: f.key };
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
const gDoubleGaps = (shares: Array<[number, number]>): G => (k, after) => {
  const pieces: W1Piece[] = []; const sockets: Socket[] = [];
  let prev = after!;
  shares.forEach((sh, j) => { const p = softGap(`${k}g${j}`, prev, [220, 300], sh, 'double'); pieces.push(p); sockets.push({ id: `${k}arc${j}`, role: 'arc', on: p.key, t: 0 }); prev = p.key; });
  return { pieces, sockets, last: prev };
};
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
  return { pieces, sockets, last: f.key };
};
/** bounceWall (protoStage.ts:1248 on main): a mushroom, a cliff 225-240 tall and 330-400 long with a rock on it, a dip where he lands */
const gBounceWall = (): G => (k, after) => {
  const a = floor(`${k}a`, [300, 360], startOr(after));
  const w: W1Piece = { key: `${k}w`, shape: 'bank', w: [330, 400], place: { kind: 'walk', after: a.key, dy: [-240, -225] }, style: 'moss_stone', main: true, landing: true };
  const r = stump(`${k}r`, w.key, [0.55, 0.65], [34, 46], [120, 150]);
  const b: W1Piece = { ...floor(`${k}b`, [160, 220]), place: { kind: 'walk', after: w.key, dy: [225, 240] } };
  const c = softGap(`${k}c`, b.key, [260, 320], [0.4, 0.5]);
  return { pieces: [a, mushroom(`${k}m`, a.key, [0.7, 0.75]), w, r, b, c], sockets: [petals(`${k}pw`, w.key, [0.15, 0.35], 2), petals(`${k}pr`, r.key, 0.5, 1)], last: c.key };
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
  groups.forEach((g, j) => { const r = g(`${'abcdefghij'[j]}`, j ? out.last : null); out.pieces.push(...r.pieces); out.sockets.push(...r.sockets); out.last = r.last; });
  return out;
}
/** a section whose pieces are one of several chains (Spelunky's sub-blocks: one version rolled per use) */
function section(o: Omit<W1Section, 'pieces' | 'entry' | 'exit' | 'sockets' | 'subBlocks' | 'mirrorable' | 'exitDy' | 'archetypes'> & { versions: Array<{ id: string; groups: G[] }>; ports?: [PortKind, PortKind]; exitDy?: number }): W1Section {
  // (every version must end on the same key: the last floor is renamed `out`)
  const vs = o.versions.map((v) => { const c = chain(v.groups); return { id: v.id, c }; });
  const open = vs[0].c.pieces[0].key;
  const versions = vs.map(({ id, c }) => {
    const ren = (s: string) => (s === c.last ? 'out' : s);
    const pieces = c.pieces.slice(1).map((p) => ({ ...p, key: ren(p.key), place: renPlace(p.place, (s) => (s === open ? 'in' : ren(s))) }));
    const sockets = c.sockets.map((s) => ({ ...s, on: s.on === open ? 'in' : ren(s.on) }));
    return { id, pieces, sockets };
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
  versions: [3, 4].map((n) => ({ id: n === 3 ? 'old' : 'four-stumps', groups: [gRest([400, 440]), gLowStumps(n as 3 | 4), gBusy(['log']), (k: string, after: string | null) => { const g = gSoftGaps()(k, after); g.sockets.push(dot(`${k}gaps`, g.pieces[0].key, 0.1, 'hint.1-1.gaps')); return g; }, gRest([260, 320], true)] })),
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
  versions: [{ id: 'old', groups: [gShelf(), gDoubleGaps([[0.85, 0.89], [0.89, 0.93], [0.91, 0.95]]), gRest([200, 260]), gStones([60, 70, 50], [0.6, 0.72], true)] }],
  feel: ['1-1'], not: NOT_11, rating: 5,
  source: "w1Sections '1-1' twist 'gaps' (on main 273-280): practiceShelf, gapRun(reachTwo x 0.62/0.72/0.82), a run of 200-260, pillars [60,70,50] dbl at 0.6-0.72",
});
const twistLeapStones = section({
  id: 'w1-leap-stones', floor: 'jump', name: 'leaps and stones', phases: ['ten', 'ketsu'], difficulty: 6, needs: ['double'], uses: ['double'],
  versions: [{ id: 'two-gaps', groups: [gRest([200, 260]), gDoubleGaps([[0.85, 0.89], [0.89, 0.93]]), gStones([60, 70, 50], [0.6, 0.72], true), gStones([50, 60, 60, 50], [0.6, 0.72], true)] },
    { id: 'one-gap', groups: [gRest([200, 260]), gDoubleGaps([[0.85, 0.89]]), gStones([60, 70, 50], [0.6, 0.72], true), gBusy(['dip']), gStones([50, 60, 50], [0.6, 0.72], true)] }],
  feel: ['1-1'], not: NOT_11, rating: 6,
  source: "w1Sections '1-1' twist 'stoneLeaps' and 'highLeaps' (on main 284-302) less the practice shelf (in w1-second-jump): gapRun(reachTwo x 0.62[/0.72]), pillars [60,70,50] dbl, busy(2, [leap, dip]), pillars [50,60,60,50] dbl",
});
const twistHighLeaps = section({
  id: 'w1-high-leaps', name: 'high boughs', phases: ['ten', 'ketsu'], difficulty: 6, needs: ['double'], uses: ['double', 'bounce'],
  versions: [{ id: 'three-three', groups: [gRest([150, 210]), gHighLeaps(3, true), gHighLeaps(3, true)] }, { id: 'four', groups: [gRest([150, 210]), gHighLeaps(4, true), gBusy(['dip'])] }],
  feel: ['1-1'], not: NOT_11, rating: 6, window: [0.67, 1],
  source: "w1Sections '1-1' twist 'highLeaps' (on main 290-291): highLeaps(3, dbl) then highLeaps(4, dbl); the second run kept at 3 here for the brief's 20 s",
});
/** w1Sections '1-1' finish: 'hopBounce', 'bounceRun', 'stoneRoad' (on main 304-331), one round of each fill */
const finishHopBounce = section({
  id: 'w1-hop-bounce', floor: 'hop', name: 'bounce walls', phases: ['sho', 'ketsu'], difficulty: 4, needs: ['jump'], teaches: 'bounce',
  versions: [{ id: 'walls', groups: [gRest([150, 210]), gBounceWall(), gBounceWall(), gLogHop()] }, { id: 'wall-leap', groups: [gRest([150, 210]), gBounceWall(), gLogHop(), gBounceWall(), gDip()] }],
  feel: ['1-1', '1-3'], not: NOT_11, rating: 4,
  source: "w1Sections '1-1' finish 'hopBounce' (on main 306-311): bounceWall, then bounceWall + run 60-90 + logHop, or bounceWall + leap",
});
const finishBounceRun = section({
  id: 'w1-bounce-run', name: 'up and along', phases: ['ketsu'], difficulty: 6, needs: ['double'], uses: ['bounce', 'double'],
  versions: [{ id: 'five', groups: [gRest([150, 210]), gHighLeaps(5, true), gBusy(['dip'])] }, { id: 'three-wall', groups: [gRest([150, 210]), gHighLeaps(3, false), gBounceWall()] }],
  feel: ['1-1'], not: NOT_11, rating: 6, window: [0.67, 1],
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
  id: 'w1-meadow', floor: 'hop', name: 'home meadow', phases: ['rest', 'start'], difficulty: 1, // (Round 2 (d): not goal; 1-1 ends on the high log)
  needs: ['jump'],
  versions: [{ id: 'stumps', groups: [gRest([400, 440], true), gLowStumps(3), gBusy(['log', 'dip', 'log'])] }, { id: 'rocks', groups: [gRest([400, 440], true), gBusy(['log', 'log', 'dip']), gLowStumps(3)] }],
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
  versions: [{ id: 'ledges', groups: [gRest([150, 210]), gLedge(), gBusy(['log']), gLedge()] }, { id: 'walls', groups: [gRest([150, 210]), gLowBoughs(3, 130), gBounceWall(), gBusy(['dip'])] }],
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
 *  the boughs); its top 100 px under the bough's, head room 76 px under the bough */
const lowLog = (key: string, over: string, at: R2): W1Piece => limb(key, { kind: 'over', on: over, at, dy: [96, 104] }, [180, 220], 'log', false);
/** the exit totem's socket on the end log (the ruling: an `objective` socket; main's stageGenerator.ts:2136 gen.item('exit_totem')) */
const totem = (on: string): Socket => ({ id: 'exit-totem', role: 'objective', on, t: 0.85, allow: ['exit_totem'] });
/** 1-1's clue, the bootprint, on the end log's walking line 200-260 px WEST of the totem, so he walks over it before the door (the lead,
 *  11-05, on the mixed 1-1's still: there it lay past the door). On a 685 px log with the totem at t 0.85 (582 px): t 0.47-0.56 */
const clue = (on: string): Socket => ({ id: 'clue', role: 'decor', on, t: [0.47, 0.56], dn: 0, allow: ['bootprint'] });

/** #1 stump stile: stumps stepping up then down (or down then up) over the floor */
const gStile = (hs: number[]): G => (k, after) => {
  const f = floor(`${k}f`, [hs.length * 250 + 260, hs.length * 270 + 300], startOr(after));
  const ps = hs.map((h, j) => stumpL(`${k}s${j}`, f.key, [(j + 0.5) / hs.length - 0.04, (j + 0.5) / hs.length - 0.01], [h, h + 6]));
  return { pieces: [f, ...ps], sockets: ps.map((p) => petals(`p-${p.key}`, p.key, 0.5, 1)), last: f.key };
};
/** #2 stone zigzag: stones at two (or three) heights, every upper one seated on a mound (a bank top), the floor walk beside */
const gZigzag = (tiers: 2 | 3, log: boolean): G => (k, after) => {
  const f = floor(`${k}f`, [320, 380], startOr(after));
  const m1 = bankW(`${k}m1`, f.key, [-55, -45], [340, 400]);
  const f2 = bankW(`${k}g2`, m1.key, [45, 55], [320, 380]);
  const up: W1Piece[] = log ? [post(`${k}u1`, m1.key, [0.45, 0.55], [30, 40]), logOn(`${k}l1`, `${k}u1`)] : [stumpL(`${k}u1`, m1.key, [0.4, 0.6], [40, 50])];
  const pieces = [f, stumpL(`${k}s0`, f.key, [0.5, 0.65], [40, 50]), m1, ...up, f2, stumpL(`${k}s2`, f2.key, [0.4, 0.6], [40, 50])];
  let last = f2.key;
  if (tiers === 3) {
    const m2 = bankW(`${k}m2`, f2.key, [-85, -75], [340, 400]), f3 = bankW(`${k}g3`, m2.key, [75, 85], [300, 360]);
    pieces.push(m2, stumpL(`${k}u2`, m2.key, [0.4, 0.6], [40, 50]), f3);
    last = f3.key;
  }
  const tops = pieces.filter((p) => p.key.includes('s') || p.key.includes('u2') || p.key.includes('l1') || (!log && p.key.endsWith('u1')));
  return { pieces, sockets: tops.map((p) => petals(`p-${p.key}`, p.key, 0.5, 1)), last };
};
/** #3 / #14: a road of thin logs on posts over the floor, 100-120 px up (head room 76-96 >= Pokey's 48 + 20) */
const gLogRoad = (n: number, ends: boolean, hops = false, withFind = false): G => (k, after) => {
  const pieces: W1Piece[] = []; const sockets: Socket[] = [];
  let prev = after;
  if (ends) { const a = floor(`${k}a`, [200, 240], startOr(after)); const st = bankW(`${k}st`, a.key, [-45, -35], [170, 200]); pieces.push(a, st); prev = st.key; }
  const f: W1Piece = ends ? bankW(`${k}f`, prev!, [35, 45], [n * 300 + 100, n * 320 + 120]) : floor(`${k}f`, [n * 300 + 100, n * 320 + 120], startOr(prev));
  pieces.push(f);
  seq(n, (j) => {
    const p = post(`${k}p${j}`, f.key, [(j + 0.5) / n - 0.02, (j + 0.5) / n], j === n - 1 && n > 3 ? [92, 96] : [76, 86]);
    const l = logOn(`${k}l${j}`, p.key, [180, 240], !hops);
    pieces.push(p, l); sockets.push(petals(`p-${l.key}`, l.key, [0.3, 0.7], 2, 100));
    if (hops && j < n - 1) { const s = stump(`${k}h${j}`, f.key, [(j + 1) / n - 0.02, (j + 1) / n], [34, 46], [120, 154]); pieces.push(s); sockets.push(petals(`p-${s.key}`, s.key, 0.5, 1)); }
  });
  if (withFind) sockets.push(find(`${k}find`, `${k}l${n - 1}`));
  let last = f.key;
  if (ends) { const e = bankW(`${k}e`, f.key, [-45, -35], [170, 200]); const o = bankW(`${k}o`, e.key, [35, 45], [220, 260]); pieces.push(e, o); last = o.key; }
  return { pieces, sockets, last };
};
/** a perched mushroom: a stump on `on`, the mushroom on the stump (the perch rule, Q2) */
const perch = (k: string, on: string, at: R2): W1Piece[] => [stumpL(`${k}st`, on, at, [46, 56]), mushroom(`${k}m`, `${k}st`, [0.4, 0.6])];

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
  versions: [4, 5, 6].map((n) => ({ id: `logs${n}`, groups: [gRest([140, 180]), gLogRoad(n, true)] })),
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
    const a = after === 'stump' ? stumpL(`${k}a`, f.key, [0.92, 0.95], [40, 50]) : stump(`${k}a`, f.key, [0.92, 0.95], [30, 36], LAND);
    return { pieces: [f, step, H, a], sockets: [petals(`${k}ph`, H.key, [0.3, 0.7], 2, 120), petals(`${k}pa`, a.key, 0.5, 1), find(`${k}find`, H.key)], last: f.key };
  })] }))),
  feel: ['1-1', '1-2'], not: NOT_11, rating: 3,
  source: 'W1-NEW-SECTIONS #4: LABELS §2 hollow log (a two-road split, W1 art in the w1-new atlas); the stump step is the porter\'s (the top is past one jump at the art\'s own height)',
});
/** #5 */
const mushroomLift = section({
  id: 'w1-mushroom-lift', name: 'first lift', phases: ['sho'], difficulty: 2, teaches: 'bounce', ports: ['ground', 'ledge'], exitDy: -210,
  versions: [
    { id: 'mound', groups: [gRest([160, 200]), gStile([40, 76, 100, 76, 40]), (k, after) => { const f = floor(`${k}f`, [520, 600], startOr(after)); const L = bankW(`${k}L`, f.key, [-220, -200], [330, 400]); /* (B3 as amended: the floor ends at the bank face, its lip 200-220 up) */ return { pieces: [f, mushroom(`${k}m`, f.key, [0.7, 0.8]), L], sockets: [tip(f.key, 0.05), petals(`${k}pl`, L.key, [0.3, 0.7], 2)], last: L.key }; }] },
    { id: 'log-road', groups: [gRest([160, 200]), gStile([40, 76, 100, 76, 40]), (k, after) => { const f = floor(`${k}f`, [520, 600], startOr(after)); const B = bankW(`${k}B`, f.key, [-220, -200], [300, 340]); const P = post(`${k}P`, B.key, [0.6, 0.7], [70, 80]); const L = logOn(`${k}L`, P.key, [240, 300]); return { pieces: [f, mushroom(`${k}m`, f.key, [0.7, 0.8]), B, P, L], sockets: [tip(f.key, 0.05), petals(`${k}pl`, L.key, [0.3, 0.7], 2)], last: L.key }; }] },
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
    seq(n, (j) => { pieces.push(...perch(`${k}${j}`, `${k}L${j}`, [0.5, 0.6]), bankW(`${k}L${j + 1}`, `${k}L${j}`, [-130, -110], [260, 320])); sockets.push(petals(`p${k}${j}`, `${k}L${j + 1}`, [0.3, 0.7], 2)); });
    const top = `${k}L${n}`, rise = n * 120;
    if (down === 'stair') { pieces.push(bankW(`${k}d1`, top, [110, 130], [200, 240]), bankW(`${k}d2`, `${k}d1`, [rise / 2 - 10, rise / 2 + 10], [200, 240]), bankW(`${k}o`, `${k}d2`, [rise / 2 + 90, rise / 2 + 110], [260, 300])); return { pieces, sockets, last: `${k}o` }; }
    pieces.push({ ...floor(`${k}o`, [300, 360]), place: { kind: 'jump', after: top, dy: [rise + 90, rise + 110], share: [0.25, 0.35] } });
    return { pieces, sockets, last: `${k}o` };
  }, gStile([40, 76, 40])] }))),
  feel: ['1-1', '1-5'], not: NOT_11, rating: 4,
  source: 'W1-NEW-SECTIONS #6: two (or three) perched mushrooms, each a step higher, then down by stair or drop; the pair on one beat (LEDGER-11-02:33)',
});
/** #7 */
const fallenTrunk = section({
  id: 'w1-fallen-trunk', floor: 'hop', name: 'the fallen trunk', phases: ['ten'], difficulty: 5, needs: ['double'], uses: ['double'],
  versions: [false, true].map((m) => ({ id: m ? 'mushroom' : 'double', groups: [gRest([160, 200]), times(3, (k, after) => {
    const f = floor(`${k}f`, [820, 900], startOr(after));
    const T: W1Piece = { key: `${k}T`, shape: 'block', w: [220, 260], place: { kind: 'on', on: f.key, at: [0.5, 0.55], h: [150, 165] }, style: 'log', landing: true };
    return { pieces: [f, ...(m ? [mushroom(`${k}m`, f.key, [0.28, 0.32])] : []), T], sockets: [petals(`${k}pt`, T.key, [0.3, 0.7], 2)], last: f.key };
  }), gRest([200, 260])] })),
  feel: ['1-1', '1-3'], not: NOT_11, rating: 5,
  source: 'W1-NEW-SECTIONS #7: a fallen log too tall for one jump, a double over it or a mushroom beside it (LEDGER-ENGINE-GEMINI:479)',
});
/** #8 */
const doubleTeach = section({
  id: 'w1-double-teach', floor: 'hop', name: 'double over the dip', phases: ['ki'], difficulty: 3, needs: ['double'], teaches: 'double', maxPerStage: 1,
  versions: [4, 5].map((n) => ({ id: `gaps${n}`, groups: [(k, after) => { const g = gRest([300, 360])(k, after); g.sockets.push(dot(`${k}nice`, g.last, 0.2, 'coach.nice')); return g; }, gDoubleGaps(([[0.85, 0.89], [0.89, 0.93], [0.91, 0.95], [0.91, 0.95], [0.91, 0.95], [0.91, 0.95]] as R2[]).slice(0, n + 1)), (k: string, after: string | null) => { const g = gRest([200, 240])(k, after); g.sockets.push(dot(`${k}dbl`, g.last, 0.3, 'hint.1-1.double')); return g; }] })),
  feel: ['1-1'], not: NOT_11, rating: 3,
  source: 'W1-NEW-SECTIONS #8: one gap just past a single jump over a safe dip (soft pit: a floor under it, stair steps back, pipeline pitUnder/pitSteps), then two more (R2, the 3:11 ruling)',
});
/** #9 */
const boughStepup = section({
  id: 'w1-bough-stepup', name: 'into the boughs', phases: ['sho'], difficulty: 4, needs: ['jump'], ports: ['ground', 'ledge'], exitDy: -440, window: BOUGH_WINDOW,
  versions: [5, 6].flatMap((n) => [false, true].map((log) => ({ id: `${n}${log ? '-log' : ''}`, groups: [gRest([160, 200]), gStile([40, 76, 40]), (k: string, after: string | null) => {
    const f = floor(`${k}f`, [n * 260 + 500, n * 280 + 560], startOr(after));
    const pieces: W1Piece[] = [f, bough(`${k}b0`, f.key, [0.25, 0.3], [-100, -90], [200, 240], true)];
    let prev = `${k}b0`;
    seq(n - 1, (j) => {
      const key = `${k}b${j + 1}`;
      if (log && j === 0) { pieces.push(post(`${k}P`, f.key, [0.5, 0.55], [150, 165]), logOn(key, `${k}P`)); } else pieces.push(limb(key, { kind: 'jump', after: prev, dy: [-90, -70], share: [0.4, 0.5] }, [200, 240]));
      prev = key;
    });
    return { pieces, sockets: [petals(`${k}pf`, f.key, [0.6, 0.9], 2)], last: prev };
  }] }))),
  feel: ['1-1', '1-5'], not: NOT_11, rating: 4,
  source: 'W1-NEW-SECTIONS #9: low boughs on one plain W1 trunk (the planner lays it; not the kapok, no climb, no view) rising from the floor road; LATE only (window); "a ground stage that becomes a tree stage" (9:20 ruling)',
});
/** canopy boughs: `n` rises each a double (share past a single) from a start bough; catch boughs under the gaps are the engine's (catchDrop) */
const gRungs = (n: number, rise: R2, kind: 'jump' | 'double', share: R2, w: R2 = [200, 260]): G => (k) => {
  const pieces: W1Piece[] = [limb(`${k}r0`, { kind: 'start' }, [260, 320])];
  seq(n, (j) => pieces.push(limb(`${k}r${j + 1}`, { kind, after: `${k}r${j}`, dy: rise, share }, w)));
  return { pieces, sockets: [dot(`${k}nomoss`, `${k}r0`, 0.7, 'hint.1-1.noMoss')], last: `${k}r${n}` };
};
/** #10 */
const canopyRungs = section({
  id: 'w1-canopy-rungs', name: 'canopy rungs', phases: ['ten'], difficulty: 7, needs: ['double'], uses: ['double'], ports: ['ledge', 'ledge'], exitDy: -590, window: BOUGH_WINDOW,
  // (NODES §8.7 B2a as amended, 891908b5b: a block rise 130-145 px, past a single's 108 and under the 148 px clamp); 4-5 rungs, wide, for the 10 s inside the 900 px corridor (the porter's note to the designer, 11-05)
  versions: [[4, [500, 580]], [5, [380, 440]]].map(([n, w]) => ({ id: `rungs${n}`, groups: [gRungs(n as number, [-145, -130], 'double', [0.3, 0.45], w as R2)] })),
  feel: ['1-1'], not: NOT_11, rating: 7,
  source: "W1-NEW-SECTIONS #10: the brief's double chain (1-1.md:21-22); catch boughs 60-120 under each gap are the engine's (floorRoll.catchDrop 90, the planner's); left or right leaning by the mirror",
});
/** #11 */
const highWalk = section({
  id: 'w1-high-walk', name: 'high branch, petals low', phases: ['rest'], difficulty: 1, needs: ['walk'], ports: ['ledge', 'ledge'], window: BOUGH_WINDOW,
  versions: [{ id: 'long', groups: [(k) => ({ pieces: [limb(`${k}a`, { kind: 'start' }, [420, 460]), limb(`${k}b`, { kind: 'walk', after: `${k}a`, dy: [0, 0] }, [380, 440]), lowLog(`${k}lo`, `${k}a`, [0.3, 0.4])], sockets: [dot(`${k}high`, `${k}a`, 0.4, 'hint.1-1.high'), petals(`${k}p`, `${k}lo`, [0.3, 0.7], 3, 140)], last: `${k}b` })] },
    { id: 'step', groups: [(k) => ({ pieces: [limb(`${k}a`, { kind: 'start' }, [360, 400]), limb(`${k}b`, { kind: 'walk', after: `${k}a`, dy: [-30, -20] }, [360, 420]), lowLog(`${k}lo`, `${k}a`, [0.3, 0.4])], sockets: [dot(`${k}high`, `${k}a`, 0.4, 'hint.1-1.high'), petals(`${k}p`, `${k}lo`, [0.3, 0.7], 3, 140)], last: `${k}b` })] }],
  feel: ['1-1', '1-5'], not: NOT_11, rating: 1,
  source: 'W1-NEW-SECTIONS #11: a rest about 2x the beat (C2), a Dot spot; petals low on a low log under the branch (brief :26; the ruling 08c5a2944, trunks dropped)',
});
/** #12 */
const dropdownStair = section({
  id: 'w1-dropdown-stair', name: 'drop and climb back', phases: ['sho'], difficulty: 3, needs: ['jump'], ports: ['ledge', 'ground'], exitDy: 110,
  versions: [2, 3, 4].map((n) => ({ id: `steps${n}`, groups: [(k: string) => {
    const deep = n * 45;
    const a: W1Piece = { key: `${k}a`, shape: 'bank', w: [300, 360], place: { kind: 'start' }, style: 'moss_stone', main: true, landing: true };
    const f = bankW(`${k}f`, a.key, [110 + deep - 2, 110 + deep + 2], [n * 160 + 260, n * 170 + 300]);
    const st = Array.from({ length: n - 1 }, (_, j) => stumpL(`${k}s${j}`, f.key, [1 - (n - 1 - j) * 0.3, 1 - (n - 1 - j) * 0.3 + 0.02].map((v) => Math.max(0, Math.min(1, v))) as R2, [(j + 1) * 45 - 2, (j + 1) * 45 + 2]));
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
    seq(n, (j) => { const key = `${k}m${j}`; pieces.push(bankW(key, prev, [-50, -40], j === n - 1 ? [300, 360] : [180, 220])); prev = key; });
    const up = n * 45;
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
/** #15: the exit totem an `objective` socket on the end log; the bootprint the held clue's place (R-165.31), reported */
const quietArrival = section({
  id: 'w1-quiet-arrival', name: 'quiet arrival', phases: ['goal'], difficulty: 1, needs: ['walk'], ports: ['ledge', 'ledge'], window: BOUGH_WINDOW,
  versions: [[240, 280], [520, 600]].map((w, j) => ({ id: j ? 'long' : 'short', groups: [(k: string) => ({ pieces: [limb(`${k}a`, { kind: 'start' }, w as R2), limb(`${k}L`, { kind: 'walk', after: `${k}a`, dy: [0, 0] }, END_LOG, 'log'), lowLog(`${k}lo`, `${k}a`, [0.2, 0.3])], sockets: [totem(`${k}L`), clue(`${k}L`), petals(`${k}p`, `${k}lo`, [0.3, 0.7], 2)], last: `${k}L` })] })),
  feel: ['1-1'], not: NOT_11, rating: 1,
  source: "W1-NEW-SECTIONS #15: a calm high-branch walk onto the long high log (main's old 1-1 end: 685 px, exit_totem, no shrine); 1-1.md:23; stageClue.ts:16",
});
/** #16 */
const forestEdge = section({
  id: 'w1-forest-edge', floor: 'hop', name: "the forest's edge", phases: ['start'], difficulty: 1, needs: ['walk'], maxPerStage: 1,
  versions: [{ id: 'two', groups: [(k) => { const a = floor(`${k}a`, [640, 700]); const b = bankW(`${k}b`, a.key, [0, 0], [660, 720]); return { pieces: [a, b], sockets: [dot(`${k}tip`, a.key, 0.1, 'coach.run'), decor(`${k}sq`, a.key, [0.6, 0.7]), petals(`${k}p`, b.key, [0.3, 0.6], 2)], last: b.key }; }] },
    { id: 'three-step', groups: [(k) => { const a = floor(`${k}a`, [440, 480]); const b = bankW(`${k}b`, a.key, [-30, -24], [440, 480]); const c = bankW(`${k}c`, b.key, [24, 30], [440, 480]); return { pieces: [a, b, c], sockets: [dot(`${k}tip`, a.key, 0.1, 'coach.run'), decor(`${k}sq`, a.key, [0.6, 0.7]), petals(`${k}p`, b.key, [0.3, 0.6], 2)], last: c.key }; }] }],
  feel: ['1-1'], not: NOT_11, rating: 1,
  source: "W1-NEW-SECTIONS #16: flat home-edge banks, no gaps in the first 1,300 px, the squirrels' spot clear of the spawn, coach.run (brief :19; STAGE-RULES:161)",
});
/** #17 */
const fernBank = section({
  id: 'w1-fern-bank', floor: 'hop', name: 'fern bank', phases: ['rest'], difficulty: 1, needs: ['walk'],
  versions: [[true, [760, 840]], [false, [520, 600]]].map(([step, w]) => ({ id: step ? 'long-step' : 'short', groups: [(k: string, after: string | null) => {
    const a = floor(`${k}a`, w as R2, startOr(after)); const b = bankW(`${k}b`, a.key, [0, 0], [260, 300]);
    const s = step ? [stump(`${k}s`, a.key, [0.6, 0.7], [34, 40], LAND)] : [];
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
  versions: ([[300, 340], [460, 520]] as R2[]).map((w, j) => ({ id: j ? 'long' : 'short', groups: [(k: string) => ({ pieces: [limb(`${k}a`, { kind: 'start' }, [260, 300]), limb(`${k}b`, { kind: 'walk', after: `${k}a`, dy: [0, 0] }, w), lowLog(`${k}lo`, `${k}b`, [0.3, 0.4])], sockets: [dot(`${k}high`, `${k}a`, 0.3, 'hint.1-1.high'), petals(`${k}p`, `${k}lo`, [0.3, 0.7], 2)], last: `${k}b` })] })),
  feel: ['1-1'], not: NOT_11, rating: 1,
  source: 'W1-NEW-SECTIONS #19: a long thick bough between two plain W1 trunks, after the moment (rulebook §4 rule 3); petals low on a low log under it (the ruling 08c5a2944)',
});
/** #20: floating thin logs at rising heights, each a double up (the ruling 08c5a2944: they replace the too-tall stumps) */
const stumpTowers = section({
  id: 'w1-stump-towers', floor: 'jump', name: 'stump towers', phases: ['ten'], difficulty: 5, needs: ['double'], uses: ['double'],
  versions: [4, 5].map((n) => ({ id: `towers${n}`, groups: [gRest([200, 260]), (k: string, after: string | null) => {
    const pieces: W1Piece[] = []; let prev = after!;
    seq(n, (j) => { const key = `${k}t${j}`; pieces.push(limb(key, { kind: 'double', after: prev, dy: [-145, -130], share: [0.2, 0.3], soft: true }, LAND, 'log')); prev = key; }); // (NODES §8.7 B2a as amended, 891908b5b: a block rise 130-145 px, past a single's 108 and under the 148 px clamp)
    pieces.push({ ...floor(`${k}o`, [300, 360]), place: { kind: 'jump', after: prev, dy: [n * 140 - 10, n * 140 + 10], share: [0.25, 0.35], soft: true } });
    return { pieces, sockets: pieces.slice(0, n).map((p) => petals(`p-${p.key}`, p.key, 0.5, 1)), last: `${k}o` };
  }, gStile([40, 76, 40])] })),
  feel: ['1-1'], not: NOT_11, rating: 5,
  source: 'W1-NEW-SECTIONS #20: towers of rising height, each a double up, the floor road below (soft pits: a fall is a walk back)',
});
/** #21 */
const bounceDouble = section({
  id: 'w1-bounce-double', name: 'bounce, then fly', phases: ['ten'], difficulty: 6, needs: ['double'], uses: ['bounce', 'double'], ports: ['ground', 'ledge'], exitDy: -320,
  versions: ([[-290, -270], [-320, -300]] as R2[]).map((dy, j) => ({ id: j ? 'high' : 'low', groups: [gRest([200, 240]), gStile([40, 76, 100, 76, 40]), (k: string, after: string | null) => {
    const f = floor(`${k}f`, [700, 780], startOr(after));
    const L = limb(`${k}L`, { kind: 'over', on: f.key, at: [0.7, 0.75], dy }, [400, 480], 'log');
    return { pieces: [f, ...perch(k, f.key, [0.2, 0.25]), L], sockets: [petals(`${k}pl`, L.key, [0.3, 0.7], 2)], last: L.key };
  }] })),
  feel: ['1-1'], not: NOT_11, rating: 6,
  source: 'W1-NEW-SECTIONS #21: a perched mushroom\'s bounce, then a double onto a high log road (LEDGER-11-02:33); a stump stile before it for the 10 s; the high log floats (platforms may)',
});
/** #22 */
const canopyWeave = section({
  id: 'w1-canopy-weave', name: 'canopy weave', phases: ['ketsu'], difficulty: 6, needs: ['double'], uses: ['double'], ports: ['ledge', 'ledge'], window: BOUGH_WINDOW,
  versions: [5, 6].map((n) => ({ id: `high${n}`, groups: [(k: string) => {
    const pieces: W1Piece[] = [limb(`${k}a`, { kind: 'start' }, [260, 320])];
    let hi = `${k}a`, mid = `${k}a`;
    seq(n, (j) => {
      pieces.push(limb(`${k}h${j}`, { kind: j ? 'double' : 'jump', after: hi, dy: j ? [-10, 10] : [-145, -130], share: j ? [0.55, 0.65] : [0.3, 0.45] }, [200, 240]));
      pieces.push(limb(`${k}m${j}`, { kind: 'jump', after: mid, dy: j ? [-10, 10] : [25, 35], share: [0.45, 0.55] }, [200, 240], 'branch', false));
      hi = `${k}h${j}`; mid = `${k}m${j}`;
    });
    pieces.push(limb(`${k}o`, { kind: 'jump', after: hi, dy: [130, 145], share: [0.3, 0.4] }, [260, 320]));
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
    pieces.push(limb(`${k}L`, { kind: 'walk', after: pieces[pieces.length - 1].key, dy: [-32, -28] }, END_LOG, 'log'), lowLog(`${k}lo`, `${k}a`, [0.2, 0.3]));
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
    const t = bankW(`${k}t`, a.key, [-110, -100], [200, 240]);
    const f = bankW(`${k}f`, t.key, [100, 110], [(dn + up) * 230 + 200, (dn + up) * 250 + 240]);
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
    const a = floor(`${k}a`, [260, 300], startOr(after));
    const pieces: W1Piece[] = [a]; let prev = a.key;
    seq(n, (j) => { const key = `${k}m${j}`; pieces.push(bankW(key, prev, [-50, -40], j === n - 1 ? [380, 440] : [180, 220])); prev = key; });
    const top = prev, up = n * 45;
    pieces.push(limb(`${k}L`, { kind: 'over', on: top, at: [0.15, 0.25], dy: [-24, -24] }, [200, 240], 'log', false));
    pieces.push(bankW(`${k}d`, top, [up / 2 - 5, up / 2 + 5], [200, 240]), bankW(`${k}o`, `${k}d`, [up / 2 - 5, up / 2 + 5], [260, 320]));
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
    const L: W1Piece = { key: `${k}L`, shape: 'block', w: two ? [520, 580] : [640, 720], place: { kind: 'on', on: a.key, at: [0.1, 0.15], h: [30, 34] }, style: 'log', landing: true };
    const L2: W1Piece[] = two ? [{ key: `${k}L2`, shape: 'block', w: [240, 280], place: { kind: 'on', on: a.key, at: [0.85, 0.9], h: [30, 34] }, style: 'log', landing: true }] : [];
    const s = stump(`${k}s`, a.key, [0.98, 1], [34, 40], LAND);
    const b = bankW(`${k}b`, a.key, [0, 0], [240, 280]);
    return { pieces: [a, L, ...L2, s, b], sockets: [{ ...decor(`${k}fern`, a.key, [0.05, 0.1]), allow: ['w1Fern'] }, { ...decor(`${k}lit`, a.key, [0.6, 0.7]), allow: ['w1LeafLitter'] }, petals(`${k}p`, s.key, 0.5, 2)], last: b.key };
  }] })),
  feel: ['1-1'], not: NOT_11, rating: 1,
  source: 'W1-NEW-SECTIONS #26: a long fallen log lying ON the floor, a calm walk along its top; ferns and leaf litter; petals low on a stump (C2; LABELS §1, §5; D38)',
});
/** #27: thin logs that float (platforms may, the ruling 08c5a2944), each a double from the last */
const stiltLogs = section({
  id: 'w1-stilt-logs', floor: 'jump', name: 'high stump logs', phases: ['ten'], difficulty: 5, needs: ['double'], uses: ['double'],
  versions: [4, 5].map((n) => ({ id: `logs${n}`, groups: [gRest([200, 260]), (k: string, after: string | null) => {
    const pieces: W1Piece[] = []; let prev = after!;
    seq(n, (j) => { const key = `${k}l${j}`; pieces.push(limb(key, { kind: 'double', after: prev, dy: [-145, -130], share: [0.3, 0.4], soft: true }, [180, 240], 'log')); prev = key; }); // (NODES §8.7 B2a as amended, 891908b5b: a block rise 130-145 px, past a single's 108 and under the 148 px clamp)
    pieces.push({ ...floor(`${k}o`, [300, 360]), place: { kind: 'jump', after: prev, dy: [n * 140 - 10, n * 140 + 10], share: [0.25, 0.35], soft: true } });
    return { pieces, sockets: pieces.slice(0, n).map((p) => petals(`p-${p.key}`, p.key, 0.5, 1)), last: `${k}o` };
  }, gStile([40, 76, 40])] })),
  feel: ['1-1'], not: NOT_11, rating: 5,
  source: 'W1-NEW-SECTIONS #27: thin logs at rising heights, each a double from the last, the floor road below (the 12:51 and 3:40 log rules)',
});
/** #28 */
const twoAnswers = section({
  id: 'w1-two-answers', floor: 'hop', name: 'two answers', phases: ['ten'], difficulty: 6, needs: ['double'], uses: ['double'],
  versions: [true, false].map((m) => ({ id: m ? 'mushroom' : 'double', groups: [gRest([200, 240]), times(3, (k: string, after: string | null) => {
    const f = floor(`${k}f`, [500, 560], startOr(after));
    const o = softGap(`${k}o`, f.key, [300, 360], [0.85, 0.89], 'double') /* (a block: share 0.85+, the designer's 891908b5b) */;
    return { pieces: [f, ...(m ? perch(k, f.key, [0.7, 0.75]) : []), o], sockets: [{ id: `${k}arc`, role: 'arc', on: o.key, t: 0 }], last: o.key };
  })] })),
  feel: ['1-1'], not: NOT_11, rating: 6,
  source: 'W1-NEW-SECTIONS #28: a gap past a single jump; a perched mushroom on the near bank as the other way across (LEDGER-11-02:33)',
});
/** #29 (no rope: the span is a thick log held at both ends by the top boughs, Round 3 story fix) */
const boughLog = section({
  id: 'w1-bough-log', name: 'bough stair and log span', phases: ['ketsu'], difficulty: 5, needs: ['double'], uses: ['double'], ports: ['ledge', 'ledge'], exitDy: -440, window: BOUGH_WINDOW,
  // (NODES §8.7 B2a as amended, 891908b5b: a block rise 130-145 px, past a single's 108 and under the 148 px clamp); 4-5 boughs, wide, inside the corridor
  versions: [4, 5].flatMap((n) => [true, false].map((span) => ({ id: `${n}-${span ? 'log' : 'bough'}`, groups: [(k: string) => {
    const pieces: W1Piece[] = [limb(`${k}b0`, { kind: 'start' }, [240, 280])];
    seq(n - 1, (j) => pieces.push(limb(`${k}b${j + 1}`, { kind: 'double', after: `${k}b${j}`, dy: [-145, -130], share: [0.3, 0.45] }, n === 4 ? [460, 540] : [360, 440])));
    const top = `${k}b${n - 1}`;
    pieces.push(span ? limb(`${k}S`, { kind: 'walk', after: top, dy: [0, 0] }, [380, 440], 'log') : limb(`${k}S`, { kind: 'double', after: top, dy: [-10, 0], share: [0.55, 0.65] }, [200, 240]));
    pieces.push(limb(`${k}o`, { kind: 'walk', after: `${k}S`, dy: [0, 0] }, [200, 240]));
    return { pieces, sockets: [], last: `${k}o` };
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
    const b = bough(`${k}b`, `${k}st`, [0.2, 0.4], [-(Math.round(DOUBLE_RISE) + 50), -(Math.round(DOUBLE_RISE) + 50)], [200, 240]);
    return { pieces: [f, ...perch(k, f.key, [0.3, 0.35]), b], sockets: [{ id: 'seed', role: 'find', on: b.key, t: 0.5, dn: 70 }], last: f.key };
  }, gStile([40, 76, 100, 76, 40])] }],
  feel: ['1-1'], not: NOT_11, rating: 4,
  source: "the planner's seed perch (4:27 PM): mixer/post.ts placeSeed (a bough DOUBLE_RISE + 50 over the perch, reached by the bounce and a double)",
});

/** the designer's sections entered (all 30) and the planner's seed perch */
export const W1_NEW: readonly W1Section[] = [stumpStile, stoneZigzag, logRoad, hollowTwoway, mushroomLift, twinBounce, fallenTrunk, doubleTeach, boughStepup, canopyRungs, highWalk, dropdownStair, knotBank, floorDash, quietArrival, forestEdge, fernBank, clearing, boughBench, stumpTowers, bounceDouble, canopyWeave, sunlitLog, stumpDescent, moundLog, logWalk, stiltLogs, twoAnswers, boughLog, lastStepUp, seedPerch];

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
};
/** the designer's content tags (NODES.md §7.7, engine-spec d4526ee5e; forks retagged by their low road). The seed perch is the porter's
 *  reading ('bounce': its find is reached by the perched mushroom), for the designer to rule */
const CONTENT: Record<string, W1Content> = {
  'w1-learn': 'ground', 'w1-stones': 'ground', 'w1-stump-stones': 'ground', 'w1-stone-dips': 'ground', 'w1-second-jump': 'ground', 'w1-leap-stones': 'ground', 'w1-stone-road': 'ground',
  'w1-high-leaps': 'floating', 'w1-low-boughs': 'floating', 'w1-cache-stones': 'bounce', 'w1-hop-bounce': 'bounce', 'w1-bounce-run': 'bounce', 'w1-ledges': 'climb', 'w1-ropes': 'rope', 'w1-meadow': 'structural',
  'w1-stump-stile': 'ground', 'w1-stone-zigzag': 'ground', 'w1-fallen-trunk': 'ground', 'w1-double-teach': 'ground', 'w1-stump-descent': 'ground',
  'w1-hollow-twoway': 'ground', 'w1-floor-dash': 'ground', 'w1-two-answers': 'ground',
  'w1-log-road': 'floating', 'w1-canopy-rungs': 'floating', 'w1-stump-towers': 'floating', 'w1-stilt-logs': 'floating', 'w1-canopy-weave': 'floating',
  'w1-bough-stepup': 'climb', 'w1-dropdown-stair': 'climb', 'w1-knot-bank': 'climb', 'w1-mound-log': 'climb', 'w1-bough-log': 'climb',
  'w1-mushroom-lift': 'bounce', 'w1-twin-bounce': 'bounce', 'w1-bounce-double': 'bounce', 'w1-seed-perch': 'bounce',
  'w1-high-walk': 'structural', 'w1-quiet-arrival': 'structural', 'w1-forest-edge': 'structural', 'w1-fern-bank': 'structural', 'w1-clearing': 'structural',
  'w1-bough-bench': 'structural', 'w1-sunlit-log': 'structural', 'w1-log-walk': 'structural', 'w1-last-step-up': 'structural',
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
};
const VERSION_JOBS: Record<string, Record<string, W1Job[]>> = { 'w1-fallen-trunk': { double: ['test'], mushroom: ['twist'] } };
export const W1_SECTIONS: readonly W1Section[] = [...HARVEST, ...W1_NEW].map((q) => ({ ...q, jobs: JOBS[q.id], content: CONTENT[q.id], terrain: TERRAIN[q.id], ...(VERSION_JOBS[q.id] ? { versionJobs: VERSION_JOBS[q.id] } : {}) }));

/** the phases a stage's slots fill */
export const W1_PHASES: readonly Phase[] = ['start', 'ki', 'sho', 'rest', 'ten', 'ketsu', 'goal'];
