/**
 * 1-2 The Petal Trail, the level as DESIGNED (reference/design/1-2.md, judged by the lead 11-12 2:06 PM; scored on
 * reference/design/LEVEL-BAR.md): World 1's rows for it. ONE graph, one brick a beat, each with a job no other section of the stage's
 * pool serves, so every roll is the same level in the same order with its own small differences (the banks' lengths, which rest
 * falls where, the dressing). WORLD DATA (generalitycheck EXEMPT: src/game/gen2/worlds/): no engine line names this stage; the game
 * rolls 1-2 from `kitLib12()` (listed.ts KITS 'w1-12', the stage table's row).
 *
 * The one idea: Meeca's petals lie low on bark, and across the thorns the only bark is a mushroom's throw apart. Its pool is its own:
 * these seven beats, its own arrival and rests, its own exit. No World 1 library section is dealt into it (LEVEL-BAR A3; 1-3's bar).
 * New replaces old: the three rolled graphs that dealt World 1's library, the stood-in exit and the way down are deleted.
 */
import type { GraphBrief, NodeJob, SectionPiece, SectionTemplate, Socket, WorldKit } from '../types.ts';
import { hollowLogSize } from '../../w1NewArt.ts';
import { w1World } from './w1.ts';

/** the stage these rows are for: the tag its sections carry (stagePool) and the key of its brief */
export const STAGE_12 = '1-2';
type R2 = [number, number];
/** 1-2's ONE graph (reference/design/1-2.md): T the lesson, P again, U the petals go up, X the long chain (the test), W the twist (down
 *  where no thorns grow), S the long crossing by her island, C the finale; R its own rests between. The type of each node is its only
 *  brick's (`dealExact`): T, P the thorns (hazard); U, C climbs; X, S the chain (bounce); W ground. V11: no type over 2 of the 6
 *  counted, no two neighbours alike but P after its T; V4 W after X; V5 R after X, W, S */
export const ARC_12: Record<string, string> = { 'harvest-12-arc': 'A T P R U R X R W R S R C E' };
/** 1-2's brief, all of it data: a harvest on the root banks, the thorns under its chains only, its petals low the whole way */
export const BRIEF_12: GraphBrief = {
  ends: 'quiet', trend: 'level', branching: 'none', teaches: ['thorns'], deal: { hazard: 29, climb: 29, bounce: 28, ground: 14 }, dealExact: true,
  pits: 'lesson', petals: 'low', offRoad: 'fruit',
} as GraphBrief;
/** the story keeper's lines for 1-2, verbatim (the lead, 11-12 2:14 PM; STORY-LINES.md on origin/ccr-0d59a91c-oy3imz): the lesson's
 *  two, said at its first flag one after the other (the second teaches hands-off mid-chain without naming a button), and the twist's,
 *  approved 11-05 for 1-2 (R-165.45 released for it by the lead 11-12), held until the note lies in the hollow (no socket says it yet).
 *  "The petals go up" is main's own row (dotLinesData.ts hint.1-2.up), said by its id */
export const LINES_12 = {
  thorns: 'Ooh, thorns. Don\'t touch those, not even a little.',
  'thorns.then': 'Hop on and let the mushrooms do the jumping!',
  roots: 'There\'s something down by the roots...',
} as const;
const UP_LINE = 'hint.1-2.up';
/** 1-2's corridor under the floor line (a kit row, data): World 1's is 80 px, cut for a stage that climbs; the twist steps down 170 */
export const ROOM_12 = 320;
export const THORN_ROW = { lesson: 'thorns', art: 'w1-thorn', depth: [150, 170] as R2, clearStart: 1300 };

const low = (id: string, on: string, t: R2 | number, count = 2): Socket => ({ id, role: 'pickup', on, t, dn: 34, count, span: 120 });
const tip = (on: string, id: string, t = 0.4): Socket => ({ id: `say-${id}`, role: 'tip', on, t, allow: [id] });
/** a bank he walks or steps onto */
const led = (key: string, after: string | null, w: R2, dy: R2 = [0, 0]): SectionPiece => ({ key, shape: 'bank', w, place: after ? { kind: 'walk', after, dy } : { kind: 'start' }, style: 'moss_stone', main: true, landing: true });
/** a root step: 50-56 px, past the 26 px hoist, so a hop (an action on the quiet line) */
const UP: R2 = [-56, -50], DOWN: R2 = [50, 56];
const LEDGE: R2 = [230, 240];
/** a root across the path (a block on a bank, 40-56 px: a hop) */
const hump = (key: string, on: string, at: R2, h: R2 = [50, 56]): SectionPiece => ({ key, shape: 'block', w: [130, 170], place: { kind: 'on', on, at, h }, style: 'moss_stone', landing: true });

