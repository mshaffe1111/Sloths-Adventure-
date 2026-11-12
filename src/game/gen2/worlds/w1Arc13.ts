/**
 * 1-3 Branch Snakes, the level as DESIGNED (reference/design/1-3.md; scored on reference/design/LEVEL-BAR.md): World 1's rows for it.
 * ONE graph, one brick a beat, each with a job no other section of the stage's pool serves, so every roll is the same level in the
 * same order with its own small differences (which load hangs where, the banks' lengths, the dressing). WORLD DATA: no engine line
 * names this stage; w1.ts adds these rows to World 1's kit and gen2/worlds/stageTable.ts lists the stage.
 *
 * Its pool is its own: these bricks, the ground exit below, and of World 1's library only the quiet sections tagged for it (the
 * arrivals and the rests: w1.ts). No section that teaches or tests another level's lesson is dealt into it (LEVEL-BAR A3).
 */
import type { GraphBrief, NodeJob, SectionPiece, SectionTemplate, Socket } from '../types.ts';

/** the stage these rows are for: the tag its sections carry (stagePool) and the key of its brief */
export const STAGE_13 = '1-3';
type R2 = [number, number];

/** 1-3's ONE graph: the designed arc (reference/design/1-3.md), beat by beat. Every content job in it is served by exactly one
 *  brick below, so a roll cannot reorder the level: T the lesson, P again (awake), M the stone on the stair, X the other way (no
 *  trap), W the perch, S the gallery, C the finale; R the flags between. (V4: the twist after the test; V5: a rest after X, W, S) */
export const PURGE_13: Record<string, string> = { 'purge-13-arc': 'A T P M R X R W R S R C E' };
/** 1-3's brief, all of it data: a purge on the ground and the low logs, its cast the snake */
export const BRIEF_13: GraphBrief = {
  // (the deal is the arc's own: T and P on the ground, M and W up a step (climb), X and C the snake with no trap (hazard): two of
  // each, so no type passes V11's 40% and no two neighbours share one but the teach and its practice)
  ends: 'quiet', trend: 'level', branching: 'none', teaches: ['traps'], deal: { ground: 34, climb: 33, hazard: 33 }, dealExact: true,
  cast: ['snake'],
};
/** the story keeper's lines for 1-3, verbatim (the lead, 11-12 12:50 PM; reference/packets/2026-11-12/STORY-LINES.md): the only
 *  player words this file holds. The lesson's two (said at the lesson's flag, one after the other) and the bare branch's one */
export const LINES_13 = {
  traps: 'See that hive? Punch the vine, down it comes!',
  'traps.then': "Don't worry, it only gives him a fright.",
  bare: 'No vine? Walk him to the end of his branch.',
} as const;
/** the stage's MISSION line (the keeper's; it replaces the withdrawn "Knock the snakes off the branches..."): stagePlan's, when 1-3 ships */
export const MISSION_13 = 'Clear the branches. Shake a vine and the snakes glide off.';
export const TRAP_LINE = LINES_13.traps;
// ───────────────────────────── the drop-trap twist bricks (1-3's own) ─────────────────────────────
/**
 * THE PHONE'S NUMBERS (w1Cast.ts's header, measured on stills of a roll): from its handle a trap's hung load is 140-190 px on, over
 * the middle of its snake's 122 px patch, so the vine, the load and the whole patch are on an upright phone's screen; the handle's
 * socket is 85-130 px before the load's (the near end of the patch); no ledge beside a handle is long enough for another animal to
 * be laid or topped up on (every one under 248 px: a patrol's 200 plus the lay's 24 px margins).
 * The lay keeps an animal 120 px from any prop (pipeline ANY_APART), its own trap's load socket included: so the load's SOCKET sits
 * at the patch's near end and the snake's at its far end, and `armedTraps` hangs the load over the patch's middle.
 */
/** a ledge he walks or steps onto: no `landing` (Easy widens a landing by 48 px, EASY_LANDING: every px here is the phone's, and a
 *  ledge 48 px longer is one an animal can be topped up on, beside a handle; measured, Easy's first cut hung no pair at all) */
