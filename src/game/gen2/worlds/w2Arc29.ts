/**
 * gen2/worlds/w2Arc29 — 2-9 "The River King's Court: The King's Drum", the DRAFT laid by its design (reference/design/2-9.md on
 * t-design-29; BUILD-29, R-165.449). DRAFT, TEST AND TOOL ONLY until the lead's GO (level.md rule 25): nothing in the game imports it, it is
 * rolled through listed.ts's test seam (a test's row: draft29Row()), and the hand-built 2-9 (w2Stages.ts) still stands.
 *
 * One brick a beat (2-5's form, w2Arc25.ts, from 2-4's), each on World 2's rows at the design's numbers, under a brief naming the court's
 * tempo (tempo.ts: the liana's swing is a bar of four; every clock a whole number of beats; the lock 0.92, the lead's ruling on READY (a)):
 *   A    the water gate, the drum alone; Dot's `drum` 800 px+ before beat 1   Xr1>  2-4's liana over a court river, let go on ONE
 *   Tp1< two snap stones in step on the court's jaws, splash-back, free bite    Pp1&> three in step, then two snappers on the court's jaws
 *   Pw1> a court river, a log a bar, splash-back                               Wr1>  the twist: a liana over the `double` river (two beats)
 *   Pf1> five small weight pads at the run pitch, splash-back                  Uc^<  the wheel up the terrace, on the drum (N4)
 *   Cp1&> the wave of five (Easy two pairs), a court log, two snappers         Pb1^< World 2's bounce up the quay
 *   Sw1> the King's Barge from the quay to the shrine steps                     E     the shrine
 * NOT IN THE DRAFT (each named in reference/qa-reports/BUILD-29/REPORT.md, built by the pieces lane ENG-29-e, never here): the drum
 * doubling in the twist (G1), the posted royal guard on the landing (G2), the barge's own look (G3, it rides as a long log), the court
 * bell on the steps' arch. The liana beats are written `r` (2-4's letter): the design's `s` is unlaid (G5, the lead's call).
 */
import { W2_RIVERS, W2_WHEELS, w2World } from './w2.ts';
import { W2_POSTED_GUARD, w2CastSpawn, w2Snappers } from './w2Cast.ts';
import { generateAllLevels } from '../../worldsData.ts';
import type { TempoSpec } from '../../tempo.ts';
import type { PadRow } from '../rideLay.ts';
import type { RiverRow } from '../riverLay.ts';
import type { WheelRow } from '../wheelLay.ts';
import type { ListedStage } from '../listed.ts';
import type { CreatureDef, GraphBrief, NodeJob, SectionPiece, SectionTemplate, Socket, WorldKit } from '../types.ts';
import type { LevelConfig } from '../../types.ts';
import { w2Finish } from './w2.ts';
import { DOT_LINES } from '../../dotLinesData.ts';
import type { W2Decor } from '../../riverArt.ts';
import type { Platform } from '../../types.ts';

export const STAGE_29 = '2-9';
/** the draft's bot id (the bots fly a fixture by an id no stage of the game has, realPlay.ts withFixtureConfig; the tempo toy is 2-90) */
export const DRAFT_ID_29 = '2-91';

/** 2-9's ONE graph: the design's node string (2-9.md:50) with the two liana beats on `r` (G5) */
export const ARC_29: Record<string, string> = { 'court-29-arc': 'A Tp1<:#soft Pw1> Pf1> Xr1>:#water R Pp1&>:&snapper*3 Wr1>:#water R Uc^< Cp1&>:#water:&snapper*4 R Pb1^< Sw1> E' };

/** the lesson 2-9 teaches: the beat (hop, ride, swing and bop on the drum) */
export const BEAT_LESSON = 'beat';

/** the court's tempo (2-9.md:6-7): one liana swing (TIMED.period 2.85 s Normal, 3.3 s Easy) is a bar of four; every liana on the lock */
export const TEMPO_29: TempoSpec = { beats: 4, bar: 2.85, easyStretch: 3.3 / 2.85, lock: 0.9, doubleIn: ['w2-29-double'] };
/** one count of the court's jaws on Normal (s): a beat, 0.7125 s */
const COUNT = TEMPO_29.bar / TEMPO_29.beats;

