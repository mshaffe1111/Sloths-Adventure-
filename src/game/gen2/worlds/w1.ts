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
import type { Phase, SectionPiece, SectionTemplate, Socket } from '../types.ts';
import { DOUBLE_RISE, reachJump } from '../../physics.ts';

/**
 * World 1's manifest rows for its floor (the planner's correction, 11-05 4:19 PM: gen2's own ground IS the floor). `ground` is the
 * continuous moss floor line sections join on with 'ground' ports (pipeline.ts:868); `pit: 'soft'` with `pitDepth` lays a floor under each
 * pit with stair steps out (pitUnder, pitSteps, pipeline.ts:735-761, :1090-1121); `floorRoll` is the per-roll floor depth the planner adds
 * to types.ts (step 1), with old 1-1's families (his numbers, 11-05 4:19 PM).
 */
export const W1_KIT = {
  ground: { y: 580, bankH: 120, style: 'moss_stone' as const },
  pit: 'soft' as const,
  pitDepth: 110,
  floorRoll: { hop: [{ range: [0.43, 0.51] as [number, number], weight: 11 }, { range: [0.74, 0.8] as [number, number], weight: 11 }, { range: [0.99, 1.0] as [number, number], weight: 10 }], shallow: 70, deep: 240, hopRoll: 0.9, jumpRoll: 0.55 },
};

/** a stage feel a section serves, and the World 1 stages it must never be used for (CHUNK-POOL-BRIEF step 2) */
export type W1Feel = '1-1' | '1-2' | '1-3' | '1-4' | '1-5' | '1-6' | '1-7' | '1-8' | '1-9';
/** what a section must never be used for, the brief's list: each is another World 1 stage's own */
export type W1Not = 'meeca-note' | 'hibiscus-trail' | 'punch' | 'combat' | 'kapok-climb' | 'view-north' | 'folded-petals' | 'chase' | 'lianas' | 'bush';
/** the brief's not-list for every section that is not that stage's (a section serving 1-3 drops 'punch'/'combat' from its own) */
export const NOT_ELSEWHERE: readonly W1Not[] = ['meeca-note', 'hibiscus-trail', 'punch', 'combat', 'kapok-climb', 'view-north', 'folded-petals', 'chase', 'lianas', 'bush'];

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
};

// ───────────────────────────── helpers (World 1's pieces, with the old builders' numbers) ─────────────────────────────

type Opt = Partial<Socket>;
const petals = (id: string, on: string, t: Socket['t'], count = 2, span = 140, o: Opt = {}): Socket => ({ id, role: 'pickup', on, t, dn: 34, count, span, ...o });
const flag = (on: string, t: Socket['t']): Socket => ({ id: 'flag', role: 'flag', on, t });
const tip = (on: string, t: Socket['t'] = 0.2): Socket => ({ id: 'tip', role: 'tip', on, t });
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
function section(o: Omit<W1Section, 'pieces' | 'entry' | 'exit' | 'sockets' | 'subBlocks' | 'mirrorable' | 'exitDy' | 'archetypes'> & { versions: Array<{ id: string; groups: G[] }> }): W1Section {
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
  const { versions: _v, ...rest } = o;
  return { ...rest, archetypes: 'any', pieces: [first], subBlocks: [{ id: 'body', versions }], entry: { piece: 'in', kind: 'ground' }, exit: { piece: 'out', kind: 'ground' }, exitDy: 0, sockets: [], mirrorable: true };
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
  id: 'w1-learn', name: 'run and jump', phases: ['start', 'ki'], difficulty: 2, needs: ['jump'], teaches: 'gap', maxPerStage: 1,
  versions: [{ id: 'old', groups: [gRest([400, 440]), gLowStumps(3), gBusy(['log']), gSoftGaps(), gRest([260, 320], true)] },
    { id: 'four-stumps', groups: [gRest([400, 440]), gLowStumps(4), gBusy(['log']), gSoftGaps(), gRest([260, 320], true)] }],
  feel: ['1-1'], not: NOT_11, rating: 2,
  source: "old 1-1 'Learn: run and jump' (protoStage.ts on main 1414-1433): rest 400-440, lowStumps, busy(1, ['log'], 240-290), soft gaps one x 0.35/0.45/0.55, a flag",
});
/** w1Sections '1-1' develop: 'stones', 'stumpStones', 'stoneDips' (on main 241-270). Each old version ran 20-26 s, past the brief's
 *  10-20 s, so each is cut at its seam (the mushroom cache) into two sections */
