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
export const PURGE_13: Record<string, string> = { 'purge-13-arc': 'A T P M R X R W R S R H C E' };
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
  traps: 'Snake napping under a hive ahead! Punch the vine!',
  'traps.then': "Don't worry, it only gives him a fright.",
  bare: 'No vine? Walk him to the end of his branch.',
} as const;
/** the stage's MISSION line (the keeper's; it replaces the withdrawn "Knock the snakes off the branches..."): stagePlan's, when 1-3 ships */
export const MISSION_13 = 'Shake every vine, and off the snakes glide.';
/** the lesson as ONE card: the keeper's two lesson lines, together, so the second can never be lost behind the first (the lead,
 *  11-12 5:02 PM: said as two tips, the second was not said if he walked straight on to the handle). Said at the lesson's flag, where
 *  the hive is not on screen yet, so its first line says what is AHEAD (the keeper's rewrite, 6:12 PM; it was "See that hive?") */
export const LESSON_CARD_13 = `${LINES_13.traps} ${LINES_13['traps.then']}`;
export const TRAP_LINE = LINES_13.traps;
// ───────────────────────────── the drop-trap twist bricks (1-3's own) ─────────────────────────────
/**
 * THE PHONE'S NUMBERS (w1Cast.ts's header, measured on stills of a roll): from its handle a trap's hung load is 140-190 px on, over
 * the middle of its snake's 105 px patch, so the vine, the load and the whole patch are on an upright phone's screen; the handle's
 * socket is 85-130 px before the load's (at the log's near end); no ledge beside a handle is long enough for another animal to
 * be laid or topped up on (every one under 248 px: a patrol's 200 plus the lay's 24 px margins).
 * The lay keeps an animal 120 px from any prop (pipeline ANY_APART), its own trap's load socket included: so the load's SOCKET sits
 * at the log's near end and the snake's at the patch's far end, and `armedTraps` hangs the load over the patch's middle.
 */
/** a ledge he walks or steps onto: no `landing` (Easy widens a landing by 48 px, EASY_LANDING: every px here is the phone's, and a
 *  ledge 48 px longer is one an animal can be topped up on, beside a handle; measured, Easy's first cut hung no pair at all) */
const led = (key: string, after: string | null, w: R2, dy: R2 = [0, 0]): SectionPiece => ({ key, shape: 'bank', w, place: after ? { kind: 'walk', after, dy } : { kind: 'start' }, style: 'moss_stone', main: true });
const UP: R2 = [-56, -50], DOWN: R2 = [50, 56];
/** the level's one jump that matters (Normal's finale): a gap of 90-110 px, level, the drop under it soft */
const HOP: R2 = [90, 110];
/** the ground a fallen log lies on: a bank level with the ledge before it, off the `main` list (the lay stands no flag on it and tops
 *  no second animal up onto it) and no `landing` (Easy would widen it by its landing pad, and the sockets would slide along it) */
const bed = (key: string, after: string, w: R2, dy: R2 = [0, 0]): SectionPiece => ({ key, shape: 'bank', w, place: { kind: 'walk', after, dy }, style: 'moss_stone', main: false });
/** THE BRANCH: a painted fallen log lying on its bed from end to end (World 1's log, as on w1-log-walk), `h` px thick. The snake, its
 *  patrol and its load are the LOG's (their sockets are on it); he hops up onto it and steps down off its far end. Until 11-12 the
 *  "branch" was a step of soil: in a stage called Branch Snakes nothing on screen was a branch. Off the `main` list, said so: a block
 *  ON a piece is main unless told (pipeline layLocal), and a flag stood on the log emptied its snake's socket */
const fallen = (key: string, on: string, h: R2, w: R2 = [900, 900], at: R2 = [0, 0]): SectionPiece => ({ key, shape: 'block', w, place: { kind: 'on', on, at, h }, style: 'log', main: false });
/** every log is LOW, 24-26 px thick: World 1 paints a block that thin as its fallen log (grey bark, moss), and one a full step
 *  thick (50-56 px) as a bright green hedge block, which is no log and not this stage's look (stills, 11-12). It also keeps a
 *  trap's load, hung TRAP_HANG over the log's top, under the goal sign on a sideways phone (150 px over his feet is behind it) */
