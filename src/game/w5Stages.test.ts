import test from 'node:test';
import assert from 'node:assert/strict';
import { buildProtoStage, G, HAND_STAGES, STAGE_SECONDS, stageSeconds } from './protoStage.ts';
import { validateStage } from './levelCheck.ts';
import { reachJump } from './physics.ts';
import { PAST_SHRINE } from './rules.ts';
import { findForStage } from './finds.ts';
import { levelConfig } from './realPlay.ts';
import { TABLE_CARD, type W5Extras } from './w5Kit.ts';
import { W5_HINTS } from './w5Lines.ts';
import type { W5Info } from './w5Stages.ts';

const SEEDS = Array.from({ length: 16 }, (_, i) => 1 + i * 37);
type Built = ReturnType<typeof buildProtoStage> & { w5info: W5Info };
const build = (id: '5-1' | '5-2', s: number) => buildProtoStage(levelConfig(id), s, HAND_STAGES[id]) as Built;
const w5 = (st: Built) => st.proto.w5 as W5Extras;
const hinted = (st: Built, old: string) => st.proto.hints.find((h) => h.text === old);

test('5-1 and 5-2 are hand-built (behind the New stages switch, as World 4), and their lengths differ', () => {
  assert.equal(HAND_STAGES['5-1'], '5-1');
  assert.equal(HAND_STAGES['5-2'], '5-2');
  for (const id of ['5-1', '5-2']) assert.ok(STAGE_SECONDS[id] >= 150 && STAGE_SECONDS[id] <= 300, id);
  assert.notEqual(stageSeconds('5-1'), stageSeconds('5-2'));
});

for (const id of ['5-1', '5-2'] as const) {
  test(`${id}: every roll can be finished, has one exit, runs its full length, needs no pickup moved, and keeps nothing past the shrine`, () => {
    for (const s of SEEDS) {
      const st = build(id, s);
      const res = validateStage(st);
      assert.ok(res.ok, `seed ${s}: ${res.errors.join('; ')}`);
      assert.equal(st.collectibles.filter((c) => c.type === 'exit_totem').length, 1, `seed ${s}`);
      assert.ok(st.meta!.timing!.layoutSeconds >= stageSeconds(id), `seed ${s}: ${Math.round(st.meta!.timing!.layoutSeconds)} s`);
      assert.ok(stageSeconds(id) >= 120, 'at least two minutes');
      assert.ok((st.proto.movedPickups ?? 0) <= 2, `seed ${s}: ${st.proto.movedPickups} pickups moved`);
      const lim = st.exitTotemX + PAST_SHRINE;
      for (const c of st.collectibles) assert.ok(c.x <= lim, `seed ${s}: ${c.type} past the shrine`);
      const x = w5(st);
      for (const c of x.cakes ?? []) assert.ok(c.x <= lim, `seed ${s}: a cake past the shrine`);
      for (const c of x.chairs ?? []) assert.ok(c.x <= lim, `seed ${s}: a chair past the shrine`);
      for (const t of x.threads ?? []) assert.ok(t.x0 <= lim, `seed ${s}: a thread past the shrine`);
      for (const b of x.butlers ?? []) assert.ok(b.x <= lim, `seed ${s}: a butler past the shrine`);
      for (const e of st.enemies) assert.ok(e.patrolMaxX <= lim, `seed ${s}: a spider past the shrine`);
    }
  });

  test(`${id}: flags all along (one at least every 45 s for a quick player), hearts on the way, and the gold light`, () => {
    for (const s of SEEDS) {
      const st = build(id, s);
      const f = st.w5info.flagSeconds;
      for (let i = 1; i < f.length; i++) assert.ok(f[i] - f[i - 1] <= 45, `seed ${s}: ${Math.round(f[i] - f[i - 1])} s between flags ${i - 1} and ${i}`);
      assert.ok((st.checkpoints ?? []).length >= 6, `seed ${s}: ${(st.checkpoints ?? []).length} flags`);
      assert.ok(st.collectibles.filter((c) => c.type === 'heart').length >= 3, `seed ${s}`);
      assert.equal(w5(st).mood, 'gold');
    }
  });

  test(`${id}: every jump is makeable with room to spare, every drop is a soft pit, and the high roads have a step under them`, () => {
    for (const s of SEEDS) {
      const st = build(id, s);
      for (const g of st.w5info.gaps) {
        assert.ok(g.far - g.edge <= reachJump(0, g.double) * (g.double ? 0.82 : 0.95), `seed ${s}: a ${g.far - g.edge} px gap`);
        // the floor of the pit: soft, with a step back up
        assert.ok(st.platforms.some((p) => p.y > G && p.x <= g.edge && p.x + p.width >= g.far), `seed ${s}: no floor under the gap at ${g.edge}`);
      }
      for (const h of st.w5info.highRoads) {
        const step = st.platforms.find((p) => p.id === h.step)!;
        const road = st.platforms.find((p) => p.id === h.road)!;
        assert.ok(G - step.y <= 95 && step.y - road.y <= 95, `seed ${s}: the road is more than a jump above its step`);
        // ground right under the whole road: a slip off it is a hop down, never a fall
        assert.ok(st.platforms.some((p) => p.y === G && p.x <= road.x && p.x + p.width >= road.x + road.width), `seed ${s}: open air under the high road`);
      }
    }
  });
}

