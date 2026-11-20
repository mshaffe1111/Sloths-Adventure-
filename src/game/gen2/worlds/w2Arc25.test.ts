/**
 * 2-5 River Snappers (BUILD-25, BUILD-25b; reference/design/2-5.md, the lead's rulings 11-20): the built stage, read the way the game
 * builds it (its stage-table row, kit 'w2-25', then World 2's finish), on both settings. The keeper's words verbatim; the arc beat for beat;
 * the snap rows by the beat (the teaching stone splash-back with its bite free, R-165.337; deep on Normal from beat 3 but beat 4; every Easy
 * pond splash-back; the wave five on Normal, three on Easy; every 0.75 s row on the river's one bar, the quickening on its own); the nine
 * snappers at their designed sockets (the first asleep) and the goal as Play asks it (8, Easy 5: R-165.336); each teach line 800+ px before
 * what it teaches with no snap stone or snapper between; `quiet` past the Big Snap. Each test names the fault that turns it red
 * (reference/qa-reports/BUILD-25/planted-faults.py).
 */
import '../../headlessDom.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildGen2Stage } from '../pipeline.ts';
import { listedStage, playFinish, worldFinish } from '../listed.ts';
import { snapFaults } from '../rideLay.ts';
import { loadSeedList, QUIET_MAX } from '../seedList.ts';
import { generateAllLevels } from '../../worldsData.ts';
import { generateStage, setLayoutVariant } from '../../stageGenerator.ts';
import { countWord, goalLine, SEALED_LINES } from '../../stagePlan.ts';
import { PREDATOR_ENTRIES } from '../../journal.ts';
import { goalInfo } from '../../../components/hud/goalInfo.ts';
import { RealPlay } from '../../realPlay.ts';
import { setDifficulty } from '../../difficulty.ts';
import type { RiverZone } from '../../river.ts';
import { STAGE_TABLE } from './stageTable.ts';
import { W2_TIPS } from './w2.ts';
import { ARC_25, BRIEF_25, GOAL_25, LINES_25, MISSION_25, PADS_25, SEALED_25, STAGE_25, TEACH_25, TURTLE_TIP_25, kitLib25 } from './w2Arc25.ts';
import type { Enemy, Platform } from '../../types.ts';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
const cfg = generateAllLevels().find((c) => c.id === STAGE_25 && !c.secret)!;
type Built = {
  platforms: Platform[]; rivers?: RiverZone[]; enemies: Enemy[]; clocks?: Array<{ id: string }>; proto: { hints?: Array<{ x: number; text: string }> };
  gen2: { errors?: string[]; sections: Array<{ template: string; x0: number; x1: number }> };
};
const memo = new Map<string, Built>();
/** the stage as the game builds it: its listed kit, then World 2's finish */
function built(seed: number, d: 'normal' | 'easy'): Built {
  const k = `${seed}:${d}`;
  if (!memo.has(k)) {
    const row = listedStage(STAGE_25)!;
    const st = buildGen2Stage({ config: cfg, kit: row.kit(), seed, difficulty: d });
    memo.set(k, worldFinish(row)(st as never, false, d) as unknown as Built);
  }
  return memo.get(k)!;
}
const SEEDS = [1, 4, 5];
const BOTH = ['normal', 'easy'] as const;
const BEATS = ['reach', 'one-stone', 'sleeper', 'three', 'awake', 'rest', 'rope', 'wave', 'rest', 'sandbars', 'quickening', 'rest', 'big-snap', 'far-bank'];
const hintX = (st: Built, line: string) => st.proto.hints?.find((h) => h.text === line)?.x;
/** the beat (its brick's name) a point lies in */
const beatAt = (st: Built, x: number) => st.gen2.sections.find((s) => x >= s.x0 && x < s.x1)?.template.replace('w2-25-', '');
const snapsOf = (st: Built) => st.platforms.filter((p) => p.pad?.on === 'bites').sort((a, b) => a.x - b.x);
const snappers = (st: Built) => st.enemies.filter((e) => e.type === 'turtle').sort((a, b) => a.x - b.x);
/** each snap pond (still water with a biting stone in it), in order, with its beat, its stones and whether it splashes him back */
function ponds(st: Built) {
  const s = snapsOf(st);
  return (st.rivers ?? []).filter((r) => r.speed === 0).sort((a, b) => a.x0 - b.x0)
    .map((r) => ({ r, stones: s.filter((p) => p.x > r.x0 && p.x < r.x1), beat: beatAt(st, r.x0 + 1)! }))
    .filter((q) => q.stones.length);
}

