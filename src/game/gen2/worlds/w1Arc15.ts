/**
 * 1-5 Where She Walked, the level as DESIGNED (reference/design/1-5.md on t-15-design; packet B15): World 1's rows for it.
 * ONE idea: the trail splits high and low, over the creaky limbs where you see what's coming or under through the roots; her marks say
 * which way SHE went, and if the top breaks you just land on the bottom. ONE graph, one brick a beat, each with a job no other piece of
 * the stage's pool serves. WORLD DATA: no engine line names this stage; kitLib15 gives World 1's kit these rows, and the stage table
 * lists the stage on it.
 *
 * The phone's numbers (1-5.md "On a phone"): sideways shows 240 px clear over his feet, so the two roads stand OVER px apart and from the
 * low road he sees the deck and what stands on it; upright shows about 425 px across, so each split's question is inside 300 px.
 * A fall from the high road ALWAYS lands on the low road in view (D46): every creaky limb stands over a bank, never over a pit, a patch
 * or a heart. Under a deck nothing asks for a jump (his jump tops out 171 px up, past the deck's underside).
 */
import type { GraphBrief, NodeJob, SectionPiece, SectionTemplate, Socket, WorldKit } from '../types.ts';
import { hollowLogSize } from '../../w1NewArt.ts';
import { w1World } from './w1.ts';

/** the stage these rows are for: the tag its sections carry (stagePool) and the key of its brief */
export const STAGE_15 = '1-5';
type R2 = [number, number];

/** 1-5's ONE graph: A arrive, M through or over (beat 1), T the creaky lesson (beat 2), P her road or theirs (beat 4), X blocked in turn
 *  (beat 5), S the big sign (beat 6: a plain sign pair, one stretch a roll, the card road is cut), W he is the stone (beat 7), C the
 *  weave (beat 8), E her freshest mark (beat 9); R the rests with their flags between */
export const ARC_15: Record<string, string> = { 'search-15-arc': 'A M T R P R X R H R W R S E' };
/** 1-5's brief, all of it data: a search for her marks, on the ground and the boughs over it, its cast 1-3's shy snake */
export const BRIEF_15: GraphBrief = {
  ends: 'quiet', trend: 'level', branching: 'none', teaches: ['creak'], deal: { ground: 14, crumble: 29, climb: 29, hazard: 28 }, dealExact: true,
  cast: ['snake'],
};
/** the story keeper's lines for 1-5, verbatim (STORY-LINES.md 11-12 "1-5 Where She Walked", approved by Matt 10:20 PM ET; and the kept
 *  ones: "She's making them last", STORY-KEEPER.md:150; the fresher petals, mixer/stages.ts's 1-5; the seed's "Something shiny"). The only
 *  player words this file holds */
export const LINES_15 = {
  creak: 'Creaky limbs drop you, but only down to the roots!',
  sign: "Squirrels painted what's each way. Your pick!",
  sealed: "We missed some of her marks. They're back there!",
  last: "She's making them last.",
  fresher: 'These petals are fresher. She came this way not long ago.',
  shiny: 'Something shiny, far away...',
} as const;
/** Pokey's joke at the first THIS WAY / THAT WAY: held for the squirrels' sign art (World 1 has none until ART paints it) */
export const JOKE_15 = 'THIS WAY. THAT WAY. Thank you, squirrels.';
/** the stage's MISSION line (the keeper's, approved by Matt 11-12 10:20 PM ET): stagePlan's, held equal by library15.test.ts */
export const MISSION_15 = 'She marked the way they took her. Follow her marks.';
// ───────────────────────────── the pieces ─────────────────────────────
/** how far over the low road the high road stands (px): 150-180 (sideways, 1-5.md "On a phone") */
const OVER = 165;
const UP: R2 = [-56, -50], DOWN: R2 = [50, 56];
/** a bank he walks on (the low road, her road under), `w` exact so a deck over it is laid by px */
const bank = (key: string, after: string | null, w: number, dy: R2 = [0, 0]): SectionPiece => ({ key, shape: 'bank', w: [w, w], place: after ? { kind: 'walk', after, dy } : { kind: 'start' }, style: 'moss_stone', main: true });
/** a piece of the high road over bank `on` (`onW` wide), its left end `x` px along it, `dy` over its top (default the road's OVER) */
const over = (key: string, on: string, onW: number, x: number, w: number, o: { creak?: boolean; dy?: number; style?: 'branch' | 'log' } = {}): SectionPiece => ({
  key, shape: 'branch', w: [w, w], place: { kind: 'over', on, at: [x / onW, x / onW], dy: [-(o.dy ?? OVER), -(o.dy ?? OVER)] }, style: o.style ?? 'branch', landing: true, ...(o.creak ? { creak: true } : {}),
});
/** a straight vine from bank `on` (`onW` wide) up to the high road, `x` px along it: the road's next piece starts at its top */
const vine = (key: string, on: string, onW: number, x: number, h = OVER): SectionPiece => ({ key, shape: 'vine', w: [0, 0], place: { kind: 'climb', on, at: [x / onW, x / onW], h: [h, h] } });
/** an awake snake's own ground: a bank OFF the `main` list (1-3's bed: the flag pass stands no flag on it and the lay tops no second
 *  animal up onto it; a flag on the bank under a snake empties its socket, seeds 4 and 7) */
