/**
 * gen2/worlds/w2Arc28 — 2-8 "Before the Water Rises" as designed (reference/design/2-8.md on t-design-26; READY-28 and the lead's rulings
 * L1-L4, reference/qa-reports/BUILD-28/REPORT.md; packet reference/packets/2026-11-26/BUILD-28.md). WORLD DATA: no engine line names this
 * stage; kitLib28 gives World 2's kit 2-8's rows (stageTable.ts kit 'w2-28', listed.ts KITS), and the game rolls it the way it rolls every
 * gen2 stage. It replaces the hand build (deleted in ONE commit, 69c3c1640: new replaces old).
 *
 * ONE idea (2-8.md:2): free the marsh's little ones, then beat the rising water home. Nobody is hurt (2-8.md:4): every flood water is
 * paddling depth (floodLay.ts FLOOD_PADDLE) except the low road at its close, which turns deep and only WAITS the line (a wall); "the water
 * you SEE rising, never a chase" (2-8.md:78), so the dyke's pressure is the flood's water, written P (L1).
 *
 * THE PIECES (all READY, READY-28): World 2's marsh rows with a FLOOD mark (riverLay.ts RiverRow.marsh, .flood: 'teach' rises on his own
 * start and never drains, 'rise' on the flood clock, 'close' the low road); the flood clock (flood.ts, gen2/floodLay.ts, brief.flood =
 * W2_FLOOD); the fork the water decides (w2.ts w2TwoRoad, W2_FORK, W2_FORK_RIVERS); the left leg's mirror (legs.ts reflectLeg, proven on
 * ARC_27); the line that follows him (follow.ts, W2_FOLLOW); the cages by socket (2-3's form, w2Arc23.ts cage()).
 *
 * THE ARC (READY-28 §1, 15 beats; home is LEFT: out right, /L back along the dyke):
 *   A  0 the village jetty                         Pg 1 the first cage (2 ducklings)
 *   Tw 2 TEACH: the water rises (soft, paddling)   Pp 3 the pad pond, cage 2 (2 otters)
 *   Xf 4 the reed island, cage 3 (2 capybaras)      R  5 rest
 *   Uc 6 the steps; the last cage at their foot: the turn, the flood starts
 *   /L                                              Pg 8 the dyke: three dips filling (paddling depth), ~4,000 px (L2)
 *   R  9 rest, Dot's fork line, the water in view   F 10 THE FORK THE WATER DECIDES (P+ the high road | P the low road)
 *   Pg 11 the reed bank                              R 12 rest
 *   Pf 13 the boardwalk: the one more home beat (L2, Matt 10-30 "more pieces")
 *   Sg 14 the parade, the water 10 px under the boards   E the jetty, each little one home
 * BOX 3 DRAFT NOTES (BUILD-28 box 3, unregistered: nothing imports this file yet): checkCode on the code names V11 at token 11 ('g' on two
 * neighbouring content nodes: the fork's own content is read as 'g'); 'Pp1' is content 'p' (beat), its brick content 'water' (2-2's pads);
 * the next box judges both on the first real build (rule: a check, never an estimate).
 */
import { w2World, W2_FLOOD, W2_FOLLOW, W2_FORK_RIVERS, W2_PADS, w2TwoRoad } from './w2.ts';
import type { RiverRow } from '../riverLay.ts';
import type { GraphBrief, NodeJob, SectionPiece, SectionTemplate, Socket, WorldKit } from '../types.ts';

export const STAGE_28 = '2-8';

/** 2-8's ONE graph (READY-28 §1's node string as LAID, the lead's L1 and L2: the dyke path, then one more home beat) */
/* THE LEAD'S BOX-3 RULINGS in this string: (2) the legs are parted by a DROP COLUMN at the turn, 2-7's proven `/D Dc_` (w2Arc27.ts
 * ARC_27), not taller steps (legs.ts LEG_CLEAR 260 must hold, flown on the first clean roll). BUILD-28-e: written `Df_` (its ledges are
 * planks he walks off, content floating), not `Dc_`: `Uc1^ Dc_` put 'c' on two neighbouring content nodes (checkCode V11, every roll); (3) n4 is `Pw1` (the pad pond's content is
 * water, 2-2's pads), and the dyke is `#soft@flood` (paddling depth, 2-8.md:36). */
