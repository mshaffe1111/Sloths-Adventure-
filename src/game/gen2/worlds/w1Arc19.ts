/**
 * 1-9 The Boa's Branches, the level as DESIGNED (reference/design/1-9.md, DESIGN-19 final on t-pitch-b; packet BUILD-19): World 1's rows
 * for it. ONE idea: be the bait. The boa strikes at what moves, so make it strike where YOU choose, and let the forest beat it. Taught safe
 * (the forest drops a load on the first; the second rears at him and he freezes), used up a stair, turned (stop short and it misses, then
 * the bop; by the eagle's roost DON'T stop), read three times, then the eagle and two boas, then the Old Boa. WORLD DATA: no engine line
 * names this stage; kitLib19 gives World 1's kit these rows, finish19 lays what only the built stage can carry (one kit eagle a watched
 * stretch, the Old Boa under the eye's pass), and the stage table lists it.
 *
 * THE BOA (predators/world1.ts BOA, the kit's): posted, never walks; rears (1.0 s; Easy x1.3) when he MOVES within its engage (150 px;
 * Easy 195) and inside its sight's 70 px of height; strikes 128 px ahead at where he was; its coil hurts on touch while it watches or
 * rears. Beaten by a trap (chased off), the roost (chased off in its first rear frame, lure.ts), his stillness in its rear (it flees 4 s:
 * CastData.teachStill makes the stage's first freeze the slow-motion moment wherever he stands) and a punch while its head is out.
 *
 * THE GRAPH (1-9.md's `A T T P R T R W R C C C R L R S E` fails checkCode: V2, three teaches for a brief's one; V4, a twist before any
 * test): beats 1 and 2 are ONE teach brick (1-7's precedent: two T beats, one brick), beat 5 is the TEST (the other answer, the bop).
 */
import type { Difficulty, GraphBrief, NodeJob, PropDef, SectionPiece, SectionTemplate, Socket, StageSink, WorldKit } from '../types.ts';
import type { Enemy, Platform } from '../../types.ts';
import { w1World } from './w1.ts';
import { eagleOver, w1Still } from './w1Cast.ts';
import { castWatches, clipWatches } from '../stillLay.ts';
import { lureSocket } from '../lureLay.ts';

/** the stage these rows are for: the tag its sections carry and the key of its brief */
export const STAGE_19 = '1-9';
type R2 = [number, number];

/** 1-9's ONE graph (NODES.md §9.2 long form: each content node names its boas, `&boa*n!`, so the designer's count is laid whatever the
 *  section's threat budget, pipeline nodeAsks; its content letter pins which brick it deals, so the three reads come in the design's
 *  order on every roll; L is structural and names none), one job letter a brick: A the boughs, T the forest does it + the freeze (both safe), P freeze in stride (the stair),
 *  R, X make it miss (the bop), R, W the roost (DON'T stop), R, C C C read it (a load, a roost, a bare boa), R, L two hunters, R, S the
 *  Old Boa, E her mark */
export const ARC_19: Record<string, string> = { 'boa-19-arc': 'A Tg&:&boa-trapped,boa! Pc&:&boa*2! R Xh&:&boa! R Wk&:&boa-roost! R Cg&:&boa-trapped! Ch&:&boa-roost! Cc&:&boa! R L R S&:&boa! E' };
/** 1-9's brief, all of it data. The content mix over the 8 content nodes (T P X W C C C L; S is never content), V11: no type on more than
 *  3 of 8 and no two neighbours alike: T ground, P climb, X hazard, W crumble (the creaky limb), C ground (the load), C hazard (the
 *  roost), C climb (the bare boa up a step), L hazard. Its cast the boa (the eagle is a kit sweeper laid by finish19's castWatches) */
export const BRIEF_19: GraphBrief = {
  ends: 'finale', trend: 'level', branching: 'none', teaches: ['still'], deal: { ground: 25, climb: 25, hazard: 38, crumble: 12 }, dealExact: true,
  tags: true,
  cast: ['boa'],
  petals: 'low',
};

/** the story keeper's lines for 1-9, verbatim (reference/story/lines-1-9.md, KEEPER-19 @ a10b3799, approved; forwarded by the lead 10:05 AM
 *  ET 11-18). The only player words this file holds; w1Arc19.test.ts holds each equal to the keeper's file. The freeze is "don't move" in
 *  every player line (the story bible: never "freeze"); firsttimer.ts takeIn learns the freeze from "don't move" */
export const LINES_19 = {
  /** (a) teach, 800+ px before beat 1, at the arrival's far end */
  boa: 'Boas only see wiggles. Still sloths look like branches!',
  /** (b) THE freeze teach, 800+ px before beat 2 */
  freeze: "Boa rearing up? Don't move, and it slides off!",
  /** (c) teach, 800+ px before beat 5 (make it miss) */
  miss: 'When a boa misses, punch its nose. Bop!',
  /** (d) teach, 800+ px before beat 7 (the roost) */
  nest: "Eagle's nest! Boas bolt from it. So do we!",
  /** (e) teach, 800+ px before beat 12 (two hunters) */
  eye: 'Eagle! Into the green. Its eye scares boas off!',
  /** (g) Dot at her mark, the exit */
  mark: 'Her mark! Her trail runs down to that river.',
} as const;
/** (f) Dot, once, as the Old Boa is chased off by the eagle's eye: NOT LAID (no engine hook says a line when an animal is chased off by a
 *  food-chain eye; ENGINE-WORTHY in BUILD-19's REPORT). Held here verbatim for the hook */
