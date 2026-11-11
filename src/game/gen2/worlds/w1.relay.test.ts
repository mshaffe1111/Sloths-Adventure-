/**
 * The C1 re-lay's own checks (R-165.72; packet CONTENT-C1-tests, the C1 packet's done-items 3, 4 and 5), on 1-1 as the game lays it:
 * every listed seed (seedList.ts provenSeeds), each one's proven plan replayed (buildGen2Stage + w1Finish, then withGoals and, on Easy,
 * easyStage, as engine.ts:832 does), on Normal and on Easy. They judge the BUILT geometry, never the builder's own asks.
 *
 *  (a) teach first (STAGE-RULES; ONE-ONE-FIX-PLAN B1): on Normal a practice gap (a double gap with a floor under it: a miss is a climb
 *      out, 1-6's practice spot, dblPractice.test.ts) comes after the double's teach and before every double test gap (one jump cannot
 *      cross it: over 246 px, reach.md §2; bands.md §2's TEST 252-262), and Normal lays at least one (the promise
 *      teach.double-no-gap-after). Easy lays no double gap; where Normal lays a test, Easy's own variant asks only a move taught before
 *      it. The bounce card (lesson.bounce, lessons.ts pickLesson) is wanted at the first mushroom, and that mushroom is the bounce teach's.
 *  (b) room for help (A2's stair, frozen for C1: faces 60 px or less, treads 80 px, the top tread 160 px): every rise is within a plain
 *      single climb (reach.md §2: 123 px onto a block, 117 onto a thin top under 50 px), or has flat solid ground with no pit in it before
 *      its face, at least 80 x (n - 1) + 160 px, n = ceil((rise - 60) / 60); a rise given by a mushroom whose edge is 20-60 px from the
 *      face (bands.md §5) is exempt, counted and named. Prints the tallest non-mushroom rise and the room it has.
 *  (c) put-backs before the need (engine.ts:2467-2473 records the put-back spot at his x on a still solid piece 60 px wide or more,
 *      30 px in from its ends; softFall, engine.ts:4996, sets him back there, up to 150 px clear of the edge): RealPlay walks the route
 *      from the take-off floor over each needed mushroom or rise (one the single cannot climb) to the gap that follows it, and falls in.
 *      The put-back x is never past the mushroom's near edge or the rise's foot (its face, on the floor in front of it).
 *
 * The real-layout checks are EXPECTED red on E0a's 1-1 (the C1 re-lay makes them green): each prints its counts before it asserts.
 * RELAY_SEEDS=n runs the first n listed seeds only (a quick look; the done-items need them all).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import '../../headlessDom.ts';
import { buildGen2Stage } from '../pipeline.ts';
import { provenPlan, provenSeeds } from '../seedList.ts';
import { W1_SECTIONS, w1Finish, w1World } from './w1.ts';
import { generateAllLevels } from '../../worldsData.ts';
import { withGoals } from '../../goals.ts';
import { easyStage } from '../../easyMode.ts';
import { setDifficulty } from '../../difficulty.ts';
import { LESSON_DOT, pickLesson, type LessonId } from '../../lessons.ts';
import { dotLine } from '../../dotLines.ts';
import { RealPlay } from '../../realPlay.ts';
import { swingSetup } from '../../physics.ts';
import type { Gen2Stage } from '../types.ts';

type Setting = 'normal' | 'easy';
const SETTINGS: readonly Setting[] = ['normal', 'easy'];

// ───────────────────────── the flown numbers (reach.md §2, bands.md §2 and §5; A2's frozen stair) ─────────────────────────
/** one jump crosses a level gap up to 246 px at any timing, both settings (reach.md §2 "Single, hold": design to 246) */
export const SINGLE_GAP = 246;
/** the double test band, Normal only (bands.md §2) */
export const TEST_BAND = [252, 262] as const;
/** the highest top one jump climbs: a block (50 px or taller) / a thin top (reach.md §2 "Single, hold") */
export const CLIMB = { block: 123, thin: 117 } as const;
export const BLOCK_H = 50;
/** a mushroom gives the rise when its edge is 20-60 px from the face (bands.md §2 "Bounce teach", §5) */
export const MUSHROOM_EDGE = [20, 60] as const;
/** A2's stair, frozen for C1 (packet C1 "Frozen inputs") */
export const STAIR = { face: 60, tread: 80, top: 160 } as const;
/** the rocks a rise needs, and the flat ground they stand on */
export const stairRocks = (rise: number): number => Math.max(1, Math.ceil((rise - STAIR.face) / STAIR.face));
export const stairRoom = (rise: number): number => STAIR.tread * (stairRocks(rise) - 1) + STAIR.top;

