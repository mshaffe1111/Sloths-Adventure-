/**
 * gen2/worlds/w2Arc21 — 2-1 "Down to the River" as designed (reference/design/2-1.md, DESIGN-19 final on t-pitch-b@b85dba7f; the lead's
 * picks PICKS-19-22.md; BUILD-21, GO 12:36 PM ET 11-15). WORLD DATA: no engine line names this stage; kitLib21 gives World 2's kit 2-1's
 * rows (stageTable.ts kit 'w2-21', listed.ts KITS), and the game rolls it the way it rolls every gen2 stage.
 *
 * ONE idea (2-1.md): "When the trees run out, the river is your road: wait for a log, ride it, and hop to the next before the water gets
 * you." World 1 made him move; World 2 moves HIM. The thumb decides WHEN: board on the log's knock (river.ts logKnocks), hop log to log,
 * step off where the log hands him up onto the bank (engine.ts: carried under a bank he steps up onto it). The danger is the water between
 * logs (a deep river costs a life on Normal; a splash-back river sets him back on the bank he left, nothing lost). On Easy EVERY river is
 * the splash-back kind, its logs wider (the lead's ruling 1, 11-15: so on Easy every river shows the safe look, honestly).
 *
 * THE ARC (2-1.md "THE NODE STRING", one brick a beat; the five P beats told apart by their content, as 1-6's are):
 *   A  the canopy's edge (the keeper's `edge`)          X  down on three lianas, each lower (World 1's move, Jungle Hunt's vines)
 *   T  the first log, safe (`logs`, 800+ px before)     Pg the bank: stones and stumps, the next river knocking below
 *   Pw log to log for real, the first DEEP river (flag before; Dot's `deep` is the kit's water warning)
 *   Pr a liana over a side creek                        W  the river runs back (`back`, 800+ px before; flag)
 *   Pb a bounce up the high bank                        L  both ways: with him, a reed islet, against him (flag)
 *   Pf the reed islet and the old jetty                 S  the long log: the widest, calmest river (flag)
 *   E  the village gate (`village`, then her `mark`)    R  a rest on the bank between beats
 * The content mix (V11, on the realised code: S never counts): 9 content nodes, water 4 (T Pw W L, the cap), rope 2 (X Pr), ground,
 * bounce, floating one each; no two neighbours alike.
 */
import { withSwing } from './w1Swing.ts';
import { W2_RIVERS, w2Liana, w2Perch, w2World, type W2LianaGap } from './w2.ts';
import type { RiverRow } from '../riverLay.ts';
import type { GraphBrief, NodeJob, SectionPiece, SectionTemplate, Socket, WorldKit } from '../types.ts';

export const STAGE_21 = '2-1';
type R2 = [number, number];

/** 2-1's ONE graph (2-1.md: `A Xs1< Tw1<:#soft Pg1< R Pw2>:#water R Ps1< Ww2>:#water R Pb1< Lw2>:#water Pf1< R Sw1<:#soft E`; the
 *  liana's letter is the rope type here: s names no section type the deal can hold, nodeAsks TYPE_OF_LETTER; and an R after X, which
 *  2-1.md's string lacks and V5 requires: a rest after every test, twist and signature, nodeCode.ts) */
export const ARC_21: Record<string, string> = { 'river-21-arc': 'A X R T Pg R Pw R Pr W R Pb L Pf R S E' };

/** the river lesson's key (w2.ts W2_LESSON.river: World 2's manifest teaches it in 2-1) */
const RIVER = 'river';

/** 2-1's brief, all of it data (2-1.md: a sprint to the village; the keeper's ruling 2: Meeca's petals are FEW in World 2) */
export const BRIEF_21: GraphBrief = {
  ends: 'finale', trend: 'level', branching: 'none', teaches: [RIVER], deal: { water: 44, rope: 22, ground: 12, bounce: 11, floating: 11 }, dealExact: true,
  tags: true, petals: 'few',
};

/** the story keeper's lines for 2-1, verbatim (reference/story/lines-2-1.md on t-story@50da9e58, approved about 8:20 PM ET 11-14). The
 *  only player words this file holds; w2Arc21.test.ts holds each equal to the keeper's file. `deep` is World 2's kit line (w2.ts W2_TIPS
 *  water): the pipeline says it before the first deep river, as Dot's warning before water in every world */