const ground = (key: string, after: string, w: number): SectionPiece => ({ ...bank(key, after, w), main: false });
/** a bank beside a snake's ground, off the `main` list too: the flag pass stands a flag on any main bank 160 px or wider, 80 px in from
 *  its ends (pipeline FLAG_SPAN.pad), and a flag keeps every animal 224 px off, so a flag on the bank next to the den emptied it (seeds
 *  4 and 7: a flag 80 px before the den). The pass finds its spots on the rests (each 160 px or wider) */
const apron = (key: string, after: string, w: number): SectionPiece => ({ ...bank(key, after, w), main: false });
/** the high road's first piece, its left end at vine `v`'s top */
const atTop = (key: string, v: string, w: number, creak = false): SectionPiece => ({ key, shape: 'branch', w: [w, w], place: { kind: 'over', on: v, at: [0, 0], dy: [0, 0] }, style: 'branch', landing: true, ...(creak ? { creak: true } : {}) });
/** petals: `n` in a row over `span` px, low on what they stand on */
const petals = (id: string, on: string, t: R2 | number, n = 2, span = 110): Socket => ({ id, role: 'pickup', on, t, dn: 34, count: n, span });
/** her MARK (the stage's goal item, gen2 lays every one where it stands: pipeline's objective 'mark'), at marching height on her road */
const mark = (id: string, on: string, t: number): Socket => ({ id, role: 'objective', on, t, dn: 34, allow: ['mark'] });
const tip = (id: string, on: string, t: number, line: keyof typeof LINES_15): Socket => ({ id, role: 'tip', on, t, allow: [line] });
const flag = (on: string, t = 0.5): Socket => ({ id: 'flag', role: 'flag', on, t });

// ───────────────────────────── the snake under its trap (1-3's unit, 1-5's own copy) ─────────────────────────────
/** 1-3's trapped-snake unit as World 1 lays it (w1Arc13.ts core, the phone's numbers measured there): a short ledge `g` with the handle,
 *  a bed `B` level with it and a low fallen log `L` on it where the snake lies under its load, and a short ledge `d` after */
const NARROW: R2 = [150, 155], SHORT = 153, LOW: R2 = [24, 26];
const LOAD_T = 0.02, SNAKE_T = 0.83, HANDLE_T = 0.443;
function trapped(k: string, after: string, asleep: boolean): { pieces: SectionPiece[]; sockets: Socket[]; last: string } {
  const g = `${k}g`, B = `${k}B`, L = `${k}L`, d = `${k}d`;
  const pieces: SectionPiece[] = [
    { key: g, shape: 'bank', w: NARROW, place: { kind: 'walk', after, dy: [0, 0] }, style: 'moss_stone', main: true },
    { key: B, shape: 'bank', w: [SHORT, SHORT], place: { kind: 'walk', after: g, dy: [0, 0] }, style: 'moss_stone', main: false },
    { key: L, shape: 'block', w: [900, 900], place: { kind: 'on', on: B, at: [0, 0], h: LOW }, style: 'log', main: false },
    { key: d, shape: 'bank', w: NARROW, place: { kind: 'walk', after: B, dy: [0, 0] }, style: 'moss_stone', main: true },
  ];
  const sockets: Socket[] = [
    { id: `${k}h`, role: 'source', on: g, t: HANDLE_T, dn: 0 },
    { id: `${k}r`, role: 'receptor', on: L, t: LOAD_T, dn: 0, link: `${k}h`, allow: ['trap-stone'] },
    { id: `${k}e`, role: 'enemy', on: L, t: SNAKE_T, dn: 0, allow: [asleep ? 'snake-trapped-asleep' : 'snake-trapped'], easy: 'stay' },
  ];
  return { pieces, sockets, last: d };
}