export const SPLASH_19 = 'Splash! Off she swims in a big old huff.';
/** (k) Dot, once, the first time a boa is chased off (the cast's `said.trap`: beat 1's dropped load is the first) */
export const SAID_TRAP_19 = 'Away she slithers. Not hurt, just terribly insulted!';
/** (i) Dot at a LOCKED 1-9: stagePlan.ts SEALED_LINES '1:gauntlet' (World 1's only gauntlet is 1-9) */
export const SEALED_19 = 'We passed some of her petals. Back we creep!';
/** (h) the stage's MISSION line: stagePlan's, held equal by w1Arc19.test.ts */
export const MISSION_19 = 'Boas snap at anything that moves. Outsmart them, and collect her petals.';

// ───────────────────────────── the pieces ─────────────────────────────
/** a mossy bough he walks on, `w` exact, level with the one before */
const bank = (key: string, after: string | null, w: number): SectionPiece => ({ key, shape: 'bank', w: [w, w], place: after ? { kind: 'walk', after, dy: [0, 0] } : { kind: 'start' }, style: 'moss_stone', main: true });
/** a bough past a small soft hop (World 1's soft pit under it: a miss is a climb back) */
const hop = (key: string, after: string, w: number, dy: R2 = [0, 0]): SectionPiece => ({ key, shape: 'bank', w: [w, w], place: { kind: 'jump', after, dy, share: [0.3, 0.35], soft: true }, style: 'moss_stone', main: true, landing: true });
/** a limb over a soft gap: creaky (gives way 1.1 s after he lands; whole on a set-back) or, Easy, a sound bough */
const limb = (key: string, after: string, creak: boolean): SectionPiece => ({ key, shape: 'branch', w: [150, 160], place: { kind: 'jump', after, dy: [0, 0], share: [0.3, 0.35], soft: true }, style: 'branch', landing: true, ...(creak ? { creak: true } : { main: true }) });
/** a root step up or down (50-56 px: a hop, never a fall) */
const UP: R2 = [-56, -50], DOWN: R2 = [50, 56];
const root = (key: string, after: string, w: number, dy: R2): SectionPiece => ({ ...bank(key, after, w), place: { kind: 'walk', after, dy } });
/** a low mossy rock to hop on `on` at `at` (1-7's: 50-56 px, a hop, so a walk down a stair is never the quiet line's 4 s of nothing) */
const rock = (key: string, on: string, at: number): SectionPiece => ({ key, shape: 'block', w: [120, 140], place: { kind: 'on', on, at: [at, at], h: [50, 56] }, style: 'moss_stone', landing: true });

/** THE DROP TRAP, for a boa (it never paces, so not 1-3's log: there the snake lay 127 px into a log and a boa's rear began as he hopped
 *  onto it): one 440 px bough walked onto, the handle 44 px in (176 px from the middle of the boa's patch, armedTraps' reach 140-190), the
 *  load's socket 141 px in (the pair's 85-130 from the handle), the boa 277 px in (136 px from the load's socket, the lay's 120 between an
 *  animal and a prop). From the handle the boa is ~233 px on: outside its engage on both settings (150, Easy 195), so he drops the
 *  load from where it cannot see him move; walked past, it rears 150 px out (the freeze, or the bop, still answer it) */
function trapUnit(k: string, after: string, load: 'trap-hive' | 'trap-stone', dy: R2 = [0, 0]): { pieces: SectionPiece[]; sockets: Socket[]; last: string } {
  const b = `${k}b`;
  return {
    // (`dy`: the bough a root step up from `after`, reached over a narrow dip: VAR-19b, read-load's walk-in. The pair and the boa keep their places on it)
    pieces: [root(b, after, 440, dy)],
    sockets: [
      { id: `${k}h`, role: 'source', on: b, t: 0.1, dn: 0 },
      { id: `${k}r`, role: 'receptor', on: b, t: 0.32, dn: 0, link: `${k}h`, allow: [load] },
      boa(`${k}e`, b, 0.63, 'boa-trapped'),
    ],
    last: b,
  };
}

/** a boa's socket: the kit's rows (w1Cast.ts W1_BOAS): bare, under its own load, or within a roost's reach. `stay` (the default): the
 *  boa a piece is built round, never cut on Easy (softened by the kit's Easy row) */
type BoaRow = 'boa' | 'boa-trapped' | 'boa-roost';
const boa = (id: string, on: string, t: number, row: BoaRow, easy: Socket['easy'] = 'stay'): Socket => ({ id, role: 'enemy', on, t, dn: 0, allow: [row], easy });
/** the eagle's roost (World 1's lure row W1_LURE 'w1-roost', reach 150): a boa in its reach flees in its first rear frame */
const roost = (id: string, on: string, t: number): Socket => lureSocket(id, on, t, 'eagle');

/** World 1's still props with each row's own id as a tag (1-7's form), so a socket asks for exactly the cover the beat is designed with */
const HIDE = { carpet: 'w1-hide-moss', patch: 'w1-hide-moss-patch' } as const;
const hide = (id: string, on: string, t: number, kind: keyof typeof HIDE): Socket => ({ id, role: 'prop', on, t, allow: [HIDE[kind]] });
/** the eagle's watch socket at the start of `on` (stillLay watchSocket) */
const watch = (id: string, on: string, t = 0.03): Socket => ({ id, role: 'prop', on, t, allow: ['w1-eagle'] });
const petals = (id: string, on: string, t: R2 | number, n = 1, span = 80): Socket => ({ id, role: 'pickup', on, t, dn: 34, count: n, span });
const flag = (on: string, t = 0.3): Socket => ({ id: 'flag', role: 'flag', on, t });
/** a line's id in the kit: its own, `w19.<key>` */
export const lineId = (line: keyof typeof LINES_19): string => `w19.${line}`;
const tip = (id: string, on: string, t: number, line: keyof typeof LINES_19): Socket => ({ id, role: 'tip', on, t, allow: [lineId(line)] });

