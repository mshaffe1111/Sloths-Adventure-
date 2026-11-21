/**
 * gen2/worlds/w2Arc25 — 2-5 "River Snappers: Count to Four" as designed (reference/design/2-5.md, DESIGN-24-25 on t-design-24; BUILD-25,
 * the lead's GO 11:50 AM ET 11-20). WORLD DATA: no engine line names this stage; kitLib25 gives World 2's kit 2-5's rows (stageTable.ts kit
 * 'w2-25', listed.ts KITS), and the game rolls it the way it rolls every gen2 stage.
 *
 * ONE idea (2-5.md): "The river keeps time: every snap stone bites on four, so hop on one-two-three and be off before four." 2-2's pads
 * LEAVE him; 2-5's stones STAY and bite (he must leave them). The snappers keep the SAME count (w2Cast.ts: their tell on the bar's creak,
 * their snap on four): kick one right after it snaps and it paddles off downstream, huffy, never hurt (TURTLE: the kick only when open).
 *
 * THE PIECES (ENG-25's snap row, rideLay.ts PadRow by 'snap', level with the banks, 30 px of water each side, ENG-25c; World 2's snapper
 * rows, w2Cast.ts w2Snappers on a snap row's clock; 2-1's logs; World 2's rope between posts, BUILD-25c).
 *
 * THE ARC (2-5.md "THE NODE STRING" `A Tp1<:#soft Pg1&<:&turtle*1z Pp1> Xw1&>:&turtle R Pr1< Wp1>:#water R Pg1&>:&turtle*3
 * Cw1&>:#water:&turtle*2 R Sw1< E`, one brick a beat; the design's p (snap stones: nodeLetters 'later', no section type) is laid as f,
 * floating, 2-2's pads' precedent: f 3 of 8, the cap the design names):
 *   A  arrive: the reach, a clack echoing        T  ONE stone, safe (`count` 800+ px before; a teaching row: the bite costs no heart)
 *   Pg the first snapper, ASLEEP (`snapper`)      Pf three in step (flag)
 *   X  awake: `snap` 800+ px before the first awake snapper on a plain bank, then 2-1's logs and two stones (splash-back)
 *   Pr the rope over the channel; two snappers on the far bank past its landing (the lead's fallback, (3) 11:50 AM ET: a snapper needs
 *      ground, and the rope's pit has none)
 *   W  TWIST: the wave, five stones each a count after the last (Easy three; `follow` 800+ px before; flag)
 *   Pg the sandbars: three snappers on the beat
 *   C  the quickening: the count at 0.6 s (a second clock), two rows with logs between, two snappers on its clock (flag; heart after)
 *   S  the Big Snap: the old mossy stone between two pairs that clap on four together (`quiet` once after)
 *   E  the far bank
 *   R  a rest on the bank after X, W and C
 * DESIGN CHANGES (the lead's rulings 11:50 AM ET 11-20): the goal is the design's (stagePlan count, R-165.336: no top-up); Easy every
 * pond and river splash-back; beat 1's teaching stone bites for no heart (R-165.337); beat 5's snappers on the far bank (named above).
 * NAMED, NOT BUILT: the Big Snap's "the last snappers dive away" (no animal is laid there: they would be more of the goal's count) and the
 * paddle-off is the kit's (w2Cast.ts).
 */
import { W2_RIVERS, w2World } from './w2.ts';
import { w2CastSpawn, w2Snappers } from './w2Cast.ts';
import type { PadRow } from '../rideLay.ts';
import type { RiverRow } from '../riverLay.ts';
import type { CreatureDef, GraphBrief, NodeJob, SectionPiece, SectionTemplate, Socket, WorldKit } from '../types.ts';

export const STAGE_25 = '2-5';
type R2 = [number, number];

/** 2-5's ONE graph (2-5.md's node string with p as f) */
export const ARC_25: Record<string, string> = { 'snap-25-arc': 'A Tf Pg&:&snapper-asleep*1 Pf Xw&:&snapper*1 R Pr&:&snapper*2 Wf R Pg&:&snapper*3 Cw&:&snapper-quick*2 R S E' };

/** the lesson 2-5 teaches: off a snap stone before four (World 2's manifest lessons) */
export const COUNT_LESSON = 'count';

/** 2-5's brief, all of it data (a purge: chase off the snappers; 8 content nodes: floating 3 (T, P, W), ground 2, water 2 (X, C), rope 1;
 *  `ends: 'quiet'`: the design has no finale node (its combine is the quickening, C, then the Big Snap, S); its cast the snapper) */
