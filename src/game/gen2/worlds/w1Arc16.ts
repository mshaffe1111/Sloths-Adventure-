/**
 * 1-6 First Lianas, the level as DESIGNED (reference/design/1-6.md on t-16-design@c99917f1; packet BUILD-16): World 1's rows for it.
 * ONE idea: "Where you hold the liana decides how far you fly, and the vine snakes decide where you can hold." ONE graph, one brick a beat,
 * each with a job no other piece of the stage's pool serves. WORLD DATA: no engine line names this stage; kitLib16 gives World 1's kit
 * these rows, finish16 lays the snakes (gen2/snakeLay.ts), and the stage table lists the stage on it.
 *
 * The gaps are World 1's three liana gaps (w1Swing.ts W1_LIANA_GAP, measured in 1-6.md "FIRST, measured" and capped by SWING_SEEN): SHORT
 * (the top flies it), LONG (a low hold; the top drops short), FAR (a narrow perch; the top never makes it). Easy lays every FAR as LONG.
 * NOT YET LAID (named, never faked): beat 4, the chain (liana to liana: ENG-S5 builds it in the engine); the false liana and the gorge are
 * laid with a perch between every two lianas until then.
 *
 * THE LIANAS' DEPTH: a snake that comes down from the anchor is seen 1 s before it reaches his hands only when its liana hangs 270 px or more
 * under the level's top (ENG-S4 depth-table.md, the snake view verdict on all four phones). The lay hangs 1-6's highest anchor 360 px under
 * its top on every roll (measured 11-14, seeds 1-24 both settings: the stage is laid down from its highest piece), so no floor is moved
 * for it; the snake lay (finish16, which throws on an unfair snake) and w1Arc16.test.ts keep every roll honest.
 *
 * HOW MANY LIANAS (the lead's ruling 11-14 10:36 AM ET, BUILD-16b): with 25 lianas a roll 1-6 read 9.6 Normal / 8.8 Easy on the meter
 * (tools/difficulty/score.ts; DIFFICULTY.md:61 asks 6.5). It lays 14 on Normal and ONE a beat on Easy (8); its length comes from walked
 * ground: a walk-in where a beat follows a beat, root hops between a beat's lianas and after them, one more hop on every rest. Measured
 * 11-14 (seeds 1-4): 6.3 Normal (6.1-6.6), 4.3 Easy (4.2-4.3).
 */
import type { GraphBrief, NodeJob, SectionPiece, SectionTemplate, Socket, WorldKit } from '../types.ts';
import type { Difficulty } from '../types.ts';
import { w1World } from './w1.ts';
import { W1_LIANA_GAP, w1Liana, withSwing, type LianaGap } from './w1Swing.ts';
import { laySnakes, type SnakeStage, type SnakeTable } from '../snakeLay.ts';

/** the stage these rows are for: the tag its sections carry and the key of its brief */
export const STAGE_16 = '1-6';
type R2 = [number, number];

/** 1-6's ONE graph (1-6.md "The arc", less beat 4's chain until chains are in the engine): A arrive, T the first liana, P hang low (the
 *  graph keeps one teach a move: 1-6.md's second T is the swing's first practise), R, M vine snakes met safely (a flow node: one brick
 *  serves it, so the deal keeps the beats in the design's order), X a snake on your vine, R, C the creaky landing, R, W the risers, R, S
 *  the false liana, R, L the gorge, E the far bank */
export const ARC_16: Record<string, string> = { 'lianas-16-arc': 'A T P R M X R C R W R S R L E' };
/** 1-6's brief, all of it data: it teaches the swing; its snakes are laid by its finish (tagged pieces) */
export const BRIEF_16: GraphBrief = {
  // (the deal is the arc's own, one type a brick, under V11 (no type on over 40% of the content nodes, never two neighbours alike but a
  //  teach and its practise): climb the first liana and hang low, hazard the snakes met and the risers, rope (the lianas' own type) the
  //  snake on your vine and the gorge, crumble the creaky landing: 2, 2, 2 and 1 of the seven (S is never content)
  ends: 'finale', trend: 'level', branching: 'none', teaches: ['swing'], deal: { climb: 29, hazard: 29, rope: 28, crumble: 14 }, dealExact: true,
  tags: true,
  // (no petal arcs over the gaps (pipeline.ts's jump arcs): over a LIANA gap they hang on a jump's curve, not the swing's, so a swing
  //  that is played right passes them; the bots missed 21-35 petals a run there and met the sealed door on every seed (BUILD-16b, 11-14).
  //  Every petal is the stage's own socket, on a bank or perch he lands on: a reward on the path, never a lure off it)
  petals: 'low',
};

