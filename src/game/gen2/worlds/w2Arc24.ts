/**
 * gen2/worlds/w2Arc24 — 2-4 "Never Touch the Bank" (Over the Water) as designed (reference/design/2-4.md, DESIGN-24-25 on
 * t-design-24@ce813ffc, the lead's rulings in its REPORT; BUILD-24, GO 3:12 PM ET 11-18). WORLD DATA: no engine line names this stage;
 * kitLib24 gives World 2's kit 2-4's rows (stageTable.ts kit 'w2-24', listed.ts KITS), and the game rolls it the way it rolls every gen2
 * stage.
 *
 * ONE idea (2-4.md): "Swing out over the water, let go onto a passing log, ride it under the next vine and grab on: cross the river without
 * touching land." His two ways of moving (1-6's liana, 2-1's log) meet in one moment: the log turns from a floor into a launcher. Two
 * clocks the eye reads at once (the vine's swing and the river's logs) and ONE press when they line up. The knob is the GAP between logs
 * (the lead's ruling 1, 11-18): the dense rows land most let-gos; only wider water makes him wait for the clocks ("not yet... NOW").
 *
 * THE PIECES (ENG-24's two forms, pipeline place `river` after a liana; riverLay.ts lianaRiverFaults judges the drop, never the hop):
 *   s  a liana caught from the bank (2-1's measured liana: 165 px out, 410 over the bank, 410 long), its landing a log river;
 *   w  a liana out of every bank's reach (430 or 600 px out), caught by a jump off a riding log: 340 long under the 410 top (the
 *      lead's ruling (a) 3:12 PM ET: at 320 Easy's judge waits 0.63 s on every row, over its 0.6 s; at 410 the log carries him into its
 *      foot and no jump is asked, ENG-24's trap).
 *
 * THE ARC (2-4.md "THE NODE STRING" `A Ts1<:#soft Pg1< Ps1>:#soft Xw1> R Pf1< Ws1>:#water R Pb1^< Cw1>:#water R Ss1< E`, one brick a
 * beat; the design's s is the rope content here, 2-1's precedent: s names no section type the deal can hold, nodeAsks TYPE_OF_LETTER,
 * the lead's ruling (c)):
 *   A  the river's edge, the first knock                 T  the first drop, safe (`drop`, 800+ px before)
 *   Pg the bank: stumps and stones                       Pr drop, ride, drop (two lianas, a stump bank between; flag)
 *   X  TURN: up from the log (`catch` 800+ px before)     Pf the fig roots: planks over a reed bed
 *   W  TWIST: no land (the first DEEP river: World 2's water warning): liana, log, liana, log
 *   Pb up to the kapok (World 2's lily bounce)           C  the long relay: wider gaps, three catches from logs (flag)
 *   S  the great swing onto the slow row (`view`)        E  the jetty
 *   R  a rest on the bank after X, W and C
 * DESIGN CHANGES (the lead's rulings, 3:12 PM ET 11-18): (b) beats 4 and 9 splash-back, so the first deep river is beat 6 where the design
 * puts the water warning; Easy's every river splash-back (2-1's ruling 1); (c) s -> r. Easy's beat 1 rides `long` (92%, 0.57 s), not the
 * design's `lashed`: a 300 px log at 60 px/s comes every 6.2 s, over riverFaults' 4 s beat (RIVER_LAY.beat), so no roll can lay it.
 * ROUGH SPOT, NAMED (the lead's ruling 3:12 PM ET): beat 9's raft is one long LOG until an engine member adds RiverRow.look 'raft'
 * (R-165.288/.289), before 2-4 ships.
 */
import { withSwing } from './w1Swing.ts';
import { W2_RIVERS, w2World } from './w2.ts';
import { carrierWidth, type RiverRow } from '../riverLay.ts';
import type { GraphBrief, NodeJob, SectionPiece, SectionTemplate, Socket, WorldKit } from '../types.ts';

export const STAGE_24 = '2-4';
type R2 = [number, number];

/** 2-4's ONE graph (2-4.md's node string with s as r, the lead's ruling (c)) */
export const ARC_24: Record<string, string> = { 'river-24-arc': 'A Tr Pg Pr Xw R Pf Wr R Pb Cw R S E' };

