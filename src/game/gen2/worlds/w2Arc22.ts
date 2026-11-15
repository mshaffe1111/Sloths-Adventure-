/**
 * gen2/worlds/w2Arc22 — 2-2 "Petals for the Crown" as designed (reference/design/2-2.md, DESIGN-19 final on t-pitch-b@b85dba7f; the lead's
 * picks PICKS-19-22.md; BUILD-22, GO 4:17 PM ET 11-15). WORLD DATA: no engine line names this stage; kitLib22 gives World 2's kit 2-2's
 * rows (stageTable.ts kit 'w2-22', listed.ts KITS), and the game rolls it the way it rolls every gen2 stage.
 *
 * ONE idea (2-2.md): "The lily pads sink while you stand and come back up when you leave: dance across the pond for the crown's petals."
 * World 1 taught him that stillness saves him; 2-2 is the first place stillness sinks him (a weight pad holds 1.0 s small, 2.0 s big, then
 * shivers and goes under: rideLay.ts PAD_SIZES), until the crown lily, the first place in the pond he may stand still.
 *
 * THE ARC (2-2.md "THE NODE STRING", one brick a beat):
 *   A  the pond garden (the keeper's `pads` 800+ px before beat 1)     W  the pond breathes: a beat row (`breathe` 800+ px before; flag)
 *   T  the first pad, safe: one big pad over shallow water            Pf the ferry's old jetty planks over the reed bed
 *   Pw keep moving: three small pads, a flower riding each            M  both kinds: weight pads (flowers on the small ones: the greed),
 *   Pg the garden path: stones and banks between pools                   the drifting log lane, a beat pair (flag before; heart after)
 *   S  the crown lily: a giant lily that never sinks, its flower      L  across the deep: deep water both kinds to the far bank (flag)
 *      opening as he stands (`lily`, `crown`)                          E  the village bank (`king` once the goal is met; Meeca's `note`)
 *   R  a rest on the bank between beats
 *   X  (beat 4, there and back): a spur pond (FIX-22): pads out to a dead-end stone and its flower, back, up the vine and over on the rope
 *
 * DESIGN CHANGES against 2-2.md (the lead's rulings, 4:17 PM ET 11-15): (C) beat 2's tiny greed pad is dropped (padFaults' 124 px floor,
 * the hand-built ponds' QA); the greed is the flowers on beat 9's small pads. (D) Easy: every pond is the splash-back kind but the finale
 * (beat 12), every count and breath x1.5 (rideLay's stretch), so Easy is never harder than Normal.
 */
import type { GraphBrief, NodeJob, SectionPiece, SectionTemplate, Socket, WorldKit } from '../types.ts';
import type { PadRow } from '../rideLay.ts';
import type { RiverRow } from '../riverLay.ts';
import { W2_PADS, W2_RIVERS, w2World } from './w2.ts';

export const STAGE_22 = '2-2';
type R2 = [number, number];

/** 2-2's ONE graph (2-2.md: `A Tw1<:#soft Pw1>:#soft R Pg1< Xw2<:#soft R Wp1>:#water R Pf1< Mp2>:#water R Sw1< Lp2>:#water E`), and a
 *  rest after the signature S (Matt's graph rule V5, nodeCode.ts: the design table's 'S L' loses to the rule, level.md rule 3) */
export const ARC_22: Record<string, string> = { 'pond-22-arc': 'A Tw Pw R Pg Xw R Wf R Pg Mf R S R L E' };

/** the lesson 2-2 teaches (World 2's manifest: the pond's sinking pads) */
export const PADS_LESSON = 'pads';

/** 2-2's brief, all of it data (a harvest: the crown's flowers; 2-2.md "Goal") */
export const BRIEF_22: GraphBrief = {
  ends: 'finale', trend: 'level', branching: 'none', teaches: [PADS_LESSON], deal: { water: 43, ground: 28.5, floating: 28.5 }, dealExact: true, tags: true,
};

/** the story keeper's lines for 2-2, verbatim (reference/story/lines-2-2.md on t-story@50da9e58, approved about 8:25 PM ET 11-14). The
 *  only player words this file holds; w2Arc22.test.ts holds each equal to the keeper's file */