export const BRIEF_25: GraphBrief = {
  ends: 'quiet', trend: 'level', branching: 'none', teaches: [COUNT_LESSON], deal: { floating: 37.5, ground: 25, water: 25, rope: 12.5 }, dealExact: true,
  tags: true, petals: 'few', cast: ['turtle'],
};

/** the story keeper's lines for 2-5, verbatim (reference/story/lines-2-5.md, KEEPER-25 t-keeper-25@a7ad4455, approved 11-19). The only
 *  player words this file holds; w2Arc25.test.ts holds each equal to the keeper's file */
export const LINES_25 = {
  /** Dot, THE teach, 800+ px before beat 1 (the one soft stone) */
  count: 'The stones bite on four! One, two, three, off!',
  /** Dot, teach, 800+ px before beat 2 (the sleeper) */
  snapper: 'Snappers are just grumpy. A kick sends them home!',
  /** Dot, teach, 800+ px before beat 4 (the first AWAKE snapper): the real rhythm, near till it creaks, back off, it misses, kick (a still Pokey is unseen in World 2, so the line sends him near: R-165.341, the lead's pick 11-20) */
  snap: 'Go near till it creaks. Back off. Missed? Kick!',
  /** Dot, teach, 800+ px before beat 6 (the wave) */
  follow: 'The snaps run ahead now. Stay right behind them!',
  /** Dot, once, after the Big Snap */
  quiet: 'Shh. Hear that? Just the river again.',
} as const;
/** the stage card (stagePlan.ts World 2's 2-5 row): the keeper's line 7 */
export const MISSION_25 = 'The stones bite on four. Hop across and send the snappers home.';
/** Dot at the locked exit (stagePlan.ts SEALED_LINES '2:purge'): the keeper's line 8 */
export const SEALED_25 = 'Some snappers are still back there. Send them home!';
/** the Snapping Turtle's journal tip (journal.ts): the keeper's line 6 */
export const TURTLE_TIP_25 = "Can't hide in its shell, so it snaps. Kick right after!";
/** the snappers 2-5 asks for, as designed (2-5.md "Goal"; stagePlan.ts count, R-165.336): every one laid but one */
export const GOAL_25 = 8;
/** a line's id in the kit: its own, `w25.<key>` */
export const lineId25 = (line: keyof typeof LINES_25): string => `w25.${line}`;
/** the lines Dot says as TEACH lines (said on Normal's default Tips as on Help, D50) */
export const TEACH_25 = ['count', 'snapper', 'snap', 'follow'] as const;

/**
 * 2-5's snap rows (rideLay.ts PadRow by 'snap'; 2-5.md's flown table; snapFaults holds each: 80 px stones, 30 px of water, <= 3 in step,
 * a wave runs ahead, Normal's window >= 0.9 s, Easy at or over Normal's). Every Easy row is splash-back (`...e`, the lead's GO); a row's
 * clock is named (PadRow.clock): every 0.75 s row keeps the river's one bar (`snap-river`), the quickening's rows theirs (`snap-quick`)
 */
export const PADS_25 = {
  /** beat 1, the teaching stone: one, over splash-back water, its bite free (R-165.337) */
  teach25: { by: 'snap', pads: ['snap'], gap: 30, snap: { count: 0.75 }, clock: 'river', safe: true, freeBite: true },
  /** beat 3, three in step (47-53% of starts safe, 1.40-1.60 s to leave the bank) */
  step25: { by: 'snap', pads: ['snap', 'snap', 'snap'], gap: 30, snap: { count: 0.75 }, clock: 'river' },
  step25e: { by: 'snap', pads: ['snap', 'snap', 'snap'], gap: 30, snap: { count: 0.75 }, clock: 'river', safe: true },
  /** beat 4, two in step after the logs, splash-back on both settings (the first awake snapper is the beat's new thing) */
  pair25: { by: 'snap', pads: ['snap', 'snap'], gap: 30, snap: { count: 0.75 }, clock: 'river', safe: true },
  /** beat 6, the wave: five, each a count later (33%, 1.00 s; riding it 34 of 45); Easy three (44%, 2.00 s) */
  wave25: { by: 'snap', pads: ['snap', 'snap', 'snap', 'snap', 'snap'], gap: 30, snap: { count: 0.75, wave: true }, clock: 'river' },
  wave25e: { by: 'snap', pads: ['snap', 'snap', 'snap'], gap: 30, snap: { count: 0.75, wave: true }, clock: 'river', safe: true },
  /** beat 8, the quickening: three in step at count 0.6 (39-47%, 0.93-1.13 s), the stage's second clock */
  quick25: { by: 'snap', pads: ['snap', 'snap', 'snap'], gap: 30, snap: { count: 0.6 }, clock: 'quick' },
  quick25e: { by: 'snap', pads: ['snap', 'snap', 'snap'], gap: 30, snap: { count: 0.6 }, clock: 'quick', safe: true },
  /** beat 9, the Big Snap: the old mossy stone that never snaps between two pairs that clap on four */
  big25: { by: 'snap', pads: ['snap', 'snap', 'stone', 'snap', 'snap'], gap: 30, snap: { count: 0.75 }, clock: 'river' },
  big25e: { by: 'snap', pads: ['snap', 'snap', 'stone', 'snap', 'snap'], gap: 30, snap: { count: 0.75 }, clock: 'river', safe: true },
} as const satisfies Record<string, PadRow>;
type Pond25 = keyof typeof PADS_25;

