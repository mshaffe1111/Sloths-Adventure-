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
import type { GraphBrief, NodeJob, PropDef, PropEmitter, SectionPiece, SectionTemplate, Socket, WorldKit } from '../types.ts';
import type { DressPiece, OneName } from '../../dressArt.ts';
import { hollowLogSize } from '../../w1NewArt.ts';
import { w1World } from './w1.ts';
import { ROOM_12, THORN_ROW } from './w1Arc12.ts';

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
  // (every section pit is a hollow of 1-2's thorns, as 1-2 lays them: the soft pits the bricks mark, past the row's clearStart)
  cast: ['snake'], pits: 'hurt',
};
/** the story keeper's lines for 1-5, verbatim (STORY-LINES.md 11-12 "1-5 Where She Walked", approved by Matt 10:20 PM ET; and the kept
 *  one: "She's making them last", STORY-KEEPER.md:150). The only
 *  player words this file holds */
export const LINES_15 = {
  creak: 'Creaky limbs drop you, but only down to the roots!',
  sealed: "We missed some of her marks. They're back there!",
  last: "She's making them last.",
} as const;
/* (the fresher-petals line is 1-5's WAYSIDE story beat already, dotLinesData.ts way.1-5, said at the halfway mark in its new look's words,
 *  "She squashed this one extra flat."; as a tip too it was said twice a run, B15 stills 11-13) */
/** the keeper's lines HELD until what they speak of is on screen (World 1 has no leaf-sign art until ART paints it, and with the card
 *  road cut the roll, not the player, picks beat 6's stretch: "Your pick!" would be untrue). Approved by Matt 11-12 10:20 PM ET, verbatim */
export const HELD_15 = {
  /** Dot, before the curtain (beat 6): back with the signs and a pick he makes */
  sign: "Squirrels painted what's each way. Your pick!",
  /** Pokey, at the first THIS WAY / THAT WAY (beat 1) */
  joke: 'THIS WAY. THAT WAY. Thank you, squirrels.',
} as const;
/** the stage's MISSION line (the keeper's, approved by Matt 11-12 10:20 PM ET): stagePlan's, held equal by library15.test.ts */
export const MISSION_15 = 'She marked the way they took her. Follow her marks.';
// ───────────────────────────── the pieces ─────────────────────────────
/** how far over the low road the high road stands (px): 150-180 (sideways, 1-5.md "On a phone") */
const OVER = 165;
/** the low road's sound ground past the end of every piece of the high road over a thorn hollow (px): walked off at a run he falls about
 *  110 px on before he lands (the expert bot off beat 5's last limb, 11-13: 24 px of road past its end, he landed in the thorns and was
 *  set back onto the bough, round and round). A fall from over always lands on the low road (D46) */
const RUNOFF = 150;
const UP: R2 = [-56, -50], DOWN: R2 = [50, 56];
/** a bank he walks on (the low road, her road under), `w` exact so a deck over it is laid by px */
const bank = (key: string, after: string | null, w: number, dy: R2 = [0, 0]): SectionPiece => ({ key, shape: 'bank', w: [w, w], place: after ? { kind: 'walk', after, dy } : { kind: 'start' }, style: 'moss_stone', main: true });
/** a piece of the high road over bank `on` (`onW` wide), its left end `x` px along it, `dy` over its top (default the road's OVER). Never a
 *  `landing`: each setting's widths are its own here (Set), and Easy's 48 px landing pad on top of them laid a deck over the next root's
 *  step (a hop under a deck) and the den's limb over its snake (seed 1 Easy) */
const deck = (key: string, on: string, onW: number, x: number, w: number, o: { creak?: boolean; dy?: number; style?: 'branch' | 'log' } = {}): SectionPiece => ({
  key, shape: 'branch', w: [w, w], place: { kind: 'over', on, at: [x / onW, x / onW], dy: [-(o.dy ?? OVER), -(o.dy ?? OVER)] }, style: o.style ?? 'branch', ...(o.creak ? { creak: true } : {}),
});
/** the high road's piece over bank `on`; a creaky limb or a branch GROWS FROM A TRUNK (Matt 11-07, R-165.54: a skinny branch is attached,
 *  never floating; the lead's REDO 11-13): a World 1 climb trunk stands on the low road at its near end, the limb off its top. A log
 *  reads as a platform and may float (the stub, the seed's bough) */