/** the lesson 2-4 teaches: a let-go onto a passing log (World 2's manifest lessons) */
export const DROP_LESSON = 'drop';

/** 2-4's brief, all of it data (a vine_runner: reach the jetty; 8 content nodes: rope 3 (T, Pr, W), water 2 (X, C), ground, floating,
 *  bounce one each; Meeca's petals are FEW in World 2, the keeper's 2-1 ruling). `ends: 'quiet'`: the design has no finale node (its
 *  combine is the relay, C, and it ends BIG on the signature, S, then the jetty): a finale brief adds one before the exit (pipeline
 *  graphFor), which no beat of 2-4.md is, so the quiet end keeps the node string as designed */
export const BRIEF_24: GraphBrief = {
  ends: 'quiet', trend: 'level', branching: 'none', teaches: [DROP_LESSON], deal: { rope: 37.5, water: 25, ground: 12.5, floating: 12.5, bounce: 12.5 }, dealExact: true,
  tags: true, petals: 'few',
};

/** the story keeper's lines for 2-4, verbatim (reference/story/lines-2-4.md, KEEPER-24 t-keeper-24@fa3b0930, approved 11-18). The only
 *  player words this file holds; w2Arc24.test.ts holds each equal to the keeper's file. `deep` is World 2's kit line (w2.ts W2_TIPS water):
 *  the pipeline says it before the first deep river (beat 6) */
export const LINES_24 = {
  /** Dot, THE let-go teach, 800+ px before beat 1 (the first drop, soft) */
  drop: "Knock? Log coming! Let go when it's under you.",
  /** Dot, teach, 800+ px before beat 4 (TURN: up from the log) */
  catch: 'Ride a log under the vine, then jump up!',
  /** Pokey, once, after the great swing (beat 9), never on the swing itself */
  view: 'So this is what Dot sees all day.',
} as const;
/** the stage card (stagePlan.ts World 2's 2-4 row): the keeper's line 6, held equal by w2Arc24.test.ts */
export const MISSION_24 = 'Vines to logs, logs to vines. Cross the river to the jetty.';
/** a line's id in the kit: its own, `w24.<key>` */
export const lineId24 = (line: keyof typeof LINES_24): string => `w24.${line}`;
/** the lines Dot says as TEACH lines (said on Normal's default Tips as on Help, D50) */
export const TEACH_24 = ['drop', 'catch'] as const;

/**
 * 2-4's rivers (gen2/riverLay.ts RiverRow) over World 2's table (w2.ts W2_RIVERS), by the beat, with each beat's EASY row (2-4.md's flown
 * table; ENG-24's judge holds every one: Normal >= 40% of let-gos onto a log and the worst wait <= one swing; Easy >= 85% and <= 0.6 s,
 * a log-caught liana's river <= 80 px/s). Every Easy row is the splash-back kind (2-1's ruling 1).
 */
/**
 * The TAIL of beats 4 and 6 on Normal (ENG-24e/f, R-165.301; the lead's ruling 11-19 9:12 PM ET, level.md World 2 notes): the logs go under
 * 430 px short of the far bank, past the farthest a rider reaches off a log's end (riverLay.ts rideReach: 388 px at 80 px/s, 392 at 100,
 * + RIVER_LAY.tailMargin 30 = 418 and 422), so no log carries him across alone; the liana he catches off a log hangs OVER_TAIL past where
 * they go under, a swing over open water held to World 1's FAR rule (riverLay.ts tailLianaFaults): caught off a log up to 200 px past the
 * logs' end, the testers' let-go lands a level far bank up to 360 px past the anchor (flown, ENG-24f), so the far bank 320 px past it
 * lands him with 40 px to spare. Easy keeps no tail (the vine optional on Easy only; its logs under the throw, the log-drop share).
 */
