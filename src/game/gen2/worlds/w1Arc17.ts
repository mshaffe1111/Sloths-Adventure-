/**
 * 1-7 A Very Good Bush, the level as DESIGNED (reference/design/1-7.md on t-1718-design; packet BUILD-17): World 1's rows for it.
 * ONE idea: when the eagle screams, get into the green and keep still. Taught safe in Dot's own bush, used along a road of bushes, turned
 * (bare bark hides nothing; moss anywhere does; never still on a creak; a mossy liana hides him swinging), then the eagle LANDS and looks,
 * then all of it in the light gap. WORLD DATA: no engine line names this stage; kitLib17 gives World 1's kit these rows, finish17 lays
 * what only the built stage can carry (the mossy lianas, the perched eagle, one eye over a beat's gaps), and the stage table lists it.
 *
 * THE HIDE RULE (1-7.md, decided first): the creature kit's only. A STILL sloth in cover is hidden (stillness.ts: under 25 px/s for 0.5 s,
 * Easy 0.35); in the open he is seen even still (seesStill). No crouch anywhere. Cover is World 1's still table (w1Cast.ts W1_STILL):
 * a bush, the moss carpet and patch, hanging moss, and a liana marked mossy (holding it is cover while it swings him).
 *
 * THE EYE: one kit eagle a watched stretch (stillLay.ts): a stretch runs from its watcher's bank over the banks walked on from it, ends at
 * a gap, and is cut to 120 px past its last hide. So every beat's watched ground ENDS IN A HOP (a small soft gap) before its far bank:
 * the next beat's watcher never shares a stretch with it (two watchers on one stretch make one). Where a beat's question is ACROSS a gap
 * (the creaky limb, the mossy lianas, the finale), finish17 joins the beat's stretches into one eye over all of it (W17_JOIN).
 *
 * THE PHONE (1-7.md "The phone both ways"): green at most 360 px apart on Normal (inside the 2.0 s warn's 570 px run) and 300 on Easy,
 * except bare bark (beat 5), 420 px between its two bushes, both inside the warn's run.
 */
import type { Difficulty, GraphBrief, NodeJob, PropDef, SectionPiece, SectionTemplate, Socket, StageSink, WorldKit } from '../types.ts';
import type { Enemy, Platform, Vine } from '../../types.ts';
import type { WatchZone } from '../../watcher.ts';
import { w1World } from './w1.ts';
import { W1_LIANA_GAP, w1Liana, withSwing, type LianaGap } from './w1Swing.ts';
import { eagleOver, w1Still } from './w1Cast.ts';
import { castWatches, clipWatches, STILL } from '../stillLay.ts';

/** the stage these rows are for: the tag its sections carry and the key of its brief */
export const STAGE_17 = '1-7';
type R2 = [number, number];

/** 1-7's ONE graph (1-7.md "The arc" `A T T P R X R P C R W R S R L E`, one job letter a brick): A Dot's bush, T the bush safe AND the
 *  leaves shake (1-7.md's two T beats are the same lesson; the graph keeps one teach a move (V2), so one brick lays both, each its own
 *  stretch), M red light green light (a flow node: the design's P, so the deal keeps the beats in order), R, X bare bark, R, P moss
 *  anywhere, C never still on a creak, R, W the mossy lianas, R, S the eagle lands, R, L the light gap, E her mark */
export const ARC_17: Record<string, string> = { 'bush-17-arc': 'A T M R X R P C R W R S R L E' };
/** 1-7's brief, all of it data. The content mix (V11: no type on more than 3 of the 7 content nodes, never two neighbours alike):
 *  ground the bush and bare bark; hazard the road of bushes, the moss and the finale; crumble the creak; rope the mossy lianas (S is
 *  never content) */
export const BRIEF_17: GraphBrief = {
  ends: 'finale', trend: 'level', branching: 'none', teaches: ['hide'], deal: { ground: 29, hazard: 43, crumble: 14, rope: 14 }, dealExact: true,
  tags: true,
  // (no petal arcs over the gaps: every petal is the stage's own socket on ground he walks, from the start (BUILD-16b's lesson))
  petals: 'low',
};