// ───────────────────────── the judges (pure: they read a built stage's geometry) ─────────────────────────
type Plat = { x: number; y: number; width: number; height: number; type: string; broken?: boolean };
type Drop = { x0: number; x1: number; lipY: number; ends: { kind: string } };
type Sec = { template: string; x0: number; x1: number };
/** the parts of a built stage these judges read */
export interface Laid { platforms: readonly Plat[]; gen2: { drops?: readonly Drop[]; sections: readonly Sec[] } }

const solidOf = (st: Laid) => st.platforms.filter((p) => p.type !== 'bouncy' && !p.broken);
const bouncyOf = (st: Laid) => st.platforms.filter((p) => p.type === 'bouncy').sort((a, b) => a.x - b.x);
const R = Math.round;

/** a rise: a solid top whose face he comes at from lower ground (the least rise any top within a single gap behind it gives) */
export interface Rise {
  x: number; top: number; rise: number; thin: boolean; climb: number;
  /** the flat, pit-free ground before the face, and the stair's need */
  room: number; need: number; why: string;
  /** a mushroom on the take-off floor before the face: its near (left) edge and its edge's distance from the face */
  mushroom?: { x: number; edgeToFace: number; given: boolean };
}
export function risesOf(st: Laid): Rise[] {
  const S = solidOf(st), B = bouncyOf(st), out: Rise[] = [];
  for (const P of S) {
    const face = P.x;
    // (the tops behind the face, within a single gap of it, not far overhead: the least rise among them; one level or above: no rise)
    const behind = S.filter((q) => q !== P && q.x < face && q.x + q.width > face - SINGLE_GAP && q.y >= P.y - 250);
    if (!behind.length) continue;
    const rise = Math.min(...behind.map((q) => q.y - P.y));
    if (rise <= 2) continue;
    const floorY = P.y + rise;
    const thin = P.height < BLOCK_H, climb = thin ? CLIMB.thin : CLIMB.block;
    // (the ground right at the face, at the take-off top; then left along joined pieces at that top until a gap)
    const at = (x: number) => S.filter((q) => q !== P && Math.abs(q.y - floorY) <= 2 && q.x < x && q.x + q.width >= x - 1);
    let x0 = face, why = '';
    if (!at(face).length) why = 'a gap in front of the face';
    else for (let g = at(x0); g.length; g = at(x0)) x0 = Math.min(...g.map((q) => q.x));
    // (anything standing on that ground in the span (a stone, a stump, a mushroom) cuts the flat run short)
    let cut = x0;
    for (const q of st.platforms) {
      if (q === P || q.x >= face || q.x + q.width <= x0) continue;
      if (q.y < floorY - 2 && q.y + q.height >= floorY - 2) cut = Math.max(cut, q.x + q.width);
    }
    const room = why ? 0 : Math.max(0, face - cut);
    if (!why && cut > x0) why = 'something stands on the ground before the face';
    else if (!why && x0 > face - stairRoom(rise)) why = 'a gap before the stair fits';
    const m = B.filter((b) => b.x < face && Math.abs(b.y + b.height - floorY) <= 4 && face - (b.x + b.width) <= 250).pop();
    const edge = m ? R(face - (m.x + m.width)) : 0;
    out.push({
      x: R(face), top: R(P.y), rise: R(rise), thin, climb, room: R(room), need: stairRoom(rise), why,
      ...(m ? { mushroom: { x: R(m.x), edgeToFace: edge, given: edge >= MUSHROOM_EDGE[0] && edge <= MUSHROOM_EDGE[1] } } : {}),
    });
  }
  return out;
}
/** (b)'s rule for one rise */
export const riseFits = (r: Rise): 'single' | 'mushroom' | 'room' | 'no' =>
  r.rise <= r.climb ? 'single' : r.mushroom?.given ? 'mushroom' : r.room >= r.need ? 'room' : 'no';

