/**
 * gen2/worlds/w2Arc27 — 2-7 "The Mailman's Route: Ride the River Home" as designed (reference/design/2-7.md, DESIGN-26-28 on t-design-26;
 * BUILD-27, packet reference/packets/2026-11-23/BUILD-27.md). WORLD DATA: no engine line names this stage; kitLib27 gives World 2's kit
 * 2-7's rows (stageTable.ts kit 'w2-27', listed.ts KITS), and the game rolls it the way it rolls every gen2 stage.
 *
 * ONE idea (2-7.md): "Carry the post up the mill-race against the current, past every door marked PLEASE BE PATIENT; at the weir drop
 * into the river and race the mail boat home on the current." The same water read twice: out, every log comes AT him; home, the current
 * carries him and the mail boat (the pacer, pacer.ts, W2_RACE) races him to the jetty. The first run back LEFT is taught on a calm bank.
 *
 * THE PIECES (all READY, READY-27): World 2's rivers (riverLay.ts) and the left leg's mirror (legs.ts reflectLeg: a home river's `ride`
 * +1 row flows LEFT, with him); the mail boat (pacer.ts, gen2/pacerLay.ts: it waits at the race leg's first river and docks at its last);
 * the post (post.ts, gen2/postLay.ts: PLEASE BE PATIENT doors on the out leg, a reply on the home leg); the weir (columnDress.ts, W2_WEIR,
 * the descent column's dressing).
 *
 * THE ARC (2-7.md "THE NODE STRING" `A Pg1> Pw1>:#soft Pf1> Xw1> R /D Dg1_ /L Tg1<:#soft Pw1> Pb1> Ww1> R Cf1> R Sw1> E`, one brick a beat):
 *   A  the post office jetty: the hand-over (`handover`, then `race`)
 *   Pg the bank path, the first doors                      Pw logs at him (`back27`, soft: splash-back)
 *   Pf the porch walk, plank to plank                      X  upstream (`upstream`, deep; Easy `back27` soft; WATER_WARN before it)
 *   R  a rest                                               D  the weir, down its stepped face (`turn` on its top)
 *   T  TEACH: home is LEFT, a calm reed bank (soft)         Pw with the current (`ride` +70)
 *   Pb a bounce onto a porch, over the boat's bend          W  TWIST: `twin` +80, keep running
 *   C  the stilt houses: a log, a stilt porch, a log        S  neck and neck: `long` +80, the signature
 *   E  the jetty (the race judged at the dock)
 * DESIGN CHANGES (BUILD-27's, each with its reason): the weir is laid `Dc_` (the toy's proven descent column, toyHome.ts HOME_CODE, which
 * the weir's dress needs: columnDress dresses a column) for the design's `Dg1_`; Easy lays `ride` on every home river (2-7.md:26).
 */
import { W2_POST_ART, W2_RACE, W2_RIVERS, W2_WEIR, w2World } from './w2.ts';
import type { RiverRow } from '../riverLay.ts';
import type { GraphBrief, NodeJob, SectionPiece, SectionTemplate, Socket, WorldKit } from '../types.ts';

export const STAGE_27 = '2-7';

/** 2-7's ONE graph (2-7.md's node string; the weir as a column, `Dc_`) */
export const ARC_27: Record<string, string> = { 'post-27-arc': 'A Pg1> Pw1> Pf1> Xw1> R /D Dc_ /L Tg1< Pw1> Pb1> Ww1> R Cf1> R Sw1> E' };

/** the lesson 2-7 teaches: home is the other way (the first run back LEFT) */
export const HOME_LESSON = 'home-left';

/** the doors on the way out (2-7.md "The post doors": 6) */
export const DOORS_27 = 5;

/** 2-7's brief, all of it data (a sprint: 11 content nodes: water 5, ground 2, floating 2, climb 1, bounce 1); the mail boat, the post
 *  and the weir's dress */