const led = (key: string, after: string | null, w: R2, dy: R2 = [0, 0]): SectionPiece => ({ key, shape: 'bank', w, place: after ? { kind: 'walk', after, dy } : { kind: 'start' }, style: 'moss_stone', main: true });
const UP: R2 = [-56, -50], DOWN: R2 = [50, 56];
/** the level's one jump that matters (Normal's finale): a gap of 90-110 px, level, the drop under it soft */
const HOP: R2 = [90, 110];
/** a fallen branch across the road: a step up onto it (50-56 px) and a step down off it, its two ends the snake's world. Its own
 *  piece, off the `main` list (the lay stands no flag on it and tops no second animal up onto it) and no `landing` (Easy would widen
 *  it by its landing pad, and the sockets would slide along it) */
const log = (key: string, after: string, w: R2, dy: R2 = UP): SectionPiece => ({ key, shape: 'bank', w, place: { kind: 'walk', after, dy }, style: 'log', main: false });
/** a ledge no animal can be laid on (under 248 px), and a short one under a flag's pad (pipeline FLAG_SPAN.pad 160): a flag keeps
 *  every animal 224 px off (patchFor), and one at the end of a wide ledge beside a branch emptied the snake's socket, so the load
 *  hung over nothing (measured: 86 of 404 traps on Normal before the short ledges stood either side of every branch) */
const LEDGE: R2 = [230, 240], NARROW: R2 = [150, 155];
/** a trapped snake's branch: its patch 122 px (the branch less the lay's 24 px at each end), one width so every px below holds */
const SHORT: R2 = [170, 170];
/** a bare branch (no trap: the punch off its end, or the vault): the awake snake's own 200 px and more; Easy's is wider */
const LONG: R2 = [350, 370], WIDE: R2 = [400, 420];
/** on a trapped branch: the load's line 24 px in (the patch's near end), the snake's socket 122 px on, at the patch's far end
 *  (a socket outside its piece's patch is left empty, pipeline patchFor; an animal under 120 px from a prop is not laid) */
const LOAD_T = 0.142, SNAKE_T = 0.857;
/** the handle on the short ledge before the branch: 84-86 px before the branch, so 108-110 px before its load's socket (the pair's
 *  85-130), which is the nearest the snake can come (it strikes within 105), and 169-171 px before the middle of the snake's patch,
 *  where the load is hung (w1Cast.ts armedTraps) */
const HANDLE_T = 0.443;
const low = (id: string, on: string, t: R2 | number, count = 2): Socket => ({ id, role: 'pickup', on, t, dn: 34, count, span: 120 });
type Load = 'trap-hive' | 'trap-stone';
interface Unit { asleep?: boolean; load?: Load | null; perch?: boolean; wide?: boolean; easy?: Socket['easy']; /** a HOP before this branch's ledge: a real jump in 1-1's taught band over a soft drop (a miss is a short walk back, never a life) */ hop?: boolean; /** the branch level with its ledges (the lesson: the first hive is clear of the goal sign on a sideways phone) */ level?: boolean }
/**
 * One snake's branch, after the piece `after`: a short ledge `<k>g`, the branch `<k>L` a step up, a short ledge `<k>d` a step down.
 * With a `load`: the handle on `<k>g`, the load and a short-patch snake on the branch. `perch`: `<k>g` is the step up (the vine is
 * up on a perch), the branch a step down from it and `<k>d` a step lower still, so the branch keeps its far end; the piece after
 * steps back up (`rise`). No load: a long branch and the awake snake's full patrol.
 */