/** 2-9's brief: a gauntlet (stagePlan.ts's 2-9 row), level, its one lesson the beat, the court's tempo, the snappers its cast */
export const BRIEF_29: GraphBrief = {
  ends: 'quiet', trend: 'level', branching: 'none', teaches: [BEAT_LESSON], deal: { floating: 35, water: 30, rope: 20, ground: 5, climb: 5, bounce: 5 }, dealExact: true,
  tags: true, petals: 'few', cast: ['turtle'], tempo: TEMPO_29,
};

/** the story keeper's lines for 2-9, verbatim (origin/t-keeper-23-29 reference/story/lines-2-9.md, KEEPER-23-29, approved 11-18) */
export const LINES_29 = {
  drum: "Hop to the drum's beat, and keep running!",
  roar: "That's the king! Now the drum's twice as fast!",
  rang: 'I think I just rang for the king.',
  goalStart: 'Chase off {n} snappers to open the sanctuary',
  goalLate: 'Still {n} snappers to chase off',
  sealed: 'Snappers still on the court! Back we go!',
} as const;
/** the court's goal AS DESIGNED (LevelConfig.countSet, 2-5's form; the lead's ruling A on BUILD-29-b): 7 seated (beat 5 three, beat 8 four),
 *  chase off 5; no top-up (it seated snappers on the drum's teach and under higher floors); Easy easyMode's share */
export const GOAL_29 = 5;
export const MISSION_29 = "Dance to the king's drum, chase off his snappers, reach the shrine.";
/** the journal card (the story keeper's `drumCard`, lines-2-9.md ask 5): held as 2-3's HERON_CARD_23 is, until the lead rules its picture
 *  (a road card needs its own painted art, journal.test.ts; or a journal page beside 2-4's kapok) */
export const DRUM_CARD_29 = { name: "The King's Drum", tip: 'Crocodiles signal by slapping their heads on water. This king prefers drums.' } as const;
export const lineId29 = (line: keyof typeof LINES_29): string => `w29.${line}`;
/** Dot's line for the king's guard (dotLinesData.ts's row, its old words as W1_TIPS keeps them: dotLines.ts swaps the new look's in) */
export const KICK_29 = 'hint.2-9.kick';
const KICK_WORDS_29 = ((r) => r?.[4] ?? r?.[5] ?? undefined)(DOT_LINES.find((q) => q[0] === KICK_29));
/** the teach lines (said on the first meeting, never waiting out Dot's calm gap) */
export const TEACH_29 = ['drum', 'roar'] as const;

/** the court's rows of snap stones and pads (2-9.md:10-17). The stones are the WIDE snap stone (130 px, ENG-STONE29's flown band, a pace of
 *  258-281 px/s): Normal 130 + 62, Easy its own twin rows at 130 + 92 (mid-band; Easy 130 + 50 is off the beat), the lead's ruling 3; flown
 *  on the real engine before use (BUILD-29 probes/stone29.ts: 2 in step and the wave of 5 [12--]). The pads at 50 px: the lead's ruling (vi) */
const STONE_GAP_29 = { normal: 62, easy: 92 } as const;
const snapRow = (n: number, easy: boolean, o: Partial<PadRow> = {}): PadRow =>
  ({ by: 'snap', pads: Array.from({ length: n }, () => 'snap'), gap: easy ? STONE_GAP_29.easy : STONE_GAP_29.normal, clock: 'court', easyStretch: TEMPO_29.easyStretch, ...o, snap: { count: COUNT, w: 130, ...o.snap } }) as PadRow;
export const PADS_29 = {
  /** beat 1: two in step, splash-back, the bite free (the drum is the hint, not the rule) */
  teach29: snapRow(2, false, { safe: true, freeBite: true }),
  teach29e: snapRow(2, true, { safe: true, freeBite: true }),
  /** beat 5: TWO in step (Dot says go on ONE; TWO is the forgiveness, never THREE: 3 in step is 0 frames late, the lead's ruling 3), splash-back */
  two29: snapRow(2, false, { safe: true }),
  two29e: snapRow(2, true, { safe: true }),
  /** beat 8: the WAVE of five (each a count later); Easy two pairs (Easy lays no wave longer than 2, rule 4) */
  wave29: snapRow(5, false, { snap: { count: COUNT, wave: true } }),
  wave29e: snapRow(2, true, { snap: { count: COUNT, wave: true }, safe: true }),
  /** beat 3: five small weight pads at the run pitch, one beat a pad never sinks */
  pads29: { by: 'weight', pads: ['small', 'small', 'small', 'small', 'small'], gap: 50, safe: true } as PadRow,
} as const satisfies Record<string, PadRow>;
type Pond29 = keyof typeof PADS_29;