/** the route's gaps, lip to lip, deduped; level when the far top is within 50 px of the lip (verdicts.ts classify's gap kind) */
export interface Gap { x0: number; x1: number; width: number; floored: boolean; level: boolean }
export function gapsOf(st: Laid): Gap[] {
  const seen = new Set<number>(), S = solidOf(st), out: Gap[] = [];
  for (const d of [...(st.gen2.drops ?? [])].sort((a, b) => a.x0 - b.x0 || b.x1 - a.x1)) {
    if (seen.has(R(d.x0))) continue;
    seen.add(R(d.x0));
    const far = S.filter((q) => Math.abs(q.x - d.x1) <= 3).sort((a, b) => a.y - b.y)[0];
    out.push({ x0: R(d.x0), x1: R(d.x1), width: R(d.x1 - d.x0), floored: d.ends.kind === 'floor', level: !far || Math.abs(far.y - d.lipY) <= 50 });
  }
  return out;
}

const TEACHES = new Map(W1_SECTIONS.map((s) => [s.id, s.teaches]));
/** where the move is first taught: the first section whose template teaches it (w1.ts `teaches`) */
export const taughtAt = (st: Laid, move: 'jump' | 'double' | 'bounce'): number | undefined =>
  st.gen2.sections.find((s) => TEACHES.get(s.template) === move)?.x0;

/** what a stretch of the route asks beyond a plain single jump: the double (a gap over 246, a rise over the climb), the bounce (a rise a
 *  mushroom gives), or nothing more */
export function asksIn(st: Laid, x0: number, x1: number): 'double' | 'bounce' | 'single' {
  const over = risesOf(st).filter((r) => r.x >= x0 && r.x < x1 && r.rise > r.climb);
  if (over.some((r) => r.mushroom)) return 'bounce';
  if (over.length || gapsOf(st).some((g) => g.x0 >= x0 && g.x0 < x1 && g.level && g.width > SINGLE_GAP)) return 'double';
  return 'single';
}

