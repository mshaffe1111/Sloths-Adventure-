// fresh 1-1 seeds: how many lay cleanly on both settings, and why the rest are refused (first error, numbers masked), and which sections the refused rolls held
import '../../../headlessDom.ts';
import { buildGen2Stage } from '../../../gen2/pipeline.ts';
import { w1World } from '../../../gen2/worlds/w1.ts';
import { generateAllLevels } from '../../../worldsData.ts';
const cfg = { ...generateAllLevels().find((l) => l.id === '1-1')!, unlocked: true };
const N = Number(process.argv[2] ?? 120);
let clean = 0, threw = 0; const why = new Map<string, number>(); const secBad = new Map<string, number>(), secAll = new Map<string, number>(); const ex = new Map<string, string>();
const t0 = Date.now();
for (let seed = 50001; seed < 50001 + N; seed++) {
  let st;
  try { st = buildGen2Stage({ config: cfg, kit: w1World(), seed, difficulty: 'easy' }); } catch (e) { threw++; const k = 'THREW: ' + (e as Error).message.replace(/[0-9]+/g, '#').slice(0, 90); why.set(k, (why.get(k) ?? 0) + 1); continue; }
  const errs = st.gen2.errors ?? [];
  for (const p of st.gen2.plan) secAll.set(p.template, (secAll.get(p.template) ?? 0) + 1);
  if (!errs.length) { clean++; continue; }
  const k = errs[0].replace(/\(s[0-9]+\)/g, '').replace(/[0-9.]+/g, '#').slice(0, 110);
  why.set(k, (why.get(k) ?? 0) + 1); if (!ex.has(k)) ex.set(k, `seed ${seed}: ${errs[0].slice(0, 200)}`);
  const m = /\(s(\d+)\)/.exec(errs[0]); const sec = m ? st.gen2.plan[Number(m[1]) - 1]?.template : undefined;
  if (sec) secBad.set(sec, (secBad.get(sec) ?? 0) + 1);
}
console.log(`${N} fresh seeds in ${((Date.now() - t0) / 1000).toFixed(0)} s: clean on both settings ${clean} (${Math.round((100 * clean) / N)}%), threw ${threw}`);
for (const [k, c] of [...why].sort((a, b) => b[1] - a[1]).slice(0, 14)) console.log(`  ${c}x ${k}\n      e.g. ${ex.get(k) ?? ''}`);
console.log('sections named by the first refusal:', JSON.stringify([...secBad].sort((a, b) => b[1] - a[1]).slice(0, 12)));
console.log('never-listed sections, times laid in these rolls:', JSON.stringify(['w1-second-jump', 'w1-stump-stile', 'w1-log-road', 'w1-bough-stepup', 'w1-dropdown-stair', 'w1-knot-bank', 'w1-floor-dash', 'w1-stump-towers', 'w1-canopy-weave', 'w1-stilt-logs', 'w1-bough-log', 'w1-dipping-boughs-twist', 'w1-drop-bounce-twist', 'w1-dip-bounce-twist', 'w1-bounce-bough-combine', 'w1-stair-test-back', 'w1-bank-stair-test-back', 'w1-two-lifts', 'w1-canopy-weave-rise'].map((s) => [s, secAll.get(s) ?? 0])));
