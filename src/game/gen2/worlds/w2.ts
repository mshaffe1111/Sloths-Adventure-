/**
 * gen2/worlds/w2 — World 2, the Sunlit Riverbank, for the new generator (ENG-W2, 11-14): the world's kit every World 2 level is rolled
 * from (stageTable.ts kit 'w2', listed.ts KITS), its look by world data, and its finish. WORLD DATA (generalitycheck EXEMPT): every fact
 * here is World 2's; the code that reads it names no stage.
 *
 * THE WORLD'S RULE (reference/design/2-1.md, river.ts): the river is the road. Water lies between the banks. In World 2's data:
 *   - a gap a section marks `water: true` is a DEEP river: a fall costs a life on both settings (Matt's rule for water, Dot warns first:
 *     the pipeline's WATER_WARN, with the story keeper's line, W2_TIPS.water);
 *   - every other gap (the world's falls are soft, so the stitcher's seams and a section's plain gaps) is a SPLASH-BACK river: he
 *     splashes and is set back on the bank he left, nothing lost (river.ts RiverZone.safe, the teaching river of the hand-built 2-1).
 *   w2Finish turns each of the built stage's falls into its RiverZone (the painted river, riverArt.ts drawRiverWater; the engine's
 *   splash), so the look and the rule come from the same falls the verdicts judged.
 *
 * THE ART (the inventory, src/game/art/inventory.ts, reference/art/CATALOG-MASTER.csv): every piece the kit lays is drawn by World 2's
 * painted kit (w2.webp: the banks' fill, wall and bank end; its boulders) or the river art (w2-props.webp: the water, the reeds), as
 * the engine draws them for world 2 (terrain.ts footingsFor). W2_ART names the inventory rows; w2.test.ts holds every one in the World 2
 * inventory, usable, inside its scale against Pokey (89.1 px, R-165.107), and every rolled piece drawn by World 2's own art.
 *   - a bank: World 2's earth bank, 90 px deep (the hand-built world's BANK_H), its top on the floor line;
 *   - a rock to hop: World 2's boulder, the kit's painted rock (a moss stone exactly 50 px tall), never under 50 (a smaller one is walked
 *     over, no beat);
 *   - a stepping stone in the river: a bank 120-150 px wide standing in the water (the hand-built creek's stones, 124-144 px).
 *
 * THE STAGES' ARCS. 2-1 is built as designed (w2Arc21.ts, BUILD-21, its own kit 'w2-21' over this one); 2-2 is rolled here on a PLACEHOLDER arc (ENG-W2 (1): the foundation, not the levels): one bank road with
 * splash-back and deep rivers, its beats in the designed order, so the rows roll and list and the next builder changes data only. The
 * designed levels (reference/design/2-1.md, 2-2.md) replace W2_ARCS' bricks when they are built (w2Arc21.ts, w2Arc22.ts), and the river
 * with its drifting logs is a section of its own (gen2/riverLay.ts).
 */
import { G } from '../../protoStage.ts';
import { surfaceBelowBank, type RiverZone } from '../../river.ts';
import type { W2Decor } from '../../riverArt.ts';
import type { Platform } from '../../types.ts';
import type { Difficulty, GraphBrief, NodeJob, SectionPiece, SectionTemplate, Socket, WorldKit, WorldManifest } from '../types.ts';
import { hash01 } from '../stillLay.ts';
import type { RiverRow } from '../riverLay.ts';
import type { PadRow } from '../rideLay.ts';
import { W1_KIT } from './w1.ts';
import { W1_LIANA_GAP } from './w1Swing.ts';

/** World 2's ground: the floor line, a bank's depth (the hand-built world's BANK_H) and how deep a splash-back river's bed lies */
export const W2_GROUND = { y: G, bankH: 90, pitDepth: 110 } as const;
type R2 = [number, number];

/**
 * The inventory rows World 2's pieces are drawn as (src/game/art/inventory/w2.json; the engine's World 2 kit painter and river art draw
 * them for world 2): by the piece's job. w2.test.ts holds each row in the World 2 file, usable and in scale.
 */