export const LINES_21 = {
  /** Dot, World 2's first line, at the canopy's edge (beat 0) */
  edge: "The trees just stop! The river's our road now.",
  /** teach, 800+ px before beat 2 (the first log) */
  logs: 'Hear the knock? Hop on. Logs carry you!',
  /** teach, 800+ px before beat 6 (the twist) */
  back: 'It flows the other way! Run, and hop ahead!',
  /** Dot at the village gate (beat 11) */
  village: "A whole village of sloths! They're all still waving.",
  /** Dot, her mark on the gate (the exit) */
  mark: 'Her mark, right on the village gate!',
} as const;
/** a line's id in the kit: its own, `w21.<key>` */
export const lineId21 = (line: keyof typeof LINES_21): string => `w21.${line}`;
/** the lines Dot says as TEACH lines (said on Normal's default Tips as on Help, D50) */
export const TEACH_21 = ['logs', 'back'] as const;

/**
 * 2-1's rivers (gen2/riverLay.ts RiverRow), over World 2's table (w2.ts W2_RIVERS): Normal's by the beat, and each beat's EASY row, the
 * splash-back kind with logs 20-30 px longer at the same speed (a slower river breaks riverFaults' beat: a log at the bank every 4 s or
 * less). Every row lays fault-free (w2Arc21.test.ts).
 */
export const RIVERS_21 = {
  ...W2_RIVERS,
  /** beat 2: the first log, slow, with him, a splash puts him back */
  ride21: { ...W2_RIVERS.ride },
  ride21Easy: { ...W2_RIVERS.ride, logW: 200 },
  /** beat 4: log to log for real, deep on Normal */
  deep21: { ...W2_RIVERS.deep },
  deep21Easy: { ...W2_RIVERS.deep, logW: 190, safe: true },
  /** beat 6: the river runs back at him (an eddy along the bank, the keeper's nature check) */
  back21: { ...W2_RIVERS.back },
  back21Easy: { ...W2_RIVERS.back, logW: 170, safe: true },
  /** beat 8: both ways at once, the pair at 80 px/s (river.ts:139): with him to the reed islet, then back at him */
  twinWith21: { ...W2_RIVERS.twin },
  twinWith21Easy: { ...W2_RIVERS.twin, logW: 180, safe: true },
  twinBack21: { dir: -1, speed: 80, logW: 150, logs: 2, gap: 80 },
  twinBack21Easy: { dir: -1, speed: 80, logW: 170, logs: 2, gap: 80, safe: true },
  /** beat 10, the signature: the widest, calmest river and its one long log, the splash-back kind (2-1.md `Sw1<:#soft`) */
  long21: { ...W2_RIVERS.long, safe: true },
} as const satisfies Record<string, RiverRow>;
type Row21 = keyof typeof RIVERS_21;

// ───────────────────────────── the pieces (World 2's: its earth bank, its boulder, its river) ─────────────────────────────
/** a bank he walks on, `w` exact, level with the one before (or the section's first) */
const bank = (key: string, after: string | null, w: number): SectionPiece => ({ key, shape: 'bank', w: [w, w], place: after ? { kind: 'walk', after, dy: [0, 0] } : { kind: 'start' }, style: 'log', main: true });
const UP: R2 = [-56, -50], DOWN: R2 = [50, 56];
/** a bank a step up or down the shore */
const shore = (key: string, after: string, w: number, dy: R2): SectionPiece => ({ ...bank(key, after, w), place: { kind: 'walk', after, dy } });
/** the far bank of a river laid from 2-1's row `row`, level with `after` (gen2 place `river`, riverLay.ts) */
const river = (key: string, after: string, row: Row21, w: number): SectionPiece => ({ key, shape: 'bank', w: [w, w], place: { kind: 'river', after, row }, style: 'log', main: true, landing: true });
/** World 2's boulder to hop on the bank (w2.ts rock: a moss stone exactly 50 px tall is the kit's painted rock) */
const rock = (key: string, on: string, at: number): SectionPiece => ({ key, shape: 'block', w: [110, 120], place: { kind: 'on', on, at: [at, at], h: [50, 50] }, style: 'moss_stone', landing: true });
/** World 2's bounce (bounceArt.ts: World 2's own painted plant), standing on `on` */
const spring = (key: string, on: string, at: number): SectionPiece => ({ key, shape: 'bouncy', w: [70, 70], place: { kind: 'on', on, at: [at, at], h: [30, 30] } });
/** the old jetty's planks, level with `after` (World 2's dock look: canopy_bridge) */
const jetty = (key: string, after: string, w: number): SectionPiece => ({ ...bank(key, after, w), style: 'canopy_bridge' });

