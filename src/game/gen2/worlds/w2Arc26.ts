/**
 * gen2/worlds/w2Arc26 — 2-6 "Up the Bank Houses: The Water Wheels", laid by its design (reference/design/2-6.md; BUILD-26 11-21, on ENG-26c..f's
 * readiness row). Listed: stageTable '2-6' { kit 'w2-26' }, listed.ts KITS/WORLD/FINISH. The hand-built 2-6 (w2Stages.ts, protoStage.ts
 * buildKapok's village climb) is deleted (new replaces old).
 *
 * One brick a beat, each laying what the design names for it at the design's numbers (W2_WHEELS, W2_RIVERS), up a 1700 px tower (the
 * lead's G3 ruling, TOWER_26):
 *   A    the millpond bank, a boulder                      T p1^  the teach wheel (R160 V60, Easy V50), its jetty, the street in over the top
 *   P g  the first street (a step up, a boulder, a hop)    U c1^  through a house: its inside ladder, out on the roof
 *   P w  the millrace: 2-1's ride logs, soft               X p1^  the edge wheel (R180 V70, Easy V50): the street at the sweep's edge
 *   P f  the hanging porches (four spans)                  W p1>  the twist: the 'up' wheel, the street 80 px over the top (Easy 60)
 *   C b  a wheel then World 2's bounce to the next street  S p1^< the great wheel (R200 V70), the street in over the top
 *   R    a rest street (a boulder; the find on the first)  E      the crest, the exit totem, the top house's sign
 * Its words are the story keeper's (LINES_26, empty until the lead approves them); its flags and hearts the pipeline's (ROLLED_FLAGS).
 */
import type { GraphBrief, NodeJob, SectionPiece, SectionTemplate, Socket, WorldKit } from '../types.ts';
import type { Platform, Vine } from '../../types.ts';
import type { W2Decor } from '../../riverArt.ts';
import { sweepBox, type Wheel } from '../../wheel.ts';
import { w2World, W2_RIVERS, W2_WHEELS } from './w2.ts';

export const STAGE_26 = '2-6';

/** 2-6's ONE graph: the design's node string, verbatim (2-6.md:43) */
export const ARC_26: Record<string, string> = { 'wheel-26-arc': 'A Tp1^:#soft Pg1< Uc1^ Pw1>:#soft Xp1^ R Pf1< Wp1> R Cb1^ R Sp1^< E' };

/** the lesson 2-6 teaches: ride a wheel (on, wait, off) */
export const WHEEL_LESSON = 'wheel';

/** 2-6's brief: an ascent (2-6.md "Goal ascent"), its one lesson the wheel, the deal exact (one brick a job and type) */
export const BRIEF_26: GraphBrief = {
  ends: 'quiet', trend: 'up', branching: 'none', teaches: [WHEEL_LESSON], deal: { rope: 50, ground: 10, climb: 10, water: 10, floating: 10, bounce: 10 }, dealExact: true,
  petals: 'few',
};

/** the type a wheel brick carries in the deal (no content type is a wheel: the readiness list's gap G1) */
export const WHEEL_TYPE = 'rope' as const;

/** 2-6's tower width (px; WorldManifest.tower, World 2 has none: tower.ts TOWER.width 1280) */
export const TOWER_26 = 1700;

const branch = (key: string, w: number, place: SectionPiece['place'], more: Partial<SectionPiece> = {}): SectionPiece => ({ key, shape: 'branch', w: [w, w], place, main: true, landing: true, ...more });
const petal = (id: string, on: string, t: number): Socket => ({ id, role: 'pickup', on, t, dn: 34, count: 1, span: 80 });