export const W2_ART = {
  /** the earth bank: its fill, its wall, its end at the water (w2.webp kit frames) */
  bank: ['w2#fill', 'w2#wall', 'w2#bankEnd', 'w2#fill0', 'w2#fill1', 'w2#fill2', 'w2#fill3'],
  /** a rock to hop on the bank (the kit's boulder; a stump is the bank's other step) */
  rock: ['w2#boulder', 'w2#stump'],
  /** the river: the painted water strip and the reeds at a bank's edge (w2-props.webp) */
  water: ['w2-props#water'],
  reeds: ['w2-props#reedTall', 'w2-props#reedShort', 'w2-props#reedLean'],
  /** the sign at a deep river's edge (proto.gen2.waterWarnings) */
  sign: ['water-signs#sign-jungle'],
} as const;

/** the lessons World 2's placeholder arcs teach (a section's `teaches`, a brief's): 2-1 the river, 2-2 the stepping stones */
export const W2_LESSON = { river: 'river', stones: 'stones' } as const;

/**
 * Dot's words in World 2's kit: the story keeper's only (level.md rule 17). `water` is the keeper's approved 2-1 line for the deep river
 * (reference/story/lines-2-1.md `deep`, t-story@50da9e58, approved about 8:20 PM ET 11-14): the pipeline says it before the first deep
 * river (WATER_WARN), as Dot's warning before water in every world. w2.test.ts holds it equal to the keeper's file's words.
 */
export const W2_TIPS: Record<string, string> = {
  water: 'This river\'s deep. Stay on the logs!',
};

/**
 * World 2's rivers as rows (gen2/riverLay.ts RiverRow), from river.ts's recipes (riverRecipes: World 2's speeds 70-120 px/s, logs 125-170
 * px) and 2-1.md's beats: the river section lays one of these between two banks. `ride` the first log, slow, with him, a splash puts him
 * back (2-1 beat 2); `deep` log to log for real (beat 4); `back` a river flowing back at him, its logs closer (beat 6, river.ts gapFor's
 * 80 px as the hand-built 2-1's); `twin` the faster pair at 80 px/s (beat 8); `long` the widest, calmest river and its one long log (beat
 * 10, the signature: its log half as long again as a deep river's, at 80 px/s so a log still comes every 3.9 s, RIVER_LAY.beat). Every
 * row lays fault-free (riverLay.test.ts). The designer tunes the numbers; the rows are the data a river section reads.
 */
export const W2_RIVERS = {
  ride: { dir: 1, speed: 70, logW: 170, logs: 3, safe: true },
  deep: { dir: 1, speed: 75, logW: 160, logs: 3 },
  back: { dir: -1, speed: 70, logW: 150, logs: 2, gap: 80 },
  twin: { dir: 1, speed: 80, logW: 150, logs: 3 },
  long: { dir: 1, speed: 80, logW: 240, logs: 2 },
} as const satisfies Record<string, RiverRow>;

/**
 * World 2's pad table (ENG-22; place `pads` names a row; rideLay.ts layPads): 2-2's ponds, by its design (reference/design/2-2.md, the arc).
 * Starting rows for the 2-2 builder, each passing padFaults; the builder tunes them by data. Gaps: a tap hop's 83 px edge to edge in the
 * teach, up to a held jump's reach (PAD_FAIR.reach) after.
 */
export const W2_PADS = {
  /** beat 1: one big pad over shallow water at the bank: he stands, it shivers and sinks, he splashes back and watches it come up */
  first: { by: 'weight', pads: ['big'], gap: 60, safe: true },
  /** beat 2: three small pads one tap apart, a petal riding each: keep moving */
  hop: { by: 'weight', pads: ['small', 'small', 'small'], gap: 70, safe: true, petals: [0, 1, 2] },
  /** beat 4: small pads out to a far stone and its petal (the far piece), and back over the same pads once they are up again */
  back: { by: 'weight', pads: ['small', 'small'], gap: 80, safe: true },
  /** beat 6, the twist: the pond breathes; every pad on one breath (2-2.md: up 1.8 s, shiver 0.6 s, under 0.6 s), crossed on the up, two
   *  pads at a time with a stone between (a run of pads must be crossed inside one breath: padFaults) */
  breath: { by: 'beat', pads: ['small', 'small', 'stone', 'small', 'small'], gap: 70, beat: { up: 1.8, shiver: 0.6, under: 0.6 } },
  /** beats 9 and 12: deep water, held jumps between the sizes */
  deep: { by: 'weight', pads: ['small', 'big', 'small'], gap: 120, petals: [0, 2] },
} as const satisfies Record<string, PadRow>;