/** (a) on one stage: the lines it breaks; `normal` is Normal's stage for an Easy one (its tests' slots) */
export function teachFirst(st: Laid, setting: Setting, normal?: Laid): string[] {
  const bad: string[] = [];
  const dbl = taughtAt(st, 'double');
  const doubles = gapsOf(st).filter((g) => g.level && g.width > SINGLE_GAP);
  if (setting === 'normal') {
    const tests = doubles.filter((g) => !g.floored), practice = doubles.filter((g) => g.floored);
    if (!tests.length) bad.push('no double test gap (over 246 px, not floored) on Normal: teach.double-no-gap-after');
    for (const t of tests) {
      if (t.width < TEST_BAND[0] || t.width > TEST_BAND[1]) bad.push(`test gap at x ${t.x0}: ${t.width} px, outside ${TEST_BAND.join('-')}`);
      if (dbl === undefined || dbl >= t.x0) bad.push(`test gap at x ${t.x0}: the double is not taught before it`);
      if (!practice.some((p) => p.x1 <= t.x0 && (dbl === undefined || p.x0 >= dbl))) bad.push(`test gap at x ${t.x0}: no practice gap (a floored double gap after the teach) before it`);
    }
  } else {
    for (const g of doubles) bad.push(`Easy lays a double gap at x ${g.x0}: ${g.width} px (Easy has none)`);
    // (Easy's own variant where Normal lays its test: the same plan slot, asked of a move taught before it)
    const nTests = normal ? gapsOf(normal).filter((g) => g.level && g.width > SINGLE_GAP && !g.floored) : [];
    for (const t of nTests) {
      const i = normal!.gen2.sections.findIndex((s) => t.x0 >= s.x0 && t.x0 < s.x1);
      const s = st.gen2.sections[i];
      if (i < 0 || !s || s.template !== normal!.gen2.sections[i].template) { bad.push(`Normal's test at x ${t.x0}: Easy has no section in its slot`); continue; }
      const move = asksIn(st, s.x0, s.x1), at = taughtAt(st, move === 'single' ? 'jump' : move);
      if (at === undefined || at > s.x0 || (at === s.x0 && move !== 'single')) bad.push(`Easy's variant of Normal's test (${s.template}, x ${R(s.x0)}) asks the ${move}, not taught before it`);
    }
  }
  // (the bounce card: wanted at the first mushroom, and that mushroom is the bounce teach's)
  const m = bouncyOf(st)[0], b = taughtAt(st, 'bounce');
  if (m) {
    const sec = st.gen2.sections.find((s) => m.x >= s.x0 && m.x < s.x1);
    if (!sec || TEACHES.get(sec.template) !== 'bounce') bad.push(`the first mushroom (x ${R(m.x)}) is in ${sec?.template ?? 'no section'}, not the bounce teach${b === undefined ? ' (none laid)' : ` (x ${R(b)})`}`);
    const floor = solidOf(st).filter((q) => q.x <= m.x - 200 && q.x + q.width >= m.x - 200 && q.y >= m.y + m.height - 4).sort((p, q) => p.y - q.y)[0];
    const px = m.x - 200, py = floor?.y ?? m.y + m.height;
    const seen = new Set((Object.keys(LESSON_DOT) as LessonId[]).filter((k) => k !== 'bounce'));
    const scene = { px, py, view: { x0: px - 300, x1: px + 600, y0: py - 340, y1: py + 160 }, enemies: [], collectibles: [], vines: [], platforms: [...st.platforms], checkpoints: [], rivers: [] };
    if (pickLesson(scene, seen) !== 'bounce') bad.push(`the bounce card is not wanted 200 px before the first mushroom (x ${R(m.x)})`);
  } else if (b !== undefined) bad.push('the bounce teach lays no mushroom');
  return bad;
}

// ───────────────────────── 1-1 as the game lays it ─────────────────────────
const cfg11 = () => ({ ...generateAllLevels().find((l) => l.id === '1-1')!, unlocked: true });
const N = Number(process.env.RELAY_SEEDS ?? 0);
const SEEDS = N > 0 ? provenSeeds('1-1').slice(0, N) : [...provenSeeds('1-1')];
const built = new Map<string, Gen2Stage>();
/** the listed seed's proven plan replayed (the stage the game plays from the list; a failed check is kept: today's layout is judged) */
function lay(seed: number, setting: Setting): Gen2Stage {
  const k = `${seed}/${setting}`;
  let st = built.get(k);
  if (!st) {
    st = w1Finish(buildGen2Stage({ config: cfg11(), kit: w1World(), seed, difficulty: setting, replay: provenPlan('1-1', seed) }));
    st = withGoals(st);
    if (setting === 'easy') st = easyStage(st as never) as unknown as Gen2Stage;
    built.set(k, st);
  }
  return st;
}

