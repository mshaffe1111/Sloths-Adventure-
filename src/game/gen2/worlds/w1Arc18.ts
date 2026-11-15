/**
 * 1-8 The Long Branch, the level as DESIGNED (reference/design/1-8.md on t-1718-design; packet BUILD-18, the lead's GO 8:03 PM ET 11-14):
 * World 1's rows for it. ONE idea: the branch is breaking behind you: hop the nuts that roll, run under the fruit that bounces, never stop.
 * WORLD DATA: no engine line names this stage; kitLib18 gives World 1's kit these rows, finish18 lays what only the built stage can carry
 * (the nuts and fruit at named pieces, the still fork, the tip, the hearts), and the stage table lists it.
 *
 * THE CHASE (chase.ts, gen2/chaseLay.ts): every K node is a stretch, the L after the last K the last stretch at the front's final burst;
 * whatever lies between two stretches is a LIVING FORK (nothing on it falls, the front stops at its edge, a flag on it). Each stretch is at
 * most chaseCap() = 3,840 px (Matt's flag span), so every K brick here is laid under it on both settings.
 *
 * EASY (the lead's ruling b): no gap in a stretch over CHASE_LAY.easyGap (50 px), so Easy's challenge is pace and reading: the same nuts and
 * fruit, further apart (2.5 s+), sound boughs for creaky ones, the double a rise, the K2 liana over a seam (optional). Every Easy nut and
 * fruit only bumps him (RollSpec.teach, the lead's ruling c: only the collapse costs on Easy).
 *
 * THE PHONE: every hazard drops in from above where it lands (rolling.ts rollAhead, the camera's chase lead shows it); one threat at a time,
 * 430 px+ (1.5 s at a run) between two drops.
 */
import type { Difficulty, GraphBrief, NodeJob, SectionPiece, SectionTemplate, Socket, WorldKit } from '../types.ts';
import type { Collectible, Platform, Vine } from '../../types.ts';
import type { RollSpec } from '../../rolling.ts';
import type { ChaseLay } from '../../chase.ts';
import type { RollLook } from '../rollLay.ts';
import { w1World } from './w1.ts';
import { w1Liana, w1Perch, withSwing } from './w1Swing.ts';
import { W1_ROLL, W1_STILL_FORK, W1_TIP } from './w1Cast.ts';
import { layStillFork, type StillForkStage } from '../stillFork.ts';
import { layTip, readyStillFork } from '../chaseTip.ts';
import { runnerProblems } from '../../runnerLiana.ts';

/** the stage these rows are for: the tag its sections carry and the key of its brief */
export const STAGE_18 = '1-8';
type R2 = [number, number];

/** 1-8's ONE graph (1-8.md "The arc", the plan the lead approved 8:03 PM): A the broad base, T the low nut and the bouncing fruit safe (one
 *  teach: one hazard, two heights), K the first run, R, K at pace, R, K both heights in rhythm, W the still fork, R, L the last stretch, S
 *  the tip, E her mark. The still fork is the living ground right after the third stretch (stillFork.ts lays its moss where the collapse
 *  stops), so the W brick follows that K */
export const ARC_18: Record<string, string> = { 'long-branch-18-arc': 'A Th Kg R Kr R Kb R Kh Pg R L Sr E' };
/** 1-8's brief, all of it data. Content by the code's letters (V11: no type on more than 2 of the 7 content nodes, never two neighbours
 *  alike): T hazard, K1 ground, K2 rope, K3 bounce, K4 hazard, P ground (the still fork: hide practised at pace), S rope */
export const BRIEF_18: GraphBrief = {
  ends: 'finale', trend: 'level', branching: 'none', teaches: ['roll'],
  tags: true,
  petals: 'low',
};

/** the story keeper's lines for 1-8, verbatim (reference/story/lines-1-8.md on t-story@2e40e6a3, approved by KEEPER-18 7:55 PM ET 11-14;
 *  the packet: "use the lines exactly"). The only player words this file holds; w1Arc18.test.ts holds each equal to the keeper's file */
export const LINES_18 = {
  /** teach, 800+ px before beat 1 (the low nut, safe) */
  nut: 'Little nuts roll at you. Hop them!',
  /** teach, 800+ px before beat 2 (the bouncing fruit, safe) */
  fruit: 'Big ones bounce over you. Just keep walking!',
  /** Dot, once, as the base cracks (beat 3) */
  crack: "It's cracking! Run, and don't look back!",
  /** teach, 800+ px before the still fork (beat 9) */
  fork: "The mossy fork won't break. Stop and keep still!",
  /** Dot at her mark on the cannonball tree (beat 13, the exit) */
  mark: "Her mark! And those coils ahead... the boa's branches.",
} as const;
/** Pokey at the halfway wayside (dotLinesData.ts way.1-8, the keeper's line 6) */
export const WAY_18 = 'Dot keeps flying rings round me. Show-off.';
/** the stage's MISSION line (the keeper's line 7): stagePlan's, held equal by w1Arc18.test.ts */
export const MISSION_18 = 'Race the long branch before it gives way, and gather her petals.';

