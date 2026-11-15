/**
 * 1-8 The Long Branch (BUILD-18; reference/design/1-8.md on t-1718-design): the built stage, read the way the game builds it (its
 * stage-table row: kitLib18, World 1's finish, then finish18, listed.ts), on both settings. The keeper's words verbatim; the arc beat for
 * beat; the chase in five stretches each within Matt's span, the last the tip; every teach line 800 px or more before what it teaches with
 * nothing that hurts between; one threat at a time; Easy's nuts and fruit a bump only and its gaps 50 px or under; the still fork laid
 * with one pass; the hearts on their forks; the exit never locks.
 * Planted faults: reference/qa-reports/BUILD-18/planted-faults.py (each one turns a named test here red).
 */
import '../../headlessDom.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildGen2Stage } from '../pipeline.ts';
import { listedStage } from '../listed.ts';
import { chaseCap, easyGapProblems, CHASE_LAY } from '../chaseLay.ts';
import { generateAllLevels } from '../../worldsData.ts';
import { STAGE_PLAN, sealedLine } from '../../stagePlan.ts';
import { DOT_LINES } from '../../dotLinesData.ts';
import { w1Finish } from './w1.ts';
import { DRESS_18, HEARTS_18, LINES_18, MISSION_18, ROLL_18, STAGE_18, WAY_18, type InvDress } from './w1Arc18.ts';
import { W1_TIP } from './w1Cast.ts';
import { rollTeaches, type RollSpec } from '../../rolling.ts';
import type { ChaseLay } from '../../chase.ts';
import type { Collectible, Enemy, Platform, Vine } from '../../types.ts';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
const cfg = generateAllLevels().find((c) => c.id === STAGE_18 && !c.secret)!;
type Built = {
  platforms: Platform[]; vines: Vine[]; enemies: Enemy[]; collectibles: Collectible[]; checkpoints: Array<{ x: number }>; chase: ChaseLay; rolling: RollSpec[];
  proto: { bushes?: Array<{ x: number; w: number; kind: string }>; hints?: Array<{ x: number; text: string }>; invDress?: InvDress[] };
  gen2: { errors: string[]; sections: Array<{ uid: string; template: string; x0: number; x1: number }> };
};
const memo = new Map<string, Built>();
/** the stage as the game builds it: its listed kit, World 1's finish, then its own (stageGenerator.ts, the listed path) */
function built(seed: number, d: 'normal' | 'easy'): Built {
  const k = `${seed}:${d}`;
  if (!memo.has(k)) {
    const row = listedStage(STAGE_18)!;
    const st = buildGen2Stage({ config: cfg, kit: row.kit(), seed, difficulty: d });
    memo.set(k, row.finish!(w1Finish(st as never), d) as unknown as Built);
  }
  return memo.get(k)!;
}
const SEEDS = [1, 3, 4];
const BOTH = ['normal', 'easy'] as const;
const hintX = (st: Built, line: string) => st.proto.hints!.find((h) => h.text === line)?.x;
const ARC = ['arrival', 'teach', 'first-run', 'rest', 'at-pace', 'rest', 'high-bough', 'rest', 'rhythm', 'still-fork', 'rest', 'last', 'tip', 'exit'];

test("1-8's lines are the story keeper's, word for word (reference/story/lines-1-8.md, KEEPER-18 approved 11-14), and the stage says them", () => {
  const md = fs.readFileSync(path.join(root, 'reference/story/lines-1-8.md'), 'utf8');
  const rows = new Map<string, string>();
  for (const m of md.matchAll(/^\| \d+ \| `?([A-Za-z_0-9.\-]+)`? \|[^|]*\| (.+) \| \d+ \|$/gm)) rows.set(m[1], m[2].trim());
  for (const [k, v] of Object.entries(LINES_18)) assert.equal(v, rows.get(k), `line ${k}`);
  assert.equal(WAY_18, rows.get('way.1-8'));
  assert.equal(MISSION_18, rows.get('MISSION_18'));
  assert.equal(STAGE_PLAN[1][7].desc, MISSION_18, "stagePlan's mission line for 1-8");
  assert.ok(DOT_LINES.some((r) => r[0] === 'way.1-8' && r[4] === WAY_18), 'dotLinesData way.1-8');
  for (const id of ['eng.chase', 'hint.1-8.vine', 'hint.1-8.long']) assert.ok(!DOT_LINES.some((r) => r[0] === id), `the old 1-8 row ${id} is gone`);
  for (const d of BOTH) {
    const said = new Set(built(1, d).proto.hints!.map((h) => h.text));
    for (const v of Object.values(LINES_18)) assert.ok(said.has(v), `${d}: Dot says "${v}"`);
  }
});