export const LINES_22 = {
  /** Dot, teach, 800+ px before beat 1 */
  pads: 'Pads sink if you stand. Then they come back!',
  /** Dot, once, at beat 4's stone (there and back) */
  stone: 'Sit tight! The pads come back up.',
  /** Dot, teach, 800+ px before beat 6 (the twist) */
  breathe: 'These breathe on their own. Cross on the up!',
  /** Pokey, as the crown lily holds him (beat 11) */
  lily: 'Finally. Somewhere I can stand still.',
  /** Dot, right after `lily`, at the lily's flowers */
  crown: 'Crown petals! The king only wants the best.',
  /** Dot, at the exit, once the goal is met */
  king: 'Enough for a crown! The king will be thrilled.',
  /** Dot, at Meeca's note in plain sight (finds.ts w2_note) */
  note: 'Her writing! A note, just for you.',
} as const;
/** a line's id in the kit: its own, `w22.<key>` */
export const lineId22 = (line: keyof typeof LINES_22): string => `w22.${line}`;
/** the lines Dot says as TEACH lines (said on Normal's default Tips as on Help, D50) */
export const TEACH_22 = ['pads', 'breathe'] as const;

/**
 * 2-2's ponds (gen2/rideLay.ts PadRow), over World 2's table (w2.ts W2_PADS): Normal's by the beat, and each beat's EASY row, the
 * splash-back kind (the finale's stays deep: the lead's ruling D). Every count is the size's (PAD_SIZES: small 1.0 s, big 2.0 s), x1.5 on
 * Easy; every row lays fault-free (w2Arc22.test.ts).
 */
export const PADS_22 = {
  ...W2_PADS,
  /** beat 1: one big pad over shallow water at the bank: he stands, it shivers and sinks, he splashes back and watches it come up */
  first22: { ...W2_PADS.first },
  /** beat 2: three small pads one tap apart, a flower riding each: keep moving (`Pw1>:#soft`, both settings) */
  hop22: { ...W2_PADS.hop },
  /** beat 4 (X), there and back: a SPUR (FIX-22; rideLay PadRow.spur): two small pads out to a dead-end stone against the far bank's foot,
   *  its flower on the stone; the way on is from the near bank (the vine up, the rope over). 50 px apart (at 70, 470 px of run, a child stood
   *  8 s and more at the bank for a breath long enough: the spur toy, FIX-22). A BEAT row on the breath's numbers (the lead's
   *  ruling 5:29 PM ET 11-15, a design change: on weight pads a hopper never sinks them, so the stone asked no wait): he waits on the stone
   *  for the row to come up, seen safely from a floor that stays, before W asks him to cross on the breath. Splash-back (2-2.md `#soft`) */
  spur22: { by: 'beat', pads: ['small', 'small', 'stone'], gap: 50, beat: { up: 1.8, shiver: 0.6, under: 0.6 }, safe: true, petals: [2], spur: true },
  /** beat 6, the twist: the pond breathes, two pads at a time (up 1.8 s, shiver 0.6 s, under 0.6 s; the breath toy's own run, padRide.test.ts),
   *  laid twice with a bank between: one row, so one clock, so both runs breathe in step. The bank is the design's rest between the runs, wide
   *  enough to stop on and read the next breath (a 136 px stone was run across by the old first-timer bots, onto a pad late in its breath:
   *  castBots 2-2, kid and adult, BUILD-22) */
  breath22: { by: 'beat', pads: ['small', 'small'], gap: 70, beat: { up: 1.8, shiver: 0.6, under: 0.6 } },
  breath22Easy: { by: 'beat', pads: ['small', 'small'], gap: 70, beat: { up: 1.8, shiver: 0.6, under: 0.6 }, safe: true },
  /** beat 9: weight pads, a held jump between the sizes, the flowers on the SMALL ones (the greed: the quickest pads) */
  mixWeight22: { by: 'weight', pads: ['small', 'big', 'small'], gap: [80, 110, 110, 80], petals: [0, 2] },
  mixWeight22Easy: { by: 'weight', pads: ['small', 'big', 'small'], gap: [80, 110, 110, 80], petals: [0, 2], safe: true },
  /** beat 9: a beat pair after the log lane */
  mixBeat22: { by: 'beat', pads: ['small', 'small'], gap: 70, beat: { up: 1.8, shiver: 0.6, under: 0.6 } },
  mixBeat22Easy: { by: 'beat', pads: ['small', 'small'], gap: 70, beat: { up: 1.8, shiver: 0.6, under: 0.6 }, safe: true },
  /** beat 11, the signature: the crown lily between two small pads, the white crown flowers on it */
  crown22: { by: 'weight', pads: ['small', 'crown', 'small'], gap: 70, safe: true, petals: [1] },
  /** beat 12, the finale: deep water, both kinds, held jumps between the sizes; deep on Easy too (its counts x1.5) */
  deep22: { ...W2_PADS.deep },
  deepBeat22: { by: 'beat', pads: ['small', 'small'], gap: 80, beat: { up: 2.0, shiver: 0.6, under: 0.6 } },
} as const satisfies Record<string, PadRow>;
type Pond22 = keyof typeof PADS_22;