/** 2-5's rivers (2-1's logs between the stones): beat 4 `ride` (splash-back), beat 8 `deep` on Normal and `ride` on Easy */
export const RIVERS_25 = { ...W2_RIVERS } as const satisfies Record<string, RiverRow>;
type Row25 = keyof typeof RIVERS_25;

/** the snappers' rows (w2Cast.ts): on the river's one count (`snap-river`, every 0.75 s row's, PadRow.clock), and the quickening's on its
 *  own (`snap-quick`); each setting's rows keep the same clock, so a snapper keeps its count on both */
// (minGround 100: a snapper's patch is its 150 px bank less 24 px each end, snapperGround)
const [awake, asleep] = w2Snappers('snap-river').map((c) => ({ ...c, minGround: 100 }));
export const SNAPPERS_25: CreatureDef[] = [{ ...awake, tags: ['cast'] }, asleep, { ...w2Snappers('snap-quick')[0], minGround: 100, id: 'snapper-quick', tags: ['cast'] }];

// ───────────────────────────── the pieces (World 2's: its earth bank, its boulder, its river, its snap stones) ─────────────────────────────
/** a bank he walks on, `w` exact, level with the one before (or the section's first) */
const bank = (key: string, after: string | null, w: number): SectionPiece => ({ key, shape: 'bank', w: [w, w], place: after ? { kind: 'walk', after, dy: [0, 0] } : { kind: 'start' }, style: 'log', main: true });
/** World 2's boulder to hop on the bank (a moss stone exactly 50 px tall is the kit's painted rock); never within a snapper's bonk landing.
 *  Listed BEFORE the bank it stands on when that bank ends the brick: a brick's exit is its last piece, and a boulder as the exit hung the
 *  next section off its top, over the bank under it, and the route walked under it, no beat (BUILD-25d, the quiet line at x ~10200) */
const rock = (key: string, on: string, at: number): SectionPiece => ({ key, shape: 'block', w: [110, 120], place: { kind: 'on', on, at: [at, at], h: [50, 50] }, style: 'moss_stone', landing: true });
/** the far bank of a snap pond laid from `after` on 2-5's row `row` (gen2 place `pads`, rideLay.ts layPads) */
const pond = (key: string, after: string, row: Pond25, w: number): SectionPiece => ({ key, shape: 'bank', w: [w, w], place: { kind: 'pads', after, row }, style: 'log', main: true, landing: true });
/** the far bank of 2-1's log river laid from `after` (gen2 place `river`, riverLay.ts) */
const river = (key: string, after: string, row: Row25, w: number): SectionPiece => ({ key, shape: 'bank', w: [w, w], place: { kind: 'river', after, row }, style: 'log', main: true, landing: true });
/** the far bank of World 2's own rope over the channel (gen2 place `rope`, no look: rope-kit's painted rope between posts, world_best 2,
 *  "the river village"; BUILD-25c: 1-3's living trunks, look 'vine', are w1-traps#trunk, a World 1 piece, and stood bright yellow-green
 *  against World 2's muted backdrop, the lead's 12:41 PM still review), splash-back when `soft` */