/** the story keeper's lines for 1-6, verbatim (reference/story/lines-1-6.md on t-keeper-16@387aeb2b8, approved; forwarded by the lead
 *  11-14). The only player words this file holds. Each a TEACH line said 800 px or more before what it teaches (level.md rule 6) */
export const LINES_16 = {
  /** before beat 1, the first liana */
  liana: 'Lianas! Grab one from the edge, and let go when you glow.',
  /** before beat 2, hang low (1-6.md teaches it by a petal at the foot; a socket stands on no vine, so the keeper's line says it) */
  low: 'Hang low, fly far!',
  /** before beat 6, the snakes met safely (it covers beat 7's snake on your vine too) */
  snakes: 'Vine snakes only pass by. If one heads down your liana, climb down ahead of it.',
  /** before beat 11, the risers (not on Easy: none rise there) */
  rise: 'Snakes coming UP the lianas now! Climb high, ahead of them.',
  /** before beat 13, the false liana */
  still: "Watch for a vine that doesn't swing. It has a face!",
  /** Dot at her mark, the far bank */
  mark: 'Her mark, right where she used to wait for you!',
} as const;
/** Dot at a LOCKED exit (stagePlan.ts SEALED_LINES '1:vine_runner'): the keeper's 6b, verbatim */
export const SEALED_16 = 'Some of her petals are still on the lianas. Back we go!';
/** the stage's MISSION line (the keeper's 7): stagePlan's, held equal by w1Arc16.test.ts */
export const MISSION_16 = 'They took her over the gorge. Swing after her, and gather her petals.';

// ───────────────────────────── the pieces ─────────────────────────────
const UP: R2 = [-56, -50], DOWN: R2 = [50, 56];
/** a moss bank he walks on, `w` exact */
const bank = (key: string, after: string | null, w: number, dy: R2 = [0, 0]): SectionPiece => ({ key, shape: 'bank', w: [w, w], place: after ? { kind: 'walk', after, dy } : { kind: 'start' }, style: 'moss_stone', main: true });
/** 1-6.md's measured liana, 420 px long, its anchor 400-420 px over the bank it leaves */
const LEN: R2 = [420, 420];
const liana = (key: string, after: string, gap: LianaGap): SectionPiece => w1Liana(key, after, gap, LEN);
/** the false liana's length: short enough to read as a snake hanging from the canopy, not a liana 4.6x his height (ENG-S2: 115-170 px) */
const FALSE_LEN: R2 = [150, 170];

const petals = (id: string, on: string, t: R2 | number, n = 1, span = 80): Socket => ({ id, role: 'pickup', on, t, dn: 34, count: n, span });
const flag = (on: string, t = 0.5): Socket => ({ id: 'flag', role: 'flag', on, t });
const tip = (id: string, on: string, t: number, line: keyof typeof LINES_16): Socket => ({ id, role: 'tip', on, t, allow: [line] });

// ───────────────────────────── a brick ─────────────────────────────
type Lay = { pieces: SectionPiece[]; sockets: Socket[] };
type V = { id: string; lay: Lay; easy?: Lay };
/** a brick (1-5's form): its first piece `in`, its last `out` (both moss banks on the floor line), a version's Easy twin beside it */
function brick(o: { id: string; name: string; jobs: NodeJob[]; difficulty: number; content: 'ground' | 'climb' | 'hazard' | 'crumble' | 'rope'; teaches?: string; maxPerStage?: number; versions: V[]; uses?: string[] }): SectionTemplate {
  const ren = (ps: SectionPiece[]) => { const a = ps[0].key, z = ps[ps.length - 1].key; const f = (s: string) => (s === a ? 'in' : s === z ? 'out' : s); return ps.map((p) => ({ ...p, key: f(p.key), place: Object.fromEntries(Object.entries(p.place).map(([q, v]) => [q, (q === 'after' || q === 'on') && typeof v === 'string' ? f(v) : v])) as SectionPiece['place'] })); };
  const sk = (ps: SectionPiece[], ss: Socket[]) => { const a = ps[0].key, z = ps[ps.length - 1].key; return ss.map((s) => ({ ...s, on: s.on === a ? 'in' : s.on === z ? 'out' : s.on })); };
  const first = ren(o.versions[0].lay.pieces)[0];
  const versions = o.versions.flatMap((v) => [
    { id: v.id, pieces: ren(v.lay.pieces).slice(1), sockets: sk(v.lay.pieces, v.lay.sockets), ...(v.easy ? { easy: `${v.id}-easy` } : {}) },
    ...(v.easy ? [{ id: `${v.id}-easy`, pieces: ren(v.easy.pieces).slice(1), sockets: sk(v.easy.pieces, v.easy.sockets), easyOnly: true }] : []),
  ]);
  const { versions: _v, uses, ...rest } = o;
  return { ...rest, feel: [STAGE_16], own: true, archetypes: 'any', phases: ['ki', 'sho', 'ten', 'ketsu'], needs: ['jump'], uses: o.teaches ? [] : (uses ?? ['swing']), terrain: 'raised-logs', pieces: [first], subBlocks: [{ id: 'body', versions }], entry: { piece: 'in', kind: 'ground' }, exit: { piece: 'out', kind: 'ground' }, exitDy: 0, sockets: [], mirrorable: false } as SectionTemplate;
}