// ───────────────────────────── the pieces ─────────────────────────────
/** a bough he walks on, `w` exact, level with the one before (or `dy`) */
const bank = (key: string, after: string | null, w: number, dy: R2 = [0, 0]): SectionPiece => ({ key, shape: 'bank', w: [w, w], place: after ? { kind: 'walk', after, dy } : { kind: 'start' }, style: 'moss_stone', main: true });
/** a bank past a gap of exactly `gap` px (a soft pit: a fall off the branch is the chase's, a heart and the flag) */
const hop = (key: string, after: string, w: number, gap: R2, dy: R2 = [0, 0]): SectionPiece => ({ key, shape: 'bank', w: [w, w], place: { kind: 'jump', after, dy, gapPx: gap, soft: true }, style: 'moss_stone', main: true, landing: true });
/** a limb over a gap: creaky (gives way 1.1 s after he lands; whole on a set-back) or, Easy, a sound bough */
const limb = (key: string, after: string, creak: boolean, gap: R2): SectionPiece => ({ key, shape: 'branch', w: [150, 160], place: { kind: 'jump', after, dy: [0, 0], gapPx: gap, soft: true }, style: 'branch', landing: true, ...(creak ? { creak: true } : { main: true }) });
/** a mushroom on `on`, its cap 30 px up, its edge 30-45 px before `on`'s end (chain.md, 1-2's) */
const mushroom = (key: string, on: string, w: number): SectionPiece => ({ key, shape: 'bouncy', w: [70, 70], place: { kind: 'on', on, at: [1 - 45 / (w - 70), 1 - 30 / (w - 70)], h: [30, 30] } });
/** a bank only a mushroom's bounce reaches: `rise` px up, a wall straight off `after`'s end (the lay clamps the rise to the bounce's reach) */
const bounced = (key: string, after: string, from: string, w: number, rise: number): SectionPiece => ({ key, shape: 'bank', w: [w, w], place: { kind: 'walk', after, dy: [-rise - 4, -rise + 4] }, style: 'moss_stone', main: true, landing: true, block: 'bounce', from });

/** a root hop up or down (1-6's: the quiet line wants a hop within 450 px of each end of a rest and none 950 px apart, listRules quietJudge) */
const UP: R2 = [-56, -50], DOWN: R2 = [50, 56];
const root = (key: string, after: string, w: number, dy: R2): SectionPiece => bank(key, after, w, dy);
const petals = (id: string, on: string, t: R2 | number, n = 1, span = 80): Socket => ({ id, role: 'pickup', on, t, dn: 34, count: n, span });
const flag = (on: string, t = 0.3): Socket => ({ id: 'flag', role: 'flag', on, t });
/** a line's id in the kit: its own, `w18.<key>` */
export const lineId = (line: keyof typeof LINES_18): string => `w18.${line}`;
const tip = (id: string, on: string, t: number, line: keyof typeof LINES_18): Socket => ({ id, role: 'tip', on, t, allow: [lineId(line)] });

// ───────────────────────────── the nuts and fruit, by data ─────────────────────────────
/** one hazard a brick lays: its kind, the piece it lands on and where along it (0-1) */
export interface Roll18 { kind: RollSpec['kind']; on: string; t: number }
/** 1-8's rolling look (gen2/rollLay.ts RollLook, the kit's manifest.rolls): World 1's pace and arcs (w1Cast.ts W1_ROLL: a nut under his
 *  run, a fruit's arc well over his drawn head), and the designed spacing: two drops on one route at least 430 px apart (1.5 s at his run:
 *  one threat at a time, 1-8.md, the lead 4:36 PM), on Easy 712 (2.5 s) */
export const ROLL_18: RollLook = { ...W1_ROLL, apart: { normal: 430, easy: 712 } };