const ropeOver = (key: string, after: string, w: number, soft: boolean): SectionPiece => ({ key, shape: 'bank', w: [w, w], place: { kind: 'rope', after, gap: [440, 460], ...(soft ? { soft: true } : {}) }, style: 'log', main: true, landing: true });

/**
 * a snapper's ground: three short level banks (`k-in`, `k`, `k-out`, SNAP_PATCH px each), the snapper in the middle one. None is wide
 * enough for a rolled flag (pipeline FLAG_SPAN.pad 160), so the nearest flag stands over 224 px from it (a flag's approach, levelCheck
 * SAFE_APPROACH 200, would take its patch); its patch is level ground with no higher floor in its bonk's landing (ENG-25c, 176 px)
 */
const SNAP_PATCH = 150;
const snapperGround = (k: string, after: string): SectionPiece[] => [bank(`${k}-in`, after, SNAP_PATCH), bank(k, `${k}-in`, SNAP_PATCH), bank(`${k}-out`, k, SNAP_PATCH)];
const petal = (id: string, on: string, t: number): Socket => ({ id, role: 'pickup', on, t, dn: 34, count: 1, span: 80 });
const flag = (on: string, t = 0.3): Socket => ({ id: 'flag', role: 'flag', on, t });
const tip = (id: string, on: string, t: number, line: keyof typeof LINES_25): Socket => ({ id, role: 'tip', on, t, allow: [lineId25(line)] });
/** a snapper on `on` at `t`: its row by id (SNAPPERS_25). Easy keeps every one, softened (easy 'stay'): the node's code asks for its
 *  count (ARC_25 `:&snapper*n`), so a snapper Easy's count cut took would be laid again by the ask somewhere on the node's banks (before
 *  Dot's line, or by a higher floor); Easy's goal is the lower one (round(0.6 x GOAL_25)) */
const snapper = (id: string, on: string, t: number, row: string): Socket => ({ id, role: 'enemy', on, t, dn: 0, allow: [row], easy: 'stay', chance: 1, maxThreat: 3 });

// ───────────────────────────── a brick ─────────────────────────────
type Lay = { pieces: SectionPiece[]; sockets: Socket[] };
type V = { id: string; lay: Lay; easy?: Lay };
type Content = 'ground' | 'water' | 'rope' | 'floating';
/** a brick (2-4's form, w2Arc24.ts): its first piece `in`, its last `out`, a version's Easy twin beside it, served to 2-5 alone, once */
function brick(o: { id: string; name: string; jobs: NodeJob[]; difficulty: number; content: Content | 'structural'; window?: [number, number]; teaches?: string; uses?: string[]; versions: V[]; phases?: SectionTemplate['phases']; maxPerStage?: number }): SectionTemplate {
  const ren = (ps: SectionPiece[]) => {
    const a = ps[0].key, z = ps[ps.length - 1].key;
    const f = (s: string) => (s === a ? 'in' : s === z ? 'out' : s);
    return ps.map((p) => ({ ...p, key: f(p.key), ...(p.from ? { from: f(p.from) } : {}), place: Object.fromEntries(Object.entries(p.place).map(([q, v]) => [q, (q === 'after' || q === 'on') && typeof v === 'string' ? f(v) : v])) as SectionPiece['place'] }));
  };
  const sk = (ps: SectionPiece[], ss: Socket[]) => { const a = ps[0].key, z = ps[ps.length - 1].key; return ss.map((s) => ({ ...s, on: s.on === a ? 'in' : s.on === z ? 'out' : s.on })); };
  const first = ren(o.versions[0].lay.pieces)[0];
  const versions = o.versions.flatMap((v) => [
    { id: v.id, pieces: ren(v.lay.pieces).slice(1), sockets: sk(v.lay.pieces, v.lay.sockets), ...(v.easy ? { easy: `${v.id}-easy` } : {}) },
    ...(v.easy ? [{ id: `${v.id}-easy`, pieces: ren(v.easy.pieces).slice(1), sockets: sk(v.easy.pieces, v.easy.sockets), easyOnly: true }] : []),
  ]);
  return {
    id: `w2-25-${o.id}`, name: o.name, feel: [STAGE_25], own: true, archetypes: 'any', phases: o.phases ?? ['ki', 'sho', 'ten', 'ketsu'], difficulty: o.difficulty, needs: ['jump'],
    ...(o.teaches ? { teaches: o.teaches } : {}), uses: o.uses ?? [], jobs: o.jobs, content: o.content, terrain: 'river-bank', maxPerStage: o.maxPerStage ?? 1, ...(o.window ? { window: o.window } : {}),
    pieces: [first], subBlocks: [{ id: 'body', versions }], entry: { piece: 'in', kind: 'ground' }, exit: { piece: 'out', kind: 'ground' }, exitDy: 0, sockets: [], mirrorable: false,
  } as SectionTemplate;
}