type Content = NonNullable<SectionTemplate['content']>;
function brick(o: { id: string; name: string; jobs: NodeJob[]; difficulty: number; content: Content; teaches?: string; uses?: string[]; pieces: SectionPiece[]; sockets?: Socket[]; exitDy: number; phases?: SectionTemplate['phases']; maxPerStage?: number }): SectionTemplate {
  const a = o.pieces[0].key, z = o.pieces[o.pieces.length - 1].key;
  return {
    id: `w2-26-${o.id}`, name: o.name, feel: [STAGE_26], own: true, archetypes: 'any', phases: o.phases ?? ['ki', 'sho', 'ten', 'ketsu'], difficulty: o.difficulty, needs: ['jump'],
    ...(o.teaches ? { teaches: o.teaches } : {}), uses: o.uses ?? [], jobs: o.jobs, content: o.content, terrain: 'river-bank', maxPerStage: o.maxPerStage ?? 1,
    pieces: o.pieces, entry: { piece: a, kind: 'ledge' }, exit: { piece: z, kind: 'ledge' }, exitDy: o.exitDy, sockets: o.sockets ?? [], mirrorable: false,
  } as SectionTemplate;
}

/** a wheel beat: a jetty (the storey he leaves), the row's wheel (place `wheel`), its street (the storey he arrives on) */
const wheelBrick = (id: string, name: string, job: NodeJob, row: keyof typeof W2_WHEELS, difficulty: number, more: Partial<Parameters<typeof brick>[0]> = {}) =>
  brick({ id, name, jobs: [job], difficulty, content: WHEEL_TYPE, uses: [WHEEL_LESSON], exitDy: -300,
    pieces: [branch('jetty', 240, { kind: 'start' }, { landing: false }), branch('street', 300, { kind: 'wheel', after: 'jetty', row })], ...more });

/**
 * the story keeper's lines for 2-6 (KEEPER-26, reference/story/lines-2-6.md), verbatim once the lead approves them; EMPTY until then (the
 * lead's GO: no placeholder ships). A tip socket is laid only for a line that is here (`tip`): a tip with no words fails the roll by name
 * (pipeline rollErrors), so until the words come the stage has no Dot line, and the rule-6 distances are held by the bricks' own lengths
 */
export const LINES_26: Partial<Record<'wheel' | 'top' | 'great', string>> = {};
/** a line's id in the kit: its own, `w26.<key>` */
export const lineId26 = (line: keyof typeof LINES_26): string => `w26.${line}`;
/** the lines Dot says as TEACH lines (said on Normal's default Tips as on Help, D50): the wheel, before beat 1; the jump off the top, before beat 8 */
export const TEACH_26 = ['wheel', 'top'] as const;
const tip = (id: string, on: string, t: number, line: keyof typeof LINES_26): Socket[] => (LINES_26[line] ? [{ id, role: 'tip', on, t, allow: [lineId26(line)] }] : []);

/** World 2's boulder to hop on a street (w2.ts rock: a moss stone exactly 50 px tall is the kit's painted rock) */
const rock = (key: string, on: string, at: number): SectionPiece => ({ key, shape: 'block', w: [110, 120], place: { kind: 'on', on, at: [at, at], h: [50, 50] }, style: 'moss_stone', landing: true });

/**
 * THE ARC'S BRICKS (2-6.md "The arc"), one a beat. Each lays the design's own content at its numbers: the wheels by World 2's rows
 * (W2_WHEELS, flown), the millrace by 2-1's ride row, the streets of bank houses between (their doors, windows and washing are 2-6's
 * finish, finish26). A brick's length is its beat's (2-6.md seconds), never filler: the 2-minute rule is the castBots expert's MIN.
 */