const TAIL_24 = 430;
const OVER_TAIL = 110;
export const RIVERS_24 = {
  ...W2_RIVERS,
  /** beat 1, the first drop: the widest, calmest logs, splash-back (86% Normal, 92% Easy) */
  long24: { ...W2_RIVERS.long, logW: 200, safe: true },
  /** beat 3, drop, ride, drop: `ride` then `deep`, splash-back (82%, 81%) */
  ride24: { ...W2_RIVERS.ride, logs: 2, safe: true },
  deep24: { ...W2_RIVERS.deep, logs: 2, safe: true },
  /** beat 4, up from the log: `twin` carries him under a liana no bank reaches; splash-back (the lead's ruling (b)) */
  twin24: { ...W2_RIVERS.twin, safe: true, tail: TAIL_24 },
  /** its Easy twin: `deep`'s slower, longer logs (at `long` or `twin` Easy's judge waits 0.63-0.70 s on the vine, over its 0.6 s) */
  twin24Easy: { ...W2_RIVERS.deep, safe: true },
  /** beat 6, no land: ONE river under two lianas (liana, log, liana, log), DEEP on Normal; its Easy twin the `deep` logs, splash-back.
   *  ROOT B (BUILD-24c, the lead's ruling 2:27 PM ET 11-19): the log clock sits off the liana's swing, so a missed phase comes round again
   *  in a swing or two. At `twin`'s 80 px/s it was 222/80 = 2.78 s against the 2.85 s swing (nearly locked: the bots waited the 14 s cap
   *  on both lianas); 214/100 = 2.14 s now (2.85 mod 2.14 = a third of a log). Easy: `deep`'s 232/75 = 3.09 s against its 3.3 s swing,
   *  now 210/80 = 2.63 s (a quarter off: the most within Easy's 80 px/s log-catch cap, LIANA_RIVER.easyCatch, riverFaults' 60 px gap
   *  and never harder than Normal's row). Measured: reference/qa-reports/BUILD-24c. Normal's TAIL (ENG-24f): its logs' window 3 logs
   *  long (706 px: the same spacing, so the same 2.14 s clock), the second liana over the tail past it (liana, log, liana, the far bank) */
  noLand24: { ...W2_RIVERS.twin, logs: 3, speed: 100, gap: 64, tail: TAIL_24 },
  noLand24Easy: { ...W2_RIVERS.deep, logs: 5, safe: true, speed: 80, logW: 150, gap: 60 },
  /** beat 8, the long relay: the gap is the knob, 200 then 280 px of water between logs (51%, 41%: wait up to a swing), DEEP */
  gap200: { dir: 1, speed: 100, logW: 150, logs: 3, gap: 200 },
  gap280: { dir: 1, speed: 110, logW: 150, logs: 2, gap: 280 },
  gap200Easy: { ...W2_RIVERS.twin, logs: 5, safe: true },
  gap280Easy: { ...W2_RIVERS.deep, logs: 5, safe: true },
  /** beat 9, the great swing onto the slow row of RAFTS to the jetty (2-4.md:39/:60; World 2's painted puzzle-kit#raft, ENG-24c), splash-back */
  slow24: { dir: 1, speed: 70, logW: 200, logs: 2, safe: true, look: 'raft' },
} as const satisfies Record<string, RiverRow>;
type Row24 = keyof typeof RIVERS_24;

// ───────────────────────────── the pieces (World 2's: its earth bank, its boulder, its river, its lianas) ─────────────────────────────
/** a bank he walks on, `w` exact, level with the one before (or the section's first) */
const bank = (key: string, after: string | null, w: number): SectionPiece => ({ key, shape: 'bank', w: [w, w], place: after ? { kind: 'walk', after, dy: [0, 0] } : { kind: 'start' }, style: 'log', main: true });
const UP: R2 = [-56, -50], DOWN: R2 = [50, 56];
/** a bank a step up or down the shore */
const shore = (key: string, after: string, w: number, dy: R2): SectionPiece => ({ ...bank(key, after, w), place: { kind: 'walk', after, dy } });
/** World 2's boulder to hop on the bank (w2.ts rock: a moss stone exactly 50 px tall is the kit's painted rock) */
const rock = (key: string, on: string, at: number): SectionPiece => ({ key, shape: 'block', w: [110, 120], place: { kind: 'on', on, at: [at, at], h: [50, 50] }, style: 'moss_stone', landing: true });
/** World 2's bounce on `on`: its painted lily cap, 30 px over the bank (2-1's spring, the bounce every world's bots and players know) */
const spring = (key: string, on: string, at: number): SectionPiece => ({ key, shape: 'bouncy', w: [70, 70], place: { kind: 'on', on, at: [at, at], h: [30, 30] } });
/** planks (World 2's dock look: canopy_bridge), level with `after` */
const planks = (key: string, after: string, w: number): SectionPiece => ({ ...bank(key, after, w), style: 'canopy_bridge' });
/** planks over a reed bed: a soft gap (the world's splash-back creek, w2Finish) a plain hop wide */
const plankHop = (key: string, after: string, w: number): SectionPiece => ({ ...planks(key, after, w), place: { kind: 'jump', after, dy: [0, 0], gapPx: [90, 110], soft: true }, landing: true });
/** the s piece: a liana caught from the bank `after`, 2-1's measured liana (165 px out, 410 over it, 410 long) */
const lianaS = (key: string, after: string, top: R2 = [410, 410], len: R2 = [410, 410]): SectionPiece =>
  ({ key, shape: 'liana', w: [0, 0], place: { kind: 'swing', after, top, reach: [165, 165], len } });