export const BRIEF_27: GraphBrief = {
  ends: 'quiet', trend: 'level', branching: 'none', teaches: [HOME_LESSON],
  deal: { water: 500 / 11, ground: 200 / 11, floating: 200 / 11, climb: 100 / 11, bounce: 100 / 11 }, dealExact: true,
  tags: true, petals: 'few', pacer: W2_RACE, post: { doors: DOORS_27, art: W2_POST_ART }, columnDress: W2_WEIR,
};

/** the story keeper's lines for 2-7, verbatim (reference/story/lines-2-7.md, KEEPER-27 t-keeper-27@0614ae0a). The only player words this
 *  file holds; w2Arc27.test.ts holds each equal to the keeper's file */
export const LINES_27 = {
  /** Dot, once, at the post office jetty (beat 0) as the mailman hands Pokey the satchel */
  handover: "He's handed us the post! One for every door!",
  /** Dot, right after `handover`: the race challenge */
  race: "From the weir, he'll race us home by boat!",
  /** Dot, THE teach for the run left, 800+ px before beat 6, on the weir (beat 5) */
  turn: "Now home's the other way! Go with the river!",
} as const;
/** the stage card (stagePlan.ts World 2's 2-7 row): the keeper's `mission` */
export const MISSION_27 = 'Carry the post up the mill-race, then race the mail boat home.';
/** a line's id in the kit: its own, `w27.<key>` */
export const lineId27 = (line: keyof typeof LINES_27): string => `w27.${line}`;
/** the lines Dot says as TEACH lines (said on Normal's default Tips as on Help, D50) */
export const TEACH_27 = ['turn'] as const;

/**
 * 2-7's rivers: World 2's rows (the home leg's `ride`, `twin`, `long` are the mail boat's flown rows, W2_RACE.rivers) and the out leg's
 * two, both flowing back AT him (dir -1): `back27` (2-7.md's `back` -70, 150 px logs, gap 80, soft: splash-back) and `upstream` (-75, 160
 * px logs, deep: the design's proposed row, flown 8.7 s middle)
 */
export const RIVERS_27 = {
  ...W2_RIVERS,
  back27: { dir: -1, speed: 70, logW: 150, logs: 2, gap: 80, safe: true },
  upstream: { dir: -1, speed: 75, logW: 160, logs: 2, gap: 80 },
} as const satisfies Record<string, RiverRow>;
type Row27 = keyof typeof RIVERS_27;
type Content = NonNullable<SectionTemplate['content']>;

// ───────────────────────────── the parts ─────────────────────────────
/** World 2's bank, `w` exact, level with `after` (or the section's first) */
const bank = (key: string, after: string | null, w: number): SectionPiece => ({ key, shape: 'bank', w: [w, w], place: after ? { kind: 'walk', after, dy: [0, 0] } : { kind: 'start' }, style: 'log', main: true });
/** the far bank of a river of 2-7's row `row` laid from `after` (place `river`, riverLay.ts layRiver) */
const river = (key: string, after: string, row: Row27, w: number): SectionPiece => ({ key, shape: 'bank', w: [w, w], place: { kind: 'river', after, row }, style: 'log', main: true, landing: true });
/** World 2's boulder to hop on the bank (a moss stone exactly 50 px tall is the kit's painted rock) */
const rock = (key: string, on: string, at: number): SectionPiece => ({ key, shape: 'block', w: [110, 120], place: { kind: 'on', on, at: [at, at], h: [50, 50] }, style: 'moss_stone', landing: true });
/** a porch plank hung off the bank houses, a hop from `after` (World 2's dock look: canopy_bridge) */
const porch = (key: string, after: string, w: number, dy: number): SectionPiece => ({ key, shape: 'branch', w: [w, w], place: { kind: 'jump', after, dy, share: [0.45, 0.6] }, style: 'canopy_bridge', landing: true });
/** World 2's bounce on `on` (2-1's lily cap: bounceArt.ts) */
const spring = (key: string, on: string, at: number): SectionPiece => ({ key, shape: 'bouncy', w: [70, 70], place: { kind: 'on', on, at: [at, at], h: [30, 30] } });
const petal = (id: string, on: string, t: number): Socket => ({ id, role: 'pickup', on, t, dn: 34, count: 1, span: 80 });
const tip = (id: string, on: string, t: number, line: keyof typeof LINES_27): Socket => ({ id, role: 'tip', on, t, allow: [lineId27(line)] });