/** 2-2's river (beat 9's drifting log lane, 2-1's river), Normal's and Easy's */
export const RIVERS_22 = {
  ...W2_RIVERS,
  /** a pond garden's lane: 2-1's deep river with its logs 200 px long (a slow drift through still water; at 160 the kid first-timer lost
   *  five lives a run on it, castBots 2-2 seed 3, BUILD-22); Easy's longer still, and the splash-back kind */
  lane22: { ...W2_RIVERS.deep, logW: 200 },
  lane22Easy: { ...W2_RIVERS.deep, logW: 220, safe: true },
} as const satisfies Record<string, RiverRow>;
type Row22 = keyof typeof RIVERS_22;

// ───────────────────────────── the pieces (World 2's: its earth bank, its boulder, its ponds) ─────────────────────────────
/** a bank he walks on, `w` exact, level with the one before (or the section's first) */
const bank = (key: string, after: string | null, w: number): SectionPiece => ({ key, shape: 'bank', w: [w, w], place: after ? { kind: 'walk', after, dy: [0, 0] } : { kind: 'start' }, style: 'log', main: true });
const UP: R2 = [-56, -50], DOWN: R2 = [50, 56];
/** a bank a step up or down the shore */
const shore = (key: string, after: string, w: number, dy: R2): SectionPiece => ({ ...bank(key, after, w), place: { kind: 'walk', after, dy } });
/** the far bank of a pond laid from 2-2's row `row`, level with `after` (gen2 place `pads`, rideLay.ts layPads) */
const pond = (key: string, after: string, row: Pond22, w: number): SectionPiece => ({ key, shape: 'bank', w: [w, w], place: { kind: 'pads', after, row }, style: 'log', main: true, landing: true });
/** the far bank of a river laid from 2-2's row `row` (gen2 place `river`, riverLay.ts) */
const river = (key: string, after: string, row: Row22, w: number): SectionPiece => ({ key, shape: 'bank', w: [w, w], place: { kind: 'river', after, row }, style: 'log', main: true, landing: true });
/** World 2's boulder to hop on the bank (w2.ts rock: a moss stone exactly 50 px tall is the kit's painted rock) */
const rock = (key: string, on: string, at: number): SectionPiece => ({ key, shape: 'block', w: [110, 120], place: { kind: 'on', on, at: [at, at], h: [50, 50] }, style: 'moss_stone', landing: true });
/** the old ferry path's next bank past a gap in it: a plain hop over the reed bed, a splash back if he falls (World 2's creek, w2.ts). The
 *  design's jetty planks (canopy_bridge) draw as the code-drawn bridge in World 2 (terrain.ts drawBridge: no painted World 2 plank piece),
 *  which World 2's look check refuses (w2.test.ts 'the look'), so the path is World 2's painted bank until a plank piece is painted */
const gapBank = (key: string, after: string, w: number): SectionPiece => ({ key, shape: 'bank', w: [w, w], place: { kind: 'jump', after, dy: [0, 0], share: [0.45, 0.5], soft: true }, style: 'log', main: true, landing: true });

/** the crown's flowers on a bank: `n` in a row along it */
const flowers = (id: string, on: string, t: number | R2, n = 1, span = 120): Socket => ({ id, role: 'pickup', on, t, dn: 34, count: n, span });
const flag = (on: string, t = 0.3): Socket => ({ id: 'flag', role: 'flag', on, t });
const tip = (id: string, on: string, t: number, line: keyof typeof LINES_22): Socket => ({ id, role: 'tip', on, t, allow: [lineId22(line)] });