/** the w piece: a liana out of every bank's reach, `reach` px past `after`'s end, caught by a jump off a riding log (340 long, ruling (a)) */
const lianaW = (key: string, after: string, reach: number): SectionPiece =>
  ({ key, shape: 'liana', w: [0, 0], place: { kind: 'swing', after, top: [410, 410], reach: [reach, reach], len: [340, 340] } });
/** where a second liana over the same river hangs (px past the bank's end): its first liana's 165 and the engine's chain distance past it
 *  (physics.ts CHAIN.dx 560: two lianas closer are a CHAIN, phased for a leap from one to the other, so the log between them would be
 *  skipped; 2-4.md beats 6 and 8 ask liana, LOG, liana, log), and some */
const FAR_W = 765;
/** the far bank of the river laid under the liana `after` from 2-4's row `row` (gen2 place `river`, riverLay.ts) */
const river = (key: string, after: string, row: Row24, w: number, style: SectionPiece['style'] = 'log'): SectionPiece =>
  ({ key, shape: 'bank', w: [w, w], place: { kind: 'river', after, row }, style, main: true, landing: true });

const petal = (id: string, on: string, t: number): Socket => ({ id, role: 'pickup', on, t, dn: 34, count: 1, span: 80 });
const flag = (on: string, t = 0.3): Socket => ({ id: 'flag', role: 'flag', on, t });
const tip = (id: string, on: string, t: number, line: keyof typeof LINES_24): Socket => ({ id, role: 'tip', on, t, allow: [lineId24(line)] });

// ───────────────────────────── a brick ─────────────────────────────
type Lay = { pieces: SectionPiece[]; sockets: Socket[] };
type V = { id: string; lay: Lay; easy?: Lay };
type Content = 'ground' | 'water' | 'rope' | 'bounce' | 'floating';
/** a brick (2-1's form, w2Arc21.ts): its first piece `in`, its last `out`, a version's Easy twin beside it, served to 2-4 alone, once */
function brick(o: { id: string; name: string; jobs: NodeJob[]; difficulty: number; content: Content | 'structural'; teaches?: string; uses?: string[]; versions: V[]; phases?: SectionTemplate['phases']; maxPerStage?: number }): SectionTemplate {
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
    id: `w2-24-${o.id}`, name: o.name, feel: [STAGE_24], own: true, archetypes: 'any', phases: o.phases ?? ['ki', 'sho', 'ten', 'ketsu'], difficulty: o.difficulty, needs: ['jump'],
    ...(o.teaches ? { teaches: o.teaches } : {}), uses: o.uses ?? [], jobs: o.jobs, content: o.content, terrain: 'river-bank', maxPerStage: o.maxPerStage ?? 1,
    pieces: [first], subBlocks: [{ id: 'body', versions }], entry: { piece: 'in', kind: 'ground' }, exit: { piece: 'out', kind: 'ground' }, exitDy: 0, sockets: [], mirrorable: false,
  } as SectionTemplate;
}