// ───────────────────────────── a brick ─────────────────────────────
type Lay = { pieces: SectionPiece[]; sockets: Socket[] };
type V = { id: string; lay: Lay; easy?: Lay };
/** a brick (1-3's form): its first piece `in`, its last `out` (both on the low road, level), a version's Easy twin beside it */
function brick(o: { id: string; name: string; jobs: NodeJob[]; difficulty: number; content: 'ground' | 'climb' | 'hazard' | 'crumble'; teaches?: string; maxPerStage?: number; versions: V[]; /** no creaky limb in it (it may stand before the lesson) */ noCreak?: true }): SectionTemplate {
  const ren = (ps: SectionPiece[]) => { const a = ps[0].key, z = ps[ps.length - 1].key; const f = (s: string) => (s === a ? 'in' : s === z ? 'out' : s); return ps.map((p) => ({ ...p, key: f(p.key), place: Object.fromEntries(Object.entries(p.place).map(([q, v]) => [q, (q === 'after' || q === 'on') && typeof v === 'string' ? f(v) : v])) as SectionPiece['place'] })); };
  const sk = (ps: SectionPiece[], ss: Socket[]) => { const a = ps[0].key, z = ps[ps.length - 1].key; return ss.map((s) => ({ ...s, on: s.on === a ? 'in' : s.on === z ? 'out' : s.on })); };
  const first = ren(o.versions[0].lay.pieces)[0];
  const versions = o.versions.flatMap((v) => [
    { id: v.id, pieces: ren(v.lay.pieces).slice(1), sockets: sk(v.lay.pieces, v.lay.sockets), ...(v.easy ? { easy: `${v.id}-easy` } : {}) },
    ...(v.easy ? [{ id: `${v.id}-easy`, pieces: ren(v.easy.pieces).slice(1), sockets: sk(v.easy.pieces, v.easy.sockets), easyOnly: true }] : []),
  ]);
  const { versions: _v, noCreak: _n, ...rest } = o;
  return { ...rest, feel: [STAGE_15], own: true, archetypes: 'any', phases: ['ki', 'sho', 'ten', 'ketsu'], needs: ['jump'], uses: o.teaches || o.noCreak ? [] : ['creak'], terrain: 'raised-logs', pieces: [first], subBlocks: [{ id: 'body', versions }], entry: { piece: 'in', kind: 'ground' }, exit: { piece: 'out', kind: 'ground' }, exitDy: 0, sockets: [], mirrorable: false } as SectionTemplate;
}

/** the settings' numbers: a creaky limb's length and the gap between two (steady to beat 4: one length, one gap, R-165.174; from beat 5
 *  shorter and wider). Normal's late gap is about 0.78 of his reach (pipeline maxGap: 175 px level), Easy's 0.6 with limbs 48 px longer */
interface Set { limb: number; gap: number; late: number; lateGap: number; easy: boolean }
const NORMAL: Set = { limb: 140, gap: 60, late: 124, lateGap: 132, easy: false };
const EASY: Set = { limb: 170, gap: 50, late: 160, lateGap: 104, easy: true };

// ───────────────────────────── the beats ─────────────────────────────
/** [M] beat 1, through or over: 1-1's hollow log grown, one big fallen trunk; petals leading to its mouth (the low road, through it) and
 *  along its top (the high road, a stump step up, a stump and a bank down); her mark past it where both roads meet. Nothing here can hurt
 *  (no petal or mark stands INSIDE the trunk: levelCheck reads the shell's box as solid, and took them out) */
