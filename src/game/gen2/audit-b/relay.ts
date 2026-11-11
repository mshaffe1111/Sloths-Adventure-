/**
 * AUDIT-B helper (2026-11-11; not game code): a proven 1-1 seed laid again from its proven plan with pipeline.layStage, so an audit can
 * read what the pipeline keeps to itself (Laid.asks, each section's pieces by key). The same lay the game plays: w1-hops.test.ts checks
 * its platforms against seedList.buildPlayStage's.
 */
import { layStage, missionGraph, planBudget, stagePool, type Laid } from '../pipeline.ts';
import { provenPlan } from '../seedList.ts';
import { w1World } from '../worlds/w1.ts';
import { generateAllLevels } from '../../worldsData.ts';
import type { Difficulty } from '../../difficulty.ts';
import type { Platform } from '../../types.ts';
import type { SectionPiece, SectionTemplate } from '../types.ts';

export const cfg11 = () => ({ ...generateAllLevels().find((l) => l.id === '1-1')!, unlocked: true });

export function relay11(seed: number, setting: Difficulty): { laid: Laid; byId: Map<string, SectionTemplate> } {
  const kit0 = w1World();
  const kit = { ...kit0, manifest: { ...kit0.manifest, sections: stagePool(kit0.manifest, '1-1') } };
  const budget = planBudget(cfg11(), kit.manifest, setting);
  const r = provenPlan('1-1', seed);
  if (!r) throw new Error(`1-1 seed ${seed} is not on the proven list`);
  const laid = layStage(budget, missionGraph(budget, kit.manifest, seed), kit, r.seed, { plan: r.plan });
  return { laid, byId: new Map(kit.manifest.sections.map((t) => [t.id, t])) };
}

/** every laid `on` piece that is an obstacle on the way (a stump or rock a hop clears: pipeline LocalPiece.hop, the 'h' beat), with the
 *  rise it asks: the top of the piece it stands on, less its own */
export function hopPieces(seed: number, setting: Difficulty): Array<{ section: string; template: string; key: string; platform: Platform; rise: number; spec: SectionPiece }> {
  const { laid, byId } = relay11(seed, setting);
  const out: ReturnType<typeof hopPieces> = [];
  laid.sections.forEach((sec, si) => {
    const t = byId.get(sec.template)!;
    const vs = laid.plan[si].versions ?? {};
    const all = [...t.pieces, ...(t.subBlocks ?? []).flatMap((sb) => sb.versions.filter((v) => v.id === vs[sb.id]).flatMap((v) => v.pieces))];
    for (const q of sec.pieces) {
      const spec = all.find((p) => p.key === q.key);
      if (!spec || spec.place.kind !== 'on' || spec.shape === 'bouncy' || !q.main) continue;
      const on = sec.pieces.find((z) => z.key === (spec.place as { on: string }).on);
      if (on) out.push({ section: sec.uid, template: sec.template, key: q.key, platform: q.platform, rise: on.platform.y - q.platform.y, spec });
    }
  });
  return out;
}