const LOW: R2 = [24, 26];
/** a ledge no animal can be laid on (under 248 px), and a short one under a flag's pad (pipeline FLAG_SPAN.pad 160): a flag keeps
 *  every animal 224 px off (patchFor), and one at the end of a wide ledge beside a branch emptied the snake's socket, so the load
 *  hung over nothing (measured: 86 of 404 traps on Normal before the short ledges stood either side of every branch) */
const LEDGE: R2 = [230, 240], NARROW: R2 = [150, 155];
/** a trapped snake's log: its patch 105 px (the log less the lay's 24 px at each end), one width so every px below holds. Short on
 *  purpose: the patch's far end is 213-215 px from the vine, so an awake snake pacing to it is still whole on an upright phone's
 *  screen from where he stands to shake the vine (at 170 px its head was cut at the screen's edge: stills, 11-12) */
const SHORT: R2 = [153, 153];
/** a bare branch (no trap: the punch off its end, or the vault): the awake snake's own 200 px and more; Easy's is wider */
const LONG: R2 = [360, 360], WIDE: R2 = [410, 410];
/** on a trapped log: the load's SOCKET 3 px in, the snake's 127 px in, near the patch's far end: 124 px apart (an animal under 120
 *  px from a prop is not laid, pipeline ANY_APART; a socket outside its piece's patch is left empty, patchFor). The load is HUNG
 *  over the patch's middle all the same (w1Cast.ts armedTraps) */
const LOAD_T = 0.02, SNAKE_T = 0.83;
/** the handle on the short ledge before the log: 84-86 px before the log, so 87-89 px before its load's socket (the pair's 85-130),
 *  108-110 px before the patch's near end, which is the nearest the snake can come (it strikes within 105), and 160-163 px before
 *  the middle of the snake's patch, where the load is hung */
const HANDLE_T = 0.443;
const low = (id: string, on: string, t: R2 | number, count = 2): Socket => ({ id, role: 'pickup', on, t, dn: 34, count, span: 120 });
type Load = 'trap-hive' | 'trap-stone';
interface Unit { asleep?: boolean; load?: Load | null; perch?: boolean; wide?: boolean; easy?: Socket['easy']; /** a HOP before this branch's ledge: a real jump in 1-1's taught band over a soft drop (a miss is a short walk back, never a life) */ hop?: boolean; /** the branch level with its ledges (the lesson: the first hive is clear of the goal sign on a sideways phone) */ level?: boolean }
/**
 * One snake's branch, after the piece `after`: a short ledge `<k>g`, the bed `<k>B` level with it, the fallen LOG `<k>L` lying on the
 * bed end to end, and a short ledge `<k>d` after. With a `load`: the handle on `<k>g`, the load and a short-patch snake on a LOW
 * log. `perch`: `<k>g` is a step UP (the vine is up on a perch) and the bed a step back down. No load: a long log a full step high,
 * and the awake snake's whole patrol along it.
 */
