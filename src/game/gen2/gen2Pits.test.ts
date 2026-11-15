/**
 * The soft pits under glides and swings (pipeline.ts pitUnder): a back pit climbs back to its take-off in steps, and on low ground its floor
 * once lay under the banks' foot and under the death line. Standing on the soft floor was a death, and a jump off it passed under a bank's
 * edge and fell through (World 9's 9-5, the first-timer bot's 19 lives). The fix (deepen, and the death line under the deepest floor) is
 * every world's (the lead, 2026-10-31): this scans every shipped gen2 stage, two seeds each on Normal and Easy, and every 8-6 Normal seed.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { buildGen2Stage } from './pipeline.ts';
import { GEN2_SEEDS } from './seeds.ts';
import { resolveStage } from '../../../tools/gen2/curate.ts';
type Stage = ReturnType<typeof buildGen2Stage>;

/** what is wrong with the stage's floors: a solid top at or under the death line, or a floor with a bank beside it that ends well above it */
function pitFaults(st: Stage): string[] {
  const out: string[] = [];
  const dieY = Math.min(st.config.levelHeight + 120, st.waterY ?? Infinity);
  const solid = st.platforms.filter((p) => !p.lift && p.type === 'solid');
  const pool = (p: (typeof solid)[number]) => st.safeWater?.some((s) => p.x + p.width / 2 > s.x0 && p.x + p.width / 2 < s.x1);
  for (const p of solid) {
    if (p.y >= dieY - 4 && !pool(p)) out.push(`floor at x ${Math.round(p.x)} (top ${Math.round(p.y)}) is under the death line ${Math.round(dieY)}`);
    for (const q of solid) {
      if (q === p || q.height < 40) continue;
      const touch = Math.abs(q.x + q.width - p.x) < 3 || Math.abs(q.x - (p.x + p.width)) < 3;
      // (a gap under the bank's foot he fits through (48 px, his height): he walks off the floor's end under it)
      if (touch && q.y < p.y - 40 && q.y + q.height < p.y - 48) out.push(`floor at x ${Math.round(p.x)} runs under the bank at x ${Math.round(q.x)} (its foot ${Math.round(q.y + q.height)}, the floor ${Math.round(p.y)})`);
    }
  }
  return out;
}

test('no shipped gen2 stage has a soft floor under the death line or under a bank\'s foot', async () => {
  for (const [key, e] of Object.entries(GEN2_SEEDS)) {
    const stage = await resolveStage(key, e.kit);
    for (const i of [...new Set([0, e.seeds.length - 1])]) {
      for (const difficulty of ['normal', 'easy'] as const) {
        const st = buildGen2Stage({ config: stage.config, kit: stage.kit, seed: e.seeds[i].seed, difficulty, recent: e.recent });
        assert.deepEqual(pitFaults(st), [], `${key} seed ${e.seeds[i].seed} (${difficulty})`);
      }
    }
  }
});

// (World 9's own check of its raw 9-5 rolls lives on w9-pieces, with World 9)

test('8-6\'s dark glides (five shipped Normal rolls had a floor running under a bank\'s foot, 51-85 px): every shipped seed on Normal', async () => {
  const e = GEN2_SEEDS['8-6'];
  const stage = await resolveStage('8-6', e.kit);
  for (const s of e.seeds) {
    const st = buildGen2Stage({ config: stage.config, kit: stage.kit, seed: s.seed, difficulty: 'normal', recent: e.recent });
    assert.deepEqual(pitFaults(st), [], `8-6 seed ${s.seed}`);
  }
});

// INT-9 (11-14): a bank beside a pit reaches down past its floor in every world, any slot. The 48 px exception left a 0-48 px slot under
// a bank's foot; a stair stone laid flush against that bank read as drawn past its ground's lip (w1CutArt.ts groundRun's wall wants the
// bank 3+ px past the floor) and the settle (R-165.226) swapped the section away until the pool was spent: 1-7 threw on 5 of 8 seeds.
// Every World 1 stage the game lists, its first two LISTED seeds on both settings, each built the way the seed-list search builds it (a
// listed seed's replayed plan is that build: seedlist --check proves it): each builds, and no bank stands with its foot 0-48 px over a
// floor it touches (planted: red with the exception back, 1-7 seed 1 throws). The slot rule judges what players get (the lead's ruling A,
// INT-10b 12:07 PM ET 11-15): until then it built RAW seeds 1 and 2, and 1-8's raw seed 2 is refused by name in its finish ("still fork 3:
// its ground breaks", stillFork.ts), a roll the list never holds and no player meets; refusing rolls is the list's job, and every listed
// seed must build here. Same rule, same strictness, on the played stages. Planted: the old 1-6 join (its own piece) goes RED on a listed
// 1-6 seed (reference/qa-reports/INT-10b/planted.py).
test('a bank beside a pit reaches past its floor, any slot: every listed World 1 stage builds with no slot under a bank', async () => {
  const { buildStage } = await import('../../../tools/engine/libstage.ts');
  const { PROVEN_INDEX } = await import('./provenIndex.ts');
  const slots = (st: Stage): string[] => {
    const solid = st.platforms.filter((p) => p.type === 'solid' && !p.lift);
    const out: string[] = [];
    for (const p of solid) for (const q of solid) {
      if (q === p || q.height < 40) continue;
      const touch = Math.abs(q.x + q.width - p.x) < 3 || Math.abs(q.x - (p.x + p.width)) < 3;
      const foot = q.y + q.height;
      if (touch && q.y < p.y - 40 && foot <= p.y + 3 && foot >= p.y - 48) out.push(`bank at x ${Math.round(q.x)} ends ${Math.round(p.y - foot)} px over the floor at x ${Math.round(p.x)}`);
    }
    return out;
  };
  for (const id of Object.keys(PROVEN_INDEX).filter((k) => k.startsWith('1-'))) {
    const listed = (await PROVEN_INDEX[id].load()).LIST.seeds.slice(0, 2);
    assert.equal(listed.length, 2, `${id}: a list of at least two seeds`);
    for (const seed of listed) for (const d of ['normal', 'easy'] as const) {
      let st: Stage;
      try { st = buildStage(id, seed, d); } catch (e) { assert.fail(`${id} seed ${seed} (${d}) does not build: ${(e as Error).message.slice(0, 160)}`); }
      assert.deepEqual(slots(st), [], `${id} seed ${seed} (${d})`);
    }
  }
});