// ───────────────────────────── the beats ─────────────────────────────
/**
 * A run of lianas from bank `a`: each step a liana and what it throws him onto. A SHORT perch is laid 80 px over the bank he left (the
 * lay's own answer: level, a jump would reach it, so the top's band is above it, measured on 1-6's kit both settings), so a bank 80 px
 * down follows it and the next liana leaves the floor line again: the exit stays level and every anchor stays as deep under the level's
 * top as the gorge lays it (the snake view verdict).
 *   perch  'bank' a moss bank (w px), 'far' FAR's narrow bough, 'creak' a creaky limb, 'sound' a sound bough (Easy's)
 *   still  a false liana (a still snake, FALSE_LEN long) hangs past the take-off, `stillAt` px nearer than the real liana
 */
type Step = { gap: LianaGap; perch?: 'bank' | 'far' | 'creak' | 'sound'; w?: number };
const SHORT_RISE = 80;
const DROP: R2 = [SHORT_RISE, SHORT_RISE];
function lianaRun(k: string, from: string, steps: Step[], walk = 0): { pieces: SectionPiece[]; last: string; perches: string[] } {
  const pieces: SectionPiece[] = [];
  const perches: string[] = [];
  let at = from;
  steps.forEach((st, i) => {
    // (`walk` root hops between two lianas: up onto a root and down off it, so the swings of a beat are spaced by ground, not packed
    //  into the meter's busiest 30 s (score.ts PEAK_WINDOW; the lead's ruling 11-14: length from walked ground, never more lianas))
    if (i > 0) for (let j = 1; j <= walk; j++) {
      // (keys joined, not templated: a template with two letters between its holes reads as a wildcard to tools/art/artuse.mjs's
      //  dynamic-name rule, `.*m.*u.*`, and marked unused boss art "drawn" (artUse.test.ts went red, BUILD-16b 11-14))
      const up = [k, 'r', i, '-', j].join(''), down = [k, 's', i, '-', j].join('');
      pieces.push(bank(up, at, 240, UP), bank(down, up, 260, DOWN));
      at = down;
    }
    const l = `${k}l${i + 1}`, b = `${k}b${i + 1}`;
    pieces.push(liana(l, at, st.gap));
    const kind = st.perch ?? (st.gap === 'far' ? 'far' : 'bank');
    const dy: R2 = st.gap === 'short' ? [-SHORT_RISE, -SHORT_RISE] : [0, 0];
    // (the gap's share of its perch band and its window: World 1's own rows, w1Swing.ts W1_LIANA_GAP)
    const G = W1_LIANA_GAP[st.gap];
    const place = { kind: 'land' as const, after: l, dy, share: G.share, ...(G.window ? { window: G.window } : {}) };
    if (kind === 'bank') pieces.push({ key: b, shape: 'bank', w: [st.w ?? 260, st.w ?? 260], place, style: 'moss_stone', main: true, landing: true });
    else if (kind === 'far') pieces.push({ key: b, shape: 'branch', w: [120, 140], place, style: 'branch', landing: true, main: true });
    else if (kind === 'creak') pieces.push({ key: b, shape: 'branch', w: [150, 170], place, style: 'branch', creak: true });
    else pieces.push({ key: b, shape: 'branch', w: [190, 210], place, style: 'branch', landing: true, main: true });
    perches.push(b);
    at = b;
    if (st.gap === 'short') {
      const d = `${k}d${i + 1}`;
      pieces.push(bank(d, b, 240, DROP));
      at = d;
    }
  });
  return { pieces, last: at, perches };
}
/** a false liana hanging past `from`'s end (a still snake from the canopy, FALSE_LEN long: he passes under it), `reach` px out */
const stillOne = (key: string, from: string, reach: R2): SectionPiece =>
  ({ key, shape: 'liana', w: [0, 0], place: { kind: 'swing', after: from, top: [400, 420], reach, len: FALSE_LEN } });