// ───────────────────────────── the chain (reference/specs/chain.md, flown on 1-2) ─────────────────────────────
/** chain.md §3, cap centre to cap centre by the step (+ up), laid inside each band: level 205-220, up 24-36 198-206, up 54-66 185-200
 *  (laid 188-196), down 24-36 216-224 */
const sOf = (st: number): R2 => (st > 45 ? [188, 196] : st > 6 ? [198, 206] : st < -6 ? [216, 224] : [208, 216]);
/** stumps under the caps: Normal's 120 (chain.md 110-130), Easy's 160 (150-170). The lesson, again and the petals-go-up lay Easy's
 *  160 on Normal too (the lead, 11-12: the bite is taught before it is tested; chain.md §2 d: the clean band does not move with the
 *  width, only what a miss costs) */
const N = 120, E = 160;
/** a chain's floor bank: short, so the walk to its mushroom stays under the quiet line (4 s) */
const FLOOR: R2 = [300, 340];
/**
 * A chain: a floor mushroom near the end of a floor bank (its edge 30-45 px before the lip: chain.md 20-60), then stumps standing in the
 * hollow, a cap on each; `steps` each cap over the one before (px, + up). The gaps are soft section pits: the brief's `pits` puts the
 * thorn bed under them (this section `uses` thorns). Every first cap is a walk-on, 30 px tall (chain.mount)
 */
function chain(k: string, after: string | null, steps: number[], pw: number, floorW: R2 = FLOOR): { pieces: SectionPiece[]; last: string } {
  const f = `${k}f`, w = (floorW[0] + floorW[1]) / 2;
  const ps: SectionPiece[] = [
    { key: f, shape: 'bank', w: floorW, place: after ? { kind: 'walk', after } : { kind: 'start' }, style: 'moss_stone', main: true, landing: true },
    { key: `${k}m`, shape: 'bouncy', w: [70, 70], place: { kind: 'on', on: f, at: [1 - 45 / (w - 70), 1 - 30 / (w - 70)], h: [30, 30] } },
  ];
  let prev = f;
  steps.forEach((st, j) => {
    const S = sOf(st);
    const gap: R2 = j === 0 ? [S[0] - pw / 2 - 70, S[1] - pw / 2 - 70] : [S[0] - pw, S[1] - pw];
    const dy: R2 = Math.abs(st) > 6 ? [-st - 3, -st + 3] : [0, 0];
    ps.push({ key: `${k}p${j}`, shape: 'bank', w: [pw, pw], place: { kind: 'jump', after: prev, dy, gapPx: gap, soft: true }, style: 'moss_stone', main: true });
    ps.push({ key: `${k}c${j}`, shape: 'bouncy', w: [70, 70], place: { kind: 'on', on: `${k}p${j}`, at: [0.5, 0.5], h: [30, 30] } });
    prev = `${k}p${j}`;
  });
  return { pieces: ps, last: prev };
}
/** the bank out of a chain: its lip 50-70 px past the last stump (chain.md 40-100 | 40-80), its top level with it (0-90 | 0-60) */
const out = (key: string, after: string, w: R2, dy: R2 = [0, 0]): SectionPiece => ({ key, shape: 'bank', w, place: { kind: 'jump', after, dy, gapPx: [50, 70], soft: true }, style: 'moss_stone', main: true, landing: true });
type Lay = { pieces: SectionPiece[]; sockets: Socket[] };
type V = { id: string; lay: Lay; easy?: Lay };
const join = (...ls: Lay[]): Lay => ({ pieces: ls.flatMap((l) => l.pieces), sockets: ls.flatMap((l) => l.sockets) });
/** root steps after a lay's last piece, up and down 50-56 px (a hop each way up), a petal pair on each: the breath INSIDE a beat;
 *  the route ends level, as it began */