function throughOrOver(len: 300 | 360): Lay {
  const hh = hollowLogSize('moss', len).height;
  const W = len + 800;
  const pieces: SectionPiece[] = [
    bank('a', null, 300),
    bank('f', 'a', W),
    { key: 's', shape: 'block', w: [154, 160], place: { kind: 'on', on: 'f', at: [0.06, 0.07], h: [50, 56] }, style: 'moss_stone', landing: true },
    { key: 'H', shape: 'hollow', w: [len, len], place: { kind: 'on', on: 'f', at: [0.3, 0.31], h: [hh, hh] }, landing: true },
    { key: 'm', shape: 'block', w: [130, 140], place: { kind: 'on', on: 'f', at: [0.74, 0.75], h: [30, 36] }, style: 'moss_stone', landing: true },
    bank('z', 'f', 300),
  ];
  const sockets: Socket[] = [petals('pa', 'a', [0.5, 0.6], 1), petals('pin', 'f', [0.24, 0.26], 2, 80), petals('ptop', 'H', [0.35, 0.65], 2, 140), mark('mz', 'z', 0.5)];
  return { pieces, sockets };
}
/** [T] beat 2, the top can drop you (the lesson): a flag and Dot's line 800 px and more before the first limb; a root up and down; then
 *  the long bank: a vine up to ONE creaky limb that gives way and drops him onto petals; a straight vine back up to three limbs of the
 *  same length and gap; down off the last. Every limb here is over the bank (never needed: creak.ts, the lesson's own) */
function lesson(S: Set): Lay {
  const W = 1260;
  const x1 = 120, x2 = 480;
  const pieces: SectionPiece[] = [
    bank('a', null, 300), bank('b', 'a', 260, UP), bank('c', 'b', 300, DOWN), bank('U', 'c', W),
    vine('v1', 'U', W, x1), atTop('L0', 'v1', S.limb, true),
    vine('v2', 'U', W, x2), atTop('L1', 'v2', S.limb, true),
    over('L2', 'U', W, x2 + S.limb + S.gap, S.limb, { creak: true }),
    over('L3', 'U', W, x2 + 2 * (S.limb + S.gap), S.limb, { creak: true }),
    bank('z', 'U', 300),
  ];
  const sockets: Socket[] = [
    flag('a', 0.3), tip('tip', 'a', 0.4, 'creak'),
    petals('pb', 'b', [0.4, 0.6], 1), petals('pfall', 'U', (x1 + S.limb / 2) / W, 3, 120),
    petals('pL1', 'L1', 0.5, 1), petals('pL2', 'L2', 0.5, 1), petals('pL3', 'L3', 0.5, 1),
    mark('mU', 'U', (x2 + 2 * S.limb + 1.5 * S.gap) / W),
  ];
  return { pieces, sockets };
}
/** [P] beat 4, her road or theirs: her mark at the split; UNDER (her road), the sound root way, petals, the first snake of the stage
 *  ASLEEP on a log under a stone with its tendril beside him, her next mark past it; OVER (the squirrels'), a vine up and three creaky
 *  limbs on the same beat, then a high bough over the snake to the golden seed, and down past it. Dot's fresher-petals line at the split */
function herRoad(S: Set): Lay {
  const W = 720;
  const t = trapped('t', 'U', true);
  const xv = 60;
  const deck = xv + 3 * S.limb + 2 * S.gap + S.gap;
  const pieces: SectionPiece[] = [
    bank('a', null, 260), bank('U', 'a', W),
    vine('v', 'U', W, xv), atTop('L1', 'v', S.limb, true),
    over('L2', 'U', W, xv + S.limb + S.gap, S.limb, { creak: true }),
    over('L3', 'U', W, xv + 2 * (S.limb + S.gap), S.limb, { creak: true }),
    ...t.pieces,
    // (the seed's bough: solid, high over the trap's load (TRAP_HANG 100 over the log), from past the limbs to past the snake's log)
    over('hi', 'U', W, Math.min(deck, W - 40), W - Math.min(deck, W - 40) + 460, { dy: OVER + 50, style: 'log' }),
    bank('m', t.last, 260), bank('z', 'm', 240),
  ];
  const sockets: Socket[] = [
    tip('tip', 'a', 0.3, 'fresher'), mark('ma', 'a', 0.7),
    petals('pU', 'U', [0.2, 0.3], 3, 160), mark('mU', 'U', 0.62), petals('pL2', 'L2', 0.5, 1),
    ...t.sockets,
    { id: 'seed', role: 'find', on: 'hi', t: 0.85, dn: 34 }, tip('tip2', 'hi', 0.2, 'shiny'),
    petals('pm', 'm', 0.6, 1), petals('pz', 'z', 0.5, 1),
  ];
  return { pieces, sockets };
}
/** [X] beat 5, blocked in turn: up on the high road a limb is already gone (a broken stub and a gap past any jump): drop to her road;
 *  then an awake snake paces across the low road: up the vine, over it on a sound bough, and on along shorter, wider-spaced limbs */