// ───────────────────────────── a brick ─────────────────────────────
type Lay = { pieces: SectionPiece[]; sockets: Socket[] };
type V = { id: string; lay: Lay; easy?: Lay };
/** a brick (1-6/1-7's form): its first piece `in`, its last `out` (both on the floor line), a version's Easy twin beside it */
function brick(o: { id: string; name: string; jobs: NodeJob[]; difficulty: number; content: 'ground' | 'climb' | 'hazard' | 'crumble'; teaches?: string; versions: V[]; uses?: string[] }): SectionTemplate {
  const ren = (ps: SectionPiece[]) => { const a = ps[0].key, z = ps[ps.length - 1].key; const f = (s: string) => (s === a ? 'in' : s === z ? 'out' : s); return ps.map((p) => ({ ...p, key: f(p.key), place: Object.fromEntries(Object.entries(p.place).map(([q, v]) => [q, (q === 'after' || q === 'on') && typeof v === 'string' ? f(v) : v])) as SectionPiece['place'] })); };
  const sk = (ps: SectionPiece[], ss: Socket[]) => { const a = ps[0].key, z = ps[ps.length - 1].key; return ss.map((s) => ({ ...s, on: s.on === a ? 'in' : s.on === z ? 'out' : s.on })); };
  const first = ren(o.versions[0].lay.pieces)[0];
  const versions = o.versions.flatMap((v) => [
    { id: v.id, pieces: ren(v.lay.pieces).slice(1), sockets: sk(v.lay.pieces, v.lay.sockets), ...(v.easy ? { easy: `${v.id}-easy` } : {}) },
    ...(v.easy ? [{ id: `${v.id}-easy`, pieces: ren(v.easy.pieces).slice(1), sockets: sk(v.easy.pieces, v.easy.sockets), easyOnly: true }] : []),
  ]);
  const { versions: _v, uses, ...rest } = o;
  return { ...rest, feel: [STAGE_19], own: true, archetypes: 'any', phases: ['ki', 'sho', 'ten', 'ketsu'], needs: ['jump'], uses: o.teaches ? [] : (uses ?? ['still']), terrain: 'raised-logs', maxPerStage: 1, pieces: [first], subBlocks: [{ id: 'body', versions }], entry: { piece: 'in', kind: 'ground' }, exit: { piece: 'out', kind: 'ground' }, exitDy: 0, sockets: [], mirrorable: false } as SectionTemplate;
}

// ───────────────────────────── the beats ─────────────────────────────
/** [T] beats 2 and 1, ONE brick (both safe), the freeze FIRST (BUILD-19, from the bots: they learn the freeze from Dot's (b) and nothing in
 *  1-9 names 1-3's trap, so with the trapped boa first no tier had an answer and every one walked into its coil). The freeze: Dot's (b) at
 *  the start, 800+ px of bough with nothing that can hurt, and a boa on the bough a root step DOWN, its post 140 px past the step (inside
 *  its engage on both settings). On the upper bough he stands 50-56 px over it, above its strike (30 px tall) and its coil, so a rear
 *  cannot touch him there: it rears, he stops, it slides off for 4 s, he steps down and on. Only stepping down INTO a rear hurts. (1-9.md
 *  put the boa 140 px past a small GAP; the lay keeps every animal JUMP_CLEAR past where a jump lands, pipeline jumpClearance, a fairness
 *  rule, which leaves that bough no patch: the step keeps the design's safety with no jump.) Then the forest does it: a boa under a load,
 *  its vine 233 px back (outside its engage on both settings): punch the vine and the load drops, or don't move when it rears */
function forestThenFreeze(): Lay {
  const t = trapUnit('u', 'z', 'trap-hive');
  return {
    pieces: [bank('a', null, 120), root('m1', 'a', 140, UP), root('m2', 'm1', 140, DOWN), root('ed', 'm2', 120, DOWN), root('e', 'ed', 360, UP), root('f', 'e', 360, DOWN), root('z', 'f', 300, UP), ...t.pieces, root('yd', t.last, 120, DOWN), root('y', 'yd', 160, UP)],
    // (the trap's pair listed first: sockets fill in list order and a pair is paid from the section's threat, which the freeze boa spends)
    sockets: [...t.sockets, tip('t-freeze', 'a', 0.3, 'freeze'), petals('pa', 'a', 0.75, 1), petals('pm', 'm1', 0.5, 2, 80), petals('pm2', 'm2', 0.5, 1),
      boa('b2', 'f', 0.39, 'boa'), petals('pz', 'z', 0.5, 1), petals('py', 'y', 0.5, 2, 120)],
  };
}
/** [P] beat 3, freeze in stride: a rising stair of landings, a boa on the first and third (no gap to save him); a flag before it. Each boa
 *  210 px into its landing, so its rear (150 px out) starts after the step up has landed, never mid-hop (he can't stop in the air) */
/** (VAR-19, the lead's ruling (a) 3:33 PM ET: a narrow root dip in the stair's opening bank, 'ad', so the walk up to the first boa is not
 *  a dead walk, 3.7 s on 15 of 16 Normal layouts; each boa keeps its own root and place on it) */
function freezeStair(easy: boolean): Lay {
  return {
    pieces: [bank('a', null, 120), root('ad', 'a', 120, DOWN), root('ae', 'ad', 200, UP), root('s1', 'ae', 300, UP), root('s2', 's1', 240, UP), root('s3', 's2', 300, UP), root('d1', 's3', 200, DOWN), root('d2', 'd1', 260, DOWN), rock('rd', 'd2', 0.5), root('zd', 'd2', 120, DOWN), root('zu', 'zd', 140, UP), root('z', 'zu', 120, DOWN)],
    sockets: [flag('a'), petals('pa', 'a', 0.7, 1), boa('b1', 's1', 0.7, 'boa'), petals('ps2', 's2', 0.5, 1), boa('b2', 's3', 0.7, 'boa', easy ? 'soften' : 'stay'),
      petals('pd', 'd2', 0.5, 1), petals('pz', 'zu', 0.5, 2, 100), tip('t-miss', 'z', 0.5, 'miss')],
  };
}
/** [X] beat 5, make it miss (Mario Bros.' closing window): a boa at a bough's end past a gap; he lands outside its strike, it rears and
 *  strikes bark; while its head is out (0.8 s) he steps in and bops it (dazed 2.5 s), or he freezes; a flag before it */