/**
 * Walked ground after a beat's lianas: `n` root hops (up onto a root, down off it) from `from`. The stage's length comes from here and
 * from the rests, never from more lianas (lead's ruling 11-14 10:36 AM ET: 1-6 read 9.6 Normal / 8.8 Easy on the meter, its swings the
 * load; DIFFICULTY.md:61's 6.5 and Easy at ~3 come from fewer swings a minute, not a shorter stage).
 */
function hops(k: string, from: string, n: number): { pieces: SectionPiece[]; last: string } {
  // (it ends UP on a root, and the beat's far bank `z` steps DOWN off it: the last hop stays within the quiet line's reach of the next
  //  beat's take-off, listRules.ts quietJudge; a flat run of two banks there read 4.2-4.5 s with nothing to do, seeds 1-2, 11-14)
  const pieces: SectionPiece[] = [];
  let at = from;
  for (let i = 1; i <= n; i++) {
    if (i > 1) { pieces.push(bank(`${k}w${i - 1}`, at, 300, DOWN)); at = `${k}w${i - 1}`; }
    pieces.push(bank(`${k}u${i}`, at, 240, UP));
    at = `${k}u${i}`;
  }
  return { pieces, last: at };
}

/** a walk-in at a beat's start: bank `a`, `n` root hops, then down to the take-off bank `${k}e` (a beat that follows another beat with no rest
 *  between, T then P and M then X, is spaced from it by ground: score.ts's busiest 30 s held both beats' swings) */
function walkIn(k: string, n: number): { pieces: SectionPiece[]; last: string } {
  const h = hops(k, 'a', n);
  return { pieces: [...h.pieces, bank(`${k}e`, h.last, 260, DOWN)], last: `${k}e` };
}

/** [T] beat 1, the first liana (Pitfall's moment): a wide bank, ONE liana over a SHORT gap (the top flies it, so every hold does), moss
 *  under it with the root stair back up (the soft pit); then the far bank's roots to walk (both settings: one liana is already Easy's) */
function firstLiana(): Lay {
  const r = lianaRun('', 'a2', [{ gap: 'short', w: 280 }]);
  // (the bank under the SHORT perch steps down past the take-off's root too, so the far bank's last step lands level with the arrival)
  r.pieces = r.pieces.map((p) => (p.key === 'd1' && p.place.kind === 'walk' ? { ...p, place: { ...p.place, dy: [SHORT_RISE + 50, SHORT_RISE + 56] as R2 } } : p));
  const h = hops('h', r.last, 2);
  // (a root hop up onto the take-off: the arrival's last bank and a flat 660 px walk here were 4.4-4.6 s with nothing to do, over the
  //  quiet line's 4 s, seeds 2 and 5; and down again at the end, so the exit is level)
  return { pieces: [bank('a', null, 300), bank('a2', 'a', 260, UP), ...r.pieces, ...h.pieces, bank('z', h.last, 240, DOWN)], sockets: [petals('pa', 'a', 0.6, 1), petals('p1', r.perches[0], 0.5, 2, 120), petals('ph', 'hu2', 0.5, 1), tip('t-low', 'z', 0.3, 'low')] };
}
/** [P] beat 2, hang low: LONG gaps (a low hold flies them; from the top he drops short onto moss, top 0 ms), two in a row (Easy one).
 *  (OPEN: 1-6.md's petal at the liana's FOOT is not laid: a socket stands on a platform, never on a vine, pipeline pieceOf) */
function hangLow(easy: boolean): Lay {
  const w = walkIn('q', easy ? 2 : 1);
  const r = lianaRun('', w.last, easy ? [{ gap: 'long', w: 300 }] : [{ gap: 'long', w: 300 }, { gap: 'long', w: 280 }], 2);
  const h = hops('h', r.last, easy ? 4 : 2);
  const last = r.perches[r.perches.length - 1];
  return { pieces: [bank('a', null, 300), ...w.pieces, ...r.pieces, ...h.pieces, bank('z', h.last, 240, DOWN)], sockets: [...(easy ? [] : [petals('p1', r.perches[0], 0.5, 1)]), petals('p2', last, 0.5, 2, 120), petals('ph', 'hu1', 0.5, 1), tip('t-snakes', 'z', 0.4, 'snakes')] };
}
/** [M] beat 6, vine snakes met safely (DK Jr.'s passers): a snake glides DOWN the next liana and off into the ferns while he stands on a
 *  safe bank; then one starts down HIS liana and turns back a body above his hands (reach 0.6). SHORT gaps: any hold flies them.
 *  Easy: one liana, the one that turns back (W1_SNAKES_16: the passer down the next liana is not laid) */