/** the story keeper's lines for 1-7, verbatim (reference/story/lines-1-7.md on t-keeper-17@a8dd2409, approved 12:27 PM ET 11-14; forwarded
 *  by the lead in the packet). The only player words this file holds; w1Arc17.test.ts holds each equal to the keeper's file */
export const LINES_17 = {
  /** Dot, beat 0, as he walks up to her bush (not a teach) */
  arrive: "That's MY bush, dent and all! And that far-off screech is an eagle.",
  /** teach, 800+ px before beat 1 */
  bush: "When the eagle screams, get in the green and keep still. Then it can't see you!",
  /** teach, 800+ px before beat 2 */
  shake: 'No wiggling in a bush! Shaking leaves give you away.',
  /** teach, 800+ px before beat 5 */
  bark: "Bare bark won't hide you, even if you're still. Get to the green!",
  /** teach, 800+ px before beat 7 */
  moss: 'Moss counts too! Any mossy spot is as good as my bush.',
  /** teach, 800+ px before beat 8 */
  creak: 'Never stop on a creaky limb! Cross it first, then hide.',
  /** teach, 800+ px before beat 10 */
  swing: 'A mossy liana hides you, swinging and all. Just hang on!',
  /** teach, 800+ px before beat 12 */
  lands: "It's landed! Watch its head, and move only while it looks away.",
  /** Dot at her mark, the exit */
  mark: 'Her mark! She walked right past my bush with her chin up.',
} as const;
/** Dot at a LOCKED 1-7 (the keeper's 9b): stagePlan.ts SEALED_LINES '1:stealth' (World 1's only stealth stage is 1-7) */
export const SEALED_17 = 'We left some of her petals behind. Sneak back for them!';
/** the stage's MISSION line (the keeper's 10): stagePlan's, held equal by w1Arc17.test.ts */
export const MISSION_17 = 'An eagle is watching. Hide in the green like Dot did, and collect her petals.';

// ───────────────────────────── the pieces ─────────────────────────────
/** a moss bank he walks on, `w` exact, level with the one before */
const bank = (key: string, after: string | null, w: number): SectionPiece => ({ key, shape: 'bank', w: [w, w], place: after ? { kind: 'walk', after, dy: [0, 0] } : { kind: 'start' }, style: 'moss_stone', main: true });
/** a bank past a small soft hop (a watched stretch ends at it: stillLay watchedRun) */
const hop = (key: string, after: string, w: number): SectionPiece => ({ key, shape: 'bank', w: [w, w], place: { kind: 'jump', after, dy: [0, 0], share: [0.3, 0.35], soft: true }, style: 'moss_stone', main: true, landing: true });
/** a limb over a soft gap: creaky (gives way 1.1 s after he lands; whole on a set-back) or, Easy, a sound bough */
const limb = (key: string, after: string, creak: boolean): SectionPiece => ({ key, shape: 'branch', w: [150, 160], place: { kind: 'jump', after, dy: [0, 0], share: [0.3, 0.35], soft: true }, style: 'branch', landing: true, ...(creak ? { creak: true } : { main: true }) });
/** a liana from `after` over a gap and the bank it throws him onto (1-6's World 1 liana rows: w1Swing.ts) */
function liana(key: string, after: string, gap: LianaGap, w = 300): SectionPiece[] {
  const G = W1_LIANA_GAP[gap];
  return [w1Liana(`${key}l`, after, gap), { key, shape: 'bank', w: [w, w], place: { kind: 'land', after: `${key}l`, dy: [0, 0], share: G.share, ...(G.window ? { window: G.window } : {}) }, style: 'moss_stone', main: true, landing: true }];
}

/** World 1's still props with each row's own id as a tag too, so a socket asks for exactly the cover the beat is designed with */
const HIDE = { bush: 'w1-hide-bush', wide: 'w1-hide-bush-wide', carpet: 'w1-hide-moss', patch: 'w1-hide-moss-patch', hang: 'w1-hide-moss-hang' } as const;
type Hide = keyof typeof HIDE;
const hide = (id: string, on: string, t: number, kind: Hide): Socket => ({ id, role: 'prop', on, t, allow: [HIDE[kind]] });
/** the eagle's watch socket at the start of `on` (stillLay watchSocket): ids starting 'teach' are its lessons (the long calm, the free
 *  first pass) */