function blocked(S: Set): Lay {
  const W1 = 900, P = 300, G = 320, Q = 420, xv = 60, xb = 60, B = P - xb + G + 40;
  const pieces: SectionPiece[] = [
    bank('a', null, 240), bank('U', 'a', W1),
    vine('v', 'U', W1, xv), atTop('L1', 'v', S.late, true),
    over('L2', 'U', W1, xv + S.late + S.lateGap, S.late, { creak: true }),
    // (the stub: a short sound end, then nothing for the rest of the bank: past any jump, so the way on is down)
    over('stub', 'U', W1, xv + 2 * (S.late + S.lateGap), 60, { style: 'log' }),
    // (the snake's ground between two banks; up the vine on the first, over it on a sound bough, on along a creaky limb, down)
    apron('P', 'U', P), vine('v2', 'P', P, xb), atTop('B1', 'v2', B),
    ground('S', 'P', G),
    apron('Q', 'S', Q), over('L3', 'Q', Q, 40 + S.lateGap, S.late, { creak: true }),
    bank('z', 'Q', 260),
  ];
  const sockets: Socket[] = [
    mark('ma', 'a', 0.5), petals('pL1', 'L1', 0.5, 1), petals('pL2', 'L2', 0.5, 1),
    { id: 'e', role: 'enemy', on: 'S', t: 0.5, dn: 0, allow: ['snake'], easy: 'soften' },
    petals('pB1', 'B1', [0.2, 0.4], 2, 120), mark('mB1', 'B1', 0.7), petals('pL3', 'L3', 0.5, 1),
    mark('mz', 'z', 0.5),
  ];
  return { pieces, sockets };
}
/** [S] beat 6, the big sign (a plain sign pair; the card road is cut, 1-5.md:27): Dot's line, then ONE of the two stretches, the roll's
 *  pick. THAT WAY: up a vine to the bough run, creaky limbs the only footing, a sound bough under them as the catch; THIS WAY: the root
 *  ramp down to the creek's stepping roots over soft dips (stand-in for the water: named in the report), one awake snake */
function boughRun(S: Set): Lay {
  const W = 1300;
  const xv = 80;
  const pieces: SectionPiece[] = [bank('a', null, 280), bank('U', 'a', W), vine('v', 'U', W, xv), atTop('L1', 'v', S.late, true)];
  const sockets: Socket[] = [flag('a', 0.3), tip('tip', 'a', 0.5, 'sign'), mark('ma', 'a', 0.85)];
  let x = xv + S.late;
  for (let j = 2; j <= 6; j++) { const k = `L${j}`; pieces.push(over(k, 'U', W, x + S.lateGap, S.late, { creak: true })); sockets.push(petals(`p${k}`, k, 0.5, 1)); x += S.lateGap + S.late; }
  pieces.push(bank('z', 'U', 300));
  sockets.push(mark('mz', 'z', 0.6));
  return { pieces, sockets };
}
function creek(S: Set): Lay {
  const pieces: SectionPiece[] = [bank('a', null, 280), bank('r1', 'a', 200, DOWN), bank('r2', 'r1', 200, DOWN)];
  const sockets: Socket[] = [flag('a', 0.3), tip('tip', 'a', 0.5, 'sign'), mark('ma', 'a', 0.85)];
  let prev = 'r2';
  for (let j = 0; j < 5; j++) {
    const k = `s${j}`;
    pieces.push({ key: k, shape: 'bank', w: [S.easy ? 150 : 110, S.easy ? 150 : 120], place: { kind: 'pit', after: prev, jump: 'jump', gapPx: S.easy ? [90, 96] : [112, 120], soft: true }, style: 'moss_stone', main: true, landing: true });
    sockets.push(petals(`p${k}`, k, 0.5, 1));
    prev = k;
  }
  pieces.push(ground('S', prev, 420), { ...bank('u1', 'S', 200, UP), main: false }, bank('z', 'u1', 240, UP));
  sockets.push({ id: 'e', role: 'enemy', on: 'S', t: 0.5, dn: 0, allow: ['snake'], easy: 'soften' }, mark('mu', 'u1', 0.5), mark('mz', 'z', 0.6));
  return { pieces, sockets };
}
/** [W] beat 7, he is the stone: her arrow points under, where an awake snake has its den on the low road, no tendril and no perch; over
 *  the den's near side one sagging creaky limb, a vine up to it. Ridden down, it comes down BESIDE the den (never on it) and the snake
 *  glides off (w1Cast.ts's falling limb); he lands on her road */