const petal = (id: string, on: string, t: number): Socket => ({ id, role: 'pickup', on, t, dn: 34, count: 1, span: 80 });
const flag = (on: string, t = 0.3): Socket => ({ id: 'flag', role: 'flag', on, t });
const tip = (id: string, on: string, t: number, line: keyof typeof LINES_21): Socket => ({ id, role: 'tip', on, t, allow: [lineId21(line)] });

// ───────────────────────────── a brick ─────────────────────────────
type Lay = { pieces: SectionPiece[]; sockets: Socket[] };
type V = { id: string; lay: Lay; easy?: Lay };
type Content = 'ground' | 'water' | 'rope' | 'bounce' | 'floating';
/** a brick (1-7's form, w1Arc17.ts): its first piece `in`, its last `out`, a version's Easy twin beside it, served to 2-1 alone, once */
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
    id: `w2-21-${o.id}`, name: o.name, feel: [STAGE_21], own: true, archetypes: 'any', phases: o.phases ?? ['ki', 'sho', 'ten', 'ketsu'], difficulty: o.difficulty, needs: ['jump'],
    ...(o.teaches ? { teaches: o.teaches } : {}), uses: o.uses ?? [], jobs: o.jobs, content: o.content, terrain: 'river-bank', maxPerStage: o.maxPerStage ?? 1,
    pieces: [first], subBlocks: [{ id: 'body', versions }], entry: { piece: 'in', kind: 'ground' }, exit: { piece: 'out', kind: 'ground' }, exitDy: 0, sockets: [], mirrorable: false,
  } as SectionTemplate;
}

// ───────────────────────────── the beats ─────────────────────────────
/** [A] beat 0, the canopy's edge: up the last of the bank's roots to where the trees stop, Dot's first World 2 line */
const arrival: Lay = {
  pieces: [bank('a', null, 420), shore('b', 'a', 340, UP), rock('rb', 'b', 0.5), shore('c', 'b', 360, UP), bank('z', 'c', 320)],
  sockets: [tip('t-edge', 'a', 0.45, 'edge'), petal('pc', 'c', 0.5)],
};
/** [X] beat 1, down: three lianas from the riverside trees, each over a splash-back creek (nothing lost), and the bank stepping down three
 *  plain hops after each perch, so he comes down out of the trees to the river. Each perch lies where the engine lays it: from World 2 on
 *  the glide is a guaranteed move, so a perch must lie past a glide (pipeline jumpLinkGap) and the lay raises it over the take-off
 *  (2-1.md's "each perch lower" is ENGINE-WORTHY, BUILD-21 REPORT); the steps down carry the descent */
const down = (easy: boolean): Lay => {
  const g = (k: number): W2LianaGap => (easy || k < 3 ? 'short' : 'long');
  const pieces: SectionPiece[] = [bank('a', null, 320)];
  let from = 'a';
  // (three hops down after the first perch, two after the second, one after the last: the canopy's edge stands two steps up, so he
  //  comes down to the river's level)
  for (const [k, steps] of [[1, 3], [2, 2], [3, 1]] as const) {
    pieces.push(w2Liana(`l${k}`, from, g(k)), w2Perch(`p${k}`, `l${k}`, g(k), 300));
    from = `p${k}`;
    for (let j = 0; j < steps; j++) {
      pieces.push(shore(`s${k}${j}`, from, j === steps - 1 ? 300 : 220, DOWN));
      from = `s${k}${j}`;
    }
  }
  pieces.push(bank('z', from, 300));
  return { pieces, sockets: [petal('pd', 'p3', 0.5)] };
};
/** [T] beat 2, the first log, safe: a long bank to hear the knock on (the keeper's `logs` 800+ px before the water), the slow river with
 *  him, the far bank */