interface Lay { pieces: SectionPiece[]; sockets: Socket[] }
interface V { id: string; lay: Lay; easy?: Lay }

/** one beat: its first piece is its entry, its last its exit (renamed `in` and `out`); an `easy` lay is its Easy version */
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
  const kind = o.entry ?? 'ground';
  return {
    id: `w2-27-${o.id}`, name: o.name, feel: [STAGE_27], own: true, archetypes: 'any', phases: o.phases ?? ['ki', 'sho', 'ten', 'ketsu'], difficulty: o.difficulty, needs: ['jump'],
    ...(o.teaches ? { teaches: o.teaches } : {}), uses: o.uses ?? [], jobs: o.jobs, content: o.content, terrain: 'river-bank', maxPerStage: o.maxPerStage ?? 1, ...(o.window ? { window: o.window } : {}),
    pieces: [first], subBlocks: [{ id: 'body', versions }], entry: { piece: 'in', kind }, exit: { piece: 'out', kind }, exitDy: o.exitDy ?? 0, sockets: [], mirrorable: false,
  } as SectionTemplate;
}

// ───────────────────────────── the beats ─────────────────────────────
/** [A] beat 0, the post office jetty: the mailman hands over the satchel (`handover`, then `race`) */
const jetty: Lay = {
  pieces: [bank('a', null, 440), bank('b', 'a', 420), rock('rb', 'b', 0.6), bank('z', 'b', 300)],
  sockets: [tip('t-handover', 'a', 0.35, 'handover'), tip('t-race', 'b', 0.2, 'race'), petal('pz', 'z', 0.5)],
};
/** [P g] beat 1, the doors: the bank path, a boulder or two (the post lays the PLEASE BE PATIENT doors on the walked banks) */
const doors: Lay = {
  pieces: [bank('a', null, 360), rock('ra', 'a', 0.55), bank('b', 'a', 380), bank('c', 'b', 360), rock('rc', 'c', 0.5), bank('d', 'c', 380), bank('e', 'd', 380), rock('re', 'e', 0.55), bank('f', 'e', 380), bank('z', 'f', 320)],
  sockets: [petal('pb', 'b', 0.5)],
};
/** a river crossing: a bank, the water of row `row`, the far bank (its petal on the far bank: the natural line off the logs) */
const crossing = (row: Row27, near = 300, far = 340): Lay => ({ pieces: [bank('a', null, near), river('z', 'a', row, far)], sockets: [petal('pz', 'z', 0.4)] });
/** [X w] beat 4, upstream: the design's 924 px reach flown as one (2-7.md:15) laid as two reaches of the row with a mid-race bank between,
 *  so the next log always comes out in sight (riverLay.ts RIVER_LAY.view: one reach of 924 px flowing at him is refused) */