// ───────────────────────────── a brick ─────────────────────────────
type Lay = { pieces: SectionPiece[]; sockets: Socket[]; rolls?: Roll18[] };
type V = { id: string; lay: Lay; easy?: Lay };
/** a lay's hazards as the pipeline's roll sockets (types.ts Socket.roll; gen2/rollLay.ts lays them once the chase is laid) */
const rollSockets = (rs: readonly Roll18[] = []): Socket[] => rs.map((r, i) => ({ id: `roll${i}`, role: 'roll', roll: r.kind, on: r.on, t: r.t }) as Socket);
/** a brick (1-6/1-7's form): its first piece `in`, its last `out`, a version's Easy twin beside it */
function brick(o: { id: string; name: string; jobs: NodeJob[]; difficulty: number; content: 'ground' | 'climb' | 'hazard' | 'crumble' | 'rope' | 'bounce'; teaches?: string; versions: V[]; uses?: string[]; window?: [number, number] }): SectionTemplate {
  const ren = (ps: SectionPiece[]) => { const a = ps[0].key, z = ps[ps.length - 1].key; const f = (s: string) => (s === a ? 'in' : s === z ? 'out' : s); return { f, ps: ps.map((p) => ({ ...p, key: f(p.key), place: Object.fromEntries(Object.entries(p.place).map(([q, v]) => [q, (q === 'after' || q === 'on' || q === 'from') && typeof v === 'string' ? f(v) : v])) as SectionPiece['place'], ...(p.from ? { from: f(p.from) } : {}) })) }; };
  const sk = (ps: SectionPiece[], ss: Socket[]) => { const a = ps[0].key, z = ps[ps.length - 1].key; return ss.map((s) => ({ ...s, on: s.on === a ? 'in' : s.on === z ? 'out' : s.on })); };
  const first = ren(o.versions[0].lay.pieces).ps[0];
  const versions = o.versions.flatMap((v) => {
    return [
      { id: v.id, pieces: ren(v.lay.pieces).ps.slice(1), sockets: sk(v.lay.pieces, [...v.lay.sockets, ...rollSockets(v.lay.rolls)]), ...(v.easy ? { easy: `${v.id}-easy` } : {}) },
      ...(v.easy ? [{ id: `${v.id}-easy`, pieces: ren(v.easy.pieces).ps.slice(1), sockets: sk(v.easy.pieces, [...v.easy.sockets, ...rollSockets(v.easy.rolls)]), easyOnly: true }] : []),
    ];
  });
  const { versions: _v, uses, ...rest } = o;
  return { ...rest, feel: [STAGE_18], own: true, archetypes: 'any', phases: ['ki', 'sho', 'ten', 'ketsu'], needs: ['jump'], uses: o.teaches ? [] : (uses ?? ['roll']), terrain: 'raised-logs', maxPerStage: 1, pieces: [first], subBlocks: [{ id: 'body', versions }], entry: { piece: 'in', kind: 'ground' }, exit: { piece: 'out', kind: 'ground' }, exitDy: 0, sockets: [], mirrorable: false } as SectionTemplate;
}

// ───────────────────────────── the beats ─────────────────────────────
/** [T] beats 1 and 2, ONE brick (one hazard, two heights): the low nut, safe (the nut line was said 800+ px back, in the arrival), then
 *  800+ px of walk with the fruit line said on the way, then the bouncing fruit, safe. Before the crack a touch only bumps him (teach) */
function teachPair(): Lay {
  return {
    // (root hops between the lessons: the quiet line (4 s, listRules.ts) wants a beat on the walk; each nut's and fruit's run-in stays flat)
    pieces: [bank('a', null, 240), root('b', 'a', 240, UP), root('c', 'b', 300, DOWN), bank('n', 'c', 560), root('m', 'n', 300, UP), root('f1', 'm', 400, DOWN), bank('f2', 'f1', 420), bank('z', 'f2', 360)],
    sockets: [petals('pb', 'b', 0.5, 1), petals('pn', 'n', 0.25, 1), tip('t-fruit', 'm', 0.3, 'fruit'), petals('pm', 'm', 0.7, 2, 120), petals('pf', 'f1', 0.5, 1), petals('pz', 'z', 0.5, 2, 120)],
    rolls: [{ kind: 'low', on: 'n', t: 0.72 }, { kind: 'high', on: 'f2', t: 0.62 }],
  };
}
/** [K] beat 3, the crack, the first run (1-1's gaps, low nuts on a steady beat, a mushroom up a step): the crack line where it cracks.
 *  Easy: the gaps 40-48 px, two nuts 2.5 s+ apart */
function firstRun(easy: boolean): Lay {
  const g: R2 = easy ? [40, 46] : [100, 120];
  return {
    // (at most chaseCap less the longest run-up from its flag (CHASE_LAY.flagBefore 600) and half a pad: about 3,300 px, or the lay splits it)
    pieces: [bank('a', null, 300), bank('b', 'a', 360), hop('c', 'b', 440, g), bank('d', 'c', 380), mushroom('dm', 'd', 380), bounced('e', 'd', 'dm', 380, 150), bank('e2', 'e', 200, [50, 56]), bank('e3', 'e2', 200, [50, 56]), hop('f', 'e3', 460, g, [40, 46]), bank('z', 'f', 220)],
    sockets: [tip('t-crack', 'a', 0.15, 'crack'), petals('pb', 'b', 0.4, 1), petals('pc', 'c', 0.3, 1), petals('pe', 'e', 0.5, 2, 120), petals('pf', 'f', 0.3, 1), petals('pz', 'z', 0.5, 1)],
    rolls: easy ? [{ kind: 'low', on: 'b', t: 0.9 }, { kind: 'low', on: 'f', t: 0.85 }] : [{ kind: 'low', on: 'b', t: 0.9 }, { kind: 'low', on: 'c', t: 0.85 }, { kind: 'low', on: 'f', t: 0.85 }],
  };
}
/** [K] beat 5, at pace: a hop over a section's break, then 1,200+ px of plain run (two fruits: no input) to a liana phased to his run
 *  (finish18 marks it runner) over a fallen gap. Its creaky limb is the last stretch's (a K is at most what Matt's flag span lets one run).
 *  The design's double is gone: at pace the tester-like bots (kid, adult) slowed at its gap, the front caught them at the lip and the
 *  lip fell (3/40 and 6/40 passed, BUILD-18): a double is not asked in a chase. Easy: a two-step rise, a sound bough, the liana hung over a
 *  40 px seam (optional), the gaps 40-48 px */
