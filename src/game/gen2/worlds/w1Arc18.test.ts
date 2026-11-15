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
import { PAGES } from '../../movesJournal.ts';
import { addFinds } from '../../stageGenerator.ts';
import { w1Finish } from './w1.ts';
import { HEARTS_18, LINES_18, MISSION_18, PALMS_18, PALM_APART_18, ROLL_18, TRUNKS_18, STAGE_18, WAY_18, type InvDress } from './w1Arc18.ts';
import { loadInventory } from '../../art/inventory.ts';
import { invDressSize } from '../../art/invDress.ts';
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
  // (a row the keeper rewrote carries her dated note after the line, "(9:50 PM ET 11-14: was ...)": the line is what stands before it)
  for (const m of md.matchAll(/^\| \d+ \| `?([A-Za-z_0-9.\-]+)`? \|[^|]*\| (.+) \| \d+ \|$/gm)) rows.set(m[1], m[2].replace(/\s*\(\d{1,2}:\d{2} [AP]M ET [^)]*:.*\)$/, '').trim());
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

test("the moves journal's collapsing-branch page is the keeper's (lines-1-8.md 11-14 9:50 PM ET), and opens on 1-8's crack line", () => {
  const md = fs.readFileSync(path.join(root, 'reference/story/lines-1-8.md'), 'utf8');
  const cell = (field: string) => md.match(new RegExp(`^\\| ${field.replace(/[()/]/g, '\\$&')} \\|[^|]*\\| (.+) \\|$`, 'm'))?.[1].trim();
  const page = PAGES.find((p) => p.id === 'collapse')!;
  assert.equal(page.intro, cell('intro'));
  const [how, what] = cell('lines (how / what)')!.split(' / ');
  assert.deepEqual(page.lines.screen.map((l) => [l.how, l.what]), [[how, what]]);
  assert.equal(cell('riddle'), 'KEEP');
  assert.equal(page.riddle, 'Do not look back. Just run!');
  assert.deepEqual(page.open.tip, [['1-8', `tip:${LINES_18.crack}`]], 'it opens on the crack line');
  assert.ok(!JSON.stringify(page).includes('goes on and on'), 'the old line is gone');
});

test("each of Dot's 1-8 lines is said only before the next crack after it, so no run from a later flag hears the fork line past the tip (ENG-LOOK 11-14)", () => {
  for (const seed of SEEDS) for (const d of BOTH) {
    const st = built(seed, d), lay = (st as unknown as { chase: ChaseLay }).chase;
    const hints = st.proto.hints as Array<{ x: number; text: string; beforeX?: number }>;
    for (const [k, v] of Object.entries(LINES_18)) {
      const h = hints.find((q) => q.text === v)!;
      const next = lay.stretches.find((s) => s.start > h.x);
      if (!next) { assert.ok(k === 'mark', `${d} seed ${seed}: only the mark is past the last crack (${k})`); continue; }
      assert.equal(h.beforeX, next.start, `${d} seed ${seed}: "${k}" expires at the next crack`);
    }
    const tip = lay.stretches[lay.stretches.length - 1];
    const fork = hints.find((q) => q.text === LINES_18.fork)!;
    assert.ok(fork.beforeX! <= tip.start, `${d} seed ${seed}: the fork line is gone by the last stretch`);
  }
});

