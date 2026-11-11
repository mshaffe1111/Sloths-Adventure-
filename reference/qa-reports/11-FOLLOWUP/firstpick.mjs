import fs from 'node:fs';
const [file, listFile] = process.argv.slice(2);
const runs = fs.readFileSync(file, 'utf8').split('\n').filter((l) => l.startsWith('{"tier"')).map((l) => JSON.parse(l));
const t = fs.readFileSync(listFile, 'utf8'); const seeds = JSON.parse(t.slice(t.indexOf('= {') + 2, t.lastIndexOf('}') + 1))['1-1'].seeds;
const by = new Map();
for (const r of runs) {
  if (r.tier !== 'child' && r.tier !== 'middle') continue;
  let t0 = 0, early = 0;
  for (const p of r.pieces) { if (t0 < 120) early += (p.putbacks ?? 0) + (p.lives ?? 0); t0 += p.seconds; }
  const v = by.get(r.variant) ?? { early: 0, whole: 0, rescues: 0, n: 0 };
  v.early += early; v.whole += (r.putbacks ?? 0) + (r.lives ?? 0); v.rescues += r.rescues ?? 0; v.n++;
  by.set(r.variant, v);
}
const rows = [...by].sort((a, b) => a[0] - b[0]).map(([v, x]) => ({ variant: v, seed: seeds[v - 1], ...x }));
const zero = rows.filter((r) => r.early === 0);
console.log('early 0:', zero.map((r) => `v${r.variant}/${r.seed} whole ${r.whole} rescues ${r.rescues} runs ${r.n}`).join('; '));
const pick = zero.filter((r) => r.whole === 0 && r.rescues === 0)[0] ?? null;
console.log('pick (early 0, whole 0, no rescue, lowest variant):', JSON.stringify(pick));