const breath = (l: Lay, n: number): Lay => {
  const pieces = [...l.pieces], sockets = [...l.sockets];
  const last = () => pieces.filter((p) => p.place.kind !== 'on').at(-1)!.key;
  for (let j = 0; j < n; j++) { const k = `y${j}`; pieces.push(led(k, last(), LEDGE, j % 2 ? DOWN : UP)); sockets.push(low(`p${k}`, k, [0.3, 0.7])); }
  if (n % 2) { pieces.push(led('yz', last(), LEDGE, DOWN)); sockets.push(low('pyz', 'yz', [0.3, 0.7])); }
  return { pieces, sockets };
};
/** a chain beat's lay: the chain, its bank out, petals low on the floor bank and the bank out (never over a cap or a stump he bounces past) */
const chainLay = (steps: number[], pw: number, outW: R2 = [320, 380]): Lay => {
  const c = chain('k', null, steps, pw);
  return { pieces: [...c.pieces, out('z', c.last, outW)], sockets: [low('pa', 'kf', [0.2, 0.5]), low('pz', 'z', [0.4, 0.7])] };
};
/**
 * The hollow where no thorns grow (the twist): two root steps down (80-90 px each, walk-offs that land with margin), its floor (a
 * root to hop, her petals), and at its far face, 160-180 px up (past a single jump's 123 and the 26 px hoist, under the bounce's 223
 * from the cap: chain.md §1), a floor mushroom that lifts him out, 1-1's lift. No gap anywhere: nothing to fall into, nothing lost.
 * Meeca's note goes low on this floor, 100-150 px before the mushroom, once it is painted and a find kind lays it (the lead, 11-12)
 */
function hollow(k: string, after: string, floorW: R2): Lay {
  const s = `${k}s`, f = `${k}f`, r = `${k}r`, m = `${k}m`, b = `${k}b`, w = (floorW[0] + floorW[1]) / 2;
  return {
    pieces: [led(s, after, [200, 230], [80, 90]), led(f, s, floorW, [80, 90]),
      { key: r, shape: 'block', w: [120, 150], place: { kind: 'on', on: f, at: [0.2, 0.26], h: [50, 56] }, style: 'moss_stone', landing: true },
      { key: m, shape: 'bouncy', w: [70, 70], place: { kind: 'on', on: f, at: [1 - 45 / (w - 70), 1 - 30 / (w - 70)], h: [30, 30] } },
      led(b, f, [400, 440], [-180, -170])],
    sockets: [low(`p${k}s`, s, 0.5, 1), low(`p${k}f`, f, [0.1, 0.16]), low(`p${k}r`, r, 0.5, 1), low(`p${k}g`, f, [0.56, 0.66]), low(`p${k}b`, b, [0.4, 0.7])],
  };
}

/** a brick: its first piece `in`, its last `out` (pieces stood `on` another are not ends), a version's Easy twin beside it */
function brick(o: { id: string; name: string; jobs: NodeJob[]; content: 'bounce' | 'hazard' | 'climb' | 'ground' | 'structural'; difficulty: number; teaches?: string; thorns?: boolean; maxPerStage?: number; versions: V[] }): SectionTemplate {
  const ends = (ps: SectionPiece[]) => { const m = ps.filter((p) => p.place.kind !== 'on'); return [m[0].key, m[m.length - 1].key]; };
  const ren = (ps: SectionPiece[]) => { const [a, z] = ends(ps); const f = (s: string) => (s === a ? 'in' : s === z ? 'out' : s); return ps.map((p) => ({ ...p, key: f(p.key), place: Object.fromEntries(Object.entries(p.place).map(([q, v]) => [q, (q === 'after' || q === 'on') && typeof v === 'string' ? f(v) : v])) as SectionPiece['place'] })); };
  const sk = (ps: SectionPiece[], ss: Socket[]) => { const [a, z] = ends(ps); return ss.map((s) => ({ ...s, on: s.on === a ? 'in' : s.on === z ? 'out' : s.on })); };
  const first = ren(o.versions[0].lay.pieces)[0];
  const versions = o.versions.flatMap((v) => [
    { id: v.id, pieces: ren(v.lay.pieces).slice(1), sockets: sk(v.lay.pieces, v.lay.sockets), ...(v.easy ? { easy: `${v.id}-easy` } : {}) },
    ...(v.easy ? [{ id: `${v.id}-easy`, pieces: ren(v.easy.pieces).slice(1), sockets: sk(v.easy.pieces, v.easy.sockets), easyOnly: true }] : []),
  ]);
  const { versions: _v, thorns, ...rest } = o;
  return { ...rest, feel: [STAGE_12], archetypes: 'any', phases: ['ki', 'sho', 'ten', 'ketsu'], needs: ['jump'], uses: o.teaches ? ['bounce'] : thorns ? ['bounce', 'thorns'] : ['bounce'], terrain: 'mounds', pieces: [first], subBlocks: [{ id: 'body', versions }], entry: { piece: 'in', kind: 'ground' }, exit: { piece: 'out', kind: 'ground' }, exitDy: 0, sockets: [], mirrorable: false } as SectionTemplate;
}

