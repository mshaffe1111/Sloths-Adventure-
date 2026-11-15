/**
 * A pond of sinking pads as a gen2 section (ENG-22's EXACT NEXT STEP 3, written by BUILD-22, 11-15; modelled on riverSection.test.ts):
 * place `pads` lays the far bank the row's width past `after`, level, its water a river gap (a splash-back on a safe row, else deep), and
 * asks the crossing as a ride; layStage lays the still water, the pads and stones and their clocks from the same row (rideLay layPads)
 * BEFORE the check, so padFaults judges what the game plays; every padFaults rule is planted on a built stage and names itself; in the
 * real engine (RealPlay) a weight pad sinks under him and a beat row breathes in step, weight or not. World-neutral (level.md rules
 * 21-22): proven on World 2's ground and World 6's.
 */
import '../headlessDom.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildGen2Stage, layLocal, planBudget, rngFor } from './pipeline.ts';
import { PAD_FAIR, PAD_LAY, PAD_SIZES, padFaults, padRowWidth, type PadRow } from './rideLay.ts';
import { cfg as toyCfg, kit as toyKit, meadow } from './toyWorld.ts';
import { W2_GROUND, W2_PADS } from './worlds/w2.ts';
import { W6_GROUND } from './worlds/w6.ts';
import { withTestStage } from './listed.ts';
import { keptFoes } from './pipeline.ts';
import { packPlan, plantSeedList } from './seedList.ts';
import { w2Finish } from './worlds/w2.ts';
import { RealPlay, withFixtureConfig } from '../realPlay.ts';
import { padShows } from '../pieces/padPiece.ts';
import { beatOf } from '../clock.ts';
import type { Gen2Stage, SectionPiece, SectionTemplate, WorldKit, WorldManifest } from './types.ts';
import type { Difficulty } from '../difficulty.ts';
import type { LevelConfig, Platform } from '../types.ts';

// ───────────────────────── a toy pond section on any world's ground ─────────────────────────
const near: SectionPiece = { key: 'near', shape: 'bank', w: [340, 340], place: { kind: 'start' }, main: true };
const pond = (row: string, id = 'toy-pond'): SectionTemplate => ({
  id, name: 'a pond', archetypes: 'any', phases: ['ki', 'sho', 'ten', 'ketsu'], difficulty: 2, maxPerStage: 1,
  pieces: [near, { key: 'far', shape: 'bank', w: [420, 420], place: { kind: 'pads', after: 'near', row }, main: true, landing: true }],
  entry: { piece: 'near', kind: 'ground' }, exit: { piece: 'far', kind: 'ground' }, exitDy: 0, sockets: [], mirrorable: false,
});
const kitOn = (ground: { y: number; bankH: number }, sections: SectionTemplate[], pads: WorldManifest['pads'] = W2_PADS): WorldKit => ({
  ...toyKit,
  manifest: { ...toyKit.manifest, world: 2, ground: { ...toyKit.manifest.ground, y: ground.y, bankH: ground.bankH }, corridor: { top: ground.y - 260, bottom: ground.y + 60, soft: 80 }, pads, sections: [{ ...meadow, phases: ['start', 'rest', 'ki', 'sho', 'ten', 'ketsu', 'goal'], mirrorable: false, sockets: meadow.sockets.filter((k) => k.role !== 'prop') }, ...sections], creatures: [], props: [], pairs: [], tips: {} },
});
const budgetOf = (k: WorldKit, s: Difficulty = 'normal') => planBudget(toyCfg('5-3', 'sprint'), k.manifest, s);
const ROWS = Object.keys(W2_PADS) as Array<keyof typeof W2_PADS>;