function core(k: string, after: string, o: Unit = {}): { pieces: SectionPiece[]; sockets: Socket[]; last: string; rise: boolean } {
  const g = `${k}g`, B = `${k}B`, L = `${k}L`, d = `${k}d`;
  const perch = !!(o.perch && o.load);
  const flat: R2 = [0, 0];
  const first: SectionPiece = o.hop ? { key: g, shape: 'bank', w: NARROW, place: { kind: 'jump', after, dy: flat, gapPx: HOP, soft: true }, style: 'moss_stone', main: true } : led(g, after, NARROW, perch ? UP : flat);
  // (the bed is level with the ledge before the unit (a perch's vine ledge is the step up, its bed back down); the log `L` lies on it)
  const pieces: SectionPiece[] = [first, bed(B, g, o.load ? SHORT : o.wide ? WIDE : LONG, perch ? DOWN : flat), fallen(L, B, LOW), led(d, B, NARROW)];
  const sockets: Socket[] = [];
  if (o.load) {
    sockets.push({ id: `${k}h`, role: 'source', on: g, t: HANDLE_T, dn: 0 });
    sockets.push({ id: `${k}r`, role: 'receptor', on: L, t: LOAD_T, dn: 0, link: `${k}h`, allow: [o.load] });
    sockets.push({ id: `${k}e`, role: 'enemy', on: L, t: SNAKE_T, dn: 0, allow: [o.asleep ? 'snake-trapped-asleep' : 'snake-trapped'], easy: o.easy ?? 'stay' });
  } else sockets.push({ id: `${k}e`, role: 'enemy', on: L, t: 0.5, dn: 0, allow: [o.asleep ? 'snake-asleep' : 'snake'], easy: o.easy ?? (o.asleep ? 'keep' : 'soften') });
  return { pieces, sockets, last: d, rise: false };
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
  // (the way down on NARROW steps: a step down is nothing to do, and three LEDGE-wide ones were 4.3 s of it (seedList QUIET_MAX 4 s))
  for (let j = 0; j < n; j++) { pieces.push(led(`d${j}`, prev, NARROW, DOWN)); prev = `d${j}`; }
  // (the ledge out hops UP onto a root: the way down is three steps with nothing to do, and the route keeps something to do every
  //  few seconds (seedList QUIET_MAX 4 s; P13, 11-12: 8-11 s here with a flat ledge out and flat breath after it). breath(.., 'down') follows)
  pieces.push(led('z', prev, LEDGE, UP));
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
  return { ...rest, feel: [STAGE_13], own: true, archetypes: 'any', phases: ['ki', 'sho', 'ten', 'ketsu'], needs: ['jump'], uses: o.teaches ? [] : ['traps'], content: o.content ?? 'ground', terrain: 'raised-logs', pieces: [first], subBlocks: [{ id: 'body', versions }], entry: { piece: 'in', kind: 'ground' }, exit: { piece: 'out', kind: 'ground' }, exitDy: 0, sockets: [], mirrorable: false } as SectionTemplate;
}
/** a version; where it holds a bare branch its Easy twin lays that branch wider (a trapped branch is the same on both settings: its
 *  short patch is the phone's, and Easy softens its snake at the socket) */
const ver = (id: string, us: Unit[]): V => ({ id, lay: row(us), ...(us.some((u) => !u.load) ? { easy: row(us.map((u) => (u.load ? u : { ...u, wide: true }))) } : {}) });
const HIVE: Unit = { load: 'trap-hive' }, STONE: Unit = { load: 'trap-stone' }, BARE: Unit = {};

/** a long root bank after the last branch of a beat that asks for his own hands (X, C): the one kind of ledge in the level a
 *  purge's top-up may stand a bare snake on (300 px and more; every other ledge is under 248) */
const ROOM: R2 = [300, 340];
/** (and a root pair after it, up and down, so the beat's last hop is never more than a few hundred px from its end: the room alone
 *  left 555 px with nothing to do at every bare-log beat's end, over the seed list's quiet line with the rest after it) */
const withRoom = (l: Lay): Lay => { const z = l.pieces[l.pieces.length - 1].key; return { pieces: [...l.pieces, led('zz', z, ROOM), led('zu', 'zz', [200, 220], UP), led('zd', 'zu', [200, 220], DOWN)], sockets: [...l.sockets, low('pzz', 'zz', [0.3, 0.7])] }; };
/** `n` short ledges after a beat's last piece, a petal row on each: the breath INSIDE a beat (a beat is 20 s and more by design; every
 *  ledge is under 248 px, so no animal is ever topped up onto one) */