const over = (key: string, on: string, onW: number, x: number, w: number, o: { creak?: boolean; dy?: number; style?: 'branch' | 'log' } = {}): SectionPiece[] =>
  (o.style ?? 'branch') === 'log' ? [deck(key, on, onW, x, w, o)] : [vine(`${key}+t`, on, onW, x, o.dy ?? OVER), deck(key, on, onW, x, w, o)];
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
const atTop = (key: string, v: string, w: number, creak = false): SectionPiece => ({ key, shape: 'branch', w: [w, w], place: { kind: 'over', on: v, at: [0, 0], dy: [0, 0] }, style: 'branch', ...(creak ? { creak: true } : {}) });
/** petals: `n` in a row over `span` px, low on what they stand on */
const petals = (id: string, on: string, t: R2 | number, n = 2, span = 110): Socket => ({ id, role: 'pickup', on, t, dn: 34, count: n, span });
/** her MARK (the stage's goal item, gen2 lays every one where it stands: pipeline's objective 'mark'), at marching height on her road */
const mark = (id: string, on: string, t: number): Socket => ({ id, role: 'objective', on, t, dn: 34, allow: ['mark'] });
const tip = (id: string, on: string, t: number, line: keyof typeof LINES_15): Socket => ({ id, role: 'tip', on, t, allow: [line] });
const flag = (on: string, t = 0.5): Socket => ({ id: 'flag', role: 'flag', on, t });

// ───────────────────────────── the squirrels' leaf-signs and the root tunnel (ART 11-13) ─────────────────────────────
/**
 * ART's 1-5 dressing as props (scenery: no threat, no beat): a socket asks for one, and its emitter lays the picture in the stage's dressing
 * (dressArt.ts ONE_DRESS, sized by the inventory) on the ground under the socket. The leaf-signs tell the truth about what is on the
 * screen past them (1-5.md: THAT WAY up, THIS WAY in/on/down); the root tunnel stands on her road's floor, its own floor on the ground.
 * The leaf curtain is not laid: it parts on the card road's pick (cut), and every bough at the big sign is a creaky limb (a curtain
 * hung from one would hang from nothing once it gave way).
 */
export const DRESS_15 = {
  'w15-sign-up': 'w15-leafsign-up', 'w15-sign-down': 'w15-leafsign-down', 'w15-sign-on': 'w15-leafsign-right', 'w15-tunnel': 'w15-roottunnel',
} as const satisfies Record<string, OneName>;
type Dress15 = keyof typeof DRESS_15;
export const PROPS_15: PropDef[] = (Object.keys(DRESS_15) as Dress15[]).map((id) => ({ id, tags: [id], w: 40, minApart: 0 }));
/** the ground under x at or below y (the top of the highest sound piece there), or y */
const groundAt = (out: Parameters<PropEmitter>[2], x: number, y: number): number =>
  Math.min(...out.platforms.filter((q) => q.type !== 'fragile' && !q.broken && q.y >= y - 2 && x >= q.x && x <= q.x + q.width).map((q) => q.y), Infinity) || y;
const dressEmit = (id: Dress15): PropEmitter => (f, _def, out) => {
  const dress = ((out.proto as { dress?: DressPiece[] }).dress ??= []);
  const b = groundAt(out, f.x, f.y);
  dress.push({ n: DRESS_15[id], x: Math.round(f.x), b: Math.round(Number.isFinite(b) ? b : f.y) });
};
export const EMIT_15: Record<string, PropEmitter> = Object.fromEntries((Object.keys(DRESS_15) as Dress15[]).map((id) => [id, dressEmit(id)]));
/** a leaf-sign or the tunnel at t along a piece (its middle there) */
const sign = (id: string, what: Dress15, on: string, t: number): Socket => ({ id, role: 'prop', on, t, dn: 0, allow: [what] });

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
function brick(o: { id: string; name: string; jobs: NodeJob[]; difficulty: number; content: 'ground' | 'climb' | 'hazard' | 'crumble'; teaches?: string; maxPerStage?: number; versions: V[]; /** no creaky limb in it (it may stand before the lesson) */ noCreak?: true; /** it shows a lesson the stage only RE-shows (1-2's thorns): it still uses the creaky limb */ reshows?: string }): SectionTemplate {
  const ren = (ps: SectionPiece[]) => { const a = ps[0].key, z = ps[ps.length - 1].key; const f = (s: string) => (s === a ? 'in' : s === z ? 'out' : s); return ps.map((p) => ({ ...p, key: f(p.key), place: Object.fromEntries(Object.entries(p.place).map(([q, v]) => [q, (q === 'after' || q === 'on') && typeof v === 'string' ? f(v) : v])) as SectionPiece['place'] })); };
  const sk = (ps: SectionPiece[], ss: Socket[]) => { const a = ps[0].key, z = ps[ps.length - 1].key; return ss.map((s) => ({ ...s, on: s.on === a ? 'in' : s.on === z ? 'out' : s.on })); };
  const first = ren(o.versions[0].lay.pieces)[0];
  const versions = o.versions.flatMap((v) => [
    { id: v.id, pieces: ren(v.lay.pieces).slice(1), sockets: sk(v.lay.pieces, v.lay.sockets), ...(v.easy ? { easy: `${v.id}-easy` } : {}) },
    ...(v.easy ? [{ id: `${v.id}-easy`, pieces: ren(v.easy.pieces).slice(1), sockets: sk(v.easy.pieces, v.easy.sockets), easyOnly: true }] : []),
  ]);
  const { versions: _v, noCreak: _n, reshows, ...rest } = o;
  return { ...rest, ...(reshows ? { teaches: reshows } : {}), feel: [STAGE_15], own: true, archetypes: 'any', phases: ['ki', 'sho', 'ten', 'ketsu'], needs: ['jump'], uses: o.teaches || o.noCreak ? [] : ['creak'], terrain: 'raised-logs', pieces: [first], subBlocks: [{ id: 'body', versions }], entry: { piece: 'in', kind: 'ground' }, exit: { piece: 'out', kind: 'ground' }, exitDy: 0, sockets: [], mirrorable: false } as SectionTemplate;
}