// ───────────────────────── (c) RealPlay: the put-back after a needed mushroom or rise ─────────────────────────
type Eng = Record<string, any>;
const plays = new Map<Setting, RealPlay>();
/** one engine a setting (setDifficulty before it: the engine reads isEasy() as it is made), its stage swapped for the one judged */
function engineOn(st: Laid & object, setting: Setting): RealPlay {
  let r = plays.get(setting);
  if (!r) {
    setDifficulty(setting);
    r = new RealPlay('1-2', 1);
    r.safe = true;
    const e = r.e as Eng;
    const soft = e.softFall.bind(e), heart = e.heartFall.bind(e);
    e.softFall = () => { const ok = soft(); if (ok) (r as unknown as { back?: number[] }).back!.push(e.player.x); return ok; };
    e.heartFall = () => { const ok = heart(); if (ok) (r as unknown as { back?: number[] }).back!.push(e.player.x); return ok; };
    plays.set(setting, r);
  }
  const e = r.e as Eng, s = st as unknown as Gen2Stage;
  const platforms = s.platforms.map((p) => ({ ...p }));
  e.currentStage = { ...s, platforms };
  Object.assign(e, { platforms, vines: s.vines ?? [], ropes: s.ropes ?? [], enemies: [], collectibles: [], proto: s.proto ?? null, w4: null, softOn: !!s.gen2?.softFalls, softAt: null });
  swingSetup(e.vines);
  (r as unknown as { back: number[] }).back = [];
  return r;
}
/** the surface he walks on at x: the highest top within reach of the last one (a double's climb up, any way down) */
function surfaceAt(S: readonly Plat[], x: number, lastY: number): Plat | undefined {
  return S.filter((q) => q.x <= x && q.x + q.width >= x && q.y >= lastY - 214).sort((a, b) => a.y - b.y)[0];
}
export interface PutBack { need: string; limit: number; gap: number; back: number | null; lost: boolean; ok: boolean }
/** walk from the take-off floor before the need to the gap after it, standing on each top on the way (the engine sets his put-back spot
 *  as he stands), then run off the lip of the gap that follows (in its section, before the next need); the put-back x, or null when he lands on a floor (a climb out) */
export function putBacks(st: Laid & object, setting: Setting): PutBack[] {
  const out: PutBack[] = [], S = solidOf(st), gaps = gapsOf(st);
  const needs = risesOf(st).filter((r) => r.rise > r.climb).sort((a, b) => a.x - b.x);
  needs.forEach((n, i) => {
    const limit = n.mushroom ? n.mushroom.x : n.x;
    // (the gap that follows it: the first after its face, in its own section and before the next need; none: nothing to judge)
    const sec = st.gen2.sections.find((s) => n.x >= s.x0 && n.x < s.x1), next = needs[i + 1]?.x ?? Infinity;
    const g = gaps.find((q) => q.x0 >= n.x && q.x0 < next && (!sec || q.x0 < sec.x1));
    if (!g) return;
    const r = engineOn(st, setting);
    const floorY = n.top + n.rise, x0 = limit - 40;
    r.stand(x0, floorY);
    r.frame();
    let y = n.top;
    for (let x = n.x + 20; x < g.x0 - 10; x += 20) {
      const q = surfaceAt(S, x, y);
      if (!q) continue;
      y = q.y;
      r.stand(x, q.y);
      r.frame();
    }
    const lip = surfaceAt(S, g.x0 - 12, y);
    r.stand(g.x0 - 12, lip ? lip.y : y);
    const back = (r as unknown as { back: number[] }).back;
    for (let i = 0; i < 150 && !back.length; i++) r.frame({ right: true });
    const at = back.length ? R(back[0]) : null, lost = !back.length && r.died;
    out.push({ need: `${n.mushroom ? 'mushroom' : 'rise'} at x ${n.x} (${n.rise} px)`, limit, gap: g.x0, back: at, lost, ok: !lost && (at === null || at <= limit) });
  });
  return out;
}

// ───────────────────────── planted: a good case passes each check, a bad one fails it ─────────────────────────
const P = (x: number, y: number, width: number, height = 300, type = 'solid'): Plat => ({ x, y, width, height, type });
const D = (x0: number, x1: number, lipY: number, floor: boolean): Drop => ({ x0, x1, lipY, ends: { kind: floor ? 'floor' : 'putback' } });
const sec = (template: string, x0: number, x1: number): Sec => ({ template, x0, x1 });

/** Normal: the jump taught (0-1000), the double's D block (140 px) and a floored practice gap (255 px, or 200 px: no practice), the bounce
 *  teach's mushroom 40 px from a 235 px lip, then a 256 px test gap */
function plantedNormal(good: boolean): Laid {
  const w = good ? 255 : 200;
  return {
    platforms: [
      P(0, 1000, 1000), P(1000, 860, 400), P(1400, 860, 400), P(1800 + w, 860, 1055 - w),
      P(2855, 860, 760), P(3505, 830, 70, 30, 'bouncy'), P(3615, 625, 440, 535),
      P(4311, 625, 600),
    ],
    gen2: {
      drops: [D(1800, 1800 + w, 860, true), D(4055, 4311, 625, false)],
      sections: [sec('w1-learn', 0, 1000), sec('w1-double-teach', 1000, 2855), sec('w1-mushroom-bank-teach', 2855, 4055), sec('w1-high-walk', 4055, 5000)],
    },
  };
}

