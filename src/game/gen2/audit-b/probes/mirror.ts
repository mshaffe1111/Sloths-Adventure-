// every shipped gen2 roll (5-7, 5-9, Worlds 6-8), both settings: each laid jump against the builder's OWN envelope (maxGap at its rise and margin),
// split by whether its section was laid mirrored
import '../../../headlessDom.ts';
import { layStage, maxGap, glideGap, missionGraph, planBudget, stagePool } from '../../../gen2/pipeline.ts';
import { buildGen2ForGame, GEN2_STAGES } from '../../../gen2/game.ts';
import { GEN2_SEEDS } from '../../../gen2/seeds.ts';
import { reachJump } from '../../../physics.ts';
import { generateAllLevels } from '../../../worldsData.ts';
const levels = generateAllLevels();
const only = process.argv[2];
const tot = { plain: 0, plainOver: 0, mir: 0, mirOver: 0, mirPastSingle: 0, relayBad: 0, rolls: 0 };
const ex: string[] = []; const byTpl = new Map<string, number>();
for (const id of Object.keys(GEN2_STAGES)) {
  if (only && !id.startsWith(only)) continue;
  const cfg = { ...levels.find((l) => l.id === id)!, unlocked: true };
  const E = GEN2_SEEDS[id];
  for (let v = 0; v < E.seeds.length; v++) for (const d of ['normal', 'easy'] as const) {
    let st;
    try { st = buildGen2ForGame(cfg, d, v); } catch (e) { ex.push(`${id} v${v} ${d} THREW ${(e as Error).message.slice(0, 120)}`); continue; }
    tot.rolls++;
    const kit0 = GEN2_STAGES[id].kit(d);
    const kit = { ...kit0, manifest: { ...kit0.manifest, sections: stagePool(kit0.manifest, id) } };
    const budget = planBudget(cfg, kit.manifest, d);
    const graph = missionGraph(budget, kit.manifest, E.seeds[v].seed);
    let laid;
    try { laid = layStage(budget, graph, kit, st.gen2.seed, { plan: st.gen2.plan, recent: E.recent }); } catch { tot.relayBad++; continue; }
    const gp = st.platforms;
    if (!laid.platforms.slice(0, 40).every((p, i) => gp[i] && gp[i].x === p.x && gp[i].y === p.y)) { tot.relayBad++; continue; }
    for (const a of laid.asks ?? []) {
      if (a.move === 'bounce' || a.key === 'seam') continue;
      const sec = laid.sections.find((q) => q.uid === a.section)!;
      const rise = a.yTake - a.yLand, gap = a.x1 - a.x0, dbl = a.move === 'double';
      const env = Math.max(maxGap(rise, dbl, budget.margin), 60);
      const envG = Math.max(env, glideGap(rise, budget));
      const over = gap > envG + 2;
      if (sec.mirrored) { tot.mir++; if (over) { tot.mirOver++; byTpl.set(sec.template, (byTpl.get(sec.template) ?? 0) + 1); const single = reachJump(rise, false); if (!dbl && (single < 0 || gap > single * 0.97 - 70)) tot.mirPastSingle++; if (ex.length < 10) ex.push(`${id} roll ${v} (seed ${E.seeds[v].seed}) ${d} ${sec.template}/${a.key} x ${Math.round(a.x0)}: mirrored, a ${dbl ? 'double' : 'single'} laid as rise ${Math.round(rise)} gap ${Math.round(gap)}; the envelope at that rise is ${Math.round(env)} (margin ${budget.margin})`); } }
      else { tot.plain++; if (over) { tot.plainOver++; if (ex.length < 10) ex.push(`NOT mirrored: ${id} roll ${v} ${d} ${sec.template}/${a.key}: rise ${Math.round(rise)} gap ${Math.round(gap)} env ${Math.round(envG)}`); } }
    }
  }
}
console.log(JSON.stringify(tot));
console.log(JSON.stringify([...byTpl].sort((a, b) => b[1] - a[1]).slice(0, 12)));
console.log(ex.join('\n'));