// ───────────────────────── the place rule ─────────────────────────
for (const [name, ground] of [['World 2', W2_GROUND], ['World 6', W6_GROUND]] as const) {
  for (const s of ['normal', 'easy'] as const) {
    test(`${name} ground, ${s}: place 'pads' lays the far bank the row's width past 'after', level; the water is a river gap; the crossing is a ride`, () => {
      const k = kitOn(ground, []);
      for (const row of ROWS) {
        const L = layLocal(pond(row), budgetOf(k, s), rngFor(3, 1), false, { pads: k.manifest.pads });
        const a = L.pieces.find((p) => p.key === 'near')!, b = L.pieces.find((p) => p.key === 'far')!;
        assert.equal(b.x - (a.x + a.w), padRowWidth(W2_PADS[row]), `${row}: the water is the row's width`);
        assert.equal(b.y, a.y, `${row}: the banks are level`);
        const g = L.gaps.find((q) => q.river === row)!;
        assert.ok(g, `${row}: its gap is the pond's`);
        assert.equal(!!g.soft, !!(W2_PADS[row] as PadRow).safe, `${row}: a safe row splashes him back`);
        assert.equal(!!g.water, !(W2_PADS[row] as PadRow).safe, `${row}: a deep row is water`);
        assert.equal(L.asks!.find((q) => q.key === 'far')!.move, 'ride', `${row}: the crossing is a ride, never a ${Math.round(g.x1 - g.x0)} px jump`);
      }
    });
  }
}

test("place 'pads' fails by name: a row the world lacks, a world with no pad table, a mirrored section", () => {
  const k = kitOn(W2_GROUND, []);
  assert.throws(() => layLocal(pond('lagoon'), budgetOf(k), rngFor(1), false, { pads: k.manifest.pads }), /pad row "lagoon"/);
  assert.throws(() => layLocal(pond('hop'), budgetOf(k), rngFor(1), false, {}), /no pad row of that name/);
  assert.throws(() => layLocal(pond('hop'), budgetOf(k), rngFor(1), true, { pads: k.manifest.pads }), /mirrored section/);
});

// ───────────────────────── the stage: pads, stones and clocks laid, judged ─────────────────────────
/** a toy-world stage with one pond of `row`: the first seed in 1-40 whose roll lays it */
function pondStage(ground: { y: number; bankH: number }, row: string, s: Difficulty = 'normal', pads: WorldManifest['pads'] = W2_PADS): Gen2Stage {
  const k = kitOn(ground, [pond(row)], pads);
  for (let seed = 1; seed <= 40; seed++) {
    const st = buildGen2Stage({ config: toyCfg('5-3', 'sprint'), kit: k, seed, difficulty: s });
    if (st.platforms.some((p) => p.pad)) return st;
  }
  throw new Error(`no roll of 1-40 lays the pond ${row}`);
}

for (const [name, ground] of [['World 2', W2_GROUND], ['World 6', W6_GROUND]] as const) {
  for (const s of ['normal', 'easy'] as const) {
    test(`${name} ground, ${s}: each of World 2's pad rows rolls clean, its pads, stones and clocks laid as its data says, fair by padFaults`, () => {
      for (const row of ROWS) {
        const data = W2_PADS[row] as PadRow;
        const st = pondStage(ground, row, s);
        assert.deepEqual(st.gen2.errors, [], `${row}: the roll is clean`);
        assert.deepEqual(padFaults(st), [], `${row}: fair`);
        const r = st.rivers!.find((z) => z.speed === 0)!;
        assert.ok(r, `${row}: still water`);
        assert.equal(!!r.safe, !!data.safe, `${row}: safe as its data says`);
        const inside = st.platforms.filter((p) => p.x >= r.x0 && p.x + p.width <= r.x1).sort((a, b) => a.x - b.x);
        assert.deepEqual(inside.map((p) => (p.pad ? (p.pad.by === 'beat' ? 'beat' : p.pad.look) : 'stone')), data.pads.map((k) => (k === 'stone' ? 'stone' : data.by === 'beat' ? 'beat' : k)), `${row}: the row in order`);
        for (const p of inside.filter((q) => q.pad)) {
          assert.equal(p.width, PAD_SIZES[p.pad!.by === 'beat' ? (data.pads[inside.indexOf(p)] as 'small' | 'big') : (p.pad!.look as 'small' | 'big')].w, `${row}: a pad its size's width`);
          assert.ok(st.clocks!.some((c) => c.id === p.pad!.clock), `${row}: its clock ${p.pad!.clock} is listed`);
        }
        for (const p of inside.filter((q) => !q.pad)) assert.equal(p.width, PAD_LAY.stoneW, `${row}: a stone`);
        // (Easy stretches every pad clock by the row's stretch, never shortens it)
        const def = st.clocks!.find((c) => c.id === inside.find((q) => q.pad)!.pad!.clock)!;
        const nb = beatOf(def, false), eb = beatOf(def, true);
        assert.ok(Math.abs(eb.period - nb.period * PAD_LAY.easyStretch) < 1e-6, `${row}: Easy's breath is x${PAD_LAY.easyStretch} (${eb.period} vs ${nb.period})`);
        // (riding petals sit on the pads their data names)
        assert.equal(st.collectibles.filter((c) => c.rides && inside.some((q) => q.id === c.rides!.id)).length, data.petals?.length ?? 0, `${row}: its riding petals`);
      }
    });
  }
}