function snakesMet(easy: boolean): Lay {
  const w = walkIn('q', easy ? 2 : 1);
  const r = lianaRun('', w.last, easy ? [{ gap: 'short', w: 300 }] : [{ gap: 'short', w: 300 }, { gap: 'short', w: 280 }], 2);
  const h = hops('h', r.last, easy ? 4 : 2);
  return { pieces: [bank('a', null, 420), ...w.pieces, ...r.pieces, ...h.pieces, bank('z', h.last, 240, DOWN)], sockets: [petals('pa', 'a', 0.3, 1), petals('p1', r.perches[r.perches.length - 1], 0.5, 2, 120), petals('ph', 'hu1', 0.5, 1)] };
}
/** [X] beat 7, a snake on your vine (required): ONE FAR gap onto a narrow perch; a snake comes down his liana from the anchor (the top never
 *  makes FAR, so it pushes him down to where he must be anyway); its hands let go onto moss with the stair back. Easy: a LONG */
function snakeOnYourVine(easy: boolean): Lay {
  const w = walkIn('q', easy ? 3 : 1);
  const r = lianaRun('', w.last, [{ gap: easy ? 'long' : 'far', w: 260 }]);
  const h = hops('h', r.last, easy ? 4 : 2);
  return { pieces: [bank('a', null, 320), ...w.pieces, ...r.pieces, ...h.pieces, bank('z', h.last, 240, DOWN)], sockets: [flag('a', 0.3), petals('ph', 'hu1', 0.5, 1), petals('pz', 'z', 0.5, 2, 120)] };
}
/** [C] beat 9, the creaky landing (1-5's limb with the swing): a liana onto a creaky limb, the only foothold, the next liana's catch
 *  inside its hold. Easy: one liana onto a sound bough, walked off */
function creakyLanding(easy: boolean): Lay {
  const r = lianaRun('', 'a', easy ? [{ gap: 'long', perch: 'sound' }] : [{ gap: 'long', perch: 'creak' }, { gap: 'long', w: 280 }]);
  const h = hops('h', r.last, easy ? 4 : 2);
  return { pieces: [bank('a', null, 320), ...r.pieces, ...h.pieces, bank('z', h.last, 240, DOWN)], // (the risers' line only where they rise: Easy's twin says nothing of them, 1-6.md 'Easy: none rise'; a tip socket's own easy
  //  'drop' is not read for tips, pipeline fillSockets)
  sockets: [flag('a', 0.3), petals('ph', 'hu1', 0.5, 1), petals('pz', 'z', 0.5, 2, 120), ...(easy ? [] : [tip('t-rise', 'z', 0.4, 'rise')])] };
}
/** [W] beat 11, the twist: snakes come UP from the ferns up the lianas' feet: low is taken, so he climbs high ahead of them; the gaps are
 *  SHORT, so the top still flies (top + double 1233 ms). Easy: none rise (snakeLay's Easy row), one liana */
function risers(easy: boolean): Lay {
  const r = lianaRun('', 'a', easy ? [{ gap: 'short', w: 280 }] : [{ gap: 'short', w: 280 }, { gap: 'short', w: 280 }], 2);
  const h = hops('h', r.last, easy ? 4 : 2);
  return { pieces: [bank('a', null, 320), ...r.pieces, ...h.pieces, bank('z', h.last, 240, DOWN)], sockets: [flag('a', 0.3), petals('p1', r.perches[0], 0.5, 1), petals('ph', 'hu1', 0.5, 2, 120), tip('t-still', 'z', 0.4, 'still')] };
}
/** [S] beat 13, the false liana (the signature): a "vine" that does NOT swing hangs from the canopy just past the bank, nearer than the real
 *  liana: a vine snake hanging stiff (its tell: it never sweeps an arc, its head at its foot). The real one is the LONG leap past it.
 *  (1-6.md lays it among swinging lianas, liana to liana: laid with perches until the engine has chains.) Both settings: the false one
 *  hangs past the first bank, the real one past it (one real liana: the lead's ruling 11-14, length from ground, not lianas) */
function falseLiana(easy: boolean): Lay {
  const r2 = lianaRun('s', 'a', [{ gap: 'long', w: 300 }]);
  const h = hops('h', r2.last, easy ? 4 : 2);
  return {
    pieces: [bank('a', null, 320), stillOne('f', 'a', [90, 110]), ...r2.pieces, ...h.pieces, bank('z', h.last, 240, DOWN)],
    sockets: [flag('a', 0.3), petals('p3', r2.perches[0], 0.5, 2, 120), petals('ph', 'hu1', 0.5, 1)],
  };
}
/** [L] beat 15, the gorge (the finale): a snake coming down (FAR), a riser (SHORT, high), the false liana, a creaky landing, a last LONG;
 *  no flag inside; a miss drops to the moss with the stair back. Easy: ONE real liana past the false one, onto a sound bough, a wide rest
 *  bank after (1-6.md beat 15); no snake comes down and none rises (W1_SNAKES_16's Easy rows) */