export const ARC_28: Record<string, string> = { 'flood-28-arc': 'A Pg1 Tw1:#soft@flood Pw1 Xf1 R Uc1^ /D Df_ /L Pg1>:#soft@flood R F[P+|P] Pg1> R Pf1> R Sg1< E' };

/** the lesson 2-8 teaches: this water rises when he comes near, and it stays up */
export const FLOOD_LESSON = 'flood-rise';

/** 2-8's flood (World 2's row, its close and its flown leg RE-FLOWN at the LAID length: BUILD-28-e, reference/specs/sims/flood28.ts with
 *  PRE 11,300 px, the laid turn-to-fork road, out/flood28-laid-<setting>.txt). The design's flight (3,400 px, tail-off 22.0 / 17.9 s) was
 *  on a 2,000 px road; the laid road from the last cage to off the low road is 12,400-13,000 px (libstage 2-8, seeds 1-4), and the line's
 *  prompt tail-off over 12,700 px is 70.9 s Normal, 58.3 s Easy (its rate is not the short road's: the dips' waits are a smaller share).
 *  The close: one number on both settings (the design's form: Easy never harder), over the Normal need (tail-off + 4 s) of every rolled
 *  seed's laid px: seeds 1-40 lay 10,109-13,171 px on Normal (Easy 10,440-13,531; BUILD-28-e on 14d2fc3ca), the longest needing 73.5 + 4
 *  = 77.5 s Normal and 62.1 + 8 = 70.1 s Easy, so 80 s holds to 13,613 px. Named: on the shortest roll the spare is 23.6 s, not 4 */
export const FLOOD_28: typeof W2_FLOOD = { ...W2_FLOOD, close: { normal: 80, easy: 80 }, flown: { px: 12700, tailOff: { normal: 70.9, easy: 58.3 } } };

/** 2-8's brief, all of it data (a rescue on two legs: 11 content nodes: ground 4, water 3, floating 2, climb 2: the steps and the drop
 *  column at the turn, the lead's box-3 ruling (2); BUILD-28-e: the column is floating, `Df_`, so climb 1 and floating 3); the flood clock */
export const BRIEF_28: GraphBrief = {
  ends: 'quiet', trend: 'level', branching: 'none', teaches: [FLOOD_LESSON],
  deal: { ground: 400 / 11, water: 300 / 11, floating: 300 / 11, climb: 100 / 11 }, dealExact: true,
  tags: true, petals: 'few', flood: FLOOD_28,
};

/** the story keeper's lines for 2-8, verbatim (reference/story/lines-2-8.md, KEEPER-28, t-keeper-28@943984c2f). The only player words this
 *  file holds; w2Arc28.test.ts (step 2) holds each equal to the keeper's file */
export const LINES_28 = {
  /** Dot, TEACH, 800 px+ before beat 2's dip (on beat 1's bank, after the first cage), every help setting */
  rise: 'This water rises when we come near!',
  /** Dot, right after `rise` */
  rise2: 'It never goes down. Keep sliding through!',
  /** Dot, once, as the last cage (beat 6) opens at the steps' foot: the flood clock starts */
  turn: "The river's rising! Up the steps, back home!",
  /** Dot, once, at the rest before the fork (beat 9), the low road's water in view */
  fork: "The low road's quick, but filling. High road's dry.",
  /** Dot at the LOCKED exit, a cage still shut (said when both are true) */
  missingCage: "A little one's still caged! Back we go!",
  /** Dot at the LOCKED exit, no cage shut but a little one waits at the low road's near bank */
  missingBank: "One's waiting by the low road! Back we go!",
  /** Dot, quiet, once, as the last little one reaches its family on the jetty */
  home: "Everyone's home. Now the river can rise.",
} as const;
/** the stage card (stagePlan.ts World 2's 2-8 row): the keeper's `mission` */
export const MISSION_28 = "Free the marsh's little ones, then beat the rising water home.";
/** Dot's goal lines ({n} as 2-3's, countWord) */
export const GOAL_LINES_28 = { goalStart: 'Bring {n} little ones home to open the sanctuary', goalLate: 'Still {n} little ones out on the marsh' } as const;
/** the journal card (card name Rising Water) and Pokey's journal page */
export const FLOOD_CARD_28 = { name: 'Rising Water', text: 'Rainforest rivers rise for months. This marsh rises in seconds. Keep moving.' } as const;
export const PAGE_28 = "Walked the little ones home while the marsh filled behind us. Sloths can swim. I'd rather not prove it.";
/** a line's id in the kit: its own, `w28.<key>` */
export const lineId28 = (line: keyof typeof LINES_28): string => `w28.${line}`;
/** the lines Dot says as TEACH lines (said on Normal's default Tips as on Help, D50) */
export const TEACH_28 = ['rise', 'rise2'] as const;