function stone(S: Set): Lay {
  const W = 400, D = 280;
  const xv = 200;
  const pieces: SectionPiece[] = [
    bank('a', null, 260), apron('U', 'a', W),
    vine('v', 'U', W, xv), atTop('L', 'v', 130, true),
    // (two short ledges past the den: under a flag's pad (160) and an animal's lay (248), so no flag stands near enough the den to empty
    //  its socket (a flag keeps every animal 224 px off: seed 4, the flag pass stood one on a 260 px bank beside it))
    ground('den', 'U', D), bank('m', 'den', 150), bank('n', 'm', 150), bank('z', 'n', 260),
  ];
  const sockets: Socket[] = [
    flag('a', 0.3), mark('ma', 'a', 0.6),
    { id: 'limb', role: 'prop', on: 'L', t: 0.5, dn: 0, allow: ['trap-limb'], group: 'den' },
    { id: 'e', role: 'enemy', on: 'den', t: 0.6, dn: 0, allow: ['snake'], easy: 'stay', group: 'den' },
    petals('pm', 'm', [0.3, 0.7], 1), mark('mn', 'n', 0.6), petals('pz', 'z', 0.5, 1),
  ];
  return { pieces, sockets };
}
/** [C] beat 8, the weave: both roads on screen, three switches at pace: the high road rots out (drop); an awake snake on the low road
 *  (vine up, two creaky limbs over it on a sound bough's ends); then the last crossing, where her arrow points UP for the first time:
 *  the soldiers crossed on a fallen trunk, rotten in two spans, and under it only soft dips (the creek's stand-in) */
function weave(S: Set): Lay {
  const W1 = 760, P = 300, G = 320, Q = 520, xb = 40, B = P - xb + G + 20;
  const pieces: SectionPiece[] = [
    bank('a', null, 240), bank('U', 'a', W1),
    vine('v', 'U', W1, 60), atTop('L1', 'v', S.late, true),
    over('L2', 'U', W1, 60 + S.late + S.lateGap, S.late, { creak: true }),
    apron('P', 'U', P), vine('v2', 'P', P, xb), atTop('B', 'v2', B),
    ground('S', 'P', G),
    apron('Q', 'S', Q),
    over('L3', 'Q', Q, 20 + S.lateGap, S.late, { creak: true }),
    over('L4', 'Q', Q, 20 + 2 * S.lateGap + S.late, S.late, { creak: true }),
    bank('z', 'Q', 300),
  ];
  const sockets: Socket[] = [
    flag('a', 0.3), mark('ma', 'a', 0.7), petals('pL1', 'L1', 0.5, 1), petals('pL2', 'L2', 0.5, 1),
    { id: 'e', role: 'enemy', on: 'S', t: 0.5, dn: 0, allow: ['snake'], easy: 'soften' },
    petals('pB', 'B', [0.2, 0.4], 2, 120), mark('mB', 'B', 0.7), petals('pL3', 'L3', 0.5, 1), petals('pL4', 'L4', 0.5, 1),
    mark('mz', 'z', 0.5),
  ];
  return { pieces, sockets };
}