/** 2-9's rivers: World 2's `court` (a log a bar), its splash-back twin, the twist's `double` (two beats a log; Easy keeps one a bar,
 *  court's own numbers) and the King's Barge (one 384 px log, two on the river's cycle: two bars; Easy 70/390) */
export const RIVERS_29 = {
  ...W2_RIVERS,
  court29s: { ...W2_RIVERS.court, safe: true },
  double29: { dir: 1, speed: 140, logW: 127.5, gap: 72, logs: 3, easy: { speed: 70, logW: 159 } },
  barge29: { dir: 1, look: 'barge', speed: 80, logW: 384, gap: 72, logs: 2, easy: { speed: 70, logW: 390 } },
} as const satisfies Record<string, RiverRow>;
type Row29 = keyof typeof RIVERS_29;
/** World 2's wheels; the terrace lays W2_WHEELS.court (R120 N4 both settings, the lead's rulings G4 and BUILD-29-i; flown: wheelFlights.data.ts) */
export const WHEELS_29 = W2_WHEELS;

/** the snappers, on the court's jaws (the stones' clock: PadRow.clock 'court') */
export const SNAPPERS_29: CreatureDef[] = [...w2Snappers('snap-court').map((c) => ({ ...c, minGround: 100 })), W2_POSTED_GUARD];

// ───────────────────────────── the pieces ─────────────────────────────
const bank = (key: string, after: string | null, w: number): SectionPiece => ({ key, shape: 'bank', w: [w, w], place: after ? { kind: 'walk', after, dy: [0, 0] } : { kind: 'start' }, style: 'log', main: true });
const rise = (key: string, after: string, w: number, dy: number): SectionPiece => ({ ...bank(key, after, w), place: { kind: 'walk', after, dy: [dy, dy] }, landing: true });
const rock = (key: string, on: string, at: number): SectionPiece => ({ key, shape: 'block', w: [110, 120], place: { kind: 'on', on, at: [at, at], h: [50, 50] }, style: 'moss_stone', landing: true });
const spring = (key: string, on: string, at: number): SectionPiece => ({ key, shape: 'bouncy', w: [70, 70], place: { kind: 'on', on, at: [at, at], h: [30, 30] } });
const pond = (key: string, after: string, row: Pond29, w: number): SectionPiece => ({ key, shape: 'bank', w: [w, w], place: { kind: 'pads', after, row }, style: 'log', main: true, landing: true });
const river = (key: string, after: string, row: Row29, w: number): SectionPiece => ({ key, shape: 'bank', w: [w, w], place: { kind: 'river', after, row }, style: 'log', main: true, landing: true });
/** a court liana, 365 px (both: beat 4's and the twist's). At 410 a let-go on ONE from the twist's foot (grip 0.95) dropped him between
 *  the double river's logs on Normal at every lock 0.88-0.92 (the engine, the child's let-go), and G6's court judge (COURT_SAG) gave
 *  beat 4 on Easy 0.07 s late. Flown (BUILD-29-e): the twist passes the engine on Normal at 340-370 (380: 0.17 s), Easy's 0.60 s wait
 *  at 355-370 (350: 0.63 s); beat 4 passes the judge at 340-395 (410 fails Easy). qa-reports/BUILD-29/flown/court365-*.txt */
const liana = (key: string, after: string, len = 365): SectionPiece => ({ key, shape: 'liana', w: [0, 0], place: { kind: 'swing', after, top: [410, 410], reach: [165, 165], len: [len, len] } });
const wheel = (key: string, after: string, row: keyof typeof WHEELS_29, w: number): SectionPiece => ({ key, shape: 'branch', w: [w, w], place: { kind: 'wheel', after, row }, main: true, landing: true });
const SNAP_PATCH = 150;
const snapperGround = (k: string, after: string): SectionPiece[] => [bank(`${k}-in`, after, SNAP_PATCH), bank(k, `${k}-in`, SNAP_PATCH), bank(`${k}-out`, k, SNAP_PATCH)];
const petal = (id: string, on: string, t: number): Socket => ({ id, role: 'pickup', on, t, dn: 34, count: 1, span: 80 });
const flag = (on: string, t = 0.3): Socket => ({ id: 'flag', role: 'flag', on, t });
const tip = (id: string, on: string, t: number, line: keyof typeof LINES_29): Socket => ({ id, role: 'tip', on, t, allow: [lineId29(line)] });
const snapper = (id: string, on: string, t: number): Socket => ({ id, role: 'enemy', on, t, dn: 0, allow: ['snapper'], easy: 'stay', chance: 1, maxThreat: 3 });

