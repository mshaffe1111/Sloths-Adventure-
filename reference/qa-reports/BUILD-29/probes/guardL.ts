// BUILD-29-i: the posted guard on the LISTED 2-9 (stageSource), Normal + Easy, seeds 1..N: where he stands vs the barge's far bank
import '../../../../src/game/headlessDom.ts';
import { buildGen2Stage } from '../../../../src/game/gen2/pipeline.ts';
import { stageSource } from '../../../../tools/engine/libstage.ts';
const N = Number(process.argv[2] ?? 3); const { kit, cfg } = stageSource('2-9');
for (const d of ['normal', 'easy'] as const) for (let seed = 1; seed <= N; seed++) {
  try {
    const st = buildGen2Stage({ config: cfg, kit: kit(), seed, difficulty: d }) as any;
    const g = st.enemies.filter((e: any) => e.royal || e.uncounted || e.post !== undefined);
    const r = (st.rivers ?? []).find((r: any) => st.platforms.some((p: any) => p.drift?.look === 'barge' && p.drift.x0 >= r.x0 - 1 && p.drift.x0 <= r.x1));
    console.log(`${d} s${seed}: guards ${g.map((e: any) => `x${Math.round(e.x)} post ${e.post}`).join('; ') || 'NONE'} | barge river x${Math.round(r?.x0)}-${Math.round(r?.x1)} | rerolls ${JSON.stringify(st.gen2.rerolls ?? '').slice(0, 120)}`);
  } catch (e) { console.log(`${d} s${seed}: THROW ${String(e).slice(0, 140)}`); }
}