/** the little ones caged on 2-8, by setting (the goal: Normal 7, Easy 5; READY-28 beat 14) */
export const CAGES_28 = { normal: 7, easy: 5 } as const;

/**
 * 2-8's own rows over World 2's: each a still MARSH (riverLay.ts RiverRow.marsh: a walkable floor 75 px under the banks, split by dips the
 * water shows in), safe (a fall splashes him back), with its flood mark. The teach rises on his own start and never drains; the dyke's,
 * the reed bank's and the parade's rise on the flood clock to paddling depth; the low road ('low', W2_FORK_RIVERS) closes.
 */
export const RIVERS_28 = {
  ...W2_FORK_RIVERS,
  teach28: { dir: 1, speed: 0, logW: 0, logs: 0, safe: true, flood: 'teach', marsh: { width: 700, floor: 75, dips: 2, dip: 100 } },
  dyke28: { dir: 1, speed: 0, logW: 0, logs: 0, safe: true, flood: 'rise', marsh: { width: 600, floor: 75, dips: 1, dip: 100 } },
  reed28: { dir: 1, speed: 0, logW: 0, logs: 0, safe: true, flood: 'rise', marsh: { width: 800, floor: 75, dips: 2, dip: 100 } },
} as const satisfies Record<string, RiverRow>;
type Row28 = keyof typeof RIVERS_28;
type Content = NonNullable<SectionTemplate['content']>;
type Pond28 = keyof typeof W2_PADS;

// ───────────────────────────── the parts ─────────────────────────────
/** World 2's bank, `w` exact, level with `after` (or the section's first); `dy` a step (negative: up) */
const bank = (key: string, after: string | null, w: number, dy = 0): SectionPiece => ({ key, shape: 'bank', w: [w, w], place: after ? { kind: 'walk', after, dy: [dy, dy] } : { kind: 'start' }, style: 'log', main: true });
/** the far bank of a marsh of 2-8's row `row` laid from `after` (place `river`, riverLay.ts layRiver) */
const marsh = (key: string, after: string, row: Row28, w: number): SectionPiece => ({ key, shape: 'bank', w: [w, w], place: { kind: 'river', after, row }, style: 'log', main: true, landing: true });
/** the far bank of a pad pond laid from `after` on World 2's row `row` (gen2 place `pads`, rideLay.ts layPads) */
const pond = (key: string, after: string, row: Pond28, w: number): SectionPiece => ({ key, shape: 'bank', w: [w, w], place: { kind: 'pads', after, row }, style: 'log', main: true, landing: true });
/** World 2's boulder to hop on the bank (a moss stone exactly 50 px tall is the kit's painted rock) */
const rock = (key: string, on: string, at: number): SectionPiece => ({ key, shape: 'block', w: [110, 120], place: { kind: 'on', on, at: [at, at], h: [50, 50] }, style: 'moss_stone', landing: true });
/** a porch plank, a hop from `after` (World 2's dock look: canopy_bridge; 2-7's porches) */
const porch = (key: string, after: string, w: number, dy: number): SectionPiece => ({ key, shape: 'branch', w: [w, w], place: { kind: 'jump', after, dy, share: [0.45, 0.6] }, style: 'canopy_bridge', landing: true });