// ───────────────────────────── a brick (2-5's form) ─────────────────────────────
type Lay = { pieces: SectionPiece[]; sockets: Socket[] };
type V = { id: string; lay: Lay; easy?: Lay };
type Content = 'ground' | 'water' | 'rope' | 'floating' | 'climb' | 'bounce' | 'structural';
function brick(o: { id: string; name: string; jobs: NodeJob[]; difficulty: number; content: Content; teaches?: string; uses?: string[]; versions: V[]; phases?: SectionTemplate['phases']; maxPerStage?: number }): SectionTemplate {
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
    id: `w2-29-${o.id}`, name: o.name, feel: [STAGE_29], own: true, archetypes: 'any', phases: o.phases ?? ['ki', 'sho', 'ten', 'ketsu'], difficulty: o.difficulty, needs: ['jump'],
    ...(o.teaches ? { teaches: o.teaches } : {}), uses: o.uses ?? [], jobs: o.jobs, content: o.content, terrain: 'river-bank', maxPerStage: o.maxPerStage ?? 1,
    pieces: [first], subBlocks: [{ id: 'body', versions }], entry: { piece: 'in', kind: 'ground' }, exit: { piece: 'out', kind: 'ground' }, exitDy: 0, sockets: [], mirrorable: false,
  } as SectionTemplate;
}

// ───────────────────────────── the beats ─────────────────────────────
/** [A] the water gate: the drum alone; Dot's `drum` TEACH 800 px+ before beat 1's stones (0.1 of a 480 bank + 400 + 300 to the pond) */
const arrival: Lay = { pieces: [bank('a', null, 480), rock('ra', 'a', 0.6), bank('b', 'a', 400), rock('rb', 'b', 0.5), bank('z', 'b', 300)], sockets: [tip('t-drum', 'a', 0.1, 'drum')] };
/** [T p1<] beat 1, hear the drum: two stones in step over splash-back water, the bite free */
const hearDrum = (easy: boolean): Lay => ({ pieces: [bank('a', null, 360), pond('c', 'a', easy ? 'teach29e' : 'teach29', 340), bank('z', 'c', 300)], sockets: [petal('pz', 'z', 0.5)] });
/** [P w1>] beat 2, logs on the beat: a splash-back court river, a log knocking out on every ONE */
const logsOnBeat: Lay = { pieces: [bank('a', null, 360), river('c', 'a', 'court29s', 340), bank('z', 'c', 300)], sockets: [] };
/** [P f1>] beat 3, pads on the beat: five small weight pads at the run pitch, splash-back */
const padsOnBeat: Lay = { pieces: [bank('a', null, 360), pond('c', 'a', 'pads29', 340), bank('z', 'c', 300)], sockets: [petal('pz', 'z', 0.5)] };
/** [X r1>] beat 4, let go on ONE: 2-4's liana over a splash-back court river, locked to the bar; the flag before */
const letGoOnOne: Lay = { pieces: [bank('a', null, 420), rock('ra', 'a', 0.5), bank('b', 'a', 400), liana('l', 'b'), river('c', 'l', 'court', 340), bank('z', 'c', 300), rock('rc', 'z', 0.5)], sockets: [flag('a')] };
/** [P p1&>] beat 5, the snappers: TWO in step (go on ONE; TWO forgiven), then the snappers on the court's jaws */
const snappers = (easy: boolean): Lay => ({
  pieces: [bank('a', null, 360), pond('c', 'a', easy ? 'two29e' : 'two29', 340), bank('m', 'c', 300), ...snapperGround('s1', 'm'), bank('n', 's1-out', 240), ...snapperGround('s2', 'n'), bank('o', 's2-out', 240), ...snapperGround('s3', 'o'), bank('z', 's3-out', 300)],
  sockets: [snapper('e1', 's1', 0.5), snapper('e2', 's2', 0.5), snapper('e3', 's3', 0.5)],
});
/** [W r1>] beat 6, the TWIST: the king's roar (Dot's `roar` on the rest bank before), a liana over the `double` river (deep); the flag
 *  before. The drum's doubling is NOT laid (G1, ENG-29-e) */