// ───────────────────────────── the beats ─────────────────────────────
/** [A] beat 0, the river's edge: down the last of the shore to the water, a boulder to hop, the knock of a log leaving the bank ahead */
const arrival: Lay = {
  pieces: [bank('a', null, 440), shore('b', 'a', 320, DOWN), rock('rb', 'b', 0.5), shore('c', 'b', 360, UP), bank('z', 'c', 300)],
  sockets: [petal('pc', 'c', 0.5)],
};
/** [T] beat 1, the first drop, safe: a long bank to hear the knock on (the keeper's `drop` 800+ px before the water), one liana over the
 *  splash-back `long` river (Easy: the same calm logs), the far bank */
const firstDrop = (easy: boolean): Lay => ({
  pieces: [bank('a', null, 480), rock('ra', 'a', 0.6), bank('b', 'a', 400), lianaS('l', 'b'), river('c', 'l', 'long24', 340), rock('rc', 'c', 0.15), bank('z', 'c', 300)],
  sockets: [tip('t-drop', 'a', 0.1, 'drop'), petal('pz', 'z', 0.5), ...(easy ? [] : [])],
});
/** [Pg] beat 2, the bank: stumps and stones along the shore, up and down, the next river's logs knocking below */
const theBank = (): Lay => ({
  pieces: [bank('a', null, 300), shore('b', 'a', 320, UP), rock('rb', 'b', 0.45), shore('c', 'b', 300, DOWN), bank('d', 'c', 280), rock('rd', 'd', 0.55), shore('e', 'd', 300, UP), shore('z', 'e', 340, DOWN)],
  sockets: [petal('pc', 'c', 0.5), petal('pe', 'e', 0.5)],
});
/** [Pr] beat 3, drop, ride, drop: a liana over `ride`, a stump bank, a liana over `deep`, both splash-back; the flag before */
const dropRideDrop = (): Lay => ({
  pieces: [bank('a', null, 420), rock('ra', 'a', 0.5), bank('b', 'a', 420), lianaS('l1', 'b'), river('m', 'l1', 'ride24', 520), rock('rm', 'm', 0.15), rock('rn', 'm', 0.92), lianaS('l2', 'm'), river('y', 'l2', 'deep24', 340), rock('ry', 'y', 0.15), bank('z', 'y', 300)],
  // (its petal mid-bank, clear of the stumps: at 0.2 it sat in the stump `rm` (0.15) and the pickup check took it off, so 2-4 ran 2,438 px
  //  without a petal from the near bank to the deep river; petals.test.ts 'spread out', BUILD-24b)
  sockets: [flag('a'), petal('pm', 'm', 0.5)],
});
/** [X] beat 4, the TURN, up from the log: the keeper's `catch` 800+ px before; he boards a `twin` log at the bank, rides it under a liana
 *  no bank reaches and jumps up to it (every ride has a catch); splash-back (the lead's ruling (b)); the flag before */
const upFromLog = (easy: boolean): Lay => ({
  pieces: [bank('a', null, 480), rock('ra', 'a', 0.6), bank('b', 'a', 420), lianaW('l', 'b', easy ? 430 : carrierWidth(RIVERS_24.twin24) + OVER_TAIL), river('c', 'l', easy ? 'twin24Easy' : 'twin24', 340), rock('rc', 'c', 0.15), bank('z', 'c', 300)],
  sockets: [tip('t-catch', 'a', 0.1, 'catch'), flag('b', 0.2), petal('pc', 'c', 0.5)],
});
/** [Pf] beat 5, the fig roots: planks over a reed bed (splash-back), a stump up and down, a breath */
const figRoots = (): Lay => ({
  pieces: [bank('a', null, 320), plankHop('p1', 'a', 200), plankHop('p2', 'p1', 220), plankHop('p3', 'p2', 200), shore('b', 'p3', 300, UP), rock('rb', 'b', 0.5), shore('z', 'b', 320, DOWN)],
  sockets: [petal('pp', 'p2', 0.5), petal('pb', 'b', 0.25)],
});
/** [W] beat 6, the TWIST, no land: ONE river under two lianas, the first caught from the bank, the second off a log (liana, log, liana,
 *  log, no bank between); the first DEEP river on Normal (World 2's water warning before it); a heart after (the pipeline's) */