/** the settings' numbers: a creaky limb's length and the gap between two (steady to beat 4: one length, one gap, R-165.174; from beat 5
 *  shorter and wider). Normal's late gap is about 0.78 of his reach (pipeline maxGap: 175 px level), Easy's 0.6 with limbs 48 px longer */
interface Set { limb: number; gap: number; late: number; lateGap: number; easy: boolean; /** the low road's gaps over a soft dip from beat 5 on (her road is the hard one later: 1-5.md "Why each road") */ dip: R2 }
const NORMAL: Set = { limb: 140, gap: 60, late: 124, lateGap: 132, easy: false, dip: [136, 143] };
const EASY: Set = { limb: 170, gap: 50, late: 160, lateGap: 104, easy: true, dip: [104, 112] };
/** a bank past a gap over a hollow of 1-2's THORNS on the low road (World 1's hurt floor, taught in 1-2 and back here: everything builds
 *  on everything, STAGE-RULES §0.1; a miss is a heart and a set-back on Normal, a set-back on Easy, and every creaky limb is whole again):
 *  only where no deck stands over it (no ceiling in the jump, D46). Normal's gap is the widest the lay takes at Normal's margin (pipeline maxGap: 143 px level), Easy's about three quarters of it; never a landing
 *  pad on top of it (each setting's gap is its own) */
const dip = (key: string, after: string, w: number, S: Set): SectionPiece => ({ key, shape: 'bank', w: [w, w], place: { kind: 'jump', after, dy: [0, 0], gapPx: S.dip, soft: true }, style: 'moss_stone', main: true });

// ───────────────────────────── the beats ─────────────────────────────
/*
 * THE QUIET LINE (seedList QUIET_MAX 4 s, the list's own rule on Normal's route): on the low road a hop UP a root (50-56 px: a step down
 * or a log 25 px thick is walked) at most 450 px into a beat and from its end, and at most about 950 px between two (3.5 s at a walk).
 * Never a step up UNDER a deck (his jump tops out 171 px up, past the deck's underside: a ceiling in the arc, D46): a deck stands over flat
 * ground, the hops in the open between decks.
 */
/** [M] beat 1, through or over: 1-1's hollow log grown, one big fallen trunk; petals leading to its mouth (the low road, through it) and
 *  along its top (the high road, a stump step up, a stump and a bank down); her mark past it where both roads meet. Nothing here can hurt
 *  (no petal or mark stands INSIDE the trunk: levelCheck reads the shell's box as solid, and took them out) */
function throughOrOver(len: 300 | 360): Lay {
  const hh = hollowLogSize('moss', len).height;
  const W = len + 900;
  const pieces: SectionPiece[] = [
    // (the trunk's floor stays on the root's level: sunk between two roots it was a dip a one-thumb player left with 4 flicks, stone, trunk,
    //  stone, root; plainWalk.test.ts allows 3)
    bank('a', null, 300), bank('a2', 'a', 200, UP), bank('f', 'a2', W),
    { key: 's', shape: 'block', w: [154, 160], place: { kind: 'on', on: 'f', at: [0.06, 0.07], h: [50, 56] }, style: 'moss_stone', landing: true },
    { key: 'H', shape: 'hollow', w: [len, len], place: { kind: 'on', on: 'f', at: [0.26, 0.27], h: [hh, hh] }, landing: true },
    { key: 'm', shape: 'block', w: [130, 140], place: { kind: 'on', on: 'f', at: [0.68, 0.69], h: [50, 56] }, style: 'moss_stone', landing: true },
    bank('z1', 'f', 220, UP), bank('z', 'z1', 240, DOWN),
  ];
  const sockets: Socket[] = [
    // (the squirrels' first leaf-signs: THIS WAY on into the trunk, THAT WAY up and over it)
    sign('sgon', 'w15-sign-on', 'a', 0.55), sign('sgup', 'w15-sign-up', 'a', 0.85),
    petals('pa', 'a2', 0.5, 1), petals('pin', 'f', [0.19, 0.2], 2, 70), petals('ptop', 'H', [0.35, 0.65], 2, 140), mark('mz', 'z', 0.6),
  ];
  return { pieces, sockets };
}
/** [T] beat 2, the top can drop you (the lesson): a flag and Dot's line 800 px and more before the first limb; a root up and down; a vine
 *  up to ONE creaky limb that gives way and drops him onto petals; a root; a straight vine back up to three limbs of the same length and
 *  gap; down off the last. Every limb here is over the bank (never needed: creak.ts, the lesson's own) */