/** (VAR-19, the lead's ruling (a): the walk-in bank before the hop is a narrow root dip of the same length, 'ad' + 'w1', so the walk up
 *  to the boa is not a dead walk, 3.7 s on 12 of 16 Normal layouts; the boa's hop and bough unchanged) */
function makeItMiss(): Lay {
  return {
    pieces: [bank('a', null, 140), root('ad', 'a', 150, DOWN), root('w1', 'ad', 320, UP), hop('b', 'w1', 420), bank('c', 'b', 260), hop('z', 'c', 240)],
    sockets: [flag('a'), petals('pa', 'a', 0.5, 1), boa('b1', 'b', 0.62, 'boa'), petals('pc', 'c', 0.5, 1), petals('pz', 'z', 0.5, 2, 120), tip('t-nest', 'z', 0.7, 'nest')],
  };
}
/** [W] beat 7, the twist, DON'T stop: a creaky limb over a soft gap (Easy a sound bough) and past it the eagle's roost on a bough with a boa
 *  in its reach, the bough WALKED onto from the limb (a boa past a jump sits JUMP_CLEAR past the landing, pipeline jumpClearance), so he
 *  is still on the limb when it rears (its post ~100 px past the limb's end, inside its engage); walked boldly, it flees in its first
 *  rear frame; a freeze on the limb drops him to the moss below (never a pit) */
function roostTwist(easy: boolean): Lay {
  return {
    pieces: [bank('a', null, 140), root('ad', 'a', 120, DOWN), root('w1', 'ad', 360, UP), limb('k', 'w1', !easy), bank('b', 'k', 400), hop('z', 'b', 240)],
    sockets: [flag('a'), petals('pa', 'a', 0.6, 1), boa('b1', 'b', 0.25, 'boa-roost'), roost('r1', 'b', 0.57), petals('pz', 'z', 0.5, 2, 120)],
  };
}
/** [C] beat 9a, read it: a load. (Each read is ~1,700 px of bough: the rolled flags put a hard node's flag 1,500-2,400 px before it and
 *  none within 900 px of the last, so three reads back to back need that much ground to each hold its own flag) */
function readTrap(): Lay {
  // (VAR-19b: a narrow dip on the high bough, the trap bough the same 680 px from the beat's start. The walk-in stays 320: at 140-200 the
  //  trap pair is not laid on some rolls (seeds 2 and 4 lay the boa on a2 with no load; ENGINE-WORTHY, VAR-19's REPORT, VAR-19b))
  const t = trapUnit('u', 'a3', 'trap-stone');
  return { pieces: [bank('a', null, 320), root('a2', 'a', 180, UP), root('a2d', 'a2', 90, DOWN), root('a3', 'a2d', 90, UP), ...t.pieces, root('zd', t.last, 90, DOWN), root('z', 'zd', 330, UP), rock('rz', 'z', 0.5), root('z2', 'z', 120, DOWN)], sockets: [flag('a'), petals('pa', 'a', 0.5, 1), petals('pa2', 'a2', 0.5, 1), ...t.sockets, petals('pz', 'z', 0.25, 2, 80)] };
}
/** [C] beat 9b, read it: a roost */
function readRoost(): Lay {
  return { pieces: [bank('a', null, 140), root('a2', 'a', 360, UP), bank('b', 'a2', 380), hop('z', 'b', 160), root('z2', 'z', 100, DOWN)], sockets: [flag('a'), petals('pa', 'a', 0.5, 1), petals('pa2', 'a2', 0.5, 1), boa('b1', 'b', 0.3, 'boa-roost'), roost('r1', 'b', 0.68), petals('pz', 'z', 0.5, 2, 120)] };
}
/** [C] beat 9c, read it: a bare boa up a step (freeze, or let it miss and bop it) */
function readBare(): Lay {
  return {
    pieces: [bank('a', null, 140), root('s1', 'a', 260, UP), root('b', 's1', 340, UP), root('d1', 'b', 240, DOWN), rock('rd', 'd1', 0.5), root('z', 'd1', 120, DOWN)],
    sockets: [flag('a'), petals('pa', 'a', 0.5, 1), boa('b1', 'b', 0.55, 'boa', 'soften'), petals('pz', 'z', 0.5, 2, 80), tip('t-eye', 'z', 0.7, 'eye')],
  };
}
/** [L] beat 12, two hunters: the eagle's eye on its rounds over moss (1-7's sweeper and cover) and a boa on its line; a flag before it.
 *  (1-9.md has two boas here: L is structural, so its node names no threat and its sockets pay from the section's budget, which holds
 *  one; the eagle and the boa are the two hunters) */
function twoHunters(easy: boolean): Lay {
  return {
    pieces: [bank('a', null, 140), bank('w1', 'a', 280), root('wd', 'w1', 140, DOWN), root('w2', 'wd', 420, UP), root('w2d', 'w2', 140, DOWN), root('w3', 'w2d', 280, UP), hop('z', 'w3', 200)],
    sockets: [flag('a'), petals('pa', 'a', 0.6, 1), watch('hunters', 'w1', 0.045), hide('c1', 'w1', 0.6, 'carpet'), boa('b1', 'w2', 0.72, 'boa'), hide('m1', 'w3', 0.3, 'patch'),
      petals('pz', 'z', 0.5, 2, 120)],
  };
}
/** [S] beat 14, the Old Boa: the longest bough to the exit, the eagle's stretch overhead, moss ~300 px back from the boa. Two ways: step
 *  into the stretch, run back to the moss and keep still while the eye crosses the boa (finish19 runs its stretch past the boa), or walk
 *  into its face and freeze */