const noLand = (easy: boolean): Lay => ({
  pieces: [bank('a', null, 420), rock('ra', 'a', 0.5), bank('b', 'a', 320), lianaS('l1', 'b'), lianaW('l2', 'b', easy ? FAR_W : carrierWidth(RIVERS_24.noLand24) + OVER_TAIL), river('c', 'l2', easy ? 'noLand24Easy' : 'noLand24', 340), rock('rc', 'c', 0.15), bank('z', 'c', 300)],
  sockets: [flag('a'), petal('pz', 'z', 0.5)],
});
/** [Pb] beat 7, up to the kapok: World 2's lily bounce at the foot of the high bank (the bounce teach's band, 174-180 px: 2-1's ruling),
 *  a boulder on top, one step down */
const upToKapok = (): Lay => {
  const m = 'm';
  return {
    pieces: [bank('a', null, 340), spring(m, 'a', 0.72), { ...shore('w', 'a', 380, [-180, -174]), landing: true, block: 'bounce', from: m }, rock('rw', 'w', 0.5), shore('z', 'w', 340, [76, 80])],
    sockets: [petal('pw', 'w', 0.5)],
  };
};
/** [C] beat 8, the long relay: wider water between logs (200, then 280 twice), each river under a bank liana and one caught off a log
 *  (three catches from logs), a stump bank between; deep on Normal (Easy: `twin` then `deep` logs, splash-back); the flag before. Its
 *  third leg (the lead's ruling (B) 4:45 PM ET 11-18, BUILD-24b): more of the signature, all water, so World 2's gen2 stages are not
 *  shorter than World 1's (stageQuality.test.ts 'stages grow': 2-4 modelled 224 s, 240 s with it) */
const longRelay = (easy: boolean): Lay => ({
  pieces: [bank('a', null, 420), rock('ra', 'a', 0.5), bank('b', 'a', 300), lianaS('l1', 'b'), lianaW('l2', 'b', FAR_W), river('m', 'l2', easy ? 'gap200Easy' : 'gap200', 340), rock('rm', 'm', 0.15), lianaS('l3', 'm'), lianaW('l4', 'm', FAR_W), river('y', 'l4', easy ? 'gap280Easy' : 'gap280', 340), rock('ry', 'y', 0.15),
    lianaS('l5', 'y'), lianaW('l6', 'y', FAR_W), river('q', 'l6', easy ? 'gap280Easy' : 'gap280', 340), rock('rq', 'q', 0.15), bank('z', 'q', 300)],
  sockets: [flag('a'), petal('pm', 'm', 0.5), petal('py', 'y', 0.65)],
});
/** [S] beat 9, the signature, the great swing: the longest liana in the game from the kapok's bank, one huge arc onto the slow row's long
 *  log (the raft, a log until R-165.288 lands), drifting to the jetty's planks; Pokey's `view` once he is there (never on the swing) */
const greatSwing = (): Lay => ({
  pieces: [bank('a', null, 400), rock('ra', 'a', 0.45), bank('b', 'a', 300), lianaS('l', 'b', [500, 500], [500, 500]), river('z', 'l', 'slow24', 340, 'canopy_bridge')],
  sockets: [tip('t-view', 'z', 0.05, 'view')],
});
/** [R] a rest on the bank between beats: a hop up and down the shore, a stump */
const rest: Lay = {
  pieces: [bank('a', null, 300), shore('b', 'a', 280, UP), rock('rb', 'b', 0.5), shore('c', 'b', 300, DOWN), shore('d', 'c', 260, UP), shore('z', 'd', 300, DOWN)],
  sockets: [],
};