function lesson(S: Set): Lay {
  const W1 = 420, x1 = 120;
  const W2 = 40 + 3 * S.limb + 2 * S.gap + 100;
  const pieces: SectionPiece[] = [
    bank('a', null, 300), bank('b', 'a', 260, UP), bank('c', 'b', 220, DOWN),
    bank('U', 'c', W1), vine('v1', 'U', W1, x1), atTop('L0', 'v1', S.limb, true),
    bank('r1', 'U', 160, UP), bank('r2', 'r1', 140, DOWN),
    bank('V', 'r2', W2), vine('v2', 'V', W2, 40), atTop('L1', 'v2', S.limb, true),
    ...over('L2', 'V', W2, 40 + S.limb + S.gap, S.limb, { creak: true }),
    ...over('L3', 'V', W2, 40 + 2 * (S.limb + S.gap), S.limb, { creak: true }),
    bank('r3', 'V', 200, UP), bank('z', 'r3', 260, DOWN),
  ];
  const sockets: Socket[] = [
    flag('a', 0.3), tip('tip', 'a', 0.25, 'creak'),
    petals('pb', 'b', [0.4, 0.6], 1), petals('pfall', 'U', (x1 + S.limb / 2) / W1, 3, 120),
    petals('pL1', 'L1', 0.5, 1), petals('pL2', 'L2', 0.5, 1), petals('pL3', 'L3', 0.5, 1),
    mark('mU', 'V', (40 + 2 * S.limb + 1.5 * S.gap) / W2), petals('pr3', 'r3', 0.5, 1),
  ];
  return { pieces, sockets };
}
/** [P] beat 4, her road or theirs: her mark at the split; UNDER (her road), the sound root way, petals and her next mark; OVER (the
 *  squirrels'), a vine up and three creaky limbs on the same beat to a short sound bough with the golden seed, down before the first snake
 *  of the stage, which sleeps on a log under a stone with its tendril beside him (shared ground: both roads meet before it) */
function herRoad(S: Set): Lay {
  const xv = 40, seedX = xv + 3 * S.limb + 3 * S.gap;
  const W = seedX + 110 + 30;
  const t = trapped('t', 'r', true);
  const pieces: SectionPiece[] = [
    bank('a', null, 160), bank('a2', 'a', 260, UP), bank('U', 'a2', W, DOWN),
    vine('v', 'U', W, xv), atTop('L1', 'v', S.limb, true),
    ...over('L2', 'U', W, xv + S.limb + S.gap, S.limb, { creak: true }),
    ...over('L3', 'U', W, xv + 2 * (S.limb + S.gap), S.limb, { creak: true }),
    ...over('hi', 'U', W, seedX, 110, { style: 'log' }),
    bank('r', 'U', 160, UP), ...t.pieces,
    bank('m', t.last, 300, DOWN), bank('n', 'm', 200, UP), bank('z', 'n', 240, DOWN),
  ];
  const sockets: Socket[] = [
    mark('ma', 'a', 0.75), sign('sgup', 'w15-sign-up', 'a2', 0.6), sign('tun', 'w15-tunnel', 'm', 0.5),
    petals('pU', 'U', 0.12, 2, 80), mark('mU', 'U', (xv + 2 * S.limb + 1.5 * S.gap) / W), petals('pL2', 'L2', 0.5, 1),
    { id: 'seed', role: 'find', on: 'hi', t: 0.5, dn: 34 },
    ...t.sockets,
    petals('pm', 'm', 0.6, 1), petals('pn', 'n', 0.5, 1),
  ];
  return { pieces, sockets };
}
/** [X] beat 5, blocked in turn (and where 1-2's thorns come back: its first bank is the hollows' SHOWING piece, `show`, the thorn bed
 *  in plain view past its end before any is asked: World 1's hurt-floor rule, promises11 hazard.untaught): up on the high road a limb is already gone (a broken stub and nothing past it): drop to her road; then an
 *  awake snake paces across the low road: up the vine, over it on a sound bough (her mark on it), on along a creaky limb, down */