function oldBoa(): Lay {
  return {
    pieces: [bank('a', null, 140), bank('w1', 'a', 200), root('wd', 'w1', 120, DOWN), root('w1b', 'wd', 240, UP), bank('w2', 'w1b', 560), hop('z', 'w2', 200)],
    sockets: [flag('a'), petals('pa', 'a', 0.6, 1), watch('old', 'w1'), hide('c1', 'w1b', 0.55, 'patch'), boa('ob', 'w2', 0.4, 'boa'), petals('pz', 'z', 0.5, 2, 120)],
  };
}

/** THE ARC'S BRICKS (1-9.md), one job each: the graph's letter in brackets */
export const BEATS_19: SectionTemplate[] = [
  brick({ id: 'w1-19-forest-freeze', name: 'the freeze, then the forest does it: it thought I was a branch', jobs: ['teach'], content: 'ground', teaches: 'still', difficulty: 2, versions: [{ id: 'load-then-freeze', lay: forestThenFreeze() }] }),
  brick({ id: 'w1-19-stair', name: 'freeze in stride: go, stop, go', jobs: ['practise'], content: 'climb', difficulty: 4, versions: [{ id: 'two-on-the-stair', lay: freezeStair(false), easy: freezeStair(true) }] }),
  brick({ id: 'w1-19-miss', name: 'make it miss: missed me, BOP', jobs: ['test'], content: 'hazard', difficulty: 4, versions: [{ id: 'past-a-gap', lay: makeItMiss() }] }),
  brick({ id: 'w1-19-roost', name: "the roost: this time, DON'T stop", jobs: ['twist'], content: 'crumble', difficulty: 5, uses: ['still', 'creak'], versions: [{ id: 'limb-and-roost', lay: roostTwist(false), easy: roostTwist(true) }] }),
  brick({ id: 'w1-19-read-load', name: 'read it: a load', jobs: ['combine'], content: 'ground', difficulty: 5, uses: ['still', 'traps'], versions: [{ id: 'load', lay: readTrap() }] }),
  brick({ id: 'w1-19-read-roost', name: 'read it: a roost', jobs: ['combine'], content: 'hazard', difficulty: 5, versions: [{ id: 'roost', lay: readRoost() }] }),
  brick({ id: 'w1-19-read-bare', name: 'read it: nothing but me', jobs: ['combine'], content: 'climb', difficulty: 6, versions: [{ id: 'bare', lay: readBare() }] }),
  brick({ id: 'w1-19-hunters', name: 'two hunters: hide... NOW go', jobs: ['finale'], content: 'hazard', difficulty: 8, uses: ['still', 'hide'], versions: [{ id: 'eye-and-two', lay: twoHunters(false), easy: twoHunters(true) }] }),
  brick({ id: 'w1-19-old-boa', name: 'the Old Boa: I set the eagle on it', jobs: ['signature'], content: 'hazard', difficulty: 7, uses: ['still', 'hide'], versions: [{ id: 'longest-bough', lay: oldBoa() }] }),
];

// ───────────────────────────── 1-9's own quiet: the boughs, the rests and the exit ─────────────────────────────
const link = (o: { id: string; name: string; job: 'arrive' | 'rest'; versions: V[] }): SectionTemplate => ({
  ...brick({ id: o.id, name: o.name, jobs: [o.job], difficulty: 1, content: 'ground', versions: o.versions, uses: [] }),
  phases: [o.job === 'arrive' ? 'start' : 'rest'], content: 'structural', uses: [], terrain: 'floor-stones', maxPerStage: 1,
  // (VAR-19: each rest is laid once a roll and walked into: the one rest laid five times, after a rolled jump, read "jJJJ" after every
  //  beat, Easy's 4-run repeat and most of 1-9's likeness to 1-7 and 1-8, as VAR-1 found on 1-7/1-8. The beats keep their rolled join:
  //  walked into, a rest's last hop to the beat's first ran past the quiet line's 4 s, seedlist refused every seed)
  ...(o.job === 'rest' ? { entry: { piece: 'in', kind: 'ground', join: 'walk' } } : {}),
} as SectionTemplate);
/** a rest along the old boughs: a flag between root hops (1-7's rest: a hop within 450 px of each end, none 950 px apart). The golden seed
 *  (the lead 11:17 AM ET 11-18: World 1's "SECRET! GOLDEN SEED x OF n" counts it; the hand-built 1-9 carried one) sits over the last
 *  root step up, a hop above it: gen2 lays a find once a stage, in the first section that holds one, so it is the first rest's, after the
 *  stair, outside every boa read and every teach */
const rest = (id: string): SectionTemplate => link({ id, name: 'a rest on the old boughs', job: 'rest', versions: [{
  id: 'roots',
  // (VAR-19c: the knots, its own shape: a step up and a knot gap, a wide hollow walked into with Matt's boulder in it, then a long bough,
  //  a knot gap and home. On the route a rest opens 'h j' and closes 'j J', so no rest reads three jumps in a row or opens on one: the
  //  old five root dips read 'JJJJJ' and every rest repeated it)
  lay: { pieces: [bank('a', null, 140), root('b', 'a', 240, UP), root('b2', 'b', 80, DOWN), root('c', 'b2', 240, UP), root('c2', 'c', 360, DOWN), boulder('kc', 'c2', 0.5), root('d', 'c2', 300, UP), root('d2', 'd', 80, DOWN), root('i', 'd2', 140, UP), root('z', 'i', 100, DOWN)],
    sockets: [flag('c2', 0.15), petals('pb', 'b', 0.5, 1), petals('pk', 'kc', 0.5, 1), petals('pd', 'd', 0.5, 2, 80),
      { id: 'seed', role: 'find', on: 'd', t: 0.5, dn: 60 }] },
}] });
/** Matt's painted mossy boulder on `on` at `at` (protoArt.ts isPaintedRock: a moss_stone block exactly 50 px tall), a hop up and over */
const boulder = (key: string, on: string, at: number): SectionPiece => ({ key, shape: 'block', w: [140, 150], place: { kind: 'on', on, at: [at, at], h: [50, 50] }, style: 'moss_stone', landing: true });
/** a vine at the foot of a wall and the wall's top (VAR-1's form, 1-7's wallClimb): the vine on `on` (`onW` wide) 20 px short of its end,
 *  `h` px tall, and the wall's top `key` (`w` wide) laid over the vine, 30 px under its top: at the top of the climb he steps straight on */