const watch = (id: string, on: string, t = 0.03): Socket => ({ id, role: 'prop', on, t, allow: ['w1-eagle'] });
const petals = (id: string, on: string, t: R2 | number, n = 1, span = 80): Socket => ({ id, role: 'pickup', on, t, dn: 34, count: n, span });
const flag = (on: string, t = 0.3): Socket => ({ id: 'flag', role: 'flag', on, t });
/** a line's id in the kit: its own, `w17.<key>` (World 1's 'creak' and 'swing' are move lessons: a tip by those ids is never said here) */
export const lineId = (line: keyof typeof LINES_17): string => `w17.${line}`;
const tip = (id: string, on: string, t: number, line: keyof typeof LINES_17): Socket => ({ id, role: 'tip', on, t, allow: [lineId(line)] });
/** the watch sockets where the eagle is TAUGHT (its first pass free, the long calm): beats 1 and 2 */
export const LESSONS_17 = ['teach-bush', 'teach-shake'] as const;

// ───────────────────────────── a brick ─────────────────────────────
type Lay = { pieces: SectionPiece[]; sockets: Socket[] };
type V = { id: string; lay: Lay; easy?: Lay };
/** a brick (1-6's form): its first piece `in`, its last `out` (both moss banks on the floor line), a version's Easy twin beside it */
function brick(o: { id: string; name: string; jobs: NodeJob[]; difficulty: number; content: 'ground' | 'climb' | 'hazard' | 'crumble' | 'rope'; teaches?: string; versions: V[]; uses?: string[] }): SectionTemplate {
  const ren = (ps: SectionPiece[]) => { const a = ps[0].key, z = ps[ps.length - 1].key; const f = (s: string) => (s === a ? 'in' : s === z ? 'out' : s); return ps.map((p) => ({ ...p, key: f(p.key), place: Object.fromEntries(Object.entries(p.place).map(([q, v]) => [q, (q === 'after' || q === 'on') && typeof v === 'string' ? f(v) : v])) as SectionPiece['place'] })); };
  const sk = (ps: SectionPiece[], ss: Socket[]) => { const a = ps[0].key, z = ps[ps.length - 1].key; return ss.map((s) => ({ ...s, on: s.on === a ? 'in' : s.on === z ? 'out' : s.on })); };
  const first = ren(o.versions[0].lay.pieces)[0];
  const versions = o.versions.flatMap((v) => [
    { id: v.id, pieces: ren(v.lay.pieces).slice(1), sockets: sk(v.lay.pieces, v.lay.sockets), ...(v.easy ? { easy: `${v.id}-easy` } : {}) },
    ...(v.easy ? [{ id: `${v.id}-easy`, pieces: ren(v.easy.pieces).slice(1), sockets: sk(v.easy.pieces, v.easy.sockets), easyOnly: true }] : []),
  ]);
  const { versions: _v, uses, ...rest } = o;
  return { ...rest, feel: [STAGE_17], own: true, archetypes: 'any', phases: ['ki', 'sho', 'ten', 'ketsu'], needs: ['jump'], uses: o.teaches ? [] : (uses ?? ['hide']), terrain: 'raised-logs', maxPerStage: 1, pieces: [first], subBlocks: [{ id: 'body', versions }], entry: { piece: 'in', kind: 'ground' }, exit: { piece: 'out', kind: 'ground' }, exitDy: 0, sockets: [], mirrorable: false } as SectionTemplate;
}

// ───────────────────────────── the beats ─────────────────────────────
/** [T] beats 1 and 2, ONE brick (the same lesson): beat 1, the bush, safe: a walk in (the keeper's line was said 800+ px back, in the
 *  arrival), the screech, ONE bush a step away, the first pass free; its watched ground ends in a hop, where Dot says the shake line.
 *  Beat 2, the leaves shake, 800+ px on: a wide bush with a petal just past its far edge; reaching for it in the pass rustles the bush
 *  (moving in cover is not hidden): the eagle screeches and circles, free this once. Each beat its own stretch (each a lesson) */