/** THE ARC'S BEATS (reference/design/1-2.md), one job each: the graph's letter in brackets. Flags are the generator's (ROLLED_FLAGS,
 *  Matt's rule: before every hard beat, 2,300 px across thorns on Normal); hearts are the game's pass until the lead rules on hearts
 *  by risk (design: 3 on Normal, after U, X and S; none on Easy) */
export const BEATS_12: SectionTemplate[] = [
  // [T] the lesson: Dot's two lines on a ledge he cannot fall from (the first 1,000 px and more before the mushroom), the thorns seen
  // from the show bank, a step up, then the first chain: two caps on WIDE stumps on both settings (a miss lands on wood)
  brick({ id: 'w1-12-lesson', name: 'the lesson: the thorns, then two caps on wide stumps', jobs: ['teach'], content: 'hazard', difficulty: 3, teaches: 'thorns', versions: [(() => {
    const c = chain('k', 'show', [0, 0], E, [440, 480]);
    const lay: Lay = { pieces: [led('a', null, [460, 500]), hump('ar', 'a', [0.8, 0.86]), led('show', 'a', [260, 280], UP), ...c.pieces, out('z', c.last, [460, 520])],
      sockets: [tip('a', 'thorns', 0.25), tip('show', 'thorns.then', 0.5), low('par', 'ar', 0.5, 1), low('ps', 'show', [0.3, 0.7]), low('pz', 'z', [0.3, 0.6])] };
    return { id: 'two-wide', lay: breath(lay, 2) };
  })()] }),
  // [P] again: three caps, still on wide stumps (the lesson's safety kept until the test) | two
  brick({ id: 'w1-12-again', name: 'again: three caps', jobs: ['practise'], content: 'hazard', difficulty: 4, thorns: true, versions: [{ id: 'three', lay: breath(chainLay([0, 0, 0], E), 2), easy: breath(chainLay([0, 0], E), 2) }] }),
  // [U] the petals go up: caps each 54-66 px over the last onto a high bank level with the last stump (+180 | +120), a root on it, two
  // root steps back down. Dot: "The petals go up" (main's row, by its id)
  brick({ id: 'w1-12-up', name: 'the petals go up: a stair of caps', jobs: ['climb'], content: 'climb', difficulty: 4, thorns: true, versions: [(() => {
    const mk = (n: number): Lay => {
      const c = chain('k', null, Array(n).fill(60), E);
      const h = n * 60, half: R2 = [Math.round(h / 2) - 4, Math.round(h / 2) + 4];
      return { pieces: [...c.pieces, out('z', c.last, [420, 480]), hump('zr', 'z', [0.66, 0.72], [40, 46]), led('d0', 'z', [240, 260], half), led('d1', 'd0', [240, 260], half)],
        sockets: [tip('kf', UP_LINE, 0.2), low('pa', 'kf', [0.15, 0.4]), low('pz', 'z', [0.15, 0.5]), low('pzr', 'zr', 0.5, 1), low('pd0', 'd0', 0.5, 1), low('pd1', 'd1', [0.4, 0.6])] };
    };
    return { id: 'stair', lay: breath(mk(3), 2), easy: breath(mk(2), 2) };
  })()] }),
  // [X] the long chain, the TEST: four caps on Normal's narrow stumps, dipping 27 px and rising, no wood to stop on | three on wide
  brick({ id: 'w1-12-long', name: 'the long chain: no wood to stop on', jobs: ['test'], content: 'bounce', difficulty: 6, thorns: true, versions: [{ id: 'wave', lay: breath(chainLay([-27, 0, 27, 0], N), 2), easy: breath(chainLay([-27, 0, 27], E), 2) }] }),
  // [W] the twist: a hollow like the others but no mushroom at its lip and no thorns on its floor: her petals down there, 1-1's lift
  // out. Dot's "There's something down by the roots..." is said here only once Meeca's note (the Keeper's Bell, finds.ts w1_note) is
  // laid on this floor by a find-spot mark (P12S's, the lead 11-12): she never promises something over an empty floor
  brick({ id: 'w1-12-hollow', name: 'the twist: the hollow where no thorns grow', jobs: ['twist'], content: 'ground', difficulty: 4, versions: [(() => {
    const lip: Lay = { pieces: [led('a', null, [340, 380]), hump('ar', 'a', [0.3, 0.36])], sockets: [low('par', 'ar', 0.5, 1)] };
    return { id: 'down-and-up', lay: breath(join(lip, hollow('h', 'a', [860, 920])), 2) };
  })()] }),
  // [S] the long crossing, the signature: four caps, HER ISLAND (a root bank in the thorns, a petal row, its own floor mushroom), four
  // caps | two, island, two, island, two (chain.md: Easy two either side of an island)
  brick({ id: 'w1-12-crossing', name: 'the long crossing by her island', jobs: ['signature'], content: 'bounce', difficulty: 7, thorns: true, maxPerStage: 1, versions: [(() => {
    const mk = (runs: number, n: number, pw: number): Lay => {
      const pieces: SectionPiece[] = [], sockets: Socket[] = [low('pa', 'c0f', [0.2, 0.5])];
      let prev: string | null = null;
      for (let i = 0; i < runs; i++) {
        const c = chain(`c${i}`, prev, Array(n).fill(0), pw);
        pieces.push(...c.pieces);
        if (i < runs - 1) { const y = `i${i}`; pieces.push(out(y, c.last, [300, 340])); sockets.push({ ...low(`p${y}`, y, [0.2, 0.8], 3), span: 240 }); prev = y; }
        else { pieces.push(out('z', c.last, [420, 480])); sockets.push({ ...low('pz', 'z', [0.2, 0.8], 3), span: 240 }); }
      }
      return { pieces, sockets };
    };
    return { id: 'island', lay: breath(mk(2, 4, N), 2), easy: mk(3, 2, E) };
  })()] }),
  // [C] the finale: caps over thorns, a bank, a no-thorn hollow and its lift, caps rising 27 px each to a high bank, a step down
  brick({ id: 'w1-12-finale', name: 'the finale: over, down, up', jobs: ['combine'], content: 'climb', difficulty: 6, thorns: true, versions: [(() => {
    const mk = (n: number, rise: number, pw: number): Lay => {
      const c1 = chain('k', null, Array(n).fill(0), pw);
      const h = hollow('h', 'b', [560, 620]);
      const c2 = chain('q', 'hb', Array(rise).fill(27), pw);
      const up = rise * 27;
      return { pieces: [...c1.pieces, out('b', c1.last, [320, 360]), ...h.pieces, ...c2.pieces, out('t', c2.last, [380, 420]), led('z', 't', [300, 340], [up - 3, up + 3])],
        sockets: [low('pa', 'kf', [0.2, 0.5]), low('pb', 'b', [0.3, 0.7]), ...h.sockets, { ...low('pt', 't', [0.2, 0.8], 3), span: 240 }, low('pz', 'z', [0.4, 0.6], 1)] };
    };
    return { id: 'over-down-up', lay: mk(3, 2, N), easy: mk(2, 2, E) };
  })()] }),
];

