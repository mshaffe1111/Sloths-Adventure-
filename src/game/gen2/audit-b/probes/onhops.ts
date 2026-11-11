// the `on` hop pieces of every proven 1-1 seed: their heights against the single-rise band, and against the engine's 50 px wall
import { layStage, missionGraph, planBudget, stagePool } from '../../../gen2/pipeline.ts';
import { provenPlan } from '../../../gen2/seedList.ts';
import { PROVEN_SEEDS } from '../../../gen2/provenSeeds.ts';
import { BANDS } from '../../../gen2/reach.ts';
import { w1World } from '../../../gen2/worlds/w1.ts';
import { generateAllLevels } from '../../../worldsData.ts';
const cfg = { ...generateAllLevels().find((l) => l.id === '1-1')!, unlocked: true };
const seeds = PROVEN_SEEDS['1-1'].seeds;
for (const setting of ['normal', 'easy'] as const) {
  const hi = (BANDS['single-rise'][setting] as { hi: number }).hi;
  let hops = 0, low = 0, over = 0, seedsOver = new Set<number>(), seedsLow = new Set<number>();
  const byTpl = new Map<string, number>(), lowTpl = new Map<string, number>();
  const hist = new Map<number, number>();
  let beatsH = 0, beatsAll = 0;
  let ex = '';
  for (const seed of seeds) {
    const kit0 = w1World();
    const kit = { ...kit0, manifest: { ...kit0.manifest, sections: stagePool(kit0.manifest, '1-1') } };
    const byId = new Map(kit.manifest.sections.map((t) => [t.id, t]));
    const budget = planBudget(cfg, kit.manifest, setting);
    const r = provenPlan('1-1', seed)!;
    const laid = layStage(budget, missionGraph(budget, kit.manifest, seed), kit, r.seed, { plan: r.plan });
    for (const [si, sec] of laid.sections.entries()) {
      const t = byId.get(sec.template)!;
      const vs = laid.plan[si].versions ?? {}; const all = [...t.pieces, ...(t.subBlocks ?? []).flatMap((sb) => sb.versions.filter((v) => v.id === vs[sb.id]).flatMap((v) => v.pieces))];
      beatsAll += sec.beats.length; beatsH += sec.beats.filter((b) => b.letter === 'h').length;
      for (const q of sec.pieces) {
        const pc = all.find((p) => p.key === q.key);
        if (!pc || pc.place.kind !== 'on' || pc.shape === 'bouncy') continue;
        hops++;
        const on = sec.pieces.find((z) => z.key === (pc.place as { on: string }).on)!; const h = on.platform.y - q.platform.y; if (!q.main) continue;
        hist.set(Math.floor(h / 10) * 10, (hist.get(Math.floor(h / 10) * 10) ?? 0) + 1);
        if (h < 50) { low++; seedsLow.add(seed); lowTpl.set(sec.template, (lowTpl.get(sec.template) ?? 0) + 1); }
        if (h > hi) { over++; seedsOver.add(seed); byTpl.set(sec.template, (byTpl.get(sec.template) ?? 0) + 1); if (!ex) ex = `seed ${seed} ${sec.template}/${q.key} at x ${q.platform.x}: ${h} px`; }
      }
    }
  }
  console.log(`${setting}: ${hops} hop pieces on ${seeds.length} seeds; heights ${JSON.stringify([...hist].sort((a, b) => a[0] - b[0]))}`);
  console.log(`  under the engine's 50 px wall: ${low} (${(low / seeds.length).toFixed(1)} a stage) on ${seedsLow.size} seeds; of all 'h' beats ${beatsH} (${beatsAll} beats)`);
  console.log(`  over the single-rise band (${hi} px), no ask, never judged: ${over} on ${seedsOver.size} seeds; first: ${ex}`);
  console.log('  over-band by section:', JSON.stringify([...byTpl].sort((a, b) => b[1] - a[1]).slice(0, 8)));
  console.log('  low rocks by section:', JSON.stringify([...lowTpl].sort((a, b) => b[1] - a[1]).slice(0, 8)));
}