function gorge(easy: boolean): Lay {
  const r1 = easy ? { pieces: [] as SectionPiece[], last: 'a', perches: ['a'] } : lianaRun('', 'a', [{ gap: 'far' }, { gap: 'short', w: 240 }], 1);
  const r2 = lianaRun('g', r1.last, easy ? [{ gap: 'long', perch: 'sound' }] : [{ gap: 'long', perch: 'creak' }, { gap: 'long', w: 280 }]);
  return {
    pieces: [bank('a', null, 300), ...r1.pieces, stillOne('f', r1.last, [90, 110]), ...r2.pieces, bank('z', r2.last, easy ? 420 : 300)],
    sockets: [flag('a', 0.3), petals('p1', r1.perches[0], 0.5, 1), petals('p5', 'z', 0.4, 2, 120)],
  };
}

/** THE ARC'S BRICKS (1-6.md), one job each: the graph's letter in brackets */
export const BEATS_16: SectionTemplate[] = [
  brick({ id: 'w1-16-first-liana', name: 'the first liana: it carries you', jobs: ['teach'], content: 'climb', teaches: 'swing', difficulty: 2, maxPerStage: 1, versions: [{ id: 'short', lay: firstLiana() }] }),
  brick({ id: 'w1-16-hang-low', name: 'hang low: lower goes further', jobs: ['practise'], content: 'climb', difficulty: 3, maxPerStage: 1, versions: [{ id: 'long-long', lay: hangLow(false), easy: hangLow(true) }] }),
  brick({ id: 'w1-16-snakes-met', name: 'vine snakes met safely: they only pass', jobs: ['flow'], content: 'hazard', difficulty: 3, maxPerStage: 1, versions: [{ id: 'pass-and-back', lay: snakesMet(false), easy: snakesMet(true) }] }),
  brick({ id: 'w1-16-snake-on-vine', name: 'a snake on your vine: slide down ahead of it', jobs: ['test'], content: 'rope', difficulty: 6, maxPerStage: 1, versions: [{ id: 'far', lay: snakeOnYourVine(false), easy: snakeOnYourVine(true) }] }),
  brick({ id: 'w1-16-creaky-landing', name: 'the creaky landing: don\'t stop', jobs: ['combine'], content: 'crumble', difficulty: 5, maxPerStage: 1, uses: ['swing', 'creak'], versions: [{ id: 'limb', lay: creakyLanding(false), easy: creakyLanding(true) }] }),
  brick({ id: 'w1-16-risers', name: 'snakes come up: climb high ahead of them', jobs: ['twist'], content: 'hazard', difficulty: 5, maxPerStage: 1, versions: [{ id: 'two-risers', lay: risers(false), easy: risers(true) }] }),
  brick({ id: 'w1-16-false-liana', name: 'the false liana: that vine has a face', jobs: ['signature'], content: 'climb', difficulty: 6, maxPerStage: 1, versions: [{ id: 'still-one', lay: falseLiana(false), easy: falseLiana(true) }] }),
  brick({ id: 'w1-16-gorge', name: 'the gorge: every grip in turn', jobs: ['finale'], content: 'rope', difficulty: 8, maxPerStage: 1, uses: ['swing', 'creak'], versions: [{ id: 'four-lianas', lay: gorge(false), easy: gorge(true) }] }),
];

// ───────────────────────────── 1-6's own quiet: its arrival, its rests and its exit ─────────────────────────────
/** a rest one root hop longer at its far end (the stage's length from walked ground between the beats, not from lianas: the lead's ruling
 *  11-14; it also spaces the beats' swings apart, so no 30 s holds two beats' lianas, score.ts PEAK_WINDOW) */
