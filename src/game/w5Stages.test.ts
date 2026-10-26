import test from 'node:test';
import assert from 'node:assert/strict';
import { buildProtoStage, G, HAND_STAGES, STAGE_SECONDS, stageSeconds } from './protoStage.ts';
import { validateStage } from './levelCheck.ts';
import { reachJump } from './physics.ts';
import { PAST_SHRINE } from './rules.ts';
import { findForStage } from './finds.ts';
import { levelConfig } from './realPlay.ts';
import { ORCHID, orchidAt, orchidFair, TABLE_CARD, type W5Extras } from './w5Kit.ts';
import { W5_HINTS } from './w5Lines.ts';
import { W5_HARVEST_SHARE, W5_ORCHID, type W5Info } from './w5Stages.ts';
import { w5BackdropStem } from './w5Backdrop.ts';
import { W5_FRAMES } from './w5PropsData.ts';
import { stageSpec } from './stagePlan.ts';

const SEEDS = Array.from({ length: 16 }, (_, i) => 1 + i * 37);
type Built = ReturnType<typeof buildProtoStage> & { w5info: W5Info };
const build = (id: '5-1' | '5-2' | '5-3', s: number) => buildProtoStage(levelConfig(id), s, HAND_STAGES[id]) as Built;
const w5 = (st: Built) => st.proto.w5 as W5Extras;
const hinted = (st: Built, old: string) => st.proto.hints.find((h) => h.text === old);

test('5-1, 5-2 and 5-3 are hand-built, and their lengths differ', () => {
  assert.equal(HAND_STAGES['5-1'], '5-1');
  assert.equal(HAND_STAGES['5-2'], '5-2');
  assert.equal(HAND_STAGES['5-3'], '5-3');
  for (const id of ['5-1', '5-2', '5-3']) assert.ok(STAGE_SECONDS[id] >= 150 && STAGE_SECONDS[id] <= 300, id);
  assert.notEqual(stageSeconds('5-1'), stageSeconds('5-2'));
  assert.notEqual(stageSeconds('5-3'), stageSeconds('5-2'));
});