test('1-8 never locks its exit (the keeper: the branch behind him is gone): a sprint, no gathers, no sealed line', () => {
  const spec = STAGE_PLAN[1][7] as { type: string; gathers?: string };
  assert.equal(spec.type, 'sprint');
  assert.equal(spec.gathers, undefined);
  assert.equal(sealedLine(1, 'sprint'), null);
});

test('the arc beat for beat on every roll, both settings: arrival, the teach, four stretches with rests, the still fork, the last stretch, the tip, the exit', () => {
  for (const d of BOTH) for (const s of SEEDS) {
    const st = built(s, d);
    assert.deepEqual(st.gen2.sections.map((q) => q.template.replace('w1-18-', '')), ARC, `${d} seed ${s}`);
    assert.deepEqual(st.gen2.errors, [], `${d} seed ${s}: no roll errors`);
  }
});

test("the chase: five stretches (four K and the last), each within Matt's flag span, none with a flag inside, the last the branch's tip", () => {
  for (const d of BOTH) for (const s of SEEDS) {
    const st = built(s, d), L = st.chase.stretches;
    assert.equal(L.length, 5, `${d} seed ${s}: ${L.length} stretches`);
    for (const q of L) {
      assert.ok(q.end - q.start <= chaseCap(), `${d} seed ${s}: a stretch of ${Math.round(q.end - q.start)} px`);
      assert.ok(!st.checkpoints.some((c) => c.x > q.start && c.x < q.end), `${d} seed ${s}: a flag inside ${Math.round(q.start)}`);
    }
    assert.ok(L.at(-1)!.last && L.at(-1)!.tip, `${d} seed ${s}: the last stretch is the tip`);
    const tip = st.vines.filter((v) => v.runner && Math.abs(v.x - (L.at(-1)!.end + W1_TIP.liana.out)) < 2);
    assert.equal(tip.length, 1, `${d} seed ${s}: the runner liana off the tip`);
  }
});

test('every teach line is 800 px or more before what it teaches, with nothing that hurts between (level.md rule 6; the lead\'s Q1 ruling A)', () => {
  for (const d of BOTH) for (const s of SEEDS) {
    const st = built(s, d);
    const teach = st.rolling.filter((h) => rollTeaches(h, st.chase) && h.dropX < st.chase.stretches[0].start);
    const nut = teach.find((h) => h.kind === 'low')!, fruit = teach.find((h) => h.kind === 'high')!;
    assert.ok(nut && fruit, `${d} seed ${s}: a teach nut and a teach fruit before the crack`);
    assert.ok(nut.dropX - hintX(st, LINES_18.nut)! >= 800, `${d} seed ${s}: nut line ${nut.dropX - hintX(st, LINES_18.nut)!} px`);
    assert.ok(fruit.dropX - hintX(st, LINES_18.fruit)! >= 800, `${d} seed ${s}: fruit line`);
    const moss = st.proto.bushes!.find((b) => b.kind === 'moss')!;
    const fx = hintX(st, LINES_18.fork)!;
    assert.ok(moss.x - fx >= 800, `${d} seed ${s}: the fork line ${moss.x - fx} px before the moss`);
    assert.ok(!st.rolling.some((h) => h.dropX > fx && h.dropX < moss.x), `${d} seed ${s}: a nut or fruit between the fork line and the moss`);
    const crack = hintX(st, LINES_18.crack)!;
    assert.ok(Math.abs(crack - st.chase.stretches[0].start) <= 120, `${d} seed ${s}: the crack line at the crack`);
  }
});