const longer = (l: Lay): Lay => { const z = l.pieces[l.pieces.length - 1].key; return { ...l, pieces: [...l.pieces, bank('x1', z, 240, UP), bank('x2', 'x1', 280, DOWN)] }; };
const link = (o: { id: string; name: string; job: 'arrive' | 'rest'; versions: V[] }): SectionTemplate => ({
  ...brick({ id: o.id, name: o.name, jobs: [o.job], difficulty: 1, content: 'ground', versions: o.job === 'rest' ? o.versions.map((v) => ({ ...v, lay: longer(v.lay) })) : o.versions, uses: [] }),
  phases: [o.job === 'arrive' ? 'start' : 'rest'], content: 'structural', uses: [], terrain: 'floor-stones', ...(o.job === 'arrive' ? { maxPerStage: 1 } : {}),
} as SectionTemplate);
export const QUIET_16: SectionTemplate[] = [
  // [A] the canopy ends at the gorge: across it the lianas sway, each on its own clock; nothing hurts in 1,300 px
  link({ id: 'w1-16-arrival', name: 'the canopy ends at the gorge', job: 'arrive', versions: [
    { id: 'roots', lay: { pieces: [bank('a', null, 360), bank('b', 'a', 300, UP), bank('c', 'b', 420, DOWN), bank('d', 'c', 240, UP), bank('z', 'd', 280, DOWN)], sockets: [petals('pb', 'b', 0.5, 1), tip('t-liana', 'd', 0.5, 'liana'), petals('pz', 'z', 0.5, 1)] } },
  ] }),
  // [R] the rests: a flag on a bank, a root to hop (the quiet line: a hop within 450 px of each end, none 950 apart)
  link({ id: 'w1-16-rest-roots', name: 'a rest: over the roots', job: 'rest', versions: [[300, 360], [340, 420]].map((w, j) => ({
    id: j ? 'long' : 'short',
    lay: { pieces: [bank('a', null, w[0]), bank('b', 'a', 240, UP), bank('c', 'b', w[1], DOWN), bank('d', 'c', 220, UP), bank('z', 'd', 260, DOWN)], sockets: [flag('c', 0.5), petals('pb', 'b', 0.5, 1), petals('pd', 'd', 0.5, 1)] },
  })) }),
  link({ id: 'w1-16-rest-log', name: 'a rest: along a fallen log', job: 'rest', versions: [{ id: 'log', lay: { pieces: [bank('a', null, 300), bank('b', 'a', 420, UP), { key: 'f', shape: 'block', w: [280, 300], place: { kind: 'on', on: 'b', at: [0.1, 0.15], h: [24, 26] }, style: 'log', main: false }, bank('c', 'b', 300, DOWN), bank('d', 'c', 220, UP), bank('z', 'd', 260, DOWN)], sockets: [flag('c', 0.5), petals('pf', 'f', 0.5, 2, 160), petals('pd', 'd', 0.5, 1)] } }] }),
  link({ id: 'w1-16-rest-hump', name: 'a rest: over the hump of a great root', job: 'rest', versions: [{ id: 'hump', lay: { pieces: [bank('a', null, 320), bank('m', 'a', 440, UP), bank('b', 'm', 300, DOWN), bank('y', 'b', 220, UP), bank('z', 'y', 260, DOWN)], sockets: [flag('b', 0.5), petals('pm', 'm', [0.3, 0.7], 2, 160)] } }] }),
  link({ id: 'w1-16-rest-dip', name: 'a rest: the dip between the roots', job: 'rest', versions: [[560, 600], [640, 680]].map((m, j) => ({
    id: j ? 'wide' : 'narrow',
    lay: { pieces: [bank('a', null, 300), bank('b', 'a', 220, UP), bank('m', 'b', m[0], DOWN), bank('c', 'm', 220, UP), bank('z', 'c', 300, DOWN)], sockets: [flag('m', 0.5), petals('pc', 'c', 0.5, 1)] },
  })) }),
  link({ id: 'w1-16-rest-stumps', name: 'a rest: two stumps to hop', job: 'rest', versions: [{ id: 'stumps', lay: { pieces: [bank('a', null, 260), bank('m', 'a', 760), { key: 's1', shape: 'block', w: [130, 140], place: { kind: 'on', on: 'm', at: [0.15, 0.16], h: [50, 56] }, style: 'moss_stone', landing: true }, { key: 's2', shape: 'block', w: [130, 140], place: { kind: 'on', on: 'm', at: [0.62, 0.63], h: [50, 56] }, style: 'moss_stone', landing: true }, bank('z1', 'm', 200, UP), bank('z', 'z1', 240, DOWN)], sockets: [flag('m', 0.4), petals('ps1', 's1', 0.5, 1), petals('ps2', 's2', 0.5, 1)] } }] }),
];
/** [E] the far bank: the totem */
export const EXIT_16: SectionTemplate = {
  id: 'w1-16-far-bank', name: 'the far bank of the gorge', feel: [STAGE_16], own: true, archetypes: 'any', phases: ['goal'], difficulty: 1, needs: ['walk'], jobs: ['exit'], content: 'structural', terrain: 'floor-stones',
  pieces: [{ key: 'in', shape: 'bank', w: [300, 340], place: { kind: 'start' }, style: 'moss_stone', main: true, landing: true }],
  subBlocks: [{ id: 'body', versions: [{ id: 'bank', pieces: [{ key: 'out', shape: 'bank' as const, w: [560, 600] as R2, place: { kind: 'walk' as const, after: 'in', dy: [0, 0] as R2 }, style: 'moss_stone' as const, main: true, landing: true }], sockets: [petals('pout', 'out', 0.3, 2, 120), { id: 'exit-totem', role: 'objective' as const, on: 'out', t: 0.85, allow: ['exit_totem'] }] }] }],
  entry: { piece: 'in', kind: 'ground' }, exit: { piece: 'out', kind: 'ground' }, exitDy: 0, sockets: [tip('t-mark', 'in', 0.5, 'mark')], mirrorable: false,
} as SectionTemplate;