// ───────────────────────────── World 2's lianas (BUILD-21; as w1Swing.ts is World 1's) ─────────────────────────────
/**
 * World 2's liana row (reference/design/2-1.md beats 1 and 5: down out of the canopy on three lianas, then one over a side creek): the
 * self-swinging liana World 1 taught (1-6), laid by World 2's data. A liana hangs from a riverside tree, its anchor 400-420 px over the bank
 * it leaves (1-6.md's measured liana); each gap is World 1's (W1_LIANA_GAP: the grip dial and the share of the pipeline's perch band, never a
 * px number of the engine's), SHORT and LONG only (FAR's narrow perch is World 1's snake beat). The perch is a World 2 BANK (the earth bank,
 * its own look; never World 1's bough), level, or a step lower for a descent (`dy`: each let-go lands by a plain fall onto a wide bank, D46).
 * The gap under a liana is the world's soft fall, so w2Finish makes it a splash-back creek: a miss costs nothing. A kit that lays these adds
 * the swing move (w1Swing.ts withSwing), as World 1's 1-6 does.
 */
export const W2_LIANA = { top: [400, 420] as R2, gaps: { short: W1_LIANA_GAP.short, long: W1_LIANA_GAP.long } } as const;
export type W2LianaGap = keyof typeof W2_LIANA.gaps;
/** a liana past `after`'s end, hung from a riverside tree 400-420 px over it, its reach checked at the gap's grip */
export const w2Liana = (key: string, after: string, gap: W2LianaGap): SectionPiece => {
  const grip = (W2_LIANA.gaps[gap] as { grip?: 'low' | 'high' }).grip;
  return { key, shape: 'liana', w: [0, 0], place: { kind: 'swing', after, top: W2_LIANA.top, ...(grip ? { grip } : {}) } };
};
/** the bank a liana throws him onto, `w` wide, at the gap's share of its band, `dy` under the bank he left (a descent) or level */
export const w2Perch = (key: string, liana: string, gap: W2LianaGap, w: number, dy: R2 = [0, 0]): SectionPiece =>
  ({ key, shape: 'bank', w: [w, w], place: { kind: 'land', after: liana, dy, share: W2_LIANA.gaps[gap].share }, style: 'log', main: true, landing: true });

// ───────────────────────────── the pieces ─────────────────────────────
/** a bank he walks on, `w` exact, level with the one before (or the section's first) */
const bank = (key: string, after: string | null, w: number): SectionPiece => ({ key, shape: 'bank', w: [w, w], place: after ? { kind: 'walk', after, dy: [0, 0] } : { kind: 'start' }, style: 'log', main: true });
/** a bank a step up or down the shore (the quiet line wants a hop at each end of a rest: listRules quietJudge) */
const UP: R2 = [-56, -50], DOWN: R2 = [50, 56];
const shore = (key: string, after: string, w: number, dy: R2): SectionPiece => ({ ...bank(key, after, w), place: { kind: 'walk', after, dy } });
/** a bank past a splash-back river (a soft gap: w2Finish makes it a safe river) */
const creek = (key: string, after: string, w: number, share: R2 = [0.5, 0.55]): SectionPiece => ({ key, shape: 'bank', w: [w, w], place: { kind: 'jump', after, dy: [0, 0], share, soft: true }, style: 'log', main: true, landing: true });
/** a bank past a deep river (`water: true`: a fall costs a life, Dot warns before the first) */
const deep = (key: string, after: string, w: number, share: R2 = [0.38, 0.42]): SectionPiece => ({ key, shape: 'bank', w: [w, w], place: { kind: 'jump', after, dy: [0, 0], share, water: true }, style: 'log', main: true, landing: true });
/** a stepping stone in a river: a narrow bank standing in the water, past a gap of the river's kind */
const stone = (key: string, after: string, isDeep: boolean, w = 136): SectionPiece => ({ ...(isDeep ? deep(key, after, w, [0.34, 0.38]) : creek(key, after, w, [0.45, 0.5])), style: 'moss_stone' });
/** a rock to hop on `on` at `at`: World 2's boulder, the kit's painted rock, which is a moss stone exactly 50 px tall (terrain.ts footingOf;
 *  51-56 px draws as a stone pillar, a 34-40 px rock is walked over with no hop) */