test('planted (a): a test gap after a floored practice gap and the teach passes; without the practice, it fails by name', () => {
  assert.deepEqual(teachFirst(plantedNormal(true), 'normal'), []);
  const bad = teachFirst(plantedNormal(false), 'normal');
  assert.ok(bad.some((l) => /no practice gap/.test(l)), bad.join('; '));
  // (no test gap at all: Normal must lay one)
  const none = plantedNormal(true);
  assert.ok(teachFirst({ ...none, gen2: { ...none.gen2, drops: none.gen2.drops!.slice(0, 1) } }, 'normal').some((l) => /no double test gap/.test(l)));
  // (a test laid before the double is taught)
  const early = plantedNormal(true);
  const moved = { ...early, gen2: { ...early.gen2, sections: [sec('w1-learn', 0, 1000), sec('w1-high-walk', 1000, 2855), sec('w1-mushroom-bank-teach', 2855, 4055), sec('w1-double-teach', 4055, 5000)] } };
  assert.ok(teachFirst(moved, 'normal').some((l) => /not taught before/.test(l)));
});

test("planted (a): Easy's variant in the test's slot asks a taught move and lays no double gap; a double gap on Easy fails", () => {
  const n = plantedNormal(true);
  // (Easy: the same plan; the practice is a single gap, the test's slot a 130 px D-style rise after the double's teach)
  const easy: Laid = {
    platforms: [P(0, 1000, 1000), P(1000, 860, 400), P(1400, 860, 400), P(1940, 860, 915), P(2855, 860, 760), P(3505, 830, 70, 30, 'bouncy'), P(3615, 625, 440, 535), P(4055, 625, 200), P(4255, 495, 400, 300)],
    gen2: { drops: [D(1800, 1940, 860, true)], sections: n.gen2.sections },
  };
  assert.deepEqual(teachFirst(easy, 'easy', n), []);
  assert.equal(asksIn(easy, 4055, 5000), 'double');
  const wide = { ...easy, gen2: { ...easy.gen2, drops: [D(1800, 2100, 860, true)] } };
  assert.ok(teachFirst(wide, 'easy', n).some((l) => /Easy lays a double gap/.test(l)));
  // (the same variant with the double taught after it)
  const late = { ...easy, gen2: { ...easy.gen2, sections: [sec('w1-learn', 0, 1000), sec('w1-high-walk', 1000, 2855), sec('w1-mushroom-bank-teach', 2855, 4055), sec('w1-double-teach', 4055, 5000)] } };
  assert.ok(teachFirst(late, 'easy', { ...n, gen2: { ...n.gen2, sections: late.gen2.sections } }).some((l) => /not taught before it/.test(l)));
});

test('planted (a): the bounce card is wanted at the first mushroom, the teach\'s; a mushroom before the teach fails', () => {
  assert.equal(dotLine('lesson.bounce')?.id, 'lesson.bounce');
  const n = plantedNormal(true);
  const early = { ...n, platforms: [...n.platforms, P(600, 970, 70, 30, 'bouncy')] };
  assert.ok(teachFirst(early, 'normal').some((l) => /first mushroom .* not the bounce teach/.test(l)));
});