export const BEATS_26: SectionTemplate[] = [
  // [A] beat 0: the millpond's bank at the foot of the village, a boulder to hop; the first wheel turning ahead. Long enough that Dot's
  // wheel line (t 0.1) stands 800+ px before beat 1's jetty (rule 6)
  brick({ id: 'millpond', name: 'the millpond bank', jobs: ['arrive'], difficulty: 1, content: 'structural' as Content, phases: ['start'], exitDy: 0,
    pieces: [{ key: 'bank', shape: 'bank', w: [560, 560], place: { kind: 'start' }, style: 'log', main: true, landing: true }, rock('r', 'bank', 0.62),
      { key: 'shore', shape: 'bank', w: [380, 380], place: { kind: 'walk', after: 'bank', dy: [0, 0] }, style: 'log', main: true, landing: true }],
    sockets: [...tip('t-wheel', 'bank', 0.1, 'wheel'), petal('p', 'shore', 0.4)] }),
  // [T p1^ soft] beat 1: the teach wheel (R160 V60, Easy V50), boarded off its jetty, the street in over the top, its own soft pond
  wheelBrick('first-wheel', 'the first wheel, safe', 'teach', 'teach', 2, { teaches: WHEEL_LESSON, uses: [] }),
  // [P g1<] beat 2: the first street: a porch step up, a hop over the washing-line gap, the next doorstep
  brick({ id: 'first-street', name: 'the first street', jobs: ['practise'], difficulty: 1, content: 'ground', exitDy: 0,
    pieces: [branch('a', 300, { kind: 'start' }), branch('b', 300, { kind: 'walk', after: 'a', dy: [-50, -40] }), rock('r', 'b', 0.55),
      branch('c', 260, { kind: 'jump', after: 'b', dy: [0, 0], share: [0.4, 0.5] })],
    sockets: [petal('p', 'b', 0.3), petal('q', 'c', 0.6)] }),
  // [U c1^] beat 3: in at a house's round door, up its inside ladder, out on the roof
  brick({ id: 'through-house', name: 'through a house', jobs: ['climb'], difficulty: 2, content: 'climb', exitDy: -265,
    pieces: [branch('foot', 300, { kind: 'start' }, { landing: false }), { key: 'ladder', shape: 'vine', w: 0, place: { kind: 'climb', on: 'foot', at: [0.75, 0.85], h: [250, 280] } },
      branch('roof', 320, { kind: 'over', on: 'ladder', at: 0, dy: 0 })],
    sockets: [petal('p', 'roof', 0.6)] }),
  // [P w1> soft] beat 4: the millrace that feeds the next wheel, 2-1's ride logs (splash back); its near bank wide enough for the flag
  // the live rule lays before beat 5 (the lead's G4: >= 260 px BUILT)
  brick({ id: 'millrace', name: 'the millrace', jobs: ['practise'], difficulty: 3, content: 'water', exitDy: 0,
    pieces: [branch('near', 300, { kind: 'start' }, { landing: false }), branch('far', 240, { kind: 'river', after: 'near', row: 'ride' })] }),
  // [X p1^] beat 5: the edge wheel (R180 V70, Easy V50): the street at the sweep's edge, a step off as the bucket comes level
  wheelBrick('edge-wheel', 'off at the edge', 'test', 'edge', 4),
  // [P f1<] beat 7: the hanging porches between the houses, a breath, petals on the spans
  brick({ id: 'porches', name: 'the hanging porches', jobs: ['practise'], difficulty: 1, content: 'floating', exitDy: 0,
    pieces: [branch('a', 240, { kind: 'start' }, { landing: false }), branch('b', 200, { kind: 'jump', after: 'a', dy: 0, share: [0.4, 0.55] }), branch('c', 200, { kind: 'jump', after: 'b', dy: 0, share: [0.4, 0.55] }),
      branch('d', 240, { kind: 'jump', after: 'c', dy: 0, share: [0.4, 0.55] })],
    sockets: [petal('p', 'b', 0.5), petal('q', 'c', 0.5)] }),
  // [W p1>] beat 8, the twist: the next street 80 px ABOVE the top bucket (Easy 60): only a jump off the top reaches it
  wheelBrick('top-wheel', 'twist: jump off the top', 'twist', 'top', 5, { sockets: tip('t-top', 'jetty', 0.2, 'top') }),
  // [C b1^] beat 10: off a wheel's street onto World 2's bounce, up to the highest street
  brick({ id: 'wheel-bounce', name: 'wheel to bounce', jobs: ['combine'], difficulty: 5, content: 'bounce', uses: [WHEEL_LESSON], exitDy: -300,
    pieces: [branch('jetty', 160, { kind: 'start' }, { landing: false }), branch('street', 240, { kind: 'wheel', after: 'jetty', row: 'edge' }),
      { key: 'spring', shape: 'bouncy', w: [70, 70], place: { kind: 'on', on: 'street', at: [0.7, 0.7], h: [30, 30] } },
      branch('high', 240, { kind: 'walk', after: 'street', dy: [-180, -174] }, { block: 'bounce', from: 'spring' })],
    sockets: [petal('p', 'high', 0.6)] }),
  // [S p1^<] beat 12, the signature: the great wheel (R200 V70) lifts him the last bank
  wheelBrick('great-wheel', 'the great wheel', 'signature', 'great', 3, { sockets: tip('t-great', 'jetty', 0.2, 'great') }),
  // [R] a rest street between beats: a doorstep, a boulder to hop, the next door. The stage's find stands on the first rest met
  brick({ id: 'rest', name: 'a rest street', jobs: ['rest'], difficulty: 1, content: 'structural' as Content, phases: ['rest'], maxPerStage: 6, exitDy: 0,
    pieces: [branch('a', 260, { kind: 'start' }), rock('r', 'b', 0.5), branch('b', 220, { kind: 'walk', after: 'a', dy: [0, 0] })],
    // (the boulder listed BEFORE the street it stands on: a brick's exit is its last piece, and a boulder as the exit hangs the next
    //  section off its top, BUILD-25d)
    sockets: [{ id: 'find', role: 'findSpot', on: 'a', t: 0.5 }] }),
];