/** THE ARC'S BRICKS (1-5.md), one job each: the graph's letter in brackets */
export const BEATS_15: SectionTemplate[] = [
  brick({ id: 'w1-15-through-or-over', name: 'through the hollow trunk or over it', jobs: ['flow'], content: 'ground', difficulty: 2, noCreak: true, versions: ([300, 360] as const).map((len) => ({ id: `trunk-${len}`, lay: throughOrOver(len) })) }),
  brick({ id: 'w1-15-creak-lesson', name: 'the top can drop you: the first creaky limb', jobs: ['teach'], content: 'crumble', teaches: 'creak', difficulty: 2, versions: [{ id: 'one-then-three', lay: lesson(NORMAL), easy: lesson(EASY) }] }),
  brick({ id: 'w1-15-her-road', name: 'her road or theirs: under past a sleeping snake, or over to the seed', jobs: ['practise'], content: 'climb', difficulty: 3, versions: [{ id: 'under-or-over', lay: herRoad(NORMAL), easy: herRoad(EASY) }] }),
  brick({ id: 'w1-15-blocked', name: 'blocked in turn: a gone limb, then an awake snake', jobs: ['test'], content: 'hazard', difficulty: 5, versions: [{ id: 'drop-then-climb', lay: blocked(NORMAL), easy: blocked(EASY) }] }),
  brick({ id: 'w1-15-big-sign', name: 'the big sign: the bough run or the creek', jobs: ['reward'], content: 'crumble', difficulty: 6, maxPerStage: 1, versions: [{ id: 'that-way-boughs', lay: boughRun(NORMAL), easy: boughRun(EASY) }, { id: 'this-way-creek', lay: creek(NORMAL), easy: creek(EASY) }] }),
  brick({ id: 'w1-15-stone', name: 'he is the stone: ride the limb down by the den', jobs: ['twist'], content: 'climb', difficulty: 5, versions: [{ id: 'limb-by-the-den', lay: stone(NORMAL), easy: stone(EASY) }] }),
  brick({ id: 'w1-15-weave', name: 'the weave: three switches at pace', jobs: ['signature'], maxPerStage: 1, content: 'hazard', difficulty: 7, versions: [{ id: 'three-switches', lay: weave(NORMAL), easy: weave(EASY) }] }),
];