const rock = (key: string, on: string, at: number): SectionPiece => ({ key, shape: 'block', w: [110, 120], place: { kind: 'on', on, at: [at, at], h: [50, 50] }, style: 'moss_stone', landing: true });

const petals = (id: string, on: string, t: R2 | number, n = 1, span = 80): Socket => ({ id, role: 'pickup', on, t, dn: 34, count: n, span });
const flag = (on: string, t = 0.3): Socket => ({ id: 'flag', role: 'flag', on, t });

// ───────────────────────────── a brick ─────────────────────────────
type Lay = { pieces: SectionPiece[]; sockets: Socket[] };
type V = { id: string; lay: Lay; easy?: Lay };
type Content = 'ground' | 'water';
/** a brick (1-7's form, w1Arc17.ts): its first piece `in`, its last `out` (both banks on the floor line), a version's Easy twin beside it,
 *  served to `stage` alone (its feel), once a stage */
function brick(stage: string, o: { id: string; name: string; jobs: NodeJob[]; difficulty: number; content: Content | 'structural'; teaches?: string; uses?: string[]; versions: V[]; phases?: SectionTemplate['phases']; maxPerStage?: number }): SectionTemplate {
  const ren = (ps: SectionPiece[]) => { const a = ps[0].key, z = ps[ps.length - 1].key; const f = (s: string) => (s === a ? 'in' : s === z ? 'out' : s); return ps.map((p) => ({ ...p, key: f(p.key), place: Object.fromEntries(Object.entries(p.place).map(([q, v]) => [q, (q === 'after' || q === 'on') && typeof v === 'string' ? f(v) : v])) as SectionPiece['place'] })); };
  const sk = (ps: SectionPiece[], ss: Socket[]) => { const a = ps[0].key, z = ps[ps.length - 1].key; return ss.map((s) => ({ ...s, on: s.on === a ? 'in' : s.on === z ? 'out' : s.on })); };
  const first = ren(o.versions[0].lay.pieces)[0];
  const versions = o.versions.flatMap((v) => [
    { id: v.id, pieces: ren(v.lay.pieces).slice(1), sockets: sk(v.lay.pieces, v.lay.sockets), ...(v.easy ? { easy: `${v.id}-easy` } : {}) },
    ...(v.easy ? [{ id: `${v.id}-easy`, pieces: ren(v.easy.pieces).slice(1), sockets: sk(v.easy.pieces, v.easy.sockets), easyOnly: true }] : []),
  ]);
  return {
    id: o.id, name: o.name, feel: [stage], own: true, archetypes: 'any', phases: o.phases ?? ['ki', 'sho', 'ten', 'ketsu'], difficulty: o.difficulty, needs: ['jump'],
    ...(o.teaches ? { teaches: o.teaches } : {}), uses: o.uses ?? [], jobs: o.jobs, content: o.content, terrain: 'river-bank', maxPerStage: o.maxPerStage ?? 1,
    pieces: [first], subBlocks: [{ id: 'body', versions }], entry: { piece: 'in', kind: 'ground' }, exit: { piece: 'out', kind: 'ground' }, exitDy: 0, sockets: [], mirrorable: false,
  } as SectionTemplate;
}

// ───────────────────────────── the placeholder arcs ─────────────────────────────
/**
 * Each stage's ONE placeholder graph, `A T R P R X R M R S R L E` (the beats in the designed order, one brick a job): A the arrival, T
 * the lesson safe (splash-back rivers), P the bank road, X the first deep river (a flag before it), M along the shore, S the stage's
 * signature, L the finale, E the exit, R a rest between. The content mix (V11, on the realised code: 4 content nodes T P X M, cap 2):
 * water T and X, ground P and M, never two alike side by side (S and L are never content).
 */
export const W2_ARCS: Record<string, { graph: string; archetype: 'sprint' | 'harvest'; lesson: string }> = {
  // (2-1 is built as designed: w2Arc21.ts, its own kit 'w2-21' (BUILD-21, 11-15); its placeholder arc is gone, new replaces old)
  '2-2': { graph: 'A T R P R X R M R S R L E', archetype: 'harvest', lesson: W2_LESSON.stones },
};