function bushTeach(): Lay {
  return {
    pieces: [bank('a', null, 300), bank('w1', 'a', 360), bank('w2', 'w1', 340), hop('m', 'w2', 400), bank('n', 'm', 360), bank('o', 'n', 300), bank('s1', 'o', 300), bank('s2', 's1', 320), hop('z', 's2', 360)],
    sockets: [watch('teach-bush', 'w1'), hide('h1', 'w1', 0.62, 'bush'), petals('pa', 'a', 0.5, 1), petals('pm', 'm', 0.35, 2, 120), tip('t-shake', 'm', 0.6, 'shake'),
      petals('pn', 'n', 0.5, 1), petals('po', 'o', 0.5, 1), watch('teach-shake', 's1'), hide('h2', 's1', 0.6, 'wide'), petals('ps', 's2', 0.15, 1), petals('pz', 'z', 0.5, 2, 120)],
  };
}
/** [P] beat 3, red light, green light: three bushes a little further apart each time (Normal 200, 260, 320 px of bark between; Easy two
 *  gaps, 200 and 260), one rhythm; a flag before it */
function redGreen(easy: boolean): Lay {
  return {
    pieces: [bank('a', null, 320), bank('w1', 'a', 300), bank('w2', 'w1', 380), bank('w3', 'w2', easy ? 300 : 440), hop('z', 'w3', 320)],
    sockets: [flag('a'), petals('pa', 'a', 0.7, 1), watch('road', 'w1'), hide('h1', 'w1', 0.55, 'bush'), hide('h2', 'w2', 0.45, 'bush'), ...(easy ? [] : [hide('h3', 'w3', 0.5, 'bush')]),
      petals('p2', 'w2', 0.9, 1), petals('pz', 'z', 0.5, 2, 120), tip('t-bark', 'z', 0.7, 'bark')],
  };
}
/** [X] beat 5, bare bark (required): ~450 px of bare bark between two bushes (1-7.md 400-480), both inside the warn's 570 px run (Easy ~300) */
function bareBark(easy: boolean): Lay {
  return {
    pieces: [bank('a', null, 320), bank('b', 'a', 300), bank('w1', 'b', 300), bank('w2', 'w1', easy ? 210 : 360), bank('w3', 'w2', 260), hop('z', 'w3', 320)],
    sockets: [flag('a'), petals('pb', 'b', 0.5, 1), watch('bark', 'w1'), hide('h1', 'w1', 0.55, 'bush'), hide('h2', 'w3', 0.35, 'wide'), petals('pw', 'w2', 0.5, 1), petals('pz', 'z', 0.5, 2, 120), tip('t-moss', 'z', 0.7, 'moss')],
  };
}
/** [P] beat 7, moss anywhere: the bough grows a moss carpet (no bushes: every mossy spot is cover), then patches with bark between (Normal
 *  300 px, Easy 240); the golden seed in the open between the last two */
function mossAnywhere(easy: boolean): Lay {
  return {
    pieces: [bank('a', null, 360), bank('b', 'a', 300), bank('w1', 'b', 420), bank('w2', 'w1', 420), bank('w3', 'w2', easy ? 360 : 420), hop('z', 'w3', 320)],
    sockets: [petals('pa', 'a', 0.5, 1), watch('moss', 'w1'), hide('c1', 'w1', 0.55, 'carpet'), hide('m1', 'w2', 0.45, 'patch'), hide('m2', 'w3', 0.55, 'patch'),
      { id: 'seed', role: 'find', on: 'w3', t: 0.12, dn: 34 }, petals('pz', 'z', 0.3, 2, 120), tip('t-creak', 'z', 0.5, 'creak')],
  };
}
/** [C] beat 8, never still on a creak: moss patches, a creaky limb the only step between two (Easy: a sound bough); the eagle's eye runs
 *  over the whole beat (W17_JOIN): the screech catches him by the limb, and he crosses it to the moss, never waits on it */