const wallClimb = (key: string, on: string, onW: number, h: number, w: number): SectionPiece[] => [
  { key: `${key}v`, shape: 'vine', w: [0, 0], place: { kind: 'climb', on, at: [(onW - 20) / onW, (onW - 20) / onW], h: [h + 30, h + 30] } },
  { key, shape: 'bank', w: [w, w], place: { kind: 'over', on: `${key}v`, at: [0, 0], dy: [30, 30] }, style: 'moss_stone', main: true },
];
/** a mushroom on `on`, its cap 30 px up, its edge 30-45 px before `on`'s end (1-2's) */
const mushroom = (key: string, on: string, w: number): SectionPiece => ({ key, shape: 'bouncy', w: [70, 70], place: { kind: 'on', on, at: [1 - 45 / (w - 70), 1 - 30 / (w - 70)], h: [30, 30] } });
/** a bough only the mushroom's bounce (or a double jump) reaches: `rise` px up, a wall straight off `after`'s end */
const bounced = (key: string, after: string, from: string, w: number, rise: number): SectionPiece => ({ key, shape: 'bank', w: [w, w], place: { kind: 'walk', after, dy: [-rise - 4, -rise + 4] }, style: 'moss_stone', main: true, landing: true, block: 'bounce', from });
/** the golden seed (World 1's "SECRET! GOLDEN SEED"): gen2 lays a find once a stage, in the first section that holds one, so every rest
 *  carries the socket over its high ground and the first rest laid (after the stair, outside every boa read and every teach) keeps it */
const seed = (on: string, t = 0.5): Socket => ({ id: 'seed', role: 'find', on, t, dn: 60 });
/**
 * 1-9's rests (VAR-19, R-165.291; Matt 10-30: "more pieces ... that variety"): five quiet places on the boa's old boughs, each its own
 * shape and its own move, each laid once a roll and walked into, so no rest is a reroll of another and none is a rest 1-6/1-7/1-8 lays
 * (theirs: root hops, the hollow log, the moss shelf, the fern dip, the mossy floor, the knots, the crook vine, the split, the saddle).
 * Nothing watches a rest and nothing hurts in one (no pit, no heart): every miss is the ground he stood on. The quiet line: a move within
 * 450 px of each end, none 950 px apart; on the route only a narrow dip between two roots reads as a jump (steps up are bumps, walked
 * drops nothing), so every rest ends as the old one does, a root up and a root down (VAR-19: rests that ended on drops ran 4.5-6 s quiet
 * into the next beat and seedlist refused every seed).
 */
/** (b) the old crook: over a root dip, a step up onto the high crook (a boulder on it), over the dip off its end, and two root steps home.
 *  (On the route only a dip between two roots reads as a jump: straight steps up are bumps and walked drops are nothing, so a crook
 *  climbed by steps alone ran 5-6 s quiet, over the quiet line's 4 s, and seedlist refused it. A walked rise is also held under a single's
 *  reach, pipeline.ts riseCap: the crook is two root steps up, the same on both settings) */
const restCrook = (): SectionTemplate => link({ id: 'w1-19-rest-crook', name: 'a rest: up the old crook', job: 'rest', versions: [{ id: 'crook', lay: {
  // (VAR-19c: a step up and a knot gap, up onto the crook and over its boulder, off its end over the long drop, a second boulder on the far
  //  bough, a knot gap and a short root home (the next beat's walk-in is up to 320 px): 'j .. j J'; each boulder placed so no walk runs 2.5 s)
  pieces: [bank('a', null, 140), root('b', 'a', 200, UP), root('c', 'b', 80, DOWN), root('d', 'c', 300, UP), root('e', 'd', 380, UP), boulder('k', 'e', 0.8), root('f', 'e', 240, [102, 108]), root('g', 'f', 480, UP), boulder('k2', 'g', 0.4), root('g2', 'g', 80, DOWN), root('i', 'g2', 80, UP), root('z', 'i', 80, DOWN)],
  sockets: [flag('a', 0.4), petals('pd', 'd', 0.5, 1), petals('pk', 'k', 0.5, 1), seed('e', 0.4), petals('pg', 'g', 0.5, 1), petals('pz', 'z', 0.5, 1)] } }] });
/** (c) the boulder stair: a root up and down, a painted boulder on the floor, a root step up, a second boulder on the bough, and a step
 *  down home (each 50 px; root hops between the boulders, which read as bumps: the quiet line, 4 s) */