test('one threat at a time: drops 1.5 s apart at his run on Normal, 2.5 s on Easy; Easy\'s are every one a bump, Normal\'s only before the crack', () => {
  for (const d of BOTH) for (const s of SEEDS) {
    const st = built(s, d);
    const apart = ROLL_18.apart![d];
    for (let i = 1; i < st.rolling.length; i++) assert.ok(st.rolling[i].dropX - st.rolling[i - 1].dropX >= apart, `${d} seed ${s}: drop ${i}`);
    const crack = st.chase.stretches[0].start;
    for (const h of st.rolling) assert.equal(rollTeaches(h, st.chase), d === 'easy' || h.dropX < crack, `${d} seed ${s}: the ${h.kind} at ${h.dropX}`);
    // (the fruit's arc clears his drawn head; the nut's rattle a hop clears)
    for (const h of st.rolling) assert.ok(h.kind === 'high' ? h.bounce >= 104 : h.bounce <= 24, `${d} seed ${s}: ${h.kind} bounce`);
  }
});

test("Easy is never harder than Normal: its gaps in a stretch 50 px or under, no more nuts or fruit, no creaky limb", () => {
  for (const s of SEEDS) {
    const n = built(s, 'normal'), e = built(s, 'easy');
    assert.deepEqual(easyGapProblems(e.chase, e.platforms, CHASE_LAY.easyGap), [], `seed ${s}`);
    assert.ok(e.rolling.length <= n.rolling.length, `seed ${s}: ${e.rolling.length} vs ${n.rolling.length}`);
    assert.equal(e.platforms.filter((p) => p.creak !== undefined).length, 0, `seed ${s}: Easy's creaky limbs`);
    assert.ok(n.platforms.some((p) => p.creak !== undefined), `seed ${s}: Normal's creaky limb (the last stretch)`);
  }
});

test('the still fork: the moss where the collapse stops after the fourth stretch, one eagle on its post with one pass, on one upright screen', () => {
  for (const d of BOTH) for (const s of SEEDS) {
    const st = built(s, d);
    const k4 = st.chase.stretches[3];
    const moss = st.proto.bushes!.filter((b) => b.kind === 'moss');
    assert.equal(moss.length, 1, `${d} seed ${s}`);
    assert.ok(moss[0].x >= k4.end && moss[0].x <= k4.end + 80, `${d} seed ${s}: moss at ${moss[0].x}, stretch ends ${k4.end}`);
    const e = st.enemies.filter((q) => q.type === 'eagle');
    assert.equal(e.length, 1, `${d} seed ${s}: eagles`);
    assert.equal(e[0].kitPasses, 1);
    assert.ok(e[0].x - moss[0].x <= 420, `${d} seed ${s}: the post ${Math.round(e[0].x - moss[0].x)} px from the moss`);
  }
});

test('the hearts stand on the fork after the second stretch and the fork before the last; the keeper\'s look is laid by inventory id', () => {
  for (const d of BOTH) for (const s of SEEDS) {
    const st = built(s, d), L = st.chase.stretches;
    const hearts = st.collectibles.filter((c) => c.type === 'heart');
    for (const f of HEARTS_18.forks) assert.ok(hearts.some((h) => h.x > L[f - 1].end && h.x < L[f].start), `${d} seed ${s}: a heart on fork ${f}`);
    const dress = st.proto.invDress ?? [];
    for (const h of st.rolling) {
      const want = h.kind === 'low' ? DRESS_18.palm.inv : DRESS_18.trunk.inv;
      assert.ok(dress.some((q) => q.inv === want && Math.abs(q.x - h.dropX) <= 100), `${d} seed ${s}: ${want} at the ${h.kind} at ${h.dropX}`);
    }
  }
});
