// METER-3 (R-165.287; ENG-24's pieces, reference/design/2-4.md NEW 1-2): the meter prices a let-go from a liana onto the logs of the river
// under it, and a jump off a riding log up to a liana, on ENG-24's toys rolled the game's way (tools/inspect/lianaRiverToys.ts). Each test
// plants the fault it exists for: the route boarding the river from the bank, the channel gone (the coverage gate and the meter refuse).
import '../../src/game/headlessDom.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { withTestStage } from '../../src/game/gen2/listed.ts';
import { buildGen2Stage, keptFoes } from '../../src/game/gen2/pipeline.ts';
import { packPlan, plantSeedList } from '../../src/game/gen2/seedList.ts';
import { withFixtureConfig, RealPlay } from '../../src/game/realPlay.ts';
import { w2Finish } from '../../src/game/gen2/worlds/w2.ts';
import { lianaDrops } from '../../src/game/gen2/riverLay.ts';
import { lianasOver } from '../../src/game/river.ts';
import { vinePeriod } from '../../src/game/physics.ts';
import { withSetting } from '../../src/game/settingDials.ts';
import { cfg, fixtureSeed, ID, kitFor, type LianaToy, type ToyRiver } from '../inspect/lianaRiverToys.ts';
import { findRoute } from '../inspect/route.ts';
import { scoreStage, windowBits, lianaChallenges, logCatchWindow, MOVE_CHANNEL, UnpricedPiece, COVERAGE_KNOWN } from './score.ts';
import { judge, vocabulary, TABLE_FILE, type Table } from './coveragecheck.ts';

const ROOT = path.resolve(import.meta.dirname, '../..');
const TABLE: Table = JSON.parse(fs.readFileSync(path.join(ROOT, TABLE_FILE), 'utf8'));

/** run `fn` with toy `toy` on river `row` (Easy's twin `easy`) planted as the stage ID, rolled the game's way */
function onToy<T>(toy: LianaToy, row: ToyRiver, easy: ToyRiver, setting: 'normal' | 'easy', fn: (seed: number) => T): T {
  const seed = fixtureSeed(toy, row, ['normal', 'easy'], easy);
  assert.ok(seed !== null, `no roll lays the ${toy}/${row} toy clean`);
  const kit = kitFor(toy, row, easy);
  const st = buildGen2Stage({ config: cfg, kit, seed: seed!, difficulty: setting });
  const dict: string[] = [];
  const packed = packPlan({ seed: st.gen2.seed, rerolls: st.gen2.rerolls, plan: st.gen2.plan, foes: [...keptFoes(st)] }, dict);
  return withTestStage({ [ID]: { kit: () => kit, world: (s, _sq, d) => w2Finish(s as never, d) as typeof s, seeds: [] } }, () => {
    const undo = plantSeedList(ID, { dict, seeds: [seed!], plans: [packed] });
    try { return withFixtureConfig(cfg, () => fn(seed!)); } finally { undo(); }
  });
}

test('LET-GO ONTO A LOG: the route boards a liana river from the air and the meter prices the let-go by its share (gap280 41% > long 86%)', () => {
  const read = (row: ToyRiver) => onToy('drop', row, 'deep', 'normal', (seed) => {
    const r = scoreStage(ID, 'normal', seed, new Map());
    const st: any = new RealPlay(ID, seed).stage;
    const v = st.vines.find((q: any) => q.isSwingingVine);
    const river = st.rivers.find((q: any) => lianasOver([v], q).length);
    const logs = st.platforms.filter((p: any) => p.drift && p.drift.x0 === river.x0).map((p: any) => p.drift);
    return { r, share: lianaDrops(v, logs, 'normal').share };
  });
  const gap = read('gap280'), long = read('long');
  for (const { r, share } of [gap, long]) {
    const drop = r.challenges.filter((c) => c.kind === 'liana-drop');
    assert.equal(drop.length, 1, r.challenges.map((c) => c.kind).join(' '));
    assert.ok(Math.abs(drop[0].bits - windowBits(1, share)) < 1e-9, drop[0].note);
    // (PLANTED by the old route: it boarded these logs from the bank, a 'ride-board', and never read the let-go)
    assert.ok(!r.challenges.some((c) => c.kind === 'ride-board'), 'boarded from the bank');
    assert.ok(r.pieces.includes('move:lianaDrop') && r.pieces.includes('move:logCatch'), r.pieces.join(' '));
  }
  assert.ok(gap.share < 0.45 && long.share > 0.8, `${gap.share} ${long.share} (ENG-24's table: 41%, 86%)`);
  assert.ok(gap.r.challenges.find((c) => c.kind === 'liana-drop')!.bits > long.r.challenges.find((c) => c.kind === 'liana-drop')!.bits + 0.5);
});

test('A CATCH OFF A LOG: the catch toy (no bank reaches the liana) prices the jump off the riding log by its window; the route boards from the bank', () => {
  onToy('catch', 'twin', 'long', 'normal', (seed) => {
    const st: any = new RealPlay(ID, seed).stage;
    const v = st.vines.find((q: any) => q.isSwingingVine);
    const log = st.platforms.find((p: any) => p.drift && st.rivers.some((q: any) => q.x0 === p.drift.x0 && lianasOver([v], q).length));
    const w = logCatchWindow(log.drift, v, 'normal');
    assert.ok(w > 0, 'no jump off the log catches it');
    const route = findRoute(st, [], { steps: true });
    // (no bank catches this liana, so the bank's board stays: the river is ridden, and a ride that reaches the bank is the quicker way)
    assert.ok(route.segs.some((s) => s.kind === 'timedHop'), route.segs.map((s) => s.kind).join(' '));
    const seg = { kind: 'logCatch' as const, x0: v.x - 100, y0: log.y, x1: v.x, y1: v.bottomY, dt: 1, from: log };
    const c = lianaChallenges(st, { ...route, segs: [seg] }, 'normal', false);
    assert.equal(c.length, 1);
    assert.equal(c[0].kind, 'log-catch');
    assert.ok(Math.abs(c[0].bits - windowBits(withSetting('normal', () => vinePeriod(v)), w)) < 1e-9, c[0].note);
  });
});

test('PLANTED: without its channel a stage laying a liana over a river is refused by the meter and failed by the coverage gate', () => {
  onToy('drop', 'gap280', 'deep', 'normal', (seed) => {
    const ch = MOVE_CHANNEL as Record<string, string | undefined>;
    const was = ch.lianaDrop;
    delete ch.lianaDrop;
    try {
      assert.throws(() => scoreStage(ID, 'normal', seed, new Map()), (e: unknown) => e instanceof UnpricedPiece && e.piece === 'move:lianaDrop');
    } finally { ch.lianaDrop = was; }
    const pieces = scoreStage(ID, 'normal', seed, new Map()).pieces;
    const uses = new Map(pieces.map((p) => [p, new Set([ID])]));
    for (const id of ['move:lianaDrop', 'move:logCatch']) {
      const t: Table = { ...TABLE, pieces: { ...TABLE.pieces, [id]: { ...TABLE.pieces[id], channel: null } } };
      const f = judge(vocabulary(), t, [...COVERAGE_KNOWN], uses, []).faults;
      assert.ok(f.some((x) => x.startsWith(`(b) ${id} on ${ID}: no channel`)), f.join('\n'));
    }
    assert.deepEqual(judge(vocabulary(), TABLE, [...COVERAGE_KNOWN], uses, []).faults.filter((x) => /liana|log/i.test(x)), []);
  });
});