/** every section that is 1-6's own */
export const SECTIONS_16: SectionTemplate[] = [...BEATS_16, ...QUIET_16, EXIT_16];

// ───────────────────────────── the snakes (gen2/snakeLay.ts) ─────────────────────────────
/**
 * 1-6's snakes by section and liana key (1-6.md beats 6, 7, 11, 13, 15). The beats hold the verdict's numbers (ENG-S4 depth-table.md: a
 * snake from the anchor on a 410-420 px liana hung 270+ px under the top needs a trip of 6 s or more down-off, 7 s down-back with reach
 * 0.6; a riser, reach 0.7, lays anywhere 40 px down or more), the tell 0.6 s. Easy: the beats stretched (never quicker), none rise.
 */
export const W1_SNAKES_16: SnakeTable = {
  beats: {
    'w16-snake-down': { period: 14, tell: 0.6, on: 7, easyStretch: 1.15 },
    'w16-snake-back': { period: 15, tell: 0.6, on: 7.5, easyStretch: 1.15 },
    'w16-snake-up': { period: 9, tell: 0.6, on: 4, easyStretch: 1.15 },
  },
  sections: {
    // (beat 6: one glides down the NEXT liana and off; one starts down his own and turns back a body above his hands)
    // (Easy lays one liana where Normal lays two: the passer down the NEXT liana is Normal's alone)
    'w1-16-snakes-met': [{ liana: 'l2', route: 'down-off', beat: 'w16-snake-down', easy: 'none' }, { liana: 'l1', route: 'down-back', beat: 'w16-snake-back', reach: 0.6 }],
    'w1-16-snake-on-vine': [{ liana: 'l1', route: 'down-off', beat: 'w16-snake-down' }],
    'w1-16-risers': [{ liana: 'l1', route: 'up', beat: 'w16-snake-up', reach: 0.7, easy: 'none' }, { liana: 'l2', route: 'up', beat: 'w16-snake-up', shift: 4.5, reach: 0.7, easy: 'none' }],
    'w1-16-false-liana': [{ liana: 'f', route: 'still' }],
    // (Easy's gorge lays one real liana, past the false one: neither travelling snake is laid there)
    'w1-16-gorge': [{ liana: 'l1', route: 'down-off', beat: 'w16-snake-down', easy: 'none' }, { liana: 'l2', route: 'up', beat: 'w16-snake-up', reach: 0.7, easy: 'none' }, { liana: 'f', route: 'still' }],
  },
};

/** 1-6's finish (listed.ts FINISH): its snakes on its laid lianas; throws (the roll is never listed) when one is unfair */
export function finish16<T extends SnakeStage>(st: T, difficulty: Difficulty): T {
  return laySnakes(st, W1_SNAKES_16, difficulty === 'easy');
}

/**
 * World 1's kit with 1-6's rows over it (stageTable.ts kit 'w1-16', listed.ts KITS): its pool is its own sections alone; it swings
 * (withSwing); its graph and brief. The creaky limb is World 1's own row (1-5 taught it).
 */
export function kitLib16(): WorldKit {
  const k = withSwing(w1World()), M = k.manifest, G = M.graphs!;
  return { ...k, manifest: { ...M,
    sections: SECTIONS_16,
    lessons: { jump: '1-1', double: '1-1', bounce: '1-1', climb: '1-4', creak: '1-5' },
    required: {},
    tips: { ...M.tips, ...LINES_16 },
    // (every line of the keeper's here is a TEACH line: Dot says it on Normal's default Tips as on Help, D50)
    teachTips: [...(M.teachTips ?? []), ...(Object.keys(LINES_16) as Array<keyof typeof LINES_16>)],
    // (one brick a node, as 1-6.md designs it: the chunk count never asks a node for a second section (pipeline's chunks = the nodes when
    //  the stage's seconds / chunkSeconds is under their number); the bots measure the 2-minute floor)
    graphs: { ...G, chunkSeconds: 60, list: [...G.list.filter((g) => g.archetype !== 'vine_runner'), ...Object.entries(ARC_16).map(([id, code]) => ({ id, archetype: 'vine_runner' as const, code }))], briefs: { ...G.briefs, [STAGE_16]: BRIEF_16 } },
  } } as WorldKit;
}