test("World 1's book (finds.ts w1_book) stands on 1-8's first living fork, on a root bank past a knot, before the second stretch, both settings", () => {
  for (const seed of SEEDS) for (const d of BOTH) {
    const st = built(seed, d) as unknown as Parameters<typeof addFinds>[0] & { proto: { findSpot?: { x: number; b: number } }; chase: ChaseLay; gen2: { sections: Array<{ uid: string; template: string; x0: number; x1: number }> }; platforms: Platform[] };
    const spot = st.proto.findSpot;
    assert.ok(spot, `${d} seed ${seed}: the rest brick marks the find's spot`);
    const first = st.gen2.sections.find((q) => q.template === 'w1-18-rest')!;
    assert.ok(spot.x > first.x0 && spot.x < first.x1, `${d} seed ${seed}: on the first fork`);
    assert.ok(spot.x < st.chase.stretches[1].start, `${d} seed ${seed}: before the second stretch`);
    assert.ok(st.platforms.some((p) => p.type === 'solid' && Math.abs(p.y - spot.b) <= 1 && p.x <= spot.x && p.x + p.width >= spot.x), `${d} seed ${seed}: on a bank's top`);
    const was = st.collectibles.length;
    addFinds(st);
    const book = st.collectibles.slice(was).filter((c) => c.type === 'find');
    assert.deepEqual(book.map((c) => [c.findId, c.x, c.hidden]), [['w1_book', spot.x, true]], `${d} seed ${seed}: the book, hidden, at the spot`);
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
    const teach = st.rolling.filter((h) => rollTeaches(h, st.chase, d === 'easy') && h.dropX < st.chase.stretches[0].start);
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
    for (const h of st.rolling) assert.equal(rollTeaches(h, st.chase, d === 'easy'), d === 'easy' || h.dropX < crack, `${d} seed ${s}: the ${h.kind} at ${h.dropX}`);
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

test('the hearts stand on the fork after the second stretch and the fork before the last; every fruit has its trunk by inventory id, never the same trunk picture within PALM_APART_18', () => {
  for (const d of BOTH) for (const s of SEEDS) {
    const st = built(s, d), L = st.chase.stretches;
    const hearts = st.collectibles.filter((c) => c.type === 'heart');
    for (const f of HEARTS_18.forks) assert.ok(hearts.some((h) => h.x > L[f - 1].end && h.x < L[f].start), `${d} seed ${s}: a heart on fork ${f}`);
    const dress = st.proto.invDress ?? [];
    const trunks = dress.filter((q) => TRUNKS_18.some((t) => t.inv === q.inv));
    for (const h of st.rolling.filter((q) => q.kind !== 'low')) {
      assert.equal(trunks.filter((q) => Math.abs(q.x - h.dropX) <= 100).length, 1, `${d} seed ${s}: one trunk at the ${h.kind} at ${h.dropX}`);
    }
    for (const a of trunks) for (const b of trunks) {
      if (a !== b && a.inv === b.inv) assert.ok(Math.abs(a.x - b.x) >= PALM_APART_18 - 200, `${d} seed ${s}: ${a.inv} twice ${Math.round(Math.abs(a.x - b.x))} px apart`);
    }
  }
});

test('the palms (ART-18, Matt 11-15): a painted palm at every nut\'s drop with its nut cluster over the drop (the inventory\'s size), never the same palm within PALM_APART_18, back palms drawn first', async () => {
  const inv = await loadInventory(1);
  const ids = new Set<string>(PALMS_18.map((p) => p.inv));
  for (const p of PALMS_18) {
    const r = inv.byId(p.inv);
    assert.ok(r, `${p.inv} is a World 1 inventory row`);
    const sz = invDressSize(r!, inv.pokeyUnits)!;
    // (the row's place, from the cluster's fractions and the drawn size: x middle = drop + dx, foot = ground + y)
    const cx = p.dx - sz.w / 2 + p.nut[0] * sz.w, cy = p.y - sz.h + p.nut[1] * sz.h;
    assert.ok(Math.abs(cx) <= 12 && Math.abs(cy + p.up) <= 12, `${p.inv}: its nut cluster at (${cx.toFixed(0)}, ${cy.toFixed(0)}) from the drop, wanted (0, ${-p.up})`);
    assert.ok(p.y > 0 && p.y - sz.h * 0.16 > 40, `${p.inv}: its foot (and its fade) under the branch's top, never a stub over it (foot ${p.y} px under)`);
  }
  let seen = 0;
  for (const d of BOTH) for (const s of SEEDS) {
    const st = built(s, d);
    const dress = st.proto.invDress ?? [];
    const palms = dress.filter((q) => ids.has(q.inv));
    for (const h of st.rolling.filter((q) => q.kind === 'low')) {
      const at = palms.filter((q) => { const p = PALMS_18.find((v) => v.inv === q.inv)!; return Math.abs(q.x - p.dx - h.dropX) <= 1; });
      assert.equal(at.length, 1, `${d} seed ${s}: one palm at the nut at ${h.dropX}`);
    }
    for (const a of palms) for (const b of palms) {
      if (a !== b && a.inv === b.inv) assert.ok(Math.abs(a.x - b.x) >= PALM_APART_18 - 100, `${d} seed ${s}: ${a.inv} twice ${Math.round(Math.abs(a.x - b.x))} px apart`);
    }
    if (palms.length >= 3) assert.ok(new Set(palms.map((q) => q.inv)).size >= 3, `${d} seed ${s}: at least three different palms`);
    const back = [...PALMS_18, ...TRUNKS_18].filter((p) => p.back).map((p) => p.inv as string);
    const lastBack = dress.map((q) => back.includes(q.inv)).lastIndexOf(true), firstNear = dress.findIndex((q) => !back.includes(q.inv));
    if (lastBack >= 0 && firstNear >= 0) assert.ok(lastBack < firstNear, `${d} seed ${s}: the back palms are drawn before every other dressing row`);
    seen += palms.length;
  }
  assert.ok(seen > 0, 'palms laid');
});
