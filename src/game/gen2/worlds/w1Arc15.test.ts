/**
 * 1-5 Where She Walked as designed (reference/design/1-5.md; packet B15): the arc beat for beat on every roll, its own pool, the keeper's
 * lines verbatim and taught in time, every fall from the high road onto the low road in view and never onto an animal, no ceiling over a
 * hop, the quiet line, the first snake asleep, Easy never harder. Each held by a planted fault (reference/qa-reports/B15/REPORT.md).
 *   npx tsx --test src/game/gen2/worlds/w1Arc15.test.ts
 */
import '../../headlessDom.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildGen2Stage, stagePool } from '../pipeline.ts';
import { isCreak } from '../creak.ts';
import { BRIEF_15, HELD_15, kitLib15, LINES_15, MISSION_15, SECTIONS_15, STAGE_15 } from './w1Arc15.ts';
import { generateAllLevels } from '../../worldsData.ts';
import { STAGE_PLAN } from '../../stagePlan.ts';
import { TRAP } from '../../dropTrap.ts';
import type { Platform } from '../../types.ts';
import { engineGuideLine } from '../../dotLines.ts';
import { helpAllows } from '../../dotGuideHelp.ts';

type Any = any; // eslint-disable-line @typescript-eslint/no-explicit-any
const SEEDS = [1, 2, 3, 4, 5, 6, 7, 8];
const cfg = () => generateAllLevels().find((c) => c.id === STAGE_15 && !c.secret)! as Any;
const cache = new Map<string, Any>();
const built = (seed: number, d: 'normal' | 'easy'): Any => {
  const k = `${seed}:${d}`;
  if (!cache.has(k)) cache.set(k, buildGen2Stage({ config: cfg(), kit: kitLib15(), seed, difficulty: d }));
  return cache.get(k);
};
const ARC = ['arrival', 'through-or-over', 'creak-lesson', 'rest', 'her-road', 'rest', 'blocked', 'rest', 'big-sign', 'rest', 'stone', 'rest', 'weave', 'freshest-mark'];

test("1-5's pool is its own: its beats, its arrival, its rests and its exit, each marked its own; no other stage's section", () => {
  const M = kitLib15().manifest;
  assert.deepEqual(stagePool(M, STAGE_15).map((t) => t.id).sort(), SECTIONS_15.map((t) => t.id).sort());
  assert.ok(SECTIONS_15.every((t) => t.own && t.feel?.length === 1 && t.feel[0] === STAGE_15));
  assert.deepEqual(BRIEF_15.cast, ['snake']);
});

test('the arc beat for beat, the same beats in the same order on every roll, both settings, every roll clean', () => {
  for (const d of ['normal', 'easy'] as const) for (const seed of SEEDS) {
    const st = built(seed, d);
    assert.deepEqual(st.gen2.errors ?? [], [], `seed ${seed} ${d}`);
    const beats = st.gen2.sections.map((s: Any) => s.template.replace('w1-15-', '').replace(/^rest-.*/, 'rest'));
    assert.deepEqual(beats, ARC, `seed ${seed} ${d}`);
  }
});

test("the keeper's lines verbatim (approved by Matt 11-12 10:20 PM ET), the mission held equal to the stage plan", () => {
  assert.deepEqual({ ...LINES_15 }, {
    creak: 'Creaky limbs drop you, but only down to the roots!',
    sealed: "We missed some of her marks. They're back there!",
    last: "She's making them last.",
  });
  assert.deepEqual({ ...HELD_15 }, { sign: "Squirrels painted what's each way. Your pick!", joke: 'THIS WAY. THAT WAY. Thank you, squirrels.' });
  assert.equal(MISSION_15, 'She marked the way they took her. Follow her marks.');
  assert.equal(STAGE_PLAN[1][4].desc, MISSION_15);
  assert.equal(STAGE_PLAN[1][4].type, 'relic_hunt');
});

test("Dot's creaky line is a TEACH line said 800 px and more before the first limb (3 s at a walk), nothing that hurts between; every line of hers here is a teach line", () => {
  for (const d of ['normal', 'easy'] as const) for (const seed of SEEDS) {
    const st = built(seed, d);
    const hint = st.proto.hints.find((h: Any) => h.text === LINES_15.creak);
    assert.ok(hint?.teach, `seed ${seed} ${d}: the creaky line is laid as a teach line`);
    const first = st.platforms.filter(isCreak).sort((a: Platform, b: Platform) => a.x - b.x)[0];
    assert.ok(first.x - hint.x >= 800 && first.x - hint.x <= 1100, `seed ${seed} ${d}: her line is ${Math.round(first.x - hint.x)} px before the first limb`);
    assert.equal(st.enemies.filter((e: Any) => e.x < first.x).length, 0, `seed ${seed} ${d}: an animal before the first limb`);
    for (const k of ['last'] as const) assert.ok(st.proto.hints.some((h: Any) => h.text === LINES_15[k] && h.teach), `seed ${seed} ${d}: "${LINES_15[k]}"`);
  }
});

test("D50: every keeper's line here is SAID on Normal's default Tips and Easy's default Help, as the engine hands it to Dot (a teach line)", () => {
  for (const k of ['creak', 'last'] as const) {
    const l = engineGuideLine(LINES_15[k], STAGE_15, { dot: true, teach: true });
    assert.ok(l && l.stageTeach, `"${LINES_15[k]}" is no stage teach line (${l?.kind})`);
    assert.equal(helpAllows(l, 'reminders', new Set()), true, `"${LINES_15[k]}" is hidden on Tips, Normal's default`);
    assert.equal(helpAllows(l, 'teach', new Set()), true, `"${LINES_15[k]}" is hidden on Help, Easy's default`);
  }
});