function creakStill(easy: boolean): Lay {
  return {
    pieces: [bank('a', null, 320), bank('w1', 'a', 360), limb('k', 'w1', !easy), hop('w2', 'k', 360), bank('w3', 'w2', 200), hop('z', 'w3', 320)],
    sockets: [flag('a'), petals('pa', 'a', 0.5, 1), watch('creak', 'w1'), hide('m1', 'w1', 0.4, 'patch'), hide('m2', 'w2', 0.55, 'patch'), petals('pz', 'z', 0.5, 2, 120), tip('t-swing', 'z', 0.7, 'swing')],
  };
}
/** [W] beat 10, the twist, still is not stopped: a gap with no ground cover, crossed only on two mossy lianas (finish17 marks them: holding
 *  one is cover while it swings him); the eye over the whole beat, its first pass over the lianas free. Easy: moss floor under them is
 *  World 1's soft pit (a miss is a climb back), and ONE liana */
function mossyLianas(easy: boolean): Lay {
  const r1 = liana('b1', 'w1', 'long');
  const r2 = easy ? [] : liana('b2', 'b1', 'long');
  const last = easy ? 'b1' : 'b2';
  return {
    pieces: [bank('a', null, 320), bank('w1', 'a', 340), ...r1, ...r2, bank('w2', last, 260), hop('z', 'w2', 320)],
    sockets: [flag('a'), petals('pa', 'a', 0.5, 1), watch('swing', 'w1'), hide('m1', 'w1', 0.35, 'patch'), hide('m2', 'w2', 0.5, 'patch'), petals('pb', 'b1', 0.5, 1), petals('pz', 'z', 0.5, 2, 120), tip('t-lands', 'z', 0.7, 'lands')],
  };
}
/** [S] beat 12, the eagle lands: it perches on a dead snag over a moss carpet (finish17 perches it); its head turns (the warn), its gaze
 *  slides over the moss; patches thin under the snag. Two empty looks and it gives up and flies off */
function eagleLands(easy: boolean): Lay {
  return {
    pieces: [bank('a', null, 320), bank('w1', 'a', 420), bank('w2', 'w1', 420), bank('w3', 'w2', easy ? 300 : 360), hop('z', 'w3', 320)],
    sockets: [flag('a'), petals('pa', 'a', 0.5, 1), watch('perch', 'w1'), hide('c1', 'w1', 0.5, 'carpet'), hide('m1', 'w2', 0.62, 'patch'), hide('m2', 'w3', 0.6, 'patch'), petals('pz', 'z', 0.5, 2, 120)],
  };
}
/** [L] beat 14, the light gap (finale): patches further apart, one creaky limb (Easy sound), a mossy liana pair (Easy one), bare bark only
 *  where the shadow has passed; it ends with him LETTING GO of the last liana onto the far bank (a freeze is never the last beat) */
function lightGap(easy: boolean): Lay {
  const r1 = liana('b1', 'w2', 'long');
  const r2 = easy ? [] : liana('b2', 'b1', 'long');
  const last = easy ? 'b1' : 'b2';
  return {
    pieces: [bank('a', null, 320), bank('w1', 'a', 380), limb('k', 'w1', !easy), hop('w2', 'k', 300), ...r1, ...r2, hop('z', last, 360)],
    sockets: [flag('a'), petals('pa', 'a', 0.5, 1), watch('finale', 'w1'), hide('m1', 'w1', 0.45, 'patch'), hide('m2', 'w2', 0.4, 'patch'), petals('pb', 'b1', 0.5, 1), petals('pz', 'z', 0.5, 2, 120)],
  };
}

