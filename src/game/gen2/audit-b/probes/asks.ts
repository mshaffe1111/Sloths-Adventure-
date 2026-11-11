// every single-jump ask of every proven 1-1 seed, both settings, flown in the real engine: the flick window against bands.md §1's rule
import { writeFileSync } from 'node:fs';
import { flickWindow, type Setting } from '../flight.ts';
import { layStage, missionGraph, planBudget, stagePool } from '../../../gen2/pipeline.ts';
import { buildPlayStage, provenPlan } from '../../../gen2/seedList.ts';
import { PROVEN_SEEDS } from '../../../gen2/provenSeeds.ts';
import { classify } from '../../../gen2/verdicts.ts';
import { TAKEOFF } from '../../../gen2/reach.ts';
import { w1World } from '../../../gen2/worlds/w1.ts';
import { generateAllLevels } from '../../../worldsData.ts';
const cfg = { ...generateAllLevels().find((l) => l.id === '1-1')!, unlocked: true };
const seeds = PROVEN_SEEDS['1-1'].seeds.slice(0, Number(process.argv[2] ?? 200));
const memo = new Map<string, number>();
const win = (s: Setting, rise: number, gap: number, thin: boolean) => { const k = `${s}|${rise}|${gap}|${thin}`; let w = memo.get(k); if (w === undefined) memo.set(k, (w = flickWindow(s, { rise, gap, thin }, 130))); return w; };
const rows: Array<{ seed: number; setting: Setting; x0: number; section: string; tpl: string; key: string; rise: number; gap: number; thin: boolean; kind: string; window: number; mirrored: boolean }> = [];
let mismatch = 0, total = 0;
const kinds: Record<string, number> = {};
for (const seed of seeds) {
  for (const setting of ['normal', 'easy'] as const) {
    const kit0 = w1World();
    const kit = { ...kit0, manifest: { ...kit0.manifest, sections: stagePool(kit0.manifest, '1-1') } };
    const budget = planBudget(cfg, kit.manifest, setting);
    const graph = missionGraph(budget, kit.manifest, seed);
    const r = provenPlan('1-1', seed)!;
    const laid = layStage(budget, graph, kit, r.seed, { plan: r.plan });
    const game = buildPlayStage(cfg, w1World(), seed, setting);
    const gp = game.platforms.filter((p) => p.id < 900000);
    const same = laid.platforms.every((p, i) => gp[i] && gp[i].x === p.x && gp[i].y === p.y && gp[i].width === p.width);
    if (!same) mismatch++;
    for (const a of laid.asks ?? []) {
      const c = classify(a, false, setting);
      kinds[`${setting} ${c.kind}`] = (kinds[`${setting} ${c.kind}`] ?? 0) + 1;
      if (c.kind !== 'single-gap' && c.kind !== 'single-rise') continue;
      total++;
      const rise = Math.round(a.yTake - a.yLand), gap = Math.round(a.x1 - a.x0);
      const sec = laid.sections.find((q) => q.uid === a.section)!;
      rows.push({ seed, setting, x0: Math.round(a.x0), section: a.section, tpl: sec.template, key: a.key, rise, gap, thin: a.thin, kind: c.kind, window: win(setting, rise, gap, a.thin), mirrored: sec.mirrored });
    }
  }
}
writeFileSync((process.env.TMPDIR ?? '/tmp') + '/audit-b-asks.json', JSON.stringify(rows));
console.log('seeds', seeds.length, 'lay mismatches vs the game', mismatch, 'single asks', total, 'unique flights', memo.size);
console.log('kinds', JSON.stringify(kinds));
for (const s of ['normal', 'easy'] as const) {
  const R = rows.filter((q) => q.setting === s);
  const under = R.filter((q) => q.window < TAKEOFF[s]);
  const none = R.filter((q) => q.window < 0);
  const fair = R.filter((q) => q.window >= 0 && q.window < (s === 'normal' ? 47.6 : 85.5));
  console.log(`${s}: ${R.length} single asks; window under the band rule (${TAKEOFF[s]} px): ${under.length} on ${new Set(under.map((q) => q.seed)).size} seeds; no flick lands at all: ${none.length} on ${new Set(none.map((q) => q.seed)).size} seeds; under STAGE-RULES 1b's ${s === 'normal' ? '167 ms' : '300 ms'}: ${fair.length}`);
  const by = new Map<string, number[]>();
  for (const q of under) by.set(`${q.tpl}/${q.key}`, [...(by.get(`${q.tpl}/${q.key}`) ?? []), q.window]);
  console.log([...by].sort((a, b) => b[1].length - a[1].length).slice(0, 12).map(([k, v]) => `  ${k}: ${v.length} (worst ${Math.min(...v)})`).join('\n'));
  console.log('  worst 8:', JSON.stringify(under.sort((a, b) => a.window - b.window).slice(0, 8).map((q) => ({ seed: q.seed, x: q.x0, tpl: q.tpl, key: q.key, rise: q.rise, gap: q.gap, thin: q.thin, w: q.window, m: q.mirrored }))));
}
