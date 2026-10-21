// Measures the generated stages against the owner's targets and prints markdown tables.
//   node --import tsx scripts/measure-stages.ts [variantsPerStage=4] [out.json] [worlds=1,2,...,10]
// The sample is the designed layout of every non-boss stage plus N random layouts each (variant numbers drawn from a fixed seed).
import { writeFileSync } from 'node:fs';
import { generateAllLevels } from '../src/game/worldsData.ts';
import { generateStage, setLayoutVariant } from '../src/game/stageGenerator.ts';
import { validateStage } from '../src/game/levelCheck.ts';
import { measureStage, type StageMetrics } from '../src/game/stageMetrics.ts';
import { MODEL_FAST, MODEL_TYPICAL, modelStage } from '../src/game/stageTime.ts';

const N = Number(process.argv[2] ?? 4);
const OUT = process.argv[3];
const WORLDS = (process.argv[4] ?? '1,2,3,4,5,6,7,8,9,10').split(',').map(Number);

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const variantsFor = (id: string, n: number): number[] => {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) { h ^= id.charCodeAt(i); h = Math.imul(h, 16777619); }
  const r = mulberry32((h >>> 0) ^ 20261021);
  const out: number[] = [];
  while (out.length < n) { const v = Math.floor(r() * 1_000_000) + 1; if (!out.includes(v)) out.push(v); }
  return out;
};

interface Rec extends StageMetrics {
  world: number; mini: number; type: string; variant: number | null; genMs: number; valid: boolean;
  typical: number; fast: number; forks: number; forkDeltas: number[]; enemies: number; pickups: number;
}

const q = (xs: number[], p: number) => { const v = [...xs].sort((a, b) => a - b); if (!v.length) return NaN; const i = (v.length - 1) * p; const lo = Math.floor(i), hi = Math.ceil(i); return v[lo] + (v[hi] - v[lo]) * (i - lo); };
const f0 = (x: number) => (Number.isFinite(x) ? Math.round(x).toString() : '-');
const f2 = (x: number) => (Number.isFinite(x) ? x.toFixed(2) : '-');
const pct = (x: number) => (Number.isFinite(x) ? (100 * x).toFixed(0) + '%' : '-');

const recs: Rec[] = [];
for (const l of generateAllLevels()) {
  if (l.objectiveType === 'boss_lair' || !WORLDS.includes(l.worldIndex)) continue;
  for (const variant of [null, ...variantsFor(l.id, N)]) {
    setLayoutVariant(variant);
    const t0 = performance.now();
    const s = generateStage(l);
    const genMs = performance.now() - t0;
    const m = measureStage(s);
    const ty = modelStage(s, MODEL_TYPICAL);
    const fa = modelStage(s, MODEL_FAST);
    recs.push({
      ...m, world: l.worldIndex, mini: l.miniIndex, type: l.objectiveType, variant, genMs, valid: validateStage(s).ok,
      typical: ty.total, fast: fa.total, forks: (s.lanes ?? []).length, forkDeltas: ty.forks.map((f) => f.delta),
      enemies: s.enemies.length, pickups: s.collectibles.length,
    });
  }
}
setLayoutVariant(null);
if (OUT) writeFileSync(OUT, JSON.stringify(recs));