function atPace(easy: boolean): Lay {
  const s: R2 = [40, 46];
  if (easy) {
    return {
      pieces: [bank('a', null, 260), bank('b', 'a', 420), bank('c1', 'b', 220, [-56, -50]), bank('c', 'c1', 300, [-56, -50]), limb('k', 'c', false, s), hop('d', 'k', 300, s, [50, 56]), bank('d2', 'd', 260, [50, 56]), bank('e', 'd2', 460), bank('f', 'e', 460), w1Liana('l', 'f', 'long'), hop('p', 'f', 300, s), bank('z', 'p', 240)],
      sockets: [petals('pb', 'b', 0.4, 1), petals('pc', 'c', 0.5, 1), petals('pe', 'e', 0.4, 2, 120), petals('pp', 'p', 0.5, 1), petals('pz', 'z', 0.5, 1)],
      rolls: [{ kind: 'low', on: 'b', t: 0.2 }, { kind: 'high', on: 'f', t: 0.55 }],
    };
  }
  return {
    pieces: [bank('a', null, 200), bank('b', 'a', 600), hop('c', 'b', 300, [100, 118]), bank('d', 'c', 300), bank('e', 'd', 440), bank('f', 'e', 460), w1Liana('l', 'f', 'long'), w1Perch('p', 'l', 'long', [250, 270]), bank('z', 'p', 200)],
    sockets: [petals('pb', 'b', 0.4, 1), petals('pc', 'c', 0.5, 1), petals('pe', 'e', 0.4, 2, 120), petals('pp', 'p', 0.5, 1), petals('pz', 'z', 0.5, 1)],
    rolls: [{ kind: 'low', on: 'b', t: 0.45 }, { kind: 'high', on: 'e', t: 0.75 }, { kind: 'high', on: 'f', t: 0.85 }],
  };
}
/** [K] the fourth stretch (1-8.md "a fourth stretch goes in": more pieces, never padding): a mushroom throws him up onto a high bough over
 *  a bouncing fruit, then a hop down into a pair of nuts. Easy: the hop down over a 40 px seam, one nut */
function highBough(easy: boolean): Lay {
  return {
    pieces: [bank('a', null, 260), bank('b', 'a', 380), mushroom('bm', 'b', 380), bounced('c', 'b', 'bm', 820, 150), hop('d', 'c', 460, easy ? [40, 46] : [100, 118], [96, 104]), bank('e', 'd', 460, [46, 50]), bank('z', 'e', 300)],
    sockets: [petals('pb', 'b', 0.4, 1), petals('pc', 'c', 0.3, 2, 120), petals('pd', 'd', 0.3, 1), petals('pz', 'z', 0.5, 1)],
    rolls: easy ? [{ kind: 'high', on: 'c', t: 0.6 }, { kind: 'low', on: 'e', t: 0.85 }] : [{ kind: 'high', on: 'c', t: 0.6 }, { kind: 'low', on: 'd', t: 0.85 }, { kind: 'low', on: 'e', t: 0.85 }],
  };
}
/** [K] beat 7, both heights in rhythm: a fruit, then a nut behind it, the pairs closing in to 1.5 s apart, never on one beat; one small gap at
 *  the start; the last 850+ px carry nothing (the lead's Q1 ruling A: the fork line said there, 800+ px before the moss, with nothing that
 *  hurts between but the front he outruns). Easy: two pairs, 2.5 s+ apart */
function rhythm(easy: boolean): Lay {
  const g: R2 = easy ? [40, 46] : [100, 118];
  // (drops along its long bough from its start: 400 px of run-in (rollAhead's 350-370 and a margin), then Normal 540, 480, 430 apart (1.9,
  //  1.7, 1.5 s at his run: closing in); Easy one pair, 712 apart (2.5 s). The stretch stays under what Matt's flag span lets one run:
  //  chaseCap less the run-up from its flag (about 3,500 px))
  const at = easy ? [400, 1112] : [400, 940, 1420, 1850];
  const W = 1940;
  return {
    pieces: [bank('a', null, 240), hop('b', 'a', W, g), bank('c', 'b', 430), bank('z', 'c', 430)],
    sockets: [petals('pb', 'b', 0.2, 1), petals('pb2', 'b', 0.55, 1), petals('pb3', 'b', 0.85, 1), tip('t-fork', 'c', 0.08, 'fork'), petals('pz', 'z', 0.5, 2, 120)],
    rolls: at.map((x, i) => ({ kind: i % 2 ? 'low' : 'high', on: 'b', t: Math.round((x / W) * 1000) / 1000 }) as Roll18),
  };
}
/** [W] beat 9, the still fork: plain flat moss (finish18 lays the moss carpet 60 px past where the collapse stops, the eagle on its post
 *  past it, one pass: stillFork.ts), nothing standing on it; then a calm walk on */