// ───────────────────────── padFaults: each rule planted on a built stage, by name ─────────────────────────
test('padFaults: each rule, planted on a built pond, is caught and names itself', () => {
  const base = pondStage(W2_GROUND, 'back');
  const pads = base.platforms.filter((p) => p.pad);
  const plant = (f: (st: Gen2Stage) => void): string[] => {
    const st = structuredClone(base) as Gen2Stage;
    f(st);
    return padFaults(st);
  };
  const clockOf = (st: Gen2Stage) => st.clocks!.find((c) => c.id === pads[0].pad!.clock)!;
  const has = (faults: string[], re: RegExp, what: string) => assert.ok(faults.some((e) => re.test(e)), `${what}: ${JSON.stringify(faults)}`);
  assert.deepEqual(padFaults(base), [], 'the base is fair');
  has(plant((st) => { st.clocks = st.clocks!.filter((c) => c.id !== pads[0].pad!.clock); }), /is not in the stage's clocks/, 'an unlisted clock');
  has(plant((st) => { st.platforms.find((p) => p.id === pads[0].id)!.width = PAD_FAIR.minW - 10; }), /px wide, under 124/, 'a pad too narrow');
  // (a weight clock that holds 0.6 s: its 'off' cut so the warn starts sooner)
  has(plant((st) => { const d = clockOf(st); const off = d.phases.find((ph) => ph.name === 'off')!; off.seconds = Math.max(0.05, off.seconds - (PAD_FAIR.hold - 0.6)); }), /holds him .* under 1/, 'a pad that holds under 1.0 s');
  has(plant((st) => { const d = clockOf(st); const w = d.phases.find((ph) => ph.name === 'warn')!; d.phases.find((ph) => ph.name === 'off')!.seconds += w.seconds - 0.2; w.seconds = 0.2; }), /shiver lasts 0.2 s, under 0.4/, 'a shiver too short');
  // (the 'whole again within PAD_FAIR.back' rule cannot be planted on a stage: a sunk pad's count sits at most RIDE.padRise (0.6 s) past
  // its hold, so it is back within hold + 0.6 s whatever its clock; it binds only if padRise grows past 3.4 s. Named in BUILD-22's REPORT)
  // (water: move the far bank's side of the pond out past a hop, and a stone in close)
  has(plant((st) => { const p = st.platforms.find((q) => q.id === pads[0].id)!; p.x += 200; }), /past a hop \(160\)/, 'water past a hop');
  has(plant((st) => { const p = st.platforms.find((q) => q.id === pads[1].id)!; const a = st.platforms.find((q) => q.id === pads[0].id)!; p.x = a.x + a.width + 10; }), /under 20/, 'two pieces closer than 20 px');
  // (a stone: the breath row's, between its two runs)
  const br = pondStage(W2_GROUND, 'breath');
  const stone = br.platforms.find((p) => !p.pad && p.width === PAD_LAY.stoneW && br.rivers!.some((z) => z.speed === 0 && p.x > z.x0 && p.x < z.x1))!;
  assert.ok(stone, "the 'breath' row has its stone");
  const narrow = structuredClone(br) as Gen2Stage;
  narrow.platforms.find((q) => q.id === stone.id)!.width = 100;
  has(padFaults(narrow), /a stone 100 px wide, under 124/, 'a stone too narrow');
});

test('padFaults: a beat row whose breath is too short to cross a run is caught (the breath row, its up cut to 0.8 s)', () => {
  const st = pondStage(W2_GROUND, 'breath');
  assert.deepEqual(padFaults(st), []);
  const def = st.clocks!.find((c) => c.id === st.platforms.find((p) => p.pad)!.pad!.clock)!;
  def.phases.find((ph) => ph.name === 'off')!.seconds = 0.8;
  assert.ok(padFaults(st).some((e) => /beat pads in a run/.test(e)), JSON.stringify(padFaults(st)));
});

// ───────────────────────── in the real engine ─────────────────────────
const ID = '2-93';
const cfg: LevelConfig = { ...toyCfg(ID, 'sprint'), unlocked: true };
/** RealPlay on a toy pond, rolled the game's way (the listed row, a planted one-seed list, World 2's finish) */
function inPlay<T>(row: string, f: (sim: RealPlay) => T): T {
  const kit = kitOn(W2_GROUND, [pond(row)]);
  let seed = 1;
  let st = buildGen2Stage({ config: cfg, kit, seed, difficulty: 'normal' });
  while (!st.platforms.some((p) => p.pad) && seed < 40) st = buildGen2Stage({ config: cfg, kit, seed: ++seed, difficulty: 'normal' });
  const dict: string[] = [];
  const packed = packPlan({ seed: st.gen2.seed, rerolls: st.gen2.rerolls, plan: st.gen2.plan, foes: [...keptFoes(st)] }, dict);
  return withTestStage({ [ID]: { kit: () => kit, world: (s, _sq, d) => w2Finish(s as never, d) as typeof s, seeds: [] } }, () => {
    const undo = plantSeedList(ID, { dict, seeds: [seed], plans: [packed] });
    try {
      return withFixtureConfig(cfg, () => f(new RealPlay(ID, seed, cfg)));
    } finally {
      undo();
    }
  });
}
const padsOf = (sim: RealPlay): Platform[] => (sim as unknown as { platforms: Platform[] }).platforms.filter((p) => p.pad);

test('in play: a weight pad holds him, shivers, sinks under him, and is whole again once he has gone (the first pad, safe)', () => {
  inPlay('first', (sim) => {
    const pad = padsOf(sim)[0];
    assert.ok(pad && padShows(pad)!.solid, 'the pad is up before he comes');
    sim.p.x = pad.x + pad.width / 2;
    sim.p.y = pad.y - 120;
    sim.p.vx = 0;
    sim.p.vy = 0;
    let stood = -1, shivered = -1, sank = -1;
    for (let f = 0; f < 150 && sank < 0; f++) {
      sim.frame();
      if (stood < 0 && sim.p.grounded) stood = sim.t;
      if (stood >= 0 && shivered < 0 && padShows(pad)!.tell > 0) shivered = sim.t;
      if (stood >= 0 && !padShows(pad)!.solid) sank = sim.t;
    }
    assert.ok(stood >= 0, 'he lands on it');
    assert.ok(shivered > stood, 'it shivers first');
    assert.ok(sank - stood >= PAD_SIZES.big.hold - 0.05, `it holds him ${PAD_SIZES.big.hold} s (held ${(sank - stood).toFixed(2)})`);
    let back = -1;
    for (let f = 0; f < 200 && back < 0; f++) {
      sim.frame();
      if (padShows(pad)!.solid && padShows(pad)!.tell === 0) back = sim.t;
    }
    assert.ok(back > 0 && back - sank <= PAD_FAIR.back, `it is whole again within ${PAD_FAIR.back} s (${(back - sank).toFixed(2)})`);
  });
});

test('in play: a beat row breathes in step, weight or not (the breath row, nobody on it)', () => {
  inPlay('breath', (sim) => {
    const pads = padsOf(sim);
    assert.equal(pads.length, 4);
    let ups = 0, downs = 0, wasUp = padShows(pads[0])!.solid;
    for (let f = 0; f < 30 * 7; f++) {
      sim.frame();
      const now = pads.map((p) => padShows(p)!.solid);
      assert.ok(now.every((v) => v === now[0]), `in step at t=${sim.t.toFixed(2)}: ${now}`);
      if (now[0] && !wasUp) ups++;
      if (!now[0] && wasUp) downs++;
      wasUp = now[0];
    }
    assert.ok(ups >= 2 && downs >= 2, `it breathes: ${downs} times under, ${ups} times up in 7 s`);
  });
});