const lines: string[] = [];
const table = (head: string[], rows: string[][]) => {
  lines.push('| ' + head.join(' | ') + ' |', '|' + head.map(() => '---').join('|') + '|');
  for (const r of rows) lines.push('| ' + r.join(' | ') + ' |');
  lines.push('');
};
const hor = recs.filter((r) => r.type !== 'ascent');
lines.push(`Sample: ${recs.length} stages (${hor.length} horizontal, ${recs.length - hor.length} ascents), ${N} random layouts + the designed one per stage.`, '');
lines.push('### Modelled time per world (typical / fast, seconds)', '');
table(['world', 'n', 'typ min', 'typ median', 'typ p90', 'typ max', 'typ >= 125', 'fast min', 'fast >= 95', 'width median'], WORLDS.map((w) => {
  const r = recs.filter((x) => x.world === w);
  return [String(w), String(r.length), f0(Math.min(...r.map((x) => x.typical))), f0(q(r.map((x) => x.typical), 0.5)), f0(q(r.map((x) => x.typical), 0.9)), f0(Math.max(...r.map((x) => x.typical))),
    pct(r.filter((x) => x.typical >= 125).length / r.length), f0(Math.min(...r.map((x) => x.fast))), pct(r.filter((x) => x.fast >= 95).length / r.length), f0(q(hor.filter((x) => x.world === w).map((x) => x.width), 0.5))];
}));
const types = [...new Set(recs.map((r) => r.type))];
lines.push('### By stage type', '');
table(['type', 'n', 'typ median', 'typ min', 'kinds median', 'kinds min', 'plain (audit def.) median', 'plain relief-aware median', 'longest free interior p90', 'max', 'same-kind run max', 'kind share max'], types.map((t) => {
  const r = recs.filter((x) => x.type === t);
  return [t, String(r.length), f0(q(r.map((x) => x.typical), 0.5)), f0(Math.min(...r.map((x) => x.typical))), f0(q(r.map((x) => x.distinctKinds), 0.5)), f0(Math.min(...r.map((x) => x.distinctKinds))),
    pct(q(r.map((x) => x.plainShare), 0.5)), pct(q(r.map((x) => x.plainShareRelief), 0.5)), f0(q(r.map((x) => x.freeInterior), 0.9)), f0(Math.max(...r.map((x) => x.freeInterior))), String(Math.max(...r.map((x) => x.longestSameRun))), pct(Math.max(...r.map((x) => x.maxKindShare)))];
}));
const hf = hor;
lines.push('### Acceptance numbers (horizontal stages unless noted)', '');
const flagGaps = hf.flatMap((r) => r.flagGaps);
table(['measure', 'value'], [
  ['stages valid', `${recs.filter((r) => r.valid).length} / ${recs.length}`],
  ['typical >= 125 s', `${recs.filter((r) => r.typical >= 125).length} / ${recs.length}`],
  ['fast >= 95 s', `${recs.filter((r) => r.fast >= 95).length} / ${recs.length}`],
  ['W10 typical median / max', `${f0(q(recs.filter((r) => r.world === 10).map((r) => r.typical), 0.5))} / ${f0(Math.max(...recs.filter((r) => r.world === 10).map((r) => r.typical)))}`],
  ['longest hazard-free interior p90 / max (px)', `${f0(q(hf.map((r) => r.freeInterior), 0.9))} / ${f0(Math.max(...hf.map((r) => r.freeInterior)))}`],
  ['longest hazard-free opening max (px)', f0(Math.max(...hf.map((r) => r.freeStart)))],
  ['stages with < 9 distinct kinds', String(hf.filter((r) => r.distinctKinds < 9).length)],
  ['stages with two same kinds in a row', String(hf.filter((r) => r.longestSameRun > 1).length)],
  ['stages with a kind > 25% of the length', String(hf.filter((r) => r.maxKindShare > 0.25).length)],
  ['purge/gauntlet with plain ground >= 45% (audit def.)', String(hf.filter((r) => (r.type === 'purge' || r.type === 'gauntlet') && r.plainShare >= 0.45).length) + ` / ${hf.filter((r) => r.type === 'purge' || r.type === 'gauntlet').length}`],
  ['take-offs within 120 px of a patrol', String(hf.reduce((a, r) => a + r.takeoffsNearEnemy, 0))],
  ['landings within 120 px of a patrol', String(hf.reduce((a, r) => a + r.landingsNearEnemy, 0))],
  ['stages with > 2 landings < 64 px', String(hf.filter((r) => r.narrowLandings > 2).length)],
  ['flag-to-flag min / p90 / max (px)', `${f0(Math.min(...flagGaps))} / ${f0(q(flagGaps, 0.9))} / ${f0(Math.max(...flagGaps))}`],
  ['first flag < 700 px', String(hf.filter((r) => r.firstFlag < 700).length)],
  ['stages with < 4 platform styles', String(hf.filter((r) => r.styleDistinct < 4).length)],
  ['stages with a style > 40% of thin platforms', String(hf.filter((r) => r.maxStyleShare > 0.4).length)],
  ['stages with forks (1 / 2 / 3)', [1, 2, 3].map((n) => hf.filter((r) => r.forks === n).length).join(' / ')],
  ['fork time difference min (s)', f2(Math.min(...hf.flatMap((r) => r.forkDeltas)))],
  ['generation ms: median / p90 / max', `${f0(q(recs.map((r) => r.genMs), 0.5))} / ${f0(q(recs.map((r) => r.genMs), 0.9))} / ${f0(Math.max(...recs.map((r) => r.genMs)))}`],
  ['enemy types spawned', [...new Set(recs.flatMap((r) => r.enemyTypes))].sort().join(', ')],
]);
console.log(lines.join('\n'));