// ───────────────────────────── the beats ─────────────────────────────
/** [A] beat 0, arrive: the reach, a boulder to hop, the clack of the stones ahead */
const arrival: Lay = {
  pieces: [bank('a', null, 440), rock('ra', 'a', 0.55), bank('b', 'a', 360), rock('rz', 'z', 0.3), bank('z', 'b', 300)],
  sockets: [petal('pb', 'b', 0.5)],
};
/** [T] beat 1, ONE stone, safe: Dot's `count` 800+ px before it, the teaching stone over splash-back water (its bite costs no heart) */
const teachStone: Lay = {
  pieces: [bank('a', null, 480), rock('ra', 'a', 0.6), bank('b', 'a', 400), pond('c', 'b', 'teach25', 340), rock('rz', 'z', 0.6), bank('z', 'c', 300)],
  sockets: [tip('t-count', 'a', 0.1, 'count'), petal('pz', 'z', 0.25)],
};
/** [Pg] beat 2, the first snapper, ASLEEP on a long bank (`snapper` 800+ px before; nothing that hurts between): the kick cannot fail */
const sleeper: Lay = {
  pieces: [bank('a', null, 480), rock('ra', 'a', 0.6), bank('b', 'a', 400), ...snapperGround('c', 'b'), bank('z', 'c-out', 300)],
  sockets: [tip('t-snapper', 'a', 0.1, 'snapper'), snapper('e', 'c', 0.5, 'snapper-asleep')],
};
/** [Pf] beat 3, three in step (the practice row; deep on Normal); the flag before */
const threeInStep = (easy: boolean): Lay => ({
  pieces: [bank('a', null, 420), rock('ra', 'a', 0.5), bank('b', 'a', 360), pond('c', 'b', easy ? 'step25e' : 'step25', 340), bank('z', 'c', 300)],
  sockets: [flag('a'), petal('pc', 'c', 0.5)],
});
/** [X] beat 4, awake: Dot's `snap` 800+ px before the first awake snapper on a plain bank (nothing that hurts between), then 2-1's logs
 *  (splash-back) and two stones in step (splash-back) A boulder to hop on the far bank (BUILD-25d, the quiet line: 4.4-4.6 s with nothing to do from the last stone
 *  through the rest's first bank, x ~10200 on seeds 3, 11 and 12; the teaching stone's far bank's hop, BUILD-25b), its snapper 1,000+ px back */