test('planted (b): a rise a single climbs, a stair with room, a mushroom 20-60 px from the face pass; a tall rise with no room fails', () => {
  const st = (pl: Plat[]): Laid => ({ platforms: pl, gen2: { drops: [], sections: [] } });
  // (single: 110 px onto a block; the stair: 200 px rise needs n = 3 rocks, 80 x 2 + 160 = 320 px of flat ground)
  assert.equal(stairRoom(200), 320);
  assert.equal(stairRoom(140), 240);
  const ok = risesOf(st([P(0, 1000, 1000), P(1000, 890, 200), P(1200, 1000, 600), P(1800, 800, 300)]));
  assert.deepEqual(ok.map(riseFits), ['single', 'room'], JSON.stringify(ok));
  const tight = risesOf(st([P(0, 1000, 300), P(400, 1000, 300), P(700, 800, 300)]));
  assert.deepEqual(tight.map((r) => [riseFits(r), r.room]), [['no', 300]]);
  const stone = risesOf(st([P(0, 1000, 1000), P(800, 950, 60, 50), P(1000, 800, 300)])).find((r) => r.x === 1000)!;
  assert.equal(riseFits(stone), 'no', 'a stone on the ground cuts the run');
  const pit = risesOf(st([P(0, 1000, 800), P(900, 1000, 0, 0), P(1000, 800, 300)].filter((p) => p.width)));
  assert.deepEqual(pit.map((r) => [riseFits(r), r.why]), [['no', 'a gap in front of the face']]);
  const mush = risesOf(st([P(0, 1000, 700), P(630, 970, 70, 30, 'bouncy'), P(740, 760, 300)]));
  assert.deepEqual(mush.map((r) => [riseFits(r), r.mushroom?.edgeToFace]), [['mushroom', 40]]);
  const far = risesOf(st([P(0, 1000, 700), P(600, 970, 70, 30, 'bouncy'), P(746, 760, 300)]));
  assert.deepEqual(far.map((r) => [riseFits(r), r.mushroom?.edgeToFace]), [['no', 76]]);
  // (a thin top: 120 px onto a 24 px bough is over the thin climb, 117)
  assert.equal(riseFits(risesOf(st([P(0, 1000, 2000), P(1000, 880, 200, 24)]))[0]), 'room');
});

// (c)'s planted stage: a real built 1-1's rules (its softFalls, its config) with planted ground: a floor, a 140 px rise, the gap after it
function plantedPutBack(width: number): Gen2Stage {
  const base = lay(SEEDS[0], 'normal');
  const H = base.config.levelHeight;
  const y = H - 300;
  const platforms = [
    { id: 1, x: 0, y, width: 1200, height: 300, type: 'solid' as const, style: 'moss_stone' as const },
    { id: 2, x: 1200, y: y - 140, width, height: 140 + 300, type: 'solid' as const, style: 'moss_stone' as const },
    { id: 3, x: 1200 + width + 200, y: y - 140, width: 800, height: 440, type: 'solid' as const, style: 'moss_stone' as const },
  ];
  return { ...base, platforms, heartFalls: [], checkpoints: [], gen2: { ...base.gen2, softFalls: true, drops: [{ x0: 1200 + width, x1: 1400 + width, lipY: y - 140, ends: { kind: 'putback', to: 'last-still-ground' }, look: 'void-dark' }] as never } } as Gen2Stage;
}
test('planted (c): a rise top under 60 px wide keeps the put-back on the floor before the rise; a 300 px top puts him back past its foot', () => {
  for (const setting of SETTINGS) {
    const good = putBacks(plantedPutBack(50), setting);
    assert.equal(good.length, 1, setting);
    assert.ok(good[0].back !== null && good[0].ok, `${setting}: ${JSON.stringify(good)}`);
    const bad = putBacks(plantedPutBack(300), setting);
    assert.ok(bad[0].back !== null && !bad[0].ok && bad[0].back > 1200, `${setting}: ${JSON.stringify(bad)}`);
  }
});

// ───────────────────────── the real layouts (EXPECTED red on E0a's 1-1: the counts print first) ─────────────────────────
test(`1-1 (a) teach first, ${SEEDS.length} listed seeds, both settings: a practice gap before every double test, Easy's variant taught, the bounce card at the first mushroom`, () => {
  const bad: string[] = [], kinds = new Map<string, number>();
  for (const seed of SEEDS) {
    const n = lay(seed, 'normal');
    for (const [setting, st] of [['normal', n], ['easy', lay(seed, 'easy')]] as const) {
      for (const l of teachFirst(st, setting, n)) {
        bad.push(`${setting} seed ${seed}: ${l}`);
        const k = `${setting}: ${l.replace(/x \d+/g, 'x _').replace(/\d+ px/g, '_ px').replace(/\(x _\)/, '')}`;
        kinds.set(k, (kinds.get(k) ?? 0) + 1);
      }
    }
  }
  console.log(`(a) teach first: ${bad.length} breaches over ${SEEDS.length} seeds x 2 settings`);
  for (const [k, c] of [...kinds].sort((a, b) => b[1] - a[1])) console.log(`  ${c} x ${k}`);
  assert.deepEqual(bad.slice(0, 12), [], `${bad.length} in all`);
});