// ───────────────────────────── 1-2's own quiet: its arrival and its rests (no thorns; nothing in them can hurt) ─────────────────────────────
/** the walk in and the breaths between the beats are 1-2's OWN pieces (1-3's bar, aa98fbc3): root banks in the rain, roots to hop,
 *  mossy steps, a dry dip, World 1's painted hollow log; a hop every 4 s or sooner (the quiet line), the last one near each end */
const link = (o: { id: string; name: string; job: 'arrive' | 'rest'; versions: V[] }): SectionTemplate => ({
  ...brick({ id: o.id, name: o.name, jobs: [o.job], content: 'structural', difficulty: 1, versions: o.versions }),
  phases: [o.job === 'arrive' ? 'start' : 'rest'], content: 'structural', uses: [], needs: ['walk'], terrain: 'floor-stones', ...(o.job === 'arrive' ? { maxPerStage: 1 } : {}),
} as SectionTemplate);
export const QUIET_12: SectionTemplate[] = [
  // [A] the walk in: a long root bank, three roots across it, petals low. Nothing here can hurt (the thorns' clearStart is 1,300 px)
  link({ id: 'w1-12-arrival', name: 'the walk in along the root banks, in the rain', job: 'arrive', versions: [
    { id: 'roots', lay: { pieces: [led('a', null, [1300, 1380]), hump('r0', 'a', [0.3, 0.34], [40, 46]), hump('r1', 'a', [0.58, 0.62]), hump('r2', 'a', [0.86, 0.9], [40, 46]), led('z', 'a', [260, 300])], sockets: [low('pa', 'a', [0.12, 0.2]), low('pr0', 'r0', 0.5, 1), low('pr1', 'r1', 0.5, 1), low('pr2', 'r2', 0.5, 1), low('pz', 'z', [0.4, 0.6], 1)] } },
  ] }),
  // [R] mossy root steps, up and down twice, a root at the end
  link({ id: 'w1-12-root-steps', name: 'a rest: mossy root steps up and down', job: 'rest', versions: [
    { id: 'steps', lay: { pieces: [led('a', null, [300, 340]), led('b', 'a', LEDGE, UP), led('c', 'b', LEDGE, DOWN), led('d', 'c', LEDGE, UP), led('e', 'd', LEDGE, DOWN), led('z', 'e', [220, 240]), hump('zr', 'z', [0.4, 0.5], [40, 46])], sockets: [low('pb', 'b', 0.5), low('pc', 'c', 0.5), low('pd', 'd', 0.5), low('pe', 'e', 0.5), low('pzr', 'zr', 0.5, 1)] } },
  ] }),
  // [R] over the roots: three across one long bank
  link({ id: 'w1-12-root-hump', name: 'a rest: over the roots', job: 'rest', versions: [
    { id: 'three-roots', lay: { pieces: [led('a', null, [1000, 1080]), hump('r', 'a', [0.12, 0.16], [40, 46]), hump('s', 'a', [0.48, 0.54]), hump('t', 'a', [0.84, 0.88], [40, 46]), led('z', 'a', [200, 220])], sockets: [low('pr', 'r', 0.5, 1), low('ps', 's', 0.5, 1), low('pt', 't', 0.5, 1), low('pa', 'a', [0.64, 0.72]), low('pz', 'z', 0.5, 1)] } },
  ] }),
  // [R] the dry dip between the roots: down a little, a root in it, up again
  link({ id: 'w1-12-root-dip', name: 'a rest: the dry dip between the roots', job: 'rest', versions: [
    { id: 'dip', lay: { pieces: [led('a', null, [300, 340]), hump('ar', 'a', [0.2, 0.26], [40, 46]), led('m', 'a', [460, 520], [36, 44]), hump('r', 'm', [0.5, 0.56], [40, 46]), led('b', 'm', [300, 340], [-44, -36]), led('z', 'b', [220, 240]), hump('zr', 'z', [0.4, 0.5], [40, 46])], sockets: [low('par', 'ar', 0.5, 1), low('pr', 'r', 0.5, 1), low('pb', 'b', [0.3, 0.7]), low('pzr', 'zr', 0.5, 1)] } },
  ] }),
  // [R] mossy stones to hop on one long bank
  link({ id: 'w1-12-stones', name: 'a rest: mossy stones to hop', job: 'rest', versions: [
    { id: 'stones', lay: { pieces: [led('a', null, [1100, 1180]), hump('s0', 'a', [0.12, 0.15], [34, 40]), hump('s1', 'a', [0.5, 0.54], [44, 50]), hump('s2', 'a', [0.86, 0.9], [34, 40]), led('z', 'a', [200, 220])], sockets: [low('ps0', 's0', 0.5, 1), low('ps1', 's1', 0.5, 1), low('ps2', 's2', 0.5, 1), low('pa', 'a', [0.66, 0.74]), low('pz', 'z', 0.5, 1)] } },
  ] }),
  // [R] through World 1's painted hollow log (walk through it, or hop up for the petals on its back), a root either side
  link({ id: 'w1-12-hollow-log', name: 'a rest: through the hollow log', job: 'rest', versions: [(() => {
    const hh = hollowLogSize('moss', 300).height;
    return { id: 'log', lay: { pieces: [led('a', null, [1060, 1120]), hump('r0', 'a', [0.06, 0.1], [40, 46]), { key: 'H', shape: 'hollow', w: [300, 300], place: { kind: 'on', on: 'a', at: [0.4, 0.42], h: [hh, hh] }, landing: true } as SectionPiece, hump('r1', 'a', [0.86, 0.9]), led('z', 'a', [200, 220])], sockets: [low('pr0', 'r0', 0.5, 1), low('pH', 'H', [0.3, 0.7]), low('pr1', 'r1', 0.5, 1), low('pz', 'z', 0.5, 1)] } };
  })()] }),
];
/** the way out: a calm walk on a root bank to the totem, the last petal low on the bark (the story: "where you would not have to look up") */
export const EXIT_12: SectionTemplate = {
  id: 'w1-12-exit', name: 'a calm walk on a root bank to the totem', feel: [STAGE_12], archetypes: 'any', phases: ['goal'], difficulty: 1, needs: ['walk'], jobs: ['exit'], content: 'structural', terrain: 'floor-stones',
  pieces: [{ key: 'in', shape: 'bank', w: [300, 340], place: { kind: 'start' }, style: 'moss_stone', main: true, landing: true }],
  subBlocks: [{ id: 'body', versions: [{ id: 'walk', pieces: [{ key: 'out', shape: 'bank', w: [620, 680], place: { kind: 'walk', after: 'in', dy: [0, 0] }, style: 'moss_stone', main: true, landing: true }], sockets: [{ id: 'pl', role: 'pickup', on: 'out', t: 0.55, dn: 34, count: 1 }, { id: 'exit-totem', role: 'objective', on: 'out', t: 0.85, allow: ['exit_totem'] }] }] }],
  entry: { piece: 'in', kind: 'ground' }, exit: { piece: 'out', kind: 'ground' }, exitDy: 0, sockets: [], mirrorable: false,
} as SectionTemplate;
/** every section that is 1-2's own: its whole pool */
export const SECTIONS_12: SectionTemplate[] = [...BEATS_12, ...QUIET_12, EXIT_12];