const awakeOne: Lay = {
  pieces: [bank('a', null, 700), rock('ra', 'a', 0.5), ...snapperGround('b', 'a'), bank('m', 'b-out', 300), river('c', 'm', 'ride', 340), pond('d', 'c', 'pair25', 340), rock('rz', 'z', 0.6), bank('z', 'd', 300)],
  sockets: [tip('t-snap', 'a', 0.1, 'snap'), snapper('e', 'b', 0.5, 'snapper'), petal('pc', 'c', 0.5)],
};
/** [Pr] beat 5, the rope over the channel (deep on Normal), two snappers on the far bank past its landing */
const ropeChannel = (easy: boolean): Lay => ({
  pieces: [bank('a', null, 420), rock('ra', 'a', 0.5), bank('b', 'a', 300), ropeOver('c', 'b', 300, easy), ...snapperGround('d', 'c'), bank('m', 'd-out', 300), ...snapperGround('e', 'm'), bank('z', 'e-out', 300)],
  sockets: [snapper('e1', 'd', 0.5, 'snapper'), snapper('e2', 'e', 0.5, 'snapper')],
});
/** [W] beat 6, the TWIST, the wave: Dot's `follow` 800+ px before; five stones each a count after the last (Easy three); the flag before */
const wave = (easy: boolean): Lay => ({
  pieces: [bank('a', null, 480), rock('ra', 'a', 0.6), bank('b', 'a', 400), pond('c', 'b', easy ? 'wave25e' : 'wave25', 340), bank('z', 'c', 300)],
  sockets: [tip('t-follow', 'a', 0.1, 'follow'), flag('b', 0.3), petal('pz', 'z', 0.5)],
});
/** [Pg] beat 7, the sandbars: three snappers on the beat along the banks, petals between */
const sandbars: Lay = {
  pieces: [bank('a', null, 300), ...snapperGround('b', 'a'), bank('m1', 'b-out', 300), ...snapperGround('c', 'm1'), bank('m2', 'c-out', 300), ...snapperGround('d', 'm2'), bank('z', 'd-out', 300)],
  sockets: [snapper('e1', 'b', 0.5, 'snapper'), snapper('e2', 'c', 0.5, 'snapper'), snapper('e3', 'd', 0.5, 'snapper'), petal('pm1', 'm1', 0.5), petal('pm2', 'm2', 0.5)],
};
/**
 * the quickening's rest: the log river's far bank, the one bank between its water half (three in step, the logs) and its snappers' half,
 * QUICK_REST px (BUILD-25d; was 300). A rolled stage lays no flag from a socket (pipeline rolledFlags: the hard nodes' flags, then every span
 * past its cap split at the furthest spot in reach that keeps ROLLED_FLAGS.min from the next); the big snap's flag stands on the bank between
 * the quickening's snappers (m), 670 px past the end of this one, so this bank holds a spot `min` short of it only when it is over 310 px
 * wide (a spot is FLAG_SPAN.pad/2 in from each end). At 300 no spot fit 2300 px (`lethal`) past the flag before the three in step, and 6 of
 * 100 listed seeds failed seedlist's flags (2518-2600 px apart over the water jump). 420 leaves a spot for every flag before (the three in
 * step's far bank takes the rest).
 */
const QUICK_REST = 420;
/** [C] beat 8, the quickening: the count at 0.6 s, three in step, logs, its rest, two snappers on its clock, three in step again; the flag before */
const quickening = (easy: boolean): Lay => ({
  pieces: [bank('a', null, 420), rock('ra', 'a', 0.6), bank('b', 'a', 300), pond('c', 'b', easy ? 'quick25e' : 'quick25', 340), river('d', 'c', easy ? 'ride' : 'deep', QUICK_REST), ...snapperGround('e', 'd'), bank('m', 'e-out', 300), ...snapperGround('f', 'm'), pond('y', 'f-out', easy ? 'quick25e' : 'quick25', 340), bank('z', 'y', 300)],
  sockets: [flag('a'), snapper('e1', 'e', 0.5, 'snapper-quick'), snapper('e2', 'f', 0.5, 'snapper-quick'), petal('pc', 'c', 0.5)],
});
/** [S] beat 9, the Big Snap: the old mossy stone between two pairs that clap on four together; Dot's `quiet` once, after it */
const bigSnap = (easy: boolean): Lay => ({
  pieces: [bank('a', null, 400), rock('ra', 'a', 0.45), bank('b', 'a', 300), pond('z', 'b', easy ? 'big25e' : 'big25', 340)],
  sockets: [tip('t-quiet', 'z', 0.1, 'quiet')],
});
/** [R] a rest on the bank between beats: a stump to hop */
const rest: Lay = {
  pieces: [bank('a', null, 240), bank('b', 'a', 300), rock('rb', 'b', 0.5), bank('z', 'b', 240)],
  // (the stage's find stands on the first rest met, never by a stone or a snapper: its HOLD DOWN sign beside the teaching stone read as the
  //  stone's answer, BUILD-25b's still; 1-8's rule, BUILD-18)
  sockets: [{ id: 'find', role: 'findSpot', on: 'a', t: 0.5 }],
};

