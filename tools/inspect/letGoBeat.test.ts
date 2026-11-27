/**
 * ENG-QUIET (the lead's ruling B, 11-26): a let-go from a liana onto a river's log ('lianaDrop') and a jump off a riding log up to a
 * liana ('logCatch') are MOVES, busy for their whole time as a swing is (STAGE-RULES line 160: vines and timing choices count as action).
 * findBeats had no case for either, so 2-9's let-go and twist read 2.8-2.9 s of "nothing to do" each (REPORT ENG-QUIET §1).
 * And the let-go's wait on a LOCKED court (a stage with a tempo: the liana's swing is the bar, the logs on the beat, one clock) is
 * lockedDrops' (one pairing met), not lianaDrops' grid (every pairing met at random): route.ts priced 2-9's court 0.33-0.38 s, the
 * locked court 0.08.
 */
import '../../src/game/headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildGen2Stage } from '../../src/game/gen2/pipeline.ts';
import { listedStage, playFinish } from '../../src/game/gen2/listed.ts';
import { withGoals } from '../../src/game/goals.ts';
import { lianaDrops, lockedLianas } from '../../src/game/gen2/riverLay.ts';
import { lianasOver, onRiver } from '../../src/game/river.ts';
import { pickRoute } from './eraRoll.ts';
import { SWING_PACE } from './route.ts';
import { stageSource } from '../engine/libstage.ts';
import { tempoCfg, tempoKit, tempoRow } from '../../src/game/gen2/worlds/w2TempoToy.ts';

const played = (id: string, seed: number, toy?: { tempo: null | undefined }) => {
  const { kit, cfg } = toy ? { kit: () => tempoKit(toy), cfg: tempoCfg() } : stageSource(id);
  const st0 = buildGen2Stage({ config: cfg, kit: kit(), seed, difficulty: 'normal' }) as any;
  const st = playFinish(toy ? tempoRow(toy) : listedStage(id)!, structuredClone(st0), 'normal') as any;
  return { st, U: (pickRoute(cfg.objectiveType, withGoals({ ...st } as never) as never) as any).used };
};

test('a let-go or log catch on the route is a move beat, busy for its whole time (2-4 seed 1, Normal)', () => {
  const { U } = played('2-4', 1);
  let t = 0, n = 0;
  for (const s of U.route.segs) {
    if (s.kind === 'lianaDrop' || s.kind === 'logCatch') {
      n++;
      const b = U.br.beats.find((q: any) => q.fam === `move:${s.kind}` && Math.abs(q.base - t) < 1e-9);
      assert.ok(b, `no move beat for the ${s.kind} at x ${Math.round(s.x0)}`);
      assert.equal(b.letter, 'V');
      assert.ok(Math.abs(b.act - s.dt) < 1e-9, `${s.kind} at x ${Math.round(s.x0)} busy ${b.act} of ${s.dt}`);
    }
    t += s.dt;
  }
  assert.ok(n >= 4, `2-4's route takes ${n} let-gos/catches (the toy needs some)`);
});

test("a let-go's wait on a LOCKED court is lockedDrops' (one pairing), on an unlocked river lianaDrops' grid (the tempo toy, w2TempoToy)", () => {
  for (const [id, locked] of [['tempo toy, locked', true], ['tempo toy, no tempo', false]] as const) {
    const { st, U } = played(id, Number(process.env.LETGO_SEED ?? 1), { tempo: locked ? undefined : null });
    assert.equal(!!(st.tempo ?? st.gen2?.brief?.tempo), locked, `${id} tempo`);
    const segs = U.route.segs.filter((s: any) => s.kind === 'lianaDrop');
    assert.ok(segs.length, `${id}: a let-go on the route`);
    for (const s of segs) {
      const v = st.vines.find((q: any) => Math.abs(q.x - s.x0) < 1e-6);
      const r = st.rivers.find((q: any) => lianasOver([v], q).length);
      const logs = st.platforms.filter((p: any) => p.type === 'drift' && p.drift && onRiver(p.drift, r)).map((p: any) => p.drift);
      const grid = lianaDrops(v, logs, 'normal').wait;
      const lk = lockedLianas(st, 'normal').find((q) => q.liana.id === v.id)?.drops.wait;
      const want = locked && lk !== undefined && Number.isFinite(lk) ? lk : grid;
      const got = s.dt - Math.abs(s.x1 - s.x0) / SWING_PACE - 1.2;
      assert.ok(Math.abs(got - want / 2) < 1e-9, `${id} let-go at x ${Math.round(s.x0)}: wait ${got.toFixed(3)}, want ${(want / 2).toFixed(3)} (grid ${grid.toFixed(3)}, locked ${lk})`);
      if (locked) assert.ok(lk! < grid, `${id}: the locked court waits less than the grid here (${lk} vs ${grid}), or the toy tests nothing`);
    }
  }
});