const twist: Lay = { pieces: [bank('a', null, 420), rock('ra', 'a', 0.5), bank('b', 'a', 400), liana('l', 'b'), river('c', 'l', 'double29', 340), bank('z', 'c', 300), rock('rc', 'z', 0.5)], sockets: [flag('a'), tip('t-roar', 'b', 0.2, 'roar')] };
/** [U c^<] beat 7, up the terrace: the court wheel (N4, a bucket every two beats), a 150 px street, a 50 px step up (BUILD-29-i: the quiet line) */
const terrace: Lay = { pieces: [bank('a', null, 300), wheel('w', 'a', 'court', 150), rise('z', 'w', 300, -50)], sockets: [] };
/** [C p1&>] beat 8, the grand dance: the wave (Easy two pairs), a court log (deep), two snappers; the flag before */
const grandDance = (easy: boolean): Lay => ({
  pieces: [bank('a', null, 420), pond('c', 'a', easy ? 'wave29e' : 'wave29', 340), ...(easy ? [pond('d', 'c', 'wave29e', 300)] : [bank('d', 'c', 300)]), river('e', 'd', 'court', 340), ...snapperGround('s1', 'e'), bank('n', 's1-out', 240), ...snapperGround('s2', 'n'), bank('o', 's2-out', 240), ...snapperGround('s3', 'o'), bank('p', 's3-out', 240), ...snapperGround('s4', 'p'), bank('z', 's4-out', 300)],
  sockets: [flag('a'), snapper('e1', 's1', 0.5), snapper('e2', 's2', 0.5), snapper('e3', 's3', 0.5), snapper('e4', 's4', 0.5)],
});
/** [P b1^<] beat 9, up to the quay: World 2's bounce to the royal quay */
const upQuay: Lay = { pieces: [bank('a', null, 360), spring('sp', 'a', 0.7), rise('z', 'a', 420, -160)], sockets: [] };
/** [S w1>] beat 10, the King's Barge: from the quay to the shrine steps (G3: its own look; the bell on the arch, not in the draft) */
// (beat 10's landing: the king's guard POSTED on the far bank (G2, the lead's rulings (1)(4)(5)), facing the barge, out of the goal; at t 0.4 (224 px in; BUILD-29-i: with TWO barges, the quiet line, t 0.5-0.8 are refused, silently, on every seed): the nearest post to the landing the engine's safe spot allows (t 0.3-0.5 refused on 14 of 24 seeds both settings, 'no clear ground', patchFor), the lead's ruling (b) as swept, BUILD-29-h)
// (the far bank 560 px, not 300: the stage's last flag (ROLLED_FLAGS.last) lands on it on 19 of 40 rolls, and the guard keeps SAFE_APPROACH +
//  24 = 224 px from a flag; at 300 px both cannot stand on it, and patchFor refuses the post by name. BUILD-29-d)
// (Dot's kick line, the guard's first meeting (hint.2-9.kick, a reminder of the spear guard, dotTips.ts REMINDS_OF): on the quay, 0.7 of
//  its 420 px (126 px from the lip, where he waits for a barge), said before he boards, 1600 px+ before the guard across the two barges' 984 px
//  river (level.md rule 6: 800 px+; w2Arc29.test counts it on every seed). BUILD-29-j)
const barge: Lay = { pieces: [bank('a', null, 420), river('c', 'a', 'barge29', 360), bank('z', 'c', 560)], sockets: [{ id: 'guard', role: 'enemy', on: 'z', t: 0.4, allow: [W2_POSTED_GUARD.id] }, { id: 't-kick', role: 'tip', on: 'a', t: 0.7, allow: [KICK_29] }] };
/** [R] a rest on the bank */
const rest: Lay = { pieces: [bank('a', null, 240), bank('b', 'a', 300), rock('rb', 'b', 0.5), bank('z', 'b', 240)], sockets: [{ id: 'find', role: 'findSpot', on: 'a', t: 0.5 }] };