const restStair = (): SectionTemplate => link({ id: 'w1-19-rest-stair', name: 'a rest: boulders on the old bough', job: 'rest', versions: [{ id: 'stair', lay: {
  // (VAR-19c: a step up and a knot gap, a boulder at the far end of the high bough (a boulder where the knot hop lands: the lay refuses every
  //  roll), down and a boulder on the low one, up, a knot gap and home: 'j .. j J')
  pieces: [bank('a', null, 140), root('r', 'a', 200, UP), root('rk', 'r', 80, DOWN), root('s', 'rk', 320, UP), boulder('k1', 's', 0.85), root('t', 's', 200, DOWN), boulder('k2', 't', 0.4), root('u', 't', 140, UP), root('u2', 'u', 80, DOWN), root('i', 'u2', 120, UP), root('z', 'i', 120, DOWN)],
  sockets: [flag('s', 0.1), petals('pk1', 'k1', 0.5, 1), seed('k2', 0.5), petals('pu', 'u', 0.5, 1), petals('pi', 'i', 0.5, 1)] } }] });
/** (d) the bough wall: a root up, down to the wall's foot, its vine (1-4's climb, 212 px: past a double's 184) onto the high bough, a
 *  root up and down along it, and the long drop home (a hop either side of the climb: the quiet line, 4 s) */
const restWall = (): SectionTemplate => link({ id: 'w1-19-rest-wall', name: 'a rest: up the bough wall by its vine', job: 'rest', versions: [{ id: 'wall', lay: {
  // (VAR-19c: a step up and a knot gap, down to the wall's foot, the climb, off the top over a knot, the long drop, a knot gap and home:
  //  'j C J j J', the vine its own)
  pieces: [bank('a', null, 140), root('b', 'a', 160, UP), root('b2', 'b', 80, DOWN), root('b3', 'b2', 120, UP), root('m', 'b3', 160, DOWN), ...wallClimb('c', 'm', 160, 212, 260), root('cd', 'c', 80, DOWN), root('y', 'cd', 120, UP), root('d', 'y', 160, [128, 132]), root('dk', 'd', 80, DOWN), root('i', 'dk', 120, UP), root('z', 'i', 120, DOWN)],
  sockets: [flag('m', 0.3), petals('pc', 'c', 0.5, 2, 140), seed('y', 0.5), petals('pi', 'i', 0.5, 2, 60)] } }] });
/** (e) the mushroom bough: a mushroom at the old bough's foot bounces him up onto it (1-1's bounce, 150 px: a double makes it too), along
 *  it, a root up and down along it, and the drop home (a hop either side of the bounce: the quiet line, 4 s) */
const restBounce = (): SectionTemplate => link({ id: 'w1-19-rest-bounce', name: 'a rest: bounce up onto the old bough', job: 'rest', versions: [{ id: 'bounce', lay: {
  // (VAR-19c: a step up over a boulder (not the knot gap the other rests open with), the bounce up onto the old bough, off it over a knot,
  //  down its long step, a knot gap and home)
  pieces: [bank('a', null, 140), root('r', 'a', 340, UP), boulder('kr', 'r', 0.6), root('b', 'r', 240, DOWN), mushroom('bm', 'b', 240), bounced('c', 'b', 'bm', 400, 150), root('cd', 'c', 80, DOWN), root('y', 'cd', 120, UP), root('e', 'y', 220, [96, 100]), root('ek', 'e', 80, DOWN), root('i', 'ek', 200, UP), root('z', 'i', 120, DOWN)],
  sockets: [flag('b', 0.3), petals('pc', 'c', [0.4, 0.6], 2, 160), seed('y', 0.5), petals('pe', 'e', 0.5, 1), petals('pi', 'i', 0.5, 1)] } }] });
export const QUIET_19: SectionTemplate[] = [
  // [A] thick mossy boughs; nothing hurts in 1,300 px. The first move as soon as he can (VAR-19: the old arrival walked 800 px past the
  // runway to its first jump, 3.1 s from the spawn: "dead walk" at x 140): an 80 px foot, then a narrow root dip to jump (the route reads
  // only a dip between roots as a move; a step up onto the bough is a bump), about 2 s from the spawn: first move ~2.0 s, runway-bound
  // (pipeline.ts RUNWAY is 500 px of every stage's start; the first second is R-165.308, the lead 3:27 PM ET). Then up onto the old
  // bough over its own root dip (a clear run on it for the flag; a move every ~2 s, the dead walk's 2.5 s), left clear
  // (a rolled stage's flag before the teach stands on it, 1,500-2,400 px before the teach: pipeline.ts ROLLED_FLAGS), a boulder on the low
  // bough after it, a root up and down. Dot's boa line (a) at its far end, 800+ px before beat 1's boa
  link({ id: 'w1-19-arrival', name: 'the old boughs', job: 'arrive', versions: [
    { id: 'boughs', lay: { pieces: [bank('a', null, 80), root('d1', 'a', 200, DOWN), root('d2', 'd1', 200, UP), root('b', 'd2', 240, [-92, -88]), root('b2', 'b', 180, DOWN), root('b3', 'b2', 220, UP), root('c', 'b3', 280, DOWN), boulder('k', 'c', 0.5), root('r1', 'c', 220, [36, 40]), root('r2', 'r1', 280, UP), root('z1', 'r2', 140, DOWN), root('z2', 'z1', 100, UP), root('z', 'z2', 100, DOWN)],
      sockets: [petals('pb', 'b3', 0.5, 1), petals('pk', 'k', 0.5, 1), petals('pr', 'r1', 0.5, 2, 120), tip('t-boa', 'r2', 0.3, 'boa')] } },
  ] }),
  rest('w1-19-rest'), restCrook(), restStair(), restWall(), restBounce(),
];
/** [E] the bough down toward the river: her mark (the keeper's words), the totem */
export const EXIT_19: SectionTemplate = {
  id: 'w1-19-exit', name: 'the bough down to the river', feel: [STAGE_19], own: true, archetypes: 'any', phases: ['goal'], difficulty: 1, needs: ['walk'], jobs: ['exit'], content: 'structural', terrain: 'floor-stones',
  pieces: [{ key: 'in', shape: 'bank', w: [200, 220], place: { kind: 'start' }, style: 'moss_stone', main: true, landing: true }],
  // (VAR-19b: two narrow root dips on the way down, so the walk to her mark is never 4-6 s with nothing to do: funcheck's dead walk)
  subBlocks: [{ id: 'body', versions: [{ id: 'bank', pieces: [root('e1', 'in', 140, DOWN), root('e2', 'e1', 220, UP), root('e3', 'e2', 140, DOWN),
    { key: 'out', shape: 'bank' as const, w: [400, 420] as R2, place: { kind: 'walk' as const, after: 'e3', dy: UP }, style: 'moss_stone' as const, main: true, landing: true }], sockets: [petals('pout', 'out', 0.3, 2, 120), { id: 'exit-totem', role: 'objective' as const, on: 'out', t: 0.85, allow: ['exit_totem'] }] }] }],
  entry: { piece: 'in', kind: 'ground' }, exit: { piece: 'out', kind: 'ground' }, exitDy: 0, sockets: [tip('t-mark', 'in', 0.5, 'mark')], mirrorable: false,
} as SectionTemplate;