/** THE ARC'S BRICKS (2-4.md), one job each: the graph's letter in brackets */
export const BEATS_24: SectionTemplate[] = [
  brick({ id: 'edge', name: "the river's edge", jobs: ['arrive'], difficulty: 1, content: 'structural', phases: ['start'], versions: [{ id: 'edge', lay: arrival }] }),
  brick({ id: 'first-drop', name: 'the first drop, safe', jobs: ['teach'], difficulty: 1, content: 'rope', teaches: DROP_LESSON, versions: [{ id: 'drop', lay: firstDrop(false), easy: firstDrop(true) }] }),
  brick({ id: 'bank', name: 'stumps and stones along the bank', jobs: ['practise'], difficulty: 2, content: 'ground', versions: [{ id: 'shore', lay: theBank() }] }),
  brick({ id: 'drop-ride-drop', name: 'drop, ride, drop', jobs: ['practise'], difficulty: 3, content: 'rope', uses: [DROP_LESSON], versions: [{ id: 'two', lay: dropRideDrop() }] }),
  brick({ id: 'up-from-log', name: 'up from the log', jobs: ['test'], difficulty: 4, content: 'water', uses: [DROP_LESSON], versions: [{ id: 'catch', lay: upFromLog(false), easy: upFromLog(true) }] }),
  brick({ id: 'root-planks', name: 'the fig roots', jobs: ['practise'], difficulty: 1, content: 'floating', versions: [{ id: 'roots', lay: figRoots() }] }),
  brick({ id: 'no-land', name: 'no land', jobs: ['twist'], difficulty: 5, content: 'rope', uses: [DROP_LESSON], versions: [{ id: 'relay', lay: noLand(false), easy: noLand(true) }] }),
  brick({ id: 'kapok', name: 'up to the kapok', jobs: ['practise'], difficulty: 2, content: 'bounce', versions: [{ id: 'spring', lay: upToKapok() }] }),
  brick({ id: 'long-relay', name: 'the long relay', jobs: ['combine'], difficulty: 6, content: 'water', uses: [DROP_LESSON], versions: [{ id: 'gaps', lay: longRelay(false), easy: longRelay(true) }] }),
  brick({ id: 'great-swing', name: 'the great swing', jobs: ['signature'], difficulty: 3, content: 'rope', uses: [DROP_LESSON], versions: [{ id: 'kapok', lay: greatSwing() }] }),
  brick({ id: 'rest', name: 'a rest on the bank', jobs: ['rest'], difficulty: 1, content: 'structural', phases: ['rest'], maxPerStage: 6, versions: [{ id: 'shore', lay: rest }] }),
];

/** [E] beat 10, the jetty: its planks, then the bank and the exit totem */
export const EXIT_24: SectionTemplate = {
  id: 'w2-24-jetty', name: 'the jetty', feel: [STAGE_24], own: true, archetypes: 'any', phases: ['goal'], difficulty: 1, needs: ['walk'], jobs: ['exit'], content: 'structural', terrain: 'river-bank',
  pieces: [{ key: 'in', shape: 'bank', w: [300, 300], place: { kind: 'start' }, style: 'canopy_bridge', main: true, landing: true }],
  subBlocks: [{ id: 'body', versions: [{ id: 'jetty', pieces: [{ key: 'out', shape: 'bank', w: [560, 580], place: { kind: 'walk', after: 'in', dy: [0, 0] }, style: 'log', main: true, landing: true }], sockets: [{ id: 'exit-totem', role: 'objective', on: 'out', t: 0.85, allow: ['exit_totem'] }] }] }],
  entry: { piece: 'in', kind: 'ground' }, exit: { piece: 'out', kind: 'ground' }, exitDy: 0, sockets: [], mirrorable: false,
} as SectionTemplate;

/** every section that is 2-4's own */
export const SECTIONS_24: SectionTemplate[] = [...BEATS_24, EXIT_24];

/**
 * World 2's kit with 2-4's rows over it (stageTable.ts kit 'w2-24', listed.ts KITS): its pool is its own sections alone; it swings
 * (withSwing: the lianas); 2-4's river table; its graph and brief; the keeper's lines as the kit's tips.
 */
export function kitLib24(): WorldKit {
  const k = withSwing(w2World()), M = k.manifest, G = M.graphs!;
  return { ...k,
    manifest: { ...M,
      sections: SECTIONS_24,
      rivers: RIVERS_24,
      lessons: { ...M.lessons, swing: '1-6', [DROP_LESSON]: STAGE_24 },
      required: {},
      tips: { ...M.tips, ...Object.fromEntries((Object.keys(LINES_24) as Array<keyof typeof LINES_24>).map((key) => [lineId24(key), LINES_24[key]])) },
      teachTips: [...(M.teachTips ?? []), ...TEACH_24.map(lineId24)],
      graphs: { ...G, list: [...G.list.filter((g) => g.archetype !== 'vine_runner'), ...Object.entries(ARC_24).map(([id, code]) => ({ id, archetype: 'vine_runner' as const, code }))], briefs: { ...G.briefs, [STAGE_24]: BRIEF_24 } },
    } } as WorldKit;
}