const firstLog = (easy: boolean): Lay => ({
  pieces: [bank('a', null, 480), bank('b', 'a', 400), river('c', 'b', easy ? 'ride21Easy' : 'ride21', 360), bank('z', 'c', 300)],
  sockets: [tip('t-logs', 'a', 0.1, 'logs'), petal('pz', 'z', 0.5)],
});
/** [Pg] beat 3, the bank: stones and stumps along the shore, up and down, the next river knocking ahead */
const theBank = (): Lay => ({
  pieces: [bank('a', null, 320), shore('b', 'a', 300, UP), rock('rb', 'b', 0.5), shore('c', 'b', 340, DOWN), rock('rc', 'c', 0.55), bank('d', 'c', 300), shore('e', 'd', 280, UP), shore('z', 'e', 340, DOWN)],
  sockets: [petal('pc', 'c', 0.3)],
});
/** [Pw] beat 4, log to log for real: the first DEEP river (Normal: a fall costs a life; Easy: still a splash), the flag before it */
const deepRiver = (easy: boolean): Lay => ({
  pieces: [bank('a', null, 360), bank('b', 'a', 420), river('c', 'b', easy ? 'deep21Easy' : 'deep21', 360), bank('z', 'c', 300)],
  sockets: [flag('a'), petal('pz', 'z', 0.5)],
});
/** [Pr] beat 5, a liana over a side creek (World 1's move in World 2's look) */
const creekLiana = (): Lay => ({
  pieces: [bank('a', null, 340), w2Liana('l', 'a', 'short'), w2Perch('b', 'l', 'short', 320), bank('z', 'b', 300)],
  sockets: [petal('pb', 'b', 0.5)],
});
/** [W] beat 6, the twist: the river runs back at him (an eddy along the bank); `back` 800+ px before, the flag before it */
const backRiver = (easy: boolean): Lay => ({
  pieces: [bank('a', null, 480), bank('b', 'a', 420), river('c', 'b', easy ? 'back21Easy' : 'back21', 360), bank('z', 'c', 300)],
  sockets: [tip('t-back', 'a', 0.1, 'back'), flag('b', 0.2), petal('pz', 'z', 0.5)],
});
/** [Pb] beat 7, up the high bank: World 2's bounce at the foot of a high bank, then down the shore */
const highBank = (): Lay => {
  const m = 'm';
  return {
    // (the high bank 236-240 px up: past a double jump, inside the bounce's climb (the verdicts' bounce band; World 1's bounceWall,
    //  w1.ts gBounceWall, 225-240), then three plain hops back down the shore)
    pieces: [bank('a', null, 340), spring(m, 'a', 0.72), { ...shore('w', 'a', 360, [-240, -236]), landing: true, block: 'bounce', from: m }, shore('b', 'w', 280, [76, 80]), shore('c', 'b', 280, [76, 80]), shore('z', 'c', 320, [76, 82])],
    sockets: [petal('pw', 'w', 0.5)],
  };
};
/** [L] beat 8, both ways at once: a river with him to a reed islet, then the eddy back at him; the flag before */
const bothWays = (easy: boolean): Lay => ({
  pieces: [bank('a', null, 360), bank('b', 'a', 300), river('i', 'b', easy ? 'twinWith21Easy' : 'twinWith21', 240), river('c', 'i', easy ? 'twinBack21Easy' : 'twinBack21', 360), bank('z', 'c', 300)],
  sockets: [flag('a'), petal('pz', 'z', 0.5)],
});
/** [Pf] beat 9, the jetty: the reed islet's bank, then the old jetty planks out to the last river */
const theJetty = (): Lay => ({
  pieces: [bank('a', null, 320), shore('b', 'a', 300, UP), shore('c', 'b', 300, DOWN), jetty('z', 'c', 340)],
  sockets: [petal('pb', 'b', 0.5)],
});
/** [S] beat 10, the signature: the long log on the widest, calmest river, riding him all the way to the landing; the flag before */
const longLog = (): Lay => ({
  pieces: [bank('a', null, 360), bank('b', 'a', 300), river('c', 'b', 'long21', 400), bank('z', 'c', 300)],
  sockets: [flag('a'), petal('pc', 'c', 0.5)],
});
/** [R] a rest on the bank between beats: a hop up and down the shore */
const rest: Lay = {
  pieces: [bank('a', null, 320), shore('b', 'a', 260, UP), shore('c', 'b', 340, DOWN), rock('rc', 'c', 0.5), shore('d', 'c', 260, UP), shore('z', 'd', 320, DOWN)],
  sockets: [],
};