const STONES: Array<[string, number[]]> = [['a', [40, 80, 110, 70]], ['b', [50, 100, 70, 40]], ['c', [40, 90, 60, 100]]];
const developStones = section({
  id: 'w1-stones', name: 'stepping stones', phases: ['ki', 'sho'], difficulty: 3, needs: ['jump'], teaches: 'stones',
  versions: STONES.map(([id, hs]) => ({ id, groups: [gRest([100, 140]), gStones([60, 110, 60], [0.5, 0.62]), gBusy(['log']), gStones(hs)] })),
  feel: ['1-1'], not: NOT_11, rating: 3,
  source: "w1Sections '1-1' develop 'stones' (on main 241-246), its first half: pillars [60,110,60], busy(1-2), pillars of one of [40,80,110,70]/[50,100,70,40]/[40,90,60,100]",
});
const cacheStones = section({
  id: 'w1-cache-stones', name: 'mushroom cache and stones', phases: ['sho', 'rest'], difficulty: 3, needs: ['jump'], uses: ['bounce'], maxPerStage: 1,
  versions: [{ id: 'stones', groups: [gRest([100, 140]), gCache(), gDip(), gStones([60, 30, 90, 60], [0.58, 0.7])] }, ...STONES.map(([id, hs]) => ({ id: `dip-${id}`, groups: [gRest([100, 140]), gCache(), gBusy(['dip']), gStones(hs)] }))],
  feel: ['1-1'], not: NOT_11, rating: 3,
  source: "w1Sections '1-1' develop 'stones' and 'stumpStones' (on main 247-249, 257-259), their second halves: mushroomCache, dip or busy(1, [dip, log]), pillars [60,30,90,60] or POOL.stones",
});
const developStumpStones = section({
  id: 'w1-stump-stones', name: 'stones and stumps', phases: ['ki', 'sho'], difficulty: 3, needs: ['jump'],
  versions: [{ id: 'dips', groups: [gRest([100, 140]), gStones([60, 110, 60], [0.5, 0.62]), gLowStumps(3), gBusy(['dip', 'dip'])] }, { id: 'four', groups: [gRest([100, 140]), gStones([60, 110, 60], [0.5, 0.62]), gLowStumps(4), gBusy(['dip', 'log'])] }],
  feel: ['1-1'], not: NOT_11, rating: 3,
  source: "w1Sections '1-1' develop 'stumpStones' (on main 252-256), its first half: pillars [60,110,60], lowStumps, busy(2, [dip])",
});
const developStoneDips = section({
  id: 'w1-stone-dips', name: 'stones and dips', phases: ['sho'], difficulty: 3, needs: ['jump'],
  versions: [{ id: 'old', groups: [gRest([100, 140]), gStones([60, 110, 60], [0.5, 0.62]), gBusy(['dip', 'log', 'dip']), gLowStumps(3)] },
    { id: 'four-stumps', groups: [gRest([100, 140]), gStones([60, 110, 60], [0.5, 0.62]), gBusy(['log', 'dip']), gLowStumps(4)] }],
  feel: ['1-1'], not: NOT_11, rating: 3,
  source: "w1Sections '1-1' develop 'stoneDips' (on main 262-270), less its mushroom cache (in w1-cache-stones): pillars [60,110,60], POOL.hopDip, lowStumps",
});
/** w1Sections '1-1' twist: 'gaps', 'highLeaps', 'stoneLeaps' (on main 272-302); 'highLeaps' and 'stoneLeaps' ran 24-36 s, so cut */
const twistGaps = section({
  id: 'w1-second-jump', name: 'the second jump', phases: ['ten'], difficulty: 5, needs: ['double'], teaches: 'double', maxPerStage: 1,
  versions: [{ id: 'old', groups: [gShelf(), gDoubleGaps([[0.62, 0.66], [0.72, 0.76], [0.82, 0.86]]), gRest([200, 260]), gStones([60, 70, 50], [0.6, 0.72], true)] }],
  feel: ['1-1'], not: NOT_11, rating: 5,
  source: "w1Sections '1-1' twist 'gaps' (on main 273-280): practiceShelf, gapRun(reachTwo x 0.62/0.72/0.82), a run of 200-260, pillars [60,70,50] dbl at 0.6-0.72",
});
const twistLeapStones = section({
  id: 'w1-leap-stones', name: 'leaps and stones', phases: ['ten', 'ketsu'], difficulty: 6, needs: ['double'], uses: ['double'],
  versions: [{ id: 'two-gaps', groups: [gRest([200, 260]), gDoubleGaps([[0.62, 0.66], [0.72, 0.76]]), gStones([60, 70, 50], [0.6, 0.72], true), gStones([50, 60, 60, 50], [0.6, 0.72], true)] },
    { id: 'one-gap', groups: [gRest([200, 260]), gDoubleGaps([[0.62, 0.66]]), gStones([60, 70, 50], [0.6, 0.72], true), gBusy(['dip']), gStones([50, 60, 50], [0.6, 0.72], true)] }],
  feel: ['1-1'], not: NOT_11, rating: 6,
  source: "w1Sections '1-1' twist 'stoneLeaps' and 'highLeaps' (on main 284-302) less the practice shelf (in w1-second-jump): gapRun(reachTwo x 0.62[/0.72]), pillars [60,70,50] dbl, busy(2, [leap, dip]), pillars [50,60,60,50] dbl",
});
const twistHighLeaps = section({
  id: 'w1-high-leaps', name: 'high boughs', phases: ['ten', 'ketsu'], difficulty: 6, needs: ['double'], uses: ['double', 'bounce'],
  versions: [{ id: 'three-three', groups: [gRest([150, 210]), gHighLeaps(3, true), gHighLeaps(3, true)] }, { id: 'four', groups: [gRest([150, 210]), gHighLeaps(4, true), gBusy(['dip'])] }],
  feel: ['1-1'], not: NOT_11, rating: 6,
  source: "w1Sections '1-1' twist 'highLeaps' (on main 290-291): highLeaps(3, dbl) then highLeaps(4, dbl); the second run kept at 3 here for the brief's 20 s",
});
/** w1Sections '1-1' finish: 'hopBounce', 'bounceRun', 'stoneRoad' (on main 304-331), one round of each fill */
const finishHopBounce = section({
  id: 'w1-hop-bounce', name: 'bounce walls', phases: ['sho', 'ketsu'], difficulty: 4, needs: ['jump'], teaches: 'bounce',
  versions: [{ id: 'walls', groups: [gRest([150, 210]), gBounceWall(), gBounceWall(), gLogHop()] }, { id: 'wall-leap', groups: [gRest([150, 210]), gBounceWall(), gLogHop(), gBounceWall(), gDip()] }],
  feel: ['1-1', '1-3'], not: NOT_11, rating: 4,
  source: "w1Sections '1-1' finish 'hopBounce' (on main 306-311): bounceWall, then bounceWall + run 60-90 + logHop, or bounceWall + leap",
});
const finishBounceRun = section({
  id: 'w1-bounce-run', name: 'up and along', phases: ['ketsu'], difficulty: 6, needs: ['double'], uses: ['bounce', 'double'],
  versions: [{ id: 'five', groups: [gRest([150, 210]), gHighLeaps(5, true)] }, { id: 'three-wall', groups: [gRest([150, 210]), gHighLeaps(3, false), gBounceWall()] }],
  feel: ['1-1'], not: NOT_11, rating: 6,
  source: "w1Sections '1-1' finish 'bounceRun' (on main 313-319): highLeaps(5, dbl), or highLeaps(3) + bounceWall",
});
const finishStoneRoad = section({
  id: 'w1-stone-road', name: 'stone road home', phases: ['ketsu', 'goal'], difficulty: 3, needs: ['jump'],
  versions: STONES.map(([id, hs]) => ({ id, groups: [gRest([150, 210]), gStones(hs), gBusy(['log', 'dip', 'log']), gLowStumps(3)] })),
  feel: ['1-1', '1-3'], not: NOT_11, rating: 3,
  source: "w1Sections '1-1' finish 'stoneRoad' (on main 321-330): POOL.stones, busy(3, [log, dip]), lowStumps",
});
/** old 1-1's rests between beats and its home run: the meadow (rest 400-440 + a flag; busy and low stumps on it) */
const meadow = section({
  id: 'w1-meadow', name: 'home meadow', phases: ['rest', 'start', 'goal'], difficulty: 1, needs: ['jump'],
  versions: [{ id: 'stumps', groups: [gRest([400, 440], true), gLowStumps(3), gBusy(['log', 'dip', 'log'])] }, { id: 'rocks', groups: [gRest([400, 440], true), gBusy(['log', 'log', 'dip']), gLowStumps(3)] }],
  feel: ['1-1', '1-2', '1-3', '1-5'], not: NOT_11, rating: 1,
  source: "old 1-1's rests (rest 400-440, flag) with busy and lowStumps around them (protoStage.ts on main), and homeRun's open run",
});

