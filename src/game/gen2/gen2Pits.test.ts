/**
 * The soft pits under glides and swings (pipeline.ts pitUnder): a back pit climbs back to its take-off in steps, and on low ground its floor
 * once lay under the banks' foot and under the death line. Standing on the soft floor was a death, and a jump off it passed under a bank's
 * edge and fell through (World 9's 9-5, the first-timer bot's 19 lives). The fix (deepen, and the death line under the deepest floor) is
 * every world's (the lead, 2026-10-31): this scans every shipped gen2 stage, two seeds each on Normal and Easy, plus raw World 9 glide rolls.
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

test('World 9\'s glide stage (where the bug was found) keeps its soft floors standable, raw rolls', async () => {
  const stage = await resolveStage('9-5');
  for (let seed = 1; seed <= 6; seed++) {
    for (const difficulty of ['normal', 'easy'] as const) {
      const st = buildGen2Stage({ config: stage.config, kit: stage.kit, seed, difficulty });
      assert.deepEqual(pitFaults(st), [], `9-5 seed ${seed} (${difficulty})`);
    }
  }
});

test('8-6\'s dark glides (five shipped Normal rolls had a floor running under a bank\'s foot, 51-85 px): every shipped seed on Normal', async () => {
  const e = GEN2_SEEDS['8-6'];
  const stage = await resolveStage('8-6', e.kit);
  for (const s of e.seeds) {
    const st = buildGen2Stage({ config: stage.config, kit: stage.kit, seed: s.seed, difficulty: 'normal', recent: e.recent });
    assert.deepEqual(pitFaults(st), [], `8-6 seed ${s.seed}`);
  }
});
