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
 *   Pf1> five small weight pads at the run pitch, splash-back                  Uc^<  the wheel up the terrace, one bucket a bar
 *   Cp1&> the wave of five (Easy two pairs), a court log, two snappers         Pb1^< World 2's bounce up the quay
 *   Sw1> the King's Barge from the quay to the shrine steps                     E     the shrine
 * NOT IN THE DRAFT (each named in reference/qa-reports/BUILD-29/REPORT.md, built by the pieces lane ENG-29-e, never here): the drum
 * doubling in the twist (G1), the posted royal guard on the landing (G2), the barge's own look (G3, it rides as a long log), the court
 * bell on the steps' arch. The liana beats are written `r` (2-4's letter): the design's `s` is unlaid (G5, the lead's call).
 */
import { W2_RIVERS, W2_WHEELS, w2World } from './w2.ts';
import { w2CastSpawn, w2Snappers } from './w2Cast.ts';
import { generateAllLevels } from '../../worldsData.ts';
import type { TempoSpec } from '../../tempo.ts';
import type { PadRow } from '../rideLay.ts';
import type { RiverRow } from '../riverLay.ts';
import type { WheelRow } from '../wheelLay.ts';
import type { ListedStage } from '../listed.ts';
import type { CreatureDef, GraphBrief, NodeJob, SectionPiece, SectionTemplate, Socket, WorldKit } from '../types.ts';
import type { LevelConfig } from '../../types.ts';
import { w2Finish } from './w2.ts';

export const STAGE_29 = '2-9';

/** 2-9's ONE graph: the design's node string (2-9.md:50) with the two liana beats on `r` (G5) */
export const ARC_29: Record<string, string> = { 'court-29-arc': 'A Tp1<:#soft Pw1> Pf1> Xr1>:#water R Pp1&>:&snapper*2 Wr1>:#water R Uc^< Cp1&>:#water:&snapper*2 R Pb1^< Sw1> E' };

/** the lesson 2-9 teaches: the beat (hop, ride, swing and bop on the drum) */
export const BEAT_LESSON = 'beat';

/** the court's tempo (2-9.md:6-7): one liana swing (TIMED.period 2.85 s Normal, 3.3 s Easy) is a bar of four; every liana on the lock */
export const TEMPO_29: TempoSpec = { beats: 4, bar: 2.85, easyStretch: 3.3 / 2.85, lock: 0.92 };
/** one count of the court's jaws on Normal (s): a beat, 0.7125 s */
const COUNT = TEMPO_29.bar / TEMPO_29.beats;