/** [E] the crest of the bank: the exit totem */
export const EXIT_26: SectionTemplate = {
  id: 'w2-26-crest', name: 'the crest', feel: [STAGE_26], own: true, archetypes: 'any', phases: ['goal'], difficulty: 1, needs: ['walk'], jobs: ['exit'], content: 'structural', terrain: 'river-bank',
  pieces: [{ key: 'in', shape: 'branch', w: [420, 440], place: { kind: 'start' }, main: true, landing: true }],
  entry: { piece: 'in', kind: 'ledge' }, exit: { piece: 'in', kind: 'ledge' }, exitDy: 0,
  sockets: [{ id: 'exit-totem', role: 'objective', on: 'in', t: 0.8, allow: ['exit_totem'] }], mirrorable: false,
} as SectionTemplate;

export const SECTIONS_26: SectionTemplate[] = [...BEATS_26, EXIT_26];

/** World 2's kit with 2-6's rows over it (stageTable.ts kit 'w2-26', listed.ts KITS): its pool 2-6's own sections alone, the keeper's lines as its tips, World 2's wheels and rivers, its graph and brief */
export function kitLib26(): WorldKit {
  const k = w2World(), M = k.manifest, G = M.graphs!;
  return { ...k,
    manifest: { ...M,
      sections: SECTIONS_26,
      // (2-6's storeys: wide enough for beat 4's millrace (2-1's ride row, 798 px of water) with a bank a flag stands on: the lead's G3/G4
      //  rulings 11-21 (BUILD-26 STEP 0): the 1700 px tower, the live flag rule, the near bank >= 260 px built)
      tower: { width: TOWER_26 },
      wheels: W2_WHEELS,
      rivers: { ...W2_RIVERS },
      lessons: { ...M.lessons, [WHEEL_LESSON]: STAGE_26 },
      tips: { ...M.tips, ...Object.fromEntries(Object.entries(LINES_26).map(([key, text]) => [lineId26(key as keyof typeof LINES_26), text])) },
      teachTips: [...(M.teachTips ?? []), ...TEACH_26.filter((l) => LINES_26[l]).map(lineId26)],
      required: {},
      graphs: { ...G, list: [...G.list.filter((g) => g.archetype !== 'ascent'), ...Object.entries(ARC_26).map(([id, code]) => ({ id, archetype: 'ascent' as const, code }))], briefs: { ...G.briefs, [STAGE_26]: BRIEF_26 } },
    } } as WorldKit;
}

/**
 * the top house's sign at the crest (the story clue's promise, stageClue '2-6': the lead's ruling 11-21, KEEPER-26 rewords the clue to name a
 * World 2 sign): its words the keeper's, verbatim, once approved; null until then (no placeholder ships, so no sign stands)
 */
export const SIGN_26: readonly string[] | null = null;