/** every section that is 1-9's own */
export const SECTIONS_19: SectionTemplate[] = [...BEATS_19, ...QUIET_19, EXIT_19];

// ───────────────────────────── the finish: what only the built stage carries ─────────────────────────────
/** the Old Boa's beat: its eagle's stretch runs on past the boa by this much, so the eye crosses it (the eagle's sight, 70 px, and a margin) */
export const W19_OLD = { section: 'w1-19-old-boa', past: 120 } as const;

type FinishStage = { platforms: Platform[]; enemies: Enemy[]; gen2?: { sections: Array<{ uid: string; template: string }> } };
const ofSection = <T extends { tag?: string }>(xs: readonly T[], uid: string): T[] => xs.filter((x) => x.tag?.startsWith(`${uid}:`));

/**
 * 1-9's finish (listed.ts FINISH 'w1-19'): World 1's still finish (each watched stretch cut to its hides and laid as one kit eagle), the
 * Old Boa's eagle run on past the Old Boa (its stretch would end 120 px past the moss, short of the boa), and on Easy every eagle's first
 * pass free (1-7's Easy). Throws (the roll is never listed) when a beat it finishes is missing what it needs.
 */
export function finish19<T extends FinishStage>(st: T, difficulty: Difficulty): T {
  let id = Math.max(0, ...st.enemies.map((e) => e.id));
  const sink = st as unknown as Pick<StageSink, 'proto' | 'platforms' | 'enemies'>;
  clipWatches(sink);
  castWatches(sink, (z, gy) => eagleOver(z, gy, ++id));
  const eagles = () => st.enemies.filter((e) => e.type === 'eagle');
  for (const s of st.gen2?.sections ?? []) {
    if (s.template !== W19_OLD.section) continue;
    const plats = ofSection(st.platforms, s.uid);
    const x0 = Math.min(...plats.map((p) => p.x)), x1 = Math.max(...plats.map((p) => p.x + p.width));
    const inside = eagles().filter((e) => e.patrolMinX >= x0 - 1 && e.patrolMinX <= x1 + 1);
    const old = st.enemies.filter((e) => e.type === 'boa' && e.x >= x0 && e.x <= x1);
    if (inside.length !== 1 || old.length !== 1) throw new Error(`1-9 finish: the Old Boa's beat (${s.uid}) has ${inside.length} eagles and ${old.length} boas, not 1 and 1`);
    inside[0].patrolMaxX = Math.max(inside[0].patrolMaxX, old[0].x + old[0].width + W19_OLD.past);
  }
  if (difficulty === 'easy') for (const e of eagles()) e.kitFree = true;
  // (the cast's first chase-off line is the boa's, the keeper's (k): World 1's is the snake's, W1_CAST_SAID)
  const cast = sink.proto.cast;
  if (!cast) throw new Error('1-9 finish: no cast record');
  cast.said = { ...cast.said, trap: SAID_TRAP_19 };
  return st;
}

/**
 * World 1's kit with 1-9's rows over it (stageTable.ts kit 'w1-19', listed.ts KITS): its pool is its own sections alone; its graph and
 * brief; World 1's still table (moss and the eagle) with each row's id as a tag.
 */
export function kitLib19(): WorldKit {
  const k = w1World(), M = k.manifest, G = M.graphs!;
  const still = w1Still(9);
  const props: PropDef[] = still.props.map((p) => ({ ...p, tags: [...p.tags, p.id] }));
  return { ...k,
    emit: { ...k.emit, ...still.emit },
    manifest: { ...M,
      props: [...M.props.filter((p) => !props.some((q) => q.id === p.id)), ...props],
      sections: SECTIONS_19,
      // (the bough wall rest's vine is 1-4's climb, taught: VAR-19)
      moves: [...M.moves.filter((m) => m !== 'climb'), 'climb'],
      lessons: { jump: '1-1', double: '1-1', bounce: '1-1', traps: '1-3', climb: '1-4', creak: '1-5', swing: '1-6', hide: '1-7' },
      required: {},
      tips: { ...M.tips, ...Object.fromEntries((Object.keys(LINES_19) as Array<keyof typeof LINES_19>).map((k) => [lineId(k), LINES_19[k]])) },
      // (every line of the keeper's but the arrival's and the mark's is a TEACH line: Dot says it on Normal's default Tips as on Help, D50)
      teachTips: [...(M.teachTips ?? []), ...(['boa', 'freeze', 'miss', 'nest', 'eye'] as const).map(lineId)],
      graphs: { ...G, chunkSeconds: 60, list: [...G.list.filter((g) => g.archetype !== 'gauntlet'), ...Object.entries(ARC_19).map(([id, code]) => ({ id, archetype: 'gauntlet' as const, code }))], briefs: { ...G.briefs, [STAGE_19]: BRIEF_19 } },
    } } as WorldKit;
}