/** THE ARC'S BRICKS (2-5.md), one job each */
export const BEATS_25: SectionTemplate[] = [
  brick({ id: 'reach', name: 'the reach', jobs: ['arrive'], difficulty: 1, content: 'structural', phases: ['start'], versions: [{ id: 'reach', lay: arrival }] }),
  brick({ id: 'one-stone', name: 'one stone, safe', jobs: ['teach'], difficulty: 1, content: 'floating', teaches: COUNT_LESSON, versions: [{ id: 'one', lay: teachStone }] }),
  brick({ id: 'sleeper', name: 'the first snapper, asleep', jobs: ['practise'], difficulty: 1, content: 'ground', window: [0, 0.35], versions: [{ id: 'asleep', lay: sleeper }] }),
  brick({ id: 'three', name: 'three in step', jobs: ['practise'], difficulty: 3, content: 'floating', uses: [COUNT_LESSON], versions: [{ id: 'step', lay: threeInStep(false), easy: threeInStep(true) }] }),
  brick({ id: 'awake', name: 'the first awake snapper, logs and stones', jobs: ['test'], difficulty: 4, content: 'water', uses: [COUNT_LESSON], versions: [{ id: 'logs', lay: awakeOne }] }),
  brick({ id: 'rope', name: 'the rope over the channel', jobs: ['practise'], difficulty: 3, content: 'rope', versions: [{ id: 'channel', lay: ropeChannel(false), easy: ropeChannel(true) }] }),
  brick({ id: 'wave', name: 'the wave', jobs: ['twist'], difficulty: 5, content: 'floating', uses: [COUNT_LESSON], versions: [{ id: 'five', lay: wave(false), easy: wave(true) }] }),
  brick({ id: 'sandbars', name: 'the sandbars', jobs: ['practise'], difficulty: 4, content: 'ground', window: [0.5, 1], versions: [{ id: 'three', lay: sandbars }] }),
  brick({ id: 'quickening', name: 'the quickening', jobs: ['combine'], difficulty: 6, content: 'water', uses: [COUNT_LESSON], versions: [{ id: 'quick', lay: quickening(false), easy: quickening(true) }] }),
  brick({ id: 'big-snap', name: 'the Big Snap', jobs: ['signature'], difficulty: 3, content: 'floating', uses: [COUNT_LESSON], versions: [{ id: 'mossy', lay: bigSnap(false), easy: bigSnap(true) }] }),
  brick({ id: 'rest', name: 'a rest on the bank', jobs: ['rest'], difficulty: 1, content: 'structural', phases: ['rest'], maxPerStage: 6, versions: [{ id: 'bank', lay: rest }] }),
];

/** [E] beat 10, the far bank and the exit totem */
export const EXIT_25: SectionTemplate = {
  id: 'w2-25-far-bank', name: 'the far bank', feel: [STAGE_25], own: true, archetypes: 'any', phases: ['goal'], difficulty: 1, needs: ['walk'], jobs: ['exit'], content: 'structural', terrain: 'river-bank',
  pieces: [{ key: 'in', shape: 'bank', w: [300, 300], place: { kind: 'start' }, style: 'log', main: true, landing: true }],
  subBlocks: [{ id: 'body', versions: [{ id: 'bank', pieces: [{ key: 'out', shape: 'bank', w: [560, 580], place: { kind: 'walk', after: 'in', dy: [0, 0] }, style: 'log', main: true, landing: true }], sockets: [{ id: 'exit-totem', role: 'objective', on: 'out', t: 0.85, allow: ['exit_totem'] }] }] }],
  entry: { piece: 'in', kind: 'ground' }, exit: { piece: 'out', kind: 'ground' }, exitDy: 0, sockets: [], mirrorable: false,
} as SectionTemplate;

/** every section that is 2-5's own */
export const SECTIONS_25: SectionTemplate[] = [...BEATS_25, EXIT_25];

/**
 * World 2's kit with 2-5's rows over it (stageTable.ts kit 'w2-25', listed.ts KITS): its pool is its own sections alone; 2-5's snap rows and rivers; its snappers (w2Cast.ts) joined to the cast by World 2's spawn; its
 * graph and brief; the keeper's lines as the kit's tips.
 */
export function kitLib25(): WorldKit {
  const k = w2World(), M = k.manifest, G = M.graphs!;
  return { ...k,
    spawn: w2CastSpawn,
    manifest: { ...M,
      sections: SECTIONS_25,
      pads: PADS_25,
      rivers: RIVERS_25,
      creatures: SNAPPERS_25,
      lessons: { ...M.lessons, [COUNT_LESSON]: STAGE_25 },
      required: {},
      tips: { ...M.tips, ...Object.fromEntries((Object.keys(LINES_25) as Array<keyof typeof LINES_25>).map((key) => [lineId25(key), LINES_25[key]])) },
      teachTips: [...(M.teachTips ?? []), ...TEACH_25.map(lineId25)],
      graphs: { ...G, list: [...G.list.filter((g) => g.archetype !== 'purge'), ...Object.entries(ARC_25).map(([id, code]) => ({ id, archetype: 'purge' as const, code }))], briefs: { ...G.briefs, [STAGE_25]: BRIEF_25 } },
    } } as WorldKit;
}