// ───────────────────────────── a brick ─────────────────────────────
type Lay = { pieces: SectionPiece[]; sockets: Socket[] };
type V = { id: string; lay: Lay; easy?: Lay };
type Content = 'ground' | 'water' | 'floating';
/** a brick (2-1's form, w2Arc21.ts): its first piece `in`, its last `out`, a version's Easy twin beside it, served to 2-2 alone, once */
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
    id: `w2-22-${o.id}`, name: o.name, feel: [STAGE_22], own: true, archetypes: 'any', phases: o.phases ?? ['ki', 'sho', 'ten', 'ketsu'], difficulty: o.difficulty, needs: ['jump'],
    ...(o.teaches ? { teaches: o.teaches } : {}), uses: o.uses ?? [], jobs: o.jobs, content: o.content, terrain: 'river-bank', maxPerStage: o.maxPerStage ?? 1,
    pieces: [first], subBlocks: [{ id: 'body', versions }], entry: { piece: 'in', kind: 'ground' }, exit: { piece: 'out', kind: 'ground' }, exitDy: 0, sockets: [], mirrorable: false,
  } as SectionTemplate;
}

// ───────────────────────────── the beats ─────────────────────────────
/** [A] beat 0, the pond garden: a wide bank down to the water, a boulder, flowers along it */
const arrival: Lay = {
  pieces: [bank('a', null, 420), shore('b', 'a', 360, DOWN), rock('rb', 'b', 0.5), bank('z', 'b', 360)],
  sockets: [flowers('pa', 'a', 0.6, 2), flowers('pz', 'z', 0.5, 2)],
};
/** [T] beat 1, the first pad, safe: a long bank to read Dot's `pads` on (800+ px before the pad), one big pad over shallow water */
const firstPad: Lay = {
  pieces: [bank('a', null, 480), rock('ra', 'a', 0.6), bank('b', 'a', 400), pond('c', 'b', 'first22', 360), bank('z', 'c', 300)],
  sockets: [tip('t-pads', 'a', 0.1, 'pads'), flowers('pc', 'c', 0.5, 2)],
};
/** [Pw] beat 2, keep moving: three small pads one tap apart, a flower riding each (the row's data), the flag after */
const keepMoving: Lay = {
  pieces: [bank('a', null, 360), pond('b', 'a', 'hop22', 360), bank('z', 'b', 300)],
  sockets: [flag('z', 0.5), flowers('pb', 'b', 0.6, 1)],
};
/** [Pg] beat 3, the garden path: banks and boulders between pools, up and down, the giant lily nearer */
const gardenPath: Lay = {
  pieces: [bank('a', null, 320), shore('b', 'a', 300, UP), rock('rb', 'b', 0.5), shore('c', 'b', 340, DOWN), rock('rc', 'c', 0.55), bank('d', 'c', 300), shore('e', 'd', 280, UP), shore('z', 'e', 340, DOWN)],
  sockets: [flowers('pa', 'a', 0.5, 2), flowers('pd', 'd', 0.5, 2), flowers('pz', 'z', 0.6, 2)],
};
/** the spur's way up (px): the vine from the near bank to the rope's ledge; the far bank stands this + PAD_LAY.drop over the stone, past a
 *  double's 189 px (place 'pads' checks it), so the stone reads as a dead end and the vine as the way on */
const SPUR_UP = 190;
/** [X] beat 4, there and back (the spur pond, FIX-22; the lead's rulings 4:17 and 5:10 PM ET 11-15): out over two small pads to the dead-end
 *  stone and its flower, Dot's `stone` line on the stone; back over the pads to the bank; up the vine (taught 1-4) to the ledge and over the
 *  pond on the rope (taught 1-3) to the high bank, and down to the water's edge again. The heart after */
const thereAndBack: Lay = {
  pieces: [
    bank('a', null, 440),
    { key: 'v', shape: 'vine', w: [0, 0], place: { kind: 'climb', on: 'a', at: [290 / 440, 290 / 440], h: [SPUR_UP, SPUR_UP] } },
    { key: 'h', shape: 'branch', w: [200, 200], place: { kind: 'over', on: 'a', at: [240 / 440, 240 / 440], dy: [-SPUR_UP, -SPUR_UP] }, style: 'branch', main: true },
    { key: 'w', shape: 'bank', w: [240, 240], place: { kind: 'pads', after: 'a', row: 'spur22', rope: 'h' }, style: 'log', main: true, landing: true },
    shore('z', 'w', 300, [SPUR_UP - 4, SPUR_UP]),
    rock('rz', 'z', 0.55),
  ],
  // (the high bank kept short and a boulder to hop at the water's edge below it: 320 px banks and nothing to do read 4.3-5.1 s of
  // nothing past the rope on 13 of 24 rolls, over the quiet line's 4 s)
  sockets: [flowers('pa', 'a', 0.25, 2), tip('t-stone', 'w', 0, 'stone'), flowers('pz', 'z', 0.25, 2)],
};
/** [W] beat 6, the twist: the pond breathes; `breathe` 800+ px before, the flag before it */
const breathes = (easy: boolean): Lay => ({
  pieces: [bank('a', null, 480), rock('ra', 'a', 0.6), bank('b', 'a', 420), pond('c', 'b', easy ? 'breath22Easy' : 'breath22', 300), pond('d', 'c', easy ? 'breath22Easy' : 'breath22', 360), bank('z', 'd', 300)],
  sockets: [tip('t-breathe', 'a', 0.1, 'breathe'), flag('b', 0.2), flowers('pc', 'c', 0.5, 2), flowers('pd', 'd', 0.5, 1)],
});
/** [Pg] beat 8, the plank walk: the old ferry path out over the reed bed, two gaps in it (a hop each over the reeds); its planks' look is
 *  World 2's bank until a painted plank piece exists (see gapBank) */
