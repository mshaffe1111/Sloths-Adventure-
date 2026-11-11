// AUDIT-B (2026-11-11, ENGINE-AUDIT-B.md B-01 and B-03). FAILING ON PURPOSE: these prove two defects in gen2 1-1; nothing here fixes them.
//   B-01: a "hop" rock under 50 px is no wall in the engine (engine.ts:2327 `plat.height < 50` continue): a plain walk goes through it.
//         w1.ts gLowStumps was raised to 50 px for this ("a 36-42 px stump was walked through"); gLogHop, gShelf, gBounceWall and the
//         forks' low rocks still roll 34-46 px, and pipeline.ts:1619 counts each as an 'h' beat.
//   B-03: an `on` piece's rise is clamped by riseCap(dblOK, ...) (pipeline.ts:962: the DOUBLE's envelope on 1-1) and pushes no ask
//         (pipeline.ts asks: jump / double / pit / seam / bounce lip only), so verdicts.ts never judges it: Easy lays 76-80 px stumps
//         over its 63 px single-rise band in the first lesson, on every listed seed.
// Run: npx tsx --test src/game/gen2/audit-b/w1-hops.test.ts
import test from 'node:test';
import assert from 'node:assert/strict';
import '../../headlessDom.ts';
import { RealPlay } from '../../realPlay.ts';
import { setDifficulty } from '../../difficulty.ts';
import { withPlaySeed } from '../../testlink1_1.ts';
import { buildPlayStage } from '../seedList.ts';
import { PROVEN_SEEDS } from '../provenSeeds.ts';
import { BANDS } from '../reach.ts';
import { w1World } from '../worlds/w1.ts';
import { cfg11, hopPieces, relay11 } from './relay.ts';

const SEEDS = PROVEN_SEEDS['1-1'].seeds;

test('the measuring tool: the re-lay is the stage the game plays (first 6 listed seeds, both settings)', () => {
  for (const seed of SEEDS.slice(0, 6)) for (const setting of ['normal', 'easy'] as const) {
    const { laid } = relay11(seed, setting);
    const game = buildPlayStage(cfg11(), w1World(), seed, setting).platforms.filter((p) => p.id < 900000);
    assert.ok(laid.platforms.every((p, i) => game[i] && game[i].x === p.x && game[i].y === p.y && game[i].width === p.width && game[i].height === p.height), `seed ${seed} ${setting}`);
  }
});

test('B-01: every hop rock on the way stops a plain walk (real engine, Normal, the first 3 listed seeds)', () => {
  const through: string[] = [];
  let rocks = 0;
  for (const seed of SEEDS.slice(0, 3)) {
    setDifficulty('normal');
    const r = withPlaySeed(seed, () => new RealPlay('1-1', 1));
    for (const h of hopPieces(seed, 'normal')) {
      const k = h.platform;
      // (a rock with 60 px of floor either side: a walk at it, nothing else in the way)
      const floor = r.platforms.find((f) => f.type === 'solid' && Math.abs(f.y - (k.y + h.rise)) <= 1 && f.x <= k.x - 60 && f.x + f.width >= k.x + k.width + 60);
      if (!floor) continue;
      rocks++;
      r.stand(k.x - 58, floor.y);
      let top = floor.y, passed = false;
      for (let i = 0; i < 70 && !passed; i++) { r.frame({ right: true }); top = Math.min(top, r.p.y); passed = r.p.x > k.x + k.width + 20; }
      if (passed) through.push(`seed ${seed} ${h.template}/${h.key} x ${k.x}: ${h.rise} px tall, walked past with no jump (his feet rose ${Math.round(floor.y - top)} px)`);
    }
    (r.e as unknown as { stop(): void }).stop();
  }
  assert.ok(rocks > 30, `${rocks} rocks walked at`);
  assert.deepEqual(through, [], `${through.length} of ${rocks} hop rocks are walked straight through`);
});

for (const setting of ['easy', 'normal'] as const) {
  test(`B-03: no hop piece on the way rises over ${setting}'s single-rise band unless it is a declared block (all ${SEEDS.length} listed seeds)`, () => {
    const hi = (BANDS['single-rise'][setting] as { hi: number }).hi;
    const over: string[] = [];
    const seeds = new Set<number>();
    for (const seed of SEEDS) for (const h of hopPieces(seed, setting)) {
      if (h.spec.block || h.rise <= hi) continue;
      seeds.add(seed);
      if (over.length < 5) over.push(`seed ${seed} ${h.template}/${h.key} x ${h.platform.x}: ${h.rise} px (band ${hi})`);
    }
    assert.equal(seeds.size, 0, `${seeds.size} of ${SEEDS.length} listed seeds lay an unjudged hop over the band, e.g. ${over.join('; ')}`);
  });
}