const petal = (id: string, on: string, t: number): Socket => ({ id, role: 'pickup', on, t, dn: 34, count: 1, span: 80 });
const flag = (on: string, t = 0.3): Socket => ({ id: 'flag', role: 'flag', on, t });
const tip = (id: string, on: string, t: number, line: keyof typeof LINES_28): Socket => ({ id, role: 'tip', on, t, allow: [lineId28(line)] });
/** a reed cage on `on` at `t` with its little one (a designed goal item: every one laid where it stands; 2-3's form) */
const cage = (id: string, on: string, t: number, critter: 'duck' | 'otter' | 'capy', dn = 30): Socket => ({ id, role: 'objective', on, t, dn, allow: ['cage', critter] });

// ───────────────────────────── a brick ─────────────────────────────
interface Lay { pieces: SectionPiece[]; sockets: Socket[] }
interface V { id: string; lay: Lay; easy?: Lay }
/** one beat (2-7's form): its first piece is its entry, its last its exit (renamed `in` and `out`); an `easy` lay is its Easy version */
function brick(o: { id: string; name: string; jobs: NodeJob[]; difficulty: number; content: Content | 'structural'; window?: [number, number]; teaches?: string; uses?: string[]; versions: V[]; phases?: SectionTemplate['phases']; maxPerStage?: number; entry?: 'ground' | 'ledge'; exitDy?: number }): SectionTemplate {
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
    id: `w2-28-${o.id}`, name: o.name, feel: [STAGE_28], own: true, archetypes: 'any', phases: o.phases ?? ['ki', 'sho', 'ten', 'ketsu'], difficulty: o.difficulty, needs: ['jump'],
    ...(o.teaches ? { teaches: o.teaches } : {}), uses: o.uses ?? [], jobs: o.jobs, content: o.content, terrain: 'river-bank', maxPerStage: o.maxPerStage ?? 1, ...(o.window ? { window: o.window } : {}),
    pieces: [first], subBlocks: [{ id: 'body', versions }], entry: { piece: 'in', kind: o.entry ?? 'ground' }, exit: { piece: 'out', kind: o.entry ?? 'ground' }, exitDy: o.exitDy ?? 0, sockets: [], mirrorable: false,
  } as SectionTemplate;
}

// ───────────────────────────── the beats ─────────────────────────────
/** [A] beat 0, the village jetty: the families wait here (W2_FOLLOW); the goal line */
const jetty: Lay = {
  pieces: [bank('a', null, 440), bank('b', 'a', 420), rock('rb', 'b', 0.6), bank('z', 'b', 300)],
  sockets: [petal('pz', 'z', 0.6)],
};
/** [Pg] beat 1, the first cage (2 ducklings) on a flat bank; Dot's `rise` + `rise2` after it, 800 px+ before beat 2's first dip */
const firstCage: Lay = {
  pieces: [bank('a', null, 440), rock('ra', 'a', 0.4), bank('b', 'a', 560), bank('c', 'b', 560), rock('rc', 'c', 0.5), bank('d', 'c', 520), bank('z', 'd', 300)],
  sockets: [flag('a', 0.15), cage('cage1', 'b', 0.5, 'duck'), tip('t-rise', 'c', 0.3, 'rise'), petal('pd', 'd', 0.6)],
};
/** [Tw] beat 2, TEACH: the water rises as he comes near (soft, paddling depth, never drains); the flag before */
const teach: Lay = {
  pieces: [bank('a', null, 360), marsh('b', 'a', 'teach28', 420), bank('z', 'b', 300)],
  sockets: [flag('a', 0.2), petal('pb', 'b', 0.5)],
};
/** [Pp] beat 3, the pad pond (2-2's pads); cage 2 (2 otters) on the far bank */
const padPond: Lay = {
  pieces: [bank('a', null, 380), pond('b', 'a', 'hop', 520), rock('rc', 'c', 0.5), bank('c', 'b', 460), bank('z', 'c', 300)],
  sockets: [cage('cage2', 'b', 0.6, 'otter'), petal('pa', 'a', 0.5)],
};
/** [Xf] beat 4, the reed island: plank hops over the channel (the first water in 2-8 that costs a heart: W2_TIPS.water before it), the
 *  island a solid bank with cage 3 (2 capybaras), then planks on to the far bank. The island's painted reed art (ART-REED-28, t-art-28)
 *  dresses it when it lands; until then the soil-bank block */