/** THE ARC'S BRICKS (2-1.md), one job each: the graph's letter in brackets */
export const BEATS_21: SectionTemplate[] = [
  brick({ id: 'edge', name: "the canopy's edge", jobs: ['arrive'], difficulty: 1, content: 'structural', phases: ['start'], versions: [{ id: 'edge', lay: arrival }] }),
  brick({ id: 'down', name: 'down on three lianas', jobs: ['test'], difficulty: 3, content: 'rope', versions: [{ id: 'lianas', lay: down(false), easy: down(true) }] }),
  brick({ id: 'first-log', name: 'the first log, safe', jobs: ['teach'], difficulty: 1, content: 'water', teaches: RIVER, versions: [{ id: 'ride', lay: firstLog(false), easy: firstLog(true) }] }),
  brick({ id: 'bank', name: 'stones and stumps along the bank', jobs: ['practise'], difficulty: 2, content: 'ground', versions: [{ id: 'shore', lay: theBank() }] }),
  brick({ id: 'deep', name: 'log to log, for real', jobs: ['practise'], difficulty: 4, content: 'water', uses: [RIVER], versions: [{ id: 'deep', lay: deepRiver(false), easy: deepRiver(true) }] }),
  brick({ id: 'creek', name: 'a liana over a creek', jobs: ['practise'], difficulty: 2, content: 'rope', versions: [{ id: 'liana', lay: creekLiana() }] }),
  brick({ id: 'back', name: 'the river runs back', jobs: ['twist'], difficulty: 5, content: 'water', uses: [RIVER], versions: [{ id: 'back', lay: backRiver(false), easy: backRiver(true) }] }),
  brick({ id: 'high-bank', name: 'up the high bank', jobs: ['practise'], difficulty: 2, content: 'bounce', versions: [{ id: 'spring', lay: highBank() }] }),
  brick({ id: 'both-ways', name: 'both ways at once', jobs: ['finale'], difficulty: 6, content: 'water', uses: [RIVER], versions: [{ id: 'twin', lay: bothWays(false), easy: bothWays(true) }] }),
  brick({ id: 'jetty', name: 'the reed islet and the old jetty', jobs: ['practise'], difficulty: 1, content: 'floating', versions: [{ id: 'jetty', lay: theJetty() }] }),
  brick({ id: 'long-log', name: 'the long log', jobs: ['signature'], difficulty: 3, content: 'water', uses: [RIVER], versions: [{ id: 'long', lay: longLog() }] }),
  brick({ id: 'rest', name: 'a rest on the bank', jobs: ['rest'], difficulty: 1, content: 'structural', phases: ['rest'], maxPerStage: 6, versions: [{ id: 'shore', lay: rest }] }),
];

/** [E] beat 11, the village gate: Dot's `village` line on the way in, her `mark` at the gate */
export const EXIT_21: SectionTemplate = {
  id: 'w2-21-gate', name: 'the village gate', feel: [STAGE_21], own: true, archetypes: 'any', phases: ['goal'], difficulty: 1, needs: ['walk'], jobs: ['exit'], content: 'structural', terrain: 'river-bank',
  pieces: [{ key: 'in', shape: 'bank', w: [340, 340], place: { kind: 'start' }, style: 'log', main: true, landing: true }],
  subBlocks: [{ id: 'body', versions: [{ id: 'gate', pieces: [{ key: 'out', shape: 'bank', w: [580, 600], place: { kind: 'walk', after: 'in', dy: [0, 0] }, style: 'log', main: true, landing: true }], sockets: [tip('t-village', 'in', 0.3, 'village'), { id: 'exit-totem', role: 'objective', on: 'out', t: 0.85, allow: ['exit_totem'] }] }] }],
  entry: { piece: 'in', kind: 'ground' }, exit: { piece: 'out', kind: 'ground' }, exitDy: 0, sockets: [tip('t-mark', 'out', 0.6, 'mark')], mirrorable: false,
} as SectionTemplate;

/** every section that is 2-1's own */
export const SECTIONS_21: SectionTemplate[] = [...BEATS_21, EXIT_21];

/**
 * World 2's kit with 2-1's rows over it (stageTable.ts kit 'w2-21', listed.ts KITS): its pool is its own sections alone; it swings
 * (withSwing: the lianas); 2-1's river table; its graph and brief; the keeper's lines as the kit's tips. 2-2 keeps World 2's own kit.
 */
export function kitLib21(): WorldKit {
  const k = withSwing(w2World()), M = k.manifest, G = M.graphs!;
  return { ...k,
    manifest: { ...M,
      sections: SECTIONS_21,
      rivers: RIVERS_21,
      lessons: { ...M.lessons, swing: '1-6' },
      required: {},
      tips: { ...M.tips, ...Object.fromEntries((Object.keys(LINES_21) as Array<keyof typeof LINES_21>).map((key) => [lineId21(key), LINES_21[key]])) },
      teachTips: [...(M.teachTips ?? []), ...TEACH_21.map(lineId21)],
      graphs: { ...G, list: [...G.list.filter((g) => g.archetype !== 'sprint'), ...Object.entries(ARC_21).map(([id, code]) => ({ id, archetype: 'sprint' as const, code }))], briefs: { ...G.briefs, [STAGE_21]: BRIEF_21 } },
    } } as WorldKit;
}