const breath = (l: Lay, n: number, hop = false, first: 'up' | 'down' = 'up'): Lay => {
  const pieces = [...l.pieces], sockets = [...l.sockets];
  // (`hop`: the ledges step up and back down, 50 px at a time, a root to hop over: the route ends level, as it began. `first` 'down':
  //  after a piece that ends a step up (the stair's ledge out), so an odd count ends level)
  const [a, b] = first === 'up' ? [UP, DOWN] : [DOWN, UP];
  for (let j = 0; j < n; j++) { const k = `y${j}`; pieces.push(led(k, pieces[pieces.length - 1].key, LEDGE, hop ? (j % 2 ? b : a) : [0, 0])); sockets.push(low(`p${k}`, k, [0.3, 0.7])); }
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
/** the two-snake log: 152 px, its patch 104 (24 px in at each end). Both snakes' SOCKETS stand 121-127 px in, past the 120 px the
 *  lay keeps from the hop up onto the log; the trap's arming re-seats the sleeper it is armed by to the patch's near end, and the
 *  second sleeper, at the far end, has the load hung over the patch's middle (w1Cast.ts armedTraps). So the coils lie 104 px apart
 *  and the load (60 px wide) lands between them with 3 px to spare each side, 162 px from the handle (TRAP.reach 140-190); the
 *  nearest a coil lies to the handle is 110 px (a strike's 105) and the far coil 214 px from it: both whole on an upright phone's
 *  screen from the vine (stills, 11-12: at 222 px the far coil touched the screen's edge) */
const PAIR_LOG: R2 = [152, 152];
const NEAR_T = 0.8, FAR_T = 0.835;
function two(load: Load): Lay {
  const pieces: SectionPiece[] = [led('a', null, LEDGE), led('g', 'a', NARROW), bed('B', 'g', PAIR_LOG), fallen('L', 'B', LOW), led('d', 'B', NARROW)];
  const sockets: Socket[] = [
    low('pa', 'a', [0.3, 0.6]),
    { id: 'h', role: 'source', on: 'g', t: HANDLE_T, dn: 0, group: 'two' },
    { id: 'r', role: 'receptor', on: 'L', t: LOAD_T, dn: 0, link: 'h', allow: [load], group: 'two' },
    { id: 'e1', role: 'enemy', on: 'L', t: NEAR_T, dn: 0, allow: ['snake-trapped-asleep'], easy: 'stay', group: 'two' },
    { id: 'e2', role: 'enemy', on: 'L', t: FAR_T, dn: 0, allow: ['snake-trapped-asleep'], easy: 'stay', group: 'two' },
  ];
  const l = breath({ pieces, sockets }, 4, true);
  // (a flag on its last ledge: the finale is next, and Matt's rule stands a flag before every hard beat)
  return { pieces: l.pieces, sockets: [...l.sockets, { id: 'flag', role: 'flag', on: l.pieces[l.pieces.length - 1].key, t: 0.5 }] };
}
/** THE ARC'S BRICKS (reference/design/1-3.md), one job each: the graph's letter in brackets */
export const ARC_13: SectionTemplate[] = [
  // [T] beat 1, the lesson: ledges no animal can be laid on, a flag, Dot's line, the vine on the short ledge, then the branch, LEVEL
  // with it, where the first snake of the stage SLEEPS under the first hive on both settings.
  // DOT SPEAKS THREE SECONDS OF WALKING BEFORE THE VINE (P13's bots, 11-12: with her line 232 px before the handle a first-timer,
  // who walks 265 px a second and reads as he walks, was past the vine before he had read it: adult and kid sprang the first trap on
  // 0 of 40 rolls). Her line is at the flag; then a root to hop, petals over it, and a flat ledge; then the vine, 820 px and more on.
  // On an upright phone the hive comes into view as he finishes reading, the vine a step later: she calls it, and it arrives
  brick({ id: 'w1-13-lesson', name: 'the lesson: the vine, the hive and a sleeping snake', jobs: ['teach'], difficulty: 2, teaches: 'traps', versions: [(() => {
    const c = core('t', 'd', { load: 'trap-hive', asleep: true });
    // ("now you": a second sleeper under a second hive right after the first, with no words: the lesson, then his own first try at
    //  it while nothing can go wrong. P13's bots, 11-12: the level ran 115-120 s for a first-timer who used every vine; two more
    //  trapped logs (this one and the stone in beat 2) are about 15 s of the level's own idea, never a longer walk)
    const c2 = core('n', 'm', { load: 'trap-hive', asleep: true });
    const pieces: SectionPiece[] = [led('a', null, LEDGE), led('b', 'a', LEDGE, UP), led('c', 'b', LEDGE, DOWN), led('d', 'c', LEDGE), ...c.pieces, led('m', c.last, LEDGE), ...c2.pieces, led('z', c2.last, LEDGE)];
    const sockets: Socket[] = [{ id: 'flag', role: 'flag', on: 'a', t: 0.5 }, { id: 'tip', role: 'tip', on: 'a', t: 0.4, allow: ['traps'] }, { id: 'tip2', role: 'tip', on: 'd', t: 0.5, allow: [] /* (says nothing now: the lesson is one card, LESSON_CARD_13. Kept in its place: each socket after it rolls its own stream by its place in this list, so the lay stays the recorded one) */ }, ...c.sockets, ...c2.sockets, low('pa', 'a', [0.3, 0.6]), low('pb', 'b', [0.3, 0.7]), low('pc', 'c', [0.3, 0.7]), low('pm', 'm', [0.3, 0.6]), low('pz', 'z', [0.4, 0.6], 1)];
    return { id: 'asleep-under-the-hive', lay: breath({ pieces, sockets }, 4, true) };
  })()] }),
  // [P] beat 2, again, awake: a snake pacing under a hive; then one under a STONE held by a TENDRIL tied at his feet, the second
  // handle, met here on the flat before the stair asks for it up high
  brick({ id: 'w1-13-again', name: 'again, awake: a snake pacing under a hive, then one under a stone', jobs: ['practise'], difficulty: 3, versions: [{ id: 'awake-hive-then-stone', lay: breath(row([HIVE, STONE]), 4, true) }] }),
  // [M] beat 3, the stone: a root stair, and at its top a snake under a stone held by a tendril tied at his feet (the second handle)
  brick({ id: 'w1-13-stone-stair', name: 'the stone on the root stair', jobs: ['flow'], content: 'climb', difficulty: 4, versions: [
    { id: 'three-steps-stone', lay: breath(stair(3, STONE), 7, true, 'down'), easy: breath(stair(2, STONE), 7, true, 'down') }, { id: 'two-steps-stone', lay: breath(stair(2, STONE), 7, true, 'down') },
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
    { id: 'perch-hive', lay: breath(row([{ ...HIVE, perch: true }, STONE]), 4, true), easy: breath(row([{ ...HIVE, perch: true }, { ...STONE, asleep: true }]), 4, true) },
    { id: 'perch-stone', lay: breath(row([{ ...STONE, perch: true }, HIVE]), 4, true), easy: breath(row([{ ...STONE, perch: true }, { ...HIVE, asleep: true }]), 4, true) },
  ] }),
  // [S] beat 9, the gallery: three branches, three traps (the snakes awake, asleep, asleep: the section's threat pays for all three)
  brick({ id: 'w1-13-gallery', name: 'the snake gallery: hive, stone, hive', jobs: ['signature'], difficulty: 7, maxPerStage: 1, versions: [
    // (Normal: awake, asleep, awake, only the middle one sleeps; Easy: awake, asleep, asleep)
    { id: 'hive-stone-hive', lay: breath(row([HIVE, { ...STONE, asleep: true }, HIVE]), 4, true), easy: breath(row([HIVE, { ...STONE, asleep: true }, { ...HIVE, asleep: true }]), 4, true) },
    { id: 'stone-hive-stone', lay: breath(row([STONE, { ...HIVE, asleep: true }, STONE]), 4, true), easy: breath(row([STONE, { ...HIVE, asleep: true }, { ...STONE, asleep: true }]), 4, true) },
  ] }),
  // [H] beat 11, ONE SHAKE, TWO SNAKES (the lead's OK, 11-12): a short low log, two snakes DOZING on it, one at each end, and ONE
  // load hung between them; the vine on the ledge before. One punch: the load lands in the gap between them, and both
  // glide off (TRAP.scare reaches both). The idea paying off big, a breath before the finale. Its pieces are a designed GROUP
  // (Socket.group): the lay's 120 px gaps would push the far snake off an upright phone's screen from the vine. The same on Easy.
  // The graph's reward job (H): only this brick fills it, and its snakes are paid from its own tension
  brick({ id: 'w1-13-two-snakes', name: 'one shake, two snakes', jobs: ['reward'], difficulty: 4, maxPerStage: 1, versions: (['trap-hive', 'trap-stone'] as const).map((load) => ({ id: `two-under-the-${load.slice(5)}`, lay: two(load) })) }),
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
 *  `free`: never the way, on either setting. It is a VINE between two living trees (the lead, 11-12: posts and a rope are a made
 *  thing, and nothing in World 1 is made): `look: 'vine'` draws ART-W1B's painted trunk at each end and the vine along its sag */
export const EXIT_13: SectionTemplate = {
  id: 'w1-13-low-arrival', name: 'a calm walk on a root bank to the totem', feel: [STAGE_13], own: true, archetypes: 'any', phases: ['goal'], difficulty: 1, needs: ['walk'], jobs: ['exit'], content: 'structural', terrain: 'floor-stones',
  pieces: [{ key: 'in', shape: 'bank', w: [300, 340], place: { kind: 'start' }, style: 'moss_stone', main: true, landing: true }],
  subBlocks: [{ id: 'body', versions: [[520, 560], [620, 680]].map((w, j) => ({ id: j ? 'long' : 'short', pieces: [{ key: 'out', shape: 'bank' as const, w: w as R2, place: { kind: 'rope' as const, after: 'in', gap: [460, 480] as R2, free: true, look: 'vine' as const }, style: 'moss_stone' as const, main: true, landing: true }], sockets: [{ id: 'exit-totem', role: 'objective' as const, on: 'out', t: 0.85, allow: ['exit_totem'] }] })) }],
  entry: { piece: 'in', kind: 'ground' }, exit: { piece: 'out', kind: 'ground' }, exitDy: 0, sockets: [], mirrorable: false,
} as SectionTemplate;

// ───────────────────────────── 1-3's own quiet: its arrival and its rests ─────────────────────────────
/**
 * The walk in and the breaths between the beats are 1-3's OWN pieces (Matt: variety comes from more pieces; funcheck read 1-3 as
 * "an earlier stage", 57% alike to 1-1, while its links were World 1's meadow, forest edge and fern bank): root banks and fallen logs
 * with no snake on them, a log to walk along, two to hop, a dip between roots. Nothing in them can hurt. No World 1 library section
 * is in 1-3's pool any more (w1.ts takes its tag off every one).
 */
const link = (o: { id: string; name: string; job: 'arrive' | 'rest'; versions: V[] }): SectionTemplate => ({
  ...brick({ id: o.id, name: o.name, jobs: [o.job], difficulty: 1, versions: o.versions }),
  phases: [o.job === 'arrive' ? 'start' : 'rest'], content: 'structural', uses: [], terrain: 'floor-stones', ...(o.job === 'arrive' ? { maxPerStage: 1 } : {}),
} as SectionTemplate);
/** a quiet bank (a rest's or the arrival's): a flag's ground, and a ROOT STEP of World 1's 50-56 px (UP, DOWN) every few hundred px: a
 *  24-40 px step or a log 25 px thick is walked without a hop, and long banks of them were 4-5 s with nothing to do, over the seed
 *  list's quiet line (seedList QUIET_MAX 4 s; P13 and F13, 11-12). Each piece ends level, as it began */
const bank = (key: string, after: string | null, w: R2, dy: R2 = [0, 0]): SectionPiece => led(key, after, w, dy);
export const QUIET_OWN_13: SectionTemplate[] = [
  // [A] the walk in: root banks in the evening light, a low log to hop, petals low. Nothing here can hurt
  link({ id: 'w1-13-root-arrival', name: 'the walk in along the root banks', job: 'arrive', versions: [
    { id: 'low-log', lay: { pieces: [bank('a', null, [330, 360]), bank('b', 'a', [330, 360], UP), bank('c', 'b', [440, 480], DOWN), fallen('f', 'c', LOW, [200, 230], [0.4, 0.6]), bank('d', 'c', [220, 240], UP), bank('z', 'd', [220, 240], DOWN)], sockets: [low('pa', 'a', [0.55, 0.75]), low('pb', 'b', [0.3, 0.7]), low('pf', 'f', 0.5), low('pz', 'z', [0.4, 0.6], 1)] } },
    { id: 'root-steps', lay: { pieces: [bank('a', null, [330, 360]), bank('b', 'a', [440, 480], UP), bank('c', 'b', [440, 480], DOWN), bank('d', 'c', [220, 240], UP), bank('z', 'd', [220, 240], DOWN)], sockets: [low('pa', 'a', [0.55, 0.75]), low('pb', 'b', [0.3, 0.6]), low('pc', 'c', [0.3, 0.6]), low('pz', 'z', [0.4, 0.6], 1)] } },
  ] }),
  // [R] a rest: up onto a root bank and along the long fallen log lying on it (380-400 px: World 1 paints a longer log as two pieces
  //  end to end, with a seam where they meet), down, and one more root
  link({ id: 'w1-13-long-log', name: 'a rest: along the long fallen log', job: 'rest', versions: [[0.1, 0.2], [0.5, 0.6]].map((at, j) => ({
    id: j ? 'log-late' : 'log-early',
    lay: { pieces: [bank('a', null, [240, 260]), bank('b', 'a', [520, 560], UP), fallen('f', 'b', LOW, [380, 400], at as R2), bank('c', 'b', [240, 260], DOWN), bank('d', 'c', [220, 240], UP), bank('z', 'd', [220, 240], DOWN)], sockets: [{ ...low('pf', 'f', [0.4, 0.6], 3), span: 220 }, low('pc', 'c', [0.3, 0.7]), low('pz', 'z', [0.4, 0.6], 1)] },
  })) }),
  // [R] a rest: two fallen logs, one up on a root bank, one in the hollow after it
  link({ id: 'w1-13-twin-logs', name: 'a rest: two fallen logs to hop', job: 'rest', versions: ([[[200, 240], [300, 340]], [[300, 340], [200, 240]]] as R2[][]).map((w, j) => ({
    id: j ? 'long-short' : 'short-long',
    lay: { pieces: [bank('a', null, [240, 260]), bank('b', 'a', [w[0][1] + 60, w[0][1] + 80] as R2, UP), fallen('f', 'b', LOW, w[0], [0.4, 0.6]), bank('c', 'b', [w[1][1] + 60, w[1][1] + 80] as R2, DOWN), fallen('g', 'c', LOW, w[1], [0.4, 0.6]), bank('d', 'c', [220, 240], UP), bank('z', 'd', [220, 240], DOWN)], sockets: [low('pf', 'f', 0.5), low('pg', 'g', 0.5), low('pz', 'z', [0.4, 0.6], 1)] },
  })) }),
  // [R] a rest: the dip between two roots, a low log lying in it
  link({ id: 'w1-13-root-dip', name: 'a rest: the dip between the roots', job: 'rest', versions: [[580, 620], [640, 680]].map((m, j) => ({
    id: j ? 'wide' : 'narrow',
    lay: { pieces: [bank('a', null, [260, 300]), bank('b', 'a', [220, 240], UP), bank('m', 'b', m as R2, DOWN), fallen('f', 'm', LOW, [200, 240], [0.4, 0.6]), bank('c', 'm', [220, 240], UP), bank('z', 'c', [220, 240], DOWN)], sockets: [low('pf', 'f', 0.5), low('pc', 'c', [0.3, 0.7]), low('pz', 'z', [0.4, 0.6], 1)] },
  })) }),
  // [R] a rest: up over the hump of a great root and down again, a log leaning at its foot
  link({ id: 'w1-13-root-hump', name: 'a rest: over the hump of a root', job: 'rest', versions: [[420, 460], [480, 520]].map((a, j) => ({
    id: j ? 'long' : 'short',
    lay: { pieces: [bank('a', null, a as R2), fallen('f', 'a', LOW, [200, 240], [0.5, 0.7]), bank('m', 'a', [420, 480], UP), bank('b', 'm', [220, 240], DOWN), bank('c', 'b', [220, 240], UP), bank('z', 'c', [220, 240], DOWN)], sockets: [low('pf', 'f', 0.5), { ...low('pm', 'm', [0.3, 0.7], 3), span: 200 }, low('pz', 'z', [0.4, 0.6], 1)] },
  })) }),
];

/** every section that is 1-3's own */
export const SECTIONS_13: SectionTemplate[] = [...ARC_13, ...QUIET_OWN_13, EXIT_13];