/** `flown`: 1-2's rows filed under the flown stage's id (a test of the thorn hollows' look on 1-1's flown arcs); `pits` false: no thorn
 *  bed (soft pits); `room`: px of corridor under the floor line */
export interface LibOpts { flown?: boolean; pits?: boolean; room?: number }
/** the stage id the kit's rows are filed under */
export const stageIdOf = (o: LibOpts = {}) => (o.flown ? '1-1' : STAGE_12);
/** World 1's kit with 1-2's brief, its one graph, its lines, its thorn row and its OWN sections as the whole pool (no World 1 library section) */
export function kitLib12(o: LibOpts = {}): WorldKit {
  const k = w1World(), M = k.manifest, G = M.graphs!, ID = stageIdOf(o);
  const brief = { ...BRIEF_12, ...(o.pits === false ? { pits: undefined } : {}) };
  return { ...k, manifest: { ...M,
    sections: SECTIONS_12.map((t) => (ID === STAGE_12 ? t : { ...t, feel: [ID] })),
    hurtFloor: THORN_ROW,
    corridor: { ...M.corridor, bottom: M.ground.y + (o.room ?? ROOM_12) },
    lessons: o.flown ? { jump: '0-9', double: '0-9', bounce: '0-9' } : { jump: '1-1', double: '1-1', bounce: '1-1' },
    required: {},
    tips: { ...M.tips, ...LINES_12 },
    graphs: { ...G, list: [...G.list.filter((g) => g.archetype !== 'harvest'), ...Object.entries(ARC_12).map(([id, code]) => ({ id, archetype: 'harvest', code }))], briefs: { ...(o.flown ? {} : G.briefs), [ID]: brief } },
  } } as WorldKit;
}