/** a stage's brief, all of it data (2-1's petals are few: the keeper's ruling 2, Meeca spent hers on the king's crown) */
export function w2Brief(stage: string): GraphBrief {
  const a = W2_ARCS[stage];
  return {
    ends: 'finale', trend: 'level', branching: 'none', teaches: [a.lesson], deal: { water: 50, ground: 50 }, dealExact: true, tags: true,
    // (a sprint's petals are FEW, the keeper's number for 2-1 (R-165.263): 'few' holds all 'low' does until the fill honours its count)
    ...(a.archetype === 'sprint' ? { petals: 'few' as const } : {}),
  };
}

/** the bricks of one stage's placeholder arc, its own (rule 9: their ids and feel are the stage's) */
export function w2Bricks(stage: string): SectionTemplate[] {
  const a = W2_ARCS[stage];
  const harvest = a.archetype === 'harvest';
  const id = (beat: string) => `w2-${stage}-${beat}`;
  const B = (o: Parameters<typeof brick>[1]) => brick(stage, { ...o, id: id(o.id) });
  // (a harvest's petals ride its banks; a sprint's are FEW (the keeper's ruling 2: Meeca spent hers on the king's crown): one at each
  //  beat's far bank, none on the way)
  const p = (sid: string, on: string, t: number, n: number): Socket[] => (harvest ? [petals(sid, on, t, n + 1, 120)] : sid === 'pz' ? [petals(sid, on, t, 1)] : []);
  const teach: Lay = {
    pieces: [bank('a', null, 360), rock('ra', 'a', 0.5), bank('b', 'a', 300), creek('c0', 'b', 340), rock('r0', 'c0', 0.5), bank('b2', 'c0', 300), stone('s1', 'b2', false), stone('s2', 's1', false), creek('c', 's2', 360), rock('rc', 'c', 0.5), bank('d', 'c', 300), creek('e', 'd', 340), creek('z', 'e', 360)],
    sockets: [...p('pa', 'a', 0.5, 1), ...p('ps', 's2', 0.5, 1), ...p('pd', 'd', 0.5, 1), ...p('pz', 'z', 0.5, 2)],
  };
  const road = (easy: boolean): Lay => ({
    pieces: [bank('a', null, 320), bank('b', 'a', 300), rock('rb', 'b', 0.5), shore('c', 'b', 300, UP), shore('d', 'c', 340, DOWN), rock('rd', 'd', 0.55), creek('e', 'd', easy ? 320 : 280), shore('f', 'e', 300, UP), shore('g', 'f', 320, DOWN), rock('rg', 'g', 0.5), creek('h', 'g', 300), creek('z', 'h', 340)],
    sockets: [...p('pa', 'a', 0.6, 1), ...p('pc', 'c', 0.5, 1), ...p('pe', 'e', 0.5, 1), ...p('pz', 'z', 0.4, 2)],
  });
  const firstDeep = (easy: boolean): Lay => ({
    pieces: [bank('a', null, 340), bank('b', 'a', 320), rock('rb', 'b', 0.45), stone('s1', 'b', true), ...(easy ? [] : [stone('s2', 's1', true)]), deep('c', easy ? 's1' : 's2', 340), rock('rc', 'c', 0.5), bank('d', 'c', 300), deep('e', 'd', 300), stone('s3', 'e', true), deep('f', 's3', 320), creek('z', 'f', 340)],
    sockets: [flag('a'), ...p('pb', 'b', 0.5, 1), ...p('ps', 's1', 0.5, 1), ...p('pd', 'd', 0.5, 1), ...p('pz', 'z', 0.5, 2)],
  });
  const signature = (easy: boolean): Lay => ({
    pieces: [bank('a', null, 340), bank('a2', 'a', 300), rock('ra', 'a2', 0.45), deep('b', 'a2', 300), stone('s1', 'b', true), stone('s2', 's1', true), ...(easy ? [] : [stone('s3', 's2', true)]), deep('c', easy ? 's2' : 's3', 340), rock('rc', 'c', 0.5), bank('d', 'c', 300), deep('e', 'd', 300), stone('s4', 'e', true), deep('f', 's4', 320), creek('z', 'f', 340)],
    sockets: [flag('a'), ...p('pb', 'b', 0.5, 1), ...p('ps', 's2', 0.5, 1), ...p('pc', 'c', 0.5, 1), ...p('pz', 'z', 0.5, 2)],
  });
  const finale = (easy: boolean): Lay => ({
    pieces: [bank('a', null, 320), shore('b', 'a', 300, UP), rock('rb', 'b', 0.5), shore('c', 'b', 320, DOWN), creek('d', 'c', 300), stone('s1', 'd', false), creek('e', 's1', easy ? 340 : 300), shore('f', 'e', 300, UP), shore('g', 'f', 340, DOWN), rock('rg', 'g', 0.5), deep('h', 'g', 320), shore('z', 'h', 360, UP)],
    sockets: [flag('a'), ...p('pb', 'b', 0.5, 1), ...p('pd', 'd', 0.5, 1), ...p('pf', 'f', 0.5, 1), ...p('pz', 'z', 0.5, 2)],
  });
  const along = (easy: boolean): Lay => ({
    pieces: [bank('a', null, 320), shore('b', 'a', 320, UP), rock('rb', 'b', 0.5), shore('c', 'b', 300, DOWN), creek('d', 'c', 300), rock('rd', 'd', 0.5), shore('e', 'd', 300, UP), creek('f', 'e', easy ? 320 : 300), shore('g', 'f', 340, DOWN), rock('rg', 'g', 0.55), bank('h', 'g', 300), creek('z', 'h', 340)],
    sockets: [...p('pa', 'a', 0.5, 1), ...p('pc', 'c', 0.5, 1), ...p('pe', 'e', 0.5, 1), ...p('pg', 'g', 0.3, 1), ...p('pz', 'z', 0.5, 2)],
  });
  const arrival: Lay = {
    pieces: [bank('a', null, 420), bank('b', 'a', 360), rock('rb', 'b', 0.5), shore('c', 'b', 300, UP), shore('d', 'c', 340, DOWN), rock('rd', 'd', 0.5), bank('e', 'd', 320), shore('f', 'e', 300, UP), shore('z', 'f', 380, DOWN), rock('rz', 'z', 0.55)],
    sockets: [...p('pc', 'c', 0.5, 1), ...p('pz', 'z', 0.5, 1)],
  };
  const rest: Lay = {
    pieces: [bank('a', null, 320), shore('b', 'a', 240, UP), shore('c', 'b', 360, DOWN), rock('rc', 'c', 0.5), shore('d', 'c', 240, UP), shore('e', 'd', 340, DOWN), shore('f', 'e', 240, UP), shore('z', 'f', 320, DOWN)],
    sockets: [...p('pc', 'c', 0.3, 1), ...p('pz', 'z', 0.5, 1)],
  };
  const uses = [a.lesson];
  return [
    B({ id: 'arrival', name: 'down to the riverbank', jobs: ['arrive'], difficulty: 1, content: 'structural', phases: ['start'], versions: [{ id: 'bank', lay: arrival }] }),
    B({ id: 'teach', name: 'the river, safe: a splash puts him back', jobs: ['teach'], difficulty: 1, content: 'water', teaches: a.lesson, versions: [{ id: 'creek', lay: teach }] }),
    B({ id: 'road', name: 'the bank road', jobs: ['practise'], difficulty: 2, content: 'ground', uses, versions: [{ id: 'shore', lay: road(false), easy: road(true) }] }),
    B({ id: 'deep', name: 'the first deep river', jobs: ['test'], difficulty: 3, content: 'water', uses, versions: [{ id: 'stones', lay: firstDeep(false), easy: firstDeep(true) }] }),
    B({ id: 'along', name: 'along the shore', jobs: ['flow'], difficulty: 3, content: 'ground', uses, versions: [{ id: 'shore', lay: along(false), easy: along(true) }] }),
    B({ id: 'signature', name: 'the wide river on its stones', jobs: ['signature'], difficulty: 4, content: 'water', uses, versions: [{ id: 'stones', lay: signature(false), easy: signature(true) }] }),
    B({ id: 'finale', name: 'up the shore to the end', jobs: ['finale'], difficulty: 4, content: 'ground', uses, versions: [{ id: 'shore', lay: finale(false), easy: finale(true) }] }),
    B({ id: 'rest', name: 'a rest on the bank', jobs: ['rest'], difficulty: 1, content: 'structural', phases: ['rest'], maxPerStage: 6, versions: [{ id: 'shore', lay: rest }] }),
    {
      id: id('exit'), name: 'the far bank', feel: [stage], own: true, archetypes: 'any', phases: ['goal'], difficulty: 1, needs: ['walk'], jobs: ['exit'], content: 'structural', terrain: 'river-bank',
      pieces: [{ key: 'in', shape: 'bank', w: [300, 340], place: { kind: 'start' }, style: 'log', main: true, landing: true }],
      subBlocks: [{ id: 'body', versions: [{ id: 'bank', pieces: [{ key: 'out', shape: 'bank', w: [560, 600], place: { kind: 'walk', after: 'in', dy: [0, 0] }, style: 'log', main: true, landing: true }], sockets: [petals('pout', 'out', 0.3, 1), { id: 'exit-totem', role: 'objective', on: 'out', t: 0.85, allow: ['exit_totem'] }] }] }],
      entry: { piece: 'in', kind: 'ground' }, exit: { piece: 'out', kind: 'ground' }, exitDy: 0, sockets: [], mirrorable: false,
    } as SectionTemplate,
  ];
}