/** THE ARC'S BRICKS (1-7.md), one job each: the graph's letter in brackets */
export const BEATS_17: SectionTemplate[] = [
  brick({ id: 'w1-17-bush', name: 'the bush, safe, and the leaves shake: it went right over me', jobs: ['teach'], content: 'ground', teaches: 'hide', difficulty: 1, versions: [{ id: 'two-bushes', lay: bushTeach() }] }),
  brick({ id: 'w1-17-red-green', name: 'red light, green light: run, stop, breathe', jobs: ['flow'], content: 'hazard', difficulty: 3, versions: [{ id: 'three-bushes', lay: redGreen(false), easy: redGreen(true) }] }),
  brick({ id: 'w1-17-bare-bark', name: 'bare bark: no green on me, not hidden', jobs: ['test'], content: 'ground', difficulty: 4, versions: [{ id: 'bark', lay: bareBark(false), easy: bareBark(true) }] }),
  brick({ id: 'w1-17-moss', name: 'moss anywhere: I can stop anywhere green', jobs: ['practise'], content: 'hazard', difficulty: 4, versions: [{ id: 'carpet-patches', lay: mossAnywhere(false), easy: mossAnywhere(true) }] }),
  brick({ id: 'w1-17-creak', name: 'never still on a creak: not HERE', jobs: ['combine'], content: 'crumble', difficulty: 5, uses: ['hide', 'creak'], versions: [{ id: 'limb', lay: creakStill(false), easy: creakStill(true) }] }),
  brick({ id: 'w1-17-mossy-lianas', name: 'still is not stopped: hiding on a swing', jobs: ['twist'], content: 'rope', difficulty: 6, uses: ['hide', 'swing'], versions: [{ id: 'two-lianas', lay: mossyLianas(false), easy: mossyLianas(true) }] }),
  brick({ id: 'w1-17-eagle-lands', name: 'the eagle lands: it was RIGHT THERE', jobs: ['signature'], content: 'hazard', difficulty: 6, versions: [{ id: 'snag', lay: eagleLands(false), easy: eagleLands(true) }] }),
  brick({ id: 'w1-17-light-gap', name: 'the light gap: it never saw me', jobs: ['finale'], content: 'hazard', difficulty: 8, uses: ['hide', 'swing', 'creak'], versions: [{ id: 'all-of-it', lay: lightGap(false), easy: lightGap(true) }] }),
];

// ───────────────────────────── 1-7's own quiet: Dot's bush, the rests and the exit ─────────────────────────────
const link = (o: { id: string; name: string; job: 'arrive' | 'rest'; versions: V[] }): SectionTemplate => ({
  ...brick({ id: o.id, name: o.name, jobs: [o.job], difficulty: 1, content: 'ground', versions: o.versions, uses: [] }),
  phases: [o.job === 'arrive' ? 'start' : 'rest'], content: 'structural', uses: [], terrain: 'floor-stones', maxPerStage: o.job === 'arrive' ? 1 : 6,
} as SectionTemplate);
/** a root hop up or down (1-6's: the quiet line wants a hop within 450 px of each end of a rest and none 950 px apart, listRules quietJudge) */
const UP: R2 = [-56, -50], DOWN: R2 = [50, 56];
const root = (key: string, after: string, w: number, dy: R2): SectionPiece => ({ ...bank(key, after, w), place: { kind: 'walk', after, dy } });
/** a rest under the canopy: a flag on a bank between root hops (the stage's length from walked ground, 1-6's way, never from more eagles) */
const rest = (id: string): SectionTemplate => link({ id, name: 'a rest under the canopy', job: 'rest', versions: [{
  id: 'roots',
  lay: { pieces: [bank('a', null, 320), root('b', 'a', 240, UP), root('c', 'b', 380, DOWN), root('d', 'c', 220, UP), root('e', 'd', 360, DOWN), root('f', 'e', 240, UP), root('g', 'f', 340, DOWN), root('h', 'g', 220, UP), root('z', 'h', 300, DOWN)],
    sockets: [flag('c', 0.5), petals('pb', 'b', 0.5, 1), petals('pd', 'd', 0.5, 1), petals('pe', 'e', 0.5, 2, 120), petals('pf', 'f', 0.5, 1)] },
}] });
export const QUIET_17: SectionTemplate[] = [
  // [A] Dot's bush, "a small, worried dent in it"; far off one screech and no shadow; nothing hurts in 1,300 px. The bush line is said at
  // its far end, 800+ px before beat 1's bush
  link({ id: 'w1-17-arrival', name: "Dot's bush", job: 'arrive', versions: [
    { id: 'dots-bush', lay: { pieces: [bank('a', null, 360), bank('b', 'a', 360), root('r1', 'b', 240, UP), root('c', 'r1', 340, DOWN), root('r2', 'c', 240, UP), root('z', 'r2', 320, DOWN)],
      sockets: [tip('t-arrive', 'a', 0.6, 'arrive'), hide('dot', 'b', 0.5, 'bush'), petals('pb', 'b', 0.9, 1), petals('pr', 'r1', 0.5, 1), petals('pc', 'c', 0.5, 2, 120), tip('t-bush', 'r2', 0.3, 'bush')] } },
  ] }),
  // [R] the rests: each beat's own far bank says the next beat's line, 800+ px before it (a rest between)
  rest('w1-17-rest'),
];
/** [E] back under the canopy: her mark (the keeper's words), the totem */
export const EXIT_17: SectionTemplate = {
  id: 'w1-17-exit', name: 'back under the canopy', feel: [STAGE_17], own: true, archetypes: 'any', phases: ['goal'], difficulty: 1, needs: ['walk'], jobs: ['exit'], content: 'structural', terrain: 'floor-stones',
  pieces: [{ key: 'in', shape: 'bank', w: [300, 340], place: { kind: 'start' }, style: 'moss_stone', main: true, landing: true }],
  subBlocks: [{ id: 'body', versions: [{ id: 'bank', pieces: [{ key: 'out', shape: 'bank' as const, w: [560, 600] as R2, place: { kind: 'walk' as const, after: 'in', dy: [0, 0] as R2 }, style: 'moss_stone' as const, main: true, landing: true }], sockets: [petals('pout', 'out', 0.3, 2, 120), { id: 'exit-totem', role: 'objective' as const, on: 'out', t: 0.85, allow: ['exit_totem'] }] }] }],
  entry: { piece: 'in', kind: 'ground' }, exit: { piece: 'out', kind: 'ground' }, exitDy: 0, sockets: [tip('t-mark', 'in', 0.5, 'mark')], mirrorable: false,
} as SectionTemplate;