function stillFork(): Lay {
  return {
    // (its first bank wide enough that Matt's span puts the fork's flag past the post (ENGINE-WORTHY 3); then a root up and down: the walk on
    //  after the pass is not quiet (the quiet line, 4 s))
    pieces: [bank('a', null, 700), root('b', 'a', 240, UP), root('c', 'b', 260, DOWN), root('d', 'c', 240, UP), root('z', 'd', 300, DOWN)],
    // (nothing stands on its first two banks: the fork's flag goes on them, clear of the post, where Matt's span puts it)
    sockets: [petals('pz', 'z', 0.6, 2, 120)],
  };
}
/** [L] beat 11, the last stretch at the front's final speed: hop, under, hop, 1.5 s+ apart, a creaky limb and a gap, then 1,200 px of plain
 *  run to the tip (the runner liana's rule: runnerLiana.ts). Easy: the limb sound, the gap 40-46 px */
function lastStretch(easy: boolean): Lay {
  const g: R2 = easy ? [40, 46] : [104, 120];
  return {
    pieces: [bank('a', null, 260), bank('b', 'a', 500), limb('k', 'b', !easy, easy ? [40, 46] : [100, 118]), hop('c', 'k', 480, easy ? [40, 46] : [100, 118]), hop('d', 'c', 500, g), bank('e', 'd', 560), bank('z', 'e', 560)],
    sockets: [petals('pb', 'b', 0.4, 1), petals('pc', 'c', 0.4, 1), petals('pe', 'e', 0.5, 2, 120)],
    rolls: easy ? [{ kind: 'low', on: 'b', t: 0.8 }, { kind: 'high', on: 'd', t: 0.82 }] : [{ kind: 'low', on: 'b', t: 0.8 }, { kind: 'high', on: 'c', t: 0.85 }, { kind: 'low', on: 'd', t: 0.82 }],
  };
}
/** [S] beat 12, the tip: the ground finish18 cuts into the gap off the tip (TIP_18.gap) and the far tree's bough past it, with the runner
 *  liana over the gap; level with the last stretch; then a root up and down on the far tree's bough (the quiet line) */
function theTip(): Lay {
  return {
    pieces: [bank('a', null, 400), bank('b', 'a', 400), bank('c', 'b', 320), root('d', 'c', 240, UP), root('z', 'd', 300, DOWN)],
    sockets: [petals('pz', 'z', 0.5, 2, 120)],
  };
}

/** THE ARC'S BRICKS (1-8.md), one job each; the four stretches all serve K (pressure), so each holds its place by its `window` (its share
 *  of the stage's 14 slots: the K nodes sit at slots 2, 4, 6 and 8, i.e. 0.18, 0.32, 0.46 and 0.61): the first run, at pace, the high
 *  bough, then the rhythm that ends at the still fork */
export const BEATS_18: SectionTemplate[] = [
  brick({ id: 'w1-18-teach', name: 'the little nut and the big fruit: hop the little ones, walk under the big ones', jobs: ['teach'], content: 'hazard', teaches: 'roll', difficulty: 1, versions: [{ id: 'nut-fruit', lay: teachPair() }] }),
  brick({ id: 'w1-18-first-run', window: [0.1, 0.25], name: 'the crack: GO!', jobs: ['pressure'], content: 'ground', difficulty: 4, versions: [{ id: 'gaps-nuts', lay: firstRun(false), easy: firstRun(true) }] }),
  brick({ id: 'w1-18-at-pace', window: [0.26, 0.39], name: "at pace: don't stop... don't stop", jobs: ['pressure'], content: 'rope', difficulty: 5, uses: ['roll', 'swing'], versions: [{ id: 'double-creak-liana', lay: atPace(false), easy: atPace(true) }] }),
  brick({ id: 'w1-18-high-bough', window: [0.4, 0.53], name: 'the high bough: bounce up, hop down', jobs: ['pressure'], content: 'bounce', difficulty: 5, uses: ['roll', 'bounce'], versions: [{ id: 'mushroom-nuts', lay: highBough(false), easy: highBough(true) }] }),
  brick({ id: 'w1-18-rhythm', window: [0.54, 0.68], name: 'both heights in rhythm: under, HOP', jobs: ['pressure'], content: 'hazard', difficulty: 6, versions: [{ id: 'pairs', lay: rhythm(false), easy: rhythm(true) }] }),
  brick({ id: 'w1-18-still-fork', name: 'the still fork: the ONE place to stop', jobs: ['practise'], content: 'ground', difficulty: 5, uses: ['roll', 'hide'], window: [0.64, 0.75], versions: [{ id: 'moss', lay: stillFork() }] }),
  brick({ id: 'w1-18-last', name: 'the last stretch: almost...', jobs: ['finale'], content: 'hazard', difficulty: 8, uses: ['roll', 'creak'], versions: [{ id: 'hop-under-hop', lay: lastStretch(false), easy: lastStretch(true) }] }),
  brick({ id: 'w1-18-tip', name: 'the tip: WHOA', jobs: ['signature'], content: 'rope', difficulty: 6, uses: ['swing'], versions: [{ id: 'tip', lay: theTip() }] }),
];

