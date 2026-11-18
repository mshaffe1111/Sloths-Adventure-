// The vault off every climbing vine's top, every stage (VARIETY item 0, 11-13): built as the game builds it (N layouts x both settings),
// each vine's straight-up vault with the finder until 11-13 (sampled from 10 px, stopped at the first miss) against vineTop.ts, facing
// either way: fixed / regressed / moved side / no wood either way. A change to vineTop.ts must leave regress and moved at 0.
//   npx tsx tools/engine/vaultscan.ts [layouts]
import '../../src/game/headlessDom.ts';
import { generateAllLevels } from '../../src/game/worldsData.ts';
import { generateStage, setLayoutVariant } from '../../src/game/stageGenerator.ts';
import { easyStage } from '../../src/game/easyMode.ts';
import { withGoals } from '../../src/game/goals.ts';
import { ledgeOut, vaultSide } from '../../src/game/vineTop.ts';
const N = Number(process.argv[2] ?? 16);
function oldReach(v: any, P: any[], dir: number) { let d = 0; while (d < 200) { const x = v.x + dir * (d + 10); if (!P.some((q) => !q.broken && q.type !== 'bouncy' && x >= q.x && x <= q.x + q.width && q.y >= v.topY - 16 && q.y <= v.topY + 30)) break; d += 10; } return d; }
const oldSide = (v: any, P: any[], f: number) => { const l = oldReach(v, P, -1), r = oldReach(v, P, 1); return l === r ? f : r > l ? 1 : -1; };
const tally = { vines: 0, cases: 0, fixed: 0, regress: 0, moved: 0, bothBad: 0 };
const byStage: Record<string, { fixed: number; regress: number; moved: number; bothBad: number; vines: number }> = {};
const examples: string[] = [];
for (const c of generateAllLevels()) {
  for (const setting of ['normal', 'easy'] as const) for (let lv = 1; lv <= N; lv++) {
    setLayoutVariant(lv);
    let st: any;
    try { st = setting === 'easy' ? easyStage(withGoals(generateStage({ ...c, unlocked: true }, 'easy'))) : withGoals(generateStage({ ...c, unlocked: true }, 'normal')); } catch { setLayoutVariant(null); continue; }
    setLayoutVariant(null);
    const P = st.platforms ?? [];
    for (const v of st.vines ?? []) {
      if (v.vineType !== 'tree_climb' || v.off) continue;
      tally.vines++;
      const S = (byStage[c.id] ??= { fixed: 0, regress: 0, moved: 0, bothBad: 0, vines: 0 });
      S.vines++;
      for (const f of [1, -1]) {
        tally.cases++;
        const os = oldSide(v, P, f), ns = vaultSide(v, P, f as 1 | -1);
        // (the old vault LANDS when the side it chose has wood the vault reaches: judge both by the new ledge measure of that side)
        const oLand = ledgeOut(v, P, os as 1 | -1) > 0, nLand = ledgeOut(v, P, ns) > 0;
        if (!oLand && nLand) { tally.fixed++; S.fixed++; }
        else if (oLand && !nLand) { tally.regress++; S.regress++; examples.push(`REGRESS ${c.id} ${setting} ${lv} vine x${v.x} top${v.topY} f${f}`); }
        else if (oLand && nLand && os !== ns) { tally.moved++; S.moved++; if (examples.length < 60) examples.push(`MOVED ${c.id} ${setting} ${lv} vine x${v.x} top${v.topY} f${f}: old ${os} new ${ns} (L${ledgeOut(v, P, -1)} R${ledgeOut(v, P, 1)})`); }
        else if (!oLand && !nLand) { tally.bothBad++; S.bothBad++; if (examples.filter((e) => e.startsWith('BAD')).length < 40) examples.push(`BAD ${c.id} ${setting} ${lv} vine ${v.id} x${v.x} top${v.topY} bot${v.bottomY} f${f}`); }
      }
    }
  }
  process.stderr.write(`${c.id} `);
}
console.log('\n' + JSON.stringify(tally));
for (const [s, t] of Object.entries(byStage)) if (t.fixed || t.regress || t.moved || t.bothBad) console.log(s, JSON.stringify(t));
console.log(examples.join('\n'));