const twoReaches = (row: Row27): Lay => ({ pieces: [bank('a', null, 300), river('m', 'a', row, 260), river('z', 'm', row, 340)], sockets: [petal('pm', 'm', 0.5), petal('pz', 'z', 0.4)] });
/** [P f] beat 3, the porch walk: planks hung off the bank houses over the race, plank to plank */
const porches: Lay = {
  pieces: [bank('a', null, 300), porch('p1', 'a', 170, -20), porch('p2', 'p1', 170, 0), porch('p3', 'p2', 170, 0), porch('p4', 'p3', 170, -20), porch('p5', 'p4', 170, 0), { ...porch('z', 'p5', 320, 40), shape: 'bank', style: 'log', main: true }],
  sockets: [petal('p2p', 'p2', 0.5)],
};
/** [D c] beat 5, the weir: down its stepped face (the toy tower's drops; the weir dresses the column), `turn` said on its top */
const weir: Lay = {
  pieces: [
    { key: 'a', shape: 'branch', w: [240, 260], place: { kind: 'start' } },
    { key: 'b', shape: 'branch', w: [220, 250], place: { kind: 'jump', after: 'a', dy: [110, 150], share: [0.25, 0.4] }, landing: true },
    { key: 'z', shape: 'branch', w: [220, 260], place: { kind: 'jump', after: 'b', dy: [110, 150], share: [0.25, 0.4] }, landing: true },
  ],
  sockets: [tip('t-turn', 'a', 0.3, 'turn'), petal('pb', 'b', 0.5)],
};
/** [T g] beat 6, TEACH home is LEFT: a calm reed bank, nothing that hurts */
const reedBank: Lay = {
  pieces: [bank('a', null, 420), bank('b', 'a', 400), rock('rb', 'b', 0.5), bank('c', 'b', 400), rock('rc', 'c', 0.55), bank('d', 'c', 400), bank('z', 'd', 360)],
  sockets: [petal('pa', 'a', 0.6), petal('pz', 'z', 0.5)],
};
/** [P b] beat 8, over the bend: a bounce onto a porch walk, then down the far bank */
const bend: Lay = {
  pieces: [bank('a', null, 340), spring('m', 'a', 0.72), { ...bank('w', 'a', 340), place: { kind: 'walk', after: 'a', dy: [-180, -174] }, landing: true, block: 'bounce', from: 'm' }, { ...bank('b', 'w', 300), place: { kind: 'walk', after: 'w', dy: [86, 90] } }, { ...bank('c', 'b', 300), place: { kind: 'walk', after: 'b', dy: [0, 0] } }, rock('rc', 'c', 0.5), { ...bank('z', 'c', 320), place: { kind: 'walk', after: 'c', dy: [86, 90] } }],
  sockets: [petal('pw', 'w', 0.5)],
};
/** [C f] beat 11, the stilt houses: a log, a stilt porch (its reply), a log: the moving and the still in one run */
const stilts = (row: Row27): Lay => ({
  pieces: [bank('a', null, 300), river('s', 'a', row, 220), river('z', 's', row, 340)],
  sockets: [petal('ps', 's', 0.5)],
});
/** [R] a rest on the bank */
const rest: Lay = {
  pieces: [bank('a', null, 260), bank('b', 'a', 300), rock('rb', 'b', 0.5), bank('z', 'b', 260)],
  sockets: [{ id: 'find', role: 'findSpot', on: 'a', t: 0.5 }],
};