// ───────────────────────────── the manifest and the kit ─────────────────────────────
/** the stages World 2's kit rolls (each with its arc and its bricks) */
export const W2_GEN2_STAGES = Object.keys(W2_ARCS);

/**
 * World 2's manifest. The planner's tempo (rollRanges) is World 1's measured one until a World 2 level is flown on its own (the builder's
 * dial); World 1's floor roll, pit painter and catch boughs are its canopy's and are not World 2's. Moves: everything World 1 taught.
 */
export function w2Manifest(): WorldManifest {
  return {
    world: 2, name: 'Sunlit Riverbank',
    moves: ['double', 'climb', 'swing'],
    ground: { y: W2_GROUND.y, bankH: W2_GROUND.bankH, style: 'log' },
    pit: 'soft', pitDepth: W2_GROUND.pitDepth,
    rollRanges: W1_KIT.rollRanges,
    corridor: { top: G - 400, bottom: G + 80, soft: 60 },
    themeShare: [1, 1],
    graphs: {
      list: W2_GEN2_STAGES.map((s) => ({ id: `w2-${s}-arc`, archetype: W2_ARCS[s].archetype, code: W2_ARCS[s].graph })),
      briefs: Object.fromEntries(W2_GEN2_STAGES.map((s) => [s, w2Brief(s)])),
      terrains: ['river-bank'],
      chunkSeconds: 60,
      maxPerStage: 1,
    },
    creatures: [], props: [], pairs: [], decor: [],
    flowers: ['lotus', 'hibiscus'],
    sections: W2_GEN2_STAGES.flatMap(w2Bricks),
    handBuilt: [],
    // (2-2 rolls after 2-1: the river is 2-1's lesson; World 1's moves were all taught in World 1)
    lessons: { jump: '1-1', double: '1-1', bounce: '1-1', climb: '1-4', creak: '1-5', swing: '1-6', [W2_LESSON.river]: '2-1' },
    tips: W2_TIPS,
    required: {},
  };
}