for (const id of ['5-1', '5-2', '5-3'] as const) {
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
      for (const o of x.orchids ?? []) assert.ok(o.x <= lim, `seed ${s}: an orchid past the shrine`);
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

test("5-3: the closing orchids: a harvest from their cups, closing sooner as it goes on, fair, over grass or a soft pit, in the gold light", () => {
  assert.equal(stageSpec(5, 3)?.type, 'harvest');
  assert.equal(stageSpec(5, 3)?.name, 'Closing Orchids');
  // (gold, the other take from 5-2's)
  assert.notEqual(w5BackdropStem('5-3'), w5BackdropStem('5-2'));
  assert.equal(findForStage(5, 3), null, 'no World 5 find is set in 5-3');
  for (const s of SEEDS) {
    const st = build('5-3', s);
    const x = w5(st);
    const inf = st.w5info;
    assert.ok(!x.gentle && x.mood === 'gold' && x.petals);
    const orchids = x.orchids!;
    assert.ok(orchids.length >= 20 && inf.rows.length >= 6, `seed ${s}: ${orchids.length} orchids, ${inf.rows.length} rows`);
    // every orchid: fair (open long enough, never shut for long), a ledge while open or shivering, none while shut; its cup's flowers in it
    let lastOpen = Infinity;
    for (const o of orchids) {
      assert.ok(orchidFair(o) && o.open >= ORCHID.minOpen, `seed ${s}: the orchid at ${o.x}: ${JSON.stringify({ period: o.period, open: o.open })}`);
      const pl = st.platforms.find((p) => p.id === o.platformId)!;
      assert.ok(pl && pl.art === 'orchid' && pl.y === o.y && Math.abs(pl.x + pl.width / 2 - o.x) <= 1, `seed ${s}`);
      assert.ok(orchidAt(o, -o.offset + 0.01).solid && !orchidAt(o, -o.offset + o.open + ORCHID.tell + 0.05).solid);
      for (const id of o.petalIds!) {
        const c = st.collectibles.find((q) => q.id === id)!;
        assert.ok(c.type === 'flower' && Math.abs(c.x - o.x) < o.w / 2 && o.y - c.y === 34, `seed ${s}: a cup flower out of its cup at ${o.x}`);
      }
      // closing earlier as the stage goes on (the lesson is the longest open, the last the shortest)
      assert.ok(o.open <= lastOpen + 1e-9 || o === orchids[0], `seed ${s}: the orchid at ${o.x} open ${o.open} s after one open ${lastOpen} s`);
      lastOpen = o.open;
      // over the grass (one hop up) or a soft pit (a mossy floor): a miss is a drop, never a fall
      const ground = o.stem!;
      assert.ok(st.platforms.some((p) => p.y === ground && p.x <= o.x - o.w / 2 && p.x + p.width >= o.x + o.w / 2), `seed ${s}: nothing under the orchid at ${o.x}`);
    }
    assert.equal(orchids[0].open, W5_ORCHID.openFirst);
    assert.ok(orchids[orchids.length - 1].open <= W5_ORCHID.openFirst - 0.7, `seed ${s}: the last orchid open ${orchids[orchids.length - 1].open} s`);
    // each row: a plain hop from the bank, bloom to bloom, and off the last; they close one after another down the row
    for (const row of inf.rows) {
      const os = row.orchids.map((k) => inf.orchids[k]);
      const hops = [os[0].x0 - row.edge, ...os.slice(1).map((o, i) => o.x0 - os[i].x1), row.far - os[os.length - 1].x1];
      for (const h of hops) assert.ok(h > 40 && h <= reachJump(0, false) * 0.7, `seed ${s}: a ${Math.round(h)} px hop in the row at ${row.edge}`);
      assert.ok(st.platforms.some((p) => p.y > G && p.x <= row.edge && p.x + p.width >= row.far), `seed ${s}: no soft floor under the row at ${row.edge}`);
      const ks = row.orchids.map((k) => orchids[k]);
      for (let i = 1; i < ks.length; i++) {
        const d = ((ks[i - 1].offset - ks[i].offset) % ks[i].period + ks[i].period) % ks[i].period;
        assert.ok(Math.abs(d - W5_ORCHID.lag) < 0.02, `seed ${s}: the row at ${row.edge} does not close in turn`);
      }
    }
    // the quota: a share of the flowers, more than the path alone holds (the cups are what the stage is for), and plenty to spare
    const flowers = st.collectibles.filter((c) => c.type === 'flower');
    const cups = new Set(inf.cupFlowers);
    assert.equal(st.config.targetCount, Math.round(flowers.length * W5_HARVEST_SHARE));
    assert.ok(flowers.filter((c) => !cups.has(c.id)).length < st.config.targetCount, `seed ${s}: the path alone meets the quota`);
    assert.ok(flowers.length >= st.config.targetCount * 1.5, `seed ${s}`);
    // a spider or two, awake (a reminder, not a lesson), a cake now and then (each alone), the guests who sat, and a soft chair
    const spiders = st.enemies.filter((e) => e.type === 'spider');
    assert.ok(spiders.length >= 3 && x.spiders!.every((sp) => !sp.doze), `seed ${s}`);
    const cakes = x.cakes!.slice().sort((a, b) => a.x - b.x);
    assert.ok(cakes.length >= 2 && cakes.length <= 6, `seed ${s}: ${cakes.length} cakes`);
    for (let i = 1; i < cakes.length; i++) assert.ok(cakes[i].x - cakes[i - 1].x > 1000, `seed ${s}: two cakes together`);
    assert.ok(x.chairs!.filter((c) => c.wrapped).length >= 2 && x.chairs!.some((c) => !c.wrapped), `seed ${s}`);
    assert.equal((x.threads ?? []).length + (x.butlers ?? []).length, 0);
    // the painted World 5 props among the bushes: orchids, sprouts, mossy roots
    assert.ok(x.decor!.filter((d) => d.n in W5_FRAMES).length >= 5, `seed ${s}`);
    // the stage's lines
    for (const h of [W5_HINTS.s53start, W5_HINTS.s53sooner, W5_HINTS.s53end]) assert.ok(hinted(st, h.old), `seed ${s}: ${h.text}`);
    assert.ok(hinted(st, W5_HINTS.s53start.old)!.x > orchids[0].x, 'the story\'s line after he has seen the first one close');
  }
});