/** 2-7's beats, one brick each */
export const BEATS_27: SectionTemplate[] = [
  brick({ id: 'jetty', name: 'the post office jetty', jobs: ['arrive'], difficulty: 1, content: 'structural', phases: ['start'], versions: [{ id: 'jetty', lay: jetty }] }),
  brick({ id: 'doors', name: 'the doors', jobs: ['practise'], difficulty: 1, content: 'ground', versions: [{ id: 'path', lay: doors }] }),
  brick({ id: 'at-him', name: 'logs at him', jobs: ['practise'], difficulty: 3, content: 'water', window: [0, 0.35], versions: [{ id: 'back', lay: twoReaches('back27') }] }),
  brick({ id: 'porches', name: 'the porch walk', jobs: ['practise'], difficulty: 2, content: 'floating', versions: [{ id: 'planks', lay: porches }] }),
  brick({ id: 'upstream', name: 'upstream', jobs: ['test'], difficulty: 5, content: 'water', versions: [{ id: 'deep', lay: twoReaches('upstream'), easy: twoReaches('back27') }] }),
  brick({ id: 'weir', name: 'the weir', jobs: ['descent'], difficulty: 2, content: 'climb', entry: 'ledge', exitDy: 260, versions: [{ id: 'steps', lay: weir }] }),
  brick({ id: 'reed-bank', name: 'home is this way', jobs: ['teach'], difficulty: 1, content: 'ground', teaches: HOME_LESSON, versions: [{ id: 'calm', lay: reedBank }] }),
  brick({ id: 'with', name: 'with the current', jobs: ['practise'], difficulty: 2, content: 'water', window: [0.35, 1], uses: [HOME_LESSON], versions: [{ id: 'ride', lay: crossing('ride') }] }),
  brick({ id: 'bend', name: 'over the bend', jobs: ['practise'], difficulty: 2, content: 'bounce', uses: [HOME_LESSON], versions: [{ id: 'spring', lay: bend }] }),
  brick({ id: 'keep-running', name: 'keep running', jobs: ['twist'], difficulty: 5, content: 'water', uses: [HOME_LESSON], versions: [{ id: 'twin', lay: crossing('twin'), easy: crossing('ride') }] }),
  brick({ id: 'stilts', name: 'the stilt houses', jobs: ['combine'], difficulty: 5, content: 'floating', uses: [HOME_LESSON], versions: [{ id: 'twin', lay: stilts('twin'), easy: stilts('ride') }] }),
  brick({ id: 'neck', name: 'neck and neck', jobs: ['signature'], difficulty: 4, content: 'water', uses: [HOME_LESSON], versions: [{ id: 'long', lay: crossing('long', 300, 360), easy: crossing('ride', 300, 360) }] }),
  brick({ id: 'rest', name: 'a rest on the bank', jobs: ['rest'], difficulty: 1, content: 'structural', phases: ['rest'], maxPerStage: 6, versions: [{ id: 'bank', lay: rest }] }),
];

/** [E] beat 14, the jetty home and the exit totem (the race judged at the dock) */
export const EXIT_27: SectionTemplate = {
  id: 'w2-27-home-jetty', name: 'the jetty home', feel: [STAGE_27], own: true, archetypes: 'any', phases: ['goal'], difficulty: 1, needs: ['walk'], jobs: ['exit'], content: 'structural', terrain: 'river-bank',
  pieces: [{ key: 'in', shape: 'bank', w: [300, 300], place: { kind: 'start' }, style: 'log', main: true, landing: true }],
  subBlocks: [{ id: 'body', versions: [{ id: 'bank', pieces: [{ key: 'out', shape: 'bank', w: [560, 580], place: { kind: 'walk', after: 'in', dy: [0, 0] }, style: 'log', main: true, landing: true }], sockets: [{ id: 'exit-totem', role: 'objective', on: 'out', t: 0.85, allow: ['exit_totem'] }] }] }],
  entry: { piece: 'in', kind: 'ground' }, exit: { piece: 'out', kind: 'ground' }, exitDy: 0, sockets: [], mirrorable: false,
} as SectionTemplate;

/** every section that is 2-7's own */
export const SECTIONS_27: SectionTemplate[] = [...BEATS_27, EXIT_27];

/**
 * World 2's kit with 2-7's rows over it (stageTable.ts kit 'w2-27', listed.ts KITS): its pool is its own sections alone; 2-7's rivers;
 * its graph and brief (the mail boat, the post, the weir); the keeper's lines as the kit's tips.
 */
export function kitLib27(): WorldKit {
  const k = w2World(), M = k.manifest, G = M.graphs!;
  return { ...k,
    manifest: { ...M,
      sections: SECTIONS_27,
      rivers: RIVERS_27,
      creatures: [],
      lessons: { ...M.lessons, [HOME_LESSON]: STAGE_27 },
      required: {},
      tips: { ...M.tips, ...Object.fromEntries((Object.keys(LINES_27) as Array<keyof typeof LINES_27>).map((key) => [lineId27(key), LINES_27[key]])) },
      teachTips: [...(M.teachTips ?? []), ...TEACH_27.map(lineId27)],
      graphs: { ...G, list: [...G.list.filter((g) => g.archetype !== 'sprint'), ...Object.entries(ARC_27).map(([id, code]) => ({ id, archetype: 'sprint' as const, code }))], briefs: { ...G.briefs, [STAGE_27]: BRIEF_27 } },
    } } as WorldKit;
}