/** World 2's kit: its manifest, no props or creatures to emit (2-1's cast is none; World 2's animals come with the stages that lay them) */
export function w2World(): WorldKit {
  return { manifest: w2Manifest(), emit: {} };
}

// ───────────────────────────── the finish: the rivers ─────────────────────────────
type FinishStage = {
  platforms: Platform[];
  rivers?: RiverZone[];
  gen2?: { falls?: Array<{ x0: number; x1: number; y: number; kind: string; site?: string }>; seed?: number };
  proto?: { decor?: W2Decor[] };
};

/** reeds this far from a river's edge, either bank (px; the hand-built world's 10-30), on a bank this wide or more (a stone has none) */
const REED_OFF = 20;
/** how far under a fall's height (its higher lip) the other lip may stand and still be its bank (px): a liana perch's highest rise over
 *  the bank it leaves (pipeline place 'land': raised up to 160), and some */
const LIP_RISE = 170;
const REED_BANK = 200;

/**
 * World 2's finish (listed.ts BASE 'w2', run where World 1's runs w1Finish): every fall of the built stage becomes its river between the
 * two banks (RiverZone, x0 the near bank's end, x1 the far bank's start, the surface `surfaceBelowBank` under the banks' lower top): a
 * deep (water) fall a river that costs a life; a soft fall a SPLASH-BACK river (`safe`: set back on the near bank, 70 px from the edge,
 * as the hand-built 2-1's), its soft pit's bed and steps taken out (the splash sets him back before he reaches them; a bank standing in
 * the water would be drawn over it). Reeds stand behind him at each river's edge on a bank (riverArt.ts reeds; none on a stepping stone). A fall with no bank at each end throws: such
 * a roll is never listed. Calling it twice changes nothing.
 */