const island: Lay = {
  // (the island IN the water, the lead's ruling (b) to BUILD-28-f: a porch over the channel, not a bank, so the river runs under it; the
  //  hops up to it level, so its top is the near bank's and the surface sits about 42 px under it, as cut (the row's mud foot under it);
  //  340 wide, the row's stand line (ENG-CUT: 420 drew it 1.24x). Its cut is drawn once the lay carries SectionPiece.cut (ENG-CUT-b))
  pieces: [bank('a', null, 360), porch('p1', 'a', 170, 0), porch('p2', 'p1', 170, 0), { ...porch('i', 'p2', 340, 0), main: true },
    porch('p3', 'i', 170, -20), porch('p4', 'p3', 170, 0), { ...porch('y', 'p4', 320, 0), shape: 'bank', style: 'log', main: true },
    { ...bank('z', 'y', 300), place: { kind: 'walk', after: 'y', dy: [36, 44] } }],
  sockets: [flag('a', 0.3), cage('cage3', 'i', 0.55, 'capy'), petal('pz', 'z', 0.4)],
};
/** [R] a rest on the bank: a boulder to hop, petals; the stage find is NOT here (the high road's +) */
const rest: Lay = {
  pieces: [bank('a', null, 360), rock('ra', 'a', 0.5), bank('b', 'a', 460), bank('z', 'b', 300)],
  sockets: [petal('pb', 'b', 0.5)],
};
/** [R] beat 9, the rest before the fork: Dot's `fork` line with the low road's water in view (2-8.md:49) */
const forkRest: Lay = {
  pieces: [bank('a', null, 360), rock('ra', 'a', 0.5), bank('b', 'a', 460), bank('z', 'b', 300)],
  sockets: [tip('t-fork', 'b', 0.6, 'fork'), petal('pa', 'a', 0.3)],
};
/** [Uc^] beat 6, the steps: three walks up 45 px each (the painter's band, R-165.292); the last cage (1 duckling) at their foot, the last
 *  met (the flood's start: floodLay); Dot's `turn` as it opens */
const steps: Lay = {
  pieces: [bank('a', null, 520), bank('b', 'a', 420, -45), bank('c', 'b', 420, -45), bank('d', 'c', 420, -45), bank('z', 'd', 400)],
  sockets: [cage('cage4', 'a', 0.6, 'duck'), tip('t-turn', 'a', 0.8, 'turn')],
};
/** [D f] beat 7, the drop column at the turn (the lead's box-3 ruling (2)): down two stepped ledges onto the dyke, 2-7's proven weir
 *  geometry (w2Arc27.ts weir: each step walked off straight down onto the next, no gap: a gap in a column is a fall World 2's finish
 *  reads as a river with no bank). It parts the home leg from the out leg by legs.ts LEG_CLEAR; plain ledges (no column dress yet) */