// ───────────────────────────── 1-8's own quiet: the broad base, the rests and the exit ─────────────────────────────
const link = (o: { id: string; name: string; job: 'arrive' | 'rest'; versions: V[] }): SectionTemplate => ({
  ...brick({ id: o.id, name: o.name, jobs: [o.job], difficulty: 1, content: 'ground', versions: o.versions, uses: [] }),
  phases: [o.job === 'arrive' ? 'start' : 'rest'], content: 'structural', uses: [], terrain: 'floor-stones', maxPerStage: o.job === 'arrive' ? 1 : 6,
} as SectionTemplate);
/** a rest on a living fork: a flag on a bank between root hops (chaseLay moves flags to the fork as Matt's span wants) */
const rest = (id: string): SectionTemplate => link({ id, name: 'a living fork: breathe', job: 'rest', versions: [{
  id: 'roots',
  lay: { pieces: [bank('a', null, 360), root('b', 'a', 240, UP), root('c', 'b', 380, DOWN), root('d', 'c', 220, UP), root('e', 'd', 360, DOWN), root('f', 'e', 240, UP), root('g', 'f', 340, DOWN), root('h', 'g', 220, UP), root('z', 'h', 360, DOWN)],
    // (the stage's find stands on the first fork met, never beside a nut or a fruit: its HOLD DOWN sign over a fern by a hazard read as
    //  the answer to the hazard, BUILD-18's teach still)
    sockets: [flag('c', 0.5), petals('pb', 'b', 0.5, 1), petals('pd', 'd', 0.5, 1), petals('pe', 'e', 0.3, 2, 120), { id: 'find', role: 'findSpot', on: 'e', t: 0.75 }, petals('pf', 'f', 0.5, 1)] },
}] });
export const QUIET_18: SectionTemplate[] = [
  // [A] the broad base at the trunk, the branch running off up to the far tree; nothing hurts in 1,300 px. The nut line is said on its far
  // bank, 800+ px before the first nut
  link({ id: 'w1-18-arrival', name: 'the broad base', job: 'arrive', versions: [
    { id: 'base', lay: { pieces: [bank('a', null, 360), root('r0', 'a', 240, UP), root('b', 'r0', 380, DOWN), root('r1', 'b', 240, UP), root('c', 'r1', 300, DOWN), root('r2', 'c', 220, UP), root('z', 'r2', 240, DOWN)],
      sockets: [petals('pb', 'b', 0.6, 1), petals('pr', 'r1', 0.5, 1), petals('pc', 'c', 0.5, 2, 120), tip('t-nut', 'z', 0.2, 'nut')] } },
  ] }),
  rest('w1-18-rest'),
];
/** [E] the cannonball tree's bough: her mark (the keeper's words), the totem */
export const EXIT_18: SectionTemplate = {
  id: 'w1-18-exit', name: "the cannonball tree's bough", feel: [STAGE_18], own: true, archetypes: 'any', phases: ['goal'], difficulty: 1, needs: ['walk'], jobs: ['exit'], content: 'structural', terrain: 'floor-stones',
  pieces: [{ key: 'in', shape: 'bank', w: [300, 340], place: { kind: 'start' }, style: 'moss_stone', main: true, landing: true }],
  subBlocks: [{ id: 'body', versions: [{ id: 'bank', pieces: [{ key: 'out', shape: 'bank' as const, w: [560, 600] as R2, place: { kind: 'walk' as const, after: 'in', dy: [0, 0] as R2 }, style: 'moss_stone' as const, main: true, landing: true }], sockets: [petals('pout', 'out', 0.3, 2, 120), { id: 'exit-totem', role: 'objective' as const, on: 'out', t: 0.85, allow: ['exit_totem'] }] }] }],
  entry: { piece: 'in', kind: 'ground' }, exit: { piece: 'out', kind: 'ground' }, exitDy: 0, sockets: [tip('t-mark', 'in', 0.5, 'mark')], mirrorable: false,
} as SectionTemplate;