function core(k: string, after: string, o: Unit = {}): { pieces: SectionPiece[]; sockets: Socket[]; last: string; rise: boolean } {
  const g = `${k}g`, L = `${k}L`, d = `${k}d`;
  const perch = !!(o.perch && o.load);
  const flat: R2 = [0, 0];
  // (a TRAPPED branch lies level with the ledge its handle is on: a branch a step up lifted its load behind the goal sign on a
  // sideways phone (stills, the gallery, 11-12). A bare branch keeps its step up; a perch's branch is a step below its vine)
  const lvl = o.level ?? (!!o.load && !perch);
  const first: SectionPiece = o.hop ? { key: g, shape: 'bank', w: NARROW, place: { kind: 'jump', after, dy: flat, gapPx: HOP, soft: true }, style: 'moss_stone', main: true } : led(g, after, NARROW, perch ? UP : flat);
  const pieces: SectionPiece[] = [first, log(L, g, o.load ? SHORT : o.wide ? WIDE : LONG, lvl ? flat : perch ? DOWN : UP), led(d, L, NARROW, lvl ? flat : DOWN)];
  const sockets: Socket[] = [];
  if (o.load) {
    sockets.push({ id: `${k}h`, role: 'source', on: g, t: HANDLE_T, dn: 0 });
    sockets.push({ id: `${k}r`, role: 'receptor', on: L, t: LOAD_T, dn: 0, link: `${k}h`, allow: [o.load] });
    sockets.push({ id: `${k}e`, role: 'enemy', on: L, t: SNAKE_T, dn: 0, allow: [o.asleep ? 'snake-trapped-asleep' : 'snake-trapped'], easy: o.easy ?? 'stay' });
  } else sockets.push({ id: `${k}e`, role: 'enemy', on: L, t: 0.5, dn: 0, allow: [o.asleep ? 'snake-asleep' : 'snake'], easy: o.easy ?? (o.asleep ? 'keep' : 'soften') });
  return { pieces, sockets, last: d, rise: perch };
}
/** branches in a row, a ledge before each and the ledge out */
function row(us: Unit[]): { pieces: SectionPiece[]; sockets: Socket[] } {
  const pieces: SectionPiece[] = [], sockets: Socket[] = [];
  let prev: string | null = null, rise = false;
  us.forEach((u, j) => {
    // (keys are joined with +, never a template with a letter each side of the number: tools/art/artuse.mjs reads a template as a
    //  pattern of art names, and u..p hid a real unused frame)
    const k = `u${j}`, a = k + 'a';
    pieces.push(led(a, prev, LEDGE, rise ? UP : [0, 0]));
    sockets.push(low(k + 'p', a, [0.3, 0.6]));
    const c = core(k, a, u);
    pieces.push(...c.pieces); sockets.push(...c.sockets); prev = c.last; rise = c.rise;
  });
  pieces.push(led('z', prev, LEDGE, rise ? UP : [0, 0]));
  sockets.push(low('pz', 'z', [0.4, 0.6], 1));
  return { pieces, sockets };
}
/** a root stair with the snake's branch at its top (a CLIMB brick: `n` steps up of 50-56 px, the branch one more, then down again) */
function stair(n: number, u: Unit): { pieces: SectionPiece[]; sockets: Socket[] } {
  const pieces: SectionPiece[] = [led('a', null, LEDGE)], sockets: Socket[] = [low('pa', 'a', [0.3, 0.6])];
  let prev = 'a';
  for (let j = 0; j < n; j++) { pieces.push(led(`s${j}`, prev, LEDGE, UP)); prev = `s${j}`; }
  const c = core('t', prev, { ...u, perch: false });
  pieces.push(...c.pieces); sockets.push(...c.sockets); prev = c.last;
  for (let j = 0; j < n; j++) { pieces.push(led(`d${j}`, prev, LEDGE, DOWN)); prev = `d${j}`; }
  pieces.push(led('z', prev, LEDGE));
  sockets.push(low('pz', 'z', [0.4, 0.6], 1));
  return { pieces, sockets };
}
type Lay = { pieces: SectionPiece[]; sockets: Socket[] };
type V = { id: string; lay: Lay; easy?: Lay };
/** a brick (library.ts `brick`, for the ground and the stairs): its first piece `in`, its last `out`, a version's Easy twin beside it */
function brick(o: { id: string; name: string; jobs: NodeJob[]; difficulty: number; content?: 'ground' | 'climb' | 'hazard'; teaches?: string; maxPerStage?: number; weight?: number; versions: V[] }): SectionTemplate {
  const ren = (ps: SectionPiece[]) => { const a = ps[0].key, z = ps[ps.length - 1].key; const f = (s: string) => (s === a ? 'in' : s === z ? 'out' : s); return ps.map((p) => ({ ...p, key: f(p.key), place: Object.fromEntries(Object.entries(p.place).map(([q, v]) => [q, (q === 'after' || q === 'on') && typeof v === 'string' ? f(v) : v])) as SectionPiece['place'] })); };
  const sk = (ps: SectionPiece[], ss: Socket[]) => { const a = ps[0].key, z = ps[ps.length - 1].key; return ss.map((s) => ({ ...s, on: s.on === a ? 'in' : s.on === z ? 'out' : s.on })); };
  const first = ren(o.versions[0].lay.pieces)[0];
  const versions = o.versions.flatMap((v) => [
    { id: v.id, pieces: ren(v.lay.pieces).slice(1), sockets: sk(v.lay.pieces, v.lay.sockets), ...(v.easy ? { easy: `${v.id}-easy` } : {}) },
    ...(v.easy ? [{ id: `${v.id}-easy`, pieces: ren(v.easy.pieces).slice(1), sockets: sk(v.easy.pieces, v.easy.sockets), easyOnly: true }] : []),
  ]);
  const { versions: _v, ...rest } = o;
  return { ...rest, feel: [STAGE_13], archetypes: 'any', phases: ['ki', 'sho', 'ten', 'ketsu'], needs: ['jump'], uses: o.teaches ? [] : ['traps'], content: o.content ?? 'ground', terrain: 'raised-logs', pieces: [first], subBlocks: [{ id: 'body', versions }], entry: { piece: 'in', kind: 'ground' }, exit: { piece: 'out', kind: 'ground' }, exitDy: 0, sockets: [], mirrorable: false } as SectionTemplate;
}
/** a version; where it holds a bare branch its Easy twin lays that branch wider (a trapped branch is the same on both settings: its
 *  short patch is the phone's, and Easy softens its snake at the socket) */