type Finish26 = {
  platforms: Platform[]; vines: Vine[]; exitTotemX: number;
  proto?: { decor?: W2Decor[]; ladders?: boolean; bankWall?: { x0: number; x1: number; top: number; bottom: number } };
};
/** a street the village dresses: a solid, main, standing piece (never a bucket, a log, a spring) at least this wide */
const DRESS_MIN = 220;
/**
 * 2-6's own finish (listed.ts FINISH 'w2-26', after World 2's): the village the wheels climb, decor only (nothing he stands on moves).
 * The hand build's look, kept (w2Stages.test.ts's 2-6 test, re-pointed to w2Arc26.test.ts): the bank's earth face behind the whole climb
 * (proto.bankWall, protoArt drawEarthWall), the house's inside climbs drawn as the village's ladders (proto.ladders, riverArt drawLadder),
 * on the streets a round door with its lantern, a lit window or washing in turn (clear of the ladders and of every wheel's sweep: the
 * buckets are drawn behind the streets and must be seen whole), and at the crest the rooftop, the bell and Gruntlewick with his scroll.
 */
export function finish26<T extends Finish26>(st: T): T {
  const proto = (st.proto ??= {});
  const decor = (proto.decor ??= []);
  if (proto.ladders) return st;
  proto.ladders = true;
  const solids = st.platforms.filter((p) => p.type === 'solid' && !p.wheel);
  const top = Math.min(...solids.map((p) => p.y)), bottom = Math.max(...solids.map((p) => p.y));
  proto.bankWall = { x0: Math.min(...solids.map((p) => p.x)) - 200, x1: Math.max(...solids.map((p) => p.x + p.width)) + 200, top: top + 40, bottom: bottom + 10 };
  const sweeps = [...new Set(st.platforms.flatMap((p) => (p.wheel ? [p.wheel.w as Wheel] : [])))].map(sweepBox);
  const crest = solids.filter((p) => p.x <= st.exitTotemX && p.x + p.width >= st.exitTotemX).sort((a, b) => a.y - b.y)[0];
  const clear = (p: Platform, x: number, half: number) =>
    st.vines.every((v) => v.vineType !== 'tree_climb' || v.topY > p.y + 10 || v.bottomY < p.y - 10 || Math.abs(v.x - x) > half + 40) &&
    sweeps.every((b) => x + half < b.x0 || x - half > b.x1 || p.y - 120 > b.y1 || p.y < b.y0);
  let k = 0;
  for (const p of [...solids].sort((a, b) => b.y - a.y || a.x - b.x)) {
    if (p === crest || p.width < DRESS_MIN || p.y === bottom) continue;
    const kind = k % 3;
    const half = kind === 0 ? 70 : kind === 1 ? 36 : 85;
    const at = [0.5, 0.33, 0.67].map((u) => p.x + p.width * u).find((x) => clear(p, x, half));
    if (at === undefined) continue;
    k++;
    if (kind === 0) {
      decor.push({ n: 'doorRoof', x: at, b: p.y + 6, w: 150, flip: k % 2 === 0 });
      decor.push({ n: 'lantern', x: at + (k % 2 === 0 ? -92 : 92), b: p.y - 62, w: 26 });
    } else if (kind === 1) decor.push({ n: 'window', x: at, b: p.y - 16, w: 62 });
    else decor.push({ n: 'laundry', x: at, b: p.y + 4, w: 160 });
  }
  if (crest) {
    const toward = st.exitTotemX > crest.x + crest.width / 2 ? -1 : 1;
    const far = toward > 0 ? crest.x + crest.width - 60 : crest.x + 60;
    decor.push({ n: 'rooftop', x: st.exitTotemX + toward * 170, b: crest.y + 4, w: 170 });
    decor.push({ n: 'bell', x: st.exitTotemX - toward * 120, b: crest.y + 4, w: 96 });
    if (SIGN_26) decor.push({ n: 'sign', x: st.exitTotemX + toward * 290, b: crest.y + 4, w: 132, text: [...SIGN_26] });
    decor.push({ cel: 'tc.hat_shout', x: far, b: crest.y + 2, k: 0.42, ...(toward > 0 ? { flip: true } : {}) });
  }
  return st;
}