/** the solid platform right under x, below y (the highest top under it), or undefined */
const under = (st: Any, x: number, y: number, not: Platform): Platform | undefined =>
  st.platforms.filter((q: Platform) => q !== not && q.type !== 'fragile' && q.y > y + 10 && x >= q.x && x <= q.x + q.width).sort((a: Platform, b: Platform) => a.y - b.y)[0];

test('a fall from the high road lands on the low road in view (D46): under every creaky limb, sound ground 120-230 px down, no animal on it and no pit', () => {
  for (const d of ['normal', 'easy'] as const) for (const seed of SEEDS) {
    const st = built(seed, d);
    for (const L of st.platforms.filter(isCreak) as Platform[]) {
      for (const x of [L.x + 8, L.x + L.width / 2, L.x + L.width - 8]) {
        const g = under(st, x, L.y, L);
        assert.ok(g, `seed ${seed} ${d}: nothing under the limb at x ${Math.round(x)}`);
        assert.ok(g.y - L.y >= 120 && g.y - L.y <= 230, `seed ${seed} ${d}: the limb at x ${Math.round(L.x)} is ${Math.round(g.y - L.y)} px over its landing`);
      }
      const on = st.enemies.find((e: Any) => Math.abs(e.y + 11 - (under(st, L.x + L.width / 2, L.y, L)?.y ?? 0)) < 40 && e.patrolMinX < L.x + L.width && e.patrolMaxX > L.x);
      assert.ok(!on, `seed ${seed} ${d}: the limb at x ${Math.round(L.x)} hangs over a snake's patch (${on?.patrolMinX}-${on?.patrolMaxX})`);
    }
  }
});

test('no hop under a deck: the low road under every piece of the high road is flat (his jump would meet its underside, D46)', () => {
  for (const d of ['normal', 'easy'] as const) for (const seed of SEEDS.slice(0, 4)) {
    const st = built(seed, d);
    const decks = st.platforms.filter((p: Platform) => p.height <= 26 && (isCreak(p) || p.style === 'branch' || p.style === 'log'));
    for (const D of decks) {
      const g = under(st, D.x + D.width / 2, D.y, D);
      if (!g || g.y - D.y > 230) continue;
      for (let x = D.x + 4; x <= D.x + D.width - 4; x += 12) {
        const q = under(st, x, D.y, D);
        assert.ok(!q || q.y >= g.y - 2, `seed ${seed} ${d}: a step up under the deck at x ${Math.round(x)} (${Math.round(g.y - (q?.y ?? 0))} px)`);
      }
    }
  }
});

test('the first snake of the stage sleeps under a stone with its tendril beside it; the twist\'s limb comes down beside the den\'s snake, its whole patch within the chase', () => {
  for (const d of ['normal', 'easy'] as const) for (const seed of SEEDS) {
    const st = built(seed, d);
    const first = [...st.enemies].sort((a: Any, b: Any) => a.x - b.x)[0];
    assert.ok(first.asleep, `seed ${seed} ${d}: the first snake is awake`);
    const traps = st.proto.cast.traps;
    assert.deepEqual(traps.map((t: Any) => t.kind).sort(), ['limb', 'tendril'], `seed ${seed} ${d}`);
    const limb = traps.find((t: Any) => t.kind === 'limb');
    const den = st.enemies.find((e: Any) => Math.abs(e.patrolMinX - limb.loadX) < 250);
    assert.ok(den, `seed ${seed} ${d}: no snake at the den`);
    assert.ok(Math.abs(den.patrolMaxX - limb.loadX) <= TRAP.scare && Math.abs(den.patrolMinX - limb.loadX) <= TRAP.scare, `seed ${seed} ${d}: the den's patch ${den.patrolMinX}-${den.patrolMaxX} is not all within ${TRAP.scare} px of ${limb.loadX}`);
  }
});

test('the quiet line holds on the game\'s own roll: nowhere on 1-5 are 4 s or more with nothing to do (Normal, seeds 1-4)', async () => {
  const { quietOf } = await import('../../../../tools/engine/listRules.ts');
  const { QUIET_MAX } = await import('../seedList.ts');
  for (const seed of SEEDS.slice(0, 4)) {
    const st = built(seed, 'normal');
    const q = quietOf(cfg(), st);
    assert.ok(q.quiet <= QUIET_MAX, `seed ${seed}: ${q.quiet} s with nothing to do at x ${Math.round(q.x)}`);
  }
});

test('Easy is never harder than Normal: no more snakes, no more awake ones, the same lesson and traps, and her marks met on shared ground', () => {
  for (const seed of SEEDS) {
    const n = built(seed, 'normal'), e = built(seed, 'easy');
    assert.ok(e.enemies.length <= n.enemies.length, `seed ${seed}: Easy ${e.enemies.length} snakes, Normal ${n.enemies.length}`);
    assert.ok(e.enemies.filter((q: Any) => !q.asleep).length <= n.enemies.filter((q: Any) => !q.asleep).length, `seed ${seed}: awake`);
    assert.equal(e.proto.cast.traps.length, n.proto.cast.traps.length, `seed ${seed}: traps`);
    // (Easy's limbs are no shorter: every Easy limb's width is at least the narrowest Normal one's)
    const w = (st: Any) => st.platforms.filter(isCreak).map((p: Platform) => p.width);
    assert.ok(Math.min(...w(e)) >= Math.min(...w(n)), `seed ${seed}: Easy limbs ${Math.min(...w(e))}, Normal ${Math.min(...w(n))}`);
  }
});