const ver = (id: string, us: Unit[]): V => ({ id, lay: row(us), ...(us.some((u) => !u.load) ? { easy: row(us.map((u) => (u.load ? u : { ...u, wide: true }))) } : {}) });
const HIVE: Unit = { load: 'trap-hive' }, STONE: Unit = { load: 'trap-stone' }, BARE: Unit = {};

/** a long root bank after the last branch of a beat that asks for his own hands (X, C): the one kind of ledge in the level a
 *  purge's top-up may stand a bare snake on (300 px and more; every other ledge is under 248) */
const ROOM: R2 = [300, 340];
const withRoom = (l: Lay): Lay => { const z = l.pieces[l.pieces.length - 1].key; return { pieces: [...l.pieces, led('zz', z, ROOM)], sockets: [...l.sockets, low('pzz', 'zz', [0.3, 0.7])] }; };
/** `n` short ledges after a beat's last piece, a petal row on each: the breath INSIDE a beat (a beat is 20 s and more by design; every
 *  ledge is under 248 px, so no animal is ever topped up onto one) */
const breath = (l: Lay, n: number, hop = false): Lay => {
  const pieces = [...l.pieces], sockets = [...l.sockets];
  // (`hop`: the ledges step up and back down, 50 px at a time, a root to hop over: the route ends level, as it began)
  for (let j = 0; j < n; j++) { const k = `y${j}`; pieces.push(led(k, pieces[pieces.length - 1].key, LEDGE, hop ? (j % 2 ? DOWN : UP) : [0, 0])); sockets.push(low(`p${k}`, k, [0.3, 0.7])); }
  return { pieces, sockets };
};
/** a version whose bare branches are wider on Easy, a long bank after it */
const roomy = (id: string, us: Unit[]): V => ({ id, lay: withRoom(breath(row(us), 4, true)), easy: withRoom(breath(row(us.map((u) => (u.load ? u : { ...u, wide: true }))), 4, true)) });