function blocked(S: Set): Lay {
  const xv = 40, P = 240, G = 300, Qa = 40 + S.lateGap + S.late + RUNOFF;
  const W1 = xv + 2 * S.late + 2 * S.lateGap + 60 + RUNOFF;
  const B = P - xv + G + 40;
  const pieces: SectionPiece[] = [
    // (the keepsake's LONE TREE (finds.ts DOT_HINTS w1_keepsake: "Climb the lone tree in Where She Walked. Check its branch."; 1-5.md
    //  "Story promises"): a trunk on the beat's first bank and one short branch off its top, over that bank alone)
    bank('a', null, 220), vine('tv', 'a', 220, 40), atTop('tree', 'tv', 120),
    bank('a2', 'a', 180, UP), bank('show', 'a2', W1, DOWN),
    vine('v', 'show', W1, xv), atTop('L1', 'v', S.late, true),
    ...over('L2', 'show', W1, xv + S.late + S.lateGap, S.late, { creak: true }),
    // (the stub: a short sound end, then nothing: the way on is down)
    ...over('stub', 'show', W1, xv + 2 * (S.late + S.lateGap), 60, { style: 'log' }),
    dip('r', 'show', 160, S),
    // (the snake's ground between two aprons; up the vine on the first, over it on a sound bough, on along a creaky limb, down)
    apron('P', 'r', P), vine('v2', 'P', P, xv), atTop('B1', 'v2', B),
    ground('S', 'P', G),
    apron('Q', 'S', Qa), ...over('L3', 'Q', Qa, 40 + S.lateGap, S.late, { creak: true }),
    dip('Qb', 'Q', 240, S), dip('z', 'Qb', 340, S),
  ];
  const sockets: Socket[] = [
    mark('ma', 'a', 0.75), petals('pL1', 'L1', 0.5, 1), petals('pL2', 'L2', 0.5, 1),
    { id: 'keep', role: 'findSpot', on: 'tree', t: 0.6, dn: 30 },
    { id: 'e', role: 'enemy', on: 'S', t: 0.5, dn: 0, allow: ['snake'], easy: 'soften' },
    // (her road goes OVER the awake snake (1-5.md beat 5, "her arrows mark the line"): her mark on the sound bough, a petal either side;
    //  a player on the low road walks under it and misses it. Marks stand where he walks, never on a hop's root or a bank he can jump
    //  clean over. The bots go up for it: tools/inspect/markClimb.ts)
    petals('pB1a', 'B1', 0.2, 1), mark('mB', 'B1', 0.5), petals('pB1b', 'B1', 0.82, 1), petals('pL3', 'L3', 0.5, 1),
    mark('mz', 'z', 0.72),
  ];
  return { pieces, sockets };
}
/** [H] beat 6, the big sign (a plain sign pair; the card road is cut, 1-5.md:27): ONE of the two stretches, the roll's pick (Dot's
 *  sign line is held: HELD_15). THAT WAY: up a vine to the bough run, three decks of creaky limbs with a sound perch between them, the low road hopping a root in
 *  the open under each perch; THIS WAY: the root ramp down to the creek's stepping roots over soft dips (stand-in for the water, named in
 *  the report), one awake snake on the far bank */