/** 2-9's brief: a gauntlet (stagePlan.ts's 2-9 row), level, its one lesson the beat, the court's tempo, the snappers its cast */
export const BRIEF_29: GraphBrief = {
  ends: 'quiet', trend: 'level', branching: 'none', teaches: [BEAT_LESSON], deal: { floating: 40, water: 30, rope: 20, climb: 5, bounce: 5 },
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
/** the court's goal (2-9.md:30, the design's proposal: chase off 5; the gauntlet's top-up lays the goal + 2 = 7; Easy easyMode's own) */
export const GOAL_29 = 5;
export const MISSION_29 = "Dance to the king's drum, chase off his snappers, reach the shrine.";
export const DRUM_CARD_29 = 'Crocodiles signal by slapping their heads on water. This king prefers drums.';
export const lineId29 = (line: keyof typeof LINES_29): string => `w29.${line}`;
/** the teach lines (said on the first meeting, never waiting out Dot's calm gap) */
export const TEACH_29 = ['drum'] as const;

/** the court's rows of snap stones and pads (2-9.md:10-17; stones at 30 px, 2-5's flown row; the pads at 50 px: the lead's ruling (vi)) */
const snapRow = (n: number, o: Partial<PadRow> = {}): PadRow =>
  ({ by: 'snap', pads: Array.from({ length: n }, () => 'snap'), gap: 30, snap: { count: COUNT }, clock: 'court', easyStretch: TEMPO_29.easyStretch, ...o }) as PadRow;
export const PADS_29 = {
  /** beat 1: two in step, splash-back, the bite free (the drum is the hint, not the rule) */
  teach29: snapRow(2, { safe: true, freeBite: true }),
  /** beat 5: three in step (only from ONE), splash-back */
  three29: snapRow(3, { safe: true }),
  /** beat 8: the WAVE of five (each a count later); Easy two pairs (Easy lays no wave longer than 2, rule 4) */
  wave29: snapRow(5, { snap: { count: COUNT, wave: true } }),
  wave29e: snapRow(2, { snap: { count: COUNT, wave: true }, safe: true }),
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
  barge29: { dir: 1, speed: 80, logW: 384, gap: 72, logs: 3, easy: { speed: 70, logW: 390 } },
} as const satisfies Record<string, RiverRow>;
type Row29 = keyof typeof RIVERS_29;

/** the terrace wheel, one bucket a bar (N6: a turn 17.1 s Normal, 19.8 s Easy), R160 on both settings (BUILD-29's G4 proposal: the
 *  design's Normal R180 / Easy R160 has no per-setting radius; FLY Normal's step-off before this is used) */
export const WHEELS_29 = { ...W2_WHEELS, court29: { R: 160, V: 58.79, easyV: 50.77, N: 6, street: 'in' } } as const satisfies Record<string, WheelRow>;

/** the snappers, on the court's jaws (the stones' clock: PadRow.clock 'court') */
export const SNAPPERS_29: CreatureDef[] = w2Snappers('snap-court').map((c) => ({ ...c, minGround: 100 }));

// ───────────────────────────── the pieces ─────────────────────────────
const bank = (key: string, after: string | null, w: number): SectionPiece => ({ key, shape: 'bank', w: [w, w], place: after ? { kind: 'walk', after, dy: [0, 0] } : { kind: 'start' }, style: 'log', main: true });
const rise = (key: string, after: string, w: number, dy: number): SectionPiece => ({ ...bank(key, after, w), place: { kind: 'walk', after, dy: [dy, dy] }, landing: true });
const rock = (key: string, on: string, at: number): SectionPiece => ({ key, shape: 'block', w: [110, 120], place: { kind: 'on', on, at: [at, at], h: [50, 50] }, style: 'moss_stone', landing: true });
const spring = (key: string, on: string, at: number): SectionPiece => ({ key, shape: 'bouncy', w: [70, 70], place: { kind: 'on', on, at: [at, at], h: [30, 30] } });
const pond = (key: string, after: string, row: Pond29, w: number): SectionPiece => ({ key, shape: 'bank', w: [w, w], place: { kind: 'pads', after, row }, style: 'log', main: true, landing: true });
const river = (key: string, after: string, row: Row29, w: number): SectionPiece => ({ key, shape: 'bank', w: [w, w], place: { kind: 'river', after, row }, style: 'log', main: true, landing: true });
const liana = (key: string, after: string): SectionPiece => ({ key, shape: 'liana', w: [0, 0], place: { kind: 'swing', after, top: [410, 410], reach: [165, 165], len: [410, 410] } });
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
const arrival: Lay = { pieces: [bank('a', null, 480), rock('ra', 'a', 0.6), bank('b', 'a', 400), bank('z', 'b', 300)], sockets: [tip('t-drum', 'a', 0.1, 'drum')] };
/** [T p1<] beat 1, hear the drum: two stones in step over splash-back water, the bite free */
const hearDrum: Lay = { pieces: [bank('a', null, 360), pond('c', 'a', 'teach29', 340), bank('z', 'c', 300)], sockets: [petal('pz', 'z', 0.5)] };
/** [P w1>] beat 2, logs on the beat: a splash-back court river, a log knocking out on every ONE */
const logsOnBeat: Lay = { pieces: [bank('a', null, 360), river('c', 'a', 'court29s', 340), bank('z', 'c', 300)], sockets: [] };
/** [P f1>] beat 3, pads on the beat: five small weight pads at the run pitch, splash-back */
const padsOnBeat: Lay = { pieces: [bank('a', null, 360), pond('c', 'a', 'pads29', 340), bank('z', 'c', 300)], sockets: [petal('pz', 'z', 0.5)] };
/** [X r1>] beat 4, let go on ONE: 2-4's liana over a splash-back court river, locked to the bar; the flag before */
const letGoOnOne: Lay = { pieces: [bank('a', null, 420), rock('ra', 'a', 0.5), bank('b', 'a', 400), liana('l', 'b'), river('c', 'l', 'court', 340), rock('rc', 'c', 0.15), bank('z', 'c', 300)], sockets: [flag('a')] };
/** [P p1&>] beat 5, the snappers: three in step from ONE, then two snappers on the court's jaws */
const snappers: Lay = {
  pieces: [bank('a', null, 360), pond('c', 'a', 'three29', 340), bank('m', 'c', 300), ...snapperGround('s1', 'm'), bank('n', 's1-out', 240), ...snapperGround('s2', 'n'), bank('z', 's2-out', 300)],
  sockets: [snapper('e1', 's1', 0.5), snapper('e2', 's2', 0.5)],
};
/** [W r1>] beat 6, the TWIST: the king's roar (Dot's `roar` on the rest bank before), a liana over the `double` river (deep); the flag
 *  before. The drum's doubling is NOT laid (G1, ENG-29-e) */
const twist: Lay = { pieces: [bank('a', null, 420), rock('ra', 'a', 0.5), bank('b', 'a', 400), liana('l', 'b'), river('c', 'l', 'double29', 340), rock('rc', 'c', 0.15), bank('z', 'c', 300)], sockets: [flag('a'), tip('t-roar', 'b', 0.2, 'roar')] };
/** [U c^<] beat 7, up the terrace: the court wheel, one bucket a bar, a street IN over the top */
const terrace: Lay = { pieces: [bank('a', null, 300), wheel('z', 'a', 'court29', 300)], sockets: [] };
/** [C p1&>] beat 8, the grand dance: the wave (Easy two pairs), a court log (deep), two snappers; the flag before */
const grandDance = (easy: boolean): Lay => ({
  pieces: [bank('a', null, 420), pond('c', 'a', easy ? 'wave29e' : 'wave29', 340), ...(easy ? [pond('d', 'c', 'wave29e', 300)] : [bank('d', 'c', 300)]), river('e', 'd', 'court', 340), ...snapperGround('s1', 'e'), bank('n', 's1-out', 240), ...snapperGround('s2', 'n'), bank('z', 's2-out', 300)],
  sockets: [flag('a'), snapper('e1', 's1', 0.5), snapper('e2', 's2', 0.5)],
});
/** [P b1^<] beat 9, up to the quay: World 2's bounce to the royal quay */
const upQuay: Lay = { pieces: [bank('a', null, 360), spring('sp', 'a', 0.7), rise('z', 'a', 420, -160)], sockets: [] };
/** [S w1>] beat 10, the King's Barge: from the quay to the shrine steps (G3: its own look; the bell on the arch, not in the draft) */
const barge: Lay = { pieces: [bank('a', null, 420), river('c', 'a', 'barge29', 360), bank('z', 'c', 300)], sockets: [] };
/** [R] a rest on the bank */
const rest: Lay = { pieces: [bank('a', null, 240), bank('b', 'a', 300), rock('rb', 'b', 0.5), bank('z', 'b', 240)], sockets: [{ id: 'find', role: 'findSpot', on: 'a', t: 0.5 }] };

/** THE ARC'S BRICKS (2-9.md), one job each */
export const BEATS_29: SectionTemplate[] = [
  brick({ id: 'gate', name: 'the water gate', jobs: ['arrive'], difficulty: 1, content: 'structural', phases: ['start'], versions: [{ id: 'gate', lay: arrival }] }),
  brick({ id: 'hear', name: 'hear the drum', jobs: ['teach'], difficulty: 1, content: 'floating', teaches: BEAT_LESSON, versions: [{ id: 'two', lay: hearDrum }] }),
  brick({ id: 'logs', name: 'logs on the beat', jobs: ['practise'], difficulty: 2, content: 'water', uses: [BEAT_LESSON], versions: [{ id: 'court', lay: logsOnBeat }] }),
  brick({ id: 'pads', name: 'pads on the beat', jobs: ['practise'], difficulty: 2, content: 'floating', uses: [BEAT_LESSON], versions: [{ id: 'five', lay: padsOnBeat }] }),
  brick({ id: 'let-go', name: 'let go on ONE', jobs: ['test'], difficulty: 3, content: 'rope', uses: [BEAT_LESSON], versions: [{ id: 'one', lay: letGoOnOne }] }),
  brick({ id: 'snappers', name: 'the snappers', jobs: ['practise'], difficulty: 3, content: 'floating', uses: [BEAT_LESSON], versions: [{ id: 'three', lay: snappers }] }),
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
export function kitLib29(): WorldKit {
  const k = w2World(), M = k.manifest, G = M.graphs!;
  return { ...k,
    spawn: w2CastSpawn,
    manifest: { ...M,
      sections: SECTIONS_29,
      pads: PADS_29,
      rivers: RIVERS_29,
      wheels: WHEELS_29,
      creatures: SNAPPERS_29,
      lessons: { ...M.lessons, [BEAT_LESSON]: STAGE_29 },
      required: {},
      tips: { ...M.tips, ...Object.fromEntries((Object.keys(LINES_29) as Array<keyof typeof LINES_29>).map((key) => [lineId29(key), LINES_29[key]])) },
      teachTips: [...(M.teachTips ?? []), ...TEACH_29.map(lineId29)],
      graphs: { ...G, list: [...G.list.filter((g) => g.archetype !== 'gauntlet'), ...Object.entries(ARC_29).map(([id, code]) => ({ id, archetype: 'gauntlet' as const, code }))], briefs: { ...G.briefs, [STAGE_29]: BRIEF_29 } },
    } } as WorldKit;
}

/** the draft's level: 2-9's own config (a gauntlet), unlocked */
export function draft29Cfg(): LevelConfig {
  const c = generateAllLevels().find((q) => q.id === STAGE_29 && !q.secret)!;
  return { ...c, unlocked: true, targetCount: GOAL_29 };
}

/** the draft's stageTable row (World 2's finish), for listed.ts's test seam only */
export const draft29Row = (seeds: number[] = []): ListedStage & { seeds: number[] } =>
  ({ kit: () => kitLib29(), world: (s, _sq, d) => w2Finish(s as never, d) as typeof s, seeds });