// ───────────────────────────── 1-5's own quiet: its arrival, its rests and its exit ─────────────────────────────
const link = (o: { id: string; name: string; job: 'arrive' | 'rest'; versions: V[] }): SectionTemplate => ({
  ...brick({ id: o.id, name: o.name, jobs: [o.job], difficulty: 1, content: 'ground', versions: o.versions }),
  phases: [o.job === 'arrive' ? 'start' : 'rest'], content: 'structural', uses: [], terrain: 'floor-stones', ...(o.job === 'arrive' ? { maxPerStage: 1 } : {}),
} as SectionTemplate);
export const QUIET_15: SectionTemplate[] = [
  // [A] the walk in at dusk: the kapok's last roots, a petal folded in half low on a root (Dot: "She's making them last."), her first
  // mark on the trunk at marching height. Nothing here can hurt
  link({ id: 'w1-15-arrival', name: 'the walk in at dusk', job: 'arrive', versions: [
    { id: 'roots', lay: { pieces: [bank('a', null, 340), bank('b', 'a', 300, UP), bank('c', 'b', 460, DOWN), bank('z', 'c', 240)], sockets: [petals('pb', 'b', 0.5, 1), tip('tip', 'b', 0.3, 'last'), mark('mc', 'c', 0.7), petals('pz', 'z', 0.5, 1)] } },
  ] }),
  // [R] the rests: a root up and down, a flag on the bank between (World 1's step every few hundred px: seedList QUIET_MAX)
  link({ id: 'w1-15-rest-roots', name: 'a rest: over the roots', job: 'rest', versions: [[260, 300], [320, 360]].map((w, j) => ({
    id: j ? 'long' : 'short',
    lay: { pieces: [bank('a', null, w[0]), bank('b', 'a', 240, UP), bank('c', 'b', w[1], DOWN), bank('z', 'c', 220)], sockets: [flag('c', 0.5), petals('pb', 'b', 0.5, 1)] },
  })) }),
  link({ id: 'w1-15-rest-log', name: 'a rest: along a fallen log', job: 'rest', versions: [{ id: 'log', lay: { pieces: [bank('a', null, 260), bank('b', 'a', 520, UP), { key: 'f', shape: 'block', w: [300, 320], place: { kind: 'on', on: 'b', at: [0.2, 0.3], h: LOW }, style: 'log', main: false }, bank('c', 'b', 240, DOWN), bank('z', 'c', 220)], sockets: [flag('c', 0.5), petals('pf', 'f', 0.5, 2, 160)] } }] }),
  link({ id: 'w1-15-rest-dip', name: 'a rest: the dip between the roots', job: 'rest', versions: [[560, 600], [640, 680]].map((m, j) => ({
    id: j ? 'wide' : 'narrow',
    lay: { pieces: [bank('a', null, 260), bank('b', 'a', 220, UP), bank('m', 'b', m[0], DOWN), bank('c', 'm', 220, UP), bank('z', 'c', 220, DOWN)], sockets: [flag('m', 0.5), petals('pc', 'c', 0.5, 1)] },
  })) }),
  link({ id: 'w1-15-rest-hump', name: 'a rest: over the hump of a great root', job: 'rest', versions: [{ id: 'hump', lay: { pieces: [bank('a', null, 300), bank('m', 'a', 440, UP), bank('b', 'm', 240, DOWN), bank('z', 'b', 240)], sockets: [flag('b', 0.5), petals('pm', 'm', [0.3, 0.7], 2, 160)] } }] }),
  link({ id: 'w1-15-rest-stumps', name: 'a rest: two low stumps', job: 'rest', versions: [{ id: 'stumps', lay: { pieces: [bank('a', null, 300), bank('m', 'a', 760), { key: 's1', shape: 'block', w: [130, 140], place: { kind: 'on', on: 'm', at: [0.2, 0.22], h: [30, 36] }, style: 'moss_stone', landing: true }, { key: 's2', shape: 'block', w: [130, 140], place: { kind: 'on', on: 'm', at: [0.62, 0.64], h: [30, 36] }, style: 'moss_stone', landing: true }, bank('z', 'm', 240)], sockets: [flag('m', 0.45), petals('ps1', 's1', 0.5, 1), petals('ps2', 's2', 0.5, 1)] } }] }),
];
/** [E] her freshest mark: the far bank in last light, her last mark, the totem */
export const EXIT_15: SectionTemplate = {
  id: 'w1-15-freshest-mark', name: 'her freshest mark, and the totem', feel: [STAGE_15], own: true, archetypes: 'any', phases: ['goal'], difficulty: 1, needs: ['walk'], jobs: ['exit'], content: 'structural', terrain: 'floor-stones',
  pieces: [{ key: 'in', shape: 'bank', w: [300, 340], place: { kind: 'start' }, style: 'moss_stone', main: true, landing: true }],
  subBlocks: [{ id: 'body', versions: [{ id: 'bank', pieces: [{ key: 'out', shape: 'bank' as const, w: [560, 600] as R2, place: { kind: 'walk' as const, after: 'in', dy: [0, 0] as R2 }, style: 'moss_stone' as const, main: true, landing: true }], sockets: [mark('mout', 'out', 0.3), { id: 'exit-totem', role: 'objective' as const, on: 'out', t: 0.85, allow: ['exit_totem'] }] }] }],
  entry: { piece: 'in', kind: 'ground' }, exit: { piece: 'out', kind: 'ground' }, exitDy: 0, sockets: [], mirrorable: false,
} as SectionTemplate;

/** every section that is 1-5's own */
export const SECTIONS_15: SectionTemplate[] = [...BEATS_15, ...QUIET_15, EXIT_15];

/**
 * World 1's kit with 1-5's rows over it (stageTable.ts kit 'w1-15', listed.ts KITS): its pool is its own sections alone; it climbs (the
 * vines that join the two roads; 1-4 teaches the climb before it); its search graph and brief; the keeper's lines, the creaky lesson's a
 * TEACH line. World 1's creaky limb row is the world's own (w1.ts W1_CREAK)
 */
export function kitLib15(): WorldKit {
  const k = w1World(), M = k.manifest, G = M.graphs!;
  return { ...k, manifest: { ...M,
    moves: [...M.moves.filter((m) => m !== 'climb'), 'climb'],
    sections: SECTIONS_15,
    required: {},
    tips: { ...M.tips, ...LINES_15 },
    teachTips: [...(M.teachTips ?? []), 'creak'],
    graphs: { ...G, list: [...G.list.filter((g) => g.archetype !== 'relic_hunt'), ...Object.entries(ARC_15).map(([id, code]) => ({ id, archetype: 'relic_hunt' as const, code }))], briefs: { ...G.briefs, [STAGE_15]: BRIEF_15 } },
  } } as WorldKit;
}