/** every section that is 1-8's own */
export const SECTIONS_18: SectionTemplate[] = [...BEATS_18, ...QUIET_18, EXIT_18];

// ───────────────────────────── the finish: what only the built stage carries ─────────────────────────────
/** the hearts (1-8.md "Hearts and flags"): one on the fork after the second stretch, one on the fork before the last (the fork after the
 *  fourth: the still fork's), this far from that fork's last flag (before it: the flag stands just before the next crack, so a heart past
 *  it would be in the stretch), at a petal's height over the ground */
export const HEARTS_18 = { forks: [2, 4], past: -200, up: 34 } as const;
/**
 * The look the keeper's nature check asks for (lines-1-8.md: palm nuts drop from palms in view; cannonball fruit grows on stalks from the
 * TRUNK and drops from there or above), by INVENTORY id (the catalog's, exactly), so each draws the moment the engine's inventory-dressing
 * piece lands (ENG-DR, t-eng-dr: src/game/art/invDress.ts; drawn behind the play layer at its inventory size, pokey_scale x 89.1, R-165.107).
 * Until then they are written to proto.invDress and nothing draws them (a named rough spot). x: the piece's middle, `dx` from the hazard's
 * drop; y: its foot when standing, from the ground under the drop (px, + down)
 */
export const DRESS_18 = {
  /** a palm standing behind the branch at every nut's drop, its foot below the branch's top and its crown (460 px tall, pokey_scale 5.16)
   *  overhead, its cluster of nuts where the nut drops in from */
  palm: { inv: 'hf18/hf18-palm-crown', hang: false, dx: 0, y: 40, layer: 'behind' },
  /** a cannonball trunk (900 px, pokey_scale 10.1) standing behind the branch at every fruit's drop, its foot down in the mist, its fruit
   *  stalks at and over the drop's height */
  trunk: { inv: 'hf18/hf18-cannon-trunk', hang: false, dx: 70, y: 260, layer: 'behind' },
} as const;
/** ENG-DR's row shape (src/game/art/invDress.ts InvDress on t-eng-dr; this goes when that lands: import it) */
export interface InvDress { inv: string; x: number; y: number; hang: boolean; layer: 'behind' }

/** the beats whose liana is a runner's (phased to him at a full run: runnerLiana.ts) */
export const W18_RUNNER = ['w1-18-at-pace'] as const;
export const W18_STILL = 'w1-18-still-fork';

type FinishStage = {
  platforms: Platform[]; vines: Vine[]; enemies: StillForkStage['enemies']; collectibles: Collectible[]; checkpoints?: Array<{ x: number; y: number; reached?: boolean }>;
  chase?: ChaseLay; rolling?: RollSpec[]; proto?: unknown; gen2?: { sections: Array<{ uid: string; template: string; version?: string }> };
};
/** a section's laid pieces with key `key` (Platform.tag `<uid>:<key>`, BRIEF_18.tags; a cut piece's sections share the tag) */
const spanOf = (ps: readonly Platform[]): [number, number] | null => (ps.length ? [Math.min(...ps.map((p) => p.x)), Math.max(...ps.map((p) => p.x + p.width))] : null);

/**
 * 1-8's finish (listed.ts FINISH 'w1-18'), after the pipeline laid the chase and its roll sockets (gen2/rollLay.ts): the still fork on the
 * living ground after the stretch the still-fork brick follows (gen2/chaseTip.ts readyStillFork, stillFork.ts layStillFork), the last
 * stretch made the branch's tip (chaseTip.ts layTip, World 1's W1_TIP), the K2 liana a runner's, Easy's nuts and fruit a bump, the keeper's
 * look by inventory id, the hearts. Throws (the roll is never listed) when anything it lays cannot be laid whole: never a half-laid beat.
 */