test("2-5's lines are the story keeper's, word for word (reference/story/lines-2-5.md, KEEPER-25 t-keeper-25@a7ad4455), and the stage says them", () => {
  const md = fs.readFileSync(path.join(root, 'reference/story/lines-2-5.md'), 'utf8');
  const rows = new Map<string, string>();
  for (const m of md.matchAll(/^\| \d+ \| (?:journal )?`([a-z]+)` \|[^|]*\| (.+?) \| \d+ \|$/gm)) rows.set(m[1], m[2].trim());
  for (const [k, v] of Object.entries(LINES_25)) assert.equal(v, rows.get(k), `line ${k}`);
  assert.equal(MISSION_25, rows.get('mission'), 'the stage card');
  assert.equal(SEALED_25, rows.get('sealed'), 'the sealed line');
  assert.equal(TURTLE_TIP_25, rows.get('turtle'), "the Snapping Turtle's journal tip");
  // (where the game says them: the card (stagePlan.ts), Dot at the locked exit (SEALED_LINES), the journal; the old 2-5 hints are gone)
  assert.ok(fs.readFileSync(path.join(root, 'src/game/stagePlan.ts'), 'utf8').includes(`S('purge', 'River Snappers', '${MISSION_25}')`), 'stagePlan.ts says MISSION_25');
  assert.equal(SEALED_LINES['2:purge'], SEALED_25);
  assert.equal(PREDATOR_ENTRIES.turtle.tip, TURTLE_TIP_25);
  assert.ok(!/"hint\.2-5\./.test(fs.readFileSync(path.join(root, 'src/game/dotLinesData.ts'), 'utf8')), "the hand-built 2-5's hints are gone");
  // (nobody is hurt in World 2: the goal's words say "chase off" and "snappers", the counter and the purge card the same)
  assert.equal(goalLine('late', 2, 'purge', 2), 'Still 2 snappers to chase off before the sanctuary opens');
  assert.equal(countWord(2, 'purge'), 'snappers');
  const card = goalInfo(cfg);
  assert.equal(card.noun, 'snappers');
  assert.equal(card.line, `This stage: send ${GOAL_25} snappers on their way`);
  for (const d of BOTH) {
    const said = new Set(built(1, d).proto.hints!.map((h) => h.text));
    for (const v of Object.values(LINES_25)) assert.ok(said.has(v), `${d}: "${v}" is said`);
  }
});

test('the row: 2-5 rolls from its own kit (World 2 with 2-5 rows), CLEAN on both settings, the arc beat for beat, only its own bricks', () => {
  assert.equal(STAGE_TABLE[STAGE_25].kit, 'w2-25');
  assert.equal(kitLib25().manifest.world, 2);
  assert.equal(Object.values(ARC_25)[0].split(' ').length, BEATS.length);
  for (const seed of SEEDS) for (const d of BOTH) {
    const st = built(seed, d);
    assert.deepEqual(st.gen2.errors ?? [], [], `${seed} ${d}`);
    assert.deepEqual(st.gen2.sections.map((s) => s.template.replace('w2-25-', '')), BEATS, `${seed} ${d}`);
  }
  assert.equal(BRIEF_25.petals, 'few', "the keeper's 2-1 ruling: Meeca's petals are few in World 2");
});

test("the stage's find stands on the first rest, as Play builds it (BUILD-25b: its HOLD DOWN sign stood beside the teaching stone and read as the stone's answer; 1-8's rule)", async () => {
  await loadSeedList(STAGE_25);
  for (const v of [1, 2, 3, 4]) for (const d of BOTH) {
    setLayoutVariant(v);
    const st = generateStage(cfg, d) as unknown as Built & { collectibles: Array<{ type: string; x: number }> };
    const finds = st.collectibles.filter((c) => c.type === 'find');
    assert.equal(finds.length, 1, `L${v} ${d}: one find`);
    const rest = st.gen2.sections.find((s) => s.template === 'w2-25-rest')!;
    assert.ok(finds[0].x >= rest.x0 && finds[0].x < rest.x1, `L${v} ${d}: the find at ${Math.round(finds[0].x)}, in ${beatAt(st, finds[0].x)}, not the first rest (${Math.round(rest.x0)}-${Math.round(rest.x1)})`);
  }
  setLayoutVariant(null);
});

test('the snap rows by the beat: the teaching stone splash-back and its bite free; deep on Normal from beat 3 but beat 4; every Easy pond splash-back; the wave 5 / Easy 3; the river\'s one bar, the quickening its own', () => {
  // (the rows: an Easy twin keeps its Normal row's clock (PadRow.clock), so a snapper on that clock keeps it on both settings)
  const rows = PADS_25 as Record<string, { clock?: string; safe?: boolean; freeBite?: boolean; snap?: { count: number } }>;
  for (const [k, r] of Object.entries(rows)) {
    assert.equal(r.clock, r.snap!.count === 0.6 ? 'quick' : 'river', `${k}: its clock by its count`);
    if (k.endsWith('e')) assert.ok(r.safe && r.clock === rows[k.slice(0, -1)].clock, `${k}: Easy's twin splash-back, on its Normal row's clock`);
  }
  // [beat, stones Normal, stones Easy, deep on Normal]
  const WANT: Array<[string, number, number, boolean]> = [
    ['one-stone', 1, 1, false], ['three', 3, 3, true], ['awake', 2, 2, false], ['wave', 5, 3, true], ['quickening', 3, 3, true], ['quickening', 3, 3, true], ['big-snap', 4, 4, true],
  ];
  for (const seed of SEEDS) for (const d of BOTH) {
    const st = built(seed, d);
    assert.deepEqual(snapFaults(st as never, d), [], `${seed} ${d}`);
    const ps = ponds(st);
    assert.deepEqual(ps.map((p) => [p.beat, p.stones.length]), WANT.map(([b, n, e]) => [b, d === 'easy' ? e : n]), `${seed} ${d}: the ponds by beat`);
    assert.deepEqual(ps.map((p) => !p.r.safe), WANT.map(([, , , deep]) => d === 'normal' && deep), `${seed} ${d}: which bite for real`);
    for (const p of ps) for (const s of p.stones) {
      assert.equal(s.pad!.clock, p.beat === 'quickening' ? 'snap-quick' : 'snap-river', `${seed} ${d}: ${p.beat}'s stone at ${Math.round(s.x)}`);
      assert.equal(!!s.pad!.freeBite, p.beat === 'one-stone', `${seed} ${d}: ${p.beat}'s stone at ${Math.round(s.x)}: free bite only on the teaching stone`);
    }
    assert.deepEqual((st.clocks ?? []).map((c) => c.id).filter((c) => c.startsWith('snap-')).sort(), ['snap-quick', 'snap-river'], `${seed} ${d}: two bars`);
    // (the wave runs ahead: each a count later)
    const wave = ps.find((p) => p.beat === 'wave')!;
    assert.deepEqual(wave.stones.map((s) => s.pad!.shift ?? 0), wave.stones.map((_, i) => (i ? -0.75 * i : 0)), `${seed} ${d}: the wave`);
  }
});

test('the snappers: nine at their designed sockets (the first asleep), on the stones\' bars; the goal is the design\'s, 8 of 9, as Play asks it (Easy 5)', async () => {
  // [beat, snappers, clock]
  const WANT: Array<[string, string]> = [['sleeper', 'snap-river'], ['awake', 'snap-river'], ['rope', 'snap-river'], ['rope', 'snap-river'], ['sandbars', 'snap-river'], ['sandbars', 'snap-river'], ['sandbars', 'snap-river'], ['quickening', 'snap-quick'], ['quickening', 'snap-quick']];
  assert.equal(GOAL_25, WANT.length - 1, 'every one laid but one');
  assert.equal(cfg.targetCount, GOAL_25);
  assert.equal(cfg.countSet, true, 'the goal is the design\'s (R-165.336): no top-up');
  for (const seed of SEEDS) for (const d of BOTH) {
    const st = built(seed, d);
    const t = snappers(st);
    assert.deepEqual(t.map((e) => [beatAt(st, e.x), e.kitBeat?.clock]), WANT, `${seed} ${d}: the snappers by beat, by bar`);
    assert.deepEqual(t.map((e) => !!e.asleep), WANT.map((_, i) => i === 0), `${seed} ${d}: the first asleep, the rest awake`);
  }
  // (as Play builds it, engine.ts: withGoals, then easyStage on Easy. BUILD-25b: it asked 7, Easy 6, the share of what it laid)
  await loadSeedList(STAGE_25);
  for (const [d, want] of [['normal', GOAL_25], ['easy', 5]] as const) {
    setDifficulty(d);
    const sim = new RealPlay(STAGE_25, 1);
    const s = (sim as unknown as { e: { currentStage: { config: { targetCount: number } } } }).e.currentStage;
    assert.equal(s.config.targetCount, want, `${d}: Play asks ${want}`);
  }
  setDifficulty('normal');
});

test('Dot teaches before the thing, with time to read (level.md rule 6): each teach 800+ px before its thing, no snap stone or snapper between; `quiet` past the Big Snap; the water warning before the first deep pond', () => {
  assert.deepEqual([...TEACH_25], ['count', 'snapper', 'snap', 'follow']);
  for (const seed of SEEDS) for (const d of BOTH) {
    const st = built(seed, d);
    const ps = ponds(st), t = snappers(st), s = snapsOf(st);
    const at = {
      count: ps.find((p) => p.beat === 'one-stone')!.stones[0].x,
      snapper: t[0].x,
      snap: t.find((e) => beatAt(st, e.x) === 'awake')!.x,
      follow: ps.find((p) => p.beat === 'wave')!.stones[0].x,
    };
    for (const k of TEACH_25) {
      const x = hintX(st, LINES_25[k]);
      assert.ok(x !== undefined, `${seed} ${d}: "${k}" is said`);
      assert.ok(at[k] - x! >= 800, `${seed} ${d}: "${k}" ${Math.round(at[k] - x!)} px before its thing`);
      assert.ok(!s.some((p) => p.x > x! && p.x < at[k]) && !t.some((e) => e.x > x! && e.x < at[k]), `${seed} ${d}: a snap stone or snapper between "${k}" and its thing`);
    }
    const big = ps.find((p) => p.beat === 'big-snap')!.stones;
    const q = hintX(st, LINES_25.quiet);
    assert.ok(q !== undefined && q >= big[big.length - 1].x + big[big.length - 1].width, `${seed} ${d}: "quiet" at ${q}, past the Big Snap's last stone`);
    if (d === 'normal') {
      const w = hintX(st, W2_TIPS.water);
      const deep = ps.find((p) => !p.r.safe)!;
      assert.ok(w !== undefined && w < deep.r.x0, `${seed}: the water warning (${w}) before the first deep pond (${Math.round(deep.r.x0)})`);
    }
  }
});

test("the quiet line holds on the stage as Play builds it: nowhere before the far bank 4 s or more with nothing to do (Normal, seeds 1-6; BUILD-25b: 1,194 of 1,199 rolls broke it before each long bank got a hop)", async () => {
  const { quietOf } = await import('../../../../tools/engine/listRules.ts');
  const row = listedStage(STAGE_25)!;
  for (const seed of [1, 2, 3, 4, 5, 6]) {
    const st = buildGen2Stage({ config: cfg, kit: row.kit(), seed, difficulty: 'normal' });
    const q = quietOf(cfg, st, (s, d) => playFinish(row, s, d));
    assert.ok(q.quiet <= QUIET_MAX, `seed ${seed}: ${q.quiet} s with nothing to do at x ${Math.round(q.x)}`);
  }
});

test("the lay keeps the seed list's own rules as its search builds it (seeds 1-12 and the four a 300 px quickening rest broke, both settings): flags within 2300 px over the quickening's water and snappers, and the quiet line past the awake beat's logs (BUILD-25d: 9 of 100 listed seeds failed both once 2-5 was judged on its flown rows; fixed in the pieces, never relisted around; yield.ts --list 217 -> 1000 of 1000)", async () => {
  const { listJudge } = await import('../../../../tools/engine/listRules.ts');
  const row = listedStage(STAGE_25)!;
  const also = listJudge(cfg, (s, d) => playFinish(row, s, d));
  const bad: string[] = [];
  for (const seed of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 426, 429, 564, 658]) for (const difficulty of ['normal', 'easy'] as const) {
    const st = buildGen2Stage({ config: cfg, kit: row.kit(), seed, difficulty, also });
    for (const e of st.gen2.errors ?? []) bad.push(`seed ${seed} ${difficulty}: ${e}`);
  }
  assert.deepEqual(bad, []);
});

test("no 2-5 brick ends on a boulder: its exit is a bank, so the next section starts at the bank's end and the boulder is a hop on the route (BUILD-25d: a boulder listed last was the exit, the next section hung off its top over the bank, and the route walked under it)", async () => {
  const { SECTIONS_25 } = await import('./w2Arc25.ts');
  for (const t of SECTIONS_25) for (const v of t.subBlocks?.flatMap((b) => b.versions) ?? []) {
    const ex = [...t.pieces, ...v.pieces].find((p) => p.key === t.exit.piece);
    assert.ok(ex && ex.place.kind !== 'on', `${t.id}/${v.id}: its exit '${t.exit.piece}' is ${ex?.shape} on '${ex && 'on' in ex.place ? ex.place.on : '?'}'`);
  }
});