export function w2Finish<T extends FinishStage>(st: T, _difficulty?: Difficulty): T {
  const falls = st.gen2?.falls;
  if (!falls) return st;
  const solids = st.platforms.filter((p) => p.type === 'solid');
  // (a fall that already has its river (the log rivers gen2 laid, place `river`; or one this finish made before) is left as it is: so a
  //  stage of log rivers keeps them, and calling it twice changes nothing)
  const had = st.rivers ?? [];
  const rivers: RiverZone[] = [...had];
  const decor = ((st.proto ??= {}).decor ??= []);
  const drop = new Set<number>();
  const kinds = ['reedTall', 'reedShort', 'reedLean'] as const;
  const reeds = (near: Platform, far: Platform, x0: number, x1: number) => {
    for (const [x, b, bank] of [[x0 - REED_OFF, near.y + 6, near], [x1 + REED_OFF, far.y + 6, far]] as const) {
      // (behind him, never in front: a reed in front hid him on the bank's edge, ENG-W2's sideways still; and only on a real bank, never a
      //  stepping stone, whose two edges a reed each crowded; never twice at one edge)
      if (bank.width < REED_BANK || decor.some((d) => d.x === x && (kinds as readonly (string | undefined)[]).includes(d.n))) continue;
      const n = kinds[Math.floor(hash01(x, 41) * kinds.length)];
      decor.push({ n, x, b, w: n === 'reedTall' ? 64 : n === 'reedShort' ? 90 : 70, ...(hash01(x, 43) < 0.5 ? { flip: true } : {}) });
    }
  };
  // (the banks at each end of a fall or a river: a solid ending at x0 and one starting at x1, at its lips, the topmost of each. A lip may
  //  stand up to LIP_RISE under the fall's height: a liana's perch is laid up to 160 px over the bank it leaves (pipeline place 'land'),
  //  so the gap under a World 2 liana has its take-off bank that far below the perch, BUILD-21's 2-1)
  const banks = (x0: number, x1: number, y: number) => ({
    near: solids.filter((p) => Math.abs(p.x + p.width - x0) <= 2 && p.y <= y + LIP_RISE).sort((a, b) => a.y - b.y)[0],
    far: solids.filter((p) => Math.abs(p.x - x1) <= 2 && p.y <= y + LIP_RISE).sort((a, b) => a.y - b.y)[0],
  });
  // (a log river's reeds, as a fall's)
  for (const r of had) {
    if (r.speed === 0) continue;
    const { near, far } = banks(r.x0, r.x1, r.surfaceY - surfaceBelowBank);
    if (near && far) reeds(near, far, r.x0, r.x1);
  }
  for (const f of [...falls].sort((a, b) => a.x0 - b.x0)) {
    if (f.kind !== 'water' && f.kind !== 'soft') continue;
    if (had.some((r) => r.x0 < f.x1 - 1 && r.x1 > f.x0 + 1)) continue;
    const { near, far } = banks(f.x0, f.x1, f.y);
    if (!near || !far) throw new Error(`World 2 finish: the fall at x=${f.x0}-${f.x1} has no bank at one end`);
    const top = Math.max(near.y, far.y);
    const safe = f.kind === 'soft';
    if (safe) for (const p of solids) if (p !== near && p !== far && p.x >= f.x0 - 1 && p.x + p.width <= f.x1 + 1 && p.y > top) drop.add(p.id);
    rivers.push({ x0: f.x0, x1: f.x1, surfaceY: top + surfaceBelowBank, dir: 1, speed: 0, ...(safe ? { safe: { backX: f.x0 - 70, backY: near.y } } : {}) });
    reeds(near, far, f.x0, f.x1);
  }
  if (drop.size) st.platforms = st.platforms.filter((p) => !drop.has(p.id));
  st.rivers = rivers.sort((a, b) => a.x0 - b.x0);
  return st;
}