/** the finale's two settings: Normal a trap, a hop, an awake snake on a bare branch; Easy the same flat, its bare snake asleep */
const finale = (id: string, trap: Unit): V => ({
  id,
  lay: withRoom(breath(row([trap, { ...BARE, hop: true }]), 4, true)),
  easy: withRoom(breath(row([trap, { ...BARE, asleep: true, wide: true }]), 4, true)),
});
/** Dot's line `id` on a version's first ledge (both settings) */
const said = (v: V, id: string): V => {
  const tip = (l: Lay): Lay => ({ pieces: l.pieces, sockets: [...l.sockets, { id: `say-${id}`, role: 'tip', on: l.pieces[0].key, t: 0.5, allow: [id] }] });
  return { ...v, lay: tip(v.lay), ...(v.easy ? { easy: tip(v.easy) } : {}) };
};
/** THE ARC'S BRICKS (reference/design/1-3.md), one job each: the graph's letter in brackets */
export const ARC_13: SectionTemplate[] = [
  // [T] beat 1, the lesson: ledges no animal can be laid on, a flag, Dot's line, the vine on the short ledge, then the branch, LEVEL
  // with it, where the first snake of the stage SLEEPS under the first hive on both settings.
  // DOT SPEAKS THREE SECONDS OF WALKING BEFORE THE VINE (P13's bots, 11-12: with her line 232 px before the handle a first-timer,
  // who walks 265 px a second and reads as he walks, was past the vine before he had read it: adult and kid sprang the first trap on
  // 0 of 40 rolls). Her line is at the flag; then a root to hop, petals over it, and a flat ledge; then the vine, 820 px and more on.
  // On an upright phone the hive comes into view as he finishes reading, the vine a step later: she calls it, and it arrives
  brick({ id: 'w1-13-lesson', name: 'the lesson: the vine, the hive and a sleeping snake', jobs: ['teach'], difficulty: 2, teaches: 'traps', versions: [(() => {
    const c = core('t', 'd', { load: 'trap-hive', asleep: true, level: true });
    const pieces: SectionPiece[] = [led('a', null, LEDGE), led('b', 'a', LEDGE, UP), led('c', 'b', LEDGE, DOWN), led('d', 'c', LEDGE), ...c.pieces, led('z', c.last, LEDGE)];
    const sockets: Socket[] = [{ id: 'flag', role: 'flag', on: 'a', t: 0.5 }, { id: 'tip', role: 'tip', on: 'a', t: 0.4, allow: ['traps'] }, { id: 'tip2', role: 'tip', on: 'd', t: 0.5, allow: ['traps.then'] }, ...c.sockets, low('pa', 'a', [0.3, 0.6]), low('pb', 'b', [0.3, 0.7]), low('pc', 'c', [0.3, 0.7]), low('pz', 'z', [0.4, 0.6], 1)];
    return { id: 'asleep-under-the-hive', lay: breath({ pieces, sockets }, 4, true) };
  })()] }),
  // [P] beat 2, again, awake: one branch, a snake pacing under a hive
  brick({ id: 'w1-13-again', name: 'again, awake: a snake pacing under a hive', jobs: ['practise'], difficulty: 3, versions: [{ id: 'awake-hive', lay: breath(row([HIVE]), 4, true) }] }),
  // [M] beat 3, the stone: a root stair, and at its top a snake under a stone held by a tendril tied at his feet (the second handle)
  brick({ id: 'w1-13-stone-stair', name: 'the stone on the root stair', jobs: ['flow'], content: 'climb', difficulty: 4, versions: [
    { id: 'three-steps-stone', lay: breath(stair(3, STONE), 2), easy: breath(stair(2, STONE), 4) }, { id: 'two-steps-stone', lay: breath(stair(2, STONE), 4) },
  ] }),
  // [X] beat 5, the other way: two long bare branches and no trap. The first snake sleeps at its post (a free punch, or a vault);
  // the second backs away down its branch and is punched off the end. Easy: wider branches, and its second snake softened
  brick({ id: 'w1-13-other-way', name: 'the other way: bare branches, no trap', jobs: ['test'], content: 'hazard', difficulty: 5, versions: [
    // (three: asleep, awake, asleep. The node's threat, 0.9 of the stage's, pays for exactly these)
    said(roomy('asleep-awake-asleep', [{ ...BARE, asleep: true }, BARE, { ...BARE, asleep: true }]), 'bare'),
  ] }),
  // [W] beat 7, the twist: the vine hangs on a perch, a step up BEFORE the branch: he reads the room, steps up, shakes it, comes down
  brick({ id: 'w1-13-perch', name: 'the twist: the vine up on a perch', jobs: ['twist'], content: 'climb', difficulty: 5, versions: [
    // (and after it a calm one, asleep under the other load: the node's threat pays for an awake snake and a sleeper)
    // (Normal runs hotter from here on, the lead 11-12: both snakes awake; Easy keeps the second asleep)
    { id: 'perch-hive', lay: breath(row([{ ...HIVE, perch: true }, STONE]), 2, true), easy: breath(row([{ ...HIVE, perch: true }, { ...STONE, asleep: true }]), 2, true) },
    { id: 'perch-stone', lay: breath(row([{ ...STONE, perch: true }, HIVE]), 2, true), easy: breath(row([{ ...STONE, perch: true }, { ...HIVE, asleep: true }]), 2, true) },
  ] }),
  // [S] beat 9, the gallery: three branches, three traps (the snakes awake, asleep, asleep: the section's threat pays for all three)
  brick({ id: 'w1-13-gallery', name: 'the snake gallery: hive, stone, hive', jobs: ['signature'], difficulty: 7, maxPerStage: 1, versions: [
    // (Normal: awake, asleep, awake, only the middle one sleeps; Easy: awake, asleep, asleep)
    { id: 'hive-stone-hive', lay: breath(row([HIVE, { ...STONE, asleep: true }, HIVE]), 4, true), easy: breath(row([HIVE, { ...STONE, asleep: true }, { ...HIVE, asleep: true }]), 4, true) },
    { id: 'stone-hive-stone', lay: breath(row([STONE, { ...HIVE, asleep: true }, STONE]), 4, true), easy: breath(row([STONE, { ...HIVE, asleep: true }, { ...STONE, asleep: true }]), 4, true) },
  ] }),
  // [C] beat 11, the finale: a trapped branch, an awake snake under its load; then at once a bare one, whose snake sleeps at its post
  // until he walks up (it wakes drowsy, backs down its branch, and is his to punch off the end or vault): everything learned, in one
  // breath. (The node's threat, 0.75 of the stage's, pays for one awake snake and one sleeper, not two awake)
  brick({ id: 'w1-13-finale', name: 'the finale: a trap, then his own hands', jobs: ['combine'], content: 'hazard', difficulty: 6, versions: [
    // (Normal: both awake, and a HOP between the two branches, the level's one jump that matters. Easy: flat, the bare snake asleep)
    finale('trap-then-bare', HIVE), finale('stone-then-bare', STONE),
  ] }),
];