/** THE ARC'S BRICKS (2-9.md), one job each */
export const BEATS_29: SectionTemplate[] = [
  brick({ id: 'gate', name: 'the water gate', jobs: ['arrive'], difficulty: 1, content: 'structural', phases: ['start'], versions: [{ id: 'gate', lay: arrival }] }),
  brick({ id: 'hear', name: 'hear the drum', jobs: ['teach'], difficulty: 1, content: 'floating', teaches: BEAT_LESSON, versions: [{ id: 'two', lay: hearDrum(false), easy: hearDrum(true) }] }),
  brick({ id: 'logs', name: 'logs on the beat', jobs: ['practise'], difficulty: 2, content: 'water', uses: [BEAT_LESSON], versions: [{ id: 'court', lay: logsOnBeat }] }),
  brick({ id: 'pads', name: 'pads on the beat', jobs: ['practise'], difficulty: 2, content: 'floating', uses: [BEAT_LESSON], versions: [{ id: 'five', lay: padsOnBeat }] }),
  brick({ id: 'let-go', name: 'let go on ONE', jobs: ['test'], difficulty: 3, content: 'rope', uses: [BEAT_LESSON], versions: [{ id: 'one', lay: letGoOnOne }] }),
  brick({ id: 'snappers', name: 'the snappers', jobs: ['practise'], difficulty: 3, content: 'ground', uses: [BEAT_LESSON], versions: [{ id: 'two', lay: snappers(false), easy: snappers(true) }] }),
  brick({ id: 'double', name: 'double time', jobs: ['twist'], difficulty: 5, content: 'rope', uses: [BEAT_LESSON], versions: [{ id: 'double', lay: twist }] }),
  brick({ id: 'terrace', name: 'up the terrace', jobs: ['climb'], difficulty: 3, content: 'climb', uses: [BEAT_LESSON], versions: [{ id: 'wheel', lay: terrace }] }),
  brick({ id: 'dance', name: 'the grand dance', jobs: ['combine'], difficulty: 6, content: 'floating', uses: [BEAT_LESSON], versions: [{ id: 'wave', lay: grandDance(false), easy: grandDance(true) }] }),
  brick({ id: 'quay', name: 'up to the quay', jobs: ['practise'], difficulty: 2, content: 'bounce', versions: [{ id: 'bounce', lay: upQuay }] }),
  brick({ id: 'barge', name: "the King's Barge", jobs: ['signature'], difficulty: 2, content: 'water', versions: [{ id: 'barge', lay: barge }] }),
  brick({ id: 'rest', name: 'a rest on the bank', jobs: ['rest'], difficulty: 1, content: 'structural', phases: ['rest'], maxPerStage: 6, versions: [{ id: 'bank', lay: rest }] }),
];

/** [E] the shrine */
export const EXIT_29: SectionTemplate = {
  id: 'w2-29-shrine', name: 'the shrine', feel: [STAGE_29], own: true, archetypes: 'any', phases: ['goal'], difficulty: 1, needs: ['walk'], jobs: ['exit'], content: 'structural', terrain: 'river-bank',
  pieces: [{ key: 'in', shape: 'bank', w: [300, 300], place: { kind: 'start' }, style: 'log', main: true, landing: true }],
  subBlocks: [{ id: 'body', versions: [{ id: 'bank', pieces: [{ key: 'out', shape: 'bank', w: [560, 580], place: { kind: 'walk', after: 'in', dy: [0, 0] }, style: 'log', main: true, landing: true }], sockets: [{ id: 'exit-totem', role: 'objective', on: 'out', t: 0.85, allow: ['exit_totem'] }] }] }],
  entry: { piece: 'in', kind: 'ground' }, exit: { piece: 'out', kind: 'ground' }, exitDy: 0, sockets: [], mirrorable: false,
} as SectionTemplate;

export const SECTIONS_29: SectionTemplate[] = [...BEATS_29, EXIT_29];