const drop: Lay = {
  pieces: [
    { key: 'a', shape: 'branch', w: [240, 260], place: { kind: 'start' } },
    // (BUILD-28-e: THREE walk-offs, not 2-7's two: seed 4 parted the legs by 198 px on two (LEG_CLEAR 260); each step 110-130 as 2-7's;
    //  the ledges 200-240 wide so the column (at most 960 px) stays inside the tower's storey (1,140: 2-7's widths threw on 2 of 40))
    { key: 'b', shape: 'branch', w: [200, 230], place: { kind: 'walk', after: 'a', dy: [110, 130] }, landing: true },
    { key: 'c', shape: 'branch', w: [200, 230], place: { kind: 'walk', after: 'b', dy: [110, 130] }, landing: true },
    { key: 'z', shape: 'branch', w: [210, 240], place: { kind: 'walk', after: 'c', dy: [110, 130] }, landing: true },
  ],
  sockets: [petal('pb', 'b', 0.5)],
};
/** [Pg>] beat 8, the dyke path (~4,000 px, L2): three dips filling ahead on the flood clock (paddling depth: never deep), a flag before */
const dyke: Lay = {
  pieces: [bank('a', null, 520), marsh('b', 'a', 'dyke28', 520), rock('rb', 'b', 0.5), bank('c', 'b', 420), marsh('d', 'c', 'dyke28', 520), bank('e', 'd', 420), marsh('f', 'e', 'dyke28', 520), bank('z', 'f', 400)],
  sockets: [flag('a', 0.2), petal('pc', 'c', 0.5), petal('pe', 'e', 0.5)],
};
/** [Pg>] beat 11, the reed bank: the water rising under it, a flag, a heart after */
const reedBank: Lay = {
  pieces: [bank('a', null, 420), marsh('b', 'a', 'reed28', 520), bank('c', 'b', 420), bank('z', 'c', 300)],
  sockets: [flag('a', 0.2), petal('pc', 'c', 0.5)],
};
/** [Pf>] beat 13, the boardwalk (the one more home beat, L2): planks over the filling marsh */
const boardwalk: Lay = {
  pieces: [bank('a', null, 360), porch('p1', 'a', 200, 0), porch('p2', 'p1', 200, -20), porch('p3', 'p2', 200, 0), porch('p4', 'p3', 200, 20), { ...porch('y', 'p4', 320, 0), shape: 'bank', style: 'log', main: true }, bank('z', 'y', 300)],
  sockets: [petal('p2', 'p2', 0.5), petal('pz', 'z', 0.4)],
};
/** [Sg<] beat 14, the parade: the village boardwalk home, the water just under the boards (the reed row rising under it) */
const parade: Lay = {
  pieces: [bank('a', null, 440), bank('b', 'a', 900), rock('rb', 'b', 0.6), marsh('c', 'b', 'reed28', 620), bank('z', 'c', 300)],
  sockets: [],
};

/** THE ARC'S BRICKS (READY-28 §1), one job each */
export const BEATS_28: SectionTemplate[] = [
  brick({ id: 'jetty', name: 'the village jetty', jobs: ['arrive'], difficulty: 1, content: 'structural', phases: ['start'], versions: [{ id: 'jetty', lay: jetty }] }),
  brick({ id: 'first-cage', name: 'the first cage', jobs: ['practise'], difficulty: 1, content: 'ground', window: [0, 0.2], versions: [{ id: 'cage', lay: firstCage }] }),
  brick({ id: 'rise', name: 'the water rises', jobs: ['teach'], difficulty: 1, content: 'water', teaches: FLOOD_LESSON, versions: [{ id: 'teach', lay: teach }] }),
  brick({ id: 'pads', name: 'the pad pond', jobs: ['practise'], difficulty: 2, content: 'water', uses: [FLOOD_LESSON], versions: [{ id: 'pond', lay: padPond }] }),
  brick({ id: 'island', name: 'the reed island', jobs: ['test'], difficulty: 4, content: 'floating', versions: [{ id: 'island', lay: island }] }),
  brick({ id: 'steps', name: 'the steps', jobs: ['climb'], difficulty: 2, content: 'climb', versions: [{ id: 'steps', lay: steps }] }),
  brick({ id: 'drop', name: 'the drop to the dyke', jobs: ['descent'], difficulty: 2, content: 'floating', entry: 'ledge', exitDy: 360, versions: [{ id: 'steps', lay: drop }] }),
  brick({ id: 'dyke', name: 'the dyke path', jobs: ['practise'], difficulty: 3, content: 'ground', uses: [FLOOD_LESSON], versions: [{ id: 'dyke', lay: dyke }] }),
  w2TwoRoad('w2-28-fork', 'fork'),
  brick({ id: 'reed-bank', name: 'the reed bank', jobs: ['practise'], difficulty: 2, content: 'ground', uses: [FLOOD_LESSON], versions: [{ id: 'reeds', lay: reedBank }] }),
  brick({ id: 'boardwalk', name: 'the boardwalk', jobs: ['practise'], difficulty: 2, content: 'floating', versions: [{ id: 'boards', lay: boardwalk }] }),
  brick({ id: 'parade', name: 'the parade home', jobs: ['signature'], difficulty: 2, content: 'ground', uses: [FLOOD_LESSON], versions: [{ id: 'parade', lay: parade }] }),
  // (the fork's own rest, BUILD-28-f: its job 'rest' fits every R, and the deal gave it n6, the OUTBOUND rest, on every roll, so Dot's fork
  //  line was said on the right leg long before the fork (ENG-TIPLEFT's finding, seed 3). No job is the fork rest's alone (every R is
  //  'rest'; Y 'story' is a LATER letter, V13), so its WINDOW is the fork rest's slot alone: n10 (slot 9) is 0.53-0.56 of the plan; the
  //  outbound rest n6 is 0.31-0.32, the home rests n13/n15 0.69-0.85. Pinned by w2Arc28.test 'the fork line is laid at the fork's rest')
  brick({ id: 'fork-rest', name: 'a rest before the fork', jobs: ['rest'], difficulty: 1, content: 'structural', window: [0.45, 0.62], phases: ['rest'], versions: [{ id: 'view', lay: forkRest }] }),
  brick({ id: 'rest', name: 'a rest on the bank', jobs: ['rest'], difficulty: 1, content: 'structural', phases: ['rest'], maxPerStage: 3, versions: [{ id: 'shore', lay: rest }] }),
];

