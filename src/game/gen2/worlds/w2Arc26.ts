/**
 * gen2/worlds/w2Arc26 — 2-6 "Up the Bank Houses: The Water Wheels", the DRAFT row of the readiness check (ENG-26c; level.md rule 23,
 * D101; reference/design/2-6.md on main, its node string :43). NOT LISTED, NOT SHIPPED: no stage-table row names its kit and nothing in
 * the game imports this file. The readiness test (w2Arc26.test.ts) rolls it through gen2 the way a listed row is rolled (listed.ts
 * withTestStage, World 2's finish) and COUNTS every designed object per beat; the 2-6 builder (BUILD-26) replaces the draft bricks with
 * the level's own (pieces, art, lines, flags) and gives 2-6 its stage-table row.
 *
 * One brick a beat, each laying only what the design names for it, at the design's numbers (W2_WHEELS, W2_RIVERS):
 *   A    the millpond bank (the floor)                     T p1^  the teach wheel (R160 V60, Easy V50), its jetty, the street in over the top
 *   P g  the first street (porches, a hop)                 U c1^  through a house: its inside ladder (a vine), out on the roof
 *   P w  the millrace: 2-1's ride logs, soft               X p1^  the edge wheel (R180 V70, Easy V50): the street at the sweep's edge
 *   P f  the hanging porches (plank spans)                 W p1>  the twist: the 'up' wheel, the street 80 px over the top (Easy 60)
 *   C b  a wheel then World 2's bounce to the next street  S p1^< the great wheel (R200 V70), the street in over the top
 *   R    a rest street                                     E      the crest, the exit totem
 * Its words are none (the keeper's lines come with the build); its petals a few, its flags the pipeline's.
 */
import type { GraphBrief, NodeJob, SectionPiece, SectionTemplate, Socket, WorldKit } from '../types.ts';
import { w2World, W2_RIVERS, W2_WHEELS } from './w2.ts';

export const STAGE_26 = '2-6';

/** 2-6's ONE graph: the design's node string, verbatim (2-6.md:43) */
export const ARC_26: Record<string, string> = { 'wheel-26-arc': 'A Tp1^:#soft Pg1< Uc1^ Pw1>:#soft Xp1^ R Pf1< Wp1> R Cb1^ R Sp1^< E' };

/** the lesson 2-6 teaches: ride a wheel (on, wait, off) */
export const WHEEL_LESSON = 'wheel';

/** the draft brief: an ascent (2-6.md "Goal ascent"), its one lesson the wheel, the deal exact (one brick a job and type) */
export const BRIEF_26: GraphBrief = {
  ends: 'quiet', trend: 'up', branching: 'none', teaches: [WHEEL_LESSON], deal: { rope: 50, ground: 10, climb: 10, water: 10, floating: 10, bounce: 10 }, dealExact: true,
  petals: 'few',
};

/** the type a wheel brick carries in the deal (no content type is a wheel: the readiness list's gap G1) */
export const WHEEL_TYPE = 'rope' as const;

/** the draft tower's width (px; WorldManifest.tower, World 2 has none: tower.ts TOWER.width 1280) */
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