test("5-1: the first tree's carving, the table set for two with its card and its soft chairs, gently taught, and the jumping spiders", () => {
  for (const s of SEEDS) {
    const st = build('5-1', s);
    const x = w5(st);
    assert.equal(x.gentle, true, 'the stillness is taught gently in 5-1');
    const carving = x.carvings![0];
    assert.deepEqual(carving.lines, ['POKEY.', 'DON\'T', 'SIT.', 'M.']);
    assert.ok(carving.x <= 760 && carving.trunk && !x.carvings!.slice(1).length, 'it opens on the first tree');
    assert.ok(hinted(st, W5_HINTS.s51carving.old), `seed ${s}`);
    const table = x.tables![0];
    assert.equal(table.card, TABLE_CARD);
    assert.equal(TABLE_CARD, 'Do sit. The pot is warm. It is always warm.');
    const beside = x.chairs!.filter((c) => !c.wrapped && Math.abs(c.x - table.x) < 200);
    assert.equal(beside.length, 2, 'two soft chairs at the table');
    assert.ok(hinted(st, W5_HINTS.s51table.old)!.x < table.x - 120 - 480, 'the table is remarked on before its chairs tug');
    // the guests who sat, and the jumping spider is the enemy (awake: it sees him and crouches)
    assert.ok(x.chairs!.filter((c) => c.wrapped).length >= 4, `seed ${s}`);
    assert.ok(st.enemies.length >= 5 && st.enemies.every((e) => e.type === 'spider'), `seed ${s}`);
    assert.ok(x.spiders!.every((sp) => !sp.doze), 'no sleepers before the threads are taught (5-2)');
    // 5-2's pieces come in 5-2, not before
    assert.equal((x.cakes ?? []).length + (x.threads ?? []).length + (x.butlers ?? []).length, 0);
    assert.equal(findForStage(5, 1), null);
    assert.equal(x.petals, true);
  }
});

test("5-2: Dot's rules, the threads and their sleeping spiders, the cakes, the Butler, the still-chair line, and Pell's note on a pink bell", () => {
  for (const s of SEEDS) {
    const st = build('5-2', s);
    const x = w5(st);
    assert.ok(!x.gentle);
    const rules = hinted(st, W5_HINTS.s52rules.old)!;
    assert.ok(rules.x < 300, 'the rules first');
    assert.ok(hinted(st, W5_HINTS.s52chair.old), 'You\'d be a very still chair');
    assert.ok((x.threads ?? []).length >= 6, `seed ${s}: ${(x.threads ?? []).length} threads`);
    const sleepers = (x.spiders ?? []).filter((sp) => sp.doze);
    assert.ok(sleepers.length >= 5, `seed ${s}`);
    // every sleeper lies within the hum of a thread before it (that is how it wakes), but the first: it lies on its own, to be hopped
    for (const sp of sleepers.slice(1)) {
      const e = st.enemies.find((q) => q.id === sp.id)!;
      assert.ok(x.threads!.some((t) => t.x1 < e.x && e.x - t.x0 < 680), `seed ${s}: spider ${sp.id} has no thread before it`);
    }
    assert.ok((x.cakes ?? []).length >= 6, `seed ${s}`);
    for (const c of x.cakes!) assert.ok(st.platforms.some((p) => p.y === c.y + 34 && p.x <= c.x && p.x + p.width >= c.x), `seed ${s}: a cake over nothing`);
    assert.ok((x.butlers ?? []).length >= 2, `seed ${s}`);
    for (const b of x.butlers!) assert.equal(b.dir, -1, 'he faces the way Pokey comes');
    // the first cake, thread and Butler come well after the start, so Dot's line for each comes first
    assert.ok(x.threads![0].x0 > 1500 && x.cakes![0].x > 1500 && x.butlers![0].x > 1500);
    assert.ok(x.chairs!.some((c) => !c.wrapped) && x.chairs!.some((c) => c.wrapped));
    const note = st.collectibles.find((c) => c.type === 'find');
    assert.ok(note && note.findId === 'w5_note' && note.hidden === false, `seed ${s}: Pell's blanket note in plain sight`);
    assert.equal(findForStage(5, 2)?.id, 'w5_note');
  }
});