/** World 2's kit with 2-9's rows over it (the draft: rolled through the test seam only) */
export function kitLib29(id: string = STAGE_29): WorldKit {
  const k = w2World(), M = k.manifest, G = M.graphs!;
  return { ...k,
    spawn: w2CastSpawn,
    manifest: { ...M,
      sections: id === STAGE_29 ? SECTIONS_29 : SECTIONS_29.map((t) => ({ ...t, feel: [id] })),
      pads: PADS_29,
      rivers: RIVERS_29,
      wheels: WHEELS_29,
      creatures: SNAPPERS_29,
      lessons: { ...M.lessons, [BEAT_LESSON]: id },
      required: {},
      tips: { ...M.tips, ...Object.fromEntries((Object.keys(LINES_29) as Array<keyof typeof LINES_29>).map((key) => [lineId29(key), LINES_29[key]])), ...(KICK_WORDS_29 ? { [KICK_29]: KICK_WORDS_29 } : {}) },
      teachTips: [...(M.teachTips ?? []), ...TEACH_29.map(lineId29)],
      graphs: { ...G, list: [...G.list.filter((g) => g.archetype !== 'gauntlet'), ...Object.entries(ARC_29).map(([id, code]) => ({ id, archetype: 'gauntlet' as const, code }))], briefs: { ...G.briefs, [id]: BRIEF_29 } },
    } } as WorldKit;
}

/** the draft's level: 2-9's own config (a gauntlet), unlocked */
export function draft29Cfg(id: string = STAGE_29): LevelConfig {
  const c = generateAllLevels().find((q) => q.id === STAGE_29 && !q.secret)!;
  return { ...c, id, unlocked: true, targetCount: GOAL_29, countSet: true };
}

/** the draft's stageTable row (World 2's finish), for listed.ts's test seam only */
export const draft29Row = (seeds: number[] = [], id: string = STAGE_29): ListedStage & { seeds: number[] } =>
  ({ kit: () => kitLib29(id), world: (s, _sq, d) => w2Finish(s as never, d) as typeof s, seeds });

/** the court's dress before the shrine (the hand-built court's look and sizes, w2Sections.ts on main 49fdc8cb6: three lily carpets
 *  200 px at 170 apart, then the dais 250 px with the empty throne on it, 200 px; the shrine 340 px past the throne, never in front of it) */
export const COURT_29 = { carpetW: 200, carpetStep: 170, carpets: 3, daisW: 250, throneW: 200, throneToShrine: 340, edge: 20 } as const;
type Finish29 = { platforms: Platform[]; exitTotemX: number; proto?: { decor?: W2Decor[]; court29?: boolean } };
/**
 * 2-9's own finish (listed.ts FINISH 'w2-29', after World 2's): the River King's Court before the shrine, decor only (nothing he stands
 * on moves): the lily-pad carpet he walks along to the king's throne on its dais (Matt's rule: all the art is used; these three are World
 * 2's court pieces, inventory w2.json `proto.decor key throne / dais / lilyCarpet`). Laid on the shrine's own ground: the solid run at the
 * shrine's height ending at its bank, each piece whole on it (a carpet that would hang over the barge's river is not laid). Twice: no change.
 */
export function finish29<T extends Finish29>(st: T): T {
  const proto = (st.proto ??= {});
  if (proto.court29) return st;
  proto.court29 = true;
  const decor = (proto.decor ??= []);
  const solids = st.platforms.filter((p) => p.type === 'solid');
  const bank = solids.filter((p) => p.x <= st.exitTotemX && p.x + p.width >= st.exitTotemX).sort((a, b) => a.y - b.y)[0];
  if (!bank) return st;
  // (the shrine's ground: back from its bank while a solid at its height (2 px) meets the run's start)
  let x0 = bank.x;
  for (;;) {
    const prev = solids.find((p) => Math.abs(p.x + p.width - x0) <= 2 && Math.abs(p.y - bank.y) <= 2);
    if (!prev) break;
    x0 = prev.x;
  }
  const C = COURT_29, G = bank.y;
  const throneX = st.exitTotemX - C.throneToShrine;
  if (throneX - C.daisW / 2 < x0 + C.edge) return st;
  for (let i = 0; i < C.carpets; i++) {
    const cx = throneX - C.carpetStep * (C.carpets - i);
    if (cx - C.carpetW / 2 < x0 + C.edge) continue;
    decor.push({ n: 'lilyCarpet', x: cx, b: G + 16, w: C.carpetW });
  }
  decor.push({ n: 'dais', x: throneX, b: G + 14, w: C.daisW });
  decor.push({ n: 'throne', x: throneX, b: G - 30, w: C.throneW });
  return st;
}