const plankWalk: Lay = {
  pieces: [bank('a', null, 320), shore('b', 'a', 300, UP), bank('c', 'b', 300), gapBank('d', 'c', 260), gapBank('e', 'd', 280), shore('z', 'e', 320, DOWN)],
  sockets: [flowers('pc', 'c', 0.5, 2), flowers('pe', 'e', 0.5, 2)],
};
/** [M] beat 9, both kinds: weight pads (the flowers on the small ones), the drifting log lane, a beat pair; the flag before */
const bothKinds = (easy: boolean): Lay => ({
  pieces: [bank('a', null, 360), rock('ra', 'a', 0.5), bank('b', 'a', 300), pond('c', 'b', easy ? 'mixWeight22Easy' : 'mixWeight22', 300), river('d', 'c', easy ? 'lane22Easy' : 'lane22', 300), pond('e', 'd', easy ? 'mixBeat22Easy' : 'mixBeat22', 300), bank('z', 'e', 300)],
  sockets: [flag('a'), flowers('pd', 'd', 0.5, 2), flowers('pz', 'z', 0.5, 2)],
});
/** [S] beat 11, the crown lily: between two small pads, the giant lily that never sinks; Pokey's `lily` as it holds him, Dot's `crown` */
const crownLily: Lay = {
  pieces: [bank('a', null, 420), pond('b', 'a', 'crown22', 360), bank('z', 'b', 300)],
  sockets: [tip('t-lily', 'a', 0.98, 'lily'), tip('t-crown', 'b', 0.05, 'crown'), flowers('pb', 'b', 0.5, 2)],
};
/** [L] beat 12, across the deep: deep water both kinds to the far bank; the flag before */
const acrossDeep: Lay = {
  pieces: [bank('a', null, 360), rock('ra', 'a', 0.5), bank('b', 'a', 300), pond('c', 'b', 'deep22', 280), pond('d', 'c', 'deepBeat22', 300), bank('z', 'd', 300)],
  sockets: [flag('a'), flowers('pc', 'c', 0.5, 2), flowers('pz', 'z', 0.5, 2)],
};
/** [R] a rest on the bank between beats: a hop up and down the shore, a boulder */
const rest: Lay = {
  pieces: [bank('a', null, 320), shore('b', 'a', 260, UP), shore('c', 'b', 340, DOWN), rock('rc', 'c', 0.5), shore('d', 'c', 260, UP), shore('z', 'd', 320, DOWN)],
  sockets: [flowers('pb', 'b', 0.5, 2)],
};