function boughRun(S: Set): Lay {
  const pieces: SectionPiece[] = [bank('a', null, 220), bank('a2', 'a', 260, UP)];
  const sockets: Socket[] = [flag('a', 0.3), mark('ma', 'a', 0.75), sign('sgup', 'w15-sign-up', 'a2', 0.6)];
  let prev = 'a2';
  for (let d = 0; d < 3; d++) {
    // (a deck: a vine up from the low road, two creaky limbs, a sound perch at its end over the next root; the low road under it flat)
    const D = `D${d}`, W = 40 + 2 * S.late + S.lateGap + RUNOFF;
    pieces.push(d ? bank(D, prev, W) : bank(D, prev, W, DOWN), vine(`v${d}`, D, W, 40), atTop(`${D}a`, `v${d}`, S.late, true), ...over(`${D}b`, D, W, 40 + S.late + S.lateGap, S.late, { creak: true }));
    // (THAT WAY's two marks: one at the vine up, one on the run's middle limb, her road)
    sockets.push(d === 1 ? mark('mD', `${D}a`, 0.5) : petals(`p${D}a`, `${D}a`, 0.5, 1), petals(`p${D}b`, `${D}b`, 0.5, 1));
    pieces.push(dip(`${D}r`, D, 220, S));
    prev = `${D}r`;
  }
  pieces.push(dip('z', prev, 340, S));
  // (a mark stands where he WALKS: 240 px and more past a landing, never where a fast runner is still in the air; the expert flew over
  //  marks laid 110 px past a dip, 11-13)
  sockets.push(mark('mz', 'z', 0.72));
  return { pieces, sockets };
}
function creek(S: Set): Lay {
  const pieces: SectionPiece[] = [bank('a', null, 220), bank('a2', 'a', 260, UP), bank('r1', 'a2', 200, DOWN), bank('r2', 'r1', 200, DOWN)];
  const sockets: Socket[] = [flag('a', 0.3), mark('ma', 'a', 0.75), sign('sgdn', 'w15-sign-down', 'a2', 0.6)];
  let prev = 'r2';
  for (let j = 0; j < 7; j++) {
    const k = `s${j}`;
    // (the fourth root is an island a flag can stand on: the creek's hollows make it a span where a heart can be lost, and the flag pass
    //  needs a bank 160 px and more inside it, 2,300 px at most from the last flag)
    const w: R2 = j === 3 ? [320, 340] : S.easy ? [150, 150] : [110, 120];
    pieces.push({ key: k, shape: 'bank', w, place: { kind: 'jump', after: prev, dy: [0, 0], gapPx: S.easy ? [96, 104] : [132, 140], soft: true }, style: 'moss_stone', main: true });
    sockets.push(petals(`p${k}`, k, 0.5, 1));
    prev = k;
  }
  pieces.push(ground('S', prev, 400), { ...bank('u1', 'S', 200, UP), main: false }, bank('u2', 'u1', 220, UP), bank('z', 'u2', 240));
  sockets.push({ id: 'e', role: 'enemy', on: 'S', t: 0.5, dn: 0, allow: ['snake'], easy: 'soften' }, mark('mz', 'z', 0.5));
  return { pieces, sockets };
}
/** [W] beat 7, he is the stone: her arrow points under, where an awake snake has its den on the low road, no tendril and no perch; over
 *  the den's near side one sagging creaky limb, a vine up to it. Ridden down, it comes down BESIDE the den (never on it) and the snake
 *  glides off (w1Cast.ts's falling limb); he lands on her road */
function stone(S: Set): Lay {
  // (the den is SHORT, a trapped snake's 100 px patch: the limb chases off what stands within TRAP.scare (170 px) of where it lands, so
  //  the whole patrol is inside that from a limb whose far end stops at the patrol's near end: 1-5 seed 1, a snake pacing a 232 px
  //  patch stayed put when the limb came down at its far end. The trunk stands 120 px from the patch, past a strike's 105)
  const W = 400, D = 150, LW = 120;
  const xv = W - LW + 24;
  const pieces: SectionPiece[] = [
    bank('a', null, 220), bank('a2', 'a', 180, UP), { ...apron('U', 'a2', W), place: { kind: 'walk', after: 'a2', dy: DOWN } },
    vine('v', 'U', W, xv), atTop('L', 'v', LW, true),
    // (two short ledges past the den: under a flag's pad (160) and an animal's lay (248), so no flag stands near enough the den to empty
    //  its socket (a flag keeps every animal 224 px off: seeds 4 and 7, a flag beside it))
    ground('den', 'U', D), bank('m', 'den', 150), dip('o', 'm', 240, S), dip('z', 'o', 340, S),
  ];
  const sockets: Socket[] = [
    flag('a', 0.3), mark('ma', 'a', 0.75),
    { id: 'limb', role: 'prop', on: 'L', t: 0.5, dn: 0, allow: ['trap-limb'], group: 'den' },
    { id: 'e', role: 'enemy', on: 'den', t: 0.5, dn: 0, allow: ['snake-trapped'], easy: 'stay', group: 'den' },
    petals('pm', 'm', 0.5, 1), petals('po', 'o', 0.5, 1), mark('mn', 'z', 0.72),
  ];
  return { pieces, sockets };
}
/** [C] beat 8, the weave: both roads on screen, switches at pace: the high road rots out (drop); an awake snake on the low road (vine up,
 *  over it on a sound bough with her mark, two creaky limbs on past it); down to the far bank */