test(`1-1 (b) room for help, ${SEEDS.length} listed seeds, both settings: every rise a single climbs, a mushroom gives, or a stair fits before`, () => {
  const bad: string[] = [];
  for (const setting of SETTINGS) {
    let rises = 0, single = 0, room = 0;
    const given: string[] = [];
    let tallest: { r: Rise; seed: number } | undefined;
    for (const seed of SEEDS) {
      for (const r of risesOf(lay(seed, setting))) {
        rises++;
        const f = riseFits(r);
        if (f === 'single') single++;
        else if (f === 'room') room++;
        else if (f === 'mushroom') given.push(`seed ${seed} x ${r.x} (${r.rise} px, edge ${r.mushroom!.edgeToFace} px)`);
        else bad.push(`${setting} seed ${seed}: rise at x ${r.x}, ${r.rise} px${r.thin ? ' (thin)' : ''}: room ${r.room} px of ${r.need}${r.why ? ` (${r.why})` : ''}${r.mushroom ? `; mushroom edge ${r.mushroom.edgeToFace} px from the face, off 20-60` : ''}`);
        if (f !== 'mushroom' && (!tallest || r.rise > tallest.r.rise)) tallest = { r, seed };
      }
    }
    const no = bad.filter((l) => l.startsWith(setting)).length;
    console.log(`(b) ${setting}: ${rises} rises: ${single} within a single climb, ${room} with a stair's room, ${given.length} given by a mushroom 20-60 px from the face, ${no} with no room`);
    if (given.length) console.log(`  mushroom-given: ${given.slice(0, 6).join('; ')}${given.length > 6 ? ` (+${given.length - 6})` : ''}`);
    if (tallest) console.log(`  tallest non-mushroom rise: seed ${tallest.seed} x ${tallest.r.x}, ${tallest.r.rise} px${tallest.r.thin ? ' (thin)' : ''}, room ${tallest.r.room} px, the stair needs ${tallest.r.need}${tallest.r.mushroom ? ` (a mushroom ${tallest.r.mushroom.edgeToFace} px from the face, off the band)` : ''}`);
  }
  for (const l of bad.slice(0, 10)) console.log(`  ${l}`);
  assert.deepEqual(bad.slice(0, 12), [], `${bad.length} in all`);
});

test(`1-1 (c) put-backs, ${SEEDS.length} listed seeds, both settings: RealPlay falls into the gap after each needed mushroom or rise; never put back past it`, () => {
  const bad: string[] = [];
  for (const setting of SETTINGS) {
    let falls = 0, floored = 0, ok = 0;
    for (const seed of SEEDS) {
      for (const b of putBacks(lay(seed, setting), setting)) {
        falls++;
        if (b.lost) bad.push(`${setting} seed ${seed}: ${b.need}, gap at x ${b.gap}: a life lost, no put-back`);
        else if (b.back === null) floored++;
        else if (b.ok) ok++;
        else bad.push(`${setting} seed ${seed}: ${b.need}, gap at x ${b.gap}: put back at x ${b.back}, past x ${b.limit}`);
      }
    }
    const no = bad.filter((l) => l.startsWith(setting)).length;
    console.log(`(c) ${setting}: ${falls} falls after a need: ${ok} put back before it, ${no} put back past it, ${floored} landed on a floor (no put-back)`);
  }
  for (const l of bad.slice(0, 10)) console.log(`  ${l}`);
  assert.deepEqual(bad.slice(0, 12), [], `${bad.length} in all`);
});