/** [E] the jetty: the far bank and the exit totem, each little one home */
export const EXIT_28: SectionTemplate = {
  id: 'w2-28-home', name: 'the home jetty', feel: [STAGE_28], own: true, archetypes: 'any', phases: ['goal'], difficulty: 1, needs: ['walk'], jobs: ['exit'], content: 'structural', terrain: 'river-bank',
  pieces: [{ key: 'in', shape: 'bank', w: [300, 300], place: { kind: 'start' }, style: 'log', main: true, landing: true }],
  subBlocks: [{ id: 'body', versions: [{ id: 'bank', pieces: [{ key: 'out', shape: 'bank', w: [560, 580], place: { kind: 'walk', after: 'in', dy: [0, 0] }, style: 'log', main: true, landing: true }], sockets: [{ id: 'exit-totem', role: 'objective', on: 'out', t: 0.85, allow: ['exit_totem'] }] }] }],
  entry: { piece: 'in', kind: 'ground' }, exit: { piece: 'out', kind: 'ground' }, exitDy: 0, sockets: [], mirrorable: false,
} as SectionTemplate;

/** every section that is 2-8's own */
export const SECTIONS_28: SectionTemplate[] = [...BEATS_28, EXIT_28];

/**
 * World 2's kit with 2-8's rows over it (stageTable.ts kit 'w2-28', listed.ts KITS; NOT YET REGISTERED, box 3's draft): its pool is its
 * own sections alone; 2-8's marsh rows and pads; its graph and brief (the flood clock); the keeper's lines as the kit's tips.
 */
export function kitLib28(): WorldKit {
  const k = w2World(), M = k.manifest, G = M.graphs!;
  return { ...k,
    manifest: { ...M,
      sections: SECTIONS_28,
      rivers: RIVERS_28,
      pads: W2_PADS,
      creatures: [],
      lessons: { ...M.lessons, [FLOOD_LESSON]: STAGE_28 },
      required: {},
      tips: { ...M.tips, ...Object.fromEntries((Object.keys(LINES_28) as Array<keyof typeof LINES_28>).map((key) => [lineId28(key), LINES_28[key]])) },
      teachTips: [...(M.teachTips ?? []), ...TEACH_28.map(lineId28)],
      graphs: { ...G, list: [...G.list.filter((g) => g.archetype !== 'rescue'), ...Object.entries(ARC_28).map(([id, code]) => ({ id, archetype: 'rescue' as const, code }))], briefs: { ...G.briefs, [STAGE_28]: BRIEF_28 } },
    } } as WorldKit;
}
/** 2-8's finish (listed.ts FINISH 'w2-28'): the little ones follow him (proto.follow = World 2's row; 2-3's finish23 form) */
export function finish28<T extends { proto?: object }>(st: T): T {
  ((st as unknown as { proto: { follow?: typeof W2_FOLLOW } }).proto ??= {}).follow = W2_FOLLOW;
  return st;
}