function weave(S: Set): Lay {
  const W1 = 40 + 2 * S.late + S.lateGap + 160, P = 240, G = 300, Qa = 20 + S.lateGap + S.late + RUNOFF, xb = 40;
  const B = P - xb + G + 20;
  const pieces: SectionPiece[] = [
    bank('a', null, 200), bank('a2', 'a', 180, UP), bank('U', 'a2', W1, DOWN),
    vine('v', 'U', W1, 40), atTop('L1', 'v', S.late, true),
    ...over('L2', 'U', W1, 40 + S.late + S.lateGap, S.late, { creak: true }),
    dip('r', 'U', 160, S),
    apron('P', 'r', P), vine('v2', 'P', P, xb), atTop('B', 'v2', B),
    ground('S', 'P', G),
    apron('Q', 'S', Qa),
    ...over('L3', 'Q', Qa, 20 + S.lateGap, S.late, { creak: true }),
    dip('Qb', 'Q', 240, S), dip('z', 'Qb', 340, S),
  ];
  const sockets: Socket[] = [
    flag('a', 0.3), mark('ma', 'a', 0.75), petals('pL1', 'L1', 0.5, 1), petals('pL2', 'L2', 0.5, 1),
    { id: 'e', role: 'enemy', on: 'S', t: 0.5, dn: 0, allow: ['snake'], easy: 'soften' },
    // (her road goes over the snake: her mark on the sound bough, as in beat 5)
    petals('pBa', 'B', 0.2, 1), mark('mB', 'B', 0.5), petals('pBb', 'B', 0.82, 1), petals('pL3', 'L3', 0.5, 1),
    mark('mz', 'z', 0.72),
  ];
  return { pieces, sockets };
}