/** every section that is 1-7's own */
export const SECTIONS_17: SectionTemplate[] = [...BEATS_17, ...QUIET_17, EXIT_17];

// ───────────────────────────── the finish: what only the built stage carries ─────────────────────────────
/** the beats whose eye runs over the WHOLE beat, gaps and all (their question is across a gap: the limb, the lianas), and the beat whose
 *  eagle LANDS (its body on a snag at `perch` along its stretch, its gaze swept) */
export const W17_JOIN = ['w1-17-creak', 'w1-17-mossy-lianas', 'w1-17-light-gap'] as const;
export const W17_MOSSY = ['w1-17-mossy-lianas', 'w1-17-light-gap'] as const;
export const W17_PERCH = { section: 'w1-17-eagle-lands', at: 0.55 } as const;

type FinishStage = { platforms: Platform[]; vines: Vine[]; enemies: Enemy[]; gen2?: { sections: Array<{ uid: string; template: string }> } };
/** a section's laid pieces (Platform.tag / Vine.tag `<uid>:<key>`, BRIEF_17.tags) */
const ofSection = <T extends { tag?: string }>(xs: readonly T[], uid: string): T[] => xs.filter((x) => x.tag?.startsWith(`${uid}:`));

/**
 * 1-7's finish (listed.ts FINISH 'w1-17'): its mossy lianas marked (Vine.mossy: holding one is cover, engine.ts startCast), the beats in
 * W17_JOIN given ONE eye over all their ground, the perch beat's eagle on its snag, and on Easy every eagle's first pass free (1-7.md
 * Easy). Throws (the roll is never listed) when a beat it finishes is missing what it needs.
 */