export function finish18<T>(stage: T, difficulty: Difficulty): T {
  const st = stage as unknown as FinishStage;
  const easy = difficulty === 'easy';
  const lay = st.chase;
  if (!lay?.stretches.length) throw new Error('1-8 finish: the stage lays no chase');
  if (!st.rolling?.length) throw new Error('1-8 finish: the pipeline laid no nut or fruit (its roll sockets)');
  const secs = st.gen2?.sections ?? [];
  // (Easy's nuts and fruit only bump him: rolling.ts rollTeaches, the rule for every stage's Easy, ENG-CL (5); the lead's ruling c)
  // (2) the still fork: the living ground after the stretch the still-fork brick follows
  const w = secs.find((s) => s.template === W18_STILL);
  const wx = w ? spanOf(st.platforms.filter((p) => p.tag?.startsWith(`${w.uid}:`)))?.[0] : undefined;
  if (wx === undefined) throw new Error('1-8 finish: no still fork brick laid');
  const fork = lay.stretches.findIndex((s, i) => s.end <= wx + 1 && (lay.stretches[i + 1]?.start ?? Infinity) > wx);
  if (fork < 0) throw new Error(`1-8 finish: no stretch ends before the still fork at ${Math.round(wx)}`);
  const why = [...readyStillFork(st as never, fork, W1_STILL_FORK), ...layStillFork(st as unknown as StillForkStage, fork, W1_STILL_FORK, 1)];
  if (why.length) throw new Error(`1-8 finish: ${why.join('; ')}`);
  // (3) the K2 liana(s): a runner's
  for (const s of secs.filter((q) => (W18_RUNNER as readonly string[]).includes(q.template))) {
    const vs = st.vines.filter((v) => v.tag?.startsWith(`${s.uid}:`));
    if (!vs.length) throw new Error(`1-8 finish: ${s.template} (${s.uid}) laid no liana`);
    for (const v of vs) {
      if (easy) continue; // (Easy's hangs over a 40 px seam: optional, any swing)
      v.runner = true;
      const no = runnerProblems(v, st.platforms);
      if (no.length) throw new Error(`1-8 finish: the K2 liana: ${no.join('; ')}`);
    }
  }
  // (4) the tip: World 1's (the gap off the last stretch's lip, the far tree's bough, the runner liana; hazards on the run to it left out)
  const tipWhy = layTip(st as never, W1_TIP);
  if (tipWhy.length) throw new Error(`1-8 finish: ${tipWhy.join('; ')}`);
  // (6) the keeper's look: a palm crown over every nut's drop, a cannonball trunk behind every fruit's (DRESS_18, by inventory id)
  const proto = ((st as { proto?: unknown }).proto ??= {}) as { invDress?: InvDress[] };
  for (const h of st.rolling) {
    const d = h.kind === 'low' ? DRESS_18.palm : DRESS_18.trunk;
    const g = st.platforms.filter((p) => p.type === 'solid' && p.x <= h.dropX && h.dropX <= p.x + p.width).sort((a, b) => a.y - b.y)[0];
    if (!g) continue;
    (proto.invDress ??= []).push({ inv: d.inv, x: h.dropX + d.dx, y: g.y + d.y, hang: d.hang, layer: d.layer });
  }
  // (5) the hearts: on the forks HEARTS_18 names, just before each fork's last flag
  let id = st.collectibles.reduce((m, c) => Math.max(m, c.id), 0);
  for (const f of HEARTS_18.forks) {
    const a = lay.stretches[f - 1]?.end, b = lay.stretches[f]?.start;
    if (a === undefined || b === undefined) continue;
    const c = (st.checkpoints ?? []).filter((q) => q.x > a && q.x < b).sort((p, q) => q.x - p.x)[0];
    if (!c) throw new Error(`1-8 finish: no flag on fork ${f} for its heart`);
    st.collectibles.push({ id: ++id, type: 'heart', x: c.x + HEARTS_18.past, y: c.y - HEARTS_18.up, collected: false, bobPhase: 0 });
  }
  // (7) each of Dot's lines is said only before the next crack after it (StageHint.beforeX): a run that starts from a later flag says
  //  the last line he passed (engine.ts), and past the tip that was the still fork's, on the far tree's branch (ENG-LOOK's still, 11-14)
  const hints = ((st as { proto?: { hints?: Array<{ x: number; text: string; beforeX?: number }> } }).proto?.hints ?? []);
  const mine = new Set<string>(Object.values(LINES_18));
  for (const h of hints) {
    if (!mine.has(h.text)) continue;
    const next = lay.stretches.find((s) => s.start > h.x);
    if (next) h.beforeX = next.start;
  }
  return stage;
}

/**
 * World 1's kit with 1-8's rows over it (stageTable.ts kit 'w1-18', listed.ts KITS): its pool is its own sections alone; it swings (the K2
 * liana and the tip); its graph and brief; its lines, every one but the mark's said on Normal's default Tips as on Help (D50): the
 * three teaches and the crack, the one warning the chase has.
 */
export function kitLib18(): WorldKit {
  const k = withSwing(w1World()), M = k.manifest, G = M.graphs!;
  return { ...k,
    manifest: { ...M,
      sections: SECTIONS_18,
      rolls: ROLL_18,
      lessons: { jump: '1-1', double: '1-1', bounce: '1-1', climb: '1-4', creak: '1-5', swing: '1-6', hide: '1-7' },
      required: {},
      tips: { ...M.tips, ...Object.fromEntries((Object.keys(LINES_18) as Array<keyof typeof LINES_18>).map((q) => [lineId(q), LINES_18[q]])) },
      teachTips: [...(M.teachTips ?? []), ...(['nut', 'fruit', 'crack', 'fork'] as const).map(lineId)],
      graphs: { ...G, chunkSeconds: 120, list: [...G.list.filter((g) => g.archetype !== 'sprint'), ...Object.entries(ARC_18).map(([id, code]) => ({ id, archetype: 'sprint' as const, code }))], briefs: { ...G.briefs, [STAGE_18]: BRIEF_18 } },
    } } as WorldKit;
}