/** THE ARC'S BRICKS (2-2.md), one job each: the graph's letter in brackets */
export const BEATS_22: SectionTemplate[] = [
  brick({ id: 'garden', name: 'the pond garden', jobs: ['arrive'], difficulty: 1, content: 'structural', phases: ['start'], versions: [{ id: 'garden', lay: arrival }] }),
  brick({ id: 'first-pad', name: 'the first pad, safe', jobs: ['teach'], difficulty: 1, content: 'water', teaches: PADS_LESSON, versions: [{ id: 'first', lay: firstPad }] }),
  brick({ id: 'keep-moving', name: 'keep moving', jobs: ['practise'], difficulty: 2, content: 'water', uses: [PADS_LESSON], versions: [{ id: 'hop', lay: keepMoving }] }),
  brick({ id: 'garden-path', name: 'the garden path', jobs: ['practise'], difficulty: 1, content: 'ground', versions: [{ id: 'path', lay: gardenPath }] }),
  brick({ id: 'there-and-back', name: 'there and back', jobs: ['test'], difficulty: 4, content: 'water', uses: [PADS_LESSON], versions: [{ id: 'spur', lay: thereAndBack }] }),
  brick({ id: 'breathes', name: 'the pond breathes', jobs: ['twist'], difficulty: 5, content: 'floating', uses: [PADS_LESSON], versions: [{ id: 'breath', lay: breathes(false), easy: breathes(true) }] }),
  brick({ id: 'planks', name: 'the plank walk', jobs: ['practise'], difficulty: 1, content: 'ground', versions: [{ id: 'jetty', lay: plankWalk }] }),
  brick({ id: 'both-kinds', name: 'both kinds', jobs: ['flow'], difficulty: 6, content: 'floating', uses: [PADS_LESSON], versions: [{ id: 'mix', lay: bothKinds(false), easy: bothKinds(true) }] }),
  brick({ id: 'crown-lily', name: 'the crown lily', jobs: ['signature'], difficulty: 2, content: 'water', uses: [PADS_LESSON], versions: [{ id: 'crown', lay: crownLily }] }),
  brick({ id: 'deep', name: 'across the deep', jobs: ['finale'], difficulty: 7, content: 'floating', uses: [PADS_LESSON], versions: [{ id: 'deep', lay: acrossDeep }] }),
  brick({ id: 'rest', name: 'a rest on the bank', jobs: ['rest'], difficulty: 1, content: 'structural', phases: ['rest'], maxPerStage: 6, versions: [{ id: 'shore', lay: rest }] }),
];

/** [E] beat 13, the village bank: the crown's flowers, Dot's `king` once the goal is met (the exit's own line) */
export const EXIT_22: SectionTemplate = {
  id: 'w2-22-bank', name: 'the village bank', feel: [STAGE_22], own: true, archetypes: 'any', phases: ['goal'], difficulty: 1, needs: ['walk'], jobs: ['exit'], content: 'structural', terrain: 'river-bank',
  pieces: [{ key: 'in', shape: 'bank', w: [340, 340], place: { kind: 'start' }, style: 'log', main: true, landing: true }],
  subBlocks: [{ id: 'body', versions: [{ id: 'bank', pieces: [{ key: 'out', shape: 'bank', w: [580, 600], place: { kind: 'walk', after: 'in', dy: [0, 0] }, style: 'log', main: true, landing: true }], sockets: [flowers('pi', 'in', 0.5, 2), { id: 'exit-totem', role: 'objective', on: 'out', t: 0.85, allow: ['exit_totem'] }] }] }],
  entry: { piece: 'in', kind: 'ground' }, exit: { piece: 'out', kind: 'ground' }, exitDy: 0, sockets: [tip('t-king', 'out', 0.6, 'king')], mirrorable: false,
} as SectionTemplate;

/** every section that is 2-2's own */
export const SECTIONS_22: SectionTemplate[] = [...BEATS_22, EXIT_22];

/**
 * World 2's kit with 2-2's rows over it (stageTable.ts kit 'w2-22', listed.ts KITS): its pool is its own sections alone; 2-2's pond and
 * river tables; its graph and brief; the keeper's lines as the kit's tips; the crown's flowers the pond's own colours (the keeper's fault 1:
 * never her pink: the passion flower's lilac and the lotus's white, flora.ts).
 */
export function kitLib22(): WorldKit {
  const k = w2World(), M = k.manifest, G = M.graphs!;
  return { ...k,
    manifest: { ...M,
      sections: SECTIONS_22,
      pads: PADS_22,
      rivers: RIVERS_22,
      flowers: ['passion', 'lotus'],
      lessons: { ...M.lessons, [PADS_LESSON]: STAGE_22 },
      required: {},
      tips: { ...M.tips, ...Object.fromEntries((Object.keys(LINES_22) as Array<keyof typeof LINES_22>).map((key) => [lineId22(key), LINES_22[key]])) },
      teachTips: [...(M.teachTips ?? []), ...TEACH_22.map(lineId22)],
      graphs: { ...G, list: [...G.list.filter((g) => g.archetype !== 'harvest'), ...Object.entries(ARC_22).map(([id, code]) => ({ id, archetype: 'harvest' as const, code }))], briefs: { ...G.briefs, [STAGE_22]: BRIEF_22 } },
    } } as WorldKit;
}