export function finish17<T extends FinishStage>(st: T, difficulty: Difficulty): T {
  const easy = difficulty === 'easy';
  // (World 1's still finish: each watched stretch cut to its hides (clipWatches) and laid as ONE kit eagle over it (castWatches))
  let id = Math.max(0, ...st.enemies.map((e) => e.id));
  const sink = st as unknown as Pick<StageSink, 'proto' | 'platforms' | 'enemies'>;
  clipWatches(sink);
  castWatches(sink, (z, gy) => eagleOver(z, gy, ++id));
  const bushes = (sink.proto.bushes ?? []) as Array<{ x: number; w: number }>;
  const eagles = () => st.enemies.filter((e) => e.type === 'eagle');
  for (const s of st.gen2?.sections ?? []) {
    const plats = ofSection(st.platforms, s.uid);
    if (!plats.length) continue;
    const x0 = Math.min(...plats.map((p) => p.x)), x1 = Math.max(...plats.map((p) => p.x + p.width));
    const inside = eagles().filter((e) => e.patrolMinX >= x0 - 1 && e.patrolMaxX <= x1 + 1);
    if ((W17_MOSSY as readonly string[]).includes(s.template)) {
      const vs = ofSection(st.vines, s.uid);
      if (!vs.length) throw new Error(`1-7 finish: ${s.template} (${s.uid}) laid no liana`);
      for (const v of vs) v.mossy = true;
    }
    if ((W17_JOIN as readonly string[]).includes(s.template)) {
      // (one eye over the whole beat, gaps and all: from its stretch's start to 120 px past the beat's last hide (stillLay's `past`), as
      // one stretch with every hide in it would be cut. Its watcher's stretch ended at the first gap)
      if (inside.length !== 1) throw new Error(`1-7 finish: ${s.template} (${s.uid}) has ${inside.length} eagles, not 1`);
      const hides = bushes.filter((b) => b.x >= x0 && b.x + b.w <= x1);
      inside[0].patrolMaxX = Math.max(inside[0].patrolMaxX, Math.max(...hides.map((b) => b.x + b.w)) + STILL.past);
    }
    if (s.template === W17_PERCH.section) {
      if (inside.length !== 1) throw new Error(`1-7 finish: the perch beat (${s.uid}) has ${inside.length} eagles, not 1`);
      const e = inside[0];
      const z: WatchZone = { x0: e.patrolMinX, x1: e.patrolMaxX, calm: [e.kitCool ?? 5, e.kitCool ?? 5], ...(e.kitFree ? { freeFirst: true } : {}) };
      const ground = plats.filter((p) => p.type !== 'fragile').sort((a, b) => a.y - b.y)[0].y;
      const perched = eagleOver(z, ground, e.id, { x: Math.round(z.x0 + (z.x1 - z.x0) * W17_PERCH.at) });
      perched.kitCool = e.kitCool;
      st.enemies = st.enemies.map((q) => (q === e ? perched : q));
    }
  }
  if (easy) for (const e of eagles()) e.kitFree = true;
  return st;
}

/**
 * World 1's kit with 1-7's rows over it (stageTable.ts kit 'w1-17', listed.ts KITS): its pool is its own sections alone; it swings
 * (withSwing: the mossy lianas); its graph and brief; World 1's still table (hides and the eagle) with each row's id as a tag. The still
 * finish (each stretch cut to its hides and laid as one kit eagle) is finish17's first step: World 1 has no decorate pass to run it on.
 */
export function kitLib17(): WorldKit {
  const k = withSwing(w1World()), M = k.manifest, G = M.graphs!;
  const still = w1Still(7, LESSONS_17);
  const props: PropDef[] = still.props.map((p) => ({ ...p, tags: [...p.tags, p.id] }));
  return { ...k,
    emit: { ...k.emit, ...still.emit },
    manifest: { ...M,
      props: [...M.props.filter((p) => !props.some((q) => q.id === p.id)), ...props],
      sections: SECTIONS_17,
      lessons: { jump: '1-1', double: '1-1', bounce: '1-1', climb: '1-4', creak: '1-5', swing: '1-6' },
      required: {},
      tips: { ...M.tips, ...Object.fromEntries((Object.keys(LINES_17) as Array<keyof typeof LINES_17>).map((k) => [lineId(k), LINES_17[k]])) },
      // (every line of the keeper's but the arrival's and the mark's is a TEACH line: Dot says it on Normal's default Tips as on Help, D50)
      teachTips: [...(M.teachTips ?? []), ...(['bush', 'shake', 'bark', 'moss', 'creak', 'swing', 'lands'] as const).map(lineId)],
      graphs: { ...G, chunkSeconds: 60, list: [...G.list.filter((g) => g.archetype !== 'stealth'), ...Object.entries(ARC_17).map(([id, code]) => ({ id, archetype: 'stealth' as const, code }))], briefs: { ...G.briefs, [STAGE_17]: BRIEF_17 } },
    } } as WorldKit;
}