/** THE ARC'S BRICKS (1-5.md), one job each: the graph's letter in brackets */
export const BEATS_15: SectionTemplate[] = [
  brick({ id: 'w1-15-through-or-over', name: 'through the hollow trunk or over it', jobs: ['flow'], content: 'ground', difficulty: 2, noCreak: true, versions: ([300, 360] as const).map((len) => ({ id: `trunk-${len}`, lay: throughOrOver(len) })) }),
  brick({ id: 'w1-15-creak-lesson', name: 'the top can drop you: the first creaky limb', jobs: ['teach'], content: 'crumble', teaches: 'creak', difficulty: 2, versions: [{ id: 'one-then-three', lay: lesson(NORMAL), easy: lesson(EASY) }] }),
  brick({ id: 'w1-15-her-road', name: 'her road or theirs: under past a sleeping snake, or over to the seed', jobs: ['practise'], content: 'climb', difficulty: 3, versions: [{ id: 'under-or-over', lay: herRoad(NORMAL), easy: herRoad(EASY) }] }),
  brick({ id: 'w1-15-blocked', name: 'blocked in turn: a gone limb, then an awake snake', jobs: ['test'], content: 'hazard', difficulty: 5, reshows: THORN_ROW.lesson, versions: [{ id: 'drop-then-climb', lay: blocked(NORMAL), easy: blocked(EASY) }] }),
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
    { id: 'roots', lay: { pieces: [bank('a', null, 340), bank('b', 'a', 300, UP), bank('c', 'b', 460, DOWN), bank('d', 'c', 240, UP), bank('e', 'd', 220, DOWN), bank('z', 'e', 240)], sockets: [petals('pb', 'b', 0.5, 1), tip('tip', 'b', 0.3, 'last'), mark('mc', 'c', 0.7), petals('pd', 'd', 0.5, 1), petals('pz', 'z', 0.5, 1)] } },
  ] }),
  // [R] the rests: a flag on a bank, a root to hop every few hundred px (the quiet line: a hop within 450 px of each end, none 950 apart)
  link({ id: 'w1-15-rest-roots', name: 'a rest: over the roots', job: 'rest', versions: [[300, 360], [340, 420]].map((w, j) => ({
    id: j ? 'long' : 'short',
    lay: { pieces: [bank('a', null, w[0]), bank('b', 'a', 240, UP), bank('c', 'b', w[1], DOWN), bank('d', 'c', 220, UP), bank('z', 'd', 260, DOWN)], sockets: [flag('c', 0.5), petals('pb', 'b', 0.5, 1), petals('pd', 'd', 0.5, 1)] },
  })) }),
  link({ id: 'w1-15-rest-log', name: 'a rest: along a fallen log', job: 'rest', versions: [{ id: 'log', lay: { pieces: [bank('a', null, 300), bank('b', 'a', 420, UP), { key: 'f', shape: 'block', w: [280, 300], place: { kind: 'on', on: 'b', at: [0.1, 0.15], h: LOW }, style: 'log', main: false }, bank('c', 'b', 300, DOWN), bank('d', 'c', 220, UP), bank('z', 'd', 260, DOWN)], sockets: [flag('c', 0.5), petals('pf', 'f', 0.5, 2, 160), petals('pd', 'd', 0.5, 1)] } }] }),
  link({ id: 'w1-15-rest-dip', name: 'a rest: the dip between the roots', job: 'rest', versions: [[560, 600], [640, 680]].map((m, j) => ({
    id: j ? 'wide' : 'narrow',
    lay: { pieces: [bank('a', null, 300), bank('b', 'a', 220, UP), bank('m', 'b', m[0], DOWN), bank('c', 'm', 220, UP), bank('z', 'c', 300, DOWN)], sockets: [flag('m', 0.5), petals('pc', 'c', 0.5, 1)] },
  })) }),
  link({ id: 'w1-15-rest-hump', name: 'a rest: over the hump of a great root', job: 'rest', versions: [{ id: 'hump', lay: { pieces: [bank('a', null, 320), bank('m', 'a', 440, UP), bank('b', 'm', 300, DOWN), bank('y', 'b', 220, UP), bank('z', 'y', 260, DOWN)], sockets: [flag('b', 0.5), petals('pm', 'm', [0.3, 0.7], 2, 160)] } }] }),
  link({ id: 'w1-15-rest-stumps', name: 'a rest: two stumps to hop', job: 'rest', versions: [{ id: 'stumps', lay: { pieces: [bank('a', null, 260), bank('m', 'a', 760), { key: 's1', shape: 'block', w: [130, 140], place: { kind: 'on', on: 'm', at: [0.15, 0.16], h: [50, 56] }, style: 'moss_stone', landing: true }, { key: 's2', shape: 'block', w: [130, 140], place: { kind: 'on', on: 'm', at: [0.62, 0.63], h: [50, 56] }, style: 'moss_stone', landing: true }, bank('z1', 'm', 200, UP), bank('z', 'z1', 240, DOWN)], sockets: [flag('m', 0.4), petals('ps1', 's1', 0.5, 1), petals('ps2', 's2', 0.5, 1)] } }] }),
];
/** [E] her freshest mark: the far bank in last light, her last mark, the totem */
export const EXIT_15: SectionTemplate = {
  id: 'w1-15-freshest-mark', name: 'her freshest mark, and the totem', feel: [STAGE_15], own: true, archetypes: 'any', phases: ['goal'], difficulty: 1, needs: ['walk'], jobs: ['exit'], content: 'structural', terrain: 'floor-stones',
  pieces: [{ key: 'in', shape: 'bank', w: [300, 340], place: { kind: 'start' }, style: 'moss_stone', main: true, landing: true }],
  subBlocks: [{ id: 'body', versions: [{ id: 'bank', pieces: [{ key: 'out', shape: 'bank' as const, w: [560, 600] as R2, place: { kind: 'walk' as const, after: 'in', dy: [0, 0] as R2 }, style: 'moss_stone' as const, main: true, landing: true }], sockets: [mark('mout', 'out', 0.3), { id: 'exit-totem', role: 'objective' as const, on: 'out', t: 0.85, allow: ['exit_totem'] }] }] }],
  // (both squirrels' signs say THIS WAY, 1-5.md beat 9: on the far bank between her freshest mark and the shrine, off the bank the flag
  //  pass takes: on it a flag and its heart stood over the second sign, the Easy still 11-13)
  entry: { piece: 'in', kind: 'ground' }, exit: { piece: 'out', kind: 'ground' }, exitDy: 0, sockets: [sign('sg1', 'w15-sign-on', 'out', 0.5), sign('sg2', 'w15-sign-on', 'out', 0.65)], mirrorable: false,
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
  return { ...k, emit: { ...k.emit, ...EMIT_15 }, manifest: { ...M,
    props: [...M.props, ...PROPS_15],
    moves: [...M.moves.filter((m) => m !== 'climb'), 'climb'],
    sections: SECTIONS_15,
    // (1-2's thorn hollows, World 1's hurt floor, under the low road's later gaps: a heart and a set-back on Normal, a set-back on Easy)
    hurtFloor: THORN_ROW,
    // (room under the floor line for the hollows' depth (THORN_ROW 150-170 px), as 1-2's kit gives it: with World 1's own 80 px the
    //  hollow fell outside the corridor and no jump over it linked)
    corridor: { ...M.corridor, bottom: M.ground.y + ROOM_12 },
    // (the moves 1-1 taught, as 1-2's kit has them: the level check links a jump over a thorn hollow with the double he has had since
    //  1-1; with no row it linked single jumps only, and no hollow over 109 px was crossed)
    lessons: { jump: '1-1', double: '1-1', bounce: '1-1' },
    required: {},
    tips: { ...M.tips, ...LINES_15 },
    // (every line of the keeper's here is a TEACH line: Dot says it on Normal's default Tips as on Help, D50)
    teachTips: [...(M.teachTips ?? []), 'creak', 'last'],
    graphs: { ...G, list: [...G.list.filter((g) => g.archetype !== 'relic_hunt'), ...Object.entries(ARC_15).map(([id, code]) => ({ id, archetype: 'relic_hunt' as const, code }))], briefs: { ...G.briefs, [STAGE_15]: BRIEF_15 } },
  } } as WorldKit;
}