/** the way out: a calm walk on a root bank to the totem, on the ground (World 1's own exits are all up in the canopy).
 *  Before the totem, a short ROPE over a mossy hollow (the lead's ruling, 11-12, the way old 1-3 ended): clearing 1-3 teaches Shimmy
 *  Rope, so on a first visit he walks down through the hollow and out, and the rope is there to try the day he comes back. It is
 *  `free`: never the way, on either setting */
export const EXIT_13: SectionTemplate = {
  id: 'w1-13-low-arrival', name: 'a calm walk on a root bank to the totem', feel: [STAGE_13], archetypes: 'any', phases: ['goal'], difficulty: 1, needs: ['walk'], jobs: ['exit'], content: 'structural', terrain: 'floor-stones',
  pieces: [{ key: 'in', shape: 'bank', w: [300, 340], place: { kind: 'start' }, style: 'moss_stone', main: true, landing: true }],
  subBlocks: [{ id: 'body', versions: [[520, 560], [620, 680]].map((w, j) => ({ id: j ? 'long' : 'short', pieces: [{ key: 'out', shape: 'bank' as const, w: w as R2, place: { kind: 'rope' as const, after: 'in', gap: [460, 480] as R2, free: true }, style: 'moss_stone' as const, main: true, landing: true }], sockets: [{ id: 'exit-totem', role: 'objective' as const, on: 'out', t: 0.85, allow: ['exit_totem'] }] })) }],
  entry: { piece: 'in', kind: 'ground' }, exit: { piece: 'out', kind: 'ground' }, exitDy: 0, sockets: [], mirrorable: false,
} as SectionTemplate;

/** World 1's quiet sections 1-3 walks between its beats: its arrivals and its rests on the ground (w1.ts tags each for the stage) */
export const QUIET_13 = ['w1-meadow', 'w1-forest-edge', 'w1-morning-path', 'w1-home-banks', 'w1-fern-bank', 'w1-clearing', 'w1-log-walk'] as const;

/** every section that is 1-3's own */
export const SECTIONS_13: SectionTemplate[] = [...ARC_13, EXIT_13];