// ───────────────────────────── old 1-3, less its snakes (w1Sections.ts '1-3' on main 386-415) ─────────────────────────────

const lowBoughs = section({
  id: 'w1-low-boughs', name: 'low boughs', phases: ['sho', 'ten'], difficulty: 3, needs: ['jump'],
  versions: [{ id: 'branches', groups: [gRest([150, 210]), gLowBoughs(3, 130), gLowBoughs(4, 150)] }, { id: 'ground', groups: [gRest([150, 210]), gLowBoughs(3, 130), gBusy(['log', 'dip']), gLowStumps(3)] }],
  feel: ['1-3', '1-1'], not: NOT_13, rating: 3,
  source: "w1Sections '1-3' develop 'branches'/'ground' (on main 392-393): snakeBranches(3, G-130), busy(1), lowStumps, snakeBranches(4, G-150), its snakes left out; feel '1-1' proposed by the porter (1-1 rises into the boughs), for the designer",
});
const ledges = section({
  id: 'w1-ledges', name: 'ledges and walls', phases: ['sho', 'ten'], difficulty: 4, needs: ['jump'],
  versions: [{ id: 'ledges', groups: [gRest([150, 210]), gLedge(), gBusy(['log']), gLedge()] }, { id: 'walls', groups: [gRest([150, 210]), gLowBoughs(3, 130), gBounceWall(), gBusy(['dip'])] }],
  feel: ['1-3', '1-1'], not: NOT_13, rating: 4,
  source: "w1Sections '1-3' 'ledge'/'ledges'/'walls' (on main 389, 394, 396): snakeLedge, busy(1), snakeLedge; snakeBranches, bounceWall, snakeWalk, bounceWall; snakes left out; feel '1-1' proposed",
});
const ropes = section({
  id: 'w1-ropes', name: 'rope gaps', phases: ['ten', 'ketsu'], difficulty: 5, needs: ['rope'], uses: ['rope'],
  versions: [{ id: 'branches', groups: [gRest([150, 210]), gRope(), gLowBoughs(3, 140), gRope()] }, { id: 'wall', groups: [gRest([150, 210]), gRope(), gBounceWall(), gRope()] }],
  feel: ['1-3'], not: NOT_13, rating: 5,
  source: "w1Sections '1-3' twist 'ropeBranches'/'ropeWall' (on main 399, 402): ropeGap, snakeBranches / bounceWall, ropeGap, snakes left out; 1-3 only (it needs 'rope')",
});

/** every harvested section (the designer adds new W1 sections from the rulebook kit) */
export const W1_SECTIONS: readonly W1Section[] = [learn, developStones, cacheStones, developStumpStones, developStoneDips, twistGaps, twistLeapStones, twistHighLeaps, finishHopBounce, finishBounceRun, finishStoneRoad, meadow, lowBoughs, ledges, ropes];

/** the phases a stage's slots fill */
export const W1_PHASES: readonly Phase[] = ['start', 'ki', 'sho', 'rest', 'ten', 'ketsu', 'goal'];