/** THE ARC'S BRICKS (2-6.md "The arc"), one a beat */
export const BEATS_26: SectionTemplate[] = [
  brick({ id: 'millpond', name: 'the millpond bank', jobs: ['arrive'], difficulty: 1, content: 'structural' as Content, phases: ['start'], exitDy: 0,
    pieces: [{ key: 'bank', shape: 'bank', w: [520, 520], place: { kind: 'start' }, style: 'log', main: true, landing: true }] }),
  wheelBrick('first-wheel', 'the first wheel, safe', 'teach', 'teach', 2, { teaches: WHEEL_LESSON, uses: [] }),
  brick({ id: 'first-street', name: 'the first street', jobs: ['practise'], difficulty: 1, content: 'ground', exitDy: 0,
    pieces: [branch('a', 300, { kind: 'start' }), branch('b', 280, { kind: 'walk', after: 'a', dy: [-50, -40] })], sockets: [petal('p', 'b', 0.5)] }),
  brick({ id: 'through-house', name: 'through a house', jobs: ['climb'], difficulty: 2, content: 'climb', exitDy: -265,
    pieces: [branch('foot', 280, { kind: 'start' }, { landing: false }), { key: 'ladder', shape: 'vine', w: 0, place: { kind: 'climb', on: 'foot', at: [0.75, 0.85], h: [250, 280] } },
      branch('roof', 280, { kind: 'over', on: 'ladder', at: 0, dy: 0 })] }),
  brick({ id: 'millrace', name: 'the millrace', jobs: ['practise'], difficulty: 3, content: 'water', exitDy: 0,
    pieces: [branch('near', 260, { kind: 'start' }, { landing: false }), branch('far', 200, { kind: 'river', after: 'near', row: 'ride' })] }),
  wheelBrick('edge-wheel', 'off at the edge', 'test', 'edge', 4),
  brick({ id: 'porches', name: 'the hanging porches', jobs: ['practise'], difficulty: 1, content: 'floating', exitDy: 0,
    pieces: [branch('a', 240, { kind: 'start' }, { landing: false }), branch('b', 200, { kind: 'jump', after: 'a', dy: 0, share: [0.4, 0.55] }), branch('c', 240, { kind: 'jump', after: 'b', dy: 0, share: [0.4, 0.55] })],
    sockets: [petal('p', 'b', 0.5)] }),
  wheelBrick('top-wheel', 'twist: jump off the top', 'twist', 'top', 5),
  brick({ id: 'wheel-bounce', name: 'wheel to bounce', jobs: ['combine'], difficulty: 5, content: 'bounce', uses: [WHEEL_LESSON], exitDy: -300,
    pieces: [branch('jetty', 160, { kind: 'start' }, { landing: false }), branch('street', 240, { kind: 'wheel', after: 'jetty', row: 'edge' }),
      { key: 'spring', shape: 'bouncy', w: [70, 70], place: { kind: 'on', on: 'street', at: [0.7, 0.7], h: [30, 30] } },
      branch('high', 200, { kind: 'walk', after: 'street', dy: [-180, -174] }, { block: 'bounce', from: 'spring' })] }),
  wheelBrick('great-wheel', 'the great wheel', 'signature', 'great', 3),
  brick({ id: 'rest', name: 'a rest street', jobs: ['rest'], difficulty: 1, content: 'structural' as Content, phases: ['rest'], maxPerStage: 6, exitDy: 0,
    pieces: [branch('a', 360, { kind: 'start' })] }),
];

/** [E] the crest of the bank: the exit totem */
export const EXIT_26: SectionTemplate = {
  id: 'w2-26-crest', name: 'the crest', feel: [STAGE_26], own: true, archetypes: 'any', phases: ['goal'], difficulty: 1, needs: ['walk'], jobs: ['exit'], content: 'structural', terrain: 'river-bank',
  pieces: [{ key: 'in', shape: 'branch', w: [420, 440], place: { kind: 'start' }, main: true, landing: true }],
  entry: { piece: 'in', kind: 'ledge' }, exit: { piece: 'in', kind: 'ledge' }, exitDy: 0,
  sockets: [{ id: 'exit-totem', role: 'objective', on: 'in', t: 0.8, allow: ['exit_totem'] }], mirrorable: false,
} as SectionTemplate;

export const SECTIONS_26: SectionTemplate[] = [...BEATS_26, EXIT_26];

/** World 2's kit with the draft's rows over it: its pool the draft's bricks alone, World 2's wheels and rivers, its graph and brief */
export function kitLib26(): WorldKit {
  const k = w2World(), M = k.manifest, G = M.graphs!;
  return { ...k,
    manifest: { ...M,
      sections: SECTIONS_26,
      // (the draft's storeys: wide enough for beat 4's millrace (2-1's ride row, 798 px of water) with a bank a flag stands on; the readiness
      //  list's G3/G4, the builder's call)
      tower: { width: TOWER_26 },
      wheels: W2_WHEELS,
      rivers: { ...W2_RIVERS },
      lessons: { ...M.lessons, [WHEEL_LESSON]: STAGE_26 },
      required: {},
      graphs: { ...G, list: [...G.list.filter((g) => g.archetype !== 'ascent'), ...Object.entries(ARC_26).map(([id, code]) => ({ id, archetype: 'ascent' as const, code }))], briefs: { ...G.briefs, [STAGE_26]: BRIEF_26 } },
    } } as WorldKit;
}
